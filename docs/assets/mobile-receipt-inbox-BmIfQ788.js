var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Shoebill receipts inbox frozen in
 *   the demo's July-4 week against STATEMENT_TOTAL $2,184.62 (June card
 *   statement): four UNFILED receipts (Trader Joe's $67.13 Jul 1 Groceries
 *   with LOW date+category; Chevron $52.40 Jun 30 Travel with LOW amount;
 *   Home Depot $138.96 Jun 29 Office all-ok; Panera $31.55 Jun 29 Meals with
 *   LOW merchant — rendered as 'Panera Bread Bakery-Cafe #4821 Downtown', the
 *   truncation stress) summing to exactly $290.04, and six FILED receipts
 *   (Blue Bottle 14.25 · Uber 23.80 · Staples 86.42 · Delta 412.60 ·
 *   Marriott 389.00 · Verizon 91.17) summing to exactly $1,017.24 = 46.56%
 *   of the statement. The Trader Joe's thermal stub itemizes Olive Oil 12.99
 *   + Coffee Beans 8.49 + Produce 22.47 + Frozen 16.98 = 60.93 subtotal +
 *   6.20 tax = 67.13 ✓; every unfiled receipt's line items reconcile too.
 *   No Date.now(), no Math.random(), no network media.
 * @output Shoebill — Receipt Inbox: a 390px MOBILE receipts surface with a
 *   tactile thermal-paper loop. NavBar (Shoebill mark · 'Inbox' · Refresh)
 *   over a 52px filter-chip rail ('All 4' / 'Low confidence 3' / 'This week
 *   4', live-derived), then a 452px inboxStack whose top receipt is a
 *   deterministic ThermalReceipt SVG (viewBox 358×420: mono line items,
 *   dashed rules, perforated zigzag bottom stub, four field-highlight rects)
 *   over two ghost cards reading '3 more behind'; below it four 36px
 *   FieldConfirmChips (low-confidence ones pulse and flash their bound
 *   receipt rect on tap) + a Details button, a 96px ReconciliationBar
 *   ($1,017.24 matched · $1,167.38 unmatched · 46.6% fill), and a six-row
 *   FILED THIS MONTH listCard. Signature move: swipe the receipt up past
 *   −110px (or press 'File receipt' in the two-detent confirm sheet / the
 *   card's ellipsis menu) and ONE dispatch stamps FILED, tears the
 *   perforated stub, promotes the next ghost, ticks the recon fill
 *   46.6→49.6%, drops the tab badge 4→3, prepends the filed row, mints the
 *   Reports 'Groceries' row, and raises an Undo toast that restores every
 *   one of those numbers from a single snapshot. Filed / Reports / Settings
 *   tabs persist their state; refresh shows deterministic skeleton rows
 *   resolved by the next tap.
 * @position Page template; emitted by \`astryx template mobile-receipt-inbox\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, anchored menu, toast) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   confirm sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close; the toast dock is
 *   sticky-in-flow (bottom 76, above the 64px tabBar) except during sheet
 *   scroll-lock, when it switches to shell-absolute per the foundations
 *   amendment. NavBar hairline + blur are ALWAYS ON (scroll-under not
 *   wired; noted per contract).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); no desktop Layout frames, no
 *   side asides, no multi-column tables. The stage clips to
 *   --radius-container; shell paints full-bleed square.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Shoebill rose — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule; the
 *   spec's SVG-highlight 'var(--color-brand)' mix therefore uses
 *   BRAND_ACCENT too — deviation, same law). Sanctioned non-brand pairs:
 *   WARN_TEXT/WARN_TINT (low-confidence chips), REST_FILL (recon track +
 *   switch OFF tracks — the foundations amendment requires ≥3:1 vs their
 *   ACTUAL surface, so the muted token is not used for these), PAPER
 *   (thermal stub), SCRIM. Contrast math at each declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr'); chipFilterRow 52px (32px chips
 *   in 44px hit wrappers); inboxStack 452px (ThermalReceipt 420 + ghost
 *   offsets +16/+32); FieldConfirmChips 36px visual in 44px hit rows;
 *   reconBar card 96px; filed/reports rows 60px two-line (16px/500 +
 *   13px/400, 2px gap, dividers inset 16, last row none); settings rows
 *   44px; tabBar 64px sticky bottom z20. Sheet detents 55% medium /
 *   calc(100% − 56px) large, 24px grabber zone with 36×5 pill, 52px sheet
 *   header, sticky 48px 'File receipt' footer. TYPE (Figtree via
 *   --font-family-body): 17px/600 nav + sheet titles · 16px/400
 *   body/inputs/rows · 13px/400 secondary · 13px/600 uppercase
 *   sectionHeader 0.06em · 11px/500 tab labels + overlines; nothing under
 *   11px; tabular-nums on every currency. Buttons: 48px sheet primary,
 *   36px secondary, 44×44 icon. Primary verb (File receipt) lives
 *   bottom-third (sheet sticky footer + the swipe-up gesture); destructive
 *   'Discard receipt' lives ONLY inside the receipt's ellipsis anchored
 *   menu, destructive last, never bottom-right. Touch: every target ≥44×44
 *   with ≥8px clearance or merged full-row; every gesture has a visible
 *   button path (swipe-up ↔ sheet footer + ellipsis menu row; sheet drag ↔
 *   clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow: no width:390 literals — the
 *   receipt card and listCards are width 100% inside the 16px gutter (358px
 *   at 390, 288px at 320, 398px at 430). ThermalReceipt scales via viewBox
 *   + width 100% / height auto, so px callouts inside the SVG are viewBox
 *   units; SVG text is authored at ≥14 viewBox units so the 288/358 scale
 *   at 320px still paints ≥11.3px (the 11px floor holds — the spec's own
 *   stress note (f) corrects its earlier 11-unit callout). chipDock wraps;
 *   chipFilterRow scrolls horizontally (scrollPaddingInline 16, ≥24px
 *   peek); recon caption stays one line to 320 (13px tabular-nums, minWidth
 *   0 flex children); filed-row amounts never wrap.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver on
 *   the wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout — the receipt-stack
 *   anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  AlertCircleIcon,
  BarChart3Icon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DollarSignIcon,
  FolderCheckIcon,
  InboxIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SearchXIcon,
  SettingsIcon,
  StoreIcon,
  TagIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Shoebill rose). #E11D48 on #FFFFFF ≈ 4.6:1
// (passes 4.5:1 text); #FB7185 on the dark card (~#1C1917) ≈ 6.9:1.
const BRAND_ACCENT = 'light-dark(#E11D48, #FB7185)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #E11D48 ≈ 4.6:1. Dark:
// white on #FB7185 fails (~1.9:1), so the dark side flips to near-black
// rose — #4C0519 on #FB7185 ≈ 5.8:1.
const BRAND_ON = 'light-dark(#FFFFFF, #4C0519)';
// Brand-tinted washes: 12% chip/filter fills, 18% ThermalReceipt highlight
// rects (the spec's \`var(--color-brand)\` mix is quarantined to BRAND_ACCENT
// per the one-brand-literal house law). Confirmed chips and active filter
// chips ALSO carry a 1px BRAND_ACCENT boundary — the tint alone is a wash,
// and the foundations amendment requires interactive boundaries ≥3:1 vs
// their surface (#E11D48 vs white card 4.6:1 ✓, #FB7185 vs dark card
// 6.9:1 ✓).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
const BRAND_TINT_18 = \`color-mix(in srgb, \${BRAND_ACCENT} 18%, transparent)\`;
// Low-confidence (warning) chip pair. Text/border #8A5A00 on the white card
// ≈ 5.9:1 and on the WARN_TINT wash (#FBF3DC-equivalent) ≈ 5.4:1 — both
// clear 4.5:1 text AND the ≥3:1 interactive-boundary law vs the chip's
// ACTUAL tinted surface (the batch-2 amendment class). Dark: #F0C24B on
// ~#1C1917 ≈ 10:1.
const WARN_TEXT = 'light-dark(#8A5A00, #F0C24B)';
const WARN_TINT = 'light-dark(rgba(240, 194, 75, 0.18), rgba(240, 194, 75, 0.12))';
// Meaningful REST fills (foundations amendment: ≥3:1 vs their ACTUAL
// surface — the muted token nearly vanishes at ~1.1:1 on the card). Used
// for the recon bar's unmatched track and the Settings switch OFF tracks.
// #8F867B vs white card ≈ 3.6:1; #7A736A vs dark card (~#1C1917) ≈ 3.6:1.
// The brand recon FILL vs this track is ~1.3:1 by luminance but the two
// segments are opposing hues and EACH clears 3:1 against the card
// (#E11D48 4.6:1 / rest 3.6:1) — math per the ReconciliationBar spec note.
const REST_FILL = 'light-dark(#8F867B, #7A736A)';
// Thermal-paper stub surface — a warm half-step off the card so the
// receipt reads as paper ON the body background; edge is carried by the
// 1px --color-border stroke, text on it is token text-primary/secondary.
const PAPER = 'light-dark(#FDFBF6, #221F1B)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Chrome blur surface (navBar, tabBar, sheet footer).
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, keyframes, and the reduced-motion
// guard. Transitions animate transform/opacity/color; the one sanctioned
// exception is the recon fill's spec-mandated 400ms width tick (instant
// under reduced motion). Pulse and shake are REMOVED under
// prefers-reduced-motion — the static warning fill / error text still
// encode the state.
// ---------------------------------------------------------------------------

const SBL_CSS = \`
.sbl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.sbl-btn:disabled { cursor: default; }
.sbl-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.sbl-input:focus { box-shadow: inset 0 0 0 2px \${BRAND_ACCENT}; outline: none; }
.sbl-anim { transition: transform 240ms ease, opacity 240ms ease; }
.sbl-fade { transition: opacity 200ms ease; }
.sbl-recon-fill { transition: width 400ms ease; }
@keyframes sbl-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
.sbl-pulse { animation: sbl-pulse 1.4s ease-in-out infinite; }
@keyframes sbl-shake {
  0%, 100% { transform: none; }
  16%, 50%, 83% { transform: translateX(-4px); }
  33%, 66% { transform: translateX(4px); }
}
.sbl-shake { animation: sbl-shake 360ms ease; }
@keyframes sbl-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.15; }
}
.sbl-flash { animation: sbl-flash 300ms ease 3; }
@keyframes sbl-stamp-in {
  from { opacity: 0; transform: scale(1.3); }
  to { opacity: 1; transform: scale(1); }
}
.sbl-stamp-in { animation: sbl-stamp-in 150ms ease-out both; }
@keyframes sbl-file-out {
  0%, 38% { transform: none; opacity: 1; }
  100% { transform: translateY(-64px); opacity: 0; }
}
.sbl-file-out { animation: sbl-file-out 390ms ease-in both; }
.sbl-stub-tear { transform: translateY(12px); opacity: 0; transition: transform 240ms ease, opacity 240ms ease; }
@keyframes sbl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.sbl-sheet-in { animation: sbl-sheet-in 240ms ease; }
.sbl-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.sbl-chiprail { scrollbar-width: none; }
.sbl-chiprail::-webkit-scrollbar { display: none; }
@media (prefers-reduced-motion: reduce) {
  .sbl-anim, .sbl-fade, .sbl-recon-fill, .sbl-stub-tear { transition: none; }
  .sbl-pulse, .sbl-shake, .sbl-flash { animation: none; }
  .sbl-stamp-in, .sbl-sheet-in { animation: none; }
  .sbl-file-out { animation-duration: 1ms; }
}
\`;

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
  // Scroll lock while the confirm sheet is open — absolute overlays anchor
  // to the visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 icon buttons
  // optically align content to the 16px gutter. Hairline + blur ALWAYS ON.
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
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
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
  brandBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  // CHIP FILTER ROW — 52px block; 32px chips inside 44px-tall hit wrappers;
  // horizontal rail with 16px scroll padding and ≥24px peek at 320.
  chipFilterRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    overflowX: 'auto',
    scrollSnapType: 'x proximity',
    scrollPaddingInline: 16,
  },
  filterChipHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    borderRadius: 999,
  },
  filterChip: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  filterChipOn: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // INBOX STACK — relative 452px container: 420px receipt + ghost offsets
  // +16/+32 (scale 0.96/0.92, opacity 0.6/0.35).
  stackSection: {marginTop: 12, paddingInline: 16},
  inboxStack: {position: 'relative', height: 452},
  ghostCard: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    aspectRatio: '358 / 420',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  ghostLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    paddingBottom: 4,
    fontVariantNumeric: 'tabular-nums',
  },
  receiptWrap: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    borderRadius: 12,
    touchAction: 'pan-x',
  },
  // 44×44 ellipsis — top-trailing ON the receipt card (destructive verbs
  // live behind this one intent step, never bottom-right).
  moreBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    zIndex: 2,
  },
  // Anchored menu — 12px radius card, 44px rows, destructive last.
  anchoredMenu: {
    position: 'absolute',
    top: 48,
    right: 8,
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
    paddingInline: 14,
    fontSize: 16,
  },
  menuRowDanger: {color: 'var(--color-error)'},
  menuDivider: {height: 1, background: 'var(--color-border)'},
  // CHIP DOCK — 12px below stack; 8px gaps; wraps at 320.
  chipDock: {
    marginTop: 12,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  chipHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 999,
  },
  chip: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    maxWidth: 200,
  },
  chipLabel: {
    minWidth: 0,
    maxWidth: 160,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipConfirmed: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  chipLow: {
    border: \`1px solid \${WARN_TEXT}\`,
    background: WARN_TINT,
    color: WARN_TEXT,
  },
  chipGlyph: {display: 'inline-flex', flexShrink: 0},
  detailsBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
  },
  // RECON BAR — 96px card, 16px padding; 8px 999-radius track.
  reconCard: {
    marginTop: 24,
    marginInline: 16,
    height: 96,
    padding: 16,
    boxSizing: 'border-box',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  reconHeader: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  reconTrack: {
    height: 8,
    borderRadius: 999,
    background: REST_FILL,
    overflow: 'hidden',
  },
  reconFill: {
    height: '100%',
    borderRadius: 999,
    background: BRAND_ACCENT,
  },
  reconCaption: {
    display: 'flex',
    gap: 8,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    minWidth: 0,
    whiteSpace: 'nowrap',
  },
  reconMatched: {color: 'var(--color-text-primary)', fontWeight: 500, flexShrink: 0},
  reconUnmatched: {minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'},
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom margin.
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
  // 60px two-line rows: 16/500 primary + 13/400 secondary, 2px gap;
  // trailing amount 16/400 tabular, never wraps.
  row60: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
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
  rowAmount: {
    fontSize: 16,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Skeleton rows — same 60px geometry as the rows they impersonate;
  // deterministic widths 60/45/70 + 40/55/30 (never Math.random()).
  skelBar: {borderRadius: 6, background: 'var(--color-background-muted)', height: 12},
  // EMPTY STATES.
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
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 16px'},
  emptyAction: {
    height: 36,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
  },
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom even mid-scroll (shell grows with content; absolute
  // would anchor to the DOCUMENT bottom). Switches to shell-absolute ONLY
  // while the sheet scroll-locks the shell at 100dvh. Always mounted for
  // aria-live.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
  },
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 45,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 0,
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 'calc(100% - 32px)',
    minHeight: 48,
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
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  // TAB BAR — exactly 64px; 4 tabs flex 1; badge = 16px min-width brand
  // pill, 10px/600, offset top −4 / right −8.
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
  // Badge text: BRAND_ON on BRAND_ACCENT — white on #E11D48 4.6:1 /
  // #4C0519 on #FB7185 5.8:1.
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
  // SETTINGS — 44px utility rows; whole row is the switch button.
  settingsRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  settingsLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Switch — 51×31 track / 27px thumb per inputControls; OFF track uses
  // REST_FILL (≥3:1 vs card, amendment) instead of the near-invisible
  // translucent token pair.
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    flexShrink: 0,
    position: 'relative',
    background: REST_FILL,
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
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
  switchThumbOn: {transform: 'translateX(20px)'},
  // SHEET — scrim z40 + sheet z41, absolute inside shell; detents 55% /
  // calc(100% − 56px).
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
  // Footer reason line — 13px --color-error; the button STAYS pressable
  // (disabled-look only) and pressing it shakes + focuses the offender.
  footerReason: {
    fontSize: 13,
    color: 'var(--color-error)',
    marginBottom: 8,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  fileBtn: {
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
  fileBtnMuted: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // Confirm groups — formField anatomy: 13/500 label, 8px gap, 48px input.
  fieldGroup: {marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8},
  fieldLabelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  fieldConfirmedTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: BRAND_ACCENT,
    fontWeight: 600,
  },
  fieldLowTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: WARN_TEXT,
    fontWeight: 600,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-background-muted)',
    paddingInline: 16,
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family-body)',
    width: '100%',
    boxSizing: 'border-box',
  },
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-error)',
  },
  // Category — 8px-gap chip grid.
  catGrid: {display: 'flex', flexWrap: 'wrap', gap: 8},
  // Date — 44px utility row + inline datePanel (never a native picker).
  dateRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  datePill: {
    height: 36,
    paddingInline: 12,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-text-primary)',
  },
  datePanel: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 8,
  },
  dpHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  dpTitle: {fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  dpWeekRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    marginBottom: 4,
  },
  dpGrid: {display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)'},
  dpCell: {
    height: 40,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: '50%',
    color: 'var(--color-text-primary)',
  },
  dpCellToday: {boxShadow: 'inset 0 0 0 1px var(--color-border)'},
  dpCellSelected: {background: BRAND_ACCENT, color: BRAND_ON, fontWeight: 600},
  // Reports tab.
  reportSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
    flexShrink: 0,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic by law. Cross-check ledger (verified by hand):
// UNFILED 6713 + 5240 + 13896 + 3155 = 29004¢ = $290.04 ✓. Trader Joe's
// stub: 1299+849+2247+1698 = 6093 subtotal; +620 tax = 6713 ✓. Chevron:
// 4368+400+100+56 = 4924; +316 = 5240 ✓. Home Depot: 7400+3297+849+1298 =
// 12844; +1052 = 13896 ✓. Panera: 1179+879+399+459 = 2916; +239 = 3155 ✓.
// FILED 1425+2380+8642+41260+38900+9117 = 101724¢ = $1,017.24 ✓. Recon
// rest: 101724/218462 = 46.56% ≈ 46.6; unmatched 218462−101724 = 116738 =
// $1,167.38 ✓. After filing TJ1: 101724+6713 = 108437 ($1,084.37);
// unmatched 110025 ($1,100.25); 49.6% ✓. All four filed: 101724+29004 =
// 130728 ($1,307.28); unmatched 87734 ($877.34); 59.8% ✓. Reports (filed
// only): Meals 1425 + Travel 2380+41260+38900 = 82540 + Office 8642 +
// Utilities 9117 = 101724 ✓. Low-confidence fields: TJ1 date+category,
// CH2 amount, PA4 merchant = 4 fields on 3 receipts → chip 'Low
// confidence 3' ✓; all 4 unfiled fall in the demo's frozen week → 'This
// week 4' ✓.
// ---------------------------------------------------------------------------

const STATEMENT_TOTAL_CENTS = 218462; // $2,184.62 — the June card statement
const STATEMENT_MONTH = 'June';
const TODAY = {month: 'Jul', day: 4}; // the demo's frozen "today" (ring only)

type Tab = 'inbox' | 'filed' | 'reports' | 'settings';
type FilterId = 'all' | 'low' | 'week';
type FieldKey = 'merchant' | 'amount' | 'date' | 'category';
type Category = 'Groceries' | 'Meals' | 'Travel' | 'Office' | 'Utilities' | 'Other';

const FIELD_KEYS: FieldKey[] = ['merchant', 'amount', 'date', 'category'];
const CATEGORIES: Category[] = ['Groceries', 'Meals', 'Travel', 'Office', 'Utilities', 'Other'];

// Data-viz category swatches — repo-standard token + light-dark fallback.
const CATEGORY_COLOR: Record<Category, string> = {
  Groceries: 'var(--color-data-categorical-1, light-dark(#0E7490, #67E8F9))',
  Meals: 'var(--color-data-categorical-2, light-dark(#B45309, #FCD34D))',
  Travel: 'var(--color-data-categorical-3, light-dark(#6D28D9, #C4B5FD))',
  Office: 'var(--color-data-categorical-4, light-dark(#15803D, #86EFAC))',
  Utilities: 'var(--color-data-categorical-5, light-dark(#BE185D, #F9A8D4))',
  Other: 'var(--color-data-categorical-6, light-dark(#475569, #CBD5E1))',
};

interface LineItem {
  id: string;
  label: string;
  cents: number;
}

interface ReceiptEntity {
  id: string;
  merchant: string;
  amountCents: number; // dual field beside amountLabel
  amountLabel: string;
  dateMonth: 'Jun' | 'Jul';
  dateDay: number;
  dateLabel: string; // 'Jul 1' — always \`\${dateMonth} \${dateDay}\`
  time: string;
  address: string;
  category: Category;
  // Thermal-stub line items (unfiled receipts only — pre-filed receipts
  // never render as the stub). subtotal derives: sum(lineItems).
  lineItems?: LineItem[];
  taxCents?: number;
  confidence: Record<FieldKey, 'ok' | 'low'>;
  confirmed: Record<FieldKey, boolean>;
  status: 'unfiled' | 'filed' | 'discarded';
  thisWeek: boolean;
}

const OK_CONF: Record<FieldKey, 'ok' | 'low'> = {
  merchant: 'ok',
  amount: 'ok',
  date: 'ok',
  category: 'ok',
};
const ALL_CONFIRMED: Record<FieldKey, boolean> = {
  merchant: true,
  amount: true,
  date: true,
  category: true,
};

// UNFILED (stack order, top first). PA4's merchant is the chip/row
// truncation stress (37+ chars); HD3 is the all-ok zero-picker swipe proof.
const UNFILED_FIXTURES: ReceiptEntity[] = [
  {
    id: 'TJ1',
    merchant: "Trader Joe's",
    amountCents: 6713,
    amountLabel: '$67.13',
    dateMonth: 'Jul',
    dateDay: 1,
    dateLabel: 'Jul 1',
    time: '10:42 AM',
    address: '#122 · 145 LAKESHORE AVE',
    category: 'Groceries',
    lineItems: [
      {id: 'tj-oil', label: 'OLIVE OIL SPANISH', cents: 1299},
      {id: 'tj-cof', label: 'COFFEE BEANS JOES DARK', cents: 849},
      {id: 'tj-pro', label: 'PRODUCE MIXED', cents: 2247},
      {id: 'tj-fro', label: 'FROZEN GYOZA X2', cents: 1698},
    ],
    taxCents: 620,
    confidence: {merchant: 'ok', amount: 'ok', date: 'low', category: 'low'},
    confirmed: {merchant: true, amount: true, date: false, category: false},
    status: 'unfiled',
    thisWeek: true,
  },
  {
    id: 'CH2',
    merchant: 'Chevron',
    amountCents: 5240,
    amountLabel: '$52.40',
    dateMonth: 'Jun',
    dateDay: 30,
    dateLabel: 'Jun 30',
    time: '5:31 PM',
    address: '#204 · 88 HARBOR BLVD',
    category: 'Travel',
    lineItems: [
      {id: 'ch-gas', label: 'UNLEADED 87 11.2 GAL', cents: 4368},
      {id: 'ch-wash', label: 'CAR WASH BASIC', cents: 400},
      {id: 'ch-air', label: 'AIR & WATER', cents: 100},
      {id: 'ch-fluid', label: 'WASHER FLUID', cents: 56},
    ],
    taxCents: 316,
    confidence: {merchant: 'ok', amount: 'low', date: 'ok', category: 'ok'},
    confirmed: {merchant: true, amount: false, date: true, category: true},
    status: 'unfiled',
    thisWeek: true,
  },
  {
    id: 'HD3',
    merchant: 'Home Depot',
    amountCents: 13896,
    amountLabel: '$138.96',
    dateMonth: 'Jun',
    dateDay: 29,
    dateLabel: 'Jun 29',
    time: '2:06 PM',
    address: '#0413 · 900 INDUSTRIAL WAY',
    category: 'Office',
    lineItems: [
      {id: 'hd-shelf', label: 'SHELVING UNIT 4-TIER', cents: 7400},
      {id: 'hd-light', label: 'LED SHOP LIGHT 4FT', cents: 3297},
      {id: 'hd-anchor', label: 'ANCHORS #10 X50', cents: 849},
      {id: 'hd-tray', label: 'PAINT TRAY SET', cents: 1298},
    ],
    taxCents: 1052,
    confidence: OK_CONF,
    confirmed: ALL_CONFIRMED,
    status: 'unfiled',
    thisWeek: true,
  },
  {
    id: 'PA4',
    merchant: 'Panera Bread Bakery-Cafe #4821 Downtown',
    amountCents: 3155,
    amountLabel: '$31.55',
    dateMonth: 'Jun',
    dateDay: 29,
    dateLabel: 'Jun 29',
    time: '12:22 PM',
    address: '#4821 · 12 MARKET SQ',
    category: 'Meals',
    lineItems: [
      {id: 'pa-sand', label: 'BACON TURKEY BRAVO', cents: 1179},
      {id: 'pa-soup', label: 'BROC CHEDDAR BOWL', cents: 879},
      {id: 'pa-crois', label: 'CHOC CROISSANT', cents: 399},
      {id: 'pa-tea', label: 'ICED TEA LG', cents: 459},
    ],
    taxCents: 239,
    confidence: {merchant: 'low', amount: 'ok', date: 'ok', category: 'ok'},
    confirmed: {merchant: false, amount: true, date: true, category: true},
    status: 'unfiled',
    thisWeek: true,
  },
];

// FILED (list order, most recent first). Delta/Marriott are the tabular
// column-alignment stress against $14.25.
const FILED_FIXTURES: ReceiptEntity[] = [
  {id: 'BB5', merchant: 'Blue Bottle Coffee', amountCents: 1425, amountLabel: '$14.25', dateMonth: 'Jun', dateDay: 28, dateLabel: 'Jun 28', time: '8:12 AM', address: '', category: 'Meals', confidence: OK_CONF, confirmed: ALL_CONFIRMED, status: 'filed', thisWeek: false},
  {id: 'UB6', merchant: 'Uber', amountCents: 2380, amountLabel: '$23.80', dateMonth: 'Jun', dateDay: 27, dateLabel: 'Jun 27', time: '9:48 PM', address: '', category: 'Travel', confidence: OK_CONF, confirmed: ALL_CONFIRMED, status: 'filed', thisWeek: false},
  {id: 'ST7', merchant: 'Staples', amountCents: 8642, amountLabel: '$86.42', dateMonth: 'Jun', dateDay: 26, dateLabel: 'Jun 26', time: '3:20 PM', address: '', category: 'Office', confidence: OK_CONF, confirmed: ALL_CONFIRMED, status: 'filed', thisWeek: false},
  {id: 'DL8', merchant: 'Delta Air Lines', amountCents: 41260, amountLabel: '$412.60', dateMonth: 'Jun', dateDay: 24, dateLabel: 'Jun 24', time: '6:02 AM', address: '', category: 'Travel', confidence: OK_CONF, confirmed: ALL_CONFIRMED, status: 'filed', thisWeek: false},
  {id: 'MA9', merchant: 'Marriott Downtown', amountCents: 38900, amountLabel: '$389.00', dateMonth: 'Jun', dateDay: 23, dateLabel: 'Jun 23', time: '11:04 AM', address: '', category: 'Travel', confidence: OK_CONF, confirmed: ALL_CONFIRMED, status: 'filed', thisWeek: false},
  {id: 'VZ10', merchant: 'Verizon Wireless', amountCents: 9117, amountLabel: '$91.17', dateMonth: 'Jun', dateDay: 21, dateLabel: 'Jun 21', time: '7:00 AM', address: '', category: 'Utilities', confidence: OK_CONF, confirmed: ALL_CONFIRMED, status: 'filed', thisWeek: false},
];

const FIELD_META: Record<FieldKey, {label: string}> = {
  merchant: {label: 'Merchant'},
  amount: {label: 'Amount'},
  date: {label: 'Date'},
  category: {label: 'Category'},
};

// Inline datePanel months — hardcoded 2026 calendar facts (no Date()):
// June 1 2026 is a Monday (dow 1), July 1 2026 is a Wednesday (dow 3).
const DATE_MONTHS: Array<{key: 'Jun' | 'Jul'; name: string; days: number; firstDow: number}> = [
  {key: 'Jun', name: 'June 2026', days: 30, firstDow: 1},
  {key: 'Jul', name: 'July 2026', days: 31, firstDow: 3},
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Skeleton widths — deterministic stagger per the foundations (primary
// 60/45/70, secondary 40/55/30; never Math.random()).
const SKELETON_WIDTHS: Array<[number, number]> = [
  [60, 40],
  [45, 55],
  [70, 30],
];

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

const THOUSANDS_RE = /\\B(?=(\\d{3})+(?!\\d))/g; // hoisted (never re-created)
const AMOUNT_INPUT_RE = /^\\$?\\s*(\\d{1,5})(?:\\.(\\d{1,2}))?$/;

/** Cents → '$2,184.62'. */
function fmtUsd(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rem = String(cents % 100).padStart(2, '0');
  return \`$\${String(dollars).replace(THOUSANDS_RE, ',')}.\${rem}\`;
}

/** matched/statement → '46.6' (one decimal, string). */
function fmtPct(matchedCents: number): string {
  return ((matchedCents / STATEMENT_TOTAL_CENTS) * 100).toFixed(1);
}

/** '$67.13' / '67.13' / '67' → cents, or null when unparseable. */
function parseAmount(raw: string): number | null {
  const match = AMOUNT_INPUT_RE.exec(raw.trim());
  if (match == null) return null;
  const dollars = Number(match[1]);
  const centsPart = match[2] == null ? 0 : Number(match[2].padEnd(2, '0'));
  return dollars * 100 + centsPart;
}

function receiptFieldValue(receipt: ReceiptEntity, field: FieldKey): string {
  switch (field) {
    case 'merchant':
      return receipt.merchant;
    case 'amount':
      return receipt.amountLabel;
    case 'date':
      return receipt.dateLabel;
    case 'category':
      return receipt.category;
  }
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — inboxStore via useReducer. The reducer merges
// slice-level patches; \`update(id, patch)\` is the single dispatch helper
// and compound mutations (file / discard / undo) are ONE dispatch carrying
// several slice patches, so every fan-out consequence lands in one render
// (stress fixture g: Undo restores stack order, badge, recon math, and
// Reports rows atomically).
// ---------------------------------------------------------------------------

interface ReceiptsSlice {
  byId: Record<string, ReceiptEntity>;
  inboxOrder: string[]; // unfiled stack order (top first)
  filedOrder: string[]; // filed list order (most recent first)
}

interface UiSlice {
  tab: Tab;
  filter: FilterId;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  sheetFocusField: FieldKey | null;
  dateOpen: boolean;
  menuOpen: boolean;
  refreshing: boolean;
  refreshed: boolean;
  filingId: string | null;
  flash: {field: FieldKey; seq: number} | null;
  shake: {field: FieldKey; seq: number} | null;
  toast: {seq: number; text: string; undoable: boolean} | null;
  draftMerchant: string | null;
  draftAmount: string | null;
  merchantError: boolean;
  amountError: boolean;
  settings: {autoExtract: boolean; weeklyDigest: boolean; lowConfidenceAlerts: boolean};
}

interface StoreState {
  receipts: ReceiptsSlice;
  ui: UiSlice;
  history: {receipts: ReceiptsSlice} | null; // Undo snapshot (one assignment restores)
}

type StorePatch = {
  receipts?: Partial<ReceiptsSlice>;
  ui?: Partial<UiSlice>;
  history?: StoreState['history'];
};

const ALL_FIXTURES = [...UNFILED_FIXTURES, ...FILED_FIXTURES];

const INITIAL_STATE: StoreState = {
  receipts: {
    byId: Object.fromEntries(ALL_FIXTURES.map(receipt => [receipt.id, receipt])),
    inboxOrder: UNFILED_FIXTURES.map(receipt => receipt.id),
    filedOrder: FILED_FIXTURES.map(receipt => receipt.id),
  },
  ui: {
    tab: 'inbox',
    filter: 'all',
    sheetOpen: false,
    sheetDetent: 'medium',
    sheetFocusField: null,
    dateOpen: false,
    menuOpen: false,
    refreshing: false,
    refreshed: false,
    filingId: null,
    flash: null,
    shake: null,
    toast: null,
    draftMerchant: null,
    draftAmount: null,
    merchantError: false,
    amountError: false,
    settings: {autoExtract: false, weeklyDigest: true, lowConfidenceAlerts: true},
  },
  history: null,
};

function storeReducer(state: StoreState, patch: StorePatch): StoreState {
  return {
    receipts: patch.receipts == null ? state.receipts : {...state.receipts, ...patch.receipts},
    ui: patch.ui == null ? state.ui : {...state.ui, ...patch.ui},
    history: patch.history === undefined ? state.history : patch.history,
  };
}

function useInboxStore() {
  const [state, dispatch] = useReducer(storeReducer, INITIAL_STATE);
  // The single update(id, patch) helper; \`dispatch\` itself carries the
  // compound (multi-slice) mutations in one call.
  const update = useCallback(
    <K extends 'receipts' | 'ui'>(id: K, patch: NonNullable<StorePatch[K]>) => {
      dispatch({[id]: patch} as StorePatch);
    },
    [],
  );
  return {state, update, dispatch};
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

/** Nearest scrollable ancestor (the demo's .preview-wrap owns page scroll). */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
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

// ---------------------------------------------------------------------------
// SHOEBILL MARK — 24px inline SVG, single currentColor path pair: shoebill
// head profile facing right, the massive beak drawn as a perforated receipt
// stub (dashed perforation across its base, two zigzag tear teeth at the
// tip). No gradients.
// ---------------------------------------------------------------------------

function ShoebillMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      {/* Skull + crest, one bold stroke. */}
      <path
        d="M5.2 12.6V8.9c0-2.9 2.3-5 5.1-5 1.9 0 3.4.9 4.3 2.3l-1.2 1.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Beak = receipt stub with zigzag tear teeth at the tip. */}
      <path
        d="M9 7.4 L20.2 8.9 L19.6 14.6 L17.9 13.2 L16.1 15 L14.3 13.6 L8.5 12.7 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Perforation line across the beak base. */}
      <path d="M10.6 7.8 10.1 12.4" stroke="currentColor" strokeWidth="1.1" strokeDasharray="1.5 1.5" />
      {/* Eye. */}
      <circle cx="7.4" cy="8.3" r="1" fill="currentColor" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// THERMAL RECEIPT — deterministic SVG stub, viewBox '0 0 358 420', width
// 100% / height auto (all coordinates below are viewBox units; SVG text is
// authored at ≥14 units so the 288/358 scale at a 320px stage paints
// ≥11.3px — the 11px floor holds; see the responsive contract). Body and
// tear-off stub are separate paths split by the dashed perforation at
// y≈375 so the filing animation can translate the stub 12px down (the
// spec's clipPath separation, done with two shapes). Bottom edge is the
// 18px-amplitude triangle wave (peaks 402 / valleys 420), never a radius.
// ---------------------------------------------------------------------------

const MONO_STACK = 'ui-monospace, SFMono-Regular, Menlo, monospace';

function buildBodyPath(): string {
  // Torn top edge: 14 shallow teeth (peaks y=2, valleys y=8).
  const seg = 358 / 14;
  let d = 'M 0 8';
  for (let i = 1; i <= 14; i++) {
    d += \` L \${(seg * i).toFixed(2)} \${i % 2 === 1 ? 2 : 8}\`;
  }
  return \`\${d} L 358 372 L 0 372 Z\`;
}

function buildStubPath(): string {
  // Tear-off stub below the perforation; 16-segment triangle-wave bottom
  // edge, 18 units peak-to-peak (402 ↔ 420).
  const seg = 358 / 16;
  let d = 'M 0 378 L 358 378 L 358 420';
  for (let i = 1; i <= 16; i++) {
    d += \` L \${(358 - seg * i).toFixed(2)} \${i % 2 === 1 ? 402 : 420}\`;
  }
  return \`\${d} Z\`;
}

const RECEIPT_BODY_PATH = buildBodyPath();
const RECEIPT_STUB_PATH = buildStubPath();

// Field-bound highlight regions (spec geometry): merchant y=28 h=24, date
// y=52 h=18, category badge y=300 h=20, amount y=336 h=22.
const HIGHLIGHT_RECTS: Record<FieldKey, {x: number; y: number; w: number; h: number}> = {
  merchant: {x: 24, y: 28, w: 310, h: 24},
  date: {x: 79, y: 52, w: 200, h: 18},
  category: {x: 24, y: 300, w: 168, h: 20},
  amount: {x: 202, y: 336, w: 132, h: 22},
};

interface ThermalReceiptProps {
  receipt: ReceiptEntity;
  highlightField: FieldKey | null; // sheet's focused field — static highlight
  flash: {field: FieldKey; seq: number} | null; // 3×300ms blink on chip tap
  filing: boolean; // FILED stamp + stub tear while the file animation runs
}

function ThermalReceipt({receipt, highlightField, flash, filing}: ThermalReceiptProps) {
  const lineItems = receipt.lineItems ?? [];
  const subtotalCents = lineItems.reduce((sum, item) => sum + item.cents, 0);
  const taxCents = receipt.taxCents ?? 0;
  return (
    <svg
      viewBox="0 0 358 420"
      width="100%"
      height="auto"
      style={{display: 'block', filter: 'drop-shadow(0 2px 8px var(--color-shadow))'}}
      role="img"
      aria-label={\`Receipt from \${receipt.merchant}, \${receipt.amountLabel}, \${receipt.dateLabel}, \${receipt.category}\`}>
      <path d={RECEIPT_BODY_PATH} fill={PAPER} stroke="var(--color-border)" strokeWidth={1} />
      {/* Highlight rects sit under the text; visible when their chip is
          active (sheet focus) or flashing (3×300ms; the animation is
          removed under reduced motion, leaving the single static
          highlight). 18% brand wash + 1.5 brand stroke. */}
      {FIELD_KEYS.map(field => {
        const flashSeq = flash != null && flash.field === field ? flash.seq : null;
        const isFlashing = flashSeq != null;
        const isActive = highlightField === field || isFlashing;
        if (!isActive) return null;
        const rect = HIGHLIGHT_RECTS[field];
        return (
          <rect
            key={isFlashing ? \`\${field}-\${flashSeq}\` : field}
            className={isFlashing ? 'sbl-flash' : undefined}
            x={rect.x}
            y={rect.y}
            width={rect.w}
            height={rect.h}
            rx={2}
            fill={BRAND_TINT_18}
            stroke={BRAND_ACCENT}
            strokeWidth={1.5}
          />
        );
      })}
      {/* Merchant header — 17-unit mono uppercase (≥14-unit floor). */}
      <text
        x={179}
        y={46}
        textAnchor="middle"
        fontFamily={MONO_STACK}
        fontSize={17}
        fontWeight={700}
        letterSpacing="2"
        fill="var(--color-text-primary)">
        {receipt.merchant.length > 30 ? \`\${receipt.merchant.slice(0, 29)}…\` : receipt.merchant.toUpperCase()}
      </text>
      <text
        x={179}
        y={66}
        textAnchor="middle"
        fontFamily={MONO_STACK}
        fontSize={14}
        fill="var(--color-text-secondary)">
        {\`\${receipt.dateLabel.toUpperCase()} 2026 · \${receipt.time}\`}
      </text>
      <text
        x={179}
        y={88}
        textAnchor="middle"
        fontFamily={MONO_STACK}
        fontSize={14}
        letterSpacing="1"
        fill="var(--color-text-secondary)">
        {receipt.address}
      </text>
      <line x1={24} x2={334} y1={104} y2={104} stroke="var(--color-border)" strokeDasharray="4 4" />
      {lineItems.map((item, index) => (
        <g key={item.id}>
          <text
            x={24}
            y={132 + index * 26}
            fontFamily={MONO_STACK}
            fontSize={14}
            fill="var(--color-text-primary)">
            {item.label}
          </text>
          <text
            x={334}
            y={132 + index * 26}
            textAnchor="end"
            fontFamily={MONO_STACK}
            fontSize={14}
            fill="var(--color-text-primary)">
            {(item.cents / 100).toFixed(2)}
          </text>
        </g>
      ))}
      <line x1={24} x2={334} y1={228} y2={228} stroke="var(--color-border)" strokeDasharray="4 4" />
      <text x={24} y={252} fontFamily={MONO_STACK} fontSize={14} fill="var(--color-text-secondary)">
        SUBTOTAL
      </text>
      <text
        x={334}
        y={252}
        textAnchor="end"
        fontFamily={MONO_STACK}
        fontSize={14}
        fill="var(--color-text-secondary)">
        {(subtotalCents / 100).toFixed(2)}
      </text>
      <text x={24} y={276} fontFamily={MONO_STACK} fontSize={14} fill="var(--color-text-secondary)">
        TAX
      </text>
      <text
        x={334}
        y={276}
        textAnchor="end"
        fontFamily={MONO_STACK}
        fontSize={14}
        fill="var(--color-text-secondary)">
        {(taxCents / 100).toFixed(2)}
      </text>
      <line x1={24} x2={334} y1={292} y2={292} stroke="var(--color-border)" strokeDasharray="4 4" />
      {/* Category badge — 2-unit interior radius per the corner map. */}
      <rect
        x={24}
        y={300}
        width={168}
        height={20}
        rx={2}
        fill="none"
        stroke="var(--color-text-secondary)"
        strokeWidth={1}
      />
      <text
        x={32}
        y={314}
        fontFamily={MONO_STACK}
        fontSize={14}
        letterSpacing="1"
        fill="var(--color-text-secondary)">
        {\`CAT · \${receipt.category.toUpperCase()}\`}
      </text>
      <text x={24} y={353} fontFamily={MONO_STACK} fontSize={16} fontWeight={700} fill="var(--color-text-primary)">
        TOTAL
      </text>
      <text
        x={334}
        y={354}
        textAnchor="end"
        fontFamily={MONO_STACK}
        fontSize={20}
        fontWeight={700}
        fill="var(--color-text-primary)">
        {receipt.amountLabel}
      </text>
      {/* Dashed perforation between body and tear-off stub. */}
      <line x1={8} x2={350} y1={375} y2={375} stroke="var(--color-border)" strokeDasharray="6 5" />
      <g className={filing ? 'sbl-stub-tear' : undefined}>
        <path d={RECEIPT_STUB_PATH} fill={PAPER} stroke="var(--color-border)" strokeWidth={1} />
        <text
          x={179}
          y={400}
          textAnchor="middle"
          fontFamily={MONO_STACK}
          fontSize={14}
          letterSpacing="3"
          fill="var(--color-text-secondary)">
          · RETAIN FOR RECORDS ·
        </text>
      </g>
      {/* FILED stamp — rotated −12°, 96×36 brand-stroke rect + 22/700
          letterpress text; fades/scales in 150ms during the file
          animation (scale on the outer g, rotation on the inner). */}
      {filing ? (
        <g className="sbl-stamp-in" style={{transformOrigin: '179px 205px', transformBox: 'view-box'}}>
          <g transform="rotate(-12 179 205)">
            <rect x={131} y={187} width={96} height={36} rx={4} fill="none" stroke={BRAND_ACCENT} strokeWidth={3} />
            <text
              x={179}
              y={213}
              textAnchor="middle"
              fontFamily={MONO_STACK}
              fontSize={22}
              fontWeight={700}
              letterSpacing="6"
              fill={BRAND_ACCENT}>
              FILED
            </text>
          </g>
        </g>
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// FIELD CONFIRM CHIP — 36px pill inside a 44px hit button. Low-confidence
// (unconfirmed) = warning tint + 1.4s opacity pulse (removed under reduced
// motion; the static warning fill still encodes the state). Confirmed =
// brand tint, aria-pressed. Keyed by shake seq at the call site so the
// ±4px ×3 shake restarts per rejection.
// ---------------------------------------------------------------------------

const FIELD_ICON: Record<FieldKey, typeof StoreIcon> = {
  merchant: StoreIcon,
  amount: DollarSignIcon,
  date: CalendarIcon,
  category: TagIcon,
};

interface FieldConfirmChipProps {
  receipt: ReceiptEntity;
  field: FieldKey;
  shaking: boolean;
  onTap: (field: FieldKey, opener: HTMLElement) => void;
}

function FieldConfirmChip({receipt, field, shaking, onTap}: FieldConfirmChipProps) {
  const confirmed = receipt.confirmed[field];
  const low = receipt.confidence[field] === 'low' && !confirmed;
  const value = receiptFieldValue(receipt, field);
  const chipStyle = confirmed
    ? {...styles.chip, ...styles.chipConfirmed}
    : low
      ? {...styles.chip, ...styles.chipLow}
      : styles.chip;
  return (
    <button
      type="button"
      className={\`sbl-btn sbl-focusable\${shaking ? ' sbl-shake' : ''}\`}
      style={styles.chipHit}
      aria-pressed={confirmed}
      aria-label={\`Confirm \${FIELD_META[field].label.toLowerCase()}: \${value}\${low ? ', low confidence' : confirmed ? ', confirmed' : ''}\`}
      onClick={event => onTap(field, event.currentTarget)}>
      <span style={chipStyle} className={low ? 'sbl-pulse' : undefined}>
        <span style={styles.chipGlyph} aria-hidden>
          <Icon icon={FIELD_ICON[field]} size="sm" />
        </span>
        <span style={styles.chipLabel}>{\`\${FIELD_META[field].label} · \${value}\`}</span>
        <span style={styles.chipGlyph} aria-hidden>
          <Icon icon={confirmed ? CheckIcon : low ? AlertCircleIcon : CheckIcon} size="sm" />
        </span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// RECONCILIATION BAR — 96px card. Fill width = matched/statement (46.6% at
// rest), spec-mandated 400ms width tick (instant under reduced motion).
// Contrast math per the amendment: BRAND fill #E11D48 vs white card 4.6:1
// and REST_FILL track vs card 3.6:1 — each segment ≥3:1 against its actual
// surface; fill vs track is ~1.3:1 by luminance but the segments are
// opposing hues and the boundary is not the carrier of meaning (the
// caption states both numbers).
// ---------------------------------------------------------------------------

function ReconciliationBar({matchedCents}: {matchedCents: number}) {
  const unmatchedCents = STATEMENT_TOTAL_CENTS - matchedCents;
  const pct = fmtPct(matchedCents);
  return (
    <section style={styles.reconCard} aria-label={\`\${STATEMENT_MONTH} statement reconciliation\`}>
      <div style={styles.reconHeader}>{\`\${STATEMENT_MONTH.toUpperCase()} STATEMENT · \${fmtUsd(STATEMENT_TOTAL_CENTS)}\`}</div>
      <div
        style={styles.reconTrack}
        role="img"
        aria-label={\`\${fmtUsd(matchedCents)} of \${fmtUsd(STATEMENT_TOTAL_CENTS)} matched, \${pct} percent\`}>
        <div className="sbl-recon-fill" style={{...styles.reconFill, width: \`\${pct}%\`}} />
      </div>
      <div style={styles.reconCaption}>
        <span style={styles.reconMatched}>{\`\${fmtUsd(matchedCents)} matched\`}</span>
        <span style={styles.reconUnmatched}>{\`· \${fmtUsd(unmatchedCents)} unmatched\`}</span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// DATE PANEL — inline calendar per inputControls (never a native picker):
// month header with 44×44 chevrons, weekday initials, 7-column role=grid
// with arrow-key day movement, Home/End to week edges. 2026 calendar facts
// hardcoded (no Date()); today = Jul 4 ringed.
// ---------------------------------------------------------------------------

interface DatePanelProps {
  selectedMonth: 'Jun' | 'Jul';
  selectedDay: number;
  onSelect: (month: 'Jun' | 'Jul', day: number) => void;
}

function DatePanel({selectedMonth, selectedDay, onSelect}: DatePanelProps) {
  const [monthIndex, setMonthIndex] = useState(selectedMonth === 'Jun' ? 0 : 1);
  const [focusDay, setFocusDay] = useState(selectedDay);
  const cellRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const month = DATE_MONTHS[monthIndex];

  const moveFocus = (day: number) => {
    const clamped = Math.min(Math.max(1, day), month.days);
    setFocusDay(clamped);
    cellRefs.current[clamped]?.focus();
  };

  const handleGridKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const dow = (month.firstDow + focusDay - 1) % 7;
    let next: number | null = null;
    if (event.key === 'ArrowLeft') next = focusDay - 1;
    else if (event.key === 'ArrowRight') next = focusDay + 1;
    else if (event.key === 'ArrowUp') next = focusDay - 7;
    else if (event.key === 'ArrowDown') next = focusDay + 7;
    else if (event.key === 'Home') next = focusDay - dow;
    else if (event.key === 'End') next = focusDay + (6 - dow);
    if (next != null) {
      event.preventDefault();
      moveFocus(next);
    }
  };

  const leading = Array.from({length: month.firstDow}, (_, i) => i);
  const days = Array.from({length: month.days}, (_, i) => i + 1);
  return (
    <div style={styles.datePanel}>
      <div style={styles.dpHeader}>
        <button
          type="button"
          className="sbl-btn sbl-focusable"
          style={{...styles.iconBtn, ...(monthIndex === 0 ? {opacity: 0.35} : null)}}
          aria-label="Previous month"
          disabled={monthIndex === 0}
          onClick={() => setMonthIndex(0)}>
          <Icon icon={ChevronLeftIcon} size="sm" />
        </button>
        <span style={styles.dpTitle}>{month.name}</span>
        <button
          type="button"
          className="sbl-btn sbl-focusable"
          style={{...styles.iconBtn, ...(monthIndex === 1 ? {opacity: 0.35} : null)}}
          aria-label="Next month"
          disabled={monthIndex === 1}
          onClick={() => setMonthIndex(1)}>
          <Icon icon={ChevronRightIcon} size="sm" />
        </button>
      </div>
      <div style={styles.dpWeekRow} aria-hidden>
        {WEEKDAYS.map((day, index) => (
          <span key={\`\${day}-\${index}\`}>{day}</span>
        ))}
      </div>
      <div style={styles.dpGrid} role="grid" aria-label={month.name} onKeyDown={handleGridKey}>
        {leading.map(pad => (
          <span key={\`pad-\${pad}\`} aria-hidden />
        ))}
        {days.map(day => {
          const isSelected = month.key === selectedMonth && day === selectedDay;
          const isToday = month.key === TODAY.month && day === TODAY.day;
          return (
            <button
              key={day}
              ref={node => {
                cellRefs.current[day] = node;
              }}
              type="button"
              role="gridcell"
              className="sbl-btn sbl-focusable"
              tabIndex={day === focusDay ? 0 : -1}
              aria-selected={isSelected}
              aria-label={\`\${month.name.split(' ')[0]} \${day}\`}
              style={{
                ...styles.dpCell,
                ...(isToday && !isSelected ? styles.dpCellToday : null),
                ...(isSelected ? styles.dpCellSelected : null),
              }}
              onFocus={() => setFocusDay(day)}
              onClick={() => onSelect(month.key, day)}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CONFIRM SHEET — two detents (55% / calc(100% − 56px)), 24px grabber zone
// with a clickable 36×5 pill, 52px header, scrollable body of four
// confirm groups, sticky 48px 'File receipt' footer. The footer button is
// NEVER silently disabled: while fields are unconfirmed it wears the
// muted look + a 13px --color-error reason line, and pressing it shakes
// the offending chip, scrolls the first unconfirmed group into view, and
// focuses its control. Focus moves in with {preventScroll: true} (the
// amendment — plain .focus() beaches the animating sheet mid-screen).
// ---------------------------------------------------------------------------

interface ConfirmSheetProps {
  receipt: ReceiptEntity;
  ui: UiSlice;
  onClose: () => void;
  onToggleDetent: () => void;
  onMerchantDraft: (value: string) => void;
  onMerchantBlur: (value: string) => void;
  onAmountDraft: (value: string) => void;
  onAmountBlur: (value: string) => void;
  onDateToggle: () => void;
  onDateSelect: (month: 'Jun' | 'Jul', day: number) => void;
  onCategorySelect: (category: Category) => void;
  onShake: (field: FieldKey) => void;
  onFile: () => void;
}

function ConfirmSheet(props: ConfirmSheetProps) {
  const {receipt, ui} = props;
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const groupRefs = useRef<Record<FieldKey, HTMLDivElement | null>>({merchant: null, amount: null, date: null, category: null});
  const controlRefs = useRef<Record<FieldKey, HTMLElement | null>>({merchant: null, amount: null, date: null, category: null});

  const focusField = ui.sheetFocusField;
  useEffect(() => {
    const field = focusField ?? 'merchant';
    groupRefs.current[field]?.scrollIntoView({block: 'nearest'});
    // BINDING: preventScroll — plain .focus() scroll-reveals the animating
    // sheet inside the locked overflow-hidden column.
    controlRefs.current[field]?.focus({preventScroll: true});
  }, [focusField]);

  const unconfirmed = FIELD_KEYS.filter(field => !receipt.confirmed[field]);

  const handleFilePress = () => {
    const first = unconfirmed[0];
    if (first != null) {
      props.onShake(first);
      groupRefs.current[first]?.scrollIntoView({block: 'nearest'});
      controlRefs.current[first]?.focus({preventScroll: true});
      return;
    }
    props.onFile();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      // Escape closes the topmost layer only: an expanded datePanel first.
      if (ui.dateOpen) props.onDateToggle();
      else props.onClose();
      return;
    }
    trapTabKey(event, sheetRef.current);
  };

  const tagFor = (field: FieldKey) =>
    receipt.confirmed[field] ? (
      <span style={styles.fieldConfirmedTag}>
        <Icon icon={CheckIcon} size="sm" />
        Confirmed
      </span>
    ) : receipt.confidence[field] === 'low' ? (
      <span style={styles.fieldLowTag}>
        <Icon icon={AlertCircleIcon} size="sm" />
        Low confidence
      </span>
    ) : null;

  return (
    <>
      <div style={styles.sheetScrim} onClick={props.onClose} aria-hidden />
      <div
        ref={sheetRef}
        className="sbl-sheet-in"
        style={{
          ...styles.sheet,
          height: ui.sheetDetent === 'medium' ? '55%' : 'calc(100% - 56px)',
        }}
        role="dialog"
        aria-modal
        aria-labelledby="sbl-sheet-title"
        onKeyDown={handleKeyDown}>
        <div style={styles.grabberZone}>
          <button
            type="button"
            className="sbl-btn sbl-focusable"
            style={{padding: 8, borderRadius: 8, display: 'grid', placeItems: 'center'}}
            aria-label={ui.sheetDetent === 'medium' ? 'Resize sheet larger' : 'Resize sheet smaller'}
            onClick={props.onToggleDetent}>
            <span style={styles.grabberPill} />
          </button>
        </div>
        <div style={styles.sheetHeader}>
          <span />
          <h2 id="sbl-sheet-title" style={styles.sheetTitle}>
            Confirm fields
          </h2>
          <button
            type="button"
            className="sbl-btn sbl-focusable"
            style={styles.iconBtn}
            aria-label="Close"
            onClick={props.onClose}>
            <Icon icon={XIcon} size="sm" />
          </button>
        </div>
        <div style={styles.sheetBody}>
          {/* Merchant — 48px text input; validation on blur, error clears
              the moment the value becomes valid while typing. */}
          <div
            ref={node => {
              groupRefs.current.merchant = node;
            }}
            style={styles.fieldGroup}>
            <label htmlFor="sbl-merchant" style={styles.fieldLabelRow}>
              Merchant {tagFor('merchant')}
            </label>
            <input
              id="sbl-merchant"
              ref={node => {
                controlRefs.current.merchant = node;
              }}
              className="sbl-input"
              style={styles.textInput}
              type="text"
              value={ui.draftMerchant ?? receipt.merchant}
              aria-invalid={ui.merchantError || undefined}
              aria-describedby={ui.merchantError ? 'sbl-merchant-error' : undefined}
              onChange={event => props.onMerchantDraft(event.target.value)}
              onBlur={event => props.onMerchantBlur(event.target.value)}
            />
            {ui.merchantError ? (
              <span id="sbl-merchant-error" style={styles.fieldError}>
                <Icon icon={AlertCircleIcon} size="sm" />
                Enter the merchant name
              </span>
            ) : null}
          </div>
          {/* Amount — inputMode decimal, honest type. */}
          <div
            ref={node => {
              groupRefs.current.amount = node;
            }}
            style={styles.fieldGroup}>
            <label htmlFor="sbl-amount" style={styles.fieldLabelRow}>
              Amount {tagFor('amount')}
            </label>
            <input
              id="sbl-amount"
              ref={node => {
                controlRefs.current.amount = node;
              }}
              className="sbl-input"
              style={styles.textInput}
              type="text"
              inputMode="decimal"
              value={ui.draftAmount ?? receipt.amountLabel}
              aria-invalid={ui.amountError || undefined}
              aria-describedby={ui.amountError ? 'sbl-amount-error' : undefined}
              onChange={event => props.onAmountDraft(event.target.value)}
              onBlur={event => props.onAmountBlur(event.target.value)}
            />
            {ui.amountError ? (
              <span id="sbl-amount-error" style={styles.fieldError}>
                <Icon icon={AlertCircleIcon} size="sm" />
                Enter an amount like 67.13
              </span>
            ) : null}
          </div>
          {/* Date — 44px utility row whose pill expands the inline panel. */}
          <div
            ref={node => {
              groupRefs.current.date = node;
            }}
            style={styles.fieldGroup}>
            <span style={styles.fieldLabelRow}>Date {tagFor('date')}</span>
            <div style={styles.dateRow}>
              <span style={{fontSize: 16}}>Receipt date</span>
              <button
                type="button"
                ref={node => {
                  controlRefs.current.date = node;
                }}
                className="sbl-btn sbl-focusable"
                style={styles.datePill}
                aria-expanded={ui.dateOpen}
                aria-label={\`Receipt date, \${receipt.dateLabel}, 2026\`}
                onClick={props.onDateToggle}>
                {\`\${receipt.dateLabel}, 2026\`}
              </button>
            </div>
            {ui.dateOpen ? (
              <DatePanel
                selectedMonth={receipt.dateMonth}
                selectedDay={receipt.dateDay}
                onSelect={props.onDateSelect}
              />
            ) : null}
          </div>
          {/* Category — 8px-gap chip grid. */}
          <div
            ref={node => {
              groupRefs.current.category = node;
            }}
            style={styles.fieldGroup}>
            <span style={styles.fieldLabelRow}>Category {tagFor('category')}</span>
            <div style={styles.catGrid}>
              {CATEGORIES.map((category, index) => {
                const selected = receipt.confirmed.category && receipt.category === category;
                return (
                  <button
                    key={category}
                    type="button"
                    ref={node => {
                      if (index === 0) controlRefs.current.category = node;
                    }}
                    className="sbl-btn sbl-focusable"
                    style={styles.chipHit}
                    aria-pressed={selected}
                    onClick={() => props.onCategorySelect(category)}>
                    <span style={selected ? {...styles.chip, ...styles.chipConfirmed} : styles.chip}>
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div style={styles.sheetFooter}>
          {unconfirmed.length > 0 ? (
            <div id="sbl-file-reason" style={styles.footerReason}>
              {unconfirmed.length === 1 ? '1 field unconfirmed' : \`\${unconfirmed.length} fields unconfirmed\`}
            </div>
          ) : null}
          <button
            type="button"
            className="sbl-btn sbl-focusable"
            style={unconfirmed.length > 0 ? {...styles.fileBtn, ...styles.fileBtnMuted} : styles.fileBtn}
            aria-describedby={unconfirmed.length > 0 ? 'sbl-file-reason' : undefined}
            onClick={handleFilePress}>
            {\`File receipt · \${receipt.amountLabel}\`}
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// INBOX STACK — 452px container; top ThermalReceipt draggable via
// pointerdown/move/up (translateY only, transient deltas stay in local
// refs/state). Release above −110px with all chips confirmed files;
// release with unconfirmed chips shakes + flashes the offender; short
// release springs back (200ms transform, instant under reduced motion).
// Visible button paths: sheet footer 'File receipt' + the card's 44×44
// ellipsis menu ('File receipt' / destructive 'Discard receipt' last).
// ---------------------------------------------------------------------------

const SWIPE_FILE_THRESHOLD = -110;

interface InboxStackProps {
  receipt: ReceiptEntity;
  behindCount: number;
  filing: boolean;
  highlightField: FieldKey | null;
  flash: {field: FieldKey; seq: number} | null;
  menuOpen: boolean;
  onMenuToggle: (opener: HTMLElement) => void;
  onMenuClose: () => void;
  onMenuFile: () => void;
  onMenuDiscard: () => void;
  onSwipeRelease: (deltaY: number) => void;
  onFileAnimationEnd: () => void;
}

function InboxStack(props: InboxStackProps) {
  const {receipt, behindCount, filing} = props;
  const [dragY, setDragY] = useState(0);
  const dragRef = useRef<{pointerId: number; startY: number} | null>(null);
  // Latest delta lives in a ref — the pointerup handler must not read a
  // stale render closure (rerender-use-ref-transient-values).
  const lastDeltaRef = useRef(0);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (filing) return;
    dragRef.current = {pointerId: event.pointerId, startY: event.clientY};
    lastDeltaRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag == null || drag.pointerId !== event.pointerId) return;
    const delta = event.clientY - drag.startY;
    // Upward drag tracks 1:1 (clamped); downward is elastic.
    const next = delta < 0 ? Math.max(delta, -180) : Math.min(12, delta * 0.2);
    lastDeltaRef.current = next;
    setDragY(next);
  };
  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag == null || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const released = lastDeltaRef.current;
    lastDeltaRef.current = 0;
    setDragY(0);
    props.onSwipeRelease(released);
  };

  const isDragging = dragRef.current != null;
  return (
    <div style={styles.inboxStack}>
      {behindCount >= 2 ? (
        <div
          style={{
            ...styles.ghostCard,
            transform: 'translateY(32px) scale(0.92)',
            transformOrigin: '50% 100%',
            opacity: 0.35,
            zIndex: 0,
          }}
          aria-hidden>
          <span style={styles.ghostLabel}>{\`\${behindCount} more behind\`}</span>
        </div>
      ) : null}
      {behindCount >= 1 ? (
        <div
          style={{
            ...styles.ghostCard,
            transform: 'translateY(16px) scale(0.96)',
            transformOrigin: '50% 100%',
            opacity: 0.6,
            zIndex: 1,
          }}
          aria-hidden>
          {behindCount === 1 ? <span style={styles.ghostLabel}>1 more behind</span> : null}
        </div>
      ) : null}
      <div
        className={\`\${isDragging ? '' : 'sbl-anim'}\${filing ? ' sbl-file-out' : ''}\`}
        style={{
          ...styles.receiptWrap,
          zIndex: 2,
          transform: dragY !== 0 ? \`translateY(\${dragY}px)\` : undefined,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onAnimationEnd={event => {
          if (event.animationName === 'sbl-file-out') props.onFileAnimationEnd();
        }}>
        <ThermalReceipt
          receipt={receipt}
          highlightField={props.highlightField}
          flash={props.flash}
          filing={filing}
        />
        <button
          type="button"
          className="sbl-btn sbl-focusable"
          style={styles.moreBtn}
          data-sbl-menu
          aria-label={\`Receipt actions for \${receipt.merchant}\`}
          aria-expanded={props.menuOpen}
          onPointerDown={event => event.stopPropagation()}
          onClick={event => props.onMenuToggle(event.currentTarget)}>
          <Icon icon={MoreHorizontalIcon} size="sm" />
        </button>
      </div>
      {props.menuOpen ? (
        <div
          style={styles.anchoredMenu}
          role="menu"
          data-sbl-menu
          aria-label="Receipt actions"
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              props.onMenuClose();
            }
          }}>
          <button type="button" className="sbl-btn sbl-focusable" style={styles.menuRow} role="menuitem" onClick={props.onMenuFile}>
            <Icon icon={CheckIcon} size="sm" />
            File receipt
          </button>
          <div style={styles.menuDivider} />
          {/* Destructive verb: LAST, behind this one intent step — never
              bottom-right; executes immediately + Undo (undoOverConfirm). */}
          <button
            type="button"
            className="sbl-btn sbl-focusable"
            style={{...styles.menuRow, ...styles.menuRowDanger}}
            role="menuitem"
            onClick={props.onMenuDiscard}>
            <Icon icon={XIcon} size="sm" />
            Discard receipt
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FILED LIST CARD — 60px two-line rows (whole row = one button named by
// merchant), dividers inset 16, last row none. While refreshing it renders
// 3 skeleton rows at the SAME 60px geometry (deterministic widths
// 60/45/70 + 40/55/30) so resolution causes zero layout shift.
// ---------------------------------------------------------------------------

interface FiledListCardProps {
  ids: string[];
  byId: Record<string, ReceiptEntity>;
  refreshing: boolean;
  onRowTap: (id: string) => void;
}

function FiledListCard({ids, byId, refreshing, onRowTap}: FiledListCardProps) {
  if (refreshing) {
    return (
      <div style={styles.listCard} aria-busy>
        {SKELETON_WIDTHS.map(([primary, secondary], index) => (
          <div key={primary}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <div
              style={{...styles.row60, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 8}}
              aria-hidden>
              <div style={{...styles.skelBar, width: \`\${primary}%\`}} />
              <div style={{...styles.skelBar, width: \`\${secondary}%\`}} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={styles.listCard}>
      {ids.map((id, index) => {
        const receipt = byId[id];
        return (
          <div key={id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <button
              type="button"
              className="sbl-btn sbl-focusable"
              style={styles.row60}
              aria-label={receipt.merchant}
              onClick={() => onRowTap(id)}>
              <span style={styles.rowText}>
                <span style={styles.rowPrimary}>{receipt.merchant}</span>
                <span style={styles.rowSecondary}>{\`\${receipt.dateLabel} · \${receipt.category}\`}</span>
              </span>
              <span style={styles.rowAmount}>{receipt.amountLabel}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Shoebill Receipt Inbox. ONE state owner (useInboxStore); every
// surface derives from it and every mutation's consequences fan out from
// one dispatch.
// ---------------------------------------------------------------------------

const TAB_META: Array<{id: Tab; label: string; icon: typeof InboxIcon}> = [
  {id: 'inbox', label: 'Inbox', icon: InboxIcon},
  {id: 'filed', label: 'Filed', icon: FolderCheckIcon},
  {id: 'reports', label: 'Reports', icon: BarChart3Icon},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
];

const TAB_TITLE: Record<Tab, string> = {
  inbox: 'Inbox',
  filed: 'Filed',
  reports: 'Reports',
  settings: 'Settings',
};

const FILTER_LABEL: Record<FilterId, string> = {
  all: 'All',
  low: 'Low confidence',
  week: 'This week',
};

const SETTINGS_ROWS: Array<{key: keyof UiSlice['settings']; label: string}> = [
  {key: 'autoExtract', label: 'Auto-extract new receipts'},
  {key: 'weeklyDigest', label: 'Weekly digest email'},
  {key: 'lowConfidenceAlerts', label: 'Low-confidence alerts'},
];

export default function MobileReceiptInboxPage() {
  const {state, update, dispatch} = useInboxStore();
  const stateRef = useRef(state);
  stateRef.current = state;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const seqRef = useRef(1);
  const scrollByTabRef = useRef<Record<Tab, number>>({inbox: 0, filed: 0, reports: 0, settings: 0});
  const pendingScrollTabRef = useRef<Tab | null>(null);
  const wasSheetOpenRef = useRef(false);

  const width = useElementWidth(wrapRef);
  const isDesktop = width >= 720;

  const {receipts, ui} = state;
  const nextSeq = () => seqRef.current++;

  // ---- Derivations: every aggregate derives live from the receipt map. ----
  const unfiledIds = useMemo(
    () => receipts.inboxOrder.filter(id => receipts.byId[id].status === 'unfiled'),
    [receipts],
  );
  const lowIds = useMemo(
    () =>
      unfiledIds.filter(id =>
        FIELD_KEYS.some(
          field => receipts.byId[id].confidence[field] === 'low' && !receipts.byId[id].confirmed[field],
        ),
      ),
    [unfiledIds, receipts],
  );
  const weekIds = useMemo(() => unfiledIds.filter(id => receipts.byId[id].thisWeek), [unfiledIds, receipts]);
  const filteredIds = ui.filter === 'all' ? unfiledIds : ui.filter === 'low' ? lowIds : weekIds;
  const topId = filteredIds[0] ?? null;
  const topReceipt = topId == null ? null : receipts.byId[topId];
  const filedIds = receipts.filedOrder.filter(id => receipts.byId[id].status === 'filed');
  const matchedCents = filedIds.reduce((sum, id) => sum + receipts.byId[id].amountCents, 0);
  const categoryRows = CATEGORIES.map(category => {
    const rows = filedIds.filter(id => receipts.byId[id].category === category);
    return {category, count: rows.length, cents: rows.reduce((sum, id) => sum + receipts.byId[id].amountCents, 0)};
  }).filter(row => row.count > 0);

  // ---- Actions (all through the one owner). ----
  const toastPatch = (text: string, undoable = false) => ({toast: {seq: nextSeq(), text, undoable}});

  const openSheet = (field: FieldKey | null, opener: HTMLElement | null, withFlash: boolean) => {
    if (opener != null) openerRef.current = opener;
    update('ui', {
      sheetOpen: true,
      sheetDetent: 'medium',
      sheetFocusField: field,
      dateOpen: field === 'date',
      menuOpen: false,
      ...(withFlash && field != null ? {flash: {field, seq: nextSeq()}} : null),
    });
  };

  const closeSheet = () => {
    update('ui', {sheetOpen: false, dateOpen: false, sheetFocusField: null, draftMerchant: null, draftAmount: null, merchantError: false, amountError: false});
  };

  // Restore focus to the opener on every sheet close path.
  useEffect(() => {
    if (wasSheetOpenRef.current && !ui.sheetOpen && openerRef.current != null) {
      openerRef.current.focus();
      openerRef.current = null;
    }
    wasSheetOpenRef.current = ui.sheetOpen;
  }, [ui.sheetOpen]);

  const patchReceipt = (id: string, patch: Partial<ReceiptEntity>) => {
    const prev = stateRef.current.receipts;
    update('receipts', {byId: {...prev.byId, [id]: {...prev.byId[id], ...patch}}});
  };

  const confirmField = (id: string, field: FieldKey, patch: Partial<ReceiptEntity>) => {
    const prev = stateRef.current.receipts.byId[id];
    patchReceipt(id, {...patch, confirmed: {...prev.confirmed, [field]: true}});
  };

  const commitFile = (id: string) => {
    const prevReceipts = stateRef.current.receipts;
    const receipt = prevReceipts.byId[id];
    // ONE dispatch: stack, badge, filed list, recon fill, Reports row, and
    // the Undo toast all fan out from this single state change.
    dispatch({
      receipts: {
        byId: {...prevReceipts.byId, [id]: {...receipt, status: 'filed'}},
        filedOrder: [id, ...prevReceipts.filedOrder],
      },
      ui: {
        filingId: null,
        sheetOpen: false,
        dateOpen: false,
        sheetFocusField: null,
        menuOpen: false,
        draftMerchant: null,
        draftAmount: null,
        merchantError: false,
        amountError: false,
        ...toastPatch(\`Receipt filed · \${receipt.amountLabel}\`, true),
      },
      history: {receipts: prevReceipts},
    });
  };

  const startFiling = (id: string) => {
    // The FILED stamp + tear play as CSS animations; commit happens on
    // animationend (1ms duration under reduced motion, so it still fires —
    // event-driven, never a timer).
    update('ui', {filingId: id, sheetOpen: false, dateOpen: false, sheetFocusField: null, menuOpen: false});
  };

  const requestFile = (id: string, opener: HTMLElement | null) => {
    const receipt = stateRef.current.receipts.byId[id];
    const first = FIELD_KEYS.find(field => !receipt.confirmed[field]);
    if (first != null) {
      // Submit is never silently dead: open the sheet at the offender,
      // shake its chip, flash its receipt region.
      if (opener != null) openerRef.current = opener;
      update('ui', {
        sheetOpen: true,
        sheetDetent: 'medium',
        sheetFocusField: first,
        dateOpen: first === 'date',
        menuOpen: false,
        shake: {field: first, seq: nextSeq()},
        flash: {field: first, seq: nextSeq()},
      });
      return;
    }
    startFiling(id);
  };

  const discardReceipt = (id: string) => {
    const prevReceipts = stateRef.current.receipts;
    const receipt = prevReceipts.byId[id];
    // undoOverConfirm: executes immediately, Undo in the toast — no alert.
    dispatch({
      receipts: {byId: {...prevReceipts.byId, [id]: {...receipt, status: 'discarded'}}},
      ui: {menuOpen: false, sheetOpen: false, dateOpen: false, sheetFocusField: null, ...toastPatch(\`Receipt discarded · \${receipt.merchant}\`, true)},
      history: {receipts: prevReceipts},
    });
  };

  const undo = () => {
    const snapshot = stateRef.current.history;
    if (snapshot == null) return;
    // One dispatch restores the exact prior state — stack order, badge,
    // recon math, and Reports rows together (stress fixture g).
    dispatch({receipts: snapshot.receipts, ui: toastPatch('Restored'), history: null});
  };

  const handleSwipeRelease = (deltaY: number) => {
    if (topId == null) return;
    if (deltaY > SWIPE_FILE_THRESHOLD) return; // short drag: spring-back only
    const receipt = stateRef.current.receipts.byId[topId];
    const first = FIELD_KEYS.find(field => !receipt.confirmed[field]);
    if (first != null) {
      // Bounce + shake the offending chip + flash its receipt region.
      update('ui', {shake: {field: first, seq: nextSeq()}, flash: {field: first, seq: nextSeq()}});
      return;
    }
    startFiling(topId);
  };

  const switchTab = (tab: Tab) => {
    const scroller = getScrollParent(shellRef.current);
    const current = stateRef.current.ui.tab;
    if (tab === current) {
      // The one legal reset: re-tapping the active tab scrolls to top.
      scroller?.scrollTo({top: 0});
      return;
    }
    if (scroller != null) scrollByTabRef.current[current] = scroller.scrollTop;
    pendingScrollTabRef.current = tab;
    // Per-tab state persists (filter, drafts, scroll); only open overlays
    // close on a tab switch.
    update('ui', {tab, sheetOpen: false, dateOpen: false, sheetFocusField: null, menuOpen: false});
  };

  useEffect(() => {
    const tab = pendingScrollTabRef.current;
    if (tab != null && tab === ui.tab) {
      const scroller = getScrollParent(shellRef.current);
      scroller?.scrollTo({top: scrollByTabRef.current[tab] ?? 0});
      pendingScrollTabRef.current = null;
    }
  }, [ui.tab]);

  const handleRefresh = () => {
    update('ui', {refreshing: true, refreshed: false});
  };
  // Deterministic skeleton resolution: the NEXT user tap anywhere resolves
  // the refresh (never a timer). The same capture pass closes an open
  // anchored menu on outside taps (tap-elsewhere-closes law) — target
  // check keeps the menu's own rows clickable.
  const handleShellPointerDownCapture = (event: {target: EventTarget | null}) => {
    if (stateRef.current.ui.refreshing) {
      update('ui', {refreshing: false, refreshed: true, ...toastPatch('Updated just now')});
    }
    if (
      stateRef.current.ui.menuOpen &&
      !(event.target instanceof HTMLElement && event.target.closest('[data-sbl-menu]') != null)
    ) {
      update('ui', {menuOpen: false});
    }
  };

  const scrollToTop = () => {
    getScrollParent(shellRef.current)?.scrollTo({top: 0});
  };

  // ---- Screen fragments. ----
  const filterChips = (
    <nav className="sbl-chiprail" style={styles.chipFilterRow} aria-label="Inbox filters">
      {(
        [
          {id: 'all' as FilterId, count: unfiledIds.length},
          {id: 'low' as FilterId, count: lowIds.length},
          {id: 'week' as FilterId, count: weekIds.length},
        ]
      ).map(({id, count}) => {
        const active = ui.filter === id;
        return (
          <button
            key={id}
            type="button"
            className="sbl-btn sbl-focusable"
            style={styles.filterChipHit}
            aria-pressed={active}
            onClick={() => update('ui', {filter: id})}>
            <span style={active ? {...styles.filterChip, ...styles.filterChipOn} : styles.filterChip}>
              {\`\${FILTER_LABEL[id]} \${count}\`}
            </span>
          </button>
        );
      })}
    </nav>
  );

  const inboxEmpty =
    unfiledIds.length === 0 ? (
      <div style={styles.emptyState}>
        <span style={styles.emptyCircle}>
          <Icon icon={InboxIcon} size="md" />
        </span>
        <h2 style={styles.emptyTitle}>Inbox zero</h2>
        <p style={{...styles.emptyBody, marginBottom: 0}}>Receipts you forward appear here.</p>
      </div>
    ) : (
      <div style={styles.emptyState}>
        <span style={styles.emptyCircle}>
          <Icon icon={SearchXIcon} size="md" />
        </span>
        <h2 style={styles.emptyTitle}>{\`No receipts for “\${FILTER_LABEL[ui.filter]}”\`}</h2>
        <p style={styles.emptyBody}>Receipts outside this filter are still in your inbox.</p>
        <button
          type="button"
          className="sbl-btn sbl-focusable"
          style={styles.emptyAction}
          onClick={() => update('ui', {filter: 'all'})}>
          Clear filter
        </button>
      </div>
    );

  const filedSection = (
    <>
      <h2 style={styles.sectionHeader}>{\`FILED THIS MONTH · \${filedIds.length}\`}</h2>
      {ui.refreshed && !ui.refreshing ? (
        <div style={{...styles.terminalCaption, marginTop: 0, marginBottom: 8}}>Updated just now</div>
      ) : null}
      <FiledListCard
        ids={filedIds}
        byId={receipts.byId}
        refreshing={ui.refreshing}
        onRowTap={id => {
          const receipt = receipts.byId[id];
          update('ui', toastPatch(\`\${receipt.merchant} · \${receipt.amountLabel} · Filed \${receipt.dateLabel}\`));
        }}
      />
      <div style={styles.terminalCaption}>{\`All \${filedIds.length} filed receipts\`}</div>
    </>
  );

  const inboxScreen = (
    <>
      {filterChips}
      <div style={styles.stackSection}>
        {topReceipt != null ? (
          <>
            <InboxStack
              receipt={topReceipt}
              behindCount={filteredIds.length - 1}
              filing={ui.filingId === topReceipt.id}
              highlightField={ui.sheetOpen ? ui.sheetFocusField : null}
              flash={ui.flash}
              menuOpen={ui.menuOpen}
              onMenuToggle={opener => {
                openerRef.current = opener;
                update('ui', {menuOpen: !stateRef.current.ui.menuOpen});
              }}
              onMenuClose={() => update('ui', {menuOpen: false})}
              onMenuFile={() => requestFile(topReceipt.id, openerRef.current)}
              onMenuDiscard={() => discardReceipt(topReceipt.id)}
              onSwipeRelease={handleSwipeRelease}
              onFileAnimationEnd={() => {
                if (stateRef.current.ui.filingId != null) commitFile(stateRef.current.ui.filingId);
              }}
            />
            <div style={styles.chipDock}>
              {FIELD_KEYS.map(field => (
                <FieldConfirmChip
                  key={\`\${field}:\${ui.shake?.field === field ? ui.shake.seq : 0}\`}
                  receipt={topReceipt}
                  field={field}
                  shaking={ui.shake?.field === field}
                  onTap={(tapped, opener) => openSheet(tapped, opener, true)}
                />
              ))}
              <button
                type="button"
                className="sbl-btn sbl-focusable"
                style={styles.chipHit}
                onClick={event => openSheet(null, event.currentTarget, false)}>
                <span style={styles.detailsBtn}>Details</span>
              </button>
            </div>
          </>
        ) : (
          inboxEmpty
        )}
      </div>
      <ReconciliationBar matchedCents={matchedCents} />
      {filedSection}
    </>
  );

  const filedScreen = <>{filedSection}</>;

  const reportsScreen = (
    <>
      <h2 style={styles.sectionHeader}>{\`BY CATEGORY · \${STATEMENT_MONTH.toUpperCase()}\`}</h2>
      <div style={styles.listCard}>
        {categoryRows.map((row, index) => (
          <div key={row.category}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <button
              type="button"
              className="sbl-btn sbl-focusable"
              style={styles.row60}
              aria-label={\`\${row.category}, \${fmtUsd(row.cents)}\`}
              onClick={() => switchTab('filed')}>
              <span style={{...styles.reportSwatch, background: CATEGORY_COLOR[row.category]}} aria-hidden />
              <span style={styles.rowText}>
                <span style={styles.rowPrimary}>{row.category}</span>
                <span style={styles.rowSecondary}>
                  {row.count === 1 ? '1 receipt' : \`\${row.count} receipts\`}
                </span>
              </span>
              <span style={styles.rowAmount}>{fmtUsd(row.cents)}</span>
            </button>
          </div>
        ))}
        <div style={styles.rowDivider} />
        <div style={{...styles.row60, height: 44}}>
          <span style={{...styles.rowPrimary, flex: 1, fontWeight: 600}}>Matched total</span>
          <span style={{...styles.rowAmount, fontWeight: 600}}>{fmtUsd(matchedCents)}</span>
        </div>
      </div>
      <div style={{height: 24}} />
      <ReconciliationBar matchedCents={matchedCents} />
    </>
  );

  const settingsScreen = (
    <>
      <h2 style={styles.sectionHeader}>PREFERENCES</h2>
      <div style={styles.listCard}>
        {SETTINGS_ROWS.map((row, index) => {
          const on = ui.settings[row.key];
          return (
            <div key={row.key}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              {/* Whole 44px row IS the switch (role=switch, aria-checked). */}
              <button
                type="button"
                className="sbl-btn sbl-focusable"
                style={styles.settingsRow}
                role="switch"
                aria-checked={on}
                onClick={() =>
                  update('ui', {settings: {...stateRef.current.ui.settings, [row.key]: !on}})
                }>
                <span style={styles.settingsLabel}>{row.label}</span>
                <span style={on ? {...styles.switchTrack, ...styles.switchTrackOn} : styles.switchTrack} aria-hidden>
                  <span className="sbl-anim" style={on ? {...styles.switchThumb, ...styles.switchThumbOn} : styles.switchThumb} />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );

  const screenBody =
    ui.tab === 'inbox' ? inboxScreen : ui.tab === 'filed' ? filedScreen : ui.tab === 'reports' ? reportsScreen : settingsScreen;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SBL_CSS}</style>
      <div
        ref={shellRef}
        style={{
          ...styles.shell,
          ...(ui.sheetOpen ? styles.shellLocked : null),
          ...(isDesktop ? styles.shellDesktop : null),
        }}
        onPointerDownCapture={handleShellPointerDownCapture}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="sbl-btn sbl-focusable"
              style={styles.brandBtn}
              aria-label="Shoebill"
              onClick={scrollToTop}>
              <ShoebillMark />
            </button>
          </div>
          <h1 style={styles.navTitle}>{TAB_TITLE[ui.tab]}</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="sbl-btn sbl-focusable"
              style={styles.iconBtn}
              aria-label="Refresh receipts"
              onClick={handleRefresh}>
              <Icon icon={RefreshCwIcon} size="sm" />
            </button>
          </div>
        </header>
        <main style={styles.main}>{screenBody}</main>
        {/* THE one polite live region — sticky-in-flow above the tabBar;
            shell-absolute only while the sheet scroll-locks the shell. */}
        <div style={ui.sheetOpen ? styles.toastAnchorLocked : styles.toastAnchor} aria-live="polite" role="status">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast}>
              <span style={styles.toastText}>{ui.toast.text}</span>
              {ui.toast.undoable ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="sbl-btn sbl-focusable" style={styles.toastUndo} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        <nav
          style={styles.tabBar}
          aria-label="Tabs"
          onKeyDown={event => {
            // Keyboard parity: arrow keys move between tab buttons.
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
            const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
            const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
            if (index === -1) return;
            event.preventDefault();
            const next = event.key === 'ArrowLeft' ? Math.max(0, index - 1) : Math.min(buttons.length - 1, index + 1);
            buttons[next].focus();
          }}>
          {TAB_META.map(tab => {
            const active = ui.tab === tab.id;
            const badge = tab.id === 'inbox' && unfiledIds.length > 0 ? unfiledIds.length : null;
            return (
              <button
                key={tab.id}
                type="button"
                className="sbl-btn sbl-focusable"
                style={active ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                aria-current={active ? 'page' : undefined}
                aria-label={badge != null ? \`\${tab.label}, \${badge} unfiled\` : tab.label}
                onClick={() => switchTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" />
                  {badge != null ? <span style={styles.tabBadge}>{badge}</span> : null}
                </span>
                <span style={active ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
        {ui.sheetOpen && topReceipt != null ? (
          <ConfirmSheet
            receipt={topReceipt}
            ui={ui}
            onClose={closeSheet}
            onToggleDetent={() =>
              update('ui', {sheetDetent: stateRef.current.ui.sheetDetent === 'medium' ? 'large' : 'medium'})
            }
            onMerchantDraft={value => {
              // Error clears the moment the value becomes valid while typing.
              update('ui', {
                draftMerchant: value,
                ...(stateRef.current.ui.merchantError && value.trim().length > 0 ? {merchantError: false} : null),
              });
            }}
            onMerchantBlur={value => {
              const trimmed = value.trim();
              if (trimmed.length === 0) {
                update('ui', {merchantError: true});
                return;
              }
              confirmField(topReceipt.id, 'merchant', {merchant: trimmed});
              update('ui', {draftMerchant: null, merchantError: false});
            }}
            onAmountDraft={value => {
              update('ui', {
                draftAmount: value,
                ...(stateRef.current.ui.amountError && parseAmount(value) != null ? {amountError: false} : null),
              });
            }}
            onAmountBlur={value => {
              const cents = parseAmount(value);
              if (cents == null) {
                update('ui', {amountError: true});
                return;
              }
              confirmField(topReceipt.id, 'amount', {amountCents: cents, amountLabel: fmtUsd(cents)});
              update('ui', {draftAmount: null, amountError: false});
            }}
            onDateToggle={() => update('ui', {dateOpen: !stateRef.current.ui.dateOpen})}
            onDateSelect={(month, day) => {
              confirmField(topReceipt.id, 'date', {
                dateMonth: month,
                dateDay: day,
                dateLabel: \`\${month} \${day}\`,
              });
              update('ui', {dateOpen: false});
            }}
            onCategorySelect={category => {
              confirmField(topReceipt.id, 'category', {category});
            }}
            onShake={field => update('ui', {shake: {field, seq: nextSeq()}, flash: {field, seq: nextSeq()}})}
            onFile={() => startFiling(topReceipt.id)}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};