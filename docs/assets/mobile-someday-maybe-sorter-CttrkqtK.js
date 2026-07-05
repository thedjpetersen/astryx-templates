var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Driftwood someday/maybe corpus
 *   frozen at TODAY = Jul 4 (day-of-year 185, non-leap): 52 ideas total =
 *   12 queue + 32 shelved (9 + 13 + 6 + 4 across four cadence buckets) +
 *   5 released + 3 activated. Every idea stores capturedAt, ageDays, and
 *   staleDate as consts that AGREE (ageDays = 185 − dayOfYear(capturedAt);
 *   staleDate = capturedAt + 90d — each entry hand-verified in a comment);
 *   ripeness stage DERIVES from ageDays (fresh 0–14 / ripening 15–45 /
 *   overripe 46–90 / compost >90) so hue can never disagree with the math.
 *   No Date.now(), no Math.random(), no network media.
 * @output Driftwood — Someday/Maybe Sorter: a 390px MOBILE triage surface
 *   where deferral is honest. Sort tab: navBar (paper-boat mark · 'This
 *   week · 3' pill) over a ~176px focusCard ('Build a backyard cold frame…',
 *   37 days old, RipenessBand marker at 41.1%), a 3-dock verdict row
 *   (Activate / Shelve / Release — three labeled 44px buttons, drag is
 *   garnish), and an 11-row UP NEXT listCard with 4×44 ripeness slivers.
 *   Shelf tab: 'On the shelf' large title over a 232px ShelfMap — four
 *   sagging SVG planks (sag = min(max(load−4,0),10)px → 5/9/2/0) with
 *   book-spine ticks tinted by ripeness and a '+1 OVER' strain badge at
 *   13/12 — then four bucket cards with loadMoreRows (Show 6/10/3/1 more).
 *   Resurfacing tab: Activated (3), Released — recoverable (5, Restore
 *   buttons), Next resurfacings (3 utility rows). Signature: SHELVE opens
 *   the CadenceDialSheet — a 55%-detent wheel of five EVENT-RELATIVE
 *   anchors (never raw dates); only Done commits, and one dispatch then
 *   moves the plank tick, the bucket header, the wheel's own '· n on
 *   shelf' loads, and the Next-resurfacings row. RELEASE executes
 *   immediately with a persistent Undo toast (undoOverConfirm).
 * @position Page template; emitted by \`astryx template mobile-someday-maybe-sorter\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, anchored menus)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the CadenceDialSheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The toast dock is
 *   STICKY-IN-FLOW (bottom 76, height 0) per the batch-2 amendment — the
 *   shell grows with content, so shell-absolute would pin the toast to the
 *   document bottom, off-viewport on tall tabs.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 28 to match the 28px text offset
 *   behind the 4px ripeness sliver); no desktop Layout frames, no side
 *   asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   (Driftwood teal #0D9488) split per house rule into decorative
 *   BRAND_ACCENT, darkened BRAND_ACCENT_FILL for fills AND brand-tinted
 *   text (plain #0D9488 fails white text at 3.6:1), and ON_ACCENT for
 *   text over the fill — contrast math at each declaration. Sanctioned
 *   non-brand literals: the CAUTION amber pair (Release is recoverable,
 *   NOT --color-error), the plank-wood pair, and the four aria-hidden
 *   ripeness stage colors (dates always carry the data in text).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — this
 *   template does not wire scroll-under; noted per contract); largeTitle
 *   rows 28/700 in a 52px block; focusCard ≈176px; dockRow 3×44px min
 *   buttons gap 8; rows 60px two-line (16/500 + 13/400, 2px gap) and 44px
 *   utility; sectionHeader 13/600 uppercase 0.06em at 32px (16 gutter +
 *   16 card pad), 20px top / 8px bottom; tabBar 64px sticky bottom z20;
 *   toast dock sticky bottom 76 z30; sheet detents 55% / calc(100%−56px),
 *   24px grabber zone with 36×5 pill, 52px sheet header; wheel rows 44px.
 *   TYPE (Figtree via --font-family-body): 28/700 large titles · 22/700
 *   focus title · 17/600 nav+sheet titles · 16/400 rows · 13/400 meta ·
 *   11/500 overlines+tab labels; nothing under 11px; tabular-nums on
 *   every count. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   into a full-row button; every gesture has a visible button path (the
 *   three docks ARE the drag's contract; wheel options are tap/arrow-key
 *   radios; grabber is a real 'Resize sheet' button).
 *
 * Responsive contract:
 * - Fluid 320–430px, no width:390 literals. dockRow is '1fr 1fr 1fr' gap
 *   8 (each dock (320−32−16)/3 ≈ 90.6px at 320; single-word 13/600 labels,
 *   11px previews ellipsized). Focus title clamps to 2 lines. ShelfMap
 *   SVG measures clientWidth via ResizeObserver — sag is absolute px so
 *   bows read identically at 320 and 430; a 320px plank fits
 *   floor((320−32−16)/9) = 30 ticks ≥ the max load of 14 rendered.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as the
 *   house-default centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout.
 */

import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  ArchiveIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  GripVerticalIcon,
  HistoryIcon,
  InboxIcon,
  MoreHorizontalIcon,
  Rows3Icon,
  WindIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand accent (Driftwood teal) — decorative uses only
// (boat sail fill, focus ring, wheel selection tint). #0D9488 vs white ≈
// 3.75:1 — fine for the 2px ring (non-text ≥3:1) but NOT for text.
const BRAND_ACCENT = 'light-dark(#0D9488, #5EEAD4)';
// Brand FILL + brand-tinted TEXT pair. Light #0F766E: on white ≈ 5.5:1 and
// white on it ≈ 5.5:1; dark #5EEAD4 on the ~#1C1C1E card ≈ 11.5:1. Plain
// #0D9488 fails white text at 3.6:1 — hence this darkened fill.
const BRAND_ACCENT_FILL = 'light-dark(#0F766E, #5EEAD4)';
// Text over a BRAND_ACCENT_FILL surface: #FFFFFF on #0F766E ≈ 5.5:1;
// #042F2E on #5EEAD4 ≈ 11.2:1.
const ON_ACCENT = 'light-dark(#FFFFFF, #042F2E)';
// 12% brand wash for the wheel's selected-row tint and the boat-mark chip.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// CAUTION amber — Release is the caution verb (fully recoverable), NOT
// --color-error. As 13px text AND as the Release dock's 1.5px interactive
// boundary: #B45309 on the white card ≈ 4.8:1 (text ✓, boundary ≥3:1 ✓);
// #FCD34D on the ~#1C1C1E dark card ≈ 9.6:1.
const CAUTION = 'light-dark(#B45309, #FCD34D)';
// ShelfMap plank wood — an interactive drawing inside a full-row button;
// #8A6D4B vs the light body bg ≈ 4.8:1, #A78B62 vs the dark body ≈ 5.6:1 —
// both clear the ≥3:1 interactive-boundary law against their ACTUAL
// surface (the body-toned plank block).
const PLANK = 'light-dark(#8A6D4B, #A78B62)';
// Ripeness stage scale — fixed 4 stops, aria-hidden DECORATIVE fills (the
// visible caption always states the explicit decay date, so hue never
// carries alone; dark sides lifted one weight for parity on dark cards).
const STAGE_FRESH = 'light-dark(#34D399, #6EE7B7)';
const STAGE_RIPENING = 'light-dark(#FBBF24, #FCD34D)';
const STAGE_OVERRIPE = 'light-dark(#F97316, #FB923C)';
const STAGE_COMPOST = 'light-dark(#78716C, #A8A29E)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, 2-line clamps, the
// visually-hidden h1, and the reduced-motion guard. Transitions animate
// transform/opacity only and collapse to instant under
// prefers-reduced-motion (the plank-dip keyframe is removed entirely).
// ---------------------------------------------------------------------------

const DW_CSS = \`
.dw-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.dw-btn:disabled { cursor: default; }
.dw-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.dw-anim { transition: transform 200ms ease, opacity 200ms ease; }
.dw-fade { transition: opacity 200ms ease; }
.dw-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@keyframes dw-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.dw-sheet-in { animation: dw-sheet-in 200ms ease; }
@keyframes dw-plank-dip {
  0% { transform: none; }
  40% { transform: translateY(3px); }
  100% { transform: none; }
}
.dw-plank-dip { animation: dw-plank-dip 260ms ease; }
.dw-vh {
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
  .dw-anim, .dw-fade { transition: none; }
  .dw-sheet-in, .dw-plank-dip { animation: none; }
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
  // Longhand overflows only — mixing the 'overflow' shorthand with the
  // shell's overflowX longhand across rerenders trips React's style-diff
  // warning and can drop the clip.
  shellLocked: {height: '100dvh', overflowY: 'hidden', overflowX: 'hidden'},
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, paddingInline 8, grid '1fr auto 1fr'.
  // Hairline + blur ALWAYS ON (scroll-under not wired; noted per contract).
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
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
  },
  brandBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
  },
  // 'This week · 3' — 28px pill inside a 44px-tall hit.
  pillHit: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  pill: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    background: BRAND_ACCENT_FILL,
    color: ON_ACCENT,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // FOCUS CARD — inset 16, listCard surface, padding 16, ≈176px total.
  focusWrap: {paddingInline: 16, marginTop: 16},
  focusCard: {
    position: 'relative',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 16,
  },
  focusOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    marginBottom: 8,
    paddingInlineEnd: 44,
  },
  focusTitle: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    marginBottom: 4,
    paddingInlineEnd: 8,
  },
  focusNote: {
    fontSize: 13,
    lineHeight: 1.35,
    color: 'var(--color-text-secondary)',
    marginBottom: 12,
  },
  focusCaptionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 6,
    fontSize: 13,
  },
  focusStaleCaption: {fontVariantNumeric: 'tabular-nums'},
  stageMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  stageDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  gripBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    touchAction: 'none',
  },
  // RIPENESS BAND — 8px horizontal, radius 2, hard-stop 4-color scale with
  // a 2px text-primary marker at min(age/90, 1) × 100%.
  bandTrack: {
    position: 'relative',
    width: '100%',
    height: 8,
    borderRadius: 2,
    background: \`linear-gradient(90deg, \${STAGE_FRESH} 0%, \${STAGE_FRESH} 15.5%, \${STAGE_RIPENING} 15.5%, \${STAGE_RIPENING} 50%, \${STAGE_OVERRIPE} 50%, \${STAGE_OVERRIPE} 89%, \${STAGE_COMPOST} 89%, \${STAGE_COMPOST} 100%)\`,
  },
  bandMarker: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 12,
    background: 'var(--color-text-primary)',
    borderRadius: 1,
  },
  // DOCK ROW — 3 columns gap 8, inset 16, each dock a 44px-min button.
  dockRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 8,
    paddingInline: 16,
    marginTop: 12,
  },
  dock: {
    minHeight: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingInline: 8,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  dockActivate: {background: BRAND_ACCENT_FILL, color: ON_ACCENT},
  dockShelve: {background: 'var(--color-background-muted)', color: 'var(--color-text-primary)'},
  // Release — CAUTION 1.5px interactive boundary (≥3:1 vs card both
  // schemes, math at the CAUTION declaration) + CAUTION text.
  dockRelease: {background: 'transparent', border: \`1.5px solid \${CAUTION}\`, color: CAUTION},
  dockPreview: {
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
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
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
  },
  sectionHeaderStrain: {color: CAUTION, whiteSpace: 'nowrap'},
  // Inset-grouped listCard.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // 60px two-line row — 4×44 ripeness sliver 12px from the card edge, text
  // offset 28px (12 + 4 + 12 gap), trailing 44×44 ellipsis.
  rowOuter: {position: 'relative'},
  rowFlex: {display: 'flex', alignItems: 'center'},
  rowBody: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 12,
  },
  rowSliver: {width: 4, height: 44, borderRadius: 2, flexShrink: 0},
  rowText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
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
  rowSecondaryStale: {color: CAUTION, fontWeight: 500},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // Divider inset 28 = the row text's left edge (12 + 4 sliver + 12 gap).
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 28},
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  bottomSpacer: {height: 24},
  // LARGE TITLE — 28/700 in a 52px block under the navBar.
  largeTitleBlock: {
    minHeight: 52,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 16,
    marginTop: 8,
  },
  largeTitle: {fontSize: 28, fontWeight: 700, lineHeight: 1.15, margin: 0},
  largeSubtitle: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SHELF MAP — 232px block inset 16: four 58px full-width plank buttons.
  shelfMap: {marginTop: 16, paddingInline: 16},
  plankBtn: {
    position: 'relative',
    display: 'block',
    width: '100%',
    height: 58,
    borderRadius: 12,
  },
  plankSvg: {display: 'block', width: '100%', height: 58},
  strainBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    border: \`1px solid \${CAUTION}\`,
    color: CAUTION,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    fontVariantNumeric: 'tabular-nums',
    background: 'var(--color-background-body)',
  },
  plankLabel: {
    position: 'absolute',
    top: 2,
    left: 0,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '70%',
    textAlign: 'left',
  },
  // loadMoreRow — final card row, 44px, centered 16/500 brand text.
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT_FILL,
    fontVariantNumeric: 'tabular-nums',
  },
  // 44px utility row (Next resurfacings).
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
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
  chevron: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  // Activated rows — CheckCircle2 leading, brand text pair (5.5:1/11.5:1).
  activatedLead: {color: BRAND_ACCENT_FILL, display: 'inline-flex', flexShrink: 0},
  restoreBtn: {
    height: 44,
    minWidth: 44,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT_FILL,
    flexShrink: 0,
  },
  // EMPTY STATE — maxWidth 280, 64px muted circle, one line title.
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 32,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4},
  // TAB BAR — 64px sticky bottom z20, 3 tabItems flex 1.
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
  // Active tab uses the brand TEXT pair (11px label needs 4.5:1; plain
  // #0D9488 fails at 3.75:1 — noted deviation from the spec's raw accent).
  tabItemActive: {color: BRAND_ACCENT_FILL},
  tabLabel: {fontSize: 11, fontWeight: 500, fontVariantNumeric: 'tabular-nums'},
  tabLabelActive: {fontWeight: 600},
  // TOAST DOCK — sticky-in-flow (bottom 76 = 64px tabBar + 12), height 0
  // so it adds no layout; always mounted for aria-live.
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
  undoBtn: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT_FILL,
    flexShrink: 0,
  },
  // ANCHORED ROW MENU — absolute card, radius 12, 44px rows, z30.
  menu: {
    position: 'absolute',
    right: 12,
    top: 52,
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
    paddingInline: 16,
    fontSize: 16,
  },
  menuRowDanger: {color: 'var(--color-error)'},
  menuDivider: {height: 1, background: 'var(--color-border)'},
  // SHEET — scrim z40 + sheet z41, absolute inside the locked shell.
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
    gridTemplateColumns: '44px 1fr auto',
    alignItems: 'center',
    paddingInline: 8,
    gap: 4,
  },
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0, minWidth: 0},
  doneBtn: {
    height: 44,
    minWidth: 44,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 600,
    color: BRAND_ACCENT_FILL,
  },
  sheetBody: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingInline: 16,
    paddingBottom: 16,
  },
  // WHEEL — 220px window (5 × 44 slots, so rows are never clipped
  // mid-glyph); inner scroller is THE one legal inner scroller.
  // paddingBlock 88 = (220 − 44) / 2 so row i centers at scrollTop i×44.
  wheelWrap: {position: 'relative', height: 220},
  wheelBand: {
    position: 'absolute',
    top: 88,
    left: 0,
    right: 0,
    height: 44,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    pointerEvents: 'none',
  },
  wheelScroller: {
    position: 'relative',
    height: 220,
    overflowY: 'auto',
    scrollSnapType: 'y mandatory',
    scrollPaddingTop: 88,
    paddingBlock: 88,
  },
  wheelOption: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    scrollSnapAlign: 'start',
    borderRadius: 8,
  },
  wheelOptionDim: {opacity: 0.45},
  wheelOptionLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  wheelOptionLoad: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  wheelHint: {
    marginTop: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — TODAY = Jul 4 (day-of-year 185, non-leap year). Cross-check
// ledger, verified by hand: 52 ideas = 12 queue + 32 shelved + 5 released +
// 3 activated. Queue ripeness mix 3 fresh + 4 ripening + 3 overripe + 2
// compost = 12 ✓. Shelf 9 + 13 + 6 + 4 = 32 ✓. loadMoreRow counts 9−3=6,
// 13−3=10, 6−3=3, 4−3=1 ✓. navBar pill 3 = activated.length ✓. Every
// (capturedAt, ageDays, staleDate) triple obeys ageDays = 185 − doy and
// staleDate = capturedAt + 90d — per-row proofs in the comments below.
// DEVIATION: the spec's 'Try a monthly no-spend week' said stale Sep 27,
// but Jun 28 (doy 179) + 90 = doy 269 = Sep 26; the cross-check law wins.
// ---------------------------------------------------------------------------

const TODAY_LABEL = 'Jul 4';
const STALE_AFTER_DAYS = 90;

type Stage = 'fresh' | 'ripening' | 'overripe' | 'compost';

interface Idea {
  id: string;
  title: string;
  note: string;
  capturedAt: string;
  ageDays: number;
  staleDate: string;
  stage: Stage;
  /** Resurfacing-tab meta ('Released Jun 21' / 'Activated Mon'). */
  eventLabel?: string;
}

/** Stage derives from age so hue can NEVER disagree with the caption math. */
function stageFor(ageDays: number): Stage {
  if (ageDays <= 14) return 'fresh';
  if (ageDays <= 45) return 'ripening';
  if (ageDays <= STALE_AFTER_DAYS) return 'overripe';
  return 'compost';
}

const STAGE_COLOR: Record<Stage, string> = {
  fresh: STAGE_FRESH,
  ripening: STAGE_RIPENING,
  overripe: STAGE_OVERRIPE,
  compost: STAGE_COMPOST,
};

const STAGE_LABEL: Record<Stage, string> = {
  fresh: 'Fresh',
  ripening: 'Ripening',
  overripe: 'Overripe',
  compost: 'Compost',
};

function idea(
  id: string,
  title: string,
  note: string,
  capturedAt: string,
  ageDays: number,
  staleDate: string,
  eventLabel?: string,
): Idea {
  return {id, title, note, capturedAt, ageDays, staleDate, stage: stageFor(ageDays), eventLabel};
}

// QUEUE (12) — 1 focus + 11 upcoming. Proofs: doy(May 28)=148, 185−148=37,
// 148+90=238=Aug 26 ✓ · doy(May 4)=124→61d, 214=Aug 2 ✓ · doy(Apr 1)=91→94d,
// 181=Jun 30 (went stale 4 days ago) ✓ · doy(Jun 28)=179→6d, 269=Sep 26 ✓ ·
// doy(Jun 12)=163→22d, 253=Sep 10 ✓ · doy(Jul 1)=182→3d, 272=Sep 29 ✓ ·
// doy(Jun 23)=174→11d, 264=Sep 21 ✓ · doy(Jun 5)=156→29d, 246=Sep 3 ✓ ·
// doy(May 13)=133→52d, 223=Aug 11 ✓ · doy(Apr 21)=111→74d, 201=Jul 20 ✓ ·
// doy(Mar 23)=82→103d, 172=Jun 21 (stale 13 days ago) ✓ · doy(May 25)=145→
// 40d, 235=Aug 23 ✓.
const QUEUE_IDEAS: Idea[] = [
  // idea-07 is the shipped focus (top of queueOrder).
  idea(
    'idea-07',
    'Build a backyard cold frame from the old windows',
    'Four sash windows are still stacked in the garage — hinge two as lids, face it south of the shed.',
    'May 28',
    37,
    'Aug 26',
  ),
  idea('idea-12', 'Learn fermentation beyond sauerkraut', 'Kimchi first, then the hot-pepper mash Dario keeps promising to trade for.', 'May 4', 61, 'Aug 2'),
  idea('idea-03', 'Screenplay about the ferry line', 'Three commuters, one missed crossing, told across a single fog delay.', 'Apr 1', 94, 'Jun 30'),
  // Row #3 of UP NEXT — the undo round-trip stress returns it to index 3.
  idea('idea-21', 'Try a monthly no-spend week', 'First full week of the month; groceries from the chest freezer only.', 'Jun 28', 6, 'Sep 26'),
  // 91-char single-line ellipsis stress at 320px (must not push the 44×44 ellipsis).
  idea(
    'idea-24',
    'Convert the garage into a four-season workshop with reclaimed sash windows and a wood stove',
    'Insulate the north wall first; the stove flue can share the old chimney chase.',
    'Jun 12',
    22,
    'Sep 10',
  ),
  idea('idea-26', 'Volunteer at the seed library on Saturdays', 'They need someone for the winnowing table, per the co-op newsletter.', 'Jul 1', 3, 'Sep 29'),
  idea('idea-25', 'Bike the rail trail end to end', 'Two days, one night at the trestle campground around mile 62.', 'Jun 23', 11, 'Sep 21'),
  idea('idea-19', "Digitize Dad's slide carousels", 'Eleven carousels in the cedar closet; rent the scanner instead of buying.', 'Jun 5', 29, 'Sep 3'),
  idea('idea-15', 'Pitch the neighborhood tool library at the co-op meeting', 'Start with the six duplicate drills on our block alone.', 'May 13', 52, 'Aug 11'),
  idea('idea-10', 'Rebuild the porch steps before the reunion', 'Stringers are fine; treads and the wobbly rail need replacing.', 'Apr 21', 74, 'Jul 20'),
  idea('idea-02', 'Start a Sunday sketchbook habit', 'One spread a week, coffee first, no erasing allowed.', 'Mar 23', 103, 'Jun 21'),
  idea('idea-17', 'Host a soup swap before it gets cold again', 'Six neighbors, six quarts each, everyone leaves with variety.', 'May 25', 40, 'Aug 23'),
];

// SHELF (32 = 9 + 13 + 6 + 4 ✓) — proofs abbreviated as doy→age, staleDoy→date.
// weekly-review: 180→5,270=Sep 27 · 176→9,266=Sep 23 · 169→16,259=Sep 16 ·
// 164→21,254=Sep 11 · 159→26,249=Sep 6 · 152→33,242=Aug 30 · 141→44,231=
// Aug 19 · 127→58,217=Aug 5 · 114→71,204=Jul 23.
const WEEKLY_IDEAS: Idea[] = [
  idea('idea-31', 'Refill the bike patch kit', 'Levers went missing on the June ride.', 'Jun 29', 5, 'Sep 27'),
  idea('idea-32', 'Email Marisol about the mural wall', 'She offered the east wall of the bakery.', 'Jun 25', 9, 'Sep 23'),
  idea('idea-33', 'Price out a rain barrel setup', 'Two barrels, one diverter, the shed gutter.', 'Jun 18', 16, 'Sep 16'),
  idea('idea-34', 'Sort the seed packets by sow date', 'The shoebox no longer closes.', 'Jun 13', 21, 'Sep 11'),
  idea('idea-35', 'Fix the wobble in the porch fan', 'Probably one loose blade screw.', 'Jun 8', 26, 'Sep 6'),
  idea('idea-36', 'Return the borrowed post-hole digger', "It's been in the shed since the fence job.", 'Jun 1', 33, 'Aug 30'),
  idea('idea-37', 'Draft a house-swap listing', 'Photos from the May deep-clean still hold.', 'May 21', 44, 'Aug 19'),
  idea('idea-38', 'Test the dehydrator on tomato season', 'Romas from the Kessler stand, sliced thin.', 'May 7', 58, 'Aug 5'),
  idea('idea-39', 'Plan a zine about alley gardens', 'Eight alleys mapped, three gardeners interviewed.', 'Apr 24', 71, 'Jul 23'),
];

// kitchen-reno (13 — capacity 12, strain '+1 OVER', sag 9px): 181→4,271=
// Sep 28 · 177→8,267=Sep 24 · 172→13,262=Sep 19 · 167→18,257=Sep 14 ·
// 161→24,251=Sep 8 · 154→31,244=Sep 1 · 147→38,237=Aug 25 · 138→47,228=
// Aug 16 · 130→55,220=Aug 8 · 122→63,212=Jul 31 · 108→77,198=Jul 17 ·
// 97→88,187=Jul 6 · 89→96,179=Jun 28 (went stale 6 days ago).
const KITCHEN_IDEAS: Idea[] = [
  idea('idea-41', 'Host a proper dinner party again', 'Eight seats once the island is in.', 'Jun 30', 4, 'Sep 28'),
  idea('idea-42', 'Try the 72-hour focaccia', 'Needs the new oven and counter space to cold-proof.', 'Jun 26', 8, 'Sep 24'),
  idea('idea-43', 'Build a plate rack over the sink', 'Air-dry storage; scrap oak from the stair job.', 'Jun 21', 13, 'Sep 19'),
  idea('idea-44', 'Learn knife sharpening on the wet stone', 'The stone is still in its box from two birthdays ago.', 'Jun 16', 18, 'Sep 14'),
  idea('idea-45', 'Start a sourdough culture with the twins', 'Name it something the kids will defend.', 'Jun 10', 24, 'Sep 8'),
  idea('idea-46', 'Batch-cook Sunday freezer curries', 'Six containers deep before school restarts.', 'Jun 3', 31, 'Sep 1'),
  idea('idea-47', "Photograph Nonna's recipe cards", 'Before the tomato-stained ones fade further.', 'May 27', 38, 'Aug 25'),
  idea('idea-48', 'Install under-cabinet lighting', 'Hardwire while the wall is already open.', 'May 18', 47, 'Aug 16'),
  idea('idea-49', 'Swap the range hood filter', 'Order the odd 9-inch size ahead.', 'May 10', 55, 'Aug 8'),
  idea('idea-50', 'Tile a splash test board first', 'Try the zellige on a scrap panel before committing.', 'May 2', 63, 'Jul 31'),
  idea('idea-51', 'Compost bin under the new island', 'Pull-out caddy sized to the co-op pail.', 'Apr 18', 77, 'Jul 17'),
  idea('idea-52', 'Herb rail on the south window', 'Basil, thyme, and the stubborn tarragon.', 'Apr 7', 88, 'Jul 6'),
  idea('idea-53', 'Monthly pasta night with the Okafors', 'Alternate houses; they bring the ragù.', 'Mar 30', 96, 'Jun 28'),
];

// first-frost (6): 178→7,268=Sep 25 · 166→19,256=Sep 13 · 150→35,240=Aug 28
// · 136→49,226=Aug 14 · 119→66,209=Jul 28 · 93→92,183=Jul 2 (stale 2d ago).
const FROST_IDEAS: Idea[] = [
  idea('idea-61', 'Mulch the garlic beds deep', 'Straw from the Hollis farm stand.', 'Jun 27', 7, 'Sep 25'),
  idea('idea-62', 'Move the citrus pots inside', 'The meyer lemon sulks below 40°F.', 'Jun 15', 19, 'Sep 13'),
  idea('idea-63', 'Sew draft snakes for the north doors', 'Use the worn flannel shirts pile.', 'May 30', 35, 'Aug 28'),
  idea('idea-64', 'Press apples with the Harlan kids', 'Their press, our orchard gleanings.', 'May 16', 49, 'Aug 14'),
  idea('idea-65', 'Insulate the crawlspace hatch', 'Rigid foam plus a proper gasket.', 'Apr 29', 66, 'Jul 28'),
  idea('idea-66', 'Knit the fingerless market gloves', 'The gray wool from the ferry trip.', 'Apr 3', 92, 'Jul 2'),
];

// spring-thaw (4): 173→12,263=Sep 20 · 157→28,247=Sep 4 · 132→53,222=Aug 10
// · 104→81,194=Jul 13.
const THAW_IDEAS: Idea[] = [
  idea('idea-71', 'Terrace the muddy side slope', 'Two courses of urbanite, then plant clover.', 'Jun 22', 12, 'Sep 20'),
  idea('idea-72', 'Split the overgrown rhubarb crowns', 'Trade divisions for the Lindqvist raspberries.', 'Jun 6', 28, 'Sep 4'),
  idea('idea-73', 'Rebuild the cold-creek footbridge', 'Sistered joists, new cedar decking.', 'May 12', 53, 'Aug 10'),
  idea('idea-74', 'Paddle the spring high-water route', 'Only runnable the two weeks after melt.', 'Apr 14', 81, 'Jul 13'),
];

// RELEASED (5, recoverable): 165→20,255=Sep 12 · 143→42,233=Aug 21 · 125→60,
// 215=Aug 3 · 110→75,200=Jul 19 · 87→98,177=Jun 26.
const RELEASED_IDEAS: Idea[] = [
  idea('idea-81', 'Learn lute tablature', 'The rental period lapsed months ago.', 'Jun 14', 20, 'Sep 12', 'Released Jun 21'),
  idea('idea-82', 'Restore the treadle sewing machine', 'Needs a belt and a week of penetrating oil.', 'May 23', 42, 'Aug 21', 'Released Jun 30'),
  idea('idea-83', 'Start a pepper-sauce micro label', 'Cottage-license rules were the wall.', 'May 5', 60, 'Aug 3', 'Released Jun 18'),
  idea('idea-84', 'Build a strip-plank canoe', 'A two-winter project at best.', 'Apr 20', 75, 'Jul 19', 'Released Jul 1'),
  idea('idea-85', 'Apprentice at the letterpress studio', 'Their open slot conflicts with school pickup.', 'Mar 28', 98, 'Jun 26', 'Released Jul 2'),
];

// ACTIVATED THIS WEEK (3 — matches the navBar pill): 170→15,260=Sep 17 ·
// 151→34,241=Aug 29 · 135→50,225=Aug 13.
const ACTIVATED_IDEAS: Idea[] = [
  idea('idea-91', 'Fix the gate latch before market day', 'Strike plate shifted when the post heaved.', 'Jun 19', 15, 'Sep 17', 'Activated Mon'),
  idea('idea-92', 'Sign up for the July trail cleanup', 'Crew forms close Friday.', 'May 31', 34, 'Aug 29', 'Activated Wed'),
  idea('idea-93', 'Reserve the campsite at Lost Pines', 'Site 14, the one above the bend.', 'May 15', 50, 'Aug 13', 'Activated Thu'),
];

// BUCKETS — ritual anchors, never raw dates. One source array: ShelfMap
// planks, sectionHeader counts, CadenceDialSheet loads, and the Next
// resurfacings rows all render from state.buckets[id].length.
type BucketId = 'weekly-review' | 'kitchen-reno' | 'first-frost' | 'spring-thaw' | 'queue-under-8';

interface BucketDef {
  id: BucketId;
  /** Wheel option label. */
  anchor: string;
  /** Section header / plank label. */
  header: string;
  /** Toast phrase: 'Shelved until …'. */
  until: string;
  /** Renders a ShelfMap plank (queue-under-8 is an anchor, not a shelf). */
  plank: boolean;
}

const PLANK_CAPACITY = 12;

const BUCKET_DEFS: BucketDef[] = [
  {id: 'weekly-review', anchor: 'Next weekly review — Sun', header: 'Next weekly review', until: 'next weekly review', plank: true},
  {id: 'kitchen-reno', anchor: 'After Kitchen reno ships', header: 'After Kitchen reno ships', until: 'after Kitchen reno ships', plank: true},
  {id: 'first-frost', anchor: 'First frost — Oct', header: 'First frost — Oct', until: 'first frost', plank: true},
  {id: 'spring-thaw', anchor: 'Spring thaw — Mar', header: 'Spring thaw — Mar', until: 'spring thaw', plank: true},
  {id: 'queue-under-8', anchor: 'When queue drops under 8', header: 'When queue drops under 8', until: 'the queue drops under 8', plank: false},
];

const BUCKET_BY_ID = Object.fromEntries(BUCKET_DEFS.map(def => [def.id, def])) as Record<BucketId, BucketDef>;

// The Resurfacing tab's 'Next resurfacings' — the three nearest anchors.
const NEXT_RESURFACING_IDS: BucketId[] = ['weekly-review', 'kitchen-reno', 'first-frost'];

const ALL_IDEAS: Idea[] = [
  ...QUEUE_IDEAS,
  ...WEEKLY_IDEAS,
  ...KITCHEN_IDEAS,
  ...FROST_IDEAS,
  ...THAW_IDEAS,
  ...RELEASED_IDEAS,
  ...ACTIVATED_IDEAS,
];

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic (TODAY is baked into ageDays already).
// ---------------------------------------------------------------------------

/** '37 days · stale Aug 26' | 'went stale · 4 days ago' (compost). */
function ageMeta(item: Idea): {text: string; stale: boolean} {
  if (item.ageDays > STALE_AFTER_DAYS) {
    const over = item.ageDays - STALE_AFTER_DAYS;
    return {text: \`went stale · \${over} \${over === 1 ? 'day' : 'days'} ago\`, stale: true};
  }
  return {text: \`\${item.ageDays} days · stale \${item.staleDate}\`, stale: false};
}

/** RipenessBand marker position: min(age/90, 1) × 100 (37d → 41.1%). */
function markerPct(ageDays: number): number {
  return Math.min(ageDays / STALE_AFTER_DAYS, 1) * 100;
}

/** ShelfMap sag: min(max(load − 4, 0), 10) → 9/13/6/4 sag 5/9/2/0; 14 caps at 10. */
function sagFor(load: number): number {
  return Math.min(Math.max(load - 4, 0), 10);
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useReducer in <DriftwoodApp/>. Verdicts from drag-drop
// and dock buttons dispatch the SAME actions; every mutation announces
// through the single toast and re-derives every count that echoes it.
// ---------------------------------------------------------------------------

type Tab = 'sort' | 'shelf' | 'resurfacing';

interface ToastState {
  seq: number;
  msg: string;
  /** Present only for Release — undoOverConfirm: no timers, persists. */
  undo: {ideaId: string; queueIndex: number} | null;
}

interface SheetState {
  ideaId: string;
  selectedAnchor: BucketId;
  detent: 'medium' | 'large';
}

interface DriftwoodState {
  tab: Tab;
  ideas: Record<string, Idea>;
  queueOrder: string[];
  buckets: Record<BucketId, string[]>;
  released: string[];
  activated: string[];
  sheet: SheetState | null;
  toast: ToastState | null;
  menuFor: string | null;
  /** loadMoreRow expansion — survives tab switches (ergonomics law). */
  expandedBuckets: Partial<Record<BucketId, boolean>>;
}

const INITIAL_STATE: DriftwoodState = {
  tab: 'sort',
  ideas: Object.fromEntries(ALL_IDEAS.map(item => [item.id, item])),
  queueOrder: QUEUE_IDEAS.map(item => item.id),
  buckets: {
    'weekly-review': WEEKLY_IDEAS.map(item => item.id),
    'kitchen-reno': KITCHEN_IDEAS.map(item => item.id),
    'first-frost': FROST_IDEAS.map(item => item.id),
    'spring-thaw': THAW_IDEAS.map(item => item.id),
    'queue-under-8': [],
  },
  released: RELEASED_IDEAS.map(item => item.id),
  activated: ACTIVATED_IDEAS.map(item => item.id),
  sheet: null,
  toast: null,
  menuFor: null,
  expandedBuckets: {},
};

type Action =
  | {type: 'SET_TAB'; tab: Tab}
  | {type: 'ACTIVATE'; ideaId: string}
  | {type: 'OPEN_SHELVE'; ideaId: string}
  | {type: 'SET_ANCHOR'; anchor: BucketId}
  | {type: 'SET_DETENT'; detent: 'medium' | 'large'}
  | {type: 'COMMIT_SHELVE'}
  | {type: 'CANCEL_SHELVE'}
  | {type: 'RELEASE'; ideaId: string}
  | {type: 'UNDO_RELEASE'}
  | {type: 'RESTORE'; ideaId: string}
  | {type: 'MOVE_TO_TOP'; ideaId: string}
  | {type: 'SET_MENU'; ideaId: string | null}
  | {type: 'EXPAND_BUCKET'; bucketId: BucketId};

function toast(prev: DriftwoodState, msg: string, undo: ToastState['undo'] = null): ToastState {
  return {seq: (prev.toast?.seq ?? 0) + 1, msg, undo};
}

function driftwoodReducer(state: DriftwoodState, action: Action): DriftwoodState {
  switch (action.type) {
    case 'SET_TAB': {
      // Per-tab persistence law: overlays close on switch, the toast dock
      // persists, expandedBuckets and scroll (kept in a ref) survive.
      if (action.tab === state.tab) return state;
      return {...state, tab: action.tab, sheet: null, menuFor: null};
    }
    case 'ACTIVATE': {
      // Verdict: queue → activated. Pill, Activated header, and the
      // consequence preview all derive from activated.length.
      if (!state.queueOrder.includes(action.ideaId)) return state;
      const nextActivated = [...state.activated, action.ideaId];
      return {
        ...state,
        queueOrder: state.queueOrder.filter(id => id !== action.ideaId),
        activated: nextActivated,
        menuFor: null,
        toast: toast(state, \`Moved to This week — \${nextActivated.length} total\`),
      };
    }
    case 'OPEN_SHELVE':
      return {
        ...state,
        sheet: {ideaId: action.ideaId, selectedAnchor: 'weekly-review', detent: 'medium'},
        menuFor: null,
      };
    case 'SET_ANCHOR':
      if (state.sheet == null || state.sheet.selectedAnchor === action.anchor) return state;
      return {...state, sheet: {...state.sheet, selectedAnchor: action.anchor}};
    case 'SET_DETENT':
      if (state.sheet == null) return state;
      return {...state, sheet: {...state.sheet, detent: action.detent}};
    case 'COMMIT_SHELVE': {
      // ONLY Done dispatches this — X/scrim/Escape CANCEL with no verdict.
      if (state.sheet == null) return state;
      const {ideaId, selectedAnchor} = state.sheet;
      const def = BUCKET_BY_ID[selectedAnchor];
      return {
        ...state,
        queueOrder: state.queueOrder.filter(id => id !== ideaId),
        buckets: {
          ...state.buckets,
          [selectedAnchor]: [...state.buckets[selectedAnchor], ideaId],
        },
        sheet: null,
        toast: toast(state, \`Shelved until \${def.until}\`),
      };
    }
    case 'CANCEL_SHELVE':
      return {...state, sheet: null};
    case 'RELEASE': {
      // undoOverConfirm: executes IMMEDIATELY; the toast's Undo restores
      // the EXACT queue index. No auto-dismiss timer — persists until
      // Undo, replacement, or restore.
      const queueIndex = state.queueOrder.indexOf(action.ideaId);
      if (queueIndex < 0) return state;
      return {
        ...state,
        queueOrder: state.queueOrder.filter(id => id !== action.ideaId),
        released: [...state.released, action.ideaId],
        menuFor: null,
        toast: toast(state, 'Released — recoverable', {ideaId: action.ideaId, queueIndex}),
      };
    }
    case 'UNDO_RELEASE': {
      const undo = state.toast?.undo;
      if (undo == null) return state;
      const nextQueue = [...state.queueOrder];
      nextQueue.splice(Math.min(undo.queueIndex, nextQueue.length), 0, undo.ideaId);
      return {
        ...state,
        queueOrder: nextQueue,
        released: state.released.filter(id => id !== undo.ideaId),
        toast: toast(state, 'Restored'),
      };
    }
    case 'RESTORE': {
      // Resurfacing tab: released → queue TAIL (not the old position —
      // that path is Undo's contract).
      if (!state.released.includes(action.ideaId)) return state;
      return {
        ...state,
        released: state.released.filter(id => id !== action.ideaId),
        queueOrder: [...state.queueOrder, action.ideaId],
        toast: toast(state, 'Restored to queue'),
      };
    }
    case 'MOVE_TO_TOP': {
      // Row menu: splice to index 1 — behind the focus item, per spec.
      const from = state.queueOrder.indexOf(action.ideaId);
      if (from < 1) return state;
      const nextQueue = state.queueOrder.filter(id => id !== action.ideaId);
      nextQueue.splice(1, 0, action.ideaId);
      return {...state, queueOrder: nextQueue, menuFor: null, toast: toast(state, 'Moved to top of Up next')};
    }
    case 'SET_MENU':
      return {...state, menuFor: action.ideaId};
    case 'EXPAND_BUCKET': {
      const shown = state.buckets[action.bucketId].length - 3;
      return {
        ...state,
        expandedBuckets: {...state.expandedBuckets, [action.bucketId]: true},
        toast: toast(state, \`\${shown} more loaded\`),
      };
    }
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// HOOKS & UTILITIES
// ---------------------------------------------------------------------------

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver can tell the
 * 390px mobile stage from the desktop stage. */
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

/** The demo's .preview-wrap owns scroll — find the nearest scrollable
 * ancestor for per-tab scroll persistence and re-tap-to-top. */
function findScroller(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const overflowY = window.getComputedStyle(current).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="0"]');
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
// BRAND MARK — 24px paper boat on a dotted horizon, stern curling back into
// a return arrow. Strokes in currentColor (text-primary), sail filled
// BRAND_ACCENT.
// ---------------------------------------------------------------------------

function BoatMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      {/* dotted horizon */}
      <path d="M1.5 16.5h21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="0.2 3" />
      {/* sail — the one brand-filled surface */}
      <path d="M12.6 4.5v9H6.4z" fill={BRAND_ACCENT} />
      <path d="M12.6 4.5v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      {/* hull */}
      <path d="M5 16.5h13l-2.4 3.2H7.8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      {/* stern return-arrow curl */}
      <path d="M18.4 16.1c2.2-.5 2.6-2.6 1-3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M19.9 11.2l-.6 1.5 1.6.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RIPENESS BAND — the horizontal 8px scale bar with a 2px marker at
// min(age/90, 1) × 100% (37d → 41.1%). aria-hidden: the visible caption
// carries the accessible encoding ('goes stale Aug 26').
// ---------------------------------------------------------------------------

function RipenessBar({ageDays}: {ageDays: number}) {
  return (
    <div style={styles.bandTrack} aria-hidden>
      <div style={{...styles.bandMarker, left: \`calc(\${markerPct(ageDays).toFixed(1)}% - 1px)\`}} />
    </div>
  );
}

/** 4×44 vertical sliver — SOLID stage color (the spec's ROT stress demands
 * a 94-day sliver render 'fully compost', which only a stage fill can do;
 * the 4-stop gradient stays on the focus card's horizontal bar).
 * Decorative: aria-hidden, data lives in the row's secondary text. */
function RipenessSliver({stage}: {stage: Stage}) {
  return <span style={{...styles.rowSliver, background: STAGE_COLOR[stage]}} aria-hidden />;
}

// ---------------------------------------------------------------------------
// UP NEXT ROW — 60px two-line row; whole row is one <button> named by its
// primary text; trailing 44×44 ellipsis (sibling, never nested) opens the
// anchored verdict menu. No swipe on rows — ellipsis menu only (simpler,
// per a11yPlan).
// ---------------------------------------------------------------------------

interface QueueRowProps {
  item: Idea;
  isLast: boolean;
  isMenuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onToggleMenu: (opener: HTMLElement) => void;
  onMoveToTop: () => void;
  onShelve: (opener: HTMLElement) => void;
  onRelease: () => void;
}

function QueueRow({item, isLast, isMenuOpen, menuRef, onToggleMenu, onMoveToTop, onShelve, onRelease}: QueueRowProps) {
  const meta = ageMeta(item);
  return (
    <div style={styles.rowOuter}>
      <div style={styles.rowFlex}>
        <button
          type="button"
          className="dw-btn dw-focusable"
          style={styles.rowBody}
          aria-label={\`\${item.title} — \${meta.text}\`}
          aria-expanded={isMenuOpen}
          onClick={event => onToggleMenu(event.currentTarget)}>
          <RipenessSliver stage={item.stage} />
          <span style={styles.rowText}>
            <span style={styles.rowPrimary}>{item.title}</span>
            <span style={{...styles.rowSecondary, ...(meta.stale ? styles.rowSecondaryStale : null)}}>
              {meta.text}
            </span>
          </span>
        </button>
        <button
          type="button"
          className="dw-btn dw-focusable"
          style={styles.iconBtn}
          aria-label={\`Actions for \${item.title}\`}
          aria-expanded={isMenuOpen}
          onClick={event => onToggleMenu(event.currentTarget)}>
          <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
        </button>
      </div>
      {isMenuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Actions for \${item.title}\`}
          style={styles.menu}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button type="button" role="menuitem" className="dw-btn dw-focusable" style={styles.menuRow} onClick={onMoveToTop}>
            Move to top
          </button>
          <div style={styles.menuDivider} />
          <button
            type="button"
            role="menuitem"
            className="dw-btn dw-focusable"
            style={styles.menuRow}
            onClick={event => onShelve(event.currentTarget)}>
            Shelve…
          </button>
          <div style={styles.menuDivider} />
          {/* Row-level Release shortcut — --color-error text per spec; it
              still routes through the Undo toast, never a confirm. */}
          <button
            type="button"
            role="menuitem"
            className="dw-btn dw-focusable"
            style={{...styles.menuRow, ...styles.menuRowDanger}}
            onClick={onRelease}>
            Release
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHELF MAP — four full-width 58px plank <button>s (232px block). Plank =
// quadratic path sagging sagFor(load)px at midspan; ticks are 6×20 rects
// seated on the curve (y(t) = y0 + 4·sag·t·(1−t)), tinted by each item's
// ripeness stage. At 13+ of 12 the end ticks rotate 4° and a '+N OVER'
// strain badge overlaps the right end. Width comes from a ResizeObserver
// so sag (absolute px) reads identically at 320 and 430.
// ---------------------------------------------------------------------------

interface ShelfMapProps {
  buckets: Record<BucketId, string[]>;
  ideas: Record<string, Idea>;
  dippedBucket: BucketId | null;
  onPlankTap: (bucketId: BucketId) => void;
}

function ShelfMap({buckets, ideas, dippedBucket, onPlankTap}: ShelfMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const measured = useElementWidth(mapRef);
  // First-frame fallback before the observer reports: 390 − 32 gutter.
  const w = measured > 0 ? measured : 358;
  const y0 = 40; // plank rest line inside the 58px row
  return (
    <div ref={mapRef} style={styles.shelfMap}>
      {BUCKET_DEFS.filter(def => def.plank).map(def => {
        const ids = buckets[def.id];
        const load = ids.length;
        const sag = sagFor(load);
        const over = load - PLANK_CAPACITY;
        const inset = 8;
        const span = w - inset * 2;
        // Tick geometry: 6px wide, 3px gap → 9px stride from x=12.
        const ticks = ids.map((id, index) => {
          const cx = 12 + index * 9 + 3;
          const t = Math.min(Math.max((cx - inset) / span, 0), 1);
          const plankY = y0 + 4 * sag * t * (1 - t);
          const rotate =
            over > 0 && (index === 0 || index === ids.length - 1) ? (index === 0 ? -4 : 4) : 0;
          return {id, x: cx - 3, y: plankY - 4 - 20, rotate, cx, cy: plankY - 4 - 10};
        });
        return (
          <button
            key={def.id}
            type="button"
            className="dw-btn dw-focusable"
            style={styles.plankBtn}
            aria-label={\`\${def.header}, \${load} of \${PLANK_CAPACITY} slots\`}
            onClick={() => onPlankTap(def.id)}>
            <span style={styles.plankLabel} aria-hidden>
              {def.header} · {load}
            </span>
            <svg
              style={styles.plankSvg}
              viewBox={\`0 0 \${w} 58\`}
              preserveAspectRatio="none"
              aria-hidden
              className={dippedBucket === def.id ? 'dw-plank-dip' : undefined}>
              {/* plank — square ends; the bow curve is the softness */}
              <path
                d={\`M \${inset} \${y0} Q \${w / 2} \${y0 + 2 * sag} \${w - inset} \${y0}\`}
                stroke={PLANK}
                strokeWidth={8}
                fill="none"
              />
              {ticks.map(tick => (
                <rect
                  key={tick.id}
                  x={tick.x}
                  y={tick.y}
                  width={6}
                  height={20}
                  rx={1}
                  fill={STAGE_COLOR[ideas[tick.id].stage]}
                  transform={tick.rotate !== 0 ? \`rotate(\${tick.rotate} \${tick.cx} \${tick.cy})\` : undefined}
                />
              ))}
            </svg>
            {over > 0 ? (
              <span style={styles.strainBadge} aria-hidden>
                +{over} OVER
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CADENCE DIAL SHEET — medium-detent (55%) sheet whose body is a snap
// wheel: five 44px ritual-anchor radio rows in a 260px scroller
// (paddingBlock 108 centers row i at scrollTop i×44) under a fixed muted
// highlight band. Selection commits ONLY on Done; X/scrim/Escape cancel
// with no verdict. Focus enters with preventScroll (the locked shell would
// otherwise scroll-reveal the animating sheet and beach it mid-screen).
// ---------------------------------------------------------------------------

interface CadenceDialSheetProps {
  sheet: SheetState;
  ideaTitle: string;
  buckets: Record<BucketId, string[]>;
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onSelect: (anchor: BucketId) => void;
  onDetent: (detent: 'medium' | 'large') => void;
  onDone: () => void;
  onCancel: () => void;
}

function CadenceDialSheet({
  sheet,
  ideaTitle,
  buckets,
  reducedMotion,
  sheetRef,
  onSelect,
  onDetent,
  onDone,
  onCancel,
}: CadenceDialSheetProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const programmaticRef = useRef(false);
  const selectedIndex = BUCKET_DEFS.findIndex(def => def.id === sheet.selectedAnchor);

  const scrollToIndex = useCallback(
    (index: number, smooth: boolean) => {
      const scroller = scrollerRef.current;
      if (scroller == null) return;
      programmaticRef.current = true;
      scroller.scrollTo({top: index * 44, behavior: smooth && !reducedMotion ? 'smooth' : 'auto'});
    },
    [reducedMotion],
  );

  // Center the current selection on open (instant — no motion race).
  useEffect(() => {
    scrollToIndex(selectedIndex, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    if (programmaticRef.current) {
      const scroller = scrollerRef.current;
      if (scroller != null && Math.abs(scroller.scrollTop - selectedIndex * 44) < 2) {
        programmaticRef.current = false;
      }
      return;
    }
    const scroller = scrollerRef.current;
    if (scroller == null) return;
    const index = Math.min(BUCKET_DEFS.length - 1, Math.max(0, Math.round(scroller.scrollTop / 44)));
    if (index !== selectedIndex) onSelect(BUCKET_DEFS[index].id);
  };

  const pick = (index: number) => {
    const clamped = Math.min(BUCKET_DEFS.length - 1, Math.max(0, index));
    onSelect(BUCKET_DEFS[clamped].id);
    scrollToIndex(clamped, true);
  };

  const detentToggle = () => onDetent(sheet.detent === 'medium' ? 'large' : 'medium');

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dw-sheet-title"
      tabIndex={-1}
      className="dw-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: sheet.detent === 'medium' ? '55%' : 'calc(100% - 56px)',
      }}>
      <button
        type="button"
        className="dw-btn dw-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onClick={detentToggle}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <button type="button" className="dw-btn dw-focusable" style={styles.iconBtn} aria-label="Cancel — keep in queue" onClick={onCancel}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
        <h2 id="dw-sheet-title" style={styles.sheetTitle}>
          When should this resurface?
        </h2>
        <button type="button" className="dw-btn dw-focusable" style={styles.doneBtn} onClick={onDone}>
          Done
        </button>
      </div>
      <div style={styles.sheetBody}>
        <div style={styles.wheelWrap}>
          <div style={styles.wheelBand} aria-hidden />
          <div
            ref={scrollerRef}
            style={styles.wheelScroller}
            onScroll={onScroll}
            role="radiogroup"
            aria-label={\`Resurfacing anchor for \${ideaTitle}\`}
            onKeyDown={event => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                pick(selectedIndex + 1);
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                pick(selectedIndex - 1);
              }
            }}>
            {BUCKET_DEFS.map((def, index) => {
              const selected = index === selectedIndex;
              const load = buckets[def.id].length;
              return (
                <button
                  key={def.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  className="dw-btn dw-focusable dw-fade"
                  style={{
                    ...styles.wheelOption,
                    ...(selected ? {background: BRAND_TINT_12} : styles.wheelOptionDim),
                  }}
                  onClick={() => pick(index)}>
                  <span style={{...styles.wheelOptionLabel, ...(selected ? {fontWeight: 600} : null)}}>
                    {def.anchor}
                  </span>
                  <span style={styles.wheelOptionLoad}>· {load} on shelf</span>
                </button>
              );
            })}
          </div>
        </div>
        <p style={styles.wheelHint}>Anchors are events, not dates — Done commits, X keeps it in the queue.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EMPTY STATE — WindIcon true-empty for the Released card (no action
// button, per spec: 'Ideas you let go wait here, recoverable.').
// ---------------------------------------------------------------------------

function EmptyReleased() {
  return (
    <div style={styles.emptyState}>
      <span style={styles.emptyCircle}>
        <Icon icon={WindIcon} size="lg" color="inherit" />
      </span>
      <h3 style={styles.emptyTitle}>Nothing released</h3>
      <p style={styles.emptyBody}>Ideas you let go wait here, recoverable.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — <DriftwoodApp/> owns ALL state via one useReducer; drag deltas are
// the sanctioned transient exception (refs + local state, per house rule).
// ---------------------------------------------------------------------------

const TABS: Array<{id: Tab; label: string; icon: typeof InboxIcon}> = [
  {id: 'sort', label: 'Sort', icon: InboxIcon},
  {id: 'shelf', label: 'Shelf', icon: Rows3Icon},
  {id: 'resurfacing', label: 'Resurfacing', icon: HistoryIcon},
];

const NAV_TITLE: Record<Tab, string> = {sort: 'Driftwood', shelf: 'Shelf', resurfacing: 'Resurfacing'};

type PendingScroll = {kind: 'activated'} | {kind: 'bucket'; bucketId: BucketId} | null;

export default function MobileSomedayMaybeSorterTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, dispatch] = useReducer(driftwoodReducer, INITIAL_STATE);

  // Focus + scroll plumbing.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const shelveDockRef = useRef<HTMLButtonElement | null>(null);
  const activatedSectionRef = useRef<HTMLDivElement | null>(null);
  const bucketCardRefs = useRef<Partial<Record<BucketId, HTMLDivElement | null>>>({});
  const tabScrollRef = useRef<Record<Tab, number>>({sort: 0, shelf: 0, resurfacing: 0});
  const pendingScrollRef = useRef<PendingScroll>(null);

  // Transient drag state (focus card → docks). Buttons are the contract;
  // the drag is garnish. touch drags ride the grip (touchAction none);
  // card-body drags are mouse-friendly (touchAction pan-y keeps scroll).
  const [drag, setDrag] = useState<{dx: number; dy: number; nearest: number | null} | null>(null);
  const dragStartRef = useRef({x: 0, y: 0});
  const dragMovedRef = useRef(false);
  const dockRowRef = useRef<HTMLDivElement | null>(null);
  const [dippedBucket, setDippedBucket] = useState<BucketId | null>(null);

  // DERIVED — one source, many renders.
  const focusId = state.queueOrder[0] ?? null;
  const focusIdea = focusId != null ? state.ideas[focusId] : null;
  const upNextIds = state.queueOrder.slice(1);
  const shelfTotal = BUCKET_DEFS.reduce((sum, def) => sum + state.buckets[def.id].length, 0);
  const cadenceCount = BUCKET_DEFS.filter(def => state.buckets[def.id].length > 0).length;
  const activatedCount = state.activated.length;

  const getScroller = useCallback(() => findScroller(shellRef.current), []);

  // ---- verdicts (drag drop AND dock buttons dispatch the same actions) ----

  const doActivate = useCallback(() => {
    if (focusId != null) dispatch({type: 'ACTIVATE', ideaId: focusId});
  }, [focusId]);

  const openShelve = useCallback((ideaId: string, opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    dispatch({type: 'OPEN_SHELVE', ideaId});
  }, []);

  const doRelease = useCallback((ideaId: string) => {
    dispatch({type: 'RELEASE', ideaId});
  }, []);

  // ---- sheet lifecycle ----

  const restoreSheetFocus = useCallback(() => {
    const opener = sheetOpenerRef.current;
    if (opener != null && opener.isConnected) opener.focus();
    else shelveDockRef.current?.focus();
  }, []);

  const commitShelve = useCallback(() => {
    const anchor = state.sheet?.selectedAnchor ?? null;
    dispatch({type: 'COMMIT_SHELVE'});
    if (anchor != null) {
      setDippedBucket(anchor);
      window.setTimeout(() => setDippedBucket(null), 320);
    }
    restoreSheetFocus();
  }, [state.sheet, restoreSheetFocus]);

  const cancelShelve = useCallback(() => {
    dispatch({type: 'CANCEL_SHELVE'});
    restoreSheetFocus();
  }, [restoreSheetFocus]);

  // Focus moves INTO the sheet on open — preventScroll: plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen (batch-2 amendment).
  useEffect(() => {
    if (state.sheet != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
      // Align the locked 100dvh shell with the viewport top so the
      // bottom-anchored sheet is on screen wherever the page was scrolled.
      shellRef.current?.scrollIntoView({block: 'start', behavior: 'auto'});
    }
  }, [state.sheet != null]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- anchored menu lifecycle ----

  const toggleMenu = useCallback(
    (ideaId: string, opener: HTMLElement) => {
      if (state.menuFor === ideaId) {
        dispatch({type: 'SET_MENU', ideaId: null});
        opener.focus();
      } else {
        menuOpenerRef.current = opener;
        dispatch({type: 'SET_MENU', ideaId});
      }
    },
    [state.menuFor],
  );

  const closeMenu = useCallback(() => {
    dispatch({type: 'SET_MENU', ideaId: null});
    const opener = menuOpenerRef.current;
    if (opener != null && opener.isConnected) opener.focus({preventScroll: true});
  }, []);

  useEffect(() => {
    if (state.menuFor != null) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [state.menuFor]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.menuFor != null) closeMenu();
      else if (state.sheet != null) cancelShelve();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.menuFor, state.sheet, closeMenu, cancelShelve]);

  // ---- tabs: per-tab scrollTop persists; re-tap scrolls to top ----

  const onTabPress = (tab: Tab) => {
    const scroller = getScroller();
    if (tab === state.tab) {
      // The one legal reset — re-tap active tab scrolls to top.
      scroller?.scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'});
      return;
    }
    tabScrollRef.current[state.tab] = scroller?.scrollTop ?? 0;
    dispatch({type: 'SET_TAB', tab});
  };

  useEffect(() => {
    const pending = pendingScrollRef.current;
    pendingScrollRef.current = null;
    if (pending?.kind === 'activated') {
      activatedSectionRef.current?.scrollIntoView({block: 'start', behavior: 'auto'});
      return;
    }
    if (pending?.kind === 'bucket') {
      bucketCardRefs.current[pending.bucketId]?.scrollIntoView({block: 'start', behavior: 'auto'});
      return;
    }
    const scroller = getScroller();
    if (scroller != null) scroller.scrollTop = tabScrollRef.current[state.tab] ?? 0;
  }, [state.tab, getScroller]);

  // navBar pill → Resurfacing tab's Activated section.
  const jumpToActivated = () => {
    if (state.tab === 'resurfacing') {
      activatedSectionRef.current?.scrollIntoView({block: 'start', behavior: reducedMotion ? 'auto' : 'smooth'});
      return;
    }
    const scroller = getScroller();
    tabScrollRef.current[state.tab] = scroller?.scrollTop ?? 0;
    pendingScrollRef.current = {kind: 'activated'};
    dispatch({type: 'SET_TAB', tab: 'resurfacing'});
  };

  const goToBucket = (bucketId: BucketId) => {
    if (state.tab === 'shelf') {
      bucketCardRefs.current[bucketId]?.scrollIntoView({block: 'start', behavior: reducedMotion ? 'auto' : 'smooth'});
      return;
    }
    const scroller = getScroller();
    tabScrollRef.current[state.tab] = scroller?.scrollTop ?? 0;
    pendingScrollRef.current = {kind: 'bucket', bucketId};
    dispatch({type: 'SET_TAB', tab: 'shelf'});
  };

  const scrollToTop = () => getScroller()?.scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'});

  // ---- drag layer ----

  const nearestDockFor = (clientX: number, clientY: number): number | null => {
    const rect = dockRowRef.current?.getBoundingClientRect();
    if (rect == null) return null;
    if (clientY < rect.top - 24 || clientY > rect.bottom + 24) return null;
    const third = rect.width / 3;
    return Math.min(2, Math.max(0, Math.floor((clientX - rect.left) / third)));
  };

  const onDragPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragStartRef.current = {x: event.clientX, y: event.clientY};
    dragMovedRef.current = false;
    setDrag({dx: 0, dy: 0, nearest: null});
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onDragPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (drag == null) return;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) dragMovedRef.current = true;
    setDrag({dx, dy, nearest: nearestDockFor(event.clientX, event.clientY)});
  };
  const onDragPointerUp = () => {
    if (drag == null) return;
    const nearest = dragMovedRef.current ? drag.nearest : null;
    setDrag(null); // transform springs back via the 200ms transition (instant under reduced motion)
    if (nearest === 0) doActivate();
    else if (nearest === 1) openShelve(focusId ?? '', shelveDockRef.current);
    else if (nearest === 2 && focusId != null) doRelease(focusId);
  };
  const onGripClick = () => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    // Visible-button-path escape hatch: a plain tap on the grip lands
    // keyboard focus on the first dock.
    dockRowRef.current?.querySelector('button')?.focus();
  };

  // ---- shelf loadMore ----

  const expandBucket = (bucketId: BucketId) => {
    const fourthId = state.buckets[bucketId][3];
    dispatch({type: 'EXPAND_BUCKET', bucketId});
    // Focus the first newly revealed row (tabIndex −1 div, listExtras law).
    window.setTimeout(() => {
      if (fourthId != null) document.getElementById(\`dw-row-\${fourthId}\`)?.focus({preventScroll: true});
    }, 0);
  };

  // ---- render helpers ----

  const focusMeta = focusIdea != null ? ageMeta(focusIdea) : null;

  const docks: Array<{
    key: string;
    label: string;
    icon: typeof ZapIcon;
    style: CSSProperties;
    preview: string;
    onPress: (event: {currentTarget: HTMLElement}) => void;
    ref?: RefObject<HTMLButtonElement | null>;
  }> = [
    {
      key: 'activate',
      label: 'Activate',
      icon: ZapIcon,
      style: styles.dockActivate,
      preview: \`This week: \${activatedCount} → \${activatedCount + 1}\`,
      onPress: () => doActivate(),
    },
    {
      key: 'shelve',
      label: 'Shelve',
      icon: ArchiveIcon,
      style: styles.dockShelve,
      preview: \`Adds to shelf (\${shelfTotal})\`,
      onPress: event => {
        if (focusId != null) openShelve(focusId, event.currentTarget);
      },
      ref: shelveDockRef,
    },
    {
      key: 'release',
      label: 'Release',
      icon: WindIcon,
      style: styles.dockRelease,
      preview: 'Recoverable from Resurfacing',
      onPress: () => {
        if (focusId != null) doRelease(focusId);
      },
    },
  ];

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const renderShelfRow = (id: string, isLast: boolean) => {
    const item = state.ideas[id];
    const meta = ageMeta(item);
    return (
      <div key={id}>
        <div id={\`dw-row-\${id}\`} tabIndex={-1} className="dw-focusable" style={styles.rowBody}>
          <RipenessSliver stage={item.stage} />
          <span style={styles.rowText}>
            <span style={styles.rowPrimary}>{item.title}</span>
            <span style={{...styles.rowSecondary, ...(meta.stale ? styles.rowSecondaryStale : null)}}>{meta.text}</span>
          </span>
        </div>
        {isLast ? null : <div style={styles.rowDivider} />}
      </div>
    );
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{DW_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — hairline always on (scroll-under not wired; noted). */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="dw-btn dw-focusable"
              style={styles.brandBtn}
              aria-label="Driftwood — back to top"
              onClick={scrollToTop}>
              <BoatMark />
            </button>
          </div>
          <div style={styles.navTitle}>{NAV_TITLE[state.tab]}</div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="dw-btn dw-focusable"
              style={styles.pillHit}
              aria-label={\`This week, \${activatedCount} activated ideas\`}
              onClick={jumpToActivated}>
              <span style={styles.pill}>This week · {activatedCount}</span>
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'sort' ? (
            <>
              <h1 className="dw-vh">Driftwood — someday/maybe queue, frozen {TODAY_LABEL}</h1>
              {focusIdea != null && focusMeta != null ? (
                <>
                  <div style={styles.focusWrap}>
                    {/* FOCUS CARD ≈176px — drag is garnish, docks are the contract. */}
                    <div
                      style={{
                        ...styles.focusCard,
                        transform: drag != null ? \`translate(\${drag.dx}px, \${drag.dy}px)\` : undefined,
                        transition: drag != null || reducedMotion ? 'none' : 'transform 200ms ease',
                        zIndex: drag != null ? 15 : undefined,
                        boxShadow: drag != null ? '0 8px 24px var(--color-shadow)' : undefined,
                        touchAction: 'pan-y',
                      }}
                      onPointerDown={onDragPointerDown}
                      onPointerMove={onDragPointerMove}
                      onPointerUp={onDragPointerUp}>
                      <div style={styles.focusOverline}>
                        Top of queue · {focusIdea.ageDays} days old
                      </div>
                      <h2 style={styles.focusTitle} className="dw-clamp2">
                        {focusIdea.title}
                      </h2>
                      <p style={styles.focusNote} className="dw-clamp2">
                        {focusIdea.note}
                      </p>
                      <RipenessBar ageDays={focusIdea.ageDays} />
                      <div style={styles.focusCaptionRow}>
                        <span
                          style={{
                            ...styles.focusStaleCaption,
                            ...(focusMeta.stale ? styles.rowSecondaryStale : null),
                          }}>
                          {focusMeta.stale ? focusMeta.text : \`goes stale \${focusIdea.staleDate}\`}
                        </span>
                        <span style={styles.stageMeta}>
                          <span style={{...styles.stageDot, background: STAGE_COLOR[focusIdea.stage]}} aria-hidden />
                          {STAGE_LABEL[focusIdea.stage]}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="dw-btn dw-focusable"
                        style={styles.gripBtn}
                        aria-label="Drag to a verdict dock — or use the three buttons below"
                        onPointerDown={onDragPointerDown}
                        onPointerMove={onDragPointerMove}
                        onPointerUp={onDragPointerUp}
                        onClick={onGripClick}>
                        <Icon icon={GripVerticalIcon} size="sm" color="inherit" />
                      </button>
                    </div>
                  </div>

                  {/* VERDICT DOCKS — three labeled 44px buttons; the hovered
                      dock scales 1.08 and previews its consequence. */}
                  <div ref={dockRowRef} style={styles.dockRow}>
                    {docks.map((dock, index) => {
                      const isNear = drag != null && drag.nearest === index && dragMovedRef.current;
                      return (
                        <button
                          key={dock.key}
                          ref={dock.ref}
                          type="button"
                          className="dw-btn dw-focusable dw-anim"
                          style={{
                            ...styles.dock,
                            ...dock.style,
                            transform: isNear ? 'scale(1.08)' : undefined,
                          }}
                          onClick={event => dock.onPress(event)}>
                          {isNear ? (
                            <span style={styles.dockPreview}>{dock.preview}</span>
                          ) : (
                            <>
                              <Icon icon={dock.icon} size="sm" color="inherit" />
                              {dock.label}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={styles.emptyState}>
                  <span style={styles.emptyCircle}>
                    <Icon icon={InboxIcon} size="lg" color="inherit" />
                  </span>
                  <h2 style={styles.emptyTitle}>Queue is clear</h2>
                  <p style={styles.emptyBody}>Shelved ideas resurface here when their moment comes.</p>
                </div>
              )}

              <h2 style={styles.sectionHeader}>Up next · {upNextIds.length}</h2>
              {upNextIds.length > 0 ? (
                <div style={styles.listCard}>
                  {upNextIds.map((id, index) => (
                    <QueueRow
                      key={id}
                      item={state.ideas[id]}
                      isLast={index === upNextIds.length - 1}
                      isMenuOpen={state.menuFor === id}
                      menuRef={menuRef}
                      onToggleMenu={opener => toggleMenu(id, opener)}
                      onMoveToTop={() => dispatch({type: 'MOVE_TO_TOP', ideaId: id})}
                      onShelve={opener => openShelve(id, opener)}
                      onRelease={() => doRelease(id)}
                    />
                  ))}
                </div>
              ) : null}
              <p style={styles.terminalCaption}>All {state.queueOrder.length} in queue</p>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}

          {state.tab === 'shelf' ? (
            <>
              <div style={styles.largeTitleBlock}>
                <h1 style={styles.largeTitle}>On the shelf</h1>
                <span style={styles.largeSubtitle}>
                  {shelfTotal} ideas across {cadenceCount} cadences
                </span>
              </div>
              <ShelfMap buckets={state.buckets} ideas={state.ideas} dippedBucket={dippedBucket} onPlankTap={goToBucket} />
              {BUCKET_DEFS.filter(def => def.plank || state.buckets[def.id].length > 0).map(def => {
                const ids = state.buckets[def.id];
                const over = ids.length - PLANK_CAPACITY;
                const expanded = state.expandedBuckets[def.id] === true;
                const visible = expanded ? ids : ids.slice(0, 3);
                const hidden = ids.length - visible.length;
                return (
                  <div key={def.id} ref={node => void (bucketCardRefs.current[def.id] = node)}>
                    <h2 style={styles.sectionHeader}>
                      <span>
                        {def.header} · {ids.length}
                      </span>
                      {over > 0 ? <span style={styles.sectionHeaderStrain}>⚠ {over} over</span> : null}
                    </h2>
                    <div style={styles.listCard}>
                      {visible.map((id, index) => renderShelfRow(id, index === visible.length - 1 && hidden === 0))}
                      {hidden > 0 ? (
                        <>
                          <div style={styles.rowDivider} />
                          <button
                            type="button"
                            className="dw-btn dw-focusable"
                            style={styles.loadMoreRow}
                            onClick={() => expandBucket(def.id)}>
                            Show {hidden} more
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <p style={styles.terminalCaption}>All {shelfTotal} on the shelf</p>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}

          {state.tab === 'resurfacing' ? (
            <>
              <div style={styles.largeTitleBlock}>
                <h1 style={styles.largeTitle}>Resurfacing</h1>
              </div>
              <div ref={activatedSectionRef}>
                <h2 style={styles.sectionHeader}>Activated this week · {activatedCount}</h2>
                <div style={styles.listCard}>
                  {state.activated.map((id, index) => {
                    const item = state.ideas[id];
                    return (
                      <div key={id}>
                        <div style={{...styles.rowBody, paddingInlineStart: 16, paddingInlineEnd: 16}}>
                          <span style={styles.activatedLead} aria-hidden>
                            <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
                          </span>
                          <span style={styles.rowText}>
                            <span style={styles.rowPrimary}>{item.title}</span>
                            <span style={styles.rowSecondary}>{item.eventLabel ?? 'Activated today'}</span>
                          </span>
                        </div>
                        {index === state.activated.length - 1 ? null : <div style={styles.rowDivider} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <h2 style={styles.sectionHeader}>Released — recoverable · {state.released.length}</h2>
              <div style={styles.listCard}>
                {state.released.length === 0 ? (
                  <EmptyReleased />
                ) : (
                  state.released.map((id, index) => {
                    const item = state.ideas[id];
                    return (
                      <div key={id}>
                        <div style={styles.rowFlex}>
                          <div style={styles.rowBody}>
                            <RipenessSliver stage={item.stage} />
                            <span style={styles.rowText}>
                              <span style={styles.rowPrimary}>{item.title}</span>
                              <span style={styles.rowSecondary}>{item.eventLabel ?? 'Released today'}</span>
                            </span>
                          </div>
                          <button
                            type="button"
                            className="dw-btn dw-focusable"
                            style={styles.restoreBtn}
                            aria-label={\`Restore \${item.title} to queue\`}
                            onClick={() => dispatch({type: 'RESTORE', ideaId: id})}>
                            Restore
                          </button>
                        </div>
                        {index === state.released.length - 1 ? null : <div style={styles.rowDivider} />}
                      </div>
                    );
                  })
                )}
              </div>

              <h2 style={styles.sectionHeader}>Next resurfacings</h2>
              <div style={styles.listCard}>
                {NEXT_RESURFACING_IDS.map((bucketId, index) => {
                  const def = BUCKET_BY_ID[bucketId];
                  const count = state.buckets[bucketId].length;
                  return (
                    <div key={bucketId}>
                      <button
                        type="button"
                        className="dw-btn dw-focusable"
                        style={styles.utilityRow}
                        aria-label={\`\${def.anchor}, \${count} ideas — view on shelf\`}
                        onClick={() => goToBucket(bucketId)}>
                        <span style={styles.utilityLabel}>{def.anchor}</span>
                        <span style={styles.utilityValue}>
                          {count} {count === 1 ? 'idea' : 'ideas'}
                        </span>
                        <span style={styles.chevron}>
                          <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                        </span>
                      </button>
                      {index === NEXT_RESURFACING_IDS.length - 1 ? null : <div style={styles.rowDivider} />}
                    </div>
                  );
                })}
              </div>
              <div style={styles.bottomSpacer} />
            </>
          ) : null}
        </main>

        {/* TOAST DOCK — the single polite live region; sticky-in-flow so it
            pins 76px above the viewport bottom mid-scroll. Release toasts
            persist (NO timer) until Undo, replacement, or restore. */}
        <div style={styles.toastDock} aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="dw-fade">
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    className="dw-btn dw-focusable"
                    style={styles.undoBtn}
                    onClick={() => dispatch({type: 'UNDO_RELEASE'})}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px sticky bottom z20; re-tap active scrolls to top. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Driftwood sections">
          {TABS.map(tab => {
            const active = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="dw-btn dw-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => onTabPress(tab.id)}
                onKeyDown={event => {
                  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                  event.preventDefault();
                  const order = TABS.findIndex(entry => entry.id === tab.id);
                  const next = TABS[(order + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length];
                  onTabPress(next.id);
                }}>
                <Icon icon={tab.icon} size="md" color="inherit" />
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* SHEET — scrim z40 + CadenceDialSheet z41; shell is scroll-locked
            while open. Scrim click cancels (no verdict recorded). */}
        {state.sheet != null ? (
          <>
            <div style={styles.sheetScrim} onClick={cancelShelve} aria-hidden />
            <CadenceDialSheet
              sheet={state.sheet}
              ideaTitle={state.ideas[state.sheet.ideaId]?.title ?? ''}
              buckets={state.buckets}
              reducedMotion={reducedMotion}
              sheetRef={sheetRef}
              onSelect={anchor => dispatch({type: 'SET_ANCHOR', anchor})}
              onDetent={detent => dispatch({type: 'SET_DETENT', detent})}
              onDone={commitShelve}
              onCancel={cancelShelve}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};