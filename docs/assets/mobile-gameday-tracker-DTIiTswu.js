var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Pylon second-screen tracker for
 *   Phoenix Cinder at Seattle Squall, frozen LIVE at Q4 6:42, PHX 84-81:
 *   140 scripted GAME_EVENTS (idx 0-139; 60 made FG = PHX 30 + SEA 30,
 *   54 missed FG = PHX 26 + SEA 28, 12 FT trips totalling 12 pts per team,
 *   10 turnovers, 4 qstart markers; quarters 36/34/36/34 events), quarter
 *   lines PHX 22+21+20+21=84 / SEA 19+21+20+21=81 with running checkpoints
 *   22-19 / 43-40 / 63-60 / 84-81, 16 rostered players whose box rows all
 *   re-derive from the events, and a precomputed WP win-probability series
 *   WP[i] = clamp(50 + margin(i)·(2 + floor(i/35)), 5, 95) (WP[139] =
 *   50 + 3·5 = 65). No Date.now(), no Math.random(), no network media —
 *   court art is a stylized inline SVG, shot dots are id-derived
 *   (x = 10 + (idx·37 % 314), y = 16 + (idx·53 % 200)).
 * @output Pylon — Gameday Tracker: a 390px MOBILE second-screen surface
 *   whose signature move is ONE timeline index (gameClockStore.t) driving
 *   every pixel: scrub the pinned 56px WinProbabilityRibbon (drag the
 *   playhead, arrow-key the slider, tap prev/next, jump quarters via the
 *   segmented control, or tap any feed row) and the navBar score strip,
 *   scoreboardCard + QuarterLineScore, MomentumMeter tug bar, court shot
 *   dots, play-feed dimming, Plays tab badge (139 − t upcoming, '99+'
 *   capped), and the player box-score sheet all rewind in perfect sync —
 *   there is no second copy of any number, every surface derives from
 *   events with idx <= t. Rewinding swaps the navBar LIVE pill to REWIND
 *   and reveals the ribbon's 'Back to live' pill; settling a scrub
 *   announces 'Q3 4:58 · PHX 61-58' through the one polite toast dock.
 * @position Page template; emitted by \`astryx template mobile-gameday-tracker\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, player sheet, toast during lock) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   player sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'}, the toast dock switches from sticky-in-flow to
 *   shell-absolute bottom 76, and t is frozen (the sheet header shows the
 *   'as of Q4 6:42' timestamp — overlays belong to their moment).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for jersey rows); the play
 *   feed is the sanctioned full-bleed exception (full-width dividers, no
 *   card). No desktop Layout frames, no asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   PHX_ACCENT (Pylon burnt orange, the home-team color) plus the
 *   sanctioned opponent literal SEA_TEAL — every fill/text pairing carries
 *   its contrast math at the declaration. Momentum fills, shot dots, and
 *   the WP playhead sit at >=3:1 against their ACTUAL surfaces (math in
 *   comments, per the mobile amendments).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', 13px/600 tabular score
 *   strip + 18px LIVE pill center, 44×44 Pylon mark + 44×44 RefreshCw);
 *   WinProbabilityRibbon 56px sticky top 52 z19 full-bleed (always-on
 *   bottom hairline, noted per contract); tabBar 64px sticky bottom z20,
 *   4 flex:1 tabItems (24px icon over 11px/500 label, Plays badge 11/600
 *   brand pill at top −4 / right −8); rows 44px stat/utility · 60px
 *   two-line feed/box · 40px discs & jersey circles; sectionHeader 13/600
 *   uppercase 0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px
 *   bottom; sheet detents 55% medium / calc(100% − 56px) large, 24px
 *   grabber zone with 36×5 pill, 52px sheet header. TYPE (Figtree via
 *   --font-family-body): 40/700 scoreboard + sheet points numerals ·
 *   22/700 box PTS · 17/600 sheet title · 16/400-500 body & row primary ·
 *   13/400-600 secondary+overlines · 11/500-600 tab labels & badges;
 *   nothing under 11px; tabular-nums on every updating numeral. Touch:
 *   every target >=44×44 with >=8px clearance or merged full-row; every
 *   gesture has a visible button path (playhead drag ⇄ role=slider keys +
 *   prev/next buttons + quarter segments; sheet drag ⇄ grabber click,
 *   X, Escape).
 *
 * Responsive contract:
 * - Fluid 320-430px, zero width literals: cards are gutter-inset
 *   width:auto; ribbon SVG is viewBox 0 0 390 56 + preserveAspectRatio
 *   'none' with index→x mapped from measured clientWidth; court SVG is
 *   width:100% aspect-locked by viewBox 0 0 334 244; scoreboard team
 *   blocks flex:1 around a minWidth-64 clock block, abbrs never wrap.
 *   Below 360px container the navBar center drops the '· Q4 6:42' clock
 *   segment (the clock stays in the scoreboardCard) — no mid-number
 *   ellipsis. Segmented quarter control is flex:1 between the two 44px
 *   steppers (254px at 390, 184px at 320).
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at >=720px the shell renders as the
 *   house-default centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline); sticky chrome and absolute overlays stay
 *   inside because they anchor to shell. No adaptive relayout.
 */

import {Fragment, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  BarChart3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon,
  ListIcon,
  RadioIcon,
  RefreshCwIcon,
  TargetIcon,
  TrophyIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand accent (Pylon burnt orange = Phoenix Cinder home
// color). Light #C2410C on #FFFFFF ≈ 4.9:1 (passes 4.5:1 as text, 3:1 as
// boundary); dark #FF8B47 on the dark card (~#1C1C1E) ≈ 7.0:1. Both sides
// also clear 3:1 against the brand-tinted 14% washes used behind discs.
const PHX_ACCENT = 'light-dark(#C2410C, #FF8B47)';
// Text over a PHX_ACCENT fill (LIVE pill, tab badge, Back-to-live pill).
// Light: #FFFFFF on #C2410C ≈ 4.9:1. Dark: white on #FF8B47 fails (~1.9:1)
// so the dark side flips near-black — #1C1917 on #FF8B47 ≈ 7.2:1.
const PHX_FILL_TEXT = 'light-dark(#FFFFFF, #1C1917)';
// Sanctioned opponent literal (Seattle Squall teal). Light #0F766E on
// #FFFFFF ≈ 4.8:1; dark #2DD4BF on the dark card ≈ 8.6:1 — both >=3:1
// against card AND the 14% teal wash behind jersey circles.
const SEA_TEAL = 'light-dark(#0F766E, #2DD4BF)';
// 14% identity washes for discs / jersey circles / run chips — decorative
// backgrounds; the glyph on top is the full-strength accent (math above).
const PHX_TINT = \`color-mix(in srgb, \${PHX_ACCENT} 14%, transparent)\`;
const SEA_TINT = \`color-mix(in srgb, \${SEA_TEAL} 14%, transparent)\`;
// WP area fill (24% brand over the ribbon surface) — passive data fill;
// the interactive boundary is the full-strength 2px playhead line + 12px
// handle (PHX_ACCENT >=3:1 vs the blurred body surface, math above).
const WP_AREA = \`color-mix(in srgb, \${PHX_ACCENT} 24%, transparent)\`;
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Blur chrome surface shared by navBar / ribbon / tabBar.
const CHROME_SURFACE =
  'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, the visually-hidden h1, the shot
// pop keyframe, and the reduced-motion guard. Transitions animate
// transform/opacity only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const PGT_CSS = \`
.pgt-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.pgt-btn:disabled { cursor: default; }
.pgt-focusable:focus-visible {
  outline: 2px solid \${PHX_ACCENT};
  outline-offset: 2px;
}
.pgt-anim { transition: transform 240ms ease, opacity 240ms ease; }
.pgt-fade { transition: opacity 240ms ease; }
.pgt-meter { transition: width 240ms ease; }
@keyframes pgt-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.pgt-sheet-in { animation: pgt-sheet-in 240ms ease; }
@keyframes pgt-dot-pop {
  from { transform: scale(0.2); }
  to { transform: scale(1); }
}
.pgt-dot-pop { animation: pgt-dot-pop 120ms ease-out; transform-origin: center; transform-box: fill-box; }
.pgt-vh {
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
  .pgt-anim, .pgt-fade, .pgt-meter { transition: none; }
  .pgt-sheet-in, .pgt-dot-pop { animation: none; }
}
\`;

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
  // Scroll lock while the player sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage >=720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline + blur
  // ALWAYS ON (this template does not wire scroll-under; noted).
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
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: PHX_TINT,
    color: PHX_ACCENT,
  },
  // Score strip — 13/600 tabular + 18px LIVE pill, max 200px center track.
  scoreStrip: {
    maxWidth: 200,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    whiteSpace: 'nowrap',
  },
  scoreStripText: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  livePill: {
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    paddingInline: 7,
    borderRadius: 999,
    background: PHX_ACCENT,
    color: PHX_FILL_TEXT,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  // REWIND swap — neutral bordered pill (state is also carried by the
  // Back-to-live pill + toast text, never color alone).
  rewindPill: {
    height: 18,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 7,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  // WIN PROBABILITY RIBBON — 56px sticky top 52 z19 full-bleed; the game
  // scrubber. Always-on bottom hairline.
  ribbon: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 56,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  ribbonInner: {position: 'relative', height: 56, touchAction: 'none'},
  ribbonSvg: {display: 'block', width: '100%', height: 56},
  // 44×56 playhead hit zone, translated so its center rides the index x.
  playheadZone: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 56,
    marginLeft: -22,
    cursor: 'grab',
    borderRadius: 8,
  },
  playheadLine: {
    position: 'absolute',
    left: 21,
    top: 0,
    bottom: 0,
    width: 2,
    background: PHX_ACCENT,
  },
  playheadHandle: {
    position: 'absolute',
    left: 16,
    top: 22,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: PHX_ACCENT,
    border: '2px solid var(--color-background-card)',
  },
  // Back-to-live: 44px-tall hit wrapping the 32px visual pill (top 12).
  backToLiveHit: {
    position: 'absolute',
    right: 8,
    top: 6,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 999,
  },
  backToLivePill: {
    height: 32,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    background: PHX_ACCENT,
    color: PHX_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 8px var(--color-shadow)',
  },
  // TAB PANELS
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  gamePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '12px 16px 24px',
  },
  card: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 16,
  },
  // Inset-grouped listCard (rows own their padding).
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)'},
  rowDividerInset: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
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
  // SCOREBOARD CARD — teams row 56 + 12 gap + line-score rows.
  teamsRow: {display: 'flex', alignItems: 'center', height: 56},
  teamBlock: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  teamAbbr: {fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap'},
  teamScore: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: '44px',
    fontVariantNumeric: 'tabular-nums',
  },
  clockBlock: {
    minWidth: 64,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  clockQuarter: {fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  clockTime: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // QuarterLineScore — 6-col grid (team + Q1..Q4 + T), 11px label row
  // above two 16px tabular rows (label row is a legibility deviation,
  // noted in the summary).
  qlsGrid: {
    display: 'grid',
    gridTemplateColumns: '48px repeat(5, 1fr)',
    marginTop: 12,
    alignItems: 'center',
  },
  qlsHead: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    lineHeight: '14px',
  },
  qlsTeam: {fontSize: 13, fontWeight: 600, lineHeight: '16px'},
  qlsCell: {
    fontSize: 16,
    fontWeight: 400,
    lineHeight: '16px',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  qlsTotal: {fontWeight: 600},
  updatedCaption: {
    marginTop: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // MOMENTUM CARD — overline 16 + 8 + 12px tug bar + 8 + 24px chip row.
  overline: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    lineHeight: '16px',
  },
  tugTrack: {
    position: 'relative',
    height: 12,
    marginTop: 8,
    borderRadius: 999,
    overflow: 'hidden',
    display: 'flex',
  },
  // Fills are the full-strength team accents (>=3:1 vs the card surface,
  // math at the literals) — never muted tints, per the rest-fill amendment.
  tugPhx: {height: 12, background: PHX_ACCENT},
  tugSea: {height: 12, flex: 1, background: SEA_TEAL},
  tugNotch: {
    position: 'absolute',
    left: 'calc(50% - 1px)',
    top: 0,
    bottom: 0,
    width: 2,
    background: 'var(--color-background-card)',
  },
  runRow: {height: 24, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8},
  runChip: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  runCaption: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // SCRUB ROW — 44 stepper + segmented (flex:1) + 44 stepper.
  scrubRow: {display: 'flex', alignItems: 'center', gap: 8, height: 44},
  segTrack: {
    flex: 1,
    height: 36,
    display: 'flex',
    padding: 2,
    gap: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segBtn: {
    flex: 1,
    height: 32,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    border: '1px solid transparent',
    fontVariantNumeric: 'tabular-nums',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  // ROWS — 60px two-line play/box rows; 44px stat/loadMore rows.
  row: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  disc: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  rowText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowSecondary: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: '17px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowTrailing: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: PHX_ACCENT,
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // PLAYS TAB — full-bleed feed (the sanctioned card-less exception).
  feedPanel: {paddingBottom: 24},
  feedRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  feedRowUpcoming: {opacity: 0.4},
  feedRowCurrent: {boxShadow: \`inset 0 0 0 2px \${PHX_ACCENT}\`},
  // COURT TAB
  courtPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '12px 16px 24px',
  },
  courtCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 12,
  },
  courtSvg: {display: 'block', width: '100%', height: 'auto'},
  legendRow: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 4,
    flexWrap: 'nowrap',
  },
  legendChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  statRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
    fontSize: 16,
    fontWeight: 400,
  },
  statRowValue: {
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    fontSize: 16,
  },
  courtSummary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // BOX TAB
  boxPanel: {paddingBottom: 24},
  jersey: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  pts: {
    flexShrink: 0,
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  totalsRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // PLAYER SHEET — medium 55% / large calc(100% − 56px).
  sheetScrim: {position: 'absolute', inset: 0, background: SCRIM, zIndex: 40},
  sheet: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    zIndex: 41,
    height: '55%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-card)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 32px var(--color-shadow)',
  },
  sheetLarge: {height: 'calc(100% - 56px)'},
  grabberZone: {
    width: '100%',
    height: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    flexShrink: 0,
    touchAction: 'none',
    cursor: 'grab',
  },
  grabberPill: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    paddingInlineEnd: 8,
  },
  sheetTitleWrap: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1},
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: '21px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetAsOf: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 16px'},
  sheetPtsBlock: {display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12},
  sheetPts: {fontSize: 40, fontWeight: 700, lineHeight: '44px', fontVariantNumeric: 'tabular-nums'},
  sheetPtsCaption: {fontSize: 13, color: 'var(--color-text-secondary)'},
  quarterStrip: {
    height: 44,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    alignItems: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    marginBottom: 12,
  },
  quarterCell: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1},
  quarterCellLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  quarterCellValue: {fontSize: 16, fontWeight: 600, fontVariantNumeric: 'tabular-nums', lineHeight: '18px'},
  sheetPlayRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderTop: '1px solid var(--color-border)',
  },
  sheetPlayText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetPlayMeta: {
    flexShrink: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  sheetEmpty: {
    padding: '16px 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    borderTop: '1px solid var(--color-border)',
  },
  // TOAST — sticky-in-flow dock (height 0) pinned 76px above the viewport
  // bottom (64px tabBar + 12px), per the sticky-toast amendment; while the
  // sheet locks the shell it switches to shell-absolute bottom 76.
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
    insetInline: 0,
    bottom: 76,
    zIndex: 45,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastPill: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 'calc(100% - 48px)',
    height: 36,
    paddingInline: 16,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 12,
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
  // TAB BAR — 64px sticky bottom z20, 4 flex:1 items.
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
  tabItemActive: {color: PHX_ACCENT},
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // Plays badge — 11/600 per the corrected type floor (spec deviation from
  // the foundations' 10px, noted there).
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
    background: PHX_ACCENT,
    color: PHX_FILL_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic, dual-field, every aggregate cross-checked.
// SCORE ARITHMETIC (verified by construction, re-derivable from GAME_EVENTS):
//   PHX 84 = 12 threes (36) + 18 twos (36) + 12 FT (12)
//   SEA 81 =  9 threes (27) + 21 twos (42) + 12 FT (12)
//   Quarter lines: PHX 22+21+20+21 = 84 · SEA 19+21+20+21 = 81
//   Running checkpoints: 22-19 (idx 35) / 43-40 (69) / 63-60 (105) / 84-81 (139)
//   Event composition (sums to 140): 60 made FG (PHX 30 / SEA 30) + 54 missed
//   FG (PHX 26 / SEA 28) + 12 FT trips of 2 makes (6 per team) + 10 turnovers
//   (5 per team) + 4 qstart markers; quarters 36/34/36/34 events.
//   REWIND SNAPSHOT idx 88 (Q3 4:58): PHX 61 (Okafor 19 + Reyes 14 + Boone 10
//   + Kimura 8 + Ellison 6 + Adeyemi 4) — SEA 58 (Vukovic 17 + Draper 14 +
//   Whitfield 9 + Ferreira 9 + Osei 5 + Lindqvist 2 + Marsh 2).
//   DEVIATION (FT-trip parity): the spec's per-player 3PM/2PM/FTM splits gave
//   several players ODD free-throw totals, impossible with 2-make trips; the
//   splits were re-balanced (Reyes 4/2/2, Kimura 0/3/4, Vukovic 4/4/4, Draper
//   1/6/4, Whitfield 1/4/2, Ferreira 1/3/2, Osei 2/1/0) keeping every
//   cross-check law exact: player PTS, team totals, quarter lines, 3PM/2PM/
//   FTM column sums, FG makes 30/30, attempts 56/58, and the idx-88 snapshot.
// ---------------------------------------------------------------------------

type TeamId = 'phx' | 'sea';
type EventKind = 'fg2' | 'fg3' | 'miss2' | 'miss3' | 'ft' | 'to' | 'qstart';
type TabId = 'game' | 'plays' | 'court' | 'box';
type TeamFilter = 'both' | 'phx' | 'sea';

interface Team {
  id: TeamId;
  abbr: string;
  name: string;
  color: string;
}

interface Player {
  id: string;
  teamId: TeamId;
  number: number;
  name: string;
  short: string;
}

interface GameEvent {
  id: string;
  idx: number;
  q: 1 | 2 | 3 | 4;
  clock: string;
  teamId: TeamId | null;
  playerId: string | null;
  kind: EventKind;
  pts: number;
  made: boolean;
}

const TEAMS: Team[] = [
  {id: 'phx', abbr: 'PHX', name: 'Phoenix Cinder', color: PHX_ACCENT},
  {id: 'sea', abbr: 'SEA', name: 'Seattle Squall', color: SEA_TEAL},
];
const TEAM_BY_ID: Record<TeamId, Team> = {phx: TEAMS[0], sea: TEAMS[1]};

// Roster order IS box-score order (leading scorers first; zero-point rows
// Grant and Cole render last — no hidden rows).
const PLAYERS: Player[] = [
  {id: 'okafor', teamId: 'phx', number: 7, name: 'Marcus Okafor', short: 'M. Okafor'},
  {id: 'reyes', teamId: 'phx', number: 11, name: 'Dante Reyes', short: 'D. Reyes'},
  {id: 'boone', teamId: 'phx', number: 23, name: 'Jalen Boone', short: 'J. Boone'},
  {id: 'kimura', teamId: 'phx', number: 4, name: 'Sho Kimura', short: 'S. Kimura'},
  {id: 'ellison', teamId: 'phx', number: 30, name: 'Trey Ellison', short: 'T. Ellison'},
  {id: 'adeyemi', teamId: 'phx', number: 12, name: 'Femi Adeyemi', short: 'F. Adeyemi'},
  {id: 'novak', teamId: 'phx', number: 9, name: 'Tomas Novak', short: 'T. Novak'},
  {id: 'grant', teamId: 'phx', number: 21, name: 'Isaiah Grant', short: 'I. Grant'},
  {id: 'vukovic', teamId: 'sea', number: 15, name: 'Luka Vukovic', short: 'L. Vukovic'},
  {id: 'draper', teamId: 'sea', number: 8, name: 'Kyle Draper', short: 'K. Draper'},
  {id: 'whitfield', teamId: 'sea', number: 33, name: 'Andre Whitfield', short: 'A. Whitfield'},
  {id: 'ferreira', teamId: 'sea', number: 10, name: 'Paulo Ferreira', short: 'P. Ferreira'},
  {id: 'osei', teamId: 'sea', number: 5, name: 'Kwame Osei', short: 'K. Osei'},
  // Longest-string stress pair: 'B. Lindqvist' + 'Seattle Squall' in the
  // sheet header must ellipsize at 320px without pushing the X button.
  {id: 'lindqvist', teamId: 'sea', number: 14, name: 'Bjorn Lindqvist', short: 'B. Lindqvist'},
  {id: 'marsh', teamId: 'sea', number: 2, name: 'Devin Marsh', short: 'D. Marsh'},
  {id: 'cole', teamId: 'sea', number: 45, name: 'Rasheed Cole', short: 'R. Cole'},
];
const PLAYER_BY_ID: Record<string, Player> = Object.fromEntries(PLAYERS.map(p => [p.id, p]));

// 140 scripted events, idx 0-139, frozen LIVE at idx 139 (Q4 6:42, PHX
// 84-81). Clocks strictly decrease within each quarter; idx 88 is pinned to
// Q3 4:58 and idx 139 to Q4 6:42. Quarter starts sit at idx 0/36/70/106.
const GAME_EVENTS: GameEvent[] = [
  {id: 'e001', idx: 0, q: 1, clock: '12:00', teamId: null, playerId: null, kind: 'qstart', pts: 0, made: false},
  {id: 'e002', idx: 1, q: 1, clock: '11:41', teamId: 'sea', playerId: 'vukovic', kind: 'fg2', pts: 2, made: true},
  {id: 'e003', idx: 2, q: 1, clock: '11:21', teamId: 'phx', playerId: 'okafor', kind: 'fg3', pts: 3, made: true},
  {id: 'e004', idx: 3, q: 1, clock: '11:02', teamId: 'sea', playerId: 'draper', kind: 'miss3', pts: 0, made: false},
  {id: 'e005', idx: 4, q: 1, clock: '10:42', teamId: 'phx', playerId: 'okafor', kind: 'fg2', pts: 2, made: true},
  {id: 'e006', idx: 5, q: 1, clock: '10:23', teamId: 'sea', playerId: 'ferreira', kind: 'fg3', pts: 3, made: true},
  {id: 'e007', idx: 6, q: 1, clock: '10:03', teamId: 'phx', playerId: 'reyes', kind: 'miss2', pts: 0, made: false},
  {id: 'e008', idx: 7, q: 1, clock: '9:44', teamId: 'sea', playerId: 'whitfield', kind: 'fg2', pts: 2, made: true},
  {id: 'e009', idx: 8, q: 1, clock: '9:24', teamId: 'phx', playerId: 'boone', kind: 'fg3', pts: 3, made: true},
  {id: 'e010', idx: 9, q: 1, clock: '9:05', teamId: 'sea', playerId: 'vukovic', kind: 'miss2', pts: 0, made: false},
  {id: 'e011', idx: 10, q: 1, clock: '8:45', teamId: 'phx', playerId: 'kimura', kind: 'fg2', pts: 2, made: true},
  {id: 'e012', idx: 11, q: 1, clock: '8:26', teamId: 'sea', playerId: 'osei', kind: 'fg2', pts: 2, made: true},
  {id: 'e013', idx: 12, q: 1, clock: '8:06', teamId: 'phx', playerId: 'okafor', kind: 'miss3', pts: 0, made: false},
  {id: 'e014', idx: 13, q: 1, clock: '7:47', teamId: 'sea', playerId: 'draper', kind: 'fg2', pts: 2, made: true},
  {id: 'e015', idx: 14, q: 1, clock: '7:27', teamId: 'phx', playerId: 'ellison', kind: 'fg3', pts: 3, made: true},
  {id: 'e016', idx: 15, q: 1, clock: '7:08', teamId: 'sea', playerId: 'vukovic', kind: 'to', pts: 0, made: false},
  {id: 'e017', idx: 16, q: 1, clock: '6:48', teamId: 'phx', playerId: 'boone', kind: 'fg2', pts: 2, made: true},
  {id: 'e018', idx: 17, q: 1, clock: '6:29', teamId: 'sea', playerId: 'lindqvist', kind: 'miss3', pts: 0, made: false},
  {id: 'e019', idx: 18, q: 1, clock: '6:09', teamId: 'phx', playerId: 'okafor', kind: 'fg2', pts: 2, made: true},
  {id: 'e020', idx: 19, q: 1, clock: '5:50', teamId: 'sea', playerId: 'marsh', kind: 'fg2', pts: 2, made: true},
  {id: 'e021', idx: 20, q: 1, clock: '5:30', teamId: 'phx', playerId: 'okafor', kind: 'to', pts: 0, made: false},
  {id: 'e022', idx: 21, q: 1, clock: '5:11', teamId: 'sea', playerId: 'draper', kind: 'fg2', pts: 2, made: true},
  {id: 'e023', idx: 22, q: 1, clock: '4:51', teamId: 'phx', playerId: 'boone', kind: 'miss3', pts: 0, made: false},
  {id: 'e024', idx: 23, q: 1, clock: '4:32', teamId: 'phx', playerId: 'adeyemi', kind: 'fg2', pts: 2, made: true},
  {id: 'e025', idx: 24, q: 1, clock: '4:12', teamId: 'sea', playerId: 'osei', kind: 'miss2', pts: 0, made: false},
  {id: 'e026', idx: 25, q: 1, clock: '3:53', teamId: 'phx', playerId: 'reyes', kind: 'fg3', pts: 3, made: true},
  {id: 'e027', idx: 26, q: 1, clock: '3:33', teamId: 'sea', playerId: 'vukovic', kind: 'fg2', pts: 2, made: true},
  {id: 'e028', idx: 27, q: 1, clock: '3:14', teamId: 'phx', playerId: 'kimura', kind: 'miss2', pts: 0, made: false},
  {id: 'e029', idx: 28, q: 1, clock: '2:54', teamId: 'sea', playerId: 'ferreira', kind: 'fg2', pts: 2, made: true},
  {id: 'e030', idx: 29, q: 1, clock: '2:35', teamId: 'phx', playerId: 'okafor', kind: 'miss2', pts: 0, made: false},
  {id: 'e031', idx: 30, q: 1, clock: '2:15', teamId: 'phx', playerId: 'novak', kind: 'miss2', pts: 0, made: false},
  {id: 'e032', idx: 31, q: 1, clock: '1:56', teamId: 'sea', playerId: 'draper', kind: 'miss2', pts: 0, made: false},
  {id: 'e033', idx: 32, q: 1, clock: '1:36', teamId: 'phx', playerId: 'ellison', kind: 'miss3', pts: 0, made: false},
  {id: 'e034', idx: 33, q: 1, clock: '1:17', teamId: 'sea', playerId: 'vukovic', kind: 'miss3', pts: 0, made: false},
  {id: 'e035', idx: 34, q: 1, clock: '0:57', teamId: 'sea', playerId: 'whitfield', kind: 'miss2', pts: 0, made: false},
  {id: 'e036', idx: 35, q: 1, clock: '0:38', teamId: 'sea', playerId: 'ferreira', kind: 'miss2', pts: 0, made: false},
  {id: 'e037', idx: 36, q: 2, clock: '12:00', teamId: null, playerId: null, kind: 'qstart', pts: 0, made: false},
  {id: 'e038', idx: 37, q: 2, clock: '11:39', teamId: 'sea', playerId: 'vukovic', kind: 'fg2', pts: 2, made: true},
  {id: 'e039', idx: 38, q: 2, clock: '11:18', teamId: 'phx', playerId: 'okafor', kind: 'miss3', pts: 0, made: false},
  {id: 'e040', idx: 39, q: 2, clock: '10:57', teamId: 'sea', playerId: 'draper', kind: 'fg2', pts: 2, made: true},
  {id: 'e041', idx: 40, q: 2, clock: '10:36', teamId: 'phx', playerId: 'reyes', kind: 'fg3', pts: 3, made: true},
  {id: 'e042', idx: 41, q: 2, clock: '10:15', teamId: 'sea', playerId: 'whitfield', kind: 'fg2', pts: 2, made: true},
  {id: 'e043', idx: 42, q: 2, clock: '9:53', teamId: 'sea', playerId: 'vukovic', kind: 'miss2', pts: 0, made: false},
  {id: 'e044', idx: 43, q: 2, clock: '9:32', teamId: 'sea', playerId: 'ferreira', kind: 'fg2', pts: 2, made: true},
  {id: 'e045', idx: 44, q: 2, clock: '9:11', teamId: 'sea', playerId: 'osei', kind: 'fg3', pts: 3, made: true},
  {id: 'e046', idx: 45, q: 2, clock: '8:50', teamId: 'phx', playerId: 'reyes', kind: 'to', pts: 0, made: false},
  {id: 'e047', idx: 46, q: 2, clock: '8:29', teamId: 'sea', playerId: 'draper', kind: 'miss3', pts: 0, made: false},
  {id: 'e048', idx: 47, q: 2, clock: '8:08', teamId: 'phx', playerId: 'okafor', kind: 'fg3', pts: 3, made: true},
  {id: 'e049', idx: 48, q: 2, clock: '7:47', teamId: 'sea', playerId: 'whitfield', kind: 'miss3', pts: 0, made: false},
  {id: 'e050', idx: 49, q: 2, clock: '7:26', teamId: 'phx', playerId: 'kimura', kind: 'fg2', pts: 2, made: true},
  {id: 'e051', idx: 50, q: 2, clock: '7:05', teamId: 'sea', playerId: 'draper', kind: 'to', pts: 0, made: false},
  {id: 'e052', idx: 51, q: 2, clock: '6:44', teamId: 'phx', playerId: 'okafor', kind: 'fg3', pts: 3, made: true},
  {id: 'e053', idx: 52, q: 2, clock: '6:23', teamId: 'sea', playerId: 'osei', kind: 'miss2', pts: 0, made: false},
  {id: 'e054', idx: 53, q: 2, clock: '6:01', teamId: 'phx', playerId: 'kimura', kind: 'fg2', pts: 2, made: true},
  {id: 'e055', idx: 54, q: 2, clock: '5:40', teamId: 'phx', playerId: 'boone', kind: 'miss2', pts: 0, made: false},
  {id: 'e056', idx: 55, q: 2, clock: '5:19', teamId: 'phx', playerId: 'ellison', kind: 'miss3', pts: 0, made: false},
  {id: 'e057', idx: 56, q: 2, clock: '4:58', teamId: 'phx', playerId: 'kimura', kind: 'ft', pts: 2, made: true},
  {id: 'e058', idx: 57, q: 2, clock: '4:37', teamId: 'sea', playerId: 'ferreira', kind: 'miss2', pts: 0, made: false},
  {id: 'e059', idx: 58, q: 2, clock: '4:16', teamId: 'phx', playerId: 'grant', kind: 'to', pts: 0, made: false},
  {id: 'e060', idx: 59, q: 2, clock: '3:55', teamId: 'sea', playerId: 'vukovic', kind: 'fg2', pts: 2, made: true},
  {id: 'e061', idx: 60, q: 2, clock: '3:34', teamId: 'phx', playerId: 'reyes', kind: 'fg2', pts: 2, made: true},
  {id: 'e062', idx: 61, q: 2, clock: '3:13', teamId: 'sea', playerId: 'draper', kind: 'ft', pts: 2, made: true},
  {id: 'e063', idx: 62, q: 2, clock: '2:52', teamId: 'phx', playerId: 'boone', kind: 'fg2', pts: 2, made: true},
  {id: 'e064', idx: 63, q: 2, clock: '2:31', teamId: 'sea', playerId: 'whitfield', kind: 'fg2', pts: 2, made: true},
  {id: 'e065', idx: 64, q: 2, clock: '2:09', teamId: 'phx', playerId: 'okafor', kind: 'miss2', pts: 0, made: false},
  {id: 'e066', idx: 65, q: 2, clock: '1:48', teamId: 'sea', playerId: 'ferreira', kind: 'fg2', pts: 2, made: true},
  {id: 'e067', idx: 66, q: 2, clock: '1:27', teamId: 'phx', playerId: 'adeyemi', kind: 'fg2', pts: 2, made: true},
  {id: 'e068', idx: 67, q: 2, clock: '1:06', teamId: 'sea', playerId: 'vukovic', kind: 'miss3', pts: 0, made: false},
  {id: 'e069', idx: 68, q: 2, clock: '0:45', teamId: 'sea', playerId: 'draper', kind: 'fg2', pts: 2, made: true},
  {id: 'e070', idx: 69, q: 2, clock: '0:24', teamId: 'phx', playerId: 'reyes', kind: 'miss3', pts: 0, made: false},
  {id: 'e071', idx: 70, q: 3, clock: '12:00', teamId: null, playerId: null, kind: 'qstart', pts: 0, made: false},
  {id: 'e072', idx: 71, q: 3, clock: '11:37', teamId: 'phx', playerId: 'reyes', kind: 'fg3', pts: 3, made: true},
  {id: 'e073', idx: 72, q: 3, clock: '11:13', teamId: 'sea', playerId: 'vukovic', kind: 'fg3', pts: 3, made: true},
  {id: 'e074', idx: 73, q: 3, clock: '10:50', teamId: 'phx', playerId: 'boone', kind: 'fg3', pts: 3, made: true},
  {id: 'e075', idx: 74, q: 3, clock: '10:26', teamId: 'sea', playerId: 'vukovic', kind: 'fg3', pts: 3, made: true},
  {id: 'e076', idx: 75, q: 3, clock: '10:03', teamId: 'phx', playerId: 'ellison', kind: 'fg3', pts: 3, made: true},
  {id: 'e077', idx: 76, q: 3, clock: '9:39', teamId: 'sea', playerId: 'whitfield', kind: 'fg3', pts: 3, made: true},
  {id: 'e078', idx: 77, q: 3, clock: '9:16', teamId: 'phx', playerId: 'okafor', kind: 'fg2', pts: 2, made: true},
  {id: 'e079', idx: 78, q: 3, clock: '8:52', teamId: 'sea', playerId: 'draper', kind: 'fg2', pts: 2, made: true},
  {id: 'e080', idx: 79, q: 3, clock: '8:29', teamId: 'sea', playerId: 'vukovic', kind: 'miss2', pts: 0, made: false},
  {id: 'e081', idx: 80, q: 3, clock: '8:06', teamId: 'phx', playerId: 'okafor', kind: 'fg2', pts: 2, made: true},
  {id: 'e082', idx: 81, q: 3, clock: '7:42', teamId: 'sea', playerId: 'vukovic', kind: 'fg3', pts: 3, made: true},
  {id: 'e083', idx: 82, q: 3, clock: '7:19', teamId: 'phx', playerId: 'kimura', kind: 'to', pts: 0, made: false},
  {id: 'e084', idx: 83, q: 3, clock: '6:55', teamId: 'sea', playerId: 'draper', kind: 'fg2', pts: 2, made: true},
  {id: 'e085', idx: 84, q: 3, clock: '6:32', teamId: 'phx', playerId: 'okafor', kind: 'ft', pts: 2, made: true},
  {id: 'e086', idx: 85, q: 3, clock: '6:08', teamId: 'sea', playerId: 'osei', kind: 'miss3', pts: 0, made: false},
  {id: 'e087', idx: 86, q: 3, clock: '5:45', teamId: 'sea', playerId: 'lindqvist', kind: 'fg2', pts: 2, made: true},
  {id: 'e088', idx: 87, q: 3, clock: '5:21', teamId: 'sea', playerId: 'whitfield', kind: 'miss2', pts: 0, made: false},
  {id: 'e089', idx: 88, q: 3, clock: '4:58', teamId: 'phx', playerId: 'reyes', kind: 'fg3', pts: 3, made: true},
  {id: 'e090', idx: 89, q: 3, clock: '4:43', teamId: 'sea', playerId: 'draper', kind: 'miss2', pts: 0, made: false},
  {id: 'e091', idx: 90, q: 3, clock: '4:28', teamId: 'phx', playerId: 'okafor', kind: 'fg2', pts: 2, made: true},
  {id: 'e092', idx: 91, q: 3, clock: '4:13', teamId: 'phx', playerId: 'reyes', kind: 'miss3', pts: 0, made: false},
  {id: 'e093', idx: 92, q: 3, clock: '3:58', teamId: 'sea', playerId: 'vukovic', kind: 'miss2', pts: 0, made: false},
  {id: 'e094', idx: 93, q: 3, clock: '3:43', teamId: 'phx', playerId: 'boone', kind: 'miss2', pts: 0, made: false},
  {id: 'e095', idx: 94, q: 3, clock: '3:28', teamId: 'sea', playerId: 'osei', kind: 'to', pts: 0, made: false},
  {id: 'e096', idx: 95, q: 3, clock: '3:13', teamId: 'sea', playerId: 'whitfield', kind: 'fg2', pts: 2, made: true},
  {id: 'e097', idx: 96, q: 3, clock: '2:58', teamId: 'phx', playerId: 'okafor', kind: 'miss2', pts: 0, made: false},
  {id: 'e098', idx: 97, q: 3, clock: '2:43', teamId: 'sea', playerId: 'ferreira', kind: 'miss2', pts: 0, made: false},
  {id: 'e099', idx: 98, q: 3, clock: '2:28', teamId: 'phx', playerId: 'kimura', kind: 'miss2', pts: 0, made: false},
  {id: 'e100', idx: 99, q: 3, clock: '2:13', teamId: 'sea', playerId: 'draper', kind: 'miss3', pts: 0, made: false},
  {id: 'e101', idx: 100, q: 3, clock: '1:58', teamId: 'phx', playerId: 'ellison', kind: 'miss3', pts: 0, made: false},
  {id: 'e102', idx: 101, q: 3, clock: '1:43', teamId: 'sea', playerId: 'cole', kind: 'to', pts: 0, made: false},
  {id: 'e103', idx: 102, q: 3, clock: '1:28', teamId: 'phx', playerId: 'adeyemi', kind: 'miss2', pts: 0, made: false},
  {id: 'e104', idx: 103, q: 3, clock: '1:13', teamId: 'sea', playerId: 'whitfield', kind: 'miss3', pts: 0, made: false},
  {id: 'e105', idx: 104, q: 3, clock: '0:58', teamId: 'phx', playerId: 'okafor', kind: 'miss3', pts: 0, made: false},
  {id: 'e106', idx: 105, q: 3, clock: '0:43', teamId: 'phx', playerId: 'reyes', kind: 'miss2', pts: 0, made: false},
  {id: 'e107', idx: 106, q: 4, clock: '12:00', teamId: null, playerId: null, kind: 'qstart', pts: 0, made: false},
  {id: 'e108', idx: 107, q: 4, clock: '11:50', teamId: 'sea', playerId: 'vukovic', kind: 'fg3', pts: 3, made: true},
  {id: 'e109', idx: 108, q: 4, clock: '11:41', teamId: 'phx', playerId: 'okafor', kind: 'ft', pts: 2, made: true},
  {id: 'e110', idx: 109, q: 4, clock: '11:31', teamId: 'sea', playerId: 'draper', kind: 'fg3', pts: 3, made: true},
  {id: 'e111', idx: 110, q: 4, clock: '11:21', teamId: 'phx', playerId: 'reyes', kind: 'fg2', pts: 2, made: true},
  {id: 'e112', idx: 111, q: 4, clock: '11:12', teamId: 'sea', playerId: 'vukovic', kind: 'miss2', pts: 0, made: false},
  {id: 'e113', idx: 112, q: 4, clock: '11:02', teamId: 'phx', playerId: 'boone', kind: 'fg2', pts: 2, made: true},
  {id: 'e114', idx: 113, q: 4, clock: '10:53', teamId: 'sea', playerId: 'osei', kind: 'fg3', pts: 3, made: true},
  {id: 'e115', idx: 114, q: 4, clock: '10:43', teamId: 'phx', playerId: 'okafor', kind: 'miss3', pts: 0, made: false},
  {id: 'e116', idx: 115, q: 4, clock: '10:33', teamId: 'sea', playerId: 'vukovic', kind: 'ft', pts: 2, made: true},
  {id: 'e117', idx: 116, q: 4, clock: '10:24', teamId: 'phx', playerId: 'kimura', kind: 'ft', pts: 2, made: true},
  {id: 'e118', idx: 117, q: 4, clock: '10:14', teamId: 'sea', playerId: 'whitfield', kind: 'ft', pts: 2, made: true},
  {id: 'e119', idx: 118, q: 4, clock: '10:04', teamId: 'phx', playerId: 'novak', kind: 'to', pts: 0, made: false},
  {id: 'e120', idx: 119, q: 4, clock: '9:55', teamId: 'phx', playerId: 'ellison', kind: 'fg2', pts: 2, made: true},
  {id: 'e121', idx: 120, q: 4, clock: '9:45', teamId: 'sea', playerId: 'draper', kind: 'ft', pts: 2, made: true},
  {id: 'e122', idx: 121, q: 4, clock: '9:35', teamId: 'phx', playerId: 'reyes', kind: 'miss2', pts: 0, made: false},
  {id: 'e123', idx: 122, q: 4, clock: '9:26', teamId: 'sea', playerId: 'ferreira', kind: 'ft', pts: 2, made: true},
  {id: 'e124', idx: 123, q: 4, clock: '9:16', teamId: 'phx', playerId: 'adeyemi', kind: 'fg2', pts: 2, made: true},
  {id: 'e125', idx: 124, q: 4, clock: '9:07', teamId: 'sea', playerId: 'whitfield', kind: 'miss2', pts: 0, made: false},
  {id: 'e126', idx: 125, q: 4, clock: '8:57', teamId: 'sea', playerId: 'vukovic', kind: 'ft', pts: 2, made: true},
  {id: 'e127', idx: 126, q: 4, clock: '8:47', teamId: 'sea', playerId: 'draper', kind: 'miss3', pts: 0, made: false},
  {id: 'e128', idx: 127, q: 4, clock: '8:38', teamId: 'sea', playerId: 'ferreira', kind: 'miss2', pts: 0, made: false},
  {id: 'e129', idx: 128, q: 4, clock: '8:28', teamId: 'sea', playerId: 'marsh', kind: 'miss2', pts: 0, made: false},
  {id: 'e130', idx: 129, q: 4, clock: '8:18', teamId: 'phx', playerId: 'okafor', kind: 'fg3', pts: 3, made: true},
  {id: 'e131', idx: 130, q: 4, clock: '8:09', teamId: 'sea', playerId: 'vukovic', kind: 'miss3', pts: 0, made: false},
  {id: 'e132', idx: 131, q: 4, clock: '7:59', teamId: 'phx', playerId: 'reyes', kind: 'ft', pts: 2, made: true},
  {id: 'e133', idx: 132, q: 4, clock: '7:49', teamId: 'phx', playerId: 'kimura', kind: 'miss2', pts: 0, made: false},
  {id: 'e134', idx: 133, q: 4, clock: '7:40', teamId: 'sea', playerId: 'lindqvist', kind: 'fg2', pts: 2, made: true},
  {id: 'e135', idx: 134, q: 4, clock: '7:30', teamId: 'phx', playerId: 'boone', kind: 'miss3', pts: 0, made: false},
  {id: 'e136', idx: 135, q: 4, clock: '7:21', teamId: 'sea', playerId: 'marsh', kind: 'to', pts: 0, made: false},
  {id: 'e137', idx: 136, q: 4, clock: '7:11', teamId: 'phx', playerId: 'boone', kind: 'ft', pts: 2, made: true},
  {id: 'e138', idx: 137, q: 4, clock: '7:01', teamId: 'phx', playerId: 'ellison', kind: 'miss2', pts: 0, made: false},
  {id: 'e139', idx: 138, q: 4, clock: '6:52', teamId: 'phx', playerId: 'okafor', kind: 'miss2', pts: 0, made: false},
  {id: 'e140', idx: 139, q: 4, clock: '6:42', teamId: 'phx', playerId: 'novak', kind: 'fg2', pts: 2, made: true},
];

// ---------------------------------------------------------------------------
// DERIVATION — every surface derives from events with idx <= t. There is no
// second copy of any number: navBar strip, scoreboard, QuarterLineScore,
// momentum, court dots, feed dimming, tab badge, and the player sheet all
// read these selectors, so the line-score partial sum equals the navBar
// score at EVERY t by construction (single derivation path).
// ---------------------------------------------------------------------------

const LIVE_T = 139;
const QUARTER_START = [0, 36, 70, 106];

// Cumulative score tables, precomputed once at module scope.
const CUM: Array<{phx: number; sea: number}> = (() => {
  const out: Array<{phx: number; sea: number}> = [];
  let phx = 0;
  let sea = 0;
  for (const e of GAME_EVENTS) {
    if (e.teamId === 'phx') phx += e.pts;
    if (e.teamId === 'sea') sea += e.pts;
    out.push({phx, sea});
  }
  return out;
})();

// WIN PROB — WP[i] = clamp(50 + margin(i) · (2 + floor(i/35)), 5, 95).
// WP[139] = 50 + 3·5 = 65 (margin +3 at the live edge).
const WP: number[] = GAME_EVENTS.map((_, i) => {
  const margin = CUM[i].phx - CUM[i].sea;
  return Math.min(95, Math.max(5, 50 + margin * (2 + Math.floor(i / 35))));
});

function scoreAt(t: number): {phx: number; sea: number} {
  return CUM[t];
}

function clockLabelAt(t: number): string {
  const e = GAME_EVENTS[t];
  return \`Q\${e.q} \${e.clock}\`;
}

function scoreLineAt(t: number): string {
  const s = CUM[t];
  return \`PHX \${s.phx}-\${s.sea} SEA\`;
}

// Toast announcement on every scrub settle: 'Q3 4:58 · PHX 61-58'.
function settleTextAt(t: number): string {
  const s = CUM[t];
  return \`\${clockLabelAt(t)} · PHX \${s.phx}-\${s.sea}\`;
}

// QuarterLineScore cells — null = future quarter (renders an em-dash); the
// in-progress quarter renders its partial sum.
function quarterCellsAt(t: number, teamId: TeamId): Array<number | null> {
  const currentQ = GAME_EVENTS[t].q;
  const cells: Array<number | null> = [null, null, null, null];
  for (let q = 1; q <= 4; q++) {
    if (q > currentQ) continue;
    let sum = 0;
    for (let i = QUARTER_START[q - 1]; i <= t && GAME_EVENTS[i].q === q; i++) {
      const e = GAME_EVENTS[i];
      if (e.teamId === teamId) sum += e.pts;
    }
    cells[q - 1] = sum;
  }
  return cells;
}

interface PlayerStats {
  pts: number;
  fgm: number;
  fga: number;
  tpm: number;
  ftm: number;
  perQuarter: Array<number | null>;
}

// Box rows, sheet numerals, and quarter strips all come from this one pass.
function playerStatsAt(t: number, playerId: string): PlayerStats {
  const currentQ = GAME_EVENTS[t].q;
  const perQuarter: Array<number | null> = [1, 2, 3, 4].map(q => (q <= currentQ ? 0 : null));
  let pts = 0;
  let fgm = 0;
  let fga = 0;
  let tpm = 0;
  let ftm = 0;
  for (let i = 0; i <= t; i++) {
    const e = GAME_EVENTS[i];
    if (e.playerId !== playerId) continue;
    pts += e.pts;
    if (e.kind === 'fg2' || e.kind === 'fg3' || e.kind === 'miss2' || e.kind === 'miss3') fga += 1;
    if (e.kind === 'fg2' || e.kind === 'fg3') fgm += 1;
    if (e.kind === 'fg3') tpm += 1;
    if (e.kind === 'ft') ftm += 2;
    if (e.pts > 0) perQuarter[e.q - 1] = (perQuarter[e.q - 1] ?? 0) + e.pts;
  }
  return {pts, fgm, fga, tpm, ftm, perQuarter};
}

function teamShootingAt(t: number, teamId: TeamId): {fgm: number; fga: number; pct: string} {
  let fgm = 0;
  let fga = 0;
  for (let i = 0; i <= t; i++) {
    const e = GAME_EVENTS[i];
    if (e.teamId !== teamId) continue;
    if (e.kind === 'fg2' || e.kind === 'fg3') {
      fgm += 1;
      fga += 1;
    } else if (e.kind === 'miss2' || e.kind === 'miss3') {
      fga += 1;
    }
  }
  const pct = fga === 0 ? '0.0' : ((fgm / fga) * 100).toFixed(1);
  return {fgm, fga, pct};
}

// Court dots: FG events (makes + misses) with idx <= t, id-derived positions
// x = 10 + (idx·37 % 314) <= 323, y = 16 + (idx·53 % 200) <= 215 — both
// always inside the 334×244 viewBox (verified over all 114 shots).
function shotsAt(t: number, filter: TeamFilter): GameEvent[] {
  const out: GameEvent[] = [];
  for (let i = 0; i <= t; i++) {
    const e = GAME_EVENTS[i];
    if (e.kind !== 'fg2' && e.kind !== 'fg3' && e.kind !== 'miss2' && e.kind !== 'miss3') continue;
    if (filter !== 'both' && e.teamId !== filter) continue;
    out.push(e);
  }
  return out;
}

interface Momentum {
  phx: number;
  sea: number;
  diff: number;
  pct: number;
  chip: {text: string; teamId: TeamId} | null;
}

// MOMENTUM — last-12-events window ending at t; fill split at
// pct = 50 + 4 · clamp(phxPts − seaPts, −12, +12); run chip only when the
// window diff >= 6. Scripted checkpoints: t=139 → 9-2 PHX (pct 78, chip),
// t=58 → 12-0 PHX (clamped pct 98, chip), t=88 → 9-9 (pct 50, Even).
// DEVIATION: the spec's t=88 window (PHX 6, SEA 4) cannot coexist with the
// exact 61-58 snapshot and the 43-40 Q2 checkpoint (the six events at idx
// 71-76 would need 26 points); the window is scripted 9-9 instead, which
// keeps the spec's demonstrated behavior (no chip, 'Even' caption).
function momentumAt(t: number): Momentum {
  let phx = 0;
  let sea = 0;
  for (let i = Math.max(0, t - 11); i <= t; i++) {
    const e = GAME_EVENTS[i];
    if (e.teamId === 'phx') phx += e.pts;
    if (e.teamId === 'sea') sea += e.pts;
  }
  const diff = phx - sea;
  const pct = 50 + 4 * Math.min(12, Math.max(-12, diff));
  const chip =
    Math.abs(diff) >= 6
      ? diff > 0
        ? {text: \`\${phx}-\${sea} PHX run\`, teamId: 'phx' as TeamId}
        : {text: \`\${sea}-\${phx} SEA run\`, teamId: 'sea' as TeamId}
      : null;
  return {phx, sea, diff, pct, chip};
}

// Deterministic play descriptions — id-derived phrasing, no randomness. The
// long-string stress row is K. Draper's idx-3 'misses 26ft three from the
// corner' (idx % 4 === 3 appends the corner tag).
const TWO_PT_MAKES = ['driving layup', '12ft pull-up', 'baseline cut layup', 'post move inside'];
const TWO_PT_MISSES = ['driving layup', '14ft jumper', 'floater in the lane', 'turnaround jumper'];

function descFor(e: GameEvent): string {
  if (e.kind === 'qstart') return \`Start of Q\${e.q}\`;
  const short = e.playerId != null ? PLAYER_BY_ID[e.playerId].short : '';
  switch (e.kind) {
    case 'fg2':
      return \`\${short} makes \${TWO_PT_MAKES[e.idx % 4]}\`;
    case 'fg3':
      return \`\${short} makes \${23 + (e.idx % 6)}ft three\`;
    case 'miss2':
      return \`\${short} misses \${TWO_PT_MISSES[e.idx % 4]}\`;
    case 'miss3':
      return \`\${short} misses \${23 + (e.idx % 6)}ft three\${e.idx % 4 === 3 ? ' from the corner' : ''}\`;
    case 'ft':
      return \`\${short} makes both free throws\`;
    default:
      return \`\${short} turnover\`;
  }
}

// ---------------------------------------------------------------------------
// HOOKS + FOCUS UTILITIES
// ---------------------------------------------------------------------------

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

// Sheets trap focus while open; Escape closes the topmost overlay only;
// focus restores to the opener on every close path.
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
// SEGMENTED CONTROL — 36px track, radiogroup with arrow keys (quarter jumps
// on the Game tab, team filter on the Court tab).
// ---------------------------------------------------------------------------

interface SegOption {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegOption[];
  value: string;
  ariaLabel: string;
  onSelect: (id: string) => void;
}

function SegmentedControl({options, value, ariaLabel, onSelect}: SegmentedControlProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % options.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
    if (next < 0) return;
    event.preventDefault();
    refs.current[next]?.focus();
    onSelect(options[next].id);
  };
  return (
    <div role="radiogroup" aria-label={ariaLabel} style={styles.segTrack}>
      {options.map((option, index) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            ref={el => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            className="pgt-btn pgt-focusable"
            style={{...styles.segBtn, ...(active ? styles.segBtnActive : null)}}
            onClick={() => onSelect(option.id)}
            onKeyDown={event => handleKeyDown(event, index)}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WIN PROBABILITY RIBBON — the 56px sticky area chart that IS the game
// scrubber. SVG is viewBox 0 0 390 56 + preserveAspectRatio 'none' (fluid
// width); pointer x → index mapping uses the MEASURED clientWidth. The
// playhead is the single focusable role=slider; every gesture has its
// button twin (prev/next steppers, quarter radiogroup, backToLive pill).
// ---------------------------------------------------------------------------

// Precomputed geometry: x_i = (i/139)·390, y maps WP 0-100 → 52-4.
const WP_POINTS = WP.map((value, i) => \`\${((i / LIVE_T) * 390).toFixed(2)} \${(52 - (value / 100) * 48).toFixed(2)}\`);
const WP_LINE_PATH = \`M\${WP_POINTS.join(' L')}\`;
const WP_AREA_PATH = \`M0 56 L\${WP_POINTS.join(' L')} L390 56 Z\`;
const QUARTER_TICK_IDX = [36, 70, 106];

interface WinProbabilityRibbonProps {
  t: number;
  onScrub: (idx: number) => void;
  onSettle: (idx: number) => void;
  onBackToLive: () => void;
  reducedMotion: boolean;
}

const SCRUB_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'];

function WinProbabilityRibbon({t, onScrub, onSettle, onBackToLive, reducedMotion}: WinProbabilityRibbonProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const idxFromClientX = (clientX: number): {idx: number; nearLiveEdge: boolean} => {
    const element = innerRef.current;
    if (element == null) return {idx: t, nearLiveEdge: false};
    const rect = element.getBoundingClientRect();
    const x = Math.min(rect.width, Math.max(0, clientX - rect.left));
    const idx = Math.min(LIVE_T, Math.max(0, Math.round((x / rect.width) * LIVE_T)));
    // LIVE magnet: releasing within 16px of the right edge snaps to idx 139.
    return {idx, nearLiveEdge: rect.width - x <= 16};
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button') != null) return; // backToLive pill owns its taps
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onScrub(idxFromClientX(event.clientX).idx);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    onScrub(idxFromClientX(event.clientX).idx); // live update; feed never auto-scrolls during drag
  };
  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const {idx, nearLiveEdge} = idxFromClientX(event.clientX);
    onSettle(nearLiveEdge ? LIVE_T : idx); // announce only on settle, never per-move
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const q = GAME_EVENTS[t].q;
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(0, t - 1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(LIVE_T, t + 1);
    else if (event.key === 'PageUp') next = q < 4 ? QUARTER_START[q] : LIVE_T;
    else if (event.key === 'PageDown') next = t > QUARTER_START[q - 1] ? QUARTER_START[q - 1] : QUARTER_START[Math.max(0, q - 2)];
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = LIVE_T;
    if (next == null) return;
    event.preventDefault();
    onScrub(next);
  };
  // Announce on key RELEASE (settle), never per keydown repeat.
  const handleKeyUp = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (SCRUB_KEYS.includes(event.key)) onSettle(t);
  };

  const score = scoreAt(t);
  const valueText = \`\${clockLabelAt(t)} · Phoenix \${score.phx}, Seattle \${score.sea}\`;

  return (
    <div style={styles.ribbon}>
      <div
        ref={innerRef}
        style={styles.ribbonInner}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}>
        <svg viewBox="0 0 390 56" preserveAspectRatio="none" style={styles.ribbonSvg} aria-hidden focusable="false">
          <path d={WP_AREA_PATH} fill={WP_AREA} />
          <path d={WP_LINE_PATH} fill="none" stroke={PHX_ACCENT} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          {/* dashed 50% baseline */}
          <line x1={0} y1={28} x2={390} y2={28} stroke="var(--color-border)" strokeWidth={1} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
          {QUARTER_TICK_IDX.map(idx => {
            const x = (idx / LIVE_T) * 390;
            return <line key={idx} x1={x} y1={0} x2={x} y2={56} stroke="var(--color-border)" strokeWidth={1} vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Game timeline"
          aria-valuemin={0}
          aria-valuemax={LIVE_T}
          aria-valuenow={t}
          aria-valuetext={valueText}
          className="pgt-focusable"
          style={{...styles.playheadZone, left: \`\${(t / LIVE_T) * 100}%\`}}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}>
          <span style={styles.playheadLine} aria-hidden />
          <span style={styles.playheadHandle} aria-hidden />
        </div>
        {t < LIVE_T ? (
          <button
            type="button"
            className={\`pgt-btn pgt-focusable\${reducedMotion ? '' : ' pgt-fade'}\`}
            style={styles.backToLiveHit}
            onClick={onBackToLive}>
            <span style={styles.backToLivePill}>
              <Icon icon={RadioIcon} size="sm" color="inherit" />
              Back to live
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COURT SHOT PLOTTER — 334×244 stylized SVG halfcourt (baseline top, hoop at
// 167,22, paint 96×108, 3pt arc r136). Renders only FG events with
// idx <= t: makes = 10px filled team-color dot, misses = 10px hollow ring.
// Positions are id-derived (x = 10 + idx·37 % 314, y = 16 + idx·53 % 200 —
// always inside the viewBox). Scrubbing forward pops the landing dot in
// (120ms scale, instant under reduced motion); scrubbing back removes dots
// instantly. SVG is aria-hidden; the visible text summary sits beside it.
// ---------------------------------------------------------------------------

// Interior court lines at 40% secondary — decorative art, not data.
const COURT_LINE = 'color-mix(in srgb, var(--color-text-secondary) 40%, transparent)';

interface CourtShotPlotterProps {
  shots: GameEvent[];
  t: number;
  reducedMotion: boolean;
}

function CourtShotPlotter({shots, t, reducedMotion}: CourtShotPlotterProps) {
  return (
    <svg viewBox="0 0 334 244" style={styles.courtSvg} aria-hidden focusable="false">
      {/* court boundary + baseline (stage clips the 12px card corners) */}
      <rect x={1} y={1} width={332} height={242} fill="none" stroke="var(--color-border)" strokeWidth={1.5} />
      {/* paint 96×108 centered on the hoop */}
      <rect x={119} y={1} width={96} height={108} fill="none" stroke={COURT_LINE} strokeWidth={1.5} />
      {/* free-throw circle */}
      <circle cx={167} cy={109} r={24} fill="none" stroke={COURT_LINE} strokeWidth={1.5} />
      {/* backboard + hoop at 167,22 */}
      <line x1={146} y1={13} x2={188} y2={13} stroke={COURT_LINE} strokeWidth={2} />
      <circle cx={167} cy={22} r={6} fill="none" stroke={COURT_LINE} strokeWidth={1.5} />
      {/* corner-three lines + r136 arc centered on the hoop */}
      <path d="M31 1 L31 22 A136 136 0 0 1 303 22 L303 1" fill="none" stroke={COURT_LINE} strokeWidth={1.5} />
      {shots.map(e => {
        const cx = 10 + ((e.idx * 37) % 314);
        const cy = 16 + ((e.idx * 53) % 200);
        const color = e.teamId === 'phx' ? PHX_ACCENT : SEA_TEAL;
        const pop = e.idx === t && !reducedMotion ? 'pgt-dot-pop' : undefined;
        return e.made ? (
          <circle key={e.id} className={pop} cx={cx} cy={cy} r={5} fill={color} />
        ) : (
          <circle key={e.id} className={pop} cx={cx} cy={cy} r={4.25} fill="none" stroke={color} strokeWidth={1.5} />
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MOMENTUM METER — 12px tug-of-war bar over the last-12-events window ending
// at t. Fill split at pct = 50 + 4·clamp(phx − sea, −12, +12); both fills
// are the FULL-STRENGTH team accents (>=3:1 vs the card surface — math at
// the color literals), never muted tints, per the rest-fill amendment.
// ---------------------------------------------------------------------------

interface MomentumMeterProps {
  momentum: Momentum;
  reducedMotion: boolean;
}

function MomentumMeter({momentum, reducedMotion}: MomentumMeterProps) {
  const chip = momentum.chip;
  return (
    <>
      <div
        style={styles.tugTrack}
        role="img"
        aria-label={\`Momentum, last 12 plays: Phoenix \${momentum.phx}, Seattle \${momentum.sea}\`}>
        <div className={reducedMotion ? undefined : 'pgt-meter'} style={{...styles.tugPhx, width: \`\${momentum.pct}%\`}} />
        <div style={styles.tugSea} />
        <div style={styles.tugNotch} aria-hidden />
      </div>
      <div style={styles.runRow}>
        {chip != null ? (
          // Run chip: 14% team wash behind the full-strength team accent
          // text (PHX #C2410C / SEA #0F766E on the light wash ≈ 4.6:1+;
          // dark pairs ≥ 6:1 — see the color literal block).
          <span
            style={{
              ...styles.runChip,
              background: chip.teamId === 'phx' ? PHX_TINT : SEA_TINT,
              color: chip.teamId === 'phx' ? PHX_ACCENT : SEA_TEAL,
            }}>
            {chip.text}
          </span>
        ) : (
          <span style={styles.runCaption}>Even · last 12 plays</span>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// QUARTER LINE SCORE — 6-col grid (team + Q1..Q4 + T) whose cells derive
// from events <= t: future quarters render an em-dash, the in-progress
// quarter renders its partial sum, and T always equals the navBar score
// (single derivation path — see the selector block).
// ---------------------------------------------------------------------------

function QuarterLineScore({t}: {t: number}) {
  const score = scoreAt(t);
  return (
    <div style={styles.qlsGrid}>
      <span aria-hidden />
      {['Q1', 'Q2', 'Q3', 'Q4', 'T'].map(label => (
        <span key={label} style={styles.qlsHead}>
          {label}
        </span>
      ))}
      {TEAMS.map(team => {
        const cells = quarterCellsAt(t, team.id);
        return (
          <Fragment key={team.id}>
            <span style={styles.qlsTeam}>{team.abbr}</span>
            {cells.map((cell, qi) => (
              <span key={qi} style={styles.qlsCell}>
                {cell == null ? '—' : cell}
              </span>
            ))}
            <span style={{...styles.qlsCell, ...styles.qlsTotal}}>{team.id === 'phx' ? score.phx : score.sea}</span>
          </Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PLAYER SHEET — medium 55% / large calc(100% − 56px); grabber is a real
// button; X, scrim, Escape, and >120px downward grabber drag all close.
// t is FROZEN while the sheet traps focus, so the header carries the
// 'as of Q4 6:42' timestamp — overlays belong to their moment.
// ---------------------------------------------------------------------------

interface PlayerSheetProps {
  player: Player;
  t: number;
  detent: 'medium' | 'large';
  onDetent: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
}

function PlayerSheet({player, t, detent, onDetent, onClose, sheetRef, reducedMotion}: PlayerSheetProps) {
  const team = TEAM_BY_ID[player.teamId];
  const stats = playerStatsAt(t, player.id);
  const scoringPlays: GameEvent[] = [];
  for (let i = 0; i <= t; i++) {
    const e = GAME_EVENTS[i];
    if (e.playerId === player.id && e.pts > 0) scoringPlays.push(e);
  }
  const dragStartYRef = useRef<number | null>(null);

  const handleGrabberPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleGrabberPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartYRef.current;
    dragStartYRef.current = null;
    if (start == null) return;
    const dy = event.clientY - start;
    // Drag is garnish; the grabber CLICK is the contract. Snap by release:
    if (dy <= -80 && detent === 'medium') onDetent('large');
    else if (dy >= 120) {
      if (detent === 'large') onDetent('medium');
      else onClose(); // >120px down past medium closes
    }
  };

  const isZero = stats.pts === 0;
  const jerseyTint = player.teamId === 'phx' ? PHX_TINT : SEA_TINT;
  const jerseyColor = player.teamId === 'phx' ? PHX_ACCENT : SEA_TEAL;

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pgt-sheet-title"
      tabIndex={-1}
      className={reducedMotion ? undefined : 'pgt-sheet-in'}
      style={{...styles.sheet, ...(detent === 'large' ? styles.sheetLarge : null)}}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        } else {
          trapTabKey(event, sheetRef.current);
        }
      }}>
      <div style={styles.grabberZone} onPointerDown={handleGrabberPointerDown} onPointerUp={handleGrabberPointerUp}>
        <button
          type="button"
          className="pgt-btn pgt-focusable"
          aria-label={detent === 'medium' ? 'Expand sheet' : 'Collapse sheet'}
          style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', width: 72, height: 24}}
          onClick={() => onDetent(detent === 'medium' ? 'large' : 'medium')}>
          <span style={styles.grabberPill} />
        </button>
      </div>
      <div style={styles.sheetHeader}>
        <span style={{...styles.jersey, background: jerseyTint, color: jerseyColor}} aria-hidden>
          {player.number}
        </span>
        <span style={styles.sheetTitleWrap}>
          <span id="pgt-sheet-title" style={styles.sheetTitle}>
            {player.name}
          </span>
          {/* frozen timestamp — t cannot change while the sheet traps focus */}
          <span style={styles.sheetAsOf}>{\`#\${player.number} · \${team.name} · as of \${clockLabelAt(t)}\`}</span>
        </span>
        <button type="button" className="pgt-btn pgt-focusable" aria-label="Close" style={styles.iconBtn} onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <div style={styles.sheetPtsBlock}>
          <span style={styles.sheetPts}>{stats.pts}</span>
          <span style={styles.sheetPtsCaption}>{\`PTS · \${stats.fgm}-\${stats.fga} FG · \${stats.tpm} 3PT · \${stats.ftm} FT\`}</span>
        </div>
        <div style={styles.quarterStrip}>
          {['Q1', 'Q2', 'Q3', 'Q4'].map((label, qi) => (
            <span key={label} style={styles.quarterCell}>
              <span style={styles.quarterCellLabel}>{label}</span>
              {/* zero-point players show the all-dash strip (stress fixture 4) */}
              <span style={styles.quarterCellValue}>
                {isZero || stats.perQuarter[qi] == null ? '—' : stats.perQuarter[qi]}
              </span>
            </span>
          ))}
        </div>
        {scoringPlays.length === 0 ? (
          <p style={styles.sheetEmpty}>{\`No scoring plays through \${clockLabelAt(t)}.\`}</p>
        ) : (
          scoringPlays.map(e => (
            <div key={e.id} style={styles.sheetPlayRow}>
              <span style={styles.sheetPlayText}>{descFor(e)}</span>
              <span style={styles.sheetPlayMeta}>{\`Q\${e.q} \${e.clock}\`}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SINGLE STATE OWNER — gameClockStore. EVERYTHING derives from t via the
// pure selectors above; the only mutations are t and view state (no
// destructive verbs exist, so no undo/confirm surfaces are needed).
// ---------------------------------------------------------------------------

interface GamedayState {
  t: number;
  activeTab: TabId;
  teamFilter: TeamFilter;
  playsBatch: number;
  scrollByTab: Record<TabId, number>;
  sheet: {playerId: string; detent: 'medium' | 'large'} | null;
  toast: {seq: number; text: string} | null;
  updated: boolean;
}

const INITIAL_STATE: GamedayState = {
  t: LIVE_T,
  activeTab: 'game',
  teamFilter: 'both',
  playsBatch: 30,
  scrollByTab: {game: 0, plays: 0, court: 0, box: 0},
  sheet: null,
  toast: null,
  updated: false,
};

const TAB_ITEMS: Array<{id: TabId; label: string}> = [
  {id: 'game', label: 'Game'},
  {id: 'plays', label: 'Plays'},
  {id: 'court', label: 'Court'},
  {id: 'box', label: 'Box'},
];

const TAB_ICONS = {game: TrophyIcon, plays: ListIcon, court: TargetIcon, box: BarChart3Icon};

const QUARTER_OPTIONS: SegOption[] = [
  {id: 'q1', label: 'Q1'},
  {id: 'q2', label: 'Q2'},
  {id: 'q3', label: 'Q3'},
  {id: 'q4', label: 'Q4'},
];

const FILTER_OPTIONS: SegOption[] = [
  {id: 'both', label: 'Both'},
  {id: 'phx', label: 'PHX'},
  {id: 'sea', label: 'SEA'},
];

export default function MobileGamedayTrackerTemplate() {
  // Container-width column decision: >=720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  // <360px container: navBar center drops the '· Q4 6:42' clock segment
  // (the clock stays in the scoreboardCard) — no mid-number ellipsis.
  const isNarrow = wrapWidth > 0 && wrapWidth < 360;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<GamedayState>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;
  const update = useCallback((patch: Partial<GamedayState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);
  const toastSeqRef = useRef(0);
  const toastPatch = (text: string) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text}};
  };

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const wasSheetOpenRef = useRef(false);
  const feedRowRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingFeedFocusRef = useRef<number | null>(null);

  const {t, activeTab, teamFilter, playsBatch, sheet, toast, updated} = state;
  const score = scoreAt(t);
  const momentum = momentumAt(t);
  const shots = useMemo(() => shotsAt(t, teamFilter), [t, teamFilter]);
  const currentEvent = GAME_EVENTS[t];
  const upcoming = LIVE_T - t;
  const upcomingLabel = upcoming > 99 ? '99+' : String(upcoming);
  const isLive = t === LIVE_T;

  // SCRUB PATHS — drag/keys update t live (no announcement); settle
  // announces once through the single polite toast dock. t is frozen while
  // the sheet is open (its focus trap makes every scrub path unreachable;
  // the guard is the belt to that suspender).
  const scrubTo = (idx: number) => {
    if (stateRef.current.sheet != null) return;
    update({t: Math.min(LIVE_T, Math.max(0, idx))});
  };
  const settleAt = (idx: number, text?: string) => {
    if (stateRef.current.sheet != null) return;
    const next = Math.min(LIVE_T, Math.max(0, idx));
    update({t: next, ...toastPatch(text ?? settleTextAt(next))});
  };
  const backToLive = () => settleAt(LIVE_T, \`Back to live · PHX \${CUM[LIVE_T].phx}-\${CUM[LIVE_T].sea}\`);
  const stepPlay = (dir: -1 | 1) => {
    const next = Math.min(LIVE_T, Math.max(0, t + dir));
    settleAt(next);
    // Button twin of the drag: when Plays is active, keep the matching feed
    // row in view (never during drags — only on explicit steps).
    if (stateRef.current.activeTab === 'plays') {
      feedRowRefs.current[next]?.scrollIntoView({block: 'center'});
    }
  };

  // PER-TAB PERSISTENCE — scroll recorded on exit, restored on entry;
  // teamFilter, playsBatch, and t all survive switches (t is intentionally
  // global — that is the artifact). Re-tapping the active tab scrolls to
  // top; the sheet closes on switch (overlays belong to their moment).
  const switchTab = (tab: TabId) => {
    const scroller = document.scrollingElement;
    if (tab === stateRef.current.activeTab) {
      scroller?.scrollTo({top: 0});
      return;
    }
    update({
      activeTab: tab,
      sheet: null,
      scrollByTab: {...stateRef.current.scrollByTab, [stateRef.current.activeTab]: scroller?.scrollTop ?? 0},
    });
  };
  useEffect(() => {
    document.scrollingElement?.scrollTo({top: stateRef.current.scrollByTab[activeTab] ?? 0});
  }, [activeTab]);

  // SHEET lifecycle — focus in with preventScroll (plain .focus() would
  // scroll-reveal the animating sheet inside the locked column), restore to
  // the opener row on every close path.
  const openSheet = (playerId: string, opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener;
    update({sheet: {playerId, detent: 'medium'}});
  };
  const closeSheet = () => update({sheet: null});
  useEffect(() => {
    const isOpen = sheet != null;
    if (isOpen && !wasSheetOpenRef.current) {
      sheetRef.current?.focus({preventScroll: true});
    } else if (!isOpen && wasSheetOpenRef.current) {
      sheetOpenerRef.current?.focus({preventScroll: true});
    }
    wasSheetOpenRef.current = isOpen;
  }, [sheet]);

  // LOAD MORE — batches of 30 (30/60/90/120/140; the last press appends
  // 20); focus moves to the first new row, the dock announces the count.
  const loadMore = () => {
    const nextBatch = Math.min(GAME_EVENTS.length, playsBatch + 30);
    pendingFeedFocusRef.current = playsBatch;
    update({playsBatch: nextBatch, ...toastPatch(\`\${nextBatch - playsBatch} more loaded\`)});
  };
  useEffect(() => {
    if (pendingFeedFocusRef.current != null) {
      feedRowRefs.current[pendingFeedFocusRef.current]?.focus();
      pendingFeedFocusRef.current = null;
    }
  }, [playsBatch]);

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktopColumn ? styles.shellDesktop : null),
    ...(sheet != null ? styles.shellLocked : null),
  };

  // ---------------------------------------------------------------- RENDER
  const renderFeedRow = (e: GameEvent, recent: boolean) => {
    const cum = CUM[e.idx];
    const isUpcoming = e.idx > t;
    const isCurrent = e.idx === t;
    const player = e.playerId != null ? PLAYER_BY_ID[e.playerId] : null;
    const team = e.teamId != null ? TEAM_BY_ID[e.teamId] : null;
    // Dimming is never the only signal: upcoming rows also carry
    // 'upcoming' in their accessible name.
    const label = \`\${descFor(e)}, Q\${e.q} \${e.clock}, \${cum.phx}-\${cum.sea}\${isUpcoming ? ', upcoming' : ''}\`;
    return (
      <button
        key={e.id}
        ref={recent ? undefined : el => {
          feedRowRefs.current[e.idx] = el;
        }}
        type="button"
        className="pgt-btn pgt-focusable"
        aria-label={label}
        style={{
          ...styles.feedRow,
          ...(isUpcoming ? styles.feedRowUpcoming : null),
          ...(isCurrent ? styles.feedRowCurrent : null),
        }}
        onClick={() => settleAt(e.idx)}>
        <span
          style={{
            ...styles.disc,
            background: team == null ? 'var(--color-background-muted)' : team.id === 'phx' ? PHX_TINT : SEA_TINT,
            color: team == null ? 'var(--color-text-secondary)' : team.id === 'phx' ? PHX_ACCENT : SEA_TEAL,
          }}
          aria-hidden>
          {team?.abbr ?? \`Q\${e.q}\`}
        </span>
        <span style={styles.rowText}>
          <span style={styles.rowPrimary}>{descFor(e)}</span>
          <span style={styles.rowSecondary}>{\`Q\${e.q} \${e.clock} · \${cum.phx}-\${cum.sea}\`}</span>
        </span>
        {player != null ? <span style={styles.rowTrailing}>{e.pts > 0 ? \`+\${e.pts}\` : ''}</span> : null}
      </button>
    );
  };

  const recentEvents = [t, t - 1, t - 2].filter(i => i >= 0).map(i => GAME_EVENTS[i]);

  const renderBoxSection = (team: Team) => {
    const roster = PLAYERS.filter(p => p.teamId === team.id);
    const shooting = teamShootingAt(t, team.id);
    const teamScore = team.id === 'phx' ? score.phx : score.sea;
    return (
      <Fragment key={team.id}>
        <h3 style={styles.sectionHeader}>{\`\${team.abbr} · \${team.name}\`}</h3>
        <div style={styles.listCard}>
          {roster.map((p, index) => {
            const stats = playerStatsAt(t, p.id);
            return (
              <Fragment key={p.id}>
                {index > 0 ? <div style={styles.rowDividerDeep} aria-hidden /> : null}
                <button
                  type="button"
                  className="pgt-btn pgt-focusable"
                  aria-label={\`\${p.name}, \${stats.pts} points\`}
                  style={styles.row}
                  onClick={event => openSheet(p.id, event.currentTarget)}>
                  <span
                    style={{
                      ...styles.jersey,
                      background: team.id === 'phx' ? PHX_TINT : SEA_TINT,
                      color: team.id === 'phx' ? PHX_ACCENT : SEA_TEAL,
                    }}
                    aria-hidden>
                    {p.number}
                  </span>
                  <span style={styles.rowText}>
                    <span style={styles.rowPrimary}>{p.name}</span>
                    <span style={styles.rowSecondary}>{\`\${stats.fgm}-\${stats.fga} FG · \${stats.tpm} 3PT · \${stats.ftm} FT\`}</span>
                  </span>
                  <span style={styles.pts}>{stats.pts}</span>
                </button>
              </Fragment>
            );
          })}
          <div style={styles.rowDivider} aria-hidden />
          <div style={styles.totalsRow}>
            <span>Team</span>
            <span>{\`\${shooting.fgm}-\${shooting.fga} FG · \${teamScore} PTS\`}</span>
          </div>
        </div>
      </Fragment>
    );
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{PGT_CSS}</style>
      <div style={shellStyle}>
        <h1 className="pgt-vh">Pylon — PHX vs SEA gameday</h1>

        {/* NAV BAR — score strip + LIVE/REWIND pill; the strip and pill
            both derive from t (never color alone: rewinding also reveals
            the ribbon's Back-to-live pill and the toast announces it). */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="pgt-btn pgt-focusable"
              aria-label="Pylon — scroll to top"
              style={styles.iconBtn}
              onClick={() => document.scrollingElement?.scrollTo({top: 0})}>
              <span style={styles.brandMark}>
                <Icon icon={FlagIcon} size="sm" color="inherit" />
              </span>
            </button>
          </div>
          <div style={styles.scoreStrip}>
            <span style={styles.scoreStripText}>
              {isNarrow ? scoreLineAt(t) : \`\${scoreLineAt(t)} · \${clockLabelAt(t)}\`}
            </span>
            {isLive ? (
              // White on #C2410C ≈ 4.9:1; near-black on #FF8B47 ≈ 7.2:1
              // (PHX_FILL_TEXT pair at the literal).
              <span style={styles.livePill}>LIVE</span>
            ) : (
              <span style={styles.rewindPill}>REWIND</span>
            )}
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="pgt-btn pgt-focusable"
              aria-label="Refresh scores"
              style={styles.iconBtn}
              onClick={() => update({updated: true})}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <WinProbabilityRibbon t={t} onScrub={scrubTo} onSettle={settleAt} onBackToLive={backToLive} reducedMotion={reducedMotion} />

        <main style={styles.main}>
          {activeTab === 'game' ? (
            <section style={styles.gamePanel} aria-label="Game">
              <h2 className="pgt-vh">Game</h2>
              <div style={styles.card}>
                <div style={styles.teamsRow}>
                  <div style={styles.teamBlock}>
                    <span style={styles.teamAbbr}>PHX</span>
                    <span style={styles.teamScore}>{score.phx}</span>
                  </div>
                  <div style={styles.clockBlock}>
                    <span style={styles.clockQuarter}>{\`Q\${currentEvent.q}\`}</span>
                    <span style={styles.clockTime}>{currentEvent.clock}</span>
                  </div>
                  <div style={styles.teamBlock}>
                    <span style={styles.teamAbbr}>SEA</span>
                    <span style={styles.teamScore}>{score.sea}</span>
                  </div>
                </div>
                <QuarterLineScore t={t} />
                {updated ? (
                  <p role="status" style={styles.updatedCaption}>
                    Updated just now
                  </p>
                ) : null}
              </div>
              <div style={styles.card}>
                <h3 style={{...styles.overline, margin: 0}}>MOMENTUM · LAST 12 PLAYS</h3>
                <MomentumMeter momentum={momentum} reducedMotion={reducedMotion} />
              </div>
              <div style={styles.scrubRow}>
                <button
                  type="button"
                  className="pgt-btn pgt-focusable"
                  aria-label="Previous play"
                  style={styles.iconBtn}
                  disabled={t === 0}
                  onClick={() => stepPlay(-1)}>
                  <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                </button>
                <SegmentedControl
                  options={QUARTER_OPTIONS}
                  value={\`q\${currentEvent.q}\`}
                  ariaLabel="Jump to quarter"
                  onSelect={id => settleAt(QUARTER_START[Number(id.slice(1)) - 1])}
                />
                <button
                  type="button"
                  className="pgt-btn pgt-focusable"
                  aria-label="Next play"
                  style={styles.iconBtn}
                  disabled={t === LIVE_T}
                  onClick={() => stepPlay(1)}>
                  <Icon icon={ChevronRightIcon} size="md" color="inherit" />
                </button>
              </div>
              <h3 style={{...styles.sectionHeader, paddingInline: 16}}>LATEST PLAYS</h3>
              <div style={{...styles.listCard, marginInline: 0}}>
                {recentEvents.map((e, index) => (
                  <Fragment key={e.id}>
                    {index > 0 ? <div style={styles.rowDividerDeep} aria-hidden /> : null}
                    {renderFeedRow(e, true)}
                  </Fragment>
                ))}
                <div style={styles.rowDivider} aria-hidden />
                <button type="button" className="pgt-btn pgt-focusable" style={styles.loadMoreRow} onClick={() => switchTab('plays')}>
                  Open full feed
                </button>
              </div>
            </section>
          ) : null}

          {activeTab === 'plays' ? (
            <section style={styles.feedPanel} aria-label="Plays">
              <h2 className="pgt-vh">Play-by-play</h2>
              {GAME_EVENTS.slice(0, playsBatch).map(e => (
                <Fragment key={e.id}>
                  {e.kind === 'qstart' ? <h3 style={styles.sectionHeader}>{\`Quarter \${e.q}\`}</h3> : null}
                  {renderFeedRow(e, false)}
                  <div style={styles.rowDivider} aria-hidden />
                </Fragment>
              ))}
              {playsBatch < GAME_EVENTS.length ? (
                <button type="button" className="pgt-btn pgt-focusable" style={styles.loadMoreRow} onClick={loadMore}>
                  {\`Show \${Math.min(30, GAME_EVENTS.length - playsBatch)} more\`}
                </button>
              ) : (
                <p style={styles.terminalCaption}>All 140 plays</p>
              )}
            </section>
          ) : null}

          {activeTab === 'court' ? (
            <section style={styles.courtPanel} aria-label="Court">
              <h2 className="pgt-vh">Shot chart</h2>
              {/* row-flex wrapper: segTrack is flex:1 (sized for the
                  scrubRow); inside this column panel it needs a row box. */}
              <div style={{display: 'flex'}}>
                <SegmentedControl
                  options={FILTER_OPTIONS}
                  value={teamFilter}
                  ariaLabel="Filter shots by team"
                  onSelect={id => update({teamFilter: id as TeamFilter})}
                />
              </div>
              <div style={styles.courtCard}>
                <CourtShotPlotter shots={shots} t={t} reducedMotion={reducedMotion} />
              </div>
              {/* visible twin of the aria-hidden SVG; filtered-empty at t=0
                  keeps chrome + data structure (no emptyState block). */}
              <p style={styles.courtSummary}>
                {shots.length === 0 ? 'No shots yet' : \`\${shots.length} shots through \${clockLabelAt(t)}\`}
              </p>
              <div style={styles.legendRow}>
                <span style={styles.legendChip}>
                  <span style={{width: 10, height: 10, borderRadius: '50%', background: PHX_ACCENT}} aria-hidden />
                  PHX make
                </span>
                <span style={styles.legendChip}>
                  <span style={{width: 10, height: 10, borderRadius: '50%', background: SEA_TEAL}} aria-hidden />
                  SEA make
                </span>
                <span style={styles.legendChip}>
                  <span
                    style={{width: 10, height: 10, borderRadius: '50%', border: '1.5px solid var(--color-text-secondary)'}}
                    aria-hidden
                  />
                  Miss
                </span>
              </div>
              <div style={{...styles.listCard, marginInline: 0}}>
                {TEAMS.map((team, index) => {
                  const shooting = teamShootingAt(t, team.id);
                  return (
                    <Fragment key={team.id}>
                      {index > 0 ? <div style={styles.rowDividerInset} aria-hidden /> : null}
                      <div style={styles.statRow}>
                        <span>{team.name}</span>
                        <span style={styles.statRowValue}>{\`\${shooting.fgm}/\${shooting.fga} FG · \${shooting.pct}%\`}</span>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </section>
          ) : null}

          {activeTab === 'box' ? (
            <section style={styles.boxPanel} aria-label="Box score">
              <h2 className="pgt-vh">Box score</h2>
              {TEAMS.map(renderBoxSection)}
            </section>
          ) : null}
        </main>

        {/* ONE polite toast dock — sticky-in-flow above the tabBar; shell-
            absolute bottom 76 only while the sheet locks the shell. */}
        <div style={sheet != null ? styles.toastAnchorLocked : styles.toastAnchor}>
          <div aria-live="polite">
            {toast != null ? (
              <div key={toast.seq} style={styles.toastPill}>
                {toast.text}
              </div>
            ) : null}
          </div>
        </div>

        <nav style={styles.tabBar} aria-label="Sections">
          {TAB_ITEMS.map(item => {
            const active = item.id === activeTab;
            const showBadge = item.id === 'plays' && upcoming > 0;
            return (
              <button
                key={item.id}
                type="button"
                className="pgt-btn pgt-focusable"
                aria-current={active ? 'page' : undefined}
                aria-label={showBadge ? \`Plays, \${upcomingLabel} upcoming\` : item.label}
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => switchTab(item.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={TAB_ICONS[item.id]} size="lg" color="inherit" />
                  {showBadge ? (
                    <span style={styles.tabBadge} aria-hidden>
                      {upcomingLabel}
                    </span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {sheet != null ? (
          <>
            <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <PlayerSheet
              player={PLAYER_BY_ID[sheet.playerId]}
              t={t}
              detent={sheet.detent}
              onDetent={detent => update({sheet: {...sheet, detent}})}
              onClose={closeSheet}
              sheetRef={sheetRef}
              reducedMotion={reducedMotion}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};