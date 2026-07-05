var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Sayso pronunciation drill for
 *   Lesson 4 · Ordering food (12 phrases), phrase 'Me gustaría un café'
 *   (8 syllables, stress widths 30/38/30/48/30/30/30/48 summing to 284 +
 *   7×6px gaps = 326 = exact card inner width). Native cadence onsets
 *   [0,300,600,900,1350,1650,1950,2150] ms (durations sum 2400 ✓); the
 *   scripted learner attempt lands onsets [0,320,640,980,1490,1770,2050,
 *   2260] (end 2520), per-syllable lags [0,+20,+40,+80,+140,+120,+100,
 *   +110]; scripted attempt #5 syllable scores [92,88,74,61,90,85,79,95]
 *   sum 664 → 664/8 = 83 overall ✓; seeded attempts 58/64/71/76 (sums
 *   464/512/568/608, weakest always 'rí'). Phrasebook mastery
 *   [88,92,81,85,96,83,90,76,64,52,47,38] sums 892 → avg 74% and 7
 *   mastered (≥80) → lesson 58%; after the scripted attempt phrase 8 goes
 *   76→83 → sum 899 → 75%, mastered 8 → 67%. Profile: streak 14, total
 *   attempts 213 + attempts.length (217 → 218), minutes 186. No
 *   Date.now(), no Math.random(), no network media.
 * @output Sayso — Speaking Drill Coach: a 390px MOBILE pronunciation
 *   drill surface where every attempt is a visual diff against the native
 *   speaker. NavBar (Sayso mark + lesson 58% · 'Lesson 4 · Ordering food'
 *   · 'Attempt 4' counter pill button) over a sticky phraseCard with a
 *   44px MasteryRing (76 → 83), a SyllableStressStrip (dual 24-point
 *   pitch contours over 8 stress-width syllable pill buttons + per-
 *   syllable lag row), a 4-row attempt-history listCard whose 72px rows
 *   expand to per-syllable blame chips, and a micDock (Play native ·
 *   72px hold-to-speak ShadowMeter with cadence rim ticks · Run attempt).
 *   Signature move: ONE scripted attempt (hold the meter or press Run
 *   attempt — identical code path) sweeps the learner contour and flips
 *   pills green/amber as the playhead crosses each onset, then scores 83:
 *   history inserts attempt #5, MasteryRing bumps 76→83, navBar lesson
 *   percent ticks 58%→67%, the Review tab badge increments 2→3, and the
 *   one aria-live toast announces. Re-running replaces attempt #5 —
 *   every aggregate is idempotent.
 * @position Page template; emitted by \`astryx template mobile-speaking-drill-coach\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the
 *   first pixel). All overlays (scrim, sheet, anchored menus) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the breakdown sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close; the toast dock is
 *   sticky-in-flow above the tab bar while the shell scrolls and flips
 *   to shell-absolute (bottom 76) ONLY while the shell is scroll-locked.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 68 — attempt/phrasebook rows lead
 *   with 48/44px thumbs); no desktop Layout frames, no side asides.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Sayso orange) reserved for fills/strokes ≥2px and
 *   glyphs ≥24px; brand-colored TEXT uses the deeper BRAND_TEXT pair
 *   (contrast math at each declaration). GREEN_HIT / AMBER_MISS are the
 *   two sanctioned semantic pairs; interactive rest boundaries (syllable
 *   pills, meter track) get explicit ≥3:1 pairs per the foundations
 *   amendment — hairline tokens are for passive separators only.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps · 6px syllable-pill
 *   gaps (spec); navBar 52px sticky top z20 (paddingInline 8, grid
 *   '1fr auto 1fr', center title 17px/600 ellipsized 200px, trailing
 *   'Attempt 4' 24px pill inside a 44×44 hit); phraseCard sticky top:52
 *   z15 minHeight 92 (12 pad + 26 phrase 22/700 + 4 + 18 translation 13
 *   + 4 + 16 meta 13 tabular + 12 pad, trailing 44px MasteryRing);
 *   SyllableStressStrip card 164 = 16 pad + 56 contour + 12 + 44 pill
 *   row + 20 delta row + 16 pad; sectionHeader 13/600 uppercase 0.06em
 *   at 32px (16 gutter + 16 card pad), 20 top / 8 bottom; history rows
 *   72px, dividers inset 68; terminal caption 13/400 centered 16 below;
 *   micDock sticky bottom:64 z19 height 96 (12 pad + 72 ShadowMeter +
 *   12 pad, blur surface, borderTop hairline); tabBar 64px sticky bottom
 *   z20, 4 tabs, 24px icon + 11/500 label + 4px gap, badge 16px min
 *   brand pill top −4 right −8. TYPE (Figtree via --font-family-body):
 *   22/700 phrase · 17/600 nav+card titles · 16/400 body · 13/400 meta ·
 *   11/500 labels; nothing under 11px; tabular-nums on every updating
 *   numeral. Touch: every target ≥44×44 (syllable pills are 44px-tall
 *   buttons; ShadowMeter 72px; chevrons/ellipses wrapped to 44); every
 *   gesture has a visible button path (Run attempt = the hold, grabber
 *   click = the sheet drag, ellipsis = the review swipe).
 *
 * Responsive contract:
 * - Fluid 320–430px: syllable pill widths become flexBasis
 *   [30,38,30,48,30,30,30,48] with proportional flexGrow and flexShrink
 *   1 so the stress ratio (30:38:48) holds at every width; the contour
 *   SVG is viewBox '0 0 326 56' width 100% preserveAspectRatio 'none'
 *   with boundary hairlines computed in viewBox units so contour-to-pill
 *   alignment survives scaling; phraseCard title wraps to 2 lines max at
 *   320 (card grows, sticky offset unaffected); micDock side slots
 *   flex:1 around the fixed 72px meter. overflowX:'clip' is backstop
 *   only — no width:390 literals anywhere.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — this is deliberately phone
 *   geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  BellIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FlameIcon,
  MicIcon,
  MoreHorizontalIcon,
  PlayIcon,
  RefreshCwIcon,
  RepeatIcon,
  SettingsIcon,
  SquareIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Sayso orange). #F2600C luminance ≈ 0.273 →
// vs #FFFFFF ≈ 3.3:1 — reserved for FILLS, 2px contour strokes, and glyphs
// ≥24px (≥3:1 non-text rule), never body-size text. Dark side #FF8A4C
// (L ≈ 0.399) on the dark card (~#1C1917, L ≈ 0.010) ≈ 7.5:1.
const BRAND_ACCENT = 'light-dark(#F2600C, #FF8A4C)';
// Brand-colored TEXT pair — the light side deepens to #C24A05 (L ≈ 0.164)
// so 13px/600 brand text on white passes: 1.05/0.214 ≈ 4.9:1. Dark side
// #FF8A4C on #1C1917 ≈ 7.5:1. (Spec quoted #F2600C at 3.9:1 for text; the
// computed value is 3.3:1, so text rides this deeper pair — deviation with
// math, fills keep the spec hex.)
const BRAND_TEXT = 'light-dark(#C24A05, #FF8A4C)';
// Text over a BRAND_ACCENT fill: #FFFFFF on #F2600C ≈ 3.3:1 — legal only
// for the ≥24px tab-badge numerals and 11px/600 badge digits ride the
// large-glyph exemption poorly, so badge text flips to a near-black pair:
// #2B1200 on #F2600C ≈ 4.7:1; #2B1200 on #FF8A4C ≈ 6.1:1.
const BRAND_FILL_TEXT = 'light-dark(#2B1200, #2B1200)';
// Brand washes.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// GREEN_HIT — #1B7F3B (L ≈ 0.157) on the white card ≈ 5.1:1; on its own
// 12% tint over white (mixed L ≈ 0.90) ≈ 4.6:1. Dark #4ADE80 on the dark
// card ≈ 10.7:1.
const GREEN_HIT = 'light-dark(#1B7F3B, #4ADE80)';
const GREEN_TINT_12 = \`color-mix(in srgb, \${GREEN_HIT} 12%, transparent)\`;
// AMBER_MISS — #B45309 (L ≈ 0.159) on the white card ≈ 5.0:1; on its own
// 12% tint over white (mixed L ≈ 0.90) ≈ 4.5:1 (stress fixture 4). Dark
// #FBBF24 on the dark card tint ≈ 10.1:1.
const AMBER_MISS = 'light-dark(#B45309, #FBBF24)';
const AMBER_TINT_12 = \`color-mix(in srgb, \${AMBER_MISS} 12%, transparent)\`;
// FOUNDATIONS AMENDMENT — interactive rest boundaries need ≥3:1 against
// their ACTUAL surface, hairline tokens are for passive separators only.
// Syllable-pill rest border + ShadowMeter rest track: #767676 (L ≈ 0.184)
// on white ≈ 4.5:1 and on the muted wash (~L 0.83) ≈ 3.8:1; dark #8E8E8E
// (L ≈ 0.262) on the dark body (~L 0.008) ≈ 5.4:1.
const REST_EDGE = 'light-dark(#767676, #8E8E8E)';
// ShadowMeter rest ring (meaningful unfilled level track vs the blur dock
// surface, drawn at FULL opacity so the math holds): #8A8A8A (L ≈ 0.245)
// on the near-white dock ≈ 3.6:1; dark #6E6E6E (L ≈ 0.148) on the dark
// body (~L 0.008) ≈ 3.4:1.
const METER_TRACK = 'light-dark(#8A8A8A, #6E6E6E)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden h1,
// 2-line phrase clamp, reduced-motion guard. Transitions animate
// transform/opacity/color only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const SAYSO_CSS = \`
.sso-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.sso-btn:disabled { cursor: default; }
.sso-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.sso-anim { transition: transform 240ms ease, opacity 240ms ease; }
.sso-fade { transition: opacity 240ms ease; }
.sso-color { transition: background-color 160ms ease, color 160ms ease; }
.sso-press:active { transform: scale(0.96); }
.sso-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@keyframes sso-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.sso-sheet-in { animation: sso-sheet-in 240ms ease; }
.sso-vh {
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
  .sso-anim, .sso-fade, .sso-color { transition: none; }
  .sso-sheet-in { animation: none; }
  .sso-press:active { transform: none; }
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
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; always-on bottom hairline (noted
  // choice — scroll-under is not wired).
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
  navLeading: {display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2, minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  brandSlot: {width: 36, height: 44, display: 'grid', placeItems: 'center', flexShrink: 0},
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  // Lesson percent — 11px/600 tabular, ticks 58% → 67% on the scripted
  // attempt (BRAND_TEXT pair: 4.9:1 light / 7.5:1 dark).
  lessonPct: {
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: BRAND_TEXT,
    whiteSpace: 'nowrap',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
    margin: 0,
  },
  // Attempt counter — 24px muted pill inside a 44×44 hit; a real button
  // opening the breakdown sheet.
  attemptPillHit: {
    minWidth: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
  },
  attemptPill: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
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
  // PHRASE CARD — sticky top:52 z15; minHeight 92 = 12 pad + 26 phrase +
  // 4 + 18 translation + 4 + 16 meta + 12 pad (grows to 118 when the
  // 22px title wraps to two lines at 320 — sticky offset unaffected).
  phraseCard: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    marginInline: 16,
    marginTop: 12,
    minHeight: 92,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    boxSizing: 'border-box',
    textAlign: 'start',
  },
  phraseText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4},
  phraseLine: {fontSize: 22, fontWeight: 700, lineHeight: '26px', margin: 0},
  phraseTranslation: {
    fontSize: 13,
    lineHeight: '18px',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  phraseMeta: {
    fontSize: 13,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // SYLLABLE STRESS STRIP — card height 164 = 16 pad + 56 contour band +
  // 12 gap + 44 pill row + 20 delta row + 16 pad.
  stripCard: {
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  contourBand: {position: 'relative', height: 56, marginBottom: 12},
  contourSvg: {position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block'},
  pillRow: {display: 'flex', gap: 6},
  // Syllable pill — 44px tall full touch target (6px gaps are the spec's
  // strip geometry; the pills read as one merged rhythm row). Rest border
  // is REST_EDGE per the interactive-boundary amendment (≥3:1 math at
  // the declaration); rest fill is the muted wash BEHIND that boundary.
  sylPill: {
    height: 44,
    minWidth: 0,
    borderRadius: 999,
    border: \`1px solid \${REST_EDGE}\`,
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  sylPillHit: {
    background: GREEN_TINT_12,
    border: \`1px solid \${GREEN_HIT}\`,
    color: GREEN_HIT,
  },
  sylPillMiss: {
    background: AMBER_TINT_12,
    border: \`1px solid \${AMBER_MISS}\`,
    color: AMBER_MISS,
  },
  sylPillNative: {
    background: BRAND_TINT_12,
    border: \`1px solid \${BRAND_ACCENT}\`,
    color: BRAND_TEXT,
  },
  // 20px delta row — 11px/500 tabular per-syllable lag labels sharing the
  // pill flex weights so '+140ms' stays centered under its pill at every
  // width. Overflow stays VISIBLE: '+140ms' (~33px) overhangs a 30px cell
  // by ≤2px per side, well inside the 6px gaps — never clipped, never
  // colliding (stress fixture 1).
  deltaRow: {display: 'flex', gap: 6, marginTop: 4, height: 16},
  deltaCell: {
    minWidth: 0,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  deltaCellMiss: {color: AMBER_MISS},
  deltaCellHit: {color: GREEN_HIT},
  // Inset-grouped listCard.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
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
  // ATTEMPT DIFF ROW — 72px; whole row a button; 48px waveform thumb.
  attemptRowBtn: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    paddingInlineEnd: 0,
  },
  waveThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    display: 'block',
  },
  attemptText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  attemptPrimary: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  attemptSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chevWrap: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  // Expanded detail — 96px block: 8 score chips (2 rows of 4 at narrow
  // widths via a 4-column grid) + 36px 'View phoneme detail'.
  detailBlock: {padding: '0 16px 12px'},
  chipGrid: {display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8},
  scoreChip: {
    height: 24,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  chipHit: {background: GREEN_TINT_12, color: GREEN_HIT},
  chipMiss: {background: AMBER_TINT_12, color: AMBER_MISS},
  viewDetailBtn: {
    marginTop: 8,
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // MIC DOCK — sticky bottom:64 z19, height 96 = 12 pad + 72 meter + 12.
  micDock: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    height: 96,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
    boxSizing: 'border-box',
    marginTop: 24,
  },
  dockSide: {flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 0},
  dockLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  playBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: BRAND_TEXT,
  },
  runBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    whiteSpace: 'nowrap',
  },
  meterBtn: {
    position: 'relative',
    width: 72,
    height: 72,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: BRAND_TEXT,
    touchAction: 'none',
  },
  meterCenter: {position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none'},
  // TAB BAR — 64px sticky bottom z20, 4 flex-1 tabs.
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
  tabItemActive: {color: 'var(--color-brand)'},
  tabIconWrap: {position: 'relative', width: 24, height: 24, display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  // Badge — 16px min-width brand pill, 10px/600, top −4 right −8.
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
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
    boxSizing: 'border-box',
  },
  // TOAST — sticky-in-flow dock above the tab bar (foundations amendment:
  // shell-absolute only while the shell is scroll-locked).
  toastDockSticky: {
    position: 'sticky',
    bottom: 172,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
    height: 0,
  },
  toastDockAbsolute: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    maxWidth: '100%',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'auto',
  },
  // Sticky dock is a zero-height anchor line; the toast lifts fully above
  // it so it never overlaps the micDock/tabBar it docks against.
  toastLifted: {transform: 'translateY(-100%)'},
  toastText: {minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'},
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
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
  grabberZone: {
    width: '100%',
    height: 24,
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    touchAction: 'none',
    boxSizing: 'border-box',
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
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  // Breakdown syllable row — 44px.
  sylBreakRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 4,
  },
  sylBreakName: {width: 44, fontSize: 16, fontWeight: 500, flexShrink: 0},
  sylBreakIpa: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sylBreakDur: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  sylBreakChip: {minWidth: 40, flexShrink: 0},
  // Phoneme detail (LARGE detent).
  detailTitle: {fontSize: 22, fontWeight: 700, margin: '8px 0 4px'},
  detailSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    margin: '0 0 12px',
  },
  phonemeChip: {
    minHeight: 44,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 12,
    marginBottom: 8,
    width: '100%',
  },
  phonemeIpa: {fontSize: 16, fontWeight: 600},
  phonemeScore: {fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  tipLine: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '8px 0 16px',
    lineHeight: '18px',
  },
  backBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
  },
  // REVIEW — segmented control (track 12px, active pill 8px) + 60px rows.
  segTrack: {
    marginInline: 16,
    marginTop: 12,
    height: 36,
    display: 'flex',
    padding: 3,
    gap: 2,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
    boxSizing: 'border-box',
  },
  segBtn: {
    flex: 1,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  reviewOuter: {position: 'relative'},
  reviewClip: {position: 'relative', overflow: 'hidden'},
  doneAction: {
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
    background: 'var(--color-brand)',
    color: 'var(--color-text-on-brand, #FFFFFF)',
    fontSize: 13,
    fontWeight: 600,
  },
  reviewContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  reviewRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInlineStart: 16,
  },
  reviewPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  reviewSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  readyChip: {
    alignSelf: 'center',
    marginInlineEnd: 4,
    height: 20,
    paddingInline: 8,
    borderRadius: 999,
    background: GREEN_TINT_12,
    color: GREEN_HIT,
    fontSize: 11,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
    flexShrink: 0,
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
  // Skeleton rows — exact 60px loaded geometry, deterministic widths.
  skelRow: {height: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, paddingInline: 16},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // Empty state per foundations.
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
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0', lineHeight: '18px'},
  // PHRASEBOOK — 72px media rows, 44px MasteryRing as the leading thumb.
  phraseRowBtn: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  ringThumb: {width: 44, height: 44, flexShrink: 0, position: 'relative'},
  ringValue: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'none',
  },
  // PROFILE — 2-col stat tile grid + 44px utility rows.
  profileGrid: {
    marginInline: 16,
    marginTop: 12,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  statTile: {
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statValue: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: 6},
  statLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  utilRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
  },
  utilLabel: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  utilValue: {fontSize: 16, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checked aggregates.
// Ledger (verified by hand): pill widths 5×30 + 38 + 2×48 = 284; + 7 gaps ×
// 6px = 42 → 326 = exact card inner width (390 − 32 gutter − 32 pad).
// Native durations 300+300+300+450+300+300+200+250 = 2400 ✓. Attempt sums
// 464/8=58, 512/8=64, 568/8=71, 608/8=76, 664/8=83 ✓. Phoneme means
// reproduce attempt-#5 syllable scores exactly (90+94)/2=92, 264/3=88,
// 148/2=74, 122/2=61, 90, 170/2=85, 158/2=79, 190/2=95 ✓ — 16 phonemes
// (2+3+2+2+1+2+2+2). Phrasebook masteries sum 892 → 74% avg, 7 ≥80 → 58%;
// post-attempt 899 → 75%, 8 ≥80 → 67% ✓. Review ready 2 → 3 ✓. Profile
// total attempts 213 + attempts.length = 217 → 218 ✓.
// ---------------------------------------------------------------------------

const LESSON_TITLE = 'Lesson 4 · Ordering food';
const PHRASE_ES = 'Me gustaría un café';
const PHRASE_EN = 'I would like a coffee';
const NATIVE_TOTAL_MS = 2400;
const LEARNER_TOTAL_MS = 2520;
const SCRIPT_TICK_MS = 60; // 2520 / 60 = 42 meter level ticks

interface Syllable {
  syl: string;
  ipa: string;
  weight: number; // flexBasis px at 390 — 30 unstressed / 38 secondary / 48 stressed
  nativeOnsetMs: number;
  nativeDurMs: number;
  learnerOnsetMs: number;
  lagMs: number; // learner − native; |lag| ≤ 60 = hit (green), else miss
}

const SYLLABLES: Syllable[] = [
  {syl: 'Me', ipa: '/me/', weight: 30, nativeOnsetMs: 0, nativeDurMs: 300, learnerOnsetMs: 0, lagMs: 0},
  {syl: 'gus', ipa: '/ɡus/', weight: 38, nativeOnsetMs: 300, nativeDurMs: 300, learnerOnsetMs: 320, lagMs: 20},
  {syl: 'ta', ipa: '/ta/', weight: 30, nativeOnsetMs: 600, nativeDurMs: 300, learnerOnsetMs: 640, lagMs: 40},
  {syl: 'rí', ipa: '/ˈri/', weight: 48, nativeOnsetMs: 900, nativeDurMs: 450, learnerOnsetMs: 980, lagMs: 80},
  {syl: 'a', ipa: '/a/', weight: 30, nativeOnsetMs: 1350, nativeDurMs: 300, learnerOnsetMs: 1490, lagMs: 140},
  {syl: 'un', ipa: '/un/', weight: 30, nativeOnsetMs: 1650, nativeDurMs: 300, learnerOnsetMs: 1770, lagMs: 120},
  {syl: 'ca', ipa: '/ka/', weight: 30, nativeOnsetMs: 1950, nativeDurMs: 200, learnerOnsetMs: 2050, lagMs: 100},
  {syl: 'fé', ipa: '/ˈfe/', weight: 48, nativeOnsetMs: 2150, nativeDurMs: 250, learnerOnsetMs: 2260, lagMs: 110},
];

const LAG_HIT_MS = 60; // syllables 1–3 (lags 0/20/40) green, rest amber ✓
const SCORE_HIT = 75; // chips/pills at ≥75 green, <75 amber

interface Phoneme {
  ipa: string;
  score: number;
}

// Per-syllable phoneme blame (means reproduce attempt-#5 syllable scores).
const PHONEMES: Phoneme[][] = [
  [{ipa: '/m/', score: 90}, {ipa: '/e/', score: 94}], // (90+94)/2 = 92
  [{ipa: '/ɡ/', score: 84}, {ipa: '/u/', score: 89}, {ipa: '/s/', score: 91}], // 264/3 = 88
  [{ipa: '/t/', score: 70}, {ipa: '/a/', score: 78}], // 148/2 = 74
  [{ipa: '/r/', score: 48}, {ipa: '/i/', score: 74}], // 122/2 = 61
  [{ipa: '/a/', score: 90}], // 90
  [{ipa: '/u/', score: 86}, {ipa: '/n/', score: 84}], // 170/2 = 85
  [{ipa: '/k/', score: 75}, {ipa: '/a/', score: 83}], // 158/2 = 79
  [{ipa: '/f/', score: 96}, {ipa: '/e/', score: 94}], // 190/2 = 95
];

const SYL_TIPS: string[] = [
  'Keep /m/ short — close straight into the vowel.',
  'Voice the /ɡ/ softly; Spanish g never aspirates here.',
  'Dental /t/ — tongue on the teeth, no puff of air.',
  'Trill the /r/ — your pitch fell 80ms late.',
  'Link "ría" into "a" without a glottal stop.',
  'Round the /u/ tighter; keep /n/ on the ridge.',
  'Unaspirated /k/ — half the puff of English "ca".',
  'Stress lands HERE: rise on /ˈfe/ then fall away.',
];

interface Attempt {
  id: string;
  n: number;
  score: number; // = mean of syllableScores (cross-checked in the ledger)
  syllableScores: number[];
  ago: string; // pre-computed relative string — no clock
}

// Seeded history — weakest is always 'rí' (index 3): 34→41→49→54, then 61.
const SEEDED_ATTEMPTS: Attempt[] = [
  {id: 'att_04', n: 4, score: 76, syllableScores: [86, 82, 68, 54, 84, 78, 72, 84], ago: '2 min ago'},
  {id: 'att_03', n: 3, score: 71, syllableScores: [82, 76, 62, 49, 80, 74, 68, 77], ago: '5 min ago'},
  {id: 'att_02', n: 2, score: 64, syllableScores: [76, 68, 55, 41, 74, 66, 60, 72], ago: '9 min ago'},
  {id: 'att_01', n: 1, score: 58, syllableScores: [70, 62, 50, 34, 68, 58, 52, 70], ago: '12 min ago'},
];

const SCRIPTED_ATTEMPT: Attempt = {
  id: 'att_05',
  n: 5,
  score: 83, // [92,88,74,61,90,85,79,95] → 664/8 ✓ (6 green, 2 amber: ta 74, rí 61)
  syllableScores: [92, 88, 74, 61, 90, 85, 79, 95],
  ago: 'just now',
};

interface Phrase {
  id: string;
  es: string;
  en: string;
  mastery: number;
  ready: boolean; // mastered-but-unreviewed → Review tab
  reviewedAgo: string;
}

// Masteries [88,92,81,85,96,83,90,76,64,52,47,38] — sum 892 ✓. ph_despacio
// is the 72px-row one-line ellipsis stress (fixture 2). ph_cafe (index 7)
// is THE drilled phrase: 76 → 83 on the scripted attempt.
const PHRASEBOOK: Phrase[] = [
  {id: 'ph_hola', es: 'Hola, ¿qué tal?', en: 'Hi, how are you?', mastery: 88, ready: false, reviewedAgo: 'Reviewed yesterday'},
  {id: 'ph_dias', es: 'Buenos días', en: 'Good morning', mastery: 92, ready: true, reviewedAgo: 'Mastered 3 days ago'},
  {id: 'ph_mesa', es: 'Una mesa para dos', en: 'A table for two', mastery: 81, ready: false, reviewedAgo: 'Reviewed yesterday'},
  {id: 'ph_menu', es: '¿Tienen menú del día?', en: 'Do you have a set menu?', mastery: 85, ready: false, reviewedAgo: 'Reviewed 2 days ago'},
  {id: 'ph_cuenta', es: 'La cuenta, por favor', en: 'The check, please', mastery: 96, ready: true, reviewedAgo: 'Mastered 5 days ago'},
  {id: 'ph_cebolla', es: 'Sin cebolla, por favor', en: 'No onion, please', mastery: 83, ready: false, reviewedAgo: 'Reviewed 2 days ago'},
  {id: 'ph_banio', es: '¿Dónde está el baño?', en: 'Where is the bathroom?', mastery: 90, ready: false, reviewedAgo: 'Reviewed yesterday'},
  {id: 'ph_cafe', es: PHRASE_ES, en: PHRASE_EN, mastery: 76, ready: false, reviewedAgo: 'Drilling now'},
  {
    id: 'ph_despacio',
    es: '¿Puede hablar más despacio, por favor?',
    en: 'Could you speak more slowly, please?',
    mastery: 64,
    ready: false,
    reviewedAgo: 'Reviewed 4 days ago',
  },
  {id: 'ph_tarjeta', es: 'Quisiera pagar con tarjeta', en: "I'd like to pay by card", mastery: 52, ready: false, reviewedAgo: 'Reviewed 6 days ago'},
  {id: 'ph_llevar', es: 'Para llevar, por favor', en: 'To go, please', mastery: 47, ready: false, reviewedAgo: 'Not yet reviewed'},
  {id: 'ph_recomienda', es: '¿Me recomienda algo?', en: 'Do you recommend anything?', mastery: 38, ready: false, reviewedAgo: 'Not yet reviewed'},
];

const PROFILE_STREAK_DAYS = 14;
const PROFILE_BASE_ATTEMPTS = 213; // + attempts.length → 217, 218 after script
const PROFILE_MINUTES = 186;

// CONTOURS — 24 hardcoded Hz-mapped y values each (viewBox 0–56, lower =
// higher pitch), 3 points per syllable at 20/50/80% of the pill span. The
// native line peaks on the stressed 'rí' and rises-falls through 'fé'; the
// learner line sits flatter and consistently later (the lag story).
const NATIVE_CONTOUR: number[] = [
  32, 28, 26, 24, 20, 22, 26, 28, 27, 18, 12, 15, 24, 28, 30, 32, 30, 29, 27, 24, 25, 20, 14, 34,
];
const LEARNER_CONTOUR: number[] = [
  34, 31, 30, 29, 26, 27, 30, 31, 30, 27, 22, 24, 30, 32, 33, 34, 33, 32, 31, 29, 30, 27, 22, 38,
];

// ShadowMeter LEVELS — 42 deterministic values (2520 / 60 = 42 ticks),
// 0–1 amplitude; louder swells track the stressed syllables.
const METER_LEVELS: number[] = [
  0.22, 0.38, 0.46, 0.4, 0.3, 0.44, 0.56, 0.5, 0.36, 0.3, 0.42, 0.5, 0.44, 0.34, 0.3, 0.52, 0.72,
  0.8, 0.74, 0.6, 0.46, 0.36, 0.3, 0.34, 0.4, 0.36, 0.3, 0.34, 0.4, 0.44, 0.38, 0.3, 0.36, 0.42,
  0.38, 0.32, 0.44, 0.58, 0.66, 0.6, 0.46, 0.28,
];

// PILL / CONTOUR GEOMETRY in the 326-unit viewBox: cumulative x ranges from
// widths [30,38,30,48,30,30,30,48] + 6px gaps. Ranges: 0–30, 36–74, 80–110,
// 116–164, 170–200, 206–236, 242–272, 278–326; boundary hairlines sit mid-
// gap at [33,77,113,167,203,239,275].
const PILL_GAP = 6;
const CARD_INNER = 326;
const PILL_X: Array<{left: number; width: number}> = (() => {
  const out: Array<{left: number; width: number}> = [];
  let cursor = 0;
  for (const syllable of SYLLABLES) {
    out.push({left: cursor, width: syllable.weight});
    cursor += syllable.weight + PILL_GAP;
  }
  return out;
})();
const BOUNDARY_X: number[] = PILL_X.slice(1).map(range => range.left - PILL_GAP / 2);

function contourPoints(contour: number[]): string {
  const pts: string[] = [];
  SYLLABLES.forEach((_, i) => {
    const {left, width} = PILL_X[i];
    [0.2, 0.5, 0.8].forEach((f, j) => {
      pts.push(\`\${(left + width * f).toFixed(1)},\${contour[i * 3 + j]}\`);
    });
  });
  return pts.join(' ');
}

const NATIVE_POINTS = contourPoints(NATIVE_CONTOUR);
const LEARNER_POINTS = contourPoints(LEARNER_CONTOUR);

// RIM ANGLES — native ticks at onset/2400×360° =
// [0,45,90,135,202.5,247.5,292.5,322.5]; learner ticks at onset/2400×360°
// = [0,48,96,147,223.5,265.5,307.5,339] (drawn 4px inside the rim).
const NATIVE_TICK_DEG = SYLLABLES.map(s => (s.nativeOnsetMs / NATIVE_TOTAL_MS) * 360);
const LEARNER_TICK_DEG = SYLLABLES.map(s => (s.learnerOnsetMs / NATIVE_TOTAL_MS) * 360);

function weakestIndex(scores: number[]): number {
  let min = 0;
  for (let i = 1; i < scores.length; i++) {
    if (scores[i] < scores[min]) min = i;
  }
  return min;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — single INITIAL object, update = patch merge; every
// mutation flows through it. Aggregates (attemptCount, best, masteredCount,
// lesson %, review badge, profile totals) DERIVE live from attempts /
// phrasebook so the scripted attempt is idempotent by construction
// (stress fixture 5: re-running replaces att_05, nothing double-counts).
// ---------------------------------------------------------------------------

type TabId = 'drills' | 'review' | 'phrasebook' | 'profile';

interface SaysoState {
  tab: TabId;
  attempts: Attempt[];
  phrasebook: Phrase[];
  reviewDoneIds: string[];
  reviewFilter: 'ready' | 'done';
  reviewLoading: boolean;
  reviewUpdated: boolean; // 'Updated just now' caption (fixed string)
  reviewMenuId: string | null;
  openSwipeId: string | null;
  running: boolean;
  playheadMs: number;
  scriptDone: boolean;
  playingNative: boolean;
  nativeMs: number;
  expandedAttemptId: string | null;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  sheetSyllable: number | null; // null = MEDIUM breakdown list
  toast: {seq: number; text: string; undoPhraseId: string | null} | null;
}

const INITIAL: SaysoState = {
  tab: 'drills',
  attempts: SEEDED_ATTEMPTS,
  phrasebook: PHRASEBOOK,
  reviewDoneIds: [],
  reviewFilter: 'ready',
  reviewLoading: false,
  reviewUpdated: false,
  reviewMenuId: null,
  openSwipeId: null,
  running: false,
  playheadMs: 0,
  scriptDone: false,
  playingNative: false,
  nativeMs: 0,
  expandedAttemptId: null,
  sheetOpen: false,
  sheetDetent: 'medium',
  sheetSyllable: null,
  toast: null,
};

/** Container-width hook (grid-feeder-console pattern). */
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

// ---------------------------------------------------------------------------
// BRAND MARK — Sayso quotation mark whose tail unravels into a waveform.
// ---------------------------------------------------------------------------

function SaysoMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandMark}>
        <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M4 3.5h4.5v4.5c0 2.6-1.4 4.2-4 4.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 15.2c1.2 0 1.2-1.6 2.4-1.6s1.2 1.6 2.4 1.6 1.2-2.4 2.4-2.4 1.1 1.4 2.2 1.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// MASTERY RING — 44px SVG progress ring, 4px stroke, sweep = value/100 ×
// 360° (pathLength 100 → strokeDashoffset 100 − value). Track uses
// --color-border: the ring value is ALSO the 13px/700 center numeral, so
// the sweep is decorative reinforcement — BRAND_ACCENT (L ≈ 0.273) vs a
// typical light border (~L 0.78) ≈ 2.6:1 does not carry the value alone
// (stress fixture 3 note; the tabular numeral does).
// ---------------------------------------------------------------------------

function MasteryRing({value, animate}: {value: number; animate: boolean}) {
  return (
    <span style={styles.ringThumb} role="img" aria-label={\`Mastery \${value} of 100\`}>
      <svg width={44} height={44} viewBox="0 0 44 44" fill="none" aria-hidden style={{display: 'block'}}>
        <circle cx={22} cy={22} r={19} stroke="var(--color-border)" strokeWidth={4} />
        <circle
          cx={22}
          cy={22}
          r={19}
          stroke={BRAND_ACCENT}
          strokeWidth={4}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - value}
          transform="rotate(-90 22 22)"
          style={animate ? {transition: 'stroke-dashoffset 240ms ease'} : undefined}
        />
      </svg>
      <span style={styles.ringValue}>{value}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SYLLABLE STRESS STRIP — 56px dual-contour SVG band over 8 stress-width
// pill buttons + 20px lag row. Vertical boundary hairlines run through the
// band in viewBox units so contour-to-pill alignment survives 320–430
// scaling. During a run, pills flip GREEN/AMBER the frame playheadMs
// crosses each learner onset; during native playback they tint brand in
// native cadence behind a sweeping 2px playhead line.
// ---------------------------------------------------------------------------

interface StripProps {
  running: boolean;
  scriptDone: boolean;
  playheadMs: number;
  playingNative: boolean;
  nativeMs: number;
  reducedMotion: boolean;
  onPillTap: (index: number, opener: HTMLElement) => void;
}

function SyllableStressStrip({running, scriptDone, playheadMs, playingNative, nativeMs, reducedMotion, onPillTap}: StripProps) {
  const showLearner = running || scriptDone;
  const progress = Math.min(1, playheadMs / LEARNER_TOTAL_MS);
  const nativeX = (Math.min(nativeMs, NATIVE_TOTAL_MS) / NATIVE_TOTAL_MS) * CARD_INNER;
  return (
    <section style={styles.stripCard} aria-label="Syllable stress and pitch diff">
      <div style={styles.contourBand}>
        <svg viewBox={\`0 0 \${CARD_INNER} 56\`} preserveAspectRatio="none" style={styles.contourSvg} aria-hidden>
          {BOUNDARY_X.map(x => (
            <line key={x} x1={x} y1={0} x2={x} y2={56} stroke="var(--color-border)" strokeWidth={1} />
          ))}
          {/* Native contour — 2px on the card surface (explicit primary-
              text pair via token; passive reference line). */}
          <polyline
            points={NATIVE_POINTS}
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {showLearner ? (
            <polyline
              points={LEARNER_POINTS}
              fill="none"
              stroke={BRAND_ACCENT}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset={scriptDone ? 0 : 100 - progress * 100}
            />
          ) : null}
          {playingNative && !reducedMotion ? (
            <line x1={nativeX} y1={0} x2={nativeX} y2={56} stroke={BRAND_ACCENT} strokeWidth={2} />
          ) : null}
        </svg>
      </div>
      <div style={styles.pillRow}>
        {SYLLABLES.map((syllable, i) => {
          const crossed = (running && playheadMs >= syllable.learnerOnsetMs) || scriptDone;
          const nativeLit = playingNative && (reducedMotion || nativeMs >= syllable.nativeOnsetMs);
          const isHit = Math.abs(syllable.lagMs) <= LAG_HIT_MS;
          const stateStyle = crossed
            ? isHit
              ? styles.sylPillHit
              : styles.sylPillMiss
            : nativeLit
              ? styles.sylPillNative
              : null;
          const lagLabel =
            syllable.lagMs === 0 ? 'on time' : \`\${syllable.lagMs > 0 ? '+' : ''}\${syllable.lagMs} milliseconds late\`;
          return (
            <button
              key={syllable.syl + i}
              type="button"
              className="sso-btn sso-focusable sso-color"
              style={{
                ...styles.sylPill,
                flexBasis: syllable.weight,
                flexGrow: syllable.weight,
                flexShrink: 1,
                ...stateStyle,
              }}
              aria-label={\`Syllable \${syllable.syl}, scored \${SCRIPTED_ATTEMPT.syllableScores[i]}, \${lagLabel} — open phoneme detail\`}
              onClick={event => onPillTap(i, event.currentTarget)}>
              {syllable.syl}
            </button>
          );
        })}
      </div>
      <div style={styles.deltaRow} aria-hidden>
        {SYLLABLES.map((syllable, i) => {
          const crossed = (running && playheadMs >= syllable.learnerOnsetMs) || scriptDone;
          const isHit = Math.abs(syllable.lagMs) <= LAG_HIT_MS;
          return (
            <span
              key={\`d-\${i}\`}
              style={{
                ...styles.deltaCell,
                flexBasis: syllable.weight,
                flexGrow: syllable.weight,
                flexShrink: 1,
                ...(crossed ? (isHit ? styles.deltaCellHit : styles.deltaCellMiss) : null),
              }}>
              {syllable.lagMs === 0 ? '±0ms' : \`+\${syllable.lagMs}ms\`}
            </span>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// SHADOW METER — 72px hold-to-speak button. SVG ring (8px stroke) fills
// with the deterministic level script as the playhead advances; 8 native
// cadence ticks (2×6) sit ON the rim, learner ticks (2×6) 4px INSIDE the
// rim appear as onsets are crossed — green when |lag| ≤ 60ms, amber
// otherwise (lead/lag against reference cadence at a glance). Rest ring
// uses REST_EDGE (≥3:1 vs the blur dock surface — amendment math at the
// declaration). Pressed scales 0.96 (transform only; none under reduced
// motion via the .sso-press guard).
// ---------------------------------------------------------------------------

interface MeterProps {
  running: boolean;
  scriptDone: boolean;
  playheadMs: number;
  onHoldStart: () => void;
  onHoldEnd: () => void;
}

function ShadowMeter({running, scriptDone, playheadMs, onHoldStart, onHoldEnd}: MeterProps) {
  const progress = scriptDone ? 1 : Math.min(1, playheadMs / LEARNER_TOTAL_MS);
  const levelIndex = Math.min(METER_LEVELS.length - 1, Math.floor(playheadMs / SCRIPT_TICK_MS));
  const level = running ? METER_LEVELS[levelIndex] : 0;
  return (
    <button
      type="button"
      className="sso-btn sso-focusable sso-press"
      style={styles.meterBtn}
      aria-label="Hold to speak, or use Run attempt"
      onPointerDown={onHoldStart}
      onPointerUp={onHoldEnd}
      onPointerCancel={onHoldEnd}>
      <svg width={72} height={72} viewBox="0 0 72 72" fill="none" aria-hidden style={{display: 'block'}}>
        {/* Rest track — METER_TRACK, not a hairline token (meaningful
            rest ring vs the dock surface, ≥3:1 both schemes — math at
            the declaration; full opacity so the pair is honest). */}
        <circle cx={36} cy={36} r={30} stroke={METER_TRACK} strokeWidth={8} />
        <circle
          cx={36}
          cy={36}
          r={30}
          stroke={BRAND_ACCENT}
          strokeWidth={8}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - progress * 100}
          transform="rotate(-90 36 36)"
        />
        {/* Live level pulse — inner disc radius rides the 60ms level script. */}
        {running ? <circle cx={36} cy={36} r={10 + level * 14} fill={BRAND_TINT_12} /> : null}
        {/* Native cadence ticks ON the rim (angles onset/2400×360°). */}
        {NATIVE_TICK_DEG.map(deg => (
          <rect
            key={\`n-\${deg}\`}
            x={35}
            y={2}
            width={2}
            height={6}
            fill="var(--color-text-secondary)"
            transform={\`rotate(\${deg} 36 36)\`}
          />
        ))}
        {/* Learner ticks 4px inside the rim — appear as each onset is
            crossed; green |lag| ≤ 60ms, else amber. */}
        {LEARNER_TICK_DEG.map((deg, i) => {
          const visible = scriptDone || (running && playheadMs >= SYLLABLES[i].learnerOnsetMs);
          if (!visible) return null;
          const isHit = Math.abs(SYLLABLES[i].lagMs) <= LAG_HIT_MS;
          return (
            <rect
              key={\`l-\${deg}\`}
              x={35}
              y={10}
              width={2}
              height={6}
              fill={isHit ? GREEN_HIT : AMBER_MISS}
              transform={\`rotate(\${deg} 36 36)\`}
            />
          );
        })}
      </svg>
      <span style={styles.meterCenter}>
        <Icon icon={MicIcon} size="md" color="inherit" />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// ATTEMPT DIFF ROW — 72px history row (whole row a <button aria-expanded>):
// 48px waveform thumb (bar heights from the attempt's syllable scores),
// two-line stack, 20px chevron in a 44×44 hit. Expanded appends the 96px
// blame block: 8 score chips (≥75 green / <75 amber) + 'View phoneme
// detail' opening the sheet at LARGE on the attempt's weakest syllable.
// ---------------------------------------------------------------------------

interface AttemptRowProps {
  attempt: Attempt;
  expanded: boolean;
  isLast: boolean;
  onToggle: () => void;
  onViewDetail: (syllableIndex: number, opener: HTMLElement) => void;
}

function AttemptDiffRow({attempt, expanded, isLast, onToggle, onViewDetail}: AttemptRowProps) {
  const weakest = weakestIndex(attempt.syllableScores);
  return (
    <div>
      <button
        type="button"
        className="sso-btn sso-focusable"
        style={styles.attemptRowBtn}
        aria-expanded={expanded}
        aria-label={\`Attempt \${attempt.n}, scored \${attempt.score}\`}
        onClick={onToggle}>
        <svg width={48} height={48} viewBox="0 0 48 48" style={styles.waveThumb} aria-hidden>
          {attempt.syllableScores.map((score, i) => {
            const h = 6 + (score / 100) * 26;
            return (
              <rect
                key={i}
                x={6 + i * 4.8}
                y={24 - h / 2 + 12}
                width={3}
                height={h}
                rx={1.5}
                fill={score >= SCORE_HIT ? GREEN_HIT : AMBER_MISS}
                transform="translate(0 -12)"
              />
            );
          })}
        </svg>
        <span style={styles.attemptText}>
          <span style={styles.attemptPrimary}>
            Attempt {attempt.n} · {attempt.score}
          </span>
          <span style={styles.attemptSecondary}>
            Weakest: {SYLLABLES[weakest].syl} · {attempt.syllableScores[weakest]} — {attempt.ago}
          </span>
        </span>
        <span
          style={{
            ...styles.chevWrap,
            transform: expanded ? 'rotate(180deg)' : undefined,
          }}
          className="sso-anim"
          aria-hidden>
          <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
        </span>
      </button>
      {expanded ? (
        <div style={styles.detailBlock}>
          <div style={styles.chipGrid}>
            {attempt.syllableScores.map((score, i) => (
              <span
                key={i}
                style={{...styles.scoreChip, ...(score >= SCORE_HIT ? styles.chipHit : styles.chipMiss)}}
                aria-label={\`\${SYLLABLES[i].syl} scored \${score}\`}>
                {SYLLABLES[i].syl} {score}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="sso-btn sso-focusable"
            style={styles.viewDetailBtn}
            onClick={event => onViewDetail(weakest, event.currentTarget)}>
            View phoneme detail
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDividerDeep} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BREAKDOWN SHEET — two-detent sheet (MEDIUM 55% breakdown list / LARGE
// calc(100% − 56px) phoneme detail). Grabber is a real 'Resize sheet'
// button (click toggles detents; pointer drag between detents is garnish,
// >120px past medium closes); X, scrim, and Escape close; focus trapped,
// opened with preventScroll, restored to the opener on every close path.
// ---------------------------------------------------------------------------

interface SheetShellProps {
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function SheetShell({detent, onDetentChange, onClose, sheetRef, reducedMotion, children}: SheetShellProps) {
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
      aria-labelledby="sso-sheet-title"
      tabIndex={-1}
      className="sso-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease, height 240ms ease',
      }}>
      <button
        type="button"
        className="sso-btn sso-focusable"
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
        <h2 id="sso-sheet-title" style={styles.sheetTitle}>
          {PHRASE_ES}
        </h2>
        <button type="button" className="sso-btn sso-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// REVIEW ROW — 60px two-line row with swipe-to-reveal 'Done' (−72px brand
// block) and the MANDATORY trailing 44×44 ellipsis opening the same action
// as an anchored menu (undoOverConfirm: executes immediately + Undo toast,
// no confirm dialogs).
// ---------------------------------------------------------------------------

interface ReviewRowProps {
  phrase: Phrase;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onDone: () => void;
}

function ReviewRow({phrase, isSwipeOpen, isMenuOpen, isLast, reducedMotion, menuRef, onSwipeOpen, onSwipeClose, onToggleMenu, onDone}: ReviewRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const base = isSwipeOpen ? -72 : 0;
  const offset = dragX != null ? Math.max(-72, Math.min(0, base + dragX)) : base;

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

  return (
    <div style={styles.reviewOuter}>
      <div style={styles.reviewClip}>
        <button
          type="button"
          className="sso-btn"
          style={styles.doneAction}
          tabIndex={isSwipeOpen ? 0 : -1}
          aria-hidden={!isSwipeOpen}
          onClick={onDone}>
          <Icon icon={CheckIcon} size="md" color="inherit" />
          Done
        </button>
        <div
          style={{
            ...styles.reviewContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 240ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <span style={styles.reviewRowBtn}>
            <span style={styles.reviewPrimary}>{phrase.es}</span>
            <span style={styles.reviewSecondary}>
              {phrase.reviewedAgo} · Mastery {phrase.mastery}
            </span>
          </span>
          {phrase.id === 'ph_cafe' ? <span style={styles.readyChip}>Ready for review</span> : null}
          <button
            type="button"
            className="sso-btn sso-focusable"
            style={styles.iconBtn}
            aria-label={\`Review actions for \${phrase.es}\`}
            aria-expanded={isMenuOpen}
            onClick={event => {
              if (movedRef.current) {
                movedRef.current = false;
                return;
              }
              onToggleMenu(event.currentTarget);
            }}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Review actions for \${phrase.es}\`}
          style={{...styles.anchoredMenu, top: 48}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button type="button" role="menuitem" className="sso-btn sso-focusable" style={styles.menuRow} onClick={onDone}>
            <Icon icon={CheckIcon} size="sm" color="secondary" />
            <span style={{flex: 1, minWidth: 0}}>Mark done</span>
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: typeof MicIcon}> = [
  {id: 'drills', label: 'Drills', icon: MicIcon},
  {id: 'review', label: 'Review', icon: RepeatIcon},
  {id: 'phrasebook', label: 'Phrasebook', icon: BookOpenIcon},
  {id: 'profile', label: 'Profile', icon: UserIcon},
];

const NAV_TITLES: Record<TabId, string> = {
  drills: LESSON_TITLE,
  review: 'Review',
  phrasebook: 'Phrasebook',
  profile: 'Profile',
};

// Deterministic skeleton widths — primary 60/45/70%, secondary 40/55/30%.
const SKELETON_WIDTHS: Array<[string, string]> = [
  ['60%', '40%'],
  ['45%', '55%'],
  ['70%', '30%'],
];

export default function MobileSpeakingDrillCoachTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<SaysoState>(INITIAL);
  const update = useCallback((patch: Partial<SaysoState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);

  const toastSeqRef = useRef(0);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const reviewMenuRef = useRef<HTMLDivElement | null>(null);
  const scrollByTabRef = useRef<Partial<Record<TabId, number>>>({});

  // DERIVED AGGREGATES — all live from the rows they summarize.
  const attemptCount = state.attempts.length; // 4 → 5
  const best = state.attempts.reduce((max, a) => Math.max(max, a.score), 0); // 76 → 83
  const masterySum = state.phrasebook.reduce((sum, p) => sum + p.mastery, 0); // 892 → 899
  const masteredCount = state.phrasebook.filter(p => p.mastery >= 80).length; // 7 → 8
  const lessonPct = Math.round((masteredCount / state.phrasebook.length) * 100); // 58 → 67
  const avgPct = Math.round(masterySum / state.phrasebook.length); // 74 → 75
  const readyList = state.phrasebook.filter(p => p.ready && !state.reviewDoneIds.includes(p.id));
  const doneList = state.phrasebook.filter(p => state.reviewDoneIds.includes(p.id));
  const reviewBadge = readyList.length; // 2 → 3
  const totalAttempts = PROFILE_BASE_ATTEMPTS + attemptCount; // 217 → 218
  const latestAttempt = state.attempts[0];

  const toastPatch = (text: string, undoPhraseId: string | null = null) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undoPhraseId}};
  };
  const showToast = (text: string) => update(toastPatch(text));

  // (1) SCORE — the one scripted consequence chain: history insert (or
  // replace — idempotent), mastery 76→83, lesson 58%→67%, badge 2→3,
  // profile 217→218, toast. All other aggregates derive.
  const scoreAttempt = useCallback(() => {
    toastSeqRef.current += 1;
    setState(prev => ({
      ...prev,
      attempts: [SCRIPTED_ATTEMPT, ...prev.attempts.filter(a => a.id !== 'att_05')],
      phrasebook: prev.phrasebook.map(p =>
        p.id === 'ph_cafe' ? {...p, mastery: SCRIPTED_ATTEMPT.score, ready: true, reviewedAgo: 'Scored just now'} : p,
      ),
      running: false,
      scriptDone: true,
      playheadMs: LEARNER_TOTAL_MS,
      toast: {seq: toastSeqRef.current, text: 'Attempt scored 83 — best updated', undoPhraseId: null},
    }));
  }, []);

  // Scripted-run rAF loop — one loop maps elapsed → playheadMs capped at
  // 2520; reduced motion applies the terminal state in ONE commit with
  // zero rAF frames (stress fixture 8).
  useEffect(() => {
    if (!state.running) return undefined;
    if (reducedMotion) {
      scoreAttempt();
      return undefined;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const ms = Math.min(LEARNER_TOTAL_MS, now - start);
      setState(prev => (prev.running ? {...prev, playheadMs: ms} : prev));
      if (ms >= LEARNER_TOTAL_MS) scoreAttempt();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.running, reducedMotion, scoreAttempt]);

  // Native-playback sweep — 2400ms playhead line + native-cadence pill
  // tints; ends by itself. Reduced motion renders the static emphasis.
  useEffect(() => {
    if (!state.playingNative || reducedMotion) return undefined;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const ms = Math.min(NATIVE_TOTAL_MS, now - start);
      if (ms >= NATIVE_TOTAL_MS) {
        setState(prev => ({...prev, playingNative: false, nativeMs: 0}));
      } else {
        setState(prev => (prev.playingNative ? {...prev, nativeMs: ms} : prev));
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state.playingNative, reducedMotion]);

  // SIGNATURE — pointerdown on the meter and 'Run attempt' share one code
  // path; pointerup (hold) or script end (button) calls scoreAttempt().
  const startRun = () => {
    if (state.running) return;
    update({running: true, playheadMs: 0, scriptDone: false, playingNative: false, nativeMs: 0});
  };
  const endHold = () => {
    if (state.running && !reducedMotion) scoreAttempt();
  };
  const toggleNative = () => {
    if (state.running) return;
    if (state.playingNative) {
      update({playingNative: false, nativeMs: 0});
      return;
    }
    update({playingNative: true, nativeMs: 0, ...(reducedMotion ? toastPatch('Native audio 2.4s') : null)});
  };

  // SHEET lifecycle — openers: navBar attempt pill (breakdown), phraseCard
  // (breakdown), syllable pills (LARGE + syllable), history detail buttons
  // (LARGE + weakest). preventScroll on entry focus per the amendment.
  const openSheet = (syllable: number | null, detent: 'medium' | 'large', opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    update({sheetOpen: true, sheetDetent: detent, sheetSyllable: syllable, reviewMenuId: null, openSwipeId: null});
  };
  const closeSheet = () => {
    update({sheetOpen: false, sheetSyllable: null, sheetDetent: 'medium'});
    sheetOpenerRef.current?.focus();
  };
  useEffect(() => {
    if (state.sheetOpen) sheetRef.current?.focus({preventScroll: true});
  }, [state.sheetOpen]);
  useEffect(() => {
    if (state.reviewMenuId != null) reviewMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [state.reviewMenuId]);

  const closeReviewMenu = useCallback(() => {
    update({reviewMenuId: null});
    menuOpenerRef.current?.focus();
  }, [update]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setState(prev => {
        if (prev.reviewMenuId != null) {
          menuOpenerRef.current?.focus();
          return {...prev, reviewMenuId: null};
        }
        if (prev.sheetOpen) {
          sheetOpenerRef.current?.focus();
          return {...prev, sheetOpen: false, sheetSyllable: null, sheetDetent: 'medium'};
        }
        return prev;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // TABS — per-tab state persists (expanded rows, segmented selection,
  // scroll position); overlays close; re-tapping the active tab pops to
  // top (the one legal reset).
  const selectTab = (tab: TabId) => {
    if (tab === state.tab) {
      document.scrollingElement?.scrollTo({top: 0});
      return;
    }
    scrollByTabRef.current[state.tab] = document.scrollingElement?.scrollTop ?? 0;
    update({tab, sheetOpen: false, sheetSyllable: null, reviewMenuId: null, openSwipeId: null});
  };
  useEffect(() => {
    document.scrollingElement?.scrollTo({top: scrollByTabRef.current[state.tab] ?? 0});
  }, [state.tab]);

  // REVIEW — undoOverConfirm: Done executes immediately with an Undo
  // toast; Undo restores the exact derived list position.
  const markDone = (phrase: Phrase) => {
    setState(prev => ({
      ...prev,
      reviewDoneIds: [...prev.reviewDoneIds, phrase.id],
      reviewMenuId: null,
      openSwipeId: null,
      ...toastPatch(\`Reviewed — \${phrase.es}\`, phrase.id),
    }));
  };
  const undoDone = (phraseId: string) => {
    setState(prev => ({
      ...prev,
      reviewDoneIds: prev.reviewDoneIds.filter(id => id !== phraseId),
      ...toastPatch('Restored'),
    }));
  };
  const startRefresh = () => {
    update({reviewLoading: true, reviewUpdated: false, ...toastPatch('Loading')});
  };
  // Skeletons resolve on the NEXT user action — never a timer.
  const resolveRefreshOnAction = () => {
    if (state.reviewLoading) update({reviewLoading: false, reviewUpdated: true, ...toastPatch('Updated just now')});
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const detailIndex = state.sheetSyllable;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SAYSO_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <SaysoMark />
            <span style={styles.lessonPct} aria-label={\`Lesson \${lessonPct} percent mastered\`}>
              {lessonPct}%
            </span>
          </div>
          <h2 style={styles.navTitle}>{NAV_TITLES[state.tab]}</h2>
          <div style={styles.navTrailing}>
            {state.tab === 'drills' ? (
              <button
                type="button"
                className="sso-btn sso-focusable"
                style={styles.attemptPillHit}
                aria-label={\`Attempt \${attemptCount} — open phrase breakdown\`}
                onClick={event => openSheet(null, 'medium', event.currentTarget)}>
                <span style={styles.attemptPill}>Attempt {attemptCount}</span>
              </button>
            ) : state.tab === 'review' ? (
              <button
                type="button"
                className="sso-btn sso-focusable"
                style={styles.iconBtn}
                aria-label="Refresh review queue"
                onClick={startRefresh}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            ) : (
              <span style={{width: 44, height: 44}} aria-hidden />
            )}
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'drills' ? (
            <>
              <button
                type="button"
                className="sso-btn sso-focusable"
                style={styles.phraseCard}
                aria-label={\`\${PHRASE_ES} — open phrase breakdown\`}
                onClick={event => openSheet(null, 'medium', event.currentTarget)}>
                <span style={styles.phraseText}>
                  <h1 style={styles.phraseLine} className="sso-clamp2">
                    {PHRASE_ES}
                  </h1>
                  <span style={styles.phraseTranslation}>{PHRASE_EN}</span>
                  <span style={styles.phraseMeta}>
                    Attempt {attemptCount} · Best {best}
                  </span>
                </span>
                <MasteryRing value={best} animate={!reducedMotion} />
              </button>

              <SyllableStressStrip
                running={state.running}
                scriptDone={state.scriptDone}
                playheadMs={state.playheadMs}
                playingNative={state.playingNative}
                nativeMs={state.nativeMs}
                reducedMotion={reducedMotion}
                onPillTap={(index, opener) => openSheet(index, 'large', opener)}
              />

              <h2 style={styles.sectionHeader}>Attempts</h2>
              <div style={styles.listCard}>
                {state.attempts.map((attempt, index) => (
                  <AttemptDiffRow
                    key={attempt.id}
                    attempt={attempt}
                    expanded={state.expandedAttemptId === attempt.id}
                    isLast={index === state.attempts.length - 1}
                    onToggle={() =>
                      update({expandedAttemptId: state.expandedAttemptId === attempt.id ? null : attempt.id})
                    }
                    onViewDetail={(syllableIndex, opener) => openSheet(syllableIndex, 'large', opener)}
                  />
                ))}
              </div>
              <p style={styles.terminalCaption}>All {attemptCount} attempts</p>

              {/* Toast dock — sticky-in-flow above micDock+tabBar (172 =
                  64 tabBar + 96 dock + 12 gap); shell-absolute only while
                  the sheet locks the shell. */}
              {!state.sheetOpen ? (
                <div style={{...styles.toastDockSticky, bottom: 172}} aria-live="polite">
                  {state.toast != null ? (
                    <div key={state.toast.seq} style={{...styles.toast, ...styles.toastLifted}} className="sso-fade">
                      <span style={styles.toastText}>{state.toast.text}</span>
                      {state.toast.undoPhraseId != null ? (
                        <>
                          <span style={styles.toastRule} aria-hidden />
                          <button
                            type="button"
                            className="sso-btn sso-focusable"
                            style={styles.toastUndo}
                            onClick={() => undoDone(state.toast!.undoPhraseId!)}>
                            Undo
                          </button>
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div style={styles.micDock}>
                <div style={styles.dockSide}>
                  <button
                    type="button"
                    className="sso-btn sso-focusable"
                    style={styles.playBtn}
                    aria-label={state.playingNative ? 'Stop native audio' : 'Play native audio, 2.4 seconds'}
                    aria-pressed={state.playingNative}
                    onClick={toggleNative}>
                    <Icon icon={state.playingNative ? SquareIcon : PlayIcon} size="md" color="inherit" />
                  </button>
                  <span style={styles.dockLabel}>{state.playingNative ? 'Stop' : 'Play native'}</span>
                </div>
                <ShadowMeter
                  running={state.running}
                  scriptDone={state.scriptDone}
                  playheadMs={state.playheadMs}
                  onHoldStart={startRun}
                  onHoldEnd={endHold}
                />
                <div style={styles.dockSide}>
                  <button type="button" className="sso-btn sso-focusable" style={styles.runBtn} onClick={startRun}>
                    Run attempt
                  </button>
                  <span style={styles.dockLabel}>Scores this drill</span>
                </div>
              </div>
            </>
          ) : null}

          {state.tab === 'review' ? (
            <div onClickCapture={resolveRefreshOnAction}>
              <h1 className="sso-vh">Review queue</h1>
              <div style={styles.segTrack} role="radiogroup" aria-label="Review filter">
                {(['ready', 'done'] as const).map(filter => {
                  const active = state.reviewFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      className="sso-btn sso-focusable"
                      style={{...styles.segBtn, ...(active ? styles.segBtnActive : null)}}
                      onKeyDown={event => {
                        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                        event.preventDefault();
                        const next = filter === 'ready' ? 'done' : 'ready';
                        update({reviewFilter: next});
                      }}
                      onClick={() => update({reviewFilter: filter})}>
                      {filter === 'ready' ? \`Ready \${readyList.length}\` : \`Done \${doneList.length}\`}
                    </button>
                  );
                })}
              </div>
              <h2 style={styles.sectionHeader}>{state.reviewFilter === 'ready' ? 'Ready to review' : 'Reviewed'}</h2>
              {state.reviewLoading ? (
                <div style={styles.listCard} aria-busy="true">
                  {SKELETON_WIDTHS.map(([primary, secondary], index) => (
                    <div key={primary}>
                      <div style={styles.skelRow} aria-hidden>
                        <span style={{...styles.skelBar, width: primary}} />
                        <span style={{...styles.skelBar, width: secondary}} />
                      </div>
                      {index < SKELETON_WIDTHS.length - 1 ? <div style={styles.rowDivider} /> : null}
                    </div>
                  ))}
                </div>
              ) : state.reviewFilter === 'ready' ? (
                readyList.length > 0 ? (
                  <div style={styles.listCard}>
                    {readyList.map((phrase, index) => (
                      <ReviewRow
                        key={phrase.id}
                        phrase={phrase}
                        isSwipeOpen={state.openSwipeId === phrase.id}
                        isMenuOpen={state.reviewMenuId === phrase.id}
                        isLast={index === readyList.length - 1}
                        reducedMotion={reducedMotion}
                        menuRef={reviewMenuRef}
                        onSwipeOpen={() => update({openSwipeId: phrase.id, reviewMenuId: null})}
                        onSwipeClose={() => {
                          if (state.openSwipeId === phrase.id) update({openSwipeId: null});
                        }}
                        onToggleMenu={opener => {
                          menuOpenerRef.current = opener;
                          update({reviewMenuId: state.reviewMenuId === phrase.id ? null : phrase.id, openSwipeId: null});
                        }}
                        onDone={() => markDone(phrase)}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <span style={styles.emptyCircle}>
                      <Icon icon={RepeatIcon} size="lg" color="inherit" />
                    </span>
                    <h3 style={styles.emptyTitle}>Queue clear</h3>
                    <p style={styles.emptyBody}>Phrases you master appear here for review.</p>
                  </div>
                )
              ) : doneList.length > 0 ? (
                <div style={styles.listCard}>
                  {doneList.map((phrase, index) => (
                    <div key={phrase.id}>
                      <div style={{...styles.reviewRowBtn, width: 'auto', paddingInlineEnd: 16}}>
                        <span style={styles.reviewPrimary}>{phrase.es}</span>
                        <span style={styles.reviewSecondary}>Reviewed just now · Mastery {phrase.mastery}</span>
                      </div>
                      {index < doneList.length - 1 ? <div style={styles.rowDivider} /> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <span style={styles.emptyCircle}>
                    <Icon icon={CheckIcon} size="lg" color="inherit" />
                  </span>
                  <h3 style={styles.emptyTitle}>Nothing reviewed yet</h3>
                  <p style={styles.emptyBody}>Mark a ready phrase Done and it lands here.</p>
                </div>
              )}
              {state.reviewUpdated && !state.reviewLoading ? <p style={styles.terminalCaption}>Updated just now</p> : null}
            </div>
          ) : null}

          {state.tab === 'phrasebook' ? (
            <>
              <h1 className="sso-vh">Phrasebook</h1>
              <h2 style={styles.sectionHeader}>
                {LESSON_TITLE} · {avgPct}% avg
              </h2>
              <div style={styles.listCard}>
                {state.phrasebook.map((phrase, index) => (
                  <div key={phrase.id}>
                    <button
                      type="button"
                      className="sso-btn sso-focusable"
                      style={styles.phraseRowBtn}
                      aria-label={\`\${phrase.es}, mastery \${phrase.mastery} of 100\${phrase.id === 'ph_cafe' ? ' — open drill' : ''}\`}
                      onClick={() => {
                        if (phrase.id === 'ph_cafe') selectTab('drills');
                        else showToast(\`This demo drills one phrase — \${PHRASE_ES}\`);
                      }}>
                      <MasteryRing value={phrase.mastery} animate={false} />
                      <span style={styles.attemptText}>
                        <span style={styles.reviewPrimary}>{phrase.es}</span>
                        <span style={styles.reviewSecondary}>{phrase.en}</span>
                      </span>
                      <span style={styles.chevWrap} aria-hidden>
                        <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                      </span>
                    </button>
                    {index < state.phrasebook.length - 1 ? <div style={styles.rowDividerDeep} /> : null}
                  </div>
                ))}
              </div>
              <p style={styles.terminalCaption}>All {state.phrasebook.length} phrases</p>
            </>
          ) : null}

          {state.tab === 'profile' ? (
            <>
              <h1 className="sso-vh">Profile</h1>
              <div style={styles.profileGrid}>
                <div style={styles.statTile}>
                  <span style={styles.statValue}>
                    <Icon icon={FlameIcon} size="sm" color="warning" />
                    {PROFILE_STREAK_DAYS} days
                  </span>
                  <span style={styles.statLabel}>Streak</span>
                </div>
                <div style={styles.statTile}>
                  <span style={styles.statValue}>{totalAttempts}</span>
                  <span style={styles.statLabel}>Total attempts</span>
                </div>
                <div style={{...styles.statTile, gridColumn: 'span 2'}}>
                  <span style={styles.statValue}>{PROFILE_MINUTES} min</span>
                  <span style={styles.statLabel}>Practiced · updated just now</span>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Coaching</h2>
              <div style={styles.listCard}>
                <button
                  type="button"
                  className="sso-btn sso-focusable"
                  style={styles.utilRow}
                  onClick={() => showToast('Daily reminder stays at 7:30 PM in this demo')}>
                  <Icon icon={BellIcon} size="sm" color="secondary" />
                  <span style={styles.utilLabel}>Daily reminder</span>
                  <span style={styles.utilValue}>7:30 PM</span>
                  <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
                </button>
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  className="sso-btn sso-focusable"
                  style={styles.utilRow}
                  onClick={() => showToast('Voice model: Marisol (MX) — fixed in this demo')}>
                  <Icon icon={MicIcon} size="sm" color="secondary" />
                  <span style={styles.utilLabel}>Voice model</span>
                  <span style={styles.utilValue}>Marisol (MX)</span>
                  <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
                </button>
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  className="sso-btn sso-focusable"
                  style={styles.utilRow}
                  onClick={() => showToast('Settings open in the full app')}>
                  <Icon icon={SettingsIcon} size="sm" color="secondary" />
                  <span style={styles.utilLabel}>Settings</span>
                  <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
                </button>
              </div>
            </>
          ) : null}

          {/* Toast dock for non-drills tabs — sticky above the 64px tab
              bar (+12px gap). */}
          {state.tab !== 'drills' && !state.sheetOpen ? (
            <div style={{...styles.toastDockSticky, bottom: 76}} aria-live="polite">
              {state.toast != null ? (
                <div key={state.toast.seq} style={{...styles.toast, ...styles.toastLifted}} className="sso-fade">
                  <span style={styles.toastText}>{state.toast.text}</span>
                  {state.toast.undoPhraseId != null ? (
                    <>
                      <span style={styles.toastRule} aria-hidden />
                      <button
                        type="button"
                        className="sso-btn sso-focusable"
                        style={styles.toastUndo}
                        onClick={() => undoDone(state.toast!.undoPhraseId!)}>
                        Undo
                      </button>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div style={styles.bottomSpacer} />
        </main>

        <nav style={styles.tabBar} role="tablist" aria-label="Sayso sections">
          {TABS.map(tab => {
            const active = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="sso-btn sso-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onKeyDown={event => {
                  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                  event.preventDefault();
                  const index = TABS.findIndex(t => t.id === tab.id);
                  const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
                  selectTab(next.id);
                }}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'review' && reviewBadge > 0 ? <span style={styles.tabBadge}>{reviewBadge}</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Shell-absolute toast dock — ONLY while the sheet scroll-locks
            the shell (foundations amendment). */}
        {state.sheetOpen ? (
          <div style={styles.toastDockAbsolute} aria-live="polite">
            {state.toast != null ? (
              <div key={state.toast.seq} style={styles.toast} className="sso-fade">
                <span style={styles.toastText}>{state.toast.text}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {state.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {state.sheetOpen ? (
          <SheetShell
            detent={state.sheetDetent}
            onDetentChange={detent => update({sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}>
            {detailIndex == null ? (
              <div>
                {SYLLABLES.map((syllable, i) => (
                  <div key={syllable.syl + i}>
                    <button
                      type="button"
                      className="sso-btn sso-focusable"
                      style={styles.sylBreakRow}
                      aria-label={\`Syllable \${syllable.syl}, \${syllable.ipa}, \${syllable.nativeDurMs} milliseconds, latest score \${latestAttempt.syllableScores[i]} — open phoneme detail\`}
                      onClick={() => update({sheetSyllable: i, sheetDetent: 'large'})}>
                      <span style={styles.sylBreakName}>{syllable.syl}</span>
                      <span style={styles.sylBreakIpa}>{syllable.ipa}</span>
                      <span style={styles.sylBreakDur}>{syllable.nativeDurMs} ms</span>
                      <span
                        style={{
                          ...styles.scoreChip,
                          ...styles.sylBreakChip,
                          ...(latestAttempt.syllableScores[i] >= SCORE_HIT ? styles.chipHit : styles.chipMiss),
                        }}>
                        {latestAttempt.syllableScores[i]}
                      </span>
                    </button>
                    {i < SYLLABLES.length - 1 ? <div style={styles.rowDivider} /> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h3 style={styles.detailTitle}>{SYLLABLES[detailIndex].syl}</h3>
                <p style={styles.detailSub}>
                  {SYLLABLES[detailIndex].ipa} · native {SYLLABLES[detailIndex].nativeDurMs} ms ·{' '}
                  {SYLLABLES[detailIndex].lagMs === 0 ? 'on time' : \`+\${SYLLABLES[detailIndex].lagMs}ms late\`}
                </p>
                {PHONEMES[detailIndex].map(phoneme => (
                  <div
                    key={phoneme.ipa}
                    style={{
                      ...styles.phonemeChip,
                      ...(phoneme.score >= SCORE_HIT ? styles.chipHit : styles.chipMiss),
                    }}
                    aria-label={\`\${phoneme.ipa} scored \${phoneme.score}\`}>
                    <span style={styles.phonemeIpa}>{phoneme.ipa}</span>
                    <span style={styles.phonemeScore}>{phoneme.score}</span>
                  </div>
                ))}
                <p style={styles.tipLine}>{SYL_TIPS[detailIndex]}</p>
                <button
                  type="button"
                  className="sso-btn sso-focusable"
                  style={styles.backBtn}
                  onClick={() => update({sheetSyllable: null, sheetDetent: 'medium'})}>
                  Back to breakdown
                </button>
              </div>
            )}
          </SheetShell>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};