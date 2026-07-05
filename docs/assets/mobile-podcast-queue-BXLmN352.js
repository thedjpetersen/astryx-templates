var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Earmark listening ledger frozen
 *   at BASE_MIN 970 ('4:10 PM'): now playing Signal & Noise 'Ep 88 ·
 *   Compression Artifacts' (41:00, 27:00 played, 14:00 left) over a queue
 *   of six episodes whose remainders sum to exactly 138 min (32+31+21+24+
 *   18+12), so the ledger reads '2 hr 32 min · Ends 6:42 PM' (970+152).
 *   Three downloads (46.2+59.5+11.5 = 117.2 MB) echo in the Downloads tab
 *   and Profile storage row. Artwork is deterministic show-derived
 *   gradient tiles (no images). No Date.now(), no Math.random().
 * @output Earmark — Up Next Queue: a 390px MOBILE podcast-queue surface
 *   that treats listening time as a budget. NavBar (folded-corner Earmark
 *   mark · 'Up Next' h1 · Edit/Done + Refresh) over a 48px queueLedger
 *   ('UP NEXT · 6' / '2 hr 32 min · Ends 6:42 PM'), one listCard of six
 *   72px queueRows whose bottom divider IS the per-episode progress meter
 *   (played fraction in brand over the border track, inset 104px), a
 *   sticky-in-flow toastDock, a 66px miniPlayer dock stacked above a
 *   4-tab tabBar, and a 55%-detent Now Playing sheet with a sleep-timer
 *   radiogroup. Signature move: every reorder (grip drag or Edit-mode
 *   chevrons), archive (swipe or ellipsis menu, undo-over-confirm), and
 *   Discover add re-sums the ledger, rewrites the miniPlayer's 'Up next:'
 *   line, renumbers every '#n' overline, and updates the Listen badge —
 *   all derived in render from ONE \`queue\` array.
 * @position Page template; emitted by \`astryx template mobile-podcast-queue\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, menus) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'} and
 *   restores on close; focus enters via focus({preventScroll:true}). The
 *   toastDock is sticky-in-flow (bottom 142 = 64 tabBar + 66 miniPlayer +
 *   12), never shell-absolute, so it rides the viewport on tall scrolls.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline dividers); no desktop frames, asides, or tables.
 * Color policy: token-pure chrome. The ONE quarantined brand accent is
 *   the Earmark indigo, split per house law into BRAND_FILL (surfaces)
 *   and BRAND_TEXT (text/icons), each with contrast math at the
 *   declaration. REST_CONTROL is the amendment-mandated ≥3:1 rest-state
 *   pair for interactive boundaries (switch OFF tracks, unchecked radios,
 *   inactive page dots) against their ACTUAL card/body surfaces. Artwork
 *   gradient stops are scheme-invariant imagery literals (like photos),
 *   each pair dark enough for the white initial at ≥4.5:1. The
 *   divider-as-meter's unplayed remainder is var(--color-border) BY SPEC
 *   — it is a passive separator doing double duty (zero-progress rows
 *   must read as plain dividers); the meaning-bearing fill is the brand
 *   played segment (#4338CA vs the light border ≈ 6.6:1, #6366F1 vs the
 *   dark border ≈ 3.4:1 — both clear the 3:1 graphics floor). Same
 *   dual-role math for the miniPlayer's 2px top progress hairline.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr'); queueLedger 48px;
 *   queueRow 72px (48px thumb, 12px radius, divider-meter inset 104 =
 *   4 pad + 44 grip + 8 + 48 thumb); Downloads/Trending rows 60px;
 *   Profile utility + sheet radio rows 44px; miniPlayer 66px = 2px meter
 *   + 64px row (paddingInline 12, 40px art at 8px radius); tabBar exactly
 *   64px, four flex:1 tabItems, 24px icon over 11px/500 label, 4px gap;
 *   sectionHeader 13px/600 uppercase 0.06em at 32px, 20/8 margins; sheet
 *   detents 55% / calc(100% − 56px), 24px grabber zone, 52px header.
 *   TYPE (Figtree via --font-family-body): 17/600 nav+sheet+card titles ·
 *   16/400–600 row primary (hard floor) · 13/400–500 secondary + meters ·
 *   11/500–600 tab labels, overlines, badges; nothing under 11px;
 *   tabular-nums on every time, count, and the ledger. Buttons: 44×44
 *   icon (20–24px glyphs) · 36px secondary/Add pills · 48px toast.
 *   Touch: every target ≥44×44 with ≥8px clearance or merged full-row;
 *   every gesture has a visible button path (grip drag ↔ Edit chevrons,
 *   swipe-archive ↔ ellipsis menu, sheet drag ↔ grabber click + X,
 *   carousel ↔ 44px page-dot buttons).
 *
 * Responsive contract:
 * - Fluid 320–430px, no width:390 literals. At 320 the two-line title
 *   stack shrinks first (minWidth 0 + ellipsis; the ~90-char Ledger Lines
 *   title is the canary), trailing meta keeps intrinsic width, grip/
 *   thumb/ellipsis never shrink; the queueLedger's leading label drops to
 *   'QUEUE · 6' below 360px of measured strip width (container query via
 *   ResizeObserver, never viewport). Carousel cards min(140px, 42%) keep
 *   the ≥24px peek. overflowX:'clip' on shell is backstop only.
 * - Desktop stage (~1045px container): centered phone column — maxWidth
 *   430, marginInline auto, borderInline hairline — measured via
 *   useElementWidth on the wrapper (grid-feeder-console pattern); sticky
 *   chrome and the 55% sheet stay correct because they anchor to shell.
 *   No relayout; the mobile anatomy IS the template at every width.
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
  ArchiveIcon,
  ArrowDownCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleUserIcon,
  CompassIcon,
  GripVerticalIcon,
  ListMusicIcon,
  MinusIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCwIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand accent, split fill/text per house law.
// BRAND_FILL carries white text/glyphs on both sides: #FFFFFF on #4338CA
// ≈ 8.6:1; #FFFFFF on #6366F1 ≈ 4.9:1 — both pass 4.5:1.
const BRAND_FILL = 'light-dark(#4338CA, #6366F1)';
// BRAND_TEXT on the body/card background: #4338CA on #FFFFFF ≈ 9.0:1;
// #A5B4FC on the dark body (~#1C1C1E) ≈ 7.9:1 — both pass 4.5:1.
const BRAND_TEXT = 'light-dark(#4338CA, #A5B4FC)';
// AMENDMENT PAIR — rest states of interactive controls (switch OFF track,
// unchecked sleep radios, inactive carousel dots) need ≥3:1 against their
// ACTUAL surface; hairline/muted tokens are for passive separators only.
// #8A8A8E vs the white card ≈ 3.4:1; #7C7C82 vs the dark card (~#1C1C1E)
// ≈ 4.1:1 — both clear 3:1.
const REST_CONTROL = 'light-dark(#8A8A8E, #7C7C82)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// ARTWORK GRADIENT STOPS — imagery, deliberately scheme-invariant (a
// show's cover doesn't recolor in dark mode). Every stop keeps the white
// 700 initials at ≥4.5:1 (darkest-to-lightest stop range 4.5–10.4:1).
const ART_GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ['#0F766E', '#134E4A'], // teal — white ≈ 4.8:1 on the light stop
  ['#9D174D', '#831843'], // magenta — white ≈ 7.6:1
  ['#1D4ED8', '#1E3A8A'], // cobalt — white ≈ 6.2:1
  ['#B91C1C', '#7F1D1D'], // brick — white ≈ 6.3:1
  ['#6D28D9', '#4C1D95'], // violet — white ≈ 7.0:1
  ['#047857', '#064E3B'], // pine — white ≈ 5.2:1
  ['#C2410C', '#7C2D12'], // rust — white ≈ 4.9:1
  ['#374151', '#111827'], // graphite — white ≈ 9.2:1
];

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden text,
// skeleton shimmer, and the reduced-motion guard (transform/opacity only;
// shimmer is REMOVED, not slowed, under reduced motion).
// ---------------------------------------------------------------------------

const EARMARK_CSS = \`
.emk-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.emk-btn:disabled { cursor: default; }
.emk-focusable:focus-visible {
  outline: 2px solid \${BRAND_TEXT};
  outline-offset: 2px;
}
.emk-anim { transition: transform 200ms ease, opacity 200ms ease; }
@keyframes emk-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.emk-sheet-in { animation: emk-sheet-in 200ms ease; }
@keyframes emk-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.emk-shimmer {
  animation: emk-shimmer 1.6s linear infinite;
}
.emk-vh {
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
  .emk-anim { transition: none; }
  .emk-sheet-in { animation: none; }
  .emk-shimmer { animation: none; opacity: 0; }
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
  // Longhand axes (shell already sets overflowX; mixing the shorthand in
  // a rerender patch triggers React's conflicting-style warning).
  shellLocked: {height: '100dvh', overflowY: 'hidden', overflowX: 'hidden'},
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, blur surface, hairline ALWAYS ON (this
  // template does not wire scroll-under; noted per contract).
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
  navTrailing: {display: 'flex', justifyContent: 'flex-end', alignItems: 'center'},
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  editBtn: {
    height: 44,
    paddingInline: 10,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_TEXT,
  },
  editBtnDone: {fontWeight: 600},
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // QUEUE LEDGER — 48px strip in flow below the navBar; tabular-nums law.
  ledger: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
  },
  ledgerLead: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  ledgerTrail: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  updatedCaption: {
    margin: '0 0 8px',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
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
  // QUEUE ROW — 72px; grip 44 at paddingInlineStart 4 so the glyph sits
  // optically at the 16px gutter; divider-meter inset 104 (4+44+8+48).
  rowOuter: {position: 'relative'},
  rowClip: {position: 'relative', overflow: 'hidden'},
  archiveAction: {
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
    background: BRAND_FILL,
    // White on #4338CA ≈ 8.6:1 / on #6366F1 ≈ 4.9:1 (see BRAND_FILL).
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
  },
  rowContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: 72,
    paddingInline: '4px 8px',
    gap: 8,
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
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
    cursor: 'grab',
  },
  thumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.04em',
    userSelect: 'none',
  },
  // 8px rowContent gap + 4px here = the spec's 12px thumb→stack gap
  // without double-counting (title width is precious at 320).
  rowMain: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 4,
  },
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
  metaStack: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  posOverline: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.06em',
  },
  remainingWrap: {display: 'flex', alignItems: 'center', gap: 4},
  dlGlyph: {display: 'inline-flex', color: BRAND_TEXT},
  remaining: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  chevronPair: {display: 'flex', alignItems: 'center', flexShrink: 0},
  chevronDisabled: {opacity: 0.35},
  // Divider-as-meter: 2px, inset 104; played fraction BRAND_FILL over the
  // border track (dual-role passive separator — see color policy).
  meterTrack: {
    height: 2,
    marginInlineStart: 104,
    background: 'var(--color-border)',
  },
  meterFill: {height: '100%', background: BRAND_FILL},
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Anchored ellipsis menu — z30, below the sheet scrim's z40.
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
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // EMPTY STATE — exact foundation anatomy.
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
  emptyTitle: {margin: 0, fontSize: 17, fontWeight: 600},
  emptyBody: {margin: '4px 0 16px', fontSize: 13, color: 'var(--color-text-secondary)'},
  emptyAction: {
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    display: 'grid',
    placeItems: 'center',
  },
  // SKELETON — 72px rows, deterministic staggered widths, shared sweep.
  skeletonRow: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skeletonThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  skeletonBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  shimmerOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-background-card) 55%, transparent), transparent)',
    pointerEvents: 'none',
  },
  // TOAST DOCK — sticky-in-flow per amendment (height 0 anchor; the card
  // hangs above it). bottom 142 = 64 tabBar + 66 miniPlayer + 12.
  toastDock: {
    position: 'sticky',
    bottom: 142,
    zIndex: 30,
    height: 0,
    paddingInline: 16,
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
  toastText: {
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
  undoBtn: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  // MINI PLAYER — sticky bottom 64 z19; identical blur recipe to tabBar so
  // the two read as one chrome slab. Top edge IS the 2px progress meter.
  miniPlayer: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  mpMeterTrack: {height: 2, background: 'var(--color-border)'},
  mpMeterFill: {height: '100%', background: BRAND_FILL},
  mpRow: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
  },
  mpArt: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    userSelect: 'none',
  },
  mpInfoBtn: {
    flex: 1,
    minWidth: 0,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
  },
  mpInfoText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  mpTitle: {
    fontSize: 16,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mpNext: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sleepChip: {
    flexShrink: 0,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 8,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  skipBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
  },
  skipNum: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    paddingTop: 2,
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'none',
  },
  // TAB BAR — exactly 64px, sticky bottom z20, blur + top hairline.
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
  tabItemActive: {color: BRAND_TEXT},
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500},
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
    background: BRAND_FILL,
    color: '#FFFFFF', // see BRAND_FILL contrast math
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
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
  sheetTitle: {margin: 0, fontSize: 17, fontWeight: 600, textAlign: 'center'},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 24px'},
  npBlock: {display: 'flex', gap: 12, alignItems: 'center', paddingBlock: 8},
  npArt: {
    width: 64,
    height: 64,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '0.04em',
    userSelect: 'none',
  },
  npText: {minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  npTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  npMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  npNotes: {
    margin: '8px 0 0',
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
  },
  sheetSectionHeader: {
    margin: '24px 0 8px',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  sleepCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  radioRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
  },
  radioLabel: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Unchecked ring uses REST_CONTROL (≥3:1 vs the card — amendment law).
  radioCircle: {
    width: 20,
    height: 20,
    flexShrink: 0,
    borderRadius: '50%',
    border: \`2px solid \${REST_CONTROL}\`,
    display: 'grid',
    placeItems: 'center',
  },
  radioCircleOn: {border: \`2px solid \${BRAND_TEXT}\`},
  radioDot: {width: 10, height: 10, borderRadius: '50%', background: BRAND_TEXT},
  // DISCOVER — snap carousel + page dots + trending rows.
  carousel: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 16,
    paddingBottom: 4,
  },
  showCard: {
    width: 'min(140px, 42%)',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    borderRadius: 12,
    textAlign: 'left',
  },
  showArt: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '0.04em',
    userSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
  },
  followChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    height: 20,
    paddingInline: 8,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 999,
    background: '#FFFFFF',
    color: '#3730A3', // #3730A3 on #FFFFFF ≈ 10.4:1
    fontSize: 11,
    fontWeight: 600,
  },
  showName: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  showTagline: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dotRow: {display: 'flex', justifyContent: 'center', marginTop: 4},
  dotHit: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  dot: {width: 8, height: 8, borderRadius: '50%', background: REST_CONTROL},
  dotActive: {background: BRAND_FILL},
  trendRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  trendText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  addPill: {
    height: 36,
    minWidth: 64,
    paddingInline: 14,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: BRAND_FILL,
    color: '#FFFFFF', // see BRAND_FILL contrast math
    fontSize: 13,
    fontWeight: 600,
  },
  addPillDone: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // DOWNLOADS + PROFILE rows.
  dlRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  dlThumb: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    userSelect: 'none',
  },
  tabCaption: {
    margin: '12px 0 8px',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
  },
  utilityLabel: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  utilityValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // SWITCH — 51×31 track; OFF track is REST_CONTROL per amendment (the
  // muted-token track fails 3:1 on the card); ON is BRAND_FILL. Thumb is
  // #FFFFFF in both schemes with a soft shadow.
  switchTrack: {
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    background: REST_CONTROL,
    position: 'relative',
  },
  switchTrackOn: {background: BRAND_FILL},
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
  switchThumbOn: {transform: 'translateX(20px)'},
  // STEPPER — 96×32 track split by a center hairline.
  stepper: {
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
  stepperRule: {width: 1, background: 'var(--color-border)'},
  stepperDisabled: {opacity: 0.35},
};

// ---------------------------------------------------------------------------
// FIXTURES — one frozen clock, dual fields ({durationSec, durationLabel}),
// identity consts, cross-checked aggregates. ARITHMETIC CROSS-CHECK LAW
// (verified by hand): queue remainders 32+31+21+24+18+12 = 138 min; + now
// playing 14 = 152 min = '2 hr 32 min'; BASE_MIN 970 (4:10 PM) + 152 =
// 1122 = 'Ends 6:42 PM'. Archive Low Simmer (24): 152−24 = 128 = '2 hr
// 8 min · Ends 6:18 PM'. Adds: +38 → 190 (7:20 PM); +29 → 181 (7:11 PM);
// +51 → 203 (7:33 PM). Archive-to-empty: 14 min · Ends 4:24 PM (970+14).
// Downloads: 46.2+59.5+11.5 = 117.2 MB across rows 1, 3, 6 (three queue
// glyphs) — echoed by the Profile storage row.
// ---------------------------------------------------------------------------

// The deterministic clock base — 970 minutes since midnight = 4:10 PM.
// Named identity const; never Date.now().
const BASE_MIN = 970;

type TabId = 'listen' | 'discover' | 'downloads' | 'profile';
type SleepId = 'off' | 's5' | 's10' | 's15' | 's30' | 'eoe';

interface Episode {
  id: string;
  show: string;
  title: string;
  epNum: number;
  durationSec: number;
  durationLabel: string; // dual field beside durationSec
  playedSec: number;
  downloaded: boolean;
  sizeMB: number | null; // present only when downloaded
  notes: string | null;
}

const NOW_PLAYING_ID = 'np_sn88';

const EPISODES: Episode[] = [
  {
    id: NOW_PLAYING_ID,
    show: 'Signal & Noise',
    title: 'Compression Artifacts',
    epNum: 88,
    durationSec: 2460, // 41:00
    durationLabel: '41:00',
    playedSec: 1620, // 27:00 → 65.9% meter, 14:00 remaining
    downloaded: false,
    sizeMB: null,
    notes:
      'Why every viral clip looks worse than the original: a tour of generational loss, from bicubic thumbnails to the re-encode chain a video survives between group chats. Guest engineer Mara Oyelaran brings the waveform receipts.',
  },
  // QUEUE — order matters; remainders 32+31+21+24+18+12 = 138 min.
  {
    id: 'ep_fork214',
    show: 'The Fork Loop',
    title: 'The Monorepo Truce',
    epNum: 214,
    durationSec: 2880, // 48:00
    durationLabel: '48:00',
    playedSec: 960, // 16:00 → meter 33.3%, remaining 32:00
    downloaded: true,
    sizeMB: 46.2,
    notes: null,
  },
  {
    id: 'ep_ledger132',
    show: 'Ledger Lines',
    // STRESS: ~90-char title — the two-line-ellipsis canary at 320px.
    title: 'Rate Cuts, Real Costs, and Why Your Coffee Is a Rounding Error in the National Accounts',
    epNum: 132,
    durationSec: 1860, // 31:00
    durationLabel: '31:00',
    playedSec: 0, // meter reads as a plain divider (stress 3)
    downloaded: false,
    sizeMB: null,
    notes: null,
  },
  {
    id: 'ep_night41',
    show: 'Night Static',
    title: 'The Cold Case of Pier 40',
    epNum: 41,
    durationSec: 3720, // 62:00 — duration stress vs 12:00 (stress 2)
    durationLabel: '62:00',
    playedSec: 2460, // 41:00 → meter 66.1%, remaining 21:00
    downloaded: true,
    sizeMB: 59.5,
    notes: null,
  },
  {
    id: 'ep_simmer18',
    show: 'Low Simmer',
    title: 'Brining Is a Lie?',
    epNum: 18,
    durationSec: 1440, // 24:00 — the archive fixture (152−24 = 128)
    durationLabel: '24:00',
    playedSec: 0,
    downloaded: false,
    sizeMB: null,
    notes: null,
  },
  {
    id: 'ep_valet73',
    show: 'Parallel Parking',
    title: 'Guest: A Real Valet',
    epNum: 73,
    durationSec: 2700, // 45:00
    durationLabel: '45:00',
    playedSec: 1620, // 27:00 → meter 60.0%, remaining 18:00
    downloaded: false,
    sizeMB: null,
    notes: null,
  },
  {
    id: 'ep_myc205',
    show: 'Field Notes Radio',
    title: 'Mycelium Networks',
    epNum: 205,
    durationSec: 720, // 12:00 — shortest (stress 2)
    durationLabel: '12:00',
    playedSec: 0,
    downloaded: true,
    sizeMB: 11.5,
    notes: null,
  },
  // TRENDING (Discover) — adding re-sums the ledger: 152+38 = 190 →
  // 7:20 PM; +29 = 181 → 7:11 PM; +51 = 203 → 7:33 PM (all pre-verified).
  {
    id: 'tr_orbital',
    show: 'Aphelion Weekly',
    title: 'Orbital Mechanics for Poets',
    epNum: 12,
    durationSec: 2280, // 38:00
    durationLabel: '38:00',
    playedSec: 0,
    downloaded: false,
    sizeMB: null,
    notes: null,
  },
  {
    id: 'tr_payphone',
    show: 'Dead Lines',
    title: 'The Last Payphone',
    epNum: 44,
    durationSec: 1740, // 29:00
    durationLabel: '29:00',
    playedSec: 0,
    downloaded: false,
    sizeMB: null,
    notes: null,
  },
  {
    id: 'tr_ferment',
    show: 'Low Simmer',
    title: 'Fermentation Nation',
    epNum: 19,
    durationSec: 3060, // 51:00 — the add-then-reorder compound (stress 6)
    durationLabel: '51:00',
    playedSec: 0,
    downloaded: false,
    sizeMB: null,
    notes: null,
  },
];

const INITIAL_QUEUE: string[] = [
  'ep_fork214',
  'ep_ledger132',
  'ep_night41',
  'ep_simmer18',
  'ep_valet73',
  'ep_myc205',
];

const TRENDING_IDS = ['tr_orbital', 'tr_payphone', 'tr_ferment'];

interface Show {
  id: string;
  name: string;
  tagline: string;
}

const SHOWS: Show[] = [
  {id: 'sh_sn', name: 'Signal & Noise', tagline: 'Media forensics, weekly'},
  {id: 'sh_night', name: 'Night Static', tagline: 'True crime on the waterfront'},
  {id: 'sh_fork', name: 'The Fork Loop', tagline: 'Two maintainers, one merge queue'},
  {id: 'sh_valet', name: 'Parallel Parking', tagline: 'Odd jobs, oral histories'},
];

interface SleepOption {
  id: SleepId;
  chip: string | null; // miniPlayer pill label; null = no chip
  announce: string;
}

const SLEEP_OPTIONS: SleepOption[] = [
  {id: 'off', chip: null, announce: 'Sleep timer off'},
  {id: 's5', chip: '5 min', announce: 'Sleep timer set for 5 minutes'},
  {id: 's10', chip: '10 min', announce: 'Sleep timer set for 10 minutes'},
  {id: 's15', chip: '15 min', announce: 'Sleep timer set for 15 minutes'},
  {id: 's30', chip: '30 min', announce: 'Sleep timer set for 30 minutes'},
  {id: 'eoe', chip: 'End of ep', announce: 'Sleep timer set to end of episode'},
];

// Skeleton bar widths — deterministic staggered pattern, never random.
const SKELETON_PRIMARY = ['60%', '45%', '70%', '60%'];
const SKELETON_SECONDARY = ['40%', '55%', '30%', '40%'];

// ---------------------------------------------------------------------------
// FORMATTERS + ART — pure, deterministic.
// ---------------------------------------------------------------------------

/** Minutes-since-midnight → '6:42 PM'. */
function fmtTime(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return \`\${h12}:\${String(m).padStart(2, '0')} \${suffix}\`;
}

/** Seconds → 'M:SS' clock ('32:00', '13:30'). */
function fmtClock(sec: number): string {
  return \`\${Math.floor(sec / 60)}:\${String(sec % 60).padStart(2, '0')}\`;
}

/** Whole minutes → '2 hr 32 min' / '3 hr' / '14 min'. */
function fmtDuration(min: number): string {
  if (min < 60) return \`\${min} min\`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? \`\${h} hr\` : \`\${h} hr \${m} min\`;
}

/**
 * ROUNDING RULE: the ledger sums remaining SECONDS across now-playing +
 * queue, then floors to whole minutes. (The spec's per-episode ceil would
 * contradict its own rendered values after skip-30 — 151.5 min must show
 * '2 hr 31 min · Ends 6:41 PM' — so floor-of-total is the law here; noted
 * as a deviation.) At the shipped fixture the total is exactly 9120 s =
 * 152 min, so both rules agree at rest.
 */
function remainingSec(episode: Episode): number {
  return Math.max(0, episode.durationSec - episode.playedSec);
}

/**
 * Deterministic show-derived artwork gradient (same show = same tile).
 * Multiplier 80 chosen so all six adjacent queue shows land on distinct
 * palette slots (1,4,3,0,2,6 — verified by hand for this fixture set).
 */
function artFor(show: string): CSSProperties {
  let hash = 0;
  for (let i = 0; i < show.length; i++) {
    hash = (hash * 80 + show.charCodeAt(i)) % 997;
  }
  const [from, to] = ART_GRADIENTS[hash % ART_GRADIENTS.length];
  return {background: \`linear-gradient(135deg, \${from}, \${to})\`};
}

/** Show initials for the gradient tile ('Signal & Noise' → 'SN'). */
function initialsFor(show: string): string {
  const words = show.split(' ').filter(word => /^[A-Za-z]/.test(word));
  return words
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useEarmarkState(): the App-level state record plus
// update(id, patch) for episode mutations. ALL derived values (ledger sum,
// endsAt, '#n' positions, miniPlayer 'Up next', Listen badge, terminal
// caption, downloads total) compute in render from \`queue\` + \`episodes\` —
// no shadow copies, no effects deriving state.
// ---------------------------------------------------------------------------

interface Toast {
  seq: number;
  text: string;
  undo: {id: string; index: number} | null;
}

interface EarmarkState {
  tab: TabId;
  scrollByTab: Record<TabId, number>;
  queue: string[]; // ordered episode ids — THE source array
  episodes: Record<string, Episode>;
  nowPlayingId: string;
  playing: boolean;
  sleepTimer: SleepId;
  editMode: boolean;
  openSwipeId: string | null;
  openMenuId: string | null;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  toast: Toast | null;
  refreshing: boolean;
  updated: boolean; // 'Updated just now' caption after a resolved refresh
  status: string; // vh announcement text inside the one polite dock
  speedTenths: number; // 8–20 → 0.8×–2.0×
  autoDownload: boolean;
  trimSilence: boolean;
  followed: Record<string, boolean>;
  dotIndex: number; // carousel page derived from user scroll
}

const INITIAL_STATE: EarmarkState = {
  tab: 'listen',
  scrollByTab: {listen: 0, discover: 0, downloads: 0, profile: 0},
  queue: INITIAL_QUEUE,
  episodes: Object.fromEntries(EPISODES.map(episode => [episode.id, episode])),
  nowPlayingId: NOW_PLAYING_ID,
  playing: true,
  sleepTimer: 'off',
  editMode: false,
  openSwipeId: null,
  openMenuId: null,
  sheetOpen: false,
  sheetDetent: 'medium',
  toast: null,
  refreshing: false,
  updated: false,
  status: '',
  speedTenths: 10,
  autoDownload: true,
  trimSilence: false,
  followed: {sh_sn: true},
  dotIndex: 0,
};

function useEarmarkState() {
  const [state, setState] = useState<EarmarkState>(INITIAL_STATE);
  const update = useCallback((id: string, patch: Partial<Episode>) => {
    setState(prev => ({
      ...prev,
      episodes: {...prev.episodes, [id]: {...prev.episodes[id], ...patch}},
    }));
  }, []);
  return {state, setState, update};
}

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver can tell the
 * 390px mobile stage from the desktop stage.
 */
function useElementWidth(ref: RefObject<HTMLElement | null>): number {
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
// EARMARK MARK — 28px folded-corner bookmark; the fold triangle doubles as
// a play glyph. Fill BRAND_TEXT in a 44×44 non-button nav slot.
// ---------------------------------------------------------------------------

function EarmarkMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M6 5a2 2 0 0 1 2-2h8.6L23 9.4V23a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"
          fill={BRAND_TEXT}
        />
        {/* Fold line reading as a play triangle. */}
        <path d="M16.6 3v6.4H23z" fill="var(--color-background-body)" opacity={0.55} />
        <path d="M12 13.4l6 3.8-6 3.8z" fill="var(--color-background-body)" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber (real 'Resize sheet' button; click toggles the
// detent, drag is garnish, >120px past medium closes), 52px header with
// 44×44 X, focus-trapped dialog. Focus enters via preventScroll per the
// batch amendment (plain .focus() scroll-reveals the animating sheet
// inside the locked overflow-hidden column).
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, children}: SheetProps) {
  // Transient pointer-drag delta only — the detent lives in the one owner.
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
    if (!movedRef.current) return; // plain click → onClick toggles
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
      className="emk-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease',
      }}>
      <button
        type="button"
        className="emk-btn emk-focusable"
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
          className="emk-btn emk-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QUEUE ROW — 72px; grip drag reorders (crossing 36px midpoints swaps),
// horizontal swipe reveals the 72px BRAND_FILL Archive block (snap −72,
// one open at a time), the 44×44 ellipsis menu is the mandatory fallback
// ('Move to top' / 'Archive'), and Edit mode swaps grip+ellipsis for
// ChevronUp/Down pairs (boundary buttons disabled at 35%). The rowDivider
// IS the progress meter (playedSec/durationSec in BRAND_FILL, inset 104).
// ---------------------------------------------------------------------------

interface QueueRowProps {
  episode: Episode;
  index: number;
  count: number;
  editMode: boolean;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onMove: (id: string, dir: 'up' | 'down') => void;
  onMoveTop: (id: string) => void;
  onArchive: (id: string) => void;
  onSwipeOpen: (id: string) => void;
  onSwipeClose: () => void;
  onToggleMenu: (id: string, opener: HTMLElement) => void;
}

function QueueRow({
  episode,
  index,
  count,
  editMode,
  isSwipeOpen,
  isMenuOpen,
  isLast,
  reducedMotion,
  menuRef,
  onMove,
  onMoveTop,
  onArchive,
  onSwipeOpen,
  onSwipeClose,
  onToggleMenu,
}: QueueRowProps) {
  // Transient drag deltas only — order itself lives in the one owner.
  const [dragY, setDragY] = useState<number | null>(null);
  const [dragX, setDragX] = useState<number | null>(null);
  const gripStartYRef = useRef(0);
  const swipeStartXRef = useRef(0);
  const movedRef = useRef(false);

  const remainSec = remainingSec(episode);
  const meterPct = (episode.playedSec / episode.durationSec) * 100;

  // GRIP DRAG — translateY; crossing a 36px midpoint fires one splice and
  // rebases the origin by the 72px row height.
  const onGripPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (editMode) return;
    gripStartYRef.current = event.clientY;
    setDragY(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onGripPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragY == null) return;
    let dy = event.clientY - gripStartYRef.current;
    if (dy > 36 && index < count - 1) {
      onMove(episode.id, 'down');
      gripStartYRef.current += 72;
      dy -= 72;
    } else if (dy < -36 && index > 0) {
      onMove(episode.id, 'up');
      gripStartYRef.current -= 72;
      dy += 72;
    }
    setDragY(dy);
  };
  const onGripPointerUp = () => setDragY(null);
  // Keyboard parity directly on the grip (Edit-mode chevrons remain the
  // documented non-gesture path).
  const onGripKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowUp' && index > 0) {
      event.preventDefault();
      onMove(episode.id, 'up');
    } else if (event.key === 'ArrowDown' && index < count - 1) {
      event.preventDefault();
      onMove(episode.id, 'down');
    }
  };

  // SWIPE-TO-REVEAL — disabled in edit mode; snap open at −72.
  const base = isSwipeOpen ? -72 : 0;
  const offset = dragX != null ? Math.max(-72, Math.min(0, base + dragX)) : base;
  const onSwipePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (editMode || dragY != null) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    swipeStartXRef.current = event.clientX;
    movedRef.current = false;
    setDragX(0);
  };
  const onSwipePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - swipeStartXRef.current;
    if (Math.abs(dx) > 8) {
      movedRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDragX(dx);
  };
  const onSwipePointerUp = () => {
    if (dragX == null) return;
    const settled = Math.max(-72, Math.min(0, base + dragX));
    setDragX(null);
    if (movedRef.current) {
      if (settled < -36) onSwipeOpen(episode.id);
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

  const dragging = dragY != null;
  return (
    <div
      style={{
        ...styles.rowOuter,
        ...(dragging
          ? {transform: \`translateY(\${dragY}px)\`, zIndex: 2, boxShadow: '0 4px 16px var(--color-shadow)'}
          : null),
      }}>
      <div style={styles.rowClip}>
        <button
          type="button"
          className="emk-btn"
          style={styles.archiveAction}
          tabIndex={isSwipeOpen ? 0 : -1}
          aria-hidden={!isSwipeOpen}
          onClick={() => onArchive(episode.id)}>
          <Icon icon={ArchiveIcon} size="md" color="inherit" />
          Archive
        </button>
        <div
          style={{
            ...styles.rowContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 200ms ease',
          }}
          onPointerDown={onSwipePointerDown}
          onPointerMove={onSwipePointerMove}
          onPointerUp={onSwipePointerUp}>
          {editMode ? null : (
            <button
              type="button"
              className="emk-btn emk-focusable"
              style={styles.gripBtn}
              aria-label={\`Reorder \${episode.title} — drag, or press arrow keys\`}
              onPointerDown={onGripPointerDown}
              onPointerMove={onGripPointerMove}
              onPointerUp={onGripPointerUp}
              onKeyDown={onGripKeyDown}>
              <Icon icon={GripVerticalIcon} size="md" color="inherit" />
            </button>
          )}
          <span style={{...styles.thumb, ...artFor(episode.show), ...(editMode ? {marginInlineStart: 12} : null)}} aria-hidden>
            {initialsFor(episode.show)}
          </span>
          <button
            type="button"
            className="emk-btn emk-focusable"
            style={styles.rowMain}
            aria-label={episode.title}
            aria-expanded={isMenuOpen}
            onClick={guardClick(opener => {
              if (isSwipeOpen) {
                onSwipeClose();
                return;
              }
              onToggleMenu(episode.id, opener);
            })}>
            <span style={styles.rowText}>
              <span style={styles.rowPrimary}>{episode.title}</span>
              <span style={styles.rowSecondary}>
                {episode.show} · Ep {episode.epNum}
              </span>
            </span>
            <span style={styles.metaStack}>
              <span style={styles.posOverline}>#{index + 1}</span>
              <span style={styles.remainingWrap}>
                {episode.downloaded ? (
                  <span style={styles.dlGlyph} title="Downloaded">
                    <Icon icon={ArrowDownCircleIcon} size="xsm" color="inherit" />
                  </span>
                ) : null}
                <span style={styles.remaining}>{fmtClock(remainSec)}</span>
              </span>
            </span>
          </button>
          {editMode ? (
            <span style={styles.chevronPair}>
              <button
                type="button"
                className="emk-btn emk-focusable"
                style={{...styles.iconBtn, ...(index === 0 ? styles.chevronDisabled : null)}}
                aria-label={\`Move \${episode.title} up\`}
                disabled={index === 0}
                onClick={() => onMove(episode.id, 'up')}>
                <Icon icon={ChevronUpIcon} size="md" color="inherit" />
              </button>
              <button
                type="button"
                className="emk-btn emk-focusable"
                style={{...styles.iconBtn, ...(index === count - 1 ? styles.chevronDisabled : null)}}
                aria-label={\`Move \${episode.title} down\`}
                disabled={index === count - 1}
                onClick={() => onMove(episode.id, 'down')}>
                <Icon icon={ChevronDownIcon} size="md" color="inherit" />
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="emk-btn emk-focusable"
              style={styles.iconBtn}
              aria-label={\`Actions for \${episode.title}\`}
              aria-expanded={isMenuOpen}
              onClick={guardClick(opener => onToggleMenu(episode.id, opener))}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </button>
          )}
        </div>
      </div>
      {isMenuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Actions for \${episode.title}\`}
          style={styles.anchoredMenu}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const itemIndex = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? itemIndex + 1 : itemIndex - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button
            type="button"
            role="menuitem"
            className="emk-btn emk-focusable"
            style={styles.menuRow}
            onClick={() => onMoveTop(episode.id)}>
            <Icon icon={ChevronUpIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Move to top</span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            role="menuitem"
            className="emk-btn emk-focusable"
            style={styles.menuRow}
            onClick={() => onArchive(episode.id)}>
            <Icon icon={ArchiveIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Archive</span>
          </button>
        </div>
      ) : null}
      {/* Divider-as-meter — zero-progress rows read as a plain divider;
          last row renders none. aria-hidden: remaining time is in the row
          text already. */}
      {isLast ? null : (
        <div style={styles.meterTrack} aria-hidden>
          {meterPct > 0 ? <div style={{...styles.meterFill, width: \`\${meterPct}%\`}} /> : null}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SKELETON — 4 rows at exactly 72px inside the same listCard geometry;
// deterministic staggered widths; one shared shimmer sweep (REMOVED under
// reduced motion — the static muted blocks alone encode loading).
// ---------------------------------------------------------------------------

function SkeletonRows() {
  return (
    <div style={{...styles.listCard, position: 'relative'}} aria-busy="true">
      {SKELETON_PRIMARY.map((primary, index) => (
        <div key={index}>
          {/* Meter-track divider (2px, inset 104) so resolution causes
              ZERO layout shift against the loaded rows' divider-meters. */}
          {index > 0 ? <div style={styles.meterTrack} /> : null}
          <div style={styles.skeletonRow} aria-hidden>
            <div style={styles.skeletonThumb} />
            <div style={styles.skeletonBars}>
              <div style={{...styles.skeletonBar, width: primary}} />
              <div style={{...styles.skeletonBar, width: SKELETON_SECONDARY[index]}} />
            </div>
          </div>
        </div>
      ))}
      <div className="emk-shimmer" style={styles.shimmerOverlay} aria-hidden />
    </div>
  );
}

// ---------------------------------------------------------------------------
// LEDGER MATH — pure; used by render AND by mutation handlers to phrase
// toast text from the post-mutation queue.
// ---------------------------------------------------------------------------

function ledgerFor(
  queue: string[],
  episodes: Record<string, Episode>,
  nowPlayingId: string,
): {totalMin: number; ends: string} {
  const totalSec =
    remainingSec(episodes[nowPlayingId]) +
    queue.reduce((sum, id) => sum + remainingSec(episodes[id]), 0);
  const totalMin = Math.floor(totalSec / 60); // see remainingSec() note
  return {totalMin, ends: fmtTime(BASE_MIN + totalMin)};
}

const TAB_TITLES: Record<TabId, string> = {
  listen: 'Up Next',
  discover: 'Discover',
  downloads: 'Downloads',
  profile: 'Profile',
};

const TABS = [
  {id: 'listen' as TabId, label: 'Listen', icon: ListMusicIcon},
  {id: 'discover' as TabId, label: 'Discover', icon: CompassIcon},
  {id: 'downloads' as TabId, label: 'Downloads', icon: ArrowDownCircleIcon},
  {id: 'profile' as TabId, label: 'Profile', icon: CircleUserIcon},
];

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobilePodcastQueueTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {state, setState, update} = useEarmarkState();
  const toastSeqRef = useRef(0);

  // Container query on the LEDGER STRIP: spec threshold 360px border-box;
  // the ResizeObserver reports the content box (strip minus 32px padding),
  // so the compact 'QUEUE · n' label kicks in below 328px of content.
  const ledgerRef = useRef<HTMLDivElement | null>(null);
  const ledgerWidth = useElementWidth(ledgerRef);
  const ledgerCompact = ledgerWidth > 0 && ledgerWidth < 328;

  // Focus plumbing.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const queueMenuRef = useRef<HTMLDivElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const mpInfoBtnRef = useRef<HTMLButtonElement | null>(null);
  const undoBtnRef = useRef<HTMLButtonElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  // DERIVED — everything computes in render from \`queue\` + \`episodes\`.
  const nowPlaying = state.episodes[state.nowPlayingId];
  const npRemainSec = remainingSec(nowPlaying);
  const {totalMin, ends} = ledgerFor(state.queue, state.episodes, state.nowPlayingId);
  const mpPct = (nowPlaying.playedSec / nowPlaying.durationSec) * 100; // 65.9 at rest
  const upNext = state.queue.length > 0 ? state.episodes[state.queue[0]] : null;
  const downloads = EPISODES.map(episode => state.episodes[episode.id]).filter(
    episode => episode.downloaded && episode.sizeMB != null,
  );
  const downloadsMB = downloads.reduce((sum, episode) => sum + (episode.sizeMB ?? 0), 0);
  const sleepOption = SLEEP_OPTIONS.find(option => option.id === state.sleepTimer) ?? SLEEP_OPTIONS[0];

  const makeToast = (text: string, undo: Toast['undo'] = null): Toast => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, text, undo};
  };

  // Demo-page scroller (the shell does NOT own scroll) — nearest scrollable
  // ancestor of the wrapper, falling back to the document.
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

  // PER-TAB STATE PERSISTENCE — scroll saved on exit, restored on entry;
  // editMode and swipe state survive; the open sheet does NOT (overlays
  // belong to their moment). Re-tapping the active tab scrolls to top.
  const selectTab = (next: TabId) => {
    const scroller = findScroller();
    if (next === state.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    setState(prev => ({
      ...prev,
      tab: next,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
      sheetOpen: false,
      sheetDetent: 'medium',
      openMenuId: null,
    }));
  };
  useEffect(() => {
    const scroller = findScroller();
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.tab] ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TABS.map(tab => tab.id);
    const current = order.indexOf(state.tab);
    const next =
      event.key === 'ArrowRight'
        ? order[(current + 1) % order.length]
        : order[(current + order.length - 1) % order.length];
    selectTab(next);
    document.getElementById(\`emk-tab-\${next}\`)?.focus();
  };

  // SIGNATURE REORDER RIPPLE — one splice; ledger, 'Up next:', '#n'
  // overlines, and the badge all re-derive in the SAME render. The sum is
  // reorder-invariant (still 6:42 PM) — correct arithmetic, by design.
  const moveEpisode = (id: string, dir: 'up' | 'down') => {
    setState(prev => {
      const from = prev.queue.indexOf(id);
      const to = dir === 'up' ? from - 1 : from + 1;
      if (from < 0 || to < 0 || to >= prev.queue.length) return prev;
      const queue = [...prev.queue];
      [queue[from], queue[to]] = [queue[to], queue[from]];
      return {...prev, queue, toast: makeToast(\`Moved to position \${to + 1}\`)};
    });
  };

  const moveToTop = (id: string) => {
    setState(prev => {
      const from = prev.queue.indexOf(id);
      if (from <= 0) return {...prev, openMenuId: null};
      const queue = [id, ...prev.queue.filter(queueId => queueId !== id)];
      return {...prev, queue, openMenuId: null, toast: makeToast('Moved to position 1')};
    });
    menuOpenerRef.current?.focus();
  };

  // ARCHIVE — undoOverConfirm: executes IMMEDIATELY, persistent Undo toast
  // (no timers); Undo restores the EXACT prior index. A second archive
  // replaces the first toast (its undo window simply ends — stress 5).
  const archiveEpisode = (id: string) => {
    setState(prev => {
      const index = prev.queue.indexOf(id);
      if (index < 0) return prev;
      const queue = prev.queue.filter(queueId => queueId !== id);
      const next = ledgerFor(queue, prev.episodes, prev.nowPlayingId);
      return {
        ...prev,
        queue,
        openSwipeId: null,
        openMenuId: null,
        toast: makeToast(\`Archived — queue ends \${next.ends}\`, {id, index}),
      };
    });
    // The row (and any menu opener inside it) unmounts; park keyboard
    // focus on the Undo affordance once it exists.
    requestAnimationFrame(() => undoBtnRef.current?.focus());
  };

  const undoArchive = () => {
    setState(prev => {
      const undo = prev.toast?.undo;
      if (undo == null) return prev;
      const queue = [...prev.queue];
      queue.splice(Math.min(undo.index, queue.length), 0, undo.id);
      return {...prev, queue, toast: makeToast('Restored')};
    });
  };

  // ADD (Discover) — appends; badge grows, ledger grows, toast quotes the
  // new end time (pre-verified fixtures: 7:20 / 7:11 / 7:33 PM).
  const addToQueue = (id: string) => {
    setState(prev => {
      if (prev.queue.includes(id)) return prev;
      const queue = [...prev.queue, id];
      const next = ledgerFor(queue, prev.episodes, prev.nowPlayingId);
      return {...prev, queue, toast: makeToast(\`Added to queue — ends \${next.ends}\`)};
    });
  };

  // SKIP-30 — one update() widens the 2px hairline (67.1%) AND drops the
  // ledger to '2 hr 31 min · Ends 6:41 PM' (9090 s floored to 151 min).
  const skip30 = () => {
    update(state.nowPlayingId, {
      playedSec: Math.min(nowPlaying.durationSec, nowPlaying.playedSec + 30),
    });
  };

  const selectSleep = (id: SleepId) => {
    const option = SLEEP_OPTIONS.find(candidate => candidate.id === id);
    if (option == null) return;
    setState(prev => ({...prev, sleepTimer: id, toast: makeToast(option.announce)}));
  };

  // REFRESH — press #1 shows 4 skeleton rows ('Loading' announced once);
  // press #2 resolves to the same 6 rows zero-shift + 'Updated just now'.
  // User-driven both ways; no timers.
  const pressRefresh = () => {
    setState(prev =>
      prev.refreshing
        ? {...prev, refreshing: false, updated: true, status: 'Updated just now'}
        : {...prev, refreshing: true, updated: false, status: 'Loading', openSwipeId: null, openMenuId: null},
    );
  };

  const toggleFollow = (show: Show) => {
    setState(prev => {
      const on = !prev.followed[show.id];
      return {
        ...prev,
        followed: {...prev.followed, [show.id]: on},
        toast: makeToast(on ? \`Following \${show.name}\` : \`Unfollowed \${show.name}\`),
      };
    });
  };

  const stepSpeed = (delta: number) => {
    setState(prev => ({
      ...prev,
      speedTenths: Math.max(8, Math.min(20, prev.speedTenths + delta)),
    }));
  };

  // SHEET / MENU / OVERLAY LIFECYCLE ------------------------------------------

  const openSheet = () => {
    setState(prev => ({...prev, sheetOpen: true, sheetDetent: 'medium', openSwipeId: null, openMenuId: null}));
  };
  const closeSheet = () => {
    setState(prev => ({...prev, sheetOpen: false, sheetDetent: 'medium'}));
    mpInfoBtnRef.current?.focus();
  };
  const toggleMenu = (id: string, opener: HTMLElement) => {
    menuOpenerRef.current = opener;
    setState(prev => ({
      ...prev,
      openMenuId: prev.openMenuId === id ? null : id,
      openSwipeId: null,
    }));
  };
  const closeMenu = () => {
    setState(prev => ({...prev, openMenuId: null}));
    menuOpenerRef.current?.focus();
  };

  // Focus enters overlays with preventScroll (amendment: plain .focus()
  // scroll-reveals the animating sheet inside the locked column and
  // beaches it mid-screen); the scrollTop reset is belt to suspender.
  useEffect(() => {
    if (state.sheetOpen) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [state.sheetOpen]);
  useEffect(() => {
    if (state.openMenuId != null) {
      queueMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
    }
  }, [state.openMenuId]);

  // Escape closes the TOPMOST overlay only: menu > sheet > open swipe.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.openMenuId != null) closeMenu();
      else if (state.sheetOpen) closeSheet();
      else if (state.openSwipeId != null) setState(prev => ({...prev, openSwipeId: null}));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.openMenuId, state.sheetOpen, state.openSwipeId]);

  // Tap-elsewhere closes an open swipe row (the open row itself is exempt
  // so the revealed Archive block stays tappable).
  const onShellPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (state.openSwipeId == null) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-swipe-open="true"]') == null) {
      setState(prev => ({...prev, openSwipeId: null}));
    }
  };

  // Carousel page dots derive from user scroll; dots scroll cards back.
  const onRailScroll = () => {
    const rail = railRef.current;
    if (rail == null) return;
    const cards = Array.from(rail.children) as HTMLElement[];
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const dist = Math.abs(card.offsetLeft - rail.scrollLeft - 16);
      if (dist < bestDist) {
        bestDist = dist;
        best = index;
      }
    });
    setState(prev => (prev.dotIndex === best ? prev : {...prev, dotIndex: best}));
  };
  const scrollToCard = (index: number) => {
    const rail = railRef.current;
    const card = rail?.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      inline: 'start',
      block: 'nearest',
    });
  };
  const onRailKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = Math.max(0, Math.min(SHOWS.length - 1, state.dotIndex + (event.key === 'ArrowRight' ? 1 : -1)));
    scrollToCard(next);
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // -------------------------------------------------------------------------
  // TAB PANELS
  // -------------------------------------------------------------------------

  const listenPanel = (
    <>
      {/* QUEUE LEDGER — 48px strip; both sides tabular; leading label
          drops to 'QUEUE · n' below the 360px container threshold. */}
      <div ref={ledgerRef} style={styles.ledger}>
        <h2 className="emk-vh">
          Up next queue — {state.queue.length} episodes, {fmtDuration(totalMin)} remaining, ends {ends}
        </h2>
        <span style={styles.ledgerLead} aria-hidden>
          {ledgerCompact ? 'QUEUE' : 'UP NEXT'} · {state.queue.length}
        </span>
        <span style={styles.ledgerTrail} aria-hidden>
          {fmtDuration(totalMin)} · Ends {ends}
        </span>
      </div>
      {state.updated && !state.refreshing ? <p style={styles.updatedCaption}>Updated just now</p> : null}
      {state.refreshing ? (
        <SkeletonRows />
      ) : state.queue.length === 0 ? (
        // TRUE-EMPTY (stress 4) — the ledger above still reconciles:
        // 'UP NEXT · 0' and '14 min · Ends 4:24 PM' (970+14).
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={ListMusicIcon} size="lg" color="inherit" />
          </span>
          <h3 style={styles.emptyTitle}>Queue is empty</h3>
          <p style={styles.emptyBody}>Episodes you add appear here.</p>
          <button
            type="button"
            className="emk-btn emk-focusable"
            style={styles.emptyAction}
            onClick={() => selectTab('discover')}>
            Browse Discover
          </button>
        </div>
      ) : (
        <div style={styles.listCard}>
          {state.queue.map((id, index) => (
            <div key={id} data-swipe-open={state.openSwipeId === id ? 'true' : undefined}>
              <QueueRow
                episode={state.episodes[id]}
                index={index}
                count={state.queue.length}
                editMode={state.editMode}
                isSwipeOpen={state.openSwipeId === id}
                isMenuOpen={state.openMenuId === id}
                isLast={index === state.queue.length - 1}
                reducedMotion={reducedMotion}
                menuRef={queueMenuRef}
                onMove={moveEpisode}
                onMoveTop={moveToTop}
                onArchive={archiveEpisode}
                onSwipeOpen={swipeId => setState(prev => ({...prev, openSwipeId: swipeId, openMenuId: null}))}
                onSwipeClose={() => setState(prev => (prev.openSwipeId == null ? prev : {...prev, openSwipeId: null}))}
                onToggleMenu={toggleMenu}
              />
            </div>
          ))}
        </div>
      )}
      {/* Terminal caption — SAME sum as the ledger (one helper, one
          source array; the two can never drift). */}
      {!state.refreshing && state.queue.length > 0 ? (
        <p style={styles.terminalCaption}>
          {state.queue.length} episode{state.queue.length === 1 ? '' : 's'} · {fmtDuration(totalMin)}
        </p>
      ) : null}
      <div style={{height: 24}} />
    </>
  );

  const discoverPanel = (
    <>
      <h2 style={styles.sectionHeader}>Featured</h2>
      <div
        ref={railRef}
        style={styles.carousel}
        role="group"
        aria-label="Featured shows"
        tabIndex={0}
        className="emk-focusable"
        onScroll={onRailScroll}
        onKeyDown={onRailKeyDown}>
        {SHOWS.map(show => (
          <button
            key={show.id}
            type="button"
            className="emk-btn emk-focusable"
            style={styles.showCard}
            aria-pressed={state.followed[show.id] === true}
            aria-label={\`\${show.name} — \${state.followed[show.id] ? 'following' : 'follow'}\`}
            onClick={() => toggleFollow(show)}>
            <span style={{...styles.showArt, ...artFor(show.name)}} aria-hidden>
              {initialsFor(show.name)}
              {state.followed[show.id] ? <span style={styles.followChip}>Following</span> : null}
            </span>
            <span style={styles.showName}>{show.name}</span>
            <span style={styles.showTagline}>{show.tagline}</span>
          </button>
        ))}
      </div>
      <div style={styles.dotRow}>
        {SHOWS.map((show, index) => (
          <button
            key={show.id}
            type="button"
            className="emk-btn emk-focusable"
            style={styles.dotHit}
            aria-label={\`Go to \${show.name}\`}
            aria-current={state.dotIndex === index}
            onClick={() => scrollToCard(index)}>
            <span style={{...styles.dot, ...(state.dotIndex === index ? styles.dotActive : null)}} aria-hidden />
          </button>
        ))}
      </div>
      <h2 style={styles.sectionHeader}>Trending</h2>
      <div style={styles.listCard}>
        {TRENDING_IDS.map((id, index) => {
          const episode = state.episodes[id];
          const inQueue = state.queue.includes(id);
          return (
            <div key={id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <div style={styles.trendRow}>
                <span style={styles.trendText}>
                  <span style={styles.rowPrimary}>{episode.title}</span>
                  <span style={styles.rowSecondary}>
                    {episode.show} · {episode.durationLabel}
                  </span>
                </span>
                <button
                  type="button"
                  className="emk-btn emk-focusable"
                  style={{...styles.addPill, ...(inQueue ? styles.addPillDone : null)}}
                  disabled={inQueue}
                  aria-label={inQueue ? \`\${episode.title} added to queue\` : \`Add \${episode.title} to queue\`}
                  onClick={() => addToQueue(id)}>
                  {inQueue ? 'Added' : 'Add'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{height: 24}} />
    </>
  );

  const downloadsPanel = (
    <>
      <h2 style={styles.sectionHeader}>On this phone</h2>
      <p style={styles.tabCaption}>
        {downloads.length} downloads · {downloadsMB.toFixed(1)} MB
      </p>
      <div style={styles.listCard}>
        {downloads.map((episode, index) => (
          <div key={episode.id}>
            {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
            <div style={styles.dlRow}>
              <span style={{...styles.dlThumb, ...artFor(episode.show)}} aria-hidden>
                {initialsFor(episode.show)}
              </span>
              <span style={styles.trendText}>
                <span style={styles.rowPrimary}>{episode.title}</span>
                <span style={styles.rowSecondary}>
                  {episode.show} · {(episode.sizeMB ?? 0).toFixed(1)} MB
                </span>
              </span>
              <span style={styles.dlGlyph} aria-hidden>
                <Icon icon={ArrowDownCircleIcon} size="sm" color="inherit" />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div style={{height: 24}} />
    </>
  );

  const speedLabel = \`\${(state.speedTenths / 10).toFixed(1)}×\`;
  const profilePanel = (
    <>
      <h2 style={styles.sectionHeader}>Playback</h2>
      <div style={styles.listCard}>
        <button
          type="button"
          role="switch"
          aria-checked={state.autoDownload}
          className="emk-btn emk-focusable"
          style={styles.utilityRow}
          onClick={() => setState(prev => ({...prev, autoDownload: !prev.autoDownload}))}>
          <span style={styles.utilityLabel}>Auto-download Up Next</span>
          <span
            style={{...styles.switchTrack, ...(state.autoDownload ? styles.switchTrackOn : null)}}
            aria-hidden>
            <span
              className="emk-anim"
              style={{...styles.switchThumb, ...(state.autoDownload ? styles.switchThumbOn : null)}}
            />
          </span>
        </button>
        <div style={styles.rowDivider} />
        <button
          type="button"
          role="switch"
          aria-checked={state.trimSilence}
          className="emk-btn emk-focusable"
          style={styles.utilityRow}
          onClick={() => setState(prev => ({...prev, trimSilence: !prev.trimSilence}))}>
          <span style={styles.utilityLabel}>Trim silence</span>
          <span
            style={{...styles.switchTrack, ...(state.trimSilence ? styles.switchTrackOn : null)}}
            aria-hidden>
            <span
              className="emk-anim"
              style={{...styles.switchThumb, ...(state.trimSilence ? styles.switchThumbOn : null)}}
            />
          </span>
        </button>
        <div style={styles.rowDivider} />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Playback speed</span>
          <span style={styles.stepper}>
            <button
              type="button"
              className="emk-btn emk-focusable"
              style={{...styles.stepperHalf, ...(state.speedTenths <= 8 ? styles.stepperDisabled : null)}}
              aria-label="Decrease playback speed"
              disabled={state.speedTenths <= 8}
              onClick={() => stepSpeed(-1)}>
              <Icon icon={MinusIcon} size="xsm" color="inherit" />
            </button>
            <span style={styles.stepperRule} aria-hidden />
            <button
              type="button"
              className="emk-btn emk-focusable"
              style={{...styles.stepperHalf, ...(state.speedTenths >= 20 ? styles.stepperDisabled : null)}}
              aria-label="Increase playback speed"
              disabled={state.speedTenths >= 20}
              onClick={() => stepSpeed(1)}>
              <Icon icon={PlusIcon} size="xsm" color="inherit" />
            </button>
          </span>
          <span
            tabIndex={0}
            role="spinbutton"
            className="emk-focusable"
            aria-label="Playback speed"
            aria-valuenow={state.speedTenths / 10}
            aria-valuemin={0.8}
            aria-valuemax={2}
            aria-valuetext={speedLabel}
            style={{...styles.utilityValue, color: 'var(--color-text-primary)'}}
            onKeyDown={event => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                stepSpeed(1);
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                stepSpeed(-1);
              }
            }}>
            {speedLabel}
          </span>
        </div>
        <div style={styles.rowDivider} />
        <div style={styles.utilityRow}>
          <span style={styles.utilityLabel}>Storage used</span>
          {/* Same reduce as the Downloads caption — one source of truth. */}
          <span style={styles.utilityValue}>{downloadsMB.toFixed(1)} MB</span>
        </div>
      </div>
      <div style={{height: 24}} />
    </>
  );

  const panels: Record<TabId, ReactNode> = {
    listen: listenPanel,
    discover: discoverPanel,
    downloads: downloadsPanel,
    profile: profilePanel,
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  const eoeLabel = \`End of episode (\${fmtClock(npRemainSec)} left)\`;
  const sleepLabels: Record<SleepId, string> = {
    off: 'Off',
    s5: '5 min',
    s10: '10 min',
    s15: '15 min',
    s30: '30 min',
    eoe: eoeLabel,
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{EARMARK_CSS}</style>
      <div ref={shellRef} style={shellStyle} onPointerDown={onShellPointerDown}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <EarmarkMark />
          </div>
          <h1 style={styles.navTitle}>{TAB_TITLES[state.tab]}</h1>
          <div style={styles.navTrailing}>
            {state.tab === 'listen' ? (
              <>
                <button
                  type="button"
                  className="emk-btn emk-focusable"
                  style={{...styles.editBtn, ...(state.editMode ? styles.editBtnDone : null)}}
                  disabled={state.refreshing}
                  onClick={() =>
                    setState(prev => ({
                      ...prev,
                      editMode: !prev.editMode,
                      openSwipeId: null,
                      openMenuId: null,
                    }))
                  }>
                  {state.editMode ? 'Done' : 'Edit'}
                </button>
                <button
                  type="button"
                  className="emk-btn emk-focusable"
                  style={styles.iconBtn}
                  aria-label={state.refreshing ? 'Finish refreshing queue' : 'Refresh queue'}
                  onClick={pressRefresh}>
                  <Icon icon={RefreshCwIcon} size="md" color="inherit" />
                </button>
              </>
            ) : null}
          </div>
        </header>

        <main
          style={styles.main}
          role="tabpanel"
          id={\`emk-panel-\${state.tab}\`}
          aria-labelledby={\`emk-tab-\${state.tab}\`}>
          {panels[state.tab]}
        </main>

        {/* TOAST DOCK — sticky-in-flow (height-0 anchor at bottom 142 =
            64 tabBar + 66 miniPlayer + 12), THE one polite live region.
            Undo toasts persist until replaced — no timers. Refresh
            announcements ride the same region as vh text. */}
        <div style={styles.toastDock} aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast}>
              <span style={styles.toastText}>{state.toast.text}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    ref={undoBtnRef}
                    className="emk-btn emk-focusable"
                    style={styles.undoBtn}
                    onClick={undoArchive}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
          {state.status !== '' ? <span className="emk-vh">{state.status}</span> : null}
        </div>

        {/* MINI PLAYER — 66px = 2px meter + 64px row; identical blur to
            the tabBar so the two sticky chromes read as one slab. */}
        <div style={styles.miniPlayer}>
          <div style={styles.mpMeterTrack} aria-hidden>
            <div style={{...styles.mpMeterFill, width: \`\${mpPct}%\`}} />
          </div>
          <div style={styles.mpRow}>
            <span style={{...styles.mpArt, ...artFor(nowPlaying.show)}} aria-hidden>
              {initialsFor(nowPlaying.show)}
            </span>
            <button
              type="button"
              ref={mpInfoBtnRef}
              className="emk-btn emk-focusable"
              style={styles.mpInfoBtn}
              aria-label={\`Now playing: \${nowPlaying.title} — open player\`}
              onClick={openSheet}>
              <span style={styles.mpInfoText}>
                <span style={styles.mpTitle}>{nowPlaying.title}</span>
                <span style={styles.mpNext}>
                  {upNext != null ? \`Up next: \${upNext.title}\` : 'Nothing queued'}
                </span>
              </span>
              {sleepOption.chip != null ? (
                <span style={styles.sleepChip}>
                  <Icon icon={MoonIcon} size="xsm" color="inherit" />
                  {sleepOption.chip}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="emk-btn emk-focusable"
              style={styles.skipBtn}
              aria-label="Skip forward 30 seconds"
              onClick={skip30}>
              <Icon icon={RotateCwIcon} size="md" color="inherit" />
              <span style={styles.skipNum} aria-hidden>
                30
              </span>
            </button>
            <button
              type="button"
              className="emk-btn emk-focusable"
              style={{...styles.skipBtn, color: BRAND_TEXT}}
              aria-label={state.playing ? 'Pause' : 'Play'}
              aria-pressed={state.playing}
              onClick={() => setState(prev => ({...prev, playing: !prev.playing}))}>
              <Icon icon={state.playing ? PauseIcon : PlayIcon} size="lg" color="inherit" />
            </button>
          </div>
        </div>

        {/* TAB BAR — exactly 64px, four flex:1 tabs, live Listen badge. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Earmark sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const isActive = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                id={\`emk-tab-\${tab.id}\`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={\`emk-panel-\${tab.id}\`}
                tabIndex={isActive ? 0 : -1}
                className="emk-btn emk-focusable"
                style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                  {tab.id === 'listen' ? (
                    <span style={styles.tabBadge} aria-label={\`\${state.queue.length} in queue\`}>
                      {state.queue.length}
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

        {/* NOW PLAYING SHEET — medium detent 55%; the one legal inner
            scroller; sleep rows are a radiogroup. */}
        {state.sheetOpen ? (
          <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
        ) : null}
        {state.sheetOpen ? (
          <Sheet
            titleId="emk-np-title"
            title="Now Playing"
            detent={state.sheetDetent}
            onDetentChange={detent => setState(prev => ({...prev, sheetDetent: detent}))}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}>
            <div style={styles.npBlock}>
              <span style={{...styles.npArt, ...artFor(nowPlaying.show)}} aria-hidden>
                {initialsFor(nowPlaying.show)}
              </span>
              <div style={styles.npText}>
                <h3 style={styles.npTitle}>{nowPlaying.title}</h3>
                <span style={styles.npMeta}>
                  {nowPlaying.show} · Ep {nowPlaying.epNum}
                </span>
                <span style={styles.npMeta}>
                  {fmtClock(npRemainSec)} left of {nowPlaying.durationLabel}
                </span>
              </div>
            </div>
            {nowPlaying.notes != null ? <p style={styles.npNotes}>{nowPlaying.notes}</p> : null}
            <h3 style={styles.sheetSectionHeader}>Sleep Timer</h3>
            <div
              style={styles.sleepCard}
              role="radiogroup"
              aria-label="Sleep timer"
              onKeyDown={event => {
                const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
                if (!keys.includes(event.key)) return;
                event.preventDefault();
                const order = SLEEP_OPTIONS.map(option => option.id);
                const current = order.indexOf(state.sleepTimer);
                const delta = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
                const next = order[(current + delta + order.length) % order.length];
                selectSleep(next);
                const buttons = event.currentTarget.querySelectorAll<HTMLElement>('button');
                buttons[(current + delta + order.length) % order.length]?.focus();
              }}>
              {SLEEP_OPTIONS.map((option, index) => {
                const checked = state.sleepTimer === option.id;
                return (
                  <div key={option.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      tabIndex={checked ? 0 : -1}
                      className="emk-btn emk-focusable"
                      style={styles.radioRow}
                      onClick={() => selectSleep(option.id)}>
                      <span style={styles.radioLabel}>{sleepLabels[option.id]}</span>
                      <span style={{...styles.radioCircle, ...(checked ? styles.radioCircleOn : null)}} aria-hidden>
                        {checked ? <span style={styles.radioDot} /> : null}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};