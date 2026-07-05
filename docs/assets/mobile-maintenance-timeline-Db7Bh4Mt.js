var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Lugnut's two-vehicle garage frozen at
 *   TODAY 'Jul 1, 2026' (zero Date.now(), zero Math.random()): the 2019
 *   Corvid Estate at 46,900 mi with 14 logged services (per-service costs
 *   sum to every year header: 2020 $68 · 2021 $218 · 2022 $247 · 2023 $196 ·
 *   2024 $391 · 2025 $301 · 2026 $84 → lifetime $1,505) and six intervals
 *   whose status law pct = max(milesPct, timePct) yields 2 overdue (air
 *   filter 111% by miles, belt 117% by TIME — 84.5 mo vs 72), 3 soon
 *   (rotation 84, brake fluid 83, oil 77 — days beat miles: 141/182 vs
 *   1,900/5,000), 1 ok (coolant 47); the 2022 Corvid Sprint at 18,450 mi
 *   with 3 services ($241) and a 0-overdue strip. All interval anchors
 *   derive LIVE from the service log, so deleting rotation service #11
 *   honestly re-anchors rotation to #5 @ 20,300 → 355% (stress 6).
 * @output Lugnut — Miles-Ruled Service Timeline: a 390px MOBILE surface
 *   where MILEAGE ITSELF is the scrubbable axis. Four tabs (Timeline / Due /
 *   History / Garage). Timeline: an OdometerRuler — a vertical miles-ruled
 *   rail at 0.06px/mi (60,000 top → 36,000 bottom = 1,440px; 'Show 8
 *   earlier services' extends to 4,000 = +1,920px) with major ticks every
 *   2,000 mi, minors every 500, year callouts at first-service-of-year
 *   miles, past ReceiptStubRows dog-legged to their exact mile tick, a
 *   dashed future segment with projected interval markers (rotation 48,100
 *   · oil 50,000 · brake fluid 52,000 · air filter 45,200 already-red ·
 *   belt pinned AT the current line, overdue by time), and the 44×44
 *   rulerThumb on the current-mileage brand line. SIGNATURE: dragging the
 *   thumb UP drives forward hypothetically (1px = 16.67 mi, snapped to 100,
 *   clamped 46,900–60,000); every step re-derives interval arcs, Due chips,
 *   and the floating DeltaPill ('at 48,200 mi: 3 items due') with time pcts
 *   frozen; Enter opens the mileage sheet prefilled; committing 48,200
 *   moves the Due badge 2→3, resorts the Due list, slides the current
 *   marker to y=708, flips the 48,100 marker red, and recolors the Garage
 *   HealthStrip 3/2/1 — all from ONE store value.
 * @position Page template; emitted by \`astryx template mobile-maintenance-timeline\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays are position:'absolute' INSIDE
 *   shell; position:fixed is banned. While a sheet is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close. Toast dock
 *   and FAB are STICKY-IN-FLOW (bottom 76 / bottom 80 above the 64px tab
 *   bar) per the batch-2 amendment — shell-absolute would pin them to the
 *   document bottom on the 3,360px expanded rail.
 * Container policy: inset-grouped mobile listCards (12px radius, hairline
 *   border, rowDividers inset 16 / 68 for icon-led rows); the ruler's tick
 *   hairlines are the only full-bleed elements. No desktop frames, no side
 *   asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand block (Lugnut
 *   orange) with fill/text/on-brand pairs + status pairs, contrast math at
 *   each declaration. Rest-state meaningful fills (arc tracks, future rail
 *   beads) use an explicit ≥3:1 TRACK_REST pair per the amendment — never
 *   bare muted/hairline tokens.
 * Density grid (MOBILE, verbatim): 16px screen gutter · 12px card gaps ·
 *   24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', blur surface, hairline ALWAYS ON
 *   — chosen policy, this template's IO sentinel drives only the title
 *   fade); large-title row 52px (28/700 title + 36px vehicleChip pill in a
 *   44px hit) → total large header 104px; tabBar exactly 64px sticky bottom
 *   z20, 4 tabItems flex:1 (24px icon over 11px/500 label, 4px gap); FAB
 *   56×56 sticky-anchored right 16 bottom 80; rows 44px utility / 60px
 *   two-line / 72px media (48px icon tile, 12px radius); sectionHeader
 *   13/600 uppercase 0.06em at 32px, 20/8 margins; sheet detents 55% /
 *   calc(100% − 56px), 24px grabber zone with 36×5 pill, 52px sheet header.
 *   TYPE (Figtree): 28/700 large title · 22/700 section stats · 17/600
 *   nav+card titles · 16/400 body · 13/400 meta · 11/500 overlines+tab
 *   labels; nothing under 11px; tabular-nums on every mileage, %, $, count.
 *   Touch: every target ≥44×44 with ≥8px clearance or merged full-row;
 *   every gesture has a visible button path (Update mileage button = the
 *   thumb's non-gesture path; per-row 44×44 ellipsis = swipe fallback;
 *   clickable grabber + X = sheet drag fallback).
 *
 * Responsive contract:
 * - Fluid 320–430, zero horizontal overflow (overflowX:'clip' backstop
 *   only). Ruler event cards are fluid right of the fixed rail offset (at
 *   320 they narrow to ~248px — names ellipsize, tabular costs never wrap,
 *   flexShrink 0). DeltaPill maxWidth calc(100% − 32px). History stat strip
 *   'repeat(auto-fit, minmax(104px, 1fr))' wraps 3 → 2+1 below 360. Due
 *   rows: 48px arc fixed, text flex-min-0 ellipsis, chip flexShrink 0.
 *   NavBar title max 200px; vehicleChip label ellipsizes at 160px.
 * - Desktop stage (~1045px): useElementWidth on the wrapper (container
 *   width, not viewport) — at ≥720px the shell renders as a centered
 *   390–430px phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout; the ruler is deliberately phone
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
  AlertCircleIcon,
  BellOffIcon,
  BellRingIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  DropletsIcon,
  FanIcon,
  GripHorizontalIcon,
  MinusIcon,
  MoreHorizontalIcon,
  OctagonIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  ReceiptIcon,
  RouteIcon,
  Trash2Icon,
  WarehouseIcon,
  WrenchIcon,
  XIcon,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — the one quarantined Lugnut brand block + status pairs.
// Every pair carries its contrast math against its ACTUAL surface.
// ---------------------------------------------------------------------------

// Graphic strokes/arcs ONLY (≥3:1 graphics bar): #E8590C on the light card
// (#FFFFFF-ish) ≈ 3.62:1; #FF8A50 on the dark card (~#1C1C1E) ≈ 3.9:1.
const BRAND_ACCENT = 'light-dark(#E8590C, #FF8A50)';
// Brand TEXT and solid brand FILLS that carry ON_BRAND text: #CC4A08 on the
// light card ≈ 4.61:1; #FF9A62 on the dark card ≈ 7.9:1.
const BRAND_TEXT = 'light-dark(#CC4A08, #FF9A62)';
// Text on BRAND_TEXT-colored fills (FAB, thumb pill, DeltaPill, badge):
// #FFFFFF on #CC4A08 ≈ 4.61:1; #26130A on #FF9A62 ≈ 9.8:1.
const ON_BRAND = 'light-dark(#FFFFFF, #26130A)';
// 12% brand wash for active-tier tints (decorative; text on it stays
// --color-text-primary).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Status pairs (text + arc strokes + strip segments). OK: #1A7F37 on the
// light card ≈ 4.8:1, #57D9A3 on the dark card ≈ 10.9:1. SOON: #9A5B00 on
// light ≈ 4.7:1, #F5C044 on dark ≈ 9.3:1. Both clear the 3:1 graphics bar
// and 4.5:1 for their 11–13px chip text.
const STATUS_OK = 'light-dark(#1A7F37, #57D9A3)';
const STATUS_SOON = 'light-dark(#9A5B00, #F5C044)';
const STATUS_OVERDUE = 'var(--color-error)';
// AMENDMENT PAIR — meaningful REST fills (arc remaining-track, future rail
// beads, healthstrip would-be-empty) need ≥3:1 vs the card, not the muted
// token: #8A8174 on #FFFFFF ≈ 3.85:1; #9A938A on #1C1C1E ≈ 5.2:1.
const TRACK_REST = 'light-dark(#8A8174, #9A938A)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, focus-visible rings, visually-hidden h-tags,
// transform/opacity transitions, skeleton shimmer; ALL motion collapses
// under prefers-reduced-motion (static muted blocks still read 'loading').
// ---------------------------------------------------------------------------

const LUGNUT_CSS = \`
.lgn-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.lgn-btn:disabled { cursor: default; }
.lgn-focusable:focus-visible {
  outline: 2px solid \${BRAND_TEXT};
  outline-offset: 2px;
}
.lgn-anim { transition: transform 200ms ease, opacity 200ms ease; }
.lgn-fade { transition: opacity 200ms ease; }
@keyframes lgn-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.lgn-sheet-in { animation: lgn-sheet-in 200ms ease; }
@keyframes lgn-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.lgn-shimmer { animation: lgn-shimmer 1.6s linear infinite; }
.lgn-vh {
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
  .lgn-anim, .lgn-fade { transition: none; }
  .lgn-sheet-in { animation: none; }
  .lgn-shimmer { animation: none; display: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  // THE SHELL CONTRACT (verbatim).
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
  shellDesktop: {maxWidth: 430, marginInline: 'auto', borderInline: '1px solid var(--color-border)'},
  // NAV BAR — 52px sticky top z20; hairline ALWAYS ON (chosen policy).
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  // Compact per-tab title — starts opacity 0, fades in when the IO sentinel
  // under the large-title row leaves the viewport.
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    opacity: 0,
  },
  navTitleOn: {opacity: 1},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // LARGE-TITLE ROW — 52px in-flow block below navBar (total header 104px).
  largeTitle: {
    position: 'relative',
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1},
  vehicleChipHit: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999, flexShrink: 0},
  vehicleChip: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    maxWidth: 160,
  },
  vehicleChipLabel: {whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  updatedCaption: {
    paddingInline: 16,
    marginTop: -4,
    marginBottom: 4,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
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
  // ODOMETER HEADER CARD (Timeline).
  odoCard: {
    marginInline: 16,
    marginTop: 4,
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
  },
  odoText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  odoMiles: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  odoMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // ODOMETER RULER — relative canvas; everything inside is absolute at
  // y(mi) = (topMile − mi) × 0.06.
  ruler: {position: 'relative', marginTop: 24},
  railPast: {position: 'absolute', left: 63, width: 2, background: 'var(--color-border)'},
  railFuture: {
    position: 'absolute',
    left: 63,
    width: 2,
    backgroundImage: \`repeating-linear-gradient(to bottom, \${TRACK_REST} 0 5px, transparent 5px 10px)\`,
  },
  tickMajor: {position: 'absolute', left: 40, width: 24, height: 1, background: 'var(--color-border)'},
  tickMinor: {position: 'absolute', left: 52, width: 12, height: 1, background: 'var(--color-border)'},
  tickLabel: {
    position: 'absolute',
    left: 0,
    width: 36,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    transform: 'translateY(-50%)',
  },
  yearCallout: {
    position: 'absolute',
    left: 0,
    width: 36,
    textAlign: 'right',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    transform: 'translateY(-50%)',
  },
  // Future interval markers — hollow 12px bead centered on the rail (a
  // meaningful rest fill → TRACK_REST border, ≥3:1 math at the const) +
  // 13px label to the right.
  markerBead: {
    position: 'absolute',
    left: 58,
    width: 12,
    height: 12,
    borderRadius: 999,
    border: \`2px solid \${TRACK_REST}\`,
    background: 'var(--color-background-body)',
    transform: 'translateY(-50%)',
  },
  markerLabel: {
    position: 'absolute',
    left: 80,
    right: 16,
    transform: 'translateY(-50%)',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  // Current-mileage marker — full-width brand hairline + 44×44 thumb.
  currentLine: {position: 'absolute', left: 0, right: 0, height: 2, background: BRAND_ACCENT},
  rulerThumb: {
    position: 'absolute',
    left: 42,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    transform: 'translateY(-50%)',
    touchAction: 'none',
    borderRadius: 999,
    zIndex: 3,
  },
  rulerThumbPill: {
    width: 44,
    height: 28,
    borderRadius: 999,
    background: BRAND_TEXT,
    color: ON_BRAND,
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 2px 8px var(--color-shadow)',
  },
  deltaPillWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 4,
  },
  deltaPill: {
    maxWidth: 'calc(100% - 0px)',
    paddingInline: 12,
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 999,
    background: BRAND_TEXT,
    color: ON_BRAND,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  // Event cards on the rail (right of the rail, dog-legged to their tick).
  eventCard: {
    position: 'absolute',
    left: 96,
    right: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 2,
  },
  leaderH: {position: 'absolute', height: 1, background: 'var(--color-border)'},
  leaderV: {position: 'absolute', width: 1, background: 'var(--color-border)'},
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_TEXT,
    borderTop: '1px solid var(--color-border)',
  },
  terminalCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    marginTop: 16,
  },
  // RECEIPT STUB ROW — 72px media row + tear-open parts.
  row72: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  iconTile: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  rowText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
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
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  rowChevron: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0, marginRight: 12},
  // Perforated tear edge — 6px dot strip via repeating radial-gradient
  // (passive decoration; hairline color is legal here).
  tearEdge: {
    height: 6,
    backgroundImage: 'radial-gradient(circle at 3px 3px, var(--color-border) 1.6px, transparent 1.9px)',
    backgroundSize: '10px 6px',
    backgroundRepeat: 'repeat-x',
  },
  partRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  partLabel: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  partPrice: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: 'var(--color-text-primary)'},
  tearSubtotal: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    background: 'var(--color-background-muted)',
  },
  // Swipe scaffolding (History rows).
  swipeOuter: {position: 'relative', overflow: 'hidden'},
  swipeAction: {
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
    background: 'var(--color-error)',
    // White on the error fill — house error token is ≥4.5:1 with white in
    // both schemes per the token sheet.
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
  },
  swipeContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  // DUE tab — segmented control + 72px interval rows.
  segTrack: {
    marginInline: 16,
    marginTop: 4,
    height: 36,
    display: 'flex',
    padding: 2,
    gap: 2,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
  },
  segBtn: {
    flex: 1,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  segBtnOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  dueRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  statusChip: {
    flexShrink: 0,
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // HISTORY — stat strip.
  statStrip: {
    marginInline: 16,
    marginTop: 4,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))',
    gap: 12,
  },
  statTile: {
    padding: '12px 16px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  },
  statValue: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  statLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // GARAGE — vehicle cards.
  vehicleCard: {
    marginInline: 16,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  vehicleCardHead: {display: 'flex', alignItems: 'flex-start', gap: 12},
  vehicleCardText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  vehicleCardName: {fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  vehicleCardMeta: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  vehicleCardMiles: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  healthStrip: {display: 'flex', gap: 2, height: 8},
  healthSeg: {flex: 1, borderRadius: 999},
  healthLegend: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  activePill: {
    alignSelf: 'flex-start',
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_TEXT,
    fontSize: 11,
    fontWeight: 600,
  },
  // TAB BAR — exactly 64px; 4 tabItems flex:1.
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
  tabItemActive: {color: BRAND_TEXT},
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // Due badge — 10px/600 white on #CC4A08 ≈ 4.61:1 (ON_BRAND pair).
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
    background: BRAND_TEXT,
    color: ON_BRAND,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // FAB — sticky-in-flow anchor (amendment: absolute would pin to the
  // document bottom on the 3,360px rail).
  fabAnchor: {
    position: 'sticky',
    bottom: 80,
    zIndex: 25,
    height: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    paddingInline: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: BRAND_TEXT,
    color: ON_BRAND,
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  // TOAST DOCK — the ONE polite live region; sticky-in-flow at bottom 76.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
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
  },
  toastText: {
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
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  // ANCHORED MENUS — absolute cards, z30 (below sheet scrim z40).
  anchoredMenu: {
    position: 'absolute',
    zIndex: 30,
    minWidth: 220,
    maxWidth: 'calc(100vw - 32px)',
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
  menuRowText: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  menuCheck: {width: 20, flexShrink: 0, display: 'grid', placeItems: 'center', color: BRAND_TEXT},
  // SHEET — scrim z40 + sheet z41.
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
  sheetGrabberZone: {
    width: '100%',
    height: 24,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  sheetGrabber: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
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
  confirmBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_TEXT,
    color: ON_BRAND,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  chipGrid: {display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8},
  typeChip: {
    height: 36,
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--color-text-primary)',
  },
  typeChipOn: {border: \`1px solid \${BRAND_TEXT}\`, background: BRAND_TINT_12, color: BRAND_TEXT},
  formField: {display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16},
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
    fontVariantNumeric: 'tabular-nums',
    width: '100%',
  },
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-error)',
  },
  stepperRow: {display: 'flex', alignItems: 'center', gap: 12, marginTop: 8},
  stepper: {
    width: 96,
    height: 32,
    display: 'flex',
    background: 'var(--color-background-muted)',
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
  },
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
    // Each half's hit extends to 44px via the row's block padding.
    paddingBlock: 0,
  },
  stepperRule: {width: 1, background: 'var(--color-border)', flexShrink: 0},
  stepperValue: {fontSize: 16, fontVariantNumeric: 'tabular-nums'},
  // EMPTY STATE + SKELETONS.
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
  skeletonRow: {height: 72, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skelThumb: {width: 48, height: 48, borderRadius: 12, background: 'var(--color-background-muted)', flexShrink: 0},
  skelLines: {flex: 1, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  shimmerHost: {position: 'relative', overflow: 'hidden'},
  shimmerSweep: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-background-card) 55%, transparent) 50%, transparent 100%)',
    pointerEvents: 'none',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — frozen at TODAY 'Jul 1, 2026'. Cross-check ledger (verified by
// hand): YEAR SUMS 2020 $68 · 2021 112+72+34=$218 · 2022 118+129=$247 ·
// 2023 75+121=$196 · 2024 79+312=$391 · 2025 30+82+189=$301 · 2026 $84;
// LIFETIME 68+218+247+196+391+301+84 = $1,505; Sprint 52+84+105 = $241.
// STATUS LAW pct = max(milesPct, timePct): ok<75, soon 75–99, overdue ≥100.
// Estate rest: oil 38m/77t SOON · rotation 84 SOON · brake fluid 83 SOON ·
// coolant 47 OK · air filter 111 OVERDUE · belt 78m/117t OVERDUE-BY-TIME →
// 2 overdue / 3 soon / 1 ok → Due badge '2', HealthStrip 1 ok · 3 soon ·
// 2 overdue. SCRUB TABLE (DeltaPill reproduces this exactly; time frozen):
//   46,900 → 2 due · 48,100 rotation crosses (7,500/7,500) → 3 ·
//   50,000 oil crosses → 4 · 52,000 brake fluid crosses → 5 ·
//   60,000 (End key) → 5 (coolant 60,000/100,000 = 60% never crosses).
//   Pitch checkpoint 48,200: rotation 7,600/7,500=101 DUE, oil 3,200/5,000=
//   64 (time 77) not due → belt+airFilter+rotation = '3 items due'. ✓
// COMMIT 48,200: badge 2→3, Due resorts (rotation 101 joins overdue),
// marker y = (60,000−48,200)×0.06 = 708px, 48,100 marker flips red,
// HealthStrip → 3 overdue / 2 soon / 1 ok.
// ---------------------------------------------------------------------------

const TODAY_LABEL = 'Jul 1, 2026';
const PX_PER_MI = 0.06;
const MI_PER_PX = 1 / PX_PER_MI; // 16.67 mi per pixel of thumb travel

interface ServicePart {
  id: string;
  label: string;
  cents: number;
}

interface ServiceRec {
  id: string;
  mile: number;
  dateLabel: string;
  year: number;
  // Days before TODAY (precomputed, deterministic; only oil's anchor (#14,
  // 141d) and the belt's never-serviced fallback enter the time race at
  // rest, but every row carries an honest value for delete re-anchoring).
  daysAgo: number;
  title: string;
  covers: string[];
  cents: number;
  shop: string;
  icon: LucideIcon;
  parts: ServicePart[];
  deleted?: boolean;
}

interface IntervalDef {
  id: string;
  name: string;
  tag: string;
  miles: number;
  days: number | null;
  icon: LucideIcon;
  // Fixed label for the one interval whose TIME beats miles (belt).
  timeDueLabel?: string;
}

interface VehicleRec {
  id: string;
  name: string;
  chipShort: string;
  vinTail: string;
  addedLabel: string;
  mileage: number;
  mileageAsOf: string;
  mileageLogged: string;
  ageDays: number; // in-service date → TODAY (belt/coolant never-serviced fallback)
  railTop: number;
  railRestBottom: number;
  railFullBottom: number;
  services: ServiceRec[];
  intervals: IntervalDef[];
}

const p = (id: string, label: string, cents: number): ServicePart => ({id, label, cents});

// V1 — 2019 Corvid Estate. Every parts list sums EXACTLY to its stub
// (tear-open subtotal law): #14 42+11+26+5 = 84 ✓ · #10 148+96+58+10 = 312 ✓.
const V1_SERVICES: ServiceRec[] = [
  {id: 's01', mile: 5000, dateLabel: 'Jul 12, 2020', year: 2020, daysAgo: 2180, title: 'Oil & filter', covers: ['oil'], cents: 6800, shop: 'Hilltop Garage', icon: DropletsIcon, parts: [p('s01a', 'Oil change kit', 4300), p('s01b', 'Labor', 2500)]},
  {id: 's02', mile: 10100, dateLabel: 'Mar 3, 2021', year: 2021, daysAgo: 1946, title: 'Oil + rotation', covers: ['oil', 'rotation'], cents: 11200, shop: 'Hilltop Garage', icon: DropletsIcon, parts: [p('s02a', 'Oil & filter kit', 4700), p('s02b', 'Tire rotation', 3000), p('s02c', 'Labor', 3500)]},
  {id: 's03', mile: 15200, dateLabel: 'Nov 18, 2021', year: 2021, daysAgo: 1686, title: 'Oil change', covers: ['oil'], cents: 7200, shop: 'Hilltop Garage', icon: DropletsIcon, parts: [p('s03a', 'Oil & filter kit', 4600), p('s03b', 'Labor', 2600)]},
  {id: 's04', mile: 15200, dateLabel: 'Nov 18, 2021', year: 2021, daysAgo: 1686, title: 'Engine air filter', covers: ['airFilter'], cents: 3400, shop: 'Hilltop Garage', icon: FanIcon, parts: [p('s04a', 'Air filter element', 2200), p('s04b', 'Labor', 1200)]},
  {id: 's05', mile: 20300, dateLabel: 'Jun 9, 2022', year: 2022, daysAgo: 1483, title: 'Oil + rotation', covers: ['oil', 'rotation'], cents: 11800, shop: 'Hilltop Garage', icon: DropletsIcon, parts: [p('s05a', 'Oil & filter kit', 4900), p('s05b', 'Tire rotation', 3200), p('s05c', 'Labor', 3700)]},
  {id: 's06', mile: 22000, dateLabel: 'Sep 2, 2022', year: 2022, daysAgo: 1398, title: 'Brake fluid flush', covers: ['brakeFluid'], cents: 12900, shop: 'Hilltop Garage', icon: OctagonIcon, parts: [p('s06a', 'DOT 4 fluid', 2400), p('s06b', 'Flush labor', 9800), p('s06c', 'Shop supplies', 700)]},
  {id: 's07', mile: 25400, dateLabel: 'Feb 21, 2023', year: 2023, daysAgo: 1226, title: 'Oil change', covers: ['oil'], cents: 7500, shop: 'Hilltop Garage', icon: DropletsIcon, parts: [p('s07a', 'Oil & filter kit', 4800), p('s07b', 'Labor', 2700)]},
  {id: 's08', mile: 30200, dateLabel: 'Oct 5, 2023', year: 2023, daysAgo: 1000, title: 'Oil + air filter', covers: ['oil', 'airFilter'], cents: 12100, shop: 'Hilltop Garage', icon: DropletsIcon, parts: [p('s08a', 'Oil & filter kit', 4700), p('s08b', 'Air filter element', 2600), p('s08c', 'Labor', 4800)]},
  {id: 's09', mile: 36700, dateLabel: 'Aug 14, 2024', year: 2024, daysAgo: 686, title: 'Oil change', covers: ['oil'], cents: 7900, shop: 'Hilltop Garage', icon: DropletsIcon, parts: [p('s09a', 'Oil & filter kit', 5000), p('s09b', 'Labor', 2900)]},
  {id: 's10', mile: 38900, dateLabel: 'Dec 2, 2024', year: 2024, daysAgo: 576, title: 'Front brake pads', covers: [], cents: 31200, shop: 'Hilltop Garage', icon: OctagonIcon, parts: [p('s10a', 'Pad set', 14800), p('s10b', 'Rotor resurface', 9600), p('s10c', 'Labor', 5800), p('s10d', 'Shop supplies', 1000)]},
  {id: 's11', mile: 40600, dateLabel: 'Mar 21, 2025', year: 2025, daysAgo: 467, title: 'Tire rotation', covers: ['rotation'], cents: 3000, shop: 'Hilltop Garage', icon: RouteIcon, parts: [p('s11a', 'Rotation labor', 3000)]},
  {id: 's12', mile: 41800, dateLabel: 'Jun 30, 2025', year: 2025, daysAgo: 366, title: 'Oil change', covers: ['oil'], cents: 8200, shop: 'Hilltop Garage', icon: DropletsIcon, parts: [p('s12a', 'Oil & filter kit', 5200), p('s12b', 'Labor', 3000)]},
  {id: 's13', mile: 44300, dateLabel: 'Oct 11, 2025', year: 2025, daysAgo: 263, title: 'Battery', covers: [], cents: 18900, shop: 'Hilltop Garage', icon: WrenchIcon, parts: [p('s13a', 'AGM battery', 15900), p('s13b', 'Install', 3000)]},
  // #14 — the ellipsis stressor shop name (must truncate in a 72px row at
  // 320px without pushing the tabular '$84').
  {id: 's14', mile: 45000, dateLabel: 'Feb 10, 2026', year: 2026, daysAgo: 141, title: 'Oil & filter', covers: ['oil'], cents: 8400, shop: 'Hilltop Garage & Alignment Center of South Burlington', icon: DropletsIcon, parts: [p('s14a', '0W-20 synthetic, 5 qt', 4200), p('s14b', 'Oil filter', 1100), p('s14c', 'Labor', 2600), p('s14d', 'Disposal fee', 500)]},
];

// V1 intervals, interval-list order (HealthStrip renders this order).
// oil: last #14 @45,000/141d → miles 1,900/5,000=38%, days 141/182=77%
// (Feb 10 → Jul 1 = 18+31+30+31+30+1 = 141) → SOON at 77, next 50,000.
// rotation: last #11 @40,600 → 6,300/7,500=84% SOON, next 48,100.
// brakeFluid: last #6 @22,000 → 24,900/30,000=83% SOON, next 52,000.
// coolant: never → 46,900/100,000=47% OK.
// airFilter: last #8 @30,200 → 16,700/15,000=111% OVERDUE (due 45,200).
// belt: never → miles 78%, time 2,573d/2,191d (84.5mo/72mo) = 117% →
// OVERDUE BY TIME since Jun 15, 2025 (days beat miles — the proof arc).
const V1_INTERVALS: IntervalDef[] = [
  {id: 'oil', name: 'Oil & filter', tag: 'oil', miles: 5000, days: 182, icon: DropletsIcon},
  {id: 'rotation', name: 'Tire rotation', tag: 'rotation', miles: 7500, days: null, icon: RouteIcon},
  {id: 'brakeFluid', name: 'Brake fluid', tag: 'brakeFluid', miles: 30000, days: null, icon: OctagonIcon},
  {id: 'coolant', name: 'Coolant', tag: 'coolant', miles: 100000, days: null, icon: DropletsIcon},
  {id: 'airFilter', name: 'Engine air filter', tag: 'airFilter', miles: 15000, days: null, icon: FanIcon},
  {id: 'belt', name: 'Serpentine belt', tag: 'belt', miles: 60000, days: 2191, icon: WrenchIcon, timeDueLabel: 'Jun 15, 2025'},
];

// V2 — 2022 Corvid Sprint: oil 4,250/5,000=85% SOON · rotation 57% OK ·
// airFilter never 18,450/20,000=92% SOON · coolant 18% OK → badge '0',
// strip 0 overdue / 2 soon / 2 ok. Lifetime 52+84+105 = $241.
const V2_SERVICES: ServiceRec[] = [
  {id: 't01', mile: 5100, dateLabel: 'Aug 8, 2023', year: 2023, daysAgo: 1058, title: 'Oil change', covers: ['oil'], cents: 5200, shop: 'Corvid Service Center', icon: DropletsIcon, parts: [p('t01a', 'Oil & filter kit', 3400), p('t01b', 'Labor', 1800)]},
  {id: 't02', mile: 10300, dateLabel: 'Sep 19, 2024', year: 2024, daysAgo: 650, title: 'Oil + rotation', covers: ['oil', 'rotation'], cents: 8400, shop: 'Corvid Service Center', icon: DropletsIcon, parts: [p('t02a', 'Oil & filter kit', 3600), p('t02b', 'Tire rotation', 2600), p('t02c', 'Labor', 2200)]},
  {id: 't03', mile: 14200, dateLabel: 'Feb 27, 2026', year: 2026, daysAgo: 124, title: 'Oil, rotation & cabin filter', covers: ['oil', 'rotation'], cents: 10500, shop: 'Corvid Service Center', icon: DropletsIcon, parts: [p('t03a', 'Oil & filter kit', 3600), p('t03b', 'Tire rotation', 2600), p('t03c', 'Cabin filter', 2400), p('t03d', 'Labor', 1900)]},
];

const V2_INTERVALS: IntervalDef[] = [
  {id: 'oil', name: 'Oil & filter', tag: 'oil', miles: 5000, days: null, icon: DropletsIcon},
  {id: 'rotation', name: 'Tire rotation', tag: 'rotation', miles: 7500, days: null, icon: RouteIcon},
  {id: 'airFilter', name: 'Engine air filter', tag: 'airFilter', miles: 20000, days: null, icon: FanIcon},
  {id: 'coolant', name: 'Coolant', tag: 'coolant', miles: 100000, days: null, icon: DropletsIcon},
];

const VEHICLES: VehicleRec[] = [
  {
    id: 'v1',
    name: '2019 Corvid Estate',
    chipShort: "'19 Estate",
    vinTail: '…8841',
    addedLabel: 'added Mar 2020',
    mileage: 46900,
    mileageAsOf: TODAY_LABEL,
    mileageLogged: 'Feb 10, 2026',
    // In service Jun 15, 2019 → Jul 1, 2026 = 2,573 days (belt time base).
    ageDays: 2573,
    railTop: 60000,
    railRestBottom: 36000,
    railFullBottom: 4000,
    services: V1_SERVICES,
    intervals: V1_INTERVALS,
  },
  {
    id: 'v2',
    name: '2022 Corvid Sprint',
    chipShort: "'22 Sprint",
    vinTail: '…3307',
    addedLabel: 'added May 2022',
    mileage: 18450,
    mileageAsOf: TODAY_LABEL,
    mileageLogged: 'Feb 27, 2026',
    ageDays: 1507, // May 15, 2022 → Jul 1, 2026
    railTop: 30000,
    railRestBottom: 4000,
    railFullBottom: 4000,
    services: V2_SERVICES,
    intervals: V2_INTERVALS,
  },
];

// Sheet type chips → covers tags.
const TYPE_CHIPS: Array<{id: string; label: string; covers: string[]; icon: LucideIcon}> = [
  {id: 'oil', label: 'Oil', covers: ['oil'], icon: DropletsIcon},
  {id: 'rotation', label: 'Rotation', covers: ['rotation'], icon: RouteIcon},
  {id: 'brakes', label: 'Brakes', covers: [], icon: OctagonIcon},
  {id: 'fluid', label: 'Fluid', covers: ['brakeFluid'], icon: DropletsIcon},
  {id: 'filter', label: 'Filter', covers: ['airFilter'], icon: FanIcon},
  {id: 'other', label: 'Other', covers: [], icon: WrenchIcon},
];

// ---------------------------------------------------------------------------
// FORMATTERS + DERIVATIONS — all pure; every surface derives from the one
// store (that is the law that makes commit-48,200 flip four surfaces).
// ---------------------------------------------------------------------------

function fmtMi(n: number): string {
  return n.toLocaleString('en-US');
}

function fmtUsd(cents: number): string {
  return \`$\${(cents / 100).toLocaleString('en-US')}\`;
}

type IntervalStatus = 'ok' | 'soon' | 'overdue';

interface IntervalState {
  def: IntervalDef;
  milesPct: number;
  timePct: number | null;
  pct: number;
  status: IntervalStatus;
  timeDrove: boolean;
  lastMile: number | null;
  lastLabel: string | null;
  dueMile: number;
  chip: string;
}

function anchorFor(services: ServiceRec[], tag: string): ServiceRec | null {
  let best: ServiceRec | null = null;
  for (const svc of services) {
    if (svc.deleted === true || !svc.covers.includes(tag)) continue;
    if (best == null || svc.mile > best.mile) best = svc;
  }
  return best;
}

/**
 * The status law, applied at an arbitrary mileage so the scrub, the commit,
 * and the delete cascade all share ONE derivation. Time pcts are frozen
 * (TODAY never moves), which is exactly the spec's scrub contract.
 */
function deriveInterval(vehicle: VehicleRec, def: IntervalDef, atMiles: number): IntervalState {
  const anchor = anchorFor(vehicle.services, def.tag);
  const lastMile = anchor?.mile ?? null;
  const baseMile = lastMile ?? 0;
  const milesPct = Math.round(((atMiles - baseMile) / def.miles) * 100);
  const daysAgo = anchor?.daysAgo ?? vehicle.ageDays;
  const timePct = def.days != null ? Math.round((daysAgo / def.days) * 100) : null;
  const pct = Math.max(milesPct, timePct ?? 0);
  const status: IntervalStatus = pct >= 100 ? 'overdue' : pct >= 75 ? 'soon' : 'ok';
  const timeDrove = timePct != null && timePct >= milesPct;
  const dueMile = baseMile + def.miles;
  let chip: string;
  if (status === 'overdue') {
    chip = timeDrove ? 'Overdue by time' : \`Overdue \${fmtMi(atMiles - dueMile)} mi\`;
  } else if (status === 'soon') {
    chip = timeDrove ? \`Due soon · \${pct}% time\` : \`Due in \${fmtMi(dueMile - atMiles)} mi\`;
  } else {
    chip = \`OK · \${pct}%\`;
  }
  return {
    def,
    milesPct,
    timePct,
    pct,
    status,
    timeDrove,
    lastMile,
    lastLabel: anchor != null ? \`\${fmtMi(anchor.mile)} mi · \${anchor.dateLabel}\` : null,
    dueMile,
    chip,
  };
}

function deriveAll(vehicle: VehicleRec, atMiles: number): IntervalState[] {
  return vehicle.intervals.map(def => deriveInterval(vehicle, def, atMiles));
}

function overdueCount(states: IntervalState[]): number {
  return states.filter(s => s.status === 'overdue').length;
}

/** Hypothetical due count for the DeltaPill scrub table. */
function dueCountAt(vehicle: VehicleRec, hypoMiles: number): number {
  return deriveAll(vehicle, hypoMiles).filter(s => s.pct >= 100).length;
}

const STATUS_COLOR: Record<IntervalStatus, string> = {
  ok: STATUS_OK,
  soon: STATUS_SOON,
  overdue: STATUS_OVERDUE,
};

/** Live (non-deleted) services, mile-descending; ties keep fixture order. */
function liveServices(vehicle: VehicleRec): ServiceRec[] {
  return vehicle.services.filter(s => s.deleted !== true);
}

function sumCents(services: ServiceRec[]): number {
  return services.reduce((acc, s) => acc + s.cents, 0);
}

/** Year groups for History, newest year first; sums derive live. */
function yearGroups(services: ServiceRec[]): Array<{year: number; cents: number; rows: ServiceRec[]}> {
  const byYear = new Map<number, ServiceRec[]>();
  for (const svc of services) {
    const list = byYear.get(svc.year) ?? [];
    list.push(svc);
    byYear.set(svc.year, list);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, rows]) => ({
      year,
      cents: sumCents(rows),
      rows: [...rows].sort((a, b) => b.mile - a.mile),
    }));
}

/** First-service-of-year mile → year callout ticks on the rail. */
function yearCallouts(services: ServiceRec[], minMile: number): Array<{year: number; mile: number}> {
  const firstByYear = new Map<number, number>();
  for (const svc of services) {
    const prev = firstByYear.get(svc.year);
    if (prev == null || svc.mile < prev) firstByYear.set(svc.year, svc.mile);
  }
  return [...firstByYear.entries()]
    .filter(([, mile]) => mile >= minMile)
    .sort((a, b) => b[1] - a[1])
    .map(([year, mile]) => ({year, mile}));
}

/** Open-receipt height: 72 closed + 6 tear + 44/part + 36 subtotal. */
function receiptHeight(svc: ServiceRec, open: boolean): number {
  return open ? 72 + 6 + svc.parts.length * 44 + 36 : 72;
}

// ---------------------------------------------------------------------------
// HOOKS — container width (the desktop stage is ~1045px inside a 1440px
// window; only a ResizeObserver can tell the stages apart).
// ---------------------------------------------------------------------------

function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) return undefined;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) setWidth(rect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])');
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
// LUGNUT MARK — hex nut whose six facets read as clock ticks, stubby wrench
// hand frozen at 5 o'clock. Strokes --color-text-primary (NOT --color-text,
// which does not exist); wrench accent BRAND_ACCENT.
// ---------------------------------------------------------------------------

function LugnutMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        {/* Hex nut outline */}
        <path
          d="M14 2.8 23.7 8.4v11.2L14 25.2 4.3 19.6V8.4Z"
          stroke="var(--color-text-primary)"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        {/* Six facet ticks at clock positions */}
        <g stroke="var(--color-text-primary)" strokeWidth={1.4} strokeLinecap="round">
          <path d="M14 5.4v2.2" />
          <path d="M21.2 9.6l-1.9 1.1" />
          <path d="M21.2 18.4l-1.9-1.1" />
          <path d="M14 22.6v-2.2" />
          <path d="M6.8 18.4l1.9-1.1" />
          <path d="M6.8 9.6l1.9 1.1" />
        </g>
        {/* Stubby wrench hand frozen at 5 o'clock */}
        <g stroke={BRAND_ACCENT} strokeWidth={2} strokeLinecap="round">
          <path d="M14 14l2.6 3.4" />
          <path d="M16.6 17.4l1.3-.4.5 1.5-1.2.9Z" fill={BRAND_ACCENT} strokeWidth={1} />
        </g>
        <circle cx={14} cy={14} r={1.6} fill="var(--color-text-primary)" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SERVICE INTERVAL ARC — 48px SVG, two concentric 270° arcs racing to the
// 100% notch: outer r=20 = miles consumed, inner r=14 = days consumed
// (omitted for miles-only intervals). Sweep caps at 112% of track (302.4°)
// so belt's 117% visibly crosses the notch without leaving the 48px box
// (stress 2). Track uses TRACK_REST (≥3:1 amendment) — deviation from the
// spec's muted-token track, math at the const. Inner arc = same status hue
// at full opacity, outer at the hue too — both strokes are the status pair,
// each ≥4.5:1 vs card (see STATUS_* declarations), distinguishable by
// radius + width at 48px (stress 3).
// ---------------------------------------------------------------------------

// Short display names for rail markers ('Oil due · 50,000 mi',
// 'Air filter due 45,200 · 1,700 mi ago').
const SHORT_NAME: Record<string, string> = {
  oil: 'Oil',
  rotation: 'Rotation',
  brakeFluid: 'Brake fluid',
  coolant: 'Coolant',
  airFilter: 'Air filter',
  belt: 'Belt',
};

const ARC_START = -135;
const ARC_SWEEP_MAX = 270 * 1.12; // 302.4° — the overshoot cap

function arcPolar(r: number, deg: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: 24 + r * Math.sin(rad), y: 24 - r * Math.cos(rad)};
}

function arcPathFor(r: number, pct: number): string {
  const sweep = Math.min((pct / 100) * 270, ARC_SWEEP_MAX);
  if (sweep <= 0) return '';
  const from = arcPolar(r, ARC_START);
  const to = arcPolar(r, ARC_START + sweep);
  const large = sweep > 180 ? 1 : 0;
  return \`M \${from.x.toFixed(2)} \${from.y.toFixed(2)} A \${r} \${r} 0 \${large} 1 \${to.x.toFixed(2)} \${to.y.toFixed(2)}\`;
}

interface ServiceIntervalArcProps {
  state: IntervalState;
}

function ServiceIntervalArc({state}: ServiceIntervalArcProps) {
  const hue = STATUS_COLOR[state.status];
  const statusPhrase =
    state.status === 'overdue' ? 'overdue' : state.status === 'soon' ? 'due soon' : 'ok';
  const label =
    state.timePct != null
      ? \`\${state.def.name}: \${state.milesPct}% of miles, \${state.timePct}% of time — \${statusPhrase}\`
      : \`\${state.def.name}: \${state.milesPct}% of miles — \${statusPhrase}\`;
  // 100% notch tick across the outer track at +135°.
  const notchFrom = arcPolar(16, 135);
  const notchTo = arcPolar(23, 135);
  return (
    <span role="img" aria-label={label} style={{width: 48, height: 48, position: 'relative', flexShrink: 0, display: 'grid', placeItems: 'center'}}>
      <svg width={48} height={48} viewBox="0 0 48 48" fill="none" aria-hidden style={{position: 'absolute', inset: 0}}>
        <path d={arcPathFor(20, 100)} stroke={TRACK_REST} strokeOpacity={0.45} strokeWidth={4} strokeLinecap="round" />
        {state.timePct != null ? (
          <path d={arcPathFor(14, 100)} stroke={TRACK_REST} strokeOpacity={0.45} strokeWidth={3} strokeLinecap="round" />
        ) : null}
        <line x1={notchFrom.x} y1={notchFrom.y} x2={notchTo.x} y2={notchTo.y} stroke={TRACK_REST} strokeWidth={2} />
        {state.milesPct > 0 ? (
          <path d={arcPathFor(20, state.milesPct)} stroke={hue} strokeWidth={4} strokeLinecap="round" />
        ) : null}
        {state.timePct != null && state.timePct > 0 ? (
          <path d={arcPathFor(14, state.timePct)} stroke={hue} strokeWidth={3} strokeLinecap="round" />
        ) : null}
      </svg>
      <span style={{fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: hue}}>
        {state.pct}%
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// HEALTH STRIP — N equal segments in interval-list order, 8px/999, 2px
// gaps; segment fills are the STATUS pairs (each ≥3:1 vs the card — see
// declarations); aria-label carries the legend text.
// ---------------------------------------------------------------------------

interface HealthStripProps {
  states: IntervalState[];
}

function HealthStrip({states}: HealthStripProps) {
  const o = states.filter(s => s.status === 'overdue').length;
  const s = states.filter(s2 => s2.status === 'soon').length;
  const k = states.filter(s2 => s2.status === 'ok').length;
  const legend = \`\${o} overdue · \${s} soon · \${k} ok\`;
  return (
    <div>
      <div style={styles.healthStrip} role="img" aria-label={legend}>
        {states.map(st => (
          <span key={st.def.id} style={{...styles.healthSeg, background: STATUS_COLOR[st.status]}} />
        ))}
      </div>
      <div style={{...styles.healthLegend, marginTop: 8}}>{legend}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RECEIPT STUB ROW — 72px logged-service row that tears open inline: the
// perforated edge splits and exploded parts rows (44px) plus a running
// subtotal ('4 parts · $84') render IN the tear. The whole closed row is
// ONE button with aria-expanded, named by its primary text. s14's shop
// name is the 320px ellipsis stressor beside the never-wrapping '$84'.
// ---------------------------------------------------------------------------

interface ReceiptStubRowProps {
  svc: ServiceRec;
  open: boolean;
  onToggle: (id: string) => void;
}

function ReceiptStubRow({svc, open, onToggle}: ReceiptStubRowProps) {
  const RowIcon = svc.icon;
  return (
    <div>
      <button
        type="button"
        className="lgn-btn lgn-focusable"
        style={styles.row72}
        aria-expanded={open}
        aria-label={\`\${svc.title}, \${fmtUsd(svc.cents)}\`}
        onClick={() => onToggle(svc.id)}>
        <span style={styles.iconTile} aria-hidden>
          <Icon icon={RowIcon} size="sm" />
        </span>
        <span style={styles.rowText}>
          <span style={styles.rowPrimary}>{svc.title}</span>
          <span style={styles.rowSecondary}>
            {fmtMi(svc.mile)} mi · {svc.dateLabel} · {svc.shop}
          </span>
        </span>
        <span style={styles.rowAmount}>{fmtUsd(svc.cents)}</span>
        <span style={{...styles.rowChevron, transform: open ? 'rotate(90deg)' : 'none'}} aria-hidden>
          <Icon icon={ChevronRightIcon} size="sm" />
        </span>
      </button>
      {open ? (
        <div>
          <div style={styles.tearEdge} aria-hidden />
          {svc.parts.map(part => (
            <div key={part.id} style={styles.partRow}>
              <span style={styles.partLabel}>{part.label}</span>
              <span style={styles.partPrice}>{fmtUsd(part.cents)}</span>
            </div>
          ))}
          <div style={styles.tearSubtotal}>
            <span>
              {svc.parts.length} {svc.parts.length === 1 ? 'part' : 'parts'} · {fmtUsd(svc.cents)}
            </span>
            <span>{fmtUsd(svc.parts.reduce((a, x) => a + x.cents, 0))}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ODOMETER RULER — the signature surface. One absolute canvas at
// y(mi) = (topMile − mi) × 0.06; ticks, year callouts, dashed future rail,
// interval markers, past ReceiptStubRow event cards (dog-legged to their
// exact tick, pushed down to keep ≥72px separation — same-mile services
// stack and share one leader, stress 4), the brand current-mileage line,
// and the draggable/keyboard rulerThumb. Load-more appends strictly BELOW
// the press point, so scrollTop is inherently stable (stress 5); focus
// moves to the first new card.
// ---------------------------------------------------------------------------

interface RulerLayoutItem {
  svc: ServiceRec;
  tickY: number;
  top: number;
  height: number;
  drawLeader: boolean;
}

function layoutRuler(
  services: ServiceRec[],
  topMile: number,
  openIds: string[],
): RulerLayoutItem[] {
  const items: RulerLayoutItem[] = [];
  let prevBottom = -Infinity;
  let prevMile: number | null = null;
  for (const svc of services) {
    const tickY = (topMile - svc.mile) * PX_PER_MI;
    const desired = tickY + 6;
    const top = Math.max(desired, prevBottom + 12);
    const height = receiptHeight(svc, openIds.includes(svc.id));
    items.push({svc, tickY, top, height, drawLeader: svc.mile !== prevMile});
    prevBottom = top + height;
    prevMile = svc.mile;
  }
  return items;
}

interface OdometerRulerProps {
  vehicle: VehicleRec;
  expanded: boolean;
  openReceiptIds: string[];
  hypoMiles: number | null;
  states: IntervalState[];
  onToggleReceipt: (id: string) => void;
  onLoadMore: () => void;
  onScrub: (miles: number | null, release: boolean) => void;
  onCommitViaSheet: (prefill: number) => void;
}

function OdometerRuler({
  vehicle,
  expanded,
  openReceiptIds,
  hypoMiles,
  states,
  onToggleReceipt,
  onLoadMore,
  onScrub,
  onCommitViaSheet,
}: OdometerRulerProps) {
  const topMile = vehicle.railTop;
  const bottomMile = expanded ? vehicle.railFullBottom : vehicle.railRestBottom;
  const baseHeight = (topMile - bottomMile) * PX_PER_MI;
  const y = (mi: number) => (topMile - mi) * PX_PER_MI;
  const actualY = y(vehicle.mileage);
  const displayMiles = hypoMiles ?? vehicle.mileage;
  const displayY = y(displayMiles);
  const scrubbing = hypoMiles != null;

  const visible = liveServices(vehicle)
    .filter(svc => svc.mile >= bottomMile)
    .sort((a, b) => b.mile - a.mile);
  const items = layoutRuler(visible, topMile, openReceiptIds);
  const lastBottom = items.length > 0 ? items[items.length - 1].top + items[items.length - 1].height : baseHeight;
  const canvasHeight = Math.max(baseHeight, lastBottom + 16);

  const hiddenCount = liveServices(vehicle).length - visible.length;
  const lifetime = sumCents(liveServices(vehicle));

  // Major ticks every 2,000 mi (120px), minors every 500 (30px).
  const majors: number[] = [];
  for (let mi = topMile; mi >= bottomMile; mi -= 2000) majors.push(mi);
  const minors: number[] = [];
  for (let mi = topMile - 500; mi > bottomMile; mi -= 500) {
    if (mi % 2000 !== 0) minors.push(mi);
  }
  const callouts = yearCallouts(visible, bottomMile);

  // Drag scrub — transient pointer values live in refs (no re-render churn);
  // 1px = 16.67 mi, snapped to 100, clamped [actual, railTop].
  const dragRef = useRef<{startY: number; startMiles: number} | null>(null);
  const clampSnap = useCallback(
    (mi: number) => Math.min(topMile, Math.max(vehicle.mileage, Math.round(mi / 100) * 100)),
    [topMile, vehicle.mileage],
  );
  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {startY: event.clientY, startMiles: displayMiles};
    onScrub(clampSnap(displayMiles), false);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag == null) return;
    // Drag UP (negative clientY delta) drives forward.
    const next = drag.startMiles + (drag.startY - event.clientY) * MI_PER_PX;
    onScrub(clampSnap(next), false);
  };
  const handlePointerUp = () => {
    if (dragRef.current == null) return;
    dragRef.current = null;
    onScrub(null, true);
  };
  const handleThumbKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const cur = displayMiles;
    let next: number | null = null;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') next = cur + 100;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') next = cur - 100;
    else if (event.key === 'PageUp') next = cur + 1000;
    else if (event.key === 'PageDown') next = cur - 1000;
    else if (event.key === 'Home') next = vehicle.mileage;
    else if (event.key === 'End') next = topMile;
    else if (event.key === 'Enter') {
      event.preventDefault();
      onCommitViaSheet(displayMiles);
      return;
    } else if (event.key === 'Escape' && scrubbing) {
      event.preventDefault();
      onScrub(null, false);
      return;
    } else {
      return;
    }
    event.preventDefault();
    onScrub(clampSnap(next), false);
  };

  const dueNow = dueCountAt(vehicle, displayMiles);
  const pillText = \`at \${fmtMi(displayMiles)} mi: \${dueNow} \${dueNow === 1 ? 'item' : 'items'} due\`;

  // Interval markers: belt-style (overdue by TIME) pins AT the current
  // line; the rest pin at their due mile when it fits the rail. Past-due
  // markers read STATUS_OVERDUE; future beads use TRACK_REST (≥3:1).
  const markers = states
    .filter(st => !(st.status === 'overdue' && st.timeDrove))
    .filter(st => st.dueMile <= topMile)
    .map(st => {
      const pastDue = st.dueMile < vehicle.mileage;
      return {
        id: st.def.id,
        markerY: y(st.dueMile),
        color: pastDue ? STATUS_OVERDUE : 'var(--color-text-secondary)',
        beadColor: pastDue ? STATUS_OVERDUE : TRACK_REST,
        text: pastDue
          ? \`\${SHORT_NAME[st.def.id] ?? st.def.name} due \${fmtMi(st.dueMile)} · \${fmtMi(vehicle.mileage - st.dueMile)} mi ago\`
          : \`\${SHORT_NAME[st.def.id] ?? st.def.name} due · \${fmtMi(st.dueMile)} mi\`,
      };
    });
  const timeOverdue = states.filter(st => st.status === 'overdue' && st.timeDrove);

  return (
    <section aria-label="Odometer timeline">
      <h2 className="lgn-vh">Odometer timeline</h2>
      <div style={{...styles.ruler, height: canvasHeight}}>
        {/* Rails — dashed future above the ACTUAL mileage line, solid past
            below it (scrubbed miles are hypothetical, not yet driven). */}
        <div style={{...styles.railFuture, top: 0, height: actualY}} aria-hidden />
        <div style={{...styles.railPast, top: actualY, height: canvasHeight - actualY}} aria-hidden />
        {majors.map(mi => (
          <div key={\`M\${mi}\`} aria-hidden>
            <div style={{...styles.tickMajor, top: y(mi)}} />
            <div style={{...styles.tickLabel, top: y(mi)}}>{mi / 1000}k</div>
          </div>
        ))}
        {minors.map(mi => (
          <div key={\`m\${mi}\`} style={{...styles.tickMinor, top: y(mi)}} aria-hidden />
        ))}
        {callouts.map(c => (
          <div key={\`y\${c.year}\`} style={{...styles.yearCallout, top: y(c.mile) + 16}} aria-hidden>
            {c.year}
          </div>
        ))}
        {markers.map(mk => (
          <div key={mk.id} aria-hidden>
            <span style={{...styles.markerBead, top: mk.markerY, borderColor: mk.beadColor}} />
            <span style={{...styles.markerLabel, top: mk.markerY, color: mk.color}}>{mk.text}</span>
          </div>
        ))}
        {/* Overdue-by-time (belt) pins AT the current-mileage line. */}
        {timeOverdue.map(st => (
          <span
            key={st.def.id}
            style={{...styles.markerLabel, top: actualY - 16, color: STATUS_OVERDUE}}
            aria-hidden>
            <Icon icon={ClockIcon} size="xsm" />
            {SHORT_NAME[st.def.id] ?? st.def.name} overdue by time — due {st.def.timeDueLabel}
          </span>
        ))}
        {/* Event cards + dogleg leaders to their exact mile tick. */}
        {items.map(item => (
          <div key={item.svc.id}>
            {item.drawLeader ? (
              <div aria-hidden>
                <div style={{...styles.leaderH, top: item.tickY, left: 66, width: 22}} />
                <div
                  style={{
                    ...styles.leaderV,
                    left: 88,
                    top: Math.min(item.tickY, item.top + 36),
                    height: Math.abs(item.top + 36 - item.tickY),
                  }}
                />
                <div style={{...styles.leaderH, top: item.top + 36, left: 88, width: 8}} />
              </div>
            ) : null}
            <div style={{...styles.eventCard, top: item.top}} data-ruler-card={item.svc.id}>
              <ReceiptStubRow
                svc={item.svc}
                open={openReceiptIds.includes(item.svc.id)}
                onToggle={onToggleReceipt}
              />
            </div>
          </div>
        ))}
        {/* Current-mileage marker + thumb (44×44 hit, 44×28 visual pill). */}
        <div className={scrubbing ? undefined : 'lgn-anim'} style={{...styles.currentLine, top: displayY - 1}} aria-hidden />
        {scrubbing ? (
          <div style={{...styles.deltaPillWrap, top: displayY - 52}} aria-hidden>
            <span style={styles.deltaPill}>{pillText}</span>
          </div>
        ) : null}
        <button
          type="button"
          className={\`lgn-btn lgn-focusable\${scrubbing ? '' : ' lgn-anim'}\`}
          style={{...styles.rulerThumb, top: displayY}}
          role="slider"
          aria-label="Hypothetical odometer"
          aria-valuemin={vehicle.mileage}
          aria-valuemax={topMile}
          aria-valuenow={displayMiles}
          aria-valuetext={
            scrubbing ? \`Hypothetical \${fmtMi(displayMiles)} miles\` : \`Actual \${fmtMi(displayMiles)} miles\`
          }
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleThumbKey}
          onBlur={() => {
            if (scrubbing && dragRef.current == null) onScrub(null, false);
          }}>
          <span style={styles.rulerThumbPill}>
            <Icon icon={GripHorizontalIcon} size="xsm" />
          </span>
        </button>
      </div>
      {hiddenCount > 0 ? (
        <button type="button" className="lgn-btn lgn-focusable" style={styles.loadMoreRow} onClick={onLoadMore}>
          Show {hiddenCount} earlier services
        </button>
      ) : (
        <div style={styles.terminalCaption}>
          All {liveServices(vehicle).length} services · {fmtUsd(lifetime)} lifetime
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// SKELETONS — 4 rows at exact 72px geometry, deterministic widths
// (primary 60/45/70/60, secondary 40/55/30/40 — never random), ONE shared
// shimmer sweep removed entirely under reduced motion; container aria-busy,
// blocks aria-hidden, 'Loading' announced once via the toast dock.
// ---------------------------------------------------------------------------

const SKELETON_WIDTHS: Array<[number, number]> = [
  [60, 40],
  [45, 55],
  [70, 30],
  [60, 40],
];

function SkeletonCard() {
  return (
    <div style={{...styles.listCard, ...styles.shimmerHost}} aria-busy="true">
      {SKELETON_WIDTHS.map(([w1, w2], i) => (
        <div key={w1 * 100 + w2 + i}>
          {i > 0 ? <div style={styles.rowDividerDeep} /> : null}
          <div style={styles.skeletonRow} aria-hidden>
            <span style={styles.skelThumb} />
            <span style={styles.skelLines}>
              <span style={{...styles.skelBar, width: \`\${w1}%\`}} />
              <span style={{...styles.skelBar, width: \`\${w2}%\`}} />
            </span>
          </div>
        </div>
      ))}
      <div className="lgn-shimmer" style={styles.shimmerSweep} aria-hidden />
    </div>
  );
}

// ---------------------------------------------------------------------------
// LOG SERVICE SHEET — two detents (55% / calc(100% − 56px)); mode 'log'
// (type chip-grid, mileage stepper+field, cost, shop; LARGE detent reveals
// parts line-items + notes) and mode 'mileage' (stepper step 100 + numeric
// field, sticky brand footer). Blur validation per the inputControls
// contract; focus({preventScroll: true}) on open per the amendment.
// ---------------------------------------------------------------------------

interface SheetRequest {
  mode: 'log' | 'mileage';
  prefillMiles?: number;
  prefillTypeId?: string;
  editId?: string;
  seq: number;
}

interface LogServiceSheetProps {
  request: SheetRequest;
  vehicle: VehicleRec;
  detent: 'medium' | 'large';
  onToggleDetent: () => void;
  onClose: () => void;
  onCommitMileage: (miles: number) => void;
  onCommitService: (draft: {
    editId: string | null;
    typeId: string;
    mile: number;
    cents: number;
    shop: string;
  }) => void;
}

function LogServiceSheet({
  request,
  vehicle,
  detent,
  onToggleDetent,
  onClose,
  onCommitMileage,
  onCommitService,
}: LogServiceSheetProps) {
  const isMileage = request.mode === 'mileage';
  const editSvc = request.editId != null ? vehicle.services.find(s => s.id === request.editId) ?? null : null;
  const [typeId, setTypeId] = useState(() => {
    if (request.prefillTypeId != null) return request.prefillTypeId;
    if (editSvc == null) return 'oil';
    const hit = TYPE_CHIPS.find(chip => chip.covers.join() === editSvc.covers.join());
    return hit?.id ?? 'other';
  });
  const [miles, setMiles] = useState(() =>
    isMileage ? request.prefillMiles ?? vehicle.mileage : editSvc?.mile ?? vehicle.mileage,
  );
  const [milesText, setMilesText] = useState(() => String(isMileage ? request.prefillMiles ?? vehicle.mileage : editSvc?.mile ?? vehicle.mileage));
  const [milesError, setMilesError] = useState<string | null>(null);
  const [costText, setCostText] = useState(() => (editSvc != null ? String(editSvc.cents / 100) : ''));
  const [shop, setShop] = useState(() => editSvc?.shop ?? '');
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLButtonElement | null>(null);

  // Focus into the opening sheet with preventScroll (amendment: plain
  // .focus() scroll-reveals the animating sheet and beaches it mid-screen).
  useEffect(() => {
    firstFieldRef.current?.focus({preventScroll: true});
  }, []);

  const minMiles = isMileage ? vehicle.mileage : 0;
  const syncMiles = (next: number) => {
    setMiles(next);
    setMilesText(String(next));
    if (next >= minMiles) setMilesError(null);
  };
  const validateMiles = (): boolean => {
    const parsed = Number(milesText.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(parsed) || parsed < minMiles) {
      setMilesError(\`Enter \${fmtMi(minMiles)} or more\`);
      return false;
    }
    setMiles(parsed);
    return true;
  };

  const commit = () => {
    if (!validateMiles()) return;
    const parsed = Number(milesText.replace(/[^0-9]/g, ''));
    if (isMileage) {
      onCommitMileage(parsed);
      return;
    }
    const cents = Math.round(Number(costText.replace(/[^0-9.]/g, '') || '0') * 100);
    onCommitService({editId: request.editId ?? null, typeId, mile: parsed, cents, shop});
  };

  const title = isMileage ? 'Update mileage' : editSvc != null ? 'Edit service' : 'Log service';
  const confirmLabel = isMileage
    ? \`Update to \${fmtMi(Number(milesText.replace(/[^0-9]/g, '')) || miles)} mi\`
    : editSvc != null
      ? 'Save changes'
      : 'Log service';

  return (
    <>
      <div style={styles.sheetScrim} onClick={onClose} aria-hidden />
      <div
        ref={sheetRef}
        className="lgn-sheet-in"
        style={{...styles.sheet, height: detent === 'medium' ? '55%' : 'calc(100% - 56px)'}}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
          }
          trapTabKey(event, sheetRef.current);
        }}>
        <div style={styles.sheetGrabberZone}>
          <button
            ref={firstFieldRef}
            type="button"
            className="lgn-btn lgn-focusable"
            aria-label="Resize sheet"
            style={{width: '100%', height: 24, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 8}}
            onClick={onToggleDetent}>
            <span style={styles.sheetGrabber} />
          </button>
        </div>
        <div style={styles.sheetHeader}>
          <span />
          <h2 style={styles.sheetTitle}>{title}</h2>
          <button type="button" className="lgn-btn lgn-focusable" style={styles.iconBtn} aria-label="Close" onClick={onClose}>
            <Icon icon={XIcon} size="sm" />
          </button>
        </div>
        <div style={styles.sheetBody}>
          {!isMileage ? (
            <div role="radiogroup" aria-label="Service type" style={styles.chipGrid}>
              {TYPE_CHIPS.map(chip => {
                const on = chip.id === typeId;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className="lgn-btn lgn-focusable"
                    style={{...styles.typeChip, ...(on ? styles.typeChipOn : null)}}
                    onClick={() => setTypeId(chip.id)}>
                    {chip.label}
                  </button>
                );
              })}
            </div>
          ) : null}
          <div style={styles.formField}>
            <label style={styles.formLabel} htmlFor="lgn-miles">
              {isMileage ? 'New odometer reading' : 'Mileage at service'}
            </label>
            <div style={styles.stepperRow}>
              <div style={styles.stepper}>
                <button
                  type="button"
                  className="lgn-btn lgn-focusable"
                  style={styles.stepperHalf}
                  aria-label="Decrease mileage"
                  disabled={miles - 100 < minMiles}
                  onClick={() => syncMiles(Math.max(minMiles, miles - 100))}>
                  <Icon icon={MinusIcon} size="xsm" />
                </button>
                <span style={styles.stepperRule} />
                <button
                  type="button"
                  className="lgn-btn lgn-focusable"
                  style={styles.stepperHalf}
                  aria-label="Increase mileage"
                  onClick={() => syncMiles(miles + 100)}>
                  <Icon icon={PlusIcon} size="xsm" />
                </button>
              </div>
              <input
                id="lgn-miles"
                className="lgn-focusable"
                style={{...styles.formInput, flex: 1, ...(milesError != null ? {boxShadow: 'inset 0 0 0 2px var(--color-error)'} : null)}}
                inputMode="numeric"
                value={milesText}
                aria-invalid={milesError != null}
                aria-describedby={milesError != null ? 'lgn-miles-err' : undefined}
                onChange={event => {
                  setMilesText(event.target.value);
                  const parsed = Number(event.target.value.replace(/[^0-9]/g, ''));
                  if (Number.isFinite(parsed) && parsed >= minMiles) {
                    setMiles(parsed);
                    setMilesError(null); // reward the fix immediately
                  }
                }}
                onBlur={validateMiles}
              />
            </div>
            {milesError != null ? (
              <span id="lgn-miles-err" style={styles.fieldError}>
                <Icon icon={AlertCircleIcon} size="xsm" />
                {milesError}
              </span>
            ) : null}
          </div>
          {!isMileage ? (
            <>
              <div style={styles.formField}>
                <label style={styles.formLabel} htmlFor="lgn-cost">
                  Cost
                </label>
                <input
                  id="lgn-cost"
                  className="lgn-focusable"
                  style={styles.formInput}
                  inputMode="decimal"
                  placeholder="0.00"
                  value={costText}
                  onChange={event => setCostText(event.target.value)}
                />
              </div>
              <div style={styles.formField}>
                <label style={styles.formLabel} htmlFor="lgn-shop">
                  Shop
                </label>
                <input
                  id="lgn-shop"
                  className="lgn-focusable"
                  style={styles.formInput}
                  value={shop}
                  onChange={event => setShop(event.target.value)}
                />
              </div>
              {detent === 'large' ? (
                <div style={styles.formField}>
                  <label style={styles.formLabel} htmlFor="lgn-notes">
                    Notes
                  </label>
                  <input
                    id="lgn-notes"
                    className="lgn-focusable"
                    style={styles.formInput}
                    placeholder="Parts, line items, reminders…"
                  />
                </div>
              ) : (
                <div style={{...styles.formLabel, marginTop: 16}}>
                  Resize the sheet for parts line items and notes.
                </div>
              )}
            </>
          ) : (
            <div style={{...styles.formLabel, marginTop: 16}}>
              Scrub the timeline thumb or step by 100 mi. Committing re-derives every
              interval, chip, and marker from this one value.
            </div>
          )}
        </div>
        <div style={styles.sheetFooter}>
          <button type="button" className="lgn-btn lgn-focusable" style={styles.confirmBtn} onClick={commit}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// HISTORY ROW — swipe-to-reveal Delete (snap −72px, one open at a time,
// pointer drag with the MANDATORY trailing 44×44 ellipsis fallback opening
// the same actions as an anchored menu: Edit, then Delete destructive-last).
// Delete obeys undoOverConfirm: executes immediately, sums recompute live,
// Undo restores the exact position (the row keeps its slot in the fixture
// array; only the deleted flag flips).
// ---------------------------------------------------------------------------

interface HistoryRowProps {
  svc: ServiceRec;
  open: boolean;
  swipeOpen: boolean;
  menuOpen: boolean;
  isLast: boolean;
  onToggleReceipt: (id: string) => void;
  onSwipe: (id: string | null) => void;
  onMenu: (id: string | null) => void;
  onEdit: (id: string, opener: HTMLElement) => void;
  onDelete: (id: string) => void;
}

function HistoryRow({
  svc,
  open,
  swipeOpen,
  menuOpen,
  isLast,
  onToggleReceipt,
  onSwipe,
  onMenu,
  onEdit,
  onDelete,
}: HistoryRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const dragRef = useRef<{startX: number; startDx: number; moved: boolean} | null>(null);
  const suppressClickRef = useRef(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const ellipsisRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (menuOpen) {
      menuRef.current?.querySelector<HTMLElement>('button')?.focus({preventScroll: true});
    }
  }, [menuOpen]);

  const offset = dragX ?? (swipeOpen ? -72 : 0);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {startX: event.clientX, startDx: swipeOpen ? -72 : 0, moved: false};
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag == null) return;
    const dx = Math.min(0, Math.max(-72, drag.startDx + (event.clientX - drag.startX)));
    if (Math.abs(dx - drag.startDx) > 8) {
      drag.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (drag.moved) setDragX(dx);
  };
  const handlePointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag == null) return;
    if (drag.moved) {
      suppressClickRef.current = true;
      onSwipe((dragX ?? 0) < -36 ? svc.id : null);
    }
    setDragX(null);
  };

  return (
    <div style={{position: 'relative'}}>
      <div style={styles.swipeOuter}>
        <button
          type="button"
          className="lgn-btn lgn-focusable"
          style={styles.swipeAction}
          tabIndex={swipeOpen ? 0 : -1}
          aria-hidden={!swipeOpen}
          onClick={() => onDelete(svc.id)}>
          <Icon icon={Trash2Icon} size="sm" />
          Delete
        </button>
        <div
          className={dragX == null ? 'lgn-anim' : undefined}
          style={{...styles.swipeContent, transform: \`translateX(\${offset}px)\`}}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClickCapture={event => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              event.preventDefault();
              event.stopPropagation();
            } else if (swipeOpen) {
              // Tap elsewhere closes the open swipe row.
              event.preventDefault();
              event.stopPropagation();
              onSwipe(null);
            }
          }}>
          <div style={{flex: 1, minWidth: 0}}>
            <ReceiptStubRow svc={svc} open={open} onToggle={onToggleReceipt} />
          </div>
          <button
            ref={ellipsisRef}
            type="button"
            className="lgn-btn lgn-focusable"
            style={{...styles.iconBtn, alignSelf: 'flex-start', marginTop: 14}}
            aria-label={\`Actions for \${svc.title}\`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => onMenu(menuOpen ? null : svc.id)}>
            <Icon icon={MoreHorizontalIcon} size="sm" />
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Actions for \${svc.title}\`}
          style={{...styles.anchoredMenu, right: 8, ...(isLast ? {bottom: 64} : {top: 60})}}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              onMenu(null);
              ellipsisRef.current?.focus({preventScroll: true});
            }
          }}>
          <button
            type="button"
            role="menuitem"
            className="lgn-btn lgn-focusable"
            style={styles.menuRow}
            onClick={event => onEdit(svc.id, event.currentTarget)}>
            <Icon icon={PencilIcon} size="sm" />
            <span style={styles.menuRowText}>Edit</span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            role="menuitem"
            className="lgn-btn lgn-focusable"
            style={{...styles.menuRow, color: 'var(--color-error)'}}
            onClick={() => onDelete(svc.id)}>
            <Icon icon={Trash2Icon} size="sm" />
            <span style={styles.menuRowText}>Delete</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// VEHICLE SWITCHER MENU — anchored under the vehicleChip; selecting swaps
// store.activeVehicleId, closes, and focus restores to the chip.
// ---------------------------------------------------------------------------

interface VehicleSwitcherMenuProps {
  vehicles: VehicleRec[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

function VehicleSwitcherMenu({vehicles, activeId, onSelect, onClose}: VehicleSwitcherMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>('button')?.focus({preventScroll: true});
  }, []);
  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Switch vehicle"
      style={{...styles.anchoredMenu, top: 50, right: 16}}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}>
      {vehicles.map((veh, index) => (
        <div key={veh.id}>
          {index > 0 ? <div style={styles.rowDivider} /> : null}
          <button
            type="button"
            role="menuitemradio"
            aria-checked={veh.id === activeId}
            className="lgn-btn lgn-focusable"
            style={styles.menuRow}
            onClick={() => onSelect(veh.id)}>
            <span style={styles.menuCheck}>
              {veh.id === activeId ? <Icon icon={CheckIcon} size="sm" /> : null}
            </span>
            <span style={{...styles.menuRowText, fontVariantNumeric: 'tabular-nums'}}>
              {veh.name} · {fmtMi(veh.mileage)} mi
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// APP — ONE state owner (\`store\`): mutations only via updateVehicle(id,
// patch) + updateUi(patch). Committing a mileage flips the Due badge, the
// Due sort, the timeline marker + 48,100 flag, and the HealthStrip from the
// single vehicles.v1.mileage value; deleting #11 recomputes 2025 → $271,
// lifetime → $1,475, and re-anchors rotation to 20,300 (355%, arc caps,
// 'Overdue 19,100 mi'); Undo restores all of it exactly.
// ---------------------------------------------------------------------------

type TabId = 'timeline' | 'due' | 'history' | 'garage';
type DueSegment = 'all' | 'overdue' | 'upcoming';

const TABS: Array<{id: TabId; label: string; icon: LucideIcon}> = [
  {id: 'timeline', label: 'Timeline', icon: RouteIcon},
  {id: 'due', label: 'Due', icon: BellRingIcon},
  {id: 'history', label: 'History', icon: ReceiptIcon},
  {id: 'garage', label: 'Garage', icon: WarehouseIcon},
];

const TAB_TITLE: Record<TabId, string> = {
  timeline: 'Timeline',
  due: 'Due',
  history: 'History',
  garage: 'Garage',
};

// Due-row tap → Log-service sheet prefilled with the matching type chip.
const INTERVAL_TO_CHIP: Record<string, string> = {
  oil: 'oil',
  rotation: 'rotation',
  brakeFluid: 'fluid',
  airFilter: 'filter',
  coolant: 'other',
  belt: 'other',
};

const NEW_SERVICE_TITLE: Record<string, string> = {
  oil: 'Oil change',
  rotation: 'Tire rotation',
  brakes: 'Brake service',
  fluid: 'Brake fluid flush',
  filter: 'Engine air filter',
  other: 'Service visit',
};

interface ToastState {
  seq: number;
  text: string;
  undoServiceId?: string;
}

interface UiState {
  tab: TabId;
  dueSegment: DueSegment;
  openReceiptIds: string[];
  openSwipeRowId: string | null;
  expandedRail: Record<string, boolean>;
  hypoMiles: number | null;
  vehicleMenuOpen: boolean;
  historyMenuOpen: boolean;
  rowMenuId: string | null;
  sheet: SheetRequest | null;
  sheetDetent: 'medium' | 'large';
  toast: ToastState | null;
  refreshing: boolean;
  updated: boolean;
}

interface LugnutStore {
  vehicles: Record<string, VehicleRec>;
  order: string[];
  activeVehicleId: string;
  ui: UiState;
}

const INITIAL_STORE: LugnutStore = {
  vehicles: Object.fromEntries(VEHICLES.map(veh => [veh.id, veh])),
  order: VEHICLES.map(veh => veh.id),
  activeVehicleId: 'v1',
  ui: {
    tab: 'timeline',
    dueSegment: 'all',
    openReceiptIds: [],
    openSwipeRowId: null,
    expandedRail: {},
    hypoMiles: null,
    vehicleMenuOpen: false,
    historyMenuOpen: false,
    rowMenuId: null,
    sheet: null,
    sheetDetent: 'medium',
    toast: null,
    refreshing: false,
    updated: false,
  },
};

export default function MobileMaintenanceTimeline() {
  const [store, setStore] = useState<LugnutStore>(INITIAL_STORE);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const chipRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);
  const scrollByTabRef = useRef<Record<TabId, number>>({timeline: 0, due: 0, history: 0, garage: 0});
  const [titleUnder, setTitleUnder] = useState(false);

  const width = useElementWidth(wrapRef);
  const isDesktop = width >= 720;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const ui = store.ui;
  const vehicle = store.vehicles[store.activeVehicleId];
  const states = deriveAll(vehicle, vehicle.mileage);
  const badge = overdueCount(states);
  const live = liveServices(vehicle);
  const groups = yearGroups(live);
  const lifetime = sumCents(live);
  const ytd = groups.find(g => g.year === 2026)?.cents ?? 0;
  const dueSorted = [...states].sort((a, b) => b.pct - a.pct);
  const dueFiltered =
    ui.dueSegment === 'all'
      ? dueSorted
      : dueSorted.filter(st => (ui.dueSegment === 'overdue' ? st.status === 'overdue' : st.status !== 'overdue'));

  const updateUi = useCallback((patch: Partial<UiState>) => {
    setStore(prev => ({...prev, ui: {...prev.ui, ...patch}}));
  }, []);
  const updateVehicle = useCallback((id: string, patch: Partial<VehicleRec>) => {
    setStore(prev => ({...prev, vehicles: {...prev.vehicles, [id]: {...prev.vehicles[id], ...patch}}}));
  }, []);

  const announce = useCallback(
    (text: string, undoServiceId?: string) => {
      toastSeqRef.current += 1;
      updateUi({toast: {seq: toastSeqRef.current, text, undoServiceId}});
    },
    [updateUi],
  );

  // Refresh resolves on the SAME press's second click or any user action.
  const resolveRefresh = useCallback(() => {
    setStore(prev => {
      if (!prev.ui.refreshing) return prev;
      toastSeqRef.current += 1;
      return {
        ...prev,
        ui: {
          ...prev.ui,
          refreshing: false,
          updated: true,
          toast: {seq: toastSeqRef.current, text: 'Updated just now'},
        },
      };
    });
  }, []);

  const getScroller = useCallback((): HTMLElement | null => {
    let el: HTMLElement | null = shellRef.current?.parentElement ?? null;
    while (el != null) {
      const css = window.getComputedStyle(el);
      if ((css.overflowY === 'auto' || css.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return document.scrollingElement as HTMLElement | null;
  }, []);

  // Large-title collapse — IO sentinel under the large-title row drives the
  // compact navBar title 0→1 (opacity swap only; safe under reduced motion).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(entries => {
      setTitleUnder(!(entries[0]?.isIntersecting ?? true));
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Per-tab scroll restore (persistence law — tabs never reset).
  useEffect(() => {
    const scroller = getScroller();
    if (scroller != null) scroller.scrollTop = scrollByTabRef.current[ui.tab] ?? 0;
  }, [getScroller, ui.tab]);

  const switchTab = (next: TabId) => {
    if (next === ui.tab) {
      // The one legal reset: re-tapping the active tab scrolls to top.
      getScroller()?.scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'});
      return;
    }
    const scroller = getScroller();
    if (scroller != null) scrollByTabRef.current[ui.tab] = scroller.scrollTop;
    resolveRefresh();
    // Overlays close on tab switch; toast, segment, openReceiptIds,
    // load-more expansion, and per-tab scroll all persist.
    updateUi({
      tab: next,
      vehicleMenuOpen: false,
      historyMenuOpen: false,
      rowMenuId: null,
      sheet: null,
      openSwipeRowId: null,
      hypoMiles: null,
    });
  };

  const openSheet = (req: Omit<SheetRequest, 'seq'>, opener: HTMLElement | null) => {
    openerRef.current = opener;
    toastSeqRef.current += 1;
    resolveRefresh();
    updateUi({
      sheet: {...req, seq: toastSeqRef.current},
      sheetDetent: 'medium',
      vehicleMenuOpen: false,
      historyMenuOpen: false,
      rowMenuId: null,
      hypoMiles: null,
    });
  };

  const closeSheet = () => {
    updateUi({sheet: null});
    openerRef.current?.focus({preventScroll: true});
  };

  const commitMileage = (miles: number) => {
    updateVehicle(store.activeVehicleId, {mileage: miles, mileageLogged: TODAY_LABEL});
    updateUi({sheet: null, hypoMiles: null});
    openerRef.current?.focus({preventScroll: true});
    // No Undo on purpose: reversible via re-edit through the same sheet.
    announce(\`Mileage updated to \${fmtMi(miles)} mi\`);
  };

  const commitService = (draft: {editId: string | null; typeId: string; mile: number; cents: number; shop: string}) => {
    const chip = TYPE_CHIPS.find(c => c.id === draft.typeId) ?? TYPE_CHIPS[5];
    if (draft.editId != null) {
      updateVehicle(store.activeVehicleId, {
        services: vehicle.services.map(svc =>
          svc.id === draft.editId ? {...svc, mile: draft.mile, cents: draft.cents, shop: draft.shop} : svc,
        ),
      });
      announce('Service updated');
    } else {
      toastSeqRef.current += 1;
      const id = \`svc-new-\${toastSeqRef.current}\`;
      const next: ServiceRec = {
        id,
        mile: draft.mile,
        dateLabel: TODAY_LABEL,
        year: 2026,
        daysAgo: 0,
        title: NEW_SERVICE_TITLE[chip.id] ?? 'Service visit',
        covers: chip.covers,
        cents: draft.cents,
        shop: draft.shop.length > 0 ? draft.shop : 'Self-serviced',
        icon: chip.icon,
        parts: [{id: \`\${id}-p1\`, label: 'Parts & labor', cents: draft.cents}],
      };
      updateVehicle(store.activeVehicleId, {
        services: [...vehicle.services, next],
        ...(draft.mile > vehicle.mileage ? {mileage: draft.mile, mileageLogged: TODAY_LABEL} : null),
      });
      announce(\`Service logged · \${fmtUsd(draft.cents)}\`);
    }
    updateUi({sheet: null});
    openerRef.current?.focus({preventScroll: true});
  };

  const deleteService = (svcId: string) => {
    updateVehicle(store.activeVehicleId, {
      services: vehicle.services.map(svc => (svc.id === svcId ? {...svc, deleted: true} : svc)),
    });
    updateUi({openSwipeRowId: null, rowMenuId: null});
    announce('Service deleted', svcId);
  };

  const undoDelete = (svcId: string) => {
    updateVehicle(store.activeVehicleId, {
      services: vehicle.services.map(svc => (svc.id === svcId ? {...svc, deleted: false} : svc)),
    });
    announce('Restored');
  };

  const scrub = (miles: number | null, release: boolean) => {
    resolveRefresh();
    if (release) {
      const last = ui.hypoMiles;
      if (last != null) {
        const n = dueCountAt(vehicle, last);
        // Mirror of the DeltaPill for SR parity, via the one live region.
        announce(\`at \${fmtMi(last)} mi: \${n} \${n === 1 ? 'item' : 'items'} due\`);
      }
      updateUi({hypoMiles: null});
      return;
    }
    updateUi({hypoMiles: miles});
  };

  const toggleReceipt = (id: string) => {
    resolveRefresh();
    updateUi({
      openReceiptIds: ui.openReceiptIds.includes(id)
        ? ui.openReceiptIds.filter(x => x !== id)
        : [...ui.openReceiptIds, id],
    });
  };

  const loadMore = () => {
    const hidden = live
      .filter(svc => svc.mile < (ui.expandedRail[vehicle.id] === true ? vehicle.railFullBottom : vehicle.railRestBottom))
      .sort((a, b) => b.mile - a.mile);
    const firstNewId = hidden[0]?.id;
    updateUi({expandedRail: {...ui.expandedRail, [vehicle.id]: true}});
    announce(\`\${hidden.length} earlier services loaded\`);
    // Appended cards land strictly BELOW the press point, so scrollTop is
    // stable by construction; move focus to the first new card.
    requestAnimationFrame(() => {
      if (firstNewId != null) {
        shellRef.current
          ?.querySelector<HTMLElement>(\`[data-ruler-card="\${firstNewId}"] button\`)
          ?.focus({preventScroll: true});
      }
    });
  };

  const refresh = () => {
    if (ui.refreshing) {
      resolveRefresh();
      return;
    }
    updateUi({refreshing: true, updated: false});
    announce('Loading');
  };

  const selectVehicle = (id: string) => {
    setStore(prev => ({...prev, activeVehicleId: id, ui: {...prev.ui, vehicleMenuOpen: false}}));
    chipRef.current?.focus({preventScroll: true});
  };

  const segKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const order: DueSegment[] = ['all', 'overdue', 'upcoming'];
    const idx = order.indexOf(ui.dueSegment);
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      updateUi({dueSegment: order[(idx + 1) % order.length]});
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      updateUi({dueSegment: order[(idx + order.length - 1) % order.length]});
    }
  };

  const sheetOpen = ui.sheet != null;
  const anyMenuOpen = ui.vehicleMenuOpen || ui.historyMenuOpen || ui.rowMenuId != null;
  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(sheetOpen ? styles.shellLocked : null),
    ...(isDesktop ? styles.shellDesktop : null),
  };
  const shortName = vehicle.name.split(' ').slice(-1)[0];

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{LUGNUT_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <LugnutMark />
          </div>
          <span style={{...styles.navTitle, ...(titleUnder ? styles.navTitleOn : null)}} className="lgn-fade" aria-hidden>
            {TAB_TITLE[ui.tab]}
          </span>
          <div style={{...styles.navTrailing, position: 'relative'}}>
            {ui.tab === 'history' ? (
              <button
                type="button"
                className="lgn-btn lgn-focusable"
                style={styles.iconBtn}
                aria-label="History options"
                aria-haspopup="menu"
                aria-expanded={ui.historyMenuOpen}
                onClick={() => updateUi({historyMenuOpen: !ui.historyMenuOpen, vehicleMenuOpen: false, rowMenuId: null})}>
                <Icon icon={MoreHorizontalIcon} size="sm" />
              </button>
            ) : null}
            <button
              type="button"
              className="lgn-btn lgn-focusable"
              style={styles.iconBtn}
              aria-label="Refresh"
              onClick={refresh}>
              <Icon icon={RefreshCwIcon} size="sm" />
            </button>
            {ui.historyMenuOpen ? (
              <div
                role="menu"
                aria-label="History options"
                style={{...styles.anchoredMenu, top: 48, right: 0}}
                onKeyDown={event => {
                  if (event.key === 'Escape') {
                    event.stopPropagation();
                    updateUi({historyMenuOpen: false});
                  }
                }}>
                <button
                  type="button"
                  role="menuitem"
                  className="lgn-btn lgn-focusable"
                  style={styles.menuRow}
                  onClick={() => updateUi({historyMenuOpen: false, openReceiptIds: live.map(s => s.id)})}>
                  <span style={styles.menuRowText}>Expand all receipts</span>
                </button>
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  role="menuitem"
                  className="lgn-btn lgn-focusable"
                  style={styles.menuRow}
                  onClick={() => updateUi({historyMenuOpen: false, openReceiptIds: []})}>
                  <span style={styles.menuRowText}>Collapse all receipts</span>
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div style={styles.largeTitle}>
          <h1 style={styles.largeTitleText}>{TAB_TITLE[ui.tab]}</h1>
          <button
            ref={chipRef}
            type="button"
            className="lgn-btn lgn-focusable"
            style={styles.vehicleChipHit}
            aria-haspopup="menu"
            aria-expanded={ui.vehicleMenuOpen}
            aria-label={\`Vehicle: \${vehicle.name}, \${fmtMi(vehicle.mileage)} miles\`}
            onClick={() => updateUi({vehicleMenuOpen: !ui.vehicleMenuOpen, historyMenuOpen: false, rowMenuId: null})}>
            <span style={styles.vehicleChip}>
              <span style={styles.vehicleChipLabel}>
                {vehicle.chipShort} · {fmtMi(vehicle.mileage)} mi
              </span>
              <Icon icon={ChevronDownIcon} size="xsm" />
            </span>
          </button>
          {ui.vehicleMenuOpen ? (
            <VehicleSwitcherMenu
              vehicles={store.order.map(id => store.vehicles[id])}
              activeId={store.activeVehicleId}
              onSelect={selectVehicle}
              onClose={() => {
                updateUi({vehicleMenuOpen: false});
                chipRef.current?.focus({preventScroll: true});
              }}
            />
          ) : null}
        </div>
        <div ref={sentinelRef} style={{height: 1}} aria-hidden />
        {ui.updated && !ui.refreshing ? <div style={styles.updatedCaption}>Updated just now</div> : null}

        <main style={styles.main}>
          {ui.refreshing ? (
            <SkeletonCard />
          ) : ui.tab === 'timeline' ? (
            <>
              <div style={styles.odoCard}>
                <div style={styles.odoText}>
                  <span style={styles.odoMiles}>{fmtMi(vehicle.mileage)} mi</span>
                  <span style={styles.odoMeta}>
                    as of {vehicle.mileageAsOf} · logged {vehicle.mileageLogged}
                  </span>
                </div>
                {/* The visible non-gesture path to the thumb's commit. */}
                <button
                  type="button"
                  className="lgn-btn lgn-focusable"
                  style={styles.secondaryBtn}
                  onClick={event => openSheet({mode: 'mileage'}, event.currentTarget)}>
                  Update mileage
                </button>
              </div>
              <OdometerRuler
                vehicle={vehicle}
                expanded={ui.expandedRail[vehicle.id] === true}
                openReceiptIds={ui.openReceiptIds}
                hypoMiles={ui.hypoMiles}
                states={states}
                onToggleReceipt={toggleReceipt}
                onLoadMore={loadMore}
                onScrub={scrub}
                onCommitViaSheet={prefill =>
                  openSheet({mode: 'mileage', prefillMiles: prefill}, shellRef.current?.querySelector('[role="slider"]') as HTMLElement | null)
                }
              />
            </>
          ) : ui.tab === 'due' ? (
            <>
              <div role="radiogroup" aria-label="Filter intervals" style={styles.segTrack} onKeyDown={segKey}>
                {(['all', 'overdue', 'upcoming'] as DueSegment[]).map(seg => (
                  <button
                    key={seg}
                    type="button"
                    role="radio"
                    aria-checked={ui.dueSegment === seg}
                    className="lgn-btn lgn-focusable"
                    style={{...styles.segBtn, ...(ui.dueSegment === seg ? styles.segBtnOn : null)}}
                    onClick={() => updateUi({dueSegment: seg})}>
                    {seg === 'all' ? 'All' : seg === 'overdue' ? 'Overdue' : 'Upcoming'}
                  </button>
                ))}
              </div>
              {dueFiltered.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyCircle}>
                    <Icon icon={BellOffIcon} size="md" />
                  </span>
                  <h2 style={styles.emptyTitle}>Nothing overdue</h2>
                  <p style={styles.emptyBody}>
                    The {shortName} is caught up through {fmtMi(vehicle.mileage)} mi.
                  </p>
                  <button
                    type="button"
                    className="lgn-btn lgn-focusable"
                    style={styles.secondaryBtn}
                    onClick={() => updateUi({dueSegment: 'all'})}>
                    Show all
                  </button>
                </div>
              ) : (
                <div style={{...styles.listCard, marginTop: 16}}>
                  {dueFiltered.map((st, index) => (
                    <div key={st.def.id}>
                      {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                      <button
                        type="button"
                        className="lgn-btn lgn-focusable"
                        style={styles.dueRow}
                        aria-label={\`\${st.def.name} — log this service\`}
                        onClick={event =>
                          openSheet(
                            {mode: 'log', prefillTypeId: INTERVAL_TO_CHIP[st.def.id] ?? 'other'},
                            event.currentTarget,
                          )
                        }>
                        <ServiceIntervalArc state={st} />
                        <span style={styles.rowText}>
                          <span style={styles.rowPrimary}>{st.def.name}</span>
                          <span style={styles.rowSecondary}>
                            {st.lastLabel != null ? \`Last \${st.lastLabel}\` : 'Never serviced'}
                          </span>
                        </span>
                        <span
                          style={{
                            ...styles.statusChip,
                            color: STATUS_COLOR[st.status],
                            background: \`color-mix(in srgb, \${STATUS_COLOR[st.status]} 12%, transparent)\`,
                          }}>
                          {st.chip}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : ui.tab === 'history' ? (
            <>
              <div style={styles.statStrip}>
                <div style={styles.statTile}>
                  <span style={styles.statValue}>{fmtUsd(lifetime)}</span>
                  <span style={styles.statLabel}>Lifetime</span>
                </div>
                <div style={styles.statTile}>
                  <span style={styles.statValue}>{live.length}</span>
                  <span style={styles.statLabel}>Services</span>
                </div>
                <div style={styles.statTile}>
                  <span style={styles.statValue}>{fmtUsd(ytd)}</span>
                  <span style={styles.statLabel}>2026 YTD</span>
                </div>
              </div>
              {groups.map(group => (
                <section key={group.year} aria-label={\`\${group.year} services\`}>
                  <h2 style={styles.sectionHeader}>
                    {group.year} · {fmtUsd(group.cents)}
                  </h2>
                  <div style={styles.listCard}>
                    {group.rows.map((svc, index) => (
                      <div key={svc.id}>
                        {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                        <HistoryRow
                          svc={svc}
                          open={ui.openReceiptIds.includes(svc.id)}
                          swipeOpen={ui.openSwipeRowId === svc.id}
                          menuOpen={ui.rowMenuId === svc.id}
                          isLast={index === group.rows.length - 1}
                          onToggleReceipt={toggleReceipt}
                          onSwipe={id => updateUi({openSwipeRowId: id})}
                          onMenu={id => updateUi({rowMenuId: id, vehicleMenuOpen: false, historyMenuOpen: false})}
                          onEdit={(id, opener) => openSheet({mode: 'log', editId: id}, opener)}
                          onDelete={deleteService}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16}}>
              {store.order.map(id => {
                const veh = store.vehicles[id];
                const vStates = deriveAll(veh, veh.mileage);
                const isActive = id === store.activeVehicleId;
                return (
                  <div key={id} style={styles.vehicleCard}>
                    <div style={styles.vehicleCardHead}>
                      <div style={styles.vehicleCardText}>
                        <span style={styles.vehicleCardName}>{veh.name}</span>
                        <span style={styles.vehicleCardMeta}>
                          VIN {veh.vinTail} · {veh.addedLabel}
                        </span>
                      </div>
                      <span style={styles.vehicleCardMiles}>{fmtMi(veh.mileage)} mi</span>
                    </div>
                    <HealthStrip states={vStates} />
                    {isActive ? (
                      <span style={styles.activePill}>Active</span>
                    ) : (
                      <button
                        type="button"
                        className="lgn-btn lgn-focusable"
                        style={{...styles.secondaryBtn, alignSelf: 'flex-start'}}
                        onClick={() => selectVehicle(id)}>
                        Make active
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* FAB — sticky-in-flow; opens the Log Service sheet. */}
        <div style={styles.fabAnchor}>
          <button
            type="button"
            className="lgn-btn lgn-focusable"
            style={styles.fab}
            aria-label="Log service"
            onClick={event => openSheet({mode: 'log'}, event.currentTarget)}>
            <Icon icon={PlusIcon} size="md" />
          </button>
        </div>

        {/* TOAST DOCK — the ONE polite live region; no auto-dismiss. */}
        <div style={styles.toastDock} aria-live="polite">
          {ui.toast != null ? (
            <div style={styles.toast}>
              <span style={styles.toastText}>{ui.toast.text}</span>
              {ui.toast.undoServiceId != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    className="lgn-btn lgn-focusable"
                    style={styles.toastUndo}
                    onClick={() => undoDelete(ui.toast?.undoServiceId ?? '')}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} role="tablist" aria-label="Lugnut sections">
          {TABS.map(tab => {
            const active = tab.id === ui.tab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="lgn-btn lgn-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => switchTab(tab.id)}
                onKeyDown={event => {
                  const idx = TABS.findIndex(t => t.id === ui.tab);
                  if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    switchTab(TABS[(idx + 1) % TABS.length].id);
                  } else if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    switchTab(TABS[(idx + TABS.length - 1) % TABS.length].id);
                  }
                }}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="sm" />
                  {tab.id === 'due' && badge > 0 ? <span style={styles.tabBadge}>{badge}</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Click-catcher under anchored menus (z29 < menu z30). */}
        {anyMenuOpen ? (
          <div
            style={{position: 'absolute', inset: 0, zIndex: 29}}
            onClick={() => updateUi({vehicleMenuOpen: false, historyMenuOpen: false, rowMenuId: null})}
          />
        ) : null}

        {ui.sheet != null ? (
          <LogServiceSheet
            key={ui.sheet.seq}
            request={ui.sheet}
            vehicle={vehicle}
            detent={ui.sheetDetent}
            onToggleDetent={() => updateUi({sheetDetent: ui.sheetDetent === 'medium' ? 'large' : 'medium'})}
            onClose={closeSheet}
            onCommitMileage={commitMileage}
            onCommitService={commitService}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};