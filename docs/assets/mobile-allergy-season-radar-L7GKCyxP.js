var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Aira pollen model for Maple
 *   Grove, MN, frozen at Saturday Jul 4: POLLEN_7DAY seeded counts (gr/m³)
 *   for Tree/Grass/Weed/Mold across Sat Jul 4 → Fri Jul 10, DEFAULT_WEIGHTS
 *   {tree:40, grass:90, weed:65, mold:25} (sum 220), composite(day) =
 *   round(Σ count×weight / Σ weight) cross-checked by hand for all seven
 *   days (Sat 12495/220=57 … Thu 16810/220=76), PAST_EXPOSURE
 *   [44,52,63,58,49,55,57] for Jun 28–Jul 4, and three seeded reactions
 *   (Jun 30 · 63 Severe, Jul 2 · 49 Mild, Jul 3 · 55 Moderate → 2 of 3 on
 *   high days = 67% Moderate match). No Date.now, no Math.random, all date
 *   strings literal.
 * @output Aira — Allergy Season Radar: a 390px MOBILE four-tab surface. A
 *   weighted composite pollen index computed live from seeded 7-day
 *   allergen curves × sensitivity weights. TODAY: navBar (pollen-grain
 *   mark · Maple Grove, MN · Refresh), day header + risk pill, a 240px
 *   PollenSectorDial (four 82° sectors, r = 28 + round(count×0.75), weight
 *   arcs at r112, 44px composite numeral), a ForecastScrubStrip (7 stacked
 *   columns, draggable playhead + prev/next buttons + role=slider
 *   keyboard), a CorrelationBand (exposure area vs reaction markers,
 *   pattern readout), and a ReadinessCard pre-dose proposal. FORECAST:
 *   7×60px day rows with composite discs. REACTIONS: 72px swipeable rows +
 *   undo-over-confirm delete. PROFILE: 4-channel SensitivityMixer EQ, top
 *   trigger rank list, settings. Signature: scrubbing the playhead to
 *   Thursday morphs the dial (Grass r 94→106), counts the numeral 57→76,
 *   re-tints the band Very High, and re-proposes 'Take antihistamine Wed
 *   9:00 PM'; dragging grass weight 90→30 flips the top trigger to Weed
 *   (2665 vs 2640 points) and drops Thu to 66 → 'No pre-dose needed';
 *   saving a reaction from the FAB sheet drops a marker at Jul 4/57 and
 *   strengthens the pattern 67%→75% 'Strong match'.
 * @position Page template; emitted by \`astryx template mobile-allergy-season-radar\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, menus, marker
 *   cards) are position:'absolute' INSIDE shell; position:fixed is banned.
 *   While the log sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. Stage clips 16px corners;
 *   shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no desktop
 *   Layout frames, no asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Aira amber); four allergen constants (TREE/GRASS/WEED/
 *   MOLD) and the ERROR_STRONG fill pair are the sanctioned non-brand
 *   literals, each with contrast math at the declaration. Hairline/muted
 *   tokens are passive separators only — every interactive rest fill
 *   (switch OFF track, slider fills) carries its own ≥3:1 pair.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — declared
 *   choice, no scroll wiring); day header 56px; tabBar exactly 64px sticky
 *   bottom z20 (4 tabs, 24px icon over 11px/500 label); FAB 56×56 radius
 *   16 in a sticky height-0 anchor at bottom:80; rows 44px utility / 60px
 *   two-line / 72px media (40px discs); sectionHeader 13px/600 uppercase
 *   0.06em at 32px, 20px top / 8px bottom; sheet detents 55% medium /
 *   calc(100% − 56px) large, 24px grabber zone with 36×5 pill, 52px sheet
 *   header; toastDock STICKY-IN-FLOW bottom:76 z30 (absolute insetInline
 *   16 bottom 76 ONLY while the sheet scroll-lock is active). TYPE
 *   (Figtree): 28/700 large titles · 22/700 day header · 17/600 nav+card
 *   titles · 16/400 body floor · 13/400 meta · 11/500 overlines; dial
 *   numeral 44/700; nothing under 11px; tabular-nums on every updating
 *   numeral. Touch: every target ≥44×44 with ≥8px clearance or merged into
 *   a full-row/tall-column target; every gesture (playhead drag, slider
 *   drag, swipe-reveal, sheet drag) has a visible button path (prev/next
 *   chevrons, ± steppers, 44×44 ellipsis, clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow (overflowX:'clip' is
 *   backstop only). No width literals: dial SVG width:'100%' maxWidth 240
 *   marginInline auto via viewBox scaling; strip columns flex:1 (~36px at
 *   320 — under-44 width compensated by the 128px-tall merged column
 *   target plus the always-present 44×44 prev/next buttons); mixer columns
 *   flex:1 (4 × ≥58px at 320 with 44px-wide slider hits). Location title
 *   ellipsizes at 200px; forecast readout ellipsizes; readiness secondary
 *   wraps to 2 lines.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout; the dial anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  ActivityIcon,
  CalendarRangeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PillIcon,
  PlusIcon,
  RefreshCwIcon,
  SlidersHorizontalIcon,
  SunMediumIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math. Card surfaces: ~#FFFFFF light / ~#1C1C1E dark.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Aira amber). #9A6700 on #FFFFFF ≈ 4.9:1
// (passes 4.5:1 text); #E8A013 on the dark card ≈ 7.7:1.
const BRAND_ACCENT = 'light-dark(#9A6700, #E8A013)';
// Text over a BRAND_ACCENT fill: #FFFFFF on #9A6700 ≈ 4.9:1; #201500 on
// #E8A013 ≈ 8.1:1 — both pass 4.5:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #201500)';
// FAB glyph per spec: dark-on-amber both schemes. #201500 on #E8A013
// (dark FAB fill) ≈ 8.1:1; #201500 on #9A6700 (light FAB fill) ≈ 3.7:1 —
// a 24px glyph is graphics, ≥3:1 required, passes.
const FAB_GLYPH = 'light-dark(#201500, #201500)';
// Allergen constants — each full-strength value clears 3:1 against its
// ACTUAL card surface in both schemes (interactive boundaries + meaningful
// rest fills per the foundations amendment):
//   TREE  #2F7D46 on #FFF ≈ 4.6:1 · #6FCE8B on #1C1C1E ≈ 8.8:1
const TREE = 'light-dark(#2F7D46, #6FCE8B)';
//   GRASS #8A7500 on #FFF ≈ 4.5:1 · #D6C34A on #1C1C1E ≈ 9.3:1
const GRASS = 'light-dark(#8A7500, #D6C34A)';
//   WEED  #C2560F on #FFF ≈ 4.5:1 · #F0915A on #1C1C1E ≈ 6.9:1
const WEED = 'light-dark(#C2560F, #F0915A)';
//   MOLD  #6C4AB0 on #FFF ≈ 6.5:1 · #A98BE8 on #1C1C1E ≈ 5.7:1
const MOLD = 'light-dark(#6C4AB0, #A98BE8)';
// Very-High band + Severe severity + delete-block fill (spec's
// --color-error family, quarantined as a pair so the 13px/600 label on the
// fill can be contrast-controlled): #C92A2A on #FFF ≈ 5.5:1; #FF8787 on
// #1C1C1E ≈ 7.4:1.
const ERROR_STRONG = 'light-dark(#C92A2A, #FF8787)';
// Text over an ERROR_STRONG fill: #FFFFFF on #C92A2A ≈ 5.5:1; #300808 on
// #FF8787 ≈ 7.8:1.
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #300808)';
// Low band text (success family kept as a token — pill text only).
const SUCCESS_TEXT = 'var(--color-success)';
// Switch OFF track — an interactive rest fill, so the foundations' default
// rgba washes are NOT enough (amendment: ≥3:1 vs the actual card surface).
// #867D72 on #FFFFFF ≈ 3.5:1; #6F675D on #1C1C1E ≈ 3.2:1.
const SWITCH_OFF = 'light-dark(#867D72, #6F675D)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

/** color-mix wash over the card surface. */
function mix(color: string, pct: number): string {
  return \`color-mix(in srgb, \${color} \${pct}%, transparent)\`;
}

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, always-on input focus
// ring, visually-hidden h1, reduced-motion guard. Transitions animate
// transform/opacity/color only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const AIRA_CSS = \`
.ara-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.ara-btn:disabled { cursor: default; }
.ara-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.ara-anim { transition: transform 200ms ease, opacity 200ms ease; }
.ara-fade { transition: opacity 200ms ease; }
.ara-input:focus {
  box-shadow: inset 0 0 0 2px \${BRAND_ACCENT};
  outline: none;
}
@keyframes ara-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.ara-sheet-in { animation: ara-sheet-in 200ms ease; }
.ara-vh {
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
  .ara-anim, .ara-fade { transition: none; }
  .ara-sheet-in { animation: none; }
}
\`;

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
  // Scroll lock while the sheet is open (overflowY here + the shell's own
  // overflowX:'clip' == full overflow:hidden without shorthand conflicts).
  shellLocked: {height: '100dvh', overflowY: 'hidden'},
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; hairline + blur ALWAYS ON (declared
  // choice, no scroll wiring).
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
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  navTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    maxWidth: 200,
    minWidth: 0,
  },
  navPin: {display: 'inline-flex', color: 'var(--color-text-secondary)', flexShrink: 0},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // LARGE-TITLE ROW — 52px, 28/700 (Forecast / Reactions / Profile).
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  // DAY HEADER — 56px block: 22/700 selected-day name + trailing risk pill.
  dayHeader: {
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
  },
  dayTitle: {fontSize: 22, fontWeight: 700, margin: 0, minWidth: 0},
  riskPill: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Refresh caption — fixed string, role='status' (the refresh announcer).
  refreshStatus: {paddingInline: 16, fontSize: 13, color: 'var(--color-text-secondary)'},
  // Inset-grouped cards — 16px gutter, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  cardPadded: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 16,
  },
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
  cardGap: {height: 12, flexShrink: 0},
  sectionGap: {height: 24, flexShrink: 0},
  cardTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  cardSub: {fontSize: 13, color: 'var(--color-text-secondary)', margin: 0},
  // DIAL —
  dialSvgWrap: {
    position: 'relative',
    width: '100%',
    maxWidth: 240,
    marginInline: 'auto',
  },
  sectorHit: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 16,
    background: 'transparent',
  },
  dialCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  dialCenterStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    textAlign: 'center',
  },
  dialNumeral: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },
  dialBandLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  // Sector detail strip — 60px, toggled by wedge buttons (aria-expanded).
  detailStrip: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 4,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  legendRow: {height: 32, display: 'flex', alignItems: 'center', gap: 12},
  legendSwatch: {width: 12, height: 12, borderRadius: 4, flexShrink: 0},
  legendName: {flex: 1, minWidth: 0, fontSize: 16},
  legendCount: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  // FORECAST SCRUB STRIP — this ONE card uses 12px inline padding (noted:
  // buys 7 usable ~44px columns at 390).
  stripCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: '16px 12px 12px',
  },
  stripHeader: {
    height: 24,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 4,
  },
  stripReadout: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  chartZone: {
    position: 'relative',
    height: 128,
    display: 'flex',
    gap: 2,
    marginTop: 16,
  },
  colBtn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column-reverse',
    borderRadius: 4,
  },
  playheadLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    background: BRAND_ACCENT,
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
  },
  // The playhead slider — 44px-wide pointer hit, keyboard role='slider'.
  playheadHit: {
    position: 'absolute',
    top: -12,
    bottom: 0,
    width: 44,
    transform: 'translateX(-50%)',
    touchAction: 'none',
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 12,
    cursor: 'grab',
  },
  playheadHandle: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    boxShadow: '0 2px 8px var(--color-shadow)',
    border: '2px solid var(--color-background-card)',
    flexShrink: 0,
  },
  dowRow: {display: 'flex', gap: 2, height: 20, marginTop: 4},
  dowCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    alignSelf: 'center',
  },
  controlsRow: {display: 'flex', alignItems: 'center', height: 44, marginTop: 4},
  controlsReadout: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // CORRELATION BAND —
  bandZone: {position: 'relative', height: 96, marginTop: 12},
  bandSvg: {position: 'absolute', inset: 0, width: '100%', height: 96},
  thresholdLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 43,
    borderTop: '1px dashed var(--color-text-secondary)',
    pointerEvents: 'none',
  },
  thresholdLabel: {
    position: 'absolute',
    right: 0,
    top: 28,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'none',
  },
  markerHit: {
    position: 'absolute',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    boxShadow: '0 0 0 2px var(--color-background-card)',
  },
  markerCard: {
    position: 'absolute',
    zIndex: 15,
    minWidth: 180,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  markerCardTitle: {fontSize: 13, fontWeight: 600},
  markerCardMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  corrLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    height: 20,
    marginTop: 8,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  corrLegendItem: {display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'},
  corrCaption: {
    marginTop: 8,
    minHeight: 20,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  // READINESS CARD —
  readinessRow: {display: 'flex', alignItems: 'center', gap: 12},
  readinessDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    background: mix(BRAND_ACCENT, 16),
    color: BRAND_ACCENT,
  },
  readinessText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  readinessTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  readinessSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // FORECAST TAB rows — 60px two-line with 40px composite disc.
  dayRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  dayDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  dayText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  dayPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  daySecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dayBandLabel: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0},
  terminalCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    marginTop: 16,
  },
  // REACTIONS — 72px swipeable media rows.
  rxOuter: {position: 'relative'},
  rxClip: {position: 'relative', overflow: 'hidden'},
  deleteAction: {
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
    background: ERROR_STRONG,
    color: ERROR_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  rxContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  rxRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  rxDisc: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  rxText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  rxPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rxSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
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
  menuRowDestructive: {color: ERROR_STRONG},
  // EMPTY STATE —
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
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 16px'},
  // PROFILE — sensitivity mixer.
  mixerCols: {display: 'flex', gap: 8, marginTop: 16},
  mixCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  rankChip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  sliderHit: {
    position: 'relative',
    width: 44,
    height: 160,
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 12,
    touchAction: 'none',
    cursor: 'grab',
  },
  sliderTrack: {position: 'relative', width: 8, height: 160, borderRadius: 999},
  sliderFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 999,
  },
  sliderThumb: {
    position: 'absolute',
    left: '50%',
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--color-background-card)',
    boxShadow: '0 1px 4px var(--color-shadow)',
    transform: 'translate(-50%, 50%)',
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  weightNum: {fontSize: 16, fontVariantNumeric: 'tabular-nums'},
  mixLabel: {fontSize: 13, fontWeight: 500},
  // Rank list + settings rows.
  rankRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  rankPos: {
    width: 28,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  rankName: {flex: 1, minWidth: 0, fontSize: 16},
  rankMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  setRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  setLabel: {flex: 1, minWidth: 0, fontSize: 16, textAlign: 'left'},
  setValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chevron: {display: 'inline-flex', color: 'var(--color-text-secondary)', flexShrink: 0},
  switchTrack: {
    position: 'relative',
    width: 51,
    height: 31,
    borderRadius: 999,
    flexShrink: 0,
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
  // TAB BAR — exactly 64px sticky bottom z20.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    flexShrink: 0,
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
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_ACCENT, fontWeight: 600},
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — STICKY-IN-FLOW above the tabBar (the shell grows with
  // content, so absolute bottom:N would pin to the DOCUMENT bottom and sit
  // off-viewport on tall tabs — foundations amendment). While the sheet
  // scroll-lock is active it flips to absolute (shell is 100dvh then).
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    paddingInline: 16,
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    paddingInline: 0,
  },
  toast: {
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastMsg: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    height: 48,
    minWidth: 44,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // FAB — sticky height-0 anchor (same amendment physics as the toast
  // dock); child hangs above the anchor line, 80px above the viewport
  // bottom = 64px tabBar + 16.
  fabAnchor: {
    position: 'sticky',
    bottom: 80,
    zIndex: 25,
    height: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  fab: {
    position: 'absolute',
    bottom: 0,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 16,
    background: BRAND_ACCENT,
    color: FAB_GLYPH,
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
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
  sheetBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '4px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  saveBtn: {
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
  // Severity segmented control — 36px track (foundations-sanctioned).
  segTrack: {
    height: 36,
    display: 'flex',
    gap: 2,
    padding: 2,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
  },
  segBtn: {
    flex: 1,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  chipRow: {display: 'flex', flexWrap: 'wrap', gap: 8},
  // 44px-tall hit wrapping the 36px visual chip (hit never shrinks).
  chipBtn: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  chipPill: {
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 14,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  chipPillOn: {
    background: mix(BRAND_ACCENT, 16),
    border: \`1px solid \${BRAND_ACCENT}\`,
    color: BRAND_ACCENT,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    display: 'block',
    marginBottom: 8,
  },
  fieldInput: {
    width: '100%',
    height: 48,
    background: 'var(--color-background-muted)',
    border: 'none',
    borderRadius: 12,
    paddingInline: 16,
    fontSize: 16,
    color: 'var(--color-text-primary)',
    fontFamily: 'inherit',
  },
  exposureLine: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  bottomSpacer: {height: 24, flexShrink: 0},
  // Taller spacer on FAB-bearing tabs so the last card can scroll clear of
  // the 56px FAB (deviation from the 24px spacer, noted in the summary).
  fabSpacer: {height: 96, flexShrink: 0},
};

// ---------------------------------------------------------------------------
// FIXTURES — one module-scope seed, identity consts, dual fields, zero
// randomness. CROSS-CHECK LEDGER (verified by hand):
//   weights 40+90+65+25 = 220.
//   Sat 34·40+88·90+41·65+22·25 = 1360+7920+2665+550 = 12495 → /220 = 57 High
//   Sun 1200+8640+2990+625      = 13455 → 61 High
//   Mon 1040+4680+3380+1000     = 10100 → 46 Moderate
//   Tue  880+3420+2860+1200     =  8360 → 38 Moderate
//   Wed  800+5760+4810+900      = 12270 → 56 High
//   Thu  720+9360+5980+750      = 16810 → 76 Very High
//   Fri  640+6300+5070+650      = 12660 → 58 High
//   Grass share today: 7920/12495 = 63.4% → 63.
//   Strip bars round(count/2): Thu 9+52+46+15 = 122 ≤ 128 chart ✓.
//   Dial radii 28+round(count×0.75): Sat 54/94/59/45, Thu 42/106/97/51;
//   max 106 < 118 headroom ✓.
//   Correlation: rx 63,49,55 vs threshold 55 → 2 of 3 = 67% Moderate;
//   after logging Jul 4 (exposure 57 ≥ 55) → 3 of 4 = 75% Strong.
// ---------------------------------------------------------------------------

type AllergenId = 'tree' | 'grass' | 'weed' | 'mold';
type Weights = Record<AllergenId, number>;

interface Allergen {
  id: AllergenId;
  name: string;
  color: string;
}

const ALLERGENS: Allergen[] = [
  {id: 'tree', name: 'Tree', color: TREE},
  {id: 'grass', name: 'Grass', color: GRASS},
  {id: 'weed', name: 'Weed', color: WEED},
  {id: 'mold', name: 'Mold', color: MOLD},
];

const ALLERGEN_BY_ID: Record<AllergenId, Allergen> = {
  tree: ALLERGENS[0],
  grass: ALLERGENS[1],
  weed: ALLERGENS[2],
  mold: ALLERGENS[3],
};

interface PollenDay {
  id: string;
  dow: string; // weekday initial for the strip label row
  short: string; // 'Sat, Jul 4'
  long: string; // 'Saturday, Jul 4'
  name: string; // 'Saturday'
  counts: Weights; // gr/m³
}

const POLLEN_7DAY: PollenDay[] = [
  {id: 'd-0704', dow: 'S', short: 'Sat, Jul 4', long: 'Saturday, Jul 4', name: 'Saturday', counts: {tree: 34, grass: 88, weed: 41, mold: 22}},
  {id: 'd-0705', dow: 'S', short: 'Sun, Jul 5', long: 'Sunday, Jul 5', name: 'Sunday', counts: {tree: 30, grass: 96, weed: 46, mold: 25}},
  {id: 'd-0706', dow: 'M', short: 'Mon, Jul 6', long: 'Monday, Jul 6', name: 'Monday', counts: {tree: 26, grass: 52, weed: 52, mold: 40}},
  {id: 'd-0707', dow: 'T', short: 'Tue, Jul 7', long: 'Tuesday, Jul 7', name: 'Tuesday', counts: {tree: 22, grass: 38, weed: 44, mold: 48}},
  {id: 'd-0708', dow: 'W', short: 'Wed, Jul 8', long: 'Wednesday, Jul 8', name: 'Wednesday', counts: {tree: 20, grass: 64, weed: 74, mold: 36}},
  {id: 'd-0709', dow: 'T', short: 'Thu, Jul 9', long: 'Thursday, Jul 9', name: 'Thursday', counts: {tree: 18, grass: 104, weed: 92, mold: 30}},
  {id: 'd-0710', dow: 'F', short: 'Fri, Jul 10', long: 'Friday, Jul 10', name: 'Friday', counts: {tree: 16, grass: 70, weed: 78, mold: 26}},
];

const DEFAULT_WEIGHTS: Weights = {tree: 40, grass: 90, weed: 65, mold: 25};

// Past-7-day exposure (Jun 28 – Jul 4) for the correlation band; Jul 4's
// 57 equals today's composite under default weights by construction.
const PAST_EXPOSURE = [44, 52, 63, 58, 49, 55, 57];
const EXPOSURE_DATES = ['Jun 28', 'Jun 29', 'Jun 30', 'Jul 1', 'Jul 2', 'Jul 3', 'Jul 4'];
const EXPOSURE_THRESHOLD = 55;

type Severity = 1 | 2 | 3;

const SEVERITY_META: Record<Severity, {label: string; color: string}> = {
  // Severity tints per spec: Mild=GRASS, Moderate=BRAND, Severe=error pair.
  1: {label: 'Mild', color: GRASS},
  2: {label: 'Moderate', color: BRAND_ACCENT},
  3: {label: 'Severe', color: ERROR_STRONG},
};

interface Reaction {
  id: string;
  date: string; // literal, e.g. 'Jun 30'
  dayIndex: number; // index into PAST_EXPOSURE / EXPOSURE_DATES
  exposure: number;
  severity: Severity;
  symptoms: string[];
}

const REACTIONS_SEED: Reaction[] = [
  {id: 'rx-01', date: 'Jun 30', dayIndex: 2, exposure: 63, severity: 3, symptoms: ['Sneezing', 'Itchy eyes']},
  {id: 'rx-02', date: 'Jul 2', dayIndex: 4, exposure: 49, severity: 1, symptoms: ['Congestion']},
  {id: 'rx-03', date: 'Jul 3', dayIndex: 5, exposure: 55, severity: 2, symptoms: ['Sneezing']},
];

const SYMPTOM_OPTIONS = ['Sneezing', 'Itchy eyes', 'Congestion', 'Cough'];

const LOCATION_NAME = 'Maple Grove, MN';

// ---------------------------------------------------------------------------
// DERIVATIONS — pure functions of (day, weights); everything on screen
// flows through these. Division by Σweights is explicitly guarded (all-zero
// weights → null composite → '—' + 'Set weights' band).
// ---------------------------------------------------------------------------

function weightSum(weights: Weights): number {
  return weights.tree + weights.grass + weights.weed + weights.mold;
}

function compositeNumerator(day: PollenDay, weights: Weights): number {
  return (
    day.counts.tree * weights.tree +
    day.counts.grass * weights.grass +
    day.counts.weed * weights.weed +
    day.counts.mold * weights.mold
  );
}

/** Weighted composite index, or null when all four weights are zero. */
function compositeFor(day: PollenDay, weights: Weights): number | null {
  const sum = weightSum(weights);
  if (sum === 0) return null;
  return Math.round(compositeNumerator(day, weights) / sum);
}

interface Band {
  id: 'low' | 'moderate' | 'high' | 'veryhigh' | 'unset';
  label: string;
  color: string;
}

/** Bands: 0–24 Low · 25–49 Moderate · 50–74 High · 75–100 Very High. */
function bandFor(composite: number | null): Band {
  if (composite == null) return {id: 'unset', label: 'Set weights', color: 'var(--color-text-secondary)'};
  if (composite <= 24) return {id: 'low', label: 'Low', color: SUCCESS_TEXT};
  if (composite <= 49) return {id: 'moderate', label: 'Moderate', color: GRASS};
  if (composite <= 74) return {id: 'high', label: 'High', color: BRAND_ACCENT};
  return {id: 'veryhigh', label: 'Very High', color: ERROR_STRONG};
}

interface Contribution {
  allergen: Allergen;
  count: number;
  points: number; // count × weight
  sharePct: number; // integer share of the numerator
}

/** Contributions ranked desc — drives legend order + trigger ranks. */
function contributionsFor(day: PollenDay, weights: Weights): Contribution[] {
  const numerator = compositeNumerator(day, weights);
  return ALLERGENS.map(allergen => {
    const points = day.counts[allergen.id] * weights[allergen.id];
    return {
      allergen,
      count: day.counts[allergen.id],
      points,
      sharePct: numerator === 0 ? 0 : Math.round((points / numerator) * 100),
    };
  }).sort((a, b) => b.points - a.points);
}

/**
 * ReadinessCard rule (pure): first day index ≥ selectedDay whose composite
 * is ≥ 70; pre-dose time is always peakDay−1 at 9:00 PM.
 */
function findPeakDay(selectedDay: number, weights: Weights): number | null {
  for (let i = selectedDay; i < POLLEN_7DAY.length; i++) {
    const composite = compositeFor(POLLEN_7DAY[i], weights);
    if (composite != null && composite >= 70) return i;
  }
  return null;
}

/** Correlation: reactions on days with exposure ≥ 55 / total reactions. */
function correlationFor(reactions: Reaction[]): {onHigh: number; total: number; scorePct: number; strength: string} {
  const total = reactions.length;
  const onHigh = reactions.filter(reaction => reaction.exposure >= EXPOSURE_THRESHOLD).length;
  const scorePct = total === 0 ? 0 : Math.round((onHigh / total) * 100);
  const strength = scorePct >= 75 ? 'Strong' : scorePct >= 50 ? 'Moderate' : 'Weak';
  return {onHigh, total, scorePct, strength};
}

/** 'Sat, Jul 4' → 'Sat'. */
function dowShort(dayIndex: number): string {
  return POLLEN_7DAY[dayIndex].short.split(',')[0];
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — seasonStore: a single useState + one update(patch)
// helper; every surface (dial, strip, band, readiness, mixer, sheet, rows,
// tabs, toast) reads from and writes through it. Children keep only
// transient pointer-drag deltas.
// ---------------------------------------------------------------------------

type TabId = 'today' | 'forecast' | 'reactions' | 'profile';

type UndoPayload =
  | {kind: 'restoreReaction'; reaction: Reaction; index: number}
  | {kind: 'removeReaction'; id: string};

interface Draft {
  severity: Severity;
  symptoms: string[];
  note: string;
}

interface SeasonState {
  tab: TabId;
  selectedDay: number;
  weights: Weights;
  reactions: Reaction[];
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  draft: Draft;
  toast: {seq: number; message: string; undo: UndoPayload | null} | null;
  refreshed: boolean;
  scrollTopByTab: Record<TabId, number>;
  openSwipeRow: string | null;
  reactionMenuId: string | null;
  expandedSector: AllergenId | null;
  openMarkerId: string | null;
  preDoseReminders: boolean;
}

const INITIAL_STATE: SeasonState = {
  tab: 'today',
  selectedDay: 0,
  weights: {...DEFAULT_WEIGHTS},
  reactions: [...REACTIONS_SEED],
  sheetOpen: false,
  sheetDetent: 'medium',
  draft: {severity: 2, symptoms: [], note: ''},
  toast: null,
  refreshed: false,
  scrollTopByTab: {today: 0, forecast: 0, reactions: 0, profile: 0},
  openSwipeRow: null,
  reactionMenuId: null,
  expandedSector: null,
  openMarkerId: null,
  preDoseReminders: true,
};

function useSeasonStore() {
  const [state, setState] = useState<SeasonState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<SeasonState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);
  return {state, update, setState};
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

/**
 * rAF interpolation for the dial morph (200ms ease-out) — path radii can't
 * CSS-transition, so this is the transform-free 'path interpolation' the
 * spec calls for. Instant under reduced motion.
 */
function useAnimatedValues(targets: number[], instant: boolean): number[] {
  const key = targets.join('|');
  const [values, setValues] = useState<number[]>(targets);
  const valuesRef = useRef<number[]>(targets);
  const targetsRef = useRef<number[]>(targets);
  targetsRef.current = targets;
  useEffect(() => {
    const target = targetsRef.current;
    const from = [...valuesRef.current];
    const settled = from.length === target.length && from.every((v, i) => v === target[i]);
    if (instant || settled) {
      valuesRef.current = target;
      setValues(target);
      return undefined;
    }
    const t0 = performance.now();
    let raf = requestAnimationFrame(function tick(t: number) {
      const p = Math.min(1, (t - t0) / 200);
      const eased = 1 - (1 - p) * (1 - p);
      const next = target.map((v, i) => (from[i] ?? v) + (v - (from[i] ?? v)) * eased);
      valuesRef.current = next;
      setValues(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, instant]);
  return values;
}

/** Sheet focus trap — Tab cycles within; Escape handled at page level. */
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
// BRAND MARK — 24px pollen grain (8px-radius circle + 8 spikes + three
// trailing drift arcs), stroke --color-text-primary (never var(--color-text)).
// ---------------------------------------------------------------------------

function AiraMark() {
  // 8 spikes every 45° from the grain center (14.5, 12), r 6.5 → 9.5.
  const spikes: ReactNode[] = [];
  for (let i = 0; i < 8; i++) {
    const rad = (i * 45 * Math.PI) / 180;
    const x1 = 14.5 + 6.5 * Math.cos(rad);
    const y1 = 12 + 6.5 * Math.sin(rad);
    const x2 = 14.5 + 9.5 * Math.cos(rad);
    const y2 = 12 + 9.5 * Math.sin(rad);
    spikes.push(
      <line
        key={i}
        x1={x1.toFixed(2)}
        y1={y1.toFixed(2)}
        x2={x2.toFixed(2)}
        y2={y2.toFixed(2)}
        strokeWidth={1.5}
        strokeLinecap="round"
      />,
    );
  }
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" aria-hidden>
      <circle cx={14.5} cy={12} r={4} strokeWidth={1.5} fill="none" />
      {spikes}
      {/* three trailing drift arcs */}
      <path d="M1.5 7.5c1.6 0 1.6-1.4 3.2-1.4" strokeWidth={1.2} strokeLinecap="round" />
      <path d="M0.8 12.5c2 0 2-1.6 4-1.6" strokeWidth={1.2} strokeLinecap="round" />
      <path d="M1.5 17.5c1.6 0 1.6-1.4 3.2-1.4" strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DIAL GEOMETRY — viewBox '0 0 240 240', cx=cy=120; 0° at 12 o'clock,
// clockwise positive. Four sectors at 82° sweep + 8° gaps (4×82 + 4×8 =
// 360); order Tree (start −90°+4° = −86°, the top-left quadrant), Grass,
// Weed, Mold clockwise. Sector radius r = 28 + round(count × 0.75): max
// count 104 → r = 106, inside the 118 headroom; weight arcs ride r = 112.
// ---------------------------------------------------------------------------

const DIAL_C = 120;
const SECTOR_SWEEP = 82;
const SECTOR_INNER_R = 28;
const WEIGHT_ARC_R = 112;

function sectorStartDeg(index: number): number {
  return -90 + 4 + index * 90;
}

function sectorRadius(count: number): number {
  return SECTOR_INNER_R + Math.round(count * 0.75);
}

function dialPoint(deg: number, r: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: DIAL_C + r * Math.sin(rad), y: DIAL_C - r * Math.cos(rad)};
}

/** Annular wedge from inner radius r0 to outer r1 across [fromDeg, toDeg]. */
function wedgePath(fromDeg: number, toDeg: number, r0: number, r1: number): string {
  const oStart = dialPoint(fromDeg, r1);
  const oEnd = dialPoint(toDeg, r1);
  const iEnd = dialPoint(toDeg, r0);
  const iStart = dialPoint(fromDeg, r0);
  return [
    \`M \${oStart.x.toFixed(2)} \${oStart.y.toFixed(2)}\`,
    \`A \${r1.toFixed(2)} \${r1.toFixed(2)} 0 0 1 \${oEnd.x.toFixed(2)} \${oEnd.y.toFixed(2)}\`,
    \`L \${iEnd.x.toFixed(2)} \${iEnd.y.toFixed(2)}\`,
    \`A \${r0} \${r0} 0 0 0 \${iStart.x.toFixed(2)} \${iStart.y.toFixed(2)}\`,
    'Z',
  ].join(' ');
}

/** Open arc stroke at radius r across [fromDeg, toDeg]. */
function arcStroke(fromDeg: number, toDeg: number, r: number): string {
  const start = dialPoint(fromDeg, r);
  const end = dialPoint(toDeg, r);
  return \`M \${start.x.toFixed(2)} \${start.y.toFixed(2)} A \${r} \${r} 0 0 1 \${end.x.toFixed(2)} \${end.y.toFixed(2)}\`;
}

// Quadrant hit-button placement (96×96 ≥ 44×44 angular hit per sector).
const SECTOR_HIT_POS: Record<AllergenId, CSSProperties> = {
  tree: {left: 12, top: 12},
  grass: {right: 12, top: 12},
  weed: {right: 12, bottom: 12},
  mold: {left: 12, bottom: 12},
};

// ---------------------------------------------------------------------------
// POLLEN SECTOR DIAL — sectors fill 28%-mix over the card with a 2px
// full-strength stroke (the stroke is the ≥3:1 boundary vs the card; the
// wash alone is decorative). Radii + center numeral animate via the rAF
// hook on selectedDay/weights change; legend order = contribution rank
// desc and re-sorts when weights change.
// ---------------------------------------------------------------------------

interface PollenSectorDialProps {
  day: PollenDay;
  weights: Weights;
  reducedMotion: boolean;
  expandedSector: AllergenId | null;
  onToggleSector: (id: AllergenId) => void;
}

function PollenSectorDial({day, weights, reducedMotion, expandedSector, onToggleSector}: PollenSectorDialProps) {
  const composite = compositeFor(day, weights);
  const band = bandFor(composite);
  const contributions = contributionsFor(day, weights);
  // Animate the four radii and the composite numeral in one pass:
  // [rTree, rGrass, rWeed, rMold, composite].
  const targets = useMemo(
    () => [
      sectorRadius(day.counts.tree),
      sectorRadius(day.counts.grass),
      sectorRadius(day.counts.weed),
      sectorRadius(day.counts.mold),
      composite ?? 0,
    ],
    [day, composite],
  );
  const animated = useAnimatedValues(targets, reducedMotion);
  const numeral = composite == null ? '—' : String(Math.round(animated[4]));
  const expanded = expandedSector == null ? null : contributions.find(c => c.allergen.id === expandedSector);

  return (
    <div style={styles.cardPadded}>
      <div style={styles.dialSvgWrap}>
        <svg width="100%" viewBox="0 0 240 240" fill="none" aria-hidden style={{display: 'block'}}>
          {ALLERGENS.map((allergen, index) => {
            const from = sectorStartDeg(index);
            const to = from + SECTOR_SWEEP;
            const radius = Math.max(SECTOR_INNER_R + 0.5, animated[index]);
            const weightSweep = (weights[allergen.id] / 100) * SECTOR_SWEEP;
            return (
              <g key={allergen.id}>
                <path
                  d={wedgePath(from, to, SECTOR_INNER_R, radius)}
                  fill={mix(allergen.color, 28)}
                  stroke={allergen.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                {weightSweep > 0 ? (
                  <path
                    d={arcStroke(from, from + weightSweep, WEIGHT_ARC_R)}
                    stroke={allergen.color}
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                ) : null}
              </g>
            );
          })}
        </svg>
        {/* Real-button angular hits (96×96 quadrants) toggling the detail
            strip — the non-gesture path to per-sector data. */}
        {ALLERGENS.map(allergen => {
          const contribution = contributions.find(c => c.allergen.id === allergen.id);
          const isOpen = expandedSector === allergen.id;
          return (
            <button
              key={allergen.id}
              type="button"
              className="ara-btn ara-focusable"
              style={{...styles.sectorHit, ...SECTOR_HIT_POS[allergen.id]}}
              aria-expanded={isOpen}
              aria-label={\`\${allergen.name}: \${day.counts[allergen.id]} grains per cubic meter, weight \${weights[allergen.id]}, contributes \${contribution?.sharePct ?? 0} percent — toggle details\`}
              onClick={() => onToggleSector(allergen.id)}
            />
          );
        })}
        <div style={styles.dialCenter}>
          <div style={styles.dialCenterStack}>
            <span style={styles.dialNumeral}>{numeral}</span>
            <span style={{...styles.dialBandLabel, color: band.color}}>{band.label}</span>
          </div>
        </div>
      </div>
      {expanded != null ? (
        <div style={styles.detailStrip}>
          <span style={{...styles.legendSwatch, background: expanded.allergen.color}} aria-hidden />
          <span>
            {expanded.allergen.name} — {expanded.count} gr/m³ · weight {weights[expanded.allergen.id]} · contributes{' '}
            {expanded.sharePct}%
          </span>
        </div>
      ) : null}
      <div style={{marginTop: 12}}>
        {contributions.map(contribution => (
          <div key={contribution.allergen.id} style={styles.legendRow}>
            <span style={{...styles.legendSwatch, background: contribution.allergen.color}} aria-hidden />
            <span style={styles.legendName}>{contribution.allergen.name}</span>
            <span style={styles.legendCount}>{contribution.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FORECAST SCRUB STRIP — 7 flex:1 column buttons (~36px wide at 320 but
// 128px tall: merged tall target; the 44×44 prev/next chevrons below are
// the guaranteed path), a draggable playhead (44px-wide pointer hit,
// role='slider' with ArrowLeft/Right + Home/End), stacked bars bottom-up
// Tree→Mold at round(count/2)px (Thu 9+52+46+15 = 122 ≤ 128 — no clip).
// ---------------------------------------------------------------------------

interface ForecastScrubStripProps {
  selectedDay: number;
  weights: Weights;
  reducedMotion: boolean;
  onSelectDay: (index: number) => void;
}

function ForecastScrubStrip({selectedDay, weights, reducedMotion, onSelectDay}: ForecastScrubStripProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  // Transient drag position only — selectedDay itself lives in the store.
  const [dragPct, setDragPct] = useState<number | null>(null);
  const draggingRef = useRef(false);

  const dayFromClientX = (clientX: number): {index: number; pct: number} => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return {index: selectedDay, pct: ((selectedDay + 0.5) / 7) * 100};
    const x = Math.min(rect.width, Math.max(0, clientX - rect.left));
    const index = Math.min(6, Math.max(0, Math.floor((x / rect.width) * 7)));
    return {index, pct: (x / rect.width) * 100};
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const {index, pct} = dayFromClientX(event.clientX);
    setDragPct(pct);
    if (index !== selectedDay) onSelectDay(index);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const {index, pct} = dayFromClientX(event.clientX);
    setDragPct(pct);
    if (index !== selectedDay) onSelectDay(index);
  };
  const onPointerUp = () => {
    // Release snaps the playhead to the nearest column center.
    draggingRef.current = false;
    setDragPct(null);
  };

  const onSliderKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(0, selectedDay - 1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(6, selectedDay + 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 6;
    if (next == null) return;
    event.preventDefault();
    if (next !== selectedDay) onSelectDay(next);
  };

  const selected = POLLEN_7DAY[selectedDay];
  const selectedComposite = compositeFor(selected, weights);
  const selectedBand = bandFor(selectedComposite);
  const playheadPct = dragPct ?? ((selectedDay + 0.5) / 7) * 100;
  const readout = \`\${selected.short} · \${selectedComposite ?? '—'} \${selectedBand.label}\`;

  return (
    <div style={styles.stripCard}>
      <div style={styles.stripHeader}>
        <h2 style={styles.cardTitle}>7-day forecast</h2>
        <span style={styles.stripReadout}>{readout}</span>
      </div>
      <div ref={chartRef} style={styles.chartZone}>
        {POLLEN_7DAY.map((day, index) => {
          const isSelected = index === selectedDay;
          return (
            <button
              key={day.id}
              type="button"
              className="ara-btn ara-focusable"
              style={{...styles.colBtn, opacity: isSelected ? 1 : 0.55}}
              aria-label={\`\${day.long}, index \${compositeFor(day, weights) ?? 'unset'}\${isSelected ? ', selected' : ''}\`}
              aria-pressed={isSelected}
              onClick={() => onSelectDay(index)}>
              {/* bottom-up: Tree, Grass, Weed, Mold (column-reverse). */}
              {ALLERGENS.map(allergen => (
                <span
                  key={allergen.id}
                  style={{
                    height: Math.round(day.counts[allergen.id] / 2),
                    background: allergen.color,
                    flexShrink: 0,
                  }}
                  aria-hidden
                />
              ))}
              {isSelected ? <span style={{height: 2, background: BRAND_ACCENT, flexShrink: 0}} aria-hidden /> : null}
            </button>
          );
        })}
        <div style={{...styles.playheadLine, left: \`\${playheadPct}%\`}} aria-hidden />
        <div
          role="slider"
          tabIndex={0}
          className="ara-focusable"
          aria-label="Forecast day"
          aria-valuemin={0}
          aria-valuemax={6}
          aria-valuenow={selectedDay}
          aria-valuetext={\`\${selected.long}, index \${selectedComposite ?? 'unset'}\`}
          style={{
            ...styles.playheadHit,
            left: \`\${playheadPct}%\`,
            transition: dragPct != null || reducedMotion ? 'none' : 'left 200ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onSliderKeyDown}>
          <span style={styles.playheadHandle} aria-hidden />
        </div>
      </div>
      <div style={styles.dowRow} aria-hidden>
        {POLLEN_7DAY.map((day, index) => (
          <span
            key={day.id}
            style={{
              ...styles.dowCell,
              ...(index === selectedDay ? {color: BRAND_ACCENT, fontWeight: 600} : null),
            }}>
            {day.dow}
          </span>
        ))}
      </div>
      <div style={styles.controlsRow}>
        <button
          type="button"
          className="ara-btn ara-focusable"
          style={{...styles.iconBtn, ...(selectedDay === 0 ? {opacity: 0.35} : null)}}
          aria-label="Previous day"
          disabled={selectedDay === 0}
          onClick={() => onSelectDay(selectedDay - 1)}>
          <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
        </button>
        <span style={styles.controlsReadout}>{readout}</span>
        <button
          type="button"
          className="ara-btn ara-focusable"
          style={{...styles.iconBtn, ...(selectedDay === 6 ? {opacity: 0.35} : null)}}
          aria-label="Next day"
          disabled={selectedDay === 6}
          onClick={() => onSelectDay(selectedDay + 1)}>
          <Icon icon={ChevronRightIcon} size="md" color="inherit" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CORRELATION BAND — past-7-day exposure area (y = 96 − round(v × 0.96):
// 63 → y 36, threshold 55 → y 43) with reaction markers (10px dots inside
// 44px hit buttons opening an anchored detail card) and a live pattern
// caption: ≥75% Strong · 50–74 Moderate · <50 Weak.
// ---------------------------------------------------------------------------

const BAND_VIEW_W = 336; // 6 spans × 56
const BAND_VIEW_H = 96;

function exposureY(value: number): number {
  return BAND_VIEW_H - Math.round(value * 0.96);
}

interface CorrelationBandProps {
  reactions: Reaction[];
  openMarkerId: string | null;
  onToggleMarker: (id: string) => void;
}

function CorrelationBand({reactions, openMarkerId, onToggleMarker}: CorrelationBandProps) {
  const points = PAST_EXPOSURE.map((value, index) => \`\${index * 56},\${exposureY(value)}\`);
  const strokeD = \`M \${points.join(' L ')}\`;
  const areaD = \`\${strokeD} L \${BAND_VIEW_W},\${BAND_VIEW_H} L 0,\${BAND_VIEW_H} Z\`;
  const correlation = correlationFor(reactions);
  const open = openMarkerId == null ? null : reactions.find(reaction => reaction.id === openMarkerId);

  return (
    <div style={styles.cardPadded}>
      <h2 style={styles.cardTitle}>Exposure vs reactions</h2>
      <div style={styles.bandZone}>
        <svg style={styles.bandSvg} viewBox={\`0 0 \${BAND_VIEW_W} \${BAND_VIEW_H}\`} preserveAspectRatio="none" aria-hidden>
          <path d={areaD} fill={mix(BRAND_ACCENT, 16)} />
          <path d={strokeD} stroke={BRAND_ACCENT} strokeWidth={2} fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        <div style={styles.thresholdLine} aria-hidden />
        <span style={styles.thresholdLabel} aria-hidden>
          High 55
        </span>
        {reactions.map(reaction => {
          const severity = SEVERITY_META[reaction.severity];
          const leftPct = (reaction.dayIndex / 6) * 100;
          const top = exposureY(reaction.exposure);
          return (
            <button
              key={reaction.id}
              type="button"
              className="ara-btn ara-focusable"
              style={{
                ...styles.markerHit,
                left: \`calc(\${leftPct}% - 22px)\`,
                top: top - 22,
              }}
              aria-expanded={openMarkerId === reaction.id}
              aria-label={\`Reaction \${reaction.date}: \${severity.label}, exposure \${reaction.exposure} — toggle details\`}
              onClick={() => onToggleMarker(reaction.id)}>
              <span style={{...styles.markerDot, background: severity.color}} aria-hidden />
            </button>
          );
        })}
        {open != null ? (
          <div
            style={{
              ...styles.markerCard,
              top: exposureY(open.exposure) + 14,
              left: \`clamp(0px, calc(\${(open.dayIndex / 6) * 100}% - 90px), calc(100% - 180px))\`,
            }}>
            <span style={styles.markerCardTitle}>
              {open.date} · {SEVERITY_META[open.severity].label}
            </span>
            <span style={styles.markerCardMeta}>
              {open.symptoms.join(', ')} · exposure {open.exposure}
            </span>
          </div>
        ) : null}
      </div>
      <div style={styles.corrLegend} aria-hidden>
        <span style={styles.corrLegendItem}>
          <span style={{width: 12, height: 12, borderRadius: 4, background: mix(BRAND_ACCENT, 16), border: \`1px solid \${BRAND_ACCENT}\`}} />
          Exposure
        </span>
        <span style={styles.corrLegendItem}>
          <span style={{width: 16, borderTop: '1px dashed var(--color-text-secondary)'}} />
          High ≥55
        </span>
        <span style={styles.corrLegendItem}>
          <span style={{width: 10, height: 10, borderRadius: '50%', background: ERROR_STRONG}} />
          Reaction
        </span>
      </div>
      <div style={styles.corrCaption}>
        {correlation.total === 0
          ? 'No reactions yet — log one to test the pattern'
          : \`\${correlation.strength} match — \${correlation.onHigh} of \${correlation.total} reactions on high days\`}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// READINESS CARD — pure function of (selectedDay, weights): first day at
// or after selectedDay with composite ≥ 70 proposes a pre-dose the evening
// before (always peakDay−1 · 9:00 PM); no such day → explicit negative
// state, no button (stress fixture 6: selectedDay = Fri).
// ---------------------------------------------------------------------------

interface ReadinessCardProps {
  selectedDay: number;
  weights: Weights;
  onRemind: (message: string) => void;
}

function ReadinessCard({selectedDay, weights, onRemind}: ReadinessCardProps) {
  const peakDay = findPeakDay(selectedDay, weights);
  if (peakDay == null) {
    return (
      <div style={styles.cardPadded}>
        <div style={styles.readinessRow}>
          <span style={styles.readinessDisc} aria-hidden>
            <Icon icon={PillIcon} size="md" color="inherit" />
          </span>
          <div style={styles.readinessText}>
            <h2 style={styles.readinessTitle}>No pre-dose needed</h2>
            <span style={styles.readinessSub}>No day at or above index 70 in range</span>
          </div>
        </div>
      </div>
    );
  }
  const peak = POLLEN_7DAY[peakDay];
  const peakComposite = compositeFor(peak, weights);
  // Pre-dose is peakDay−1 at 9:00 PM; when the spike IS the selected first
  // day (peakDay 0), the fixture window has no prior day → 'tonight'.
  const preDoseLabel = peakDay > 0 ? \`\${dowShort(peakDay - 1)} 9:00 PM\` : 'tonight 9:00 PM';
  return (
    <div style={styles.cardPadded}>
      <div style={styles.readinessRow}>
        <span style={styles.readinessDisc} aria-hidden>
          <Icon icon={PillIcon} size="md" color="inherit" />
        </span>
        <div style={styles.readinessText}>
          <h2 style={styles.readinessTitle}>Pre-dose before {peak.name}&apos;s spike</h2>
          <span style={styles.readinessSub}>
            Take antihistamine {preDoseLabel} · index hits {peakComposite}
          </span>
        </div>
        <button
          type="button"
          className="ara-btn ara-focusable"
          style={styles.secondaryBtn}
          onClick={() => onRemind(\`Reminder set for \${preDoseLabel}\`)}>
          Remind me
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SENSITIVITY MIXER — 4-channel EQ. Track wash = allergen 40%-mix
// (decorative; tint intensity scales with today's count); the AFFORDANCE
// contrast comes from the full-strength value fill + 2px allergen thumb
// border, both ≥3:1 vs the card (see COLOR LITERALS math) — hairline/muted
// stays passive-only per the amendment. Sliders: 44px-wide full-track
// pointer hits + 44×44 ± steppers (step 5) + ArrowUp/Down keyboard.
// ---------------------------------------------------------------------------

interface SensitivityMixerProps {
  weights: Weights;
  todayRanks: Record<AllergenId, number>; // 1-based contribution rank today
  onSetWeight: (id: AllergenId, value: number) => void;
  sliderRefs: RefObject<Record<AllergenId, HTMLDivElement | null>>;
}

function SensitivityMixer({weights, todayRanks, onSetWeight, sliderRefs}: SensitivityMixerProps) {
  const dragIdRef = useRef<AllergenId | null>(null);

  const valueFromClientY = (id: AllergenId, clientY: number): number => {
    const hit = sliderRefs.current?.[id];
    const rect = hit?.getBoundingClientRect();
    if (rect == null || rect.height === 0) return weights[id];
    const raw = ((rect.bottom - clientY) / rect.height) * 100;
    return Math.min(100, Math.max(0, Math.round(raw / 5) * 5));
  };

  return (
    <div style={styles.cardPadded}>
      <h2 style={styles.cardTitle}>Sensitivity mix</h2>
      <p style={{...styles.cardSub, marginTop: 4}}>Weights drive your composite index</p>
      <div style={styles.mixerCols}>
        {ALLERGENS.map(allergen => {
          const weight = weights[allergen.id];
          const rank = todayRanks[allergen.id];
          const isTop = rank === 1;
          // Tint intensity maps to today's count: 12% floor + count×0.28
          // (max 104 → ~41%).
          const tintPct = 12 + Math.round(POLLEN_7DAY[0].counts[allergen.id] * 0.28);
          return (
            <div key={allergen.id} style={styles.mixCol}>
              <span
                style={{
                  ...styles.rankChip,
                  background: isTop ? mix(BRAND_ACCENT, 16) : 'var(--color-background-muted)',
                  color: isTop ? BRAND_ACCENT : 'var(--color-text-secondary)',
                }}>
                {isTop ? '#1 trigger' : \`#\${rank}\`}
              </span>
              <div
                ref={element => {
                  if (sliderRefs.current != null) sliderRefs.current[allergen.id] = element;
                }}
                role="slider"
                tabIndex={0}
                className="ara-focusable"
                aria-label={\`\${allergen.name} weight\`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={weight}
                aria-valuetext={\`\${allergen.name} weight \${weight}\`}
                aria-orientation="vertical"
                style={styles.sliderHit}
                onPointerDown={event => {
                  dragIdRef.current = allergen.id;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  onSetWeight(allergen.id, valueFromClientY(allergen.id, event.clientY));
                }}
                onPointerMove={event => {
                  if (dragIdRef.current !== allergen.id) return;
                  onSetWeight(allergen.id, valueFromClientY(allergen.id, event.clientY));
                }}
                onPointerUp={() => {
                  dragIdRef.current = null;
                }}
                onKeyDown={event => {
                  let next: number | null = null;
                  if (event.key === 'ArrowUp') next = Math.min(100, weight + 5);
                  else if (event.key === 'ArrowDown') next = Math.max(0, weight - 5);
                  else if (event.key === 'Home') next = 0;
                  else if (event.key === 'End') next = 100;
                  if (next == null) return;
                  event.preventDefault();
                  onSetWeight(allergen.id, next);
                }}>
                <span style={{...styles.sliderTrack, background: mix(allergen.color, tintPct)}}>
                  <span
                    style={{
                      ...styles.sliderFill,
                      height: \`\${weight}%\`,
                      background: allergen.color,
                    }}
                    aria-hidden
                  />
                  <span
                    style={{
                      ...styles.sliderThumb,
                      bottom: \`\${weight}%\`,
                      border: \`2px solid \${allergen.color}\`,
                    }}
                    aria-hidden
                  />
                </span>
              </div>
              <span style={styles.weightNum}>{weight}</span>
              <button
                type="button"
                className="ara-btn ara-focusable"
                style={{...styles.stepBtn, ...(weight === 100 ? {opacity: 0.35} : null)}}
                aria-label={\`Increase \${allergen.name} weight\`}
                disabled={weight === 100}
                onClick={() => onSetWeight(allergen.id, Math.min(100, weight + 5))}>
                <Icon icon={PlusIcon} size="sm" color="inherit" />
              </button>
              <button
                type="button"
                className="ara-btn ara-focusable"
                style={{...styles.stepBtn, ...(weight === 0 ? {opacity: 0.35} : null)}}
                aria-label={\`Decrease \${allergen.name} weight\`}
                disabled={weight === 0}
                onClick={() => onSetWeight(allergen.id, Math.max(0, weight - 5))}>
                <Icon icon={MinusIcon} size="sm" color="inherit" />
              </button>
              <span style={styles.mixLabel}>{allergen.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber (real 'Resize sheet' button: click toggles
// medium/large, drag between detents is garnish, >120px past medium
// closes), 52px header with 44×44 X, focus-trapped dialog.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, footer, children}: SheetProps) {
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

  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="ara-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease, height 200ms ease',
      }}>
      <button
        type="button"
        className="ara-btn ara-focusable"
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
          className="ara-btn ara-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// REACTION ROW — 72px media row; horizontal pointer drag reveals the 72px
// Delete block (snap open at −72, one row open at a time) with the
// MANDATORY 44×44 ellipsis opening the same destructive action as an
// anchored menu. Delete executes immediately + Undo toast (undoOverConfirm).
// ---------------------------------------------------------------------------

interface ReactionRowProps {
  reaction: Reaction;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onDelete: () => void;
}

function ReactionRow({
  reaction,
  isSwipeOpen,
  isMenuOpen,
  isLast,
  reducedMotion,
  menuRef,
  onSwipeOpen,
  onSwipeClose,
  onToggleMenu,
  onDelete,
}: ReactionRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const base = isSwipeOpen ? -72 : 0;
  const offset = dragX != null ? Math.max(-72, Math.min(0, base + dragX)) : base;
  const severity = SEVERITY_META[reaction.severity];
  const summary = reaction.symptoms.length > 0 ? reaction.symptoms.join(', ') : 'General flare-up';

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
    if (Math.abs(dx) > 8) movedRef.current = true;
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
    <div style={styles.rxOuter}>
      <div style={styles.rxClip}>
        <button
          type="button"
          className="ara-btn"
          style={styles.deleteAction}
          tabIndex={isSwipeOpen ? 0 : -1}
          aria-hidden={!isSwipeOpen}
          onClick={onDelete}>
          <Icon icon={Trash2Icon} size="md" color="inherit" />
          Delete
        </button>
        <div
          style={{
            ...styles.rxContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 200ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="ara-btn ara-focusable"
            style={styles.rxRowBtn}
            aria-label={\`\${summary}, \${reaction.date}, \${severity.label}, exposure \${reaction.exposure}\`}
            onClick={guardClick(() => {
              if (isSwipeOpen) onSwipeClose();
            })}>
            {/* 40px severity disc: 16%-mix wash + full-strength 20px icon
                (icon color ≥4.5:1 vs the card, see COLOR LITERALS). */}
            <span style={{...styles.rxDisc, background: mix(severity.color, 16), color: severity.color}} aria-hidden>
              <Icon icon={ActivityIcon} size="sm" color="inherit" />
            </span>
            <span style={styles.rxText}>
              <span style={styles.rxPrimary}>{summary}</span>
              <span style={styles.rxSecondary}>
                {reaction.date} · exposure {reaction.exposure} · {severity.label}
              </span>
            </span>
          </button>
          <button
            type="button"
            className="ara-btn ara-focusable"
            style={styles.iconBtn}
            aria-label={\`Actions for reaction on \${reaction.date}\`}
            aria-expanded={isMenuOpen}
            onClick={guardClick(onToggleMenu)}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div ref={menuRef} role="menu" aria-label={\`Actions for reaction on \${reaction.date}\`} style={{...styles.anchoredMenu, top: 60}}>
          <button
            type="button"
            role="menuitem"
            className="ara-btn ara-focusable"
            style={{...styles.menuRow, ...styles.menuRowDestructive}}
            onClick={onDelete}>
            <Icon icon={Trash2Icon} size="sm" color="inherit" />
            Delete reaction
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDividerDeep} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TAB_META: Array<{id: TabId; label: string; icon: typeof SunMediumIcon}> = [
  {id: 'today', label: 'Today', icon: SunMediumIcon},
  {id: 'forecast', label: 'Forecast', icon: CalendarRangeIcon},
  {id: 'reactions', label: 'Reactions', icon: ActivityIcon},
  {id: 'profile', label: 'Profile', icon: SlidersHorizontalIcon},
];

const NAV_TITLES: Record<TabId, string> = {
  today: LOCATION_NAME,
  forecast: '7-Day Forecast',
  reactions: 'Reactions',
  profile: 'Profile',
};

export default function MobileAllergySeasonRadarTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {state, update, setState} = useSeasonStore();

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const rxMenuRef = useRef<HTMLDivElement | null>(null);
  const sliderRefs = useRef<Record<AllergenId, HTMLDivElement | null>>({
    tree: null,
    grass: null,
    weed: null,
    mold: null,
  });
  const toastSeqRef = useRef(0);
  const rxSeqRef = useRef(4); // rx-04, rx-05, … deterministic ids
  const prevTabRef = useRef<TabId>(state.tab);

  // Derived — everything flows from (selectedDay, weights, reactions).
  const today = POLLEN_7DAY[0];
  const selected = POLLEN_7DAY[state.selectedDay];
  const selectedComposite = compositeFor(selected, state.weights);
  const selectedBand = bandFor(selectedComposite);
  const todayContributions = contributionsFor(today, state.weights);
  const todayRanks = useMemo(() => {
    const ranks = {tree: 4, grass: 4, weed: 4, mold: 4} as Record<AllergenId, number>;
    todayContributions.forEach((contribution, index) => {
      ranks[contribution.allergen.id] = index + 1;
    });
    return ranks;
  }, [todayContributions]);
  const todayComposite = compositeFor(today, state.weights);

  const toastPatch = (message: string, undo: UndoPayload | null = null) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, message, undo}};
  };
  const showToast = (message: string, undo: UndoPayload | null = null) => update(toastPatch(message, undo));

  // The demo's .preview-wrap owns scroll — find the nearest scrollable
  // ancestor for per-tab scroll persistence and re-tap-to-top.
  const getScroller = useCallback((): HTMLElement | null => {
    let element: HTMLElement | null = shellRef.current?.parentElement ?? null;
    while (element != null) {
      const css = window.getComputedStyle(element);
      if ((css.overflowY === 'auto' || css.overflowY === 'scroll') && element.scrollHeight > element.clientHeight) {
        return element;
      }
      element = element.parentElement;
    }
    return document.scrollingElement as HTMLElement | null;
  }, []);

  // PER-TAB STATE PERSISTENCE: selectedDay, weights, draft, expanded rows
  // all live in the store and survive switches; only the open sheet (an
  // overlay belongs to its moment) closes. Scroll restores on entry.
  const switchTab = (next: TabId) => {
    const scroller = getScroller();
    if (next === state.tab) {
      // The one legal reset: re-tapping the active tab scrolls to top.
      scroller?.scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'});
      return;
    }
    update({
      tab: next,
      scrollTopByTab: {...state.scrollTopByTab, [state.tab]: scroller?.scrollTop ?? 0},
      sheetOpen: false,
      reactionMenuId: null,
      openSwipeRow: null,
      openMarkerId: null,
    });
  };

  useEffect(() => {
    if (prevTabRef.current === state.tab) return;
    prevTabRef.current = state.tab;
    getScroller()?.scrollTo({top: state.scrollTopByTab[state.tab], behavior: 'auto'});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab, getScroller]);

  // SHEET LIFECYCLE — focus({preventScroll:true}) on open (plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen — foundations amendment); restore to
  // the opener on every close path.
  const openSheet = (opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update({sheetOpen: true, sheetDetent: 'medium', reactionMenuId: null, openSwipeRow: null, openMarkerId: null});
  };
  const closeSheet = () => {
    update({sheetOpen: false, sheetDetent: 'medium'});
    sheetOpenerRef.current?.focus();
  };
  useEffect(() => {
    if (state.sheetOpen) sheetRef.current?.focus({preventScroll: true});
  }, [state.sheetOpen]);
  useEffect(() => {
    if (state.reactionMenuId != null) rxMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [state.reactionMenuId]);

  const closeReactionMenu = useCallback(() => {
    update({reactionMenuId: null});
    menuOpenerRef.current?.focus();
  }, [update]);

  // Escape closes the TOPMOST overlay only: menu > marker card > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.reactionMenuId != null) closeReactionMenu();
      else if (state.openMarkerId != null) update({openMarkerId: null});
      else if (state.sheetOpen) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.reactionMenuId, state.openMarkerId, state.sheetOpen]);

  // CONSEQUENCE CHAINS ------------------------------------------------------

  // CROSS-SURFACE 2 (log reaction): Save appends {Jul 4 · exposure =
  // today's composite at save}, drops a marker on the CorrelationBand at
  // y = 96 − round(57×0.96) = 41, recomputes the pattern 2/3 = 67% → 3/4 =
  // 75% 'Strong match', bumps the Reactions badge 3 → 4, and announces via
  // the one toast — Undo removes it and every consequence reverts.
  const saveReaction = () => {
    const exposure = todayComposite ?? PAST_EXPOSURE[6]; // guard: all-zero weights
    const id = \`rx-\${String(rxSeqRef.current).padStart(2, '0')}\`;
    rxSeqRef.current += 1;
    const reaction: Reaction = {
      id,
      date: 'Jul 4',
      dayIndex: 6,
      exposure,
      severity: state.draft.severity,
      symptoms: [...state.draft.symptoms],
    };
    setState(prev => ({
      ...prev,
      reactions: [...prev.reactions, reaction],
      sheetOpen: false,
      sheetDetent: 'medium',
      draft: {severity: 2, symptoms: [], note: ''},
      ...toastPatch('Reaction logged', {kind: 'removeReaction', id}),
    }));
    sheetOpenerRef.current?.focus();
  };

  // undoOverConfirm: delete executes immediately; Undo restores the exact
  // list position (index captured before removal).
  const deleteReaction = (id: string) => {
    setState(prev => {
      const index = prev.reactions.findIndex(reaction => reaction.id === id);
      if (index < 0) return prev;
      const reaction = prev.reactions[index];
      return {
        ...prev,
        reactions: prev.reactions.filter(r => r.id !== id),
        openSwipeRow: null,
        reactionMenuId: null,
        openMarkerId: null,
        ...toastPatch('Reaction deleted', {kind: 'restoreReaction', reaction, index}),
      };
    });
  };

  const handleUndo = () => {
    const undo = state.toast?.undo;
    if (undo == null) return;
    if (undo.kind === 'restoreReaction') {
      setState(prev => {
        const next = [...prev.reactions];
        next.splice(Math.min(undo.index, next.length), 0, undo.reaction);
        return {...prev, reactions: next, ...toastPatch('Restored')};
      });
    } else {
      setState(prev => ({
        ...prev,
        reactions: prev.reactions.filter(reaction => reaction.id !== undo.id),
        ...toastPatch('Reaction removed'),
      }));
    }
  };

  const setWeight = (id: AllergenId, value: number) => {
    // CROSS-SURFACE 1 (mixer): one weight write re-derives the composite
    // for all 7 days, dial radii + legend order, risk pills, forecast
    // rows, ReadinessCard, and rank chips — grass 90→30 flips the top
    // trigger to Weed (2665 vs 2640 points) and Thu drops to 10570/160 =
    // 66 High, so ReadinessCard flips to 'No pre-dose needed'.
    setState(prev => ({...prev, weights: {...prev.weights, [id]: value}}));
  };

  const draftPatch = (patch: Partial<Draft>) => update({draft: {...state.draft, ...patch}});

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // SCREENS -----------------------------------------------------------------

  const renderToday = () => (
    <>
      <div style={styles.dayHeader}>
        <h1 style={styles.dayTitle}>{selected.long}</h1>
        <span
          style={{
            ...styles.riskPill,
            background:
              selectedBand.id === 'unset' ? 'var(--color-background-muted)' : mix(selectedBand.color, 12),
            color: selectedBand.color,
          }}>
          {selectedBand.label}
        </span>
      </div>
      {/* Refresh result — fixed string, role='status' announcer. */}
      <div role="status" style={styles.refreshStatus}>
        {state.refreshed ? 'Updated just now' : ''}
      </div>
      <div style={styles.cardGap} />
      <PollenSectorDial
        day={selected}
        weights={state.weights}
        reducedMotion={reducedMotion}
        expandedSector={state.expandedSector}
        onToggleSector={id => update({expandedSector: state.expandedSector === id ? null : id})}
      />
      <div style={styles.cardGap} />
      <ForecastScrubStrip
        selectedDay={state.selectedDay}
        weights={state.weights}
        reducedMotion={reducedMotion}
        onSelectDay={index => update({selectedDay: index})}
      />
      <div style={styles.cardGap} />
      <CorrelationBand
        reactions={state.reactions}
        openMarkerId={state.openMarkerId}
        onToggleMarker={id => update({openMarkerId: state.openMarkerId === id ? null : id})}
      />
      <div style={styles.cardGap} />
      <ReadinessCard selectedDay={state.selectedDay} weights={state.weights} onRemind={message => showToast(message)} />
      <div style={styles.fabSpacer} />
    </>
  );

  const renderForecast = () => (
    <>
      <h1 style={styles.largeTitle}>7-Day Forecast</h1>
      <div style={{...styles.listCard, marginTop: 8}}>
        {POLLEN_7DAY.map((day, index) => {
          const composite = compositeFor(day, state.weights);
          const band = bandFor(composite);
          const topTwo = contributionsFor(day, state.weights).slice(0, 2);
          return (
            <div key={day.id}>
              {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
              <button
                type="button"
                className="ara-btn ara-focusable"
                style={styles.dayRow}
                aria-label={\`\${day.long}, index \${composite ?? 'unset'}, \${band.label} — open on Today\`}
                onClick={() => {
                  // Deliberate cross-nav: row press selects the day AND
                  // returns to Today so the dial morph is the payoff.
                  update({selectedDay: index, tab: 'today'});
                }}>
                {/* 40px composite disc: 12%-mix band wash + full-strength
                    band numeral (≈ same ratio as on the bare card — all
                    band text colors pass 4.5:1 there, see COLOR LITERALS). */}
                <span
                  style={{
                    ...styles.dayDisc,
                    background: band.id === 'unset' ? 'var(--color-background-muted)' : mix(band.color, 12),
                    color: band.color,
                  }}
                  aria-hidden>
                  {composite ?? '—'}
                </span>
                <span style={styles.dayText}>
                  <span style={styles.dayPrimary}>{day.long}</span>
                  <span style={styles.daySecondary}>
                    {topTwo.map(c => \`\${c.allergen.name} \${c.count}\`).join(' · ')}
                  </span>
                </span>
                <span style={{...styles.dayBandLabel, color: band.color}}>{band.label}</span>
              </button>
            </div>
          );
        })}
      </div>
      <div style={styles.terminalCaption}>Pollen model: Jul 4–10</div>
      <div style={styles.bottomSpacer} />
    </>
  );

  const renderReactions = () => (
    <>
      <h1 style={styles.largeTitle}>Reactions</h1>
      {state.reactions.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={ActivityIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.emptyTitle}>No reactions logged</h2>
          <p style={styles.emptyBody}>Log how you feel and Aira learns your triggers.</p>
          <button
            type="button"
            className="ara-btn ara-focusable"
            style={styles.secondaryBtn}
            onClick={event => openSheet(event.currentTarget)}>
            Log reaction
          </button>
        </div>
      ) : (
        <>
          <h2 style={styles.sectionHeader}>This week</h2>
          <div style={styles.listCard}>
            {state.reactions.map((reaction, index) => (
              <ReactionRow
                key={reaction.id}
                reaction={reaction}
                isSwipeOpen={state.openSwipeRow === reaction.id}
                isMenuOpen={state.reactionMenuId === reaction.id}
                isLast={index === state.reactions.length - 1}
                reducedMotion={reducedMotion}
                menuRef={rxMenuRef}
                onSwipeOpen={() => update({openSwipeRow: reaction.id, reactionMenuId: null})}
                onSwipeClose={() => {
                  if (state.openSwipeRow === reaction.id) update({openSwipeRow: null});
                }}
                onToggleMenu={opener => {
                  menuOpenerRef.current = opener;
                  update({
                    reactionMenuId: state.reactionMenuId === reaction.id ? null : reaction.id,
                    openSwipeRow: null,
                  });
                }}
                onDelete={() => deleteReaction(reaction.id)}
              />
            ))}
          </div>
        </>
      )}
      <div style={styles.fabSpacer} />
    </>
  );

  const renderProfile = () => (
    <>
      <h1 style={styles.largeTitle}>Profile</h1>
      <div style={{height: 8}} />
      <SensitivityMixer weights={state.weights} todayRanks={todayRanks} onSetWeight={setWeight} sliderRefs={sliderRefs} />
      <h2 style={styles.sectionHeader}>Top trigger</h2>
      <div style={styles.listCard}>
        {todayContributions.map((contribution, index) => (
          <div key={contribution.allergen.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <button
              type="button"
              className="ara-btn ara-focusable"
              style={styles.rankRow}
              aria-label={\`Rank \${index + 1}: \${contribution.allergen.name}, contributes \${contribution.sharePct} percent — jump to its slider\`}
              onClick={() => sliderRefs.current[contribution.allergen.id]?.focus()}>
              <span
                style={{
                  ...styles.rankPos,
                  background: index === 0 ? mix(BRAND_ACCENT, 16) : 'var(--color-background-muted)',
                  color: index === 0 ? BRAND_ACCENT : 'var(--color-text-secondary)',
                }}>
                #{index + 1}
              </span>
              <span style={styles.rankName}>{contribution.allergen.name}</span>
              <span style={styles.rankMeta}>contributes {contribution.sharePct}%</span>
            </button>
          </div>
        ))}
      </div>
      <h2 style={styles.sectionHeader}>Settings</h2>
      <div style={styles.listCard}>
        <button
          type="button"
          className="ara-btn ara-focusable"
          style={styles.setRow}
          onClick={() => showToast(\`Location: \${LOCATION_NAME}\`)}>
          <span style={styles.setLabel}>Location</span>
          <span style={styles.setValue}>{LOCATION_NAME}</span>
          <span style={styles.chevron}>
            <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
          </span>
        </button>
        <div style={styles.rowDivider} />
        <button
          type="button"
          className="ara-btn ara-focusable"
          style={styles.setRow}
          onClick={() => showToast('Units: grains/m³')}>
          <span style={styles.setLabel}>Units</span>
          <span style={styles.setValue}>grains/m³</span>
          <span style={styles.chevron}>
            <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
          </span>
        </button>
        <div style={styles.rowDivider} />
        {/* Whole 44px row is the switch target (inputControls contract). */}
        <button
          type="button"
          role="switch"
          aria-checked={state.preDoseReminders}
          className="ara-btn ara-focusable"
          style={styles.setRow}
          onClick={() => update({preDoseReminders: !state.preDoseReminders})}>
          <span style={styles.setLabel}>Pre-dose reminders</span>
          <span
            style={{
              ...styles.switchTrack,
              background: state.preDoseReminders ? BRAND_ACCENT : SWITCH_OFF,
            }}
            aria-hidden>
            <span
              className="ara-anim"
              style={{
                ...styles.switchThumb,
                transform: state.preDoseReminders ? 'translateX(20px)' : undefined,
              }}
            />
          </span>
        </button>
      </div>
      <div style={styles.bottomSpacer} />
    </>
  );

  const showFab = !state.sheetOpen && (state.tab === 'today' || state.tab === 'reactions');
  const sheetExposure = todayComposite ?? '—';

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{AIRA_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="ara-btn ara-focusable"
              style={styles.iconBtn}
              aria-label="Aira — pollen model home"
              onClick={() => switchTab('today')}>
              <AiraMark />
            </button>
          </div>
          <div style={styles.navTitleWrap}>
            {state.tab === 'today' ? (
              <span style={styles.navPin} aria-hidden>
                <Icon icon={MapPinIcon} size="xsm" color="inherit" />
              </span>
            ) : null}
            <span style={styles.navTitle}>{NAV_TITLES[state.tab]}</span>
          </div>
          <div style={styles.navTrailing}>
            {state.tab === 'today' ? (
              <button
                type="button"
                className="ara-btn ara-focusable"
                style={styles.iconBtn}
                aria-label="Refresh pollen model"
                onClick={() => update({refreshed: true})}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            ) : null}
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'today' ? renderToday() : null}
          {state.tab === 'forecast' ? renderForecast() : null}
          {state.tab === 'reactions' ? renderReactions() : null}
          {state.tab === 'profile' ? renderProfile() : null}
        </main>

        {/* The single polite live region — STICKY-IN-FLOW above the tab
            bar; absolute only while the sheet scroll-lock is active. */}
        <div aria-live="polite" style={state.sheetOpen ? styles.toastDockLocked : styles.toastDock}>
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="ara-fade">
              <span style={styles.toastMsg}>{state.toast.message}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="ara-btn ara-focusable" style={styles.undoBtn} onClick={handleUndo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {showFab ? (
          <div style={styles.fabAnchor}>
            <button
              type="button"
              className="ara-btn ara-focusable"
              style={styles.fab}
              aria-label="Log reaction"
              onClick={event => openSheet(event.currentTarget)}>
              <Icon icon={PlusIcon} size="md" color="inherit" />
            </button>
          </div>
        ) : null}

        <nav style={styles.tabBar} aria-label="Aira sections">
          {TAB_META.map(tab => {
            const isActive = state.tab === tab.id;
            const badge = tab.id === 'reactions' ? state.reactions.length : 0;
            return (
              <button
                key={tab.id}
                type="button"
                className="ara-btn ara-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => switchTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {badge > 0 ? <span style={styles.tabBadge}>{badge}</span> : null}
                </span>
                {tab.label}
              </button>
            );
          })}
        </nav>

        {state.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {state.sheetOpen ? (
          <Sheet
            titleId="ara-log-title"
            title="Log reaction"
            detent={state.sheetDetent}
            onDetentChange={detent => update({sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button type="button" className="ara-btn ara-focusable" style={styles.saveBtn} onClick={saveReaction}>
                Save reaction
              </button>
            }>
            <div>
              <span style={styles.fieldLabel} id="ara-severity-label">
                Severity
              </span>
              <div
                role="radiogroup"
                aria-labelledby="ara-severity-label"
                style={styles.segTrack}
                onKeyDown={event => {
                  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                  event.preventDefault();
                  const delta = event.key === 'ArrowRight' ? 1 : -1;
                  const next = Math.min(3, Math.max(1, state.draft.severity + delta)) as Severity;
                  draftPatch({severity: next});
                  const buttons = event.currentTarget.querySelectorAll<HTMLElement>('button');
                  buttons[next - 1]?.focus();
                }}>
                {([1, 2, 3] as Severity[]).map(severity => {
                  const isOn = state.draft.severity === severity;
                  return (
                    <button
                      key={severity}
                      type="button"
                      role="radio"
                      aria-checked={isOn}
                      tabIndex={isOn ? 0 : -1}
                      className="ara-btn ara-focusable"
                      style={{...styles.segBtn, ...(isOn ? styles.segBtnActive : null)}}
                      onClick={() => draftPatch({severity})}>
                      {SEVERITY_META[severity].label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <span style={styles.fieldLabel}>Symptoms</span>
              <div style={styles.chipRow}>
                {SYMPTOM_OPTIONS.map(symptom => {
                  const isOn = state.draft.symptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      className="ara-btn ara-focusable"
                      style={styles.chipBtn}
                      aria-pressed={isOn}
                      onClick={() =>
                        draftPatch({
                          symptoms: isOn
                            ? state.draft.symptoms.filter(s => s !== symptom)
                            : [...state.draft.symptoms, symptom],
                        })
                      }>
                      <span style={{...styles.chipPill, ...(isOn ? styles.chipPillOn : null)}}>{symptom}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label style={styles.fieldLabel} htmlFor="ara-note">
                Note
              </label>
              <input
                id="ara-note"
                className="ara-input"
                style={styles.fieldInput}
                type="text"
                placeholder="Mowed the lawn at noon…"
                value={state.draft.note}
                onChange={event => draftPatch({note: event.target.value})}
              />
            </div>
            <div style={styles.exposureLine}>Today&apos;s exposure: {sheetExposure}</div>
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};