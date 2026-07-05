// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Pinbay parking memory for one
 *   garage (GARAGE grg_01 'Marsh Street Garage', levels P1–P5), one active
 *   pin (pin_28m: Level P3 · Pillar B-4, meter 90 total / 62 left / parked
 *   28 min ago — 62+28=90 ✓), five memory cues whose walk-back steps sum
 *   40+55+35+30+20 = 180 ✓, four completed sessions summing 45+75+120+60 =
 *   300 min = 5h 0m ✓ (plus the derived pending row → 'All 5 sessions' ✓),
 *   and three saved places whose visits sum 12+7+3 = 22 ✓. No Date.now(),
 *   no Math.random(), no network media, no map tiles.
 * @output Pinbay — Parking Spot Memory: a 390px MOBILE surface for
 *   remembering WHERE the car is. Four tabs (Find / Drop / History /
 *   Places). Drop hosts a stylized SVG garage cross-section
 *   (GarageLevelStack: 5 isometric slabs, elevator core, car chip, seated
 *   teardrop pin) with a P1–P5 HTML level-picker rail, a Garage/Street/Lot
 *   segmented context row (curb-strip band and 24-stall lot grid variants),
 *   a reorderable CueChipTrail, and a sticky 'Hold to drop pin' footer —
 *   the 450ms hold fans the slabs apart and pointer Y seats the pin, with
 *   the rail as the mandatory button path. Find flips empty-state ⇄
 *   walk-back card (96px SpotDecayTimer coin racing paid-until vs
 *   parked-since rings), a two-detent walk-back sheet with a checkable
 *   reversed cue trail, and a pin-options actionSheet whose 'Clear pin'
 *   executes immediately with Undo (undo-over-confirm).
 * @position Page template; emitted by `astryx template mobile-parking-spot-memory`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, actionSheet, toast-while-locked)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the sheet or actionSheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The stage clips to
 *   --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Pinbay indigo #5B5BD6 — the demo's --color-brand is the
 *   demo logo blue, so the spec hex is quarantined here per house rule).
 *   Slab fills, ring amber, curb-zone hues, and control boundaries carry
 *   explicit light-dark() pairs with contrast math at each declaration —
 *   hairline/muted tokens are used for passive separators ONLY.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS-ON — chosen, no
 *   scroll wiring); Find adds a 52px large-title row (28/700) → 104px
 *   header there, other tabs compact-title-only; segmented context row
 *   52px in flow (36px track, radius 12, 358−4 = 354, 354/3 = 118 per
 *   segment at 390); tabBar exactly 64px sticky bottom z20, 4 tabs flex:1
 *   (390/4 = 97.5), 24px icon over 11px/500 label, 4px gap, Find badge
 *   min-width 16 brand pill 10px/600 top:−4 right:−8 reading '62m'. Rows:
 *   44px utility · 60px two-line (16/500 + 13/400, 2px gap) · 72px media
 *   (48px thumb, 12px radius, divider inset 68). sectionHeader 13/600
 *   uppercase 0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px
 *   bottom. Type: 28/700 · 22/700 · 17/600 · 16/400 body floor · 13/400 ·
 *   11/500; tabular-nums on every timer, count, and step number. Buttons:
 *   48px primary full-width, 36px secondary, 44×44 icon buttons; Drop's
 *   sticky footer = 48 + 2×16 = 80px, sticky at bottom:64 above the
 *   tabBar. Touch: every target ≥44×44 with ≥8px clearance or merged into
 *   a full-row button; every gesture has a visible button path (P1–P5
 *   rail beside the hold-drag, Edit-mode chevrons beside the grip drag,
 *   clickable grabber + X beside the sheet).
 *
 * Responsive contract:
 * - Author at 390; clean 320–430 with ZERO width:390 literals — fluid
 *   widths + maxWidth only. GarageLevelStack SVG: width '100%', height 320
 *   fixed, viewBox '0 0 326 320', preserveAspectRatio 'xMidYMid meet'; the
 *   picker rail is HTML-absolute so its 44×44 hits NEVER scale; at ≤352px
 *   container the SVG block reserves paddingRight 60 (44 rail + 8 inset +
 *   8 clearance) so slabs never underlap the rail. Segments and tab items
 *   are flex:1 (118 / 97.5 are 390-only renderings). Curb strip (326×160)
 *   and lot grid scale via the same viewBox strategy.
 * - Desktop stage (~1045px, measured via a useElementWidth ResizeObserver
 *   on the wrapper — container width, not viewport): ≥720px renders the
 *   phone experience as a centered column (shell maxWidth 430, marginInline
 *   auto, borderInline hairline). No adaptive relayout.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  BookmarkIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CirclePlusIcon,
  GripVerticalIcon,
  HistoryIcon,
  MapPinIcon,
  MapPinOffIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math at the declaration. Hairline/muted tokens appear ONLY on
// passive separators; interactive boundaries and meaningful rest fills use
// the explicit ≥3:1 pairs below.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Pinbay indigo). #5B5BD6 on #FFFFFF ≈ 5.4:1
// (passes 4.5:1); #A5A6F6 on the dark card (~#1C1C1E) ≈ 7.6:1.
const BRAND_ACCENT = 'light-dark(#5B5BD6, #A5A6F6)';
// Text/glyphs over a BRAND_ACCENT fill. Light: #FFFFFF on #5B5BD6 ≈ 5.4:1.
// Dark: white on #A5A6F6 fails (~2.2:1), so the dark side flips to a
// near-black indigo — #1B1B3A on #A5A6F6 ≈ 7.4:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #1B1B3A)';
// Brand-tinted wash for step discs / active-tab tint (decorative behind
// BRAND_ACCENT glyphs, which carry the contrast).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// INTERACTIVE BOUNDARY pair (unchecked selection/check circles, rail button
// borders at rest, secondary-button borders) — ≥3:1 vs their ACTUAL surface
// (the white/dark card): #6E6E76 on #FFFFFF ≈ 5.0:1; #A6A6AE on ~#1C1C1E ≈
// 7.1:1. NOT --color-border, which is a passive hairline.
const CONTROL_EDGE = 'light-dark(#6E6E76, #A6A6AE)';
// GarageLevelStack slab EDGES — the ≥3:1 boundary that makes each slab
// legible against the card: #7B7BD0 on #FFFFFF ≈ 3.8:1; #8B8BE0 on ~#1C1C1E
// ≈ 5.6:1. The slab interior fill below is a wash (the spec's example fill
// #E7E7F8 is only ~1.2:1 vs white, so the 3:1 duty moves to this stroke —
// noted as a deviation in the file summary).
const SLAB_EDGE = 'light-dark(#7B7BD0, #8B8BE0)';
// Slab interior wash (rest) and its brighter illuminated pair (hold-drag
// hover + active level) — meaningful states are ALSO encoded by SLAB_EDGE
// thickening and the −2px lift, never by fill alone.
const SLAB_FILL = 'light-dark(#E7E7F8, #34345C)';
const SLAB_FILL_LIT = 'light-dark(#C9C9F1, #4B4B8F)';
// SpotDecayTimer inner ring (memory freshness racing UP) — amber pair:
// #B45309 on the white card ≈ 5.0:1; #FBBF24 on ~#1C1C1E ≈ 10.3:1 (both
// clear the 3:1 non-text floor with margin).
const RING_AMBER = 'light-dark(#B45309, #FBBF24)';
// Street curb zones. Blue: #2563EB on #FFFFFF ≈ 5.2:1; #93B8FD on ~#1C1C1E
// ≈ 8.5:1. Red (no parking): #C92A2A on #FFFFFF ≈ 5.5:1; #FF8787 on
// ~#1C1C1E ≈ 7.4:1. Loading reuses RING_AMBER.
const ZONE_BLUE = 'light-dark(#2563EB, #93B8FD)';
const ZONE_RED = 'light-dark(#C92A2A, #FF8787)';
// Sheet/actionSheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, transform/opacity-only
// transitions, settle/sheet keyframes, skeleton shimmer, and the
// prefers-reduced-motion guard that collapses ALL of them (shimmer removed
// entirely; static muted blocks still encode 'loading').
// ---------------------------------------------------------------------------

const PINBAY_CSS = `
.pby-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.pby-btn:disabled { cursor: default; }
.pby-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.pby-anim { transition: transform 240ms ease, opacity 240ms ease; }
.pby-fade { transition: opacity 240ms ease; }
@keyframes pby-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.pby-sheet-in { animation: pby-sheet-in 200ms ease; }
@keyframes pby-settle {
  0% { transform: scale(1.15) translateY(-2px); }
  70% { transform: scale(0.98) translateY(2px); }
  100% { transform: none; }
}
.pby-settle { animation: pby-settle 240ms ease; transform-origin: center bottom; }
@keyframes pby-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.pby-shimmer {
  animation: pby-shimmer 1.6s linear infinite;
  background: linear-gradient(90deg, transparent, light-dark(rgba(255,255,255,0.55), rgba(255,255,255,0.08)), transparent);
}
@media (prefers-reduced-motion: reduce) {
  .pby-anim, .pby-fade { transition: none; }
  .pby-sheet-in, .pby-settle { animation: none; }
  .pby-shimmer { animation: none; background: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
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
  // Scroll lock while the sheet/actionSheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline ALWAYS-ON.
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
  navLeading: {display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: 0},
  navTitle: {
    margin: 0,
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // 44×44 non-button brand slot holding the 28px Pinbay mark.
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Edit / Cancel / Done text buttons — 44px-tall hits.
  textBtn: {
    height: 44,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  textBtnStrong: {fontWeight: 600},
  // LARGE-TITLE ROW (Find only) — 52px in flow below the sticky navBar;
  // 52 + 52 = 104px total header on Find.
  largeTitleRow: {height: 52, display: 'flex', alignItems: 'center', paddingInline: 16},
  largeTitle: {margin: 0, fontSize: 28, fontWeight: 700, lineHeight: 1.1},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // SEGMENTED CONTEXT ROW — 52px block in flow below the navBar, same blur
  // surface; 36px track, radius 12; at 390 the track is 358 wide − 4px
  // padding = 354, 354/3 = 118 per segment (flex:1 in code — no literal).
  segmentedRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  segTrack: {
    flex: 1,
    height: 36,
    display: 'flex',
    padding: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid transparent',
  },
  segBtnOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  // Refresh caption — static 'Updated just now', 13/400 centered.
  updatedCaption: {
    marginTop: 8,
    marginBottom: -4,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // CANVAS CARD — 16px gutter inset (card 358 at 390); padding 16 → inner
  // 326 = the SVG viewBox width. position:relative seats the HTML rail.
  canvasCard: {
    position: 'relative',
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  canvasSvgBlock: {display: 'block', width: '100%'},
  // ≤352px container: reserve 44 rail + 8 inset + 8 clearance = 60 on the
  // right so scaled slabs never underlap the fixed-size rail buttons.
  canvasSvgBlockNarrow: {paddingRight: 60},
  // LEVEL-PICKER RAIL — the mandatory button path; HTML absolute (NOT SVG)
  // so 44×44 hits never scale. 5×44 + 4×8 = 252 tall; top 16 pad +
  // (320−252)/2 = 16+34 = 50; right 8.
  levelRail: {
    position: 'absolute',
    top: 50,
    right: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    zIndex: 2,
  },
  railBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    background: 'var(--color-background-card)',
    // Interactive boundary at rest — CONTROL_EDGE ≥3:1 vs the card (math at
    // the declaration), not the passive hairline token.
    border: `1px solid ${CONTROL_EDGE}`,
    color: 'var(--color-text-primary)',
  },
  railBtnOn: {
    background: BRAND_ACCENT,
    border: '1px solid transparent',
    color: BRAND_FILL_TEXT,
  },
  // 44px caption row under the canvas inside the card.
  canvasCaption: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 36px secondary button (foundations-sanctioned inline size).
  secondaryBtn: {
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: `1px solid ${CONTROL_EDGE}`,
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px, 20 top / 8 bottom.
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
  // Inset-grouped listCard.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // Passive separators — the ONLY legal hairline/muted use.
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // CUE ROWS — 60px two-line scale used as single-line reorder rows.
  cueRow: {
    position: 'relative',
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
  },
  cueRowDragging: {zIndex: 3, boxShadow: '0 4px 16px var(--color-shadow)'},
  // 24px step-number disc (11/600 tabular) — merged into the row hit.
  stepDisc: {
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  cueText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  cueLabel: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cueMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  gripBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    touchAction: 'none',
  },
  chevBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
  },
  // selectionCircle — 24px; unchecked boundary = CONTROL_EDGE ≥3:1 vs card
  // (#6E6E76 ≈ 5.0:1 light / #A6A6AE ≈ 7.1:1 dark).
  selectionCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 999,
    border: `2px solid ${CONTROL_EDGE}`,
    display: 'grid',
    placeItems: 'center',
    background: 'transparent',
  },
  // Checked: BRAND_ACCENT fill + BRAND_FILL_TEXT check (#FFF on #5B5BD6 ≈
  // 5.4:1; #1B1B3A on #A5A6F6 ≈ 7.4:1).
  selectionCircleOn: {
    border: '2px solid transparent',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  // WALK-BACK CARD (Find) — coin + stat stack + primary button.
  walkCard: {
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  coinRow: {display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16},
  coinWrap: {position: 'relative', width: 96, height: 96, flexShrink: 0},
  coinCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  coinCenterStack: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0},
  coinBig: {fontSize: 22, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'},
  coinSub: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  statStack: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  statBig: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2},
  statSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  primaryBtn: {
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
  // 44px utility row ('Pin options').
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    paddingInlineEnd: 0,
    fontSize: 16,
  },
  utilityRowLabel: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  utilityRowGlyph: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  // Walk progress caption — '2 of 5 cues passed'.
  walkProgress: {
    marginTop: 8,
    paddingInline: 32,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // EMPTY STATE (true-empty Find).
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
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
  emptyTitle: {margin: 0, fontSize: 17, fontWeight: 600},
  emptyBody: {margin: '4px 0 16px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5},
  // HISTORY — 44px header stat row at the 32px text inset.
  historyStatRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  twoLineRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  twoLineText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  twoLinePrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  twoLineSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  trailingMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: BRAND_ACCENT,
    flexShrink: 0,
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SKELETONS — 60px rows, identical geometry to the loaded rows; bars are
  // muted (legal: aria-hidden loading placeholders, announced once).
  skelRow: {
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  skelSweep: {position: 'absolute', inset: 0, pointerEvents: 'none'},
  // PLACES — 72px media rows, 48px glyph thumb, divider inset 68.
  placeRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  placeThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
  },
  // TAB BAR — exactly 64px sticky bottom z20; 4 tabs flex:1 (97.5 at 390).
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center', width: 24, height: 24},
  tabLabel: {fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // Find badge — brand pill, min-width 16, 10/600, top −4 right −8; reads
  // '62m' (= ACTIVE pin meterLeftMin, single source).
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
  // EDIT TOOLBAR — replaces tabBar with identical 64px geometry.
  editToolbar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
    gap: 12,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  toolbarBtn: {
    height: 44,
    paddingInline: 12,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  toolbarDanger: {color: 'var(--color-error)'},
  toolbarDisabled: {color: 'var(--color-text-secondary)', opacity: 0.4},
  // STICKY FOOTER (Drop) — 48 button + 2×16 padding = 80px; sticky at
  // bottom:64 so it stacks above the 64px tabBar.
  stickyFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 20,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  holdBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom on tall scrolling views; shell-absolute ONLY while the
  // shell is scroll-locked (open sheet/actionSheet). On Drop the anchor
  // rises to 64 tabBar + 80 footer + 12 = 156.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    pointerEvents: 'none',
  },
  toastAnchorDrop: {bottom: 156},
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 0,
    bottom: 76,
    zIndex: 30,
    height: 0,
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
    pointerEvents: 'auto',
  },
  toastMsg: {
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
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41; detents 55% / calc(100% − 56px).
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
  sheetMedium: {height: '55%'},
  sheetLarge: {height: 'calc(100% - 56px)'},
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
  // The ONE legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 16},
  sheetStepsHeader: {
    paddingInline: 16,
    paddingBottom: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  // ACTION SHEET — insetInline 16 bottom 16 z41 over the shared scrim.
  actionSheetWrap: {position: 'absolute', insetInline: 16, bottom: 16, zIndex: 41},
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
    fontVariantNumeric: 'tabular-nums',
  },
  asDivider: {height: 1, background: 'var(--color-border)'},
  asRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  asRowDanger: {color: 'var(--color-error)'},
  asCancelCard: {marginTop: 8},
  asCancelRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic, dual-field, identity consts; every aggregate is
// arithmetically constructible with the sum in a comment.
// CROSS-CHECK LEDGER: 62+28 = 90 meter · 40+55+35+30+20 = 180 steps ·
// 45+75+120+60 = 300 min = 5h 0m · 4+1 = 5 sessions · 12+7+3 = 22 visits ·
// 5×44+4×8 = 252 rail · 8+4×58+72 = 312 ≤ 320 fanned · 100+4×22+72 = 260 ≤
// 320 collapsed · 6×54 = 324+2 = 326 curb · 6×49+5×6 = 324+2 = 326 lot ·
// 48+32 = 80 footer.
// ---------------------------------------------------------------------------

// One geometry, reused by GarageLevelStack and the Places glyphs.
const GARAGE = {
  id: 'grg_01',
  name: 'Marsh Street Garage',
  levels: ['P1', 'P2', 'P3', 'P4', 'P5'],
} as const;

type ParkContext = 'garage' | 'street' | 'lot';

interface ActivePin {
  id: string;
  context: ParkContext;
  level: string; // garage level; kept for the glyph even off-garage
  pillar: string;
  zone: string; // street zone label
  stall: string; // lot stall id
  placeName: string;
  meterTotalMin: number; // 90
  meterLeftMin: number; // 62
  parkedAgoMin: number; // 28 — 62+28 = 90 ✓ (meter started at park time)
}

const ACTIVE_PIN: ActivePin = {
  id: 'pin_28m',
  context: 'garage',
  level: 'P3',
  pillar: 'B-4',
  zone: 'Blue zone',
  stall: 'C-11',
  placeName: GARAGE.name,
  meterTotalMin: 90,
  meterLeftMin: 62,
  parkedAgoMin: 28,
};

interface Cue {
  id: string;
  label: string;
  steps: number;
}

// Park order 1→5. Walk-back consumes the SAME array reversed, so steps read
// elevator-first: 40+55 = 95, +35 = 130, +30 = 160, +20 = 180 ✓.
// cue_5 is the 320px single-line-ellipsis stress label.
const CUES: Cue[] = [
  {id: 'cue_1', label: 'Level P3', steps: 20},
  {id: 'cue_2', label: 'Pillar B-4', steps: 30},
  {id: 'cue_3', label: 'Blue zone', steps: 35},
  {id: 'cue_4', label: 'Aisle L', steps: 55},
  {id: 'cue_5', label: '40 steps from elevator, past the pay station', steps: 40},
];

const CUE_BY_ID: Record<string, Cue> = Object.fromEntries(CUES.map(cue => [cue.id, cue]));

interface CompletedSession {
  id: string;
  place: string;
  spot: string; // 'P2' / 'Blue zone' / 'C-11'
  durMin: number;
  durLabel: string;
  when: string;
}

// Completed total: 45+75 = 120, +120 = 240, +60 = 300 min = 5h 0m ✓.
// Terminal caption 'All 5 sessions' = 4 completed + 1 pending ✓.
const HISTORY: CompletedSession[] = [
  {id: 'ses_a', place: 'Marsh Street Garage', spot: 'P2', durMin: 45, durLabel: '45m', when: 'Yesterday'},
  {id: 'ses_b', place: '5th & Marsh curb', spot: 'Blue zone', durMin: 75, durLabel: '1h 15m', when: 'Thu'},
  {id: 'ses_c', place: 'Rivergate Lot', spot: 'C-11', durMin: 120, durLabel: '2h 0m', when: 'Wed'},
  {id: 'ses_d', place: 'Marsh Street Garage', spot: 'P4', durMin: 60, durLabel: '1h 0m', when: 'Mon'},
];

interface Place {
  id: string;
  name: string;
  hint: string;
  visits: number;
  glyphLevels: number; // mini level-glyph bar count (id-derived, no photos)
}

// Visits: 12+7 = 19, +3 = 22 → '22 visits saved' ✓.
const PLACES: Place[] = [
  {id: 'plc_home', name: 'Marsh Street Garage', hint: 'Usually P2', visits: 12, glyphLevels: 5},
  {id: 'plc_work', name: '5th & Marsh curb', hint: 'Blue zone, 2h max', visits: 7, glyphLevels: 1},
  {id: 'plc_air', name: 'Rivergate Long-Term', hint: 'Row C', visits: 3, glyphLevels: 3},
];

// Street context: 6 curb zones × 54px + 2×1px end caps = 6×54 = 324+2 = 326 ✓.
interface CurbZone {
  id: string;
  kind: 'blue' | 'red' | 'loading';
  label: string;
}

const CURB_ZONES: CurbZone[] = [
  {id: 'cz_1', kind: 'blue', label: '2h'},
  {id: 'cz_2', kind: 'red', label: 'No park'},
  {id: 'cz_3', kind: 'blue', label: '2h'},
  {id: 'cz_4', kind: 'loading', label: 'Loading'},
  {id: 'cz_5', kind: 'blue', label: '2h'},
  {id: 'cz_6', kind: 'red', label: 'No park'},
];
// The seat-able street zone (fixture): cz_3, the middle Blue 2h zone.
const STREET_SEAT_ZONE = 'cz_3';

// Lot context: columns A–F × bays 11–14 = 6×4 = 24 stalls ✓ ('C-11' =
// column C, bay 11 — floor-style two-digit bays keep the fixture id exact).
// Geometry: 6 cols × 49 = 294 + 5×6 gaps = 324 + 1px border each side = 326 ✓.
const LOT_COLS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
const LOT_BAYS = [11, 12, 13, 14] as const;
const LOT_SEAT_STALL = 'C-11';

// History skeletons — deterministic staggered widths (never random).
const SKELETON_WIDTHS: Array<{primary: string; secondary: string}> = [
  {primary: '60%', secondary: '40%'},
  {primary: '45%', secondary: '55%'},
  {primary: '70%', secondary: '30%'},
  {primary: '60%', secondary: '40%'},
];

// ---------------------------------------------------------------------------
// GARAGE GEOMETRY — SVG viewBox '0 0 326 320'. Slabs: parallelograms 240
// wide × 72 deep, left x=8 (326−8−240 = 78 clear for the 44 rail + 8 inset
// + clearance). COLLAPSED top-Ys (P5→P1): 100/122/144/166/188 (spacing 22;
// 100+4×22 = 188; 188+72 = 260 ≤ 320). FANNED: 8/66/124/182/240 (spacing
// 58; 8+4×58 = 240; 240+72 = 312 ≤ 320).
// ---------------------------------------------------------------------------

const SVG_W = 326;
const SVG_H = 320;
const SLAB_W = 240;
const SLAB_DEPTH = 72;
const SLAB_SKEW_DEG = -26.57; // atan(36/72) — top edge offset 36px
// Index 0 = P5 (top slab) … index 4 = P1 (bottom slab).
const COLLAPSED_YS = [100, 122, 144, 166, 188];
const FANNED_YS = [8, 66, 124, 182, 240];
// Levels top→bottom in the stack: P5, P4, P3, P2, P1.
const STACK_LEVELS = ['P5', 'P4', 'P3', 'P2', 'P1'];

// ---------------------------------------------------------------------------
// SPOT DECAY TIMER GEOMETRY — 96×96 coin. Outer ring (meter paid-until):
// r=44, sw=6, C = 2π·44 ≈ 276.46; remaining 62 of 90 → visible arc 62/90,
// strokeDashoffset = 276.46·(28/90) ≈ 86.01. Inner ring (memory freshness
// racing UP): r=34, sw=6, C = 2π·34 ≈ 213.63; elapsed 28 of 240 → dash
// segment 213.63·(28/240) ≈ 24.92. INVARIANT: remaining + parkedSince = 90
// (62+28 = 90) because the fixture meter starts at park time. Static — no
// ticking clock (determinism law).
// ---------------------------------------------------------------------------

const COIN_OUTER_R = 44;
const COIN_INNER_R = 34;
const COIN_OUTER_C = 2 * Math.PI * COIN_OUTER_R; // ≈ 276.46
const COIN_INNER_C = 2 * Math.PI * COIN_INNER_R; // ≈ 213.63

// ---------------------------------------------------------------------------
// ONE STATE OWNER — usePinbayState(): flat entity map + one update(id,
// patch). Every surface (tabs, canvas, rail, trail, sheet, actionSheet,
// toast) reads and writes through it; children hold only transient pointer
// deltas.
// ---------------------------------------------------------------------------

type TabId = 'find' | 'drop' | 'history' | 'places';

const TABS: Array<{id: TabId; label: string}> = [
  {id: 'find', label: 'Find'},
  {id: 'drop', label: 'Drop'},
  {id: 'history', label: 'History'},
  {id: 'places', label: 'Places'},
];

interface ParkingEntity {
  pin: ActivePin | null;
  cueOrder: string[]; // ONE array; walk-back is a pure reversed render
  cuesDoneIds: string[];
  extraSessions: CompletedSession[]; // appended by 'I found it'
  extraPlaces: Place[]; // appended by 'Save as Place'
  savedPlaceForPin: boolean;
}

interface UiEntity {
  activeTab: TabId;
  context: ParkContext; // segmented selection — persists across tab switches
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  actionSheetOpen: boolean;
  editingCues: boolean;
  selectedCueIds: string[];
  historySkeleton: boolean;
  updatedTab: TabId | null; // static 'Updated just now' caption owner
  toast: {seq: number; text: string; undoable: boolean} | null;
  scrollByTab: Record<TabId, number>;
}

interface PinbayEntities {
  parking: ParkingEntity;
  // Exact-prior-state snapshot for Undo (undo-over-confirm law): one
  // assignment restores pin, cues, checks, badge, pending row — everything.
  snapshot: {parking: ParkingEntity | null};
  ui: UiEntity;
}

const INITIAL_ENTITIES: PinbayEntities = {
  parking: {
    pin: ACTIVE_PIN,
    cueOrder: CUES.map(cue => cue.id),
    cuesDoneIds: [],
    extraSessions: [],
    extraPlaces: [],
    savedPlaceForPin: false,
  },
  snapshot: {parking: null},
  ui: {
    activeTab: 'find',
    context: 'garage',
    sheetOpen: false,
    sheetDetent: 'medium',
    actionSheetOpen: false,
    editingCues: false,
    selectedCueIds: [],
    historySkeleton: false,
    updatedTab: null,
    toast: null,
    scrollByTab: {find: 0, drop: 0, history: 0, places: 0},
  },
};

function usePinbayState() {
  const [entities, setEntities] = useState<PinbayEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof PinbayEntities>(id: K, patch: Partial<PinbayEntities[K]>) => {
      setEntities(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );
  return {entities, update, setEntities};
}

/**
 * Container-width hook (grid-feeder-console pattern) — the desktop stage is
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

/**
 * Large-title collapse (Find): the compact navBar title fades in once the
 * 28px large title has scrolled under the sticky navBar. User-scroll
 * driven (IntersectionObserver sentinel) — deterministic, no timers.
 */
function useCompactTitle(sentinelRef: RefObject<HTMLDivElement | null>, active: boolean): boolean {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!active || sentinel == null) {
      setCompact(false);
      return undefined;
    }
    // −52px top margin accounts for the sticky navBar's own height.
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry != null) {
          setCompact(!entry.isIntersecting);
        }
      },
      {rootMargin: '-52px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef, active]);
  return compact;
}

// Focus trap — sheets/actionSheet trap Tab while open (per foundations;
// no portals, the overlays live inside shell).
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

// Location helpers — one source for every 'P3' / 'Blue zone' / 'C-11'.
function spotShort(pin: ActivePin): string {
  if (pin.context === 'garage') return pin.level;
  if (pin.context === 'street') return pin.zone;
  return pin.stall;
}

function spotLong(pin: ActivePin): string {
  if (pin.context === 'garage') return `Level ${pin.level} · Pillar ${pin.pillar}`;
  if (pin.context === 'street') return `${pin.zone} · 2h max`;
  return `Stall ${pin.stall} · ${pin.placeName}`;
}

function fmtHours(totalMin: number): string {
  return `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 28×28 Pinbay 'P' whose bowl is detached as a map-pin
// teardrop falling below-right, leaving a notched counter in the letterform.
// Two paths: P-stem + notched-bowl outline in BRAND_ACCENT; teardrop filled
// BRAND_ACCENT with a 4px (r=2) BRAND_FILL_TEXT dot.
// ---------------------------------------------------------------------------

function PinbayMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        {/* P stem + bowl outline, bowl notched at its lower-right where the
            teardrop detached. */}
        <path
          d="M7 25V4h9a7 7 0 0 1 7 7 7 7 0 0 1-5.2 6.77"
          stroke={BRAND_ACCENT}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M7 15h6.5" stroke={BRAND_ACCENT} strokeWidth={3} strokeLinecap="round" />
        {/* Detached bowl as a map-pin teardrop, falling below-right. */}
        <path
          d="M20.5 27c-2.3-2.7-4.3-4.9-4.3-6.9a4.3 4.3 0 1 1 8.6 0c0 2-2 4.2-4.3 6.9Z"
          fill={BRAND_ACCENT}
        />
        <circle cx={20.5} cy={19.9} r={2} fill={BRAND_FILL_TEXT} />
      </svg>
    </span>
  );
}

// Small teardrop used inside the canvases (the mark's dropped bowl).
function PinGlyph({x, y, size, settleKey}: {x: number; y: number; size: number; settleKey: number}) {
  const s = size / 24;
  return (
    <g key={settleKey} className="pby-settle" transform={`translate(${x - size / 2} ${y - size})`}>
      <path
        d={`M${12 * s} ${23 * s}C${8 * s} ${17.4 * s} ${2.4 * s} ${13 * s} ${2.4 * s} ${9.6 * s}a${9.6 * s} ${9.6 * s} 0 1 1 ${19.2 * s} 0c0 ${3.4 * s} ${-5.6 * s} ${7.8 * s} ${-9.6 * s} ${13.4 * s}Z`}
        fill={BRAND_ACCENT}
      />
      <circle cx={12 * s} cy={9.6 * s} r={2 * s} fill={BRAND_FILL_TEXT} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// GARAGE LEVEL STACK — SVG 326×320, fixed-height block (fanning causes ZERO
// layout shift). 5 isometric slabs (skewX rects, rx=6), a 14px elevator
// shaft at x=196 drawn above the slabs, a 36×20 car chip + 2 wheel dots on
// the pinned level, and the seated 24px teardrop. Transitions are
// transform/opacity only (240ms, .pby-anim), instant under reduced motion.
// The HTML P1–P5 rail (in the parent card) is the accessible interface;
// this SVG is role=img garnish.
// ---------------------------------------------------------------------------

interface GarageLevelStackProps {
  fanned: boolean;
  hoverLevel: string | null; // slab illuminated during the hold-drag
  pinLevel: string | null; // seated pin level (garage context only)
  ghostY: number | null; // ghost car chip Y in SVG coords while armed
  settleKey: number; // bumps on seat → settle animation re-runs
}

function GarageLevelStack({fanned, hoverLevel, pinLevel, ghostY, settleKey}: GarageLevelStackProps) {
  const shaftX = 196;
  const topYs = fanned ? FANNED_YS : COLLAPSED_YS;
  const shaftTop = topYs[0] - 4;
  const shaftBottom = topYs[4] + SLAB_DEPTH;
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      height={SVG_H}
      preserveAspectRatio="xMidYMid meet"
      style={styles.canvasSvgBlock}
      role="img"
      aria-label={`${GARAGE.name} cross-section, five levels${pinLevel != null ? `, car pinned on level ${pinLevel}` : ''}`}>
      {STACK_LEVELS.map((level, index) => {
        const collapsedY = COLLAPSED_YS[index];
        const dy = topYs[index] - collapsedY;
        const isHover = hoverLevel === level;
        const isPinned = pinLevel === level;
        const lift = isHover ? -2 : 0;
        return (
          <g
            key={level}
            className="pby-anim"
            style={{transform: `translateY(${dy + lift}px)`}}>
            <g transform={`translate(8 ${collapsedY})`}>
              {/* Slab: skewed rect, rx=6. Wash fill + SLAB_EDGE ≥3:1 stroke
                  (math at the declarations); illuminated pair on hover/pin. */}
              <g transform={`skewX(${SLAB_SKEW_DEG})`} style={{transformOrigin: `0px ${SLAB_DEPTH}px`}}>
                <rect
                  x={0}
                  y={0}
                  width={SLAB_W - 36}
                  height={SLAB_DEPTH}
                  rx={6}
                  fill={isHover || isPinned ? SLAB_FILL_LIT : SLAB_FILL}
                  stroke={SLAB_EDGE}
                  strokeWidth={isHover || isPinned ? 2 : 1}
                  className="pby-fade"
                />
              </g>
              {/* Level label in the slab's TOP sliver (the 22px band that
                  stays visible while collapsed — lower slabs paint over
                  the bottoms). SVG text uses --color-text-primary
                  (var(--color-text) does not exist). */}
              <text
                x={44}
                y={16}
                fontSize={11}
                fontWeight={600}
                fill="var(--color-text-primary)"
                style={{fontVariantNumeric: 'tabular-nums'}}>
                {level}
              </text>
              {/* Car chip (36×20 + wheel dots) + seated teardrop travel WITH
                  their slab. */}
              {isPinned ? (
                <g>
                  <rect x={96} y={14} width={36} height={20} rx={6} fill={SLAB_EDGE} />
                  <circle cx={104} cy={36} r={3.5} fill="var(--color-text-secondary)" />
                  <circle cx={124} cy={36} r={3.5} fill="var(--color-text-secondary)" />
                  <PinGlyph x={114} y={12} size={24} settleKey={settleKey} />
                </g>
              ) : null}
            </g>
          </g>
        );
      })}
      {/* Elevator core — 14px shaft threading the slabs at x=196, drawn
          ABOVE them; height follows the fan state (no transition: not a
          transform, so it snaps — legal, comment per contract). */}
      <rect
        x={shaftX}
        y={shaftTop}
        width={14}
        height={shaftBottom - shaftTop}
        rx={4}
        fill="none"
        stroke="var(--color-text-secondary)"
        strokeWidth={1.5}
      />
      {/* LIFT label only while collapsed — fanned shaftTop (4) would clip
          the text above the viewBox. */}
      {!fanned ? (
        <text
          x={shaftX + 7}
          y={shaftTop - 6}
          textAnchor="middle"
          fontSize={11}
          fontWeight={500}
          fill="var(--color-text-secondary)">
          LIFT
        </text>
      ) : null}
      {/* Ghost car chip at 50% opacity tracking pointer Y while armed. */}
      {ghostY != null ? (
        <g opacity={0.5}>
          <rect x={96 + 8} y={ghostY - 10} width={36} height={20} rx={6} fill={SLAB_EDGE} />
          <circle cx={112} cy={ghostY + 12} r={3.5} fill="var(--color-text-secondary)" />
          <circle cx={132} cy={ghostY + 12} r={3.5} fill="var(--color-text-secondary)" />
        </g>
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CURB STRIP (street context) — 326×160; 6 zones × 54 = 324 + 2×1 end caps
// = 326 ✓. Zone fills are meaningful rest fills with explicit ≥3:1 pairs
// (ZONE_BLUE / ZONE_RED / RING_AMBER, math at the declarations).
// ---------------------------------------------------------------------------

function CurbStrip({pinned, settleKey}: {pinned: boolean; settleKey: number}) {
  const bandY = 58;
  const bandH = 44;
  return (
    <svg
      viewBox="0 0 326 160"
      width="100%"
      height={160}
      preserveAspectRatio="xMidYMid meet"
      style={styles.canvasSvgBlock}
      role="img"
      aria-label={`5th & Marsh curb, six zones${pinned ? ', car pinned in the Blue 2h zone' : ''}`}>
      {/* Sidewalk edge + roadway — passive separators (hairline legal). */}
      <line x1={0} y1={bandY - 8} x2={326} y2={bandY - 8} stroke="var(--color-border)" />
      <line x1={0} y1={bandY + bandH + 8} x2={326} y2={bandY + bandH + 8} stroke="var(--color-border)" />
      {CURB_ZONES.map((zone, index) => {
        const x = 1 + index * 54;
        const fill = zone.kind === 'blue' ? ZONE_BLUE : zone.kind === 'red' ? ZONE_RED : RING_AMBER;
        return (
          <g key={zone.id}>
            <rect x={x} y={bandY} width={54 - 1} height={bandH} rx={4} fill={fill} opacity={0.9} />
            <text
              x={x + 26}
              y={bandY + bandH + 26}
              textAnchor="middle"
              fontSize={11}
              fontWeight={500}
              fill="var(--color-text-secondary)">
              {zone.label}
            </text>
          </g>
        );
      })}
      {pinned ? (
        <PinGlyph
          x={1 + CURB_ZONES.findIndex(zone => zone.id === STREET_SEAT_ZONE) * 54 + 26}
          y={bandY - 4}
          size={24}
          settleKey={settleKey}
        />
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// LOT GRID (lot context) — 326-wide viewBox; 6 cols × 49 = 294 + 5×6 gaps =
// 324 + 1px border each side = 326 ✓; 4 bays × 64 = 256 + 3×6 = 274 tall.
// Columns A–F, bays 11–14 (C-11 = column C, bay 11); stalls rx=4.
// ---------------------------------------------------------------------------

function LotGrid({pinned, settleKey}: {pinned: boolean; settleKey: number}) {
  const gridH = 4 * 64 + 3 * 6 + 24; // stalls + gaps + column labels
  return (
    <svg
      viewBox={`0 0 326 ${gridH}`}
      width="100%"
      height={gridH}
      preserveAspectRatio="xMidYMid meet"
      style={styles.canvasSvgBlock}
      role="img"
      aria-label={`Rivergate Lot, 24 stalls in columns A to F${pinned ? ', car pinned at stall C-11' : ''}`}>
      {LOT_COLS.map((col, colIndex) => {
        const x = 1 + colIndex * (49 + 6);
        return (
          <g key={col}>
            <text
              x={x + 24.5}
              y={14}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="var(--color-text-secondary)">
              {col}
            </text>
            {LOT_BAYS.map((bay, bayIndex) => {
              const y = 24 + bayIndex * (64 + 6);
              const id = `${col}-${bay}`;
              const isSeat = id === LOT_SEAT_STALL;
              return (
                <g key={id}>
                  <rect
                    x={x}
                    y={y}
                    width={49}
                    height={64}
                    rx={4}
                    fill={isSeat && pinned ? SLAB_FILL_LIT : SLAB_FILL}
                    stroke={SLAB_EDGE}
                    strokeWidth={isSeat && pinned ? 2 : 1}
                  />
                  <text
                    x={x + 24.5}
                    y={y + 38}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={500}
                    fill="var(--color-text-secondary)"
                    style={{fontVariantNumeric: 'tabular-nums'}}>
                    {bay}
                  </text>
                  {isSeat && pinned ? <PinGlyph x={x + 24.5} y={y + 20} size={24} settleKey={settleKey} /> : null}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SPOT DECAY TIMER — 96×96 coin; two racing rings. Outer (meter, counts
// DOWN): dashoffset 276.46·(28/90) ≈ 86.01. Inner (freshness, races UP):
// dash segment 213.63·(28/240) ≈ 24.92. Track circles: --color-border
// (passive separators — legal). Static fixture values; role=img sentence.
// ---------------------------------------------------------------------------

function SpotDecayTimer({pin}: {pin: ActivePin}) {
  // INVARIANT: meterLeftMin + parkedAgoMin = meterTotalMin (62+28 = 90).
  const outerOffset = COIN_OUTER_C * (pin.parkedAgoMin / pin.meterTotalMin); // ≈ 86.01
  const innerDash = COIN_INNER_C * (pin.parkedAgoMin / 240); // ≈ 24.92 of 213.63
  return (
    <div
      style={styles.coinWrap}
      role="img"
      aria-label={`${pin.meterLeftMin} minutes left on meter, parked ${pin.parkedAgoMin} minutes ago`}>
      <svg width={96} height={96} viewBox="0 0 96 96" fill="none" aria-hidden>
        <circle cx={48} cy={48} r={COIN_OUTER_R} stroke="var(--color-border)" strokeWidth={6} />
        <circle cx={48} cy={48} r={COIN_INNER_R} stroke="var(--color-border)" strokeWidth={6} />
        {/* Outer: paid-until remaining 62/90, gap = elapsed 28/90. */}
        <circle
          cx={48}
          cy={48}
          r={COIN_OUTER_R}
          stroke={BRAND_ACCENT}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${COIN_OUTER_C.toFixed(2)}`}
          strokeDashoffset={outerOffset.toFixed(2)}
          transform="rotate(-90 48 48)"
        />
        {/* Inner: parked-since racing UP — 28 of the 240-min freshness
            window (amber pair, ≥3:1 math at the declaration). */}
        <circle
          cx={48}
          cy={48}
          r={COIN_INNER_R}
          stroke={RING_AMBER}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${innerDash.toFixed(2)} ${(COIN_INNER_C - innerDash).toFixed(2)}`}
          transform="rotate(-90 48 48)"
        />
      </svg>
      <div style={styles.coinCenter}>
        <div style={styles.coinCenterStack}>
          <span style={styles.coinBig}>{pin.meterLeftMin}m</span>
          <span style={styles.coinSub}>left</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PLACES GLYPH — 48px thumb holding a mini level-glyph SVG derived from the
// place's glyphLevels (id-derived, no photos; reuses the GARAGE geometry
// idea at chip scale).
// ---------------------------------------------------------------------------

function PlaceGlyph({levels}: {levels: number}) {
  const ys = Array.from({length: levels}, (_, i) => 34 - i * (18 / Math.max(levels - 1, 1)));
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" fill="none" aria-hidden>
      {ys.map((y, index) => (
        <g key={index} transform={`translate(6 ${y - 8}) skewX(-20)`}>
          <rect x={4} y={0} width={22} height={8} rx={2} fill={SLAB_FILL} stroke={SLAB_EDGE} strokeWidth={1} />
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TAB_ICONS = {
  find: MapPinIcon,
  drop: CirclePlusIcon,
  history: HistoryIcon,
  places: BookmarkIcon,
} as const;

const TAB_TITLES: Record<TabId, string> = {
  find: 'Find my car',
  drop: 'Drop',
  history: 'History',
  places: 'Places',
};

export default function MobileParkingSpotMemory() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const width = useElementWidth(wrapRef);
  const isDesktop = width >= 720;
  const isNarrow = width > 0 && width <= 352;

  const {entities, update, setEntities} = usePinbayState();
  const {parking, snapshot, ui} = entities;
  const pin = parking.pin;
  const cues = parking.cueOrder.map(id => CUE_BY_ID[id]);
  const walkCues = [...cues].reverse(); // pure derived render — ONE array
  // Walk-back step total derives live: 40+55 = 95, +35 = 130, +30 = 160,
  // +20 = 180 ✓ with the full fixture order.
  const walkSteps = cues.reduce((sum, cue) => sum + cue.steps, 0);
  const doneCount = parking.cuesDoneIds.length;

  // Aggregates derive live from rows (cross-checks in the fixture block):
  // completed 45+75+120+60 = 300 min = 5h 0m; sessions 4 + 1 pending = 5;
  // visits 12+7+3 = 22.
  const completedSessions = [...parking.extraSessions, ...HISTORY];
  const completedMin = completedSessions.reduce((sum, session) => sum + session.durMin, 0);
  const sessionCount = completedSessions.length + (pin != null ? 1 : 0);
  const allPlaces = [...PLACES, ...parking.extraPlaces];
  const visitsTotal = allPlaces.reduce((sum, place) => sum + place.visits, 0);

  const locked = ui.sheetOpen || ui.actionSheetOpen;

  // Toast plumbing — ONE polite region; a new mutation replaces the old
  // (its undo window simply ends). No auto-dismiss timers.
  const toastSeq = useRef(0);
  const makeToast = useCallback((text: string, undoable = false) => {
    toastSeq.current += 1;
    return {seq: toastSeq.current, text, undoable};
  }, []);

  // Any user action resolves pending History skeletons (deterministic:
  // skeletons never resolve on a timer).
  const settleUi = (prevUi: UiEntity): Partial<UiEntity> =>
    prevUi.historySkeleton ? {historySkeleton: false, updatedTab: 'history' as const} : {};

  // Transient interaction state (pointer deltas only — not mirrored data).
  const [holdArmed, setHoldArmed] = useState(false);
  const [hoverLevel, setHoverLevel] = useState<string | null>(null);
  const [ghostY, setGhostY] = useState<number | null>(null);
  const [settleKey, setSettleKey] = useState(0);
  const holdTimer = useRef<number | null>(null);
  const holdStart = useRef<{x: number; y: number} | null>(null);
  const holdConsumed = useRef(false);
  const garageSvgRef = useRef<HTMLDivElement | null>(null);
  const [dragVis, setDragVis] = useState<{id: string; dy: number} | null>(null);
  const dragRef = useRef<{id: string; startY: number; index: number; moved: boolean} | null>(null);

  // Focus management — overlays restore focus to their opener on EVERY
  // close path; opening focus uses {preventScroll:true} so the animating
  // sheet is not scroll-revealed inside the locked column.
  const openerRef = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const asCancelRef = useRef<HTMLButtonElement | null>(null);
  const tabBarRef = useRef<HTMLDivElement | null>(null);
  const largeTitleSentinelRef = useRef<HTMLDivElement | null>(null);
  const compactTitle = useCompactTitle(largeTitleSentinelRef, ui.activeTab === 'find');

  useEffect(() => {
    if (ui.sheetOpen) sheetCloseRef.current?.focus({preventScroll: true});
  }, [ui.sheetOpen]);
  useEffect(() => {
    // Destructive is never first focus — Cancel takes it.
    if (ui.actionSheetOpen) asCancelRef.current?.focus({preventScroll: true});
  }, [ui.actionSheetOpen]);

  // -------------------------------------------------------------------------
  // MUTATIONS — every one flows through the single owner; every one has an
  // observable consequence elsewhere (badge, pending row, captions, toast).
  // -------------------------------------------------------------------------

  const seatPin = (context: ParkContext, level?: string) => {
    setSettleKey(key => key + 1);
    setEntities(prev => {
      const nextPin: ActivePin = {
        ...ACTIVE_PIN,
        context,
        level: context === 'garage' && level != null ? level : ACTIVE_PIN.level,
        placeName: context === 'garage' ? GARAGE.name : context === 'street' ? '5th & Marsh curb' : 'Rivergate Lot',
      };
      const where =
        context === 'garage'
          ? `on ${nextPin.level}`
          : context === 'street'
            ? 'in the Blue zone'
            : `at stall ${nextPin.stall}`;
      // SEATING CASCADE (one write): Find flips empty→walk-back, timer
      // renders from pin fields, History gains the derived pending row,
      // the Find badge shows meterLeftMin, the toast announces.
      return {
        ...prev,
        parking: {...prev.parking, pin: nextPin, savedPlaceForPin: false},
        ui: {...prev.ui, ...settleUi(prev.ui), toast: makeToast(`Pin dropped ${where}`)},
      };
    });
  };

  const restoreSnapshot = () => {
    setEntities(prev => {
      if (prev.snapshot.parking == null) return prev;
      return {
        ...prev,
        parking: prev.snapshot.parking,
        snapshot: {parking: null},
        ui: {...prev.ui, ...settleUi(prev.ui), toast: makeToast('Restored')},
      };
    });
  };

  const closeActionSheet = (restoreFocus = true) => {
    update('ui', {actionSheetOpen: false});
    if (restoreFocus) openerRef.current?.focus({preventScroll: true});
  };

  // CLEAR PIN — undo-over-confirm: executes IMMEDIATELY (one-assignment
  // reversible), no confirm alert; Undo restores badge, pending row, and
  // cuesDone in one write.
  const clearPin = () => {
    setEntities(prev => ({
      ...prev,
      snapshot: {parking: prev.parking},
      parking: {...prev.parking, pin: null, cuesDoneIds: []},
      ui: {
        ...prev.ui,
        ...settleUi(prev.ui),
        actionSheetOpen: false,
        toast: makeToast('Pin cleared', true),
      },
    }));
    openerRef.current?.focus({preventScroll: true});
  };

  const moveToNextLevel = () => {
    setEntities(prev => {
      const current = prev.parking.pin;
      if (current == null) return prev;
      const levelIndex = GARAGE.levels.indexOf(current.level as (typeof GARAGE.levels)[number]);
      const nextLevel = GARAGE.levels[(levelIndex + 1) % GARAGE.levels.length];
      // Re-seat demonstrates the SpotDecayTimer re-render — rings recompute
      // from the pin consts (dashoffset math beside the component).
      return {
        ...prev,
        parking: {
          ...prev.parking,
          pin: {...current, context: 'garage', level: nextLevel, placeName: GARAGE.name},
        },
        ui: {...prev.ui, ...settleUi(prev.ui), actionSheetOpen: false, toast: makeToast(`Pin moved to ${nextLevel}`)},
      };
    });
    setSettleKey(key => key + 1);
    openerRef.current?.focus({preventScroll: true});
  };

  const saveAsPlace = () => {
    setEntities(prev => {
      const current = prev.parking.pin;
      if (current == null) return prev;
      if (prev.parking.savedPlaceForPin) {
        return {
          ...prev,
          ui: {...prev.ui, ...settleUi(prev.ui), actionSheetOpen: false, toast: makeToast('Already in Places')},
        };
      }
      const place: Place = {
        id: 'plc_pin',
        name: `${current.placeName} · ${spotShort(current)}`,
        hint: 'Pinned today',
        visits: 1,
        glyphLevels: current.context === 'garage' ? 5 : current.context === 'lot' ? 3 : 1,
      };
      // Places caption re-derives: 12+7+3+1 = 23 visits saved.
      return {
        ...prev,
        parking: {...prev.parking, extraPlaces: [...prev.parking.extraPlaces, place], savedPlaceForPin: true},
        ui: {...prev.ui, ...settleUi(prev.ui), actionSheetOpen: false, toast: makeToast('Saved to Places')},
      };
    });
    openerRef.current?.focus({preventScroll: true});
  };

  const editCuesFromSheet = () => {
    update('ui', {
      actionSheetOpen: false,
      activeTab: 'drop',
      editingCues: true,
      selectedCueIds: [],
      toast: makeToast('Editing cues'),
    });
  };

  const toggleCueDone = (cueId: string) => {
    setEntities(prev => {
      const done = prev.parking.cuesDoneIds.includes(cueId)
        ? prev.parking.cuesDoneIds.filter(id => id !== cueId)
        : [...prev.parking.cuesDoneIds, cueId];
      return {...prev, parking: {...prev.parking, cuesDoneIds: done}, ui: {...prev.ui, ...settleUi(prev.ui)}};
    });
  };

  const closeSheet = () => {
    update('ui', {sheetOpen: false, sheetDetent: 'medium'});
    openerRef.current?.focus({preventScroll: true});
  };

  // 'I found it' — completes the session: the derived pending row becomes
  // a completed row (durMin 28 = parkedAgoMin), pin clears through the
  // SAME undo path, toast 'Trip saved' + Undo.
  const foundIt = () => {
    setEntities(prev => {
      const current = prev.parking.pin;
      if (current == null) return prev;
      const session: CompletedSession = {
        id: 'ses_e',
        place: current.placeName,
        spot: spotShort(current),
        durMin: current.parkedAgoMin,
        durLabel: `${current.parkedAgoMin}m`,
        when: 'Just now',
      };
      return {
        ...prev,
        snapshot: {parking: prev.parking},
        parking: {
          ...prev.parking,
          pin: null,
          cuesDoneIds: [],
          extraSessions: [session, ...prev.parking.extraSessions],
        },
        ui: {...prev.ui, ...settleUi(prev.ui), sheetOpen: false, sheetDetent: 'medium', toast: makeToast('Trip saved', true)},
      };
    });
    openerRef.current?.focus({preventScroll: true});
  };

  const moveCue = (cueId: string, direction: -1 | 1) => {
    setEntities(prev => {
      const order = [...prev.parking.cueOrder];
      const index = order.indexOf(cueId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= order.length) return prev;
      [order[index], order[target]] = [order[target], order[index]];
      return {
        ...prev,
        parking: {...prev.parking, cueOrder: order},
        ui: {...prev.ui, ...settleUi(prev.ui), toast: makeToast(`Cue moved to position ${target + 1}`)},
      };
    });
  };

  const toggleCueSelected = (cueId: string) => {
    update('ui', {
      selectedCueIds: ui.selectedCueIds.includes(cueId)
        ? ui.selectedCueIds.filter(id => id !== cueId)
        : [...ui.selectedCueIds, cueId],
    });
  };

  // Remove selected cues — reversible → execute + Undo and exit edit mode
  // (undoOverConfirm; destructive verb lives at the toolbar's LEADING end).
  const removeSelectedCues = () => {
    setEntities(prev => {
      const selected = prev.ui.selectedCueIds;
      if (selected.length === 0) return prev;
      return {
        ...prev,
        snapshot: {parking: prev.parking},
        parking: {
          ...prev.parking,
          cueOrder: prev.parking.cueOrder.filter(id => !selected.includes(id)),
          cuesDoneIds: prev.parking.cuesDoneIds.filter(id => !selected.includes(id)),
        },
        ui: {
          ...prev.ui,
          editingCues: false,
          selectedCueIds: [],
          toast: makeToast(`${selected.length} ${selected.length === 1 ? 'cue' : 'cues'} removed`, true),
        },
      };
    });
  };

  // ---- Refresh (pull-to-refresh is banned; explicit 44×44 buttons) ----

  const refreshDrop = () => {
    update('ui', {updatedTab: 'drop', toast: makeToast('Updated just now')});
  };

  // History refresh → 4 deterministic skeleton rows at exact 60px geometry,
  // resolved by the NEXT user action (never a timer); 'Loading' announces
  // once via the one polite region.
  const refreshHistory = () => {
    update('ui', {historySkeleton: true, updatedTab: null, toast: makeToast('Loading')});
  };

  // ---- Tabs — per-tab state law: scroll persists, segments/drafts
  // survive; open overlays close (toast persists); re-tap = scroll top ----

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

  const selectTab = (next: TabId) => {
    const scroller = findScroller();
    if (next === ui.activeTab) {
      // The one legal reset: re-tap active tab pops to root + scrolls top.
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    setEntities(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        ...settleUi(prev.ui),
        activeTab: next,
        sheetOpen: false,
        sheetDetent: 'medium',
        actionSheetOpen: false,
        scrollByTab: {...prev.ui.scrollByTab, [prev.ui.activeTab]: scroller?.scrollTop ?? 0},
      },
    }));
  };

  useEffect(() => {
    const scroller = findScroller();
    if (scroller != null) scroller.scrollTop = ui.scrollByTab[ui.activeTab] ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.activeTab]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TABS.map(tab => tab.id);
    const current = order.indexOf(ui.activeTab);
    const next =
      event.key === 'ArrowRight'
        ? order[(current + 1) % order.length]
        : order[(current + order.length - 1) % order.length];
    selectTab(next);
    tabBarRef.current?.querySelectorAll('button')[order.indexOf(next)]?.focus();
  };

  // ---- Segmented context (radiogroup + arrow keys; persists per-tab) ----

  const contexts: ParkContext[] = ['garage', 'street', 'lot'];
  const setContext = (context: ParkContext) => {
    setEntities(prev => ({...prev, ui: {...prev.ui, ...settleUi(prev.ui), context}}));
  };
  const onSegKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = contexts.indexOf(ui.context);
    const next =
      event.key === 'ArrowRight'
        ? contexts[(index + 1) % contexts.length]
        : contexts[(index + contexts.length - 1) % contexts.length];
    setContext(next);
    const buttons = event.currentTarget.querySelectorAll('button');
    buttons[contexts.indexOf(next)]?.focus();
  };

  // ---- Hold-to-drop (SIGNATURE) — 450ms hold arms the fan; pointer Y
  // seats; the P1–P5 rail is the button path; plain click/Enter seats the
  // caption's current target directly (keyboard parity). ----

  const defaultLevel = pin != null && pin.context === 'garage' ? pin.level : 'P3';

  const levelFromClientY = (clientY: number): {level: string | null; svgY: number | null} => {
    const host = garageSvgRef.current;
    if (host == null) return {level: null, svgY: null};
    const rect = host.getBoundingClientRect();
    const innerW = rect.width;
    const scale = Math.min(innerW / SVG_W, 1);
    const contentH = SVG_H * scale;
    const offsetY = (rect.height - contentH) / 2;
    const svgY = (clientY - rect.top - offsetY) / scale;
    for (let index = 0; index < STACK_LEVELS.length; index++) {
      const topY = FANNED_YS[index];
      if (svgY >= topY && svgY < topY + SLAB_DEPTH) {
        return {level: STACK_LEVELS[index], svgY};
      }
    }
    return {level: null, svgY};
  };

  const cancelHold = () => {
    if (holdTimer.current != null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    holdStart.current = null;
    setHoldArmed(false);
    setHoverLevel(null);
    setGhostY(null);
  };

  const onHoldPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    holdStart.current = {x: event.clientX, y: event.clientY};
    holdConsumed.current = false;
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      holdConsumed.current = true;
      // Garage: slabs fan (collapsed Ys → fanned Ys, 240ms transform).
      // Street/lot: armed hold seats the fixture zone/stall on release.
      setHoldArmed(true);
    }, 450);
  };

  const onHoldPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = holdStart.current;
    if (start == null) return;
    if (holdTimer.current != null) {
      // Cancel the arm on >8px movement before the 450ms fires.
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) cancelHold();
      return;
    }
    if (!holdArmed || ui.context !== 'garage') return;
    const {level, svgY} = levelFromClientY(event.clientY);
    setHoverLevel(level);
    setGhostY(svgY == null ? null : Math.max(18, Math.min(302, svgY)));
  };

  const onHoldPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const wasArmed = holdArmed;
    const armedLevel = hoverLevel;
    if (holdTimer.current != null) {
      // Released before 450ms — treat as a plain tap (click handler runs).
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
      holdStart.current = null;
      return;
    }
    cancelHold();
    if (!wasArmed) return;
    event.preventDefault();
    if (ui.context === 'garage') {
      if (armedLevel != null) seatPin('garage', armedLevel);
      // pointerup outside any band: fan collapses, nothing seats.
    } else {
      seatPin(ui.context);
    }
  };

  const onHoldClick = () => {
    if (holdConsumed.current) {
      holdConsumed.current = false;
      return;
    }
    // Keyboard/tap path: seats the caption's current target directly.
    if (ui.context === 'garage') seatPin('garage', defaultLevel);
    else seatPin(ui.context);
  };

  // ---- Grip drag-to-reorder (park mode) — visible 44×44 handle; rows
  // swap on a 30px crossing; Edit-mode chevrons are the button path. ----

  const onGripPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, cueId: string) => {
    if (!event.isPrimary || ui.editingCues) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {id: cueId, startY: event.clientY, index: parking.cueOrder.indexOf(cueId), moved: false};
    setDragVis({id: cueId, dy: 0});
  };

  const onGripPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag == null) return;
    let dy = event.clientY - drag.startY;
    // Swap on 30px crossing; each swap re-bases by the 60px row height.
    // Functional update — never reads a possibly-stale render closure.
    const swaps: Array<-1 | 1> = [];
    while (dy > 30 && drag.index < parking.cueOrder.length - 1) {
      swaps.push(1);
      drag.index += 1;
      drag.startY += 60;
      drag.moved = true;
      dy -= 60;
    }
    while (dy < -30 && drag.index > 0) {
      swaps.push(-1);
      drag.index -= 1;
      drag.startY -= 60;
      drag.moved = true;
      dy += 60;
    }
    if (swaps.length > 0) {
      setEntities(prev => {
        const order = [...prev.parking.cueOrder];
        let index = order.indexOf(drag.id);
        for (const dir of swaps) {
          const target = index + dir;
          if (target < 0 || target >= order.length) break;
          [order[index], order[target]] = [order[target], order[index]];
          index = target;
        }
        return {...prev, parking: {...prev.parking, cueOrder: order}};
      });
    }
    setDragVis({id: drag.id, dy});
  };

  const onGripPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragVis(null);
    if (drag != null && drag.moved) {
      update('ui', {toast: makeToast(`Cue moved to position ${drag.index + 1}`)});
    }
  };

  // -------------------------------------------------------------------------
  // RENDER PIECES
  // -------------------------------------------------------------------------

  const renderNavBar = () => {
    const editing = ui.editingCues;
    const selectedCount = ui.selectedCueIds.length;
    return (
      <header style={styles.navBar}>
        <div style={styles.navLeading}>
          {editing ? (
            <button
              type="button"
              className="pby-btn pby-focusable"
              style={styles.textBtn}
              onClick={() => update('ui', {editingCues: false, selectedCueIds: []})}>
              Cancel
            </button>
          ) : (
            <PinbayMark />
          )}
        </div>
        {editing ? (
          // Edit-mode count title — the ONE sanctioned aria-live exception
          // outside the toastDock.
          <p style={styles.navTitle} aria-live="polite">
            {selectedCount === 0 ? 'Select Cues' : `${selectedCount} Selected`}
          </p>
        ) : ui.activeTab === 'find' ? (
          // Compact title fades in once the large title scrolls under.
          <p
            style={{...styles.navTitle, opacity: compactTitle ? 1 : 0, transition: 'opacity 240ms ease'}}
            aria-hidden={!compactTitle}>
            {TAB_TITLES.find}
          </p>
        ) : (
          <h1 style={styles.navTitle}>{TAB_TITLES[ui.activeTab]}</h1>
        )}
        <div style={styles.navTrailing}>
          {editing ? (
            <button
              type="button"
              className="pby-btn pby-focusable"
              style={{...styles.textBtn, ...styles.textBtnStrong}}
              onClick={() => update('ui', {editingCues: false, selectedCueIds: []})}>
              Done
            </button>
          ) : ui.activeTab === 'drop' ? (
            <>
              <button
                type="button"
                className="pby-btn pby-focusable"
                style={styles.textBtn}
                onClick={() => update('ui', {editingCues: true, selectedCueIds: []})}>
                Edit
              </button>
              <button
                type="button"
                className="pby-btn pby-focusable"
                style={styles.iconBtn}
                aria-label="Refresh"
                onClick={refreshDrop}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            </>
          ) : ui.activeTab === 'history' ? (
            <button
              type="button"
              className="pby-btn pby-focusable"
              style={styles.iconBtn}
              aria-label="Refresh history"
              onClick={refreshHistory}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          ) : null}
        </div>
      </header>
    );
  };

  const renderParkRow = (cue: Cue, index: number, isLast: boolean) => {
    const editing = ui.editingCues;
    const selected = ui.selectedCueIds.includes(cue.id);
    const dragDy = dragVis != null && dragVis.id === cue.id ? dragVis.dy : null;
    return (
      <div key={cue.id}>
        <div
          style={{
            ...styles.cueRow,
            ...(dragDy != null ? styles.cueRowDragging : null),
            transform: dragDy != null ? `translateY(${dragDy}px)` : undefined,
          }}>
          {editing ? (
            <button
              type="button"
              role="checkbox"
              aria-checked={selected}
              aria-label={cue.label}
              className="pby-btn pby-focusable"
              style={{display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, height: '100%'}}
              onClick={() => toggleCueSelected(cue.id)}>
              <span style={{...styles.selectionCircle, ...(selected ? styles.selectionCircleOn : null)}} aria-hidden>
                {selected ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
              </span>
              <span style={styles.stepDisc} aria-hidden>
                {index + 1}
              </span>
              <span style={styles.cueText}>
                <span style={styles.cueLabel}>{cue.label}</span>
                <span style={styles.cueMeta}>{cue.steps} steps</span>
              </span>
            </button>
          ) : (
            <>
              <span style={styles.stepDisc} aria-hidden>
                {index + 1}
              </span>
              <span style={styles.cueText}>
                <span style={styles.cueLabel}>{cue.label}</span>
                <span style={styles.cueMeta}>{cue.steps} steps</span>
              </span>
            </>
          )}
          {editing ? (
            <>
              <button
                type="button"
                className="pby-btn pby-focusable"
                style={styles.chevBtn}
                aria-label={`Move ${cue.label} up`}
                disabled={index === 0}
                onClick={() => moveCue(cue.id, -1)}>
                <Icon icon={ChevronUpIcon} size="md" color="inherit" />
              </button>
              <button
                type="button"
                className="pby-btn pby-focusable"
                style={styles.chevBtn}
                aria-label={`Move ${cue.label} down`}
                disabled={index === cues.length - 1}
                onClick={() => moveCue(cue.id, 1)}>
                <Icon icon={ChevronDownIcon} size="md" color="inherit" />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="pby-btn pby-focusable"
              style={styles.gripBtn}
              aria-label={`Reorder ${cue.label} — drag, or use Edit mode for buttons`}
              onPointerDown={event => onGripPointerDown(event, cue.id)}
              onPointerMove={onGripPointerMove}
              onPointerUp={onGripPointerUp}
              onPointerCancel={onGripPointerUp}>
              <Icon icon={GripVerticalIcon} size="md" color="inherit" />
            </button>
          )}
        </div>
        {!isLast ? <div style={styles.rowDivider} /> : null}
      </div>
    );
  };

  const renderWalkRow = (cue: Cue, index: number, isLast: boolean) => {
    const done = parking.cuesDoneIds.includes(cue.id);
    return (
      <div key={cue.id}>
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={`${cue.label}, about ${cue.steps} steps`}
          className="pby-btn pby-focusable"
          style={styles.cueRow}
          onClick={() => toggleCueDone(cue.id)}>
          <span style={{...styles.selectionCircle, ...(done ? styles.selectionCircleOn : null)}} aria-hidden>
            {done ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
          </span>
          <span style={styles.stepDisc} aria-hidden>
            {index + 1}
          </span>
          <span style={styles.cueText}>
            <span style={{...styles.cueLabel, ...(done ? {color: 'var(--color-text-secondary)', textDecoration: 'line-through'} : null)}}>
              {cue.label}
            </span>
            <span style={styles.cueMeta}>about {cue.steps} steps</span>
          </span>
        </button>
        {!isLast ? <div style={styles.rowDivider} /> : null}
      </div>
    );
  };

  const renderFindTab = () => (
    <>
      <div ref={largeTitleSentinelRef} aria-hidden />
      <div style={styles.largeTitleRow}>
        <h1 style={styles.largeTitle}>Find my car</h1>
      </div>
      {pin == null ? (
        // TRUE-EMPTY — one action only (36px secondary; Drop owns creation).
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={MapPinOffIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.emptyTitle}>No pin dropped</h2>
          <p style={styles.emptyBody}>Drop a pin when you park and your walk-back appears here.</p>
          <button
            type="button"
            className="pby-btn pby-focusable"
            style={styles.secondaryBtn}
            onClick={() => selectTab('drop')}>
            Go to Drop
          </button>
        </div>
      ) : (
        <>
          <div style={styles.walkCard}>
            <div style={styles.coinRow}>
              <SpotDecayTimer pin={pin} />
              <div style={styles.statStack}>
                <span style={styles.statBig}>{pin.meterLeftMin}m on meter</span>
                <span style={styles.statSub}>
                  Parked {pin.parkedAgoMin}m ago · {spotShort(pin)}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="pby-btn pby-focusable"
              style={styles.primaryBtn}
              onClick={event => {
                openerRef.current = event.currentTarget;
                update('ui', {sheetOpen: true, sheetDetent: 'medium', actionSheetOpen: false});
              }}>
              Start walk-back
            </button>
          </div>
          <h2 style={styles.sectionHeader}>Walk-back · about {walkSteps} steps</h2>
          <div style={styles.listCard}>
            {walkCues.map((cue, index) => renderWalkRow(cue, index, index === walkCues.length - 1))}
          </div>
          <p style={styles.walkProgress}>
            {doneCount} of {walkCues.length} cues passed
          </p>
          <div style={{...styles.listCard, marginTop: 12}}>
            <button
              type="button"
              className="pby-btn pby-focusable"
              style={styles.utilityRow}
              onClick={event => {
                openerRef.current = event.currentTarget;
                update('ui', {actionSheetOpen: true, sheetOpen: false});
              }}>
              <span style={styles.utilityRowLabel}>Pin options</span>
              <span style={styles.utilityRowGlyph} aria-hidden>
                <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
              </span>
            </button>
          </div>
        </>
      )}
    </>
  );

  const renderDropTab = () => {
    const captionLabel =
      ui.context === 'garage'
        ? `Level ${defaultLevel} · Pillar ${ACTIVE_PIN.pillar}`
        : ui.context === 'street'
          ? 'Blue zone · 2h max'
          : `Stall ${LOT_SEAT_STALL} · Rivergate Lot`;
    return (
      <>
        {/* Segmented context row — 52px, in flow, same blur surface. */}
        <div style={styles.segmentedRow}>
          <div role="radiogroup" aria-label="Parking context" style={styles.segTrack} onKeyDown={onSegKeyDown}>
            {contexts.map(context => {
              const on = ui.context === context;
              const label = context === 'garage' ? 'Garage' : context === 'street' ? 'Street' : 'Lot';
              return (
                <button
                  key={context}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  className="pby-btn pby-focusable"
                  style={{...styles.segBtn, ...(on ? styles.segBtnOn : null)}}
                  onClick={() => setContext(context)}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        {ui.updatedTab === 'drop' ? <p style={styles.updatedCaption}>Updated just now</p> : null}
        <div style={styles.canvasCard}>
          {ui.context === 'garage' ? (
            <>
              <div ref={garageSvgRef} style={isNarrow ? styles.canvasSvgBlockNarrow : undefined}>
                <GarageLevelStack
                  fanned={holdArmed}
                  hoverLevel={hoverLevel}
                  pinLevel={pin != null && pin.context === 'garage' ? pin.level : null}
                  ghostY={holdArmed ? ghostY : null}
                  settleKey={settleKey}
                />
              </div>
              {/* Level-picker rail — the mandatory button path (5×44 +
                  4×8 = 252; HTML-absolute so hits never scale). */}
              <div style={styles.levelRail}>
                {STACK_LEVELS.map(level => {
                  const on = pin != null && pin.context === 'garage' && pin.level === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      className="pby-btn pby-focusable"
                      aria-pressed={on}
                      aria-label={`Park on level ${level}`}
                      style={{...styles.railBtn, ...(on ? styles.railBtnOn : null)}}
                      onClick={() => seatPin('garage', level)}>
                      {level}
                    </button>
                  );
                })}
              </div>
            </>
          ) : ui.context === 'street' ? (
            <CurbStrip pinned={pin != null && pin.context === 'street'} settleKey={settleKey} />
          ) : (
            <LotGrid pinned={pin != null && pin.context === 'lot'} settleKey={settleKey} />
          )}
          <div style={styles.canvasCaption}>
            <span>{captionLabel}</span>
            {ui.context !== 'garage' ? (
              <button
                type="button"
                className="pby-btn pby-focusable"
                style={styles.secondaryBtn}
                onClick={() => seatPin(ui.context)}>
                {ui.context === 'street' ? 'Seat in Blue zone' : `Seat at ${LOT_SEAT_STALL}`}
              </button>
            ) : null}
          </div>
        </div>
        <h2 style={styles.sectionHeader}>Memory cues</h2>
        <div style={styles.listCard}>
          {cues.map((cue, index) => renderParkRow(cue, index, index === cues.length - 1))}
        </div>
      </>
    );
  };

  const renderHistoryTab = () => (
    <>
      {ui.updatedTab === 'history' && !ui.historySkeleton ? (
        <p style={styles.updatedCaption}>Updated just now</p>
      ) : null}
      {/* 45+75+120+60 = 300 min = 5h 0m across the 4 fixture sessions ✓. */}
      <div style={styles.historyStatRow}>
        {fmtHours(completedMin)} parked across {completedSessions.length} completed{' '}
        {completedSessions.length === 1 ? 'session' : 'sessions'}
      </div>
      <div style={styles.listCard} aria-busy={ui.historySkeleton || undefined}>
        {ui.historySkeleton ? (
          SKELETON_WIDTHS.map((widths, index) => (
            <div key={index}>
              <div style={styles.skelRow} aria-hidden>
                <div style={{...styles.skelBar, width: widths.primary}} />
                <div style={{...styles.skelBar, width: widths.secondary}} />
                <div style={styles.skelSweep} className="pby-shimmer" />
              </div>
              {index < SKELETON_WIDTHS.length - 1 ? <div style={styles.rowDivider} /> : null}
            </div>
          ))
        ) : (
          <>
            {pin != null ? (
              <>
                {/* Pending row — DERIVED from the pin, never duplicated. */}
                <div style={styles.twoLineRow}>
                  <div style={styles.twoLineText}>
                    <span style={styles.twoLinePrimary}>In progress — {spotShort(pin)}</span>
                    <span style={styles.twoLineSecondary}>
                      Meter {pin.meterLeftMin}m left · parked {pin.parkedAgoMin}m ago
                    </span>
                  </div>
                  <span style={styles.pendingDot} aria-hidden />
                </div>
                <div style={styles.rowDivider} />
              </>
            ) : null}
            {completedSessions.map((session, index) => (
              <div key={session.id}>
                <div style={styles.twoLineRow}>
                  <div style={styles.twoLineText}>
                    <span style={styles.twoLinePrimary}>
                      {session.place} — {session.spot}
                    </span>
                    <span style={styles.twoLineSecondary}>{session.when}</span>
                  </div>
                  <span style={styles.trailingMeta}>{session.durLabel}</span>
                </div>
                {index < completedSessions.length - 1 ? <div style={styles.rowDivider} /> : null}
              </div>
            ))}
          </>
        )}
      </div>
      {/* Terminal count caption — list exhausted, no loadMoreRow. 4
          completed + 1 pending = 5 ✓ (re-derives after clear/complete). */}
      {!ui.historySkeleton ? (
        <p style={styles.terminalCaption}>
          All {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
        </p>
      ) : null}
    </>
  );

  const renderPlacesTab = () => (
    <>
      <div style={{height: 12}} />
      <div style={styles.listCard}>
        {allPlaces.map((place, index) => (
          <div key={place.id}>
            <button
              type="button"
              className="pby-btn pby-focusable"
              style={styles.placeRow}
              aria-label={`${place.name}, ${place.hint}`}
              onClick={() => {
                const context: ParkContext =
                  place.id === 'plc_work' ? 'street' : place.id === 'plc_air' ? 'lot' : 'garage';
                setEntities(prev => ({
                  ...prev,
                  ui: {
                    ...prev.ui,
                    ...settleUi(prev.ui),
                    context,
                    activeTab: 'drop',
                    toast: makeToast(`Drop set to ${place.name}`),
                  },
                }));
              }}>
              <span style={styles.placeThumb} aria-hidden>
                <PlaceGlyph levels={place.glyphLevels} />
              </span>
              <span style={styles.twoLineText}>
                <span style={styles.twoLinePrimary}>{place.name}</span>
                <span style={styles.twoLineSecondary}>{place.hint}</span>
              </span>
              <span style={styles.trailingMeta}>{place.visits} visits</span>
            </button>
            {index < allPlaces.length - 1 ? <div style={styles.rowDividerDeep} /> : null}
          </div>
        ))}
      </div>
      {/* 12+7+3 = 22 ✓ (re-derives to 23 after 'Save as Place'). */}
      <p style={styles.terminalCaption}>{visitsTotal} visits saved</p>
    </>
  );

  // -------------------------------------------------------------------------
  // SHELL
  // -------------------------------------------------------------------------

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{PINBAY_CSS}</style>
      <div
        style={{
          ...styles.shell,
          ...(locked ? styles.shellLocked : null),
          ...(isDesktop ? styles.shellDesktop : null),
        }}>
        {renderNavBar()}

        <main style={styles.main}>
          {ui.activeTab === 'find'
            ? renderFindTab()
            : ui.activeTab === 'drop'
              ? renderDropTab()
              : ui.activeTab === 'history'
                ? renderHistoryTab()
                : renderPlacesTab()}
        </main>

        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow (156 on
            Drop: 64 tabBar + 80 footer + 12), shell-absolute only while the
            shell is scroll-locked. */}
        <div
          role="status"
          aria-live="polite"
          style={
            locked
              ? {...styles.toastAnchor, ...styles.toastAnchorLocked}
              : ui.activeTab === 'drop' && !ui.editingCues
                ? {...styles.toastAnchor, ...styles.toastAnchorDrop}
                : styles.toastAnchor
          }>
          {ui.toast != null ? (
            <div style={styles.toast} key={ui.toast.seq}>
              <span style={styles.toastMsg}>{ui.toast.text}</span>
              {ui.toast.undoable && snapshot.parking != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="pby-btn pby-focusable" style={styles.toastUndo} onClick={restoreSnapshot}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* STICKY FOOTER (Drop) — primary verb in the bottom third; 48 +
            2×16 = 80px, stacked above the 64px tabBar. */}
        {ui.activeTab === 'drop' && !ui.editingCues ? (
          <div style={styles.stickyFooter}>
            <button
              type="button"
              className="pby-btn pby-focusable"
              style={styles.holdBtn}
              onPointerDown={onHoldPointerDown}
              onPointerMove={onHoldPointerMove}
              onPointerUp={onHoldPointerUp}
              onPointerCancel={cancelHold}
              onClick={onHoldClick}>
              Hold to drop pin
            </button>
          </div>
        ) : null}

        {/* TAB BAR / EDIT TOOLBAR — identical 64px geometry; the toolbar
            REPLACES the tabBar while editing (destructive at LEADING end). */}
        {ui.editingCues ? (
          <div style={styles.editToolbar}>
            <button
              type="button"
              className="pby-btn pby-focusable"
              style={{
                ...styles.toolbarBtn,
                ...(ui.selectedCueIds.length === 0 ? styles.toolbarDisabled : styles.toolbarDanger),
              }}
              disabled={ui.selectedCueIds.length === 0}
              onClick={removeSelectedCues}>
              Remove
            </button>
            <button
              type="button"
              className="pby-btn pby-focusable"
              style={{...styles.toolbarBtn, color: BRAND_ACCENT}}
              onClick={() =>
                update('ui', {
                  selectedCueIds:
                    ui.selectedCueIds.length === parking.cueOrder.length ? [] : [...parking.cueOrder],
                })
              }>
              {ui.selectedCueIds.length === parking.cueOrder.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        ) : (
          <div ref={tabBarRef} role="tablist" aria-label="Pinbay sections" style={styles.tabBar} onKeyDown={onTabKeyDown}>
            {TABS.map(tab => {
              const isActive = ui.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  className="pby-btn pby-focusable"
                  style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                  onClick={() => selectTab(tab.id)}>
                  <span style={styles.tabIconWrap}>
                    <Icon icon={TAB_ICONS[tab.id]} size="md" color="inherit" />
                    {tab.id === 'find' && pin != null ? (
                      // Badge = ACTIVE pin meterLeftMin — single source.
                      <span style={styles.tabBadge}>{pin.meterLeftMin}m</span>
                    ) : null}
                  </span>
                  <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* WALK-BACK SHEET — scrim z40, sheet z41; detents 55% /
            calc(100% − 56px) toggled by the grabber BUTTON; Escape/X/scrim
            close; sheet body is the one legal inner scroller. */}
        {ui.sheetOpen && pin != null ? (
          <>
            <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Walk-back"
              className="pby-sheet-in"
              style={{...styles.sheet, ...(ui.sheetDetent === 'large' ? styles.sheetLarge : styles.sheetMedium)}}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  closeSheet();
                  return;
                }
                trapTabKey(event, sheetRef.current);
              }}>
              <div style={styles.grabberZone}>
                <button
                  type="button"
                  className="pby-btn pby-focusable"
                  aria-label={`Resize sheet — now ${ui.sheetDetent}`}
                  style={{paddingInline: 22, paddingBlock: 8, borderRadius: 999}}
                  onClick={() =>
                    update('ui', {sheetDetent: ui.sheetDetent === 'medium' ? 'large' : 'medium'})
                  }>
                  <span style={styles.grabberPill} />
                </button>
              </div>
              <div style={styles.sheetHeader}>
                <span />
                <h2 style={styles.sheetTitle}>Walk-back</h2>
                <button
                  ref={sheetCloseRef}
                  type="button"
                  className="pby-btn pby-focusable"
                  style={styles.iconBtn}
                  aria-label="Close walk-back"
                  onClick={closeSheet}>
                  <Icon icon={XIcon} size="md" color="inherit" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                {/* 40+55 = 95, +35 = 130, +30 = 160, +20 = 180 steps ✓. */}
                <p style={styles.sheetStepsHeader}>
                  About {walkSteps} steps · {doneCount} of {walkCues.length} cues passed
                </p>
                <div style={{...styles.listCard, marginInline: 16}}>
                  {walkCues.map((cue, index) => renderWalkRow(cue, index, index === walkCues.length - 1))}
                </div>
              </div>
              <div style={styles.sheetFooter}>
                <button type="button" className="pby-btn pby-focusable" style={styles.primaryBtn} onClick={foundIt}>
                  I found it
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* PIN ACTION SHEET — flat verb list; context header; destructive
            LAST; separate Cancel card 8px below; Cancel takes first focus. */}
        {ui.actionSheetOpen && pin != null ? (
          <>
            <div style={styles.sheetScrim} onClick={() => closeActionSheet()} aria-hidden />
            <div
              ref={actionSheetRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Pin on ${spotLong(pin)}`}
              className="pby-sheet-in"
              style={styles.actionSheetWrap}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  closeActionSheet();
                  return;
                }
                trapTabKey(event, actionSheetRef.current);
              }}>
              <div style={styles.asCard}>
                <p style={styles.asHeader}>Pin on {spotLong(pin)}</p>
                <div style={styles.asDivider} />
                <button type="button" className="pby-btn pby-focusable" style={styles.asRow} onClick={editCuesFromSheet}>
                  Edit cues
                </button>
                <div style={styles.asDivider} />
                <button type="button" className="pby-btn pby-focusable" style={styles.asRow} onClick={moveToNextLevel}>
                  Move to another level
                </button>
                <div style={styles.asDivider} />
                <button type="button" className="pby-btn pby-focusable" style={styles.asRow} onClick={saveAsPlace}>
                  Save as Place
                </button>
                <div style={styles.asDivider} />
                <button
                  type="button"
                  className="pby-btn pby-focusable"
                  style={{...styles.asRow, ...styles.asRowDanger}}
                  onClick={clearPin}>
                  Clear pin
                </button>
              </div>
              <div style={{...styles.asCard, ...styles.asCancelCard}}>
                <button
                  ref={asCancelRef}
                  type="button"
                  className="pby-btn pby-focusable"
                  style={styles.asCancelRow}
                  onClick={() => closeActionSheet()}>
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
