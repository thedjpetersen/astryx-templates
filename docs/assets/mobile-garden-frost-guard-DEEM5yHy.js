var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Coldframe home-garden frost
 *   forecast for tonight: 15 hourly temps 6 PM→8 AM
 *   [46,43,40,38,36,34,33,32,31,30,29,29,32,33,37]°F (min 29°F at 4–5 AM;
 *   exactly 4 hours strictly below 32° — 31,30,29,29 at 2A–5A), six beds
 *   totalling 39 plants (tomato floor 33/low 30 and basil floor 35/low 32
 *   are the two at-risk beds; Herb Spiral's 0° margin is the WATCH case),
 *   five history nights summing to 4 frost nights (<32°) and 11 covers,
 *   and a two-task base morning checklist. No Date.now(), no
 *   Math.random(), no network media — bed swatches are id-derived CSS
 *   gradients, the brand mark is inline SVG.
 * @output Coldframe — Garden Frost Guard: a 390px MOBILE frost-triage
 *   surface. Sticky navBar (28px sprout-in-snowflake mark · 'Coldframe' ·
 *   Sunrise checklist + RefreshCw buttons) over a 44px riskSummaryBar
 *   ('2 beds at risk tonight · low 29°F', amber → green as covers land),
 *   a 232px OvernightLowCurve card (180px SVG: temp polyline, dashed 32°
 *   frost line, 12% tinted below-frost area, per-bed markers at the 4 AM
 *   minimum that jump +4°F when covered), an AT RISK coverQueue of 96px
 *   BedRiskThermo rows (dual-threshold vertical thermometers whose orange
 *   danger-overlap segment collapses on cover) with swipe-to-cover + a
 *   visible Cover button per row + a bulk 'Cover all 2 at-risk beds' row,
 *   a SAFE TONIGHT card, and Beds/History tabs. Covering a bed rewrites
 *   the morning-checklist sheet ('Uncover Tomato Starts after 9 AM'),
 *   moves the Tonight badge, and recomputes the risk band — all from ONE
 *   bedProtection map, every mutation reversible via the persistent
 *   undo-over-confirm toast (bulk undo reverts both beds atomically).
 * @position Page template; emitted by \`astryx template mobile-garden-frost-guard\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet) are position:'absolute' INSIDE
 *   shell; position:fixed is banned. While the morning sheet is open,
 *   shell locks to {height:'100dvh', overflow:'hidden'} and restores on
 *   close. The stage clips to --radius-container; shell paints full-bleed
 *   square. The toast dock is STICKY-IN-FLOW (bottom:76, height:0) per
 *   the foundations amendment — shell-absolute would pin it to the
 *   document bottom on tall scrolling tabs; it flips to shell-absolute
 *   only while the shell is scroll-locked under the open sheet.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand hue (Coldframe
 *   sky blue #4E93C9) split per house rule into BRAND_ACCENT (fills and
 *   ≥3:1 graphics) and BRAND_TEXT (darkened light side for 4.5:1 text);
 *   sanctioned non-brand literals are the amber risk band, green
 *   all-clear band, danger-overlap orange, frost-line amber, and the
 *   thermometer rest track — each declared once with contrast math.
 *   Interactive boundaries and meaningful rest fills (thermometer rest
 *   track, unchecked check circles) use explicit light-dark() pairs at
 *   ≥3:1 against their ACTUAL surface per the batch-2 amendment; hairline
 *   tokens are reserved for passive separators.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — no
 *   scroll-under wiring, noted per contract); riskSummaryBar 44px in
 *   flow; curve card 232px = 44px header + 180px SVG + 8px pad; rows 44px
 *   checklist / 60px two-line / 72px media (48px swatch, 12px radius) /
 *   96px BedRiskThermo; bulk cover row 48px; sectionHeader 13px/600
 *   uppercase 0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px
 *   bottom; largeTitle row 52px (28px/700, compact navBar title always
 *   visible — collapse wiring deliberately skipped per contract); tabBar
 *   exactly 64px sticky bottom z20, 3 tabItems flex:1, 16px-min badge;
 *   sheet detents 55% medium / calc(100% − 56px) large, 24px grabber zone
 *   with 36×5 pill, 52px sheet header; toast dock sticky bottom 76 z30.
 *   TYPE (Figtree via --font-family-body): 28/700 large title · 22/700
 *   stat numerals · 17/600 nav+sheet titles · 16/400–500 body · 13/400
 *   secondary · 11/500 overlines+pills+tab labels; nothing under 11px;
 *   tabular-nums on every temperature and count. Touch: every target
 *   ≥44×44 with ≥8px clearance or merged full-row; every gesture has a
 *   visible button path (per-row Cover/Uncover buttons + bulk row for the
 *   swipe, clickable grabber + X for the sheet).
 *
 * Responsive contract:
 * - Fluid 320–430px: all widths fluid ('100%' / flex / maxWidth); curve
 *   SVG width:'100%' height 180 viewBox 358×180 preserveAspectRatio
 *   'none' (≤10% horizontal scale at the extremes — geometry comments
 *   stay exact at 390); thermo column fixed 44px; bed names ellipsize
 *   (minWidth:0); riskSummaryBar's longest string ('All beds protected ·
 *   low 29°F' ≈ 29ch at 13px) fits 288px of content width at 320; the
 *   sheet's 'Uncover Strawberry Patch after 9 AM' row wraps to two lines
 *   and grows (minHeight 44). overflowX:'clip' on shell is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   renders as a centered 430px phone column with hairline borderInline.
 *   No adaptive relayout; the anatomy is deliberately phone geometry.
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
  RefreshCwIcon,
  SnowflakeIcon,
  SproutIcon,
  SunriseIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math at the declaration. Card surfaces: light ≈ #FFFFFF, dark ≈
// #1C1C1E (relative luminance ≈ 0.012).
// ---------------------------------------------------------------------------

// THE quarantined brand hue (Coldframe sky blue). Fills + graphics only:
// #4E93C9 vs the white card ≈ 3.3:1 (≥3:1 graphic floor); #8FC3E8 vs the
// dark card ≈ 9.0:1 — the dark side is lightened past 4.5:1 per spec.
const BRAND_ACCENT = 'light-dark(#4E93C9, #8FC3E8)';
// Brand TEXT is a different value per house rule (fill vs text): #4E93C9
// fails 4.5:1 on white (3.3:1), so the light side darkens to #2F6E9E ≈
// 5.5:1 on the white card; #8FC3E8 ≈ 9.0:1 on the dark card.
const BRAND_TEXT = 'light-dark(#2F6E9E, #8FC3E8)';
// 12% brand wash for the below-frost curve area (decorative tint).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Swipe action block + checked check circles. #2F6E9E on BOTH sides:
// white label ≈ 5.5:1 in both schemes; block vs light card 5.5:1, vs dark
// card ≈ 3.1:1 (≥3:1 boundary). DEVIATION from the spec's dark-side
// #4E93C9: white on #4E93C9 is only ≈3.4:1, failing 4.5:1 for the 13px
// 'Cover' label, so the darkened hue is kept in dark mode too.
const SWIPE_BLOCK = 'light-dark(#2F6E9E, #2F6E9E)';
const SWIPE_BLOCK_TEXT = '#FFFFFF';
// Tonight-tab badge: white on #2F6E9E ≈ 5.5:1 light; dark text #12293A on
// #8FC3E8 ≈ 7.9:1 dark (white on #8FC3E8 would fail at ≈1.9:1).
const BADGE_BG = 'light-dark(#2F6E9E, #8FC3E8)';
const BADGE_TEXT = 'light-dark(#FFFFFF, #12293A)';
// riskSummaryBar at-risk band: #8A5A00 on #FDF3E3 ≈ 6.2:1; #F5C462 on
// #3A2E17 ≈ 7.1:1 — the 13px/600 band text passes on its TINTED surface.
const RISK_BAND_BG = 'light-dark(#FDF3E3, #3A2E17)';
const RISK_BAND_TEXT = 'light-dark(#8A5A00, #F5C462)';
// All-clear band: #1F6B3A on #E8F3EC ≈ 5.7:1; #7FD6A0 on #16321F ≈ 8.0:1.
const CLEAR_BAND_BG = 'light-dark(#E8F3EC, #16321F)';
const CLEAR_BAND_TEXT = 'light-dark(#1F6B3A, #7FD6A0)';
// Danger-overlap thermometer segment (floor − effectiveLow): #C2410C vs
// the white card ≈ 4.6:1; #F8A46B vs the dark card ≈ 5.0:1 — a meaningful
// rest fill, ≥3:1 vs its actual surface per the amendment.
const DANGER_FILL = 'light-dark(#C2410C, #F8A46B)';
// Frost line + WATCH pill amber: #B45309 on white ≈ 5.0:1; #F5C462 on the
// dark card ≈ 10.5:1 — passes 4.5:1 for the 11px labels it colors.
const AMBER_SOLID = 'light-dark(#B45309, #F5C462)';
// Safe/covered green (track cap, COVERED marker, SAFE pill outline):
// #1F6B3A on white ≈ 6.5:1; #7FD6A0 on the dark card ≈ 9.7:1.
const SAFE_FILL = 'light-dark(#1F6B3A, #7FD6A0)';
// Thermometer REST track + unchecked check-circle boundary — NOT hairline
// tokens (amendment: meaningful rest fills / interactive boundaries need
// ≥3:1 vs their actual surface): #839099 vs white card ≈ 3.3:1; #6E7B85
// vs dark card ≈ 3.9:1.
const TRACK_REST = 'light-dark(#839099, #6E7B85)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// sheet slide-in, skeleton pulse, and the single prefers-reduced-motion
// guard that collapses every transition/animation to instant (static color
// alone still encodes covered / at-risk / loading).
// ---------------------------------------------------------------------------

const COLDFRAME_CSS = \`
.cfg-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.cfg-btn:disabled { cursor: default; }
.cfg-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.cfg-anim { transition: transform 240ms ease, opacity 240ms ease; }
.cfg-fade { transition: opacity 200ms ease; }
.cfg-h { transition: height 200ms ease; }
@keyframes cfg-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.cfg-sheet-in { animation: cfg-sheet-in 240ms ease; }
@keyframes cfg-skel {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
.cfg-skel { animation: cfg-skel 1.6s ease-in-out infinite; }
.cfg-vh {
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
  .cfg-anim, .cfg-fade, .cfg-h { transition: none; }
  .cfg-sheet-in, .cfg-skel { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries alone
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
  // Scroll lock while the sheet is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px icon buttons
  // optically align to the 16px gutter; hairline + blur ALWAYS ON (no
  // scroll-under wiring — chosen variant, per contract).
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
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
  },
  // 44×44 static (non-button) brand slot holding the 28px mark.
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // RISK SUMMARY BAR — 44px full-bleed band in flow under the navBar; no
  // radius (its tint edge is the passive separator — hairline tokens fine
  // there). Colors applied per state at render.
  riskSummaryBar: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Static post-refresh caption (fixed string — no clock reads).
  updatedCaption: {
    paddingBlock: 6,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // CURVE CARD — 232px = 44px header + 180px SVG + 8px pad; card inset by
  // the 16px gutter so the 358-wide viewBox maps 1:1 at the 390 stage.
  curveCard: {
    marginInline: 16,
    marginTop: 12,
    height: 232,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  curveHeader: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  curveHeaderMeta: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
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
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // Bulk cover row — 48px full-width brand-text button with bottom
  // hairline; replaced by a caption once both at-risk beds are covered
  // (buttons that do nothing are banned).
  bulkRow: {
    width: '100%',
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_TEXT,
  },
  bulkDoneCaption: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // BED RISK THERMO row — 96px: 44px thermo column · text stack · 44px-hit
  // Cover button.
  queueRowOuter: {position: 'relative'},
  queueRowClip: {position: 'relative', overflow: 'hidden'},
  queueRowContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 96,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  // 72px-wide full-height swipe action block behind the row.
  swipeBlock: {
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
    fontSize: 13,
    fontWeight: 600,
  },
  thermoCol: {position: 'relative', width: 44, height: 64, flexShrink: 0},
  thermoTrack: {
    position: 'absolute',
    left: 10,
    top: 0,
    width: 8,
    height: 64,
    borderRadius: 999,
    background: TRACK_REST,
  },
  thermoFill: {position: 'absolute', left: 10, bottom: 0, width: 8, borderRadius: 999},
  thermoDanger: {position: 'absolute', left: 10, width: 8, borderRadius: 2, background: DANGER_FILL},
  thermoFloorTick: {
    position: 'absolute',
    left: 6,
    width: 16,
    height: 2,
    background: 'var(--color-text-primary)',
  },
  thermoFloorLabel: {
    position: 'absolute',
    left: 26,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '12px',
  },
  queueText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  queuePrimary: {
    maxWidth: '100%',
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  queueSecondary: {
    maxWidth: '100%',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Risk pills — 11px/500 in 999 radius; meaningful rest fills with
  // explicit pairs (math at the COLOR LITERALS block), never hairlines.
  pill: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    borderRadius: 999,
    padding: '2px 8px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  pillRisk: {background: RISK_BAND_BG, color: RISK_BAND_TEXT, border: \`1px solid \${AMBER_SOLID}\`},
  pillWatch: {background: 'transparent', color: AMBER_SOLID, border: \`1px solid \${AMBER_SOLID}\`},
  pillCovered: {background: CLEAR_BAND_BG, color: CLEAR_BAND_TEXT, border: \`1px solid \${SAFE_FILL}\`},
  pillSafe: {background: 'transparent', color: SAFE_FILL, border: \`1px solid \${SAFE_FILL}\`},
  // Cover/Uncover — 36px visual pill inside a 44px hit (paddingBlock 4).
  coverBtnHit: {height: 44, display: 'flex', alignItems: 'center', flexShrink: 0},
  coverBtn: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 14,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    whiteSpace: 'nowrap',
  },
  coverBtnNeutral: {color: 'var(--color-text-primary)'},
  // SAFE TONIGHT rows — 60px two-line rows.
  row: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
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
  // BEDS TAB — largeTitle row 52px (compact navBar title always visible;
  // collapse wiring skipped per contract, noted in the header comment).
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  bedsCaption: {
    paddingInline: 16,
    paddingBottom: 12,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  bedRow: {
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  bedSwatch: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'light-dark(#1E4D2F, #DFF2E5)',
  },
  bedFloor: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // HISTORY TAB.
  statCard: {
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  statPrimary: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  statSecondary: {fontSize: 13, color: 'var(--color-text-secondary)'},
  historyIconSlot: {
    width: 24,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_TEXT,
  },
  // TAB BAR — exactly 64px sticky bottom z20; 3 tabs flex:1.
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
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
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
    background: BADGE_BG,
    color: BADGE_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom mid-scroll (amendment); flips to shell-absolute only
  // while the shell is scroll-locked under the sheet. The ONE polite live
  // region; z30 sits above content, below the scrim's z40.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {position: 'absolute', insetInline: 0, bottom: 76, height: 0},
  toast: {
    position: 'absolute',
    bottom: 0,
    marginInline: 16,
    maxWidth: 'calc(100% - 32px)',
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
  toastText: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  // Undo — 13px/600 brand text, full 48px-tall hit.
  toastUndo: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  toastStatusPad: {paddingInlineEnd: 16},
  // SHEET — scrim z40 + sheet z41, absolute inside shell; 16px top radius.
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
  // The ONE legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 24px'},
  sheetCaption: {
    paddingBlock: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Checklist card lives inside the sheet — no gutter margin needed.
  sheetCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  checkRow: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 6,
    fontSize: 16,
    textAlign: 'left',
  },
  checkCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
  },
  checkLabel: {flex: 1, minWidth: 0, lineHeight: '22px'},
  checkLabelDone: {color: 'var(--color-text-secondary)', textDecoration: 'line-through'},
  sheetEmptyCaption: {
    paddingTop: 12,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  // SKELETON — impersonates the exact 96/60px rows; deterministic widths.
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  skelThermo: {
    width: 8,
    height: 64,
    marginInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — frozen consts, dual-field (id + display), tabular. CROSS-CHECK
// LEDGER (verified by hand): min temp 29 at 4–5 AM; strictly-below-32 hours
// = {31, 30, 29, 29} at 2A–5A = exactly 4 → curve caption '4 hrs below 32°'
// and band 'low 29°F' both derive. At-risk beds (effectiveLow < floor,
// uncovered): tomato 30<33 ✓, basil 32<35 ✓ — exactly 2 → '2 beds at risk
// tonight' and 'Cover all 2 at-risk beds'. Watch: herb 32−32 = 0 ✓. Safe
// margins: lettuce +4, straw +4, kale +5. Plants 4+6+8+5+7+9 = 39 → '6
// beds · 39 plants'. History: frost nights (low<32) = Jun 28, Jun 14,
// Jun 2, May 24 = 4; covers 2+0+3+2+4 = 11 → '4 frost nights · 11 covers
// this season'. Sheet tasks = 2 + coveredCount (0 → '2 tasks', both
// at-risk covered → '4 tasks').
// ---------------------------------------------------------------------------

interface HourPoint {
  id: string;
  label: string;
  tempF: number;
}

const HOURS: HourPoint[] = [
  {id: 'h18', label: '6 PM', tempF: 46},
  {id: 'h19', label: '7 PM', tempF: 43},
  {id: 'h20', label: '8 PM', tempF: 40},
  {id: 'h21', label: '9 PM', tempF: 38},
  {id: 'h22', label: '10 PM', tempF: 36},
  {id: 'h23', label: '11 PM', tempF: 34},
  {id: 'h00', label: '12 AM', tempF: 33},
  {id: 'h01', label: '1 AM', tempF: 32},
  {id: 'h02', label: '2 AM', tempF: 31},
  {id: 'h03', label: '3 AM', tempF: 30},
  {id: 'h04', label: '4 AM', tempF: 29},
  {id: 'h05', label: '5 AM', tempF: 29},
  // DEVIATION: the spec's array put 6 AM at 30°F, which makes FIVE hours
  // strictly below 32 and breaks its own '4 hrs below 32°' cross-check
  // (31,30,29,29 at 2A–5A). Corrected to 32°F so the law holds exactly.
  {id: 'h06', label: '6 AM', tempF: 32},
  {id: 'h07', label: '7 AM', tempF: 33},
  {id: 'h08', label: '8 AM', tempF: 37},
];

interface Bed {
  id: string;
  name: string;
  plants: number;
  floorF: number; // hardiness floor — damage below this temperature
  forecastLowF: number; // tonight's low at this bed
}

// Identity consts — referenced by id from state and the checklist.
// 'Strawberry Patch' is the sheet-row wrap stress at 320px ('Uncover
// Strawberry Patch after 9 AM' wraps to two lines; the row grows).
const BEDS: Bed[] = [
  {id: 'bed-tomato', name: 'Tomato Starts', plants: 4, floorF: 33, forecastLowF: 30},
  {id: 'bed-basil', name: 'Basil & Peppers', plants: 6, floorF: 35, forecastLowF: 32},
  {id: 'bed-lettuce', name: 'Lettuce Rows', plants: 8, floorF: 26, forecastLowF: 30},
  {id: 'bed-straw', name: 'Strawberry Patch', plants: 5, floorF: 27, forecastLowF: 31},
  {id: 'bed-kale', name: 'Kale & Chard', plants: 7, floorF: 24, forecastLowF: 29},
  {id: 'bed-herb', name: 'Herb Spiral', plants: 9, floorF: 32, forecastLowF: 32},
];

const BED_BY_ID: Record<string, Bed> = Object.fromEntries(BEDS.map(bed => [bed.id, bed]));

interface FrostNight {
  id: string;
  dateLabel: string;
  lowF: number;
  covered: number;
}

// hist-0621 (low 33°, 0 covered) is the no-Snowflake conditional stress.
const HISTORY: FrostNight[] = [
  {id: 'hist-0628', dateLabel: 'Sun, Jun 28', lowF: 30, covered: 2},
  {id: 'hist-0621', dateLabel: 'Sun, Jun 21', lowF: 33, covered: 0},
  {id: 'hist-0614', dateLabel: 'Sun, Jun 14', lowF: 28, covered: 3},
  {id: 'hist-0602', dateLabel: 'Tue, Jun 2', lowF: 31, covered: 2},
  {id: 'hist-0524', dateLabel: 'Sun, May 24', lowF: 27, covered: 4},
];

interface ChecklistTask {
  id: string;
  label: string;
}

const BASE_CHECKLIST: ChecklistTask[] = [
  {id: 'task-vent', label: 'Vent the cold frame'},
  {id: 'task-water', label: 'Water seed trays'},
];

// ---------------------------------------------------------------------------
// PURE HELPERS — every count on screen derives from bedProtection at
// render; nothing is stored twice.
// ---------------------------------------------------------------------------

type Risk = 'risk' | 'watch' | 'safe';

/** A frost cover buys +4°F of protection. */
function effectiveLow(bed: Bed, covered: boolean): number {
  return bed.forecastLowF + (covered ? 4 : 0);
}

/** 'risk' below the floor; 'watch' within 2° above it; else 'safe'. */
function riskOf(bed: Bed, covered: boolean): Risk {
  const margin = effectiveLow(bed, covered) - bed.floorF;
  if (margin < 0) return 'risk';
  if (margin <= 2) return 'watch';
  return 'safe';
}

/** Live at-risk count — derived, never stored. */
function atRiskCount(protection: Record<string, boolean>): number {
  return BEDS.filter(bed => riskOf(bed, protection[bed.id] === true) === 'risk').length;
}

const LOW_TONIGHT = Math.min(...HOURS.map(hour => hour.tempF)); // 29
const HOURS_BELOW_32 = HOURS.filter(hour => hour.tempF < 32).length; // 4
const TOTAL_PLANTS = BEDS.reduce((sum, bed) => sum + bed.plants, 0); // 39
const FROST_NIGHTS = HISTORY.filter(night => night.lowF < 32).length; // 4
const SEASON_COVERS = HISTORY.reduce((sum, night) => sum + night.covered, 0); // 11

// Beds whose ORIGINAL (uncovered) risk is 'risk' — the AT RISK section is
// keyed by original risk so rows never jump between cards mid-undo-window
// (stress fixture 1).
const BASE_AT_RISK = BEDS.filter(bed => riskOf(bed, false) === 'risk');
const BASE_SAFE = BEDS.filter(bed => riskOf(bed, false) !== 'risk');

/** Deterministic hue from a bed id — drives the id-derived swatch gradient. */
function bedHue(id: string): number {
  let hue = 0;
  for (let i = 0; i < id.length; i++) {
    hue = (hue * 31 + id.charCodeAt(i)) % 360;
  }
  return hue;
}

function bedSwatchGradient(id: string): string {
  const h1 = bedHue(id);
  const h2 = (h1 + 40) % 360;
  return \`linear-gradient(135deg, light-dark(hsl(\${h1} 45% 84%), hsl(\${h1} 30% 26%)), light-dark(hsl(\${h2} 50% 68%), hsl(\${h2} 35% 38%)))\`;
}

// ---------------------------------------------------------------------------
// CURVE GEOMETRY — SVG viewBox 358×180. x = 12 + i·23.8 (i 0–14 →
// 12…345.2); y maps 24–48°F to 156–12 (6px per °F): y(t) = 156 − (t−24)·6.
// Frost line 32°F → y 108. Bed markers sit at the 4 AM minimum tick
// (i = 10 → x 250); covering moves a marker up 4°F = 24px.
// ---------------------------------------------------------------------------

const CURVE_X0 = 12;
const CURVE_DX = 23.8;
const FROST_Y = 108;

function curveX(index: number): number {
  return CURVE_X0 + index * CURVE_DX;
}

function curveY(tempF: number): number {
  return 156 - (tempF - 24) * 6;
}

/** Straight-segment polyline path through all 15 hourly points. */
function curvePath(): string {
  return HOURS.map((hour, i) => \`\${i === 0 ? 'M' : 'L'} \${curveX(i).toFixed(1)} \${curveY(hour.tempF)}\`).join(' ');
}

/**
 * Closed region between the curve and the 32° frost line wherever the
 * curve dips below it, with interpolated crossings (the area opens at
 * 1 AM's exact-32 touch and closes at 6 AM's exact-32 return — both sit
 * on the line, so the interpolation degenerates to the tick x itself).
 */
function frostAreaPath(): string {
  const segments: string[] = [];
  let open = false;
  for (let i = 0; i < HOURS.length; i++) {
    const temp = HOURS[i].tempF;
    const below = temp <= 32;
    if (below && !open) {
      // Entry point — interpolate from the previous point when it was above.
      if (i > 0 && HOURS[i - 1].tempF > 32) {
        const prev = HOURS[i - 1].tempF;
        const frac = (prev - 32) / (prev - temp);
        segments.push(\`M \${(curveX(i - 1) + frac * CURVE_DX).toFixed(1)} \${FROST_Y}\`);
      } else {
        segments.push(\`M \${curveX(i).toFixed(1)} \${FROST_Y}\`);
      }
      open = true;
    }
    if (open && below) {
      segments.push(\`L \${curveX(i).toFixed(1)} \${curveY(temp)}\`);
    }
    if (open && !below) {
      const prev = HOURS[i - 1].tempF;
      const frac = (32 - prev) / (temp - prev);
      segments.push(\`L \${(curveX(i - 1) + frac * CURVE_DX).toFixed(1)} \${FROST_Y} Z\`);
      open = false;
    }
  }
  if (open) segments.push(\`L \${curveX(HOURS.length - 1).toFixed(1)} \${FROST_Y} Z\`);
  return segments.join(' ');
}

// X-axis keeps exactly 4 ticks at every width: 6P · 12A · 4A · 8A.
const CURVE_TICKS = [
  {index: 0, label: '6P'},
  {index: 6, label: '12A'},
  {index: 10, label: '4A'},
  {index: 14, label: '8A'},
];

// ---------------------------------------------------------------------------
// THERMO GEOMETRY — 8px-wide track spanning 64px maps 24–44°F at 3.2px per
// °F. heightFromBottom(t) = (t−24)·3.2. Tomato uncovered: fill 19.2px (30°),
// floor tick 28.8px up (33°) → 9.6px danger overlap; covered: fill 32px
// (34°) ≥ floor → overlap 0 (height collapses, 200ms, instant under
// reduced motion) and the fill turns green.
// ---------------------------------------------------------------------------

const THERMO_PX_PER_DEG = 3.2;
const THERMO_MIN_F = 24;
const THERMO_H = 64;

function thermoHeight(tempF: number): number {
  return Math.max(0, Math.min(THERMO_H, (tempF - THERMO_MIN_F) * THERMO_PX_PER_DEG));
}

// ---------------------------------------------------------------------------
// CONTAINER WIDTH + FOCUS UTILITIES
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

/** The demo's page scroller — per-tab scroll positions are keyed off it. */
function pageScroller(): Element | null {
  return typeof document === 'undefined' ? null : document.scrollingElement;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 28px sprout-in-snowflake: hexagonal snowflake outline (1.5px
// brand stroke) enclosing a two-leaf sprout in text-primary. aria-hidden;
// the adjacent 'Coldframe' navBar title is the accessible name.
// ---------------------------------------------------------------------------

function SproutSnowflakeMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        {/* Pointy-top hexagon, r=12 about (14,14). */}
        <path
          d="M14 2 L24.4 8 L24.4 20 L14 26 L3.6 20 L3.6 8 Z"
          stroke={BRAND_ACCENT}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        {/* Two mirrored leaves + 2px stem — stroke text-primary (NEVER
            var(--color-text)). */}
        <path d="M14 21v-8" stroke="var(--color-text-primary)" strokeWidth={2} strokeLinecap="round" />
        <path
          d="M14 13 C10.2 13 8.2 10.6 8 8 C11 8.2 13.6 9.8 14 13 Z"
          stroke="var(--color-text-primary)"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path
          d="M14 13 C17.8 13 19.8 10.6 20 8 C17 8.2 14.4 9.8 14 13 Z"
          stroke="var(--color-text-primary)"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// OVERNIGHT LOW CURVE — 358×180 SVG (width 100%, preserveAspectRatio
// 'none': ≤10% horizontal scale across 320–430). Markers are aria-hidden
// decoration; the thermo-row text carries the data. All three markers sit
// at the 4 AM minimum; they stagger ±14px in x so basil (32°) and herb
// (32°) don't cover each other — DEVIATION from the spec's single shared
// x, noted in the final summary.
// ---------------------------------------------------------------------------

interface CurveProps {
  protection: Record<string, boolean>;
  reducedMotion: boolean;
}

function OvernightLowCurve({protection, reducedMotion}: CurveProps) {
  // Marker beds: original at-risk + watch, fixture order.
  const markerBeds = BEDS.filter(bed => riskOf(bed, false) !== 'safe');
  return (
    <section style={styles.curveCard} aria-label="Overnight low curve">
      <div style={styles.curveHeader}>
        {/* Caption cross-check: temps 31,30,29,29 at 2A–5A = 4 hrs. */}
        <span>6 PM – 8 AM · {HOURS_BELOW_32} hrs below 32°</span>
        <span style={styles.curveHeaderMeta}>°F</span>
      </div>
      <svg
        width="100%"
        height={180}
        viewBox="0 0 358 180"
        preserveAspectRatio="none"
        role="img"
        aria-label={\`Overnight temperatures fall from 46 to \${LOW_TONIGHT} degrees at 4 AM, with \${HOURS_BELOW_32} hours below the 32 degree frost line\`}>
        {/* Below-frost area under the curve — 12% brand tint. */}
        <path d={frostAreaPath()} fill={BRAND_TINT_12} stroke="none" />
        {/* Frost line at 32°F (y=108). */}
        <line x1={CURVE_X0} y1={FROST_Y} x2={345.2} y2={FROST_Y} stroke={AMBER_SOLID} strokeWidth={1} strokeDasharray="4 4" />
        <text x={345.2} y={FROST_Y - 5} textAnchor="end" fontSize={11} fontWeight={500} fill={AMBER_SOLID}>
          32° frost
        </text>
        {/* The temperature polyline. */}
        <path d={curvePath()} stroke={BRAND_ACCENT} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {/* X-axis — exactly 4 ticks at every width. */}
        {CURVE_TICKS.map(tick => (
          <text
            key={tick.label}
            x={curveX(tick.index)}
            y={172}
            textAnchor="middle"
            fontSize={11}
            fontWeight={500}
            fill="var(--color-text-secondary)">
            {tick.label}
          </text>
        ))}
        {/* Per-bed markers at the 4 AM minimum (i=10, x=250); covering
            translates a marker up 24px (4°F · 6px), 240ms, instant under
            reduced motion. Herb's watch marker sits exactly ON the frost
            line (cy=108 — stress fixture 2). */}
        {markerBeds.map((bed, index) => {
          const covered = protection[bed.id] === true;
          const risk = covered ? 'covered' : riskOf(bed, false);
          const cx = 250 + (index - (markerBeds.length - 1) / 2) * 14;
          const cy = curveY(bed.forecastLowF);
          const fill =
            risk === 'covered' ? SAFE_FILL : risk === 'risk' ? AMBER_SOLID : 'var(--color-background-card)';
          const stroke = risk === 'watch' ? AMBER_SOLID : 'var(--color-background-card)';
          return (
            <g
              key={bed.id}
              aria-hidden
              style={{
                transform: covered ? 'translateY(-24px)' : undefined,
                transition: reducedMotion ? 'none' : 'transform 240ms ease',
              }}>
              <circle cx={cx} cy={cy} r={5} fill={fill} stroke={stroke} strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
    </section>
  );
}

// ---------------------------------------------------------------------------
// BED RISK THERMO — the 96px coverQueue row body: 44px dual-threshold
// thermometer (rest track ≥3:1 vs card), name + status line + risk pill,
// trailing 44px-hit Cover/Uncover button.
// ---------------------------------------------------------------------------

interface ThermoProps {
  bed: Bed;
  covered: boolean;
}

function BedThermo({bed, covered}: ThermoProps) {
  const eff = effectiveLow(bed, covered);
  const fillH = thermoHeight(eff);
  const floorFromBottom = thermoHeight(bed.floorF);
  const overlapH = Math.max(0, floorFromBottom - fillH); // danger gap px
  const floorTop = THERMO_H - floorFromBottom;
  return (
    <span style={styles.thermoCol} aria-hidden>
      <span style={styles.thermoTrack} />
      <span
        style={{
          ...styles.thermoFill,
          height: fillH,
          background: covered ? SAFE_FILL : BRAND_ACCENT,
        }}
      />
      {/* Danger overlap (floor − effectiveLow): tomato 33−30 → 3° = 9.6px;
          covered → eff 34 ≥ 33 → 0px, the segment collapses (height
          200ms via .cfg-h, instant under reduced motion). */}
      <span className="cfg-h" style={{...styles.thermoDanger, bottom: fillH, height: overlapH}} />
      <span style={{...styles.thermoFloorTick, top: floorTop - 1}} />
      <span style={{...styles.thermoFloorLabel, top: floorTop - 6}}>{bed.floorF}°</span>
    </span>
  );
}

function riskPill(risk: Risk | 'covered'): ReactNode {
  if (risk === 'covered') return <span style={{...styles.pill, ...styles.pillCovered}}>COVERED</span>;
  if (risk === 'risk') return <span style={{...styles.pill, ...styles.pillRisk}}>AT RISK</span>;
  if (risk === 'watch') return <span style={{...styles.pill, ...styles.pillWatch}}>WATCH</span>;
  return <span style={{...styles.pill, ...styles.pillSafe}}>SAFE</span>;
}

// ---------------------------------------------------------------------------
// COVER QUEUE ROW — the swipe contract: horizontal pointer drag translates
// the row (clamped at −72 over the action block); releasing past −36
// COMMITS the cover immediately (undo-over-confirm — no confirm step) and
// the row springs back. MANDATORY visible button path: the trailing
// Cover/Uncover button (this template's single row action, doubling as the
// ellipsis-fallback slot) plus the bulk cover row above.
// ---------------------------------------------------------------------------

interface CoverQueueRowProps {
  bed: Bed;
  covered: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
  onDragStateChange: (bedId: string | null) => void;
}

function CoverQueueRow({bed, covered, isLast, reducedMotion, onToggle, onDragStateChange}: CoverQueueRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const offset = dragX != null ? Math.max(-72, Math.min(0, dragX)) : 0;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    setDragX(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - startXRef.current;
    if (Math.abs(dx) > 8) {
      movedRef.current = true;
      onDragStateChange(bed.id);
    }
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (dragX == null) return;
    const settled = Math.max(-72, Math.min(0, dragX));
    setDragX(null);
    onDragStateChange(null);
    if (movedRef.current && settled < -36) onToggle();
  };

  const eff = effectiveLow(bed, covered);
  const statusLine = covered
    ? \`covered · effective \${eff}°F\`
    : \`hardy to \${bed.floorF}°F · tonight \${bed.forecastLowF}°F\`;
  const risk: Risk | 'covered' = covered ? 'covered' : riskOf(bed, false);

  return (
    <div style={styles.queueRowOuter}>
      <div style={styles.queueRowClip}>
        {/* Swipe action block — brand Cover / neutral Uncover; revealed by
            drag only, so it stays out of the tab order (the visible
            button is the keyboard path). */}
        <span
          style={{
            ...styles.swipeBlock,
            background: covered ? 'var(--color-background-muted)' : SWIPE_BLOCK,
            color: covered ? 'var(--color-text-primary)' : SWIPE_BLOCK_TEXT,
          }}
          aria-hidden>
          <Icon icon={SnowflakeIcon} size="md" color="inherit" />
          {covered ? 'Uncover' : 'Cover'}
        </span>
        <div
          style={{
            ...styles.queueRowContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 240ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <BedThermo bed={bed} covered={covered} />
          <span style={styles.queueText}>
            <span style={styles.queuePrimary}>{bed.name}</span>
            <span style={styles.queueSecondary}>{statusLine}</span>
            {riskPill(risk)}
          </span>
          <span style={styles.coverBtnHit}>
            <button
              type="button"
              className="cfg-btn cfg-focusable"
              style={{...styles.coverBtn, ...(covered ? styles.coverBtnNeutral : null)}}
              aria-label={\`\${covered ? 'Uncover' : 'Cover'} \${bed.name}\`}
              onClick={() => {
                if (movedRef.current) {
                  movedRef.current = false;
                  return;
                }
                onToggle();
              }}>
              {covered ? 'Uncover' : 'Cover'}
            </button>
          </span>
        </div>
      </div>
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SKELETON ROWS — impersonate the exact 96px queue / 60px safe rows so
// resolution causes zero layout shift; deterministic widths cycle
// 60/45/70% (primary) and 40/55/30% (secondary). Blocks aria-hidden; the
// container carries aria-busy and 'Loading' announces once via the dock.
// ---------------------------------------------------------------------------

const SKEL_PRIMARY = ['60%', '45%', '70%'];
const SKEL_SECONDARY = ['40%', '55%', '30%'];

function SkeletonRow({height, index, withThermo, isLast}: {height: number; index: number; withThermo: boolean; isLast: boolean}) {
  return (
    <div aria-hidden>
      <div className="cfg-skel" style={{display: 'flex', alignItems: 'center', gap: 12, height, paddingInline: 16}}>
        {withThermo ? <span style={styles.skelThermo} /> : null}
        <span style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8}}>
          <span style={{...styles.skelBar, width: SKEL_PRIMARY[index % 3]}} />
          <span style={{...styles.skelBar, width: SKEL_SECONDARY[index % 3]}} />
        </span>
      </div>
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MORNING SHEET — half sheet, MEDIUM 55% / LARGE calc(100% − 56px); real
// grabber button toggles detents; role=dialog, focus trapped, opened with
// focus({preventScroll:true}) (plain .focus() would scroll-reveal the
// animating sheet inside the locked overflow-hidden column and beach it
// mid-screen), restored to the Sunrise opener on every close path.
// ---------------------------------------------------------------------------

interface MorningSheetProps {
  detent: 'medium' | 'large';
  coveredBeds: Bed[];
  checklist: Record<string, boolean>;
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onToggleTask: (taskId: string) => void;
  onClose: () => void;
}

function MorningSheet({
  detent,
  coveredBeds,
  checklist,
  reducedMotion,
  sheetRef,
  onDetentChange,
  onToggleTask,
  onClose,
}: MorningSheetProps) {
  // Transient pointer-drag delta only — the detent lives in the owner.
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

  // Task list: 2 base + one uncover row per covered bed, fixture order.
  const tasks: ChecklistTask[] = [
    ...BASE_CHECKLIST,
    ...coveredBeds.map(bed => ({id: \`task-uncover-\${bed.id}\`, label: \`Uncover \${bed.name} after 9 AM\`})),
  ];
  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cfg-sheet-title"
      tabIndex={-1}
      className="cfg-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="cfg-btn cfg-focusable"
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
        <h2 id="cfg-sheet-title" style={styles.sheetTitle}>
          Morning checklist
        </h2>
        <button type="button" className="cfg-btn cfg-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        {/* Task count cross-check: 2 base + coveredCount. */}
        <p style={styles.sheetCaption}>Tomorrow · {BASE_CHECKLIST.length + coveredBeds.length} tasks</p>
        <div style={styles.sheetCard}>
          {tasks.map((task, index) => {
            const done = checklist[task.id] === true;
            return (
              <div key={task.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={done}
                  className="cfg-btn cfg-focusable"
                  style={styles.checkRow}
                  onClick={() => onToggleTask(task.id)}>
                  {/* Unchecked boundary is TRACK_REST (≥3:1 vs card per
                      amendment — border tokens are for passive hairlines
                      only); checked fill #2F6E9E with white 16px check
                      ≈ 5.5:1. */}
                  <span
                    style={{
                      ...styles.checkCircle,
                      border: done ? 'none' : \`2px solid \${TRACK_REST}\`,
                      background: done ? SWIPE_BLOCK : 'transparent',
                      color: SWIPE_BLOCK_TEXT,
                    }}
                    aria-hidden>
                    {done ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                  </span>
                  <span style={{...styles.checkLabel, ...(done ? styles.checkLabelDone : null)}}>{task.label}</span>
                </button>
              </div>
            );
          })}
        </div>
        {coveredBeds.length === 0 ? (
          <p style={styles.sheetEmptyCaption}>No uncover tasks — nothing is covered tonight</p>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — ONE state owner; every count (badge, risk band, checklist length,
// bulk label) DERIVES from bedProtection at render.
// ---------------------------------------------------------------------------

type TabId = 'tonight' | 'beds' | 'history';

interface ToastState {
  seq: number;
  kind: 'undo' | 'status';
  text: string;
  // Exact prior bedProtection map — one Undo restores it atomically
  // (bulk cover reverts BOTH beds from this single snapshot).
  snapshot?: Record<string, boolean>;
}

interface FrostState {
  tab: TabId;
  // Push-stack contract compliance: every tab is a single root screen in
  // this template, so the stack never deepens — kept per contract.
  screenByTab: Record<TabId, 'root'>;
  bedProtection: Record<string, boolean>;
  checklist: Record<string, boolean>;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  toast: ToastState | null;
  openSwipeId: string | null;
  updated: boolean;
  refreshing: boolean;
  scrollByTab: Record<TabId, number>;
}

const INITIAL_STATE: FrostState = {
  tab: 'tonight',
  screenByTab: {tonight: 'root', beds: 'root', history: 'root'},
  bedProtection: {}, // all false — 2 beds at risk, 0 covered
  checklist: {},
  sheetOpen: false,
  sheetDetent: 'medium',
  toast: null,
  openSwipeId: null,
  updated: false,
  refreshing: false,
  scrollByTab: {tonight: 0, beds: 0, history: 0},
};

const TAB_ORDER: TabId[] = ['tonight', 'beds', 'history'];

const TAB_META: Record<TabId, {label: string; icon: typeof SnowflakeIcon}> = {
  tonight: {label: 'Tonight', icon: SnowflakeIcon},
  beds: {label: 'Beds', icon: SproutIcon},
  history: {label: 'History', icon: CalendarClockIcon},
};

export default function MobileGardenFrostGuardTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  // The single reduced-motion guard — checked before every transform
  // animation (marker jump, overlap collapse, sheet slide, swipe spring).
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<FrostState>(INITIAL_STATE);
  // The single update(id, patch) setter — commit helpers below are thin
  // functional-setState wrappers over the same owner for atomic
  // multi-field beats (cover + toast in one patch).
  const update = useCallback(<K extends keyof FrostState>(id: K, patch: FrostState[K]) => {
    setState(prev => ({...prev, [id]: patch}));
  }, []);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sunriseBtnRef = useRef<HTMLButtonElement | null>(null);
  const toastSeqRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const nextToast = (kind: 'undo' | 'status', text: string, snapshot?: Record<string, boolean>): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, kind, text, ...(snapshot != null ? {snapshot} : null)};
  };

  // DERIVED — all from the one bedProtection map, never stored.
  const {bedProtection} = state;
  const coveredBeds = BEDS.filter(bed => bedProtection[bed.id] === true);
  const coveredCount = coveredBeds.length;
  const atRiskNow = atRiskCount(bedProtection);
  const uncoveredAtRisk = BASE_AT_RISK.filter(bed => bedProtection[bed.id] !== true);
  const allClear = atRiskNow === 0;
  const bandText = allClear
    ? \`All beds protected · low \${LOW_TONIGHT}°F\`
    : \`\${atRiskNow} bed\${atRiskNow === 1 ? '' : 's'} at risk tonight · low \${LOW_TONIGHT}°F\`;

  // CONSEQUENCE CHAINS -------------------------------------------------------

  // COVER / UNCOVER — executes immediately (undo-over-confirm, no confirm
  // step). One patch moves: thermo overlap + pill, curve marker, risk band
  // count, Tonight badge, sheet task list, and the undo toast. NO
  // auto-dismiss timer — the toast persists until Undo, the next mutation,
  // or nothing (it survives tab switches; bedProtection is global).
  const toggleBed = (bedId: string) => {
    setState(prev => {
      const wasCovered = prev.bedProtection[bedId] === true;
      const snapshot = prev.bedProtection;
      return {
        ...prev,
        bedProtection: {...snapshot, [bedId]: !wasCovered},
        openSwipeId: null,
        toast: nextToast('undo', \`\${BED_BY_ID[bedId].name} \${wasCovered ? 'uncovered' : 'covered'}\`, snapshot),
      };
    });
  };

  // BULK COVER — both at-risk beds flip true in ONE patch; the single Undo
  // reverts both atomically (stress fixture 4: summary 0→2 at risk, badge
  // 2→0, sheet 4→2 tasks, all from one snapshot).
  const bulkCover = () => {
    setState(prev => {
      const snapshot = prev.bedProtection;
      const bedProtection = {...snapshot};
      let flipped = 0;
      for (const bed of BASE_AT_RISK) {
        if (bedProtection[bed.id] !== true) {
          bedProtection[bed.id] = true;
          flipped += 1;
        }
      }
      if (flipped === 0) return prev;
      return {
        ...prev,
        bedProtection,
        openSwipeId: null,
        toast: nextToast('undo', \`Covered \${flipped} bed\${flipped === 1 ? '' : 's'}\`, snapshot),
      };
    });
  };

  // UNDO — restores the exact prior map (list order and scroll untouched;
  // the AT RISK section is keyed by original risk so nothing reorders).
  const undoLast = () => {
    setState(prev => {
      if (prev.toast?.snapshot == null) return prev;
      return {...prev, bedProtection: prev.toast.snapshot, toast: nextToast('status', 'Restored')};
    });
  };

  // REFRESH — skeleton state resolves on the same click's next frame (two
  // rAFs — frame-ordered, not wall-clock; DEVIATION note: the foundations
  // ban timers, and rAF is the deterministic 'next user-driven frame'
  // resolution this spec asks for). 'Loading' announces once, then
  // 'Updated just now' lands as a role=status toast + static caption.
  const onRefresh = () => {
    if (state.refreshing) return;
    setState(prev => ({...prev, refreshing: true, updated: false, toast: nextToast('status', 'Loading')}));
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setState(prev => ({...prev, refreshing: false, updated: true, toast: nextToast('status', 'Updated just now')}));
      });
    });
  };
  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  // SHEET LIFECYCLE — scroll-lock on shell while open; focus moves in with
  // preventScroll (amendment), restores to the Sunrise opener on X/scrim/
  // Escape close.
  const openSheet = () => {
    setState(prev => ({...prev, sheetOpen: true, sheetDetent: 'medium', openSwipeId: null}));
  };
  const closeSheet = () => {
    update('sheetOpen', false);
    sunriseBtnRef.current?.focus();
  };
  useEffect(() => {
    if (state.sheetOpen) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [state.sheetOpen]);

  // Escape closes the topmost overlay only — the sheet is the sole overlay.
  useEffect(() => {
    if (!state.sheetOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sheetOpen]);

  const toggleTask = (taskId: string) => {
    setState(prev => ({
      ...prev,
      checklist: {...prev.checklist, [taskId]: prev.checklist[taskId] !== true},
    }));
  };

  // TAB LIFECYCLE — per-tab scroll persists (record on exit, restore on
  // entry); overlays close on switch but the toast dock persists (the undo
  // context — bedProtection — is global). Re-tap of the active tab is the
  // one legal reset: scroll to top.
  const selectTab = (tab: TabId) => {
    const scroller = pageScroller();
    if (tab === state.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    setState(prev => ({
      ...prev,
      tab,
      sheetOpen: false,
      openSwipeId: null,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
    }));
  };
  useEffect(() => {
    const scroller = pageScroller();
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.tab] ?? 0;
    // Restore ONLY when the tab changes — not on unrelated state writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);

  const onTabListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TAB_ORDER.indexOf(state.tab);
    const next = TAB_ORDER[(index + (event.key === 'ArrowRight' ? 1 : -1) + TAB_ORDER.length) % TAB_ORDER.length];
    selectTab(next);
    document.getElementById(\`cfg-tab-\${next}\`)?.focus();
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // TONIGHT TAB ---------------------------------------------------------------

  const renderTonight = () => (
    <>
      <h1 className="cfg-vh">Coldframe — frost guard, tonight</h1>
      {/* riskSummaryBar — 44px tinted band; counts decrement live as
          covers land. Amber pair ≈6.2:1 light / ≈7.1:1 dark on the tint;
          green pair ≈5.7:1 / ≈8.0:1. */}
      <div
        style={{
          ...styles.riskSummaryBar,
          background: allClear ? CLEAR_BAND_BG : RISK_BAND_BG,
          color: allClear ? CLEAR_BAND_TEXT : RISK_BAND_TEXT,
        }}>
        {bandText}
      </div>
      {state.updated ? <div style={styles.updatedCaption}>Updated just now</div> : null}

      <OvernightLowCurve protection={bedProtection} reducedMotion={prefersReduced} />

      <h2 style={styles.sectionHeader}>At risk</h2>
      {/* coverQueue — keyed by ORIGINAL risk (stress fixture 1): covered
          rows stay here with green pills instead of jumping cards
          mid-undo-window. */}
      <div style={styles.listCard} aria-busy={state.refreshing}>
        {state.refreshing ? (
          <>
            <SkeletonRow height={96} index={0} withThermo isLast={false} />
            <SkeletonRow height={96} index={1} withThermo isLast />
          </>
        ) : (
          <>
            {uncoveredAtRisk.length > 0 ? (
              <button type="button" className="cfg-btn cfg-focusable" style={styles.bulkRow} onClick={bulkCover}>
                <Icon icon={SnowflakeIcon} size="sm" color="inherit" />
                Cover all {uncoveredAtRisk.length} at-risk bed{uncoveredAtRisk.length === 1 ? '' : 's'}
              </button>
            ) : (
              // Buttons that do nothing are banned — the exhausted bulk
              // action is REPLACED by a caption.
              <div style={styles.bulkDoneCaption}>All at-risk beds covered</div>
            )}
            <div style={styles.rowDivider} />
            {BASE_AT_RISK.map((bed, index) => (
              <CoverQueueRow
                key={bed.id}
                bed={bed}
                covered={bedProtection[bed.id] === true}
                isLast={index === BASE_AT_RISK.length - 1}
                reducedMotion={prefersReduced}
                onToggle={() => toggleBed(bed.id)}
                onDragStateChange={bedId => update('openSwipeId', bedId)}
              />
            ))}
          </>
        )}
      </div>

      <h2 style={styles.sectionHeader}>Safe tonight</h2>
      <div style={styles.listCard} aria-busy={state.refreshing}>
        {state.refreshing ? (
          <>
            <SkeletonRow height={60} index={0} withThermo={false} isLast={false} />
            <SkeletonRow height={60} index={1} withThermo={false} isLast={false} />
            <SkeletonRow height={60} index={2} withThermo={false} isLast={false} />
            <SkeletonRow height={60} index={3} withThermo={false} isLast />
          </>
        ) : (
          BASE_SAFE.map((bed, index) => {
            const covered = bedProtection[bed.id] === true;
            const risk: Risk | 'covered' = covered ? 'covered' : riskOf(bed, false);
            const isWatch = riskOf(bed, false) === 'watch';
            return (
              <div key={bed.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <div style={styles.row}>
                  <span style={styles.rowText}>
                    <span style={styles.rowPrimary}>{bed.name}</span>
                    <span style={styles.rowSecondary}>
                      {bed.plants} plants · hardy to {bed.floorF}°F
                    </span>
                  </span>
                  {riskPill(risk)}
                  {/* The WATCH bed (Herb Spiral, 0° margin) keeps a Cover
                      button — no cover REQUIRED, but the action is real
                      (stress fixture 2). Pure-safe rows get none. */}
                  {isWatch ? (
                    <span style={styles.coverBtnHit}>
                      <button
                        type="button"
                        className="cfg-btn cfg-focusable"
                        style={{...styles.coverBtn, ...(covered ? styles.coverBtnNeutral : null)}}
                        aria-label={\`\${covered ? 'Uncover' : 'Cover'} \${bed.name}\`}
                        onClick={() => toggleBed(bed.id)}>
                        {covered ? 'Uncover' : 'Cover'}
                      </button>
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );

  // BEDS TAB -------------------------------------------------------------------

  const renderBeds = () => (
    <>
      <h1 className="cfg-vh">Coldframe — beds</h1>
      {/* largeTitle row — compact navBar title stays visible; collapse
          wiring deliberately skipped per contract. */}
      <h2 style={styles.largeTitle}>Beds</h2>
      <div style={styles.bedsCaption}>
        {BEDS.length} beds · {TOTAL_PLANTS} plants
      </div>
      <div style={styles.listCard}>
        {BEDS.map((bed, index) => (
          <div key={bed.id}>
            {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
            {/* Read-only 72px media row as a whole-row button — tapping
                announces the bed's status through the one live region. */}
            <button
              type="button"
              className="cfg-btn cfg-focusable"
              style={styles.bedRow}
              aria-label={\`\${bed.name} — hardy to \${bed.floorF} degrees, tonight \${bed.forecastLowF}\`}
              onClick={() =>
                update('toast', nextToast('status', \`\${bed.name} — hardy to \${bed.floorF}°F · tonight \${bed.forecastLowF}°F\`))
              }>
              <span style={{...styles.bedSwatch, background: bedSwatchGradient(bed.id)}} aria-hidden>
                <Icon icon={SproutIcon} size="md" color="inherit" />
              </span>
              <span style={styles.rowText}>
                <span style={styles.rowPrimary}>{bed.name}</span>
                <span style={styles.rowSecondary}>
                  {bed.plants} plants · tonight {bed.forecastLowF}°F
                </span>
              </span>
              <span style={styles.bedFloor}>{bed.floorF}°F</span>
            </button>
          </div>
        ))}
      </div>
    </>
  );

  // HISTORY TAB ------------------------------------------------------------------

  const renderHistory = () => (
    <>
      <h1 className="cfg-vh">Coldframe — frost history</h1>
      {/* Both aggregates derive live from HISTORY: frost nights = rows
          with low < 32 (4); covers = 2+0+3+2+4 = 11. */}
      <div style={styles.statCard}>
        <span style={styles.statPrimary}>{FROST_NIGHTS} frost nights</span>
        <span style={styles.statSecondary}>{SEASON_COVERS} covers this season</span>
      </div>
      <h2 style={styles.sectionHeader}>Cold nights</h2>
      <div style={styles.listCard}>
        {HISTORY.map((night, index) => (
          <div key={night.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <div style={styles.row}>
              {/* Snowflake ONLY when low < 32 — hist-0621 (33°) renders
                  without it (stress fixture 5). */}
              <span style={styles.historyIconSlot} aria-hidden>
                {night.lowF < 32 ? <Icon icon={SnowflakeIcon} size="sm" color="inherit" /> : null}
              </span>
              <span style={styles.rowText}>
                <span style={styles.rowPrimary}>{night.dateLabel}</span>
                <span style={styles.rowSecondary}>
                  low {night.lowF}°F · {night.covered} covered
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{COLDFRAME_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — leading 44×44 static brand slot, center compact
            title, trailing Sunrise (checklist sheet) + RefreshCw. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <SproutSnowflakeMark />
          </div>
          <p style={styles.navTitle}>Coldframe</p>
          <div style={styles.navTrailing}>
            <button
              type="button"
              ref={sunriseBtnRef}
              className="cfg-btn cfg-focusable"
              style={styles.iconBtn}
              aria-label="Morning checklist"
              aria-haspopup="dialog"
              aria-expanded={state.sheetOpen}
              onClick={openSheet}>
              <Icon icon={SunriseIcon} size="md" color="inherit" />
            </button>
            <button
              type="button"
              className="cfg-btn cfg-focusable"
              style={styles.iconBtn}
              aria-label="Refresh forecast"
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main
          style={styles.main}
          role="tabpanel"
          id={\`cfg-panel-\${state.tab}\`}
          aria-labelledby={\`cfg-tab-\${state.tab}\`}>
          {state.tab === 'tonight' ? renderTonight() : state.tab === 'beds' ? renderBeds() : renderHistory()}
        </main>

        {/* TOAST DOCK — the ONE polite live region: undo toasts (no
            auto-dismiss), refresh status, skeleton 'Loading', bed
            announcements. Sticky-in-flow; absolute only under scroll
            lock. */}
        <div
          style={{...styles.toastDock, ...(state.sheetOpen ? styles.toastDockLocked : null)}}
          aria-live="polite">
          {state.toast != null ? (
            <div
              key={state.toast.seq}
              className="cfg-fade"
              role={state.toast.kind === 'status' ? 'status' : undefined}
              style={{...styles.toast, ...(state.toast.kind === 'status' ? styles.toastStatusPad : null)}}>
              <span style={styles.toastText}>{state.toast.text}</span>
              {state.toast.kind === 'undo' ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="cfg-btn cfg-focusable" style={styles.toastUndo} onClick={undoLast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 3 tabs, roving tabindex, arrow keys; Tonight badge =
            queued cover count, derived. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Coldframe sections" onKeyDown={onTabListKeyDown}>
          {TAB_ORDER.map(tabId => {
            const isActive = state.tab === tabId;
            const meta = TAB_META[tabId];
            return (
              <button
                key={tabId}
                id={\`cfg-tab-\${tabId}\`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={\`cfg-panel-\${tabId}\`}
                tabIndex={isActive ? 0 : -1}
                className="cfg-btn cfg-focusable"
                style={{...styles.tabItem, ...(isActive ? {color: BRAND_TEXT} : null)}}
                onClick={() => selectTab(tabId)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={meta.icon} size="md" color="inherit" />
                  {tabId === 'tonight' && coveredCount > 0 ? (
                    <span style={styles.tabBadge} aria-label={\`\${coveredCount} covers queued\`}>
                      {coveredCount}
                    </span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, fontWeight: isActive ? 600 : 500}}>{meta.label}</span>
              </button>
            );
          })}
        </nav>

        {/* SHEET — scrim z40 + sheet z41, absolute inside shell. */}
        {state.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {state.sheetOpen ? (
          <MorningSheet
            detent={state.sheetDetent}
            coveredBeds={coveredBeds}
            checklist={state.checklist}
            reducedMotion={prefersReduced}
            sheetRef={sheetRef}
            onDetentChange={detent => update('sheetDetent', detent)}
            onToggleTask={toggleTask}
            onClose={closeSheet}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};