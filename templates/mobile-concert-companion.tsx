// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Encore show-night companion for
 *   Velvet Static at The Foundry (Portland): a 20-song setlist (s01–s20,
 *   actualIndex 1–20 in render order, nowIndex 9 = 'Static Bloom'; sixteen
 *   main-set songs + four encore songs; durations sum to exactly 5040 s =
 *   84:00 — sixteen 4:00 songs adjusted in canceling pairs s03 4:30 /
 *   s04 3:30 and s07 4:12 / s08 3:48, plus four 5:00 encore songs); exactly
 *   two drift rows (row 5 'Neon Ritual' predicted #8 → 'moved up 3', row 12
 *   'Glasshouse' predicted #10 → 'moved back 2'); five venue landmarks with
 *   snap points in viewBox units (Stage 179,40 · The Pit 179,96 · Bar 60,190
 *   · Merch Table 290,190 · Gate C 60,252); four crew members with
 *   id-derived beacons (maya 179,96 · diego 60,190 · priya 290,190 all
 *   confirmed; sam 60,252 invited) → Crew badge '3', caption '3 of 4
 *   confirmed'; a fixed Night schedule (Doors 7:00 PM · Opener 8:00 PM ·
 *   Velvet Static 9:10 PM · Curfew 11:00 PM — no live clock) and two notes.
 *   No Date.now(), no Math.random(), no network media, no real maps or
 *   photos — the floorplan is a stylized inline SVG, avatars are id-derived
 *   gradients.
 * @output Encore — Concert Night Companion: a 390px MOBILE show-night
 *   surface. 52px navBar (44×44 ticket-stub brand mark · 'Velvet Static ·
 *   The Foundry' h1 · 44×44 Share) over a sticky 64px NowPlayingStrip
 *   (pulsing live dot, 'Static Bloom', '9 of 20', 45% progress bar —
 *   9/20 = 45%, arithmetic matches the label), four tab panels (Setlist /
 *   Venue / Crew / Night) and a 64px tabBar with a derived Crew badge.
 *   Signature move: ONE meetupStore — dragging the venue pin (or 'Pin
 *   here' in the two-detent landmark sheet, the full non-gesture parity
 *   path) snaps to the nearest of 5 landmark centers and five surfaces
 *   re-derive in the same render: the pin teleports, the MeetBanner
 *   sentence rewrites, all four friend-chip walk times recompute from
 *   beacon-to-pin geometry (walkMinutes = max(1, round(euclid/40)), ≤20 px
 *   renders 'at the spot'), the setlist rail's 'Meet here' flag stays
 *   pinned to afterSongIndex, and the single polite toast announces the
 *   move. The after-song stepper (spinbutton, min = nowIndex + 1) moves
 *   the rail flag and rewrites banner + toast; 'Mark next song' advances
 *   nowIndex 9→10 and strip/progress/played counts re-derive (9+1+10=20).
 *   Crew removal is undoOverConfirm: execute + Undo restoring exact list
 *   position, badge and caption re-derive both directions.
 * @position Page template; emitted by `astryx template mobile-concert-companion`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, crew menus) are position:'absolute'
 *   INSIDE shell; position:fixed is banned. While the landmark sheet is
 *   open, shell locks to {height:'100dvh', overflow:'hidden'} and restores
 *   on close; the toastDock is sticky-in-flow above the tabBar (bottom:76)
 *   and switches to shell-absolute ONLY during that scroll lock (the shell
 *   grows with content, so document-absolute pinning would beach the toast
 *   off-viewport on tall tabs). The stage clips to --radius-container;
 *   shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); the
 *   setlist rail is a custom full-bleed region (56px spine column), NOT a
 *   listCard. No desktop Layout frames, no asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand pair
 *   BRAND_ACCENT — the spec's #FF2D78 fails 4.5:1 on the light card, so
 *   the spec's own contrast-adjusted pair light-dark(#D81B60, #FF6FA5) is
 *   the quarantined literal (4.8:1 on #FFFDFB / 7.2:1 on #1E1A16). Per the
 *   batch-2 foundations amendment, meaningful rest-state fills (unplayed
 *   progress track, upcoming spine segments, upcoming node borders) use an
 *   explicit ≥3:1 pair REST_EDGE instead of hairline/muted tokens — math
 *   at the declaration. Drift-badge green/amber pairs carry their ratios
 *   at the declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr'); nowPlaying 64px sticky top:52
 *   z19 (total sticky chrome 52+64 = 116px); tabBar 64px sticky bottom
 *   z20; setlist rows 60px over a fixed 56px spine column (node center
 *   x=28); encore divider 44px; crew rows 72px media (40px avatar); Night
 *   utility rows 44px, note rows 60px; sheet detents 55% medium /
 *   calc(100% − 56px) large, 24px grabber zone with 36×5 pill, 52px sheet
 *   header, sheet landmark rows 60px; sectionHeader 13px/600 uppercase
 *   0.06em at 32px (16 gutter + 16 pad), 20px top / 8px bottom. TYPE
 *   (Figtree via --font-family-body): 17/600 nav + sheet titles ·
 *   16/400–600 body & row primary · 13/400 secondary · 11/500 overlines,
 *   tab labels, chips; nothing under 11px; tabular-nums on every updating
 *   numeral. Buttons: 48px primary (sheet footer) · 36px secondary inline
 *   · 44×44 icon. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   into a full-row button; every gesture has a visible button path (pin
 *   drag ↔ sheet 'Pin here' rows + Enter on the focused pin; sheet drag ↔
 *   grabber click + X + Escape; crew long-press ↔ visible 44×44 ellipsis).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow (overflowX:'clip' is a
 *   backstop only; no width:390 literals). The floorplan SVG scales via
 *   width:100% + fixed viewBox '0 0 358 280'; ALL snap math lives in
 *   viewBox units and pointer coords convert through the rendered
 *   width ratio, so snapping is identical at every width. At 320px the
 *   navBar h1 ellipsizes, the MeetBanner sentence wraps (minHeight 64,
 *   card grows), FriendBeaconRow flex-wraps to 2×2 chips, and setlist
 *   titles truncate first (spine column stays 56px fixed, badges keep 8px
 *   clearance via minWidth:0).
 * - Desktop stage (~1045px): measured via useElementWidth on the outer
 *   wrapper (container width, not viewport — the demo stage sits inside a
 *   1440px window) — at >560px measured width the shell becomes a centered
 *   phone column (maxWidth 430, marginInline auto, borderInline hairline).
 *   No adaptive relayout; the anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  BellIcon,
  CheckIcon,
  FlagIcon,
  ListMusicIcon,
  MapIcon,
  MapPinIcon,
  MinusIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Share2Icon,
  SkipForwardIcon,
  StickyNoteIcon,
  UserMinusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand pair (Encore rose — the spec's #FF2D78 is ~3.2:1 on
// the light card, so the spec's own adjusted pair ships): #D81B60 on
// #FFFDFB ≈ 4.8:1 ✓; #FF6FA5 on #1E1A16 ≈ 7.2:1 ✓.
const BRAND_ACCENT = 'light-dark(#D81B60, #FF6FA5)';
// Text/glyphs over a BRAND_ACCENT fill. Light: #FFFFFF on #D81B60 ≈ 5.0:1 ✓.
// Dark: white on #FF6FA5 fails (~1.9:1), so the dark side flips to a
// near-black rose — #33000F on #FF6FA5 ≈ 7.0:1 ✓.
const BRAND_ON = 'light-dark(#FFFFFF, #33000F)';
// Brand washes derive from the pair via color-mix — no extra hexes.
const BRAND_TINT = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// FOUNDATIONS AMENDMENT PAIR — meaningful rest-state fills and
// interactive-adjacent boundaries (upcoming node border, unplayed spine
// segment, unfilled progress track) must clear 3:1 against their ACTUAL
// surface, not lean on hairline tokens: #B8AEA4 vs light body/card
// #FFFDFB ≈ 3.2:1 ✓; #6E645C vs dark body/card #1E1A16 ≈ 3.1:1 ✓.
const REST_EDGE = 'light-dark(#B8AEA4, #6E645C)';
// Drift badge 'moved up N' (earlier than predicted): #FFFFFF on #0B7A4B ≈
// 4.6:1 ✓; #0E1B14 on #4ADE9C ≈ 8.9:1 ✓.
const DRIFT_UP_FILL = 'light-dark(#0B7A4B, #4ADE9C)';
const DRIFT_UP_TEXT = 'light-dark(#FFFFFF, #0E1B14)';
// Drift badge 'moved back N': #FFFFFF on #8A5A00 ≈ 4.5:1 ✓; #1F1503 on
// #F0B454 ≈ 9.3:1 ✓.
const DRIFT_BACK_FILL = 'light-dark(#8A5A00, #F0B454)';
const DRIFT_BACK_TEXT = 'light-dark(#FFFFFF, #1F1503)';
// Friend-beacon dot — categorical token with repo-standard fallback, ringed
// in card background so it separates from the muted floorplan shapes.
const BEACON_DOT = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
// Kit-standard sheet scrim pair (mobile foundations).
const SCRIM = 'light-dark(rgba(21,17,12,0.32), rgba(0,0,0,0.55))';
// Nav/strip/tab blur surface — kit contract; hairline ALWAYS ON (declared
// choice, no scroll-under wiring).
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// KEYFRAMES + PSEUDO-STATE CSS — :focus-visible rings, the button reset,
// the visually-hidden helper, pulse/slide keyframes, and the reduced-motion
// guard. Transitions animate transform/opacity only and collapse to instant
// under prefers-reduced-motion; the live-dot pulse and now-node pulse ring
// are REMOVED under reduced motion (static brand fill still encodes 'now').
// ---------------------------------------------------------------------------

const ENCORE_CSS = `
.enc-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.enc-btn:disabled { cursor: default; }
.enc-shell button:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.enc-shell [role='spinbutton']:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.enc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@keyframes enc-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
@keyframes enc-ring {
  0% { transform: scale(0.8); opacity: 0.9; }
  100% { transform: scale(1.35); opacity: 0; }
}
@keyframes enc-sheet-up {
  from { transform: translateY(32px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
@keyframes enc-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
.enc-live-dot { animation: enc-pulse 1.8s ease-in-out infinite; }
.enc-pulse-ring { animation: enc-ring 1.6s ease-out infinite; }
.enc-sheet-in { animation: enc-sheet-up 240ms ease; }
.enc-fade-in { animation: enc-fade 200ms ease; }
@media (hover: hover) {
  .enc-shell .enc-hoverable:hover {
    background-color: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
  }
}
@media (prefers-reduced-motion: reduce) {
  .enc-live-dot { animation: none; }
  .enc-pulse-ring { display: none; }
  .enc-sheet-in { animation: enc-fade 1ms linear; }
  .enc-fade-in { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, tabBar, tabItem,
// sheetScrim, sheet, listCard, rowDivider, sectionHeader.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width.
  stageOuter: {width: '100%'},
  stageCenter: {
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
  shellCentered: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // Scroll lock while the landmark sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 buttons
  // optically align content to the 16px gutter; hairline always on.
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    height: 52,
    paddingInline: 8,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navSlotLead: {display: 'flex', justifyContent: 'flex-start'},
  navSlotTrail: {display: 'flex', justifyContent: 'flex-end'},
  navIconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  brandMarkBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  navTitle: {
    maxWidth: 200,
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    lineHeight: '22px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  // NOW PLAYING STRIP — sticky top:52 z19, 64px total (row + 3px track);
  // same blur surface; whole strip is one button (tap → Setlist, scroll
  // the now-row into view).
  nowPlaying: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    width: '100%',
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  stripRow: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  stripDot: {
    width: 10,
    height: 10,
    flexShrink: 0,
    borderRadius: 999,
    background: BRAND_ACCENT,
  },
  stripText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  stripOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  stripTitle: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stripMeta: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 3px progress track — REST_EDGE amendment pair (unplayed fill is a
  // meaningful rest state; the muted token is <3:1 on the blur chrome).
  stripTrack: {width: '100%', height: 3, background: REST_EDGE},
  stripFill: {height: '100%', background: BRAND_ACCENT},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // sectionHeader — 13/600 uppercase 0.06em at 32px, 20px top / 8px bottom.
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
  // Setlist header row — sectionHeader text + trailing 44×44 'Mark next
  // song' button (the demonstrable nowIndex advance; no network fiction).
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '12px 0 0',
    paddingInlineEnd: 8,
  },
  sectionHeaderGrow: {flex: 1, minWidth: 0},
  headerActionBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  headerActionDisabled: {opacity: 0.35},
  // SETLIST RAIL — custom full-bleed region; 60px rows over a fixed 56px
  // spine column (node centered at x=28).
  rail: {display: 'flex', flexDirection: 'column'},
  railRowWrap: {position: 'relative'},
  railRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'stretch',
  },
  spineCol: {position: 'relative', width: 56, flexShrink: 0},
  // Spine 2px at x=27..29; played segment BRAND_ACCENT, upcoming segment
  // REST_EDGE (amendment: future-segment rest fill needs ≥3:1, hairline
  // token is passive-separator-only).
  spineTop: {position: 'absolute', left: 27, top: 0, bottom: '50%', width: 2},
  spineBottom: {position: 'absolute', left: 27, top: '50%', bottom: 0, width: 2},
  nodeAnchor: {
    position: 'absolute',
    left: 28,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'grid',
    placeItems: 'center',
  },
  nodePlayed: {
    width: 20,
    height: 20,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-text-secondary)',
    // Check glyph in card-bg (reads white in light / near-black in dark —
    // spec said white; white on the LIGHT text-secondary dark-mode fill
    // fails, so the glyph uses the scheme-correct inverse).
    color: 'var(--color-background-card)',
  },
  nodeNowWrap: {position: 'relative', width: 28, height: 28},
  nodeNow: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
  },
  nodeNowDot: {width: 8, height: 8, borderRadius: 999, background: BRAND_ON},
  nodePulseRing: {
    position: 'absolute',
    inset: -5,
    borderRadius: 999,
    border: `2px solid ${BRAND_ACCENT}`,
    pointerEvents: 'none',
  },
  nodeUpcoming: {
    width: 20,
    height: 20,
    borderRadius: 999,
    background: 'var(--color-background-body)',
    border: `2px solid ${REST_EDGE}`,
  },
  railText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
  },
  railTitle: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  railSub: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  railTrailing: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 8,
    paddingInlineEnd: 16,
    flexShrink: 0,
  },
  driftBadge: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  driftUp: {background: DRIFT_UP_FILL, color: DRIFT_UP_TEXT},
  driftBack: {background: DRIFT_BACK_FILL, color: DRIFT_BACK_TEXT},
  meetChip: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 8,
    borderRadius: 999,
    background: BRAND_TINT,
    color: BRAND_ACCENT,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  // 60px inline expansion under a tapped row; spine continues through it.
  railExpansion: {
    position: 'relative',
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInlineStart: 56,
    paddingInlineEnd: 16,
  },
  expSpine: {position: 'absolute', left: 27, top: 0, bottom: 0, width: 2},
  expLine: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  expLineStrong: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // ENCORE DIVIDER — 44px, centered 11/600 uppercase between hairlines.
  encoreDivider: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  dividerLine: {flex: 1, height: 1, background: 'var(--color-border)'},
  dividerLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // MEET BANNER — listCard geometry; minHeight 64 so the sentence wraps
  // and the card grows at 320px.
  banner: {
    minHeight: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px 10px 16px',
  },
  bannerIcon: {color: BRAND_ACCENT, flexShrink: 0, display: 'inline-flex'},
  bannerText: {flex: 1, minWidth: 0, fontSize: 16, fontWeight: 500, lineHeight: '22px'},
  bannerNow: {fontSize: 13, fontWeight: 600, color: BRAND_ACCENT, whiteSpace: 'nowrap'},
  changeBtn: {
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
    alignSelf: 'center',
  },
  // VENUE PIN MAP — full-gutter card; SVG width 100%, viewBox 0 0 358 280.
  mapCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  mapWrap: {position: 'relative', width: '100%'},
  mapSvg: {display: 'block', width: '100%', height: 'auto'},
  // Pin — 28px circle atop a 2px stem; the button anchors its bottom-center
  // (the stem tip) on the landmark snap point via translate(-50%, -100%).
  pinBtn: {
    position: 'absolute',
    width: 44,
    height: 48,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    transform: 'translate(-50%, -100%)',
    touchAction: 'none',
    zIndex: 3,
    borderRadius: 12,
  },
  pinCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_ON,
    boxShadow: '0 2px 8px var(--color-shadow)',
  },
  pinStem: {width: 2, height: 10, background: BRAND_ACCENT},
  beaconBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
    borderRadius: 999,
  },
  beaconDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: BEACON_DOT,
    boxShadow: '0 0 0 2px var(--color-background-card)',
  },
  beaconDotInvited: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: 'transparent',
    border: `2px solid ${BEACON_DOT}`,
    boxShadow: '0 0 0 2px var(--color-background-card)',
  },
  // FRIEND BEACON ROW — 44px chips, 8px gaps, flexWrap (no h-scroll).
  beaconRail: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    paddingInline: 16,
  },
  friendChip: {
    height: 44,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 8,
    paddingInlineEnd: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  chipAvatar: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#33202B',
  },
  chipText: {display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0},
  chipName: {fontSize: 13, fontWeight: 600, lineHeight: '16px', whiteSpace: 'nowrap'},
  chipCaption: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '13px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 44px utility rows (Night schedule, 'All landmarks →').
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  utilityLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  utilityValue: {
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  utilityLink: {fontSize: 16, fontWeight: 500, color: BRAND_ACCENT, whiteSpace: 'nowrap'},
  // CREW — 72px media rows (40px avatar), trailing 44×44 ellipsis.
  crewRowWrap: {position: 'relative'},
  crewRow: {
    display: 'flex',
    alignItems: 'center',
  },
  crewRowMain: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    touchAction: 'pan-y',
  },
  crewAvatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#33202B',
  },
  crewText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  crewName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  crewStatus: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ellipsisBtn: {
    width: 44,
    height: 44,
    marginInlineEnd: 8,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // Anchored crew menu — absolute card, 44px rows, z30 (below sheet z40).
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    top: 60,
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
  menuRowDanger: {color: 'var(--color-error)'},
  crewCaption: {
    margin: '12px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // NIGHT — note rows 60px with trailing remove.
  noteRow: {display: 'flex', alignItems: 'center'},
  noteMain: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInlineStart: 16,
  },
  noteText: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  noteSub: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // EMPTY STATE (true-empty notes) — kit anatomy verbatim.
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
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '4px 0 16px',
    lineHeight: '18px',
  },
  emptyBtn: {
    height: 36,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // TAB BAR — exactly 64px, 4 tabs flex:1.
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
    color: BRAND_ON,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow (height 0) pinned 76px above the viewport
  // bottom (12px above the 64px tabBar); shell-absolute ONLY while the
  // sheet scroll-lock is active (amendment: absolute pins to the DOCUMENT
  // bottom on tall unlocked views).
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
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
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
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
  // The ONE legal inner scroller.
  sheetContent: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 8},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  doneBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // Landmark rows — 60px, 20px glyph, trailing 36px 'Pin here'.
  landmarkRow: {display: 'flex', alignItems: 'center', minHeight: 60, paddingInlineEnd: 12},
  landmarkMain: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    paddingBlock: 12,
  },
  landmarkGlyph: {
    width: 20,
    height: 20,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  landmarkGlyphActive: {color: BRAND_ACCENT},
  landmarkText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  landmarkName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  landmarkNameActive: {color: BRAND_ACCENT, fontWeight: 600},
  landmarkDist: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  pinHereBtn: {
    height: 36,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  pinHereActive: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT,
  },
  // Stepper — 96×32 track split by a center hairline; value adjacent,
  // spinbutton semantics on the value.
  stepperRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  stepperValue: {
    minWidth: 28,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 6,
  },
  stepperTrack: {
    width: 96,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperHalfDisabled: {opacity: 0.35},
  stepperHairline: {width: 1, background: 'var(--color-border)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checking aggregates.
// Ledger (verified by hand): played 8 + now 1 + upcoming 11 = 20 ✓; main 16
// + encore 4 = 20 ✓; durations 12×240 + 270 + 210 + 252 + 228 (main pairs
// ±30/±12 cancel) = 3840, + 4×300 encore = 5040 s = 84:00 → '20 songs ·
// 84 min planned' ✓; strip 9/20 = 45% progress ✓; drift row 5 predicted 8 →
// 8−5 = 3 'moved up 3' ✓; drift row 12 predicted 10 → 12−10 = 2 'moved
// back 2' ✓; confirmed crew = maya+diego+priya = 3 → badge '3', caption
// '3 of 4 confirmed' ✓.
// ---------------------------------------------------------------------------

const BAND = 'Velvet Static';
const VENUE = 'The Foundry';
const CITY = 'Portland';

type TabId = 'setlist' | 'venue' | 'crew' | 'night';
type LandmarkId = 'stage' | 'pit' | 'bar' | 'merch' | 'gatec';

interface Song {
  id: string;
  title: string;
  durationSec: number;
  durationLabel: string;
  predictedIndex: number;
  actualIndex: number; // render order 1–20
}

const MAIN_SET_COUNT = 16;
const ENCORE_COUNT = 4;

// s14 is the long-title truncation stress (must ellipsize single-line at
// 320px); s05/s12 are the only drift rows.
const SONGS: Song[] = [
  {id: 's01', title: 'Wireframe Heart', durationSec: 240, durationLabel: '4:00', predictedIndex: 1, actualIndex: 1},
  {id: 's02', title: 'Copper Veins', durationSec: 240, durationLabel: '4:00', predictedIndex: 2, actualIndex: 2},
  {id: 's03', title: 'Slow Static', durationSec: 270, durationLabel: '4:30', predictedIndex: 3, actualIndex: 3},
  {id: 's04', title: 'Milk Teeth', durationSec: 210, durationLabel: '3:30', predictedIndex: 4, actualIndex: 4},
  {id: 's05', title: 'Neon Ritual', durationSec: 240, durationLabel: '4:00', predictedIndex: 8, actualIndex: 5},
  {id: 's06', title: 'Half-Life Lullaby', durationSec: 240, durationLabel: '4:00', predictedIndex: 6, actualIndex: 6},
  {id: 's07', title: 'Vantablack Prom', durationSec: 252, durationLabel: '4:12', predictedIndex: 7, actualIndex: 7},
  {id: 's08', title: 'Ghost Frequency', durationSec: 228, durationLabel: '3:48', predictedIndex: 8, actualIndex: 8},
  {id: 's09', title: 'Static Bloom', durationSec: 240, durationLabel: '4:00', predictedIndex: 9, actualIndex: 9},
  {id: 's10', title: 'Paper Planets', durationSec: 240, durationLabel: '4:00', predictedIndex: 10, actualIndex: 10},
  {id: 's11', title: 'Louder Than Rain', durationSec: 240, durationLabel: '4:00', predictedIndex: 11, actualIndex: 11},
  {id: 's12', title: 'Glasshouse', durationSec: 240, durationLabel: '4:00', predictedIndex: 10, actualIndex: 12},
  {id: 's13', title: 'Second Skin', durationSec: 240, durationLabel: '4:00', predictedIndex: 13, actualIndex: 13},
  {
    id: 's14',
    title: "The Cartographer's Lament (Extended Reprise)",
    durationSec: 240,
    durationLabel: '4:00',
    predictedIndex: 14,
    actualIndex: 14,
  },
  {id: 's15', title: 'Motel Halo', durationSec: 240, durationLabel: '4:00', predictedIndex: 15, actualIndex: 15},
  {id: 's16', title: 'Dead Channels', durationSec: 240, durationLabel: '4:00', predictedIndex: 16, actualIndex: 16},
  {id: 's17', title: 'Velvet Static', durationSec: 300, durationLabel: '5:00', predictedIndex: 17, actualIndex: 17},
  {id: 's18', title: 'Northern Wire', durationSec: 300, durationLabel: '5:00', predictedIndex: 18, actualIndex: 18},
  {id: 's19', title: 'Amplifier Hymn', durationSec: 300, durationLabel: '5:00', predictedIndex: 19, actualIndex: 19},
  {id: 's20', title: 'Last Transmission', durationSec: 300, durationLabel: '5:00', predictedIndex: 20, actualIndex: 20},
];

// Terminal caption derives LIVE from the rows (no hardcoded 84).
const TOTAL_SEC = SONGS.reduce((sum, song) => sum + song.durationSec, 0); // 5040
const TOTAL_MIN = TOTAL_SEC / 60; // 84

interface Landmark {
  id: LandmarkId;
  name: string;
  x: number; // snap point, viewBox units
  y: number;
}

// Snap points: Stage = center of its rect (99,16 160×48 → 179,40); Pit =
// ellipse center; Bar/Merch = rect centers; Gate C snaps at 60,252 (below
// the rect center, at the doors).
const LANDMARKS: Landmark[] = [
  {id: 'stage', name: 'Stage', x: 179, y: 40},
  {id: 'pit', name: 'The Pit', x: 179, y: 96},
  {id: 'bar', name: 'Bar', x: 60, y: 190},
  {id: 'merch', name: 'Merch Table', x: 290, y: 190},
  {id: 'gatec', name: 'Gate C', x: 60, y: 252},
];

const LANDMARK_BY_ID: Record<LandmarkId, Landmark> = Object.fromEntries(
  LANDMARKS.map(landmark => [landmark.id, landmark]),
) as Record<LandmarkId, Landmark>;

interface Friend {
  id: string;
  name: string;
  fullName: string;
  initials: string;
  beacon: {x: number; y: number};
  confirmed: boolean;
}

const FRIENDS: Friend[] = [
  {id: 'maya', name: 'Maya', fullName: 'Maya Chen', initials: 'MC', beacon: {x: 179, y: 96}, confirmed: true},
  {id: 'diego', name: 'Diego', fullName: 'Diego Reyes', initials: 'DR', beacon: {x: 60, y: 190}, confirmed: true},
  {id: 'priya', name: 'Priya', fullName: 'Priya Nair', initials: 'PN', beacon: {x: 290, y: 190}, confirmed: true},
  {id: 'sam', name: 'Sam', fullName: 'Sam Kowalski', initials: 'SK', beacon: {x: 60, y: 252}, confirmed: false},
];

const FRIEND_BY_ID: Record<string, Friend> = Object.fromEntries(FRIENDS.map(friend => [friend.id, friend]));

interface ScheduleItem {
  id: string;
  label: string;
  time: string; // fixed strings — no live clock anywhere
}

const SCHEDULE: ScheduleItem[] = [
  {id: 'doors', label: 'Doors', time: '7:00 PM'},
  {id: 'opener', label: 'Opener · Girl Antenna', time: '8:00 PM'},
  {id: 'headline', label: BAND, time: '9:10 PM'},
  {id: 'curfew', label: 'Curfew', time: '11:00 PM'},
];

interface Note {
  id: string;
  text: string;
  sub: string;
}

const NOTES: Note[] = [
  {id: 'n1', text: 'Coat check is cash only', sub: 'Lobby · left of Gate C'},
  {id: 'n2', text: 'Parking ramp closes 11:30', sub: 'SW 9th & Alder'},
];

const NOTE_BY_ID: Record<string, Note> = Object.fromEntries(NOTES.map(note => [note.id, note]));

const TAB_META: Array<{id: TabId; label: string; icon: typeof MapIcon}> = [
  {id: 'setlist', label: 'Setlist', icon: ListMusicIcon},
  {id: 'venue', label: 'Venue', icon: MapIcon},
  {id: 'crew', label: 'Crew', icon: UsersIcon},
  {id: 'night', label: 'Night', icon: MoonIcon},
];

// ---------------------------------------------------------------------------
// GEOMETRY — all walk-time math in viewBox units; 40 px ≈ 1 min.
// State A (pin = merch 290,190): maya √(111²+94²) = √21157 ≈ 145.5 → 3.64 →
// '4 min' ✓; diego |290−60| = 230 → 5.75 → '6 min' ✓; priya 0 → 'at the
// spot' ✓; sam √(230²+62²) = √56744 ≈ 238.2 → 5.96 → '6 min' ✓.
// State B (pin = bar 60,190): maya √(119²+94²) = √22997 ≈ 151.6 → 3.79 →
// '4 min'; diego 'at the spot'; priya 230 → '6 min'; sam 62 → 1.55 →
// '2 min' ✓. Stress 3 (pin = gatec 60,252): maya √(119²+156²) = √38497 ≈
// 196.2 → 4.9 → '5 min'; diego 62 → '2 min'; priya 238.2 → '6 min'; sam
// 'at the spot' ✓ — every chip changes at once, including the zero case.
// ---------------------------------------------------------------------------

function euclid(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

/** ≤20 viewBox px collapses to 'at the spot'; else max(1, round(d/40)) min. */
function walkLabel(dist: number): string {
  return dist <= 20 ? 'at the spot' : `${Math.max(1, Math.round(dist / 40))} min`;
}

function walkSentence(dist: number): string {
  return dist <= 20 ? 'at the spot' : `${Math.max(1, Math.round(dist / 40))} min from pin`;
}

function nearestLandmark(x: number, y: number): Landmark {
  let best = LANDMARKS[0];
  let bestDist = Infinity;
  for (const landmark of LANDMARKS) {
    const dist = euclid(x, y, landmark.x, landmark.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = landmark;
    }
  }
  return best;
}

/** Deterministic id-derived avatar gradient (no photos by law). */
function avatarGradient(id: string): string {
  let hue = 0;
  for (let i = 0; i < id.length; i++) {
    hue = (hue * 31 + id.charCodeAt(i)) % 360;
  }
  // Fixed pastel fills in both schemes; initials are fixed #33202B ≥ 4.5:1
  // on any hsl(x 64% 78%) pastel.
  return `linear-gradient(135deg, hsl(${hue} 64% 78%), hsl(${(hue + 48) % 360} 58% 66%))`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — {meetup, setlist, crew, notes, ui} + a single
// update(id, patch). (Spec listed meetup/setlist/ui; crew + notes slices
// were added to the SAME owner so removal/undo and the notes empty state
// have no second owner — noted as a deviation.) Every surface re-derives;
// nothing holds copies.
// ---------------------------------------------------------------------------

interface ToastState {
  seq: number;
  text: string;
  undo: 'crew' | 'note' | null;
}

interface AppState {
  meetup: {landmarkId: LandmarkId; afterSongIndex: number};
  setlist: {nowIndex: number; expandedRowId: string | null};
  crew: {
    order: string[];
    menuOpenId: string | null;
    stash: {id: string; index: number} | null;
  };
  notes: {
    order: string[];
    stash: {id: string; index: number} | null;
  };
  ui: {
    activeTab: TabId;
    scrollByTab: Record<TabId, number>;
    sheetOpen: boolean;
    sheetDetent: 'medium' | 'large';
    toast: ToastState | null;
  };
}

const INITIAL_STATE: AppState = {
  meetup: {landmarkId: 'merch', afterSongIndex: 12},
  setlist: {nowIndex: 9, expandedRowId: null},
  crew: {order: FRIENDS.map(friend => friend.id), menuOpenId: null, stash: null},
  notes: {order: NOTES.map(note => note.id), stash: null},
  ui: {
    activeTab: 'setlist',
    scrollByTab: {setlist: 0, venue: 0, crew: 0, night: 0},
    sheetOpen: false,
    sheetDetent: 'medium',
    toast: null,
  },
};

/**
 * Container-width hook (grid-feeder-console pattern) — the demo's desktop
 * stage is ~1045px inside a 1440px window, so only a ResizeObserver can
 * tell the stages apart.
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns page scroll. */
function findScroller(node: HTMLElement | null): HTMLElement {
  let parent = node?.parentElement ?? null;
  while (parent != null) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
}

/** Focus trap for the sheet — Tab cycles within; Escape handled globally. */
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), [role="spinbutton"]');
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
// BRAND MARK — 24px ticket-stub/flame glyph, stroke 2, in a 44×44 button.
// ---------------------------------------------------------------------------

function EncoreMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      {/* Ticket stub with a notch, flame lick rising from the tear line. */}
      <path
        d="M4 9a2 2 0 0 0 2-2V6h12v1a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v1H6v-1a2 2 0 0 0-2-2V9Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M12 9.5c1.4 1 .4 2 .9 2.9.4-.2.8-.7.8-1.2 1 .8 1 2.8-.6 3.5a2.2 2.2 0 0 1-3-2c0-1.6 1.5-2 1.9-3.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// NOW PLAYING STRIP — one full-width button; text and progress width BOTH
// derive from setlist.nowIndex / SONGS.length (9/20 → '9 of 20' + 45%).
// ---------------------------------------------------------------------------

interface NowPlayingStripProps {
  nowIndex: number;
  onTap: () => void;
}

function NowPlayingStrip({nowIndex, onTap}: NowPlayingStripProps) {
  const nowSong = SONGS[nowIndex - 1];
  const pct = (nowIndex / SONGS.length) * 100; // 9/20 = 45%
  return (
    <button
      type="button"
      className="enc-btn"
      style={styles.nowPlaying}
      aria-label={`Now playing ${nowSong.title}, song ${nowIndex} of ${SONGS.length} — open setlist`}
      onClick={onTap}>
      <span style={styles.stripRow}>
        {/* Pulse removed under reduced motion; the static filled brand dot
            still encodes 'live'. */}
        <span className="enc-live-dot" style={styles.stripDot} aria-hidden />
        <span style={styles.stripText}>
          <span style={styles.stripOverline}>Now playing</span>
          <span style={styles.stripTitle}>{nowSong.title}</span>
        </span>
        <span style={styles.stripMeta}>
          {nowIndex} of {SONGS.length}
        </span>
      </span>
      <span style={styles.stripTrack} aria-hidden>
        <span style={{...styles.stripFill, width: `${pct}%`, display: 'block'}} />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SETLIST PROGRESS RAIL — 20 connected 60px rows over the 56px spine
// column; node state derives from nowIndex; drift badges from
// actualIndex ≠ predictedIndex; the meet flag from meetupStore.
// ---------------------------------------------------------------------------

interface SetlistRailProps {
  nowIndex: number;
  expandedRowId: string | null;
  afterSongIndex: number;
  onToggleRow: (id: string) => void;
}

function SetlistProgressRail({nowIndex, expandedRowId, afterSongIndex, onToggleRow}: SetlistRailProps) {
  return (
    <div style={styles.rail}>
      {SONGS.map(song => {
        const a = song.actualIndex;
        const isPlayed = a < nowIndex;
        const isNow = a === nowIndex;
        const drift = song.predictedIndex - a; // +3 = moved up 3, −2 = moved back 2
        const isMeetRow = a === afterSongIndex;
        const isExpanded = expandedRowId === song.id;
        // Spine segments: top brand if this node is played-or-now, bottom
        // brand if the NEXT node is played-or-now (a < nowIndex).
        const topColor = a <= nowIndex ? BRAND_ACCENT : REST_EDGE;
        const bottomColor = a < nowIndex ? BRAND_ACCENT : REST_EDGE;
        const showTop = a !== 1 && a !== MAIN_SET_COUNT + 1; // divider breaks the spine
        const showBottom = a !== SONGS.length && a !== MAIN_SET_COUNT;
        const statusWord = isNow ? 'playing now' : isPlayed ? 'played' : 'upcoming';
        return (
          <div key={song.id} style={styles.railRowWrap} id={`enc-row-${song.id}`}>
            {a === MAIN_SET_COUNT + 1 ? (
              <div style={styles.encoreDivider} role="separator" aria-label={`Encore break — ${ENCORE_COUNT} songs`}>
                <span style={styles.dividerLine} aria-hidden />
                <span style={styles.dividerLabel} aria-hidden>
                  Encore break · {ENCORE_COUNT} songs
                </span>
                <span style={styles.dividerLine} aria-hidden />
              </div>
            ) : null}
            <button
              type="button"
              className="enc-btn enc-hoverable"
              style={styles.railRow}
              aria-label={song.title}
              aria-expanded={isExpanded}
              onClick={() => onToggleRow(song.id)}>
              <span style={styles.spineCol} aria-hidden>
                {showTop ? <span style={{...styles.spineTop, background: topColor}} /> : null}
                {showBottom ? <span style={{...styles.spineBottom, background: bottomColor}} /> : null}
                <span style={styles.nodeAnchor}>
                  {isNow ? (
                    <span style={styles.nodeNowWrap}>
                      <span className="enc-pulse-ring" style={styles.nodePulseRing} />
                      <span style={styles.nodeNow}>
                        <span style={styles.nodeNowDot} />
                      </span>
                    </span>
                  ) : isPlayed ? (
                    <span style={styles.nodePlayed}>
                      <Icon icon={CheckIcon} size="xsm" color="inherit" />
                    </span>
                  ) : (
                    <span style={styles.nodeUpcoming} />
                  )}
                </span>
              </span>
              <span style={styles.railText}>
                <span style={{...styles.railTitle, ...(isNow ? {fontWeight: 600} : null)}}>{song.title}</span>
                <span style={styles.railSub}>
                  Predicted #{song.predictedIndex} · {song.durationLabel}
                </span>
              </span>
              {/* Stress 2: badge leads, flag trails, 8px gap; the title
                  column truncates first (minWidth 0 on railText). */}
              <span style={styles.railTrailing}>
                {drift !== 0 ? (
                  <span style={{...styles.driftBadge, ...(drift > 0 ? styles.driftUp : styles.driftBack)}}>
                    <span aria-hidden>
                      moved {drift > 0 ? 'up' : 'back'} {Math.abs(drift)}
                    </span>
                    <span className="enc-vh">
                      moved {drift > 0 ? 'up' : 'back'} {Math.abs(drift)} slots from predicted order
                    </span>
                  </span>
                ) : null}
                {isMeetRow ? (
                  <span style={styles.meetChip}>
                    <Icon icon={FlagIcon} size="xsm" color="inherit" />
                    Meet here
                  </span>
                ) : null}
              </span>
            </button>
            {isExpanded ? (
              <div className="enc-fade-in" style={styles.railExpansion}>
                {showBottom ? <span style={{...styles.expSpine, background: bottomColor}} aria-hidden /> : null}
                <span style={styles.expLineStrong}>
                  {drift === 0
                    ? `On predicted slot #${song.predictedIndex}`
                    : `Predicted #${song.predictedIndex}, ${drift > 0 ? `moved up ${drift}` : `moved back ${Math.abs(drift)}`} → slot #${a}`}
                </span>
                <span style={styles.expLine}>
                  {song.durationLabel} · {statusWord}
                  {isMeetRow ? ' · crew meets after this one' : ''}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// VENUE PIN MAP — stylized SVG floorplan (viewBox 0 0 358 280, width 100%);
// pin + beacons are real HTML buttons absolutely positioned by viewBox
// percentages, so hit areas stay 44px at every stage width. Drag math runs
// in viewBox units via the rendered-width ratio; pointerup snaps to the
// Euclidean-nearest of the 5 landmark centers.
// ---------------------------------------------------------------------------

interface VenuePinMapProps {
  landmarkId: LandmarkId;
  crewOrder: string[];
  pinPoint: {x: number; y: number};
  onCommitLandmark: (id: LandmarkId) => void;
  onOpenSheet: () => void;
  onBeaconTap: (text: string) => void;
}

function VenuePinMap({landmarkId, crewOrder, pinPoint, onCommitLandmark, onOpenSheet, onBeaconTap}: VenuePinMapProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{x: number; y: number} | null>(null);
  const dragStartRef = useRef<{clientX: number; clientY: number; x: number; y: number} | null>(null);
  const movedRef = useRef(false);
  const suppressClickRef = useRef(false);

  const pin = drag ?? pinPoint;
  const previewNearest = drag != null ? nearestLandmark(drag.x, drag.y).id : null;

  const onPinPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {clientX: event.clientX, clientY: event.clientY, x: pinPoint.x, y: pinPoint.y};
    movedRef.current = false;
  };

  const onPinPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = dragStartRef.current;
    const wrap = wrapRef.current;
    if (start == null || wrap == null) return;
    const scale = 358 / wrap.getBoundingClientRect().width;
    const dx = (event.clientX - start.clientX) * scale;
    const dy = (event.clientY - start.clientY) * scale;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      movedRef.current = true;
    }
    setDrag({
      x: Math.min(346, Math.max(12, start.x + dx)),
      y: Math.min(268, Math.max(12, start.y + dy)),
    });
  };

  const onPinPointerUp = () => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (start == null) return;
    if (drag != null && movedRef.current) {
      suppressClickRef.current = true;
      onCommitLandmark(nearestLandmark(drag.x, drag.y).id);
    }
    setDrag(null);
  };

  const onPinClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    // Keyboard / plain-tap parity path: Enter on the focused pin opens the
    // landmark sheet.
    onOpenSheet();
  };

  const shapeStroke = (id: LandmarkId) =>
    previewNearest === id
      ? {stroke: BRAND_ACCENT, strokeWidth: 2}
      : {stroke: 'var(--color-border)', strokeWidth: 1};
  const shapeFill = (id: LandmarkId) => (landmarkId === id && drag == null ? BRAND_TINT : 'var(--color-background-muted)');

  const currentName = LANDMARK_BY_ID[landmarkId].name;

  return (
    <div ref={wrapRef} style={styles.mapWrap}>
      <svg viewBox="0 0 358 280" style={styles.mapSvg} aria-hidden>
        <rect x={99} y={16} width={160} height={48} rx={8} fill={shapeFill('stage')} {...shapeStroke('stage')} />
        <ellipse cx={179} cy={96} rx={70} ry={34} fill={shapeFill('pit')} {...shapeStroke('pit')} />
        <rect x={20} y={166} width={80} height={48} rx={6} fill={shapeFill('bar')} {...shapeStroke('bar')} />
        <rect x={250} y={166} width={80} height={48} rx={6} fill={shapeFill('merch')} {...shapeStroke('merch')} />
        <rect x={20} y={228} width={80} height={36} rx={6} fill={shapeFill('gatec')} {...shapeStroke('gatec')} />
        {/* SVG text uses --color-text-primary per the a11y plan. */}
        <text x={179} y={44} textAnchor="middle" fontSize={11} fontWeight={600} letterSpacing="0.06em" fill="var(--color-text-primary)">
          STAGE
        </text>
        <text x={179} y={100} textAnchor="middle" fontSize={11} fontWeight={600} letterSpacing="0.06em" fill="var(--color-text-primary)">
          THE PIT
        </text>
        <text x={60} y={194} textAnchor="middle" fontSize={11} fontWeight={600} letterSpacing="0.06em" fill="var(--color-text-primary)">
          BAR
        </text>
        <text x={290} y={194} textAnchor="middle" fontSize={11} fontWeight={600} letterSpacing="0.06em" fill="var(--color-text-primary)">
          MERCH
        </text>
        <text x={60} y={250} textAnchor="middle" fontSize={11} fontWeight={600} letterSpacing="0.06em" fill="var(--color-text-primary)">
          GATE C
        </text>
      </svg>
      {/* Friend beacons — 10px dots in 44px transparent hit buttons. */}
      {crewOrder.map(friendId => {
        const friend = FRIEND_BY_ID[friendId];
        const dist = euclid(friend.beacon.x, friend.beacon.y, pinPoint.x, pinPoint.y);
        const sentence = friend.confirmed
          ? `${friend.name}, ${dist <= 20 ? 'at the spot' : `${Math.max(1, Math.round(dist / 40))} minutes from pin`}`
          : `${friend.name}, invited — hasn't confirmed`;
        return (
          <button
            key={friend.id}
            type="button"
            className="enc-btn"
            style={{
              ...styles.beaconBtn,
              left: `${(friend.beacon.x / 358) * 100}%`,
              top: `${(friend.beacon.y / 280) * 100}%`,
            }}
            aria-label={sentence}
            onClick={() => onBeaconTap(sentence)}>
            <span style={friend.confirmed ? styles.beaconDot : styles.beaconDotInvited} aria-hidden />
          </button>
        );
      })}
      {/* The meetup pin — draggable AND a focusable button (Enter opens the
          landmark sheet: full keyboard parity for the drag). */}
      <button
        type="button"
        className="enc-btn"
        style={{
          ...styles.pinBtn,
          left: `${(pin.x / 358) * 100}%`,
          top: `${(pin.y / 280) * 100}%`,
        }}
        aria-label={`Meetup pin at ${currentName} — press Enter to pick a landmark, or drag to move`}
        onPointerDown={onPinPointerDown}
        onPointerMove={onPinPointerMove}
        onPointerUp={onPinPointerUp}
        onPointerCancel={onPinPointerUp}
        onClick={onPinClick}>
        <span style={styles.pinCircle} aria-hidden>
          <Icon icon={MapPinIcon} size="sm" color="inherit" />
        </span>
        <span style={styles.pinStem} aria-hidden />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FRIEND BEACON ROW — 44px chips; captions recompute PURELY from
// meetupStore.landmarkId (walkMinutes of beacon → pin), no local state.
// ---------------------------------------------------------------------------

interface FriendBeaconRowProps {
  crewOrder: string[];
  pinPoint: {x: number; y: number};
  onChipTap: (text: string) => void;
}

function FriendBeaconRow({crewOrder, pinPoint, onChipTap}: FriendBeaconRowProps) {
  return (
    <div style={styles.beaconRail}>
      {crewOrder.map(friendId => {
        const friend = FRIEND_BY_ID[friendId];
        const dist = euclid(friend.beacon.x, friend.beacon.y, pinPoint.x, pinPoint.y);
        const caption = friend.confirmed ? walkLabel(dist) : 'invited';
        const sentence = friend.confirmed
          ? `${friend.name} · ${walkSentence(dist)}`
          : `${friend.name} hasn't confirmed yet`;
        return (
          <button
            key={friend.id}
            type="button"
            className="enc-btn enc-hoverable"
            style={styles.friendChip}
            aria-label={sentence}
            onClick={() => onChipTap(sentence)}>
            <span style={{...styles.chipAvatar, background: avatarGradient(friend.id)}} aria-hidden>
              {friend.initials}
            </span>
            <span style={styles.chipText}>
              <span style={styles.chipName}>{friend.name}</span>
              <span style={styles.chipCaption}>{caption}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MEET BANNER — sentence assembled from meetupStore; 'Change' opens the
// landmark sheet (a non-gesture parity path).
// ---------------------------------------------------------------------------

interface MeetBannerProps {
  landmarkId: LandmarkId;
  afterSongIndex: number;
  headingThere: boolean;
  onChange: () => void;
}

function MeetBanner({landmarkId, afterSongIndex, headingThere, onChange}: MeetBannerProps) {
  return (
    <div style={styles.listCard}>
      <div style={styles.banner}>
        <span style={styles.bannerIcon}>
          <Icon icon={MapPinIcon} size="md" color="inherit" />
        </span>
        <span style={styles.bannerText}>
          Meet at {LANDMARK_BY_ID[landmarkId].name} after song {afterSongIndex}
          {headingThere ? <span style={styles.bannerNow}> — heading there now</span> : null}
        </span>
        <button type="button" className="enc-btn enc-hoverable" style={styles.changeBtn} onClick={onChange}>
          Change
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LANDMARK GLYPHS — 20px stylized shapes (no photography by law).
// ---------------------------------------------------------------------------

function LandmarkGlyph({id}: {id: LandmarkId}) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      {id === 'stage' ? (
        <>
          <rect x={3} y={5.5} width={14} height={8} rx={2} />
          <path d="M6 16.5h8" strokeLinecap="round" />
        </>
      ) : id === 'pit' ? (
        <ellipse cx={10} cy={10} rx={7} ry={4.5} />
      ) : id === 'bar' ? (
        <>
          <rect x={3} y={8.5} width={14} height={7} rx={2} />
          <path d="M6.5 8.5v-3h7v3" strokeLinecap="round" />
        </>
      ) : id === 'merch' ? (
        <>
          <rect x={4} y={6.5} width={12} height={9} rx={2} />
          <path d="M4 10h12" />
        </>
      ) : (
        <>
          <rect x={5} y={4.5} width={10} height={11} rx={2} />
          <path d="M10 4.5v11" />
        </>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// LANDMARK SHEET — two-detent bottom sheet; the COMPLETE non-gesture parity
// path for the pin drag ('Pin here' rows) plus the after-song stepper.
// ---------------------------------------------------------------------------

interface LandmarkSheetProps {
  landmarkId: LandmarkId;
  afterSongIndex: number;
  nowIndex: number;
  detent: 'medium' | 'large';
  sheetRef: RefObject<HTMLDivElement | null>;
  onPinHere: (id: LandmarkId) => void;
  onStepAfterSong: (next: number) => void;
  onToggleDetent: () => void;
  onClose: () => void;
}

function LandmarkSheet({
  landmarkId,
  afterSongIndex,
  nowIndex,
  detent,
  sheetRef,
  onPinHere,
  onStepAfterSong,
  onToggleDetent,
  onClose,
}: LandmarkSheetProps) {
  const pinPoint = LANDMARK_BY_ID[landmarkId];
  // Stepper law: min = now-playing index + 1 (can't schedule a meetup
  // mid-past); max = final song 20 (stress 6: flag on the last encore row,
  // plus-half disabled at 35% opacity).
  const minAfter = Math.min(nowIndex + 1, SONGS.length);
  const maxAfter = SONGS.length;
  const atMin = afterSongIndex <= minAfter;
  const atMax = afterSongIndex >= maxAfter;

  // Optional grabber-drag garnish — click-toggle, X, and Escape are the
  // contract; drag snaps detents, >120px past medium closes.
  const [dragDy, setDragDy] = useState<number | null>(null);
  const dragStartYRef = useRef(0);

  const onGrabberPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartYRef.current = event.clientY;
    setDragDy(0);
  };
  const onGrabberPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragDy == null) return;
    setDragDy(event.clientY - dragStartYRef.current);
  };
  const onGrabberPointerUp = () => {
    if (dragDy == null) return;
    const dy = dragDy;
    setDragDy(null);
    if (dy > 120 && detent === 'medium') {
      onClose();
    } else if (dy < -60 && detent === 'medium') {
      onToggleDetent();
    } else if (dy > 60 && detent === 'large') {
      onToggleDetent();
    }
  };

  const onSpinKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      onStepAfterSong(Math.min(maxAfter, afterSongIndex + 1));
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      onStepAfterSong(Math.max(minAfter, afterSongIndex - 1));
    }
  };

  const dragStyle: CSSProperties | undefined =
    dragDy != null && dragDy > 0 ? {transform: `translateY(${dragDy}px)`, transition: 'none'} : undefined;

  return (
    <div
      ref={sheetRef}
      className="enc-sheet-in"
      style={{...styles.sheet, ...(detent === 'medium' ? styles.sheetMedium : styles.sheetLarge), ...dragStyle}}
      role="dialog"
      aria-modal
      aria-labelledby="enc-sheet-title"
      tabIndex={-1}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}>
      <button
        type="button"
        className="enc-btn"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onPointerDown={onGrabberPointerDown}
        onPointerMove={onGrabberPointerMove}
        onPointerUp={onGrabberPointerUp}
        onPointerCancel={onGrabberPointerUp}
        onClick={onToggleDetent}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h3 id="enc-sheet-title" style={styles.sheetTitle}>
          Meetup spot
        </h3>
        <button type="button" className="enc-btn enc-hoverable" style={styles.navIconBtn} aria-label="Close" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      {/* The one legal inner scroller (stress 9: at 320px + large detent the
          landmark list scrolls here while the footer stays pinned). */}
      <div style={styles.sheetContent}>
        <div style={{...styles.listCard, marginTop: 4}}>
          {LANDMARKS.map((landmark, index) => {
            const isActive = landmark.id === landmarkId;
            const dist = euclid(landmark.x, landmark.y, pinPoint.x, pinPoint.y);
            return (
              <div key={landmark.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <div style={styles.landmarkRow}>
                  <div style={styles.landmarkMain}>
                    <span style={{...styles.landmarkGlyph, ...(isActive ? styles.landmarkGlyphActive : null)}}>
                      <LandmarkGlyph id={landmark.id} />
                    </span>
                    <span style={styles.landmarkText}>
                      <span style={{...styles.landmarkName, ...(isActive ? styles.landmarkNameActive : null)}}>
                        {landmark.name}
                        {isActive ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                      </span>
                      <span style={styles.landmarkDist}>
                        {isActive
                          ? 'Current meetup spot'
                          : `${Math.max(1, Math.round(dist / 40))} min walk from pin`}
                      </span>
                    </span>
                  </div>
                  {/* 36px visual pill inside a 44px-tall hit (row padding). */}
                  <button
                    type="button"
                    className="enc-btn"
                    style={{height: 44, display: 'flex', alignItems: 'center', flexShrink: 0}}
                    aria-label={`Pin meetup at ${landmark.name}`}
                    aria-pressed={isActive}
                    onClick={() => onPinHere(landmark.id)}>
                    <span style={{...styles.pinHereBtn, ...(isActive ? styles.pinHereActive : null)}}>
                      {isActive ? 'Pinned' : 'Pin here'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <h4 style={styles.sectionHeader}>Meet after song</h4>
        <div style={styles.listCard}>
          <div style={styles.stepperRow}>
            <span style={styles.utilityLabel}>After song</span>
            <span
              role="spinbutton"
              tabIndex={0}
              aria-valuenow={afterSongIndex}
              aria-valuemin={minAfter}
              aria-valuemax={maxAfter}
              aria-label="Meet-after song number"
              style={styles.stepperValue}
              onKeyDown={onSpinKeyDown}>
              {afterSongIndex}
            </span>
            <span style={styles.stepperTrack}>
              <button
                type="button"
                className="enc-btn"
                style={{...styles.stepperHalf, ...(atMin ? styles.stepperHalfDisabled : null)}}
                aria-label="Decrease meet-after song"
                disabled={atMin}
                onClick={() => onStepAfterSong(Math.max(minAfter, afterSongIndex - 1))}>
                <Icon icon={MinusIcon} size="sm" color="inherit" />
              </button>
              <span style={styles.stepperHairline} aria-hidden />
              <button
                type="button"
                className="enc-btn"
                style={{...styles.stepperHalf, ...(atMax ? styles.stepperHalfDisabled : null)}}
                aria-label="Increase meet-after song"
                disabled={atMax}
                onClick={() => onStepAfterSong(Math.min(maxAfter, afterSongIndex + 1))}>
                <Icon icon={PlusIcon} size="sm" color="inherit" />
              </button>
            </span>
          </div>
        </div>
      </div>
      <div style={styles.sheetFooter}>
        <button type="button" className="enc-btn" style={styles.doneBtn} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CREW ROW — 72px media row; visible 44×44 ellipsis is the button path,
// long-press (450ms, cancel on 8px move) is garnish opening the SAME menu.
// ---------------------------------------------------------------------------

interface CrewRowProps {
  friend: Friend;
  status: string;
  menuOpen: boolean;
  menuRef: RefObject<HTMLButtonElement | null>;
  onOpenMenu: () => void;
  onNudge: () => void;
  onRemove: () => void;
}

function CrewRow({friend, status, menuOpen, menuRef, onOpenMenu, onNudge, onRemove}: CrewRowProps) {
  const pressTimerRef = useRef<number | null>(null);
  const pressStartRef = useRef<{x: number; y: number} | null>(null);
  const firedRef = useRef(false);

  const cancelPress = () => {
    if (pressTimerRef.current != null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    pressStartRef.current = null;
  };

  const onRowPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    firedRef.current = false;
    pressStartRef.current = {x: event.clientX, y: event.clientY};
    pressTimerRef.current = window.setTimeout(() => {
      firedRef.current = true;
      onOpenMenu();
    }, 450);
  };
  const onRowPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = pressStartRef.current;
    if (start == null) return;
    if (Math.abs(event.clientX - start.x) > 8 || Math.abs(event.clientY - start.y) > 8) {
      cancelPress();
    }
  };
  const onRowClick = () => {
    if (firedRef.current) {
      firedRef.current = false;
      return;
    }
    onOpenMenu();
  };

  return (
    <div style={styles.crewRowWrap}>
      <div style={styles.crewRow}>
        <button
          type="button"
          className="enc-btn enc-hoverable"
          style={styles.crewRowMain}
          aria-label={friend.fullName}
          onPointerDown={onRowPointerDown}
          onPointerMove={onRowPointerMove}
          onPointerUp={cancelPress}
          onPointerCancel={cancelPress}
          onPointerLeave={cancelPress}
          onClick={onRowClick}>
          <span style={{...styles.crewAvatar, background: avatarGradient(friend.id)}} aria-hidden>
            {friend.initials}
          </span>
          <span style={styles.crewText}>
            <span style={styles.crewName}>{friend.fullName}</span>
            <span style={styles.crewStatus}>{status}</span>
          </span>
        </button>
        <button
          type="button"
          className="enc-btn enc-hoverable"
          style={styles.ellipsisBtn}
          aria-label={`Actions for ${friend.fullName}`}
          aria-expanded={menuOpen}
          onClick={onOpenMenu}>
          <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
        </button>
      </div>
      {menuOpen ? (
        <div className="enc-fade-in" style={styles.anchoredMenu} role="menu" aria-label={`Actions for ${friend.fullName}`}>
          <button ref={menuRef} type="button" className="enc-btn enc-hoverable" role="menuitem" style={styles.menuRow} onClick={onNudge}>
            <Icon icon={BellIcon} size="md" color="inherit" />
            <span>Nudge {friend.name}</span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            className="enc-btn enc-hoverable"
            role="menuitem"
            style={{...styles.menuRow, ...styles.menuRowDanger}}
            onClick={onRemove}>
            <Icon icon={UserMinusIcon} size="md" color="inherit" />
            <span>Remove from crew</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Encore, the concert-night companion. One state owner; every
// surface re-derives from it.
// ---------------------------------------------------------------------------

export default function MobileConcertCompanionTemplate() {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const outerWidth = useElementWidth(outerRef);
  // First pre-observer frame: viewport fallback so the desktop stage never
  // flashes the uncentered layout.
  const isViewportWide = useMediaQuery('(min-width: 561px)');
  const isCentered = outerWidth > 0 ? outerWidth > 560 : isViewportWide;

  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const update = useCallback(
    <K extends keyof AppState>(id: K, patch: Partial<AppState[K]>) => {
      setState(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );

  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const menuFirstRowRef = useRef<HTMLButtonElement | null>(null);
  const toastSeqRef = useRef(0);

  const nextToast = (text: string, undo: ToastState['undo'] = null): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, text, undo};
  };

  // Sheet focus: into the sheet on open WITH preventScroll (plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen — foundations amendment); restored to
  // the opener on EVERY close path (X, scrim, Escape, Done, tab switch).
  const isSheetOpen = state.ui.sheetOpen;
  useEffect(() => {
    if (isSheetOpen) {
      sheetRef.current?.focus({preventScroll: true});
    } else if (sheetOpenerRef.current != null) {
      sheetOpenerRef.current.focus({preventScroll: true});
      sheetOpenerRef.current = null;
    }
  }, [isSheetOpen]);

  // Crew menu focus: first row on open, opener on close.
  const openMenuId = state.crew.menuOpenId;
  useEffect(() => {
    if (openMenuId != null) {
      menuFirstRowRef.current?.focus({preventScroll: true});
    } else if (menuOpenerRef.current != null) {
      menuOpenerRef.current.focus({preventScroll: true});
      menuOpenerRef.current = null;
    }
  }, [openMenuId]);

  // Escape closes the TOPMOST overlay only: crew menu → sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setState(prev => {
        if (prev.crew.menuOpenId != null) {
          return {...prev, crew: {...prev.crew, menuOpenId: null}};
        }
        if (prev.ui.sheetOpen) {
          return {...prev, ui: {...prev.ui, sheetOpen: false}};
        }
        return prev;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // -- tab navigation (per-tab scroll persistence; the one legal reset) ----
  const selectTab = (next: TabId) => {
    const scroller = findScroller(shellRef.current);
    if (state.ui.activeTab === next) {
      // Active-tab re-tap pops to top — the iOS convention, and the
      // keyboard user's fast exit.
      scroller.scrollTop = 0;
      setState(prev => ({
        ...prev,
        ui: {...prev.ui, scrollByTab: {...prev.ui.scrollByTab, [next]: 0}},
      }));
      return;
    }
    const departingTop = scroller.scrollTop;
    const restoreTop = state.ui.scrollByTab[next] ?? 0;
    setState(prev => ({
      ...prev,
      crew: {...prev.crew, menuOpenId: null},
      ui: {
        ...prev.ui,
        activeTab: next,
        sheetOpen: false, // an overlay belongs to its moment
        toast: null, // toast ends when the screen changes
        scrollByTab: {...prev.ui.scrollByTab, [prev.ui.activeTab]: departingTop},
      },
    }));
    requestAnimationFrame(() => {
      scroller.scrollTop = restoreTop;
    });
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TAB_META.map(tab => tab.id);
    const current = order.indexOf(state.ui.activeTab);
    const next =
      event.key === 'ArrowRight'
        ? order[(current + 1) % order.length]
        : order[(current + order.length - 1) % order.length];
    selectTab(next);
    document.getElementById(`enc-tab-${next}`)?.focus();
  };

  // Strip tap: switch to Setlist and center the now-row.
  const goToNowRow = () => {
    const nowId = SONGS[state.setlist.nowIndex - 1].id;
    if (state.ui.activeTab !== 'setlist') {
      selectTab('setlist');
    }
    requestAnimationFrame(() =>
      requestAnimationFrame(() => document.getElementById(`enc-row-${nowId}`)?.scrollIntoView({block: 'center'})),
    );
  };

  // -- meetup chain (the signature move) -----------------------------------
  const commitLandmark = (id: LandmarkId) => {
    setState(prev => {
      if (prev.meetup.landmarkId === id) return prev;
      return {
        ...prev,
        meetup: {...prev.meetup, landmarkId: id},
        ui: {...prev.ui, toast: nextToast(`Meetup moved to ${LANDMARK_BY_ID[id].name}`)},
      };
    });
  };

  const stepAfterSong = (next: number) => {
    setState(prev => {
      if (next === prev.meetup.afterSongIndex) return prev;
      return {
        ...prev,
        meetup: {...prev.meetup, afterSongIndex: next},
        ui: {...prev.ui, toast: nextToast(`Meetup after song ${next}`)},
      };
    });
  };

  const openSheet = () => {
    sheetOpenerRef.current = document.activeElement as HTMLElement | null;
    update('ui', {sheetOpen: true, sheetDetent: 'medium'});
  };
  const closeSheet = () => update('ui', {sheetOpen: false});

  // -- setlist advance (demonstrable, no network fiction) ------------------
  const advanceSong = () => {
    setState(prev => {
      const nowIndex = Math.min(prev.setlist.nowIndex + 1, SONGS.length);
      if (nowIndex === prev.setlist.nowIndex) return prev;
      return {
        ...prev,
        setlist: {...prev.setlist, nowIndex},
        ui: {
          ...prev.ui,
          toast: nextToast(`Song advanced · ${SONGS[nowIndex - 1].title} (${nowIndex} of ${SONGS.length})`),
        },
      };
    });
  };

  // -- crew (undoOverConfirm: execute + Undo, exact list position) ---------
  const openCrewMenu = (id: string) => {
    menuOpenerRef.current = document.activeElement as HTMLElement | null;
    update('crew', {menuOpenId: state.crew.menuOpenId === id ? null : id});
  };

  const nudgeFriend = (id: string) => {
    setState(prev => ({
      ...prev,
      crew: {...prev.crew, menuOpenId: null},
      ui: {...prev.ui, toast: nextToast(`Nudged ${FRIEND_BY_ID[id].name} — they got a ping`)},
    }));
  };

  const removeFriend = (id: string) => {
    setState(prev => {
      const index = prev.crew.order.indexOf(id);
      if (index < 0) return prev;
      return {
        ...prev,
        crew: {
          order: prev.crew.order.filter(friendId => friendId !== id),
          menuOpenId: null,
          stash: {id, index},
        },
        ui: {...prev.ui, toast: nextToast(`Removed ${FRIEND_BY_ID[id].name} from crew`, 'crew')},
      };
    });
  };

  const removeNote = (id: string) => {
    setState(prev => {
      const index = prev.notes.order.indexOf(id);
      if (index < 0) return prev;
      return {
        ...prev,
        notes: {order: prev.notes.order.filter(noteId => noteId !== id), stash: {id, index}},
        ui: {...prev.ui, toast: nextToast('Note removed', 'note')},
      };
    });
  };

  const undoToast = () => {
    setState(prev => {
      const undo = prev.ui.toast?.undo;
      if (undo === 'crew' && prev.crew.stash != null) {
        const {id, index} = prev.crew.stash;
        const order = [...prev.crew.order];
        order.splice(index, 0, id); // exact prior list position
        return {
          ...prev,
          crew: {...prev.crew, order, stash: null},
          ui: {...prev.ui, toast: nextToast('Restored')},
        };
      }
      if (undo === 'note' && prev.notes.stash != null) {
        const {id, index} = prev.notes.stash;
        const order = [...prev.notes.order];
        order.splice(index, 0, id);
        return {
          ...prev,
          notes: {order, stash: null},
          ui: {...prev.ui, toast: nextToast('Restored')},
        };
      }
      return prev;
    });
  };

  const restoreNotes = () => {
    setState(prev => ({
      ...prev,
      notes: {order: NOTES.map(note => note.id), stash: null},
      ui: {...prev.ui, toast: nextToast('Notes restored')},
    }));
  };

  // -- derived (nothing holds copies) ---------------------------------------
  const {meetup, setlist, crew, notes, ui} = state;
  const pinPoint = LANDMARK_BY_ID[meetup.landmarkId];
  const confirmedCount = crew.order.filter(id => FRIEND_BY_ID[id].confirmed).length;
  const crewTotal = crew.order.length;
  const headingThere = setlist.nowIndex > meetup.afterSongIndex;
  const nowAtEnd = setlist.nowIndex >= SONGS.length;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isCentered ? styles.shellCentered : null),
    ...(ui.sheetOpen ? styles.shellLocked : null),
  };

  return (
    <div ref={outerRef} style={isCentered ? {...styles.stageOuter, ...styles.stageCenter} : styles.stageOuter}>
      <style>{ENCORE_CSS}</style>
      <div ref={shellRef} className="enc-shell" style={shellStyle}>
        {/* NAV BAR — brand mark · h1 · Share. */}
        <header style={styles.navBar}>
          <div style={styles.navSlotLead}>
            <button
              type="button"
              className="enc-btn enc-hoverable"
              style={styles.brandMarkBtn}
              aria-label="Encore home"
              onClick={() => selectTab('setlist')}>
              <EncoreMark />
            </button>
          </div>
          <h1 style={styles.navTitle}>
            {BAND} · {VENUE}
          </h1>
          <div style={styles.navSlotTrail}>
            <button
              type="button"
              className="enc-btn enc-hoverable"
              style={styles.navIconBtn}
              aria-label="Share show"
              onClick={() => update('ui', {toast: nextToast(`Show link copied · ${BAND} at ${VENUE}, ${CITY}`)})}>
              <Icon icon={Share2Icon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* NOW PLAYING — sticky top:52 z19; total sticky chrome 116px. */}
        <NowPlayingStrip nowIndex={setlist.nowIndex} onTap={goToNowRow} />

        <main style={styles.main}>
          {ui.activeTab === 'setlist' ? (
            <section role="tabpanel" id="enc-panel-setlist" aria-labelledby="enc-tab-setlist">
              <div style={styles.sectionHeaderRow}>
                <h2 style={{...styles.sectionHeader, ...styles.sectionHeaderGrow, margin: '8px 0'}}>
                  Main set · {MAIN_SET_COUNT} songs
                </h2>
                <button
                  type="button"
                  className="enc-btn enc-hoverable"
                  style={{...styles.headerActionBtn, ...(nowAtEnd ? styles.headerActionDisabled : null)}}
                  aria-label="Mark next song"
                  disabled={nowAtEnd}
                  onClick={advanceSong}>
                  <Icon icon={SkipForwardIcon} size="md" color="inherit" />
                </button>
              </div>
              <SetlistProgressRail
                nowIndex={setlist.nowIndex}
                expandedRowId={setlist.expandedRowId}
                afterSongIndex={meetup.afterSongIndex}
                onToggleRow={id =>
                  update('setlist', {expandedRowId: setlist.expandedRowId === id ? null : id})
                }
              />
              {/* Derives live: 5040 s / 60 = 84 min. */}
              <p style={styles.terminalCaption}>
                {SONGS.length} songs · {TOTAL_MIN} min planned
              </p>
            </section>
          ) : ui.activeTab === 'venue' ? (
            <section role="tabpanel" id="enc-panel-venue" aria-labelledby="enc-tab-venue">
              <h2 className="enc-vh">Venue &amp; meetup</h2>
              <div style={{height: 12}} />
              <MeetBanner
                landmarkId={meetup.landmarkId}
                afterSongIndex={meetup.afterSongIndex}
                headingThere={headingThere}
                onChange={openSheet}
              />
              <div style={{height: 12}} />
              <div style={styles.mapCard}>
                <VenuePinMap
                  landmarkId={meetup.landmarkId}
                  crewOrder={crew.order}
                  pinPoint={pinPoint}
                  onCommitLandmark={commitLandmark}
                  onOpenSheet={openSheet}
                  onBeaconTap={text => update('ui', {toast: nextToast(text)})}
                />
              </div>
              <h2 style={styles.sectionHeader}>Your crew</h2>
              <FriendBeaconRow
                crewOrder={crew.order}
                pinPoint={pinPoint}
                onChipTap={text => update('ui', {toast: nextToast(text)})}
              />
              <div style={{height: 12}} />
              <div style={styles.listCard}>
                <button type="button" className="enc-btn enc-hoverable" style={styles.utilityRow} onClick={openSheet}>
                  <span style={{...styles.utilityLabel, ...styles.utilityLink}}>All landmarks →</span>
                </button>
              </div>
            </section>
          ) : ui.activeTab === 'crew' ? (
            <section role="tabpanel" id="enc-panel-crew" aria-labelledby="enc-tab-crew">
              {/* Header count = list length; badge derives from CONFIRMED
                  count (stress 4: removing unconfirmed Sam keeps badge 3,
                  caption becomes '3 of 3 confirmed'). */}
              <h2 style={styles.sectionHeader}>Going tonight · {crewTotal}</h2>
              <div style={styles.listCard}>
                {crew.order.map((friendId, index) => {
                  const friend = FRIEND_BY_ID[friendId];
                  const dist = euclid(friend.beacon.x, friend.beacon.y, pinPoint.x, pinPoint.y);
                  const status = friend.confirmed
                    ? `Confirmed · ${walkSentence(dist)}`
                    : "Invited — hasn't confirmed";
                  return (
                    <div key={friend.id}>
                      {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                      <CrewRow
                        friend={friend}
                        status={status}
                        menuOpen={crew.menuOpenId === friend.id}
                        menuRef={crew.menuOpenId === friend.id ? menuFirstRowRef : {current: null}}
                        onOpenMenu={() => openCrewMenu(friend.id)}
                        onNudge={() => nudgeFriend(friend.id)}
                        onRemove={() => removeFriend(friend.id)}
                      />
                    </div>
                  );
                })}
              </div>
              <p style={styles.crewCaption}>
                {confirmedCount} of {crewTotal} confirmed
              </p>
            </section>
          ) : (
            <section role="tabpanel" id="enc-panel-night" aria-labelledby="enc-tab-night">
              <h2 style={styles.sectionHeader}>Schedule</h2>
              <div style={styles.listCard}>
                {SCHEDULE.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.utilityRow}>
                      <span style={styles.utilityLabel}>{item.label}</span>
                      <span style={styles.utilityValue}>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <h2 style={styles.sectionHeader}>Notes</h2>
              {notes.order.length > 0 ? (
                <div style={styles.listCard}>
                  {notes.order.map((noteId, index) => {
                    const note = NOTE_BY_ID[noteId];
                    return (
                      <div key={note.id}>
                        {index > 0 ? <div style={styles.rowDivider} /> : null}
                        <div style={styles.noteRow}>
                          <div style={styles.noteMain}>
                            <span style={styles.noteText}>{note.text}</span>
                            <span style={styles.noteSub}>{note.sub}</span>
                          </div>
                          <button
                            type="button"
                            className="enc-btn enc-hoverable"
                            style={styles.ellipsisBtn}
                            aria-label={`Remove note: ${note.text}`}
                            onClick={() => removeNote(note.id)}>
                            <Icon icon={XIcon} size="sm" color="inherit" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // TRUE-EMPTY (stress 7): icon names the missing thing, one
                // action, honest fixture restore.
                <div style={styles.emptyState}>
                  <span style={styles.emptyCircle}>
                    <Icon icon={StickyNoteIcon} size="lg" color="inherit" />
                  </span>
                  <h3 style={styles.emptyTitle}>No notes</h3>
                  <p style={styles.emptyBody}>Show-night reminders you save appear here.</p>
                  <button type="button" className="enc-btn enc-hoverable" style={styles.emptyBtn} onClick={restoreNotes}>
                    Add note
                  </button>
                </div>
              )}
            </section>
          )}
        </main>

        {/* THE one polite live region — meetup moves, removals, undo
            results, and song advances all announce here; never a second
            region. Sticky-in-flow normally; shell-absolute only during the
            sheet scroll lock (foundations amendment). */}
        <div style={ui.sheetOpen ? styles.toastAnchorLocked : styles.toastAnchor} aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} className="enc-fade-in" style={styles.toast}>
              <span style={styles.toastText}>{ui.toast.text}</span>
              {ui.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="enc-btn" style={styles.toastUndo} onClick={undoToast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px, 4 tabs, arrow-key tablist; Crew badge derives
            from the confirmed count. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Encore sections" onKeyDown={onTabKeyDown}>
          {TAB_META.map(tab => {
            const isActive = ui.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`enc-tab-${tab.id}`}
                type="button"
                role="tab"
                className="enc-btn"
                aria-selected={isActive}
                aria-controls={`enc-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                  {tab.id === 'crew' && confirmedCount > 0 ? (
                    <span style={styles.tabBadge} aria-label={`${confirmedCount} confirmed`}>
                      {confirmedCount}
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

        {/* LANDMARK SHEET — scrim z40 + sheet z41; shell scroll-locked. */}
        {ui.sheetOpen ? (
          <>
            <div style={styles.sheetScrim} className="enc-fade-in" onClick={closeSheet} aria-hidden />
            <LandmarkSheet
              landmarkId={meetup.landmarkId}
              afterSongIndex={meetup.afterSongIndex}
              nowIndex={setlist.nowIndex}
              detent={ui.sheetDetent}
              sheetRef={sheetRef}
              onPinHere={commitLandmark}
              onStepAfterSong={stepAfterSong}
              onToggleDetent={() => update('ui', {sheetDetent: ui.sheetDetent === 'medium' ? 'large' : 'medium'})}
              onClose={closeSheet}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}


