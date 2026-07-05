// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Maple Street Block Party potluck
 *   board for Crockpot Social: 20 SLOTS across four courses (Apps 5 = 3
 *   claimed + 1 pending + 1 open; Mains 6 = 6 claimed; Sides 4 = 2 claimed
 *   + 2 open; Desserts 5 = 1 claimed + 4 open — 12 + 1 + 7 = 20 ✓), eight
 *   named GUESTS plus 'You', a fixed '2d 14h' countdown pill, and a fixed
 *   'Updated just now' caption. No Date.now(), no Math.random(), no
 *   network media (avatars are id-derived-hue initials, the brand mark is
 *   an inline casserole-lid SVG).
 * @output Crockpot Social — Potluck Signup Board: a 390px MOBILE
 *   single-event surface. A 52px navBar (44×44 casserole-lid brand
 *   button · 'Block Party Potluck' 17/600 · non-interactive '2d 14h'
 *   countdown pill) over a StillNeededSummary card ('Need 7 more dishes'
 *   22/700, deficit chips −4/−2/−1 summing to 7, a 72×72 four-arc
 *   CourseBalanceDial reading 60%), then four course blocks — sectionHeader
 *   28px row + 120px horizontal-snap SlotRail of 148×120 tri-state tickets
 *   (claimed / pending / open) — and a derived '12 of 20 slots filled ·
 *   Updated just now' terminal caption. Signature move: press-and-hold an
 *   open ticket (250ms intent + 700ms brand fill sweep) claims it through
 *   the SAME update() the sheet path uses, then opens the claim sheet in
 *   rename mode; tap opens the two-detent claim sheet whose DupeRadar
 *   token-overlap scorer flags '2 potato salads already' live against all
 *   13 claimed/pending dishes. Releasing a claim is undo-over-confirm:
 *   the detail sheet's ellipsis actionSheet 'Release claim' executes
 *   IMMEDIATELY, every aggregate rebalances, and the sticky toastDock
 *   offers Undo restoring the exact prior patch. No tabBar — single-event
 *   focus.
 * @position Page template; emitted by `astryx template mobile-potluck-signup-board`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrims, claim/detail sheet, actionSheet) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While any
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'} and
 *   restores on close. The toastDock is sticky-in-flow (position:'sticky',
 *   bottom:16 — no tabBar), NOT shell-absolute, so it rides the viewport
 *   on this tall scrolling view per the foundations amendment.
 * Container policy: inset-grouped mobile cards (12px radius, 1px border);
 *   SlotRails are full-bleed-gutter horizontal snap rails (paddingInline
 *   16, scrollPaddingInline 16), not carded; no desktop Layout frames, no
 *   side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Crockpot Social ember — the demo's --color-brand is the
 *   demo logo blue, so the spec hex is quarantined here per house rule).
 *   Interactive/rest-state boundaries get explicit light-dark() pairs at
 *   ≥3:1 against their ACTUAL surface (open-ticket dashed border and
 *   pending border vs the card fill they sit on — math at each
 *   declaration), never hairline tokens. Dial arcs are four explicit
 *   pairs; the starving (<40%) Desserts arc uses the error pair and a
 *   legend row so color is never the only channel.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   between stacked cards · 24px between course sections · 8px between
 *   chips; navBar 52px sticky top z20 (paddingInline 8, grid
 *   '1fr auto 1fr', blur color-mix 86%, 1px borderBottom ALWAYS ON —
 *   noted choice, no scroll wiring); no large-title row, no tabBar.
 *   Tickets 148×120 radius 12 padding 12; rails overflowX auto,
 *   scrollSnapType 'x mandatory', scrollPaddingInline 16, snapAlign
 *   start, 8px gap → at 390: 16+148+8+148 = 320 leaves a 70px peek of
 *   ticket 3 (at 320: 16+148+8 = 172 leaves 148px of ticket 2 — ≥24px
 *   peek law holds). Course block = 28px sectionHeader row + 8px + 120px
 *   rail = 156px. Summary card inset 16, radius 12, 1px border, minHeight
 *   104 (16 + 22 count + 8 + 26 chips + 16), dial 72×72 strokeWidth 8
 *   trailing. Buttons: 48px sheet-footer primary, 36px secondary
 *   (DupeRadar choices, suggestion chips), 44×44 icon buttons. Sheet
 *   detents 55% MEDIUM / calc(100% − 56px) LARGE; 24px grabber zone with
 *   36×5 pill; 52px sheet header; sheet body is the one legal inner
 *   scroller. toastDock sticky bottom 16 z30, toast min-height 48. TYPE
 *   (Figtree via --font-family-body): 22/700 summary count · 17/600 nav +
 *   sheet titles · 16/500 dish names · 16/400 body + inputs (hard floor) ·
 *   13/400 meta · 13/600 sectionHeaders (uppercase, 0.06em, aligned 16px)
 *   · 11/500 overlines, badges, dial labels; nothing under 11px;
 *   tabular-nums on every count.
 *
 * Responsive contract:
 * - Fluid 320–430, zero horizontal overflow (overflowX:'clip' is backstop
 *   only, no width:390 literals): nav title maxWidth 200 ellipsizes;
 *   summary card is a flex row — text column flex 1 minWidth 0, dial
 *   fixed 72, chips wrap at 320 (minHeight 104, not fixed); rails keep
 *   fixed 148px tickets at all widths (peek math above); DupeRadar match
 *   lines ellipsize to one line each at 320; %-based detents hold at any
 *   height.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the snap-rail anatomy is
 *   deliberately phone geometry.
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
  CheckCircle2Icon,
  HourglassIcon,
  MoreHorizontalIcon,
  PlusCircleIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Crockpot Social ember). #C2571B on the
// light body (~#FBF7F1) ≈ 4.6:1 ✓ for 13/600 'Claim this slot' text;
// #F2955C on the dark body (~#17130E) ≈ 7.9:1 ✓.
const BRAND_ACCENT = 'light-dark(#C2571B, #F2955C)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #C2571B ≈ 4.7:1 ✓.
// Dark: white on #F2955C fails (~1.8:1), so the dark side flips to a
// near-black ember — #3A1A05 on #F2955C ≈ 8.6:1 ✓.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #3A1A05)';
// Hold-to-claim fill sweep — 18% brand wash over the open ticket.
const BRAND_TINT_18 = `color-mix(in srgb, ${BRAND_ACCENT} 18%, transparent)`;
// Faint brand wash for the 'You' claimed-ticket surface.
const BRAND_TINT_08 = `color-mix(in srgb, ${BRAND_ACCENT} 8%, transparent)`;
// OPEN-ticket dashed border — an interactive boundary, so it gets an
// explicit pair at ≥3:1 vs its ACTUAL surface (the card fill): #B4531E on
// the light card (~#FFFDF9) ≈ 3.4:1 ✓; #E8935B on the dark card
// (~#221B12) ≈ 3.2:1 ✓. Hairline tokens are for passive separators only.
const OPEN_BORDER = 'light-dark(#B4531E, #E8935B)';
// PENDING-ticket 1.5px solid border vs the muted pending fill it wraps:
// #8A6D1C on the light muted wash (~#F4EFE7) ≈ 3.1:1 ✓; #D4B15F on the
// dark muted wash (~#2A2318) ≈ 3.4:1 ✓.
const PENDING_BORDER = 'light-dark(#8A6D1C, #D4B15F)';
// Dial arc pairs — each ≥3:1 vs the card surface it draws on (light card
// ~#FFFDF9 / dark card ~#221B12):
// Apps ember: #B4531E ≈ 3.4:1 ✓ / #E8935B ≈ 3.2:1 ✓.
const ARC_APPS = 'light-dark(#B4531E, #E8935B)';
// Mains herb green: #2F6C3B ≈ 4.9:1 ✓ / #8FCB9B ≈ 5.6:1 ✓.
const ARC_MAINS = 'light-dark(#2F6C3B, #8FCB9B)';
// Sides lake blue: #175E88 ≈ 6.0:1 ✓ / #7DB8E8 ≈ 5.2:1 ✓.
const ARC_SIDES = 'light-dark(#175E88, #7DB8E8)';
// Desserts is the starving (<40%) course — spec error pair: #B3261E ≈
// 5.3:1 ✓ / #F2B8B5 ≈ 6.9:1 ✓; the legend row beside the dial keeps
// color from being the only channel.
const ARC_DESSERTS = 'light-dark(#B3261E, #F2B8B5)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, two-line clamp,
// visually-hidden h1, sheet slide-in, and the reduced-motion guard.
// Transitions animate transform/opacity only and collapse to instant under
// prefers-reduced-motion.
// ---------------------------------------------------------------------------

const CPS_CSS = `
.cps-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.cps-btn:disabled { cursor: default; }
.cps-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.cps-fade { transition: opacity 200ms ease; }
.cps-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@keyframes cps-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.cps-sheet-in { animation: cps-sheet-in 240ms ease; }
.cps-arc { transition: stroke-dasharray 200ms ease; }
.cps-input:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px ${BRAND_ACCENT};
}
.cps-input::placeholder { color: var(--color-text-secondary); }
.cps-vh {
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
  .cps-fade { transition: none; }
  .cps-sheet-in { animation: none; }
  .cps-arc { transition: none; }
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
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline + blur ALWAYS
  // ON (noted choice — no scroll-under wiring in this template).
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
  navTrailing: {display: 'flex', justifyContent: 'flex-end', paddingInlineEnd: 8},
  navTitle: {
    margin: 0,
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  brandBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_18,
    color: BRAND_ACCENT,
  },
  // Non-interactive countdown pill — 28px, muted fill, 13/600 tabular.
  countdownPill: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // STILL-NEEDED SUMMARY — inset 16, radius 12, minHeight 104 (16 pad + 22
  // count + 8 + 26 chips + 16 pad); chips wrap at 320 so the card grows.
  summaryCard: {
    margin: '12px 16px 0',
    minHeight: 104,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  summaryText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: '22px',
    fontVariantNumeric: 'tabular-nums',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  chipRow: {display: 'flex', flexWrap: 'wrap', gap: 8},
  // Non-interactive status chips — 26px (exempt from the 44px law).
  deficitChip: {
    height: 26,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  legendRow: {display: 'flex', flexWrap: 'wrap', columnGap: 12, rowGap: 4},
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  legendDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  dialWrap: {position: 'relative', width: 72, height: 72, flexShrink: 0},
  dialCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  dialPct: {fontSize: 17, fontWeight: 600, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'},
  dialSub: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)'},
  // COURSE BLOCKS — 24px between sections; header row 28px + 8px + rail.
  courseBlock: {marginTop: 24},
  // sectionHeader aligned to the 16px gutter — rails are full-bleed-gutter,
  // not carded, so 16 (not 32) is correct here per spec.
  sectionHeaderRow: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  sectionHeaderNote: {fontSize: 13, color: 'var(--color-text-secondary)'},
  sectionHeaderCount: {
    marginLeft: 'auto',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // SLOT RAIL — horizontal snap rail; 16+148+8+148 = 320 at 390px leaves a
  // 70px peek of ticket 3 (the scroll affordance).
  rail: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 16,
    paddingBottom: 2,
  },
  // TICKETS — 148×120, radius 12, padding 12, snap-target buttons.
  ticket: {
    position: 'relative',
    width: 148,
    height: 120,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  ticketOpen: {
    border: `1.5px dashed ${OPEN_BORDER}`,
    background: 'var(--color-background-card)',
  },
  ticketClaimed: {
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  // 'You' claims: 2px inset BRAND_ACCENT border via boxShadow + faint wash.
  ticketYou: {
    border: '1px solid transparent',
    boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`,
    background: BRAND_TINT_08,
  },
  ticketPending: {
    border: `1.5px solid ${PENDING_BORDER}`,
    background: 'var(--color-background-muted)',
  },
  holdSweep: {
    position: 'absolute',
    inset: 0,
    background: BRAND_TINT_18,
    transformOrigin: 'left',
    pointerEvents: 'none',
  },
  ticketIconRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    color: BRAND_ACCENT,
  },
  slotLabel: {
    marginTop: 'auto',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  claimCta: {marginTop: 2, fontSize: 13, fontWeight: 600, color: BRAND_ACCENT},
  dishName: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '19px',
    textAlign: 'left',
    maxWidth: '100%',
  },
  claimerLine: {
    marginTop: 'auto',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  youBadge: {
    fontSize: 11,
    fontWeight: 500,
    color: BRAND_FILL_TEXT,
    background: BRAND_ACCENT,
    borderRadius: 999,
    padding: '2px 7px',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
  },
  terminalCaption: {
    margin: '16px 16px 24px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow (foundations amendment: shell-absolute
  // bottom pins to the DOCUMENT bottom on tall scrolling views), bottom 16
  // (no tabBar), z30. The one polite live region.
  toastDock: {
    position: 'sticky',
    bottom: 16,
    zIndex: 30,
    marginInline: 16,
    marginBottom: 16,
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
    paddingInline: 16,
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
  // SHEETS — scrim z40 + sheet z41 absolute inside shell.
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
  },
  grabberPill: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '52px 1fr 52px',
    alignItems: 'center',
    paddingInline: 8,
  },
  sheetTitle: {margin: 0, fontSize: 17, fontWeight: 600, textAlign: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    justifySelf: 'end',
  },
  doneBtn: {
    height: 44,
    minWidth: 52,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
    justifySelf: 'end',
  },
  // The one legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  sheetContextRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  chipRowSheet: {display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16},
  suggestChip: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  fieldLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: 8,
  },
  // formField input — 48px, 16px/400 (hard floor: smaller zooms mobile
  // browsers), muted fill, always-on focus ring via inset boxShadow.
  input: {
    width: '100%',
    height: 48,
    boxSizing: 'border-box',
    background: 'var(--color-background-muted)',
    border: 'none',
    borderRadius: 12,
    paddingInline: 16,
    fontSize: 16,
    fontWeight: 400,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
  },
  // DUPE RADAR — 68px+ strip below the dish-name field.
  dupeStrip: {
    marginTop: 12,
    minHeight: 68,
    border: `1px solid ${OPEN_BORDER}`,
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  dupeHeadline: {fontSize: 13, fontWeight: 500},
  dupeMatch: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dupeBtnRow: {display: 'flex', gap: 8, marginTop: 2},
  dupeBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
  },
  dupeBtnBrand: {border: `1px solid ${OPEN_BORDER}`, color: BRAND_ACCENT},
  // DETAIL SHEET — 72px media row.
  detailRow: {
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBlock: 8,
  },
  detailAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  detailText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  detailDish: {fontSize: 16, fontWeight: 500, lineHeight: '20px'},
  detailMeta: {fontSize: 13, color: 'var(--color-text-secondary)'},
  detailNote: {
    marginTop: 8,
    padding: '12px 14px',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: '18px',
  },
  // ACTION SHEET — layered ABOVE the open detail sheet (z50 scrim / z51
  // cards; Escape closes topmost only — actionSheet > sheet, per spec).
  actionScrim: {position: 'absolute', inset: 0, zIndex: 50, background: SCRIM},
  actionSheet: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 51,
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
  actionContext: {
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
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
  },
  actionRowDestructive: {color: 'var(--color-error)'},
  actionCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
  },
  actionDivider: {height: 1, background: 'var(--color-border)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checked aggregates.
// ARITHMETIC LEDGER (verified by hand): slots 5+6+4+5 = 20 ✓; claimed
// 3+6+2+1 = 12 ✓; pending 1; open 1+0+2+4 = 7; 12+1+7 = 20 ✓. Deficits
// (slots − claimed − pending; pending EXCLUDED from need because Ben is
// already deciding): Apps 5−3−1 = 1, Mains 6−6 = 0, Sides 4−2 = 2,
// Desserts 5−1 = 4 → 1+2+4 = 7 = open count ✓. Headers '3 of 5' '6 of 6'
// '2 of 4' '1 of 5' ✓. Dial 60/100/50/20%, overall 12/20 = 60% ✓.
// ---------------------------------------------------------------------------

type CourseId = 'apps' | 'mains' | 'sides' | 'desserts';
type SlotStatus = 'open' | 'claimed' | 'pending';

interface Guest {
  name: string; // full name — accessible names
  short: string; // 'Maya R.' — ticket display
}

const GUESTS: Record<string, Guest> = {
  maya: {name: 'Maya Rodriguez', short: 'Maya R.'},
  priya: {name: 'Priya Shah', short: 'Priya S.'},
  ben: {name: 'Ben Kwan', short: 'Ben K.'},
  dana: {name: 'Dana Whitfield', short: 'Dana W.'},
  omar: {name: 'Omar Haddad', short: 'Omar H.'},
  june: {name: 'June Park', short: 'June P.'},
  tessa: {name: 'Tessa Nguyen', short: 'Tessa N.'},
  caleb: {name: 'Caleb Ford', short: 'Caleb F.'},
  you: {name: 'You', short: 'You'},
};

interface Slot {
  id: string;
  course: CourseId;
  status: SlotStatus;
  dish: string | null;
  claimerId: string | null; // key into GUESTS
  serves: number;
}

interface CourseDef {
  id: CourseId;
  title: string; // 'Apps'
  header: string; // 'APPS' via CSS uppercase
  noun: string; // 'app' — toast grammar
  slotLabel: string; // 'Side dish'
  defaultDish: string; // hold-to-claim + sheet prefill
  arcColor: string;
}

const COURSES: CourseDef[] = [
  {id: 'apps', title: 'Apps', header: 'Apps', noun: 'app', slotLabel: 'Appetizer', defaultDish: 'Veggie platter', arcColor: ARC_APPS},
  {id: 'mains', title: 'Mains', header: 'Mains', noun: 'main', slotLabel: 'Main dish', defaultDish: 'Casserole', arcColor: ARC_MAINS},
  {id: 'sides', title: 'Sides', header: 'Sides', noun: 'side', slotLabel: 'Side dish', defaultDish: 'Garden salad', arcColor: ARC_SIDES},
  {id: 'desserts', title: 'Desserts', header: 'Desserts', noun: 'dessert', slotLabel: 'Dessert', defaultDish: 'Brownies', arcColor: ARC_DESSERTS},
];

// Apps rail order is stress fixture 4: claimed, pending, open in the first
// three snap positions so one screenshot shows all three states. Mains
// carries the 60-char funeral-casserole truncation stress (fixture 1) and
// is the zero-open full-course rail (fixture 2). Desserts at 1/5 is the
// starving-course dial stress (fixture 3). Slot order NEVER mutates —
// status flips only, so Undo restores the original rail position
// (fixture 7).
const SLOTS: Slot[] = [
  {id: 'app_1', course: 'apps', status: 'claimed', dish: 'Deviled Eggs', claimerId: 'june', serves: 10},
  {id: 'app_2', course: 'apps', status: 'pending', dish: 'Bruschetta', claimerId: 'ben', serves: 8},
  {id: 'app_3', course: 'apps', status: 'open', dish: null, claimerId: null, serves: 8},
  {id: 'app_4', course: 'apps', status: 'claimed', dish: 'Seven-Layer Dip', claimerId: 'omar', serves: 12},
  {id: 'app_5', course: 'apps', status: 'claimed', dish: 'Charcuterie Board', claimerId: 'tessa', serves: 10},
  {id: 'main_1', course: 'mains', status: 'claimed', dish: 'Pulled Pork Sliders', claimerId: 'dana', serves: 12},
  {id: 'main_2', course: 'mains', status: 'claimed', dish: 'Baked Ziti', claimerId: 'maya', serves: 10},
  {id: 'main_3', course: 'mains', status: 'claimed', dish: 'Honey-Garlic Chicken Thighs', claimerId: 'caleb', serves: 8},
  {id: 'main_4', course: 'mains', status: 'claimed', dish: 'Veggie Chili', claimerId: 'priya', serves: 10},
  {id: 'main_5', course: 'mains', status: 'claimed', dish: 'Smoked Brisket', claimerId: 'omar', serves: 14},
  {
    id: 'main_6',
    course: 'mains',
    status: 'claimed',
    dish: "Great-Grandma Lucille's Seven-Layer Funeral Potato Casserole",
    claimerId: 'june',
    serves: 12,
  },
  {id: 'side_1', course: 'sides', status: 'claimed', dish: 'Loaded Potato Salad', claimerId: 'maya', serves: 8},
  {id: 'side_2', course: 'sides', status: 'claimed', dish: 'German Potato Salad', claimerId: 'priya', serves: 8},
  {id: 'side_3', course: 'sides', status: 'open', dish: null, claimerId: null, serves: 8},
  {id: 'side_4', course: 'sides', status: 'open', dish: null, claimerId: null, serves: 10},
  {id: 'dsrt_1', course: 'desserts', status: 'claimed', dish: 'Lemon Bars', claimerId: 'tessa', serves: 12},
  {id: 'dsrt_2', course: 'desserts', status: 'open', dish: null, claimerId: null, serves: 10},
  {id: 'dsrt_3', course: 'desserts', status: 'open', dish: null, claimerId: null, serves: 8},
  {id: 'dsrt_4', course: 'desserts', status: 'open', dish: null, claimerId: null, serves: 12},
  {id: 'dsrt_5', course: 'desserts', status: 'open', dish: null, claimerId: null, serves: 8},
];

const EVENT_NAME = 'Maple Street Block Party Potluck';
const NAV_TITLE = 'Block Party Potluck';
const COUNTDOWN_LABEL = '2d 14h'; // fixed fixture string — no clock reads
const UPDATED_CAPTION = 'Updated just now'; // fixed fixture string

// Suggestion chips drive the DupeRadar 'typing' fixture deterministically —
// 'Potato salad' scores ≥0.5 against BOTH claimed potato salads (fixture 5).
const SUGGESTION_CHIPS = ['Potato salad', 'Cornbread', 'Fruit crumble'];

// 'Make it different' rewrites the draft to a deterministic variant.
const DUPE_VARIANTS: Record<string, string> = {
  'potato salad': 'Sweet Potato Salad',
  cornbread: 'Jalapeño Cornbread',
  'fruit crumble': 'Peach-Berry Crumble',
};

// ---------------------------------------------------------------------------
// PURE HELPERS — deterministic, in-file.
// ---------------------------------------------------------------------------

/** Lowercased word-set token overlap: |A∩B| / |A∪B|. 'Potato salad' vs
 * 'Loaded Potato Salad' = 2/3 ≈ 0.67 ≥ 0.5 → match. */
function tokenOverlap(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const word of setA) if (setB.has(word)) inter += 1;
  return inter / (setA.size + setB.size - inter);
}

/** Deterministic variant for 'Make it different'. */
function variantFor(draft: string): string {
  return DUPE_VARIANTS[draft.trim().toLowerCase()] ?? `New-Style ${draft.trim()}`;
}

/** 'Potato salad' + 2 → '2 potato salads already'. */
function dupeHeadline(draft: string, count: number): string {
  const noun = draft.trim().toLowerCase();
  return count === 1 ? `1 ${noun} already` : `${count} ${noun}s already`;
}

/** Initials for the deterministic avatar — 'Maya Rodriguez' → 'MR'. */
function initials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Deterministic hue from the guest name (identity const, not random). */
function nameHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  return hash;
}

/** Avatar colors — dark-on-light / light-on-dark pairs from the name hue.
 * L38% fill under white text ≈ 4.9:1+; L74% fill under #201505 ≈ 7:1+. */
function avatarColors(name: string): {background: string; color: string} {
  const hue = nameHue(name);
  return {
    background: `light-dark(hsl(${hue} 42% 38%), hsl(${hue} 45% 74%))`,
    color: 'light-dark(#FFFFFF, #201505)',
  };
}

interface CourseStats {
  def: CourseDef;
  total: number;
  claimed: number;
  pending: number;
  open: number;
  deficit: number; // total − claimed − pending (pending excluded from need)
  fraction: number; // claimed / total — dial arc sweep
}

function courseStats(slots: Slot[]): CourseStats[] {
  return COURSES.map(def => {
    const mine = slots.filter(slot => slot.course === def.id);
    const claimed = mine.filter(slot => slot.status === 'claimed').length;
    const pending = mine.filter(slot => slot.status === 'pending').length;
    const open = mine.filter(slot => slot.status === 'open').length;
    return {
      def,
      total: mine.length,
      claimed,
      pending,
      open,
      deficit: mine.length - claimed - pending,
      fraction: mine.length === 0 ? 0 : claimed / mine.length,
    };
  });
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — usePotluckBoard(): {slots, claimSheet, detail,
// actionSheetOpen, toast} with a single update(id, patch) for slot writes.
// Every aggregate (deficits, dial arcs, header counts, summary string,
// DupeRadar scores) derives at render — no shadow copies.
// ---------------------------------------------------------------------------

interface ClaimSheetState {
  open: boolean;
  slotId: string | null;
  dishDraft: string;
  detent: 'medium' | 'large';
  mode: 'claim' | 'rename';
  dupeResolved: boolean; // 'Bring it anyway' / 'Make it different' pressed
}

interface DetailState {
  slotId: string | null;
  detent: 'medium' | 'large';
  mode: 'view' | 'edit';
  dishDraft: string;
}

interface ToastState {
  seq: number;
  text: string;
  // Undo restores the exact prior patch (slot order never mutates).
  undo: {slotId: string; prior: Pick<Slot, 'status' | 'dish' | 'claimerId'>} | null;
}

interface BoardUi {
  claimSheet: ClaimSheetState;
  detail: DetailState;
  actionSheetOpen: boolean;
  toast: ToastState | null;
}

const INITIAL_UI: BoardUi = {
  claimSheet: {open: false, slotId: null, dishDraft: '', detent: 'medium', mode: 'claim', dupeResolved: false},
  detail: {slotId: null, detent: 'medium', mode: 'view', dishDraft: ''},
  actionSheetOpen: false,
  toast: null,
};

function usePotluckBoard() {
  const [slots, setSlots] = useState<Slot[]>(SLOTS);
  const [ui, setUi] = useState<BoardUi>(INITIAL_UI);
  // THE single slot writer — hold-commit, sheet claim, rename, release,
  // and Undo all route through it; status flips in place, order intact.
  const update = useCallback((id: string, patch: Partial<Slot>) => {
    setSlots(prev => prev.map(slot => (slot.id === id ? {...slot, ...patch} : slot)));
  }, []);
  const patchUi = useCallback((patch: Partial<BoardUi>) => {
    setUi(prev => ({...prev, ...patch}));
  }, []);
  return {slots, ui, update, patchUi};
}

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
 * wrapper can tell the 390px mobile stage from the desktop stage. */
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

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// ---------------------------------------------------------------------------
// BRAND MARK — 28px casserole-lid glyph (dome, knob, dish) inside a 44×44
// labeled button; the SVG itself is decorative.
// ---------------------------------------------------------------------------

function CrockpotMark() {
  return (
    <span style={styles.brandMark} aria-hidden>
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
        <circle cx="9" cy="4" r="1.4" fill="currentColor" />
        <path d="M3.2 10.5a5.8 4.6 0 0 1 11.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M2 12.8h14M4 12.8l.8 2.4h8.4l.8-2.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// AVATAR — deterministic hue from the guest-name const; initials text.
// ---------------------------------------------------------------------------

function GuestAvatar({guestId, size}: {guestId: string; size: 28 | 40}) {
  const guest = GUESTS[guestId];
  const colors = avatarColors(guest.name);
  return (
    <span
      style={{...(size === 28 ? styles.avatar : styles.detailAvatar), ...colors}}
      aria-hidden>
      {initials(guest.name)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// COURSE BALANCE DIAL — 72×72 SVG stacked arc, 4 quadrant segments
// (strokeWidth 8, 4° gaps: each spans [i·90+2°, i·90+88°] = 86°); sweep =
// claimed/slots via pathLength 100 + strokeDasharray, so re-derives on
// every store write and transitions the dash 200ms (.cps-arc; instant
// under reduced motion). role='img'; the summary legend row is the
// non-color channel.
// ---------------------------------------------------------------------------

const DIAL_C = 36;
const DIAL_R = 30;

function dialPolar(deg: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: DIAL_C + DIAL_R * Math.sin(rad), y: DIAL_C - DIAL_R * Math.cos(rad)};
}

function dialArc(fromDeg: number, toDeg: number): string {
  const from = dialPolar(fromDeg);
  const to = dialPolar(toDeg);
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${DIAL_R} ${DIAL_R} 0 0 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

function CourseBalanceDial({stats, overallPct}: {stats: CourseStats[]; overallPct: number}) {
  const label = `Course coverage: ${stats
    .map(stat => `${stat.def.title.toLowerCase()} ${stat.claimed} of ${stat.total}`)
    .join(', ')}`;
  return (
    <div style={styles.dialWrap} role="img" aria-label={label}>
      <svg width={72} height={72} viewBox="0 0 72 72" fill="none" aria-hidden>
        {stats.map((stat, index) => {
          const d = dialArc(index * 90 + 2, index * 90 + 88);
          return (
            <g key={stat.def.id}>
              <path d={d} stroke="var(--color-background-muted)" strokeWidth={8} />
              {stat.fraction > 0 ? (
                <path
                  d={d}
                  stroke={stat.def.arcColor}
                  strokeWidth={8}
                  pathLength={100}
                  strokeDasharray={`${(stat.fraction * 100).toFixed(1)} 100`}
                  className="cps-arc"
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      <div style={styles.dialCenter}>
        <span style={styles.dialPct}>{overallPct}%</span>
        <span style={styles.dialSub}>filled</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SLOT TICKET — one real ≥44px <button> per ticket, tri-state. OPEN tickets
// carry the HoldToClaim gesture: pointerdown → 250ms intent delay → 700ms
// brand fill sweep (scaleX 0→1, transformOrigin left) → commit at 950ms
// total. pointerup / pointercancel / 8px move before commit cancels the
// fill and FALLS THROUGH to tap = open claim sheet (the visible button
// path: the sheet's 48px 'Claim slot'). prefers-reduced-motion: sweep
// removed, static 'Keep holding…' caption swap, commit still at 950ms.
// ---------------------------------------------------------------------------

interface SlotTicketProps {
  slot: Slot;
  def: CourseDef;
  reducedMotion: boolean;
  onOpenTap: (slot: Slot, opener: HTMLElement) => void;
  onHoldCommit: (slot: Slot, opener: HTMLElement) => void;
  onDetailTap: (slot: Slot, opener: HTMLElement) => void;
}

function SlotTicket({slot, def, reducedMotion, onOpenTap, onHoldCommit, onDetailTap}: SlotTicketProps) {
  const [sweep, setSweep] = useState(false);
  const [holding, setHolding] = useState(false);
  const intentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef({x: 0, y: 0});
  const committedRef = useRef(false);

  const clearHold = useCallback(() => {
    if (intentTimerRef.current != null) clearTimeout(intentTimerRef.current);
    if (commitTimerRef.current != null) clearTimeout(commitTimerRef.current);
    intentTimerRef.current = null;
    commitTimerRef.current = null;
    setSweep(false);
    setHolding(false);
  }, []);
  useEffect(() => clearHold, [clearHold]);

  if (slot.status === 'open') {
    const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const opener = event.currentTarget;
      startRef.current = {x: event.clientX, y: event.clientY};
      committedRef.current = false;
      setHolding(true);
      opener.setPointerCapture(event.pointerId);
      intentTimerRef.current = setTimeout(() => setSweep(true), 250);
      commitTimerRef.current = setTimeout(() => {
        committedRef.current = true;
        clearHold();
        onHoldCommit(slot, opener);
      }, 950);
    };
    const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (!holding) return;
      const dx = event.clientX - startRef.current.x;
      const dy = event.clientY - startRef.current.y;
      if (Math.hypot(dx, dy) > 8) clearHold();
    };
    return (
      <button
        type="button"
        className="cps-btn cps-focusable"
        style={{...styles.ticket, ...styles.ticketOpen}}
        aria-label={`Open ${def.noun} slot, claim this slot`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={clearHold}
        onPointerCancel={clearHold}
        onClick={event => {
          if (committedRef.current) {
            committedRef.current = false;
            return;
          }
          onOpenTap(slot, event.currentTarget);
        }}>
        {!reducedMotion ? (
          <span
            style={{
              ...styles.holdSweep,
              transform: sweep ? 'scaleX(1)' : 'scaleX(0)',
              transition: sweep ? 'transform 700ms linear' : 'none',
            }}
            aria-hidden
          />
        ) : null}
        <span style={styles.ticketIconRow}>
          <Icon icon={PlusCircleIcon} size="md" color="inherit" />
        </span>
        <span style={styles.slotLabel}>
          {def.slotLabel} · serves {slot.serves}
        </span>
        <span style={styles.claimCta}>{reducedMotion && holding ? 'Keep holding…' : 'Claim this slot'}</span>
      </button>
    );
  }

  const guest = GUESTS[slot.claimerId ?? 'you'];
  if (slot.status === 'pending') {
    return (
      <button
        type="button"
        className="cps-btn cps-focusable"
        style={{...styles.ticket, ...styles.ticketPending}}
        aria-label={`${slot.dish ?? ''}, ${guest.name} deciding`}
        onClick={event => onDetailTap(slot, event.currentTarget)}>
        <span style={{...styles.ticketIconRow, color: 'var(--color-text-secondary)'}}>
          <Icon icon={HourglassIcon} size="sm" color="inherit" />
        </span>
        <span className="cps-clamp2" style={styles.dishName}>
          {slot.dish}
        </span>
        <span style={styles.claimerLine}>{guest.short} deciding</span>
      </button>
    );
  }

  const isYou = slot.claimerId === 'you';
  return (
    <button
      type="button"
      className="cps-btn cps-focusable"
      style={{...styles.ticket, ...(isYou ? styles.ticketYou : styles.ticketClaimed)}}
      aria-label={`${slot.dish ?? ''}, claimed by ${guest.name}`}
      onClick={event => onDetailTap(slot, event.currentTarget)}>
      <span style={{...styles.ticketIconRow, color: 'var(--color-text-primary)'}}>
        <GuestAvatar guestId={slot.claimerId ?? 'you'} size={28} />
        {isYou ? <span style={styles.youBadge}>You</span> : null}
      </span>
      <span className="cps-clamp2" style={styles.dishName}>
        {slot.dish}
      </span>
      <span style={styles.claimerLine}>{guest.short}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SLOT RAIL — per-course horizontal snap rail. The ≥24px peek is the scroll
// affordance; the rail itself is focusable and arrow-key scrollable
// (gesture-with-button-path law), and every ticket is a Tab-reachable
// snap-target button, so no page dots are required.
// ---------------------------------------------------------------------------

interface SlotRailProps {
  def: CourseDef;
  slots: Slot[];
  reducedMotion: boolean;
  onOpenTap: (slot: Slot, opener: HTMLElement) => void;
  onHoldCommit: (slot: Slot, opener: HTMLElement) => void;
  onDetailTap: (slot: Slot, opener: HTMLElement) => void;
}

function SlotRail({def, slots, reducedMotion, onOpenTap, onHoldCommit, onDetailTap}: SlotRailProps) {
  return (
    <div
      role="group"
      tabIndex={0}
      className="cps-focusable"
      aria-label={`${def.title} slots, arrow keys scroll`}
      style={styles.rail}
      onKeyDown={event => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        event.currentTarget.scrollBy({left: event.key === 'ArrowRight' ? 156 : -156, behavior: 'auto'});
      }}>
      {slots.map(slot => (
        <SlotTicket
          key={slot.id}
          slot={slot}
          def={def}
          reducedMotion={reducedMotion}
          onOpenTap={onOpenTap}
          onHoldCommit={onHoldCommit}
          onDetailTap={onDetailTap}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET SHELL — grabber (real 'Resize sheet' button toggling MEDIUM 55% /
// LARGE calc(100% − 56px)), 52px header (44×44 X close OR Done text
// button), focus-trapped dialog; body is the one legal inner scroller.
// ---------------------------------------------------------------------------

interface SheetShellProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  trailing: 'close' | 'done';
  onTrailing: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  footer?: ReactNode;
  children: ReactNode;
}

function SheetShell({titleId, title, detent, onDetentChange, trailing, onTrailing, sheetRef, footer, children}: SheetShellProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="cps-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{...styles.sheet, height: detent === 'medium' ? '55%' : 'calc(100% - 56px)'}}>
      <button
        type="button"
        className="cps-btn cps-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onClick={() => onDetentChange(detent === 'medium' ? 'large' : 'medium')}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        {trailing === 'close' ? (
          <button
            type="button"
            className="cps-btn cps-focusable"
            style={styles.iconBtn}
            aria-label="Close sheet"
            onClick={onTrailing}>
            <Icon icon={XIcon} size="md" color="inherit" />
          </button>
        ) : (
          <button type="button" className="cps-btn cps-focusable" style={styles.doneBtn} onClick={onTrailing}>
            Done
          </button>
        )}
      </div>
      <div style={styles.sheetBody}>{children}</div>
      {footer != null ? <div style={styles.sheetFooter}>{footer}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobilePotluckSignupBoardTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {slots, ui, update, patchUi} = usePotluckBoard();

  // Focus plumbing — opener restored on every close path.
  const claimSheetRef = useRef<HTMLDivElement | null>(null);
  const detailSheetRef = useRef<HTMLDivElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const claimOpenerRef = useRef<HTMLElement | null>(null);
  const detailOpenerRef = useRef<HTMLElement | null>(null);
  const actionOpenerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);

  // DERIVED — every aggregate re-derives from the one slots array.
  const stats = courseStats(slots);
  const totalSlots = slots.length; // 20
  const claimedCount = stats.reduce((sum, stat) => sum + stat.claimed, 0); // 12 at rest
  const needTotal = stats.reduce((sum, stat) => sum + stat.deficit, 0); // 7 at rest
  const overallPct = Math.round((claimedCount / totalSlots) * 100); // 60 at rest
  const allFull = claimedCount === totalSlots;
  const deficitChips = stats.filter(stat => stat.deficit > 0).sort((a, b) => b.deficit - a.deficit);

  const claimSlot = ui.claimSheet.slotId != null ? slots.find(slot => slot.id === ui.claimSheet.slotId) ?? null : null;
  const claimDef = claimSlot != null ? COURSES.find(def => def.id === claimSlot.course) ?? COURSES[0] : COURSES[0];
  const detailSlot = ui.detail.slotId != null ? slots.find(slot => slot.id === ui.detail.slotId) ?? null : null;
  const detailDef = detailSlot != null ? COURSES.find(def => def.id === detailSlot.course) ?? COURSES[0] : COURSES[0];

  // DupeRadar — derives per keystroke against all claimed + pending dishes
  // (announces nothing per keystroke; the toastDock stays quiet).
  const draft = ui.claimSheet.dishDraft;
  const dupeMatches =
    ui.claimSheet.open && draft.trim().length > 0 && !ui.claimSheet.dupeResolved
      ? slots
          .filter(slot => slot.dish != null && slot.id !== ui.claimSheet.slotId)
          .map(slot => ({slot, score: tokenOverlap(draft, slot.dish ?? '')}))
          .filter(entry => entry.score >= 0.5)
          .sort((a, b) => b.score - a.score)
      : [];

  const anySheetOpen = ui.claimSheet.open || ui.detail.slotId != null;

  const toastPatch = (text: string, undo: ToastState['undo'] = null): {toast: ToastState} => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undo}};
  };

  const claimMessage = (def: CourseDef, deficitAfter: number): string => {
    const head = `${capitalize(def.noun)} slot claimed`;
    return deficitAfter > 0
      ? `${head} — need ${deficitAfter} more ${def.noun}${deficitAfter === 1 ? '' : 's'}`
      : `${head} — ${def.title.toLowerCase()} covered`;
  };

  // Focus moves into an opening sheet with preventScroll — plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen (foundations amendment).
  useEffect(() => {
    if (ui.claimSheet.open) claimSheetRef.current?.focus({preventScroll: true});
  }, [ui.claimSheet.open]);
  useEffect(() => {
    if (ui.detail.slotId != null) detailSheetRef.current?.focus({preventScroll: true});
  }, [ui.detail.slotId]);
  useEffect(() => {
    if (ui.actionSheetOpen) actionCancelRef.current?.focus({preventScroll: true});
  }, [ui.actionSheetOpen]);

  // FLOWS --------------------------------------------------------------------

  // (1) Tap open ticket → claim sheet MEDIUM, draft prefilled with the
  // course default.
  const openClaimSheet = (slot: Slot, opener: HTMLElement) => {
    const def = COURSES.find(course => course.id === slot.course) ?? COURSES[0];
    claimOpenerRef.current = opener;
    patchUi({
      claimSheet: {open: true, slotId: slot.id, dishDraft: def.defaultDish, detent: 'medium', mode: 'claim', dupeResolved: false},
    });
  };

  const closeClaimSheet = () => {
    patchUi({claimSheet: {...INITIAL_UI.claimSheet}});
    claimOpenerRef.current?.focus();
  };

  // Sheet 'Claim slot' — THE claim write; every aggregate rebalances.
  const commitClaim = () => {
    if (claimSlot == null) return;
    const stat = stats.find(entry => entry.def.id === claimSlot.course);
    const deficitAfter = (stat?.deficit ?? 1) - 1;
    update(claimSlot.id, {status: 'claimed', claimerId: 'you', dish: draft.trim() || claimDef.defaultDish});
    patchUi({claimSheet: {...INITIAL_UI.claimSheet}, ...toastPatch(claimMessage(claimDef, deficitAfter))});
    claimOpenerRef.current?.focus();
  };

  // (2) Hold-to-claim — routes through the SAME update, then the sheet
  // opens in rename mode ('Name your dish', Done in header).
  const holdCommit = (slot: Slot, opener: HTMLElement) => {
    const def = COURSES.find(course => course.id === slot.course) ?? COURSES[0];
    const stat = stats.find(entry => entry.def.id === slot.course);
    const deficitAfter = (stat?.deficit ?? 1) - 1;
    update(slot.id, {status: 'claimed', claimerId: 'you', dish: def.defaultDish});
    claimOpenerRef.current = opener;
    patchUi({
      claimSheet: {open: true, slotId: slot.id, dishDraft: def.defaultDish, detent: 'medium', mode: 'rename', dupeResolved: false},
      ...toastPatch(claimMessage(def, deficitAfter)),
    });
  };

  const commitRename = () => {
    if (claimSlot == null) return;
    update(claimSlot.id, {dish: draft.trim() || claimDef.defaultDish});
    patchUi({claimSheet: {...INITIAL_UI.claimSheet}});
    claimOpenerRef.current?.focus();
  };

  // (3) Tap claimed/pending ticket → detail sheet MEDIUM.
  const openDetail = (slot: Slot, opener: HTMLElement) => {
    detailOpenerRef.current = opener;
    patchUi({detail: {slotId: slot.id, detent: 'medium', mode: 'view', dishDraft: slot.dish ?? ''}});
  };

  const closeDetail = () => {
    patchUi({detail: {...INITIAL_UI.detail}, actionSheetOpen: false});
    detailOpenerRef.current?.focus();
  };

  const closeActionSheet = () => {
    patchUi({actionSheetOpen: false});
    actionOpenerRef.current?.focus();
  };

  // Edit dish name swaps the detail sheet's content in place —
  // sheet-over-sheet is banned.
  const startDetailEdit = () => {
    if (detailSlot == null) return;
    patchUi({actionSheetOpen: false, detail: {...ui.detail, mode: 'edit', dishDraft: detailSlot.dish ?? ''}});
  };

  const saveDetailEdit = () => {
    if (detailSlot == null) return;
    const next = ui.detail.dishDraft.trim() || detailDef.defaultDish;
    update(detailSlot.id, {dish: next});
    patchUi({detail: {...ui.detail, mode: 'view', dishDraft: next}, ...toastPatch(`Dish renamed to ${next}`)});
    detailSheetRef.current?.focus({preventScroll: true});
  };

  // Release executes IMMEDIATELY (undo-over-confirm — no dialog anywhere);
  // Undo restores the exact prior patch, so the slot returns to its
  // ORIGINAL rail position (order never mutates; status flips only).
  const releaseClaim = () => {
    if (detailSlot == null) return;
    const prior = {status: detailSlot.status, dish: detailSlot.dish, claimerId: detailSlot.claimerId};
    update(detailSlot.id, {status: 'open', dish: null, claimerId: null});
    patchUi({
      actionSheetOpen: false,
      detail: {...INITIAL_UI.detail},
      ...toastPatch('Claim released', {slotId: detailSlot.id, prior}),
    });
    detailOpenerRef.current?.focus();
  };

  const undoRelease = () => {
    const undo = ui.toast?.undo;
    if (undo == null) return;
    update(undo.slotId, undo.prior);
    patchUi(toastPatch('Claim restored'));
  };

  // Escape closes the TOPMOST overlay only: actionSheet > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.actionSheetOpen) closeActionSheet();
      else if (ui.claimSheet.open) closeClaimSheet();
      else if (ui.detail.slotId != null) closeDetail();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.actionSheetOpen, ui.claimSheet.open, ui.detail.slotId]);

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(anySheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const detailIsYou = detailSlot?.claimerId === 'you';
  const detailGuest = detailSlot != null ? GUESTS[detailSlot.claimerId ?? 'you'] : null;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{CPS_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {/* Identity-only brand button (top-left owns no primary verb —
                the claim verb lives on every open ticket in the body). */}
            <button type="button" className="cps-btn cps-focusable" style={styles.brandBtn} aria-label="Crockpot Social">
              <CrockpotMark />
            </button>
          </div>
          <p style={styles.navTitle}>{NAV_TITLE}</p>
          <div style={styles.navTrailing}>
            <span style={styles.countdownPill} aria-label="Event in 2 days 14 hours">
              {COUNTDOWN_LABEL}
            </span>
          </div>
        </header>

        <main style={styles.main}>
          {/* STILL-NEEDED SUMMARY — everything derived from the slots array. */}
          <section style={styles.summaryCard} aria-label="Still needed summary">
            <h1 className="cps-vh">{EVENT_NAME}</h1>
            <div style={styles.summaryText}>
              <span style={styles.summaryCount}>
                {allFull ? (
                  <>
                    <span style={{color: ARC_MAINS, display: 'inline-flex'}}>
                      <Icon icon={CheckCircle2Icon} size="md" color="inherit" />
                    </span>
                    Menu covered — {claimedCount} of {totalSlots}
                  </>
                ) : (
                  <>Need {needTotal} more {needTotal === 1 ? 'dish' : 'dishes'}</>
                )}
              </span>
              {!allFull ? (
                <span style={styles.chipRow}>
                  {deficitChips.map(stat => (
                    <span key={stat.def.id} style={styles.deficitChip}>
                      {stat.def.title} −{stat.deficit}
                    </span>
                  ))}
                </span>
              ) : null}
              {/* Legend row — the dial's non-color channel. */}
              <span style={styles.legendRow}>
                {stats.map(stat => (
                  <span key={stat.def.id} style={styles.legendItem}>
                    <span style={{...styles.legendDot, background: stat.def.arcColor}} aria-hidden />
                    {stat.def.title} {stat.claimed}/{stat.total}
                  </span>
                ))}
              </span>
            </div>
            <CourseBalanceDial stats={stats} overallPct={overallPct} />
          </section>

          {/* COURSE BLOCKS — 28px header row + 8px + 120px rail, 24px apart. */}
          {stats.map(stat => (
            <section key={stat.def.id} style={styles.courseBlock}>
              <div style={styles.sectionHeaderRow}>
                <h2 style={styles.sectionHeader}>{stat.def.header}</h2>
                {stat.open === 0 && stat.pending === 0 ? (
                  <span style={styles.sectionHeaderNote}>Course full</span>
                ) : null}
                <span style={styles.sectionHeaderCount}>
                  {stat.claimed} of {stat.total} filled
                </span>
              </div>
              <SlotRail
                def={stat.def}
                slots={slots.filter(slot => slot.course === stat.def.id)}
                reducedMotion={reducedMotion}
                onOpenTap={openClaimSheet}
                onHoldCommit={holdCommit}
                onDetailTap={openDetail}
              />
            </section>
          ))}

          <p style={styles.terminalCaption}>
            {claimedCount} of {totalSlots} slots filled · {UPDATED_CAPTION}
          </p>

          {/* TOAST DOCK — sticky-in-flow, the ONE polite live region; no
              auto-dismiss timers, one toast at a time, new mutation
              replaces old. */}
          <div style={styles.toastDock} aria-live="polite">
            {ui.toast != null ? (
              <div key={ui.toast.seq} style={styles.toast} className="cps-fade">
                <span style={styles.toastText}>{ui.toast.text}</span>
                {ui.toast.undo != null ? (
                  <>
                    <span style={styles.toastRule} aria-hidden />
                    <button type="button" className="cps-btn cps-focusable" style={styles.toastUndo} onClick={undoRelease}>
                      Undo
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </main>

        {/* CLAIM SHEET (claim + rename modes) — never mounts beside the
            detail sheet. */}
        {ui.claimSheet.open ? (
          <>
            <div style={styles.sheetScrim} onClick={closeClaimSheet} aria-hidden />
            <SheetShell
              titleId="cps-claim-title"
              title={ui.claimSheet.mode === 'claim' ? `Claim a ${claimDef.noun} slot` : 'Name your dish'}
              detent={ui.claimSheet.detent}
              onDetentChange={detent => patchUi({claimSheet: {...ui.claimSheet, detent}})}
              trailing={ui.claimSheet.mode === 'claim' ? 'close' : 'done'}
              onTrailing={ui.claimSheet.mode === 'claim' ? closeClaimSheet : commitRename}
              sheetRef={claimSheetRef}
              footer={
                <button
                  type="button"
                  className="cps-btn cps-focusable"
                  style={styles.primaryBtn}
                  onClick={ui.claimSheet.mode === 'claim' ? commitClaim : commitRename}>
                  {ui.claimSheet.mode === 'claim' ? 'Claim slot' : 'Save dish name'}
                </button>
              }>
              <div style={styles.sheetContextRow}>
                {claimDef.slotLabel} · serves {claimSlot?.serves ?? 8} · {claimDef.title}
              </div>
              <div style={styles.chipRowSheet}>
                {SUGGESTION_CHIPS.map(chip => (
                  <button
                    key={chip}
                    type="button"
                    className="cps-btn cps-focusable"
                    style={styles.suggestChip}
                    onClick={() => patchUi({claimSheet: {...ui.claimSheet, dishDraft: chip, dupeResolved: false}})}>
                    {chip}
                  </button>
                ))}
              </div>
              <label style={styles.fieldLabel} htmlFor="cps-dish-input">
                Dish name
              </label>
              <input
                id="cps-dish-input"
                className="cps-input"
                style={styles.input}
                type="text"
                value={draft}
                placeholder={claimDef.defaultDish}
                onChange={event =>
                  patchUi({claimSheet: {...ui.claimSheet, dishDraft: event.target.value, dupeResolved: false}})
                }
              />
              {dupeMatches.length > 0 ? (
                <div style={styles.dupeStrip}>
                  <span style={styles.dupeHeadline}>{dupeHeadline(draft, dupeMatches.length)}</span>
                  {dupeMatches.map(match => (
                    <span key={match.slot.id} style={styles.dupeMatch}>
                      {match.slot.dish} — {GUESTS[match.slot.claimerId ?? 'you'].short}
                    </span>
                  ))}
                  <div style={styles.dupeBtnRow}>
                    <button
                      type="button"
                      className="cps-btn cps-focusable"
                      style={styles.dupeBtn}
                      onClick={() => patchUi({claimSheet: {...ui.claimSheet, dupeResolved: true}})}>
                      Bring it anyway
                    </button>
                    <button
                      type="button"
                      className="cps-btn cps-focusable"
                      style={{...styles.dupeBtn, ...styles.dupeBtnBrand}}
                      onClick={() =>
                        patchUi({claimSheet: {...ui.claimSheet, dishDraft: variantFor(draft), dupeResolved: true}})
                      }>
                      Make it different
                    </button>
                  </div>
                </div>
              ) : null}
            </SheetShell>
          </>
        ) : null}

        {/* DETAIL SHEET — claimed/pending tickets; edit swaps in place. */}
        {detailSlot != null && detailGuest != null ? (
          <>
            <div style={styles.sheetScrim} onClick={closeDetail} aria-hidden />
            <SheetShell
              titleId="cps-detail-title"
              title={ui.detail.mode === 'edit' ? 'Edit dish name' : detailDef.slotLabel}
              detent={ui.detail.detent}
              onDetentChange={detent => patchUi({detail: {...ui.detail, detent}})}
              trailing="close"
              onTrailing={closeDetail}
              sheetRef={detailSheetRef}
              footer={
                ui.detail.mode === 'edit' ? (
                  <button type="button" className="cps-btn cps-focusable" style={styles.primaryBtn} onClick={saveDetailEdit}>
                    Save dish name
                  </button>
                ) : undefined
              }>
              {ui.detail.mode === 'view' ? (
                <>
                  <div style={styles.detailRow}>
                    <GuestAvatar guestId={detailSlot.claimerId ?? 'you'} size={40} />
                    <div style={styles.detailText}>
                      <span style={styles.detailDish}>{detailSlot.dish}</span>
                      <span style={styles.detailMeta}>
                        {detailSlot.status === 'pending' ? `${detailGuest.name} · deciding` : detailGuest.name} · serves{' '}
                        {detailSlot.serves}
                      </span>
                    </div>
                    {detailIsYou ? (
                      <button
                        type="button"
                        className="cps-btn cps-focusable"
                        style={styles.iconBtn}
                        aria-label={`More actions for ${detailSlot.dish ?? 'your claim'}`}
                        aria-haspopup="dialog"
                        aria-expanded={ui.actionSheetOpen}
                        onClick={event => {
                          actionOpenerRef.current = event.currentTarget;
                          patchUi({actionSheetOpen: true});
                        }}>
                        <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
                      </button>
                    ) : null}
                  </div>
                  {detailSlot.status === 'pending' ? (
                    <div style={styles.detailNote}>
                      {detailGuest.name} is still deciding — this slot opens back up if they pass.
                    </div>
                  ) : null}
                  {!detailIsYou && detailSlot.status === 'claimed' ? (
                    <div style={styles.detailNote}>
                      Claimed dishes are managed by their owner — grab an open ticket to add yours.
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <label style={styles.fieldLabel} htmlFor="cps-edit-input">
                    Dish name
                  </label>
                  <input
                    id="cps-edit-input"
                    className="cps-input"
                    style={styles.input}
                    type="text"
                    value={ui.detail.dishDraft}
                    onChange={event => patchUi({detail: {...ui.detail, dishDraft: event.target.value}})}
                  />
                </>
              )}
            </SheetShell>
          </>
        ) : null}

        {/* ACTION SHEET — the verb picker for YOUR claim, layered above the
            detail sheet (z50/51); destructive LAST, Cancel in its own card
            below (safe bottom-of-screen tap), focus lands on Cancel. */}
        {ui.actionSheetOpen && detailSlot != null ? (
          <>
            <div style={styles.actionScrim} onClick={closeActionSheet} aria-hidden />
            <div
              ref={actionSheetRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cps-action-context"
              tabIndex={-1}
              style={styles.actionSheet}
              onKeyDown={event => trapTabKey(event, actionSheetRef.current)}>
              <div style={styles.actionCard}>
                <div id="cps-action-context" style={styles.actionContext}>
                  Your claim: {detailSlot.dish}
                </div>
                <button type="button" className="cps-btn cps-focusable" style={styles.actionRow} onClick={startDetailEdit}>
                  Edit dish name
                </button>
                <div style={styles.actionDivider} />
                <button
                  type="button"
                  className="cps-btn cps-focusable"
                  style={{...styles.actionRow, ...styles.actionRowDestructive}}
                  onClick={releaseClaim}>
                  Release claim
                </button>
              </div>
              <div style={styles.actionCard}>
                <button
                  type="button"
                  ref={actionCancelRef}
                  className="cps-btn cps-focusable"
                  style={styles.actionCancel}
                  onClick={closeActionSheet}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
