var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Vanward's moving-day plan frozen at
 *   the fixed string 'Now 1:40 PM' (NOW_MIN 820) against a 5:00 PM keys
 *   deadline (1020): window = 200 min. 18 tasks (Pack 6 / Load 5 / Clean 4
 *   / Handoff 3; 4 done, 14 open) whose remaining minutes cross-check
 *   50+80+55+45 = 230 → deficit −30; a 1,200 cu ft truck (60 blocks × 20)
 *   with 180 loaded + 1,060 projected = 1,240 → a 2-block won't-fit band;
 *   a fixed CUT_PLAN (defer garage tools 20/160 + garage misc 15/120,
 *   merge the two wipes into a 20-min Full wipe-down) recovering exactly
 *   20+15+5 = 40 min and dropping 160+120 = 280 cu ft → post-accept slack
 *   +10 (Pack 15/Load 80/Clean 50/Handoff 45 = 190 ✓) and 960 cu ft = 48
 *   blocks = 80% ✓. Four crew (Maya/Dev/Priya/Sam). No Date.now(), no
 *   Math.random(), no network media.
 * @output Vanward — Moving Day Command: a 390px MOBILE dependency-aware
 *   command board. 52px navBar (Vanward ramp mark · CountdownPill 'Keys
 *   5:00 PM · −30 min' · 44×44 Re-plan) over a Board-only 52px 'Moving
 *   Day' large-title row and a 96px PressureHeader whose PhaseBlockTrack
 *   grows blocks by remaining minutes (50:80:55:45 → 78/124/86/70 of 358
 *   at 390) with a red '−30 min' pill overhanging the trailing edge;
 *   chain-locked 60px task rows that cascade-unlock (completing
 *   Disassemble couch unlocks Load couch, announced via the one toast),
 *   swipe-right-to-complete at +72px with the leading toggle circle and a
 *   44×44 ellipsis menu (Complete / Defer / Assign to…) as button paths;
 *   a Truck tab with an isometric SVG cross-section filling block-by-block
 *   with live won't-fit math and a Now/Projected radiogroup; a Crew tab
 *   with post-accept 'Moved to Clean' chips; and a two-detent TriageSheet
 *   proposing the computed 40-minute cut list whose Accept re-flows the
 *   track (27/143/89/81 + 18px '+10' slack cap), flips the pill green,
 *   drops 14 truck blocks, and offers exact-snapshot Undo.
 * @position Page template; emitted by \`astryx template mobile-moving-day-command\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, anchored menus) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   triage sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The stage clips to
 *   --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 — 68 never needed, no avatars in
 *   task lists); no desktop Layout frames, no asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Vanward #1F3A93 — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule). The
 *   sanctioned non-brand literals: three slack pairs (green/amber/red) +
 *   their washes, four phase-block pairs, the projected-truck-block pair,
 *   and the unchecked-toggle boundary pair — every one carries its
 *   contrast math vs its ACTUAL surface at the declaration (foundations
 *   amendment: interactive boundaries and meaningful rest fills need
 *   explicit ≥3:1 pairs, never hairline tokens).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr'), hairline+blur ALWAYS ON
 *   (declared choice, no scroll wiring); Board large-title row 52px
 *   (28px/700) → 104px total header before the 96px PressureHeader (12
 *   pad + 20 meta + 8 + 28 track + 16 legend + 12 pad); task rows 60px
 *   two-line (24px toggle circle in the full-row 44px+ hit, 16px/500
 *   primary, 13px/400 secondary, 2px gap, trailing 44×44 ellipsis);
 *   rowDivider 1px inset 16; sectionHeader 13px/600 uppercase 0.06em at
 *   32px, 20px top / 8px bottom, trailing '3 of 6 done' tabular; tabBar
 *   exactly 64px, 3 tabs flex:1 (24px icon over 11px/500 label, 4px gap);
 *   sticky Board CTA strip bottom 64 z19 (blur surface, 16px padding,
 *   48px full-width brand button); sheet detents 55% / calc(100% − 56px),
 *   24px grabber zone (36×5 pill), 52px sheet header, 48px sheet footer
 *   button; toastDock sticky-in-flow bottom 76 (152 on Board so it clears
 *   the CTA strip; absolute bottom 76 ONLY during sheet scroll-lock).
 *   TYPE (Figtree via --font-family-body): 28/700 large title · 17/600
 *   nav+sheet titles · 16/400–500 body+row primary · 13/400 meta ·
 *   13/600 countdown pill · 11/500 tab labels+overlines+track labels;
 *   nothing under 11px; tabular-nums on every countdown/minute/volume
 *   numeral. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   into a full-row button; every gesture (swipe-complete, sheet drag)
 *   has a visible button path (toggle circle + ellipsis menu, clickable
 *   grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430, zero width:390 literals: PhaseBlockTrack uses
 *   flex-grow ratios (remaining minutes) so the 358px arithmetic holds
 *   proportionally at any width; per-block minute labels hide when a
 *   block's estimated px < 44 (or the stage < 360) — the 16px legend row,
 *   keyed by swatch, carries them instead. TruckGauge SVG is width:100%
 *   against viewBox 358×200 (blocks scale uniformly); captions wrap at
 *   320. Row titles ellipsize single-line; triage trailing '+20 min' meta
 *   is fixed 64px. overflowX:'clip' on shell is backstop, not license.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout; the board is
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
  CalendarClockIcon,
  CheckIcon,
  LinkIcon,
  MoreHorizontalIcon,
  PartyPopperIcon,
  TruckIcon,
  UsersIcon,
  ListChecksIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with
// contrast math vs its ACTUAL surface (light card ≈ #FFFFFF, dark card ≈
// #1C1917; light body is near-white, dark body near-black — all fills
// below clear the SAME thresholds against both).
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Vanward indigo). #1F3A93 on #FFF ≈ 10.9:1;
// #9DB4F5 on #1C1917 ≈ 8.1:1 — both clear 4.5:1 for brand-tinted text.
const BRAND_ACCENT = 'light-dark(#1F3A93, #9DB4F5)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #1F3A93 ≈ 10.9:1. Dark:
// white on #9DB4F5 fails (~1.9:1), so the dark side flips to a near-black
// navy — #16233F on #9DB4F5 ≈ 7.6:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #16233F)';
// Slack states (countdown pill text, cut-list savings, deficit figures).
// #1A7F37 on #FFF ≈ 5.1:1; #4ADE80 on #1C1917 ≈ 10.0:1.
const SLACK_GREEN = 'light-dark(#1A7F37, #4ADE80)';
// #B45309 on #FFF ≈ 5.0:1; #FCD34D on #1C1917 ≈ 11.2:1.
const SLACK_AMBER = 'light-dark(#B45309, #FCD34D)';
// #B3261E on #FFF ≈ 6.5:1; #F87171 on #1C1917 ≈ 6.3:1.
const SLACK_RED = 'light-dark(#B3261E, #F87171)';
// Washes under slack text. SLACK_RED on RED_WASH: #B3261E on #FBE9E7 ≈
// 5.6:1; #F87171 on #3B1210 ≈ 6.0:1.
const RED_WASH = 'light-dark(#FBE9E7, #3B1210)';
// SLACK_GREEN on GREEN_WASH: #1A7F37 on #E6F4EA ≈ 4.6:1; #4ADE80 on
// #12341D ≈ 7.9:1.
const GREEN_WASH = 'light-dark(#E6F4EA, #12341D)';
// SLACK_AMBER on AMBER_WASH: #B45309 on #FCF3E5 ≈ 4.6:1; #FCD34D on
// #3A2A08 ≈ 9.6:1.
const AMBER_WASH = 'light-dark(#FCF3E5, #3A2A08)';
// Text over a SLACK_GREEN fill (swipe 'Done' block, done toggle). Light:
// #FFFFFF on #1A7F37 ≈ 5.1:1. Dark: white on #4ADE80 fails (~1.7:1), so
// the dark side flips to near-black green — #0B2913 on #4ADE80 ≈ 9.7:1.
// (Spec said 'white'; corrected for the dark scheme, math above.)
const GREEN_FILL_TEXT = 'light-dark(#FFFFFF, #0B2913)';
// Unchecked toggle-circle boundary — an INTERACTIVE control boundary, so
// it gets an explicit ≥3:1 pair vs the card it sits on, not a hairline
// token (foundations amendment): #767676 on #FFF ≈ 4.5:1; #9E9994 on
// #1C1917 ≈ 6.1:1.
const TOGGLE_BORDER = 'light-dark(#767676, #9E9994)';
// Phase-block fills — each ≥3:1 vs the body/card surface it sits on, and
// each carries an 11px minute label in TRACK_LABEL (worst case checked).
// Pack violet: #6741D9 on #FFF ≈ 6.3:1; #B197FC on #1C1917 ≈ 7.4:1.
const PHASE_PACK = 'light-dark(#6741D9, #B197FC)';
// Load reuses BRAND_ACCENT (10.9:1 / 8.1:1) — the truck's loaded blocks
// speak the same color.
const PHASE_LOAD = BRAND_ACCENT;
// Clean teal: #0B7285 on #FFF ≈ 5.6:1; #4FC3D9 on #1C1917 ≈ 8.4:1.
const PHASE_CLEAN = 'light-dark(#0B7285, #4FC3D9)';
// Handoff berry: #A61E4D on #FFF ≈ 7.2:1; #FAA2C1 on #1C1917 ≈ 9.1:1.
const PHASE_HANDOFF = 'light-dark(#A61E4D, #FAA2C1)';
// Minute labels INSIDE phase blocks: light-scheme blocks are dark fills →
// white (worst case #FFFFFF on #0B7285 ≈ 5.6:1); dark-scheme blocks are
// light fills → near-black (worst case #1C1917 on #B197FC ≈ 7.4:1).
const TRACK_LABEL = 'light-dark(#FFFFFF, #1C1917)';
// Projected truck blocks — a MEANINGFUL rest-state fill, so ≥3:1 vs the
// card is required. The spec's pair (#C9D4F0/#3A4A78) measured ≈1.5:1 /
// ≈2.0:1 vs the card — corrected (deviation, noted in the summary):
// #7189C4 on #FFF ≈ 3.5:1; #56679E on #1C1917 ≈ 3.2:1.
const PROJECTED_BLOCK = 'light-dark(#7189C4, #56679E)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Nav/tab/CTA blur surface — kit contract.
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, visually-hidden headings, and
// the reduced-motion guard. Transitions animate transform/opacity/color
// (plus the track's flex-grow re-flow) and collapse to instant under
// prefers-reduced-motion.
// ---------------------------------------------------------------------------

const VANWARD_CSS = \`
.vw-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.vw-btn:disabled { cursor: default; }
.vw-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.vw-anim { transition: transform 240ms ease, opacity 240ms ease; }
.vw-fade { transition: opacity 200ms ease; }
.vw-grow { transition: flex-grow 240ms ease; }
@keyframes vw-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.vw-sheet-in { animation: vw-sheet-in 240ms ease; }
.vw-vh {
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
  .vw-anim, .vw-fade, .vw-grow { transition: none; }
  .vw-sheet-in { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, largeTitle,
// tabBar, tabItem, sheetScrim, sheet, sheetGrabber, listCard, row,
// rowDivider, sectionHeader, toastDock, toast, emptyState.
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
  // Scroll lock while the triage sheet is open — absolute overlays anchor
  // to the visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px slots optically
  // align content to the 16px gutter; hairline + blur ALWAYS ON (declared
  // choice, no scroll wiring).
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // CountdownPill — 28px 999-radius pill, 13px/600 tabular; fill/text pair
  // driven by slack (green ≥10, amber 0–9, red <0). aria-live OFF — the
  // toastDock is the single announcer.
  countdownPill: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 12,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // LARGE TITLE — Board only, 52px row below the sticky navBar (104px
  // total header before the PressureHeader); scrolls away, navBar stays.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, lineHeight: 1.1, margin: 0},
  // PRESSURE HEADER — 96px total = 12 pad + 20 meta + 8 + 28 track + 16
  // legend + 12 pad. In flow (scrolls away) below the sticky navBar.
  pressureHeader: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingInline: 16,
  },
  pressureMeta: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  pressureMetaWork: {color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 500},
  // PhaseBlockTrack — 28px, flex-grow ratios from remaining-minute sums so
  // the 358px arithmetic (pre 78/124/86/70, post 27/143/89/81+18) holds at
  // any stage width.
  phaseTrack: {
    position: 'relative',
    display: 'flex',
    gap: 2,
    height: 28,
    borderRadius: 6,
  },
  phaseBlock: {
    minWidth: 6,
    height: 28,
    borderRadius: 6,
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
  },
  phaseBlockLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: TRACK_LABEL,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Deficit pill overhanging the trailing edge (right −8 stays inside the
  // 16px gutter → no horizontal overflow).
  deficitPill: {
    position: 'absolute',
    right: -8,
    top: 4,
    zIndex: 1,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: RED_WASH,
    border: \`1px solid \${SLACK_RED}\`,
    color: SLACK_RED,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 16px legend row — 11px/500 phase labels keyed by swatch (carries the
  // minutes for any block whose inline label is hidden).
  pressureLegend: {
    height: 16,
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  legendSwatch: {width: 8, height: 8, borderRadius: 2, flexShrink: 0},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom, trailing count tabular.
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  sectionHeaderCount: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // TASK ROW — 60px two-line; the whole row is the complete button (the
  // 24px toggle circle rides inside the full-row hit), trailing 44×44
  // ellipsis is a sibling.
  rowOuter: {position: 'relative'},
  rowClip: {position: 'relative', overflow: 'hidden'},
  // Swipe-right-to-complete: 72px SLACK_GREEN block revealed at the
  // LEADING edge (snap +72); square — the card's 12px radius clips it.
  doneAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: SLACK_GREEN,
    color: GREEN_FILL_TEXT,
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
  row: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    border: \`2px solid \${TOGGLE_BORDER}\`,
    color: GREEN_FILL_TEXT,
  },
  toggleCircleDone: {
    border: 'none',
    background: SLACK_GREEN,
  },
  // Locked glyph — 20px chain replaces the circle; non-text locked content
  // sits at 55% opacity while TEXT stays --color-text-secondary (≥4.5:1 —
  // never opacity on text, per spec).
  lockGlyph: {
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    opacity: 0.55,
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
  rowPrimaryDone: {
    color: 'var(--color-text-secondary)',
    textDecoration: 'line-through',
  },
  rowPrimaryLocked: {color: 'var(--color-text-secondary)'},
  rowSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Anchored row menu — absolute card, z30 (below the sheet scrim's z40).
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    minWidth: 224,
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
  menuRowMeta: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  menuCheck: {width: 20, flexShrink: 0, display: 'grid', placeItems: 'center', color: BRAND_ACCENT},
  // DEFERRED section — 28px pills inside 52px rows, 44px Restore hits.
  deferredRow: {
    minHeight: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    paddingInlineEnd: 4,
  },
  deferredPill: {
    height: 28,
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  deferredPillText: {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'},
  deferredPillMeta: {
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  restoreBtn: {
    height: 44,
    paddingInline: 12,
    marginInlineStart: 'auto',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  boardCaption: {
    margin: '16px 0 8px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // emptyState — all-done celebration (reachable via the unlock chain).
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    margin: '0 auto 16px',
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0'},
  // SEGMENTED CONTROL (Truck: Now / Projected) — 36px muted track, active
  // pill = card surface + hairline, radiogroup with arrow keys.
  segTrack: {
    marginInline: 16,
    marginBottom: 12,
    display: 'flex',
    gap: 2,
    height: 36,
    padding: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segItem: {
    flex: 1,
    height: 32,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  segItemActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  // TRUCK GAUGE card internals.
  gaugeSvgWrap: {padding: '16px 16px 8px'},
  gaugeCaption: {
    padding: '0 16px 12px',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  legendRowBtn: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
    fontSize: 16,
  },
  legendRowSwatch: {width: 12, height: 12, borderRadius: 3, flexShrink: 0},
  legendRowLabel: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  legendRowValue: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  truckFootnote: {
    margin: '8px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // CREW — 72px media rows, 40px initial-circle avatars.
  crewRow: {
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  crewAvatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  crewText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  crewName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  crewAssignment: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  movedChip: {
    flexShrink: 0,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: GREEN_WASH,
    color: SLACK_GREEN,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  // STICKY BOARD CTA — bottom 64 (above the 64px tabBar), z19, blur
  // surface; the screen's primary verb lives in the thumb zone.
  ctaFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    padding: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
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
    fontVariantNumeric: 'tabular-nums',
  },
  // TAB BAR — exactly 64px, 3 tabs flex:1, arrow-key tablist.
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 64,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // TOAST DOCK — sticky-in-flow (height 0) so it pins above the bottom
  // chrome even mid-scroll on tall boards (foundations amendment:
  // shell-absolute pins to the DOCUMENT bottom). bottom 76 = 64 tabBar +
  // 12; 152 on Board (clears the 80px CTA strip + 8). Always mounted for
  // aria-live. Absolute bottom 76 ONLY while the sheet scroll-locks shell.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    height: 'auto',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 'calc(100% - 32px)',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastLockedInner: {position: 'static'},
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingInlineEnd: 16,
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
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
  sheetGrabber: {
    width: '100%',
    height: 24,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    touchAction: 'none',
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
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  sheetConfirmBtn: {
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
  sheetConfirmDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  deficitCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  deficitText: {fontSize: 16, lineHeight: '22px', fontVariantNumeric: 'tabular-nums'},
  deficitBadge: {
    alignSelf: 'flex-start',
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  sheetSectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  cutCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cutRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  cutText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  cutPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cutSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Trailing '+20 min' meta — fixed 64px so long titles never push it.
  cutSaves: {
    width: 64,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: 600,
    color: SLACK_GREEN,
    fontVariantNumeric: 'tabular-nums',
  },
  cutApplied: {
    width: 20,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: SLACK_GREEN,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — one frozen clock (the fixed string 'Now 1:40 PM' = NOW_MIN
// 820; keys 5:00 PM = 1020 → WINDOW_MIN 200), dual fields everywhere,
// identity consts, aggregates derive live. CROSS-CHECK LEDGER (verified by
// hand): remaining 50+80+55+45 = 230 > 200 → deficit 30. Truck: capacity
// 1,200 = 60 × 20; loaded 180 (9 blocks) + remaining volume 140+260+260+
// 120+160+120 = 1,060 → projected 1,240 = 62 blocks → 2-block/40 cu ft
// won't-fit band. CUT_PLAN recovers 20+15+5 = 40 min, drops 160+120 = 280
// cu ft → post-accept remaining 230−40 = 190 (slack +10; Pack 15 / Load
// 80 / Clean 50 / Handoff 45 ✓) and 1,240−280 = 960 = 48 blocks = 80% ✓.
// ---------------------------------------------------------------------------

const NOW_LABEL = 'Now 1:40 PM';
const KEYS_LABEL = 'Keys 5:00 PM';
const WINDOW_MIN = 200; // 1:40 PM → 5:00 PM

const TRUCK_CAPACITY_CUFT = 1200; // 60 blocks × 20 cu ft each
const CUFT_PER_BLOCK = 20;
const TRUCK_COLS = 12;
const TRUCK_ROWS = 5; // 12 × 5 = 60 blocks

type PhaseId = 'pack' | 'load' | 'clean' | 'handoff';
type TabId = 'board' | 'truck' | 'crew';

interface Phase {
  id: PhaseId;
  name: string;
  color: string;
}

const PHASES: Phase[] = [
  {id: 'pack', name: 'Pack', color: PHASE_PACK},
  {id: 'load', name: 'Load', color: PHASE_LOAD},
  {id: 'clean', name: 'Clean', color: PHASE_CLEAN},
  {id: 'handoff', name: 'Handoff', color: PHASE_HANDOFF},
];

interface CrewMember {
  id: string;
  name: string;
  initials: string;
  prePhase: PhaseId;
  postPhase: PhaseId; // CUT_PLAN reassignment: Dev + Priya → Clean
}

const CREW: CrewMember[] = [
  {id: 'crew_maya', name: 'Maya Okafor', initials: 'MO', prePhase: 'load', postPhase: 'load'},
  {id: 'crew_dev', name: 'Dev Ramaswamy', initials: 'DR', prePhase: 'load', postPhase: 'clean'},
  {id: 'crew_priya', name: 'Priya Shah', initials: 'PS', prePhase: 'pack', postPhase: 'clean'},
  {id: 'crew_sam', name: 'Sam Whitfield', initials: 'SW', prePhase: 'clean', postPhase: 'clean'},
];

const CREW_BY_ID = Object.fromEntries(CREW.map(member => [member.id, member]));

// Dependency sentinel: an entire phase must finish (dep on PHASE, not tab
// order — stress fixture 3 verifies Final walkthrough stays locked until
// Clean completes even when Load is done first).
const DEP_CLEAN_PHASE = 'phase:clean';

interface MoveTask {
  id: string;
  phase: PhaseId;
  title: string;
  shortTitle: string; // blocker references + toasts stay short
  minutes: number; // dual field beside minutesLabel
  minutesLabel: string;
  volumeCuFt: number; // 0 = takes no truck space
  assigneeId: string;
  dependsOn: string[]; // task ids or DEP_CLEAN_PHASE
  done: boolean;
  deferred: boolean;
  mergedInto: string | null;
  active: boolean; // merged-product tasks start inactive
}

function task(partial: Omit<MoveTask, 'minutesLabel' | 'done' | 'deferred' | 'mergedInto' | 'active'> & {
  done?: boolean;
  active?: boolean;
}): MoveTask {
  return {
    minutesLabel: \`\${partial.minutes} min\`,
    done: partial.done ?? false,
    deferred: false,
    mergedInto: null,
    active: partial.active ?? true,
    ...partial,
  } as MoveTask;
}

// 18 tasks (t_wipe_full is the CUT_PLAN's merged product — inactive at
// rest, NOT part of the 18). t_load_couch's 74-char title is stress
// fixture 1 (60px row + swipe state + everywhere it renders, always
// single-line ellipsis).
const TASKS: MoveTask[] = [
  // PACK — remaining 15+20+15 = 50 ✓ (3 of 6 done)
  task({id: 't_pack_kitchen', phase: 'pack', title: 'Pack kitchen', shortTitle: 'Pack kitchen', minutes: 25, volumeCuFt: 0, assigneeId: 'crew_priya', dependsOn: [], done: true}),
  task({id: 't_pack_closets', phase: 'pack', title: 'Pack closets', shortTitle: 'Pack closets', minutes: 20, volumeCuFt: 0, assigneeId: 'crew_priya', dependsOn: [], done: true}),
  task({id: 't_pack_bath', phase: 'pack', title: 'Pack bathroom', shortTitle: 'Pack bathroom', minutes: 15, volumeCuFt: 0, assigneeId: 'crew_priya', dependsOn: [], done: true}),
  task({id: 't_couch_prep', phase: 'pack', title: 'Disassemble couch', shortTitle: 'Disassemble couch', minutes: 15, volumeCuFt: 0, assigneeId: 'crew_priya', dependsOn: []}),
  task({id: 't_garage_tools', phase: 'pack', title: 'Pack garage — tools', shortTitle: 'Pack garage — tools', minutes: 20, volumeCuFt: 160, assigneeId: 'crew_priya', dependsOn: []}),
  task({id: 't_garage_misc', phase: 'pack', title: 'Pack garage — misc', shortTitle: 'Pack garage — misc', minutes: 15, volumeCuFt: 120, assigneeId: 'crew_priya', dependsOn: []}),
  // LOAD — remaining 25+20+20+15 = 80 ✓; loaded 180; open volume 140+260+
  // 260+120 = 780
  task({id: 't_load_mattress', phase: 'load', title: 'Load mattresses', shortTitle: 'Load mattresses', minutes: 20, volumeCuFt: 180, assigneeId: 'crew_maya', dependsOn: [], done: true}),
  task({id: 't_load_couch', phase: 'load', title: 'Load sectional couch — chaise half, plastic-wrapped, straps in cab glovebox', shortTitle: 'Load couch', minutes: 25, volumeCuFt: 140, assigneeId: 'crew_dev', dependsOn: ['t_couch_prep']}),
  task({id: 't_load_wave1', phase: 'load', title: 'Load boxes — wave 1', shortTitle: 'Load boxes wave 1', minutes: 20, volumeCuFt: 260, assigneeId: 'crew_maya', dependsOn: []}),
  task({id: 't_load_wave2', phase: 'load', title: 'Load boxes — wave 2', shortTitle: 'Load boxes wave 2', minutes: 20, volumeCuFt: 260, assigneeId: 'crew_maya', dependsOn: ['t_load_wave1']}),
  task({id: 't_load_fragiles', phase: 'load', title: 'Load fragiles', shortTitle: 'Load fragiles', minutes: 15, volumeCuFt: 120, assigneeId: 'crew_dev', dependsOn: ['t_load_couch']}),
  // CLEAN — remaining 20+15+10+10 = 55 ✓
  task({id: 't_vacuum', phase: 'clean', title: 'Vacuum bedrooms', shortTitle: 'Vacuum bedrooms', minutes: 20, volumeCuFt: 0, assigneeId: 'crew_sam', dependsOn: []}),
  task({id: 't_wipe_kitchen', phase: 'clean', title: 'Wipe kitchen', shortTitle: 'Wipe kitchen', minutes: 15, volumeCuFt: 0, assigneeId: 'crew_sam', dependsOn: []}),
  task({id: 't_wipe_baths', phase: 'clean', title: 'Wipe baths', shortTitle: 'Wipe baths', minutes: 10, volumeCuFt: 0, assigneeId: 'crew_sam', dependsOn: []}),
  task({id: 't_patch', phase: 'clean', title: 'Patch walls', shortTitle: 'Patch walls', minutes: 10, volumeCuFt: 0, assigneeId: 'crew_sam', dependsOn: []}),
  // Merged product (inactive until CUT_PLAN accept): 15+10 → 20, saves 5.
  task({id: 't_wipe_full', phase: 'clean', title: 'Full wipe-down', shortTitle: 'Full wipe-down', minutes: 20, volumeCuFt: 0, assigneeId: 'crew_sam', dependsOn: [], active: false}),
  // HANDOFF — remaining 15+15+15 = 45 ✓
  task({id: 't_walkthrough', phase: 'handoff', title: 'Final walkthrough', shortTitle: 'Final walkthrough', minutes: 15, volumeCuFt: 0, assigneeId: 'crew_maya', dependsOn: [DEP_CLEAN_PHASE]}),
  task({id: 't_meter', phase: 'handoff', title: 'Meter photos', shortTitle: 'Meter photos', minutes: 15, volumeCuFt: 0, assigneeId: 'crew_dev', dependsOn: []}),
  task({id: 't_keys', phase: 'handoff', title: 'Keys + remotes', shortTitle: 'Keys + remotes', minutes: 15, volumeCuFt: 0, assigneeId: 'crew_maya', dependsOn: ['t_walkthrough']}),
];

// Fixed computed cut list — 20+15+5 = 40 min recovered, 160+120 = 280 cu
// ft dropped (both cross-checked above).
const CUT_PLAN = {
  deferIds: ['t_garage_tools', 't_garage_misc'],
  mergeSourceIds: ['t_wipe_kitchen', 't_wipe_baths'],
  mergedTaskId: 't_wipe_full',
  recoversMin: 40,
  dropsCuFt: 280,
  rows: [
    {id: 'cut_tools', primary: 'Defer: Pack garage — tools', secondary: 'Straight to the truck next trip', savesMin: 20},
    {id: 'cut_misc', primary: 'Defer: Pack garage — misc', secondary: 'Boxes are already staged', savesMin: 15},
    {id: 'cut_merge', primary: 'Merge: Wipe kitchen + Wipe baths → Full wipe-down', secondary: 'One pass, one bucket', savesMin: 5},
  ],
};

// ---------------------------------------------------------------------------
// DERIVATIONS — pure functions over the ONE task map; every surface
// (track, pill, counts, gauge, crew, sheet) reads these, never a copy.
// ---------------------------------------------------------------------------

type TaskMap = Record<string, MoveTask>;

const TASK_ORDER = TASKS.map(entry => entry.id);
const INITIAL_TASKS: TaskMap = Object.fromEntries(TASKS.map(entry => [entry.id, entry]));

/** On the board: active, not deferred, not merged away. */
function isVisible(entry: MoveTask): boolean {
  return entry.active && !entry.deferred && entry.mergedInto == null;
}

function visibleTasksOf(tasks: TaskMap, phase: PhaseId): MoveTask[] {
  return TASK_ORDER.map(id => tasks[id]).filter(entry => entry.phase === phase && isVisible(entry));
}

/** Remaining minutes for a phase = open visible tasks only. */
function remainingMinutes(tasks: TaskMap, phase: PhaseId): number {
  return visibleTasksOf(tasks, phase).reduce((sum, entry) => (entry.done ? sum : sum + entry.minutes), 0);
}

function totalRemaining(tasks: TaskMap): number {
  return PHASES.reduce((sum, phase) => sum + remainingMinutes(tasks, phase.id), 0);
}

/** slack = 200 − totalRemaining. Pre-triage −30; post-accept +10. */
function slackOf(tasks: TaskMap): number {
  return WINDOW_MIN - totalRemaining(tasks);
}

function depSatisfied(tasks: TaskMap, dep: string): boolean {
  if (dep === DEP_CLEAN_PHASE) {
    return visibleTasksOf(tasks, 'clean').every(entry => entry.done);
  }
  const blocker = tasks[dep];
  // A deferred or merged-away blocker no longer gates its dependents.
  return blocker == null || blocker.done || blocker.deferred || blocker.mergedInto != null;
}

function isUnlocked(tasks: TaskMap, entry: MoveTask): boolean {
  return entry.dependsOn.every(dep => depSatisfied(tasks, dep));
}

/** 'finish Disassemble couch' / 'finish Clean phase' for locked rows. */
function blockerLabel(tasks: TaskMap, entry: MoveTask): string {
  const unmet = entry.dependsOn.find(dep => !depSatisfied(tasks, dep));
  if (unmet == null) return '';
  if (unmet === DEP_CLEAN_PHASE) return 'finish Clean phase';
  return \`finish \${tasks[unmet].shortTitle}\`;
}

function lockedIds(tasks: TaskMap): Set<string> {
  return new Set(
    TASK_ORDER.filter(id => {
      const entry = tasks[id];
      return isVisible(entry) && !entry.done && !isUnlocked(tasks, entry);
    }),
  );
}

/** On the truck now = volume of DONE load-phase tasks (180 at rest). */
function loadedCuFt(tasks: TaskMap): number {
  return TASK_ORDER.map(id => tasks[id]).reduce(
    (sum, entry) => (entry.phase === 'load' && entry.done && !entry.deferred ? sum + entry.volumeCuFt : sum),
    0,
  );
}

/** Still headed for the truck = volume of open, non-deferred tasks
 * (includes the garage pack tasks — 1,060 at rest). */
function pendingCuFt(tasks: TaskMap): number {
  return TASK_ORDER.map(id => tasks[id]).reduce(
    (sum, entry) => (!entry.done && !entry.deferred && entry.mergedInto == null && entry.active ? sum + entry.volumeCuFt : sum),
    0,
  );
}

function deferredCuFt(tasks: TaskMap): number {
  return TASK_ORDER.map(id => tasks[id]).reduce((sum, entry) => (entry.deferred ? sum + entry.volumeCuFt : sum), 0);
}

function deferredTasks(tasks: TaskMap): MoveTask[] {
  return TASK_ORDER.map(id => tasks[id]).filter(entry => entry.deferred);
}

/** '−30 min' / '+10 min' — true minus sign, tabular numerals. */
function fmtSlack(slack: number): string {
  return \`\${slack < 0 ? '−' : '+'}\${Math.abs(slack)} min\`;
}

/** 1240 → '1,240' (deterministic; en-US grouping). */
function fmtCuFt(value: number): string {
  return value.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — usePlanStore(): the task graph + UI in one entities
// object with one update(id, patch); consequence chains are thin wrappers
// in the page. No child owns mirrored state except transient drag deltas.
// ---------------------------------------------------------------------------

type TruckView = 'now' | 'projected';
type MenuMode = 'actions' | 'assign';

interface ToastState {
  seq: number;
  msg: string;
  undo: boolean; // Undo button shown; NO auto-dismiss timer (house law)
}

interface UiState {
  tab: TabId;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  openSwipeRowId: string | null;
  openMenuId: string | null;
  menuMode: MenuMode;
  truckView: TruckView;
  toast: ToastState | null;
}

interface PlanEntities {
  tasks: TaskMap;
  planAccepted: boolean;
  ui: UiState;
}

const INITIAL_ENTITIES: PlanEntities = {
  tasks: INITIAL_TASKS,
  planAccepted: false,
  ui: {
    tab: 'board',
    sheetOpen: false,
    sheetDetent: 'medium',
    openSwipeRowId: null,
    openMenuId: null,
    menuMode: 'actions',
    truckView: 'projected',
    toast: null,
  },
};

function usePlanStore() {
  const [entities, setEntities] = useState<PlanEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof PlanEntities>(id: K, patch: Partial<PlanEntities[K]>) => {
      setEntities(prev => ({...prev, [id]: typeof prev[id] === 'object' ? {...(prev[id] as object), ...(patch as object)} : patch}) as PlanEntities);
    },
    [],
  );
  return {entities, update, setEntities};
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns page
 * scroll; per-tab scrollTop is recorded on exit and restored on entry. */
function findScroller(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node != null) {
    const {overflowY} = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — the sheet traps focus while open; Escape closes the
// topmost overlay only; focus restores to the opener on every close path.
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
// VANWARD MARK — 24px glyph in the 44×44 leading slot: an open truck-ramp
// stroke (BRAND_ACCENT) meeting a road baseline to form a forward chevron.
// ---------------------------------------------------------------------------

function VanwardMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M2.5 19.5h19" stroke="var(--color-text-primary)" strokeWidth={2} strokeLinecap="round" />
        <path d="M7 19.5 15.5 6" stroke={BRAND_ACCENT} strokeWidth={2.4} strokeLinecap="round" />
        <path d="M15.5 6l3.2 10.2" stroke="var(--color-text-primary)" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// COUNTDOWN PILL — navBar center; fill/text pair driven by slack (green
// ≥10, amber 0–9, red <0). aria-live OFF: the toastDock announces, this
// pill just re-renders.
// ---------------------------------------------------------------------------

function CountdownPill({slack}: {slack: number}) {
  const tone =
    slack < 0
      ? {background: RED_WASH, color: SLACK_RED, border: \`1px solid \${SLACK_RED}\`}
      : slack < 10
        ? {background: AMBER_WASH, color: SLACK_AMBER, border: \`1px solid \${SLACK_AMBER}\`}
        : {background: GREEN_WASH, color: SLACK_GREEN, border: \`1px solid \${SLACK_GREEN}\`};
  return (
    <span style={{...styles.countdownPill, ...tone}} aria-live="off">
      {KEYS_LABEL} · {fmtSlack(slack)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// PHASE BLOCK TRACK — pure flex-grow ratios from remaining-minute sums, so
// the spec arithmetic (pre 78/124/86/70 = 358 at 390; post 27/143/89/81 +
// 18px '+10' slack cap = 358) holds at ANY stage width. Inline minute
// labels hide when a block's estimated px < 44 (or stage < 360) — the
// legend row carries them, keyed by swatch.
// ---------------------------------------------------------------------------

interface PhaseBlockTrackProps {
  tasks: TaskMap;
  slack: number;
  trackWidthPx: number; // stage − 32 (estimated from measured shell width)
}

function PhaseBlockTrack({tasks, slack, trackWidthPx}: PhaseBlockTrackProps) {
  const perPhase = PHASES.map(phase => ({phase, minutes: remainingMinutes(tasks, phase.id)}));
  const slackCap = Math.max(slack, 0);
  const totalUnits = perPhase.reduce((sum, item) => sum + item.minutes, 0) + slackCap;
  const showInline = (minutes: number) =>
    totalUnits > 0 && trackWidthPx >= 328 && (minutes / totalUnits) * trackWidthPx >= 44;
  // The deficit pill overhangs the trailing block — that block's inline
  // label yields to it (the legend row still carries the number).
  const lastVisibleId = [...perPhase].reverse().find(item => item.minutes > 0)?.phase.id;
  return (
    <div
      style={{
        ...styles.phaseTrack,
        border: slack < 0 ? \`1px solid \${SLACK_RED}\` : '1px solid transparent',
      }}
      role="img"
      aria-label={\`Remaining work by phase: \${perPhase
        .filter(item => item.minutes > 0)
        .map(item => \`\${item.phase.name} \${item.minutes} minutes\`)
        .join(', ')}; \${slack < 0 ? \`\${Math.abs(slack)} minutes over\` : \`\${slack} minutes of slack\`}\`}>
      {perPhase.map(item =>
        item.minutes > 0 ? (
          <div
            key={item.phase.id}
            className="vw-grow"
            style={{...styles.phaseBlock, background: item.phase.color, flexGrow: item.minutes}}>
            {showInline(item.minutes) && !(slack < 0 && item.phase.id === lastVisibleId) ? (
              <span style={styles.phaseBlockLabel}>{item.minutes}</span>
            ) : null}
          </div>
        ) : null,
      )}
      {slackCap > 0 ? (
        <div
          className="vw-grow"
          style={{...styles.phaseBlock, background: SLACK_GREEN, flexGrow: slackCap}}>
          {showInline(slackCap) ? <span style={styles.phaseBlockLabel}>+{slackCap}</span> : null}
        </div>
      ) : null}
      {slack < 0 ? <span style={styles.deficitPill}>{fmtSlack(slack)}</span> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PRESSURE HEADER — 96px Board block: meta line, PhaseBlockTrack, legend.
// ---------------------------------------------------------------------------

function PressureHeader({tasks, slack, trackWidthPx}: PhaseBlockTrackProps) {
  const remaining = totalRemaining(tasks);
  return (
    <div style={styles.pressureHeader}>
      <div style={styles.pressureMeta}>
        <span>
          {NOW_LABEL} · {KEYS_LABEL.replace('Keys ', 'Keys ')}
        </span>
        <span style={styles.pressureMetaWork}>{remaining} min of work</span>
      </div>
      <PhaseBlockTrack tasks={tasks} slack={slack} trackWidthPx={trackWidthPx} />
      <div style={styles.pressureLegend}>
        {PHASES.map(phase => {
          const minutes = remainingMinutes(tasks, phase.id);
          return (
            <span key={phase.id} style={styles.legendItem}>
              <span style={{...styles.legendSwatch, background: phase.color}} aria-hidden />
              {phase.name} {minutes}m
            </span>
          );
        })}
        {slack >= 0 ? (
          <span style={styles.legendItem}>
            <span style={{...styles.legendSwatch, background: SLACK_GREEN}} aria-hidden />
            Slack +{slack}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TASK ROW — 60px dependency-gated row. The WHOLE row is the complete
// button (toggle circle rides inside the hit); swipe right snaps a 72px
// SLACK_GREEN 'Done' block open at the leading edge (one row at a time);
// the trailing 44×44 ellipsis opens the same actions as an anchored menu
// (the mandatory button path). Locked rows: 20px chain glyph, secondary
// names the exact blocker, aria-disabled with 'locked' in the name.
// ---------------------------------------------------------------------------

interface TaskRowProps {
  entry: MoveTask;
  locked: boolean;
  blockerText: string;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  menuMode: MenuMode;
  isLast: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onToggleDone: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onDefer: () => void;
  onAssignMode: () => void;
  onAssign: (crewId: string) => void;
}

function TaskRow({
  entry,
  locked,
  blockerText,
  isSwipeOpen,
  isMenuOpen,
  menuMode,
  isLast,
  reducedMotion,
  menuRef,
  onSwipeOpen,
  onSwipeClose,
  onToggleDone,
  onToggleMenu,
  onDefer,
  onAssignMode,
  onAssign,
}: TaskRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const swipeable = !locked && !entry.done;
  const base = isSwipeOpen ? 72 : 0;
  const offset = dragX != null ? Math.min(72, Math.max(0, base + dragX)) : base;

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
    const settled = Math.min(72, Math.max(0, base + dragX));
    setDragX(null);
    if (movedRef.current) {
      if (settled > 36) onSwipeOpen();
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

  const assignee = CREW_BY_ID[entry.assigneeId];
  const secondary = locked
    ? \`Locked — \${blockerText}\`
    : entry.done
      ? \`Done · \${assignee.name.split(' ')[0]}\`
      : \`\${entry.minutesLabel} · \${assignee.name.split(' ')[0]}\`;
  const rowName = locked
    ? \`\${entry.shortTitle}, locked, \${blockerText} first\`
    : entry.done
      ? \`\${entry.shortTitle}, done — reopen\`
      : \`\${entry.shortTitle}, \${entry.minutesLabel}, \${assignee.name} — mark done\`;

  return (
    <div style={styles.rowOuter}>
      <div style={styles.rowClip}>
        {swipeable ? (
          <button
            type="button"
            className="vw-btn"
            style={styles.doneAction}
            tabIndex={isSwipeOpen ? 0 : -1}
            aria-hidden={!isSwipeOpen}
            onClick={onToggleDone}>
            <Icon icon={CheckIcon} size="md" color="inherit" />
            Done
          </button>
        ) : null}
        <div
          style={{
            ...styles.rowContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 240ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="vw-btn vw-focusable"
            style={styles.row}
            disabled={locked}
            aria-disabled={locked}
            aria-label={rowName}
            onClick={guardClick(() => {
              if (isSwipeOpen) {
                onSwipeClose();
                return;
              }
              onToggleDone();
            })}>
            {locked ? (
              // Chain ↔ circle swap animates 200ms opacity (vw-fade);
              // instant under reduced motion via the CSS guard.
              <span style={styles.lockGlyph} className="vw-fade" aria-hidden>
                <Icon icon={LinkIcon} size="sm" color="inherit" />
              </span>
            ) : (
              <span
                className="vw-fade"
                style={{...styles.toggleCircle, ...(entry.done ? styles.toggleCircleDone : null)}}
                aria-hidden>
                {entry.done ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
              </span>
            )}
            <span style={styles.rowText}>
              <span
                style={{
                  ...styles.rowPrimary,
                  ...(entry.done ? styles.rowPrimaryDone : null),
                  ...(locked ? styles.rowPrimaryLocked : null),
                }}>
                {entry.title}
              </span>
              <span style={styles.rowSecondary}>{secondary}</span>
            </span>
          </button>
          <button
            type="button"
            className="vw-btn vw-focusable"
            style={styles.iconBtn}
            aria-label={\`Actions for \${entry.shortTitle}\`}
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
          aria-label={\`Actions for \${entry.shortTitle}\`}
          style={{...styles.anchoredMenu, top: 52}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          {menuMode === 'actions' ? (
            <>
              <button
                type="button"
                role="menuitem"
                className="vw-btn vw-focusable"
                style={styles.menuRow}
                disabled={locked}
                aria-disabled={locked}
                onClick={onToggleDone}>
                <span style={styles.menuCheck} aria-hidden>
                  <Icon icon={CheckIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.menuRowText}>{entry.done ? 'Reopen' : 'Complete'}</span>
                {locked ? <span style={styles.menuRowMeta}>locked</span> : null}
              </button>
              {!entry.done ? (
                <>
                  <div style={styles.rowDivider} />
                  <button type="button" role="menuitem" className="vw-btn vw-focusable" style={styles.menuRow} onClick={onDefer}>
                    <span style={styles.menuCheck} aria-hidden />
                    <span style={styles.menuRowText}>Defer</span>
                    <span style={styles.menuRowMeta}>saves {entry.minutesLabel}</span>
                  </button>
                </>
              ) : null}
              <div style={styles.rowDivider} />
              <button type="button" role="menuitem" className="vw-btn vw-focusable" style={styles.menuRow} onClick={onAssignMode}>
                <span style={styles.menuCheck} aria-hidden />
                <span style={styles.menuRowText}>Assign to…</span>
              </button>
            </>
          ) : (
            CREW.map((member, index) => (
              <div key={member.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={entry.assigneeId === member.id}
                  className="vw-btn vw-focusable"
                  style={styles.menuRow}
                  onClick={() => onAssign(member.id)}>
                  <span style={styles.menuCheck} aria-hidden>
                    {entry.assigneeId === member.id ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                  </span>
                  <span style={styles.menuRowText}>{member.name}</span>
                </button>
              </div>
            ))
          )}
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TRUCK GAUGE — SVG viewBox 358×200: stylized isometric cross-section
// (open ramp echoing the brand mark at the trailing edge), interior =
// 12×5 grid of 60 blocks, each 24×24 with 2px gap (block = 20 cu ft;
// capacity 1,200). Loaded blocks fill BRAND_ACCENT; projected blocks fill
// PROJECTED_BLOCK (contrast-corrected pair, math at the declaration);
// blocks past 60 render as a hatched SLACK_RED won't-fit band above the
// roofline. Pre-triage: 9 loaded + 53 projected total 62 → 2-block band;
// post-accept 48 total → fits at 80%.
// ---------------------------------------------------------------------------

interface TruckGaugeProps {
  loaded: number; // cu ft on the truck (done load tasks)
  pending: number; // cu ft still headed for it (open, non-deferred)
  view: TruckView;
}

function TruckGauge({loaded, pending, view}: TruckGaugeProps) {
  const projectedTotal = loaded + pending;
  const loadedBlocks = Math.round(loaded / CUFT_PER_BLOCK);
  const projectedBlocksAll = Math.round(projectedTotal / CUFT_PER_BLOCK);
  const shownBlocks = view === 'now' ? loadedBlocks : Math.min(projectedBlocksAll, TRUCK_COLS * TRUCK_ROWS);
  const overflowBlocks = view === 'projected' ? Math.max(0, projectedBlocksAll - TRUCK_COLS * TRUCK_ROWS) : 0;
  const overCuFt = Math.max(0, projectedTotal - TRUCK_CAPACITY_CUFT);
  const label =
    view === 'now'
      ? \`Truck now: \${fmtCuFt(loaded)} of \${fmtCuFt(TRUCK_CAPACITY_CUFT)} cubic feet loaded\`
      : overCuFt > 0
        ? \`Truck projection: \${fmtCuFt(projectedTotal)} of \${fmtCuFt(TRUCK_CAPACITY_CUFT)} cubic feet — \${overCuFt} over capacity\`
        : \`Truck projection: \${fmtCuFt(projectedTotal)} of \${fmtCuFt(TRUCK_CAPACITY_CUFT)} cubic feet — fits\`;

  // Grid geometry in viewBox units: col c → x = 26 + c·26, row r (bottom
  // up) → y = 144 − r·26; block index fills the floor first, left→right.
  const blocks = [];
  for (let i = 0; i < TRUCK_COLS * TRUCK_ROWS; i++) {
    const col = i % TRUCK_COLS;
    const rowFromBottom = Math.floor(i / TRUCK_COLS);
    const fill =
      i < loadedBlocks ? BRAND_ACCENT : i < shownBlocks ? PROJECTED_BLOCK : 'var(--color-background-muted)';
    blocks.push(
      <rect key={i} x={26 + col * 26} y={144 - rowFromBottom * 26} width={24} height={24} rx={2} fill={fill} />,
    );
  }

  return (
    <div style={styles.gaugeSvgWrap}>
      <svg viewBox="0 0 358 200" width="100%" role="img" aria-label={label}>
        <defs>
          <pattern id="vwWontFit" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={6} stroke={SLACK_RED} strokeWidth={2} />
          </pattern>
        </defs>
        {/* Cargo box, wheels, road, and the open ramp echoing the mark. */}
        <rect x={18} y={28} width={326} height={142} rx={8} fill="none" stroke="var(--color-border)" strokeWidth={1.5} />
        <circle cx={70} cy={178} r={9} fill="none" stroke="var(--color-text-secondary)" strokeWidth={2} />
        <circle cx={280} cy={178} r={9} fill="none" stroke="var(--color-text-secondary)" strokeWidth={2} />
        <path d="M4 187 H354" stroke="var(--color-border)" strokeWidth={2} strokeLinecap="round" />
        <path d="M344 170 L356 186" stroke={BRAND_ACCENT} strokeWidth={3} strokeLinecap="round" />
        {blocks}
        {overflowBlocks > 0 ? (
          <g>
            {/* Roofline breach + hatched won't-fit band above it. */}
            <line x1={24} y1={28} x2={26 + overflowBlocks * 26 + 4} y2={28} stroke={SLACK_RED} strokeWidth={1.5} strokeDasharray="4 4" />
            {Array.from({length: overflowBlocks}, (_, i) => (
              <rect key={i} x={26 + i * 26} y={2} width={24} height={24} rx={2} fill="url(#vwWontFit)" stroke={SLACK_RED} strokeWidth={1} />
            ))}
            <text x={26 + overflowBlocks * 26 + 10} y={18} fontSize={11} fontWeight={600} letterSpacing="0.06em" fill={SLACK_RED}>
              WON&apos;T FIT · {overCuFt} CU FT
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CREW CARD — 72px media row; assignment derives from the live task graph
// and the crew member's CURRENT phase (post-accept: Dev + Priya → Clean,
// flagged with the one-line 'Moved to Clean' chip).
// ---------------------------------------------------------------------------

function crewAssignment(tasks: TaskMap, member: CrewMember, planAccepted: boolean): string {
  const phaseId = planAccepted ? member.postPhase : member.prePhase;
  const phaseName = PHASES.find(phase => phase.id === phaseId)?.name ?? phaseId;
  const open = visibleTasksOf(tasks, phaseId).filter(entry => !entry.done);
  if (open.length === 0) return \`\${phaseName} phase wrapped\`;
  const own = open.find(entry => entry.assigneeId === member.id) ?? open[0];
  const prefix = isUnlocked(tasks, own) ? 'On' : 'Next';
  return \`\${prefix}: \${own.shortTitle} · \${phaseName} phase\`;
}

interface CrewCardProps {
  member: CrewMember;
  assignment: string;
  moved: boolean;
  isLast: boolean;
}

function CrewCard({member, assignment, moved, isLast}: CrewCardProps) {
  return (
    <div>
      <div style={styles.crewRow}>
        {/* 40px initial circle — BRAND_FILL_TEXT on BRAND_ACCENT ≈ 10.9:1
            light / 7.6:1 dark (math at the declaration). */}
        <span style={styles.crewAvatar} aria-hidden>
          {member.initials}
        </span>
        <span style={styles.crewText}>
          <span style={styles.crewName}>{member.name}</span>
          <span style={styles.crewAssignment}>{assignment}</span>
        </span>
        {moved ? <span style={styles.movedChip}>Moved to Clean</span> : null}
      </div>
      {isLast ? null : <div style={{...styles.rowDivider, marginInlineStart: 68}} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TRIAGE SHEET — two-detent bottom sheet (55% / calc(100% − 56px)). The
// grabber is a real 'Resize sheet' button (click toggles detents; drag is
// garnish, >120px past medium closes). Focus-trapped dialog; Escape,
// scrim, and X all close and restore focus to the opener.
// ---------------------------------------------------------------------------

interface TriageSheetProps {
  slack: number;
  planAccepted: boolean;
  detent: 'medium' | 'large';
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  onAccept: () => void;
}

function TriageSheet({slack, planAccepted, detent, reducedMotion, sheetRef, onDetentChange, onClose, onAccept}: TriageSheetProps) {
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

  const behind = slack < 0;
  const deficitText = behind
    ? \`You're \${Math.abs(slack)} min behind the 5:00 PM keys deadline.\`
    : \`You're \${slack} min ahead of the 5:00 PM keys deadline.\`;
  const badgeTone = behind
    ? {background: RED_WASH, color: SLACK_RED}
    : {background: GREEN_WASH, color: SLACK_GREEN};

  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vw-triage-title"
      tabIndex={-1}
      className="vw-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="vw-btn vw-focusable"
        style={styles.sheetGrabber}
        aria-label="Resize sheet"
        onPointerDown={onGrabberPointerDown}
        onPointerMove={onGrabberPointerMove}
        onPointerUp={onGrabberPointerUp}
        onClick={onGrabberClick}>
        <span style={styles.sheetGrabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id="vw-triage-title" style={styles.sheetTitle}>
          Running behind
        </h2>
        <button type="button" className="vw-btn vw-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      {/* The ONE legal inner scroller. */}
      <div style={styles.sheetBody}>
        <div style={styles.deficitCard}>
          <span style={{...styles.deficitBadge, ...badgeTone}}>{fmtSlack(slack)}</span>
          <span style={styles.deficitText}>{deficitText}</span>
        </div>
        <div style={styles.sheetSectionHeader}>Proposed cuts</div>
        <div style={styles.cutCard}>
          {CUT_PLAN.rows.map((row, index) => (
            <div key={row.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <div style={styles.cutRow}>
                {planAccepted ? (
                  <span style={styles.cutApplied} aria-hidden>
                    <Icon icon={CheckIcon} size="sm" color="inherit" />
                  </span>
                ) : null}
                <span style={styles.cutText}>
                  <span style={styles.cutPrimary}>{row.primary}</span>
                  <span style={styles.cutSecondary}>{planAccepted ? 'Applied' : row.secondary}</span>
                </span>
                <span style={styles.cutSaves}>+{row.savesMin} min</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.sheetFooter}>
        <button
          type="button"
          className="vw-btn vw-focusable"
          style={{...styles.sheetConfirmBtn, ...(planAccepted ? styles.sheetConfirmDisabled : null)}}
          disabled={planAccepted}
          aria-disabled={planAccepted}
          onClick={onAccept}>
          {planAccepted ? \`Plan applied · \${fmtSlack(slack)} slack\` : \`Accept plan — recover \${CUT_PLAN.recoversMin} min\`}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TOAST DOCK — the single polite live region. Sticky-in-flow (height 0)
// so it pins above the bottom chrome even mid-scroll; bottom 152 on Board
// (clears the 80px CTA strip), 76 elsewhere; absolute bottom 76 ONLY
// while the sheet scroll-locks the shell. NO auto-dismiss: a toast lives
// until Undo, the next mutation, or (never) a timer.
// ---------------------------------------------------------------------------

interface ToastDockProps {
  toast: ToastState | null;
  locked: boolean;
  aboveCta: boolean;
  onUndo: () => void;
}

function ToastDock({toast, locked, aboveCta, onUndo}: ToastDockProps) {
  const dockStyle = locked
    ? styles.toastDockLocked
    : aboveCta
      ? {...styles.toastDock, bottom: 152}
      : styles.toastDock;
  return (
    <div style={dockStyle} aria-live="polite">
      {toast != null ? (
        <div key={toast.seq} className="vw-fade" style={{...styles.toast, ...(locked ? styles.toastLockedInner : null)}}>
          <span style={styles.toastMsg}>{toast.msg}</span>
          {toast.undo ? (
            <>
              <span style={styles.toastRule} aria-hidden />
              <button type="button" className="vw-btn vw-focusable" style={styles.toastUndo} onClick={onUndo}>
                Undo
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Vanward Moving Day Command.
// ---------------------------------------------------------------------------

const TAB_META: Array<{id: TabId; label: string; icon: typeof TruckIcon}> = [
  {id: 'board', label: 'Board', icon: ListChecksIcon},
  {id: 'truck', label: 'Truck', icon: TruckIcon},
  {id: 'crew', label: 'Crew', icon: UsersIcon},
];

interface UndoSnapshot {
  tasks: TaskMap;
  planAccepted: boolean;
  restoredMsg: string;
}

export default function MobileMovingDayCommandTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const shellWidth = useElementWidth(shellRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  // Track inner width = stage − 32 (16px gutters); 358 at 390 by
  // construction — used only to decide inline-label visibility.
  const trackWidthPx = (shellWidth > 0 ? shellWidth : 390) - 32;

  const {entities, update, setEntities} = usePlanStore();
  const {tasks, planAccepted, ui} = entities;

  // Focus + scroll plumbing.
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const scrollTopsRef = useRef<Record<TabId, number>>({board: 0, truck: 0, crew: 0});
  const toastSeqRef = useRef(0);
  const undoRef = useRef<UndoSnapshot | null>(null);

  useEffect(() => {
    scrollerRef.current = findScroller(wrapRef.current);
  }, []);

  // Derived — every surface reads the same graph.
  const slack = slackOf(tasks);
  const locked = lockedIds(tasks);
  const loaded = loadedCuFt(tasks);
  const pending = pendingCuFt(tasks);
  const deferredVol = deferredCuFt(tasks);
  const deferredList = deferredTasks(tasks);
  const allDone = PHASES.every(phase => visibleTasksOf(tasks, phase.id).every(entry => entry.done));

  const toastPatch = (msg: string, undo: boolean) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, msg, undo}};
  };

  // Focus moves into the sheet on open — preventScroll (foundations
  // amendment): plain .focus() scroll-reveals the animating sheet inside
  // the locked overflow-hidden column and beaches it mid-screen.
  useEffect(() => {
    if (ui.sheetOpen) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [ui.sheetOpen]);
  // Anchored menus focus their first item on open.
  useEffect(() => {
    if (ui.openMenuId != null) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [ui.openMenuId, ui.menuMode]);
  // Per-tab scroll restore (per-tab persistence law).
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller != null) scroller.scrollTop = scrollTopsRef.current[ui.tab] ?? 0;
  }, [ui.tab]);

  // SHEET / MENU LIFECYCLE ----------------------------------------------

  const openSheet = (opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update('ui', {sheetOpen: true, sheetDetent: 'medium', openSwipeRowId: null, openMenuId: null});
  };
  const closeSheet = () => {
    update('ui', {sheetOpen: false, sheetDetent: 'medium'});
    sheetOpenerRef.current?.focus();
  };
  const closeMenu = () => {
    update('ui', {openMenuId: null, menuMode: 'actions'});
    menuOpenerRef.current?.focus();
  };

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.openMenuId != null) closeMenu();
      else if (ui.sheetOpen) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.openMenuId, ui.sheetOpen]);

  // CONSEQUENCE CHAINS ---------------------------------------------------

  // (1) Complete/reopen — dep graph recomputes; dependent rows unlock;
  // phase counts, track widths, slack, and truck blocks all re-derive
  // from the same store; the ONE toast announces (cascade unlocks named).
  const toggleDone = (id: string) => {
    const entry = tasks[id];
    const nextDone = !entry.done;
    const nextTasks: TaskMap = {...tasks, [id]: {...entry, done: nextDone}};
    const nextLocked = lockedIds(nextTasks);
    const unlockedNow = [...locked].filter(lockedId => !nextLocked.has(lockedId));
    const msg = nextDone
      ? unlockedNow.length > 0
        ? \`\${entry.shortTitle} done · \${unlockedNow.map(lockedId => tasks[lockedId].shortTitle).join(' + ')} unlocked\`
        : \`\${entry.shortTitle} done\`
      : \`\${entry.shortTitle} reopened\`;
    undoRef.current = null; // a new mutation ends any pending undo window
    setEntities(prev => ({
      ...prev,
      tasks: {...prev.tasks, [id]: {...prev.tasks[id], done: nextDone}},
      ui: {...prev.ui, openSwipeRowId: null, openMenuId: null, menuMode: 'actions', ...toastPatch(msg, false)},
    }));
  };

  // (7) Defer executes immediately + Undo (undoOverConfirm — no confirm
  // dialogs anywhere in this template).
  const deferTask = (id: string) => {
    const entry = tasks[id];
    undoRef.current = {tasks, planAccepted, restoredMsg: \`\${entry.shortTitle} restored\`};
    setEntities(prev => ({
      ...prev,
      tasks: {...prev.tasks, [id]: {...prev.tasks[id], deferred: true}},
      ui: {...prev.ui, openSwipeRowId: null, openMenuId: null, menuMode: 'actions', ...toastPatch(\`\${entry.shortTitle} deferred · saves \${entry.minutesLabel}\`, true)},
    }));
    menuOpenerRef.current = null;
  };

  // Stress fixture 6: restoring garage tools alone re-adds 20 min →
  // slack +10−20 = −10 → the pill flips back red, live.
  const restoreTask = (id: string) => {
    const entry = tasks[id];
    undoRef.current = null;
    setEntities(prev => ({
      ...prev,
      tasks: {...prev.tasks, [id]: {...prev.tasks[id], deferred: false}},
      ui: {...prev.ui, ...toastPatch(\`\${entry.shortTitle} back on the plan\`, false)},
    }));
  };

  const assignTask = (id: string, crewId: string) => {
    const entry = tasks[id];
    const member = CREW_BY_ID[crewId];
    undoRef.current = null;
    setEntities(prev => ({
      ...prev,
      tasks: {...prev.tasks, [id]: {...prev.tasks[id], assigneeId: crewId}},
      ui: {...prev.ui, openMenuId: null, menuMode: 'actions', ...toastPatch(\`\${entry.shortTitle} → \${member.name.split(' ')[0]}\`, false)},
    }));
    menuOpenerRef.current?.focus();
  };

  // (3) Accept plan — snapshot, apply CUT_PLAN (defer 2, merge 2 → Full
  // wipe-down), close sheet, persistent Undo toast. One beat re-flows the
  // track (−30 → +10), drops 14 truck blocks, and moves Dev + Priya.
  const acceptPlan = () => {
    if (planAccepted) return;
    undoRef.current = {tasks, planAccepted: false, restoredMsg: 'Previous plan restored'};
    setEntities(prev => {
      const nextTasks = {...prev.tasks};
      for (const id of CUT_PLAN.deferIds) nextTasks[id] = {...nextTasks[id], deferred: true};
      for (const id of CUT_PLAN.mergeSourceIds) nextTasks[id] = {...nextTasks[id], mergedInto: CUT_PLAN.mergedTaskId};
      nextTasks[CUT_PLAN.mergedTaskId] = {...nextTasks[CUT_PLAN.mergedTaskId], active: true};
      return {
        tasks: nextTasks,
        planAccepted: true,
        ui: {...prev.ui, sheetOpen: false, sheetDetent: 'medium', ...toastPatch(\`Plan updated — \${CUT_PLAN.recoversMin} min recovered\`, true)},
      };
    });
    sheetOpenerRef.current?.focus();
  };

  // Undo restores the EXACT prior snapshot (rows return to their original
  // positions; stress fixture 4: any later mutation replaces this toast
  // and the snapshot becomes unreachable — one toast at a time).
  const undo = () => {
    const snap = undoRef.current;
    if (snap == null) return;
    undoRef.current = null;
    setEntities(prev => ({
      tasks: snap.tasks,
      planAccepted: snap.planAccepted,
      ui: {...prev.ui, ...toastPatch(snap.restoredMsg, false)},
    }));
  };

  // (5) Tab switches: scroll saved/restored per tab, no state resets;
  // re-tap active tab scrolls to top; open sheet closes, toast persists.
  const selectTab = (tab: TabId) => {
    const scroller = scrollerRef.current;
    if (tab === ui.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    if (scroller != null) scrollTopsRef.current[ui.tab] = scroller.scrollTop;
    update('ui', {tab, sheetOpen: false, sheetDetent: 'medium', openSwipeRowId: null, openMenuId: null, menuMode: 'actions'});
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = TAB_META.findIndex(tab => tab.id === ui.tab);
    const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + TAB_META.length) % TAB_META.length;
    selectTab(TAB_META[next].id);
    document.getElementById(\`vw-tab-\${TAB_META[next].id}\`)?.focus();
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{VANWARD_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — Vanward mark · CountdownPill · 44×44 Re-plan. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <VanwardMark />
          </div>
          <CountdownPill slack={slack} />
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="vw-btn vw-focusable"
              style={styles.iconBtn}
              aria-label="Re-plan — open triage"
              onClick={event => openSheet(event.currentTarget)}>
              <Icon icon={CalendarClockIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {ui.tab === 'board' ? (
          <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            {/* 52px large-title row (104px total header) + 96px pressure
                header, both in flow — they scroll away, the navBar stays. */}
            <div style={styles.largeTitle}>
              <h1 style={styles.largeTitleText}>Moving Day</h1>
            </div>
            <PressureHeader tasks={tasks} slack={slack} trackWidthPx={trackWidthPx} />

            {allDone ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIconCircle}>
                  <Icon icon={PartyPopperIcon} size="lg" color="inherit" />
                </span>
                <h2 style={styles.emptyTitle}>Every task is done</h2>
                <p style={styles.emptyBody}>Hand over the keys — you beat the 5:00 PM deadline.</p>
              </div>
            ) : null}

            {PHASES.map(phase => {
              const phaseTasks = visibleTasksOf(tasks, phase.id);
              const doneCount = phaseTasks.filter(entry => entry.done).length;
              return (
                <section key={phase.id}>
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionHeaderText}>{phase.name}</h2>
                    <span style={styles.sectionHeaderCount}>
                      {doneCount} of {phaseTasks.length} done
                    </span>
                  </div>
                  <div style={styles.listCard}>
                    {phaseTasks.map((entry, index) => (
                      <TaskRow
                        key={entry.id}
                        entry={entry}
                        locked={locked.has(entry.id)}
                        blockerText={blockerLabel(tasks, entry)}
                        isSwipeOpen={ui.openSwipeRowId === entry.id}
                        isMenuOpen={ui.openMenuId === entry.id}
                        menuMode={ui.menuMode}
                        isLast={index === phaseTasks.length - 1}
                        reducedMotion={reducedMotion}
                        menuRef={menuRef}
                        onSwipeOpen={() => update('ui', {openSwipeRowId: entry.id, openMenuId: null})}
                        onSwipeClose={() => {
                          if (ui.openSwipeRowId === entry.id) update('ui', {openSwipeRowId: null});
                        }}
                        onToggleDone={() => toggleDone(entry.id)}
                        onToggleMenu={opener => {
                          menuOpenerRef.current = opener;
                          update('ui', {
                            openMenuId: ui.openMenuId === entry.id ? null : entry.id,
                            menuMode: 'actions',
                            openSwipeRowId: null,
                          });
                        }}
                        onDefer={() => deferTask(entry.id)}
                        onAssignMode={() => update('ui', {menuMode: 'assign'})}
                        onAssign={crewId => assignTask(entry.id, crewId)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {deferredList.length > 0 ? (
              <section>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionHeaderText}>Deferred · {deferredList.length}</h2>
                  <span style={styles.sectionHeaderCount}>{fmtCuFt(deferredVol)} cu ft off the truck</span>
                </div>
                <div style={styles.listCard}>
                  {deferredList.map((entry, index) => (
                    <div key={entry.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.deferredRow}>
                        <span style={styles.deferredPill}>
                          <span style={styles.deferredPillText}>{entry.shortTitle}</span>
                          <span style={styles.deferredPillMeta}>· {entry.minutesLabel}</span>
                        </span>
                        <button
                          type="button"
                          className="vw-btn vw-focusable"
                          style={styles.restoreBtn}
                          aria-label={\`Restore \${entry.shortTitle} — adds \${entry.minutesLabel} back\`}
                          onClick={() => restoreTask(entry.id)}>
                          Restore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <p style={styles.boardCaption}>All 18 tasks · updated just now</p>
          </main>
        ) : null}

        {ui.tab === 'truck' ? (
          <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <h1 className="vw-vh">Truck</h1>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionHeaderText}>Cargo · 26-ft truck</h2>
              <span style={styles.sectionHeaderCount}>
                {Math.round(((loaded + pending) / TRUCK_CAPACITY_CUFT) * 100)}% projected
              </span>
            </div>
            {/* Now / Projected — radiogroup with arrow keys. */}
            <div
              style={styles.segTrack}
              role="radiogroup"
              aria-label="Truck load view"
              onKeyDown={event => {
                if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                event.preventDefault();
                const next: TruckView = ui.truckView === 'now' ? 'projected' : 'now';
                update('ui', {truckView: next});
                document.getElementById(\`vw-seg-\${next}\`)?.focus();
              }}>
              {(['now', 'projected'] as const).map(view => (
                <button
                  key={view}
                  id={\`vw-seg-\${view}\`}
                  type="button"
                  role="radio"
                  aria-checked={ui.truckView === view}
                  tabIndex={ui.truckView === view ? 0 : -1}
                  className="vw-btn vw-focusable"
                  style={{...styles.segItem, ...(ui.truckView === view ? styles.segItemActive : null)}}
                  onClick={() => update('ui', {truckView: view})}>
                  {view === 'now' ? 'Now' : 'Projected'}
                </button>
              ))}
            </div>
            <div style={styles.listCard}>
              <TruckGauge loaded={loaded} pending={pending} view={ui.truckView} />
              <div
                style={{
                  ...styles.gaugeCaption,
                  color:
                    ui.truckView === 'projected' && loaded + pending > TRUCK_CAPACITY_CUFT
                      ? SLACK_RED
                      : ui.truckView === 'projected' && pending > 0
                        ? SLACK_GREEN
                        : 'var(--color-text-secondary)',
                }}>
                {ui.truckView === 'now'
                  ? \`Loaded \${fmtCuFt(loaded)} of \${fmtCuFt(TRUCK_CAPACITY_CUFT)} cu ft\`
                  : loaded + pending > TRUCK_CAPACITY_CUFT
                    ? \`Projected \${fmtCuFt(loaded + pending)} of \${fmtCuFt(TRUCK_CAPACITY_CUFT)} cu ft — \${loaded + pending - TRUCK_CAPACITY_CUFT} over\`
                    : pending > 0
                      ? \`Projected \${fmtCuFt(loaded + pending)} of \${fmtCuFt(TRUCK_CAPACITY_CUFT)} cu ft — fits with room\`
                      : \`Loaded \${fmtCuFt(loaded)} of \${fmtCuFt(TRUCK_CAPACITY_CUFT)} cu ft\`}
              </div>
              <div style={styles.rowDivider} />
              {/* Legend rows — 44px hits; Loaded/Projected flip the view,
                  Deferred jumps to the Board's deferred section. */}
              <button
                type="button"
                className="vw-btn vw-focusable"
                style={styles.legendRowBtn}
                onClick={() => update('ui', {truckView: 'now'})}>
                <span style={{...styles.legendRowSwatch, background: BRAND_ACCENT}} aria-hidden />
                <span style={styles.legendRowLabel}>Loaded</span>
                <span style={styles.legendRowValue}>{fmtCuFt(loaded)} cu ft</span>
              </button>
              <div style={styles.rowDivider} />
              <button
                type="button"
                className="vw-btn vw-focusable"
                style={styles.legendRowBtn}
                onClick={() => update('ui', {truckView: 'projected'})}>
                <span style={{...styles.legendRowSwatch, background: PROJECTED_BLOCK}} aria-hidden />
                <span style={styles.legendRowLabel}>Projected</span>
                <span style={styles.legendRowValue}>
                  {fmtCuFt(loaded + pending)} of {fmtCuFt(TRUCK_CAPACITY_CUFT)}
                </span>
              </button>
              <div style={styles.rowDivider} />
              <button
                type="button"
                className="vw-btn vw-focusable"
                style={styles.legendRowBtn}
                onClick={() => {
                  if (deferredList.length > 0) selectTab('board');
                  else update('ui', toastPatch('Nothing deferred yet — accept the triage plan to free space', false));
                }}>
                <span
                  style={{...styles.legendRowSwatch, background: 'var(--color-background-muted)', border: \`1px solid \${TOGGLE_BORDER}\`}}
                  aria-hidden
                />
                <span style={styles.legendRowLabel}>Deferred</span>
                <span style={styles.legendRowValue}>{deferredVol > 0 ? \`\${fmtCuFt(deferredVol)} cu ft\` : '—'}</span>
              </button>
            </div>
            <p style={styles.truckFootnote}>
              Capacity {fmtCuFt(TRUCK_CAPACITY_CUFT)} cu ft · 60 blocks × {CUFT_PER_BLOCK} cu ft
            </p>
          </main>
        ) : null}

        {ui.tab === 'crew' ? (
          <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <h1 className="vw-vh">Crew</h1>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionHeaderText}>Crew</h2>
              <span style={styles.sectionHeaderCount}>{CREW.length} people</span>
            </div>
            <div style={styles.listCard}>
              {CREW.map((member, index) => (
                <CrewCard
                  key={member.id}
                  member={member}
                  assignment={crewAssignment(tasks, member, planAccepted)}
                  moved={planAccepted && member.prePhase !== member.postPhase}
                  isLast={index === CREW.length - 1}
                />
              ))}
            </div>
          </main>
        ) : null}

        {/* THE one polite live region. */}
        <ToastDock toast={ui.toast} locked={ui.sheetOpen} aboveCta={ui.tab === 'board'} onUndo={undo} />

        {/* STICKY BOARD CTA — the primary verb, thumb zone, above tabBar. */}
        {ui.tab === 'board' ? (
          <div style={styles.ctaFooter}>
            <button
              type="button"
              className="vw-btn vw-focusable"
              style={styles.ctaBtn}
              onClick={event => openSheet(event.currentTarget)}>
              Running behind?
            </button>
          </div>
        ) : null}

        {/* TAB BAR — exactly 64px, 3 tabs, arrow-key tablist. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Vanward sections" onKeyDown={onTabKeyDown}>
          {TAB_META.map(tab => {
            const isActive = ui.tab === tab.id;
            return (
              <button
                key={tab.id}
                id={\`vw-tab-\${tab.id}\`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="vw-btn vw-focusable"
                style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                onClick={() => selectTab(tab.id)}>
                <Icon icon={tab.icon} size="lg" color="inherit" />
                <span style={isActive ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TRIAGE SHEET — scrim z40 + sheet z41, absolute inside shell. */}
        {ui.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {ui.sheetOpen ? (
          <TriageSheet
            slack={slack}
            planAccepted={planAccepted}
            detent={ui.sheetDetent}
            reducedMotion={reducedMotion}
            sheetRef={sheetRef}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onClose={closeSheet}
            onAccept={acceptPlan}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};