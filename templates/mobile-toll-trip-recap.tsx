// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Gantry transponder statement for
 *   June 2026: 11 trips / 34 gantry crossings / 405 mi, tolls exactly
 *   $78.00, fuel estimate 405 × $0.20 = $81.00, parking 12+8+15+6 = $41.00
 *   (grand $200.00); two duplicate-charge disputes pre-filed (T4 Harbor
 *   Tunnel Plaza $2.50, T7 Cedar Split $1.75 → $4.25 pending, $73.75
 *   charged, export count 34 − 2 = 32). Every aggregate on screen derives
 *   live from the ONE trips table at render — never hand-typed twice. No
 *   Date.now(), no Math.random(), no network media, no real maps (plazas
 *   are stylized SVG arch glyphs).
 * @output Gantry — June Trips Toll Recap: a 390px MOBILE toll-statement
 *   ledger. NavBar (Gantry arch mark · fade-in title · Share2 export) over
 *   a large-title row with a disabled single-month stepper, a
 *   monthSummaryCard ($78.00 hero, charged·pending split, 3-stat row), and
 *   11 tripCards whose expanded bodies stack a scrubable RouteRibbon
 *   (abstract plaza arches spaced by mile marker, tappable fee bubbles,
 *   running subtotal chip), 60px DisputeFlagRows (swipe −72px Dispute
 *   block + mandatory 44×44 ellipsis action sheet), and a TripCostStackbar
 *   (tolls/fuel-est/parking splits, charged-vs-expected reconcile seam,
 *   escrow-detached dashed disputed slices). Signature move: filing a
 *   duplicate-charge dispute is ONE reducer write that instantly moves
 *   money from the month total into the pending figure, detaches the fee
 *   from the trip's stackbar as a dashed escrow slice, stripes the row,
 *   badges the Disputes tab, and decrements the Export sheet's live count
 *   — with persistent undo-over-confirm throughout. Tabs: Trips /
 *   Disputes / Passes / Export; two-detent Export sheet with a
 *   loadMoreRow'd line-item preview.
 * @position Page template; emitted by `astryx template mobile-toll-trip-recap`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, actionSheet) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   Export sheet or an actionSheet is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close. The toast
 *   dock is sticky-in-flow (bottom 76, above the 64px tabBar) per the
 *   batch-2 amendment — absolute-in-shell would pin to the DOCUMENT
 *   bottom on this tall scrolling ledger. The stage clips to
 *   --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); no desktop Layout frames, no
 *   side asides, no multi-column tables — the rate table is 44px utility
 *   rows with trailing values.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Gantry cyan — the demo's --color-brand is the demo logo
 *   blue, so the spec hex is quarantined here per house rule); sanctioned
 *   non-brand literals are the fuel-teal and parking-amber stackbar pairs,
 *   the reconcile-seam white/near-black pair, the ribbon lane slate pair,
 *   and the dark-scheme swipe-block fill — each with contrast math at the
 *   declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — this
 *   template fades only the center title, not the border; noted per
 *   contract); largeTitle row 52px in flow (28px/700 h1 + 44×44 disabled
 *   month-stepper chevrons) → 104px total header; monthSummaryCard 16px
 *   padding with a 44px 3-stat row; sectionHeader 13px/600 uppercase
 *   0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px bottom; trip
 *   header rows 60px; crossing DisputeFlagRows 60px two-line; RouteRibbon
 *   88px; TripCostStackbar 72px block (12px bar + 4px gap + legend); rate
 *   rows 44px; dispute cards 72px; tabBar 64px sticky bottom z20 (4
 *   tabItems flex 1, 24px icon over 11px/500 label, 4px gap); sheet
 *   detents 55% medium / calc(100% − 56px) large, 24px grabber zone with
 *   36×5 pill, 52px sheet header, 48px sticky-footer button; toastDock
 *   sticky bottom 76 z30. TYPE (Figtree via --font-family-body): 28/700
 *   large title + hero figure · 17/600 nav & sheet titles · 16/400–600
 *   body & row primaries · 13/400 secondary · 11/500 overlines, legends,
 *   fee bubbles · 10/600 tab badge (foundations' own badge number);
 *   nothing else under 11px; tabular-nums on every money/mileage figure.
 *   Touch: every target ≥44×44 with ≥8px clearance or merged into a
 *   full-row button; every gesture (row swipe, ribbon scrub, sheet drag)
 *   has a visible button path (44×44 ellipsis per row, arch buttons +
 *   slider keys on the ribbon, clickable grabber + X on the sheet).
 *
 * Responsive contract:
 * - Fluid 320–430px: zero width literals; RouteRibbon arch positions are
 *   percentage calc(16px + frac·(100% − 32px)) so ribbons compress
 *   fluidly; at ≤340px container width resting fee bubbles hide for
 *   crossings closer than 44px apart (deterministic layout math from mile
 *   fractions) and their figures live in the inflated bubble; same-mile
 *   duplicate crossings render as ONE stacked arch with a ×2 chip whose
 *   tap cycles the pair (T4's MM18 duplicates are the fixture). The
 *   3-stat row wraps 2+1 below 350px (flexWrap); trip-header route text
 *   ellipsizes (minWidth 0) so the trailing total never wraps.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — a toll ledger is deliberately phone
 *   geometry.
 */

import {useEffect, useReducer, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  DownloadIcon,
  FlagIcon,
  FlagOffIcon,
  MoreHorizontalIcon,
  RouteIcon,
  Share2Icon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Gantry cyan). #0E7490 on #FFFFFF ≈ 5.4:1
// (passes 4.5:1 for 11px/600 bubble + pending text); #67E8F9 on the dark
// card (~#111) ≈ 10:1.
const BRAND_ACCENT = 'light-dark(#0E7490, #67E8F9)';
// Text over a BRAND_ACCENT fill (tab badge, primary buttons). Light:
// #FFFFFF on #0E7490 ≈ 5.4:1. Dark: white on #67E8F9 fails (~1.3:1), so
// the dark side flips to a near-black cyan — #164E63 on #67E8F9 ≈ 7.6:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #164E63)';
// Swipe-reveal Dispute block. Light: brand fill, white 13px/600 label on
// #0E7490 ≈ 5.4:1. Dark: #164E63 fill with #A5F3FC text ≈ 7:1 (a #67E8F9
// fill would force near-black text and read as a highlight, not an
// action block).
const SWIPE_BLOCK_BG = 'light-dark(#0E7490, #164E63)';
const SWIPE_BLOCK_TEXT = 'light-dark(#FFFFFF, #A5F3FC)';
// Brand-tinted wash (active-tab press, express-lane hatch underlay).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// RouteRibbon lane — 2px dashed baseline. Passive separator ROLE but
// position-meaningful, so an explicit pair per the amendment (never bare
// --color-border): #94A3B8 on the #FFF card ≈ 2.6:1 non-text decorative
// baseline (the arches, not the lane, carry the data; each arch is a
// currentColor glyph at text contrast); #475569 on the dark card ≈ 2.6:1
// symmetrical.
const LANE_DASH = 'light-dark(#94A3B8, #475569)';
// TripCostStackbar fuel-estimate segment. #0F766E (teal-700) on the #FFF
// card ≈ 4.8:1; #5EEAD4 (teal-300) on the dark card ≈ 9:1.
const FUEL_FILL = 'light-dark(#0F766E, #5EEAD4)';
// TripCostStackbar parking segment. #B45309 (amber-700) on #FFF ≈ 4.6:1;
// #FCD34D (amber-300) on the dark card ≈ 9.5:1.
const PARKING_FILL = 'light-dark(#B45309, #FCD34D)';
// Reconcile seam — a 2px notch cut into the bar at the expected-tolls
// position; matches the card surface so it reads as a physical gap.
const SEAM = 'light-dark(#FFFFFF, #0B0B0B)';
// Sheet/action-sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden text,
// sheet/actionSheet entrances, and the reduced-motion guard. Transitions
// animate transform/opacity only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const GANTRY_CSS = `
.gtr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.gtr-btn:disabled { cursor: default; }
.gtr-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.gtr-anim { transition: transform 200ms ease, opacity 200ms ease; }
.gtr-fade { transition: opacity 200ms ease; }
@keyframes gtr-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.gtr-sheet-in { animation: gtr-sheet-in 200ms ease; }
.gtr-vh {
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
  .gtr-anim, .gtr-fade { transition: none; }
  .gtr-sheet-in { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, largeTitle,
// tabBar, tabItem, sheetScrim, sheet, sheetGrabber, listCard, row,
// rowDivider, sectionHeader.
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
  // Scroll lock while a sheet/actionSheet is open; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 icon buttons
  // optically align content to the 16px gutter. Hairline ALWAYS ON (only
  // the center title is scroll-wired, via the IntersectionObserver
  // sentinel under the largeTitle row).
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
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
  // LARGE-TITLE ROW — 52px in flow below the sticky navBar (104px total
  // header); h1 28/700 at the 16px gutter, trailing month stepper.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInlineStart: 16,
    paddingInlineEnd: 8,
  },
  h1: {fontSize: 28, fontWeight: 700, lineHeight: 1.1, margin: 0},
  monthStepper: {display: 'flex', alignItems: 'center'},
  monthLabel: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Single-month fixture: May/July steppers are aria-disabled at 40%
  // opacity but stay keyboard-focusable so their aria-labels explain why.
  stepBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  stepBtnDisabled: {opacity: 0.4},
  // Zero-height IntersectionObserver sentinel under the largeTitle row —
  // when it scrolls under the 52px navBar the compact title fades in.
  sentinel: {height: 1, marginTop: -1},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
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
  // MONTH SUMMARY CARD — 16px padding; overline / $78.00 hero / split
  // line / 44px 3-stat row.
  summaryCard: {
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  heroFigure: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  splitLine: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  pendingFigure: {color: BRAND_ACCENT, fontWeight: 600},
  statRow: {display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4},
  statCell: {
    flex: '1 1 96px',
    minWidth: 0,
    height: 44,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statLabel: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)'},
  // TRIP CARDS — 12px apart; 60px header row (full-row expand button).
  tripStack: {display: 'flex', flexDirection: 'column', gap: 12},
  tripHeaderRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  tripHeaderText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  tripRoute: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
  },
  tripMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tripTotal: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  chevron: {display: 'inline-flex', color: 'var(--color-text-secondary)', flexShrink: 0},
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // ROUTE RIBBON — 88px, inset 16px inline inside the card.
  ribbon: {
    position: 'relative',
    height: 88,
    marginInline: 16,
    touchAction: 'pan-y',
  },
  // Baseline lane at y=56 — 2px dashed (explicit LANE_DASH pair; see the
  // COLOR LITERALS comment).
  ribbonLane: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 56,
    borderTop: `2px dashed ${LANE_DASH}`,
  },
  // Express-lane hatch — 8px strip on the lane; repeating 45° brand
  // stripes at 30% opacity over a muted track. Static (survives reduced
  // motion by construction).
  expressStrip: {
    position: 'absolute',
    top: 53,
    height: 8,
    borderRadius: 4,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  expressHatch: {
    position: 'absolute',
    inset: 0,
    background: `repeating-linear-gradient(45deg, ${BRAND_ACCENT} 0 3px, transparent 3px 7px)`,
    opacity: 0.3,
  },
  // Each arch sits inside a 44×44 absolutely positioned real <button>.
  archBtn: {
    position: 'absolute',
    top: 30,
    width: 44,
    height: 44,
    marginLeft: -22,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  archBtnActive: {color: BRAND_ACCENT},
  stackChip: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 11,
    fontWeight: 600,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
  },
  // Resting fee bubble — 20px pill above the arch.
  feeBubble: {
    position: 'absolute',
    top: 6,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 6,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  // Disputed crossing's resting bubble — dashed brand outline, no fill
  // (≥3:1 boundary: BRAND_ACCENT vs the card per the literals comment).
  feeBubbleDisputed: {
    background: 'transparent',
    border: `1.5px dashed ${BRAND_ACCENT}`,
    color: BRAND_ACCENT,
  },
  // Inflated bubble — 56px card for the active crossing; translateX slides
  // −frac·100% so it clamps inside the ribbon at both ends.
  inflatedBubble: {
    position: 'absolute',
    top: 0,
    height: 56,
    minWidth: 132,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 1,
    paddingInline: 10,
    borderRadius: 8,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  inflatedTitle: {
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inflatedMeta: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Running subtotal chip — top-right of the ribbon.
  subtotalChip: {
    position: 'absolute',
    top: 6,
    right: 0,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 3,
  },
  // DISPUTE FLAG ROW — 60px two-line crossing row; swipe clip + block.
  crossingOuter: {position: 'relative', overflow: 'hidden'},
  // Swipe-reveal Dispute block behind the row (72px wide, full height).
  disputeBlock: {
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
    background: SWIPE_BLOCK_BG,
    color: SWIPE_BLOCK_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  crossingContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  // Disputed rest state: 3px brand stripe hugging the row's left inner
  // edge, full height, 0 radius.
  disputeStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    background: BRAND_ACCENT,
  },
  crossingRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  crossingText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  crossingPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  crossingSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  crossingFee: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    // Fee text, then ≥8px clearance, then the 44×44 ellipsis.
    marginInlineEnd: 8,
  },
  // Disputed fee re-renders as a dashed-outline pending pill.
  pendingPill: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    paddingInline: 6,
    borderRadius: 999,
    border: `1.5px dashed ${BRAND_ACCENT}`,
    color: BRAND_ACCENT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    marginInlineEnd: 8,
  },
  // TRIP COST STACKBAR — 72px block: header line, 12px bar, 4px gap,
  // legend line. Pure derived render.
  stackbarBlock: {
    padding: '8px 16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  stackbarHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  stackbarDelta: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  stackbarRail: {display: 'flex', alignItems: 'center', height: 12},
  stackbar: {
    position: 'relative',
    display: 'flex',
    height: 12,
    flex: 1,
    minWidth: 0,
  },
  // Detached escrow slice — 4px right of the bar end, dashed brand
  // outline, transparent fill (money physically out of the bar).
  escrowSlice: {
    height: 12,
    marginLeft: 4,
    borderRadius: 6,
    border: `1.5px dashed ${BRAND_ACCENT}`,
    background: 'transparent',
    flexShrink: 0,
  },
  stackbarLegend: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // TAB SCREENS — Disputes / Passes / Export share row vocab.
  disputeRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  disputeIconCircle: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  statusPill: {
    fontSize: 11,
    fontWeight: 500,
    paddingInline: 8,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  utilityRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  utilityLabel: {
    flex: 1,
    minWidth: 0,
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
  twoLineRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  primaryBtn: {
    marginInline: 16,
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
  // EMPTY STATE (Disputes at zero) — foundations anatomy verbatim.
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
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    marginTop: 4,
  },
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom even mid-scroll on this tall ledger; absolute-in-shell
  // would anchor to the DOCUMENT bottom (batch-2 amendment). The single
  // polite live region; always mounted.
  toastDock: {
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
    paddingInline: 16,
    borderRadius: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // TAB BAR — exactly 64px, 4 tabs flex 1, sticky bottom z20.
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
  // Tab badge — 16px-min brand pill, 10px/600 (the foundations' own badge
  // number), offset top −4 / right −8 from the icon.
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
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
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
  sheetBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto', // the ONE legal inner scroller
    padding: '4px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
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
  // Segmented control — 36px track, 12px outer / 10px inner pill.
  segTrack: {
    display: 'flex',
    height: 36,
    padding: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segItem: {
    flex: 1,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  segItemActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  sheetCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  lineItemRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
  },
  lineItemLabel: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
    borderTop: '1px solid var(--color-border)',
  },
  sheetCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // ACTION SHEET — insetInline 16 bottom 16 z41; two cards 8px apart.
  actionSheet: {
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
  actionContext: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    borderBottom: '1px solid var(--color-border)',
  },
  actionSheetRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  actionCancelRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  actionRowDivider: {height: 1, background: 'var(--color-border)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, one TRIPS table, every derived figure computed
// from it at render (never hand-typed twice). CROSS-CHECKS (assert-style,
// verified by hand):
//   crossings 4+3+2+5+3+2+4+3+2+4+2 = 34 ✓
//   miles 45+30+25+60+35+40+50+30+20+45+25 = 405 ✓
//   tolls 950+525+600+1000+700+700+800+700+500+800+525 = 7800¢ = $78.00 ✓
//   fuel 405 mi × 20¢ = 8100¢ = $81.00 ✓
//   parking 1200+800+1500+600 = 4100¢ = $41.00 ✓
//   grand 78+81+41 = $200.00 ✓
//   initial disputed = t4c3 250 + t7c2 175 = 425¢ pending; 7800−425 =
//   7375¢ = $73.75 charged ✓ ; Disputes badge 2 ; Export 34−2 = 32 ✓
//   express crossings: t1c3, t3c1, t4c4, t6c1, t8c1, t10c3, t11c1 = 7 ✓
// Weekday labels are calendar-true for June 2026 (Jun 1 = Monday), so
// Jun 28 is 'Sun' — a deliberate correction of the spec's sample 'Sat'
// string; every date-arithmetic law above is kept exact.
// ---------------------------------------------------------------------------

const MONTH = 'June 2026';
const TRANSPONDER = 'GNT-4471-A';
const VEHICLE = 'Class 1 · 2-axle';
const RATE_PER_MI_FUEL_CENTS = 20; // $0.20 / mi fuel estimate

interface Crossing {
  id: string;
  plaza: string;
  mile: number; // mile marker along the trip — drives ribbon position
  time: string;
  feeCents: number;
  express: boolean;
}

interface Trip {
  id: string;
  dateLabel: string; // 'Sun, Jun 28'
  dateShort: string; // 'Jun 28'
  route: string;
  miles: number;
  parkingCents: number;
  crossings: Crossing[];
}

const TRIPS: Trip[] = [
  {
    id: 't1',
    dateLabel: 'Sun, Jun 28',
    dateShort: 'Jun 28',
    route: 'Riverside → Downtown',
    miles: 45,
    parkingCents: 1200,
    // tolls 250+175+325+200 = 950 ✓ ; total 950+900+1200 = 3050 = $30.50 ✓
    crossings: [
      {id: 't1c1', plaza: 'Harborview Gantry', mile: 4, time: '8:12 AM', feeCents: 250, express: false},
      {id: 't1c2', plaza: 'Cedar Split', mile: 12, time: '8:24 AM', feeCents: 175, express: false},
      {id: 't1c3', plaza: 'Midtown Express', mile: 21, time: '8:37 AM', feeCents: 325, express: true},
      {id: 't1c4', plaza: 'Fifth Basin', mile: 33, time: '8:51 AM', feeCents: 200, express: false},
    ],
  },
  {
    id: 't2',
    dateLabel: 'Fri, Jun 26',
    dateShort: 'Jun 26',
    route: 'Downtown → Lakefield',
    miles: 30,
    parkingCents: 0,
    // tolls 150+225+150 = 525 ✓ ; total 525+600 = 1125 = $11.25 ✓
    crossings: [
      {id: 't2c1', plaza: 'Fifth Basin', mile: 5, time: '5:02 PM', feeCents: 150, express: false},
      {id: 't2c2', plaza: 'Cedar Split', mile: 14, time: '5:15 PM', feeCents: 225, express: false},
      {id: 't2c3', plaza: 'Northgate', mile: 24, time: '5:31 PM', feeCents: 150, express: false},
    ],
  },
  {
    id: 't3',
    dateLabel: 'Wed, Jun 24',
    dateShort: 'Jun 24',
    route: 'Riverside → Airport',
    miles: 25,
    parkingCents: 0,
    // tolls 300+300 = 600 ✓ ; total 600+500 = 1100 = $11.00 ✓
    crossings: [
      {id: 't3c1', plaza: 'Airport Spur', mile: 8, time: '6:40 AM', feeCents: 300, express: true},
      {id: 't3c2', plaza: 'Terminal Loop', mile: 19, time: '6:52 AM', feeCents: 300, express: false},
    ],
  },
  {
    id: 't4',
    dateLabel: 'Sun, Jun 21',
    dateShort: 'Jun 21',
    route: 'Riverside → Bay Docks',
    miles: 60,
    parkingCents: 800,
    // tolls charged 125+250+250+175+200 = 1000 ✓ ; expected 1000−250 = 750
    // (t4c3 is the pre-filed duplicate) ; total 1000+1200+800 = 3000 ✓
    // t4c2/t4c3 share MM18 — the stacked-arch ×2 fixture.
    crossings: [
      {id: 't4c1', plaza: 'Harborview Gantry', mile: 6, time: '9:05 AM', feeCents: 125, express: false},
      {id: 't4c2', plaza: 'Harbor Tunnel Plaza', mile: 18, time: '9:22 AM', feeCents: 250, express: false},
      {id: 't4c3', plaza: 'Harbor Tunnel Plaza', mile: 18, time: '9:22 AM', feeCents: 250, express: false},
      {id: 't4c4', plaza: 'Bayline', mile: 34, time: '9:41 AM', feeCents: 175, express: true},
      {id: 't4c5', plaza: 'Dockside', mile: 52, time: '10:02 AM', feeCents: 200, express: false},
    ],
  },
  {
    id: 't5',
    dateLabel: 'Fri, Jun 19',
    dateShort: 'Jun 19',
    route: 'Downtown → Hillcrest',
    miles: 35,
    parkingCents: 0,
    // tolls 275+275+150 = 700 ✓ ; total 700+700 = 1400 = $14.00 ✓
    crossings: [
      {id: 't5c1', plaza: 'Northgate', mile: 7, time: '8:05 AM', feeCents: 275, express: false},
      {id: 't5c2', plaza: 'Summit Cut', mile: 18, time: '8:21 AM', feeCents: 275, express: false},
      {id: 't5c3', plaza: 'Cedar Split', mile: 29, time: '8:36 AM', feeCents: 150, express: false},
    ],
  },
  {
    id: 't6',
    dateLabel: 'Wed, Jun 17',
    dateShort: 'Jun 17',
    route: 'Riverside → Stadium',
    miles: 40,
    parkingCents: 0,
    // tolls 450+250 = 700 ✓ ; total 700+800 = 1500 = $15.00 ✓ ; t6c1
    // ($4.50) is stress fixture 1's third-dispute target.
    crossings: [
      {id: 't6c1', plaza: 'Midtown Express', mile: 12, time: '6:55 PM', feeCents: 450, express: true},
      {id: 't6c2', plaza: 'Fifth Basin', mile: 30, time: '7:12 PM', feeCents: 250, express: false},
    ],
  },
  {
    id: 't7',
    dateLabel: 'Sun, Jun 14',
    dateShort: 'Jun 14',
    route: 'Riverside → Capitol',
    miles: 50,
    parkingCents: 1500,
    // tolls charged 175+175+225+225 = 800 ✓ ; expected 800−175 = 625
    // (t7c2 pre-filed duplicate) ; total 800+1000+1500 = 3300 = $33.00 ✓
    crossings: [
      {id: 't7c1', plaza: 'Cedar Split', mile: 8, time: '7:58 AM', feeCents: 175, express: false},
      {id: 't7c2', plaza: 'Cedar Split', mile: 8, time: '7:58 AM', feeCents: 175, express: false},
      {id: 't7c3', plaza: 'Capitol Ring', mile: 22, time: '8:20 AM', feeCents: 225, express: false},
      {id: 't7c4', plaza: 'Capitol Ring', mile: 44, time: '6:10 PM', feeCents: 225, express: false},
    ],
  },
  {
    id: 't8',
    dateLabel: 'Thu, Jun 11',
    dateShort: 'Jun 11',
    route: 'Downtown → Lakefield',
    miles: 30,
    parkingCents: 0,
    // tolls 325+200+175 = 700 ✓ ; total 700+600 = 1300 = $13.00 ✓
    crossings: [
      {id: 't8c1', plaza: 'Midtown Express', mile: 6, time: '8:10 AM', feeCents: 325, express: true},
      {id: 't8c2', plaza: 'Northgate', mile: 16, time: '8:22 AM', feeCents: 200, express: false},
      {id: 't8c3', plaza: 'Cedar Split', mile: 25, time: '8:35 AM', feeCents: 175, express: false},
    ],
  },
  {
    id: 't9',
    dateLabel: 'Mon, Jun 8',
    dateShort: 'Jun 8',
    route: 'Riverside → Downtown',
    miles: 20,
    parkingCents: 0,
    // tolls 250+250 = 500 ✓ ; total 500+400 = 900 = $9.00 ✓
    crossings: [
      {id: 't9c1', plaza: 'Harborview Gantry', mile: 4, time: '9:15 AM', feeCents: 250, express: false},
      {id: 't9c2', plaza: 'Fifth Basin', mile: 14, time: '9:29 AM', feeCents: 250, express: false},
    ],
  },
  {
    id: 't10',
    dateLabel: 'Fri, Jun 5',
    dateShort: 'Jun 5',
    route: 'Riverside → Bay Docks',
    miles: 45,
    parkingCents: 600,
    // tolls 150+200+275+175 = 800 ✓ ; total 800+900+600 = 2300 = $23.00 ✓
    crossings: [
      {id: 't10c1', plaza: 'Harborview Gantry', mile: 5, time: '7:40 AM', feeCents: 150, express: false},
      {id: 't10c2', plaza: 'Harbor Tunnel Plaza', mile: 16, time: '7:58 AM', feeCents: 200, express: false},
      {id: 't10c3', plaza: 'Bayline', mile: 28, time: '8:15 AM', feeCents: 275, express: true},
      {id: 't10c4', plaza: 'Dockside', mile: 40, time: '8:33 AM', feeCents: 175, express: false},
    ],
  },
  {
    id: 't11',
    dateLabel: 'Tue, Jun 2',
    dateShort: 'Jun 2',
    route: 'Downtown → Airport',
    miles: 25,
    parkingCents: 0,
    // tolls 350+175 = 525 ✓ ; total 525+500 = 1025 = $10.25 ✓
    crossings: [
      {id: 't11c1', plaza: 'Airport Spur', mile: 9, time: '5:20 AM', feeCents: 350, express: true},
      {id: 't11c2', plaza: 'Terminal Loop', mile: 20, time: '5:33 AM', feeCents: 175, express: false},
    ],
  },
];

// Flat crossing → trip lookup for dispute records and the export ledger.
const CROSSING_INDEX: Record<string, {trip: Trip; crossing: Crossing}> = {};
for (const trip of TRIPS) {
  for (const crossing of trip.crossings) {
    CROSSING_INDEX[crossing.id] = {trip, crossing};
  }
}

// Export line items in statement order (oldest trip first, crossings in
// crossing order): 34 rows before dispute subtraction.
const LINE_ITEMS: Array<{id: string; label: string; feeCents: number}> = [...TRIPS]
  .reverse()
  .flatMap(trip =>
    trip.crossings.map(crossing => ({
      id: crossing.id,
      label: `${trip.dateShort} · ${crossing.plaza}`,
      feeCents: crossing.feeCents,
    })),
  );

const EXPORT_PREVIEW_COUNT = 5;

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Cents → '$2.50'. */
function fmtUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — recapStore via useReducer. Crossing dispute status,
// tab, per-tab scroll, expansion, active ribbon crossing, swipe/sheet/toast
// all live here; the only component-local values are transient pointer
// deltas (swipe translate, scrub x) per the spec.
// ---------------------------------------------------------------------------

type TabId = 'trips' | 'disputes' | 'passes' | 'export';

interface DisputeRecord {
  crossingId: string;
  reason: string;
  filedLabel: string;
}

type SheetState = null | {kind: 'export'} | {kind: 'action'; crossingId: string};

interface ToastUndo {
  kind: 'withdraw' | 'refile';
  crossingId: string;
  reason: string;
}

interface RecapState {
  disputes: DisputeRecord[];
  activeTab: TabId;
  scrollTopByTab: Record<TabId, number>;
  expandedTripIds: string[];
  activeCrossingId: string | null;
  openSwipeRowId: string | null;
  sheet: SheetState;
  sheetDetent: 'medium' | 'large';
  exportFormat: 'csv' | 'pdf';
  exportShowAll: boolean;
  toast: {seq: number; msg: string; undo: ToastUndo | null} | null;
}

// Pre-filed disputes: the two duplicate charges, filed on their trip dates.
const INITIAL_STATE: RecapState = {
  disputes: [
    {crossingId: 't4c3', reason: 'Duplicate charge', filedLabel: 'Filed Jun 21'},
    {crossingId: 't7c2', reason: 'Duplicate charge', filedLabel: 'Filed Jun 14'},
  ],
  activeTab: 'trips',
  scrollTopByTab: {trips: 0, disputes: 0, passes: 0, export: 0},
  expandedTripIds: ['t1', 't2'], // trips 1–2 expanded by default
  activeCrossingId: null,
  openSwipeRowId: null,
  sheet: null,
  sheetDetent: 'medium',
  exportFormat: 'csv',
  exportShowAll: false,
  toast: null,
};

type RecapAction =
  | {type: 'SET_TAB'; tab: TabId; prevScrollTop: number}
  | {type: 'REVEAL_CROSSING'; crossingId: string; prevScrollTop: number}
  | {type: 'TOGGLE_TRIP'; tripId: string}
  | {type: 'SET_ACTIVE_CROSSING'; crossingId: string | null}
  | {type: 'SET_SWIPE'; crossingId: string | null}
  | {type: 'FILE_DISPUTE'; crossingId: string; reason: string}
  | {type: 'WITHDRAW'; crossingId: string; offerRefile: boolean}
  | {type: 'UNDO_TOAST'}
  | {type: 'OPEN_EXPORT'}
  | {type: 'OPEN_ACTION'; crossingId: string}
  | {type: 'CLOSE_SHEET'}
  | {type: 'TOGGLE_DETENT'}
  | {type: 'SET_FORMAT'; format: 'csv' | 'pdf'}
  | {type: 'SHOW_ALL_LINES'; loadedCount: number}
  | {type: 'EXPORT_PRESSED'; count: number}
  | {type: 'COPY_DETAILS'; crossingId: string};

let toastSeq = 1;
function toast(msg: string, undo: ToastUndo | null = null) {
  return {seq: toastSeq++, msg, undo};
}

function recapReducer(state: RecapState, action: RecapAction): RecapState {
  switch (action.type) {
    case 'SET_TAB':
      return {
        ...state,
        activeTab: action.tab,
        scrollTopByTab: {...state.scrollTopByTab, [state.activeTab]: action.prevScrollTop},
        // Overlays belong to their moment: sheet/actionSheet close on tab
        // switch. NOTHING else resets — expansion, disputes, toast persist.
        // (Re-tap of the active tab is the component's one legal reset:
        // scroll that screen to top.)
        sheet: null,
        openSwipeRowId: null,
      };
    case 'REVEAL_CROSSING': {
      // Disputes-tab row → jump back to the ledger: expand the trip,
      // activate the crossing on its ribbon, scroll it into view.
      const {trip} = CROSSING_INDEX[action.crossingId];
      return {
        ...state,
        activeTab: 'trips',
        scrollTopByTab: {...state.scrollTopByTab, [state.activeTab]: action.prevScrollTop},
        expandedTripIds: state.expandedTripIds.includes(trip.id)
          ? state.expandedTripIds
          : [...state.expandedTripIds, trip.id],
        activeCrossingId: action.crossingId,
        sheet: null,
        openSwipeRowId: null,
      };
    }
    case 'TOGGLE_TRIP': {
      const isOpen = state.expandedTripIds.includes(action.tripId);
      return {
        ...state,
        expandedTripIds: isOpen
          ? state.expandedTripIds.filter(id => id !== action.tripId)
          : [...state.expandedTripIds, action.tripId],
      };
    }
    case 'SET_ACTIVE_CROSSING':
      return {...state, activeCrossingId: action.crossingId};
    case 'SET_SWIPE':
      return {...state, openSwipeRowId: action.crossingId};
    case 'FILE_DISPUTE': {
      if (state.disputes.some(record => record.crossingId === action.crossingId)) {
        return state;
      }
      const fee = CROSSING_INDEX[action.crossingId].crossing.feeCents;
      return {
        ...state,
        disputes: [...state.disputes, {crossingId: action.crossingId, reason: action.reason, filedLabel: 'Filed today'}],
        openSwipeRowId: null,
        sheet: state.sheet?.kind === 'action' ? null : state.sheet,
        toast: toast(`Dispute filed · ${fmtUsd(fee)} moved to pending`, {
          kind: 'withdraw',
          crossingId: action.crossingId,
          reason: action.reason,
        }),
      };
    }
    case 'WITHDRAW': {
      const record = state.disputes.find(item => item.crossingId === action.crossingId);
      if (record == null) {
        return state;
      }
      const fee = CROSSING_INDEX[action.crossingId].crossing.feeCents;
      return {
        ...state,
        disputes: state.disputes.filter(item => item.crossingId !== action.crossingId),
        sheet: state.sheet?.kind === 'action' ? null : state.sheet,
        toast: action.offerRefile
          ? toast(`Dispute withdrawn · ${fmtUsd(fee)} back to charged`, {
              kind: 'refile',
              crossingId: action.crossingId,
              reason: record.reason,
            })
          : toast('Dispute withdrawn'),
      };
    }
    case 'UNDO_TOAST': {
      const undo = state.toast?.undo;
      if (undo == null) {
        return state;
      }
      if (undo.kind === 'withdraw') {
        // Undo of a filing: dispute popped, every derived figure reverts.
        return {
          ...state,
          disputes: state.disputes.filter(item => item.crossingId !== undo.crossingId),
          toast: toast('Dispute withdrawn'),
        };
      }
      // Undo of a withdrawal: re-file the same dispute.
      const fee = CROSSING_INDEX[undo.crossingId].crossing.feeCents;
      return {
        ...state,
        disputes: [
          ...state.disputes,
          {crossingId: undo.crossingId, reason: undo.reason, filedLabel: 'Filed today'},
        ],
        toast: toast(`Dispute re-filed · ${fmtUsd(fee)} moved to pending`),
      };
    }
    case 'OPEN_EXPORT':
      return {...state, sheet: {kind: 'export'}, sheetDetent: 'medium', openSwipeRowId: null};
    case 'OPEN_ACTION':
      return {...state, sheet: {kind: 'action', crossingId: action.crossingId}, openSwipeRowId: null};
    case 'CLOSE_SHEET':
      return {...state, sheet: null};
    case 'TOGGLE_DETENT':
      return {...state, sheetDetent: state.sheetDetent === 'medium' ? 'large' : 'medium'};
    case 'SET_FORMAT':
      return {...state, exportFormat: action.format};
    case 'SHOW_ALL_LINES':
      return {...state, exportShowAll: true, toast: toast(`${action.loadedCount} more loaded`)};
    case 'EXPORT_PRESSED':
      // Fixed string, no clock, no download — the announcement IS the demo.
      return {
        ...state,
        toast: toast(`June_2026.${state.exportFormat} ready · ${action.count} line items`),
      };
    case 'COPY_DETAILS': {
      const {trip, crossing} = CROSSING_INDEX[action.crossingId];
      return {
        ...state,
        sheet: null,
        toast: toast(`Copied · ${crossing.plaza} ${trip.dateShort} ${fmtUsd(crossing.feeCents)}`),
      };
    }
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// DERIVED MATH — pure functions over TRIPS + disputes; the header split,
// stackbar slices, tab badge, and export count all flow from these.
// ---------------------------------------------------------------------------

function tripTollsCents(trip: Trip): number {
  return trip.crossings.reduce((sum, crossing) => sum + crossing.feeCents, 0);
}

function tripFuelCents(trip: Trip): number {
  return trip.miles * RATE_PER_MI_FUEL_CENTS;
}

function tripTotalCents(trip: Trip): number {
  return tripTollsCents(trip) + tripFuelCents(trip) + trip.parkingCents;
}

function tripDisputedCents(trip: Trip, disputedIds: ReadonlySet<string>): number {
  return trip.crossings.reduce(
    (sum, crossing) => sum + (disputedIds.has(crossing.id) ? crossing.feeCents : 0),
    0,
  );
}

const MONTH_TOLLS_CENTS = TRIPS.reduce((sum, trip) => sum + tripTollsCents(trip), 0); // 7800
const MONTH_CROSSINGS = TRIPS.reduce((sum, trip) => sum + trip.crossings.length, 0); // 34
const MONTH_MILES = TRIPS.reduce((sum, trip) => sum + trip.miles, 0); // 405

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

/** Nearest scrollable ancestor (the demo's .preview-wrap scrolls the page). */
function getScrollParent(element: HTMLElement | null): HTMLElement {
  let node = element?.parentElement ?? null;
  while (node != null) {
    const overflowY = window.getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
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
// BRAND MARK — 24px Gantry arch mark: an arch whose left leg curls into a
// G. Stroke uses BRAND_ACCENT (never var(--color-text)).
// ---------------------------------------------------------------------------

function GantryMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 20v-7a8 8 0 0 1 16 0v7"
          stroke={BRAND_ACCENT}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path
          d="M4 20v-4h4"
          stroke={BRAND_ACCENT}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// ARCH GLYPH — 20×24 plaza arch (two legs + curve), currentColor.
// ---------------------------------------------------------------------------

function ArchGlyph() {
  return (
    <svg width={20} height={24} viewBox="0 0 20 24" fill="none" aria-hidden>
      <path
        d="M3 22V11a7 7 0 0 1 14 0v11"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ROUTE RIBBON — 88px scrubable plaza strip. Arches positioned at
// calc(16px + (mile / tripMiles) · (100% − 32px)); same-mile crossings
// stack into ONE 44×44 button with a ×2 chip (tap cycles the pair). Scrub
// (pointerdown+move) and the per-arch buttons are tap parity; the container
// itself is a role='slider' with ArrowLeft/Right + Home/End as keyboard
// parity — belt and suspenders per the a11y plan.
// ---------------------------------------------------------------------------

interface ArchGroup {
  key: string;
  mile: number;
  frac: number;
  crossings: Crossing[];
}

function buildArchGroups(trip: Trip): ArchGroup[] {
  const byMile = new Map<number, Crossing[]>();
  for (const crossing of trip.crossings) {
    const list = byMile.get(crossing.mile) ?? [];
    list.push(crossing);
    byMile.set(crossing.mile, list);
  }
  return [...byMile.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([mile, crossings]) => ({
      key: `${trip.id}-mm${mile}`,
      mile,
      frac: mile / trip.miles,
      crossings,
    }));
}

interface RouteRibbonProps {
  trip: Trip;
  disputedIds: ReadonlySet<string>;
  activeCrossingId: string | null;
  shellWidth: number;
  onActivate: (crossingId: string) => void;
}

function RouteRibbon({trip, disputedIds, activeCrossingId, shellWidth, onActivate}: RouteRibbonProps) {
  const ribbonRef = useRef<HTMLDivElement | null>(null);
  const scrubbing = useRef(false);
  const groups = buildArchGroups(trip);
  const crossings = trip.crossings;
  const activeIndex = crossings.findIndex(crossing => crossing.id === activeCrossingId);
  const active = activeIndex >= 0 ? crossings[activeIndex] : null;
  const tolls = tripTollsCents(trip);
  // Running subtotal: fees at-or-left-of the active arch.
  const subtotal =
    active == null
      ? 0
      : crossings.reduce((sum, crossing) => sum + (crossing.mile <= active.mile ? crossing.feeCents : 0), 0);

  // Resting-bubble collision (deterministic layout math, no per-frame
  // measurement): estimated lane width = shell − 16·2 gutter − 2 border −
  // 16·2 ribbon margin − 32 lane inset. Bubbles hide below 340px container
  // width when the nearest neighbor arch lands closer than 44px.
  const laneWidth = Math.max(120, (shellWidth || 390) - 98);
  const narrow = (shellWidth || 390) <= 340;
  const hideBubble = (index: number): boolean => {
    if (!narrow) return false;
    const px = groups[index].frac * laneWidth;
    const prev = index > 0 ? groups[index - 1].frac * laneWidth : -Infinity;
    const next = index < groups.length - 1 ? groups[index + 1].frac * laneWidth : Infinity;
    return px - prev < 44 || next - px < 44;
  };

  const activateFromClientX = (clientX: number) => {
    const rect = ribbonRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return;
    const frac = Math.min(1, Math.max(0, (clientX - rect.left - 16) / (rect.width - 32)));
    let best = crossings[0];
    let bestDist = Infinity;
    for (const crossing of crossings) {
      const dist = Math.abs(crossing.mile / trip.miles - frac);
      if (dist < bestDist) {
        bestDist = dist;
        best = crossing;
      }
    }
    if (best.id !== activeCrossingId) {
      onActivate(best.id);
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Arch buttons handle their own clicks; scrub starts on the lane.
    if ((event.target as HTMLElement).closest('button') != null) return;
    scrubbing.current = true;
    ribbonRef.current?.setPointerCapture(event.pointerId);
    activateFromClientX(event.clientX);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!scrubbing.current) return;
    activateFromClientX(event.clientX);
  };
  const onPointerUp = () => {
    scrubbing.current = false;
  };

  const step = (delta: number) => {
    const nextIndex = Math.min(crossings.length - 1, Math.max(0, (activeIndex < 0 ? 0 : activeIndex) + delta));
    onActivate(crossings[nextIndex].id);
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(activeIndex < 0 ? 0 : -1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(activeIndex < 0 ? 0 : 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      onActivate(crossings[0].id);
    } else if (event.key === 'End') {
      event.preventDefault();
      onActivate(crossings[crossings.length - 1].id);
    }
  };

  const valueText =
    active == null
      ? `No crossing selected of ${crossings.length}`
      : `${active.plaza}, ${fmtUsd(active.feeCents)}, crossing ${activeIndex + 1} of ${crossings.length}`;

  // Express strips: from the previous crossing's mile (or trip start) to
  // each express crossing's mile — static hatch, reduced-motion safe.
  const expressStrips = crossings
    .map((crossing, index) => ({crossing, index}))
    .filter(({crossing}) => crossing.express)
    .map(({crossing, index}) => {
      const fromFrac = index > 0 ? crossings[index - 1].mile / trip.miles : 0;
      const toFrac = crossing.mile / trip.miles;
      return {id: crossing.id, fromFrac, toFrac};
    });

  const activeFrac = active == null ? 0 : active.mile / trip.miles;

  return (
    <div
      ref={ribbonRef}
      style={styles.ribbon}
      role="slider"
      tabIndex={0}
      className="gtr-focusable"
      aria-label={`Route ribbon, ${trip.route}`}
      aria-orientation="horizontal"
      aria-valuemin={1}
      aria-valuemax={crossings.length}
      aria-valuenow={activeIndex < 0 ? 1 : activeIndex + 1}
      aria-valuetext={valueText}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}>
      <div style={styles.ribbonLane} aria-hidden />
      {expressStrips.map(strip => (
        <div
          key={strip.id}
          aria-hidden
          style={{
            ...styles.expressStrip,
            // Positions are percentages of the inset lane (no 390
            // literals): strips stay inside [16px, 100% − 16px].
            left: `calc(16px + (100% - 32px) * ${strip.fromFrac.toFixed(4)})`,
            width: `calc((100% - 32px) * ${(strip.toFrac - strip.fromFrac).toFixed(4)})`,
          }}>
          <div style={styles.expressHatch} />
        </div>
      ))}
      {groups.map((group, groupIndex) => {
        const isStacked = group.crossings.length > 1;
        const activeInGroup = group.crossings.findIndex(crossing => crossing.id === activeCrossingId);
        const isActive = activeInGroup >= 0;
        const lead = group.crossings[0];
        const disputedInGroup = group.crossings.some(crossing => disputedIds.has(crossing.id));
        const label = isStacked
          ? `${lead.plaza}, ${group.crossings.length} crossings at mile ${group.mile} — cycle`
          : `Jump to ${lead.plaza}, ${fmtUsd(lead.feeCents)}`;
        const bubbleFee = isStacked
          ? fmtUsd(group.crossings.reduce((sum, crossing) => sum + crossing.feeCents, 0))
          : fmtUsd(lead.feeCents);
        return (
          <div key={group.key}>
            {!hideBubble(groupIndex) && (
              <span
                style={{
                  ...styles.feeBubble,
                  ...(disputedInGroup ? styles.feeBubbleDisputed : null),
                  left: `calc(16px + (100% - 32px) * ${group.frac.toFixed(4)})`,
                  transform: `translateX(-${(group.frac * 100).toFixed(1)}%)`,
                }}
                aria-hidden>
                {bubbleFee}
              </span>
            )}
            <button
              type="button"
              className="gtr-btn gtr-focusable"
              style={{
                ...styles.archBtn,
                ...(isActive ? styles.archBtnActive : null),
                left: `calc(16px + (100% - 32px) * ${group.frac.toFixed(4)})`,
              }}
              aria-label={label}
              onClick={() => {
                // Stacked pair: tap cycles through the co-located crossings.
                const nextInGroup = isStacked
                  ? group.crossings[(activeInGroup + 1) % group.crossings.length]
                  : lead;
                onActivate(nextInGroup.id);
              }}>
              <ArchGlyph />
              {isStacked ? (
                <span style={styles.stackChip} aria-hidden>
                  ×{group.crossings.length}
                </span>
              ) : null}
            </button>
          </div>
        );
      })}
      {active != null ? (
        <div
          style={{
            ...styles.inflatedBubble,
            left: `calc(16px + (100% - 32px) * ${activeFrac.toFixed(4)})`,
            // translateX(−frac·100%) clamps the card inside the ribbon at
            // both ends — never overflows the shell.
            transform: `translateX(-${(activeFrac * 100).toFixed(1)}%)`,
          }}
          aria-hidden>
          <span style={styles.inflatedTitle}>{active.plaza}</span>
          <span style={styles.inflatedMeta}>
            {active.time} · MM {active.mile}
          </span>
          <span style={styles.inflatedMeta}>Class 1 · {fmtUsd(active.feeCents)}</span>
        </div>
      ) : null}
      {active != null ? (
        <span style={styles.subtotalChip} aria-hidden>
          {fmtUsd(subtotal)} of {fmtUsd(tolls)}
        </span>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TRIP COST STACKBAR — 72px block, pure derived render (no own state).
// Tolls (expected) in BRAND_ACCENT, fuel-est teal, parking amber; a 2px
// SEAM notch at the expected-tolls position when charged ≠ expected; the
// disputed fee's width is SUBTRACTED from the toll segment and re-rendered
// as a detached dashed slice 4px right of the bar end — money in escrow.
// ---------------------------------------------------------------------------

interface TripCostStackbarProps {
  trip: Trip;
  disputedIds: ReadonlySet<string>;
}

function TripCostStackbar({trip, disputedIds}: TripCostStackbarProps) {
  const charged = tripTollsCents(trip);
  const disputed = tripDisputedCents(trip, disputedIds);
  const expected = charged - disputed;
  const fuel = tripFuelCents(trip);
  const parking = trip.parkingCents;
  const total = tripTotalCents(trip);
  const hasDelta = disputed > 0;
  const barCents = expected + fuel + parking;
  const pct = (cents: number) => (cents / total) * 100;
  const legend =
    `● Tolls ${fmtUsd(expected)} · ● Fuel est ${fmtUsd(fuel)}` +
    (parking > 0 ? ` · ● Parking ${fmtUsd(parking)}` : '') +
    (hasDelta ? ` · ◌ Pending ${fmtUsd(disputed)}` : '');
  return (
    <figure
      style={{...styles.stackbarBlock, margin: 0}}
      aria-label={`Trip cost ${fmtUsd(total)}. ${legend.replace(/[●◌] /g, '')}`}>
      <div style={styles.stackbarHeader}>
        <span>Trip cost {fmtUsd(total)}</span>
        {hasDelta ? (
          <span style={styles.stackbarDelta}>
            charged {fmtUsd(charged)} · expected {fmtUsd(expected)}
          </span>
        ) : null}
      </div>
      <div style={styles.stackbarRail}>
        <div
          style={{
            ...styles.stackbar,
            flex: 'none',
            width: `${pct(barCents).toFixed(2)}%`,
            borderRadius: 6, // 6px outer ends, 0 between segments
            overflow: 'hidden',
          }}>
          <span
            style={{flexGrow: expected, minWidth: 4, background: BRAND_ACCENT}}
            aria-hidden
          />
          <span style={{flexGrow: fuel, minWidth: 4, background: FUEL_FILL}} aria-hidden />
          {parking > 0 ? (
            <span style={{flexGrow: parking, minWidth: 4, background: PARKING_FILL}} aria-hidden />
          ) : null}
          {hasDelta ? (
            // Reconcile seam — 2px notch at the expected-tolls boundary.
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 2,
                left: `${((expected / barCents) * 100).toFixed(2)}%`,
                background: SEAM,
              }}
            />
          ) : null}
        </div>
        {hasDelta ? (
          <span
            style={{...styles.escrowSlice, width: `max(8px, ${pct(disputed).toFixed(2)}%)`}}
            aria-hidden
          />
        ) : null}
      </div>
      <figcaption style={styles.stackbarLegend}>
        <span style={{color: BRAND_ACCENT}}>●</span> Tolls {fmtUsd(expected)} ·{' '}
        <span style={{color: FUEL_FILL}}>●</span> Fuel est {fmtUsd(fuel)}
        {parking > 0 ? (
          <>
            {' '}
            · <span style={{color: PARKING_FILL}}>●</span> Parking {fmtUsd(parking)}
          </>
        ) : null}
        {hasDelta ? (
          <>
            {' '}
            · <span style={{color: BRAND_ACCENT}}>◌</span> Pending {fmtUsd(disputed)}
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// DISPUTE FLAG ROW — 60px crossing row. Whole-row primary button (ribbon
// jump) + trailing 44×44 ellipsis (≥8px clearance after the fee). Swipe
// left snaps open a 72px Dispute block at −72px; releasing past −120px
// files IMMEDIATELY (reversible → no confirm). Disputed rest state (3px
// stripe, dashed pending pill, '· Disputed') lives in recapStore, so it
// survives every re-render.
// ---------------------------------------------------------------------------

interface DisputeFlagRowProps {
  crossing: Crossing;
  disputed: boolean;
  isSwipeOpen: boolean;
  isActive: boolean;
  rowRef: (node: HTMLDivElement | null) => void;
  onJump: () => void;
  onOpenMenu: (opener: HTMLElement) => void;
  onFile: () => void;
  onSetSwipe: (open: boolean) => void;
}

function DisputeFlagRow({
  crossing,
  disputed,
  isSwipeOpen,
  isActive,
  rowRef,
  onJump,
  onOpenMenu,
  onFile,
  onSetSwipe,
}: DisputeFlagRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startX = useRef(0);
  const pointerActive = useRef(false);

  const baseX = isSwipeOpen ? -72 : 0;
  const translate = dragX ?? baseX;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disputed) return; // disputed rows act through the ellipsis menu
    pointerActive.current = true;
    startX.current = event.clientX - baseX;
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerActive.current) return;
    const delta = event.clientX - startX.current;
    if (dragX == null && Math.abs(delta - baseX) < 6) return; // tap slop
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragX(Math.min(0, Math.max(-140, delta)));
  };
  const endDrag = () => {
    pointerActive.current = false;
    if (dragX == null) return;
    if (dragX < -120) {
      onFile(); // released past the snap: file immediately + Undo toast
    } else if (dragX < -36) {
      onSetSwipe(true);
    } else {
      onSetSwipe(false);
    }
    setDragX(null);
  };

  const secondary = `${crossing.time} · MM ${crossing.mile} · Class 1 · ${fmtUsd(crossing.feeCents)}/crossing${disputed ? ' · Disputed' : ''}`;

  return (
    <div style={styles.crossingOuter} ref={rowRef}>
      {!disputed ? (
        <button
          type="button"
          className="gtr-btn gtr-focusable"
          style={styles.disputeBlock}
          tabIndex={isSwipeOpen ? 0 : -1}
          aria-hidden={!isSwipeOpen}
          aria-label={`Dispute ${crossing.plaza} crossing, ${fmtUsd(crossing.feeCents)}`}
          onClick={onFile}>
          <Icon icon={FlagIcon} size="sm" color="inherit" />
          Dispute
        </button>
      ) : null}
      <div
        className="gtr-anim"
        style={{
          ...styles.crossingContent,
          transform: translate === 0 ? undefined : `translateX(${translate}px)`,
          transition: dragX != null ? 'none' : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}>
        {disputed ? <span style={styles.disputeStripe} aria-hidden /> : null}
        <button
          type="button"
          className="gtr-btn gtr-focusable"
          style={styles.crossingRowBtn}
          aria-label={`${crossing.plaza}, ${fmtUsd(crossing.feeCents)}, ${crossing.time}`}
          aria-current={isActive ? 'true' : undefined}
          onClick={onJump}>
          <span style={styles.crossingText}>
            <span style={{...styles.crossingPrimary, ...(isActive ? {color: BRAND_ACCENT} : null)}}>
              {crossing.plaza}
            </span>
            <span style={styles.crossingSecondary}>{secondary}</span>
          </span>
          {disputed ? (
            <span style={styles.pendingPill}>{fmtUsd(crossing.feeCents)} pending</span>
          ) : (
            <span style={styles.crossingFee}>{fmtUsd(crossing.feeCents)}</span>
          )}
        </button>
        <button
          type="button"
          className="gtr-btn gtr-focusable"
          style={{...styles.iconBtn, flexShrink: 0}}
          aria-label={`Actions for ${crossing.plaza} crossing`}
          aria-haspopup="dialog"
          onClick={event => onOpenMenu(event.currentTarget)}>
          <Icon icon={MoreHorizontalIcon} size="sm" color="inherit" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EXPORT SHEET — two detents (medium 55% / large calc(100% − 56px)),
// grabber as a real resize <button>, format radiogroup, date-range utility
// row, line-item preview with loadMoreRow (infinite scroll is banned), and
// a sticky 48px footer whose count is LIVE-derived (34 − disputedCount).
// ---------------------------------------------------------------------------

interface ExportSheetProps {
  detent: 'medium' | 'large';
  format: 'csv' | 'pdf';
  showAll: boolean;
  lineItems: Array<{id: string; label: string; feeCents: number}>;
  reducedMotion: boolean;
  onToggleDetent: () => void;
  onSetFormat: (format: 'csv' | 'pdf') => void;
  onShowAll: () => void;
  onExport: () => void;
  onClose: () => void;
  grabberRef: RefObject<HTMLButtonElement | null>;
  firstNewRowRef: RefObject<HTMLDivElement | null>;
}

function ExportSheet({
  detent,
  format,
  showAll,
  lineItems,
  reducedMotion,
  onToggleDetent,
  onSetFormat,
  onShowAll,
  onExport,
  onClose,
  grabberRef,
  firstNewRowRef,
}: ExportSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragLastY = useRef(0);
  const shown = showAll ? lineItems : lineItems.slice(0, EXPORT_PREVIEW_COUNT);
  const moreCount = lineItems.length - EXPORT_PREVIEW_COUNT;

  // Grabber drag is optional garnish; the grabber CLICK is the contract.
  const onGrabPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartY.current = event.clientY;
    dragLastY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onGrabPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartY.current != null) {
      dragLastY.current = event.clientY;
    }
  };
  const onGrabPointerUp = () => {
    if (dragStartY.current == null) return;
    const delta = dragLastY.current - dragStartY.current;
    dragStartY.current = null;
    if (delta > 120 && detent === 'medium') {
      onClose(); // >120px down past medium closes
    } else if (delta > 60 && detent === 'large') {
      onToggleDetent();
    } else if (delta < -60 && detent === 'medium') {
      onToggleDetent();
    }
  };

  const onFormatKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      onSetFormat(format === 'csv' ? 'pdf' : 'csv');
    }
  };

  return (
    <>
      <div style={styles.sheetScrim} onClick={onClose} aria-hidden />
      <div
        ref={sheetRef}
        className={reducedMotion ? undefined : 'gtr-sheet-in'}
        style={{
          ...styles.sheet,
          height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Export June"
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
          }
          trapTabKey(event, sheetRef.current);
        }}>
        <div
          style={styles.grabberZone}
          onPointerDown={onGrabPointerDown}
          onPointerMove={onGrabPointerMove}
          onPointerUp={onGrabPointerUp}
          onPointerCancel={onGrabPointerUp}>
          <button
            ref={grabberRef}
            type="button"
            className="gtr-btn gtr-focusable"
            aria-label="Resize sheet"
            aria-expanded={detent === 'large'}
            style={{padding: '8px 24px', borderRadius: 999}}
            onClick={onToggleDetent}>
            <span style={styles.grabberPill} />
          </button>
        </div>
        <div style={styles.sheetHeader}>
          <span />
          <h2 style={styles.sheetTitle}>Export June</h2>
          <button
            type="button"
            className="gtr-btn gtr-focusable"
            style={styles.iconBtn}
            aria-label="Close export sheet"
            onClick={onClose}>
            <Icon icon={XIcon} size="sm" color="inherit" />
          </button>
        </div>
        <div style={styles.sheetBody}>
          <div style={styles.segTrack} role="radiogroup" aria-label="Export format" onKeyDown={onFormatKeyDown}>
            {(['csv', 'pdf'] as const).map(option => {
              const isActive = format === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  tabIndex={isActive ? 0 : -1}
                  className="gtr-btn gtr-focusable"
                  style={isActive ? {...styles.segItem, ...styles.segItemActive} : styles.segItem}
                  onClick={() => onSetFormat(option)}>
                  {option.toUpperCase()}
                </button>
              );
            })}
          </div>
          <div style={styles.sheetCard}>
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Date range</span>
              <span style={styles.utilityValue}>Jun 1 – Jun 30, 2026</span>
            </div>
          </div>
          <div style={styles.sheetCard}>
            {shown.map((item, index) => (
              <div
                key={item.id}
                ref={index === EXPORT_PREVIEW_COUNT ? firstNewRowRef : undefined}
                tabIndex={index === EXPORT_PREVIEW_COUNT ? -1 : undefined}
                className={index === EXPORT_PREVIEW_COUNT ? 'gtr-focusable' : undefined}
                style={{
                  ...styles.lineItemRow,
                  ...(index > 0 ? {borderTop: '1px solid var(--color-border)'} : null),
                }}>
                <span style={styles.lineItemLabel}>{item.label}</span>
                <span style={{fontVariantNumeric: 'tabular-nums'}}>{fmtUsd(item.feeCents)}</span>
              </div>
            ))}
            {!showAll && moreCount > 0 ? (
              <button
                type="button"
                className="gtr-btn gtr-focusable"
                style={styles.loadMoreRow}
                onClick={onShowAll}>
                Show {moreCount} more
              </button>
            ) : null}
          </div>
          {showAll ? (
            <div style={styles.sheetCaption}>All {lineItems.length} line items</div>
          ) : null}
        </div>
        <div style={styles.sheetFooter}>
          <button type="button" className="gtr-btn gtr-focusable" style={styles.sheetConfirmBtn} onClick={onExport}>
            Export {lineItems.length} line items
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — the ⋯ verb picker (gesture parity for the swipe). Two
// cards 8px apart; centered no-icon rows; dispute rows are NOT destructive
// (reversible → executes immediately + Undo toast, never a confirm). Focus
// opens on Cancel — the safe default.
// ---------------------------------------------------------------------------

interface ActionSheetOverlayProps {
  crossingId: string;
  disputed: boolean;
  reducedMotion: boolean;
  cancelRef: RefObject<HTMLButtonElement | null>;
  onFile: (reason: string) => void;
  onWithdraw: () => void;
  onCopy: () => void;
  onClose: () => void;
}

function ActionSheetOverlay({
  crossingId,
  disputed,
  reducedMotion,
  cancelRef,
  onFile,
  onWithdraw,
  onCopy,
  onClose,
}: ActionSheetOverlayProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const {crossing} = CROSSING_INDEX[crossingId];
  const context = `Crossing at ${crossing.plaza} · ${fmtUsd(crossing.feeCents)}`;
  const rows = disputed
    ? [
        {id: 'withdraw', label: 'Withdraw dispute', onPick: onWithdraw},
        {id: 'copy', label: 'Copy crossing details', onPick: onCopy},
      ]
    : [
        {id: 'dup', label: 'Dispute duplicate charge', onPick: () => onFile('Duplicate charge')},
        {id: 'class', label: 'Dispute wrong vehicle class', onPick: () => onFile('Wrong vehicle class')},
        {id: 'copy', label: 'Copy crossing details', onPick: onCopy},
      ];
  return (
    <>
      <div style={styles.sheetScrim} onClick={onClose} aria-hidden />
      <div
        ref={rootRef}
        className={reducedMotion ? undefined : 'gtr-sheet-in'}
        style={styles.actionSheet}
        role="dialog"
        aria-modal="true"
        aria-label={context}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose();
          }
          trapTabKey(event, rootRef.current);
        }}>
        <div style={styles.actionCard}>
          <div style={styles.actionContext}>{context}</div>
          {rows.map((row, index) => (
            <div key={row.id}>
              {index > 0 ? <div style={styles.actionRowDivider} /> : null}
              <button
                type="button"
                className="gtr-btn gtr-focusable"
                style={styles.actionSheetRow}
                onClick={row.onPick}>
                {row.label}
              </button>
            </div>
          ))}
        </div>
        <div style={styles.actionCard}>
          <button
            ref={cancelRef}
            type="button"
            className="gtr-btn gtr-focusable"
            style={styles.actionCancelRow}
            onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Gantry · June Trips Toll Recap.
//
// SKELETON NOTE (spec stress fixture 6): the recap is a statement, not a
// feed — there is no refresh verb, so no skeleton state is user-reachable.
// Skeletons are therefore OMITTED (legal: skeleton must be reachable or
// skipped) and every state ships in fixtures.
//
// 320px SCREENSHOT CHECKLIST (spec stress fixture 7): T4's ribbon (5
// arches incl. the MM18 ×2 stack; closest distinct pair ≥44px at 288px
// content width), the summary 3-stat row wrapping 2+1, and the export
// sheet at medium detent all render without horizontal overflow.
// ---------------------------------------------------------------------------

const TAB_META: Array<{id: TabId; label: string; icon: typeof RouteIcon}> = [
  {id: 'trips', label: 'Trips', icon: RouteIcon},
  {id: 'disputes', label: 'Disputes', icon: FlagIcon},
  {id: 'passes', label: 'Passes', icon: CreditCardIcon},
  {id: 'export', label: 'Export', icon: DownloadIcon},
];

export default function MobileTollTripRecapPage() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const grabberRef = useRef<HTMLButtonElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const firstNewRowRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const pendingRevealRef = useRef<string | null>(null);
  const pendingFocusNewRef = useRef(false);
  const prevSheetKindRef = useRef<string | null>(null);
  const prevTabRef = useRef<TabId>('trips');

  const containerWidth = useElementWidth(wrapRef);
  const isDesktop = containerWidth >= 720;
  const shellWidth = containerWidth === 0 ? 390 : isDesktop ? 430 : containerWidth;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [titleShown, setTitleShown] = useState(false);
  const [state, dispatch] = useReducer(recapReducer, INITIAL_STATE);

  // DERIVED CASCADE — every figure recomputes from disputes at render.
  const disputedIds = new Set(state.disputes.map(record => record.crossingId));
  const pendingCents = state.disputes.reduce(
    (sum, record) => sum + CROSSING_INDEX[record.crossingId].crossing.feeCents,
    0,
  );
  const chargedCents = MONTH_TOLLS_CENTS - pendingCents; // 7375 initially ✓
  const exportItems = LINE_ITEMS.filter(item => !disputedIds.has(item.id)); // 32 initially ✓
  const disputeCount = state.disputes.length;

  // navBar title fade — IntersectionObserver sentinel under the largeTitle
  // row; opacity-only swap (instant under reduced motion via .gtr-fade).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry != null) {
          setTitleShown(!entry.isIntersecting && entry.boundingClientRect.top < 60);
        }
      },
      {rootMargin: '-60px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Per-tab scroll restore (persistence law: switching tabs never resets).
  useEffect(() => {
    if (prevTabRef.current !== state.activeTab) {
      prevTabRef.current = state.activeTab;
      const scroller = getScrollParent(shellRef.current);
      scroller.scrollTop = state.scrollTopByTab[state.activeTab] ?? 0;
    }
  }, [state.activeTab, state.scrollTopByTab]);

  // Disputes-tab jump: scroll the revealed crossing row into view.
  useEffect(() => {
    const pending = pendingRevealRef.current;
    if (pending != null && state.activeTab === 'trips') {
      pendingRevealRef.current = null;
      const node = rowRefs.current.get(pending);
      node?.scrollIntoView({block: 'center', behavior: 'auto'});
    }
  }, [state.activeTab, state.activeCrossingId]);

  // Sheet focus management: into the sheet on open (preventScroll — plain
  // .focus() would scroll-reveal the animating sheet inside the locked
  // column, per the amendment), back to the opener on every close path.
  useEffect(() => {
    const kind = state.sheet?.kind ?? null;
    const prevKind = prevSheetKindRef.current;
    prevSheetKindRef.current = kind;
    if (kind != null && kind !== prevKind) {
      const target = kind === 'action' ? actionCancelRef.current : grabberRef.current;
      target?.focus({preventScroll: true});
    } else if (kind == null && prevKind != null) {
      lastFocusRef.current?.focus({preventScroll: true});
    }
  }, [state.sheet]);

  // loadMoreRow: focus the first appended line item.
  useEffect(() => {
    if (state.exportShowAll && pendingFocusNewRef.current) {
      pendingFocusNewRef.current = false;
      firstNewRowRef.current?.focus({preventScroll: true});
    }
  }, [state.exportShowAll]);

  const selectTab = (tab: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (tab === state.activeTab) {
      // The ONE legal reset: re-tapping the active tab scrolls to top.
      scroller.scrollTop = 0;
      return;
    }
    dispatch({type: 'SET_TAB', tab, prevScrollTop: scroller.scrollTop});
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TAB_META.findIndex(tab => tab.id === state.activeTab);
    const nextIndex =
      (index + (event.key === 'ArrowRight' ? 1 : TAB_META.length - 1)) % TAB_META.length;
    selectTab(TAB_META[nextIndex].id);
    document.getElementById(`gtr-tab-${TAB_META[nextIndex].id}`)?.focus();
  };

  const openExport = (opener: HTMLElement) => {
    lastFocusRef.current = opener;
    dispatch({type: 'OPEN_EXPORT'});
  };
  const openAction = (crossingId: string, opener: HTMLElement) => {
    lastFocusRef.current = opener;
    dispatch({type: 'OPEN_ACTION', crossingId});
  };
  const revealCrossing = (crossingId: string) => {
    pendingRevealRef.current = crossingId;
    const scroller = getScrollParent(shellRef.current);
    dispatch({type: 'REVEAL_CROSSING', crossingId, prevScrollTop: scroller.scrollTop});
  };

  const sheetOpen = state.sheet != null;
  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktop ? styles.shellDesktop : null),
    ...(sheetOpen ? styles.shellLocked : null),
  };

  // ------------------------------------------------------------------ TRIPS
  const tripsScreen = (
    <>
      <section aria-labelledby="gtr-summary-heading">
        <div style={styles.summaryCard}>
          <h2 id="gtr-summary-heading" style={{...styles.overline, margin: 0}}>
            June tolls
          </h2>
          <div style={styles.heroFigure}>{fmtUsd(MONTH_TOLLS_CENTS)}</div>
          <div style={styles.splitLine}>
            {fmtUsd(chargedCents)} charged ·{' '}
            <span style={styles.pendingFigure}>
              {fmtUsd(pendingCents)} pending ({disputeCount} dispute{disputeCount === 1 ? '' : 's'})
            </span>
          </div>
          {/* 3-stat row — 44px cells; flexWrap gives the 2+1 wrap <350px. */}
          <div style={styles.statRow}>
            <div style={styles.statCell}>
              <span style={styles.statValue}>{TRIPS.length} trips</span>
              <span style={styles.statLabel}>This month</span>
            </div>
            <div style={styles.statCell}>
              <span style={styles.statValue}>{MONTH_CROSSINGS} crossings</span>
              <span style={styles.statLabel}>Gantries passed</span>
            </div>
            <div style={styles.statCell}>
              <span style={styles.statValue}>{MONTH_MILES} mi</span>
              <span style={styles.statLabel}>Tolled miles</span>
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="gtr-ledger-heading">
        <h2 id="gtr-ledger-heading" style={styles.sectionHeader}>
          Trip ledger
        </h2>
        <div style={styles.tripStack}>
          {TRIPS.map(trip => {
            const isExpanded = state.expandedTripIds.includes(trip.id);
            const total = tripTotalCents(trip);
            return (
              <article key={trip.id} style={styles.listCard}>
                <button
                  type="button"
                  className="gtr-btn gtr-focusable"
                  style={{...styles.tripHeaderRow, width: '100%'}}
                  aria-expanded={isExpanded}
                  onClick={() => dispatch({type: 'TOGGLE_TRIP', tripId: trip.id})}>
                  <span style={styles.tripHeaderText}>
                    <h3 style={styles.tripRoute}>{trip.route}</h3>
                    <span style={styles.tripMeta}>
                      {trip.dateLabel} · {trip.crossings.length} crossings · {trip.miles} mi
                    </span>
                  </span>
                  <span style={styles.tripTotal}>{fmtUsd(total)}</span>
                  <span
                    className="gtr-anim"
                    style={{
                      ...styles.chevron,
                      transform: isExpanded ? 'rotate(180deg)' : undefined,
                    }}>
                    <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                  </span>
                </button>
                {isExpanded ? (
                  <>
                    <div style={styles.rowDivider} />
                    <RouteRibbon
                      trip={trip}
                      disputedIds={disputedIds}
                      activeCrossingId={state.activeCrossingId}
                      shellWidth={shellWidth}
                      onActivate={crossingId => {
                        dispatch({type: 'SET_ACTIVE_CROSSING', crossingId});
                        // behavior 'auto' during scrub per house law.
                        rowRefs.current
                          .get(crossingId)
                          ?.scrollIntoView({block: 'nearest', behavior: 'auto'});
                      }}
                    />
                    {trip.crossings.map((crossing, index) => (
                      <div key={crossing.id}>
                        {index > 0 ? <div style={styles.rowDivider} /> : null}
                        <DisputeFlagRow
                          crossing={crossing}
                          disputed={disputedIds.has(crossing.id)}
                          isSwipeOpen={state.openSwipeRowId === crossing.id}
                          isActive={state.activeCrossingId === crossing.id}
                          rowRef={node => {
                            if (node == null) {
                              rowRefs.current.delete(crossing.id);
                            } else {
                              rowRefs.current.set(crossing.id, node);
                            }
                          }}
                          onJump={() => dispatch({type: 'SET_ACTIVE_CROSSING', crossingId: crossing.id})}
                          onOpenMenu={opener => openAction(crossing.id, opener)}
                          onFile={() =>
                            dispatch({type: 'FILE_DISPUTE', crossingId: crossing.id, reason: 'Duplicate charge'})
                          }
                          onSetSwipe={open =>
                            dispatch({type: 'SET_SWIPE', crossingId: open ? crossing.id : null})
                          }
                        />
                      </div>
                    ))}
                    <div style={styles.rowDivider} />
                    <TripCostStackbar trip={trip} disputedIds={disputedIds} />
                  </>
                ) : null}
              </article>
            );
          })}
        </div>
        <div style={styles.terminalCaption}>
          All {TRIPS.length} trips · {MONTH_CROSSINGS} crossings
        </div>
      </section>
    </>
  );

  // --------------------------------------------------------------- DISPUTES
  const disputesScreen = (
    <section aria-labelledby="gtr-disputes-heading">
      <h2 id="gtr-disputes-heading" style={styles.sectionHeader}>
        Open disputes
      </h2>
      {disputeCount === 0 ? (
        // TRUE-EMPTY variant: filing lives on the crossing rows, so no
        // button here (exactly one action or none).
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={FlagOffIcon} size="lg" color="inherit" />
          </span>
          <h3 style={styles.emptyTitle}>No open disputes</h3>
          <p style={{...styles.emptyBody, margin: '4px 0 0'}}>
            Swipe a crossing or use ⋯ to file one.
          </p>
        </div>
      ) : (
        <div style={styles.listCard}>
          {state.disputes.map((record, index) => {
            const {trip, crossing} = CROSSING_INDEX[record.crossingId];
            return (
              <div key={record.crossingId}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <button
                  type="button"
                  className="gtr-btn gtr-focusable"
                  style={styles.disputeRow}
                  aria-label={`${crossing.plaza}, ${fmtUsd(crossing.feeCents)}, ${record.filedLabel}, ${record.reason} — view in trip ledger`}
                  onClick={() => revealCrossing(record.crossingId)}>
                  <span style={styles.disputeIconCircle}>
                    <Icon icon={FlagIcon} size="sm" color="inherit" />
                  </span>
                  <span style={styles.crossingText}>
                    <span style={styles.crossingPrimary}>
                      {crossing.plaza} · {fmtUsd(crossing.feeCents)}
                    </span>
                    <span style={styles.crossingSecondary}>
                      {record.filedLabel} · {record.reason} · {trip.dateShort}
                    </span>
                  </span>
                  <span style={styles.statusPill}>Under review</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );

  // ----------------------------------------------------------------- PASSES
  const passesScreen = (
    <>
      <section aria-labelledby="gtr-transponder-heading">
        <h2 id="gtr-transponder-heading" style={styles.sectionHeader}>
          Transponder
        </h2>
        <div style={styles.listCard}>
          <div style={styles.twoLineRow}>
            <span style={styles.crossingText}>
              <span style={styles.crossingPrimary}>{TRANSPONDER}</span>
              <span style={styles.crossingSecondary}>{VEHICLE} · Active</span>
            </span>
            <span style={styles.statusPill}>Active</span>
          </div>
        </div>
      </section>
      <section aria-labelledby="gtr-rates-heading">
        <h2 id="gtr-rates-heading" style={styles.sectionHeader}>
          Posted rates
        </h2>
        <div style={styles.listCard}>
          <div style={styles.utilityRow}>
            <span style={styles.utilityLabel}>Class 1 · per crossing</span>
            <span style={styles.utilityValue}>$1.25 – $4.50</span>
          </div>
          <div style={styles.rowDivider} />
          <div style={styles.utilityRow}>
            <span style={styles.utilityLabel}>Class 2 · multiplier</span>
            <span style={styles.utilityValue}>×1.5</span>
          </div>
          <div style={styles.rowDivider} />
          <div style={styles.utilityRow}>
            <span style={styles.utilityLabel}>Class 3 · multiplier</span>
            <span style={styles.utilityValue}>×2.0</span>
          </div>
        </div>
      </section>
    </>
  );

  // ----------------------------------------------------------------- EXPORT
  const exportScreen = (
    <section aria-labelledby="gtr-exports-heading">
      <h2 id="gtr-exports-heading" style={styles.sectionHeader}>
        Export history
      </h2>
      <div style={styles.listCard}>
        <div style={styles.twoLineRow}>
          <span style={styles.crossingText}>
            <span style={styles.crossingPrimary}>May 2026.csv</span>
            <span style={styles.crossingSecondary}>38 line items · Exported Jun 1</span>
          </span>
        </div>
      </div>
      <button
        type="button"
        className="gtr-btn gtr-focusable"
        style={{...styles.primaryBtn, marginTop: 12}}
        onClick={event => openExport(event.currentTarget)}>
        New export…
      </button>
    </section>
  );

  const screenByTab: Record<TabId, typeof tripsScreen> = {
    trips: tripsScreen,
    disputes: disputesScreen,
    passes: passesScreen,
    export: exportScreen,
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{GANTRY_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — 52px sticky top z20; hairline always on; center title
            fades in once the largeTitle sentinel scrolls under. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <GantryMark />
          </div>
          <span
            className="gtr-fade"
            style={{...styles.navTitle, opacity: titleShown ? 1 : 0}}
            aria-hidden={!titleShown}>
            June Trips
          </span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="gtr-btn gtr-focusable"
              style={styles.iconBtn}
              aria-label="Export June trips"
              onClick={event => openExport(event.currentTarget)}>
              <Icon icon={Share2Icon} size="sm" color="inherit" />
            </button>
          </div>
        </header>
        {/* LARGE TITLE — 52px in flow (104px total header). */}
        <div style={styles.largeTitle}>
          <h1 style={styles.h1}>June Trips</h1>
          <div style={styles.monthStepper}>
            {/* Single-month fixture: steppers stay focusable with
                aria-disabled so the label explains why (no tooltip). */}
            <button
              type="button"
              className="gtr-btn gtr-focusable"
              style={{...styles.stepBtn, ...styles.stepBtnDisabled}}
              aria-disabled="true"
              aria-label="May statement not in demo"
              onClick={() => undefined}>
              <Icon icon={ChevronLeftIcon} size="sm" color="inherit" />
            </button>
            <span style={styles.monthLabel}>{MONTH}</span>
            <button
              type="button"
              className="gtr-btn gtr-focusable"
              style={{...styles.stepBtn, ...styles.stepBtnDisabled}}
              aria-disabled="true"
              aria-label="July statement not in demo"
              onClick={() => undefined}>
              <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
            </button>
          </div>
        </div>
        <div ref={sentinelRef} style={styles.sentinel} aria-hidden />
        <main style={styles.main}>{screenByTab[state.activeTab]}</main>
        {/* TOAST DOCK — sticky-in-flow above the tabBar; THE single polite
            live region; persists until undone/replaced/screen change (no
            timers by law). */}
        <div style={styles.toastDock} aria-live="polite">
          {state.toast != null ? (
            <div style={styles.toast}>
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    className="gtr-btn gtr-focusable"
                    style={styles.toastUndo}
                    onClick={() => dispatch({type: 'UNDO_TOAST'})}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        {/* TAB BAR — exactly 64px, 4 tabs, arrow-key tablist. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Gantry sections" onKeyDown={onTabKeyDown}>
          {TAB_META.map(tab => {
            const isActive = state.activeTab === tab.id;
            const badge = tab.id === 'disputes' && disputeCount > 0 ? disputeCount : null;
            return (
              <button
                key={tab.id}
                id={`gtr-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                aria-label={tab.id === 'disputes' ? `Disputes, ${disputeCount} open` : tab.label}
                className="gtr-btn gtr-focusable"
                style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                  {badge != null ? (
                    <span style={styles.tabBadge} aria-hidden>
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span style={isActive ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
        {/* OVERLAYS — never two sheets: actionSheet triggers live under the
            export sheet layer, so stacking is impossible by construction. */}
        {state.sheet?.kind === 'export' ? (
          <ExportSheet
            detent={state.sheetDetent}
            format={state.exportFormat}
            showAll={state.exportShowAll}
            lineItems={exportItems}
            reducedMotion={reducedMotion}
            grabberRef={grabberRef}
            firstNewRowRef={firstNewRowRef}
            onToggleDetent={() => dispatch({type: 'TOGGLE_DETENT'})}
            onSetFormat={format => dispatch({type: 'SET_FORMAT', format})}
            onShowAll={() => {
              pendingFocusNewRef.current = true;
              dispatch({type: 'SHOW_ALL_LINES', loadedCount: exportItems.length - EXPORT_PREVIEW_COUNT});
            }}
            onExport={() => dispatch({type: 'EXPORT_PRESSED', count: exportItems.length})}
            onClose={() => dispatch({type: 'CLOSE_SHEET'})}
          />
        ) : null}
        {state.sheet?.kind === 'action' ? (
          <ActionSheetOverlay
            crossingId={state.sheet.crossingId}
            disputed={disputedIds.has(state.sheet.crossingId)}
            reducedMotion={reducedMotion}
            cancelRef={actionCancelRef}
            onFile={reason =>
              dispatch({
                type: 'FILE_DISPUTE',
                crossingId: (state.sheet as {kind: 'action'; crossingId: string}).crossingId,
                reason,
              })
            }
            onWithdraw={() =>
              dispatch({
                type: 'WITHDRAW',
                crossingId: (state.sheet as {kind: 'action'; crossingId: string}).crossingId,
                offerRefile: true,
              })
            }
            onCopy={() =>
              dispatch({
                type: 'COPY_DETAILS',
                crossingId: (state.sheet as {kind: 'action'; crossingId: string}).crossingId,
              })
            }
            onClose={() => dispatch({type: 'CLOSE_SHEET'})}
          />
        ) : null}
      </div>
    </div>
  );
}
