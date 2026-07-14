// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Alder Lane Goods order #A-2419,
 *   frozen on the suite's anchored "today" of Fri, Jul 4 (placed 9:12 AM,
 *   arriving Thu, Jul 10): three line items in integer cents with dual
 *   fields (3400 + 2850 + 2×750 = 7750 subtotal), shipping 495 + tax 395
 *   ⇒ TOTAL 8640 = the '$86.40' on the track label, the totals card, the
 *   AlertDialog copy, and the success pill — every money string comes
 *   from ONE formatUSD over reduce()-derived cents, never hand-typed.
 *   No Date.now(), no Math.random(), no network media (art = hue-gradient
 *   tiles + monograms).
 * @output Mobile Slide to Confirm — a checkout screen whose centerpiece is
 *   commit-gesture physics. Specimen 1: a 56px slide-to-pay track with a
 *   shimmering hint label (background-position sweep), a 48px thumb that
 *   follows pointer drag (setPointerCapture), damps to 0.45× travel past
 *   78% (resistance), springs back on early release with an overshoot
 *   bezier, and past 92% locks to the end, morphs into a spinner, then
 *   the whole track contracts into a success pill (width transition +
 *   SVG check draw-on) while the order card stamps PAID with a rotate-in
 *   badge. Specimen 2: HOLD-to-cancel — a destructive row whose 44px ring
 *   fills over 900ms while held (releasing early rewinds fast at 180ms);
 *   completing cancels the order, stamps CANCELLED, and posts an Undo
 *   toast. Button paths commit through the SAME state updates: 'Pay with
 *   button instead' → commitPay(); 'Cancel without holding…' → a confirm
 *   AlertDialog → commitCancel(). A navBar Reset link restores the whole
 *   screen (re-keys the entry stagger).
 * @position Page template; emitted by `astryx template mobile-slide-to-confirm`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no fake OS chrome — the 52px
 *   sticky navBar at y=0 is the first pixel). The ONE polite toast dock
 *   (aria-live) is sticky bottom:16 (no tabBar on this push-stack
 *   surface); one toast at a time, a new toast REPLACES the old. No
 *   sheets on this page, so the shell never scroll-locks; the cancel
 *   confirmation uses the DS AlertDialog (native <dialog> top layer —
 *   the component the spec mandates, not a hand-rolled fixed overlay).
 * Animation contract: transform/opacity only, plus the two sanctioned
 *   extras — SVG stroke-dashoffset (hold ring, check draw-on; the spec's
 *   "conic ring" is realized as a dashoffset ring to stay contract-pure)
 *   and background-position (hint shimmer). ONE spec-sanctioned width
 *   exception, mirroring the live-activity capsule rule: the track's
 *   contract into the success pill animates width on that single small
 *   control only (px→px — the track width is measured at commit so the
 *   transition never interpolates a percentage). Springy feel =
 *   cubic-bezier(0.34,1.56,0.64,1); decelerate = cubic-bezier(0.22,1,
 *   0.36,1). Staged timers (1100ms processing, 900ms hold) are tracked
 *   in a ref set and cleared on unmount; no wall-clock reads.
 * Reduced motion: read once via matchMedia in a useEffect (with change
 *   listener). Shimmer and the spinner loop are REMOVED (not slowed),
 *   the thumb still drags but settles without spring (140ms ease), the
 *   hold ring fills stepwise (steps(4, end)), stamps/check appear
 *   complete via the CSS media backstop.
 * Color policy: token-pure chrome. THE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#0F766E, #5EEAD4) — white on #0F766E ≈
 *   5.5:1 (and ≥3:1 as a fill vs the white card); near-black #042F2A on
 *   #5EEAD4 ≈ 9.4:1 (and the fill ≈ 11:1 vs the dark card). Destructive
 *   = var(--color-error); success = var(--color-success); never
 *   var(--color-text).
 * Density grid (MOBILE, verbatim): 16px screen inset · 12px card gaps ·
 *   24px section gaps · 8px chip gaps; navBar 52px sticky z20 with
 *   hairline; inset-grouped listCards (12px radius, 1px border, hairline
 *   dividers inset 16 / 68 after 40px thumbs); 60px item rows · 56px
 *   track/hold controls · 44px utility rows; every touch target ≥44×44.
 *   Type: 17/600 nav title · 17/700 total · 16/400-500 row primary ·
 *   13/400 secondary · 11/500 overlines; tabular-nums on every figure.
 *
 * Responsive contract:
 * - Fluid 320–430: the track is width:100% inside the 16px gutters (358
 *   at 390); thumb travel is measured per-gesture from the live rect, so
 *   the 92% threshold holds at every width; item names ellipsize while
 *   prices never do. overflowX:'clip' backstop.
 * - Desktop stage (~1045px): useElementWidth on the wrapper (container
 *   width, not viewport — the inline stage never fires viewport media
 *   queries); >560px renders the standard centered 430px phone column
 *   (marginInline auto, borderInline hairline) on the muted backdrop —
 *   never a stretched relayout.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  CreditCardIcon,
  TruckIcon,
  XIcon,
} from 'lucide-react';

import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — the ONE quarantined brand literal and its on-fill pair.
// ---------------------------------------------------------------------------

// Alder Lane teal. White text/glyphs on #0F766E ≈ 5.5:1 (≥4.5 text, ≥3
// fill vs the white card); dark-scheme #5EEAD4 carries near-black #042F2A
// glyphs ≈ 9.4:1 and reads ≈ 11:1 as a fill vs the ~#1F1F22 dark card.
const BRAND_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
const BRAND_ON_ACCENT = 'light-dark(#FFFFFF, #042F2A)';
// 12% brand wash for the payment-method icon seat — decorative fill only.
const BRAND_WASH = `color-mix(in srgb, ${BRAND_ACCENT} 12%, var(--color-background-muted))`;
// Success/error tints for the pill + stamps — token-derived, never text.
const SUCCESS_TINT = 'color-mix(in srgb, var(--color-success) 14%, var(--color-background-card))';
const SUCCESS_EDGE = 'color-mix(in srgb, var(--color-success) 45%, var(--color-border))';
const ERROR_EDGE = 'color-mix(in srgb, var(--color-error) 45%, var(--color-border))';

// ---------------------------------------------------------------------------
// INJECTED CSS — unique `stc-` prefix. Transform/opacity only, plus the
// sanctioned stroke-dashoffset + background-position extras. The
// prefers-reduced-motion block is the backstop for the matchMedia state:
// loops (shimmer, spinner) are REMOVED, draw-ons render complete.
// ---------------------------------------------------------------------------

const STC_CSS = `
.stc-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.stc-btn:disabled { cursor: default; }
.stc-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.stc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Hint shimmer — background-position sweep across a text-clipped gradient. */
.stc-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-text-secondary) 0%,
    var(--color-text-secondary) 38%,
    var(--color-text-primary) 50%,
    var(--color-text-secondary) 62%,
    var(--color-text-secondary) 100%
  );
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: stc-shimmer-sweep 2.4s linear infinite;
}
@keyframes stc-shimmer-sweep {
  from { background-position: 120% 0; }
  to { background-position: -120% 0; }
}
/* Processing spinner — a loop, so it is removed (not slowed) when reduced. */
.stc-spin { animation: stc-rotate 800ms linear infinite; transform-origin: center; }
@keyframes stc-rotate { to { transform: rotate(360deg); } }
/* PAID / CANCELLED stamp — overshoot drop-in, settles at the inline tilt. */
.stc-stamp { animation: stc-stamp-in 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes stc-stamp-in {
  0% { transform: scale(1.7) rotate(3deg); opacity: 0; }
  60% { transform: scale(0.94) rotate(-13deg); opacity: 1; }
  100% { transform: scale(1) rotate(-11deg); opacity: 1; }
}
/* Success-pill check draw-on (pathLength=1). */
.stc-check-path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: stc-draw 360ms cubic-bezier(0.22, 1, 0.36, 1) 160ms forwards;
}
@keyframes stc-draw { to { stroke-dashoffset: 0; } }
/* Entry stagger — sections rise 8px on mount / Reset (per-index delay inline). */
.stc-rise { animation: stc-rise-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes stc-rise-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.stc-fade { transition: opacity 200ms ease; }
@media (prefers-reduced-motion: reduce) {
  .stc-shimmer {
    animation: none;
    background: none;
    -webkit-background-clip: initial;
    background-clip: initial;
    color: var(--color-text-secondary);
  }
  .stc-spin { animation: none; }
  .stc-stamp { animation: none; }
  .stc-check-path { animation: none; stroke-dashoffset: 0; }
  .stc-rise { animation: none; }
  .stc-fade { transition: none; }
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
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  backLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  textBtn: {
    height: 44,
    paddingInline: 8,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  sectionHeader: {
    margin: '24px 0 8px',
    paddingInline: 32,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // Inset-grouped listCard.
  listCard: {
    position: 'relative',
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // Merchant header row — 64px, monogram tile + order meta; stamps overlay.
  merchantRow: {
    minHeight: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  merchantTile: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  merchantText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
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
  // Rubber stamps — rotate-in badges over the order card (stc-stamp anim).
  stamp: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 1,
    padding: '3px 10px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: '0.1em',
    transform: 'rotate(-11deg)',
    background: 'var(--color-background-card)',
    pointerEvents: 'none',
  },
  stampPaid: {border: '2px solid var(--color-success)', color: 'var(--color-success)'},
  stampCancelled: {border: '2px solid var(--color-error)', color: 'var(--color-error)'},
  // Item rows — 60px two-line with a 40px art thumb; price never shrinks.
  itemRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  itemThumb: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  itemText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  itemPrice: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Totals block.
  totalsBlock: {display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 16px'},
  totalsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  totalsHairline: {height: 1, background: 'var(--color-border)', marginBlock: 4},
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 17,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  deliveryRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Payment method row — 56px, brand-wash icon seat, 44×44 chevron button.
  methodRow: {minHeight: 56, display: 'flex', alignItems: 'center', gap: 12, paddingInlineStart: 16},
  methodSeat: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_WASH,
    color: BRAND_ACCENT,
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // SLIDE-TO-PAY TRACK — 56px rounded track in the 16px gutters (358 at
  // 390). Width animates ONLY for the success-pill contract (sanctioned
  // exception, px→px). Thumb is a 48px button inset 4px.
  trackZone: {marginInline: 16, marginTop: 12, display: 'flex', justifyContent: 'center'},
  track: {
    position: 'relative',
    height: 56,
    width: '100%',
    borderRadius: 28,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  trackPaid: {
    border: `1px solid ${SUCCESS_EDGE}`,
    background: SUCCESS_TINT,
  },
  trackDisabled: {opacity: 0.45},
  trackLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  },
  pillContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-success)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  thumb: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    boxShadow: '0 1px 4px var(--color-shadow)',
    touchAction: 'none',
  },
  payAltBtn: {
    height: 44,
    marginTop: 4,
    marginInline: 'auto',
    paddingInline: 16,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // HOLD-TO-CANCEL row — 64px destructive control with the dashoffset ring.
  holdRow: {
    width: '100%',
    minHeight: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    touchAction: 'none',
  },
  holdRingSeat: {position: 'relative', width: 44, height: 44, flexShrink: 0, display: 'grid', placeItems: 'center'},
  holdText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  holdPrimary: {fontSize: 16, fontWeight: 500, color: 'var(--color-error)'},
  holdRowDisabled: {opacity: 0.45},
  utilityBtnRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
    color: 'var(--color-error)',
  },
  terminalCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '20px 16px 0',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST — the single polite dock, sticky bottom:16 (no tabBar here).
  toastDock: {
    position: 'sticky',
    bottom: 16,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    marginTop: 24,
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
// FIXTURES — one order, all money in integer cents. Every figure on
// screen derives from these rows through formatUSD; the cross-check
// 3400 + 2850 + 2×750 = 7750; 7750 + 495 + 395 = 8640 ⇒ $86.40.
// ---------------------------------------------------------------------------

const TODAY_LABEL = 'Fri, Jul 4';
const ORDER_NO = 'A-2419';
const PLACED_AT = '9:12 AM';
const ARRIVES = 'Thu, Jul 10 · 48 Rowan St, Apt 3';

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  unitCents: number;
  hue: number; // hue-gradient fixture art — no network media
  mono: string;
}

const ORDER_ITEMS: OrderItem[] = [
  {id: 'pourover', name: 'Stoneware pour-over set', qty: 1, unitCents: 3400, hue: 158, mono: 'PS'},
  {id: 'apron', name: 'Linen kitchen apron', qty: 1, unitCents: 2850, hue: 26, mono: 'LA'},
  {id: 'tapers', name: 'Beeswax taper pair', qty: 2, unitCents: 750, hue: 268, mono: 'BT'},
];

const SUBTOTAL_CENTS = ORDER_ITEMS.reduce((sum, item) => sum + item.qty * item.unitCents, 0); // 7750
const SHIPPING_CENTS = 495;
const TAX_CENTS = 395;
const TOTAL_CENTS = SUBTOTAL_CENTS + SHIPPING_CENTS + TAX_CENTS; // 8640

function formatUSD(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rest = `${cents % 100}`.padStart(2, '0');
  return `$${dollars.toLocaleString('en-US')}.${rest}`;
}

// Fixture art — white monogram on 40%/26%-lightness stops ≈ 4.6:1+ in both
// schemes (reads as product art, not chrome).
function artGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 45% 40%), hsl(${(hue + 40) % 360} 55% 26%))`;
}

// Slide physics constants.
const THUMB = 48;
const THUMB_INSET = 4;
const COMMIT_AT = 0.92; // progress that locks the thumb to the end
const SOFT_AT = 0.78; // resistance kicks in past this progress
const RESISTANCE = 0.45; // damped travel factor past SOFT_AT
const PROCESS_MS = 1100; // staged spinner phase before the success pill
const HOLD_MS = 900; // hold-to-cancel dwell
const PILL_WIDTH = 190; // success pill target width (px→px transition)
const RING_LEN = 100; // pathLength of the hold ring circle

// ---------------------------------------------------------------------------
// SHARED HOOKS
// ---------------------------------------------------------------------------

/** Container-width hook — the desktop stage is ~1045px inside a 1440px
 * window, so only a ResizeObserver on the wrapper can tell the stages
 * apart (viewport media queries never fire in the inline stage). */
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
 * listener (the batch animation contract's mandated form). */
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
// PAGE STATE
// ---------------------------------------------------------------------------

type PayPhase = 'idle' | 'processing' | 'paid';

interface ToastState {
  seq: number;
  text: string;
  undoable: boolean;
}

export default function MobileSlideToConfirmTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 600px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth > 560 : isWideViewport;
  const reducedMotion = useReducedMotion();

  const [payPhase, setPayPhase] = useState<PayPhase>('idle');
  const [cancelled, setCancelled] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [dragX, setDragX] = useState<number | null>(null);
  const [trackPx, setTrackPx] = useState<number | null>(null);
  const [resetSeq, setResetSeq] = useState(0);

  // Staged timers — tracked in a ref set, cleared on unmount (contract).
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const toastSeqRef = useRef(0);
  const postToast = useCallback((text: string, undoable: boolean) => {
    toastSeqRef.current += 1;
    setToast({seq: toastSeqRef.current, text, undoable});
  }, []);

  // -------------------------------------------------------------------------
  // SPECIMEN 1 — slide-to-pay. commitPay() is the ONE state update both
  // the gesture and the 'Pay with button instead' path route through.
  // -------------------------------------------------------------------------

  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{startX: number; max: number} | null>(null);
  // Re-entry guard (ref, not state updater side effects — StrictMode-safe).
  const payBusyRef = useRef(false);

  const commitPay = useCallback(() => {
    if (payBusyRef.current) {
      return;
    }
    payBusyRef.current = true;
    const trackEl = trackRef.current;
    // Freeze the track width in px so the pill contract is a px→px
    // width transition (percentages do not interpolate to px).
    setTrackPx(trackEl != null ? Math.round(trackEl.getBoundingClientRect().width) : 358);
    setPayPhase('processing');
    postToast('Processing payment…', false);
    schedule(() => {
      setPayPhase('paid');
      postToast(`Payment confirmed · ${formatUSD(TOTAL_CENTS)}`, false);
    }, PROCESS_MS);
  }, [postToast, schedule]);

  const payLocked = payPhase !== 'idle' || cancelled;

  const onThumbPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (payLocked) {
      return;
    }
    const trackEl = trackRef.current;
    if (trackEl == null) {
      return;
    }
    const rect = trackEl.getBoundingClientRect();
    dragRef.current = {startX: event.clientX, max: rect.width - THUMB - THUMB_INSET * 2};
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragX(0);
  };

  const onThumbPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag == null) {
      return;
    }
    const raw = Math.max(0, event.clientX - drag.startX);
    const soft = drag.max * SOFT_AT;
    // Resistance near the end: damped travel past the soft point.
    const damped = raw <= soft ? raw : soft + (raw - soft) * RESISTANCE;
    const shown = Math.min(damped, drag.max);
    if (shown >= drag.max * COMMIT_AT) {
      // Past 92% — lock to the end and hand off to the processing phase.
      dragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
      setDragX(null);
      commitPay();
      return;
    }
    setDragX(shown);
  };

  const onThumbRelease = () => {
    // Early release — spring back (transition-based settle, no spring lib).
    dragRef.current = null;
    setDragX(null);
  };

  const onThumbKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
      event.preventDefault();
      commitPay();
    }
  };

  const dragProgress =
    dragX != null && dragRef.current != null && dragRef.current.max > 0
      ? dragX / dragRef.current.max
      : 0;

  // Thumb x while locked/processing — the frozen track width minus insets.
  const lockedX = trackPx != null ? trackPx - THUMB - THUMB_INSET * 2 : 0;
  const thumbX = dragX != null ? dragX : payPhase === 'idle' ? 0 : lockedX;
  const thumbTransition =
    dragX != null
      ? 'none'
      : payPhase === 'processing'
        ? 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)'
        : reducedMotion
          ? 'transform 140ms ease' // settles without spring (reduced)
          : 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)'; // spring back

  // -------------------------------------------------------------------------
  // SPECIMEN 2 — hold-to-cancel. commitCancel() is the ONE state update
  // both the 900ms hold and the AlertDialog path route through.
  // -------------------------------------------------------------------------

  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelLocked = cancelled || payPhase !== 'idle';

  const commitCancel = useCallback(() => {
    setHolding(false);
    setCancelled(true);
    postToast('Order cancelled', true);
  }, [postToast]);

  const startHold = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (cancelLocked) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setHolding(true);
    holdTimerRef.current = schedule(() => {
      holdTimerRef.current = null;
      commitCancel();
    }, HOLD_MS);
  };

  const endHold = () => {
    if (holdTimerRef.current != null) {
      clearTimeout(holdTimerRef.current);
      timersRef.current.delete(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHolding(false);
  };

  const onHoldKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    // Keyboard path = the confirmation dialog (dwell timing is a pointer
    // idiom); the dialog commits through the same commitCancel().
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!cancelLocked) {
        setAlertOpen(true);
      }
    }
  };

  const undoCancel = () => {
    setCancelled(false);
    postToast('Order restored', false);
  };

  const resetAll = () => {
    endHold();
    dragRef.current = null;
    payBusyRef.current = false;
    setDragX(null);
    setPayPhase('idle');
    setTrackPx(null);
    setCancelled(false);
    setAlertOpen(false);
    setToast(null);
    setResetSeq(seq => seq + 1);
  };

  // -------------------------------------------------------------------------
  // DERIVED LABELS — every money string routes through formatUSD.
  // -------------------------------------------------------------------------

  const totalLabel = formatUSD(TOTAL_CENTS);
  const statusLine = cancelled
    ? `Cancelled · ${TODAY_LABEL}`
    : payPhase === 'paid'
      ? `Paid · ${TODAY_LABEL}`
      : `Awaiting payment · placed ${PLACED_AT}`;

  const trackStateStyle: CSSProperties = {
    ...styles.track,
    ...(payPhase === 'paid' ? styles.trackPaid : null),
    ...(cancelled ? styles.trackDisabled : null),
    ...(trackPx != null ? {width: payPhase === 'paid' ? PILL_WIDTH : trackPx} : null),
    // Sanctioned width exception (px→px) — the pill contract only.
    transition: reducedMotion ? 'none' : 'width 460ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  };

  const sectionRise = (index: number): CSSProperties => ({
    animationDelay: `${index * 60}ms`,
  });

  return (
    <div ref={wrapRef} style={{...styles.wrap, ...(isDesktopColumn ? styles.wrapDesktop : null)}}>
      <style>{STC_CSS}</style>
      <div style={{...styles.shell, ...(isDesktopColumn ? styles.shellDesktop : null)}}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {/* Leaves the page — sanctioned no-op. */}
            <button type="button" className="stc-btn stc-focusable" style={styles.backBtn} onClick={() => {}}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
              <span style={styles.backLabel}>Shop</span>
            </button>
          </div>
          <h1 style={styles.navTitle}>Checkout</h1>
          <div style={styles.navTrailing}>
            {/* THE Reset link — restores the whole screen. */}
            <button type="button" className="stc-btn stc-focusable" style={styles.textBtn} onClick={resetAll}>
              Reset
            </button>
          </div>
        </header>

        <main key={resetSeq} style={styles.main}>
          {/* ---------------- ORDER SUMMARY ---------------- */}
          <h2 className="stc-rise" style={{...styles.sectionHeader, ...sectionRise(0)}}>
            Order
          </h2>
          <div className="stc-rise" style={{...styles.listCard, ...sectionRise(0)}}>
            {payPhase === 'paid' && !cancelled ? (
              <span className="stc-stamp" style={{...styles.stamp, ...styles.stampPaid}} aria-hidden>
                PAID
              </span>
            ) : null}
            {cancelled ? (
              <span className="stc-stamp" style={{...styles.stamp, ...styles.stampCancelled}} aria-hidden>
                CANCELLED
              </span>
            ) : null}
            <div style={styles.merchantRow}>
              <span style={{...styles.merchantTile, background: artGradient(196)}} aria-hidden>
                AL
              </span>
              <span style={styles.merchantText}>
                <span style={styles.rowPrimary}>Alder Lane Goods</span>
                <span style={styles.rowSecondary}>
                  Order #{ORDER_NO} · {statusLine}
                </span>
              </span>
            </div>
            <div style={styles.rowDivider} />
            {ORDER_ITEMS.map((item, index) => (
              <div key={item.id}>
                {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                <div style={styles.itemRow}>
                  <span style={{...styles.itemThumb, background: artGradient(item.hue)}} aria-hidden>
                    {item.mono}
                  </span>
                  <span style={styles.itemText}>
                    <span style={styles.rowPrimary}>{item.name}</span>
                    <span style={styles.rowSecondary}>
                      {item.qty} × {formatUSD(item.unitCents)}
                    </span>
                  </span>
                  <span style={styles.itemPrice}>{formatUSD(item.qty * item.unitCents)}</span>
                </div>
              </div>
            ))}
            <div style={styles.rowDivider} />
            <div style={styles.totalsBlock}>
              <div style={styles.totalsRow}>
                <span>Subtotal</span>
                <span>{formatUSD(SUBTOTAL_CENTS)}</span>
              </div>
              <div style={styles.totalsRow}>
                <span>Shipping</span>
                <span>{formatUSD(SHIPPING_CENTS)}</span>
              </div>
              <div style={styles.totalsRow}>
                <span>Sales tax</span>
                <span>{formatUSD(TAX_CENTS)}</span>
              </div>
              <div style={styles.totalsHairline} />
              <div style={styles.totalRow}>
                <span>Total</span>
                <span>{totalLabel}</span>
              </div>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.deliveryRow}>
              <Icon icon={TruckIcon} size="sm" color="inherit" />
              <span style={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                Arrives {ARRIVES}
              </span>
            </div>
          </div>

          {/* ---------------- SLIDE TO PAY ---------------- */}
          <h2 className="stc-rise" style={{...styles.sectionHeader, ...sectionRise(1)}}>
            Payment
          </h2>
          <div className="stc-rise" style={{...styles.listCard, ...sectionRise(1)}}>
            <div style={styles.methodRow}>
              <span style={styles.methodSeat} aria-hidden>
                <Icon icon={CreditCardIcon} size="sm" color="inherit" />
              </span>
              <span style={{...styles.merchantText}}>
                <span style={styles.rowPrimary}>Northbank Visa ·· 4421</span>
                <span style={styles.rowSecondary}>No card fee · receipts to mail@rowan.st</span>
              </span>
              <button
                type="button"
                className="stc-btn stc-focusable"
                style={styles.iconBtn}
                aria-label="Change payment method"
                onClick={() => postToast('This demo keeps the card fixed', false)}>
                <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
              </button>
            </div>
          </div>

          <div className="stc-rise" style={{...styles.trackZone, ...sectionRise(2)}}>
            <div ref={trackRef} style={trackStateStyle}>
              {payPhase === 'paid' ? (
                <span style={styles.pillContent} className="stc-fade">
                  {/* Check draw-on (pathLength=1; renders complete when reduced). */}
                  <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path
                      d="M4.5 10.5 8.4 14.2 15.5 6.5"
                      stroke="var(--color-success)"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength={1}
                      className="stc-check-path"
                    />
                  </svg>
                  Paid {totalLabel}
                </span>
              ) : (
                <>
                  <span
                    style={{
                      ...styles.trackLabel,
                      // Hint fades as the thumb approaches — opacity only.
                      opacity: payPhase === 'processing' ? 1 : Math.max(0, 1 - dragProgress * 1.6),
                    }}
                    className={payPhase === 'idle' && !cancelled && !reducedMotion ? 'stc-shimmer' : undefined}>
                    {cancelled
                      ? 'Order cancelled'
                      : payPhase === 'processing'
                        ? 'Processing…'
                        : `Slide to pay ${totalLabel}`}
                  </span>
                  <button
                    type="button"
                    className="stc-btn stc-focusable"
                    style={{
                      ...styles.thumb,
                      transform: `translateX(${thumbX}px)`,
                      transition: thumbTransition,
                      ...(cancelled ? {pointerEvents: 'none'} : null),
                    }}
                    aria-label={`Slide to pay ${totalLabel} — or press Enter to pay`}
                    disabled={payPhase !== 'idle' || cancelled}
                    onPointerDown={onThumbPointerDown}
                    onPointerMove={onThumbPointerMove}
                    onPointerUp={onThumbRelease}
                    onPointerCancel={onThumbRelease}
                    onKeyDown={onThumbKeyDown}>
                    {payPhase === 'processing' ? (
                      <svg
                        className={reducedMotion ? undefined : 'stc-spin'}
                        width={22}
                        height={22}
                        viewBox="0 0 22 22"
                        fill="none"
                        aria-hidden>
                        <circle cx={11} cy={11} r={8} stroke={BRAND_ON_ACCENT} strokeOpacity={0.35} strokeWidth={2.5} />
                        <path d="M11 3a8 8 0 0 1 8 8" stroke={BRAND_ON_ACCENT} strokeWidth={2.5} strokeLinecap="round" />
                      </svg>
                    ) : (
                      <Icon icon={ChevronsRightIcon} size="md" color="inherit" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mandatory button path — commits through the SAME commitPay(). */}
          <button
            type="button"
            className="stc-btn stc-focusable stc-rise"
            style={{...styles.payAltBtn, ...sectionRise(2), ...(payLocked ? {opacity: 0.45} : null)}}
            disabled={payLocked}
            onClick={commitPay}>
            Pay with button instead
          </button>

          {/* ---------------- HOLD TO CANCEL ---------------- */}
          <h2 className="stc-rise" style={{...styles.sectionHeader, ...sectionRise(3)}}>
            Manage order
          </h2>
          <div className="stc-rise" style={{...styles.listCard, ...sectionRise(3)}}>
            <button
              type="button"
              className="stc-btn stc-focusable"
              style={{...styles.holdRow, ...(cancelLocked ? styles.holdRowDisabled : null)}}
              disabled={cancelLocked}
              aria-label="Hold to cancel the order — or press Enter to open a confirmation dialog"
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              onKeyDown={onHoldKeyDown}>
              <span style={styles.holdRingSeat} aria-hidden>
                {/* The spec's "conic ring", realized as a dashoffset ring:
                    fills 900ms while held (steps(4) when reduced), rewinds
                    in 180ms on early release. */}
                <svg width={44} height={44} viewBox="0 0 44 44" fill="none" style={{position: 'absolute', inset: 0}}>
                  <circle cx={22} cy={22} r={16} stroke="var(--color-border)" strokeWidth={3} />
                  <circle
                    cx={22}
                    cy={22}
                    r={16}
                    stroke="var(--color-error)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    pathLength={RING_LEN}
                    strokeDasharray={RING_LEN}
                    strokeDashoffset={holding ? 0 : RING_LEN}
                    transform="rotate(-90 22 22)"
                    style={{
                      transition: holding
                        ? `stroke-dashoffset ${HOLD_MS}ms ${reducedMotion ? 'steps(4, end)' : 'linear'}`
                        : 'stroke-dashoffset 180ms ease-out',
                    }}
                  />
                </svg>
                <span style={{color: 'var(--color-error)', display: 'grid', placeItems: 'center'}}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </span>
              </span>
              <span style={styles.holdText}>
                <span style={styles.holdPrimary}>
                  {cancelled ? 'Order cancelled' : holding ? 'Keep holding…' : 'Hold to cancel order'}
                </span>
                <span style={styles.rowSecondary}>
                  {cancelled
                    ? 'Undo from the message below'
                    : payPhase !== 'idle'
                      ? 'Payment started — cancellation closed'
                      : 'Hold 0.9s · releasing early keeps the order'}
                </span>
              </span>
            </button>
            <div style={styles.rowDivider} />
            {/* Mandatory button path — confirm AlertDialog, same commitCancel(). */}
            <button
              type="button"
              className="stc-btn stc-focusable"
              style={{...styles.utilityBtnRow, ...(cancelLocked ? {opacity: 0.45} : null)}}
              disabled={cancelLocked}
              onClick={() => setAlertOpen(true)}>
              Cancel without holding…
            </button>
          </div>

          <p className="stc-rise" style={{...styles.terminalCaption, ...sectionRise(4)}}>
            Slide, hold, or take a button path — Reset restores the order · {TODAY_LABEL}
          </p>
        </main>

        {/* ONE polite toast dock — sticky bottom:16; a new toast replaces
            the old; Undo is a real button. */}
        <div style={styles.toastDock} aria-live="polite" role="status">
          {toast != null ? (
            <div key={toast.seq} style={styles.toast} className="stc-fade">
              <span style={styles.toastText}>{toast.text}</span>
              <span style={styles.toastHairline} aria-hidden />
              {toast.undoable && cancelled ? (
                <button type="button" className="stc-btn stc-focusable" style={styles.toastAction} onClick={undoCancel}>
                  Undo
                </button>
              ) : (
                <button
                  type="button"
                  className="stc-btn stc-focusable"
                  style={styles.toastAction}
                  aria-label="Dismiss message"
                  onClick={() => setToast(null)}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <AlertDialog
        isOpen={alertOpen}
        onOpenChange={setAlertOpen}
        title="Cancel this order?"
        description={`Order #${ORDER_NO} (${totalLabel}) will be cancelled. You can undo from the confirmation message.`}
        cancelLabel="Keep order"
        actionLabel="Cancel order"
        onAction={() => {
          commitCancel();
          setAlertOpen(false);
        }}
      />
    </div>
  );
}
