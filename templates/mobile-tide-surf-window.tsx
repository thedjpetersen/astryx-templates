// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Ebbline surf-session planner for
 *   Cold Point, frozen at Sat, Jul 4: 17 hourly tide heights 05:00–21:00
 *   ([0.7,0.5,0.6,0.9,1.3,1.6,1.8,1.9,1.8,1.6,1.3,1.0,0.8,0.6,0.5,0.7,0.9] m),
 *   16 hourly swell-ft and wind-mph slots (wind flips offshore→onshore at
 *   11:00), first light 05:24 / last light 20:48, a 16-slot score table
 *   whose tide+wind+light triples each sum EXACTLY to their slot total
 *   (05:[28,35,12→75] … 20:[34,21,9→64]), 8 ranked spots with 16-length
 *   delta arrays authored so the three preset windows hit exact scores
 *   (Dawn 6–9 = 92, Midday 11–14 = 58, Golden 17–20 = 66), 4 crew members,
 *   and 1 seed saved session (Golden hour Thu · 66). No Date.now(), no
 *   Math.random(), no network media.
 * @output Ebbline — Tide Window: a 390px MOBILE surf-planner shell. The
 *   session window is a physical two-thumb bracket ON the tide curve:
 *   dragging either 44×44 slider handle (or the ±30 min steppers / preset
 *   chips — the mandatory button path) snaps to half-hour ticks and ONE
 *   sessionWindow value re-derives everything in render — the 0–100
 *   window score, the navBar WindowScoreRing (r=16, C=100.53), the shaded
 *   curve region (opacity deepens by score band 26/18/10%), the full-height
 *   highlight column through three stacked condition lanes (SWELL bars,
 *   WIND flip band, DAYLIGHT gradient), the footer 'Save window · 92'
 *   label, the 8-spot ranked list (translateY reorder, movement arrows vs
 *   the Dawn baseline, ±delta chips), the Spots tab ranking, and the invite
 *   sheet's prefill string 'Cold Point · Sat 6:00–9:00 AM · Window score
 *   92' — a single scoreForWindow() feeds all surfaces. Saves append to
 *   savedSessions (Windows tab badge counts them), deletes and sends are
 *   execute-with-Undo through the one sticky toast dock.
 * @position Page template; emitted by `astryx template mobile-tide-surf-window`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, anchored menus)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the invite sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The toast dock is
 *   STICKY-IN-FLOW (bottom 76 above the tabBar, +80 when the sticky
 *   footer is present) per the foundations amendment — shell-absolute
 *   pins to the document bottom on tall scrolling views.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 56 on spot rows because a
 *   32px rank block leads); no desktop Layout frames, no side asides.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Ebbline teal); sanctioned non-brand literals are the
 *   wind offshore/onshore band+text pairs, the daylight night/day pair,
 *   the movement-down red pair, and the low-band chip pair — each with
 *   contrast math at the declaration. Interactive boundaries (selection
 *   circles) and meaningful rest fills use explicit ≥3:1 pairs vs their
 *   ACTUAL surface, never hairline tokens.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON —
 *   choice noted per contract); tabBar 64px (3 tabs, 24px icon over
 *   11px/500 label, 4px gap); sticky footer 80px (48px brand button +
 *   16px padding); rows 44px utility / 60px two-line / 72px spot rows;
 *   row padding 16 inline; tideCard = gutter-inset listCard, 12px internal
 *   padding, 140px plot (120 curve + 20 hour-tick labels at
 *   05/08/11/14/17/20), 8px gap, 92px StackedConditionLanes (3×28 + 2×4),
 *   12px bottom pad → 264px card. Bracket handles: 20px knob (2px brand
 *   ring, card fill, 8px inner dot) in 44×44 hits. presetChips 44px row
 *   (32px visual chips in 44px hits, overflowX auto + scroll snap below
 *   ~332px content width); stepperRow 44px with two 96×32 steppers.
 *   WindowScoreRing 36px (r=16, strokeWidth 4, C = 2π·16 = 100.53;
 *   dashoffset = C·(1 − score/100), e.g. 92 → dash length 92.49) in a
 *   44×44 navBar button, 13px/700 digits. TYPE (Figtree): 22/700 section
 *   titles · 17/600 nav+sheet titles · 16/400 body · 13/400 meta ·
 *   11px/500 overlines/lane labels/tab labels; nothing under 11px;
 *   tabular-nums on every score, time, height, and delta.
 *
 * Responsive contract:
 * - Fluid 320–430px: NO width literals; plotWidth = measured cardWidth −
 *   24 via ResizeObserver (pxPerHour = plotWidth/16 → 20.875 at 390,
 *   16.5 at 320, 23.4 at 430); handle hits stay 44×44 at all widths (snap
 *   resolves by nearest half-hour tick). Preset rail: 'Dawn patrol' +
 *   'Midday' + 'Golden hour' ≈ 300px > 288 available at 320, so the rail
 *   is overflowX auto with x-proximity snap; all three rest visible ≥360.
 *   Spot name is the only flexible track (minWidth 0, ellipsis); rank
 *   block 32px and trailing chip stack 56px are fixed.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell is a centered
 *   phone column (maxWidth 430, marginInline auto, borderInline hairline).
 *   No adaptive relayout — the bracket-on-curve anatomy is phone geometry.
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  SearchXIcon,
  UsersIcon,
  WavesIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Ebbline teal). #0E7C86 on #FFFFFF = 5.0:1
// (passes 4.5:1 as text); #4FC8D2 on the dark body (~#1C1917) ≈ 8.0:1.
const BRAND_ACCENT = 'light-dark(#0E7C86, #4FC8D2)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #0E7C86 = 5.0:1. Dark:
// white on #4FC8D2 fails (~1.6:1) so the dark side flips to near-black
// teal — #06282C on #4FC8D2 ≈ 9.9:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #06282C)';
// Brand washes: 12% chip/pill tint; curve-region opacity encodes the score
// band — ≥80 → 26%, 50–79 → 18%, <50 → 10% (see regionFillFor).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Interactive control boundaries at rest (crew selection circles) — the
// hairline token is for passive separators ONLY (foundations amendment).
// #6E6B66 on the white card = 4.9:1; #A6A29B on the dark card ≈ 5.6:1 —
// both clear the 3:1 boundary floor with margin.
const CONTROL_BORDER = 'light-dark(#6E6B66, #A6A29B)';
// WIND lane bands. The band FILLS are decorative context (#B8E4E8 on the
// white card is only ~1.5:1) so per spec each band ALSO carries an 11px
// text label + arrow glyphs in the paired TEXT color that carry the
// meaning: #0F4C52 on #B8E4E8 ≈ 7.6:1; #BFEAEE on #134E54 ≈ 7.5:1;
// #6B3413 on #F6C9A8 ≈ 6.6:1; #FBDDC4 on #7A3E1D ≈ 6.9:1.
const WIND_OFF_BAND = 'light-dark(#B8E4E8, #134E54)';
const WIND_OFF_TEXT = 'light-dark(#0F4C52, #BFEAEE)';
const WIND_ON_BAND = 'light-dark(#F6C9A8, #7A3E1D)';
const WIND_ON_TEXT = 'light-dark(#6B3413, #FBDDC4)';
// DAYLIGHT lane: night caps and day core. Meaningful rest fills — the
// night cap must read against the day core at ≥3:1 INSIDE the lane:
// #3A4754 vs #FBE9BE ≈ 7.3:1 (light); #0E141A vs #8A6E2A ≈ 3.6:1 (dark).
// The lane label rides a card-backed chip so its text is 4.5:1 vs card.
const NIGHT_FILL = 'light-dark(#3A4754, #0E141A)';
const DAY_FILL = 'light-dark(#FBE9BE, #8A6E2A)';
// Movement-down / negative delta red (spec pair): #B5432A on #FFFFFF =
// 5.4:1; #F2A08D on the dark card (~#26221D) ≈ 7.9:1.
const MOVE_DOWN = 'light-dark(#B5432A, #F2A08D)';
// Low score-band chip fill + its text: #8A2E17 on #F7E1DA ≈ 6.5:1;
// #F2A08D on #46281F ≈ 5.6:1.
const LOW_CHIP_BG = 'light-dark(#F7E1DA, #46281F)';
const LOW_CHIP_TEXT = 'light-dark(#8A2E17, #F2A08D)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// darkness-refusal pulse, and the reduced-motion guard. Transitions animate
// transform/opacity only and collapse to instant under reduced motion.
// ---------------------------------------------------------------------------

const EBB_CSS = `
.ebb-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.ebb-btn:disabled { cursor: default; }
.ebb-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.ebb-anim { transition: transform 200ms ease, opacity 200ms ease; }
.ebb-fade { transition: opacity 200ms ease; }
@keyframes ebb-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.ebb-sheet-in { animation: ebb-sheet-in 200ms ease; }
@keyframes ebb-cap-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.35; }
  100% { opacity: 1; }
}
.ebb-cap-pulse { animation: ebb-cap-pulse 400ms ease; }
.ebb-vh {
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
  .ebb-anim, .ebb-fade { transition: none; }
  .ebb-sheet-in { animation: none; }
  .ebb-cap-pulse { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
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
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline ALWAYS ON.
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
    color: 'var(--color-text-primary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  bodyPad: {paddingTop: 12},
  // PRESET CHIPS — 44px rail; 32px visual chips inside 44px hits; the rail
  // scrolls with x-proximity snap when the three chips exceed the width
  // (they do at 320: ~300px of chips vs 288 available).
  presetRail: {
    display: 'flex',
    gap: 8,
    height: 44,
    alignItems: 'center',
    paddingInline: 16,
    overflowX: 'auto',
    scrollSnapType: 'x proximity',
    scrollPaddingInline: 16,
  },
  chipHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    borderRadius: 999,
  },
  chip: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  chipOn: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontWeight: 600,
  },
  // STEPPER ROW — 44px, two label+stepper clusters in a 2-col grid; labels
  // ellipsize before the fixed 96×32 steppers shrink.
  stepperRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    height: 44,
    alignItems: 'center',
    paddingInline: 16,
    marginTop: 8,
  },
  stepCluster: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  // Label stacks as an 11px overline over the 16px value so the VALUE
  // never truncates at 390; the overline ellipsizes first (320 law).
  stepValue: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 1,
    borderRadius: 8,
  },
  stepOverline: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stepTime: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stepper: {
    width: 96,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  stepHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepHalfDisabled: {opacity: 0.35},
  stepDivider: {width: 1, background: 'var(--color-border)'},
  // TIDE CARD — gutter-inset listCard, 12px internal padding; 140px plot
  // (120 curve + 20 tick labels) + 8 gap + 92px lanes + 12 pad = 264px.
  tideCard: {
    marginInline: 16,
    marginTop: 12,
    padding: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  plotWrap: {position: 'relative', width: '100%', height: 140},
  handleBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    touchAction: 'none',
    zIndex: 2,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 999,
    border: `2px solid ${BRAND_ACCENT}`,
    background: 'var(--color-background-card)',
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 1px 4px var(--color-shadow)',
  },
  knobDot: {width: 8, height: 8, borderRadius: 999, background: BRAND_ACCENT},
  // STACKED CONDITION LANES — 3 × 28px + 2 × 4px gaps = 92px; shared x
  // mapping with the curve (percent-of-16-hours positioning).
  laneStack: {
    position: 'relative',
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  lane: {
    position: 'relative',
    height: 28,
    borderRadius: 4,
    overflow: 'hidden',
    background: 'var(--color-background-muted)',
  },
  laneLabelChip: {
    position: 'absolute',
    top: 2,
    left: 2,
    zIndex: 2,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    padding: '1px 4px',
    borderRadius: 4,
    background: 'var(--color-background-card)',
    color: 'var(--color-text-secondary)',
    pointerEvents: 'none',
  },
  swellBar: {position: 'absolute', bottom: 0, background: BRAND_ACCENT, borderRadius: 1},
  windBand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingInline: 4,
    paddingBottom: 2,
  },
  windBandLabel: {fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap'},
  flipMarker: {position: 'absolute', top: 0, bottom: 0, width: 2, background: 'var(--color-text-primary)'},
  flipLabel: {
    position: 'absolute',
    bottom: 2,
    fontSize: 11,
    fontWeight: 500,
    padding: '0 4px',
    borderRadius: 4,
    background: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  // Active-window highlight column projected through all three lanes.
  windowColumn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 1,
    background: `color-mix(in srgb, ${BRAND_ACCENT} 10%, transparent)`,
    borderInline: `1px solid ${BRAND_ACCENT}`,
    pointerEvents: 'none',
  },
  // SECTION HEADER — 13/600 uppercase 0.06em at 32px, 20 top / 8 bottom.
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
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // SPOT ROWS — 72px, absolutely positioned by rank for the translateY
  // reorder; the container height derives from the visible count.
  spotList: {position: 'relative'},
  spotRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  rankBlock: {
    width: 32,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  rankNum: {fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  movement: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  spotText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  spotName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  spotMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipStack: {
    width: 56,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  scoreChip: {
    minWidth: 36,
    height: 24,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    paddingInline: 6,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  deltaChip: {fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  // Divider inset 56 on spot rows (32px rank block leads, not an avatar).
  spotRowDivider: {
    position: 'absolute',
    left: 56,
    right: 0,
    bottom: 0,
    height: 1,
    background: 'var(--color-border)',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
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
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SAVED WINDOWS — 60px two-line rows + trailing 44×44 ellipsis.
  savedRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: 60,
    paddingInlineStart: 16,
    gap: 12,
  },
  savedText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  savedPrimary: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  savedSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ellipsisBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    marginInlineEnd: 4,
  },
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    top: 52,
    zIndex: 30,
    minWidth: 200,
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
  menuCatcher: {position: 'absolute', inset: 0, zIndex: 25},
  // STICKY FOOTER — 80px (48 button + 16 padding), same blur surface.
  footer: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  footerBtn: {
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
  // TAB BAR — exactly 64px, 3 tabs flex:1.
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
  tabLabel: {fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // TOAST DOCK — STICKY-IN-FLOW (foundations amendment): height 0 anchor
  // that pins above the bottom chrome even mid-scroll; shell-absolute
  // would pin to the document bottom on tall tabs. Always mounted for
  // aria-live. bottom = 76 (64 tabBar + 12), +80 when the footer renders.
  toastAnchor: {
    position: 'sticky',
    zIndex: 30,
    height: 0,
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
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
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
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell; medium 55%,
  // large calc(100% − 56px).
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
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 8px'},
  prefillCard: {
    padding: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    marginBottom: 12,
  },
  prefillLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    display: 'block',
    marginBottom: 4,
  },
  crewRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 999,
    border: `2px solid ${CONTROL_BORDER}`,
    display: 'grid',
    placeItems: 'center',
  },
  selectionCircleOn: {
    border: `2px solid ${BRAND_ACCENT}`,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  crewAvatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 13,
    fontWeight: 700,
  },
  crewText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  crewName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  crewMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  sendBtnDisabled: {opacity: 0.4},
  // SEARCH — 52px bar under the navBar, 36px muted field.
  searchBar: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  searchField: {
    flex: 1,
    minWidth: 0,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 12,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    font: 'inherit',
    fontSize: 16,
    color: 'var(--color-text-primary)',
  },
  searchClear: {
    width: 44,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  searchCancel: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    fontSize: 17,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  recentRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInlineStart: 16,
  },
  recentText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  recentHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInlineEnd: 16,
  },
  clearRecentsBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // EMPTY STATE — filtered-empty (search), per emptyAndSkeleton.
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
  emptyTitle: {fontSize: 17, fontWeight: 600},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4},
  emptyAction: {
    marginTop: 16,
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic consts with identity ids; dual fields (ticks +
// labels); every aggregate cross-checks (math verified in comments).
// ---------------------------------------------------------------------------

// TIME MODEL: 16 hourly slots, slot index 0–15 = start hours 05..20; the
// plot spans 05:00–21:00 (16 h). Windows are half-hour ticks in HOURS
// ({start: 6.0, end: 9.0}). Clamps: start ≥ 5.5, end ≤ 20.5 (full-darkness
// refusal — first light 05:24, last light 20:48), 1 h ≤ span ≤ 6 h.
const PLOT_START_H = 5;
const PLOT_HOURS = 16;
const CLAMP_START = 5.5;
const CLAMP_END = 20.5;
const MIN_SPAN = 1;
const MAX_SPAN = 6;

// TIDE — 17 hourly heights (m), 05:00→21:00. Curve extremes (between
// samples): low 0.4 m @ 06:12, high 1.9 m @ 12:24, low 0.45 m @ 18:36 —
// annotated as labels on the curve at those x positions.
const TIDE_HEIGHTS = [0.7, 0.5, 0.6, 0.9, 1.3, 1.6, 1.8, 1.9, 1.8, 1.6, 1.3, 1.0, 0.8, 0.6, 0.5, 0.7, 0.9];

// SWELL ft per slot (05..20).
const SWELL_FT = [3.8, 3.9, 4.0, 4.1, 4.2, 4.4, 4.5, 4.6, 4.6, 4.5, 4.3, 4.2, 4.0, 3.9, 3.7, 3.5];

// WIND mph per slot; offshore ESE slots 0–5 (05:00–11:00), onshore SW
// slots 6–15 (the 11:00 flip).
const WIND_MPH = [3, 4, 4, 5, 6, 8, 12, 14, 15, 16, 14, 12, 10, 8, 6, 5];
const WIND_FLIP_SLOT = 6; // 11:00 = slot 6 boundary (6/16 = 37.5% of plot)

// DAYLIGHT: first light 05:24, sunrise 06:12, sunset 20:12, last light
// 20:48 → hard night caps at 0.4/16 = 2.5% and 15.8/16 = 98.75%.
const FIRST_LIGHT_PCT = (0.4 / 16) * 100; // 2.5
const LAST_LIGHT_PCT = (15.8 / 16) * 100; // 98.75

// SCORE MODEL — slotScore = tidePts(max 40) + windPts(max 35) +
// lightPts(max 25). EVERY triple sums to its slot total (verified by hand):
// 05:[28,35,12→75] 06:[30,35,23→88] 07:[34,33,25→92] 08:[38,33,25→96]
// 09:[40,29,25→94] 10:[38,25,25→88] 11:[34,5,25→64] 12:[30,3,25→58]
// 13:[24,3,25→52] 14:[20,3,25→48] 15:[18,7,25→50] 16:[20,9,25→54]
// 17:[24,11,25→60] 18:[28,13,25→66] 19:[32,17,23→72] 20:[34,21,9→64].
interface SlotScore {
  tide: number;
  wind: number;
  light: number;
  sum: number;
}
const SLOT_SCORES: SlotScore[] = [
  {tide: 28, wind: 35, light: 12, sum: 75},
  {tide: 30, wind: 35, light: 23, sum: 88},
  {tide: 34, wind: 33, light: 25, sum: 92},
  {tide: 38, wind: 33, light: 25, sum: 96},
  {tide: 40, wind: 29, light: 25, sum: 94},
  {tide: 38, wind: 25, light: 25, sum: 88},
  {tide: 34, wind: 5, light: 25, sum: 64},
  {tide: 30, wind: 3, light: 25, sum: 58},
  {tide: 24, wind: 3, light: 25, sum: 52},
  {tide: 20, wind: 3, light: 25, sum: 48},
  {tide: 18, wind: 7, light: 25, sum: 50},
  {tide: 20, wind: 9, light: 25, sum: 54},
  {tide: 24, wind: 11, light: 25, sum: 60},
  {tide: 28, wind: 13, light: 25, sum: 66},
  {tide: 32, wind: 17, light: 23, sum: 72},
  {tide: 34, wind: 21, light: 9, sum: 64},
];

// windowScore = round(Σ(slotScore × coverage) / Σcoverage), coverage ∈
// {0, 0.5, 1} per half-hour ticks. CROSS-CHECKS (all verified):
//   Dawn patrol 06:00–09:00 = (88+92+96)/3 = 276/3 = 92.
//   Midday 11:00–14:00 = (64+58+52)/3 = 174/3 = 58.
//   Golden hour 17:00–20:00 = (60+66+72)/3 = 198/3 = 66.
//   Half-tick 06:30–09:00 = (0.5·88+92+96)/2.5 = 232/2.5 = 92.8 → 93.
//   Stress 05:30–11:30 = (0.5·75+88+92+96+94+88+0.5·64)/6 = 527.5/6 → 88.
//   Single-slot 08:00–09:00 = 96/1 = 96. Midday shifted 12:00–15:00 =
//   (58+52+48)/3 = 158/3 = 52.67 → 53.
interface SessionWindow {
  start: number;
  end: number;
}

function slotCoverage(window: SessionWindow, slot: number): number {
  const slotStart = PLOT_START_H + slot;
  return Math.max(0, Math.min(window.end, slotStart + 1) - Math.max(window.start, slotStart));
}

function scoreForWindow(window: SessionWindow): number {
  let weighted = 0;
  let coverage = 0;
  for (let slot = 0; slot < 16; slot++) {
    const cov = slotCoverage(window, slot);
    weighted += SLOT_SCORES[slot].sum * cov;
    coverage += cov;
  }
  return coverage === 0 ? 0 : Math.round(weighted / coverage);
}

/** Coverage-weighted mean of any 16-length per-slot series. */
function windowMean(window: SessionWindow, series: number[]): number {
  let weighted = 0;
  let coverage = 0;
  for (let slot = 0; slot < 16; slot++) {
    const cov = slotCoverage(window, slot);
    weighted += series[slot] * cov;
    coverage += cov;
  }
  return coverage === 0 ? 0 : weighted / coverage;
}

// SPOTS — 8 fixtures. ferryflats's display name is the two-stage-ellipsis
// stress at 320px. sizeFactor scales the window's mean swell into the row
// meta '{wave}ft · {tideNote} · {type}'.
interface Spot {
  id: string;
  name: string;
  type: string;
  tideNote: string;
  sizeFactor: number;
}
const SPOTS: Spot[] = [
  {id: 'coldpoint', name: 'Cold Point', type: 'reef', tideNote: 'best low-mid', sizeFactor: 1.15},
  {id: 'milebeach', name: 'Mile Beach', type: 'beach', tideNote: 'all tides', sizeFactor: 0.9},
  {id: 'harborwedge', name: 'Harbor Wedge', type: 'jetty', tideNote: 'best mid', sizeFactor: 0.8},
  {id: 'splitrock', name: 'Split Rock', type: 'reef', tideNote: 'best mid-high', sizeFactor: 1.1},
  {id: 'ottercove', name: 'Otter Cove', type: 'point', tideNote: 'best high', sizeFactor: 1.0},
  {id: 'gullwing', name: 'Gullwing Bar', type: 'sandbar', tideNote: 'best low', sizeFactor: 0.7},
  {id: 'northslab', name: 'North Slab', type: 'slab', tideNote: 'best low', sizeFactor: 1.3},
  {id: 'ferryflats', name: 'Ferry Flats at Punta Espíritu', type: 'beach', tideNote: 'all tides', sizeFactor: 0.6},
];

// SPOT_DELTAS — 16-length arrays authored so each preset's three covered
// slots hold the spot's delta CONSTANT, hitting the exact preset table
// (dawn slots 1–3 / midday 6–8 / golden 12–14): coldpoint +2/+3/+6,
// milebeach −4/−9/−6, harborwedge −11/−3/−2, splitrock −15/+8/+4,
// ottercove −22/+14/+1, gullwing −30/−24/−28, northslab −34/−20/−30,
// ferryflats −41/−16/−34. Resulting scores — DAWN (base 92):
// 94,88,81,77,70,62,58,51 → ranks 1–8. MIDDAY (base 58): otter 72, split
// 66, cold 61, harbor 55, mile 49, ferry 42, north 38, gull 34; movement
// vs dawn ranks: +4,+2,−2,−1,−3,+2,0,−2 → net Σ = 0 ✓. GOLDEN (base 66):
// cold 72, split 70, otter 67, harbor 64, mile 60, gull 38, north 36,
// ferry 32.
const SPOT_DELTAS: Record<string, number[]> = {
  coldpoint: [0, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 5, 6, 6, 6, 5],
  milebeach: [-3, -4, -4, -4, -6, -8, -9, -9, -9, -8, -7, -6, -6, -6, -6, -5],
  harborwedge: [-12, -11, -11, -11, -8, -5, -3, -3, -3, -3, -2, -2, -2, -2, -2, -2],
  splitrock: [-16, -15, -15, -15, -6, 2, 8, 8, 8, 7, 6, 5, 4, 4, 4, 3],
  ottercove: [-24, -22, -22, -22, -8, 6, 14, 14, 14, 10, 6, 3, 1, 1, 1, 0],
  gullwing: [-31, -30, -30, -30, -27, -25, -24, -24, -24, -25, -26, -27, -28, -28, -28, -28],
  northslab: [-35, -34, -34, -34, -28, -23, -20, -20, -20, -23, -26, -28, -30, -30, -30, -31],
  ferryflats: [-42, -41, -41, -41, -30, -22, -16, -16, -16, -22, -27, -31, -34, -34, -34, -35],
};

/** Spot delta for a window = round(coverage-weighted mean of its 16 slot
 * deltas). deltaChip = this value; spotScore = windowScore + delta. */
function spotDeltaFor(spotId: string, window: SessionWindow): number {
  return Math.round(windowMean(window, SPOT_DELTAS[spotId]));
}

// PRESETS — the non-gesture path; chips set sessionWindow EXACTLY.
interface Preset {
  id: 'dawn' | 'midday' | 'golden';
  label: string;
  window: SessionWindow;
}
const PRESETS: Preset[] = [
  {id: 'dawn', label: 'Dawn patrol', window: {start: 6, end: 9}},
  {id: 'midday', label: 'Midday', window: {start: 11, end: 14}},
  {id: 'golden', label: 'Golden hour', window: {start: 17, end: 20}},
];

// DAWN BASELINE RANKS — movement glyphs compare the current rank against
// this fixed baseline (dawn scores 94,88,81,77,70,62,58,51 → ranks 1–8 in
// SPOTS order). Derived once at module scope from the same functions the
// UI uses, so the baseline can never drift from the fixtures.
const DAWN_WINDOW = PRESETS[0].window;
const DAWN_RANKS: Record<string, number> = (() => {
  const dawnBase = scoreForWindow(DAWN_WINDOW); // 92
  const ordered = [...SPOTS].sort(
    (a, b) => dawnBase + spotDeltaFor(b.id, DAWN_WINDOW) - (dawnBase + spotDeltaFor(a.id, DAWN_WINDOW)),
  );
  return Object.fromEntries(ordered.map((spot, index) => [spot.id, index + 1]));
})();

// CREW — 4 members, all unselected initially.
interface CrewMember {
  id: string;
  name: string;
  initials: string;
  meta: string;
}
const CREW: CrewMember[] = [
  {id: 'mara', name: 'Mara Voss', initials: 'MV', meta: 'Longboard · usually in by 6'},
  {id: 'jt', name: 'JT Okafor', initials: 'JO', meta: 'Shortboard · has the van'},
  {id: 'sana', name: 'Sana Reyes', initials: 'SR', meta: 'Mid-length · dawn only'},
  {id: 'pete', name: 'Pete Lindqvist', initials: 'PL', meta: 'Fish · brings coffee'},
];

// SAVED SESSIONS — seed: 1 saved window → Windows tab badge starts at 1.
interface SavedSession {
  id: string;
  label: string; // 'Thu 5:00–8:00 PM'
  spotName: string;
  score: number;
  note: string;
}
const SAVED_SEED: SavedSession[] = [
  {id: 'sv_thu_golden', label: 'Thu 5:00–8:00 PM', spotName: 'Cold Point', score: 66, note: 'Golden hour'},
];

// Search recents seed (Spots tab focused-empty state).
const RECENTS_SEED = ['reef', 'otter'];

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Tick in hours (6.5) → '6:30 AM'. */
function fmtTick(tick: number): string {
  const h24 = Math.floor(tick);
  const m = Math.round((tick - h24) * 60);
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Range with a single shared suffix when both ends match: '6:00–9:00 AM'. */
function fmtRange(window: SessionWindow): string {
  const startLabel = fmtTick(window.start);
  const endLabel = fmtTick(window.end);
  const startSuffix = startLabel.slice(-2);
  if (startSuffix === endLabel.slice(-2)) {
    return `${startLabel.slice(0, -3)}–${endLabel}`;
  }
  return `${startLabel} – ${endLabel}`;
}

/** THE prefill string — single source of truth, derived, never retyped:
 * 'Cold Point · Sat 6:00–9:00 AM · Window score 92'. */
function windowString(window: SessionWindow): string {
  return `Cold Point · Sat ${fmtRange(window)} · Window score ${scoreForWindow(window)}`;
}

/** Linear-interpolated tide height (m) at a fractional hour tick. */
function tideAt(tick: number): number {
  const x = Math.min(Math.max(tick - PLOT_START_H, 0), 16);
  const i = Math.min(Math.floor(x), 15);
  const frac = x - i;
  return TIDE_HEIGHTS[i] + (TIDE_HEIGHTS[i + 1] - TIDE_HEIGHTS[i]) * frac;
}

/** Score band → region fill opacity (26% / 18% / 10%) and chip tone. */
type ScoreBand = 'high' | 'mid' | 'low';
function bandFor(score: number): ScoreBand {
  if (score >= 80) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}
const REGION_PCT: Record<ScoreBand, number> = {high: 26, mid: 18, low: 10};

// scoreChip band tints. high: brand text on 12% brand tint over the card —
// BRAND_ACCENT itself is 5.0:1/8.0:1 vs card, tint keeps ≥4.5:1. mid:
// text-primary on muted. low: LOW_CHIP_TEXT on LOW_CHIP_BG (6.5:1 / 5.6:1).
const SCORE_CHIP_STYLE: Record<ScoreBand, CSSProperties> = {
  high: {background: BRAND_TINT_12, color: BRAND_ACCENT},
  mid: {background: 'var(--color-background-muted)', color: 'var(--color-text-primary)'},
  low: {background: LOW_CHIP_BG, color: LOW_CHIP_TEXT},
};

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useEbblineState(): a single state object + update(patch)
// with functional merges; every surface derives from it in render.
// ---------------------------------------------------------------------------

type TabId = 'windows' | 'spots' | 'crew';

interface ToastState {
  seq: number;
  msg: string;
  undo: Partial<EbblineState> | null;
}

interface EbblineState {
  tab: TabId;
  sessionWindow: SessionWindow;
  activePreset: Preset['id'] | null;
  savedSessions: SavedSession[];
  draftSaved: boolean; // footer flips Save → Invite crew
  savedSeq: number; // deterministic ids for appended saves
  spotsShown: number; // 5 → 8 via loadMoreRow
  sheet: null | 'invite';
  sheetDetent: 'medium' | 'large';
  invitedIds: string[];
  toast: ToastState | null;
  searchQuery: string;
  searchFocused: boolean;
  recents: string[];
  savedMenuId: string | null; // open ellipsis menu on a saved row
  capPulseSeq: number; // darkness-refusal pulse on the daylight lane
}

const INITIAL_STATE: EbblineState = {
  tab: 'windows',
  sessionWindow: {start: 6, end: 9},
  activePreset: 'dawn',
  savedSessions: SAVED_SEED,
  draftSaved: false,
  savedSeq: 1,
  spotsShown: 5,
  sheet: null,
  sheetDetent: 'medium',
  invitedIds: [],
  toast: null,
  searchQuery: '',
  searchFocused: false,
  recents: RECENTS_SEED,
  savedMenuId: null,
  capPulseSeq: 0,
};

function useEbblineState() {
  const [state, setState] = useState<EbblineState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<EbblineState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);
  return {state, setState, update};
}

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver can tell the
 * 390px mobile stage from the desktop stage. */
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
 * scroll; used for per-tab scroll persistence and re-tap-to-top. */
function findScroller(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return document.scrollingElement as HTMLElement | null;
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
// BRAND MARK — Ebbline tide-sine-through-circle, 44×44 button slot. Stroke
// var(--color-text-primary); the two 3px handle dots are BRAND_ACCENT.
// ---------------------------------------------------------------------------

function EbblineMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--color-text-primary)" strokeWidth="1.8" />
      <path
        d="M4 13.5c2.2-3.4 4.2-3.4 6.4 0s4.4 3.4 6.6 0"
        stroke="var(--color-text-primary)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="7.2" cy="11" r="1.5" fill={BRAND_ACCENT} />
      <circle cx="17.4" cy="13.9" r="1.5" fill={BRAND_ACCENT} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// WINDOW SCORE RING — 36px donut in a 44×44 navBar button. r=16, sw=4,
// C = 2π·16 = 100.53; dashoffset = C·(1 − score/100) → score 92 draws a
// 92.49-long arc. Track var(--color-border) (passive), progress
// BRAND_ACCENT, digits 13px/700 text-primary (sized for '100' — max real
// score is 96 by construction, so no reflow).
// ---------------------------------------------------------------------------

const RING_C = 2 * Math.PI * 16; // 100.53

function WindowScoreRing({score}: {score: number}) {
  return (
    <span style={{position: 'relative', width: 36, height: 36, display: 'grid', placeItems: 'center'}}>
      <svg width={36} height={36} viewBox="0 0 36 36" fill="none" aria-hidden>
        <circle cx="18" cy="18" r="16" stroke="var(--color-border)" strokeWidth="4" />
        <circle
          cx="18"
          cy="18"
          r="16"
          stroke={BRAND_ACCENT}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={RING_C.toFixed(2)}
          strokeDashoffset={(RING_C * (1 - score / 100)).toFixed(2)}
          transform="rotate(-90 18 18)"
          className="ebb-fade"
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontSize: 13,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--color-text-primary)',
        }}>
        {score}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// TIDE CURVE BRACKET — SVG plot (measured width × 140: 120px curve area +
// 20px hour-tick row) + two 44×44 HTML slider handles riding ON the curve.
// x mapping: pxPerHour = plotWidth/16 (334 → 20.875 at the 390 reference);
// y mapping: y = 110 − (h/2.0)·88 (1.9 m crest → y 26.4, baseline 118).
// The enclosed region fills with BRAND_ACCENT at the score band's opacity
// (≥80 → 26%, 50–79 → 18%, <50 → 10%) plus a 2px top stroke following the
// curve segment. Handles rubber-band up to 8px past the clamps and spring
// back in 200ms (instant under reduced motion).
// ---------------------------------------------------------------------------

const CURVE_BASE_Y = 118;

function yForHeight(h: number): number {
  return 110 - (h / 2.0) * 88;
}

interface TideCurveBracketProps {
  window: SessionWindow;
  score: number;
  plotWidth: number;
  onWindowChange: (next: SessionWindow) => void;
  onDarknessRefusal: () => void;
}

interface DragInfo {
  handle: 'start' | 'end';
  originClientX: number;
  originTick: number;
}

function clampHandleTick(handle: 'start' | 'end', raw: number, window: SessionWindow): number {
  const snapped = Math.round(raw * 2) / 2;
  if (handle === 'start') {
    // start ∈ [max(5.5, end−6), end−1] — darkness, max span, min span.
    return Math.min(Math.max(snapped, Math.max(CLAMP_START, window.end - MAX_SPAN)), window.end - MIN_SPAN);
  }
  return Math.max(Math.min(snapped, Math.min(CLAMP_END, window.start + MAX_SPAN)), window.start + MIN_SPAN);
}

function TideCurveBracket({window: win, score, plotWidth, onWindowChange, onDarknessRefusal}: TideCurveBracketProps) {
  const pxPerHour = plotWidth / PLOT_HOURS;
  const dragRef = useRef<DragInfo | null>(null);
  // Transient overshoot render offset (px) — ref-free state is fine here;
  // it only mutates during an active drag.
  const [overshoot, setOvershoot] = useState<{handle: 'start' | 'end'; px: number} | null>(null);

  const xFor = (tick: number) => (tick - PLOT_START_H) * pxPerHour;

  // Curve polyline through the 17 hourly samples.
  const curvePath = useMemo(() => {
    return TIDE_HEIGHTS.map((h, i) => `${i === 0 ? 'M' : 'L'} ${(i * pxPerHour).toFixed(2)} ${yForHeight(h).toFixed(2)}`).join(' ');
  }, [pxPerHour]);

  // Region under the curve between the bracket handles (0.25 h samples).
  const {regionPath, topStrokePath} = useMemo(() => {
    const pts: string[] = [];
    for (let t = win.start; t <= win.end + 1e-6; t += 0.25) {
      const tick = Math.min(t, win.end);
      pts.push(`${xFor(tick).toFixed(2)} ${yForHeight(tideAt(tick)).toFixed(2)}`);
    }
    const top = `M ${pts.join(' L ')}`;
    const region = `${top} L ${xFor(win.end).toFixed(2)} ${CURVE_BASE_Y} L ${xFor(win.start).toFixed(2)} ${CURVE_BASE_Y} Z`;
    return {regionPath: region, topStrokePath: top};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.start, win.end, pxPerHour]);

  const handlePointerDown = (handle: 'start' | 'end') => (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {handle, originClientX: event.clientX, originTick: handle === 'start' ? win.start : win.end};
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag == null || pxPerHour === 0) return;
    const raw = drag.originTick + (event.clientX - drag.originClientX) / pxPerHour;
    const clamped = clampHandleTick(drag.handle, raw, win);
    const current = drag.handle === 'start' ? win.start : win.end;
    if (clamped !== current) {
      onWindowChange(drag.handle === 'start' ? {...win, start: clamped} : {...win, end: clamped});
    }
    // Rubber-band: raw position past the clamp renders up to 8px of
    // overshoot via transform, springing back on release (200ms).
    const overshootPx = Math.max(-8, Math.min(8, (raw - clamped) * pxPerHour));
    const isBeyond = Math.abs(raw - clamped) > 0.25;
    setOvershoot(isBeyond ? {handle: drag.handle, px: overshootPx} : null);
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    if (drag != null && overshoot != null) {
      // Darkness refusal: releasing an overshoot against the 05:30/20:30
      // light clamps pulses the daylight lane's dark cap once.
      const atDark =
        (drag.handle === 'start' && win.start === CLAMP_START && overshoot.px < 0) ||
        (drag.handle === 'end' && win.end === CLAMP_END && overshoot.px > 0);
      if (atDark) onDarknessRefusal();
    }
    dragRef.current = null;
    setOvershoot(null);
  };

  const handleKeyDown = (handle: 'start' | 'end') => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const current = handle === 'start' ? win.start : win.end;
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = current - 0.5;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = current + 0.5;
    else if (event.key === 'Home') next = handle === 'start' ? CLAMP_START : win.start + MIN_SPAN;
    else if (event.key === 'End') next = handle === 'start' ? win.end - MIN_SPAN : CLAMP_END;
    if (next == null) return;
    event.preventDefault();
    const clamped = clampHandleTick(handle, next, win);
    if (clamped === current) {
      if ((handle === 'start' && next < CLAMP_START) || (handle === 'end' && next > CLAMP_END)) {
        onDarknessRefusal();
      }
      return;
    }
    onWindowChange(handle === 'start' ? {...win, start: clamped} : {...win, end: clamped});
  };

  const band = bandFor(score);
  const regionFill = `color-mix(in srgb, ${BRAND_ACCENT} ${REGION_PCT[band]}%, transparent)`;
  const tickHours = [5, 8, 11, 14, 17, 20];

  const renderHandle = (handle: 'start' | 'end') => {
    const tick = handle === 'start' ? win.start : win.end;
    const x = xFor(tick);
    const y = yForHeight(tideAt(tick));
    const shoveX = overshoot != null && overshoot.handle === handle ? overshoot.px : 0;
    return (
      <button
        type="button"
        className="ebb-btn ebb-focusable ebb-anim"
        role="slider"
        aria-label={handle === 'start' ? 'Window start' : 'Window end'}
        aria-valuemin={handle === 'start' ? CLAMP_START : win.start + MIN_SPAN}
        aria-valuemax={handle === 'start' ? win.end - MIN_SPAN : CLAMP_END}
        aria-valuenow={tick}
        aria-valuetext={`${handle === 'start' ? 'Start' : 'End'} ${fmtTick(tick)}`}
        style={{
          ...styles.handleBtn,
          left: x - 22,
          top: y - 22,
          transform: shoveX !== 0 ? `translateX(${shoveX.toFixed(1)}px)` : undefined,
        }}
        onPointerDown={handlePointerDown(handle)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown(handle)}>
        <span style={styles.knob}>
          <span style={styles.knobDot} />
        </span>
      </button>
    );
  };

  return (
    <div style={{position: 'relative', width: '100%', height: 140}}>
      {plotWidth > 0 ? (
        <>
          <svg width={plotWidth} height={140} viewBox={`0 0 ${plotWidth} 140`} fill="none" aria-hidden>
            {/* Baseline. */}
            <line x1={0} y1={CURVE_BASE_Y} x2={plotWidth} y2={CURVE_BASE_Y} stroke="var(--color-border)" />
            {/* Enclosed window region — band-tinted fill + 2px top stroke. */}
            <path d={regionPath} fill={regionFill} className="ebb-fade" />
            <path d={topStrokePath} stroke={BRAND_ACCENT} strokeWidth={2} strokeLinecap="round" />
            {/* Tide polyline. */}
            <path d={curvePath} stroke="var(--color-text-primary)" strokeWidth={1.5} strokeLinejoin="round" />
            {/* Bracket stems — 2px verticals from knob to baseline. */}
            <line
              x1={xFor(win.start)}
              y1={yForHeight(tideAt(win.start))}
              x2={xFor(win.start)}
              y2={CURVE_BASE_Y}
              stroke={BRAND_ACCENT}
              strokeWidth={2}
            />
            <line
              x1={xFor(win.end)}
              y1={yForHeight(tideAt(win.end))}
              x2={xFor(win.end)}
              y2={CURVE_BASE_Y}
              stroke={BRAND_ACCENT}
              strokeWidth={2}
            />
            {/* Curve extreme annotations (fixture values). */}
            <text x={xFor(6.2)} y={104} fontSize={11} fill="var(--color-text-secondary)" textAnchor="middle">
              0.4 low
            </text>
            <text x={xFor(12.4)} y={18} fontSize={11} fill="var(--color-text-secondary)" textAnchor="middle">
              1.9 high
            </text>
            <text x={xFor(18.6)} y={104} fontSize={11} fill="var(--color-text-secondary)" textAnchor="middle">
              0.45 low
            </text>
            {/* Hour ticks: 05 / 08 / 11 / 14 / 17 / 20. */}
            {tickHours.map(h => (
              <text
                key={h}
                x={xFor(h)}
                y={134}
                fontSize={11}
                fill="var(--color-text-secondary)"
                textAnchor={h === 5 ? 'start' : 'middle'}
                style={{fontVariantNumeric: 'tabular-nums'}}>
                {String(h).padStart(2, '0')}
              </text>
            ))}
          </svg>
          {renderHandle('start')}
          {renderHandle('end')}
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// STACKED CONDITION LANES — three 28px lanes sharing the curve's x mapping
// (percent-of-16-hours), so the score intersection is visible. The active
// window projects a full-height 1px-edged highlight column through all
// three. Band fills are context; 11px card-backed labels carry the meaning
// (contrast math at the COLOR LITERALS block).
// ---------------------------------------------------------------------------

function StackedConditionLanes({window: win, capPulseSeq}: {window: SessionWindow; capPulseSeq: number}) {
  const leftPct = ((win.start - PLOT_START_H) / PLOT_HOURS) * 100;
  const widthPct = ((win.end - win.start) / PLOT_HOURS) * 100;
  const slotPct = 100 / 16;
  const flipPct = (WIND_FLIP_SLOT / 16) * 100; // 37.5
  return (
    <div style={styles.laneStack}>
      {/* Lane 1 — SWELL FT: hourly bars, height = ft/5 × 24px. */}
      <div style={styles.lane}>
        <span style={styles.laneLabelChip}>SWELL FT</span>
        {SWELL_FT.map((ft, i) => (
          <span
            key={i}
            style={{
              ...styles.swellBar,
              left: `calc(${(i * slotPct).toFixed(3)}% + 1px)`,
              width: `calc(${slotPct.toFixed(3)}% - 2px)`,
              height: (ft / 5) * 24,
            }}
          />
        ))}
      </div>
      {/* Lane 2 — WIND: offshore band (left arrows) flips onshore at 11:00. */}
      <div style={styles.lane}>
        <span style={styles.laneLabelChip}>WIND</span>
        <span style={{...styles.windBand, left: 0, width: `${flipPct}%`, background: WIND_OFF_BAND}}>
          <span style={{...styles.windBandLabel, color: WIND_OFF_TEXT}}>← off 3–8</span>
        </span>
        <span style={{...styles.windBand, left: `${flipPct}%`, right: 0, background: WIND_ON_BAND}}>
          <span style={{...styles.windBandLabel, color: WIND_ON_TEXT}}>on 12–16 →</span>
        </span>
        <span style={{...styles.flipMarker, left: `${flipPct}%`}} aria-hidden />
        <span style={{...styles.flipLabel, left: `calc(${flipPct}% + 4px)`}}>flips 11:00</span>
      </div>
      {/* Lane 3 — DAYLIGHT: dark → light → dark with hard dark caps before
          05:24 (2.5%) and after 20:48 (98.75%); the caps pulse once on a
          darkness-refusal clamp (opacity pulse, removed under reduced
          motion — the static caps still encode the bound). */}
      <div style={styles.lane}>
        <span style={styles.laneLabelChip}>DAYLIGHT</span>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(90deg, ${NIGHT_FILL} 0%, ${NIGHT_FILL} ${FIRST_LIGHT_PCT}%, ${DAY_FILL} 7.5%, ${DAY_FILL} 95%, ${NIGHT_FILL} ${LAST_LIGHT_PCT}%, ${NIGHT_FILL} 100%)`,
          }}
        />
        <span
          key={`cap-l-${capPulseSeq}`}
          className={capPulseSeq > 0 ? 'ebb-cap-pulse' : undefined}
          style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: `${FIRST_LIGHT_PCT}%`, background: NIGHT_FILL}}
        />
        <span
          key={`cap-r-${capPulseSeq}`}
          className={capPulseSeq > 0 ? 'ebb-cap-pulse' : undefined}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${LAST_LIGHT_PCT}%`,
            right: 0,
            background: NIGHT_FILL,
          }}
        />
      </div>
      {/* Active-window highlight column through all three lanes. */}
      <span style={{...styles.windowColumn, left: `${leftPct}%`, width: `${widthPct}%`}} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SPOT RANK ROW — 72px full-row button, absolutely positioned by rank so
// reorders animate translateY 200ms (opacity-only collapse under reduced
// motion via the CSS guard). Leading 32px rank block (17/600 numeral over
// movement glyph vs the DAWN baseline), two-line name/meta stack (the only
// flexible track), trailing 56px chip stack (24px scoreChip pill over the
// 11px/600 ±delta chip — delta = spotScore − windowScore).
// ---------------------------------------------------------------------------

interface RankedSpot {
  spot: Spot;
  score: number;
  delta: number;
  rank: number;
  movement: number; // dawnRank − currentRank; + = climbed
  waveLabel: string;
}

interface SpotRankRowProps {
  ranked: RankedSpot;
  index: number;
  isLast: boolean;
  query?: string;
  onPress: () => void;
  rowRef?: (node: HTMLButtonElement | null) => void;
}

function highlightMatch(name: string, query: string) {
  const q = query.trim().toLowerCase();
  if (q === '') return name;
  const at = name.toLowerCase().indexOf(q);
  if (at < 0) return name;
  return (
    <>
      {name.slice(0, at)}
      <span style={{fontWeight: 600}}>{name.slice(at, at + q.length)}</span>
      {name.slice(at + q.length)}
    </>
  );
}

function SpotRankRow({ranked, index, isLast, query = '', onPress, rowRef}: SpotRankRowProps) {
  const {spot, score, delta, rank, movement, waveLabel} = ranked;
  const band = bandFor(score);
  const movementLabel = movement > 0 ? `up ${movement}` : movement < 0 ? `down ${-movement}` : 'steady';
  return (
    <button
      type="button"
      ref={rowRef}
      className="ebb-btn ebb-focusable ebb-anim"
      style={{...styles.spotRow, transform: `translateY(${index * 72}px)`}}
      aria-label={`${spot.name}, rank ${rank}, score ${score}, ${movementLabel} versus dawn patrol`}
      onClick={onPress}>
      <span style={styles.rankBlock} aria-hidden>
        <span style={styles.rankNum}>{rank}</span>
        {movement === 0 ? (
          <span style={{...styles.movement, color: 'var(--color-text-secondary)'}}>—</span>
        ) : (
          <span style={{...styles.movement, color: movement > 0 ? BRAND_ACCENT : MOVE_DOWN}}>
            <Icon icon={movement > 0 ? ArrowUpIcon : ArrowDownIcon} size="xsm" color="inherit" />
            {Math.abs(movement)}
          </span>
        )}
      </span>
      <span style={styles.spotText} aria-hidden>
        <span style={styles.spotName}>{highlightMatch(spot.name, query)}</span>
        <span style={styles.spotMeta}>
          {waveLabel}ft · {spot.tideNote} · {spot.type}
        </span>
      </span>
      <span style={styles.chipStack} aria-hidden>
        <span style={{...styles.scoreChip, ...SCORE_CHIP_STYLE[band]}}>{score}</span>
        <span
          style={{
            ...styles.deltaChip,
            color: delta > 0 ? BRAND_ACCENT : delta < 0 ? MOVE_DOWN : 'var(--color-text-secondary)',
          }}>
          {delta > 0 ? `+${delta}` : delta < 0 ? `−${-delta}` : '±0'}
        </span>
      </span>
      {!isLast ? <span style={styles.spotRowDivider} aria-hidden /> : null}
    </button>
  );
}

/** Rank the 8 spots for a window: score = windowScore + delta, sorted
 * descending (dawn-baseline rank breaks ties deterministically). */
function rankSpots(window: SessionWindow): RankedSpot[] {
  const base = scoreForWindow(window);
  const waveBase = windowMean(window, SWELL_FT);
  const scored = SPOTS.map(spot => {
    const delta = spotDeltaFor(spot.id, window);
    return {
      spot,
      delta,
      score: base + delta,
      waveLabel: (Math.round(waveBase * spot.sizeFactor * 10) / 10).toFixed(1),
    };
  }).sort((a, b) => b.score - a.score || DAWN_RANKS[a.spot.id] - DAWN_RANKS[b.spot.id]);
  return scored.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    movement: DAWN_RANKS[entry.spot.id] - (index + 1),
  }));
}

// ---------------------------------------------------------------------------
// PAGE — Ebbline Tide Window. ONE state owner; every surface (ring, region,
// lanes column, footer label, spot ranks, prefill, badge) derives from
// state in render. Tab switches persist scroll + query + selection and
// close overlays (the toast dock persists); re-tapping the active tab
// scrolls to top (the one legal reset).
// ---------------------------------------------------------------------------

const TAB_META: {id: TabId; label: string; icon: typeof WavesIcon; title: string}[] = [
  {id: 'windows', label: 'Windows', icon: WavesIcon, title: 'Cold Point'},
  {id: 'spots', label: 'Spots', icon: MapPinIcon, title: 'Spots'},
  {id: 'crew', label: 'Crew', icon: UsersIcon, title: 'Crew'},
];

export default function MobileTideSurfWindowPage() {
  const {state, setState, update} = useEbblineState();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const plotWrapRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const appendedRowRef = useRef<HTMLButtonElement | null>(null);
  const scrollByTabRef = useRef<Partial<Record<TabId, number>>>({});
  const toastSeqRef = useRef(1);

  const containerWidth = useElementWidth(wrapRef);
  const plotWidth = useElementWidth(plotWrapRef);
  const isDesktop = containerWidth >= 720;

  const win = state.sessionWindow;
  const score = scoreForWindow(win);
  const ranked = useMemo(() => rankSpots(win), [win]);
  const sheetOpen = state.sheet != null;
  const savedCount = state.savedSessions.length;

  // -- toast ----------------------------------------------------------------
  const showToast = useCallback(
    (msg: string, undo: Partial<EbblineState> | null = null) => {
      toastSeqRef.current += 1;
      update({toast: {seq: toastSeqRef.current, msg, undo}});
    },
    [update],
  );

  const handleUndo = () => {
    const undo = state.toast?.undo;
    if (undo == null) return;
    toastSeqRef.current += 1;
    setState(prev => ({...prev, ...undo, toast: {seq: toastSeqRef.current, msg: 'Restored', undo: null}}));
  };

  // -- window mutations (drag / steppers / presets share these) --------------
  const setWindow = useCallback(
    (next: SessionWindow) => {
      update({sessionWindow: next, activePreset: null, draftSaved: false});
    },
    [update],
  );

  const pulseDarkCap = useCallback(() => {
    setState(prev => ({...prev, capPulseSeq: prev.capPulseSeq + 1}));
  }, [setState]);

  const applyPreset = (preset: Preset) => {
    update({sessionWindow: preset.window, activePreset: preset.id, draftSaved: false});
  };

  const stepTick = (handle: 'start' | 'end', dir: 1 | -1) => {
    const current = handle === 'start' ? win.start : win.end;
    const next = current + dir * 0.5;
    const clamped = clampHandleTick(handle, next, win);
    if (clamped === current) {
      if ((handle === 'start' && next < CLAMP_START) || (handle === 'end' && next > CLAMP_END)) pulseDarkCap();
      return;
    }
    setWindow(handle === 'start' ? {...win, start: clamped} : {...win, end: clamped});
  };

  // Stepper exhaustion (35% opacity + disabled at the clamp).
  const startMin = Math.max(CLAMP_START, win.end - MAX_SPAN);
  const startMax = win.end - MIN_SPAN;
  const endMin = win.start + MIN_SPAN;
  const endMax = Math.min(CLAMP_END, win.start + MAX_SPAN);

  // -- tabs -------------------------------------------------------------
  const selectTab = (tab: TabId) => {
    const scroller = findScroller(shellRef.current);
    if (tab === state.tab) {
      // The one legal reset: re-tapping the active tab scrolls to top.
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    if (scroller != null) scrollByTabRef.current[state.tab] = scroller.scrollTop;
    // Overlays don't survive tab switches; the toast dock persists.
    update({tab, sheet: null, savedMenuId: null});
  };

  useEffect(() => {
    const scroller = findScroller(shellRef.current);
    if (scroller != null) scroller.scrollTop = scrollByTabRef.current[state.tab] ?? 0;
  }, [state.tab]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const ids = TAB_META.map(tab => tab.id);
    const at = ids.indexOf(state.tab);
    const next = ids[(at + (event.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
    selectTab(next);
    document.getElementById(`ebb-tab-${next}`)?.focus();
  };

  // -- sheet ------------------------------------------------------------
  const openInviteSheet = (opener: HTMLElement | null) => {
    openerRef.current = opener;
    update({sheet: 'invite', sheetDetent: 'medium'});
  };

  const closeSheet = useCallback(() => {
    update({sheet: null});
    openerRef.current?.focus();
  }, [update]);

  useEffect(() => {
    if (sheetOpen) {
      // preventScroll — plain .focus() scroll-reveals the animating sheet
      // inside the locked overflow-hidden column (foundations amendment).
      sheetRef.current?.focus({preventScroll: true});
    }
  }, [sheetOpen]);

  const toggleCrew = (id: string) => {
    setState(prev => ({
      ...prev,
      invitedIds: prev.invitedIds.includes(id)
        ? prev.invitedIds.filter(existing => existing !== id)
        : [...prev.invitedIds, id],
    }));
  };

  const sendInvite = () => {
    const n = state.invitedIds.length;
    if (n === 0) return;
    toastSeqRef.current += 1;
    setState(prev => ({
      ...prev,
      sheet: null,
      invitedIds: [],
      toast: {
        seq: toastSeqRef.current,
        msg: `Invite sent to ${n} crew`,
        // Undo restores the selection state; the sheet stays closed.
        undo: {invitedIds: prev.invitedIds},
      },
    }));
    openerRef.current?.focus();
  };

  // -- save / delete ------------------------------------------------------
  const saveWindow = () => {
    const label = `Sat ${fmtRange(win)}`;
    toastSeqRef.current += 1;
    setState(prev => {
      const preset = PRESETS.find(candidate => candidate.id === prev.activePreset);
      const next: SavedSession = {
        id: `sv_draft_${prev.savedSeq}`,
        label,
        spotName: 'Cold Point',
        score: scoreForWindow(prev.sessionWindow),
        note: preset?.label ?? 'Custom window',
      };
      return {
        ...prev,
        savedSessions: [...prev.savedSessions, next],
        draftSaved: true,
        savedSeq: prev.savedSeq + 1,
        toast: {
          seq: toastSeqRef.current,
          msg: `Window saved · ${label}`,
          // Stress 7: Undo → badge back to 1, footer reverts to 'Save
          // window · 92', savedSessions order untouched.
          undo: {savedSessions: prev.savedSessions, draftSaved: false, savedSeq: prev.savedSeq},
        },
      };
    });
  };

  const deleteSaved = (id: string) => {
    toastSeqRef.current += 1;
    setState(prev => {
      const target = prev.savedSessions.find(session => session.id === id);
      return {
        ...prev,
        savedMenuId: null,
        savedSessions: prev.savedSessions.filter(session => session.id !== id),
        toast: {
          seq: toastSeqRef.current,
          msg: `Deleted · ${target?.label ?? 'saved window'}`,
          // Undo restores the exact list position (full prior array).
          undo: {savedSessions: prev.savedSessions},
        },
      };
    });
  };

  // -- spots list -----------------------------------------------------------
  const showMoreSpots = () => {
    update({spotsShown: 8});
    showToast('3 more loaded');
  };

  useEffect(() => {
    if (state.spotsShown === 8) appendedRowRef.current?.focus();
  }, [state.spotsShown]);

  // -- search (Spots tab) -----------------------------------------------
  const query = state.searchQuery;
  const trimmedQuery = query.trim().toLowerCase();
  const filteredRanked =
    trimmedQuery === ''
      ? ranked
      : ranked.filter(
          entry =>
            entry.spot.name.toLowerCase().includes(trimmedQuery) || entry.spot.type.toLowerCase().includes(trimmedQuery),
        );

  const commitSearch = () => {
    if (trimmedQuery === '') return;
    setState(prev => ({
      ...prev,
      recents: [query.trim(), ...prev.recents.filter(recent => recent !== query.trim())].slice(0, 5),
    }));
    // Settled count through the ONE polite region — never per keystroke.
    showToast(`${filteredRanked.length} result${filteredRanked.length === 1 ? '' : 's'}`);
  };

  const cancelSearch = () => {
    update({searchQuery: '', searchFocused: false});
    searchInputRef.current?.blur();
  };

  // -- derived chrome ---------------------------------------------------
  const navTitle = TAB_META.find(tab => tab.id === state.tab)?.title ?? 'Cold Point';
  const hasFooter = state.tab !== 'spots';
  const footerLabel =
    state.tab === 'crew' ? 'New invite' : state.draftSaved ? 'Invite crew' : `Save window · ${score}`;
  const prefill = windowString(win);
  const showRecents = state.tab === 'spots' && state.searchFocused && trimmedQuery === '';

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(sheetOpen ? styles.shellLocked : null),
    ...(isDesktop ? styles.shellDesktop : null),
  };

  // -- renderers ----------------------------------------------------------
  const renderSpotCard = (entries: RankedSpot[], withLoadMore: boolean, searchQ: string) => (
    <div style={styles.listCard}>
      <div style={{...styles.spotList, height: entries.length * 72}}>
        {entries.map((entry, index) => (
          <SpotRankRow
            key={entry.spot.id}
            ranked={entry}
            index={index}
            isLast={index === entries.length - 1}
            query={searchQ}
            rowRef={withLoadMore || state.tab === 'windows' ? (index === 5 ? node => (appendedRowRef.current = node) : undefined) : undefined}
            onPress={() =>
              state.tab === 'windows' ? selectTab('spots') : showToast(`${entry.spot.name} · ${entry.score} for this window`)
            }
          />
        ))}
      </div>
      {withLoadMore ? (
        <button type="button" className="ebb-btn ebb-focusable" style={styles.loadMoreRow} onClick={showMoreSpots}>
          Show 3 more
        </button>
      ) : null}
    </div>
  );

  const renderStepper = (handle: 'start' | 'end') => {
    const value = handle === 'start' ? win.start : win.end;
    const atMin = handle === 'start' ? value <= startMin : value <= endMin;
    const atMax = handle === 'start' ? value >= startMax : value >= endMax;
    const label = handle === 'start' ? 'Start' : 'End';
    return (
      <div style={styles.stepCluster}>
        <span
          role="spinbutton"
          tabIndex={0}
          className="ebb-focusable"
          aria-label={`${label} time`}
          aria-valuenow={value}
          aria-valuemin={handle === 'start' ? startMin : endMin}
          aria-valuemax={handle === 'start' ? startMax : endMax}
          aria-valuetext={fmtTick(value)}
          style={styles.stepValue}
          onKeyDown={event => {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              stepTick(handle, 1);
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              stepTick(handle, -1);
            }
          }}>
          <span style={styles.stepOverline}>{label}</span>
          <span style={styles.stepTime}>{fmtTick(value)}</span>
        </span>
        <span style={styles.stepper}>
          <button
            type="button"
            className="ebb-btn ebb-focusable"
            aria-label={`Earlier ${label.toLowerCase()}`}
            disabled={atMin}
            style={{...styles.stepHalf, ...(atMin ? styles.stepHalfDisabled : null)}}
            onClick={() => stepTick(handle, -1)}>
            <Icon icon={MinusIcon} size="sm" color="inherit" />
          </button>
          <span style={styles.stepDivider} />
          <button
            type="button"
            className="ebb-btn ebb-focusable"
            aria-label={`Later ${label.toLowerCase()}`}
            disabled={atMax}
            style={{...styles.stepHalf, ...(atMax ? styles.stepHalfDisabled : null)}}
            onClick={() => stepTick(handle, 1)}>
            <Icon icon={PlusIcon} size="sm" color="inherit" />
          </button>
        </span>
      </div>
    );
  };

  const renderCrewRow = (member: CrewMember, isLast: boolean, inSheet: boolean) => {
    const checked = state.invitedIds.includes(member.id);
    return (
      <div key={member.id} style={{position: 'relative'}}>
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          className="ebb-btn ebb-focusable"
          style={{...styles.crewRow, paddingInline: inSheet ? 0 : 16}}
          onClick={() => toggleCrew(member.id)}>
          <span style={{...styles.selectionCircle, ...(checked ? styles.selectionCircleOn : null)}} aria-hidden>
            {checked ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
          </span>
          <span style={styles.crewAvatar} aria-hidden>
            {member.initials}
          </span>
          <span style={styles.crewText} aria-hidden>
            <span style={styles.crewName}>{member.name}</span>
            <span style={styles.crewMeta}>{member.meta}</span>
          </span>
        </button>
        {!isLast ? <div style={{...styles.rowDivider, marginInlineStart: inSheet ? 36 : 52}} /> : null}
      </div>
    );
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{EBB_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <h1 className="ebb-vh">Ebbline — Cold Point session window</h1>

        {/* NAV BAR — brand mark · single-line title · WindowScoreRing. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="ebb-btn ebb-focusable"
              style={styles.iconBtn}
              aria-label="Ebbline — go to Windows"
              onClick={() => selectTab('windows')}>
              <EbblineMark />
            </button>
          </div>
          <span style={styles.navTitle}>{navTitle}</span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="ebb-btn ebb-focusable"
              style={styles.iconBtn}
              aria-label={`Window score ${score} of 100 — see spot ranking`}
              onClick={() => selectTab('spots')}>
              <WindowScoreRing score={score} />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'windows' ? (
            <div style={styles.bodyPad}>
              <h2 className="ebb-vh">Session window</h2>
              {/* Preset chips — the exact non-gesture path. */}
              <div style={styles.presetRail} role="group" aria-label="Window presets">
                {PRESETS.map(preset => {
                  const on = state.activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      className="ebb-btn ebb-focusable"
                      style={styles.chipHit}
                      aria-pressed={on}
                      onClick={() => applyPreset(preset)}>
                      <span style={{...styles.chip, ...(on ? styles.chipOn : null)}}>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Stepper row — ±30 min with the same clamps as the drag. */}
              <div style={styles.stepperRow}>
                {renderStepper('start')}
                {renderStepper('end')}
              </div>
              {/* TIDE CARD — 264px: 140 plot + 8 gap + 92 lanes + padding. */}
              <section style={styles.tideCard} aria-label="Tide curve and conditions">
                <div ref={plotWrapRef}>
                  <TideCurveBracket
                    window={win}
                    score={score}
                    plotWidth={plotWidth}
                    onWindowChange={setWindow}
                    onDarknessRefusal={pulseDarkCap}
                  />
                </div>
                <StackedConditionLanes window={win} capPulseSeq={state.capPulseSeq} />
              </section>

              <h2 style={styles.sectionHeader}>Spots for this window</h2>
              {renderSpotCard(ranked.slice(0, state.spotsShown), state.spotsShown < 8, '')}
              {state.spotsShown >= 8 ? <p style={styles.terminalCaption}>All 8 spots</p> : null}

              <h2 style={{...styles.sectionHeader, marginTop: 24}}>Saved windows · {savedCount}</h2>
              <div style={styles.listCard}>
                {state.savedSessions.map((session, index) => (
                  <div key={session.id} style={styles.savedRow}>
                    <span style={styles.savedText}>
                      <span style={styles.savedPrimary}>
                        {session.spotName} · {session.label}
                      </span>
                      <span style={styles.savedSecondary}>
                        {session.note} · score {session.score}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="ebb-btn ebb-focusable"
                      style={styles.ellipsisBtn}
                      aria-label={`Options for ${session.label}`}
                      aria-expanded={state.savedMenuId === session.id}
                      onClick={() => update({savedMenuId: state.savedMenuId === session.id ? null : session.id})}>
                      <Icon icon={MoreHorizontalIcon} size="sm" color="inherit" />
                    </button>
                    {state.savedMenuId === session.id ? (
                      <div
                        style={{...styles.anchoredMenu, top: 54}}
                        role="menu"
                        onKeyDown={event => {
                          if (event.key === 'Escape') update({savedMenuId: null});
                        }}>
                        {/* Reversible → executes immediately + Undo toast
                            (undoOverConfirm); destructive lives one intent
                            step away from the thumb corner. */}
                        <button
                          type="button"
                          role="menuitem"
                          className="ebb-btn ebb-focusable"
                          style={{...styles.menuRow, color: 'var(--color-error)'}}
                          onClick={() => deleteSaved(session.id)}>
                          Delete saved window
                        </button>
                      </div>
                    ) : null}
                    {index < state.savedSessions.length - 1 ? (
                      <div style={{...styles.rowDivider, position: 'absolute', bottom: 0, left: 16, right: 0}} />
                    ) : null}
                  </div>
                ))}
                {state.savedSessions.length === 0 ? (
                  <div style={{...styles.savedRow, color: 'var(--color-text-secondary)', fontSize: 13}}>
                    Saved windows appear here.
                  </div>
                ) : null}
              </div>
              <div style={{height: 24}} />
            </div>
          ) : null}

          {state.tab === 'spots' ? (
            <div>
              <h2 className="ebb-vh">Spots ranked for this window</h2>
              {/* SEARCH — 52px bar; four states: idle, focused-empty
                  (recents), results, filtered-empty. */}
              <div style={styles.searchBar}>
                <div style={styles.searchField}>
                  <Icon icon={SearchIcon} size="sm" color="secondary" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    aria-label="Search spots"
                    placeholder="Search spots"
                    value={query}
                    style={styles.searchInput}
                    onFocus={() => update({searchFocused: true})}
                    onChange={event => update({searchQuery: event.target.value})}
                    onKeyDown={event => {
                      if (event.key === 'Enter') commitSearch();
                      else if (event.key === 'Escape') {
                        if (trimmedQuery !== '') update({searchQuery: ''});
                        else cancelSearch();
                      }
                    }}
                  />
                  {query !== '' ? (
                    <button
                      type="button"
                      className="ebb-btn ebb-focusable"
                      style={styles.searchClear}
                      aria-label="Clear query"
                      onClick={() => {
                        update({searchQuery: ''});
                        searchInputRef.current?.focus();
                      }}>
                      <Icon icon={XCircleIcon} size="sm" color="inherit" />
                    </button>
                  ) : null}
                </div>
                {state.searchFocused || query !== '' ? (
                  <button type="button" className="ebb-btn ebb-focusable" style={styles.searchCancel} onClick={cancelSearch}>
                    Cancel
                  </button>
                ) : null}
              </div>

              {showRecents ? (
                <div>
                  <div style={styles.recentHeaderRow}>
                    <h2 style={{...styles.sectionHeader, margin: '8px 0'}}>Recent</h2>
                    {state.recents.length > 0 ? (
                      <button
                        type="button"
                        className="ebb-btn ebb-focusable"
                        style={styles.clearRecentsBtn}
                        onClick={() => update({recents: []})}>
                        Clear
                      </button>
                    ) : null}
                  </div>
                  <div style={styles.listCard}>
                    {state.recents.map((recent, index) => (
                      <div key={recent} style={{display: 'flex', alignItems: 'center'}}>
                        <button
                          type="button"
                          className="ebb-btn ebb-focusable"
                          style={styles.recentRow}
                          onClick={() => update({searchQuery: recent})}>
                          <Icon icon={ClockIcon} size="sm" color="secondary" />
                          <span style={styles.recentText}>{recent}</span>
                        </button>
                        <button
                          type="button"
                          className="ebb-btn ebb-focusable"
                          style={{...styles.ellipsisBtn, marginInlineEnd: 0}}
                          aria-label={`Remove recent search ${recent}`}
                          onClick={() => update({recents: state.recents.filter(existing => existing !== recent)})}>
                          <Icon icon={XIcon} size="sm" color="inherit" />
                        </button>
                        {index < state.recents.length - 1 ? (
                          <div style={{...styles.rowDivider, position: 'absolute', marginTop: 43, left: 16, right: 0}} />
                        ) : null}
                      </div>
                    ))}
                    {state.recents.length === 0 ? (
                      <div style={{...styles.recentRow, color: 'var(--color-text-secondary)', fontSize: 13}}>
                        No recent searches.
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : trimmedQuery !== '' && filteredRanked.length === 0 ? (
                /* FILTERED-EMPTY — echoes the query verbatim (stress 8). */
                <div style={styles.emptyState}>
                  <span style={styles.emptyIconCircle}>
                    <Icon icon={SearchXIcon} size="lg" color="inherit" />
                  </span>
                  <span style={styles.emptyTitle}>No results for “{query.trim()}”</span>
                  <span style={styles.emptyBody}>Try a spot name or break type.</span>
                  <button type="button" className="ebb-btn ebb-focusable" style={styles.emptyAction} onClick={cancelSearch}>
                    Clear search
                  </button>
                </div>
              ) : (
                <div style={{paddingTop: 4}}>
                  <h2 style={styles.sectionHeader}>
                    Ranked for Sat {fmtRange(win)} · score {score}
                  </h2>
                  {renderSpotCard(filteredRanked, false, trimmedQuery)}
                  {trimmedQuery === '' ? <p style={styles.terminalCaption}>All 8 spots</p> : null}
                  <div style={{height: 24}} />
                </div>
              )}
            </div>
          ) : null}

          {state.tab === 'crew' ? (
            <div style={styles.bodyPad}>
              <h2 style={{...styles.sectionHeader, marginTop: 8}}>Crew · {CREW.length}</h2>
              <div style={styles.listCard}>
                {CREW.map((member, index) => renderCrewRow(member, index === CREW.length - 1, false))}
              </div>
              <p style={{...styles.terminalCaption}}>
                {state.invitedIds.length > 0 ? `${state.invitedIds.length} selected for the next invite` : 'Select crew here or in the invite sheet.'}
              </p>
              <div style={{height: 24}} />
            </div>
          ) : null}
        </main>

        {/* TOAST DOCK — sticky-in-flow above the bottom chrome; the ONE
            polite live region. No auto-dismiss timers. */}
        <div style={{...styles.toastAnchor, bottom: hasFooter ? 156 : 76}} aria-live="polite">
          {state.toast != null ? (
            <div style={styles.toast}>
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="ebb-btn ebb-focusable" style={styles.toastUndo} onClick={handleUndo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* STICKY FOOTER — the primary verb lives in the bottom third. */}
        {hasFooter ? (
          <div style={styles.footer}>
            <button
              type="button"
              className="ebb-btn ebb-focusable"
              style={styles.footerBtn}
              onClick={event => {
                if (state.tab === 'crew' || state.draftSaved) openInviteSheet(event.currentTarget);
                else saveWindow();
              }}>
              {footerLabel}
            </button>
          </div>
        ) : null}

        {/* TAB BAR — 64px, 3 tabs; Windows badge = savedSessions.length. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Ebbline sections" onKeyDown={onTabKeyDown}>
          {TAB_META.map(tab => {
            const isActive = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                id={`ebb-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="ebb-btn ebb-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                  {tab.id === 'windows' ? (
                    <span style={styles.tabBadge} aria-label={`${savedCount} saved windows`}>
                      {savedCount}
                    </span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* INVITE SHEET — medium 55% / large calc(100% − 56px); scrim +
            focus trap; Escape closes topmost only; overlays are absolute
            INSIDE shell. */}
        {sheetOpen ? (
          <>
            <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <div
              ref={sheetRef}
              className="ebb-sheet-in"
              role="dialog"
              aria-modal="true"
              aria-label="Invite crew"
              tabIndex={-1}
              style={{...styles.sheet, height: state.sheetDetent === 'medium' ? '55%' : 'calc(100% - 56px)'}}
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
                  className="ebb-btn ebb-focusable"
                  aria-label="Resize sheet"
                  style={{width: 44, height: 24, display: 'grid', placeItems: 'center'}}
                  onClick={() => update({sheetDetent: state.sheetDetent === 'medium' ? 'large' : 'medium'})}>
                  <span style={styles.grabberPill} />
                </button>
              </div>
              <div style={styles.sheetHeader}>
                <span />
                <h2 style={styles.sheetTitle}>Invite crew</h2>
                <button
                  type="button"
                  className="ebb-btn ebb-focusable"
                  style={styles.iconBtn}
                  aria-label="Close"
                  onClick={closeSheet}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                {/* Read-only prefill quoting THE derived window string. */}
                <div style={styles.prefillCard}>
                  <span style={styles.prefillLabel}>Prefilled invite</span>
                  {prefill}
                </div>
                {CREW.map((member, index) => renderCrewRow(member, index === CREW.length - 1, true))}
              </div>
              <div style={styles.sheetFooter}>
                <button
                  type="button"
                  className="ebb-btn ebb-focusable"
                  disabled={state.invitedIds.length === 0}
                  style={{
                    ...styles.footerBtn,
                    ...(state.invitedIds.length === 0 ? styles.sendBtnDisabled : null),
                  }}
                  onClick={sendInvite}>
                  {state.invitedIds.length === 0 ? 'Select crew' : `Send invite · ${state.invitedIds.length}`}
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* Click-catcher for the saved-row anchored menu (below z30 menu). */}
        {state.savedMenuId != null ? (
          <div style={styles.menuCatcher} onClick={() => update({savedMenuId: null})} aria-hidden />
        ) : null}
      </div>
    </div>
  );
}
