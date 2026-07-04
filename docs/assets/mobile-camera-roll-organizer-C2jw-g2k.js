var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Shoebox camera roll: 47 photos
 *   across 9 day-clusters in 3 months (June 19 = 7+5+6+1, May 17 = 8+5+4,
 *   April 11 = 6+5; 19+17+11 = 47 ✓), 4 near-duplicate sets referencing
 *   real photos (removable 3+2+2+1 = 8 ✓, reclaim 78+62+44+18 tenths =
 *   20.2 MB ✓), and 6 albums (24+57+18+41+12+9 = 161 ✓ — album counts
 *   span years beyond the Apr–Jun 2026 roll shown, so 161 intentionally
 *   ≠ 47; do not reconcile). No real photos exist: every thumbnail is a
 *   deterministic gradient derived from the photo's hueIndex — hue =
 *   (hueIndex*47)%360, linear-gradient(135deg, hsl(hue 55% 72%),
 *   hsl((hue+40)%360 60% 52%)). Content art, not chrome, so no
 *   light-dark() needed on the gradients. No Date.now(), no Math.random(),
 *   no network media.
 * @output Shoebox — Camera Roll Organizer: a 390px MOBILE triage app.
 *   Sticky navBar (ShoeboxMark · fading compact title · Select toggle)
 *   over a 52px 'Library' large-title row, a full-bleed month-sectioned
 *   photo grid where each day-cluster promotes its first shot to a 2×2
 *   feature tile with an overlaid day-caption chip (count DERIVED from
 *   live cluster length), a 3-tab tabBar (Library / Albums / Duplicates
 *   with a live count badge), fanned dupeStack cards with 'Keep best' /
 *   'Keep all' verdicts, a 72px selectionTray of removable 32px
 *   mini-thumbs, and a medium-detent album-picker sheet. Signature flow:
 *   Select → tap 3 thumbs → 'Add to album' → pick Hikes → the 3 tiles
 *   dissolve out of the grid (c-jun28 7→4, June 19→16, library 47→44),
 *   Hikes 24→27, Albums tab badge shows 3, tray empties, and the one
 *   aria-live region announces '3 photos moved to Hikes'.
 * @position Page template; emitted by \`astryx template mobile-camera-roll-organizer\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (sheetScrim z40, sheet z41, photoCover z50) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While a
 *   sheet or cover is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The stage clips to
 *   --radius-container; shell paints full-bleed square. No width:390
 *   literals anywhere — clean 320–430px.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows) on the
 *   Albums and Duplicates tabs; the Library photo grid is deliberately
 *   FULL-BLEED (zero inline padding, 0px tile radius — a contact sheet
 *   of butted tiles with 2px gaps; the radius-0 exception and the 16px
 *   (not 32px) sectionHeader gutter are both grid-not-card deviations,
 *   noted at the styles). No desktop Layout frames, no side asides.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Shoebox pink) with a split-use law: brand FILL keeps
 *   #DB2777 in both schemes (white text/glyphs on it ≈ 4.9:1) while
 *   brand TEXT uses the light-dark pair (#DB2777 on light body ≈ 4.9:1,
 *   #F472B6 on dark body ≈ 5.6:1). The two sanctioned non-brand literals
 *   are the amber Star (best-shot) pair and the fixed dayChip scrim —
 *   contrast math at each declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', hairline WIRED to the
 *   IO sentinel — appears only once content has scrolled under);
 *   largeTitle row 52px (total large header 104px), 28px/700 title +
 *   13px/400 tabular '47 photos'; tabBar exactly 64px sticky bottom z20,
 *   3 tabs flex:1 (24px icon over 11px/500 label, 4px gap, 16px brand
 *   badge pill at top:-4 right:-8); PHOTO GRID full-bleed 'repeat(4,
 *   1fr)' + gap 2 + dense flow — at 390px tiles are (390−6)/4 = 96px
 *   squares, feature tile spans 2×2 = 194px; 78.5px at 320, 106px at
 *   430, all fluid fr units; dayChip 24px pill inset 8; check badge 22px
 *   circle inset 6; selection ring inset boxShadow (not border, so the
 *   2px grid never shifts); rows 44px utility / 60px two-line (sheet) /
 *   72px media (48px thumb r12); selectionTray 72px sticky bottom z21
 *   (replaces the tabBar — tabBar unmounts in selectMode), 44×44 chips
 *   around 32px minis (r8), 17px/700 tabular count, 36px brand button in
 *   a 44px hit box; sheet detents 55% medium / calc(100% − 56px) large,
 *   24px grabber zone (36×5 pill button), 52px sheet header, 60px album
 *   rows (40px thumb r8); toast sticky-in-flow at bottom 72 z30 (above
 *   the 64px tabBar + 8px — batch-1 amendment: shell-absolute pins to
 *   the DOCUMENT bottom on tall views). TYPE (Figtree via
 *   --font-family-body): 28/700 · 22/700 · 17/600 · 16/400 body floor ·
 *   13/400 meta · 11/500 overlines+badges; nothing under 11px;
 *   tabular-nums on every updating count. Touch: every target ≥44×44
 *   with ≥8px clearance or merged full-row; every gesture (long-press
 *   select, sheet drag) has a visible button path (Select toggle,
 *   clickable grabber + X, 44×44 chevron per dupeStack).
 *
 * Responsive contract:
 * - Fluid 320–430px: 4-col fr grid, fanned stacks, tray, and sheet all
 *   scale; longest album name ellipsizes at 390 AND 320; tray chip rail
 *   overflows to horizontal scroll; overflowX:'clip' is backstop only.
 *   The demo's .preview-wrap owns scroll — shell never scrolls itself;
 *   the open sheet's album list is the one legal inner scroller.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — above 520px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). Sticky chrome and absolute overlays anchor
 *   to shell, so they stay inside the column. No adaptive relayout —
 *   the contact-sheet anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  FolderOpenIcon,
  HeartIcon,
  ImageIcon,
  PlusIcon,
  StarIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each declared once.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Shoebox pink), split-use per spec:
// BRAND TEXT — #DB2777 on the light body (near-white) ≈ 4.9:1; #F472B6 on
// the dark body (~#1C1C1E) ≈ 5.6:1 — both clear 4.5:1.
const BRAND_ACCENT = 'light-dark(#DB2777, #F472B6)';
// BRAND FILL — buttons, badges, check circles keep the deep pink in BOTH
// schemes so the white label stays legal: #FFFFFF on #DB2777 ≈ 4.9:1.
// (#F472B6 fill would drop white text to ~1.9:1, so fill never flips.)
const BRAND_FILL = '#DB2777';
const BRAND_FILL_TEXT = '#FFFFFF';
// Amber best-shot Star badge — explicit pair per spec. Light: white star
// glyph on #B45309 ≈ 5.9:1. Dark: #451A03 glyph on #F59E0B ≈ 8.1:1.
const STAR_FILL = 'light-dark(#B45309, #F59E0B)';
const STAR_GLYPH = 'light-dark(#FFFFFF, #451A03)';
// dayChip scrim — a FIXED rgba pill (not over raw gradient): the chip
// anchors over the darker 52%-lightness end of the 135° tile gradient
// (worst-case stop luminance ≈ 0.42); composited through rgba(0,0,0,0.55)
// the backdrop luminance is ≤ 0.42×0.45 ≈ 0.19, so white 11px text reads
// ≥ (1.05)/(0.24) ≈ 4.5:1. (Spec drafted 0.45 alpha; deepened to 0.55 so
// the math clears 4.5:1 honestly — noted deviation.)
const CHIP_SCRIM = 'rgba(0, 0, 0, 0.55)';
const CHIP_TEXT = '#FFFFFF';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Brand washes for the utility-row icon slab.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// ShoeboxMark bracket tone — lighter echo of the brand stroke.
const MARK_FADE = \`color-mix(in srgb, \${BRAND_ACCENT} 55%, transparent)\`;
// Chrome blur surface (navBar / tabBar / tray / cover footer).
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, the visually-hidden headings, and
// the reduced-motion guard. Transitions animate transform/opacity/color only
// and collapse to instant under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const SBX_CSS = \`
.sbx-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.sbx-btn:disabled { cursor: default; }
.sbx-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.sbx-fade { transition: opacity 240ms ease; }
.sbx-dissolve { transition: opacity 160ms ease, transform 160ms ease; }
.sbx-hairline { transition: border-color 200ms ease; }
@keyframes sbx-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.sbx-sheet-in { animation: sbx-sheet-in 240ms ease; }
@keyframes sbx-cover-in {
  from { transform: translateY(32px); opacity: 0.3; }
  to { transform: none; opacity: 1; }
}
.sbx-cover-in { animation: sbx-cover-in 240ms ease; }
.sbx-vh {
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
  .sbx-fade, .sbx-hairline { transition: none; }
  .sbx-dissolve { transition: opacity 160ms ease; }
  .sbx-sheet-in, .sbx-cover-in { animation: none; }
}
\`;

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
  // Scroll lock while a sheet/cover is open — absolute overlays anchor to
  // the visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage (>520px container width): centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px targets
  // optically align content to the 16px gutter. The bottom hairline is
  // WIRED: transparent until the IO sentinel under the large title exits.
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
    borderBottom: '1px solid transparent',
  },
  navBarHairlineOn: {borderBottom: '1px solid var(--color-border)'},
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  // Compact center title — fades in as the large title scrolls under.
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    opacity: 1,
  },
  navTitleHidden: {opacity: 0},
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Select / Cancel — brand TEXT (light-dark pair), 44px-tall hit box.
  textBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  // Pushed-screen back button — ChevronLeft 24px + previous title 13/500.
  backBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingInlineEnd: 8,
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // LARGE TITLE row — 52px below the 52px navBar (total large header
  // 104px); Library tab only; scrolls away under the sticky navBar.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, lineHeight: '34px', margin: 0},
  largeTitleCount: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 1px IntersectionObserver sentinel — drives compact title + hairline.
  sentinel: {height: 1},
  body: {flex: 1, display: 'flex', flexDirection: 'column'},
  // Month sectionHeader — at the 16px gutter, NOT 32px: the photo grid is
  // full-bleed, not card-inset (deliberate deviation from the card rule).
  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    margin: '20px 0 8px',
    paddingInline: 16,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  sectionHeaderCount: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Month block — 12px between clusters inside a month, 24px between
  // months (section gap).
  monthBlock: {display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24},
  // CLUSTER GRID — full-bleed 4-col contact sheet: repeat(4, 1fr), 2px
  // gaps, dense flow so thumbs pack around the 2×2 feature tile. At 390px
  // tiles are (390−6)/4 = 96px squares; feature 194px.
  clusterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 2,
    gridAutoFlow: 'dense',
  },
  // Photo tile — 0px radius by design (butted contact-sheet grid; the 2px
  // gap is the separator). Every tile is a real <button>.
  tile: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1',
    borderRadius: 0,
    overflow: 'hidden',
    display: 'block',
  },
  tileFeature: {gridColumn: 'span 2', gridRow: 'span 2'},
  tileDissolving: {opacity: 0, transform: 'scale(0.85)', pointerEvents: 'none'},
  // Feature-tile day chip — 24px pill, 8px inset, fixed scrim (math at
  // CHIP_SCRIM).
  dayChip: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 999,
    background: CHIP_SCRIM,
    color: CHIP_TEXT,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    maxWidth: 'calc(100% - 16px)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Selection check — 22px brand circle, 6px inset; white glyph on
  // BRAND_FILL ≈ 4.9:1.
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
  },
  // Favorite heart on the cover pane meta.
  // TAB BAR — exactly 64px, 3 tabs; unmounts while selectMode.
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
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // SELECTION TRAY — 72px sticky bottom z21; replaces the tabBar while
  // selectMode (tabBar unmounts). Chip rail scrolls horizontally past ~5
  // chips at 390px.
  tray: {
    position: 'sticky',
    bottom: 0,
    zIndex: 21,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  trayRail: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    overflowX: 'auto',
    height: 72,
  },
  trayChip: {
    position: 'relative',
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  trayThumb: {width: 32, height: 32, borderRadius: 8},
  trayChipX: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    pointerEvents: 'none',
  },
  trayCount: {
    fontSize: 17,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  trayHint: {fontSize: 13, color: 'var(--color-text-secondary)', flex: 1, minWidth: 0},
  // 'Add to album' — 36px button inside a 44px-tall hit box.
  trayBtnHit: {height: 44, display: 'flex', alignItems: 'center', flexShrink: 0, borderRadius: 12},
  trayBtn: {
    height: 36,
    paddingInline: 14,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  trayBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // Inset-grouped listCard (Albums / Duplicates tabs).
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  cardStack: {display: 'flex', flexDirection: 'column', gap: 12},
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // Tab caption under the (visually hidden) h1 on Albums/Duplicates.
  tabCaption: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 72px album media row — 48px gradient key-thumb r12, two-line stack,
  // trailing ChevronRight 16px.
  albumRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  albumThumb: {width: 48, height: 48, borderRadius: 12, flexShrink: 0},
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
  rowChevron: {color: 'var(--color-text-secondary)', flexShrink: 0, display: 'inline-flex'},
  // 44px utility row — 'New album' (honest stub → toast).
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
  },
  utilityIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // Duplicates summary — 60px two-line row.
  summaryRow: {
    minHeight: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    padding: '10px 16px',
  },
  // DUPE STACK card — collapsed: 96×96 fan + text + count pill + 44×44
  // chevron (dual path: whole card is also a button).
  dupeHead: {display: 'flex', alignItems: 'center', paddingInlineEnd: 4},
  dupeHeadBtn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0 12px 16px',
  },
  fanWrap: {position: 'relative', width: 96, height: 96, flexShrink: 0},
  fanCard: {
    position: 'absolute',
    inset: 6,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    boxShadow: '0 1px 4px var(--color-shadow)',
  },
  starBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: STAR_FILL,
    color: STAR_GLYPH,
  },
  dupeText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  countPill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  chevronBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // Expanded shots — 4-col 2px grid inside the card, 8px-radius shots.
  shotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 2,
    padding: '0 12px 12px',
  },
  shotTile: {position: 'relative', width: '100%', aspectRatio: '1', borderRadius: 8, overflow: 'hidden'},
  bestChip: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    height: 16,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    paddingInline: 5,
    borderRadius: 999,
    background: STAR_FILL,
    color: STAR_GLYPH,
    fontSize: 11,
    fontWeight: 500,
  },
  dupeFooter: {display: 'flex', gap: 8, padding: '0 12px 12px'},
  keepBestBtn: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
  },
  keepAllBtn: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  keptCaption: {
    padding: '0 16px 12px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // ALBUM DETAIL — uniform 4-col grid of seeded tiles (full-bleed like the
  // library grid).
  albumGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 2,
    marginTop: 12,
  },
  albumSeedTile: {width: '100%', aspectRatio: '1'},
  // TOAST — sticky-in-flow dock (batch-1 amendment): height-0 sticky
  // anchor at bottom 72 (above the 64px tabBar/tray + 8px); the pill is
  // absolute within it. Always mounted for aria-live; NOT shell-absolute
  // (that pins to the document bottom on tall scrolling views).
  toastAnchor: {
    position: 'sticky',
    bottom: 72,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastPill: {
    position: 'absolute',
    bottom: 8,
    maxWidth: 'calc(100% - 48px)',
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 16,
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
  // SHEET — scrim z40 + sheet z41, absolute inside shell; medium 55% /
  // large calc(100% − 56px).
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
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // The ONE legal inner scroller — the sheet's album list.
  sheetList: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 12},
  sheetRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  sheetThumb: {width: 40, height: 40, borderRadius: 8, flexShrink: 0},
  // PHOTO COVER — absolute inset 0 z50 full-screen lightbox; the cover
  // owns its own scroll (legal: it is an open overlay).
  cover: {
    position: 'absolute',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-body)',
    overflowY: 'auto',
  },
  coverNav: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  coverPane: {width: '100%', aspectRatio: '3 / 4', flexShrink: 0},
  coverMeta: {padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 4},
  coverSubject: {fontSize: 22, fontWeight: 700, lineHeight: '28px', margin: 0},
  coverMetaLine: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  coverSpacer: {flex: 1},
  coverFooter: {
    position: 'sticky',
    bottom: 0,
    flexShrink: 0,
    padding: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  coverBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  bottomSpacer: {height: 12},
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic by law. Cross-check ledger (verified by hand):
// June 2026 = 7+5+6+1 = 19 ✓ · May 2026 = 8+5+4 = 17 ✓ · April 2026 =
// 6+5 = 11 ✓ · total 19+17+11 = 47 ✓ → large-title caption '47 photos'.
// Dupe sets ⊂ the 47 (4≤8, 3≤5, 3≤6, 2≤5 per cluster ✓): removable
// 3+2+2+1 = 8 ✓; reclaim 78+62+44+18 tenths = 202 tenths = 20.2 MB ✓.
// Albums 24+57+18+41+12+9 = 161 ✓ — album counts span years beyond the
// Apr–Jun 2026 roll shown, so 161 intentionally ≠ 47; do not reconcile.
// SIGNATURE ARITHMETIC: filing 'Trail switchback' + 'Creek crossing' +
// 'Hazy valley view' to Hikes ⇒ c-jun28 7→4, June 19→16, library 47→44,
// Hikes 24→27, Albums badge 0→3, Duplicates badge unchanged 4, tray 3→0,
// toast '3 photos moved to Hikes'. 'Keep best' on ds-a ⇒ c-may30 8→5,
// May 17→14, library 44→41 (47→44 if run first), badge 4→3, summary 8→5
// removable / 20.2→12.4 MB (62+44+18 = 124 tenths ✓), toast '3 duplicates
// removed · 7.8 MB freed'. Sizes are dual-field (sizeTenths int +
// sizeLabel string) so MB sums never float-drift.
// ---------------------------------------------------------------------------

interface PhotoDef {
  s: string; // subject — the tile's accessible name
  mb: number; // size in TENTHS of a MB (26 = 2.6 MB)
  dupe?: string; // dupe-set membership
  best?: boolean; // the set's algorithm-best shot
  fav?: boolean;
}

interface ClusterDef {
  id: string;
  label: string;
  month: string;
  chip: string; // 'SAT, JUN 28' — live count appended at render
  dateLabel: string; // 'Sat, Jun 28 2026' — cover meta
  photos: PhotoDef[]; // first photo = the 2×2 feature tile
}

const CLUSTERS: ClusterDef[] = [
  {
    id: 'c-jun28',
    label: 'Mission Peak hike',
    month: 'June 2026',
    chip: 'SAT, JUN 28',
    dateLabel: 'Sat, Jun 28 2026',
    photos: [
      {s: 'Summit ridge at golden hour', mb: 34, fav: true},
      {s: 'Trail switchback', mb: 26},
      {s: 'Creek crossing', mb: 24},
      {s: 'Juniper the trail dog', mb: 31},
      {s: 'Boot-lace break', mb: 18},
      {s: 'Summit sandwich', mb: 21},
      {s: 'Hazy valley view', mb: 28},
    ],
  },
  {
    id: 'c-jun21',
    label: 'Ferry Building farmers market',
    month: 'June 2026',
    chip: 'SAT, JUN 21',
    dateLabel: 'Sat, Jun 21 2026',
    photos: [
      {s: 'Heirloom tomato pyramid', mb: 23},
      {s: 'Sourdough haul', mb: 19},
      {s: 'Bay Bridge from the pier', mb: 29},
      {s: 'Flower stall dahlias', mb: 25, fav: true},
      {s: 'Oyster stand line', mb: 17},
    ],
  },
  {
    id: 'c-jun14',
    label: 'Café morning',
    month: 'June 2026',
    chip: 'SAT, JUN 14',
    dateLabel: 'Sat, Jun 14 2026',
    photos: [
      // ds-c 'Latte art' 3-shot burst — best = shot 1; 2 discards × 2.2 MB
      // = 4.4 MB ✓.
      {s: 'Latte art rosetta — first pour', mb: 22, dupe: 'ds-c', best: true},
      {s: 'Latte art rosetta — refocus', mb: 22, dupe: 'ds-c'},
      {s: 'Latte art rosetta — hand in frame', mb: 22, dupe: 'ds-c'},
      {s: 'Window seat crossword', mb: 16},
      {s: 'Marble counter pastry case', mb: 20},
      {s: 'Rainy sidewalk from the window', mb: 24},
    ],
  },
  {
    // STRESS FIXTURE (1): single-photo cluster — renders as the lone 2×2
    // feature + chip 'THU, JUN 5 · 1' with no empty-track artifacts.
    id: 'c-jun05',
    label: 'Parking level 4 note',
    month: 'June 2026',
    chip: 'THU, JUN 5',
    dateLabel: 'Thu, Jun 5 2026',
    photos: [{s: 'Level 4, row K — by the blue pillar', mb: 12}],
  },
  {
    // STRESS FIXTURE (2): 8-photo cluster — 4 feature cells + 7 thumbs =
    // 11 grid cells; the ragged last row is correct dense-flow behavior.
    id: 'c-may30',
    label: 'Golden Gate overlook',
    month: 'May 2026',
    chip: 'FRI, MAY 30',
    dateLabel: 'Fri, May 30 2026',
    photos: [
      {s: 'Fog line under the south tower', mb: 33, fav: true},
      // ds-a 'Golden Gate overlook burst' — best = shot 2 (sharpest, eyes
      // open); 3 discards × 2.6 MB = 7.8 MB ✓. STRESS (3): 4-shot set
      // still fans only 3 cards + a '4 shots' pill.
      {s: 'Bridge burst — frame 1', mb: 26, dupe: 'ds-a'},
      {s: 'Bridge burst — frame 2, eyes open', mb: 26, dupe: 'ds-a', best: true},
      {s: 'Bridge burst — frame 3', mb: 26, dupe: 'ds-a'},
      {s: 'Bridge burst — frame 4', mb: 26, dupe: 'ds-a'},
      {s: 'Vista point cyclists', mb: 22},
      {s: 'Sailboat under the span', mb: 27},
      {s: 'Wind-blown selfie attempt', mb: 19},
    ],
  },
  {
    id: 'c-may17',
    label: "Dad's birthday",
    month: 'May 2026',
    chip: 'SAT, MAY 17',
    dateLabel: 'Sat, May 17 2026',
    photos: [
      {s: 'Cake arriving at the patio table', mb: 29},
      // ds-b 'Birthday candles' — best = shot 3 (mid-laugh); 2 discards ×
      // 3.1 MB = 6.2 MB ✓.
      {s: 'Candles burst — frame 1', mb: 31, dupe: 'ds-b'},
      {s: 'Candles burst — frame 2', mb: 31, dupe: 'ds-b'},
      {s: 'Candles burst — frame 3, mid-laugh', mb: 31, dupe: 'ds-b', best: true},
      {s: 'Grandkids pile-on', mb: 24},
    ],
  },
  {
    id: 'c-may09',
    label: 'Backyard planting',
    month: 'May 2026',
    chip: 'FRI, MAY 9',
    dateLabel: 'Fri, May 9 2026',
    photos: [
      {s: 'Tomato starts in the bed', mb: 21},
      {s: 'Trellis before the beans', mb: 18},
      {s: 'Mud-caked gloves', mb: 23},
      {s: 'First drip-line test', mb: 20},
    ],
  },
  {
    id: 'c-apr26',
    label: 'Ocean Beach bonfire',
    month: 'April 2026',
    chip: 'SAT, APR 26',
    dateLabel: 'Sat, Apr 26 2026',
    photos: [
      {s: 'Fire pit at dusk', mb: 28},
      {s: 'Marshmallow roast', mb: 22},
      {s: 'Low-tide silhouettes', mb: 30},
      {s: 'Driftwood fort', mb: 19},
      {s: 'Sparks long exposure', mb: 35},
      {s: 'Sandy shoes lineup', mb: 17},
    ],
  },
  {
    id: 'c-apr12',
    label: 'Sprint planning whiteboard',
    month: 'April 2026',
    chip: 'SAT, APR 12',
    dateLabel: 'Sat, Apr 12 2026',
    photos: [
      {s: 'Sticky-note vote dots', mb: 15},
      // ds-d 2-shot pair — STRESS (3) minimum fan (2 cards, −3°/+3°) and
      // (5) the long subject: photoCover h2 wraps to 2 lines, dupeStack
      // title ellipsizes to 1. Best = shot 2; 1 discard × 1.8 MB ✓.
      {s: 'Whiteboard — Q3 roadmap swimlanes and the parking-lot column nobody reads', mb: 18, dupe: 'ds-d'},
      {s: 'Whiteboard — Q3 roadmap, glare fixed', mb: 18, dupe: 'ds-d', best: true},
      {s: 'Team retro doughnuts', mb: 16},
      {s: 'Capacity math on the glass wall', mb: 14},
    ],
  },
];

const MONTH_ORDER = ['June 2026', 'May 2026', 'April 2026'];

interface Photo {
  id: string;
  subject: string;
  clusterId: string;
  hueIndex: number;
  sizeTenths: number; // dual field — integer tenths of a MB
  sizeLabel: string; // dual field — '2.6 MB'
  favorite: boolean;
  dupeSetId: string | null;
  isBest: boolean;
  // Runtime lifecycle — 'library' renders in the grid; 'filed' left via
  // the album picker; 'removed' left via 'Keep best'.
  status: 'library' | 'filed' | 'removed';
  albumId: string | null;
}

function fmtMb(tenths: number): string {
  return \`\${(tenths / 10).toFixed(1)} MB\`;
}

// 47 photos, ids p01–p47 in cluster order; hueIndex is the sequential
// index, so every tile's art is reproducible from its own record.
const INITIAL_PHOTOS: Photo[] = CLUSTERS.flatMap(cluster => cluster.photos.map(def => ({cluster, def}))).map(
  ({cluster, def}, index) => ({
    id: \`p\${String(index + 1).padStart(2, '0')}\`,
    subject: def.s,
    clusterId: cluster.id,
    hueIndex: index,
    sizeTenths: def.mb,
    sizeLabel: fmtMb(def.mb),
    favorite: def.fav === true,
    dupeSetId: def.dupe ?? null,
    isBest: def.best === true,
    status: 'library',
    albumId: null,
  }),
);

const CLUSTER_BY_ID: Record<string, ClusterDef> = Object.fromEntries(
  CLUSTERS.map(cluster => [cluster.id, cluster]),
);

// DUPE SETS — identity meta; membership/best derive from the photos so
// the two can never disagree.
interface DupeSetMeta {
  id: string;
  title: string;
}

const DUPE_SETS: DupeSetMeta[] = [
  {id: 'ds-a', title: 'Golden Gate overlook burst'},
  {id: 'ds-b', title: 'Birthday candles'},
  {id: 'ds-c', title: 'Latte art'},
  // The one-line-ellipsis stress title (pairs with the cover-wrap subject).
  {id: 'ds-d', title: 'Whiteboard — Q3 roadmap swimlanes and the parking-lot column nobody reads'},
];

type DupeStatus = 'open' | 'resolved' | 'keptAll';

// ALBUMS — identity consts. baseCount is the pre-session library beyond
// the visible roll; live count = baseCount + photos filed this session.
interface Album {
  id: string;
  name: string;
  baseCount: number;
  seed: number; // seeded key-thumb + detail-grid art: hueIndex = seed + i
}

const ALBUMS: Album[] = [
  {id: 'al-hikes', name: 'Hikes', baseCount: 24, seed: 3},
  {id: 'al-family', name: 'Family', baseCount: 57, seed: 9},
  {id: 'al-food', name: 'Food', baseCount: 18, seed: 15},
  {id: 'al-shots', name: 'Screenshots', baseCount: 41, seed: 22},
  {id: 'al-favs', name: 'Favorites', baseCount: 12, seed: 30},
  // STRESS FIXTURE (4): 72px-row ellipsis at 390 AND 320, and the 200px
  // navBar title ellipsis when pushed.
  {id: 'al-pnw', name: 'Pacific Northwest camping & fire lookout trips', baseCount: 9, seed: 38},
];

const ALBUM_BY_ID: Record<string, Album> = Object.fromEntries(ALBUMS.map(album => [album.id, album]));

// ---------------------------------------------------------------------------
// TILE ART — the repo's poster-gradient law: no real photos exist, so every
// thumbnail is a deterministic gradient derived from the item's numeric id.
// hue = (hueIndex*47)%360; content art, not chrome, so no light-dark()
// (the same gradient reads as a photo in both schemes).
// ---------------------------------------------------------------------------

function artFor(hueIndex: number): string {
  const hue = (hueIndex * 47) % 360;
  return \`linear-gradient(135deg, hsl(\${hue} 55% 72%), hsl(\${(hue + 40) % 360} 60% 52%))\`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — ShoeboxApp holds every mutable fact; ONE update(id,
// patch) patches entity arrays (photos, dupe sets) by id; ALL counts
// (cluster chips, month totals, '47 photos', tab badges, summary MB) are
// DERIVED at render, never stored twice.
// ---------------------------------------------------------------------------

type Tab = 'library' | 'albums' | 'duplicates';

interface UiState {
  tab: Tab;
  screen: 'root' | \`album:\${string}\`;
  selectMode: boolean;
  selection: string[]; // photo ids, insertion order
  sheet: null | 'picker';
  sheetPhotoId: string | null; // null = multi (tray) mode
  sheetDetent: 'medium' | 'large';
  cover: string | null; // photo id
  expandedSetId: string | null;
  dissolvingIds: string[]; // 160ms exit transition, then commit
  toast: {seq: number; text: string} | null;
}

interface ShoeboxState {
  photos: Photo[];
  setStatus: Record<string, DupeStatus>;
  ui: UiState;
}

const INITIAL_STATE: ShoeboxState = {
  photos: INITIAL_PHOTOS,
  setStatus: {'ds-a': 'open', 'ds-b': 'open', 'ds-c': 'open', 'ds-d': 'open'},
  ui: {
    tab: 'library',
    screen: 'root',
    selectMode: false,
    selection: [],
    sheet: null,
    sheetPhotoId: null,
    sheetDetent: 'medium',
    cover: null,
    expandedSetId: null,
    dissolvingIds: [],
    toast: null,
  },
};

function useShoeboxState() {
  const [state, setState] = useState<ShoeboxState>(INITIAL_STATE);
  // THE update(id, patch): patches a photo (by photo id) or a dupe set
  // (by set id) in place; every surface funnels through it or through a
  // named commit built on the same setState.
  const update = useCallback((id: string, patch: Partial<Photo> | DupeStatus) => {
    setState(prev => {
      if (typeof patch === 'string') {
        return {...prev, setStatus: {...prev.setStatus, [id]: patch}};
      }
      return {
        ...prev,
        photos: prev.photos.map(photo => (photo.id === id ? {...photo, ...patch} : photo)),
      };
    });
  }, []);
  const patchUi = useCallback((patch: Partial<UiState>) => {
    setState(prev => ({...prev, ui: {...prev.ui, ...patch}}));
  }, []);
  return {state, setState, update, patchUi};
}

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

// Focus trap — sheets and the cover trap Tab while open.
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
// SHOEBOX MARK — 24px flat two-tone SVG: open box outline (2px brand
// stroke) with three photo-corner brackets peeking above the rim at
// staggered heights (y offsets 2/0/3, 1.5px stroke in the lighter tone).
// No gradients, no SVG text.
// ---------------------------------------------------------------------------

function ShoeboxMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* Open box: rim + tapered base. */}
        <path
          d="M3.5 10.5h17l-1.6 8.2a1.5 1.5 0 0 1-1.47 1.2H6.57a1.5 1.5 0 0 1-1.47-1.2L3.5 10.5Z"
          stroke={BRAND_ACCENT}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Photo-corner brackets above the rim — staggered y 2 / 0 / 3. */}
        <path d="M6.5 9V6.5H9" stroke={MARK_FADE} strokeWidth={1.5} strokeLinecap="round" />
        <path d="M10.75 7V4.5h2.5" stroke={MARK_FADE} strokeWidth={1.5} strokeLinecap="round" />
        <path d="M15 9.5V7h2.5" stroke={MARK_FADE} strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PHOTO TILE — every tile a real <button> named by its subject. Normal tap
// → photoCover; selectMode tap → toggle selection; long-press 450ms (8px
// move cancels) enters selectMode + selects, with the navBar Select button
// as the visible non-gesture path. Selected = 22px check badge + inset
// brand ring (boxShadow inset, not border, so the 2px grid never shifts).
// ---------------------------------------------------------------------------

interface PhotoTileProps {
  photo: Photo;
  isFeature: boolean;
  chipText: string | null;
  isSelected: boolean;
  isDissolving: boolean;
  selectMode: boolean;
  onTap: (photo: Photo, opener: HTMLElement) => void;
  onLongPress: (photo: Photo) => void;
}

function PhotoTile({photo, isFeature, chipText, isSelected, isDissolving, selectMode, onTap, onLongPress}: PhotoTileProps) {
  const pressTimer = useRef<number | null>(null);
  const pressOrigin = useRef<{x: number; y: number} | null>(null);
  const longPressFired = useRef(false);

  const clearPress = () => {
    if (pressTimer.current != null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    pressOrigin.current = null;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (selectMode) return; // long-press only bootstraps selectMode
    longPressFired.current = false;
    pressOrigin.current = {x: event.clientX, y: event.clientY};
    pressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      onLongPress(photo);
    }, 450);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const origin = pressOrigin.current;
    if (origin == null) return;
    if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 8) clearPress();
  };

  const tileStyle: CSSProperties = {
    ...styles.tile,
    ...(isFeature ? styles.tileFeature : null),
    background: artFor(photo.hueIndex),
    ...(isSelected ? {boxShadow: \`inset 0 0 0 2px \${BRAND_ACCENT}\`} : null),
    ...(isDissolving ? styles.tileDissolving : null),
  };

  return (
    <button
      type="button"
      className="sbx-btn sbx-focusable sbx-dissolve"
      style={tileStyle}
      aria-label={\`\${photo.subject}, \${CLUSTER_BY_ID[photo.clusterId].dateLabel}\`}
      aria-pressed={selectMode ? isSelected : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={clearPress}
      onPointerCancel={clearPress}
      onClick={event => {
        if (longPressFired.current) {
          longPressFired.current = false;
          return;
        }
        onTap(photo, event.currentTarget);
      }}>
      {chipText != null ? (
        <span style={styles.dayChip} aria-hidden>
          {chipText}
        </span>
      ) : null}
      {isSelected ? (
        <span style={styles.checkBadge} aria-hidden>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// CLUSTER GRID — the day-cluster contact sheet: first live photo promoted
// to the 2×2 feature tile carrying the dayChip; the chip count DERIVES
// from the live cluster length, so moves and dedupes update it in place.
// ---------------------------------------------------------------------------

interface ClusterGridProps {
  cluster: ClusterDef;
  photos: Photo[]; // live photos of this cluster, in fixture order
  selection: string[];
  dissolvingIds: string[];
  selectMode: boolean;
  onTap: (photo: Photo, opener: HTMLElement) => void;
  onLongPress: (photo: Photo) => void;
}

function ClusterGrid({cluster, photos, selection, dissolvingIds, selectMode, onTap, onLongPress}: ClusterGridProps) {
  return (
    <div style={styles.clusterGrid} role="group" aria-label={\`\${cluster.label}, \${photos.length} photos\`}>
      {photos.map((photo, index) => (
        <PhotoTile
          key={photo.id}
          photo={photo}
          isFeature={index === 0}
          chipText={index === 0 ? \`\${cluster.chip} · \${photos.length}\` : null}
          isSelected={selection.includes(photo.id)}
          isDissolving={dissolvingIds.includes(photo.id)}
          selectMode={selectMode}
          onTap={onTap}
          onLongPress={onLongPress}
        />
      ))}
    </div>
  );
}

function fmtShots(count: number): string {
  return count === 1 ? '1 shot' : \`\${count} shots\`;
}

function fmtPhotos(count: number): string {
  return count === 1 ? '1 photo' : \`\${count} photos\`;
}

// ---------------------------------------------------------------------------
// DUPE STACK — fanned near-duplicate stack. Collapsed: up to 3 of the
// set's live shots at −3°/0°/+3° with 3px translate offsets (2-shot sets
// fan −3°/+3° — stress fixture 3), best shot on top with the amber Star
// badge; title + '4 shots · save 7.8 MB' meta + count pill + 44×44
// chevron (whole head is ALSO a button — dual path). Expanded: shots flat
// in a 4-col 2px grid, best carries Star + 'Best' chip, footer = 36px
// 'Keep best' brand button + 36px 'Keep all' ghost. Reviewed sets keep a
// 13px caption and leave the removable math.
// ---------------------------------------------------------------------------

interface DupeStackCardProps {
  meta: DupeSetMeta;
  status: DupeStatus;
  livePhotos: Photo[]; // set photos still in the library, fixture order
  removableTenths: number;
  isExpanded: boolean;
  onToggle: () => void;
  onKeepBest: () => void;
  onKeepAll: () => void;
}

function DupeStackCard({meta, status, livePhotos, removableTenths, isExpanded, onToggle, onKeepBest, onKeepAll}: DupeStackCardProps) {
  const best = livePhotos.find(photo => photo.isBest) ?? null;
  // Fan: up to 3 cards with the best shot rendered last (on top).
  const fanPhotos = [...livePhotos.filter(photo => !photo.isBest), ...(best != null ? [best] : [])].slice(-3);
  const fanTransforms =
    fanPhotos.length >= 3 ? ['rotate(-3deg) translate(-3px, 2px)', 'rotate(0deg)', 'rotate(3deg) translate(3px, -2px)']
    : fanPhotos.length === 2 ? ['rotate(-3deg) translate(-3px, 2px)', 'rotate(3deg) translate(3px, -2px)']
    : ['rotate(0deg)'];
  const metaLine =
    status === 'open'
      ? \`\${fmtShots(livePhotos.length)} · save \${fmtMb(removableTenths)}\`
      : status === 'resolved'
        ? \`Best kept · \${fmtMb(removableTenths)} freed\`
        : \`Kept all \${livePhotos.length}\`;
  const reviewed = status !== 'open';
  return (
    <div style={styles.listCard}>
      <div style={styles.dupeHead}>
        <button
          type="button"
          className="sbx-btn sbx-focusable"
          style={styles.dupeHeadBtn}
          aria-expanded={!reviewed ? isExpanded : undefined}
          disabled={reviewed}
          aria-label={\`\${meta.title}, \${metaLine}\${reviewed ? ', reviewed' : isExpanded ? ', collapse' : ', expand'}\`}
          onClick={reviewed ? undefined : onToggle}>
          <span style={styles.fanWrap} aria-hidden>
            {fanPhotos.map((photo, index) => (
              <span
                key={photo.id}
                style={{...styles.fanCard, background: artFor(photo.hueIndex), transform: fanTransforms[index]}}>
                {photo.isBest ? (
                  <span style={styles.starBadge}>
                    <Icon icon={StarIcon} size="xsm" color="inherit" />
                  </span>
                ) : null}
              </span>
            ))}
          </span>
          <span style={styles.dupeText}>
            <span style={styles.rowPrimary}>{meta.title}</span>
            <span style={styles.rowSecondary}>{metaLine}</span>
            <span style={styles.countPill}>{fmtShots(livePhotos.length)}</span>
          </span>
        </button>
        {!reviewed ? (
          <button
            type="button"
            className="sbx-btn sbx-focusable"
            style={styles.chevronBtn}
            aria-expanded={isExpanded}
            aria-label={\`\${isExpanded ? 'Collapse' : 'Expand'} \${meta.title}\`}
            onClick={onToggle}>
            <span
              className="sbx-fade"
              style={{display: 'inline-flex', transform: isExpanded ? 'rotate(180deg)' : 'none'}}>
              <Icon icon={ChevronDownIcon} size="md" color="inherit" />
            </span>
          </button>
        ) : null}
      </div>
      {reviewed ? <div style={styles.keptCaption}>{status === 'keptAll' ? \`Kept all \${livePhotos.length}\` : \`Kept the best shot · \${fmtMb(removableTenths)} freed\`}</div> : null}
      {isExpanded && !reviewed ? (
        <>
          <div style={styles.shotGrid}>
            {livePhotos.map(photo => (
              <div
                key={photo.id}
                style={{...styles.shotTile, background: artFor(photo.hueIndex)}}
                role="img"
                aria-label={\`\${photo.subject}\${photo.isBest ? ' — best shot' : ''}\`}>
                {photo.isBest ? (
                  <span style={styles.bestChip} aria-hidden>
                    <Icon icon={StarIcon} size="xsm" color="inherit" />
                    Best
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <div style={styles.dupeFooter}>
            <button type="button" className="sbx-btn sbx-focusable" style={styles.keepBestBtn} onClick={onKeepBest}>
              Keep best
            </button>
            <button type="button" className="sbx-btn sbx-focusable" style={styles.keepAllBtn} onClick={onKeepAll}>
              Keep all
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ALBUM PICKER SHEET — medium detent 55% (grabber toggles LARGE
// calc(100% − 56px)); 24px grabber zone with the 36×5 pill inside a real
// button; 52px header ('Add N photos to…' — count interpolated) with a
// trailing 44×44 X; then the ONE legal inner scroller of 60px album rows
// + the honest 'New album' stub. Pointer drag on the grabber is garnish
// (>120px past medium closes); grabber click, X, scrim, and Escape are
// the contract.
// ---------------------------------------------------------------------------

interface PickerSheetProps {
  photoCount: number;
  detent: 'medium' | 'large';
  liveCounts: Record<string, number>;
  sheetRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  onPick: (albumId: string) => void;
  onNewAlbum: () => void;
}

function PickerSheet({photoCount, detent, liveCounts, sheetRef, closeBtnRef, onDetentChange, onClose, onPick, onNewAlbum}: PickerSheetProps) {
  const dragStartY = useRef<number | null>(null);
  const dragMoved = useRef(false);
  const onGrabberPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragStartY.current = event.clientY;
    dragMoved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onGrabberPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = dragStartY.current;
    dragStartY.current = null;
    if (start == null) return;
    const dy = event.clientY - start;
    if (Math.abs(dy) > 8) dragMoved.current = true;
    if (dy > 120) onClose();
    else if (dy > 40) onDetentChange('medium');
    else if (dy < -40) onDetentChange('large');
  };
  return (
    <div
      ref={sheetRef}
      className="sbx-sheet-in"
      style={{...styles.sheet, ...(detent === 'large' ? styles.sheetLarge : styles.sheetMedium)}}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sbx-picker-title"
      tabIndex={-1}
      onKeyDown={event => trapTabKey(event, event.currentTarget)}>
      {/* Grabber — the whole 24px zone is the 'Resize sheet' button
          (full sheet width, merged target per the ≥44px-or-merge rule). */}
      <button
        type="button"
        className="sbx-btn sbx-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onPointerDown={onGrabberPointerDown}
        onPointerUp={onGrabberPointerUp}
        onClick={() => {
          if (dragMoved.current) {
            dragMoved.current = false;
            return;
          }
          onDetentChange(detent === 'medium' ? 'large' : 'medium');
        }}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id="sbx-picker-title" style={styles.sheetTitle}>
          Add {fmtPhotos(photoCount)} to…
        </h2>
        <button
          type="button"
          ref={closeBtnRef}
          className="sbx-btn sbx-focusable"
          style={styles.iconBtn}
          aria-label="Close album picker"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetList}>
        {ALBUMS.map((album, index) => (
          <div key={album.id}>
            {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
            <button
              type="button"
              className="sbx-btn sbx-focusable"
              style={styles.sheetRow}
              aria-label={\`Add to \${album.name}, \${fmtPhotos(liveCounts[album.id])}\`}
              onClick={() => onPick(album.id)}>
              <span style={{...styles.sheetThumb, background: artFor(album.seed)}} aria-hidden />
              <span style={styles.rowText}>
                <span style={styles.rowPrimary}>{album.name}</span>
                <span style={styles.rowSecondary}>{fmtPhotos(liveCounts[album.id])}</span>
              </span>
            </button>
          </div>
        ))}
        <div style={styles.rowDividerDeep} />
        <button type="button" className="sbx-btn sbx-focusable" style={styles.utilityRow} onClick={onNewAlbum}>
          <span style={styles.utilityIcon}>
            <Icon icon={PlusIcon} size="sm" color="inherit" />
          </span>
          New album
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PHOTO COVER — absolute inset-0 z50 lightbox: own navBar (44×44 X
// leading, Heart favorite toggle trailing), 3:4 gradient pane, subject h2
// (the ds-d long subject wraps to 2 lines — stress fixture 5), meta rows,
// and a sticky 48px 'Move to album' footer. A cover may not stack a
// sheet: 'Move to album' CLOSES the cover first, then opens the picker in
// single-photo mode, keeping one overlay layer honest. Slides up 240ms;
// plain fade under reduced motion (CSS guard).
// ---------------------------------------------------------------------------

interface PhotoCoverProps {
  photo: Photo;
  coverRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onToggleFavorite: () => void;
  onMove: (opener: HTMLElement) => void;
}

function PhotoCover({photo, coverRef, closeBtnRef, onClose, onToggleFavorite, onMove}: PhotoCoverProps) {
  const cluster = CLUSTER_BY_ID[photo.clusterId];
  return (
    <div
      ref={coverRef}
      className="sbx-cover-in"
      style={styles.cover}
      role="dialog"
      aria-modal="true"
      aria-label={photo.subject}
      tabIndex={-1}
      onKeyDown={event => trapTabKey(event, event.currentTarget)}>
      <div style={styles.coverNav}>
        <div style={styles.navLeading}>
          <button
            type="button"
            ref={closeBtnRef}
            className="sbx-btn sbx-focusable"
            style={styles.iconBtn}
            aria-label="Close photo"
            onClick={onClose}>
            <Icon icon={XIcon} size="md" color="inherit" />
          </button>
        </div>
        <span aria-hidden />
        <div style={styles.navTrailing}>
          <button
            type="button"
            className="sbx-btn sbx-focusable"
            style={{...styles.iconBtn, ...(photo.favorite ? {color: BRAND_ACCENT} : null)}}
            aria-pressed={photo.favorite}
            aria-label={photo.favorite ? \`Remove \${photo.subject} from favorites\` : \`Favorite \${photo.subject}\`}
            onClick={onToggleFavorite}>
            <Icon icon={HeartIcon} size="md" color="inherit" />
          </button>
        </div>
      </div>
      {/* 0px radius — full-bleed pane within the cover (corner map). */}
      <div style={{...styles.coverPane, background: artFor(photo.hueIndex)}} role="img" aria-label={photo.subject} />
      <div style={styles.coverMeta}>
        <h2 style={styles.coverSubject}>{photo.subject}</h2>
        <span style={styles.coverMetaLine}>{cluster.dateLabel}</span>
        <span style={styles.coverMetaLine}>{photo.sizeLabel}</span>
        <span style={styles.coverMetaLine}>{cluster.label}</span>
      </div>
      <div style={styles.coverSpacer} />
      <div style={styles.coverFooter}>
        <button
          type="button"
          className="sbx-btn sbx-focusable"
          style={styles.coverBtn}
          onClick={event => onMove(event.currentTarget)}>
          Move to album
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — ShoeboxApp, the single state owner.
// ---------------------------------------------------------------------------

const TAB_META: Array<{id: Tab; label: string; icon: typeof ImageIcon}> = [
  {id: 'library', label: 'Library', icon: ImageIcon},
  {id: 'albums', label: 'Albums', icon: FolderOpenIcon},
  {id: 'duplicates', label: 'Duplicates', icon: CopyIcon},
];

const NAV_TITLES: Record<Tab, string> = {library: 'Library', albums: 'Albums', duplicates: 'Duplicates'};

export default function MobileCameraRollOrganizerTemplate() {
  // Container-width column decision: >520px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth > 520 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {state, setState, update, patchUi} = useShoeboxState();
  const {photos, setStatus, ui} = state;

  // Focus plumbing — every overlay restores focus to its opener.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const coverCloseRef = useRef<HTMLButtonElement | null>(null);
  const coverOpenerRef = useRef<HTMLElement | null>(null);
  const selectBtnRef = useRef<HTMLButtonElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const toastSeqRef = useRef(0);
  const dissolveTimerRef = useRef<number | null>(null);

  // Large-title collapse — IO sentinel drives compact-title opacity AND
  // the wired navBar hairline; reduced motion collapses to opacity swap
  // (the transition classes no-op under the media guard).
  const [largeTitleGone, setLargeTitleGone] = useState(false);
  const onLibraryRoot = ui.tab === 'library' && ui.screen === 'root';
  useEffect(() => {
    if (!onLibraryRoot) return undefined;
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry != null) setLargeTitleGone(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onLibraryRoot]);

  // -- DERIVED (never stored twice) ----------------------------------------
  const libraryPhotos = photos.filter(photo => photo.status === 'library');
  const totalCount = libraryPhotos.length;
  const liveByCluster: Record<string, Photo[]> = {};
  for (const photo of libraryPhotos) {
    (liveByCluster[photo.clusterId] ??= []).push(photo);
  }
  // Months → clusters with live photos; empty clusters (and then empty
  // months) unmount entirely — stress fixture 8.
  const monthSections = MONTH_ORDER.map(month => {
    const clusters = CLUSTERS.filter(cluster => cluster.month === month && (liveByCluster[cluster.id]?.length ?? 0) > 0);
    const count = clusters.reduce((sum, cluster) => sum + liveByCluster[cluster.id].length, 0);
    return {month, clusters, count};
  }).filter(section => section.clusters.length > 0);

  const filedCount = photos.filter(photo => photo.status === 'filed').length; // Albums tab badge
  const albumLiveCounts: Record<string, number> = Object.fromEntries(
    ALBUMS.map(album => [album.id, album.baseCount + photos.filter(photo => photo.albumId === album.id).length]),
  );
  const albumsTotal = ALBUMS.reduce((sum, album) => sum + albumLiveCounts[album.id], 0);

  // Duplicates — reviewed sets leave the removable math; the badge counts
  // unreviewed (open) sets only.
  const setLivePhotos = (setId: string) => photos.filter(photo => photo.dupeSetId === setId && photo.status !== 'removed');
  const openSets = DUPE_SETS.filter(meta => setStatus[meta.id] === 'open');
  const removableShots = openSets.reduce(
    (sum, meta) => sum + setLivePhotos(meta.id).filter(photo => !photo.isBest && photo.status === 'library').length,
    0,
  );
  const removableTenthsTotal = openSets.reduce(
    (sum, meta) =>
      sum +
      setLivePhotos(meta.id)
        .filter(photo => !photo.isBest && photo.status === 'library')
        .reduce((mb, photo) => mb + photo.sizeTenths, 0),
    0,
  );

  const photoById = (id: string) => photos.find(photo => photo.id === id) ?? null;
  const coverPhoto = ui.cover != null ? photoById(ui.cover) : null;
  const isOverlayOpen = ui.sheet != null || ui.cover != null;

  // -- toast (the ONE polite live region) -----------------------------------
  const toastPatch = (text: string) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text}};
  };
  useEffect(() => {
    if (ui.toast == null) return undefined;
    const timer = window.setTimeout(() => patchUi({toast: null}), 4000);
    return () => window.clearTimeout(timer);
  }, [ui.toast, patchUi]);

  // Focus into an opening sheet/cover with preventScroll — plain .focus()
  // scroll-reveals the animating overlay inside the locked overflow-hidden
  // column and beaches it mid-screen (batch-1 amendment).
  useEffect(() => {
    if (ui.sheet != null) {
      sheetCloseRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [ui.sheet]);
  useEffect(() => {
    if (ui.cover != null) {
      coverCloseRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [ui.cover]);

  useEffect(
    () => () => {
      if (dissolveTimerRef.current != null) window.clearTimeout(dissolveTimerRef.current);
    },
    [],
  );

  // -- overlay lifecycle -----------------------------------------------------
  const closeSheet = (focusTarget?: HTMLElement | null) => {
    patchUi({sheet: null, sheetPhotoId: null, sheetDetent: 'medium'});
    (focusTarget ?? sheetOpenerRef.current)?.focus();
  };
  const closeCover = () => {
    patchUi({cover: null});
    coverOpenerRef.current?.focus();
  };

  // Escape closes the TOPMOST overlay only: cover (z50) > sheet (z41) >
  // selectMode.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.cover != null) closeCover();
      else if (ui.sheet != null) closeSheet();
      else if (ui.selectMode) exitSelectMode();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.cover, ui.sheet, ui.selectMode]);

  // -- selection -------------------------------------------------------------
  const exitSelectMode = () => patchUi({selectMode: false, selection: []});
  const toggleSelectMode = () => {
    if (ui.selectMode) exitSelectMode();
    else patchUi({selectMode: true});
  };
  // (2) One owner, two surfaces, one truth: the tile badge and the tray
  // chip toggle in the same render.
  const toggleSelection = (photoId: string) => {
    patchUi({
      selection: ui.selection.includes(photoId)
        ? ui.selection.filter(id => id !== photoId)
        : [...ui.selection, photoId],
    });
  };
  const removeFromTray = (photoId: string) => {
    patchUi({selection: ui.selection.filter(id => id !== photoId), ...toastPatch('Removed from selection')});
  };
  const onTileLongPress = (photo: Photo) => {
    // Long-press 450ms enters selectMode + selects; the navBar Select
    // button is the visible non-gesture path.
    patchUi({selectMode: true, selection: ui.selection.includes(photo.id) ? ui.selection : [...ui.selection, photo.id]});
  };
  const onTileTap = (photo: Photo, opener: HTMLElement) => {
    if (ui.selectMode) {
      toggleSelection(photo.id);
    } else {
      coverOpenerRef.current = opener;
      patchUi({cover: photo.id});
    }
  };

  // -- album picker ----------------------------------------------------------
  const openPicker = (opener: HTMLElement | null, singlePhotoId: string | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    patchUi({sheet: 'picker', sheetPhotoId: singlePhotoId, sheetDetent: 'medium'});
  };
  // (5) THE SIGNATURE COMMIT — 160ms dissolve on the moving tiles
  // (opacity+scale; plain opacity under reduced motion), then one setState
  // beat: photos filed (grid, cluster chips, month counts, '47 photos'
  // all re-derive), album count re-derives (Hikes 24→27), Albums badge
  // appears, selectMode exits, tray unmounts, tabBar returns, and the one
  // live region announces. Focus lands on the navBar Select button (the
  // tray button's successor).
  const chooseAlbum = (albumId: string) => {
    const ids = ui.sheetPhotoId != null ? [ui.sheetPhotoId] : ui.selection;
    if (ids.length === 0) return;
    const albumName = ALBUM_BY_ID[albumId].name;
    const commit = () => {
      setState(prev => ({
        ...prev,
        photos: prev.photos.map(photo =>
          ids.includes(photo.id) ? {...photo, status: 'filed' as const, albumId} : photo,
        ),
        ui: {
          ...prev.ui,
          sheet: null,
          sheetPhotoId: null,
          sheetDetent: 'medium',
          selectMode: false,
          selection: [],
          dissolvingIds: [],
          ...toastPatch(\`\${fmtPhotos(ids.length)} moved to \${albumName}\`),
        },
      }));
      selectBtnRef.current?.focus();
    };
    if (reducedMotion) {
      commit();
      return;
    }
    patchUi({sheet: null, sheetPhotoId: null, dissolvingIds: ids});
    dissolveTimerRef.current = window.setTimeout(commit, 160);
  };
  const newAlbumStub = () => {
    // Visible non-gesture affordance, honest stub.
    patchUi(toastPatch('Album creation is next on the roadmap'));
  };

  // -- duplicates ------------------------------------------------------------
  // (7) 'Keep best' removes non-best shots EVERYWHERE — grid, cluster
  // chips, badge, MB summary — through the same photo records.
  const keepBest = (setId: string) => {
    const discards = setLivePhotos(setId).filter(photo => !photo.isBest && photo.status === 'library');
    const freedTenths = discards.reduce((sum, photo) => sum + photo.sizeTenths, 0);
    const discardIds = discards.map(photo => photo.id);
    setState(prev => ({
      ...prev,
      photos: prev.photos.map(photo =>
        discardIds.includes(photo.id) ? {...photo, status: 'removed' as const} : photo,
      ),
      setStatus: {...prev.setStatus, [setId]: 'resolved'},
      ui: {
        ...prev.ui,
        expandedSetId: null,
        ...toastPatch(\`\${discardIds.length} duplicates removed · \${fmtMb(freedTenths)} freed\`),
      },
    }));
  };
  const keepAll = (setId: string) => {
    const count = setLivePhotos(setId).length;
    setState(prev => ({
      ...prev,
      setStatus: {...prev.setStatus, [setId]: 'keptAll'},
      ui: {...prev.ui, expandedSetId: null, ...toastPatch(\`Kept all \${count} — set marked reviewed\`)},
    }));
  };

  // -- navigation ------------------------------------------------------------
  const selectTab = (tab: Tab) => {
    patchUi({tab, screen: 'root', expandedSetId: null});
  };
  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TAB_META.map(tab => tab.id);
    const current = order.indexOf(ui.tab);
    const next =
      event.key === 'ArrowRight'
        ? order[(current + 1) % order.length]
        : order[(current + order.length - 1) % order.length];
    selectTab(next);
    document.getElementById(\`sbx-tab-\${next}\`)?.focus();
  };
  const pushedAlbum = ui.screen.startsWith('album:') ? ALBUM_BY_ID[ui.screen.slice(6)] : null;

  // -- chrome state ----------------------------------------------------------
  // Compact title + wired hairline: always on off-Library (no large row);
  // on Library they wait for the sentinel to scroll under the navBar.
  const compactChromeOn = !onLibraryRoot || largeTitleGone;
  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktopColumn ? styles.shellDesktop : null),
    ...(isOverlayOpen ? styles.shellLocked : null),
  };
  const navTitleText = pushedAlbum != null ? pushedAlbum.name : NAV_TITLES[ui.tab];
  const sheetCount = ui.sheetPhotoId != null ? 1 : ui.selection.length;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SBX_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — 52px, three-zone grid, wired hairline. */}
        <header
          className="sbx-hairline"
          style={{...styles.navBar, ...(compactChromeOn ? styles.navBarHairlineOn : null)}}>
          <div style={styles.navLeading}>
            {pushedAlbum != null ? (
              <button
                type="button"
                className="sbx-btn sbx-focusable"
                style={styles.backBtn}
                aria-label="Back to Albums"
                onClick={() => patchUi({screen: 'root'})}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>Albums</span>
              </button>
            ) : (
              <ShoeboxMark />
            )}
          </div>
          <div
            className="sbx-fade"
            style={{...styles.navTitle, ...(compactChromeOn ? null : styles.navTitleHidden)}}
            aria-hidden={!compactChromeOn}>
            {navTitleText}
          </div>
          <div style={styles.navTrailing}>
            {onLibraryRoot ? (
              <button
                type="button"
                ref={selectBtnRef}
                className="sbx-btn sbx-focusable"
                style={styles.textBtn}
                aria-pressed={ui.selectMode}
                onClick={toggleSelectMode}>
                {ui.selectMode ? 'Cancel' : 'Select'}
              </button>
            ) : null}
          </div>
        </header>

        <main style={styles.body}>
          {pushedAlbum != null ? (
            // PUSHED ALBUM SCREEN — seeded 4-col grid; photos filed this
            // session render as REAL tiles ahead of the seeded backfill.
            <>
              <h1 className="sbx-vh">{pushedAlbum.name}</h1>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionHeaderText}>All photos</h2>
                <span style={styles.sectionHeaderCount}>{fmtPhotos(albumLiveCounts[pushedAlbum.id])}</span>
              </div>
              <div style={styles.clusterGrid}>
                {photos
                  .filter(photo => photo.albumId === pushedAlbum.id)
                  .map(photo => (
                    <button
                      key={photo.id}
                      type="button"
                      className="sbx-btn sbx-focusable"
                      style={{...styles.tile, background: artFor(photo.hueIndex)}}
                      aria-label={\`\${photo.subject} — added this session\`}
                      onClick={event => {
                        coverOpenerRef.current = event.currentTarget;
                        patchUi({cover: photo.id});
                      }}
                    />
                  ))}
                {Array.from({length: pushedAlbum.baseCount}, (_, index) => (
                  <div
                    key={\`seed-\${index}\`}
                    style={{...styles.albumSeedTile, background: artFor(pushedAlbum.seed + index)}}
                    role="img"
                    aria-label={\`Photo \${index + 1} in \${pushedAlbum.name}\`}
                  />
                ))}
              </div>
              <div style={styles.bottomSpacer} />
            </>
          ) : ui.tab === 'library' ? (
            <>
              {/* LARGE TITLE row (52px) + the 1px IO sentinel. */}
              <div style={styles.largeTitle}>
                <h1 style={styles.largeTitleText}>Library</h1>
                <span style={styles.largeTitleCount}>{fmtPhotos(totalCount)}</span>
              </div>
              <div ref={sentinelRef} style={styles.sentinel} aria-hidden />
              {monthSections.map(section => (
                <section key={section.month}>
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionHeaderText}>{section.month}</h2>
                    <span style={styles.sectionHeaderCount}>{section.count}</span>
                  </div>
                  <div style={styles.monthBlock}>
                    {section.clusters.map(cluster => (
                      <ClusterGrid
                        key={cluster.id}
                        cluster={cluster}
                        photos={liveByCluster[cluster.id]}
                        selection={ui.selection}
                        dissolvingIds={ui.dissolvingIds}
                        selectMode={ui.selectMode}
                        onTap={onTileTap}
                        onLongPress={onTileLongPress}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </>
          ) : ui.tab === 'albums' ? (
            <>
              <h1 className="sbx-vh">Albums</h1>
              <div style={styles.tabCaption}>
                {ALBUMS.length} albums · {albumsTotal} photos
              </div>
              <div style={styles.listCard}>
                {ALBUMS.map((album, index) => (
                  <div key={album.id}>
                    {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                    <button
                      type="button"
                      className="sbx-btn sbx-focusable"
                      style={styles.albumRow}
                      aria-label={\`\${album.name}, \${fmtPhotos(albumLiveCounts[album.id])}\`}
                      onClick={() => patchUi({screen: \`album:\${album.id}\`})}>
                      <span style={{...styles.albumThumb, background: artFor(album.seed)}} aria-hidden />
                      <span style={styles.rowText}>
                        <span style={styles.rowPrimary}>{album.name}</span>
                        <span style={styles.rowSecondary}>{fmtPhotos(albumLiveCounts[album.id])}</span>
                      </span>
                      <span style={styles.rowChevron} aria-hidden>
                        <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                      </span>
                    </button>
                  </div>
                ))}
                <div style={styles.rowDividerDeep} />
                <button type="button" className="sbx-btn sbx-focusable" style={styles.utilityRow} onClick={newAlbumStub}>
                  <span style={styles.utilityIcon}>
                    <Icon icon={PlusIcon} size="sm" color="inherit" />
                  </span>
                  New album
                </button>
              </div>
              <div style={styles.bottomSpacer} />
            </>
          ) : (
            <>
              <h1 className="sbx-vh">Duplicates</h1>
              {/* Summary — all three numbers DERIVE from unreviewed sets. */}
              <div style={{...styles.listCard, marginTop: 20, marginBottom: 12}}>
                <div style={styles.summaryRow}>
                  <span style={{...styles.rowPrimary, fontVariantNumeric: 'tabular-nums'}}>
                    {openSets.length} sets · {removableShots} removable shots
                  </span>
                  <span style={styles.rowSecondary}>
                    Keeping only the best shots frees {fmtMb(removableTenthsTotal)}
                  </span>
                </div>
              </div>
              <div style={styles.cardStack}>
                {DUPE_SETS.map(meta => {
                  const live = setLivePhotos(meta.id).filter(photo => photo.status === 'library');
                  const removable = live.filter(photo => !photo.isBest).reduce((sum, photo) => sum + photo.sizeTenths, 0);
                  return (
                    <DupeStackCard
                      key={meta.id}
                      meta={meta}
                      status={setStatus[meta.id]}
                      livePhotos={live}
                      removableTenths={removable}
                      isExpanded={ui.expandedSetId === meta.id}
                      onToggle={() => patchUi({expandedSetId: ui.expandedSetId === meta.id ? null : meta.id})}
                      onKeepBest={() => keepBest(meta.id)}
                      onKeepAll={() => keepAll(meta.id)}
                    />
                  );
                })}
              </div>
              <div style={{height: 24}} />
            </>
          )}
        </main>

        {/* THE one polite live region — sticky-in-flow dock at bottom 72
            (batch-1 amendment); always mounted, empty when idle. */}
        <div style={styles.toastAnchor} aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} className="sbx-fade" style={styles.toastPill}>
              {ui.toast.text}
            </div>
          ) : null}
        </div>

        {/* selectionTray XOR tabBar — the tray replaces the tab bar while
            selectMode; both are sticky bottom, so they swap in place. */}
        {ui.selectMode ? (
          <div style={styles.tray}>
            {ui.selection.length === 0 ? (
              // STRESS FIXTURE (7): zero-selection tray.
              <span style={styles.trayHint}>Select photos</span>
            ) : (
              <div style={styles.trayRail} aria-label="Selected photos">
                {ui.selection.map(id => {
                  const photo = photoById(id);
                  if (photo == null) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      className="sbx-btn sbx-focusable"
                      style={styles.trayChip}
                      aria-label={\`Remove \${photo.subject} from selection\`}
                      onClick={() => removeFromTray(id)}>
                      <span style={{...styles.trayThumb, background: artFor(photo.hueIndex)}} aria-hidden />
                      <span style={styles.trayChipX} aria-hidden>
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
                        </svg>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {ui.selection.length > 0 ? <span style={styles.trayCount}>{ui.selection.length}</span> : null}
            <div style={styles.trayBtnHit}>
              <button
                type="button"
                className="sbx-btn sbx-focusable"
                style={{...styles.trayBtn, ...(ui.selection.length === 0 ? styles.trayBtnDisabled : null)}}
                disabled={ui.selection.length === 0}
                aria-disabled={ui.selection.length === 0}
                onClick={event => openPicker(event.currentTarget, null)}>
                Add to album
              </button>
            </div>
          </div>
        ) : (
          <nav style={styles.tabBar} role="tablist" aria-label="Shoebox sections" onKeyDown={onTabKeyDown}>
            {TAB_META.map(tab => {
              const isActive = ui.tab === tab.id && pushedAlbum == null;
              const badge =
                tab.id === 'albums' ? filedCount : tab.id === 'duplicates' ? openSets.length : 0;
              return (
                <button
                  key={tab.id}
                  id={\`sbx-tab-\${tab.id}\`}
                  type="button"
                  role="tab"
                  className="sbx-btn sbx-focusable"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                  onClick={() => selectTab(tab.id)}>
                  <span style={styles.tabIconWrap}>
                    <Icon icon={tab.icon} size="lg" color="inherit" />
                    {/* STRESS FIXTURE (9): badge at 0 renders nothing. */}
                    {badge > 0 ? (
                      <span style={styles.tabBadge} aria-label={\`\${badge} \${tab.id === 'albums' ? 'photos filed' : 'duplicate sets'}\`}>
                        {badge}
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
        )}

        {/* OVERLAYS — absolute in shell only. */}
        {ui.sheet != null ? <div style={styles.sheetScrim} onClick={() => closeSheet()} aria-hidden /> : null}
        {ui.sheet === 'picker' ? (
          <PickerSheet
            photoCount={sheetCount}
            detent={ui.sheetDetent}
            liveCounts={albumLiveCounts}
            sheetRef={sheetRef}
            closeBtnRef={sheetCloseRef}
            onDetentChange={detent => patchUi({sheetDetent: detent})}
            onClose={() => closeSheet()}
            onPick={chooseAlbum}
            onNewAlbum={newAlbumStub}
          />
        ) : null}
        {coverPhoto != null ? (
          <PhotoCover
            photo={coverPhoto}
            coverRef={coverRef}
            closeBtnRef={coverCloseRef}
            onClose={closeCover}
            onToggleFavorite={() => update(coverPhoto.id, {favorite: !coverPhoto.favorite})}
            onMove={() => {
              // One overlay layer honest: CLOSE the cover, THEN open the
              // picker in single-photo mode.
              patchUi({cover: null});
              openPicker(selectBtnRef.current, coverPhoto.id);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};