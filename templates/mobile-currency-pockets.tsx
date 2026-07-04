// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Denari split-wallet for the
 *   'Kyoto & Lisbon' trip, Day 7 of 12 (6 days left): four currency
 *   pockets (EUR 420.00 / 70 planned per day, JPY 62,000 / 9,000, GBP
 *   150.00 / 25, THB 8,400 / 1,200) whose USD values cross-check to the
 *   navBar ticker $1,293.60 (453.60 + 418.50 + 190.50 + 231.00); an
 *   11-entry activity ledger whose today-spends per currency ARE each
 *   pocket's spentToday (EUR 46.50, JPY 11,200, THB 1,140, GBP 0) and sum
 *   to the 'TODAY · −$157.17' header (50.22 + 75.60 + 31.35). Rates to
 *   USD fixed (EUR 1.08, JPY 0.00675, GBP 1.27, THB 0.0275); EUR→JPY mid
 *   = 1.08/0.00675 = 160.00 exactly, spread 1.25%, locked rate 158.00.
 *   No Date.now(), no Math.random(), no network media.
 * @output Denari — Currency Pockets: a 390px MOBILE traveler's
 *   split-wallet. NavBar (28px interlocking half-moon Denari mark ·
 *   stacked 'USD total' / $1,293.60 ticker · ArrowLeftRight exchange
 *   button) over a Wallet screen (trip header, POCKETS listCard of four
 *   76px pocket-meter rows pacing today's spend against plan — JPY at
 *   124% wears the error recolor + 'over plan' caption — with
 *   swipe-to-reveal Spend blocks and 44×44 ellipsis actionSheets, and a
 *   sticky 'New spend' footer) and an Activity screen (TODAY/YESTERDAY
 *   ledgers, EXCHANGE-badged rows, refresh→skeleton flow). Signature
 *   move: the two-detent exchange sheet's dual-readout slider
 *   counter-rolls '−€120.00' / '+¥18,960' under a draining 30-second
 *   rate-lock ring; committing rolls both pocket rows, re-derives the
 *   ticker to $1,291.98, prepends an EXCHANGE entry carrying the −$1.62
 *   spread, and badges the Activity tab. A full-screen spend-ticket
 *   keypad cover previews the residual pacing effect (¥1,500 → 141%
 *   over-plan preview) before committing with Undo.
 * @position Page template; emitted by `astryx template mobile-currency-pockets`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the
 *   first pixel). All overlays (scrims, exchange sheet, spend cover,
 *   action sheet, alert, toast) are position:'absolute' INSIDE shell;
 *   position:fixed is banned. While any overlay is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close. The
 *   stage clips to --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for chip-led rows); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Denari indigo — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule).
 *   Per the batch-2 amendment, every interactive boundary and
 *   meaningful rest-state fill (pacing-bar tracks, slider track,
 *   unselected chip borders, lock-ring track) gets an explicit
 *   light-dark() pair at ≥3:1 against its ACTUAL surface, math at each
 *   declaration; hairline tokens are reserved for passive separators.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON —
 *   scroll-under not wired, noted per contract); tabBar 64px sticky
 *   bottom z20 (2 tabs, 24px icon over 11px/500 label, 4px gap); pocket
 *   rows 76px (40px currency chip circle, divider inset 68); activity
 *   rows 60px two-line; utility rows 44px; sectionHeader 13px/600
 *   uppercase 0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px
 *   bottom; buttons 48px primary / 36px secondary / 44×44 icon; sheet
 *   detents 55% medium / calc(100% − 56px) large, 24px grabber zone with
 *   36×5 pill, 52px sheet header; toastDock sticky bottom 64 in flow
 *   z30 (absolute bottom 76 while an overlay locks the shell). TYPE
 *   (Figtree via --font-family-body): 28/700 dual readouts + keypad
 *   amount · 22/700 trip title · 17/600 nav+sheet titles · 16/400–600
 *   body floor · 13/400 secondary · 11/500 overlines+badges; nothing
 *   under 11px; tabular-nums on every balance, rate, ticker, countdown.
 *   Touch: every target ≥44×44 with ≥8px clearance or merged into a
 *   full-row button; every gesture (swipe-reveal, sheet drag, slider
 *   drag) has a visible button/keyboard path.
 *
 * Responsive contract:
 * - Fluid 320–430px: all widths fluid (no width:390 literals); slider
 *   travel computed from a measured ref width; the two 28px/700 dual
 *   readouts stack VERTICALLY 8px apart so 320px never squeezes them;
 *   pocket names ellipsize, numbers never do; keypad keys flex-grow;
 *   navBar ticker capped at 200px. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline); sticky navBar/tabBar and absolute overlays
 *   stay inside the column because they anchor to shell. No adaptive
 *   relayout — the pocket-meter anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  ArrowLeftRightIcon,
  DeleteIcon,
  MoreHorizontalIcon,
  ReceiptIcon,
  RefreshCwIcon,
  WalletIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Denari indigo). #4F46E5 on #FFFFFF ≈
// 6.3:1 (passes 4.5:1 for brand-tinted text); #A5B4FC on the dark card
// (~#1C1C1E) ≈ 8.6:1.
const BRAND_ACCENT = 'light-dark(#4F46E5, #A5B4FC)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #4F46E5 ≈ 6.3:1 ✓.
// Dark: white on #A5B4FC fails (~1.9:1), so the dark side flips to a
// near-black indigo — #1E1B4B on #A5B4FC ≈ 7.6:1 ✓ (also the EXCHANGE
// badge pair from the spec's a11y plan).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #1E1B4B)';
// 12% brand wash for selected inline-picker rows / active-tab tint math
// is decorative only (selection is also encoded by a check + weight).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// The Denari mark's second half-moon (decorative, aria-hidden).
const BRAND_MOON_ALT = 'light-dark(#6366F1, #818CF8)';
// AMENDMENT PAIR — meaningful rest-state fills & interactive boundaries
// at ≥3:1 vs their ACTUAL surface (the white/dark CARD, not the body):
// pacing-bar tracks, the slider track, unselected spend-chip borders.
// Light #878E99 vs #FFFFFF: L≈0.276 → (1.05/0.326) ≈ 3.2:1 ✓.
// Dark #767E8C vs #1C1C1E card: L≈0.204 → (0.254/0.061) ≈ 4.2:1 ✓.
const REST_EDGE = 'light-dark(#878E99, #767E8C)';
// Error meter fill + 'over plan' caption. #DC2626 on #FFFFFF ≈ 4.5:1
// (text) and vs the white card fill-contrast ≈ 4.5:1 ≥ 3:1 ✓; #F87171
// on the dark card ≈ 6.0:1 ✓ (11px/600 caption passes 4.5:1 both).
const ERROR_METER = 'light-dark(#DC2626, #F87171)';
// 11px meter captions — explicit pair ≥4.5:1 vs card per the a11y plan.
// #4B5563 on #FFFFFF ≈ 7.6:1 ✓; #9CA3AF on the dark card ≈ 6.7:1 ✓.
const CAPTION_INK = 'light-dark(#4B5563, #9CA3AF)';
// Lock-ring TRACK sits on the BRAND confirm button fill, so the ≥3:1
// math is vs BRAND_ACCENT itself: 55% white over #4F46E5 blends to
// ≈#B0ACF3 → vs #4F46E5 ≈ 3.1:1 ✓; 60% #1E1B4B over #A5B4FC blends to
// ≈#54588F → vs #A5B4FC ≈ 3.1:1 ✓. (Spec drew the ring stroke in BRAND
// on a neutral track; on a brand-filled button that stroke would
// vanish, so stroke = BRAND_FILL_TEXT — deviation noted in summary.)
const RING_TRACK = 'light-dark(rgba(255,255,255,0.55), rgba(30,27,75,0.6))';
// Spread hatch band at the slider fill tip — the visible cost of the
// lock vs mid (decorative shading on top of the brand fill).
const SPREAD_HATCH = 'light-dark(rgba(79,70,229,0.35), rgba(165,180,252,0.35))';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21,17,12,0.32), rgba(0,0,0,0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// digit-roll / pulse / shimmer keyframes. Transitions animate
// transform/opacity only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const DENARI_CSS = `
.dnr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.dnr-btn:disabled { cursor: default; }
.dnr-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.dnr-anim { transition: transform 200ms ease, opacity 200ms ease; }
@keyframes dnr-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.dnr-sheet-in { animation: dnr-sheet-in 200ms ease; }
@keyframes dnr-roll-up {
  from { transform: translateY(0.55em); opacity: 0.2; }
  to { transform: none; opacity: 1; }
}
@keyframes dnr-roll-down {
  from { transform: translateY(-0.55em); opacity: 0.2; }
  to { transform: none; opacity: 1; }
}
.dnr-roll-up { animation: dnr-roll-up 200ms ease; }
.dnr-roll-down { animation: dnr-roll-down 200ms ease; }
@keyframes dnr-pulse {
  0% { transform: scale(1); }
  40% { transform: scale(0.98); }
  100% { transform: scale(1); }
}
.dnr-pulse { animation: dnr-pulse 200ms ease; }
@keyframes dnr-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.dnr-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, light-dark(rgba(255,255,255,0.55), rgba(255,255,255,0.08)), transparent);
  animation: dnr-shimmer 1.6s linear infinite;
}
.dnr-vh {
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
  .dnr-anim { transition: none; }
  .dnr-sheet-in, .dnr-roll-up, .dnr-roll-down, .dnr-pulse { animation: none; }
  .dnr-shimmer { display: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window, so viewport queries
  // alone cannot tell the two stages apart).
  wrap: {width: '100%'},
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
  // Scroll lock while any overlay is open — absolute overlays anchor to
  // the visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px icon buttons
  // optically align content to the 16px gutter. Hairline + blur ALWAYS ON.
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  // Center ticker — 11px/500 overline over 17px/600 tabular value; fits
  // the 52px bar (11 + 2 + 17 + padding) and caps at 200px.
  tickerStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    maxWidth: 200,
    minWidth: 0,
  },
  tickerOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  tickerValue: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // TRIP HEADER — 24px below nav: 22/700 title + 13/400 tabular sub.
  tripHeader: {
    marginTop: 24,
    paddingInline: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  tripTitle: {fontSize: 22, fontWeight: 700, lineHeight: 1.2, margin: 0},
  tripSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom.
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // POCKET ROW — 76px media row: 40px currency chip circle at 16px,
  // center stack (line1 + meter + caption), trailing balance meta,
  // 44×44 ellipsis (swipe fallback). Swipe reveals a 72px Spend block.
  pocketOuter: {position: 'relative'},
  pocketClip: {position: 'relative', overflow: 'hidden'},
  spendAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  pocketContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  pocketRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 76,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  chipCircle: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 16,
    fontWeight: 700,
  },
  pocketCenter: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  pocketLine1: {display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0},
  pocketName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pocketTag: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexShrink: 4,
  },
  // 4px pacing bar, radius 2; track = REST_EDGE (≥3:1 vs the card per
  // the amendment — this is a meaningful rest fill, not a separator).
  meterTrack: {
    height: 4,
    borderRadius: 2,
    background: REST_EDGE,
    overflow: 'hidden',
  },
  meterFill: {height: '100%', borderRadius: 2, background: BRAND_ACCENT},
  meterCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: CAPTION_INK,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pocketMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
    flexShrink: 0,
    marginLeft: 'auto',
    paddingInlineStart: 8,
  },
  pocketBalance: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  pocketUsd: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  overPlanCaption: {
    fontSize: 11,
    fontWeight: 600,
    color: ERROR_METER,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
  },
  // WALLET sticky footer — the screen's primary verb in the thumb zone;
  // sticky bottom 64 (kisses the tabBar top), blur surface, 16px pad.
  walletFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 20,
    marginTop: 24,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryBtnDisabled: {opacity: 0.4},
  secondaryBtn: {
    width: '100%',
    height: 36,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  // ACTIVITY — 60px two-line rows.
  activityRowBtn: {
    width: '100%',
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  activityText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  activityPrimaryLine: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  activityMerchant: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  activitySecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  // 16px-tall brand EXCHANGE badge pill, 11px/500 (contrast pair at
  // BRAND_FILL_TEXT declaration).
  exchangeBadge: {
    height: 16,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 6,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    flexShrink: 0,
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SKELETON — 60px rows, 12px bars, deterministic widths, one shimmer.
  skeletonRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skeletonStack: {flex: 1, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {
    height: 12,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
  },
  // TOAST DOCK — sticky in flow at the end of scroll content, bottom 64
  // (kisses the tabBar top), z30; flips to absolute bottom 76 while an
  // overlay locks the shell (shell-absolute is only correct then).
  toastDock: {
    position: 'sticky',
    bottom: 64,
    zIndex: 30,
    insetInline: 0,
    paddingInline: 16,
    paddingBottom: 8,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    // z55 while locked: above sheet z41 / cover z50 (the lock-expiry
    // toast must be readable over the open sheet), below alert z60.
    zIndex: 55,
    paddingInline: 0,
    paddingBottom: 0,
  },
  toast: {
    minHeight: 48,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastMsg: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // TAB BAR — 64px sticky bottom z20, 2 tabs, icon over 11px/500 label.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    flexShrink: 0,
    display: 'flex',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  tabItem: {
    flex: 1,
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // EXCHANGE SHEET — scrim z40 + sheet z41, two detents.
  sheetScrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
  sheet: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-card)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 32px var(--color-shadow)',
  },
  grabberZone: {
    width: '100%',
    height: 24,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    touchAction: 'none',
  },
  grabberPill: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 8,
  },
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  // Pocket pair row — two 36px pill buttons (radius 8 per corner map).
  pairRow: {display: 'flex', gap: 8, marginTop: 8},
  pairPill: {
    flex: 1,
    minWidth: 0,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  // Inline picker (a sheet may NOT open another sheet — pocket pickers
  // expand as a 44px-row list inside the sheet).
  pickerList: {
    marginTop: 8,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  pickerRowOn: {background: BRAND_TINT_12, fontWeight: 600},
  pickerRowMeta: {
    marginLeft: 'auto',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Dual readout — the two 28/700 lines stack VERTICALLY 8px apart so
  // 320px never squeezes them.
  dualReadout: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
  },
  readoutLine: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  readoutOut: {color: 'var(--color-text-primary)'},
  readoutIn: {color: BRAND_ACCENT},
  // Slider — 4px track radius 2 (REST_EDGE pair, ≥3:1 vs the sheet
  // card), brand fill, 28px handle inside a 44px-tall padded hit wrap.
  sliderWrap: {
    marginTop: 20,
    position: 'relative',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    touchAction: 'none',
  },
  sliderTrack: {
    position: 'absolute',
    insetInline: 0,
    top: 20,
    height: 4,
    borderRadius: 2,
    background: REST_EDGE,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 20,
    height: 4,
    borderRadius: 2,
    background: BRAND_ACCENT,
  },
  // 1.25%-of-fill hatch band at the fill tip (min 3px) — the lock's
  // visible cost vs mid.
  sliderHatch: {
    position: 'absolute',
    top: 18,
    height: 8,
    borderRadius: 2,
    background: `repeating-linear-gradient(135deg, ${SPREAD_HATCH} 0 2px, transparent 2px 4px)`,
    border: `1px solid ${SPREAD_HATCH}`,
  },
  sliderHandle: {
    position: 'absolute',
    top: 8,
    width: 28,
    height: 28,
    borderRadius: '50%',
    // White in both schemes per spec; on the light sheet the ≥3:1
    // boundary comes from the shadow ring + REST_EDGE border below.
    background: '#FFFFFF',
    border: `1px solid ${REST_EDGE}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
  },
  rateLine: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 'Enter amount instead' — 44px utility row.
  utilityRow: {
    width: '100%',
    height: 44,
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
    borderRadius: 12,
  },
  formField: {marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8},
  formLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  formInput: {
    height: 48,
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-background-muted)',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    boxShadow: 'inset 0 0 0 2px transparent',
  },
  formInputFocus: {boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`},
  formInputError: {boxShadow: `inset 0 0 0 2px var(--color-error)`},
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-error)',
    fontVariantNumeric: 'tabular-nums',
  },
  convertBtnRow: {position: 'relative'},
  convertReason: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  lockRingWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  lockRingLabel: {fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  // SPEND COVER — absolute inset 0 z50, own 52px navBar.
  cover: {
    position: 'absolute',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-body)',
  },
  coverBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 16px'},
  chipRow: {display: 'flex', gap: 8, flexWrap: 'wrap'},
  // 36px spend chips — unselected boundary is REST_EDGE (≥3:1 vs the
  // body surface per the amendment: an interactive control boundary,
  // not a passive separator).
  chipBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: `1px solid ${REST_EDGE}`,
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  chipBtnOn: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  amountReadout: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  previewCard: {
    marginTop: 20,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    background: 'var(--color-background-card)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  previewLine: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  keypad: {
    marginTop: 24,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  keypadKey: {
    height: 48,
    borderRadius: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    fontSize: 22,
    fontWeight: 500,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  coverFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  // ACTION SHEET — scrim + two stacked cards at insetInline 16 bottom 16.
  actionSheetWrap: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  actionSheetCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  actionSheetHeader: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  actionSheetRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  actionSheetRowDestructive: {color: 'var(--color-error)'},
  actionSheetCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  fullDivider: {height: 1, background: 'var(--color-border)'},
  // CENTERED ALERT — the blocking irreversible interrupt (z60/61).
  alertScrim: {position: 'absolute', inset: 0, zIndex: 60, background: SCRIM},
  alert: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(280px, calc(100% - 64px))',
    zIndex: 61,
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  alertContent: {padding: 20, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center'},
  alertTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  alertBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  alertButtons: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtn: {
    flex: 1,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 400,
    color: 'var(--color-text-primary)',
  },
  alertBtnCommit: {fontWeight: 600, color: BRAND_ACCENT},
  alertVRule: {width: 1, background: 'var(--color-border)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checking aggregates.
// TICKER LEDGER (round half-up to cents, then sum): 420×1.08 = 453.60;
// 62,000×0.00675 = 418.50; 150×1.27 = 190.50; 8,400×0.0275 = 231.00 →
// 453.60+418.50 = 872.10; +190.50 = 1,062.60; +231.00 = $1,293.60 ✓.
// TODAY SPEND LEDGER: EUR 8.00+14.50+24.00 = 46.50 ✓; JPY
// 1,800+3,400+6,000 = 11,200 ✓; THB 540+600 = 1,140 ✓; USD header
// 46.50×1.08 = 50.22; 11,200×0.00675 = 75.60; 1,140×0.0275 = 31.35 →
// 50.22+75.60 = 125.82; +31.35 = −$157.17 ✓. EXCHANGE: EUR→JPY mid =
// 1.08/0.00675 = 160.00; ×0.9875 = 158.00 locked; 120×158 = 18,960 ✓;
// post-commit ticker 324.00+546.48+190.50+231.00 = $1,291.98 ✓; spread
// cost 1,293.60−1,291.98 = $1.62 ✓. Yesterday 80×158 = 12,640 ✓ (spread
// 80×(160−158)×0.00675 = $1.08). SPEND DEMO (¥1,500): 62,000−1,500 =
// 60,500; 11,200+1,500 = 12,700 of 9,000 = 141%; runway 60,500/9,000 =
// 6.7d; header 157.17 + round(1,500×0.00675) 10.13 = −$167.30 ✓.
// ---------------------------------------------------------------------------

const HOME = 'USD';
const TRIP = {name: 'Kyoto & Lisbon', day: 7, of: 12, daysLeft: 6};
const SPREAD_PCT = 1.25; // locked = mid × (1 − 0.0125)

type PocketId = 'eur' | 'jpy' | 'gbp' | 'thb';

// Mid rates to USD, fixed.
const RATES: Record<PocketId, number> = {
  eur: 1.08,
  jpy: 0.00675,
  gbp: 1.27,
  thb: 0.0275,
};

const SYMBOLS: Record<PocketId, string> = {eur: '€', jpy: '¥', gbp: '£', thb: '฿'};
const DECIMALS: Record<PocketId, number> = {eur: 2, jpy: 0, gbp: 2, thb: 0};
const CODES: Record<PocketId, string> = {eur: 'EUR', jpy: 'JPY', gbp: 'GBP', thb: 'THB'};

// Slider domain per FROM currency — the documented EUR case is 0–300
// step 5 (cap chosen below the 420.00 balance so no insufficient-funds
// path is fake); other pockets scale the same shape.
const SLIDER_MAX: Record<PocketId, number> = {eur: 300, jpy: 30000, gbp: 120, thb: 6000};
const SLIDER_STEP: Record<PocketId, number> = {eur: 5, jpy: 500, gbp: 5, thb: 100};

interface Pocket {
  id: PocketId;
  name: string;
  tag: string;
  balance: number; // pocket currency
  plannedPerDay: number; // pocket currency
}

const POCKETS: Pocket[] = [
  {id: 'eur', name: 'Euro', tag: 'Trains & transit', balance: 420.0, plannedPerDay: 70.0},
  {id: 'jpy', name: 'Yen', tag: 'Food & markets', balance: 62000, plannedPerDay: 9000},
  {id: 'gbp', name: 'Pound', tag: 'Layover fund', balance: 150.0, plannedPerDay: 25.0},
  {id: 'thb', name: 'Baht', tag: 'Beach week', balance: 8400, plannedPerDay: 1200},
];

interface ActivityEntry {
  id: string;
  kind: 'spend' | 'exchange';
  merchant: string;
  pocketId: PocketId;
  meta: string; // fixed 'pocket · time' string — no clocks
  amount: number; // pocket currency, positive magnitude (spends)
  receivedText?: string; // exchange rows: trailing '+¥12,640'
  day: 'today' | 'yesterday';
}

// 11 entries; today's spends per currency ARE each pocket's spentToday.
const ACTIVITY: ActivityEntry[] = [
  {id: 'act_01', kind: 'spend', merchant: 'Metro pass', pocketId: 'eur', meta: 'Euro · 7:58 AM', amount: 8.0, day: 'today'},
  {id: 'act_02', kind: 'spend', merchant: 'Café Lume', pocketId: 'eur', meta: 'Euro · 9:20 AM', amount: 14.5, day: 'today'},
  {id: 'act_03', kind: 'spend', merchant: 'Museo ticket', pocketId: 'eur', meta: 'Euro · 11:05 AM', amount: 24.0, day: 'today'},
  {id: 'act_04', kind: 'spend', merchant: 'Ramen Genki', pocketId: 'jpy', meta: 'Yen · 12:40 PM', amount: 1800, day: 'today'},
  // 'Rail day pass' is the 320px truncation stress (stress fixture 6):
  // the 16px name ellipsizes; the −¥3,400 amount never does.
  {id: 'act_05', kind: 'spend', merchant: 'Rail day pass', pocketId: 'jpy', meta: 'Yen · 8:15 AM', amount: 3400, day: 'today'},
  {id: 'act_06', kind: 'spend', merchant: 'Donki snacks', pocketId: 'jpy', meta: 'Yen · 1:30 PM', amount: 6000, day: 'today'},
  {id: 'act_07', kind: 'spend', merchant: 'Street market', pocketId: 'thb', meta: 'Baht · 10:10 AM', amount: 540, day: 'today'},
  {id: 'act_08', kind: 'spend', merchant: 'Ferry token', pocketId: 'thb', meta: 'Baht · 12:05 PM', amount: 600, day: 'today'},
  {
    id: 'act_09',
    kind: 'exchange',
    merchant: 'Exchanged €80 → ¥12,640',
    pocketId: 'eur',
    meta: 'Euro → Yen · −$1.08 spread',
    amount: 80,
    receivedText: '+¥12,640',
    day: 'yesterday',
  },
  {id: 'act_10', kind: 'spend', merchant: 'Hostel Lumen', pocketId: 'eur', meta: 'Euro · 9:12 PM', amount: 38.0, day: 'yesterday'},
  {id: 'act_11', kind: 'spend', merchant: '7-Eleven', pocketId: 'thb', meta: 'Baht · 10:02 PM', amount: 420, day: 'yesterday'},
];

// Deterministic skeleton widths (never Math.random) — primary cycle
// 60/45/70/60, secondary 40/55/30/40.
const SKELETON_PRIMARY = ['60%', '45%', '70%', '60%'];
const SKELETON_SECONDARY = ['40%', '55%', '30%', '40%'];

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Pocket value → '€420.00' / '¥62,000' (symbol + fixed decimals). */
function fmtCur(id: PocketId, value: number): string {
  const d = DECIMALS[id];
  return `${SYMBOLS[id]}${value.toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })}`;
}

/**
 * Compact pocket value for the 11px meter caption — whole amounts drop
 * their '.00' ('€70', '£25') so the '… · 6.0d runway' tail fits the
 * center column at 390px without ellipsis (fit deviation, noted).
 */
function fmtCurCompact(id: PocketId, value: number): string {
  const d = Number.isInteger(value) ? 0 : DECIMALS[id];
  return `${SYMBOLS[id]}${value.toLocaleString('en-US', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })}`;
}

/** USD cents → '$1,293.60'. */
function fmtUsd(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Pocket value → USD cents, round half-up (the ticker law). */
function toUsdCents(id: PocketId, value: number): number {
  return Math.round(value * RATES[id] * 100);
}

/** Cross mid rate FROM→TO (EUR→JPY = 1.08/0.00675 = 160.00 exactly). */
function midRate(from: PocketId, to: PocketId): number {
  return RATES[from] / RATES[to];
}

/** Locked rate = mid × (1 − spread). EUR→JPY: 160 × 0.9875 = 158.00. */
function lockedRate(from: PocketId, to: PocketId): number {
  return midRate(from, to) * (1 - SPREAD_PCT / 100);
}

/** Received amount in TO units — integer for 0-decimal currencies. */
function convertOut(from: PocketId, to: PocketId, amount: number): number {
  const raw = amount * lockedRate(from, to);
  const d = DECIMALS[to];
  return Math.round(raw * 10 ** d) / 10 ** d;
}

/** Rate rendered at the TO currency's display precision + 2. */
function fmtRate(to: PocketId, rate: number): string {
  return `${SYMBOLS[to]}${rate.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useState(initialStore) + one update(patch|fn) setter;
// helpers updatePocket(id, patch) and prependActivity(entry) are thin
// wrappers. Aggregates (ticker, spentToday, pace, runway, TODAY header,
// entry count) are NEVER stored — always derived from pockets/activity.
// ---------------------------------------------------------------------------

type Overlay =
  | null
  | 'exchange'
  | 'spend'
  | `actionSheet:${PocketId}`
  | `alert:${PocketId}`;

interface ExchangeState {
  from: PocketId;
  to: PocketId;
  amount: number; // FROM units
  secondsLeft: number;
  expired: boolean;
  inputMode: boolean;
  inputValue: string;
  inputError: string | null;
  pickerOpen: null | 'from' | 'to';
}

interface ToastState {
  seq: number;
  msg: string;
  role: 'polite' | 'status';
  undo: null | {entryId: string; pocketId: PocketId; amount: number};
}

interface Store {
  tab: 'wallet' | 'activity';
  activityBadge: number;
  pockets: Pocket[];
  activity: ActivityEntry[];
  overlay: Overlay;
  sheetDetent: 'medium' | 'large';
  exchange: ExchangeState;
  spend: {pocketId: PocketId; keypad: string};
  swipeOpenRowId: PocketId | null;
  toast: ToastState | null;
  scrollByTab: {wallet: number; activity: number};
  refreshState: 'idle' | 'skeleton';
  // RebalanceAnimation trigger: bump seq + the two pocket ids to pulse.
  pulse: {seq: number; ids: PocketId[]};
  spendSeq: number; // deterministic ids for demo entries
}

const INITIAL_EXCHANGE: ExchangeState = {
  from: 'eur',
  to: 'jpy',
  amount: 120,
  secondsLeft: 30,
  expired: false,
  inputMode: false,
  inputValue: '',
  inputError: null,
  pickerOpen: null,
};

const INITIAL_STORE: Store = {
  tab: 'wallet',
  activityBadge: 0,
  pockets: POCKETS,
  activity: ACTIVITY,
  overlay: null,
  sheetDetent: 'medium',
  exchange: INITIAL_EXCHANGE,
  spend: {pocketId: 'jpy', keypad: ''},
  swipeOpenRowId: null,
  toast: null,
  scrollByTab: {wallet: 0, activity: 0},
  refreshState: 'idle',
  pulse: {seq: 0, ids: []},
  spendSeq: 0,
};

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
 * wrapper can tell the 390px mobile stage from the desktop stage.
 */
function useElementWidth(ref: RefObject<HTMLElement | null>): number {
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns scroll. */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node != null) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// Focus trap — sheets/covers/alerts trap Tab; Escape layering is handled
// at the page level (topmost only).
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input, [role="slider"][tabindex]',
  );
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
// DENARI MARK — 28px SVG: a coin split into two interlocking half-moon
// semicircles offset 3px, fills BRAND_ACCENT and BRAND_MOON_ALT.
// Decorative, aria-hidden, navBar leading.
// ---------------------------------------------------------------------------

function DenariMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        {/* Lower-left half-moon */}
        <path d="M 5 16 A 8 8 0 0 0 21 16 Z" fill={BRAND_MOON_ALT} />
        {/* Upper-right half-moon, offset 3px right/up — the mid-swap coin */}
        <path d="M 24 12 A 8 8 0 0 0 8 12 Z" fill={BRAND_ACCENT} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// ROLLING AMOUNT — per-digit translateY roll (opacity swap under reduced
// motion via the CSS guard). EUR digits roll up as JPY rolls down: the
// counter-roll is the two directions on the two readouts. Changed chars
// remount (key includes the char) and animate in.
// ---------------------------------------------------------------------------

interface RollingAmountProps {
  text: string;
  direction: 'up' | 'down';
  style?: CSSProperties;
}

function RollingAmount({text, direction, style}: RollingAmountProps) {
  const prevRef = useRef(text);
  useEffect(() => {
    prevRef.current = text;
  });
  const prev = prevRef.current;
  const rollClass = direction === 'up' ? 'dnr-roll-up' : 'dnr-roll-down';
  return (
    <span style={{...style, display: 'inline-flex', overflow: 'hidden'}}>
      {text.split('').map((ch, i) => {
        const changed = prev !== text && (prev.length !== text.length || prev[i] !== ch);
        return (
          <span key={`${i}-${ch}`} className={changed ? rollClass : undefined} style={{display: 'inline-block'}}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}

// ---------------------------------------------------------------------------
// POCKET METER ROW — 76px row with the inline pacing model. fill% =
// round(spentToday/plannedPerDay×100); <100% brand fill, ≥100% ERROR
// fill AND the 13px USD line swaps to the 11px/600 'over plan' caption.
// runway = balance/plannedPerDay to 1 decimal. spentToday is DERIVED
// from today's spend entries per currency, so the row and the ledger
// can never disagree. Swipe reveals a 72px brand Spend block (snap −72,
// one open at a time); the visible 44×44 ellipsis is the mandatory
// button path to the same verbs via the actionSheet.
// ---------------------------------------------------------------------------

interface PocketRowProps {
  pocket: Pocket;
  spentToday: number;
  isSwipeOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  pulseClass: string | undefined;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onRowTap: (opener: HTMLElement) => void;
  onEllipsis: (opener: HTMLElement) => void;
  onSpend: () => void;
}

function PocketRow({
  pocket,
  spentToday,
  isSwipeOpen,
  isLast,
  reducedMotion,
  pulseClass,
  onSwipeOpen,
  onSwipeClose,
  onRowTap,
  onEllipsis,
  onSpend,
}: PocketRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const base = isSwipeOpen ? -72 : 0;
  const offset = dragX != null ? Math.max(-72, Math.min(0, base + dragX)) : base;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    setDragX(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - startXRef.current;
    if (Math.abs(dx) > 8) movedRef.current = true;
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (dragX == null) return;
    const settled = Math.max(-72, Math.min(0, base + dragX));
    setDragX(null);
    if (movedRef.current) {
      if (settled < -36) onSwipeOpen();
      else onSwipeClose();
    }
  };
  const guardClick = (handler: (opener: HTMLElement) => void) => (event: {currentTarget: HTMLElement}) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    handler(event.currentTarget);
  };

  const pace = Math.round((spentToday / pocket.plannedPerDay) * 100);
  const over = pace >= 100; // boundary is ≥100%, not 'close' (THB at 95% stays brand)
  const runway = (pocket.balance / pocket.plannedPerDay).toFixed(1);
  const usdCents = toUsdCents(pocket.id, pocket.balance);

  return (
    <div style={styles.pocketOuter} className={pulseClass}>
      <div style={styles.pocketClip}>
        <button
          type="button"
          className="dnr-btn"
          style={styles.spendAction}
          tabIndex={isSwipeOpen ? 0 : -1}
          aria-hidden={!isSwipeOpen}
          onClick={onSpend}>
          Spend
        </button>
        <div
          style={{
            ...styles.pocketContent,
            transform: offset !== 0 ? `translateX(${offset}px)` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 200ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="dnr-btn dnr-focusable"
            style={styles.pocketRowBtn}
            aria-label={`${pocket.name} pocket, ${fmtCur(pocket.id, pocket.balance)}${over ? ', over plan today' : ''}`}
            onClick={guardClick(onRowTap)}>
            <span style={styles.chipCircle} aria-hidden>
              {SYMBOLS[pocket.id]}
            </span>
            {/* Line 1 (name+tag vs trailing balance stack) sits above the
                full-width line 2 (meter + caption), so the caption spans
                to the ellipsis edge per the spec's row anatomy. */}
            <span style={styles.pocketCenter}>
              <span style={styles.pocketLine1}>
                <span style={styles.pocketName}>{pocket.name}</span>
                <span style={styles.pocketTag}>· {pocket.tag}</span>
                <span style={styles.pocketMeta}>
                  <RollingAmount text={fmtCur(pocket.id, pocket.balance)} direction="up" style={styles.pocketBalance} />
                  {over ? (
                    <span style={styles.overPlanCaption}>over plan</span>
                  ) : (
                    <span style={styles.pocketUsd}>{fmtUsd(usdCents)}</span>
                  )}
                </span>
              </span>
              <span style={styles.meterTrack} aria-hidden>
                <span
                  style={{
                    ...styles.meterFill,
                    width: `${Math.min(pace, 100)}%`,
                    ...(over ? {background: ERROR_METER} : null),
                    display: 'block',
                  }}
                />
              </span>
              <span style={styles.meterCaption}>
                {fmtCurCompact(pocket.id, spentToday)} of {fmtCurCompact(pocket.id, pocket.plannedPerDay)} today ·{' '}
                {runway}d runway
              </span>
            </span>
          </button>
          <button
            type="button"
            className="dnr-btn dnr-focusable"
            style={styles.iconBtn}
            aria-label={`More actions for ${pocket.name} pocket`}
            onClick={guardClick(onEllipsis)}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
      </div>
      {isLast ? null : <div style={styles.rowDividerDeep} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DUAL READOUT SLIDER — one handle, two live denominations. role='slider'
// with full aria-value* + valuetext naming BOTH denominations; travel =
// measured trackWidth − 28 (handle 28px, 44×44 hit via the padded wrap).
// Spread shading: a 1.25%-of-fill hatch band at the fill tip (min 3px).
// ---------------------------------------------------------------------------

interface DualReadoutSliderProps {
  from: PocketId;
  to: PocketId;
  amount: number;
  max: number;
  step: number;
  received: number;
  disabled: boolean;
  onChange: (amount: number) => void;
}

function DualReadoutSlider({from, to, amount, max, step, received, disabled, onChange}: DualReadoutSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const trackWidth = useElementWidth(trackRef);
  const travel = Math.max(0, trackWidth - 28);
  const ratio = max === 0 ? 0 : amount / max;
  const handleX = travel * ratio;
  const fillWidth = 14 + handleX; // to handle center
  const hatchWidth = Math.max(3, fillWidth * (SPREAD_PCT / 100));

  const setFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect == null || travel === 0) return;
    const raw = ((clientX - rect.left - 14) / travel) * max;
    const snapped = Math.max(0, Math.min(max, Math.round(raw / step) * step));
    onChange(snapped);
  };
  const draggingRef = useRef(false);
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromClientX(event.clientX);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) setFromClientX(event.clientX);
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = amount - step;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = amount + step;
    else if (event.key === 'PageDown') next = amount - step * 5;
    else if (event.key === 'PageUp') next = amount + step * 5;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = max;
    if (next == null) return;
    event.preventDefault();
    onChange(Math.max(0, Math.min(max, next)));
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      className="dnr-focusable"
      aria-label={`Exchange amount in ${CODES[from]}`}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={amount}
      aria-valuetext={`${fmtCur(from, amount)} out, ${fmtCur(to, received)} in`}
      aria-disabled={disabled}
      style={{...styles.sliderWrap, ...(disabled ? {opacity: 0.4} : null)}}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}>
      <div style={styles.sliderTrack} aria-hidden />
      <div style={{...styles.sliderFill, width: fillWidth}} aria-hidden />
      <div style={{...styles.sliderHatch, left: Math.max(0, fillWidth - hatchWidth), width: hatchWidth}} aria-hidden />
      <div style={{...styles.sliderHandle, left: handleX}} aria-hidden />
    </div>
  );
}

// ---------------------------------------------------------------------------
// RATE LOCK RING — 28px SVG countdown ring on the confirm button + 0:SS
// tabular label. Circumference 2π×12 = 75.4; dashoffset = 75.4 × (1 −
// secondsLeft/30). The ring updates once per second (no continuous
// animation) and carries NO CSS transition on dashoffset, so reduced
// motion needs no extra guard here. aria-hidden — the confirm button's
// accessible name carries the coarse time (10-second boundaries only).
// ---------------------------------------------------------------------------

function RateLockRing({secondsLeft}: {secondsLeft: number}) {
  const circumference = 75.4;
  const offset = circumference * (1 - secondsLeft / 30);
  return (
    <span style={styles.lockRingWrap} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <circle cx={14} cy={14} r={12} stroke={RING_TRACK} strokeWidth={3} />
        <circle
          cx={14}
          cy={14}
          r={12}
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          transform="rotate(-90 14 14)"
        />
      </svg>
      <span style={styles.lockRingLabel}>0:{String(secondsLeft).padStart(2, '0')}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; pointer drag between detents is garnish, >120px past
// medium closes), 52px header with 44×44 X, focus-trapped dialog.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  grabberRef: RefObject<HTMLButtonElement | null>;
  reducedMotion: boolean;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({
  titleId,
  title,
  detent,
  onDetentChange,
  onClose,
  sheetRef,
  grabberRef,
  reducedMotion,
  footer,
  children,
}: SheetProps) {
  const [dragY, setDragY] = useState<number | null>(null);
  const startYRef = useRef(0);
  const movedRef = useRef(false);

  const onGrabberPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    startYRef.current = event.clientY;
    movedRef.current = false;
    setDragY(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onGrabberPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragY == null) return;
    const dy = event.clientY - startYRef.current;
    if (Math.abs(dy) > 8) movedRef.current = true;
    setDragY(dy);
  };
  const onGrabberPointerUp = () => {
    if (dragY == null) return;
    const dy = dragY;
    setDragY(null);
    if (!movedRef.current) return;
    if (dy > 120 && detent === 'medium') onClose();
    else if (dy > 60 && detent === 'large') onDetentChange('medium');
    else if (dy < -60 && detent === 'medium') onDetentChange('large');
  };
  const onGrabberClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onDetentChange(detent === 'medium' ? 'large' : 'medium');
  };

  const translate = dragY != null && dragY > 0 ? `translateY(${dragY}px)` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="dnr-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease',
      }}>
      <button
        type="button"
        ref={grabberRef}
        className="dnr-btn dnr-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onPointerDown={onGrabberPointerDown}
        onPointerMove={onGrabberPointerMove}
        onPointerUp={onGrabberPointerUp}
        onClick={onGrabberClick}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button type="button" className="dnr-btn dnr-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileCurrencyPocketsTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [store, setStore] = useState<Store>(INITIAL_STORE);
  const update = useCallback((patch: Partial<Store> | ((prev: Store) => Store)) => {
    setStore(prev => (typeof patch === 'function' ? patch(prev) : {...prev, ...patch}));
  }, []);

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const grabberRef = useRef<HTMLButtonElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const coverCloseRef = useRef<HTMLButtonElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const alertRef = useRef<HTMLDivElement | null>(null);
  const alertCancelRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);

  // DERIVED — never stored: spentToday per pocket from today's SPEND
  // entries (exchanges never feed the pacing model), ticker from
  // pockets, the TODAY USD header from today's spend rows.
  const spentToday: Record<PocketId, number> = {eur: 0, jpy: 0, gbp: 0, thb: 0};
  for (const entry of store.activity) {
    if (entry.kind === 'spend' && entry.day === 'today') spentToday[entry.pocketId] += entry.amount;
  }
  const tickerCents = store.pockets.reduce((sum, p) => sum + toUsdCents(p.id, p.balance), 0);
  const todaySpendCents = store.activity.reduce(
    (sum, e) => (e.kind === 'spend' && e.day === 'today' ? sum + toUsdCents(e.pocketId, e.amount) : sum),
    0,
  );
  const todayEntries = store.activity.filter(e => e.day === 'today');
  const yesterdayEntries = store.activity.filter(e => e.day === 'yesterday');
  const pocketById = (id: PocketId): Pocket => store.pockets.find(p => p.id === id) as Pocket;

  const exch = store.exchange;
  const exchMax = SLIDER_MAX[exch.from];
  const exchStep = SLIDER_STEP[exch.from];
  const exchReceived = convertOut(exch.from, exch.to, exch.amount);
  const exchLocked = lockedRate(exch.from, exch.to);
  const exchMid = midRate(exch.from, exch.to);

  const spendPocket = pocketById(store.spend.pocketId);
  const spendAmount = Number(store.spend.keypad) || 0;
  const spendAfter = spendPocket.balance - spendAmount;
  const spendTodayAfter = spentToday[spendPocket.id] + spendAmount;
  const spendPaceAfter = Math.round((spendTodayAfter / spendPocket.plannedPerDay) * 100);

  const overlayOpen = store.overlay != null;
  const actionSheetPocket: PocketId | null = store.overlay?.startsWith('actionSheet:')
    ? (store.overlay.slice('actionSheet:'.length) as PocketId)
    : null;
  const alertPocket: PocketId | null = store.overlay?.startsWith('alert:')
    ? (store.overlay.slice('alert:'.length) as PocketId)
    : null;

  const makeToast = (msg: string, role: 'polite' | 'status' = 'polite', undo: ToastState['undo'] = null): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, role, undo};
  };

  // TAB PERSISTENCE — scrollTop recorded on exit, restored on entry;
  // overlays close on tab switch, the toast persists; re-tapping the
  // active tab scrolls to top (the one legal reset).
  const switchTab = (tab: 'wallet' | 'activity') => {
    const scroller = getScrollParent(shellRef.current);
    if (tab === store.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    update(prev => ({
      ...prev,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
      tab,
      overlay: null,
      swipeOpenRowId: null,
      activityBadge: tab === 'activity' ? 0 : prev.activityBadge,
    }));
  };
  useEffect(() => {
    const scroller = getScrollParent(shellRef.current);
    if (scroller != null) scroller.scrollTop = store.scrollByTab[store.tab];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.tab]);

  // OVERLAY LIFECYCLE --------------------------------------------------------

  const openExchange = (opener: HTMLElement | null, from?: PocketId, to?: PocketId) => {
    openerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    const nextFrom = from ?? 'eur';
    const nextTo = to ?? (nextFrom === 'jpy' ? 'eur' : 'jpy');
    update(prev => ({
      ...prev,
      overlay: 'exchange',
      sheetDetent: 'medium',
      swipeOpenRowId: null,
      exchange: {
        ...INITIAL_EXCHANGE,
        from: nextFrom,
        to: nextTo,
        amount: SLIDER_MAX[nextFrom] * 0.4, // eur → 120, the spec default
      },
    }));
  };
  const openSpend = (opener: HTMLElement | null, pocketId?: PocketId) => {
    openerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update(prev => ({
      ...prev,
      overlay: 'spend',
      swipeOpenRowId: null,
      spend: {pocketId: pocketId ?? prev.spend.pocketId, keypad: ''},
    }));
  };
  const openActionSheet = (opener: HTMLElement, pocketId: PocketId) => {
    openerRef.current = opener;
    update({overlay: `actionSheet:${pocketId}`, swipeOpenRowId: null});
  };
  const closeOverlay = useCallback(() => {
    update({overlay: null});
    openerRef.current?.focus();
  }, [update]);

  // Focus into an opening overlay with preventScroll — plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen (foundations amendment).
  useEffect(() => {
    if (store.overlay === 'exchange') grabberRef.current?.focus({preventScroll: true});
    else if (store.overlay === 'spend') coverCloseRef.current?.focus({preventScroll: true});
    else if (store.overlay?.startsWith('actionSheet:')) actionCancelRef.current?.focus({preventScroll: true});
    else if (store.overlay?.startsWith('alert:')) alertCancelRef.current?.focus({preventScroll: true});
  }, [store.overlay]);

  // Escape closes the TOPMOST overlay only: alert z60 > cover z50 >
  // sheet/actionSheet z41.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || store.overlay == null) return;
      closeOverlay();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store.overlay, closeOverlay]);

  // RATE LOCK — interaction state, not a toast timer (sanctioned by the
  // idea's contract): 1 Hz decrement from 30 while the sheet is open; at
  // 0 the confirm disables and 'Refresh rate' re-quotes the SAME rate
  // deterministically. Expiry announces once via the toastDock.
  useEffect(() => {
    if (store.overlay !== 'exchange' || store.exchange.expired) return undefined;
    const timer = setInterval(() => {
      setStore(prev => {
        if (prev.overlay !== 'exchange' || prev.exchange.expired) return prev;
        const next = prev.exchange.secondsLeft - 1;
        if (next <= 0) {
          toastSeqRef.current += 1;
          return {
            ...prev,
            exchange: {...prev.exchange, secondsLeft: 0, expired: true},
            toast: {seq: toastSeqRef.current, msg: 'Rate lock expired', role: 'polite', undo: null},
          };
        }
        return {...prev, exchange: {...prev.exchange, secondsLeft: next}};
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [store.overlay, store.exchange.expired]);

  const refreshRate = () => {
    update(prev => ({...prev, exchange: {...prev.exchange, secondsLeft: 30, expired: false}}));
  };

  // CONSEQUENCE CHAINS -------------------------------------------------------

  // EXCHANGE COMMIT — both paths (slider and typed amount) hit this one
  // function: pockets move, an EXCHANGE entry with the live spread cost
  // prepends, the Activity tab badges, both rows pulse + digit-roll, and
  // the ticker re-derives ($1,293.60 → $1,291.98 on the default €120).
  const commitExchange = () => {
    if (exch.expired || exch.amount <= 0) return;
    const {from, to, amount} = exch;
    const received = convertOut(from, to, amount);
    const before = tickerCents;
    const after = store.pockets.reduce((sum, p) => {
      const balance = p.id === from ? p.balance - amount : p.id === to ? p.balance + received : p.balance;
      return sum + toUsdCents(p.id, balance);
    }, 0);
    const spreadCents = before - after;
    const entry: ActivityEntry = {
      id: `act_x${store.spendSeq + 1}`,
      kind: 'exchange',
      merchant: `Exchanged ${fmtCur(from, amount)} → ${fmtCur(to, received)}`,
      pocketId: from,
      meta: `${pocketById(from).name} → ${pocketById(to).name} · −${fmtUsd(spreadCents)} spread`,
      amount,
      receivedText: `+${fmtCur(to, received)}`,
      day: 'today',
    };
    update(prev => ({
      ...prev,
      pockets: prev.pockets.map(p =>
        p.id === from ? {...p, balance: p.balance - amount} : p.id === to ? {...p, balance: p.balance + received} : p,
      ),
      activity: [entry, ...prev.activity],
      activityBadge: 1,
      overlay: null,
      spendSeq: prev.spendSeq + 1,
      pulse: {seq: prev.pulse.seq + 1, ids: [from, to]},
      toast: makeToast(`Exchanged ${fmtCur(from, amount)} → ${fmtCur(to, received)}`),
    }));
    openerRef.current?.focus();
  };

  // SPEND COMMIT — reversible → executes immediately + Undo toast per
  // undoOverConfirm; Undo restores the balance and splices the entry
  // back out at its exact position (index 0 of TODAY).
  const commitSpend = () => {
    if (spendAmount <= 0 || spendAmount > spendPocket.balance) return;
    const id = `act_s${store.spendSeq + 1}`;
    const entry: ActivityEntry = {
      id,
      kind: 'spend',
      merchant: 'Spend ticket',
      pocketId: spendPocket.id,
      meta: `${spendPocket.name} · just now`,
      amount: spendAmount,
      day: 'today',
    };
    update(prev => ({
      ...prev,
      pockets: prev.pockets.map(p => (p.id === spendPocket.id ? {...p, balance: p.balance - spendAmount} : p)),
      activity: [entry, ...prev.activity],
      overlay: null,
      spendSeq: prev.spendSeq + 1,
      pulse: {seq: prev.pulse.seq + 1, ids: [spendPocket.id]},
      toast: makeToast(`Spent ${fmtCur(spendPocket.id, spendAmount)}`, 'polite', {
        entryId: id,
        pocketId: spendPocket.id,
        amount: spendAmount,
      }),
    }));
    openerRef.current?.focus();
  };
  const undoSpend = () => {
    const undo = store.toast?.undo;
    if (undo == null) return;
    update(prev => ({
      ...prev,
      pockets: prev.pockets.map(p => (p.id === undo.pocketId ? {...p, balance: p.balance + undo.amount} : p)),
      activity: prev.activity.filter(e => e.id !== undo.entryId),
      toast: makeToast('Restored'),
    }));
  };

  // ACTIVITY REFRESH — explicit button, never pull-to-refresh: press →
  // 4 deterministic skeletonRows (aria-busy, one shimmer, removed under
  // reduced motion); next press resolves → 'Updated just now' (status).
  const onRefresh = () => {
    if (store.refreshState === 'idle') {
      update({refreshState: 'skeleton'});
    } else {
      update(prev => ({...prev, refreshState: 'idle', toast: makeToast('Updated just now', 'status')}));
    }
  };

  const keypadPress = (key: string) => {
    update(prev => {
      const cur = prev.spend.keypad;
      if (key === 'back') return {...prev, spend: {...prev.spend, keypad: cur.slice(0, -1)}};
      if (cur.length >= 7) return prev;
      if (key === '.' && (cur.includes('.') || DECIMALS[prev.spend.pocketId] === 0)) return prev;
      if (key === '.' && cur === '') return {...prev, spend: {...prev.spend, keypad: '0.'}};
      const next = cur + key;
      const frac = next.split('.')[1];
      if (frac != null && frac.length > DECIMALS[prev.spend.pocketId]) return prev;
      return {...prev, spend: {...prev.spend, keypad: next}};
    });
  };

  const onExchangeInput = (raw: string) => {
    update(prev => {
      const max = SLIDER_MAX[prev.exchange.from];
      const parsed = Number(raw);
      const valid = raw !== '' && Number.isFinite(parsed) && parsed >= 0 && parsed <= max;
      return {
        ...prev,
        exchange: {
          ...prev.exchange,
          inputValue: raw,
          // Reward the fix immediately: the error clears the moment the
          // value becomes valid while typing.
          inputError: valid || raw === '' ? null : prev.exchange.inputError,
          amount: valid ? parsed : prev.exchange.amount,
        },
      };
    });
  };
  const onExchangeInputBlur = () => {
    update(prev => {
      const max = SLIDER_MAX[prev.exchange.from];
      const parsed = Number(prev.exchange.inputValue);
      const invalid =
        prev.exchange.inputValue !== '' && (!Number.isFinite(parsed) || parsed < 0 || parsed > max);
      return {
        ...prev,
        exchange: {...prev.exchange, inputError: invalid ? `Max ${fmtCur(prev.exchange.from, max)}` : null},
      };
    });
  };

  const pickPocket = (slot: 'from' | 'to', id: PocketId) => {
    update(prev => {
      let {from, to} = prev.exchange;
      if (slot === 'from') {
        to = id === to ? from : to;
        from = id;
      } else {
        from = id === from ? to : from;
        to = id;
      }
      // Pair change re-quotes: fresh 30 s lock, default amount for the
      // new FROM currency (eur → 120 per spec).
      return {
        ...prev,
        exchange: {
          ...INITIAL_EXCHANGE,
          from,
          to,
          amount: SLIDER_MAX[from] * 0.4,
          pickerOpen: null,
        },
      };
    });
  };

  // ACTION SHEET / ALERT verbs ------------------------------------------------

  const actionSpendFrom = (id: PocketId) => openSpend(openerRef.current, id);
  const actionExchangeFrom = (id: PocketId) => openExchange(openerRef.current, id);
  const actionViewActivity = () => {
    update(prev => ({...prev, overlay: null, tab: 'activity', activityBadge: 0}));
  };
  const actionClosePocket = (id: PocketId) => update({overlay: `alert:${id}`});

  // The confirm button's accessible name refreshes only at 10-second
  // boundaries to avoid chatter (a11y plan).
  const ariaSeconds = exch.expired ? 0 : Math.max(10, Math.ceil(exch.secondsLeft / 10) * 10);
  const convertDisabled = exch.expired || exch.amount <= 0;
  const spendDisabled = spendAmount <= 0 || spendAmount > spendPocket.balance;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const renderActivityRow = (entry: ActivityEntry, isLast: boolean) => (
    <div key={entry.id}>
      <div
        style={styles.activityRowBtn}
        aria-label={`${entry.merchant}, ${entry.kind === 'exchange' ? entry.receivedText : `−${fmtCur(entry.pocketId, entry.amount)}`}`}>
        <span style={styles.activityText}>
          <span style={styles.activityPrimaryLine}>
            <span style={styles.activityMerchant}>{entry.merchant}</span>
            {entry.kind === 'exchange' ? <span style={styles.exchangeBadge}>EXCHANGE</span> : null}
          </span>
          <span style={styles.activitySecondary}>{entry.meta}</span>
        </span>
        <span style={styles.activityAmount}>
          {entry.kind === 'exchange' ? entry.receivedText : `−${fmtCur(entry.pocketId, entry.amount)}`}
        </span>
      </div>
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{DENARI_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — hairline always on (scroll-under not wired; noted). */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <DenariMark />
          </div>
          <div style={styles.tickerStack} aria-label={`${HOME} total ${fmtUsd(tickerCents)}`}>
            <span style={styles.tickerOverline}>{HOME} total</span>
            <RollingAmount text={fmtUsd(tickerCents)} direction="up" style={styles.tickerValue} />
          </div>
          <div style={styles.navTrailing}>
            {store.tab === 'wallet' ? (
              <button
                type="button"
                className="dnr-btn dnr-focusable"
                style={styles.iconBtn}
                aria-label="Open exchange"
                onClick={event => openExchange(event.currentTarget)}>
                <Icon icon={ArrowLeftRightIcon} size="md" color="inherit" />
              </button>
            ) : (
              <button
                type="button"
                className="dnr-btn dnr-focusable"
                style={styles.iconBtn}
                aria-label={store.refreshState === 'skeleton' ? 'Finish refreshing activity' : 'Refresh activity'}
                onClick={onRefresh}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            )}
          </div>
        </header>

        <main style={styles.main}>
          {store.tab === 'wallet' ? (
            <>
              <div style={styles.tripHeader}>
                <h1 style={styles.tripTitle}>{TRIP.name}</h1>
                <span style={styles.tripSub}>
                  Day {TRIP.day} of {TRIP.of} · {TRIP.daysLeft} days left
                </span>
              </div>
              <h2 style={styles.sectionHeader}>Pockets</h2>
              <div style={styles.listCard}>
                {store.pockets.map((pocket, index) => (
                  <PocketRow
                    key={`${pocket.id}-${store.pulse.ids.includes(pocket.id) ? store.pulse.seq : 0}`}
                    pocket={pocket}
                    spentToday={spentToday[pocket.id]}
                    isSwipeOpen={store.swipeOpenRowId === pocket.id}
                    isLast={index === store.pockets.length - 1}
                    reducedMotion={reducedMotion}
                    pulseClass={store.pulse.ids.includes(pocket.id) && !reducedMotion ? 'dnr-pulse' : undefined}
                    onSwipeOpen={() => update({swipeOpenRowId: pocket.id})}
                    onSwipeClose={() => {
                      if (store.swipeOpenRowId === pocket.id) update({swipeOpenRowId: null});
                    }}
                    onRowTap={opener => {
                      if (store.swipeOpenRowId != null) {
                        update({swipeOpenRowId: null});
                        return;
                      }
                      openActionSheet(opener, pocket.id);
                    }}
                    onEllipsis={opener => openActionSheet(opener, pocket.id)}
                    onSpend={() => openSpend(null, pocket.id)}
                  />
                ))}
              </div>
              {/* Sticky footer — the screen's primary verb in the thumb zone. */}
              <div style={{flex: 1}} />
              <div style={styles.walletFooter}>
                <button
                  type="button"
                  className="dnr-btn dnr-focusable"
                  style={styles.primaryBtn}
                  onClick={event => openSpend(event.currentTarget)}>
                  New spend
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={styles.tripHeader}>
                <h1 style={styles.tripTitle}>Activity</h1>
                <span style={styles.tripSub}>
                  {TRIP.name} · Day {TRIP.day} of {TRIP.of}
                </span>
              </div>
              {store.refreshState === 'skeleton' ? (
                <>
                  <h2 style={styles.sectionHeader}>Today</h2>
                  <div style={styles.listCard} aria-busy="true">
                    {SKELETON_PRIMARY.map((primary, i) => (
                      <div key={primary + String(i)}>
                        <div style={styles.skeletonRow} aria-hidden>
                          <div style={styles.skeletonStack}>
                            <div style={{...styles.skeletonBar, width: primary, position: 'relative', overflow: 'hidden'}}>
                              <span className="dnr-shimmer" />
                            </div>
                            <div style={{...styles.skeletonBar, width: SKELETON_SECONDARY[i]}} />
                          </div>
                        </div>
                        {i === SKELETON_PRIMARY.length - 1 ? null : <div style={styles.rowDivider} />}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 style={styles.sectionHeader}>Today · −{fmtUsd(todaySpendCents)}</h2>
                  <div style={styles.listCard}>
                    {todayEntries.map((entry, i) => renderActivityRow(entry, i === todayEntries.length - 1))}
                  </div>
                  <h2 style={styles.sectionHeader}>Yesterday</h2>
                  <div style={styles.listCard}>
                    {yesterdayEntries.map((entry, i) => renderActivityRow(entry, i === yesterdayEntries.length - 1))}
                  </div>
                  {/* Terminal caption derives from ledger length (12 after
                      a demo spend/exchange). */}
                  <p style={styles.terminalCaption}>All {store.activity.length} entries</p>
                </>
              )}
              <div style={{flex: 1, minHeight: 24}} />
            </>
          )}

          {/* TOAST DOCK — the one polite live region; sticky-in-flow above
              the tabBar (shell-absolute only while an overlay locks the
              shell). One toast at a time, no timers, Undo is a real button. */}
          <div
            style={{...styles.toastDock, ...(overlayOpen ? styles.toastDockLocked : null)}}
            aria-live="polite">
            {store.toast != null ? (
              <div
                key={store.toast.seq}
                style={styles.toast}
                role={store.toast.role === 'status' ? 'status' : undefined}>
                <span style={styles.toastMsg}>{store.toast.msg}</span>
                {store.toast.undo != null ? (
                  <>
                    <span style={styles.toastRule} aria-hidden />
                    <button type="button" className="dnr-btn dnr-focusable" style={styles.toastUndo} onClick={undoSpend}>
                      Undo
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </main>

        {/* TAB BAR — 64px, 2 tabs; Activity wears the post-exchange badge. */}
        <nav style={styles.tabBar} aria-label="Denari sections">
          <button
            type="button"
            className="dnr-btn dnr-focusable"
            style={{...styles.tabItem, ...(store.tab === 'wallet' ? styles.tabItemActive : null)}}
            aria-current={store.tab === 'wallet' ? 'page' : undefined}
            onClick={() => switchTab('wallet')}>
            <span style={styles.tabIconWrap}>
              <Icon icon={WalletIcon} size="md" color="inherit" />
            </span>
            <span style={{...styles.tabLabel, ...(store.tab === 'wallet' ? styles.tabLabelActive : null)}}>Wallet</span>
          </button>
          <button
            type="button"
            className="dnr-btn dnr-focusable"
            style={{...styles.tabItem, ...(store.tab === 'activity' ? styles.tabItemActive : null)}}
            aria-current={store.tab === 'activity' ? 'page' : undefined}
            aria-label={store.activityBadge > 0 ? `Activity, ${store.activityBadge} new entry` : 'Activity'}
            onClick={() => switchTab('activity')}>
            <span style={styles.tabIconWrap}>
              <Icon icon={ReceiptIcon} size="md" color="inherit" />
              {store.activityBadge > 0 ? <span style={styles.tabBadge}>{store.activityBadge}</span> : null}
            </span>
            <span style={{...styles.tabLabel, ...(store.tab === 'activity' ? styles.tabLabelActive : null)}}>
              Activity
            </span>
          </button>
        </nav>

        {/* OVERLAYS — all absolute inside shell; scrim click closes the
            sheet/actionSheet (never the alert). */}
        {store.overlay === 'exchange' || actionSheetPocket != null ? (
          <div style={styles.sheetScrim} onClick={closeOverlay} aria-hidden />
        ) : null}

        {store.overlay === 'exchange' ? (
          <Sheet
            titleId="dnr-exchange-title"
            title="Exchange"
            detent={store.sheetDetent}
            onDetentChange={detent => update({sheetDetent: detent})}
            onClose={closeOverlay}
            sheetRef={sheetRef}
            grabberRef={grabberRef}
            reducedMotion={reducedMotion}
            footer={
              <div style={styles.convertBtnRow}>
                {exch.amount <= 0 ? <div style={styles.convertReason}>Enter an amount</div> : null}
                {exch.expired ? (
                  <button
                    type="button"
                    className="dnr-btn dnr-focusable"
                    style={{...styles.secondaryBtn, marginBottom: 12}}
                    onClick={refreshRate}>
                    Refresh rate
                  </button>
                ) : null}
                <button
                  type="button"
                  className="dnr-btn dnr-focusable"
                  style={{...styles.primaryBtn, ...(convertDisabled ? styles.primaryBtnDisabled : null)}}
                  disabled={convertDisabled}
                  aria-disabled={convertDisabled}
                  aria-label={
                    exch.expired
                      ? 'Rate lock expired — refresh the rate to convert'
                      : `Convert ${fmtCur(exch.from, exch.amount)} to ${fmtCur(exch.to, exchReceived)}, rate locked, about ${ariaSeconds} seconds left`
                  }
                  onClick={commitExchange}>
                  <span>
                    Convert {fmtCur(exch.from, exch.amount)} → {fmtCur(exch.to, exchReceived)}
                  </span>
                  <RateLockRing secondsLeft={exch.secondsLeft} />
                </button>
              </div>
            }>
            {/* Pocket pair — inline 44px-row pickers expand WITHIN the
                sheet (a sheet may not open another sheet). */}
            <div style={styles.pairRow}>
              <button
                type="button"
                className="dnr-btn dnr-focusable"
                style={styles.pairPill}
                aria-expanded={exch.pickerOpen === 'from'}
                onClick={() =>
                  update(prev => ({
                    ...prev,
                    exchange: {...prev.exchange, pickerOpen: prev.exchange.pickerOpen === 'from' ? null : 'from'},
                  }))
                }>
                From: {CODES[exch.from]} ▾
              </button>
              <button
                type="button"
                className="dnr-btn dnr-focusable"
                style={styles.pairPill}
                aria-expanded={exch.pickerOpen === 'to'}
                onClick={() =>
                  update(prev => ({
                    ...prev,
                    exchange: {...prev.exchange, pickerOpen: prev.exchange.pickerOpen === 'to' ? null : 'to'},
                  }))
                }>
                To: {CODES[exch.to]} ▾
              </button>
            </div>
            {exch.pickerOpen != null ? (
              <div style={styles.pickerList} role="listbox" aria-label={`Choose ${exch.pickerOpen} pocket`}>
                {store.pockets.map((pocket, index) => {
                  const selected = exch.pickerOpen === 'from' ? pocket.id === exch.from : pocket.id === exch.to;
                  return (
                    <div key={pocket.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className="dnr-btn dnr-focusable"
                        style={{...styles.pickerRow, ...(selected ? styles.pickerRowOn : null)}}
                        onClick={() => pickPocket(exch.pickerOpen as 'from' | 'to', pocket.id)}>
                        <span>
                          {pocket.name} · {CODES[pocket.id]}
                        </span>
                        <span style={styles.pickerRowMeta}>{fmtCur(pocket.id, pocket.balance)}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
            {/* Dual readout — counter-rolling: OUT rolls up, IN rolls down. */}
            <div style={styles.dualReadout} aria-hidden>
              <RollingAmount
                text={`−${fmtCur(exch.from, exch.amount)}`}
                direction="up"
                style={{...styles.readoutLine, ...styles.readoutOut}}
              />
              <RollingAmount
                text={`+${fmtCur(exch.to, exchReceived)}`}
                direction="down"
                style={{...styles.readoutLine, ...styles.readoutIn}}
              />
            </div>
            <DualReadoutSlider
              from={exch.from}
              to={exch.to}
              amount={exch.amount}
              max={exchMax}
              step={exchStep}
              received={exchReceived}
              disabled={exch.expired}
              onChange={amount =>
                update(prev => ({...prev, exchange: {...prev.exchange, amount, inputValue: '', inputError: null}}))
              }
            />
            <div style={styles.rateLine}>
              Locked 1 {SYMBOLS[exch.from]} = {fmtRate(exch.to, exchLocked)} · mid {fmtRate(exch.to, exchMid)} · spread{' '}
              {SPREAD_PCT}%
            </div>
            <button
              type="button"
              className="dnr-btn dnr-focusable"
              style={styles.utilityRow}
              aria-expanded={exch.inputMode}
              onClick={() =>
                update(prev => ({...prev, exchange: {...prev.exchange, inputMode: !prev.exchange.inputMode}}))
              }>
              Enter amount instead
            </button>
            {exch.inputMode ? (
              <div style={styles.formField}>
                <label style={styles.formLabel} htmlFor="dnr-exchange-amount">
                  Amount in {CODES[exch.from]}
                </label>
                <input
                  id="dnr-exchange-amount"
                  type="text"
                  inputMode="decimal"
                  style={{...styles.formInput, ...(exch.inputError != null ? styles.formInputError : null)}}
                  value={exch.inputValue}
                  placeholder={String(exch.amount)}
                  aria-invalid={exch.inputError != null}
                  aria-describedby={exch.inputError != null ? 'dnr-exchange-amount-error' : undefined}
                  onChange={event => onExchangeInput(event.target.value)}
                  onBlur={onExchangeInputBlur}
                />
                {exch.inputError != null ? (
                  <span id="dnr-exchange-amount-error" style={styles.fieldError}>
                    {exch.inputError}
                  </span>
                ) : null}
              </div>
            ) : null}
          </Sheet>
        ) : null}

        {/* SPEND COVER — absolute inset 0 z50, own 52px navBar, in-app
            keypad of real buttons (never OS keyboard art). */}
        {store.overlay === 'spend' ? (
          <div
            ref={coverRef}
            style={styles.cover}
            role="dialog"
            aria-modal="true"
            aria-label="Spend"
            className="dnr-sheet-in"
            onKeyDown={event => trapTabKey(event, coverRef.current)}>
            <header style={{...styles.navBar, position: 'relative'}}>
              <div style={styles.navLeading}>
                <button
                  type="button"
                  ref={coverCloseRef}
                  className="dnr-btn dnr-focusable"
                  style={styles.iconBtn}
                  aria-label="Close spend"
                  onClick={closeOverlay}>
                  <Icon icon={XIcon} size="md" color="inherit" />
                </button>
              </div>
              <h2 style={styles.sheetTitle}>Spend</h2>
              <span />
            </header>
            <div style={styles.coverBody}>
              <div style={styles.chipRow} role="radiogroup" aria-label="Spend from pocket">
                {store.pockets.map(pocket => {
                  const on = pocket.id === store.spend.pocketId;
                  return (
                    <button
                      key={pocket.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      className="dnr-btn dnr-focusable"
                      style={{...styles.chipBtn, ...(on ? styles.chipBtnOn : null)}}
                      onClick={() => update(prev => ({...prev, spend: {pocketId: pocket.id, keypad: ''}}))}>
                      {SYMBOLS[pocket.id]} {pocket.name}
                    </button>
                  );
                })}
              </div>
              <div style={styles.amountReadout}>
                <RollingAmount text={fmtCur(spendPocket.id, spendAmount)} direction="up" />
              </div>
              {/* Residual preview — recomputes balanceAfter / pace% and
                  recolors the pacing bar across the 100% threshold BEFORE
                  commit (¥1,500 demo: ¥60,500 left · 141%). */}
              <div style={styles.previewCard}>
                <span style={styles.previewLine}>
                  After this: {fmtCur(spendPocket.id, spendAfter)} left · today {fmtCur(spendPocket.id, spendTodayAfter)} of{' '}
                  {fmtCur(spendPocket.id, spendPocket.plannedPerDay)} ({spendPaceAfter}%)
                </span>
                <span style={styles.meterTrack} aria-hidden>
                  <span
                    style={{
                      ...styles.meterFill,
                      display: 'block',
                      width: `${Math.min(spendPaceAfter, 100)}%`,
                      ...(spendPaceAfter >= 100 ? {background: ERROR_METER} : null),
                    }}
                  />
                </span>
                <span style={styles.previewLine}>
                  {(Math.max(spendAfter, 0) / spendPocket.plannedPerDay).toFixed(1)} days runway after
                </span>
              </div>
              <div style={styles.keypad}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'].map(key => (
                  <button
                    key={key}
                    type="button"
                    className="dnr-btn dnr-focusable"
                    style={{
                      ...styles.keypadKey,
                      ...(key === '.' && DECIMALS[spendPocket.id] === 0 ? {opacity: 0.35} : null),
                    }}
                    disabled={key === '.' && DECIMALS[spendPocket.id] === 0}
                    aria-label={key === 'back' ? 'Delete digit' : key === '.' ? 'Decimal point' : `Digit ${key}`}
                    onClick={() => keypadPress(key)}>
                    {key === 'back' ? <Icon icon={DeleteIcon} size="md" color="inherit" /> : key}
                  </button>
                ))}
              </div>
            </div>
            <div style={styles.coverFooter}>
              {spendAmount > spendPocket.balance ? (
                <div style={styles.convertReason}>Exceeds pocket balance</div>
              ) : null}
              <button
                type="button"
                className="dnr-btn dnr-focusable"
                style={{...styles.primaryBtn, ...(spendDisabled ? styles.primaryBtnDisabled : null)}}
                disabled={spendDisabled}
                aria-disabled={spendDisabled}
                onClick={commitSpend}>
                Spend {fmtCur(spendPocket.id, spendAmount)} from {spendPocket.name}
              </button>
            </div>
          </div>
        ) : null}

        {/* POCKET ACTION SHEET — two stacked cards; Cancel is its own card
            (a panicked bottom tap is always safe); destructive last. */}
        {actionSheetPocket != null ? (
          <div
            ref={actionSheetRef}
            style={styles.actionSheetWrap}
            role="dialog"
            aria-modal="true"
            aria-label={`${pocketById(actionSheetPocket).name} pocket actions`}
            className="dnr-sheet-in"
            onKeyDown={event => trapTabKey(event, actionSheetRef.current)}>
            <div style={styles.actionSheetCard}>
              <div style={styles.actionSheetHeader}>
                {pocketById(actionSheetPocket).name} pocket ·{' '}
                {fmtCur(actionSheetPocket, pocketById(actionSheetPocket).balance)}
              </div>
              <div style={styles.fullDivider} />
              <button
                type="button"
                className="dnr-btn dnr-focusable"
                style={styles.actionSheetRow}
                onClick={() => actionSpendFrom(actionSheetPocket)}>
                Spend from pocket
              </button>
              <div style={styles.fullDivider} />
              <button
                type="button"
                className="dnr-btn dnr-focusable"
                style={styles.actionSheetRow}
                onClick={() => actionExchangeFrom(actionSheetPocket)}>
                Exchange from pocket
              </button>
              <div style={styles.fullDivider} />
              <button
                type="button"
                className="dnr-btn dnr-focusable"
                style={styles.actionSheetRow}
                onClick={actionViewActivity}>
                View pocket activity
              </button>
              <div style={styles.fullDivider} />
              <button
                type="button"
                className="dnr-btn dnr-focusable"
                style={{...styles.actionSheetRow, ...styles.actionSheetRowDestructive}}
                onClick={() => actionClosePocket(actionSheetPocket)}>
                Close pocket
              </button>
            </div>
            <div style={styles.actionSheetCard}>
              <button
                type="button"
                ref={actionCancelRef}
                className="dnr-btn dnr-focusable"
                style={styles.actionSheetCancel}
                onClick={closeOverlay}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {/* CENTERED ALERT — blocking, irreversible interrupt; scrim click
            does NOT dismiss; the committing verb is 'Exchange' (no
            disabled alert buttons — the body explains the constraint). */}
        {alertPocket != null ? (
          <>
            <div style={styles.alertScrim} aria-hidden />
            <div
              ref={alertRef}
              style={styles.alert}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="dnr-alert-title"
              aria-describedby="dnr-alert-body"
              onKeyDown={event => trapTabKey(event, alertRef.current)}>
              <div style={styles.alertContent}>
                <h2 id="dnr-alert-title" style={styles.alertTitle}>
                  Close {pocketById(alertPocket).name} pocket?
                </h2>
                <span id="dnr-alert-body" style={styles.alertBody}>
                  Its {fmtCur(alertPocket, pocketById(alertPocket).balance)} must be exchanged first.
                </span>
              </div>
              <div style={styles.alertButtons}>
                <button
                  type="button"
                  ref={alertCancelRef}
                  className="dnr-btn dnr-focusable"
                  style={styles.alertBtn}
                  onClick={closeOverlay}>
                  Cancel
                </button>
                <span style={styles.alertVRule} aria-hidden />
                <button
                  type="button"
                  className="dnr-btn dnr-focusable"
                  style={{...styles.alertBtn, ...styles.alertBtnCommit}}
                  onClick={() => actionExchangeFrom(alertPocket)}>
                  Exchange
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}


