// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Moonrise lock surface frozen at
 *   9:41 on Friday, July 10 (2026-07-10 IS a Friday): 6 notifications
 *   across 2 apps — Relay (team chat) 4 + Doorstep (deliveries) 2 = 6 ✓;
 *   unread rl4 + rl3 + ds2 = 3 dots; Relay times descend 9:36 > 9:28 >
 *   9:12 > 8:47 and Doorstep 9:31 > Yesterday. No Date.now(), no
 *   Math.random(), no network media (app art = hue-gradient tiles +
 *   monograms). Timers are choreography only (fan/collapse/dismiss
 *   settle), all cleaned up in effects and on Reset.
 * @output Moonrise — Notification Stack: a 390px MOBILE lock-screen
 *   notification choreography demo. NavBar (moon mark · 'Moonrise' ·
 *   Reset) over a dusk wallpaper gradient with the clock fixture (date
 *   line, 64px '9:41', Sleep-focus chip). Bottom-anchored COLLAPSED STACK:
 *   front card full, two peek layers behind at scale .96/.92 with
 *   translateY 10/20, count chip '6 notifications'. Tapping the stack
 *   FANS OUT the full grouped list (2 app sections, per-card 45ms stagger
 *   on a 320ms overshoot spring). Swiping a card left follows the finger
 *   (pointer capture, translateX only); past 96px a clear affordance arms
 *   (rest chip → error fill + pop); release past it slides the card out
 *   -110% while the survivors close the gap with a FLIP transform pass —
 *   the 44×44 '×' on every card is the mandatory button path. 'Clear All'
 *   collapses survivors back toward the stack anchor with REVERSE 45ms
 *   stagger (per-card --lsk-dy measured at click) then leaves a 'No
 *   notifications' card that settles in with a spring; 'Show less'
 *   re-stacks without clearing. Every outcome (cleared / restored / all
 *   cleared) announces through the single polite toast dock; single
 *   dismissals get a one-deep Undo that FLIPs survivors back down.
 * @position Page template; emitted by `astryx template mobile-lockscreen-stack`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no fake OS chrome — the 52px sticky
 *   navBar at y=0 is the first pixel; the '9:41' clock is page CONTENT,
 *   a lock-screen fixture, not simulated chrome). No sheets/menus on this
 *   surface, so the shell never needs the scroll lock; position:fixed is
 *   banned regardless. ONE polite toast dock (aria-live) rides a sticky
 *   bottom:0 wrapper at bottom:16 (no tabBar here); a new toast REPLACES
 *   the old.
 * Animation contract: transform + opacity ONLY. Fan-out = per-card
 *   `lsk-fan-in` (translateY/scale spring, cubic-bezier(0.34,1.56,0.64,1),
 *   animation-fill-mode:backwards so staggered cards hold their hidden
 *   start without a forwards fill ever overriding inline drag transforms).
 *   Dismiss = transition to translateX(-110%)+opacity 0 with the
 *   decelerate bezier cubic-bezier(0.22,1,0.36,1); gap-close + Undo
 *   re-entry = FLIP (measure tops before commit, inverse translateY, rAF
 *   to identity). Clear All = per-card `--lsk-dy` keyframe to the stack
 *   anchor, reverse stagger, forwards fill (cards end hidden). Reduced
 *   motion (matchMedia read once in an effect + change listener): fan-out
 *   /dismiss/collapse become INSTANT state swaps with 160ms opacity fades
 *   (CSS media block is the backstop); the swipe still tracks but commits
 *   instantly; no FLIP passes.
 * Color policy: token-pure chrome. THE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#4F46E5, #A5B4FC) — #4F46E5 text/dot on the
 *   white card ≈ 6.3:1; #A5B4FC on the ~#1C1C1E dark card ≈ 8.4:1; both
 *   clear 4.5:1 text and 3:1 fill bars. Sanctioned non-brand literals
 *   (math at each declaration): the WALLPAPER dusk gradient (fixture art,
 *   identical in both schemes, lightest stop 26% ⇒ all overlay text ≥
 *   6:1), WALLPAPER_TEXT/_DIM whites, the rgba white chip fills (≥3:1
 *   blended vs the darkest wallpaper region they sit on), the armed
 *   dismiss affordance pair (#FF6B6B vs wallpaper ≈ 3.8:1; #3B0A0A glyph
 *   on #FF6B6B ≈ 5.5:1), white focus rings for on-wallpaper controls, and
 *   the app-tile art gradients (white monograms ≥ 4.6:1, exemplar math).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px
 *   section gaps · 8px chip gaps; navBar 52px sticky z20 with hairline;
 *   cards 12px radius (14 on the lock cards — still the inset-grouped
 *   card grammar), 1px border; 40px app tiles; TYPE (Figtree): 64/700
 *   clock · 17/600 nav title · 16/600 card titles · 13 body/meta · 11/600
 *   uppercase section eyebrows; nothing under 11px; tabular-nums on every
 *   count and time. Touch law: stack button, ×, Clear All, Show less,
 *   Reset, Restore, toast actions all ≥44×44 (compact visuals reach 44
 *   via padding/negative-margin seats).
 *
 * Responsive contract:
 * - Fluid 320–430: cards are width-fluid (minWidth 0, 1-line title
 *   ellipsis + 2-line body clamp); clock and stack center; the count chip
 *   never wraps. overflowX:'clip' backstop.
 * - Desktop stage (>560px container width via useElementWidth — the demo
 *   inline stage is ~1045px so viewport queries cannot be trusted there):
 *   the shell renders as a centered 430px phone column with hairline
 *   borderInline on a var(--color-background-muted) backdrop; never a
 *   stretched relayout.
 */

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {MoonStarIcon, RotateCcwIcon, XIcon} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, math at each declaration.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Moonrise indigo). #4F46E5 on the white
// card ≈ 6.3:1 (text + unread dots + focus rings on cards); #A5B4FC on the
// ~#1C1C1E dark card ≈ 8.4:1. Both ≥3:1 as bare dot fills too.
const BRAND_ACCENT = 'light-dark(#4F46E5, #A5B4FC)';
// WALLPAPER — fixture art (same literal gradient in both schemes; it reads
// as a lock-screen wallpaper, not chrome). Stops at 26% / 16% / 11%
// lightness ⇒ relative luminance ≤ ~0.05 everywhere.
const WALLPAPER =
  'linear-gradient(166deg, hsl(254 42% 26%) 0%, hsl(226 48% 16%) 52%, hsl(204 55% 11%) 100%)';
// Soft white over the wallpaper: vs the lightest stop (hsl(254 42% 26%),
// luminance ≈ 0.045) ≈ 10:1; vs the darkest ≈ 15:1.
const WALLPAPER_TEXT = '#F4F1FF';
// Dimmed white for date / captions — 78% alpha blend over the lightest
// stop ≈ 7:1, still ≥4.5:1 at the 11px floor.
const WALLPAPER_TEXT_DIM = 'rgba(244, 241, 255, 0.78)';
// Translucent chip fill on the wallpaper (count chip, Clear All, focus
// chip): 12% white blended over luminance 0.045 ≈ 0.16 ⇒ WALLPAPER_TEXT on
// it ≈ 5.0:1; the fill itself vs wallpaper is decorative (text carries).
const WALLPAPER_CHIP = 'rgba(255, 255, 255, 0.12)';
// Dismiss affordance REST chip — 20% white blend ≈ luminance 0.24 ⇒ ≈3.0:1
// vs the wallpaper it floats on (meaningful mid-gesture state, ≥3:1).
const AFFORDANCE_REST = 'rgba(255, 255, 255, 0.20)';
// Dismiss affordance ARMED fill — #FF6B6B (luminance ≈ 0.31) vs wallpaper
// ≈ 3.8:1; glyph #3B0A0A on #FF6B6B ≈ 5.5:1. The wallpaper is dark in BOTH
// schemes (it is art), so a single pair is correct here.
const AFFORDANCE_ARMED = '#FF6B6B';
const AFFORDANCE_ARMED_GLYPH = '#3B0A0A';
// Focus ring for on-wallpaper controls — white on the dark art ≥ 10:1.
const WALLPAPER_RING = '#F4F1FF';
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;

// App tile art — id-derived hue gradient, white monogram on 40%/26%
// lightness stops ≈ 4.6:1+ in both schemes (poster art, not chrome).
function artGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 45% 40%), hsl(${(hue + 40) % 360} 55% 26%))`;
}

// ---------------------------------------------------------------------------
// CHOREOGRAPHY CONSTANTS
// ---------------------------------------------------------------------------

const FAN_STAGGER_MS = 45;
const COLLAPSE_MS = 300;
const COLLAPSE_STAGGER_MS = 45;
const DISMISS_MS = 240;
const SETTLE_MS = 340;
const DISMISS_PX = 96; // armed threshold
const MAX_DRAG_LEFT = -320;

// ---------------------------------------------------------------------------
// INJECTED CSS — unique `lsk-` prefix. Transform/opacity only. `lsk-fan-in`
// uses fill-mode BACKWARDS (staggered hidden start) and never a forwards
// fill, so completed entries cannot override inline drag transforms.
// `lsk-collapse` is declared AFTER `lsk-fan-in` so adding it swaps the
// running animation on the same element. Reduced-motion media block is the
// CSS backstop for the JS matchMedia branch.
// ---------------------------------------------------------------------------

const LSK_CSS = `
.lsk-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.lsk-btn:disabled { cursor: default; }
.lsk-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.lsk-focusable-light:focus-visible {
  outline: 2px solid ${WALLPAPER_RING};
  outline-offset: 2px;
}
.lsk-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.lsk-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@keyframes lsk-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes lsk-fan-in {
  from { transform: translateY(-16px) scale(0.94); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.lsk-fan-in { animation: lsk-fan-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
@keyframes lsk-settle {
  from { transform: translateY(12px) scale(0.94); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.lsk-settle { animation: lsk-settle ${SETTLE_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
@keyframes lsk-collapse {
  to { transform: translateY(var(--lsk-dy, -24px)) scale(0.92); opacity: 0; }
}
.lsk-collapse { animation: lsk-collapse ${COLLAPSE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.lsk-springback { transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.lsk-dismissing {
  transition:
    transform ${DISMISS_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity ${DISMISS_MS}ms cubic-bezier(0.22, 1, 0.36, 1);
}
.lsk-hdr-out { opacity: 0; transition: opacity 200ms ease; }
.lsk-toast-in { animation: lsk-fade-in 180ms ease both; }
.lsk-affordance { transition: background-color 120ms ease, color 120ms ease; }
@media (prefers-reduced-motion: reduce) {
  .lsk-fan-in, .lsk-settle { animation: lsk-fade-in 160ms ease backwards; }
  .lsk-collapse { animation: lsk-fade-in 160ms ease reverse forwards; }
  .lsk-springback, .lsk-dismissing, .lsk-affordance { transition: none; }
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
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, hairline, blur surface.
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0, paddingInlineStart: 8},
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
  // WALLPAPER — the lock surface fills the rest of the shell.
  wallpaper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: WALLPAPER,
  },
  // CLOCK FIXTURE — page content, not simulated OS chrome.
  clockZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    paddingTop: 36,
    paddingInline: 16,
  },
  clockDate: {
    fontSize: 16,
    fontWeight: 500,
    color: WALLPAPER_TEXT_DIM,
  },
  clockTime: {
    fontSize: 64,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    color: WALLPAPER_TEXT,
    fontVariantNumeric: 'tabular-nums',
  },
  focusChip: {
    marginTop: 10,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    background: WALLPAPER_CHIP,
    color: WALLPAPER_TEXT,
    fontSize: 13,
    fontWeight: 500,
  },
  // STACK / LIST / EMPTY zones — bottom-anchored lock-screen geometry.
  bottomZone: {
    marginTop: 'auto',
    padding: '24px 16px 28px',
    display: 'flex',
    flexDirection: 'column',
  },
  countChipRow: {display: 'flex', justifyContent: 'center', marginBottom: 12},
  countChip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    background: WALLPAPER_CHIP,
    color: WALLPAPER_TEXT,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  stackBtn: {display: 'block', width: '100%', borderRadius: 14},
  stackWrap: {position: 'relative'},
  stackFront: {position: 'relative', zIndex: 2},
  // Peek layers — scale .96 / .92 + translateY 10 / 20 per the spec.
  stackPeek1: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    transform: 'translateY(10px) scale(0.96)',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 14,
  },
  stackPeek2: {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    transform: 'translateY(20px) scale(0.92)',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 14,
  },
  stackHint: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: WALLPAPER_TEXT_DIM,
  },
  // LIST header row — count · Show less · Clear All (all 44px targets).
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    marginBottom: 4,
  },
  listHeaderCount: {
    fontSize: 13,
    fontWeight: 600,
    color: WALLPAPER_TEXT,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  listHeaderSpacer: {flex: 1},
  showLessBtn: {
    height: 44,
    paddingInline: 8,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: WALLPAPER_TEXT_DIM,
    whiteSpace: 'nowrap',
  },
  clearAllBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 999,
    paddingInline: 4,
  },
  clearAllPill: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 14,
    borderRadius: 999,
    background: WALLPAPER_CHIP,
    color: WALLPAPER_TEXT,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  sections: {display: 'flex', flexDirection: 'column', gap: 24},
  sectionCards: {display: 'flex', flexDirection: 'column', gap: 12},
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 28,
    paddingInline: 4,
    marginBottom: 8,
  },
  sectionTile: {
    width: 20,
    height: 20,
    borderRadius: 6,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 700,
    flexShrink: 0,
  },
  sectionName: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: WALLPAPER_TEXT,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: 600,
    color: WALLPAPER_TEXT_DIM,
    fontVariantNumeric: 'tabular-nums',
  },
  // CARD — cardOuter is the FLIP target and hosts the affordance layer.
  cardOuter: {position: 'relative'},
  affordance: {
    position: 'absolute',
    top: '50%',
    right: 14,
    zIndex: 0,
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    gap: 10,
    padding: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 14,
    touchAction: 'pan-y',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  appTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 700,
    flexShrink: 0,
  },
  cardTextCol: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  cardTopRow: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  cardTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    flexShrink: 0,
  },
  cardTime: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 1.4,
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  clearBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
    alignSelf: 'flex-start',
    margin: '-8px -8px -8px -4px',
  },
  // EMPTY — settle card after Clear All / last dismissal.
  emptyCard: {
    marginInline: 'auto',
    maxWidth: 280,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '20px 24px 8px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    textAlign: 'center',
  },
  emptyCircle: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 8,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: 0},
  emptyRestoreBtn: {
    height: 44,
    paddingInline: 12,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // TOAST DOCK — sticky bottom:0 wrapper, live region at bottom:16.
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
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastAction: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
};

// ---------------------------------------------------------------------------
// DATA — frozen at 9:41, Friday, July 10 (2026). 4 Relay + 2 Doorstep = 6;
// unread rl4 + rl3 + ds2 = 3 dots.
// ---------------------------------------------------------------------------

const CLOCK_TIME = '9:41';
const CLOCK_DATE = 'Friday, July 10';

interface AppFixture {
  id: string;
  name: string;
  hue: number;
  mono: string;
}

const APPS: AppFixture[] = [
  {id: 'relay', name: 'Relay', hue: 212, mono: 'R'},
  {id: 'doorstep', name: 'Doorstep', hue: 32, mono: 'D'},
];

const APP_BY_ID: Record<string, AppFixture> = Object.fromEntries(APPS.map(app => [app.id, app]));

interface Notif {
  id: string;
  appId: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

// Grouped order (Relay newest-first, then Doorstep) — the stack front card
// is INITIAL_NOTIFS[0], the 9:36 Maya Chen message.
const INITIAL_NOTIFS: Notif[] = [
  {id: 'rl4', appId: 'relay', title: 'Maya Chen', body: 'Can you re-run the staging deploy before standup? The banner build is stale.', time: '9:36', unread: true},
  {id: 'rl3', appId: 'relay', title: '#launch-room · 3 new', body: 'Devon: Banner copy is approved — shipping the toggle at noon.', time: '9:28', unread: true},
  {id: 'rl2', appId: 'relay', title: 'Priya Nair', body: 'Sent the revised onboarding flow — only two screens changed this pass.', time: '9:12', unread: false},
  {id: 'rl1', appId: 'relay', title: 'Weekly digest ready', body: '14 threads you follow had activity yesterday.', time: '8:47', unread: false},
  {id: 'ds2', appId: 'doorstep', title: 'Out for delivery', body: 'Package #4812 (ceramic planter) is 6 stops away.', time: '9:31', unread: true},
  {id: 'ds1', appId: 'doorstep', title: 'Left at your door', body: 'Photo confirmation added for yesterday’s delivery.', time: 'Yesterday', unread: false},
];

// ---------------------------------------------------------------------------
// ONE STATE OWNER — stackStore. Counts (chip, header, sections) all derive
// from the notifs array; there are no parallel literals.
// ---------------------------------------------------------------------------

type Phase = 'stack' | 'list' | 'collapsing' | 'empty';

interface StackStore {
  notifs: Notif[];
  phase: Phase;
  fanSeq: number; // re-keys cards so fan-in replays on each expand
  stackSeq: number; // re-keys the stack/empty block for the settle pop
  dismissingIds: string[];
  collapseDys: Record<string, number>; // measured --lsk-dy per card
  lastDismissed: {notif: Notif; index: number} | null; // one-deep Undo
  toast: {seq: number; text: string; undoable: boolean} | null;
}

const INITIAL_STORE: StackStore = {
  notifs: INITIAL_NOTIFS,
  phase: 'stack',
  fanSeq: 0,
  stackSeq: 0,
  dismissingIds: [],
  collapseDys: {},
  lastDismissed: null,
  toast: null,
};

interface DragState {
  id: string;
  startX: number;
  dx: number;
  mode: 'drag' | 'settle';
}

// ---------------------------------------------------------------------------
// HOOKS
// ---------------------------------------------------------------------------

/** Container-width hook — the demo's inline stage is ~1045px inside a
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

/** MANDATORY reduced-motion read — matchMedia once in an effect, with a
 * change listener. When true, fan/dismiss/collapse become instant state
 * swaps (opacity-only via the CSS backstop). */
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

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileLockscreenStackTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  // Batch-3 contract: >560px container ⇒ centered phone column.
  const isDesktopColumn = wrapWidth > 560;
  const reducedMotion = useReducedMotion();

  const [store, setStore] = useState<StackStore>(INITIAL_STORE);
  const [drag, setDrag] = useState<DragState | null>(null);

  // FLIP + choreography plumbing.
  const rowRefs = useRef<Map<string, HTMLElement>>(new Map());
  const prevTopsRef = useRef<Map<string, number> | null>(null);
  const dismissTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = useCallback(() => {
    dismissTimersRef.current.forEach(timer => clearTimeout(timer));
    dismissTimersRef.current.clear();
    if (collapseTimerRef.current != null) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    if (settleTimerRef.current != null) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearAllTimers, [clearAllTimers]);

  const registerRow = useCallback((key: string) => {
    return (element: HTMLElement | null) => {
      if (element == null) {
        rowRefs.current.delete(key);
      } else {
        rowRefs.current.set(key, element);
      }
    };
  }, []);

  /** Snapshot current row tops just before a list mutation (FLIP "First"). */
  const captureTops = useCallback((excludeId?: string) => {
    const tops = new Map<string, number>();
    rowRefs.current.forEach((element, key) => {
      if (key === excludeId) return;
      tops.set(key, element.getBoundingClientRect().top);
    });
    prevTopsRef.current = tops;
  }, []);

  // FLIP "Last/Invert/Play" — survivors glide to their new tops with a
  // transform-only transition (gap-close on dismiss, shift-down on Undo).
  useLayoutEffect(() => {
    const prevTops = prevTopsRef.current;
    prevTopsRef.current = null;
    if (prevTops == null || reducedMotion) return;
    const moved: HTMLElement[] = [];
    rowRefs.current.forEach((element, key) => {
      const before = prevTops.get(key);
      if (before == null) return;
      const delta = before - element.getBoundingClientRect().top;
      if (Math.abs(delta) < 1) return;
      element.style.transition = 'none';
      element.style.transform = `translateY(${delta}px)`;
      moved.push(element);
    });
    if (moved.length === 0) return;
    requestAnimationFrame(() => {
      moved.forEach(element => {
        element.style.transition = 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)';
        element.style.transform = '';
      });
    });
  }, [store.notifs, reducedMotion]);

  const toastSeq = (prev: StackStore) => (prev.toast?.seq ?? 0) + 1;

  // VERBS ---------------------------------------------------------------

  const expandStack = useCallback(() => {
    setStore(prev =>
      prev.phase === 'stack'
        ? {...prev, phase: 'list', fanSeq: prev.fanSeq + 1}
        : prev,
    );
  }, []);

  const showLess = useCallback(() => {
    setDrag(null);
    setStore(prev =>
      prev.phase === 'list'
        ? {...prev, phase: 'stack', stackSeq: prev.stackSeq + 1}
        : prev,
    );
  }, []);

  const finalizeDismiss = useCallback((id: string) => {
    setStore(prev => {
      const index = prev.notifs.findIndex(notif => notif.id === id);
      if (index < 0) return prev;
      const notif = prev.notifs[index];
      const notifs = prev.notifs.filter(candidate => candidate.id !== id);
      return {
        ...prev,
        notifs,
        dismissingIds: prev.dismissingIds.filter(candidate => candidate !== id),
        lastDismissed: {notif, index},
        phase: notifs.length === 0 ? 'empty' : prev.phase,
        stackSeq: notifs.length === 0 ? prev.stackSeq + 1 : prev.stackSeq,
        toast: {seq: toastSeq(prev), text: 'Notification cleared', undoable: true},
      };
    });
  }, []);

  /** Swipe past 96px and the 44×44 × button commit through the SAME path. */
  const beginDismiss = useCallback(
    (id: string) => {
      if (dismissTimersRef.current.has(id)) return;
      if (reducedMotion) {
        // Reduced motion: instant removal, no slide-out, no FLIP.
        finalizeDismiss(id);
        return;
      }
      setStore(prev =>
        prev.dismissingIds.includes(id)
          ? prev
          : {...prev, dismissingIds: [...prev.dismissingIds, id]},
      );
      const timer = setTimeout(() => {
        dismissTimersRef.current.delete(id);
        captureTops(id);
        finalizeDismiss(id);
      }, DISMISS_MS + 20);
      dismissTimersRef.current.set(id, timer);
    },
    [captureTops, finalizeDismiss, reducedMotion],
  );

  const undoDismiss = useCallback(() => {
    if (!reducedMotion) captureTops();
    setStore(prev => {
      const last = prev.lastDismissed;
      if (last == null) return prev;
      const notifs = [...prev.notifs];
      notifs.splice(Math.min(last.index, notifs.length), 0, last.notif);
      return {
        ...prev,
        notifs,
        lastDismissed: null,
        phase: prev.phase === 'empty' ? 'list' : prev.phase,
        toast: {seq: toastSeq(prev), text: 'Notification restored', undoable: false},
      };
    });
  }, [captureTops, reducedMotion]);

  const clearAll = useCallback(() => {
    setDrag(null);
    if (reducedMotion) {
      setStore(prev =>
        prev.notifs.length === 0
          ? prev
          : {
              ...prev,
              notifs: [],
              phase: 'empty',
              stackSeq: prev.stackSeq + 1,
              dismissingIds: [],
              collapseDys: {},
              lastDismissed: null,
              toast: {seq: toastSeq(prev), text: 'All notifications cleared', undoable: false},
            },
      );
      return;
    }
    // Measure each card's translateY back to the stack anchor (first card).
    const firstId = store.notifs[0]?.id;
    const anchor = firstId != null ? rowRefs.current.get(firstId) : undefined;
    const anchorTop = anchor?.getBoundingClientRect().top ?? 0;
    const collapseDys: Record<string, number> = {};
    store.notifs.forEach(notif => {
      const element = rowRefs.current.get(notif.id);
      collapseDys[notif.id] =
        element == null ? -24 : anchorTop - element.getBoundingClientRect().top;
    });
    const count = store.notifs.length;
    setStore(prev => ({...prev, phase: 'collapsing', collapseDys}));
    collapseTimerRef.current = setTimeout(
      () => {
        collapseTimerRef.current = null;
        setStore(prev => ({
          ...prev,
          notifs: [],
          phase: 'empty',
          stackSeq: prev.stackSeq + 1,
          dismissingIds: [],
          collapseDys: {},
          lastDismissed: null,
          toast: {seq: toastSeq(prev), text: 'All notifications cleared', undoable: false},
        }));
      },
      COLLAPSE_MS + Math.max(0, count - 1) * COLLAPSE_STAGGER_MS + 100,
    );
  }, [reducedMotion, store.notifs]);

  const resetAll = useCallback(() => {
    clearAllTimers();
    setDrag(null);
    setStore(prev => ({
      ...INITIAL_STORE,
      fanSeq: prev.fanSeq + 1,
      stackSeq: prev.stackSeq + 1,
      toast: {
        seq: toastSeq(prev),
        text: `${INITIAL_NOTIFS.length} notifications restored`,
        undoable: false,
      },
    }));
  }, [clearAllTimers]);

  // GESTURE — pointer-captured left swipe, inline translateX during drag,
  // spring settle or dismiss commit on release.
  const canDrag = store.phase === 'list';

  const onCardPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
      if (!canDrag || store.dismissingIds.includes(id)) return;
      if (drag != null && drag.mode === 'drag') return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      if (settleTimerRef.current != null) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      setDrag({id, startX: event.clientX, dx: 0, mode: 'drag'});
    },
    [canDrag, drag, store.dismissingIds],
  );

  const onCardPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
      const {clientX} = event;
      setDrag(prev => {
        if (prev == null || prev.id !== id || prev.mode !== 'drag') return prev;
        const raw = clientX - prev.startX;
        // Left follows the finger (capped); right rubber-bands at 0.18×.
        const dx = raw < 0 ? Math.max(raw, MAX_DRAG_LEFT) : Math.min(raw * 0.18, 24);
        return {...prev, dx};
      });
    },
    [],
  );

  const onCardPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
      if (drag == null || drag.id !== id || drag.mode !== 'drag') return;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (drag.dx <= -DISMISS_PX) {
        setDrag(null);
        beginDismiss(id);
        return;
      }
      // Spring back below threshold.
      setDrag({...drag, dx: 0, mode: 'settle'});
      settleTimerRef.current = setTimeout(() => {
        settleTimerRef.current = null;
        setDrag(prev => (prev != null && prev.id === id ? null : prev));
      }, SETTLE_MS);
    },
    [beginDismiss, drag],
  );

  // DERIVED ---------------------------------------------------------------

  const count = store.notifs.length;
  const countLabel = `${count} notification${count === 1 ? '' : 's'}`;
  const groups = APPS.map(app => ({
    app,
    items: store.notifs.filter(notif => notif.appId === app.id),
  })).filter(group => group.items.length > 0);
  const flatIndex = new Map<string, number>();
  groups.forEach(group => {
    group.items.forEach(notif => flatIndex.set(notif.id, flatIndex.size));
  });
  const collapsing = store.phase === 'collapsing';
  const frontNotif = store.notifs[0] ?? null;
  const frontApp = frontNotif != null ? APP_BY_ID[frontNotif.appId] : null;

  // RENDER HELPERS ---------------------------------------------------------

  const renderCardInner = (notif: Notif, showClear: boolean): ReactNode => {
    const app = APP_BY_ID[notif.appId];
    return (
      <>
        <span style={{...styles.appTile, background: artGradient(app.hue)}} aria-hidden>
          {app.mono}
        </span>
        <span style={styles.cardTextCol}>
          <span style={styles.cardTopRow}>
            <span style={styles.cardTitle}>{notif.title}</span>
            {notif.unread ? (
              <>
                <span style={styles.unreadDot} aria-hidden />
                <span className="lsk-vh">Unread</span>
              </>
            ) : null}
            <span style={styles.cardTime}>{notif.time}</span>
          </span>
          <span className="lsk-clamp2" style={styles.cardBody}>
            {notif.body}
          </span>
        </span>
        {showClear ? (
          <button
            type="button"
            className="lsk-btn lsk-focusable"
            style={styles.clearBtn}
            aria-label={`Clear notification: ${notif.title}`}
            onPointerDown={event => event.stopPropagation()}
            onClick={() => beginDismiss(notif.id)}>
            <Icon icon={XIcon} size="sm" color="inherit" />
          </button>
        ) : null}
      </>
    );
  };

  const renderCard = (notif: Notif): ReactNode => {
    const idx = flatIndex.get(notif.id) ?? 0;
    const total = flatIndex.size;
    const isDismissing = store.dismissingIds.includes(notif.id);
    const isDragged = drag != null && drag.id === notif.id;
    const progress = isDismissing
      ? 1
      : isDragged
        ? clamp01(-drag.dx / DISMISS_PX)
        : 0;
    const armed = isDismissing || (isDragged && drag.dx <= -DISMISS_PX);

    let cardClass = 'lsk-fan-in';
    if (collapsing) cardClass += ' lsk-collapse';
    else if (isDismissing) cardClass += ' lsk-dismissing';
    else if (isDragged && drag.mode === 'settle') cardClass += ' lsk-springback';

    // Custom property for the collapse keyframe — this repo's CSSProperties
    // has no `--*` index signature, so the variable rides in via a cast.
    const collapseVar = {
      '--lsk-dy': `${store.collapseDys[notif.id] ?? -24}px`,
    } as unknown as CSSProperties;
    const cardStyle: CSSProperties = {
      ...styles.card,
      ...collapseVar,
      animationDelay: collapsing
        ? `${(total - 1 - idx) * COLLAPSE_STAGGER_MS}ms`
        : `${idx * FAN_STAGGER_MS}ms`,
    };
    if (isDismissing) {
      cardStyle.transform = 'translateX(-110%)';
      cardStyle.opacity = 0;
    } else if (isDragged) {
      cardStyle.transform = `translateX(${drag.dx}px)`;
    }

    return (
      <div key={`${store.fanSeq}-${notif.id}`} ref={registerRow(notif.id)} style={styles.cardOuter}>
        <span
          className="lsk-affordance"
          aria-hidden
          style={{
            ...styles.affordance,
            opacity: progress,
            transform: `translateY(-50%) scale(${0.6 + 0.5 * progress + (armed ? 0.1 : 0)})`,
            background: armed ? AFFORDANCE_ARMED : AFFORDANCE_REST,
            color: armed ? AFFORDANCE_ARMED_GLYPH : WALLPAPER_TEXT,
          }}>
          <Icon icon={XIcon} size="sm" color="inherit" />
        </span>
        <div
          className={cardClass}
          style={cardStyle}
          onPointerDown={event => onCardPointerDown(event, notif.id)}
          onPointerMove={event => onCardPointerMove(event, notif.id)}
          onPointerUp={event => onCardPointerEnd(event, notif.id)}
          onPointerCancel={event => onCardPointerEnd(event, notif.id)}>
          {renderCardInner(notif, true)}
        </div>
      </div>
    );
  };

  // BODIES ------------------------------------------------------------------

  const stackBody = (
    <div key={`stack-${store.stackSeq}`} className="lsk-settle">
      <div style={styles.countChipRow}>
        <span style={styles.countChip}>{countLabel}</span>
      </div>
      <button
        type="button"
        className="lsk-btn lsk-focusable-light"
        style={styles.stackBtn}
        aria-label={`Show all ${countLabel}`}
        onClick={expandStack}>
        <span style={{...styles.stackWrap, display: 'block'}}>
          {count >= 3 ? <span style={styles.stackPeek2} aria-hidden /> : null}
          {count >= 2 ? <span style={styles.stackPeek1} aria-hidden /> : null}
          {frontNotif != null && frontApp != null ? (
            <span style={{...styles.card, ...styles.stackFront}}>
              {renderCardInner(frontNotif, false)}
            </span>
          ) : null}
        </span>
      </button>
      <p style={styles.stackHint} aria-hidden>
        Tap the stack to expand
      </p>
    </div>
  );

  const listBody = (
    <div style={collapsing ? {pointerEvents: 'none'} : undefined}>
      <div
        ref={registerRow('list-header')}
        style={styles.listHeader}
        className={collapsing ? 'lsk-hdr-out' : undefined}>
        <span style={styles.listHeaderCount}>{countLabel}</span>
        <span style={styles.listHeaderSpacer} />
        <button
          type="button"
          className="lsk-btn lsk-focusable-light"
          style={styles.showLessBtn}
          onClick={showLess}>
          Show less
        </button>
        <button
          type="button"
          className="lsk-btn lsk-focusable-light"
          style={styles.clearAllBtn}
          onClick={clearAll}>
          <span style={styles.clearAllPill}>Clear All</span>
        </button>
      </div>
      <div style={styles.sections}>
        {groups.map(group => (
          <section key={group.app.id} aria-label={`${group.app.name} notifications`}>
            <div
              ref={registerRow(`hdr-${group.app.id}`)}
              style={styles.sectionHeader}
              className={collapsing ? 'lsk-hdr-out' : undefined}>
              <span
                style={{...styles.sectionTile, background: artGradient(group.app.hue)}}
                aria-hidden>
                {group.app.mono}
              </span>
              <span style={styles.sectionName}>{group.app.name}</span>
              <span style={styles.sectionCount}>· {group.items.length}</span>
            </div>
            <div style={styles.sectionCards}>{group.items.map(renderCard)}</div>
          </section>
        ))}
      </div>
    </div>
  );

  const emptyBody = (
    <div key={`empty-${store.stackSeq}`} className="lsk-settle" style={styles.emptyCard}>
      <span style={styles.emptyCircle}>
        <Icon icon={MoonStarIcon} size="md" color="inherit" />
      </span>
      <h2 style={styles.emptyTitle}>No notifications</h2>
      <p style={styles.emptyBody}>You’re all caught up until morning.</p>
      <button
        type="button"
        className="lsk-btn lsk-focusable"
        style={styles.emptyRestoreBtn}
        onClick={resetAll}>
        Restore notifications
      </button>
    </div>
  );

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };
  const wrapStyle: CSSProperties = {
    ...styles.wrap,
    ...(isDesktopColumn ? styles.wrapDesktop : null),
  };

  return (
    <div ref={wrapRef} style={wrapStyle}>
      <style>{LSK_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.brandSeat} aria-hidden>
              <Icon icon={MoonStarIcon} size="sm" color="inherit" />
            </span>
          </div>
          <h1 style={styles.navTitle}>Moonrise</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="lsk-btn lsk-focusable"
              style={styles.iconBtn}
              aria-label="Restore all notifications"
              onClick={resetAll}>
              <Icon icon={RotateCcwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.wallpaper}>
          {/* Clock fixture — lock-screen content, not simulated OS chrome. */}
          <div style={styles.clockZone}>
            <span style={styles.clockDate}>{CLOCK_DATE}</span>
            <span style={styles.clockTime}>{CLOCK_TIME}</span>
            <span style={styles.focusChip}>
              <Icon icon={MoonStarIcon} size="sm" color="inherit" />
              Sleep focus until 7:00
            </span>
          </div>

          <div style={styles.bottomZone}>
            {store.phase === 'stack' && count > 0 ? stackBody : null}
            {store.phase === 'list' || collapsing ? listBody : null}
            {store.phase === 'empty' || (store.phase === 'stack' && count === 0)
              ? emptyBody
              : null}
          </div>
        </main>

        {/* ONE polite toast dock — a new toast replaces the old. */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} aria-live="polite" role="status">
            {store.toast != null ? (
              <div key={store.toast.seq} className="lsk-toast-in" style={styles.toast}>
                <span style={styles.toastText}>{store.toast.text}</span>
                <span style={styles.toastHairline} aria-hidden />
                {store.toast.undoable && store.lastDismissed != null ? (
                  <button
                    type="button"
                    className="lsk-btn lsk-focusable"
                    style={styles.toastAction}
                    onClick={undoDismiss}>
                    Undo
                  </button>
                ) : (
                  <button
                    type="button"
                    className="lsk-btn lsk-focusable"
                    style={styles.toastAction}
                    aria-label="Dismiss message"
                    onClick={() => setStore(prev => ({...prev, toast: null}))}>
                    <Icon icon={XIcon} size="sm" color="inherit" />
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
