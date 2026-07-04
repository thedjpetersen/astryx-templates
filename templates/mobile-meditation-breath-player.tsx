// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Stillpoint 'Evening Wind-Down'
 *   guided session (ses-0412, Maren Ost, 720 s = 12:00, 51 breaths) frozen
 *   paused at positionSec 192 ('Paused at 3:12'). Four chapters with dual
 *   fields and exact cross-checks: durations 96+288+228+108 = 720; start
 *   chain 0→96→384→612→720; breaths = durationSec/cycleSec exactly
 *   (96/8=12, 288/16=18, 228/19=12, 108/12=9; 12+18+12+9 = 51). Three
 *   ambient layers (Rain 4, Low Drone 3, and the long-named Kyoto chimes
 *   at 2 — the in-data ellipsis stress) and three output routes. No
 *   Date.now(), no Math.random(), no network media; the only timer is the
 *   1000 ms play interval and every visible value is a pure function of
 *   positionSec, so scrubbing and ticking are indistinguishable.
 * @output Stillpoint — Breath Player: a 390px MOBILE meditation player
 *   where ONE positionSec is the whole instrument. NavBar (44×44 X ·
 *   chapter title · AirPlay route button) over a hero: overline + h1 +
 *   caption, a 196×196 BreathOrb (fractional phase arc r=94, 180px orb
 *   scaling 1.0→1.18 transform-only, 17px phase label, 34px tabular beat
 *   countdown), a duration-weighted BeadTimeline (flex-grow 96/288/228/108
 *   with 4 bead buttons and a 44px scrub hit zone), an elapsed/chapter/
 *   remaining readout, and a 44/64/44 transport. A sticky footer opens the
 *   LARGE chapters-and-mix sheet. Signature move: any crossing of a
 *   chapter boundary — tick, scrub, bead, skip, or sheet row — swaps the
 *   orb's breathing pattern, crossfades the chapter-tinted background,
 *   retitles the navBar, re-marks the sheet's Now/check rows, and audibly
 *   'ducks' the Chimes layer (derived level −2 for the first 8 s of
 *   chapters 2–4, so scrubbing into 6:24–6:32 shows the ducked bars
 *   deterministically).
 * @position Page template; emitted by `astryx template mobile-meditation-breath-player`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (tint layers, scrim, sheet, route popover) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close. The stage clips to --radius-container; shell
 *   paints full-bleed square. NO tab bar (single-screen player archetype).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 — chapter rows lead with a 24px
 *   index bead, not an avatar, so 16px inset, not 68px); no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal pair:
 *   BRAND_ACCENT for fills/arcs/bars and BRAND_TEXT for brand-tinted
 *   text/icons on body background (contrast math at the declarations).
 *   Chapter tints are color-mix() washes of BRAND_ACCENT at 8/14/11/6%,
 *   never extra literals. The sheet scrim pair is the sanctioned
 *   foundations value.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter
 *   (paddingInline 16 on every content block; zero on full-bleed tint
 *   layers and hairlines) · 12px card gaps · 24px section gaps · 8px chip
 *   gaps; navBar 52px sticky top z20 (paddingInline 8, grid '1fr auto
 *   1fr', hairline + blur ALWAYS ON — this template does not wire
 *   scroll-under; noted per contract); rows 44px utility (route menu) /
 *   60px two-line chapter (16px/500 + 13px/400, 2px gap) / 72px ambient
 *   mix; row padding 16px inline, rows are full-width <button>s;
 *   sectionHeader 13px/600 uppercase 0.06em at 32px (16 gutter + 16 card
 *   pad), 20px top / 8px bottom. TYPE (Figtree via --font-family-body):
 *   34/700 orb beat counter (the one sanctioned oversize, tabular) ·
 *   22/700 session title · 17/600 nav title + phase label + sheet title ·
 *   16/400 row primary · 13/400 secondary/meta · 11/500 overlines + '15'
 *   skip labels; nothing under 11px; tabular-nums on every time readout.
 *   Buttons: 64×64 circular play/pause (primary verb, bottom third),
 *   44×44 icon buttons (nav X, AirPlay, skips, beads, notches, mute,
 *   sheet X, grabber), 48px full-width sticky-footer 'Chapters & Sound
 *   Mix'. Hero orb 180px circle inside a 196×196 SVG arc ring; timeline
 *   visual track 6px inside a 44px hit zone; beads 12px (active 16px)
 *   inside 44×44 buttons; mix notches 6×16px bars each centered in a
 *   44×44 notch button (5 × 44 = 220px meter, fits the 358px card
 *   interior at 390). Sheet detents: LARGE calc(100% − 56px) initial,
 *   MEDIUM 55%; 24px grabber zone with 36×5 pill; 52px sheet header.
 * Motion: every animation is transform/opacity only — orb scale
 *   (transform, 1000 ms linear per tick), tint crossfade (opacity 600 ms),
 *   sheet slide (transform+opacity 240 ms). Under prefers-reduced-motion
 *   all collapse to instant AND the orb stops scaling entirely; phase is
 *   then encoded by the orb fill stepping 12%→20%→20%→12% across a box
 *   cycle (static color still communicates phase).
 *
 * Responsive contract:
 * - Fluid 320–430px, no width:390 literals: orb stays 196px (320−32 = 288
 *   > 196); timeline compresses via flex-grow (Intro ≈ 38px at 320, still
 *   scrubbable — the 44px hit zone spans full width and beads are 44×44
 *   buttons); transport 44+24+64+24+44 = 200px fits; five 44px notches
 *   (220px) fit the 288px card interior with the mute toggle on line 1.
 * - Vertical: shell minHeight 100dvh; hero minHeight calc(100dvh − 183px)
 *   (52 navBar + 50 toast dock + 81 sticky footer — the spec's
 *   calc(100dvh − 52px) is reconciled here so its own 'nothing scrolls at
 *   the 844px reference' law holds with the in-flow footer) with
 *   justifyContent space-evenly; on short viewports content flows and the
 *   demo's .preview-wrap scrolls the page — shell never owns scroll; the
 *   one legal inner scroller is the open sheet's content pane. The toast
 *   pill is a sticky-in-flow dock (bottom 89, above the footer) per the
 *   batch-1 amendment — never shell-absolute while no overlay is open.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, never window.innerWidth) — at >560px the wrapper
 *   centers the shell as a 430px phone column (borderInline hairline,
 *   muted stage background). No adaptive relayout — the orb-hero anatomy
 *   is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, RefObject} from 'react';

import {
  AirplayIcon,
  CheckIcon,
  ListMusicIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Stillpoint evergreen) — fills, arcs, bars.
// White 17px+ text on #2F7E6D ≈ 5.0:1 (passes 4.5:1 at any size we use);
// dark-scheme fills flip to #7BC9B6 with #10201B glyphs ≈ 8.9:1.
const BRAND_ACCENT = 'light-dark(#2F7E6D, #7BC9B6)';
// Glyphs/text ON a BRAND_ACCENT fill (play button): white / near-black.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #10201B)';
// Brand-tinted text/icons on the BODY background (route-active AirPlay
// icon, 'Now' chip text): #256B5C on white ≈ 5.6:1; #8FD4C3 on the dark
// body ≈ 7.8:1 — both clear 4.5:1.
const BRAND_TEXT = 'light-dark(#256B5C, #8FD4C3)';
// Brand washes (chips, active-row tint) — mixes of the one literal.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden text,
// and the three sanctioned transitions (orb transform, tint opacity, sheet
// slide). All collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const STP_CSS = `
.stp-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.stp-btn:disabled { cursor: default; }
.stp-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.stp-orb { transition: transform 1000ms linear; }
.stp-tint { transition: opacity 600ms ease; }
.stp-fade { transition: opacity 240ms ease; }
@keyframes stp-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.stp-sheet-in { animation: stp-sheet-in 240ms ease; }
.stp-vh {
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
  .stp-orb, .stp-tint, .stp-fade { transition: none; }
  .stp-sheet-in { animation: none; }
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
  wrapDesktop: {
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--color-background-muted)',
  },
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
  // Desktop stage (>560px container): centered 430px phone column.
  shellDesktop: {maxWidth: 430, borderInline: '1px solid var(--color-border)'},
  // LAYER 0 — chapter tint crossfade. One absolute inset-0 radial wash per
  // chapter (opacity 1 only for the current one; .stp-tint fades 600ms,
  // instant under reduced motion). Behind all content, never interactive.
  tintLayer: {position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none'},
  // ALL content above the tint layers.
  content: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 icon buttons
  // optically align content to the 16px gutter. Hairline + blur ALWAYS ON.
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
  // Center slot: CURRENT CHAPTER title — 17/600, one line, 200px max
  // (chapter 3 'Body Scan — Shoulders, Jaw & Brow' is the ellipsis stress).
  navTitle: {
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
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
  iconBtnBrand: {color: BRAND_TEXT},
  // HERO — flex column, space-evenly; minHeight reconciled so navBar +
  // hero + toast dock + footer = 100dvh at the 844px reference (see the
  // responsive contract in the header comment).
  hero: {
    flex: 1,
    minHeight: 'calc(100dvh - 183px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingInline: 16,
    paddingBlock: 8,
  },
  heroHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    textAlign: 'center',
  },
  overlineRow: {display: 'flex', alignItems: 'center', gap: 8},
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  h1: {margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.2},
  heroCaption: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  // BREATH ORB — 196×196 SVG arc ring around the 180px orb.
  orbBlock: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8},
  orbWrap: {position: 'relative', width: 196, height: 196},
  orbSvg: {position: 'absolute', inset: 0},
  // 180px orb centered inside the ring (inset 8). transform-only scale.
  orb: {
    position: 'absolute',
    inset: 8,
    borderRadius: '50%',
    border: `1px solid color-mix(in srgb, ${BRAND_ACCENT} 40%, var(--color-border))`,
    display: 'grid',
    placeItems: 'center',
  },
  orbStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    textAlign: 'center',
  },
  phaseLabel: {fontSize: 17, fontWeight: 600},
  // 34/700 tabular — the one sanctioned oversize numeral.
  beatCounter: {fontSize: 34, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'},
  orbCaption: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  // BEAD TIMELINE — 44px hit zone over a 6px visual track; full gutter
  // width. The zone itself is the focusable slider (arrow keys ±15s).
  timelineZone: {
    position: 'relative',
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    touchAction: 'none',
    cursor: 'pointer',
  },
  track: {flex: 1, display: 'flex', gap: 2, height: 6},
  segment: {
    position: 'relative',
    height: 6,
    borderRadius: 3,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  segmentFill: {position: 'absolute', insetBlock: 0, left: 0, background: BRAND_ACCENT},
  // Chapter-start bead buttons — 44×44 hits over the boundary points.
  beadBtn: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
  },
  bead: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  beadReached: {
    background: 'var(--color-background-card)',
    border: `2px solid ${BRAND_ACCENT}`,
  },
  beadActive: {width: 16, height: 16},
  // READOUT ROW — elapsed · chapter chip · remaining.
  readoutRow: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
  },
  readoutTime: {fontSize: 13, fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-secondary)'},
  readoutTimeEnd: {textAlign: 'end'},
  chapterChip: {
    height: 22,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // TRANSPORT — 44/64/44, 24px gaps, centered; the primary verb lives in
  // the bottom third of the screen per the thumb-zone rule.
  transportRow: {display: 'flex', alignItems: 'center', gap: 24},
  skipBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  skipNum: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    paddingTop: 3,
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'none',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  // TOAST — sticky-in-flow dock above the footer (batch-1 amendment: NOT
  // shell-absolute while no overlay is open). The ONE polite live region.
  toastDock: {
    position: 'sticky',
    bottom: 89,
    zIndex: 20,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    paddingBlock: 8,
    pointerEvents: 'none',
  },
  toastPill: {
    maxWidth: '100%',
    height: 34,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 14,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // STICKY FOOTER — same blur + hairline surface as the navBar, borderTop.
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
  footerBtn: {
    width: '100%',
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 'var(--radius-element, 12px)',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    fontSize: 16,
    fontWeight: 600,
  },
  // ROUTE POPOVER — anchored menu below the AirPlay button.
  clickCatcher: {position: 'absolute', inset: 0, zIndex: 29},
  routeMenu: {
    position: 'absolute',
    top: 56,
    right: 8,
    zIndex: 30,
    width: 220,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'hidden',
  },
  routeRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 12,
    fontSize: 16,
  },
  routeRowText: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  routeCheck: {width: 20, flexShrink: 0, display: 'grid', placeItems: 'center', color: BRAND_TEXT},
  // SHEET — scrim z40 + sheet z41, absolute inside shell; LARGE initial.
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
  // The ONE legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 24},
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom. Rendered as h2 inside the sheet.
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
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
  // Index-bead rows: 16px divider inset (no avatar column).
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // 60px two-line chapter row.
  chapterRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  indexBead: {
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  indexBeadActive: {background: BRAND_TINT_12, color: BRAND_TEXT},
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
  nowChip: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: BRAND_FILL_TEXT,
    background: BRAND_ACCENT,
    borderRadius: 999,
    padding: '3px 8px',
  },
  doneCheck: {flexShrink: 0, color: BRAND_TEXT, display: 'grid', placeItems: 'center'},
  // 72px ambient mix row (grows only for the duck caption).
  mixRow: {
    position: 'relative',
    minHeight: 72,
    display: 'flex',
    flexDirection: 'column',
    paddingInlineStart: 16,
    paddingBlock: 4,
  },
  mixLine1: {display: 'flex', alignItems: 'center', minHeight: 24},
  mixName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mixNameMuted: {color: 'var(--color-text-secondary)'},
  muteBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    marginBlock: -10,
    marginInlineEnd: 4,
  },
  notchRow: {display: 'flex', height: 44, marginInlineStart: -13},
  notchBtn: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  notchBar: {width: 6, height: 16, borderRadius: 3, background: 'var(--color-background-muted)'},
  notchBarOn: {background: BRAND_ACCENT},
  duckCaption: {paddingBottom: 6, fontSize: 13, color: BRAND_TEXT},
  mixFootnote: {
    margin: '12px 16px 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, exact arithmetic cross-checks.
// Ledger (verified by hand): durations 96+288+228+108 = 720 = SESSION.
// totalSec = 12:00; start chain 0 → 96 → 96+288=384 → 384+228=612 →
// 612+108=720; breaths = durationSec/cycleSec exactly (96/8=12, 288/16=18,
// 228/19=12, 108/12=9) and 12+18+12+9 = 51 = SESSION.totalBreaths; segment
// widths 96/720=13.33% + 288/720=40% + 228/720=31.67% + 108/720=15% = 100%.
// Initial positionSec 192 ⇒ chapter 2 (96 ≤ 192 < 384), chapterElapsed 96,
// active fill 96/288 = 33.3%, breaths done 96/16 = 6 of 18, cycle offset
// 96 % 16 = 0 ⇒ 'Inhale', counter 4, arc 0%; elapsed 3:12, remaining
// 720−192 = 528 s ⇒ '-8:48'.
// ---------------------------------------------------------------------------

const SESSION = {
  id: 'ses-0412',
  title: 'Evening Wind-Down',
  teacher: 'Maren Ost',
  totalSec: 720,
  totalLabel: '12:00',
  totalBreaths: 51,
};

type PhaseName = 'Inhale' | 'Hold' | 'Exhale';

interface BreathPattern {
  name: string;
  phases: Array<[PhaseName, number]>;
  cycleSec: number;
}

interface Chapter {
  id: string;
  title: string;
  startSec: number;
  durationSec: number;
  durationLabel: string;
  pattern: BreathPattern;
  breaths: number;
  tintStrength: number; // % of BRAND_ACCENT in the chapter's radial wash
}

const CHAPTERS: Chapter[] = [
  {
    id: 'ch-intro',
    title: 'Intro',
    startSec: 0,
    durationSec: 96,
    durationLabel: '1:36',
    pattern: {name: 'Coherent 4-4', phases: [['Inhale', 4], ['Exhale', 4]], cycleSec: 8},
    breaths: 12,
    tintStrength: 8,
  },
  {
    id: 'ch-box',
    title: 'Box Breathing',
    startSec: 96,
    durationSec: 288,
    durationLabel: '4:48',
    pattern: {
      name: 'Box 4-4-4-4',
      phases: [['Inhale', 4], ['Hold', 4], ['Exhale', 4], ['Hold', 4]],
      cycleSec: 16,
    },
    breaths: 18,
    tintStrength: 14,
  },
  {
    // navBar 200px-slot + 60px-sheet-row ellipsis stress (in-data).
    id: 'ch-scan',
    title: 'Body Scan — Shoulders, Jaw & Brow',
    startSec: 384,
    durationSec: 228,
    durationLabel: '3:48',
    pattern: {name: 'Relax 4-7-8', phases: [['Inhale', 4], ['Hold', 7], ['Exhale', 8]], cycleSec: 19},
    breaths: 12,
    tintStrength: 11,
  },
  {
    id: 'ch-close',
    title: 'Close',
    startSec: 612,
    durationSec: 108,
    durationLabel: '1:48',
    pattern: {name: 'Settle 6-6', phases: [['Inhale', 6], ['Exhale', 6]], cycleSec: 12},
    breaths: 9,
    tintStrength: 6,
  },
];

interface MixLayer {
  id: string;
  name: string;
}

// The Kyoto chimes name is the 72px-row ellipsis stress beside the 44×44
// mute toggle at 320px; Chimes is also the layer the derived duck targets.
const MIX_LAYERS: MixLayer[] = [
  {id: 'mix-rain', name: 'Rain'},
  {id: 'mix-drone', name: 'Low Drone'},
  {id: 'mix-chimes', name: 'Singing Bowl Chimes (Kyoto Field Recording)'},
];

const ROUTES = [
  {id: 'rt-phone', name: 'This Phone'},
  {id: 'rt-speaker', name: 'Aster Bedroom Speaker'},
  {id: 'rt-buds', name: 'Studio Headphones'},
];

// Duck law: for chapters 2–4, while chapterElapsed < DUCK_WINDOW_SEC and
// Chimes is unmuted, the EFFECTIVE displayed Chimes level = max(0, level −
// DUCK_DROP). Derived from positionSec — never a side effect — so scrubbing
// into 6:24–6:32 (384–392) shows the ducked bars deterministically.
const DUCK_WINDOW_SEC = 8;
const DUCK_DROP = 2;

// ---------------------------------------------------------------------------
// PURE DERIVATIONS — every visible value is a function of positionSec.
// ---------------------------------------------------------------------------

/** Seconds → 'M:SS' (192 → '3:12'; 0 → '0:00'). */
function fmtClock(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

/** Last chapter whose startSec ≤ positionSec (720 still maps to Close). */
function chapterIndexFor(positionSec: number): number {
  let index = 0;
  for (let i = 0; i < CHAPTERS.length; i++) {
    if (CHAPTERS[i].startSec <= positionSec) index = i;
  }
  return index;
}

interface PhaseState {
  phase: PhaseName;
  phaseProgress: number; // 0..1 within the phase
  secondsLeft: number; // whole-second countdown shown at 34px
  scale: number; // 1.0–1.18, transform-only
  fillHigh: boolean; // reduced-motion phase encoding (20% vs 12%)
}

/**
 * Walk pattern.phases at a whole-second cycle offset. Inhale ramps 1.0 →
 * 1.18, Exhale ramps 1.18 → 1.0, Hold keeps the scale it inherited (so a
 * box cycle reads 1.0→1.18, held, 1.18→1.0, held). fillHigh mirrors the
 * held/target scale for the reduced-motion 12%→20%→20%→12% color walk.
 * Spec check: offset 15 in Box 4-4-4-4 ⇒ final 'Hold', secondsLeft 1.
 */
function phaseAt(pattern: BreathPattern, cycleOffset: number): PhaseState {
  let t = cycleOffset % pattern.cycleSec;
  let entryScale = 1.0;
  for (const [phase, durationSec] of pattern.phases) {
    const exitScale = phase === 'Inhale' ? 1.18 : phase === 'Exhale' ? 1.0 : entryScale;
    if (t < durationSec) {
      const phaseProgress = t / durationSec;
      return {
        phase,
        phaseProgress,
        secondsLeft: durationSec - t,
        scale: entryScale + (exitScale - entryScale) * phaseProgress,
        fillHigh: phase === 'Inhale' || (phase === 'Hold' && entryScale > 1.09),
      };
    }
    entryScale = exitScale;
    t -= durationSec;
  }
  // Unreachable: phases sum to cycleSec by fixture law.
  return {phase: 'Inhale', phaseProgress: 0, secondsLeft: pattern.phases[0][1], scale: 1, fillHigh: true};
}

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

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — the sheet traps focus while open; Escape closes the
// topmost overlay only; focus restores to the opener on every close path.
// ---------------------------------------------------------------------------

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
// STILLPOINT MARK — 20px inline SVG: three concentric rounded squares
// rotated 0/15/30° around center, 1.5px --color-text-secondary strokes,
// 3px BRAND_ACCENT center dot. (Any SVG text would use
// var(--color-text-primary) — var(--color-text) does not exist.)
// ---------------------------------------------------------------------------

function StillpointMark() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x={2.5} y={2.5} width={15} height={15} rx={4} stroke="var(--color-text-secondary)" strokeWidth={1.5} />
      <rect
        x={4}
        y={4}
        width={12}
        height={12}
        rx={4}
        stroke="var(--color-text-secondary)"
        strokeWidth={1.5}
        transform="rotate(15 10 10)"
      />
      <rect
        x={5.5}
        y={5.5}
        width={9}
        height={9}
        rx={3}
        stroke="var(--color-text-secondary)"
        strokeWidth={1.5}
        transform="rotate(30 10 10)"
      />
      <circle cx={10} cy={10} r={1.5} fill={BRAND_ACCENT} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// BREATH ORB — 196×196 SVG arc ring + 180px scaling orb, all props derived
// from positionSec. The arc is a circle r=94 (C = 2π·94 ≈ 590.6) whose
// dashoffset = C·(1 − phaseProgress); the orb scales via transform only
// (1000 ms linear per 1 s tick). Reduced motion: no scale, arc still
// renders per tick without transition, and phase is additionally encoded
// by the orb fill stepping 12%/20%/20%/12% across a box cycle. The whole
// per-second surface is aria-hidden — a visually-hidden static summary
// sits beside it and the toast is the single announcer.
// ---------------------------------------------------------------------------

const ARC_C = 2 * Math.PI * 94; // ≈ 590.6

interface BreathOrbProps {
  phaseState: PhaseState;
  patternName: string;
  breathsDone: number;
  breathsTotal: number;
  reducedMotion: boolean;
}

function BreathOrb({phaseState, patternName, breathsDone, breathsTotal, reducedMotion}: BreathOrbProps) {
  const {phase, phaseProgress, secondsLeft, scale, fillHigh} = phaseState;
  // Normal: constant 18% brand fill (motion carries the phase). Reduced
  // motion: stepped 20%/12% fill carries it instead.
  const fillStrength = reducedMotion ? (fillHigh ? 20 : 12) : 18;
  return (
    <div style={styles.orbBlock}>
      <div style={styles.orbWrap} aria-hidden>
        <svg width={196} height={196} viewBox="0 0 196 196" fill="none" style={styles.orbSvg}>
          <circle cx={98} cy={98} r={94} stroke="var(--color-border)" strokeWidth={3} />
          <circle
            cx={98}
            cy={98}
            r={94}
            stroke={BRAND_ACCENT}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${ARC_C.toFixed(1)}`}
            strokeDashoffset={(ARC_C * (1 - phaseProgress)).toFixed(1)}
            transform="rotate(-90 98 98)"
          />
        </svg>
        <div
          className="stp-orb"
          style={{
            ...styles.orb,
            background: `color-mix(in srgb, ${BRAND_ACCENT} ${fillStrength}%, var(--color-background-card))`,
            transform: reducedMotion ? undefined : `scale(${scale.toFixed(3)})`,
          }}>
          <div style={styles.orbStack}>
            <span style={styles.phaseLabel}>{phase}</span>
            <span style={styles.beatCounter}>{secondsLeft}</span>
          </div>
        </div>
      </div>
      <span className="stp-vh">
        {patternName} breathing — follow the orb; phases change every few seconds.
      </span>
      <span style={styles.orbCaption} aria-hidden>
        {patternName} · breath {breathsDone} of {breathsTotal}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BEAD TIMELINE — 44px pointer hit zone (scrub = clientX → seconds via the
// zone rect), visual 6px track with four duration-weighted segments
// (flex-grow 96/288/228/108 = 13.33/40/31.67/15%). Completed segments fill
// solid, the active one fills fractionally, futures stay muted. The four
// chapter-start beads are 44×44 <button>s — the visible non-gesture scrub
// path — and the zone itself is a focusable slider (ArrowLeft/Right ±15 s).
// ---------------------------------------------------------------------------

interface BeadTimelineProps {
  positionSec: number;
  chapterIndex: number;
  onScrub: (positionSec: number) => void;
  onScrubEnd: () => void;
  onJump: (chapterIdx: number) => void;
  onNudge: (deltaSec: number) => void;
}

function BeadTimeline({positionSec, chapterIndex, onScrub, onScrubEnd, onJump, onNudge}: BeadTimelineProps) {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const secondsAtX = (clientX: number): number => {
    const rect = zoneRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return positionSec;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(SESSION.totalSec, Math.round(SESSION.totalSec * ratio)));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onScrub(secondsAtX(event.clientX));
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    onScrub(secondsAtX(event.clientX));
  };
  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    onScrubEnd();
  };

  return (
    <div
      ref={zoneRef}
      className="stp-focusable"
      style={styles.timelineZone}
      role="slider"
      tabIndex={0}
      aria-label="Session position"
      aria-valuemin={0}
      aria-valuemax={SESSION.totalSec}
      aria-valuenow={positionSec}
      aria-valuetext={`${fmtClock(positionSec)} of ${SESSION.totalLabel}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          onNudge(-15);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          onNudge(15);
        }
      }}>
      <div style={styles.track} aria-hidden>
        {CHAPTERS.map((chapter, index) => {
          const fillPct =
            index < chapterIndex
              ? 100
              : index === chapterIndex
                ? (100 * (positionSec - chapter.startSec)) / chapter.durationSec
                : 0;
          return (
            <div key={chapter.id} style={{...styles.segment, flexGrow: chapter.durationSec}}>
              {fillPct > 0 ? <div style={{...styles.segmentFill, width: `${fillPct.toFixed(1)}%`}} /> : null}
            </div>
          );
        })}
      </div>
      {CHAPTERS.map((chapter, index) => {
        const pct = (100 * chapter.startSec) / SESSION.totalSec;
        const reached = positionSec >= chapter.startSec;
        const isActive = index === chapterIndex;
        return (
          <button
            key={chapter.id}
            type="button"
            className="stp-btn stp-focusable"
            style={{...styles.beadBtn, left: `calc(${pct.toFixed(2)}% - 22px)`}}
            aria-label={`Jump to ${chapter.title}`}
            onPointerDown={event => event.stopPropagation()}
            onClick={() => onJump(index)}>
            <span
              style={{
                ...styles.bead,
                ...(reached ? styles.beadReached : null),
                ...(isActive ? styles.beadActive : null),
              }}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AMBIENT MIX ROW — minHeight 72: line 1 = layer name (ellipsis stress) +
// 44×44 aria-pressed mute toggle; line 2 = five 44×44 notch buttons
// rendering 6×16px level bars (5 × 44 = 220px). Displays the EFFECTIVE
// duck-adjusted level; tapping notch k sets level k, tapping the current
// level sets k−1 (so 0 is reachable). Muted dims bars to 40% opacity and
// suppresses duck rendering (mute wins).
// ---------------------------------------------------------------------------

interface AmbientMixRowProps {
  layer: MixLayer;
  level: number;
  effectiveLevel: number;
  muted: boolean;
  ducking: boolean;
  onSetLevel: (level: number) => void;
  onToggleMute: () => void;
}

function AmbientMixRow({layer, level, effectiveLevel, muted, ducking, onSetLevel, onToggleMute}: AmbientMixRowProps) {
  const shownLevel = muted ? level : effectiveLevel;
  return (
    <div style={styles.mixRow}>
      <div style={styles.mixLine1}>
        <span style={{...styles.mixName, ...(muted ? styles.mixNameMuted : null)}}>{layer.name}</span>
        <button
          type="button"
          className="stp-btn stp-focusable"
          style={styles.muteBtn}
          aria-label={`Mute ${layer.name}`}
          aria-pressed={muted}
          onClick={onToggleMute}>
          <Icon icon={muted ? VolumeXIcon : Volume2Icon} size="md" color="inherit" />
        </button>
      </div>
      <div style={{...styles.notchRow, opacity: muted ? 0.4 : 1}}>
        {[1, 2, 3, 4, 5].map(notch => (
          <button
            key={notch}
            type="button"
            className="stp-btn stp-focusable"
            style={styles.notchBtn}
            aria-label={`Set ${layer.name} to level ${notch === level ? notch - 1 : notch} of 5`}
            onClick={() => onSetLevel(notch === level ? notch - 1 : notch)}>
            <span
              style={{...styles.notchBar, ...(notch <= shownLevel ? styles.notchBarOn : null)}}
              aria-hidden
            />
          </button>
        ))}
      </div>
      {ducking && !muted ? <span style={styles.duckCaption}>ducking for chapter change</span> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — everything mutable lives here; all derived values are
// pure functions of positionSec so ticking and scrubbing are the same code
// path. The toast is a PERSISTENT status pill (the one polite live region):
// it always shows the latest user-initiated result and never announces
// per-second ticks.
// ---------------------------------------------------------------------------

interface MixState {
  level: number;
  muted: boolean;
}

interface PlayerState {
  positionSec: number;
  playing: boolean;
  mix: Record<string, MixState>;
  routeId: string;
  sheetOpen: boolean;
  detent: 'medium' | 'large';
  routeMenuOpen: boolean;
  toast: {seq: number; text: string};
}

const INITIAL_STATE: PlayerState = {
  positionSec: 192,
  playing: false,
  mix: {
    'mix-rain': {level: 4, muted: false},
    'mix-drone': {level: 3, muted: false},
    'mix-chimes': {level: 2, muted: false},
  },
  routeId: 'rt-phone',
  sheetOpen: false,
  detent: 'large',
  routeMenuOpen: false,
  toast: {seq: 0, text: 'Paused at 3:12'},
};

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileMeditationBreathPlayerTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  // Container width > 560 → centered 430px phone column (desktop stage);
  // the viewport query is only the first-frame fallback.
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth > 560 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [session, setSession] = useState<PlayerState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<PlayerState>) => {
    setSession(prev => ({...prev, ...patch}));
  }, []);
  const updateMix = useCallback((id: string, patch: Partial<MixState>) => {
    setSession(prev => ({...prev, mix: {...prev.mix, [id]: {...prev.mix[id], ...patch}}}));
  }, []);
  const announce = useCallback((text: string, extra?: Partial<PlayerState>) => {
    setSession(prev => ({...prev, ...extra, toast: {seq: prev.toast.seq + 1, text}}));
  }, []);

  // Focus plumbing — opener restored on every close path.
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const footerOpenerRef = useRef<HTMLButtonElement | null>(null);
  const airplayRef = useRef<HTMLButtonElement | null>(null);
  const routeMenuRef = useRef<HTMLDivElement | null>(null);

  // DERIVED — all pure functions of positionSec.
  const {positionSec, playing, mix, routeId, sheetOpen, detent, routeMenuOpen, toast} = session;
  const chapterIndex = chapterIndexFor(positionSec);
  const chapter = CHAPTERS[chapterIndex];
  const chapterElapsed = positionSec - chapter.startSec;
  const phaseState = phaseAt(chapter.pattern, chapterElapsed);
  const breathsDone = Math.min(chapter.breaths, Math.floor(chapterElapsed / chapter.pattern.cycleSec));
  const elapsedLabel = fmtClock(positionSec);
  const remainingLabel = `-${fmtClock(SESSION.totalSec - positionSec)}`;
  const routeActive = routeId !== 'rt-phone';
  const routeName = ROUTES.find(route => route.id === routeId)?.name ?? 'This Phone';
  // Derived duck — chapters 2–4, first 8 s, unmuted Chimes only.
  const duckActive = chapterIndex >= 1 && chapterElapsed < DUCK_WINDOW_SEC;
  const effectiveLevelFor = (id: string): number => {
    const layerMix = mix[id];
    if (id === 'mix-chimes' && duckActive && !layerMix.muted) {
      return Math.max(0, layerMix.level - DUCK_DROP);
    }
    return layerMix.level;
  };

  // TICK — the only timer; 1000 ms while playing, clamped at 720 where it
  // pauses and announces completion.
  useEffect(() => {
    if (!playing) return undefined;
    const interval = setInterval(() => {
      setSession(prev => {
        const next = Math.min(SESSION.totalSec, prev.positionSec + 1);
        if (next >= SESSION.totalSec) {
          return {
            ...prev,
            positionSec: SESSION.totalSec,
            playing: false,
            toast: {seq: prev.toast.seq + 1, text: 'Session complete · 51 breaths'},
          };
        }
        return {...prev, positionSec: next};
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playing]);

  // SHEET FOCUS — into the sheet via focus({preventScroll: true}) (batch-1
  // amendment: plain .focus() scroll-reveals the animating sheet inside the
  // locked overflow-hidden column and beaches it mid-screen); restore to
  // the footer opener on every close path.
  useEffect(() => {
    if (sheetOpen) sheetCloseRef.current?.focus({preventScroll: true});
  }, [sheetOpen]);
  useEffect(() => {
    if (routeMenuOpen) routeMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [routeMenuOpen]);

  const closeSheet = useCallback(() => {
    update({sheetOpen: false, detent: 'large'});
    footerOpenerRef.current?.focus();
  }, [update]);
  const closeRouteMenu = useCallback(() => {
    update({routeMenuOpen: false});
    airplayRef.current?.focus();
  }, [update]);

  // ESCAPE — topmost overlay only: route popover before sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (routeMenuOpen) closeRouteMenu();
      else if (sheetOpen) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [routeMenuOpen, sheetOpen, closeRouteMenu, closeSheet]);

  // VERBS — every displayed property has a button path.
  const togglePlay = () => {
    if (playing) {
      announce(`Paused at ${elapsedLabel}`, {playing: false});
    } else if (positionSec >= SESSION.totalSec) {
      announce('Restarted from the top', {positionSec: 0, playing: true});
    } else {
      announce('Playing', {playing: true});
    }
  };
  const skip = (deltaSec: number) => {
    setSession(prev => ({
      ...prev,
      positionSec: Math.max(0, Math.min(SESSION.totalSec, prev.positionSec + deltaSec)),
    }));
  };
  const jumpToChapter = (index: number) => {
    announce(`Jumped to ${CHAPTERS[index].title}`, {positionSec: CHAPTERS[index].startSec});
  };
  const scrubTo = (sec: number) => update({positionSec: sec});
  const scrubEnd = () => {
    // Functional read — pointermove scrubs may have committed between this
    // handler's render and the pointerup, so label from prev, never closure.
    setSession(prev =>
      prev.playing
        ? prev
        : {...prev, toast: {seq: prev.toast.seq + 1, text: `Paused at ${fmtClock(prev.positionSec)}`}},
    );
  };
  const selectRoute = (id: string) => {
    const route = ROUTES.find(entry => entry.id === id);
    announce(`Playing on ${route?.name ?? id}`, {routeId: id, routeMenuOpen: false});
    airplayRef.current?.focus();
  };
  const toggleMute = (id: string) => {
    const layer = MIX_LAYERS.find(entry => entry.id === id);
    const nextMuted = !mix[id].muted;
    updateMix(id, {muted: nextMuted});
    announce(`${layer?.name.split(' (')[0] ?? id} ${nextMuted ? 'muted' : 'unmuted'}`);
  };
  const setLevel = (id: string, level: number) => {
    const layer = MIX_LAYERS.find(entry => entry.id === id);
    updateMix(id, {level});
    announce(`${layer?.name.split(' (')[0] ?? id} · level ${level} of 5`);
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };
  const wrapStyle: CSSProperties = {
    ...styles.wrap,
    ...(isDesktopColumn ? styles.wrapDesktop : null),
  };

  return (
    <div ref={wrapRef} style={wrapStyle}>
      <style>{STP_CSS}</style>
      <div style={shellStyle}>
        {/* LAYER 0 — chapter tint crossfade (opacity-only, 600 ms; instant
            under reduced motion). One wash per chapter, token-mixed from
            the single brand literal at 8/14/11/6%. */}
        {CHAPTERS.map((tintChapter, index) => (
          <div
            key={tintChapter.id}
            className="stp-tint"
            aria-hidden
            style={{
              ...styles.tintLayer,
              background: `radial-gradient(120% 80% at 50% 30%, color-mix(in srgb, ${BRAND_ACCENT} ${tintChapter.tintStrength}%, transparent), transparent 70%)`,
              opacity: index === chapterIndex ? 1 : 0,
            }}
          />
        ))}

        <div style={styles.content}>
          <header style={styles.navBar}>
            <div style={styles.navLeading}>
              <button
                type="button"
                className="stp-btn stp-focusable"
                style={styles.iconBtn}
                aria-label="Close session"
                onClick={() => announce(`Session saved at ${elapsedLabel}`)}>
                <Icon icon={XIcon} size="md" color="inherit" />
              </button>
            </div>
            {/* Center = CURRENT chapter title (retitles on every crossing;
                chapter 3 is the 200px ellipsis stress). */}
            <span style={styles.navTitle}>{chapter.title}</span>
            <div style={styles.navTrailing}>
              <button
                type="button"
                ref={airplayRef}
                className="stp-btn stp-focusable"
                style={{...styles.iconBtn, ...(routeActive ? styles.iconBtnBrand : null)}}
                aria-label={`Audio route: ${routeName}`}
                aria-expanded={routeMenuOpen}
                onClick={() => update({routeMenuOpen: !routeMenuOpen, sheetOpen: false})}>
                <Icon icon={AirplayIcon} size="md" color="inherit" />
              </button>
            </div>
          </header>

          <main style={styles.hero}>
            <div style={styles.heroHeader}>
              <span style={styles.overlineRow}>
                <StillpointMark />
                <span style={styles.overline}>Stillpoint · Guided session</span>
              </span>
              <h1 style={styles.h1}>{SESSION.title}</h1>
              <span style={styles.heroCaption}>
                {SESSION.teacher} · {SESSION.totalLabel} · {SESSION.totalBreaths} breaths
              </span>
            </div>

            <BreathOrb
              phaseState={phaseState}
              patternName={chapter.pattern.name}
              breathsDone={breathsDone}
              breathsTotal={chapter.breaths}
              reducedMotion={reducedMotion}
            />

            <BeadTimeline
              positionSec={positionSec}
              chapterIndex={chapterIndex}
              onScrub={scrubTo}
              onScrubEnd={scrubEnd}
              onJump={jumpToChapter}
              onNudge={skip}
            />

            <div style={styles.readoutRow}>
              <span style={styles.readoutTime}>{elapsedLabel}</span>
              <span style={styles.chapterChip}>
                Chapter {chapterIndex + 1} of {CHAPTERS.length}
              </span>
              <span style={{...styles.readoutTime, ...styles.readoutTimeEnd}}>{remainingLabel}</span>
            </div>

            <div style={styles.transportRow}>
              <button
                type="button"
                className="stp-btn stp-focusable"
                style={styles.skipBtn}
                aria-label="Skip back 15 seconds"
                onClick={() => skip(-15)}>
                <Icon icon={RotateCcwIcon} size="md" color="inherit" />
                <span style={styles.skipNum} aria-hidden>
                  15
                </span>
              </button>
              <button
                type="button"
                className="stp-btn stp-focusable"
                style={styles.playBtn}
                aria-label={playing ? 'Pause' : 'Play'}
                onClick={togglePlay}>
                <Icon icon={playing ? PauseIcon : PlayIcon} size="lg" color="inherit" />
              </button>
              <button
                type="button"
                className="stp-btn stp-focusable"
                style={styles.skipBtn}
                aria-label="Skip forward 15 seconds"
                onClick={() => skip(15)}>
                <Icon icon={RotateCwIcon} size="md" color="inherit" />
                <span style={styles.skipNum} aria-hidden>
                  15
                </span>
              </button>
            </div>
          </main>

          {/* Sticky-in-flow toast dock — the ONE polite live region. */}
          <div style={styles.toastDock} role="status" aria-live="polite">
            <span key={toast.seq} style={styles.toastPill} className="stp-fade">
              {toast.text}
            </span>
          </div>

          <footer style={styles.stickyFooter}>
            <button
              type="button"
              ref={footerOpenerRef}
              className="stp-btn stp-focusable"
              style={styles.footerBtn}
              aria-expanded={sheetOpen}
              onClick={() => update({sheetOpen: true, detent: 'large', routeMenuOpen: false})}>
              <Icon icon={ListMusicIcon} size="sm" color="secondary" />
              Chapters &amp; Sound Mix
            </button>
          </footer>
        </div>

        {/* ROUTE POPOVER — anchored menu, z30 under the sheet scrim; outside
            click (catcher) and Escape close; focus returns to AirPlay. */}
        {routeMenuOpen ? (
          <>
            <div style={styles.clickCatcher} onClick={closeRouteMenu} aria-hidden />
            <div
              ref={routeMenuRef}
              role="menu"
              aria-label="Audio route"
              style={styles.routeMenu}
              onKeyDown={event => {
                if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                event.preventDefault();
                const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
                const index = items.indexOf(document.activeElement as HTMLElement);
                const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
                items[(next + items.length) % items.length]?.focus();
              }}>
              {ROUTES.map((route, index) => (
                <div key={route.id}>
                  {index > 0 ? <div style={styles.rowDivider} /> : null}
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={route.id === routeId}
                    className="stp-btn stp-focusable"
                    style={styles.routeRow}
                    onClick={() => selectRoute(route.id)}>
                    <span style={styles.routeCheck} aria-hidden>
                      {route.id === routeId ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                    </span>
                    <span style={styles.routeRowText}>{route.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {/* SHEET — opens LARGE; grabber click toggles MEDIUM; scrim/X/
            Escape close; focus trapped while open. */}
        {sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {sheetOpen ? (
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stp-sheet-title"
            tabIndex={-1}
            className="stp-sheet-in"
            onKeyDown={event => trapTabKey(event, sheetRef.current)}
            style={{...styles.sheet, height: detent === 'large' ? 'calc(100% - 56px)' : '55%'}}>
            <button
              type="button"
              className="stp-btn stp-focusable"
              style={styles.grabberZone}
              aria-label="Resize sheet"
              onClick={() => update({detent: detent === 'large' ? 'medium' : 'large'})}>
              <span style={styles.grabberPill} aria-hidden />
            </button>
            <div style={styles.sheetHeader}>
              <span aria-hidden />
              <h2 id="stp-sheet-title" style={styles.sheetTitle}>
                {SESSION.title}
              </h2>
              <button
                type="button"
                ref={sheetCloseRef}
                className="stp-btn stp-focusable"
                style={styles.iconBtn}
                aria-label="Close sheet"
                onClick={closeSheet}>
                <Icon icon={XIcon} size="md" color="inherit" />
              </button>
            </div>
            <div style={styles.sheetBody}>
              <h2 style={styles.sectionHeader}>Chapters</h2>
              <div style={styles.listCard}>
                {CHAPTERS.map((rowChapter, index) => {
                  const isNow = index === chapterIndex;
                  const isDone = positionSec >= rowChapter.startSec + rowChapter.durationSec;
                  return (
                    <div key={rowChapter.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <button
                        type="button"
                        className="stp-btn stp-focusable"
                        style={styles.chapterRow}
                        aria-label={`Jump to ${rowChapter.title}`}
                        aria-current={isNow ? 'true' : undefined}
                        onClick={() => jumpToChapter(index)}>
                        <span
                          style={{...styles.indexBead, ...(isNow ? styles.indexBeadActive : null)}}
                          aria-hidden>
                          {index + 1}
                        </span>
                        <span style={styles.rowText}>
                          <span style={styles.rowPrimary}>{rowChapter.title}</span>
                          <span style={styles.rowSecondary}>
                            {rowChapter.durationLabel} · {rowChapter.pattern.name} · {rowChapter.breaths} breaths
                          </span>
                        </span>
                        {isNow ? <span style={styles.nowChip}>NOW</span> : null}
                        {!isNow && isDone ? (
                          <span style={styles.doneCheck} aria-hidden>
                            <Icon icon={CheckIcon} size="sm" color="inherit" />
                          </span>
                        ) : null}
                      </button>
                    </div>
                  );
                })}
              </div>
              <h2 style={styles.sectionHeader}>Ambient mix</h2>
              <div style={styles.listCard}>
                {MIX_LAYERS.map((layer, index) => (
                  <div key={layer.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <AmbientMixRow
                      layer={layer}
                      level={mix[layer.id].level}
                      effectiveLevel={effectiveLevelFor(layer.id)}
                      muted={mix[layer.id].muted}
                      ducking={layer.id === 'mix-chimes' && duckActive}
                      onSetLevel={level => setLevel(layer.id, level)}
                      onToggleMute={() => toggleMute(layer.id)}
                    />
                  </div>
                ))}
              </div>
              <p style={styles.mixFootnote}>Mix is saved with this session</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
