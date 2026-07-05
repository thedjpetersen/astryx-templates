var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Murmur voice-memo inbox for
 *   Dana Whitfield (@dana): 8 memos total, 5 inbox + 3 processed = 8 ✓.
 *   Inbox durations 47+84+33+125+83 = 372 s = 6:12 ✓; handled spans
 *   1+2+0+1+0 = 4 of totals 3+3+2+4+1 = 13 → '4 of 13 items mined' ✓
 *   (4 handled + 9 remaining = 13 ✓). Processed durations 70+52+138 =
 *   260 s = 4:20 ✓; chips 3+2+2 = 7 ✓ ('7 items extracted'), by type
 *   Task 3 + Idea 3 + Errand 1 = 7 ✓; tab badge = 3 processed memos.
 *   Hero m2 'Standup ramble' carries a 39-word transcript with explicit
 *   monotonic ms pairs (Okay[0,400] so[400,600] quick[600,1000]
 *   note[1000,1400] before[1400,1800] standup[1800,2400] …, last word
 *   ends 81600 < 84000) plus three fixture spans (A words 12–18 Task
 *   HANDLED, B words 21–27 Idea HANDLED, C words 31–36 Errand
 *   UNHANDLED → pill '2 of 3 mined' ✓) and three low-confidence words
 *   (14 'Sarah' 0.61 ↔ 'Sara' inside span A ✓, 23 'Priya' 0.72,
 *   33 'cleaning' 0.78 inside span C ✓). POST-EXTRACTION ARITHMETIC
 *   (asserted where derived): extracting C → Inbox 4 memos, 372−84 =
 *   288 s = 4:48, handled 4−2 = 2 of 13−3 = 10 → '2 of 10 items
 *   mined' ✓; Processed 4 memos, 260+84 = 344 s = 5:44, chips 7+3 =
 *   10 → '10 items extracted' ✓; badge 3→4 ✓. Undo restores all five
 *   numbers. No Date.now(), no Math.random(), no network media —
 *   waveforms are fixed fixture arrays (m2 hand-written 96 values) or
 *   id-hash-derived bar fields.
 * @output Murmur — Voice Memo Triage: a 390px MOBILE memo-mining inbox.
 *   NavBar (24px MurmurMark · fading 'Murmur' title · 44×44 capture
 *   button that only toasts 'Recording is disabled in this demo') over a
 *   52px large title + 24px derived stats caption, an inset listCard of
 *   five 110px memoRows (two-line transcript peek, progress pill, 44×44
 *   ellipsis → actionSheet with immediate delete + Undo), a 64px two-tab
 *   bar (Processed wears a live badge). Tapping a row opens a two-detent
 *   transcript sheet: medium locks a word-level TranscriptScrubRow to a
 *   WaveformBars playhead (block = role slider, ArrowLeft/Right word
 *   steps); large appends the extraction workspace — Mark-span range
 *   selection or per-sentence Extract buttons mint typed chips
 *   (Task/Idea/Errand), ConfidenceInk review rows cycle alternates and
 *   rewrite chip quotes in the same frame (chips store ranges, never
 *   copied strings), and extracting the final span slides the memo into
 *   Processed with a badge increment and permanent waveform highlight
 *   bands.
 * @position Page template; emitted by \`astryx template mobile-voice-memo-triage\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, sheet,
 *   actionSheet) are position:'absolute' INSIDE shell; position:fixed is
 *   banned. While the sheet or actionSheet is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} (main gets minHeight:0 +
 *   overflow:'hidden' so the tabBar stays on the visible screen) and
 *   restores on close. The toast is a STICKY-in-flow dock (height-0
 *   anchor, bottom:76 above the 64px tabBar + 12px) per the foundations
 *   amendment — never shell-absolute on a scrolling view.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16, none on last); no desktop
 *   Layout frames, no side asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Murmur magenta). Sanctioned non-brand literals, each
 *   with contrast math at the declaration: BRAND_FILL_TEXT, SCRUB_TINT
 *   (scrub highlight + span bands, ≥3:1 vs the ACTUAL card surface per
 *   the amendment), WAVE_REST (unplayed waveform bars — a meaningful
 *   rest-state fill, so NOT the hairline token; ≥3:1 vs card), SCRIM.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', blur surface,
 *   hairline ALWAYS ON — this template does not wire scroll-under;
 *   noted per contract); largeTitle 52px (28/700); statsCaption 24px
 *   (13/400 tabular); memoRow 110px fixed — 12 pad + 20 title line +
 *   4 + 36 two-line peek + 6 + 20 meta line + 12 pad = 110 ✓; tabBar
 *   64px sticky bottom z20 (24px icon over 11/500 label, 4px gap;
 *   badge 16px min-width pill, 10/600); sheet detents 55% medium /
 *   calc(100% − 56px) large, 24px grabber zone with 36×5 pill (real
 *   button), 52px sheet header, waveformBlock 96px (64px bars + 16px
 *   block padding), transportRow 56px (grows to 80px 2-row variant at
 *   ≤330px), scrub paragraph 16/400 lineHeight 28; sectionHeader
 *   13/600 uppercase 0.06em, 20px top / 8px bottom; spanChip 44px
 *   min-height; review rows 44px with 36px alternate pills. TYPE
 *   (Figtree via --font-family-body): 28/700 · 22/700 · 17/600 ·
 *   16/400 floor · 13/400 · 11/500 floor (the 10/600 badge digit is
 *   the chrome foundation's sanctioned exception); tabular-nums on
 *   every duration, timestamp, count, and badge. Touch: every target
 *   ≥44×44 with ≥8px clearance or merged full-row; every gesture has a
 *   visible button path (scrub → slider keys + ±5s + per-sentence
 *   Extract; sheet drag → clickable grabber + X; row swipe — none used;
 *   row actions → visible 44×44 ellipsis).
 *
 * Responsive contract:
 * - Fluid 320–430px: no width:390 literals; titles ellipsize against
 *   fixed-width durations (minWidth:0 flex children, flexShrink:0
 *   meta); statsCaption is single-line ellipsis (numbers repeat in the
 *   list); waveform is width:100% with a percentage playhead;
 *   transport wraps to the 2-row variant at ≤330px container width;
 *   typePicker flex-wraps below 340px; word spans overflowWrap
 *   'anywhere' (m7's 'onboarding-questionnaire' stress).
 * - Desktop stage (~1045px): measured via useElementWidth on the wrap
 *   (container width, not viewport) — at ≥720px the shell renders as a
 *   centered 430px phone column with hairline borderInline (house
 *   default); sticky chrome and absolute overlays stay inside because
 *   they anchor to shell.
 */

import {useEffect, useLayoutEffect, useReducer, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  CheckIcon,
  CheckSquareIcon,
  FastForwardIcon,
  HighlighterIcon,
  InboxIcon,
  LightbulbIcon,
  MicIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  ShoppingBagIcon,
  SkipBackIcon,
  Volume2Icon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Murmur magenta). #A21CAF on #FFFFFF ≈ 6.9:1
// (passes 4.5:1); #E879F9 on the dark card (~#1C1917 class) ≈ 7.4:1.
const BRAND_ACCENT = 'light-dark(#A21CAF, #E879F9)';
// Text/glyphs over a BRAND_ACCENT fill (badge digits, done pill, play
// button glyph, Mic glyph). Light: #FFFFFF on #A21CAF ≈ 6.9:1. Dark: white
// on #E879F9 fails (~1.4:1), so the dark side flips to deep plum —
// #4A044E on #E879F9 ≈ 7.0:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #4A044E)';
// Subtle brand wash for armed/selected control fills (12%) — decorative
// behind bordered controls only, never the sole state signal.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// SCRUB/SPAN TINT — the finger-scrub word highlight, the armed range band,
// and the waveform's permanent mined bands. Per the foundations amendment
// these are meaningful interactive fills, so they carry an explicit pair at
// ≥3:1 against their ACTUAL surface (the sheet/card): #CE6BD6 vs #FFFFFF ≈
// 3.1:1 ✓; #A344AC vs the ~#1C1917 dark card ≈ 3.3:1 ✓. Text keeps its own
// contrast on top: near-black primary on #CE6BD6 ≈ 5.5:1 ✓; near-white
// primary on #A344AC ≈ 4.8:1 ✓. (Spec's 'BRAND_ACCENT at 28%' band fails
// 3:1 on the light card ≈ 1.4:1 — deviation, solid ≥3:1 pair instead.)
const SCRUB_TINT = 'light-dark(#CE6BD6, #A344AC)';
// WAVE REST — unplayed waveform bars. A meaningful rest-state fill, so NOT
// the hairline token: #767680 on #FFFFFF ≈ 4.0:1 ✓ (≥3:1); #A1A1AA on the
// dark card ≈ 6.7:1 ✓.
const WAVE_REST = 'light-dark(#767680, #A1A1AA)';
// Sheet/actionSheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// two-line clamp, opacity-only garnish (capture pulse, mini ticker), and the
// reduced-motion guard that removes them entirely.
// ---------------------------------------------------------------------------

const MURMUR_CSS = \`
.mvm-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.mvm-btn:disabled { cursor: default; }
.mvm-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.mvm-fade { transition: opacity 200ms ease; }
.mvm-slide { transition: transform 240ms ease, opacity 240ms ease; }
.mvm-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.mvm-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@keyframes mvm-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.mvm-sheet-in { animation: mvm-sheet-in 240ms ease; }
/* Decorative capture-ring pulse — opacity-only garnish. */
@keyframes mvm-pulse {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.35; }
}
.mvm-pulse { animation: mvm-pulse 1.8s ease-in-out infinite; }
/* Mini playing ticker — opacity-only garnish on 9 static bars. */
@keyframes mvm-tick {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.mvm-tick { animation: mvm-tick 1.2s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .mvm-fade, .mvm-slide { transition: none; }
  .mvm-sheet-in { animation: none; }
  .mvm-pulse, .mvm-tick { animation: none; }
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
  // Scroll lock while the sheet/actionSheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // While locked, main clips so the sticky tabBar stays on screen.
  mainLocked: {minHeight: 0, overflow: 'hidden'},
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 targets
  // optically align to the 16px gutter. Hairline + blur ALWAYS ON.
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  // Compact 'Murmur' title — opacity 0 until the largeTitle scrolls under
  // (IntersectionObserver sentinel), opacity-only per reduced-motion law.
  navTitle: {fontSize: 17, fontWeight: 600, margin: 0, whiteSpace: 'nowrap'},
  // 44×44 capture button; the 28px circle is the visual.
  captureBtn: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 999},
  captureCircle: {
    position: 'relative',
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  // Decorative record ring — static 2px BRAND_ACCENT ring at 3px offset;
  // the pulse class is opacity-only garnish, removed under reduced motion.
  captureRing: {
    position: 'absolute',
    inset: -5,
    borderRadius: '50%',
    border: \`2px solid \${BRAND_ACCENT}\`,
    pointerEvents: 'none',
  },
  // LARGE TITLE — 52px row, 28/700 at the 16px gutter.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1},
  // STATS CAPTION — 24px, 13/400 secondary, tabular, single-line ellipsis
  // (tail-first; the numbers repeat inside the list).
  statsCaption: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Inset-grouped listCard — 16px gutter, 12px radius, hairline border.
  listCard: {
    marginInline: 16,
    marginTop: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // MEMO ROW — 110px fixed: 12 pad + 20 title + 4 + 36 peek + 6 + 20 meta +
  // 12 pad = 110 ✓. The whole row is ONE button (accessible name = title);
  // the 44×44 ellipsis is a separate absolute sibling at right:8, top
  // (110−44)/2 = 33, ≥8px clear of row text via paddingInlineEnd 56.
  memoRowOuter: {position: 'relative'},
  memoRow: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: 110,
    paddingBlock: 12,
    paddingInlineStart: 16,
    paddingInlineEnd: 56,
    background: 'var(--color-background-card)',
  },
  memoRowLeaving: {transform: 'translateX(-110%)', opacity: 0},
  rowTitleLine: {display: 'flex', alignItems: 'baseline', gap: 8, height: 20},
  rowTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowDuration: {
    flexShrink: 0,
    fontSize: 13,
    lineHeight: '20px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  rowPeek: {
    marginTop: 4,
    height: 36,
    fontSize: 13,
    lineHeight: '18px',
    color: 'var(--color-text-secondary)',
    textAlign: 'start',
  },
  rowMeta: {marginTop: 6, height: 20, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  progressPill: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Fully mined pill — BRAND_ACCENT fill; text = BRAND_FILL_TEXT (light
  // white on #A21CAF ≈ 6.9:1, dark #4A044E on #E879F9 ≈ 7.0:1).
  progressPillDone: {background: BRAND_ACCENT, color: BRAND_FILL_TEXT},
  rowDate: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  ellipsisBtn: {
    position: 'absolute',
    right: 8,
    top: 33,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Mini playing ticker — 9 bars, 20px tall, opacity-only animation;
  // replaced by a static Volume2 glyph under reduced motion.
  miniTicker: {display: 'inline-flex', alignItems: 'flex-end', gap: 1, height: 20, flexShrink: 0},
  miniTickerBar: {width: 2, borderRadius: 1, background: BRAND_ACCENT},
  // Terminal caption — 13/400 centered 16px below the card.
  terminalCaption: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // EMPTY STATE (true-empty inbox) — per emptyAndSkeleton anatomy.
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
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0'},
  // TAB BAR — 64px sticky bottom z20, blur + top hairline, 2 tabs flex:1.
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
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center', width: 24, height: 24},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  // Badge — 16px min-width BRAND_ACCENT pill, 10/600 BRAND_FILL_TEXT
  // (contrast math at BRAND_FILL_TEXT), offset top −4 / right −8.
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  // TOAST — sticky-in-flow height-0 anchor 76px above the shell bottom
  // (64px tabBar + 12px), per the foundations amendment; the single polite
  // live region. z30 sits below the scrims (z40+) by design.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
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
  // SHEET — scrim z40 + sheet z41, absolute inside shell; two detents.
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
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    textAlign: 'center',
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
  // The ONE legal inner scroller (inside the open sheet).
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 24},
  // WAVEFORM BLOCK — 96px: 64px bar field + 16px top/bottom padding.
  waveformBlock: {height: 96, paddingBlock: 16, paddingInline: 16},
  waveField: {
    position: 'relative',
    width: '100%',
    height: 64,
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    overflow: 'hidden',
    borderRadius: 4,
  },
  waveBandLayer: {position: 'absolute', inset: 0, pointerEvents: 'none'},
  waveBand: {position: 'absolute', top: 0, bottom: 0, borderRadius: 2, background: SCRUB_TINT, opacity: 0.5},
  wavePlayhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  wavePlayheadDot: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: BRAND_ACCENT,
  },
  // TRANSPORT — 56px single row (grows to 80px 2-row variant ≤330px).
  transportRow: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingInline: 16,
  },
  transportStacked: {
    height: 80,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 0,
    justifyContent: 'center',
  },
  transportLabelRow: {height: 20, display: 'flex', alignItems: 'center'},
  transportButtons: {display: 'flex', alignItems: 'center', gap: 16},
  elapsedLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  transportBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
  },
  playBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  // TRANSCRIPT SCRUB ROW — 16/400, lineHeight 28 for finger room.
  scrubPara: {
    padding: '8px 16px 0',
    fontSize: 16,
    lineHeight: '28px',
    touchAction: 'none',
    position: 'relative',
  },
  wordSpan: {borderRadius: 4, paddingInline: 1, overflowWrap: 'anywhere'},
  // Per-sentence Extract — visible non-gesture parity, 36px inline button.
  sentenceExtract: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 36,
    paddingInline: 10,
    marginInline: 6,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    verticalAlign: 'middle',
  },
  // Mark-span toggle — 36px secondary control above the paragraph.
  markSpanBar: {display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px 0'},
  markSpanToggle: {
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  markSpanToggleOn: {border: \`1px solid \${BRAND_ACCENT}\`, background: BRAND_TINT_12, color: BRAND_ACCENT},
  markSpanHint: {fontSize: 13, color: 'var(--color-text-secondary)', minWidth: 0},
  // TYPE PICKER — floats below the anchor line; wraps below 340px.
  typePicker: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 5,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  typeBtn: {
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  typeCancel: {
    width: 36,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    marginInlineStart: 'auto',
  },
  // SECTION HEADERS inside the sheet — 13/600 uppercase 0.06em.
  sheetSectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SPAN CHIP — 44px min-height, 12px radius.
  spanChip: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginInline: 16,
    marginBottom: 8,
    paddingInlineStart: 12,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  chipIcon: {flexShrink: 0, color: BRAND_ACCENT, display: 'grid', placeItems: 'center'},
  chipType: {flexShrink: 0, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)'},
  chipQuote: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipX: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  chipEmptyLine: {paddingInline: 16, fontSize: 13, color: 'var(--color-text-secondary)'},
  // REVIEW ROW — 44px utility row; word 16/400 + trailing 36px pill.
  reviewRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  reviewWord: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  altPill: {
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  reviewCheck: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // ACTION SHEET — scrim z40 + card stack z41, insetInline 16 bottom 16.
  actionSheetWrap: {position: 'absolute', insetInline: 16, bottom: 16, zIndex: 41},
  actionCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  actionContext: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    borderBottom: '1px solid var(--color-border)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actionRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
  },
  actionRowDestructive: {color: 'var(--color-error)'},
  actionRowRule: {height: 1, background: 'var(--color-border)'},
  actionCancelCard: {marginTop: 8},
  actionCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic by law. Dual fields ({ms, label}) everywhere.
// Identity const for the signed-in owner.
// ---------------------------------------------------------------------------

const OWNER = {name: 'Dana Whitfield', handle: 'dana'};

type SpanType = 'task' | 'idea' | 'errand';
type TabId = 'inbox' | 'processed';

interface Word {
  text: string; // clean word, punctuation split off into \`suffix\`
  suffix: string; // trailing punctuation rendered in the paragraph
  startMs: number;
  endMs: number;
  confidence: number; // < 0.8 renders as ConfidenceInk
  alternates: string[];
  altIndex: number; // 0 = original text, 1.. = alternates[altIndex - 1]
  confirmed: boolean;
}

interface Span {
  id: string;
  range: [number, number]; // inclusive word indices — chips derive quotes
  type: SpanType;
  handled: boolean;
  fixture: boolean; // fixture spans un-handle on chip X; minted ones remove
}

interface Memo {
  id: string;
  title: string;
  durationMs: number;
  durationLabel: string;
  dateLabel: string; // fixed fixture string — no clocks
  words: Word[];
  sentenceEnds: number[]; // word indices closing each sentence
  spans: Span[];
  wave: number[]; // fixed bar heights (6–58) — never Math.random
  processedToast: string; // fixture string (singular for m5 by law)
}

/** Split a transcript into clean words + trailing-punctuation suffixes. */
function tokenize(transcript: string): Array<{text: string; suffix: string}> {
  return transcript
    .split(/\\s+/)
    .filter(token => token.length > 0)
    .map(token => {
      const match = /^(.*?)([.,!?…]*)$/.exec(token);
      return {text: match?.[1] ?? token, suffix: match?.[2] ?? ''};
    });
}

/**
 * Deterministic word timings: weight by word length, spread across 96% of
 * the duration, rounded to 100 ms, strictly monotonic. Pure function of the
 * transcript + duration — no randomness anywhere.
 */
function spreadTimings(tokens: Array<{text: string}>, durationMs: number): Array<[number, number]> {
  const usable = Math.floor((durationMs * 0.96) / 100) * 100;
  const totalWeight = tokens.reduce((sum, token) => sum + token.text.length + 2, 0);
  const times: Array<[number, number]> = [];
  let cursor = 0;
  for (const token of tokens) {
    const weight = token.text.length + 2;
    const start = Math.round(cursor / 100) * 100;
    cursor += (weight / totalWeight) * usable;
    const end = Math.max(start + 100, Math.round(cursor / 100) * 100);
    times.push([start, end]);
    cursor = Math.max(cursor, end);
  }
  return times;
}

/** Normalize for quote matching (case/punctuation-insensitive). */
function norm(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

/** Locate a quote's inclusive word-index range inside a token list. */
function rangeOfQuote(tokens: Array<{text: string}>, quote: string): [number, number] {
  const quoteWords = quote.split(/\\s+/).map(norm);
  for (let i = 0; i <= tokens.length - quoteWords.length; i++) {
    let hit = true;
    for (let j = 0; j < quoteWords.length; j++) {
      if (norm(tokens[i + j].text) !== quoteWords[j]) {
        hit = false;
        break;
      }
    }
    if (hit) return [i, i + quoteWords.length - 1];
  }
  return [0, 0]; // unreachable with the shipped fixtures
}

/** Deterministic id-hash waveform (6–58 px) for non-hero memos. */
function waveFor(id: string, bars: number): number[] {
  let seed = 0;
  for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 9973;
  const heights: number[] = [];
  for (let i = 0; i < bars; i++) {
    seed = (seed * 137 + 71) % 9973;
    const swell = 14 + Math.round(18 * Math.abs(((i % 24) - 12) / 12));
    heights.push(6 + ((seed + swell * 3) % 53));
  }
  return heights;
}

interface ConfidenceEntry {
  confidence: number;
  alternates: string[];
}

interface SpanSeed {
  quote?: string;
  range?: [number, number];
  type: SpanType;
  handled: boolean;
}

function buildMemo(input: {
  id: string;
  title: string;
  durationMs: number;
  durationLabel: string;
  dateLabel: string;
  transcript: string;
  spans: SpanSeed[];
  confidence?: Record<number, ConfidenceEntry>;
  timings?: Array<[number, number]>;
  wave?: number[];
  processedToast: string;
}): Memo {
  const tokens = tokenize(input.transcript);
  const times = input.timings ?? spreadTimings(tokens, input.durationMs);
  const words: Word[] = tokens.map((token, index) => {
    const conf = input.confidence?.[index];
    return {
      text: token.text,
      suffix: token.suffix,
      startMs: times[index][0],
      endMs: times[index][1],
      confidence: conf?.confidence ?? 0.97,
      alternates: conf?.alternates ?? [],
      altIndex: 0,
      confirmed: false,
    };
  });
  const sentenceEnds = tokens
    .map((token, index) => (/[.!?…]/.test(token.suffix) ? index : -1))
    .filter(index => index >= 0);
  if (sentenceEnds[sentenceEnds.length - 1] !== tokens.length - 1) {
    sentenceEnds.push(tokens.length - 1);
  }
  const spans: Span[] = input.spans.map((seed, index) => ({
    id: \`\${input.id}-s\${index + 1}\`,
    range: seed.range ?? rangeOfQuote(tokens, seed.quote ?? ''),
    type: seed.type,
    handled: seed.handled,
    fixture: true,
  }));
  return {
    id: input.id,
    title: input.title,
    durationMs: input.durationMs,
    durationLabel: input.durationLabel,
    dateLabel: input.dateLabel,
    words,
    sentenceEnds,
    spans,
    wave: input.wave ?? waveFor(input.id, 96),
    processedToast: input.processedToast,
  };
}

// HERO m2 timings — 39 explicit monotonic pairs. Spec-given opening:
// Okay[0,400] so[400,600] quick[600,1000] note[1000,1400] before[1400,1800]
// standup[1800,2400]; the remaining 33 words run a fixed 2400 ms cadence,
// so the last word ends 2400 + 33×2400 = 81600 < 84000 ✓ (pure loop, no
// randomness).
const M2_TIMINGS: Array<[number, number]> = (() => {
  const head: Array<[number, number]> = [
    [0, 400],
    [400, 600],
    [600, 1000],
    [1000, 1400],
    [1400, 1800],
    [1800, 2400],
  ];
  for (let i = 6; i < 39; i++) {
    const start = 2400 + (i - 6) * 2400;
    head.push([start, start + 2400]);
  }
  return head;
})();

// HERO m2 waveform — fixed hand pattern, 96 values in 6–58.
const M2_WAVE: number[] = [
  8, 14, 22, 31, 40, 46, 52, 57, 50, 41, 33, 26, 18, 12, 9, 15, 24, 34, 44, 53,
  58, 51, 42, 30, 21, 13, 8, 11, 19, 28, 38, 47, 55, 48, 39, 29, 20, 14, 10, 16,
  25, 35, 45, 54, 57, 49, 40, 31, 22, 15, 9, 12, 20, 30, 41, 50, 56, 47, 37, 27,
  17, 11, 8, 13, 23, 33, 43, 52, 58, 50, 39, 28, 19, 12, 7, 10, 18, 27, 37, 46,
  54, 45, 36, 26, 16, 9, 6, 11, 21, 32, 42, 51, 55, 44, 24, 8,
];

// MEMO FIXTURES. Cross-check ledger (verified by hand): INBOX durations
// 47+84+33+125+83 = 372 s = 6:12 ✓; handled 1+2+0+1+0 = 4, totals
// 3+3+2+4+1 = 13 → '4 of 13 items mined' ✓ (4 + 9 remaining = 13 ✓).
// PROCESSED durations 70+52+138 = 260 s = 4:20 ✓; chips 3+2+2 = 7 ✓;
// by type Task 2+1 = 3, Idea 1+2 = 3, Errand 1 → 3+3+1 = 7 ✓; badge = 3.
// POST-EXTRACTION (extract m2's span C): Inbox 4 memos · 372−84 = 288 s =
// 4:48 · handled 4−2 = 2 of 13−3 = 10 → '2 of 10 items mined' ✓;
// Processed 4 memos · 260+84 = 344 s = 5:44 · chips 7+3 = 10 ✓; badge 4 ✓.
// Undo restores all five numbers exactly (snapshot restore, one assignment).
const MEMO_FIXTURES: Memo[] = [
  buildMemo({
    id: 'm1',
    title: 'Grocery run thoughts',
    durationMs: 47000,
    durationLabel: '0:47',
    dateLabel: 'Today 9:14 AM',
    transcript:
      'Heading out in a minute so brain dump. We are out of oat milk and the good coffee beans again. Grab butter for the banana bread on Saturday. Also compare the bulk rice prices while I am there.',
    spans: [
      {quote: 'grab butter for the banana bread', type: 'errand', handled: true},
      {quote: 'out of oat milk', type: 'errand', handled: false},
      {quote: 'compare the bulk rice prices', type: 'task', handled: false},
    ],
    processedToast: 'Memo processed — 3 items extracted',
  }),
  // THE HERO. Spans by explicit word-index range: A = [12,18] Task HANDLED
  // ('check whether Sarah booked the dentist Thursday' — word 14 'Sarah'
  // sits inside A ✓ so cycling it rewrites chip A's quote); B = [21,27]
  // Idea HANDLED (word 23 'Priya' inside ✓); C = [31,36] Errand UNHANDLED
  // (word 33 'cleaning' inside ✓ — a pre-extraction correction is quoted
  // correctly when C is extracted). 2 handled + 1 = 3 ✓ → pill '2 of 3
  // mined'. (Spec's sample quotes could not contain the spec's own
  // low-confidence words at the spec's indices; the index laws won —
  // deviation noted in the summary.)
  buildMemo({
    id: 'm2',
    title: 'Standup ramble',
    durationMs: 84000,
    durationLabel: '1:24',
    dateLabel: 'Today 8:02 AM',
    transcript:
      'Okay so quick note before standup this morning while everything is fresh. check whether Sarah booked the dentist Thursday and also pitch to Priya the onboarding flow idea. then remember to pick the cleaning up before six tonight. yeah.',
    spans: [
      {range: [12, 18], type: 'task', handled: true},
      {range: [21, 27], type: 'idea', handled: true},
      {range: [31, 36], type: 'errand', handled: false},
    ],
    confidence: {
      14: {confidence: 0.61, alternates: ['Sara']},
      // Spec listed ['Pria','Pria']; duplicate collapsed — deviation.
      23: {confidence: 0.72, alternates: ['Pria']},
      33: {confidence: 0.78, alternates: ['leaning']},
    },
    timings: M2_TIMINGS,
    wave: M2_WAVE,
    processedToast: 'Memo processed — 3 items extracted',
  }),
  buildMemo({
    id: 'm3',
    title: 'Gift idea',
    durationMs: 33000,
    durationLabel: '0:33',
    dateLabel: 'Yesterday 6:40 PM',
    transcript:
      'Mira mentioned twice she wants a linocut printing kit. Maybe pair it with that tiny desk lamp from the market.',
    spans: [
      {quote: 'a linocut printing kit', type: 'idea', handled: false},
      {quote: 'that tiny desk lamp from the market', type: 'idea', handled: false},
    ],
    processedToast: 'Memo processed — 2 items extracted',
  }),
  // Stress 1+2: 125 s / 68-word transcript (long inner scroll), long title
  // that must ellipsize against '2:05' at 320px without pushing the
  // ellipsis button.
  buildMemo({
    id: 'm4',
    title: 'Apartment walkthrough notes',
    durationMs: 125000,
    durationLabel: '2:05',
    dateLabel: 'Yesterday 1:12 PM',
    transcript:
      'Walking the two bedroom on Alder Street right now. The radiator in the corner hisses so ask about the boiler service records before signing anything. Water pressure in the shower is honestly great. Measure the alcove because the bookcase might not fit. The kitchen window faces the courtyard and gets real afternoon light. Ask whether the landlord repaints between tenants. Parking is street only which could get old.',
    spans: [
      {quote: 'ask about the boiler service records', type: 'task', handled: true},
      {quote: 'measure the alcove', type: 'task', handled: false},
      {quote: 'ask whether the landlord repaints between tenants', type: 'task', handled: false},
      {quote: 'parking is street only', type: 'idea', handled: false},
    ],
    processedToast: 'Memo processed — 4 items extracted',
  }),
  // Stress 5: single-span memo — extracting its one span processes it in a
  // single gesture; the SINGULAR toast string lives in the fixture.
  buildMemo({
    id: 'm5',
    title: 'Call back the plumber',
    durationMs: 83000,
    durationLabel: '1:23',
    dateLabel: 'Mon 7:55 AM',
    transcript:
      'The kitchen sink is dripping again under the trap. Call Reyes Plumbing back before noon and ask if Thursday works for the shutoff valve swap since the last quote is still good.',
    spans: [{quote: 'call Reyes Plumbing back before noon', type: 'task', handled: false}],
    processedToast: 'Memo processed — 1 item extracted',
  }),
  buildMemo({
    id: 'm6',
    title: 'Sprint retro voice notes',
    durationMs: 70000,
    durationLabel: '1:10',
    dateLabel: 'Sun 4:30 PM',
    transcript:
      'Retro takeaways while they are fresh. Write up the flaky deploy checklist for the wiki. Schedule a pairing hour with the new folks. Order more sticky notes for the board wall.',
    spans: [
      {quote: 'write up the flaky deploy checklist', type: 'task', handled: true},
      {quote: 'schedule a pairing hour', type: 'task', handled: true},
      {quote: 'order more sticky notes', type: 'errand', handled: true},
    ],
    processedToast: 'Memo processed — 3 items extracted',
  }),
  // Stress 3: 'onboarding-questionnaire' (24 chars) — overflowWrap
  // 'anywhere' in the paragraph, ellipsis in its chip quote.
  buildMemo({
    id: 'm7',
    title: 'Shower thought — onboarding',
    durationMs: 52000,
    durationLabel: '0:52',
    dateLabel: 'Sat 9:05 AM',
    transcript:
      'What if the onboarding-questionnaire became three tiny cards instead of one giant form. Sketch the card flow tonight and show Priya a rough cut.',
    spans: [
      {quote: 'the onboarding-questionnaire became three tiny cards', type: 'idea', handled: true},
      {quote: 'sketch the card flow tonight', type: 'task', handled: true},
    ],
    processedToast: 'Memo processed — 2 items extracted',
  }),
  buildMemo({
    id: 'm8',
    title: 'Sunday planning',
    durationMs: 138000,
    durationLabel: '2:18',
    dateLabel: 'Sun 11:20 AM',
    transcript:
      'Slow Sunday so just thinking out loud. A monthly no-phone hike with the climbing group could be the reset ritual. Batch cooking on Sunday nights might actually stick if the menu repeats weekly.',
    spans: [
      {quote: 'a monthly no-phone hike with the climbing group', type: 'idea', handled: true},
      {quote: 'batch cooking on Sunday nights', type: 'idea', handled: true},
    ],
    processedToast: 'Memo processed — 2 items extracted',
  }),
];

const INBOX_IDS = ['m1', 'm2', 'm3', 'm4', 'm5'];
const PROCESSED_IDS = ['m6', 'm7', 'm8'];

const SPAN_TYPE_META: Record<SpanType, {label: string; icon: typeof CheckSquareIcon}> = {
  task: {label: 'Task', icon: CheckSquareIcon},
  idea: {label: 'Idea', icon: LightbulbIcon},
  errand: {label: 'Errand', icon: ShoppingBagIcon},
};

// ---------------------------------------------------------------------------
// FORMATTERS + DERIVATIONS — pure; badges and captions DERIVE from the
// arrays (never stored counters), so they cannot drift.
// ---------------------------------------------------------------------------

/** ms → 'm:ss' ('84000 → 1:24', totals too: 372000 → 6:12). */
function fmtClock(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return \`\${minutes}:\${String(seconds).padStart(2, '0')}\`;
}

function memosLabel(count: number): string {
  return count === 1 ? '1 memo' : \`\${count} memos\`;
}

function itemsExtractedLabel(count: number): string {
  return count === 1 ? '1 item extracted' : \`\${count} items extracted\`;
}

/** Current display text of a word (alternate-aware). */
function displayWord(word: Word): string {
  return word.altIndex === 0 ? word.text : word.alternates[word.altIndex - 1];
}

/** Chip quotes derive from the words array at render — never copied. */
function quoteOf(memo: Memo, span: Span): string {
  return memo.words
    .slice(span.range[0], span.range[1] + 1)
    .map(displayWord)
    .join(' ');
}

function minedOf(memo: Memo): number {
  return memo.spans.filter(span => span.handled).length;
}

function spanStartMs(memo: Memo, span: Span): number {
  return memo.words[span.range[0]].startMs;
}

function spanEndMs(memo: Memo, span: Span): number {
  return memo.words[span.range[1]].endMs;
}

/** Word index containing (or nearest before) a position. */
function wordIndexAt(memo: Memo, positionMs: number): number {
  let index = 0;
  for (let i = 0; i < memo.words.length; i++) {
    if (memo.words[i].startMs <= positionMs) index = i;
    else break;
  }
  return index;
}

function uncertainIndices(memo: Memo): number[] {
  return memo.words
    .map((word, index) => (word.confidence < 0.8 && !word.confirmed ? index : -1))
    .filter(index => index >= 0);
}

/** First-two-lines transcript peek: the raw transcript, clamped by CSS. */
function peekOf(memo: Memo): string {
  return memo.words.map(word => displayWord(word) + word.suffix).join(' ');
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useReducer; every surface dispatches typed actions.
// Zero setTimeout/Date.now/Math.random in state paths; the only rAF is the
// presentational playhead/elapsed label.
// ---------------------------------------------------------------------------

interface Snapshot {
  memos: Record<string, Memo>;
  order: Record<TabId, string[]>;
}

interface TriageState {
  tab: TabId;
  memos: Record<string, Memo>;
  order: Record<TabId, string[]>;
  playback: {memoId: string; positionMs: number; playing: boolean} | null;
  sheet: {memoId: string; detent: 'medium' | 'large'} | null;
  armed: {on: boolean; anchor: number | null; range: [number, number] | null};
  openActionSheet: string | null;
  toast: {seq: number; msg: string; undo: Snapshot | null} | null;
  // Row leaving the inbox with a slide-out — kept at its old index until
  // the transition end event (event-driven, not a timer) finalizes it.
  leaving: {id: string; index: number} | null;
  scrollByTab: Record<TabId, number>;
}

const ARMED_OFF: TriageState['armed'] = {on: false, anchor: null, range: null};

const INITIAL_STATE: TriageState = {
  tab: 'inbox',
  memos: Object.fromEntries(MEMO_FIXTURES.map(memo => [memo.id, memo])),
  order: {inbox: INBOX_IDS, processed: PROCESSED_IDS},
  playback: null,
  sheet: null,
  armed: ARMED_OFF,
  openActionSheet: null,
  toast: null,
  leaving: null,
  scrollByTab: {inbox: 0, processed: 0},
};

type Action =
  | {type: 'SET_TAB'; tab: TabId; scrollTop: number}
  | {type: 'SAVE_SCROLL'; tab: TabId; scrollTop: number}
  | {type: 'OPEN_SHEET'; memoId: string}
  | {type: 'CLOSE_SHEET'}
  | {type: 'SET_DETENT'; detent: 'medium' | 'large'}
  | {type: 'PLAY'; memoId: string; fromMs: number}
  | {type: 'PAUSE'}
  | {type: 'SCRUB'; memoId: string; positionMs: number}
  | {type: 'NUDGE'; memoId: string; deltaMs: number}
  | {type: 'ARM_TOGGLE'}
  | {type: 'SET_ANCHOR'; index: number}
  | {type: 'SET_RANGE'; a: number; b: number}
  | {type: 'CANCEL_ARM'}
  | {type: 'EXTRACT'; memoId: string; range: [number, number]; spanType: SpanType}
  | {type: 'UNEXTRACT'; memoId: string; spanId: string}
  | {type: 'CYCLE_WORD'; memoId: string; index: number}
  | {type: 'CONFIRM_WORD'; memoId: string; index: number}
  | {type: 'OPEN_ACTION'; memoId: string}
  | {type: 'CLOSE_ACTION'}
  | {type: 'DELETE_MEMO'; memoId: string}
  | {type: 'MARK_PROCESSED'; memoId: string}
  | {type: 'FINALIZE_LEAVE'}
  | {type: 'UNDO'}
  | {type: 'TOAST'; msg: string};

let toastSeq = 1;

function snapshotOf(state: TriageState): Snapshot {
  return {
    memos: state.memos,
    order: {inbox: [...state.order.inbox], processed: [...state.order.processed]},
  };
}

function withToast(state: TriageState, msg: string, undo: Snapshot | null): TriageState {
  return {...state, toast: {seq: toastSeq++, msg, undo}};
}

function patchMemo(state: TriageState, memoId: string, patch: Partial<Memo>): TriageState {
  return {...state, memos: {...state.memos, [memoId]: {...state.memos[memoId], ...patch}}};
}

function reducer(state: TriageState, action: Action): TriageState {
  switch (action.type) {
    case 'SET_TAB': {
      if (action.tab === state.tab) return state; // re-tap handled by caller
      // Overlays belong to their moment: sheet/actionSheet/armed close on a
      // tab switch; scroll persists per tab; the toast dock persists.
      return {
        ...state,
        tab: action.tab,
        sheet: null,
        openActionSheet: null,
        armed: ARMED_OFF,
        scrollByTab: {...state.scrollByTab, [state.tab]: action.scrollTop},
      };
    }
    case 'SAVE_SCROLL':
      return {...state, scrollByTab: {...state.scrollByTab, [action.tab]: action.scrollTop}};
    case 'OPEN_SHEET': {
      // PLAYBACK EXCLUSIVITY: opening another memo's sheet stops the
      // current playback in the same commit (its row ticker freezes).
      const playback =
        state.playback != null && state.playback.memoId !== action.memoId ? null : state.playback;
      return {
        ...state,
        playback,
        sheet: {memoId: action.memoId, detent: 'medium'},
        openActionSheet: null,
        armed: ARMED_OFF,
      };
    }
    case 'CLOSE_SHEET':
      return {...state, sheet: null, armed: ARMED_OFF};
    case 'SET_DETENT':
      return state.sheet == null ? state : {...state, sheet: {...state.sheet, detent: action.detent}};
    case 'PLAY':
      return {...state, playback: {memoId: action.memoId, positionMs: action.fromMs, playing: true}};
    case 'PAUSE':
      // Deterministic law: pause returns the committed position (the last
      // user-set word boundary) — the animated playhead is presentation.
      return state.playback == null ? state : {...state, playback: {...state.playback, playing: false}};
    case 'SCRUB':
      return {...state, playback: {memoId: action.memoId, positionMs: action.positionMs, playing: false}};
    case 'NUDGE': {
      const memo = state.memos[action.memoId];
      const current =
        state.playback != null && state.playback.memoId === action.memoId ? state.playback.positionMs : 0;
      const clamped = Math.min(Math.max(current + action.deltaMs, 0), memo.durationMs);
      // Snap DISPLAY to the containing word's boundary (valuetext echoes it).
      const snapped = memo.words[wordIndexAt(memo, clamped)].startMs;
      const playing = state.playback?.playing ?? false;
      return {...state, playback: {memoId: action.memoId, positionMs: snapped, playing}};
    }
    case 'ARM_TOGGLE':
      return {...state, armed: state.armed.on ? ARMED_OFF : {on: true, anchor: null, range: null}};
    case 'SET_ANCHOR':
      return {...state, armed: {on: true, anchor: action.index, range: null}};
    case 'SET_RANGE':
      return {
        ...state,
        armed: {on: true, anchor: state.armed.anchor, range: [Math.min(action.a, action.b), Math.max(action.a, action.b)]},
      };
    case 'CANCEL_ARM':
      return {...state, armed: ARMED_OFF};
    case 'EXTRACT': {
      const memo = state.memos[action.memoId];
      const [lo, hi] = action.range;
      if (lo < 0 || hi >= memo.words.length || hi < lo) return state;
      const undo = snapshotOf(state);
      // An unhandled fixture span overlapped by the selection is MARKED
      // handled (its planned range survives, the picked type wins) — this
      // keeps the 'n of m mined' law exact; otherwise a new span is minted
      // (n and m advance together).
      const overlapIndex = memo.spans.findIndex(
        span => !span.handled && span.range[0] <= hi && span.range[1] >= lo,
      );
      const spans =
        overlapIndex >= 0
          ? memo.spans.map((span, index) =>
              index === overlapIndex ? {...span, handled: true, type: action.spanType} : span,
            )
          : [
              ...memo.spans,
              {
                id: \`\${memo.id}-u\${memo.spans.length + 1}\`,
                range: action.range,
                type: action.spanType,
                handled: true,
                fixture: false,
              },
            ];
      let next = patchMemo(state, action.memoId, {spans});
      next = {...next, armed: ARMED_OFF};
      const allHandled = spans.every(span => span.handled);
      if (allHandled && state.order.inbox.includes(action.memoId)) {
        // The same action processes the memo: id moves between order
        // arrays (badge + both captions DERIVE from them), the sheet
        // closes, and the row slides out from its old index (leaving ghost
        // finalized on transitionend, fade under reduced motion).
        const index = state.order.inbox.indexOf(action.memoId);
        next = {
          ...next,
          order: {
            inbox: state.order.inbox.filter(id => id !== action.memoId),
            processed: [action.memoId, ...state.order.processed],
          },
          sheet: null,
          playback: next.playback?.memoId === action.memoId ? null : next.playback,
          leaving: {id: action.memoId, index},
        };
        return withToast(next, state.memos[action.memoId].processedToast, undo);
      }
      return withToast(next, 'Span extracted', undo);
    }
    case 'UNEXTRACT': {
      const memo = state.memos[action.memoId];
      const target = memo.spans.find(span => span.id === action.spanId);
      if (target == null) return state;
      const undo = snapshotOf(state);
      const spans = target.fixture
        ? memo.spans.map(span => (span.id === action.spanId ? {...span, handled: false} : span))
        : memo.spans.filter(span => span.id !== action.spanId);
      let next = patchMemo(state, action.memoId, {spans});
      if (state.order.processed.includes(action.memoId)) {
        // A processed memo with an un-extracted span returns to the inbox.
        next = {
          ...next,
          order: {
            inbox: [action.memoId, ...state.order.inbox],
            processed: state.order.processed.filter(id => id !== action.memoId),
          },
        };
        return withToast(next, 'Span removed — memo back in Inbox', undo);
      }
      return withToast(next, 'Span removed', undo);
    }
    case 'CYCLE_WORD': {
      const memo = state.memos[action.memoId];
      const word = memo.words[action.index];
      if (word.alternates.length === 0) return state;
      const altIndex = (word.altIndex + 1) % (word.alternates.length + 1);
      // Cycling all the way back to the original confirms the word.
      const confirmed = word.confirmed || altIndex === 0;
      const words = memo.words.map((entry, index) =>
        index === action.index ? {...entry, altIndex, confirmed} : entry,
      );
      // Chip quotes re-derive from \`words\` at render — propagation is free.
      return patchMemo(state, action.memoId, {words});
    }
    case 'CONFIRM_WORD': {
      const memo = state.memos[action.memoId];
      const word = memo.words[action.index];
      const words = memo.words.map((entry, index) =>
        index === action.index ? {...entry, confirmed: true} : entry,
      );
      const next = patchMemo(state, action.memoId, {words});
      // Announced ONCE through the single polite dock — only when the text
      // actually changed from the original transcript.
      return word.altIndex !== 0 ? withToast(next, 'Updated 1 word', null) : next;
    }
    case 'OPEN_ACTION':
      return {...state, openActionSheet: action.memoId};
    case 'CLOSE_ACTION':
      return {...state, openActionSheet: null};
    case 'DELETE_MEMO': {
      // undoOverConfirm: delete executes IMMEDIATELY — never a confirm.
      const undo = snapshotOf(state);
      const next: TriageState = {
        ...state,
        order: {
          inbox: state.order.inbox.filter(id => id !== action.memoId),
          processed: state.order.processed.filter(id => id !== action.memoId),
        },
        openActionSheet: null,
        sheet: state.sheet?.memoId === action.memoId ? null : state.sheet,
        playback: state.playback?.memoId === action.memoId ? null : state.playback,
        leaving: null,
      };
      return withToast(next, 'Memo deleted', undo);
    }
    case 'MARK_PROCESSED': {
      if (!state.order.inbox.includes(action.memoId)) return state;
      const undo = snapshotOf(state);
      const handled = minedOf(state.memos[action.memoId]);
      const next: TriageState = {
        ...state,
        order: {
          inbox: state.order.inbox.filter(id => id !== action.memoId),
          processed: [action.memoId, ...state.order.processed],
        },
        openActionSheet: null,
        leaving: null,
      };
      return withToast(next, \`Memo processed — \${itemsExtractedLabel(handled)}\`, undo);
    }
    case 'FINALIZE_LEAVE':
      return state.leaving == null ? state : {...state, leaving: null};
    case 'UNDO': {
      if (state.toast?.undo == null) return state;
      // One assignment restores memos + order: the row returns to its
      // exact former index; scroll and tab untouched.
      return withToast(
        {...state, memos: state.toast.undo.memos, order: state.toast.undo.order, leaving: null},
        'Restored',
        null,
      );
    }
    case 'TOAST':
      return withToast(state, action.msg, null);
    default:
      return state;
  }
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

// Focus trap helper — sheets/actionSheets trap Tab while open.
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

/** Nearest scrollable ancestor (the demo's .preview-wrap owns page scroll). */
function scrollerOf(element: HTMLElement | null): HTMLElement | null {
  let node = element?.parentElement ?? null;
  while (node != null) {
    const overflowY = getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// MURMUR MARK — four waveform bars (3px wide, 2px gaps = 17px) at stepped
// heights 8/16/20/12 baseline-aligned in a 24×24 box, 1.5px radius tops —
// a single opening quotation mark built from waveform bars. Text-primary by
// default; BRAND_ACCENT variant in the navBar.
// ---------------------------------------------------------------------------

function MurmurMark({accent = false}: {accent?: boolean}) {
  const heights = [8, 16, 20, 12];
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden
      style={{color: accent ? BRAND_ACCENT : 'var(--color-text-primary)'}}>
      {heights.map((height, index) => (
        <rect
          key={index}
          x={3.5 + index * 5}
          y={22 - height}
          width={3}
          height={height}
          rx={1.5}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MINI TICKER — 9 fixed bars, 20px tall, opacity-only garnish in the
// playing memoRow; replaced by a static Volume2 glyph under reduced motion.
// ---------------------------------------------------------------------------

const TICKER_HEIGHTS = [8, 14, 18, 12, 16, 20, 10, 15, 9];

function MiniTicker({reduced}: {reduced: boolean}) {
  if (reduced) {
    return (
      <span style={{color: BRAND_ACCENT, display: 'inline-flex', flexShrink: 0}} aria-hidden>
        <Icon icon={Volume2Icon} size="sm" />
      </span>
    );
  }
  return (
    <span style={styles.miniTicker} aria-hidden>
      {TICKER_HEIGHTS.map((height, index) => (
        <span
          key={index}
          className="mvm-tick"
          style={{...styles.miniTickerBar, height, animationDelay: \`\${index * 0.12}s\`}}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// PLAYHEAD CLOCK — rAF-driven elapsed label, presentation only (never
// writes the state owner). Under reduced motion it sits frozen at the
// committed scrub position.
// ---------------------------------------------------------------------------

interface PlayheadClockProps {
  positionMs: number;
  durationMs: number;
  playing: boolean;
  reduced: boolean;
}

function PlayheadClock({positionMs, durationMs, playing, reduced}: PlayheadClockProps) {
  const [display, setDisplay] = useState(positionMs);
  useEffect(() => {
    setDisplay(positionMs);
    if (!playing || reduced) return undefined;
    let raf = 0;
    let t0: number | null = null;
    const tick = (t: number) => {
      if (t0 == null) t0 = t;
      const next = Math.min(positionMs + (t - t0), durationMs);
      setDisplay(next);
      if (next < durationMs) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [positionMs, durationMs, playing, reduced]);
  return (
    <span style={styles.elapsedLabel}>
      {fmtClock(display)} / {fmtClock(durationMs)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// WAVEFORM BARS — deterministic bar field. Rest bars WAVE_REST (≥3:1 pair,
// see COLOR LITERALS), played bars text-primary, mined spans as permanent
// SCRUB_TINT bands, 2px BRAND_ACCENT playhead with an 8px grab dot. The
// BLOCK is the slider (role='slider'): ArrowLeft/Right step word-by-word,
// Home/End jump to first/last word; the playhead itself is not a control.
// While playing (and not reduced) the playhead runs a linear transform
// animation to the end — presentation only; the reducer keeps the committed
// position.
// ---------------------------------------------------------------------------

interface WaveformBarsProps {
  memo: Memo;
  positionMs: number;
  playing: boolean;
  reduced: boolean;
  onScrub: (positionMs: number) => void;
  onPlayFrom: (fromMs: number) => void;
}

function WaveformBars({memo, positionMs, playing, reduced, onScrub, onPlayFrom}: WaveformBarsProps) {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const fieldWidth = useElementWidth(fieldRef);
  const [anim, setAnim] = useState(false);
  useEffect(() => {
    setAnim(false);
    if (!playing || reduced) return undefined;
    const raf = requestAnimationFrame(() => setAnim(true));
    return () => cancelAnimationFrame(raf);
  }, [playing, positionMs, reduced]);

  const frac = memo.durationMs > 0 ? positionMs / memo.durationMs : 0;
  const wordIdx = wordIndexAt(memo, positionMs);
  const remaining = Math.max(memo.durationMs - positionMs, 0);
  const bands = memo.spans.filter(span => span.handled);

  const msFromPointer = (event: ReactPointerEvent<HTMLDivElement>): number => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / Math.max(rect.width, 1), 0), 1);
    const raw = ratio * memo.durationMs;
    return memo.words[wordIndexAt(memo, raw)].startMs; // snap to word start
  };

  const stepTo = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), memo.words.length - 1);
    onScrub(memo.words[clamped].startMs);
  };

  return (
    <div style={styles.waveformBlock}>
      <div
        ref={fieldRef}
        className="mvm-focusable"
        style={styles.waveField}
        role="slider"
        tabIndex={0}
        aria-label="Transcript position"
        aria-valuemin={0}
        aria-valuemax={memo.durationMs}
        aria-valuenow={positionMs}
        aria-valuetext={\`\${fmtClock(positionMs)} — '\${displayWord(memo.words[wordIdx])}'\`}
        onPointerDown={event => {
          event.currentTarget.setPointerCapture(event.pointerId);
          onScrub(msFromPointer(event));
        }}
        onPointerMove={event => {
          if (event.buttons > 0) onScrub(msFromPointer(event));
        }}
        onPointerUp={event => onPlayFrom(msFromPointer(event))}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            stepTo(wordIdx - 1);
          } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            stepTo(wordIdx + 1);
          } else if (event.key === 'Home') {
            event.preventDefault();
            stepTo(0);
          } else if (event.key === 'End') {
            event.preventDefault();
            stepTo(memo.words.length - 1);
          }
        }}>
        {memo.wave.map((height, index) => {
          const barMs = (index / memo.wave.length) * memo.durationMs;
          const played = barMs <= positionMs;
          return (
            <span
              key={index}
              style={{
                flex: '1 0 1px',
                height,
                background: played ? 'var(--color-text-primary)' : WAVE_REST,
                borderRadius: '1.5px 1.5px 0 0',
              }}
            />
          );
        })}
        <span style={styles.waveBandLayer} aria-hidden>
          {bands.map(span => {
            const left = (spanStartMs(memo, span) / memo.durationMs) * 100;
            const width = ((spanEndMs(memo, span) - spanStartMs(memo, span)) / memo.durationMs) * 100;
            return <span key={span.id} style={{...styles.waveBand, left: \`\${left}%\`, width: \`\${width}%\`}} />;
          })}
          <span
            style={{
              ...styles.wavePlayhead,
              left: 0,
              transform: \`translateX(\${(anim ? 1 : frac) * fieldWidth}px)\`,
              transition: anim ? \`transform \${remaining}ms linear\` : 'none',
            }}>
            <span style={styles.wavePlayheadDot} />
          </span>
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TRANSCRIPT SCRUB ROW — inline word spans with data-start/end from the
// fixture. Pointer path: pointerdown/move hit-tests elementFromPoint; the
// word under the finger takes the SCRUB_TINT highlight and the playhead
// jumps to its startMs; pointerup plays from the word boundary. While the
// Mark-span toggle is armed the same machinery routes to anchor/range
// selection instead. Low-confidence words render as ConfidenceInk
// (secondary ink + dotted underline); an inline tap cycles alternates —
// garnish; the 44px review rows are the compliant path.
// ---------------------------------------------------------------------------

interface ScrubRowProps {
  memo: Memo;
  positionMs: number;
  hasPlayback: boolean;
  armed: TriageState['armed'];
  showWorkspace: boolean;
  dispatch: (action: Action) => void;
}

function TranscriptScrubRow({memo, positionMs, hasPlayback, armed, showWorkspace, dispatch}: ScrubRowProps) {
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const downIdxRef = useRef<number | null>(null);
  const movedRef = useRef(false);
  const [pickerTop, setPickerTop] = useState(0);
  const positionIdx = hasPlayback ? wordIndexAt(memo, positionMs) : -1;

  const wordAtPoint = (clientX: number, clientY: number): number | null => {
    const hit = document.elementFromPoint(clientX, clientY);
    const idxAttr = hit instanceof HTMLElement ? hit.dataset.widx : undefined;
    return idxAttr == null ? null : Number(idxAttr);
  };

  // Float the typePicker directly below the range-end word's line.
  useLayoutEffect(() => {
    if (armed.range == null) return;
    const el = paraRef.current?.querySelector<HTMLElement>(\`[data-widx="\${armed.range[1]}"]\`);
    if (el != null) setPickerTop(el.offsetTop + 32);
  }, [armed.range]);

  const handleDown = (event: ReactPointerEvent<HTMLParagraphElement>) => {
    const index = wordAtPoint(event.clientX, event.clientY);
    downIdxRef.current = index;
    movedRef.current = false;
    if (index == null) return;
    if (armed.on) {
      if (armed.anchor == null) dispatch({type: 'SET_ANCHOR', index});
      else dispatch({type: 'SET_RANGE', a: armed.anchor, b: index});
    } else {
      dispatch({type: 'SCRUB', memoId: memo.id, positionMs: memo.words[index].startMs});
    }
  };

  const handleMove = (event: ReactPointerEvent<HTMLParagraphElement>) => {
    if (event.buttons === 0 || downIdxRef.current == null) return;
    const index = wordAtPoint(event.clientX, event.clientY);
    if (index == null || index === downIdxRef.current) return;
    movedRef.current = true;
    if (armed.on) {
      const anchor = armed.anchor ?? downIdxRef.current;
      dispatch({type: 'SET_RANGE', a: anchor, b: index});
    } else {
      dispatch({type: 'SCRUB', memoId: memo.id, positionMs: memo.words[index].startMs});
    }
  };

  const handleUp = (event: ReactPointerEvent<HTMLParagraphElement>) => {
    const index = wordAtPoint(event.clientX, event.clientY) ?? downIdxRef.current;
    const downIdx = downIdxRef.current;
    downIdxRef.current = null;
    if (index == null || armed.on) return;
    const word = memo.words[index];
    // Garnish: a clean tap on a low-confidence word cycles its alternates.
    if (!movedRef.current && downIdx === index && word.alternates.length > 0 && !word.confirmed) {
      dispatch({type: 'CYCLE_WORD', memoId: memo.id, index});
      return;
    }
    dispatch({type: 'PLAY', memoId: memo.id, fromMs: word.startMs});
  };

  let sentenceCursor = 0;
  const segments: Array<{start: number; end: number}> = memo.sentenceEnds.map(end => {
    const seg = {start: sentenceCursor, end};
    sentenceCursor = end + 1;
    return seg;
  });

  return (
    <p
      ref={paraRef}
      style={{...styles.scrubPara, touchAction: 'pan-y'}}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}>
      {segments.map(segment => (
        <span key={segment.start}>
          {memo.words.slice(segment.start, segment.end + 1).map((word, offset) => {
            const index = segment.start + offset;
            const uncertain = word.alternates.length > 0 && !word.confirmed && word.confidence < 0.8;
            const inRange = armed.range != null && index >= armed.range[0] && index <= armed.range[1];
            const isAnchor = armed.anchor === index && armed.range == null;
            const atPlayhead = index === positionIdx;
            const highlighted = inRange || isAnchor || atPlayhead;
            return (
              <span
                key={index}
                data-widx={index}
                data-start={word.startMs}
                data-end={word.endMs}
                style={{
                  ...styles.wordSpan,
                  color: highlighted
                    ? 'var(--color-text-primary)'
                    : uncertain
                      ? 'var(--color-text-secondary)'
                      : undefined,
                  textDecoration: uncertain ? 'underline dotted' : undefined,
                  textUnderlineOffset: uncertain ? 3 : undefined,
                  background: highlighted ? SCRUB_TINT : undefined,
                }}>
                {displayWord(word)}
                {word.suffix}
                {index < segment.end ? ' ' : ''}
              </span>
            );
          })}
          {showWorkspace ? (
            <button
              type="button"
              className="mvm-btn mvm-focusable"
              style={styles.sentenceExtract}
              aria-label={\`Extract sentence: \${memo.words
                .slice(segment.start, Math.min(segment.start + 4, segment.end + 1))
                .map(displayWord)
                .join(' ')}…\`}
              onClick={() => dispatch({type: 'SET_RANGE', a: segment.start, b: segment.end})}>
              Extract
            </button>
          ) : null}{' '}
        </span>
      ))}
      {armed.range != null ? (
        <span style={{...styles.typePicker, top: pickerTop}} role="group" aria-label="Span type">
          {(Object.keys(SPAN_TYPE_META) as SpanType[]).map(type => {
            const meta = SPAN_TYPE_META[type];
            return (
              <button
                key={type}
                type="button"
                className="mvm-btn mvm-focusable"
                style={styles.typeBtn}
                onClick={() =>
                  armed.range != null &&
                  dispatch({type: 'EXTRACT', memoId: memo.id, range: armed.range, spanType: type})
                }>
                <Icon icon={meta.icon} size="sm" />
                {meta.label}
              </button>
            );
          })}
          <button
            type="button"
            className="mvm-btn mvm-focusable"
            style={styles.typeCancel}
            aria-label="Cancel span"
            onClick={() => dispatch({type: 'CANCEL_ARM'})}>
            <Icon icon={XIcon} size="sm" />
          </button>
        </span>
      ) : null}
    </p>
  );
}

// ---------------------------------------------------------------------------
// TRANSCRIPT SHEET — two detents. Medium: waveform + transport + scrub row.
// Large: appends the extraction workspace (Mark span toggle, EXTRACTED
// chips, uncertain-word review rows). role=dialog, focus trapped, first
// focus = the close X with preventScroll (foundations amendment), Escape
// closes this topmost overlay only.
// ---------------------------------------------------------------------------

interface TranscriptSheetProps {
  memo: Memo;
  detent: 'medium' | 'large';
  playback: TriageState['playback'];
  armed: TriageState['armed'];
  reduced: boolean;
  narrow: boolean; // ≤330px container: 2-row transport (56 → 80px)
  dispatch: (action: Action) => void;
}

function TranscriptSheet({memo, detent, playback, armed, reduced, narrow, dispatch}: TranscriptSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    closeRef.current?.focus({preventScroll: true});
  }, []);

  const hasPlayback = playback != null && playback.memoId === memo.id;
  const positionMs = hasPlayback ? playback.positionMs : 0;
  const playing = hasPlayback ? playback.playing : false;
  const chips = memo.spans.filter(span => span.handled);
  const review = uncertainIndices(memo);
  const showWorkspace = detent === 'large';

  const transportButtons = (
    <div style={styles.transportButtons}>
      <button
        type="button"
        className="mvm-btn mvm-focusable"
        style={styles.transportBtn}
        aria-label="Back 5 seconds"
        onClick={() => dispatch({type: 'NUDGE', memoId: memo.id, deltaMs: -5000})}>
        <Icon icon={RewindIcon} size="md" />
      </button>
      <button
        type="button"
        className="mvm-btn mvm-focusable"
        style={styles.playBtn}
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={() =>
          playing ? dispatch({type: 'PAUSE'}) : dispatch({type: 'PLAY', memoId: memo.id, fromMs: positionMs})
        }>
        <Icon icon={playing ? PauseIcon : PlayIcon} size="md" />
      </button>
      <button
        type="button"
        className="mvm-btn mvm-focusable"
        style={styles.transportBtn}
        aria-label="Forward 5 seconds"
        onClick={() => dispatch({type: 'NUDGE', memoId: memo.id, deltaMs: 5000})}>
        <Icon icon={FastForwardIcon} size="md" />
      </button>
      <button
        type="button"
        className="mvm-btn mvm-focusable"
        style={{...styles.transportBtn, marginInlineStart: 'auto'}}
        aria-label="Play from top"
        onClick={() => dispatch({type: 'PLAY', memoId: memo.id, fromMs: 0})}>
        <Icon icon={SkipBackIcon} size="md" />
      </button>
    </div>
  );

  return (
    <>
      <div className="mvm-fade" style={styles.sheetScrim} onClick={() => dispatch({type: 'CLOSE_SHEET'})} />
      <div
        ref={sheetRef}
        className="mvm-sheet-in"
        style={{...styles.sheet, ...(detent === 'medium' ? styles.sheetMedium : styles.sheetLarge)}}
        role="dialog"
        aria-modal
        aria-labelledby="mvm-sheet-title"
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            dispatch({type: 'CLOSE_SHEET'});
          } else {
            trapTabKey(event, sheetRef.current);
          }
        }}>
        <button
          type="button"
          className="mvm-btn mvm-focusable"
          style={styles.grabberZone}
          aria-label={detent === 'medium' ? 'Expand sheet' : 'Collapse sheet'}
          onClick={() => dispatch({type: 'SET_DETENT', detent: detent === 'medium' ? 'large' : 'medium'})}>
          <span style={styles.grabberPill} />
        </button>
        <div style={styles.sheetHeader}>
          <span />
          <h2 id="mvm-sheet-title" style={styles.sheetTitle}>
            {memo.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="mvm-btn mvm-focusable"
            style={styles.iconBtn}
            aria-label="Close transcript"
            onClick={() => dispatch({type: 'CLOSE_SHEET'})}>
            <Icon icon={XIcon} size="md" />
          </button>
        </div>
        <div style={styles.sheetBody}>
          <WaveformBars
            memo={memo}
            positionMs={positionMs}
            playing={playing}
            reduced={reduced}
            onScrub={ms => dispatch({type: 'SCRUB', memoId: memo.id, positionMs: ms})}
            onPlayFrom={ms => dispatch({type: 'PLAY', memoId: memo.id, fromMs: ms})}
          />
          {narrow ? (
            <div style={{...styles.transportRow, ...styles.transportStacked}}>
              <div style={styles.transportLabelRow}>
                <PlayheadClock positionMs={positionMs} durationMs={memo.durationMs} playing={playing} reduced={reduced} />
              </div>
              {transportButtons}
            </div>
          ) : (
            <div style={styles.transportRow}>
              <PlayheadClock positionMs={positionMs} durationMs={memo.durationMs} playing={playing} reduced={reduced} />
              {transportButtons}
            </div>
          )}
          {showWorkspace ? (
            <div style={styles.markSpanBar}>
              <button
                type="button"
                className="mvm-btn mvm-focusable"
                style={{...styles.markSpanToggle, ...(armed.on ? styles.markSpanToggleOn : null)}}
                aria-pressed={armed.on}
                onClick={() => dispatch({type: 'ARM_TOGGLE'})}>
                <Icon icon={HighlighterIcon} size="sm" />
                Mark span
              </button>
              {armed.on ? (
                <span style={styles.markSpanHint}>
                  {armed.anchor == null ? 'Tap the first word' : 'Tap the last word'}
                </span>
              ) : null}
            </div>
          ) : null}
          <TranscriptScrubRow
            memo={memo}
            positionMs={positionMs}
            hasPlayback={hasPlayback}
            armed={armed}
            showWorkspace={showWorkspace}
            dispatch={dispatch}
          />
          {showWorkspace ? (
            <>
              <h3 style={styles.sheetSectionHeader}>Extracted</h3>
              {chips.length === 0 ? (
                <div style={styles.chipEmptyLine}>
                  0 extracted — mark a span or use Extract on a sentence
                </div>
              ) : (
                chips.map(span => {
                  const meta = SPAN_TYPE_META[span.type];
                  const quote = quoteOf(memo, span);
                  return (
                    <div key={span.id} style={styles.spanChip}>
                      <span style={styles.chipIcon}>
                        <Icon icon={meta.icon} size="sm" />
                      </span>
                      <span style={styles.chipType}>{meta.label}</span>
                      <span style={styles.chipQuote}>&ldquo;{quote}&rdquo;</span>
                      <button
                        type="button"
                        className="mvm-btn mvm-focusable"
                        style={styles.chipX}
                        aria-label={\`Remove \${meta.label.toLowerCase()}: \${quote}\`}
                        onClick={() => dispatch({type: 'UNEXTRACT', memoId: memo.id, spanId: span.id})}>
                        <Icon icon={XIcon} size="sm" />
                      </button>
                    </div>
                  );
                })
              )}
              {review.length > 0 ? (
                <>
                  <h3 style={styles.sheetSectionHeader}>
                    Review {review.length} uncertain {review.length === 1 ? 'word' : 'words'}
                  </h3>
                  {review.map(index => {
                    const word = memo.words[index];
                    const current = displayWord(word);
                    const nextAlt =
                      word.altIndex === word.alternates.length ? word.text : word.alternates[word.altIndex];
                    return (
                      <div key={index} style={styles.reviewRow}>
                        <span style={styles.reviewWord}>{current}</span>
                        <button
                          type="button"
                          className="mvm-btn mvm-focusable"
                          style={styles.altPill}
                          aria-label={\`Change \${current} to \${nextAlt}\`}
                          onClick={() => dispatch({type: 'CYCLE_WORD', memoId: memo.id, index})}>
                          {nextAlt}
                        </button>
                        <button
                          type="button"
                          className="mvm-btn mvm-focusable"
                          style={styles.reviewCheck}
                          aria-label={\`Mark \${current} as correct\`}
                          onClick={() => dispatch({type: 'CONFIRM_WORD', memoId: memo.id, index})}>
                          <Icon icon={CheckIcon} size="sm" />
                        </button>
                      </div>
                    );
                  })}
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — the verb picker for a memoRow's ellipsis. Two stacked
// cards; destructive LAST in the options card; Cancel is its own card 8px
// below; delete executes immediately + Undo toast (undoOverConfirm).
// ---------------------------------------------------------------------------

interface MemoActionSheetProps {
  memo: Memo;
  inInbox: boolean;
  dispatch: (action: Action) => void;
}

function MemoActionSheet({memo, inInbox, dispatch}: MemoActionSheetProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    cancelRef.current?.focus({preventScroll: true});
  }, []);
  return (
    <>
      <div className="mvm-fade" style={styles.sheetScrim} onClick={() => dispatch({type: 'CLOSE_ACTION'})} />
      <div
        ref={wrapRef}
        className="mvm-sheet-in"
        style={styles.actionSheetWrap}
        role="dialog"
        aria-modal
        aria-label={\`Actions for \${memo.title}\`}
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            dispatch({type: 'CLOSE_ACTION'});
          } else {
            trapTabKey(event, wrapRef.current);
          }
        }}>
        <div style={styles.actionCard}>
          <div style={styles.actionContext}>
            {memo.title} · {memo.durationLabel}
          </div>
          <button
            type="button"
            className="mvm-btn mvm-focusable"
            style={styles.actionRow}
            onClick={() => {
              dispatch({type: 'CLOSE_ACTION'});
              dispatch({type: 'OPEN_SHEET', memoId: memo.id});
              dispatch({type: 'PLAY', memoId: memo.id, fromMs: 0});
            }}>
            Play from start
          </button>
          {inInbox ? (
            <>
              <div style={styles.actionRowRule} />
              <button
                type="button"
                className="mvm-btn mvm-focusable"
                style={styles.actionRow}
                onClick={() => dispatch({type: 'MARK_PROCESSED', memoId: memo.id})}>
                Mark processed
              </button>
            </>
          ) : null}
          <div style={styles.actionRowRule} />
          <button
            type="button"
            className="mvm-btn mvm-focusable"
            style={{...styles.actionRow, ...styles.actionRowDestructive}}
            onClick={() => dispatch({type: 'DELETE_MEMO', memoId: memo.id})}>
            Delete memo
          </button>
        </div>
        <div style={{...styles.actionCard, ...styles.actionCancelCard}}>
          <button
            ref={cancelRef}
            type="button"
            className="mvm-btn mvm-focusable"
            style={styles.actionCancel}
            onClick={() => dispatch({type: 'CLOSE_ACTION'})}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// MEMO ROW — 110px; the WHOLE ROW is one button named by its title; the
// 44×44 ellipsis is an absolute sibling. A processed row slides out via the
// leaving ghost (transitionend finalizes; reduced motion finalizes
// immediately via effect in the page).
// ---------------------------------------------------------------------------

interface MemoRowProps {
  memo: Memo;
  playback: TriageState['playback'];
  leaving: boolean;
  reduced: boolean;
  onOpen: (memoId: string, opener: HTMLElement) => void;
  onEllipsis: (memoId: string, opener: HTMLElement) => void;
  onLeaveEnd: () => void;
}

function MemoRow({memo, playback, leaving, reduced, onOpen, onEllipsis, onLeaveEnd}: MemoRowProps) {
  const mined = minedOf(memo);
  const total = memo.spans.length;
  const done = total > 0 && mined === total;
  const isPlaying = playback != null && playback.memoId === memo.id;
  return (
    <div
      className="mvm-slide"
      style={{
        ...styles.memoRowOuter,
        ...(leaving ? (reduced ? {opacity: 0} : styles.memoRowLeaving) : null),
      }}
      onTransitionEnd={leaving ? onLeaveEnd : undefined}>
      <button
        type="button"
        className="mvm-btn mvm-focusable"
        style={styles.memoRow}
        aria-label={memo.title}
        onClick={event => onOpen(memo.id, event.currentTarget)}>
        <span style={styles.rowTitleLine}>
          <span style={styles.rowTitle}>{memo.title}</span>
          <span style={styles.rowDuration}>{memo.durationLabel}</span>
        </span>
        <span className="mvm-clamp2" style={styles.rowPeek}>
          {peekOf(memo)}
        </span>
        <span style={styles.rowMeta}>
          <span style={{...styles.progressPill, ...(done ? styles.progressPillDone : null)}}>
            {mined} of {total} mined
          </span>
          {isPlaying ? (
            <>
              <span style={{...styles.rowDate, flexShrink: 0}}>{fmtClock(playback.positionMs)}</span>
              <MiniTicker reduced={reduced || !playback.playing} />
            </>
          ) : (
            <span style={styles.rowDate}>{memo.dateLabel}</span>
          )}
        </span>
      </button>
      <button
        type="button"
        className="mvm-btn mvm-focusable"
        style={styles.ellipsisBtn}
        aria-label={\`More actions for \${memo.title}\`}
        onClick={event => onEllipsis(memo.id, event.currentTarget)}>
        <Icon icon={MoreHorizontalIcon} size="md" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Murmur voice memo triage. ONE state owner (useReducer above);
// derived captions/badges; per-tab scroll persistence; IntersectionObserver
// drives the navBar title fade (user-scroll driven, deterministic).
// ---------------------------------------------------------------------------

export default function MobileVoiceMemoTriage() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const largeTitleRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const width = useElementWidth(wrapRef);
  const viewportFallback = useMediaQuery('(min-width: 720px)');
  const isDesktop = width > 0 ? width >= 720 : viewportFallback;
  const narrow = width > 0 && width <= 330;
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  // NavBar compact title — fades in when the largeTitle scrolls under the
  // 52px sticky navBar.
  const [titleUnder, setTitleUnder] = useState(false);
  useEffect(() => {
    const target = largeTitleRef.current;
    if (target == null) return undefined;
    const observer = new IntersectionObserver(
      entries => setTitleUnder(!(entries[0]?.isIntersecting ?? true)),
      {rootMargin: '-52px 0px 0px 0px', threshold: 0},
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Reduced motion: no slide transition will fire transitionend — finalize
  // the leaving ghost from this state-driven effect (no timers).
  useEffect(() => {
    if (reduced && state.leaving != null) dispatch({type: 'FINALIZE_LEAVE'});
  }, [reduced, state.leaving]);

  // Restore focus to the opener on every overlay close path.
  const overlayOpen = state.sheet != null || state.openActionSheet != null;
  const prevOverlayRef = useRef(overlayOpen);
  useEffect(() => {
    if (prevOverlayRef.current && !overlayOpen) {
      openerRef.current?.focus({preventScroll: true});
      openerRef.current = null;
    }
    prevOverlayRef.current = overlayOpen;
  }, [overlayOpen]);

  // Per-tab scroll restore (persistence law) — runs after the tab switch.
  useEffect(() => {
    const scroller = scrollerOf(shellRef.current);
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.tab];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);

  const ids = [...state.order[state.tab]];
  if (state.tab === 'inbox' && state.leaving != null) {
    ids.splice(Math.min(state.leaving.index, ids.length), 0, state.leaving.id);
  }
  const memosOf = (list: string[]) => list.map(id => state.memos[id]);

  // DERIVED captions — never stored counters, so they cannot drift.
  // Initial inbox: 5 memos · 372 s = 6:12 · 4 of 13 items mined ✓.
  const inboxMemos = memosOf(state.order.inbox);
  const inboxMs = inboxMemos.reduce((sum, memo) => sum + memo.durationMs, 0);
  const inboxMined = inboxMemos.reduce((sum, memo) => sum + minedOf(memo), 0);
  const inboxTotal = inboxMemos.reduce((sum, memo) => sum + memo.spans.length, 0);
  // Initial processed: 3 memos · 260 s = 4:20 · 7 items extracted ✓.
  const processedMemos = memosOf(state.order.processed);
  const processedMs = processedMemos.reduce((sum, memo) => sum + memo.durationMs, 0);
  const processedChips = processedMemos.reduce((sum, memo) => sum + minedOf(memo), 0);
  const badge = state.order.processed.length;

  const statsCaption =
    state.tab === 'inbox'
      ? \`\${memosLabel(inboxMemos.length)} · \${fmtClock(inboxMs)} total · \${inboxMined} of \${inboxTotal} items mined\`
      : \`\${memosLabel(processedMemos.length)} · \${fmtClock(processedMs)} · \${itemsExtractedLabel(processedChips)}\`;

  const sheetMemo = state.sheet != null ? state.memos[state.sheet.memoId] : null;
  const actionMemo = state.openActionSheet != null ? state.memos[state.openActionSheet] : null;

  const openSheet = (memoId: string, opener: HTMLElement) => {
    openerRef.current = opener;
    dispatch({type: 'OPEN_SHEET', memoId});
  };
  const openAction = (memoId: string, opener: HTMLElement) => {
    openerRef.current = opener;
    dispatch({type: 'OPEN_ACTION', memoId});
  };
  const switchTab = (tab: TabId) => {
    const scroller = scrollerOf(shellRef.current);
    if (tab === state.tab) {
      // The one legal reset: re-tapping the active tab scrolls to top.
      if (scroller != null) scroller.scrollTop = 0;
      dispatch({type: 'SAVE_SCROLL', tab, scrollTop: 0});
      return;
    }
    dispatch({type: 'SET_TAB', tab, scrollTop: scroller?.scrollTop ?? 0});
  };

  const tabs: Array<{id: TabId; label: string; icon: typeof InboxIcon}> = [
    {id: 'inbox', label: 'Inbox', icon: InboxIcon},
    {id: 'processed', label: 'Processed', icon: PackageCheckIcon},
  ];

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{MURMUR_CSS}</style>
      <div
        ref={shellRef}
        style={{
          ...styles.shell,
          ...(isDesktop ? styles.shellDesktop : null),
          ...(overlayOpen ? styles.shellLocked : null),
        }}>
        <header style={styles.navBar} aria-label={\`Murmur — \${OWNER.name} (@\${OWNER.handle})\`}>
          <div style={styles.navLeading}>
            <span style={styles.brandSlot}>
              <MurmurMark accent />
            </span>
          </div>
          <div
            className="mvm-fade"
            style={{...styles.navTitle, opacity: titleUnder ? 1 : 0}}
            aria-hidden={!titleUnder}>
            Murmur
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="mvm-btn mvm-focusable"
              style={styles.captureBtn}
              aria-label="Record memo"
              onClick={() => dispatch({type: 'TOAST', msg: 'Recording is disabled in this demo'})}>
              <span style={styles.captureCircle}>
                <span className={reduced ? undefined : 'mvm-pulse'} style={styles.captureRing} aria-hidden />
                <Icon icon={MicIcon} size="xsm" />
              </span>
            </button>
          </div>
        </header>
        <main style={{...styles.main, ...(overlayOpen ? styles.mainLocked : null)}}>
          <div ref={largeTitleRef} style={styles.largeTitle}>
            <h1 style={styles.largeTitleText}>{state.tab === 'inbox' ? 'Inbox' : 'Processed'}</h1>
          </div>
          <div style={styles.statsCaption}>{statsCaption}</div>
          {ids.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyCircle}>
                <Icon icon={state.tab === 'inbox' ? InboxIcon : PackageCheckIcon} size="lg" />
              </span>
              <h2 style={styles.emptyTitle}>{state.tab === 'inbox' ? 'Inbox zero' : 'Nothing processed yet'}</h2>
              <p style={styles.emptyBody}>
                {state.tab === 'inbox'
                  ? 'New recordings land here ready to mine.'
                  : 'Fully mined memos land here.'}
              </p>
            </div>
          ) : (
            <>
              <div style={styles.listCard}>
                {ids.map((id, index) => (
                  <div key={id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <MemoRow
                      memo={state.memos[id]}
                      playback={state.playback}
                      leaving={state.leaving?.id === id}
                      reduced={reduced}
                      onOpen={openSheet}
                      onEllipsis={openAction}
                      onLeaveEnd={() => dispatch({type: 'FINALIZE_LEAVE'})}
                    />
                  </div>
                ))}
              </div>
              <div style={styles.terminalCaption}>
                All {memosLabel(state.order[state.tab].length)}
              </div>
            </>
          )}
        </main>
        {/* The ONE polite live region — sticky-in-flow dock above the tabBar. */}
        <div style={styles.toastAnchor} aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast}>
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    className="mvm-btn mvm-focusable"
                    style={styles.toastUndo}
                    onClick={() => dispatch({type: 'UNDO'})}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        <nav style={styles.tabBar} role="tablist" aria-label="Murmur sections">
          {tabs.map(tab => {
            const active = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="mvm-btn mvm-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                aria-label={tab.id === 'processed' ? \`Processed, \${memosLabel(badge)}\` : 'Inbox'}
                onClick={() => switchTab(tab.id)}
                onKeyDown={event => {
                  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    event.preventDefault();
                    switchTab(tab.id === 'inbox' ? 'processed' : 'inbox');
                  }
                }}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" />
                  {tab.id === 'processed' && badge > 0 ? <span style={styles.tabBadge}>{badge}</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        {sheetMemo != null && state.sheet != null ? (
          <TranscriptSheet
            memo={sheetMemo}
            detent={state.sheet.detent}
            playback={state.playback}
            armed={state.armed}
            reduced={reduced}
            narrow={narrow}
            dispatch={dispatch}
          />
        ) : null}
        {actionMemo != null ? (
          <MemoActionSheet
            memo={actionMemo}
            inInbox={state.order.inbox.includes(actionMemo.id)}
            dispatch={dispatch}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};