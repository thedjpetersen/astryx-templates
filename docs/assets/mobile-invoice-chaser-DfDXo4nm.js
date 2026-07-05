var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — nine Duesday invoices with dual
 *   fields (amountCents + amountLabel, day counts + prebuilt meta strings):
 *   OVERDUE 4 — inv-01 Meridian Print Co $4,250.00 · 34d · rung 2, inv-02
 *   Kessler & Voss LLP $1,875.00 · 21d · rung 1, inv-03 Bluestem Cafe
 *   $920.00 · 12d · rung 1, inv-04 Orchard Lane Events & Catering
 *   Collective $640.00 · 5d · rung 0 (sum 4,250+1,875+920+640 = $7,685.00);
 *   DUE SOON 3 — inv-05 Halvorsen Design $3,100.00 in 3d, inv-06 Pine &
 *   Porter $1,450.00 in 6d, inv-07 Cortado Labs $2,300.00 in 9d (sum
 *   3,100+1,450+2,300 = $6,850.00); PROMISED 2 — inv-08 Tandem Fitness
 *   $1,679.75 (3 chips), inv-09 Ruby Street Florals $785.25 (2 chips)
 *   (sum 1,679.75+785.25 = $2,465.00). TOTAL OUTSTANDING 7,685 + 6,850 +
 *   2,465 = $17,000.00 — always derived by .reduce in render, never
 *   hardcoded twice. Five fixed activity entries with frozen date strings.
 *   No Date.now(), no Math.random(), no network media.
 * @output Duesday — Invoice Chaser: a 390px MOBILE aging-triage surface.
 *   NavBar (torn-invoice brand mark · 'Duesday' · RefreshCw) over a 72px
 *   TOTAL OUTSTANDING header ($17,000.00 derived), a 3-segment
 *   Overdue/Due soon/Promised radiogroup with derived counts, aging-sorted
 *   88px invoice rows (40px gradient-monogram agingBadge with an
 *   escalating aging arc, ladderStepper nudge notches, tabular amounts,
 *   44×44 ellipsis), 116px Promised rows with a 28px promise-chip rail,
 *   and a 3-tab bar (Chase/Activity/Settings, derived Activity badge).
 *   Signature move: ellipsis → action sheet → two-detent chase-composer
 *   sheet prefilled from the rung-keyed template; Send advances the nudge
 *   ladder, stamps 'nudged today', cools and re-sorts the row downward
 *   (FLIP settle, instant under reduced motion), appends an activity
 *   entry, badges the Activity tab, and offers snapshot-exact Undo from
 *   the single sticky toast dock. Swipe left −72px reveals a brand
 *   'Promise' block (same Log-promise mutation as the mandatory ellipsis
 *   path); Mark paid drops the derived total live ($17,000.00 →
 *   $12,750.00 for inv-01) with Undo restoring exact position.
 * @position Page template; emitted by \`astryx template mobile-invoice-chaser\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, composer sheet, action
 *   sheet) are position:'absolute' INSIDE shell; position:fixed is banned.
 *   While a sheet or action sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The toast dock is
 *   sticky-in-flow (bottom:76, above the 64px tabBar + 12px) — NOT
 *   shell-absolute — so it rides the viewport on tall scrolling views.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 68 for the 40px-avatar rows); the
 *   Activity tab is the sanctioned full-bleed list (60px rows, full-width
 *   dividers, no card). No desktop frames, asides, or tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Duesday indigo — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule). The
 *   sanctioned non-brand literals are the three aging-arc escalation
 *   pairs, the monogram gradient stops, and NEUTRAL_REST — a ≥3:1
 *   rest-state pair for the due-soon arc, empty ladder notches, and the
 *   OFF switch-track boundary per the mobile amendment (hairline/muted
 *   tokens are for passive separators only; meaningful rest fills and
 *   interactive boundaries carry their own contrast math, commented at
 *   each declaration).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', always-on hairline — the
 *   scroll-under variant is not wired; compact 'Duesday' title always
 *   visible, no large-title collapse); outstandingHeader 72px in-flow
 *   block (11px/600 overline + 28px/700 tabular total) that scrolls away;
 *   segmentedControl 36px track in a 52px block; invoice rows 88px (40px
 *   agingBadge · 16px/500 + 13px/400 two-line stack · trailing 16px/600
 *   tabular amount over a 44px ladderStepper · 44×44 ellipsis); Promised
 *   rows 116px = 88px anatomy + 28px chip rail (24px chips, 8px gaps);
 *   rowDivider inset 68; sectionHeader 13px/600 uppercase 0.06em at 32px,
 *   20px top / 8px bottom; tabBar 64px sticky bottom z20 (24px icon over
 *   11px/500 label, 16px-min badge pill 10px/600 at top:-4 right:-8);
 *   toast dock sticky bottom 76 z30, toast min-height 48px; sheet detents
 *   55% medium / calc(100% − 56px) large, 24px grabber zone with 36×5
 *   pill, 52px sheet header, sticky 48px Send footer; actionSheet
 *   insetInline 16 bottom 16, 56px rows. TYPE (Figtree via
 *   --font-family-body): 28/700 total · 22/700 · 17/600 nav+sheet titles ·
 *   16/400–600 body floor · 13/400 meta · 11/500 labels; 10px/600 tab
 *   badge is the chrome-spec exception; tabular-nums on every amount,
 *   count, and day figure. Touch: every target ≥44×44 with ≥8px clearance
 *   or merged full-row; every gesture has a visible button path (44×44
 *   ellipsis per swipe row, clickable grabber + X on the sheet).
 *
 * Responsive contract:
 * - Fluid 320–430px: client names ellipsize on one line (minWidth 0 +
 *   flex 1 on the two-line stack — inv-04's 40-char name is the stress);
 *   the amount column is fixed-content width, right-aligned tabular-nums,
 *   and the ellipsis button never shrinks (flexShrink 0); 88px row height
 *   holds. promiseChipRail scrolls horizontally, never wraps. Toast text
 *   ellipsizes before the Undo button shrinks. overflowX:'clip' on shell
 *   is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell becomes
 *   a centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the triage-list anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  BanknoteIcon,
  HandCoinsIcon,
  HandshakeIcon,
  HistoryIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SendIcon,
  SettingsIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math at the declaration.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Duesday indigo). #4053E0 on #FFFFFF ≈
// 5.9:1 (recomputed; spec quoted 6.9 — either way clears 4.5:1). #96A3FF on
// the dark card (~#1C1C1E) ≈ 7.3:1.
const BRAND_ACCENT = 'light-dark(#4053E0, #96A3FF)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #4053E0 ≈ 5.9:1. Dark:
// white on #96A3FF fails (~2.3:1), so the dark side flips to near-black
// indigo — #10163A on #96A3FF ≈ 7.2:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #10163A)';
// 12% brand wash for the brand mark tile.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Aging-arc escalation pairs — non-text arcs need ≥3:1 vs the CARD surface
// (light #FFFFFF / dark ~#1C1C1E); each also clears 4.5:1 where reused as
// 11px ladder text would be (they are not — labels stay in text tokens).
// 1–14d amber: #B45309 on #FFFFFF ≈ 4.6:1; #FBBF24 on #1C1C1E ≈ 9.9:1.
const ESC_FRIENDLY = 'light-dark(#B45309, #FBBF24)';
// 15–30d orange: #C2410C on #FFFFFF ≈ 4.9:1; #FB923C on #1C1C1E ≈ 7.8:1.
const ESC_FIRM = 'light-dark(#C2410C, #FB923C)';
// 31+d red: #B91C1C on #FFFFFF ≈ 6.3:1; #F87171 on #1C1C1E ≈ 6.3:1.
const ESC_FINAL = 'light-dark(#B91C1C, #F87171)';
// NEUTRAL_REST — meaningful rest-state ink per the mobile amendment
// (hairline/muted tokens are passive-separator-only): the due-soon aging
// arc, EMPTY ladder-notch boundaries, and the OFF switch-track boundary.
// #6B7280 on #FFFFFF ≈ 4.8:1; #9AA1AC on #1C1C1E ≈ 6.6:1 — both ≥3:1 vs
// their actual card surface. (Deviation from the spec's --color-border for
// the due-soon arc / empty notches, per the binding amendment.)
const NEUTRAL_REST = 'light-dark(#6B7280, #9AA1AC)';
// agingBadge monogram gradient stops — 14px/700 #FFFFFF initials sit on
// this gradient, so BOTH stops stay dark in BOTH schemes: white on #3646C4
// ≈ 7.0:1, on #4C5AD6 ≈ 5.6:1, on #475569 ≈ 7.5:1, on #52607A ≈ 6.5:1 —
// all ≥4.5:1.
const MONO_STOP_A = 'light-dark(#3646C4, #4C5AD6)';
const MONO_STOP_B = 'light-dark(#475569, #52607A)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden
// heading, skeleton pulse, sheet entrance; transitions animate
// transform/opacity only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const DUESDAY_CSS = \`
.dd-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.dd-btn:disabled { cursor: default; }
.dd-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.dd-anim { transition: transform 240ms ease, opacity 240ms ease; }
.dd-input:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px \${BRAND_ACCENT};
}
.dd-fade { transition: opacity 240ms ease; }
@keyframes dd-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.dd-sheet-in { animation: dd-sheet-in 240ms ease; }
@keyframes dd-skel-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
.dd-skel { animation: dd-skel-pulse 1.6s ease-in-out infinite; }
.dd-vh {
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
  .dd-anim, .dd-fade { transition: none; }
  .dd-sheet-in { animation: none; }
  .dd-skel { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries alone
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
  // Scroll lock while a sheet / action sheet is open — absolute overlays
  // anchor to the visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 icon buttons
  // optically align content to the 16px gutter. ALWAYS-ON hairline + blur
  // (the scroll-under variant is not wired; noted per contract).
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
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  brandMark: {
    width: 32,
    height: 32,
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
    borderRadius: 10,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // OUTSTANDING HEADER — 72px in-flow block, scrolls away under the sticky
  // navBar; total is DERIVED (.reduce over invoices) at render.
  outstandingHeader: {
    minHeight: 72,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 16,
  },
  overline: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  outstandingTotal: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.15,
    fontVariantNumeric: 'tabular-nums',
  },
  updatedCaption: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // SEGMENTED CONTROL — 36px track in a 52px block (8px block padding).
  segmentedBlock: {paddingBlock: 8, paddingInline: 16},
  segmentedTrack: {
    display: 'flex',
    height: 36,
    padding: 2,
    gap: 2,
    background: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  segment: {
    flex: 1,
    minWidth: 0,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  segmentActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
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
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline;
  // overflow hidden clips the square swipe-reveal block at the corners.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // Avatar-led rows: divider inset 68 (16 pad + 40 badge + 12 gap).
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  rowOuter: {position: 'relative'},
  rowClip: {position: 'relative', overflow: 'hidden'},
  // Swipe-reveal Promise block behind the row — square; the listCard's
  // 12px overflow-hidden radius clips it at card corners. Brand fill:
  // BRAND_FILL_TEXT label ≥5.9:1 light / ≥7.2:1 dark (math at declaration).
  promiseAction: {
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
  // The translating layer — row button + ellipsis, card surface.
  rowSlide: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  rowMain: {display: 'flex', alignItems: 'center'},
  // 88px media row button — 40px agingBadge lead, two-line stack, trailing
  // amount+ladder column. The 44×44 ellipsis is a SIBLING button with ≥8px
  // clearance from the amount column.
  row: {
    flex: 1,
    minWidth: 0,
    height: 88,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  rowStack: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  rowName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  trailingCol: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  ellipsisBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    marginInlineStart: 8,
    marginInlineEnd: 4,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 10,
    color: 'var(--color-text-secondary)',
  },
  agingBadge: {width: 40, height: 40, flexShrink: 0, display: 'grid', placeItems: 'center'},
  // ladderStepper — 44×16 (three 12×4 notches, 4px gaps: 3×12 + 2×4 = 44)
  // + 11px/500 rung label below. Non-interactive (aria-hidden); the rung
  // is named in the row button's accessible name.
  ladderWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  ladderNotches: {display: 'flex', gap: 4},
  ladderNotch: {width: 12, height: 4, borderRadius: 2},
  ladderLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // promiseChipRail — 28px rail, paddingLeft 68 aligns chips to the text
  // edge; one focusable control (tabIndex 0, arrow-key scroll).
  promiseChipRail: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 0,
    paddingInlineStart: 68,
    paddingInlineEnd: 16,
    scrollbarWidth: 'none',
  },
  promiseChip: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // EMPTY STATE — centered block per foundations.
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
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '4px 0 16px',
  },
  emptyBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
  },
  // SKELETON — 88px rows matching the invoice-row geometry exactly;
  // deterministic widths (primary 60/45/70%, secondary 40/55/30%).
  skeletonRow: {
    height: 88,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skelCircle: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
  },
  skelStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // ACTIVITY — full-bleed 60px log rows, full-width dividers, no card.
  activityRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  activityStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  activityTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  activityDetail: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  activityDate: {
    flexShrink: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  activityDividerFull: {height: 1, background: 'var(--color-border)'},
  // SETTINGS — 44px utility rows; the WHOLE row is the switch button.
  utilityRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  utilityLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 51×31 switch — OFF track keeps the muted wash but carries a 1px
  // NEUTRAL_REST boundary (≥3:1 vs the card, math at the declaration) per
  // the interactive-boundary amendment; ON track is the brand fill.
  switchTrack: {
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    position: 'relative',
    border: \`1px solid \${NEUTRAL_REST}\`,
    background: 'light-dark(rgba(21, 17, 12, 0.14), rgba(255, 255, 255, 0.22))',
  },
  switchTrackOn: {background: BRAND_ACCENT, border: \`1px solid \${BRAND_ACCENT}\`},
  switchThumb: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
    transition: 'transform 200ms ease',
  },
  // TAB BAR — 64px sticky bottom z20, 3 tabs.
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
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_ACCENT, fontWeight: 600},
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  // Badge pill — 16px min-width, 10px/600 (the chrome-spec exception to
  // the 11px floor), offset top −4 / right −8 from the 24px icon.
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 10,
    fontWeight: 600,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow (NOT shell-absolute; the shell grows with
  // content, so absolute bottom pins to the DOCUMENT bottom on tall
  // views). Sticky bottom 76 = 64px tabBar + 12px. Always mounted: the
  // single aria-live region. Height 0 so it takes no flow space; the
  // toast hangs above via absolute bottom 0.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    marginInline: 16,
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    insetInline: 0,
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, flexShrink: 0, background: 'var(--color-border)'},
  toastUndoBtn: {
    flexShrink: 0,
    minWidth: 44,
    height: 48,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // SHEETS — scrim z40 + composer sheet z41, absolute inside shell.
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
  sheetGrabber: {
    width: '100%',
    height: 24,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  sheetGrabberPill: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 8,
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
  // Sheet body — the ONE legal inner scroller.
  sheetBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '4px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  recipientRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  recipientValue: {
    fontSize: 16,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  formField: {display: 'flex', flexDirection: 'column', gap: 8},
  fieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  fieldInput: {
    height: 48,
    borderRadius: 12,
    border: 'none',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    background: 'var(--color-background-muted)',
  },
  fieldTextarea: {
    minHeight: 160,
    borderRadius: 12,
    border: 'none',
    padding: '12px 16px',
    fontSize: 16,
    lineHeight: 1.45,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    background: 'var(--color-background-muted)',
    resize: 'vertical',
  },
  // Rung preview strip — shows the ladder advancing on Send.
  previewStrip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
    paddingInline: 16,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  sendBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // ACTION SHEET — insetInline 16 bottom 16 z41; options card + separate
  // Cancel card, 56px centered rows (centered-no-icons variant).
  actionSheet: {
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  actionSheetRowDisabled: {opacity: 0.4},
  actionSheetCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  actionSheetDivider: {height: 1, background: 'var(--color-border)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — IDENTITY CONSTS, dual fields everywhere (amountCents beside
// amountLabel, day counts beside prebuilt strings). Cross-check ledger
// (verified by hand): overdue 425000+187500+92000+64000 = 768500¢ =
// $7,685.00 ✓; due soon 310000+145000+230000 = 685000¢ = $6,850.00 ✓;
// promised 167975+78525 = 246500¢ = $2,465.00 ✓; TOTAL 768500+685000+
// 246500 = 1700000¢ = $17,000.00 ✓ (header derives it via .reduce, never
// hardcoded). Counts 4+3+2 = 9 ✓. Mark-paid inv-01: 1700000−425000 =
// 1275000¢ = $12,750.00 ✓. Mark-paid BOTH promised: 1700000−167975−78525 =
// 1453500¢ = $14,535.00 exactly (spec prose said "$14,534..."; the
// arithmetic law wins — deviation noted).
// ---------------------------------------------------------------------------

type BucketId = 'overdue' | 'duesoon' | 'promised';
type TabId = 'chase' | 'activity' | 'settings';
type Rung = 0 | 1 | 2 | 3;

interface Invoice {
  id: string;
  invoiceNo: string;
  client: string;
  initials: string;
  email: string;
  amountCents: number;
  amountLabel: string;
  terms: string;
  bucket: BucketId;
  daysPastTerms: number; // 0 when not overdue
  daysUntilDue: number; // 0 when not due soon
  rung: Rung; // nudges already sent (0-3)
  nudgedToday: boolean;
  chips: string[]; // promise-history chips (Promised rows only)
}

// inv-04's 40-char client name is the one-line ellipsis stress beside
// $640.00 at 320px. inv-01 pairs the largest amount with the max arc sweep
// (34/45 → 272°) and rung 2 — the loudest row. inv-08/inv-09 carry cents
// against whole-dollar rows to prove tabular-nums alignment; inv-08's rail
// holds 3 chips forcing horizontal scroll with ≥24px peek at 320.
const INVOICES: Invoice[] = [
  {
    id: 'inv-01',
    invoiceNo: 'INV-1041',
    client: 'Meridian Print Co',
    initials: 'MP',
    email: 'accounts@meridianprint.com',
    amountCents: 425000,
    amountLabel: '$4,250.00',
    terms: 'Net 30',
    bucket: 'overdue',
    daysPastTerms: 34,
    daysUntilDue: 0,
    rung: 2,
    nudgedToday: false,
    chips: [],
  },
  {
    id: 'inv-02',
    invoiceNo: 'INV-1046',
    client: 'Kessler & Voss LLP',
    initials: 'KV',
    email: 'ap@kesslervoss.law',
    amountCents: 187500,
    amountLabel: '$1,875.00',
    terms: 'Net 30',
    bucket: 'overdue',
    daysPastTerms: 21,
    daysUntilDue: 0,
    rung: 1,
    nudgedToday: false,
    chips: [],
  },
  {
    id: 'inv-03',
    invoiceNo: 'INV-1052',
    client: 'Bluestem Cafe',
    initials: 'BC',
    email: 'hello@bluestemcafe.com',
    amountCents: 92000,
    amountLabel: '$920.00',
    terms: 'Net 15',
    bucket: 'overdue',
    daysPastTerms: 12,
    daysUntilDue: 0,
    rung: 1,
    nudgedToday: false,
    chips: [],
  },
  {
    id: 'inv-04',
    invoiceNo: 'INV-1057',
    client: 'Orchard Lane Events & Catering Collective',
    initials: 'OL',
    email: 'billing@orchardlane.events',
    amountCents: 64000,
    amountLabel: '$640.00',
    terms: 'Net 15',
    bucket: 'overdue',
    daysPastTerms: 5,
    daysUntilDue: 0,
    rung: 0,
    nudgedToday: false,
    chips: [],
  },
  {
    id: 'inv-05',
    invoiceNo: 'INV-1060',
    client: 'Halvorsen Design',
    initials: 'HD',
    email: 'ap@halvorsen.design',
    amountCents: 310000,
    amountLabel: '$3,100.00',
    terms: 'Net 30',
    bucket: 'duesoon',
    daysPastTerms: 0,
    daysUntilDue: 3,
    rung: 0,
    nudgedToday: false,
    chips: [],
  },
  {
    id: 'inv-06',
    invoiceNo: 'INV-1061',
    client: 'Pine & Porter',
    initials: 'PP',
    email: 'accounts@pineandporter.com',
    amountCents: 145000,
    amountLabel: '$1,450.00',
    terms: 'Net 30',
    bucket: 'duesoon',
    daysPastTerms: 0,
    daysUntilDue: 6,
    rung: 0,
    nudgedToday: false,
    chips: [],
  },
  {
    id: 'inv-07',
    invoiceNo: 'INV-1063',
    client: 'Cortado Labs',
    initials: 'CL',
    email: 'finance@cortadolabs.io',
    amountCents: 230000,
    amountLabel: '$2,300.00',
    terms: 'Net 30',
    bucket: 'duesoon',
    daysPastTerms: 0,
    daysUntilDue: 9,
    rung: 0,
    nudgedToday: false,
    chips: [],
  },
  {
    id: 'inv-08',
    invoiceNo: 'INV-1033',
    client: 'Tandem Fitness',
    initials: 'TF',
    email: 'owner@tandemfit.studio',
    amountCents: 167975,
    amountLabel: '$1,679.75',
    terms: 'Net 30',
    bucket: 'promised',
    daysPastTerms: 0,
    daysUntilDue: 0,
    rung: 1,
    nudgedToday: false,
    chips: ['promised Fri', 'called 6/28', 'emailed 6/24'],
  },
  {
    id: 'inv-09',
    invoiceNo: 'INV-1038',
    client: 'Ruby Street Florals',
    initials: 'RS',
    email: 'ruby@rubystreetflorals.com',
    amountCents: 78525,
    amountLabel: '$785.25',
    terms: 'Net 15',
    bucket: 'promised',
    daysPastTerms: 0,
    daysUntilDue: 0,
    rung: 1,
    nudgedToday: false,
    chips: ['promised Mon', 'emailed 6/24'],
  },
];

interface LogEntry {
  id: string;
  kind: 'nudge' | 'promise' | 'paid';
  title: string;
  detail: string;
  dateLabel: string; // fixed strings only; mutations stamp 'Today'
}

// Activity badge = DERIVED count of entries stamped 'Today' (starts 0,
// becomes 1 after a Send) — computed in render, never stored.
const ACTIVITY_FIXTURES: LogEntry[] = [
  {id: 'act-01', kind: 'nudge', title: 'Sent firm nudge', detail: 'Meridian Print Co', dateLabel: 'Jun 30'},
  {id: 'act-02', kind: 'promise', title: 'Logged promise', detail: 'Tandem Fitness', dateLabel: 'Jun 28'},
  {id: 'act-03', kind: 'nudge', title: 'Sent friendly nudge', detail: 'Kessler & Voss LLP', dateLabel: 'Jun 27'},
  {id: 'act-04', kind: 'paid', title: 'Payment received', detail: 'Alder Supply · $2,140.00', dateLabel: 'Jun 26'},
  {id: 'act-05', kind: 'nudge', title: 'Sent friendly nudge', detail: 'Bluestem Cafe', dateLabel: 'Jun 25'},
];

const RUNG_NAMES = ['friendly', 'firm', 'final'] as const;

const SEGMENTS: Array<{id: BucketId; label: string}> = [
  {id: 'overdue', label: 'Overdue'},
  {id: 'duesoon', label: 'Due soon'},
  {id: 'promised', label: 'Promised'},
];

const TABS: Array<{id: TabId; label: string}> = [
  {id: 'chase', label: 'Chase'},
  {id: 'activity', label: 'Activity'},
  {id: 'settings', label: 'Settings'},
];

const SIGNATURE = 'Dana Whitfield · Foxglove Design Co.';

// DETERMINISTIC chase templates keyed by the rung BEING SENT (rung + 1).
const NUDGE_TEMPLATES: ReadonlyArray<(inv: Invoice) => string> = [
  inv =>
    \`Hi \${inv.client} team,\\n\\nJust a friendly reminder that invoice \${inv.invoiceNo} for \${inv.amountLabel} is past its \${inv.terms} terms. Could you let me know when it's scheduled for payment?\\n\\nThanks so much,\\n\${SIGNATURE}\`,
  inv =>
    \`Hi \${inv.client} team,\\n\\nFollowing up on invoice \${inv.invoiceNo} (\${inv.amountLabel}), now \${inv.daysPastTerms} days past \${inv.terms} terms. Please confirm a payment date this week so we can keep the account in good standing.\\n\\nRegards,\\n\${SIGNATURE}\`,
  inv =>
    \`Hi \${inv.client} team,\\n\\nThis is a final notice for invoice \${inv.invoiceNo} (\${inv.amountLabel}), \${inv.daysPastTerms} days past terms. If payment isn't received within 5 business days, I'll have to pause work and add the late fee provided in our agreement.\\n\\n\${SIGNATURE}\`,
];

function nudgeSubject(inv: Invoice): string {
  const sending = RUNG_NAMES[Math.min(inv.rung, 2)];
  return sending === 'final'
    ? \`Final notice — invoice \${inv.invoiceNo}\`
    : \`Invoice \${inv.invoiceNo} — \${sending} reminder\`;
}

// ---------------------------------------------------------------------------
// FORMATTERS + DERIVATIONS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Cents → '$17,000.00' (manual grouping — no locale dependence). */
function fmtUsd(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rem = String(cents % 100).padStart(2, '0');
  const grouped = String(dollars).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  return \`$\${grouped}.\${rem}\`;
}

function metaFor(inv: Invoice): string {
  if (inv.bucket === 'overdue') {
    const base = \`\${inv.daysPastTerms} days past terms · \${inv.terms}\`;
    return inv.nudgedToday ? \`\${base} · nudged today\` : base;
  }
  if (inv.bucket === 'duesoon') {
    return \`Due in \${inv.daysUntilDue} days · \${inv.terms}\`;
  }
  return \`Payment promised · \${inv.terms}\`;
}

/** Composed accessible row name — name + amount + status, not row soup. */
function rowNameFor(inv: Invoice): string {
  const status =
    inv.bucket === 'overdue'
      ? \`\${inv.daysPastTerms} days past terms\`
      : inv.bucket === 'duesoon'
        ? \`due in \${inv.daysUntilDue} days\`
        : 'payment promised';
  const rungBit = inv.nudgedToday
    ? ', nudged today'
    : inv.rung > 0
      ? \`, \${RUNG_NAMES[inv.rung - 1]} nudge sent\`
      : '';
  return \`\${inv.client}, \${inv.amountLabel}, \${status}\${rungBit}\`;
}

// Deterministic sort. Overdue: (nudgedToday ? 1 : 0) asc, daysPastTerms
// desc, id asc — a freshly nudged row cools and re-sorts DOWNWARD. Due
// soon: daysUntilDue asc, id asc. Promised: id asc.
function sortedBucket(invoices: Invoice[], bucket: BucketId): Invoice[] {
  const rows = invoices.filter(inv => inv.bucket === bucket);
  if (bucket === 'overdue') {
    return rows.sort((a, b) => {
      const nudge = Number(a.nudgedToday) - Number(b.nudgedToday);
      if (nudge !== 0) return nudge;
      if (a.daysPastTerms !== b.daysPastTerms) return b.daysPastTerms - a.daysPastTerms;
      return a.id < b.id ? -1 : 1;
    });
  }
  if (bucket === 'duesoon') {
    return rows.sort((a, b) =>
      a.daysUntilDue !== b.daysUntilDue ? a.daysUntilDue - b.daysUntilDue : a.id < b.id ? -1 : 1,
    );
  }
  return rows.sort((a, b) => (a.id < b.id ? -1 : 1));
}

/** charCode sum of the invoice id % 360 — the monogram gradient angle. */
function gradientAngle(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return sum % 360;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — chaseStore: a single useState object with update(patch)
// + updateInvoice(id, patch). Every surface reads and writes through it.
// Undo carries a SNAPSHOT of {invoices, activity} so restoration is
// exact-position by construction (spec sketched {invoiceId, prevRung,
// prevNudgedToday}; the snapshot form satisfies the same law for all three
// mutations — deviation noted).
// ---------------------------------------------------------------------------

interface UndoSnapshot {
  prevInvoices: Invoice[];
  prevActivity: LogEntry[];
  undoneMsg: string; // toast text after Undo ('Nudge undone', 'Restored — …')
}

interface ChaseStore {
  invoices: Invoice[];
  activity: LogEntry[];
  tab: TabId;
  segment: BucketId;
  sheet: null | {invoiceId: string; detent: 'medium' | 'large'};
  actionSheetFor: string | null;
  swipeOpenId: string | null;
  toast: null | {seq: number; msg: string; undo: UndoSnapshot | null};
  editingDraft: string;
  refreshed: boolean; // 'Updated just now' caption shown
  skeleton: boolean; // demonstrable skeleton state (refresh-press)
  settings: {autoLadder: boolean; pauseOnPromise: boolean; ccMyself: boolean; payAlerts: boolean; digest: boolean};
  scrollByTab: Record<TabId, number>; // per-tab scroll persistence
  actSeq: number; // deterministic ids for appended activity entries
}

const INITIAL_STORE: ChaseStore = {
  invoices: INVOICES,
  activity: ACTIVITY_FIXTURES,
  tab: 'chase',
  segment: 'overdue',
  sheet: null,
  actionSheetFor: null,
  swipeOpenId: null,
  toast: null,
  editingDraft: '',
  refreshed: false,
  skeleton: false,
  settings: {autoLadder: true, pauseOnPromise: true, ccMyself: false, payAlerts: true, digest: false},
  scrollByTab: {chase: 0, activity: 0, settings: 0},
  actSeq: 6,
};

function useChaseStore() {
  const [store, setStore] = useState<ChaseStore>(INITIAL_STORE);
  const update = useCallback((patch: Partial<ChaseStore>) => {
    setStore(prev => ({...prev, ...patch}));
  }, []);
  const updateInvoice = useCallback((id: string, patch: Partial<Invoice>) => {
    setStore(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv => (inv.id === id ? {...inv, ...patch} : inv)),
    }));
  }, []);
  return {store, update, updateInvoice, setStore};
}

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver on the shell
 * wrapper can tell the 390px mobile stage from the desktop stage.
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns the page
 * scroll, so per-tab scrollTop is recorded/restored against it. */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node != null) {
    const style = window.getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return document.scrollingElement instanceof HTMLElement ? document.scrollingElement : null;
}

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — sheets/action sheets trap focus while open; Escape
// closes the topmost overlay only; focus restores to the opener on every
// close path. First focus uses {preventScroll: true} — a plain .focus()
// scroll-reveals the animating sheet inside the locked overflow-hidden
// column and beaches it mid-screen.
// ---------------------------------------------------------------------------

const FOCUSABLE = 'button:not([disabled]), input, textarea, [tabindex="0"]';

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE);
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
// BRAND MARK — 32px torn-invoice/coin glyph in the 44×44 nav slot.
// ---------------------------------------------------------------------------

function DuesdayMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandMark}>
        <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
          {/* Invoice sheet with a torn bottom edge */}
          <path
            d="M5 2.5h10v12l-1.6-1.2-1.7 1.2-1.7-1.2-1.7 1.2-1.7-1.2L5 14.5v-12Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M7.5 6h5M7.5 8.6h3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          {/* Coin overlapping the torn edge */}
          <circle cx="13.4" cy="14.6" r="3.4" fill="currentColor" />
          <text x="13.4" y="16.4" textAnchor="middle" fontSize="5" fontWeight="700" fill="var(--color-background-card)">
            $
          </text>
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// AGING BADGE — 40×40 SVG: 32px gradient-monogram circle (angle derived
// from the invoice id's charCode sum % 360; both gradient stops are dark
// in both schemes so the 14px/700 #FFFFFF initials hold ≥4.5:1 — math at
// MONO_STOP_A/B) under an outer aging arc: circle r=18, strokeWidth 3,
// circumference 2π·18 ≈ 113.1, sweep = min(daysPastTerms/45, 1) in the
// escalation pair for the bracket; due-soon rows sweep (10−daysUntil)/10
// (min 0.1) in NEUTRAL_REST (≥3:1 vs card — amendment deviation from
// --color-border); promised rows draw no arc. Decorative: aria-hidden —
// the day figure lives in the row meta text.
// ---------------------------------------------------------------------------

const ARC_CIRCUMFERENCE = 2 * Math.PI * 18; // ≈ 113.1

function arcColorFor(daysPastTerms: number): string {
  if (daysPastTerms >= 31) return ESC_FINAL;
  if (daysPastTerms >= 15) return ESC_FIRM;
  return ESC_FRIENDLY;
}

function AgingBadge({invoice}: {invoice: Invoice}) {
  const angle = gradientAngle(invoice.id);
  let sweep = 0;
  let arcColor = NEUTRAL_REST;
  if (invoice.bucket === 'overdue') {
    sweep = Math.min(invoice.daysPastTerms / 45, 1);
    arcColor = arcColorFor(invoice.daysPastTerms);
  } else if (invoice.bucket === 'duesoon') {
    sweep = Math.max((10 - invoice.daysUntilDue) / 10, 0.1);
  }
  const gradId = \`dd-grad-\${invoice.id}\`;
  return (
    <span style={styles.agingBadge} aria-hidden>
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none" aria-hidden>
        <defs>
          <linearGradient id={gradId} gradientTransform={\`rotate(\${angle} 0.5 0.5)\`}>
            <stop offset="0" stopColor={MONO_STOP_A} />
            <stop offset="1" stopColor={MONO_STOP_B} />
          </linearGradient>
        </defs>
        <circle cx={20} cy={20} r={16} fill={\`url(#\${gradId})\`} />
        <text
          x={20}
          y={25}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fill="#FFFFFF"
          fontFamily="var(--font-family-body)">
          {invoice.initials}
        </text>
        {sweep > 0 ? (
          <circle
            cx={20}
            cy={20}
            r={18}
            stroke={arcColor}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={\`\${(sweep * ARC_CIRCUMFERENCE).toFixed(2)} \${ARC_CIRCUMFERENCE.toFixed(2)}\`}
            transform="rotate(-90 20 20)"
            className="dd-fade"
          />
        ) : null}
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// LADDER STEPPER — 44×16: three 12×4 notches (radius 2, 4px gaps). Filled
// notches use the escalation pairs (1 friendly amber · 2 firm orange ·
// 3 final red); EMPTY notches are --color-background-muted with a 1px
// NEUTRAL_REST boundary — future rungs are a meaningful rest state, so the
// boundary carries its own ≥3:1 pair per the amendment (deviation from the
// spec's passive --color-border). Non-interactive (aria-hidden); the rung
// lives in the row button's accessible name.
// ---------------------------------------------------------------------------

const RUNG_COLORS = [ESC_FRIENDLY, ESC_FIRM, ESC_FINAL];

function LadderStepper({rung, nudgedToday, previewNext}: {rung: Rung; nudgedToday: boolean; previewNext?: boolean}) {
  const label = nudgedToday ? 'nudged today' : rung > 0 ? RUNG_NAMES[rung - 1] : 'no nudges';
  return (
    <span style={styles.ladderWrap} aria-hidden>
      <span style={styles.ladderNotches}>
        {RUNG_COLORS.map((color, index) => {
          const filled = index < rung;
          const isPreview = previewNext === true && index === rung;
          return (
            <span
              key={color}
              className="dd-fade"
              style={{
                ...styles.ladderNotch,
                ...(filled
                  ? {background: color}
                  : isPreview
                    ? {background: 'transparent', border: \`1px dashed \${color}\`}
                    : {background: 'var(--color-background-muted)', border: \`1px solid \${NEUTRAL_REST}\`}),
              }}
            />
          );
        })}
      </span>
      <span style={styles.ladderLabel}>{label}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PROMISE CHIP RAIL — 28px rail of 24px pills; ONE focusable control
// (tabIndex 0, aria-label with the event count, ArrowLeft/Right scroll).
// Chips are non-interactive metadata; fixed content widths guarantee the
// ≥24px next-chip peek at 320.
// ---------------------------------------------------------------------------

function PromiseChipRail({invoice}: {invoice: Invoice}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    railRef.current?.scrollBy({left: event.key === 'ArrowRight' ? 72 : -72});
  };
  return (
    <div
      ref={railRef}
      style={styles.promiseChipRail}
      tabIndex={0}
      role="group"
      className="dd-focusable"
      aria-label={\`Contact history, \${invoice.chips.length} events\`}
      onKeyDown={onKeyDown}>
      {invoice.chips.map(chip => (
        <span key={chip} style={styles.promiseChip}>
          {chip}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// INVOICE ROW — 88px media row (116px with the promise-chip rail). The row
// is one <button> with a composed accessible name; the 44×44 ellipsis is a
// SIBLING button (the mandatory button path for the swipe gesture). Swipe:
// horizontal pointer drag translates the sliding layer, snapping open at
// −72px to reveal the brand Promise block (same Log-promise mutation);
// one row open at a time; the block renders only while revealed so it
// never sits in the tab order invisibly.
// ---------------------------------------------------------------------------

interface InvoiceRowProps {
  invoice: Invoice;
  open: boolean;
  reducedMotion: boolean;
  onSwipe: (id: string | null) => void;
  onRowTap: (invoice: Invoice, opener: HTMLElement) => void;
  onEllipsis: (invoice: Invoice, opener: HTMLElement) => void;
  onPromise: (invoice: Invoice) => void;
}

function InvoiceRow({invoice, open, reducedMotion, onSwipe, onRowTap, onEllipsis, onPromise}: InvoiceRowProps) {
  const swipeEnabled = invoice.bucket !== 'promised';
  const dragRef = useRef<{startX: number; startY: number; dragging: boolean} | null>(null);
  const [dragX, setDragX] = useState<number | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipeEnabled || !event.isPrimary) return;
    dragRef.current = {startX: event.clientX, startY: event.clientY, dragging: false};
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag == null) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.dragging) {
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
      drag.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragX(Math.min(0, Math.max(-72, dx + (open ? -72 : 0))));
  };
  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag == null || !drag.dragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const settled = dragX ?? 0;
    onSwipe(settled < -36 ? invoice.id : null);
    setDragX(null);
  };

  const translate = dragX ?? (open ? -72 : 0);
  const revealed = translate < 0;
  return (
    <div style={styles.rowOuter} data-flip-id={invoice.id}>
      <div style={styles.rowClip}>
        {revealed ? (
          <button
            type="button"
            className="dd-btn dd-focusable"
            style={styles.promiseAction}
            onClick={() => onPromise(invoice)}>
            <Icon icon={HandshakeIcon} size="sm" />
            Promise
          </button>
        ) : null}
        <div
          style={{
            ...styles.rowSlide,
            transform: translate === 0 ? 'none' : \`translateX(\${translate}px)\`,
            transition: dragX == null && !reducedMotion ? 'transform 240ms ease' : 'none',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}>
          <div style={styles.rowMain}>
            <button
              type="button"
              className="dd-btn dd-focusable"
              style={styles.row}
              aria-label={rowNameFor(invoice)}
              onClick={event => {
                if (open) {
                  onSwipe(null);
                  return;
                }
                onRowTap(invoice, event.currentTarget);
              }}>
              <AgingBadge invoice={invoice} />
              <span style={styles.rowStack}>
                <span style={styles.rowName}>{invoice.client}</span>
                <span style={styles.rowMeta}>{metaFor(invoice)}</span>
              </span>
              <span style={styles.trailingCol}>
                <span style={styles.rowAmount}>{invoice.amountLabel}</span>
                <LadderStepper rung={invoice.rung} nudgedToday={invoice.nudgedToday} />
              </span>
            </button>
            <button
              type="button"
              className="dd-btn dd-focusable"
              style={styles.ellipsisBtn}
              aria-label={\`Actions for \${invoice.client}\`}
              onClick={event => onEllipsis(invoice, event.currentTarget)}>
              <Icon icon={MoreHorizontalIcon} size="sm" />
            </button>
          </div>
          {invoice.bucket === 'promised' ? <PromiseChipRail invoice={invoice} /> : null}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SETTINGS SWITCH ROW — the WHOLE 44px row is the switch (role='switch',
// aria-checked, label as accessible name); the 51×31 visual never stands
// alone. Thumb travels 20px (51 − 2×1 border − 27 thumb − 2×1 inset).
// ---------------------------------------------------------------------------

function SettingSwitchRow({label, checked, onToggle}: {label: string; checked: boolean; onToggle: () => void}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="dd-btn dd-focusable"
      style={styles.utilityRow}
      onClick={onToggle}>
      <span style={styles.utilityLabel}>{label}</span>
      <span style={{...styles.switchTrack, boxSizing: 'border-box', ...(checked ? styles.switchTrackOn : null)}} aria-hidden>
        <span
          className="dd-anim"
          style={{...styles.switchThumb, transform: checked ? 'translateX(20px)' : 'none'}}
        />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// EMPTY STATE — true-empty variants per segment (no search → no
// filtered-empty). The Promised empty state's single action opens the
// FIRST overdue invoice's action sheet.
// ---------------------------------------------------------------------------

const EMPTY_COPY: Record<BucketId, {title: string; body: string}> = {
  overdue: {title: 'Nothing overdue', body: 'Invoices past their terms appear here.'},
  duesoon: {title: 'Nothing due soon', body: 'Invoices coming due appear here.'},
  promised: {title: 'No promises yet', body: 'Promises you log appear here.'},
};

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const SKELETON_PRIMARY = ['60%', '45%', '70%'];
const SKELETON_SECONDARY = ['40%', '55%', '30%'];

const ACTIVITY_ICONS = {nudge: SendIcon, promise: HandshakeIcon, paid: BanknoteIcon} as const;

const SETTINGS_SECTIONS: Array<{header: string; rows: Array<{key: keyof ChaseStore['settings']; label: string}>}> = [
  {
    header: 'Chasing',
    rows: [
      {key: 'autoLadder', label: 'Auto-advance nudge ladder'},
      {key: 'pauseOnPromise', label: 'Pause nudges after a promise'},
      {key: 'ccMyself', label: 'CC myself on every nudge'},
    ],
  },
  {
    header: 'Notifications',
    rows: [
      {key: 'payAlerts', label: 'Payment alerts'},
      {key: 'digest', label: 'Daily chase digest'},
    ],
  },
];

const H1_BY_TAB: Record<TabId, string> = {
  chase: 'Duesday invoices',
  activity: 'Duesday activity',
  settings: 'Duesday settings',
};

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function MobileInvoiceChaserTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const containerWidth = useElementWidth(wrapRef);
  // Viewport query is only the first-frame fallback; container width wins.
  const viewportWide = useMediaQuery('(min-width: 720px)');
  const isDesktop = containerWidth > 0 ? containerWidth >= 720 : viewportWide;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {store, update, setStore} = useChaseStore();
  const overlayOpen = store.sheet != null || store.actionSheetFor != null;

  // DERIVED AGGREGATES — computed with .reduce in render from
  // chaseStore.invoices, never hardcoded twice. Initial: $17,000.00 total;
  // Overdue 4 · Due soon 3 · Promised 2.
  const totalCents = store.invoices.reduce((sum, inv) => sum + inv.amountCents, 0);
  const bucketRows = sortedBucket(store.invoices, store.segment);
  const bucketSum = bucketRows.reduce((sum, inv) => sum + inv.amountCents, 0);
  const counts: Record<BucketId, number> = {overdue: 0, duesoon: 0, promised: 0};
  for (const inv of store.invoices) counts[inv.bucket] += 1;
  const todayCount = store.activity.reduce((n, entry) => n + (entry.dateLabel === 'Today' ? 1 : 0), 0);

  const sheetInvoice = store.sheet != null ? store.invoices.find(inv => inv.id === store.sheet?.invoiceId) : undefined;
  const actionInvoice =
    store.actionSheetFor != null ? store.invoices.find(inv => inv.id === store.actionSheetFor) : undefined;
  const firstOverdue = sortedBucket(store.invoices, 'overdue')[0];

  // FLIP settle — 240ms transform reorder for re-sorted rows; plain
  // reorder (no animation) under reduced motion. Positions are measured
  // relative to the list container so page scroll never triggers phantom
  // moves.
  const flipTops = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    const container = listRef.current;
    if (container == null) {
      flipTops.current.clear();
      return;
    }
    const containerTop = container.getBoundingClientRect().top;
    const next = new Map<string, number>();
    container.querySelectorAll<HTMLElement>('[data-flip-id]').forEach(el => {
      const id = el.dataset.flipId;
      if (id == null) return;
      const top = el.getBoundingClientRect().top - containerTop;
      const prev = flipTops.current.get(id);
      if (prev != null && prev !== top && !reducedMotion) {
        el.animate([{transform: \`translateY(\${prev - top}px)\`}, {transform: 'none'}], {
          duration: 240,
          easing: 'ease',
        });
      }
      next.set(id, top);
    });
    flipTops.current = next;
  });

  // Focus INTO overlays on open ({preventScroll: true} — plain .focus()
  // beaches the animating sheet inside the locked column).
  const sheetInvoiceId = store.sheet?.invoiceId ?? null;
  useEffect(() => {
    if (sheetInvoiceId != null) sheetCloseRef.current?.focus({preventScroll: true});
  }, [sheetInvoiceId]);
  useEffect(() => {
    if (store.actionSheetFor != null) actionCancelRef.current?.focus({preventScroll: true});
  }, [store.actionSheetFor]);

  // Focus restore to the opener on EVERY close path (X, scrim, Escape,
  // Cancel, Send) — fires when the last overlay closes.
  const prevOverlayRef = useRef(false);
  useEffect(() => {
    if (prevOverlayRef.current && !overlayOpen) {
      openerRef.current?.focus({preventScroll: true});
    }
    prevOverlayRef.current = overlayOpen;
  }, [overlayOpen]);

  // Escape closes the TOPMOST overlay only: composer sheet → action sheet
  // → open swipe row.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setStore(prev => {
        if (prev.sheet != null) return {...prev, sheet: null, editingDraft: ''};
        if (prev.actionSheetFor != null) return {...prev, actionSheetFor: null};
        if (prev.swipeOpenId != null) return {...prev, swipeOpenId: null};
        return prev;
      });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setStore]);

  // Per-tab scroll persistence — restore the recorded scrollTop when a tab
  // becomes active (the demo's outer scroller owns the page scroll).
  const scrollByTabRef = useRef(store.scrollByTab);
  scrollByTabRef.current = store.scrollByTab;
  useEffect(() => {
    const scroller = getScrollParent(shellRef.current);
    scroller?.scrollTo({top: scrollByTabRef.current[store.tab]});
  }, [store.tab]);

  // -------------------------------------------------------------------
  // MUTATIONS — every one flows through the single store; aggregates
  // re-derive; Undo restores the exact snapshot (row position included).
  // -------------------------------------------------------------------

  const openActionSheet = (invoice: Invoice, opener: HTMLElement) => {
    openerRef.current = opener;
    update({actionSheetFor: invoice.id, swipeOpenId: null});
  };

  const closeActionSheet = () => update({actionSheetFor: null});

  const openComposer = (invoice: Invoice) => {
    update({
      actionSheetFor: null,
      sheet: {invoiceId: invoice.id, detent: 'medium'},
      editingDraft: NUDGE_TEMPLATES[Math.min(invoice.rung, 2)](invoice),
    });
  };

  const closeSheet = () => update({sheet: null, editingDraft: ''});

  const toggleDetent = () => {
    setStore(prev =>
      prev.sheet == null
        ? prev
        : {...prev, sheet: {...prev.sheet, detent: prev.sheet.detent === 'medium' ? 'large' : 'medium'}},
    );
  };

  const sendNudge = (invoiceId: string) => {
    setStore(prev => {
      const inv = prev.invoices.find(candidate => candidate.id === invoiceId);
      if (inv == null || inv.rung >= 3) return prev;
      const sentName = RUNG_NAMES[Math.min(inv.rung, 2)];
      const entry: LogEntry = {
        id: \`act-\${String(prev.actSeq).padStart(2, '0')}\`,
        kind: 'nudge',
        title: \`Sent \${sentName} nudge\`,
        detail: inv.client,
        dateLabel: 'Today',
      };
      return {
        ...prev,
        invoices: prev.invoices.map(candidate =>
          candidate.id === invoiceId
            ? {...candidate, rung: (candidate.rung + 1) as Rung, nudgedToday: true}
            : candidate,
        ),
        activity: [entry, ...prev.activity],
        actSeq: prev.actSeq + 1,
        sheet: null,
        editingDraft: '',
        toast: {
          seq: prev.actSeq,
          msg: \`\${capitalize(sentName)} nudge sent — \${inv.client}\`,
          undo: {prevInvoices: prev.invoices, prevActivity: prev.activity, undoneMsg: 'Nudge undone'},
        },
      };
    });
  };

  const markPaid = (invoiceId: string) => {
    setStore(prev => {
      const inv = prev.invoices.find(candidate => candidate.id === invoiceId);
      if (inv == null) return prev;
      const entry: LogEntry = {
        id: \`act-\${String(prev.actSeq).padStart(2, '0')}\`,
        kind: 'paid',
        title: 'Marked paid',
        detail: \`\${inv.client} · \${inv.amountLabel}\`,
        dateLabel: 'Today',
      };
      return {
        ...prev,
        invoices: prev.invoices.filter(candidate => candidate.id !== invoiceId),
        activity: [entry, ...prev.activity],
        actSeq: prev.actSeq + 1,
        actionSheetFor: null,
        toast: {
          seq: prev.actSeq,
          msg: \`Marked paid — \${inv.client} · \${inv.amountLabel}\`,
          undo: {prevInvoices: prev.invoices, prevActivity: prev.activity, undoneMsg: \`Restored — \${inv.client}\`},
        },
      };
    });
  };

  const logPromise = (invoiceId: string) => {
    setStore(prev => {
      const inv = prev.invoices.find(candidate => candidate.id === invoiceId);
      if (inv == null || inv.bucket === 'promised') return prev;
      const entry: LogEntry = {
        id: \`act-\${String(prev.actSeq).padStart(2, '0')}\`,
        kind: 'promise',
        title: 'Logged promise',
        detail: inv.client,
        dateLabel: 'Today',
      };
      return {
        ...prev,
        invoices: prev.invoices.map(candidate =>
          candidate.id === invoiceId
            ? {
                ...candidate,
                bucket: 'promised' as BucketId,
                chips: ['promised Fri', ...candidate.chips],
                daysPastTerms: 0,
                daysUntilDue: 0,
              }
            : candidate,
        ),
        activity: [entry, ...prev.activity],
        actSeq: prev.actSeq + 1,
        actionSheetFor: null,
        swipeOpenId: null,
        toast: {
          seq: prev.actSeq,
          msg: \`Promise logged — \${inv.client}\`,
          undo: {prevInvoices: prev.invoices, prevActivity: prev.activity, undoneMsg: 'Promise removed'},
        },
      };
    });
  };

  const undo = () => {
    setStore(prev => {
      const undoData = prev.toast?.undo;
      if (undoData == null) return prev;
      return {
        ...prev,
        invoices: undoData.prevInvoices,
        activity: undoData.prevActivity,
        toast: {seq: prev.actSeq, msg: undoData.undoneMsg, undo: null},
        actSeq: prev.actSeq + 1,
      };
    });
  };

  const onRefresh = () => {
    setStore(prev =>
      prev.skeleton
        ? {...prev, skeleton: false}
        : {
            ...prev,
            skeleton: true,
            refreshed: true,
            swipeOpenId: null,
            toast: {seq: prev.actSeq, msg: 'Updated just now', undo: null},
            actSeq: prev.actSeq + 1,
          },
    );
  };

  const selectSegment = (segment: BucketId) => {
    update({segment, skeleton: false, swipeOpenId: null});
  };

  const onTabPress = (tabId: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (tabId === store.tab) {
      // The one legal reset: re-tapping the active tab scrolls to top.
      scroller?.scrollTo({top: 0});
      return;
    }
    const currentTop = scroller?.scrollTop ?? 0;
    setStore(prev => ({
      ...prev,
      tab: tabId,
      // Overlays belong to their moment — they close on tab switch; the
      // toast dock, segment selection, and drafts persist.
      sheet: null,
      actionSheetFor: null,
      swipeOpenId: null,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: currentTop},
    }));
  };

  const segmentKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % SEGMENTS.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + SEGMENTS.length - 1) % SEGMENTS.length;
    if (next === -1) return;
    event.preventDefault();
    selectSegment(SEGMENTS[next].id);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button');
    buttons?.[next]?.focus();
  };

  const tabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    if (event.key === 'ArrowLeft') next = (index + TABS.length - 1) % TABS.length;
    if (next === -1) return;
    event.preventDefault();
    onTabPress(TABS[next].id);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button');
    buttons?.[next]?.focus();
  };

  // Composer derivations.
  const sendingName = sheetInvoice != null ? RUNG_NAMES[Math.min(sheetInvoice.rung, 2)] : 'friendly';
  const nudgeRowLabel =
    actionInvoice == null
      ? ''
      : actionInvoice.rung >= 3
        ? 'All nudges sent'
        : actionInvoice.rung === 0
          ? 'Send nudge (friendly)'
          : \`Send nudge (\${RUNG_NAMES[actionInvoice.rung - 1]} → \${RUNG_NAMES[Math.min(actionInvoice.rung, 2)]})\`;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktop ? styles.shellDesktop : null),
    ...(overlayOpen ? styles.shellLocked : null),
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{DUESDAY_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — brand mark · compact title (always visible) · Refresh */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <DuesdayMark />
          </div>
          <p style={styles.navTitle}>Duesday</p>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="dd-btn dd-focusable"
              style={styles.iconBtn}
              aria-label="Refresh invoices"
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="sm" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <h1 className="dd-vh">{H1_BY_TAB[store.tab]}</h1>

          {store.tab === 'chase' ? (
            <>
              {/* OUTSTANDING HEADER — 72px block, total DERIVED live. */}
              <div style={styles.outstandingHeader}>
                <span style={styles.overline}>Total outstanding</span>
                <span style={styles.outstandingTotal}>{fmtUsd(totalCents)}</span>
                {store.refreshed ? <span style={styles.updatedCaption}>Updated just now</span> : null}
              </div>

              {/* SEGMENTED CONTROL — radiogroup, arrow keys, derived counts. */}
              <div style={styles.segmentedBlock}>
                <div role="radiogroup" aria-label="Invoice buckets" style={styles.segmentedTrack}>
                  {SEGMENTS.map((seg, index) => {
                    const active = seg.id === store.segment;
                    return (
                      <button
                        key={seg.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active ? 0 : -1}
                        className="dd-btn dd-focusable"
                        style={{...styles.segment, ...(active ? styles.segmentActive : null)}}
                        onClick={() => selectSegment(seg.id)}
                        onKeyDown={event => segmentKeyDown(event, index)}>
                        {seg.label} {counts[seg.id]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <h2 style={styles.sectionHeader}>
                {SEGMENTS.find(seg => seg.id === store.segment)?.label} · {fmtUsd(bucketSum)}
              </h2>

              {store.skeleton ? (
                <div style={styles.listCard} aria-busy="true">
                  {SKELETON_PRIMARY.map((width, index) => (
                    <div key={width}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.skeletonRow} aria-hidden>
                        <span className="dd-skel" style={styles.skelCircle} />
                        <span style={styles.skelStack}>
                          <span className="dd-skel" style={{...styles.skelBar, width}} />
                          <span className="dd-skel" style={{...styles.skelBar, width: SKELETON_SECONDARY[index]}} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : bucketRows.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyCircle}>
                    <Icon icon={HandCoinsIcon} size="md" />
                  </span>
                  <h3 style={styles.emptyTitle}>{EMPTY_COPY[store.segment].title}</h3>
                  <p style={styles.emptyBody}>{EMPTY_COPY[store.segment].body}</p>
                  {store.segment === 'promised' && firstOverdue != null ? (
                    <button
                      type="button"
                      className="dd-btn dd-focusable"
                      style={styles.emptyBtn}
                      onClick={event => openActionSheet(firstOverdue, event.currentTarget)}>
                      Log a promise
                    </button>
                  ) : null}
                </div>
              ) : (
                <div ref={listRef} style={styles.listCard}>
                  {bucketRows.map((invoice, index) => (
                    <div key={invoice.id} style={{display: 'contents'}}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <InvoiceRow
                        invoice={invoice}
                        open={store.swipeOpenId === invoice.id}
                        reducedMotion={reducedMotion}
                        onSwipe={id => update({swipeOpenId: id})}
                        onRowTap={openActionSheet}
                        onEllipsis={openActionSheet}
                        onPromise={inv => logPromise(inv.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}

          {store.tab === 'activity' ? (
            <div>
              <h2 style={styles.sectionHeader}>Recent activity</h2>
              {store.activity.map((entry, index) => {
                const EntryIcon = ACTIVITY_ICONS[entry.kind];
                return (
                  <div key={entry.id}>
                    {index > 0 ? <div style={styles.activityDividerFull} /> : null}
                    <div style={styles.activityRow}>
                      <span style={styles.activityIcon} aria-hidden>
                        <Icon icon={EntryIcon} size="sm" />
                      </span>
                      <span style={styles.activityStack}>
                        <span style={styles.activityTitle}>{entry.title}</span>
                        <span style={styles.activityDetail}>{entry.detail}</span>
                      </span>
                      <span style={styles.activityDate}>{entry.dateLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {store.tab === 'settings' ? (
            <div>
              {SETTINGS_SECTIONS.map(section => (
                <div key={section.header}>
                  <h2 style={styles.sectionHeader}>{section.header}</h2>
                  <div style={styles.listCard}>
                    {section.rows.map((row, index) => (
                      <div key={row.key} style={{display: 'contents'}}>
                        {index > 0 ? <div style={{...styles.rowDivider, marginInlineStart: 16}} /> : null}
                        <SettingSwitchRow
                          label={row.label}
                          checked={store.settings[row.key]}
                          onToggle={() =>
                            setStore(prev => ({
                              ...prev,
                              settings: {...prev.settings, [row.key]: !prev.settings[row.key]},
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div style={{height: 24}} />
        </main>

        {/* TOAST DOCK — sticky-in-flow, THE single aria-live region; one
            toast, no auto-dismiss; a new mutation replaces it. */}
        <div style={styles.toastDock} aria-live="polite">
          {store.toast != null ? (
            <div key={store.toast.seq} className="dd-fade" style={styles.toast}>
              <span style={styles.toastMsg}>{store.toast.msg}</span>
              {store.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="dd-btn dd-focusable" style={styles.toastUndoBtn} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px sticky bottom; Activity badge DERIVED from
            entries stamped 'Today'. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Duesday sections">
          {TABS.map((tabEntry, index) => {
            const active = tabEntry.id === store.tab;
            const TabIcon = tabEntry.id === 'chase' ? HandCoinsIcon : tabEntry.id === 'activity' ? HistoryIcon : SettingsIcon;
            return (
              <button
                key={tabEntry.id}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                className="dd-btn dd-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => onTabPress(tabEntry.id)}
                onKeyDown={event => tabKeyDown(event, index)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={TabIcon} size="sm" />
                  {tabEntry.id === 'activity' && todayCount > 0 ? (
                    <span style={styles.tabBadge}>{todayCount}</span>
                  ) : null}
                </span>
                {tabEntry.label}
              </button>
            );
          })}
        </nav>

        {/* ACTION SHEET — verb picker: options card + separate Cancel card;
            first focus = Cancel (the safe default). */}
        {actionInvoice != null ? (
          <>
            <div style={styles.sheetScrim} className="dd-fade" onClick={closeActionSheet} aria-hidden />
            <div
              ref={actionSheetRef}
              role="dialog"
              aria-modal="true"
              aria-label={\`Actions for \${actionInvoice.client}\`}
              className="dd-sheet-in"
              style={styles.actionSheet}
              onKeyDown={event => trapTabKey(event, actionSheetRef.current)}>
              <div style={styles.actionSheetCard}>
                <div style={styles.actionSheetHeader}>
                  {actionInvoice.client} · {actionInvoice.amountLabel}
                </div>
                <div style={styles.actionSheetDivider} />
                <button
                  type="button"
                  className="dd-btn dd-focusable"
                  style={{...styles.actionSheetRow, ...(actionInvoice.rung >= 3 ? styles.actionSheetRowDisabled : null)}}
                  disabled={actionInvoice.rung >= 3}
                  onClick={() => openComposer(actionInvoice)}>
                  {nudgeRowLabel}
                </button>
                {actionInvoice.bucket !== 'promised' ? (
                  <>
                    <div style={styles.actionSheetDivider} />
                    <button
                      type="button"
                      className="dd-btn dd-focusable"
                      style={styles.actionSheetRow}
                      onClick={() => logPromise(actionInvoice.id)}>
                      Log promise to pay
                    </button>
                  </>
                ) : null}
                <div style={styles.actionSheetDivider} />
                <button
                  type="button"
                  className="dd-btn dd-focusable"
                  style={styles.actionSheetRow}
                  onClick={() => markPaid(actionInvoice.id)}>
                  Mark paid
                </button>
              </div>
              <div style={styles.actionSheetCard}>
                <button
                  ref={actionCancelRef}
                  type="button"
                  className="dd-btn dd-focusable"
                  style={styles.actionSheetCancel}
                  onClick={closeActionSheet}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* COMPOSER SHEET — two detents (55% / calc(100% − 56px)); the
            body is the one legal inner scroller; sticky Send footer. */}
        {store.sheet != null && sheetInvoice != null ? (
          <>
            <div style={styles.sheetScrim} className="dd-fade" onClick={closeSheet} aria-hidden />
            <div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dd-composer-title"
              className="dd-sheet-in"
              style={{
                ...styles.sheet,
                height: store.sheet.detent === 'medium' ? '55%' : 'calc(100% - 56px)',
              }}
              onKeyDown={event => trapTabKey(event, sheetRef.current)}>
              <button
                type="button"
                className="dd-btn dd-focusable"
                style={styles.sheetGrabber}
                aria-label="Resize sheet"
                onClick={toggleDetent}>
                <span style={styles.sheetGrabberPill} />
              </button>
              <div style={styles.sheetHeader}>
                <span />
                <h2 id="dd-composer-title" style={styles.sheetTitle}>
                  Nudge {sheetInvoice.client}
                </h2>
                <button
                  ref={sheetCloseRef}
                  type="button"
                  className="dd-btn dd-focusable"
                  style={styles.iconBtn}
                  aria-label="Close composer"
                  onClick={closeSheet}>
                  <Icon icon={XIcon} size="sm" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                <div style={styles.recipientRow}>
                  To
                  <span style={styles.recipientValue}>{sheetInvoice.email}</span>
                </div>
                <div style={styles.formField}>
                  <label style={styles.fieldLabel} htmlFor="dd-subject">
                    Subject
                  </label>
                  <input
                    id="dd-subject"
                    className="dd-input"
                    style={styles.fieldInput}
                    key={\`\${sheetInvoice.id}-\${sheetInvoice.rung}\`}
                    defaultValue={nudgeSubject(sheetInvoice)}
                  />
                </div>
                <div style={styles.formField}>
                  <label style={styles.fieldLabel} htmlFor="dd-message">
                    Message
                  </label>
                  <textarea
                    id="dd-message"
                    className="dd-input"
                    style={styles.fieldTextarea}
                    value={store.editingDraft}
                    onChange={event => update({editingDraft: event.target.value})}
                  />
                </div>
                {/* Rung preview — the ladder advancing on Send. */}
                <div style={styles.previewStrip}>
                  <span>
                    Ladder: {sheetInvoice.rung} of 3 sent → sending {sendingName}
                  </span>
                  <LadderStepper rung={sheetInvoice.rung} nudgedToday={sheetInvoice.nudgedToday} previewNext />
                </div>
              </div>
              <div style={styles.sheetFooter}>
                <button
                  type="button"
                  className="dd-btn dd-focusable"
                  style={styles.sendBtn}
                  onClick={() => sendNudge(sheetInvoice.id)}>
                  <Icon icon={SendIcon} size="sm" />
                  Send {sendingName} nudge
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};