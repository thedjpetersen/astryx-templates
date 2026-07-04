// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Lintel's Front Door camera on the
 *   demo's frozen 'Fri, Jul 4': 12 door events across 6 active hours
 *   (MORNING 6 + AFTERNOON 4 + EVENING 2 = 12; ring segments 3+2+1+2+2+2 =
 *   12; pills All 12 = Unknown 6 (u1:3 + u2:2 + u3:1) + Known 4 (v1:2 +
 *   v2:2) + Motion 2), five visitors (v1 Priya · v2 Marcus labeled; u1, u2,
 *   u3 unknown = the '3 visitors' sublabel). No real photos anywhere —
 *   every frame is a deterministic inline-SVG silhouette on a stylized
 *   porch: for event seed N at frame k, x = 24 + ((N × 37) % 60) + k × 28,
 *   scale = 0.8 + ((N × 13) % 5) × 0.05 (max x = 24 + 59 + 196 = 279 +
 *   20 shoulder = 299 < 320 viewBox ✓). No Date.now(), no Math.random(),
 *   no network media.
 * @output Lintel — Doorbell Event Reel: a 390px MOBILE door-camera triage
 *   surface. Large-title header ('Front Door' 28/700 + 'Fri, Jul 4') under
 *   a 52px navBar whose compact title fades in via an IntersectionObserver
 *   sentinel; a 160px 24-segment activity ring (13° arcs + 2° gaps × 24 =
 *   360° ✓) whose active hours color amber (any unknown visitor) or indigo
 *   (known/motion-safe), filtered by a snap-rail of hour chips; a
 *   day-grouped list of 72px event rows that expand inline into an 8-frame
 *   filmstrip player with a pointer-draggable loupe (role=slider), 44×44
 *   frame steppers, and 2-second timestamp steps ('6:12:06 AM'). Signature
 *   move: the label-visitor action sheet writes ONE visitorLabels map entry
 *   and every surface re-derives in a single pass — u1's 3 chips and 3
 *   silhouettes recolor, ring segment 6 flips amber→indigo, the Unknown
 *   pill drops 6→3 events · 3→2 visitors, Known climbs 4→7 — held by an
 *   Undo toast whose snapshot restores the exact prior maps.
 * @position Page template; emitted by `astryx template mobile-doorbell-event-reel`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, action sheet) are position:'absolute'
 *   INSIDE shell; position:fixed is banned. While the action sheet is
 *   open, shell locks to {height:'100dvh', overflow:'hidden'} and restores
 *   on close; the toast dock is sticky-in-flow (bottom 68, above the 64px
 *   tabBar) and switches to absolute bottom:76 only while the shell is
 *   scroll-locked.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 76 for 48px-thumb media rows); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Lintel indigo #4F46E5 — the demo's --color-brand is the
 *   demo logo blue, so the spec hex is quarantined here per house rule);
 *   sanctioned non-brand literals are the UNKNOWN_AMBER hour pair, the
 *   4-color visitor accent palette, and the switch OFF track — each with
 *   contrast math at the declaration (foundations amendment: interactive
 *   boundaries and meaningful rest fills need explicit ≥3:1 pairs vs their
 *   ACTUAL surface; the foundations' 14%-alpha OFF track fails that, so a
 *   solid ≥3:1 pair replaces it).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — declared
 *   choice, no scroll wiring for the hairline); largeTitle row 52px (28/700
 *   at the 16px gutter; total large header 104px); ringBlock ≈224px (24px
 *   block padding + 160×160 SVG + center readout 22/700 tabular) over a
 *   44px hour-chip snap rail (32px visual chips inside 44px hits);
 *   filterRow 36px pills; 72px media rows (48px thumb, 12px radius, 16/500
 *   + 13/400 two-line stack, 2px gap), dividers inset 76 (16 pad + 48
 *   thumb + 12 gap), last row none; sectionHeader 13/600 uppercase 0.06em
 *   at 32px (16 gutter + 16 card pad), 20px top / 8px bottom; filmstrip
 *   player ≈236px (120px stage + 40×28 thumbs at 6px radius + 48×36 loupe
 *   ring in a 44px hit + 44×44 steppers + 13px tabular readout + 36px
 *   'Label visitor'/'Save clip' buttons 16px apart); tabBar exactly 64px,
 *   4 tabItems flex:1, 24px icon over 11/500 label, 4px gap; toast 48px.
 *   TYPE (Figtree via --font-family-body): 28/700 large title · 22/700
 *   ring count · 17/600 nav + sheet titles · 16/400–500 row primary floor
 *   · 13/400 meta · 11/500 chips + badges; nothing under 11px;
 *   tabular-nums on the ring count, timestamp readout, and every pill
 *   count. Touch: every target ≥44×44 with ≥8px clearance or merged into
 *   a full-row button; every gesture (loupe drag, snap rails) has a
 *   visible button path (44×44 steppers, thumb buttons, chip radios).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals: ring SVG fixed 160×160 centered
 *   (160 + 32 gutters = 192 < 320 ✓); hourChipRail and filterRow are
 *   overflowX:'auto' snap rails (scrollPaddingInline 16, ≥24px peek — 6
 *   chips × ~96px ≈ 576px always scrolls, proving the affordance); the
 *   filmstrip stage is width:'100%' with viewBox 0 0 320 120 (silhouette
 *   math lives in viewBox units so it scales); the 8-thumb strip (8×40 +
 *   7×4 = 348px) exceeds a 288px card interior at 320, so it is its own
 *   snap rail with the loupe positioned in strip coordinates; steppers sit
 *   OUTSIDE the rail so they never clip. Row primary minWidth:0 ellipsis;
 *   chips flexShrink:0, maxWidth 128.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport — the demo stage is
 *   ~1045px inside a 1440px window) — at ≥720px the shell renders as a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout; the reel anatomy is deliberately
 *   phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  BellIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilmIcon,
  RefreshCwIcon,
  SearchXIcon,
  SettingsIcon,
  VideoIcon,
  VideoOffIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math beside it.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Lintel indigo). #4F46E5 on #FFFFFF ≈ 6.3:1
// (passes 4.5:1 text and 3:1 boundary); #A5B4FC on the dark card (~#1C1C1E)
// ≈ 8.5:1.
const BRAND_ACCENT = 'light-dark(#4F46E5, #A5B4FC)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #4F46E5 ≈ 6.3:1. Dark:
// white on #A5B4FC fails (~1.9:1), so the dark side flips to near-black
// indigo — #1B1E4B on #A5B4FC ≈ 7.9:1.
const BRAND_ON = 'light-dark(#FFFFFF, #1B1E4B)';
// 12% brand wash for selected chips/pills — decorative tint behind text
// that itself passes 4.5:1 (BRAND_ACCENT on the washed card is within 0.2
// of its 6.3:1 / 8.5:1 plain-card ratios).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// UNKNOWN_AMBER — ring hours containing any unknown visitor. #B45309 on
// the white card/body ≈ 5.0:1; #FBBF24 on the dark card ≈ 10.2:1 — both
// clear the 3:1 non-text floor AND 4.5:1 for the 11px chip text reuse.
const UNKNOWN_AMBER = 'light-dark(#B45309, #FBBF24)';
// VISITOR ACCENT PALETTE — fixed 4 colors indexed by labeling order (v1,
// v2 seeded; the next labeled visitor takes index 2, then 3, then wraps).
// Each is used as 11px chip text on a 16% self-tint over the card AND as
// the silhouette fill on the muted stage (light muted ≈ #F1EFEC, L≈0.87);
// all light sides ≥ 4.9:1 on white so ≥ 4.5:1 on the faint tint and ≥
// 3.9:1 on muted; all dark sides are 300-weight hues ≥ 7:1 on #1C1C1E.
//   teal   #0F766E on #FFF ≈ 5.5:1 · #5EEAD4 on dark ≈ 12.1:1
//   violet #7C3AED on #FFF ≈ 5.7:1 · #C4B5FD on dark ≈ 9.0:1
//   red    #B91C1C on #FFF ≈ 6.5:1 · #FCA5A5 on dark ≈ 9.1:1
//   gold   #A16207 on #FFF ≈ 4.9:1 · #FDE047 on dark ≈ 12.6:1
const VISITOR_ACCENTS = [
  'light-dark(#0F766E, #5EEAD4)',
  'light-dark(#7C3AED, #C4B5FD)',
  'light-dark(#B91C1C, #FCA5A5)',
  'light-dark(#A16207, #FDE047)',
];
// Switch OFF track — the foundations' rgba(21,17,12,0.14) reads ~1.35:1 on
// the white card and FAILS the ≥3:1 interactive-boundary amendment, so an
// explicit solid pair replaces it: #8A857D on #FFF ≈ 3.5:1; #767B85 on the
// dark card ≈ 3.9:1.
const SWITCH_OFF_TRACK = 'light-dark(#8A857D, #767B85)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Chrome blur surface shared by navBar and tabBar.
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, the button reset, the visually
// hidden h1, the skeleton sweep, and the reduced-motion guard. Transitions
// animate transform/opacity/color only and collapse to instant under
// prefers-reduced-motion (the filmstrip glide becomes a plain frame swap;
// the skeleton sweep is removed entirely — static muted blocks remain).
// ---------------------------------------------------------------------------

const LINTEL_CSS = `
.ltl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.ltl-btn:disabled { cursor: default; }
.ltl-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.ltl-fade { transition: opacity 200ms ease; }
.ltl-glide { transition: transform 240ms ease; }
.ltl-color { transition: color 200ms ease, background-color 200ms ease, stroke 200ms ease, fill 200ms ease; }
@keyframes ltl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.ltl-sheet-in { animation: ltl-sheet-in 200ms ease; }
@keyframes ltl-sweep {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.ltl-skel { position: relative; overflow: hidden; }
.ltl-skel::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-text-secondary) 10%, transparent),
    transparent
  );
  animation: ltl-sweep 1.6s ease-in-out infinite;
}
.ltl-vh {
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
  .ltl-fade, .ltl-glide, .ltl-color { transition: none; }
  .ltl-sheet-in { animation: none; }
  .ltl-skel::after { animation: none; display: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, largeTitle,
// tabBar, tabItem, sheetScrim, actionSheet, listCard, row, rowDivider,
// sectionHeader, toastDock.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width.
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
  // Scroll lock while the action sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 buttons
  // optically align content to the 16px gutter; hairline ALWAYS ON.
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
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // LARGE TITLE — 52px in flow below the sticky navBar (total header 104).
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, lineHeight: 1.2, margin: 0},
  largeTitleDate: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // 1px IntersectionObserver sentinel that drives the navBar title fade.
  sentinel: {height: 1},
  // RING BLOCK — ≈224px: 24px block padding around the 160×160 SVG.
  ringBlock: {
    paddingBlock: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  ringWrap: {position: 'relative', width: 160, height: 160},
  ringCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  ringCenterStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    textAlign: 'center',
    maxWidth: 104,
  },
  ringCount: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  ringCaption: {fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.25},
  // HOUR CHIP RAIL — the ring's keyboard/button path; snap rail, 44px hits.
  hourChipRail: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    width: '100%',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 16,
  },
  hourChipHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    borderRadius: 12,
  },
  hourChip: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 'var(--radius-element, 12px)',
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  hourChipOn: {
    background: BRAND_TINT_12,
    border: `1px solid ${BRAND_ACCENT}`,
    color: BRAND_ACCENT,
    fontWeight: 600,
  },
  hourDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  // FILTER ROW — 36px pills, 8px gap, radiogroup snap rail.
  filterRow: {
    display: 'flex',
    gap: 8,
    marginTop: 16,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 16,
  },
  pill: {
    height: 36,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingInline: 14,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    whiteSpace: 'nowrap',
  },
  pillOn: {background: BRAND_ACCENT, color: BRAND_ON},
  pillLabel: {fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1},
  pillSub: {fontSize: 11, fontWeight: 500, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, opacity: 0.8},
  // LIST — inset-grouped cards; 12px between stacked cards, 24px between
  // sections.
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
  // 72px media row — 48px thumb at 12px radius, two-line stack, trailing
  // chip; whole row is ONE button.
  row: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  rowThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    overflow: 'hidden',
    background: 'var(--color-background-muted)',
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
  // Divider inset 76 = 16 pad + 48 thumb + 12 gap; last row none.
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 76},
  rowDividerShallow: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // VisitorIdentityChip — 20px presentational pill inside the row button.
  chip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    flexShrink: 0,
    maxWidth: 128,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  chipText: {whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  // FILMSTRIP PLAYER — expanded region under a tapped row (~236px).
  player: {
    padding: '0 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  playerStage: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    background: 'var(--color-background-muted)',
    display: 'block',
  },
  stripRow: {display: 'flex', alignItems: 'center', gap: 4},
  stepBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
  },
  stepBtnDisabled: {opacity: 0.35},
  // Thumb strip — its own snap rail (8×40 + 7×4 = 348px exceeds a 288px
  // card interior at 320); the loupe lives in strip coordinates so it
  // scrolls with the rail; steppers sit outside and never clip.
  stripRail: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 4,
    paddingInline: 4,
  },
  thumbHit: {
    width: 40,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    scrollSnapAlign: 'start',
  },
  thumbBox: {
    width: 40,
    height: 28,
    borderRadius: 6,
    overflow: 'hidden',
    background: 'var(--color-background-muted)',
    display: 'block',
  },
  // Loupe — 48×36 visual ring inside a 48×44 hit (44px touch law); 2px
  // BRAND_ACCENT border ≈ 6.3:1 light / 8.5:1 dark vs the muted strip —
  // the rest-state boundary clears 3:1 on its actual surface.
  loupe: {
    position: 'absolute',
    top: 0,
    width: 48,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    touchAction: 'none',
  },
  loupeRing: {
    width: 48,
    height: 36,
    borderRadius: 8,
    border: `2px solid ${BRAND_ACCENT}`,
    boxSizing: 'border-box',
  },
  readout: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
  },
  playerActions: {display: 'flex', justifyContent: 'center', gap: 16},
  secondaryBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 'var(--radius-element, 12px)',
    border: `1px solid ${BRAND_ACCENT}`,
    color: BRAND_ACCENT,
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  neutralBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 'var(--radius-element, 12px)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  bottomSpacer: {height: 24},
  // EMPTY STATE (filtered-empty variant).
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIconCircle: {
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
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '4px 0 16px',
    lineHeight: 1.4,
  },
  // SKELETON — 72px rows matching the media-row geometry exactly.
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
    flexShrink: 0,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  skeletonLines: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // TOAST DOCK — sticky-in-flow height-0 anchor rendered just before the
  // tabBar: pins 68px above the viewport bottom (64 tabBar + 4) even
  // mid-scroll; shell-absolute would anchor to the DOCUMENT bottom on this
  // tall scrolling view. While the shell is scroll-locked for the action
  // sheet it switches to absolute bottom:76. Always mounted for aria-live.
  toastDock: {
    position: 'sticky',
    bottom: 68,
    zIndex: 30,
    height: 0,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    height: 'auto',
    marginInline: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastStatic: {position: 'static'},
  toastMsg: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // TAB BAR — exactly 64px, 4 tabs flex:1.
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
  // ACTION SHEET — scrim z40 + two cards absolute insetInline 16 bottom 16
  // z41 (occupies the sheet layer; never stacked).
  sheetScrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
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
  },
  actionSheetRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    paddingInline: 16,
  },
  actionSheetCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
  },
  sheetHairline: {height: 1, background: 'var(--color-border)'},
  // STUB SCREENS — 44px utility rows and stub cards.
  utilityRow: {
    width: '100%',
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
  // SWITCH — 51×31 track per foundations; whole 44px row is the button.
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    marginLeft: 'auto',
    flexShrink: 0,
    position: 'relative',
  },
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: 999,
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — module-level consts, identity via string ids, dual fields
// (timeLabel display string + startSeconds sortable) throughout.
// CROSS-CHECK LEDGER (verified by hand): sections 6 + 4 + 2 = 12; ring
// hours 3 + 2 + 1 + 2 + 2 + 2 = 12 (hours 6, 8, 11, 12, 15, 17); pills
// All 12 = Unknown 6 (u1:3 + u2:2 + u3:1) + Known 4 (v1: ev-4 + ev-9,
// v2: ev-6 + ev-11) + Motion 2 (ev-5, ev-10); unknown VISITORS = 3.
// Initial ring: amber hours 6, 12, 17 (any-unknown rule — hour 17 is
// mixed v2 + u3), indigo hours 8, 11, 15 (motion-only companions count
// known-safe). AFTER labeling u1: Unknown 6→3 events · 3→2 visitors,
// Known 4→7, Motion 2 constant, 7 + 3 + 2 = 12 ✓, amber 3→2.
// ---------------------------------------------------------------------------

type TabId = 'activity' | 'cameras' | 'clips' | 'settings';
type PillId = 'all' | 'unknown' | 'known' | 'motion';

interface VisitorLabel {
  name: string;
  role: string;
}

// v1/v2 seed the visitorLabels map; u1/u2/u3 start unlabeled.
const SEED_LABELS: Record<string, VisitorLabel> = {
  v1: {name: 'Priya', role: 'Courier'},
  v2: {name: 'Marcus', role: 'Neighbor'},
};

interface DoorEvent {
  id: string;
  seed: number; // drives the deterministic silhouette walk
  hour: number; // 0–23
  timeLabel: string; // display twin of startSeconds
  startSeconds: number; // seconds since midnight (dual field)
  visitorId: string | null;
  kind: 'person' | 'motion';
  primary: string;
}

// startSeconds cross-checks: ev-1 6×3600 + 12×60 = 22320 (frame 3 reads
// 6:12:06 AM ✓ — spec example); ev-8 12×3600 + 38×60 = 45480 (frame 7
// reads 12:38:14 PM ✓ — stress 7). ev-6's primary is the longest fixture
// string (stress 2: 16px/500 ellipsis against the trailing chip at 320).
const EVENTS: DoorEvent[] = [
  {id: 'ev-1', seed: 1, hour: 6, timeLabel: '6:12 AM', startSeconds: 22320, visitorId: 'u1', kind: 'person', primary: 'Person at front door'},
  {id: 'ev-2', seed: 2, hour: 6, timeLabel: '6:31 AM', startSeconds: 23460, visitorId: 'u1', kind: 'person', primary: 'Person at front door'},
  {id: 'ev-3', seed: 3, hour: 6, timeLabel: '6:48 AM', startSeconds: 24480, visitorId: 'u1', kind: 'person', primary: 'Person on porch steps'},
  {id: 'ev-4', seed: 4, hour: 8, timeLabel: '8:05 AM', startSeconds: 29100, visitorId: 'v1', kind: 'person', primary: 'Package drop-off at door'},
  {id: 'ev-5', seed: 5, hour: 8, timeLabel: '8:44 AM', startSeconds: 31440, visitorId: null, kind: 'motion', primary: 'Motion near the steps'},
  {id: 'ev-6', seed: 6, hour: 11, timeLabel: '11:20 AM', startSeconds: 40800, visitorId: 'v2', kind: 'person', primary: 'Person at front door — lingered'},
  {id: 'ev-7', seed: 7, hour: 12, timeLabel: '12:10 PM', startSeconds: 43800, visitorId: 'u2', kind: 'person', primary: 'Person at front door'},
  {id: 'ev-8', seed: 8, hour: 12, timeLabel: '12:38 PM', startSeconds: 45480, visitorId: 'u2', kind: 'person', primary: 'Person left the porch'},
  {id: 'ev-9', seed: 9, hour: 15, timeLabel: '3:15 PM', startSeconds: 54900, visitorId: 'v1', kind: 'person', primary: 'Second delivery attempt'},
  {id: 'ev-10', seed: 10, hour: 15, timeLabel: '3:52 PM', startSeconds: 57120, visitorId: null, kind: 'motion', primary: 'Motion at the walkway'},
  {id: 'ev-11', seed: 11, hour: 17, timeLabel: '5:05 PM', startSeconds: 61500, visitorId: 'v2', kind: 'person', primary: 'Person at front door'},
  {id: 'ev-12', seed: 12, hour: 17, timeLabel: '5:41 PM', startSeconds: 63660, visitorId: 'u3', kind: 'person', primary: 'Person near the door'},
];

const EVENT_BY_ID: Record<string, DoorEvent> = Object.fromEntries(
  EVENTS.map(event => [event.id, event]),
);

// Day sections — MORNING ev-1..6, AFTERNOON ev-7..10, EVENING ev-11..12.
const SECTIONS: {id: string; label: string; hours: number[]}[] = [
  {id: 'morning', label: 'Morning', hours: [6, 8, 11]},
  {id: 'afternoon', label: 'Afternoon', hours: [12, 15]},
  {id: 'evening', label: 'Evening', hours: [17]},
];

// ACTION SHEET presets — verbs only, no inputs (actionSheet contract).
// Choosing 'Building maintenance' for u2 is the long-label chip stress
// (maxWidth 128 ellipsis in the 20px pill — stress 1).
const SHEET_PRESETS: {id: string; text: string; label: VisitorLabel}[] = [
  {id: 'preset-sam', text: 'Sam — dog walker', label: {name: 'Sam', role: 'Dog walker'}},
  {id: 'preset-courier', text: 'Delivery courier', label: {name: 'Delivery courier', role: 'Courier'}},
  {id: 'preset-maint', text: 'Building maintenance', label: {name: 'Building maintenance', role: 'Maintenance'}},
];

// Skeleton bar widths — deterministic stagger per the foundations
// (primary 60/45/70/60, secondary 40/55/30/40), never Math.random().
const SKELETON_WIDTHS: {primary: string; secondary: string}[] = [
  {primary: '60%', secondary: '40%'},
  {primary: '45%', secondary: '55%'},
  {primary: '70%', secondary: '30%'},
  {primary: '60%', secondary: '40%'},
];

// Stub-tab fixtures.
const CAMERAS = [
  {id: 'cam-front', name: 'Front Door', status: 'Live · 1080p · this reel', active: true},
  {id: 'cam-gate', name: 'Back Gate', status: 'Standby · saves battery', active: false},
];

const DEMO_DATE = 'Fri, Jul 4';

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Seconds since midnight → 'h:mm:ss AM' (tabular-nums at the call site). */
function fmtClock(totalSeconds: number): string {
  const h24 = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${suffix}`;
}

/** Hour (0–23) → '6–7 AM' / '11 AM–12 PM' / '12–1 PM'. */
function hourRange(hour: number): string {
  const a = hour % 12 === 0 ? 12 : hour % 12;
  const next = hour + 1;
  const b = next % 12 === 0 ? 12 : next % 12;
  const sa = hour < 12 ? 'AM' : 'PM';
  const sb = next < 12 || next >= 24 ? 'AM' : 'PM';
  return sa === sb ? `${a}–${b} ${sa}` : `${a} ${sa}–${b} ${sb}`;
}

// ---------------------------------------------------------------------------
// RING GEOMETRY — 24 segments × 15° = 360° ✓ (13° stroked arc + 2° gap,
// gap split 1° per side); r 66, strokeWidth 14, hour 0 at 12 o'clock,
// clockwise. Angles measured from 12 o'clock so hour h starts at h × 15°.
// ---------------------------------------------------------------------------

const RING_C = 80;
const RING_R = 66;

function ringPoint(deg: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: RING_C + RING_R * Math.sin(rad), y: RING_C - RING_R * Math.cos(rad)};
}

function ringSegPath(hour: number): string {
  const from = ringPoint(hour * 15 + 1);
  const to = ringPoint(hour * 15 + 14);
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${RING_R} ${RING_R} 0 0 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

interface HourStat {
  hour: number;
  count: number;
  anyUnknown: boolean;
}

// ---------------------------------------------------------------------------
// SILHOUETTE GEOMETRY — the deterministic frame walk. For event seed N at
// frame k (0..7): x = 24 + ((N × 37) % 60) + k × 28 (glide left→right in
// the 320-wide viewBox), scale = 0.8 + ((N × 13) % 5) × 0.05. Edge check
// (stress 5): ev-12 frame 7 → x = 24 + (444 % 60) + 196 = 24 + 24 + 196 =
// 244; max possible x = 24 + 59 + 196 = 279 + shoulder halfwidth 20 = 299
// < 320 ✓.
// ---------------------------------------------------------------------------

function silhouetteX(seed: number, frame: number): number {
  return 24 + ((seed * 37) % 60) + frame * 28;
}

function silhouetteScale(seed: number): number {
  return 0.8 + ((seed * 13) % 5) * 0.05;
}

// ---------------------------------------------------------------------------
// PorchScene — the stylized no-photos doorbell frame: lintel arch, door
// slab, two step lines in --color-text-secondary strokes on the muted
// stage; person events walk an accent-filled silhouette (labeled visitors
// recolor from ONE visitorLabels map; unknowns render text-secondary,
// ≥4.5:1 vs muted in both schemes), motion events sweep dashed arcs. The
// glide is transform-only (.ltl-glide) and collapses to a plain frame
// swap under prefers-reduced-motion.
// ---------------------------------------------------------------------------

interface PorchSceneProps {
  seed: number;
  frame: number;
  kind: 'person' | 'motion';
  accent: string | null;
  // Cropped renders (48px row thumbs, 40×28 strip thumbs) pass a tracking
  // window width in viewBox units: the crop follows the silhouette (clamped
  // to the 320 stage) so the subject never slides out of a tiny thumb —
  // the full stage renders un-tracked so the frame walk stays visible.
  track?: number;
}

function PorchScene({seed, frame, kind, accent, track}: PorchSceneProps) {
  const x = silhouetteX(seed, frame);
  const scale = silhouetteScale(seed);
  const fill = accent ?? 'var(--color-text-secondary)';
  const viewBox =
    track != null
      ? `${Math.max(0, Math.min(320 - track, x - track / 2)).toFixed(1)} 0 ${track} 120`
      : '0 0 320 120';
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={track != null ? 'xMidYMid slice' : 'xMidYMid meet'}
      style={{display: 'block', width: '100%', height: '100%'}}
      aria-hidden>
      <rect width={320} height={120} fill="var(--color-background-muted)" />
      {/* Porch frame — lintel arch, door slab + knob, two step lines. */}
      <path d="M56 30 Q160 8 264 30" stroke="var(--color-text-secondary)" strokeWidth={2} fill="none" opacity={0.7} />
      <rect x={136} y={30} width={48} height={74} rx={3} stroke="var(--color-text-secondary)" strokeWidth={2} fill="none" opacity={0.7} />
      <circle cx={148} cy={70} r={2.5} fill="var(--color-text-secondary)" opacity={0.7} />
      <line x1={96} y1={110} x2={224} y2={110} stroke="var(--color-text-secondary)" strokeWidth={2} opacity={0.55} />
      <line x1={80} y1={117} x2={240} y2={117} stroke="var(--color-text-secondary)" strokeWidth={2} opacity={0.35} />
      {kind === 'person' ? (
        <g
          className="ltl-glide"
          style={{transform: `translate(${x}px, 104px) scale(${scale})`}}>
          <circle cx={0} cy={-46} r={10} fill={fill} />
          <path d="M-20 0 Q-17 -25 0 -28 Q17 -25 20 0 Z" fill={fill} />
        </g>
      ) : (
        <g className="ltl-glide" style={{transform: `translate(${x}px, 96px)`}}>
          <path d="M-14 0 A14 14 0 0 1 14 0" stroke={fill} strokeWidth={2.5} strokeDasharray="4 5" fill="none" />
          <path d="M-24 8 A24 24 0 0 1 24 8" stroke={fill} strokeWidth={2.5} strokeDasharray="4 5" fill="none" opacity={0.6} />
        </g>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ActivityRingHours — decorative 160×160 SVG (aria-hidden): 24 segments,
// zero-event hours on the var(--color-border) passive track, active hours
// BRAND_ACCENT (known-safe) or UNKNOWN_AMBER (any unknown visitor). The
// INTERACTIVE path is the hourChipRail below it — spec asked for 44×44
// transparent overlay buttons per active segment, but hours 11 and 12 are
// adjacent (15° apart → arc-midpoint chord 2 × 66 × sin(7.5°) ≈ 17px), so
// 44px hits cannot meet the ≥8px-clearance law at r66; the chips are the
// sole tap/keyboard path (deviation, noted in the doc).
// ---------------------------------------------------------------------------

const ALL_HOURS = Array.from({length: 24}, (_, hour) => hour);

interface ActivityRingHoursProps {
  stats: HourStat[]; // active hours only, ascending
  hourFilter: number | null;
}

function ActivityRingHours({stats, hourFilter}: ActivityRingHoursProps) {
  const byHour = new Map(stats.map(stat => [stat.hour, stat]));
  return (
    <svg width={160} height={160} viewBox="0 0 160 160" fill="none" aria-hidden>
      {ALL_HOURS.map(hour => {
        const stat = byHour.get(hour);
        const color = stat == null ? 'var(--color-border)' : stat.anyUnknown ? UNKNOWN_AMBER : BRAND_ACCENT;
        const dimmed = hourFilter != null && stat != null && hour !== hourFilter;
        return (
          <path
            key={hour}
            d={ringSegPath(hour)}
            stroke={color}
            strokeWidth={14}
            strokeLinecap="butt"
            className="ltl-fade ltl-color"
            opacity={dimmed ? 0.35 : 1}
          />
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// VisitorIdentityChip — 20px presentational pill inside the 72px row's
// single button. Unknown/Motion: muted fill + 11px/500 text-secondary.
// Named: color-mix(accent 16%, transparent) fill + 11px/500 text in the
// accent itself (light accents ≥4.9:1 on white so ≥4.5:1 over the faint
// tint; dark accents are 300-weight ≥7:1 on the dark card — math at the
// palette declaration).
// ---------------------------------------------------------------------------

interface VisitorChipProps {
  event: DoorEvent;
  label: VisitorLabel | null;
  accent: string | null;
}

function VisitorChip({event, label, accent}: VisitorChipProps) {
  if (event.kind === 'motion') {
    return (
      <span style={styles.chip}>
        <span style={styles.chipText}>Motion</span>
      </span>
    );
  }
  if (label == null || accent == null) {
    return (
      <span style={styles.chip}>
        <span style={styles.chipText}>Unknown</span>
      </span>
    );
  }
  return (
    <span
      className="ltl-color"
      style={{
        ...styles.chip,
        background: `color-mix(in srgb, ${accent} 16%, transparent)`,
        color: accent,
        fontWeight: 600,
      }}>
      <span style={styles.chipText}>{label.name}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// EventFilmstripScrubber — 8 stylized frames: 120px stage (viewBox units so
// it scales 320–430), then the thumb snap rail (8 × 40×28 at 6px radius,
// each thumb a real button in a 44px-tall hit) with the pointer-draggable
// loupe (role=slider, ArrowLeft/Right/Home/End; snaps to nearest of 8
// slots), flanked by 44×44 steppers OUTSIDE the rail (disabled at frames 0
// and 7, 35% opacity). Timestamp readout = start + frame × 2 s.
// ---------------------------------------------------------------------------

const FRAME_COUNT = 8;
const SLOT_W = 44; // 40px thumb + 4px gap; loupe left = frame × 44

interface FilmstripProps {
  event: DoorEvent;
  frame: number;
  accent: string | null;
  canLabel: boolean;
  saved: boolean;
  onFrame: (frame: number) => void;
  onLabel: (opener: HTMLElement) => void;
  onSave: () => void;
}

function EventFilmstripScrubber({event, frame, accent, canLabel, saved, onFrame, onLabel, onSave}: FilmstripProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const clock = fmtClock(event.startSeconds + frame * 2);

  const slotFromPointer = (clientX: number): number => {
    const rail = railRef.current;
    if (rail == null) return frame;
    const rect = rail.getBoundingClientRect();
    const xInStrip = clientX - rect.left + rail.scrollLeft;
    return Math.max(0, Math.min(FRAME_COUNT - 1, Math.round((xInStrip - 24) / SLOT_W)));
  };
  const onLoupePointerDown = (pointerEvent: ReactPointerEvent<HTMLButtonElement>) => {
    draggingRef.current = true;
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
  };
  const onLoupePointerMove = (pointerEvent: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    const slot = slotFromPointer(pointerEvent.clientX);
    if (slot !== frame) onFrame(slot);
  };
  const onLoupePointerUp = () => {
    draggingRef.current = false;
  };
  const onLoupeKeyDown = (keyEvent: ReactKeyboardEvent<HTMLButtonElement>) => {
    let next: number | null = null;
    if (keyEvent.key === 'ArrowLeft') next = Math.max(0, frame - 1);
    else if (keyEvent.key === 'ArrowRight') next = Math.min(FRAME_COUNT - 1, frame + 1);
    else if (keyEvent.key === 'Home') next = 0;
    else if (keyEvent.key === 'End') next = FRAME_COUNT - 1;
    if (next == null) return;
    keyEvent.preventDefault();
    onFrame(next);
  };

  return (
    <div style={styles.player}>
      <div style={{...styles.playerStage, aspectRatio: '320 / 120'}}>
        <PorchScene seed={event.seed} frame={frame} kind={event.kind} accent={accent} />
      </div>
      <div style={styles.stripRow}>
        <button
          type="button"
          className="ltl-btn ltl-focusable"
          style={{...styles.stepBtn, ...(frame === 0 ? styles.stepBtnDisabled : null)}}
          disabled={frame === 0}
          aria-label="Previous frame"
          onClick={() => onFrame(frame - 1)}>
          <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
        </button>
        <div ref={railRef} style={styles.stripRail}>
          {Array.from({length: FRAME_COUNT}, (_, k) => (
            <button
              key={k}
              type="button"
              className="ltl-btn ltl-focusable"
              style={styles.thumbHit}
              aria-label={`Frame ${k + 1} of 8, ${fmtClock(event.startSeconds + k * 2)}`}
              aria-current={k === frame}
              onClick={() => onFrame(k)}>
              <span style={styles.thumbBox}>
                <PorchScene seed={event.seed} frame={k} kind={event.kind} accent={accent} track={171} />
              </span>
            </button>
          ))}
          {/* Loupe — THE slider control (48×36 ring in a 48×44 hit, strip
              coordinates so it scrolls with the rail). */}
          <button
            type="button"
            role="slider"
            className="ltl-btn ltl-focusable ltl-glide"
            style={{...styles.loupe, left: 0, transform: `translateX(${frame * SLOT_W}px)`}}
            aria-label={`Scrub ${event.primary} frames`}
            aria-valuemin={0}
            aria-valuemax={FRAME_COUNT - 1}
            aria-valuenow={frame}
            aria-valuetext={clock}
            aria-orientation="horizontal"
            onPointerDown={onLoupePointerDown}
            onPointerMove={onLoupePointerMove}
            onPointerUp={onLoupePointerUp}
            onKeyDown={onLoupeKeyDown}>
            <span style={styles.loupeRing} aria-hidden />
          </button>
        </div>
        <button
          type="button"
          className="ltl-btn ltl-focusable"
          style={{...styles.stepBtn, ...(frame === FRAME_COUNT - 1 ? styles.stepBtnDisabled : null)}}
          disabled={frame === FRAME_COUNT - 1}
          aria-label="Next frame"
          onClick={() => onFrame(frame + 1)}>
          <Icon icon={ChevronRightIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.readout}>
        Frame {frame + 1} of 8 · {clock}
      </div>
      <div style={styles.playerActions}>
        {canLabel ? (
          <button
            type="button"
            className="ltl-btn ltl-focusable"
            style={styles.secondaryBtn}
            onClick={clickEvent => onLabel(clickEvent.currentTarget)}>
            Label visitor
          </button>
        ) : null}
        <button
          type="button"
          className="ltl-btn ltl-focusable"
          style={{...styles.neutralBtn, ...(saved ? {color: 'var(--color-text-secondary)'} : null)}}
          disabled={saved}
          onClick={onSave}>
          {saved ? (
            <>
              <Icon icon={CheckIcon} size="sm" color="inherit" />
              Saved to Clips
            </>
          ) : (
            'Save clip'
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHARED UTILITIES — container width, scroller lookup, focus trap.
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns scroll. */
function getScroller(element: HTMLElement | null): HTMLElement | null {
  let node = element?.parentElement ?? null;
  while (node != null) {
    const style = window.getComputedStyle(node);
    if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
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

// ---------------------------------------------------------------------------
// LintelMark — 24px door-arch/keyhole-eye brand glyph in the 44×44 leading
// nav button.
// ---------------------------------------------------------------------------

function LintelMark() {
  return (
    <span style={styles.brandMark}>
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
        <path d="M3.5 16V9.5Q3.5 3 9 3q5.5 0 5.5 6.5V16" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
        <circle cx={9} cy={9.5} r={2.1} fill="currentColor" />
        <path d="M9 11.4v2.4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useState(INITIAL_STATE) in the root with a single
// update(patch) helper; every surface calls it. Aggregates are NEVER
// stored: pills, ring colors, chips, and silhouettes all re-derive from
// visitorLabels + reclassifiedIds in one render pass.
// ---------------------------------------------------------------------------

interface ToastUndo {
  visitorLabels: Record<string, VisitorLabel>;
  reclassifiedIds: string[];
}

interface ToastState {
  seq: number;
  msg: string;
  undo: ToastUndo | null;
}

// sheetFor carries {visitorId, eventId} — the spec stored the visitorId
// alone, but the 'Not a person (reclassify)' row applies to ONE event, so
// the opener's event rides along (deviation, noted).
interface SheetTarget {
  visitorId: string;
  eventId: string;
}

interface ReelState {
  tab: TabId;
  visitorLabels: Record<string, VisitorLabel>;
  expandedEventId: string | null;
  frameByEvent: Record<string, number>; // scrub position persists per event
  hourFilter: number | null;
  pillFilter: PillId;
  sheetFor: SheetTarget | null;
  toast: ToastState | null;
  skeleton: boolean;
  savedClipIds: string[];
  reclassifiedIds: string[]; // ev ids flipped to motion by the sheet
  personAlerts: boolean;
  scrollByTab: Partial<Record<TabId, number>>;
}

const INITIAL_STATE: ReelState = {
  tab: 'activity',
  visitorLabels: SEED_LABELS,
  expandedEventId: null,
  frameByEvent: {},
  hourFilter: null,
  pillFilter: 'all',
  sheetFor: null,
  toast: null,
  skeleton: false,
  savedClipIds: [],
  reclassifiedIds: [],
  personAlerts: true,
  scrollByTab: {},
};

const TABS: {id: TabId; label: string; icon: typeof BellIcon}[] = [
  {id: 'activity', label: 'Activity', icon: BellIcon},
  {id: 'cameras', label: 'Cameras', icon: VideoIcon},
  {id: 'clips', label: 'Clips', icon: FilmIcon},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
];

const NAV_TITLES: Record<TabId, string> = {
  activity: 'Front Door',
  cameras: 'Cameras',
  clips: 'Clips',
  settings: 'Settings',
};

export default function MobileDoorbellEventReelTemplate() {
  const [state, setState] = useState<ReelState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<ReelState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);
  const [titleVisible, setTitleVisible] = useState(false);

  // Container width, not viewport: ≥720px container = centered phone
  // column; the viewport query is only the first-frame fallback.
  const width = useElementWidth(wrapRef);
  const viewportWide = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = width > 0 ? width >= 720 : viewportWide;

  // Large-title collapse — IntersectionObserver on the 1px sentinel above
  // largeTitle drives the navBar title 0→1 (opacity swap only, which is
  // already reduced-motion-safe).
  useEffect(() => {
    if (state.tab !== 'activity') return undefined;
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry != null) setTitleVisible(!entry.isIntersecting);
      },
      {rootMargin: '-52px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [state.tab]);

  // -------------------------------------------------------------------------
  // DERIVED DATA — one pass from the two mutation maps.
  // -------------------------------------------------------------------------

  const labels = state.visitorLabels;
  const effectiveEvents: DoorEvent[] = EVENTS.map(event =>
    state.reclassifiedIds.includes(event.id)
      ? {...event, kind: 'motion' as const, visitorId: null}
      : event,
  );
  // Accents index by labeling order (map insertion order): v1→teal,
  // v2→violet, first newly labeled unknown→red, next→gold, then wrap.
  const labelOrder = Object.keys(labels);
  const accentFor = (visitorId: string | null): string | null => {
    if (visitorId == null) return null;
    const index = labelOrder.indexOf(visitorId);
    return index >= 0 ? VISITOR_ACCENTS[index % VISITOR_ACCENTS.length] : null;
  };
  const isUnknown = (event: DoorEvent) =>
    event.kind === 'person' && event.visitorId != null && labels[event.visitorId] == null;
  const isKnown = (event: DoorEvent) =>
    event.kind === 'person' && event.visitorId != null && labels[event.visitorId] != null;
  // Pill ledger (Known counts only person events with labeled visitors):
  // initial 12 = 6 + 4 + 2; after labeling u1 → 12 = 3 + 7 + 2 ✓.
  const unknownEvents = effectiveEvents.filter(isUnknown);
  const unknownCount = unknownEvents.length;
  const knownCount = effectiveEvents.filter(isKnown).length;
  const motionCount = effectiveEvents.filter(event => event.kind === 'motion').length;
  const unknownVisitors = new Set(unknownEvents.map(event => event.visitorId)).size;

  const hourStatMap = new Map<number, HourStat>();
  for (const event of effectiveEvents) {
    const stat = hourStatMap.get(event.hour) ?? {hour: event.hour, count: 0, anyUnknown: false};
    stat.count += 1;
    if (isUnknown(event)) stat.anyUnknown = true;
    hourStatMap.set(event.hour, stat);
  }
  const hourStats = [...hourStatMap.values()].sort((a, b) => a.hour - b.hour);

  const pillPass = (event: DoorEvent): boolean => {
    if (state.pillFilter === 'all') return true;
    if (state.pillFilter === 'unknown') return isUnknown(event);
    if (state.pillFilter === 'known') return isKnown(event);
    return event.kind === 'motion';
  };
  const isVisible = (event: DoorEvent): boolean =>
    pillPass(event) && (state.hourFilter == null || event.hour === state.hourFilter);
  const visibleEvents = effectiveEvents.filter(isVisible);

  const filterStat = state.hourFilter != null ? hourStatMap.get(state.hourFilter) : undefined;
  const ringCount = filterStat != null ? filterStat.count : effectiveEvents.length;
  const ringCaption = filterStat != null ? `events, ${hourRange(filterStat.hour)}` : 'events today';

  // -------------------------------------------------------------------------
  // MUTATIONS — every one lands in update() and announces via the ONE
  // polite toast region. No auto-dismiss timers: a toast persists until
  // Undo fires or the next mutation replaces it (undoOverConfirm law).
  // -------------------------------------------------------------------------

  const makeToast = (msg: string, undo: ToastUndo | null = null): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, undo};
  };

  const restoreSheetFocus = (target: SheetTarget | null) => {
    const opener = sheetOpenerRef.current;
    if (opener != null && opener.isConnected) opener.focus();
    else if (target != null) document.getElementById(`ltl-row-${target.eventId}`)?.focus();
  };

  const openSheet = (visitorId: string, eventId: string, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    update({sheetFor: {visitorId, eventId}});
  };
  const closeSheet = () => {
    const target = state.sheetFor;
    update({sheetFor: null});
    restoreSheetFocus(target);
  };

  // Label flow: snapshot prev maps → write ONE visitorLabels entry → the
  // Unknown pill, ring segment, chips, and silhouettes re-derive together.
  const applyLabel = (label: VisitorLabel) => {
    const target = state.sheetFor;
    if (target == null) return;
    const count = effectiveEvents.filter(event => event.visitorId === target.visitorId).length;
    const undo: ToastUndo = {visitorLabels: state.visitorLabels, reclassifiedIds: state.reclassifiedIds};
    update({
      visitorLabels: {...state.visitorLabels, [target.visitorId]: label},
      sheetFor: null,
      toast: makeToast(`${count} event${count === 1 ? '' : 's'} labeled ${label.name}`, undo),
    });
    restoreSheetFocus(target);
  };

  // Reclassify flips kind→motion for the sheet's ONE event; same snapshot
  // semantics so Undo restores exactly the prior maps (stress 6).
  const reclassify = () => {
    const target = state.sheetFor;
    if (target == null) return;
    const event = EVENT_BY_ID[target.eventId];
    const undo: ToastUndo = {visitorLabels: state.visitorLabels, reclassifiedIds: state.reclassifiedIds};
    update({
      reclassifiedIds: [...state.reclassifiedIds, target.eventId],
      sheetFor: null,
      toast: makeToast(`${event.timeLabel} reclassified as motion`, undo),
    });
    restoreSheetFocus(target);
  };

  const undoFromToast = () => {
    const undo = state.toast?.undo;
    if (undo == null) return;
    update({
      visitorLabels: undo.visitorLabels,
      reclassifiedIds: undo.reclassifiedIds,
      toast: makeToast('Restored'),
    });
  };

  const onRefresh = () => {
    // Skeleton is reached ONLY by user action and resolves on the next
    // user action in the filterRow — no timers. 'Loading' announces once.
    update({tab: 'activity', skeleton: true, toast: makeToast('Loading')});
  };
  const onPill = (pill: PillId) => {
    if (state.skeleton) {
      update({pillFilter: pill, skeleton: false, toast: makeToast('Updated just now')});
    } else {
      update({pillFilter: pill});
    }
  };
  const onHourChip = (hour: number) => {
    update({hourFilter: state.hourFilter === hour ? null : hour});
  };

  const toggleRow = (eventId: string) => {
    update({expandedEventId: state.expandedEventId === eventId ? null : eventId});
  };
  const setFrame = (eventId: string, frame: number) => {
    update({frameByEvent: {...state.frameByEvent, [eventId]: frame}});
  };
  const saveClip = (event: DoorEvent) => {
    if (state.savedClipIds.includes(event.id)) return;
    update({
      savedClipIds: [...state.savedClipIds, event.id],
      toast: makeToast(`Clip saved to Clips · ${event.timeLabel}`),
    });
  };

  // Per-tab persistence: scroll saved on exit, restored on entry; the one
  // legal reset is re-tapping the ACTIVE tab (pops filters + scrolls top).
  // Overlays close on switch; the toast dock persists.
  const switchTab = (tab: TabId) => {
    const scroller = getScroller(shellRef.current);
    if (tab === state.tab) {
      if (tab === 'activity') update({hourFilter: null, pillFilter: 'all'});
      scroller?.scrollTo({top: 0});
      return;
    }
    const restoreTo = state.scrollByTab[tab] ?? 0;
    update({
      tab,
      sheetFor: null,
      scrollByTab: {...state.scrollByTab, [state.tab]: scroller?.scrollTop ?? 0},
    });
    requestAnimationFrame(() => {
      const nextScroller = getScroller(shellRef.current);
      if (nextScroller != null) nextScroller.scrollTop = restoreTo;
    });
  };

  const openClip = (eventId: string) => {
    const scroller = getScroller(shellRef.current);
    update({
      tab: 'activity',
      expandedEventId: eventId,
      hourFilter: null,
      pillFilter: 'all',
      scrollByTab: {...state.scrollByTab, clips: scroller?.scrollTop ?? 0},
    });
    requestAnimationFrame(() => {
      document.getElementById(`ltl-row-${eventId}`)?.scrollIntoView({block: 'center'});
    });
  };

  // Focus into the opening sheet — preventScroll, because plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen (foundations amendment).
  useEffect(() => {
    if (state.sheetFor != null) cancelRef.current?.focus({preventScroll: true});
  }, [state.sheetFor]);

  // Escape closes the topmost overlay only — the action sheet is the sole
  // overlay layer here.
  useEffect(() => {
    if (state.sheetFor == null) return undefined;
    const onKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Escape') closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sheetFor]);

  // Roving radiogroup/tablist arrow keys (hour chips, pills, tabs).
  const onRovingKeyDown = (groupEvent: ReactKeyboardEvent<HTMLDivElement | HTMLElement>, role: string) => {
    const {key} = groupEvent;
    if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'ArrowUp' && key !== 'ArrowDown') return;
    groupEvent.preventDefault();
    const items = Array.from(groupEvent.currentTarget.querySelectorAll<HTMLElement>(`[role="${role}"]`));
    const index = items.indexOf(document.activeElement as HTMLElement);
    const dir = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1;
    const next = items[(index + dir + items.length) % items.length];
    next?.focus();
    next?.click();
  };

  // -------------------------------------------------------------------------
  // RENDER FRAGMENTS
  // -------------------------------------------------------------------------

  const renderEventRow = (event: DoorEvent, index: number) => {
    const frame = state.frameByEvent[event.id] ?? 0;
    const label = event.visitorId != null ? labels[event.visitorId] ?? null : null;
    const accent = accentFor(event.visitorId);
    const expanded = state.expandedEventId === event.id;
    return (
      <div key={event.id}>
        {index > 0 ? <div style={styles.rowDivider} /> : null}
        <button
          type="button"
          id={`ltl-row-${event.id}`}
          className="ltl-btn ltl-focusable"
          style={styles.row}
          aria-expanded={expanded}
          aria-label={`${event.primary}, ${event.timeLabel}`}
          onClick={() => toggleRow(event.id)}>
          <span style={styles.rowThumb} aria-hidden>
            <PorchScene seed={event.seed} frame={frame} kind={event.kind} accent={accent} track={120} />
          </span>
          <span style={styles.rowText}>
            <span style={styles.rowPrimary}>{event.primary}</span>
            <span style={styles.rowSecondary}>
              {event.timeLabel} · 14 s clip{label != null ? ` · ${label.role}` : ''}
            </span>
          </span>
          <VisitorChip event={event} label={label} accent={accent} />
        </button>
        {expanded ? (
          <EventFilmstripScrubber
            event={event}
            frame={frame}
            accent={accent}
            canLabel={event.visitorId != null && labels[event.visitorId] == null}
            saved={state.savedClipIds.includes(event.id)}
            onFrame={next => setFrame(event.id, next)}
            onLabel={opener => {
              if (event.visitorId != null) openSheet(event.visitorId, event.id, opener);
            }}
            onSave={() => saveClip(event)}
          />
        ) : null}
      </div>
    );
  };

  const renderEmpty = () => {
    const allLabeled = state.pillFilter === 'unknown' && unknownCount === 0;
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIconCircle}>
          <Icon icon={SearchXIcon} size="lg" color="inherit" />
        </span>
        <h3 style={styles.emptyTitle}>{allLabeled ? 'No unknown visitors' : 'No matching events'}</h3>
        <p style={styles.emptyBody}>
          {allLabeled ? 'Every visitor today is labeled.' : 'Nothing recorded for this filter combination.'}
        </p>
        <button
          type="button"
          className="ltl-btn ltl-focusable"
          style={styles.secondaryBtn}
          onClick={() => update({pillFilter: 'all', hourFilter: null})}>
          Show all events
        </button>
      </div>
    );
  };

  const renderSkeleton = () => (
    <div style={{...styles.listCard, marginTop: 20}} aria-busy>
      {SKELETON_WIDTHS.map((widths, index) => (
        <div key={index}>
          {index > 0 ? <div style={styles.rowDivider} /> : null}
          <div style={styles.skeletonRow} aria-hidden>
            <div className="ltl-skel" style={styles.skeletonThumb} />
            <div style={styles.skeletonLines}>
              <div className="ltl-skel" style={{...styles.skeletonBar, width: widths.primary}} />
              <div className="ltl-skel" style={{...styles.skeletonBar, width: widths.secondary}} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDayList = () => {
    if (state.skeleton) return renderSkeleton();
    if (visibleEvents.length === 0) return renderEmpty();
    if (state.hourFilter != null) {
      const hourEvents = visibleEvents; // already hour-scoped
      return (
        <>
          <h2 style={styles.sectionHeader}>
            Filtered · {hourRange(state.hourFilter)} · {hourEvents.length} event{hourEvents.length === 1 ? '' : 's'}
          </h2>
          <div style={styles.listCard}>{hourEvents.map(renderEventRow)}</div>
        </>
      );
    }
    return (
      <>
        {SECTIONS.map(section => {
          const sectionEvents = visibleEvents.filter(event => section.hours.includes(event.hour));
          if (sectionEvents.length === 0) return null;
          return (
            <div key={section.id}>
              <h2 style={styles.sectionHeader}>
                {section.label} · {sectionEvents.length} event{sectionEvents.length === 1 ? '' : 's'}
              </h2>
              <div style={styles.listCard}>{sectionEvents.map(renderEventRow)}</div>
            </div>
          );
        })}
        {state.pillFilter === 'all' ? (
          <p style={styles.terminalCaption}>All {effectiveEvents.length} events</p>
        ) : null}
      </>
    );
  };

  const renderActivity = () => (
    <>
      <div ref={sentinelRef} style={styles.sentinel} aria-hidden />
      <div style={styles.largeTitle}>
        <span style={styles.largeTitleText}>Front Door</span>
        <span style={styles.largeTitleDate}>{DEMO_DATE}</span>
      </div>
      <div style={styles.ringBlock}>
        <div style={styles.ringWrap}>
          <ActivityRingHours stats={hourStats} hourFilter={state.hourFilter} />
          <div style={styles.ringCenter}>
            <div style={styles.ringCenterStack}>
              <span style={styles.ringCount}>{ringCount}</span>
              <span style={styles.ringCaption}>{ringCaption}</span>
            </div>
          </div>
        </div>
        {/* The ring's tap/keyboard path — one radio chip per populated
            hour, so filtered-empty by hour alone is impossible. */}
        <div
          style={styles.hourChipRail}
          role="radiogroup"
          aria-label="Filter by hour"
          onKeyDown={keyEvent => onRovingKeyDown(keyEvent, 'radio')}>
          {hourStats.map(stat => {
            const on = state.hourFilter === stat.hour;
            return (
              <button
                key={stat.hour}
                type="button"
                role="radio"
                aria-checked={on}
                className="ltl-btn ltl-focusable"
                style={styles.hourChipHit}
                onClick={() => onHourChip(stat.hour)}>
                <span className="ltl-color" style={{...styles.hourChip, ...(on ? styles.hourChipOn : null)}}>
                  <span
                    style={{
                      ...styles.hourDot,
                      background: stat.anyUnknown ? UNKNOWN_AMBER : BRAND_ACCENT,
                    }}
                    aria-hidden
                  />
                  {hourRange(stat.hour)} · {stat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div
        style={styles.filterRow}
        role="radiogroup"
        aria-label="Filter events"
        onKeyDown={keyEvent => onRovingKeyDown(keyEvent, 'radio')}>
        {(
          [
            {id: 'all' as PillId, label: `All · ${effectiveEvents.length}`, sub: null},
            {id: 'unknown' as PillId, label: `Unknown · ${unknownCount}`, sub: `${unknownVisitors} visitor${unknownVisitors === 1 ? '' : 's'}`},
            {id: 'known' as PillId, label: `Known · ${knownCount}`, sub: null},
            {id: 'motion' as PillId, label: `Motion · ${motionCount}`, sub: null},
          ]
        ).map(pill => {
          const on = state.pillFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              role="radio"
              aria-checked={on}
              className="ltl-btn ltl-focusable ltl-color"
              style={{...styles.pill, ...(on ? styles.pillOn : null)}}
              onClick={() => onPill(pill.id)}>
              <span style={styles.pillLabel}>{pill.label}</span>
              {pill.sub != null ? <span style={styles.pillSub}>{pill.sub}</span> : null}
            </button>
          );
        })}
      </div>
      <div aria-busy={state.skeleton || undefined}>{renderDayList()}</div>
      <div style={styles.bottomSpacer} />
    </>
  );

  const renderCameras = () => (
    <>
      <h2 style={styles.sectionHeader}>Cameras</h2>
      <div style={styles.listCard}>
        {CAMERAS.map((camera, index) => (
          <div key={camera.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <button
              type="button"
              className="ltl-btn ltl-focusable"
              style={styles.row}
              aria-label={`${camera.name}, ${camera.status}`}
              onClick={() =>
                camera.active
                  ? switchTab('activity')
                  : update({toast: makeToast('Back Gate is on standby — wake it from the camera')})
              }>
              <span style={styles.rowThumb} aria-hidden>
                {camera.active ? (
                  <PorchScene seed={4} frame={0} kind="person" accent={accentFor('v1')} track={120} />
                ) : (
                  <span style={{width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--color-text-secondary)'}}>
                    <Icon icon={VideoOffIcon} size="md" color="inherit" />
                  </span>
                )}
              </span>
              <span style={styles.rowText}>
                <span style={styles.rowPrimary}>{camera.name}</span>
                <span style={styles.rowSecondary}>{camera.status}</span>
              </span>
              {camera.active ? (
                <span style={{...styles.chip, background: BRAND_TINT_12, color: BRAND_ACCENT, fontWeight: 600}}>
                  <span style={styles.chipText}>Live</span>
                </span>
              ) : null}
            </button>
          </div>
        ))}
      </div>
      <div style={styles.bottomSpacer} />
    </>
  );

  const renderClips = () => (
    <>
      <h2 style={styles.sectionHeader}>
        Saved clips · {state.savedClipIds.length}
      </h2>
      {state.savedClipIds.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIconCircle}>
            <Icon icon={FilmIcon} size="lg" color="inherit" />
          </span>
          <h3 style={styles.emptyTitle}>No saved clips</h3>
          <p style={styles.emptyBody}>Clips you save from an event appear here.</p>
          <button
            type="button"
            className="ltl-btn ltl-focusable"
            style={styles.secondaryBtn}
            onClick={() => switchTab('activity')}>
            Browse today&rsquo;s events
          </button>
        </div>
      ) : (
        <div style={styles.listCard}>
          {state.savedClipIds.map((eventId, index) => {
            const event = EVENT_BY_ID[eventId];
            const frame = state.frameByEvent[eventId] ?? 0;
            return (
              <div key={eventId}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <button
                  type="button"
                  className="ltl-btn ltl-focusable"
                  style={styles.row}
                  aria-label={`Open clip: ${event.primary}, ${event.timeLabel}`}
                  onClick={() => openClip(eventId)}>
                  <span style={styles.rowThumb} aria-hidden>
                    <PorchScene seed={event.seed} frame={frame} kind={event.kind} accent={accentFor(event.visitorId)} track={120} />
                  </span>
                  <span style={styles.rowText}>
                    <span style={styles.rowPrimary}>{event.primary}</span>
                    <span style={styles.rowSecondary}>
                      {event.timeLabel} · frame {frame + 1} of 8
                    </span>
                  </span>
                  <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div style={styles.bottomSpacer} />
    </>
  );

  const renderSettings = () => (
    <>
      <h2 style={styles.sectionHeader}>Front Door camera</h2>
      <div style={styles.listCard}>
        {/* Whole 44px row IS the switch (role=switch, aria-checked). */}
        <button
          type="button"
          role="switch"
          aria-checked={state.personAlerts}
          className="ltl-btn ltl-focusable"
          style={styles.utilityRow}
          onClick={() =>
            update({
              personAlerts: !state.personAlerts,
              toast: makeToast(state.personAlerts ? 'Person alerts off' : 'Person alerts on'),
            })
          }>
          Person alerts
          <span
            className="ltl-color"
            style={{
              ...styles.switchTrack,
              background: state.personAlerts ? BRAND_ACCENT : SWITCH_OFF_TRACK,
            }}
            aria-hidden>
            <span
              className="ltl-glide"
              style={{
                ...styles.switchThumb,
                transform: state.personAlerts ? 'translateX(20px)' : 'none',
              }}
            />
          </span>
        </button>
        {(
          [
            {id: 'zones', label: 'Motion zones', value: '2 zones'},
            {id: 'storage', label: 'Clip storage', value: '3 of 30 days'},
            {id: 'chime', label: 'Chime', value: 'Classic bell'},
          ]
        ).map(row => (
          <div key={row.id}>
            <div style={styles.rowDividerShallow} />
            <button
              type="button"
              className="ltl-btn ltl-focusable"
              style={styles.utilityRow}
              onClick={() => update({toast: makeToast(`${row.label}: ${row.value} (demo fixture)`)})}>
              {row.label}
              <span style={styles.utilityValue}>{row.value}</span>
              <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
            </button>
          </div>
        ))}
      </div>
      <div style={styles.bottomSpacer} />
    </>
  );

  // -------------------------------------------------------------------------

  const sheetTarget = state.sheetFor;
  const sheetEventCount =
    sheetTarget != null
      ? effectiveEvents.filter(event => event.visitorId === sheetTarget.visitorId).length
      : 0;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(sheetTarget != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{LINTEL_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="ltl-btn ltl-focusable"
              style={{...styles.iconBtn, color: 'inherit'}}
              aria-label="Lintel home"
              onClick={() => update({toast: makeToast(`Lintel · Front Door · ${DEMO_DATE}`)})}>
              <LintelMark />
            </button>
          </div>
          <span
            className="ltl-fade"
            style={{
              ...styles.navTitle,
              opacity: state.tab === 'activity' ? (titleVisible ? 1 : 0) : 1,
            }}
            aria-hidden={state.tab === 'activity' && !titleVisible}>
            {NAV_TITLES[state.tab]}
          </span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="ltl-btn ltl-focusable"
              style={styles.iconBtn}
              aria-label="Refresh events"
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <h1 className="ltl-vh">Lintel — Front Door activity</h1>
          {state.tab === 'activity' ? renderActivity() : null}
          {state.tab === 'cameras' ? renderCameras() : null}
          {state.tab === 'clips' ? renderClips() : null}
          {state.tab === 'settings' ? renderSettings() : null}
        </main>

        {/* THE one polite live region — sticky-in-flow above the tabBar;
            absolute only while the shell is scroll-locked. */}
        <div
          style={sheetTarget != null ? styles.toastDockLocked : styles.toastDock}
          aria-live="polite">
          {state.toast != null ? (
            <div
              key={state.toast.seq}
              className="ltl-fade"
              style={sheetTarget != null ? {...styles.toast, ...styles.toastStatic} : styles.toast}>
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="ltl-btn ltl-focusable" style={styles.undoBtn} onClick={undoFromToast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav
          style={styles.tabBar}
          role="tablist"
          aria-label="Lintel sections"
          onKeyDown={keyEvent => onRovingKeyDown(keyEvent, 'tab')}>
          {TABS.map(tab => {
            const active = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="ltl-btn ltl-focusable ltl-color"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => switchTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'clips' && state.savedClipIds.length > 0 ? (
                    <span style={styles.tabBadge}>{state.savedClipIds.length}</span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {sheetTarget != null ? (
          <>
            <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ltl-sheet-title"
              className="ltl-sheet-in"
              style={styles.actionSheet}
              onKeyDown={keyEvent => trapTabKey(keyEvent, sheetRef.current)}>
              <div style={styles.actionSheetCard}>
                <div id="ltl-sheet-title" style={styles.actionSheetHeader}>
                  Label this visitor across {sheetEventCount} event{sheetEventCount === 1 ? '' : 's'}
                </div>
                {SHEET_PRESETS.map(preset => (
                  <div key={preset.id}>
                    <div style={styles.sheetHairline} />
                    <button
                      type="button"
                      className="ltl-btn ltl-focusable"
                      style={styles.actionSheetRow}
                      onClick={() => applyLabel(preset.label)}>
                      {preset.text}
                    </button>
                  </div>
                ))}
                <div style={styles.sheetHairline} />
                <button
                  type="button"
                  className="ltl-btn ltl-focusable"
                  style={styles.actionSheetRow}
                  onClick={reclassify}>
                  Not a person (reclassify)
                </button>
              </div>
              <div style={styles.actionSheetCard}>
                <button
                  type="button"
                  ref={cancelRef}
                  className="ltl-btn ltl-focusable"
                  style={styles.actionSheetCancel}
                  onClick={closeSheet}>
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
