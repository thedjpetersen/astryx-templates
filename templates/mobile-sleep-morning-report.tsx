// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Somnary morning report for ONE
 *   fixed night (Fri, Mar 14 — 11:42 PM to 7:08 AM, 446 minutes in bed):
 *   14 hypnogram stage segments with dual fields (startMin/durationMin +
 *   clock labels, avgHr + hrDip from the 64 bpm baseline, movements +
 *   movementLabel, ticket-shaped notes), four score factors summing to
 *   exactly 84/100, and stage aggregates (Core 245m · REM 103m · Deep 80m
 *   · Awake 18m = 446 ✓) that are cross-checked in comments beside the
 *   consts. No Date.now(), no Math.random(), no network media.
 * @output Somnary — Morning Sleep Report: a 390px MOBILE report surface
 *   where the hypnogram is the navigation spine. NavBar (28px CrescentMark
 *   · 'Morning report' + live segment subtitle · 44×44 Refresh) over a
 *   scoreHero (96px four-factor score ring '84 GOOD' beside '7h 08m
 *   asleep' + a 3-segment Refreshed/Okay/Groggy morning-feel control), the
 *   HypnogramRibbon (14 stepped stage bands at 4 elevation lanes with a
 *   draggable snap cursor), a segmentDetailCard flanked by 44×44 prev/next
 *   chevrons, four proportional-fill StageLegendChips, a 4-row SCORE
 *   FACTORS card, and a MEDIUM-detent stage/score sheet. Signature move:
 *   ONE cursorIndex scrubs all surfaces at once — ribbon cursor + segment
 *   opacity, detail card (stage, range, HR dip, movements, note), navBar
 *   subtitle ('12:36 – 1:12 AM · Deep'), legend-chip active ring, and
 *   chevron disabled states — reachable by chevrons, ribbon taps, cursor
 *   drag, legend-chip jump/cycle, ArrowLeft/Right on the slider, and sheet
 *   period rows.
 * @position Page template; emitted by `astryx template mobile-sleep-morning-report`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet) are position:'absolute' INSIDE
 *   shell; position:fixed is banned. While the sheet is open, shell locks
 *   to {height:'100dvh', overflow:'hidden'} and restores on close; the
 *   toast dock is sticky-in-flow (bottom 12), NOT shell-absolute, so it
 *   rides the viewport on this tall scrolling view (foundations
 *   amendment). The stage clips to --radius-container; shell paints
 *   full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16, none on the last row); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Somnary violet — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule). Every
 *   stage color is a color-mix derivative of BRAND_ACCENT (Deep 100% /
 *   Core 70% / REM 45% over the card) except Awake, which mixes
 *   var(--color-text-secondary) at 40% — no second brand literal. No text
 *   ever sits on a 100% BRAND_ACCENT fill (the Deep band is unlabeled);
 *   brand-tinted TEXT (#6D5AE6 on white ≈ 4.9:1, #A99BFF on the dark card
 *   ≈ 8.6:1) passes 4.5:1 in both schemes.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter via
 *   paddingInline:16 on every content block · 12px card gaps · 24px
 *   section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', hairline + blur ALWAYS ON — no
 *   scroll wiring, noted per contract); rows 44px utility / 60px two-line
 *   factor rows; sectionHeader 13px/600 uppercase 0.06em at 32px (16
 *   gutter + 16 card pad), 20px top / 8px bottom; sheet detents 55%
 *   medium / calc(100% − 56px) large, 24px grabber zone with 36×5 pill,
 *   52px sheet header; toast dock sticky bottom 12. TYPE (Figtree via
 *   --font-family-body): 28/700 score numeral · 22/700 '7h 08m asleep' ·
 *   17/600 nav + card titles · 16/400–600 body & row primary · 13/400
 *   secondary · 11/500 overlines, chip meta & axis ticks; nothing under
 *   11px; tabular-nums on the score, durations, bpm, percents, and every
 *   clock range. Touch: every target ≥44×44 with ≥8px clearance (legend
 *   grid gap 8, chevrons flank the card padding); the ribbon's per-segment
 *   hit ranges clamp to a 24px minimum with nearest-center overlap
 *   resolution; cursor drag, ribbon taps, and the sheet drag all have
 *   first-class button paths (chevrons, chips, grabber click, X).
 *
 * Responsive contract:
 * - Fluid 320–430px: HypnogramRibbon and ScoreRingFactors take width from
 *   useElementWidth on their card interiors (320px shell → 256px ribbon
 *   interior; 430px → 366px). Below 360px measured shell width the
 *   scoreHero right column wraps under the ring (flex-wrap) instead of
 *   compressing type. Legend chips stay a 2×2 grid at all widths.
 *   overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell becomes
 *   a centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline); sticky navBar/toast and the absolute sheet stay inside the
 *   column because they anchor to shell. No layout forking, no desktop
 *   asides.
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
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  RefreshCwIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Somnary violet). As TEXT: #6D5AE6 on
// #FFFFFF ≈ 4.9:1 (passes 4.5:1); #A99BFF on the dark card (~#1C1C1E) ≈
// 8.6:1. As FILL it is only ever the unlabeled Deep band, ring arcs, the
// cursor accents, and 2px rings — never under text.
const BRAND_ACCENT = 'light-dark(#6D5AE6, #A99BFF)';
// Stage fills — color-mix derivatives of BRAND_ACCENT over the card (Deep
// 100% / Core 70% / REM 45%); Awake mixes the secondary text token at 40%
// so no second brand literal exists.
const STAGE_FILL_DEEP = BRAND_ACCENT;
const STAGE_FILL_CORE = `color-mix(in srgb, ${BRAND_ACCENT} 70%, var(--color-background-card))`;
const STAGE_FILL_REM = `color-mix(in srgb, ${BRAND_ACCENT} 45%, var(--color-background-card))`;
const STAGE_FILL_AWAKE = 'color-mix(in srgb, var(--color-text-secondary) 40%, var(--color-background-card))';
// Brand washes: 12% chip/pill tint, 45% ribbon connectors.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
const CONNECTOR = 'color-mix(in srgb, var(--color-text-secondary) 45%, transparent)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, the visually-hidden text, the
// canHover row tint, and the reduced-motion guard. Transitions animate
// transform/opacity only and collapse to instant under
// prefers-reduced-motion.
// ---------------------------------------------------------------------------

const SOMNARY_CSS = `
.som-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.som-btn:disabled { cursor: default; }
.som-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.som-anim { transition: transform 240ms ease, opacity 240ms ease; }
.som-fade { transition: opacity 240ms ease; }
@keyframes som-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.som-sheet-in { animation: som-sheet-in 240ms ease; }
.som-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (hover: hover) {
  .som-hoverable:hover { background: color-mix(in srgb, var(--color-text-secondary) 8%, transparent); }
}
@media (prefers-reduced-motion: reduce) {
  .som-anim, .som-fade { transition: none; }
  .som-sheet-in { animation: none; }
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
  // Scroll lock while the sheet is open — the absolute sheet/scrim anchor
  // to the visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px icon buttons
  // optically align content to the 16px gutter. Hairline + blur ALWAYS ON
  // (this template does not wire scroll-under; noted per contract).
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
  // 44×44 non-interactive brand slot holding the 28px CrescentMark.
  brandSlot: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_ACCENT,
  },
  navCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    maxWidth: 200,
  },
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 200,
  },
  // Stress fixture 7: '11:54 PM – 12:36 AM · Core' (the longest subtitle,
  // crosses midnight) fits 200px at 11px without ellipsis.
  navSub: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 200,
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
  // SCORE HERO — 16px gutter/top, ring + right column; flex-wrap drops the
  // column under the ring below ~360px shell width (minWidth 216 + 96 ring
  // + 16 gap + 32 gutters = 360).
  scoreHero: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
    paddingTop: 16,
    paddingInline: 16,
  },
  ringWrap: {position: 'relative', width: 96, height: 96, flexShrink: 0},
  heroRight: {
    flex: 1,
    minWidth: 216,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  heroDuration: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
  },
  heroMeta: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  // feelSegmented — 36px visible track; each segment stretches to a 44px
  // hit via 4px transparent vertical padding (marginBlock −4).
  feelTrack: {
    display: 'flex',
    height: 36,
    marginTop: 6,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
    padding: 2,
  },
  feelSegment: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    marginBlock: -4,
    paddingBlock: 4,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  feelSegmentOn: {color: 'var(--color-text-primary)'},
  feelPill: {
    position: 'absolute',
    inset: '4px 0',
    borderRadius: 10,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    pointerEvents: 'none',
  },
  feelLabel: {position: 'relative'},
  // updatedCaption — role='status'; '' at rest, fixed 'Updated just now'
  // after the navBar refresh (no clock reads, idempotent).
  updatedCaption: {
    paddingInline: 16,
    marginTop: 8,
    minHeight: 18,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
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
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // HYPNOGRAM CARD — listCard + 16px interior padding, 12px above.
  hypnogramCard: {marginTop: 12, padding: 16},
  cardHeadRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  headTime: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Ribbon slider wrapper — the ONE focusable role='slider'; pointer taps
  // and drags snap to segment boundaries; touchAction none for the drag.
  ribbonBox: {
    position: 'relative',
    marginTop: 12,
    touchAction: 'none',
    borderRadius: 4,
  },
  axisRow: {position: 'relative', height: 16, marginTop: 4},
  axisTick: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // SEGMENT DETAIL CARD — chevrons flank the center stack; the 48m REM
  // note (stress fixture 3) wraps to two lines without pushing the 44×44
  // chevrons off target because they are flex-shrink 0 siblings.
  detailCard: {marginTop: 12},
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '12px 8px',
  },
  navChevron: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
  },
  navChevronDisabled: {opacity: 0.35},
  detailCenter: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  detailStage: {fontSize: 17, fontWeight: 600, lineHeight: 1.2},
  detailRange: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  pillRow: {display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2},
  statPill: {
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    background: 'var(--color-background-muted)',
    borderRadius: 999,
    padding: '3px 8px',
    whiteSpace: 'nowrap',
  },
  detailNote: {fontSize: 13, lineHeight: 1.45, marginTop: 2},
  detailFooter: {padding: '6px 8px 8px'},
  // 36px inline secondary button inside a 44px-tall hit (4px transparent
  // vertical padding), per the density grid's 36px inline-button row.
  stageDetailsBtn: {
    height: 44,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 4,
    borderRadius: 12,
  },
  stageDetailsPill: {
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // LEGEND CHIPS — 2×2 grid, gap 8, each 44px; proportional fill is an
  // absolutely positioned tint under the label (min 6px so Awake's 4%
  // stays visible without lying — stress fixture 4). Active ring is an
  // inset box-shadow, not a border, so layout is stable.
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginInline: 16,
    marginTop: 12,
  },
  legendChip: {
    position: 'relative',
    height: 44,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 1,
    paddingInline: 12,
  },
  legendFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
  },
  legendLabel: {position: 'relative', fontSize: 13, fontWeight: 600, lineHeight: 1.2},
  legendMeta: {
    position: 'relative',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.2,
  },
  // FACTORS CARD — 60px two-line rows; each row is a button opening the
  // score sheet scrolled to its explainer block.
  factorRow: {
    width: '100%',
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 10,
  },
  factorText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  factorNameRow: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  factorName: {fontSize: 16, fontWeight: 500},
  feelChip: {
    fontSize: 11,
    fontWeight: 500,
    color: BRAND_ACCENT,
    background: BRAND_TINT_12,
    borderRadius: 999,
    padding: '2px 8px',
    whiteSpace: 'nowrap',
  },
  factorReceipt: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.35,
  },
  factorPoints: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // footerNote — 44px utility row + 24px bottom padding.
  footerNote: {paddingBlock: '4px 24px', display: 'flex', justifyContent: 'center'},
  footerNoteBtn: {
    height: 44,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 16,
    borderRadius: 12,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // TOAST — the single aria-live region; STICKY-IN-FLOW at bottom 12
  // (foundations amendment: shell grows with content, so shell-absolute
  // would pin to the document bottom, off-viewport on this tall view).
  toastDock: {
    position: 'sticky',
    bottom: 12,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toast: {
    maxWidth: '100%',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    boxShadow: '0 4px 16px var(--color-shadow)',
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // SHEET — scrim z40 + sheet z41, absolute inside the locked shell.
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
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 24px'},
  // Stage aggregate stat row — Periods / Total / Longest / Share.
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
    marginBottom: 8,
  },
  statCell: {display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0},
  statValue: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
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
  // Per-period mini-list — 44px rows; tapping one sets cursorIndex and
  // closes the sheet (the sixth cursor path).
  periodRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 4,
    borderRadius: 10,
  },
  periodDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  periodRange: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  periodMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  prose: {fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: '12px 0 0'},
  explainerBlock: {marginBottom: 16},
  explainerHead: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  explainerName: {fontSize: 16, fontWeight: 600, flex: 1, minWidth: 0},
  explainerPoints: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  explainerProse: {fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: 0},
  bottomSpacer: {height: 12},
};

// ---------------------------------------------------------------------------
// FIXTURES — one frozen night, dual fields everywhere. Identity consts
// first; every aggregate is cross-checked in a comment beside its const.
// ---------------------------------------------------------------------------

const NIGHT_LABEL = 'Fri, Mar 14';
const BED_TIME = '11:42 PM';
const RISE_TIME = '7:08 AM';
// 11:42 PM → 7:08 AM = 18 (to midnight) + 428 = 446 minutes in bed ✓.
const TIME_IN_BED_MIN = 446;
const BASELINE_HR = 64;

type StageId = 'awake' | 'core' | 'deep' | 'rem';

interface SleepSegment {
  id: string;
  stage: StageId;
  rangeLabel: string; // '12:36 – 1:12 AM' (meridiem elided when shared)
  startMin: number; // minutes from 11:42 PM
  durationMin: number;
  durationLabel: string;
  avgHr: number;
  hrDip: number; // BASELINE_HR − avgHr, stored dual per house law
  movements: number;
  movementLabel: string; // 'Still' for 0 — zero-state copy, never blank
  note: string;
}

// CLOCK CONTINUITY VERIFIED end-to-end: each end = next start;
// 11:42 PM + 446m = 7:08 AM. Durations 12+42+36+28+23+43+28+6+44+32+44+16+
// 48+44 = 446 ✓. Movements 6+2+0+1+2+1+0+4+1+2+1+0+2+1 = 23 ✓. Weighted
// avg HR: (756+2436+1872+1596+1403+2408+1428+372+2420+1920+2376+800+2832+
// 2420) = 25039; 25039/446 = 56.1 → 'avg 56 bpm' ✓; lowest 50 (seg-12).
const SEGMENTS: SleepSegment[] = [
  {
    id: 'seg-01',
    stage: 'awake',
    rangeLabel: '11:42 – 11:54 PM',
    startMin: 0,
    durationMin: 12,
    durationLabel: '12m',
    avgHr: 63,
    hrDip: 1,
    movements: 6,
    movementLabel: '6 moves',
    note: 'Settled in over 12 minutes — 6 position changes while winding down is typical for you.',
  },
  {
    id: 'seg-02',
    stage: 'core',
    rangeLabel: '11:54 PM – 12:36 AM',
    startMin: 12,
    durationMin: 42,
    durationLabel: '42m',
    avgHr: 58,
    hrDip: 6,
    movements: 2,
    movementLabel: '2 moves',
    note: 'First core block eased heart rate from 63 down to 58 inside the opening cycle.',
  },
  {
    id: 'seg-03',
    stage: 'deep',
    rangeLabel: '12:36 – 1:12 AM',
    startMin: 54,
    durationMin: 36,
    durationLabel: '36m',
    avgHr: 52,
    hrDip: 12,
    movements: 0,
    movementLabel: 'Still',
    note: 'First deep block of the night — heart rate ran 12 under baseline with zero movement.',
  },
  {
    id: 'seg-04',
    stage: 'core',
    rangeLabel: '1:12 – 1:40 AM',
    startMin: 90,
    durationMin: 28,
    durationLabel: '28m',
    avgHr: 57,
    hrDip: 7,
    movements: 1,
    movementLabel: '1 move',
    note: 'Short core bridge between your first deep block and the first REM window.',
  },
  {
    id: 'seg-05',
    stage: 'rem',
    rangeLabel: '1:40 – 2:03 AM',
    startMin: 118,
    durationMin: 23,
    durationLabel: '23m',
    avgHr: 61,
    hrDip: 3,
    movements: 2,
    movementLabel: '2 moves',
    note: 'First REM window arrived 1h 58m after lights out — inside the normal range for a second cycle.',
  },
  {
    id: 'seg-06',
    stage: 'core',
    rangeLabel: '2:03 – 2:46 AM',
    startMin: 141,
    durationMin: 43,
    durationLabel: '43m',
    avgHr: 56,
    hrDip: 8,
    movements: 1,
    movementLabel: '1 move',
    note: 'Longest mid-night core stretch; movement stayed at a single reposition.',
  },
  {
    id: 'seg-07',
    stage: 'deep',
    rangeLabel: '2:46 – 3:14 AM',
    startMin: 184,
    durationMin: 28,
    durationLabel: '28m',
    avgHr: 51,
    hrDip: 13,
    movements: 0,
    movementLabel: 'Still',
    note: 'Second deep block held 51 bpm for 28 straight minutes.',
  },
  // Stress fixture 1: 6 minutes = 6/446 = 1.35% of ribbon width (~3.5px at
  // a 256px interior) — forces the min-24px hit clamp + nearest-center
  // overlap resolution; 4 movements in 6m is the densest movement note.
  {
    id: 'seg-08',
    stage: 'awake',
    rangeLabel: '3:14 – 3:20 AM',
    startMin: 212,
    durationMin: 6,
    durationLabel: '6m',
    avgHr: 62,
    hrDip: 2,
    movements: 4,
    movementLabel: '4 moves',
    note: 'Brief 3:14 AM waking — 4 movements in 6 minutes, then straight back into core.',
  },
  {
    id: 'seg-09',
    stage: 'core',
    rangeLabel: '3:20 – 4:04 AM',
    startMin: 218,
    durationMin: 44,
    durationLabel: '44m',
    avgHr: 55,
    hrDip: 9,
    movements: 1,
    movementLabel: '1 move',
    note: 'Recovery core block after the waking; heart rate resettled at 55.',
  },
  {
    id: 'seg-10',
    stage: 'rem',
    rangeLabel: '4:04 – 4:36 AM',
    startMin: 262,
    durationMin: 32,
    durationLabel: '32m',
    avgHr: 60,
    hrDip: 4,
    movements: 2,
    movementLabel: '2 moves',
    note: 'Mid-morning REM period — 32 minutes in the dreaming heart-rate range.',
  },
  // Stress fixture 2: seg-09 / seg-11 / seg-14 are a three-way Core tie at
  // 44m — the detail card disambiguates identical stage+duration by clock
  // range, and legend-chip cycling must visit all six Core periods in
  // order and wrap.
  {
    id: 'seg-11',
    stage: 'core',
    rangeLabel: '4:36 – 5:20 AM',
    startMin: 294,
    durationMin: 44,
    durationLabel: '44m',
    avgHr: 54,
    hrDip: 10,
    movements: 1,
    movementLabel: '1 move',
    note: 'Steady pre-dawn core; tied for your longest core block at 44m.',
  },
  {
    id: 'seg-12',
    stage: 'deep',
    rangeLabel: '5:20 – 5:36 AM',
    startMin: 338,
    durationMin: 16,
    durationLabel: '16m',
    avgHr: 50,
    hrDip: 14,
    movements: 0,
    movementLabel: 'Still',
    note: 'Heart rate bottomed out at 50 bpm — 14 below waking baseline — with zero recorded movement.',
  },
  // Stress fixture 3: the longest note — must wrap to two lines in the
  // detail card at 320px without pushing the chevrons off 44px targets.
  {
    id: 'seg-13',
    stage: 'rem',
    rangeLabel: '5:36 – 6:24 AM',
    startMin: 354,
    durationMin: 48,
    durationLabel: '48m',
    avgHr: 59,
    hrDip: 5,
    movements: 2,
    movementLabel: '2 moves',
    note: 'Longest REM block of the night — late-cycle REM rebound after the 3:14 AM waking; heart rate held 5 bpm under baseline for 48 straight minutes.',
  },
  {
    id: 'seg-14',
    stage: 'core',
    rangeLabel: '6:24 – 7:08 AM',
    startMin: 402,
    durationMin: 44,
    durationLabel: '44m',
    avgHr: 55,
    hrDip: 9,
    movements: 1,
    movementLabel: '1 move',
    note: 'Final core block carried you to the alarm; movement stayed at one reposition.',
  },
];

interface StageMeta {
  id: StageId;
  label: string;
  fill: string;
  laneY: number; // band top edge in the 132px-tall ribbon
  totalMin: number;
  totalLabel: string;
  periods: number;
  longestMin: number;
  longestLabel: string;
  pct: number; // rounded share of night — displayed percents sum to 100
  sheetTitle: string;
  typicalProse: string;
}

// Stage totals cross-check: Awake 12+6 = 18m (2 periods, longest 12m);
// Deep 36+28+16 = 80m (3, longest 36m); REM 23+32+48 = 103m (3, longest
// 48m); Core 42+28+43+44+44+44 = 245m (6, longest 44m). 18+80+103+245 =
// 446 ✓; periods 2+3+3+6 = 14 ✓. Shares: Core 245/446 = 54.93 → 55%; REM
// 103/446 = 23.09 → 23%; Deep 80/446 = 17.94 → 18%; Awake 18/446 = 4.04 →
// 4%; 55+23+18+4 = 100 ✓ (durations chosen so rounded shares sum to 100 —
// do not 'fix' this).
const STAGE_META: Record<StageId, StageMeta> = {
  awake: {
    id: 'awake',
    label: 'Awake',
    fill: STAGE_FILL_AWAKE,
    laneY: 8,
    totalMin: 18,
    totalLabel: '18m',
    periods: 2,
    longestMin: 12,
    longestLabel: '12m',
    pct: 4,
    sheetTitle: 'Awake time',
    typicalProse:
      'Brief awakenings totaling under 20 minutes are normal; you were awake 18m across two periods — a 12m sleep onset and a single 6m waking at 3:14 AM.',
  },
  rem: {
    id: 'rem',
    label: 'REM',
    fill: STAGE_FILL_REM,
    laneY: 40,
    totalMin: 103,
    totalLabel: '1h 43m',
    periods: 3,
    longestMin: 48,
    longestLabel: '48m',
    pct: 23,
    sheetTitle: 'REM sleep',
    typicalProse:
      'REM typically covers 20–25% of the night; you reached 23%, with a strong 48m late-cycle block ending at 6:24 AM — REM naturally back-loads toward morning.',
  },
  core: {
    id: 'core',
    label: 'Core',
    fill: STAGE_FILL_CORE,
    laneY: 72,
    totalMin: 245,
    totalLabel: '4h 05m',
    periods: 6,
    longestMin: 44,
    longestLabel: '44m',
    pct: 55,
    sheetTitle: 'Core sleep',
    typicalProse:
      'Core (light) sleep usually fills 40–60% of the night; you spent 55% there across six blocks — the connective tissue between your deep and REM cycles.',
  },
  deep: {
    id: 'deep',
    label: 'Deep',
    fill: STAGE_FILL_DEEP,
    laneY: 104,
    totalMin: 80,
    totalLabel: '1h 20m',
    periods: 3,
    longestMin: 36,
    longestLabel: '36m',
    pct: 18,
    sheetTitle: 'Deep sleep',
    typicalProse:
      'Adults typically spend 13–23% of the night in deep sleep; you hit 18% — deep pressure was front-loaded, with your longest block (36m) ending at 1:12 AM.',
  },
};

// Legend order = share order: Core 55, REM 23, Deep 18, Awake 4.
const LEGEND_ORDER: StageId[] = ['core', 'rem', 'deep', 'awake'];

// ASLEEP_MIN = 446 − 18 awake = 428 → '7h 08m asleep'; in bed 446 →
// '7h 26m'; onset = seg-01's 12m; mid-night wakes = 1 (seg-08 only).
const ASLEEP_LABEL = '7h 08m';
const HERO_META = 'In bed 7h 26m · Fell asleep in 12m · Woke once';

interface ScoreFactor {
  id: string;
  name: string;
  earned: number;
  weight: number;
  receipt: string;
  explainer: string;
}

// SCORE = 27+21+20+16 = 84 → band 'GOOD' (80–89) ✓. Weights 30+25+25+20 =
// 100 ✓. Ring sweeps: weight × 3.6° → 108/90/90/72 = 360 ✓; fills:
// Duration 27/30 = 90%, Restfulness 21/25 = 84%, Consistency 20/25 = 80%,
// Timing 16/20 = 80%. Midpoint: 11:42 PM + 223m = 3:25 AM (223 = 446/2,
// rounded down ✓).
const SCORE_FACTORS: ScoreFactor[] = [
  {
    id: 'duration',
    name: 'Duration',
    earned: 27,
    weight: 30,
    receipt: '7h 08m of 7h 30m goal',
    explainer:
      'You slept 7h 08m of your 7h 30m goal — 95% of target (428 of 450 minutes). Duration is weighted heaviest (30 points) because total sleep predicts next-day recovery more than any other single input.',
  },
  {
    id: 'restfulness',
    name: 'Restfulness',
    earned: 21,
    weight: 25,
    receipt: '23 movements · avg 56 bpm, low 50',
    explainer:
      '23 movements across the night, heart rate averaging 56 bpm and bottoming at 50 — 14 under your waking baseline of 64. Fewer than 20 movements would have earned the full 25.',
  },
  {
    id: 'consistency',
    name: 'Consistency',
    earned: 20,
    weight: 25,
    receipt: 'Bedtime 11:42 PM, 24 min after 7-day median 11:18 PM',
    explainer:
      'Lights-out at 11:42 PM ran 24 minutes behind your 7-day median of 11:18 PM. Keeping bedtime inside a 15-minute band restores the full 25.',
  },
  {
    id: 'timing',
    name: 'Timing',
    earned: 16,
    weight: 20,
    receipt: 'Sleep midpoint 3:25 AM vs 3:00 AM target',
    explainer:
      'Your sleep midpoint landed at 3:25 AM against a 3:00 AM target — the whole night shifted late. Timing tracks circadian alignment, not length; an earlier lights-out moves this fastest.',
  },
];

const SCORE_TOTAL = 84; // 27+21+20+16 ✓
const SCORE_BAND = 'GOOD'; // 80–89

type FeelId = 'refreshed' | 'okay' | 'groggy';

const FEEL_OPTIONS: {id: FeelId; label: string}[] = [
  {id: 'refreshed', label: 'Refreshed'},
  {id: 'okay', label: 'Okay'},
  {id: 'groggy', label: 'Groggy'},
];

// Axis ticks — minutes from 11:42 PM: midnight = 18, 2 AM = 138, 4 AM =
// 258, 6 AM = 378 (each +120 ✓); rendered as left-% of the ribbon width.
const AXIS_TICKS: {label: string; min: number}[] = [
  {label: '12 AM', min: 18},
  {label: '2 AM', min: 138},
  {label: '4 AM', min: 258},
  {label: '6 AM', min: 378},
];

// Ribbon geometry — 4 elevation lanes (band top edges), 18px thick bands,
// 132px tall SVG.
const RIBBON_H = 132;
const BAND_H = 18;
// Hit ranges clamp to a 24px minimum; overlaps resolve by nearest center.
const MIN_HIT_PX = 24;

// ---------------------------------------------------------------------------
// STATE — ONE state owner at the root; single update(patch). No
// child-owned state except transient pointer-drag refs.
// ---------------------------------------------------------------------------

type SheetStage = StageId | 'score';

interface AppState {
  cursorIndex: number; // opens on seg-03, the first Deep block
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  sheetStage: SheetStage | null;
  sheetFactor: string | null; // explainer block the score sheet scrolls to
  refreshed: boolean;
  morningFeel: FeelId | null;
  toast: {seq: number; text: string} | null;
}

const INITIAL_APP: AppState = {
  cursorIndex: 2,
  sheetOpen: false,
  sheetDetent: 'medium',
  sheetStage: null,
  sheetFactor: null,
  refreshed: false,
  morningFeel: null,
  toast: null,
};

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver can tell the
 * 390px mobile stage from the desktop stage; also measures the hypnogram
 * card interior for the ribbon SVG.
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
// CRESCENT MARK — 28px inline SVG: moon crescent with three descending
// square 'stage step' notches cut into the inner edge (moon + hypnogram
// staircase); currentColor is BRAND_ACCENT via the brandSlot style.
// ---------------------------------------------------------------------------

function CrescentMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <mask id="som-crescent">
          <rect width={28} height={28} fill="#fff" />
          {/* Offset circle carves the crescent... */}
          <circle cx={19.5} cy={9.5} r={9.5} fill="#000" />
          {/* ...and three descending stage-step notches bite the inner edge. */}
          <rect x={12} y={9} width={4} height={4} fill="#000" />
          <rect x={15} y={13} width={4} height={4} fill="#000" />
          <rect x={18} y={17} width={4} height={4} fill="#000" />
        </mask>
        <circle cx={13} cy={15} r={11} fill="currentColor" mask="url(#som-crescent)" />
      </svg>
      <span className="som-vh">Somnary</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SCORE RING FACTORS — 96px SVG ring (r 42, strokeWidth 8) split into four
// weighted arcs with 4° gaps (Duration 108° / Restfulness 90° /
// Consistency 90° / Timing 72°); each arc has a muted track plus a brand
// fill sweep = earned/weight. strokeLinecap 'butt' keeps the sectors
// distinct at 96px (stress fixture 6: the 90% Duration arc and 80% Timing
// arc sit adjacent without the gaps vanishing). Decorative — aria-hidden
// with an sr-only sentence carrying the values.
// ---------------------------------------------------------------------------

const RING_C = 48;
const RING_R = 42;

function ringPolar(deg: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: RING_C + RING_R * Math.sin(rad), y: RING_C - RING_R * Math.cos(rad)};
}

function ringArc(fromDeg: number, toDeg: number): string {
  const from = ringPolar(fromDeg);
  const to = ringPolar(toDeg);
  const largeArcFlag = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${RING_R} ${RING_R} 0 ${largeArcFlag} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

function ScoreRingFactors() {
  let cursorDeg = 0;
  const arcs = SCORE_FACTORS.map(factor => {
    const sweep = factor.weight * 3.6; // 30→108°, 25→90°, 20→72°
    const a0 = cursorDeg + 2; // 4° gaps: 2° shaved from each side
    const a1 = cursorDeg + sweep - 2;
    cursorDeg += sweep;
    return {id: factor.id, a0, a1, fillTo: a0 + (a1 - a0) * (factor.earned / factor.weight)};
  });
  return (
    <div style={styles.ringWrap}>
      <svg width={96} height={96} viewBox="0 0 96 96" fill="none" aria-hidden>
        {arcs.map(arc => (
          <g key={arc.id}>
            <path d={ringArc(arc.a0, arc.a1)} stroke="var(--color-background-muted)" strokeWidth={8} strokeLinecap="butt" />
            <path d={ringArc(arc.a0, arc.fillTo)} stroke={BRAND_ACCENT} strokeWidth={8} strokeLinecap="butt" />
          </g>
        ))}
        {/* SVG center text uses var(--color-text-primary) — var(--color-text)
            does NOT exist in this token set. */}
        <text
          x={48}
          y={50}
          textAnchor="middle"
          fontSize={28}
          fontWeight={700}
          fill="var(--color-text-primary)"
          style={{fontVariantNumeric: 'tabular-nums'}}>
          {SCORE_TOTAL}
        </text>
        <text
          x={48}
          y={64}
          textAnchor="middle"
          fontSize={11}
          fontWeight={500}
          letterSpacing="0.06em"
          fill="var(--color-text-secondary)">
          {SCORE_BAND}
        </text>
      </svg>
      <span className="som-vh">
        Sleep score 84, good. Duration 27 of 30, Restfulness 21 of 25, Consistency 20 of 25, Timing 16 of 20.
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HYPNOGRAM RIBBON — the navigation spine. 14 stepped stage bands at 4
// elevation lanes (Awake y=8 / REM y=40 / Core y=72 / Deep y=104, 18px
// thick) joined by 2px vertical connectors; a 2px cursor line + 12px
// handle dot rides the active segment. The wrapper is the ONE focusable
// role='slider' (ArrowLeft/Right move a segment; Home/End jump); pointer
// taps and drags resolve through hit ranges clamped to ≥24px with
// nearest-center overlap resolution (stress fixture 1: seg-08 is ~3.5px
// wide at a 256px interior).
// ---------------------------------------------------------------------------

interface HypnogramRibbonProps {
  width: number;
  cursorIndex: number;
  onCursorChange: (index: number) => void;
}

function segmentCenterX(index: number, scale: number): number {
  const segment = SEGMENTS[index];
  return (segment.startMin + segment.durationMin / 2) * scale;
}

function hitIndexForX(x: number, scale: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < SEGMENTS.length; i++) {
    const cx = segmentCenterX(i, scale);
    const half = Math.max(SEGMENTS[i].durationMin * scale, MIN_HIT_PX) / 2;
    const dist = Math.abs(x - cx);
    // Candidates are segments whose (≥24px) hit range covers x; overlaps
    // resolve by nearest segment center. Fallback: nearest center overall.
    const inRange = dist <= half;
    const score = inRange ? dist : dist + 10000;
    if (score < bestDist) {
      bestDist = score;
      best = i;
    }
  }
  return best;
}

function HypnogramRibbon({width, cursorIndex, onCursorChange}: HypnogramRibbonProps) {
  const draggingRef = useRef(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const scale = width > 0 ? width / TIME_IN_BED_MIN : 0;
  const active = SEGMENTS[cursorIndex];
  const activeMeta = STAGE_META[active.stage];

  const indexFromEvent = (event: ReactPointerEvent<HTMLDivElement>): number => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (rect == null || scale === 0) return cursorIndex;
    return hitIndexForX(event.clientX - rect.left, scale);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onCursorChange(indexFromEvent(event));
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    // Dragging snaps continuously to segment boundaries (indices).
    onCursorChange(indexFromEvent(event));
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(0, cursorIndex - 1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(SEGMENTS.length - 1, cursorIndex + 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = SEGMENTS.length - 1;
    if (next != null) {
      event.preventDefault();
      onCursorChange(next);
    }
  };

  const cursorX = scale > 0 ? segmentCenterX(cursorIndex, scale) : 0;
  const handleY = activeMeta.laneY + BAND_H / 2;

  return (
    <div
      ref={boxRef}
      style={styles.ribbonBox}
      className="som-focusable"
      role="slider"
      tabIndex={0}
      aria-label="Sleep stage timeline"
      aria-orientation="horizontal"
      aria-valuemin={0}
      aria-valuemax={SEGMENTS.length - 1}
      aria-valuenow={cursorIndex}
      aria-valuetext={`${activeMeta.label}, ${active.rangeLabel}, ${active.durationMin} minutes`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}>
      {width > 0 ? (
        <svg width={width} height={RIBBON_H} viewBox={`0 0 ${width} ${RIBBON_H}`} fill="none" aria-hidden>
          {/* 2px vertical connectors between consecutive band centers. */}
          {SEGMENTS.slice(0, -1).map((segment, index) => {
            const next = SEGMENTS[index + 1];
            const x = (segment.startMin + segment.durationMin) * scale;
            const y0 = STAGE_META[segment.stage].laneY + BAND_H / 2;
            const y1 = STAGE_META[next.stage].laneY + BAND_H / 2;
            return (
              <rect
                key={`conn-${segment.id}`}
                x={x - 1}
                y={Math.min(y0, y1)}
                width={2}
                height={Math.abs(y1 - y0)}
                fill={CONNECTOR}
              />
            );
          })}
          {/* Square-cornered stepped bands — the silhouette IS the design. */}
          {SEGMENTS.map((segment, index) => (
            <rect
              key={segment.id}
              className="som-fade"
              x={segment.startMin * scale}
              y={STAGE_META[segment.stage].laneY}
              width={segment.durationMin * scale}
              height={BAND_H}
              fill={STAGE_META[segment.stage].fill}
              opacity={index === cursorIndex ? 1 : 0.7}
            />
          ))}
          {/* Cursor — 2px full-height line + 12px handle dot on the active
              lane; the g translates so the slide is transform-only. */}
          <g className="som-anim" style={{transform: `translateX(${cursorX.toFixed(1)}px)`}}>
            <rect x={-1} y={0} width={2} height={RIBBON_H} fill="var(--color-text-primary)" />
            <circle cx={0} cy={handleY} r={6} fill="var(--color-text-primary)" stroke="var(--color-background-card)" strokeWidth={2} />
          </g>
        </svg>
      ) : (
        <div style={{height: RIBBON_H}} />
      )}
      {/* 16px axis row — aria-hidden decorations only. */}
      <div style={styles.axisRow} aria-hidden>
        {AXIS_TICKS.map(tick => (
          <span key={tick.label} style={{...styles.axisTick, left: `${((tick.min / TIME_IN_BED_MIN) * 100).toFixed(2)}%`}}>
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STAGE LEGEND CHIPS — 2×2 grid of 44px chip-buttons whose backgrounds
// fill proportionally to the stage's share of the night (min 6px so the
// Awake 4% fill stays visible without lying — stress fixture 4). Tap =
// segment-jump: first period of that stage, or the NEXT period when the
// cursor is already on that stage (wrapping — visits all six Core
// periods in order, stress fixture 2). The chip matching the cursor's
// stage carries a 2px BRAND_ACCENT ring (inset box-shadow, so layout is
// stable).
// ---------------------------------------------------------------------------

interface StageLegendChipsProps {
  cursorIndex: number;
  onJump: (stage: StageId) => void;
}

function StageLegendChips({cursorIndex, onJump}: StageLegendChipsProps) {
  const activeStage = SEGMENTS[cursorIndex].stage;
  return (
    <div style={styles.legendGrid}>
      {LEGEND_ORDER.map(stageId => {
        const meta = STAGE_META[stageId];
        const isActive = stageId === activeStage;
        return (
          <button
            key={stageId}
            type="button"
            className="som-btn som-focusable som-hoverable"
            style={{
              ...styles.legendChip,
              ...(isActive ? {boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`} : null),
            }}
            aria-pressed={isActive}
            aria-label={`${meta.label}, ${meta.pct} percent, ${meta.totalLabel} — jump to ${
              isActive ? 'next' : 'first'
            } ${meta.label} period`}
            onClick={() => onJump(stageId)}>
            <span
              style={{
                ...styles.legendFill,
                width: `max(${meta.pct}%, 6px)`,
                background: `color-mix(in srgb, ${meta.fill} 28%, transparent)`,
              }}
              aria-hidden
            />
            <span style={styles.legendLabel}>{meta.label}</span>
            <span style={styles.legendMeta}>
              {meta.pct}% · {meta.totalLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; pointer drag between detents is garnish, >120px past
// medium closes), 52px header with 44×44 X, focus-trapped dialog. Only
// one sheet mounts at a time; MEDIUM = 55% of the locked 100dvh shell,
// LARGE = calc(100% − 56px).
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  bodyRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function Sheet({
  titleId,
  title,
  detent,
  onDetentChange,
  onClose,
  sheetRef,
  closeBtnRef,
  bodyRef,
  reducedMotion,
  children,
}: SheetProps) {
  // Transient pointer-drag delta only — the detent itself lives in the
  // single state owner.
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

  const translate = dragY != null && dragY > 0 ? `translateY(${dragY}px)` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="som-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="som-btn som-focusable"
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
          ref={closeBtnRef}
          className="som-btn som-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div ref={bodyRef} style={styles.sheetBody}>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileSleepMorningReportTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ONE STATE OWNER — single update(patch); every surface calls it.
  const [app, setApp] = useState<AppState>(INITIAL_APP);
  const update = useCallback((patch: Partial<AppState>) => {
    setApp(current => ({...current, ...patch}));
  }, []);

  // Ribbon interior width — measured on the hypnogram card's padded box
  // (320px shell → 256px; 430px column → 366px).
  const ribbonHostRef = useRef<HTMLDivElement | null>(null);
  const ribbonWidth = useElementWidth(ribbonHostRef);

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetBodyRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);

  const segment = SEGMENTS[app.cursorIndex];
  const segmentMeta = STAGE_META[segment.stage];
  const feelLabel = app.morningFeel != null ? FEEL_OPTIONS.find(option => option.id === app.morningFeel)?.label : null;

  const toastPatch = (text: string) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text}};
  };

  // Toast auto-clears after 4s (fixed interval — no clock reads).
  useEffect(() => {
    if (app.toast == null) return undefined;
    const timer = setTimeout(() => update({toast: null}), 4000);
    return () => clearTimeout(timer);
  }, [app.toast, update]);

  // Focus moves to the sheet's close button on open — preventScroll
  // (foundations amendment): plain .focus() scroll-reveals the animating
  // sheet inside the locked overflow-hidden column and beaches it
  // mid-screen; the scrollTop reset is the belt to that suspender.
  useEffect(() => {
    if (app.sheetOpen) {
      sheetCloseRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [app.sheetOpen]);

  // Factor rows open the score sheet scrolled to their explainer block.
  useEffect(() => {
    if (!app.sheetOpen || app.sheetStage !== 'score' || app.sheetFactor == null) return;
    const body = sheetBodyRef.current;
    const block = body?.querySelector<HTMLElement>(`[data-factor="${app.sheetFactor}"]`);
    if (body != null && block != null) {
      body.scrollTop = block.offsetTop - body.offsetTop - 4;
    }
  }, [app.sheetOpen, app.sheetStage, app.sheetFactor]);

  // SHEET LIFECYCLE ----------------------------------------------------------

  const openSheet = (sheetStage: SheetStage, opener: HTMLElement | null, sheetFactor: string | null = null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update({sheetOpen: true, sheetStage, sheetFactor, sheetDetent: 'medium'});
  };
  const closeSheet = () => {
    update({sheetOpen: false, sheetStage: null, sheetFactor: null, sheetDetent: 'medium'});
    sheetOpenerRef.current?.focus();
  };

  // Escape closes the topmost overlay only — the sheet is the sole layer.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !app.sheetOpen) return;
      closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.sheetOpen]);

  // CURSOR PATHS — (a) chevrons, (b) ribbon taps, (c) handle drag,
  // (d) legend jump/cycle, (e) slider arrow keys, (f) sheet period rows.
  const setCursor = (index: number) => {
    update({cursorIndex: Math.max(0, Math.min(SEGMENTS.length - 1, index))});
  };
  const jumpToStage = (stage: StageId) => {
    const indices = SEGMENTS.map((seg, index) => (seg.stage === stage ? index : -1)).filter(index => index >= 0);
    if (SEGMENTS[app.cursorIndex].stage === stage) {
      const position = indices.indexOf(app.cursorIndex);
      setCursor(indices[(position + 1) % indices.length]); // cycle + wrap
    } else {
      setCursor(indices[0]);
    }
  };
  const pickPeriod = (index: number) => {
    update({
      cursorIndex: index,
      sheetOpen: false,
      sheetStage: null,
      sheetFactor: null,
      sheetDetent: 'medium',
    });
    sheetOpenerRef.current?.focus();
  };

  // REFRESH — fixed string, role='status' caption + the one toast region;
  // idempotent, no clock.
  const onRefresh = () => {
    update({refreshed: true, ...toastPatch('Updated just now')});
  };

  // MORNING FEEL — radiogroup write with observable cross-surface
  // consequences: hero meta appends ' · Felt Groggy', the Restfulness
  // factor row grows a 'You: Groggy' chip, and the toast announces.
  const onFeelSelect = (feel: FeelId) => {
    update({morningFeel: feel, ...toastPatch('Morning feel saved')});
  };
  const onFeelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const current = FEEL_OPTIONS.findIndex(option => option.id === app.morningFeel);
    const start = current === -1 ? 0 : current;
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = FEEL_OPTIONS[(start + delta + FEEL_OPTIONS.length) % FEEL_OPTIONS.length];
    onFeelSelect(next.id);
    const group = event.currentTarget;
    const buttons = group.querySelectorAll<HTMLButtonElement>('button');
    buttons[(start + delta + FEEL_OPTIONS.length) % FEEL_OPTIONS.length]?.focus();
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(app.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const sheetStageMeta = app.sheetStage != null && app.sheetStage !== 'score' ? STAGE_META[app.sheetStage] : null;
  const sheetTitle = app.sheetStage === 'score' ? 'About this score' : sheetStageMeta?.sheetTitle ?? '';
  const sheetPeriods =
    sheetStageMeta != null
      ? SEGMENTS.map((seg, index) => ({seg, index})).filter(entry => entry.seg.stage === sheetStageMeta.id)
      : [];

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SOMNARY_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <CrescentMark />
          </div>
          <div style={styles.navCenter}>
            <h1 style={styles.navTitle}>Morning report</h1>
            {/* Subtitle answers for the cursor: NIGHT_LABEL at rest, the
                segment range once a cursor exists (it opens on seg-03). */}
            <span style={styles.navSub}>
              {app.cursorIndex >= 0 ? `${segment.rangeLabel} · ${segmentMeta.label}` : NIGHT_LABEL}
            </span>
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="som-btn som-focusable"
              style={styles.iconBtn}
              aria-label="Refresh report"
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {/* SCORE HERO — ring + duration column; the feel radiogroup's
              write echoes into the meta line and the Restfulness row. */}
          <div style={styles.scoreHero}>
            <ScoreRingFactors />
            <div style={styles.heroRight}>
              <span style={styles.heroDuration}>{ASLEEP_LABEL} asleep</span>
              <span style={styles.heroMeta}>
                {HERO_META}
                {feelLabel != null ? ` · Felt ${feelLabel}` : ''}
              </span>
              <div style={styles.feelTrack} role="radiogroup" aria-label="How do you feel this morning?" onKeyDown={onFeelKeyDown}>
                {FEEL_OPTIONS.map((option, index) => {
                  const selected = app.morningFeel === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected || (app.morningFeel == null && index === 0) ? 0 : -1}
                      className="som-btn som-focusable"
                      style={{...styles.feelSegment, ...(selected ? styles.feelSegmentOn : null)}}
                      onClick={() => onFeelSelect(option.id)}>
                      {selected ? <span style={styles.feelPill} aria-hidden /> : null}
                      <span style={styles.feelLabel}>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* updatedCaption — role='status'; '' at rest, fixed string after
              the navBar refresh. */}
          <p style={styles.updatedCaption} role="status">
            {app.refreshed ? 'Updated just now' : ''}
          </p>

          {/* HYPNOGRAM CARD */}
          <section style={{...styles.listCard, ...styles.hypnogramCard}} aria-label="Hypnogram">
            <div style={styles.cardHeadRow}>
              <h2 style={{...styles.overline, margin: 0}}>Hypnogram</h2>
              <span style={styles.headTime}>
                {BED_TIME} – {RISE_TIME}
              </span>
            </div>
            <div ref={ribbonHostRef}>
              <HypnogramRibbon width={ribbonWidth} cursorIndex={app.cursorIndex} onCursorChange={setCursor} />
            </div>
          </section>

          {/* SEGMENT DETAIL CARD — chevrons are the first-class non-gesture
              cursor path; disabled at the night's edges (indices 0 / 13). */}
          <section style={{...styles.listCard, ...styles.detailCard}} aria-label="Selected segment">
            <div style={styles.detailRow}>
              <button
                type="button"
                className="som-btn som-focusable som-hoverable"
                style={{...styles.navChevron, ...(app.cursorIndex === 0 ? styles.navChevronDisabled : null)}}
                aria-label="Previous segment"
                disabled={app.cursorIndex === 0}
                onClick={() => setCursor(app.cursorIndex - 1)}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
              </button>
              <div style={styles.detailCenter}>
                <span style={styles.detailStage}>{segmentMeta.label}</span>
                <span style={styles.detailRange}>
                  {segment.rangeLabel} · {segment.durationLabel}
                </span>
                <div style={styles.pillRow}>
                  <span style={styles.statPill}>HR −{segment.hrDip} bpm</span>
                  <span style={styles.statPill}>{segment.movementLabel}</span>
                </div>
                <p style={{...styles.detailNote, margin: 0}}>{segment.note}</p>
              </div>
              <button
                type="button"
                className="som-btn som-focusable som-hoverable"
                style={{
                  ...styles.navChevron,
                  ...(app.cursorIndex === SEGMENTS.length - 1 ? styles.navChevronDisabled : null),
                }}
                aria-label="Next segment"
                disabled={app.cursorIndex === SEGMENTS.length - 1}
                onClick={() => setCursor(app.cursorIndex + 1)}>
                <Icon icon={ChevronRightIcon} size="md" color="inherit" />
              </button>
            </div>
            <div style={styles.detailFooter}>
              <button
                type="button"
                className="som-btn som-focusable"
                style={styles.stageDetailsBtn}
                onClick={event => openSheet(segment.stage, event.currentTarget)}>
                <span style={styles.stageDetailsPill}>
                  <Icon icon={InfoIcon} size="sm" color="inherit" />
                  Stage details
                </span>
              </button>
            </div>
          </section>

          {/* LEGEND CHIPS */}
          <StageLegendChips cursorIndex={app.cursorIndex} onJump={jumpToStage} />

          {/* SCORE FACTORS */}
          <h2 style={styles.sectionHeader}>Score factors</h2>
          <div style={styles.listCard}>
            {SCORE_FACTORS.map((factor, index) => (
              <div key={factor.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <button
                  type="button"
                  className="som-btn som-focusable som-hoverable"
                  style={styles.factorRow}
                  aria-label={`${factor.name}, ${factor.earned} of ${factor.weight} points — how it is scored`}
                  onClick={event => openSheet('score', event.currentTarget, factor.id)}>
                  <span style={styles.factorText}>
                    <span style={styles.factorNameRow}>
                      <span style={styles.factorName}>{factor.name}</span>
                      {factor.id === 'restfulness' && feelLabel != null ? (
                        <span style={styles.feelChip}>You: {feelLabel}</span>
                      ) : null}
                    </span>
                    <span style={styles.factorReceipt}>{factor.receipt}</span>
                  </span>
                  <span style={styles.factorPoints}>
                    {factor.earned}/{factor.weight}
                  </span>
                </button>
              </div>
            ))}
          </div>

          {/* footerNote — 44px utility row + 24px bottom padding. */}
          <div style={styles.footerNote}>
            <button
              type="button"
              className="som-btn som-focusable"
              style={styles.footerNoteBtn}
              onClick={event => openSheet('score', event.currentTarget)}>
              About this score
            </button>
          </div>
        </main>

        {/* The single polite live region — sticky-in-flow toast dock. */}
        <div style={styles.toastDock} aria-live="polite">
          {app.toast != null ? (
            <div key={app.toast.seq} style={styles.toast} className="som-fade">
              {app.toast.text}
            </div>
          ) : null}
        </div>

        {app.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {app.sheetOpen && app.sheetStage != null ? (
          <Sheet
            titleId="som-sheet-title"
            title={sheetTitle}
            detent={app.sheetDetent}
            onDetentChange={detent => update({sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            closeBtnRef={sheetCloseRef}
            bodyRef={sheetBodyRef}
            reducedMotion={reducedMotion}>
            {sheetStageMeta != null ? (
              <>
                {/* Aggregate stat row reuses the cross-checked stage totals. */}
                <div style={styles.statGrid}>
                  <div style={styles.statCell}>
                    <span style={styles.statValue}>{sheetStageMeta.periods}</span>
                    <span style={styles.statLabel}>Periods</span>
                  </div>
                  <div style={styles.statCell}>
                    <span style={styles.statValue}>{sheetStageMeta.totalLabel}</span>
                    <span style={styles.statLabel}>Total</span>
                  </div>
                  <div style={styles.statCell}>
                    <span style={styles.statValue}>{sheetStageMeta.longestLabel}</span>
                    <span style={styles.statLabel}>Longest</span>
                  </div>
                  <div style={styles.statCell}>
                    <span style={styles.statValue}>{sheetStageMeta.pct}%</span>
                    <span style={styles.statLabel}>Share</span>
                  </div>
                </div>
                {sheetPeriods.map(({seg, index}) => (
                  <button
                    key={seg.id}
                    type="button"
                    className="som-btn som-focusable som-hoverable"
                    style={styles.periodRow}
                    aria-label={`${sheetStageMeta.label} period ${seg.rangeLabel}, ${seg.durationLabel} — move cursor here`}
                    aria-current={index === app.cursorIndex ? 'true' : undefined}
                    onClick={() => pickPeriod(index)}>
                    <span style={{...styles.periodDot, background: sheetStageMeta.fill}} aria-hidden />
                    <span style={{...styles.periodRange, fontWeight: index === app.cursorIndex ? 600 : 400}}>
                      {seg.rangeLabel}
                    </span>
                    <span style={styles.periodMeta}>
                      {seg.durationLabel} · HR −{seg.hrDip}
                    </span>
                  </button>
                ))}
                <p style={styles.prose}>{sheetStageMeta.typicalProse}</p>
              </>
            ) : (
              <>
                <p style={{...styles.prose, marginTop: 4, marginBottom: 16}}>
                  Somnary scores each night out of 100 across four weighted factors. Last night: 27+21+20+16 = 84 —
                  the GOOD band (80–89).
                </p>
                {SCORE_FACTORS.map(factor => (
                  <div key={factor.id} data-factor={factor.id} style={styles.explainerBlock}>
                    <div style={styles.explainerHead}>
                      <span style={styles.explainerName}>{factor.name}</span>
                      <span style={styles.explainerPoints}>
                        {factor.earned}/{factor.weight}
                      </span>
                    </div>
                    <p style={styles.explainerProse}>{factor.explainer}</p>
                  </div>
                ))}
                <p style={{...styles.prose, marginTop: 0}}>
                  Weights — Duration 30 · Restfulness 25 · Consistency 25 · Timing 20 — sum to 100, so points always
                  add up to the score above.
                </p>
              </>
            )}
            <div style={styles.bottomSpacer} />
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}


