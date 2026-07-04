// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Fernly watering roster frozen at
 *   TODAY_ISO '2026-06-18' ('Wed, Jun 18'): 12 house plants across 4 rooms
 *   (Living Room 4, Bedroom 3, Kitchen 3, Office 2 — 4+3+3+2 = 12), each
 *   with {intervalDays, lastWatered} so every meter fill is pure arithmetic
 *   (fill = max(0, (interval − daysSince)/interval)); 4 plants due
 *   (1 per room, 1+1+1+1 = 4 = tab badge = 'Water all due (4)'), Snake
 *   Plant 'Vera' 2 days overdue as the wilt stress, Calathea 'Stripe' at
 *   exactly the 0.25 low-amber threshold. No Date.now(), no Math.random(),
 *   no network media — pot art is an id-derived SVG generator.
 * @output Fernly — Plant Care Roster: a 390px MOBILE thumb-first watering
 *   roster. 52px navBar (fern-frond-in-droplet mark · fade-in 'Fernly'
 *   title · RefreshCw skeleton toggle) over a 52px 'My Plants' large
 *   title, a 148px NEXT UP hero card (most-overdue plant + 8px
 *   ThirstMeter + 36px Water now), a DUE TODAY card of 80px
 *   ThirstMeterRows ending in a 48px 'Water all due (4)' primary, four
 *   collapsible RoomShelf cards, an 'All 12 plants' terminal caption, and
 *   a 64px 3-tab tabBar with a due badge. Signature move: ONE water(id)
 *   commit refills the row's meniscus, regroups the row from Due into its
 *   room shelf, decrements the tab badge, rewrites the hero card, updates
 *   the room header's 'n of m due', and arms the Undo toast — zero manual
 *   sync, everything re-derives. 'Water all due' plays a 90ms-per-row
 *   staggered WateringCanSweep fill-wave before a single batch commit.
 *   Row tap opens a plant-detail bottom sheet (55% / calc(100% − 56px)
 *   detents) with care facts and its own Water now.
 * @position Page template; emitted by `astryx template mobile-plant-care-roster`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet) are position:'absolute' INSIDE
 *   shell; position:fixed is banned. While the sheet is open, shell locks
 *   to {height:'100dvh', overflow:'hidden'} and restores on close. The
 *   toast dock is sticky-in-flow (bottom 76, above the 64px tabBar + 12)
 *   per the foundations amendment — shell-absolute would pin it to the
 *   document bottom on this tall scrolling view. Stage clips to
 *   --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 76 after the 48px pot avatar); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. THE quarantined brand literal is the
 *   Fernly green BRAND_ACCENT light-dark(#2F9E44, #4CC26B) (identity
 *   const per spec; the demo --color-brand is the demo logo blue).
 *   BRAND_DEEP darkens only the light side (#237A34) for meter fills,
 *   button fills, and brand TEXT because #2F9E44 computes to 2.87:1 on
 *   the #E3EDE4 track and 3.45:1 on white — under the ≥3:1 (graphics) /
 *   4.5:1 (text) bars; math at each declaration. AMBER is the low/overdue
 *   pair; METER_TRACK and POT_FILL carry their own commented pairs per
 *   the "no muted-token rest fills" amendment.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', blur surface, hairline
 *   ALWAYS ON — noted choice); largeTitle row 52px (28/700 'My Plants' +
 *   13/400 'Wed, Jun 18' caption, IO sentinel fades the compact title);
 *   total large header 104px. heroCard minHeight 148 (11/500 overline,
 *   22/700 plant line, 16/400 status, 8px meter, 36px secondary button).
 *   sectionHeader 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
 *   pad), 20px top / 8px bottom. Plant rows: 72px media row extended to
 *   80px by the 6px meniscus bar (left 76 = 16 pad + 48 avatar + 12 gap,
 *   right 16, bottom 8); rowDivider inset 76; RoomShelfHeader 52px;
 *   tabBar 64px sticky bottom z20 (24px icon over 11/500 label, 4px gap,
 *   16px-min brand badge pill top −4 right −8). Buttons: 48px primary,
 *   36px secondary, 44×44 icon. TYPE (Figtree via --font-family-body):
 *   28/700 · 22/700 · 17/600 · 16/400–600 · 13/400 · 11/500; nothing
 *   under 11px; tabular-nums on every count, day number, and badge.
 *   Touch: every target ≥44×44 with ≥8px clearance or merged full-row;
 *   swipe-to-water shadows the always-visible 44×44 Droplets button.
 *
 * Responsive contract:
 * - Fluid 320–430px: no width literals — cards width auto with 16px
 *   insets; the meniscus bar spans 76→16 and simply shortens; plant names
 *   ellipsize (minWidth 0) before the Water button moves; room-header
 *   meta 'n of m due' is nowrap while the room name ellipsizes; 'Water
 *   all due (4)' is full-width; sheet detents are %-based.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes the
 *   standard centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout — this is deliberately
 *   phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, RefObject} from 'react';

import {
  BedDoubleIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  CookingPotIcon,
  DropletsIcon,
  LaptopIcon,
  LeafIcon,
  RefreshCwIcon,
  Settings2Icon,
  SofaIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Fernly green) — identity const per spec.
// Used for GRAPHIC fills whose surface passes ≥3:1: leaf fills vs the white
// card ≈ 3.45:1; dark #4CC26B vs the dark card (~#1C1C1E) ≈ 7.5:1.
const BRAND_ACCENT = 'light-dark(#2F9E44, #4CC26B)';
// Deep brand for the light scheme ONLY (dark side unchanged): the spec's
// claimed "#2F9E44 vs #E3EDE4 ≈ 3.2:1" computes to 2.87:1 (< 3:1), and
// #2F9E44 text on white is 3.45:1 (< 4.5:1). #237A34 fixes both:
// vs #E3EDE4 track ≈ 4.5:1; as text on white card ≈ 5.4:1; dark #4CC26B on
// the dark card ≈ 7.5:1 and on the #24312A track ≈ 6.0:1. Used for meter
// fills, brand text (Undo, active tab, overlines), and button/badge fills.
const BRAND_DEEP = 'light-dark(#237A34, #4CC26B)';
// Text over a BRAND_DEEP fill. Light: #FFFFFF on #237A34 ≈ 5.4:1. Dark:
// white on #4CC26B fails (~2.3:1), so the dark side flips to near-black
// green — #0B2913 on #4CC26B ≈ 6.9:1. (Spec's "#FFFFFF on #2F9E44 ≈ 3.9:1"
// computes to 3.45:1; the spec itself sanctions this bump.)
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #0B2913)';
// Low/overdue amber — text AND meter fill. Text: #B45309 on white ≈ 5.0:1;
// #F59E0B on the dark card ≈ 7.9:1. As meter fill: #B45309 vs #E3EDE4
// track ≈ 4.2:1; #F59E0B vs #24312A ≈ 6.3:1 — all ≥3:1.
const AMBER = 'light-dark(#B45309, #F59E0B)';
// ThirstMeter track — explicit pair, NOT --color-background-muted, because
// the rest-state fill must sit on it at ≥3:1 against its ACTUAL surface
// (amendment): BRAND_DEEP #237A34 vs #E3EDE4 ≈ 4.5:1 light; #4CC26B vs
// #24312A ≈ 6.0:1 dark; AMBER passes per its own comment.
const METER_TRACK = 'light-dark(#E3EDE4, #24312A)';
// Pot-avatar clay wash — decorative fill INSIDE a --color-text-primary
// stroked outline (the stroke carries the ≥3:1 shape boundary at ~15:1);
// leaves are BRAND_ACCENT (≥3:1 vs card per its comment).
const POT_FILL = 'light-dark(#D9E8DC, #2A3A31)';
// Switch OFF track (Settings stub) — amendment: interactive rest
// boundaries need ≥3:1 vs their surface. #948F84 vs white card ≈ 3.2:1;
// #6E6E70 vs the dark card ≈ 3.3:1. (Foundations' rgba OFF pair ≈ 1.3:1
// on this card — deviation per the binding amendment.)
const SWITCH_OFF = 'light-dark(#948F84, #6E6E70)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Brand-tinted 12% wash (brand mark chip, active segment tint).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings (2px --color-brand
// offset 2 per the spec corner map), transitions (transform/opacity only),
// skeleton shimmer, visually-hidden, and the reduced-motion guard.
// ---------------------------------------------------------------------------

const FERNLY_CSS = `
.fnl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.fnl-btn:disabled { cursor: default; }
.fnl-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.fnl-anim { transition: transform 200ms ease, opacity 200ms ease; }
.fnl-fade { transition: opacity 200ms ease; }
.fnl-fill { transition: transform 240ms ease; }
@keyframes fnl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.fnl-sheet-in { animation: fnl-sheet-in 240ms ease; }
@keyframes fnl-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.fnl-skel { position: relative; overflow: hidden; }
.fnl-skel::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-background-card) 55%, transparent),
    transparent
  );
  animation: fnl-shimmer 1.6s ease infinite;
}
.fnl-vh {
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
  .fnl-anim, .fnl-fade, .fnl-fill { transition: none; }
  .fnl-sheet-in { animation: none; }
  .fnl-skel::after { display: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, largeTitle,
// tabBar, tabItem, sheetScrim, sheet, listCard, rowDivider, sectionHeader.
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
  // Scroll lock while the sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so the 44×44 slots
  // optically align content to the 16px gutter. Hairline + blur ALWAYS ON
  // (noted choice; the compact title alone rides the IO sentinel).
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
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  brandChip: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_DEEP,
  },
  // LARGE TITLE — 52px row in flow: 28/700 h1 at the 16px gutter +
  // trailing 13/400 fixed-date caption. Total large header = 104px.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 16,
  },
  largeTitleText: {fontSize: 28, fontWeight: 700, lineHeight: 1.1, margin: 0},
  largeTitleCaption: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // HERO CARD — minHeight 148 (20+11+4+28+4+20+8+8+8+36 ≈ 147 per spec).
  heroCard: {
    minHeight: 148,
    marginInline: 16,
    marginTop: 12,
    padding: '20px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  heroOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: BRAND_DEEP,
  },
  heroName: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: '28px',
    marginTop: 4,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  heroStatus: {
    fontSize: 16,
    fontWeight: 400,
    lineHeight: '20px',
    marginTop: 4,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  heroMeter: {marginTop: 8},
  heroWaterBtn: {
    marginTop: 8,
    height: 36,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_DEEP,
  },
  // SECTION HEADER — 13/600 uppercase 0.06em at 32px from the stage edge,
  // 20px top / 8px bottom; trailing derived count in tabular-nums.
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  sectionHeaderCount: {fontVariantNumeric: 'tabular-nums'},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 76},
  // THIRST METER ROW — 72px media row extended to 80px by the absolutely
  // placed meniscus bar (left 76, right 16, bottom 8).
  rowOuter: {position: 'relative'},
  // 72px brand swipe-reveal block behind the row (the card radius clips
  // it at card corners); it merely calls the same water(id).
  swipeBlock: {
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
    background: BRAND_DEEP,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  rowContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  rowBtn: {
    flex: 1,
    minWidth: 0,
    height: 80,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    paddingBottom: 8, // optical: keeps the two-line stack clear of the meter
  },
  rowAvatar: {width: 48, height: 48, flexShrink: 0, borderRadius: 12, overflow: 'hidden'},
  rowText: {
    minWidth: 0,
    flex: 1,
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
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Trailing 44×44 Water icon button — sibling of the row button with 8px
  // clearance (rowBtn ends, 8px gap via its own inline padding).
  waterBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    marginInlineEnd: 8,
    marginBottom: 8, // stays clear of the meniscus bar line
    color: BRAND_DEEP,
  },
  // Meniscus bar zone — absolute left 76 / right 16 / bottom 8; the 6px
  // capsule track plus the optional trailing amber meta share the line.
  meterZone: {
    position: 'absolute',
    left: 76,
    right: 16,
    bottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  meterTrack: {
    position: 'relative',
    flex: 1,
    height: 6,
    borderRadius: 999,
    background: METER_TRACK,
    overflow: 'hidden', // clips fill + meniscus to the capsule
  },
  // display:'block' — as a bare span in the hero card it would stay inline
  // and collapse its 8px height (rows blockify it as a flex item).
  meterTrackHero: {display: 'block', position: 'relative', height: 8, borderRadius: 999, background: METER_TRACK, overflow: 'hidden'},
  meterFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    transformOrigin: 'left center',
  },
  meterMeniscusWrap: {position: 'absolute', inset: 0, pointerEvents: 'none'},
  meterMeta: {
    fontSize: 13,
    fontWeight: 600,
    color: AMBER,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  // 'Water all due (4)' — 48px full-width brand primary, last element of
  // the Due card (in flow, bottom-third adjacent), 16px padding block.
  waterAllWrap: {padding: 16},
  waterAllBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_DEEP,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  // ROOM SHELF HEADER — 52px full-width collapsible button row.
  shelfHeader: {
    width: '100%',
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  shelfGlyph: {display: 'inline-flex', flexShrink: 0, color: 'var(--color-text-secondary)'},
  shelfName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
  },
  shelfMeta: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  shelfChevron: {display: 'inline-flex', flexShrink: 0, color: 'var(--color-text-secondary)'},
  // EMPTY STATE — compact variant inside the Due card slot.
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
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, marginTop: 16},
  emptyBody: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    marginTop: 4,
    fontVariantNumeric: 'tabular-nums',
  },
  // SKELETON — 80px geometry match with the meter rows; deterministic
  // widths 60/45/70 (primary) + 40/55/30 (secondary).
  skeletonRow: {
    height: 80,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skelThumb: {width: 48, height: 48, flexShrink: 0, borderRadius: 12, background: 'var(--color-background-muted)'},
  skelBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // Terminal caption — 13/400 centered 16px below the last card.
  terminalCaption: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TAB BAR — exactly 64px, 3 tabs flex 1, sticky bottom z20.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    height: 64,
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
  tabItemActive: {color: BRAND_DEEP},
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // Due badge — 16px-min brand pill; unmounts at zero (never a '0' pill).
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
    background: BRAND_DEEP,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom mid-scroll (amendment: shell-absolute would anchor to
  // the DOCUMENT bottom on this tall view). Always mounted for aria-live.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    insetInline: 16,
    bottom: 0,
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
    color: BRAND_DEEP,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell, top corners 16.
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
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // The ONE legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetHero: {
    height: 88,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  sheetAvatar: {width: 64, height: 64, flexShrink: 0, borderRadius: 12, overflow: 'hidden'},
  sheetHeroText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6},
  sheetSpecies: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetStatus: {fontSize: 16, fontWeight: 500, fontVariantNumeric: 'tabular-nums'},
  // 44px utility rows (Room · Interval · Last watered · Light).
  utilityRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  utilityLabel: {fontSize: 16, fontWeight: 400},
  utilityValue: {
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  utilityDivider: {height: 1, background: 'var(--color-border)'},
  sheetWaterBtn: {
    marginTop: 16,
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_DEEP,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // SCHEDULE / SETTINGS stubs.
  segTrack: {
    marginInline: 16,
    marginTop: 12,
    height: 36,
    display: 'flex',
    padding: 2,
    gap: 2,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
  },
  segBtn: {
    flex: 1,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  scheduleRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  scheduleName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  scheduleDateOverdue: {color: AMBER, fontWeight: 600, fontSize: 13},
  settingsRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
  },
  settingsLabel: {fontSize: 16, fontWeight: 400},
  settingsValue: {
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  settingsDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // 51×31 switch inside the full-row button (role=switch on the row).
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
};

// ---------------------------------------------------------------------------
// FIXTURES — one frozen calendar day; every daysSince/fill/count derives
// from the two ISO strings, never a clock. CROSS-CHECK LEDGER (verified by
// hand): room totals 4+3+3+2 = 12 = 'All 12 plants'; due per room
// 1+1+1+1 = 4 = tab badge = 'Water all due (4)' = DUE TODAY count. Due set:
// p-monstera (7/7, due today), p-snake (16/14, overdue 2 — hero),
// p-basil (2/2, boundary: exactly 0, due not negative), p-pothos (8/7,
// overdue 1). Boundary fills: p-calathea 1/4 = 0.25 sits EXACTLY on the
// inclusive low-amber threshold (rule: fill <= 0.25 → amber); p-mint 0.5
// and p-fern 2/3 exercise the meniscus mid-travel; p-rosemary 0.2 amber.
// Post-sweep hero: smallest daysLeft = 1 (calathea/mint/rosemary),
// tie-break by id → p-calathea.
// ---------------------------------------------------------------------------

// The suite's frozen "today": Wednesday 2026-06-18.
const TODAY_ISO = '2026-06-18';
const TODAY_CAPTION = 'Wed, Jun 18';

interface Room {
  id: string;
  name: string;
}

const ROOMS: Room[] = [
  {id: 'living', name: 'Living Room'},
  {id: 'bedroom', name: 'Bedroom'},
  {id: 'kitchen', name: 'Kitchen'},
  {id: 'office', name: 'Office'},
];

const ROOM_ICONS = {
  living: SofaIcon,
  bedroom: BedDoubleIcon,
  kitchen: CookingPotIcon,
  office: LaptopIcon,
} as const;

interface Plant {
  id: string;
  name: string;
  species: string;
  roomId: string;
  intervalDays: number;
  lastWatered: string; // ISO date — the ONLY mutable field
  light: string;
}

// 12 plants; p-philo's name + species line is the 320px truncation stress
// ("Philodendron hederaceum · Every 6 days · watered Jun 14").
const PLANTS: Plant[] = [
  // — Living Room (4; 1 due) —
  {id: 'p-monstera', name: 'Monstera ‘Rio’', species: 'Monstera deliciosa', roomId: 'living', intervalDays: 7, lastWatered: '2026-06-11', light: 'Bright indirect'},
  {id: 'p-fiddle', name: 'Fiddle-Leaf ‘Frank’', species: 'Ficus lyrata', roomId: 'living', intervalDays: 7, lastWatered: '2026-06-13', light: 'Bright indirect'},
  {id: 'p-calathea', name: 'Calathea ‘Stripe’', species: 'Goeppertia ornata', roomId: 'living', intervalDays: 4, lastWatered: '2026-06-15', light: 'Medium, no sun'},
  {id: 'p-zz', name: 'ZZ Plant ‘Zuzu’', species: 'Zamioculcas zamiifolia', roomId: 'living', intervalDays: 21, lastWatered: '2026-06-04', light: 'Low light OK'},
  // — Bedroom (3; 1 due) — p-snake is the max-overdue wilt stress.
  {id: 'p-snake', name: 'Snake Plant ‘Vera’', species: 'Dracaena trifasciata', roomId: 'bedroom', intervalDays: 14, lastWatered: '2026-06-02', light: 'Low light OK'},
  {id: 'p-fern', name: 'Boston Fern ‘Frida’', species: 'Nephrolepis exaltata', roomId: 'bedroom', intervalDays: 3, lastWatered: '2026-06-17', light: 'Humid shade'},
  {id: 'p-aloe', name: 'Aloe ‘Goo’', species: 'Aloe vera', roomId: 'bedroom', intervalDays: 14, lastWatered: '2026-06-08', light: 'Full sun'},
  // — Kitchen (3; 1 due) —
  {id: 'p-basil', name: 'Basil ‘Pesto’', species: 'Ocimum basilicum', roomId: 'kitchen', intervalDays: 2, lastWatered: '2026-06-16', light: 'Full sun'},
  {id: 'p-mint', name: 'Mint ‘Mojito’', species: 'Mentha spicata', roomId: 'kitchen', intervalDays: 2, lastWatered: '2026-06-17', light: 'Morning sun'},
  {id: 'p-rosemary', name: 'Rosemary ‘Romy’', species: 'Salvia rosmarinus', roomId: 'kitchen', intervalDays: 5, lastWatered: '2026-06-14', light: 'Full sun'},
  // — Office (2; 1 due) —
  {id: 'p-pothos', name: 'Pothos ‘Ivy’', species: 'Epipremnum aureum', roomId: 'office', intervalDays: 7, lastWatered: '2026-06-10', light: 'Low light OK'},
  {id: 'p-philo', name: 'Philodendron ‘Phil’', species: 'Philodendron hederaceum', roomId: 'office', intervalDays: 6, lastWatered: '2026-06-14', light: 'Bright indirect'},
];

// ---------------------------------------------------------------------------
// PURE DATE + DERIVATION HELPERS — deterministic, no clock. diffDays works
// on the two ISO strings via Date.UTC on parsed parts (timezone-proof).
// ---------------------------------------------------------------------------

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isoToUtcDays(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** Whole days from isoA to isoB (positive when isoB is later). */
function diffDays(isoA: string, isoB: string): number {
  return Math.round(isoToUtcDays(isoB) - isoToUtcDays(isoA));
}

/** ISO date + n days → ISO date. */
function addDaysIso(iso: string, n: number): string {
  const date = new Date((isoToUtcDays(iso) + n) * 86_400_000);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** '2026-06-11' → 'Jun 11'. */
function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}`;
}

function daysSince(plant: Plant): number {
  return diffDays(plant.lastWatered, TODAY_ISO);
}

/** fill = max(0, (interval − daysSince) / interval); 0 means due. */
function fillOf(plant: Plant): number {
  return Math.max(0, (plant.intervalDays - daysSince(plant)) / plant.intervalDays);
}

function isDue(plant: Plant): boolean {
  return daysSince(plant) >= plant.intervalDays;
}

function overdueDays(plant: Plant): number {
  return Math.max(0, daysSince(plant) - plant.intervalDays);
}

function daysLeft(plant: Plant): number {
  return Math.max(0, plant.intervalDays - daysSince(plant));
}

/** '2 days overdue' · 'Due today' · 'Water in 2 days'. */
function statusText(plant: Plant): string {
  if (isDue(plant)) {
    const over = overdueDays(plant);
    return over > 0 ? `${over} day${over === 1 ? '' : 's'} overdue` : 'Due today';
  }
  const left = daysLeft(plant);
  return `Water in ${left} day${left === 1 ? '' : 's'}`;
}

/** Meter aria: 'Water level 29 percent, due in 2 days' / 'Overdue 2 days'. */
function meterAria(plant: Plant): string {
  if (isDue(plant)) {
    const over = overdueDays(plant);
    return over > 0 ? `Water level 0 percent, overdue ${over} day${over === 1 ? '' : 's'}` : 'Water level 0 percent, due today';
  }
  const left = daysLeft(plant);
  return `Water level ${Math.round(fillOf(plant) * 100)} percent, due in ${left} day${left === 1 ? '' : 's'}`;
}

/** Short amber meta riding the meniscus line: 'Overdue 2d' / 'Due today'. */
function meterMeta(plant: Plant): string {
  const over = overdueDays(plant);
  return over > 0 ? `Overdue ${over}d` : 'Due today';
}

/**
 * Hero selection (pure): due plants → most overdue, tie-break earliest
 * lastWatered then id (→ Snake Plant 'Vera' at start); none due →
 * smallest daysLeft among healthy, tie-break by id (→ p-calathea after
 * the sweep: calathea/mint/rosemary all at 1 day, 'p-calathea' wins).
 */
function heroOf(plants: Plant[]): Plant {
  const due = plants.filter(isDue);
  if (due.length > 0) {
    return [...due].sort(
      (a, b) =>
        overdueDays(b) - overdueDays(a) ||
        a.lastWatered.localeCompare(b.lastWatered) ||
        a.id.localeCompare(b.id),
    )[0];
  }
  return [...plants].sort((a, b) => daysLeft(a) - daysLeft(b) || a.id.localeCompare(b.id))[0];
}

// Deterministic skeleton width patterns (60/45/70 + 40/55/30) — never
// Math.random(). Refresh with 0 due renders a fixed 3 rows (stress 7).
const SKEL_PRIMARY = ['60%', '45%', '70%'];
const SKEL_SECONDARY = ['40%', '55%', '30%'];

// ---------------------------------------------------------------------------
// POT AVATAR GENERATOR — deterministic id-derived pot-and-leaf SVG:
// hash = sum of id charCodes; potShape = hash % 3 (tapered/round/cylinder),
// leafCount = 2 + (hash % 3), leafCurve = (hash % 5) × 4px control offset.
// Stroke --color-text-primary (never var(--color-text)); pot fill POT_FILL,
// leaf fill BRAND_ACCENT — contrast pairs at the COLOR LITERALS block. The
// same generator renders 48px row avatars and the 64px sheet avatar.
// ---------------------------------------------------------------------------

function potHash(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return sum;
}

const POT_PATHS = [
  // tapered
  'M15 31 H33 L30.5 42.5 Q30.2 44 28.7 44 H19.3 Q17.8 44 17.5 42.5 Z',
  // round
  'M15.5 31 H32.5 Q33.5 39.5 28 43.5 Q26 44.5 24 44.5 Q22 44.5 20 43.5 Q14.5 39.5 15.5 31 Z',
  // cylinder
  'M16.5 31 H31.5 V42.5 Q31.5 44 30 44 H18 Q16.5 44 16.5 42.5 Z',
];

interface PotAvatarProps {
  plantId: string;
  size: number;
}

function PotAvatar({plantId, size}: PotAvatarProps) {
  const hash = potHash(plantId);
  const potShape = hash % 3;
  const leafCount = 2 + (hash % 3);
  const leafCurve = (hash % 5) * 4;
  const leaves = [];
  for (let i = 0; i < leafCount; i++) {
    // Fan the leaves from the rim center (24, 28); spread ±38°.
    const t = leafCount === 1 ? 0.5 : i / (leafCount - 1);
    const angle = ((-38 + t * 76) * Math.PI) / 180;
    const len = 15 + ((hash + i * 7) % 4);
    const tipX = 24 + Math.sin(angle) * len;
    const tipY = 27 - Math.cos(angle) * len;
    const ctrlX = 24 + Math.sin(angle) * (len * 0.5) + (i % 2 === 0 ? leafCurve * 0.25 : -leafCurve * 0.25);
    const ctrlY = 27 - Math.cos(angle) * (len * 0.5) - 2;
    leaves.push(
      <path
        key={i}
        d={`M24 28 Q ${(ctrlX - 2.5).toFixed(1)} ${ctrlY.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${(ctrlX + 2.5).toFixed(1)} ${(ctrlY + 2).toFixed(1)} 24 28 Z`}
        fill={BRAND_ACCENT}
      />,
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden style={{display: 'block'}}>
      {leaves}
      <path d={POT_PATHS[potShape]} fill={POT_FILL} stroke="var(--color-text-primary)" strokeWidth={1.5} strokeLinejoin="round" />
      <rect x={14} y={28} width={20} height={3.5} rx={1.75} fill={POT_FILL} stroke="var(--color-text-primary)" strokeWidth={1.5} />
    </svg>
  );
}

// 24px Fernly mark — fern frond inside a droplet outline.
function FernlyMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M9 1.5 C11.7 4.8 14.5 7.9 14.5 11 A5.5 5.5 0 0 1 3.5 11 C3.5 7.9 6.3 4.8 9 1.5 Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M9 5.5 v8" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" />
      <path
        d="M9 7.5 L6.8 6.6 M9 9.3 L6.5 8.6 M9 11.1 L6.8 10.8 M9 7.5 L11.2 6.6 M9 9.3 L11.5 8.6 M9 11.1 L11.2 10.8"
        stroke="currentColor"
        strokeWidth={1.1}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// THIRST METER — 6px capsule (8px in the hero) with a 10px concave-droplet
// meniscus SVG riding the fill's right edge, translated by fill% (transform
// only; the capsule's overflow clips it, per the corner map). Fill bands:
// healthy (fill > 0.25) BRAND_DEEP; low (0 < fill <= 0.25, INCLUSIVE edge —
// Calathea at exactly 0.25 is amber) AMBER; overdue/due (fill = 0) a 25%
// AMBER ghost fill at 45% opacity + the amber text meta (state is encoded
// by color AND text, never color alone).
// ---------------------------------------------------------------------------

interface ThirstMeterProps {
  plant: Plant;
  hero?: boolean;
  /** Sweep override: render the fill at 100% with a staggered delay. */
  sweepIndex?: number;
}

function ThirstMeter({plant, hero = false, sweepIndex}: ThirstMeterProps) {
  const rawFill = fillOf(plant);
  const sweeping = sweepIndex != null;
  const fill = sweeping ? 1 : rawFill;
  const ghost = !sweeping && fill === 0;
  const fillColor = sweeping || fill > 0.25 ? BRAND_DEEP : AMBER;
  const delay = sweeping ? `${sweepIndex * 90}ms` : undefined;
  return (
    <span style={hero ? styles.meterTrackHero : styles.meterTrack} role="img" aria-label={meterAria(plant)}>
      {ghost ? (
        // Overdue ghost: 25%-wide amber wash; the meta text carries state.
        <span style={{...styles.meterFill, background: AMBER, opacity: 0.45, transform: 'scaleX(0.25)'}} />
      ) : (
        <span
          className="fnl-fill"
          style={{
            ...styles.meterFill,
            background: fillColor,
            transform: `scaleX(${fill})`,
            transitionDelay: delay,
          }}
        />
      )}
      {!ghost && fill > 0 && fill < 1 ? (
        <span
          className="fnl-fill"
          style={{...styles.meterMeniscusWrap, transform: `translateX(${(fill * 100).toFixed(2)}%)`, transitionDelay: delay}}>
          <svg
            width={10}
            height={hero ? 12 : 10}
            viewBox="0 0 10 10"
            preserveAspectRatio="none"
            style={{position: 'absolute', left: -5, top: hero ? -2 : -2}}
            aria-hidden>
            {/* Concave droplet cap riding the fill edge. */}
            <path d="M0 0 H5 C3 3 3.4 6.5 5 10 H0 Z" fill={fillColor} />
            <path d="M5 0 C7 3.2 6.6 6.8 5 10" stroke={fillColor} strokeWidth={1.4} fill="none" />
          </svg>
        </span>
      ) : null}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — RosterStore: a single useState with one update(patch);
// dueIds, dueByRoom, heroPlant, fills, badge, room metas, and both button
// labels are DERIVED in render, never stored. Transient pointer-drag deltas
// live in the row component; everything else routes through here.
// ---------------------------------------------------------------------------

type TabId = 'plants' | 'schedule' | 'settings';

interface ToastState {
  seq: number;
  msg: string;
  /** Prior lastWatered values — Undo restores them in ONE assignment. */
  snapshot: Array<{id: string; lastWatered: string}> | null;
}

interface RosterStore {
  plants: Plant[];
  activeTab: TabId;
  collapsedRooms: string[];
  sheetPlantId: string | null;
  sheetDetent: 'medium' | 'large';
  toast: ToastState | null;
  refreshing: boolean;
  openSwipeId: string | null;
  /** WateringCanSweep in flight: due ids animating to 100%. */
  sweepIds: string[] | null;
  /** Single row animating out of the Due group before its commit. */
  leavingId: string | null;
  tabState: {
    schedule: {range: 'soon' | 'all'};
    settings: {reminders: boolean};
  };
}

const INITIAL_STORE: RosterStore = {
  plants: PLANTS,
  activeTab: 'plants',
  collapsedRooms: [],
  sheetPlantId: null,
  sheetDetent: 'medium',
  toast: null,
  refreshing: false,
  openSwipeId: null,
  sweepIds: null,
  leavingId: null,
  tabState: {schedule: {range: 'soon'}, settings: {reminders: true}},
};

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

// Focus trap — Tab wraps within the open sheet.
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
// THIRST METER ROW — one <button> row (accessible name = plant name, opens
// the detail sheet) + a SIBLING 44×44 Droplets Water button with 8px
// clearance (the mandated visible path the swipe merely shadows). The 6px
// meniscus bar is absolutely placed left 76 / right 16 / bottom 8, making
// the effective row height 80px. Swipe-to-water: pointer drag translates
// the row, snapping open at −72px over one brand 'Water' block; one row
// open at a time (store-held openSwipeId); it calls the SAME water(id).
// ---------------------------------------------------------------------------

interface ThirstMeterRowProps {
  plant: Plant;
  swipeOpen: boolean;
  leaving: boolean;
  sweepIndex?: number;
  reducedMotion: boolean;
  onOpenSheet: (plantId: string, opener: HTMLElement) => void;
  onWater: (plantId: string) => void;
  onSwipeChange: (plantId: string | null) => void;
}

function ThirstMeterRow({
  plant,
  swipeOpen,
  leaving,
  sweepIndex,
  reducedMotion,
  onOpenSheet,
  onWater,
  onSwipeChange,
}: ThirstMeterRowProps) {
  const [dragX, setDragX] = useState(0);
  const dragRef = useRef<{startX: number; startY: number; active: boolean; moved: boolean}>({
    startX: 0,
    startY: 0,
    active: false,
    moved: false,
  });

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = {startX: event.clientX, startY: event.clientY, active: true, moved: false};
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.abs(dx) < 8) return;
    if (Math.abs(dx) < Math.abs(dy)) return;
    drag.moved = true;
    const base = swipeOpen ? -72 : 0;
    setDragX(Math.max(-88, Math.min(0, base + dx)) - base);
  };
  const endDrag = () => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    if (drag.moved) {
      const offset = (swipeOpen ? -72 : 0) + dragX;
      onSwipeChange(offset < -36 ? plant.id : null);
    }
    setDragX(0);
  };

  const translate = (swipeOpen ? -72 : 0) + dragX;
  const showAction = translate < 0;
  const overdueOrDue = isDue(plant) && sweepIndex == null;
  const contentStyle: CSSProperties = {
    ...styles.rowContent,
    transform: translate !== 0 ? `translateX(${translate}px)` : undefined,
    ...(leaving && !reducedMotion ? {opacity: 0, transform: 'translateY(-6px) scale(0.98)'} : null),
  };

  return (
    <div style={styles.rowOuter} data-swipe-row={plant.id}>
      {showAction ? (
        <button
          type="button"
          tabIndex={-1}
          className="fnl-btn"
          style={styles.swipeBlock}
          aria-hidden
          onClick={() => onWater(plant.id)}>
          <Icon icon={DropletsIcon} size="sm" color="inherit" />
          Water
        </button>
      ) : null}
      <div
        className="fnl-anim"
        style={contentStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}>
        <button
          type="button"
          className="fnl-btn fnl-focusable"
          style={styles.rowBtn}
          aria-label={plant.name}
          onClick={event => {
            if (dragRef.current.moved) return;
            if (swipeOpen) {
              onSwipeChange(null);
              return;
            }
            onOpenSheet(plant.id, event.currentTarget);
          }}>
          <span style={styles.rowAvatar}>
            <PotAvatar plantId={plant.id} size={48} />
          </span>
          <span style={styles.rowText}>
            <span style={styles.rowPrimary}>{plant.name}</span>
            <span style={styles.rowSecondary}>
              {plant.species} · Every {plant.intervalDays} days · watered {fmtDate(plant.lastWatered)}
            </span>
          </span>
        </button>
        <button
          type="button"
          className="fnl-btn fnl-focusable"
          style={styles.waterBtn}
          aria-label={`Water ${plant.name}`}
          onClick={() => onWater(plant.id)}>
          <Icon icon={DropletsIcon} size="md" color="inherit" />
        </button>
        <span style={styles.meterZone}>
          <ThirstMeter plant={plant} sweepIndex={sweepIndex} />
          {overdueOrDue ? <span style={styles.meterMeta}>{meterMeta(plant)}</span> : null}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: typeof LeafIcon}> = [
  {id: 'plants', label: 'Plants', icon: LeafIcon},
  {id: 'schedule', label: 'Schedule', icon: CalendarDaysIcon},
  {id: 'settings', label: 'Settings', icon: Settings2Icon},
];

export default function MobilePlantCareRosterTemplate() {
  const [store, setStore] = useState<RosterStore>(INITIAL_STORE);
  const update = useCallback((patch: Partial<RosterStore>) => {
    setStore(s => ({...s, ...patch}));
  }, []);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingRef = useRef<{timer: number; run: () => void} | null>(null);
  const toastSeqRef = useRef(0);

  const containerWidth = useElementWidth(wrapRef);
  const viewportWide = useMediaQuery('(min-width: 720px)');
  const isDesktop = containerWidth > 0 ? containerWidth >= 720 : viewportWide;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Compact-title fade: an IO sentinel under the navBar drives the 'Fernly'
  // center title (user-driven scroll → deterministic). No IO → always on.
  const [compactTitle, setCompactTitle] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setCompactTitle(true);
      return undefined;
    }
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(
      entries => setCompactTitle(!(entries[0]?.isIntersecting ?? true)),
      {rootMargin: '-53px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // --- Deferred commits (row-exit / sweep animation windows only; toasts
  // never auto-dismiss). Any new mutation flushes the pending one first.
  const flushPending = useCallback(() => {
    const pending = pendingRef.current;
    if (pending != null) {
      window.clearTimeout(pending.timer);
      pendingRef.current = null;
      pending.run();
    }
  }, []);
  const schedule = useCallback(
    (run: () => void, delay: number) => {
      flushPending();
      const timer = window.setTimeout(() => {
        pendingRef.current = null;
        run();
      }, delay);
      pendingRef.current = {timer, run};
    },
    [flushPending],
  );
  useEffect(
    () => () => {
      if (pendingRef.current != null) window.clearTimeout(pendingRef.current.timer);
    },
    [],
  );

  const nextToast = useCallback((msg: string, snapshot: ToastState['snapshot']): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, snapshot};
  }, []);

  // ONE water commit — grouping, badge, hero, room metas, and both button
  // labels re-derive from this single assignment.
  const commitWater = useCallback(
    (ids: string[], msg: string) => {
      setStore(s => {
        const idSet = new Set(ids);
        const snapshot = s.plants
          .filter(plant => idSet.has(plant.id))
          .map(plant => ({id: plant.id, lastWatered: plant.lastWatered}));
        return {
          ...s,
          plants: s.plants.map(plant => (idSet.has(plant.id) ? {...plant, lastWatered: TODAY_ISO} : plant)),
          toast: nextToast(msg, snapshot),
          sweepIds: null,
          leavingId: null,
          openSwipeId: null,
        };
      });
    },
    [nextToast],
  );

  const closeSheet = useCallback(() => {
    update({sheetPlantId: null});
    sheetOpenerRef.current?.focus({preventScroll: true});
  }, [update]);

  const waterOne = useCallback(
    (id: string, fromSheet = false) => {
      flushPending();
      const plant = store.plants.find(p => p.id === id);
      if (plant == null) return;
      if (fromSheet) closeSheet();
      const msg = `${plant.name} watered`;
      if (isDue(plant) && !reducedMotion) {
        // 200ms transform/opacity exit out of the Due group, then commit.
        update({leavingId: id, openSwipeId: null});
        schedule(() => commitWater([id], msg), 200);
      } else {
        commitWater([id], msg);
      }
    },
    [flushPending, store.plants, closeSheet, reducedMotion, update, schedule, commitWater],
  );

  // WateringCanSweep — 90ms-per-row staggered fill-to-100% (transform
  // only), then ONE state commit; instant single commit under reduced
  // motion. Label count is derived, never hardcoded.
  const waterAllDue = useCallback(() => {
    flushPending();
    const ids = store.plants.filter(isDue).map(plant => plant.id);
    if (ids.length === 0) return;
    const msg = `${ids.length} plant${ids.length === 1 ? '' : 's'} watered`;
    if (reducedMotion) {
      commitWater(ids, msg);
    } else {
      update({sweepIds: ids, openSwipeId: null});
      schedule(() => commitWater(ids, msg), ids.length * 90 + 240);
    }
  }, [flushPending, store.plants, reducedMotion, commitWater, update, schedule]);

  // UNDO pours it back — one assignment restores every prior lastWatered;
  // rows re-derive into Due at their original positions. No timers ever.
  const undoWater = useCallback(() => {
    flushPending();
    setStore(s => {
      const snapshot = s.toast?.snapshot;
      if (snapshot == null) return s;
      const priorById = new Map(snapshot.map(entry => [entry.id, entry.lastWatered]));
      return {
        ...s,
        plants: s.plants.map(plant =>
          priorById.has(plant.id) ? {...plant, lastWatered: priorById.get(plant.id) as string} : plant,
        ),
        toast: nextToast('Restored', null),
      };
    });
  }, [flushPending, nextToast]);

  const openSheet = useCallback(
    (plantId: string, opener: HTMLElement) => {
      sheetOpenerRef.current = opener;
      update({sheetPlantId: plantId, sheetDetent: 'medium', openSwipeId: null});
    },
    [update],
  );

  // Focus enters the sheet via focus({preventScroll: true}) — a plain
  // .focus() would scroll-reveal the animating sheet inside the locked
  // overflow-hidden column and beach it mid-screen (amendment).
  useEffect(() => {
    if (store.sheetPlantId != null) {
      sheetCloseRef.current?.focus({preventScroll: true});
    }
  }, [store.sheetPlantId]);

  // Escape closes the topmost overlay only (the sheet; else an open swipe).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (store.sheetPlantId != null) {
        event.stopPropagation();
        closeSheet();
      } else if (store.openSwipeId != null) {
        update({openSwipeId: null});
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store.sheetPlantId, store.openSwipeId, closeSheet, update]);

  const onRefreshPress = useCallback(() => {
    flushPending();
    setStore(s =>
      s.refreshing
        ? {...s, refreshing: false, toast: nextToast('Updated just now', null)}
        : {...s, refreshing: true, toast: nextToast('Loading', null)},
    );
  }, [flushPending, nextToast]);

  const selectTab = useCallback(
    (id: TabId) => {
      flushPending();
      if (id === store.activeTab) {
        // The one legal reset: re-tapping the active tab scrolls to top.
        wrapRef.current?.scrollIntoView({block: 'start'});
        return;
      }
      // Overlays close on tab switch; roster scroll/collapse state is
      // store-held and survives (per-tab persistence law).
      update({activeTab: id, sheetPlantId: null, openSwipeId: null});
    },
    [flushPending, store.activeTab, update],
  );

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TABS.findIndex(tab => tab.id === store.activeTab);
    const next = (index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    tabRefs.current[next]?.focus();
    selectTab(TABS[next].id);
  };

  // --- Derived selectors (computed every render, never stored) ---
  const duePlants = store.plants.filter(isDue);
  const dueIds = duePlants.map(plant => plant.id);
  const heroPlant = heroOf(store.plants);
  const sheetPlant = store.plants.find(plant => plant.id === store.sheetPlantId) ?? null;
  const skeletonCount = dueIds.length > 0 ? dueIds.length : 3;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktop ? styles.shellDesktop : null),
    ...(sheetPlant != null ? styles.shellLocked : null),
  };

  const onShellPointerDownCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (store.openSwipeId == null) return;
    const target = event.target as HTMLElement;
    if (target.closest(`[data-swipe-row="${store.openSwipeId}"]`) == null) {
      update({openSwipeId: null});
    }
  };

  const renderRow = (plant: Plant, index: number, sweepIndex?: number) => (
    <div key={plant.id}>
      {index > 0 ? <div style={styles.rowDivider} /> : null}
      <ThirstMeterRow
        plant={plant}
        swipeOpen={store.openSwipeId === plant.id}
        leaving={store.leavingId === plant.id}
        sweepIndex={sweepIndex}
        reducedMotion={reducedMotion}
        onOpenSheet={openSheet}
        onWater={waterOne}
        onSwipeChange={id => update({openSwipeId: id})}
      />
    </div>
  );

  // --- Plants tab ---
  const plantsTab = (
    <main style={styles.main}>
      <div style={styles.largeTitle}>
        <h1 style={styles.largeTitleText}>My Plants</h1>
        <span style={styles.largeTitleCaption}>{TODAY_CAPTION}</span>
      </div>

      {/* HERO — most-overdue due plant; after the sweep it re-derives to
          the soonest healthy plant ('Calathea ‘Stripe’ — Water in 1 day). */}
      <section style={styles.heroCard} aria-label="Next up">
        <span style={styles.heroOverline}>Next up</span>
        <span style={styles.heroName}>{heroPlant.name}</span>
        <span style={styles.heroStatus}>{statusText(heroPlant)}</span>
        <span style={styles.heroMeter}>
          <ThirstMeter plant={heroPlant} hero />
        </span>
        <button
          type="button"
          className="fnl-btn fnl-focusable"
          style={styles.heroWaterBtn}
          aria-label={`Water ${heroPlant.name} now`}
          onClick={() => waterOne(heroPlant.id)}>
          Water now
        </button>
      </section>

      {/* DUE TODAY — 4 ThirstMeterRows + the in-flow 48px primary. */}
      <h2 style={styles.sectionHeader}>
        <span>Due today</span>
        {dueIds.length > 0 ? <span style={styles.sectionHeaderCount}>{dueIds.length}</span> : null}
      </h2>
      <div style={styles.listCard} aria-busy={store.refreshing || undefined}>
        {store.refreshing ? (
          <>
            {Array.from({length: skeletonCount}, (_, index) => (
              <div key={index}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <div className="fnl-skel" style={styles.skeletonRow} aria-hidden>
                  <span style={styles.skelThumb} />
                  <span style={styles.skelBars}>
                    <span style={{...styles.skelBar, width: SKEL_PRIMARY[index % 3]}} />
                    <span style={{...styles.skelBar, width: SKEL_SECONDARY[index % 3]}} />
                  </span>
                </div>
              </div>
            ))}
          </>
        ) : dueIds.length === 0 ? (
          // Filtered-empty? No — watering IS done: zero action buttons.
          <div style={styles.emptyState}>
            <span style={styles.emptyCircle}>
              <Icon icon={DropletsIcon} size="lg" color="inherit" />
            </span>
            <span style={styles.emptyTitle}>All watered</span>
            <span style={styles.emptyBody}>
              Next up: {heroPlant.name} in {daysLeft(heroPlant)} day{daysLeft(heroPlant) === 1 ? '' : 's'}.
            </span>
          </div>
        ) : (
          <>
            {duePlants.map((plant, index) => {
              const sweepIndex = store.sweepIds?.indexOf(plant.id) ?? -1;
              return renderRow(plant, index, sweepIndex >= 0 ? sweepIndex : undefined);
            })}
            <div style={styles.waterAllWrap}>
              <button
                type="button"
                className="fnl-btn fnl-focusable"
                style={styles.waterAllBtn}
                disabled={store.sweepIds != null}
                onClick={waterAllDue}>
                Water all due ({dueIds.length})
              </button>
            </div>
          </>
        )}
      </div>

      {/* ROOM SHELVES — collapsible; header meta 'n of m due' re-derives. */}
      {ROOMS.map(room => {
        const inRoom = store.plants.filter(plant => plant.roomId === room.id);
        const dueInRoom = inRoom.filter(isDue).length;
        const shelfPlants = inRoom.filter(plant => !isDue(plant));
        const collapsed = store.collapsedRooms.includes(room.id);
        const bodyId = `fnl-shelf-${room.id}`;
        return (
          <div key={room.id}>
            <div style={{...styles.listCard, marginTop: room.id === 'living' ? 24 : 12}}>
              <h2 style={{margin: 0}}>
                <button
                  type="button"
                  className="fnl-btn fnl-focusable"
                  style={styles.shelfHeader}
                  aria-expanded={!collapsed}
                  aria-controls={bodyId}
                  onClick={() =>
                    update({
                      collapsedRooms: collapsed
                        ? store.collapsedRooms.filter(id => id !== room.id)
                        : [...store.collapsedRooms, room.id],
                    })
                  }>
                  <span style={styles.shelfGlyph}>
                    <Icon icon={ROOM_ICONS[room.id as keyof typeof ROOM_ICONS]} size="lg" color="inherit" />
                  </span>
                  <span style={styles.shelfName}>{room.name}</span>
                  <span style={styles.shelfMeta}>
                    {dueInRoom} of {inRoom.length} due
                  </span>
                  <span
                    className="fnl-anim"
                    style={{...styles.shelfChevron, transform: collapsed ? 'rotate(-180deg)' : undefined}}>
                    <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                  </span>
                </button>
              </h2>
              {!collapsed ? (
                <div id={bodyId}>
                  {shelfPlants.map((plant, index) => (
                    <div key={plant.id}>
                      <div style={index === 0 ? {height: 1, background: 'var(--color-border)', marginInlineStart: 16} : styles.rowDivider} />
                      <ThirstMeterRow
                        plant={plant}
                        swipeOpen={store.openSwipeId === plant.id}
                        leaving={false}
                        reducedMotion={reducedMotion}
                        onOpenSheet={openSheet}
                        onWater={waterOne}
                        onSwipeChange={id => update({openSwipeId: id})}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      {/* Terminal caption — derived: 4+3+3+2 = 12. */}
      <p style={styles.terminalCaption}>All {store.plants.length} plants</p>
    </main>
  );

  // --- Schedule tab (lightweight fixture stub; range persists per tab) ---
  const scheduleRange = store.tabState.schedule.range;
  const scheduleRows = [...store.plants]
    .sort((a, b) => daysLeft(a) - daysLeft(b) || a.id.localeCompare(b.id))
    .filter(plant => (scheduleRange === 'soon' ? isDue(plant) || daysLeft(plant) <= 2 : true));
  const scheduleTab = (
    <main style={styles.main}>
      <div style={styles.largeTitle}>
        <h1 style={styles.largeTitleText}>Schedule</h1>
        <span style={styles.largeTitleCaption}>{TODAY_CAPTION}</span>
      </div>
      <div style={styles.segTrack} role="radiogroup" aria-label="Schedule range">
        {(['soon', 'all'] as const).map(range => (
          <button
            key={range}
            type="button"
            role="radio"
            aria-checked={scheduleRange === range}
            className="fnl-btn fnl-focusable"
            style={scheduleRange === range ? {...styles.segBtn, ...styles.segBtnActive} : styles.segBtn}
            onClick={() =>
              update({tabState: {...store.tabState, schedule: {range}}})
            }>
            {range === 'soon' ? 'Due soon' : 'All plants'}
          </button>
        ))}
      </div>
      <h2 style={styles.sectionHeader}>
        <span>Upcoming</span>
        <span style={styles.sectionHeaderCount}>{scheduleRows.length}</span>
      </h2>
      <div style={styles.listCard}>
        {scheduleRows.map((plant, index) => (
          <div key={plant.id}>
            {index > 0 ? <div style={{height: 1, background: 'var(--color-border)', marginInlineStart: 16}} /> : null}
            <button
              type="button"
              className="fnl-btn fnl-focusable"
              style={styles.scheduleRow}
              aria-label={`${plant.name}, ${statusText(plant)}`}
              onClick={event => openSheet(plant.id, event.currentTarget)}>
              <span style={styles.scheduleName}>{plant.name}</span>
              {isDue(plant) ? (
                <span style={{...styles.scheduleDate, ...styles.scheduleDateOverdue}}>{meterMeta(plant)}</span>
              ) : (
                <span style={styles.scheduleDate}>{fmtDate(addDaysIso(plant.lastWatered, plant.intervalDays))}</span>
              )}
            </button>
          </div>
        ))}
      </div>
      <p style={styles.terminalCaption}>All {store.plants.length} plants</p>
    </main>
  );

  // --- Settings tab (stub; the switch state persists per tab) ---
  const reminders = store.tabState.settings.reminders;
  const settingsTab = (
    <main style={styles.main}>
      <div style={styles.largeTitle}>
        <h1 style={styles.largeTitleText}>Settings</h1>
      </div>
      <h2 style={styles.sectionHeader}>
        <span>Care</span>
      </h2>
      <div style={styles.listCard}>
        {/* Whole 44px row is the switch (role=switch, aria-checked). */}
        <button
          type="button"
          role="switch"
          aria-checked={reminders}
          className="fnl-btn fnl-focusable"
          style={styles.settingsRow}
          onClick={() => update({tabState: {...store.tabState, settings: {reminders: !reminders}}})}>
          <span style={styles.settingsLabel}>Watering reminders</span>
          <span
            style={{
              ...styles.switchTrack,
              background: reminders ? BRAND_DEEP : SWITCH_OFF,
            }}>
            <span
              className="fnl-anim"
              style={{...styles.switchThumb, transform: reminders ? 'translateX(20px)' : undefined}}
            />
          </span>
        </button>
        <div style={styles.settingsDivider} />
        <div style={styles.settingsRow}>
          <span style={styles.settingsLabel}>Water unit</span>
          <span style={styles.settingsValue}>Cups (240 ml)</span>
        </div>
        <div style={styles.settingsDivider} />
        <div style={styles.settingsRow}>
          <span style={styles.settingsLabel}>Rooms</span>
          <span style={styles.settingsValue}>{ROOMS.length} rooms</span>
        </div>
        <div style={styles.settingsDivider} />
        <div style={styles.settingsRow}>
          <span style={styles.settingsLabel}>About Fernly</span>
          <span style={styles.settingsValue}>v2.4.1</span>
        </div>
      </div>
    </main>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{FERNLY_CSS}</style>
      <div style={shellStyle} onPointerDownCapture={onShellPointerDownCapture}>
        {/* NAV BAR — 52px sticky; brand mark · fade-in title · Refresh. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="fnl-btn fnl-focusable"
              style={styles.iconBtn}
              aria-label="Fernly — scroll to top"
              onClick={() => wrapRef.current?.scrollIntoView({block: 'start'})}>
              <span style={styles.brandChip}>
                <FernlyMark />
              </span>
            </button>
          </div>
          <span
            className="fnl-fade"
            style={{...styles.navTitle, opacity: compactTitle ? 1 : 0}}
            aria-hidden={!compactTitle}>
            Fernly
          </span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="fnl-btn fnl-focusable"
              style={styles.iconBtn}
              aria-label={store.refreshing ? 'Finish refresh' : 'Refresh plants'}
              aria-pressed={store.refreshing}
              onClick={onRefreshPress}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* IO sentinel — scrolls under the navBar with the large title. */}
        <div ref={sentinelRef} style={{height: 1, flexShrink: 0}} aria-hidden />

        {store.activeTab === 'plants' ? plantsTab : store.activeTab === 'schedule' ? scheduleTab : settingsTab}

        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow at
            bottom 76 (64px tabBar + 12); no auto-dismiss timers ever. */}
        <div style={styles.toastAnchor} aria-live="polite" role="status">
          {store.toast != null ? (
            <div style={styles.toast}>
              <span style={styles.toastMsg}>{store.toast.msg}</span>
              {store.toast.snapshot != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="fnl-btn fnl-focusable" style={styles.toastUndo} onClick={undoWater}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px, 3 tabs; badge count lives in the tab's name. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Fernly sections" onKeyDown={onTabKeyDown}>
          {TABS.map((tab, index) => {
            const isActive = store.activeTab === tab.id;
            const badge = tab.id === 'plants' ? dueIds.length : 0;
            return (
              <button
                key={tab.id}
                ref={element => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={badge > 0 ? `${tab.label}, ${badge} due` : tab.label}
                tabIndex={isActive ? 0 : -1}
                className="fnl-btn fnl-focusable"
                style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                  {badge > 0 ? (
                    <span style={styles.tabBadge} aria-hidden>
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

        {/* PLANT DETAIL SHEET — medium 55% / large calc(100% − 56px). */}
        {sheetPlant != null ? (
          <>
            <button
              type="button"
              className="fnl-btn"
              style={styles.sheetScrim}
              aria-label="Close plant details"
              tabIndex={-1}
              onClick={closeSheet}
            />
            <div
              ref={sheetRef}
              className={reducedMotion ? undefined : 'fnl-sheet-in'}
              style={{
                ...styles.sheet,
                height: store.sheetDetent === 'medium' ? '55%' : 'calc(100% - 56px)',
              }}
              role="dialog"
              aria-modal
              aria-labelledby="fnl-sheet-title"
              onKeyDown={event => trapTabKey(event, sheetRef.current)}>
              <div style={styles.grabberZone}>
                <button
                  type="button"
                  className="fnl-btn fnl-focusable"
                  aria-label="Resize sheet"
                  aria-expanded={store.sheetDetent === 'large'}
                  style={{paddingInline: 16, paddingBlock: 4, borderRadius: 999}}
                  onClick={() => update({sheetDetent: store.sheetDetent === 'medium' ? 'large' : 'medium'})}>
                  <span style={styles.grabberPill} />
                </button>
              </div>
              <div style={styles.sheetHeader}>
                <span />
                <h2 id="fnl-sheet-title" style={styles.sheetTitle}>
                  {sheetPlant.name}
                </h2>
                <button
                  ref={sheetCloseRef}
                  type="button"
                  className="fnl-btn fnl-focusable"
                  style={styles.iconBtn}
                  aria-label="Close"
                  onClick={closeSheet}>
                  <Icon icon={XIcon} size="md" color="inherit" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                <div style={styles.sheetHero}>
                  <span style={styles.sheetAvatar}>
                    <PotAvatar plantId={sheetPlant.id} size={64} />
                  </span>
                  <span style={styles.sheetHeroText}>
                    <span style={styles.sheetSpecies}>{sheetPlant.species}</span>
                    <span style={styles.sheetStatus}>{statusText(sheetPlant)}</span>
                    <ThirstMeter plant={sheetPlant} hero />
                  </span>
                </div>
                <div style={styles.utilityDivider} />
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>Room</span>
                  <span style={styles.utilityValue}>{ROOMS.find(room => room.id === sheetPlant.roomId)?.name}</span>
                </div>
                <div style={styles.utilityDivider} />
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>Interval</span>
                  <span style={styles.utilityValue}>Every {sheetPlant.intervalDays} days</span>
                </div>
                <div style={styles.utilityDivider} />
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>Last watered</span>
                  <span style={styles.utilityValue}>
                    {fmtDate(sheetPlant.lastWatered)} · {daysSince(sheetPlant)} day{daysSince(sheetPlant) === 1 ? '' : 's'} ago
                  </span>
                </div>
                <div style={styles.utilityDivider} />
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>Light</span>
                  <span style={styles.utilityValue}>{sheetPlant.light}</span>
                </div>
                <button
                  type="button"
                  className="fnl-btn fnl-focusable"
                  style={styles.sheetWaterBtn}
                  onClick={() => waterOne(sheetPlant.id, true)}>
                  Water now
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
