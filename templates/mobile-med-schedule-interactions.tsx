// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Dovetail Rx medication day frozen
 *   at NOW_MIN 760 ('12:40 PM', Fri Jul 4): 8 meds in the cabinet summing to
 *   exactly 286 pills (12+30+45+60+18+24+90+7; only Melatonin ≤10 → '1 low'),
 *   9 doses today (Morning 3 taken — Levothyroxine 7:02, Metformin 8:05,
 *   Sertraline 8:05 — Noon 3 + Evening 2 + Night 1 pending; 3/9 = ring 33%),
 *   3 monitored interaction pairs (Ibuprofen×Lisinopril MAJOR same-slot
 *   ACTIVE, Calcium×Ferrous ≥2 h spacing ACTIVE, Calcium×Levothyroxine ≥4 h
 *   spacing SATISFIED at gap 750−422 = 328 min = 5 h 28 m), and a 7-day
 *   history ledger 9+9+8+9+8+9+8 = 60 of 63 = 95%. No Date.now(), no
 *   Math.random(), no network media.
 * @output Dovetail Rx — Med Schedule & Interaction Untangler: a 390px MOBILE
 *   4-tab surface where drug interactions are SPATIAL. Today draws the Noon
 *   card's Ibuprofen↔Lisinopril conflict as an amber cubic-bezier tether
 *   along the card's leading edge (SVG aria-hidden; its accessible twin is
 *   the 36px conflict footer row); Interactions heats an 8×8 horizontal-snap
 *   InteractionMatrix (422px rail, sticky code column, 44px gridcells);
 *   SpacingTimerChips count gap rules off the frozen clock. One
 *   scheduleStore owns everything: long-press-dragging (or menu-moving)
 *   Ibuprofen out of Noon dissolves the tether (240ms dash-out), decrements
 *   the Interactions badge 2→1, cools the IB×LS matrix cell amber→green,
 *   recomputes the iron chip, and fills the navBar AdherenceRing — every
 *   mutation toasts with a real Undo that pops an exact snapshot.
 * @position Page template; emitted by `astryx template mobile-med-schedule-interactions`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first pixel).
 *   All overlays (scrim, sheet, actionSheet, dragGhost) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   sheet or actionSheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close; the toastDock is
 *   STICKY-IN-FLOW (bottom:76 above the 64px tabBar) and flips to
 *   shell-absolute bottom:76 ONLY for the scroll-locked duration.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   --color-border, hairline rowDividers inset 16, none on last row); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Dovetail Rx blue #2E6BE6 — the demo's --color-brand is
 *   the demo logo blue, so the spec hex is quarantined here per house
 *   rule). Sanctioned non-brand literals, each with contrast math at the
 *   declaration: CONFLICT_AMBER + AMBER_CELL_BG, SAFE_GREEN +
 *   GREEN_CELL_BG, REST_RING (interactive rest-state circle boundary ≥3:1
 *   vs the card per the foundations amendment), and the scrim pair.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', blur color-mix 86%, hairline
 *   ALWAYS ON — noted choice, scroll-under not wired); tabBar 64px sticky
 *   bottom z20 (4 tabItems flex:1, 24px icon / 11px 500 label / 4px gap);
 *   dose rows 44px single-line (16px/500 name ellipsized · trailing 13px
 *   tabular time · status affordance); cabinet/pair/day rows 60px
 *   two-line; sectionHeader 13px/600 uppercase 0.06em at 32px from the
 *   stage edge, 20px top / 8px bottom; Noon card adds a 36px conflict
 *   footer row (the tether's button path); matrix gridcells 44×44 with
 *   2px gaps in a 422px rail (54px sticky code column + 2px gap + 8×44 +
 *   7×2); sheet detents 55% / calc(100% − 56px), 24px grabber zone with
 *   36×5 pill, 52px sheet header; buttons 48px primary in sheet footer /
 *   36px secondary / 44×44 icon. TYPE (Figtree via --font-family-body):
 *   17/600 nav + sheet titles · 16/400–500 row primary (16 is the floor) ·
 *   13/400 meta · 11/500 tab labels, badges, matrix codes; nothing under
 *   11px; tabular-nums on every counter, timer, and gap readout.
 *   VERTICAL BUDGET Today @390 (cross-checked): navBar 52 + [Morning 41
 *   hdr + 134 card (3×44+2 hairlines)] + [Noon 41 + 171 card
 *   (3×44+2+36 conflict row+1 hairline)] + [Evening 41 + 89 (2×44+1)] +
 *   [Night 41 + 44] + 24 tail + tabBar 64 = 742px natural flow; the demo
 *   page scrolls, shell never does.
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal shell overflow (overflowX:'clip' is
 *   backstop only): all widths 100%/flex — no 390 literals. Dose-row name
 *   flex:1 minWidth:0 ellipsis against a fixed-intrinsic trailing cluster
 *   (13px tabular time + chip + status circle + 44px ellipsis button).
 *   SpacingTimerChip drops its label to an icon-only pill below 360px
 *   container width (aria-label keeps the full text). InteractionMatrix
 *   rail is 422px fixed → scrolls with a legal ≥24px peek at every stage
 *   width (320−32 = 288 visible → 134 peek; 430−32 = 398 → 24 exactly).
 *   Tether SVG uses row-index math (45·i+22 centers, x within the 16px
 *   card padding) so curves never clip at 320.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout; the anatomy is
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
  ArchiveIcon,
  BanIcon,
  CalendarCheckIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  GitCompareArrowsIcon,
  LockIcon,
  MoreHorizontalIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Dovetail Rx blue). #2E6BE6 on #FFFFFF ≈
// 4.6:1 (passes 4.5:1); #7FA7F2 on the dark card (~#1C1C1E) ≈ 6.3:1.
const BRAND_ACCENT = 'light-dark(#2E6BE6, #7FA7F2)';
// Text over a BRAND_ACCENT fill (badge, CTA). Light: #FFFFFF on #2E6BE6 ≈
// 4.6:1 — the 11px badge text passes. Dark: white on #7FA7F2 fails (~2.2:1),
// so the dark side flips to near-black navy — #12233F on #7FA7F2 ≈ 7.9:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #12233F)';
// 12% brand wash for the active-tab tint and drop-target ring interior.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Conflict amber — tether stroke, chip text, matrix glyphs. #B45309 on the
// #FFF card ≈ 4.8:1; #FCD34D on the dark card ≈ 9.9:1.
const CONFLICT_AMBER = 'light-dark(#B45309, #FCD34D)';
// Amber matrix-cell fill vs its card: #FDE9D2 vs #FFFFFF ≈ 1.2 luminance
// step but the CELL is bounded by the CONFLICT_AMBER glyph + 1px amber
// ring; the amber-on-amber-wash pair #B45309 on #FDE9D2 ≈ 4.1:1 and the
// wash itself reads ≥3.2:1 against the dark card side (#4A3208 vs #1C1C1E
// ≈ 3.2:1) — the load-bearing boundary is the glyph + ring, both ≥3:1.
const AMBER_CELL_BG = 'light-dark(#FDE9D2, #4A3208)';
// Safe green — satisfied chips, cooled matrix cells. #15803D on #FFF ≈
// 5.0:1; #6EE7A0 on the dark card ≈ 8.7:1.
const SAFE_GREEN = 'light-dark(#15803D, #6EE7A0)';
// Green cell wash: #15803D on #DCF3E4 ≈ 4.3:1; #6EE7A0 on #0E3A22 ≈ 7.1:1.
const GREEN_CELL_BG = 'light-dark(#DCF3E4, #0E3A22)';
// Interactive REST-STATE boundary (untaken status circles) — foundations
// amendment: hairline tokens are for passive separators only; this ring is
// an interactive affordance so it gets an explicit ≥3:1 pair vs the CARD
// surface it sits on: #6B7280 on #FFFFFF ≈ 4.8:1; #98A2B3 on ~#1C1C1E ≈
// 6.6:1. Both clear 3:1 with room.
const REST_RING = 'light-dark(#6B7280, #98A2B3)';
// Check glyph over a SAFE_GREEN fill: #FFFFFF on #15803D ≈ 5.0:1; the dark
// fill #6EE7A0 needs a dark glyph — #0E3A22 on #6EE7A0 ≈ 7.1:1.
const GREEN_FILL_TEXT = 'light-dark(#FFFFFF, #0E3A22)';
// Sheet/actionSheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, the visually-hidden h1, the
// tether dissolve keyframes, and the reduced-motion guard. Transitions
// animate transform/opacity/color only and collapse under
// prefers-reduced-motion (static amber/green alone still encode state).
// ---------------------------------------------------------------------------

const DVR_CSS = `
.dvr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.dvr-btn:disabled { cursor: default; }
.dvr-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
/* Matrix gridcells focus INSIDE the snap rail — negative offset keeps the
   ring inside the 44px cell so the sticky code column never covers it
   (cell zIndex 2 > sticky column zIndex 1 while focused). */
.dvr-cell:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: -2px;
  z-index: 2;
}
.dvr-anim { transition: transform 240ms ease, opacity 240ms ease; }
.dvr-fade { transition: opacity 200ms ease, color 200ms ease, background-color 200ms ease; }
@keyframes dvr-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.dvr-sheet-in { animation: dvr-sheet-in 240ms ease; }
/* Tether dissolve — stroke-dashoffset walks the dash pattern off over
   240ms, then onAnimationEnd unmounts the ghost path. */
@keyframes dvr-dissolve {
  from { opacity: 1; stroke-dashoffset: 0; }
  to { opacity: 0; stroke-dashoffset: 24; }
}
.dvr-dissolve { animation: dvr-dissolve 240ms ease forwards; }
.dvr-vh {
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
  .dvr-anim, .dvr-fade { transition: none; }
  .dvr-sheet-in, .dvr-dissolve { animation: none; }
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
  // Scroll lock while sheet/actionSheet open — absolute overlays anchor to
  // the visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 buttons
  // optically align content to the 16px gutter. Hairline + blur ALWAYS ON
  // (noted choice — scroll-under not wired).
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
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  tailSpacer: {height: 24},
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom. Rendered as h2.
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
  // DoseSlotRail wrapper — relative so the tether SVG can overlay.
  slotCardInner: {position: 'relative'},
  tetherSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // DOSE ROW — 44px single line: [rowBtn: name·time·status] [chip] [⋯].
  doseRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: 44,
    paddingInlineEnd: 4,
  },
  doseRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    touchAction: 'none',
  },
  doseName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  doseNameDone: {color: 'var(--color-text-secondary)'},
  doseTime: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Status affordance — 24px circle; the REST boundary is REST_RING (≥3:1
  // vs the card, amendment math at the declaration).
  statusCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 999,
    border: `2px solid ${REST_RING}`,
    display: 'grid',
    placeItems: 'center',
    color: 'transparent',
  },
  statusCircleTaken: {
    border: 'none',
    background: SAFE_GREEN,
    color: GREEN_FILL_TEXT,
  },
  statusCircleSkipped: {
    border: 'none',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // SpacingTimerChip — 24px pill inside a 44px-tall padded hit.
  chipHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    borderRadius: 999,
  },
  chip: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  chipAmber: {color: CONFLICT_AMBER, background: AMBER_CELL_BG, border: `1px solid ${CONFLICT_AMBER}`},
  chipGreen: {color: SAFE_GREEN, background: GREEN_CELL_BG, border: `1px solid ${SAFE_GREEN}`},
  // Empty-slot ghost row (slot-level empties stay one 44px row; the full
  // emptyState block is reserved for cleared filters, not slots).
  ghostRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // Conflict footer row — 36px full-width button, the tether's accessible
  // twin (merged full-row target per the 44px merge clause).
  conflictFooter: {
    width: '100%',
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 500,
    color: CONFLICT_AMBER,
  },
  conflictFooterText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // CABINET — 60px two-line rows.
  medRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  medCode: {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  medText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  medPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  medSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  lowPill: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: CONFLICT_AMBER,
    border: `1px solid ${CONFLICT_AMBER}`,
    borderRadius: 999,
    padding: '2px 8px',
  },
  // Terminal caption — iOS's '87 Contacts' convention.
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // INTERACTIONS — summary strip + matrix rail + pair rows.
  summaryStrip: {
    margin: '20px 16px 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  matrixCard: {
    marginInline: 16,
    marginTop: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    paddingBlock: 12,
  },
  // The ONLY way 44px cells fit 390 — horizontal snap rail; ≥24px peek at
  // every width 320–430 (422 − (430−32) = 24 exactly at the widest stage).
  matrixRail: {
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 12,
  },
  matrixGrid: {
    display: 'grid',
    // 54px sticky code column + 2px grid gap ≈ the 56px label zone; row
    // width 54+2+8×44+7×2 = 422px → scrolls at all stage widths.
    gridTemplateColumns: '54px repeat(8, 44px)',
    gap: 2,
    width: 'max-content',
    scrollSnapAlign: 'start',
  },
  matrixHeadCell: {
    height: 24,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // Sticky code column — keeps identity while the rail is scrolled.
  matrixLabelCell: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: 4,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-background-card)',
  },
  matrixCornerCell: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    background: 'var(--color-background-card)',
  },
  matrixCell: {
    width: 44,
    height: 44,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    // Neutral pair cells: --color-background-muted is the sanctioned
    // PASSIVE rest fill here (spec-noted; the interactive signal is the
    // focus ring + press, not the fill boundary).
    background: 'var(--color-background-muted)',
    color: 'transparent',
  },
  matrixCellAmber: {
    background: AMBER_CELL_BG,
    color: CONFLICT_AMBER,
    boxShadow: `inset 0 0 0 1px ${CONFLICT_AMBER}`,
  },
  matrixCellGreen: {
    background: GREEN_CELL_BG,
    color: SAFE_GREEN,
    boxShadow: `inset 0 0 0 1px ${SAFE_GREEN}`,
  },
  // Voided diagonal self-cells — non-interactive, diagonal hairline slash.
  matrixCellVoid: {
    width: 44,
    height: 44,
    borderRadius: 8,
    background:
      'linear-gradient(135deg, transparent calc(50% - 1px), var(--color-border) calc(50% - 1px), var(--color-border) calc(50% + 1px), transparent calc(50% + 1px))',
  },
  // Pair rows — 60px, severity dot + names + status.
  pairRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  sevDot: {width: 10, height: 10, flexShrink: 0, borderRadius: 999},
  // HISTORY — weekly header + 60px day rows + live event rows.
  historyHeader: {
    margin: '20px 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  historyHeaderText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  historyHeadline: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  historySub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  dayRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  dayCount: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  eventRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — STICKY-IN-FLOW (height 0 anchor) so it pins 76px above
  // the viewport bottom even mid-scroll on tall tabs; flips to
  // shell-absolute ONLY while the shell is scroll-locked (open overlays).
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 42,
    height: 'auto',
    marginInline: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: '100%',
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
  toastLocked: {position: 'static'},
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, flexShrink: 0, background: 'var(--color-border)'},
  toastUndo: {
    height: 48,
    minWidth: 44,
    paddingInline: 16,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  toastPad: {width: 16, flexShrink: 0, height: 1},
  // TAB BAR — exactly 64px, 4 tabItems flex:1.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    flexShrink: 0,
    display: 'flex',
    height: 64,
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
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // Badge — 16px-min brand pill; text contrast math at BRAND_FILL_TEXT.
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
    color: BRAND_FILL_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell, two detents.
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  ctaBtn: {
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
  // Severity banner inside the pair sheet.
  sevBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 36,
    paddingInline: 12,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  sevBannerAmber: {color: CONFLICT_AMBER, background: AMBER_CELL_BG},
  sevBannerGreen: {color: SAFE_GREEN, background: GREEN_CELL_BG},
  pairHero: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 16,
  },
  ruleText: {
    fontSize: 13,
    lineHeight: '18px',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  miniRail: {
    position: 'relative',
    marginTop: 16,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  miniRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  miniName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  aboutBody: {display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8},
  aboutText: {fontSize: 13, lineHeight: '18px', color: 'var(--color-text-secondary)', margin: 0},
  // ACTION SHEET — verb picker; two stacked cards 8px apart, z41 over the
  // shared scrim z40.
  actionSheetWrap: {
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
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    paddingInline: 16,
  },
  actionRowLabel: {
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  actionRowDestructive: {color: 'var(--color-error)'},
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
  // DRAG GHOST — absolute chip following the pointer, z35, aria-hidden.
  dragGhost: {
    position: 'absolute',
    zIndex: 35,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingInline: 12,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: `1px solid ${BRAND_ACCENT}`,
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transform: 'translate(-50%, -120%)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — one frozen clock, dual fields everywhere, every aggregate
// cross-checked by hand before shipping: cabinet 12+30+45+60+18+24+90+7 =
// 286 pills, exactly 1 low (Melatonin 7 ≤ 10); doses 3+3+2+1 = 9, taken 3
// → ring 3/9; matrix 8×8 = 64 cells = 8 void diagonal + 56 mirrored = 28
// unique pairs = 3 monitored + 25 neutral; history 9+9+8+9+8+9+8 = 60 of
// 63 = 95%; P2 gap 1080−760 = 320 min = 5 h 20 m; P3 gap 750−422 = 328 min
// = 5 h 28 m ≥ 240. All strings fixed; zero Date.now(), zero Math.random().
// ---------------------------------------------------------------------------

// The suite's frozen "now": 760 minutes since midnight = 12:40 PM. Never ticks.
const NOW_MIN = 760;
const NOW_LABEL = '12:40 PM';
const TODAY = 'Fri, Jul 4';

type SlotId = 'morning' | 'noon' | 'evening' | 'night';
type DoseStatus = 'pending' | 'taken' | 'skipped';
type TabId = 'today' | 'cabinet' | 'interactions' | 'history';

interface Slot {
  id: SlotId;
  label: string;
  timeMin: number;
  timeLabel: string;
}

const SLOTS: Slot[] = [
  {id: 'morning', label: 'Morning', timeMin: 480, timeLabel: '8:00 AM'},
  {id: 'noon', label: 'Noon', timeMin: 750, timeLabel: '12:30 PM'},
  {id: 'evening', label: 'Evening', timeMin: 1080, timeLabel: '6:00 PM'},
  {id: 'night', label: 'Night', timeMin: 1320, timeLabel: '10:00 PM'},
];

const SLOT_BY_ID = Object.fromEntries(SLOTS.map(slot => [slot.id, slot])) as Record<SlotId, Slot>;

interface Med {
  id: string;
  code: string; // two-letter matrix code
  name: string; // full display name incl. strength
  shortName: string; // chip/toast-length name
  pillsLeft: number;
  pillsLabel: string;
  refillLabel: string;
}

// Catalog order IS the matrix axis order (LS/LV/MT/SR/CA/IB/FE/ML) and the
// stable in-slot sort. Cabinet sum 12+30+45+60+18+24+90+7 = 286 ✓; only
// Melatonin (7) is ≤ 10 → exactly '1 low' ✓. 'Calcium carbonate 600 mg +
// D3' (29 chars) is the 44px-row single-line ellipsis stress (fixture 1).
const MEDS: Med[] = [
  {id: 'ls', code: 'LS', name: 'Lisinopril 10 mg', shortName: 'Lisinopril', pillsLeft: 12, pillsLabel: '12 pills', refillLabel: 'refill Jul 12'},
  {id: 'lv', code: 'LV', name: 'Levothyroxine 75 mcg', shortName: 'Levothyroxine', pillsLeft: 30, pillsLabel: '30 pills', refillLabel: 'refill Aug 2'},
  {id: 'mt', code: 'MT', name: 'Metformin 500 mg', shortName: 'Metformin', pillsLeft: 45, pillsLabel: '45 pills', refillLabel: 'refill Jul 26'},
  {id: 'sr', code: 'SR', name: 'Sertraline 50 mg', shortName: 'Sertraline', pillsLeft: 60, pillsLabel: '60 pills', refillLabel: 'refill Aug 30'},
  {id: 'ca', code: 'CA', name: 'Calcium carbonate 600 mg + D3', shortName: 'Calcium', pillsLeft: 18, pillsLabel: '18 pills', refillLabel: 'refill Jul 18'},
  {id: 'ib', code: 'IB', name: 'Ibuprofen 400 mg', shortName: 'Ibuprofen', pillsLeft: 24, pillsLabel: '24 pills', refillLabel: 'refill Jul 30'},
  {id: 'fe', code: 'FE', name: 'Ferrous sulfate 325 mg', shortName: 'Ferrous sulfate', pillsLeft: 90, pillsLabel: '90 pills', refillLabel: 'refill Sep 27'},
  {id: 'ml', code: 'ML', name: 'Melatonin 3 mg', shortName: 'Melatonin', pillsLeft: 7, pillsLabel: '7 pills', refillLabel: 'refill Jul 8'},
];

const MED_BY_ID = Object.fromEntries(MEDS.map(med => [med.id, med])) as Record<string, Med>;
const MED_ORDER = MEDS.map(med => med.id);
const CABINET_PILL_SUM = MEDS.reduce((sum, med) => sum + med.pillsLeft, 0); // 286 ✓
const CABINET_LOW_COUNT = MEDS.filter(med => med.pillsLeft <= 10).length; // 1 ✓

interface Dose {
  id: string;
  medId: string;
  slot: SlotId;
  timeMin: number;
  timeLabel: string;
  status: DoseStatus;
  takenAtMin: number | null;
  takenAtLabel: string | null;
}

// 9 doses today: Morning 3 taken, Noon 3 + Evening 2 + Night 1 pending →
// 3+3+2+1 = 9, taken 3 → AdherenceRing 3/9 ✓. Noon card order (catalog
// sort): idx0 Lisinopril · idx1 Calcium · idx2 Ibuprofen — the tether spans
// idx0→idx2 (y-centers 22 and 112 via 45·i+22 row-index math).
const DOSES: Dose[] = [
  {id: 'do_lv', medId: 'lv', slot: 'morning', timeMin: 420, timeLabel: '7:00 AM', status: 'taken', takenAtMin: 422, takenAtLabel: '7:02 AM'},
  {id: 'do_mt1', medId: 'mt', slot: 'morning', timeMin: 480, timeLabel: '8:00 AM', status: 'taken', takenAtMin: 485, takenAtLabel: '8:05 AM'},
  {id: 'do_sr', medId: 'sr', slot: 'morning', timeMin: 480, timeLabel: '8:00 AM', status: 'taken', takenAtMin: 485, takenAtLabel: '8:05 AM'},
  {id: 'do_ls', medId: 'ls', slot: 'noon', timeMin: 750, timeLabel: '12:30 PM', status: 'pending', takenAtMin: null, takenAtLabel: null},
  {id: 'do_ca', medId: 'ca', slot: 'noon', timeMin: 750, timeLabel: '12:30 PM', status: 'pending', takenAtMin: null, takenAtLabel: null},
  {id: 'do_ib', medId: 'ib', slot: 'noon', timeMin: 750, timeLabel: '12:30 PM', status: 'pending', takenAtMin: null, takenAtLabel: null},
  {id: 'do_mt2', medId: 'mt', slot: 'evening', timeMin: 1080, timeLabel: '6:00 PM', status: 'pending', takenAtMin: null, takenAtLabel: null},
  {id: 'do_fe', medId: 'fe', slot: 'evening', timeMin: 1080, timeLabel: '6:00 PM', status: 'pending', takenAtMin: null, takenAtLabel: null},
  {id: 'do_ml', medId: 'ml', slot: 'night', timeMin: 1320, timeLabel: '10:00 PM', status: 'pending', takenAtMin: null, takenAtLabel: null},
];

const TOTAL_DOSES = DOSES.length; // 9

type PairKind = 'coadmin' | 'spacing';
type Severity = 'major' | 'moderate';

interface Pair {
  id: string;
  aMedId: string;
  bMedId: string;
  severity: Severity;
  kind: PairKind;
  // spacing pairs: the GATE med must be taken minGapMin before the GATED
  // med's scheduled slot time; the chip renders on the GATED med's row.
  gateMedId?: string;
  gatedMedId?: string;
  minGapMin?: number;
  gapLabel?: string;
  title: string;
  rule: string;
}

// 3 monitored pairs = 2 active + 1 satisfied at load ✓ (badge '2').
const PAIRS: Pair[] = [
  {
    id: 'p_ib_ls',
    aMedId: 'ib',
    bMedId: 'ls',
    severity: 'major',
    kind: 'coadmin',
    title: 'Ibuprofen + Lisinopril',
    rule:
      'Ibuprofen (an NSAID) can blunt Lisinopril’s blood-pressure effect and add strain on the kidneys when the two are taken together. Keep them in separate dose slots.',
  },
  {
    id: 'p_ca_fe',
    aMedId: 'ca',
    bMedId: 'fe',
    severity: 'moderate',
    kind: 'spacing',
    gateMedId: 'ca',
    gatedMedId: 'fe',
    minGapMin: 120,
    gapLabel: '2h',
    title: 'Calcium + Ferrous sulfate',
    rule:
      'Calcium binds iron in the gut and cuts its absorption. Take Ferrous sulfate at least 2 hours after Calcium.',
  },
  {
    id: 'p_ca_lv',
    aMedId: 'ca',
    bMedId: 'lv',
    severity: 'moderate',
    kind: 'spacing',
    gateMedId: 'lv',
    gatedMedId: 'ca',
    minGapMin: 240,
    gapLabel: '4h',
    title: 'Calcium + Levothyroxine',
    rule:
      'Calcium interferes with Levothyroxine absorption. Keep Calcium at least 4 hours after your Levothyroxine dose.',
  },
];

const MONITORED_PAIR_COUNT = PAIRS.length; // 3
// Matrix bookkeeping (cross-checked): 8×8 = 64 cells = 8 void diagonal +
// 56 mirrored off-diagonal = 28 unique pairs = 3 monitored + 25 neutral ✓.

interface HistoryDay {
  id: string;
  dayLabel: string;
  dateLabel: string;
  taken: number;
  total: number;
}

// 7 full prior days, newest first: 8+9+8+9+8+9+9 = 60 of 63 = 95% ✓
// (spec order Sat→Fri: 9,9,8,9,8,9,8 — same ledger, reversed for display).
const HISTORY_DAYS: HistoryDay[] = [
  {id: 'h_fri', dayLabel: 'Fri', dateLabel: 'Jul 3', taken: 8, total: 9},
  {id: 'h_thu', dayLabel: 'Thu', dateLabel: 'Jul 2', taken: 9, total: 9},
  {id: 'h_wed', dayLabel: 'Wed', dateLabel: 'Jul 1', taken: 8, total: 9},
  {id: 'h_tue', dayLabel: 'Tue', dateLabel: 'Jun 30', taken: 9, total: 9},
  {id: 'h_mon', dayLabel: 'Mon', dateLabel: 'Jun 29', taken: 8, total: 9},
  {id: 'h_sun', dayLabel: 'Sun', dateLabel: 'Jun 28', taken: 9, total: 9},
  {id: 'h_sat', dayLabel: 'Sat', dateLabel: 'Jun 27', taken: 9, total: 9},
];

const WEEK_TAKEN = HISTORY_DAYS.reduce((sum, day) => sum + day.taken, 0); // 60 ✓
const WEEK_TOTAL = HISTORY_DAYS.reduce((sum, day) => sum + day.total, 0); // 63 ✓
const WEEK_PCT = Math.round((WEEK_TAKEN / WEEK_TOTAL) * 100); // 95 ✓

interface HistoryEvent {
  id: string;
  text: string;
}

// Today's ledger starts with the 3 morning takes and appends live.
const INITIAL_EVENTS: HistoryEvent[] = [
  {id: 'ev_1', text: 'Levothyroxine · Taken 7:02 AM'},
  {id: 'ev_2', text: 'Metformin · Taken 8:05 AM'},
  {id: 'ev_3', text: 'Sertraline · Taken 8:05 AM'},
];

// ---------------------------------------------------------------------------
// FORMATTERS + DERIVATIONS — pure; every surface (tether, matrix, chips,
// badge, ring) derives from the dose array each render. No duplicated state.
// ---------------------------------------------------------------------------

/** Minutes-since-midnight → '2:40 PM'. */
function fmtTime(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Minute gap → '5h 20m' (320) / '2h' (120). Tabular-nums at render. */
function fmtGap(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Doses in a slot, catalog-sorted (stable, deterministic row indices). */
function slotDoses(doses: Dose[], slot: SlotId): Dose[] {
  return doses
    .filter(dose => dose.slot === slot)
    .sort((a, b) => MED_ORDER.indexOf(a.medId) - MED_ORDER.indexOf(b.medId));
}

function doseOfMed(doses: Dose[], medId: string): Dose {
  const dose = doses.find(candidate => candidate.medId === medId);
  if (dose == null) throw new Error(`fixture dose missing for ${medId}`);
  return dose;
}

type PairStatus = 'active' | 'satisfied';

interface PairState {
  pair: Pair;
  status: PairStatus;
  /** Row-chip string on the gated dose (spacing pairs only). */
  chipText: string | null;
  chipTone: 'amber' | 'green' | null;
  /** One-line status for pair list rows + sheet banner. */
  statusText: string;
}

/**
 * THE derivation law (single source of truth for tether, matrix, badge,
 * chips, action-sheet deltas): a coadmin pair is ACTIVE iff both doses sit
 * in the same slot with both still pending; a spacing pair is ACTIVE iff
 * its gate is skipped, its gate is untaken, or the gated slot lands before
 * gateTakenAt + minGap. Fixture walk: P1 both Noon pending → ACTIVE; P2
 * Calcium untaken → ACTIVE ('Wait · 2h after Calcium'); P3 Levo taken 422,
 * Calcium slot 750, gap 328 ≥ 240 → SATISFIED ('Clear · gap 5h 28m').
 * Calcium taken at NOW 760 flips P2: earliest 760+120 = 880 ≤ iron slot
 * 1080 → 'Clear · gap 5h 20m' (1080−760 = 320). Calcium SKIPPED re-locks
 * P2 amber: 'Blocked · Calcium skipped'.
 */
function derivePairState(pair: Pair, doses: Dose[]): PairState {
  if (pair.kind === 'coadmin') {
    const doseA = doseOfMed(doses, pair.aMedId);
    const doseB = doseOfMed(doses, pair.bMedId);
    const active = doseA.slot === doseB.slot && doseA.status === 'pending' && doseB.status === 'pending';
    return {
      pair,
      status: active ? 'active' : 'satisfied',
      chipText: null,
      chipTone: null,
      statusText: active
        ? `Same slot · ${SLOT_BY_ID[doseA.slot].label} ${SLOT_BY_ID[doseA.slot].timeLabel}`
        : 'Resolved · separate slots',
    };
  }
  const gate = doseOfMed(doses, pair.gateMedId ?? '');
  const gated = doseOfMed(doses, pair.gatedMedId ?? '');
  const gateName = MED_BY_ID[gate.medId].shortName;
  const minGap = pair.minGapMin ?? 0;
  if (gated.status === 'taken') {
    return {
      pair,
      status: 'satisfied',
      chipText: null,
      chipTone: null,
      statusText: `Taken · ${gated.takenAtLabel ?? ''}`,
    };
  }
  if (gate.status === 'skipped') {
    return {
      pair,
      status: 'active',
      chipText: `Blocked · ${gateName} skipped`,
      chipTone: 'amber',
      statusText: `Blocked · ${gateName} skipped today`,
    };
  }
  if (gate.status === 'taken' && gate.takenAtMin != null) {
    const earliest = gate.takenAtMin + minGap;
    if (gated.timeMin >= earliest) {
      const gap = gated.timeMin - gate.takenAtMin;
      return {
        pair,
        status: 'satisfied',
        chipText: `Clear · gap ${fmtGap(gap)}`,
        chipTone: 'green',
        statusText: `Clear · gap ${fmtGap(gap)}`,
      };
    }
    return {
      pair,
      status: 'active',
      chipText: `Too soon · wait to ${fmtTime(earliest)}`,
      chipTone: 'amber',
      statusText: `Too soon · earliest ${fmtTime(earliest)}`,
    };
  }
  return {
    pair,
    status: 'active',
    chipText: `Wait · ${pair.gapLabel} after ${gateName}`,
    chipTone: 'amber',
    statusText: `Wait · ${pair.gapLabel} after ${gateName}`,
  };
}

function derivePairStates(doses: Dose[]): PairState[] {
  return PAIRS.map(pair => derivePairState(pair, doses));
}

function activeCount(doses: Dose[]): number {
  return derivePairStates(doses).filter(state => state.status === 'active').length;
}

interface Tether {
  pairId: string;
  slot: SlotId;
  fromIdx: number;
  toIdx: number;
  severity: Severity;
}

/** Active coadmin pairs whose two doses share `slot` → tether descriptors. */
function tethersFor(doses: Dose[], slot: SlotId): Tether[] {
  const rows = slotDoses(doses, slot);
  const result: Tether[] = [];
  for (const state of derivePairStates(doses)) {
    if (state.pair.kind !== 'coadmin' || state.status !== 'active') continue;
    const fromIdx = rows.findIndex(dose => dose.medId === state.pair.bMedId);
    const toIdx = rows.findIndex(dose => dose.medId === state.pair.aMedId);
    if (fromIdx === -1 || toIdx === -1) continue;
    result.push({
      pairId: state.pair.id,
      slot,
      fromIdx: Math.min(fromIdx, toIdx),
      toIdx: Math.max(fromIdx, toIdx),
      severity: state.pair.severity,
    });
  }
  return result;
}

/** Row-index math: y-center of row i = 45·i + 22 (44px row + 1px divider). */
function rowCenterY(index: number): number {
  return 45 * index + 22;
}

/**
 * Tether path along the card's leading edge. Fixture (Noon idx0→idx2):
 * 'M 10 22 C -2 45, -2 89, 10 112' — control points ±23px past the
 * endpoints, x pulled to −2 inside the 16px card padding zone so the
 * curve never clips at 320.
 */
function tetherPath(y1: number, y2: number): string {
  return `M 10 ${y1} C -2 ${y1 + 23}, -2 ${y2 - 23}, 10 ${y2}`;
}

/** Chip states keyed by the GATED med's dose id (spacing pairs only). */
function chipsByDoseId(doses: Dose[], pairStates: PairState[]): Record<string, PairState> {
  const map: Record<string, PairState> = {};
  for (const state of pairStates) {
    if (state.pair.kind !== 'spacing' || state.chipText == null) continue;
    const gated = doseOfMed(doses, state.pair.gatedMedId ?? '');
    map[gated.id] = state;
  }
  return map;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — scheduleStore: doses + events + snapshot undo stack +
// UI. Verbs are thin wrappers over update(); every visible surface (tether,
// badge, matrix, chips, ring, history) derives from `doses` each render.
// ---------------------------------------------------------------------------

interface Snapshot {
  doses: Dose[];
  events: HistoryEvent[];
  label: string;
}

interface ScheduleUi {
  tab: TabId;
  scrollByTab: Record<TabId, number>;
  sheet: null | {kind: 'pair'; pairId: string} | {kind: 'about'};
  sheetDetent: 'medium' | 'large';
  actionDoseId: string | null;
  toast: {seq: number; text: string; canUndo: boolean} | null;
  drag: null | {doseId: string; x: number; y: number; overSlot: SlotId | null};
  // Ghost tether replayed during the 240ms dissolve, then unmounted on
  // animationend (instant skip under reduced motion — no timers).
  dissolve: null | {seq: number; slot: SlotId; y1: number; y2: number; severity: Severity};
}

interface ScheduleStore {
  doses: Dose[];
  events: HistoryEvent[];
  past: Snapshot[];
  ui: ScheduleUi;
}

const INITIAL_STORE: ScheduleStore = {
  doses: DOSES,
  events: INITIAL_EVENTS,
  past: [],
  ui: {
    tab: 'today',
    scrollByTab: {today: 0, cabinet: 0, interactions: 0, history: 0},
    sheet: null,
    sheetDetent: 'medium',
    actionDoseId: null,
    toast: null,
    drag: null,
    dissolve: null,
  },
};

function useScheduleStore() {
  const [store, setStore] = useState<ScheduleStore>(INITIAL_STORE);
  const update = useCallback((patch: Partial<ScheduleStore> | ((prev: ScheduleStore) => Partial<ScheduleStore>)) => {
    setStore(prev => ({...prev, ...(typeof patch === 'function' ? patch(prev) : patch)}));
  }, []);
  const updateUi = useCallback((patch: Partial<ScheduleUi> | ((prev: ScheduleUi) => Partial<ScheduleUi>)) => {
    setStore(prev => ({...prev, ui: {...prev.ui, ...(typeof patch === 'function' ? patch(prev.ui) : patch)}}));
  }, []);
  return {store, update, updateUi};
}

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

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — sheet + actionSheet trap focus; Escape closes the
// topmost overlay only (actionSheet > sheet); focus restores to the opener
// on every close path. Sheet entry uses focus({preventScroll: true}) so the
// animating sheet is never scroll-revealed inside the locked column.
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
// DovetailMark — two interlocking capsule halves meeting in a trapezoid
// dovetail notch; the warning variant swaps the notch wedge to
// CONFLICT_AMBER and offsets the halves 2px apart (a misaligned joint).
// Reused at 28px (navBar), 16px (conflict rows), 64px (pair sheet hero).
// ---------------------------------------------------------------------------

function DovetailMark({size, warning}: {size: number; warning?: boolean}) {
  const offset = warning === true ? 1.5 : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      {/* Left capsule half — its right edge carries the dovetail socket. */}
      <path
        d={`M 4 6 a 4 4 0 0 1 4 -4 h 5 v 7 l -3 2.5 v 5 l 3 2.5 v 7 h -5 a 4 4 0 0 1 -4 -4 z`}
        fill={BRAND_ACCENT}
        transform={`translate(${-offset} 0)`}
      />
      {/* Right capsule half — its left edge carries the dovetail pin. */}
      <path
        d={`M 24 6 a 4 4 0 0 0 -4 -4 h -5 v 7 l -3 2.5 v 5 l 3 2.5 v 7 h 5 a 4 4 0 0 0 4 -4 z`}
        fill={BRAND_ACCENT}
        opacity={0.55}
        transform={`translate(${offset} 0)`}
      />
      {/* The dovetail wedge itself — amber on the warning variant. */}
      {warning === true ? (
        <path d="M 12 9 l 4 3 v 4 l -4 3 v -3.2 l 1.6 -1.3 v -0.6 l -1.6 -1.3 z" fill={CONFLICT_AMBER} />
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AdherenceRing — 28px SVG inside the navBar's 44×44 trailing button.
// r=12 → C = 2π·12 = 75.40; dashoffset = 75.40·(1 − taken/total): 3/9 →
// 50.27. Glyph-only (a 9px center numeral is BANNED under the 11px floor —
// spec-noted); aria-label carries the count and the History header repeats
// it at legal size. Recomputes live on every markTaken/undo.
// ---------------------------------------------------------------------------

const RING_C = 75.4;

function AdherenceRing({taken, total}: {taken: number; total: number}) {
  const offset = RING_C * (1 - taken / total);
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx={14} cy={14} r={12} stroke="var(--color-border)" strokeWidth={3} />
      <circle
        cx={14}
        cy={14}
        r={12}
        stroke={BRAND_ACCENT}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={RING_C}
        strokeDashoffset={offset}
        transform="rotate(-90 14 14)"
        className="dvr-fade"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SpacingTimerChip — 24px pill in a 44px-tall padded hit opening the pair
// sheet; 11px/600 tabular-nums + 12px Lock/Check glyph. Driven ONLY by the
// frozen store (NOW_MIN + the gating dose's takenAt). Below 360px container
// width the label drops to icon-only (aria-label keeps the full text —
// stress fixture 5, longest string 'Blocked · Calcium skipped').
// ---------------------------------------------------------------------------

interface SpacingTimerChipProps {
  state: PairState;
  iconOnly: boolean;
  onOpen: (opener: HTMLElement) => void;
}

function SpacingTimerChip({state, iconOnly, onOpen}: SpacingTimerChipProps) {
  const tone = state.chipTone ?? 'amber';
  const glyph = tone === 'green' ? CheckIcon : LockIcon;
  return (
    <button
      type="button"
      className="dvr-btn dvr-focusable"
      style={styles.chipHit}
      aria-label={`${state.pair.title}: ${state.chipText ?? ''} — open interaction detail`}
      onClick={event => onOpen(event.currentTarget)}>
      <span
        className="dvr-fade"
        style={{...styles.chip, ...(tone === 'green' ? styles.chipGreen : styles.chipAmber)}}>
        <Icon icon={glyph} size="xsm" color="inherit" />
        {iconOnly ? null : state.chipText}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// DoseSlotRail — one slot's inset-grouped listCard + an absolute,
// pointerEvents:none SVG overlay drawing the cubic-bezier tether along the
// card's leading edge between conflicting same-slot rows. The SVG is
// aria-hidden; its ACCESSIBLE twin is the 36px conflict footer row (a real
// full-width button opening the pair sheet). While a long-press drag is
// live and the dragged dose is a tether endpoint, the endpoint tracks the
// ghost (stretch) via this card's own rect — index math everywhere else.
// ---------------------------------------------------------------------------

interface DoseSlotRailProps {
  slot: Slot;
  doses: Dose[];
  chipMap: Record<string, PairState>;
  tethers: Tether[];
  dissolve: ScheduleUi['dissolve'];
  drag: ScheduleUi['drag'];
  dragClientY: number | null;
  iconOnlyChips: boolean;
  registerCard: (slot: SlotId, element: HTMLDivElement | null) => void;
  onRowPrimary: (doseId: string) => void;
  onRowPointerDown: (doseId: string, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onRowPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onRowPointerEnd: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onOpenAction: (doseId: string, opener: HTMLElement) => void;
  onOpenPair: (pairId: string, opener: HTMLElement) => void;
  onDissolveEnd: () => void;
  suppressClickRef: RefObject<boolean>;
}

function DoseSlotRail({
  slot,
  doses,
  chipMap,
  tethers,
  dissolve,
  drag,
  dragClientY,
  iconOnlyChips,
  registerCard,
  onRowPrimary,
  onRowPointerDown,
  onRowPointerMove,
  onRowPointerEnd,
  onOpenAction,
  onOpenPair,
  onDissolveEnd,
  suppressClickRef,
}: DoseSlotRailProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rows = slotDoses(doses, slot.id);
  const isDropTarget = drag != null && drag.overSlot === slot.id && doses.find(d => d.id === drag.doseId)?.slot !== slot.id;
  const conflictCount = tethers.length;
  const rowsHeight = rows.length > 0 ? rows.length * 44 + (rows.length - 1) : 44;

  // Stretch: if the dragged dose is an endpoint of a tether in THIS slot,
  // its end of the curve follows the ghost's y (clamped inside the rows).
  const dragIdx = drag != null ? rows.findIndex(row => row.id === drag.doseId) : -1;
  const stretchY = (() => {
    if (dragIdx === -1 || dragClientY == null || cardRef.current == null) return null;
    const rect = cardRef.current.getBoundingClientRect();
    return Math.max(10, Math.min(rowsHeight - 10, dragClientY - rect.top));
  })();

  return (
    <section aria-label={`${slot.label} doses`}>
      <h2 style={styles.sectionHeader}>
        {slot.label} · {slot.timeLabel}
      </h2>
      <div
        ref={element => {
          cardRef.current = element;
          registerCard(slot.id, element);
        }}
        style={{
          ...styles.listCard,
          ...(isDropTarget ? {boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`, background: BRAND_TINT_12} : null),
        }}>
        <div style={styles.slotCardInner}>
          {rows.length === 0 ? (
            // Slot-level empty stays ONE 44px ghost row (stress fixture 3);
            // the full emptyState block is reserved for cleared filters.
            <div style={styles.ghostRow}>No doses scheduled</div>
          ) : (
            rows.map((dose, index) => {
              const med = MED_BY_ID[dose.medId];
              const chip = chipMap[dose.id];
              const isTaken = dose.status === 'taken';
              const isSkipped = dose.status === 'skipped';
              const primaryLabel = isTaken
                ? `${med.shortName}, taken at ${dose.takenAtLabel ?? ''} — mark not taken`
                : isSkipped
                  ? `${med.shortName}, skipped today — restore dose`
                  : `Mark ${med.shortName} taken`;
              return (
                <div key={dose.id}>
                  <div style={styles.doseRow}>
                    <button
                      type="button"
                      className="dvr-btn dvr-focusable"
                      style={styles.doseRowBtn}
                      aria-label={primaryLabel}
                      onPointerDown={event => onRowPointerDown(dose.id, event)}
                      onPointerMove={onRowPointerMove}
                      onPointerUp={onRowPointerEnd}
                      onPointerCancel={onRowPointerEnd}
                      onClick={() => {
                        if (suppressClickRef.current) {
                          suppressClickRef.current = false;
                          return;
                        }
                        onRowPrimary(dose.id);
                      }}>
                      <span
                        style={{
                          ...styles.doseName,
                          ...(isTaken || isSkipped ? styles.doseNameDone : null),
                          ...(isSkipped ? {textDecoration: 'line-through'} : null),
                        }}>
                        {med.name}
                      </span>
                      {/* Chip-bearing pending rows drop the time label — it
                          duplicates the section header's slot time and the
                          name would starve at 390 (noted deviation). */}
                      {chip != null && dose.status === 'pending' ? null : (
                        <span style={styles.doseTime}>{isTaken ? dose.takenAtLabel : dose.timeLabel}</span>
                      )}
                      <span
                        className="dvr-fade"
                        style={{
                          ...styles.statusCircle,
                          ...(isTaken ? styles.statusCircleTaken : null),
                          ...(isSkipped ? styles.statusCircleSkipped : null),
                        }}
                        aria-hidden>
                        {isTaken ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
                        {isSkipped ? <Icon icon={BanIcon} size="xsm" color="inherit" /> : null}
                      </span>
                    </button>
                    {chip != null ? (
                      <SpacingTimerChip
                        state={chip}
                        iconOnly={iconOnlyChips}
                        onOpen={opener => onOpenPair(chip.pair.id, opener)}
                      />
                    ) : null}
                    <button
                      type="button"
                      className="dvr-btn dvr-focusable"
                      style={styles.iconBtn}
                      aria-label={`Actions for ${med.shortName}, ${slot.label}`}
                      aria-haspopup="dialog"
                      onClick={event => onOpenAction(dose.id, event.currentTarget)}>
                      <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
                    </button>
                  </div>
                  {index < rows.length - 1 ? <div style={styles.rowDivider} /> : null}
                </div>
              );
            })
          )}
          {/* Tether overlay — aria-hidden; pixel coordinates (no viewBox)
              so the 45·i+22 row-index math maps 1:1 to CSS pixels. */}
          {tethers.length > 0 || (dissolve != null && dissolve.slot === slot.id) ? (
            <svg style={styles.tetherSvg} aria-hidden>
              {tethers.map(tether => {
                let y1 = rowCenterY(tether.fromIdx);
                let y2 = rowCenterY(tether.toIdx);
                if (stretchY != null && dragIdx === tether.fromIdx) y1 = stretchY;
                if (stretchY != null && dragIdx === tether.toIdx) y2 = stretchY;
                return (
                  <g key={tether.pairId}>
                    <path
                      d={tetherPath(y1, y2)}
                      stroke={CONFLICT_AMBER}
                      strokeWidth={tether.severity === 'major' ? 3 : 2}
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx={10} cy={y1} r={3} fill={CONFLICT_AMBER} />
                    <circle cx={10} cy={y2} r={3} fill={CONFLICT_AMBER} />
                  </g>
                );
              })}
              {dissolve != null && dissolve.slot === slot.id ? (
                <path
                  key={dissolve.seq}
                  className="dvr-dissolve"
                  d={tetherPath(dissolve.y1, dissolve.y2)}
                  stroke={CONFLICT_AMBER}
                  strokeWidth={dissolve.severity === 'major' ? 3 : 2}
                  strokeLinecap="round"
                  strokeDasharray="6 6"
                  fill="none"
                  onAnimationEnd={onDissolveEnd}
                />
              ) : null}
            </svg>
          ) : null}
        </div>
        {conflictCount > 0 ? (
          <>
            <div style={styles.rowDivider} />
            <button
              type="button"
              className="dvr-btn dvr-focusable"
              style={styles.conflictFooter}
              onClick={event => onOpenPair(tethers[0].pairId, event.currentTarget)}>
              <DovetailMark size={16} warning />
              <span style={styles.conflictFooterText}>
                {conflictCount} interaction{conflictCount > 1 ? 's' : ''} in this slot
              </span>
              <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// InteractionMatrix — 8×8 med grid in a horizontal snap rail (the ONLY way
// 44px cells fit 390): sticky-left code column keeps identity while
// scrolled; 8 diagonal self-cells are VOIDED (non-interactive slash divs,
// aria-hidden); the 56 off-diagonal cells mirror 28 unique pairs — both
// symmetric cells derive from the same PairState selector, so they always
// update together. role='grid' with roving arrow-key cell focus (diagonal
// cells are skipped); Enter/tap opens the pair sheet, neutral cells toast.
// ---------------------------------------------------------------------------

interface InteractionMatrixProps {
  pairStates: PairState[];
  onCellTap: (aMedId: string, bMedId: string, opener: HTMLElement) => void;
}

function InteractionMatrix({pairStates, onCellTap}: InteractionMatrixProps) {
  const [focusCell, setFocusCell] = useState<{r: number; c: number}>({r: 0, c: 1});
  const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const stateFor = (aId: string, bId: string): PairState | null =>
    pairStates.find(
      state =>
        (state.pair.aMedId === aId && state.pair.bMedId === bId) ||
        (state.pair.aMedId === bId && state.pair.bMedId === aId),
    ) ?? null;

  const moveFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const deltas: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const delta = deltas[event.key];
    if (delta == null) return;
    event.preventDefault();
    let {r, c} = focusCell;
    for (let step = 0; step < 2; step++) {
      const nextR = Math.max(0, Math.min(7, r + delta[0]));
      const nextC = Math.max(0, Math.min(7, c + delta[1]));
      if (nextR === r && nextC === c) break;
      r = nextR;
      c = nextC;
      if (r !== c) break; // skip the voided diagonal, keep walking once
    }
    if (r === c) return;
    setFocusCell({r, c});
    cellRefs.current[`${r}-${c}`]?.focus();
  };

  return (
    <div style={styles.matrixCard}>
      <div style={styles.matrixRail}>
        <div
          role="grid"
          aria-label="Interaction matrix, 8 medications by 8 medications"
          style={styles.matrixGrid}
          onKeyDown={moveFocus}>
          <div role="row" style={{display: 'contents'}}>
            <div role="columnheader" aria-label="Medication" style={{...styles.matrixHeadCell, ...styles.matrixCornerCell}} />
            {MEDS.map(med => (
              <div key={med.id} role="columnheader" style={styles.matrixHeadCell} aria-label={med.shortName}>
                {med.code}
              </div>
            ))}
          </div>
          {MEDS.map((rowMed, r) => (
            <div key={rowMed.id} role="row" style={{display: 'contents'}}>
              <div role="rowheader" style={styles.matrixLabelCell} aria-label={rowMed.shortName}>
                {rowMed.code}
              </div>
              {MEDS.map((colMed, c) => {
                if (r === c) {
                  // Voided self-cell — diagonal hairline slash, not a target.
                  return <div key={colMed.id} style={styles.matrixCellVoid} aria-hidden />;
                }
                const state = stateFor(rowMed.id, colMed.id);
                const tone = state == null ? null : state.status === 'active' ? 'amber' : 'green';
                const label =
                  state == null
                    ? `${rowMed.shortName} and ${colMed.shortName}: no known interaction`
                    : `${rowMed.shortName} and ${colMed.shortName}: ${state.pair.severity} interaction, ${
                        state.status === 'active' ? 'active' : 'satisfied'
                      } — open detail`;
                const isFocusCell = focusCell.r === r && focusCell.c === c;
                return (
                  <div key={colMed.id} role="gridcell" style={{display: 'contents'}}>
                    <button
                      type="button"
                      ref={element => {
                        cellRefs.current[`${r}-${c}`] = element;
                      }}
                      className="dvr-btn dvr-cell dvr-fade"
                      tabIndex={isFocusCell ? 0 : -1}
                      style={{
                        ...styles.matrixCell,
                        ...(tone === 'amber' ? styles.matrixCellAmber : null),
                        ...(tone === 'green' ? styles.matrixCellGreen : null),
                      }}
                      aria-label={label}
                      onFocus={() => setFocusCell({r, c})}
                      onClick={event => onCellTap(rowMed.id, colMed.id, event.currentTarget)}>
                      {tone === 'amber' ? <DovetailMark size={16} warning /> : null}
                      {tone === 'green' ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// 55% / calc(100% − 56px); pointer drag between detents is garnish, >120px
// past medium closes), 52px header with 44×44 X, focus-trapped dialog.
// Never more than one sheet; the actionSheet occupies the same layer.
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
  // Transient pointer-drag delta only — the detent lives in the store.
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
    if (!movedRef.current) return; // plain click → toggle via onClick
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
      className="dvr-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease, height 240ms ease',
      }}>
      <button
        type="button"
        className="dvr-btn dvr-focusable"
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
          className="dvr-btn dvr-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      {footer != null ? <div style={styles.sheetFooter}>{footer}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — the Move-to-slot verb picker (never >5 option rows: Mark
// taken/not-taken + 3 moves + Skip). Destructive 'Skip today' is LAST in
// the options card; Cancel is its own separate card so a panicked
// bottom-of-screen tap is always safe. Focus opens on Cancel (never the
// destructive row), Tab trapped, restored to the opening ellipsis.
// ---------------------------------------------------------------------------

interface ActionOption {
  id: string;
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

interface ActionSheetProps {
  header: string;
  options: ActionOption[];
  onCancel: () => void;
  cancelRef: RefObject<HTMLButtonElement | null>;
  wrapRef: RefObject<HTMLDivElement | null>;
}

function ActionSheet({header, options, onCancel, cancelRef, wrapRef}: ActionSheetProps) {
  return (
    <div
      ref={wrapRef}
      role="dialog"
      aria-modal="true"
      aria-label={header}
      style={styles.actionSheetWrap}
      className="dvr-sheet-in"
      onKeyDown={event => trapTabKey(event, wrapRef.current)}>
      <div style={styles.actionCard}>
        <div style={styles.actionHeader}>{header}</div>
        {options.map((option, index) => (
          <div key={option.id}>
            {index > 0 ? <div style={styles.actionDivider} /> : null}
            <button
              type="button"
              className="dvr-btn dvr-focusable"
              style={{...styles.actionRow, ...(option.destructive === true ? styles.actionRowDestructive : null)}}
              onClick={option.onSelect}>
              <span style={styles.actionRowLabel}>{option.label}</span>
            </button>
          </div>
        ))}
      </div>
      <div style={styles.actionCard}>
        <button ref={cancelRef} type="button" className="dvr-btn dvr-focusable" style={styles.cancelRow} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TAB DEFINITIONS
// ---------------------------------------------------------------------------

const TABS: {id: TabId; label: string; icon: typeof ClockIcon}[] = [
  {id: 'today', label: 'Today', icon: CalendarCheckIcon},
  {id: 'cabinet', label: 'Cabinet', icon: ArchiveIcon},
  {id: 'interactions', label: 'Interactions', icon: GitCompareArrowsIcon},
  {id: 'history', label: 'History', icon: ClockIcon},
];

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileMedScheduleInteractionsTemplate() {
  const {store, update, updateUi} = useScheduleStore();
  const {doses, events, past, ui} = store;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const actionWrapRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const slotCardsRef = useRef<Partial<Record<SlotId, HTMLDivElement | null>>>({});
  const suppressClickRef = useRef(false);
  const seqRef = useRef(4); // deterministic monotonic id counter (ev_1..3 fixed)
  const pressRef = useRef<{doseId: string; startX: number; startY: number; timer: number} | null>(null);
  const dragClientRef = useRef<{x: number; y: number} | null>(null);

  const containerWidth = useElementWidth(wrapRef);
  // Viewport query is the first-frame fallback only; container width rules.
  const viewportDesktop = useMediaQuery('(min-width: 720px)');
  const isDesktop = containerWidth === 0 ? viewportDesktop : containerWidth >= 720;
  const iconOnlyChips = containerWidth !== 0 && containerWidth < 360;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // DERIVED — recomputed each render from the one dose array.
  const pairStates = derivePairStates(doses);
  const chipMap = chipsByDoseId(doses, pairStates);
  const badge = pairStates.filter(state => state.status === 'active').length;
  const takenCount = doses.filter(dose => dose.status === 'taken').length;
  const locked = ui.sheet != null || ui.actionDoseId != null;

  // -------------------------------------------------------------------------
  // VERBS — every mutation snapshots first (exact-state Undo), diffs the
  // tether set for the dissolve ghost, and speaks through the ONE toast.
  // -------------------------------------------------------------------------

  const toast = (text: string, canUndo: boolean) => {
    seqRef.current += 1;
    return {seq: seqRef.current, text, canUndo};
  };

  const badgeRemark = (prevDoses: Dose[], nextDoses: Dose[]): string => {
    const prevActive = activeCount(prevDoses);
    const nextActive = activeCount(nextDoses);
    if (nextActive === prevActive) return '';
    if (nextActive === 0) return ' · all interactions clear';
    return ` · ${nextActive} interaction${nextActive > 1 ? 's' : ''} remaining`;
  };

  const moveDose = (doseId: string, targetSlot: SlotId) => {
    const dose = doses.find(candidate => candidate.id === doseId);
    if (dose == null || dose.slot === targetSlot) return;
    const med = MED_BY_ID[dose.medId];
    const slot = SLOT_BY_ID[targetSlot];
    const before = tethersFor(doses, dose.slot);
    const nextDoses = doses.map(candidate =>
      candidate.id === doseId
        ? {...candidate, slot: targetSlot, timeMin: slot.timeMin, timeLabel: slot.timeLabel}
        : candidate,
    );
    const after = tethersFor(nextDoses, dose.slot);
    const gone = before.find(tether => !after.some(next => next.pairId === tether.pairId));
    seqRef.current += 1;
    const nextEvents = [...events, {id: `ev_${seqRef.current}`, text: `${med.shortName} · Moved to ${slot.label}`}];
    update({
      doses: nextDoses,
      events: nextEvents,
      past: [...past, {doses, events, label: `${med.shortName} moved`}],
    });
    updateUi({
      toast: toast(`${med.shortName} moved to ${slot.label}${badgeRemark(doses, nextDoses)}`, true),
      // Ghost tether replays the removed curve for the 240ms dash-out;
      // reduced motion skips the ghost entirely (instant unmount).
      dissolve:
        gone != null && !reducedMotion
          ? {seq: seqRef.current, slot: dose.slot, y1: rowCenterY(gone.fromIdx), y2: rowCenterY(gone.toIdx), severity: gone.severity}
          : null,
    });
  };

  /** Row primary: pending → taken; taken → not taken; skipped → restored. */
  const togglePrimary = (doseId: string) => {
    const dose = doses.find(candidate => candidate.id === doseId);
    if (dose == null) return;
    const med = MED_BY_ID[dose.medId];
    if (dose.status === 'pending') {
      seqRef.current += 1;
      const nextDoses = doses.map(candidate =>
        candidate.id === doseId
          ? {...candidate, status: 'taken' as DoseStatus, takenAtMin: NOW_MIN, takenAtLabel: NOW_LABEL}
          : candidate,
      );
      update({
        doses: nextDoses,
        events: [...events, {id: `ev_${seqRef.current}`, text: `${med.shortName} · Taken ${NOW_LABEL}`}],
        past: [...past, {doses, events, label: `${med.shortName} taken`}],
      });
      updateUi({toast: toast(`${med.shortName} marked taken${badgeRemark(doses, nextDoses)}`, true)});
      return;
    }
    const restoring = dose.status === 'skipped';
    const nextDoses = doses.map(candidate =>
      candidate.id === doseId
        ? {...candidate, status: 'pending' as DoseStatus, takenAtMin: null, takenAtLabel: null}
        : candidate,
    );
    // Drop the dose's latest ledger line (Taken/Skipped) from today's events.
    const dropIdx = [...events]
      .map((event, index) => ({event, index}))
      .reverse()
      .find(({event}) => event.text.startsWith(`${med.shortName} ·`))?.index;
    const nextEvents = dropIdx == null ? events : events.filter((_, index) => index !== dropIdx);
    update({
      doses: nextDoses,
      events: nextEvents,
      past: [...past, {doses, events, label: restoring ? `${med.shortName} restored` : `${med.shortName} unmarked`}],
    });
    updateUi({
      toast: toast(
        `${med.shortName} ${restoring ? 'restored' : 'marked not taken'}${badgeRemark(doses, nextDoses)}`,
        true,
      ),
    });
  };

  const skipDose = (doseId: string) => {
    const dose = doses.find(candidate => candidate.id === doseId);
    if (dose == null || dose.status !== 'pending') return;
    const med = MED_BY_ID[dose.medId];
    seqRef.current += 1;
    const nextDoses = doses.map(candidate =>
      candidate.id === doseId ? {...candidate, status: 'skipped' as DoseStatus} : candidate,
    );
    update({
      doses: nextDoses,
      events: [...events, {id: `ev_${seqRef.current}`, text: `${med.shortName} · Skipped today`}],
      past: [...past, {doses, events, label: `${med.shortName} skipped`}],
    });
    // Undo-over-confirm: reversible in one assignment → execute + Undo,
    // never a confirm dialog.
    updateUi({toast: toast(`${med.shortName} skipped today${badgeRemark(doses, nextDoses)}`, true)});
  };

  /** Pops one snapshot — the undo chain replays backward one at a time. */
  const undo = () => {
    const snapshot = past[past.length - 1];
    if (snapshot == null) return;
    update({doses: snapshot.doses, events: snapshot.events, past: past.slice(0, -1)});
    updateUi({toast: toast(`Restored · undid “${snapshot.label}”`, false), dissolve: null});
  };

  // -------------------------------------------------------------------------
  // OVERLAY WIRING — focus in with preventScroll, restore to opener on
  // every close path; Escape closes the topmost overlay only
  // (actionSheet > sheet); overlays close on tab switch, toast persists.
  // -------------------------------------------------------------------------

  const openPairSheet = (pairId: string, opener: HTMLElement) => {
    openerRef.current = opener;
    updateUi({sheet: {kind: 'pair', pairId}, sheetDetent: 'medium', actionDoseId: null});
  };

  const openAboutSheet = (opener: HTMLElement) => {
    openerRef.current = opener;
    updateUi({sheet: {kind: 'about'}, sheetDetent: 'medium', actionDoseId: null});
  };

  const closeSheet = () => {
    updateUi({sheet: null});
    openerRef.current?.focus();
    openerRef.current = null;
  };

  const openActionSheet = (doseId: string, opener: HTMLElement) => {
    openerRef.current = opener;
    updateUi({actionDoseId: doseId});
  };

  const closeActionSheet = () => {
    updateUi({actionDoseId: null});
    openerRef.current?.focus();
    openerRef.current = null;
  };

  const sheetKey = ui.sheet == null ? 'none' : ui.sheet.kind === 'pair' ? `pair:${ui.sheet.pairId}` : 'about';
  useEffect(() => {
    if (sheetKey !== 'none') {
      // preventScroll — plain .focus() would scroll-reveal the animating
      // sheet inside the locked overflow-hidden column and beach it.
      sheetRef.current?.focus({preventScroll: true});
    }
  }, [sheetKey]);
  useEffect(() => {
    if (ui.actionDoseId != null) {
      cancelRef.current?.focus({preventScroll: true});
    }
  }, [ui.actionDoseId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.actionDoseId != null) {
        event.stopPropagation();
        closeActionSheet();
      } else if (ui.sheet != null) {
        event.stopPropagation();
        closeSheet();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.actionDoseId, ui.sheet]);

  // -------------------------------------------------------------------------
  // PER-TAB PERSISTENCE — scrollTop keyed by tab id on the demo scroller;
  // re-tapping the active tab scrolls to top (the one legal reset).
  // -------------------------------------------------------------------------

  const findScroller = (): Element | null => {
    let element: HTMLElement | null = wrapRef.current;
    while (element != null) {
      const overflowY = getComputedStyle(element).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight) {
        return element;
      }
      element = element.parentElement;
    }
    return document.scrollingElement;
  };

  const setTab = (tab: TabId) => {
    if (tab === ui.tab) {
      findScroller()?.scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'});
      return;
    }
    const scroller = findScroller();
    updateUi(prev => ({
      tab,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
      sheet: null,
      actionDoseId: null,
      drag: null,
    }));
  };

  useEffect(() => {
    const scroller = findScroller();
    if (scroller != null) scroller.scrollTop = ui.scrollByTab[ui.tab] ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.tab]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TABS.map(tab => tab.id);
    const index = order.indexOf(ui.tab);
    const next = order[(index + (event.key === 'ArrowRight' ? 1 : -1) + order.length) % order.length];
    setTab(next);
  };

  // -------------------------------------------------------------------------
  // LONG-PRESS DRAG — pointerdown + 450ms (cancel on 8px move) lifts the
  // dragGhost; pointermove hit-tests slot cards for the drop ring;
  // pointerup over another slot commits moveDose. The mandatory button
  // path is each row's 44×44 ellipsis → Move-to-slot actionSheet.
  // -------------------------------------------------------------------------

  const shellPoint = (clientX: number, clientY: number) => {
    const rect = shellRef.current?.getBoundingClientRect();
    return rect == null ? {x: clientX, y: clientY} : {x: clientX - rect.left, y: clientY - rect.top};
  };

  const slotUnderPointer = (clientX: number, clientY: number): SlotId | null => {
    for (const slot of SLOTS) {
      const element = slotCardsRef.current[slot.id];
      if (element == null) continue;
      const rect = element.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top - 24 && clientY <= rect.bottom + 24) {
        return slot.id;
      }
    }
    return null;
  };

  const onRowPointerDown = (doseId: string, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    const {clientX, clientY} = event;
    const timer = window.setTimeout(() => {
      suppressClickRef.current = true;
      dragClientRef.current = {x: clientX, y: clientY};
      const point = shellPoint(clientX, clientY);
      updateUi({drag: {doseId, x: point.x, y: point.y, overSlot: slotUnderPointer(clientX, clientY)}});
    }, 450);
    pressRef.current = {doseId, startX: clientX, startY: clientY, timer};
  };

  const onRowPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const press = pressRef.current;
    if (press == null) return;
    const {clientX, clientY} = event;
    if (ui.drag == null) {
      if (Math.abs(clientX - press.startX) > 8 || Math.abs(clientY - press.startY) > 8) {
        window.clearTimeout(press.timer);
        pressRef.current = null;
      }
      return;
    }
    dragClientRef.current = {x: clientX, y: clientY};
    const point = shellPoint(clientX, clientY);
    updateUi(prev =>
      prev.drag == null
        ? {}
        : {drag: {...prev.drag, x: point.x, y: point.y, overSlot: slotUnderPointer(clientX, clientY)}},
    );
  };

  const onRowPointerEnd = () => {
    const press = pressRef.current;
    if (press != null) window.clearTimeout(press.timer);
    pressRef.current = null;
    const drag = ui.drag;
    dragClientRef.current = null;
    if (drag == null) return;
    updateUi({drag: null});
    const dose = doses.find(candidate => candidate.id === drag.doseId);
    if (dose != null && drag.overSlot != null && drag.overSlot !== dose.slot) {
      moveDose(drag.doseId, drag.overSlot);
    }
  };

  // -------------------------------------------------------------------------
  // ACTION SHEET OPTIONS — derived per dose; move rows carry live conflict
  // deltas from the same derivation law as the badge.
  // -------------------------------------------------------------------------

  const actionDose = ui.actionDoseId == null ? null : doses.find(dose => dose.id === ui.actionDoseId) ?? null;
  const actionOptions: ActionOption[] = [];
  let actionHeader = '';
  if (actionDose != null) {
    const med = MED_BY_ID[actionDose.medId];
    actionHeader = `${med.name} · ${SLOT_BY_ID[actionDose.slot].label}`;
    actionOptions.push({
      id: 'primary',
      label:
        actionDose.status === 'pending'
          ? 'Mark taken'
          : actionDose.status === 'taken'
            ? 'Mark not taken'
            : 'Restore dose',
      onSelect: () => {
        closeActionSheet();
        togglePrimary(actionDose.id);
      },
    });
    for (const slot of SLOTS) {
      if (slot.id === actionDose.slot) continue;
      const hypothetical = doses.map(candidate =>
        candidate.id === actionDose.id
          ? {...candidate, slot: slot.id, timeMin: slot.timeMin, timeLabel: slot.timeLabel}
          : candidate,
      );
      const delta = activeCount(hypothetical) - activeCount(doses);
      const suffix =
        delta < 0
          ? ` · resolves ${-delta} conflict${-delta > 1 ? 's' : ''}`
          : delta > 0
            ? ` · +${delta} conflict${delta > 1 ? 's' : ''}`
            : '';
      actionOptions.push({
        id: `move-${slot.id}`,
        label: `Move to ${slot.label}${suffix}`,
        onSelect: () => {
          closeActionSheet();
          moveDose(actionDose.id, slot.id);
        },
      });
    }
    if (actionDose.status === 'pending') {
      actionOptions.push({
        id: 'skip',
        label: 'Skip today',
        destructive: true,
        onSelect: () => {
          closeActionSheet();
          skipDose(actionDose.id);
        },
      });
    }
  }

  // -------------------------------------------------------------------------
  // MATRIX + PAIR SHEET WIRING
  // -------------------------------------------------------------------------

  const onMatrixCellTap = (aMedId: string, bMedId: string, opener: HTMLElement) => {
    const state = pairStates.find(
      candidate =>
        (candidate.pair.aMedId === aMedId && candidate.pair.bMedId === bMedId) ||
        (candidate.pair.aMedId === bMedId && candidate.pair.bMedId === aMedId),
    );
    if (state != null) {
      openPairSheet(state.pair.id, opener);
      return;
    }
    updateUi({
      toast: toast(`No known interaction · ${MED_BY_ID[aMedId].shortName} + ${MED_BY_ID[bMedId].shortName}`, false),
    });
  };

  const sheetPairState =
    ui.sheet != null && ui.sheet.kind === 'pair'
      ? pairStates.find(state => state.pair.id === (ui.sheet as {pairId: string}).pairId) ?? null
      : null;

  /** Pair-sheet CTA: coadmin → move the movable med to the best future
   * slot (fixture: 'Move Ibuprofen to Evening'); spacing → act on the gate. */
  const pairCta = (() => {
    if (sheetPairState == null || sheetPairState.status !== 'active') return null;
    const {pair} = sheetPairState;
    if (pair.kind === 'coadmin') {
      const mover = doseOfMed(doses, pair.aMedId);
      let best: {slot: SlotId; count: number; future: boolean} | null = null;
      for (const slot of SLOTS) {
        if (slot.id === mover.slot) continue;
        const hypothetical = doses.map(candidate =>
          candidate.id === mover.id
            ? {...candidate, slot: slot.id, timeMin: slot.timeMin, timeLabel: slot.timeLabel}
            : candidate,
        );
        const count = activeCount(hypothetical);
        const future = slot.timeMin >= NOW_MIN;
        if (
          best == null ||
          count < best.count ||
          (count === best.count && future && !best.future)
        ) {
          best = {slot: slot.id, count, future};
        }
      }
      if (best == null) return null;
      const target = best.slot;
      return {
        label: `Move ${MED_BY_ID[pair.aMedId].shortName} to ${SLOT_BY_ID[target].label}`,
        run: () => {
          closeSheet();
          moveDose(mover.id, target);
        },
      };
    }
    const gate = doseOfMed(doses, pair.gateMedId ?? '');
    const gateName = MED_BY_ID[gate.medId].shortName;
    if (gate.status === 'skipped') {
      return {
        label: `Restore ${gateName} dose`,
        run: () => {
          closeSheet();
          togglePrimary(gate.id);
        },
      };
    }
    if (gate.status === 'pending') {
      return {
        label: `Mark ${gateName} taken`,
        run: () => {
          closeSheet();
          togglePrimary(gate.id);
        },
      };
    }
    return null;
  })();

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  const registerCard = useCallback((slot: SlotId, element: HTMLDivElement | null) => {
    slotCardsRef.current[slot] = element;
  }, []);

  const tabTitle = TABS.find(tab => tab.id === ui.tab)?.label ?? 'Today';
  const dragMed = ui.drag == null ? null : MED_BY_ID[doses.find(dose => dose.id === ui.drag?.doseId)?.medId ?? 'ls'];

  const toastNode = (
    <div
      style={locked ? styles.toastDockLocked : styles.toastDock}
      aria-live="polite"
      role="status">
      {ui.toast != null ? (
        <div key={ui.toast.seq} className="dvr-fade" style={{...styles.toast, ...(locked ? styles.toastLocked : null)}}>
          <span style={styles.toastMsg}>{ui.toast.text}</span>
          {ui.toast.canUndo ? (
            <>
              <span style={styles.toastRule} aria-hidden />
              <button type="button" className="dvr-btn dvr-focusable" style={styles.toastUndo} onClick={undo}>
                Undo
              </button>
            </>
          ) : (
            <span style={styles.toastPad} aria-hidden />
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{DVR_CSS}</style>
      <div
        ref={shellRef}
        style={{
          ...styles.shell,
          ...(locked ? styles.shellLocked : null),
          ...(isDesktop ? styles.shellDesktop : null),
        }}>
        <h1 className="dvr-vh">Dovetail Rx — {tabTitle}</h1>

        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="dvr-btn dvr-focusable"
              style={styles.iconBtn}
              aria-label="About Dovetail Rx"
              onClick={event => openAboutSheet(event.currentTarget)}>
              <DovetailMark size={28} />
            </button>
          </div>
          <span style={styles.navTitle}>{TODAY}</span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="dvr-btn dvr-focusable"
              style={styles.iconBtn}
              aria-label={`Adherence: ${takenCount} of ${TOTAL_DOSES} doses taken — view history`}
              onClick={() => setTab('history')}>
              <AdherenceRing taken={takenCount} total={TOTAL_DOSES} />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {ui.tab === 'today' ? (
            <>
              {SLOTS.map(slot => (
                <DoseSlotRail
                  key={slot.id}
                  slot={slot}
                  doses={doses}
                  chipMap={chipMap}
                  tethers={tethersFor(doses, slot.id)}
                  dissolve={ui.dissolve}
                  drag={ui.drag}
                  dragClientY={ui.drag != null ? dragClientRef.current?.y ?? null : null}
                  iconOnlyChips={iconOnlyChips}
                  registerCard={registerCard}
                  onRowPrimary={togglePrimary}
                  onRowPointerDown={onRowPointerDown}
                  onRowPointerMove={onRowPointerMove}
                  onRowPointerEnd={onRowPointerEnd}
                  onOpenAction={openActionSheet}
                  onOpenPair={openPairSheet}
                  onDissolveEnd={() => updateUi({dissolve: null})}
                  suppressClickRef={suppressClickRef}
                />
              ))}
              <div style={styles.tailSpacer} />
            </>
          ) : null}

          {ui.tab === 'cabinet' ? (
            <>
              <h2 style={styles.sectionHeader}>Medicine cabinet</h2>
              <div style={styles.listCard}>
                {MEDS.map((med, index) => (
                  <div key={med.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <button
                      type="button"
                      className="dvr-btn dvr-focusable"
                      style={styles.medRow}
                      aria-label={`${med.name}: ${med.pillsLabel}, ${med.refillLabel}${med.pillsLeft <= 10 ? ', running low' : ''}`}
                      onClick={() =>
                        updateUi({
                          toast: toast(`${med.name} · ${med.pillsLabel} · ${med.refillLabel}`, false),
                        })
                      }>
                      <span style={styles.medCode} aria-hidden>
                        {med.code}
                      </span>
                      <span style={styles.medText}>
                        <span style={styles.medPrimary}>{med.name}</span>
                        <span style={styles.medSecondary}>
                          {med.pillsLabel} · {med.refillLabel}
                        </span>
                      </span>
                      {med.pillsLeft <= 10 ? <span style={styles.lowPill}>LOW</span> : null}
                    </button>
                  </div>
                ))}
              </div>
              {/* Terminal caption derives live: 286 pills · 1 low ✓ */}
              <div style={styles.terminalCaption}>
                {CABINET_PILL_SUM} pills on hand · {CABINET_LOW_COUNT} low
              </div>
              <div style={styles.tailSpacer} />
            </>
          ) : null}

          {ui.tab === 'interactions' ? (
            <>
              <div style={styles.summaryStrip}>
                {MONITORED_PAIR_COUNT} monitored pairs · {badge} active
              </div>
              <InteractionMatrix pairStates={pairStates} onCellTap={onMatrixCellTap} />
              <h2 style={styles.sectionHeader}>Monitored pairs</h2>
              <div style={styles.listCard}>
                {pairStates.map((state, index) => (
                  <div key={state.pair.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <button
                      type="button"
                      className="dvr-btn dvr-focusable"
                      style={styles.pairRow}
                      aria-label={`${state.pair.title}, ${state.pair.severity}, ${state.statusText} — open detail`}
                      onClick={event => openPairSheet(state.pair.id, event.currentTarget)}>
                      <span
                        className="dvr-fade"
                        style={{
                          ...styles.sevDot,
                          background: state.status === 'active' ? CONFLICT_AMBER : SAFE_GREEN,
                        }}
                        aria-hidden
                      />
                      <span style={styles.medText}>
                        <span style={styles.medPrimary}>{state.pair.title}</span>
                        <span style={styles.medSecondary}>
                          {state.pair.severity === 'major' ? 'Major' : 'Moderate'} · {state.statusText}
                        </span>
                      </span>
                      <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
                    </button>
                  </div>
                ))}
              </div>
              <div style={styles.tailSpacer} />
            </>
          ) : null}

          {ui.tab === 'history' ? (
            <>
              <div style={styles.historyHeader}>
                {/* Weekly ring — r=24, C=2π·24=150.80, offset 150.80·(1−60/63). */}
                <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden>
                  <circle cx={28} cy={28} r={24} stroke="var(--color-border)" strokeWidth={5} />
                  <circle
                    cx={28}
                    cy={28}
                    r={24}
                    stroke={BRAND_ACCENT}
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeDasharray={150.8}
                    strokeDashoffset={150.8 * (1 - WEEK_TAKEN / WEEK_TOTAL)}
                    transform="rotate(-90 28 28)"
                  />
                  <text
                    x={28}
                    y={32}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={600}
                    fill="var(--color-text-primary)">
                    {WEEK_PCT}%
                  </text>
                </svg>
                <div style={styles.historyHeaderText}>
                  <span style={styles.historyHeadline}>
                    {WEEK_TAKEN} of {WEEK_TOTAL} · {WEEK_PCT}%
                  </span>
                  <span style={styles.historySub}>Past 7 days</span>
                  {/* Legal-size repeat of the glyph-only navBar ring count. */}
                  <span style={styles.historySub}>
                    Today · {takenCount} of {TOTAL_DOSES} taken
                  </span>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Past 7 days</h2>
              <div style={styles.listCard}>
                {HISTORY_DAYS.map((day, index) => (
                  <div key={day.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <button
                      type="button"
                      className="dvr-btn dvr-focusable"
                      style={styles.dayRow}
                      aria-label={`${day.dayLabel} ${day.dateLabel}: ${day.taken} of ${day.total} doses taken`}
                      onClick={() =>
                        updateUi({
                          toast: toast(`${day.dayLabel} ${day.dateLabel} · ${day.taken} of ${day.total} doses taken`, false),
                        })
                      }>
                      <span style={styles.medText}>
                        <span style={styles.medPrimary}>
                          {day.dayLabel} · {day.dateLabel}
                        </span>
                        <span style={styles.medSecondary}>
                          {day.taken === day.total ? 'All doses taken' : `${day.total - day.taken} missed`}
                        </span>
                      </span>
                      <span
                        style={{
                          ...styles.dayCount,
                          color: day.taken === day.total ? SAFE_GREEN : CONFLICT_AMBER,
                        }}>
                        {day.taken}/{day.total}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              <h2 style={styles.sectionHeader}>Today · live</h2>
              <div style={styles.listCard}>
                {events.map((event, index) => (
                  <div key={event.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.eventRow}>{event.text}</div>
                  </div>
                ))}
              </div>
              <div style={styles.tailSpacer} />
            </>
          ) : null}
        </main>

        {/* THE one polite live region — sticky-in-flow above the tabBar;
            flips shell-absolute only while the shell is scroll-locked. */}
        {toastNode}

        <nav style={styles.tabBar} role="tablist" aria-label="Dovetail Rx sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const isActive = ui.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="dvr-btn dvr-focusable dvr-fade"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                onClick={() => setTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'interactions' && badge > 0 ? (
                    // Badge unmounts entirely at zero — never renders '0'.
                    <span style={styles.tabBadge}>{badge}</span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* dragGhost — follows the pointer during long-press drag. */}
        {ui.drag != null && dragMed != null ? (
          <div style={{...styles.dragGhost, left: ui.drag.x, top: ui.drag.y}} aria-hidden>
            <DovetailMark size={16} />
            {dragMed.shortName}
          </div>
        ) : null}

        {/* OVERLAYS — scrim z40, sheet/actionSheet z41, inside shell. */}
        {ui.sheet != null || ui.actionDoseId != null ? (
          <div
            style={styles.sheetScrim}
            className="dvr-fade"
            onClick={ui.actionDoseId != null ? closeActionSheet : closeSheet}
            aria-hidden
          />
        ) : null}

        {sheetPairState != null ? (
          <Sheet
            titleId="dvr-pair-title"
            title={sheetPairState.pair.title}
            detent={ui.sheetDetent}
            onDetentChange={detent => updateUi({sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              pairCta != null ? (
                <button type="button" className="dvr-btn dvr-focusable" style={styles.ctaBtn} onClick={pairCta.run}>
                  {pairCta.label}
                </button>
              ) : null
            }>
            <div
              style={{
                ...styles.sevBanner,
                ...(sheetPairState.status === 'active' ? styles.sevBannerAmber : styles.sevBannerGreen),
              }}>
              {sheetPairState.status === 'active'
                ? `${sheetPairState.pair.severity === 'major' ? 'MAJOR' : 'MODERATE'} · ${sheetPairState.statusText}`
                : `RESOLVED · ${sheetPairState.statusText}`}
            </div>
            <div style={styles.pairHero} aria-hidden>
              <DovetailMark size={64} warning={sheetPairState.status === 'active'} />
            </div>
            <p style={styles.ruleText}>{sheetPairState.pair.rule}</p>
            {/* Mini two-row rail — the tether metaphor repeated in-sheet. */}
            <div style={styles.miniRail}>
              {[sheetPairState.pair.aMedId, sheetPairState.pair.bMedId].map((medId, index) => {
                const dose = doseOfMed(doses, medId);
                return (
                  <div key={medId}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.miniRow}>
                      <span style={styles.miniName}>{MED_BY_ID[medId].name}</span>
                      <span style={styles.doseTime}>
                        {SLOT_BY_ID[dose.slot].label} · {dose.status === 'taken' ? dose.takenAtLabel : dose.timeLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
              {sheetPairState.pair.kind === 'coadmin' && sheetPairState.status === 'active' ? (
                <svg style={styles.tetherSvg} aria-hidden>
                  <path
                    d={tetherPath(22, 67)}
                    stroke={CONFLICT_AMBER}
                    strokeWidth={3}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx={10} cy={22} r={3} fill={CONFLICT_AMBER} />
                  <circle cx={10} cy={67} r={3} fill={CONFLICT_AMBER} />
                </svg>
              ) : null}
            </div>
          </Sheet>
        ) : null}

        {ui.sheet != null && ui.sheet.kind === 'about' ? (
          <Sheet
            titleId="dvr-about-title"
            title="Dovetail Rx"
            detent={ui.sheetDetent}
            onDetentChange={detent => updateUi({sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={null}>
            <div style={styles.aboutBody}>
              <div style={styles.pairHero} aria-hidden>
                <DovetailMark size={64} />
              </div>
              <p style={styles.aboutText}>
                Dovetail Rx keeps your medication schedule and its drug-interaction rules in one joint — like a
                dovetail, doses only fit where they belong. Amber tethers mark same-slot conflicts, spacing chips
                count gap rules off your last dose, and every change can be undone.
              </p>
              <p style={styles.aboutText}>
                {MEDS.length} medications · {TOTAL_DOSES} doses today · {MONITORED_PAIR_COUNT} monitored pairs
              </p>
            </div>
          </Sheet>
        ) : null}

        {actionDose != null ? (
          <ActionSheet
            header={actionHeader}
            options={actionOptions}
            onCancel={closeActionSheet}
            cancelRef={cancelRef}
            wrapRef={actionWrapRef}
          />
        ) : null}
      </div>
    </div>
  );
}
