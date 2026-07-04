// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Wornwell draft wl-4821 for seller
 *   mira-okafor: the Loden Wool Overshirt (Arbor & Twine · Size M · Loden
 *   green · ships from Portland, OR), 3 filled photo slots against a
 *   Grade-B quota of 5, two pre-placed flaw pins (cuff 292,168 · hem
 *   118,196), and 12 sold comps 31/34/38/41/43/44/46/48/51/54/59/66 —
 *   sum 555, mean 46.25, median (44+46)/2 = 45.00, bins 2+1+3+2+2+1+0+1 =
 *   12 (all cross-checked in comments). Fees: 10% + $2.00 flat, so the
 *   default $48 asking price earns 48 − (4.80 + 2.00) = $41.20. No
 *   Date.now(), no Math.random(), no network media — photos are id-derived
 *   hue gradients, the garment is a stylized inline-SVG silhouette.
 * @output Wornwell — Resale Listing Composer: a 390px MOBILE single-screen
 *   listing composer. NavBar (44×44 X with dirty-draft discard alert ·
 *   hanger-with-loop brand mark + 'New Listing' · Draft/Ready/Published
 *   stateChip) over a live preview card (96px cover gradient, 2-line title
 *   clamp, $48.00 + zone chip, 'You earn $41.20 after fees'), a
 *   grade-driven 3-col photoGrid (filled gradients vs dashed unmet slots),
 *   a 36px A/B/C ConditionGradePicker that resizes the photo quota, a
 *   358×220 FlawPinCanvas with numbered pins + 60px checklist rows
 *   (remove → Undo), static details rows, and a PRICING row whose Adjust
 *   button opens the medium-detent price sheet. Signature move: scrubbing
 *   the CompHistogramScrubber (or ±$1 stepper / Match comps / spinbutton
 *   arrows) writes ONE price value that in a single render sweeps the
 *   DaysToSellGauge needle, flips the Underpriced/Fair/Ambitious chips,
 *   rewrites the $-readout + median caption + earnings echo, AND — above
 *   the 55% sheet — updates the preview card's price, zone chip, earnings
 *   row, and the navBar stateChip (Draft↔Ready). Publish routes gates:
 *   photo quota → scroll + toast; Ambitious price → action-sheet override;
 *   else Published.
 * @position Page template; emitted by `astryx template
 *   mobile-resale-listing-composer`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrims, sheet, action sheets,
 *   alert) are position:'absolute' INSIDE shell; position:fixed is banned.
 *   While the sheet / an action sheet / the alert is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close. No tabBar
 *   (composer flow); the sticky footer owns the bottom edge.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); no desktop Layout frames, no
 *   side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Wornwell teal #0F766E — the demo's --color-brand is the
 *   demo logo blue, so the spec hex is quarantined here per house rule).
 *   Per the mobile amendments, INTERACTIVE boundaries and meaningful
 *   rest-state fills (dashed unmet-slot outline, scrubber rail track,
 *   gauge rest track, histogram bars) use explicit light-dark() pairs at
 *   ≥3:1 against their ACTUAL surface, with the math at each declaration —
 *   hairline tokens stay on passive separators only.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', always-on hairline —
 *   declared choice); rows 44px utility / 60px two-line / 72px media;
 *   sectionHeader 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
 *   pad), 20px top / 8px bottom; photo slots 3 columns (114px at 390:
 *   3×114 + 2×8 = 358 = 390 − 32 ✓); FlawPinCanvas viewBox 358×220;
 *   histogram viewBox 358×96 (8 bars × 40 + 7 gaps × 4 = 348, inset 5
 *   each side: 320 + 28 + 10 = 358 ✓); scrubber rail 44px tall, 28px
 *   handle; gauge 140×84, 180° arc, stroke 10; stepper 96×32 track (two
 *   48×32 halves, 44px effective hits); buttons 48px primary Publish /
 *   36px secondary / 44×44 icon; sticky footer 80px = 16 + 48 + 16; sheet
 *   detents 55% medium / calc(100% − 56px) large, 24px grabber zone with
 *   36×5 pill, 52px sheet header; toastDock sticky-in-flow bottom 92
 *   above the footer (absolute bottom 96 only while scroll-locked). TYPE
 *   (Figtree via --font-family-body): 28/700 sheet price readout · 22/700
 *   preview price + gauge days · 17/600 nav + card titles · 16/400 body
 *   floor · 13/400 secondary · 11/500-600 overlines + badges; nothing
 *   under 11px; tabular-nums on every price, count, and days figure.
 *
 * Responsive contract:
 * - Author at 390, clean 320–430: NO width:390 literals — photo slots are
 *   'repeat(3, 1fr)' (90.6px at 320, still ≥44 ✓); histogram, canvas, and
 *   gauge are viewBox SVGs at width:'100%' so bin/handle math stays in
 *   viewBox units; the scrubber handle position is percentage-based.
 *   Below a 360px CONTAINER width the 96px preview cover drops to 72×72
 *   (single breakpoint, measured via useElementWidth, not viewport).
 * - Desktop stage (~1045px): measured wrapper width ≥720px renders the
 *   phone experience as a centered column (shell maxWidth 430,
 *   marginInline auto, borderInline hairline) — no adaptive relayout; the
 *   composer anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {MinusIcon, PlusIcon, XIcon} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math at the declaration.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Wornwell teal). #0F766E on the white card
// ≈ 5.5:1 (passes 4.5:1 text); #5EEAD4 on the dark card (~#1C1C1E) ≈ 11.5:1.
const BRAND_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
// Text/numerals over a BRAND_ACCENT fill (pin numerals, Publish label).
// Light: #FFFFFF on #0F766E ≈ 5.5:1. Dark: white on #5EEAD4 fails (~1.5:1),
// so the dark side flips to near-black teal — #042F2E on #5EEAD4 ≈ 9.8:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #042F2E)';
// 12% brand wash for the Ready chip + Fair zone chip. BRAND_ACCENT text on
// this wash: #0F766E on 12%-teal-on-white (≈ #E9F3F1) ≈ 5.1:1 — passes.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Published/success chip text: #15803D on white ≈ 5.1:1; #86EFAC on the
// dark card ≈ 13:1. Tint fill mirrors BRAND_TINT_12 at 12%.
const SUCCESS_TEXT = 'light-dark(#15803D, #86EFAC)';
const SUCCESS_TINT_12 = `color-mix(in srgb, ${SUCCESS_TEXT} 12%, transparent)`;
// Ambitious amber for 11–13px text: #9A6700 on the white card ≈ 4.9:1;
// #E8B93C on the dark card ≈ 9.3:1.
const AMBER_TEXT = 'light-dark(#9A6700, #E8B93C)';
const AMBER_TINT_12 = `color-mix(in srgb, ${AMBER_TEXT} 12%, transparent)`;
// INTERACTIVE BOUNDARY (mobile amendment): the unmet photo slot's dashed
// 2px outline vs the body background it sits on. #5C6B67 on #FFFFFF ≈
// 5.6:1; #98A8A3 on ~#1C1C1E ≈ 6.9:1 — both clear the 3:1 floor.
const SLOT_DASH = 'light-dark(#5C6B67, #98A8A3)';
// MEANINGFUL REST FILLS (mobile amendment): the gauge's unswept track, the
// scrubber rail line, and histogram bars all encode data at rest, so no
// muted token — #64756F on the white sheet card ≈ 4.8:1; #9DB0AA on the
// dark card ≈ 7.6:1 (≥3:1 vs their actual surface in both schemes).
const REST_TRACK = 'light-dark(#64756F, #9DB0AA)';
// Scrubber handle separation ring (interactive boundary): the 28px handle
// is a BRAND_ACCENT fill (≈5.5:1 / ≈11.5:1 vs the sheet card — ≥3:1 ✓);
// the 2px ring matches the card surface so the circle reads as a lifted
// control over the rail line.
const HANDLE_RING = 'light-dark(#FFFFFF, #1C1C1E)';
// FlawPinCanvas silhouette stroke — explicit pair per spec (no --color-text
// token exists): #5C6B67 on the muted fill ≈ 4.9:1; #98A8A3 dark ≈ 6:1.
const SILHOUETTE_STROKE = 'light-dark(#5C6B67, #98A8A3)';
// Zone bands tinted behind the histogram bars — passive translucent washes
// (background art, not text): slate / brand / amber families.
const BAND_UNDER = 'light-dark(rgba(100, 116, 139, 0.14), rgba(148, 163, 184, 0.16))';
const BAND_FAIR = `color-mix(in srgb, ${BRAND_ACCENT} 14%, transparent)`;
const BAND_AMB = 'light-dark(rgba(154, 103, 0, 0.12), rgba(232, 185, 60, 0.14))';
// Photo slot-number badge scrim: white 11px text on rgba(15,23,20,0.55)
// over the lightest fixture gradient stop (hsl · 72% ≈ #C9DFD3) ≈ 5.0:1.
const BADGE_SCRIM = 'rgba(15, 23, 20, 0.55)';
const BADGE_TEXT = '#FFFFFF';
// Sheet/action-sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// sheet slide-in, and the reduced-motion guard. Transitions animate
// transform/opacity only and collapse to instant under
// prefers-reduced-motion (needle sweep, sheet slide, segment pill).
// ---------------------------------------------------------------------------

const WORNWELL_CSS = `
.wnw-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.wnw-btn:disabled { cursor: default; }
.wnw-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.wnw-anim { transition: transform 200ms ease, opacity 200ms ease; }
.wnw-fade { transition: opacity 200ms ease; }
@keyframes wnw-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.wnw-sheet-in { animation: wnw-sheet-in 200ms ease; }
.wnw-vh {
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
  .wnw-anim, .wnw-fade { transition: none; }
  .wnw-sheet-in { animation: none; }
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
  // Scroll lock while the sheet / an action sheet / the alert is open —
  // absolute overlays anchor to the visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so the 44px X aligns
  // content optically to the 16px gutter. Hairline + blur ALWAYS ON
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
  navTrailing: {display: 'flex', justifyContent: 'flex-end', paddingInlineEnd: 8},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  navCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    maxWidth: 200,
  },
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // stateChip — 24px pill, 11/600. Draft muted · Ready brand-tint (text
  // contrast commented at BRAND_TINT_12) · Published success-tint.
  stateChip: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  stateChipDraft: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  stateChipReady: {background: BRAND_TINT_12, color: BRAND_ACCENT},
  stateChipPublished: {background: SUCCESS_TINT_12, color: SUCCESS_TEXT},
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom; counts are live and tabular.
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
  // PREVIEW CARD — 16px padding row: 96×96 cover gradient + title stack.
  previewInner: {display: 'flex', gap: 12, padding: 16},
  coverThumb: {
    width: 96,
    height: 96,
    flexShrink: 0,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  coverThumbSmall: {width: 72, height: 72},
  previewStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  // 2-line clamp — stress fixture 5 (ALT_TITLE) proves it.
  previewTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.25,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  previewMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Price line is a real button (garnish opener for the sheet, same
  // handler as Adjust); 44px-tall hit via block padding.
  priceRowBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
    minHeight: 44,
    borderRadius: 8,
  },
  previewPrice: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  zoneChip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  zoneChipUnder: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  zoneChipFair: {background: BRAND_TINT_12, color: BRAND_ACCENT},
  zoneChipAmb: {background: AMBER_TINT_12, color: AMBER_TEXT},
  earningsRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
  },
  earnLabel: {fontSize: 13, color: 'var(--color-text-secondary)'},
  earnValue: {fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  // PHOTO GRID — 3 columns of square slots at the 16px gutter: at 390 the
  // cells are (390 − 32 − 16) / 3 = 114px (3×114 + 2×8 = 358 ✓); at 320
  // they fluidly drop to ~90.6px, still ≥44 hit.
  photoGrid: {
    marginInline: 16,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  photoSlot: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: 12,
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
  },
  // Unmet slot — dashed SLOT_DASH boundary (≥3:1 vs the body background,
  // math at the declaration) + 24px PlusIcon.
  photoSlotUnmet: {
    border: `2px dashed ${SLOT_DASH}`,
    color: 'var(--color-text-secondary)',
    background: 'transparent',
  },
  slotBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingInline: 6,
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 500,
    background: BADGE_SCRIM,
    color: BADGE_TEXT,
    fontVariantNumeric: 'tabular-nums',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingInline: 6,
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    background: BADGE_SCRIM,
    color: BADGE_TEXT,
  },
  // CONDITION — 36px visual segmented track; each segment's REAL hit is
  // 44px tall (buttons overhang the 36px track by 4px top/bottom).
  gradeBlock: {padding: '12px 16px 0'},
  gradeTrackWrap: {position: 'relative', height: 44, display: 'flex'},
  gradeTrackBg: {
    position: 'absolute',
    insetInline: 0,
    top: 4,
    bottom: 4,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segBtn: {
    flex: 1,
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
  },
  segActivePill: {
    position: 'absolute',
    insetInline: 2,
    top: 6,
    bottom: 6,
    borderRadius: 10,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
  },
  segLabel: {position: 'relative', fontSize: 16, fontWeight: 500},
  gradeCaption: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // FLAWS — canvas card + 60px checklist rows.
  canvasBlock: {padding: '16px 16px 0'},
  canvasWrap: {position: 'relative'},
  // Pins: 44×44 hit, 28px visual brand circle, white/near-black numeral
  // (BRAND_FILL_TEXT — math at the declaration).
  pinBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
  },
  pinCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 700,
    boxShadow: '0 1px 4px var(--color-shadow)',
    fontVariantNumeric: 'tabular-nums',
  },
  addFlawRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 14,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  secondaryBtnDisabled: {opacity: 0.35},
  maxCaption: {fontSize: 13, color: 'var(--color-text-secondary)'},
  flawRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  flawDot: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  flawText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // DETAILS — static non-button 44px utility rows (label + trailing value,
  // no chevron; per spec these are NOT affordances in the composer).
  detailRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
  },
  detailLabel: {fontSize: 16},
  detailValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // PRICING — 60px two-line row + 36px Adjust (the visible non-gesture
  // sheet entry).
  pricingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 60,
    paddingInline: 16,
  },
  pricingText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  pricingPrimary: {fontSize: 16, fontWeight: 500},
  pricingSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // TOAST DOCK — sticky-in-flow above the 80px footer (mobile amendment:
  // shell-absolute pins to the DOCUMENT bottom on tall views). Switches to
  // absolute bottom 96 only while the shell is scroll-locked.
  toastDock: {
    position: 'sticky',
    bottom: 92,
    zIndex: 30,
    marginInline: 16,
    marginTop: 12,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    minHeight: 0,
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 96,
    marginInline: 0,
    marginTop: 0,
  },
  toast: {
    pointerEvents: 'auto',
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    paddingInline: 16,
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
  // STICKY FOOTER — 80px = 16 + 48 + 16, blur surface, borderTop hairline.
  stickyFooter: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  publishBtn: {
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
  publishBtnDone: {
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
  sheetTitle: {margin: 0, fontSize: 17, fontWeight: 600, textAlign: 'center'},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 16px'},
  // SHEET CONTENT — gauge → zone legend → histogram+rail → readout →
  // controls → earnings echo.
  gaugeBlock: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2},
  gaugeDays: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    marginTop: -4,
  },
  gaugeCaption: {fontSize: 13, color: 'var(--color-text-secondary)'},
  zoneChipRow: {display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12},
  legendChip: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  histBlock: {marginTop: 16},
  railWrap: {position: 'relative', height: 44, touchAction: 'none'},
  railLine: {
    position: 'absolute',
    top: '50%',
    marginTop: -2,
    height: 4,
    borderRadius: 2,
    background: REST_TRACK,
  },
  handle: {
    position: 'absolute',
    top: '50%',
    width: 28,
    height: 28,
    marginTop: -14,
    marginLeft: -14,
    borderRadius: 999,
    background: BRAND_ACCENT,
    border: `2px solid ${HANDLE_RING}`,
    boxShadow: '0 2px 8px var(--color-shadow)',
  },
  priceReadout: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 8,
  },
  medianCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  controlRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  // STEPPER — 96×32 visual track split into two 48×32 halves; each half's
  // REAL hit is 48×44 (buttons overhang the track by 6px top/bottom).
  stepperTrack: {
    position: 'relative',
    width: 96,
    height: 32,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    display: 'flex',
  },
  stepperRule: {
    position: 'absolute',
    left: 48,
    top: 0,
    bottom: 0,
    width: 1,
    background: 'var(--color-border)',
  },
  stepHalf: {
    width: 48,
    height: 44,
    marginTop: -6,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    color: 'var(--color-text-primary)',
  },
  stepHalfDisabled: {opacity: 0.35},
  earnEcho: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  // ACTION SHEET — scrim z40 + two stacked cards insetInline 16 bottom 16
  // z41; centered-no-icons rows, destructive LAST, Cancel card separate.
  asWrap: {
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
    borderBottom: '1px solid var(--color-border)',
  },
  asRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
  },
  asRowDestructive: {color: 'var(--color-error)'},
  asRowCancel: {fontWeight: 600},
  asDivider: {height: 1, background: 'var(--color-border)'},
  // CENTERED ALERT — scrim z60 (above everything), 280px card; scrim click
  // does NOT dismiss; verbs, never 'OK'.
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
  alertTitle: {margin: 0, fontSize: 17, fontWeight: 600},
  alertText: {fontSize: 13, color: 'var(--color-text-secondary)'},
  alertBtnRow: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtn: {flex: 1, height: 44, display: 'grid', placeItems: 'center', fontSize: 17},
  alertVRule: {width: 1, background: 'var(--color-border)'},
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual-field deterministic data. CROSS-CHECK
// LEDGER (verified by hand before shipping): comps 31+34+38+41+43+44+46+48+
// 51+54+59+66 = 555, mean 555/12 = 46.25, median (44+46)/2 = 45.00, min 31,
// max 66; $5 bins over $30–70 count 2+1+3+2+2+1+0+1 = 12; fee(48) = 4.80 +
// 2.00 = 6.80 → earn 41.20 (the pitch line); fee(45) = 6.50 → earn 38.50;
// days(48) = round(2 + 19×17/35) = round(11.23) = 11 → '~11 days'; Grade B
// requires 5, 3 filled → 2 unmet (3 + 2 = 5 ✓).
// ---------------------------------------------------------------------------

const SELLER = 'mira-okafor';
const DRAFT_ID = 'wl-4821';

const ITEM = {
  title: 'Loden Wool Overshirt',
  brand: 'Arbor & Twine',
  size: 'M',
  color: 'Loden green',
  category: 'Overshirts',
  shipsFrom: 'Portland, OR',
};
// Stress fixture 5 — swap into ITEM.title to prove the preview card's
// 2-line clamp and the navBar 200px ellipsis:
// const ALT_TITLE =
//   'Heavyweight Brushed-Flannel Chore Overshirt with Corduroy Collar';

interface Comp {
  id: string;
  price: number; // whole dollars — the scrubber snaps to whole dollars
  soldDaysAgo: number;
  soldLabel: string;
}

// 12 sold comps, sorted ascending. Aggregates above derive live from this
// array (median, bins, band edges) — never restated as literals in render.
const COMPS: Comp[] = [
  {id: 'cmp-01', price: 31, soldDaysAgo: 3, soldLabel: '3d ago'},
  {id: 'cmp-02', price: 34, soldDaysAgo: 6, soldLabel: '6d ago'},
  {id: 'cmp-03', price: 38, soldDaysAgo: 9, soldLabel: '9d ago'},
  {id: 'cmp-04', price: 41, soldDaysAgo: 11, soldLabel: '11d ago'},
  {id: 'cmp-05', price: 43, soldDaysAgo: 13, soldLabel: '13d ago'},
  {id: 'cmp-06', price: 44, soldDaysAgo: 15, soldLabel: '15d ago'},
  {id: 'cmp-07', price: 46, soldDaysAgo: 17, soldLabel: '17d ago'},
  {id: 'cmp-08', price: 48, soldDaysAgo: 19, soldLabel: '19d ago'},
  {id: 'cmp-09', price: 51, soldDaysAgo: 21, soldLabel: '21d ago'},
  {id: 'cmp-10', price: 54, soldDaysAgo: 23, soldLabel: '23d ago'},
  {id: 'cmp-11', price: 59, soldDaysAgo: 25, soldLabel: '25d ago'},
  {id: 'cmp-12', price: 66, soldDaysAgo: 27, soldLabel: '27d ago'},
];

const PRICE_MIN = 30;
const PRICE_MAX = 70;
// ZONE EDGES — quartile-derived: P25 falls between comps #3/#4 → (38+41)/2
// = 39.5 → $40 band edge; P75 between #9/#10 → (51+54)/2 = 52.5 → rounded
// up to the $54 bin edge. Underpriced < $40 · Fair $40–$54 · Ambitious > $54.
const UNDER_MAX = 40;
const FAIR_MAX = 54;
// FEES — 10% marketplace commission + $2.00 payment flat.
const FEE_PCT = 10;
const FEE_FLAT_CENTS = 200;

// Median derives from the sorted array: (COMPS[5] + COMPS[6]) / 2 = 45.00.
const COMP_MEDIAN = (COMPS[5].price + COMPS[6].price) / 2;

// Histogram bins — 8 × $5 over $30–70; binFor(66) = min(⌊36/5⌋, 7) = 7.
// Derived counts: [2, 1, 3, 2, 2, 1, 0, 1] (sum 12 ✓ — bin 6, $60–64, is
// the legal empty bin of stress fixture 7).
const BIN_COUNTS: number[] = (() => {
  const counts = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const comp of COMPS) {
    counts[Math.min(Math.floor((comp.price - PRICE_MIN) / 5), 7)] += 1;
  }
  return counts;
})();
// Bar heights for counts 0/1/2/3 in the 96px viewBox (baseline at y=92).
const BAR_HEIGHT = [0, 27, 53, 80];

// PHOTOS — id-derived hues (deterministic: Σ charCodes × 47 mod 360 gives
// ph-1→170, ph-2→217, ph-3→264, ph-4→311, ph-5→358, ph-6→45).
interface Photo {
  id: string;
  hue: number;
}

function hueFor(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return (sum * 47) % 360;
}

/** Placeholder art: light-dark() hue gradient — no network photos. */
function gradientFor(hue: number): string {
  const h2 = (hue + 40) % 360;
  return `linear-gradient(135deg, light-dark(hsl(${hue} 35% 72%), hsl(${hue} 30% 34%)), light-dark(hsl(${h2} 40% 58%), hsl(${h2} 35% 26%)))`;
}

const INITIAL_PHOTOS: Photo[] = ['ph-1', 'ph-2', 'ph-3'].map(id => ({id, hue: hueFor(id)}));

// Grade → required photo slots (A/B/C = 4/5/6).
const REQUIRED_BY_GRADE = {A: 4, B: 5, C: 6} as const;
type Grade = keyof typeof REQUIRED_BY_GRADE;

// FLAWS — pins 1 & 2 pre-placed; the 5-slot preset table is the keyboard
// path ('Add flaw' drops the next pin at a deterministic coordinate).
interface Flaw {
  id: string;
  label: string;
  x: number; // FlawPinCanvas viewBox coords (358×220)
  y: number;
}

const PRESET_FLAWS: ReadonlyArray<Omit<Flaw, 'id'>> = [
  {label: 'Pilling at left cuff', x: 292, y: 168},
  {label: 'Faint mark near hem', x: 118, y: 196},
  {label: 'Loose button thread', x: 179, y: 122},
  {label: 'Fading at collar', x: 176, y: 36},
  {label: 'Small snag on sleeve', x: 78, y: 118},
];
const MAX_FLAWS = 5;

const INITIAL_FLAWS: Flaw[] = [
  {id: 'fl-1', ...PRESET_FLAWS[0]},
  {id: 'fl-2', ...PRESET_FLAWS[1]},
];

// ---------------------------------------------------------------------------
// PURE DERIVATIONS — zone / fee / earn / days are functions of price alone;
// nothing derived is ever stored in state.
// ---------------------------------------------------------------------------

type Zone = 'under' | 'fair' | 'ambitious';

function zoneFor(price: number): Zone {
  if (price < UNDER_MAX) return 'under';
  if (price <= FAIR_MAX) return 'fair';
  return 'ambitious';
}

const ZONE_LABEL: Record<Zone, string> = {
  under: 'Underpriced',
  fair: 'Fair',
  ambitious: 'Ambitious',
};

/** fee(p) = 10% × p + $2.00 — with whole-dollar prices this is exact in
 * cents: 10p + 200. fee(48) = 680¢; fee(45) = 650¢; fee(70) = 900¢. */
function feeCents(price: number): number {
  return FEE_PCT * price + FEE_FLAT_CENTS;
}

/** earn(p) = p − fee(p) = 90p − 200 in cents. earn(48) = 4120¢ = $41.20 ✓;
 * earn(30) = 2500¢ = $25.00; earn(70) = 6100¢ = $61.00. */
function earnCents(price: number): number {
  return price * 100 - feeCents(price);
}

/** Cents → '$41.20' (toFixed(2), rendered tabular). */
function fmtUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** days(p) = round(2 + 19×(p−31)/35) clamped [2, 21] — min comp $31 → 2
 * days, max comp $66 → 21. Spot checks: 45→10, 48→11.2→11, 58→16.66→17,
 * 70→23.17→clamp 21. */
function daysFor(price: number): number {
  return Math.min(21, Math.max(2, Math.round(2 + (19 * (price - 31)) / 35)));
}

/** Label rule: d ≥ 14 → '~{round(d/7)} weeks', else '~{d} days'. 21 → '~3
 * weeks' (stress fixture 2). */
function daysLabel(days: number): string {
  return days >= 14 ? `~${Math.round(days / 7)} weeks` : `~${days} days`;
}

/** Spoken variant for aria-valuetext ('about 11 days' / 'about 3 weeks'). */
function daysSpoken(days: number): string {
  return days >= 14 ? `about ${Math.round(days / 7)} weeks` : `about ${days} days`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — const [draft, setDraft] = useState(INITIAL_DRAFT) +
// updateDraft(patch); every mutation flows through it, components receive
// values + callbacks only. Everything else (zone, fee/earn, days, required
// photos, photosMet, ready) is derived per render.
// ---------------------------------------------------------------------------

type ActionSheetState = null | {kind: 'ambitious'} | {kind: 'photo'; photoId: string};

type UndoPayload =
  | {kind: 'photo'; photo: Photo; index: number}
  | {kind: 'flaw'; flaw: Flaw; index: number};

interface ToastState {
  seq: number;
  text: string;
  undo: UndoPayload | null;
}

interface DraftState {
  price: number;
  grade: Grade;
  photos: Photo[];
  flaws: Flaw[];
  photoSeq: number; // next photo id suffix (ids stay unique across undo)
  flawSeq: number; // total flaws ever added — indexes the preset table
  published: boolean;
  ambitiousConfirmed: boolean;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  actionSheet: ActionSheetState;
  discardAlertOpen: boolean;
  toast: ToastState | null;
}

const INITIAL_DRAFT: DraftState = {
  price: 48,
  grade: 'B',
  photos: INITIAL_PHOTOS,
  flaws: INITIAL_FLAWS,
  photoSeq: 3,
  flawSeq: 2,
  published: false,
  ambitiousConfirmed: false,
  sheetOpen: false,
  sheetDetent: 'medium',
  actionSheet: null,
  discardAlertOpen: false,
  toast: null,
};

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

// Focus trap — sheets / action sheets / the alert cycle Tab within
// themselves; focus restores to the opener on every close path.
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [role="slider"], [role="spinbutton"]',
  );
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
// BRAND MARK — Wornwell: a clothes hanger whose hook curls into a full
// circular loop (second life as literal geometry). Hanger body strokes in
// currentColor (--color-text-primary via the navBar), the loop in
// BRAND_ACCENT.
// ---------------------------------------------------------------------------

function WornwellMark() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden>
      {/* Hook curling into a full circular loop — the brand accent. */}
      <circle cx="11" cy="5.4" r="3" stroke={BRAND_ACCENT} strokeWidth="1.6" />
      {/* Stem from the loop to the hanger apex. */}
      <path d="M11 8.4v2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* Hanger shoulders + bottom bar. */}
      <path
        d="M11 10.6 L19.4 16.6 Q20.2 17.2 19.6 18 L18.9 18.6 L3.1 18.6 L2.4 18 Q1.8 17.2 2.6 16.6 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DaysToSellGauge — 140×84 semicircle (radius 62, stroke 10): REST_TRACK
// unswept arc (≥3:1 vs the sheet card, math at the declaration), brand
// progress arc, 2px needle + 5px hub rotating −90°→+90° from days(price).
// Purely derived — owns zero state; transform animates 200ms via .wnw-anim
// (instant under reduced motion). role='img', label mirrors the readout.
// ---------------------------------------------------------------------------

const GAUGE_CX = 70;
const GAUGE_CY = 74;
const GAUGE_R = 62;

function gaugePoint(deg: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: GAUGE_CX + GAUGE_R * Math.sin(rad), y: GAUGE_CY - GAUGE_R * Math.cos(rad)};
}

function DaysToSellGauge({price}: {price: number}) {
  const days = daysFor(price);
  // Sweep −90° (2 days) → +90° (21 days): θ = −90 + (days−2)/19 × 180.
  // days 11 → −90 + 85.3 = −4.7° (just left of apex at the $48 default).
  const theta = -90 + ((days - 2) / 19) * 180;
  const tip = gaugePoint(theta);
  return (
    <div style={styles.gaugeBlock}>
      <svg
        width={140}
        height={84}
        viewBox="0 0 140 84"
        fill="none"
        role="img"
        aria-label={`Estimated time to sell: ${daysSpoken(days)}`}>
        {/* Unswept rest track — REST_TRACK, not the muted token. */}
        <path
          d={`M ${gaugePoint(-90).x} ${gaugePoint(-90).y} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${gaugePoint(90).x} ${gaugePoint(90).y}`}
          stroke={REST_TRACK}
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.4}
        />
        <path
          d={`M ${gaugePoint(-90).x} ${gaugePoint(-90).y} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${tip.x.toFixed(2)} ${tip.y.toFixed(2)}`}
          stroke={BRAND_ACCENT}
          strokeWidth={10}
          strokeLinecap="round"
          className="wnw-fade"
        />
        {/* Needle — rotates with the slider value only (deterministic). */}
        <g
          className="wnw-anim"
          style={{
            transform: `rotate(${theta}deg)`,
            transformOrigin: '70px 74px',
            transformBox: 'view-box',
          }}>
          <line x1={70} y1={74} x2={70} y2={26} stroke="var(--color-text-primary)" strokeWidth={2} />
        </g>
        <circle cx={70} cy={74} r={5} fill="var(--color-text-primary)" />
      </svg>
      <span style={styles.gaugeDays}>{daysLabel(days)}</span>
      <span style={styles.gaugeCaption}>Est. time to sell</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CompHistogramScrubber — 358×96 viewBox histogram of the 12 sold comps in
// 8 $5 bins (bars 40px + 4px gaps, inset 5: 8×40 + 7×4 + 10 = 358 ✓), zone
// bands tinted behind the bars, and a 44px HTML rail below whose 28px
// handle IS the keyboard slider (ArrowLeft/Right ±$1, Shift ±$5, Home/End
// to the $30/$70 clamps). Pointer drag snaps to whole dollars. The
// non-gesture path is the ±$1 stepper + Match comps beside it.
// ---------------------------------------------------------------------------

const HIST_INSET_FRAC = 5 / 358;

/** Price → viewBox x: 5 + (p−30)/40 × 348. $40 → 92, $54 → 213.8. */
function histX(price: number): number {
  return 5 + ((price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 348;
}

interface CompHistogramScrubberProps {
  price: number;
  onSetPrice: (price: number) => void;
}

function CompHistogramScrubber({price, onSetPrice}: CompHistogramScrubberProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const activeBin = Math.min(Math.floor((price - PRICE_MIN) / 5), 7);
  const days = daysFor(price);
  // Handle center as a % of rail width (rail spans the full 358 viewBox
  // width, so the 5px inset becomes a fraction, resolution-independent).
  const handlePct = (HIST_INSET_FRAC + ((price - PRICE_MIN) / 40) * (1 - 2 * HIST_INSET_FRAC)) * 100;

  const priceFromClientX = (clientX: number): number => {
    const rect = railRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return price;
    const frac = ((clientX - rect.left) / rect.width - HIST_INSET_FRAC) / (1 - 2 * HIST_INSET_FRAC);
    return Math.min(PRICE_MAX, Math.max(PRICE_MIN, Math.round(PRICE_MIN + frac * 40)));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onSetPrice(priceFromClientX(event.clientX));
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    onSetPrice(priceFromClientX(event.clientX));
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };

  const onSliderKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    const step = event.shiftKey ? 5 : 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = price - step;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = price + step;
    else if (event.key === 'Home') next = PRICE_MIN;
    else if (event.key === 'End') next = PRICE_MAX;
    if (next == null) return;
    event.preventDefault();
    onSetPrice(Math.min(PRICE_MAX, Math.max(PRICE_MIN, next)));
  };

  return (
    <div style={styles.histBlock}>
      <svg viewBox="0 0 358 96" width="100%" style={{display: 'block', height: 'auto'}} fill="none" aria-hidden>
        {/* Zone bands — Underpriced <$40 · Fair $40–54 · Ambitious >$54
            (quartile derivation at the UNDER_MAX/FAIR_MAX declarations). */}
        <rect x={0} y={0} width={histX(UNDER_MAX)} height={92} fill={BAND_UNDER} />
        <rect x={histX(UNDER_MAX)} y={0} width={histX(FAIR_MAX) - histX(UNDER_MAX)} height={92} fill={BAND_FAIR} />
        <rect x={histX(FAIR_MAX)} y={0} width={358 - histX(FAIR_MAX)} height={92} fill={BAND_AMB} />
        {/* Bars — heights 27/53/80 for counts 1/2/3; the $60–64 bin is
            legally 0-height (baseline hairline keeps the rhythm). The bin
            containing the asking price fills BRAND_ACCENT. */}
        {BIN_COUNTS.map((count, index) => {
          const height = BAR_HEIGHT[count];
          if (height === 0) return null;
          return (
            <rect
              key={`bin-${PRICE_MIN + index * 5}`}
              x={5 + index * 44}
              y={92 - height}
              width={40}
              height={height}
              rx={3}
              fill={index === activeBin ? BRAND_ACCENT : REST_TRACK}
              opacity={index === activeBin ? 1 : 0.55}
            />
          );
        })}
        {/* Baseline hairline. */}
        <rect x={0} y={91} width={358} height={1} fill="var(--color-border)" />
      </svg>
      {/* 44px rail — pointer scrubbing; the 28px handle is the slider. */}
      <div
        ref={railRef}
        style={styles.railWrap}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}>
        <div
          style={{
            ...styles.railLine,
            left: `${HIST_INSET_FRAC * 100}%`,
            right: `${HIST_INSET_FRAC * 100}%`,
          }}
          aria-hidden
        />
        <div
          role="slider"
          tabIndex={0}
          className="wnw-focusable"
          aria-label="Asking price"
          aria-valuemin={PRICE_MIN}
          aria-valuemax={PRICE_MAX}
          aria-valuenow={price}
          aria-valuetext={`$${price} — ${ZONE_LABEL[zoneFor(price)]}, ${daysSpoken(days)} to sell`}
          style={{...styles.handle, left: `${handlePct}%`}}
          onKeyDown={onSliderKeyDown}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FlawPinCanvas — 358×220 stylized overshirt silhouette (body + collar +
// two sleeves + button placket; muted fill, SILHOUETTE_STROKE 1.5px — an
// explicit pair, no --color-text token exists). Canvas tap drops pin n+1
// (max 5) at the tapped viewBox coords; the keyboard path is the 'Add
// flaw' button (preset-table coords). Pins are real 44×44 HTML buttons
// (28px visual circle) positioned by percentage so the geometry holds
// 320–430.
// ---------------------------------------------------------------------------

interface FlawPinCanvasProps {
  flaws: Flaw[];
  onCanvasTap: (x: number, y: number) => void;
  onPinTap: (flaw: Flaw, index: number) => void;
}

function FlawPinCanvas({flaws, onCanvasTap, onPinTap}: FlawPinCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const handleCanvasClick = (event: {clientX: number; clientY: number}) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return;
    // Clamp so a 28px pin never clips the canvas edge.
    const x = Math.min(344, Math.max(14, ((event.clientX - rect.left) / rect.width) * 358));
    const y = Math.min(206, Math.max(14, ((event.clientY - rect.top) / rect.height) * 220));
    onCanvasTap(Math.round(x), Math.round(y));
  };
  return (
    <div style={styles.canvasWrap}>
      <svg
        ref={svgRef}
        viewBox="0 0 358 220"
        width="100%"
        style={{display: 'block', height: 'auto', cursor: 'crosshair'}}
        fill="none"
        aria-hidden
        onClick={handleCanvasClick}>
        {/* Torso. */}
        <path
          d="M120 44 Q120 36 128 34 L160 26 Q170 40 179 40 Q188 40 198 26 L230 34 Q238 36 238 44 L238 194 Q238 202 230 202 L128 202 Q120 202 120 194 Z"
          fill="var(--color-background-muted)"
          stroke={SILHOUETTE_STROKE}
          strokeWidth={1.5}
        />
        {/* Left sleeve (viewer left). */}
        <path
          d="M120 48 L84 58 Q76 60 74 68 L58 150 Q56 158 64 160 L94 166 Q102 168 104 160 L120 100"
          fill="var(--color-background-muted)"
          stroke={SILHOUETTE_STROKE}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {/* Right sleeve — its cuff hosts fixture pin 1 (292, 168). */}
        <path
          d="M238 48 L274 58 Q282 60 284 68 L300 150 Q302 158 294 160 L264 166 Q256 168 254 160 L238 100"
          fill="var(--color-background-muted)"
          stroke={SILHOUETTE_STROKE}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {/* Collar notch + button placket. */}
        <path d="M160 27 Q170 44 179 44 Q188 44 198 27" stroke={SILHOUETTE_STROKE} strokeWidth={1.5} />
        <line x1={179} y1={44} x2={179} y2={202} stroke={SILHOUETTE_STROKE} strokeWidth={1} opacity={0.5} />
        {[70, 104, 138, 172].map(y => (
          <circle key={`btn-${y}`} cx={179} cy={y} r={2.5} fill={SILHOUETTE_STROKE} opacity={0.6} />
        ))}
      </svg>
      {flaws.map((flaw, index) => (
        <button
          key={flaw.id}
          type="button"
          className="wnw-btn wnw-focusable"
          style={{
            ...styles.pinBtn,
            left: `${(flaw.x / 358) * 100}%`,
            top: `${(flaw.y / 220) * 100}%`,
          }}
          aria-label={`Flaw ${index + 1}, ${flaw.label.toLowerCase()}`}
          onClick={event => {
            event.stopPropagation();
            onPinTap(flaw, index);
          }}>
          <span style={styles.pinCircle} aria-hidden>
            {index + 1}
          </span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConditionGradePicker — 36px-visual segmented radiogroup A/B/C (44px real
// hits via button overhang); arrow keys move AND select; changing grade
// re-renders the photoGrid slot count, the 'PHOTOS · x OF y' header, and
// the caption row.
// ---------------------------------------------------------------------------

const GRADES: Array<{id: Grade; label: string; blurb: string}> = [
  {id: 'A', label: 'Grade A', blurb: 'like new'},
  {id: 'B', label: 'Grade B', blurb: 'gently worn'},
  {id: 'C', label: 'Grade C', blurb: 'visible wear'},
];

interface ConditionGradePickerProps {
  grade: Grade;
  onChange: (grade: Grade) => void;
}

function ConditionGradePicker({grade, onChange}: ConditionGradePickerProps) {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let direction = 0;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') direction = -1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') direction = 1;
    if (direction === 0) return;
    event.preventDefault();
    const index = GRADES.findIndex(entry => entry.id === grade);
    const next = GRADES[(index + direction + GRADES.length) % GRADES.length];
    onChange(next.id);
    const target = groupRef.current?.querySelector<HTMLButtonElement>(`[data-grade="${next.id}"]`);
    target?.focus({preventScroll: true});
  };
  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Condition grade"
      style={styles.gradeTrackWrap}
      onKeyDown={onKeyDown}>
      <div style={styles.gradeTrackBg} aria-hidden />
      {GRADES.map(entry => {
        const isActive = entry.id === grade;
        return (
          <button
            key={entry.id}
            type="button"
            data-grade={entry.id}
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            className="wnw-btn wnw-focusable"
            style={styles.segBtn}
            aria-label={`${entry.label} — ${entry.blurb}, ${REQUIRED_BY_GRADE[entry.id]} photos required`}
            onClick={() => onChange(entry.id)}>
            {isActive ? <span style={styles.segActivePill} className="wnw-fade" aria-hidden /> : null}
            <span style={styles.segLabel}>{entry.id}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — 24px grabber zone (36×5 pill; a real 'Resize sheet'
// button toggling 55% ↔ calc(100% − 56px)), 52px header with 44×44 X,
// focus-trapped dialog. Drag-between-detents is optional garnish per the
// contract and is intentionally not wired — the grabber click IS the path.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, children}: SheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="wnw-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transition: reducedMotion ? 'none' : 'height 200ms ease',
      }}>
      <button
        type="button"
        className="wnw-btn wnw-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onClick={() => onDetentChange(detent === 'medium' ? 'large' : 'medium')}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button type="button" className="wnw-btn wnw-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — two stacked cards (options + panic-safe Cancel), centered
// no-icons rows, destructive LAST; focus lands on Cancel, Tab trapped,
// Escape/scrim/Cancel all close with no action.
// ---------------------------------------------------------------------------

interface ActionSheetOption {
  id: string;
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

interface ActionSheetProps {
  label: string;
  header: string;
  options: ActionSheetOption[];
  onCancel: () => void;
}

function ActionSheet({label, header, options, onCancel}: ActionSheetProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    // Safe default: first focus on Cancel, never the destructive row.
    // preventScroll — the shell is scroll-locked (mobile amendment).
    cancelRef.current?.focus({preventScroll: true});
  }, []);
  return (
    <div
      ref={wrapRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      style={styles.asWrap}
      className="wnw-sheet-in"
      onKeyDown={event => trapTabKey(event, wrapRef.current)}>
      <div style={styles.asCard}>
        <div style={styles.asHeader}>{header}</div>
        {options.map((option, index) => (
          <div key={option.id}>
            {index > 0 ? <div style={styles.asDivider} /> : null}
            <button
              type="button"
              className="wnw-btn wnw-focusable"
              style={{...styles.asRow, ...(option.destructive ? styles.asRowDestructive : null)}}
              onClick={option.onSelect}>
              {option.label}
            </button>
          </div>
        ))}
      </div>
      <div style={styles.asCard}>
        <button
          type="button"
          ref={cancelRef}
          className="wnw-btn wnw-focusable"
          style={{...styles.asRow, ...styles.asRowCancel}}
          onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileResaleListingComposerTemplate() {
  // Container-width decisions: ≥720px wrapper → centered 430px phone
  // column (desktop stage); <360px → the preview cover drops 96→72. The
  // viewport query is only the first-frame fallback before the
  // ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const isNarrow = wrapWidth > 0 && wrapWidth < 360;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // THE ONE STATE OWNER — every mutation goes through updateDraft.
  const [draft, setDraft] = useState<DraftState>(INITIAL_DRAFT);
  const updateDraft = useCallback((patch: Partial<DraftState>) => {
    setDraft(current => ({...current, ...patch}));
  }, []);

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const adjustBtnRef = useRef<HTMLButtonElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const keepEditingRef = useRef<HTMLButtonElement | null>(null);
  const overlayOpenerRef = useRef<HTMLElement | null>(null);
  const photosHeaderRef = useRef<HTMLHeadingElement | null>(null);
  const toastSeqRef = useRef(0);

  // DERIVED — pure functions of draft, never stored.
  const zone = zoneFor(draft.price);
  const earn = earnCents(draft.price);
  const days = daysFor(draft.price);
  const required = REQUIRED_BY_GRADE[draft.grade];
  const photosMet = draft.photos.length >= required;
  const ready = photosMet && (zone !== 'ambitious' || draft.ambitiousConfirmed);
  const coverHue = draft.photos[0]?.hue ?? hueFor(DRAFT_ID);
  const overlayOpen = draft.sheetOpen || draft.actionSheet != null || draft.discardAlertOpen;
  const dirty =
    draft.published ||
    draft.price !== INITIAL_DRAFT.price ||
    draft.grade !== INITIAL_DRAFT.grade ||
    draft.photos.map(photo => photo.id).join() !== INITIAL_PHOTOS.map(photo => photo.id).join() ||
    draft.flaws.map(flaw => flaw.id).join() !== INITIAL_FLAWS.map(flaw => flaw.id).join();

  const makeToast = (text: string, undo: UndoPayload | null = null): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, text, undo};
  };

  // PRICE — crossing INTO ambitious clears ambitiousConfirmed (the
  // override must be re-earned on every entry).
  const setPrice = (next: number) => {
    setDraft(current => {
      const clamped = Math.min(PRICE_MAX, Math.max(PRICE_MIN, Math.round(next)));
      const crossedIn = zoneFor(clamped) === 'ambitious' && zoneFor(current.price) !== 'ambitious';
      return {
        ...current,
        price: clamped,
        ambitiousConfirmed: crossedIn ? false : current.ambitiousConfirmed,
      };
    });
  };

  // SHEET lifecycle — focus({preventScroll: true}) into the sheet (mobile
  // amendment: plain .focus() scroll-reveals the animating sheet inside
  // the locked column); restore to the Adjust button on close.
  useEffect(() => {
    if (draft.sheetOpen) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [draft.sheetOpen]);
  useEffect(() => {
    if (draft.discardAlertOpen) keepEditingRef.current?.focus({preventScroll: true});
  }, [draft.discardAlertOpen]);

  const openSheet = () => updateDraft({sheetOpen: true, sheetDetent: 'medium'});
  const closeSheet = () => {
    updateDraft({sheetOpen: false, sheetDetent: 'medium'});
    adjustBtnRef.current?.focus();
  };
  const closeActionSheet = () => {
    updateDraft({actionSheet: null});
    overlayOpenerRef.current?.focus();
  };

  // Escape closes the TOPMOST overlay only: alert (z60) > action sheet
  // (z41) > sheet (z41; never open together with an action sheet here).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (draft.discardAlertOpen) {
        updateDraft({discardAlertOpen: false});
        closeBtnRef.current?.focus();
      } else if (draft.actionSheet != null) {
        updateDraft({actionSheet: null});
        overlayOpenerRef.current?.focus();
      } else if (draft.sheetOpen) {
        updateDraft({sheetOpen: false, sheetDetent: 'medium'});
        adjustBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [draft.discardAlertOpen, draft.actionSheet, draft.sheetOpen, updateDraft]);

  // PHOTOS — tap an unmet slot to fill the next one; tap a filled slot for
  // the action sheet (Set as cover / Remove photo — undoOverConfirm).
  const fillNextSlot = () => {
    const id = `ph-${draft.photoSeq + 1}`;
    updateDraft({
      photoSeq: draft.photoSeq + 1,
      photos: [...draft.photos, {id, hue: hueFor(id)}],
      toast: makeToast(`Photo added — ${draft.photos.length + 1} of ${required}`),
    });
  };
  const openPhotoActions = (photoId: string, opener: HTMLElement) => {
    overlayOpenerRef.current = opener;
    updateDraft({actionSheet: {kind: 'photo', photoId}});
  };
  const setAsCover = (photoId: string) => {
    const photo = draft.photos.find(entry => entry.id === photoId);
    if (photo == null) return;
    updateDraft({
      photos: [photo, ...draft.photos.filter(entry => entry.id !== photoId)],
      actionSheet: null,
      toast: makeToast('Cover photo updated'),
    });
    overlayOpenerRef.current?.focus();
  };
  const removePhoto = (photoId: string) => {
    const index = draft.photos.findIndex(entry => entry.id === photoId);
    if (index < 0) return;
    const photo = draft.photos[index];
    updateDraft({
      photos: draft.photos.filter(entry => entry.id !== photoId),
      actionSheet: null,
      toast: makeToast('Photo removed', {kind: 'photo', photo, index}),
    });
  };

  // FLAWS — canvas tap and the 'Add flaw' keyboard path share one adder;
  // remove executes immediately with Undo (undoOverConfirm).
  const addFlaw = (x: number, y: number) => {
    if (draft.flaws.length >= MAX_FLAWS) {
      updateDraft({toast: makeToast('Max 5 flaws')});
      return;
    }
    const preset = PRESET_FLAWS[Math.min(draft.flawSeq, PRESET_FLAWS.length - 1)];
    const flaw: Flaw = {id: `fl-${draft.flawSeq + 1}`, label: preset.label, x, y};
    updateDraft({
      flawSeq: draft.flawSeq + 1,
      flaws: [...draft.flaws, flaw],
      toast: makeToast(`Flaw ${draft.flaws.length + 1} added — ${preset.label}`),
    });
  };
  const removeFlaw = (flawId: string) => {
    const index = draft.flaws.findIndex(entry => entry.id === flawId);
    if (index < 0) return;
    const flaw = draft.flaws[index];
    updateDraft({
      flaws: draft.flaws.filter(entry => entry.id !== flawId),
      toast: makeToast('Flaw removed', {kind: 'flaw', flaw, index}),
    });
  };

  // UNDO — restores the exact prior state (original list position).
  const undoLast = () => {
    const undo = draft.toast?.undo;
    if (undo == null) return;
    if (undo.kind === 'photo') {
      const photos = [...draft.photos];
      photos.splice(undo.index, 0, undo.photo);
      updateDraft({photos, toast: makeToast('Photo restored')});
    } else {
      const flaws = [...draft.flaws];
      flaws.splice(undo.index, 0, undo.flaw);
      updateDraft({flaws, toast: makeToast('Flaw restored')});
    }
  };

  // PUBLISH — always enabled; routes to the blocking gate on press.
  const onPublish = (event: {currentTarget: HTMLElement}) => {
    if (draft.published) return;
    if (!photosMet) {
      const missing = required - draft.photos.length;
      photosHeaderRef.current?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      updateDraft({
        toast: makeToast(`Add ${missing} more photo${missing === 1 ? '' : 's'} for Grade ${draft.grade}`),
      });
      return;
    }
    if (zone === 'ambitious' && !draft.ambitiousConfirmed) {
      overlayOpenerRef.current = event.currentTarget;
      updateDraft({actionSheet: {kind: 'ambitious'}});
      return;
    }
    updateDraft({published: true, toast: makeToast('Listing published')});
  };
  const confirmAmbitious = () => {
    updateDraft({
      ambitiousConfirmed: true,
      actionSheet: null,
      toast: makeToast('Ambitious price confirmed — ready to publish'),
    });
    overlayOpenerRef.current?.focus();
  };

  // DISCARD — X with a dirty draft opens the centered alert (irreversible
  // draft discard: alert, not undo); scrim does NOT dismiss.
  const onCloseTap = () => {
    if (!dirty) {
      updateDraft({toast: makeToast('No changes to discard')});
      return;
    }
    updateDraft({discardAlertOpen: true});
  };
  const keepEditing = () => {
    updateDraft({discardAlertOpen: false});
    closeBtnRef.current?.focus();
  };
  const discardDraft = () => {
    setDraft({...INITIAL_DRAFT, toast: makeToast('Draft discarded')});
    closeBtnRef.current?.focus();
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };
  const zoneChipStyle =
    zone === 'under' ? styles.zoneChipUnder : zone === 'fair' ? styles.zoneChipFair : styles.zoneChipAmb;
  const stateChipStyle = draft.published
    ? styles.stateChipPublished
    : ready
      ? styles.stateChipReady
      : styles.stateChipDraft;
  const stateChipText = draft.published ? 'Published' : ready ? 'Ready' : 'Draft';
  const priceLabel = fmtUsd(draft.price * 100);
  const photoSheet = draft.actionSheet?.kind === 'photo' ? draft.actionSheet : null;
  const activePhoto =
    photoSheet == null ? undefined : draft.photos.find(photo => photo.id === photoSheet.photoId);
  const activePhotoIndex = activePhoto == null ? -1 : draft.photos.indexOf(activePhoto);
  // Unmet slots — grade-driven: Grade B default → 5 required, 3 filled →
  // 2 dashed slots (stress fixture 3 flips this to 3 at Grade C).
  const unmetCount = Math.max(0, required - draft.photos.length);

  const legendActive: Record<Zone, CSSProperties> = {
    under: {...styles.zoneChipUnder, borderColor: 'transparent'},
    fair: {...styles.zoneChipFair, borderColor: 'transparent'},
    ambitious: {...styles.zoneChipAmb, borderColor: 'transparent'},
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{WORNWELL_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              ref={closeBtnRef}
              className="wnw-btn wnw-focusable"
              style={styles.iconBtn}
              aria-label={dirty ? 'Close — discard draft?' : 'Close draft'}
              onClick={onCloseTap}>
              <Icon icon={XIcon} size="md" color="inherit" />
            </button>
          </div>
          <div style={styles.navCenter}>
            <WornwellMark />
            <h1 style={styles.navTitle}>New Listing</h1>
          </div>
          <div style={styles.navTrailing}>
            <span style={{...styles.stateChip, ...stateChipStyle}}>{stateChipText}</span>
          </div>
        </header>

        <main style={styles.main} aria-label={`Listing draft ${DRAFT_ID} — seller ${SELLER}`}>
          {/* PREVIEW CARD — every sheet scrub re-renders this price, zone
              chip, and earnings line in the same beat. */}
          <div style={{...styles.listCard, marginTop: 12}}>
            <div style={styles.previewInner}>
              <div
                style={{
                  ...styles.coverThumb,
                  ...(isNarrow ? styles.coverThumbSmall : null),
                  background: gradientFor(coverHue),
                }}
                aria-hidden
              />
              <div style={styles.previewStack}>
                <h2 style={styles.previewTitle}>{ITEM.title}</h2>
                <span style={styles.previewMeta}>
                  {ITEM.brand} · Size {ITEM.size} · {ITEM.color}
                </span>
                <button
                  type="button"
                  className="wnw-btn wnw-focusable"
                  style={styles.priceRowBtn}
                  aria-label={`Asking price ${priceLabel}, ${ZONE_LABEL[zone]} — adjust price`}
                  onClick={openSheet}>
                  <span style={styles.previewPrice}>{priceLabel}</span>
                  <span style={{...styles.zoneChip, ...zoneChipStyle}}>{ZONE_LABEL[zone]}</span>
                </button>
              </div>
            </div>
            <div style={{height: 1, background: 'var(--color-border)', marginInline: 16}} />
            <div style={styles.earningsRow}>
              <span style={styles.earnLabel}>You earn</span>
              <span style={styles.earnValue}>{fmtUsd(earn)} after fees</span>
            </div>
          </div>

          {/* PHOTOS — live count; Publish scrolls here when the quota is
              unmet. */}
          <h2 ref={photosHeaderRef} style={styles.sectionHeader}>
            Photos · {draft.photos.length} of {required}
          </h2>
          <div style={styles.photoGrid}>
            {draft.photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className="wnw-btn wnw-focusable"
                style={{...styles.photoSlot, background: gradientFor(photo.hue)}}
                aria-label={`Photo ${index + 1} of ${draft.photos.length}${index === 0 ? ', cover' : ''} — photo actions`}
                onClick={event => openPhotoActions(photo.id, event.currentTarget)}>
                <span style={styles.slotBadge}>{index + 1}</span>
                {index === 0 ? <span style={styles.coverBadge}>COVER</span> : null}
              </button>
            ))}
            {Array.from({length: unmetCount}, (_, offset) => (
              <button
                key={`unmet-${draft.photos.length + offset + 1}`}
                type="button"
                className="wnw-btn wnw-focusable"
                style={{...styles.photoSlot, ...styles.photoSlotUnmet}}
                aria-label={`Add photo ${draft.photos.length + offset + 1} of ${required}`}
                onClick={fillNextSlot}>
                <Icon icon={PlusIcon} size="md" color="inherit" />
              </button>
            ))}
          </div>

          {/* CONDITION — grade drives the photo quota above. */}
          <h2 style={styles.sectionHeader}>Condition</h2>
          <div style={styles.listCard}>
            <div style={styles.gradeBlock}>
              <ConditionGradePicker grade={draft.grade} onChange={grade => updateDraft({grade})} />
            </div>
            <div style={styles.gradeCaption}>
              Grade {draft.grade} requires {required} photos
            </div>
          </div>

          {/* FLAWS — canvas pins + checklist rows share one array. */}
          <h2 style={styles.sectionHeader}>Flaws · {draft.flaws.length}</h2>
          <div style={styles.listCard}>
            <div style={styles.canvasBlock}>
              <FlawPinCanvas
                flaws={draft.flaws}
                onCanvasTap={addFlaw}
                onPinTap={(flaw, index) =>
                  updateDraft({toast: makeToast(`Flaw ${index + 1}: ${flaw.label}`)})
                }
              />
            </div>
            <div style={styles.addFlawRow}>
              <button
                type="button"
                className="wnw-btn wnw-focusable"
                style={{
                  ...styles.secondaryBtn,
                  ...(draft.flaws.length >= MAX_FLAWS ? styles.secondaryBtnDisabled : null),
                }}
                disabled={draft.flaws.length >= MAX_FLAWS}
                aria-disabled={draft.flaws.length >= MAX_FLAWS}
                onClick={() => {
                  const preset = PRESET_FLAWS[Math.min(draft.flawSeq, PRESET_FLAWS.length - 1)];
                  addFlaw(preset.x, preset.y);
                }}>
                Add flaw
              </button>
              {draft.flaws.length >= MAX_FLAWS ? <span style={styles.maxCaption}>Max 5 flaws</span> : null}
            </div>
            {draft.flaws.map((flaw, index) => (
              <div key={flaw.id}>
                {/* Divider at the text's left edge: 16 pad + 24 dot + 12
                    gap = 52 (spec said 68; 68 assumes a 48px thumb — the
                    divider-at-text-edge law wins, noted as deviation). */}
                <div style={{height: 1, background: 'var(--color-border)', marginInlineStart: 52}} />
                <div style={styles.flawRow}>
                  <span style={styles.flawDot} aria-hidden>
                    {index + 1}
                  </span>
                  <span style={styles.flawText}>{flaw.label}</span>
                  <button
                    type="button"
                    className="wnw-btn wnw-focusable"
                    style={styles.iconBtn}
                    aria-label={`Remove flaw ${index + 1}, ${flaw.label.toLowerCase()}`}
                    onClick={() => removeFlaw(flaw.id)}>
                    <Icon icon={XIcon} size="sm" color="inherit" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DETAILS — static label + value rows (no chevron, no no-op). */}
          <h2 style={styles.sectionHeader}>Details</h2>
          <div style={styles.listCard}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Category</span>
              <span style={styles.detailValue}>{ITEM.category}</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Brand</span>
              <span style={styles.detailValue}>{ITEM.brand}</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Ships from</span>
              <span style={styles.detailValue}>{ITEM.shipsFrom}</span>
            </div>
          </div>

          {/* PRICING — the Adjust button is the visible non-gesture sheet
              entry. */}
          <h2 style={styles.sectionHeader}>Pricing</h2>
          <div style={styles.listCard}>
            <div style={styles.pricingRow}>
              <div style={styles.pricingText}>
                <span style={styles.pricingPrimary}>Asking price</span>
                <span style={styles.pricingSecondary}>
                  {priceLabel} · {ZONE_LABEL[zone]} · {daysLabel(days)}
                </span>
              </div>
              <button
                type="button"
                ref={adjustBtnRef}
                className="wnw-btn wnw-focusable"
                style={styles.secondaryBtn}
                aria-label={`Adjust asking price, currently ${priceLabel}`}
                onClick={openSheet}>
                Adjust
              </button>
            </div>
          </div>

          <div style={styles.bottomSpacer} />

          {/* THE ONE TOAST DOCK — polite, no timers, newest replaces prior;
              sticky-in-flow above the footer (absolute only while the shell
              is scroll-locked, per the mobile amendment). */}
          <div
            style={{...styles.toastDock, ...(overlayOpen ? styles.toastDockLocked : null)}}
            aria-live="polite">
            {draft.toast != null ? (
              <div key={draft.toast.seq} style={styles.toast} className="wnw-fade">
                <span style={styles.toastText}>{draft.toast.text}</span>
                {draft.toast.undo != null ? (
                  <>
                    <span style={styles.toastRule} aria-hidden />
                    <button type="button" className="wnw-btn wnw-focusable" style={styles.undoBtn} onClick={undoLast}>
                      Undo
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </main>

        {/* STICKY FOOTER — Publish always enabled pre-publish (routes to
            the blocking gate); disabled only in the post-action state. */}
        <footer style={styles.stickyFooter}>
          <button
            type="button"
            className="wnw-btn wnw-focusable"
            style={{...styles.publishBtn, ...(draft.published ? styles.publishBtnDone : null)}}
            disabled={draft.published}
            aria-disabled={draft.published}
            onClick={onPublish}>
            {draft.published ? 'Published' : 'Publish listing'}
          </button>
        </footer>

        {/* PRICE SHEET — medium detent leaves the preview card visible in
            the top 45%, so the scrub's cross-surface consequences stay on
            screen. */}
        {draft.sheetOpen ? (
          <>
            <div style={styles.sheetScrim} className="wnw-fade" onClick={closeSheet} aria-hidden />
            <Sheet
              titleId="wnw-price-sheet-title"
              title="Price this listing"
              detent={draft.sheetDetent}
              onDetentChange={detent => updateDraft({sheetDetent: detent})}
              onClose={closeSheet}
              sheetRef={sheetRef}
              reducedMotion={reducedMotion}>
              <DaysToSellGauge price={draft.price} />
              {/* Zone legend — static chips, not buttons; state is
                  announced via the slider's valuetext, so aria-hidden. */}
              <div style={styles.zoneChipRow} aria-hidden>
                {(['under', 'fair', 'ambitious'] as const).map(zoneId => (
                  <span
                    key={zoneId}
                    style={{...styles.legendChip, ...(zone === zoneId ? legendActive[zoneId] : null)}}>
                    {ZONE_LABEL[zoneId]}
                  </span>
                ))}
              </div>
              <CompHistogramScrubber price={draft.price} onSetPrice={setPrice} />
              {/* Price readout doubles as the spinbutton (inputControls):
                  ArrowUp/Down ±$1 — the stepper halves are its buttons. */}
              <div
                role="spinbutton"
                tabIndex={0}
                className="wnw-focusable"
                aria-label="Asking price in dollars"
                aria-valuemin={PRICE_MIN}
                aria-valuemax={PRICE_MAX}
                aria-valuenow={draft.price}
                aria-valuetext={priceLabel}
                style={styles.priceReadout}
                onKeyDown={event => {
                  if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setPrice(draft.price + 1);
                  } else if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setPrice(draft.price - 1);
                  }
                }}>
                {priceLabel}
              </div>
              <div style={styles.medianCaption}>
                Median comp {fmtUsd(COMP_MEDIAN * 100)} · {COMPS.length} sold
              </div>
              <div style={styles.controlRow}>
                <div style={styles.stepperTrack}>
                  <div style={styles.stepperRule} aria-hidden />
                  <button
                    type="button"
                    className="wnw-btn wnw-focusable"
                    style={{...styles.stepHalf, ...(draft.price <= PRICE_MIN ? styles.stepHalfDisabled : null)}}
                    disabled={draft.price <= PRICE_MIN}
                    aria-disabled={draft.price <= PRICE_MIN}
                    aria-label="Decrease price by one dollar"
                    onClick={() => setPrice(draft.price - 1)}>
                    <Icon icon={MinusIcon} size="sm" color="inherit" />
                  </button>
                  <button
                    type="button"
                    className="wnw-btn wnw-focusable"
                    style={{...styles.stepHalf, ...(draft.price >= PRICE_MAX ? styles.stepHalfDisabled : null)}}
                    disabled={draft.price >= PRICE_MAX}
                    aria-disabled={draft.price >= PRICE_MAX}
                    aria-label="Increase price by one dollar"
                    onClick={() => setPrice(draft.price + 1)}>
                    <Icon icon={PlusIcon} size="sm" color="inherit" />
                  </button>
                </div>
                <button
                  type="button"
                  className="wnw-btn wnw-focusable"
                  style={styles.secondaryBtn}
                  aria-label={`Match comps — set price to ${fmtUsd(COMP_MEDIAN * 100)}`}
                  onClick={() => setPrice(COMP_MEDIAN)}>
                  Match comps
                </button>
              </div>
              <div style={styles.earnEcho}>You earn {fmtUsd(earn)} after fees</div>
            </Sheet>
          </>
        ) : null}

        {/* ACTION SHEETS — ambitious override / photo actions. */}
        {draft.actionSheet != null ? (
          <div style={styles.sheetScrim} className="wnw-fade" onClick={closeActionSheet} aria-hidden />
        ) : null}
        {draft.actionSheet?.kind === 'ambitious' ? (
          <ActionSheet
            label="Ambitious price confirmation"
            header="Priced above 75% of sold comps. Slower sale likely."
            options={[
              {id: 'confirm-ambitious', label: 'Price ambitious anyway', onSelect: confirmAmbitious},
            ]}
            onCancel={closeActionSheet}
          />
        ) : null}
        {draft.actionSheet?.kind === 'photo' && activePhoto != null ? (
          <ActionSheet
            label={`Photo ${activePhotoIndex + 1} actions`}
            header={`Photo ${activePhotoIndex + 1} of ${draft.photos.length}${activePhotoIndex === 0 ? ' · current cover' : ''}`}
            options={[
              {
                id: 'set-cover',
                label: 'Set as cover',
                onSelect: () => setAsCover(activePhoto.id),
              },
              {
                id: 'remove-photo',
                label: 'Remove photo',
                destructive: true,
                onSelect: () => removePhoto(activePhoto.id),
              },
            ]}
            onCancel={closeActionSheet}
          />
        ) : null}

        {/* DISCARD ALERT — blocking, irreversible; scrim does NOT dismiss. */}
        {draft.discardAlertOpen ? (
          <>
            <div style={styles.alertScrim} aria-hidden />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="wnw-discard-title"
              aria-describedby="wnw-discard-body"
              style={styles.alert}
              onKeyDown={event => trapTabKey(event, event.currentTarget)}>
              <div style={styles.alertBody}>
                <h2 id="wnw-discard-title" style={styles.alertTitle}>
                  Discard listing?
                </h2>
                <span id="wnw-discard-body" style={styles.alertText}>
                  Your draft won&apos;t be saved.
                </span>
              </div>
              <div style={styles.alertBtnRow}>
                <button
                  type="button"
                  ref={keepEditingRef}
                  className="wnw-btn wnw-focusable"
                  style={styles.alertBtn}
                  onClick={keepEditing}>
                  Keep Editing
                </button>
                <span style={styles.alertVRule} aria-hidden />
                <button
                  type="button"
                  className="wnw-btn wnw-focusable"
                  style={{...styles.alertBtn, fontWeight: 600, color: 'var(--color-error)'}}
                  onClick={discardDraft}>
                  Discard
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
