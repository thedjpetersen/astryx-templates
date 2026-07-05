// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Vouchly reference roster for the
 *   Senior PM · Meridian Labs application, frozen at "today = Jul 4": nine
 *   references across three relationship types (Managers 3, Peers 4, Direct
 *   reports 2 → 3+4+2 = 9 ✓) against a 2/2/1 requirement profile (total 5).
 *   Statuses: 2 Confirmed + 3 Awaiting + 4 Idle = 9 ✓. Coverage confirmed by
 *   type 1 MGR + 1 PEER + 0 DR = 2 of 5; awaiting 1+1+1 = 3 pending ✓.
 *   Requests: 3 active + 2 completed = 5 sent records ✓. Packet: 2 vouchers
 *   = Confirmed count ✓. No Date.now(), no Math.random(), no network media;
 *   every relative string is pre-computed ('2d ago', 're-arms Fri',
 *   'Updated just now').
 * @output Vouchly — Reference Request Manager: a 390px MOBILE surface that
 *   turns reference-gathering into a visible state machine. NavBar (Vouchly
 *   twin-bubble mark · fading screen title · RefreshCw scripted-reply
 *   trigger) over a large-title References root: a 116px coverage card whose
 *   three-segment typed meter renders each required slot as solid
 *   (confirmed) / hatched (pending) / dashed-hollow (unasked), three
 *   relationship sections of 72px swipeable roster rows (statusChip +
 *   cooldown drain ring + 44×44 ellipsis), a Requests tab of 60px sent
 *   records, and a Packet tab that fills only as real confirmations land.
 *   Signature flow: the FAB opens a chip-assembled compose sheet whose
 *   structured parts (deadline/tone radios, shared-project/call toggles)
 *   re-flow a live preview through one pure buildMessage(); Send flips the
 *   target to Awaiting, re-hatches the meter, grows the Requests badge, and
 *   shows an in-sheet receipt. The navBar RefreshCw applies the one scripted
 *   reply (Lena Fischer confirms), moving DR to 1 OF 1 and Packet to 3.
 * @position Page template; emitted by `astryx template
 *   mobile-reference-request-manager`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at y=0
 *   is the first pixel). All overlays (scrim, compose sheet, action sheet)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While a
 *   sheet or action sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. Floating chrome (FAB, toast
 *   dock) anchors STICKY-in-flow (bottom 80 / 76 above the 64px tabBar) per
 *   the batch-2 amendment — shell-absolute would pin to the document bottom
 *   on tall scrolling views.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Vouchly violet). Sanctioned non-brand literals, each with
 *   contrast math at the declaration: pending/hollow meter boundaries
 *   (interactive-meaning fills need explicit ≥3:1 pairs vs their ACTUAL
 *   card surface — amendment), the amber cooldown arc, the Awaiting and
 *   Confirmed chip pairs, and the packet check green.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', always-on hairline — noted);
 *   largeTitle row 52px (References root only, 28px/700, scrolls away while
 *   the navBar title fades 0→1); coverageCard 116px (16 pad + 13px/600
 *   overline + 8 + 36px meter + 8 + 16px caption + 16 pad); rows 72px media
 *   roster / 60px two-line requests / 44px utility timeline; packet voucher
 *   cards 88px at 12px gaps; sectionHeader 13px/600 uppercase 0.06em at
 *   32px inset, 20px top / 8px bottom; tabBar 64px sticky bottom z20 (3
 *   tabs, 24px icon over 11px/500 label, 16px-min brand badge pills); FAB
 *   56×56 radius 16 at right 16 / bottom 80 (sticky anchor); sheet detents
 *   55% medium / calc(100% − 56px) large, 24px grabber zone with 36×5 pill,
 *   52px sheet header; actionSheet insetInline 16 bottom 16, 56px rows, own
 *   Cancel card; toast dock sticky bottom 76 z30, one 48px toast, no
 *   timers. TYPE (Figtree via --font-family-body): 28/700 large title ·
 *   17/600 nav & sheet titles · 16/500–400 row primary & body · 13/400–600
 *   secondary · 11/500 overlines, tab labels, meter labels; nothing under
 *   11px; tabular-nums on every mutating count. Buttons 48 primary / 36
 *   secondary segments / 44×44 icon. Touch: every target ≥44×44 with ≥8px
 *   clearance or merged into a full-row button; every gesture
 *   (swipe-reveal, sheet drag) has a visible button path (44×44 ellipsis
 *   per row, clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px: coverage segments stay flex:1 (min segment ≈
 *   (320−32−16)/3 = 90px — 11px 'MGR 1/2' labels fit); chip groups wrap;
 *   the 72px row's trailing cluster (chip+ring ≈56px + 44px ellipsis)
 *   coexists with the two-line stack via minWidth:0 + single-line ellipsis
 *   on name/role (Elena Torres-Konstantopoulou, 28 chars, is the stress);
 *   navBar center title ellipsizes at 200px; FAB stays right 16.
 *   overflowX:'clip' is backstop only — no width literals.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout; the anatomy is deliberately phone
 *   geometry. Sheet detents are % of the locked 100dvh, so they hold at any
 *   stage height.
 * - Reduced motion: sheet slide → fade, ring drain → instant static
 *   dashoffset, title fade → opacity swap; hatch fills distinguish pending
 *   without any animation.
 */

import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  BellRingIcon,
  BriefcaseIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  SendIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Vouchly violet). #7C3AED on the white card
// ≈ 5.9:1; #C4B5FD on the dark card (~#1C1C1E) ≈ 9.6:1.
const BRAND_ACCENT = 'light-dark(#7C3AED, #C4B5FD)';
// Text over a BRAND_ACCENT fill: #FFFFFF on #7C3AED ≈ 5.9:1; #1E1147 on
// #C4B5FD ≈ 8.4:1.
const BRAND_ON = 'light-dark(#FFFFFF, #1E1147)';
// 12% brand wash for the avatar-initial slot and brand mark chip.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Pending meter-slot boundary — a MEANING-BEARING fill boundary, so it gets
// an explicit pair ≥3:1 against its ACTUAL surface, the white/dark CARD
// (amendment; hairline tokens are for passive separators only): #6D28D9 on
// #FFFFFF ≈ 7.1:1 (spec named #7C3AED ≈ 5.9:1; the darker step also clears
// the hatch overlay — noted); #C4B5FD on the dark card ≈ 9.6:1.
const PENDING_BORDER = 'light-dark(#6D28D9, #C4B5FD)';
// Hollow (unasked) slot dashed boundary — rest-state but meaning-bearing:
// #8B5CF6 on #FFFFFF ≈ 4.6:1; #A78BFA on the dark card ≈ 7.4:1 — both ≥3:1.
const HOLLOW_BORDER = 'light-dark(#8B5CF6, #A78BFA)';
// Cooldown drain arc (non-text, ≥3:1 vs the card it sits on): #B45309 on
// #FFFFFF ≈ 5.0:1; #FBBF24 on the dark card ≈ 8.9:1.
const RING_AMBER = 'light-dark(#B45309, #FBBF24)';
// Amber wash for the 20px status dot the ring wraps (decorative; the chip
// TEXT carries the state).
const RING_AMBER_TINT = `color-mix(in srgb, ${RING_AMBER} 18%, transparent)`;
// Awaiting chip: #92400E on #FEF3C7 ≈ 7.5:1; #FCD34D on #451A03 ≈ 9.1:1.
const AWAIT_BG = 'light-dark(#FEF3C7, #451A03)';
const AWAIT_TEXT = 'light-dark(#92400E, #FCD34D)';
// Confirmed chip: #166534 on #DCFCE7 ≈ 7.0:1; #4ADE80 on #052E16 ≈ 10.2:1.
const CONFIRM_BG = 'light-dark(#DCFCE7, #052E16)';
const CONFIRM_TEXT = 'light-dark(#166534, #4ADE80)';
// Packet check + receipt check green: #15803D on the white card ≈ 4.5:1;
// #4ADE80 on the dark card ≈ 9.0:1.
const CHECK_GREEN = 'light-dark(#15803D, #4ADE80)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Shared blur chrome surface (navBar, tabBar, sticky footers).
const CHROME_SURFACE =
  'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the one-time 300ms
// ring-fill drain, sheet/action-sheet entrances, visually-hidden h1, and the
// reduced-motion guard. Transitions animate transform/opacity only.
// ---------------------------------------------------------------------------

const VOUCHLY_CSS = `
.vch-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.vch-btn:disabled { cursor: default; }
.vch-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.vch-anim { transition: transform 240ms ease, opacity 240ms ease; }
.vch-fade { transition: opacity 200ms ease; }
@keyframes vch-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.vch-sheet-in { animation: vch-sheet-in 240ms ease; }
/* One-time drain refill on send/nudge: 75.4 (empty) -> 0 (full remaining).
   Removed entirely under reduced motion — static offset still encodes it. */
@keyframes vch-ring-fill {
  from { stroke-dashoffset: 75.4; }
}
.vch-ring-fill { animation: vch-ring-fill 300ms ease; }
.vch-vh {
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
  .vch-anim, .vch-fade { transition: none; }
  .vch-sheet-in, .vch-ring-fill { animation: none; }
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
  // Scroll lock while an overlay is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px slots optically
  // align content to the 16px gutter. Hairline + blur ALWAYS ON (this
  // template does not wire scroll-under hairline state; noted per contract).
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  backBtn: {
    minWidth: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    borderRadius: 12,
    color: BRAND_ACCENT,
    paddingInlineEnd: 4,
  },
  // Previous screen's title — 13px/500 secondary, ellipsized at 96px.
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // LARGE TITLE — 52px row, References root only; scrolls away under the
  // sticky navBar while the compact title fades in.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1},
  // COVERAGE CARD — 116px: 16 pad + overline + 8 + 36 meter + 8 + caption +
  // 16 pad. Inset listCard at the 16px gutter, 12px top margin.
  coverageCard: {
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  covOverline: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  meterRow: {display: 'flex', gap: 8, height: 36, marginTop: 8},
  meterSegment: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  meterLabel: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '13px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  slotRow: {display: 'flex', gap: 1, height: 20, borderRadius: 8},
  slotConfirmed: {flex: 1, borderRadius: 3, background: BRAND_ACCENT},
  // Pending slot — 45° hatch of the brand accent over the muted fill, plus
  // the explicit ≥3:1 PENDING_BORDER boundary (see COLOR LITERALS).
  slotPending: {
    flex: 1,
    borderRadius: 3,
    backgroundImage: `repeating-linear-gradient(45deg, ${BRAND_ACCENT} 0 3px, transparent 3px 6px)`,
    backgroundColor: 'var(--color-background-muted)',
    border: `1px solid ${PENDING_BORDER}`,
  },
  slotHollow: {
    flex: 1,
    borderRadius: 3,
    border: `1.5px dashed ${HOLLOW_BORDER}`,
    background: 'transparent',
  },
  covCaption: {
    marginTop: 8,
    height: 16,
    fontSize: 13,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  // 68px inset divider for avatar-led media rows.
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // ROSTER ROW — 72px media row; swipe-reveal chrome around it.
  rowOuter: {position: 'relative'},
  rowClip: {position: 'relative', overflow: 'hidden'},
  // 72px brand Nudge block revealed at −72px (mirrored by the ellipsis
  // action sheet — the mandatory button path).
  nudgeAction: {
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
    color: BRAND_ON,
    fontSize: 13,
    fontWeight: 600,
  },
  rowContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  rowBtn: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  // 40px initials avatar — muted bg, 13/600 brand initials.
  avatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  rowText: {
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
  rowRole: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  trailingCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  // STATUS CHIP — 24px pill, 11/500; non-interactive label (the 44px hits
  // belong to the row button and the ellipsis).
  chipBase: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  chipIdle: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  chipAwaiting: {background: AWAIT_BG, color: AWAIT_TEXT},
  chipConfirmed: {background: CONFIRM_BG, color: CONFIRM_TEXT},
  // COOLDOWN RING — 28px SVG wrapping the 20px status dot.
  ringWrap: {
    position: 'relative',
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  ringDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 999,
    background: RING_AMBER_TINT,
  },
  // REQUESTS — 60px two-line rows.
  reqRow: {
    width: '100%',
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  reqStatus: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  // PACKET — 88px voucher cards at 12px gaps.
  packetStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginInline: 16,
  },
  voucherCard: {
    width: '100%',
    height: 88,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  voucherText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  voucherQuote: {
    fontSize: 13,
    fontStyle: 'italic',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  voucherCheck: {color: CHECK_GREEN, display: 'inline-flex', flexShrink: 0},
  // Sticky share/detail footer — in-flow sticky 64px above the viewport
  // bottom (tabBar height), same blur chrome as the bars.
  stickyFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 20,
    padding: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  primaryBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  footerExplain: {
    marginBottom: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  // DETAIL — person header card + 44px utility timeline rows + segmented
  // relationship picker.
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  utilityRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  utilityValue: {
    marginLeft: 'auto',
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 36px segmented control — muted track, active card pill with hairline.
  segTrack: {
    display: 'flex',
    height: 36,
    padding: 2,
    marginInline: 16,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
    gap: 2,
  },
  segBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  // EMPTY STATE (Packet, reachable by removing both confirmed refs).
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
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {
    marginTop: 4,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: '18px',
  },
  // TAB BAR — exactly 64px, 3 tabs flex:1, sticky bottom z20.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    height: 64,
    background: CHROME_SURFACE,
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
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // FAB — 56×56 radius-16 squircle. STICKY anchor (height 0, bottom 80)
  // per the amendment: absolute would pin to the DOCUMENT bottom on tall
  // scrolling views.
  fabAnchor: {
    position: 'sticky',
    bottom: 80,
    zIndex: 25,
    height: 0,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 16,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  // TOAST DOCK — the ONE polite live region; sticky-in-flow (height 0,
  // bottom 76 = 64px tabBar + 12) so it pins above the tab bar even
  // mid-scroll. Always mounted for aria-live; no auto-dismiss timers.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
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
  // SHEET — scrim z40 + sheet z41, absolute inside shell; two detents.
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
  // Sheet content — the ONE legal inner scroller; holds chips + preview +
  // the 48px Send at content end (stress: max assembly scrolls, never grows
  // the sheet past its detent).
  sheetContent: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '4px 16px 16px',
  },
  chipGroupLabel: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  chipWrap: {display: 'flex', flexWrap: 'wrap', gap: 8},
  // Chip = 44px-tall hit (6px block padding) around a 32px visual pill.
  chipHit: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  chipPill: {
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  chipPillOn: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_ACCENT,
    color: BRAND_ON,
  },
  previewCard: {
    marginTop: 16,
    padding: 16,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    fontSize: 16,
    lineHeight: '24px',
    color: 'var(--color-text-primary)',
  },
  previewCaption: {
    marginTop: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  sendBtn: {
    width: '100%',
    height: 48,
    marginTop: 16,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // In-sheet receipt state after Send.
  receiptState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
    paddingBlock: 32,
  },
  receiptCheck: {color: CHECK_GREEN, display: 'inline-flex'},
  receiptTitle: {fontSize: 17, fontWeight: 600, margin: 0, maxWidth: '100%'},
  receiptBody: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // ACTION SHEET — scrim z40 + two stacked cards at insetInline 16 /
  // bottom 16 z41; 56px centered rows; destructive last; own Cancel card.
  actionSheet: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  actionCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  actionHeader: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    borderBottom: '1px solid var(--color-border)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actionRow: {
    width: '100%',
    height: 56,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  actionRowDestructive: {color: 'var(--color-error)'},
  actionRowDisabled: {color: 'var(--color-text-secondary)'},
  actionRowNote: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginTop: 2,
  },
  actionDivider: {height: 1, background: 'var(--color-border)'},
  cancelRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts + a nine-person roster with dual fields
// (display strings beside machine fields). ARITHMETIC CROSS-CHECKS (all
// rendered numbers derive live from this table):
//   statuses  2 Confirmed + 3 Awaiting + 4 Idle = 9 rows ✓
//   relations 3 Managers + 4 Peers + 2 Direct reports = 9 ✓
//   coverage  confirmed by type 1 MGR + 1 PEER + 0 DR = 2 of 5 required
//             (REQUIREMENT 2+2+1 = 5); awaiting 1+1+1 = 3 pending ✓
//   sections  '1 OF 2' + '1 OF 2' + '0 OF 1' = 2/5 ✓
//   requests  3 active (Marcus, Jonah, Lena) + 2 completed (Dana, Priya)
//             = 5 sent records; badge = 3 Awaiting ✓
//   packet    2 vouchers = Confirmed count; badge 2; 'Share packet (2)' ✓
// POST-REPLY (RefreshCw): Confirmed 3, Awaiting 2, coverage 3/5, DR header
//   '1 OF 1', Packet badge 3, Requests badge 2, active 2 + completed 3 = 5 ✓
// POST-SEND (Elena): Awaiting 4 pre-reply, Idle 3; MGR segment stays
//   [solid|hatch] (second hatch replaces nothing — Elena's hatch is capped
//   into the open MGR slot); caption '2 of 5 confirmed · 4 pending' (caption
//   pending = raw Awaiting count per the spec's own reconciliation) ✓
// BOTH mutations: 3 Confirmed + 3 Awaiting + 3 Idle = 9 ✓, coverage 3/5,
//   Requests 3 active + 3 completed = 6 sent records ✓.
// ---------------------------------------------------------------------------

const RELATIONSHIPS = ['Manager', 'Peer', 'Direct report'] as const;
type Relationship = (typeof RELATIONSHIPS)[number];

const STATUSES = ['Idle', 'Awaiting', 'Confirmed'] as const;
type Status = (typeof STATUSES)[number];

// Requirement profile for the target role — 2/2/1, total 5.
const REQUIREMENT: Record<Relationship, number> = {
  Manager: 2,
  Peer: 2,
  'Direct report': 1,
};
const REQUIREMENT_TOTAL = 5; // 2+2+1 ✓

const TARGET_ROLE_OVERLINE = 'Senior PM · Meridian Labs';

const REL_SHORT: Record<Relationship, string> = {
  Manager: 'MGR',
  Peer: 'PEER',
  'Direct report': 'DR',
};
const REL_PLURAL: Record<Relationship, string> = {
  Manager: 'Managers',
  Peer: 'Peers',
  'Direct report': 'Direct reports',
};

interface Reference {
  id: string;
  name: string; // display
  firstName: string; // machine-ish: feeds buildMessage()
  initials: string;
  role: string; // 'VP Product · Northgate'
  relationship: Relationship;
  status: Status;
  sentOn: string | null; // 'Jun 27' — fixed display string
  repliedOn: string | null;
  lastNudge: string | null; // 'Jul 2'
  // Machine field beside the display strings: fraction of the 3-day nudge
  // cooldown REMAINING (0 = armed, 1 = full). Marcus: nudged 2d ago of 3d →
  // 1/3 remaining. Drives the ring dashoffset and the nudge gate.
  cooldownFrac: number;
  cooldownNote: string | null; // 'Nudged 2d ago · re-arms Fri'
  quote: string | null;
  removed: boolean; // Remove is a reversible flag → Undo restores exact
  // prior object AND list position (order is the fixed roster order).
}

// Elena's 28-char hyphenated surname is stress fixture 1 (single-line
// ellipsis at 320px with the trailing cluster intact); Lena's parenthetical
// role is stress fixture 2 (13px secondary ellipsis beside the ring).
const REFERENCES: Reference[] = [
  {
    id: 'dana',
    name: 'Dana Whitfield',
    firstName: 'Dana',
    initials: 'DW',
    role: 'VP Product · Northgate',
    relationship: 'Manager',
    status: 'Confirmed',
    sentOn: 'Jun 24', // spec omits send dates for completed rows; required
    repliedOn: 'Jun 30', // by the Requests row anatomy ('Sent … · Manager')
    lastNudge: null,
    cooldownFrac: 0,
    cooldownNote: null,
    quote: "One of the sharpest product minds I've managed.",
    removed: false,
  },
  {
    id: 'marcus',
    name: 'Marcus Bell',
    firstName: 'Marcus',
    initials: 'MB',
    role: 'Director of Eng · Northgate',
    relationship: 'Manager',
    status: 'Awaiting',
    sentOn: 'Jun 27',
    repliedOn: null,
    lastNudge: 'Jul 2', // 2d ago of the 3d cooldown → 1/3 remaining
    cooldownFrac: 1 / 3,
    cooldownNote: 'Nudged 2d ago · re-arms Fri',
    quote: null,
    removed: false,
  },
  {
    id: 'elena',
    name: 'Elena Torres-Konstantopoulou',
    firstName: 'Elena',
    initials: 'ET',
    role: 'Former CPO · Halbrook',
    relationship: 'Manager',
    status: 'Idle',
    sentOn: null,
    repliedOn: null,
    lastNudge: null,
    cooldownFrac: 0,
    cooldownNote: null,
    quote: null,
    removed: false,
  },
  {
    id: 'priya',
    name: 'Priya Raghavan',
    firstName: 'Priya',
    initials: 'PR',
    role: 'Staff Designer · Northgate',
    relationship: 'Peer',
    status: 'Confirmed',
    sentOn: 'Jun 25',
    repliedOn: 'Jul 1',
    lastNudge: null,
    cooldownFrac: 0,
    cooldownNote: null,
    quote: "Best cross-functional partner I've had.",
    removed: false,
  },
  {
    id: 'jonah',
    name: 'Jonah Kim',
    firstName: 'Jonah',
    initials: 'JK',
    role: 'Eng Lead · Northgate',
    relationship: 'Peer',
    status: 'Awaiting',
    sentOn: 'Jun 27',
    repliedOn: null,
    lastNudge: null, // never nudged → ARMED (swipe + action sheet + detail)
    cooldownFrac: 0,
    cooldownNote: null,
    quote: null,
    removed: false,
  },
  {
    id: 'sofia',
    name: 'Sofia Marchetti',
    firstName: 'Sofia',
    initials: 'SM',
    role: 'PMM · Halbrook',
    relationship: 'Peer',
    status: 'Idle',
    sentOn: null,
    repliedOn: null,
    lastNudge: null,
    cooldownFrac: 0,
    cooldownNote: null,
    quote: null,
    removed: false,
  },
  {
    id: 'tom',
    name: 'Tom Okafor',
    firstName: 'Tom',
    initials: 'TO',
    role: 'Data Science · Northgate',
    relationship: 'Peer',
    status: 'Idle',
    sentOn: null,
    repliedOn: null,
    lastNudge: null,
    cooldownFrac: 0,
    cooldownNote: null,
    quote: null,
    removed: false,
  },
  {
    id: 'lena',
    name: 'Lena Fischer',
    firstName: 'Lena',
    initials: 'LF',
    role: 'APM (reported to me) · Northgate',
    relationship: 'Direct report',
    status: 'Awaiting',
    sentOn: 'Jun 29',
    repliedOn: null,
    lastNudge: null, // armed — AND the scripted replier via RefreshCw
    cooldownFrac: 0,
    cooldownNote: null,
    quote: null,
    removed: false,
  },
  {
    id: 'ravi',
    name: 'Ravi Shah',
    firstName: 'Ravi',
    initials: 'RS',
    role: 'PM Intern · Northgate',
    relationship: 'Direct report',
    status: 'Idle',
    sentOn: null,
    repliedOn: null,
    lastNudge: null,
    cooldownFrac: 0,
    cooldownNote: null,
    quote: null,
    removed: false,
  },
];

const REF_ORDER = REFERENCES.map(ref => ref.id);

// The scripted reply applied by the navBar RefreshCw (once).
const LENA_QUOTE = 'She made me a better PM every week.';

// ---------------------------------------------------------------------------
// RING GEOMETRY — r=12 → circumference 2π×12 = 75.398 ≈ 75.4 (the dasharray
// everywhere, including the keyframe). dashoffset = elapsed fraction × 75.4;
// the VISIBLE arc is the time REMAINING. Marcus (1/3 remaining): visible arc
// 75.4 × 1/3 = 25.13, dashoffset 75.4 × 2/3 = 50.27 ✓. Freshly sent/nudged
// (frac 1): dashoffset 0 → full 75.4 arc.
// ---------------------------------------------------------------------------

const RING_R = 12;
const RING_C = 75.4;

// ---------------------------------------------------------------------------
// DERIVATIONS — every rendered number derives live from the roster map;
// nothing is stored twice.
// ---------------------------------------------------------------------------

type RefMap = Record<string, Reference>;

function visibleRefs(refs: RefMap): Reference[] {
  return REF_ORDER.map(id => refs[id]).filter(ref => !ref.removed);
}

interface Coverage {
  // Per relationship: required slots split into solid/hatch/hollow.
  slots: Record<Relationship, {solid: number; hatch: number; hollow: number}>;
  confirmedByRel: Record<Relationship, number>;
  confirmedTotal: number; // capped at REQUIREMENT per type; max 5
  awaitingTotal: number; // RAW Awaiting count (the caption's 'N pending')
}

function deriveCoverage(refs: RefMap): Coverage {
  const slots = {} as Coverage['slots'];
  const confirmedByRel = {} as Coverage['confirmedByRel'];
  let confirmedTotal = 0;
  let awaitingTotal = 0;
  for (const rel of RELATIONSHIPS) {
    const ofRel = visibleRefs(refs).filter(ref => ref.relationship === rel);
    const confirmed = ofRel.filter(ref => ref.status === 'Confirmed').length;
    const awaiting = ofRel.filter(ref => ref.status === 'Awaiting').length;
    const req = REQUIREMENT[rel];
    const solid = Math.min(confirmed, req);
    const hatch = Math.min(awaiting, req - solid);
    slots[rel] = {solid, hatch, hollow: req - solid - hatch};
    confirmedByRel[rel] = confirmed;
    confirmedTotal += solid;
    awaitingTotal += awaiting;
  }
  return {slots, confirmedByRel, confirmedTotal, awaitingTotal};
}

/** The nudge gate. Spec's law is `Awaiting && lastNudge === null`; this
 * generalizes it to `Awaiting && cooldownFrac === 0` so the freshly-sent
 * FULL ring (spec: 'freshly sent → full 75.4') and the gate agree —
 * identical for every initial fixture (Marcus gated; Jonah, Lena armed). */
function canNudge(ref: Reference): boolean {
  return ref.status === 'Awaiting' && ref.cooldownFrac === 0;
}

interface ComposeChips {
  deadline: 'jul18' | 'norush';
  tone: 'warm' | 'formal';
  shared: boolean;
  call: boolean;
}

const DEFAULT_CHIPS: ComposeChips = {
  deadline: 'jul18',
  tone: 'warm',
  shared: false,
  call: false,
};

/** Pure chip → message assembly; the preview re-flows synchronously from
 * this on every chip toggle. Max assembly (all chips on) ≈ 5 sentences /
 * ~340 chars — stress fixture 3: it must SCROLL inside the sheet content,
 * never grow the sheet past its detent. Minimal ('no rush', Formal, no
 * toggles) proves assembly downward too. */
function buildMessage(first: string, chips: ComposeChips): string {
  const shared = chips.shared
    ? ', especially the Halbrook replatform we shipped together'
    : '';
  const sentences = [
    `Hi ${first} — I'm finalizing references for the Senior PM role at Meridian Labs.`,
    `Could you vouch for our work together${shared}?`,
  ];
  if (chips.call) {
    sentences.push(
      "If it's easier to talk it through, I'm happy to set up a quick call.",
    );
  }
  sentences.push(
    chips.deadline === 'jul18'
      ? 'The hiring team is hoping to hear back by Jul 18.'
      : "There's no rush — whenever works for you.",
  );
  sentences.push(
    chips.tone === 'warm'
      ? 'Thank you so much — this means a lot.'
      : 'Thank you for your consideration.',
  );
  return sentences.join(' ');
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useReducer over {references, ui}. One mutation verb
// update(id, patch) plus uiSet(patch); every consequence (coverage, badges,
// section counts, packet list, request groups) is DERIVED from the roster
// map — never stored twice. Remove is a reversible `removed` flag, so Undo
// restores the exact prior object and list position in one assignment.
// ---------------------------------------------------------------------------

type TabId = 'references' | 'requests' | 'packet';

interface SheetState {
  targetId: string;
  detent: 'medium' | 'large';
  chips: ComposeChips;
  sent: boolean;
}

interface ToastState {
  seq: number;
  msg: string;
  undoId: string | null; // Remove gets Undo; Send/Nudge do not
}

interface UiState {
  tab: TabId;
  screenByTab: Record<TabId, string>; // 'root' | `detail:${id}`
  sheet: SheetState | null;
  actionSheetFor: string | null;
  swipeOpenId: string | null;
  toast: ToastState | null;
  refreshUsed: boolean;
}

interface VouchlyState {
  references: RefMap;
  ui: UiState;
}

type VouchlyAction =
  | {type: 'update'; id: string; patch: Partial<Reference>}
  | {type: 'ui'; patch: Partial<UiState>};

const INITIAL_STATE: VouchlyState = {
  references: Object.fromEntries(REFERENCES.map(ref => [ref.id, ref])),
  ui: {
    tab: 'references',
    screenByTab: {references: 'root', requests: 'root', packet: 'root'},
    sheet: null,
    actionSheetFor: null,
    swipeOpenId: null,
    toast: null,
    refreshUsed: false,
  },
};

function vouchlyReducer(state: VouchlyState, action: VouchlyAction): VouchlyState {
  if (action.type === 'update') {
    return {
      ...state,
      references: {
        ...state.references,
        [action.id]: {...state.references[action.id], ...action.patch},
      },
    };
  }
  return {...state, ui: {...state.ui, ...action.patch}};
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

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — sheets/action sheets trap focus while open; Escape
// closes the TOPMOST overlay only (actionSheet > sheet); focus restores to
// the opener on every close path; focus moves IN with preventScroll (the
// amendment — plain .focus() scroll-reveals the animating sheet inside the
// locked overflow-hidden column).
// ---------------------------------------------------------------------------

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
// BRAND MARK — 24px Vouchly glyph in the 44×44 nav slot: two overlapping
// rounded speech bubbles, back bubble stroked in var(--color-text-primary)
// (per spec — never var(--color-text)), front bubble BRAND_ACCENT with a
// BRAND_ON check (#FFF on #7C3AED ≈ 5.9:1).
// ---------------------------------------------------------------------------

function BrandMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4.5 3.5h9a2.5 2.5 0 0 1 2.5 2.5v4.5a2.5 2.5 0 0 1-2.5 2.5H9.2L6 15.6V13h-1.5A2.5 2.5 0 0 1 2 10.5V6a2.5 2.5 0 0 1 2.5-2.5Z"
          stroke="var(--color-text-primary)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <path
          d="M11.5 9h8a2.5 2.5 0 0 1 2.5 2.5V16a2.5 2.5 0 0 1-2.5 2.5H18v2.6l-3.2-2.6h-3.3A2.5 2.5 0 0 1 9 16v-4.5A2.5 2.5 0 0 1 11.5 9Z"
          fill={BRAND_ACCENT}
        />
        <path
          d="m13.4 13.6 1.6 1.6 3.1-3.1"
          stroke={BRAND_ON}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// COVERAGE METER — three-segment typed gauge; each required slot renders as
// an equal sub-block: solid = confirmed, hatch+border = pending, dashed
// hollow = unasked. role='img' with the full label; updates announce
// through the ONE toast dock, never here.
// ---------------------------------------------------------------------------

function CoverageMeter({coverage}: {coverage: Coverage}) {
  const label = `Coverage: ${coverage.confirmedTotal} of ${REQUIREMENT_TOTAL} confirmed, ${coverage.awaitingTotal} pending`;
  return (
    <div role="img" aria-label={label}>
      <div style={styles.meterRow}>
        {RELATIONSHIPS.map(rel => {
          const {solid, hatch, hollow} = coverage.slots[rel];
          const blocks: ReactNode[] = [];
          for (let i = 0; i < solid; i++) {
            blocks.push(<span key={`s${i}`} style={styles.slotConfirmed} />);
          }
          for (let i = 0; i < hatch; i++) {
            blocks.push(<span key={`p${i}`} style={styles.slotPending} />);
          }
          for (let i = 0; i < hollow; i++) {
            blocks.push(<span key={`h${i}`} style={styles.slotHollow} />);
          }
          return (
            <div key={rel} style={styles.meterSegment}>
              <span style={styles.meterLabel}>
                {REL_SHORT[rel]} {solid}/{REQUIREMENT[rel]}
              </span>
              <div style={styles.slotRow}>{blocks}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COOLDOWN RING — 28px SVG wrapping the 20px status dot. Track = hairline
// (passive), arc = RING_AMBER (meaning-bearing, explicit pair). Renders only
// while a cooldown is live (frac > 0); armed rows show the chip alone. The
// ring is aria-hidden decoration — the gated Nudge button carries the
// visible explanation text as its description.
// ---------------------------------------------------------------------------

function CooldownRing({fracRemaining, animateIn}: {fracRemaining: number; animateIn: boolean}) {
  // dashoffset = elapsed × C. Marcus 1/3 remaining → 50.27 (arc 25.13 ✓).
  const offset = (1 - fracRemaining) * RING_C;
  return (
    <span style={styles.ringWrap} aria-hidden>
      <span style={styles.ringDot} />
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <circle cx={14} cy={14} r={RING_R} stroke="var(--color-border)" strokeWidth={2.5} />
        <circle
          cx={14}
          cy={14}
          r={RING_R}
          stroke={RING_AMBER}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={offset}
          transform="rotate(-90 14 14)"
          className={animateIn ? 'vch-ring-fill' : undefined}
        />
      </svg>
    </span>
  );
}

function StatusChip({status}: {status: Status}) {
  const variant =
    status === 'Confirmed'
      ? styles.chipConfirmed
      : status === 'Awaiting'
        ? styles.chipAwaiting
        : styles.chipIdle;
  return <span style={{...styles.chipBase, ...variant}}>{status === 'Idle' ? 'Not asked' : status}</span>;
}

// ---------------------------------------------------------------------------
// ROSTER ROW — 72px media row; horizontal pointer drag reveals the 72px
// brand Nudge block ONLY while the nudge is armed (snap open at −72; one
// row open at a time), mirrored exactly by the mandatory 44×44 ellipsis
// action sheet. The row is a single <button> named by its primary text; the
// ellipsis is a SIBLING, never nested. Runtime sends/nudges (fixed 'Jul 4'
// strings) trigger the one-time 300ms ring refill.
// ---------------------------------------------------------------------------

interface RosterRowProps {
  reference: Reference;
  isSwipeOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onRowTap: () => void;
  onEllipsis: (opener: HTMLElement) => void;
  onNudge: () => void;
}

function RosterRow({
  reference,
  isSwipeOpen,
  isLast,
  reducedMotion,
  onSwipeOpen,
  onSwipeClose,
  onRowTap,
  onEllipsis,
  onNudge,
}: RosterRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const swipeable = canNudge(reference);
  const base = isSwipeOpen && swipeable ? -72 : 0;
  const offset = dragX != null ? Math.max(-72, Math.min(0, base + dragX)) : base;
  const animateRing =
    reference.cooldownFrac === 1 &&
    (reference.sentOn === 'Jul 4' || reference.lastNudge === 'Jul 4') &&
    !reducedMotion;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!swipeable) return;
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

  return (
    <div style={styles.rowOuter}>
      <div style={styles.rowClip}>
        {swipeable ? (
          <button
            type="button"
            className="vch-btn"
            style={styles.nudgeAction}
            tabIndex={isSwipeOpen ? 0 : -1}
            aria-hidden={!isSwipeOpen}
            onClick={onNudge}>
            <Icon icon={BellRingIcon} size="md" color="inherit" />
            Nudge
          </button>
        ) : null}
        <div
          style={{
            ...styles.rowContent,
            transform: offset !== 0 ? `translateX(${offset}px)` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 240ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="vch-btn vch-focusable"
            style={styles.rowBtn}
            aria-label={reference.name}
            onClick={guardClick(() => onRowTap())}>
            <span style={styles.avatar} aria-hidden>
              {reference.initials}
            </span>
            <span style={styles.rowText}>
              <span style={styles.rowName}>{reference.name}</span>
              <span style={styles.rowRole}>{reference.role}</span>
            </span>
            <span style={styles.trailingCluster}>
              <StatusChip status={reference.status} />
              {reference.cooldownFrac > 0 ? (
                <CooldownRing fracRemaining={reference.cooldownFrac} animateIn={animateRing} />
              ) : null}
            </span>
          </button>
          <button
            type="button"
            className="vch-btn vch-focusable"
            style={styles.iconBtn}
            aria-label={`Actions for ${reference.name}`}
            aria-haspopup="dialog"
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
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; drag between detents is garnish, >120px past medium
// closes), 52px header with 44×44 X, focus-trapped dialog. Detents are % of
// the LOCKED 100dvh shell, so they hold at any stage height.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, children}: SheetProps) {
  // Transient pointer-drag delta only — the detent itself lives in the
  // single state owner.
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
    if (!movedRef.current) return; // plain click → toggle handled by onClick
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
      className="vch-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease, height 240ms ease',
      }}>
      <button
        type="button"
        className="vch-btn vch-focusable"
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
        <button
          type="button"
          className="vch-btn vch-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CHIP GROUP — 32px pills inside 44px hits; radios get arrow-key movement,
// toggles are role=checkbox; locked chips render selected + aria-disabled.
// ---------------------------------------------------------------------------

interface ChipOption {
  id: string;
  label: string;
  selected: boolean;
  locked?: boolean;
}

interface ChipGroupProps {
  label: string;
  role: 'radiogroup' | 'group';
  options: ChipOption[];
  onSelect: (id: string) => void;
}

function ChipGroup({label, role, options, onSelect}: ChipGroupProps) {
  const chipRole = role === 'radiogroup' ? 'radio' : 'checkbox';
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (role !== 'radiogroup') return;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const index = options.findIndex(option => option.selected);
    const delta = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const next = options[(index + delta + options.length) % options.length];
    if (!next.locked) onSelect(next.id);
  };
  return (
    <div>
      <div style={styles.chipGroupLabel}>{label}</div>
      <div role={role} aria-label={label} style={styles.chipWrap} onKeyDown={onKeyDown}>
        {options.map(option => (
          <button
            key={option.id}
            type="button"
            role={chipRole}
            aria-checked={option.selected}
            aria-disabled={option.locked === true ? true : undefined}
            className="vch-btn vch-focusable"
            style={styles.chipHit}
            onClick={() => {
              if (!option.locked) onSelect(option.id);
            }}>
            <span style={{...styles.chipPill, ...(option.selected ? styles.chipPillOn : null)}}>
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — the phone's verb-picker: context header, ≤4 rows (Send
// request / Nudge / View details / Remove-destructive-last), own Cancel
// card. Focus lands on Cancel (the safe default); Tab is trapped; scrim,
// Cancel, and Escape all close with no action.
// ---------------------------------------------------------------------------

interface ActionSheetProps {
  reference: Reference;
  containerRef: RefObject<HTMLDivElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
  onRequest: () => void;
  onNudge: () => void;
  onDetails: () => void;
  onRemove: () => void;
  onCancel: () => void;
}

function ActionSheet({
  reference,
  containerRef,
  cancelRef,
  onRequest,
  onNudge,
  onDetails,
  onRemove,
  onCancel,
}: ActionSheetProps) {
  const nudgeGated = reference.status === 'Awaiting' && !canNudge(reference);
  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Actions for ${reference.name}`}
      style={styles.actionSheet}
      onKeyDown={event => trapTabKey(event, containerRef.current)}
      className="vch-sheet-in">
      <div style={styles.actionCard}>
        <div style={styles.actionHeader}>
          {reference.name} · {reference.relationship}
        </div>
        {reference.status === 'Idle' ? (
          <>
            <button type="button" className="vch-btn vch-focusable" style={styles.actionRow} onClick={onRequest}>
              Send request
            </button>
            <div style={styles.actionDivider} />
          </>
        ) : null}
        {reference.status === 'Awaiting' ? (
          <>
            <button
              type="button"
              className="vch-btn vch-focusable"
              style={{...styles.actionRow, ...(nudgeGated ? styles.actionRowDisabled : null)}}
              aria-disabled={nudgeGated || undefined}
              aria-describedby={nudgeGated && reference.cooldownNote != null ? 'vch-nudge-note' : undefined}
              onClick={() => {
                if (!nudgeGated) onNudge();
              }}>
              Nudge
              {nudgeGated && reference.cooldownNote != null ? (
                <span id="vch-nudge-note" style={styles.actionRowNote}>
                  {reference.cooldownNote}
                </span>
              ) : null}
            </button>
            <div style={styles.actionDivider} />
          </>
        ) : null}
        <button type="button" className="vch-btn vch-focusable" style={styles.actionRow} onClick={onDetails}>
          View details
        </button>
        <div style={styles.actionDivider} />
        <button
          type="button"
          className="vch-btn vch-focusable"
          style={{...styles.actionRow, ...styles.actionRowDestructive}}
          onClick={onRemove}>
          Remove
        </button>
      </div>
      <div style={styles.actionCard}>
        <button ref={cancelRef} type="button" className="vch-btn vch-focusable" style={styles.cancelRow} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: typeof UsersIcon}> = [
  {id: 'references', label: 'References', icon: UsersIcon},
  {id: 'requests', label: 'Requests', icon: SendIcon},
  {id: 'packet', label: 'Packet', icon: BriefcaseIcon},
];

export default function MobileReferenceRequestManager() {
  const [state, dispatch] = useReducer(vouchlyReducer, INITIAL_STATE);
  const {references, ui} = state;

  const update = useCallback((id: string, patch: Partial<Reference>) => {
    dispatch({type: 'update', id, patch});
  }, []);
  const uiSet = useCallback((patch: Partial<UiState>) => {
    dispatch({type: 'ui', patch});
  }, []);

  // Container width (desktop stage detection) + reduced motion.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const width = useElementWidth(wrapRef);
  const viewportWide = useMediaQuery('(min-width: 720px)');
  const isDesktop = width > 0 ? width >= 720 : viewportWide;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const shellRef = useRef<HTMLDivElement | null>(null);
  const navBarRef = useRef<HTMLElement | null>(null);
  const largeTitleRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);
  // Per-tab scroll persistence (ergonomics law 2) — transient, so a ref.
  const scrollByTabRef = useRef<Record<TabId, number>>({references: 0, requests: 0, packet: 0});

  const nextToast = useCallback((msg: string, undoId: string | null = null): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, undoId};
  }, []);

  // Derivations — everything on screen recomputes from the roster map.
  const visible = visibleRefs(references);
  const coverage = deriveCoverage(references);
  const sentRecords = visible.filter(ref => ref.sentOn != null);
  const activeRequests = sentRecords.filter(ref => ref.status === 'Awaiting');
  const completedRequests = sentRecords.filter(ref => ref.status === 'Confirmed');
  const packet = visible.filter(ref => ref.status === 'Confirmed');
  const firstIdle = visible.find(ref => ref.status === 'Idle') ?? null;

  const screen = ui.screenByTab[ui.tab];
  const detailId = screen.startsWith('detail:') ? screen.slice('detail:'.length) : null;
  const detail = detailId != null && references[detailId] != null && !references[detailId].removed ? references[detailId] : null;
  const isReferencesRoot = ui.tab === 'references' && detail == null;
  const rootTitle = ui.tab === 'references' ? 'References' : ui.tab === 'requests' ? 'Requests' : 'Packet';
  const navTitle = detail != null ? 'Reference' : rootTitle;

  const sheetOpen = ui.sheet != null;
  const actionOpen = ui.actionSheetFor != null;
  const overlayOpen = sheetOpen || actionOpen;

  // The demo's outer scroller (.preview-wrap scrolls the page; fall back to
  // the document scroller).
  const getScroller = useCallback((): HTMLElement | null => {
    const fromWrap = shellRef.current?.closest('.preview-wrap');
    if (fromWrap instanceof HTMLElement) return fromWrap;
    return document.scrollingElement instanceof HTMLElement ? document.scrollingElement : null;
  }, []);

  // Large-title collapse — the compact navBar title fades 0→1 once the
  // large title has scrolled under the navBar (rect comparison on the
  // capture-phase scroll event covers both window and .preview-wrap
  // scrolling; passive per best practice).
  const [titleUnderNav, setTitleUnderNav] = useState(false);
  useEffect(() => {
    const handler = () => {
      const largeTitle = largeTitleRef.current;
      const navBar = navBarRef.current;
      if (largeTitle == null || navBar == null) return;
      setTitleUnderNav(largeTitle.getBoundingClientRect().bottom <= navBar.getBoundingClientRect().bottom);
    };
    handler();
    window.addEventListener('scroll', handler, {capture: true, passive: true});
    return () => window.removeEventListener('scroll', handler, {capture: true});
  }, [isReferencesRoot]);
  const compactTitleVisible = isReferencesRoot ? titleUnderNav : true;

  // ---- Mutations ---------------------------------------------------------

  const openCompose = useCallback(
    (targetId: string, opener?: HTMLElement) => {
      if (opener != null) openerRef.current = opener;
      uiSet({
        sheet: {targetId, detent: 'medium', chips: DEFAULT_CHIPS, sent: false},
        actionSheetFor: null,
        swipeOpenId: null,
      });
    },
    [uiSet],
  );

  const closeSheet = useCallback(() => {
    uiSet({sheet: null});
    openerRef.current?.focus();
  }, [uiSet]);

  const closeActionSheet = useCallback(() => {
    uiSet({actionSheetFor: null});
    openerRef.current?.focus();
  }, [uiSet]);

  const sendRequest = useCallback(() => {
    const sheet = ui.sheet;
    if (sheet == null || sheet.sent) return;
    const target = references[sheet.targetId];
    // Send starts the 3-day cooldown (full ring; fixed 'Jul 4' strings).
    update(target.id, {
      status: 'Awaiting',
      sentOn: 'Jul 4',
      cooldownFrac: 1,
      cooldownNote: 'Sent today · re-arms Mon',
    });
    // Send is NOT reversible → no Undo (Remove is, and gets one).
    uiSet({sheet: {...sheet, sent: true}, toast: nextToast(`Request sent to ${target.name}`)});
  }, [ui.sheet, references, update, uiSet, nextToast]);

  const doNudge = useCallback(
    (id: string) => {
      const wasActionSheet = ui.actionSheetFor != null;
      update(id, {lastNudge: 'Jul 4', cooldownFrac: 1, cooldownNote: 'Nudged today · re-arms Mon'});
      uiSet({swipeOpenId: null, actionSheetFor: null, toast: nextToast(`Nudged ${references[id].name}`)});
      if (wasActionSheet) openerRef.current?.focus();
    },
    [ui.actionSheetFor, references, update, uiSet, nextToast],
  );

  const doRemove = useCallback(
    (id: string) => {
      // Reversible → execute immediately + Undo (never a confirm dialog).
      update(id, {removed: true});
      uiSet({actionSheetFor: null, swipeOpenId: null, toast: nextToast('Removed from list', id)});
    },
    [update, uiSet, nextToast],
  );

  const doUndo = useCallback(() => {
    const undoId = ui.toast?.undoId;
    if (undoId == null) return;
    // Restores the exact prior object AND list position (order is the
    // fixed roster order; removal was only a flag).
    update(undoId, {removed: false});
    uiSet({toast: nextToast('Restored')});
  }, [ui.toast, update, uiSet, nextToast]);

  const onRefresh = useCallback(() => {
    const lena = references.lena;
    if (!ui.refreshUsed && lena != null && !lena.removed && lena.status === 'Awaiting') {
      // THE SCRIPTED REPLY (once): Lena confirms with her quote.
      const after = deriveCoverage({
        ...references,
        lena: {...lena, status: 'Confirmed'},
      });
      update('lena', {
        status: 'Confirmed',
        repliedOn: 'Jul 4',
        quote: LENA_QUOTE,
        cooldownFrac: 0,
        cooldownNote: null,
      });
      uiSet({
        refreshUsed: true,
        toast: nextToast(
          `Updated just now · Lena Fischer confirmed — coverage ${after.confirmedTotal} of ${REQUIREMENT_TOTAL}`,
        ),
      });
    } else {
      uiSet({toast: nextToast('Updated just now')});
    }
  }, [references, ui.refreshUsed, update, uiSet, nextToast]);

  const pushDetail = useCallback(
    (id: string) => {
      uiSet({
        screenByTab: {...ui.screenByTab, [ui.tab]: `detail:${id}`},
        actionSheetFor: null,
        swipeOpenId: null,
      });
    },
    [ui.screenByTab, ui.tab, uiSet],
  );

  const popDetail = useCallback(() => {
    uiSet({screenByTab: {...ui.screenByTab, [ui.tab]: 'root'}});
  }, [ui.screenByTab, ui.tab, uiSet]);

  const switchTab = useCallback(
    (tab: TabId) => {
      const scroller = getScroller();
      if (tab === ui.tab) {
        // THE ONE LEGAL RESET: re-tapping the active tab pops to root and
        // scrolls to top (also the keyboard user's fast exit).
        uiSet({screenByTab: {...ui.screenByTab, [tab]: 'root'}, swipeOpenId: null});
        scroller?.scrollTo({top: 0});
        return;
      }
      if (scroller != null) scrollByTabRef.current[ui.tab] = scroller.scrollTop;
      // Overlays close on tab switch; the toast dock persists; per-tab
      // screens and scroll positions survive (never reset here).
      uiSet({tab, sheet: null, actionSheetFor: null, swipeOpenId: null});
    },
    [ui.tab, ui.screenByTab, uiSet, getScroller],
  );

  // Restore the entered tab's scroll position.
  useEffect(() => {
    const scroller = getScroller();
    scroller?.scrollTo({top: scrollByTabRef.current[ui.tab]});
  }, [ui.tab, getScroller]);

  // Focus moves INTO overlays with preventScroll (amendment) and back to
  // the opener on every close path.
  useEffect(() => {
    if (sheetOpen) sheetRef.current?.focus({preventScroll: true});
  }, [sheetOpen]);
  useEffect(() => {
    if (actionOpen) cancelRef.current?.focus({preventScroll: true});
  }, [actionOpen]);

  // Escape closes the TOPMOST overlay only (actionSheet > sheet).
  useEffect(() => {
    if (!overlayOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (actionOpen) closeActionSheet();
      else closeSheet();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [overlayOpen, actionOpen, closeActionSheet, closeSheet]);

  // Tab bar arrow keys (tablist law).
  const onTabBarKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
    switchTab(TABS[next].id);
  };

  // ---- Screen renderers (plain functions, not nested components) ---------

  const renderRosterSection = (rel: Relationship) => {
    const ofRel = visible.filter(ref => ref.relationship === rel);
    return (
      <section key={rel} aria-label={REL_PLURAL[rel]}>
        <h2 style={styles.sectionHeader}>
          {REL_PLURAL[rel]} · {coverage.confirmedByRel[rel]} of {REQUIREMENT[rel]} confirmed
        </h2>
        <div style={styles.listCard}>
          {ofRel.length === 0 ? (
            <div style={{...styles.utilityRow, color: 'var(--color-text-secondary)', fontSize: 13}}>
              No one listed
            </div>
          ) : (
            ofRel.map((reference, index) => (
              <RosterRow
                key={reference.id}
                reference={reference}
                isSwipeOpen={ui.swipeOpenId === reference.id}
                isLast={index === ofRel.length - 1}
                reducedMotion={reducedMotion}
                onSwipeOpen={() => uiSet({swipeOpenId: reference.id})}
                onSwipeClose={() => uiSet({swipeOpenId: null})}
                onRowTap={() => pushDetail(reference.id)}
                onEllipsis={opener => {
                  openerRef.current = opener;
                  uiSet({actionSheetFor: reference.id, swipeOpenId: null});
                }}
                onNudge={() => doNudge(reference.id)}
              />
            ))
          )}
        </div>
      </section>
    );
  };

  const renderReferencesRoot = () => (
    <>
      <div ref={largeTitleRef} style={styles.largeTitle}>
        <h1 style={styles.largeTitleText}>References</h1>
      </div>
      <section style={styles.coverageCard} aria-label="Coverage against the requirement profile">
        <div style={styles.covOverline}>{TARGET_ROLE_OVERLINE}</div>
        <CoverageMeter coverage={coverage} />
        <div style={styles.covCaption}>
          {coverage.confirmedTotal} of {REQUIREMENT_TOTAL} confirmed · {coverage.awaitingTotal} pending
        </div>
      </section>
      {RELATIONSHIPS.map(renderRosterSection)}
      <div style={{height: 24}} />
    </>
  );

  const renderRequestRow = (reference: Reference, index: number, list: Reference[]) => (
    <div key={reference.id}>
      <button
        type="button"
        className="vch-btn vch-focusable"
        style={styles.reqRow}
        aria-label={reference.name}
        onClick={() => pushDetail(reference.id)}>
        <span style={styles.rowText}>
          <span style={styles.rowName}>{reference.name}</span>
          <span style={styles.rowRole}>
            Sent {reference.sentOn} · {reference.relationship}
          </span>
        </span>
        <span style={styles.reqStatus}>
          {reference.status === 'Confirmed' ? `Replied ${reference.repliedOn}` : 'Awaiting'}
        </span>
      </button>
      {index === list.length - 1 ? null : <div style={styles.rowDivider} />}
    </div>
  );

  const renderRequestsRoot = () => (
    <>
      <h1 className="vch-vh">Requests</h1>
      <section aria-label="Active requests">
        <h2 style={styles.sectionHeader}>Active · {activeRequests.length}</h2>
        <div style={styles.listCard}>
          {activeRequests.length === 0 ? (
            <div style={{...styles.utilityRow, color: 'var(--color-text-secondary)', fontSize: 13}}>
              No active requests
            </div>
          ) : (
            activeRequests.map((reference, index) => renderRequestRow(reference, index, activeRequests))
          )}
        </div>
      </section>
      <section aria-label="Completed requests">
        <h2 style={styles.sectionHeader}>Completed · {completedRequests.length}</h2>
        <div style={styles.listCard}>
          {completedRequests.length === 0 ? (
            <div style={{...styles.utilityRow, color: 'var(--color-text-secondary)', fontSize: 13}}>
              No replies yet
            </div>
          ) : (
            completedRequests.map((reference, index) => renderRequestRow(reference, index, completedRequests))
          )}
        </div>
      </section>
      <div style={{height: 24}} />
    </>
  );

  const renderPacketRoot = () => (
    <>
      <h1 className="vch-vh">Packet</h1>
      {packet.length === 0 ? (
        // TRUE-EMPTY anatomy (reachable by removing both confirmed refs);
        // no button — Share is the primary verb only when populated.
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={BriefcaseIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.emptyTitle}>No confirmed vouchers</h2>
          <p style={styles.emptyBody}>Confirmations land here, ready to share.</p>
        </div>
      ) : (
        <>
          <h2 style={styles.sectionHeader}>Confirmed · {packet.length}</h2>
          <div style={styles.packetStack}>
            {packet.map(reference => (
              <button
                key={reference.id}
                type="button"
                className="vch-btn vch-focusable"
                style={styles.voucherCard}
                aria-label={`${reference.name}, confirmed`}
                onClick={() => pushDetail(reference.id)}>
                <span style={styles.avatar} aria-hidden>
                  {reference.initials}
                </span>
                <span style={styles.voucherText}>
                  <span style={styles.rowName}>{reference.name}</span>
                  <span style={styles.rowRole}>
                    {reference.relationship} · {reference.role}
                  </span>
                  <span style={styles.voucherQuote}>“{reference.quote}”</span>
                </span>
                <span style={styles.voucherCheck}>
                  <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
                </span>
              </button>
            ))}
          </div>
          <div style={{height: 24}} />
        </>
      )}
    </>
  );

  const renderDetail = (reference: Reference) => {
    const events: Array<{id: string; label: string; value: string}> = [];
    if (reference.sentOn != null) events.push({id: 'sent', label: 'Requested', value: reference.sentOn});
    if (reference.lastNudge != null) events.push({id: 'nudge', label: 'Nudged', value: reference.lastNudge});
    if (reference.repliedOn != null) events.push({id: 'reply', label: 'Replied', value: reference.repliedOn});
    return (
      <>
        <h1 className="vch-vh">Reference detail</h1>
        <div style={{...styles.listCard, marginTop: 12}}>
          <div style={styles.detailHeader}>
            <span style={styles.avatar} aria-hidden>
              {reference.initials}
            </span>
            <span style={styles.rowText}>
              <span style={{...styles.rowName, fontSize: 17, fontWeight: 600}}>{reference.name}</span>
              <span style={styles.rowRole}>{reference.role}</span>
            </span>
            <StatusChip status={reference.status} />
          </div>
        </div>
        <section aria-label="Timeline">
          <h2 style={styles.sectionHeader}>Timeline</h2>
          <div style={styles.listCard}>
            {events.length === 0 ? (
              <div style={{...styles.utilityRow, color: 'var(--color-text-secondary)'}}>Not asked yet</div>
            ) : (
              events.map((event, index) => (
                <div key={event.id}>
                  <div style={styles.utilityRow}>
                    {event.label}
                    <span style={styles.utilityValue}>{event.value}</span>
                  </div>
                  {index === events.length - 1 ? null : <div style={styles.rowDivider} />}
                </div>
              ))
            )}
          </div>
        </section>
        <section aria-label="Relationship">
          <h2 style={styles.sectionHeader}>Relationship</h2>
          <div
            style={styles.segTrack}
            role="radiogroup"
            aria-label="Relationship type"
            onKeyDown={event => {
              if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
              event.preventDefault();
              const index = RELATIONSHIPS.indexOf(reference.relationship);
              const delta = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
              const next = RELATIONSHIPS[(index + delta + RELATIONSHIPS.length) % RELATIONSHIPS.length];
              update(reference.id, {relationship: next});
            }}>
            {RELATIONSHIPS.map(rel => (
              <button
                key={rel}
                type="button"
                role="radio"
                aria-checked={reference.relationship === rel}
                className="vch-btn vch-focusable"
                style={{...styles.segBtn, ...(reference.relationship === rel ? styles.segBtnActive : null)}}
                onClick={() => update(reference.id, {relationship: rel})}>
                {rel}
              </button>
            ))}
          </div>
        </section>
        <div style={{height: 24}} />
      </>
    );
  };

  const renderDetailFooter = (reference: Reference) => {
    const gated = reference.status === 'Awaiting' && !canNudge(reference);
    return (
      <div style={styles.stickyFooter}>
        {gated && reference.cooldownNote != null ? (
          <div style={styles.footerExplain} id="vch-footer-cooldown">
            {reference.cooldownNote}
          </div>
        ) : null}
        {reference.status === 'Idle' ? (
          <button
            type="button"
            className="vch-btn vch-focusable"
            style={styles.primaryBtn}
            onClick={event => openCompose(reference.id, event.currentTarget)}>
            Send request
          </button>
        ) : reference.status === 'Confirmed' ? (
          <button
            type="button"
            className="vch-btn vch-focusable"
            style={styles.primaryBtn}
            onClick={() => switchTab('packet')}>
            View in Packet
          </button>
        ) : (
          <button
            type="button"
            className="vch-btn vch-focusable"
            style={{...styles.primaryBtn, ...(gated ? styles.primaryBtnDisabled : null)}}
            aria-disabled={gated || undefined}
            aria-describedby={gated ? 'vch-footer-cooldown' : undefined}
            onClick={() => {
              if (!gated) doNudge(reference.id);
            }}>
            Nudge
          </button>
        )}
      </div>
    );
  };

  // ---- Compose sheet content ----------------------------------------------

  const sheetTarget = ui.sheet != null ? references[ui.sheet.targetId] : null;
  const setChips = (patch: Partial<ComposeChips>) => {
    if (ui.sheet == null) return;
    uiSet({sheet: {...ui.sheet, chips: {...ui.sheet.chips, ...patch}}});
  };

  const renderComposeContent = () => {
    if (ui.sheet == null || sheetTarget == null) return null;
    if (ui.sheet.sent) {
      return (
        <div style={styles.sheetContent}>
          <div style={styles.receiptState}>
            <span style={styles.receiptCheck}>
              <Icon icon={CheckCircle2Icon} size="lg" color="inherit" />
            </span>
            <h3 style={styles.receiptTitle}>Request sent to {sheetTarget.firstName}</h3>
            <div style={styles.receiptBody}>Sent Jul 4 · awaiting reply</div>
            <button
              type="button"
              className="vch-btn vch-focusable"
              style={{...styles.primaryBtn, marginTop: 16}}
              onClick={closeSheet}>
              Done
            </button>
          </div>
        </div>
      );
    }
    const chips = ui.sheet.chips;
    return (
      <div style={styles.sheetContent}>
        <ChipGroup
          label="Role"
          role="group"
          options={[{id: 'role', label: 'Senior PM', selected: true, locked: true}]}
          onSelect={() => undefined}
        />
        <ChipGroup
          label="Company"
          role="group"
          options={[{id: 'company', label: 'Meridian Labs', selected: true, locked: true}]}
          onSelect={() => undefined}
        />
        <ChipGroup
          label="Deadline"
          role="radiogroup"
          options={[
            {id: 'jul18', label: 'by Jul 18', selected: chips.deadline === 'jul18'},
            {id: 'norush', label: 'no rush', selected: chips.deadline === 'norush'},
          ]}
          onSelect={id => setChips({deadline: id as ComposeChips['deadline']})}
        />
        <ChipGroup
          label="Tone"
          role="radiogroup"
          options={[
            {id: 'warm', label: 'Warm', selected: chips.tone === 'warm'},
            {id: 'formal', label: 'Formal', selected: chips.tone === 'formal'},
          ]}
          onSelect={id => setChips({tone: id as ComposeChips['tone']})}
        />
        <ChipGroup
          label="Extras"
          role="group"
          options={[
            {id: 'shared', label: 'Mention shared project', selected: chips.shared},
            {id: 'call', label: 'Offer a call', selected: chips.call},
          ]}
          onSelect={id => setChips(id === 'shared' ? {shared: !chips.shared} : {call: !chips.call})}
        />
        {/* Live preview — re-flows synchronously from the chips via the pure
            buildMessage(); aria-live OFF (announce only on send via the
            toast dock). */}
        <div style={styles.previewCard}>{buildMessage(sheetTarget.firstName, chips)}</div>
        <div style={styles.previewCaption}>~4 sentences · sent as email</div>
        <button type="button" className="vch-btn vch-focusable" style={styles.sendBtn} onClick={sendRequest}>
          Send request
        </button>
      </div>
    );
  };

  // ---- Shell ---------------------------------------------------------------

  const actionRef = actionOpen && ui.actionSheetFor != null ? references[ui.actionSheetFor] : null;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{VOUCHLY_CSS}</style>
      <div
        ref={shellRef}
        style={{
          ...styles.shell,
          ...(overlayOpen ? styles.shellLocked : null),
          ...(isDesktop ? styles.shellDesktop : null),
        }}>
        <header ref={navBarRef} style={styles.navBar}>
          <div style={styles.navLeading}>
            {detail != null ? (
              <button
                type="button"
                className="vch-btn vch-focusable"
                style={styles.backBtn}
                aria-label={`Back to ${rootTitle}`}
                onClick={popDetail}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>{rootTitle}</span>
              </button>
            ) : (
              <BrandMark />
            )}
          </div>
          <div className="vch-fade" style={{...styles.navTitle, opacity: compactTitleVisible ? 1 : 0}} aria-hidden={!compactTitleVisible}>
            {navTitle}
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="vch-btn vch-focusable"
              style={styles.iconBtn}
              aria-label="Check for replies"
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>
        <main style={styles.main}>
          {detail != null
            ? renderDetail(detail)
            : ui.tab === 'references'
              ? renderReferencesRoot()
              : ui.tab === 'requests'
                ? renderRequestsRoot()
                : renderPacketRoot()}
        </main>
        {detail != null ? renderDetailFooter(detail) : null}
        {detail == null && ui.tab === 'packet' && packet.length > 0 ? (
          <div style={styles.stickyFooter}>
            <button
              type="button"
              className="vch-btn vch-focusable"
              style={styles.primaryBtn}
              onClick={() => uiSet({toast: nextToast(`Packet link copied · ${packet.length} vouchers`)})}>
              Share packet ({packet.length})
            </button>
          </div>
        ) : null}
        {isReferencesRoot ? (
          <div style={styles.fabAnchor}>
            <button
              type="button"
              className="vch-btn vch-focusable"
              style={styles.fab}
              aria-label="Request a reference"
              onClick={event => {
                if (firstIdle != null) openCompose(firstIdle.id, event.currentTarget);
                else uiSet({toast: nextToast('Everyone has been asked')});
              }}>
              <Icon icon={PlusIcon} size="md" color="inherit" />
            </button>
          </div>
        ) : null}
        {/* THE one polite live region — no auto-dismiss timers; a new
            mutation replaces the toast; Undo restores in place. */}
        <div style={styles.toastAnchor} role="status" aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast}>
              <span style={styles.toastMsg}>{ui.toast.msg}</span>
              {ui.toast.undoId != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="vch-btn vch-focusable" style={styles.toastUndo} onClick={doUndo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        <nav style={styles.tabBar} role="tablist" aria-label="Vouchly sections" onKeyDown={onTabBarKeyDown}>
          {TABS.map(tab => {
            const isActive = ui.tab === tab.id;
            const badge = tab.id === 'requests' ? activeRequests.length : tab.id === 'packet' ? packet.length : 0;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className="vch-btn vch-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                onClick={() => switchTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {badge > 0 ? <span style={styles.tabBadge}>{badge}</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        {sheetOpen ? (
          <>
            <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <Sheet
              titleId="vch-sheet-title"
              title="Request a reference"
              detent={ui.sheet?.detent ?? 'medium'}
              onDetentChange={detent => {
                if (ui.sheet != null) uiSet({sheet: {...ui.sheet, detent}});
              }}
              onClose={closeSheet}
              sheetRef={sheetRef}
              reducedMotion={reducedMotion}>
              {renderComposeContent()}
            </Sheet>
          </>
        ) : null}
        {actionRef != null ? (
          <>
            <div style={styles.sheetScrim} onClick={closeActionSheet} aria-hidden />
            <ActionSheet
              reference={actionRef}
              containerRef={actionSheetRef}
              cancelRef={cancelRef}
              onRequest={() => openCompose(actionRef.id)}
              onNudge={() => doNudge(actionRef.id)}
              onDetails={() => pushDetail(actionRef.id)}
              onRemove={() => doRemove(actionRef.id)}
              onCancel={closeActionSheet}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
