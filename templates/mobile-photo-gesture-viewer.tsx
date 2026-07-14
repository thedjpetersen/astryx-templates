// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Saltline photo journal's
 *   'Sea Ranch Weekend' album frozen at Jul 3–5, 2026: 12 photos (id,
 *   2-letter monogram, caption, day, capture time, art hue + sun-disc
 *   position for the composed gradient — no network media), 2 pre-seeded
 *   favorites (Kelp line, Golden hour), and a 4-row album-details fixture
 *   (dates / location / camera 'Meridian M6 · 35mm' / size). No
 *   Date.now(), no Math.random(); the only timers are the toast
 *   auto-dismiss and FLIP transition fallbacks, both cleaned up.
 * @output Saltline — Photo Gesture Viewer: a 390px MOBILE 3×4 photo grid
 *   whose tiles expand into a full-stage immersive viewer via a
 *   FLIP-style shared-element move (measure tile rect → position a clone
 *   at the letterboxed stage rect → animate the inverse transform to
 *   identity, transform/opacity only), then reveal viewer chrome: a 52px
 *   top bar (44×44 close, 'n of 12' tabular counter, favorite + zoom
 *   buttons), a 48px caption bar flanked by 44×44 prev/next chevrons,
 *   and a 64px filmstrip whose active-thumb underline slides via
 *   transform. In the viewer: horizontal pointer-drag pages with snap +
 *   12px neighbor peek and edge resistance; double-tap toggles 2× zoom
 *   centered on the tap point (origin-0 translate/scale math); when
 *   zoomed, pointer-drag pans with clamped bounds and a rubber-band
 *   overscroll that springs back on release; swipe DOWN when unzoomed
 *   drags the photo with scale falloff and backdrop/chrome opacity
 *   falloff — past 120px it dismisses via the reverse FLIP back into its
 *   CURRENT grid tile, below threshold it springs back. Every gesture
 *   commits through the same state updates as its button path (chevrons/
 *   filmstrip = paging, zoom toggle = double-tap, close = swipe-down); a
 *   polite live region announces photo + zoom changes and the toast dock
 *   announces favorite toggles.
 * @position Page template; emitted by `astryx template mobile-photo-gesture-viewer`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the 52px
 *   sticky navBar at y=0 is the first pixel). The viewer, its clone, and
 *   the scrim-dark backdrop are position:'absolute' INSIDE shell;
 *   position:fixed is banned. While the viewer is open (all phases) the
 *   shell locks to {height:'100dvh', overflow:'hidden'} and restores on
 *   close; FLIP rects are measured in a layout effect AFTER the lock so
 *   the clone always starts on the tile's on-screen position, and the
 *   dismissed tile is scrollIntoView'd on close so the reverse FLIP's
 *   landing spot stays honest. ONE polite toast dock: sticky bottom:16
 *   in flow normally; while the shell is scroll-locked it rides
 *   shell-absolute at bottom:128 (above the filmstrip) per the
 *   foundations amendment. One toast at a time; a new toast REPLACES the
 *   old (2.6s auto-dismiss timer, cleaned up, plus a dismiss button).
 *
 * Motion contract (batch 3): transform + opacity ONLY. FLIP open/close =
 *   clone translate+scale with cubic-bezier(0.22, 1, 0.36, 1); dismiss
 *   spring-back and the filmstrip underline use cubic-bezier(0.34, 1.56,
 *   0.64, 1) overshoot; paging snap 320ms decelerate. Gesture physics
 *   are pointer events with setPointerCapture driving inline transforms
 *   during drag, then transition-based settles on release — no physics
 *   libraries. Reduced motion (matchMedia via the core useMediaQuery
 *   hook, which subscribes to changes): FLIP becomes a 160ms opacity
 *   crossfade (pgv-rm-fade — the one animation the reduce block spares),
 *   zoom toggles instantly, paging snaps without transition, and the
 *   rubber-band becomes a hard clamp.
 *
 * Color policy: token-pure chrome on the grid screen. ONE quarantined
 *   brand literal BRAND_ACCENT = light-dark(#0F766E, #5EEAD4) — white
 *   13px text on #0F766E ≈ 4.8:1; #04211E text on #5EEAD4 ≈ 12.5:1; as a
 *   bare fill vs the white card ≈ 4.8:1 and vs the ~#1C1C1E dark card
 *   ≈ 10.9:1, both ≥3:1. Sanctioned non-brand literals (math at each
 *   declaration): the immersive viewer stage is a photo-app dark room in
 *   BOTH schemes, so its backdrop (#0B0B0D) and light-on-dark chrome
 *   (#F5F5F7 ≈ 17.4:1) are fixed literals; tile caption chips sit on a
 *   0.62-alpha dark scrim (white 11px text ≥ 7:1 over the lightest
 *   gradient stop); fixture art = hue-gradient compositions with white
 *   monograms ≥ 4.6:1 (the catalog gallery recipe). Never
 *   var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px
 *   section gaps · 8px chip gaps; navBar 52px sticky top z20 with
 *   hairline; the photo grid deliberately uses the 8px chip-gap tier
 *   between tiles (photo-grid idiom) inside the 16px inset; album
 *   details = inset-grouped listCard (12px radius, 1px border, hairline
 *   dividers). TYPE: 28/700 album title · 17/600 nav title · 16/600
 *   viewer caption · 13/400 meta · 11/600 chips; tabular-nums on every
 *   count. Touch law: every interactive target ≥44×44 (tiles ~114px,
 *   all viewer buttons 44×44, filmstrip thumbs 44×64).
 *
 * Responsive contract:
 * - Fluid 320–430: tiles = (width − 32 − 16)/3 (≈114 at 390, ≈90 at
 *   320 — still ≥44); the viewer photo box = min(shellW − 48, stage
 *   height − 16) so it letterboxes on any aspect; caption text
 *   ellipsizes while the chevrons and counter never shrink; the
 *   filmstrip scrolls horizontally (12 × 44 = 528 > 390) and keeps the
 *   active thumb in view. overflowX:'clip' backstop.
 * - Desktop stage (~1045px): useElementWidth on the wrapper (container
 *   width, not viewport — the demo stage quirk) ≥720px renders the
 *   standard centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline) on a --color-background-muted backdrop. No
 *   adaptive relayout; the gesture anatomy is deliberately phone
 *   geometry.
 */

import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  ApertureIcon,
  CalendarIcon,
  CameraIcon,
  CaptionsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HardDriveIcon,
  HeartIcon,
  MapPinIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, math at each declaration.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Saltline teal). White 13px/600 text on
// #0F766E ≈ 4.8:1; #04211E on #5EEAD4 ≈ 12.5:1. As a bare fill: vs the
// white card ≈ 4.8:1, vs the ~#1C1C1E dark card ≈ 10.9:1 — both ≥3:1.
const BRAND_ACCENT = 'light-dark(#0F766E, #5EEAD4)';

// IMMERSIVE VIEWER LITERALS — the viewer is a photo-app dark room in BOTH
// schemes (single-scheme immersive stage, sanctioned like a scrim):
// backdrop #0B0B0D; chrome text #F5F5F7 on it ≈ 17.4:1; dim meta at 0.64
// alpha ≈ 10.4:1; button seats are 0.14-alpha white washes whose glyphs
// stay #F5F5F7; hairlines 0.22-alpha white (non-semantic separators).
const VIEWER_BG = '#0B0B0D';
const VIEWER_TEXT = '#F5F5F7';
const VIEWER_TEXT_DIM = 'rgba(245, 245, 247, 0.64)';
const VIEWER_SEAT = 'rgba(255, 255, 255, 0.14)';
const VIEWER_HAIRLINE = 'rgba(255, 255, 255, 0.22)';

// Tile caption chips — white 11px/600 text on a 0.62-alpha #08080A scrim;
// over the lightest gradient stop (hsl(h 45% 40%)) the effective surface
// is ≈ 15% luminance ⇒ contrast ≥ 7:1 in both schemes.
const CHIP_SCRIM = 'rgba(8, 8, 10, 0.62)';

// Art monograms — white on the 40%/26%-lightness gradient stops ≈ 4.6:1+
// (same recipe as the frozen catalog galleries; reads as art, not chrome).
const ART_TEXT = '#FFFFFF';

// ---------------------------------------------------------------------------
// INJECTED CSS — pgv- prefix. Button reset, focus rings, visually-hidden,
// tile press, chrome/toast entries, underline slide. The reduced-motion
// block kills every animation/transition EXCEPT pgv-rm-fade — the
// sanctioned opacity-only crossfade that replaces the FLIP.
// ---------------------------------------------------------------------------

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

const PGV_CSS = `
.pgv-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.pgv-btn:disabled { cursor: default; }
.pgv-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.pgv-viewer-root:focus-visible { outline: none; }
.pgv-viewer-root .pgv-focusable:focus-visible {
  outline: 2px solid ${VIEWER_TEXT};
  outline-offset: 2px;
}
.pgv-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.pgv-tile { transition: transform 160ms ${EASE_OUT}; }
.pgv-tile:active { transform: scale(0.96); }
@keyframes pgv-chrome-in {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.pgv-chrome-in { animation: pgv-chrome-in 260ms ${EASE_OUT} both; }
@keyframes pgv-toast-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.pgv-toast-in { animation: pgv-toast-in 200ms ${EASE_OUT}; }
.pgv-underline { transition: transform 280ms ${EASE_SPRING}; }
@keyframes pgv-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.pgv-rm-fade { animation: pgv-fade-in 160ms ease both; }
@media (prefers-reduced-motion: reduce) {
  .pgv-tile, .pgv-underline { transition: none; }
  .pgv-chrome-in, .pgv-toast-in { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  wrapDesktop: {background: 'var(--color-background-muted)'},
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
  // NAV BAR — 52px sticky top z20 with hairline.
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
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 220,
  },
  brandSeat: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_ACCENT,
  },
  navIconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  navIconBtnOn: {color: BRAND_ACCENT},
  // ALBUM HEADER — 28/700 large title + 13px meta.
  albumHeader: {padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 4},
  albumTitle: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.15},
  albumMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // PHOTO GRID — 3 columns, 8px chip-gap tier inside the 16px inset.
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    padding: 16,
  },
  tile: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: 12,
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
    minWidth: 0,
  },
  tileMono: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: ART_TEXT,
    opacity: 0.9,
  },
  tileChip: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    maxWidth: 'calc(100% - 12px)',
    paddingInline: 7,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 999,
    background: CHIP_SCRIM,
    color: VIEWER_TEXT,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tileFav: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 999,
    background: CHIP_SCRIM,
    display: 'grid',
    placeItems: 'center',
    color: VIEWER_TEXT,
  },
  // ALBUM DETAILS — inset-grouped listCard.
  sectionHeader: {
    margin: '8px 0 8px',
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  utilityRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
  },
  utilityIcon: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  utilityLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  utilityValue: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 42},
  footerCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '16px 0 24px',
    fontVariantNumeric: 'tabular-nums',
  },
  // VIEWER — absolute inset 0 inside the locked shell, z40.
  viewer: {position: 'absolute', inset: 0, zIndex: 40},
  backdrop: {position: 'absolute', inset: 0, background: VIEWER_BG},
  stage: {
    position: 'absolute',
    top: 52,
    bottom: 112,
    left: 0,
    right: 0,
    overflow: 'hidden',
    touchAction: 'none',
    zIndex: 1,
  },
  track: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  photoBox: {
    flexShrink: 0,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoArt: {
    width: '100%',
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    transformOrigin: '0 0',
  },
  photoMono: {
    fontSize: 44,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: ART_TEXT,
    opacity: 0.9,
  },
  // Viewer chrome — top bar 52, caption bar 48, filmstrip 64.
  viewerTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    display: 'grid',
    gridTemplateColumns: '44px 1fr auto',
    alignItems: 'center',
    paddingInline: 8,
    zIndex: 2,
  },
  viewerCounter: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: VIEWER_TEXT,
    fontVariantNumeric: 'tabular-nums',
  },
  viewerBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: VIEWER_TEXT,
  },
  viewerBtnSeat: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: VIEWER_SEAT,
    display: 'grid',
    placeItems: 'center',
  },
  viewerBtnRow: {display: 'flex', justifyContent: 'flex-end'},
  bottomChrome: {position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2},
  captionBar: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 4,
    gap: 4,
  },
  captionBlock: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  captionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: VIEWER_TEXT,
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.2,
  },
  captionMeta: {
    fontSize: 12,
    color: VIEWER_TEXT_DIM,
    fontVariantNumeric: 'tabular-nums',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  filmstrip: {
    height: 64,
    overflowX: 'auto',
    overflowY: 'hidden',
    borderTop: `1px solid ${VIEWER_HAIRLINE}`,
  },
  filmstripInner: {position: 'relative', display: 'flex', width: 'max-content', height: '100%'},
  thumbBtn: {
    width: 44,
    height: 64,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  thumbArt: {
    width: 34,
    height: 34,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: ART_TEXT,
  },
  thumbUnderline: {
    position: 'absolute',
    left: 0,
    bottom: 7,
    width: 24,
    height: 3,
    borderRadius: 999,
    background: VIEWER_TEXT,
  },
  clone: {position: 'absolute', zIndex: 3, borderRadius: 12, overflow: 'hidden'},
  cloneArt: {width: '100%', height: '100%', display: 'grid', placeItems: 'center'},
  // TOAST — the single polite dock. Sticky-in-flow normally; shell-
  // absolute only while the shell is scroll-locked (viewer open).
  dockSticky: {position: 'sticky', bottom: 0, zIndex: 30, height: 0},
  toastRegion: {
    position: 'absolute',
    bottom: 16,
    insetInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastRegionLocked: {
    position: 'absolute',
    bottom: 128,
    insetInline: 16,
    zIndex: 60,
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
    paddingInline: 4,
  },
};

// ---------------------------------------------------------------------------
// DATA — 12 photos, Jul 3–5, 2026. Art = layered hue gradient + off-center
// sun disc (positions avoid the centered monogram) + monogram.
// ---------------------------------------------------------------------------

interface PhotoFixture {
  id: string;
  mono: string;
  caption: string;
  day: string;
  time: string;
  hue: number;
  sunX: number; // sun-disc % position — kept off the centered monogram
  sunY: number;
}

const PHOTOS: PhotoFixture[] = [
  {id: 'dune', mono: 'DT', caption: 'Dune trail', day: 'Fri, Jul 3', time: '7:12 AM', hue: 36, sunX: 74, sunY: 22},
  {id: 'lowtide', mono: 'LT', caption: 'Low tide', day: 'Fri, Jul 3', time: '8:05 AM', hue: 196, sunX: 24, sunY: 26},
  {id: 'kelp', mono: 'KL', caption: 'Kelp line', day: 'Fri, Jul 3', time: '9:41 AM', hue: 152, sunX: 70, sunY: 72},
  {id: 'bluff', mono: 'BH', caption: 'Bluff house', day: 'Fri, Jul 3', time: '11:20 AM', hue: 20, sunX: 26, sunY: 70},
  {id: 'tidepool', mono: 'TP', caption: 'Tide pools', day: 'Sat, Jul 4', time: '1:02 PM', hue: 176, sunX: 76, sunY: 24},
  {id: 'gull', mono: 'GP', caption: 'Gull pass', day: 'Sat, Jul 4', time: '2:38 PM', hue: 208, sunX: 22, sunY: 24},
  {id: 'seastack', mono: 'SS', caption: 'Sea stack', day: 'Sat, Jul 4', time: '4:15 PM', hue: 248, sunX: 72, sunY: 74},
  {id: 'driftwood', mono: 'DF', caption: 'Driftwood fort', day: 'Sat, Jul 4', time: '5:47 PM', hue: 12, sunX: 28, sunY: 74},
  {id: 'golden', mono: 'GH', caption: 'Golden hour', day: 'Sat, Jul 4', time: '7:58 PM', hue: 44, sunX: 74, sunY: 26},
  {id: 'bonfire', mono: 'BF', caption: 'Bonfire', day: 'Sat, Jul 4', time: '9:12 PM', hue: 4, sunX: 24, sunY: 28},
  {id: 'moonrise', mono: 'MR', caption: 'Moonrise', day: 'Sun, Jul 5', time: '10:26 PM', hue: 268, sunX: 74, sunY: 70},
  {id: 'ferry', mono: 'LF', caption: 'Last ferry', day: 'Sun, Jul 5', time: '11:03 PM', hue: 224, sunX: 26, sunY: 72},
];

const PHOTO_COUNT = PHOTOS.length; // 12

// White monogram on the 40%/26%-lightness stops ≈ 4.6:1+ (both schemes —
// it reads as photo art, not chrome). The 62%-lightness sun disc is
// positioned off the monogram (fixture sunX/sunY avoid the center).
function art(photo: PhotoFixture): string {
  const {hue, sunX, sunY} = photo;
  return (
    `radial-gradient(circle at ${sunX}% ${sunY}%, hsl(${(hue + 70) % 360} 62% 62%) 0 13%, transparent 14%), ` +
    `linear-gradient(135deg, hsl(${hue} 45% 40%), hsl(${(hue + 40) % 360} 55% 26%))`
  );
}

const ALBUM_DETAILS: Array<{id: string; icon: typeof CalendarIcon; label: string; value: string}> = [
  {id: 'dates', icon: CalendarIcon, label: 'Dates', value: 'Jul 3 – 5, 2026'},
  {id: 'place', icon: MapPinIcon, label: 'Location', value: 'Sea Ranch, CA'},
  {id: 'camera', icon: CameraIcon, label: 'Camera', value: 'Meridian M6 · 35mm'},
  {id: 'size', icon: HardDriveIcon, label: 'Size', value: '12 photos · 84.2 MB'},
];

// ---------------------------------------------------------------------------
// GEOMETRY + GESTURE CONSTANTS
// ---------------------------------------------------------------------------

const VIEWER_TOP = 52; // viewer top bar
const VIEWER_BOTTOM = 112; // caption bar 48 + filmstrip 64
const SLIDE_GAP = 12; // ⇒ 12px neighbor peek inside the 24px stage margin
const ZOOM_SCALE = 2;
const DISMISS_THRESHOLD = 120;
const PAGE_FLICK_VELOCITY = 0.5; // px/ms
const THUMB_SLOT = 44;

interface Rect {
  l: number;
  t: number;
  w: number;
  h: number;
}

type Phase = 'opening' | 'open' | 'closing';

interface ViewerState {
  index: number;
  phase: Phase;
}

interface FlipState {
  photoIndex: number;
  box: Rect; // final layout rect (shell coords)
  from: string; // inverse transform mapping box → source rect
  armed: boolean; // true once the transition to identity has started
}

type DragState = {mode: 'page'; x: number} | {mode: 'dismiss'; y: number};

interface GestureRef {
  pointerId: number;
  x0: number;
  y0: number;
  mode: 'idle' | 'page' | 'dismiss' | 'pan' | 'none';
  tx0: number;
  ty0: number;
  lastX: number;
  lastT: number;
  vx: number;
}

function relRect(el: HTMLElement, shell: HTMLElement): Rect {
  const a = el.getBoundingClientRect();
  const s = shell.getBoundingClientRect();
  return {l: a.left - s.left, t: a.top - s.top, w: a.width, h: a.height};
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

/** Rubber-band overflow: inside bounds → identity; beyond → 0.3 damping. */
function rubber(value: number, lo: number, hi: number, hard: boolean): number {
  if (hard) return clamp(value, lo, hi);
  if (value < lo) return lo + (value - lo) * 0.3;
  if (value > hi) return hi + (value - hi) * 0.3;
  return value;
}

/** Container-width hook — the demo's inline stage is ~1045px inside a
 * 1440px window, so only a ResizeObserver can tell the stages apart. */
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
// PAGE
// ---------------------------------------------------------------------------

export default function MobilePhotoGestureViewerTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  // matchMedia with a change subscription lives inside this core hook.
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [geom, setGeom] = useState<{w: number; h: number} | null>(null);
  const [flip, setFlip] = useState<FlipState | null>(null);
  const [backdropOn, setBackdropOn] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [zoom, setZoom] = useState<{tx: number; ty: number} | null>(null);
  const [panning, setPanning] = useState(false);
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(
    () => new Set(['kelp', 'golden']),
  );
  const [captionsOn, setCaptionsOn] = useState(true);
  const [toast, setToast] = useState<{seq: number; text: string} | null>(null);
  const [announce, setAnnounce] = useState('');

  const shellRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const activePhotoRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const gestureRef = useRef<GestureRef | null>(null);
  const lastTapRef = useRef<{t: number; x: number; y: number} | null>(null);

  // DERIVED viewer geometry — photo box is a letterboxed square between
  // the 52px top bar and the 112px bottom chrome.
  const stageH = geom != null ? geom.h - VIEWER_TOP - VIEWER_BOTTOM : 0;
  const photoSize = geom != null ? Math.max(120, Math.min(geom.w - 48, stageH - 16)) : 0;
  const slideStep = photoSize + SLIDE_GAP;
  const index = viewer?.index ?? 0;
  const activePhoto = PHOTOS[index];
  const trackBaseX = geom != null ? (geom.w - photoSize) / 2 - index * slideStep : 0;
  const dragX = drag?.mode === 'page' ? drag.x : 0;
  const dismissY = drag?.mode === 'dismiss' ? drag.y : 0;
  const chromeOpacity = 1 - Math.min(dismissY / 240, 0.8);
  const backdropOpacity = backdropOn ? 1 - Math.min(dismissY / 400, 0.6) : 0;

  // VERBS -----------------------------------------------------------------

  const openViewer = (photoIndex: number) => {
    lastTapRef.current = null;
    setZoom(null);
    setDrag(null);
    if (reducedMotion) {
      // FLIP → crossfade (pgv-rm-fade on the viewer root).
      setBackdropOn(true);
      setViewer({index: photoIndex, phase: 'open'});
    } else {
      setViewer({index: photoIndex, phase: 'opening'});
    }
    setAnnounce(`Photo ${photoIndex + 1} of ${PHOTO_COUNT} — ${PHOTOS[photoIndex].caption}`);
  };

  const finishClose = (closedIndex: number) => {
    setViewer(null);
    setFlip(null);
    setGeom(null);
    setBackdropOn(false);
    setZoom(null);
    setDrag(null);
    requestAnimationFrame(() => {
      const tile = tileRefs.current[closedIndex];
      tile?.scrollIntoView({block: 'nearest'});
      tile?.focus({preventScroll: true});
    });
  };

  /** Close — the swipe-down gesture and the 44×44 close button both land
   * here (same state update = the mandatory button path). */
  const requestClose = () => {
    if (viewer == null || viewer.phase === 'closing') return;
    const shell = shellRef.current;
    const photoEl = activePhotoRef.current;
    const tileEl = tileRefs.current[viewer.index];
    if (reducedMotion || shell == null || photoEl == null || tileEl == null) {
      finishClose(viewer.index);
      return;
    }
    // Reverse FLIP: clone laid out at the tile rect, starting from the
    // photo's CURRENT (possibly drag-transformed) rect.
    const from = relRect(photoEl, shell);
    const to = relRect(tileEl, shell);
    setViewer({index: viewer.index, phase: 'closing'});
    setZoom(null);
    setDrag(null);
    setBackdropOn(false);
    setFlip({
      photoIndex: viewer.index,
      box: to,
      from: `translate(${from.l - to.l}px, ${from.t - to.t}px) scale(${from.w / to.w})`,
      armed: false,
    });
  };

  /** Paging — swipe release, chevrons, filmstrip thumbs, and arrow keys
   * all commit through this one update. */
  const goTo = (nextIndex: number) => {
    const bounded = clamp(nextIndex, 0, PHOTO_COUNT - 1);
    setZoom(null);
    setDrag(null);
    setViewer(prev => (prev == null || prev.index === bounded ? prev : {...prev, index: bounded}));
    setAnnounce(`Photo ${bounded + 1} of ${PHOTO_COUNT} — ${PHOTOS[bounded].caption}`);
  };

  /** Zoom — double-tap and the 44×44 zoom button share this update. */
  const setZoomAt = (localX: number, localY: number) => {
    // transform-origin 0 0: point p stays put when tx = p·(1 − s).
    const lo = photoSize * (1 - ZOOM_SCALE); // = −photoSize at 2×
    setZoom({
      tx: clamp(localX * (1 - ZOOM_SCALE), lo, 0),
      ty: clamp(localY * (1 - ZOOM_SCALE), lo, 0),
    });
    setAnnounce('Zoomed 2×. Drag or use arrow keys to pan.');
  };

  const resetZoom = () => {
    setZoom(null);
    setAnnounce('Zoom reset.');
  };

  const toggleZoomCentered = () => {
    if (zoom != null) resetZoom();
    else setZoomAt(photoSize / 2, photoSize / 2);
  };

  const toggleFavorite = (photoId: string) => {
    const photo = PHOTOS.find(p => p.id === photoId);
    if (photo == null) return;
    const isFav = favorites.has(photoId);
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
    setToast(prev => ({
      seq: (prev?.seq ?? 0) + 1,
      text: isFav ? `Removed “${photo.caption}” from Favorites` : `Saved “${photo.caption}” to Favorites`,
    }));
  };

  // EFFECTS ---------------------------------------------------------------

  // Toast auto-dismiss — choreography timer, cleaned up; a new toast
  // replaces the old (seq key restarts the entry animation).
  useEffect(() => {
    if (toast == null) return undefined;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  // Measure AFTER the scroll lock is applied (layout effect, pre-paint)
  // so the FLIP clone starts exactly on the tile's on-screen position.
  useLayoutEffect(() => {
    if (viewer == null) return;
    const shell = shellRef.current;
    if (shell == null) return;
    const w = shell.clientWidth;
    const h = shell.clientHeight;
    setGeom(prev => (prev != null && prev.w === w && prev.h === h ? prev : {w, h}));
    if (viewer.phase !== 'opening') return;
    const tileEl = tileRefs.current[viewer.index];
    if (tileEl == null) {
      setViewer({index: viewer.index, phase: 'open'});
      setBackdropOn(true);
      return;
    }
    const size = Math.max(120, Math.min(w - 48, h - VIEWER_TOP - VIEWER_BOTTOM - 16));
    const box: Rect = {
      l: (w - size) / 2,
      t: VIEWER_TOP + (h - VIEWER_TOP - VIEWER_BOTTOM - size) / 2,
      w: size,
      h: size,
    };
    const tile = relRect(tileEl, shell);
    setFlip({
      photoIndex: viewer.index,
      box,
      from: `translate(${tile.l - box.l}px, ${tile.t - box.t}px) scale(${tile.w / box.w})`,
      armed: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer?.phase, viewer?.index]);

  // Arm the FLIP on the next frame (double rAF ⇒ the inverse transform
  // paints first, then transitions to identity).
  useEffect(() => {
    if (flip == null || flip.armed) return undefined;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setFlip(prev => (prev == null ? prev : {...prev, armed: true}));
        if (viewer?.phase === 'opening') setBackdropOn(true);
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flip?.armed, flip != null]);

  const settleFlip = () => {
    if (viewer == null) return;
    if (viewer.phase === 'opening') {
      setFlip(null);
      setViewer({index: viewer.index, phase: 'open'});
    } else if (viewer.phase === 'closing') {
      finishClose(viewer.index);
    }
  };

  // Fallback in case transitionend is swallowed (e.g. zero-distance FLIP).
  useEffect(() => {
    if (flip == null || !flip.armed) return undefined;
    const timer = setTimeout(settleFlip, 480);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flip?.armed]);

  // Focus the viewer once open; keep the active filmstrip thumb in view.
  useEffect(() => {
    if (viewer?.phase === 'open') viewerRef.current?.focus({preventScroll: true});
  }, [viewer?.phase]);

  useEffect(() => {
    if (viewer == null) return;
    const strip = stripRef.current;
    const active = strip?.children[0]?.children[index + 1] as HTMLElement | undefined;
    active?.scrollIntoView({inline: 'nearest', block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth'});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, viewer != null]);

  // GESTURES ----------------------------------------------------------------

  const onStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (viewer?.phase !== 'open') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = {
      pointerId: event.pointerId,
      x0: event.clientX,
      y0: event.clientY,
      mode: zoom != null ? 'pan' : 'idle',
      tx0: zoom?.tx ?? 0,
      ty0: zoom?.ty ?? 0,
      lastX: event.clientX,
      lastT: event.timeStamp,
      vx: 0,
    };
    if (zoom != null) setPanning(true);
  };

  const onStagePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current;
    if (g == null || g.pointerId !== event.pointerId) return;
    const dx = event.clientX - g.x0;
    const dy = event.clientY - g.y0;
    if (g.mode === 'idle' && Math.hypot(dx, dy) > 8) {
      g.mode = Math.abs(dx) >= Math.abs(dy) ? 'page' : dy > 0 ? 'dismiss' : 'none';
    }
    if (g.mode === 'pan') {
      const lo = photoSize * (1 - ZOOM_SCALE);
      setZoom({
        tx: rubber(g.tx0 + dx, lo, 0, reducedMotion),
        ty: rubber(g.ty0 + dy, lo, 0, reducedMotion),
      });
    } else if (g.mode === 'page') {
      const dt = Math.max(1, event.timeStamp - g.lastT);
      g.vx = (event.clientX - g.lastX) / dt;
      g.lastX = event.clientX;
      g.lastT = event.timeStamp;
      const atStart = index === 0 && dx > 0;
      const atEnd = index === PHOTO_COUNT - 1 && dx < 0;
      setDrag({mode: 'page', x: atStart || atEnd ? dx * 0.35 : dx});
    } else if (g.mode === 'dismiss') {
      setDrag({mode: 'dismiss', y: Math.max(0, dy)});
    }
  };

  const onStagePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const g = gestureRef.current;
    if (g == null || g.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    const dx = event.clientX - g.x0;
    const dy = event.clientY - g.y0;
    if (g.mode === 'pan') {
      setPanning(false);
      const lo = photoSize * (1 - ZOOM_SCALE);
      setZoom(prev => (prev == null ? prev : {tx: clamp(prev.tx, lo, 0), ty: clamp(prev.ty, lo, 0)}));
    } else if (g.mode === 'page') {
      const threshold = photoSize * 0.3;
      if (dx < -threshold || g.vx < -PAGE_FLICK_VELOCITY) goTo(index + 1);
      else if (dx > threshold || g.vx > PAGE_FLICK_VELOCITY) goTo(index - 1);
      else setDrag(null);
    } else if (g.mode === 'dismiss') {
      if (dy > DISMISS_THRESHOLD) requestClose();
      else setDrag(null); // spring back
    } else if (g.mode === 'idle') {
      // Tap — double-tap toggles 2× zoom at the tap point.
      const last = lastTapRef.current;
      const now = event.timeStamp;
      if (last != null && now - last.t < 300 && Math.hypot(event.clientX - last.x, event.clientY - last.y) < 32) {
        lastTapRef.current = null;
        if (zoom != null) {
          resetZoom();
        } else {
          const photoEl = activePhotoRef.current;
          if (photoEl != null) {
            const rect = photoEl.getBoundingClientRect();
            setZoomAt(event.clientX - rect.left, event.clientY - rect.top);
          }
        }
      } else {
        lastTapRef.current = {t: now, x: event.clientX, y: event.clientY};
      }
      setDrag(null);
    } else {
      setDrag(null);
    }
  };

  const onStagePointerCancel = () => {
    gestureRef.current = null;
    setPanning(false);
    setDrag(null);
    const lo = photoSize * (1 - ZOOM_SCALE);
    setZoom(prev => (prev == null ? prev : {tx: clamp(prev.tx, lo, 0), ty: clamp(prev.ty, lo, 0)}));
  };

  const onViewerKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      requestClose();
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (zoom != null) {
        event.preventDefault();
        const lo = photoSize * (1 - ZOOM_SCALE);
        const step = 48;
        setZoom(prev => {
          if (prev == null) return prev;
          const tx = clamp(prev.tx + (event.key === 'ArrowLeft' ? step : event.key === 'ArrowRight' ? -step : 0), lo, 0);
          const ty = clamp(prev.ty + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0), lo, 0);
          return {tx, ty};
        });
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(index + 1);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(index - 1);
        return;
      }
    }
    trapTabKey(event, viewerRef.current);
  };

  // RENDER ------------------------------------------------------------------

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(viewer != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const viewerLabel = `Photo ${index + 1} of ${PHOTO_COUNT} — ${activePhoto.caption}`;
  const flipPhoto = flip != null ? PHOTOS[flip.photoIndex] : null;
  const showChrome = viewer?.phase === 'open';
  const dismissScale = 1 - Math.min(dismissY / 1400, 0.12);

  return (
    <div ref={wrapRef} style={{...styles.wrap, ...(isDesktopColumn ? styles.wrapDesktop : null)}}>
      <style>{PGV_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.brandSeat} aria-hidden>
              <Icon icon={ApertureIcon} size="md" color="inherit" />
            </span>
          </div>
          <h1 style={styles.navTitle}>Saltline</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="pgv-btn pgv-focusable"
              style={{...styles.navIconBtn, ...(captionsOn ? styles.navIconBtnOn : null)}}
              aria-pressed={captionsOn}
              aria-label="Show captions on photos"
              onClick={() => setCaptionsOn(prev => !prev)}>
              <Icon icon={CaptionsIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          {/* ALBUM HEADER */}
          <div style={styles.albumHeader}>
            <h2 style={styles.albumTitle}>Sea Ranch Weekend</h2>
            <span style={styles.albumMeta}>12 photos · Jul 3 – 5, 2026 · Sea Ranch, CA</span>
          </div>

          {/* 3×4 PHOTO GRID */}
          <div style={styles.grid}>
            {PHOTOS.map((photo, i) => {
              const fav = favorites.has(photo.id);
              return (
                <button
                  key={photo.id}
                  type="button"
                  ref={el => {
                    tileRefs.current[i] = el;
                  }}
                  className="pgv-btn pgv-focusable pgv-tile"
                  style={{...styles.tile, background: art(photo)}}
                  aria-label={`Open ${photo.caption} — ${photo.day}, ${photo.time}${fav ? ', favorite' : ''}`}
                  onClick={() => openViewer(i)}>
                  <span style={styles.tileMono} aria-hidden>
                    {photo.mono}
                  </span>
                  {fav ? (
                    <span style={styles.tileFav} aria-hidden>
                      <Icon icon={HeartIcon} size="xsm" color="inherit" />
                    </span>
                  ) : null}
                  {captionsOn ? (
                    <span style={styles.tileChip} aria-hidden>
                      {photo.caption}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* ALBUM DETAILS */}
          <div style={styles.sectionHeader}>Album details</div>
          <div style={styles.listCard}>
            {ALBUM_DETAILS.map((row, i) => (
              <div key={row.id}>
                {i > 0 ? <div style={styles.rowDivider} aria-hidden /> : null}
                <div style={styles.utilityRow}>
                  <span style={styles.utilityIcon}>
                    <Icon icon={row.icon} size="sm" color="inherit" />
                  </span>
                  <span style={styles.utilityLabel}>{row.label}</span>
                  <span style={styles.utilityValue}>{row.value}</span>
                </div>
              </div>
            ))}
          </div>

          <p style={styles.footerCaption}>Synced · Sun, Jul 5 · 11:48 PM</p>
        </main>

        {/* VIEWER — absolute inside the locked shell. */}
        {viewer != null ? (
          <div
            ref={viewerRef}
            role="dialog"
            aria-modal="true"
            aria-label={viewerLabel}
            tabIndex={-1}
            className={`pgv-viewer-root${reducedMotion ? ' pgv-rm-fade' : ''}`}
            style={styles.viewer}
            onKeyDown={onViewerKeyDown}>
            {/* Backdrop — opacity falls off with the swipe-down drag. */}
            <div
              style={{
                ...styles.backdrop,
                opacity: backdropOpacity,
                transition:
                  drag?.mode === 'dismiss' || reducedMotion ? 'none' : `opacity 320ms ${EASE_OUT}`,
              }}
              aria-hidden
            />

            {/* Pager stage — pointer gestures live here. */}
            {geom != null && viewer.phase !== 'opening' ? (
              <div
                style={styles.stage}
                onPointerDown={onStagePointerDown}
                onPointerMove={onStagePointerMove}
                onPointerUp={onStagePointerUp}
                onPointerCancel={onStagePointerCancel}>
                <div
                  style={{
                    ...styles.track,
                    transform: `translateX(${trackBaseX + dragX}px)`,
                    transition:
                      drag != null || reducedMotion ? 'none' : `transform 320ms ${EASE_OUT}`,
                  }}>
                  {PHOTOS.map((photo, i) => {
                    const isActive = i === index;
                    const hidden = viewer.phase === 'closing' && isActive;
                    return (
                      <div
                        key={photo.id}
                        ref={isActive ? activePhotoRef : undefined}
                        style={{
                          ...styles.photoBox,
                          width: photoSize,
                          height: photoSize,
                          visibility: hidden ? 'hidden' : undefined,
                          transform:
                            isActive && dismissY > 0
                              ? `translateY(${dismissY}px) scale(${dismissScale})`
                              : 'none',
                          transition:
                            drag != null || reducedMotion ? 'none' : `transform 380ms ${EASE_SPRING}`,
                        }}>
                        <div
                          style={{
                            ...styles.photoArt,
                            background: art(photo),
                            transform:
                              isActive && zoom != null
                                ? `translate(${zoom.tx}px, ${zoom.ty}px) scale(${ZOOM_SCALE})`
                                : 'none',
                            transition:
                              panning || reducedMotion ? 'none' : `transform 260ms ${EASE_OUT}`,
                          }}>
                          <span style={styles.photoMono} aria-hidden>
                            {photo.mono}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* FLIP clone (opening + closing). */}
            {flip != null && flipPhoto != null ? (
              <div
                style={{
                  ...styles.clone,
                  left: flip.box.l,
                  top: flip.box.t,
                  width: flip.box.w,
                  height: flip.box.h,
                  transformOrigin: '0 0',
                  transform: flip.armed ? 'none' : flip.from,
                  transition: flip.armed ? `transform 340ms ${EASE_OUT}` : 'none',
                }}
                onTransitionEnd={event => {
                  if (event.propertyName === 'transform') settleFlip();
                }}
                aria-hidden>
                <div style={{...styles.cloneArt, background: art(flipPhoto)}}>
                  <span
                    style={{
                      ...styles.photoMono,
                      fontSize: viewer.phase === 'opening' ? 44 : 22,
                    }}>
                    {flipPhoto.mono}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Viewer chrome — revealed once the FLIP settles. */}
            {showChrome ? (
              <>
                <div className="pgv-chrome-in" style={{...styles.viewerTopBar, opacity: chromeOpacity}}>
                  <button
                    type="button"
                    className="pgv-btn pgv-focusable"
                    style={styles.viewerBtn}
                    aria-label="Close photo"
                    onClick={requestClose}>
                    <span style={styles.viewerBtnSeat}>
                      <Icon icon={XIcon} size="sm" color="inherit" />
                    </span>
                  </button>
                  <span style={styles.viewerCounter}>
                    {index + 1} of {PHOTO_COUNT}
                  </span>
                  <div style={styles.viewerBtnRow}>
                    <button
                      type="button"
                      className="pgv-btn pgv-focusable"
                      style={{
                        ...styles.viewerBtn,
                        color: favorites.has(activePhoto.id) ? BRAND_ACCENT : VIEWER_TEXT,
                      }}
                      aria-pressed={favorites.has(activePhoto.id)}
                      aria-label={`Favorite ${activePhoto.caption}`}
                      onClick={() => toggleFavorite(activePhoto.id)}>
                      <span style={styles.viewerBtnSeat}>
                        <Icon icon={HeartIcon} size="sm" color="inherit" />
                      </span>
                    </button>
                    <button
                      type="button"
                      className="pgv-btn pgv-focusable"
                      style={styles.viewerBtn}
                      aria-pressed={zoom != null}
                      aria-label={zoom != null ? 'Reset zoom' : 'Zoom to 2×'}
                      onClick={toggleZoomCentered}>
                      <span style={styles.viewerBtnSeat}>
                        <Icon icon={zoom != null ? ZoomOutIcon : ZoomInIcon} size="sm" color="inherit" />
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pgv-chrome-in" style={{...styles.bottomChrome, opacity: chromeOpacity}}>
                  <div style={styles.captionBar}>
                    <button
                      type="button"
                      className="pgv-btn pgv-focusable"
                      style={{...styles.viewerBtn, opacity: index === 0 ? 0.35 : 1}}
                      aria-label="Previous photo"
                      disabled={index === 0}
                      onClick={() => goTo(index - 1)}>
                      <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                    </button>
                    <div style={styles.captionBlock}>
                      <span style={styles.captionTitle}>{activePhoto.caption}</span>
                      <span style={styles.captionMeta}>
                        {activePhoto.day} · {activePhoto.time} · Meridian M6
                      </span>
                    </div>
                    <button
                      type="button"
                      className="pgv-btn pgv-focusable"
                      style={{...styles.viewerBtn, opacity: index === PHOTO_COUNT - 1 ? 0.35 : 1}}
                      aria-label="Next photo"
                      disabled={index === PHOTO_COUNT - 1}
                      onClick={() => goTo(index + 1)}>
                      <Icon icon={ChevronRightIcon} size="md" color="inherit" />
                    </button>
                  </div>
                  <div ref={stripRef} style={styles.filmstrip}>
                    <div style={styles.filmstripInner}>
                      {/* Active-thumb underline slides via transform. */}
                      <span
                        className="pgv-underline"
                        style={{
                          ...styles.thumbUnderline,
                          transform: `translateX(${index * THUMB_SLOT + (THUMB_SLOT - 24) / 2}px)`,
                        }}
                        aria-hidden
                      />
                      {PHOTOS.map((photo, i) => (
                        <button
                          key={photo.id}
                          type="button"
                          className="pgv-btn pgv-focusable"
                          style={styles.thumbBtn}
                          aria-label={`Go to photo ${i + 1}, ${photo.caption}`}
                          aria-current={i === index ? 'true' : undefined}
                          onClick={() => goTo(i)}>
                          <span
                            style={{
                              ...styles.thumbArt,
                              background: art(photo),
                              opacity: i === index ? 1 : 0.55,
                            }}
                            aria-hidden>
                            {photo.mono}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {/* Viewer announcements (index + zoom changes). */}
            <span className="pgv-vh" aria-live="polite" role="status">
              {announce}
            </span>
          </div>
        ) : null}

        {/* TOAST DOCK — sticky-in-flow normally; shell-absolute (above the
            filmstrip) only while the shell is scroll-locked. */}
        <div style={viewer != null ? styles.toastRegionLocked : styles.dockSticky}>
          <div
            style={viewer != null ? {display: 'contents'} : styles.toastRegion}
            aria-live="polite"
            role="status">
            {toast != null ? (
              <div key={toast.seq} className="pgv-toast-in" style={styles.toast}>
                <span style={styles.toastText}>{toast.text}</span>
                <button
                  type="button"
                  className="pgv-btn pgv-focusable"
                  style={styles.toastDismiss}
                  aria-label="Dismiss message"
                  onClick={() => setToast(null)}>
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
