var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Snagline photo checklist for
 *   Harbor Point Unit 12: 5 zones / 22 required shots (6+4+5+4+3 = 22 ✓),
 *   12 captured + 2 flagged snags + 8 missing (12+2+8 = 22 ✓), done =
 *   captured+flagged = 14 → ring 14/22 = 63.63… → 64% (round-half-up).
 *   Captured stamps are fixed strings 08:02–09:24; the demo capture stamp
 *   is the fixed '09:31'. Two seeded snags (GF-EL-04 High · 08:41,
 *   ST-CR-02 Medium · 09:07 with the 140-char note stress). Sites tab: 1
 *   live row (Harbor Point, derived from the store) + 3 static fixture
 *   rows (18/18 · 100%, 5/16 · 31% — 31.25 rounds to 31, 0/12 · 0%).
 *   No Date.now(), no Math.random(), no network photos — id-derived
 *   gradients and framing-silhouette SVGs stand in for every image.
 * @output Snagline — Site Photo Checklist: a 390px MOBILE gig/field-work
 *   inspection surface. NavBar (corner-bracket brand mark · 'Harbor Pt ·
 *   Unit 12' · 28px CompletionRing button → Report tab) over a 52px
 *   summary strip ('12 passed · 2 snags · 8 missing' + Jump-to-zone pill
 *   with a 5-row anchored menu), then per-zone sticky ZoneRails (code
 *   chip, uppercase name, aria-hidden 6px pips + visible 'n/m') above a
 *   2-column grid of 172px CaptureSlot tiles (100px media zone =
 *   silhouette + brand corner brackets when missing, id-gradient +
 *   24px StampBar when shot; 72px footer with the explicit Capture /
 *   Retake / View-snag button). Signature move: ONE capture commit —
 *   Viewfinder sheet 'Capture' on GF-EL-05 fills the zone pip, bumps the
 *   rail 5/6→6/6, redraws the navBar ring 64→68%, drops the Report
 *   missing chip 8→7, recounts the summary strip and the submit
 *   blocked-reason row, and announces 'GF-EL-05 captured · Undo' through
 *   the single sticky toast dock — all selectors over one slots record.
 *   Tabs: Checklist / Snags (badge 2, resolve = execute + Undo) / Report
 *   (64px ring, missing-shot chips that jump-and-focus the slot, sticky
 *   Submit footer with permanent blocked-reason row) / Sites.
 * @position Page template; emitted by \`astryx template mobile-site-photo-checklist\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the
 *   first pixel). ALL overlays (scrim, sheets, anchored menus, toast)
 *   are position:'absolute' INSIDE shell; position:fixed is banned.
 *   While a sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and the toastDock flips sticky→absolute
 *   bottom:76; both restore on close. Stage clips to --radius-container;
 *   shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); the
 *   capture grid is 2-up calc(50% − 6px) tiles inside the 16px gutter.
 *   No desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal family
 *   (Snagline amber #F08C00 is the nominal brand; it fails contrast as
 *   text/fill, so the runtime pairs are the darkened/lightened
 *   BRAND_ACCENT / BRAND_FILL below, math at each declaration). REST_GREY
 *   exists per the foundations amendment: hairline/muted tokens are for
 *   passive separators only — missing pips, the missing status ring, the
 *   ring track, and chip boundaries are meaningful rest-state marks and
 *   get an explicit light-dark() pair at ≥3:1 vs their ACTUAL surface
 *   (math at the declaration; deviation from the spec's --color-border
 *   pips, noted).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card/grid gaps · 24px section gaps · 8px chip gaps; navBar 52px
 *   sticky top z20 (paddingInline 8, grid '1fr auto 1fr', hairline
 *   ALWAYS ON — no scroll-under wiring, noted per contract); summary
 *   strip 52px; ZoneRail 40px sticky top:52 z10 blur; CaptureSlot tile
 *   172px = 100px media + 72px footer (8 pad + 16 label + 4 gap + 36
 *   button + 8 pad); StampBar 24px; rows 44px utility / 72px media
 *   (48px thumb, 12px radius); sectionHeader 13px/600 uppercase 0.06em
 *   at 32px (16 gutter + 16 card pad), 20px top / 8px bottom; tabBar
 *   64px sticky bottom z20 (24px icon over 11px/500 label, 4px gap);
 *   report sticky footer above the tabBar (sticky bottom:64 — the
 *   spec's 'bottom:0' would collide with the 64px tabBar, deviation
 *   noted), 16px padding, 48px submit; sheet detents 55% medium /
 *   calc(100% − 56px) large, 24px grabber zone with 36×5 pill, 52px
 *   sheet header; toastDock sticky bottom:76 in flow z30 (absolute
 *   bottom:76 z55 while a sheet locks the shell). Buttons 48 primary /
 *   36 secondary / 44×44 icon. TYPE (Figtree via --font-family-body):
 *   22/700 report % · 17/600 nav+sheet titles · 16/400–500 row primary ·
 *   13/400–600 secondary+labels · 11/500 overlines · 10/600 tab badge
 *   (chrome-contract carve-out); tabular-nums on every count. Touch:
 *   every target ≥44×44 with ≥8px clearance or merged full-row/tile;
 *   every gesture (long-press menu, sheet drag detents) has a visible
 *   button path (the 36px footer button, the clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px: tiles are calc(50% − 6px) inside the 16px-gutter
 *   grid (320 → (320−32−12)/2 = 138px; 430 → 193px); media zone stays
 *   100px and silhouettes letterbox via viewBox + preserveAspectRatio,
 *   never stretch. NavBar title maxWidth 200 ellipsized; summary strip
 *   is minWidth:0 + flexWrap so counts may wrap to two 13px lines below
 *   360 while the jump pill keeps its own line; ZoneRail pips row is
 *   overflow:hidden with the visible 'n/m' as the guaranteed readout;
 *   Report chip wrap is flexWrap by construction; sheets insetInline 0;
 *   anchored menus min(280px, calc(100% − 32px)). overflowX:'clip' is
 *   backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport — the demo stage sits inside a 1440px
 *   window) — at ≥720px the shell becomes the standard centered phone
 *   column (maxWidth 430, marginInline auto, borderInline hairline).
 *   Nothing widens; the checklist anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  FlagIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with its
// contrast math. Snagline's nominal brand is #F08C00 (spec hex); it computes
// ~2.1:1 on white, so it never ships as a runtime value — the quarantined
// runtime family below is the darkened/lightened pair per house rule.
// ---------------------------------------------------------------------------

// Brand for ICON/LARGE-UI use only (ring arcs, pips, corner brackets, 2px
// focus rings): #C96A00 on the ~#FFFFFF card ≈ 3.9:1 (≥3:1 non-text UI);
// #FFB454 on the ~#1C1C1E dark card ≈ 9.7:1.
const BRAND_ACCENT = 'light-dark(#C96A00, #FFB454)';
// Brand as BODY-SIZE TEXT (13px chip labels, toast Undo, active tab label):
// the light side darkens to #A05400 ≈ 5.6:1 on white (4.5:1 floor cleared);
// dark side #FFB454 ≈ 9.7:1.
const BRAND_TEXT = 'light-dark(#A05400, #FFB454)';
// Brand BUTTON FILL. Spec claimed '#FFFFFF on #C96A00 ≈ 4.6:1' — it
// actually computes ≈3.8:1, failing 4.5:1 for the 13px/600 'Capture'
// label, so the light fill darkens to #A05400 (deviation, noted):
// #FFFFFF on #A05400 ≈ 5.6:1; #241505 on #FFB454 ≈ 10.0:1.
const BRAND_FILL = 'light-dark(#A05400, #FFB454)';
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #241505)';
// 12% brand wash for the zone-code chip on the blur rail and tile brackets'
// backing — decorative tint, never a text surface on its own.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// FOUNDATIONS AMENDMENT — meaningful rest-state marks (missing pips, the
// missing 22px status ring, CompletionRing tracks, report-chip boundaries)
// need ≥3:1 vs their ACTUAL surface, not the hairline token. Light #8A857D:
// ≈3.4:1 vs the white body AND ≈3.1:1 vs the ~#F4F2EF muted media zone.
// Dark #7E786D: ≈3.4:1 vs the ~#1C1C1E card / ≈3.0:1 vs the dark muted
// wash. (Deviation from the spec's '--color-border for missing', per the
// binding amendment.)
const REST_GREY = 'light-dark(#8A857D, #7E786D)';
// StampBar scrim + stamps: white 11px/500 on rgba(0,0,0,0.55) over the
// worst-case light gradient stop hsl(h 55% 45%) ≈ 5.4:1; the #FFB84D snag
// glyph on the same blend ≈ 4.3:1 (≥3:1 for the 12px non-text glyph).
const STAMP_SCRIM = 'rgba(0, 0, 0, 0.55)';
const STAMP_TEXT = '#FFFFFF';
const STAMP_SNAG = '#FFB84D';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, the visually-hidden h1, line
// clamps, and keyframes. Transitions animate transform/opacity only and
// collapse to instant under prefers-reduced-motion (the submit-blocked
// reason-row pulse is REMOVED there — the static error text still encodes
// the block).
// ---------------------------------------------------------------------------

const SNAGLINE_CSS = \`
.sgl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.sgl-btn:disabled { cursor: default; }
.sgl-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
/* Inputs show their focus ring ALWAYS (inputControls contract), not just
   focus-visible; the inline error ring overrides while invalid. */
.sgl-input:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px \${BRAND_ACCENT};
}
.sgl-fade { transition: opacity 200ms ease; }
@keyframes sgl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.sgl-sheet-in { animation: sgl-sheet-in 240ms ease; }
@keyframes sgl-pulse {
  0% { opacity: 0; }
  35% { opacity: 1; }
  100% { opacity: 0; }
}
.sgl-pulse { animation: sgl-pulse 900ms ease; }
.sgl-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sgl-vh {
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
  .sgl-fade { transition: none; }
  .sgl-sheet-in { animation: none; }
  .sgl-pulse { animation: none; opacity: 0; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — binding vocabulary names: shell/navBar/tabBar/tabItem/sheetScrim/
// sheet/sheetGrabber/listCard/row/rowDivider/sectionHeader plus the
// template's captureSlot/zoneRail/stampBar/toastDock.
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
  // Scroll lock while a sheet is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: standard centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 buttons
  // optically align to the 16px gutter. Hairline + blur ALWAYS ON (no
  // scroll-under wiring in this template; noted per contract).
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
    color: BRAND_ACCENT,
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // SUMMARY STRIP — 52px, 16px gutter; flexWrap so the counts line may
  // wrap to two 13px lines below 360 while the jump pill keeps its line.
  summaryStrip: {
    minHeight: 52,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingInline: 16,
    paddingBlock: 4,
    position: 'relative',
  },
  summaryCounts: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 'Jump to zone' — 36px pill inside a 44px-tall hit via block padding.
  jumpPillHit: {paddingBlock: 4, borderRadius: 999},
  jumpPill: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // Anchored zone-jump menu — 12px radius card, five 44px rows.
  jumpMenu: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 25,
    width: 'min(280px, calc(100% - 32px))',
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
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  menuRowMeta: {
    marginLeft: 'auto',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ZONE RAIL — 40px sticky per-zone header at top:52 (under the 52px
  // navBar), z10, blur surface, full-bleed hairline (corner map: 0).
  zoneRail: {
    position: 'sticky',
    top: 52,
    zIndex: 10,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
    // Jump targets land the rail below the sticky navBar.
    scrollMarginTop: 52,
  },
  zoneChip: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  zoneName: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  // Pips overflow-hides at narrow widths; the visible 'n/m' count is the
  // guaranteed (and accessible) readout.
  pipsRow: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
    flexShrink: 1,
    minWidth: 0,
  },
  pip: {width: 6, height: 6, borderRadius: 999, flexShrink: 0},
  zoneCount: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // CAPTURE GRID — 2 columns, 12px gaps, 16px gutter; tiles are
  // calc(50% − 6px) so 320px yields 138px tiles, 430px yields 193px.
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 12,
  },
  // CAPTURE SLOT — 172px tile = 100px media + 72px footer; radius 12,
  // 1px border; overflow visible so the anchored slot menu can escape.
  captureSlot: {
    position: 'relative',
    width: 'calc(50% - 6px)',
    height: 172,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    scrollMarginTop: 104, // navBar 52 + rail 40 + breathing room
  },
  // Media zone — 100px whole-<button> to the viewfinder; rounds only the
  // top corners at 11 (12 − 1px border).
  mediaBtn: {
    position: 'relative',
    height: 100,
    width: '100%',
    borderRadius: '11px 11px 0 0',
    overflow: 'hidden',
    display: 'block',
  },
  mediaMissing: {background: 'var(--color-background-muted)'},
  mediaSilhouette: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    // 60% opacity silhouette on the muted media zone (missing state).
    opacity: 0.6,
    color: 'var(--color-text-secondary)',
  },
  // 22px decorative status ring, top-right inset 8, aria-hidden.
  statusRing: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 999,
  },
  statusRingMissing: {border: \`2px solid \${REST_GREY}\`},
  statusRingCaptured: {
    background: BRAND_FILL,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_FILL_TEXT,
  },
  statusRingFlagged: {
    background: 'var(--color-error)',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
  },
  // STAMP BAR — 24px strip pinned to the media bottom (flush, radius 0).
  stampBar: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 8,
    background: STAMP_SCRIM,
    color: STAMP_TEXT,
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  // Tile footer — 72px: 8 pad + 16px label + 4 gap + 36px button + 8 pad.
  slotFooter: {
    height: 72,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 8,
  },
  slotLabel: {
    height: 16,
    fontSize: 13,
    fontWeight: 600,
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  slotBtn: {
    height: 36,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
  },
  slotBtnCapture: {background: BRAND_FILL, color: BRAND_FILL_TEXT},
  slotBtnSecondary: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
  },
  // Error-tinted 'View snag' — 13px/600 --color-error text on a 12% error
  // wash: the text carries contrast (error token passes 4.5:1 on the
  // card; the wash is decorative).
  slotBtnSnag: {
    background: 'color-mix(in srgb, var(--color-error) 12%, transparent)',
    color: 'var(--color-error)',
  },
  // Anchored slot menu (Retake / Flag as snag / View) — 12px radius, 44px
  // rows; escapes the tile over the next grid row.
  slotMenu: {
    position: 'absolute',
    insetInline: 0,
    top: 128,
    zIndex: 15,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'hidden',
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 8,
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
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
  },
  snagThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    flexShrink: 0,
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
  tabIconWrap: {position: 'relative', width: 24, height: 24, display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500},
  // Snags badge — 16px-min brand pill, 10px/600 (chrome-contract badge
  // carve-out), offset top −4 / right −8 INSIDE the flex:1 cell so it
  // never collides with the neighbor tab at 320 (stress fixture 8).
  // Contrast: BRAND_FILL_TEXT on BRAND_FILL ≈ 5.6:1 light / 10.0:1 dark.
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — the ONE polite live region. Sticky-in-flow above the
  // 64px tabBar (amendment: shell-absolute pins to the DOCUMENT bottom
  // and beaches off-viewport on tall views); flips to absolute bottom:76
  // z55 ONLY while a sheet scroll-locks the shell at 100dvh.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    insetInline: 0,
    paddingInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 55,
    paddingInline: 0,
  },
  toast: {
    minHeight: 48,
    width: '100%',
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  // SHEETS — per the foundations: scrim z40, sheet z41, radius 16 16 0 0.
  sheetScrim: {position: 'absolute', inset: 0, background: SCRIM, zIndex: 40},
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
  sheetGrabberZone: {
    height: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    width: '100%',
    flexShrink: 0,
  },
  sheetGrabber: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: 16,
    paddingInlineEnd: 8,
    gap: 8,
    flexShrink: 0,
  },
  sheetTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // The ONE legal inner scroller.
  sheetContent: {flex: 1, minHeight: 0, overflowY: 'auto', paddingInline: 16, paddingBottom: 16},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
  },
  primaryBtn: {
    height: 48,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
  },
  // Viewfinder framing area — 280px, letterboxed silhouette + brand
  // corner brackets; gradient when the shot exists, muted otherwise.
  viewFrame: {
    position: 'relative',
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
  },
  reqRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 16,
    fontWeight: 400,
  },
  // 'Flag as snag instead' — 36px text button in --color-error, separated
  // from the primary by 16px dead space (ergonomics: destructive below
  // the safe verb, never adjacent).
  flagInsteadBtn: {
    marginTop: 16,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-error)',
  },
  // Severity segmented control — 36px muted track radius 12, active card
  // pill radius 8 (corner map), radiogroup with arrow keys.
  segTrack: {
    height: 36,
    display: 'flex',
    padding: 2,
    gap: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segBtn: {
    flex: 1,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  formField: {display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16},
  fieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  // 48px input, 16px text (16 is the hard mobile floor — smaller zooms).
  noteInput: {
    height: 48,
    width: '100%',
    borderRadius: 12,
    border: 'none',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
  },
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    fontSize: 13,
    color: 'var(--color-error)',
  },
  // REPORT — 16px gutter cards 12px apart.
  reportCard: {
    marginInline: 16,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  reportCounts: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  chipWrap: {display: 'flex', flexWrap: 'wrap', gap: 8, paddingInline: 16},
  // Chip — 32px visual inside a 44px-tall hit via block padding; the
  // boundary uses REST_GREY (interactive boundary ≥3:1, amendment).
  chipHit: {paddingBlock: 6, borderRadius: 999},
  chip: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    border: \`1px solid \${REST_GREY}\`,
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  // Report sticky footer — above the 64px tabBar (bottom:64; the spec's
  // bottom:0 would collide with the tabBar, deviation noted in header).
  reportFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 15,
    marginTop: 24,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  reasonRow: {
    position: 'relative',
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-error)',
    fontVariantNumeric: 'tabular-nums',
    paddingInline: 4,
    borderRadius: 8,
  },
  reasonPulse: {
    position: 'absolute',
    inset: -4,
    borderRadius: 8,
    boxShadow: 'inset 0 0 0 2px var(--color-error)',
    pointerEvents: 'none',
  },
  submittedBanner: {
    marginInline: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_TINT_12,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 16,
    fontWeight: 600,
  },
  ringCenterLabel: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  endSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FRAMING SILHOUETTES — 3 camera-shaped stand-ins (no real photos): 'panel'
// (rectangle + breaker rows), 'junction' (box + conduit stubs), 'scaffold'
// (diagonal lattice). Stroked 1.5 in currentColor — the tile sets
// var(--color-text-primary)/-secondary; NEVER the nonexistent --color-text.
// viewBox + preserveAspectRatio letterbox the art (no stretching, 320–430).
// ---------------------------------------------------------------------------

type SilhouetteKind = 'panel' | 'junction' | 'scaffold';

const SILHOUETTE_PATHS: Record<SilhouetteKind, ReactNode> = {
  panel: (
    <>
      <rect x="26" y="8" width="44" height="48" rx="3" />
      <line x1="32" y1="18" x2="64" y2="18" />
      <line x1="32" y1="26" x2="64" y2="26" />
      <line x1="32" y1="34" x2="64" y2="34" />
      <line x1="32" y1="42" x2="64" y2="42" />
      <line x1="44" y1="48" x2="52" y2="48" />
    </>
  ),
  junction: (
    <>
      <rect x="32" y="18" width="32" height="28" rx="3" />
      <circle cx="48" cy="32" r="6" />
      <line x1="32" y1="32" x2="16" y2="32" />
      <line x1="64" y1="32" x2="80" y2="32" />
      <line x1="48" y1="18" x2="48" y2="6" />
    </>
  ),
  scaffold: (
    <>
      <line x1="24" y1="6" x2="24" y2="58" />
      <line x1="48" y1="6" x2="48" y2="58" />
      <line x1="72" y1="6" x2="72" y2="58" />
      <line x1="16" y1="14" x2="80" y2="14" />
      <line x1="16" y1="50" x2="80" y2="50" />
      <line x1="24" y1="14" x2="48" y2="50" />
      <line x1="48" y1="14" x2="72" y2="50" />
    </>
  ),
};

interface SilhouetteProps {
  kind: SilhouetteKind;
  height?: number;
}

function Silhouette({kind, height = 64}: SilhouetteProps) {
  return (
    <svg
      viewBox="0 0 96 64"
      preserveAspectRatio="xMidYMid meet"
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden>
      {SILHOUETTE_PATHS[kind]}
    </svg>
  );
}

// Four 12×12 brand corner brackets, inset 6 — the framing affordance on
// missing tiles and the viewfinder frame.
function CornerBrackets({inset = 6, size = 12}: {inset?: number; size?: number}) {
  const arm: CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    borderColor: BRAND_ACCENT,
    borderStyle: 'solid',
    borderWidth: 0,
  };
  return (
    <span aria-hidden>
      <span style={{...arm, top: inset, left: inset, borderTopWidth: 2, borderLeftWidth: 2}} />
      <span style={{...arm, top: inset, right: inset, borderTopWidth: 2, borderRightWidth: 2}} />
      <span style={{...arm, bottom: inset, left: inset, borderBottomWidth: 2, borderLeftWidth: 2}} />
      <span style={{...arm, bottom: inset, right: inset, borderBottomWidth: 2, borderRightWidth: 2}} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// ID-DERIVED GRADIENTS — deterministic hue from the slot id (sum of char
// codes % 360); no Math.random(), no network photos.
// ---------------------------------------------------------------------------

function slotHue(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return sum % 360;
}

function slotGradient(id: string): string {
  const h = slotHue(id);
  return \`linear-gradient(135deg, hsl(\${h} 55% 45%), hsl(\${(h + 40) % 360} 50% 30%))\`;
}

// ---------------------------------------------------------------------------
// FIXTURES — ALL AGGREGATES DERIVED AND CROSS-CHECKED. 5 zones, 22 slots
// (6+4+5+4+3 = 22 ✓); captured 4+2+5+1+0 = 12; flagged 1+0+0+1+0 = 2;
// missing 1+2+0+2+3 = 8; 12+2+8 = 22 ✓. Done = captured+flagged = 14 →
// 14/22 = 63.63… → 64% (Math.round = round-half-up for positives). After
// the demo capture of GF-EL-05: captured 13, done 15 → 15/22 = 68.18 → 68%,
// missing 7 — every surface re-derives those exact numbers from ONE store.
// NOTE: the spec's densityGrid example rail count '4/6' for GF-EL does not
// reconcile with its own law (done = captured+flagged → 5/6, and its jump
// menu says '5/6'); the law wins — rails count captured+flagged. Deviation
// noted.
// ---------------------------------------------------------------------------

type SlotStatus = 'missing' | 'captured' | 'flagged';
type Severity = 'Low' | 'Medium' | 'High';

interface ZoneFixture {
  code: string; // dual identity: code…
  name: string; // …+ human name
  slotIds: string[];
}

interface SlotFixture {
  id: string; // 'GF-EL-03' — dual fields: id…
  label: string; // …+ human label '03 · DB panel front'
  zoneCode: string;
  silhouette: SilhouetteKind; // cycles panel/junction/scaffold by index%3
}

interface SlotState {
  status: SlotStatus;
  capturedAt: string | null; // fixed stamp strings — no Date.now()
  severity: Severity | null;
  note: string | null;
  defect: string | null; // snag row primary
}

const SIL_CYCLE: SilhouetteKind[] = ['panel', 'junction', 'scaffold'];

interface SlotSeed {
  n: string;
  label: string;
  status: SlotStatus;
  at?: string;
  severity?: Severity;
  defect?: string;
  note?: string;
}

// Captured stamps are fixed strings 08:02–09:24. GF-EL-06's label is the
// one-line-ellipsis stress (fixture 4); ST-CR-02's note is the 140-char
// two-line-clamp stress (fixture 5). Zone C (RF-PL) is the fully-complete
// zone (stress 2); Zone E (EX-EN) is the all-missing zone (stress 1).
const ZONE_SEEDS: Array<{code: string; name: string; slots: SlotSeed[]}> = [
  {
    code: 'GF-EL',
    name: 'Ground Floor Electrical',
    slots: [
      {n: '01', label: 'Incoming supply head', status: 'captured', at: '08:02'},
      {n: '02', label: 'Meter cupboard interior', status: 'captured', at: '08:06'},
      {n: '03', label: 'DB panel front', status: 'captured', at: '08:14'},
      {
        n: '04',
        label: 'DB-2 tail connections',
        status: 'flagged',
        at: '08:41',
        severity: 'High',
        defect: 'Exposed conductor at DB-2 tail',
        note: 'Insulation cut back past the gland plate; live tail needs re-termination before energisation.',
      },
      {n: '05', label: 'Earth bonding label', status: 'missing'},
      // Long-label stress: must ellipsize on ONE 13px footer line without
      // growing the 172px tile.
      {n: '06', label: 'Temporary distribution board tail terminations', status: 'captured', at: '09:24'},
    ],
  },
  {
    code: 'SC-E',
    name: 'Scaffold East',
    slots: [
      {n: '01', label: 'Base plates & sole boards', status: 'captured', at: '08:52'},
      {n: '02', label: 'Guardrail mid-span', status: 'missing'},
      {n: '03', label: 'Ladder access gate', status: 'captured', at: '08:57'},
      {n: '04', label: 'Toe boards east run', status: 'missing'},
    ],
  },
  {
    code: 'RF-PL',
    name: 'Roof Plant',
    slots: [
      {n: '01', label: 'AHU nameplate', status: 'captured', at: '09:03'},
      {n: '02', label: 'Condenser clearances', status: 'captured', at: '09:05'},
      {n: '03', label: 'Gas line supports', status: 'captured', at: '09:08'},
      {n: '04', label: 'Roof penetration seals', status: 'captured', at: '09:12'},
      {n: '05', label: 'Plant screen fixings', status: 'captured', at: '09:15'},
    ],
  },
  {
    code: 'ST-CR',
    name: 'Stairwell Core',
    slots: [
      {n: '01', label: 'Landing handrail fixings', status: 'missing'},
      {
        n: '02',
        label: 'Half-landing handrail bracket',
        status: 'flagged',
        at: '09:07',
        severity: 'Medium',
        defect: 'Handrail bracket loose at half landing',
        // 140-char note (stress fixture 5): clamps to 2 lines in the Snags
        // row secondary via WebkitLineClamp 2.
        note: 'Two of four fixing screws spin freely in the blockwork; bracket rocks under hand load and the rail deflects about 15 mm at the half landing.',
      },
      {n: '03', label: 'Riser cupboard fire-stopping', status: 'missing'},
      {n: '04', label: 'Stair nosing contrast strips', status: 'captured', at: '09:20'},
    ],
  },
  {
    code: 'EX-EN',
    name: 'External Envelope',
    slots: [
      {n: '01', label: 'North elevation brick ties', status: 'missing'},
      {n: '02', label: 'DPC line at grade', status: 'missing'},
      {n: '03', label: 'Movement joint sealant', status: 'missing'},
    ],
  },
];

const ZONES: ZoneFixture[] = ZONE_SEEDS.map(zone => ({
  code: zone.code,
  name: zone.name,
  slotIds: zone.slots.map(slot => \`\${zone.code}-\${slot.n}\`),
}));

const SLOT_FIXTURES: Record<string, SlotFixture> = {};
const INITIAL_SLOTS: Record<string, SlotState> = {};
for (const zone of ZONE_SEEDS) {
  zone.slots.forEach((seed, index) => {
    const id = \`\${zone.code}-\${seed.n}\`;
    SLOT_FIXTURES[id] = {
      id,
      label: \`\${seed.n} · \${seed.label}\`,
      zoneCode: zone.code,
      silhouette: SIL_CYCLE[index % 3],
    };
    INITIAL_SLOTS[id] = {
      status: seed.status,
      capturedAt: seed.at ?? null,
      severity: seed.severity ?? null,
      note: seed.note ?? null,
      defect: seed.defect ?? null,
    };
  });
}

// The demo-capture stamp — a fixed string (falls after the 09:24 fixture
// max; the demo's internal clock, not Date.now()).
const DEMO_STAMP = '09:31';

// Sites tab — Harbor Point derives LIVE from the store; the other three
// are static fixtures (marked as such). Kestrel 5/16 = 31.25 → 31;
// Kestrel's long name is the 72px-row ellipsis stress at 320 (fixture 3).
interface SiteFixture {
  id: string;
  name: string;
  done: number | null; // null = live (Harbor Point)
  total: number;
}

const SITES: SiteFixture[] = [
  {id: 'site_harbor', name: 'Harbor Point Unit 12', done: null, total: 22},
  {id: 'site_delano', name: 'Delano Yard Phase 2', done: 18, total: 18},
  {id: 'site_kestrel', name: 'Kestrel Mill Retrofit — Building 3 North Annexe', done: 5, total: 16},
  {id: 'site_north', name: 'Northgate Substation', done: 0, total: 12},
];

const SITE_TITLE = 'Harbor Pt · Unit 12';
const VIEWFINDER_REQS = ['Panel door open', 'Breaker labels legible', 'Include zone tag'];
const SEVERITIES: Severity[] = ['Low', 'Medium', 'High'];

// ---------------------------------------------------------------------------
// PURE SELECTORS — no duplicated tallies anywhere; every surface (pips,
// rail counts, navBar ring, summary strip, Report chips, submit reason,
// Snags badge, Sites live row) calls these over the ONE slots record.
// ---------------------------------------------------------------------------

interface Counts {
  captured: number;
  flagged: number;
  missing: number;
  done: number; // captured + flagged
  total: number;
}

function countIds(ids: string[], slots: Record<string, SlotState>): Counts {
  let captured = 0;
  let flagged = 0;
  for (const id of ids) {
    const status = slots[id].status;
    if (status === 'captured') captured += 1;
    else if (status === 'flagged') flagged += 1;
  }
  const total = ids.length;
  const done = captured + flagged;
  return {captured, flagged, missing: total - done, done, total};
}

function zoneCounts(zone: ZoneFixture, slots: Record<string, SlotState>): Counts {
  return countIds(zone.slotIds, slots);
}

function totals(slots: Record<string, SlotState>): Counts & {pct: number} {
  const counts = countIds(
    ZONES.flatMap(zone => zone.slotIds),
    slots,
  );
  // Round-half-up for positives: 14/22 = 63.63 → 64; 15/22 = 68.18 → 68.
  return {...counts, pct: Math.round((counts.done / counts.total) * 100)};
}

function missingIds(slots: Record<string, SlotState>): string[] {
  return ZONES.flatMap(zone => zone.slotIds.filter(id => slots[id].status === 'missing'));
}

function flaggedIds(slots: Record<string, SlotState>): string[] {
  return ZONES.flatMap(zone => zone.slotIds.filter(id => slots[id].status === 'flagged'));
}

/** 'Blocked: 8 missing shots · 2 open snags' — parts drop at zero. */
function blockedReason(counts: Counts): string | null {
  const parts: string[] = [];
  if (counts.missing > 0) parts.push(\`\${counts.missing} missing shot\${counts.missing === 1 ? '' : 's'}\`);
  if (counts.flagged > 0) parts.push(\`\${counts.flagged} open snag\${counts.flagged === 1 ? '' : 's'}\`);
  return parts.length === 0 ? null : \`Blocked: \${parts.join(' · ')}\`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — every mutation flows through update(slotId, patch) (the
// slot mutator) or patch() (UI fields); all counts are selectors above.
// ---------------------------------------------------------------------------

type TabId = 'checklist' | 'snags' | 'report' | 'sites';

const TAB_IDS: TabId[] = ['checklist', 'snags', 'report', 'sites'];

interface ToastState {
  seq: number;
  text: string;
  // Snapshot undo (undoOverConfirm): restores the exact prior slot record.
  undo: {slotId: string; prev: SlotState} | null;
}

interface OpenSheet {
  kind: 'viewfinder' | 'annotate';
  slotId: string;
}

interface Store {
  tab: TabId;
  // Push-stack slot per the tab-persistence contract; every tab in this
  // surface is root-only (no pushed detail screens), so the record is
  // written on tab switches but always 'root'.
  screenByTab: Record<TabId, 'root'>;
  scrollByTab: Record<TabId, number>;
  slots: Record<string, SlotState>;
  openSheet: OpenSheet | null;
  sheetDetent: 'medium' | 'large';
  toast: ToastState | null;
  jumpMenuOpen: boolean;
  slotMenuId: string | null; // anchored Retake/Flag/View menu
  snagMenuId: string | null; // Snags-tab ellipsis menu
  submitted: boolean;
  submittedAttempt: number; // bumps → reason-row 2px error ring pulse
  annotate: {severity: Severity; note: string; error: boolean};
}

const INITIAL_STORE: Store = {
  tab: 'checklist',
  screenByTab: {checklist: 'root', snags: 'root', report: 'root', sites: 'root'},
  scrollByTab: {checklist: 0, snags: 0, report: 0, sites: 0},
  slots: INITIAL_SLOTS,
  openSheet: null,
  sheetDetent: 'large',
  toast: null,
  jumpMenuOpen: false,
  slotMenuId: null,
  snagMenuId: null,
  submitted: false,
  submittedAttempt: 0,
  annotate: {severity: 'Medium', note: '', error: false},
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns page scroll. */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node != null) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// Focus trap — sheets trap Tab while open; Escape layering is handled at
// the page level (topmost only).
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])');
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
// COMPLETION RING — pure SVG donut; strokeDasharray from done/total. Track
// uses REST_GREY (a meaningful rest fill needs ≥3:1 vs its surface —
// amendment; deviation from the spec's --color-border track). aria-hidden:
// the adjacent text / aria-label carries the count.
// ---------------------------------------------------------------------------

interface CompletionRingProps {
  size: 28 | 64;
  done: number;
  total: number;
  label?: string | null;
}

function CompletionRing({size, done, total, label = null}: CompletionRingProps) {
  const strokeWidth = size === 64 ? 5 : 3;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const frac = total === 0 ? 0 : done / total;
  return (
    <span style={{position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center', flexShrink: 0}} aria-hidden>
      <svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`} fill="none">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={REST_GREY} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={BRAND_ACCENT}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={\`\${(frac * c).toFixed(2)} \${c.toFixed(2)}\`}
          transform={\`rotate(-90 \${size / 2} \${size / 2})\`}
        />
      </svg>
      {label != null ? (
        <span style={{...styles.ringCenterLabel, position: 'absolute'}}>{label}</span>
      ) : null}
    </span>
  );
}

// ---------------------------------------------------------------------------
// BRAND MARK — 24px chevron/corner-bracket Snagline glyph in the 44×44
// navBar leading button (tapping scrolls the current tab to top).
// ---------------------------------------------------------------------------

function SnaglineMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={BRAND_ACCENT} strokeWidth={2} strokeLinecap="round" aria-hidden>
      <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9" />
      <path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9" />
      <path d="M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15" />
      <path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />
      <path d="m9 12 2.4 2.4L15.5 9.6" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// STAMP BAR — 24px composite strip on captured/flagged media (32px variant
// inside the AnnotationSheet preview): black 55% scrim, fixed timestamp,
// zone code, pass/snag glyph. White 11px/500 on the scrim-over-gradient
// blend ≈ 5.4:1 (math at STAMP_TEXT).
// ---------------------------------------------------------------------------

interface StampBarProps {
  time: string;
  zoneCode: string;
  kind: 'pass' | 'snag';
  height?: 24 | 32;
}

function StampBar({time, zoneCode, kind, height = 24}: StampBarProps) {
  return (
    <span style={{...styles.stampBar, height}} aria-hidden>
      <span>{time}</span>
      <span>{zoneCode}</span>
      <span style={{marginLeft: 'auto', display: 'grid', placeItems: 'center', color: kind === 'snag' ? STAMP_SNAG : STAMP_TEXT}}>
        <Icon icon={kind === 'snag' ? FlagIcon : CheckIcon} size="xsm" color="inherit" />
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// ZONE RAIL — 40px sticky per-zone h2 (top:52, z10, blur): code chip, name,
// aria-hidden 6px pips (brand fill = done, error ring = snag, REST_GREY =
// missing per the amendment) + the visible 'n/m' tabular count (the
// accessible readout — pips may overflow-hide at 320).
// ---------------------------------------------------------------------------

interface ZoneRailProps {
  zone: ZoneFixture;
  slots: Record<string, SlotState>;
  railRef: (el: HTMLDivElement | null) => void;
}

function ZoneRail({zone, slots, railRef}: ZoneRailProps) {
  const counts = zoneCounts(zone, slots);
  return (
    <div ref={railRef} style={styles.zoneRail}>
      <span style={styles.zoneChip}>{zone.code}</span>
      <h2 style={{...styles.zoneName, margin: 0}}>{zone.name}</h2>
      <span style={styles.pipsRow} aria-hidden>
        {zone.slotIds.map(id => {
          const status = slots[id].status;
          const pipStyle: CSSProperties =
            status === 'captured'
              ? {...styles.pip, background: BRAND_ACCENT}
              : status === 'flagged'
                ? {...styles.pip, border: '2px solid var(--color-error)', width: 6, height: 6, boxSizing: 'border-box'}
                : {...styles.pip, background: REST_GREY};
          return <span key={id} style={pipStyle} />;
        })}
      </span>
      <span style={styles.zoneCount}>
        {counts.done}/{counts.total}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CAPTURE SLOT — 172px required-shot tile. The media zone is a whole
// <button> to the viewfinder (named by the slot label, not row soup); the
// 36px footer button is the mandatory non-gesture path (Capture / Retake →
// anchored menu / View snag). Long-press on a shot tile is menu garnish —
// the footer button is the contract.
// ---------------------------------------------------------------------------

interface CaptureSlotProps {
  fixture: SlotFixture;
  slot: SlotState;
  menuOpen: boolean;
  tileRef: (el: HTMLDivElement | null) => void;
  footerBtnRef: (el: HTMLButtonElement | null) => void;
  onOpenViewfinder: (opener: HTMLElement) => void;
  onFooterPress: (opener: HTMLElement) => void;
  onMenuAction: (action: 'retake' | 'flag' | 'view') => void;
}

function CaptureSlot({
  fixture,
  slot,
  menuOpen,
  tileRef,
  footerBtnRef,
  onOpenViewfinder,
  onFooterPress,
  onMenuAction,
}: CaptureSlotProps) {
  const isMissing = slot.status === 'missing';
  const isFlagged = slot.status === 'flagged';
  const longPressTimer = useRef<number | null>(null);
  const pressOrigin = useRef<{x: number; y: number} | null>(null);

  const clearLongPress = () => {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pressOrigin.current = null;
  };

  const footerLabel = isMissing ? 'Capture' : isFlagged ? 'View snag' : 'Retake';
  const footerStyle: CSSProperties = {
    ...styles.slotBtn,
    ...(isMissing ? styles.slotBtnCapture : isFlagged ? styles.slotBtnSnag : styles.slotBtnSecondary),
  };

  return (
    <div ref={tileRef} style={styles.captureSlot}>
      <button
        type="button"
        className="sgl-btn sgl-focusable"
        style={{...styles.mediaBtn, ...(isMissing ? styles.mediaMissing : {background: slotGradient(fixture.id)})}}
        aria-label={\`\${isMissing ? 'Capture' : 'Open'} \${fixture.label} in viewfinder\`}
        onClick={event => onOpenViewfinder(event.currentTarget)}
        onPointerDown={event => {
          // Long-press (450ms, cancelled by 8px movement) opens the same
          // anchored menu as the footer button — garnish, never the only
          // path.
          if (isMissing) return;
          pressOrigin.current = {x: event.clientX, y: event.clientY};
          const opener = event.currentTarget;
          longPressTimer.current = window.setTimeout(() => {
            longPressTimer.current = null;
            onFooterPress(opener);
          }, 450);
        }}
        onPointerMove={event => {
          const origin = pressOrigin.current;
          if (origin == null) return;
          if (Math.abs(event.clientX - origin.x) > 8 || Math.abs(event.clientY - origin.y) > 8) clearLongPress();
        }}
        onPointerUp={clearLongPress}
        onPointerLeave={clearLongPress}>
        {isMissing ? (
          <>
            <span style={styles.mediaSilhouette}>
              <Silhouette kind={fixture.silhouette} />
            </span>
            <CornerBrackets />
          </>
        ) : (
          <StampBar time={slot.capturedAt ?? DEMO_STAMP} zoneCode={fixture.zoneCode} kind={isFlagged ? 'snag' : 'pass'} />
        )}
        {/* 22px decorative status ring (aria-hidden; the footer button and
            StampBar carry the state). */}
        <span
          style={{
            ...styles.statusRing,
            ...(isMissing ? styles.statusRingMissing : isFlagged ? styles.statusRingFlagged : styles.statusRingCaptured),
          }}
          aria-hidden>
          {isMissing ? null : <Icon icon={isFlagged ? FlagIcon : CheckIcon} size="xsm" color="inherit" />}
        </span>
      </button>
      <div style={styles.slotFooter}>
        <span style={styles.slotLabel}>{fixture.label}</span>
        <button
          type="button"
          ref={footerBtnRef}
          className="sgl-btn sgl-focusable"
          style={footerStyle}
          aria-label={\`\${footerLabel} \${fixture.label}\`}
          aria-expanded={slot.status === 'captured' ? menuOpen : undefined}
          onClick={event => onFooterPress(event.currentTarget)}>
          {footerLabel}
        </button>
      </div>
      {menuOpen ? (
        <div style={styles.slotMenu} role="menu" aria-label={\`Actions for \${fixture.label}\`}>
          {(
            [
              {action: 'retake', label: 'Retake'},
              {action: 'flag', label: 'Flag as snag'},
              {action: 'view', label: 'View'},
            ] as const
          ).map((item, index) => (
            <div key={item.action}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <button
                type="button"
                role="menuitem"
                className="sgl-btn sgl-focusable"
                style={{
                  ...styles.menuRow,
                  ...(item.action === 'flag' ? {color: 'var(--color-error)'} : null),
                }}
                onClick={() => onMenuAction(item.action)}>
                {item.label}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET FRAME — shared bottom-sheet chrome per the foundations: grabber is
// a REAL button toggling medium/large, X + scrim + Escape close, focus is
// trapped inside and restored by the caller on every close path.
// ---------------------------------------------------------------------------

interface SheetFrameProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  footer: ReactNode;
  children: ReactNode;
}

function SheetFrame({titleId, title, detent, onDetentChange, onClose, sheetRef, footer, children}: SheetFrameProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="sgl-sheet-in"
      style={{
        ...styles.sheet,
        height: detent === 'large' ? 'calc(100% - 56px)' : '55%',
      }}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}>
      {/* The whole 24px grabber zone is the real 'Resize sheet' button
          (full-width merged target, sibling precedent). */}
      <button
        type="button"
        className="sgl-btn sgl-focusable"
        aria-label="Resize sheet"
        style={styles.sheetGrabberZone}
        onClick={() => onDetentChange(detent === 'large' ? 'medium' : 'large')}>
        <span style={styles.sheetGrabber} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span id={titleId} style={styles.sheetTitle}>
          {title}
        </span>
        <button type="button" className="sgl-btn sgl-focusable" style={styles.iconBtn} aria-label="Close" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetContent}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VIEWFINDER SHEET body — LARGE detent: 280px framing area (gradient when
// the shot exists, muted + full-opacity silhouette otherwise, brand corner
// brackets, no animation), three 44px requirement rows.
// ---------------------------------------------------------------------------

interface ViewfinderBodyProps {
  fixture: SlotFixture;
  slot: SlotState;
}

function ViewfinderBody({fixture, slot}: ViewfinderBodyProps) {
  const hasShot = slot.status !== 'missing';
  return (
    <>
      <div style={{...styles.viewFrame, ...(hasShot ? {background: slotGradient(fixture.id)} : null)}}>
        {hasShot ? null : (
          <span style={{color: 'var(--color-text-secondary)'}}>
            <Silhouette kind={fixture.silhouette} height={120} />
          </span>
        )}
        <CornerBrackets inset={10} size={16} />
        {hasShot ? (
          <StampBar time={slot.capturedAt ?? DEMO_STAMP} zoneCode={fixture.zoneCode} kind={slot.status === 'flagged' ? 'snag' : 'pass'} />
        ) : null}
      </div>
      <ul style={{listStyle: 'none', margin: '12px 0 0', padding: 0}}>
        {VIEWFINDER_REQS.map((req, index) => (
          <li key={req} style={{...styles.reqRow, ...(index > 0 ? {borderTop: '1px solid var(--color-border)'} : null)}}>
            <span style={{color: BRAND_ACCENT, display: 'grid', placeItems: 'center'}} aria-hidden>
              <Icon icon={CheckIcon} size="sm" color="inherit" />
            </span>
            {req}
          </li>
        ))}
      </ul>
    </>
  );
}

// ---------------------------------------------------------------------------
// TAB BAR — 4 tabItems, 24px icon over 11px/500 label; Snags carries the
// live open-snag badge (16px min brand pill, 10px/600, offset −4/−8 inside
// the flex:1 cell). Re-tapping the active tab scrolls to top (and closes
// the jump menu on Checklist) — the one legal reset.
// ---------------------------------------------------------------------------

const TAB_META: Record<TabId, {label: string; icon: typeof FlagIcon}> = {
  checklist: {label: 'Checklist', icon: ClipboardCheckIcon},
  snags: {label: 'Snags', icon: FlagIcon},
  report: {label: 'Report', icon: FileTextIcon},
  sites: {label: 'Sites', icon: MapPinIcon},
};

interface TabBarProps {
  active: TabId;
  snagCount: number;
  onSelect: (tab: TabId) => void;
}

function TabBar({active, snagCount, onSelect}: TabBarProps) {
  return (
    <nav
      style={styles.tabBar}
      aria-label="Snagline tabs"
      role="tablist"
      onKeyDown={event => {
        // Tablist arrow-key movement (keyboard parity law).
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const index = TAB_IDS.indexOf(active);
        const next =
          event.key === 'ArrowRight'
            ? TAB_IDS[(index + 1) % TAB_IDS.length]
            : TAB_IDS[(index + TAB_IDS.length - 1) % TAB_IDS.length];
        onSelect(next);
        const tabs = event.currentTarget.querySelectorAll<HTMLElement>('button');
        tabs[TAB_IDS.indexOf(next)]?.focus();
      }}>
      {TAB_IDS.map(tab => {
        const meta = TAB_META[tab];
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className="sgl-btn sgl-focusable"
            style={{
              ...styles.tabItem,
              ...(isActive ? {color: BRAND_TEXT, fontWeight: 600} : null),
            }}
            aria-label={tab === 'snags' && snagCount > 0 ? \`Snags, \${snagCount} open\` : meta.label}
            onClick={() => onSelect(tab)}>
            <span style={styles.tabIconWrap}>
              <Icon icon={meta.icon} size="lg" color="inherit" />
              {tab === 'snags' && snagCount > 0 ? (
                <span style={styles.tabBadge} aria-hidden>
                  {snagCount}
                </span>
              ) : null}
            </span>
            <span style={{...styles.tabLabel, ...(isActive ? {fontWeight: 600} : null)}}>{meta.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner. Every mutation flows through update(slotId,
// patch) / one setStore commit; every count on every surface is a selector.
// ---------------------------------------------------------------------------

export default function MobileSitePhotoChecklistTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;

  const [store, setStore] = useState<Store>(INITIAL_STORE);

  // THE slot mutator — all capture/flag/resolve/undo commits go through it.
  const update = useCallback((slotId: string, slotPatch: Partial<SlotState>) => {
    setStore(prev => ({...prev, slots: {...prev.slots, [slotId]: {...prev.slots[slotId], ...slotPatch}}}));
  }, []);
  const patch = useCallback((storePatch: Partial<Store>) => {
    setStore(prev => ({...prev, ...storePatch}));
  }, []);

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const jumpMenuRef = useRef<HTMLDivElement | null>(null);
  const noteInputRef = useRef<HTMLInputElement | null>(null);
  const railRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tileRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const footerBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pendingSlotFocus = useRef<string | null>(null);
  const toastSeqRef = useRef(0);

  // Derived — every aggregate on screen comes from these selectors.
  const tot = totals(store.slots);
  const missing = missingIds(store.slots);
  const flagged = flaggedIds(store.slots);
  const reason = blockedReason(tot);
  const sheetSlotId = store.openSheet?.slotId ?? null;
  const sheetFixture = sheetSlotId != null ? SLOT_FIXTURES[sheetSlotId] : null;
  const sheetSlot = sheetSlotId != null ? store.slots[sheetSlotId] : null;

  // NO AUTO-DISMISS (undoOverConfirm law): the toast persists until Undo,
  // the next mutation replaces it, or the tab changes it stays through —
  // deterministic fixtures never race the reader.
  const toastState = (text: string, undo: ToastState['undo'] = null): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, text, undo};
  };
  const showToast = (text: string) => patch({toast: toastState(text)});

  // Focus into an opening sheet uses preventScroll (amendment): a plain
  // .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen. scrollTop reset is
  // the belt to that suspender.
  useEffect(() => {
    if (store.openSheet != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [store.openSheet]);

  // Anchored menus focus their first row on open (no scroll wanted).
  useEffect(() => {
    if (store.jumpMenuOpen) jumpMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [store.jumpMenuOpen]);

  // PER-TAB STATE PERSISTENCE — restore the demo scroller's scrollTop on
  // tab entry (it was recorded on exit inside switchTab).
  useEffect(() => {
    const scroller = getScrollParent(shellRef.current);
    if (scroller != null) scroller.scrollTop = store.scrollByTab[store.tab];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.tab]);

  // Report missing-chip jump: after the Checklist tab renders, scroll the
  // slot into view and focus its Capture button (runs AFTER the scroll
  // restore above — declaration order is load-bearing).
  useEffect(() => {
    const id = pendingSlotFocus.current;
    if (store.tab === 'checklist' && id != null) {
      pendingSlotFocus.current = null;
      tileRefs.current[id]?.scrollIntoView({block: 'center'});
      footerBtnRefs.current[id]?.focus({preventScroll: true});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.tab]);

  // Escape closes the TOPMOST overlay only: anchored menus > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (store.jumpMenuOpen) {
        patch({jumpMenuOpen: false});
        menuOpenerRef.current?.focus();
      } else if (store.slotMenuId != null) {
        patch({slotMenuId: null});
        menuOpenerRef.current?.focus();
      } else if (store.snagMenuId != null) {
        patch({snagMenuId: null});
        menuOpenerRef.current?.focus();
      } else if (store.openSheet != null) {
        patch({openSheet: null});
        sheetOpenerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.jumpMenuOpen, store.slotMenuId, store.snagMenuId, store.openSheet]);

  // TAB LIFECYCLE — record scrollTop on exit, close overlays (they belong
  // to their moment), keep the toast. Re-tap of the active tab = the one
  // legal reset: scroll to top (Checklist also closes the jump menu).
  const selectTab = (tab: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (tab === store.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      if (store.jumpMenuOpen) patch({jumpMenuOpen: false});
      return;
    }
    setStore(prev => ({
      ...prev,
      scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
      tab,
      openSheet: null,
      jumpMenuOpen: false,
      slotMenuId: null,
      snagMenuId: null,
    }));
  };

  // SHEET LIFECYCLE ----------------------------------------------------------

  const openViewfinder = (slotId: string, opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    patch({
      openSheet: {kind: 'viewfinder', slotId},
      sheetDetent: 'large',
      jumpMenuOpen: false,
      slotMenuId: null,
      snagMenuId: null,
    });
  };
  const openAnnotate = (slotId: string, opener: HTMLElement | null) => {
    if (opener != null) sheetOpenerRef.current = opener;
    const slot = store.slots[slotId];
    patch({
      openSheet: {kind: 'annotate', slotId},
      sheetDetent: 'medium',
      annotate: {severity: slot.severity ?? 'Medium', note: slot.note ?? '', error: false},
      jumpMenuOpen: false,
      slotMenuId: null,
      snagMenuId: null,
    });
  };
  const closeSheet = () => {
    patch({openSheet: null});
    sheetOpenerRef.current?.focus();
  };

  // CONSEQUENCE CHAINS ---------------------------------------------------------

  // (1) CAPTURE COMMIT — in ONE render: zone pip fills, ZoneRail count
  // increments, navBar ring redraws (64→68% for GF-EL-05), Report missing
  // chips drop the id, summary strip + blocked-reason row recount, toast
  // offers Undo (capture is reversible — undoOverConfirm, never a confirm).
  const commitCapture = (slotId: string) => {
    setStore(prev => {
      const prevSlot = prev.slots[slotId];
      return {
        ...prev,
        slots: {
          ...prev.slots,
          [slotId]: {status: 'captured', capturedAt: DEMO_STAMP, severity: null, note: null, defect: null},
        },
        openSheet: null,
        toast: toastState(\`\${slotId} captured\`, {slotId, prev: prevSlot}),
      };
    });
    sheetOpenerRef.current?.focus();
  };

  // (2) SAVE SNAG — validates the note ON SUBMIT-PRESS (scroll+focus the
  // invalid field), then the same single-commit consequences: Snags badge
  // 2→3, ring counts it as done, Report gains an open-snag row, submit
  // reason recounts.
  const saveSnag = () => {
    if (sheetSlotId == null) return;
    if (store.annotate.note.trim() === '') {
      setStore(prev => ({...prev, annotate: {...prev.annotate, error: true}}));
      noteInputRef.current?.scrollIntoView({block: 'center'});
      noteInputRef.current?.focus({preventScroll: true});
      return;
    }
    setStore(prev => {
      const prevSlot = prev.slots[sheetSlotId];
      return {
        ...prev,
        slots: {
          ...prev.slots,
          [sheetSlotId]: {
            status: 'flagged',
            capturedAt: prevSlot.capturedAt ?? DEMO_STAMP,
            severity: prev.annotate.severity,
            note: prev.annotate.note,
            defect: prevSlot.defect ?? prev.annotate.note,
          },
        },
        openSheet: null,
        toast: toastState(\`\${sheetSlotId} flagged as snag\`, {slotId: sheetSlotId, prev: prevSlot}),
      };
    });
    sheetOpenerRef.current?.focus();
  };

  // (3) RESOLVE — executes immediately + Undo (undoOverConfirm); the badge
  // decrements, the shot counts as passed, Report loses the snag row.
  const resolveSnag = (slotId: string) => {
    setStore(prev => {
      const prevSlot = prev.slots[slotId];
      return {
        ...prev,
        slots: {
          ...prev.slots,
          [slotId]: {status: 'captured', capturedAt: prevSlot.capturedAt ?? DEMO_STAMP, severity: null, note: null, defect: null},
        },
        snagMenuId: null,
        toast: toastState(\`\${slotId} resolved\`, {slotId, prev: prevSlot}),
      };
    });
    menuOpenerRef.current?.focus();
  };

  // (4) UNDO — exact prior state back in one assignment; toast reads
  // 'Restored'.
  const undoToast = () => {
    const undo = store.toast?.undo;
    if (undo == null) return;
    setStore(prev => ({
      ...prev,
      slots: {...prev.slots, [undo.slotId]: undo.prev},
      toast: toastState('Restored'),
    }));
  };

  // (5) SUBMIT — always enabled; with blockers it toasts through the ONE
  // polite dock and pulses the reason row (opacity-only, removed under
  // reduced motion); at 0/0 it flips to the submitted banner.
  const submitReport = () => {
    if (store.submitted) return;
    if (reason != null) {
      const parts: string[] = [];
      if (tot.missing > 0) parts.push(\`\${tot.missing} missing shot\${tot.missing === 1 ? '' : 's'}\`);
      if (tot.flagged > 0) parts.push(\`\${tot.flagged} open snag\${tot.flagged === 1 ? '' : 's'}\`);
      setStore(prev => ({
        ...prev,
        submittedAttempt: prev.submittedAttempt + 1,
        toast: toastState(\`Can't submit: \${parts.join(', ')}\`),
      }));
      return;
    }
    setStore(prev => ({...prev, submitted: true, toast: toastState('Report submitted — Harbor Pt · Unit 12')}));
  };

  // Slot footer press — the mandatory non-gesture path per state.
  const onSlotFooterPress = (slotId: string, opener: HTMLElement) => {
    const status = store.slots[slotId].status;
    if (status === 'missing') {
      openViewfinder(slotId, opener);
    } else if (status === 'flagged') {
      openAnnotate(slotId, opener);
    } else {
      menuOpenerRef.current = opener;
      patch({slotMenuId: store.slotMenuId === slotId ? null : slotId, jumpMenuOpen: false, snagMenuId: null});
    }
  };

  const onSlotMenuAction = (slotId: string, action: 'retake' | 'flag' | 'view') => {
    if (action === 'flag') openAnnotate(slotId, menuOpenerRef.current);
    else openViewfinder(slotId, menuOpenerRef.current);
  };

  // Zone jump — scrollIntoView (auto behavior) + focus the zone's first
  // tile button.
  const jumpToZone = (zone: ZoneFixture) => {
    patch({jumpMenuOpen: false});
    railRefs.current[zone.code]?.scrollIntoView({block: 'start'});
    footerBtnRefs.current[zone.slotIds[0]]?.focus({preventScroll: true});
  };

  // Report missing-chip → Checklist, scroll the slot into view, focus its
  // Capture button (effect above completes it after the tab renders).
  const jumpToSlot = (slotId: string) => {
    pendingSlotFocus.current = slotId;
    selectTab('checklist');
  };

  const scrollTop = () => {
    const scroller = getScrollParent(shellRef.current);
    if (scroller != null) scroller.scrollTop = 0;
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(store.openSheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const h1ByTab: Record<TabId, string> = {
    checklist: 'Checklist — Harbor Point Unit 12',
    snags: 'Snags — Harbor Point Unit 12',
    report: 'Report — Harbor Point Unit 12',
    sites: 'Sites',
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SNAGLINE_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — hairline always on (noted per contract). */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="sgl-btn sgl-focusable"
              style={styles.iconBtn}
              aria-label="Snagline — scroll to top"
              onClick={scrollTop}>
              <SnaglineMark />
            </button>
          </div>
          <span style={styles.navTitle}>{SITE_TITLE}</span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="sgl-btn sgl-focusable"
              style={styles.iconBtn}
              aria-label={\`\${tot.done} of \${tot.total} shots done, \${tot.pct} percent complete — open report\`}
              onClick={() => selectTab('report')}>
              <CompletionRing size={28} done={tot.done} total={tot.total} />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <h1 className="sgl-vh">{h1ByTab[store.tab]}</h1>

          {store.tab === 'checklist' ? (
            <>
              {/* SUMMARY STRIP — 52px; counts re-derive from the store. */}
              <div style={styles.summaryStrip}>
                <span style={styles.summaryCounts}>
                  {tot.captured} passed · {tot.flagged} snag{tot.flagged === 1 ? '' : 's'} · {tot.missing} missing
                </span>
                <button
                  type="button"
                  className="sgl-btn sgl-focusable"
                  style={styles.jumpPillHit}
                  aria-expanded={store.jumpMenuOpen}
                  aria-haspopup="menu"
                  onClick={event => {
                    menuOpenerRef.current = event.currentTarget;
                    patch({jumpMenuOpen: !store.jumpMenuOpen, slotMenuId: null, snagMenuId: null});
                  }}>
                  <span style={styles.jumpPill}>
                    Jump to zone
                    <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                  </span>
                </button>
                {store.jumpMenuOpen ? (
                  <div
                    ref={jumpMenuRef}
                    role="menu"
                    aria-label="Jump to zone"
                    style={styles.jumpMenu}
                    onKeyDown={event => {
                      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                      event.preventDefault();
                      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
                      const index = items.indexOf(document.activeElement as HTMLElement);
                      const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
                      items[(next + items.length) % items.length]?.focus();
                    }}>
                    {ZONES.map((zone, index) => {
                      const counts = zoneCounts(zone, store.slots);
                      return (
                        <div key={zone.code}>
                          {index > 0 ? <div style={styles.rowDivider} /> : null}
                          <button
                            type="button"
                            role="menuitem"
                            className="sgl-btn sgl-focusable"
                            style={styles.menuRow}
                            onClick={() => jumpToZone(zone)}>
                            <span style={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                              {zone.name}
                            </span>
                            <span style={styles.menuRowMeta}>
                              {counts.done}/{counts.total}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              {/* CAPTURE GRID — per zone: sticky rail + 2-up tile grid. */}
              {ZONES.map(zone => (
                <section key={zone.code} style={{marginBottom: 12}}>
                  <ZoneRail
                    zone={zone}
                    slots={store.slots}
                    railRef={el => {
                      railRefs.current[zone.code] = el;
                    }}
                  />
                  <div style={styles.grid}>
                    {zone.slotIds.map(id => (
                      <CaptureSlot
                        key={id}
                        fixture={SLOT_FIXTURES[id]}
                        slot={store.slots[id]}
                        menuOpen={store.slotMenuId === id}
                        tileRef={el => {
                          tileRefs.current[id] = el;
                        }}
                        footerBtnRef={el => {
                          footerBtnRefs.current[id] = el;
                        }}
                        onOpenViewfinder={opener => openViewfinder(id, opener)}
                        onFooterPress={opener => onSlotFooterPress(id, opener)}
                        onMenuAction={action => onSlotMenuAction(id, action)}
                      />
                    ))}
                  </div>
                </section>
              ))}
              <div style={styles.endSpacer} />
            </>
          ) : null}

          {store.tab === 'snags' ? (
            <>
              <h2 style={styles.sectionHeader}>Open snags ({flagged.length})</h2>
              {flagged.length === 0 ? (
                // Empty state per anatomy: fact title, what-fills-it body.
                <div style={{maxWidth: 280, marginInline: 'auto', paddingBlock: 48, textAlign: 'center'}}>
                  <span
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 999,
                      background: 'var(--color-background-muted)',
                      display: 'grid',
                      placeItems: 'center',
                      marginInline: 'auto',
                      color: 'var(--color-text-secondary)',
                    }}>
                    <Icon icon={FlagIcon} size="lg" color="inherit" />
                  </span>
                  <p style={{margin: '16px 0 0', fontSize: 17, fontWeight: 600}}>No open snags</p>
                  <p style={{margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)'}}>
                    Shots you flag in the viewfinder appear here.
                  </p>
                </div>
              ) : (
                <div style={styles.listCard}>
                  {flagged.map((id, index) => {
                    const fixture = SLOT_FIXTURES[id];
                    const slot = store.slots[id];
                    return (
                      <div key={id} style={{position: 'relative'}}>
                        {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                        <div style={styles.row}>
                          <span style={{...styles.snagThumb, background: slotGradient(id)}} aria-hidden />
                          <span style={styles.rowText}>
                            <span style={styles.rowPrimary}>{slot.defect ?? slot.note}</span>
                            <span className="sgl-clamp2" style={{...styles.rowSecondary, whiteSpace: 'normal'}}>
                              {id} · {slot.severity}
                              {slot.note != null ? \` — \${slot.note}\` : ''}
                            </span>
                          </span>
                          <button
                            type="button"
                            className="sgl-btn sgl-focusable"
                            style={{...styles.iconBtn, color: 'var(--color-text-secondary)', flexShrink: 0}}
                            aria-label={\`Actions for snag \${id}\`}
                            aria-expanded={store.snagMenuId === id}
                            onClick={event => {
                              menuOpenerRef.current = event.currentTarget;
                              patch({snagMenuId: store.snagMenuId === id ? null : id, slotMenuId: null, jumpMenuOpen: false});
                            }}>
                            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
                          </button>
                        </div>
                        {store.snagMenuId === id ? (
                          <div
                            role="menu"
                            aria-label={\`Snag \${id}\`}
                            style={{...styles.jumpMenu, top: 60, right: 8, zIndex: 18}}>
                            <button
                              type="button"
                              role="menuitem"
                              className="sgl-btn sgl-focusable"
                              style={styles.menuRow}
                              onClick={() => resolveSnag(id)}>
                              Mark resolved
                            </button>
                            <div style={styles.rowDivider} />
                            <button
                              type="button"
                              role="menuitem"
                              className="sgl-btn sgl-focusable"
                              style={styles.menuRow}
                              onClick={event => openAnnotate(id, event.currentTarget)}>
                              View snag
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={styles.endSpacer} />
            </>
          ) : null}

          {store.tab === 'report' ? (
            <>
              {store.submitted ? (
                <div style={{...styles.submittedBanner, marginTop: 12}}>
                  <span style={{color: BRAND_ACCENT, display: 'grid', placeItems: 'center'}} aria-hidden>
                    <Icon icon={CheckIcon} size="md" color="inherit" />
                  </span>
                  Report submitted — {SITE_TITLE}
                </div>
              ) : null}
              <div style={{...styles.reportCard, marginTop: store.submitted ? 0 : 12}}>
                <CompletionRing size={64} done={tot.done} total={tot.total} label={\`\${tot.pct}%\`} />
                <div style={styles.reportCounts}>
                  <span style={{fontSize: 16, fontWeight: 600}}>
                    {tot.done} of {tot.total} shots done
                  </span>
                  <span style={styles.rowSecondary}>
                    {tot.captured} passed / {tot.flagged} snag{tot.flagged === 1 ? '' : 's'} / {tot.missing} missing
                  </span>
                </div>
              </div>

              <h2 style={styles.sectionHeader}>Missing shots ({tot.missing})</h2>
              {missing.length === 0 ? (
                <p style={{...styles.rowSecondary, margin: 0, paddingInline: 32}}>Every required shot is captured.</p>
              ) : (
                <div style={styles.chipWrap}>
                  {missing.map(id => (
                    <button
                      key={id}
                      type="button"
                      className="sgl-btn sgl-focusable"
                      style={styles.chipHit}
                      aria-label={\`Capture missing shot \${id}\`}
                      onClick={() => jumpToSlot(id)}>
                      <span style={styles.chip}>{id}</span>
                    </button>
                  ))}
                </div>
              )}

              <h2 style={styles.sectionHeader}>Open snags ({flagged.length})</h2>
              {flagged.length === 0 ? (
                <p style={{...styles.rowSecondary, margin: 0, paddingInline: 32}}>No open snags.</p>
              ) : (
                <div style={styles.listCard}>
                  {flagged.map((id, index) => {
                    const slot = store.slots[id];
                    return (
                      <div key={id}>
                        {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                        <button
                          type="button"
                          className="sgl-btn sgl-focusable"
                          style={styles.row}
                          aria-label={\`View snag \${id}: \${slot.defect ?? ''}\`}
                          onClick={event => openAnnotate(id, event.currentTarget)}>
                          <span style={{...styles.snagThumb, background: slotGradient(id)}} aria-hidden />
                          <span style={styles.rowText}>
                            <span style={styles.rowPrimary}>{slot.defect ?? slot.note}</span>
                            <span style={styles.rowSecondary}>
                              {id} · {slot.severity} · {slot.capturedAt}
                            </span>
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Sticky submit footer — button ALWAYS enabled pre-submit;
                  the permanent reason row hides only at 0/0. */}
              <div style={styles.reportFooter}>
                {/* Permanent reason row — plain text (the toastDock is the
                    ONE live region; a role=status here would be a second). */}
                {reason != null && !store.submitted ? (
                  <span style={styles.reasonRow}>
                    {reason}
                    {store.submittedAttempt > 0 ? (
                      <span
                        key={store.submittedAttempt}
                        className="sgl-pulse"
                        style={{...styles.reasonPulse, opacity: 0}}
                        aria-hidden
                      />
                    ) : null}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="sgl-btn sgl-focusable"
                  style={{...styles.primaryBtn, ...(store.submitted ? {opacity: 0.5} : null)}}
                  disabled={store.submitted}
                  onClick={submitReport}>
                  {store.submitted ? 'Submitted' : 'Submit report'}
                </button>
              </div>
            </>
          ) : null}

          {store.tab === 'sites' ? (
            <>
              <h2 style={styles.sectionHeader}>Sites ({SITES.length})</h2>
              <div style={styles.listCard}>
                {SITES.map((site, index) => {
                  // Harbor Point derives LIVE from the store; the rest are
                  // static fixtures (marked as such in the fixture block).
                  const done = site.done ?? tot.done;
                  const pct = site.done == null ? tot.pct : Math.round((site.done / site.total) * 100);
                  const isLive = site.done == null;
                  return (
                    <div key={site.id}>
                      {index > 0 ? <div style={{...styles.rowDivider, marginInlineStart: 56}} /> : null}
                      <button
                        type="button"
                        className="sgl-btn sgl-focusable"
                        style={styles.row}
                        aria-label={\`\${site.name}, \${done} of \${site.total} shots, \${pct} percent\`}
                        onClick={() =>
                          isLive
                            ? selectTab('checklist')
                            : showToast(\`\${site.name.split(' — ')[0]} is a read-only fixture — \${SITE_TITLE} is live\`)
                        }>
                        <CompletionRing size={28} done={done} total={site.total} />
                        <span style={styles.rowText}>
                          <span style={styles.rowPrimary}>{site.name}</span>
                          <span style={styles.rowSecondary}>
                            {done}/{site.total} shots · {pct}%
                          </span>
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div style={styles.endSpacer} />
            </>
          ) : null}
        </main>

        {/* THE one polite live region — sticky-in-flow above the tabBar;
            absolute bottom:76 only while a sheet locks the shell. */}
        <div
          style={{...styles.toastDock, ...(store.openSheet != null ? styles.toastDockLocked : null)}}
          aria-live="polite">
          {store.toast != null ? (
            <div key={store.toast.seq} style={styles.toast} className="sgl-fade">
              <span style={styles.toastText}>{store.toast.text}</span>
              {store.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="sgl-btn sgl-focusable" style={styles.toastUndo} onClick={undoToast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <TabBar active={store.tab} snagCount={flagged.length} onSelect={selectTab} />

        {/* SHEETS — scrim z40 + sheet z41; never stacked (Flag-instead
            REPLACES the viewfinder with the annotation sheet). */}
        {store.openSheet != null ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {store.openSheet?.kind === 'viewfinder' && sheetFixture != null && sheetSlot != null ? (
          <SheetFrame
            titleId="sgl-vf-title"
            title={\`Viewfinder — \${sheetFixture.id}\`}
            detent={store.sheetDetent}
            onDetentChange={detent => patch({sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            footer={
              <>
                <button
                  type="button"
                  className="sgl-btn sgl-focusable"
                  style={styles.primaryBtn}
                  onClick={() => commitCapture(sheetFixture.id)}>
                  Capture
                </button>
                {sheetSlot.status !== 'flagged' ? (
                  <button
                    type="button"
                    className="sgl-btn sgl-focusable"
                    style={styles.flagInsteadBtn}
                    onClick={() => openAnnotate(sheetFixture.id, null)}>
                    Flag as snag instead
                  </button>
                ) : null}
              </>
            }>
            <ViewfinderBody fixture={sheetFixture} slot={sheetSlot} />
          </SheetFrame>
        ) : null}
        {store.openSheet?.kind === 'annotate' && sheetFixture != null && sheetSlot != null ? (
          <SheetFrame
            titleId="sgl-an-title"
            title={\`Flag as snag — \${sheetFixture.id}\`}
            detent={store.sheetDetent}
            onDetentChange={detent => patch({sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            footer={
              <button type="button" className="sgl-btn sgl-focusable" style={styles.primaryBtn} onClick={saveSnag}>
                Save snag
              </button>
            }>
            {/* Stamped preview — 96px gradient swatch under the 32px
                StampBar variant. */}
            <div style={{position: 'relative', height: 96, borderRadius: 12, overflow: 'hidden', background: slotGradient(sheetFixture.id)}}>
              <StampBar
                time={sheetSlot.capturedAt ?? DEMO_STAMP}
                zoneCode={sheetFixture.zoneCode}
                kind="snag"
                height={32}
              />
            </div>
            <div style={styles.formField}>
              <span style={styles.fieldLabel} id="sgl-sev-label">
                Severity
              </span>
              <div
                role="radiogroup"
                aria-labelledby="sgl-sev-label"
                style={styles.segTrack}
                onKeyDown={event => {
                  const index = SEVERITIES.indexOf(store.annotate.severity);
                  let next = index;
                  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % SEVERITIES.length;
                  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
                    next = (index + SEVERITIES.length - 1) % SEVERITIES.length;
                  else return;
                  event.preventDefault();
                  const severity = SEVERITIES[next];
                  setStore(prev => ({...prev, annotate: {...prev.annotate, severity}}));
                  const radios = event.currentTarget.querySelectorAll<HTMLElement>('button');
                  radios[next]?.focus();
                }}>
                {SEVERITIES.map(severity => {
                  const isActive = severity === store.annotate.severity;
                  return (
                    <button
                      key={severity}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      tabIndex={isActive ? 0 : -1}
                      className="sgl-btn sgl-focusable"
                      style={{...styles.segBtn, ...(isActive ? styles.segBtnActive : null)}}
                      onClick={() => setStore(prev => ({...prev, annotate: {...prev.annotate, severity}}))}>
                      {severity}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={styles.formField}>
              <label style={styles.fieldLabel} htmlFor="sgl-note">
                Snag note
              </label>
              <input
                id="sgl-note"
                ref={noteInputRef}
                className="sgl-input"
                type="text"
                value={store.annotate.note}
                placeholder="Describe the snag"
                aria-invalid={store.annotate.error}
                aria-describedby={store.annotate.error ? 'sgl-note-error' : undefined}
                style={{
                  ...styles.noteInput,
                  boxShadow: store.annotate.error
                    ? 'inset 0 0 0 2px var(--color-error)'
                    : undefined,
                }}
                onChange={event => {
                  const note = event.target.value;
                  // The error clears the moment the value becomes valid.
                  setStore(prev => ({
                    ...prev,
                    annotate: {...prev.annotate, note, error: prev.annotate.error && note.trim() === ''},
                  }));
                }}
                onBlur={event => {
                  // Validation fires on blur, never per keystroke.
                  if (event.target.value.trim() === '') {
                    setStore(prev => ({...prev, annotate: {...prev.annotate, error: true}}));
                  }
                }}
              />
              {store.annotate.error ? (
                <span id="sgl-note-error" style={styles.fieldError}>
                  <Icon icon={FlagIcon} size="sm" color="inherit" />
                  Describe the snag
                </span>
              ) : null}
            </div>
          </SheetFrame>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};