// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Switchstead move from 41 Alder
 *   Ct, Apt 2B to 128 Foxglove Ln around the fixed move date Fri Jul 18
 *   (day index 4 of the 13-day window Jul 14–Jul 26; dates are integer day
 *   indices formatted via WINDOW[i] lookup — no Date objects). Five
 *   services with start/stop indices and daily rates in cents:
 *   electric (Voltbridge, 4→4, seamless), gas (Bluepeak, long-name stress,
 *   7←3, 4 × $4.50 = $18.00 double-pay), internet (Lumenline, 4→6, 2 dark
 *   days), water (Clearrun, 5←4, 1 × $2.00 = $2.00 double-pay), trash
 *   (Havencart, 4→8, 4 dark days). Cross-checks: totalDark 2+4 = 6;
 *   totalDoublePay 1800+200 = 2000¢ = $20.00; 1 of 5 seamless; docs
 *   monthly total 96+135+135+60+33 = $459/mo; timeline 2×5+1 = 11 rows;
 *   be-home windows = 2. No Date.now(), no Math.random(), no network.
 * @output Switchstead — Utility Switchover Tracker: a 390px MOBILE
 *   move-day surface. NavBar (two-prong house mark · 'Move · Fri Jul 18' ·
 *   health pill '6 dark days') over three tabs (Services / Timeline /
 *   Docs·6). Services renders each service as a dual-address CoverageBars
 *   pair around the MOVE marker with a live-derived gap/overlap badge
 *   ('2 dark days' red · '$18.00 double-pay' amber · 'seamless' green),
 *   expandable handoff rows (confirmation + copy, install window,
 *   needs-you-home switch), and an 'Adjust dates' button opening the
 *   signature two-detent DateAdjustSheet: two snap-rail day pickers with
 *   44×44 stepper buttons whose every commit re-renders the sheet's live
 *   CoverageBars preview, the card badge, the navBar health pill, the
 *   summary strip, the Timeline rows, and the Docs subtitle from ONE
 *   store. Remove service executes immediately with Undo (no confirm).
 * @position Page template; emitted by `astryx template
 *   mobile-utility-switch-tracker`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, menus) are position:'absolute'
 *   INSIDE shell; position:fixed is banned. While the sheet is open, shell
 *   locks to {height:'100dvh', overflow:'hidden'} and restores on close;
 *   the toast dock is sticky-in-flow above the tab bar and flips to
 *   absolute bottom:76 only during that scroll-lock (foundations
 *   amendment: shell-absolute pins to the document bottom on tall views).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Switchstead violet); sanctioned non-brand literals are
 *   the red/amber/green badge pairs, the coverage fills, the gap-hatch
 *   red, the overlap amber tint, the move-marker rule, and the switch OFF
 *   track — each with contrast math at the declaration (amendment:
 *   interactive boundaries and meaningful rest fills ≥3:1 vs their ACTUAL
 *   surface, which for coverage fills is the muted track, not the body).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline always-on —
 *   declared choice); tabBar 64px sticky bottom z20, 3 tabs, 24px icon
 *   over 11px/500 label; addressStrip 64px (two 28px rows); summaryStrip
 *   minHeight 44; serviceCard collapsed 112px (16 pad · 24px header row ·
 *   12 gap · 10+4+10+6+14 coverage block), expanded ≈309px (+1 divider +
 *   3×44 handoff rows + 12 + 36px 'Adjust dates'); sectionHeader 13px/600
 *   uppercase 0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px
 *   bottom; timeline rows 60px two-line; docs rows 72px media (48px thumb,
 *   12px radius, divider inset 68); sheet detents 55% medium /
 *   calc(100% − 56px) large, 24px grabber zone with 36×5 pill, 52px sheet
 *   header, 48px Done footer; dayPills 56×44 radius 8. TYPE (Figtree via
 *   --font-family-body): 17/600 nav + sheet titles · 16/600 card names ·
 *   16/400 body · 13/400 meta · 11/500-600 badges + tab labels; nothing
 *   under 11px; tabular-nums on every date, count, code, and dollar
 *   figure; 28/700 large title deliberately unused (compact nav only —
 *   declared). Touch: every target ≥44×44 with ≥8px clearance or merged
 *   into a full-row button; every gesture has a visible button path
 *   (day-rail scroll ⇄ 44×44 steppers; sheet drag ⇄ clickable grabber +
 *   X + Done; card actions in a 44×44 ellipsis anchored menu — no swipe
 *   rows on this surface, so no hidden actions).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals: cards fluid inside 16px
 *   gutters; CoverageBars percentage-based (day = idx/13 × 100%); the
 *   dayRail scrolls (13 × 56px pills + 8px gaps ≈ 824px content) with a
 *   ≥24px next-pill peek at every stage width; summaryStrip may wrap to
 *   two 13px lines below 350px (minHeight 44, not fixed); navBar title
 *   maxWidth 200 ellipsized; healthPill label shortens to '6 dark' below
 *   350px container width (declared truncation via the same derived fn).
 *   overflowX:'clip' on shell is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout — deliberately phone
 *   geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  CalendarClockIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DropletsIcon,
  FileCheckIcon,
  FileTextIcon,
  FlameIcon,
  MoreHorizontalIcon,
  PlugZapIcon,
  Trash2Icon,
  WifiIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math. Light surfaces: body #F1F4F7, card #FFFFFF, muted track
// composited ≈ #F3F5F7. Dark surfaces: body #111112, card #1F1F22, muted
// track composited ≈ #18181A.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Switchstead violet). #7C3AED on #FFFFFF ≈
// 5.7:1 (passes 4.5:1 for 11px+ text); #C4B5FD on the dark card #1F1F22 ≈
// 8.9:1.
const BRAND_ACCENT = 'light-dark(#7C3AED, #C4B5FD)';
// Text over a BRAND_ACCENT fill: #FFFFFF on #7C3AED ≈ 5.7:1; #1C1917 on
// #C4B5FD ≈ 9.4:1. (Spec quoted 6.1:1 for the light side; recomputed to
// 5.7:1 — still passes.)
const BRAND_ON = 'light-dark(#FFFFFF, #1C1917)';
// 12% brand wash for the brand mark chip + move-day timeline pill fill.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;

// COVERAGE FILLS — meaningful rest fills; the ≥3:1 amendment measures them
// against their ACTUAL surface, the muted track. NEW (incoming address):
// #6D28D9 vs ≈#F3F5F7 ≈ 6.5:1; #A78BFA vs ≈#18181A ≈ 6.5:1.
const COVER_NEW = 'light-dark(#6D28D9, #A78BFA)';
// OLD (ending address) — deliberately lighter than NEW to read 'ending'
// but still ≥3:1 vs the track: #8B5CF6 ≈ 3.9:1 light; #7C62D9 ≈ 3.9:1
// dark. (DEVIATION: spec's light-dark(#C4B5FD, #5B21B6) fails the
// amendment — #C4B5FD vs the light track ≈ 2.4:1.)
const COVER_OLD = 'light-dark(#8B5CF6, #7C62D9)';
// Gap hatch stripes (dark days): #DC2626 vs the light track ≈ 4.4:1;
// #F87171 vs the dark track ≈ 6.5:1. Border uses the same pair.
const GAP_RED = 'light-dark(#DC2626, #F87171)';
// Overlap (double-pay) tint over the stacked fills — per spec.
const OVERLAP_TINT = 'light-dark(rgba(217, 119, 6, 0.28), rgba(251, 191, 36, 0.30))';
// Move-date marker rule — text-primary at ~62% via an explicit pair.
const MARKER = 'light-dark(rgba(10, 19, 23, 0.62), rgba(223, 226, 229, 0.62))';

// STATUS BADGE + HEALTH PILL tone pairs (text on tinted fill, both ≥4.5:1):
// red text #B42318 on #FDE8E8 ≈ 5.2:1, #FCA5A5 on #4C1D1D ≈ 7.0:1.
const RED_FILL = 'light-dark(#FDE8E8, #4C1D1D)';
const RED_TEXT = 'light-dark(#B42318, #FCA5A5)';
// amber text #92600A on #FDF0DD ≈ 5.0:1, #FCD34D on #3F2E12 ≈ 8.1:1.
const AMBER_FILL = 'light-dark(#FDF0DD, #3F2E12)';
const AMBER_TEXT = 'light-dark(#92600A, #FCD34D)';
// green text #157F3D on #E6F4EA ≈ 4.7:1, #6EE7A0 on #143522 ≈ 7.5:1.
const GREEN_FILL = 'light-dark(#E6F4EA, #143522)';
const GREEN_TEXT = 'light-dark(#157F3D, #6EE7A0)';

// Switch OFF track — an interactive rest fill on the card surface, so the
// ≥3:1 amendment applies: #79716B on #FFFFFF ≈ 4.8:1; #8A8580 on #1F1F22 ≈
// 4.5:1. (DEVIATION: the foundations' alpha pair rgba(21,17,12,0.14)
// composites to ≈1.3:1 on the card — fails the amendment.)
const SWITCH_OFF = 'light-dark(#79716B, #8A8580)';
// Switch thumb — white in both schemes per the foundations contract.
const SWITCH_THUMB = '#FFFFFF';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Destructive menu-row text on the card: #B42318 ≈ 6.4:1 on #FFFFFF;
// #FCA5A5 ≈ 8.6:1 on #1F1F22 (reuses the red text pair).
const DANGER_TEXT = RED_TEXT;

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// snap rail, and the reduced-motion guard. Transitions collapse to instant
// under prefers-reduced-motion (bar width/left included — spec-sanctioned).
// ---------------------------------------------------------------------------

const SST_CSS = `
.sst-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.sst-btn:disabled { cursor: default; }
.sst-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.sst-anim { transition: transform 240ms ease, opacity 240ms ease; }
.sst-bar { transition: width 200ms ease, left 200ms ease; }
.sst-rail {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 16px;
  scrollbar-width: none;
}
.sst-rail::-webkit-scrollbar { display: none; }
@keyframes sst-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.sst-sheet-in { animation: sst-sheet-in 240ms ease; }
.sst-vh {
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
  .sst-anim, .sst-bar { transition: none; }
  .sst-sheet-in { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — binding vocabulary names (shell, navBar, tabBar, tabItem,
// listCard, row, rowDivider, sectionHeader, sheetScrim, sheet, sheetGrabber,
// toastDock) plus this template's custom pieces.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries
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
  // Scroll lock while the sheet is open; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so the 44px trailing
  // button optically aligns to the 16px gutter. Hairline + blur ALWAYS ON
  // (declared choice; scroll-under not wired).
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
  navTitle: {
    margin: 0,
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 44×44 non-button brand slot holding the 32px two-prong house mark.
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: 'var(--color-text-primary)',
  },
  // healthPill — 44px hit wrapping a 26px pill; tone styles applied inline.
  // The 1px border in the tone's text color keeps the interactive boundary
  // ≥3:1 vs the nav surface (amendment).
  healthPillHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 999,
  },
  healthPill: {
    height: 26,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // ADDRESS STRIP — 64px card, two 28px rows.
  addressStrip: {paddingBlock: 4, paddingInline: 16},
  addressRow: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  addressLabel: {
    width: 40,
    flexShrink: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  addressValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // SUMMARY STRIP — minHeight 44 (wraps to two 13px lines below 350px).
  summaryStrip: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 6,
    paddingInline: 32,
    paddingBlock: 4,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  summaryStrong: {color: 'var(--color-text-primary)', fontWeight: 600},
  // SERVICE CARD — collapsed 112px: 16 pad + 24 header + 12 gap + 44
  // coverage block (10+4+10+6+14) + 16 pad.
  serviceCard: {
    position: 'relative',
    marginInline: 16,
    marginBottom: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  cardHeaderRow: {display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12},
  cardHeaderBtn: {
    flex: 1,
    minWidth: 0,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: {flexShrink: 0, display: 'inline-flex', color: 'var(--color-text-secondary)'},
  cardName: {fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0},
  cardProvider: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardChevron: {
    flexShrink: 0,
    display: 'inline-flex',
    color: 'var(--color-text-secondary)',
  },
  // statusBadge — 22px pill, 11px/600, derived every render.
  statusBadge: {
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // 44×44 ellipsis hit kept inside the 24px header line via negative
  // margins (visual stays 112px; hit area does not shrink).
  ellipsisBtn: {
    width: 44,
    height: 44,
    marginBlock: -10,
    marginInlineEnd: -12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // COVERAGE BARS — percentage-based; wrapper owns the marker overshoot.
  coverageWrap: {display: 'flex', flexDirection: 'column'},
  coverageTracks: {position: 'relative', display: 'flex', flexDirection: 'column', gap: 4},
  coverageTrack: {
    position: 'relative',
    height: 10,
    borderRadius: 5,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  coverageFillOld: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    background: COVER_OLD,
    borderRadius: 5,
  },
  coverageFillNew: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    background: COVER_NEW,
    borderRadius: 5,
  },
  // gapHatch — absolute overlay spanning BOTH bars; 45° hairline stripes +
  // 1px error border (see GAP_RED math).
  gapHatch: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    border: `1px solid ${GAP_RED}`,
    borderRadius: 3,
    backgroundImage: `repeating-linear-gradient(45deg, ${GAP_RED} 0px, ${GAP_RED} 1px, transparent 1px, transparent 5px)`,
  },
  overlapTint: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    background: OVERLAP_TINT,
    borderRadius: 3,
  },
  // moveMarker — 2px rule spanning both bars + 4px overshoot.
  moveMarker: {
    position: 'absolute',
    top: -4,
    bottom: -4,
    width: 2,
    marginLeft: -1,
    background: MARKER,
  },
  axisRow: {
    position: 'relative',
    height: 14,
    marginTop: 6,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  axisStart: {position: 'absolute', left: 0, top: 0, lineHeight: '14px'},
  axisEnd: {position: 'absolute', right: 0, top: 0, lineHeight: '14px'},
  axisMove: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    lineHeight: '14px',
    letterSpacing: '0.06em',
    fontWeight: 600,
  },
  // HANDOFF (expanded) section — 44px rows.
  handoffCard: {marginTop: 12},
  handoffDivider: {height: 1, background: 'var(--color-border)', marginBottom: 4},
  row: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowValueCode: {fontSize: 16, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  copyBtn: {
    width: 44,
    height: 44,
    marginInlineEnd: -12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  valuePill: {
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  rowValueMuted: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  // Switch — 51×31 visual inside a full-row role=switch button.
  switchRow: {width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', gap: 12},
  switchTrack: {
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    position: 'relative',
  },
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: SWITCH_THUMB,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
  adjustBtn: {
    width: '100%',
    height: 36,
    marginTop: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // Anchored ellipsis menu — absolute card, z30 (below sheet scrim z40).
  anchoredMenu: {
    position: 'absolute',
    top: 48,
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
  menuCatcher: {position: 'absolute', inset: 0, zIndex: 29},
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
  // TIMELINE — 60px two-line rows in per-day listCards.
  timelineRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  timelineText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  timelinePrimary: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  timelineSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  beHomePill: {
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: AMBER_FILL,
    color: AMBER_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  movePill: {
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    flexShrink: 0,
  },
  terminalCaption: {
    margin: '16px 16px 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // DOCS — 72px media rows, 48px thumb at 12px radius, divider inset 68.
  docRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  docThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  docText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  docPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  docSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  docMeta: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // TAB BAR — exactly 64px, 3 tabs flex:1, sticky bottom z20.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
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
  // TOAST DOCK — the single aria-live polite region. Sticky-in-flow
  // (height 0) 76px above the viewport bottom (64 tabBar + 12) per the
  // foundations amendment; flips to absolute bottom:76 z30 ONLY while the
  // sheet scroll-lock pins the shell to 100dvh.
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
    zIndex: 45,
    height: 'auto',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    minHeight: 48,
    maxWidth: 'calc(100% - 32px)',
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
    paddingInlineEnd: 16,
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    minWidth: 44,
    height: 48,
    paddingInline: 16,
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
  sheetGrabber: {
    width: '100%',
    height: 24,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    touchAction: 'none',
    borderRadius: '16px 16px 0 0',
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
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetClose: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // The one legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  doneBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // Date field block — label, snap rail, stepper row.
  fieldBlock: {marginTop: 12},
  fieldLabel: {
    display: 'block',
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  // dayRail — horizontal snap rail; 13 × 56px pills, 8px gaps.
  dayRail: {
    display: 'flex',
    gap: 8,
    paddingBlock: 2,
    marginInline: -16,
    paddingInline: 16,
  },
  dayPill: {
    width: 56,
    height: 44,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  dayPillOn: {
    background: BRAND_ACCENT,
    borderColor: BRAND_ACCENT,
    color: BRAND_ON,
    fontWeight: 600,
  },
  stepperRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepBtnDisabled: {opacity: 0.35},
  stepReadout: {
    minWidth: 96,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // Live preview block inside the sheet.
  previewBlock: {
    marginTop: 20,
    padding: 16,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
  },
  previewHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  previewName: {fontSize: 16, fontWeight: 600},
  previewCaption: {
    marginTop: 12,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  timelineCaption: {
    margin: '16px 16px 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — the 13-day window as integer day indices (0..12), formatting
// via WINDOW[i] lookup, no Date objects. Semantics: newStart inclusive,
// oldStop exclusive (first uncovered day); gap = newStart − oldStop;
// overlap = oldStop − newStart. Cross-check ledger (verified by hand):
// internet gap 6−4 = 2; trash gap 8−4 = 4; totalDark 2+4 = 6. gas overlap
// 7−3 = 4 × 450¢ = 1800¢; water overlap 5−4 = 1 × 200¢ = 200¢; totalDouble
// 1800+200 = 2000¢ = $20.00. Seamless 1 of 5 (electric 4→4). Docs monthly
// 9600+13500+13500+6000+3300 = 45900¢ = $459/mo. Timeline rows 2×5+1 = 11;
// be-home windows (needsHome) = 2 (internet install, gas meter read).
// ---------------------------------------------------------------------------

const WINDOW = [
  'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19', 'Jul 20',
  'Jul 21', 'Jul 22', 'Jul 23', 'Jul 24', 'Jul 25', 'Jul 26',
];
// Weekday-qualified labels for timeline day headers (Jul 18 is the fixed
// Friday move date; window runs Mon Jul 14 → Sat Jul 26).
const DAYS_FULL = [
  'Mon Jul 14', 'Tue Jul 15', 'Wed Jul 16', 'Thu Jul 17', 'Fri Jul 18',
  'Sat Jul 19', 'Sun Jul 20', 'Mon Jul 21', 'Tue Jul 22', 'Wed Jul 23',
  'Thu Jul 24', 'Fri Jul 25', 'Sat Jul 26',
];
const DAY_COUNT = 13;
const MOVE = {label: 'Fri Jul 18', idx: 4};
const ADDRESSES = {
  old: {line: '41 Alder Ct, Apt 2B', short: 'Alder Ct'},
  new: {line: '128 Foxglove Ln', short: 'Foxglove Ln'},
};

interface Service {
  id: string;
  name: string;
  /** Display provider — gas carries the one-line truncation stress. */
  provider: string;
  /** Short provider name for docs rows, toasts, and aggregates. */
  providerShort: string;
  /** Day index (exclusive) when the OLD address's service ends. */
  oldStop: number;
  /** Day index (inclusive) when the NEW address's service starts. */
  newStart: number;
  dailyRateCents: number;
  dailyRateLabel: string;
  monthlyCents: number;
  monthlyLabel: string;
  confirmation: string;
  /** Install window at the NEW address (internet). */
  installWindow: string | null;
  /** Final-read window at the OLD address (gas). */
  meterWindow: string | null;
  needsHome: boolean;
  /** Docs thumb initials. */
  initials: string;
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
  electric: ZapIcon,
  gas: FlameIcon,
  internet: WifiIcon,
  water: DropletsIcon,
  trash: Trash2Icon,
};

// needsHome DEVIATION: the fixture plan lists only internet as needsHome,
// but its own timeline requires TWO be-home windows at rest (internet
// install + gas final meter read → caption 'Needs you home: 2 windows',
// stress 7 counts 2→3). gas.needsHome = true reconciles the aggregate.
const SERVICES: Service[] = [
  {
    id: 'electric',
    name: 'Electric',
    provider: 'Voltbridge Energy',
    providerShort: 'Voltbridge',
    oldStop: 4,
    newStart: 4,
    dailyRateCents: 320,
    dailyRateLabel: '$3.20/day',
    monthlyCents: 9600,
    monthlyLabel: '$96/mo',
    confirmation: 'VB-88214',
    installWindow: null,
    meterWindow: null,
    needsHome: false,
    initials: 'VE',
  },
  {
    id: 'gas',
    name: 'Gas',
    // One-line ellipsis stress for the card header + 60px timeline rows
    // (stress fixture 6; verify at 320px).
    provider: 'Bluepeak Gas & Home Services of Greater Foxglove County',
    providerShort: 'Bluepeak',
    oldStop: 7,
    newStart: 3,
    dailyRateCents: 450,
    dailyRateLabel: '$4.50/day',
    monthlyCents: 13500,
    monthlyLabel: '$135/mo',
    confirmation: 'BP-55107',
    installWindow: null,
    meterWindow: '9:00–13:00',
    needsHome: true,
    initials: 'BG',
  },
  {
    id: 'internet',
    name: 'Internet',
    provider: 'Lumenline Fiber',
    providerShort: 'Lumenline',
    oldStop: 4,
    newStart: 6,
    dailyRateCents: 450,
    dailyRateLabel: '$4.50/day',
    monthlyCents: 13500,
    monthlyLabel: '$135/mo',
    confirmation: 'LM-90342',
    installWindow: '8:00–12:00',
    meterWindow: null,
    needsHome: true,
    initials: 'LF',
  },
  {
    id: 'water',
    name: 'Water',
    provider: 'Clearrun Water',
    providerShort: 'Clearrun',
    oldStop: 5,
    newStart: 4,
    dailyRateCents: 200,
    dailyRateLabel: '$2.00/day',
    monthlyCents: 6000,
    monthlyLabel: '$60/mo',
    confirmation: 'CR-71260',
    installWindow: null,
    meterWindow: null,
    needsHome: false,
    initials: 'CW',
  },
  {
    id: 'trash',
    name: 'Trash',
    provider: 'Havencart Waste',
    providerShort: 'Havencart Waste',
    oldStop: 4,
    newStart: 8,
    dailyRateCents: 110,
    dailyRateLabel: '$1.10/day',
    monthlyCents: 3300,
    monthlyLabel: '$33/mo',
    confirmation: 'HC-30498',
    installWindow: null,
    meterWindow: null,
    needsHome: false,
    initials: 'HW',
  },
];

// ---------------------------------------------------------------------------
// DERIVATIONS — pure functions, recomputed every render, never stored.
// ---------------------------------------------------------------------------

function gapDays(service: Service): number {
  return Math.max(0, service.newStart - service.oldStop);
}

function overlapDays(service: Service): number {
  return Math.max(0, service.oldStop - service.newStart);
}

function overlapCents(service: Service): number {
  return overlapDays(service) * service.dailyRateCents;
}

function fmtUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

type Tone = 'red' | 'amber' | 'green';

interface BadgeInfo {
  tone: Tone;
  label: string;
}

function badgeFor(service: Service): BadgeInfo {
  const gap = gapDays(service);
  if (gap > 0) return {tone: 'red', label: `${gap} dark day${gap === 1 ? '' : 's'}`};
  const overlap = overlapDays(service);
  if (overlap > 0) return {tone: 'amber', label: `${fmtUsd(overlapCents(service))} double-pay`};
  return {tone: 'green', label: 'seamless'};
}

const TONE_FILL: Record<Tone, string> = {red: RED_FILL, amber: AMBER_FILL, green: GREEN_FILL};
const TONE_TEXT: Record<Tone, string> = {red: RED_TEXT, amber: AMBER_TEXT, green: GREEN_TEXT};

function totalDarkDays(services: Service[]): number {
  return services.reduce((sum, service) => sum + gapDays(service), 0);
}

function totalDoublePayCents(services: Service[]): number {
  return services.reduce((sum, service) => sum + overlapCents(service), 0);
}

function seamlessCount(services: Service[]): number {
  return services.filter(service => gapDays(service) === 0 && overlapDays(service) === 0).length;
}

/** Risk sort: dark days desc, then double-pay $ desc, seamless last. */
function riskSort(services: Service[]): string[] {
  return [...services]
    .sort((a, b) => {
      const rank = (s: Service) => (gapDays(s) > 0 ? 0 : overlapDays(s) > 0 ? 1 : 2);
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      if (rank(a) === 0) return gapDays(b) - gapDays(a) || a.name.localeCompare(b.name);
      if (rank(a) === 1) return overlapCents(b) - overlapCents(a) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    })
    .map(service => service.id);
}

/** Percentage along the 13-day window for a day index. */
function pct(idx: number): string {
  const clamped = Math.min(DAY_COUNT, Math.max(0, idx));
  return `${((clamped / DAY_COUNT) * 100).toFixed(2)}%`;
}

function pctSpan(from: number, to: number): string {
  const span = Math.min(DAY_COUNT, Math.max(0, to)) - Math.min(DAY_COUNT, Math.max(0, from));
  return `${((Math.max(0, span) / DAY_COUNT) * 100).toFixed(2)}%`;
}

/** sr-only sentence carrying the bars' meaning. */
function coverageSentence(service: Service): string {
  const gap = gapDays(service);
  const overlap = overlapDays(service);
  const base = `Old service ends ${WINDOW[Math.min(service.oldStop, DAY_COUNT - 1)]}, new starts ${WINDOW[Math.min(service.newStart, DAY_COUNT - 1)]}`;
  if (gap > 0) return `${base} — ${gap} day gap`;
  if (overlap > 0) return `${base} — ${overlap} day overlap, ${fmtUsd(overlapCents(service))} double-pay`;
  return `${base} — seamless handoff`;
}

// TIMELINE — derived rows: every service yields exactly 2 rows (end +
// start) plus the move-day row = 2×5+1 = 11 at rest; removing a service
// drops exactly 2 (11→9, stress 5). DEVIATION: the spec sketch shows
// electric as ONE 'switches over' row, which breaks its own 11-row law;
// the end+start pair keeps the arithmetic exact.
interface TimelineRow {
  id: string;
  idx: number;
  isMove: boolean;
  primary: string;
  secondary: string;
  beHome: string | null;
}

function timelineRows(services: Service[]): TimelineRow[] {
  const rows: TimelineRow[] = [
    {
      id: 'move',
      idx: MOVE.idx,
      isMove: true,
      primary: 'Moving day — keys at 128 Foxglove Ln',
      secondary: `${ADDRESSES.old.line} → ${ADDRESSES.new.line}`,
      beHome: null,
    },
  ];
  for (const service of services) {
    const endIsWindow = service.meterWindow != null;
    rows.push({
      id: `${service.id}-end`,
      idx: service.oldStop,
      isMove: false,
      primary: endIsWindow
        ? `${service.name} final meter read ${service.meterWindow}`
        : `${service.name} ends at ${ADDRESSES.old.short}`,
      secondary: `${service.provider} · ${ADDRESSES.old.line}`,
      beHome: endIsWindow && service.needsHome ? shortWindow(service.meterWindow) : null,
    });
    const startIsWindow = service.installWindow != null;
    rows.push({
      id: `${service.id}-start`,
      idx: service.newStart,
      isMove: false,
      primary: startIsWindow
        ? `${service.name} install ${service.installWindow}`
        : `${service.name} starts at ${ADDRESSES.new.short}`,
      secondary: `${service.provider} · ${ADDRESSES.new.line}`,
      beHome:
        service.needsHome && !endIsWindow
          ? startIsWindow
            ? shortWindow(service.installWindow)
            : 'be home'
          : null,
    });
  }
  return rows.sort(
    (a, b) =>
      a.idx - b.idx ||
      Number(b.isMove) - Number(a.isMove) ||
      a.primary.localeCompare(b.primary),
  );
}

function shortWindow(window: string | null): string {
  if (window == null) return 'be home';
  // '8:00–12:00' → 'be home 8–12'.
  const compact = window.replace(/:00/g, '');
  return `be home ${compact}`;
}

/** Be-home window count for the timeline caption (stress 7: 2→3). */
function beHomeCount(services: Service[]): number {
  return services.filter(service => service.needsHome).length;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — a single useState object; update(id, patch) for
// services, patchUi for everything else. Every derived figure (badges,
// pill, summary, sort, timeline, docs) recomputes per render.
// ---------------------------------------------------------------------------

type TabId = 'services' | 'timeline' | 'docs';

interface SheetState {
  serviceId: string;
  field: 'newStart' | 'oldStop';
  detent: 'medium' | 'large';
}

interface Toast {
  seq: number;
  msg: string;
  undo: boolean;
}

interface SwitchsteadState {
  tab: TabId;
  scrollByTab: Record<TabId, number>;
  /** Expanded service card — persists across tab switches (per-tab law). */
  expandedService: string | null;
  sheet: SheetState | null;
  menuForId: string | null;
  services: Service[];
  /** Display order — recomputed on sheet CLOSE (not per keystroke) and on
   *  remove/undo, so rows never jump under an open sheet. */
  order: string[];
  removed: {service: Service; index: number} | null;
  toast: Toast | null;
}

const INITIAL_STATE: SwitchsteadState = {
  tab: 'services',
  scrollByTab: {services: 0, timeline: 0, docs: 0},
  expandedService: null,
  sheet: null,
  menuForId: null,
  services: SERVICES,
  // Rest order: trash (4 dark) → internet (2 dark) → gas ($18.00) → water
  // ($2.00) → electric (seamless).
  order: riskSort(SERVICES),
  removed: null,
  toast: null,
};

/**
 * Container-width hook (grid-feeder-console pattern): only a
 * ResizeObserver on the wrapper can tell the 390px stage from the ~1045px
 * desktop stage inside the 1440px demo window.
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

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), [role="spinbutton"]');
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
// BRAND MARK — 32px two-prong house glyph (stylized SVG, stroke
// text-primary) inside a 44×44 non-button nav slot.
// ---------------------------------------------------------------------------

function SwitchsteadMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandMark}>
        <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M3 9.5 10 3l7 6.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M5.5 9.5V17h9V9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 17v-3.5M12 17v-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// STATUS BADGE — derived, never stored; 22px pill, tone pairs at the top.
// ---------------------------------------------------------------------------

function StatusBadge({service}: {service: Service}) {
  const badge = badgeFor(service);
  return (
    <span
      style={{
        ...styles.statusBadge,
        background: TONE_FILL[badge.tone],
        color: TONE_TEXT[badge.tone],
      }}>
      {badge.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// COVERAGE BARS — the signature primitive. Fixed 13-day window; old bar
// (top) fills 0 → oldStop, new bar (bottom) fills newStart → end; gapHatch
// spans the uncovered days across BOTH bars; overlapTint spans the
// double-paid days; the MOVE marker rules both bars at 4/13 ≈ 30.77%.
// Bars are aria-hidden decoration — the badge + an sr-only sentence carry
// the meaning.
// ---------------------------------------------------------------------------

function CoverageBars({service, compact}: {service: Service; compact?: boolean}) {
  const gap = gapDays(service);
  const overlap = overlapDays(service);
  return (
    <div style={styles.coverageWrap}>
      <div style={styles.coverageTracks} aria-hidden>
        <div style={styles.coverageTrack}>
          <div className="sst-bar" style={{...styles.coverageFillOld, width: pct(service.oldStop)}} />
        </div>
        <div style={styles.coverageTrack}>
          <div className="sst-bar" style={{...styles.coverageFillNew, left: pct(service.newStart)}} />
        </div>
        {gap > 0 ? (
          <div
            className="sst-bar"
            style={{
              ...styles.gapHatch,
              left: pct(service.oldStop),
              width: pctSpan(service.oldStop, service.newStart),
            }}
          />
        ) : null}
        {overlap > 0 ? (
          <div
            className="sst-bar"
            style={{
              ...styles.overlapTint,
              left: pct(service.newStart),
              width: pctSpan(service.newStart, service.oldStop),
            }}
          />
        ) : null}
        <div style={{...styles.moveMarker, left: pct(MOVE.idx)}} />
      </div>
      <div style={styles.axisRow} aria-hidden>
        <span style={styles.axisStart}>{WINDOW[0]}</span>
        <span style={{...styles.axisMove, left: pct(MOVE.idx)}}>MOVE</span>
        <span style={styles.axisEnd}>{WINDOW[DAY_COUNT - 1]}</span>
      </div>
      {compact ? null : <span className="sst-vh">{coverageSentence(service)}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DATE FIELD — one field of the DateAdjustSheet: label, snap dayRail of 13
// 56×44 pill buttons (scroll ⇄ arrow keys), and the mandatory non-gesture
// path: 44×44 ChevronLeft/Right steppers flanking a role='spinbutton'
// readout (ArrowUp/Down step).
// ---------------------------------------------------------------------------

interface DateFieldProps {
  id: string;
  label: string;
  value: number;
  autoFocusSteppers: boolean;
  onChange: (idx: number) => void;
}

function DateField({id, label, value, autoFocusSteppers, onChange}: DateFieldProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const downRef = useRef<HTMLButtonElement | null>(null);

  // Keep the selected pill in view when steppers/keys move it — manual
  // scrollLeft math (scrollIntoView would also scroll ancestors).
  useEffect(() => {
    const rail = railRef.current;
    if (rail == null) return;
    const pillLeft = value * (56 + 8);
    const target = pillLeft - rail.clientWidth / 2 + 28;
    rail.scrollLeft = Math.max(0, Math.min(target, rail.scrollWidth - rail.clientWidth));
  }, [value]);

  const step = (delta: number) => {
    const next = Math.max(0, Math.min(DAY_COUNT - 1, value + delta));
    if (next !== value) onChange(next);
  };

  const onRailKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    }
  };

  const onSpinKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
  };

  return (
    <div style={styles.fieldBlock}>
      <span style={styles.fieldLabel} id={`${id}-label`}>
        {label}
      </span>
      <div
        ref={railRef}
        className="sst-rail sst-focusable"
        style={styles.dayRail}
        role="group"
        aria-labelledby={`${id}-label`}
        tabIndex={0}
        onKeyDown={onRailKeyDown}>
        {WINDOW.map((day, idx) => {
          const on = idx === value;
          return (
            <button
              key={day}
              type="button"
              className="sst-btn sst-focusable"
              style={on ? {...styles.dayPill, ...styles.dayPillOn} : styles.dayPill}
              aria-pressed={on}
              aria-label={`${label} ${day}`}
              tabIndex={-1}
              onClick={() => onChange(idx)}>
              {day}
            </button>
          );
        })}
      </div>
      <div style={styles.stepperRow}>
        <button
          ref={downRef}
          type="button"
          className="sst-btn sst-focusable"
          style={value === 0 ? {...styles.stepBtn, ...styles.stepBtnDisabled} : styles.stepBtn}
          aria-label={`Previous day — ${label}`}
          disabled={value === 0}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- sheet entry
          // focus lands on the edited field's stepper (preventScroll is
          // handled by the sheet effect targeting this node).
          data-autofocus={autoFocusSteppers ? 'true' : undefined}
          onClick={() => step(-1)}>
          <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
        </button>
        <span
          role="spinbutton"
          tabIndex={0}
          className="sst-focusable"
          style={styles.stepReadout}
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={DAY_COUNT - 1}
          aria-valuetext={WINDOW[value]}
          onKeyDown={onSpinKeyDown}>
          {WINDOW[value]}
        </span>
        <button
          type="button"
          className="sst-btn sst-focusable"
          style={value === DAY_COUNT - 1 ? {...styles.stepBtn, ...styles.stepBtnDisabled} : styles.stepBtn}
          aria-label={`Next day — ${label}`}
          disabled={value === DAY_COUNT - 1}
          onClick={() => step(1)}>
          <Icon icon={ChevronRightIcon} size="md" color="inherit" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DATE ADJUST SHEET — two detents (medium 55% / large calc(100% − 56px));
// grabber is a real button toggling detents; pointer drag between detents
// snaps nearest, >120px past medium closes; Escape/scrim/X/Done all close
// (edits write through immediately — no revert needed). Focus enters with
// preventScroll and restores to the opener.
// ---------------------------------------------------------------------------

interface DateAdjustSheetProps {
  sheet: SheetState;
  service: Service;
  totalDark: number;
  onSetDate: (serviceId: string, field: 'newStart' | 'oldStop', idx: number) => void;
  onToggleDetent: () => void;
  onSetDetent: (detent: 'medium' | 'large') => void;
  onClose: () => void;
}

function DateAdjustSheet({
  sheet,
  service,
  totalDark,
  onSetDate,
  onToggleDetent,
  onSetDetent,
  onClose,
}: DateAdjustSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{startY: number; active: boolean; moved: boolean}>({
    startY: 0,
    active: false,
    moved: false,
  });

  // Focus into the sheet with preventScroll (foundations amendment: plain
  // .focus() scroll-reveals the animating sheet inside the locked column).
  useEffect(() => {
    const node = sheetRef.current;
    if (node == null) return;
    const target = node.querySelector<HTMLElement>('[data-autofocus="true"]') ?? node;
    target.focus({preventScroll: true});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entry focus
    // fires once per sheet open (serviceId identity).
  }, [sheet.serviceId]);

  const onGrabberPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragRef.current = {startY: event.clientY, active: true, moved: false};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onGrabberPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active) return;
    const delta = event.clientY - dragRef.current.startY;
    dragRef.current.active = false;
    // Click (tiny movement) → the button's onClick toggles detents; a
    // real drag suppresses the synthetic click that follows.
    if (Math.abs(delta) < 8) return;
    dragRef.current.moved = true;
    if (sheet.detent === 'medium' && delta > 120) {
      onClose();
    } else if (delta < -60) {
      onSetDetent('large');
    } else if (delta > 60) {
      onSetDetent('medium');
    }
  };

  return (
    <>
      <div className="sst-btn" style={styles.sheetScrim} aria-hidden onClick={onClose} />
      <div
        ref={sheetRef}
        className="sst-sheet-in"
        style={{
          ...styles.sheet,
          height: sheet.detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        }}
        role="dialog"
        aria-modal
        aria-labelledby="sst-sheet-title"
        tabIndex={-1}
        onKeyDown={event => trapTabKey(event, sheetRef.current)}>
        <button
          type="button"
          className="sst-btn sst-focusable"
          style={styles.sheetGrabber}
          aria-label="Resize sheet"
          onClick={() => {
            // Ignore the synthetic click after a drag gesture.
            if (dragRef.current.moved) {
              dragRef.current.moved = false;
              return;
            }
            onToggleDetent();
          }}
          onPointerDown={onGrabberPointerDown}
          onPointerUp={onGrabberPointerUp}>
          <span style={styles.grabberPill} aria-hidden />
        </button>
        <div style={styles.sheetHeader}>
          <span aria-hidden />
          <h2 id="sst-sheet-title" style={styles.sheetTitle}>
            {service.name} dates
          </h2>
          <button
            type="button"
            className="sst-btn sst-focusable"
            style={styles.sheetClose}
            aria-label="Close"
            onClick={onClose}>
            <Icon icon={XIcon} size="md" color="inherit" />
          </button>
        </div>
        <div style={styles.sheetBody}>
          <DateField
            id="sst-field-newstart"
            label="New start — 128 Foxglove Ln"
            value={service.newStart}
            autoFocusSteppers={sheet.field === 'newStart'}
            onChange={idx => onSetDate(service.id, 'newStart', idx)}
          />
          <DateField
            id="sst-field-oldstop"
            label="Old stop — 41 Alder Ct"
            value={service.oldStop}
            autoFocusSteppers={sheet.field === 'oldStop'}
            onChange={idx => onSetDate(service.id, 'oldStop', idx)}
          />
          {/* Live preview — the signature interaction: the edited
              service's bars + badge re-render in the sheet on every
              change, and the caption recounts move-in health. */}
          <div style={styles.previewBlock}>
            <div style={styles.previewHead}>
              <span style={styles.previewName}>{service.name}</span>
              <StatusBadge service={service} />
            </div>
            <CoverageBars service={service} compact />
            <p style={styles.previewCaption}>
              Move-in health: {totalDark} dark day{totalDark === 1 ? '' : 's'} total
            </p>
          </div>
        </div>
        <div style={styles.sheetFooter}>
          <button type="button" className="sst-btn sst-focusable" style={styles.doneBtn} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// SERVICE CARD — collapsed 112px (header button + coverage bars), expanded
// +handoffCard (confirmation/copy · install window · needs-you-home
// switch · 36px 'Adjust dates'). The 44×44 ellipsis opens the anchored
// action menu (Copy code / toggle needs-home / Remove service — the only
// destructive verb, behind one intent step per ergonomics).
// ---------------------------------------------------------------------------

interface ServiceCardProps {
  service: Service;
  expanded: boolean;
  menuOpen: boolean;
  onToggleExpand: (id: string) => void;
  onOpenMenu: (id: string, opener: HTMLElement) => void;
  onCloseMenu: () => void;
  onCopyCode: (id: string) => void;
  onToggleNeedsHome: (id: string) => void;
  onRemove: (id: string) => void;
  onAdjustDates: (id: string, opener: HTMLElement) => void;
}

function ServiceCard({
  service,
  expanded,
  menuOpen,
  onToggleExpand,
  onOpenMenu,
  onCloseMenu,
  onCopyCode,
  onToggleNeedsHome,
  onRemove,
  onAdjustDates,
}: ServiceCardProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const badge = badgeFor(service);
  const IconGlyph = SERVICE_ICONS[service.id] ?? PlugZapIcon;

  useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [menuOpen]);

  const installValue =
    service.installWindow != null
      ? `${WINDOW[Math.min(service.newStart, DAY_COUNT - 1)]} · ${service.installWindow}`
      : service.meterWindow != null
        ? `${WINDOW[Math.min(service.oldStop, DAY_COUNT - 1)]} · ${service.meterWindow}`
        : null;

  return (
    <div style={styles.serviceCard} id={`sst-card-${service.id}`}>
      <div style={styles.cardHeaderRow}>
        <button
          type="button"
          className="sst-btn sst-focusable"
          style={styles.cardHeaderBtn}
          aria-expanded={expanded}
          aria-label={`${service.provider}, ${badge.label}, ${expanded ? 'collapse' : 'expand'} details`}
          onClick={() => onToggleExpand(service.id)}>
          <span style={styles.cardIcon}>
            <Icon icon={IconGlyph} size="sm" color="inherit" />
          </span>
          <span style={styles.cardName}>{service.name}</span>
          <span style={styles.cardProvider}>{service.provider}</span>
          <StatusBadge service={service} />
          <span
            className="sst-anim"
            style={{...styles.cardChevron, transform: expanded ? 'rotate(180deg)' : 'none'}}>
            <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
          </span>
        </button>
        <button
          type="button"
          className="sst-btn sst-focusable"
          style={styles.ellipsisBtn}
          aria-label={`${service.name} actions`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={event => (menuOpen ? onCloseMenu() : onOpenMenu(service.id, event.currentTarget))}>
          <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
        </button>
      </div>
      <CoverageBars service={service} />
      {expanded ? (
        <div style={styles.handoffCard}>
          <div style={styles.handoffDivider} />
          <div style={styles.row}>
            <span style={styles.rowLabel}>Confirmation</span>
            <span style={styles.rowValueCode}>{service.confirmation}</span>
            <button
              type="button"
              className="sst-btn sst-focusable"
              style={styles.copyBtn}
              aria-label={`Copy confirmation code ${service.confirmation}`}
              onClick={() => onCopyCode(service.id)}>
              <Icon icon={CopyIcon} size="sm" color="inherit" />
            </button>
          </div>
          <div style={styles.row}>
            <span style={styles.rowLabel}>Install window</span>
            {installValue != null ? (
              <span style={styles.valuePill}>{installValue}</span>
            ) : (
              <span style={styles.rowValueMuted}>No visit needed</span>
            )}
          </div>
          <button
            type="button"
            className="sst-btn sst-focusable"
            style={styles.switchRow}
            role="switch"
            aria-checked={service.needsHome}
            onClick={() => onToggleNeedsHome(service.id)}>
            <span style={styles.rowLabel}>Needs you home</span>
            <span
              style={{
                ...styles.switchTrack,
                background: service.needsHome ? BRAND_ACCENT : SWITCH_OFF,
              }}
              aria-hidden>
              <span
                className="sst-anim"
                style={{
                  ...styles.switchThumb,
                  transform: service.needsHome ? 'translateX(20px)' : 'none',
                }}
              />
            </span>
          </button>
          <button
            type="button"
            className="sst-btn sst-focusable"
            style={styles.adjustBtn}
            onClick={event => onAdjustDates(service.id, event.currentTarget)}>
            Adjust dates
          </button>
        </div>
      ) : null}
      {menuOpen ? (
        <div
          ref={menuRef}
          style={styles.anchoredMenu}
          role="menu"
          aria-label={`${service.name} actions`}>
          <button
            type="button"
            role="menuitem"
            className="sst-btn sst-focusable"
            style={styles.menuRow}
            onClick={() => {
              onCopyCode(service.id);
              onCloseMenu();
            }}>
            <Icon icon={CopyIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Copy confirmation code</span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            role="menuitem"
            className="sst-btn sst-focusable"
            style={styles.menuRow}
            onClick={() => {
              onToggleNeedsHome(service.id);
              onCloseMenu();
            }}>
            <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>
              {service.needsHome ? 'Clear needs you home' : 'Mark needs you home'}
            </span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            role="menuitem"
            className="sst-btn sst-focusable"
            style={{...styles.menuRow, color: DANGER_TEXT}}
            onClick={() => onRemove(service.id)}>
            <Icon icon={Trash2Icon} size="sm" color="inherit" />
            <span style={styles.menuRowText}>Remove service</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one state owner; every derived figure recomputes per render.
// ---------------------------------------------------------------------------

const TABS: {id: TabId; label: string; icon: LucideIcon}[] = [
  {id: 'services', label: 'Services', icon: PlugZapIcon},
  {id: 'timeline', label: 'Timeline', icon: CalendarClockIcon},
  {id: 'docs', label: 'Docs', icon: FileCheckIcon},
];

export default function UtilitySwitchTrackerPage() {
  const [state, setState] = useState<SwitchsteadState>(INITIAL_STATE);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);

  // Container width (not viewport): ≥720px = the demo's desktop stage →
  // centered phone column. Viewport query is first-frame fallback only.
  const measuredWidth = useElementWidth(wrapRef);
  const viewportWide = useMediaQuery('(min-width: 720px)');
  const isDesktop = measuredWidth > 0 ? measuredWidth >= 720 : viewportWide;
  const isNarrow = measuredWidth > 0 && measuredWidth < 350;

  // update(id, patch) — the one service mutator; UI patches ride the same
  // owner via patchUi.
  const update = useCallback((id: string, patch: Partial<Service>) => {
    setState(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.id === id ? {...service, ...patch} : service,
      ),
    }));
  }, []);
  const patchUi = useCallback((patch: Partial<SwitchsteadState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);

  // DERIVED — badges, pill, summary, sort, timeline, docs: never stored.
  const services = state.services;
  const byId = new Map(services.map(service => [service.id, service]));
  const totalDark = totalDarkDays(services); // 2+4 = 6 at rest
  const totalDouble = totalDoublePayCents(services); // 1800+200 = 2000¢
  const seamless = seamlessCount(services); // 1 of 5 at rest
  const rows = timelineRows(services); // 11 at rest
  const homeWindows = beHomeCount(services); // 2 at rest
  const monthlyTotal = services.reduce((sum, service) => sum + service.monthlyCents, 0); // 45900¢
  const docCount = services.length + 1; // 5 confirmations + checklist = 6
  const liveRisk = riskSort(services);
  const worstId = liveRisk[0] ?? null;
  const healthLabel =
    totalDark > 0
      ? isNarrow
        ? `${totalDark} dark`
        : `${totalDark} dark day${totalDark === 1 ? '' : 's'}`
      : isNarrow
        ? 'all set'
        : '0 dark days';
  const healthTone: Tone = totalDark > 0 ? 'red' : 'green';

  const makeToast = (msg: string, undo = false): Toast => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, undo};
  };

  // Demo-page scroller (the shell does NOT own scroll) — nearest
  // scrollable ancestor, falling back to the document.
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

  // PER-TAB STATE PERSISTENCE — scroll saved on exit, restored on entry;
  // switching tabs closes only the overlays (sheet, menu); expanded card
  // persists. Re-tapping the active tab scrolls to top (the one legal
  // reset).
  const selectTab = (next: TabId) => {
    const scroller = findScroller();
    if (next === state.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    setState(prev => ({
      ...prev,
      tab: next,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
      sheet: null,
      menuForId: null,
      order: riskSort(prev.services),
    }));
  };
  useEffect(() => {
    const scroller = findScroller();
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.tab] ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore fires
    // on tab identity only.
  }, [state.tab]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TABS.map(tab => tab.id);
    const current = order.indexOf(state.tab);
    const next =
      event.key === 'ArrowRight'
        ? order[(current + 1) % order.length]
        : order[(current + order.length - 1) % order.length];
    selectTab(next);
    document.getElementById(`sst-tab-${next}`)?.focus();
  };

  // Health pill → Services tab, scrolled to the worst-risk card.
  const onHealthPill = () => {
    if (state.tab !== 'services') selectTab('services');
    requestAnimationFrame(() => {
      if (worstId != null) {
        document.getElementById(`sst-card-${worstId}`)?.scrollIntoView({block: 'center'});
      }
    });
  };

  // SHEET LIFECYCLE — scroll-lock via shellLocked while open; the display
  // order re-sorts on CLOSE (never per keystroke — no rows jumping under
  // an open sheet); focus restores to the opener on every close path.
  const openSheet = (serviceId: string, field: 'newStart' | 'oldStop', opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    patchUi({sheet: {serviceId, field, detent: 'medium'}, menuForId: null});
  };
  const closeSheet = () => {
    setState(prev => ({...prev, sheet: null, order: riskSort(prev.services)}));
    sheetOpenerRef.current?.focus();
  };

  // Date commits write through immediately and announce the recount via
  // the single toast region (fired per button press, not per scroll
  // frame). Signature ladder for internet newStart: 6→'2 dark days',
  // 5→'1 dark day', 4→seamless, 3→'$4.50 double-pay', 2→'$9.00
  // double-pay' (2 × $4.50).
  const onSetDate = (serviceId: string, field: 'newStart' | 'oldStop', idx: number) => {
    setState(prev => {
      const nextServices = prev.services.map(service =>
        service.id === serviceId ? {...service, [field]: idx} : service,
      );
      toastSeqRef.current += 1;
      const nextDark = totalDarkDays(nextServices);
      return {
        ...prev,
        services: nextServices,
        toast: {
          seq: toastSeqRef.current,
          msg: `Move-in health: ${nextDark} dark day${nextDark === 1 ? '' : 's'}`,
          undo: false,
        },
      };
    });
  };

  const onCopyCode = (serviceId: string) => {
    const service = byId.get(serviceId);
    if (service == null) return;
    patchUi({toast: makeToast(`Code ${service.confirmation} copied`)});
  };

  // Cross-surface projection: the switch writes the same store the
  // Timeline reads — the amber be-home pill and the caption recount
  // together (stress 7: 2→3 windows).
  const onToggleNeedsHome = (serviceId: string) => {
    setState(prev => {
      const nextServices = prev.services.map(service =>
        service.id === serviceId ? {...service, needsHome: !service.needsHome} : service,
      );
      const flipped = nextServices.find(service => service.id === serviceId);
      toastSeqRef.current += 1;
      return {
        ...prev,
        services: nextServices,
        toast: {
          seq: toastSeqRef.current,
          msg: `Needs you home ${flipped?.needsHome ? 'on' : 'off'} — ${flipped?.name ?? ''}`,
          undo: false,
        },
      };
    });
  };

  // UNDO OVER CONFIRM — Remove executes immediately; the toast offers
  // Undo (no timer; replaced by the next mutation). Undo restores the
  // exact prior list position (stress 5: dark 6→2, docs 6→5, timeline
  // 11→9, $459→$426/mo — and back).
  const onRemove = (serviceId: string) => {
    setState(prev => {
      const service = prev.services.find(item => item.id === serviceId);
      if (service == null) return prev;
      const index = prev.order.indexOf(serviceId);
      toastSeqRef.current += 1;
      return {
        ...prev,
        services: prev.services.filter(item => item.id !== serviceId),
        order: prev.order.filter(id => id !== serviceId),
        expandedService: prev.expandedService === serviceId ? null : prev.expandedService,
        menuForId: null,
        removed: {service, index},
        toast: {seq: toastSeqRef.current, msg: `${service.providerShort} removed`, undo: true},
      };
    });
    menuOpenerRef.current = null;
  };
  const onUndoRemove = () => {
    setState(prev => {
      if (prev.removed == null) return prev;
      const {service, index} = prev.removed;
      const order = [...prev.order];
      order.splice(Math.min(index, order.length), 0, service.id);
      toastSeqRef.current += 1;
      return {
        ...prev,
        services: [...prev.services, service],
        order,
        removed: null,
        toast: {seq: toastSeqRef.current, msg: `Restored — ${service.providerShort}`, undo: false},
      };
    });
  };

  // MENUS — anchored per card; focus restores to the opening ellipsis.
  const openMenu = (serviceId: string, opener: HTMLElement) => {
    menuOpenerRef.current = opener;
    patchUi({menuForId: serviceId});
  };
  const closeMenu = () => {
    patchUi({menuForId: null});
    menuOpenerRef.current?.focus();
  };

  // ESCAPE closes the topmost layer only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.menuForId != null) {
        event.stopPropagation();
        closeMenu();
      } else if (state.sheet != null) {
        event.stopPropagation();
        closeSheet();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- layering
    // depends on which overlays are open.
  }, [state.menuForId, state.sheet]);

  const sheetService = state.sheet != null ? byId.get(state.sheet.serviceId) ?? null : null;
  const sheetOpen = state.sheet != null && sheetService != null;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktop ? styles.shellDesktop : null),
    ...(sheetOpen ? styles.shellLocked : null),
  };

  // Docs rows — 5 provider confirmations (subtitle re-derives 'starts
  // <date>' live from the store) + the checklist PDF.
  const orderedForDocs = services;

  // Timeline grouped by day.
  const dayGroups: {idx: number; rows: TimelineRow[]}[] = [];
  for (const row of rows) {
    const last = dayGroups[dayGroups.length - 1];
    if (last != null && last.idx === row.idx) last.rows.push(row);
    else dayGroups.push({idx: row.idx, rows: [row]});
  }

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SST_CSS}</style>
      <div style={shellStyle}>
        <h1 className="sst-vh">Switchstead — move to 128 Foxglove Ln</h1>
        {/* NAV BAR — 52px, grid '1fr auto 1fr', hairline always on. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <SwitchsteadMark />
          </div>
          <p style={styles.navTitle}>Move · {MOVE.label}</p>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="sst-btn sst-focusable"
              style={styles.healthPillHit}
              aria-label={`Move-in health: ${healthLabel}. Show riskiest service`}
              onClick={onHealthPill}>
              <span
                style={{
                  ...styles.healthPill,
                  background: TONE_FILL[healthTone],
                  color: TONE_TEXT[healthTone],
                  border: `1px solid ${TONE_TEXT[healthTone]}`,
                }}>
                {healthLabel}
              </span>
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'services' ? (
            <>
              {/* ADDRESS STRIP — 64px, two 28px rows. */}
              <div style={{...styles.listCard, marginTop: 12}}>
                <div style={styles.addressStrip}>
                  <div style={styles.addressRow}>
                    <span style={styles.addressLabel}>From</span>
                    <span style={styles.addressValue}>{ADDRESSES.old.line}</span>
                  </div>
                  <div style={styles.addressRow}>
                    <span style={styles.addressLabel}>To</span>
                    <span style={styles.addressValue}>{ADDRESSES.new.line}</span>
                  </div>
                </div>
              </div>
              {/* SUMMARY STRIP — derives live: 6 · $20.00 · 1 of 5. */}
              <p style={styles.summaryStrip}>
                <span>
                  Dark days <span style={styles.summaryStrong}>{totalDark}</span>
                </span>
                <span aria-hidden>·</span>
                <span>
                  Double-pay <span style={styles.summaryStrong}>{fmtUsd(totalDouble)}</span>
                </span>
                <span aria-hidden>·</span>
                <span>
                  <span style={styles.summaryStrong}>{seamless}</span> of {services.length} seamless
                </span>
              </p>
              <h2 style={styles.sectionHeader}>Services — by risk</h2>
              {state.order.map(id => {
                const service = byId.get(id);
                if (service == null) return null;
                return (
                  <ServiceCard
                    key={id}
                    service={service}
                    expanded={state.expandedService === id}
                    menuOpen={state.menuForId === id}
                    onToggleExpand={serviceId =>
                      patchUi({
                        expandedService: state.expandedService === serviceId ? null : serviceId,
                      })
                    }
                    onOpenMenu={openMenu}
                    onCloseMenu={closeMenu}
                    onCopyCode={onCopyCode}
                    onToggleNeedsHome={onToggleNeedsHome}
                    onRemove={onRemove}
                    onAdjustDates={(serviceId, opener) => openSheet(serviceId, 'newStart', opener)}
                  />
                );
              })}
            </>
          ) : null}

          {state.tab === 'timeline' ? (
            <>
              {dayGroups.map(group => (
                <div key={group.idx}>
                  <h2 style={styles.sectionHeader}>
                    {DAYS_FULL[group.idx]}
                    {group.idx === MOVE.idx ? ' — Move day' : ''}
                  </h2>
                  <div style={styles.listCard}>
                    {group.rows.map((row, rowIndex) => (
                      <div key={row.id}>
                        {rowIndex > 0 ? <div style={styles.rowDivider} /> : null}
                        <div style={styles.timelineRow}>
                          <div style={styles.timelineText}>
                            <span style={styles.timelinePrimary}>{row.primary}</span>
                            <span style={styles.timelineSecondary}>{row.secondary}</span>
                          </div>
                          {row.isMove ? <span style={styles.movePill}>MOVE</span> : null}
                          {row.beHome != null ? (
                            <span style={styles.beHomePill}>{row.beHome}</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {/* Be-home caption — 2 at rest; water ON → 3 (stress 7). */}
              <p style={styles.timelineCaption}>
                Needs you home: {homeWindows} window{homeWindows === 1 ? '' : 's'}
              </p>
            </>
          ) : null}

          {state.tab === 'docs' ? (
            <>
              <h2 style={styles.sectionHeader}>Confirmations & docs</h2>
              <div style={styles.listCard}>
                {orderedForDocs.map((service, index) => (
                  <div key={service.id}>
                    {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                    <button
                      type="button"
                      className="sst-btn sst-focusable"
                      style={styles.docRow}
                      onClick={() =>
                        patchUi({toast: makeToast(`Opened ${service.providerShort} confirmation`)})
                      }>
                      <span style={styles.docThumb} aria-hidden>
                        {service.initials}
                      </span>
                      <span style={styles.docText}>
                        <span style={styles.docPrimary}>{service.provider}</span>
                        <span style={styles.docSecondary}>
                          {service.confirmation} · starts{' '}
                          {WINDOW[Math.min(service.newStart, DAY_COUNT - 1)]} · for 128 Foxglove Ln
                        </span>
                      </span>
                      <span style={styles.docMeta}>{service.monthlyLabel}</span>
                    </button>
                  </div>
                ))}
                <div style={styles.rowDividerDeep} />
                <button
                  type="button"
                  className="sst-btn sst-focusable"
                  style={styles.docRow}
                  onClick={() => patchUi({toast: makeToast('Opened move-in checklist')})}>
                  <span style={styles.docThumb} aria-hidden>
                    <Icon icon={FileTextIcon} size="md" color="inherit" />
                  </span>
                  <span style={styles.docText}>
                    <span style={styles.docPrimary}>Move-in checklist — Foxglove Ln</span>
                    <span style={styles.docSecondary}>PDF · 2 pages</span>
                  </span>
                </button>
              </div>
              {/* Terminal caption — 9600+13500+13500+6000+3300 = $459/mo;
                  remove Havencart → $426/mo (stress 5). */}
              <p style={styles.terminalCaption}>
                New-address total ${Math.round(monthlyTotal / 100)}/mo
              </p>
            </>
          ) : null}
        </main>

        {/* Click-catcher under the anchored menu (z29 < menu z30). */}
        {state.menuForId != null ? (
          <div style={styles.menuCatcher} aria-hidden onClick={closeMenu} />
        ) : null}

        {/* TOAST DOCK — the single aria-live polite region; sticky in
            flow above the tabBar, absolute only during sheet scroll-lock
            (foundations amendment). */}
        <div style={sheetOpen ? styles.toastDockLocked : styles.toastDock} aria-live="polite">
          {state.toast != null ? (
            <div
              key={state.toast.seq}
              style={sheetOpen ? {...styles.toast, ...styles.toastLocked} : styles.toast}>
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    className="sst-btn sst-focusable"
                    style={styles.toastUndo}
                    onClick={onUndoRemove}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px, 3 tabs; Docs badge counts live (6 → 5 after a
            removal). */}
        <nav style={styles.tabBar} aria-label="Sections">
          {TABS.map(tab => {
            const active = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                id={`sst-tab-${tab.id}`}
                type="button"
                className="sst-btn sst-focusable"
                style={active ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                aria-current={active ? 'page' : undefined}
                onClick={() => selectTab(tab.id)}
                onKeyDown={onTabKeyDown}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'docs' ? <span style={styles.tabBadge}>{docCount}</span> : null}
                </span>
                <span style={active ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* SHEET — z40 scrim + z41 sheet, absolute inside the locked
            shell. */}
        {state.sheet != null && sheetService != null ? (
          <DateAdjustSheet
            sheet={state.sheet}
            service={sheetService}
            totalDark={totalDark}
            onSetDate={onSetDate}
            onToggleDetent={() =>
              setState(prev =>
                prev.sheet == null
                  ? prev
                  : {
                      ...prev,
                      sheet: {
                        ...prev.sheet,
                        detent: prev.sheet.detent === 'medium' ? 'large' : 'medium',
                      },
                    },
              )
            }
            onSetDetent={detent =>
              setState(prev =>
                prev.sheet == null ? prev : {...prev, sheet: {...prev.sheet, detent}},
              )
            }
            onClose={closeSheet}
          />
        ) : null}
      </div>
    </div>
  );
}
