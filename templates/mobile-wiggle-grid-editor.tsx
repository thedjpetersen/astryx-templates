// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Slate launcher home screen frozen
 *   at Sun, Jul 12: 23 invented apps total = 20 grid tiles (4×5) + 3 dock
 *   tiles, so the 4-slot dock has EXACTLY ONE free seat at load (the first
 *   drop lands, the second bounces — both dock behaviors reachable);
 *   2 badged tiles (Postbox 4 + Chirp 12 = 16 unread, echoed in the header
 *   caption); every icon is an id-derived hue-gradient tile + 2-letter
 *   monogram. No Date.now(), no Math.random(), no network media. Wiggle
 *   phase offsets are index-derived (-(index × 137 mod 300)ms), confetti-
 *   free — the only timers are the 450ms long-press hold and short settle
 *   cleanups, all cleared in effects/handlers.
 * @output Slate — Wiggle Grid Editor: a 390px MOBILE home-screen grid
 *   editor. NavBar (grid mark · 'Home' · Edit/Done 44px text button — the
 *   button path into and out of edit mode) over a derived caption row
 *   ('23 apps · 16 unread · 1 dock slot free'), then the 4×5 icon grid as
 *   an absolutely-positioned, transform-laid-out slot model. Long-press
 *   any tile (450ms) enters WIGGLE MODE: tiles wiggle via two alternating
 *   ±1.6deg rotate keyframes with per-index NEGATIVE animationDelay so no
 *   two phases align, and each grows a 28px '−' remove chip inside a
 *   44×44 hit. Dragging a tile (pointer capture) scales it 1.08 with a
 *   shadow and follows the finger while every other tile GLIDES around
 *   the hovered slot via transform transitions computed from the slot-
 *   index model; release commits the new order with an overshoot settle
 *   spring. The floating 4-slot dock accepts drops (grid→dock, dock
 *   reorder, dock→grid); a full dock bounces the rejected tile back to
 *   its origin slot with a shake + 'Dock is full' toast. Tapping '−'
 *   shrinks the tile away and the grid reflows closed (Undo toast
 *   restores the exact prior order). In wiggle mode a plain TAP on any
 *   tile opens its Move sheet (Move left/right/up/down · Move to dock /
 *   grid · Remove) — the mandatory button path that commits through the
 *   SAME applyMove/remove updaters as the gestures, so keyboard users
 *   (Enter on a tile) reorder without dragging. Selection order persists
 *   in one orders={grid[],dock[]} state.
 * @position Page template; emitted by `astryx template mobile-wiggle-grid-editor`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, Move sheet) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   Move sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close. ONE polite toast dock (role=status aria-live)
 *   rides the sticky dock wrapper 12px above the floating dock card (the
 *   dock is this surface's tab-bar analogue); one toast at a time — a new
 *   toast REPLACES the old; Undo is a real 44px button.
 * Animation contract: transform/opacity ONLY. The grid is a slot-index
 *   model — tiles are absolutely positioned and placed with translate(),
 *   so reorder/reflow/removal NEVER animate layout properties. Glide =
 *   cubic-bezier(0.22,1,0.36,1) 220ms; drop settle = cubic-bezier(0.34,
 *   1.56,0.64,1) 320ms overshoot; wiggle = two alternating rotate
 *   keyframes; bounce-back = the same drop spring + a translateX shake
 *   keyframe ×1. Reduced motion (matchMedia read in a useEffect with a
 *   change listener + a CSS media backstop): wiggle REMOVED entirely
 *   (chips just appear), reflows/settles instant, removal commits
 *   immediately, and the Move sheet remains the full reorder fallback.
 * Container policy: launcher surface — icon tiles on the body wallpaper,
 *   a blur-surface floating dock card (radius 24), and one bottom Move
 *   sheet (16px radius card, 52px rows, hairline dividers); no desktop
 *   frames, no data tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#2563EB, #8AB8FF) — white 13px/600 text on
 *   #2563EB ≈ 5.2:1; near-black #0A1013 on #8AB8FF ≈ 8.9:1; as a bare
 *   ring/fill vs the body surface ≈ 5.2:1 light / ≈ 6.9:1 dark, both ≥3:1.
 *   Sanctioned non-brand literals: ERROR_FILL_TEXT over var(--color-error)
 *   badges (#FFFFFF on #E3193B ≈ 4.7:1; white on #F5394F fails ~3.8:1 so
 *   dark flips to #2B0505 ≈ 4.8:1), and the scrim. Icon art = id-derived
 *   hue gradients (hsl 45%/40% → +40 55%/26%) with white monograms ≈
 *   4.6:1+ in both schemes — poster art, not chrome. Never
 *   var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px grid column gaps · 18px
 *   row gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 with always-on hairline; dock card = iconSize+24 tall, sticky
 *   bottom wrapper z20; Move sheet rows 52px. TYPE (via
 *   --font-family-body): 17/600 nav + sheet titles · 16/400 sheet rows ·
 *   13/400 meta · 11/500 tile labels + eyebrow; nothing under 11px;
 *   tabular-nums on every count. Touch law: every target ≥44×44 — tiles
 *   are ≥79px, remove chips are 28px visuals centered in 44×44 buttons,
 *   nav/sheet/toast controls are ≥44px tall.
 *
 * Responsive contract:
 * - Fluid 320–430: cellW = (containerW − 3×12)/4 (79 at 390, 68 at 320);
 *   iconSize = clamp(48, cellW−17, 64); labels ellipsize at cell width;
 *   dock slot pitch = (containerW−24)/4. overflowX:'clip' backstop.
 * - The demo's phone artboard is a REAL 390px iframe, but the grid still
 *   measures its own width with useElementWidth (ResizeObserver), never
 *   viewport units. At container widths >560px the shell renders as the
 *   standard centered 430px phone column (marginInline auto, borderInline
 *   hairline) on the muted backdrop — no stretched relayout; the grid
 *   anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  ArrowDownIcon,
  ArrowDownToLineIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpFromLineIcon,
  ArrowUpIcon,
  LayoutGridIcon,
  MinusIcon,
  Trash2Icon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Slate blue). White 13px/600 text on
// #2563EB ≈ 5.2:1; near-black #0A1013 on #8AB8FF ≈ 8.9:1. As a bare
// ring/fill: #2563EB on the white body ≈ 5.2:1, #8AB8FF on the ~#141414
// dark body ≈ 6.9:1 — both ≥3:1 for meaningful non-text marks.
const BRAND_ACCENT = 'light-dark(#2563EB, #8AB8FF)';
// Text over a BRAND_ACCENT fill (math above).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #0A1013)';
// 12% brand wash for the navBar mark seat / hovered dock slot.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Text over a var(--color-error) badge fill (house error =
// light-dark(#E3193B, #F5394F)): #FFFFFF on #E3193B ≈ 4.7:1; white on
// #F5394F fails (~3.8:1), so the dark side flips to #2B0505 ≈ 4.8:1.
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #2B0505)';
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — unique `wge-` prefix. Transform/opacity only. The wiggle is
// TWO alternating rotate keyframes assigned by index parity; per-index
// negative animationDelay desynchronizes the phases. Reduced-motion media
// block is the CSS backstop for the JS matchMedia gate.
// ---------------------------------------------------------------------------

const WGE_CSS = `
.wge-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.wge-btn:disabled { cursor: default; }
.wge-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
/* Slot glide — every non-dragged tile transitions to its recomputed slot
   (decelerate). Position is ALWAYS transform, never layout. */
.wge-slot { transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1); }
/* Drop settle — the released tile springs into its committed slot. */
.wge-drop { transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1); }
/* The finger-following tile: no transition while dragging. */
.wge-dragging { transition: none; }
@keyframes wge-wiggle-a {
  0% { transform: rotate(-1.6deg); }
  50% { transform: rotate(1.6deg); }
  100% { transform: rotate(-1.6deg); }
}
@keyframes wge-wiggle-b {
  0% { transform: rotate(1.6deg); }
  50% { transform: rotate(-1.6deg); }
  100% { transform: rotate(1.6deg); }
}
.wge-wiggle-a { animation: wge-wiggle-a 300ms ease-in-out infinite; }
.wge-wiggle-b { animation: wge-wiggle-b 300ms ease-in-out infinite; }
@keyframes wge-chip-in {
  0% { transform: scale(0.4); opacity: 0; }
  70% { transform: scale(1.12); }
  100% { transform: scale(1); opacity: 1; }
}
.wge-chip-in { animation: wge-chip-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes wge-remove-out {
  to { transform: scale(0.05); opacity: 0; }
}
.wge-remove-out {
  animation: wge-remove-out 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes wge-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
.wge-shake { animation: wge-shake 360ms ease-in-out; }
@keyframes wge-pop {
  0% { transform: scale(0.6); opacity: 0.4; }
  60% { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
}
.wge-pop { animation: wge-pop 260ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes wge-settle {
  0% { transform: rotate(-1.2deg); }
  55% { transform: rotate(0.5deg) scale(0.99); }
  100% { transform: rotate(0deg) scale(1); }
}
.wge-settle { animation: wge-settle 260ms cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes wge-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.wge-sheet-in { animation: wge-sheet-in 200ms cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes wge-toast-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.wge-toast-in { animation: wge-toast-in 180ms cubic-bezier(0.22, 1, 0.36, 1); }
.wge-vh {
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
  .wge-slot, .wge-drop { transition: none; }
  .wge-wiggle-a, .wge-wiggle-b, .wge-chip-in, .wge-shake, .wge-pop,
  .wge-settle, .wge-sheet-in, .wge-toast-in { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%', background: 'var(--color-background-muted)'},
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
  brandSeat: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  editBtn: {
    height: 44,
    minWidth: 44,
    paddingInline: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  editBtnActive: {fontWeight: 600},
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // Derived caption row — every count flows from the orders state.
  captionRow: {
    minHeight: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: 16,
    marginTop: 8,
  },
  captionText: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // GRID — a relative canvas; tiles are absolute and placed with
  // translate() from the slot-index model (transform-only reflow).
  gridCanvas: {position: 'relative', marginInline: 16, marginTop: 12},
  tileWrap: {position: 'absolute', left: 0, top: 0},
  tileBtn: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'block',
    borderRadius: 14,
  },
  tileIcon: {
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontWeight: 700,
    letterSpacing: '0.02em',
    marginInline: 'auto',
  },
  tileLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '14px',
    textAlign: 'center',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Unread badge — var(--color-error) fill; text pair math at
  // ERROR_FILL_TEXT. Not color-alone: the count digit carries the meaning.
  badge: {
    position: 'absolute',
    minWidth: 18,
    height: 18,
    paddingInline: 5,
    borderRadius: 999,
    background: 'var(--color-error)',
    color: ERROR_FILL_TEXT,
    fontSize: 11,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
    zIndex: 2,
    pointerEvents: 'none',
  },
  // Remove chip — 28px visual centered in a 44×44 button hit.
  chipBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    zIndex: 3,
    borderRadius: '50%',
  },
  chipCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    boxShadow: '0 2px 8px var(--color-shadow)',
  },
  // Page dots — decorative fixture (aria-hidden).
  dotsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  dot: {width: 7, height: 7, borderRadius: '50%', background: 'var(--color-border)'},
  dotActive: {background: BRAND_ACCENT},
  hintCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '12px 16px 0',
  },
  // DOCK — sticky bottom wrapper (z20) holding the toast live region and
  // the floating blur-surface dock card.
  dockWrap: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    marginTop: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dockCard: {
    position: 'relative',
    marginInline: 16,
    borderRadius: 24,
    background: 'color-mix(in srgb, var(--color-background-muted) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--color-border)',
  },
  dockSlotHint: {
    position: 'absolute',
    border: '1.5px dashed var(--color-border)',
  },
  dockSlotHintActive: {
    borderColor: BRAND_ACCENT,
    borderStyle: 'solid',
    background: BRAND_TINT_12,
  },
  // TOAST — the single polite live region, 12px above the dock card.
  toastRegion: {
    position: 'absolute',
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
  toastPad: {width: 16, flexShrink: 0},
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // MOVE SHEET — the mandatory button path. Scrim z40, sheet z41.
  sheetScrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
  sheetWrapOuter: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sheetCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  sheetHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderBottom: '1px solid var(--color-border)',
  },
  sheetHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  sheetHeaderText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 1},
  sheetHeaderName: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetHeaderMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  sheetRow: {
    width: '100%',
    minHeight: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
  },
  sheetRowDisabled: {opacity: 0.35},
  sheetRowDanger: {color: 'var(--color-error)'},
  sheetRowGlyph: {display: 'inline-flex', flexShrink: 0, color: 'var(--color-text-secondary)'},
  sheetRowGlyphDanger: {color: 'var(--color-error)'},
  sheetHairline: {height: 1, background: 'var(--color-border)'},
  sheetCancel: {
    width: '100%',
    minHeight: 52,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
  },
};

// ---------------------------------------------------------------------------
// DATA — 23 deterministic apps: 20 grid + 3 dock (dock capacity 4 ⇒ exactly
// one free slot at load). 2 badged tiles: Postbox 4 + Chirp 12 = 16 unread.
// ---------------------------------------------------------------------------

type ZoneId = 'grid' | 'dock';

interface AppFixture {
  id: string;
  name: string;
  hue: number; // id-derived art gradient hue — no network media
  mono: string; // 2-letter monogram, precomputed (deterministic)
  badge: number | null;
}

const APPS: AppFixture[] = [
  {id: 'postbox', name: 'Postbox', hue: 214, mono: 'Po', badge: 4},
  {id: 'chirp', name: 'Chirp', hue: 196, mono: 'Ch', badge: 12},
  {id: 'lumen', name: 'Lumen', hue: 44, mono: 'Lu', badge: null},
  {id: 'atlas', name: 'Atlas', hue: 152, mono: 'At', badge: null},
  {id: 'tempo', name: 'Tempo', hue: 332, mono: 'Te', badge: null},
  {id: 'ledger', name: 'Ledger', hue: 262, mono: 'Le', badge: null},
  {id: 'skylight', name: 'Skylight', hue: 204, mono: 'Sk', badge: null},
  {id: 'pantry', name: 'Pantry', hue: 24, mono: 'Pa', badge: null},
  {id: 'orbit', name: 'Orbit', hue: 234, mono: 'Or', badge: null},
  {id: 'quill', name: 'Quill', hue: 52, mono: 'Qu', badge: null},
  {id: 'reelroom', name: 'Reelroom', hue: 286, mono: 'Re', badge: null},
  {id: 'fitline', name: 'Fitline', hue: 4, mono: 'Fi', badge: null},
  {id: 'stackpay', name: 'Stackpay', hue: 168, mono: 'St', badge: null},
  {id: 'dimmer', name: 'Dimmer', hue: 36, mono: 'Di', badge: null},
  {id: 'waypoint', name: 'Waypoint', hue: 190, mono: 'Wp', badge: null},
  {id: 'glossary', name: 'Glossary', hue: 302, mono: 'Gl', badge: null},
  {id: 'huddle', name: 'Huddle', hue: 250, mono: 'Hu', badge: null},
  {id: 'darkroom', name: 'Darkroom', hue: 20, mono: 'Da', badge: null},
  {id: 'tidepool', name: 'Tidepool', hue: 176, mono: 'Ti', badge: null},
  {id: 'almanac', name: 'Almanac', hue: 88, mono: 'Al', badge: null},
  // Dock three — one dock slot deliberately free at load.
  {id: 'ringer', name: 'Ringer', hue: 140, mono: 'Ri', badge: null},
  {id: 'thread', name: 'Thread', hue: 120, mono: 'Th', badge: null},
  {id: 'lens', name: 'Lens', hue: 268, mono: 'Ln', badge: null},
];

const APP_BY_ID: Record<string, AppFixture> = Object.fromEntries(
  APPS.map(app => [app.id, app]),
);

interface Orders {
  grid: string[];
  dock: string[];
}

const INITIAL_ORDERS: Orders = {
  grid: APPS.slice(0, 20).map(app => app.id),
  dock: APPS.slice(20).map(app => app.id),
};

const COLS = 4;
const GAP = 12; // grid column gap (density grid: 12px card gaps)
const ROW_GAP = 18;
const DOCK_CAPACITY = 4;

// Icon art from the app's id-derived hue — white monogram on 40%/26%-
// lightness stops ≈ 4.6:1+ in both schemes (poster art, not chrome).
function artGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 45% 40%), hsl(${(hue + 40) % 360} 55% 26%))`;
}

/** Move `id` out of wherever it lives and insert it in `to` at `toIndex`. */
function applyMove(orders: Orders, id: string, to: ZoneId, toIndex: number): Orders {
  const grid = orders.grid.filter(other => other !== id);
  const dock = orders.dock.filter(other => other !== id);
  const target = to === 'grid' ? grid : dock;
  target.splice(Math.max(0, Math.min(toIndex, target.length)), 0, id);
  return {grid, dock};
}

function applyRemove(orders: Orders, id: string): Orders {
  return {
    grid: orders.grid.filter(other => other !== id),
    dock: orders.dock.filter(other => other !== id),
  };
}

/** Display array with a null gap slot inserted at `index` (hover preview). */
function withGap(order: string[], index: number): Array<string | null> {
  const copy: Array<string | null> = [...order];
  copy.splice(Math.max(0, Math.min(index, copy.length)), 0, null);
  return copy;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ---------------------------------------------------------------------------
// HOOKS
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

/** prefers-reduced-motion via matchMedia in an effect, with change listener. */
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
// INTERACTION STATE SHAPES
// ---------------------------------------------------------------------------

interface DragState {
  id: string;
  fromZone: ZoneId;
  fromIndex: number;
  dx: number;
  dy: number;
  over: {zone: ZoneId; index: number};
  rejected: boolean; // hovering a full dock — commit will bounce
}

interface PressState {
  id: string;
  zone: ZoneId;
  index: number;
  pointerId: number;
  startX: number;
  startY: number;
  dragStarted: boolean;
  longPressFired: boolean;
  // Mutated synchronously on every pointermove so the drop commit never
  // races React's render flush.
  over: {zone: ZoneId; index: number};
  rejected: boolean;
}

interface ToastState {
  seq: number;
  text: string;
  undoOrders: Orders | null;
}

interface MenuState {
  id: string;
  zone: ZoneId;
}

type JustMoved = {id: string; kind: 'drop' | 'pop' | 'shake'} | null;

// ---------------------------------------------------------------------------
// TEMPLATE
// ---------------------------------------------------------------------------

export default function MobileWiggleGridEditorTemplate(): ReactNode {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 600px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth > 560 : isWideViewport;
  const reducedMotion = useReducedMotion();

  const [orders, setOrders] = useState<Orders>(INITIAL_ORDERS);
  const [editMode, setEditMode] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [menuFor, setMenuFor] = useState<MenuState | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [pressingId, setPressingId] = useState<string | null>(null);
  const [justMoved, setJustMoved] = useState<JustMoved>(null);
  const [settling, setSettling] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const dockCardRef = useRef<HTMLDivElement | null>(null);
  const pressRef = useRef<PressState | null>(null);
  const longPressTimer = useRef<number | null>(null);
  // Set when pointerup already handled a tap, so the trailing click event
  // is ignored; a click that arrives without it is keyboard activation.
  const suppressClickRef = useRef(false);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const menuCancelRef = useRef<HTMLButtonElement | null>(null);

  // GEOMETRY — measured container width, never viewport units.
  const gridWidth = useElementWidth(gridRef);
  const contentW = gridWidth > 0 ? gridWidth : 358;
  const cellW = (contentW - GAP * (COLS - 1)) / COLS;
  const iconSize = clamp(cellW - 17, 48, 64);
  const cellH = iconSize + 20; // icon + 6px gap + 14px label line
  const iconInset = (cellW - iconSize) / 2;
  const iconRadius = Math.round(iconSize * 0.23);
  const dockCardH = iconSize + 24;
  const dockPitch = (contentW - 24) / DOCK_CAPACITY;

  const gridPos = useCallback(
    (index: number) => ({
      x: (index % COLS) * (cellW + GAP),
      y: Math.floor(index / COLS) * (cellH + ROW_GAP),
    }),
    [cellW, cellH],
  );
  const dockPos = useCallback(
    (index: number) => ({
      x: 12 + index * dockPitch + (dockPitch - iconSize) / 2,
      y: 12,
    }),
    [dockPitch, iconSize],
  );

  // DISPLAY MODEL — while dragging, the dragged id leaves both arrays and a
  // null gap previews the hovered slot; everyone else glides via transform.
  const dragId = drag?.id ?? null;
  const gridBase = dragId == null ? orders.grid : orders.grid.filter(id => id !== dragId);
  const dockBase = dragId == null ? orders.dock : orders.dock.filter(id => id !== dragId);
  // While hovering a full dock (rejected), `over` falls back to the origin
  // slot, so the origin gap stays open for the bounce-back.
  const gapZone = drag != null ? drag.over.zone : null;
  const displayGrid: Array<string | null> =
    gapZone === 'grid' && drag != null ? withGap(gridBase, drag.over.index) : gridBase;
  const displayDock: Array<string | null> =
    gapZone === 'dock' && drag != null ? withGap(dockBase, drag.over.index) : dockBase;
  const gridRows = Math.max(1, Math.ceil(Math.max(displayGrid.length, orders.grid.length) / COLS));
  const gridHeight = gridRows * cellH + (gridRows - 1) * ROW_GAP;

  // Derived caption — counts flow from the same orders state, never literals.
  const totalApps = orders.grid.length + orders.dock.length;
  const unreadTotal = [...orders.grid, ...orders.dock].reduce(
    (sum, id) => sum + (APP_BY_ID[id]?.badge ?? 0),
    0,
  );
  const dockFree = DOCK_CAPACITY - orders.dock.length;

  const overlayOpen = menuFor != null;

  // TOAST — one polite region; a new toast replaces the old.
  const pushToast = useCallback((text: string, undoOrders: Orders | null) => {
    setToast(prev => ({seq: (prev?.seq ?? 0) + 1, text, undoOrders}));
  }, []);

  const undoToast = useCallback(() => {
    setToast(prev => {
      if (prev?.undoOrders != null) {
        setOrders(prev.undoOrders);
        return {seq: prev.seq + 1, text: 'Restored', undoOrders: null};
      }
      return prev;
    });
  }, []);

  // EDIT MODE ----------------------------------------------------------------

  const enterEdit = useCallback(() => {
    setEditMode(true);
    pushToast('Wiggle mode — drag to reorder, − to remove', null);
  }, [pushToast]);

  const exitEdit = useCallback(() => {
    setEditMode(false);
    setMenuFor(null);
    setDrag(null);
    if (!reducedMotion) {
      setSettling(true);
    }
    pushToast('Layout saved', null);
  }, [pushToast, reducedMotion]);

  // Synchronized settle after Done — one-shot class, cleared on a timer.
  useEffect(() => {
    if (!settling) {
      return undefined;
    }
    const timer = window.setTimeout(() => setSettling(false), 320);
    return () => window.clearTimeout(timer);
  }, [settling]);

  // Drop/pop/shake marker — cleared after the spring finishes.
  useEffect(() => {
    if (justMoved == null) {
      return undefined;
    }
    const timer = window.setTimeout(() => setJustMoved(null), 420);
    return () => window.clearTimeout(timer);
  }, [justMoved]);

  // MOVE SHEET (mandatory button path) ----------------------------------------

  const openMenu = useCallback((id: string, zone: ZoneId, opener: HTMLElement | null) => {
    menuOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    setMenuFor({id, zone});
  }, []);

  const closeMenu = useCallback(() => {
    setMenuFor(null);
    menuOpenerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (menuFor != null) {
      menuCancelRef.current?.focus();
    }
  }, [menuFor]);

  // Escape closes the sheet, then exits wiggle mode.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      if (menuFor != null) {
        closeMenu();
      } else if (editMode) {
        exitEdit();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuFor, editMode, closeMenu, exitEdit]);

  // COMMITS — gestures and the Move sheet flow through the SAME updaters.

  const commitMove = useCallback(
    (id: string, to: ZoneId, toIndex: number, crossedZone: boolean) => {
      setOrders(prev => applyMove(prev, id, to, toIndex));
      setJustMoved({id, kind: crossedZone ? 'pop' : 'drop'});
      const name = APP_BY_ID[id]?.name ?? id;
      if (crossedZone) {
        pushToast(to === 'dock' ? `${name} moved to the dock` : `${name} moved to the grid`, null);
      } else {
        pushToast(`${name} moved to slot ${Math.min(toIndex, (to === 'dock' ? orders.dock : orders.grid).length - 1) + 1}`, null);
      }
    },
    [pushToast, orders],
  );

  const commitRemove = useCallback(
    (id: string) => {
      const snapshot = orders;
      setOrders(prev => applyRemove(prev, id));
      setRemovingId(null);
      pushToast(`${APP_BY_ID[id]?.name ?? id} removed`, snapshot);
    },
    [orders, pushToast],
  );

  const requestRemove = useCallback(
    (id: string) => {
      setMenuFor(null);
      if (reducedMotion) {
        commitRemove(id);
      } else {
        setRemovingId(id);
      }
    },
    [commitRemove, reducedMotion],
  );

  // POINTER CHOREOGRAPHY -------------------------------------------------------

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  useEffect(() => clearLongPress, [clearLongPress]);

  const hitTest = useCallback(
    (clientX: number, clientY: number, fromZone: ZoneId, fromIndex: number): {over: {zone: ZoneId; index: number}; rejected: boolean} => {
      const fallback = {over: {zone: fromZone, index: fromIndex}, rejected: false};
      const dockEl = dockCardRef.current;
      if (dockEl != null) {
        const rect = dockEl.getBoundingClientRect();
        if (
          clientY >= rect.top - 8 &&
          clientY <= rect.bottom + 8 &&
          clientX >= rect.left &&
          clientX <= rect.right
        ) {
          const dockCount = orders.dock.filter(id => id !== dragId && id !== pressRef.current?.id).length;
          const currentDockCount = fromZone === 'dock' ? orders.dock.length - 1 : orders.dock.length;
          if (currentDockCount >= DOCK_CAPACITY) {
            // Full dock — origin gap stays; the drop will bounce.
            return {over: {zone: fromZone, index: fromIndex}, rejected: true};
          }
          const pitch = (rect.width - 24) / DOCK_CAPACITY;
          const index = clamp(Math.floor((clientX - rect.left - 12) / pitch), 0, Math.min(dockCount, DOCK_CAPACITY - 1));
          return {over: {zone: 'dock', index}, rejected: false};
        }
      }
      const gridEl = gridRef.current;
      if (gridEl != null) {
        const rect = gridEl.getBoundingClientRect();
        if (
          clientX >= rect.left - 8 &&
          clientX <= rect.right + 8 &&
          clientY >= rect.top - 24 &&
          clientY <= rect.bottom + 32
        ) {
          const gridCount =
            fromZone === 'grid' ? orders.grid.length - 1 : orders.grid.length;
          const rows = Math.max(1, Math.ceil((gridCount + 1) / COLS));
          const col = clamp(Math.floor((clientX - rect.left) / (cellW + GAP)), 0, COLS - 1);
          const row = clamp(Math.floor((clientY - rect.top) / (cellH + ROW_GAP)), 0, rows - 1);
          const index = clamp(row * COLS + col, 0, gridCount);
          return {over: {zone: 'grid', index}, rejected: false};
        }
      }
      return fallback;
    },
    [orders, dragId, cellW, cellH],
  );

  const onTilePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, id: string, zone: ZoneId, index: number) => {
      if (removingId != null) {
        return;
      }
      event.currentTarget.setPointerCapture(event.pointerId);
      suppressClickRef.current = false;
      pressRef.current = {
        id,
        zone,
        index,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        dragStarted: false,
        longPressFired: false,
        over: {zone, index},
        rejected: false,
      };
      setPressingId(id);
      if (!editMode) {
        clearLongPress();
        longPressTimer.current = window.setTimeout(() => {
          longPressTimer.current = null;
          const press = pressRef.current;
          if (press != null && press.id === id && !press.dragStarted) {
            press.longPressFired = true;
            enterEdit();
          }
        }, 450);
      }
    },
    [editMode, enterEdit, clearLongPress, removingId],
  );

  const onTilePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const press = pressRef.current;
      if (press == null || event.pointerId !== press.pointerId) {
        return;
      }
      const dx = event.clientX - press.startX;
      const dy = event.clientY - press.startY;
      const distance = Math.hypot(dx, dy);
      const inEdit = editMode || press.longPressFired;
      if (!press.dragStarted) {
        if (!inEdit) {
          if (distance > 8) {
            clearLongPress();
          }
          return;
        }
        if (distance > 6) {
          press.dragStarted = true;
          setPressingId(null);
          setMenuFor(null);
          setDrag({
            id: press.id,
            fromZone: press.zone,
            fromIndex: press.index,
            dx,
            dy,
            over: {zone: press.zone, index: press.index},
            rejected: false,
          });
        }
        return;
      }
      const hit = hitTest(event.clientX, event.clientY, press.zone, press.index);
      press.over = hit.over;
      press.rejected = hit.rejected;
      setDrag(prev =>
        prev == null ? prev : {...prev, dx, dy, over: hit.over, rejected: hit.rejected},
      );
    },
    [editMode, hitTest, clearLongPress],
  );

  const onTilePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const press = pressRef.current;
      if (press == null || event.pointerId !== press.pointerId) {
        return;
      }
      clearLongPress();
      setPressingId(null);
      pressRef.current = null;
      if (press.dragStarted) {
        // COMMIT the drop — press.over/rejected were written synchronously
        // on the last pointermove, so this never races a render flush.
        suppressClickRef.current = true; // capture keeps the click target
        setDrag(null);
        if (press.rejected) {
          setJustMoved({id: press.id, kind: 'shake'});
          pushToast(`Dock is full — ${DOCK_CAPACITY} apps max`, null);
          return;
        }
        const crossed = press.over.zone !== press.zone;
        const unchanged = !crossed && press.over.index === press.index;
        if (unchanged) {
          setJustMoved({id: press.id, kind: 'drop'});
          return;
        }
        commitMove(press.id, press.over.zone, press.over.index, crossed);
        return;
      }
      if (press.longPressFired) {
        suppressClickRef.current = true;
        return; // the hold itself entered wiggle mode; not a tap
      }
      suppressClickRef.current = true;
      if (editMode) {
        openMenu(press.id, press.zone, event.currentTarget);
        return;
      }
      // Demo affordance — a plain tap "opens" the app.
      pushToast(`Opened ${APP_BY_ID[press.id]?.name ?? press.id}`, null);
    },
    [editMode, clearLongPress, commitMove, openMenu, pushToast],
  );

  const onTilePointerCancel = useCallback(() => {
    clearLongPress();
    setPressingId(null);
    const press = pressRef.current;
    pressRef.current = null;
    if (press?.dragStarted) {
      setDrag(null);
      setJustMoved({id: press.id, kind: 'drop'});
    }
  }, [clearLongPress]);

  // Keyboard path — a click NOT preceded by our pointerup handling is
  // keyboard activation (Enter/Space) and mirrors the tap.
  const onTileClick = useCallback(
    (event: {currentTarget: HTMLButtonElement}, id: string, zone: ZoneId) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false; // pointer tap already handled
        return;
      }
      if (editMode) {
        openMenu(id, zone, event.currentTarget);
      } else {
        pushToast(`Opened ${APP_BY_ID[id]?.name ?? id}`, null);
      }
    },
    [editMode, openMenu, pushToast],
  );

  // TILE RENDER ---------------------------------------------------------------

  const wiggleClass = (index: number): string =>
    index % 2 === 0 ? 'wge-wiggle-a' : 'wge-wiggle-b';

  const renderTile = (
    id: string,
    zone: ZoneId,
    index: number,
    pos: {x: number; y: number},
    isDragTile: boolean,
  ): ReactNode => {
    const app = APP_BY_ID[id];
    if (app == null) {
      return null;
    }
    const removing = removingId === id;
    const moved = justMoved?.id === id ? justMoved : null;
    const wiggling =
      editMode && !reducedMotion && !isDragTile && !removing && moved == null;
    const outerX = isDragTile && drag != null ? pos.x + drag.dx : pos.x;
    const outerY = isDragTile && drag != null ? pos.y + drag.dy : pos.y;
    const outerClass = isDragTile
      ? 'wge-dragging'
      : moved?.kind === 'drop' || moved?.kind === 'shake'
        ? 'wge-drop'
        : 'wge-slot';
    let innerClass = '';
    if (wiggling) {
      innerClass = wiggleClass(index);
    } else if (removing) {
      innerClass = 'wge-remove-out';
    } else if (moved?.kind === 'shake') {
      innerClass = 'wge-shake';
    } else if (moved?.kind === 'pop' && !reducedMotion) {
      innerClass = 'wge-pop';
    } else if (settling) {
      innerClass = 'wge-settle';
    }
    const pressing = pressingId === id && !editMode;
    const tileW = zone === 'grid' ? cellW : iconSize;
    const tileH = zone === 'grid' ? cellH : iconSize;
    const inset = zone === 'grid' ? iconInset : 0;
    const badgeLabel = app.badge != null ? `, ${app.badge} unread` : '';
    const editLabel = editMode ? ' — opens move options' : '';
    return (
      <div
        key={id}
        className={outerClass}
        style={{
          ...styles.tileWrap,
          width: tileW,
          height: tileH,
          transform: `translate(${outerX}px, ${outerY}px)`,
          zIndex: isDragTile ? 50 : moved != null ? 5 : undefined,
        }}>
        <div
          className={innerClass}
          onAnimationEnd={event => {
            if (event.animationName === 'wge-remove-out') {
              commitRemove(id);
            }
          }}
          style={{width: '100%', height: '100%'}}>
          <button
            type="button"
            className="wge-btn wge-focusable"
            aria-label={`${app.name}${badgeLabel}${editLabel}`}
            style={{
              ...styles.tileBtn,
              touchAction: editMode ? 'none' : 'pan-y',
            }}
            onPointerDown={event => onTilePointerDown(event, id, zone, index)}
            onPointerMove={onTilePointerMove}
            onPointerUp={onTilePointerUp}
            onPointerCancel={onTilePointerCancel}
            onClick={event => onTileClick(event, id, zone)}>
            <span
              aria-hidden="true"
              style={{
                ...styles.tileIcon,
                width: iconSize,
                height: iconSize,
                borderRadius: iconRadius,
                background: artGradient(app.hue),
                fontSize: Math.round(iconSize * 0.32),
                transform: isDragTile
                  ? 'scale(1.08)'
                  : pressing
                    ? 'scale(0.94)'
                    : undefined,
                boxShadow: isDragTile ? '0 12px 28px var(--color-shadow)' : undefined,
                transition: 'transform 160ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}>
              {app.mono}
            </span>
            {zone === 'grid' ? (
              <span aria-hidden="true" style={{...styles.tileLabel, display: 'block'}}>
                {app.name}
              </span>
            ) : null}
          </button>
          {app.badge != null && !editMode ? (
            <span
              aria-hidden="true"
              style={{...styles.badge, top: -6, right: inset - 6}}>
              {app.badge}
            </span>
          ) : null}
          {editMode && !isDragTile ? (
            <button
              type="button"
              className={`wge-btn wge-focusable${reducedMotion ? '' : ' wge-chip-in'}`}
              aria-label={`Remove ${app.name}`}
              style={{...styles.chipBtn, top: -14, left: inset - 14}}
              onClick={() => requestRemove(id)}>
              <span aria-hidden="true" style={styles.chipCircle}>
                <Icon icon={MinusIcon} size="sm" color="inherit" />
              </span>
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  // MOVE SHEET rows -------------------------------------------------------------

  const renderMenu = (): ReactNode => {
    if (menuFor == null) {
      return null;
    }
    const app = APP_BY_ID[menuFor.id];
    if (app == null) {
      return null;
    }
    const zone = menuFor.zone;
    const order = zone === 'grid' ? orders.grid : orders.dock;
    const index = order.indexOf(menuFor.id);
    if (index < 0) {
      return null;
    }
    const length = order.length;
    const dockFull = orders.dock.length >= DOCK_CAPACITY;
    interface MenuRow {
      key: string;
      label: string;
      glyph: typeof ArrowUpIcon;
      disabled: boolean;
      danger?: boolean;
      onSelect: () => void;
    }
    const move = (to: ZoneId, toIndex: number, crossed: boolean) => {
      commitMove(menuFor.id, to, toIndex, crossed);
      closeMenu();
    };
    const rows: MenuRow[] =
      zone === 'grid'
        ? [
            {key: 'left', label: 'Move left', glyph: ArrowLeftIcon, disabled: index === 0, onSelect: () => move('grid', index - 1, false)},
            {key: 'right', label: 'Move right', glyph: ArrowRightIcon, disabled: index >= length - 1, onSelect: () => move('grid', index + 1, false)},
            {key: 'up', label: 'Move up a row', glyph: ArrowUpIcon, disabled: index < COLS, onSelect: () => move('grid', index - COLS, false)},
            {key: 'down', label: 'Move down a row', glyph: ArrowDownIcon, disabled: index + COLS > length - 1, onSelect: () => move('grid', index + COLS, false)},
            {key: 'dock', label: dockFull ? 'Move to dock (dock is full)' : 'Move to dock', glyph: ArrowDownToLineIcon, disabled: dockFull, onSelect: () => move('dock', orders.dock.length, true)},
            {key: 'remove', label: 'Remove from Home', glyph: Trash2Icon, disabled: false, danger: true, onSelect: () => requestRemove(menuFor.id)},
          ]
        : [
            {key: 'left', label: 'Move left', glyph: ArrowLeftIcon, disabled: index === 0, onSelect: () => move('dock', index - 1, false)},
            {key: 'right', label: 'Move right', glyph: ArrowRightIcon, disabled: index >= length - 1, onSelect: () => move('dock', index + 1, false)},
            {key: 'grid', label: 'Move to grid', glyph: ArrowUpFromLineIcon, disabled: false, onSelect: () => move('grid', orders.grid.length, true)},
            {key: 'remove', label: 'Remove from Home', glyph: Trash2Icon, disabled: false, danger: true, onSelect: () => requestRemove(menuFor.id)},
          ];
    return (
      <>
        <button
          type="button"
          className="wge-btn"
          aria-label="Close move options"
          style={styles.sheetScrim}
          onClick={closeMenu}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Move ${app.name}`}
          className={reducedMotion ? undefined : 'wge-sheet-in'}
          style={styles.sheetWrapOuter}>
          <div style={styles.sheetCard}>
            <div style={styles.sheetHeader}>
              <span
                aria-hidden="true"
                style={{...styles.sheetHeaderIcon, background: artGradient(app.hue)}}>
                {app.mono}
              </span>
              <span style={styles.sheetHeaderText}>
                <h2 style={styles.sheetHeaderName}>{app.name}</h2>
                <span style={styles.sheetHeaderMeta}>
                  {zone === 'grid'
                    ? `Grid · slot ${index + 1} of ${length}`
                    : `Dock · slot ${index + 1} of ${length}`}
                </span>
              </span>
            </div>
            {rows.map((row, rowIndex) => (
              <div key={row.key}>
                {rowIndex > 0 ? <div style={styles.sheetHairline} /> : null}
                <button
                  type="button"
                  className="wge-btn wge-focusable"
                  disabled={row.disabled}
                  style={{
                    ...styles.sheetRow,
                    ...(row.disabled ? styles.sheetRowDisabled : null),
                    ...(row.danger ? styles.sheetRowDanger : null),
                  }}
                  onClick={row.onSelect}>
                  <span
                    style={{
                      ...styles.sheetRowGlyph,
                      ...(row.danger ? styles.sheetRowGlyphDanger : null),
                    }}>
                    <Icon icon={row.glyph} size="sm" color="inherit" />
                  </span>
                  {row.label}
                </button>
              </div>
            ))}
          </div>
          <div style={styles.sheetCard}>
            <button
              type="button"
              ref={menuCancelRef}
              className="wge-btn wge-focusable"
              style={styles.sheetCancel}
              onClick={closeMenu}>
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  };

  // COMPOSITION -----------------------------------------------------------------

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const dockHoverIndex =
    drag != null && !drag.rejected && drag.over.zone === 'dock' ? drag.over.index : null;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{WGE_CSS}</style>
      <div style={shellStyle}>
        <h1 className="wge-vh">Slate — Home screen grid editor</h1>
        {/* NAV BAR — Edit/Done is the 44px button path into wiggle mode. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.brandSeat}>
              <span aria-hidden="true" style={styles.brandMark}>
                <Icon icon={LayoutGridIcon} size="sm" color="inherit" />
              </span>
            </span>
          </div>
          <p style={styles.navTitle}>Home</p>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="wge-btn wge-focusable"
              style={{...styles.editBtn, ...(editMode ? styles.editBtnActive : null)}}
              aria-pressed={editMode}
              onClick={() => (editMode ? exitEdit() : enterEdit())}>
              {editMode ? 'Done' : 'Edit'}
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {/* Derived caption — all three counts flow from orders state. */}
          <div style={styles.captionRow}>
            <span style={styles.captionText}>
              {totalApps} apps · {unreadTotal} unread ·{' '}
              {dockFree === 1 ? '1 dock slot free' : `${dockFree} dock slots free`}
            </span>
          </div>

          {/* THE GRID — slot-index model; absolute tiles, transform layout. */}
          <div
            ref={gridRef}
            style={{
              ...styles.gridCanvas,
              height: gridHeight,
              zIndex: drag?.fromZone === 'grid' ? 30 : undefined,
            }}>
            {displayGrid.map((id, index) =>
              id == null ? null : renderTile(id, 'grid', index, gridPos(index), false),
            )}
            {drag != null && drag.fromZone === 'grid'
              ? renderTile(drag.id, 'grid', drag.fromIndex, gridPos(drag.fromIndex), true)
              : null}
          </div>

          {/* Page dots — decorative launcher fixture. */}
          <div aria-hidden="true" style={styles.dotsRow}>
            <span style={{...styles.dot, ...styles.dotActive}} />
            <span style={styles.dot} />
            <span style={styles.dot} />
          </div>

          <p style={styles.hintCaption}>
            {editMode
              ? 'Drag tiles to reorder or into the dock · tap a tile for move options'
              : 'Hold any icon to enter wiggle mode'}
          </p>
        </main>

        {/* DOCK + TOAST — the sticky bottom dock wrapper. */}
        <div style={styles.dockWrap}>
          {/* ONE polite toast — a new toast replaces the old; Undo is real. */}
          <div
            role="status"
            aria-live="polite"
            style={{...styles.toastRegion, bottom: dockCardH + 12}}>
            {toast != null ? (
              <div
                key={toast.seq}
                className={reducedMotion ? undefined : 'wge-toast-in'}
                style={styles.toast}>
                <span style={styles.toastText}>{toast.text}</span>
                {toast.undoOrders != null ? (
                  <>
                    <span style={styles.toastHairline} />
                    <button
                      type="button"
                      className="wge-btn wge-focusable"
                      style={styles.toastUndo}
                      onClick={undoToast}>
                      Undo
                    </button>
                  </>
                ) : (
                  <span style={styles.toastPad} />
                )}
              </div>
            ) : null}
          </div>
          <div
            ref={dockCardRef}
            style={{
              ...styles.dockCard,
              height: dockCardH,
              ...(drag?.rejected
                ? {borderColor: 'var(--color-error)'}
                : null),
            }}>
            {/* 4 slot hints under the tiles; hovered slot highlights. */}
            {Array.from({length: DOCK_CAPACITY}, (_, slotIndex) => {
              const pos = dockPos(slotIndex);
              return (
                <span
                  key={`hint-${slotIndex}`}
                  aria-hidden="true"
                  style={{
                    ...styles.dockSlotHint,
                    ...(dockHoverIndex === slotIndex ? styles.dockSlotHintActive : null),
                    width: iconSize,
                    height: iconSize,
                    borderRadius: iconRadius,
                    left: pos.x,
                    top: pos.y,
                  }}
                />
              );
            })}
            {displayDock.map((id, index) =>
              id == null ? null : renderTile(id, 'dock', index, dockPos(index), false),
            )}
            {drag != null && drag.fromZone === 'dock'
              ? renderTile(drag.id, 'dock', drag.fromIndex, dockPos(drag.fromIndex), true)
              : null}
          </div>
        </div>

        {renderMenu()}
      </div>
    </div>
  );
}
