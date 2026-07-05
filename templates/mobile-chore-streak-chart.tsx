// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Choreo family's Saturday, Jul 4:
 *   three kids (Maya streak 11, Leo 4, Zoe 23), fifteen chores whose counts
 *   cross-check exactly (Maya 5/6 + Leo 2/5 + Zoe 4/4 = 11 of 15 done;
 *   points 40+20+25 = 85 of 50+45+25 = 120), three SwapTickets (SWP-01
 *   Awaiting parent, SWP-02/03 Offered → Swaps badge 3; 1 approval + 1
 *   parent check → Family badge 2), per-kid Sun–Sat streak ladders with two
 *   sick-day shields (Maya Tue, Zoe Wed → '2 left' of 4). No Date.now(), no
 *   Math.random(), no network media.
 * @output Choreo — Saturday Chore Streak Chart: a 390px MOBILE family chore
 *   surface. NavBar (Choreo check-with-footprints mark · fading 'Saturday
 *   chores' title · 44×44 Refresh) over a 52px large title, a pinned 84px
 *   KidRingSwitcher (48px per-chore completion rings around 36px initial
 *   discs), dense 60px checklist rows (44×44 check target · flex text ·
 *   flame chip · 44×44 ellipsis), a 72px two-sided perforated SwapTicket
 *   inline under its bound row, a hold-to-verify parent-check row, a
 *   Streaks tab of 7-day ladders with amber shield tokens, a Swaps tab with
 *   Approve-and-Undo tickets plus a sticky 'Propose swap' footer opening a
 *   two-detent sheet, and a Family tab whose Approvals row pushes a stacked
 *   screen. SIGNATURE: tapping 'Feed the dog' done moves five derived
 *   surfaces in one render — row flame count-up 11→12, Maya's ring fills
 *   its 6th segment (350ms dashoffset), the inline SWP-03 ticket flips to
 *   'Voided' with strikethrough, the Swaps badge drops 3→2, and Maya's Sat
 *   ladder dot fills — plus the header '11 of 15'→'12 of 15'; ONE Undo
 *   restores all of it from a single snapshot because every one of those
 *   surfaces derives from {chores, swaps}, never stored twice.
 * @position Page template; emitted by `astryx template mobile-chore-streak-chart`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, anchored menus) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   swap sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close; focus enters the sheet with {preventScroll:true}
 *   so the animating sheet is never scroll-revealed mid-flight. The stage
 *   clips to --radius-container; shell paints full-bleed square. The
 *   toastDock is STICKY-IN-FLOW (bottom:76 above the 64px tabBar, height-0
 *   anchor) — shell-absolute would pin to the document bottom on tall
 *   scrolling tabs.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 where rows lead with the
 *   44px check control); no desktop Layout frames, no side asides, no
 *   multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand accent (Choreo
 *   green) split per house rule into fill vs text values with contrast
 *   math at each declaration; the sanctioned non-brand literals are the
 *   amber claimed/shield pair and REST_GRAY — the amendment-mandated ≥3:1
 *   explicit pair for interactive control boundaries (unchecked check
 *   squares) and meaningful rest fills (pending ring segments, empty
 *   ladder dots); hairline tokens stay passive-separator-only.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — noted per
 *   contract; center title fades in via IntersectionObserver sentinel);
 *   largeTitle 52px in-flow (104px total header); kidSwitcher 84px sticky
 *   top:52 z19; tabBar exactly 64px sticky bottom z20; toastDock sticky
 *   bottom:76 (64 tabBar + 12; 156 on Swaps where the 80px sticky footer
 *   interposes). Chore rows 60px two-line (16px/500 primary + 13px/400
 *   meta, 2px gap); Family utility rows 44px; SwapTicket minHeight 72px;
 *   StreakLadder 32px × 7 day rows + 44px flame header. rowDivider 1px
 *   hairline inset 16 (68 where rows lead with the check control); last
 *   row none. sectionHeader 13px/600 uppercase 0.06em at 32px from the
 *   stage edge, 20px top / 8px bottom. TYPE (Figtree via
 *   --font-family-body): 28/700 large title · 22/700 streak numerals ·
 *   17/600 nav + card titles · 16/400–500 row primary + inputs (floor) ·
 *   13/400 meta · 11/500 tab labels, kid names, overlines; nothing under
 *   11px; tabular-nums on every count. Buttons: 48px sticky-footer
 *   primary, 36px secondary (Approve), 44×44 icon buttons. Touch: the
 *   chore row is NOT one button — it holds the 44×44 check/hold target,
 *   a central text button, and a trailing 44×44 ellipsis, each ≥44px with
 *   ≥8px clearance; every gesture (hold-to-verify, sheet drag) has a
 *   visible button path (ellipsis menu 'Mark verified'/'Mark done',
 *   clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals: kidSwitcher buttons flex:1 with
 *   48px fixed rings and ellipsized names at min-width 0; chore-row text
 *   stack flex:1 minWidth:0 single-line ellipsis (l1's long title proves
 *   it at 320); SwapTicket halves each flex:1 minWidth:0 with ellipsized
 *   chore names, fixed 1px perforated divider, minHeight:72 (never
 *   height:72) so the state pill may wrap at 320. overflowX:'clip' on
 *   shell is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   renders as a centered 430px phone column with hairline borderInline;
 *   sticky chrome and absolute overlays stay inside because they anchor
 *   to shell. No adaptive relayout.
 *
 * Spec deviations (cross-check laws kept exact, fixtures corrected):
 * - The spec ladder listed Zoe 'Sat empty' with streak 23 while z1–z4 are
 *   all done — non-reconciling with its own law 'Sat dot fills live when
 *   today completes'. Sat dots and displayed streaks DERIVE here
 *   (displayed = base + 1 when every chore is complete), so Zoe shows 24
 *   with Sat filled, Maya flips 11→12 on the signature, and Approve
 *   SWP-01 honestly drops Zoe to 23 / Sat empty until she does the new
 *   chore (stress fixture 4 round-trips it).
 * - Sheet default preselects the first pending chore (m2 'Feed the dog',
 *   acceptor Leo) so 'Send offer' is always valid — the submit never
 *   disables, per the inputControls contract.
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
  AlertCircleIcon,
  ArrowLeftRightIcon,
  BadgeCheckIcon,
  CheckCircle2Icon,
  CheckIcon,
  CheckSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlameIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  ShieldIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand accent (Choreo green) as a FILL/STROKE: #0E9F7E on
// the white card ≈ 3.3:1 (passes the ≥3:1 graphics bar for ring segments,
// ladder dots, active tab icons); #34D3A6 on the dark card (~#1C1C1E) ≈
// 8.7:1. NOT used for text under 17px — see BRAND_TEXT.
const BRAND_ACCENT = 'light-dark(#0E9F7E, #34D3A6)';
// Brand-tinted TEXT (11px tab labels, kid names, Undo, flame-adjacent
// counts) needs 4.5:1: #0B7A61 on white ≈ 5.3:1; #34D3A6 on the dark body
// ≈ 9.5:1. (Spec's own math: white on #0E9F7E is only ~3.3:1, so small
// text never sits on the raw brand hue.)
const BRAND_TEXT = 'light-dark(#0B7A61, #34D3A6)';
// Brand FILL for badges / primary buttons / filled check squares, per the
// spec's darkened pair, with dark-on-light-fill text in dark scheme:
// #FFFFFF on #0B7A61 ≈ 4.6:1; #06251C on #34D3A6 ≈ 9.0:1.
const BRAND_FILL = 'light-dark(#0B7A61, #34D3A6)';
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #06251C)';
// 12% brand wash (active ring hit, selected picker row). BRAND_TEXT on the
// washed card still passes: light wash lum ≈ 0.91 → #0B7A61 ≈ 4.9:1.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Amber claimed/shield pair (kid-claimed ring segments, half-filled check,
// 'Awaiting parent' pill, shield tokens): #B45309 on the white card ≈
// 5.0:1; #FBBF24 on the dark card ≈ 10.2:1 — both clear the 4.5:1 text bar
// too, so the 11px pill text may use it directly.
const AMBER = 'light-dark(#B45309, #FBBF24)';
const AMBER_TINT_14 = `color-mix(in srgb, ${AMBER} 14%, transparent)`;
// AMENDMENT PAIR — interactive boundaries & meaningful rest fills must hit
// ≥3:1 against their ACTUAL surface; hairline/muted tokens are passive
// separators only. #767676 on the white card = 4.5:1; #8E8E8E on the dark
// card (~#1C1C1E) ≈ 5.2:1 and on the dark body (~#151110) ≈ 5.5:1. Used
// for: unchecked check-square borders, pending ring segments, empty
// ladder-dot rings, the segmented-control resting boundary.
const REST_GRAY = 'light-dark(#767676, #8E8E8E)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Shared chrome blur surface.
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden h1s,
// ring-segment dashoffset transition, flame pop, skeleton shimmer, and the
// reduced-motion guard (shimmer REMOVED entirely, fills snap).
// ---------------------------------------------------------------------------

const CHOREO_CSS = `
.cho-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.cho-btn:disabled { cursor: default; }
.cho-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.cho-fade { transition: opacity 200ms ease; }
.cho-anim { transition: transform 240ms ease, opacity 240ms ease; }
/* Ring segment fill — 350ms stroke-dashoffset sweep (pathLength=1). */
.cho-seg { transition: stroke-dashoffset 350ms ease; }
@keyframes cho-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.cho-sheet-in { animation: cho-sheet-in 240ms ease; }
@keyframes cho-flame-pop {
  0% { transform: none; }
  40% { transform: translateY(-2px); }
  100% { transform: none; }
}
.cho-flame-pop { animation: cho-flame-pop 400ms ease; }
/* One shared shimmer sweep across all skeleton blocks. */
@keyframes cho-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
}
.cho-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-background-card) 55%, transparent),
    transparent
  );
  animation: cho-shimmer 1.6s linear infinite;
}
.cho-vh {
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
  .cho-fade, .cho-anim, .cho-seg { transition: none; }
  .cho-sheet-in, .cho-flame-pop { animation: none; }
  .cho-shimmer::after { animation: none; content: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
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
  // Scroll lock while the sheet is open (longhand axes — mixing the
  // `overflow` shorthand with the base overflowX triggers a React style
  // reconciliation warning).
  shellLocked: {height: '100dvh', overflowX: 'hidden', overflowY: 'hidden'},
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; hairline ALWAYS ON (noted per contract).
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
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', alignItems: 'center', justifyContent: 'flex-end'},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 44×44 back button: ChevronLeft 24px + previous-title 13px/500.
  backBtn: {
    minWidth: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    paddingInlineEnd: 8,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    maxWidth: 96,
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
  },
  // LARGE TITLE — 52px in-flow block; 104px total large header.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, lineHeight: 1.1, margin: 0},
  headerCaption: {
    paddingInline: 16,
    paddingBottom: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // KID SWITCHER — pinned sticky at top:52, 84px, same blur surface.
  kidSwitcher: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 84,
    flexShrink: 0,
    display: 'flex',
    paddingInline: 8,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  kidRingButton: {
    flex: 1,
    minWidth: 44,
    height: 84,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 12,
  },
  kidRingWrap: {position: 'relative', width: 48, height: 48},
  kidAvatarDisc: {
    position: 'absolute',
    inset: 6,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontWeight: 600,
  },
  kidName: {
    maxWidth: '100%',
    minWidth: 0,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  kidNameActive: {fontWeight: 600, color: BRAND_TEXT},
  // Content shared.
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
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
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
    position: 'relative',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // 68px inset where rows lead with the 44px check control (16 + 44 + 8).
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // CHORE ROW — 60px; NOT one button: check target + text button + ellipsis.
  choreRow: {
    position: 'relative',
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    paddingInlineEnd: 4,
  },
  // 44×44 check/hold target holding the 28px visual square.
  checkTarget: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    touchAction: 'none',
  },
  // 28px 8px-rounded square. Unchecked border = REST_GRAY (amendment: an
  // interactive boundary at ≥3:1 vs the card — hairline tokens banned here).
  checkSquare: {
    position: 'relative',
    width: 28,
    height: 28,
    borderRadius: 8,
    border: `2px solid ${REST_GRAY}`,
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
  },
  checkSquareDone: {
    border: `2px solid ${BRAND_FILL}`,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
  },
  checkSquareClaimed: {
    border: `2px solid ${AMBER}`,
    background: `linear-gradient(to top, ${AMBER_TINT_14} 50%, transparent 50%)`,
    color: AMBER,
  },
  // Circular conic sweep INSIDE the 8px square during a hold.
  holdSweep: {
    position: 'absolute',
    inset: 0,
    borderRadius: 6,
    pointerEvents: 'none',
  },
  choreTextBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 8,
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  choreTitleDone: {color: 'var(--color-text-secondary)'},
  choreMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  choreMetaClaimed: {color: AMBER, fontWeight: 500},
  // Flame chip — trailing, fixed; 16px Flame + tabular count.
  flameChip: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    color: AMBER,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // Anchored ellipsis menu — 12px radius, 44px rows, z30 (below scrim z40).
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    minWidth: 210,
    maxWidth: 'calc(100% - 24px)',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'hidden',
  },
  menuRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 12,
    fontSize: 16,
  },
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // SWAP TICKET — two-sided perforated chip, minHeight 72 (wraps at 320).
  ticket: {
    position: 'relative',
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  ticketHalf: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingBlock: 10,
    paddingInline: 12,
  },
  ticketPersonRow: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  ticketAvatar: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
  },
  ticketName: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ticketOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  ticketChore: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ticketChoreVoided: {textDecoration: 'line-through', color: 'var(--color-text-secondary)'},
  ticketDividerCol: {
    width: 1,
    flexShrink: 0,
    borderInlineStart: '1px dashed var(--color-border)',
    position: 'relative',
  },
  // 8px-radius perforation notches punched at the divider's top/bottom.
  ticketNotchTop: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: 'var(--color-background-body)',
    border: '1px solid var(--color-border)',
  },
  ticketNotchBottom: {
    position: 'absolute',
    bottom: -8,
    left: -8,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: 'var(--color-background-body)',
    border: '1px solid var(--color-border)',
  },
  statePillRow: {display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap'},
  statePill: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 999,
    paddingInline: 8,
    height: 18,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  ticketCaption: {fontSize: 11, color: 'var(--color-text-secondary)'},
  ticketDetail: {
    paddingInline: 16,
    paddingBlock: 10,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  approveBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 10,
    border: `1px solid ${BRAND_TEXT}`,
    color: BRAND_TEXT,
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    alignSelf: 'center',
    flexShrink: 0,
  },
  // Terminal caption below a finished card ('All 4 done — 25 pts').
  terminalCaption: {
    margin: '8px 16px 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // STREAK LADDER — 44px flame header + 7 × 32px day rows.
  ladderHeader: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  ladderKid: {flex: 1, minWidth: 0, fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  ladderCount: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: 4,
    color: AMBER,
  },
  ladderCountNum: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1},
  ladderCountUnit: {fontSize: 13, color: 'var(--color-text-secondary)'},
  ladderDayRow: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  ladderDayInitial: {width: 14, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)'},
  // 12px dot; empty ring = REST_GRAY per the amendment (a meaningful rest
  // fill, not a passive separator).
  ladderDot: {width: 12, height: 12, borderRadius: '50%', flexShrink: 0},
  ladderDotDone: {background: BRAND_ACCENT},
  ladderDotEmpty: {border: `1.5px solid ${REST_GRAY}`},
  ladderShield: {color: AMBER, display: 'inline-flex', flexShrink: 0},
  ladderDayMeta: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // FAMILY BEST summary row.
  familyBestRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
    fontWeight: 500,
  },
  // Family utility rows — 44px.
  utilityRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
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
  utilityValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  utilityChevron: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  utilityBadge: {
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // Approvals screen action rows.
  approvalRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 8,
  },
  approvalText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  // EMPTY STATE (contract anatomy).
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
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0'},
  // SKELETON — 60px rows, deterministic staggered widths, radius 6.
  skeletonRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    paddingInlineEnd: 4,
  },
  skeletonSquare: {
    width: 28,
    height: 28,
    marginInline: 8,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  skeletonBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // TAB BAR — exactly 64px, sticky bottom z20.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    height: 64,
    flexShrink: 0,
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
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
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
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // Sticky Swaps footer — 48px brand button, blur surface, above tabBar.
  swapFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 18,
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
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // TOAST DOCK — sticky-in-flow height-0 anchor above the tabBar; the one
  // polite live region. Shell-absolute would pin to the DOCUMENT bottom on
  // tall scrolling tabs (binding amendment).
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 'calc(100% - 32px)',
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
  toastText: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndoBtn: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41; two detents.
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
  // The ONE legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  sheetSectionLabel: {
    margin: '16px 0 8px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  pickerCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 12,
  },
  pickerRowSelected: {background: BRAND_TINT_12},
  pickerRadio: {
    width: 20,
    height: 20,
    flexShrink: 0,
    borderRadius: '50%',
    border: `2px solid ${REST_GRAY}`,
    display: 'grid',
    placeItems: 'center',
  },
  pickerRadioOn: {border: `2px solid ${BRAND_FILL}`},
  pickerRadioDot: {width: 10, height: 10, borderRadius: '50%', background: BRAND_FILL},
  pickerTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pickerMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  pickerKidTag: {
    width: 20,
    height: 20,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
  },
  // Segmented sibling picker — 36px track, active pill card fill + hairline.
  segmented: {
    display: 'flex',
    height: 36,
    padding: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    border: `1px solid ${REST_GRAY}`,
  },
  segment: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  segmentOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  formField: {display: 'flex', flexDirection: 'column', gap: 8},
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
    boxShadow: 'none',
  },
  fieldError: {
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-error)',
  },
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checked aggregates.
// ARITHMETIC LEDGER (verified by hand; claimed counts as done in counts):
//   Maya 5/6 · Leo 2/5 · Zoe 4/4 → 11 of 15 (5+2+4=11; 6+5+4=15 ✓).
//   Points done: Maya 5+10+5+5+15=40/50 · Leo 10+10=20/45 · Zoe 25/25 →
//   family 85 of 120 (40+20+25=85; 50+45+25=120 ✓).
//   Swaps badge 3 = SWP-01+02+03 pending ✓. Family badge 2 = 1 approval
//   (SWP-01) + 1 verify (m4) ✓. Sick-day passes 4 − 2 used (Maya Tue, Zoe
//   Wed — derived from shield days) = 2 left ✓.
//   POST-SIGNATURE (m2 done): Maya 6/6 → 12 of 15 (6+2+4 ✓); Maya 50/50;
//   family 95/120 (+10 ✓); Maya streak 11→12 (derived +1); Swaps badge 2;
//   SWP-03 Voided (derived from its chore, never stored twice).
// ---------------------------------------------------------------------------

type KidId = 'maya' | 'leo' | 'zoe';
type DayState = 'done' | 'empty' | 'shield';
type ChoreStatus = 'pending' | 'done' | 'claimed' | 'verified';

interface Kid {
  id: KidId;
  name: string;
  initial: string;
  /** Streak through Friday; Saturday derives (+1 when every chore done). */
  baseStreak: number;
  /** Sun–Fri stored; Sat DERIVES from today's chores. */
  week: [DayState, DayState, DayState, DayState, DayState, DayState];
}

const KIDS: Record<KidId, Kid> = {
  maya: {id: 'maya', name: 'Maya', initial: 'M', baseStreak: 11, week: ['done', 'done', 'shield', 'done', 'done', 'done']},
  leo: {id: 'leo', name: 'Leo', initial: 'L', baseStreak: 4, week: ['empty', 'empty', 'empty', 'done', 'done', 'done']},
  zoe: {id: 'zoe', name: 'Zoe', initial: 'Z', baseStreak: 23, week: ['done', 'done', 'done', 'shield', 'done', 'done']},
};
const KID_ORDER: KidId[] = ['maya', 'leo', 'zoe'];
const SICK_DAY_PASSES_MONTHLY = 4;
const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface Chore {
  id: string;
  kidId: KidId;
  title: string;
  pts: number;
  status: ChoreStatus;
  parentCheck: boolean;
}

// l1 is the truncation stress — longest title, must single-line ellipsize
// beside the flame chip at 320px.
const CHORE_LIST: Chore[] = [
  {id: 'm1', kidId: 'maya', title: 'Make bed', pts: 5, status: 'done', parentCheck: false},
  {id: 'm2', kidId: 'maya', title: 'Feed the dog', pts: 10, status: 'pending', parentCheck: false},
  {id: 'm3', kidId: 'maya', title: 'Unload dishwasher', pts: 10, status: 'done', parentCheck: false},
  {id: 'm4', kidId: 'maya', title: 'Clean bathroom', pts: 15, status: 'claimed', parentCheck: true},
  {id: 'm5', kidId: 'maya', title: 'Water plants', pts: 5, status: 'done', parentCheck: false},
  {id: 'm6', kidId: 'maya', title: 'Take out recycling', pts: 5, status: 'done', parentCheck: false},
  {id: 'l1', kidId: 'leo', title: 'Sweep porch and shake out the front-door mats', pts: 10, status: 'done', parentCheck: false},
  {id: 'l2', kidId: 'leo', title: 'Fold laundry', pts: 10, status: 'done', parentCheck: false},
  {id: 'l3', kidId: 'leo', title: 'Take out trash', pts: 5, status: 'pending', parentCheck: false},
  {id: 'l4', kidId: 'leo', title: 'Vacuum living room', pts: 15, status: 'pending', parentCheck: true},
  {id: 'l5', kidId: 'leo', title: 'Set the table', pts: 5, status: 'pending', parentCheck: false},
  {id: 'z1', kidId: 'zoe', title: 'Feed the fish', pts: 5, status: 'done', parentCheck: false},
  {id: 'z2', kidId: 'zoe', title: 'Tidy toy bins', pts: 10, status: 'done', parentCheck: false},
  {id: 'z3', kidId: 'zoe', title: 'Wipe table', pts: 5, status: 'done', parentCheck: false},
  {id: 'z4', kidId: 'zoe', title: 'Water herbs', pts: 5, status: 'done', parentCheck: false},
];
const CHORE_ORDER = CHORE_LIST.map(chore => chore.id);

type SwapState = 'offered' | 'awaiting' | 'approved';

interface Swap {
  id: string;
  choreId: string;
  offererId: KidId;
  acceptorId: KidId;
  state: SwapState;
  note: string | null;
  sentLabel: string; // pre-computed relative string — no clock reads
}

const SWAP_LIST: Swap[] = [
  {id: 'SWP-01', choreId: 'l3', offererId: 'leo', acceptorId: 'zoe', state: 'awaiting', note: 'Zoe said yes at breakfast', sentLabel: 'Sent 9:05 AM'},
  {id: 'SWP-02', choreId: 'l5', offererId: 'leo', acceptorId: 'maya', state: 'offered', note: null, sentLabel: 'Sent 9:12 AM'},
  {id: 'SWP-03', choreId: 'm2', offererId: 'maya', acceptorId: 'leo', state: 'offered', note: 'Trade for table duty?', sentLabel: 'Sent 10:40 AM'},
];
const SWAP_ORDER = SWAP_LIST.map(swap => swap.id);

// Deterministic ids for sheet-created offers, in commit order.
const NEW_SWAP_IDS = ['SWP-04', 'SWP-05', 'SWP-06', 'SWP-07'];

// Skeleton geometry — deterministic staggered widths (never Math.random):
// primary 60/45/70/60%, secondary 40/55/30/40%.
const SKELETON_PATTERN = [
  {primary: '60%', secondary: '40%'},
  {primary: '45%', secondary: '55%'},
  {primary: '70%', secondary: '30%'},
  {primary: '60%', secondary: '40%'},
];

// ---------------------------------------------------------------------------
// DERIVATIONS — every aggregate below derives from {chores, swaps}; nothing
// is stored twice, which is what makes the one-snapshot Undo exact.
// ---------------------------------------------------------------------------

type ChoreMap = Record<string, Chore>;
type SwapMap = Record<string, Swap>;

/** 'claimed' counts as done in counts (spec law). */
function isComplete(chore: Chore): boolean {
  return chore.status !== 'pending';
}

function choresFor(chores: ChoreMap, kidId: KidId): Chore[] {
  return CHORE_ORDER.map(id => chores[id]).filter(chore => chore.kidId === kidId);
}

function kidCounts(chores: ChoreMap, kidId: KidId): {done: number; total: number; ptsDone: number; ptsTotal: number} {
  const list = choresFor(chores, kidId);
  return {
    done: list.filter(isComplete).length,
    total: list.length,
    ptsDone: list.filter(isComplete).reduce((sum, chore) => sum + chore.pts, 0),
    ptsTotal: list.reduce((sum, chore) => sum + chore.pts, 0),
  };
}

/** Displayed streak = base + 1 once today (Saturday) completes. */
function kidStreak(chores: ChoreMap, kidId: KidId): number {
  const {done, total} = kidCounts(chores, kidId);
  return KIDS[kidId].baseStreak + (total > 0 && done === total ? 1 : 0);
}

/** Sat ladder dot derives from today's chores — never stored. */
function kidSatDone(chores: ChoreMap, kidId: KidId): boolean {
  const {done, total} = kidCounts(chores, kidId);
  return total > 0 && done === total;
}

type TicketDisplayState = 'offered' | 'awaiting' | 'approved' | 'voided';

/** Voiding DERIVES: an unapproved ticket whose chore got completed. */
function ticketState(swap: Swap, chores: ChoreMap): TicketDisplayState {
  if (swap.state === 'approved') return 'approved';
  if (isComplete(chores[swap.choreId])) return 'voided';
  return swap.state;
}

/** Swaps tab badge = live (offered + awaiting) tickets. 3 at rest ✓. */
function pendingSwapCount(swaps: SwapMap, swapOrder: string[], chores: ChoreMap): number {
  return swapOrder.filter(id => {
    const state = ticketState(swaps[id], chores);
    return state === 'offered' || state === 'awaiting';
  }).length;
}

/** Family badge = parent inbox: awaiting-parent swaps + unverified claims. */
function approvalCount(swaps: SwapMap, swapOrder: string[], chores: ChoreMap): number {
  const awaitingSwaps = swapOrder.filter(id => ticketState(swaps[id], chores) === 'awaiting').length;
  const claims = CHORE_ORDER.filter(id => chores[id].parentCheck && chores[id].status === 'claimed').length;
  return awaitingSwaps + claims;
}

function shieldsUsed(): number {
  return KID_ORDER.reduce((sum, kidId) => sum + KIDS[kidId].week.filter(day => day === 'shield').length, 0);
}

// ---------------------------------------------------------------------------
// HOOKS & UTILITIES
// ---------------------------------------------------------------------------

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver on the wrapper
 * can tell the 390px mobile stage from the desktop stage.
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
function getScrollParent(node: HTMLElement | null): HTMLElement {
  let el: HTMLElement | null = node?.parentElement ?? null;
  while (el != null) {
    const overflowY = window.getComputedStyle(el).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
}

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), input');
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

/** Roving arrow-key movement for radiogroups / tablists. */
function moveRovingFocus(event: ReactKeyboardEvent<HTMLElement>, onMove: (delta: 1 | -1) => void): void {
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    onMove(1);
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    onMove(-1);
  }
}

// ---------------------------------------------------------------------------
// BRAND MARK — 24px Choreo checkmark whose tail curls into two footprint
// dots; stroke follows --color-text-primary, footprints in the brand accent.
// (SVG uses --color-text-primary — var(--color-text) does not exist.)
// ---------------------------------------------------------------------------

function ChoreoMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 12.5l4.5 4.5L17 6.5c1.4-1.6 3.4-0.6 3 1.2"
          stroke="var(--color-text-primary)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18.4" cy="12.4" r="1.5" fill={BRAND_ACCENT} />
        <circle cx="21" cy="16.2" r="1.5" fill={BRAND_ACCENT} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// StreakFlameCountUp — 16px Flame + tabular count; on increment runs a
// 400ms rAF count-up with a translateY(-2px) pulse. Under reduced motion
// the number swaps instantly (guard in-file); amber alone still encodes it.
// ---------------------------------------------------------------------------

interface FlameCountProps {
  value: number;
  reducedMotion: boolean;
  numeralStyle?: CSSProperties;
  iconSize?: 'sm' | 'md';
  label: string;
}

function FlameCount({value, reducedMotion, numeralStyle, iconSize = 'sm', label}: FlameCountProps) {
  const [display, setDisplay] = useState(value);
  const [popSeq, setPopSeq] = useState(0);
  const prevRef = useRef(value);
  const rafRef = useRef(0);
  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = value;
    if (from === value) return undefined;
    if (reducedMotion) {
      setDisplay(value);
      return undefined;
    }
    setPopSeq(seq => seq + 1);
    let start: number | null = null;
    const step = (ts: number) => {
      if (start == null) start = ts;
      const t = Math.min(1, (ts - start) / 400);
      setDisplay(Math.round(from + (value - from) * t));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, reducedMotion]);
  return (
    <span style={styles.flameChip} aria-label={label} role="img">
      <Icon icon={FlameIcon} size={iconSize} color="inherit" />
      <span key={popSeq} className={popSeq > 0 ? 'cho-flame-pop' : undefined} style={numeralStyle}>
        {display}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// KidRingSwitcher ring — 48px SVG, one arc segment per chore (3° gaps).
// done/verified = brand stroke, claimed = amber, pending = REST_GRAY (the
// amendment pair — a meaningful rest fill, ≥3:1 vs the blur body surface).
// Fill animates via 350ms stroke-dashoffset (pathLength=1); instant under
// reduced motion via the .cho-seg media guard.
// ---------------------------------------------------------------------------

const RING_C = 24;
const RING_R = 20;

function ringPolar(deg: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: RING_C + RING_R * Math.sin(rad), y: RING_C - RING_R * Math.cos(rad)};
}

function ringArcPath(fromDeg: number, toDeg: number): string {
  const from = ringPolar(fromDeg);
  const to = ringPolar(toDeg);
  const largeArc = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${RING_R} ${RING_R} 0 ${largeArc} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

interface KidRingProps {
  kid: Kid;
  chores: Chore[];
}

function KidRing({kid, chores}: KidRingProps) {
  const n = chores.length;
  const sweep = 360 / n - 3;
  return (
    <span style={styles.kidRingWrap} aria-hidden>
      <svg width={48} height={48} viewBox="0 0 48 48" fill="none" aria-hidden>
        {chores.map((chore, index) => {
          const start = index * (360 / n) + 1.5;
          const path = ringArcPath(start, start + sweep);
          const filled = isComplete(chore);
          const color = chore.status === 'claimed' ? AMBER : BRAND_ACCENT;
          return (
            <g key={chore.id}>
              <path d={path} stroke={REST_GRAY} strokeWidth={4} strokeLinecap="round" />
              <path
                d={path}
                className="cho-seg"
                stroke={color}
                strokeWidth={4}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={filled ? 0 : 1}
                opacity={filled ? 1 : 0}
                style={{transitionProperty: 'stroke-dashoffset, opacity'}}
              />
            </g>
          );
        })}
      </svg>
      <span style={styles.kidAvatarDisc}>{kid.initial}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// CHECK CONTROL — the 44×44 check/hold target. Plain rows toggle on tap;
// parentCheck rows flagged 'claimed' run the 900ms press-and-hold radial
// fill (rAF conic sweep; cancel on early release or 8px movement; reduced
// motion: hold still required, fill snaps 0→100 at threshold). MANDATORY
// visible path: the row's ellipsis menu carries 'Mark verified'/'Mark done'.
// ---------------------------------------------------------------------------

const HOLD_MS = 900;

interface CheckControlProps {
  chore: Chore;
  reducedMotion: boolean;
  onTap: () => void;
  onHoldComplete: () => void;
}

function CheckControl({chore, reducedMotion, onTap, onHoldComplete}: CheckControlProps) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(0);
  const startTsRef = useRef<number | null>(null);
  const originRef = useRef({x: 0, y: 0});
  const doneRef = useRef(false);
  const holdable = chore.parentCheck && chore.status === 'claimed';

  const cancelHold = () => {
    cancelAnimationFrame(rafRef.current);
    startTsRef.current = null;
    setProgress(0);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!holdable) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    originRef.current = {x: event.clientX, y: event.clientY};
    doneRef.current = false;
    const step = (ts: number) => {
      if (startTsRef.current == null) startTsRef.current = ts;
      const t = Math.min(1, (ts - startTsRef.current) / HOLD_MS);
      // Reduced motion: hold still required, but no intermediate sweep —
      // the fill snaps 0→100 only at the threshold.
      setProgress(reducedMotion ? (t >= 1 ? 1 : 0) : t);
      if (t >= 1) {
        doneRef.current = true;
        startTsRef.current = null;
        setProgress(0);
        onHoldComplete();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (startTsRef.current == null) return;
    const dx = event.clientX - originRef.current.x;
    const dy = event.clientY - originRef.current.y;
    if (Math.hypot(dx, dy) > 8) cancelHold();
  };
  const onPointerUp = () => {
    if (startTsRef.current != null) cancelHold();
  };
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const onClick = () => {
    if (doneRef.current) {
      doneRef.current = false;
      return; // the hold already committed
    }
    onTap();
  };

  const isDone = chore.status === 'done' || chore.status === 'verified';
  const squareStyle: CSSProperties = {
    ...styles.checkSquare,
    ...(isDone ? styles.checkSquareDone : null),
    ...(chore.status === 'claimed' ? styles.checkSquareClaimed : null),
  };
  const label =
    chore.status === 'pending'
      ? chore.parentCheck
        ? `Claim ${chore.title}`
        : `Complete ${chore.title}`
      : chore.status === 'claimed'
        ? `Hold to verify ${chore.title}`
        : `Undo ${chore.title}`;
  return (
    <button
      type="button"
      className="cho-btn cho-focusable"
      style={styles.checkTarget}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}>
      <span style={squareStyle}>
        {progress > 0 ? (
          <span
            style={{
              ...styles.holdSweep,
              background: `conic-gradient(${BRAND_ACCENT} ${Math.round(progress * 360)}deg, transparent 0deg)`,
              opacity: 0.85,
            }}
            aria-hidden
          />
        ) : null}
        {chore.status === 'verified' ? (
          <Icon icon={BadgeCheckIcon} size="sm" color="inherit" />
        ) : isDone ? (
          <Icon icon={CheckIcon} size="sm" color="inherit" />
        ) : chore.status === 'claimed' ? (
          <Icon icon={CheckIcon} size="sm" color="inherit" />
        ) : null}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// CHORE ROW — 60px; three targets ≥44×44 with ≥8px clearance: check/hold,
// central text button, trailing ellipsis with the anchored fallback menu.
// ---------------------------------------------------------------------------

interface MenuAction {
  id: string;
  label: string;
  run: () => void;
}

interface ChoreRowViewProps {
  chore: Chore;
  streak: number;
  isLast: boolean;
  menuOpen: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  menuActions: MenuAction[];
  onCheckTap: () => void;
  onHoldComplete: () => void;
  onTextTap: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
  inlineTicket: ReactNode;
}

function ChoreRowView({
  chore,
  streak,
  isLast,
  menuOpen,
  reducedMotion,
  menuRef,
  menuActions,
  onCheckTap,
  onHoldComplete,
  onTextTap,
  onToggleMenu,
  inlineTicket,
}: ChoreRowViewProps) {
  const isDone = chore.status === 'done' || chore.status === 'verified';
  const meta =
    chore.status === 'verified'
      ? `${chore.pts} pts · Verified by a parent`
      : chore.status === 'claimed'
        ? 'Claimed — needs parent check'
        : chore.parentCheck
          ? `${chore.pts} pts · Parent check`
          : `${chore.pts} pts`;
  return (
    <div style={{position: 'relative'}}>
      <div style={styles.choreRow}>
        <CheckControl chore={chore} reducedMotion={reducedMotion} onTap={onCheckTap} onHoldComplete={onHoldComplete} />
        <button
          type="button"
          className="cho-btn cho-focusable"
          style={styles.choreTextBtn}
          aria-label={`${chore.title}, ${meta}`}
          onClick={onTextTap}>
          <span style={{...styles.choreTitle, ...(isDone ? styles.choreTitleDone : null)}}>{chore.title}</span>
          <span style={{...styles.choreMeta, ...(chore.status === 'claimed' ? styles.choreMetaClaimed : null)}}>
            {chore.status === 'claimed' ? (
              <Icon icon={BadgeCheckIcon} size="xsm" color="inherit" />
            ) : null}{' '}
            {meta}
          </span>
        </button>
        <FlameCount value={streak} reducedMotion={reducedMotion} label={`Streak ${streak} days`} />
        <button
          type="button"
          className="cho-btn cho-focusable"
          style={styles.iconBtn}
          aria-label={`More actions for ${chore.title}`}
          aria-expanded={menuOpen}
          onClick={event => onToggleMenu(event.currentTarget)}>
          <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
        </button>
      </div>
      {menuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Actions for ${chore.title}`}
          style={{...styles.anchoredMenu, top: 52}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          {menuActions.map((action, index) => (
            <div key={action.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <button type="button" role="menuitem" className="cho-btn cho-focusable" style={styles.menuRow} onClick={action.run}>
                <span style={styles.menuRowText}>{action.label}</span>
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {inlineTicket != null ? (
        <>
          <div style={styles.rowDividerDeep} />
          {inlineTicket}
        </>
      ) : null}
      {isLast ? null : <div style={styles.rowDividerDeep} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SWAP TICKET — two-sided perforated chip (minHeight 72; the state pill
// wraps below the acceptor at 320 and the ticket grows to ~88px). The whole
// ticket is a button toggling its detail rows; the Approve path (parent
// role) executes immediately + Undo — never a confirm.
// ---------------------------------------------------------------------------

const TICKET_STATE_LABEL: Record<TicketDisplayState, string> = {
  offered: 'Offered',
  awaiting: 'Awaiting parent',
  approved: 'Approved',
  voided: 'Voided',
};

interface SwapTicketViewProps {
  swap: Swap;
  chore: Chore;
  displayState: TicketDisplayState;
  expanded: boolean;
  onToggle: () => void;
  onApprove: (() => void) | null;
}

function SwapTicketView({swap, chore, displayState, expanded, onToggle, onApprove}: SwapTicketViewProps) {
  const offerer = KIDS[swap.offererId];
  const acceptor = KIDS[swap.acceptorId];
  const voided = displayState === 'voided';
  const pillStyle: CSSProperties = {
    ...styles.statePill,
    ...(displayState === 'awaiting'
      ? {border: `1px solid ${AMBER}`, color: AMBER}
      : displayState === 'approved'
        ? {border: `1px solid ${BRAND_TEXT}`, color: BRAND_TEXT}
        : {border: `1px solid ${REST_GRAY}`, color: 'var(--color-text-secondary)'}),
  };
  return (
    <div>
      <button
        type="button"
        className="cho-btn cho-focusable"
        style={styles.ticket}
        aria-expanded={expanded}
        aria-label={`Swap ${swap.id}: ${offerer.name} offers ${chore.title} to ${acceptor.name}, ${TICKET_STATE_LABEL[displayState]}`}
        onClick={onToggle}>
        <span style={styles.ticketHalf}>
          <span style={styles.ticketPersonRow}>
            <span style={styles.ticketAvatar} aria-hidden>
              {offerer.initial}
            </span>
            <span style={styles.ticketName}>{offerer.name}</span>
          </span>
          <span style={styles.ticketOverline}>offers</span>
          <span style={{...styles.ticketChore, ...(voided ? styles.ticketChoreVoided : null)}}>{chore.title}</span>
        </span>
        <span style={styles.ticketDividerCol} aria-hidden>
          <span style={styles.ticketNotchTop} />
          <span style={styles.ticketNotchBottom} />
        </span>
        <span style={styles.ticketHalf}>
          <span style={styles.ticketPersonRow}>
            <span style={styles.ticketAvatar} aria-hidden>
              {acceptor.initial}
            </span>
            <span style={styles.ticketName}>{acceptor.name}</span>
          </span>
          <span style={styles.statePillRow}>
            <span style={pillStyle}>{TICKET_STATE_LABEL[displayState]}</span>
          </span>
          {voided ? <span style={styles.ticketCaption}>Voided — chore completed</span> : null}
        </span>
      </button>
      {onApprove != null && displayState === 'awaiting' ? (
        <>
          <div style={styles.rowDivider} />
          <div style={{...styles.utilityRow, minHeight: 52}}>
            <span style={{...styles.choreMeta, flex: 1, minWidth: 0}}>Needs parent sign-off</span>
            <button type="button" className="cho-btn cho-focusable" style={styles.approveBtn} onClick={onApprove}>
              Approve
            </button>
          </div>
        </>
      ) : null}
      {expanded ? (
        <>
          <div style={styles.rowDivider} />
          <div style={styles.ticketDetail}>
            <span>
              {swap.id} · {swap.sentLabel} · {chore.pts} pts move with the chore
            </span>
            {swap.note != null ? <span>“{swap.note}” — {offerer.name}</span> : null}
            {displayState === 'approved' ? <span>Approved — {chore.title} now belongs to {KIDS[chore.kidId].name}</span> : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// STREAK LADDER — 44px flame header + 7 × 32px day rows (Sun→Sat). Day
// cells are decorative (aria-hidden); the card carries one summary
// sentence. SHIELD days render the amber 16px shield + 'Sick-day pass',
// encoding WHY the gap didn't break the streak. Sat derives live.
// ---------------------------------------------------------------------------

interface StreakLadderCardProps {
  kid: Kid;
  streak: number;
  satDone: boolean;
  reducedMotion: boolean;
}

function StreakLadderCard({kid, streak, satDone, reducedMotion}: StreakLadderCardProps) {
  const days: DayState[] = [...kid.week, satDone ? 'done' : 'empty'];
  const shieldDay = kid.week.findIndex(day => day === 'shield');
  const summary =
    `${kid.name} — ${streak} day streak` +
    (shieldDay >= 0 ? `, shield used ${DAY_NAMES[shieldDay]}` : '') +
    (satDone ? ', Saturday complete' : ', Saturday still open');
  return (
    <section style={styles.listCard} aria-label={summary}>
      <div style={styles.ladderHeader}>
        <h2 style={{...styles.ladderKid, margin: 0}}>{kid.name}</h2>
        <FlameCount
          value={streak}
          reducedMotion={reducedMotion}
          iconSize="md"
          numeralStyle={styles.ladderCountNum}
          label={`${kid.name} streak ${streak} days`}
        />
        <span style={styles.ladderCountUnit}>day streak</span>
      </div>
      <div style={styles.rowDivider} />
      <div aria-hidden>
        {days.map((day, index) => (
          <div key={DAY_NAMES[index]} style={styles.ladderDayRow}>
            <span style={styles.ladderDayInitial}>{DAY_INITIALS[index]}</span>
            {day === 'shield' ? (
              <>
                <span style={styles.ladderShield}>
                  <Icon icon={ShieldIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.ladderDayMeta}>Sick-day pass</span>
              </>
            ) : (
              <span
                style={{
                  ...styles.ladderDot,
                  ...(day === 'done' ? styles.ladderDotDone : styles.ladderDotEmpty),
                }}
              />
            )}
            {index === 6 && day === 'done' ? <span style={styles.ladderDayMeta}>Today</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; drag is garnish, >120px past medium closes), 52px header
// with 44×44 X, focus-trapped dialog. Only one sheet mounts at a time.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, footer, children}: SheetProps) {
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
      className="cho-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease, height 240ms ease',
      }}>
      <button
        type="button"
        className="cho-btn cho-focusable"
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
        <button type="button" className="cho-btn cho-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SWAP SHEET BODY — 15-row chore picker (the sheet body is the ONE legal
// inner scroller; at LARGE detent the picker scrolls), 36px segmented
// sibling radiogroup with arrow keys, optional note formField validating
// ON BLUR (never per keystroke; error clears the moment the value is valid).
// ---------------------------------------------------------------------------

interface SwapSheetBodyProps {
  chores: ChoreMap;
  selectedChoreId: string;
  acceptorId: KidId;
  note: string;
  noteError: string | null;
  onSelectChore: (choreId: string) => void;
  onSelectAcceptor: (kidId: KidId) => void;
  onNoteChange: (note: string) => void;
  onNoteBlur: () => void;
}

const NOTE_MAX = 80;

function SwapSheetBody({
  chores,
  selectedChoreId,
  acceptorId,
  note,
  noteError,
  onSelectChore,
  onSelectAcceptor,
  onNoteChange,
  onNoteBlur,
}: SwapSheetBodyProps) {
  const offererId = chores[selectedChoreId].kidId;
  const siblings = KID_ORDER.filter(kidId => kidId !== offererId);
  const pickable = CHORE_ORDER.map(id => chores[id]);
  return (
    <div>
      <div style={styles.sheetSectionLabel}>Chore to swap</div>
      <div style={styles.pickerCard} role="radiogroup" aria-label="Chore to swap">
        {pickable.map((chore, index) => {
          const disabled = chore.status !== 'pending';
          const selected = chore.id === selectedChoreId;
          return (
            <div key={chore.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                aria-disabled={disabled}
                className="cho-btn cho-focusable"
                style={{
                  ...styles.pickerRow,
                  ...(selected ? styles.pickerRowSelected : null),
                  ...(disabled ? {opacity: 0.45} : null),
                }}
                onClick={() => onSelectChore(chore.id)}
                onKeyDown={event =>
                  moveRovingFocus(event, delta => {
                    const enabled = pickable.filter(item => item.status === 'pending');
                    const at = enabled.findIndex(item => item.id === selectedChoreId);
                    const next = enabled[(at + delta + enabled.length) % enabled.length];
                    if (next != null) onSelectChore(next.id);
                  })
                }>
                <span style={{...styles.pickerRadio, ...(selected ? styles.pickerRadioOn : null)}} aria-hidden>
                  {selected ? <span style={styles.pickerRadioDot} /> : null}
                </span>
                <span style={styles.pickerKidTag} aria-hidden>
                  {KIDS[chore.kidId].initial}
                </span>
                <span style={styles.pickerTitle}>{chore.title}</span>
                <span style={styles.pickerMeta}>{disabled ? 'Done' : `${chore.pts} pts`}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div style={styles.sheetSectionLabel}>Offer to</div>
      <div style={styles.segmented} role="radiogroup" aria-label="Offer to">
        {siblings.map(kidId => {
          const on = kidId === acceptorId;
          return (
            <button
              key={kidId}
              type="button"
              role="radio"
              aria-checked={on}
              className="cho-btn cho-focusable"
              style={{...styles.segment, ...(on ? styles.segmentOn : null)}}
              onClick={() => onSelectAcceptor(kidId)}
              onKeyDown={event =>
                moveRovingFocus(event, delta => {
                  const at = siblings.indexOf(acceptorId);
                  onSelectAcceptor(siblings[(at + delta + siblings.length) % siblings.length]);
                })
              }>
              {KIDS[kidId].name}
            </button>
          );
        })}
      </div>

      <div style={{...styles.formField, marginTop: 16}}>
        <label htmlFor="cho-swap-note" style={styles.formLabel}>
          Note (optional)
        </label>
        <input
          id="cho-swap-note"
          type="text"
          value={note}
          placeholder="Sweeten the deal…"
          style={{
            ...styles.formInput,
            boxShadow: noteError != null ? 'inset 0 0 0 2px var(--color-error)' : undefined,
          }}
          aria-invalid={noteError != null}
          aria-describedby={noteError != null ? 'cho-swap-note-error' : undefined}
          onChange={event => onNoteChange(event.target.value)}
          onBlur={onNoteBlur}
        />
        {noteError != null ? (
          <span id="cho-swap-note-error" style={styles.fieldError}>
            <Icon icon={AlertCircleIcon} size="sm" color="inherit" />
            {noteError}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SKELETON — 4 rows at exact 60px chore geometry; deterministic widths;
// one shared 1.6s shimmer sweep, REMOVED entirely under reduced motion.
// ---------------------------------------------------------------------------

function SkeletonRows() {
  return (
    <>
      {SKELETON_PATTERN.map((pattern, index) => (
        <div key={pattern.primary + pattern.secondary + String(index)}>
          {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
          <div style={styles.skeletonRow} aria-hidden>
            <span className="cho-shimmer" style={{...styles.skeletonSquare, position: 'relative', overflow: 'hidden'}} />
            <span style={styles.skeletonBars}>
              <span className="cho-shimmer" style={{...styles.skeletonBar, width: pattern.primary, position: 'relative', overflow: 'hidden'}} />
              <span className="cho-shimmer" style={{...styles.skeletonBar, width: pattern.secondary, position: 'relative', overflow: 'hidden'}} />
            </span>
          </div>
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — App holds {chores, swaps, ui}; every surface calls one
// of the handlers below and every visible aggregate (rings, header counts,
// badges, ladder dots, ticket states) DERIVES. Undo restores the exact
// prior {chores, swaps, swapOrder} snapshot in one assignment.
// ---------------------------------------------------------------------------

type TabId = 'today' | 'streaks' | 'swaps' | 'family';

const TAB_DEFS: Array<{id: TabId; label: string; title: string}> = [
  {id: 'today', label: 'Today', title: 'Saturday chores'},
  {id: 'streaks', label: 'Streaks', title: 'Streaks'},
  {id: 'swaps', label: 'Swaps', title: 'Swaps'},
  {id: 'family', label: 'Family', title: 'Family'},
];

interface UndoSnapshot {
  chores: ChoreMap;
  swaps: SwapMap;
  swapOrder: string[];
}

interface ToastState {
  seq: number;
  text: string;
  snapshot: UndoSnapshot | null;
}

interface UiState {
  tab: TabId;
  activeKidToday: KidId;
  familyScreen: 'root' | 'approvals';
  scrollByTab: Record<TabId, number>;
  expandedSwapIds: string[];
  menuChoreId: string | null;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  sheetChoreId: string;
  sheetAcceptorId: KidId;
  sheetNote: string;
  sheetNoteError: string | null;
  loading: boolean;
  toast: ToastState | null;
}

interface ChoreoState {
  chores: ChoreMap;
  swaps: SwapMap;
  swapOrder: string[];
  ui: UiState;
}

const INITIAL_STATE: ChoreoState = {
  chores: Object.fromEntries(CHORE_LIST.map(chore => [chore.id, chore])),
  swaps: Object.fromEntries(SWAP_LIST.map(swap => [swap.id, swap])),
  swapOrder: SWAP_ORDER,
  ui: {
    tab: 'today',
    activeKidToday: 'maya',
    familyScreen: 'root',
    scrollByTab: {today: 0, streaks: 0, swaps: 0, family: 0},
    expandedSwapIds: [],
    menuChoreId: null,
    sheetOpen: false,
    sheetDetent: 'medium',
    sheetChoreId: 'm2',
    sheetAcceptorId: 'leo',
    sheetNote: '',
    sheetNoteError: null,
    loading: false,
    toast: null,
  },
};

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileChoreStreakChartTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<ChoreoState>(INITIAL_STATE);
  const {chores, swaps, swapOrder, ui} = state;

  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const toastSeqRef = useRef(0);

  const patchUi = useCallback((patch: Partial<UiState>) => {
    setState(prev => ({...prev, ui: {...prev.ui, ...patch}}));
  }, []);

  const nextToast = (text: string, snapshot: UndoSnapshot | null): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, text, snapshot};
  };

  /**
   * Every reversible mutation flows through here: snapshot first, apply,
   * toast with Undo. NO confirm dialogs anywhere — everything is one
   * snapshot deep (undoOverConfirm).
   */
  const mutate = (
    apply: (prev: ChoreoState) => Pick<ChoreoState, 'chores' | 'swaps' | 'swapOrder'>,
    text: (next: ChoreoState) => string,
    uiPatch?: Partial<UiState>,
  ) => {
    setState(prev => {
      const snapshot: UndoSnapshot = {chores: prev.chores, swaps: prev.swaps, swapOrder: prev.swapOrder};
      const applied = apply(prev);
      const next: ChoreoState = {...prev, ...applied};
      return {
        ...next,
        ui: {
          ...prev.ui,
          menuChoreId: null,
          loading: false,
          ...uiPatch,
          toast: nextToast(text(next), snapshot),
        },
      };
    });
  };

  /** ONE assignment restores {chores, swaps, swapOrder}; toast reads 'Restored'. */
  const undo = () => {
    setState(prev => {
      const snapshot = prev.ui.toast?.snapshot;
      if (snapshot == null) return prev;
      return {
        ...prev,
        ...snapshot,
        ui: {...prev.ui, toast: nextToast('Restored', null)},
      };
    });
  };

  // DERIVED — never stored twice.
  const counts = Object.fromEntries(KID_ORDER.map(kidId => [kidId, kidCounts(chores, kidId)])) as Record<
    KidId,
    ReturnType<typeof kidCounts>
  >;
  const totalDone = KID_ORDER.reduce((sum, kidId) => sum + counts[kidId].done, 0);
  const totalChores = KID_ORDER.reduce((sum, kidId) => sum + counts[kidId].total, 0);
  const ptsDone = KID_ORDER.reduce((sum, kidId) => sum + counts[kidId].ptsDone, 0);
  const ptsTotal = KID_ORDER.reduce((sum, kidId) => sum + counts[kidId].ptsTotal, 0);
  const swapsBadge = pendingSwapCount(swaps, swapOrder, chores);
  const familyBadge = approvalCount(swaps, swapOrder, chores);
  const passesLeft = SICK_DAY_PASSES_MONTHLY - shieldsUsed();
  const bestKid = KID_ORDER.reduce((best, kidId) => (kidStreak(chores, kidId) > kidStreak(chores, best) ? kidId : best), KID_ORDER[0]);
  const activeKid = KIDS[ui.activeKidToday];
  const activeKidChores = choresFor(chores, ui.activeKidToday);
  const activeCounts = counts[ui.activeKidToday];
  const tabDef = TAB_DEFS.find(def => def.id === ui.tab) ?? TAB_DEFS[0];
  const navTitle = ui.tab === 'family' && ui.familyScreen === 'approvals' ? 'Approvals' : tabDef.title;

  // LARGE-TITLE COLLAPSE — IntersectionObserver sentinel above the large
  // title; the navBar center title fades in once the sentinel scrolls
  // under the chrome. User-scroll driven, so it stays deterministic.
  const [sentinelVisible, setSentinelVisible] = useState(true);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry != null) setSentinelVisible(entry.isIntersecting);
      },
      {rootMargin: '-56px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);
  const compactTitleVisible = !sentinelVisible || (ui.tab === 'family' && ui.familyScreen === 'approvals');

  // FOCUS PLUMBING — sheet focus enters with preventScroll (binding
  // amendment: plain .focus() scroll-reveals the animating sheet inside
  // the locked overflow-hidden column and beaches it mid-screen).
  useEffect(() => {
    if (ui.sheetOpen) sheetRef.current?.focus({preventScroll: true});
  }, [ui.sheetOpen]);
  useEffect(() => {
    if (ui.menuChoreId != null) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [ui.menuChoreId]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.menuChoreId != null) {
        patchUi({menuChoreId: null});
        menuOpenerRef.current?.focus();
      } else if (ui.sheetOpen) {
        patchUi({sheetOpen: false});
        sheetOpenerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ui.menuChoreId, ui.sheetOpen, patchUi]);

  // PER-TAB SCROLL — record on exit, restore on entry (the demo's outer
  // scroller owns the page; sticky chrome is width-independent).
  const switchTab = (tab: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (tab === ui.tab) {
      // The one legal reset: re-tap pops to root + scrolls top.
      patchUi({familyScreen: ui.tab === 'family' ? 'root' : ui.familyScreen});
      scroller.scrollTop = 0;
      return;
    }
    const wasLoading = ui.loading;
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        scrollByTab: {...prev.ui.scrollByTab, [prev.ui.tab]: scroller.scrollTop},
        tab,
        // Overlays close on tab switch; the toast dock persists.
        sheetOpen: false,
        menuChoreId: null,
        loading: false,
        toast: wasLoading ? nextToast('Updated just now', null) : prev.ui.toast,
      },
    }));
  };
  useEffect(() => {
    const scroller = getScrollParent(shellRef.current);
    scroller.scrollTop = ui.scrollByTab[ui.tab] ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.tab]);

  // MUTATIONS ----------------------------------------------------------------

  const setChore = (prev: ChoreoState, choreId: string, patch: Partial<Chore>) => ({
    chores: {...prev.chores, [choreId]: {...prev.chores[choreId], ...patch}},
    swaps: prev.swaps,
    swapOrder: prev.swapOrder,
  });

  /** Plain tap: pending→done (or →claimed on parentCheck rows). */
  const completeChore = (choreId: string) => {
    const chore = chores[choreId];
    if (chore.status !== 'pending') return;
    if (chore.parentCheck) {
      mutate(
        prev => setChore(prev, choreId, {status: 'claimed'}),
        () => `${chore.title} claimed — needs parent check`,
      );
      return;
    }
    mutate(
      prev => setChore(prev, choreId, {status: 'done'}),
      next => {
        const streak = kidStreak(next.chores, chore.kidId);
        return kidSatDone(next.chores, chore.kidId)
          ? `${chore.title} done — streak ${streak}`
          : `${chore.title} done`;
      },
    );
  };

  const uncompleteChore = (choreId: string) => {
    const chore = chores[choreId];
    mutate(
      prev => setChore(prev, choreId, {status: 'pending'}),
      () => `${chore.title} marked not done`,
    );
  };

  /** Hold-to-verify commit (also reachable via menu + Approvals screen). */
  const verifyChore = (choreId: string) => {
    const chore = chores[choreId];
    mutate(
      prev => setChore(prev, choreId, {status: 'verified'}),
      () => `${chore.title} verified`,
    );
  };

  /** Approve executes immediately + Undo, never a confirm. */
  const approveSwap = (swapId: string) => {
    const swap = swaps[swapId];
    const chore = chores[swap.choreId];
    mutate(
      prev => ({
        chores: {...prev.chores, [swap.choreId]: {...prev.chores[swap.choreId], kidId: swap.acceptorId}},
        swaps: {...prev.swaps, [swapId]: {...prev.swaps[swapId], state: 'approved' as const}},
        swapOrder: prev.swapOrder,
      }),
      () => `Swap approved — ${chore.title} moves to ${KIDS[swap.acceptorId].name}`,
    );
  };

  const sendOffer = () => {
    if (ui.sheetNote.length > NOTE_MAX) {
      // Submit stays enabled; pressing it validates and focuses the fix.
      patchUi({sheetNoteError: `Keep the note under ${NOTE_MAX} characters`});
      document.getElementById('cho-swap-note')?.focus();
      return;
    }
    const chore = chores[ui.sheetChoreId];
    const acceptor = KIDS[ui.sheetAcceptorId];
    const newId = NEW_SWAP_IDS[Math.min(swapOrder.length - SWAP_ORDER.length, NEW_SWAP_IDS.length - 1)];
    mutate(
      prev => ({
        chores: prev.chores,
        swaps: {
          ...prev.swaps,
          [newId]: {
            id: newId,
            choreId: chore.id,
            offererId: chore.kidId,
            acceptorId: acceptor.id,
            state: 'offered' as const,
            note: prev.ui.sheetNote.trim() === '' ? null : prev.ui.sheetNote.trim(),
            sentLabel: 'Sent just now',
          },
        },
        swapOrder: [...prev.swapOrder, newId],
      }),
      () => `Offer sent to ${acceptor.name}`,
      {sheetOpen: false, sheetNote: '', sheetNoteError: null},
    );
    sheetOpenerRef.current?.focus();
  };

  const openSheet = (opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener;
    const firstPending = CHORE_ORDER.find(id => chores[id].status === 'pending') ?? CHORE_ORDER[0];
    const offerer = chores[firstPending].kidId;
    patchUi({
      sheetOpen: true,
      sheetDetent: 'medium',
      sheetChoreId: firstPending,
      sheetAcceptorId: KID_ORDER.find(kidId => kidId !== offerer) ?? 'leo',
      sheetNote: '',
      sheetNoteError: null,
      menuChoreId: null,
    });
  };
  const closeSheet = () => {
    patchUi({sheetOpen: false});
    sheetOpenerRef.current?.focus();
  };

  const onRefresh = () => {
    patchUi({loading: true, toast: nextToast('Loading', null)});
  };
  const selectKid = (kidId: KidId) => {
    patchUi({
      activeKidToday: kidId,
      menuChoreId: null,
      loading: false,
      ...(ui.loading ? {toast: nextToast('Updated just now', null)} : null),
    });
  };

  const toggleMenu = (choreId: string, opener: HTMLElement) => {
    menuOpenerRef.current = opener;
    patchUi({menuChoreId: ui.menuChoreId === choreId ? null : choreId});
  };

  const toggleTicket = (swapId: string) => {
    patchUi({
      expandedSwapIds: ui.expandedSwapIds.includes(swapId)
        ? ui.expandedSwapIds.filter(id => id !== swapId)
        : [...ui.expandedSwapIds, swapId],
    });
  };

  const menuActionsFor = (chore: Chore): MenuAction[] => {
    const closeThen = (run: () => void) => () => {
      run();
      menuOpenerRef.current?.focus();
    };
    if (chore.status === 'pending' && chore.parentCheck) {
      return [
        {id: 'claim', label: 'Mark claimed', run: closeThen(() => completeChore(chore.id))},
        {id: 'verify', label: 'Mark verified', run: closeThen(() => verifyChore(chore.id))},
      ];
    }
    if (chore.status === 'pending') {
      return [{id: 'done', label: 'Mark done', run: closeThen(() => completeChore(chore.id))}];
    }
    if (chore.status === 'claimed') {
      return [
        {id: 'verify', label: 'Mark verified', run: closeThen(() => verifyChore(chore.id))},
        {id: 'undone', label: 'Return to to-do', run: closeThen(() => uncompleteChore(chore.id))},
      ];
    }
    return [{id: 'undone', label: 'Mark not done', run: closeThen(() => uncompleteChore(chore.id))}];
  };

  // Live ticket bound to a chore (Today shows it inline under its row).
  const ticketForChore = (choreId: string): Swap | null => {
    const id = swapOrder.find(swapId => swaps[swapId].choreId === choreId && ticketState(swaps[swapId], chores) !== 'approved');
    return id == null ? null : swaps[id];
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // TAB CONTENT ---------------------------------------------------------------

  const todayContent = (
    <>
      <div style={styles.kidSwitcher} role="radiogroup" aria-label="Choose kid">
        {KID_ORDER.map(kidId => {
          const kid = KIDS[kidId];
          const active = kidId === ui.activeKidToday;
          const kidChores = choresFor(chores, kidId);
          return (
            <button
              key={kidId}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              className="cho-btn cho-focusable"
              style={styles.kidRingButton}
              aria-label={`${kid.name}, ${counts[kidId].done} of ${counts[kidId].total} done`}
              onClick={() => selectKid(kidId)}
              onKeyDown={event =>
                moveRovingFocus(event, delta => {
                  const at = KID_ORDER.indexOf(ui.activeKidToday);
                  const next = KID_ORDER[(at + delta + KID_ORDER.length) % KID_ORDER.length];
                  selectKid(next);
                  const btn = document.getElementById(`cho-kid-${next}`);
                  btn?.focus();
                })
              }
              id={`cho-kid-${kidId}`}>
              <KidRing kid={kid} chores={kidChores} />
              <span style={{...styles.kidName, ...(active ? styles.kidNameActive : null)}}>{kid.name}</span>
            </button>
          );
        })}
      </div>

      <h2 style={styles.sectionHeader}>
        {activeKid.name} — {activeCounts.done} of {activeCounts.total} done
      </h2>
      <div style={styles.listCard} aria-busy={ui.loading || undefined}>
        {ui.loading ? (
          <SkeletonRows />
        ) : (
          activeKidChores.map((chore, index) => {
            const boundSwap = ticketForChore(chore.id);
            return (
              <ChoreRowView
                key={chore.id}
                chore={chore}
                streak={kidStreak(chores, chore.kidId)}
                isLast={index === activeKidChores.length - 1}
                menuOpen={ui.menuChoreId === chore.id}
                reducedMotion={reducedMotion}
                menuRef={menuRef}
                menuActions={menuActionsFor(chore)}
                onCheckTap={() => {
                  if (chore.status === 'pending') completeChore(chore.id);
                  else if (chore.status === 'claimed') {
                    patchUi({toast: nextToast('Hold the check to verify — or use the row menu', null)});
                  } else uncompleteChore(chore.id);
                }}
                onHoldComplete={() => verifyChore(chore.id)}
                onTextTap={() => {
                  if (chore.status === 'pending' && !chore.parentCheck) completeChore(chore.id);
                  else if (chore.status === 'done') uncompleteChore(chore.id);
                  else patchUi({toast: nextToast(chore.status === 'claimed' ? 'Hold the check to verify — or use the row menu' : 'Verified — use the row menu to change', null)});
                }}
                onToggleMenu={opener => toggleMenu(chore.id, opener)}
                inlineTicket={
                  boundSwap != null ? (
                    <SwapTicketView
                      swap={boundSwap}
                      chore={chores[boundSwap.choreId]}
                      displayState={ticketState(boundSwap, chores)}
                      expanded={ui.expandedSwapIds.includes(boundSwap.id)}
                      onToggle={() => toggleTicket(boundSwap.id)}
                      onApprove={null}
                    />
                  ) : null
                }
              />
            );
          })
        )}
      </div>
      {!ui.loading && activeCounts.done === activeCounts.total ? (
        <p style={styles.terminalCaption}>
          All {activeCounts.total} done — {activeCounts.ptsDone} pts
        </p>
      ) : null}
    </>
  );

  const streaksContent = (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12}}>
      {KID_ORDER.map(kidId => (
        <StreakLadderCard
          key={kidId}
          kid={KIDS[kidId]}
          streak={kidStreak(chores, kidId)}
          satDone={kidSatDone(chores, kidId)}
          reducedMotion={reducedMotion}
        />
      ))}
      <h2 style={{...styles.sectionHeader, margin: '8px 0 -4px'}}>Family best</h2>
      <div style={styles.listCard}>
        <div style={styles.familyBestRow}>
          <span style={{...styles.utilityLabel, fontWeight: 500}}>{KIDS[bestKid].name}</span>
          <FlameCount
            value={kidStreak(chores, bestKid)}
            reducedMotion={reducedMotion}
            label={`Family best ${kidStreak(chores, bestKid)} days`}
          />
          <span style={styles.ladderCountUnit}>days</span>
        </div>
      </div>
    </div>
  );

  const swapsContent = (
    <>
      <h2 style={styles.sectionHeader}>Pending swaps</h2>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {swapOrder.map(swapId => (
          <div key={swapId} style={styles.listCard}>
            <SwapTicketView
              swap={swaps[swapId]}
              chore={chores[swaps[swapId].choreId]}
              displayState={ticketState(swaps[swapId], chores)}
              expanded={ui.expandedSwapIds.includes(swapId)}
              onToggle={() => toggleTicket(swapId)}
              onApprove={() => approveSwap(swapId)}
            />
          </div>
        ))}
      </div>
    </>
  );

  const approvalItems: Array<{id: string; title: string; meta: string; action: string; run: () => void}> = [
    ...swapOrder
      .filter(swapId => ticketState(swaps[swapId], chores) === 'awaiting')
      .map(swapId => {
        const swap = swaps[swapId];
        return {
          id: swapId,
          title: `${KIDS[swap.offererId].name} → ${KIDS[swap.acceptorId].name} · ${chores[swap.choreId].title}`,
          meta: `${swap.id} · both kids agreed`,
          action: 'Approve',
          run: () => approveSwap(swapId),
        };
      }),
    ...CHORE_ORDER.filter(id => chores[id].parentCheck && chores[id].status === 'claimed').map(choreId => ({
      id: choreId,
      title: `${KIDS[chores[choreId].kidId].name} · ${chores[choreId].title}`,
      meta: 'Claimed — needs your check',
      action: 'Verify',
      run: () => verifyChore(choreId),
    })),
  ];

  const familyContent =
    ui.familyScreen === 'approvals' ? (
      <>
        <h2 style={styles.sectionHeader}>Waiting on you</h2>
        <div style={styles.listCard}>
          {approvalItems.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyCircle}>
                <Icon icon={CheckCircle2Icon} size="lg" color="inherit" />
              </span>
              <h3 style={styles.emptyTitle}>All clear</h3>
              <p style={styles.emptyBody}>Approvals and parent checks appear here.</p>
            </div>
          ) : (
            approvalItems.map((item, index) => (
              <div key={item.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <div style={styles.approvalRow}>
                  <div style={styles.approvalText}>
                    <span style={styles.choreTitle}>{item.title}</span>
                    <span style={styles.choreMeta}>{item.meta}</span>
                  </div>
                  <button type="button" className="cho-btn cho-focusable" style={styles.approveBtn} onClick={item.run}>
                    {item.action}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    ) : (
      <>
        <h2 style={styles.sectionHeader}>Household</h2>
        <div style={styles.listCard}>
          <button
            type="button"
            className="cho-btn cho-focusable"
            style={styles.utilityRow}
            onClick={() => patchUi({familyScreen: 'approvals'})}>
            <span style={styles.utilityLabel}>Approvals</span>
            {familyBadge > 0 ? <span style={styles.utilityBadge}>{familyBadge}</span> : null}
            <span style={styles.utilityChevron}>
              <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
            </span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            className="cho-btn cho-focusable"
            style={styles.utilityRow}
            onClick={() => patchUi({tab: 'streaks', menuChoreId: null})}>
            <span style={styles.utilityLabel}>Sick-day passes</span>
            <span style={styles.utilityValue}>{passesLeft} left</span>
            <span style={styles.utilityChevron}>
              <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
            </span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            className="cho-btn cho-focusable"
            style={styles.utilityRow}
            onClick={() => patchUi({toast: nextToast(`Points this week: ${ptsDone} of ${ptsTotal}`, null)})}>
            <span style={styles.utilityLabel}>Points this week</span>
            <span style={styles.utilityValue}>
              {ptsDone} of {ptsTotal} pts
            </span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            className="cho-btn cho-focusable"
            style={styles.utilityRow}
            onClick={() => patchUi({toast: nextToast('Manage kids lives in parent settings', null)})}>
            <span style={styles.utilityLabel}>Manage kids</span>
            <span style={styles.utilityChevron}>
              <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
            </span>
          </button>
        </div>
      </>
    );

  const TAB_ICONS: Record<TabId, typeof CheckSquareIcon> = {
    today: CheckSquareIcon,
    streaks: FlameIcon,
    swaps: ArrowLeftRightIcon,
    family: UsersIcon,
  };
  const tabBadges: Partial<Record<TabId, number>> = {swaps: swapsBadge, family: familyBadge};

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{CHOREO_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {ui.tab === 'family' && ui.familyScreen === 'approvals' ? (
              <button
                type="button"
                className="cho-btn cho-focusable"
                style={styles.backBtn}
                onClick={() => patchUi({familyScreen: 'root'})}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>Family</span>
              </button>
            ) : (
              <ChoreoMark />
            )}
          </div>
          <span className="cho-fade" style={{...styles.navTitle, opacity: compactTitleVisible ? 1 : 0}} aria-hidden={!compactTitleVisible}>
            {navTitle}
          </span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="cho-btn cho-focusable"
              style={styles.iconBtn}
              aria-label="Refresh"
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {/* Sentinel for the large-title collapse (0 height, above title). */}
          <div ref={sentinelRef} aria-hidden />
          {ui.tab === 'family' && ui.familyScreen === 'approvals' ? (
            <h1 className="cho-vh">Approvals</h1>
          ) : (
            <div style={styles.largeTitle}>
              <h1 style={styles.largeTitleText}>{tabDef.title}</h1>
            </div>
          )}
          {ui.tab === 'today' ? (
            <p style={styles.headerCaption}>
              Sat Jul 4 · {totalDone} of {totalChores} done · {ptsDone} of {ptsTotal} pts
            </p>
          ) : null}

          {ui.tab === 'today' ? todayContent : null}
          {ui.tab === 'streaks' ? streaksContent : null}
          {ui.tab === 'swaps' ? swapsContent : null}
          {ui.tab === 'family' ? familyContent : null}
          <div style={styles.bottomSpacer} />
        </main>

        {ui.tab === 'swaps' ? (
          <div style={styles.swapFooter}>
            <button
              type="button"
              className="cho-btn cho-focusable"
              style={styles.primaryBtn}
              onClick={event => openSheet(event.currentTarget)}>
              Propose swap
            </button>
          </div>
        ) : null}

        {/* THE one polite live region — sticky-in-flow above the tabBar. */}
        <div
          style={{...styles.toastAnchor, bottom: ui.tab === 'swaps' ? 156 : 76}}
          aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="cho-fade">
              <span style={styles.toastText}>{ui.toast.text}</span>
              {ui.toast.snapshot != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="cho-btn cho-focusable" style={styles.toastUndoBtn} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} role="tablist" aria-label="Choreo tabs">
          {TAB_DEFS.map(def => {
            const active = def.id === ui.tab;
            const badge = tabBadges[def.id];
            return (
              <button
                key={def.id}
                type="button"
                role="tab"
                id={`cho-tab-${def.id}`}
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                className="cho-btn cho-focusable"
                style={{...styles.tabItem, ...(active ? {color: BRAND_TEXT} : null)}}
                onClick={() => switchTab(def.id)}
                onKeyDown={event =>
                  moveRovingFocus(event, delta => {
                    const at = TAB_DEFS.findIndex(item => item.id === ui.tab);
                    const next = TAB_DEFS[(at + delta + TAB_DEFS.length) % TAB_DEFS.length];
                    switchTab(next.id);
                    document.getElementById(`cho-tab-${next.id}`)?.focus();
                  })
                }>
                <span style={styles.tabIconWrap}>
                  <Icon icon={TAB_ICONS[def.id]} size="md" color="inherit" />
                  {badge != null && badge > 0 ? <span style={styles.tabBadge}>{badge}</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? {fontWeight: 600} : null)}}>{def.label}</span>
              </button>
            );
          })}
        </nav>

        {ui.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {ui.sheetOpen ? (
          <Sheet
            titleId="cho-swap-sheet-title"
            title="New swap"
            detent={ui.sheetDetent}
            onDetentChange={detent => patchUi({sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button type="button" className="cho-btn cho-focusable" style={styles.primaryBtn} onClick={sendOffer}>
                Send offer
              </button>
            }>
            <SwapSheetBody
              chores={chores}
              selectedChoreId={ui.sheetChoreId}
              acceptorId={ui.sheetAcceptorId}
              note={ui.sheetNote}
              noteError={ui.sheetNoteError}
              onSelectChore={choreId => {
                const offerer = chores[choreId].kidId;
                patchUi({
                  sheetChoreId: choreId,
                  sheetAcceptorId:
                    ui.sheetAcceptorId === offerer
                      ? (KID_ORDER.find(kidId => kidId !== offerer) ?? ui.sheetAcceptorId)
                      : ui.sheetAcceptorId,
                });
              }}
              onSelectAcceptor={kidId => patchUi({sheetAcceptorId: kidId})}
              onNoteChange={note =>
                patchUi({
                  sheetNote: note,
                  // Reward the fix immediately: clear once valid while typing.
                  sheetNoteError: note.length <= NOTE_MAX ? null : ui.sheetNoteError,
                })
              }
              onNoteBlur={() =>
                patchUi({sheetNoteError: ui.sheetNote.length > NOTE_MAX ? `Keep the note under ${NOTE_MAX} characters` : null})
              }
            />
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
