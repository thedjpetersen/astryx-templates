// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Maple St. Movie Club household
 *   frozen at TODAY 'Fri, Jul 4': 14 watchlist titles (dual-field runtime
 *   min + energy 1-5), dial default budget 120 / energy cap 3 ⇒ fits
 *   {104,116,114,101,97,102,100,113,90} = 9 of 14 (excluded 5: Locked
 *   Parlor 130 runtime-only, Signal from Meridian E4, The Split Second E4,
 *   Wexford Sisters 139/E5 both, Quarry Hollow 153/E5 both; 9+5=14 ✓);
 *   Round of 8 mid-flight (M1 decided 2–1, M2 decided by Jo's veto, M3
 *   LIVE Riverlight vs Party of Liars, M4 queued); tokens issued 3×3=9,
 *   spent Sam 1 + Riley 0 + Jo 2 = 3 = the 3 veto-log rows, remaining
 *   2+3+1=6, 6+3=9 ✓; 4 fixed past nights. No Date.now(), no
 *   Math.random(), no network media (art = id-derived hue gradients +
 *   initial monograms).
 * @output Nightcap — Tonight Picker: a 390px MOBILE movie-night decider.
 *   NavBar (crescent-reel mark · 'Tonight' · History) over a 44px sticky
 *   dialSummary ('≤ 120 min · Energy ≤ 3' pill + '9 of 14 fit'), a 236px
 *   MoodDial section (200px dual-thumb ring: budget 45-180 on the left
 *   arc, energy E1-E5 detents on the right; two spinbutton stepper pairs
 *   are the input CONTRACT), a Crown frontrunner banner, and a bracket
 *   section where each FaceoffPair (two flex cards + 42px Zap divider) is
 *   one thumb-height decision. Picking benches the loser ('Benched until
 *   Jul 18'), collapses the round into decidedList rows, slides in the
 *   next pair, re-derives the frontrunner and the Watchlist badge (6→5,
 *   asserted below), and posts an Undo toast — all from one bracketStore.
 *   Vetoes (3 coins per member in the shared VetoTokenTray) auto-advance
 *   the opponent through an attribution actionSheet. Deliberately an
 *   elimination bracket, NOT a swipe stack.
 * @position Page template; emitted by `astryx template mobile-tonight-picker`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, titleSheet, actionSheet,
 *   anchored menus) are position:'absolute' INSIDE shell; position:fixed
 *   is banned. While any sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The toast live region rides
 *   the sticky tab-bar dock at bottom:76 (sticky-in-flow per the
 *   foundations amendment — shell-absolute would pin to the DOCUMENT
 *   bottom and leave the viewport on tall scrolls; shell-absolute is only
 *   used while the shell is scroll-locked).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 after 48px thumbs); no
 *   desktop frames, no side asides, no data tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#7C3AED, #A78BFA) — white 17px text on
 *   #7C3AED = 6.1:1; near-black #171216 on #A78BFA = 7.4:1. Sanctioned
 *   non-brand literals: TRACK_REST (dial rest arcs / unreached energy
 *   detents — a meaningful rest-state fill, so ≥3:1 vs the body surface
 *   per the amendment, NOT a hairline token), the error strong/fill pair
 *   for swipe blocks, three member avatar pairs, and the scrim. Math at
 *   each declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen inset · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', always-on hairline — no
 *   scroll-under wiring except the Watchlist large-title sentinel);
 *   dialSummary 44px sticky top:52 z19, same blur surface; tabBar 64px
 *   sticky bottom z20, 4 flex:1 tabItems (24px icon over 11px/500 label,
 *   4px gap; badge 16px min-width brand pill 10px/600 at top:-4
 *   right:-8); MoodDial section 236px (220px dial zone + 16px caption),
 *   ring diameter 200, track 12; FaceoffPair content 358 at 390 =
 *   158+42+158 (cards flex:1 min 123 at 320: 288−42=246, 246/2=123);
 *   rows 72px media (48px thumb, 12px radius) / 60px two-line / 44px
 *   utility; steppers 96×32; buttons 48 primary / 36 secondary / 44×44
 *   icon. TYPE (Figtree via --font-family-body): 28/700 large title
 *   (Watchlist + History only) · 22/700 dial hub count · 17/600 nav+sheet
 *   titles · 16/400 body floor · 13/400 meta · 11/500 tabs/overlines;
 *   nothing under 11px; tabular-nums on every count. Touch: every target
 *   ≥44×44 with ≥8px clearance or merged full-row; every gesture (swipe
 *   rows, sheet drag, long-press, dial thumbs) has a visible button path.
 *
 * Responsive contract:
 * - Fluid 320–430: FaceoffPair cards flex:1 minWidth 0 with 2-line title
 *   clamp; MoodDial ring fixed 200 centered (200+2×16 = 232 < 320); dial
 *   steppers wrap 2×1 below 360 (flexWrap); dialSummary pill ellipsizes,
 *   the count never does; reason chips ellipsize while the 44px ellipsis
 *   button never shrinks; sheet detents %-based. overflowX:'clip' backstop.
 * - Desktop stage (~1045px): useElementWidth on the wrapper (container
 *   width, not viewport) — ≥720px renders the standard centered phone
 *   column (maxWidth 430, marginInline auto, borderInline hairline). No
 *   adaptive relayout; the bracket anatomy is deliberately phone geometry.
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
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClapperboardIcon,
  CircleUserIcon,
  CrownIcon,
  ListVideoIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  PopcornIcon,
  RefreshCwIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Nightcap violet). White 17px text on
// #7C3AED = 6.1:1; #171216-equivalent dark text on #A78BFA = 7.4:1. As a
// bare fill vs surfaces: #7C3AED on the white card ≈ 6.1:1 and #A78BFA on
// the ~#1C1C1E dark card ≈ 6.3:1 — both clear the ≥3:1 amendment bar for
// rest-state fills (unspent veto coins, active dial arcs).
const BRAND_ACCENT = 'light-dark(#7C3AED, #A78BFA)';
// Text over a BRAND_ACCENT fill (math above).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #171216)';
// Brand-tinted wash for the active tab-badge seat / frontrunner crown chip.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Dial REST fills — the un-swept remainder of the budget arc and unreached
// energy detent beads. Meaningful rest state, so per the amendment it gets
// an explicit pair at ≥3:1 against its ACTUAL surface (the body
// background, where the dial paints, at FULL opacity — no alpha discount):
// #8E8E96 on ~#FFFFFF ≈ 3.3:1; #77777F on ~#141414 ≈ 4.2:1 — both ≥3:1.
// NOT the hairline token.
const TRACK_REST = 'light-dark(#8E8E96, #77777F)';
// Destructive swipe-block fill: #C92A2A on white ≈ 5.5:1; #FF8787 on the
// dark card ≈ 7.4:1. Text over it: #FFFFFF on #C92A2A ≈ 5.5:1; #300808 on
// #FF8787 ≈ 7.8:1.
const ERROR_STRONG = 'light-dark(#C92A2A, #FF8787)';
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #300808)';
// Member avatar fills — white 11px initials pass on each light side
// (#0E7A52 ≈ 5.5:1, #1D66AC ≈ 5.9:1, #A34B06 ≈ 5.4:1); dark sides flip to
// 300-weight hues with near-black glyphs (≈ 8:1 each).
const AVATAR_TEXT = 'light-dark(#FFFFFF, #14100A)';
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, 2-line clamp, enter
// animations (transform/opacity only), visually-hidden h1, reduced-motion
// guard that collapses every transition to instant.
// ---------------------------------------------------------------------------

const NTC_CSS = `
.ntc-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.ntc-btn:disabled { cursor: default; }
.ntc-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.ntc-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ntc-anim { transition: transform 200ms ease, opacity 200ms ease; }
.ntc-fade { transition: opacity 200ms ease; }
@keyframes ntc-fold-in {
  from { transform: translateY(8px) scaleY(0.92); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.ntc-fold-in { animation: ntc-fold-in 200ms ease; transform-origin: top center; }
@keyframes ntc-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.ntc-sheet-in { animation: ntc-sheet-in 200ms ease; }
.ntc-vh {
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
  .ntc-anim, .ntc-fade { transition: none; }
  .ntc-fold-in, .ntc-sheet-in { animation: none; }
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
  // NAV BAR — 52px sticky top z20; always-on hairline (noted per contract;
  // the only scroll wiring is the Watchlist large-title sentinel fade).
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
  brandBtn: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  textBtn: {
    height: 44,
    paddingInline: 8,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
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
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // DIAL SUMMARY — 44px sticky strip at top:52 z19, same blur surface;
  // compact readout once the full dial scrolls under the navBar.
  dialSummary: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  dialSummaryPill: {
    minWidth: 0,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // The count NEVER ellipsizes (responsive contract).
  dialSummaryCount: {
    flex: 1,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // MOOD DIAL — 236px section: 220px dial zone (200px ring centered) +
  // 16px caption row.
  dialSection: {
    height: 236,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingInline: 16,
  },
  dialZone: {position: 'relative', width: 220, height: 220, flexShrink: 0},
  dialHub: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  dialHubStack: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2},
  dialHubCount: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1},
  dialHubSub: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // Single-line 16px caption row closing the 236px dial section.
  dialCaption: {
    height: 16,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  // Stepper pairs — the input CONTRACT; wrap 2×1 below 360 via flexWrap.
  stepperRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingInline: 16,
    marginTop: 12,
  },
  stepperBlock: {display: 'flex', alignItems: 'center', gap: 8},
  stepperLabel: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  // 96×32 track split by a center hairline; halves reach 44×44 hits via
  // the parent row's block padding.
  stepperTrack: {
    width: 96,
    height: 32,
    display: 'flex',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
    paddingBlock: 6,
    marginBlock: -6,
  },
  stepperHalfDisabled: {opacity: 0.35},
  stepperHairline: {width: 1, background: 'var(--color-border)'},
  stepperValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    minWidth: 64,
  },
  reseedBtn: {
    height: 36,
    marginTop: 12,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // FRONTRUNNER BANNER — 56px row with Crown.
  frontrunnerRow: {
    width: '100%',
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  crownSeat: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  frontrunnerText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  frontrunnerPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  frontrunnerSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // FACEOFF PAIR — content width 358 at 390 (16px gutters): two flex:1
  // cards joined by a fixed 42px lightning divider (158+42+158 = 358 ✓;
  // at 320: (320−32−42)/2 = 123px cards, verified overflow-free).
  faceoffRow: {display: 'flex', alignItems: 'stretch', marginInline: 16},
  faceCard: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  faceArt: {
    height: 90,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  faceBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '10px 12px 12px',
  },
  faceTitle: {fontSize: 16, fontWeight: 500, lineHeight: 1.25, minHeight: 40},
  faceMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Tally chips — 24px glyph chips, 8px gap, merged into one padded row so
  // the combined hit clears 44px with the buttons below.
  chipRow: {display: 'flex', gap: 8, minHeight: 24, alignItems: 'center'},
  memberChip: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: AVATAR_TEXT,
    position: 'relative',
    flexShrink: 0,
  },
  chipGlyph: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 14,
    height: 14,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: BRAND_ACCENT,
  },
  pickBtn: {
    height: 36,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    width: '100%',
  },
  detailsBtn: {
    height: 36,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    width: '100%',
  },
  // 42px lightning divider column — Zap in a 42px circle, hairline
  // verticals above and below.
  dividerCol: {
    width: 42,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  dividerLine: {width: 1, flex: 1, background: 'var(--color-border)'},
  dividerCircle: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // Decided / queued rows — 60px two-line.
  row60: {
    width: '100%',
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  row60Text: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
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
  benchChip: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    padding: '3px 8px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  queuedRow: {opacity: 0.6},
  // EMPTY STATE (zero-fit) — per the emptyAndSkeleton contract.
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
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 16px'},
  emptyAction: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // LARGE TITLE row — 52px, 28/700 at the 16px gutter; scrolls away while
  // the navBar center title fades in (IntersectionObserver sentinel).
  largeTitleRow: {height: 52, display: 'flex', alignItems: 'center', paddingInline: 16},
  largeTitle: {fontSize: 28, fontWeight: 700, margin: 0},
  // WATCHLIST — 72px media rows with swipe-reveal + mandatory ellipsis.
  watchOuter: {position: 'relative'},
  watchClip: {position: 'relative', overflow: 'hidden'},
  watchActions: {position: 'absolute', top: 0, bottom: 0, right: 0, display: 'flex'},
  watchActionBtn: {
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
  },
  watchContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  watchRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  watchThumb: {
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
  aliveDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    flexShrink: 0,
  },
  reasonChip: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    padding: '3px 8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  terminalCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '16px 0 0',
    fontVariantNumeric: 'tabular-nums',
  },
  // SKELETONS — 72px rows, deterministic staggered widths 60/45/70 +
  // 40/55/30, zero layout shift on resolve.
  skeletonRow: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skeletonThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  skeletonBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // ANCHORED MENU — z30, below the sheet layer's z40.
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    minWidth: 200,
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
  menuRowDanger: {color: ERROR_STRONG},
  menuRowDisabled: {opacity: 0.35},
  // VETO TOKEN TRAY — three merged member-column buttons in one card.
  trayColumns: {display: 'flex'},
  trayCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '14px 8px',
  },
  trayHairline: {width: 1, background: 'var(--color-border)'},
  trayAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: AVATAR_TEXT,
  },
  trayName: {fontSize: 13, fontWeight: 500},
  coinRow: {display: 'flex', gap: 8},
  // Unspent coin = BRAND_ACCENT fill (≥3:1 vs card both schemes — math at
  // the BRAND_ACCENT declaration). Spent ≠ hairline-only: muted fill +
  // hairline + 40%-opacity slash glyph so the state isn't color-alone.
  coin: {width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center'},
  coinUnspent: {background: BRAND_ACCENT},
  coinSpent: {
    background: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  coinSpentGlyph: {
    width: 10,
    height: 2,
    borderRadius: 1,
    background: 'var(--color-text-primary)',
    opacity: 0.4,
    transform: 'rotate(-45deg)',
  },
  trayCaption: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  refillCaption: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    borderTop: '1px solid var(--color-border)',
  },
  // PROFILE — 44px utility rows.
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
  chevron: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  // TAB DOCK — sticky bottom:0 wrapper holding the toast live region
  // (absolute bottom:76 inside it — the amendment's sticky-in-flow dock)
  // and the 64px tabBar.
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 20, marginTop: 24},
  tabBar: {
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
    fontSize: 11,
    fontWeight: 500,
  },
  tabItemActive: {color: BRAND_ACCENT, fontWeight: 600},
  tabIconSeat: {position: 'relative', width: 24, height: 24, display: 'grid', placeItems: 'center'},
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
  // TOAST — the single polite live region, riding the sticky dock 12px
  // above the 64px tabBar. One toast, no timers; Undo is a real button.
  toastRegion: {
    position: 'absolute',
    bottom: 76,
    insetInline: 16,
    zIndex: 30,
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
  toastUndo: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // SHEET LAYER — scrim z40, titleSheet / actionSheet z41.
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
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 16px'},
  // Sheet footer — Veto LEFT of a 16px dead-space gap, Pick this trailing
  // (destructive never adjacent to / bottom-right of the primary).
  sheetFooter: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  sheetVetoBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: ERROR_STRONG,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  sheetPickBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  sheetPickBtnDisabled: {background: 'var(--color-background-muted)', color: 'var(--color-text-secondary)'},
  artBanner: {
    height: 120,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '0.04em',
    marginBottom: 12,
  },
  whyLine: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: BRAND_ACCENT,
    marginBottom: 12,
  },
  synopsis: {fontSize: 16, lineHeight: 1.45, margin: '0 0 12px'},
  sheetMetaRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // ACTION SHEET — two stacked cards 8px apart, insetInline 16 bottom 16.
  actionSheetWrap: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  asCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  asHeader: {
    padding: '14px 16px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    borderBottom: '1px solid var(--color-border)',
    fontVariantNumeric: 'tabular-nums',
  },
  asRow: {
    width: '100%',
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 17,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  asRowDisabled: {opacity: 0.35},
  asCancel: {fontWeight: 600},
  asHairline: {height: 1, background: 'var(--color-border)'},
  spacer24: {height: 24},
};

// ---------------------------------------------------------------------------
// IDENTITY CONSTS + FIXTURES — deterministic by law. The arithmetic is
// visible on screen: Profile says '14 days', bench chips say 'Jul 18'
// (TODAY Jul 4 + 14), the tray caption says 'Sun, Jul 12'.
// ---------------------------------------------------------------------------

const TODAY_LABEL = 'Fri, Jul 4';
const REFILL_DATE = 'Sun, Jul 12';
const TOKENS_ISSUED_EACH = 3;

type MemberId = 'sam' | 'riley' | 'jo';

interface Member {
  id: MemberId;
  name: string;
  initial: string;
  // Avatar fills — contrast math at the AVATAR_TEXT declaration.
  bg: string;
}

const MEMBERS: Member[] = [
  {id: 'sam', name: 'Sam', initial: 'S', bg: 'light-dark(#0E7A52, #7BD8B0)'},
  {id: 'riley', name: 'Riley', initial: 'R', bg: 'light-dark(#1D66AC, #8CC5F2)'},
  {id: 'jo', name: 'Jo', initial: 'J', bg: 'light-dark(#A34B06, #F2B27C)'},
];

const MEMBER_BY_ID: Record<MemberId, Member> = {
  sam: MEMBERS[0],
  riley: MEMBERS[1],
  jo: MEMBERS[2],
};

/** TODAY (Jul 4) + benchDays → 'Jul 18' (spills into Aug past the 31st). */
function benchUntilLabel(benchDays: number): string {
  const day = 4 + benchDays;
  return day <= 31 ? `Jul ${day}` : `Aug ${day - 31}`;
}

interface TitleFixture {
  id: string;
  name: string;
  runtimeMin: number; // dual field beside runtimeLabel
  runtimeLabel: string;
  energy: number; // 1-5, dual field beside energyLabel
  energyLabel: string;
  hue: number; // id-derived art gradient hue — no network media
  mono: string; // monogram initials, precomputed (deterministic)
  synopsis: string;
}

// 14 titles in HOUSEHOLD PRIORITY (seed) order. DIAL DEFAULT budget=120,
// energyCap=3 ⇒ fits = {104,90,102,101,97,100,116,113,114} = 9 of 14.
// CROSS-CHECK (excluded 5): Locked Parlor runtime-only 130>120; Signal
// from Meridian energy-only E4>3; Split Second energy-only E4>3; Wexford
// Sisters both 139/E5; Quarry Hollow both 153/E5 — 9+5=14 ✓.
// STEPPER-CHECKABLE AGGREGATES (all via fitsDial, never hand-typed):
// budget 120→105 ⇒ {104,90,102,101,97,100} = 6 of 14; 120→135 ⇒ +Locked
// Parlor = 10; energyCap 3→4 at 120 ⇒ +Signal, +Split Second = 11; budget
// →75 ⇒ 0 of 14 (min fixture runtime is Split Second's 89).
const TITLES: TitleFixture[] = [
  {id: 'marmalade', name: 'The Marmalade Heist', runtimeMin: 104, runtimeLabel: '104 min', energy: 1, energyLabel: 'Energy 1', hue: 28, mono: 'MH', synopsis: 'Three retired jam-makers case the county fair to steal back a stolen recipe, one polite distraction at a time.'},
  {id: 'loop', name: 'Loop Motel', runtimeMin: 90, runtimeLabel: '90 min', energy: 2, energyLabel: 'Energy 2', hue: 196, mono: 'LM', synopsis: 'A night clerk keeps checking in the same couple every 40 minutes and starts leaving notes for the next loop.'},
  {id: 'valedictorians', name: 'Valedictorians', runtimeMin: 102, runtimeLabel: '102 min', energy: 2, energyLabel: 'Energy 2', hue: 260, mono: 'V', synopsis: 'Two co-valedictorians sabotage each other’s graduation speeches until a shared secret rewrites both.'},
  {id: 'wilder', name: 'Wilder Creek', runtimeMin: 101, runtimeLabel: '101 min', energy: 2, energyLabel: 'Energy 2', hue: 88, mono: 'WC', synopsis: 'A summer-camp cook and a park ranger co-parent a runaway beaver dam that keeps rerouting the town.'},
  {id: 'riverlight', name: 'Riverlight', runtimeMin: 97, runtimeLabel: '97 min', energy: 1, energyLabel: 'Energy 1', hue: 172, mono: 'R', synopsis: 'A ferry pilot on her last crossing carries one passenger who remembers every river the town has dammed.'},
  {id: 'party', name: 'Party of Liars', runtimeMin: 100, runtimeLabel: '100 min', energy: 2, energyLabel: 'Energy 2', hue: 330, mono: 'PL', synopsis: 'Six dinner guests each claim they invited the others; the host never existed and the wine is running out.'},
  {id: 'midnight', name: 'Midnight Errands', runtimeMin: 116, runtimeLabel: '116 min', energy: 2, energyLabel: 'Energy 2', hue: 244, mono: 'ME', synopsis: 'An all-night pharmacy courier trades one impossible delivery for another across a city that won’t sleep.'},
  {id: 'roboto', name: 'The Roboto Family', runtimeMin: 113, runtimeLabel: '113 min', energy: 1, energyLabel: 'Energy 1', hue: 12, mono: 'RF', synopsis: 'A hand-me-down housekeeping robot inherits the family group chat and starts fixing more than the plumbing.'},
  {id: 'sauce', name: 'Sauce & Circumstance', runtimeMin: 114, runtimeLabel: '114 min', energy: 1, energyLabel: 'Energy 1', hue: 52, mono: 'SC', synopsis: 'A courtroom drama argued entirely over a contested family marinara, with testimony by taste.'},
  {id: 'parlor', name: 'The Locked Parlor', runtimeMin: 130, runtimeLabel: '130 min', energy: 2, energyLabel: 'Energy 2', hue: 300, mono: 'LP', synopsis: 'A locked-room mystery where the room writes letters to the detective complaining about the suspects.'},
  {id: 'signal', name: 'Signal from Meridian', runtimeMin: 116, runtimeLabel: '116 min', energy: 4, energyLabel: 'Energy 4', hue: 208, mono: 'SM', synopsis: 'A relay engineer decodes a distress pattern that predicts outages three days before they happen.'},
  {id: 'split', name: 'The Split Second', runtimeMin: 89, runtimeLabel: '89 min', energy: 4, energyLabel: 'Energy 4', hue: 4, mono: 'SS', synopsis: 'A stunt timer’s stopwatch starts running backward during the one take that can’t be redone.'},
  // Long-title stress: 63 chars — must clamp to 2 lines at 123px card width.
  {id: 'wexford', name: 'The Considerable Misadventures of the Wexford Sisters, Abridged', runtimeMin: 139, runtimeLabel: '139 min', energy: 5, energyLabel: 'Energy 5', hue: 136, mono: 'WS', synopsis: 'Four sisters abridge their own biopic live on stage, skipping every apology their family came to hear.'},
  {id: 'quarry', name: 'Quarry Hollow', runtimeMin: 153, runtimeLabel: '153 min', energy: 5, energyLabel: 'Energy 5', hue: 224, mono: 'QH', synopsis: 'A quarry town digs up the bell it buried a century ago and the nights stop being quiet.'},
];

const TITLE_BY_ID: Record<string, TitleFixture> = Object.fromEntries(
  TITLES.map(title => [title.id, title]),
);
const SEED_INDEX: Record<string, number> = Object.fromEntries(
  TITLES.map((title, index) => [title.id, index]),
);
const TOTAL_TITLES = TITLES.length; // 14

interface DialState {
  budget: number; // minutes, 45-180, step 15
  energyCap: number; // 1-5, step 1
}

/** THE filter — every fit count on screen derives from this one function. */
function fitsDial(title: TitleFixture, dial: DialState): boolean {
  return title.runtimeMin <= dial.budget && title.energy <= dial.energyCap;
}

function fitIdsFor(dial: DialState): string[] {
  return TITLES.filter(title => fitsDial(title, dial)).map(title => title.id);
}

/** Reason chip for DOESN'T FIT rows: '130 min' / 'Energy 4' / '153 min'. */
function unfitReason(title: TitleFixture, dial: DialState): string {
  return title.runtimeMin > dial.budget ? title.runtimeLabel : title.energyLabel;
}

// Art gradient from the title's id-derived hue — white monogram on
// 40%/26%-lightness stops ≈ 4.6:1+ in both schemes (same literal gradient
// in light and dark; it reads as poster art, not chrome).
function artGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 45% 40%), hsl(${(hue + 40) % 360} 55% 26%))`;
}

// PAST NIGHTS — 4 fixed rows for the pushed History screen.
interface PastNight {
  id: string;
  titleName: string;
  detail: string;
}

const PAST_NIGHTS: PastNight[] = [
  {id: 'n0702', titleName: 'Loop Motel', detail: 'Jul 2 · decided in 3 rounds'},
  {id: 'n0627', titleName: 'Party of Liars', detail: 'Jun 27 · decided in 2 rounds'},
  {id: 'n0620', titleName: 'The Roboto Family', detail: "Jun 20 · Sam's veto sealed the final"},
  {id: 'n0613', titleName: 'Riverlight', detail: 'Jun 13 · decided in 3 rounds'},
];

// ---------------------------------------------------------------------------
// ONE STATE OWNER — bracketStore. Every count on screen (hub, dialSummary,
// tab badge, group headers, token captions, log length) DERIVES from these
// arrays; there are no parallel literals. `prev` is the one-deep Undo
// snapshot (undoOverConfirm: reversible verbs execute immediately).
// ---------------------------------------------------------------------------

type TitleStatus = 'alive' | 'benched' | 'ondeck' | 'out';
type TabId = 'tonight' | 'watchlist' | 'household' | 'profile';
type DecidedBy = 'votes' | 'veto' | 'pick';

interface TitleState {
  status: TitleStatus;
  benchedUntil: string | null;
}

interface Match {
  id: string;
  a: string;
  b: string;
  winnerId: string | null;
  decidedBy: DecidedBy | null;
  vetoBy: MemberId | null;
  votes: Partial<Record<MemberId, string>>; // fixture attribution chips
  decidedSeq: number; // 0 = undecided
}

interface VetoLogRow {
  id: string;
  text: string;
  when: string;
}

type ActionSheetState =
  | {kind: 'vetoWho'; titleId: string}
  | {kind: 'vetoWhich'; memberId: MemberId};

interface BracketStore {
  titles: Record<string, TitleState>;
  dial: DialState;
  seededIds: string[]; // round-1 seeds — needsReseed compares vs fitIds
  rounds: string[][]; // match ids per round
  matches: Record<string, Match>;
  carryId: string | null; // odd-count bye carried into the next round
  tonightPickId: string | null;
  nextSeq: number;
  nextMatchNo: number;
  tokens: Record<MemberId, number>; // remaining (issued 3 each)
  vetoLog: VetoLogRow[];
  benchDays: number; // Profile setting — bench chips derive from it
  activeTab: TabId;
  historyPushed: boolean; // Tonight tab's push-stack depth (persists)
  refreshing: boolean;
  sheet: {titleId: string; detent: 'medium' | 'large'} | null;
  actionSheet: ActionSheetState | null;
  menuTitleId: string | null;
  swipeOpenId: string | null;
  toast: {seq: number; text: string; undoable: boolean} | null;
  prev: BracketStore | null; // one-deep undo snapshot
}

// ROUND OF 8 at load: M1 decided (Marmalade def. Loop Motel 2–1: Sam✓ +
// Riley✓ vs Jo✓ = 3 votes = 3 members ✓), M2 decided by Jo's veto
// (Valedictorians def. Wilder Creek), M3 LIVE (Riverlight vs Party of
// Liars; Sam✓ Riverlight, Riley✓ Party, Jo undecided), M4 queued.
const INITIAL_MATCHES: Record<string, Match> = {
  m1: {id: 'm1', a: 'marmalade', b: 'loop', winnerId: 'marmalade', decidedBy: 'votes', vetoBy: null, votes: {sam: 'marmalade', riley: 'marmalade', jo: 'loop'}, decidedSeq: 1},
  m2: {id: 'm2', a: 'valedictorians', b: 'wilder', winnerId: 'valedictorians', decidedBy: 'veto', vetoBy: 'jo', votes: {}, decidedSeq: 2},
  m3: {id: 'm3', a: 'riverlight', b: 'party', winnerId: null, decidedBy: null, vetoBy: null, votes: {sam: 'riverlight', riley: 'party'}, decidedSeq: 0},
  m4: {id: 'm4', a: 'midnight', b: 'roboto', winnerId: null, decidedBy: null, vetoBy: null, votes: {}, decidedSeq: 0},
};

// ALIVE = 8 seeded − 2 benched losers = 6 → Watchlist badge '6' and the
// IN PLAY group of 6. WATCHLIST CROSS-CHECK: 6 in play + 2 benched (Loop
// Motel, Wilder Creek) + 1 on deck (Sauce & Circumstance) + 5 don't-fit =
// 14 = the terminal caption 'All 14 titles'.
const INITIAL_TITLE_STATE: Record<string, TitleState> = {
  marmalade: {status: 'alive', benchedUntil: null},
  loop: {status: 'benched', benchedUntil: 'Jul 18'},
  valedictorians: {status: 'alive', benchedUntil: null},
  wilder: {status: 'benched', benchedUntil: 'Jul 18'},
  riverlight: {status: 'alive', benchedUntil: null},
  party: {status: 'alive', benchedUntil: null},
  midnight: {status: 'alive', benchedUntil: null},
  roboto: {status: 'alive', benchedUntil: null},
  sauce: {status: 'ondeck', benchedUntil: null},
  parlor: {status: 'out', benchedUntil: null},
  signal: {status: 'out', benchedUntil: null},
  split: {status: 'out', benchedUntil: null},
  wexford: {status: 'out', benchedUntil: null},
  quarry: {status: 'out', benchedUntil: null},
};

const INITIAL_STORE: BracketStore = {
  titles: INITIAL_TITLE_STATE,
  dial: {budget: 120, energyCap: 3},
  seededIds: ['marmalade', 'loop', 'valedictorians', 'wilder', 'riverlight', 'party', 'midnight', 'roboto'],
  rounds: [['m1', 'm2', 'm3', 'm4']],
  matches: INITIAL_MATCHES,
  carryId: null,
  tonightPickId: null,
  nextSeq: 3,
  nextMatchNo: 5,
  // TOKENS: issued 3×3 = 9; spent Sam 1 + Riley 0 + Jo 2 = 3 (= the 3
  // veto-log rows); remaining 2+3+1 = 6; 6+3 = 9 ✓.
  tokens: {sam: 2, riley: 3, jo: 1},
  vetoLog: [
    {id: 'v1', text: 'Jo vetoed Wilder Creek', when: 'tonight'},
    {id: 'v2', text: 'Jo vetoed The Split Second', when: 'Mon Jun 30'},
    {id: 'v3', text: 'Sam vetoed Quarry Hollow', when: 'Tue Jul 1'},
  ],
  benchDays: 14,
  activeTab: 'tonight',
  historyPushed: false,
  refreshing: false,
  sheet: null,
  actionSheet: null,
  menuTitleId: null,
  swipeOpenId: null,
  toast: null,
  prev: null,
};

// ---------------------------------------------------------------------------
// DERIVATIONS — pure helpers over the store.
// ---------------------------------------------------------------------------

function aliveCount(store: BracketStore): number {
  return TITLES.filter(title => store.titles[title.id].status === 'alive').length;
}

function currentRound(store: BracketStore): string[] {
  return store.rounds[store.rounds.length - 1] ?? [];
}

function liveMatch(store: BracketStore): Match | null {
  if (store.tonightPickId != null) return null;
  const round = currentRound(store);
  for (const id of round) {
    if (store.matches[id].winnerId == null) return store.matches[id];
  }
  return null;
}

function roundName(store: BracketStore): string {
  const round = currentRound(store);
  const seats = round.length * 2 + (store.carryId != null ? 1 : 0);
  return seats <= 2 ? 'FINAL' : `ROUND OF ${seats}`;
}

interface Frontrunner {
  titleId: string;
  detail: string;
  isTonightPick: boolean;
}

/**
 * Frontrunner = latest decided winner with the best vote margin (votes
 * margin for vote-decided matches, 1 for a household pick, 0 for a veto
 * advance; ties break to the LATEST decision). At load: M1 margin 1 (2–1)
 * beats M2's veto margin 0 → The Marmalade Heist. Once the Final lands,
 * the banner becomes the tonightPick card.
 */
function deriveFrontrunner(store: BracketStore): Frontrunner | null {
  if (store.tonightPickId != null) {
    const title = TITLE_BY_ID[store.tonightPickId];
    return {titleId: title.id, detail: `Tonight: ${title.name} · ${title.runtimeLabel}`, isTonightPick: true};
  }
  let best: {match: Match; margin: number} | null = null;
  for (const match of Object.values(store.matches)) {
    if (match.winnerId == null || match.decidedSeq === 0) continue;
    let margin = 1;
    if (match.decidedBy === 'votes') {
      const votes = Object.values(match.votes);
      const forWinner = votes.filter(vote => vote === match.winnerId).length;
      margin = forWinner - (votes.length - forWinner);
    } else if (match.decidedBy === 'veto') {
      margin = 0;
    }
    if (
      best == null ||
      margin > best.margin ||
      (margin === best.margin && match.decidedSeq > best.match.decidedSeq)
    ) {
      best = {match, margin};
    }
  }
  if (best == null) return null;
  const {match} = best;
  const winner = TITLE_BY_ID[match.winnerId as string];
  const matchNo = Number(match.id.slice(1));
  let detail: string;
  if (match.decidedBy === 'votes') {
    const votes = Object.values(match.votes);
    const forWinner = votes.filter(vote => vote === match.winnerId).length;
    detail = `won ${forWinner}–${votes.length - forWinner} in Match ${matchNo}`;
  } else if (match.decidedBy === 'veto') {
    detail = `advanced on ${MEMBER_BY_ID[match.vetoBy as MemberId].name}'s veto in Match ${matchNo}`;
  } else {
    detail = `picked in Match ${matchNo}`;
  }
  return {titleId: winner.id, detail, isTonightPick: false};
}

/** Sort ids by household priority (seed) order. */
function bySeed(ids: string[]): string[] {
  return [...ids].sort((a, b) => SEED_INDEX[a] - SEED_INDEX[b]);
}

/**
 * Advance the bracket after `matches[matchId]` gains a winner: if the
 * current round is complete, build the next round by pairing winners in
 * seed order (odd counts carry the last seed as a bye via carryId); a
 * single survivor becomes tonightPick.
 */
function advanceRounds(store: BracketStore): BracketStore {
  const round = currentRound(store);
  if (round.some(id => store.matches[id].winnerId == null)) return store;
  const winners = bySeed(
    round
      .map(id => store.matches[id].winnerId as string)
      .concat(store.carryId != null ? [store.carryId] : []),
  );
  if (winners.length <= 1) {
    return {...store, tonightPickId: winners[0] ?? null, carryId: null};
  }
  const carry = winners.length % 2 === 1 ? winners[winners.length - 1] : null;
  const paired = carry != null ? winners.slice(0, -1) : winners;
  const newMatches: Record<string, Match> = {...store.matches};
  const roundIds: string[] = [];
  let matchNo = store.nextMatchNo;
  for (let i = 0; i < paired.length; i += 2) {
    const id = `m${matchNo}`;
    newMatches[id] = {id, a: paired[i], b: paired[i + 1], winnerId: null, decidedBy: null, vetoBy: null, votes: {}, decidedSeq: 0};
    roundIds.push(id);
    matchNo += 1;
  }
  return {
    ...store,
    matches: newMatches,
    rounds: [...store.rounds, roundIds],
    carryId: carry,
    nextMatchNo: matchNo,
  };
}

/** Snapshot for the one-deep Undo (the snapshot itself carries no prev). */
function snapshot(store: BracketStore): BracketStore {
  return {...store, prev: null};
}

// ---------------------------------------------------------------------------
// MOOD DIAL GEOMETRY — 200px ring (r 94, stroke 12) in a 220 box. Angles
// measured from 12 o'clock, clockwise positive. Budget sweeps the LEFT
// arc: 45 min at −18° → 180 min at −162° (144° span, ticks at 45/90/135/
// 180). Energy snaps 5 detents on the RIGHT arc at +18/+54/+90/+126/+162
// (E1 'Comfort' … E5 'Challenge'). 18° gaps at 12 and 6 o'clock keep the
// two thumbs from ever colliding.
// ---------------------------------------------------------------------------

const DIAL_C = 110;
const DIAL_R = 94;
const BUDGET_MIN = 45;
const BUDGET_MAX = 180;
const BUDGET_STEP = 15;
const ENERGY_MIN = 1;
const ENERGY_MAX = 5;

function budgetDeg(budget: number): number {
  return -(18 + ((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 144);
}

function energyDeg(level: number): number {
  return 18 + (level - 1) * 36;
}

function dialPoint(deg: number, radius: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: DIAL_C + radius * Math.sin(rad), y: DIAL_C - radius * Math.cos(rad)};
}

/** SVG arc path from fromDeg to toDeg along the ring (shorter sweep). */
function dialArc(fromDeg: number, toDeg: number): string {
  const from = dialPoint(fromDeg, DIAL_R);
  const to = dialPoint(toDeg, DIAL_R);
  const sweep = toDeg > fromDeg ? 1 : 0;
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${DIAL_R} ${DIAL_R} 0 ${large} ${sweep} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

/** Pointer position (relative to the 220-box center) → signed degrees. */
function pointerDeg(dx: number, dy: number): number {
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

// ---------------------------------------------------------------------------
// SHARED HOOKS + FOCUS UTILITIES
// ---------------------------------------------------------------------------

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
 * wrapper can tell the two stages apart. */
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns the page
 * scroll, so per-tab scrollTop persistence records/restores against it. */
function getScroller(element: HTMLElement | null): HTMLElement | null {
  let node = element?.parentElement ?? null;
  while (node != null) {
    const overflowY = window.getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 28px crescent-reel: a film-reel hub whose missing sprocket
// notch forms a crescent (BRAND_ACCENT) over --color-text-primary strokes.
// ---------------------------------------------------------------------------

function NightcapMark() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      {/* Reel rim */}
      <circle cx="14" cy="14" r="11" stroke="var(--color-text-primary)" strokeWidth="1.8" />
      {/* Hub */}
      <circle cx="14" cy="14" r="2.4" fill="var(--color-text-primary)" />
      {/* Three of four sprockets — the missing fourth is the crescent seat */}
      <circle cx="14" cy="8" r="2.2" stroke="var(--color-text-primary)" strokeWidth="1.4" />
      <circle cx="8" cy="14" r="2.2" stroke="var(--color-text-primary)" strokeWidth="1.4" />
      <circle cx="14" cy="20" r="2.2" stroke="var(--color-text-primary)" strokeWidth="1.4" />
      {/* Crescent where the fourth sprocket would sit */}
      <path d="M21.5 11.2a3.4 3.4 0 1 0 0 5.6 4.2 4.2 0 0 1 0-5.6Z" fill={BRAND_ACCENT} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MOOD DIAL — 200px SVG ring, two thumbs on one track. Pointer drag on the
// thumbs is garnish; the CONTRACT is the two stepper pairs below (±15 min,
// ±1 energy), each value a role=spinbutton with ArrowUp/Down wired. Thumbs
// are 28px visual inside 44×44 hit zones, focusable sliders with
// aria-valuetext ('120 minutes', 'Energy 3 of 5').
// ---------------------------------------------------------------------------

interface MoodDialProps {
  dial: DialState;
  fitCount: number;
  onBudget: (value: number) => void;
  onEnergy: (value: number) => void;
}

function MoodDial({dial, fitCount, onBudget, onEnergy}: MoodDialProps) {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<null | 'budget' | 'energy'>(null);

  const handleDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const which = dragRef.current;
    const zone = zoneRef.current;
    if (which == null || zone == null) return;
    const rect = zone.getBoundingClientRect();
    const deg = pointerDeg(
      event.clientX - (rect.left + rect.width / 2),
      event.clientY - (rect.top + rect.height / 2),
    );
    if (which === 'budget') {
      // Left arc only: mirror right-half touches onto the left sweep.
      const leftDeg = Math.min(-18, Math.max(-162, deg > 0 ? -deg : deg));
      const raw = BUDGET_MIN + ((-leftDeg - 18) / 144) * (BUDGET_MAX - BUDGET_MIN);
      onBudget(Math.round(raw / BUDGET_STEP) * BUDGET_STEP);
    } else {
      const rightDeg = Math.min(162, Math.max(18, deg < 0 ? -deg : deg));
      onEnergy(Math.round((rightDeg - 18) / 36) + 1);
    }
  };

  const budgetPos = dialPoint(budgetDeg(dial.budget), DIAL_R);
  const energyPos = dialPoint(energyDeg(dial.energyCap), DIAL_R);
  const budgetTicks = [45, 90, 135, 180];

  const thumbButton = (
    which: 'budget' | 'energy',
    pos: {x: number; y: number},
    aria: {label: string; now: number; min: number; max: number; text: string},
    onKey: (delta: number) => void,
  ) => (
    <button
      type="button"
      className="ntc-btn ntc-focusable"
      role="slider"
      aria-label={aria.label}
      aria-valuenow={aria.now}
      aria-valuemin={aria.min}
      aria-valuemax={aria.max}
      aria-valuetext={aria.text}
      aria-orientation="horizontal"
      style={{
        position: 'absolute',
        left: pos.x - 22,
        top: pos.y - 22,
        width: 44,
        height: 44,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        touchAction: 'none',
      }}
      onPointerDown={event => {
        dragRef.current = which;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={handleDrag}
      onPointerUp={() => {
        dragRef.current = null;
      }}
      onKeyDown={event => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
          event.preventDefault();
          onKey(1);
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
          event.preventDefault();
          onKey(-1);
        }
      }}>
      {/* 28px visual thumb in the 44px hit — brand fill, card ring. */}
      <span
        aria-hidden
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: BRAND_ACCENT,
          border: '3px solid var(--color-background-card)',
          boxShadow: '0 1px 4px var(--color-shadow)',
        }}
      />
    </button>
  );

  return (
    <div ref={zoneRef} style={styles.dialZone}>
      <svg width={220} height={220} viewBox="0 0 220 220" fill="none" aria-hidden>
        {/* REST tracks — TRACK_REST (≥3:1 vs body, math at declaration). */}
        <path d={dialArc(-18, -162)} stroke={TRACK_REST} strokeWidth={12} strokeLinecap="round" />
        <path d={dialArc(18, 162)} stroke={TRACK_REST} strokeWidth={12} strokeLinecap="round" />
        {/* Active sweeps — brand. */}
        <path d={dialArc(-18, budgetDeg(dial.budget))} stroke={BRAND_ACCENT} strokeWidth={12} strokeLinecap="round" className="ntc-fade" />
        <path d={dialArc(18, energyDeg(dial.energyCap))} stroke={BRAND_ACCENT} strokeWidth={12} strokeLinecap="round" className="ntc-fade" />
        {/* Energy detent beads — reached brand-on-brand ring, future beads
            TRACK_REST solid (NOT hairline; ≥3:1 vs body per amendment). */}
        {[1, 2, 3, 4, 5].map(level => {
          const pos = dialPoint(energyDeg(level), DIAL_R);
          const reached = level <= dial.energyCap;
          return (
            <circle
              key={level}
              cx={pos.x}
              cy={pos.y}
              r={3.5}
              fill={reached ? BRAND_FILL_TEXT : TRACK_REST}
            />
          );
        })}
        {/* Budget tick labels 11px/500 outside the ring. */}
        {budgetTicks.map(tick => {
          const pos = dialPoint(budgetDeg(tick), DIAL_R + 15);
          return (
            <text key={tick} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={500} fill="var(--color-text-secondary)">
              {tick}
            </text>
          );
        })}
        {[1, 2, 3, 4, 5].map(level => {
          const pos = dialPoint(energyDeg(level), DIAL_R + 15);
          return (
            <text key={level} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={500} fill="var(--color-text-secondary)">
              {`E${level}`}
            </text>
          );
        })}
      </svg>
      {/* Hub readout — live '9' over 'of 14 fit'; derives from fitsDial. */}
      <div style={styles.dialHub}>
        <div style={styles.dialHubStack}>
          <span style={styles.dialHubCount}>{fitCount}</span>
          <span style={styles.dialHubSub}>of {TOTAL_TITLES} fit</span>
        </div>
      </div>
      {thumbButton(
        'budget',
        budgetPos,
        {label: 'Runtime budget', now: dial.budget, min: BUDGET_MIN, max: BUDGET_MAX, text: `${dial.budget} minutes`},
        delta => onBudget(dial.budget + delta * BUDGET_STEP),
      )}
      {thumbButton(
        'energy',
        energyPos,
        {label: 'Energy cap', now: dial.energyCap, min: ENERGY_MIN, max: ENERGY_MAX, text: `Energy ${dial.energyCap} of 5`},
        delta => onEnergy(dial.energyCap + delta),
      )}
    </div>
  );
}

// Stepper pair — 96×32 track split by a hairline; halves are real buttons
// named 'Decrease/Increase …' whose hits stretch to 44px via block
// padding; the trailing value is the focusable spinbutton.
interface StepperPairProps {
  label: string;
  value: string;
  ariaLabel: string;
  now: number;
  min: number;
  max: number;
  onStep: (delta: number) => void;
}

function StepperPair({label, value, ariaLabel, now, min, max, onStep}: StepperPairProps) {
  const atMin = now <= min;
  const atMax = now >= max;
  return (
    <div style={styles.stepperBlock}>
      <span style={styles.stepperLabel}>{label}</span>
      <div style={styles.stepperTrack}>
        <button
          type="button"
          className="ntc-btn ntc-focusable"
          style={{...styles.stepperHalf, ...(atMin ? styles.stepperHalfDisabled : null)}}
          aria-label={`Decrease ${ariaLabel}`}
          disabled={atMin}
          onClick={() => onStep(-1)}>
          <Icon icon={MinusIcon} size="sm" color="inherit" />
        </button>
        <div style={styles.stepperHairline} />
        <button
          type="button"
          className="ntc-btn ntc-focusable"
          style={{...styles.stepperHalf, ...(atMax ? styles.stepperHalfDisabled : null)}}
          aria-label={`Increase ${ariaLabel}`}
          disabled={atMax}
          onClick={() => onStep(1)}>
          <Icon icon={PlusIcon} size="sm" color="inherit" />
        </button>
      </div>
      <span
        className="ntc-focusable"
        style={styles.stepperValue}
        role="spinbutton"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuenow={now}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={value}
        onKeyDown={event => {
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            onStep(1);
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            onStep(-1);
          }
        }}>
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MEMBER CHIP — 24px avatar-initial chip with a check / veto glyph seat.
// Static fixture attribution; announced via the card's aria-label, so the
// chip row itself is aria-hidden.
// ---------------------------------------------------------------------------

function MemberChip({member, glyph}: {member: Member; glyph: 'check' | 'veto'}) {
  return (
    <span style={{...styles.memberChip, background: member.bg}}>
      {member.initial}
      <span style={styles.chipGlyph}>
        {glyph === 'check' ? (
          <svg width={8} height={8} viewBox="0 0 8 8" fill="none" aria-hidden>
            <path d="M1.5 4.2 3.2 6 6.5 2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width={8} height={8} viewBox="0 0 8 8" fill="none" aria-hidden>
            <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// FACEOFF PAIR — two title cards joined by the fixed 42px lightning
// divider, under the ROUND OF 8 · MATCH n breadcrumb. Long-press (450ms,
// cancel on 8px move) opens the titleSheet — duplicated exactly by the
// visible Details button (gesture-with-button-path law).
// ---------------------------------------------------------------------------

interface FaceoffPairProps {
  match: Match;
  onPick: (matchId: string, winnerId: string) => void;
  onDetails: (titleId: string, opener: HTMLElement) => void;
}

function FaceoffPair({match, onPick, onDetails}: FaceoffPairProps) {
  const pressTimer = useRef<number | null>(null);
  const pressStart = useRef<{x: number; y: number} | null>(null);

  const clearPress = () => {
    if (pressTimer.current != null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    pressStart.current = null;
  };

  const cardFor = (titleId: string) => {
    const title = TITLE_BY_ID[titleId];
    const backers = MEMBERS.filter(member => match.votes[member.id] === titleId);
    const backersLabel = backers.length > 0 ? `, backed by ${backers.map(member => member.name).join(' and ')}` : '';
    return (
      <div
        key={titleId}
        role="group"
        aria-label={`${title.name}, ${title.runtimeLabel}, ${title.energyLabel}${backersLabel}`}
        style={styles.faceCard}
        className="ntc-fold-in"
        onPointerDown={event => {
          pressStart.current = {x: event.clientX, y: event.clientY};
          const target = event.currentTarget;
          pressTimer.current = window.setTimeout(() => {
            pressTimer.current = null;
            onDetails(titleId, target);
          }, 450);
        }}
        onPointerMove={event => {
          const start = pressStart.current;
          if (start != null && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) {
            clearPress();
          }
        }}
        onPointerUp={clearPress}
        onPointerLeave={clearPress}>
        <div style={{...styles.faceArt, background: artGradient(title.hue)}} aria-hidden>
          {title.mono}
        </div>
        <div style={styles.faceBody}>
          {/* 2-line clamp — the 63-char Wexford title is the stress. */}
          <span className="ntc-clamp2" style={styles.faceTitle}>
            {title.name}
          </span>
          <span style={styles.faceMeta}>
            {title.runtimeLabel} · {title.energyLabel}
          </span>
          <span style={styles.chipRow} aria-hidden>
            {backers.map(member => (
              <MemberChip key={member.id} member={member} glyph="check" />
            ))}
          </span>
          <button
            type="button"
            className="ntc-btn ntc-focusable"
            style={styles.pickBtn}
            onClick={() => onPick(match.id, titleId)}>
            Pick this
          </button>
          <button
            type="button"
            className="ntc-btn ntc-focusable"
            style={styles.detailsBtn}
            onClick={event => onDetails(titleId, event.currentTarget)}>
            Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.faceoffRow}>
      {cardFor(match.a)}
      <div style={styles.dividerCol} aria-hidden>
        <div style={styles.dividerLine} />
        <div style={styles.dividerCircle}>
          <Icon icon={ZapIcon} size="md" color="inherit" />
        </div>
        <div style={styles.dividerLine} />
      </div>
      {cardFor(match.b)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WATCHLIST ROW — 72px media row; horizontal drag reveals TWO 72px blocks
// (brand Details + error Veto — foundations law is −72 per action, so the
// pair snaps at −144) with the MANDATORY visible 44×44 ellipsis opening
// the same actions as an anchored menu.
// ---------------------------------------------------------------------------

interface WatchRowProps {
  title: TitleFixture;
  secondary: string;
  trailing: ReactNode;
  showAliveDot: boolean;
  vetoable: boolean;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onDetails: (opener: HTMLElement) => void;
  onVeto: (opener: HTMLElement) => void;
  onToggleMenu: (opener: HTMLElement) => void;
}

function WatchRow({
  title,
  secondary,
  trailing,
  showAliveDot,
  vetoable,
  isSwipeOpen,
  isMenuOpen,
  isLast,
  reducedMotion,
  menuRef,
  onSwipeOpen,
  onSwipeClose,
  onDetails,
  onVeto,
  onToggleMenu,
}: WatchRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const REVEAL = 144; // two 72px action blocks
  const base = isSwipeOpen ? -REVEAL : 0;
  const offset = dragX != null ? Math.max(-REVEAL, Math.min(0, base + dragX)) : base;

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
    const settled = Math.max(-REVEAL, Math.min(0, base + dragX));
    setDragX(null);
    if (movedRef.current) {
      if (settled < -REVEAL / 2) onSwipeOpen();
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
    <div style={styles.watchOuter}>
      <div style={styles.watchClip}>
        <div style={styles.watchActions}>
          <button
            type="button"
            className="ntc-btn"
            style={{...styles.watchActionBtn, background: BRAND_ACCENT, color: BRAND_FILL_TEXT}}
            tabIndex={isSwipeOpen ? 0 : -1}
            aria-hidden={!isSwipeOpen}
            onClick={event => onDetails(event.currentTarget)}>
            Details
          </button>
          <button
            type="button"
            className="ntc-btn"
            style={{
              ...styles.watchActionBtn,
              background: ERROR_STRONG,
              color: ERROR_FILL_TEXT,
              ...(vetoable ? null : {opacity: 0.35}),
            }}
            tabIndex={isSwipeOpen ? 0 : -1}
            aria-hidden={!isSwipeOpen}
            disabled={!vetoable}
            onClick={event => onVeto(event.currentTarget)}>
            Veto
          </button>
        </div>
        <div
          style={{
            ...styles.watchContent,
            transform: offset !== 0 ? `translateX(${offset}px)` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 200ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="ntc-btn ntc-focusable"
            style={styles.watchRowBtn}
            aria-label={`${title.name}, ${title.runtimeLabel}, ${title.energyLabel} — details`}
            onClick={guardClick(onDetails)}>
            <span style={{...styles.watchThumb, background: artGradient(title.hue)}} aria-hidden>
              {title.mono}
            </span>
            <span style={styles.row60Text}>
              <span style={styles.rowPrimary}>{title.name}</span>
              <span style={styles.rowSecondary}>{secondary}</span>
            </span>
            {showAliveDot ? <span style={styles.aliveDot} aria-hidden /> : null}
            {trailing}
          </button>
          {/* The 44px ellipsis never shrinks (responsive contract). */}
          <button
            type="button"
            className="ntc-btn ntc-focusable"
            style={styles.iconBtn}
            aria-label={`Actions for ${title.name}`}
            aria-expanded={isMenuOpen}
            onClick={guardClick(onToggleMenu)}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Actions for ${title.name}`}
          style={{...styles.anchoredMenu, top: 60}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button type="button" role="menuitem" className="ntc-btn ntc-focusable" style={styles.menuRow} onClick={event => onDetails(event.currentTarget)}>
            <span style={styles.rowPrimary}>Details</span>
          </button>
          <div style={styles.rowDivider} />
          {/* Destructive LAST, never bottom-right of a primary. */}
          <button
            type="button"
            role="menuitem"
            className="ntc-btn ntc-focusable"
            style={{...styles.menuRow, ...styles.menuRowDanger, ...(vetoable ? null : styles.menuRowDisabled)}}
            disabled={!vetoable}
            onClick={event => onVeto(event.currentTarget)}>
            <span style={styles.rowPrimary}>{vetoable ? 'Veto' : 'Veto — not in tonight’s match'}</span>
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDividerDeep} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// VETO TOKEN TRAY — one listCard, three member columns; each column is ONE
// merged 44px+ button (opens that member's veto actionSheet context).
// Unspent coin = BRAND_ACCENT fill (≥3:1 vs card, math at declaration);
// spent = muted + hairline + 40%-opacity slash glyph (never hairline-only).
// ---------------------------------------------------------------------------

interface TokenTrayProps {
  tokens: Record<MemberId, number>;
  onMemberTap: (memberId: MemberId, opener: HTMLElement) => void;
}

function TokenTray({tokens, onMemberTap}: TokenTrayProps) {
  return (
    <div style={styles.listCard}>
      <div style={styles.trayColumns}>
        {MEMBERS.map((member, index) => {
          const left = tokens[member.id];
          return (
            <div key={member.id} style={{display: 'flex', flex: 1, minWidth: 0}}>
              {index > 0 ? <div style={styles.trayHairline} /> : null}
              <button
                type="button"
                className="ntc-btn ntc-focusable"
                style={styles.trayCol}
                aria-label={`${member.name}: ${left} of ${TOKENS_ISSUED_EACH} veto tokens left`}
                onClick={event => onMemberTap(member.id, event.currentTarget)}>
                <span style={{...styles.trayAvatar, background: member.bg}} aria-hidden>
                  {member.initial}
                </span>
                <span style={styles.trayName}>{member.name}</span>
                <span style={styles.coinRow} aria-hidden>
                  {[0, 1, 2].map(slot => {
                    const spent = slot >= left;
                    return (
                      <span key={slot} style={{...styles.coin, ...(spent ? styles.coinSpent : styles.coinUnspent)}}>
                        {spent ? <span style={styles.coinSpentGlyph} /> : null}
                      </span>
                    );
                  })}
                </span>
                <span style={styles.trayCaption}>{left > 0 ? `${left} left` : `Out until ${REFILL_DATE.slice(5)}`}</span>
              </button>
            </div>
          );
        })}
      </div>
      <div style={styles.refillCaption}>Tokens refill {REFILL_DATE}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TITLE SHEET — two-detent bottom sheet (grabber is a real button; drag is
// garnish; >120px past medium closes). Focus trapped, moved in with
// preventScroll, restored to the opener on every close path.
// ---------------------------------------------------------------------------

interface TitleSheetProps {
  titleId: string;
  detent: 'medium' | 'large';
  dial: DialState;
  matches: Record<string, Match>;
  canPick: boolean;
  canVeto: boolean;
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDetent: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  onPick: () => void;
  onVeto: (opener: HTMLElement) => void;
}

function TitleSheet({titleId, detent, dial, matches, canPick, canVeto, reducedMotion, sheetRef, onDetent, onClose, onPick, onVeto}: TitleSheetProps) {
  const title = TITLE_BY_ID[titleId];
  const [dragY, setDragY] = useState<number | null>(null);
  const startYRef = useRef(0);
  const movedRef = useRef(false);

  const fitRuntime = title.runtimeMin <= dial.budget;
  const fitEnergy = title.energy <= dial.energyCap;
  // 'Why it fits' — built from the same fixture math as the hub filter.
  const whyLine = [
    fitRuntime ? `${title.runtimeMin} min ≤ ${dial.budget} min budget` : `${title.runtimeMin} min > ${dial.budget} min budget`,
    fitEnergy ? `Energy ${title.energy} ≤ cap ${dial.energyCap}` : `Energy ${title.energy} > cap ${dial.energyCap}`,
  ].join(' · ');

  const voteRows = Object.values(matches)
    .filter(match => match.a === titleId || match.b === titleId)
    .map(match => {
      const matchNo = Number(match.id.slice(1));
      if (match.winnerId == null) {
        const backers = MEMBERS.filter(member => match.votes[member.id] === titleId).map(member => member.name);
        return {id: match.id, text: `Match ${matchNo} · live${backers.length > 0 ? ` · ${backers.join(' + ')} backing` : ''}`};
      }
      const won = match.winnerId === titleId;
      const how = match.decidedBy === 'veto' ? `${MEMBER_BY_ID[match.vetoBy as MemberId].name}'s veto` : match.decidedBy === 'votes' ? 'votes' : 'a pick';
      return {id: match.id, text: `Match ${matchNo} · ${won ? 'won' : 'lost'} by ${how}`};
    });

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
    else if (dy > 60 && detent === 'large') onDetent('medium');
    else if (dy < -60 && detent === 'medium') onDetent('large');
  };
  const onGrabberClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onDetent(detent === 'medium' ? 'large' : 'medium');
  };

  const translate = dragY != null && dragY > 0 ? `translateY(${dragY}px)` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ntc-sheet-title"
      tabIndex={-1}
      className="ntc-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease',
      }}>
      <button
        type="button"
        className="ntc-btn ntc-focusable"
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
        <h2 id="ntc-sheet-title" style={styles.sheetTitle}>
          {title.name}
        </h2>
        <button type="button" className="ntc-btn ntc-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <div style={{...styles.artBanner, background: artGradient(title.hue)}} aria-hidden>
          {title.mono}
        </div>
        <div style={styles.whyLine}>{whyLine}</div>
        {detent === 'large' ? <p style={styles.synopsis}>{title.synopsis}</p> : null}
        {voteRows.map(row => (
          <div key={row.id} style={styles.sheetMetaRow}>
            {row.text}
          </div>
        ))}
        <div style={styles.sheetMetaRow}>
          {title.runtimeLabel} · {title.energyLabel} · added by the household
        </div>
      </div>
      {/* Veto sits LEFT of the 16px dead-space gap; Pick this trails. */}
      <div style={styles.sheetFooter}>
        <button
          type="button"
          className="ntc-btn ntc-focusable"
          style={{...styles.sheetVetoBtn, ...(canVeto ? null : {opacity: 0.35})}}
          disabled={!canVeto}
          onClick={event => onVeto(event.currentTarget)}>
          Veto
        </button>
        <button
          type="button"
          className="ntc-btn ntc-focusable"
          style={{...styles.sheetPickBtn, ...(canPick ? null : styles.sheetPickBtnDisabled)}}
          disabled={!canPick}
          onClick={onPick}>
          {canPick ? 'Pick this' : 'Not in tonight’s live match'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — veto attribution. Two stacked cards; focus lands on
// Cancel (safe default), Tab trapped, Escape/scrim/Cancel close with no
// action. Veto is reversible (Undo), so NO confirm alert exists here.
// ---------------------------------------------------------------------------

interface ActionSheetViewProps {
  state: ActionSheetState;
  store: BracketStore;
  live: Match | null;
  sheetRef: RefObject<HTMLDivElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
  onVeto: (titleId: string, memberId: MemberId) => void;
  onClose: () => void;
}

function ActionSheetView({state, store, live, sheetRef, cancelRef, onVeto, onClose}: ActionSheetViewProps) {
  const header =
    state.kind === 'vetoWho'
      ? `Spend a veto on ${TITLE_BY_ID[state.titleId].name}?`
      : `${MEMBER_BY_ID[state.memberId].name} — ${store.tokens[state.memberId]} of ${TOKENS_ISSUED_EACH} vetoes left · refill ${REFILL_DATE}`;
  const rows =
    state.kind === 'vetoWho'
      ? MEMBERS.map(member => ({
          id: member.id as string,
          label: member.name,
          trailing: `${store.tokens[member.id]} left`,
          disabled: store.tokens[member.id] === 0,
          action: () => onVeto(state.titleId, member.id),
        }))
      : (live == null ? [] : [live.a, live.b]).map(titleId => ({
          id: titleId,
          label: `Veto ${TITLE_BY_ID[titleId].name}`,
          trailing: '',
          disabled: store.tokens[state.memberId] === 0,
          action: () => onVeto(titleId, state.memberId),
        }));
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={header}
      tabIndex={-1}
      className="ntc-sheet-in"
      style={styles.actionSheetWrap}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}>
      <div style={styles.asCard}>
        <div style={styles.asHeader}>{header}</div>
        {rows.length === 0 ? (
          <div style={styles.asRow}>No live match to veto</div>
        ) : (
          rows.map((row, index) => (
            <div key={row.id}>
              {index > 0 ? <div style={styles.asHairline} /> : null}
              <button
                type="button"
                className="ntc-btn ntc-focusable"
                style={{...styles.asRow, ...(row.disabled ? styles.asRowDisabled : null)}}
                disabled={row.disabled}
                onClick={row.action}>
                <span>{row.label}</span>
                {row.trailing !== '' ? (
                  <span style={{fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'}}>
                    {row.trailing}
                  </span>
                ) : null}
              </button>
            </div>
          ))
        )}
      </div>
      <div style={styles.asCard}>
        <button type="button" ref={cancelRef} className="ntc-btn ntc-focusable" style={{...styles.asRow, ...styles.asCancel}} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileTonightPickerTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [store, setStore] = useState<BracketStore>(INITIAL_STORE);
  // Watchlist large-title sentinel → navBar center title fade (user-driven
  // scroll via IntersectionObserver — deterministic).
  const [watchNavTitle, setWatchNavTitle] = useState(false);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const dialSectionRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const asCancelRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const asOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const refreshBtnRef = useRef<HTMLButtonElement | null>(null);
  const scrollByTabRef = useRef<Record<string, number>>({});

  // DERIVED — every count flows from the same arrays (no parallel
  // literals): hub + dialSummary from fitsDial, badge + IN PLAY header
  // from status==='alive', token captions + veto-log length from tokens/
  // vetoLog, group headers from the grouped arrays below.
  const fitIds = fitIdsFor(store.dial);
  const fitCount = fitIds.length;
  const alive = aliveCount(store);
  const live = liveMatch(store);
  const frontrunner = deriveFrontrunner(store);
  const ondeckIds = TITLES.filter(title => store.titles[title.id].status === 'ondeck').map(title => title.id);
  const seededPool = bySeed([...store.seededIds, ...ondeckIds]).join('|');
  // Reseed is an EXPLICIT press, never automatic.
  const needsReseed = fitCount > 0 && bySeed(fitIds).join('|') !== seededPool;
  const overlayOpen = store.sheet != null || store.actionSheet != null;

  const toastSeq = (prev: BracketStore) => (prev.toast?.seq ?? 0) + 1;

  // VERBS ---------------------------------------------------------------

  // PICK — one beat benches the loser, may close the round and build the
  // next one, re-derives the frontrunner, and moves the Watchlist badge:
  // badge = count(status==='alive') derives 6→5 on the M3 pick (asserted
  // by construction — both read the same titles map, never a literal).
  const pick = useCallback((matchId: string, winnerId: string) => {
    setStore(prev => {
      const match = prev.matches[matchId];
      if (match == null || match.winnerId != null) return prev;
      const loserId = match.a === winnerId ? match.b : match.a;
      const until = benchUntilLabel(prev.benchDays);
      const snap = snapshot(prev);
      let next: BracketStore = {
        ...prev,
        matches: {...prev.matches, [matchId]: {...match, winnerId, decidedBy: 'pick', decidedSeq: prev.nextSeq}},
        nextSeq: prev.nextSeq + 1,
        titles: {...prev.titles, [loserId]: {status: 'benched', benchedUntil: until}},
        sheet: null,
        actionSheet: null,
        menuTitleId: null,
        swipeOpenId: null,
      };
      next = advanceRounds(next);
      return {
        ...next,
        prev: snap,
        toast: {seq: toastSeq(prev), text: `${TITLE_BY_ID[loserId].name} benched until ${until}`, undoable: true},
      };
    });
  }, []);

  // VETO — reversible, so it EXECUTES immediately (undoOverConfirm);
  // Undo restores the exact prior snapshot, refunding the token AND the
  // tray caption (stress fixture 3).
  const veto = useCallback((titleId: string, memberId: MemberId) => {
    setStore(prev => {
      if (prev.tokens[memberId] <= 0) return prev;
      const match = liveMatch(prev);
      if (match == null || (match.a !== titleId && match.b !== titleId)) return prev;
      const winnerId = match.a === titleId ? match.b : match.a;
      const until = benchUntilLabel(prev.benchDays);
      const member = MEMBER_BY_ID[memberId];
      const snap = snapshot(prev);
      let next: BracketStore = {
        ...prev,
        tokens: {...prev.tokens, [memberId]: prev.tokens[memberId] - 1},
        vetoLog: [
          {id: `vx${prev.nextSeq}`, text: `${member.name} vetoed ${TITLE_BY_ID[titleId].name}`, when: 'tonight'},
          ...prev.vetoLog,
        ],
        matches: {...prev.matches, [match.id]: {...match, winnerId, decidedBy: 'veto', vetoBy: memberId, decidedSeq: prev.nextSeq}},
        nextSeq: prev.nextSeq + 1,
        titles: {...prev.titles, [titleId]: {status: 'benched', benchedUntil: until}},
        sheet: null,
        actionSheet: null,
        menuTitleId: null,
        swipeOpenId: null,
      };
      next = advanceRounds(next);
      return {
        ...next,
        prev: snap,
        toast: {seq: toastSeq(prev), text: `${TITLE_BY_ID[titleId].name} benched until ${until} — ${member.name}'s veto`, undoable: true},
      };
    });
  }, []);

  const undo = useCallback(() => {
    setStore(prev =>
      prev.prev != null
        ? {...prev.prev, toast: {seq: toastSeq(prev), text: 'Restored', undoable: false}, prev: null}
        : prev,
    );
  }, []);

  // DIAL — recompute-only; reseeding stays behind the explicit button.
  const setBudget = useCallback((value: number) => {
    const clamped = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, value));
    setStore(prev => ({...prev, dial: {...prev.dial, budget: clamped}}));
  }, []);
  const setEnergy = useCallback((value: number) => {
    const clamped = Math.min(ENERGY_MAX, Math.max(ENERGY_MIN, value));
    setStore(prev => ({...prev, dial: {...prev.dial, energyCap: clamped}}));
  }, []);
  const resetDial = useCallback(() => {
    setStore(prev => ({...prev, dial: {budget: 120, energyCap: 3}}));
  }, []);

  // RESEED — rebuilds round 1 from the current fits (top 8 by household
  // priority, the rest to ON DECK); clears tonight's decided state,
  // benches included (deviation: the spec says 'clears decided state for
  // tonight' — un-benching tonight's losers is the only reading that
  // keeps the watchlist cross-check exact after a reseed).
  const reseed = useCallback(() => {
    setStore(prev => {
      const fits = fitIdsFor(prev.dial); // already in seed order
      if (fits.length === 0) return prev;
      const seeds = fits.slice(0, 8);
      const deck = fits.slice(8);
      const titles: Record<string, TitleState> = {};
      for (const title of TITLES) {
        titles[title.id] = seeds.includes(title.id)
          ? {status: 'alive', benchedUntil: null}
          : deck.includes(title.id)
            ? {status: 'ondeck', benchedUntil: null}
            : {status: 'out', benchedUntil: null};
      }
      const carry = seeds.length % 2 === 1 ? seeds[seeds.length - 1] : null;
      const paired = carry != null ? seeds.slice(0, -1) : seeds;
      const matches: Record<string, Match> = {};
      const roundIds: string[] = [];
      let matchNo = prev.nextMatchNo;
      for (let i = 0; i < paired.length; i += 2) {
        const id = `m${matchNo}`;
        matches[id] = {id, a: paired[i], b: paired[i + 1], winnerId: null, decidedBy: null, vetoBy: null, votes: {}, decidedSeq: 0};
        roundIds.push(id);
        matchNo += 1;
      }
      const snap = snapshot(prev);
      return {
        ...prev,
        titles,
        seededIds: seeds,
        rounds: [roundIds],
        matches,
        carryId: carry,
        tonightPickId: null,
        nextMatchNo: matchNo,
        sheet: null,
        actionSheet: null,
        menuTitleId: null,
        swipeOpenId: null,
        prev: snap,
        toast: {seq: toastSeq(prev), text: `Bracket reseeded — ${fits.length} titles`, undoable: true},
      };
    });
  }, []);

  // OVERLAY LIFECYCLE ----------------------------------------------------

  const openTitleSheet = useCallback((titleId: string, opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    setStore(prev => ({...prev, sheet: {titleId, detent: 'medium'}, actionSheet: null, menuTitleId: null, swipeOpenId: null}));
  }, []);
  const closeTitleSheet = useCallback(() => {
    setStore(prev => ({...prev, sheet: null}));
    sheetOpenerRef.current?.focus();
  }, []);
  const openVetoWho = useCallback((titleId: string, opener: HTMLElement | null) => {
    asOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    // A sheet never stacks another sheet — the titleSheet yields.
    setStore(prev => ({...prev, actionSheet: {kind: 'vetoWho', titleId}, sheet: null, menuTitleId: null, swipeOpenId: null}));
  }, []);
  const openVetoWhich = useCallback((memberId: MemberId, opener: HTMLElement | null) => {
    asOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    setStore(prev => ({...prev, actionSheet: {kind: 'vetoWhich', memberId}, sheet: null, menuTitleId: null, swipeOpenId: null}));
  }, []);
  const closeActionSheet = useCallback(() => {
    setStore(prev => ({...prev, actionSheet: null}));
    asOpenerRef.current?.focus();
  }, []);
  const closeMenu = useCallback(() => {
    setStore(prev => ({...prev, menuTitleId: null}));
    menuOpenerRef.current?.focus();
  }, []);

  // Focus moves INTO an opening overlay with preventScroll — a plain
  // .focus() would scroll-reveal the animating sheet inside the locked
  // overflow-hidden shell and beach it mid-screen (foundations amendment).
  useEffect(() => {
    if (store.sheet != null) sheetRef.current?.focus({preventScroll: true});
  }, [store.sheet != null]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Safe default: first focus lands on Cancel, never a destructive row.
    if (store.actionSheet != null) asCancelRef.current?.focus({preventScroll: true});
  }, [store.actionSheet != null]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (store.menuTitleId != null) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [store.menuTitleId]);

  // Escape closes the TOPMOST overlay only: actionSheet > titleSheet >
  // anchored menu > open swipe row.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (store.actionSheet != null) closeActionSheet();
      else if (store.sheet != null) closeTitleSheet();
      else if (store.menuTitleId != null) closeMenu();
      else if (store.swipeOpenId != null) setStore(prev => ({...prev, swipeOpenId: null}));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store.actionSheet, store.sheet, store.menuTitleId, store.swipeOpenId, closeActionSheet, closeTitleSheet, closeMenu]);

  // Watchlist sentinel → navBar title fade.
  useEffect(() => {
    if (store.activeTab !== 'watchlist') return undefined;
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(
      entries => setWatchNavTitle(!(entries[0]?.isIntersecting ?? true)),
      {rootMargin: '-60px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [store.activeTab]);

  // TABS — per-tab state persistence: scrollTop recorded on exit and
  // restored on entry; overlays close, the toast dock persists; re-tap of
  // the active tab pops to root + scrolls to top (the one legal reset).
  const selectTab = useCallback(
    (tab: TabId) => {
      const scroller = getScroller(shellRef.current);
      if (tab === store.activeTab) {
        setStore(prev => ({...prev, historyPushed: false, menuTitleId: null, swipeOpenId: null}));
        if (scroller != null) scroller.scrollTop = 0;
        return;
      }
      scrollByTabRef.current[store.activeTab] = scroller?.scrollTop ?? 0;
      setStore(prev => ({...prev, activeTab: tab, sheet: null, actionSheet: null, menuTitleId: null, swipeOpenId: null}));
      requestAnimationFrame(() => {
        const target = getScroller(shellRef.current);
        if (target != null) target.scrollTop = scrollByTabRef.current[tab] ?? 0;
      });
    },
    [store.activeTab],
  );

  const pushHistory = useCallback(() => {
    const scroller = getScroller(shellRef.current);
    scrollByTabRef.current.tonightRoot = scroller?.scrollTop ?? 0;
    setStore(prev => ({...prev, historyPushed: true, menuTitleId: null, swipeOpenId: null}));
    if (scroller != null) scroller.scrollTop = 0;
  }, []);
  const popHistory = useCallback(() => {
    setStore(prev => ({...prev, historyPushed: false}));
    requestAnimationFrame(() => {
      const scroller = getScroller(shellRef.current);
      if (scroller != null) scroller.scrollTop = scrollByTabRef.current.tonightRoot ?? 0;
    });
  }, []);

  const scrollToTop = useCallback(() => {
    setStore(prev => ({...prev, activeTab: 'tonight', historyPushed: false}));
    const scroller = getScroller(shellRef.current);
    if (scroller != null) scroller.scrollTop = 0;
  }, []);

  // WATCHLIST REFRESH — skeletons appear on the explicit press and
  // resolve on the NEXT user tap anywhere (never a timer).
  const startRefresh = useCallback(() => {
    setStore(prev => ({...prev, refreshing: true, toast: {seq: toastSeq(prev), text: 'Refreshing watchlist…', undoable: false}}));
  }, []);
  const resolveRefreshOnCapture = useCallback(
    (event: {target: EventTarget | null}) => {
      if (!store.refreshing) return;
      if (refreshBtnRef.current?.contains(event.target as Node)) return;
      setStore(prev => ({...prev, refreshing: false, toast: {seq: toastSeq(prev), text: 'Updated just now', undoable: false}}));
    },
    [store.refreshing],
  );

  const isVetoable = useCallback(
    (titleId: string) => live != null && (live.a === titleId || live.b === titleId),
    [live],
  );

  // RENDER HELPERS --------------------------------------------------------

  const renderWatchRow = (title: TitleFixture, group: 'inplay' | 'benched' | 'ondeck' | 'unfit', index: number, isLast: boolean) => {
    const state = store.titles[title.id];
    const trailing =
      group === 'benched' ? (
        <span style={styles.benchChip}>Until {state.benchedUntil}</span>
      ) : group === 'ondeck' ? (
        <span style={styles.benchChip}>{index === 0 ? 'First alternate' : 'Alternate'}</span>
      ) : group === 'unfit' ? (
        <span style={styles.reasonChip}>{unfitReason(title, store.dial)}</span>
      ) : null;
    return (
      <WatchRow
        key={title.id}
        title={title}
        secondary={`${title.runtimeLabel} · ${title.energyLabel}`}
        trailing={trailing}
        showAliveDot={group === 'inplay'}
        vetoable={isVetoable(title.id)}
        isSwipeOpen={store.swipeOpenId === title.id}
        isMenuOpen={store.menuTitleId === title.id}
        isLast={isLast}
        reducedMotion={reducedMotion}
        menuRef={menuRef}
        onSwipeOpen={() => setStore(prev => ({...prev, swipeOpenId: title.id, menuTitleId: null}))}
        onSwipeClose={() => setStore(prev => (prev.swipeOpenId === title.id ? {...prev, swipeOpenId: null} : prev))}
        onDetails={opener => openTitleSheet(title.id, opener)}
        onVeto={opener => openVetoWho(title.id, opener)}
        onToggleMenu={opener => {
          menuOpenerRef.current = opener;
          setStore(prev => ({...prev, menuTitleId: prev.menuTitleId === title.id ? null : title.id, swipeOpenId: null}));
        }}
      />
    );
  };

  const groupOf = (status: TitleStatus) => TITLES.filter(title => store.titles[title.id].status === status);
  const inPlay = groupOf('alive');
  const benched = groupOf('benched');
  const ondeck = groupOf('ondeck');
  const unfit = groupOf('out');

  const round = currentRound(store);
  const decidedMatches = round.map(id => store.matches[id]).filter(match => match.winnerId != null);
  const queuedMatches = live == null ? [] : round.slice(round.indexOf(live.id) + 1).map(id => store.matches[id]);

  const decidedDetail = (match: Match): string => {
    const matchNo = Number(match.id.slice(1));
    if (match.decidedBy === 'votes') {
      const votes = Object.values(match.votes);
      const forWinner = votes.filter(vote => vote === match.winnerId).length;
      return `won ${forWinner}–${votes.length - forWinner} in Match ${matchNo}`;
    }
    if (match.decidedBy === 'veto') {
      return `advanced on ${MEMBER_BY_ID[match.vetoBy as MemberId].name}'s veto in Match ${matchNo}`;
    }
    return `picked in Match ${matchNo}`;
  };

  // SCREEN BODIES ----------------------------------------------------------

  const tonightBody = (
    <>
      {/* MOOD DIAL — 236px section: 220 dial + 16 caption. */}
      <div ref={dialSectionRef} style={{...styles.dialSection, paddingTop: 12}}>
        <MoodDial dial={store.dial} fitCount={fitCount} onBudget={setBudget} onEnergy={setEnergy} />
        <div style={styles.dialCaption}>Runtime 45–180 min · Energy E1–E5, comfort to challenge</div>
      </div>
      {/* The stepper pairs ARE the dial's input contract. */}
      <div style={styles.stepperRow}>
        <StepperPair
          label="Runtime"
          value={`≤ ${store.dial.budget} min`}
          ariaLabel="runtime budget"
          now={store.dial.budget}
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          onStep={delta => setBudget(store.dial.budget + delta * BUDGET_STEP)}
        />
        <StepperPair
          label="Energy"
          value={`≤ E${store.dial.energyCap}`}
          ariaLabel="energy cap"
          now={store.dial.energyCap}
          min={ENERGY_MIN}
          max={ENERGY_MAX}
          onStep={delta => setEnergy(store.dial.energyCap + delta)}
        />
      </div>
      {needsReseed ? (
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <button type="button" className="ntc-btn ntc-focusable" style={styles.reseedBtn} onClick={reseed}>
            <Icon icon={RefreshCwIcon} size="sm" color="inherit" />
            Reseed bracket ({fitCount} fit)
          </button>
        </div>
      ) : null}

      {frontrunner != null ? (
        <>
          <h2 style={styles.sectionHeader}>{frontrunner.isTonightPick ? "Tonight's pick" : 'Frontrunner'}</h2>
          <div style={styles.listCard}>
            <button
              type="button"
              className="ntc-btn ntc-focusable"
              style={{...styles.frontrunnerRow, width: '100%'}}
              onClick={event => openTitleSheet(frontrunner.titleId, event.currentTarget)}>
              <span style={styles.crownSeat} aria-hidden>
                <Icon icon={CrownIcon} size="sm" color="inherit" />
              </span>
              <span style={styles.frontrunnerText}>
                <span style={styles.frontrunnerPrimary}>
                  {frontrunner.isTonightPick
                    ? `Tonight: ${TITLE_BY_ID[frontrunner.titleId].name} · ${TITLE_BY_ID[frontrunner.titleId].runtimeLabel}`
                    : `Frontrunner: ${TITLE_BY_ID[frontrunner.titleId].name}`}
                </span>
                <span style={styles.frontrunnerSecondary}>
                  {frontrunner.isTonightPick ? 'Bracket complete — enjoy the show' : frontrunner.detail}
                </span>
              </span>
            </button>
          </div>
        </>
      ) : null}

      {/* BRACKET — filtered-empty at zero fits (deterministic: the min
          fixture runtime is 89, so budget 75 ⇒ 0 of 14). */}
      {fitCount === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={PopcornIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.emptyTitle}>No titles fit tonight&rsquo;s dial</h2>
          <p style={styles.emptyBody}>Widen the runtime or energy ring.</p>
          <button type="button" className="ntc-btn ntc-focusable" style={styles.emptyAction} onClick={resetDial}>
            Reset dial to 120 min / E3
          </button>
        </div>
      ) : (
        <>
          <h2 style={styles.sectionHeader}>
            {store.tonightPickId != null
              ? 'Bracket complete'
              : live != null
                ? `${roundName(store)} · Match ${round.indexOf(live.id) + 1} of ${round.length}`
                : roundName(store)}
          </h2>
          {live != null ? <FaceoffPair key={live.id} match={live} onPick={pick} onDetails={openTitleSheet} /> : null}
          {decidedMatches.length > 0 ? (
            <div style={{...styles.listCard, marginTop: 12}}>
              {decidedMatches.map((match, index) => {
                const winner = TITLE_BY_ID[match.winnerId as string];
                const loserId = match.a === match.winnerId ? match.b : match.a;
                const loser = TITLE_BY_ID[loserId];
                return (
                  <div key={match.id} className="ntc-fold-in">
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <button
                      type="button"
                      className="ntc-btn ntc-focusable"
                      style={styles.row60}
                      onClick={event => openTitleSheet(winner.id, event.currentTarget)}>
                      <span style={styles.row60Text}>
                        <span style={styles.rowPrimary}>
                          {winner.name} def. {loser.name}
                        </span>
                        <span style={styles.rowSecondary}>{decidedDetail(match)}</span>
                      </span>
                      <span style={styles.benchChip}>Benched until {store.titles[loserId].benchedUntil}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}
          {queuedMatches.length > 0 ? (
            <div style={{...styles.listCard, ...styles.queuedRow, marginTop: 12}}>
              {queuedMatches.map(match => (
                <div key={match.id} style={styles.row60}>
                  <span style={styles.row60Text}>
                    <span style={styles.rowPrimary}>
                      Up next: {TITLE_BY_ID[match.a].name} vs {TITLE_BY_ID[match.b].name}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
      <div style={styles.spacer24} />
    </>
  );

  const historyBody = (
    <>
      <div style={styles.largeTitleRow}>
        <h1 style={styles.largeTitle}>History</h1>
      </div>
      <div style={styles.listCard}>
        {PAST_NIGHTS.map((night, index) => (
          <div key={night.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <div style={styles.row60}>
              <span style={styles.row60Text}>
                <span style={styles.rowPrimary}>{night.titleName}</span>
                <span style={styles.rowSecondary}>{night.detail}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
      <p style={styles.terminalCaption}>All {PAST_NIGHTS.length} nights</p>
    </>
  );

  // Deterministic skeleton widths — primary 60/45/70/60, secondary
  // 40/55/30/40; same 72px geometry as the rows they impersonate.
  const skeletonCard = (
    <div style={styles.listCard} aria-busy="true">
      {[0, 1, 2, 3].map(index => (
        <div key={index}>
          {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
          <div style={styles.skeletonRow} aria-hidden>
            <span style={styles.skeletonThumb} />
            <span style={styles.skeletonBars}>
              <span style={{...styles.skeletonBar, width: `${[60, 45, 70, 60][index]}%`}} />
              <span style={{...styles.skeletonBar, width: `${[40, 55, 30, 40][index]}%`}} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const watchlistBody = (
    <>
      <div ref={sentinelRef} style={{height: 1}} />
      <div style={styles.largeTitleRow}>
        <h1 style={styles.largeTitle}>Watchlist</h1>
      </div>
      {/* WATCHLIST CROSS-CHECK: the four group lengths below sum to the
          terminal caption (6+2+1+5 = 14 at load). */}
      <h2 style={styles.sectionHeader}>In play · {inPlay.length}</h2>
      {store.refreshing ? skeletonCard : (
        <div style={styles.listCard}>
          {inPlay.map((title, index) => renderWatchRow(title, 'inplay', index, index === inPlay.length - 1))}
        </div>
      )}
      <h2 style={styles.sectionHeader}>Benched · {benched.length}</h2>
      <div style={styles.listCard}>
        {benched.map((title, index) => renderWatchRow(title, 'benched', index, index === benched.length - 1))}
      </div>
      <h2 style={styles.sectionHeader}>On deck · {ondeck.length}</h2>
      <div style={styles.listCard}>
        {ondeck.map((title, index) => renderWatchRow(title, 'ondeck', index, index === ondeck.length - 1))}
      </div>
      <h2 style={styles.sectionHeader}>Doesn&rsquo;t fit tonight · {unfit.length}</h2>
      <div style={styles.listCard}>
        {unfit.map((title, index) => renderWatchRow(title, 'unfit', index, index === unfit.length - 1))}
      </div>
      <p style={styles.terminalCaption}>All {inPlay.length + benched.length + ondeck.length + unfit.length} titles</p>
    </>
  );

  const householdBody = (
    <>
      <h2 style={styles.sectionHeader}>Veto tokens</h2>
      <TokenTray tokens={store.tokens} onMemberTap={(memberId, opener) => openVetoWhich(memberId, opener)} />
      <h2 style={styles.sectionHeader}>Veto log · {store.vetoLog.length}</h2>
      <div style={styles.listCard}>
        {store.vetoLog.map((row, index) => (
          <div key={row.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <div style={styles.row60}>
              <span style={styles.row60Text}>
                <span style={styles.rowPrimary}>{row.text}</span>
                <span style={styles.rowSecondary}>{row.when}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
      <h2 style={styles.sectionHeader}>Members</h2>
      <div style={styles.listCard}>
        {MEMBERS.map((member, index) => (
          <div key={member.id}>
            {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
            <div style={styles.row60}>
              <span style={{...styles.trayAvatar, background: member.bg}} aria-hidden>
                {member.initial}
              </span>
              <span style={styles.row60Text}>
                <span style={styles.rowPrimary}>{member.name}</span>
                <span style={styles.rowSecondary}>
                  {member.id === 'sam' ? 'Organizer' : 'Member'} · {store.tokens[member.id]} of {TOKENS_ISSUED_EACH} vetoes left
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const profileBody = (
    <>
      <h2 style={styles.sectionHeader}>Settings</h2>
      <div style={styles.listCard}>
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Household name</span>
          <span style={styles.utilityValue}>Maple St. Movie Club</span>
        </div>
        <div style={styles.rowDivider} />
        {/* The bench arithmetic is visible: this row says '14 days', the
            bench chips say Jul 4 + 14 = 'Jul 18'. */}
        <div style={{...styles.utilityRow, minHeight: 52}}>
          <span style={styles.utilityLabel}>Bench duration</span>
          <StepperPair
            label=""
            value={`${store.benchDays} days`}
            ariaLabel="bench duration in days"
            now={store.benchDays}
            min={7}
            max={28}
            onStep={delta => setStore(prev => ({...prev, benchDays: Math.min(28, Math.max(7, prev.benchDays + delta))}))}
          />
        </div>
        <div style={styles.rowDivider} />
        <button
          type="button"
          className="ntc-btn ntc-focusable"
          style={styles.utilityRow}
          onClick={() => setStore(prev => ({...prev, toast: {seq: toastSeq(prev), text: `Next refill ${REFILL_DATE}`, undoable: false}}))}>
          <span style={styles.utilityLabel}>Token refill</span>
          <span style={styles.utilityValue}>Every 2 weeks</span>
          <span style={styles.chevron}>
            <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
          </span>
        </button>
        <div style={styles.rowDivider} />
        <button
          type="button"
          className="ntc-btn ntc-focusable"
          style={styles.utilityRow}
          onClick={() => setStore(prev => ({...prev, toast: {seq: toastSeq(prev), text: 'Appearance follows the system setting', undoable: false}}))}>
          <span style={styles.utilityLabel}>Appearance</span>
          <span style={styles.utilityValue}>Match system</span>
          <span style={styles.chevron}>
            <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
          </span>
        </button>
      </div>
      <p style={styles.terminalCaption}>
        Benched titles return after {store.benchDays} days — tonight&rsquo;s bench ends {benchUntilLabel(store.benchDays)} · Today is {TODAY_LABEL}
      </p>
    </>
  );

  // NAV BAR content per screen -------------------------------------------

  const onTonightHistory = store.activeTab === 'tonight' && store.historyPushed;
  const navCenter = onTonightHistory
    ? 'History'
    : store.activeTab === 'tonight'
      ? 'Tonight'
      : store.activeTab === 'watchlist'
        ? 'Watchlist'
        : store.activeTab === 'household'
          ? 'Household'
          : 'Profile';
  // On Watchlist the compact title fades in only after the large title
  // scrolls under (sentinel-driven); elsewhere it is always on.
  const navTitleVisible = store.activeTab !== 'watchlist' || watchNavTitle;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const canPickSheet = store.sheet != null && live != null && (live.a === store.sheet.titleId || live.b === store.sheet.titleId);

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{NTC_CSS}</style>
      <div ref={shellRef} style={shellStyle} onClickCapture={resolveRefreshOnCapture}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {onTonightHistory ? (
              <button type="button" className="ntc-btn ntc-focusable" style={styles.backBtn} onClick={popHistory}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>Tonight</span>
              </button>
            ) : (
              <button
                type="button"
                className="ntc-btn ntc-focusable"
                style={styles.brandBtn}
                aria-label="Nightcap — scroll Tonight to top"
                onClick={scrollToTop}>
                <NightcapMark />
              </button>
            )}
          </div>
          {store.activeTab === 'watchlist' && !watchNavTitle ? (
            <span aria-hidden style={{...styles.navTitle, opacity: 0}} className="ntc-fade">
              {navCenter}
            </span>
          ) : (
            <h1 style={{...styles.navTitle, opacity: navTitleVisible ? 1 : 0}} className="ntc-fade">
              {navCenter}
            </h1>
          )}
          <div style={styles.navTrailing}>
            {store.activeTab === 'tonight' && !onTonightHistory ? (
              <button type="button" className="ntc-btn ntc-focusable" style={styles.textBtn} onClick={pushHistory}>
                History
              </button>
            ) : null}
            {store.activeTab === 'watchlist' ? (
              <button
                type="button"
                ref={refreshBtnRef}
                className="ntc-btn ntc-focusable"
                style={styles.iconBtn}
                aria-label="Refresh watchlist"
                onClick={startRefresh}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            ) : null}
          </div>
        </header>

        {/* dialSummary — compact readout while the dial is off-screen. */}
        {store.activeTab === 'tonight' && !onTonightHistory ? (
          <div style={styles.dialSummary}>
            <span style={styles.dialSummaryPill}>
              ≤ {store.dial.budget} min · Energy ≤ {store.dial.energyCap}
            </span>
            <span style={styles.dialSummaryCount}>
              {fitCount} of {TOTAL_TITLES} fit
            </span>
            <button
              type="button"
              className="ntc-btn ntc-focusable"
              style={styles.iconBtn}
              aria-label="Edit the mood dial"
              onClick={() =>
                dialSectionRef.current?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'})
              }>
              <Icon icon={SlidersHorizontalIcon} size="md" color="inherit" />
            </button>
          </div>
        ) : null}

        <main style={styles.main}>
          {store.activeTab !== 'tonight' || onTonightHistory ? <h1 className="ntc-vh">{navCenter}</h1> : null}
          {store.activeTab === 'tonight' ? (onTonightHistory ? historyBody : tonightBody) : null}
          {store.activeTab === 'watchlist' ? watchlistBody : null}
          {store.activeTab === 'household' ? householdBody : null}
          {store.activeTab === 'profile' ? profileBody : null}
        </main>

        {/* Sticky tab dock — toast live region rides 12px above the bar. */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} aria-live="polite" role="status">
            {store.toast != null ? (
              <div key={store.toast.seq} style={styles.toast} className="ntc-fade">
                <span style={styles.toastText}>{store.toast.text}</span>
                <span style={styles.toastHairline} aria-hidden />
                {store.toast.undoable && store.prev != null ? (
                  <button type="button" className="ntc-btn ntc-focusable" style={styles.toastUndo} onClick={undo}>
                    Undo
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ntc-btn ntc-focusable"
                    style={styles.toastUndo}
                    aria-label="Dismiss message"
                    onClick={() => setStore(prev => ({...prev, toast: null}))}>
                    <Icon icon={XIcon} size="sm" color="inherit" />
                  </button>
                )}
              </div>
            ) : null}
          </div>
          <nav style={styles.tabBar} aria-label="Nightcap tabs">
            {(
              [
                {id: 'tonight' as TabId, label: 'Tonight', icon: ClapperboardIcon, badge: 0},
                // Badge derives from count(status==='alive') — 6 at load,
                // 6→5 on the M3 pick (same array as the IN PLAY header).
                {id: 'watchlist' as TabId, label: 'Watchlist', icon: ListVideoIcon, badge: alive},
                {id: 'household' as TabId, label: 'Household', icon: UsersIcon, badge: 0},
                {id: 'profile' as TabId, label: 'Profile', icon: CircleUserIcon, badge: 0},
              ]
            ).map(tab => {
              const active = store.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className="ntc-btn ntc-focusable"
                  style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                  aria-current={active ? 'page' : undefined}
                  aria-label={tab.badge > 0 ? `${tab.label}, ${tab.badge} in play` : tab.label}
                  onClick={() => selectTab(tab.id)}>
                  <span style={styles.tabIconSeat}>
                    <Icon icon={tab.icon} size="md" color="inherit" />
                    {tab.badge > 0 ? (
                      <span style={styles.tabBadge} aria-hidden>
                        {tab.badge}
                      </span>
                    ) : null}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {overlayOpen ? (
          <div
            style={styles.sheetScrim}
            onClick={() => (store.actionSheet != null ? closeActionSheet() : closeTitleSheet())}
            aria-hidden
          />
        ) : null}
        {store.sheet != null ? (
          <TitleSheet
            titleId={store.sheet.titleId}
            detent={store.sheet.detent}
            dial={store.dial}
            matches={store.matches}
            canPick={canPickSheet}
            canVeto={isVetoable(store.sheet.titleId)}
            reducedMotion={reducedMotion}
            sheetRef={sheetRef}
            onDetent={detent => setStore(prev => (prev.sheet != null ? {...prev, sheet: {...prev.sheet, detent}} : prev))}
            onClose={closeTitleSheet}
            onPick={() => {
              if (live != null && store.sheet != null) pick(live.id, store.sheet.titleId);
            }}
            onVeto={opener => {
              if (store.sheet != null) openVetoWho(store.sheet.titleId, opener);
            }}
          />
        ) : null}
        {store.actionSheet != null ? (
          <ActionSheetView
            state={store.actionSheet}
            store={store}
            live={live}
            sheetRef={actionSheetRef}
            cancelRef={asCancelRef}
            onVeto={veto}
            onClose={closeActionSheet}
          />
        ) : null}
      </div>
    </div>
  );
}



