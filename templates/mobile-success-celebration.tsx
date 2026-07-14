// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Larkpay, a P2P money app, frozen at
 *   Fri, Jul 10 · 9:41 AM: ONE pending transfer (Maya Trent @maya-trent,
 *   Beacon Credit Union ··4821, $248.00, memo 'July studio rent', fee
 *   $0.00), a balance pair that cross-checks to the cent ($1,362.60 −
 *   $248.00 = $1,114.60 after send), 6 fixed activity rows (Jul 1–9), an
 *   18-entry literal confetti array ({dx, dy, rot, delay, color-index,
 *   shape} — drift dx2 = round(dx × 1.15), fall dy2 = dy + 48 derived by
 *   fixed arithmetic), and a 20-step eased count-up table (35ms interval,
 *   cents = round(24800 × (1 − (1 − k/20)³)), lands on 24800 exactly).
 *   No Date.now(), no Math.random(), no network media (art = hue-gradient
 *   monogram tiles).
 * @output Success Celebration Flow — a 390px MOBILE transfer-confirmation
 *   choreography. Opening state: navBar (spark mark · 'Confirm transfer'
 *   · Activity) over a Confirm card (recipient row, 40/700 tabular
 *   $248.00, Pay-from + memo rows, protection caption) whose primary is
 *   a 56px HOLD-TO-SEND button — pressing fills it with an inset
 *   progress sweep over 600ms (scaleX overlay, transform-only);
 *   releasing early rewinds the sweep in 150ms and flashes an inline
 *   hint; a plain 44px `Send now` text button commits through the SAME
 *   state update (the mandatory button path — keyboard activation of the
 *   hold button, event.detail === 0, also commits). On commit the staged
 *   celebration runs from one timer effect: (1) the card flips away
 *   (rotateX exit, 320ms), (2) a 96px SVG ring draws via
 *   stroke-dashoffset over 480ms, (3) the check strokes in (dashoffset,
 *   260ms) under an overshoot scale pop, (4) 18 fixed confetti particles
 *   burst outward on gravity-ish keyframes over 900ms (4 token colors;
 *   unmounted from the DOM after), (5) the amount counts up 0 → $248.00
 *   in tabular numerals over 700ms (interval-driven fixed steps), (6) a
 *   receipt card slides up with 4 rows staggering in (To / Sent / Fee /
 *   New balance) + a `Just now` row surfacing atop Recent activity, then
 *   (7) `Done` + `Send again` — Send again resets EVERY flag and the
 *   whole choreography replays. The single polite toast dock announces
 *   `Transfer sent — $248.00 to Maya Trent`.
 * @position Page template; emitted by `astryx template mobile-success-celebration`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no fake OS chrome — the 52px
 *   sticky navBar at y=0 is the first pixel). position:fixed is BANNED;
 *   this page opens no sheets, so the scroll-lock branch of the contract
 *   is never entered (confetti is position:'absolute' inside the ring
 *   wrapper, inside shell). The toast live region rides a sticky
 *   height:0 dock at the end of flow — no tabBar here, so it sits at
 *   bottom:16 per the contract; one toast at a time, a new toast
 *   REPLACES the old.
 * Animation contract: transform/opacity only (plus SVG stroke-dashoffset
 *   for the ring/check draw-ons) — never layout properties. All motion
 *   lives in the SCX_CSS <style> constant under the unique `scx-` class
 *   prefix; overshoot = cubic-bezier(0.34, 1.56, 0.64, 1), decelerate =
 *   cubic-bezier(0.22, 1, 0.36, 1); phases chain from ONE cleaned-up
 *   timer effect keyed on runSeq (setTimeout/setInterval only — no
 *   wall-clock reads). Confetti "randomness" is a literal const array.
 *   REDUCED MOTION (prefers-reduced-motion via matchMedia + change
 *   listener inside useMediaQuery): commit jumps straight to the final
 *   state under a single 220ms opacity crossfade — flip, confetti, pop,
 *   staggers, and count-up are REMOVED entirely (the CSS guard also
 *   forces ring/check dashoffsets to 0), and the hold sweep snaps
 *   instead of sweeping.
 * Container policy: inset-grouped listCards (12px radius, 1px border,
 *   hairline dividers inset 16 / 68 after 48px thumbs); no desktop
 *   frames, no side asides, no data tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#2456E6, #8FAFFF) — white 16px text on
 *   #2456E6 ≈ 5.9:1; near-black #10131C on #8FAFFF ≈ 7.8:1 (math at the
 *   declaration). The hold sweep reuses BRAND_FILL_TEXT at 22% mix (a
 *   transient progress affordance over the brand fill, backed by the
 *   600ms timer, never the sole signal). Confetti + ring/check use
 *   tokens only (--color-success, --color-warning, two categorical data
 *   tokens). Recipient/activity art = id-derived hue gradients with
 *   white monograms (≈4.6:1+, reads as avatar art, not chrome). Never
 *   var(--color-text).
 * Density grid (MOBILE, verbatim): 16px screen inset · 12px card gaps ·
 *   24px section gaps · 8px chip gaps; navBar 52px sticky top z20 with
 *   always-on hairline (grid '1fr auto 1fr', paddingInline 8); rows 72px
 *   media (48px thumb) / 60px two-line (40px thumb) / 44px utility;
 *   buttons 56px hold primary / 48px done primary / 44px text + icon
 *   targets — every interactive target ≥44×44. TYPE (Figtree via
 *   --font-family-body): 40/700 confirm amount · 34/700 count-up · 17/600
 *   nav + celebrate titles · 16/400 body floor · 13/400 meta · 11/500
 *   overlines; nothing under 11px; tabular-nums on every money figure.
 *
 * Responsive contract:
 * - Fluid 320–430: every block is width-fluid inside the 16px gutters
 *   (no width literals besides the 96px ring, 96 + 2×16 = 128 < 320);
 *   recipient/receipt values ellipsize, money figures never do.
 *   overflowX:'clip' backstop; confetti extremes (±90px) stay inside the
 *   clip at 320.
 * - Desktop stage: useElementWidth (ResizeObserver on the wrapper —
 *   container width, not viewport) with a useMediaQuery(min-width:720px)
 *   fallback before first measure; >560px renders the standard centered
 *   phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline) on a var(--color-background-muted) backdrop — never a
 *   stretched relayout.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, PointerEvent as ReactPointerEvent, RefObject} from 'react';

import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  HistoryIcon,
  ShieldCheckIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Larkpay blue). White 16px text on
// #2456E6 ≈ 5.9:1 (relative luminance 0.127); near-black #10131C on
// #8FAFFF ≈ 7.8:1 (luminance 0.437). As a bare fill vs the card surface:
// #2456E6 on white ≈ 5.9:1 and #8FAFFF on the ~#1C1C1E dark card ≈ 6.9:1
// — both clear the ≥3:1 bar for meaningful fills (hold button, spark
// mark, text buttons).
const BRAND_ACCENT = 'light-dark(#2456E6, #8FAFFF)';
// Text over a BRAND_ACCENT fill (math above).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #10131C)';
// Hold-to-send progress sweep: BRAND_FILL_TEXT at 22% over the brand fill
// (lighter wash on the light accent, darker wash on the dark accent) — a
// transient progress affordance, not a state carried by color alone (the
// 600ms hold timer + caption carry it).
const SWEEP_FILL = `color-mix(in srgb, ${BRAND_FILL_TEXT} 22%, transparent)`;

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the celebration
// keyframes (transform/opacity + SVG dashoffset only), and the
// reduced-motion guard that REMOVES flip/pop/confetti/staggers and forces
// the ring + check to their final drawn state (the scx-appear crossfade
// is the one sanctioned reduced-motion transition).
// ---------------------------------------------------------------------------

const SCX_CSS = `
.scx-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.scx-btn:disabled { cursor: default; }
.scx-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.scx-appear { animation: scx-appear 220ms ease both; }
@keyframes scx-appear {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* (1) Confirm card flips away — rotateX exit, transform/opacity only. */
.scx-flip-out {
  animation: scx-flip-out 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  transform-origin: top center;
}
@keyframes scx-flip-out {
  to { transform: perspective(720px) rotateX(-64deg) translateY(-12px); opacity: 0; }
}
/* (2) Ring draws over 480ms, (3) check strokes in over 260ms. */
.scx-ring { animation: scx-ring-draw 480ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
@keyframes scx-ring-draw {
  from { stroke-dashoffset: 277; }
  to { stroke-dashoffset: 0; }
}
.scx-check { animation: scx-check-draw 260ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
@keyframes scx-check-draw {
  from { stroke-dashoffset: 56; }
  to { stroke-dashoffset: 0; }
}
.scx-pop { animation: scx-pop 320ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes scx-pop {
  0% { transform: scale(1); }
  55% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
/* (4) Confetti — per-particle end transforms via custom properties set
   inline from the literal CONFETTI array; gravity-ish: overshoot to
   (--scx-dx, --scx-dy) by 62%, then drift + fall to (--scx-dx2,
   --scx-dy2) while fading. */
.scx-particle { animation: scx-burst 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
@keyframes scx-burst {
  0% { transform: translate(0px, 0px) rotate(0deg) scale(0.5); opacity: 0; }
  10% { opacity: 1; }
  62% { transform: translate(var(--scx-dx), var(--scx-dy)) rotate(var(--scx-rot)) scale(1); opacity: 1; }
  100% { transform: translate(var(--scx-dx2), var(--scx-dy2)) rotate(var(--scx-rot2)) scale(0.9); opacity: 0; }
}
/* (6) Receipt slides up; its 4 rows stagger via per-index animationDelay
   ('backwards' keeps delayed rows hidden until their turn). */
.scx-receipt-in { animation: scx-receipt-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes scx-receipt-in {
  from { transform: translateY(24px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.scx-row-in { animation: scx-row-in 260ms cubic-bezier(0.22, 1, 0.36, 1) backwards; }
@keyframes scx-row-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.scx-done-in { animation: scx-appear 260ms ease both; }
/* Hold-to-send inset sweep — scaleX overlay, 600ms linear fill while
   held, 150ms decelerate rewind on early release. */
.scx-sweep {
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 150ms cubic-bezier(0.22, 1, 0.36, 1);
}
.scx-sweep-on {
  transform: scaleX(1);
  transition: transform 600ms linear;
}
.scx-vh {
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
  .scx-flip-out, .scx-pop, .scx-particle, .scx-receipt-in, .scx-row-in, .scx-done-in { animation: none; }
  .scx-ring, .scx-check { animation: none; stroke-dashoffset: 0 !important; }
  .scx-sweep, .scx-sweep-on { transition: none; }
}
`;

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
    maxWidth: 220,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  brandBtn: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 80},
  // CELEBRATION STAGE — reserves vertical room so the flip → ring swap
  // never shifts the activity list below (minHeight covers both states).
  stage: {marginTop: 16, minHeight: 372, display: 'flex', flexDirection: 'column'},
  // Inset-grouped listCard.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  sectionHeader: {
    margin: '24px 0 8px',
    paddingInline: 32,
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // CONFIRM CARD — recipient 72px media row, amount block, utility rows.
  recipientRow: {
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  thumb48: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '0.04em',
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
  changeHint: {fontSize: 13, fontWeight: 600, color: BRAND_ACCENT, flexShrink: 0},
  amountBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '20px 16px',
  },
  amountBig: {fontSize: 40, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1},
  amountCaption: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  utilityRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  utilityLabel: {fontSize: 13, color: 'var(--color-text-secondary)', width: 64, flexShrink: 0},
  utilityValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  protectionRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // Hold-to-send footer inside the card.
  confirmFooter: {display: 'flex', flexDirection: 'column', gap: 8, padding: 16},
  holdBtn: {
    position: 'relative',
    height: 56,
    borderRadius: 14,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  holdSweep: {position: 'absolute', inset: 0, background: SWEEP_FILL, pointerEvents: 'none'},
  holdLabel: {position: 'relative'},
  holdCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  sendNowBtn: {
    height: 44,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // SUCCESS COLUMN — ring, count-up, receipt, done row.
  successCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    outline: 'none',
    paddingInline: 16,
  },
  ringWrap: {position: 'relative', width: 96, height: 96, marginTop: 8},
  confettiLayer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 0,
    height: 0,
    pointerEvents: 'none',
  },
  particleRect: {position: 'absolute', left: -3, top: -5, width: 6, height: 10, borderRadius: 2},
  particleDot: {position: 'absolute', left: -4, top: -4, width: 8, height: 8, borderRadius: '50%'},
  successTitle: {fontSize: 17, fontWeight: 600, margin: '16px 0 0'},
  countAmount: {
    fontSize: 34,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.15,
    marginTop: 4,
  },
  countCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    marginTop: 2,
    fontVariantNumeric: 'tabular-nums',
  },
  receiptCard: {
    width: '100%',
    marginTop: 20,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  receiptRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  receiptLabel: {fontSize: 13, color: 'var(--color-text-secondary)', width: 88, flexShrink: 0},
  receiptValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    textAlign: 'right',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  receiptRef: {
    minHeight: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    borderTop: '1px solid var(--color-border)',
    fontVariantNumeric: 'tabular-nums',
  },
  doneRow: {width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16},
  doneBtn: {
    height: 48,
    borderRadius: 14,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  sendAgainBtn: {
    height: 44,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // ACTIVITY — 60px two-line rows with 40px thumbs.
  activityRow: {
    width: '100%',
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  thumb40: {
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
    position: 'relative',
  },
  dirBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 16,
    height: 16,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  activityAmountIn: {color: 'var(--color-success)'},
  // TOAST DOCK — sticky height:0 at the end of flow; the polite region
  // sits at bottom:16 (no tabBar on this surface).
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
  toastDismiss: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. TODAY = Fri, Jul 10 · 9:41 AM.
// Balance cross-check: $1,362.60 − $248.00 = $1,114.60 (rendered on the
// Pay-from row and the receipt's New balance row — same constants).
// ---------------------------------------------------------------------------

const TRANSFER_CENTS = 24800;
const BALANCE_BEFORE_CENTS = 136260;
const BALANCE_AFTER_CENTS = BALANCE_BEFORE_CENTS - TRANSFER_CENTS; // 111460
const COUNT_STEPS = 20; // × 35ms interval = 700ms count-up
const SENT_STAMP = 'Fri, Jul 10 · 9:41 AM';
const RECEIPT_REF = 'REF LRK-0710-248Q';

function centsLabel(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rem = `${cents % 100}`.padStart(2, '0');
  return `$${dollars.toLocaleString('en-US')}.${rem}`;
}

// Art gradient from an id-derived hue — white monogram on 40%/26%-
// lightness stops ≈ 4.6:1+ in both schemes (reads as avatar art).
function artGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 45% 40%), hsl(${(hue + 40) % 360} 55% 26%))`;
}

const RECIPIENT = {
  name: 'Maya Trent',
  detail: '@maya-trent · Beacon Credit Union ··4821',
  mono: 'MT',
  hue: 168,
};

interface ActivityFixture {
  id: string;
  name: string;
  detail: string;
  mono: string;
  hue: number;
  amountLabel: string; // dual field beside `incoming`
  incoming: boolean;
}

// 6 fixed rows, Jul 1–9 (plus the derived 'Just now' row post-send).
const ACTIVITY: ActivityFixture[] = [
  {id: 'a-dispatch', name: 'Dispatch Cleaning Co.', detail: 'Jul 9 · Sent · Checking ··2210', mono: 'DC', hue: 24, amountLabel: '−$120.00', incoming: false},
  {id: 'a-priya', name: 'Priya Raman', detail: 'Jul 8 · Received · Dinner split', mono: 'PR', hue: 288, amountLabel: '+$36.50', incoming: true},
  {id: 'a-beacon', name: 'Beacon Credit Union', detail: 'Jul 7 · Transfer in · ··4821', mono: 'BC', hue: 208, amountLabel: '+$400.00', incoming: true},
  {id: 'a-marcus', name: 'Marcus Bell', detail: 'Jul 5 · Sent · Festival tickets', mono: 'MB', hue: 96, amountLabel: '−$62.25', incoming: false},
  {id: 'a-junie', name: "Junie's Coffee Cart", detail: 'Jul 3 · Sent', mono: 'JC', hue: 40, amountLabel: '−$8.75', incoming: false},
  {id: 'a-maya', name: 'Maya Trent', detail: 'Jul 1 · Received · June utilities', mono: 'MT', hue: 168, amountLabel: '+$54.10', incoming: true},
];

// CONFETTI — 18 FIXED particles (deterministic "randomness" by law): 20°
// spacing with a varied literal radius; drift dx2 = round(dx × 1.15) and
// fall dy2 = dy + 48 are fixed arithmetic on these literals. c indexes
// CONFETTI_COLORS; round alternates rect/dot chips.
interface ConfettiParticle {
  dx: number;
  dy: number;
  rot: number;
  delay: number;
  c: number;
  round: boolean;
}

const CONFETTI: ConfettiParticle[] = [
  {dx: 72, dy: 0, rot: 140, delay: 0, c: 0, round: false},
  {dx: 55, dy: -20, rot: -160, delay: 40, c: 1, round: true},
  {dx: 65, dy: -54, rot: 200, delay: 80, c: 2, round: false},
  {dx: 32, dy: -56, rot: -120, delay: 120, c: 3, round: true},
  {dx: 13, dy: -74, rot: 180, delay: 0, c: 0, round: false},
  {dx: -10, dy: -59, rot: -220, delay: 40, c: 1, round: false},
  {dx: -44, dy: -76, rot: 160, delay: 80, c: 2, round: true},
  {dx: -51, dy: -42, rot: -140, delay: 120, c: 3, round: false},
  {dx: -70, dy: -25, rot: 240, delay: 0, c: 0, round: true},
  {dx: -62, dy: 0, rot: -180, delay: 40, c: 1, round: false},
  {dx: -81, dy: 29, rot: 120, delay: 80, c: 2, round: false},
  {dx: -45, dy: 37, rot: -200, delay: 120, c: 3, round: true},
  {dx: -39, dy: 68, rot: 220, delay: 0, c: 0, round: false},
  {dx: -12, dy: 67, rot: -160, delay: 40, c: 1, round: true},
  {dx: 14, dy: 80, rot: 140, delay: 80, c: 2, round: false},
  {dx: 30, dy: 52, rot: -240, delay: 120, c: 3, round: false},
  {dx: 69, dy: 58, rot: 180, delay: 0, c: 0, round: true},
  {dx: 60, dy: 22, rot: -120, delay: 40, c: 1, round: false},
];

// 4 token colors — no literals in the confetti field.
const CONFETTI_COLORS = [
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-data-categorical-blue)',
  'var(--color-data-categorical-purple)',
];

// ---------------------------------------------------------------------------
// CHOREOGRAPHY PHASES — one rank scale; every conditional render derives
// from RANK[phase], never from parallel booleans.
// ---------------------------------------------------------------------------

type Phase = 'confirm' | 'flip' | 'ring' | 'check' | 'burst' | 'receipt' | 'done';

const RANK: Record<Phase, number> = {
  confirm: 0,
  flip: 1,
  ring: 2,
  check: 3,
  burst: 4,
  receipt: 5,
  done: 6,
};

// ---------------------------------------------------------------------------
// SHARED HOOK — container width (the demo's desktop stage is ~1045px in a
// 1440px window; only a ResizeObserver on the wrapper tells stages apart).
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
// SMALL PARTS
// ---------------------------------------------------------------------------

/** Larkpay spark mark — ring + eight-point spark in the brand accent. */
function LarkMark() {
  return (
    <svg width={26} height={26} viewBox="0 0 26 26" aria-hidden>
      <circle cx={13} cy={13} r={11.5} fill="none" stroke={BRAND_ACCENT} strokeWidth={2} />
      <path
        d="M13 6.5 L14.8 11.2 L19.5 13 L14.8 14.8 L13 19.5 L11.2 14.8 L6.5 13 L11.2 11.2 Z"
        fill={BRAND_ACCENT}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileSuccessCelebrationTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth > 560 : isWideViewport;
  // matchMedia + change listener live inside useMediaQuery (repo idiom).
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [phase, setPhase] = useState<Phase>('confirm');
  const [runSeq, setRunSeq] = useState(0);
  const [cents, setCents] = useState(0);
  const [confettiLive, setConfettiLive] = useState(false);
  const [holding, setHolding] = useState(false);
  const [releasedEarly, setReleasedEarly] = useState(false);
  const [toast, setToast] = useState<{seq: number; text: string} | null>(null);

  const holdTimerRef = useRef<number | null>(null);
  const holdBtnRef = useRef<HTMLButtonElement | null>(null);
  const successRef = useRef<HTMLElement | null>(null);

  const rank = RANK[phase];
  const celebrating = rank >= RANK.ring;

  const postToast = useCallback((text: string) => {
    // ONE toast at a time — a new toast REPLACES the old (seq re-keys it).
    setToast(prev => ({seq: (prev?.seq ?? 0) + 1, text}));
  }, []);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current != null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  // COMMIT — the one state update behind the hold gesture, the `Send now`
  // button path, and keyboard activation of the hold button.
  const commit = useCallback(() => {
    clearHoldTimer();
    setHolding(false);
    setReleasedEarly(false);
    if (reducedMotion) {
      // Reduced motion: skip flip/confetti/count-up; final state under the
      // single scx-appear crossfade (ring + check render complete via the
      // CSS guard).
      setCents(TRANSFER_CENTS);
      setPhase('done');
      postToast(`Transfer sent — ${centsLabel(TRANSFER_CENTS)} to ${RECIPIENT.name}`);
      return;
    }
    setPhase('flip');
    setRunSeq(seq => seq + 1);
  }, [clearHoldTimer, postToast, reducedMotion]);

  // THE CHOREOGRAPHY — one effect owns every timer; cleanup clears all
  // (StrictMode/replay safe). Timeline from commit: flip 0–320 · ring
  // 320–800 · check 800–1060 (+pop) · burst + count-up 1120–1820 ·
  // receipt + toast 1900 · confetti unmount 2400 · done 2500.
  useEffect(() => {
    if (runSeq === 0) {
      return undefined;
    }
    const timers: number[] = [];
    let countInterval: number | null = null;
    timers.push(window.setTimeout(() => setPhase('ring'), 320));
    timers.push(window.setTimeout(() => setPhase('check'), 830));
    timers.push(
      window.setTimeout(() => {
        setPhase('burst');
        setConfettiLive(true);
        // (4)+(5): count-up rides the burst — 20 fixed eased steps × 35ms,
        // landing on 24800 exactly at k=20 (no wall-clock reads).
        let step = 0;
        countInterval = window.setInterval(() => {
          step += 1;
          const eased = 1 - Math.pow(1 - step / COUNT_STEPS, 3);
          setCents(Math.round(TRANSFER_CENTS * eased));
          if (step >= COUNT_STEPS && countInterval != null) {
            window.clearInterval(countInterval);
            countInterval = null;
          }
        }, 35);
      }, 1120),
    );
    timers.push(
      window.setTimeout(() => {
        setPhase('receipt');
        setToast(prev => ({
          seq: (prev?.seq ?? 0) + 1,
          text: `Transfer sent — ${centsLabel(TRANSFER_CENTS)} to ${RECIPIENT.name}`,
        }));
      }, 1900),
    );
    // Confetti is REMOVED from the DOM after its 900ms + ≤120ms delays.
    timers.push(window.setTimeout(() => setConfettiLive(false), 2400));
    timers.push(window.setTimeout(() => setPhase('done'), 2500));
    return () => {
      timers.forEach(id => window.clearTimeout(id));
      if (countInterval != null) {
        window.clearInterval(countInterval);
      }
    };
  }, [runSeq]);

  // Focus follows the choreography: the success column takes focus when
  // it mounts so the outcome is the next thing read.
  useEffect(() => {
    if (phase === 'ring' || (phase === 'done' && reducedMotion)) {
      successRef.current?.focus();
    }
  }, [phase, reducedMotion]);

  useEffect(() => clearHoldTimer, [clearHoldTimer]);

  // HOLD-TO-SEND — pointer capture; the 600ms timer is the commit gate
  // (the sweep is its visual). Early release rewinds and hints.
  const onHoldDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setHolding(true);
      setReleasedEarly(false);
      clearHoldTimer();
      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = null;
        commit();
      }, 600);
    },
    [clearHoldTimer, commit],
  );

  const onHoldRelease = useCallback(() => {
    if (holdTimerRef.current != null) {
      clearHoldTimer();
      setHolding(false);
      setReleasedEarly(true);
    }
  }, [clearHoldTimer]);

  // Keyboard activation (click with detail 0) commits directly — the
  // press-and-hold gate is pointer-only by design.
  const onHoldClick = useCallback(
    (event: {detail: number}) => {
      if (event.detail === 0) {
        commit();
      }
    },
    [commit],
  );

  // SEND AGAIN — resets every flag; the whole choreography replays.
  const sendAgain = useCallback(() => {
    clearHoldTimer();
    setPhase('confirm');
    setCents(0);
    setConfettiLive(false);
    setHolding(false);
    setReleasedEarly(false);
    setToast(null);
    requestAnimationFrame(() => holdBtnRef.current?.focus());
  }, [clearHoldTimer]);

  const shellStyle: CSSProperties = isDesktopColumn
    ? {...styles.shell, ...styles.shellDesktop}
    : styles.shell;
  const wrapStyle: CSSProperties = isDesktopColumn
    ? {...styles.wrap, ...styles.wrapWide}
    : styles.wrap;

  const holdCaptionText = releasedEarly
    ? 'Released early — press and hold for 0.6s, or use Send now'
    : 'Press and hold for 0.6s to send';

  const receiptRows = [
    {label: 'To', value: `${RECIPIENT.name} ··4821`},
    {label: 'Sent', value: SENT_STAMP},
    {label: 'Fee', value: '$0.00'},
    {label: 'New balance', value: centsLabel(BALANCE_AFTER_CENTS)},
  ];

  return (
    <div ref={wrapRef} style={wrapStyle}>
      <style>{SCX_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {/* Would leave the page — sanctioned no-op. */}
            <button
              type="button"
              className="scx-btn scx-focusable"
              style={styles.brandBtn}
              aria-label="Larkpay home"
              onClick={() => {}}>
              <LarkMark />
            </button>
          </div>
          <h1 style={styles.navTitle}>{celebrating ? 'Transfer sent' : 'Confirm transfer'}</h1>
          <div style={styles.navTrailing}>
            {/* Would leave the page — sanctioned no-op. */}
            <button
              type="button"
              className="scx-btn scx-focusable"
              style={styles.iconBtn}
              aria-label="Activity"
              onClick={() => {}}>
              <Icon icon={HistoryIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <div style={styles.stage}>
            {rank <= RANK.flip ? (
              <div
                style={styles.listCard}
                className={phase === 'flip' ? 'scx-flip-out' : undefined}
                aria-hidden={phase === 'flip' || undefined}>
                <button
                  type="button"
                  className="scx-btn scx-focusable"
                  style={styles.recipientRow}
                  aria-label={`Change recipient — currently ${RECIPIENT.name}`}
                  onClick={() => {}}>
                  <span style={{...styles.thumb48, background: artGradient(RECIPIENT.hue)}} aria-hidden>
                    {RECIPIENT.mono}
                  </span>
                  <span style={styles.rowText}>
                    <span style={styles.rowPrimary}>{RECIPIENT.name}</span>
                    <span style={styles.rowSecondary}>{RECIPIENT.detail}</span>
                  </span>
                  <span style={styles.changeHint}>Change</span>
                </button>
                <div style={styles.rowDividerDeep} aria-hidden />
                <div style={styles.amountBlock}>
                  <span style={styles.amountBig}>{centsLabel(TRANSFER_CENTS)}</span>
                  <span style={styles.amountCaption}>No fee · Arrives today by 6:00 PM</span>
                </div>
                <div style={styles.rowDivider} aria-hidden />
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>Pay from</span>
                  <span style={styles.utilityValue}>
                    Larkpay balance · {centsLabel(BALANCE_BEFORE_CENTS)}
                  </span>
                </div>
                <div style={styles.rowDivider} aria-hidden />
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>For</span>
                  <span style={styles.utilityValue}>July studio rent</span>
                </div>
                <div style={styles.rowDivider} aria-hidden />
                <div style={styles.protectionRow}>
                  <Icon icon={ShieldCheckIcon} size="sm" color="inherit" />
                  Covered by Larkpay send protection
                </div>
                <div style={styles.rowDivider} aria-hidden />
                <div style={styles.confirmFooter}>
                  <button
                    type="button"
                    ref={holdBtnRef}
                    className="scx-btn scx-focusable"
                    style={styles.holdBtn}
                    aria-describedby="scx-hold-caption"
                    onPointerDown={onHoldDown}
                    onPointerUp={onHoldRelease}
                    onPointerCancel={onHoldRelease}
                    onClick={onHoldClick}>
                    <span
                      style={styles.holdSweep}
                      className={holding ? 'scx-sweep scx-sweep-on' : 'scx-sweep'}
                      aria-hidden
                    />
                    <span style={styles.holdLabel}>Hold to send</span>
                  </button>
                  <span id="scx-hold-caption" style={styles.holdCaption}>
                    {holdCaptionText}
                  </span>
                  {/* MANDATORY BUTTON PATH — commits through the same
                      state update as the hold gesture. */}
                  <button
                    type="button"
                    className="scx-btn scx-focusable"
                    style={styles.sendNowBtn}
                    onClick={commit}>
                    Send now
                  </button>
                </div>
              </div>
            ) : (
              <section
                ref={successRef}
                tabIndex={-1}
                aria-label="Transfer result"
                className="scx-appear"
                style={styles.successCol}>
                <div
                  style={styles.ringWrap}
                  className={rank >= RANK.check && !reducedMotion ? 'scx-pop' : undefined}>
                  {confettiLive && !reducedMotion ? (
                    <div style={styles.confettiLayer} aria-hidden>
                      {CONFETTI.map((particle, index) => (
                        <span
                          key={index}
                          className="scx-particle"
                          style={
                            {
                              ...(particle.round ? styles.particleDot : styles.particleRect),
                              background: CONFETTI_COLORS[particle.c],
                              animationDelay: `${particle.delay}ms`,
                              '--scx-dx': `${particle.dx}px`,
                              '--scx-dy': `${particle.dy}px`,
                              '--scx-dx2': `${Math.round(particle.dx * 1.15)}px`,
                              '--scx-dy2': `${particle.dy + 48}px`,
                              '--scx-rot': `${particle.rot}deg`,
                              '--scx-rot2': `${Math.round(particle.rot * 1.4)}deg`,
                            } as CSSProperties
                          }
                        />
                      ))}
                    </div>
                  ) : null}
                  <svg width={96} height={96} viewBox="0 0 96 96" aria-hidden>
                    <circle
                      cx={48}
                      cy={48}
                      r={44}
                      fill="none"
                      stroke="var(--color-border)"
                      strokeWidth={5}
                    />
                    {/* r=44 ⇒ circumference 2π·44 ≈ 276.5 ⇒ dash 277. */}
                    <circle
                      className="scx-ring"
                      cx={48}
                      cy={48}
                      r={44}
                      fill="none"
                      stroke="var(--color-success)"
                      strokeWidth={5}
                      strokeLinecap="round"
                      strokeDasharray={277}
                      style={{strokeDashoffset: 277}}
                      transform="rotate(-90 48 48)"
                    />
                    {rank >= RANK.check ? (
                      /* Path length ≈ 18.4 + 36.9 = 55.3 ⇒ dash 56. */
                      <path
                        className="scx-check"
                        d="M30 50 L43 63 L67 35"
                        fill="none"
                        stroke="var(--color-success)"
                        strokeWidth={6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={56}
                        style={{strokeDashoffset: 56}}
                      />
                    ) : null}
                  </svg>
                </div>
                <h2 style={styles.successTitle}>Transfer sent</h2>
                {/* Count-up is decorative until it settles; the toast and
                    the receipt carry the announced outcome. */}
                <div style={styles.countAmount} aria-hidden={rank < RANK.receipt || undefined}>
                  {centsLabel(cents)}
                </div>
                <div style={styles.countCaption}>
                  To {RECIPIENT.name} · Arrives today by 6:00 PM
                </div>
                {rank >= RANK.receipt ? (
                  <div style={styles.receiptCard} className="scx-receipt-in">
                    {receiptRows.map((row, index) => (
                      <div key={row.label}>
                        {index > 0 ? <div style={styles.rowDivider} aria-hidden /> : null}
                        <div
                          className="scx-row-in"
                          style={{...styles.receiptRow, animationDelay: `${index * 70}ms`}}>
                          <span style={styles.receiptLabel}>{row.label}</span>
                          <span style={styles.receiptValue}>{row.value}</span>
                        </div>
                      </div>
                    ))}
                    <div style={styles.receiptRef}>{RECEIPT_REF}</div>
                  </div>
                ) : null}
                {rank >= RANK.done ? (
                  <div style={styles.doneRow} className="scx-done-in">
                    {/* Would leave the page — sanctioned no-op. */}
                    <button
                      type="button"
                      className="scx-btn scx-focusable"
                      style={styles.doneBtn}
                      onClick={() => {}}>
                      Done
                    </button>
                    <button
                      type="button"
                      className="scx-btn scx-focusable"
                      style={styles.sendAgainBtn}
                      onClick={sendAgain}>
                      Send again
                    </button>
                  </div>
                ) : null}
              </section>
            )}
          </div>

          <h2 style={styles.sectionHeader}>Recent activity</h2>
          <div style={styles.listCard}>
            {rank >= RANK.receipt ? (
              <>
                <div style={styles.activityRow} className={reducedMotion ? undefined : 'scx-row-in'}>
                  <span style={{...styles.thumb40, background: artGradient(RECIPIENT.hue)}} aria-hidden>
                    {RECIPIENT.mono}
                    <span style={styles.dirBadge}>
                      <Icon icon={ArrowUpRightIcon} size="xsm" color="inherit" />
                    </span>
                  </span>
                  <span style={styles.rowText}>
                    <span style={styles.rowPrimary}>{RECIPIENT.name}</span>
                    <span style={styles.rowSecondary}>Just now · Sent · July studio rent</span>
                  </span>
                  <span style={styles.activityAmount}>−{centsLabel(TRANSFER_CENTS).slice(1)}</span>
                </div>
                <div style={styles.rowDividerDeep} aria-hidden />
              </>
            ) : null}
            {ACTIVITY.map((row, index) => (
              <div key={row.id}>
                {index > 0 ? <div style={styles.rowDividerDeep} aria-hidden /> : null}
                <div style={styles.activityRow}>
                  <span style={{...styles.thumb40, background: artGradient(row.hue)}} aria-hidden>
                    {row.mono}
                    <span style={styles.dirBadge}>
                      <Icon
                        icon={row.incoming ? ArrowDownLeftIcon : ArrowUpRightIcon}
                        size="xsm"
                        color="inherit"
                      />
                    </span>
                  </span>
                  <span style={styles.rowText}>
                    <span style={styles.rowPrimary}>{row.name}</span>
                    <span style={styles.rowSecondary}>{row.detail}</span>
                  </span>
                  <span
                    style={{
                      ...styles.activityAmount,
                      ...(row.incoming ? styles.activityAmountIn : null),
                    }}>
                    {row.amountLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* THE toast dock — single polite live region, sticky at the end
            of flow (bottom:16; no tabBar on this surface). */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} aria-live="polite" role="status">
            {toast != null ? (
              <div key={toast.seq} style={styles.toast} className="scx-appear">
                <span style={styles.toastText}>{toast.text}</span>
                <span style={styles.toastHairline} aria-hidden />
                <button
                  type="button"
                  className="scx-btn scx-focusable"
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
