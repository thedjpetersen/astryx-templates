// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Alpenglow Supply, an outdoor-goods
 *   store, frozen on the suite's anchored "today" of Fri, Jul 4: a 3-item
 *   cart with dual money fields (lineCents + lineLabel) whose totals are
 *   reduce()-derived, never hand-typed (2400 + 3200 + 950 = 6550 subtotal;
 *   9% tax = round(6550 × 0.09) = 590; + 600 shipping ⇒ 7740 = $77.40 on
 *   the Buy button, the sheet total row, the paid pill, and the toast —
 *   all four read TOTAL_CENTS); two payment cards (Zinnia Bank Debit
 *   ·· 4821, Meridian Credit ·· 0937) as fixed-gradient fixtures; a fixed
 *   passcode 1-1-2-2; order #AS-20417 arriving Thu, Jul 10 (Jul 4 + 6).
 *   No Date.now(), no Math.random(), no network media (card art =
 *   hue-gradient tiles + monograms).
 * @output Mobile Biometric Checkout — an Apple-Pay-STYLE (product-neutral
 *   "FacePay") payment-sheet experience. Store screen: order-summary and
 *   delivery listCards, a demo chip that forces the first scan to fail,
 *   and a 48px inverted `Buy with FacePay` button that raises the payment
 *   sheet (translateY slide inside shell + scrim fade). The sheet stacks:
 *   a 2-card wallet (tapping shuffles — outgoing card runs a tilt
 *   keyframe while both slots spring to their new transform), merchant /
 *   account / total rows (account row derives from the front card), and a
 *   72px face-glyph SVG whose confirm choreography is the centerpiece —
 *   a glowing scan bar sweeps twice (translateY keyframe ×2 alternate,
 *   animationend chains the phase), the four face stroke groups tint to
 *   the brand accent with 110ms transition-delay stagger, then the glyph
 *   crossfades into a success ring + check that DRAW ON via
 *   stroke-dashoffset with an overshoot double-pulse scale, the header
 *   stamps DONE (rotate-in), and 600ms later the sheet drops away to a
 *   confirmation banner, a confirmed row folding into the order card, a
 *   paid pill, and a `Payment complete · $77.40` toast. `Use passcode
 *   instead` (44px) swaps the panel for a 4-dot pad (dots pop as they
 *   fill; wrong entries shake the dot row via keyframe and clear on
 *   animationend; 1-1-2-2 succeeds through the SAME succeed() the face
 *   path uses). `Fail first scan` makes attempt one shake + `Try again`;
 *   attempt two succeeds. `Reset demo` restores the whole screen.
 * @position Page template; emitted by `astryx template mobile-biometric-checkout`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the 52px
 *   sticky navBar at y=0 is the first pixel). All overlays (scrim, the
 *   payment sheet) are position:'absolute' INSIDE shell; position:fixed
 *   is banned. While the sheet is open the shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close; the
 *   sheet body is the one legal inner overflowY:'auto' scroller. ONE
 *   polite toast dock rides a sticky bottom:0 wrapper at bottom:16 (no
 *   tab bar on this push-style surface); a new toast REPLACES the old.
 * Animation contract: transform + opacity only, plus SVG
 *   stroke-dashoffset (ring/check draw-on) — no layout properties
 *   animate. Springs = cubic-bezier(0.34, 1.56, 0.64, 1); decelerates =
 *   cubic-bezier(0.22, 1, 0.36, 1). Phases chain on animationend
 *   (scan bar ×2, dot-row shake, card tilt) with staged setTimeout
 *   choreography (all ids registered in timersRef and cleared on
 *   unmount); never wall-clock reads. Reduced motion (via
 *   useMediaQuery('(prefers-reduced-motion: reduce)') + the CSS guard):
 *   sheet/scrim appear instantly, the scan sweep is REMOVED (a 450ms
 *   static "Scanning…" beat), shake/pulse/pop/stamp/fold are removed,
 *   and the ring + check render complete (base stroke-dashoffset: 0 —
 *   the keyframes only lift it during the draw).
 * Accessibility: every gesture-free tap path is a real ≥44×44 button
 *   (cards, keypad keys, chips, Confirm, Use passcode instead); the
 *   sheet is role="dialog" aria-modal with Escape close, a Tab trap, and
 *   focus restore to the opener; one aria-live status line inside the
 *   sheet announces scanning / failure / verified; outcomes outside the
 *   sheet announce through the toast dock.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#3B5BDB, #91A7FF) — contrast math at the
 *   declaration. The Buy button is the token-pure "inverted" pair
 *   (text-primary fill / background-body label). Success = the
 *   var(--color-success) token; errors = var(--color-error). Card art
 *   gradients are fixture art (white 13px/600 monograms on 40%/26%-
 *   lightness stops ≈ 4.6:1+ in both schemes). Never var(--color-text).
 * Density grid (MOBILE, verbatim): 16px screen inset · 12px card gaps ·
 *   24px section gaps · 8px chip gaps; navBar 52px sticky z20 hairline;
 *   inset-grouped listCards (12px radius, 1px border, hairline dividers
 *   inset 16/68); 60px item rows (40px thumbs) · 44px utility rows ·
 *   48px primary buttons · 52px keypad keys · 44×44 icon buttons. TYPE:
 *   17/600 nav+sheet titles · 16/400-500 row primary · 13/400 meta ·
 *   11/500 captions; nothing under 11px; tabular-nums on every figure.
 *
 * Responsive contract:
 * - Fluid 320–430: cards, rows, and the keypad are 1fr/percent-based (no
 *   width:390 literals); the wallet stack is insetInline:0 inside the
 *   16px sheet padding; long labels ellipsize, money never does.
 *   overflowX:'clip' backstop.
 * - Desktop stage (~1045px): useElementWidth ResizeObserver on the
 *   wrapper (container width, not viewport); >560px renders the shell as
 *   a centered 430px phone column (hairline borderInline) on a
 *   var(--color-background-muted) backdrop — never a stretched relayout.
 *   Overlays are shell-absolute so they stay inside the column.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  AnimationEvent as ReactAnimationEvent,
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
} from 'react';

import {
  CheckIcon,
  ChevronLeftIcon,
  DeleteIcon,
  FlaskConicalIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (FacePay indigo). As TEXT on body/card
// surfaces: #3B5BDB on #FFFFFF ≈ 6.3:1; #91A7FF on ~#1F1F22 ≈ 7.0:1 — both
// pass 4.5:1. As a FILL: white 16px/600 on #3B5BDB ≈ 6.3:1; #10163A on
// #91A7FF ≈ 8.6:1 — both pass.
const BRAND_ACCENT = 'light-dark(#3B5BDB, #91A7FF)';
// Text over a BRAND_ACCENT fill (math above).
const BRAND_ON_ACCENT = 'light-dark(#FFFFFF, #10163A)';
// 12% brand wash — decorative chip/seat fills only, never text.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
const SCRIM = 'light-dark(rgba(18, 16, 24, 0.34), rgba(0, 0, 0, 0.55))';
// Card fixture art — same literal gradient in both schemes (reads as card
// art, not chrome). White 13px/600+ text on 40%/26%-lightness stops
// ≈ 4.6:1+ (same construction as the suite's poster gradients).
const CARD_ART_ZINNIA = 'linear-gradient(135deg, hsl(224 45% 40%), hsl(264 55% 26%))';
const CARD_ART_MERIDIAN = 'linear-gradient(135deg, hsl(316 45% 40%), hsl(356 55% 26%))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the motion system
// (transform/opacity + stroke-dashoffset only), and the reduced-motion
// guard that REMOVES loops/shimmer/pulses rather than slowing them.
// ---------------------------------------------------------------------------

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const DECEL = 'cubic-bezier(0.22, 1, 0.36, 1)';

const MBC_CSS = `
.mbc-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.mbc-btn:disabled { cursor: default; }
.mbc-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.mbc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Wallet slots spring between front/back transforms; the outgoing card's
   INNER wrapper runs the tilt so animation and transition never fight
   over one transform. */
.mbc-slot { transition: transform 360ms ${SPRING}, opacity 360ms ease; }
@keyframes mbc-tilt {
  0% { transform: none; }
  45% { transform: translateX(28px) rotate(4deg); }
  100% { transform: none; }
}
.mbc-tilt-run { animation: mbc-tilt 360ms ${SPRING}; }
/* Sheet + scrim entrances; exits are inline transform/opacity through the
   same elements' transitions. */
@keyframes mbc-sheet-in {
  from { transform: translateY(100%); }
  to { transform: none; }
}
.mbc-sheet {
  animation: mbc-sheet-in 380ms ${DECEL};
  transition: transform 320ms ${DECEL};
}
@keyframes mbc-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.mbc-scrim {
  animation: mbc-fade-in 300ms ease;
  transition: opacity 300ms ease;
}
/* Scan bar — two sweeps (alternate ×2), animationend chains the phase. */
@keyframes mbc-scan {
  0% { transform: translateY(-27px); opacity: 0; }
  12% { opacity: 1; }
  88% { opacity: 1; }
  100% { transform: translateY(27px); opacity: 0; }
}
.mbc-scanbar { animation: mbc-scan 680ms cubic-bezier(0.45, 0, 0.55, 1) 0ms 2 alternate both; }
/* Face stroke groups tint with a 110ms stagger while scanning. */
.mbc-fp { stroke: var(--color-text-secondary); transition: stroke 240ms ease; }
.mbc-fp1 { transition-delay: 0ms; }
.mbc-fp2 { transition-delay: 110ms; }
.mbc-fp3 { transition-delay: 220ms; }
.mbc-fp4 { transition-delay: 330ms; }
.mbc-face-tinted .mbc-fp { stroke: ${BRAND_ACCENT}; }
.mbc-glyph-face { transition: opacity 240ms ease; }
/* Success ring + check draw on via stroke-dashoffset; base offset is 0 so
   the reduced-motion guard renders them complete. */
.mbc-ring { stroke-dasharray: 164; stroke-dashoffset: 0; animation: mbc-ring-draw 480ms ${DECEL} both; }
@keyframes mbc-ring-draw {
  from { stroke-dashoffset: 164; }
  to { stroke-dashoffset: 0; }
}
.mbc-check { stroke-dasharray: 35; stroke-dashoffset: 0; animation: mbc-check-draw 260ms ${SPRING} 400ms both; }
@keyframes mbc-check-draw {
  from { stroke-dashoffset: 35; }
  to { stroke-dashoffset: 0; }
}
/* Haptic-style success double pulse, after the draw completes. */
@keyframes mbc-pulse2 {
  0% { transform: scale(1); }
  25% { transform: scale(1.09); }
  50% { transform: scale(1); }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.mbc-pulse2 { animation: mbc-pulse2 560ms ease 480ms; }
@keyframes mbc-shake {
  0%, 100% { transform: none; }
  20% { transform: translateX(-7px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(3px); }
}
.mbc-shake { animation: mbc-shake 420ms ease; }
@keyframes mbc-pop {
  0% { transform: scale(0.3); }
  60% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
.mbc-pop { animation: mbc-pop 240ms ${SPRING}; }
@keyframes mbc-stamp {
  0% { transform: scale(1.6) rotate(-14deg); opacity: 0; }
  100% { transform: scale(1) rotate(-6deg); opacity: 1; }
}
.mbc-stamp { animation: mbc-stamp 320ms ${SPRING} both; }
@keyframes mbc-fold {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.mbc-fold { animation: mbc-fold 260ms ${DECEL}; }
.mbc-anim { transition: transform 220ms ${DECEL}, opacity 220ms ease; }
@media (prefers-reduced-motion: reduce) {
  .mbc-slot, .mbc-sheet, .mbc-scrim, .mbc-glyph-face, .mbc-fp, .mbc-anim { transition: none !important; }
  .mbc-sheet, .mbc-scrim, .mbc-tilt-run, .mbc-pulse2, .mbc-shake, .mbc-pop,
  .mbc-stamp, .mbc-fold, .mbc-ring, .mbc-check { animation: none !important; }
  .mbc-scanbar { display: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

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
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  backLabel: {fontSize: 16, fontWeight: 400, whiteSpace: 'nowrap'},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 32},
  // SUCCESS BANNER — appears after the sheet drops away.
  banner: {
    marginInline: 16,
    marginTop: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid color-mix(in srgb, var(--color-success) 40%, var(--color-border))',
    background: 'color-mix(in srgb, var(--color-success) 10%, var(--color-background-card))',
  },
  bannerSeat: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'color-mix(in srgb, var(--color-success) 18%, transparent)',
    color: 'var(--color-success)',
  },
  bannerText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  bannerTitle: {fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  bannerSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
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
  confirmedRow: {minHeight: 56, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  confirmedSeat: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'color-mix(in srgb, var(--color-success) 18%, transparent)',
    color: 'var(--color-success)',
  },
  confirmedText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  confirmedPrimary: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  confirmedSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 60px item rows with 40px hue-gradient thumbs.
  itemRow: {minHeight: 60, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
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
  itemName: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  itemMeta: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  itemPrice: {fontSize: 16, fontWeight: 500, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', flexShrink: 0},
  totRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
  },
  totLabel: {fontSize: 13, color: 'var(--color-text-secondary)'},
  totValue: {fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums'},
  grandRow: {
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
  },
  grandLabel: {fontSize: 16, fontWeight: 600},
  grandValue: {fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  // 44px utility rows (delivery card).
  utilityRow: {minHeight: 44, display: 'flex', alignItems: 'center', gap: 8, paddingInline: 16},
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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '60%',
  },
  // Demo chip — the failure switch (44px hit).
  demoRow: {display: 'flex', alignItems: 'center', gap: 8, paddingInline: 16, marginTop: 12},
  demoChip: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  demoChipOn: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  demoCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    minWidth: 0,
  },
  // Pay area.
  payArea: {paddingInline: 16, marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12},
  // Token-pure inverted primary (Apple-Pay-style black button, both schemes).
  buyBtn: {
    height: 48,
    borderRadius: 14,
    background: 'var(--color-text-primary)',
    color: 'var(--color-background-body)',
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paidPill: {
    height: 48,
    borderRadius: 14,
    background: 'color-mix(in srgb, var(--color-success) 12%, var(--color-background-card))',
    border: '1px solid color-mix(in srgb, var(--color-success) 40%, var(--color-border))',
    color: 'var(--color-success)',
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontVariantNumeric: 'tabular-nums',
  },
  resetBtn: {
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  footNote: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  // TOAST — the single polite dock, sticky bottom (no tab bar → bottom:16).
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 25, height: 0},
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
    flexShrink: 0,
  },
  // SHEET LAYER — scrim z40, sheet z41, all absolute inside shell.
  scrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
  sheet: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100dvh - 24px)',
    background: 'var(--color-background-card)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 32px var(--color-shadow)',
  },
  sheetHeader: {
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 8,
    borderBottom: '1px solid var(--color-border)',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  doneStamp: {
    justifySelf: 'end',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--color-success)',
    border: '1.5px solid var(--color-success)',
    borderRadius: 6,
    padding: '2px 6px',
  },
  sheetBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '16px 16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  // WALLET STACK — back card peeks above the front card.
  stackZone: {position: 'relative', height: 126},
  cardSlot: {position: 'absolute', insetInline: 0, top: 0},
  walletCard: {
    width: '100%',
    height: 96,
    borderRadius: 14,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#FFFFFF',
  },
  cardTopRow: {display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8},
  cardBank: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  cardMono: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(255, 255, 255, 0.25)',
    fontSize: 11,
    fontWeight: 700,
  },
  cardBottomRow: {display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8},
  cardLast4: {fontSize: 16, fontWeight: 600, letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums'},
  cardKind: {fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85},
  stackCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  // Merchant / account / total group.
  payRows: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  payRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
  },
  payRowLabel: {fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0},
  payRowValue: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  payRowTotal: {fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  payRowHairline: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // AUTH PANEL.
  authPanel: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 4},
  glyphZone: {position: 'relative', width: 88, height: 88, display: 'grid', placeItems: 'center'},
  glyphLayer: {position: 'absolute', inset: 8, display: 'grid', placeItems: 'center'},
  scanBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 42,
    height: 3,
    borderRadius: 2,
    background: BRAND_ACCENT,
    boxShadow: `0 0 12px 2px ${BRAND_TINT_12}`,
    pointerEvents: 'none',
  },
  statusLine: {
    minHeight: 20,
    margin: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  statusError: {color: 'var(--color-error)', fontWeight: 500},
  confirmBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    background: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  confirmBtnBusy: {opacity: 0.6},
  altBtn: {
    height: 44,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // PASSCODE PAD.
  dotsRow: {display: 'flex', gap: 18, alignItems: 'center', justifyContent: 'center', minHeight: 24},
  dot: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: '1.5px solid var(--color-text-secondary)',
  },
  dotFilled: {background: BRAND_ACCENT, border: `1.5px solid ${BRAND_ACCENT}`},
  padGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    width: '100%',
    maxWidth: 300,
  },
  padKey: {
    height: 52,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    fontSize: 22,
    fontWeight: 500,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  padKeyGhost: {background: 'transparent', color: 'var(--color-text-secondary)'},
  padHint: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. Every money figure on screen derives from
// these cents fields via reduce(); no hand-typed totals.
// ---------------------------------------------------------------------------

interface CartItem {
  id: string;
  name: string;
  qty: number;
  lineCents: number;
  hue: number;
  mono: string;
}

const CART_ITEMS: CartItem[] = [
  {id: 'mug', name: 'Trailhead Enamel Mug', qty: 2, lineCents: 2400, hue: 28, mono: 'TM'},
  {id: 'beanie', name: 'Merino Camp Beanie', qty: 1, lineCents: 3200, hue: 172, mono: 'MB'},
  {id: 'stickers', name: 'Fir Ridge Sticker Set', qty: 1, lineCents: 950, hue: 260, mono: 'FS'},
];

// 2400 + 3200 + 950 = 6550; tax = round(6550 × 0.09) = 590; 6550 + 600 +
// 590 = 7740 — the $77.40 on the Buy button, sheet total, paid pill, toast.
const SUBTOTAL_CENTS = CART_ITEMS.reduce((sum, item) => sum + item.lineCents, 0);
const SHIPPING_CENTS = 600;
const TAX_CENTS = Math.round(SUBTOTAL_CENTS * 0.09);
const TOTAL_CENTS = SUBTOTAL_CENTS + SHIPPING_CENTS + TAX_CENTS;

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Item art gradient from the fixture hue (same construction as the suite's
// poster tiles — white monogram ≈ 4.6:1+ on the 40%/26% stops).
function artGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 45% 40%), hsl(${(hue + 40) % 360} 55% 26%))`;
}

type CardId = 'zinnia' | 'meridian';

interface WalletCard {
  id: CardId;
  bank: string;
  kind: string;
  last4: string;
  art: string;
  mono: string;
}

const WALLET_CARDS: Record<CardId, WalletCard> = {
  zinnia: {id: 'zinnia', bank: 'Zinnia Bank', kind: 'Debit', last4: '4821', art: CARD_ART_ZINNIA, mono: 'Z'},
  meridian: {id: 'meridian', bank: 'Meridian Credit', kind: 'Credit', last4: '0937', art: CARD_ART_MERIDIAN, mono: 'M'},
};

const MERCHANT = 'Alpenglow Supply';
const ORDER_NO = 'AS-20417';
const ARRIVES = 'Thu, Jul 10';
const PASSCODE = '1122';
const PAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

// ---------------------------------------------------------------------------
// SHARED HOOKS + FOCUS UTILITIES
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

/** Minimal Tab trap for the sheet dialog (buttons only — the sheet has no
 * other focusable kinds). */
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled])');
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

// ---------------------------------------------------------------------------
// SVG GLYPHS — the 72px face (four stroke groups, tint-staggered) and the
// success ring + check (draw-on via stroke-dashoffset).
// ---------------------------------------------------------------------------

function FaceGlyph({tinted}: {tinted: boolean}) {
  return (
    <svg
      aria-hidden="true"
      className={tinted ? 'mbc-face-tinted' : undefined}
      fill="none"
      height={72}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4.5}
      viewBox="0 0 72 72"
      width={72}>
      {/* Eyes */}
      <path className="mbc-fp mbc-fp1" d="M26 30v7M46 30v7" />
      {/* Nose */}
      <path className="mbc-fp mbc-fp2" d="M38 30v10a4 4 0 0 1-4 4" />
      {/* Mouth */}
      <path className="mbc-fp mbc-fp3" d="M26 50c3 4.5 17 4.5 20 0" />
      {/* Corner frame */}
      <path
        className="mbc-fp mbc-fp4"
        d="M10 22v-6a6 6 0 0 1 6-6h6M50 10h6a6 6 0 0 1 6 6v6M62 50v6a6 6 0 0 1-6 6h-6M22 62h-6a6 6 0 0 1-6-6v-6"
      />
    </svg>
  );
}

function SuccessGlyph() {
  return (
    <svg aria-hidden="true" fill="none" height={72} viewBox="0 0 72 72" width={72}>
      {/* r=26 ⇒ circumference ≈ 163.4 ⇒ dasharray 164 (in the CSS class). */}
      <circle
        className="mbc-ring"
        cx={36}
        cy={36}
        r={26}
        stroke="var(--color-success)"
        strokeLinecap="round"
        strokeWidth={4.5}
        transform="rotate(-90 36 36)"
      />
      {/* Path length ≈ 33.6 ⇒ dasharray 35. */}
      <path
        className="mbc-check"
        d="M25 37.5l8 8L48 29"
        stroke="var(--color-success)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={5}
      />
    </svg>
  );
}

/** 20px face mark for the Buy button label (strokes follow currentColor). */
function FaceMark() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={20}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={6}
      viewBox="0 0 72 72"
      width={20}>
      <path d="M26 30v7M46 30v7M38 30v10a4 4 0 0 1-4 4M26 50c3 4.5 17 4.5 20 0" />
      <path d="M10 22v-6a6 6 0 0 1 6-6h6M50 10h6a6 6 0 0 1 6 6v6M62 50v6a6 6 0 0 1-6 6h-6M22 62h-6a6 6 0 0 1-6-6v-6" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type AuthMode = 'face' | 'passcode';
type ScanPhase = 'idle' | 'scanning' | 'failed' | 'success';

export default function MobileBiometricCheckoutTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 561px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth > 560 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Sheet lifecycle.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  // Wallet stack: [front, back].
  const [cardOrder, setCardOrder] = useState<[CardId, CardId]>(['zinnia', 'meridian']);
  const [tiltId, setTiltId] = useState<CardId | null>(null);
  // Auth state machine.
  const [authMode, setAuthMode] = useState<AuthMode>('face');
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  const [failDemo, setFailDemo] = useState(false);
  const [failedThisOpen, setFailedThisOpen] = useState(false);
  // Passcode pad.
  const [entry, setEntry] = useState('');
  const [entryError, setEntryError] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  // Outcome.
  const [paid, setPaid] = useState(false);
  const [toast, setToast] = useState<{seq: number; text: string} | null>(null);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const buyBtnRef = useRef<HTMLButtonElement | null>(null);
  const resetBtnRef = useRef<HTMLButtonElement | null>(null);
  const timersRef = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(id => window.clearTimeout(id));
  }, []);

  useEffect(() => {
    if (sheetOpen) {
      closeBtnRef.current?.focus();
    }
  }, [sheetOpen]);

  const pushToast = useCallback((text: string) => {
    setToast(prev => ({seq: (prev?.seq ?? 0) + 1, text}));
  }, []);

  const frontCard = WALLET_CARDS[cardOrder[0]];
  const overlayOpen = sheetOpen;
  const authBusy = scanPhase === 'scanning' || scanPhase === 'success';

  // VERBS ---------------------------------------------------------------

  const openSheet = () => {
    setSheetOpen(true);
    setClosing(false);
    setAuthMode('face');
    setScanPhase('idle');
    setFailedThisOpen(false);
    setEntry('');
    setEntryError(false);
    setWrongFlash(false);
  };

  const beginClose = useCallback(
    (didPay: boolean) => {
      setClosing(true);
      const finish = () => {
        setSheetOpen(false);
        setClosing(false);
        setScanPhase('idle');
        if (didPay) {
          setPaid(true);
          pushToast(`Payment complete · ${fmt(TOTAL_CENTS)}`);
        }
        // Restore focus to the opener (or Reset once the opener is gone).
        later(() => {
          (didPay ? resetBtnRef.current : buyBtnRef.current)?.focus();
        }, 30);
      };
      if (reducedMotion) {
        finish();
      } else {
        later(finish, 340);
      }
    },
    [later, pushToast, reducedMotion],
  );

  /** The ONE success path — face scan and passcode both land here. */
  const succeed = useCallback(() => {
    setScanPhase('success');
    // Ring draw 480ms + check 260ms + double pulse, header DONE stamp,
    // then a 600ms hold before the sheet drops (spec beat).
    later(() => beginClose(true), reducedMotion ? 450 : 1250);
  }, [beginClose, later, reducedMotion]);

  const resolveScan = useCallback(() => {
    if (failDemo && !failedThisOpen) {
      setFailedThisOpen(true);
      setScanPhase('failed');
    } else {
      succeed();
    }
  }, [failDemo, failedThisOpen, succeed]);

  const confirmFace = () => {
    if (authBusy || closing) return;
    setScanPhase('scanning');
    if (reducedMotion) {
      // No scan-bar animationend to chain from — a short static beat.
      later(resolveScan, 450);
    }
  };

  const onScanBarEnd = (event: ReactAnimationEvent<HTMLDivElement>) => {
    if (event.animationName === 'mbc-scan') {
      resolveScan();
    }
  };

  const swapCards = () => {
    if (authBusy || closing) return;
    const outgoing = cardOrder[0];
    const incoming = cardOrder[1];
    setCardOrder([incoming, outgoing]);
    if (!reducedMotion) {
      setTiltId(outgoing);
    }
    pushToast(`Paying with ${WALLET_CARDS[incoming].bank} ·· ${WALLET_CARDS[incoming].last4}`);
  };

  const onTiltEnd = (event: ReactAnimationEvent<HTMLDivElement>) => {
    if (event.animationName === 'mbc-tilt') {
      setTiltId(null);
    }
  };

  const pressKey = (digit: string) => {
    if (entryError || authBusy || closing || entry.length >= 4) return;
    setWrongFlash(false);
    const next = entry + digit;
    setEntry(next);
    if (next.length === 4) {
      later(() => {
        if (next === PASSCODE) {
          succeed();
        } else if (reducedMotion) {
          // No shake animationend in reduced motion — clear instantly.
          setEntry('');
          setWrongFlash(true);
        } else {
          setEntryError(true);
          setWrongFlash(true);
        }
      }, 220);
    }
  };

  const onDotsShakeEnd = (event: ReactAnimationEvent<HTMLDivElement>) => {
    if (event.animationName === 'mbc-shake') {
      setEntry('');
      setEntryError(false);
    }
  };

  const backspace = () => {
    if (entryError || authBusy) return;
    setWrongFlash(false);
    setEntry(prev => prev.slice(0, -1));
  };

  const toggleAuthMode = () => {
    if (authBusy || closing) return;
    setAuthMode(prev => (prev === 'face' ? 'passcode' : 'face'));
    setScanPhase('idle');
    setEntry('');
    setEntryError(false);
    setWrongFlash(false);
  };

  const resetDemo = () => {
    setPaid(false);
    setFailDemo(false);
    setCardOrder(['zinnia', 'meridian']);
    pushToast('Demo reset');
  };

  const onSheetKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !closing && scanPhase !== 'success') {
      event.stopPropagation();
      beginClose(false);
      return;
    }
    trapTabKey(event, sheetRef.current);
  };

  // DERIVED STATUS LINE (the sheet's single aria-live region) ------------

  let statusText: string;
  let statusIsError = false;
  if (scanPhase === 'success') {
    statusText = 'Verified — payment approved';
  } else if (authMode === 'passcode') {
    if (wrongFlash) {
      statusText = 'Wrong passcode — try again';
      statusIsError = true;
    } else {
      statusText = `Enter your 4-digit passcode · ${entry.length} of 4`;
    }
  } else if (scanPhase === 'scanning') {
    statusText = 'Scanning…';
  } else if (scanPhase === 'failed') {
    statusText = 'Face not recognized — try again';
    statusIsError = true;
  } else {
    statusText = 'Hold still, then tap Confirm with Face';
  }

  const showGlyph = authMode === 'face' || scanPhase === 'success';

  // RENDER ---------------------------------------------------------------

  return (
    <div
      ref={wrapRef}
      style={{...styles.wrap, ...(isDesktopColumn ? styles.wrapDesktop : null)}}>
      <style>{MBC_CSS}</style>
      <div
        style={{
          ...styles.shell,
          ...(isDesktopColumn ? styles.shellDesktop : null),
          ...(overlayOpen ? styles.shellLocked : null),
        }}>
        <h1 className="mbc-vh">Alpenglow Supply — checkout</h1>

        {/* NAV BAR */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              aria-label="Back to Shop"
              className="mbc-btn mbc-focusable"
              onClick={() => {}}
              style={styles.backBtn}
              type="button">
              <Icon icon={ChevronLeftIcon} size="md" />
              <span style={styles.backLabel}>Shop</span>
            </button>
          </div>
          <h2 style={styles.navTitle}>Checkout</h2>
          <div style={styles.navTrailing} />
        </header>

        <main style={styles.main}>
          {/* CONFIRMATION BANNER — revealed when the sheet drops away. */}
          {paid ? (
            <div className="mbc-fold" style={styles.banner}>
              <span style={styles.bannerSeat}>
                <Icon icon={CheckIcon} size="sm" />
              </span>
              <div style={styles.bannerText}>
                <span style={styles.bannerTitle}>Payment complete</span>
                <span style={styles.bannerSub}>
                  Order #{ORDER_NO} · Arrives {ARRIVES}
                </span>
              </div>
            </div>
          ) : null}

          {/* ORDER SUMMARY */}
          <p style={styles.sectionHeader}>Order summary</p>
          <section aria-label="Order summary" style={styles.listCard}>
            {paid ? (
              <>
                <div className="mbc-fold" style={styles.confirmedRow}>
                  <span style={styles.confirmedSeat}>
                    <Icon icon={CheckIcon} size="sm" />
                  </span>
                  <div style={styles.confirmedText}>
                    <span style={styles.confirmedPrimary}>Confirmed · #{ORDER_NO}</span>
                    <span style={styles.confirmedSecondary}>
                      Paid with {frontCard.bank} {frontCard.kind} ·· {frontCard.last4}
                    </span>
                  </div>
                </div>
                <div style={styles.rowDivider} />
              </>
            ) : null}
            {CART_ITEMS.map((item, index) => (
              <div key={item.id}>
                {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                <div style={styles.itemRow}>
                  <span aria-hidden="true" style={{...styles.itemThumb, background: artGradient(item.hue)}}>
                    {item.mono}
                  </span>
                  <div style={styles.itemText}>
                    <span style={styles.itemName}>{item.name}</span>
                    <span style={styles.itemMeta}>Qty {item.qty}</span>
                  </div>
                  <span style={styles.itemPrice}>{fmt(item.lineCents)}</span>
                </div>
              </div>
            ))}
            <div style={styles.rowDivider} />
            <div style={styles.totRow}>
              <span style={styles.totLabel}>Subtotal</span>
              <span style={styles.totValue}>{fmt(SUBTOTAL_CENTS)}</span>
            </div>
            <div style={styles.totRow}>
              <span style={styles.totLabel}>Shipping</span>
              <span style={styles.totValue}>{fmt(SHIPPING_CENTS)}</span>
            </div>
            <div style={styles.totRow}>
              <span style={styles.totLabel}>Tax (9%)</span>
              <span style={styles.totValue}>{fmt(TAX_CENTS)}</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.grandRow}>
              <span style={styles.grandLabel}>Total</span>
              <span style={styles.grandValue}>{fmt(TOTAL_CENTS)}</span>
            </div>
          </section>

          {/* DELIVERY */}
          <p style={styles.sectionHeader}>Delivery</p>
          <section aria-label="Delivery" style={styles.listCard}>
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Home</span>
              <span style={styles.utilityValue}>418 Fir Ridge Rd, Boulder, CO</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Standard</span>
              <span style={styles.utilityValue}>Arrives {ARRIVES}</span>
            </div>
          </section>

          {/* FAILURE DEMO CHIP */}
          <div style={styles.demoRow}>
            <button
              aria-pressed={failDemo}
              className="mbc-btn mbc-focusable"
              disabled={paid}
              onClick={() => setFailDemo(prev => !prev)}
              style={{...styles.demoChip, ...(failDemo ? styles.demoChipOn : null), ...(paid ? {opacity: 0.5} : null)}}
              type="button">
              <Icon icon={FlaskConicalIcon} size="sm" />
              Fail first scan
            </button>
            <span style={styles.demoCaption}>
              Demo switch — attempt one misses, the retry succeeds.
            </span>
          </div>

          {/* PAY AREA */}
          <div style={styles.payArea}>
            {paid ? (
              <>
                <div className="mbc-fold" style={styles.paidPill}>
                  <Icon icon={CheckIcon} size="sm" />
                  Paid · {fmt(TOTAL_CENTS)}
                </div>
                <button
                  className="mbc-btn mbc-focusable"
                  onClick={resetDemo}
                  ref={resetBtnRef}
                  style={styles.resetBtn}
                  type="button">
                  Reset demo
                </button>
              </>
            ) : (
              <button
                className="mbc-btn mbc-focusable"
                onClick={openSheet}
                ref={buyBtnRef}
                style={styles.buyBtn}
                type="button">
                <FaceMark />
                Buy with FacePay · {fmt(TOTAL_CENTS)}
              </button>
            )}
            <span style={styles.footNote}>FacePay is a demo surface — no real charge is made.</span>
          </div>
        </main>

        {/* TOAST DOCK — the single polite live region. */}
        <div style={styles.dockWrap}>
          <div aria-live="polite" role="status" style={styles.toastRegion}>
            {toast != null ? (
              <div className="mbc-fold" key={toast.seq} style={styles.toast}>
                <span style={styles.toastText}>{toast.text}</span>
                <button
                  aria-label="Dismiss notification"
                  className="mbc-btn mbc-focusable"
                  onClick={() => setToast(null)}
                  style={styles.toastClose}
                  type="button">
                  <Icon icon={XIcon} size="sm" />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* PAYMENT SHEET LAYER */}
        {sheetOpen ? (
          <>
            <div
              aria-hidden="true"
              className="mbc-scrim"
              onClick={() => {
                if (!closing && scanPhase !== 'success') beginClose(false);
              }}
              style={{...styles.scrim, ...(closing ? {opacity: 0} : null)}}
            />
            <div
              aria-label="FacePay payment sheet"
              aria-modal="true"
              className="mbc-sheet"
              onKeyDown={onSheetKeyDown}
              ref={sheetRef}
              role="dialog"
              style={{...styles.sheet, ...(closing ? {transform: 'translateY(110%)'} : null)}}>
              <div style={styles.sheetHeader}>
                <button
                  aria-label="Close payment sheet"
                  className="mbc-btn mbc-focusable"
                  disabled={scanPhase === 'success'}
                  onClick={() => beginClose(false)}
                  ref={closeBtnRef}
                  style={styles.iconBtn}
                  type="button">
                  <Icon icon={XIcon} size="md" />
                </button>
                <h3 style={styles.sheetTitle}>FacePay</h3>
                {scanPhase === 'success' ? (
                  <span className="mbc-stamp" style={styles.doneStamp}>
                    DONE
                  </span>
                ) : (
                  <span />
                )}
              </div>

              <div style={styles.sheetBody}>
                {/* WALLET STACK — tap either card to shuffle. */}
                <div style={styles.stackZone}>
                  {(Object.values(WALLET_CARDS) as WalletCard[]).map(card => {
                    const isFront = cardOrder[0] === card.id;
                    const slotStyle: CSSProperties = isFront
                      ? {transform: 'translateY(28px)', zIndex: 2}
                      : {transform: 'translateY(0px) scale(0.94)', opacity: 0.85, zIndex: 1};
                    return (
                      <div className="mbc-slot" key={card.id} style={{...styles.cardSlot, ...slotStyle}}>
                        <div
                          className={tiltId === card.id ? 'mbc-tilt-run' : undefined}
                          onAnimationEnd={onTiltEnd}>
                          <button
                            aria-label={`${card.bank} ${card.kind} ending ${card.last4}${isFront ? ' — selected' : ' — tap to select'}`}
                            className="mbc-btn mbc-focusable"
                            disabled={authBusy}
                            onClick={swapCards}
                            style={{...styles.walletCard, background: card.art}}
                            type="button">
                            <span style={styles.cardTopRow}>
                              <span style={styles.cardBank}>{card.bank}</span>
                              <span aria-hidden="true" style={styles.cardMono}>
                                {card.mono}
                              </span>
                            </span>
                            <span style={styles.cardBottomRow}>
                              <span style={styles.cardLast4}>·· {card.last4}</span>
                              <span style={styles.cardKind}>{card.kind}</span>
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <span style={styles.stackCaption}>Tap a card to switch payment methods</span>

                {/* MERCHANT / ACCOUNT / TOTAL */}
                <div style={styles.payRows}>
                  <div style={styles.payRow}>
                    <span style={styles.payRowLabel}>Pay to</span>
                    <span style={styles.payRowValue}>{MERCHANT}</span>
                  </div>
                  <div style={styles.payRowHairline} />
                  <div style={styles.payRow}>
                    <span style={styles.payRowLabel}>Account</span>
                    <span style={styles.payRowValue}>
                      {frontCard.bank} {frontCard.kind} ·· {frontCard.last4}
                    </span>
                  </div>
                  <div style={styles.payRowHairline} />
                  <div style={styles.payRow}>
                    <span style={styles.payRowLabel}>Total</span>
                    <span style={styles.payRowTotal}>{fmt(TOTAL_CENTS)}</span>
                  </div>
                </div>

                {/* AUTH PANEL */}
                <div style={styles.authPanel}>
                  {showGlyph ? (
                    <div
                      className={
                        scanPhase === 'success'
                          ? 'mbc-pulse2'
                          : scanPhase === 'failed'
                            ? 'mbc-shake'
                            : undefined
                      }
                      style={styles.glyphZone}>
                      <div
                        className="mbc-glyph-face"
                        style={{...styles.glyphLayer, opacity: scanPhase === 'success' ? 0 : 1}}>
                        <FaceGlyph tinted={scanPhase === 'scanning' || scanPhase === 'success'} />
                      </div>
                      {scanPhase === 'scanning' ? (
                        <div
                          aria-hidden="true"
                          className="mbc-scanbar"
                          onAnimationEnd={onScanBarEnd}
                          style={styles.scanBar}
                        />
                      ) : null}
                      {scanPhase === 'success' ? (
                        <div style={styles.glyphLayer}>
                          <SuccessGlyph />
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <div
                        className={entryError ? 'mbc-shake' : undefined}
                        onAnimationEnd={onDotsShakeEnd}
                        style={styles.dotsRow}>
                        {[0, 1, 2, 3].map(slot => (
                          <span
                            className={slot < entry.length ? 'mbc-pop' : undefined}
                            key={`${slot}-${slot < entry.length ? 'on' : 'off'}`}
                            style={{...styles.dot, ...(slot < entry.length ? styles.dotFilled : null)}}
                          />
                        ))}
                      </div>
                      <div aria-label="Passcode keypad" role="group" style={styles.padGrid}>
                        {PAD_KEYS.map((key, index) =>
                          key === '' ? (
                            <span aria-hidden="true" key={`ghost-${index}`} />
                          ) : key === 'del' ? (
                            <button
                              aria-label="Delete last digit"
                              className="mbc-btn mbc-focusable"
                              key="del"
                              onClick={backspace}
                              style={{...styles.padKey, ...styles.padKeyGhost}}
                              type="button">
                              <Icon icon={DeleteIcon} size="md" />
                            </button>
                          ) : (
                            <button
                              className="mbc-btn mbc-focusable"
                              key={key}
                              onClick={() => pressKey(key)}
                              style={styles.padKey}
                              type="button">
                              {key}
                            </button>
                          ),
                        )}
                      </div>
                      <span style={styles.padHint}>Demo passcode: 1-1-2-2</span>
                    </>
                  )}

                  <p
                    aria-live="polite"
                    role="status"
                    style={{...styles.statusLine, ...(statusIsError ? styles.statusError : null)}}>
                    {statusText}
                  </p>

                  {scanPhase !== 'success' ? (
                    <>
                      {authMode === 'face' ? (
                        <button
                          className="mbc-btn mbc-focusable"
                          disabled={scanPhase === 'scanning'}
                          onClick={confirmFace}
                          style={{
                            ...styles.confirmBtn,
                            ...(scanPhase === 'scanning' ? styles.confirmBtnBusy : null),
                          }}
                          type="button">
                          {scanPhase === 'scanning'
                            ? 'Scanning…'
                            : scanPhase === 'failed'
                              ? 'Try again'
                              : 'Confirm with Face'}
                        </button>
                      ) : null}
                      <button
                        className="mbc-btn mbc-focusable"
                        onClick={toggleAuthMode}
                        style={styles.altBtn}
                        type="button">
                        {authMode === 'face' ? 'Use passcode instead' : 'Use Face instead'}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
