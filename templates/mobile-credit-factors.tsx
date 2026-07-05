// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Maya Okafor's Bellwether credit file
 *   (model v3), frozen at 'Updated just now': score 713 of 850 decomposed
 *   into five factors whose contributions cross-check exactly (weights
 *   35+30+15+10+10 = 100; maxPts 193+165+82+55+55 = 550; contributions
 *   185+91+68+41+28 = 413 → 300+413 = 713), twelve months of health
 *   history per factor (last value = current health), a 12-point score
 *   history ending at 713, and 12 alerts (2 unread, matching the tab
 *   badge). No Date.now(), no Math.random(), no network media.
 * @output Bellwether — Credit Factors: a 390px MOBILE credit surface. A
 *   52px navBar (32px compass mark · wordmark ⇄ 28px scoreChip via an
 *   IntersectionObserver sentinel · 44×44 RefreshCw) over a decomposed
 *   gauge dial (five weight-proportioned arc segments, 84/72/36/24/24° =
 *   240°, each a muted track + health-length hue fill, needle at 180.2°
 *   sweep for 713), a 44px score row, five 128px factor cards (icon tile,
 *   pts value, 6px impact bar, detail line, 12-month mini-trend), a
 *   Factors braid of five aligned sparklines sharing ONE scrubber, a
 *   full-bleed Alerts feed with swipe-to-mark-read + Undo, and a
 *   two-detent what-if simulator sheet. Signature move: the simulator's
 *   three levers write deterministic deltas ((68−utilTarget)×0.3,
 *   months/3, close-card −12) that move the needle, ghost band, segment
 *   fills, card deltaBadges, and navBar chip ('735 ▲+22') in lockstep —
 *   closing the sheet reverts every surface because projection overlays
 *   render only while simOpen (lever values persist for reopen).
 * @position Page template; emitted by `astryx template mobile-credit-factors`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, anchored menus) are
 *   position:'absolute' INSIDE shell; the toastDock is sticky-in-flow
 *   (bottom 76, above the 64px tabBar) per the foundations amendment —
 *   shell-absolute would pin to the document bottom on tall tabs.
 *   While the simulator sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} (medium detent leaves the hero dial visible — the
 *   point of the demo) and restores on close.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers); Alerts is the one full-bleed feed
 *   (full-width dividers, no card). No desktop frames, no side asides.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#4F46E5, #A5B4FC); on-brand text is
 *   light-dark(#FFFFFF, #1E1B4B) — white on #4F46E5 = 8.4:1, #1E1B4B on
 *   #A5B4FC = 8.9:1. Health hues are meaningful rest fills, so the
 *   success/warning/error arc+bar fills get explicit light-dark() pairs
 *   at ≥3:1 vs their card/body surfaces (math at each declaration); the
 *   dial's muted capacity tracks stay --color-background-muted per the
 *   spec's explicit passive clause (the health fill + pts/health% text
 *   carry the meaning). Switch OFF track and slider rest track use an
 *   explicit ≥3:1 pair per the batch-2 amendment. Hue is never the sole
 *   encoding: every card states pts + health% in text.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON —
 *   chosen per contract, noted); largeTitle row 52px; tabBar 64px sticky
 *   bottom z20 (4 items flex:1, 24px icon over 11px/500 label, 4px gap;
 *   16px badge pill top:-4 right:-8); rows 44px utility / 56px braid /
 *   72px alert media; factor cards 128px (52px header + 6px bar + detail
 *   + 40px sparkline); heroDial SVG width 100% maxWidth 358; score row
 *   44px (40px/800 numeral); simulator: projected row 64px, control rows
 *   76px, chip-stack row 44px (28px chips), 48px reset; buttons 48
 *   primary / 36 secondary / 44×44 icon. TYPE (Figtree via
 *   --font-family-body): 40/800 score + 34/800 projected (the two
 *   sanctioned oversizes) · 28/700 largeTitle · 17/600 nav+sheet titles ·
 *   16/400–500 body · 15/700 scoreChip · 13/400 secondary · 11/500
 *   overlines+badges; nothing under 11px; tabular-nums on every updating
 *   numeral. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   full-row (braid card + alert rows use the merge clause); every
 *   gesture has a visible button path (44×44 ellipsis per alert row,
 *   ±steppers beside the slider, clickable grabber + X, slider-role
 *   keyboard scrub on the braid).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals: dial SVG width:'100%' maxWidth
 *   358 marginInline auto (viewBox scaling keeps all arc math intact at
 *   320); factor names ellipsize before the min-content pts column; braid
 *   name column fixed 96px, sparkline flexes, trailing 13px tabular
 *   values fit at 320 (96+44+16×2+gaps ✓); slider rows keep fixed 44px
 *   steppers with the range input flexing between (minWidth 0);
 *   DeltaChipStack wraps at 320 with 8px gaps; tabBar labels never
 *   truncate ('Simulate' ~52px < flex:1 of ≥80px ✓). Sheet detents are
 *   %-based. overflowX:'clip' on shell is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as the
 *   phone experience in a centered 390px column (maxWidth 390,
 *   marginInline auto, borderInline hairline). No adaptive relayout.
 *
 * Spec deviations (noted per brief):
 * - Dial geometry: the spec's radius 120 at center (140,150) puts the
 *   240°-sweep endpoints at y ≈ 210±8 — outside the spec's own 170-high
 *   viewBox. Corrected to radius 100 at center (140,110) (endpoints
 *   y = 160+8 = 168 ≤ 170 ✓, top y = 10−8 = 2 ≥ 0 ✓); every sweep/segment
 *   angle and the ×2.4°/weight law are unchanged.
 * - heroDial block height is the natural ~257px (20+20 paddingBlock +
 *   358×170/280 ≈ 217px SVG) rather than the spec's 280px aggregate,
 *   which does not reconcile with its own viewBox ratio.
 * - Refresh ships the spec's sanctioned instant path ('Updated just now'
 *   + role=status toast); the optional skeleton impersonators are omitted
 *   (they would need an undemonstrable resolve trigger here).
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
  BellIcon,
  CalendarCheckIcon,
  CheckIcon,
  CreditCardIcon,
  FileSearchIcon,
  GaugeIcon,
  HourglassIcon,
  LayersIcon,
  MailOpenIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PercentIcon,
  PlusIcon,
  RefreshCwIcon,
  Rows3Icon,
  SlidersHorizontalIcon,
  TrendingUpIcon,
  XIcon,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Bellwether indigo, per spec).
// #4F46E5 on #FFFFFF ≈ 6.3:1; #A5B4FC on the dark card (~#1C1C1E) ≈ 9.6:1.
const BRAND_ACCENT = 'light-dark(#4F46E5, #A5B4FC)';
// Text over a BRAND_ACCENT fill (spec math, repeated): #FFFFFF on #4F46E5
// = 8.4:1; #1E1B4B on #A5B4FC = 8.9:1 — both clear 4.5:1 at 10–15px.
const ON_BRAND = 'light-dark(#FFFFFF, #1E1B4B)';
// Brand washes: 12% tile/tint wash; 24% ghost projection band (the ghost
// band is a preview overlay ON TOP of the actual hue fill, not a rest
// fill, so the 24% wash is legal — the needle + chips carry the value).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
const BRAND_GHOST_24 = `color-mix(in srgb, ${BRAND_ACCENT} 24%, transparent)`;
// HEALTH HUES — meaningful rest fills (arc segments, impact bars) and
// 13px chip/status text, so every pair passes BOTH ≥3:1 vs the white/dark
// card surface (fill law) and 4.5:1 for text use:
// success  #15803D on #FFFFFF ≈ 5.0:1 · #4ADE80 on #1C1C1E ≈ 8.9:1
// warning  #B45309 on #FFFFFF ≈ 4.8:1 · #FBBF24 on #1C1C1E ≈ 9.8:1
// error    #B91C1C on #FFFFFF ≈ 5.9:1 · #F87171 on #1C1C1E ≈ 5.6:1
const HUE_SUCCESS = 'light-dark(#15803D, #4ADE80)';
const HUE_WARNING = 'light-dark(#B45309, #FBBF24)';
const HUE_ERROR = 'light-dark(#B91C1C, #F87171)';
// Interactive rest surfaces (batch-2 amendment: switch OFF track + slider
// unfilled track need ≥3:1 vs their ACTUAL surface — the sheet card):
// #767676 on #FFFFFF = 4.5:1; #8E8E93 on #1C1C1E ≈ 5.4:1.
const REST_TRACK = 'light-dark(#767676, #8E8E93)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the restyled native
// range input (6px track, 24px thumb, 44px hit via input height), the
// visually-hidden h1, and the reduced-motion guard. Transitions animate
// transform/opacity only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const BW_CSS = `
.bw-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.bw-btn:disabled { cursor: default; }
.bw-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.bw-anim { transition: transform 300ms ease; }
.bw-fade { transition: opacity 200ms ease; }
@keyframes bw-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.bw-sheet-in { animation: bw-sheet-in 240ms ease; }
.bw-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Restyled native range — 6px track via a gradient set in --bw-fill,
   24px brand thumb, 44px-tall hit area from the input's own height. */
.bw-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  min-width: 0;
  height: 44px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}
.bw-range::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    ${BRAND_ACCENT} 0%,
    ${BRAND_ACCENT} var(--bw-fill, 100%),
    ${REST_TRACK} var(--bw-fill, 100%),
    ${REST_TRACK} 100%
  );
}
.bw-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  margin-top: -9px;
  border-radius: 50%;
  border: none;
  background: ${BRAND_ACCENT};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.bw-range::-moz-range-track {
  height: 6px;
  border-radius: 999px;
  background: ${REST_TRACK};
}
.bw-range::-moz-range-progress {
  height: 6px;
  border-radius: 999px;
  background: ${BRAND_ACCENT};
}
.bw-range::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: ${BRAND_ACCENT};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.bw-range:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .bw-anim, .bw-fade { transition: none; }
  .bw-sheet-in { animation: none; }
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
  // Longhands only — shell already sets overflowX, and React warns when a
  // shorthand (overflow) fights a longhand across rerenders.
  shellLocked: {height: '100dvh', overflowY: 'hidden', overflowX: 'clip'},
  // Desktop stage ≥720px container width: centered 390px phone column.
  shellDesktop: {
    maxWidth: 390,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline always on.
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
  navLead: {display: 'flex', justifyContent: 'flex-start'},
  navTrail: {display: 'flex', justifyContent: 'flex-end'},
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  // 32px compass-mark brand tile (8px radius per the card icon-tile law).
  brandTile: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: ON_BRAND,
  },
  // Center slot — wordmark and scoreChip stacked; opacity crossfade
  // (already an opacity swap, so reduced motion needs no branch).
  navCenter: {position: 'relative', display: 'grid', placeItems: 'center', minWidth: 96},
  wordmark: {fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap'},
  navLayer: {gridArea: '1 / 1', display: 'grid', placeItems: 'center'},
  // scoreChip — 28px pill inside a 44px-tall hit area; a real button that
  // scrolls the hero back into view (or returns to the Score tab).
  scoreChipHit: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  scoreChip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 15,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Simulation flip: BRAND fill + ON_BRAND text (8.4:1 / 8.9:1, above).
  scoreChipSim: {
    background: BRAND_ACCENT,
    color: ON_BRAND,
    border: `1px solid ${BRAND_ACCENT}`,
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
  // SCORE SCREEN ------------------------------------------------------------
  heroDial: {
    paddingBlock: 20,
    paddingInline: 16,
    display: 'flex',
    justifyContent: 'center',
  },
  dialSvg: {width: '100%', maxWidth: 358, height: 'auto', display: 'block'},
  sentinel: {height: 1},
  // 44px score row — 40px/800 tabular numeral + 13px caption + trailing
  // 12-month score sparkline (caption-only use per spec).
  scoreRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
  },
  scoreNum: {fontSize: 40, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums'},
  scoreSub: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  scoreSpark: {flexShrink: 0, color: BRAND_ACCENT},
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  cardStack: {display: 'flex', flexDirection: 'column', gap: 12},
  // FACTOR CARD — 128px: 52px header + 6px bar + detail + 40px sparkline.
  factorCard: {
    marginInline: 16,
    minHeight: 128,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  factorHeader: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
  },
  factorIconTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
  },
  factorName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  factorPts: {
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  factorPtsStruck: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    textDecoration: 'line-through',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // deltaBadge — 28px-class chip, hue text on hairline chip (4.5:1 pairs
  // documented at the HUE_* declarations).
  deltaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 22,
    paddingInline: 8,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // 6px impact bar — radius 999; muted capacity track (passive per spec
  // clause), hue fill length = health%.
  impactTrack: {
    height: 6,
    marginInline: 16,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  impactFill: {height: '100%', borderRadius: 999},
  factorDetail: {
    margin: '8px 16px 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  factorSpark: {height: 40, margin: '4px 16px 8px'},
  terminalCaption: {
    margin: '16px 16px 24px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // FACTORS SCREEN — largeTitle + braid + month readout.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  braidHeader: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  braidHint: {fontWeight: 400, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  braidRows: {position: 'relative'},
  braidRow: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  braidName: {
    width: 96,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  braidSpark: {flex: 1, minWidth: 0, height: 36},
  braidValue: {
    width: 44,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  // Shared scrubber — 1.5px BRAND rule across all five rows; left is pure
  // CSS math over the shared plot box (16+96+8 inset, 16+44+8 trailing).
  scrubRule: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: 1.5,
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  readoutRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  readoutName: {flex: 1, minWidth: 0, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  readoutValue: {fontSize: 16, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // ALERTS — full-bleed feed, 72px media rows, full-width dividers.
  alertOuter: {position: 'relative'},
  alertClip: {position: 'relative', overflow: 'hidden'},
  alertAction: {
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
    background: BRAND_ACCENT,
    color: ON_BRAND,
    fontSize: 13,
    fontWeight: 600,
  },
  alertContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-body)',
    touchAction: 'pan-y',
  },
  alertRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  alertIconTile: {
    position: 'relative',
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // 8px unread dot inside the 40px tile; 2px body ring separates it from
  // the glyph underneath.
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 999,
    background: BRAND_ACCENT,
    border: '2px solid var(--color-background-body)',
    boxSizing: 'content-box',
  },
  alertText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  alertTitle: {
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  alertMeta: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  feedDivider: {height: 1, background: 'var(--color-border)'},
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
  },
  allCaption: {
    margin: '16px 0 24px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Anchored menu (alert ellipsis fallback) — z30, below sheet scrim z40.
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    minWidth: 200,
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
  menuRowText: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  // TAB BAR — exactly 64px, 4 items flex:1.
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
    color: ON_BRAND,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow (amendment), 76px above the shell bottom
  // so it clears the 64px tabBar + 12px; zero height so it takes no flow.
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
  toastText: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
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
  // SIMULATOR SHEET — scrim z40 + sheet z41, two %-based detents.
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 16, paddingTop: 0},
  // Projected row 64px — 17/600 label · 34/800 tabular score · total chip.
  projectedRow: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  projectedLabel: {flex: 1, fontSize: 17, fontWeight: 600},
  projectedScore: {fontSize: 34, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums'},
  // Control rows 76px — label line (label + per-lever chip) over control.
  controlRow: {
    height: 76,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 6,
  },
  controlTop: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  controlLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  controlSub: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  controlLine: {display: 'flex', alignItems: 'center', gap: 8},
  stepBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepBtnDisabled: {opacity: 0.35},
  rangeWrap: {flex: 1, minWidth: 0, display: 'flex', alignItems: 'center'},
  // Value pill — 36px tall, 8px radius (cornerMap), tabular.
  valuePill: {
    height: 36,
    minWidth: 56,
    paddingInline: 10,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // deltaChip — 28px, radius 999, hairline border, hue text by sign.
  deltaChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 28,
    paddingInline: 10,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  chipStackRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  eqSign: {fontSize: 16, fontWeight: 600, color: 'var(--color-text-secondary)'},
  totalChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 28,
    paddingInline: 12,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: ON_BRAND,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  resetBtn: {
    width: '100%',
    height: 48,
    marginTop: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  // Switch per the input contract — 51×31 track, 27px thumb; whole row is
  // the role='switch' button. OFF track = REST_TRACK (≥3:1 math above).
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
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
  switchRow: {
    width: '100%',
    height: 76,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  switchText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
};

// ---------------------------------------------------------------------------
// FIXTURES — all arithmetic constructible. Identity consts; dual fields
// (contribution pts + health %); aggregates cross-check exactly:
//   weights 35+30+15+10+10 = 100 ✓
//   maxPts 193+165+82+55+55 = 550 (300+550 = 850 ceiling ✓)
//   contributions 185+91+68+41+28 = 413 → score 300+413 = 713 ✓
//   segment sweeps = weight×2.4°: 84+72+36+24+24 = 240 ✓
// No Math.random, no Date.now.
// ---------------------------------------------------------------------------

const USER = 'Maya Okafor';
const MODEL_VERSION = 'v3';
const SCORE_FLOOR = 300;
const POINT_POOL = 550; // 300+550 = 850 ✓

type FactorId = 'payment' | 'utilization' | 'age' | 'mix' | 'inquiries';

interface Factor {
  id: FactorId;
  name: string;
  weightPct: number;
  sweepDeg: number; // weightPct × 2.4
  maxPts: number;
  contribution: number;
  health: number; // round-half-up(contribution/maxPts×100)
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  detail: string;
  icon: LucideIcon;
  trend: number[]; // 12 months of health, last = current
}

// Health cross-checks: 185/193 = 95.9 → 96 ✓ · 91/165 = 55.2 → 55 ✓ ·
// 68/82 = 82.9 → 83 ✓ · 41/55 = 74.5 → 75 (half-up) ✓ · 28/55 = 50.9 → 51 ✓.
// Detail-line checks: 115/120 = 95.8 → 96 ✓ · $4,896/$7,200 = 0.68 ✓.
// Hue thresholds: health ≥80 → success, 55–79 → warning, <55 → error —
// so payment/age green, utilization/mix amber, inquiries red.
const FACTORS: Factor[] = [
  {
    id: 'payment',
    name: 'Payment history',
    weightPct: 35,
    sweepDeg: 84,
    maxPts: 193,
    contribution: 185,
    health: 96,
    status: 'Excellent',
    detail: '115 of 120 payments on time',
    icon: CalendarCheckIcon,
    trend: [92, 92, 93, 93, 94, 94, 95, 95, 95, 96, 96, 96],
  },
  {
    id: 'utilization',
    name: 'Credit utilization',
    weightPct: 30,
    sweepDeg: 72,
    maxPts: 165,
    contribution: 91,
    health: 55,
    status: 'Fair',
    detail: '$4,896 of $7,200 total limit — 68% utilization',
    icon: PercentIcon,
    trend: [72, 70, 66, 63, 60, 58, 60, 57, 56, 54, 56, 55],
  },
  {
    id: 'age',
    name: 'Age of credit',
    weightPct: 15,
    sweepDeg: 36,
    maxPts: 82,
    contribution: 68,
    health: 83,
    status: 'Good',
    detail: 'Avg age 6y 4m · oldest card 11y 2m',
    icon: HourglassIcon,
    trend: [78, 78, 79, 79, 80, 80, 81, 81, 82, 82, 83, 83],
  },
  {
    id: 'mix',
    name: 'Credit mix',
    weightPct: 10,
    sweepDeg: 24,
    maxPts: 55,
    contribution: 41,
    health: 75,
    status: 'Good',
    // Step in the trend = auto loan added Oct 25 (alert a6 cross-ref).
    detail: '2 of 3 account types — no installment loan',
    icon: LayersIcon,
    trend: [68, 68, 68, 75, 75, 75, 75, 75, 75, 75, 75, 75],
  },
  {
    id: 'inquiries',
    name: 'New inquiries',
    weightPct: 10,
    sweepDeg: 24,
    maxPts: 55,
    contribution: 28,
    health: 51,
    status: 'Poor',
    // Each trend drop = one hard pull (a2 is the most recent).
    detail: '3 hard inquiries in 12 months',
    icon: FileSearchIcon,
    trend: [70, 70, 64, 64, 58, 58, 58, 51, 51, 51, 51, 51],
  },
];

// 300 + (185+91+68+41+28) = 713 — derived, not typed twice.
const SCORE = SCORE_FLOOR + FACTORS.reduce((sum, f) => sum + f.contribution, 0);

const MONTHS = [
  {short: 'Jul 25', long: 'July 2025'},
  {short: 'Aug 25', long: 'August 2025'},
  {short: 'Sep 25', long: 'September 2025'},
  {short: 'Oct 25', long: 'October 2025'},
  {short: 'Nov 25', long: 'November 2025'},
  {short: 'Dec 25', long: 'December 2025'},
  {short: 'Jan 26', long: 'January 2026'},
  {short: 'Feb 26', long: 'February 2026'},
  {short: 'Mar 26', long: 'March 2026'},
  {short: 'Apr 26', long: 'April 2026'},
  {short: 'May 26', long: 'May 2026'},
  {short: 'Jun 26', long: 'June 2026'},
];

// Score-tab caption sparkline only; final value 713 = SCORE ✓. Monthly
// alerts a12/a10/a8/a7 quote Dec 703 / Feb 706 / Apr 710 / May 712 ✓.
const SCORE_HISTORY = [694, 695, 698, 700, 702, 703, 705, 706, 708, 710, 712, 713];

interface AlertFixture {
  id: string;
  icon: LucideIcon;
  title: string;
  meta: string;
  unread: boolean;
}

// 12 alerts, first batch 6; exactly 2 unread (a1, a2) = tab badge '2' ✓.
// a5's $7,200 total limit matches the utilization detail line ✓. a9 is
// the 72px-row truncation stress at 320px.
const ALERTS: AlertFixture[] = [
  {id: 'a1', icon: PercentIcon, title: 'Utilization rose to 68% on Horizon Visa', meta: '2d', unread: true},
  {id: 'a2', icon: FileSearchIcon, title: 'New hard inquiry — Apex Auto Finance', meta: '5d', unread: true},
  {id: 'a3', icon: CalendarCheckIcon, title: 'On-time streak reached 24 months', meta: '1w', unread: false},
  {id: 'a4', icon: TrendingUpIcon, title: 'Monthly update — score up 1 point to 713', meta: '1w', unread: false},
  {
    id: 'a5',
    icon: CreditCardIcon,
    title: 'Limit increase +$1,200 on Horizon Visa — total limit now $7,200',
    meta: '3w',
    unread: false,
  },
  {id: 'a6', icon: LayersIcon, title: 'Credit mix changed — auto loan added', meta: 'Oct 25', unread: false},
  {id: 'a7', icon: TrendingUpIcon, title: 'Monthly update — score 712', meta: 'May 26', unread: false},
  {id: 'a8', icon: TrendingUpIcon, title: 'Monthly update — score 710', meta: 'Apr 26', unread: false},
  {
    id: 'a9',
    icon: CreditCardIcon,
    title: 'Statement balance reported to all three bureaus by Horizon Visa Signature Rewards',
    meta: 'Mar 26',
    unread: false,
  },
  {id: 'a10', icon: TrendingUpIcon, title: 'Monthly update — score 706', meta: 'Feb 26', unread: false},
  {id: 'a11', icon: HourglassIcon, title: 'Average account age crossed 6 years', meta: 'Jan 26', unread: false},
  {id: 'a12', icon: TrendingUpIcon, title: 'Monthly update — score 703', meta: 'Dec 25', unread: false},
];

const ALERT_BATCH = 6;

// ---------------------------------------------------------------------------
// PROJECTION MODEL — pure fn over the three levers; every delta integer by
// construction (round half up = Math.round for these non-negatives):
//   utilDelta   = (68 − utilTarget) × 0.3 → 0,3,6,9,12,15,18 for the
//                 slider stops 68,58,48,38,28,18,8 ✓
//   paymentDelta = onTimeMonths / 3 → 0..4 for 0,3,6,9,12 ✓
//   closeOldestCard → −12 composed as age −9 + mix −3
// CAP CHECK (stress fixture 3): contribution+delta ≤ maxPts for every
// lever — payment 185+4 = 189 ≤ 193 ✓; utilization 91+18 = 109 ≤ 165 ✓
// (projected fill 109/165 = 66% — hue stays warning; success needs ≥80,
// unreachable here). Age close: (68−9)/82 = 72% → green flips amber;
// mix close: (41−3)/55 = 69% stays amber. Canonical demo: util 68→8
// (+18) + 12 months (+4) → 735 (+22); all three levers → 723 (+10) ✓.
// ---------------------------------------------------------------------------

interface Levers {
  utilTarget: number;
  onTimeMonths: number;
  closeOldestCard: boolean;
}

interface Projection {
  deltaByFactor: Record<FactorId, number>;
  utilDelta: number;
  paymentDelta: number;
  closeDelta: number;
  total: number;
  score: number;
}

function project(levers: Levers): Projection {
  const utilDelta = Math.round((68 - levers.utilTarget) * 0.3);
  const paymentDelta = levers.onTimeMonths / 3;
  const ageDelta = levers.closeOldestCard ? -9 : 0;
  const mixDelta = levers.closeOldestCard ? -3 : 0;
  const total = utilDelta + paymentDelta + ageDelta + mixDelta;
  return {
    deltaByFactor: {payment: paymentDelta, utilization: utilDelta, age: ageDelta, mix: mixDelta, inquiries: 0},
    utilDelta,
    paymentDelta,
    closeDelta: ageDelta + mixDelta,
    total,
    score: SCORE + total,
  };
}

/** round-half-up health from a contribution. */
function healthOf(contribution: number, maxPts: number): number {
  return Math.round((contribution / maxPts) * 100);
}

function hueFor(health: number): string {
  return health >= 80 ? HUE_SUCCESS : health >= 55 ? HUE_WARNING : HUE_ERROR;
}

function hueTint(hue: string): string {
  return `color-mix(in srgb, ${hue} 12%, transparent)`;
}

/** '+18' / '−12' / '0' — true minus sign, tabular-safe. */
function fmtSigned(n: number): string {
  return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0';
}

// ---------------------------------------------------------------------------
// DIAL GEOMETRY — 240° sweep. Sweep s ∈ [0,240] maps to math angle
// 210° − s (0° = east, CCW positive): s=0 at the lower-left end, s=240 at
// the lower-right, s=120 at 12 o'clock. Needle sweep for a score =
// ((score−300)/550)×240 → 713 = 180.2°, 735 = 189.8°, 723 = 184.6°.
// Radius corrected to 100 @ (140,110) — see header deviation note.
// ---------------------------------------------------------------------------

const DIAL_CX = 140;
const DIAL_CY = 110;
const DIAL_R = 100;
const DIAL_SW = 16;
const DIAL_SWEEP = 240;

function sweepForScore(score: number): number {
  return ((score - SCORE_FLOOR) / POINT_POOL) * DIAL_SWEEP;
}

function dialPoint(sweep: number, radius: number = DIAL_R): {x: number; y: number} {
  const rad = ((210 - sweep) * Math.PI) / 180;
  return {x: DIAL_CX + radius * Math.cos(rad), y: DIAL_CY - radius * Math.sin(rad)};
}

/** Arc path from sweep a to sweep b (a < b), clockwise in screen space. */
function dialArc(a: number, b: number): string {
  const from = dialPoint(a);
  const to = dialPoint(b);
  const largeArc = b - a > 180 ? 1 : 0;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${DIAL_R} ${DIAL_R} 0 ${largeArc} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

// Cumulative segment starts: payment 0, utilization 84, age 156, mix 192,
// inquiries 216; internal boundaries get the 2px body-color separators.
const SEGMENT_STARTS: number[] = FACTORS.reduce<number[]>((acc, f, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + FACTORS[i - 1].sweepDeg);
  return acc;
}, []);

/** Shared sparkline point mapper — per-series min/max normalized. */
function sparkPoints(values: number[], w: number, h: number, pad: number): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = pad + (i * (w - 2 * pad)) / (values.length - 1);
      const y = h - pad - ((v - min) / span) * (h - 2 * pad);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

// ---------------------------------------------------------------------------
// DECOMPOSED GAUGE DIAL — five weight-proportioned segments (muted track +
// health-length hue fill), 2px body separators at boundaries, needle + hub
// (transform-rotated, 300ms, instant under reduced motion), and in
// projection mode a 24% brand ghost band from actual to projected sweep
// plus a dashed ghost needle at actual. role='img'; needle/segments
// aria-hidden — the computed label carries the meaning.
// ---------------------------------------------------------------------------

interface DialSegmentDisplay {
  id: FactorId;
  startSweep: number;
  sweepDeg: number;
  health: number; // displayed (projected while a scenario is active)
  hue: string;
}

interface GaugeDialProps {
  segments: DialSegmentDisplay[];
  needleSweep: number;
  actualSweep: number;
  projectionActive: boolean;
  ariaLabel: string;
}

function DecomposedGaugeDial({segments, needleSweep, actualSweep, projectionActive, ariaLabel}: GaugeDialProps) {
  const needleTip = dialPoint(0, DIAL_R - 22);
  const ghostFrom = Math.min(actualSweep, needleSweep);
  const ghostTo = Math.max(actualSweep, needleSweep);
  return (
    <svg viewBox="0 0 280 170" style={styles.dialSvg} role="img" aria-label={ariaLabel}>
      <g aria-hidden>
        {segments.map(seg => {
          const end = seg.startSweep + seg.sweepDeg;
          const fillEnd = seg.startSweep + (seg.sweepDeg * seg.health) / 100;
          return (
            <g key={seg.id}>
              {/* Muted capacity track — passive per the spec's explicit
                  clause; the hue fill + on-card text carry the value. */}
              <path d={dialArc(seg.startSweep, end)} stroke="var(--color-background-muted)" strokeWidth={DIAL_SW} strokeLinecap="butt" fill="none" />
              <path d={dialArc(seg.startSweep, fillEnd)} stroke={seg.hue} strokeWidth={DIAL_SW} strokeLinecap="butt" fill="none" />
            </g>
          );
        })}
        {/* Ghost projection band — 24% brand overlay, actual → projected. */}
        {projectionActive && ghostTo - ghostFrom > 0 ? (
          <path d={dialArc(ghostFrom, ghostTo)} stroke={BRAND_GHOST_24} strokeWidth={DIAL_SW} strokeLinecap="butt" fill="none" />
        ) : null}
        {/* 2px background-body separators at internal boundaries. */}
        {SEGMENT_STARTS.slice(1).map(sweep => {
          const inner = dialPoint(sweep, DIAL_R - DIAL_SW / 2 - 3);
          const outer = dialPoint(sweep, DIAL_R + DIAL_SW / 2 + 3);
          return (
            <line
              key={sweep}
              x1={inner.x.toFixed(2)}
              y1={inner.y.toFixed(2)}
              x2={outer.x.toFixed(2)}
              y2={outer.y.toFixed(2)}
              stroke="var(--color-background-body)"
              strokeWidth={2}
            />
          );
        })}
        {/* Dashed ghost needle marks ACTUAL while projecting. */}
        {projectionActive ? (
          <line
            x1={DIAL_CX}
            y1={DIAL_CY}
            x2={needleTip.x.toFixed(2)}
            y2={needleTip.y.toFixed(2)}
            stroke="var(--color-text-secondary)"
            strokeWidth={2}
            strokeDasharray="3 4"
            strokeLinecap="round"
            style={{
              transform: `rotate(${actualSweep}deg)`,
              transformOrigin: `${DIAL_CX}px ${DIAL_CY}px`,
              transformBox: 'view-box',
            }}
          />
        ) : null}
        {/* Needle — 2.5px line + 8px hub; rotate() only (300ms sweep,
            instant under reduced motion via the .bw-anim media guard). */}
        <g
          className="bw-anim"
          style={{
            transform: `rotate(${needleSweep}deg)`,
            transformOrigin: `${DIAL_CX}px ${DIAL_CY}px`,
            transformBox: 'view-box',
          }}>
          <line
            x1={DIAL_CX}
            y1={DIAL_CY}
            x2={needleTip.x.toFixed(2)}
            y2={needleTip.y.toFixed(2)}
            stroke="var(--color-text-primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>
        <circle cx={DIAL_CX} cy={DIAL_CY} r={4} fill="var(--color-text-primary)" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// FACTOR CARD — 52px header (32px icon tile · h2 name · deltaBadge +
// struck-actual while projecting · 17/600 tabular pts) + 6px impact bar
// (scaleX fill — transform-only) + detail line + 40px 12-month sparkline.
// ---------------------------------------------------------------------------

interface FactorCardProps {
  factor: Factor;
  delta: number; // 0 outside projection mode
}

function FactorCard({factor, delta}: FactorCardProps) {
  const projected = delta !== 0;
  const contribution = factor.contribution + delta;
  const health = healthOf(contribution, factor.maxPts);
  const hue = hueFor(health);
  return (
    <section style={styles.factorCard} aria-label={`${factor.name}: ${contribution} of ${factor.maxPts} points, ${health} percent healthy${projected ? `, projected ${fmtSigned(delta)}` : ''}`}>
      <div style={styles.factorHeader}>
        <span style={{...styles.factorIconTile, background: hueTint(hue), color: hue}} aria-hidden>
          <Icon icon={factor.icon} size="md" color="inherit" />
        </span>
        <h2 style={{...styles.factorName, margin: 0}}>{factor.name}</h2>
        {projected ? (
          <span style={{...styles.deltaBadge, color: delta > 0 ? HUE_SUCCESS : HUE_ERROR}}>{fmtSigned(delta)} pts</span>
        ) : null}
        {projected ? <span style={styles.factorPtsStruck}>{factor.contribution}</span> : null}
        <span style={styles.factorPts}>
          {contribution} / {factor.maxPts} pts
        </span>
      </div>
      <div style={styles.impactTrack} aria-hidden>
        <div
          className="bw-anim"
          style={{
            ...styles.impactFill,
            background: hue,
            transform: `scaleX(${health / 100})`,
            transformOrigin: 'left center',
          }}
        />
      </div>
      <p style={{...styles.factorDetail, margin: '8px 16px 0'}}>
        {factor.status} · {health}% · {factor.detail}
      </p>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{...styles.factorSpark, width: 'calc(100% - 32px)'}} aria-hidden>
        <polyline
          points={sparkPoints(factor.trend, 100, 40, 4)}
          fill="none"
          stroke={hueFor(factor.health)}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FACTOR HISTORY BRAID — five aligned 12-month sparklines sharing one
// x-scale and ONE scrubber. The whole card is a single focusable
// role='slider' (merged-target clause): pointer drag snaps the 1.5px
// brand rule to the nearest month; ArrowLeft/Right step, Home/End jump.
// Row layout constants shared with the rule's CSS calc: 16 pad + 96 name
// + 8 gap → plot left 120; 8 gap + 44 value + 16 pad → plot right 68;
// plot width = 100% − 188. Sparkline inner pad 4/100 of the viewBox.
// ---------------------------------------------------------------------------

const BRAID_PLOT_LEFT = 120;
const BRAID_PLOT_INSET = 188;
const SPARK_PAD_FRACTION = 0.04;

interface BraidProps {
  scrubIndex: number;
  onScrub: (index: number) => void;
}

function FactorHistoryBraid({scrubIndex, onScrub}: BraidProps) {
  const draggingRef = useRef(false);

  const scrubFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const plotWidth = rect.width - BRAID_PLOT_INSET;
    if (plotWidth <= 0) return;
    const f = (event.clientX - rect.left - BRAID_PLOT_LEFT) / plotWidth;
    const inner = (f - SPARK_PAD_FRACTION) / (1 - 2 * SPARK_PAD_FRACTION);
    const index = Math.round(inner * (MONTHS.length - 1));
    onScrub(Math.max(0, Math.min(MONTHS.length - 1, index)));
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') onScrub(Math.max(0, scrubIndex - 1));
    else if (event.key === 'ArrowRight') onScrub(Math.min(MONTHS.length - 1, scrubIndex + 1));
    else if (event.key === 'Home') onScrub(0);
    else if (event.key === 'End') onScrub(MONTHS.length - 1);
    else return;
    event.preventDefault();
  };

  // Rule position mirrors the sparkline x mapping in pure CSS calc.
  const fraction = SPARK_PAD_FRACTION + ((1 - 2 * SPARK_PAD_FRACTION) * scrubIndex) / (MONTHS.length - 1);
  const ruleLeft = `calc(${BRAID_PLOT_LEFT}px + (100% - ${BRAID_PLOT_INSET}px) * ${fraction.toFixed(4)})`;

  return (
    <div
      style={styles.listCard}
      className="bw-focusable"
      role="slider"
      tabIndex={0}
      aria-label="Factor history month scrubber"
      aria-valuemin={0}
      aria-valuemax={MONTHS.length - 1}
      aria-valuenow={scrubIndex}
      aria-valuetext={MONTHS[scrubIndex].long}
      onKeyDown={onKeyDown}>
      <div style={styles.braidHeader}>
        <span>{MONTHS[scrubIndex].long}</span>
        <span style={styles.braidHint}>· tap-drag to scrub</span>
      </div>
      <div style={styles.rowDivider} />
      <div
        style={{...styles.braidRows, touchAction: 'pan-y'}}
        onPointerDown={event => {
          draggingRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          scrubFromPointer(event);
        }}
        onPointerMove={event => {
          if (draggingRef.current) scrubFromPointer(event);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}>
        {FACTORS.map((factor, index) => (
          <div key={factor.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <div style={styles.braidRow}>
              <span style={styles.braidName}>{factor.name}</span>
              <svg viewBox="0 0 100 36" preserveAspectRatio="none" style={styles.braidSpark} aria-hidden>
                <polyline
                  points={sparkPoints(factor.trend, 100, 36, 4)}
                  fill="none"
                  stroke={hueFor(factor.health)}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <span style={styles.braidValue}>{factor.trend[scrubIndex]}%</span>
            </div>
          </div>
        ))}
        <div style={{...styles.scrubRule, left: ruleLeft}} aria-hidden />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ALERT ROW — 72px media row; horizontal drag reveals the 72px brand
// mark-read block (snap −72, one open at a time) with the MANDATORY
// visible 44×44 ellipsis opening the same action as an anchored menu.
// ---------------------------------------------------------------------------

interface AlertRowProps {
  alert: AlertFixture;
  unread: boolean;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  reducedMotion: boolean;
  rowRef: (el: HTMLButtonElement | null) => void;
  menuRef: RefObject<HTMLDivElement | null>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onToggleRead: () => void;
}

function AlertRow({
  alert,
  unread,
  isSwipeOpen,
  isMenuOpen,
  reducedMotion,
  rowRef,
  menuRef,
  onSwipeOpen,
  onSwipeClose,
  onToggleMenu,
  onToggleRead,
}: AlertRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const capturedRef = useRef(false);
  const base = isSwipeOpen ? -72 : 0;
  const offset = dragX != null ? Math.max(-72, Math.min(0, base + dragX)) : base;
  const actionLabel = unread ? 'Mark read' : 'Unread';

  // Pointer capture starts only once a real drag begins (>8px) — capturing
  // on pointerdown retargets pointerup to this container, which swallows
  // the child buttons' click events (row tap + ellipsis would go dead).
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    capturedRef.current = false;
    setDragX(0);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - startXRef.current;
    if (Math.abs(dx) > 8) {
      movedRef.current = true;
      if (!capturedRef.current) {
        capturedRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (dragX == null) return;
    const settled = Math.max(-72, Math.min(0, base + dragX));
    setDragX(null);
    if (movedRef.current) {
      if (settled < -36) onSwipeOpen();
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

  return (
    <div style={styles.alertOuter}>
      <div style={styles.alertClip}>
        <button type="button" className="bw-btn" style={styles.alertAction} tabIndex={isSwipeOpen ? 0 : -1} aria-hidden={!isSwipeOpen} onClick={onToggleRead}>
          <Icon icon={unread ? MailOpenIcon : BellIcon} size="md" color="inherit" />
          {actionLabel}
        </button>
        <div
          style={{
            ...styles.alertContent,
            transform: offset !== 0 ? `translateX(${offset}px)` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 240ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            ref={rowRef}
            className="bw-btn bw-focusable"
            style={styles.alertRowBtn}
            aria-label={`${alert.title}, ${alert.meta}${unread ? ', unread' : ''}`}
            onClick={guardClick(onToggleMenu)}>
            <span style={styles.alertIconTile} aria-hidden>
              <Icon icon={alert.icon} size="md" color="inherit" />
              {unread ? <span style={styles.unreadDot} /> : null}
            </span>
            <span style={styles.alertText}>
              <span style={{...styles.alertTitle, fontWeight: unread ? 600 : 400}}>{alert.title}</span>
              <span style={styles.alertMeta}>{unread ? 'Unread · ' : ''}{alert.meta}</span>
            </span>
          </button>
          <button
            type="button"
            className="bw-btn bw-focusable"
            style={styles.iconBtn}
            aria-label={`Actions for ${alert.title}`}
            aria-expanded={isMenuOpen}
            onClick={guardClick(onToggleMenu)}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div ref={menuRef} role="menu" aria-label={`Actions for ${alert.title}`} style={{...styles.anchoredMenu, top: 60}}>
          <button type="button" role="menuitem" className="bw-btn bw-focusable" style={styles.menuRow} onClick={onToggleRead}>
            <Icon icon={unread ? MailOpenIcon : BellIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>{unread ? 'Mark read' : 'Mark unread'}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FOCUS + MEASUREMENT UTILITIES
// ---------------------------------------------------------------------------

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [role="switch"]');
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

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
 * wrapper can tell the 390px mobile stage from the desktop stage.
 */
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns scroll. */
function findScroller(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node != null) {
    const overflowY = window.getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return null;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 20px compass glyph on the 32px brand tile.
// ---------------------------------------------------------------------------

function CompassMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandTile}>
        <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.6" />
          <path d="M13.2 6.8 L11.1 11.1 L6.8 13.2 L8.9 8.9 Z" fill="currentColor" />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SIMULATOR SHEET — two-detent dialog. Grabber is a real 'Resize sheet'
// button (click toggles medium⇄large; drag between detents is garnish,
// >120px past medium closes). Escape/scrim/X all close; focus restores to
// the Simulate tabItem on every close path. Lever values persist across
// close — projection overlays revert anyway because they render only
// while simOpen (the non-destructive 'closing reverts every surface').
// ---------------------------------------------------------------------------

const UTIL_MIN = 8;
const UTIL_MAX = 68;
const UTIL_STEP = 10;
const MONTHS_MAX = 12;
const MONTHS_STEP = 3;

interface SimulatorSheetProps {
  detent: 'medium' | 'large';
  levers: Levers;
  projection: Projection;
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onLevers: (patch: Partial<Levers>) => void;
  onReset: () => void;
  onClose: () => void;
}

function SimulatorSheet({
  detent,
  levers,
  projection,
  reducedMotion,
  sheetRef,
  closeBtnRef,
  onDetentChange,
  onLevers,
  onReset,
  onClose,
}: SimulatorSheetProps) {
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

  const {utilTarget, onTimeMonths, closeOldestCard} = levers;
  const {utilDelta, paymentDelta, closeDelta, total} = projection;
  const fillPct = ((utilTarget - UTIL_MIN) / (UTIL_MAX - UTIL_MIN)) * 100;
  const leverChips = [
    {id: 'util', delta: utilDelta},
    {id: 'payment', delta: paymentDelta},
    {id: 'close', delta: closeDelta},
  ].filter(chip => chip.delta !== 0);
  const translate = dragY != null && dragY > 0 ? `translateY(${dragY}px)` : undefined;

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bw-sim-title"
      tabIndex={-1}
      className="bw-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="bw-btn bw-focusable"
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
        <h2 id="bw-sim-title" style={styles.sheetTitle}>
          What-if simulator
        </h2>
        <button type="button" ref={closeBtnRef} className="bw-btn bw-focusable" style={styles.iconBtn} aria-label="Close simulator" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        {/* Projected row 64px — score reads actual when total = 0
            (stress fixture 2: zero-delta open shows no chips, no flip). */}
        <div style={styles.projectedRow}>
          <span style={styles.projectedLabel}>Projected</span>
          <span style={styles.projectedScore}>{projection.score}</span>
          {total !== 0 ? (
            <span style={{...styles.deltaChip, color: total > 0 ? HUE_SUCCESS : HUE_ERROR}}>{fmtSigned(total)} pts</span>
          ) : null}
        </div>
        <div style={{...styles.rowDivider, marginInlineStart: 0}} />

        {/* Lever 1 — utilization slider, min 8 / max 68 / step 10. */}
        <div style={styles.controlRow}>
          <div style={styles.controlTop}>
            <span style={styles.controlLabel}>Target utilization</span>
            {utilDelta !== 0 ? <span style={{...styles.deltaChip, color: HUE_SUCCESS}}>{fmtSigned(utilDelta)} pts</span> : null}
          </div>
          <div style={styles.controlLine}>
            <button
              type="button"
              className="bw-btn bw-focusable"
              style={{...styles.stepBtn, ...(utilTarget <= UTIL_MIN ? styles.stepBtnDisabled : null)}}
              aria-label="Decrease target utilization"
              disabled={utilTarget <= UTIL_MIN}
              onClick={() => onLevers({utilTarget: Math.max(UTIL_MIN, utilTarget - UTIL_STEP)})}>
              <Icon icon={MinusIcon} size="md" color="inherit" />
            </button>
            <span style={styles.rangeWrap}>
              <input
                type="range"
                className="bw-range"
                min={UTIL_MIN}
                max={UTIL_MAX}
                step={UTIL_STEP}
                value={utilTarget}
                aria-label="Target utilization"
                aria-valuetext={`Target utilization ${utilTarget} percent, adds ${utilDelta} points`}
                style={{'--bw-fill': `${fillPct}%`} as CSSProperties}
                onChange={event => onLevers({utilTarget: Number(event.target.value)})}
              />
            </span>
            <button
              type="button"
              className="bw-btn bw-focusable"
              style={{...styles.stepBtn, ...(utilTarget >= UTIL_MAX ? styles.stepBtnDisabled : null)}}
              aria-label="Increase target utilization"
              disabled={utilTarget >= UTIL_MAX}
              onClick={() => onLevers({utilTarget: Math.min(UTIL_MAX, utilTarget + UTIL_STEP)})}>
              <Icon icon={PlusIcon} size="md" color="inherit" />
            </button>
            <span style={styles.valuePill}>{utilTarget}%</span>
          </div>
        </div>

        {/* Lever 2 — on-time months stepper, 0..12 by 3. */}
        <div style={styles.controlRow}>
          <div style={styles.controlTop}>
            <span style={styles.controlLabel}>On-time months ahead</span>
            {paymentDelta !== 0 ? <span style={{...styles.deltaChip, color: HUE_SUCCESS}}>{fmtSigned(paymentDelta)} pts</span> : null}
          </div>
          <div style={styles.controlLine}>
            <button
              type="button"
              className="bw-btn bw-focusable"
              style={{...styles.stepBtn, ...(onTimeMonths <= 0 ? styles.stepBtnDisabled : null)}}
              aria-label="Decrease on-time months"
              disabled={onTimeMonths <= 0}
              onClick={() => onLevers({onTimeMonths: Math.max(0, onTimeMonths - MONTHS_STEP)})}>
              <Icon icon={MinusIcon} size="md" color="inherit" />
            </button>
            <span
              style={{...styles.valuePill, flex: 1}}
              className="bw-focusable"
              role="spinbutton"
              tabIndex={0}
              aria-label="On-time months ahead"
              aria-valuemin={0}
              aria-valuemax={MONTHS_MAX}
              aria-valuenow={onTimeMonths}
              aria-valuetext={`${onTimeMonths} months, adds ${paymentDelta} points`}
              onKeyDown={event => {
                if (event.key === 'ArrowUp') onLevers({onTimeMonths: Math.min(MONTHS_MAX, onTimeMonths + MONTHS_STEP)});
                else if (event.key === 'ArrowDown') onLevers({onTimeMonths: Math.max(0, onTimeMonths - MONTHS_STEP)});
                else return;
                event.preventDefault();
              }}>
              {onTimeMonths} mo
            </span>
            <button
              type="button"
              className="bw-btn bw-focusable"
              style={{...styles.stepBtn, ...(onTimeMonths >= MONTHS_MAX ? styles.stepBtnDisabled : null)}}
              aria-label="Increase on-time months"
              disabled={onTimeMonths >= MONTHS_MAX}
              onClick={() => onLevers({onTimeMonths: Math.min(MONTHS_MAX, onTimeMonths + MONTHS_STEP)})}>
              <Icon icon={PlusIcon} size="md" color="inherit" />
            </button>
          </div>
        </div>

        {/* Lever 3 — close-oldest-card switch; the WHOLE 76px row is the
            role='switch' button. OFF track REST_TRACK ≥3:1 (math at the
            declaration); ON track brand. */}
        <button
          type="button"
          className="bw-btn bw-focusable"
          style={styles.switchRow}
          role="switch"
          aria-checked={closeOldestCard}
          onClick={() => onLevers({closeOldestCard: !closeOldestCard})}>
          <span style={styles.switchText}>
            <span style={styles.controlLabel}>Close oldest card</span>
            <span style={styles.controlSub}>Oldest card 11y 2m — age −9 · mix −3</span>
          </span>
          {closeDelta !== 0 ? <span style={{...styles.deltaChip, color: HUE_ERROR}}>{fmtSigned(closeDelta)} pts</span> : null}
          <span style={{...styles.switchTrack, background: closeOldestCard ? BRAND_ACCENT : REST_TRACK}} aria-hidden>
            <span className="bw-anim" style={{...styles.switchThumb, transform: closeOldestCard ? 'translateX(20px)' : undefined}} />
          </span>
        </button>

        <div style={{...styles.rowDivider, marginInlineStart: 0}} />
        {/* DeltaChipStack — per-lever chips (zero-delta levers absent),
            '=' + brand total chip. Wraps at 320 with 8px gaps. */}
        {leverChips.length > 0 ? (
          <div style={styles.chipStackRow}>
            {leverChips.map(chip => (
              <span key={chip.id} style={{...styles.deltaChip, color: chip.delta > 0 ? HUE_SUCCESS : HUE_ERROR}}>
                {fmtSigned(chip.delta)}
              </span>
            ))}
            <span style={styles.eqSign} aria-hidden>
              =
            </span>
            <span style={styles.totalChip}>{fmtSigned(total)} pts</span>
          </div>
        ) : (
          <div style={{...styles.chipStackRow, fontSize: 13, color: 'var(--color-text-secondary)'}}>
            Move a lever to preview its score impact
          </div>
        )}
        <button type="button" className="bw-btn bw-focusable" style={styles.resetBtn} onClick={onReset}>
          Reset scenario
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — ONE state owner; every surface derives from it. Simulate is a
// launcher (aria-haspopup dialog inside the tablist — sanctioned pattern
// exception, commented at the markup), not a screen.
// ---------------------------------------------------------------------------

type TabId = 'score' | 'factors' | 'alerts';

interface ToastState {
  seq: number;
  text: string;
  undoAlertId: string | null;
  status: boolean;
}

interface AppState {
  tab: TabId;
  heroCollapsed: boolean;
  scrubIndex: number;
  simOpen: boolean;
  simDetent: 'medium' | 'large';
  utilTarget: number;
  onTimeMonths: number;
  closeOldestCard: boolean;
  alertsShown: number;
  unreadById: Record<string, boolean>;
  swipeOpenId: string | null;
  alertMenuId: string | null;
  toast: ToastState | null;
}

const INITIAL: AppState = {
  tab: 'score',
  heroCollapsed: false,
  scrubIndex: MONTHS.length - 1,
  simOpen: false,
  simDetent: 'medium',
  utilTarget: UTIL_MAX,
  onTimeMonths: 0,
  closeOldestCard: false,
  alertsShown: ALERT_BATCH,
  unreadById: Object.fromEntries(ALERTS.map(alert => [alert.id, alert.unread])),
  swipeOpenId: null,
  alertMenuId: null,
  toast: null,
};

const TAB_DEFS: Array<{id: TabId; label: string; icon: LucideIcon}> = [
  {id: 'score', label: 'Score', icon: GaugeIcon},
  {id: 'factors', label: 'Factors', icon: Rows3Icon},
];

export default function MobileCreditFactorsTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [app, setApp] = useState<AppState>(INITIAL);
  const update = useCallback((patch: Partial<AppState>) => {
    setApp(a => ({...a, ...patch}));
  }, []);

  // Refs — focus plumbing + measurement.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const simTabRef = useRef<HTMLButtonElement | null>(null);
  const alertMenuRef = useRef<HTMLDivElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const alertRowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pendingFocusIdRef = useRef<string | null>(null);
  const scrollByTabRef = useRef<Record<TabId, number>>({score: 0, factors: 0, alerts: 0});
  const toastSeqRef = useRef(0);

  const toastPatch = (text: string, undoAlertId: string | null = null, status = false): Partial<AppState> => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undoAlertId, status}};
  };

  // Derived — projection surfaces key on simOpen (+ nonzero deltas).
  const levers: Levers = {utilTarget: app.utilTarget, onTimeMonths: app.onTimeMonths, closeOldestCard: app.closeOldestCard};
  const projection = project(levers);
  const projectionActive = app.simOpen && projection.total !== 0;
  const actualSweep = sweepForScore(SCORE); // 180.2° for 713
  const needleSweep = projectionActive ? sweepForScore(projection.score) : actualSweep;
  const displayedScore = projectionActive ? projection.score : SCORE;
  const segments: DialSegmentDisplay[] = FACTORS.map((factor, index) => {
    const delta = app.simOpen ? projection.deltaByFactor[factor.id] : 0;
    const health = delta !== 0 ? healthOf(factor.contribution + delta, factor.maxPts) : factor.health;
    return {id: factor.id, startSweep: SEGMENT_STARTS[index], sweepDeg: factor.sweepDeg, health, hue: hueFor(health)};
  });
  const dialLabel = `${projectionActive ? 'Projected credit score' : 'Credit score'} ${displayedScore} of 850. ${segments
    .map((seg, i) => `${FACTORS[i].name} ${seg.health} percent healthy`)
    .join(', ')}.`;
  const unreadCount = ALERTS.reduce((sum, alert) => sum + (app.unreadById[alert.id] ? 1 : 0), 0);
  const chipVisible = app.tab !== 'score' || app.heroCollapsed;
  const chipLabel = projectionActive ? `${projection.score} ${projection.total > 0 ? '▲' : '▼'}${fmtSigned(projection.total)}` : `${SCORE}`;

  // Hero-collapse sentinel — IO drives heroCollapsed on the Score tab.
  useEffect(() => {
    if (app.tab !== 'score') return undefined;
    const sentinel = sentinelRef.current;
    if (sentinel == null || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry != null) setApp(a => (a.heroCollapsed === !entry.isIntersecting ? a : {...a, heroCollapsed: !entry.isIntersecting}));
      },
      {rootMargin: '-52px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [app.tab]);

  // Focus into the opening sheet — preventScroll (amendment: plain focus
  // scroll-reveals the animating sheet inside the locked column).
  useEffect(() => {
    if (app.simOpen) {
      sheetCloseRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [app.simOpen]);

  // Anchored alert menu focuses its item on open.
  useEffect(() => {
    if (app.alertMenuId != null) alertMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [app.alertMenuId]);

  // 'Show 6 more' moves focus to the first appended row (a7).
  useEffect(() => {
    if (pendingFocusIdRef.current != null) {
      alertRowRefs.current[pendingFocusIdRef.current]?.focus({preventScroll: true});
      pendingFocusIdRef.current = null;
    }
  }, [app.alertsShown]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setApp(a => {
        if (a.alertMenuId != null) {
          menuOpenerRef.current?.focus();
          return {...a, alertMenuId: null};
        }
        if (a.simOpen) {
          simTabRef.current?.focus();
          return {...a, simOpen: false, simDetent: 'medium'};
        }
        return a;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // TAB NAVIGATION — per-tab scroll persistence; re-tap scrolls to top;
  // overlays close on switch (toast persists).
  const scrollTo = (top: number) => {
    const scroller = findScroller(shellRef.current);
    if (scroller != null) scroller.scrollTop = top;
    else window.scrollTo(0, top);
  };
  const currentScrollTop = () => {
    const scroller = findScroller(shellRef.current);
    return scroller != null ? scroller.scrollTop : window.scrollY;
  };
  const selectTab = (next: TabId) => {
    if (next === app.tab) {
      scrollTo(0);
      return;
    }
    scrollByTabRef.current[app.tab] = currentScrollTop();
    update({tab: next, simOpen: false, simDetent: 'medium', swipeOpenId: null, alertMenuId: null});
    const restore = scrollByTabRef.current[next];
    requestAnimationFrame(() => scrollTo(restore));
  };

  // SIMULATOR lifecycle — Simulate tabItem is the launcher/restore target.
  const openSim = () => {
    update({simOpen: true, simDetent: 'medium', swipeOpenId: null, alertMenuId: null});
  };
  const closeSim = () => {
    update({simOpen: false, simDetent: 'medium'});
    simTabRef.current?.focus();
  };
  const resetScenario = () => {
    setApp(a => ({...a, utilTarget: UTIL_MAX, onTimeMonths: 0, closeOldestCard: false, ...toastPatch('Scenario reset')}));
  };

  // ALERTS — undo-over-confirm: mark-read executes immediately + Undo.
  const setUnread = (id: string, unread: boolean, toast: Partial<AppState>) => {
    setApp(a => ({...a, unreadById: {...a.unreadById, [id]: unread}, swipeOpenId: null, alertMenuId: null, ...toast}));
  };
  const toggleRead = (id: string) => {
    const wasUnread = app.unreadById[id];
    if (wasUnread) setUnread(id, false, toastPatch('Marked read', id));
    else setUnread(id, true, toastPatch('Marked unread'));
    menuOpenerRef.current?.focus();
  };
  const undoMarkRead = (id: string) => {
    setUnread(id, true, toastPatch('Restored — marked unread'));
  };
  const loadMoreAlerts = () => {
    pendingFocusIdRef.current = ALERTS[ALERT_BATCH].id; // a7
    setApp(a => ({...a, alertsShown: ALERTS.length, ...toastPatch('6 more loaded')}));
  };

  const refresh = () => {
    setApp(a => ({...a, ...toastPatch('Score refreshed — updated just now', null, true)}));
  };

  const chipClick = () => {
    if (app.tab !== 'score') selectTab('score');
    else scrollTo(0);
  };

  // Tablist arrow keys rove across all four items (Simulate included as
  // the sanctioned aria-haspopup launcher inside the tablist).
  const onTabBarKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === 'ArrowRight' ? index + 1 : index - 1;
    items[(next + items.length) % items.length]?.focus();
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(app.simOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const visibleAlerts = ALERTS.slice(0, app.alertsShown);

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{BW_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLead}>
            <CompassMark />
          </div>
          <div style={styles.navCenter}>
            {/* Wordmark ⇄ scoreChip — opacity crossfade (already an
                opacity swap, so reduced motion needs no branch). */}
            <span className="bw-fade" style={{...styles.navLayer, ...styles.wordmark, opacity: chipVisible ? 0 : 1}} aria-hidden={chipVisible}>
              Bellwether
            </span>
            <span className="bw-fade" style={{...styles.navLayer, opacity: chipVisible ? 1 : 0, pointerEvents: chipVisible ? 'auto' : 'none'}}>
              <button
                type="button"
                className="bw-btn bw-focusable"
                style={styles.scoreChipHit}
                aria-label={projectionActive ? `Projected score ${projection.score}, ${fmtSigned(projection.total)} — back to score` : `Score ${SCORE} — back to score`}
                tabIndex={chipVisible ? 0 : -1}
                onClick={chipClick}>
                <span style={{...styles.scoreChip, ...(projectionActive ? styles.scoreChipSim : null)}}>{chipLabel}</span>
              </button>
            </span>
          </div>
          <div style={styles.navTrail}>
            <button type="button" className="bw-btn bw-focusable" style={styles.iconBtn} aria-label="Refresh score" onClick={refresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {app.tab === 'score' ? (
            <>
              <h1 className="bw-vh">Score — {USER}</h1>
              <div style={styles.heroDial}>
                <DecomposedGaugeDial
                  segments={segments}
                  needleSweep={needleSweep}
                  actualSweep={actualSweep}
                  projectionActive={projectionActive}
                  ariaLabel={dialLabel}
                />
              </div>
              <div ref={sentinelRef} style={styles.sentinel} aria-hidden />
              <div style={styles.scoreRow}>
                <span style={styles.scoreNum}>{displayedScore}</span>
                <span style={styles.scoreSub}>of 850 · Updated just now</span>
                <svg
                  width={72}
                  height={28}
                  viewBox="0 0 72 28"
                  style={styles.scoreSpark}
                  role="img"
                  aria-label={`Score trend, last 12 months: ${SCORE_HISTORY[0]} to ${SCORE_HISTORY[SCORE_HISTORY.length - 1]}`}>
                  <polyline
                    points={sparkPoints(SCORE_HISTORY, 72, 28, 3)}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div style={styles.sectionHeader}>Factors</div>
              <div style={styles.cardStack}>
                {FACTORS.map(factor => (
                  <FactorCard key={factor.id} factor={factor} delta={app.simOpen ? projection.deltaByFactor[factor.id] : 0} />
                ))}
              </div>
              <p style={styles.terminalCaption}>Weights per Bellwether model {MODEL_VERSION} · fixed</p>
            </>
          ) : null}

          {app.tab === 'factors' ? (
            <>
              <h1 style={styles.largeTitle}>Factors</h1>
              <FactorHistoryBraid scrubIndex={app.scrubIndex} onScrub={index => update({scrubIndex: index})} />
              <div style={styles.sectionHeader}>{MONTHS[app.scrubIndex].long} readout</div>
              <div style={styles.listCard}>
                {FACTORS.map((factor, index) => (
                  <div key={factor.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.readoutRow}>
                      <span style={styles.readoutName}>{factor.name}</span>
                      <span style={styles.readoutValue}>{factor.trend[app.scrubIndex]}% healthy</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{height: 24}} />
            </>
          ) : null}

          {app.tab === 'alerts' ? (
            <>
              <h1 style={styles.largeTitle}>Alerts</h1>
              <div>
                {visibleAlerts.map(alert => (
                  <div key={alert.id}>
                    <div style={styles.feedDivider} />
                    <AlertRow
                      alert={alert}
                      unread={app.unreadById[alert.id]}
                      isSwipeOpen={app.swipeOpenId === alert.id}
                      isMenuOpen={app.alertMenuId === alert.id}
                      reducedMotion={reducedMotion}
                      rowRef={el => {
                        alertRowRefs.current[alert.id] = el;
                      }}
                      menuRef={alertMenuRef}
                      onSwipeOpen={() => update({swipeOpenId: alert.id, alertMenuId: null})}
                      onSwipeClose={() => {
                        if (app.swipeOpenId === alert.id) update({swipeOpenId: null});
                      }}
                      onToggleMenu={opener => {
                        menuOpenerRef.current = opener;
                        update({alertMenuId: app.alertMenuId === alert.id ? null : alert.id, swipeOpenId: null});
                      }}
                      onToggleRead={() => toggleRead(alert.id)}
                    />
                  </div>
                ))}
                <div style={styles.feedDivider} />
                {app.alertsShown < ALERTS.length ? (
                  <button type="button" className="bw-btn bw-focusable" style={styles.loadMoreRow} onClick={loadMoreAlerts}>
                    Show {ALERTS.length - app.alertsShown} more
                  </button>
                ) : (
                  <p style={styles.allCaption}>All {ALERTS.length} alerts</p>
                )}
              </div>
            </>
          ) : null}
        </main>

        {/* THE one polite live region — sticky dock 76px above the shell
            bottom (12px over the 64px tabBar). No auto-dismiss timers:
            the toast persists until the next mutation replaces it. */}
        <div style={styles.toastDock} aria-live="polite">
          {app.toast != null ? (
            <div key={app.toast.seq} style={styles.toast} className="bw-fade" role={app.toast.status ? 'status' : undefined}>
              <span style={styles.toastText}>{app.toast.text}</span>
              {app.toast.undoAlertId != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="bw-btn bw-focusable" style={styles.toastUndo} onClick={() => undoMarkRead(app.toast!.undoAlertId!)}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} role="tablist" aria-label="Bellwether sections" onKeyDown={onTabBarKeyDown}>
          {TAB_DEFS.map(tab => {
            const isActive = app.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className="bw-btn bw-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                </span>
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
          {/* Simulate is a LAUNCHER inside the tablist (aria-haspopup
              dialog, not a tab) — commented per the a11y plan; it tints
              active only while the sheet is open. */}
          <button
            type="button"
            ref={simTabRef}
            aria-haspopup="dialog"
            aria-expanded={app.simOpen}
            className="bw-btn bw-focusable"
            style={{...styles.tabItem, ...(app.simOpen ? styles.tabItemActive : null)}}
            onClick={openSim}>
            <span style={styles.tabIconWrap}>
              <Icon icon={SlidersHorizontalIcon} size="lg" color="inherit" />
            </span>
            <span style={{...styles.tabLabel, ...(app.simOpen ? styles.tabLabelActive : null)}}>Simulate</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={app.tab === 'alerts'}
            className="bw-btn bw-focusable"
            style={{...styles.tabItem, ...(app.tab === 'alerts' ? styles.tabItemActive : null)}}
            onClick={() => selectTab('alerts')}>
            <span style={styles.tabIconWrap}>
              <Icon icon={BellIcon} size="lg" color="inherit" />
              {/* Badge unmounts at zero — never renders '0'. */}
              {unreadCount > 0 ? <span style={styles.tabBadge}>{unreadCount}</span> : null}
            </span>
            <span style={{...styles.tabLabel, ...(app.tab === 'alerts' ? styles.tabLabelActive : null)}}>Alerts</span>
          </button>
        </nav>

        {app.simOpen ? <div style={styles.sheetScrim} onClick={closeSim} aria-hidden /> : null}
        {app.simOpen ? (
          <SimulatorSheet
            detent={app.simDetent}
            levers={levers}
            projection={projection}
            reducedMotion={reducedMotion}
            sheetRef={sheetRef}
            closeBtnRef={sheetCloseRef}
            onDetentChange={detent => update({simDetent: detent})}
            onLevers={patch => update(patch)}
            onReset={resetScenario}
            onClose={closeSim}
          />
        ) : null}
      </div>
    </div>
  );
}
