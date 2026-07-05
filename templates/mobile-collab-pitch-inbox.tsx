// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Pitchloft brand-deal inbox for
 *   creator Maya Trinh (@mayamakes), frozen on Jul 4: a five-line rate card
 *   (Reel $1,200 / TikTok $950 / Story set ×3 $400 / Static post $600 /
 *   YouTube 60s $2,500), six open pitches whose offers sum to exactly
 *   $9,700 (1750+2400+1050+1300+1500+1700), two booked deals summing to
 *   $3,600 (Fernhaven $2,200 + Loopwear $1,400), one $900 pending counter
 *   (Nimbus Audio, Jul 1), and a $9,000 monthly goal. No Date.now(), no
 *   Math.random(), no network media — monograms are id-derived color
 *   rotations, dates are fixed strings.
 * @output Pitchloft — Brand-Deal Pitch Inbox: a 390px MOBILE creator
 *   surface. 52px navBar (envelope-flap-over-coin brand mark · per-tab
 *   title · 44×44 Refresh) over a pinned 76px MonthIncomeStrip
 *   (booked/pending/goal segmented bar, rendered on ALL four tabs), a
 *   4-tab tabBar (Inbox 6 · Booked 1 · Rates · Profile), and grouped 72px
 *   pitch rows under STRONG FIT / WORTH A COUNTER / BELOW YOUR FLOOR
 *   headers, each with a 36px mini FitScoreMeter and an inline expansion
 *   (96px full meter, three 44px factor rows, OfferDeltaChip, deliverable
 *   prices, Decline/Counter/Accept). Signature move: swiping a pitch RIGHT
 *   (or its ellipsis actionSheet / expanded Counter button) opens a
 *   half-detent counter sheet pre-filled from the rate card; dragging the
 *   RateSlider live-updates the projected fit score, flips the delta chip
 *   at baseline, and appends a dashed projection segment to the pinned
 *   strip before send. Sending regroups the row into COUNTERED, restamps
 *   its chip, bumps the Booked badge, and stamps the Rates line.
 * @position Page template; emitted by `astryx template mobile-collab-pitch-inbox`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, counter sheet,
 *   actionSheet) are position:'absolute' INSIDE shell; the toast is a
 *   sticky-in-flow dock at bottom:76 (shell grows with content, so
 *   absolute-bottom would pin to the document bottom, off-viewport on tall
 *   tabs). While the sheet or actionSheet is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 68 after monograms / 16 otherwise);
 *   no desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   (Pitchloft green #0E9F6E) plus the sanctioned non-brand literals for
 *   meter segments, delta chips, strip segments, and monogram rotation —
 *   every literal is a light-dark() pair with contrast math at the
 *   declaration. Foundations amendment honored: interactive boundaries and
 *   meaningful rest fills carry explicit ≥3:1 pairs vs their ACTUAL
 *   surface (slider rest track, stepper edges, pending segment).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top:0 z20 (paddingInline 8, grid '1fr auto 1fr'); MonthIncomeStrip
 *   sticky top:52 z19, height 76 exactly = 10 padTop + 16 caption + 8 gap
 *   + 12 bar (radius 6) + 6 gap + 14 legend + 10 padBottom (sticky stack
 *   128px); 40px in-flow subtitle block; tabBar exactly 64px sticky
 *   bottom:0 z20 (4 tabItems flex:1, 24px icon + 4px gap + 11px/500
 *   label, 16px badge pills at top:-4 right:-8). ROWS: 72px pitch media
 *   rows (40px monogram, 12px radius) · 60px Booked/Rates two-line rows ·
 *   44px Profile utility rows; row padding 16 inline; sectionHeader
 *   13px/600 uppercase 0.06em at 32px, 20px top / 8px bottom. TYPE
 *   (Figtree via --font-family-body): compact 17px/600 nav titles always
 *   visible (28px large-title row unused — navBar hairline always on,
 *   noted per contract) · 17px/600 sheet titles · 16px/400 body floor ·
 *   13px meta · 11px/500 overlines; tabular-nums on every money and score
 *   numeral. Buttons: 48px sheet-footer primary · 36px inline secondary ·
 *   44×44 icon buttons. Thumb zone: primary verbs in tabBar + sheet
 *   footer; Decline is leading (never bottom-right), separated from
 *   Accept by dead space.
 *
 * Responsive contract:
 * - Author at 390, fluid 320–430: zero width:390 literals. Strip caption
 *   uses space-between with the right span ellipsizing first; pitch-row
 *   text column minWidth:0 ellipsis with the 36px meter fixed; expanded
 *   action row flexWrap rowGap 8 (Accept keeps trailing via
 *   marginLeft:auto); sheet slider fits 320 (44 + 8 + track ≥172 + 8 +
 *   44); chips are inline-flex in a wrapping row and wrap whole, never
 *   mid-number. Swipe threshold stays 72px absolute at all widths.
 * - Desktop stage (~1045px container): measured via useElementWidth on
 *   the wrapper (container width, NOT viewport) — ≥720px renders the
 *   phone experience as a centered column (maxWidth 430, marginInline
 *   auto, borderInline hairline). Sticky chrome and absolute overlays
 *   stay inside shell, so they stay inside the column.
 * - Reduced motion: sheet slide→fade, row expansion + swipe snap
 *   instant, shimmer removed, meter transitions removed — static values
 *   still encode every state.
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
  BriefcaseIcon,
  ChevronLeftIcon,
  CircleUserIcon,
  InboxIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  ReceiptIcon,
  RefreshCwIcon,
  ReplyIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math against its ACTUAL surface (white body/card ≈ #FFF; dark
// card ≈ #1C1C1E, L≈0.011).
// ---------------------------------------------------------------------------

// THE quarantined brand accent (Pitchloft green). As a FILL: #0E9F6E on the
// white body ≈ 3.4:1 (≥3:1 non-text ✓); #34D399 on the dark card ≈ 8.9:1 ✓.
const BRAND_ACCENT = 'light-dark(#0E9F6E, #34D399)';
// Brand TEXT (tab labels, legend, text buttons): #0E9F6E on white is only
// 3.4:1 (fails 4.5:1), so brand-tinted text darkens to #047857 ≈ 5.5:1 in
// light; #34D399 on dark card ≈ 8.9:1 ✓.
const BRAND_TEXT = 'light-dark(#047857, #34D399)';
// Solid brand FILL for badges, swipe block, primary buttons — spec said
// white-on-#0E9F6E, but that is 3.4:1 for 13px/600 text (fails 4.5:1), so
// the light fill darkens to #047857 (deviation, math here): #FFFFFF on
// #047857 ≈ 5.5:1 ✓; dark fill #34D399 with #064E3B text ≈ 5.1:1 ✓.
const BRAND_FILL = 'light-dark(#047857, #34D399)';
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #064E3B)';
// 12% brand wash for the active-tier/selected surfaces (decorative wash;
// the ≥3:1 information carrier on washed rows is always text or border).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// FitScoreMeter segments (non-text arcs on the card surface, ≥3:1):
// niche #0E9F6E ≈ 3.4:1 / #34D399 ≈ 8.9:1; offer #B45309 ≈ 5.0:1 /
// #FBBF24 ≈ 10.7:1; scope #1D4ED8 ≈ 6.3:1 / #93C5FD ≈ 9.3:1.
const NICHE_SEG = 'light-dark(#0E9F6E, #34D399)';
const OFFER_SEG = 'light-dark(#B45309, #FBBF24)';
const SCOPE_SEG = 'light-dark(#1D4ED8, #93C5FD)';
// Score numerals by threshold — each ≥4.5:1 vs the card in both schemes:
// ≥80 #047857 ≈ 5.5:1 / #34D399 ≈ 8.9:1; 50–79 #92400E ≈ 7.3:1 / #FBBF24
// ≈ 10.7:1; <50 #B91C1C ≈ 6.3:1 / #F87171 ≈ 6.5:1.
const SCORE_HI = 'light-dark(#047857, #34D399)';
const SCORE_MID = 'light-dark(#92400E, #FBBF24)';
const SCORE_LO = 'light-dark(#B91C1C, #F87171)';
// OfferDeltaChip fills (≥3:1 vs card) + text (≥4.5:1 vs the chip fill):
// negative: #B91C1C on #FEE2E2 ≈ 5.4:1, #FCA5A5 on #7F1D1D ≈ 5.9:1;
// positive: #047857 on #D1FAE5 ≈ 4.7:1, #6EE7B7 on #064E3B ≈ 7.2:1.
const CHIP_NEG_BG = 'light-dark(#FEE2E2, #7F1D1D)';
const CHIP_NEG_TEXT = 'light-dark(#B91C1C, #FCA5A5)';
const CHIP_POS_BG = 'light-dark(#D1FAE5, #064E3B)';
const CHIP_POS_TEXT = 'light-dark(#047857, #6EE7B7)';
// MonthIncomeStrip pending segment — spec asked for #F59E0B, but that is
// only ≈2.2:1 on the white body (fails the ≥3:1 rest-fill amendment), so
// the light side deepens to #B45309 ≈ 5.0:1 (deviation, noted); dark
// #FBBF24 ≈ 10.7:1 ✓.
const PENDING_FILL = 'light-dark(#B45309, #FBBF24)';
// Live projection segment: wash fill + 1px dashed boundary that carries
// the ≥3:1 (#047857 ≈ 5.5:1 on white; #6EE7B7 ≈ 10.3:1 on dark body).
const PROJ_FILL = 'light-dark(#A7F3D0, #065F46)';
const PROJ_EDGE = 'light-dark(#047857, #6EE7B7)';
// Goal legend dot (neutral, ≥3:1 vs body): #6B7280 ≈ 4.8:1 / #9CA3AF ≈ 6.2:1.
const GOAL_DOT = 'light-dark(#6B7280, #9CA3AF)';
// Interactive-boundary gray (foundations amendment): stepper track edges
// and the slider's UNFILLED rest track — #8A857C ≈ 3.5:1 on the white
// card; #77716A ≈ 3.1:1 on the dark card (both ≥3:1 vs actual surface).
const CONTROL_EDGE = 'light-dark(#8A857C, #77716A)';
// Slider thumb ring (white in light / card-dark in dark so the brand thumb
// reads on the sheet card in both schemes).
const THUMB_RING = 'light-dark(#FFFFFF, #1C1C1E)';
// Monogram rotation — 6 deterministic bg/text pairs, text ≥4.5:1 vs its
// own wash in both schemes (e.g. #047857 on #D1FAE5 ≈ 4.7:1, #6EE7B7 on
// #064E3B ≈ 7.2:1; #92400E on #FEF3C7 ≈ 6.8:1; #1D4ED8 on #DBEAFE ≈ 5.4:1;
// #BE185D on #FCE7F3 ≈ 5.5:1; #5B21B6 on #EDE9FE ≈ 6.9:1; #B91C1C on
// #FFE4E6 ≈ 5.2:1 — dark sides are 300-weight hues on 800/900 washes).
const MONO_BG = [
  'light-dark(#D1FAE5, #064E3B)',
  'light-dark(#FEF3C7, #78350F)',
  'light-dark(#DBEAFE, #1E3A5F)',
  'light-dark(#FCE7F3, #701A43)',
  'light-dark(#EDE9FE, #3730A3)',
  'light-dark(#FFE4E6, #7F1D1D)',
];
const MONO_TEXT = [
  'light-dark(#047857, #6EE7B7)',
  'light-dark(#92400E, #FCD34D)',
  'light-dark(#1D4ED8, #93C5FD)',
  'light-dark(#BE185D, #F9A8D4)',
  'light-dark(#5B21B6, #C4B5FD)',
  'light-dark(#B91C1C, #FDA4AF)',
];
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, range-input styling,
// the shared skeleton shimmer, and the reduced-motion guard. Transitions
// animate transform/opacity only and collapse to instant under
// prefers-reduced-motion.
// ---------------------------------------------------------------------------

const PLF_CSS = `
.plf-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.plf-btn:disabled { cursor: default; }
.plf-focusable:focus-visible {
  outline: 2px solid ${BRAND_TEXT};
  outline-offset: 2px;
}
.plf-anim { transition: transform 200ms ease, opacity 200ms ease; }
.plf-fade { transition: opacity 200ms ease; }
@keyframes plf-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.plf-sheet-in { animation: plf-sheet-in 200ms ease; }
@keyframes plf-reveal-in {
  from { transform: translateY(-4px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.plf-reveal-in { animation: plf-reveal-in 160ms ease; }
@keyframes plf-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.plf-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    color-mix(in srgb, var(--color-background-card) 65%, transparent) 50%,
    transparent 60%
  );
  animation: plf-shimmer 1.6s linear infinite;
  pointer-events: none;
}
.plf-range {
  appearance: none;
  -webkit-appearance: none;
  flex: 1;
  min-width: 156px;
  height: 44px;
  margin: 0;
  background: transparent;
}
.plf-range:focus-visible { outline: 2px solid ${BRAND_TEXT}; outline-offset: 2px; border-radius: 8px; }
.plf-range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
  background: var(--plf-track, ${CONTROL_EDGE});
}
.plf-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 28px;
  height: 28px;
  margin-top: -12px;
  border-radius: 50%;
  background: ${BRAND_FILL};
  border: 3px solid ${THUMB_RING};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}
.plf-range::-moz-range-track {
  height: 4px;
  border-radius: 2px;
  background: var(--plf-track, ${CONTROL_EDGE});
}
.plf-range::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${BRAND_FILL};
  border: 3px solid ${THUMB_RING};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}
.plf-vh {
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
  .plf-anim, .plf-fade { transition: none; }
  .plf-sheet-in, .plf-reveal-in { animation: none; }
  .plf-shimmer { animation: none; display: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — binding kit vocabulary: shell, navBar, tabBar, tabItem,
// sheetScrim, sheet, sheetGrabber, listCard, rowDivider, sectionHeader,
// toastDock, actionSheet, emptyState, skeletonRow.
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
  // Scroll lock while the counter sheet / actionSheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage (≥720px CONTAINER width): centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, grid '1fr auto 1fr', paddingInline 8;
  // hairline + blur ALWAYS ON (compact-title variant, no large-title row).
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Pushed-screen back button: ChevronLeft + previous title 13px/500.
  backBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingInline: 4,
    borderRadius: 12,
    color: BRAND_TEXT,
    fontSize: 13,
    fontWeight: 500,
    maxWidth: 120,
    whiteSpace: 'nowrap',
  },
  // MONTH INCOME STRIP — sticky top:52 z19, height 76 exactly:
  // 10 + 16 + 8 + 12 + 6 + 14 + 10 = 76. Rendered on ALL four tabs.
  monthStrip: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 76,
    flexShrink: 0,
    paddingTop: 10,
    paddingBottom: 10,
    paddingInline: 16,
    display: 'flex',
    flexDirection: 'column',
    background: 'color-mix(in srgb, var(--color-background-body) 92%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  stripCaptionRow: {
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  stripMonth: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0},
  // Right caption ellipsizes FIRST at 320 (space-between + minWidth 0).
  stripCaption: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stripCaptionOver: {color: CHIP_POS_TEXT, fontWeight: 600},
  stripBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    display: 'flex',
    background: 'var(--color-background-muted)',
    marginBottom: 6,
  },
  stripSegBooked: {height: '100%', background: BRAND_ACCENT},
  stripSegPending: {height: '100%', background: PENDING_FILL},
  stripSegProj: {
    height: '100%',
    background: PROJ_FILL,
    borderInline: `1px dashed ${PROJ_EDGE}`,
    boxSizing: 'border-box',
  },
  legendRow: {height: 14, display: 'flex', alignItems: 'center', gap: 16},
  // Legend buttons — 8px dot + 11px/500 label inside a 44px-tall hit area
  // (negative block margin keeps the 14px flow height; the strip has no
  // adjacent targets above/below, chrome hairlines bound the hits).
  legendBtn: {
    height: 44,
    marginBlock: -15,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  legendDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  // Invisible full-strip-height overlay buttons matching segment spans —
  // aria-hidden + tabIndex −1: the visible legend buttons are the
  // guaranteed (and screen-reader) button path.
  stripOverlayBtn: {position: 'absolute', top: 0, bottom: 0, zIndex: 1},
  // Inbox subtitle block — 40px in flow below the sticky stack.
  subtitleBlock: {
    height: 40,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingInline: 16,
  },
  subtitleText: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
    position: 'relative',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom; h2 in the heading hierarchy.
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
  sectionCaption: {
    paddingInline: 32,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // PITCH ROWS — 72px media rows; swipe-RIGHT reveals the leading 72px
  // brand Counter block behind the translating content.
  pitchOuter: {position: 'relative'},
  pitchClip: {position: 'relative', overflow: 'hidden'},
  counterAction: {
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
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  pitchContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  pitchRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  monogram: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  pitchText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  pitchPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pitchSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  miniMeterWrap: {width: 36, height: 36, flexShrink: 0, position: 'relative'},
  meterCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  miniScore: {fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  // Expanded pitch area.
  expandArea: {paddingInline: 16, paddingBottom: 16},
  fullMeterRow: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 12,
  },
  fullMeterWrap: {width: 96, height: 96, position: 'relative'},
  fullScore: {fontSize: 22, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'},
  fitOverline: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  projCaption: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    marginBottom: 8,
  },
  factorRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  factorDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  factorLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  factorValue: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  factorNote: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    paddingBottom: 8,
    paddingInlineStart: 16,
  },
  chipRow: {display: 'flex', flexWrap: 'wrap', gap: 8, paddingBlock: 8},
  // OfferDeltaChip — non-interactive 24px pill, 11px/500, tabular-nums;
  // wraps as a WHOLE chip, never mid-number (stress fixture 1).
  deltaChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  deliverableRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 16,
  },
  deliverableLabel: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  deliverablePrice: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Expanded action row — Decline leading, ≥24px dead space, Counter /
  // Accept trailing (Accept keeps trailing via marginLeft auto; flexWrap
  // rowGap 8 so nothing overflows at 320).
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    rowGap: 8,
    paddingTop: 8,
  },
  declineBtn: {
    height: 36,
    paddingInline: 8,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-error)',
    display: 'grid',
    placeItems: 'center',
    marginInlineEnd: 24,
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
  },
  acceptBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 10,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
    marginLeft: 'auto',
  },
  counteredCaption: {
    paddingTop: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // BOOKED / RATES — 60px two-line rows.
  row60: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  row60Text: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  row60Primary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  row60Secondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowAmount: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  rateValue: {fontSize: 16, fontWeight: 400, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Inline stepper panel (Rates rows + Profile goal) — 96×32 track split
  // by a hairline; edges carry the ≥3:1 CONTROL_EDGE boundary; each half's
  // hit extends to 44×44 via the panel's block padding.
  stepperPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 6,
  },
  stepperLabel: {flex: 1, minWidth: 0, fontSize: 13, color: 'var(--color-text-secondary)'},
  stepper: {
    width: 96,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    borderRadius: 8,
    border: `1px solid ${CONTROL_EDGE}`,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  stepperHalf: {
    flex: 1,
    height: '100%',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
    paddingBlock: 6,
  },
  stepperRule: {width: 1, background: CONTROL_EDGE},
  stepperValue: {
    minWidth: 64,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
  },
  // PROFILE.
  identityCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  identityText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  identityName: {fontSize: 17, fontWeight: 600, margin: 0},
  identityHandle: {fontSize: 13, color: 'var(--color-text-secondary)'},
  nicheChipRow: {display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 16px 16px'},
  nicheChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    background: BRAND_TINT_12,
    color: BRAND_TEXT,
  },
  utilityRow: {
    width: '100%',
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
  utilityValue: {fontSize: 16, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  goalPill: {
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
  },
  // EMPTY STATE.
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
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0'},
  // SKELETON — 72px rows at exact pitch-row geometry, deterministic widths.
  skeletonRow: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skelCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  skelBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // TAB BAR — exactly 64px, 4 tabs flex:1, blur + borderTop hairline.
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
  tabItemActive: {color: BRAND_TEXT},
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
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom mid-scroll (foundations amendment: shell-absolute
  // would anchor to the DOCUMENT bottom on tall tabs). One polite region,
  // always mounted; single toast, NO auto-dismiss.
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
  // COUNTER SHEET — scrim z40 + sheet z41, absolute inside shell; medium
  // 55% / large calc(100% − 56px).
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
    touchAction: 'none',
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
  sendBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  sliderValue: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1,
  },
  sliderSub: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    marginTop: 2,
  },
  sliderRow: {display: 'flex', alignItems: 'center', gap: 8, marginTop: 8},
  sliderStepBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 12,
    border: `1px solid ${CONTROL_EDGE}`,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  sliderTicks: {position: 'relative', height: 18, marginInline: 52},
  sliderTick: {position: 'absolute', top: 0, width: 1, height: 6, background: CONTROL_EDGE},
  sliderTickLabel: {
    position: 'absolute',
    top: 7,
    transform: 'translateX(-50%)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  sheetMeterRow: {display: 'flex', alignItems: 'center', gap: 16, marginTop: 16},
  sheetMeterText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6},
  noteField: {
    width: '100%',
    height: 48,
    marginTop: 16,
    border: 'none',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
  },
  // ACTION SHEET — two stacked cards 8px apart, insetInline 16 bottom 16.
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
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  actionSheetRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  actionSheetDestructive: {color: 'var(--color-error)'},
  actionSheetCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  fullDivider: {height: 1, background: 'var(--color-border)'},
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic BY LAW. Identity consts, dual/derived fields,
// fixed date strings (Jul 1/4/7/8/9/11/12/18/26 — no clock). CROSS-CHECK
// LEDGER (verified by hand): open pitches 2+2+2 = 6 = Inbox badge; offers
// 1750+2400+1050+1300+1500+1700 = 9,700 = subtitle '$9,700 on the table';
// booked 2,200+1,400 = 3,600 = BOOKED header = strip booked segment
// (3600/9000 = 40.0%); pending 900 (Nimbus) = 10.0%; Booked badge =
// pending count = 1; goal 9,000.
// ---------------------------------------------------------------------------

const CREATOR = {
  name: 'Maya Trinh',
  handle: '@mayamakes',
  niche: ['Skincare', 'Home coffee', 'Outdoor'],
};

interface RateLine {
  id: string;
  label: string;
  price: number; // whole dollars — step 25 guards fractional cents
  min: number; // stepper range keyed per line
  max: number;
  lastUsed: string | null; // 'Last used in a counter · Jul 4' when stamped
}

const RATE_LINES: RateLine[] = [
  {id: 'reel', label: 'Reel', price: 1200, min: 1000, max: 1500, lastUsed: null},
  {id: 'tiktok', label: 'TikTok', price: 950, min: 750, max: 1250, lastUsed: null},
  {id: 'storyset', label: 'Story set ×3', price: 400, min: 200, max: 700, lastUsed: null},
  {id: 'static', label: 'Static post', price: 600, min: 400, max: 900, lastUsed: null},
  {id: 'youtube', label: 'YouTube 60s', price: 2500, min: 2300, max: 2800, lastUsed: null},
];

type PitchStatus = 'open' | 'countered' | 'accepted' | 'declined';

interface Deliverable {
  rateId: string;
  count: number;
}

interface Pitch {
  id: string;
  brand: string;
  deliverables: Deliverable[];
  deliverableLabel: string; // fixed summary string for the 72px row
  replyBy: string;
  offer: number;
  niche: number; // /40 const
  scope: number; // /20 const
  nicheNote: string; // fixed explanation strings
  scopeNote: string;
  status: PitchStatus;
  counterRate: number | null; // SNAPSHOT at send — sent counters are immutable
  counterDate: string | null;
}

// Resting scores (Math.round — half-up on .5 exactly, stress fixture 3):
// p1 36 + min(40, round(40·1750/1600)=round(43.75)=44→CAP 40) + 16 = 92
// p2 32 + round(40·2400/2400)=40 + 18 = 90
// p3 30 + round(40·1050/1200)=round(35)=35 + 12 = 77
// p4 26 + round(40·1300/1550)=round(33.548)=34 + 14 = 74
// p5 12 + round(40·1500/2500)=round(24)=24 + 10 = 46
// p6 10 + round(40·1700/2850)=round(23.859…)=24 + 12 = 46
// Groups: ≥80 STRONG FIT (p1,p2) · 50–79 WORTH A COUNTER (p3,p4) · <50
// BELOW YOUR FLOOR (p5,p6).
const PITCHES: Pitch[] = [
  {
    id: 'p1',
    brand: 'Lumira Skincare',
    deliverables: [{rateId: 'reel', count: 1}, {rateId: 'storyset', count: 1}],
    deliverableLabel: '1 Reel + Story set',
    replyBy: 'replies by Jul 9',
    offer: 1750,
    niche: 36,
    scope: 16,
    nicheNote: '3 of your 3 niches match',
    scopeNote: 'Two formats, one shoot day',
    status: 'open',
    counterRate: null,
    counterDate: null,
  },
  {
    id: 'p2',
    brand: 'TrailKit Outdoors',
    deliverables: [{rateId: 'reel', count: 2}],
    deliverableLabel: '2 Reels',
    replyBy: 'replies by Jul 8',
    offer: 2400,
    niche: 32,
    scope: 18,
    nicheNote: '2 of your 3 niches match',
    scopeNote: 'You cap video deals at 2 deliverables',
    status: 'open',
    counterRate: null,
    counterDate: null,
  },
  {
    id: 'p3',
    brand: 'Brewtide Coffee',
    deliverables: [{rateId: 'reel', count: 1}],
    deliverableLabel: '1 Reel',
    replyBy: 'replies by Jul 9',
    offer: 1050,
    niche: 30,
    scope: 12,
    nicheNote: '2 of your 3 niches match',
    scopeNote: 'Single format, tight brief',
    status: 'open',
    counterRate: null,
    counterDate: null,
  },
  {
    id: 'p4',
    brand: 'Zenda Sleep',
    deliverables: [{rateId: 'tiktok', count: 1}, {rateId: 'static', count: 1}],
    deliverableLabel: '1 TikTok + Static post',
    replyBy: 'replies by Jul 11',
    offer: 1300,
    niche: 26,
    scope: 14,
    nicheNote: '1 of your 3 niches match',
    scopeNote: 'Two formats, reusable cut',
    status: 'open',
    counterRate: null,
    counterDate: null,
  },
  {
    id: 'p5',
    brand: 'Quantiq VPN',
    deliverables: [{rateId: 'youtube', count: 1}],
    deliverableLabel: '1 YouTube 60s',
    replyBy: 'replies by Jul 7',
    offer: 1500,
    niche: 12,
    scope: 10,
    nicheNote: '0 of your 3 niches match',
    scopeNote: 'You cap video deals at 2 deliverables',
    status: 'open',
    counterRate: null,
    counterDate: null,
  },
  {
    id: 'p6',
    brand: 'GlowPop Candy',
    deliverables: [{rateId: 'tiktok', count: 3}],
    deliverableLabel: '3 TikToks',
    replyBy: 'replies by Jul 12',
    offer: 1700,
    niche: 10,
    scope: 12,
    nicheNote: '0 of your 3 niches match',
    scopeNote: 'Three deliverables exceeds your cap',
    status: 'open',
    counterRate: null,
    counterDate: null,
  },
];

type DealStatus = 'booked' | 'pending';

interface Deal {
  id: string;
  brand: string;
  amount: number;
  metaLabel: string; // 'due Jul 18' / 'countered Jul 1'
  status: DealStatus;
  contact: string;
  deliverableLabel: string;
}

// BOOKED 2,200 + 1,400 = 3,600 ✓; PENDING 900 ✓ (cross-check ledger above).
const DEALS: Deal[] = [
  {
    id: 'd1',
    brand: 'Fernhaven Hotels',
    amount: 2200,
    metaLabel: 'Due Jul 18',
    status: 'booked',
    contact: 'partners@fernhaven.com',
    deliverableLabel: '1 Reel + Story set',
  },
  {
    id: 'd2',
    brand: 'Loopwear',
    amount: 1400,
    metaLabel: 'Due Jul 26',
    status: 'booked',
    contact: 'creators@loopwear.co',
    deliverableLabel: '1 Reel + Static post',
  },
  {
    id: 'd3',
    brand: 'Nimbus Audio',
    amount: 900,
    metaLabel: 'Countered Jul 1',
    status: 'pending',
    contact: 'collabs@nimbusaudio.fm',
    deliverableLabel: '1 TikTok',
  },
];

const GOAL_INITIAL = 9000; // Profile stepper ±$500, range 5,000–20,000
const TODAY_LABEL = 'Jul 4';

// Deterministic skeleton bar widths — primary cycles 60/45/70, secondary
// 40/55/30 (never Math.random()).
const SKEL_PRIMARY = ['60%', '45%', '70%'];
const SKEL_SECONDARY = ['40%', '55%', '30%'];

// ---------------------------------------------------------------------------
// FORMATTERS + DERIVATIONS — pure; every displayed aggregate derives at
// render from the single store, never stored twice.
// ---------------------------------------------------------------------------

/** Whole dollars → '$1,550' (all money is integer dollars; slider step 25
 * guards fractional cents — stress fixture 3). */
function fmtMoney(dollars: number): string {
  return `$${dollars.toLocaleString('en-US')}`;
}

/** Signed delta → '−$150' / '+$25' / '$0' (U+2212 minus). */
function fmtDelta(delta: number): string {
  if (delta === 0) return '$0';
  return `${delta > 0 ? '+' : '−'}${fmtMoney(Math.abs(delta))}`;
}

type RatesById = Record<string, RateLine>;

/** Baseline = Σ count × current rate-card price — SINGLE SOURCE: stepping
 * the Reel rate rederives every OPEN pitch's baseline, chip, and score. */
function baselineFor(pitch: Pitch, rates: RatesById): number {
  return pitch.deliverables.reduce(
    (sum, item) => sum + item.count * rates[item.rateId].price,
    0,
  );
}

/** offerFactor = min(40, Math.round(40·offer/baseline)) — Math.round is
 * round-half-up on .5 exactly (p4 33.548→34, p6 23.859→24; p1 raw 43.75
 * →44 CAPS to 40, stress fixture 2). */
function offerFactorFor(offer: number, baseline: number): number {
  return Math.min(40, Math.round((40 * offer) / baseline));
}

function scoreFor(pitch: Pitch, rates: RatesById): number {
  return pitch.niche + offerFactorFor(pitch.offer, baselineFor(pitch, rates)) + pitch.scope;
}

/** Score → threshold color (≥80 / 50–79 / <50), pairs at declaration. */
function scoreColor(score: number): string {
  if (score >= 80) return SCORE_HI;
  if (score >= 50) return SCORE_MID;
  return SCORE_LO;
}

type GroupId = 'countered' | 'strong' | 'counter' | 'floor';

function groupFor(pitch: Pitch, rates: RatesById): GroupId {
  if (pitch.status === 'countered') return 'countered';
  const score = scoreFor(pitch, rates);
  if (score >= 80) return 'strong';
  if (score >= 50) return 'counter';
  return 'floor';
}

// Renders only once non-empty (COUNTERED), above STRONG FIT.
const GROUP_ORDER: {id: GroupId; label: string}[] = [
  {id: 'countered', label: 'Countered'},
  {id: 'strong', label: 'Strong fit'},
  {id: 'counter', label: 'Worth a counter'},
  {id: 'floor', label: 'Below your floor'},
];

/** Offer-factor explanation: capped offers name the cap (stress fixture 2:
 * p1 reads '40/40' with '+$150 above your card — capped'). */
function offerNoteFor(offer: number, baseline: number): string {
  const raw = Math.round((40 * offer) / baseline);
  const delta = offer - baseline;
  if (raw > 40) return `${fmtDelta(delta)} above your card — capped`;
  if (delta === 0) return 'Matches your rate card exactly';
  if (delta > 0) return `${fmtDelta(delta)} above your rate card`;
  return `${fmtDelta(delta)} below your rate card`;
}

/** Percent of goal to 0.1 — '40.0'. */
function pctOf(value: number, goal: number): string {
  return ((value / goal) * 100).toFixed(1);
}

/** Monogram initials — first letters of the first two words. */
function initialsFor(brand: string): string {
  const words = brand.split(' ');
  return (words[0]?.[0] ?? '') + (words[1]?.[0] ?? '');
}

// ---------------------------------------------------------------------------
// FITSCOREMETER GEOMETRY — 270° gauge, 0° at 12 o'clock, clockwise. Track
// splits into three fixed segments proportional to factor maxima 40/40/20:
// niche [−135°,−27°] (108°), offer [−27°,+81°] (108°), scope [+81°,+135°]
// (54°), each inset 1° per side for the 2° gaps. Each segment fills
// factorValue/factorMax of its own span. Arc paths are aria-hidden — the
// three 44px factor rows are the real targets.
// ---------------------------------------------------------------------------

const METER_BOUNDS: [number, number][] = [
  [-135, -27],
  [-27, 81],
  [81, 135],
];
const METER_SEGS = [NICHE_SEG, OFFER_SEG, SCOPE_SEG];
const METER_MAXIMA = [40, 40, 20];

function meterPolar(c: number, r: number, deg: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: c + r * Math.sin(rad), y: c - r * Math.cos(rad)};
}

function meterArc(c: number, r: number, fromDeg: number, toDeg: number): string {
  const from = meterPolar(c, r, fromDeg);
  const to = meterPolar(c, r, toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

interface FitScoreMeterProps {
  factors: [number, number, number]; // niche/40, offer/40, scope/20
  size: 36 | 96; // mini (stroke 4, 13px/700 center) | full (stroke 8,
  // 22px/700 center + 11px/500 'FIT' overline)
}

function FitScoreMeter({factors, size}: FitScoreMeterProps) {
  const stroke = size === 96 ? 8 : 4;
  const c = size / 2;
  const r = (size - stroke) / 2;
  const score = factors[0] + factors[1] + factors[2];
  return (
    <>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden>
        {METER_BOUNDS.map(([from, to], index) => {
          const start = from + 1;
          const end = to - 1;
          const span = end - start;
          const frac = Math.max(0, Math.min(1, factors[index] / METER_MAXIMA[index]));
          return (
            <g key={index}>
              <path
                d={meterArc(c, r, start, end)}
                stroke="var(--color-background-muted)"
                strokeWidth={stroke}
                strokeLinecap="butt"
              />
              {frac > 0 ? (
                <path
                  d={meterArc(c, r, start, start + span * frac)}
                  stroke={METER_SEGS[index]}
                  strokeWidth={stroke}
                  strokeLinecap="butt"
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      <span style={styles.meterCenter}>
        {size === 96 ? (
          <span style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <span style={{...styles.fullScore, color: scoreColor(score)}}>{score}</span>
            <span style={styles.fitOverline}>FIT</span>
          </span>
        ) : (
          <span style={{...styles.miniScore, color: scoreColor(score)}}>{score}</span>
        )}
      </span>
    </>
  );
}

// ---------------------------------------------------------------------------
// OFFERDELTACHIP — non-interactive 24px pill; binds to the DRAFT inside
// the counter sheet and flips fills the instant the value crosses
// baseline; countered rows restamp to the positive 'Countered at …' form.
// ---------------------------------------------------------------------------

interface DeltaChipProps {
  pitch: Pitch;
  rates: RatesById;
  draft?: number; // sheet binding — overrides the resting offer-vs-baseline
}

function OfferDeltaChip({pitch, rates, draft}: DeltaChipProps) {
  const baseline = baselineFor(pitch, rates);
  let text: string;
  let delta: number;
  if (pitch.status === 'countered' && pitch.counterRate != null && draft == null) {
    // Sent counters are immutable snapshots (stress fixture 8).
    delta = pitch.counterRate - pitch.offer;
    text = `Countered at ${fmtMoney(pitch.counterRate)} (${fmtDelta(delta)} over offer)`;
    delta = 1; // always the positive pair
  } else {
    const value = draft ?? pitch.offer;
    delta = value - baseline;
    const single = pitch.deliverables.length === 1 && pitch.deliverables[0].count === 1;
    if (delta === 0) {
      text = draft != null ? '$0' : `$0 vs your rate card (${fmtMoney(baseline)})`;
    } else if (single) {
      text = `${fmtDelta(delta)} vs your ${rates[pitch.deliverables[0].rateId].label} rate`;
    } else {
      // Longest fixture string — p6 '−$1,150 vs your rate card ($2,850)'
      // wraps as a WHOLE chip at 320px (stress fixture 1).
      text = `${fmtDelta(delta)} vs your rate card (${fmtMoney(baseline)})`;
    }
  }
  const fill =
    delta === 0
      ? {background: 'var(--color-background-muted)', color: 'var(--color-text-secondary)'}
      : delta > 0
        ? {background: CHIP_POS_BG, color: CHIP_POS_TEXT}
        : {background: CHIP_NEG_BG, color: CHIP_NEG_TEXT};
  return <span style={{...styles.deltaChip, ...fill}}>{text}</span>;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — usePitchloftState(): flat entity map + one
// update(id, patch); every surface (rows, strip, badges, sheet, rates,
// goal) reads and writes through it.
// ---------------------------------------------------------------------------

type TabId = 'inbox' | 'booked' | 'rates' | 'profile';

interface UndoPayload {
  kind: 'pitch' | 'deal';
  id: string;
  prevStatus?: PitchStatus;
  deal?: Deal;
  dealIndex?: number;
}

interface ToastState {
  seq: number;
  text: string;
  undo: UndoPayload | null;
}

interface CounterSheetState {
  pitchId: string;
  draft: number;
  detent: 'medium' | 'large';
}

interface UiState {
  tab: TabId;
  // PER-TAB PERSISTENCE — push-stack depth survives tab switches;
  // dealDetail is the only push. Re-tapping the active tab pops to root.
  screenByTab: Record<TabId, string>; // 'root' | dealId (booked only)
  expandedPitchId: string | null;
  openFactorNotes: Record<string, boolean>; // `${pitchId}:${index}`
  swipeOpenId: string | null;
  actionSheetPitchId: string | null;
  actionSheetDealId: string | null;
  counterSheet: CounterSheetState | null;
  expandedRateId: string | null;
  goalStepperOpen: boolean;
  toast: ToastState | null;
  skeleton: 'idle' | 'loading' | 'updated';
}

interface PitchloftEntities {
  pitches: {byId: Record<string, Pitch>; order: string[]};
  rates: {byId: RatesById; order: string[]};
  deals: {byId: Record<string, Deal>; order: string[]};
  goal: {value: number};
  ui: UiState;
}

const INITIAL_ENTITIES: PitchloftEntities = {
  pitches: {
    byId: Object.fromEntries(PITCHES.map(pitch => [pitch.id, pitch])),
    order: PITCHES.map(pitch => pitch.id),
  },
  rates: {
    byId: Object.fromEntries(RATE_LINES.map(line => [line.id, line])),
    order: RATE_LINES.map(line => line.id),
  },
  deals: {
    byId: Object.fromEntries(DEALS.map(deal => [deal.id, deal])),
    order: DEALS.map(deal => deal.id),
  },
  goal: {value: GOAL_INITIAL},
  ui: {
    tab: 'inbox',
    screenByTab: {inbox: 'root', booked: 'root', rates: 'root', profile: 'root'},
    expandedPitchId: null,
    openFactorNotes: {},
    swipeOpenId: null,
    actionSheetPitchId: null,
    actionSheetDealId: null,
    counterSheet: null,
    expandedRateId: null,
    goalStepperOpen: false,
    toast: null,
    skeleton: 'idle',
  },
};

function usePitchloftState() {
  const [entities, setEntities] = useState<PitchloftEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof PitchloftEntities>(id: K, patch: Partial<PitchloftEntities[K]>) => {
      setEntities(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );
  return {entities, update, setEntities};
}

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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns page
 * scroll; per-tab scrollTop is recorded on exit and restored on entry. */
function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const overflowY = getComputedStyle(current).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return current;
    current = current.parentElement;
  }
  return null;
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
// BRAND MARK — 24px open-envelope-flap chevron over a coin dot; stroke
// --color-text-primary, coin in BRAND_ACCENT.
// ---------------------------------------------------------------------------

function PitchloftMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 9.5 12 4l8 5.5"
          stroke="var(--color-text-primary)"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 9.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5"
          stroke="var(--color-text-primary)"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <circle cx={12} cy={13.5} r={3.25} fill={BRAND_ACCENT} />
        <path d="M12 12.1v2.8" stroke={BRAND_FILL_TEXT} strokeWidth={1.4} strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// MONTH INCOME STRIP — pinned 76px block on ALL four tabs. Segment widths
// derive live: booked 3,600/9,000 = 40.0%, pending 900/9,000 = 10.0%;
// while the counter sheet is open a dashed projection segment (draft/goal)
// appends. CLAMP BRANCH (stress fixture 4): booked ≥ goal renders the
// booked segment full-width and the caption flips to '… · +$1,400 over'
// in the positive pair. The 12px bar is covered by invisible full-height
// overlay buttons; the visible legend buttons are the guaranteed path.
// ---------------------------------------------------------------------------

interface MonthStripProps {
  booked: number;
  pending: number;
  goal: number;
  projection: number | null; // counter-sheet draft while open
  counteredSent: boolean; // any countered pitch → '$X booked · $Y pending'
  onBooked: () => void;
  onPending: () => void;
  onGoal: () => void;
}

function MonthIncomeStrip({booked, pending, goal, projection, counteredSent, onBooked, onPending, onGoal}: MonthStripProps) {
  const overGoal = booked >= goal;
  const bookedPct = Math.min(100, Number(pctOf(booked, goal)));
  const pendingPct = Math.min(100 - bookedPct, Number(pctOf(pending, goal)));
  const projPct =
    projection != null ? Math.min(100 - bookedPct - pendingPct, Number(pctOf(projection, goal))) : 0;
  let caption: string;
  if (overGoal) {
    caption = `${fmtMoney(booked)} of ${fmtMoney(goal)} goal · +${fmtMoney(booked - goal)} over`;
  } else if (counteredSent) {
    caption = `${fmtMoney(booked)} booked · ${fmtMoney(pending)} pending`;
  } else {
    caption = `${fmtMoney(booked)} of ${fmtMoney(goal)} goal`;
  }
  if (projection != null) caption += ` · +${fmtMoney(projection)} if accepted`;
  const legend = [
    {id: 'booked', label: 'Booked', dot: BRAND_ACCENT, onTap: onBooked, name: `Booked ${fmtMoney(booked)} — view booked deals`},
    {id: 'pending', label: 'Pending', dot: PENDING_FILL, onTap: onPending, name: `Pending ${fmtMoney(pending)} — view counters awaiting reply`},
    {id: 'goal', label: 'Goal', dot: GOAL_DOT, onTap: onGoal, name: `Goal ${fmtMoney(goal)} — edit monthly goal`},
  ];
  // Overlay button spans mirror the visible segments (goal = remainder).
  const spans = [
    {id: 'booked', left: 0, width: bookedPct, onTap: onBooked},
    {id: 'pending', left: bookedPct, width: pendingPct, onTap: onPending},
    {id: 'goal', left: bookedPct + pendingPct, width: Math.max(0, 100 - bookedPct - pendingPct), onTap: onGoal},
  ];
  return (
    <div style={styles.monthStrip}>
      <div style={styles.stripCaptionRow}>
        <span style={styles.stripMonth}>July</span>
        <span style={{...styles.stripCaption, ...(overGoal ? styles.stripCaptionOver : null)}}>{caption}</span>
      </div>
      <div style={styles.stripBar} aria-hidden>
        {bookedPct > 0 ? <span style={{...styles.stripSegBooked, width: `${bookedPct}%`}} /> : null}
        {pendingPct > 0 ? <span style={{...styles.stripSegPending, width: `${pendingPct}%`}} /> : null}
        {projPct > 0 ? <span style={{...styles.stripSegProj, width: `${projPct}%`}} /> : null}
      </div>
      {spans.map(span =>
        span.width > 0 ? (
          <button
            key={span.id}
            type="button"
            className="plf-btn"
            tabIndex={-1}
            aria-hidden
            style={{...styles.stripOverlayBtn, left: `${span.left}%`, width: `${span.width}%`}}
            onClick={span.onTap}
          />
        ) : null,
      )}
      <div style={styles.legendRow}>
        {legend.map(item => (
          <button
            key={item.id}
            type="button"
            className="plf-btn plf-focusable"
            style={styles.legendBtn}
            aria-label={item.name}
            onClick={item.onTap}>
            <span style={{...styles.legendDot, background: item.dot}} aria-hidden />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RATE SLIDER — <input type=range> flanked by 44×44 Minus/Plus buttons
// (the mandatory non-gesture path); ArrowLeft/Right step $25 natively;
// tick hairlines at the offer and the rate-card baseline.
// ---------------------------------------------------------------------------

interface RateSliderProps {
  value: number;
  min: number;
  max: number;
  offer: number;
  baseline: number;
  baselineLabel: string;
  onChange: (value: number) => void;
}

function RateSlider({value, min, max, offer, baseline, baselineLabel, onChange}: RateSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const offerPct = ((offer - min) / (max - min)) * 100;
  const basePct = ((baseline - min) / (max - min)) * 100;
  // Filled portion = brand; UNFILLED rest track = CONTROL_EDGE gray
  // (≥3:1 vs the sheet card per the rest-fill amendment — muted failed).
  const track = `linear-gradient(90deg, ${BRAND_ACCENT} ${pct}%, ${CONTROL_EDGE} ${pct}%)`;
  return (
    <div>
      <div style={styles.sliderValue}>{fmtMoney(value)}</div>
      <div style={styles.sliderSub}>
        Your {baselineLabel} rate: {fmtMoney(baseline)} · Their offer: {fmtMoney(offer)}
      </div>
      <div style={styles.sliderRow}>
        <button
          type="button"
          className="plf-btn plf-focusable"
          style={{...styles.sliderStepBtn, ...(value <= min ? {opacity: 0.35} : null)}}
          aria-label="Decrease counter rate by $25"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 25))}>
          <Icon icon={MinusIcon} size="md" color="inherit" />
        </button>
        <input
          type="range"
          className="plf-range"
          min={min}
          max={max}
          step={25}
          value={value}
          aria-label="Counter rate"
          aria-valuetext={fmtMoney(value)}
          style={{'--plf-track': track} as CSSProperties}
          onChange={event => onChange(Number(event.target.value))}
        />
        <button
          type="button"
          className="plf-btn plf-focusable"
          style={{...styles.sliderStepBtn, ...(value >= max ? {opacity: 0.35} : null)}}
          aria-label="Increase counter rate by $25"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 25))}>
          <Icon icon={PlusIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sliderTicks} aria-hidden>
        <span style={{...styles.sliderTick, left: `${offerPct}%`}} />
        <span style={{...styles.sliderTickLabel, left: `${offerPct}%`}}>{fmtMoney(offer)}</span>
        {basePct !== offerPct ? (
          <>
            <span style={{...styles.sliderTick, left: `${basePct}%`}} />
            <span style={{...styles.sliderTickLabel, left: `${basePct}%`}}>{fmtMoney(baseline)}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PITCH ROW — 72px media row. Swipe RIGHT (pointerdown/move/up translate)
// past +72px reveals the leading brand Counter block; releasing past the
// threshold opens the counter sheet. Button paths: the trailing 44×44
// ellipsis (actionSheet) and the expanded row's explicit
// Decline/Counter/Accept — every gesture has its Tab-reachable twin.
// The whole row is ONE <button> named 'brand, $offer offer, fit N'.
// ---------------------------------------------------------------------------

const FACTOR_LABELS = ['Niche overlap', 'Offer vs rate card', 'Deliverable scope'];

interface PitchRowProps {
  pitch: Pitch;
  rates: RatesById;
  monoIndex: number;
  isExpanded: boolean;
  isSwipeOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  openFactorNotes: Record<string, boolean>;
  onToggleExpand: () => void;
  onToggleFactor: (index: number) => void;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onCounter: (opener: HTMLElement | null) => void;
  onEllipsis: (opener: HTMLElement) => void;
  onDecline: () => void;
  onAccept: () => void;
}

function PitchRow({
  pitch,
  rates,
  monoIndex,
  isExpanded,
  isSwipeOpen,
  isLast,
  reducedMotion,
  openFactorNotes,
  onToggleExpand,
  onToggleFactor,
  onSwipeOpen,
  onSwipeClose,
  onCounter,
  onEllipsis,
  onDecline,
  onAccept,
}: PitchRowProps) {
  // Transient drag delta only — settled swipe state lives in the owner.
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);

  const baseline = baselineFor(pitch, rates);
  const offerFactor = offerFactorFor(pitch.offer, baseline);
  const score = pitch.niche + offerFactor + pitch.scope;
  const isCountered = pitch.status === 'countered';
  const swipeable = pitch.status === 'open';

  const base = isSwipeOpen ? 72 : 0;
  // Rightward reveal clamps 0…96 (rubber past the 72px block).
  const offset = dragX != null ? Math.max(0, Math.min(96, base + dragX)) : base;

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
    const settled = Math.max(0, Math.min(96, base + dragX));
    setDragX(null);
    if (!movedRef.current) return;
    // Release past the full 72px threshold opens the sheet directly;
    // a shorter fling settles the revealed Counter block (a real button).
    if (settled > 72) {
      onSwipeClose();
      onCounter(null);
    } else if (settled > 36) {
      onSwipeOpen();
    } else {
      onSwipeClose();
    }
  };
  const guardClick = (handler: (opener: HTMLElement) => void) => (event: {currentTarget: HTMLElement}) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    handler(event.currentTarget);
  };

  const factors: [number, number, number] = [pitch.niche, offerFactor, pitch.scope];
  const maxima = METER_MAXIMA;
  const notes = [pitch.nicheNote, offerNoteFor(pitch.offer, baseline), pitch.scopeNote];
  const dots = [NICHE_SEG, OFFER_SEG, SCOPE_SEG];

  return (
    <div style={styles.pitchOuter} data-swipe-row={pitch.id}>
      <div style={styles.pitchClip}>
        {swipeable ? (
          <button
            type="button"
            className="plf-btn"
            style={styles.counterAction}
            tabIndex={isSwipeOpen ? 0 : -1}
            aria-hidden={!isSwipeOpen}
            onClick={event => onCounter(event.currentTarget)}>
            <Icon icon={ReplyIcon} size="sm" color="inherit" />
            Counter
          </button>
        ) : null}
        <div
          style={{
            ...styles.pitchContent,
            transform: offset !== 0 ? `translateX(${offset}px)` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 200ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="plf-btn plf-focusable"
            style={styles.pitchRowBtn}
            aria-expanded={isExpanded}
            aria-label={`${pitch.brand}, ${fmtMoney(pitch.offer)} offer, fit ${score}`}
            onClick={guardClick(() => onToggleExpand())}>
            <span
              style={{
                ...styles.monogram,
                background: MONO_BG[monoIndex % 6],
                color: MONO_TEXT[monoIndex % 6],
              }}
              aria-hidden>
              {initialsFor(pitch.brand)}
            </span>
            <span style={styles.pitchText}>
              <span style={styles.pitchPrimary}>{pitch.brand}</span>
              <span style={styles.pitchSecondary}>
                {pitch.deliverableLabel} · {isCountered ? `countered ${pitch.counterDate}` : pitch.replyBy}
              </span>
            </span>
            <span style={styles.miniMeterWrap} aria-hidden>
              <FitScoreMeter factors={factors} size={36} />
            </span>
          </button>
          {pitch.status === 'open' ? (
            <button
              type="button"
              className="plf-btn plf-focusable"
              style={styles.iconBtn}
              aria-label={`Actions for ${pitch.brand} pitch`}
              aria-haspopup="dialog"
              onClick={guardClick(onEllipsis)}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </button>
          ) : (
            <span style={{width: 16, flexShrink: 0}} aria-hidden />
          )}
        </div>
      </div>
      {isExpanded ? (
        <div style={styles.expandArea} className={reducedMotion ? undefined : 'plf-reveal-in'}>
          <div style={styles.fullMeterRow}>
            <span style={styles.fullMeterWrap}>
              <FitScoreMeter factors={factors} size={96} />
            </span>
          </div>
          {FACTOR_LABELS.map((label, index) => {
            const noteKey = `${pitch.id}:${index}`;
            const noteOpen = openFactorNotes[noteKey] === true;
            return (
              <div key={label}>
                <button
                  type="button"
                  className="plf-btn plf-focusable"
                  style={styles.factorRow}
                  aria-expanded={noteOpen}
                  onClick={() => onToggleFactor(index)}>
                  <span style={{...styles.factorDot, background: dots[index]}} aria-hidden />
                  <span style={styles.factorLabel}>{label}</span>
                  <span style={styles.factorValue}>
                    {factors[index]}/{maxima[index]}
                  </span>
                </button>
                {noteOpen ? <div style={styles.factorNote}>{notes[index]}</div> : null}
              </div>
            );
          })}
          <div style={styles.chipRow}>
            <OfferDeltaChip pitch={pitch} rates={rates} />
          </div>
          {pitch.deliverables.map(item => (
            <div key={item.rateId} style={styles.deliverableRow}>
              <span style={styles.deliverableLabel}>
                {item.count} × {rates[item.rateId].label}
              </span>
              <span style={styles.deliverablePrice}>{fmtMoney(item.count * rates[item.rateId].price)}</span>
            </div>
          ))}
          {pitch.status === 'open' ? (
            // Decline leading + 24px dead space; Accept trailing via
            // marginLeft:auto (destructive never bottom-right; flexWrap
            // keeps 320px clean).
            <div style={styles.actionRow}>
              <button type="button" className="plf-btn plf-focusable" style={styles.declineBtn} onClick={onDecline}>
                Decline
              </button>
              <button
                type="button"
                className="plf-btn plf-focusable"
                style={styles.secondaryBtn}
                onClick={event => onCounter(event.currentTarget)}>
                Counter {fmtMoney(baseline)}
              </button>
              <button type="button" className="plf-btn plf-focusable" style={styles.acceptBtn} onClick={onAccept}>
                Accept {fmtMoney(pitch.offer)}
              </button>
            </div>
          ) : (
            <div style={styles.counteredCaption}>
              Counter sent {pitch.counterDate} · awaiting reply
            </div>
          )}
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDividerDeep} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// COUNTER SHEET — medium 55% / large calc(100% − 56px); grabber is a real
// 'Resize sheet' button (drag between detents is garnish); X, scrim, and
// Escape close; focus({preventScroll:true}) on open (plain .focus() would
// scroll-reveal the animating sheet inside the locked column).
// ---------------------------------------------------------------------------

interface CounterSheetProps {
  pitch: Pitch;
  rates: RatesById;
  draft: number;
  detent: 'medium' | 'large';
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDraftChange: (value: number) => void;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onSend: () => void;
  onClose: () => void;
}

function CounterSheet({
  pitch,
  rates,
  draft,
  detent,
  reducedMotion,
  sheetRef,
  onDraftChange,
  onDetentChange,
  onSend,
  onClose,
}: CounterSheetProps) {
  const [dragY, setDragY] = useState<number | null>(null);
  const startYRef = useRef(0);
  const movedRef = useRef(false);

  const baseline = baselineFor(pitch, rates);
  const single = pitch.deliverables.length === 1 && pitch.deliverables[0].count === 1;
  const baselineLabel = single ? rates[pitch.deliverables[0].rateId].label : 'rate card';
  // Slider bounds: floor/ceil to the $25 step, +$300 headroom above the
  // higher anchor — p3 Brewtide derives exactly min 1050 / max 1500.
  const sliderMin = Math.floor(Math.min(pitch.offer, baseline) / 25) * 25;
  const sliderMax = Math.ceil(Math.max(pitch.offer, baseline) / 25) * 25 + 300;

  // LIVE DERIVATIONS — projectedOffer = min(40, round(40·C/baseline)):
  // at C=1200 → 40 → 30+40+12 = 82; at C=1050 → round(35)=35 → 77, which
  // equals the resting score (arithmetic self-check); at C=1500 →
  // min(40, 50) = 40 → 82, identical to 1200 (both cap — stress 7).
  const projOffer = offerFactorFor(draft, baseline);
  const projScore = pitch.niche + projOffer + pitch.scope;
  const caption =
    draft > baseline && projOffer === 40
      ? 'Fit maxed at your rate'
      : projScore >= 80
        ? 'Strong fit if accepted'
        : `Projected fit ${projScore} if accepted`;

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
      aria-labelledby="plf-counter-title"
      tabIndex={-1}
      className={reducedMotion ? undefined : 'plf-sheet-in'}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease',
      }}>
      <button
        type="button"
        className="plf-btn plf-focusable"
        style={styles.sheetGrabberZone}
        aria-label="Resize sheet"
        onPointerDown={onGrabberPointerDown}
        onPointerMove={onGrabberPointerMove}
        onPointerUp={onGrabberPointerUp}
        onClick={onGrabberClick}>
        <span style={styles.sheetGrabber} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id="plf-counter-title" style={styles.sheetTitle}>
          Counter {pitch.brand}
        </h2>
        <button
          type="button"
          className="plf-btn plf-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <RateSlider
          value={draft}
          min={sliderMin}
          max={sliderMax}
          offer={pitch.offer}
          baseline={baseline}
          baselineLabel={baselineLabel}
          onChange={onDraftChange}
        />
        <div style={styles.sheetMeterRow}>
          <span style={styles.fullMeterWrap}>
            {/* Offer segment + center score re-derive on every slider
                change — numeric swap, no transitions (instant always). */}
            <FitScoreMeter factors={[pitch.niche, projOffer, pitch.scope]} size={96} />
          </span>
          <div style={styles.sheetMeterText}>
            <span style={{...styles.projCaption, textAlign: 'left', marginBottom: 0}}>{caption}</span>
            <span>
              <OfferDeltaChip pitch={pitch} rates={rates} draft={draft} />
            </span>
          </div>
        </div>
        <input
          type="text"
          className="plf-focusable"
          style={styles.noteField}
          placeholder="Add a note (optional)"
          aria-label="Counter note"
        />
      </div>
      <div style={styles.sheetFooter}>
        <button type="button" className="plf-btn plf-focusable" style={styles.sendBtn} onClick={onSend}>
          Send counter
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — two stacked cards (options + separate Cancel), centered
// no-icons rows, destructive LAST; focus lands on Cancel (never
// destructive-first); scrim/Escape close with no action.
// ---------------------------------------------------------------------------

interface ActionSheetRow {
  id: string;
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

interface ActionSheetProps {
  contextLabel: string;
  rows: ActionSheetRow[];
  cancelRef: RefObject<HTMLButtonElement | null>;
  sheetRef: RefObject<HTMLDivElement | null>;
  onCancel: () => void;
}

function ActionSheet({contextLabel, rows, cancelRef, sheetRef, onCancel}: ActionSheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-label={contextLabel}
      style={styles.actionSheet}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}>
      <div style={styles.actionSheetCard}>
        <div style={styles.actionSheetHeader}>{contextLabel}</div>
        {rows.map(row => (
          <div key={row.id}>
            <div style={styles.fullDivider} />
            <button
              type="button"
              className="plf-btn plf-focusable"
              style={{...styles.actionSheetRow, ...(row.destructive ? styles.actionSheetDestructive : null)}}
              onClick={row.onSelect}>
              {row.label}
            </button>
          </div>
        ))}
      </div>
      <div style={styles.actionSheetCard}>
        <button
          type="button"
          ref={cancelRef}
          className="plf-btn plf-focusable"
          style={styles.actionSheetCancel}
          onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SKELETON — 4 rows at EXACT 72px pitch-row geometry inside the same
// listCard (zero layout shift on resolve); deterministic staggered widths;
// one shared 1.6s shimmer sweep, REMOVED under reduced motion; container
// aria-busy, blocks aria-hidden, 'Loading' announced once via toastDock.
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div style={styles.listCard} aria-busy="true">
      {[0, 1, 2, 3].map(index => (
        <div key={index} aria-hidden>
          <div style={styles.skeletonRow}>
            <span style={styles.skelCircle} />
            <span style={styles.skelBars}>
              <span style={{...styles.skelBar, width: SKEL_PRIMARY[index % 3]}} />
              <span style={{...styles.skelBar, width: SKEL_SECONDARY[index % 3]}} />
            </span>
          </div>
          {index < 3 ? <div style={styles.rowDividerDeep} /> : null}
        </div>
      ))}
      <span className="plf-shimmer" aria-hidden />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TAB_META: {id: TabId; label: string; icon: typeof InboxIcon}[] = [
  {id: 'inbox', label: 'Inbox', icon: InboxIcon},
  {id: 'booked', label: 'Booked', icon: BriefcaseIcon},
  {id: 'rates', label: 'Rates', icon: ReceiptIcon},
  {id: 'profile', label: 'Profile', icon: CircleUserIcon},
];

const TAB_TITLES: Record<TabId, string> = {
  inbox: 'Inbox',
  booked: 'Booked',
  rates: 'Rates',
  profile: 'Profile',
};

export default function MobileCollabPitchInboxTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {entities, update, setEntities} = usePitchloftState();
  const {pitches, rates, deals, goal, ui} = entities;

  // Focus + scroll plumbing.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const awaitingHeaderRef = useRef<HTMLHeadingElement | null>(null);
  const goalPillRef = useRef<HTMLButtonElement | null>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);
  const scrollTopsRef = useRef<Record<TabId, number>>({inbox: 0, booked: 0, rates: 0, profile: 0});
  const toastSeqRef = useRef(0);

  useEffect(() => {
    scrollParentRef.current = findScrollParent(wrapRef.current);
  }, []);

  // DERIVED — every aggregate derives at render, never stored twice.
  const ratesById = rates.byId;
  const allPitches = pitches.order.map(id => pitches.byId[id]);
  // Inbox badge counts open + COUNTERED (countered is still open — the
  // deal isn't resolved until accepted/declined), so the badge stays 6
  // after sending the Brewtide counter.
  const inboxPitches = allPitches.filter(p => p.status === 'open' || p.status === 'countered');
  const inboxCount = inboxPitches.length;
  const onTableTotal = inboxPitches.reduce((sum, p) => sum + p.offer, 0); // 9,700 at rest ✓
  const acceptedPitches = allPitches.filter(p => p.status === 'accepted');
  const counteredPitches = allPitches.filter(p => p.status === 'countered');
  const bookedDeals = deals.order.map(id => deals.byId[id]).filter(d => d.status === 'booked');
  const pendingDeals = deals.order.map(id => deals.byId[id]).filter(d => d.status === 'pending');
  // booked 2,200+1,400 = 3,600 at rest ✓; accepting Brewtide → 4,650.
  const bookedTotal =
    bookedDeals.reduce((sum, d) => sum + d.amount, 0) +
    acceptedPitches.reduce((sum, p) => sum + p.offer, 0);
  // pending 900 at rest ✓; after the $1,200 counter → 2,100 (23.3%).
  const pendingTotal =
    pendingDeals.reduce((sum, d) => sum + d.amount, 0) +
    counteredPitches.reduce((sum, p) => sum + (p.counterRate ?? 0), 0);
  const bookedBadge = pendingDeals.length + counteredPitches.length; // 1 at rest ✓
  const sheetPitch = ui.counterSheet != null ? pitches.byId[ui.counterSheet.pitchId] : null;
  const actionPitch = ui.actionSheetPitchId != null ? pitches.byId[ui.actionSheetPitchId] : null;
  const actionDeal = ui.actionSheetDealId != null ? deals.byId[ui.actionSheetDealId] : null;
  const overlayOpen = ui.counterSheet != null || actionPitch != null || actionDeal != null;
  const pushedDealId = ui.screenByTab.booked !== 'root' ? ui.screenByTab.booked : null;

  const toastPatch = (text: string, undo: UndoPayload | null = null) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undo}};
  };

  // TAB SELECTION — per-tab persistence: scrollTop recorded on exit and
  // restored on entry; expanded rows / steppers / pushed screens survive;
  // overlays close (they belong to their moment); toast persists.
  // Re-tapping the ACTIVE tab pops to root, scrolls top, and resolves a
  // pending skeleton (the one legal reset).
  const selectTab = (next: TabId) => {
    const scroller = scrollParentRef.current;
    if (next === ui.tab) {
      update('ui', {
        screenByTab: {...ui.screenByTab, [next]: 'root'},
        swipeOpenId: null,
        counterSheet: null,
        actionSheetPitchId: null,
        actionSheetDealId: null,
        ...(ui.skeleton === 'loading' ? {skeleton: 'updated' as const, ...toastPatch('Updated just now')} : null),
      });
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    if (scroller != null) scrollTopsRef.current[ui.tab] = scroller.scrollTop;
    update('ui', {
      tab: next,
      swipeOpenId: null,
      counterSheet: null,
      actionSheetPitchId: null,
      actionSheetDealId: null,
    });
  };
  useEffect(() => {
    const scroller = scrollParentRef.current;
    if (scroller == null) return;
    scroller.scrollTop = scrollTopsRef.current[ui.tab] ?? 0;
  }, [ui.tab]);

  // Focus into overlays — preventScroll (foundations amendment): plain
  // .focus() scroll-reveals the animating sheet inside the locked column.
  useEffect(() => {
    if (ui.counterSheet != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [ui.counterSheet != null ? ui.counterSheet.pitchId : null]);
  useEffect(() => {
    if (ui.actionSheetPitchId != null || ui.actionSheetDealId != null) {
      cancelRef.current?.focus({preventScroll: true});
    }
  }, [ui.actionSheetPitchId, ui.actionSheetDealId]);

  const closeOverlays = (restoreFocus = true) => {
    update('ui', {counterSheet: null, actionSheetPitchId: null, actionSheetDealId: null});
    if (restoreFocus) openerRef.current?.focus();
  };

  // Escape closes the TOPMOST overlay only: actionSheet > counter sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.actionSheetPitchId != null || ui.actionSheetDealId != null) {
        update('ui', {actionSheetPitchId: null, actionSheetDealId: null});
        openerRef.current?.focus();
      } else if (ui.counterSheet != null) {
        update('ui', {counterSheet: null});
        openerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.actionSheetPitchId, ui.actionSheetDealId, ui.counterSheet]);

  // Tap elsewhere closes an open swipe row.
  const onShellPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (ui.swipeOpenId == null) return;
    const target = event.target as HTMLElement;
    if (target.closest(`[data-swipe-row="${ui.swipeOpenId}"]`) == null) {
      update('ui', {swipeOpenId: null});
    }
  };

  // CONSEQUENCE CHAINS -------------------------------------------------------

  const openCounterSheet = (pitchId: string, opener: HTMLElement | null) => {
    openerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    const pitch = pitches.byId[pitchId];
    // Prefilled from the rate card: C = baseline ($1,200 for Brewtide).
    update('ui', {
      counterSheet: {pitchId, draft: baselineFor(pitch, ratesById), detent: 'medium'},
      actionSheetPitchId: null,
      actionSheetDealId: null,
      swipeOpenId: null,
    });
  };

  // SEND COUNTER — one beat: row regroups into COUNTERED, chip restamps,
  // pending 900→2,100 (strip 23.3% + caption flips), Booked badge 1→2,
  // AWAITING REPLY gains the row, the Rates line stamps 'Last used in a
  // counter · Jul 4', and the toast announces. counterRate is a SNAPSHOT —
  // later rate-card edits never restamp a sent counter (stress fixture 8).
  const sendCounter = () => {
    if (ui.counterSheet == null || sheetPitch == null) return;
    const draft = ui.counterSheet.draft;
    const stamp = `Last used in a counter · ${TODAY_LABEL}`;
    setEntities(prev => {
      const pitch = prev.pitches.byId[ui.counterSheet!.pitchId];
      const stampedRates = {...prev.rates.byId};
      for (const item of pitch.deliverables) {
        stampedRates[item.rateId] = {...stampedRates[item.rateId], lastUsed: stamp};
      }
      toastSeqRef.current += 1;
      return {
        ...prev,
        pitches: {
          ...prev.pitches,
          byId: {
            ...prev.pitches.byId,
            [pitch.id]: {...pitch, status: 'countered', counterRate: draft, counterDate: TODAY_LABEL},
          },
        },
        rates: {...prev.rates, byId: stampedRates},
        ui: {
          ...prev.ui,
          counterSheet: null,
          toast: {
            seq: toastSeqRef.current,
            text: `Counter sent to ${pitch.brand.split(' ')[0]} — ${fmtMoney(draft)}`,
            undo: {kind: 'pitch', id: pitch.id, prevStatus: 'open'},
          },
        },
      };
    });
    openerRef.current?.focus();
  };

  // UNDO-OVER-CONFIRM: decline/accept execute IMMEDIATELY; the toast's
  // Undo restores the exact prior state (order array never mutates, so
  // groups re-derive the row back into its original slot). One toast at a
  // time — a new mutation replaces it and the prior undo window ends
  // (stress fixture 6).
  const declinePitch = (pitch: Pitch) => {
    update('pitches', {byId: {...pitches.byId, [pitch.id]: {...pitch, status: 'declined'}}});
    update('ui', {
      actionSheetPitchId: null,
      swipeOpenId: null,
      ...toastPatch(`${pitch.brand} declined`, {kind: 'pitch', id: pitch.id, prevStatus: pitch.status}),
    });
  };
  const acceptPitch = (pitch: Pitch) => {
    // Accepting moves the offer into booked: 3,600 + 1,050 = 4,650 for
    // Brewtide (51.7% of the $9,000 goal — caption re-derives).
    update('pitches', {byId: {...pitches.byId, [pitch.id]: {...pitch, status: 'accepted'}}});
    update('ui', {
      actionSheetPitchId: null,
      swipeOpenId: null,
      ...toastPatch(`Booked ${pitch.brand.split(' ')[0]} at ${fmtMoney(pitch.offer)}`, {
        kind: 'pitch',
        id: pitch.id,
        prevStatus: pitch.status,
      }),
    });
  };
  const withdrawDeal = (deal: Deal) => {
    const index = deals.order.indexOf(deal.id);
    const nextById = {...deals.byId};
    delete nextById[deal.id];
    update('deals', {byId: nextById, order: deals.order.filter(id => id !== deal.id)});
    update('ui', {
      actionSheetDealId: null,
      ...toastPatch(`${deal.brand} counter withdrawn`, {kind: 'deal', id: deal.id, deal, dealIndex: index}),
    });
  };
  const applyUndo = () => {
    const undo = ui.toast?.undo;
    if (undo == null) return;
    if (undo.kind === 'pitch' && undo.prevStatus != null) {
      const pitch = pitches.byId[undo.id];
      update('pitches', {byId: {...pitches.byId, [undo.id]: {...pitch, status: undo.prevStatus}}});
    } else if (undo.kind === 'deal' && undo.deal != null && undo.dealIndex != null) {
      const order = [...deals.order];
      order.splice(undo.dealIndex, 0, undo.id);
      update('deals', {byId: {...deals.byId, [undo.id]: undo.deal}, order});
    }
    update('ui', toastPatch('Restored'));
  };

  // REFRESH — press swaps Inbox groups for skeleton rows ('Loading'
  // announced once); the NEXT user action (second press or active-tab
  // re-tap) resolves to identical rows + static 'Updated just now'.
  const onRefresh = () => {
    if (ui.skeleton === 'loading') {
      update('ui', {skeleton: 'updated', ...toastPatch('Updated just now')});
    } else {
      update('ui', {skeleton: 'loading', tab: 'inbox', ...toastPatch('Loading')});
    }
  };

  // Legend paths — Booked → Booked tab; Pending → Booked tab + AWAITING
  // header into view; Goal → Profile tab goal row.
  // Double-rAF lands AFTER the tab effect's scrollTop restore, so the
  // legend's target wins deterministically (all user-driven).
  const afterPaint = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));
  const legendBooked = () => {
    if (ui.tab !== 'booked') selectTab('booked');
  };
  const legendPending = () => {
    if (ui.tab !== 'booked') selectTab('booked');
    update('ui', {screenByTab: {...ui.screenByTab, booked: 'root'}});
    afterPaint(() => awaitingHeaderRef.current?.scrollIntoView({block: 'start'}));
  };
  const legendGoal = () => {
    update('ui', {goalStepperOpen: true});
    if (ui.tab !== 'profile') selectTab('profile');
    afterPaint(() => goalPillRef.current?.focus({preventScroll: true}));
  };

  const stepRate = (line: RateLine, delta: number) => {
    const next = Math.max(line.min, Math.min(line.max, line.price + delta));
    update('rates', {byId: {...ratesById, [line.id]: {...line, price: next}}});
  };
  const stepGoal = (delta: number) => {
    // ±$500, range 5,000–20,000; stepping DOWN below booked exercises the
    // strip's over-goal clamp branch (stress fixture 4).
    update('goal', {value: Math.max(5000, Math.min(20000, goal.value + delta))});
  };

  // Tab bar arrow keys (tablist contract).
  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TAB_META.map(tab => tab.id);
    const current = order.indexOf(ui.tab);
    const next =
      event.key === 'ArrowRight'
        ? order[(current + 1) % order.length]
        : order[(current + order.length - 1) % order.length];
    selectTab(next);
    document.getElementById(`plf-tab-${next}`)?.focus();
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // ---- per-tab content ----------------------------------------------------

  const renderInbox = () => {
    if (ui.skeleton === 'loading') {
      return (
        <>
          <div style={styles.subtitleBlock}>
            <span style={styles.subtitleText}>Checking for new pitches…</span>
          </div>
          <SkeletonCard />
          <div style={styles.bottomSpacer} />
        </>
      );
    }
    if (inboxCount === 0) {
      // TRUE-EMPTY (all pitches resolved): zero actions by contract.
      return (
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={InboxIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.emptyTitle}>No open pitches</h2>
          <p style={styles.emptyBody}>New brand pitches land here.</p>
        </div>
      );
    }
    const groups = GROUP_ORDER.map(group => ({
      ...group,
      items: inboxPitches.filter(pitch => groupFor(pitch, ratesById) === group.id),
    })).filter(group => group.items.length > 0); // empty groups drop their
    // header entirely — no empty listCard (stress fixture 5).
    return (
      <>
        <div style={styles.subtitleBlock}>
          <span style={styles.subtitleText}>
            {inboxCount} pitch{inboxCount === 1 ? '' : 'es'} · {fmtMoney(onTableTotal)} on the table
            {ui.skeleton === 'updated' ? ' · Updated just now' : ''}
          </span>
        </div>
        {groups.map(group => (
          <section key={group.id}>
            <h2 style={styles.sectionHeader}>{group.label}</h2>
            <div style={styles.listCard}>
              {group.items.map((pitch, index) => (
                <PitchRow
                  key={pitch.id}
                  pitch={pitch}
                  rates={ratesById}
                  monoIndex={pitches.order.indexOf(pitch.id)}
                  isExpanded={ui.expandedPitchId === pitch.id}
                  isSwipeOpen={ui.swipeOpenId === pitch.id}
                  isLast={index === group.items.length - 1}
                  reducedMotion={reducedMotion}
                  openFactorNotes={ui.openFactorNotes}
                  onToggleExpand={() =>
                    update('ui', {expandedPitchId: ui.expandedPitchId === pitch.id ? null : pitch.id})
                  }
                  onToggleFactor={index2 => {
                    const key = `${pitch.id}:${index2}`;
                    update('ui', {
                      openFactorNotes: {...ui.openFactorNotes, [key]: ui.openFactorNotes[key] !== true},
                    });
                  }}
                  onSwipeOpen={() => update('ui', {swipeOpenId: pitch.id})}
                  onSwipeClose={() => {
                    if (ui.swipeOpenId === pitch.id) update('ui', {swipeOpenId: null});
                  }}
                  onCounter={opener => openCounterSheet(pitch.id, opener)}
                  onEllipsis={opener => {
                    openerRef.current = opener;
                    update('ui', {actionSheetPitchId: pitch.id, swipeOpenId: null});
                  }}
                  onDecline={() => declinePitch(pitch)}
                  onAccept={() => acceptPitch(pitch)}
                />
              ))}
            </div>
          </section>
        ))}
        <div style={styles.bottomSpacer} />
      </>
    );
  };

  const renderBooked = () => {
    if (pushedDealId != null) {
      // dealDetail — the only push; back button pops.
      const deal = deals.byId[pushedDealId];
      const pitch = pitches.byId[pushedDealId];
      const brand = deal?.brand ?? pitch?.brand ?? '';
      const amount = deal?.amount ?? pitch?.offer ?? 0;
      const meta = deal?.metaLabel ?? `Booked ${TODAY_LABEL}`;
      const deliverable = deal?.deliverableLabel ?? pitch?.deliverableLabel ?? '';
      const contact = deal?.contact ?? 'via Pitchloft messages';
      return (
        <>
          <div style={styles.subtitleBlock}>
            <span style={styles.subtitleText}>Deal detail</span>
          </div>
          <div style={styles.listCard}>
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Amount</span>
              <span style={{...styles.utilityValue, fontWeight: 600, color: 'var(--color-text-primary)'}}>
                {fmtMoney(amount)}
              </span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Deliverables</span>
              <span style={styles.utilityValue}>{deliverable}</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Status</span>
              <span style={styles.utilityValue}>{meta}</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.utilityRow}>
              <span style={styles.utilityLabel}>Contact</span>
              <span style={styles.utilityValue}>{contact}</span>
            </div>
          </div>
          <div style={styles.bottomSpacer} />
        </>
      );
    }
    const bookedRows = [
      ...bookedDeals.map(deal => ({id: deal.id, brand: deal.brand, amount: deal.amount, meta: deal.metaLabel})),
      ...acceptedPitches.map(pitch => ({
        id: pitch.id,
        brand: pitch.brand,
        amount: pitch.offer,
        meta: `Booked ${TODAY_LABEL}`,
      })),
    ];
    const pendingRows = [
      ...pendingDeals.map(deal => ({id: deal.id, brand: deal.brand, amount: deal.amount, meta: deal.metaLabel, isDeal: true})),
      ...counteredPitches.map(pitch => ({
        id: pitch.id,
        brand: pitch.brand,
        amount: pitch.counterRate ?? 0,
        meta: `Countered ${pitch.counterDate} · awaiting reply`,
        isDeal: false,
      })),
    ];
    return (
      <>
        <h2 style={styles.sectionHeader}>Booked — {fmtMoney(bookedTotal)}</h2>
        <div style={styles.listCard}>
          {bookedRows.map((row, index) => (
            <div key={row.id}>
              <button
                type="button"
                className="plf-btn plf-focusable"
                style={styles.row60}
                aria-label={`${row.brand}, ${fmtMoney(row.amount)}, ${row.meta} — open deal`}
                onClick={() => update('ui', {screenByTab: {...ui.screenByTab, booked: row.id}})}>
                <span style={styles.row60Text}>
                  <span style={styles.row60Primary}>{row.brand}</span>
                  <span style={styles.row60Secondary}>{row.meta}</span>
                </span>
                <span style={styles.rowAmount}>{fmtMoney(row.amount)}</span>
              </button>
              {index < bookedRows.length - 1 ? <div style={styles.rowDivider} /> : null}
            </div>
          ))}
        </div>
        <h2 style={styles.sectionHeader} ref={awaitingHeaderRef}>
          Awaiting reply — {fmtMoney(pendingTotal)}
        </h2>
        {pendingRows.length === 0 ? (
          // Section-level empty (not a full emptyState block).
          <div style={styles.sectionCaption}>No counters awaiting reply</div>
        ) : (
          <div style={styles.listCard}>
            {pendingRows.map((row, index) => (
              <div key={row.id} style={{display: 'flex', alignItems: 'center'}}>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{...styles.row60, paddingInlineEnd: 0}}>
                    <span style={styles.row60Text}>
                      <span style={styles.row60Primary}>{row.brand}</span>
                      <span style={styles.row60Secondary}>{row.meta}</span>
                    </span>
                    <span style={styles.rowAmount}>{fmtMoney(row.amount)}</span>
                  </div>
                  {index < pendingRows.length - 1 ? <div style={styles.rowDivider} /> : null}
                </div>
                <button
                  type="button"
                  className="plf-btn plf-focusable"
                  style={styles.iconBtn}
                  aria-label={`Actions for ${row.brand} counter`}
                  aria-haspopup="dialog"
                  onClick={event => {
                    openerRef.current = event.currentTarget;
                    if (row.isDeal) update('ui', {actionSheetDealId: row.id});
                    else update('ui', {actionSheetPitchId: row.id});
                  }}>
                  <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div style={styles.bottomSpacer} />
      </>
    );
  };

  const renderRates = () => (
    <>
      <h2 style={styles.sectionHeader}>Your rate card</h2>
      <div style={styles.listCard}>
        {rates.order.map((id, index) => {
          const line = ratesById[id];
          const isOpen = ui.expandedRateId === id;
          return (
            <div key={id}>
              <button
                type="button"
                className="plf-btn plf-focusable"
                style={styles.row60}
                aria-expanded={isOpen}
                aria-label={`${line.label} rate ${fmtMoney(line.price)} — adjust`}
                onClick={() => update('ui', {expandedRateId: isOpen ? null : id})}>
                <span style={styles.row60Text}>
                  <span style={styles.row60Primary}>{line.label}</span>
                  <span style={styles.row60Secondary}>{line.lastUsed ?? 'Baseline'}</span>
                </span>
                <span style={styles.rateValue}>{fmtMoney(line.price)}</span>
              </button>
              {isOpen ? (
                <div style={styles.stepperPanel}>
                  <span style={styles.stepperLabel}>
                    Adjust in $25 steps · {fmtMoney(line.min)}–{fmtMoney(line.max)}
                  </span>
                  <span style={styles.stepper}>
                    <button
                      type="button"
                      className="plf-btn plf-focusable"
                      style={{...styles.stepperHalf, ...(line.price <= line.min ? {opacity: 0.35} : null)}}
                      aria-label={`Decrease ${line.label} rate`}
                      disabled={line.price <= line.min}
                      onClick={() => stepRate(line, -25)}>
                      <Icon icon={MinusIcon} size="sm" color="inherit" />
                    </button>
                    <span style={styles.stepperRule} aria-hidden />
                    <button
                      type="button"
                      className="plf-btn plf-focusable"
                      style={{...styles.stepperHalf, ...(line.price >= line.max ? {opacity: 0.35} : null)}}
                      aria-label={`Increase ${line.label} rate`}
                      disabled={line.price >= line.max}
                      onClick={() => stepRate(line, 25)}>
                      <Icon icon={PlusIcon} size="sm" color="inherit" />
                    </button>
                  </span>
                  <span
                    style={styles.stepperValue}
                    role="spinbutton"
                    tabIndex={0}
                    className="plf-focusable"
                    aria-label={`${line.label} rate`}
                    aria-valuenow={line.price}
                    aria-valuemin={line.min}
                    aria-valuemax={line.max}
                    aria-valuetext={fmtMoney(line.price)}
                    onKeyDown={event => {
                      if (event.key === 'ArrowUp') stepRate(line, 25);
                      if (event.key === 'ArrowDown') stepRate(line, -25);
                    }}>
                    {fmtMoney(line.price)}
                  </span>
                </div>
              ) : null}
              {index < rates.order.length - 1 ? <div style={styles.rowDivider} /> : null}
            </div>
          );
        })}
      </div>
      <div style={styles.sectionCaption}>
        Open pitches re-score live against these rates. Sent counters keep the rate they were sent at.
      </div>
      <div style={styles.bottomSpacer} />
    </>
  );

  const renderProfile = () => (
    <>
      <h2 style={styles.sectionHeader}>Creator</h2>
      <div style={styles.listCard}>
        <div style={styles.identityCard}>
          <span style={{...styles.monogram, background: MONO_BG[0], color: MONO_TEXT[0]}} aria-hidden>
            {initialsFor(CREATOR.name)}
          </span>
          <div style={styles.identityText}>
            <p style={styles.identityName}>{CREATOR.name}</p>
            <span style={styles.identityHandle}>{CREATOR.handle}</span>
          </div>
        </div>
        <div style={styles.nicheChipRow}>
          {CREATOR.niche.map(niche => (
            <span key={niche} style={styles.nicheChip}>
              {niche}
            </span>
          ))}
        </div>
      </div>
      <h2 style={styles.sectionHeader}>Goals & payouts</h2>
      <div style={styles.listCard}>
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Monthly goal</span>
          <button
            type="button"
            ref={goalPillRef}
            className="plf-btn plf-focusable"
            style={styles.goalPill}
            aria-expanded={ui.goalStepperOpen}
            aria-label={`Monthly goal ${fmtMoney(goal.value)} — adjust`}
            onClick={() => update('ui', {goalStepperOpen: !ui.goalStepperOpen})}>
            {fmtMoney(goal.value)}
          </button>
        </div>
        {ui.goalStepperOpen ? (
          <div style={styles.stepperPanel}>
            <span style={styles.stepperLabel}>±$500 · $5,000–$20,000</span>
            <span style={styles.stepper}>
              <button
                type="button"
                className="plf-btn plf-focusable"
                style={{...styles.stepperHalf, ...(goal.value <= 5000 ? {opacity: 0.35} : null)}}
                aria-label="Decrease monthly goal"
                disabled={goal.value <= 5000}
                onClick={() => stepGoal(-500)}>
                <Icon icon={MinusIcon} size="sm" color="inherit" />
              </button>
              <span style={styles.stepperRule} aria-hidden />
              <button
                type="button"
                className="plf-btn plf-focusable"
                style={{...styles.stepperHalf, ...(goal.value >= 20000 ? {opacity: 0.35} : null)}}
                aria-label="Increase monthly goal"
                disabled={goal.value >= 20000}
                onClick={() => stepGoal(500)}>
                <Icon icon={PlusIcon} size="sm" color="inherit" />
              </button>
            </span>
            <span
              style={styles.stepperValue}
              role="spinbutton"
              tabIndex={0}
              className="plf-focusable"
              aria-label="Monthly goal"
              aria-valuenow={goal.value}
              aria-valuemin={5000}
              aria-valuemax={20000}
              aria-valuetext={fmtMoney(goal.value)}
              onKeyDown={event => {
                if (event.key === 'ArrowUp') stepGoal(500);
                if (event.key === 'ArrowDown') stepGoal(-500);
              }}>
              {fmtMoney(goal.value)}
            </span>
          </div>
        ) : null}
        <div style={styles.rowDivider} />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Payout method</span>
          <span style={styles.utilityValue}>Direct deposit ··4417</span>
        </div>
        <div style={styles.rowDivider} />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Payout cadence</span>
          <span style={styles.utilityValue}>Fridays</span>
        </div>
      </div>
      <div style={styles.bottomSpacer} />
    </>
  );

  // ---- action sheet wiring --------------------------------------------------

  let actionSheetNode: ReactNode = null;
  if (actionPitch != null && actionPitch.status === 'open') {
    const baseline = baselineFor(actionPitch, ratesById);
    actionSheetNode = (
      <ActionSheet
        contextLabel={`Pitch from ${actionPitch.brand} · ${fmtMoney(actionPitch.offer)} for ${actionPitch.deliverableLabel}`}
        rows={[
          {
            id: 'counter',
            label: `Counter ${fmtMoney(baseline)}…`,
            // Never two sheets: close the actionSheet, THEN open the sheet.
            onSelect: () => openCounterSheet(actionPitch.id, openerRef.current),
          },
          {id: 'accept', label: `Accept ${fmtMoney(actionPitch.offer)}`, onSelect: () => acceptPitch(actionPitch)},
          {id: 'decline', label: 'Decline pitch', destructive: true, onSelect: () => declinePitch(actionPitch)},
        ]}
        cancelRef={cancelRef}
        sheetRef={actionSheetRef}
        onCancel={() => closeOverlays()}
      />
    );
  } else if (actionPitch != null && actionPitch.status === 'countered') {
    actionSheetNode = (
      <ActionSheet
        contextLabel={`Counter to ${actionPitch.brand} · ${fmtMoney(actionPitch.counterRate ?? 0)} awaiting reply`}
        rows={[
          {
            id: 'withdraw',
            label: 'Withdraw counter',
            destructive: true,
            onSelect: () => {
              update('pitches', {
                byId: {...pitches.byId, [actionPitch.id]: {...actionPitch, status: 'open'}},
              });
              update('ui', {
                actionSheetPitchId: null,
                ...toastPatch(`${actionPitch.brand} counter withdrawn`, {
                  kind: 'pitch',
                  id: actionPitch.id,
                  prevStatus: 'countered',
                }),
              });
            },
          },
        ]}
        cancelRef={cancelRef}
        sheetRef={actionSheetRef}
        onCancel={() => closeOverlays()}
      />
    );
  } else if (actionDeal != null) {
    actionSheetNode = (
      <ActionSheet
        contextLabel={`Counter to ${actionDeal.brand} · ${fmtMoney(actionDeal.amount)} awaiting reply`}
        rows={[
          {id: 'withdraw', label: 'Withdraw counter', destructive: true, onSelect: () => withdrawDeal(actionDeal)},
        ]}
        cancelRef={cancelRef}
        sheetRef={actionSheetRef}
        onCancel={() => closeOverlays()}
      />
    );
  }

  const pushedDeal = pushedDealId != null ? deals.byId[pushedDealId] ?? pitches.byId[pushedDealId] : null;
  const navTitle =
    ui.tab === 'booked' && pushedDeal != null
      ? 'brand' in pushedDeal
        ? pushedDeal.brand
        : ''
      : TAB_TITLES[ui.tab];

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{PLF_CSS}</style>
      <div ref={shellRef} style={shellStyle} onPointerDown={onShellPointerDown}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {ui.tab === 'booked' && pushedDealId != null ? (
              <button
                type="button"
                className="plf-btn plf-focusable"
                style={styles.backBtn}
                aria-label="Back to Booked"
                onClick={() => update('ui', {screenByTab: {...ui.screenByTab, booked: 'root'}})}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                Booked
              </button>
            ) : (
              <PitchloftMark />
            )}
          </div>
          <h1 style={styles.navTitle}>{navTitle}</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="plf-btn plf-focusable"
              style={styles.iconBtn}
              aria-label={ui.skeleton === 'loading' ? 'Finish refreshing pitches' : 'Refresh pitches'}
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* Pinned on ALL four tabs so the money strip answers everywhere. */}
        <MonthIncomeStrip
          booked={bookedTotal}
          pending={pendingTotal}
          goal={goal.value}
          projection={ui.counterSheet != null ? ui.counterSheet.draft : null}
          counteredSent={counteredPitches.length > 0}
          onBooked={legendBooked}
          onPending={legendPending}
          onGoal={legendGoal}
        />

        <main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          {ui.tab === 'inbox' ? renderInbox() : null}
          {ui.tab === 'booked' ? renderBooked() : null}
          {ui.tab === 'rates' ? renderRates() : null}
          {ui.tab === 'profile' ? renderProfile() : null}
        </main>

        {/* TOAST DOCK — the single polite live region; sticky-in-flow at
            bottom:76 above the tab bar; NO auto-dismiss timers. */}
        <div style={styles.toastDock} aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="plf-fade">
              <span style={styles.toastText}>{ui.toast.text}</span>
              {ui.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="plf-btn plf-focusable" style={styles.toastUndo} onClick={applyUndo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} role="tablist" aria-label="Pitchloft sections" onKeyDown={onTabKeyDown}>
          {TAB_META.map(tab => {
            const isActive = ui.tab === tab.id;
            const badge = tab.id === 'inbox' ? inboxCount : tab.id === 'booked' ? bookedBadge : 0;
            return (
              <button
                key={tab.id}
                id={`plf-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="plf-btn plf-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {badge > 0 ? <span style={styles.tabBadge}>{badge}</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {overlayOpen ? <div style={styles.sheetScrim} onClick={() => closeOverlays()} aria-hidden /> : null}
        {actionSheetNode}
        {sheetPitch != null && ui.counterSheet != null ? (
          <CounterSheet
            pitch={sheetPitch}
            rates={ratesById}
            draft={ui.counterSheet.draft}
            detent={ui.counterSheet.detent}
            reducedMotion={reducedMotion}
            sheetRef={sheetRef}
            onDraftChange={value => update('ui', {counterSheet: {...ui.counterSheet!, draft: value}})}
            onDetentChange={detent => update('ui', {counterSheet: {...ui.counterSheet!, detent}})}
            onSend={sendCounter}
            onClose={() => closeOverlays()}
          />
        ) : null}
      </div>
    </div>
  );
}
