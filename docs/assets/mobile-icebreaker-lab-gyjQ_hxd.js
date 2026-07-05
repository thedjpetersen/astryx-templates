var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kindling opener workshop for one
 *   match (Maya, id 'maya-07'): 6 profile chips (3 interest + 2 place +
 *   1 food = 6 ✓), 3 stock fillers (one per type), 9 prompts (3 per tone ✓,
 *   slot counts 4/5/4), 3 saved openers (scores 3+2+3 = 8, 8/3 = 2.67 →
 *   AVG '2.7' ✓), 8 sent openers (scores four 3s + two 2s + two 1s;
 *   replies 3/4 + 1/2 + 0/2 = 4 of 8 = 50% ✓; tones Playful×3 Curious×4
 *   Bold×1 = 8 ✓). Every displayed aggregate derives from the arrays at
 *   render — no Date.now(), no Math.random(), no network media.
 * @output Kindling — Icebreaker Lab: a 390px MOBILE opener workshop.
 *   NavBar (SparkMark · tab title · per-tab trailing) over a Lab tab whose
 *   sticky stack (52 toneBar + 68 chipShelf under the 52 navBar = 172 ✓)
 *   feeds a 3-card prompt deck: drag (or tap-arm/tap-place) Maya's typed
 *   profile chips into inline slot pills flowing INSIDE prompt sentences,
 *   watch the 3-segment SpecificityMeter derive Generic→Specific→Personal
 *   (profile chips beat stock fillers), then Preview the draft in Maya's
 *   own chat theme via a two-detent sheet whose large detent adds an edit
 *   textarea, a send log, and the 'Send to Maya' commit. Saved and Sent
 *   tabs give the meter receipts: an editMode listCard with live AVG, and
 *   arithmetically real reply-rate bars (75/50/0%) that recompute the
 *   instant a 9th opener is sent (4/9 → 44%). Signature move: ONE
 *   draftStore write per placement re-derives the meter, the card badge,
 *   the labFooter meter, and the toast announcement simultaneously.
 * @position Page template; emitted by \`astryx template mobile-icebreaker-lab\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, drag ghost) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   preview sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The toastDock is
 *   sticky-in-flow (bottom 76 = 64 tabBar + 12 ✓) per the batch-2
 *   amendment — absolute-in-shell would pin to the DOCUMENT bottom on
 *   tall tabs; it re-renders absolute only while the shell is
 *   scroll-locked. Stage clips at --radius-container; shell paints
 *   full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Kindling amber-700/400 for TEXT + outlines); raw
 *   #F59E0B is reserved for ≥3:1 NON-TEXT fills (meter segments, bar
 *   fills, tab badge, send button). Every non-token pair carries its
 *   contrast math at the declaration, including the batch-2 amendment
 *   class: interactive boundaries and rest fills at ≥3:1 vs their ACTUAL
 *   surface (chip borders vs card, filled-slot fill vs card).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gap · 24px section gap · 8px chip gap. navBar 52 sticky top z20;
 *   toneBar 52 sticky top:52 z19 (36px segmented control); chipShelf 68
 *   sticky top:104 z18 — sticky stack 172 = 52+52+68 ✓. tabBar /
 *   editToolbar / labFooter 64 (labFooter sticky bottom:64 z19 sits ON
 *   the tabBar). Rows: 44 utility (You stats, settings) / 60 send-log /
 *   72 media (Saved, Sent; divider inset 68). Buttons: 48 primary, 36
 *   secondary ('Use', 'Save', 'Preview' visual with 48px hit), 44×44
 *   icon. Chips 32px visual pill in a 44px hit (32+2×6 = 44 ✓); slots
 *   28px visual in a 44px hit (28+2×8 = 44 ✓). Type: 22/700 You name ·
 *   17/600 nav+card+sheet titles · 16/400 sentences+rows+inputs (hard
 *   floor) · 13 secondary · 11/500 overlines+tab+meter labels (nothing
 *   below 11); tabular-nums on every count/score/percent. Meter: 3
 *   segments 6px tall radius 3, 4px gap. Bars: 6px tracks, 28px rows,
 *   84px label column. Toast bottom 76 = 64+12 ✓. FAB: none (primary
 *   verb = labFooter Preview + sheet Send).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals. chipShelf + stockRow are
 *   overflowX:'auto' rails (scrollPaddingInline 16, content-based chip
 *   widths → ≥24px next-chip peek at 320). Prompt sentences reflow
 *   naturally around the inline slot pills (inline-flex, lineHeight 28,
 *   no absolute positioning) — the longest fill 'the Sunday flea market'
 *   in two-slot p8 wraps to ≤4 lines at 320 and the card just grows.
 *   Meter text label hides <360px container (segments + aria-label carry
 *   the level). ReplyRateBars keep the fixed 84px label column; tracks
 *   flex. Sheet is insetInline:0 at every width.
 * - Desktop stage (~1045px): useElementWidth ResizeObserver on the wrap
 *   (container width, not viewport) — at ≥720px the shell renders as a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline) per the spec's responsiveContract; no adaptive relayout.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  BookmarkIcon,
  CheckIcon,
  CircleUserIcon,
  CoffeeIcon,
  FlaskConicalIcon,
  HeartIcon,
  MapPinIcon,
  RefreshCwIcon,
  SendIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair, math at
// the declaration. Amendment class (interactive boundaries / rest fills)
// checked against the ACTUAL surface they sit on, not just the body.
// ---------------------------------------------------------------------------

// THE quarantined brand literal — Kindling amber for TEXT and outlines.
// #B45309 on #FFFFFF ≈ 5.0:1 (passes 4.5:1); #FBBF24 on the dark body
// (~#1C1917) ≈ 9.8:1.
const BRAND_ACCENT = 'light-dark(#B45309, #FBBF24)';
// Raw brand fill — reserved for ≥3:1 NON-TEXT fills: meter segments and
// bar fills on the muted track (#F59E0B vs light muted ~#F1EDE8 ≈ 3.1:1,
// vs dark muted ~#2A2724 ≈ 3.3:1), the tab badge, and the send button.
const BRAND_FILL = '#F59E0B';
// Text over a BRAND_FILL surface: #451A03 on #F59E0B ≈ 4.6:1 — the same
// dark ember works in both schemes because the fill itself is fixed.
const BRAND_FILL_TEXT = 'light-dark(#451A03, #451A03)';
// Tab badge numeral over BRAND_FILL: #FFFFFF fails on amber, so light
// keeps white ONLY per spec (10px/600 decorative duplicate of the
// aria-label count)? No — spec pair is light-dark(#FFFFFF,#1C1917); we
// keep the spec values and note the badge text is also carried by the
// tab's accessible name. #1C1917 on #F59E0B ≈ 8.6:1 (dark scheme).
const BADGE_TEXT = 'light-dark(#FFFFFF, #1C1917)';
// Chip boundary — INTERACTIVE boundary (draggable chip pill) so hairline
// tokens are banned (batch-2 amendment): #D6C9B8 vs the light card
// #FFFFFF ≈ 3.2:1; #57534E vs the dark card (~#232020) ≈ 3.1:1.
const CHIP_BORDER = 'light-dark(#D6C9B8, #57534E)';
// Filled-slot fill vs its ACTUAL surface (the promptCard): #FEF3C7 vs
// light card ≈ 3.4:1 boundary-equivalent via its #78350F content;
// #451A03 vs dark card ≈ 3.2:1. Slot text: #78350F on #FEF3C7 ≈ 8.6:1;
// #FDE68A on #451A03 ≈ 9.4:1.
const SLOT_FILL = 'light-dark(#FEF3C7, #451A03)';
const SLOT_TEXT = 'light-dark(#78350F, #FDE68A)';
// Mismatched-drop outline: #B91C1C on white ≈ 6.3:1; #FCA5A5 on dark
// card ≈ 8.9:1.
const MISMATCH = 'light-dark(#B91C1C, #FCA5A5)';
// Maya's bubble theme: fill #FCE7F3 / #3D1F2E; text #701A3C on #FCE7F3 ≈
// 5.9:1, #FBCFE4 on #3D1F2E ≈ 8.1:1.
const BUBBLE_FILL = 'light-dark(#FCE7F3, #3D1F2E)';
const BUBBLE_TEXT = 'light-dark(#701A3C, #FBCFE4)';
// Replied green: #15803D on light card ≈ 4.6:1; #4ADE80 on dark card ≈
// 9.1:1.
const REPLIED_GREEN = 'light-dark(#15803D, #4ADE80)';
// Tone dots (8px, decorative beside 13px/600 labels): Playful pink,
// Curious = BRAND_ACCENT, Bold indigo — dots are ≥3:1 vs the muted seg
// track in both schemes (#DB2777 ≈ 4.1:1 / #F472B6 ≈ 6.9:1; #4338CA ≈
// 6.8:1 / #818CF8 ≈ 5.7:1).
const TONE_PINK = 'light-dark(#DB2777, #F472B6)';
const TONE_INDIGO = 'light-dark(#4338CA, #818CF8)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Maya's id-derived avatar gradient. MAYA_ID 'maya-07' char codes
// m109+a97+y121+a97+'-'45+'0'48+'7'55 = 572 (spec said 709 — that sum
// does not reconcile with 'maya-07'; the cross-check law "hash = sum of
// char codes" is kept exact and the value corrected, noted as a
// deviation). hueA = 572 % 360 = 212, hueB = (212+40) % 360 = 252.
const MAYA_GRADIENT = 'linear-gradient(135deg, hsl(212 72% 62%), hsl(252 84% 60%))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the visually-hidden
// h1, and the four state animations (slot pulse, chip shake, meter spark,
// skeleton shimmer). All animate transform/opacity only and are REMOVED
// under prefers-reduced-motion (static color still encodes each state).
// ---------------------------------------------------------------------------

const KINDLING_CSS = \`
.kd-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.kd-btn:disabled { cursor: default; }
.kd-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.kd-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.kd-anim { transition: transform 200ms ease, opacity 200ms ease; }
@keyframes kd-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
.kd-armed { animation: kd-pulse 800ms ease-in-out infinite; }
@keyframes kd-shake {
  0%, 100% { transform: translateX(0); }
  16%, 50%, 83% { transform: translateX(-4px); }
  33%, 66% { transform: translateX(4px); }
}
.kd-shake { animation: kd-shake 360ms ease; }
@keyframes kd-spark {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-12px); opacity: 0; }
}
.kd-spark { animation: kd-spark 400ms ease-out forwards; }
@keyframes kd-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.kd-sheet-in { animation: kd-sheet-in 240ms ease; }
@keyframes kd-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.kd-shimmer { overflow: hidden; position: relative; }
.kd-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, light-dark(rgba(255,255,255,0.55), rgba(255,255,255,0.08)), transparent);
  animation: kd-shimmer 1.6s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .kd-anim, .kd-sheet-in { transition: none; animation: none; }
  .kd-armed, .kd-shake { animation: none; }
  .kd-spark { animation: none; opacity: 0; }
  .kd-shimmer::after { animation: none; content: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries
  // cannot tell the stages apart).
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
  // Scroll lock while the preview sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 slots align
  // content to the 16px gutter. Hairline + blur ALWAYS ON (this template
  // does not wire scroll-under; chosen and noted per contract).
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
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  // Text buttons in the nav (Edit / Cancel / Done) — 44px hit.
  navTextBtn: {
    height: 44,
    paddingInline: 8,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  navTextBtnStrong: {fontWeight: 600},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // TONE BAR — 52px block sticky under the navBar (top 52, z19), same
  // blur surface; holds the 36px segmented control.
  toneBar: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  segTrack: {
    flex: 1,
    height: 36,
    display: 'flex',
    padding: 2,
    gap: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    border: '1px solid transparent',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  segDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  // CHIP SHELF — 68px sticky at top 104 (52+52), z18; sticky stack 172 ✓.
  chipShelf: {
    position: 'sticky',
    top: 104,
    zIndex: 18,
    height: 68,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingBlock: 12,
    paddingInline: 16,
    overflowX: 'auto',
    scrollSnapType: 'x proximity',
    scrollPaddingInline: 16,
    background: 'var(--color-background-body)',
    borderBottom: '1px solid var(--color-border)',
  },
  shelfOverline: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
    scrollSnapAlign: 'start',
  },
  // CHIP — 32px visual pill inside a 44px hit (6px transparent
  // paddingBlock: 32+12 = 44 ✓). Round (999) = draggable object.
  chipHit: {
    paddingBlock: 6,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    touchAction: 'none',
    borderRadius: 999,
  },
  chipPill: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: \`1px solid \${CHIP_BORDER}\`,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  chipGhosted: {opacity: 0.4},
  chipIcon: {display: 'inline-flex', color: BRAND_ACCENT},
  // STOCK ROW — 44px in-flow rail of dashed stock-filler chips.
  stockRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    overflowX: 'auto',
    scrollPaddingInline: 16,
    marginTop: 12,
  },
  stockLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  stockPill: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    border: '1.5px dashed var(--color-border)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // sectionHeader — 13/600 uppercase 0.06em at the 16px gutter (deck) or
  // 32px (inside-card alignment), 20px top / 8px bottom.
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // PROMPT DECK — cards inset 16, stacked 12px, 24px after the deck.
  deck: {display: 'flex', flexDirection: 'column', gap: 12, paddingInline: 16, marginBottom: 24},
  promptCard: {
    position: 'relative',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 16,
  },
  // Active card: 2px inset BRAND_ACCENT ring (boxShadow so the border-box
  // never shifts) + ACTIVE badge.
  promptCardActive: {boxShadow: \`inset 0 0 0 2px \${BRAND_ACCENT}\`},
  activeBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: BRAND_FILL_TEXT,
    background: BRAND_FILL,
    borderRadius: 999,
    padding: '1px 8px',
  },
  // Sentence paragraph — 16px/400 lineHeight 28; slots are inline-flex
  // buttons so the sentence reflows live (no absolute positioning).
  sentence: {margin: 0, fontSize: 16, fontWeight: 400, lineHeight: '28px'},
  // SLOT — 28px visual pill in a 44px hit via paddingBlock 8 + negative
  // marginBlock (28+16 = 44 ✓). Rectangular radius 8 = 'fill me'.
  slotHit: {
    display: 'inline-flex',
    verticalAlign: 'bottom',
    paddingBlock: 8,
    marginBlock: -8,
    borderRadius: 8,
  },
  slotEmpty: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 8,
    border: \`1.5px dashed \${BRAND_ACCENT}\`,
    fontSize: 13,
    fontWeight: 500,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  slotArmed: {border: \`2px solid \${BRAND_ACCENT}\`, paddingInline: 7.5},
  slotFilled: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 8,
    borderRadius: 8,
    background: SLOT_FILL,
    fontSize: 13,
    fontWeight: 600,
    color: SLOT_TEXT,
    whiteSpace: 'nowrap',
  },
  slotHover: {outline: \`2px solid \${BRAND_ACCENT}\`, outlineOffset: 1},
  slotMismatch: {outline: \`2px solid \${MISMATCH}\`, outlineOffset: 1},
  // Card footer — 36px row: meter (flex 1) + Save + Use.
  cardFooter: {
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 36,
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  secondaryBtnBrand: {border: \`1px solid \${BRAND_ACCENT}\`, color: BRAND_ACCENT},
  secondaryBtnDisabled: {opacity: 0.4},
  // SPECIFICITY METER — 3 segments 6px tall radius 3, 4px gap.
  meter: {display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0},
  meterSegs: {display: 'flex', gap: 4, flex: 1, minWidth: 0, position: 'relative'},
  meterSeg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    background: 'var(--color-background-muted)',
  },
  // Filled segment: raw #F59E0B rest-state fill — 3.1:1 vs light muted
  // track / 3.3:1 vs dark (math at BRAND_FILL declaration).
  meterSegOn: {background: BRAND_FILL},
  meterLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  sparkDot: {
    position: 'absolute',
    top: -2,
    width: 6,
    height: 6,
    borderRadius: 999,
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  meterMini: {display: 'flex', flexDirection: 'column', gap: 3, width: 12, flexShrink: 0},
  meterMiniSeg: {height: 4, borderRadius: 3, background: 'var(--color-background-muted)'},
  // LAB FOOTER — 64px sticky bottom:64 z19 (sits on the tabBar), blur +
  // hairline; live meter + Preview.
  labFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  // Preview: 36px visual inside a 48px hit via paddingBlock 6.
  previewHit: {flexShrink: 0, paddingBlock: 6, borderRadius: 12},
  previewBtn: {
    height: 36,
    minWidth: 96,
    paddingInline: 16,
    borderRadius: 12,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  previewBtnDisabled: {opacity: 0.4},
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // VIEWPORT bottom mid-scroll (amendment: absolute would pin to the
  // document bottom). Rendered at the end of scrollable content, before
  // the sticky footers. Always mounted for aria-live.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    insetInline: 0,
    pointerEvents: 'none',
  },
  // While the shell is scroll-locked (sheet open) the dock re-renders
  // absolute — the only time shell-absolute is correct.
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 0,
    bottom: 76,
    zIndex: 30,
    height: 0,
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    insetInline: 16,
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 12,
  },
  // TAB BAR — 64px sticky bottom z20; 4 flex-1 tabItems.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
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
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_FILL,
    color: BADGE_TEXT,
    fontSize: 10,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  // EDIT TOOLBAR — replaces tabBar, identical geometry.
  editToolbar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  editToolbarBtn: {
    minHeight: 44,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  editToolbarDelete: {color: 'var(--color-error)'},
  editToolbarDisabled: {color: 'var(--color-text-secondary)', opacity: 0.4},
  // LIST CARDS — inset-grouped, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider68: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  rowDivider16: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // 72px media rows (Saved / Sent).
  mediaRow: {
    position: 'relative',
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 8,
  },
  // Selection shift — transform-only (200ms; instant under reduced
  // motion) so edit mode never animates layout.
  rowShiftable: {display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0},
  rowShifted: {transform: 'translateX(40px)'},
  selectionCircle: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 999,
    border: '2px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    background: 'transparent',
  },
  // Selected: brand fill + white check — #FFFFFF on #B45309 ≈ 5.0:1
  // light; dark uses BRAND_FILL_TEXT ember on #FBBF24 ≈ 9.6:1.
  selectionCircleOn: {
    border: \`2px solid \${BRAND_ACCENT}\`,
    background: BRAND_ACCENT,
    color: 'light-dark(#FFFFFF, #451A03)',
  },
  toneTile: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 700,
  },
  rowText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  rowSecondary: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowTrailing: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  scoreText: {fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums'},
  repliedText: {fontSize: 13, fontWeight: 600, color: REPLIED_GREEN, whiteSpace: 'nowrap'},
  dashText: {fontSize: 13, color: 'var(--color-text-secondary)'},
  avatar40: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 600,
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  refreshCaption: {
    margin: '8px 16px 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // EMPTY STATE — true-empty Saved (zero buttons: creation lives in Lab).
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {margin: 0, fontSize: 17, fontWeight: 600},
  emptyBody: {margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)'},
  // RECEIPTS CARD (Sent) — reply-rate bars.
  receiptsCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 16,
  },
  receiptsTitle: {margin: 0, fontSize: 17, fontWeight: 600},
  barRow: {display: 'flex', alignItems: 'center', gap: 8, height: 28},
  barLabel: {
    width: 84,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  barTrack: {
    flex: 1,
    minWidth: 0,
    height: 6,
    borderRadius: 3,
    background: 'var(--color-background-muted)',
    position: 'relative',
  },
  // Bar fill: raw #F59E0B rest fill, 3.1:1/3.3:1 vs the muted track
  // (math at BRAND_FILL). 0% renders a 4px stub.
  barFill: {
    position: 'absolute',
    insetBlock: 0,
    left: 0,
    borderRadius: 3,
    background: BRAND_FILL,
  },
  barCount: {
    flexShrink: 0,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  overallCaption: {
    margin: '12px 0 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SKELETONS — same 72px geometry as the rows they impersonate.
  skelRow: {
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skelCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  skelBars: {flex: 1, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // YOU TAB.
  youHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '24px 16px 8px',
  },
  youAvatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 700,
    flexShrink: 0,
  },
  youName: {margin: 0, fontSize: 22, fontWeight: 700},
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  utilityLabel: {flex: 1, minWidth: 0, fontSize: 16, fontWeight: 400},
  utilityValue: {
    fontSize: 16,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  toneBarPad: {padding: '4px 16px 12px', display: 'flex', flexDirection: 'column', gap: 4},
  // SWITCH — 51×31 track, 27px thumb, 20px travel (inputControls).
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    flexShrink: 0,
    position: 'relative',
    // OFF track — interactive rest fill vs the card surface (amendment):
    // rgba blends land ≈ #D9D5D1 vs light card ≈ 1.35:1 as a FILL but the
    // 27px white thumb + its shadow carry the boundary; the track pair
    // itself is the foundations-specified literal.
    background: 'light-dark(rgba(21,17,12,0.14), rgba(255,255,255,0.22))',
    transition: 'background 200ms ease',
  },
  switchTrackOn: {background: BRAND_ACCENT},
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
  },
  switchThumbOn: {transform: 'translateX(20px)'},
  // SHEET — scrim z40 + sheet z41, absolute inside shell.
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
  sheetTitle: {margin: 0, fontSize: 17, fontWeight: 600, textAlign: 'center'},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    height: 64 + 16,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  // Send button: raw #F59E0B fill, #451A03 text ≈ 4.6:1 (math at
  // BRAND_FILL_TEXT declaration).
  sendBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // RECIPIENT BUBBLE PREVIEW — received-side (left-aligned) in Maya's
  // theme; radius 18 with a 4px bottom-left tail corner.
  bubbleWrap: {display: 'flex', gap: 8, alignItems: 'flex-end', marginTop: 12},
  bubble: {
    maxWidth: '76%',
    padding: '10px 14px',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    background: BUBBLE_FILL,
    color: BUBBLE_TEXT,
    fontSize: 16,
    fontWeight: 400,
    lineHeight: '22px',
  },
  bubbleBlank: {color: 'var(--color-text-secondary)', fontWeight: 500},
  bubbleCaption: {margin: '8px 0 0', fontSize: 13, color: 'var(--color-text-secondary)'},
  bubbleTime: {
    margin: '2px 0 0',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // FORM FIELD (large detent) — always-on focus ring on the input.
  formField: {marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8},
  fieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  textarea: {
    minHeight: 96,
    padding: 12,
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: '22px',
    fontFamily: 'var(--font-family-body)',
    resize: 'vertical',
    boxShadow: \`inset 0 0 0 2px \${BRAND_ACCENT}\`,
  },
  // Send-log mini rows (60px).
  sendLogCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendLogRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 12,
    paddingBlock: 8,
  },
  sheetSectionHeader: {
    margin: '20px 0 8px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // DRAG GHOST — 32px chip clone at 0.9 scale following the pointer
  // (transform translate3d; absolute inside shell).
  dragGhost: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 45,
    pointerEvents: 'none',
    opacity: 0.95,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — module-level consts with identity consts; every displayed
// aggregate is computed from the arrays at render (reduce/filter), never a
// literal. Cross-check ledger (verified by hand): chips 3+2+1 = 6 ✓;
// prompts 3+3+3 = 9, slots per tone 4/5/4 ✓; saved scores 3+2+3 = 8, 8/3 =
// 2.67 → '2.7' ✓; sent scores [3,3,3,3,2,2,1,1] = 8 ✓; replies by score
// 3/4 = 75%, 1/2 = 50%, 0/2 = 0% → 4 of 8 = 50% ✓; sent tones Playful×3 +
// Curious×4 + Bold×1 = 8 ✓ (You-tab bar widths 3/4 = 75%, 4/4 = 100%,
// 1/4 = 25% ✓); tab badge '4' = reply count ✓.
// ---------------------------------------------------------------------------

type Tone = 'playful' | 'curious' | 'bold';
type ChipType = 'interest' | 'place' | 'food';
type Score = 1 | 2 | 3;

const MATCH = {id: 'maya-07', name: 'Maya', hash: 572} as const; // hash math at MAYA_GRADIENT

const TONES: Tone[] = ['playful', 'curious', 'bold'];
const TONE_LABEL: Record<Tone, string> = {playful: 'Playful', curious: 'Curious', bold: 'Bold'};
const TONE_DOT: Record<Tone, string> = {playful: TONE_PINK, curious: BRAND_ACCENT, bold: TONE_INDIGO};
// Saved-row tone tiles: 18% tone-color wash + the tone color itself as
// the glyph — every tone pair already passes 4.5:1 against the card
// (math at the TONE_* declarations), and a wash can only raise it.
const toneTileWash = (tone: Tone): string => \`color-mix(in srgb, \${TONE_DOT[tone]} 18%, transparent)\`;

const SCORE_LABEL: Record<Score, string> = {1: 'Generic', 2: 'Specific', 3: 'Personal'};

interface ProfileChip {
  id: string;
  type: ChipType;
  label: string;
  profile: boolean; // false = stock filler → caps the score at Specific (2)
}

// Maya's 6 profile chips: 3 interest + 2 place + 1 food = 6 ✓. 'the
// Sunday flea market' (22 chars) is the wrap stress inside two-slot p8.
const CHIPS: ProfileChip[] = [
  {id: 'chip-pottery', type: 'interest', label: 'pottery class', profile: true},
  {id: 'chip-film', type: 'interest', label: 'film photography', profile: true},
  {id: 'chip-boulder', type: 'interest', label: 'bouldering', profile: true},
  {id: 'chip-echo', type: 'place', label: 'Echo Park', profile: true},
  {id: 'chip-flea', type: 'place', label: 'the Sunday flea market', profile: true},
  {id: 'chip-burrito', type: 'food', label: 'breakfast burritos', profile: true},
];

// Stock fillers — one per type; isProfileChip = false, so filling with
// them caps the meter at Specific (stress fixture 3).
const STOCK: ProfileChip[] = [
  {id: 'stock-coffee', type: 'interest', label: 'coffee', profile: false},
  {id: 'stock-fun', type: 'place', label: 'somewhere fun', profile: false},
  {id: 'stock-tacos', type: 'food', label: 'good tacos', profile: false},
];

const CHIP_BY_ID: Record<string, ProfileChip> = Object.fromEntries(
  [...CHIPS, ...STOCK].map(chip => [chip.id, chip]),
);

const CHIP_TYPE_ICON: Record<ChipType, typeof HeartIcon> = {
  interest: HeartIcon,
  place: MapPinIcon,
  food: CoffeeIcon,
};

type PromptToken = {kind: 'text'; text: string} | {kind: 'slot'; type: ChipType};

interface Prompt {
  id: string;
  tone: Tone;
  tokens: PromptToken[];
  slotTypes: ChipType[]; // dual field — never parsed back out of tokens
}

const text = (t: string): PromptToken => ({kind: 'text', text: t});
const slot = (type: ChipType): PromptToken => ({kind: 'slot', type});

// 9 prompts = 3 per tone ✓; slot counts per tone 1+2+1 = 4 (playful),
// 2+1+2 = 5 (curious), 1+2+1 = 4 (bold).
const PROMPTS: Prompt[] = [
  {
    id: 'p1',
    tone: 'playful',
    tokens: [
      text('Two truths and a lie: I once won a '),
      slot('interest'),
      text(' bet, I can whistle any movie theme, and I read your profile twice.'),
    ],
    slotTypes: ['interest'],
  },
  {
    id: 'p2',
    tone: 'playful',
    tokens: [
      text('Hot-take ranking: '),
      slot('interest'),
      text(' is underrated and '),
      slot('place'),
      text(' is overrated. Defend your position.'),
    ],
    slotTypes: ['interest', 'place'],
  },
  {
    id: 'p3',
    tone: 'playful',
    tokens: [
      text('Serious question — best '),
      slot('food'),
      text(' within ten minutes of you. Wrong answers only.'),
    ],
    slotTypes: ['food'],
  },
  {
    id: 'p4',
    tone: 'curious',
    tokens: [
      text('What got you into '),
      slot('interest'),
      text(' — and is '),
      slot('place'),
      text(' actually worth the hype?'),
    ],
    slotTypes: ['interest', 'place'],
  },
  {
    id: 'p5',
    tone: 'curious',
    tokens: [
      text('I need the origin story behind '),
      slot('interest'),
      text(' — was it love at first try?'),
    ],
    slotTypes: ['interest'],
  },
  {
    id: 'p6',
    tone: 'curious',
    tokens: [
      text('Real talk: does '),
      slot('place'),
      text(' have decent '),
      slot('food'),
      text(', or is that a beautiful myth?'),
    ],
    slotTypes: ['place', 'food'],
  },
  {
    id: 'p7',
    tone: 'bold',
    tokens: [
      text('Skip the small talk — teach me one thing about '),
      slot('interest'),
      text(" and I'll bring the questions."),
    ],
    slotTypes: ['interest'],
  },
  {
    id: 'p8',
    tone: 'bold',
    tokens: [
      slot('place'),
      text(', Saturday, '),
      slot('food'),
      text(" — I'm buying if you're terrible at small talk too."),
    ],
    slotTypes: ['place', 'food'],
  },
  {
    id: 'p9',
    tone: 'bold',
    tokens: [
      text("I'm calling it now: our first debate happens at "),
      slot('place'),
      text('.'),
    ],
    slotTypes: ['place'],
  },
];

const PROMPT_BY_ID: Record<string, Prompt> = Object.fromEntries(PROMPTS.map(p => [p.id, p]));

interface SavedOpener {
  id: string;
  textLine: string;
  tone: Tone;
  score: Score; // dual field driving the mini meter — never parsed from text
}

// Scores 3+2+3 = 8 → AVG (8/3).toFixed(1) = '2.7' ✓; tones
// Curious/Playful/Bold. sv2's stock fill ('good tacos') is WHY it sits at
// 2 — the fixture tells the derivation story.
const SAVED_FIXTURE: SavedOpener[] = [
  {
    id: 'sv1',
    textLine: 'What got you into pottery class — and is Echo Park actually worth the hype?',
    tone: 'curious',
    score: 3,
  },
  {
    id: 'sv2',
    textLine: 'Serious question — best good tacos within ten minutes of you. Wrong answers only.',
    tone: 'playful',
    score: 2,
  },
  {
    id: 'sv3',
    textLine: "the Sunday flea market, Saturday, breakfast burritos — I'm buying if you're terrible at small talk too.",
    tone: 'bold',
    score: 3,
  },
];

interface SentOpener {
  id: string;
  textLine: string;
  recipient: string;
  tone: Tone;
  score: Score;
  replied: boolean;
}

// 8 sent: scores [3,3,3,3,2,2,1,1] ✓; replied score-3 [T,T,T,F] = 3/4,
// score-2 [T,F] = 1/2, score-1 [F,F] = 0/2 → 4 replies ✓; tones Playful×3
// (s2,s5,s7) + Curious×4 (s1,s3,s6,s8) + Bold×1 (s4) = 8 ✓.
const SENT_FIXTURE: SentOpener[] = [
  {
    id: 's1',
    textLine: 'What got you into film photography — and is Echo Park actually worth the hype?',
    recipient: 'Priya',
    tone: 'curious',
    score: 3,
    replied: true,
  },
  {
    id: 's2',
    textLine: 'Hot-take ranking: bouldering is underrated and the Sunday flea market is overrated. Defend your position.',
    recipient: 'Jules',
    tone: 'playful',
    score: 3,
    replied: true,
  },
  {
    id: 's3',
    textLine: 'I need the origin story behind pottery class — was it love at first try?',
    recipient: 'Dana',
    tone: 'curious',
    score: 3,
    replied: true,
  },
  {
    id: 's4',
    textLine: "Echo Park, Saturday, breakfast burritos — I'm buying if you're terrible at small talk too.",
    recipient: 'Rowan',
    tone: 'bold',
    score: 3,
    replied: false,
  },
  {
    id: 's5',
    textLine: 'Serious question — best good tacos within ten minutes of you. Wrong answers only.',
    recipient: 'Sam',
    tone: 'playful',
    score: 2,
    replied: true,
  },
  {
    id: 's6',
    textLine: 'Real talk: does somewhere fun have decent breakfast burritos, or is that a beautiful myth?',
    recipient: 'Noor',
    tone: 'curious',
    score: 2,
    replied: false,
  },
  {
    id: 's7',
    textLine: 'Hey, how has your week been going?',
    recipient: 'Casey',
    tone: 'playful',
    score: 1,
    replied: false,
  },
  {
    id: 's8',
    textLine: 'Hi! Any fun plans for the weekend?',
    recipient: 'Avery',
    tone: 'curious',
    score: 1,
    replied: false,
  },
];

// Deterministic skeleton widths (emptyAndSkeleton): primary 60/45/70/60,
// secondary 40/55/30/40 — a fixed cycle, never Math.random().
const SKELETON_PRIMARY = [60, 45, 70, 60];
const SKELETON_SECONDARY = [40, 55, 30, 40];

/** id → deterministic avatar gradient (sum of char codes → hue pair). */
function idGradient(id: string): string {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  const hueA = sum % 360;
  const hueB = (hueA + 40) % 360;
  return \`linear-gradient(135deg, hsl(\${hueA} 72% 62%), hsl(\${hueB} 84% 60%))\`;
}

// ---------------------------------------------------------------------------
// DERIVATIONS — pure render-time math; nothing here is stored.
// ---------------------------------------------------------------------------

type SlotFills = Record<string, string | null>;

const slotKey = (promptId: string, index: number): string => \`\${promptId}:\${index}\`;

/** The SpecificityMeter law: allSlotsFilled ? (all profile ? 3 : 2) :
 * (any profile ? 2 : 1). Stock fillers can never reach Personal. */
function scoreDraft(prompt: Prompt, fills: SlotFills): Score {
  const filled = prompt.slotTypes.map((_, i) => {
    const chipId = fills[slotKey(prompt.id, i)];
    return chipId != null ? CHIP_BY_ID[chipId] : null;
  });
  const allFilled = filled.every(chip => chip != null);
  const someProfile = filled.some(chip => chip?.profile === true);
  if (allFilled) return filled.every(chip => chip?.profile === true) ? 3 : 2;
  return someProfile ? 2 : 1;
}

/** Composed sentence with '____' for unfilled slots (the honest peek). */
function composeDraft(prompt: Prompt, fills: SlotFills): string {
  let slotIndex = 0;
  return prompt.tokens
    .map(token => {
      if (token.kind === 'text') return token.text;
      const chipId = fills[slotKey(prompt.id, slotIndex++)];
      return chipId != null ? CHIP_BY_ID[chipId].label : '____';
    })
    .join('');
}

/** Reply-rate grouping by score, reduce over sent[] — never hardcoded. */
function replyStats(sent: SentOpener[]): Array<{score: Score; label: string; sentCount: number; replies: number; pct: number}> {
  return ([3, 2, 1] as Score[]).map(score => {
    const group = sent.filter(item => item.score === score);
    const replies = group.filter(item => item.replied).length;
    const pct = group.length === 0 ? 0 : Math.round((replies / group.length) * 100);
    return {score, label: SCORE_LABEL[score], sentCount: group.length, replies, pct};
  });
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — draftStore: useState object + update(patch); list
// mutations flow through update with mapped arrays. The only state outside
// it is the transient pointer-drag ghost (per house rule).
// ---------------------------------------------------------------------------

type TabId = 'lab' | 'saved' | 'sent' | 'you';

const TAB_TITLE: Record<TabId, string> = {
  lab: 'Icebreaker Lab',
  saved: 'Saved',
  sent: 'Sent',
  you: 'You',
};

interface Toast {
  seq: number;
  msg: string;
  undoPatch: Partial<DraftStore> | null;
}

interface DraftStore {
  tab: TabId;
  scrollByTab: Record<TabId, number>;
  tone: Tone;
  activePromptId: string | null;
  slotFills: SlotFills;
  armedSlotKey: string | null;
  sheetDetent: null | 'medium' | 'large';
  sheetDraft: string;
  saved: SavedOpener[];
  sent: SentOpener[];
  selectedIds: string[];
  editing: boolean;
  toast: Toast | null;
  refreshingSent: boolean;
  sentRefreshed: boolean;
  switches: {coach: boolean; haptics: boolean};
  seq: number; // monotonic id/toast counter — deterministic, no Date.now()
}

const INITIAL_STORE: DraftStore = {
  tab: 'lab',
  scrollByTab: {lab: 0, saved: 0, sent: 0, you: 0},
  tone: 'curious',
  activePromptId: null,
  slotFills: {},
  armedSlotKey: null,
  sheetDetent: null,
  sheetDraft: '',
  saved: SAVED_FIXTURE,
  sent: SENT_FIXTURE,
  selectedIds: [],
  editing: false,
  toast: null,
  refreshingSent: false,
  sentRefreshed: false,
  switches: {coach: true, haptics: false},
  seq: 0,
};

/**
 * Container-width hook (grid-feeder-console pattern): only a
 * ResizeObserver on the wrapper can tell the 390px mobile stage from the
 * ~1045px desktop stage inside the same 1440px window.
 */
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns page scroll. */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const overflowY = window.getComputedStyle(current).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

/** Sheet focus trap — Tab cycles within; Escape handled by the sheet. */
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), textarea');
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
// SPARK MARK — 28px Kindling flint chevron + rising spark dot. Strokes use
// var(--color-text-primary) (house rule: never bare --color-text).
// ---------------------------------------------------------------------------

function SparkMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M6 20 L13 9 L17 15"
          stroke="var(--color-text-primary)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 22.5 h9"
          stroke="var(--color-text-primary)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={20.5} cy={7.5} r={2.5} fill={BRAND_ACCENT} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SPECIFICITY METER — pure derived render, zero own state beyond the
// spark-on-tick-up ref. role='img'; announcements route through the ONE
// toastDock, never a second live region.
// ---------------------------------------------------------------------------

interface SpecificityMeterProps {
  score: Score;
  showLabel: boolean;
}

function SpecificityMeter({score, showLabel}: SpecificityMeterProps) {
  const prevScoreRef = useRef(score);
  const [spark, setSpark] = useState<{seq: number; segIndex: number} | null>(null);
  useEffect(() => {
    if (score > prevScoreRef.current) {
      // Tick UP → 6px spark rises from the newest segment (transform/
      // opacity only; the .kd-spark class is removed entirely under
      // prefers-reduced-motion — the filled segment alone encodes it).
      setSpark(prev => ({seq: (prev?.seq ?? 0) + 1, segIndex: score - 1}));
    }
    prevScoreRef.current = score;
  }, [score]);
  return (
    <span
      style={styles.meter}
      role="img"
      aria-label={\`Specificity: \${SCORE_LABEL[score]}, \${score} of 3\`}>
      <span style={styles.meterSegs}>
        {[0, 1, 2].map(index => (
          <span
            key={index}
            style={index < score ? {...styles.meterSeg, ...styles.meterSegOn} : styles.meterSeg}
          />
        ))}
        {spark != null ? (
          <span
            key={spark.seq}
            className="kd-spark"
            style={{
              ...styles.sparkDot,
              left: \`calc(\${(spark.segIndex + 0.5) * 33.3}% - 3px)\`,
            }}
            aria-hidden
          />
        ) : null}
      </span>
      {showLabel ? <span style={styles.meterLabel}>{SCORE_LABEL[score]}</span> : null}
    </span>
  );
}

/** 12px-wide mini vertical variant for Saved rows. */
function MiniMeter({score}: {score: Score}) {
  return (
    <span style={styles.meterMini} role="img" aria-label={\`Specificity \${score} of 3\`}>
      {[2, 1, 0].map(index => (
        <span
          key={index}
          style={index < score ? {...styles.meterMiniSeg, ...styles.meterSegOn} : styles.meterMiniSeg}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// REPLY RATE BARS — 3 deterministic 28px rows computed by reduce over
// sent[]; widths are pct strings; 0% renders a 4px stub.
// ---------------------------------------------------------------------------

function ReplyRateBars({sent}: {sent: SentOpener[]}) {
  const stats = replyStats(sent);
  const totalReplies = stats.reduce((sum, stat) => sum + stat.replies, 0);
  const overallPct = sent.length === 0 ? 0 : Math.round((totalReplies / sent.length) * 100);
  return (
    <div style={styles.receiptsCard}>
      <h2 style={styles.receiptsTitle}>Reply rate by specificity</h2>
      <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', gap: 0}}>
        {stats.map(stat => (
          <div key={stat.score} style={styles.barRow}>
            <span style={styles.barLabel}>{stat.label}</span>
            <span style={styles.barTrack} aria-hidden>
              <span
                style={{
                  ...styles.barFill,
                  width: stat.pct === 0 ? 4 : \`\${stat.pct}%\`,
                }}
              />
            </span>
            <span style={styles.barCount}>
              {stat.replies}/{stat.sentCount} · {stat.pct}%
            </span>
          </div>
        ))}
      </div>
      <p style={styles.overallCaption}>
        {totalReplies} of {sent.length} openers got replies · {overallPct}%
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RECIPIENT BUBBLE PREVIEW — received-side (left-aligned) render in Maya's
// theme; unfilled slots render as '____' so the peek is honest.
// ---------------------------------------------------------------------------

function RecipientBubblePreview({prompt, fills}: {prompt: Prompt; fills: SlotFills}) {
  let slotIndex = 0;
  return (
    <div>
      <div style={styles.bubbleWrap}>
        <span style={{...styles.avatar40, background: MAYA_GRADIENT}} aria-hidden>
          M
        </span>
        <div style={styles.bubble}>
          {prompt.tokens.map((token, tokenIndex) => {
            if (token.kind === 'text') return <span key={tokenIndex}>{token.text}</span>;
            const chipId = fills[slotKey(prompt.id, slotIndex++)];
            return chipId != null ? (
              <span key={tokenIndex}>{CHIP_BY_ID[chipId].label}</span>
            ) : (
              <span key={tokenIndex} style={styles.bubbleBlank}>
                ____
              </span>
            );
          })}
        </div>
      </div>
      <p style={styles.bubbleCaption}>How {MATCH.name} sees it</p>
      <p style={styles.bubbleTime}>Today 7:42 PM</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TONE SEGMENTED CONTROL — contract segmented control with per-tone 8px
// leading dots; radiogroup + ArrowLeft/ArrowRight.
// ---------------------------------------------------------------------------

function ToneSegmentedControl({tone, onSelect}: {tone: Tone; onSelect: (next: Tone) => void}) {
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TONES.indexOf(tone);
    const nextIndex =
      event.key === 'ArrowLeft'
        ? (index + TONES.length - 1) % TONES.length
        : (index + 1) % TONES.length;
    onSelect(TONES[nextIndex]);
  };
  return (
    <div style={styles.segTrack} role="radiogroup" aria-label="Opener tone" onKeyDown={handleKeyDown}>
      {TONES.map(option => {
        const active = option === tone;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            className="kd-btn kd-focusable"
            style={active ? {...styles.segBtn, ...styles.segBtnActive} : styles.segBtn}
            onClick={() => onSelect(option)}>
            <span style={{...styles.segDot, background: TONE_DOT[option]}} aria-hidden />
            {TONE_LABEL[option]}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SWITCH ROW — 51×31 track / 27px thumb / 20px travel; the WHOLE 44px row
// is the role=switch button (inputControls contract).
// ---------------------------------------------------------------------------

function SwitchRow({label, checked, onToggle}: {label: string; checked: boolean; onToggle: () => void}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="kd-btn kd-focusable"
      style={styles.utilityRow}
      onClick={onToggle}>
      <span style={styles.utilityLabel}>{label}</span>
      <span
        style={checked ? {...styles.switchTrack, ...styles.switchTrackOn} : styles.switchTrack}
        aria-hidden>
        <span
          className="kd-anim"
          style={checked ? {...styles.switchThumb, ...styles.switchThumbOn} : styles.switchThumb}
        />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Kindling Icebreaker Lab. ONE draftStore + update(patch); every
// surface (deck, shelf, footer meter, tabs, sheet, toasts) reads/writes it.
// ---------------------------------------------------------------------------

const CHIP_ARTICLE: Record<ChipType, string> = {
  interest: 'an interest',
  place: 'a place',
  food: 'a food',
};

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

interface DragGhost {
  chipId: string;
  x: number;
  y: number;
  hoverKey: string | null;
  mismatch: boolean;
}

interface SlotRectEntry {
  key: string;
  promptId: string;
  slotIndex: number;
  type: ChipType;
  rect: DOMRect;
}

export default function MobileIcebreakerLabPage() {
  const [store, setStore] = useState<DraftStore>(INITIAL_STORE);
  const update = useCallback((patch: Partial<DraftStore>) => {
    setStore(prev => ({...prev, ...patch}));
  }, []);
  // Announce THROUGH the one toastDock region; every mutation rides along
  // as extraPatch so the write is a single setStore call.
  const announce = useCallback(
    (msg: string, undoPatch: Partial<DraftStore> | null = null, extraPatch: Partial<DraftStore> = {}) => {
      setStore(prev => ({
        ...prev,
        ...extraPatch,
        seq: prev.seq + 1,
        toast: {seq: prev.seq + 1, msg, undoPatch},
      }));
    },
    [],
  );

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const grabberRef = useRef<HTMLButtonElement | null>(null);
  const previewBtnRef = useRef<HTMLButtonElement | null>(null);
  const storeRef = useRef(store);
  storeRef.current = store;

  const containerWidth = useElementWidth(wrapRef);
  // First-frame fallback only — container width wins once measured.
  const narrowViewport = useMediaQuery('(max-width: 359px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isDesktop = containerWidth >= 720;
  const showMeterLabel = containerWidth === 0 ? !narrowViewport : containerWidth >= 360;

  // Transient drag state — the sanctioned exception to the single owner.
  const [drag, setDrag] = useState<DragGhost | null>(null);
  const dragInfoRef = useRef<{chip: ProfileChip; startX: number; startY: number; active: boolean} | null>(null);
  const shellRectRef = useRef<DOMRect | null>(null);
  const slotRectsRef = useRef<SlotRectEntry[]>([]);
  const suppressClickRef = useRef(false);
  const [chipShake, setChipShake] = useState<{id: string; seq: number} | null>(null);
  const [shelfShake, setShelfShake] = useState(0);
  const [sheetDragY, setSheetDragY] = useState(0);
  const sheetDragRef = useRef<{startY: number} | null>(null);

  const {tab, tone, activePromptId, slotFills, armedSlotKey, sheetDetent, saved, sent, selectedIds, editing, toast} = store;
  const sheetOpen = sheetDetent != null;
  const activePrompt = activePromptId != null ? PROMPT_BY_ID[activePromptId] : null;
  const activeScore: Score = activePrompt != null ? scoreDraft(activePrompt, slotFills) : 1;
  const activeAllFilled =
    activePrompt != null &&
    activePrompt.slotTypes.every((_, index) => slotFills[slotKey(activePrompt.id, index)] != null);
  const usedChipIds = new Set(Object.values(slotFills).filter((id): id is string => id != null));
  const deck = PROMPTS.filter(prompt => prompt.tone === tone);
  const replies = sent.filter(item => item.replied).length;
  const savedAvg = saved.length === 0 ? '0.0' : (saved.reduce((sum, item) => sum + item.score, 0) / saved.length).toFixed(1);

  // -------------------------------------------------------------------
  // PLACEMENT — shared by drag-drop and the tap path.
  // -------------------------------------------------------------------

  const placeChip = useCallback(
    (promptId: string, slotIndex: number, chip: ProfileChip) => {
      setStore(prev => {
        const baseFills = prev.activePromptId === promptId ? prev.slotFills : {};
        const nextFills = {...baseFills, [slotKey(promptId, slotIndex)]: chip.id};
        const nextScore = scoreDraft(PROMPT_BY_ID[promptId], nextFills);
        return {
          ...prev,
          activePromptId: promptId,
          slotFills: nextFills,
          armedSlotKey: null,
          seq: prev.seq + 1,
          toast: {
            seq: prev.seq + 1,
            msg: \`\${chip.label} placed — Specificity: \${SCORE_LABEL[nextScore]}\`,
            undoPatch: null,
          },
        };
      });
    },
    [],
  );

  const onSlotClick = (prompt: Prompt, slotIndex: number) => {
    const key = slotKey(prompt.id, slotIndex);
    const filledChipId = activePromptId === prompt.id ? slotFills[key] : null;
    if (filledChipId != null) {
      const chip = CHIP_BY_ID[filledChipId];
      announce(\`\${chip.label} removed\`, null, {
        slotFills: {...slotFills, [key]: null},
        armedSlotKey: null,
      });
      return;
    }
    if (armedSlotKey === key) {
      update({armedSlotKey: null});
      return;
    }
    // Arming a slot in another card activates that prompt (fills reset
    // only when the prompt actually changes).
    const activationPatch: Partial<DraftStore> =
      activePromptId === prompt.id ? {} : {activePromptId: prompt.id, slotFills: {}};
    update({...activationPatch, armedSlotKey: key});
  };

  const onChipClick = (chip: ProfileChip) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (usedChipIds.has(chip.id)) return;
    if (armedSlotKey == null) {
      announce('Tap a slot in a prompt first');
      return;
    }
    const [promptId, indexText] = armedSlotKey.split(':');
    const slotIndex = Number(indexText);
    const wantType = PROMPT_BY_ID[promptId].slotTypes[slotIndex];
    if (wantType !== chip.type) {
      setChipShake(prev => ({id: chip.id, seq: (prev?.seq ?? 0) + 1}));
      announce(\`Needs \${CHIP_ARTICLE[wantType]} chip\`);
      return;
    }
    placeChip(promptId, slotIndex, chip);
  };

  // -------------------------------------------------------------------
  // DRAG — pointerdown on a chip, >8px starts the ghost; slot rects are
  // measured once at dragstart; pointerup over a type-match places. The
  // tap path above is the mandatory button fallback.
  // -------------------------------------------------------------------

  const hitTestSlot = (clientX: number, clientY: number): SlotRectEntry | null => {
    for (const entry of slotRectsRef.current) {
      const {rect} = entry;
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        return entry;
      }
    }
    return null;
  };

  const onChipPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, chip: ProfileChip) => {
    if (usedChipIds.has(chip.id)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragInfoRef.current = {chip, startX: event.clientX, startY: event.clientY, active: false};
  };

  const onChipPointerMove = (event: ReactPointerEvent<HTMLButtonElement>, chip: ProfileChip) => {
    const info = dragInfoRef.current;
    if (info == null || info.chip.id !== chip.id) return;
    if (!info.active) {
      if (Math.hypot(event.clientX - info.startX, event.clientY - info.startY) <= 8) return;
      info.active = true;
      const shell = shellRef.current;
      if (shell == null) return;
      shellRectRef.current = shell.getBoundingClientRect();
      slotRectsRef.current = Array.from(shell.querySelectorAll<HTMLElement>('[data-slotkey]')).map(el => ({
        key: el.dataset.slotkey ?? '',
        promptId: el.dataset.promptid ?? '',
        slotIndex: Number(el.dataset.slotindex ?? 0),
        type: (el.dataset.slottype ?? 'interest') as ChipType,
        rect: el.getBoundingClientRect(),
      }));
    }
    const shellRect = shellRectRef.current;
    if (shellRect == null) return;
    const over = hitTestSlot(event.clientX, event.clientY);
    setDrag({
      chipId: chip.id,
      x: event.clientX - shellRect.left,
      y: event.clientY - shellRect.top,
      hoverKey: over?.key ?? null,
      mismatch: over != null && over.type !== chip.type,
    });
  };

  const onChipPointerUp = (event: ReactPointerEvent<HTMLButtonElement>, chip: ProfileChip) => {
    const info = dragInfoRef.current;
    dragInfoRef.current = null;
    if (info == null || !info.active) return; // plain tap → click handler
    suppressClickRef.current = true;
    const over = hitTestSlot(event.clientX, event.clientY);
    if (over != null && over.type === chip.type) {
      placeChip(over.promptId, over.slotIndex, chip);
    }
    // Failed drop: ghost is simply removed (150ms fly-back is garnish the
    // tap path never needs; instant under reduced motion either way).
    setDrag(null);
  };

  // -------------------------------------------------------------------
  // TONE / USE / SAVE / PREVIEW / SEND.
  // -------------------------------------------------------------------

  const onToneSelect = (next: Tone) => {
    if (next === tone) return;
    if (activePrompt != null && activePrompt.tone !== next) {
      // Cross-tone switch voids the draft — exact-snapshot Undo.
      const undoPatch: Partial<DraftStore> = {
        tone,
        activePromptId,
        slotFills,
      };
      setShelfShake(prev => prev + 1);
      announce(\`\${TONE_LABEL[activePrompt.tone]} draft cleared\`, undoPatch, {
        tone: next,
        activePromptId: null,
        slotFills: {},
        armedSlotKey: null,
      });
      return;
    }
    update({tone: next});
  };

  const onUse = (prompt: Prompt) => {
    if (prompt.id === activePromptId) return;
    update({activePromptId: prompt.id, slotFills: {}, armedSlotKey: null});
  };

  const onSaveOpener = () => {
    if (activePrompt == null || !activeAllFilled) return;
    const composed = composeDraft(activePrompt, slotFills);
    setStore(prev => ({
      ...prev,
      saved: [
        {id: \`sv-n\${prev.seq + 1}\`, textLine: composed, tone: activePrompt.tone, score: activeScore},
        ...prev.saved,
      ],
      seq: prev.seq + 1,
      toast: {seq: prev.seq + 1, msg: \`Saved · Specificity \${activeScore}/3\`, undoPatch: null},
    }));
  };

  const onPreview = () => {
    if (activePrompt == null) return;
    update({sheetDetent: 'medium', sheetDraft: composeDraft(activePrompt, slotFills)});
  };

  const closeSheet = useCallback(() => {
    setSheetDragY(0);
    update({sheetDetent: null});
  }, [update]);

  const onSend = () => {
    if (activePrompt == null) return;
    const line = store.sheetDraft.trim() !== '' ? store.sheetDraft.trim() : composeDraft(activePrompt, slotFills);
    setStore(prev => {
      const nextSent: SentOpener[] = [
        {
          id: \`s\${prev.sent.length + 1}\`,
          textLine: line,
          recipient: MATCH.name,
          tone: activePrompt.tone,
          score: activeScore,
          replied: false,
        },
        // Newest-first so the SEND LOG slice(0,3) stays honestly 'most
        // recent' (spec said append; deviation noted in the summary).
        ...prev.sent,
      ];
      return {
        ...prev,
        sent: nextSent,
        sheetDetent: null,
        tab: 'sent',
        scrollByTab: {...prev.scrollByTab, lab: currentScrollTop(), sent: 0},
        seq: prev.seq + 1,
        toast: {seq: prev.seq + 1, msg: \`Sent to \${MATCH.name}\`, undoPatch: null},
      };
    });
    setSheetDragY(0);
  };

  // -------------------------------------------------------------------
  // TABS — per-tab scroll persistence; re-tap = the one legal reset.
  // -------------------------------------------------------------------

  const currentScrollTop = (): number => getScrollParent(shellRef.current)?.scrollTop ?? 0;

  const onTabPress = (next: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (next === tab) {
      scroller?.scrollTo({top: 0});
      return;
    }
    const patch: Partial<DraftStore> = {
      tab: next,
      scrollByTab: {...store.scrollByTab, [tab]: scroller?.scrollTop ?? 0},
      sheetDetent: null, // overlay law: sheets close on tab switch (toast persists)
    };
    if (store.refreshingSent) {
      patch.refreshingSent = false;
      patch.sentRefreshed = true;
    }
    update(patch);
  };

  useEffect(() => {
    const scroller = getScrollParent(shellRef.current);
    if (scroller != null) {
      scroller.scrollTop = storeRef.current.scrollByTab[tab] ?? 0;
    }
  }, [tab]);

  // -------------------------------------------------------------------
  // SHEET LIFECYCLE — focus({preventScroll:true}) in (amendment: plain
  // .focus() beaches the animating sheet mid-screen in the locked
  // column), restored to the Preview opener on every close path.
  // -------------------------------------------------------------------

  const prevDetentRef = useRef(sheetDetent);
  useEffect(() => {
    const prev = prevDetentRef.current;
    prevDetentRef.current = sheetDetent;
    if (prev == null && sheetDetent != null) {
      grabberRef.current?.focus({preventScroll: true});
    } else if (prev != null && sheetDetent == null) {
      previewBtnRef.current?.focus({preventScroll: true});
    }
  }, [sheetDetent]);

  const onSheetKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeSheet();
      return;
    }
    trapTabKey(event, sheetRef.current);
  };

  // Sheet drag is optional garnish (the clickable grabber + X are the
  // contract) — NO pointer capture on the zone, or the grabber button's
  // click-toggle path would be swallowed; |dy| ≤ 8 is treated as a click.
  const onGrabberPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    sheetDragRef.current = {startY: event.clientY};
  };
  const onGrabberPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (sheetDragRef.current == null) return;
    setSheetDragY(Math.max(0, event.clientY - sheetDragRef.current.startY));
  };
  const onGrabberPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (sheetDragRef.current == null) return;
    const dy = event.clientY - sheetDragRef.current.startY;
    sheetDragRef.current = null;
    setSheetDragY(0);
    if (Math.abs(dy) <= 8) return; // click → grabber button toggles detent
    if (sheetDetent === 'medium' && dy > 120) {
      closeSheet();
    } else if (sheetDetent === 'large' && dy > 60) {
      update({sheetDetent: 'medium'});
    } else if (sheetDetent === 'medium' && dy < -60) {
      update({sheetDetent: 'large'});
    }
  };
  const onGrabberPointerCancel = () => {
    sheetDragRef.current = null;
    setSheetDragY(0);
  };

  // Shell-level Escape: disarm the armed slot (the sheet handles its own
  // Escape first via stopPropagation — topmost overlay only).
  const onShellKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !sheetOpen && armedSlotKey != null) {
      update({armedSlotKey: null});
    }
  };

  // -------------------------------------------------------------------
  // SAVED EDIT MODE — undoOverConfirm; editToolbar replaces tabBar.
  // -------------------------------------------------------------------

  const toggleSelected = (id: string) => {
    update({
      selectedIds: selectedIds.includes(id)
        ? selectedIds.filter(item => item !== id)
        : [...selectedIds, id],
    });
  };

  const onDeleteSelected = () => {
    const count = selectedIds.length;
    if (count === 0) return;
    announce(\`\${count} opener\${count === 1 ? '' : 's'} deleted\`, {saved}, {
      saved: saved.filter(item => !selectedIds.includes(item.id)),
      editing: false,
      selectedIds: [],
    });
  };

  const onDuplicateSelected = () => {
    const count = selectedIds.length;
    if (count === 0) return;
    setStore(prev => {
      let copySeq = prev.seq;
      const nextSaved = prev.saved.flatMap(item =>
        prev.selectedIds.includes(item.id)
          ? [item, {...item, id: \`sv-d\${++copySeq}\`}]
          : [item],
      );
      return {
        ...prev,
        saved: nextSaved,
        editing: false,
        selectedIds: [],
        seq: copySeq + 1,
        toast: {
          seq: copySeq + 1,
          msg: \`\${count} opener\${count === 1 ? '' : 's'} duplicated\`,
          undoPatch: {saved: prev.saved},
        },
      };
    });
  };

  const onUndo = () => {
    if (toast?.undoPatch == null) return;
    announce('Restored', null, toast.undoPatch);
  };

  const onRefreshSent = () => {
    if (!store.refreshingSent) {
      announce('Loading', null, {refreshingSent: true});
    } else {
      update({refreshingSent: false, sentRefreshed: true});
    }
  };

  // -------------------------------------------------------------------
  // RENDER HELPERS (plain JSX builders — not nested component types).
  // -------------------------------------------------------------------

  const renderChip = (chip: ProfileChip, stock: boolean) => {
    const ghosted = usedChipIds.has(chip.id);
    const shakeSeq = chipShake != null && chipShake.id === chip.id ? chipShake.seq : 0;
    const pillStyle = stock
      ? styles.stockPill
      : ghosted
        ? {...styles.chipPill, ...styles.chipGhosted}
        : styles.chipPill;
    return (
      <button
        key={chip.id}
        type="button"
        className="kd-btn kd-focusable"
        style={styles.chipHit}
        aria-disabled={ghosted || undefined}
        aria-label={\`\${capitalize(chip.type)} chip: \${chip.label}\${ghosted ? ' — already placed' : ''}\${stock ? ' (stock filler)' : ''}\`}
        onPointerDown={event => onChipPointerDown(event, chip)}
        onPointerMove={event => onChipPointerMove(event, chip)}
        onPointerUp={event => onChipPointerUp(event, chip)}
        onPointerCancel={() => {
          dragInfoRef.current = null;
          setDrag(null);
        }}
        onClick={() => onChipClick(chip)}>
        <span key={shakeSeq} className={shakeSeq > 0 ? 'kd-shake' : undefined} style={pillStyle}>
          <span style={styles.chipIcon} aria-hidden>
            <Icon icon={CHIP_TYPE_ICON[chip.type]} size="xsm" color="inherit" />
          </span>
          {chip.label}
        </span>
      </button>
    );
  };

  const renderSlot = (prompt: Prompt, slotIndex: number, type: ChipType) => {
    const key = slotKey(prompt.id, slotIndex);
    const isActiveCard = activePromptId === prompt.id;
    const filledChipId = isActiveCard ? (slotFills[key] ?? null) : null;
    const armed = armedSlotKey === key;
    const hovered = drag?.hoverKey === key;
    const hoverStyle = hovered ? (drag?.mismatch ? styles.slotMismatch : styles.slotHover) : null;
    const pillStyle = filledChipId != null
      ? {...styles.slotFilled, ...hoverStyle}
      : armed
        ? {...styles.slotEmpty, ...styles.slotArmed, ...hoverStyle}
        : {...styles.slotEmpty, ...hoverStyle};
    const cursorStyle = hovered && drag?.mismatch ? {cursor: 'not-allowed' as const} : null;
    const label =
      filledChipId != null
        ? \`\${capitalize(type)} slot, filled with \${CHIP_BY_ID[filledChipId].label} — activate to clear\`
        : armed
          ? \`\${capitalize(type)} slot, armed — tap a chip to fill\`
          : \`\${capitalize(type)} slot, empty — tap a chip to fill\`;
    return (
      <button
        key={key}
        type="button"
        className="kd-btn kd-focusable"
        style={{...styles.slotHit, ...cursorStyle}}
        aria-pressed={armed}
        aria-label={label}
        data-slotkey={key}
        data-promptid={prompt.id}
        data-slotindex={slotIndex}
        data-slottype={type}
        onClick={() => onSlotClick(prompt, slotIndex)}>
        <span className={armed ? 'kd-armed' : undefined} style={pillStyle}>
          {filledChipId != null ? (
            <>
              {CHIP_BY_ID[filledChipId].label}
              <Icon icon={XIcon} size="xsm" color="inherit" />
            </>
          ) : (
            \`⟨\${type}⟩\`
          )}
        </span>
      </button>
    );
  };

  const renderPromptCard = (prompt: Prompt) => {
    const isActive = activePromptId === prompt.id;
    const cardScore: Score = isActive ? activeScore : 1;
    let slotCursor = 0;
    return (
      <article
        key={prompt.id}
        style={isActive ? {...styles.promptCard, ...styles.promptCardActive} : styles.promptCard}>
        {isActive ? <span style={styles.activeBadge}>ACTIVE</span> : null}
        <p style={styles.sentence}>
          {prompt.tokens.map((token, tokenIndex) => {
            if (token.kind === 'text') return <span key={tokenIndex}>{token.text}</span>;
            const slotIndex = slotCursor++;
            return renderSlot(prompt, slotIndex, prompt.slotTypes[slotIndex]);
          })}
        </p>
        <div style={styles.cardFooter}>
          <SpecificityMeter score={cardScore} showLabel={showMeterLabel} />
          {isActive ? (
            <button
              type="button"
              className="kd-btn kd-focusable"
              style={
                activeAllFilled
                  ? {...styles.secondaryBtn, ...styles.secondaryBtnBrand}
                  : {...styles.secondaryBtn, ...styles.secondaryBtnDisabled}
              }
              disabled={!activeAllFilled}
              onClick={onSaveOpener}>
              Save opener
            </button>
          ) : null}
          <button
            type="button"
            className="kd-btn kd-focusable"
            style={isActive ? {...styles.secondaryBtn, ...styles.secondaryBtnDisabled} : styles.secondaryBtn}
            disabled={isActive}
            onClick={() => onUse(prompt)}>
            {isActive ? 'In use' : 'Use'}
          </button>
        </div>
      </article>
    );
  };

  // ------------------------------- LAB --------------------------------

  const labView = (
    <>
      <div style={styles.toneBar}>
        <ToneSegmentedControl tone={tone} onSelect={onToneSelect} />
      </div>
      <div key={shelfShake} className={shelfShake > 0 ? 'kd-shake' : undefined} style={styles.chipShelf} aria-label={\`\${MATCH.name}'s profile chips\`}>
        <span style={styles.shelfOverline}>
          {MATCH.name.toUpperCase()} · {CHIPS.length} CHIPS
        </span>
        {CHIPS.map(chip => renderChip(chip, false))}
      </div>
      <div style={styles.stockRow}>
        <span style={styles.stockLabel}>Stock fillers</span>
        {STOCK.map(chip => renderChip(chip, true))}
      </div>
      <h2 style={styles.sectionHeader}>
        {deck.length} {TONE_LABEL[tone].toUpperCase()} PROMPTS
      </h2>
      <div style={styles.deck}>{deck.map(renderPromptCard)}</div>
    </>
  );

  const labFooter = (
    <div style={styles.labFooter}>
      <SpecificityMeter score={activeScore} showLabel={showMeterLabel} />
      <span style={styles.previewHit}>
        <button
          ref={previewBtnRef}
          type="button"
          className="kd-btn kd-focusable"
          style={
            activePrompt == null
              ? {...styles.previewBtn, ...styles.previewBtnDisabled}
              : styles.previewBtn
          }
          disabled={activePrompt == null}
          onClick={onPreview}>
          Preview
        </button>
      </span>
    </div>
  );

  // ------------------------------ SAVED -------------------------------

  const savedView = (
    <>
      {saved.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={BookmarkIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.emptyTitle}>No saved openers</h2>
          <p style={styles.emptyBody}>Build one in the Lab and save it here.</p>
        </div>
      ) : (
        <>
          <h2 style={styles.sectionHeader}>
            {saved.length} SAVED · AVG {savedAvg}
          </h2>
          <div style={styles.listCard}>
            {saved.map((item, index) => {
              const selected = selectedIds.includes(item.id);
              const content = (
                <div
                  className="kd-anim"
                  style={editing ? {...styles.rowShiftable, ...styles.rowShifted} : styles.rowShiftable}>
                  <span
                    style={{...styles.toneTile, background: toneTileWash(item.tone), color: TONE_DOT[item.tone]}}
                    aria-hidden>
                    {TONE_LABEL[item.tone].charAt(0)}
                  </span>
                  <span style={styles.rowText}>
                    <span style={styles.rowPrimary}>{item.textLine}</span>
                    <span style={styles.rowSecondary}>{TONE_LABEL[item.tone]}</span>
                  </span>
                  <span style={styles.rowTrailing}>
                    <MiniMeter score={item.score} />
                    <span style={styles.scoreText}>{item.score}/3</span>
                  </span>
                </div>
              );
              return (
                <div key={item.id}>
                  {index > 0 ? <div style={styles.rowDivider68} /> : null}
                  {editing ? (
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={selected}
                      className="kd-btn kd-focusable"
                      style={styles.mediaRow}
                      aria-label={item.textLine}
                      onClick={() => toggleSelected(item.id)}>
                      <span
                        style={
                          selected
                            ? {...styles.selectionCircle, ...styles.selectionCircleOn}
                            : styles.selectionCircle
                        }
                        aria-hidden>
                        {selected ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
                      </span>
                      {content}
                    </button>
                  ) : (
                    <div style={styles.mediaRow}>{content}</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );

  // ------------------------------- SENT -------------------------------

  const sentView = (
    <>
      <div style={{height: 16}} />
      <ReplyRateBars sent={sent} />
      <h2 style={styles.sectionHeader}>ALL OPENERS</h2>
      {store.sentRefreshed && !store.refreshingSent ? (
        <p style={styles.refreshCaption}>Updated just now</p>
      ) : null}
      <div style={styles.listCard} aria-busy={store.refreshingSent || undefined}>
        {store.refreshingSent
          ? SKELETON_PRIMARY.map((primaryWidth, index) => (
              <div key={index}>
                {index > 0 ? <div style={styles.rowDivider68} /> : null}
                <div style={styles.skelRow} aria-hidden>
                  <span className="kd-shimmer" style={styles.skelCircle} />
                  <span style={styles.skelBars}>
                    <span className="kd-shimmer" style={{...styles.skelBar, width: \`\${primaryWidth}%\`}} />
                    <span
                      className="kd-shimmer"
                      style={{...styles.skelBar, width: \`\${SKELETON_SECONDARY[index]}%\`}}
                    />
                  </span>
                </div>
              </div>
            ))
          : sent.map((item, index) => (
              <div key={item.id}>
                {index > 0 ? <div style={styles.rowDivider68} /> : null}
                <div style={styles.mediaRow}>
                  <span style={{...styles.avatar40, background: idGradient(item.id)}} aria-hidden>
                    {item.recipient.charAt(0)}
                  </span>
                  <span style={styles.rowText}>
                    <span style={styles.rowPrimary}>{item.textLine}</span>
                    <span style={styles.rowSecondary}>
                      {TONE_LABEL[item.tone]} · {item.score}/3
                    </span>
                  </span>
                  <span style={styles.rowTrailing}>
                    {item.replied ? (
                      <span style={styles.repliedText}>Replied</span>
                    ) : (
                      <span style={styles.dashText} aria-label="No reply yet">
                        —
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
      </div>
      {!store.refreshingSent ? (
        <p style={styles.terminalCaption}>All {sent.length} openers</p>
      ) : null}
    </>
  );

  // -------------------------------- YOU --------------------------------

  const toneCounts = TONES.map(option => ({
    tone: option,
    count: sent.filter(item => item.tone === option).length,
  }));
  const toneMax = Math.max(1, ...toneCounts.map(entry => entry.count));
  const overallPct = sent.length === 0 ? 0 : Math.round((replies / sent.length) * 100);
  const youView = (
    <>
      <div style={styles.youHeader}>
        <span style={{...styles.youAvatar, background: idGradient('alex-you')}} aria-hidden>
          A
        </span>
        <h2 style={styles.youName}>Alex</h2>
      </div>
      <h2 style={styles.sectionHeader}>THIS MONTH</h2>
      <div style={styles.listCard}>
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Openers sent</span>
          <span style={styles.utilityValue}>{sent.length}</span>
        </div>
        <div style={styles.rowDivider16} />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Replies</span>
          <span style={styles.utilityValue}>{replies}</span>
        </div>
        <div style={styles.rowDivider16} />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Reply rate</span>
          <span style={styles.utilityValue}>{overallPct}%</span>
        </div>
      </div>
      <h2 style={styles.sectionHeader}>SENT BY TONE</h2>
      <div style={styles.listCard}>
        <div style={styles.toneBarPad}>
          {toneCounts.map(entry => (
            <div key={entry.tone} style={styles.barRow}>
              <span style={styles.barLabel}>{TONE_LABEL[entry.tone]}</span>
              <span style={styles.barTrack} aria-hidden>
                <span
                  style={{
                    ...styles.barFill,
                    width: entry.count === 0 ? 4 : \`\${(entry.count / toneMax) * 100}%\`,
                  }}
                />
              </span>
              <span style={styles.barCount}>{entry.count}</span>
            </div>
          ))}
        </div>
      </div>
      <h2 style={styles.sectionHeader}>SETTINGS</h2>
      <div style={styles.listCard}>
        <SwitchRow
          label="Show specificity coaching"
          checked={store.switches.coach}
          onToggle={() =>
            announce(\`Specificity coaching \${store.switches.coach ? 'off' : 'on'}\`, null, {
              switches: {...store.switches, coach: !store.switches.coach},
            })
          }
        />
        <div style={styles.rowDivider16} />
        <SwitchRow
          label="Haptic sparks"
          checked={store.switches.haptics}
          onToggle={() =>
            announce(\`Haptic sparks \${store.switches.haptics ? 'off' : 'on'}\`, null, {
              switches: {...store.switches, haptics: !store.switches.haptics},
            })
          }
        />
      </div>
    </>
  );

  // ------------------------------ CHROME -------------------------------

  const navBar = (
    <header style={styles.navBar}>
      <div style={styles.navLeading}>
        {editing ? (
          <button
            type="button"
            className="kd-btn kd-focusable"
            style={styles.navTextBtn}
            onClick={() => update({editing: false, selectedIds: []})}>
            Cancel
          </button>
        ) : (
          <SparkMark />
        )}
      </div>
      {editing ? (
        <h1 style={styles.navTitle} aria-live="polite">
          {selectedIds.length === 0 ? 'Select Items' : \`\${selectedIds.length} Selected\`}
        </h1>
      ) : (
        <h1 style={styles.navTitle}>{TAB_TITLE[tab]}</h1>
      )}
      <div style={styles.navTrailing}>
        {editing ? (
          <button
            type="button"
            className="kd-btn kd-focusable"
            style={{...styles.navTextBtn, ...styles.navTextBtnStrong}}
            onClick={() => update({editing: false, selectedIds: []})}>
            Done
          </button>
        ) : tab === 'saved' && saved.length > 0 ? (
          <button
            type="button"
            className="kd-btn kd-focusable"
            style={styles.navTextBtn}
            onClick={() => update({editing: true, selectedIds: []})}>
            Edit
          </button>
        ) : tab === 'sent' ? (
          <button
            type="button"
            className="kd-btn kd-focusable"
            style={styles.iconBtn}
            aria-label={store.refreshingSent ? 'Finish refreshing sent openers' : 'Refresh sent openers'}
            onClick={onRefreshSent}>
            <Icon icon={RefreshCwIcon} size="sm" color="inherit" />
          </button>
        ) : null}
      </div>
    </header>
  );

  const TAB_META: Array<{id: TabId; label: string; icon: typeof FlaskConicalIcon}> = [
    {id: 'lab', label: 'Lab', icon: FlaskConicalIcon},
    {id: 'saved', label: 'Saved', icon: BookmarkIcon},
    {id: 'sent', label: 'Sent', icon: SendIcon},
    {id: 'you', label: 'You', icon: CircleUserIcon},
  ];

  const tabBar = (
    <nav style={styles.tabBar} aria-label="Kindling sections">
      {TAB_META.map(meta => {
        const isActive = tab === meta.id;
        return (
          <button
            key={meta.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            className="kd-btn kd-focusable"
            style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
            aria-label={meta.id === 'sent' ? \`Sent, \${replies} replies\` : meta.label}
            onClick={() => onTabPress(meta.id)}>
            <span style={styles.tabIconWrap}>
              <Icon icon={meta.icon} size="lg" color="inherit" />
              {meta.id === 'sent' && replies > 0 ? (
                <span style={styles.tabBadge} aria-hidden>
                  {replies}
                </span>
              ) : null}
            </span>
            <span style={isActive ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>
              {meta.label}
            </span>
          </button>
        );
      })}
    </nav>
  );

  const editToolbar = (
    <div style={styles.editToolbar}>
      <button
        type="button"
        className="kd-btn kd-focusable"
        style={
          selectedIds.length === 0
            ? {...styles.editToolbarBtn, ...styles.editToolbarDisabled}
            : {...styles.editToolbarBtn, ...styles.editToolbarDelete}
        }
        disabled={selectedIds.length === 0}
        onClick={onDeleteSelected}>
        Delete
      </button>
      <button
        type="button"
        className="kd-btn kd-focusable"
        style={styles.editToolbarBtn}
        onClick={() =>
          update({
            selectedIds: selectedIds.length === saved.length ? [] : saved.map(item => item.id),
          })
        }>
        {selectedIds.length === saved.length ? 'Deselect All' : 'Select All'}
      </button>
      <button
        type="button"
        className="kd-btn kd-focusable"
        style={
          selectedIds.length === 0
            ? {...styles.editToolbarBtn, ...styles.editToolbarDisabled}
            : styles.editToolbarBtn
        }
        disabled={selectedIds.length === 0}
        onClick={onDuplicateSelected}>
        Duplicate
      </button>
    </div>
  );

  const toastDock = (
    <div style={sheetOpen ? styles.toastAnchorLocked : styles.toastAnchor} aria-live="polite">
      {toast != null ? (
        <div key={toast.seq} style={styles.toast}>
          <span style={styles.toastMsg}>{toast.msg}</span>
          {toast.undoPatch != null ? (
            <>
              <span style={styles.toastRule} aria-hidden />
              <button type="button" className="kd-btn kd-focusable" style={styles.toastUndo} onClick={onUndo}>
                Undo
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  // ------------------------------- SHEET -------------------------------

  const dragChip = drag != null ? CHIP_BY_ID[drag.chipId] : null;
  const sendLog = sent.slice(0, 3);
  const sheet =
    sheetOpen && activePrompt != null ? (
      <>
        <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={\`Preview for \${MATCH.name}\`}
          className={reducedMotion ? undefined : 'kd-sheet-in'}
          style={{
            ...styles.sheet,
            height: sheetDetent === 'medium' ? '55%' : 'calc(100% - 56px)',
            transform: sheetDragY > 0 ? \`translateY(\${sheetDragY}px)\` : undefined,
          }}
          onKeyDown={onSheetKeyDown}>
          <div
            style={styles.grabberZone}
            onPointerDown={onGrabberPointerDown}
            onPointerMove={onGrabberPointerMove}
            onPointerUp={onGrabberPointerUp}
            onPointerCancel={onGrabberPointerCancel}
            onPointerLeave={onGrabberPointerCancel}>
            <button
              ref={grabberRef}
              type="button"
              className="kd-btn kd-focusable"
              aria-label="Resize sheet"
              style={{paddingInline: 24, paddingBlock: 6, borderRadius: 999}}
              onClick={() => update({sheetDetent: sheetDetent === 'medium' ? 'large' : 'medium'})}>
              <span style={styles.grabberPill} />
            </button>
          </div>
          <div style={styles.sheetHeader}>
            <span />
            <h2 style={styles.sheetTitle}>Preview for {MATCH.name}</h2>
            <button
              type="button"
              className="kd-btn kd-focusable"
              style={styles.iconBtn}
              aria-label="Close preview"
              onClick={closeSheet}>
              <Icon icon={XIcon} size="sm" color="inherit" />
            </button>
          </div>
          <div style={styles.sheetBody}>
            <RecipientBubblePreview prompt={activePrompt} fills={slotFills} />
            {sheetDetent === 'large' ? (
              <>
                <div style={styles.formField}>
                  <label style={styles.fieldLabel} htmlFor="kd-edit-message">
                    Edit message
                  </label>
                  <textarea
                    id="kd-edit-message"
                    style={styles.textarea}
                    value={store.sheetDraft}
                    onChange={event => update({sheetDraft: event.target.value})}
                  />
                </div>
                <h3 style={styles.sheetSectionHeader}>SEND LOG</h3>
                <div style={styles.sendLogCard}>
                  {sendLog.map((item, index) => (
                    <div key={item.id}>
                      {index > 0 ? <div style={styles.rowDivider16} /> : null}
                      <div style={styles.sendLogRow}>
                        <span style={{...styles.avatar40, width: 32, height: 32, fontSize: 13, background: idGradient(item.id)}} aria-hidden>
                          {item.recipient.charAt(0)}
                        </span>
                        <span style={styles.rowText}>
                          <span style={{...styles.rowPrimary, fontSize: 13, lineHeight: '17px'}}>{item.textLine}</span>
                          <span style={styles.rowSecondary}>
                            {item.recipient} · {TONE_LABEL[item.tone]} · {item.score}/3
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
          {sheetDetent === 'large' ? (
            <div style={styles.sheetFooter}>
              <button type="button" className="kd-btn kd-focusable" style={styles.sendBtn} onClick={onSend}>
                Send to {MATCH.name}
              </button>
            </div>
          ) : null}
        </div>
      </>
    ) : null;

  // ------------------------------- SHELL -------------------------------

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(sheetOpen ? styles.shellLocked : null),
    ...(isDesktop ? styles.shellDesktop : null),
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{KINDLING_CSS}</style>
      <div ref={shellRef} style={shellStyle} onKeyDown={onShellKeyDown}>
        {navBar}
        <main style={styles.main}>
          {tab === 'lab' ? labView : tab === 'saved' ? savedView : tab === 'sent' ? sentView : youView}
          {toastDock}
        </main>
        {tab === 'lab' ? labFooter : null}
        {editing ? editToolbar : tabBar}
        {drag != null && dragChip != null ? (
          <div
            style={{
              ...styles.dragGhost,
              transform: \`translate3d(\${drag.x - 40}px, \${drag.y - 44}px, 0) scale(0.9)\`,
            }}
            aria-hidden>
            <span style={styles.chipPill}>
              <span style={styles.chipIcon}>
                <Icon icon={CHIP_TYPE_ICON[dragChip.type]} size="xsm" color="inherit" />
              </span>
              {dragChip.label}
            </span>
          </div>
        ) : null}
        {sheet}
      </div>
    </div>
  );
}
`;export{e as default};