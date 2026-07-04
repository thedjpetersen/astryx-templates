// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Pitchin pool for Dana Whitmore's
 *   farewell Breville Bambino espresso machine ($248 gift + $12 shipping =
 *   $260 goal ✓), organized by Maya Chen, '2d 14h left'. Six pledges
 *   (60+50=110, +40=150, +35=185, +27=212, +25=237 = $237 pledged ✓;
 *   260−237 = $23 remaining ✓; 237/260 = 91.15 → 91% ✓), two invited-pending
 *   (6 pledged + 2 pending = 8 invited ✓), an 11-row activity ledger, and a
 *   3%-rounded-to-cents fee table (10→0.30/10.30 · 23→0.69/23.69 ·
 *   25→0.75/25.75). No Date.now(), no Math.random(), no network media —
 *   every timestamp is a fixed string (Mon/Tue/Wed/'just now').
 * @output Pitchin — Group Gift Pool: a 390px MOBILE group-gift surface.
 *   NavBar (three-coin bow-knot mark · "Dana's Gift" · countdown deadline
 *   chip) over a 72px gift media row + 44px price utility row, a
 *   PoolThermometer whose six tinted segments are real 44px-tall tappable
 *   buttons that highlight their ledger row, a share-message card whose copy
 *   re-derives from remaining, a role-aware 11-row ContributorLedger with
 *   inline Nudge pills, and a sticky bottom pledgeBar. Signature move: the
 *   CTA opens a 55%-detent sheet holding a horizontal PledgeDial ruler with
 *   a magnetic 'Covers the gap' detent at $23 — every scrub re-derives the
 *   dashed provisional thermometer segment, the fee readout, the share copy,
 *   and the sheet CTA. Crossing 100% flips the whole surface from collecting
 *   to ordering: Funded chip, 240ms completion sweep, organizer actionSheet
 *   unlock, and a 'Close pool & order' CTA that executes immediately with
 *   Undo (refunds alone route through the centered alert).
 * @position Page template; emitted by `astryx template mobile-group-gift-pool`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first pixel).
 *   All overlays (scrim, sheet, actionSheet, alert) are position:'absolute'
 *   INSIDE shell; position:fixed is banned. While the sheet / actionSheet /
 *   alert is open, shell locks to {height:'100dvh', overflow:'hidden'} and
 *   restores on close. The stage clips to --radius-container; shell paints
 *   full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for disc rows); no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Pitchin rose #E11D48 — the demo's --color-brand is the
 *   demo logo blue, so the spec hex is quarantined here per house rule).
 *   Sanctioned non-token pairs: deadline-chip countdown fill/text, funded
 *   success fill/text, six explicit thermometer segment fills, chip/CTA
 *   text-over-brand, nudge-pill text, pending-disc dashed border — each
 *   with contrast math at the declaration. DEVIATION from spec: the
 *   thermometer tints are explicit light-dark pairs instead of
 *   color-mix(BRAND N%, card) because the spec's 35–55% card mixes sit at
 *   ~1.3–2.1:1 against the light muted track — below the binding ≥3:1
 *   meaningful-fill amendment; the explicit ramp keeps ledger-order depth
 *   ordering while every segment clears 3:1 vs the track (math below).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr'); rows 44px utility / 60px ledger
 *   / 72px gift media (48px thumb, 12px radius); sectionHeader 13px/600
 *   uppercase 0.06em at 32px inset (16 gutter + 16 card pad), 24px top /
 *   8px bottom; sticky pledgeBar 16px padding + 48px full-width brand CTA;
 *   sheet detents 55% medium / calc(100% − 56px) large, 24px grabber zone
 *   with 36×5 pill, 52px sheet header; toastDock sticky-in-flow above the
 *   pledgeBar (bottom 96) — absolute insetInline 16 bottom 88 only while
 *   the shell is scroll-locked. TYPE (Figtree via --font-family-body):
 *   28/700 dial readout (no large title — compact nav title always visible,
 *   noted per contract) · 22/700 money hero · 17/600 nav+sheet titles ·
 *   16/400 body · 13 meta · 11 overlines; nothing under 11px; tabular-nums
 *   on every updating numeral. Touch: every target ≥44×44 with ≥8px
 *   clearance or merged into a full-row button; every gesture (dial scrub,
 *   sheet drag) has a visible button/keyboard path (preset pills, slider
 *   keys, clickable grabber + X). NavBar hairline is ALWAYS ON (chosen
 *   variant; scroll-under not wired — noted per contract).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals: thermometer segments are %-based
 *   so they compress linearly (at 320 the inner track ≈ 288px → smallest
 *   segment Tom 9.62% ≈ 27.7px, still above the 24px chip-hide threshold,
 *   so all six chips render at every stage width — the threshold guard is
 *   still shipped); the dial rail centers off a ref-measured clientWidth,
 *   not 390; the preset row flex-wraps at 8px gap; navBar title ellipsizes
 *   at 200px; the deadline chip never wraps; ledger trailing amounts are
 *   fixed tabular; sheet heights are % of the locked 100dvh.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the pool anatomy is deliberately
 *   phone geometry.
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
  BellIcon,
  CircleCheckIcon,
  ClockIcon,
  CopyIcon,
  GiftIcon,
  LockIcon,
  MoreHorizontalIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Pitchin rose). As TEXT: #E11D48 on the
// white card ≈ 4.7:1 (passes 4.5:1); #FB7185 on the dark card (~#1C1C1E)
// ≈ 6.4:1. As the CTA fill see BRAND_FILL_TEXT below.
const BRAND_ACCENT = 'light-dark(#E11D48, #FB7185)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #E11D48 ≈ 4.6:1. Dark:
// white on #FB7185 fails (~2.7:1), so the dark side flips to near-black
// rose — #4C0519 on #FB7185 ≈ 5.8:1. (Spec said "white on brand fill";
// dark-scheme deviation for contrast, math above.)
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #4C0519)';
// 12% brand wash for the Nudge pill fill and the highlighted ledger row —
// decorative tint; the text on it is contrast-checked separately.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, var(--color-background-card))`;
// Brand-tinted 13px/600 text on the 12% wash. Light: #BE123C on the
// ~#FBDDE4 wash ≈ 5.2:1; dark: #FDA4AF on the ~#37262A wash ≈ 5.5:1.
const BRAND_TINT_TEXT = 'light-dark(#BE123C, #FDA4AF)';
// Deadline chip (countdown): rest fill vs text — #9F1239 on #FDF2F4 ≈
// 7.2:1; #FDA4AF on #3F1D27 ≈ 7.9:1 (both ≥4.5:1).
const CHIP_REST_FILL = 'light-dark(#FDF2F4, #3F1D27)';
const CHIP_REST_TEXT = 'light-dark(#9F1239, #FDA4AF)';
// Funded chip success pair: #166534 on #DCFCE7 ≈ 6.7:1; #86EFAC on
// #14532D ≈ 8.6:1.
const CHIP_DONE_FILL = 'light-dark(#DCFCE7, #14532D)';
const CHIP_DONE_TEXT = 'light-dark(#166534, #86EFAC)';
// THERMOMETER SEGMENT FILLS — explicit pairs in ledger order (Maya→Tom),
// depth-ordered from the brand hue. ≥3:1 vs the ACTUAL surface (the muted
// track, light ~#F5F5F4 L≈0.90 / dark ~#2C2C2E L≈0.03): light ramp darkens
// (#E11D48 ≈ 4.3:1 … #660F30 ≈ 10.6:1 vs the light track); dark ramp
// lightens (#FB7185 ≈ 4.9:1 … #FEC9D2 ≈ 9.3:1 vs the dark track). Chip
// letters on every fill use SEG_TEXT: white on the light ramp (worst case
// #E11D48 ≈ 4.6:1) and #4C0519 on the dark ramp (worst case #FB7185 ≈
// 5.8:1).
const SEG_FILLS = [
  'light-dark(#E11D48, #FB7185)', // maya
  'light-dark(#C81543, #FC8FA1)', // diego
  'light-dark(#AF1440, #FD9DAD)', // priya
  'light-dark(#96123B, #FDACB9)', // sam
  'light-dark(#7E1136, #FEBAC6)', // lena
  'light-dark(#660F30, #FEC9D2)', // tom
];
const SEG_TEXT = 'light-dark(#FFFFFF, #4C0519)';
// Provisional "your" segment wash while the sheet is open (behind a 2px
// dashed BRAND_ACCENT boundary that carries the ≥3:1 edge).
const BRAND_GHOST_30 = `color-mix(in srgb, ${BRAND_ACCENT} 30%, transparent)`;
// Invited-pending disc: a dashed INTERACTIVE-STATE boundary, so an explicit
// pair ≥3:1 vs the white/dark card per the amendment (hairline tokens are
// for passive separators only): #8C8C8C on white ≈ 3.4:1; #9A9AA0 on
// ~#1C1C1E ≈ 5.6:1.
const PENDING_BORDER = 'light-dark(#8C8C8C, #9A9AA0)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings (2px BRAND_ACCENT,
// offset 2, everywhere), the visually-hidden h1, the sheet slide-in, the
// 240ms thermometer completion sweep (transform/opacity only), and the
// reduced-motion guard that removes the sweep ENTIRELY (the final solid
// full track alone encodes funded) and collapses transitions to instant.
// ---------------------------------------------------------------------------

const PITCHIN_CSS = `
.pgp-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.pgp-btn:disabled { cursor: default; }
.pgp-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.pgp-anim { transition: transform 240ms ease, opacity 240ms ease; }
.pgp-fade { transition: opacity 240ms ease; }
@keyframes pgp-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.pgp-sheet-in { animation: pgp-sheet-in 240ms ease; }
@keyframes pgp-sweep {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.pgp-sweep { animation: pgp-sweep 240ms ease-out; }
.pgp-vh {
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
  .pgp-anim, .pgp-fade { transition: none; }
  .pgp-sheet-in, .pgp-sweep { animation: none; }
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
  // NAV BAR — 52px sticky top z20, paddingInline 8, grid '1fr auto 1fr';
  // hairline + blur always on.
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
  brandBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
    textAlign: 'center',
  },
  // Deadline chip — 28px pill inside a 44px-tall wrapper. Status only.
  chipHit: {height: 44, display: 'flex', alignItems: 'center'},
  chip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  chipCountdown: {background: CHIP_REST_FILL, color: CHIP_REST_TEXT},
  chipFunded: {background: CHIP_DONE_FILL, color: CHIP_DONE_TEXT},
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // Inset-grouped listCard — 16px gutter, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  paddedCard: {padding: 16},
  cardGap: {marginTop: 12},
  // GIFT CARD — 72px media row + hairline + 44px utility row.
  giftMediaRow: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  giftThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  giftText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  giftPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  giftSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  utilityRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
  },
  utilityLeft: {
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  utilityRight: {whiteSpace: 'nowrap', color: 'var(--color-text-secondary)'},
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // THERMOMETER CARD.
  thermoHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroMoney: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  heroPct: {
    fontSize: 17,
    fontWeight: 600,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 44px-tall HIT STRIP; the visual 28px track is vertically centered
  // inside it (target law: hit ≥44 even though the visual is 28).
  trackWrap: {position: 'relative', height: 44, marginTop: 12},
  trackVisual: {
    position: 'absolute',
    insetInline: 0,
    top: 8,
    height: 28,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  segFill: {
    position: 'absolute',
    top: 0,
    height: '100%',
    borderInlineEnd: '1px solid var(--color-background-card)',
  },
  yourSegFill: {
    position: 'absolute',
    top: 0,
    height: '100%',
    background: BRAND_GHOST_30,
    border: `2px dashed ${BRAND_ACCENT}`,
    boxSizing: 'border-box',
  },
  yourSegCommitted: {
    position: 'absolute',
    top: 0,
    height: '100%',
    background: BRAND_ACCENT,
  },
  sweepOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, transparent 20%, rgba(255, 255, 255, 0.55) 50%, transparent 80%)',
    pointerEvents: 'none',
  },
  segBtn: {
    position: 'absolute',
    top: 0,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 4,
  },
  segChip: {
    width: 16,
    height: 16,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 10,
    fontWeight: 600,
    color: SEG_TEXT,
  },
  captionRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  captionStrong: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  captionMuted: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // SHARE PREVIEW.
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  shareRow: {display: 'flex', alignItems: 'center', gap: 12, marginTop: 8},
  shareInset: {
    flex: 1,
    minWidth: 0,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    lineHeight: 1.35,
  },
  copyHit: {height: 44, display: 'flex', alignItems: 'center', flexShrink: 0},
  copyBtn: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
  },
  // SECTION HEADER row — label at 32px inset, 24px above / 8px below;
  // trailing organizer zone (lock caption or 44×44 menu button).
  sectionRow: {
    margin: '24px 16px 8px',
    minHeight: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionLabel: {
    paddingInlineStart: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  lockCaption: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // LEDGER — 60px rows, dividers inset 68.
  ledgerRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  ledgerRowHighlighted: {background: BRAND_TINT_12},
  disc: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: SEG_TEXT,
  },
  discMuted: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  discPending: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    border: `2px dashed ${PENDING_BORDER}`,
    boxSizing: 'border-box',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  ledgerText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  ledgerPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ledgerPrimaryLight: {
    fontSize: 16,
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ledgerMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ledgerAmount: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Nudge pill — 36px visual inside a 44px-tall hit, ≥8px from row edge.
  nudgeHit: {height: 44, display: 'flex', alignItems: 'center', flexShrink: 0},
  nudgePill: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 14,
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_TINT_TEXT,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  nudgePillDone: {opacity: 0.4},
  editBtn: {
    height: 44,
    paddingInline: 8,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TINT_TEXT,
    flexShrink: 0,
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  spacer24: {height: 24},
  // TOAST DOCK — sticky-in-flow above the pledgeBar (the shell grows with
  // content, so shell-absolute would pin to the DOCUMENT bottom); switches
  // to shell-absolute ONLY while the shell is scroll-locked at 100dvh.
  toastDock: {
    position: 'sticky',
    bottom: 96,
    zIndex: 30,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 88,
    zIndex: 45,
    marginInline: 0,
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    maxWidth: '100%',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    paddingInline: 16,
    pointerEvents: 'auto',
  },
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndoBtn: {
    height: 48,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TINT_TEXT,
    flexShrink: 0,
  },
  // PLEDGE BAR — sticky bottom z20 (no tabBar in this focused flow; the
  // pledgeBar owns the slot), blur surface + top hairline.
  pledgeBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  cta: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  ctaClosed: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
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
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  // PLEDGE DIAL.
  readoutWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  readoutAmount: {fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  readoutFee: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  railWrap: {
    position: 'relative',
    height: 72,
    marginTop: 28,
    overflow: 'hidden',
    touchAction: 'none',
    borderRadius: 8,
  },
  railInner: {position: 'absolute', top: 0, bottom: 0, left: 0},
  tickMinor: {
    position: 'absolute',
    bottom: 20,
    width: 1,
    height: 12,
    borderRadius: 999,
    background: 'var(--color-border)',
  },
  tickMajor: {
    position: 'absolute',
    bottom: 20,
    width: 1,
    height: 20,
    borderRadius: 999,
    background: 'var(--color-text-secondary)',
  },
  tickDetent: {
    position: 'absolute',
    bottom: 20,
    width: 2,
    height: 24,
    borderRadius: 999,
    background: BRAND_ACCENT,
  },
  tickLabel: {
    position: 'absolute',
    bottom: 2,
    transform: 'translateX(-50%)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  centerLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: -1,
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  // Floats above the indicator INSIDE the clipped 72px rail (ticks sit in
  // the bottom 40px, leaving the top band free for the flag).
  detentFlag: {
    position: 'absolute',
    top: 4,
    left: '50%',
    transform: 'translateX(-50%)',
    height: 20,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  presetRow: {display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16},
  presetHit: {height: 44, display: 'flex', alignItems: 'center'},
  presetPill: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  presetPillBrand: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
    color: BRAND_TINT_TEXT,
  },
  // ACTION SHEET — two stacked cards, 8px apart, insetInline 16 bottom 16.
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
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  asDivider: {height: 1, background: 'var(--color-border)'},
  asRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
  },
  asRowDestructive: {color: 'var(--color-error)'},
  asCancelRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
  },
  // ALERT — the one blocking, irreversible choice (refund all pledges).
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
  alertBody: {padding: 20, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center'},
  alertTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  alertText: {fontSize: 13, color: 'var(--color-text-secondary)', margin: 0},
  alertBtnRow: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtn: {
    flex: 1,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
  },
  alertBtnRule: {width: 1, background: 'var(--color-border)'},
  alertBtnDestructive: {fontWeight: 600, color: 'var(--color-error)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checking aggregates.
// CROSS-CHECK LEDGER (verified by hand before shipping): 248 + 12 = 260 ✓;
// 60+50 = 110, +40 = 150, +35 = 185, +27 = 212, +25 = 237 = pledged ✓;
// 260−237 = 23 remaining ✓; 237/260 = 91.15 → display 91% ✓; segment widths
// 23.08+19.23+15.38+13.46+10.38+9.62 = 91.15 ✓; 6 pledged + 2 pending = 8
// invited ✓. FEES: fee(a) = Math.round(a*3)/100 — 10→0.30/10.30 ·
// 23→0.69/23.69 · 25→0.75/25.75 ✓. POST-COMMIT math is DERIVED, never
// hardcoded: 237+23 = 260 = 100% exactly; 237+25 = 262 → '101%', capped
// track, 'Funded · $2 over' (262−260 = 2 ✓); 237+10 = 247 → remaining 13 →
// share copy 'only $13 to go!' (260−247 = 13 ✓); Home key $5 → remaining
// 18 (260−237−5 = 18 ✓, stress fixture 3).
// ---------------------------------------------------------------------------

const POOL = {
  gift: 'Breville Bambino espresso machine',
  recipient: 'Dana Whitmore',
  organizer: 'Maya Chen',
  itemPrice: 248,
  shipping: 12,
  goal: 260, // 248 + 12 = 260 ✓
  deadlineLabel: '2d 14h left',
};

const PLEDGED_SEED = 237; // 60+50+40+35+27+25 ✓
const GAP_SEED = POOL.goal - PLEDGED_SEED; // 23 — the magnetic detent target

interface Contributor {
  id: string;
  name: string;
  initial: string;
  amount: number;
  when: string;
  pctLabel: string; // amount/260·100 — fixed strings cross-checked above
  segIndex: number; // index into SEG_FILLS (ledger order = depth order)
}

const CONTRIBUTORS: Contributor[] = [
  {id: 'maya', name: 'Maya Chen', initial: 'M', amount: 60, when: 'Mon', pctLabel: '23.08', segIndex: 0},
  {id: 'diego', name: 'Diego Ramos', initial: 'D', amount: 50, when: 'Mon', pctLabel: '19.23', segIndex: 1},
  {id: 'priya', name: 'Priya Patel', initial: 'P', amount: 40, when: 'Tue', pctLabel: '15.38', segIndex: 2},
  {id: 'sam', name: 'Sam Okafor', initial: 'S', amount: 35, when: 'Tue', pctLabel: '13.46', segIndex: 3},
  {id: 'lena', name: 'Lena Fischer', initial: 'L', amount: 27, when: 'Wed', pctLabel: '10.38', segIndex: 4},
  {id: 'tom', name: 'Tom Bradley', initial: 'T', amount: 25, when: 'Wed', pctLabel: '9.62', segIndex: 5},
];

const CONTRIBUTORS_BY_ID: Record<string, Contributor> = Object.fromEntries(
  CONTRIBUTORS.map(person => [person.id, person]),
);

type LedgerEntry =
  | {kind: 'you'; id: 'e_you'}
  | {kind: 'pledge'; id: string; contributorId: string}
  | {kind: 'message'; id: string; contributorId: string; text: string}
  | {kind: 'nudge'; id: string; text: string; when: string}
  | {kind: 'pending'; id: string; name: string; initial: string; nudged: boolean};

// LEDGER seed — 11 rows, newest first (loadMoreRow not needed; all shown).
// Ana's full name is the 320px trailing-control truncation stress (1);
// Priya's 100-char message is the single-line ellipsis stress (5).
const ENTRIES_SEED: LedgerEntry[] = [
  {kind: 'pledge', id: 'e_tom', contributorId: 'tom'},
  {kind: 'pledge', id: 'e_lena', contributorId: 'lena'},
  {kind: 'message', id: 'm_lena', contributorId: 'lena', text: 'Dana is going to lose it — love this'},
  {kind: 'nudge', id: 'n_maya_ana', text: 'Maya nudged Ana', when: 'Wed'},
  {kind: 'pledge', id: 'e_sam', contributorId: 'sam'},
  {kind: 'pledge', id: 'e_priya', contributorId: 'priya'},
  {
    kind: 'message',
    id: 'm_priya',
    contributorId: 'priya',
    text: "Dana is going to lose it — she's been talking about a real espresso setup since the offsite in March",
  },
  {kind: 'pledge', id: 'e_diego', contributorId: 'diego'},
  {kind: 'pledge', id: 'e_maya', contributorId: 'maya'},
  {kind: 'pending', id: 'p_ana', name: 'Ana Silva-Konstantopoulos', initial: 'A', nudged: false},
  {kind: 'pending', id: 'p_chris', name: 'Chris Wong', initial: 'C', nudged: false},
];

const INVITED_COUNT = 8; // 6 pledged + 2 pending ✓
const DIAL_MIN = 5;
const DIAL_MAX = 100;
const PX_PER_DOLLAR = 12;

/** 3% fee rounded to cents: 10→0.30 · 23→0.69 · 25→0.75 (const-checked). */
function feeFor(amount: number): number {
  return Math.round(amount * 3) / 100;
}

/** '$23.69' — dollars with cents, tabular rendering downstream. */
function fmtCents(value: number): string {
  return `$${value.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useState({...}) + update(patch) + updateEntry(id,
// patch); every mutation flows through these. Derived values (pledged,
// remaining, funded, percent, shareCopy, ctaLabel) are pure computations in
// render — no second source of truth.
// ---------------------------------------------------------------------------

interface ToastState {
  seq: number;
  msg: string;
  undo: boolean;
}

interface PoolState {
  entries: LedgerEntry[];
  yourPledge: number | null;
  refunded: boolean;
  dialAmount: number;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  highlightedId: string | null;
  poolClosed: boolean;
  actionSheetOpen: boolean;
  alertOpen: boolean;
  toast: ToastState | null;
  undoSnapshot: {poolClosed: boolean} | null;
}

const INITIAL_POOL: PoolState = {
  entries: ENTRIES_SEED,
  yourPledge: null,
  refunded: false,
  dialAmount: GAP_SEED, // dial opens at the magnetic default ($23)
  sheetOpen: false,
  sheetDetent: 'medium',
  highlightedId: null,
  poolClosed: false,
  actionSheetOpen: false,
  alertOpen: false,
  toast: null,
  undoSnapshot: null,
};

/** Container-width hook (grid-feeder-console pattern). */
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
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), [role="slider"]');
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
// BRAND MARK — three overlapping 14px coin circles forming a bow-knot at
// the intersection; strokes in --color-text-primary, BRAND_ACCENT knot.
// ---------------------------------------------------------------------------

function PitchinMark() {
  return (
    <svg width={26} height={26} viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle cx="9" cy="9.5" r="7" stroke="var(--color-text-primary)" strokeWidth="1.6" />
      <circle cx="17" cy="9.5" r="7" stroke="var(--color-text-primary)" strokeWidth="1.6" />
      <circle cx="13" cy="16.5" r="7" stroke="var(--color-text-primary)" strokeWidth="1.6" />
      <circle cx="13" cy="12" r="2.6" fill={BRAND_ACCENT} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// POOL THERMOMETER — 28px visual track inside a 44px hit strip. Segments
// are absolute real <button>s spanning the FULL 44px hit height (visual
// fills clip inside the 28px track); widths are %-based so they compress
// linearly 320–430. The 16px initial chip hides when a segment renders
// under 24px at the measured track width (never fires above 280px — Tom's
// 9.62% ≈ 27.7px at 320 — but the guard ships per contract). YOUR live
// segment renders after the last contributor at dialAmount/260·100% with a
// 2px dashed BRAND_ACCENT boundary while the sheet is open, solid once
// committed. At 100%: 240ms translateX sweep, removed entirely under
// reduced motion (the solid full track alone encodes funded).
// ---------------------------------------------------------------------------

interface ThermometerProps {
  yourPledge: number | null;
  refunded: boolean;
  dialAmount: number;
  sheetOpen: boolean;
  highlightedId: string | null;
  sweepSeq: number;
  onSegmentTap: (entryId: string) => void;
}

function PoolThermometer({
  yourPledge,
  refunded,
  dialAmount,
  sheetOpen,
  highlightedId,
  sweepSeq,
  onSegmentTap,
}: ThermometerProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const trackWidth = useElementWidth(trackRef);
  const showSegments = !refunded;
  let cursor = 0;
  const segments = CONTRIBUTORS.map(person => {
    const pct = (person.amount / POOL.goal) * 100;
    const seg = {person, left: cursor, width: pct};
    cursor += pct;
    return seg;
  });
  const baseFilled = cursor; // 91.15
  const yourWidthRaw = ((sheetOpen ? dialAmount : yourPledge ?? 0) / POOL.goal) * 100;
  const yourWidth = Math.min(yourWidthRaw, 100 - baseFilled); // overshoot caps at 100% visual
  const showYourProvisional = sheetOpen && dialAmount > 0 && !refunded;
  const showYourCommitted = !sheetOpen && yourPledge != null && !refunded;
  return (
    <div style={styles.trackWrap} ref={trackRef}>
      <div style={styles.trackVisual} aria-hidden>
        {showSegments
          ? segments.map(seg => (
              <span
                key={seg.person.id}
                style={{
                  ...styles.segFill,
                  left: `${seg.left}%`,
                  width: `${seg.width}%`,
                  background: SEG_FILLS[seg.person.segIndex],
                }}
              />
            ))
          : null}
        {showYourProvisional ? (
          <span style={{...styles.yourSegFill, left: `${baseFilled}%`, width: `${yourWidth}%`}} />
        ) : null}
        {showYourCommitted ? (
          <span style={{...styles.yourSegCommitted, left: `${baseFilled}%`, width: `${yourWidth}%`}} />
        ) : null}
        {sweepSeq > 0 ? <span key={sweepSeq} className="pgp-sweep" style={styles.sweepOverlay} /> : null}
      </div>
      {showSegments
        ? segments.map(seg => {
            const segPx = (seg.width / 100) * trackWidth;
            const chipVisible = trackWidth === 0 || segPx >= 24;
            const isLit = highlightedId === `e_${seg.person.id}`;
            return (
              <button
                key={seg.person.id}
                type="button"
                className="pgp-btn pgp-focusable"
                style={{...styles.segBtn, left: `${seg.left}%`, width: `${seg.width}%`}}
                aria-label={`${seg.person.name}, pledged $${seg.person.amount}, ${Math.round(seg.width)} percent`}
                aria-pressed={isLit}
                onClick={() => onSegmentTap(`e_${seg.person.id}`)}>
                {chipVisible ? (
                  <span style={{...styles.segChip, background: SEG_FILLS[seg.person.segIndex]}} aria-hidden>
                    {seg.person.initial}
                  </span>
                ) : null}
              </button>
            );
          })
        : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PLEDGE DIAL — horizontal momentum wheel: 72px ruler rail, $1 ticks from
// $5 to $100 at 12px spacing (major every $5 with 11px tabular label; the
// $23 tick is 2×24 BRAND_ACCENT), 2px brand center indicator. Pointer drag
// scrubs; release applies a decay projection then snaps to the nearest $1
// with a MAGNETIC DETENT: within ±$2 of the $23 gap, it lands on 23 and a
// floating 'Covers the gap' flag renders (white on BRAND_ACCENT ≈ 4.6:1,
// dark side flips per BRAND_FILL_TEXT). NON-GESTURE PATH: the rail is a
// role='slider' with ArrowLeft/Right ±1, PageUp/Down ±5, Home=5, End=100,
// plus the preset pills below. Transient drag float lives locally; the
// committed value is owner state.
// ---------------------------------------------------------------------------

interface PledgeDialProps {
  value: number;
  gap: number;
  reducedMotion: boolean;
  onChange: (value: number) => void;
}

function clampDial(value: number): number {
  return Math.max(DIAL_MIN, Math.min(DIAL_MAX, value));
}

function snapDial(raw: number, gap: number): number {
  const rounded = Math.round(clampDial(raw));
  if (gap >= DIAL_MIN && gap <= DIAL_MAX && Math.abs(rounded - gap) <= 2) return gap;
  return rounded;
}

function PledgeDial({value, gap, reducedMotion, onChange}: PledgeDialProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const railWidth = useElementWidth(railRef);
  const [dragFloat, setDragFloat] = useState<number | null>(null);
  const dragStart = useRef({x: 0, value: 0, lastX: 0, lastT: 0, vel: 0});

  const shown = dragFloat ?? value;
  const centerX = railWidth / 2;
  const offset = centerX - (shown - DIAL_MIN) * PX_PER_DOLLAR;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStart.current = {x: event.clientX, value: shown, lastX: event.clientX, lastT: event.timeStamp, vel: 0};
    setDragFloat(shown);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragFloat == null) return;
    const start = dragStart.current;
    const dt = event.timeStamp - start.lastT;
    if (dt > 0) {
      start.vel = (event.clientX - start.lastX) / dt;
      start.lastX = event.clientX;
      start.lastT = event.timeStamp;
    }
    const next = clampDial(start.value - (event.clientX - start.x) / PX_PER_DOLLAR);
    setDragFloat(next);
    onChange(snapDial(next, gap));
  };
  const onPointerUp = () => {
    if (dragFloat == null) return;
    // Decay projection (~120ms of momentum), skipped under reduced motion
    // (direct set per the a11y plan), then $1 snap + magnetic detent.
    const projected = reducedMotion
      ? dragFloat
      : clampDial(dragFloat - (dragStart.current.vel * 120) / PX_PER_DOLLAR);
    setDragFloat(null);
    onChange(snapDial(projected, gap));
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = clampDial(value + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = clampDial(value - 1);
    else if (event.key === 'PageUp') next = clampDial(value + 5);
    else if (event.key === 'PageDown') next = clampDial(value - 5);
    else if (event.key === 'Home') next = DIAL_MIN;
    else if (event.key === 'End') next = DIAL_MAX;
    if (next == null) return;
    event.preventDefault();
    onChange(next);
  };

  const ticks: ReactNode[] = [];
  for (let dollar = DIAL_MIN; dollar <= DIAL_MAX; dollar++) {
    const left = (dollar - DIAL_MIN) * PX_PER_DOLLAR;
    const isDetent = dollar === gap;
    const isMajor = dollar % 5 === 0;
    ticks.push(
      <span
        key={dollar}
        style={{
          ...(isDetent ? styles.tickDetent : isMajor ? styles.tickMajor : styles.tickMinor),
          left,
        }}
      />,
    );
    if (isMajor) {
      ticks.push(
        <span key={`label-${dollar}`} style={{...styles.tickLabel, left}}>
          ${dollar}
        </span>,
      );
    }
  }

  const fee = feeFor(value);
  const atGap = value === gap;
  return (
    <div>
      <div style={styles.readoutWrap}>
        <span style={styles.readoutAmount}>${value}</span>
        <span style={styles.readoutFee}>
          + {fmtCents(fee)} fee · {fmtCents(value + fee)} total
        </span>
      </div>
      <div
        ref={railRef}
        role="slider"
        tabIndex={0}
        className="pgp-focusable"
        aria-label="Pledge amount"
        aria-valuemin={DIAL_MIN}
        aria-valuemax={DIAL_MAX}
        aria-valuenow={value}
        aria-valuetext={atGap ? `$${value}, covers the gap` : `$${value}`}
        style={styles.railWrap}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}>
        <div
          style={{
            ...styles.railInner,
            transform: `translateX(${offset}px)`,
            transition: dragFloat != null || reducedMotion ? 'none' : 'transform 160ms ease-out',
          }}
          aria-hidden>
          {ticks}
        </div>
        <span style={styles.centerLine} aria-hidden>
          {atGap ? <span style={styles.detentFlag}>Covers the gap</span> : null}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; pointer drag is garnish, >120px past medium closes), 52px
// header with 44×44 X, focus-trapped dialog. Focus moves in with
// {preventScroll: true} per the binding amendment (plain .focus() would
// scroll-reveal the animating sheet inside the locked overflow-hidden
// column and beach it mid-screen).
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
      className="pgp-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="pgp-btn pgp-focusable"
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
          className="pgp-btn pgp-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
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

export default function MobileGroupGiftPoolTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [pool, setPool] = useState<PoolState>(INITIAL_POOL);
  const update = useCallback((patch: Partial<PoolState>) => {
    setPool(prev => ({...prev, ...patch}));
  }, []);
  const updateEntry = useCallback((id: string, patch: Partial<LedgerEntry>) => {
    setPool(prev => ({
      ...prev,
      entries: prev.entries.map(entry => (entry.id === id ? ({...entry, ...patch} as LedgerEntry) : entry)),
    }));
  }, []);

  // Transient visual only (like pointer-drag deltas): keys the 240ms sweep.
  const [sweepSeq, setSweepSeq] = useState(0);
  const toastSeqRef = useRef(0);
  const toastPatch = (msg: string, undo = false): Partial<PoolState> => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, msg, undo}};
  };

  // DERIVED — pure functions of the one state owner, no second source.
  const pledged = pool.refunded ? 0 : PLEDGED_SEED + (pool.yourPledge ?? 0);
  const remaining = Math.max(0, POOL.goal - pledged);
  const funded = pledged >= POOL.goal;
  const over = pledged - POOL.goal; // 262−260 = 2 for the $25 overshoot ✓
  const percent = Math.round((pledged / POOL.goal) * 100); // 91 → 100 → 101
  const pledgedInvited = 6 + (pool.yourPledge != null && !pool.refunded ? 1 : 0);
  const shareCopy = pool.refunded
    ? `The pool for Dana's gift has closed.`
    : funded
      ? `Dana's gift is fully funded — thank you!`
      : `Chip in for Dana's gift — only $${remaining} to go!`;
  const anyOverlayOpen = pool.sheetOpen || pool.actionSheetOpen || pool.alertOpen;

  // Focus plumbing — restored on every close path.
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const alertRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLButtonElement | null>(null);
  const organizerBtnRef = useRef<HTMLButtonElement | null>(null);
  const asCancelRef = useRef<HTMLButtonElement | null>(null);
  const alertCancelRef = useRef<HTMLButtonElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Focus into overlays — always {preventScroll: true} (binding amendment).
  useEffect(() => {
    if (pool.sheetOpen) sheetRef.current?.focus({preventScroll: true});
  }, [pool.sheetOpen]);
  useEffect(() => {
    if (pool.actionSheetOpen) asCancelRef.current?.focus({preventScroll: true});
  }, [pool.actionSheetOpen]);
  useEffect(() => {
    if (pool.alertOpen) alertCancelRef.current?.focus({preventScroll: true});
  }, [pool.alertOpen]);

  // Escape closes the TOPMOST overlay only: alert(61) > actionSheet(41) >
  // sheet(41); with none open it clears the thermometer highlight.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setPool(prev => {
        if (prev.alertOpen) return {...prev, alertOpen: false};
        if (prev.actionSheetOpen) return {...prev, actionSheetOpen: false};
        if (prev.sheetOpen) return {...prev, sheetOpen: false};
        if (prev.highlightedId != null) return {...prev, highlightedId: null};
        return prev;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  // Focus restoration when overlays close via Escape/scrim/commit.
  const prevOverlay = useRef({sheet: false, actionSheet: false, alert: false});
  useEffect(() => {
    const prev = prevOverlay.current;
    if (prev.alert && !pool.alertOpen) organizerBtnRef.current?.focus();
    else if (prev.actionSheet && !pool.actionSheetOpen && !pool.alertOpen) organizerBtnRef.current?.focus();
    else if (prev.sheet && !pool.sheetOpen) ctaRef.current?.focus(); // pledgeBar CTA on EVERY close path
    prevOverlay.current = {sheet: pool.sheetOpen, actionSheet: pool.actionSheetOpen, alert: pool.alertOpen};
  }, [pool.sheetOpen, pool.actionSheetOpen, pool.alertOpen]);

  // FLOW A — pledge sheet: open at the magnetic default (or your pledge
  // when editing); every dial write re-derives the provisional segment,
  // readout, share copy, and sheet CTA in the same render.
  const openSheet = () => {
    update({sheetOpen: true, sheetDetent: 'medium', dialAmount: pool.yourPledge ?? GAP_SEED});
  };
  const commitPledge = () => {
    const amount = pool.dialAmount;
    const newPledged = PLEDGED_SEED + amount;
    const nowFunded = newPledged >= POOL.goal;
    setPool(prev => {
      const hasYou = prev.entries.some(entry => entry.kind === 'you');
      const entries = hasYou ? prev.entries : ([{kind: 'you', id: 'e_you'} as LedgerEntry, ...prev.entries] as LedgerEntry[]);
      return {
        ...prev,
        yourPledge: amount,
        sheetOpen: false,
        entries,
        ...toastPatch(
          nowFunded
            ? `You're in for $${amount} — pool funded!`
            : `You're in for $${amount} — $${POOL.goal - newPledged} to go`,
        ),
      };
    });
    if (!funded && nowFunded && !reducedMotion) setSweepSeq(seq => seq + 1);
  };

  // FLOW B — segment tap highlights its ledger row (tap again / another /
  // Escape clears or moves; no timers).
  const onSegmentTap = (entryId: string) => {
    const next = pool.highlightedId === entryId ? null : entryId;
    update({highlightedId: next});
    if (next != null) rowRefs.current[next]?.scrollIntoView({behavior: 'auto', block: 'center'});
  };

  // FLOW C — Nudge: row meta flips to the fixed 'Nudged just now', button
  // disables, a nudge event prepends, the one toastDock announces.
  const nudge = (pendingId: string, firstName: string) => {
    updateEntry(pendingId, {nudged: true});
    setPool(prev => ({
      ...prev,
      entries: [{kind: 'nudge', id: `n_you_${pendingId}`, text: `You nudged ${firstName}`, when: 'just now'}, ...prev.entries],
      ...toastPatch(`Nudge sent to ${firstName}`),
    }));
  };

  // FLOW D — organizer verbs (post-funded). Closing the pool is
  // reversible-in-store → executes immediately + Undo (undoOverConfirm);
  // refunding everyone is irreversible → centered alert.
  const closePool = () => {
    update({
      poolClosed: true,
      actionSheetOpen: false,
      undoSnapshot: {poolClosed: pool.poolClosed},
      ...toastPatch('Pool closed — order placed', true),
    });
  };
  const undoClose = () => {
    update({poolClosed: pool.undoSnapshot?.poolClosed ?? false, undoSnapshot: null, ...toastPatch('Reopened')});
  };
  const refundAll = () => {
    update({
      refunded: true,
      poolClosed: true,
      alertOpen: false,
      highlightedId: null,
      ...toastPatch('All pledges refunded — pool closed'),
    });
  };

  const copyShare = () => update(toastPatch('Copied'));

  // CTA re-derives from one derivation chain: collecting → funded
  // (organizer close verb) → closed / refunded caption states.
  const ctaMode = pool.refunded ? 'refunded' : pool.poolClosed ? 'closed' : funded ? 'close' : 'chip';
  const ctaLabel =
    ctaMode === 'refunded'
      ? 'Pool closed · pledges refunded'
      : ctaMode === 'closed'
        ? 'Ordered · pool closed'
        : ctaMode === 'close'
          ? 'Close pool & order'
          : `Chip in — $${remaining} to go`;

  const dialFee = feeFor(pool.dialAmount);
  const gapPreset = GAP_SEED;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(anyOverlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const renderLedgerRow = (entry: LedgerEntry, index: number, count: number) => {
    const isLast = index === count - 1;
    const highlighted = pool.highlightedId === entry.id;
    const rowStyle = {...styles.ledgerRow, ...(highlighted ? styles.ledgerRowHighlighted : null)};
    let body: ReactNode = null;
    if (entry.kind === 'you') {
      const amount = pool.yourPledge ?? 0;
      body = (
        <div style={rowStyle}>
          <span style={{...styles.disc, background: BRAND_ACCENT}} aria-hidden>
            Y
          </span>
          <span style={styles.ledgerText}>
            <span style={styles.ledgerPrimary}>You</span>
            <span style={styles.ledgerMeta}>
              {pool.refunded ? `Refunded $${amount}` : `Pledged $${amount} · just now`}
            </span>
          </span>
          {pool.refunded || pool.poolClosed ? (
            <span style={styles.ledgerAmount}>${amount}</span>
          ) : (
            <button type="button" className="pgp-btn pgp-focusable" style={styles.editBtn} onClick={openSheet}>
              Edit
            </button>
          )}
        </div>
      );
    } else if (entry.kind === 'pledge') {
      const person = CONTRIBUTORS_BY_ID[entry.contributorId];
      body = (
        <div style={rowStyle}>
          <span style={{...styles.disc, background: SEG_FILLS[person.segIndex]}} aria-hidden>
            {person.initial}
          </span>
          <span style={styles.ledgerText}>
            <span style={styles.ledgerPrimary}>{person.name}</span>
            <span style={styles.ledgerMeta}>
              {pool.refunded ? `Refunded $${person.amount}` : `Pledged $${person.amount} · ${person.when}`}
            </span>
          </span>
          <span style={styles.ledgerAmount}>${person.amount}</span>
        </div>
      );
    } else if (entry.kind === 'message') {
      const person = CONTRIBUTORS_BY_ID[entry.contributorId];
      body = (
        <div style={rowStyle}>
          <span style={{...styles.disc, background: SEG_FILLS[person.segIndex]}} aria-hidden>
            {person.initial}
          </span>
          <span style={styles.ledgerText}>
            <span style={styles.ledgerPrimary}>{person.name}</span>
            {/* Stress fixture 5: Priya's 100-char message single-line
                ellipsizes — never wraps the 60px row. */}
            <span style={styles.ledgerMeta}>{entry.text}</span>
          </span>
        </div>
      );
    } else if (entry.kind === 'nudge') {
      body = (
        <div style={rowStyle}>
          <span style={styles.discMuted} aria-hidden>
            <Icon icon={BellIcon} size="sm" color="inherit" />
          </span>
          <span style={styles.ledgerText}>
            <span style={styles.ledgerPrimaryLight}>{entry.text}</span>
            <span style={styles.ledgerMeta}>{entry.when}</span>
          </span>
        </div>
      );
    } else {
      // INVITED-PENDING — stress fixture 1: Ana Silva-Konstantopoulos
      // ellipsizes BEFORE the Nudge pill at 320px (trailing-control safety).
      const firstName = entry.name.split(' ')[0];
      body = (
        <div style={rowStyle}>
          <span style={styles.discPending} aria-hidden>
            {entry.initial}
          </span>
          <span style={styles.ledgerText}>
            <span style={styles.ledgerPrimary}>{entry.name}</span>
            <span style={styles.ledgerMeta}>{entry.nudged ? 'Nudged just now' : "Invited · hasn't pledged"}</span>
          </span>
          <button
            type="button"
            className="pgp-btn pgp-focusable"
            style={styles.nudgeHit}
            disabled={entry.nudged}
            aria-disabled={entry.nudged}
            aria-label={entry.nudged ? `${firstName} nudged` : `Nudge ${firstName}`}
            onClick={() => nudge(entry.id, firstName)}>
            <span style={{...styles.nudgePill, ...(entry.nudged ? styles.nudgePillDone : null)}}>
              {entry.nudged ? 'Nudged' : 'Nudge'}
            </span>
          </button>
        </div>
      );
    }
    return (
      <div
        key={entry.id}
        ref={element => {
          rowRefs.current[entry.id] = element;
        }}>
        {body}
        {isLast ? null : <div style={styles.rowDividerDeep} />}
      </div>
    );
  };

  const toastNode = pool.toast != null && (
    <div key={pool.toast.seq} style={styles.toast} className="pgp-fade">
      <span style={styles.toastMsg}>{pool.toast.msg}</span>
      {pool.toast.undo ? (
        <>
          <span style={styles.toastRule} aria-hidden />
          <button type="button" className="pgp-btn pgp-focusable" style={styles.toastUndoBtn} onClick={undoClose}>
            Undo
          </button>
        </>
      ) : null}
    </div>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{PITCHIN_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="pgp-btn pgp-focusable"
              style={styles.brandBtn}
              aria-label="Pitchin home"
              onClick={() => update(toastPatch('Pitchin — group gifts without the spreadsheet'))}>
              <PitchinMark />
            </button>
          </div>
          <p style={styles.navTitle}>Dana's Gift</p>
          <div style={styles.navTrailing}>
            {/* Status only (non-interactive): countdown → Funded flip. */}
            <span style={styles.chipHit}>
              {funded && !pool.refunded ? (
                <span style={{...styles.chip, ...styles.chipFunded}}>
                  <Icon icon={CircleCheckIcon} size="xsm" color="inherit" />
                  Funded
                </span>
              ) : (
                <span style={{...styles.chip, ...styles.chipCountdown}}>
                  <Icon icon={ClockIcon} size="xsm" color="inherit" />
                  {POOL.deadlineLabel}
                </span>
              )}
            </span>
          </div>
        </header>

        <main style={styles.main}>
          <h1 className="pgp-vh">Pitchin — Dana's gift pool</h1>

          {/* GIFT CARD — 72px media row + 44px utility row (248+12=260 ✓). */}
          <section aria-label="Gift" style={{...styles.listCard, ...styles.cardGap}}>
            <h2 className="pgp-vh">Gift</h2>
            <div style={styles.giftMediaRow}>
              <span style={styles.giftThumb} aria-hidden>
                <Icon icon={GiftIcon} size="md" color="inherit" />
              </span>
              <span style={styles.giftText}>
                <span style={styles.giftPrimary}>{POOL.gift}</span>
                <span style={styles.giftSecondary}>
                  For {POOL.recipient} · organized by {POOL.organizer}
                </span>
              </span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.utilityRow}>
              <span style={styles.utilityLeft}>
                ${POOL.itemPrice} gift + ${POOL.shipping} shipping
              </span>
              <span style={styles.utilityRight}>${POOL.goal} goal</span>
            </div>
          </section>

          {/* THERMOMETER CARD. */}
          <section aria-label="Pool progress" style={{...styles.listCard, ...styles.paddedCard, ...styles.cardGap}}>
            <h2 className="pgp-vh">Pool progress</h2>
            <div style={styles.thermoHeader}>
              <span style={styles.heroMoney}>
                ${pledged} of ${POOL.goal}
              </span>
              <span style={styles.heroPct}>{percent}%</span>
            </div>
            <PoolThermometer
              yourPledge={pool.yourPledge}
              refunded={pool.refunded}
              dialAmount={pool.dialAmount}
              sheetOpen={pool.sheetOpen}
              highlightedId={pool.highlightedId}
              sweepSeq={sweepSeq}
              onSegmentTap={onSegmentTap}
            />
            <div style={styles.captionRow}>
              <span style={styles.captionStrong}>
                {funded ? (over > 0 ? `Funded · $${over} over` : 'Funded') : `$${remaining} to go`}
              </span>
              <span style={styles.captionMuted}>
                {pledgedInvited} of {INVITED_COUNT} invited have pledged
              </span>
            </div>
          </section>

          {/* SHARE PREVIEW — copy re-derives from remaining. */}
          <section aria-label="Share message" style={{...styles.listCard, ...styles.paddedCard, ...styles.cardGap}}>
            <h2 style={{...styles.overline, margin: 0}}>Share message</h2>
            <div style={styles.shareRow}>
              <span style={styles.shareInset}>{shareCopy}</span>
              <span style={styles.copyHit}>
                <button type="button" className="pgp-btn pgp-focusable" style={styles.copyBtn} onClick={copyShare}>
                  <Icon icon={CopyIcon} size="xsm" color="inherit" />
                  Copy
                </button>
              </span>
            </div>
          </section>

          {/* LEDGER — organizer zone locked pre-100%, menu post-100%. */}
          <div style={styles.sectionRow}>
            <h2 style={styles.sectionLabel}>Activity</h2>
            {funded && !pool.refunded ? (
              <button
                type="button"
                ref={organizerBtnRef}
                className="pgp-btn pgp-focusable"
                style={styles.iconBtn}
                aria-label="Organizer actions"
                aria-expanded={pool.actionSheetOpen}
                onClick={() => update({actionSheetOpen: true})}>
                <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
              </button>
            ) : (
              <span style={styles.lockCaption}>
                <Icon icon={LockIcon} size="xsm" color="inherit" />
                Unlocks at 100%
              </span>
            )}
          </div>
          <section aria-label="Activity ledger" style={styles.listCard}>
            {pool.entries.map((entry, index) => renderLedgerRow(entry, index, pool.entries.length))}
          </section>
          <p style={styles.terminalCaption}>
            {INVITED_COUNT} invited · {pledgedInvited} pledged
          </p>
          <div style={styles.spacer24} />

          {/* TOAST DOCK — one polite region, no auto-dismiss timers; a new
              mutation replaces the old toast. Sticky-in-flow above the
              pledgeBar; shell-absolute only while scroll-locked. */}
          <div
            style={{...styles.toastDock, ...(anyOverlayOpen ? styles.toastDockLocked : null)}}
            aria-live="polite">
            {toastNode}
          </div>
        </main>

        <div style={styles.pledgeBar}>
          <button
            type="button"
            ref={ctaRef}
            className="pgp-btn pgp-focusable"
            style={{...styles.cta, ...(ctaMode === 'closed' || ctaMode === 'refunded' ? styles.ctaClosed : null)}}
            disabled={ctaMode === 'closed' || ctaMode === 'refunded'}
            aria-disabled={ctaMode === 'closed' || ctaMode === 'refunded'}
            onClick={ctaMode === 'close' ? closePool : openSheet}>
            {ctaLabel}
          </button>
        </div>

        {/* OVERLAYS — absolute inside shell; scrim z40, sheet/actionSheet
            z41, alert scrim z60 + alert z61. */}
        {pool.sheetOpen || pool.actionSheetOpen ? (
          <div
            style={styles.sheetScrim}
            onClick={() => update(pool.actionSheetOpen ? {actionSheetOpen: false} : {sheetOpen: false})}
            aria-hidden
          />
        ) : null}

        {pool.sheetOpen ? (
          <Sheet
            titleId="pgp-sheet-title"
            title="Your contribution"
            detent={pool.sheetDetent}
            onDetentChange={detent => update({sheetDetent: detent})}
            onClose={() => update({sheetOpen: false})}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button type="button" className="pgp-btn pgp-focusable" style={styles.cta} onClick={commitPledge}>
                Chip in {fmtCents(pool.dialAmount + dialFee)}
              </button>
            }>
            <PledgeDial
              value={pool.dialAmount}
              gap={gapPreset}
              reducedMotion={reducedMotion}
              onChange={value => update({dialAmount: value})}
            />
            <div style={styles.presetRow}>
              {[
                {id: 'p10', label: '$10', value: 10, brand: false},
                {id: 'p25', label: '$25', value: 25, brand: false},
                {id: 'pgap', label: `Cover the gap · $${gapPreset}`, value: gapPreset, brand: true},
              ].map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  className="pgp-btn pgp-focusable"
                  style={styles.presetHit}
                  aria-pressed={pool.dialAmount === preset.value}
                  onClick={() => update({dialAmount: preset.value})}>
                  <span style={{...styles.presetPill, ...(preset.brand ? styles.presetPillBrand : null)}}>
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </Sheet>
        ) : null}

        {pool.actionSheetOpen ? (
          <div
            ref={actionSheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pgp-as-header"
            style={styles.actionSheetWrap}
            className="pgp-sheet-in"
            onKeyDown={event => trapTabKey(event, actionSheetRef.current)}>
            <div style={styles.asCard}>
              <div id="pgp-as-header" style={styles.asHeader}>
                Pool is funded — ${pledged} of ${POOL.goal}
              </div>
              <div style={styles.asDivider} />
              <button type="button" className="pgp-btn pgp-focusable" style={styles.asRow} onClick={closePool}>
                Close pool &amp; order
              </button>
              <div style={styles.asDivider} />
              <button
                type="button"
                className="pgp-btn pgp-focusable"
                style={styles.asRow}
                onClick={() => update({actionSheetOpen: false, ...toastPatch('Message drafted to all 8 invitees')})}>
                Message contributors
              </button>
              <div style={styles.asDivider} />
              <button
                type="button"
                className="pgp-btn pgp-focusable"
                style={{...styles.asRow, ...styles.asRowDestructive}}
                onClick={() => update({actionSheetOpen: false, alertOpen: true})}>
                Refund all pledges
              </button>
            </div>
            <div style={styles.asCard}>
              <button
                type="button"
                ref={asCancelRef}
                className="pgp-btn pgp-focusable"
                style={styles.asCancelRow}
                onClick={() => update({actionSheetOpen: false})}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {pool.alertOpen ? (
          <>
            {/* Alert scrim does NOT dismiss on click — an alert demands an
                explicit choice. */}
            <div style={styles.alertScrim} aria-hidden />
            <div
              ref={alertRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="pgp-alert-title"
              aria-describedby="pgp-alert-body"
              style={styles.alert}
              onKeyDown={event => trapTabKey(event, alertRef.current)}>
              <div style={styles.alertBody}>
                <h2 id="pgp-alert-title" style={styles.alertTitle}>
                  Refund all pledges?
                </h2>
                <p id="pgp-alert-body" style={styles.alertText}>
                  Everyone gets their money back and the pool closes. This can't be undone.
                </p>
              </div>
              <div style={styles.alertBtnRow}>
                <button
                  type="button"
                  ref={alertCancelRef}
                  className="pgp-btn pgp-focusable"
                  style={styles.alertBtn}
                  onClick={() => update({alertOpen: false})}>
                  Cancel
                </button>
                <span style={styles.alertBtnRule} aria-hidden />
                <button
                  type="button"
                  className="pgp-btn pgp-focusable"
                  style={{...styles.alertBtn, ...styles.alertBtnDestructive}}
                  onClick={refundAll}>
                  Refund
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}


