// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — one fictional dark-sky night
 *   (Fri, Aug 14) for Skyshed, precomputed on a minutes-after-19:30 scale
 *   (T0 1170, DOMAIN 660): twilight boundaries 42/74/114/156 and mirrored
 *   dawn 528/570/610/642; a 62% waning-gibbous moon rising 250 (11:40 PM)
 *   and setting 565 (4:55 AM); 11 hourly cloud points summing to 255 →
 *   avg 23%; best window 335–425 (1:05–2:35 AM, 90 min, center 380);
 *   six targets whose transit = (rise+set)/2 exactly and whose washoutMax
 *   = round(62·(1−sep/180)); three sites (Pine Hollow Overlook B4 12°,
 *   Dry Lake Flats B3 3°, Backyard B6 22°). No Date.now(), no
 *   Math.random(), no network media.
 * @output Skyshed — Stargazing Tonight: a 390px MOBILE tonight-only
 *   observatory card. One scrubbable viewTime (role=slider playhead on a
 *   96px NightArcTimeline of stacked twilight bands, a 12px moon band,
 *   and an SVG cloud ridge) drives EVERY consumer: the navBar countdown
 *   pill re-anchors 'Dark in…'/'Dark for…'/'Dawn at 4:18 AM', the
 *   half-dome SkyDomeChart re-projects alt/az for all marks, per-target
 *   MoonWashout/Horizon meters fill and drain, the Targets tab resorts by
 *   vis(viewTime), and 'UP AT <time>' recounts. Tabs Tonight/Targets/
 *   Sites; a two-detent site sheet with per-site horizonMiniBars swaps
 *   obstruction into the dome ridge + meters; reminder bells execute
 *   immediately (undo-over-confirm) planting ReminderAlertChips + toast.
 * @position Page template; emitted by `astryx template mobile-stargazing-tonight`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet) are position:'absolute' INSIDE
 *   shell; position:fixed is banned. While the site sheet is open, shell
 *   locks to {height:'100dvh', overflow:'hidden'} and restores on close;
 *   focus enters the sheet with focus({preventScroll:true}). The toast
 *   dock is STICKY-IN-FLOW (bottom 76, height 0) per the foundations
 *   amendment — shell-absolute would pin to the document bottom on tall
 *   scrolling views.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers); no desktop Layout frames, no side
 *   asides, no multi-column tables. The sheet body is the one legal
 *   inner scroller.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#5B5BD6, #A5A6F6) (#5B5BD6 on white 6.9:1;
 *   #A5A6F6 on the ~#1C1C1E dark card 7.7:1). Twilight bands, moon band,
 *   meter fills, dome strokes, and radio boundaries are explicit
 *   light-dark() pairs with ≥3:1 math at each declaration — hairline
 *   tokens are reserved for passive separators only (foundations
 *   amendment).
 * Density grid (MOBILE, repeated verbatim): stage 390 fluid 320–430 ·
 *   16px screen gutter · 12px card gaps · 24px section gaps · 8px chip
 *   gaps; navBar 52px sticky top z20 (paddingInline 8, grid
 *   '1fr auto 1fr'); tabBar 64px sticky bottom z20, 3 tabItems (24px
 *   icon / 11px 500 label / 4px gap); rows 44px utility / 60px two-line /
 *   72px site / 88px TargetVisibilityRow; sectionHeader 13/600 uppercase
 *   0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px bottom;
 *   NightArcTimeline strip 96px; SkyDomeChart viewBox '0 0 326 200';
 *   stat tiles 3-across 8px gaps (value 16/600 tabular over 11/500
 *   overline). TYPE (Figtree via --font-family-body): 17/600 nav + card
 *   titles (28px large title deliberately unused — compact nav only,
 *   noted choice) · 16/400–600 body · 13/400 meta · 11/500 overlines +
 *   tab labels; nothing under 11px; tabular-nums on every updating
 *   numeral. Buttons 48px primary (sheet footer) / 36px secondary
 *   (steppers, Best window — 36px visuals centered in 44px-tall hits) /
 *   44×44 icon buttons. navBar hairline ALWAYS ON (noted per template).
 *
 * Responsive contract:
 * - Fluid 320–430: zero width:390 literals; timeline bands + playhead
 *   are percent-positioned (fraction·100%), cloud path + dome scale via
 *   viewBox; stat tiles stay 3-across (~80px each at 320 — '6h 12m'
 *   fits); countdown pill maxWidth 132 ('Dark for 6h 12m' worst case);
 *   TargetVisibilityRow meters flex, trailing vis%+bell column fixed
 *   76px. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout per spec.
 *
 * Deviations from spec (all noted inline too):
 * - MoonWashoutMeter light fill #8E8FD9 → #8386D6: the spec hex is
 *   2.96:1 on the white card, a hair under the binding ≥3:1 amendment;
 *   #8386D6 is 3.4:1 (dark side #7375C9 kept, 4.2:1).
 * - MOON stat tile renders overline 'MOON 62%' over value '5h 15m'
 *   (spec: value '62% · 5h 15m') — the combined value is ~100px at
 *   16/600 tabular and cannot fit the 80px tile at the 320px stage.
 * - toastDock is sticky-in-flow (amendment) rather than the spec's
 *   absolute bottom:76.
 * - ReminderAlertChip is ONE merged 44px-hit remove button (X glyph
 *   trailing) per the 44px merge clause — a separate 16px X inside the
 *   pill cannot carry its own 44px hit without overlapping the chip.
 * - TargetVisibilityRow body tap (accessible name = target name) snaps
 *   viewTime to the target's transit (clamped to the domain) — the spec
 *   names the button but no verb; jump-to-transit makes the displayed
 *   transit an affordance.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, RefObject} from 'react';

import {
  BellIcon,
  BellRingIcon,
  CheckIcon,
  MountainIcon,
  OrbitIcon,
  SatelliteIcon,
  SparkleIcon,
  SparklesIcon,
  StarIcon,
  TelescopeIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math. Dark-card assumptions match the suite (~#1C1C1E, L≈0.013).
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Skyshed indigo). #5B5BD6 on #FFFFFF ≈
// 6.9:1; #A5A6F6 on the dark card ≈ 7.7:1 — both clear 4.5:1 for 13px text.
const BRAND_ACCENT = 'light-dark(#5B5BD6, #A5A6F6)';
// Text/glyphs over a BRAND_ACCENT fill. Light: #FFFFFF on #5B5BD6 ≈ 5.3:1.
// Dark: white on #A5A6F6 fails (~2.2:1), so the dark side flips to a deep
// indigo — #14143A on #A5A6F6 ≈ 8.0:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #14143A)';
// 14% brand wash for the countdown pill + reminder chips; BRAND_ACCENT
// 13/600 text on the washed card still ≈ 6.4:1 light / 7.1:1 dark.
const BRAND_TINT_14 = `color-mix(in srgb, ${BRAND_ACCENT} 14%, transparent)`;
// TWILIGHT BANDS — meaningful fills (NOT hairline tokens), an indigo ramp.
// Light sides vs the white card: #6F7AC2 4.0:1 · #5A64B0 5.4:1 · #454E97
// 7.2:1 · #333A7A 9.6:1 · #232858 12.5:1. Dark sides vs the ~#1C1C1E card
// (fills lighten as the scheme darkens so the dimmest band stays legible):
// #A6ADEC 7.9:1 · #8F97E0 6.3:1 · #7A82D0 4.8:1 · #6870C0 3.7:1 · #5C64BA
// 3.2:1 — every band ≥3:1 vs its actual surface.
const BAND_DAY = 'light-dark(#6F7AC2, #A6ADEC)';
const BAND_CIVIL = 'light-dark(#5A64B0, #8F97E0)';
const BAND_NAUTICAL = 'light-dark(#454E97, #7A82D0)';
const BAND_ASTRO = 'light-dark(#333A7A, #6870C0)';
const BAND_DARK = 'light-dark(#232858, #5C64BA)';
// Moon band (spec pair) rides the strip bottom OVER the band fills; its
// 1px top edge guarantees the boundary where fill-vs-fill contrast dips
// (#4A4C8F vs #5C64BA ≈ 1.5:1 in dark scheme).
const MOON_BAND = 'light-dark(#C9CCF0, #4A4C8F)';
const MOON_BAND_EDGE = 'light-dark(#7A7FD6, #C3C5F5)';
// 11px '62%' label on the moon band: #2F3170 on #C9CCF0 ≈ 7.4:1; #E4E5FB
// on #4A4C8F ≈ 6.1:1.
const MOON_BAND_TEXT = 'light-dark(#2F3170, #E4E5FB)';
// Cloud ridge along the strip top: white stroke over the dark light-mode
// bands (≥5:1 vs every band); near-black #0E1030 over the lightened
// dark-mode bands (3.5:1 vs the dimmest #5C64BA).
const CLOUD_LINE = 'light-dark(#FFFFFF, #0E1030)';
const CLOUD_FILL = 'light-dark(rgba(255, 255, 255, 0.30), rgba(14, 16, 48, 0.38))';
// Best-window outline sits ON the band fills, so it uses the inverted
// brand ramp: #A5A6F6 on the darkest light-mode band #232858 ≈ 6.3:1;
// #16173F on the dark-mode dark band #5C64BA ≈ 3.2:1. (Spec said 1px
// BRAND_ACCENT; inverted for ≥3:1 vs the ACTUAL band surface — deviation
// with math.)
const BEST_OUTLINE = 'light-dark(#A5A6F6, #16173F)';
// METER TRACKS (spec pair) — passive gauge backgrounds; the MEANINGFUL
// encoding is the fill length, and both fills are ≥3:1 vs the card AND
// vs the track (math at each fill).
const METER_TRACK = 'light-dark(rgba(21, 17, 12, 0.10), rgba(255, 255, 255, 0.14))';
// MoonWashoutMeter fill — desaturated brand. Light #8386D6 on the white
// card 3.4:1 (spec's #8E8FD9 was 2.96:1, under the ≥3:1 amendment —
// deviation noted in the header); dark #7375C9 on the dark card 4.2:1.
const WASHOUT_FILL = 'light-dark(#8386D6, #7375C9)';
// HorizonMeter fill (spec pair): #2F855A on white 4.5:1; #68C89A on the
// dark card 8.3:1.
const HORIZON_FILL = 'light-dark(#2F855A, #68C89A)';
// Dome chart strokes — interactive-adjacent chart boundaries, explicit
// pairs (never --color-text, which does not exist; never hairline
// tokens). Horizon line: #4A4460 on white 9.0:1; #B9B4D6 on dark ≈ 7.6:1.
const HORIZON_LINE = 'light-dark(#4A4460, #B9B4D6)';
// Dome arc + decorative field stars: #8B87A8 on white 3.4:1; #6E6A8E on
// the dark card 3.3:1.
const DOME_ARC = 'light-dark(#8B87A8, #6E6A8E)';
// Ridge obstruction fill (meaningful): #3E3A52 on white 11.4:1; #6B677F
// on the dark card 3.1:1.
const RIDGE_FILL = 'light-dark(#3E3A52, #6B677F)';
// Cluster/star marks in the dome: #8C6A00 on white 5.0:1; #EFCD6A on the
// dark card ≈ 10:1.
const STAR_GOLD = 'light-dark(#8C6A00, #EFCD6A)';
// Moon disc in the dome (band pair is too faint on the white card):
// #6B6DC4 on white 4.6:1; #C9CCF0 on the dark card ≈ 10:1.
const MOON_DISC = 'light-dark(#6B6DC4, #C9CCF0)';
// Unselected radio boundary — an INTERACTIVE control boundary, so an
// explicit ≥3:1 pair per the amendment (never --color-border): #6E6B7A
// on the white card 5.2:1; #9C99B0 on the dark card 5.3:1.
const RADIO_BORDER = 'light-dark(#6E6B7A, #9C99B0)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Chrome blur surface (navBar / tabBar / sheet footer).
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, meter/sheet motion,
// the BestWindow pulse, and the reduced-motion guard (pulse REMOVED, meter
// widths + sheet slide instant; static ring/color still encodes state).
// ---------------------------------------------------------------------------

const SKYSHED_CSS = `
.sks-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.sks-btn:disabled { cursor: default; }
.sks-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.sks-meter { transition: width 240ms ease; }
.sks-fade { transition: opacity 240ms ease; }
@keyframes sks-sheet-in {
  from { transform: translateY(32px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.sks-sheet-in { animation: sks-sheet-in 240ms ease; }
@keyframes sks-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.15; }
}
.sks-pulse { animation: sks-pulse 1.6s ease-in-out infinite; }
.sks-vh {
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
  .sks-meter, .sks-fade { transition: none; }
  .sks-sheet-in { animation: none; }
  .sks-pulse { animation: none; }
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
  // Scroll lock while the site sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellCentered: {
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
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {fontSize: 17, fontWeight: 600, whiteSpace: 'nowrap'},
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  // countdownPill — 28px pill in a 44px-tall slot; maxWidth 132 ('Dark for
  // 6h 12m' worst case fits at 13/600 tabular, never truncates).
  countdownHit: {height: 44, display: 'flex', alignItems: 'center'},
  countdownPill: {
    height: 28,
    maxWidth: 132,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    background: BRAND_TINT_14,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
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
  paddedCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 16,
  },
  cardStack: {display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12},
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // CONDITIONS CARD — 60px header row + 3-across stat tiles.
  condHeader: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  condText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  condName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  condSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  changeBtn: {
    height: 44,
    minWidth: 44,
    paddingInline: 16,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  statRow: {display: 'flex', gap: 8, padding: '0 16px 16px'},
  statTile: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '10px 4px',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // CARD TITLE ROWS — 17/600 + trailing 16/600 tabular readout.
  cardTitleRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  timeReadout: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  // NIGHT ARC TIMELINE — 96px strip, radius 8; bands/playhead are
  // percent-positioned so the strip is fluid 320–430.
  tlStrip: {
    position: 'relative',
    height: 96,
    borderRadius: 8,
    overflow: 'hidden',
    touchAction: 'none',
    cursor: 'pointer',
  },
  tlBand: {position: 'absolute', top: 0, bottom: 0},
  tlMoonBand: {
    position: 'absolute',
    bottom: 0,
    height: 12,
    background: MOON_BAND,
    borderTop: `1px solid ${MOON_BAND_EDGE}`,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 6,
  },
  tlMoonLabel: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1,
    color: MOON_BAND_TEXT,
    fontVariantNumeric: 'tabular-nums',
  },
  tlCloudSvg: {position: 'absolute', top: 0, left: 0, width: '100%', height: 28, display: 'block'},
  tlBestWindow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    border: `1.5px solid ${BEST_OUTLINE}`,
    borderRadius: 4,
    pointerEvents: 'none',
  },
  tlPlayheadLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  // 16px knob disc centered in a 44×44 slider hit.
  tlKnobHit: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    touchAction: 'none',
  },
  tlKnob: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    border: '2px solid var(--color-background-card)',
    boxShadow: '0 1px 4px var(--color-shadow)',
  },
  tlAxis: {position: 'relative', height: 16, marginTop: 4},
  tlAxisTick: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Controls row: −30m / +30m steppers + Best window — 36px visual pills
  // centered inside 44px-tall button hits (44px rule).
  controlsRow: {display: 'flex', alignItems: 'center', gap: 8, marginTop: 8},
  ctlBtn: {height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  ctlPill: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  ctlSpacer: {flex: 1},
  bestWinWrap: {position: 'relative', display: 'grid', placeItems: 'center', height: 44},
  bestWinPill: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    color: BRAND_ACCENT,
  },
  pulseRing: {
    position: 'absolute',
    inset: 1,
    borderRadius: 14,
    border: `1.5px solid ${BRAND_ACCENT}`,
    pointerEvents: 'none',
  },
  domeSvg: {display: 'block', width: '100%', height: 'auto'},
  // BEST WINDOW CARD.
  bwTitle: {fontSize: 16, fontWeight: 500, margin: 0, fontVariantNumeric: 'tabular-nums'},
  bwSub: {
    marginTop: 2,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  bwHead: {display: 'flex', alignItems: 'flex-start', gap: 8},
  bwHeadText: {flex: 1, minWidth: 0},
  jumpWrap: {position: 'relative', display: 'grid', placeItems: 'center', height: 44, flexShrink: 0},
  jumpBtn: {
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  chipRail: {display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12},
  // ReminderAlertChip — 28px pill centered in a 44px-tall merged remove
  // button (whole chip = the X's hit; merge clause of the 44px rule).
  chipHit: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  chip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    background: BRAND_TINT_14,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  chipEmpty: {fontSize: 13, color: 'var(--color-text-secondary)', paddingBlock: 4},
  // TARGET VISIBILITY ROW — 88px; body button + sibling 44×44 bell
  // (siblings, never nested buttons).
  tRow: {display: 'flex', alignItems: 'stretch', minHeight: 88},
  tRowBtn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0 10px 16px',
  },
  typeDisc: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  tMid: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3},
  tName: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '19px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tSub: {
    fontSize: 13,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  meterLine: {display: 'flex', alignItems: 'center', gap: 8, height: 12},
  meterLabel: {
    width: 78,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    lineHeight: 1,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  meterTrack: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    background: METER_TRACK,
    overflow: 'hidden',
  },
  meterFillWash: {height: '100%', borderRadius: 999, background: WASHOUT_FILL},
  meterFillHorizon: {height: '100%', borderRadius: 999, background: HORIZON_FILL},
  // Trailing column fixed 76px: vis% over the 44×44 bell.
  tTrail: {
    width: 76,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInlineEnd: 4,
  },
  visPct: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  bellBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  bellOn: {color: BRAND_ACCENT},
  // 44px loadMore-style row ('See all 6 targets').
  seeAllRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SITE ROWS — 72px, radio pattern; 40px Bortle disc + two-line +
  // trailing 13px meta.
  siteRow: {
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  radioOff: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: '50%',
    border: `2px solid ${RADIO_BORDER}`,
  },
  radioOn: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
  },
  bortleDisc: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  siteMid: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  siteName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  siteSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  siteMeta: {
    flexShrink: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // horizonMiniBar (sheet rows) — obstruction 0–30° visualized.
  miniBarLine: {display: 'flex', alignItems: 'center', gap: 8, marginTop: 4},
  miniBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    background: METER_TRACK,
    overflow: 'hidden',
  },
  miniBarFill: {height: '100%', borderRadius: 999, background: RIDGE_FILL},
  miniBarLabel: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // SHEET — scrim z40 + sheet z41, two detents.
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
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 0 8px'},
  sheetSiteRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '14px 16px',
  },
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  useBtn: {
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
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // TOAST — sticky-in-flow dock (height 0, bottom 76 = 64px tabBar + 12)
  // per the foundations amendment; always mounted for aria-live.
  toastAnchor: {
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
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
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
  // TAB BAR — exactly 64px, 3 tabs flex 1.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    height: 64,
    background: CHROME_SURFACE,
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
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px'},
  tabLabelActive: {fontWeight: 600},
};

// ---------------------------------------------------------------------------
// FIXTURES — all ephemeris precomputed constants; zero Date.now(), zero
// randomness. Minute scale: minutes after 19:30 (T0 1170), domain 0–660.
// Cross-check ledger (verified by hand before shipping):
//   countdown at viewTime 22 → 156−22 = 134 = 2h 14m ✓
//   dark 528−156 = 372 = 6h 12m ✓ · moon up 565−250 = 315 = 5h 15m ✓
//   moonless dark 250−156 = 94 = 1h 34m ✓
//   avg cloud 255/11 = 23.18 → 23% ✓ (sum of the literal 11-value array)
//   best window 425−335 = 90 = 1h 30m, center 380 = 1:50 AM ✓
//   every transit = (rise+set)/2 exactly (fixtures divide evenly) ✓
//   washoutMax = round(62·(1−sep/180)): sep 34→50.3→50 · 58→42.0→42 ·
//   121→20.3→20 · 88→31.7→32 · 102→26.9→27 ✓
//   'UP AT 1:50 AM' count 5 = targets with alt(380)>0 (all but ISS) ✓
// ---------------------------------------------------------------------------

const NIGHT_LABEL = 'Fri, Aug 14';
const T0 = 1170; // 19:30 in minutes-from-midnight
const DOMAIN = 660; // 19:30 → 06:30
const INITIAL_VIEW_TIME = 22; // 7:52 PM

// Twilight boundaries (minutes after 19:30): sunset 20:12, civil 20:44,
// nautical 21:24, astro-dark 22:06→04:18, then mirrored dawn.
const DARK_START = 156;
const DARK_END = 528;

interface TwilightBand {
  id: string;
  from: number;
  to: number;
  fill: string;
}

const TWILIGHT_BANDS: TwilightBand[] = [
  {id: 'day-pm', from: 0, to: 42, fill: BAND_DAY},
  {id: 'civil-pm', from: 42, to: 74, fill: BAND_CIVIL},
  {id: 'naut-pm', from: 74, to: 114, fill: BAND_NAUTICAL},
  {id: 'astro-pm', from: 114, to: 156, fill: BAND_ASTRO},
  {id: 'dark', from: 156, to: 528, fill: BAND_DARK},
  {id: 'astro-am', from: 528, to: 570, fill: BAND_ASTRO},
  {id: 'naut-am', from: 570, to: 610, fill: BAND_NAUTICAL},
  {id: 'civil-am', from: 610, to: 642, fill: BAND_CIVIL},
  {id: 'day-am', from: 642, to: 660, fill: BAND_DAY},
];

// Moon: 62% waning gibbous, rise 23:40 = 250, set 4:55 AM = 565. MAX_ALT
// 35 is chosen so alt(380) = 35·sin(π·130/315) = 33.7 → 34° — the
// bestWindowCard's 'moon 34°' sub-line reconciles.
const MOON_RISE = 250;
const MOON_SET = 565;
const MOON_ILLUM = 62;
const MOON_MAX_ALT = 35;

// Best window 1:05–2:35 AM.
const BEST_START = 335;
const BEST_END = 425;
const BEST_CENTER = 380; // 1:50 AM

// 11 hourly cloud points 20:00→06:00 (minutes 30…630, step 60).
// Sum = 255 → avg 23.18 → the '23%' stat tile (cross-checked).
const CLOUD_POINTS = [44, 36, 28, 20, 15, 12, 10, 12, 18, 26, 34];
const CLOUD_T0 = 30;
const CLOUD_STEP = 60;

// Axis ticks at 20:00 / 23:00 / 02:00 / 05:00 (x-min 30/210/390/570).
const AXIS_TICKS = [
  {t: 30, label: '20:00'},
  {t: 210, label: '23:00'},
  {t: 390, label: '02:00'},
  {t: 570, label: '05:00'},
];

type TargetKind = 'planet' | 'cluster' | 'star' | 'satellite';
type TargetId = 'saturn' | 'jupiter' | 'm13' | 'm31' | 'albireo' | 'iss';

interface SkyTarget {
  id: TargetId;
  name: string;
  chipName: string;
  kind: TargetKind;
  riseMin: number; // may be negative (rose before 19:30) or >660 (sets after)
  setMin: number;
  transitMin: number; // (rise+set)/2 — verified per row
  transitLabel: string;
  maxAlt: number;
  moonSepDeg: number | null;
  washoutMax: number; // round(62·(1−sep/180)) — verified per row
  reminderAtMin: number; // precomputed obstruction-clear (Pine Hollow 12°)
  reminderLabel: string;
  subLine: string;
}

const TARGETS: SkyTarget[] = [
  {
    id: 'saturn',
    name: 'Saturn',
    chipName: 'Saturn',
    kind: 'planet',
    riseMin: 138,
    setMin: 654,
    transitMin: 396, // (138+654)/2 = 396 ✓ → 2:06 AM
    transitLabel: '2:06 AM',
    maxAlt: 46,
    moonSepDeg: 34,
    washoutMax: 50, // round(62·(1−34/180)) = round(50.29) ✓
    reminderAtMin: 181, // clears the 12° ridge at 22:31 (rise+43m)
    reminderLabel: '10:31 PM',
    subLine: 'Transit 2:06 AM · 46° max',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    chipName: 'Jupiter',
    kind: 'planet',
    riseMin: 290,
    setMin: 910, // sets after dawn — display clamps to the domain
    transitMin: 600, // (290+910)/2 = 600 ✓ → 5:30 AM
    transitLabel: '5:30 AM',
    maxAlt: 58,
    moonSepDeg: 58,
    washoutMax: 42, // round(62·(1−58/180)) = round(42.02) ✓
    reminderAtMin: 331, // clears the ridge at 1:01 AM
    reminderLabel: '1:01 AM',
    subLine: 'Transit 5:30 AM · 58° max',
  },
  {
    id: 'm13',
    name: 'M13 · Hercules Cluster',
    chipName: 'M13',
    kind: 'cluster',
    riseMin: -320, // rose 14:10, long before the domain
    setMin: 480,
    transitMin: 80, // (−320+480)/2 = 80 ✓ → 8:50 PM
    transitLabel: '8:50 PM',
    maxAlt: 74,
    moonSepDeg: 121,
    washoutMax: 20, // round(62·(1−121/180)) = round(20.32) ✓
    reminderAtMin: 156, // already clear — reminder lands at dark, 22:06
    reminderLabel: '10:06 PM',
    subLine: 'Transit 8:50 PM · 74° max',
  },
  {
    id: 'm31',
    name: 'M31 · Andromeda Galaxy',
    chipName: 'M31',
    kind: 'cluster',
    riseMin: 60,
    setMin: 920,
    transitMin: 490, // (60+920)/2 = 490 ✓ → 3:40 AM
    transitLabel: '3:40 AM',
    maxAlt: 68,
    moonSepDeg: 88,
    washoutMax: 32, // round(62·(1−88/180)) = round(31.69) ✓
    reminderAtMin: 222, // clears the ridge at 11:12 PM
    reminderLabel: '11:12 PM',
    subLine: 'Transit 3:40 AM · 68° max',
  },
  {
    id: 'albireo',
    name: 'Albireo',
    chipName: 'Albireo',
    kind: 'star',
    riseMin: -190,
    setMin: 570, // sets 5:00 AM — scrub past it and the row drains (stress)
    transitMin: 190, // (−190+570)/2 = 190 ✓ → 10:40 PM
    transitLabel: '10:40 PM',
    maxAlt: 71,
    moonSepDeg: 102,
    washoutMax: 27, // round(62·(1−102/180)) = round(26.87) ✓
    reminderAtMin: 156, // already clear — reminder lands at dark, 22:06
    reminderLabel: '10:06 PM',
    subLine: 'Transit 10:40 PM · 71° max',
  },
  {
    id: 'iss',
    name: 'ISS pass',
    chipName: 'ISS pass',
    kind: 'satellite',
    riseMin: 104, // single 6-minute pass, 9:14–9:20 PM
    setMin: 110,
    transitMin: 107, // (104+110)/2 = 107 ✓ — 54° max at 9:17 PM
    transitLabel: '9:17 PM',
    maxAlt: 54,
    moonSepDeg: null, // washout n/a — pass ends before moonrise
    washoutMax: 0,
    reminderAtMin: 104,
    reminderLabel: '9:14 PM',
    subLine: 'Pass 9:14–9:20 PM · 54° max',
  },
];

const TARGET_BY_ID = Object.fromEntries(TARGETS.map(t => [t.id, t])) as Record<TargetId, SkyTarget>;

type SiteId = 'pine-hollow' | 'dry-lake' | 'backyard';

interface Site {
  id: SiteId;
  name: string;
  bortle: number;
  drive: string;
  obstructionDeg: number;
  obstructionLabel: string;
  elevation: string;
}

const SITES: Site[] = [
  {
    id: 'pine-hollow',
    name: 'Pine Hollow Overlook', // longest site string — sheet-row stress
    bortle: 4,
    drive: '38 min',
    obstructionDeg: 12,
    obstructionLabel: 'Ridge E 12°',
    elevation: '2,340 ft',
  },
  {
    id: 'dry-lake',
    name: 'Dry Lake Flats',
    bortle: 3,
    drive: '1h 12m',
    obstructionDeg: 3,
    obstructionLabel: 'Horizon 3°',
    elevation: '4,180 ft',
  },
  {
    id: 'backyard',
    name: 'Backyard', // 22° obstruction — Saturn-never-clears stress
    bortle: 6,
    drive: '0 min',
    obstructionDeg: 22,
    obstructionLabel: 'Houses S 22°',
    elevation: '1,120 ft',
  },
];

const SITE_BY_ID = Object.fromEntries(SITES.map(s => [s.id, s])) as Record<SiteId, Site>;

// ---------------------------------------------------------------------------
// PURE EPHEMERIS MATH — every consumer re-derives from viewTime through
// these; alt() is guarded outside [rise, set] so domain edges 0/660 clamp
// cleanly (no NaN).
// ---------------------------------------------------------------------------

/** Minutes-after-19:30 → '1:50 AM' (12-hour clock). */
function fmtClock(t: number): string {
  const total = (T0 + t) % 1440;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Duration minutes → '2h 14m' / '6h 12m' / '45m'. */
function fmtDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Altitude at t: maxAlt·sin(π·(t−rise)/(set−rise)); 0 outside [rise,set]. */
function altAt(target: {riseMin: number; setMin: number; maxAlt: number}, t: number): number {
  if (t <= target.riseMin || t >= target.setMin) return 0;
  return target.maxAlt * Math.sin((Math.PI * (t - target.riseMin)) / (target.setMin - target.riseMin));
}

/** Deterministic azimuth model: east (70°) at rise → west (290°) at set. */
function azAt(target: {riseMin: number; setMin: number}, t: number): number {
  const frac = (t - target.riseMin) / (target.setMin - target.riseMin);
  return 70 + Math.min(1, Math.max(0, frac)) * 220;
}

/** Moon altitude at t (same sine model, MOON_MAX_ALT 35). */
function moonAltAt(t: number): number {
  return altAt({riseMin: MOON_RISE, setMin: MOON_SET, maxAlt: MOON_MAX_ALT}, t);
}

/**
 * Washout %, 0–washoutMax: 0 while the moon is down, ramping 0→1 over
 * 250→290 after moonrise and draining 1→0 over 525→565 before moonset.
 */
function washoutAt(target: SkyTarget, t: number): number {
  if (target.washoutMax === 0 || t <= MOON_RISE || t >= MOON_SET) return 0;
  const ramp = Math.min(1, (t - MOON_RISE) / 40);
  const drain = t > 525 ? (MOON_SET - t) / 40 : 1;
  return target.washoutMax * ramp * drain;
}

/** Cloud % at t — linear interpolation of the 11 hourly points. */
function cloudAt(t: number): number {
  const clamped = Math.min(CLOUD_T0 + CLOUD_STEP * (CLOUD_POINTS.length - 1), Math.max(CLOUD_T0, t));
  const idx = Math.min(CLOUD_POINTS.length - 2, Math.floor((clamped - CLOUD_T0) / CLOUD_STEP));
  const frac = (clamped - CLOUD_T0 - idx * CLOUD_STEP) / CLOUD_STEP;
  return CLOUD_POINTS[idx] + frac * (CLOUD_POINTS[idx + 1] - CLOUD_POINTS[idx]);
}

/** vis% = round(alt·(100−washout)·(100−cloud)/10000), 0 when down. */
function visAt(target: SkyTarget, t: number): number {
  const alt = altAt(target, t);
  if (alt <= 0) return 0;
  return Math.round((alt * (100 - washoutAt(target, t)) * (100 - cloudAt(t))) / 10000);
}

/** Countdown pill copy — re-anchors as viewTime crosses the dark window. */
function countdownCopy(t: number): string {
  if (t < DARK_START) return `Dark in ${fmtDur(DARK_START - t)}`;
  if (t <= DARK_END) return `Dark for ${fmtDur(DARK_END - t)}`;
  return 'Dawn at 4:18 AM';
}

const clampTime = (t: number) => Math.min(DOMAIN, Math.max(0, t));
const pct = (t: number) => `${((t / DOMAIN) * 100).toFixed(3)}%`;

// Derived stats (cross-checked in the fixture ledger above).
const DARK_SPAN_LABEL = fmtDur(DARK_END - DARK_START); // 6h 12m
const MOON_UP_LABEL = fmtDur(MOON_SET - MOON_RISE); // 5h 15m
const AVG_CLOUD = Math.round(CLOUD_POINTS.reduce((sum, v) => sum + v, 0) / CLOUD_POINTS.length); // 23
const BEST_LABEL = `Best window ${fmtClock(BEST_START)}–${fmtClock(BEST_END)} · ${fmtDur(BEST_END - BEST_START)}`;

// ---------------------------------------------------------------------------
// CONTAINER-WIDTH HOOK (grid-feeder-console pattern) — the desktop stage is
// ~1045px inside a 1440px window, so only a ResizeObserver on the shell
// wrapper can tell the 390px mobile stage from the desktop stage.
// ---------------------------------------------------------------------------

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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns the page scroll. */
function getScrollParent(el: HTMLElement | null): Element {
  let node: HTMLElement | null = el?.parentElement ?? null;
  while (node != null) {
    const overflowY = window.getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return document.scrollingElement ?? document.documentElement;
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
// BRAND MARK — 28px open roof-hatch chevron (two strokes meeting at a 96°
// apex) with a 7px four-point star floating in the gap. Strokes use
// --color-text-primary (never --color-text — it does not exist).
// ---------------------------------------------------------------------------

/** Four-point star path (rotated square with concave sides). */
function starPath(cx: number, cy: number, r: number): string {
  const k = r * 0.28;
  return (
    `M ${cx} ${cy - r} Q ${cx + k} ${cy - k} ${cx + r} ${cy}` +
    ` Q ${cx + k} ${cy + k} ${cx} ${cy + r}` +
    ` Q ${cx - k} ${cy + k} ${cx - r} ${cy}` +
    ` Q ${cx - k} ${cy - k} ${cx} ${cy - r} Z`
  );
}

function SkyshedMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        {/* Roof-hatch chevron: two strokes meeting at a 96° apex, opened
            at the ridge so the star floats in the gap. */}
        <path
          d="M4 20 L11 12.2"
          stroke="var(--color-text-primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <path
          d="M17 12.2 L24 20"
          stroke="var(--color-text-primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <path d={starPath(14, 8.5, 3.5)} fill={BRAND_ACCENT} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// NIGHT ARC TIMELINE — 96px strip; three stacked encodings (twilight bands,
// moon band, cloud ridge) + best-window outline + playhead. Bands and the
// playhead are percent-positioned (fraction·100%) so the strip stays fluid
// 320–430; the cloud path scales through its 0 0 660 28 viewBox.
// ---------------------------------------------------------------------------

// Cloud area path in timeline-minute space (x = minutes, y = 28px band).
// Hangs from the strip top; depth = value/44·24 (+2 floor) so the 44% peak
// nearly fills the 28px lane. Extended flat to the domain edges.
const cloudY = (v: number) => 2 + (v / 44) * 24;
const CLOUD_RIDGE_POINTS = CLOUD_POINTS.map((v, i) => `${CLOUD_T0 + i * CLOUD_STEP} ${cloudY(v).toFixed(1)}`);
const CLOUD_AREA_PATH =
  `M 0 0 L 660 0 L 660 ${cloudY(CLOUD_POINTS[CLOUD_POINTS.length - 1]).toFixed(1)} ` +
  [...CLOUD_RIDGE_POINTS].reverse().map(p => `L ${p}`).join(' ') +
  ` L 0 ${cloudY(CLOUD_POINTS[0]).toFixed(1)} Z`;
const CLOUD_LINE_PATH =
  `M 0 ${cloudY(CLOUD_POINTS[0]).toFixed(1)} ` +
  CLOUD_RIDGE_POINTS.map(p => `L ${p}`).join(' ') +
  ` L 660 ${cloudY(CLOUD_POINTS[CLOUD_POINTS.length - 1]).toFixed(1)}`;

interface NightArcTimelineProps {
  viewTime: number;
  onViewTime: (t: number) => void;
}

function NightArcTimeline({viewTime, onViewTime}: NightArcTimelineProps) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const timeFromClientX = useCallback((clientX: number): number => {
    const rect = stripRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return 0;
    const frac = (clientX - rect.left) / rect.width;
    // Drag snaps viewTime to 5-min steps, clamped 0–660.
    return clampTime(Math.round((frac * DOMAIN) / 5) * 5);
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      onViewTime(timeFromClientX(event.clientX));
    },
    [onViewTime, timeFromClientX],
  );
  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      onViewTime(timeFromClientX(event.clientX));
    },
    [onViewTime, timeFromClientX],
  );
  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  // Keyboard path (mandatory): ArrowLeft/Right ±5, Shift+Arrow ±30,
  // Home/End to the domain edges.
  const onKnobKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      const step = event.shiftKey ? 30 : 5;
      let next: number | null = null;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = clampTime(viewTime - step);
      else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = clampTime(viewTime + step);
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = DOMAIN;
      if (next != null) {
        event.preventDefault();
        onViewTime(next);
      }
    },
    [onViewTime, viewTime],
  );

  return (
    <div>
      <div
        ref={stripRef}
        style={styles.tlStrip}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}>
        {TWILIGHT_BANDS.map(band => (
          <div
            key={band.id}
            style={{
              ...styles.tlBand,
              left: pct(band.from),
              width: pct(band.to - band.from),
              background: band.fill,
            }}
            aria-hidden
          />
        ))}
        {/* Best-window outline 335→425. */}
        <div style={{...styles.tlBestWindow, left: pct(BEST_START), width: pct(BEST_END - BEST_START)}} aria-hidden />
        {/* Cloud ridge along the top 28px. */}
        <svg style={styles.tlCloudSvg} viewBox="0 0 660 28" preserveAspectRatio="none" aria-hidden>
          <path d={CLOUD_AREA_PATH} fill={CLOUD_FILL} />
          <path d={CLOUD_LINE_PATH} fill="none" stroke={CLOUD_LINE} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        </svg>
        {/* Moon overlay: 12px band at the strip bottom, 250→565. */}
        <div style={{...styles.tlMoonBand, left: pct(MOON_RISE), width: pct(MOON_SET - MOON_RISE)}} aria-hidden>
          <span style={styles.tlMoonLabel}>{MOON_ILLUM}%</span>
        </div>
        {/* Playhead: 2px line full height + 16px knob in a 44×44 slider. */}
        <div style={{...styles.tlPlayheadLine, left: pct(viewTime)}} aria-hidden />
        <button
          type="button"
          className="sks-btn sks-focusable"
          style={{...styles.tlKnobHit, left: pct(viewTime)}}
          role="slider"
          aria-label="Viewing time"
          aria-valuemin={0}
          aria-valuemax={DOMAIN}
          aria-valuenow={viewTime}
          aria-valuetext={fmtClock(viewTime)}
          onKeyDown={onKnobKeyDown}>
          <span style={styles.tlKnob} aria-hidden />
        </button>
      </div>
      <div style={styles.tlAxis} aria-hidden>
        {AXIS_TICKS.map(tick => (
          <span key={tick.t} style={{...styles.tlAxisTick, left: pct(tick.t)}}>
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SKY DOME CHART — SVG viewBox '0 0 326 200'; horizon y=176, dome arc
// r160 centered (163,176). Projection: x = 24+(az−70)/220·278 for az
// 70°–290° (E→S→W), y = 176−alt/90·150. Targets with alt ≤ obstruction
// clip under the horizon (no ghost). SVG aria-hidden; a sibling sr-only
// sentence states the same alt() math.
// ---------------------------------------------------------------------------

const projX = (az: number) => 24 + ((az - 70) / 220) * 278;
const projY = (alt: number) => 176 - (alt / 90) * 150;

// Deterministic decorative field stars (index-derived, no randomness).
const FIELD_STARS = Array.from({length: 14}, (_, i) => ({
  x: 24 + ((i * 97 + 31) % 278),
  y: 24 + ((i * 53 + 17) % 128),
  r: i % 3 === 0 ? 1.2 : 0.8,
}));

interface SkyDomeChartProps {
  viewTime: number;
  obstructionDeg: number;
}

function SkyDomeChart({viewTime, obstructionDeg}: SkyDomeChartProps) {
  const obsPx = (obstructionDeg / 90) * 150; // 12° → 20px (spec check)
  const moonUp = viewTime > MOON_RISE && viewTime < MOON_SET;
  const moonAlt = moonAltAt(viewTime);
  const moonAz = azAt({riseMin: MOON_RISE, setMin: MOON_SET}, viewTime);
  const issVisible = viewTime >= 104 && viewTime <= 110;

  const upTargets = TARGETS.filter(t => t.id !== 'iss' && altAt(t, viewTime) > obstructionDeg);

  // sr-only textual summary driven by the same alt() function.
  const summary =
    upTargets.length === 0
      ? `Sky at ${fmtClock(viewTime)}: no targets above the ${obstructionDeg} degree obstruction.`
      : `Sky at ${fmtClock(viewTime)}: ` +
        upTargets
          .map(t => `${t.chipName} ${Math.round(altAt(t, viewTime))} degrees${viewTime < t.transitMin ? ', rising' : ''}`)
          .join('; ') +
        (moonUp ? `; moon ${Math.round(moonAlt)} degrees at ${MOON_ILLUM} percent` : '; moon below the horizon') +
        (issVisible ? '; ISS passing now' : '') +
        '.';

  return (
    <div>
      <svg style={styles.domeSvg} viewBox="0 0 326 200" aria-hidden>
        {FIELD_STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={DOME_ARC} opacity={0.5} />
        ))}
        {/* Dome arc r160 centered (163,176). */}
        <path d="M 3 176 A 160 160 0 0 1 323 176" stroke={DOME_ARC} strokeWidth={1} fill="none" />
        {/* Ridge obstruction polygon on the east third (up to obsPx). */}
        {obstructionDeg > 0 ? (
          <path
            d={`M 24 176 L 24 ${(176 - obsPx).toFixed(1)} L 56 ${(176 - obsPx * 0.72).toFixed(1)} L 88 ${(176 - obsPx * 0.9).toFixed(1)} L 117 176 Z`}
            fill={RIDGE_FILL}
          />
        ) : null}
        {/* Horizon line y=176 — explicit pair, not a hairline token. */}
        <line x1={0} y1={176} x2={326} y2={176} stroke={HORIZON_LINE} strokeWidth={1} />
        {/* ISS dashed pass arc — drawn ONLY while 104 ≤ viewTime ≤ 110. */}
        {issVisible ? (
          <>
            <path d="M 24 176 Q 163 -4 302 176" stroke={BRAND_ACCENT} strokeWidth={2} strokeDasharray="5 5" fill="none" />
            <circle
              cx={projX(azAt(TARGET_BY_ID.iss, viewTime))}
              cy={projY(altAt(TARGET_BY_ID.iss, viewTime))}
              r={4}
              fill={BRAND_ACCENT}
            />
            <text
              x={projX(azAt(TARGET_BY_ID.iss, viewTime)) + 8}
              y={projY(altAt(TARGET_BY_ID.iss, viewTime)) - 6}
              fontSize={11}
              fontWeight={500}
              fill="var(--color-text-secondary)">
              ISS
            </text>
          </>
        ) : null}
        {/* Moon: 14px disc with the 62% label. */}
        {moonUp ? (
          <>
            <circle cx={projX(moonAz)} cy={projY(moonAlt)} r={7} fill={MOON_DISC} />
            <text
              x={projX(moonAz) + 10}
              y={projY(moonAlt) + 4}
              fontSize={11}
              fontWeight={500}
              fill="var(--color-text-secondary)">
              {MOON_ILLUM}%
            </text>
          </>
        ) : null}
        {/* Target marks — planets 10px discs, clusters 12px four-point
            stars, Albireo an 8px star; alt ≤ obstruction clips (no mark,
            no ghost). Labels collision-free by fixture design. */}
        {upTargets.map(t => {
          const x = projX(azAt(t, viewTime));
          const y = projY(altAt(t, viewTime));
          return (
            <g key={t.id}>
              {t.kind === 'planet' ? (
                <circle cx={x} cy={y} r={5} fill={BRAND_ACCENT} />
              ) : (
                <path d={starPath(x, y, t.kind === 'cluster' ? 6 : 4)} fill={STAR_GOLD} />
              )}
              <text x={x + 9} y={y + 4} fontSize={11} fontWeight={500} fill="var(--color-text-secondary)">
                {t.chipName}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="sks-vh">{summary}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TARGET VISIBILITY ROW — 88px; body <button> (accessible name = target
// name; tap snaps viewTime to the transit) + SIBLING 44×44 bell switch
// (buttons are never nested). Meters animate width only (instant under
// reduced motion).
// ---------------------------------------------------------------------------

const KIND_ICONS = {
  planet: OrbitIcon,
  cluster: SparklesIcon,
  star: StarIcon,
  satellite: SatelliteIcon,
} as const;

interface TargetVisibilityRowProps {
  target: SkyTarget;
  viewTime: number;
  obstructionDeg: number;
  reminderOn: boolean;
  onJump: (t: number) => void;
  onToggleReminder: (id: TargetId) => void;
}

function TargetVisibilityRow({
  target,
  viewTime,
  obstructionDeg,
  reminderOn,
  onJump,
  onToggleReminder,
}: TargetVisibilityRowProps) {
  const alt = altAt(target, viewTime);
  const washPct = Math.round(washoutAt(target, viewTime));
  const horizonPct = Math.round((Math.min(90, Math.max(0, alt - obstructionDeg)) / 90) * 100);
  const vis = visAt(target, viewTime);
  return (
    <div style={styles.tRow}>
      <button
        type="button"
        className="sks-btn sks-focusable"
        style={styles.tRowBtn}
        aria-label={target.name}
        onClick={() => onJump(clampTime(target.transitMin))}>
        <span style={styles.typeDisc} aria-hidden>
          <Icon icon={KIND_ICONS[target.kind]} size="sm" />
        </span>
        <span style={styles.tMid}>
          <span style={styles.tName}>{target.name}</span>
          <span style={styles.tSub}>{target.subLine}</span>
          <span style={styles.meterLine}>
            <span style={styles.meterLabel}>MOON WASH</span>
            <span style={styles.meterTrack}>
              <span className="sks-meter" style={{...styles.meterFillWash, width: `${washPct}%`, display: 'block'}} />
            </span>
          </span>
          <span style={styles.meterLine}>
            <span style={styles.meterLabel}>ABOVE RIDGE</span>
            <span style={styles.meterTrack}>
              <span
                className="sks-meter"
                style={{...styles.meterFillHorizon, width: `${horizonPct}%`, display: 'block'}}
              />
            </span>
          </span>
        </span>
      </button>
      <span style={styles.tTrail}>
        <span style={styles.visPct}>{vis}%</span>
        <button
          type="button"
          className="sks-btn sks-focusable"
          style={{...styles.bellBtn, ...(reminderOn ? styles.bellOn : null)}}
          role="switch"
          aria-checked={reminderOn}
          aria-label={`Reminder for ${target.chipName}`}
          onClick={() => onToggleReminder(target.id)}>
          <Icon icon={reminderOn ? BellRingIcon : BellIcon} size="sm" />
        </button>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — flat SkyState + a single update(patch); every surface
// re-derives from viewTime/siteId/reminders through the pure math above.
// ---------------------------------------------------------------------------

type TabId = 'tonight' | 'targets' | 'sites';

const TAB_IDS: TabId[] = ['tonight', 'targets', 'sites'];
const TAB_META: Record<TabId, {label: string; icon: typeof StarIcon}> = {
  tonight: {label: 'Tonight', icon: TelescopeIcon},
  targets: {label: 'Targets', icon: StarIcon},
  sites: {label: 'Sites', icon: MountainIcon},
};

type Reminders = Record<TargetId, boolean>;

interface SkyState {
  tab: TabId;
  viewTime: number;
  siteId: SiteId;
  reminders: Reminders;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  pendingSiteId: SiteId | null;
  toast: {seq: number; text: string; canUndo: boolean} | null;
  scrollByTab: Partial<Record<TabId, number>>;
  undoSnapshot: Reminders | null;
}

const INITIAL_STATE: SkyState = {
  tab: 'tonight',
  viewTime: INITIAL_VIEW_TIME,
  siteId: 'pine-hollow',
  // ISS reminder ON in the initial fixture — one chip planted.
  reminders: {iss: true, saturn: false, jupiter: false, m13: false, m31: false, albireo: false},
  sheetOpen: false,
  sheetDetent: 'medium',
  pendingSiteId: null,
  toast: null,
  scrollByTab: {},
  undoSnapshot: null,
};

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileStargazingTonightTemplate() {
  const [state, setState] = useState<SkyState>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;
  const toastSeq = useRef(1);

  const update = useCallback((patch: Partial<SkyState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(wrapRef);
  // First-frame fallback only — container width wins once measured.
  const wideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktop = containerWidth > 0 ? containerWidth >= 720 : wideViewport;

  const changeBtnRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const targetsHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const {tab, viewTime, siteId, reminders, sheetOpen, sheetDetent, pendingSiteId, toast} = state;
  const site = SITE_BY_ID[siteId];

  const setViewTime = useCallback(
    (t: number) => {
      update({viewTime: clampTime(t)});
    },
    [update],
  );

  const showToast = useCallback(
    (text: string, extra?: Partial<SkyState>) => {
      update({toast: {seq: toastSeq.current++, text, canUndo: false}, ...extra});
    },
    [update],
  );

  // Reminder toggle — undoOverConfirm: executes immediately, toast + Undo,
  // no timers; Undo restores the EXACT prior reminders object.
  const toggleReminder = useCallback(
    (id: TargetId) => {
      setState(prev => {
        const turningOn = !prev.reminders[id];
        const target = TARGET_BY_ID[id];
        return {
          ...prev,
          reminders: {...prev.reminders, [id]: turningOn},
          undoSnapshot: prev.reminders,
          toast: {
            seq: toastSeq.current++,
            text: turningOn ? `Reminder set for ${target.reminderLabel}` : 'Reminder removed',
            canUndo: true,
          },
        };
      });
    },
    [],
  );

  const undoReminders = useCallback(() => {
    setState(prev =>
      prev.undoSnapshot == null
        ? prev
        : {
            ...prev,
            reminders: prev.undoSnapshot,
            undoSnapshot: null,
            toast: {seq: toastSeq.current++, text: 'Restored', canUndo: false},
          },
    );
  }, []);

  // --- tabs: per-tab scroll persistence + the one legal reset ---
  const scroller = useCallback(() => getScrollParent(wrapRef.current), []);
  const selectTab = useCallback(
    (next: TabId) => {
      const prev = stateRef.current;
      if (next === prev.tab) {
        // Re-tap active tab: scroll to top (iOS convention).
        scroller().scrollTo({top: 0});
        return;
      }
      update({
        tab: next,
        scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller().scrollTop},
        // Open overlays close on tab switch; the toast dock persists.
        sheetOpen: false,
        pendingSiteId: null,
      });
    },
    [scroller, update],
  );

  useEffect(() => {
    const saved = stateRef.current.scrollByTab[tab] ?? 0;
    scroller().scrollTo({top: saved});
  }, [tab, scroller]);

  const onTabKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const index = TAB_IDS.indexOf(stateRef.current.tab);
      const nextIndex =
        event.key === 'ArrowRight' ? (index + 1) % TAB_IDS.length : (index + TAB_IDS.length - 1) % TAB_IDS.length;
      selectTab(TAB_IDS[nextIndex]);
      document.getElementById(`sks-tab-${TAB_IDS[nextIndex]}`)?.focus({preventScroll: true});
    },
    [selectTab],
  );

  // --- site sheet: open locks the shell; focus in with preventScroll ---
  const openSheet = useCallback(() => {
    update({sheetOpen: true, sheetDetent: 'medium', pendingSiteId: stateRef.current.siteId});
  }, [update]);

  useEffect(() => {
    if (sheetOpen) {
      // preventScroll: plain .focus() would scroll-reveal the animating
      // sheet inside the locked overflow-hidden column (amendment).
      sheetRef.current?.focus({preventScroll: true});
    }
  }, [sheetOpen]);

  const closeSheet = useCallback(
    (commit: boolean) => {
      const prev = stateRef.current;
      const nextSite = commit && prev.pendingSiteId != null ? prev.pendingSiteId : prev.siteId;
      const switched = commit && nextSite !== prev.siteId;
      update({
        sheetOpen: false,
        pendingSiteId: null,
        siteId: nextSite,
        ...(switched
          ? {toast: {seq: toastSeq.current++, text: `Switched to ${SITE_BY_ID[nextSite].name}`, canUndo: false}}
          : null),
      });
      // Focus restores to the opener on EVERY close path.
      changeBtnRef.current?.focus({preventScroll: true});
    },
    [update],
  );

  // Escape closes the topmost overlay only (the sheet is the only one).
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSheet(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sheetOpen, closeSheet]);

  // Sites tab rows commit immediately (radio pattern, reversible-in-one-tap).
  const commitSite = useCallback(
    (id: SiteId) => {
      if (id === stateRef.current.siteId) return;
      showToast(`Switched to ${SITE_BY_ID[id].name}`, {siteId: id});
    },
    [showToast],
  );

  const onSitesKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>, forSheet: boolean) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      event.preventDefault();
      const current = forSheet ? stateRef.current.pendingSiteId ?? stateRef.current.siteId : stateRef.current.siteId;
      const index = SITES.findIndex(s => s.id === current);
      const next = SITES[(index + (event.key === 'ArrowDown' ? 1 : SITES.length - 1)) % SITES.length].id;
      if (forSheet) {
        update({pendingSiteId: next});
        document.getElementById(`sks-sheet-site-${next}`)?.focus({preventScroll: true});
      } else {
        commitSite(next);
        document.getElementById(`sks-site-${next}`)?.focus({preventScroll: true});
      }
    },
    [commitSite, update],
  );

  const seeAllTargets = useCallback(() => {
    selectTab('targets');
    // Focus moves to the Targets list heading after the view swaps.
    requestAnimationFrame(() => targetsHeadingRef.current?.focus({preventScroll: true}));
  }, [selectTab]);

  // --- derived (all pure re-derivations from viewTime/siteId) ---
  const obstruction = site.obstructionDeg;
  const timeLabel = fmtClock(viewTime);
  const byVis = [...TARGETS].sort((a, b) => visAt(b, viewTime) - visAt(a, viewTime));
  const upTop3 = byVis.filter(t => altAt(t, viewTime) > 0).slice(0, 3);
  const atBest = viewTime === BEST_CENTER;
  const chips = TARGETS.filter(t => reminders[t.id]).sort((a, b) => a.reminderAtMin - b.reminderAtMin);
  const bwSub = `Cloud ${Math.round(cloudAt(BEST_CENTER))}% · moon ${Math.round(moonAltAt(BEST_CENTER))}° low in the west`;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktop ? styles.shellCentered : null),
    ...(sheetOpen ? styles.shellLocked : null),
  };

  const renderSiteRow = (s: Site, forSheet: boolean) => {
    const selected = forSheet ? (pendingSiteId ?? siteId) === s.id : siteId === s.id;
    return (
      <button
        key={s.id}
        id={forSheet ? `sks-sheet-site-${s.id}` : `sks-site-${s.id}`}
        type="button"
        className="sks-btn sks-focusable"
        style={forSheet ? styles.sheetSiteRow : styles.siteRow}
        role="radio"
        aria-checked={selected}
        tabIndex={selected ? 0 : -1}
        onClick={() => (forSheet ? update({pendingSiteId: s.id}) : commitSite(s.id))}>
        {selected ? (
          <span style={styles.radioOn} aria-hidden>
            {/* CheckIcon on BRAND_ACCENT: BRAND_FILL_TEXT pair — white on
                #5B5BD6 5.3:1 / #14143A on #A5A6F6 8.0:1. */}
            <Icon icon={CheckIcon} size="xsm" />
          </span>
        ) : (
          <span style={styles.radioOff} aria-hidden />
        )}
        <span style={styles.bortleDisc} aria-hidden>
          B{s.bortle}
        </span>
        <span style={{...styles.siteMid, ...(forSheet ? {paddingTop: 2} : null)}}>
          <span style={styles.siteName}>{s.name}</span>
          <span style={styles.siteSub}>
            Bortle {s.bortle} · {s.drive} · {s.obstructionLabel}
          </span>
          {forSheet ? (
            // horizonMiniBar — obstruction ° on a 0–30° scale.
            <span style={styles.miniBarLine}>
              <span style={styles.miniBarTrack}>
                <span
                  style={{
                    ...styles.miniBarFill,
                    width: `${Math.min(100, (s.obstructionDeg / 30) * 100)}%`,
                    display: 'block',
                  }}
                />
              </span>
              <span style={styles.miniBarLabel}>{s.obstructionDeg}° obstruction</span>
            </span>
          ) : null}
        </span>
        <span style={styles.siteMeta}>{s.elevation}</span>
      </button>
    );
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SKYSHED_CSS}</style>
      <div style={shellStyle}>
        {/* NAV BAR — brand mark (decorative; sr-only h1) · tab title ·
            countdown pill re-deriving from viewTime. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <SkyshedMark />
            <h1 className="sks-vh">Skyshed</h1>
          </div>
          <div style={styles.navTitle}>{TAB_META[tab].label}</div>
          <div style={styles.navTrailing}>
            <div style={styles.countdownHit}>
              <span style={styles.countdownPill}>{countdownCopy(viewTime)}</span>
            </div>
          </div>
        </header>

        <main style={styles.main}>
          {tab === 'tonight' ? (
            <div style={styles.cardStack}>
              {/* (1) CONDITIONS CARD — 60px header + 3-across stat tiles. */}
              <section style={styles.listCard} aria-label="Tonight's conditions">
                <div style={styles.condHeader}>
                  <div style={styles.condText}>
                    <span style={styles.condName}>{site.name}</span>
                    <span style={styles.condSub}>
                      Bortle {site.bortle} · {site.drive} drive · {NIGHT_LABEL}
                    </span>
                  </div>
                  <button
                    ref={changeBtnRef}
                    type="button"
                    className="sks-btn sks-focusable"
                    style={styles.changeBtn}
                    onClick={openSheet}>
                    Change
                  </button>
                </div>
                <div style={styles.statRow}>
                  <div style={styles.statTile}>
                    <span style={styles.statValue}>{DARK_SPAN_LABEL}</span>
                    <span style={styles.overline}>Dark</span>
                  </div>
                  {/* MOON tile: overline 'MOON 62%' over '5h 15m' — the
                      spec's combined 16px value cannot fit 80px at the
                      320 stage (deviation, header note). */}
                  <div style={styles.statTile}>
                    <span style={styles.statValue}>{MOON_UP_LABEL}</span>
                    <span style={styles.overline}>Moon {MOON_ILLUM}%</span>
                  </div>
                  <div style={styles.statTile}>
                    <span style={styles.statValue}>{AVG_CLOUD}%</span>
                    <span style={styles.overline}>Avg cloud</span>
                  </div>
                </div>
              </section>

              {/* (2) TIMELINE CARD — the scrubbable fused night axis. */}
              <section style={styles.paddedCard} aria-label="Night timeline">
                <div style={styles.cardTitleRow}>
                  <h2 style={styles.cardTitle}>Night timeline</h2>
                  <span style={styles.timeReadout}>{timeLabel}</span>
                </div>
                <NightArcTimeline viewTime={viewTime} onViewTime={setViewTime} />
                <div style={styles.controlsRow}>
                  <button
                    type="button"
                    className="sks-btn sks-focusable"
                    style={styles.ctlBtn}
                    aria-label="Rewind 30 minutes"
                    disabled={viewTime === 0}
                    onClick={() => setViewTime(viewTime - 30)}>
                    <span style={{...styles.ctlPill, ...(viewTime === 0 ? {opacity: 0.35} : null)}}>−30m</span>
                  </button>
                  <button
                    type="button"
                    className="sks-btn sks-focusable"
                    style={styles.ctlBtn}
                    aria-label="Advance 30 minutes"
                    disabled={viewTime === DOMAIN}
                    onClick={() => setViewTime(viewTime + 30)}>
                    <span style={{...styles.ctlPill, ...(viewTime === DOMAIN ? {opacity: 0.35} : null)}}>+30m</span>
                  </button>
                  <span style={styles.ctlSpacer} />
                  {/* BestWindowButton — brand ring pulses while viewTime is
                      off 380; pulse removed under reduced motion (static
                      ring remains); click snaps to 1:50 AM. */}
                  <button
                    type="button"
                    className="sks-btn sks-focusable"
                    style={styles.bestWinWrap}
                    aria-label="Snap to best window, 1:50 AM"
                    onClick={() => setViewTime(BEST_CENTER)}>
                    <span style={styles.bestWinPill}>
                      <Icon icon={SparkleIcon} size="xsm" />
                      Best window
                    </span>
                    {!atBest ? <span className="sks-pulse" style={styles.pulseRing} aria-hidden /> : null}
                  </button>
                </div>
              </section>

              {/* (3) DOME CARD — re-projects every mark at viewTime. */}
              <section style={styles.paddedCard} aria-label={`Sky chart at ${timeLabel}`}>
                <div style={styles.cardTitleRow}>
                  <h2 style={styles.cardTitle}>Sky at {timeLabel}</h2>
                </div>
                <SkyDomeChart viewTime={viewTime} obstructionDeg={obstruction} />
              </section>

              {/* (4) BEST WINDOW CARD + ReminderAlertChip rail. */}
              <section style={styles.paddedCard} aria-label="Best window">
                <div style={styles.bwHead}>
                  <div style={styles.bwHeadText}>
                    <h2 style={styles.bwTitle}>{BEST_LABEL}</h2>
                    <div style={styles.bwSub}>{bwSub}</div>
                  </div>
                  <span style={styles.jumpWrap}>
                    <button
                      type="button"
                      className="sks-btn sks-focusable"
                      style={styles.jumpBtn}
                      aria-label="Jump to best window, 1:50 AM"
                      onClick={() => setViewTime(BEST_CENTER)}>
                      Jump
                    </button>
                    {!atBest ? <span className="sks-pulse" style={styles.pulseRing} aria-hidden /> : null}
                  </span>
                </div>
                <div style={styles.chipRail}>
                  {chips.length === 0 ? (
                    <span style={styles.chipEmpty}>No reminders yet — tap a bell on any target.</span>
                  ) : (
                    chips.map(t => (
                      // Merged 44px-hit remove button (undoOverConfirm:
                      // executes immediately, Undo via toast).
                      <button
                        key={t.id}
                        type="button"
                        className="sks-btn sks-focusable"
                        style={styles.chipHit}
                        aria-label={`Remove reminder for ${t.chipName} at ${t.reminderLabel}`}
                        onClick={() => toggleReminder(t.id)}>
                        <span style={styles.chip}>
                          <Icon icon={BellIcon} size="xsm" />
                          {t.reminderLabel} · {t.chipName}
                          <Icon icon={XIcon} size="xsm" />
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </section>

              {/* (5) UP NOW — top 3 by vis + 44px see-all row. */}
              <div>
                <h2 style={styles.sectionHeader}>Up at {timeLabel}</h2>
                <div style={styles.listCard}>
                  {upTop3.map((t, i) => (
                    <div key={t.id}>
                      {i > 0 ? <div style={styles.rowDividerDeep} /> : null}
                      <TargetVisibilityRow
                        target={t}
                        viewTime={viewTime}
                        obstructionDeg={obstruction}
                        reminderOn={reminders[t.id]}
                        onJump={setViewTime}
                        onToggleReminder={toggleReminder}
                      />
                    </div>
                  ))}
                  {upTop3.length === 0 ? (
                    <div style={{...styles.chipEmpty, padding: 16}}>Nothing up yet — scrub toward dark.</div>
                  ) : null}
                  <div style={styles.rowDivider} />
                  <button type="button" className="sks-btn sks-focusable" style={styles.seeAllRow} onClick={seeAllTargets}>
                    See all {TARGETS.length} targets
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'targets' ? (
            <div>
              <h2 ref={targetsHeadingRef} tabIndex={-1} className="sks-focusable" style={styles.sectionHeader}>
                Sorted for {timeLabel}
              </h2>
              <div style={styles.listCard}>
                {byVis.map((t, i) => (
                  <div key={t.id}>
                    {i > 0 ? <div style={styles.rowDividerDeep} /> : null}
                    <TargetVisibilityRow
                      target={t}
                      viewTime={viewTime}
                      obstructionDeg={obstruction}
                      reminderOn={reminders[t.id]}
                      onJump={setViewTime}
                      onToggleReminder={toggleReminder}
                    />
                  </div>
                ))}
              </div>
              <p style={styles.terminalCaption}>All {TARGETS.length} targets</p>
            </div>
          ) : null}

          {tab === 'sites' ? (
            <div>
              <h2 style={styles.sectionHeader}>Dark-sky sites</h2>
              <div
                style={styles.listCard}
                role="radiogroup"
                aria-label="Observing site"
                onKeyDown={event => onSitesKeyDown(event, false)}>
                {SITES.map((s, i) => (
                  <div key={s.id}>
                    {i > 0 ? <div style={styles.rowDividerDeep} /> : null}
                    {renderSiteRow(s, false)}
                  </div>
                ))}
              </div>
              <p style={styles.terminalCaption}>
                Obstruction swaps straight into the dome ridge and every ABOVE RIDGE meter.
              </p>
            </div>
          ) : null}
        </main>

        {/* TOAST DOCK — the one polite live region; sticky-in-flow above
            the tabBar; no auto-dismiss timers. */}
        <div style={styles.toastAnchor} aria-live="polite">
          {toast != null ? (
            <div key={toast.seq} style={styles.toast}>
              <span style={styles.toastText}>{toast.text}</span>
              {toast.canUndo ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="sks-btn sks-focusable" style={styles.toastUndo} onClick={undoReminders}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px, 3 tabs, arrow-key movement. */}
        <nav style={styles.tabBar} aria-label="Skyshed sections" onKeyDown={onTabKeyDown}>
          {TAB_IDS.map(id => {
            const active = tab === id;
            return (
              <button
                key={id}
                id={`sks-tab-${id}`}
                type="button"
                className="sks-btn sks-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                aria-current={active ? 'page' : undefined}
                onClick={() => selectTab(id)}>
                <Icon icon={TAB_META[id].icon} size="md" />
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>
                  {TAB_META[id].label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* SITE SHEET — two detents; grabber toggles; scrim/X/Escape close
            discarding pendingSiteId; 'Use this site' commits. */}
        {sheetOpen ? (
          <>
            <div style={styles.sheetScrim} onClick={() => closeSheet(false)} aria-hidden />
            <div
              ref={sheetRef}
              className="sks-sheet-in"
              style={{...styles.sheet, ...(sheetDetent === 'medium' ? styles.sheetMedium : styles.sheetLarge)}}
              role="dialog"
              aria-modal="true"
              aria-label="Choose site"
              tabIndex={-1}
              onKeyDown={event => trapTabKey(event, sheetRef.current)}>
              <div style={styles.grabberZone}>
                <button
                  type="button"
                  className="sks-btn sks-focusable"
                  aria-label="Resize sheet"
                  style={{height: 24, paddingInline: 22, display: 'grid', placeItems: 'center'}}
                  onClick={() => update({sheetDetent: sheetDetent === 'medium' ? 'large' : 'medium'})}>
                  <span style={styles.grabberPill} aria-hidden />
                </button>
              </div>
              <div style={styles.sheetHeader}>
                <span />
                <h2 style={styles.sheetTitle}>Choose site</h2>
                <button
                  type="button"
                  className="sks-btn sks-focusable"
                  style={styles.iconBtn}
                  aria-label="Close"
                  onClick={() => closeSheet(false)}>
                  <Icon icon={XIcon} size="sm" />
                </button>
              </div>
              <div
                style={styles.sheetBody}
                role="radiogroup"
                aria-label="Observing site"
                onKeyDown={event => onSitesKeyDown(event, true)}>
                {SITES.map((s, i) => (
                  <div key={s.id}>
                    {i > 0 ? <div style={styles.rowDividerDeep} /> : null}
                    {renderSiteRow(s, true)}
                  </div>
                ))}
              </div>
              <div style={styles.sheetFooter}>
                <button type="button" className="sks-btn sks-focusable" style={styles.useBtn} onClick={() => closeSheet(true)}>
                  Use this site
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
