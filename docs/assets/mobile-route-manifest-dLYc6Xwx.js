var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Parceline Route 12 for courier Maya
 *   Reyes (Van 2214, shift start 8:40 AM): 23 stops with dual-field
 *   identity (address + recipient), per-stop package counts summing to
 *   exactly 41 (stops 1–7 = 12, stops 8–23 = 29), delivery windows
 *   generated as 9:00 AM + (n−1)×15 min → start+30, and per-stop drift
 *   deltas whose attempted sum is the navBar's '+8 min' pill. Initial
 *   statuses: stops 1–3 and 5–7 delivered, stop 4 failed ('No safe drop —
 *   signature required'), stops 8–23 pending → progress 7/23, packages
 *   10/41 delivered, 2 in exceptions, 29 remaining (10+2+29 = 41 ✓). No
 *   Date.now(), no Math.random(), no real maps or photos — stylized SVG
 *   polyline + id-derived gradients only.
 * @output Parceline — Route Manifest: a 390px MOBILE courier surface. A
 *   52px navBar carries the live 7/23 route fraction and an ETA-drift
 *   pill ('+8 min', a 44×44 hit that jumps to the Shift tab); the Route
 *   tab pins an 'Up next' heroCard (stop 8 · 2205 Harrow Ln · Delivered
 *   48px primary) above a ManifestScrubber (role=slider SVG route
 *   polyline, 23 nodes, brand fill through the attempted count, 44×44
 *   prev/next chevrons) and a full-bleed StopRail of 60px stop nodes
 *   (spine dots, package pips, drift ticks, swipe-right +72px Delivered
 *   block with a mandatory 44×44 ellipsis fallback). A 4-tab bar routes
 *   Scan (package rows + search), Exceptions (failed stops + Retry), and
 *   Shift (2×2 derived statGrid) through ONE route store — every
 *   aggregate (fraction, drift, rail fill, badge, hero promotion) is
 *   re-derived per render, never a cached counter. Delivering stop 8
 *   moves 7 surfaces in one commit and offers exact-restore Undo via the
 *   sticky toast dock; failed attempts land in Exceptions whose Retry
 *   re-queues the stop as the next hero.
 * @position Page template; emitted by \`astryx template mobile-route-manifest\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the
 *   first pixel). All overlays (scrim, sheets, action sheet, HUD) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While a
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close. The toast dock is sticky-in-flow (bottom:76,
 *   above the 64px tabBar) per the batch-2 amendment — shell-absolute
 *   toasts pin to the document bottom on tall scrolling views.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers) for Scan/Exceptions/Shift; the StopRail
 *   is the one full-bleed feed (the 40px spine IS the left-edge
 *   treatment, dividers inset 56px past it). No desktop frames, no side
 *   asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Parceline green, darkened for light-mode fill
 *   contrast); sanctioned non-brand literals are the ETA-pill late/early
 *   pairs, the error fill pair, the pending-node/rest-stroke pairs
 *   (amendment: interactive boundaries + meaningful rest fills need
 *   ≥3:1 vs their ACTUAL surface), and the photo-caption scrim — each
 *   with contrast math at the declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', always-on bottom
 *   hairline — declared choice); tabBar 64px sticky bottom z20, 4 tabs,
 *   24px icon over 11px/500 label; heroCard sticky top:52 z15; rows 44px
 *   utility (Shift) / 60px two-line (stops, exceptions, next-stop
 *   groups) / 72px media (Scan, 48px thumb @ 12px radius); StopRail rows
 *   exactly 60px with a 40px leading spine zone, dividers inset 56;
 *   sectionHeader 13px/600 uppercase 0.06em at 32px, 20px top / 8px
 *   bottom; sheet detents 55% / calc(100% − 56px), 24px grabber zone
 *   with 36×5 pill, 52px sheet header; actionSheet insetInline 16 bottom
 *   16, 56px rows, separate Cancel card; toastDock sticky bottom 76 z30.
 *   TYPE (Figtree via --font-family-body): 28/700 large titles · 22/700
 *   hero address (2-line clamp) · 17/600 nav+sheet titles · 16/400–500
 *   body floor · 13 meta · 11/500 overlines+tab labels; nothing under
 *   11px; tabular-nums on every count, time, id, and drift figure.
 *   Touch: every target ≥44×44 with ≥8px clearance or merged full-row;
 *   every gesture (swipe-reveal, scrubber drag, sheet drag, long-press)
 *   has a visible button path.
 *
 * Responsive contract:
 * - Fluid 320–430px: heroCard/listCards stretch minus 16px gutters;
 *   statGrid stays 'repeat(2, 1fr)' (tabular 22px figures hold one
 *   line); hero meta row flex-wraps at 320; scrubber SVG is width:100%
 *   with pointer mapping via getBoundingClientRect so ~13.9px/node at
 *   320 still resolves (merged role=slider keeps it legal); swipe snap
 *   stays +72px absolute. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the manifest anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  ClockIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  RouteIcon,
  ScanLineIcon,
  SearchIcon,
  SearchXIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal. Parceline green #0CA678 darkened to
// #0B8A66 for light mode so white-on-brand passes: #FFFFFF on #0B8A66 =
// 4.6:1. Dark-mode fill #3ADBA6 takes ink text: #10241C on #3ADBA6 =
// 8.9:1. As TEXT: #0B8A66 on the white card ≈ 4.6:1; #3ADBA6 on the dark
// card (~#1C1C1E) ≈ 9.4:1 — both clear 4.5:1.
const BRAND_ACCENT = 'light-dark(#0B8A66, #3ADBA6)';
// Text over a BRAND_ACCENT fill (math above: 4.6:1 light / 8.9:1 dark).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #10241C)';
// Brand-tinted wash for active-ish chips (never text-bearing alone).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// ETA-drift pill, LATE: #B3261E on #FDECEC = 5.9:1; #F2B8B5 on #3B1E1E =
// 7.3:1 — both pass 4.5:1 for the 13px/600 figure.
const LATE_BG = 'light-dark(#FDECEC, #3B1E1E)';
const LATE_TEXT = 'light-dark(#B3261E, #F2B8B5)';
// ETA-drift pill, EARLY/ON-TIME: #086A50 on #E6F7F0 = 5.5:1; #7BE8C6 on
// #123328 ≈ 9.8:1.
const EARLY_BG = 'light-dark(#E6F7F0, #123328)';
const EARLY_TEXT = 'light-dark(#086A50, #7BE8C6)';
// Error fill (failed node, exceptions badge, swipe-fail block): text over
// it — #FFFFFF on #B3261E = 5.9:1; #350B09 on #F2B8B5 ≈ 9.6:1.
const ERROR_FILL = 'light-dark(#B3261E, #F2B8B5)';
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #350B09)';
// AMENDMENT (batch-2, binding): interactive control boundaries and
// meaningful rest-state fills need explicit pairs at ≥3:1 vs their
// ACTUAL surface — hairline/muted tokens are for passive separators only.
// Pending stop-node border on the body background: #8A9490 vs #FFFFFF =
// 3.2:1; #6B7A74 vs the dark surface ≈ 3.4:1 (non-text UI, ≥3:1 ✓).
const PENDING_NODE = 'light-dark(#8A9490, #6B7A74)';
// Remaining route segments (scrubber strip + rail spine) are meaningful
// rest fills (the un-run route), NOT passive separators, so they get the
// same ≥3:1 pair instead of var(--color-border).
const REST_STROKE = PENDING_NODE;
// Switch OFF track at rest (amendment class): #8A8F98 vs the white card ≈
// 3.2:1; #747E88 vs the dark card ≈ 3.6:1.
const OFF_TRACK = 'light-dark(#8A8F98, #747E88)';
// 'SIMULATED CAPTURE' caption scrim: white on rgba(0,0,0,0.45) over the
// worst-case gradient stop hsl(16 45% 62%) ≈ 4.8:1.
const PHOTO_SCRIM = 'rgba(0, 0, 0, 0.45)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// hero settle + sheet slide animations, reduced-motion guard. Transitions
// animate transform/opacity only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const PCL_CSS = \`
.pcl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.pcl-btn:disabled { cursor: default; }
.pcl-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.pcl-anim { transition: transform 200ms ease, opacity 200ms ease; }
@keyframes pcl-hero-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.pcl-hero-in { animation: pcl-hero-in 200ms ease; }
@keyframes pcl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.pcl-sheet-in { animation: pcl-sheet-in 200ms ease; }
.pcl-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.pcl-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@media (prefers-reduced-motion: reduce) {
  .pcl-anim { transition: none; }
  .pcl-hero-in, .pcl-sheet-in { animation: none; }
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
  // NAV BAR — 52px sticky top z20; paddingInline 8; grid '1fr auto 1fr'.
  // Bottom hairline ALWAYS ON (declared choice for this template).
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
  navCenter: {
    maxWidth: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  navTitle: {fontSize: 17, fontWeight: 600, lineHeight: 1.15, whiteSpace: 'nowrap'},
  navFraction: {
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.15,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ETA-drift pill — 28px pill inside a 44×44+ hit that opens Shift.
  driftHit: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  driftPill: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 13,
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
    flexShrink: 0,
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // HERO CARD — sticky top:52 z15 pins below the navBar.
  heroCard: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  heroTextBlock: {display: 'flex', flexDirection: 'column', gap: 4},
  heroOverline: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  heroAddress: {fontSize: 22, fontWeight: 700, lineHeight: 1.2, margin: 0},
  heroRecipient: {fontSize: 13, color: 'var(--color-text-secondary)'},
  heroMetaRow: {display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'},
  heroWindow: {
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  heroEta: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  heroBtnRow: {display: 'flex', alignItems: 'center', gap: 8},
  heroPrimaryBtn: {
    flex: 1,
    minWidth: 0,
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // Route-complete card replaces the hero at 23/23 (stress fixture 5).
  completeIconCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    color: BRAND_ACCENT,
    alignSelf: 'center',
  },
  completeTitle: {fontSize: 22, fontWeight: 700, textAlign: 'center', margin: 0},
  completeBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // MANIFEST SCRUBBER — 64px card under the hero.
  scrubberCard: {
    marginInline: 16,
    marginTop: 12,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 2,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
  },
  scrubStrip: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    height: 44,
    display: 'grid',
    alignItems: 'center',
    borderRadius: 8,
    touchAction: 'none',
  },
  scrubHud: {
    position: 'absolute',
    top: -38,
    transform: 'translateX(-50%)',
    zIndex: 25,
    padding: '6px 10px',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'none',
  },
  // SECTION HEADER — 13/600 uppercase 0.06em at 32px, 20px top / 8px bottom.
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
  // Completed-section 44px disclosure row.
  disclosureRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
  },
  // STOP RAIL — full-bleed feed; the 40px spine zone is the left-edge
  // treatment. Rows exactly 60px; dividers inset 56 (past the spine).
  railRowOuter: {position: 'relative'},
  railClip: {position: 'relative', overflow: 'hidden'},
  railSwipeBlock: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  railRowContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-body)',
    touchAction: 'pan-y',
  },
  railRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    paddingInlineEnd: 8,
  },
  spineZone: {width: 40, height: 60, flexShrink: 0},
  railText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    paddingInlineStart: 8,
  },
  railPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  railSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  railDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 56},
  terminalCaption: {
    margin: '16px 0 8px',
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // Large-title row — 52px block, 28/700 at the 16px gutter.
  largeTitleRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitle: {fontSize: 28, fontWeight: 700, margin: 0},
  // SEARCH — 52px searchBar, 36px searchField.
  searchBar: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  searchField: {
    flex: 1,
    minWidth: 0,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    fontSize: 16,
    color: 'var(--color-text-primary)',
    outline: 'none',
    padding: 0,
  },
  searchClear: {
    width: 44,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // Scan 72px media rows — 48px id-gradient thumb @ 12px radius.
  mediaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 72,
    paddingInline: 16,
  },
  pkgThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
  },
  pkgText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  pkgId: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pkgMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  scanBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    color: 'var(--color-text-primary)',
  },
  scannedTag: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
    height: 36,
  },
  // 60px two-line rows (exceptions, next-stop groups) inside listCards.
  row60: {
    width: '100%',
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  rowText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, paddingBlock: 10},
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
  rowErrorText: {
    fontSize: 13,
    color: 'var(--color-error)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  retryBtn: {
    height: 44,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    color: 'var(--color-text-primary)',
  },
  // 44px utility rows (Shift).
  row44: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  row44Value: {
    marginLeft: 'auto',
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // EMPTY STATE — centered block per foundations.
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyIconCircle: {
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
  emptyBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    marginTop: 4,
    marginBottom: 16,
  },
  emptyAction: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  // STAT GRID — 2×2, 12px gap, derived tabular 22/700 figures.
  statGrid: {
    marginInline: 16,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  },
  statTile: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // SKELETON — 60px rail-geometry rows; deterministic staggered widths.
  skeletonRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skelDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  skelBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // TOAST DOCK — sticky-in-flow above the 64px tabBar (amendment: NOT
  // shell-absolute; the shell grows with content so absolute bottom pins
  // to the document bottom, off-viewport on tall views).
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toast: {
    minHeight: 48,
    maxWidth: '100%',
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
  toastUndoBtn: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // TAB BAR — 64px sticky bottom z20, 4 tabs.
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
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: 1},
  tabLabelActive: {fontWeight: 600},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: ERROR_FILL,
    color: ERROR_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // OVERLAYS — scrim z40; actionSheet / sheet z41; absolute inside shell.
  sheetScrim: {position: 'absolute', inset: 0, zIndex: 40, background: SCRIM},
  actionSheetWrap: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  actionCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  actionHeader: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  actionRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  actionRowDestructive: {color: 'var(--color-error)'},
  cancelRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  actionDivider: {height: 1, background: 'var(--color-border)'},
  // PROOF SHEET — two detents, own inner scroller, sticky footer.
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
    gap: 12,
  },
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  confirmBtn: {
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
  proofScene: {
    width: '100%',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    display: 'block',
  },
  photoSlot: {
    position: 'relative',
    width: '100%',
    aspectRatio: '3 / 2',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoCaption: {
    position: 'absolute',
    top: 8,
    left: 8,
    padding: '3px 8px',
    borderRadius: 999,
    background: PHOTO_SCRIM,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
  },
  secondaryBtn: {
    height: 44,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
    alignSelf: 'start',
  },
  sigCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sigEmpty: {
    height: 64,
    borderRadius: 8,
    border: \`1px dashed \${PENDING_NODE}\`,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  sigActions: {display: 'flex', justifyContent: 'flex-end'},
  sigBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  // 44px switch rows — whole row is the role=switch button.
  switchRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 16,
  },
  switchLabel: {flex: 1, minWidth: 0, textAlign: 'left'},
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    flexShrink: 0,
    position: 'relative',
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
// FIXTURES — deterministic by law. ARITHMETIC CROSS-CHECK (verified by hand):
// package counts, stops 1–7: 2+1+3+2+1+2+1 = 12; stops 8–23:
// 3+2+1+2+2+1+3+1+2+2+1+3+2+1+2+1 = 29; TOTAL = 41. Initial statuses:
// stops 1–3 & 5–7 delivered (6), stop 4 failed, stops 8–23 pending (16) →
// delivered packages = 12 − 2 (stop 4) = 10, exception packages = 2,
// pending = 29; 10+2+29 = 41 ✓. Route drift = attempted deltas
// 2−1+3+0+2−1+3 = +8 min. Stop 8 ETA = 10:45 + 8 = 10:53; after stop 8
// delivers, drift 8−3 = +5 → stop 9 ETA 11:00 + 5 = 11:05.
// ---------------------------------------------------------------------------

const COURIER = {name: 'Maya Reyes', vehicle: 'Van 2214', route: 'Route 12', shiftStart: '8:40 AM'};

const STOP_COUNT = 23;
const TOTAL_PACKAGES = 41;

// Stop 15 is the long-address stress (single-line ellipsis in the 60px
// row, 2-line clamp in the 22px hero — stress fixture 1).
const STREETS: string[] = [
  '1042 Fenwick Rd',
  '318 Mercer Ave',
  '77 Copeland St',
  '1418 Alder Ct',
  '905 Whitfield Dr',
  '22 Larkspur Way',
  '604 Bramble Ln',
  '2205 Harrow Ln',
  '130 Ostend Pl',
  '48 Quarry Rd',
  '811 Delmore Ave',
  '356 Kestrel Ct',
  '1290 Vance St',
  '67 Pemberly Rd',
  '503 Tarrowbrook Landing Apartments, Bldg C',
  '940 Ellison Dr',
  '215 Fairholm Ave',
  '1780 Sable Ct',
  '32 Norcross Way',
  '688 Halden Rd',
  '1509 Ivywood Ln',
  '254 Garner St',
  '870 Westlake Dr',
];

const RECIPIENTS: string[] = [
  'S. Whitcombe',
  'R. Marchetti',
  'L. Adeyemi',
  'P. Kowalczyk',
  'M. Tran',
  'H. Lindqvist',
  'J. Barros',
  'D. Okafor',
  'A. Fitzwilliam',
  'N. Castellanos',
  'T. Nakamura',
  'E. Szabo',
  'C. Beaumont',
  'I. Petrov',
  'G. Ellison',
  'F. Duarte',
  'K. Mwangi',
  'B. Hollis',
  'V. Raman',
  'O. Grady',
  'W. Sandoval',
  'Y. Cormier',
  'Z. Whitaker',
];

// Package pips per stop (1→23). 3-pkg stops: 3, 8, 14, 19 — four rows
// prove the pip stack fits the 40px spine (stress fixture 3).
const PKGS: number[] = [2, 1, 3, 2, 1, 2, 1, 3, 2, 1, 2, 2, 1, 3, 1, 2, 2, 1, 3, 2, 1, 2, 1];

// Drift deltas per stop (1→23). Early (negative → tick leans left):
// stops 2, 6, 8, 12, 16, 19, 22. Exactly zero (4px dot): stops 4, 10, 14,
// 17, 21 — the spec prose listed stop 13 here, but the binding delta
// array has stop 13 = +1 and stop 14 = 0; the array is kept exact and the
// prose corrected (noted deviation).
const DELTAS: number[] = [2, -1, 3, 0, 2, -1, 3, -3, 1, 0, 2, -2, 1, 0, 3, -1, 0, 2, -2, 1, 0, -1, 2];

const FAIL_REASON_INITIAL = 'No safe drop — signature required';
const FAIL_REASON_NEW = 'Recipient unavailable';

interface StopFixture {
  id: number;
  address: string;
  recipient: string;
  pkgs: number;
  windowStartMin: number; // minutes since midnight; window = start → start+30
  driftDelta: number;
}

// windowStart(n) = 9:00 AM + (n−1)×15 min → stop 1 '9:00–9:30 AM',
// stop 8 '10:45–11:15 AM', stop 9 '11:00–11:30 AM', stop 23 '2:30–3:00 PM'.
const STOPS: StopFixture[] = STREETS.map((address, i) => ({
  id: i + 1,
  address,
  recipient: RECIPIENTS[i],
  pkgs: PKGS[i],
  windowStartMin: 540 + i * 15,
  driftDelta: DELTAS[i],
}));

const STOP_BY_ID: Record<number, StopFixture> = Object.fromEntries(STOPS.map(stop => [stop.id, stop]));

interface PackageFixture {
  id: string;
  stopId: number;
  shelf: string;
}

// Package id = PL-(1000 + stopId×37)-A/B/C → stop 8: PL-1296-A/B/C.
// Shelf codes are id-derived (letter + digit), deterministic.
const PKG_LETTERS = ['A', 'B', 'C'];
const SHELF_LETTERS = ['B', 'C', 'D', 'A'];

function packagesFor(stopId: number): PackageFixture[] {
  const count = STOP_BY_ID[stopId].pkgs;
  const packages: PackageFixture[] = [];
  for (let k = 0; k < count; k++) {
    packages.push({
      id: \`PL-\${1000 + stopId * 37}-\${PKG_LETTERS[k]}\`,
      stopId,
      shelf: \`\${SHELF_LETTERS[(stopId + k) % 4]}\${((stopId * 3 + k) % 4) + 1}\`,
    });
  }
  return packages;
}

const ALL_PACKAGES: PackageFixture[] = STOPS.flatMap(stop => packagesFor(stop.id));

// Proof photo gradient hue H = (stopId × 47) % 360 → stop 8: 376 % 360 =
// 16 (warm clay). 'Retake' regenerates with H+180 — still deterministic.
function proofGradient(stopId: number, retaken: boolean): string {
  const h = ((stopId * 47) % 360) + (retaken ? 180 : 0);
  return \`linear-gradient(135deg, hsl(\${h} 45% 62%), hsl(\${h + 40} 40% 48%))\`;
}

// Pre-inked signature scribble — one hardcoded path, never freehand.
const SIG_PATH =
  'M8 40 C 20 8, 34 8, 44 34 C 50 48, 58 20, 70 30 C 82 40, 88 18, 104 30 C 116 39, 128 26, 142 32';

// Deterministic skeleton bar widths (primary / secondary), rail geometry.
const SKELETON_BARS: Array<[string, string]> = [
  ['60%', '40%'],
  ['45%', '55%'],
  ['70%', '30%'],
  ['60%', '40%'],
];

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Minutes-since-midnight → '10:45' (no suffix). */
function fmtClock(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return \`\${h12}:\${String(m).padStart(2, '0')}\`;
}

function suffixFor(min: number): 'AM' | 'PM' {
  return Math.floor(min / 60) >= 12 ? 'PM' : 'AM';
}

/** Minutes-since-midnight → '10:45 AM'. */
function fmtTime(min: number): string {
  return \`\${fmtClock(min)} \${suffixFor(min)}\`;
}

/** 30-min window → '10:45–11:15 AM' (suffix collapsed when shared). */
function fmtWindow(startMin: number): string {
  const endMin = startMin + 30;
  if (suffixFor(startMin) === suffixFor(endMin)) {
    return \`\${fmtClock(startMin)}–\${fmtTime(endMin)}\`;
  }
  return \`\${fmtTime(startMin)}–\${fmtTime(endMin)}\`;
}

/** Drift minutes → '+8 min' / '-2 min' / 'on time'. */
function driftLabel(drift: number): string {
  if (drift === 0) return 'on time';
  return \`\${drift > 0 ? '+' : '-'}\${Math.abs(drift)} min\`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useRouteStore(): a flat entity map + one update(id,
// patch). EVERY aggregate (fraction, drift pill, rail fill, exceptions
// badge, hero promotion, statGrid) is DERIVED in render from STOPS +
// status/order — no cached counters anywhere. Undo restores an exact
// snapshot of {stops, order} (derived-not-cached is the round-trip test:
// +8 → +5 → +8 → +5, stress fixture 7).
// ---------------------------------------------------------------------------

type Tab = 'route' | 'scan' | 'exceptions' | 'shift';
type StopStatus = 'pending' | 'delivered' | 'failed';

interface StopMut {
  status: StopStatus;
  reason: string | null;
}

interface RouteSnapshot {
  stops: Record<number, StopMut>;
  order: number[];
}

interface ToastState {
  seq: number;
  text: string;
  undo: RouteSnapshot | null;
}

interface ProofState {
  retaken: boolean;
  sigCleared: boolean;
  door: boolean;
  handed: boolean;
  code: boolean;
}

interface UiState {
  tab: Tab;
  sheet: 'action' | 'proof' | null;
  sheetStopId: number | null;
  sheetDetent: 'medium' | 'large';
  openSwipeId: number | null;
  completedOpen: boolean;
  scanQuery: string;
  scrubPos: number | null; // 1-based route position; null = follow hero
  pendingScrollId: number | null;
  refresh: 'idle' | 'loading' | 'done';
  proof: ProofState;
  toast: ToastState | null;
}

interface RouteEntities {
  stops: Record<number, StopMut>;
  order: number[]; // route order; Retry re-queues a stop before the first pending
  scanned: Record<string, boolean>;
  ui: UiState;
}

const INITIAL_PROOF: ProofState = {retaken: false, sigCleared: false, door: true, handed: false, code: false};

const INITIAL_ENTITIES: RouteEntities = {
  stops: Object.fromEntries(
    STOPS.map(stop => {
      const status: StopStatus = stop.id <= 3 || (stop.id >= 5 && stop.id <= 7) ? 'delivered' : stop.id === 4 ? 'failed' : 'pending';
      return [stop.id, {status, reason: status === 'failed' ? FAIL_REASON_INITIAL : null}];
    }),
  ),
  order: STOPS.map(stop => stop.id),
  scanned: {},
  ui: {
    tab: 'route',
    sheet: null,
    sheetStopId: null,
    sheetDetent: 'large',
    openSwipeId: null,
    completedOpen: false,
    scanQuery: '',
    scrubPos: null,
    pendingScrollId: null,
    refresh: 'idle',
    proof: INITIAL_PROOF,
    toast: null,
  },
};

function useRouteStore() {
  const [entities, setEntities] = useState<RouteEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof RouteEntities>(id: K, patch: Partial<RouteEntities[K]>) => {
      setEntities(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );
  return {entities, update, setEntities};
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

// Focus trap for sheets/action sheets — Tab cycles within; Escape handled
// by the page-level layering handler (topmost only).
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns the page scroll. */
function getScrollParent(el: HTMLElement | null): Element {
  let node: HTMLElement | null = el?.parentElement ?? null;
  while (node != null) {
    const overflowY = window.getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return document.scrollingElement ?? document.documentElement;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 28×28 Parceline route monoline: three 5px stop dots joined
// by a curved 2px stroke ending in an arrowhead.
// ---------------------------------------------------------------------------

function ParcelineMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" style={{color: BRAND_ACCENT}} aria-hidden>
        <path
          d="M6 22 C 12 22, 8 14, 14 14 C 20 14, 16.5 6.5, 21.5 6"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path d="M18.5 4.5 L 22.5 5.9 L 20 9" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx={6} cy={22} r={2.5} fill="currentColor" />
        <circle cx={14} cy={14} r={2.5} fill="currentColor" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SPINE GLYPH — the 40px leading zone of every StopRail row: (a) 12px node
// dot at x=28 (pending: 2px PENDING_NODE border, hollow — 3.2:1 vs the
// light body / 3.4:1 vs dark, amendment math at the literal; delivered:
// brand fill + check; failed: error fill + '!'), (b) package-count pips
// (1–3 stacked 4px dots), (c) drift tick — 10px stroke leaning 30° left of
// vertical when early, right when late, a 4px dot at zero, (d) connecting
// 2px line halves (brand when the segment is run, REST_STROKE when not).
// All aria-hidden — the row's aria-label carries the data.
// ---------------------------------------------------------------------------

type LineTone = 'done' | 'rest' | 'none';

interface SpineGlyphProps {
  status: StopStatus;
  pkgs: number;
  delta: number;
  topTone: LineTone;
  bottomTone: LineTone;
}

function toneColor(tone: LineTone): string {
  return tone === 'done' ? BRAND_ACCENT : REST_STROKE;
}

function SpineGlyph({status, pkgs, delta, topTone, bottomTone}: SpineGlyphProps) {
  // Drift tick endpoints: 10px stroke at ±30° from vertical (sin30·5 =
  // 2.5, cos30·5 ≈ 4.33). Early → top leans left; late → top leans right.
  const lean = delta < 0 ? -2.5 : 2.5;
  return (
    <svg width={40} height={60} viewBox="0 0 40 60" fill="none" style={{flexShrink: 0, display: 'block'}} aria-hidden>
      {topTone !== 'none' ? <rect x={27} y={0} width={2} height={23} fill={toneColor(topTone)} /> : null}
      {bottomTone !== 'none' ? <rect x={27} y={37} width={2} height={23} fill={toneColor(bottomTone)} /> : null}
      {status === 'pending' ? (
        <circle cx={28} cy={30} r={5} fill="var(--color-background-body)" stroke={PENDING_NODE} strokeWidth={2} />
      ) : (
        <circle cx={28} cy={30} r={6} fill={status === 'delivered' ? BRAND_ACCENT : ERROR_FILL} />
      )}
      {status === 'delivered' ? (
        <path d="M25.4 30.2 L 27.4 32.2 L 30.8 27.8" stroke={BRAND_FILL_TEXT} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      {status === 'failed' ? (
        <>
          <rect x={27.3} y={26.5} width={1.4} height={4.6} rx={0.7} fill={ERROR_FILL_TEXT} />
          <circle cx={28} cy={33.2} r={0.9} fill={ERROR_FILL_TEXT} />
        </>
      ) : null}
      {Array.from({length: pkgs}, (_, i) => (
        <circle key={i} cx={37} cy={30 + (i - (pkgs - 1) / 2) * 7} r={2} fill={PENDING_NODE} />
      ))}
      {delta === 0 ? (
        <circle cx={13} cy={30} r={2} fill={REST_STROKE} />
      ) : (
        <path
          d={\`M \${13 - lean} \${30 - 4.33} L \${13 + lean} \${30 + 4.33}\`}
          stroke={delta < 0 ? BRAND_ACCENT : 'var(--color-error)'}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// STOP ROW — 60px full-row <button> named by address. Pending rows swipe
// RIGHT to a +72px snap revealing a LEFT brand 'Delivered' block (this
// template's one swipe direction); MANDATORY fallback = trailing 44×44
// ellipsis opening the same stopActionSheet. Long-press (450ms, cancel at
// 8px move) opens the sheet too — garnish; the ellipsis is the contract.
// ---------------------------------------------------------------------------

interface StopRowProps {
  stop: StopFixture;
  mut: StopMut;
  position: number;
  etaMin: number | null;
  topTone: LineTone;
  bottomTone: LineTone;
  isSwipeOpen: boolean;
  showDivider: boolean;
  reducedMotion: boolean;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onDeliverSwipe: () => void;
  onRowTap: (opener: HTMLElement) => void;
}

function StopRow({
  stop,
  mut,
  position,
  etaMin,
  topTone,
  bottomTone,
  isSwipeOpen,
  showDivider,
  reducedMotion,
  onSwipeOpen,
  onSwipeClose,
  onDeliverSwipe,
  onRowTap,
}: StopRowProps) {
  const isPending = mut.status === 'pending';
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const longPressRef = useRef<number | null>(null);
  const longFiredRef = useRef(false);
  const rowBtnRef = useRef<HTMLButtonElement | null>(null);
  const base = isSwipeOpen ? 72 : 0;
  const offset = dragX != null ? Math.max(0, Math.min(72, base + dragX)) : base;

  const clearLongPress = () => {
    if (longPressRef.current != null) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isPending) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    longFiredRef.current = false;
    setDragX(0);
    event.currentTarget.setPointerCapture(event.pointerId);
    clearLongPress();
    longPressRef.current = window.setTimeout(() => {
      longFiredRef.current = true;
      if (rowBtnRef.current != null) onRowTap(rowBtnRef.current);
    }, 450);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - startXRef.current;
    if (Math.abs(dx) > 8) {
      movedRef.current = true;
      clearLongPress();
    }
    setDragX(dx);
  };
  const onPointerUp = () => {
    clearLongPress();
    if (dragX == null) return;
    const settled = Math.max(0, Math.min(72, base + dragX));
    setDragX(null);
    if (movedRef.current) {
      if (settled > 36) onSwipeOpen();
      else onSwipeClose();
    }
  };

  const guardClick = (handler: (opener: HTMLElement) => void) => (event: {currentTarget: HTMLElement}) => {
    if (movedRef.current || longFiredRef.current) {
      movedRef.current = false;
      longFiredRef.current = false;
      return;
    }
    handler(event.currentTarget);
  };

  const secondary =
    mut.status === 'failed'
      ? mut.reason ?? ''
      : mut.status === 'delivered'
        ? \`Delivered · window \${fmtWindow(stop.windowStartMin)}\`
        : \`window \${fmtWindow(stop.windowStartMin)} · \${stop.pkgs} pkg\${stop.pkgs === 1 ? '' : 's'}\${
            etaMin != null ? \` · ETA \${fmtClock(etaMin)}\` : ''
          }\`;
  const ariaLabel = \`\${stop.address}, stop \${position} of \${STOP_COUNT}, \${stop.pkgs} package\${
    stop.pkgs === 1 ? '' : 's'
  }, window \${fmtWindow(stop.windowStartMin)}\${mut.status === 'failed' ? \`, failed: \${mut.reason ?? ''}\` : ''}\${
    mut.status === 'delivered' ? ', delivered' : ''
  }\`;

  return (
    <div style={styles.railRowOuter} id={\`pcl-stop-\${stop.id}\`}>
      <div style={styles.railClip}>
        {isPending ? (
          <button
            type="button"
            className="pcl-btn"
            style={styles.railSwipeBlock}
            tabIndex={isSwipeOpen ? 0 : -1}
            aria-hidden={!isSwipeOpen}
            onClick={onDeliverSwipe}>
            <Icon icon={CheckIcon} size="md" color="inherit" />
            Delivered
          </button>
        ) : null}
        <div
          style={{
            ...styles.railRowContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 200ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            ref={rowBtnRef}
            className="pcl-btn pcl-focusable"
            style={styles.railRowBtn}
            aria-label={ariaLabel}
            onClick={guardClick(onRowTap)}>
            <span style={styles.spineZone}>
              <SpineGlyph status={mut.status} pkgs={stop.pkgs} delta={stop.driftDelta} topTone={topTone} bottomTone={bottomTone} />
            </span>
            <span style={styles.railText}>
              <span style={styles.railPrimary}>{stop.address}</span>
              <span style={mut.status === 'failed' ? styles.rowErrorText : styles.railSecondary}>{secondary}</span>
            </span>
          </button>
          {isPending ? (
            <button
              type="button"
              className="pcl-btn pcl-focusable"
              style={styles.iconBtn}
              aria-label={\`Actions for \${stop.address}\`}
              onClick={guardClick(onRowTap)}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </button>
          ) : null}
        </div>
      </div>
      {showDivider ? <div style={styles.railDivider} /> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MANIFEST SCRUBBER — 64px card: stylized SVG route polyline (23 nodes at
// x = 10 + i·20, deterministic wave, Catmull-Rom segments — NOT a map),
// brand-stroked through the attempted count, up-next node ringed. ONE
// focusable role='slider' control (merged-target clause covers the
// 20px-per-node hits); pointer drag maps clientX → nearest stop and
// scrolls its rail row into view while a HUD chip floats above the touch
// x. MANDATORY button path: flanking 44×44 prev/next chevrons; arrow keys
// and Home/End when the slider is focused.
// ---------------------------------------------------------------------------

const SCRUB_WAVE = [-7, -11, -3, 5, 11, 3];
const SCRUB_PTS: Array<{x: number; y: number}> = Array.from({length: STOP_COUNT}, (_, i) => ({
  x: 10 + i * 20,
  y: 20 + SCRUB_WAVE[i % SCRUB_WAVE.length],
}));

/** Catmull-Rom → cubic Bezier for segment i → i+1. */
function scrubSegPath(i: number): string {
  const p0 = SCRUB_PTS[Math.max(0, i - 1)];
  const p1 = SCRUB_PTS[i];
  const p2 = SCRUB_PTS[i + 1];
  const p3 = SCRUB_PTS[Math.min(STOP_COUNT - 1, i + 2)];
  const c1x = p1.x + (p2.x - p0.x) / 6;
  const c1y = p1.y + (p2.y - p0.y) / 6;
  const c2x = p2.x - (p3.x - p1.x) / 6;
  const c2y = p2.y - (p3.y - p1.y) / 6;
  return \`M \${p1.x} \${p1.y} C \${c1x.toFixed(1)} \${c1y.toFixed(1)}, \${c2x.toFixed(1)} \${c2y.toFixed(1)}, \${p2.x} \${p2.y}\`;
}

interface ScrubberProps {
  orderedIds: number[];
  fill: number; // attempted count → brand segments 1..fill
  currentPos: number; // 1-based, aria-valuenow
  onScrub: (pos: number) => void;
  onStep: (dir: -1 | 1) => void;
}

function ManifestScrubber({orderedIds, fill, currentPos, onScrub, onStep}: ScrubberProps) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [hud, setHud] = useState<{x: number; pos: number} | null>(null);
  const upNextIndex = fill < STOP_COUNT ? fill : -1; // 0-based index of the up-next node
  const currentAddress = STOP_BY_ID[orderedIds[currentPos - 1]].address;

  const posFromClientX = (clientX: number): number => {
    const rect = stripRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return currentPos;
    const frac = (clientX - rect.left) / rect.width;
    return Math.max(1, Math.min(STOP_COUNT, Math.round(frac * (STOP_COUNT - 1)) + 1));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const pos = posFromClientX(event.clientX);
    const rect = event.currentTarget.getBoundingClientRect();
    setHud({x: event.clientX - rect.left, pos});
    onScrub(pos);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (hud == null) return;
    const pos = posFromClientX(event.clientX);
    const rect = event.currentTarget.getBoundingClientRect();
    setHud({x: event.clientX - rect.left, pos});
    if (pos !== currentPos) onScrub(pos);
  };
  const onPointerUp = () => setHud(null);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onStep(-1);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onStep(1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      onScrub(1);
    } else if (event.key === 'End') {
      event.preventDefault();
      onScrub(STOP_COUNT);
    }
  };

  const caretX = SCRUB_PTS[currentPos - 1].x;
  return (
    <div style={styles.scrubberCard}>
      <button type="button" className="pcl-btn pcl-focusable" style={styles.iconBtn} aria-label="Previous stop" onClick={() => onStep(-1)}>
        <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
      </button>
      <div
        ref={stripRef}
        role="slider"
        tabIndex={0}
        className="pcl-focusable"
        aria-label="Route scrubber"
        aria-valuemin={1}
        aria-valuemax={STOP_COUNT}
        aria-valuenow={currentPos}
        aria-valuetext={\`Stop \${currentPos} · \${currentAddress}\`}
        style={styles.scrubStrip}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}>
        <svg width="100%" height={40} viewBox="0 0 460 40" preserveAspectRatio="none" aria-hidden style={{display: 'block'}}>
          {Array.from({length: STOP_COUNT - 1}, (_, i) => (
            <path
              key={i}
              d={scrubSegPath(i)}
              stroke={i < fill ? BRAND_ACCENT : REST_STROKE}
              strokeWidth={i < fill ? 3 : 2}
              fill="none"
              strokeLinecap="round"
            />
          ))}
          {SCRUB_PTS.map((pt, i) =>
            i === upNextIndex ? (
              <circle key={i} cx={pt.x} cy={pt.y} r={5} fill="var(--color-background-card)" stroke={BRAND_ACCENT} strokeWidth={2} />
            ) : (
              <circle key={i} cx={pt.x} cy={pt.y} r={3} fill={i < fill ? BRAND_ACCENT : REST_STROKE} />
            ),
          )}
          <path d={\`M \${caretX - 5} 1 L \${caretX + 5} 1 L \${caretX} 8 Z\`} fill="var(--color-text-primary)" />
        </svg>
        {hud != null ? (
          <div style={{...styles.scrubHud, left: hud.x}}>{STOP_BY_ID[orderedIds[hud.pos - 1]].address}</div>
        ) : null}
      </div>
      <button type="button" className="pcl-btn pcl-focusable" style={styles.iconBtn} aria-label="Next stop" onClick={() => onStep(1)}>
        <Icon icon={ChevronRightIcon} size="md" color="inherit" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STOP ACTION SHEET — the verb picker: context header, centered no-icon
// 56px rows, destructive LAST ('Report attempt failed' — reversible ⇒ NO
// confirm dialog, executes + Undo), separate Cancel card. First focus =
// Cancel (the safe default). role=dialog, focus trapped, restored by the
// page on every close path.
// ---------------------------------------------------------------------------

interface StopActionSheetProps {
  stop: StopFixture;
  position: number;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDelivered: () => void;
  onOpenProof: () => void;
  onViewPackages: () => void;
  onFail: () => void;
  onClose: () => void;
}

function StopActionSheet({stop, position, sheetRef, onDelivered, onOpenProof, onViewPackages, onFail, onClose}: StopActionSheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pcl-action-header"
      tabIndex={-1}
      className="pcl-sheet-in"
      style={styles.actionSheetWrap}
      onKeyDown={event => trapTabKey(event, sheetRef.current)}>
      <div style={styles.actionCard}>
        <div id="pcl-action-header" style={styles.actionHeader}>
          {stop.address} · Stop {position} of {STOP_COUNT}
        </div>
        <div style={styles.actionDivider} />
        <button type="button" className="pcl-btn pcl-focusable" style={styles.actionRow} onClick={onDelivered}>
          Delivered
        </button>
        <div style={styles.actionDivider} />
        <button type="button" className="pcl-btn pcl-focusable" style={styles.actionRow} onClick={onOpenProof}>
          Open proof of delivery
        </button>
        <div style={styles.actionDivider} />
        <button type="button" className="pcl-btn pcl-focusable" style={styles.actionRow} onClick={onViewPackages}>
          View packages ({stop.pkgs})
        </button>
        <div style={styles.actionDivider} />
        <button
          type="button"
          className="pcl-btn pcl-focusable"
          style={{...styles.actionRow, ...styles.actionRowDestructive}}
          onClick={onFail}>
          Report attempt failed
        </button>
      </div>
      <div style={styles.actionCard}>
        <button type="button" id="pcl-action-cancel" className="pcl-btn pcl-focusable" style={styles.cancelRow} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PROOF CHECKLIST — content of the proofSheet. (1) Stylized SVG porch
// scene (flat token geometry — explicitly NOT a photo). (2) 3:2 photo
// slot: id-derived gradient + 'SIMULATED CAPTURE' scrim pill; Retake
// regenerates at H+180. (3) Pre-inked SVG signature with Clear / Re-ink —
// no freehand canvas. (4) Three 44px whole-row switches (51×31 tracks;
// OFF track is the amendment-compliant OFF_TRACK pair, ≥3:1 vs the card).
// ---------------------------------------------------------------------------

interface ProofChecklistProps {
  stop: StopFixture;
  proof: ProofState;
  onPatch: (patch: Partial<ProofState>) => void;
}

const PROOF_SWITCHES: Array<{key: 'door' | 'handed' | 'code'; label: string}> = [
  {key: 'door', label: 'Left at door'},
  {key: 'handed', label: 'Handed to recipient'},
  {key: 'code', label: 'One-time code verified'},
];

function ProofChecklist({stop, proof, onPatch}: ProofChecklistProps) {
  return (
    <>
      <svg viewBox="0 0 358 160" style={styles.proofScene} role="img" aria-label={\`Stylized porch illustration for \${stop.address}\`}>
        <rect x={0} y={0} width={358} height={160} fill="var(--color-background-body)" />
        {/* Roofline + posts */}
        <path d="M20 56 L 179 18 L 338 56" stroke="var(--color-border)" strokeWidth={3} fill="none" strokeLinejoin="round" />
        <rect x={34} y={56} width={4} height={84} fill="var(--color-border)" />
        <rect x={320} y={56} width={4} height={84} fill="var(--color-border)" />
        {/* Door on its frame */}
        <rect x={140} y={48} width={78} height={92} rx={3} fill="var(--color-background-muted)" stroke="var(--color-border)" strokeWidth={2} />
        <rect x={152} y={60} width={54} height={30} rx={2} fill="none" stroke="var(--color-border)" strokeWidth={1.5} />
        <circle cx={206} cy={100} r={3} fill="var(--color-text-secondary)" />
        {/* Porch deck */}
        <rect x={20} y={140} width={318} height={4} fill="var(--color-border)" />
        {/* The Parceline parcel at the doorstep */}
        <rect x={228} y={118} width={26} height={22} rx={2} fill={BRAND_ACCENT} />
        <rect x={239} y={118} width={4} height={22} fill={BRAND_FILL_TEXT} opacity={0.55} />
      </svg>
      <div>
        <div style={{...styles.photoSlot, background: proofGradient(stop.id, proof.retaken)}}>
          <span style={styles.photoCaption}>SIMULATED CAPTURE</span>
        </div>
        <button
          type="button"
          className="pcl-btn pcl-focusable"
          style={{...styles.secondaryBtn, marginTop: 8}}
          onClick={() => onPatch({retaken: !proof.retaken})}>
          Retake
        </button>
      </div>
      <div style={styles.sigCard}>
        {proof.sigCleared ? (
          <div style={styles.sigEmpty}>No signature on file</div>
        ) : (
          <svg viewBox="0 0 150 56" style={{width: '100%', height: 64, display: 'block'}} aria-label={\`Signature on file for \${stop.recipient}\`} role="img">
            <path d={SIG_PATH} stroke="var(--color-text-primary)" strokeWidth={2} fill="none" strokeLinecap="round" />
          </svg>
        )}
        <div style={styles.sigActions}>
          <button
            type="button"
            className="pcl-btn pcl-focusable"
            style={styles.sigBtn}
            onClick={() => onPatch({sigCleared: !proof.sigCleared})}>
            {proof.sigCleared ? 'Re-ink' : 'Clear'}
          </button>
        </div>
      </div>
      <div>
        {PROOF_SWITCHES.map((row, index) => {
          const checked = proof[row.key];
          return (
            <div key={row.key}>
              {index > 0 ? <div style={{...styles.rowDivider, marginInlineStart: 0}} /> : null}
              <button
                type="button"
                role="switch"
                aria-checked={checked}
                className="pcl-btn pcl-focusable"
                style={styles.switchRow}
                onClick={() => onPatch({[row.key]: !checked} as Partial<ProofState>)}>
                <span style={styles.switchLabel}>{row.label}</span>
                <span style={{...styles.switchTrack, background: checked ? BRAND_ACCENT : OFF_TRACK}} aria-hidden>
                  <span
                    className="pcl-anim"
                    style={{...styles.switchThumb, transform: checked ? 'translateX(20px)' : undefined}}
                  />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// PROOF SHEET CHROME — two detents (LARGE default per spec), 24px grabber
// zone whose 36×5 pill is a real 'Resize sheet' button, 52px header with
// 44×44 X, inner overflowY:auto body (the one legal inner scroller),
// sticky footer with the 48px 'Confirm delivery' primary.
// ---------------------------------------------------------------------------

interface ProofSheetProps {
  stop: StopFixture;
  detent: 'medium' | 'large';
  proof: ProofState;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onProofPatch: (patch: Partial<ProofState>) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function ProofSheet({stop, detent, proof, sheetRef, reducedMotion, onDetentChange, onProofPatch, onConfirm, onClose}: ProofSheetProps) {
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
      aria-labelledby="pcl-proof-title"
      tabIndex={-1}
      className="pcl-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease',
      }}>
      <button
        type="button"
        className="pcl-btn pcl-focusable"
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
        <h2 id="pcl-proof-title" style={styles.sheetTitle}>
          Proof of delivery
        </h2>
        <button type="button" className="pcl-btn pcl-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <ProofChecklist stop={stop} proof={proof} onPatch={onProofPatch} />
      </div>
      <div style={styles.sheetFooter}>
        <button type="button" className="pcl-btn pcl-focusable" style={styles.confirmBtn} onClick={onConfirm}>
          Confirm delivery
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TABS: Array<{id: Tab; label: string; icon: typeof RouteIcon}> = [
  {id: 'route', label: 'Route', icon: RouteIcon},
  {id: 'scan', label: 'Scan', icon: ScanLineIcon},
  {id: 'exceptions', label: 'Exceptions', icon: TriangleAlertIcon},
  {id: 'shift', label: 'Shift', icon: ClockIcon},
];

export default function MobileRouteManifestTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {entities, update, setEntities} = useRouteStore();
  const {stops, order, scanned, ui} = entities;

  // Focus plumbing — opener restored on every close path.
  const proofSheetRef = useRef<HTMLDivElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const overlayOpenerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);
  // Per-tab scroll positions — recorded on exit, restored on entry.
  const scrollPosRef = useRef<Record<Tab, number>>({route: 0, scan: 0, exceptions: 0, shift: 0});

  // DERIVED — every aggregate re-computes from STOPS + status/order.
  const attemptedIds = order.filter(id => stops[id].status !== 'pending');
  const attemptedCount = attemptedIds.length;
  const pendingIds = order.filter(id => stops[id].status === 'pending');
  const failedIds = order.filter(id => stops[id].status === 'failed');
  // Route drift = sum of deltas over ATTEMPTED stops (initially
  // 2−1+3+0+2−1+3 = +8).
  const drift = attemptedIds.reduce((sum, id) => sum + STOP_BY_ID[id].driftDelta, 0);
  const deliveredPkgs = order
    .filter(id => stops[id].status === 'delivered')
    .reduce((sum, id) => sum + STOP_BY_ID[id].pkgs, 0);
  const exceptionPkgs = failedIds.reduce((sum, id) => sum + STOP_BY_ID[id].pkgs, 0);
  const heroId = pendingIds.length > 0 ? pendingIds[0] : null;
  const heroStop = heroId != null ? STOP_BY_ID[heroId] : null;
  const heroPos = heroId != null ? order.indexOf(heroId) + 1 : STOP_COUNT;
  const scrubPos = ui.scrubPos ?? heroPos;
  const railFill = attemptedCount; // brand segments of 22 (7/22 at rest)
  // ETA of a pending stop = its windowStart + current route drift.
  const etaFor = (id: number): number => STOP_BY_ID[id].windowStartMin + drift;

  const toastPatch = (text: string, undo: RouteSnapshot | null) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undo}};
  };
  const showToast = (text: string) => update('ui', toastPatch(text, null));
  // NO auto-dismiss timers — the toast persists until Undo, replacement,
  // or the next mutation (undoOverConfirm law).

  // OVERLAY LIFECYCLE ---------------------------------------------------------

  const openActionSheet = (stopId: number, opener: HTMLElement | null) => {
    overlayOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update('ui', {sheet: 'action', sheetStopId: stopId, openSwipeId: null});
  };
  // A sheet may not stack: the actionSheet closes and the proofSheet opens
  // in the same commit (close-then-open law).
  const openProofSheet = (stopId: number, opener?: HTMLElement | null) => {
    if (opener != null) overlayOpenerRef.current = opener;
    update('ui', {sheet: 'proof', sheetStopId: stopId, sheetDetent: 'large', proof: INITIAL_PROOF, openSwipeId: null});
  };
  const closeOverlay = () => {
    update('ui', {sheet: null, sheetStopId: null});
    overlayOpenerRef.current?.focus();
  };

  // Focus into an opening sheet uses preventScroll — plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen (batch-2 amendment).
  useEffect(() => {
    if (ui.sheet === 'proof') {
      proofSheetRef.current?.focus({preventScroll: true});
    } else if (ui.sheet === 'action') {
      // First focus = Cancel row (the safe default; destructive never first).
      actionSheetRef.current?.querySelector<HTMLElement>('#pcl-action-cancel')?.focus({preventScroll: true});
    }
  }, [ui.sheet]);

  // Escape closes the TOPMOST overlay only (proof and action never coexist).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.sheet != null) closeOverlay();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.sheet]);

  // TAB LIFECYCLE — per-tab scroll persists; open overlays close on switch
  // (they belong to their moment); the toast dock persists. Re-tapping the
  // active tab scrolls to top and closes any open swipe row — the one
  // legal reset.
  const switchTab = (tab: Tab) => {
    const scroller = getScrollParent(wrapRef.current);
    if (tab === ui.tab) {
      scroller.scrollTop = 0;
      update('ui', {openSwipeId: null});
      return;
    }
    scrollPosRef.current[ui.tab] = scroller.scrollTop;
    update('ui', {tab, sheet: null, sheetStopId: null, openSwipeId: null});
  };
  useEffect(() => {
    const scroller = getScrollParent(wrapRef.current);
    scroller.scrollTop = scrollPosRef.current[ui.tab];
  }, [ui.tab]);

  // Deferred scrollIntoView — runs after the row exists (the completed
  // section may need to expand first).
  useEffect(() => {
    if (ui.pendingScrollId == null) return;
    document.getElementById(\`pcl-stop-\${ui.pendingScrollId}\`)?.scrollIntoView({behavior: 'auto', block: 'center'});
    update('ui', {pendingScrollId: null});
  }, [ui.pendingScrollId, update]);

  const scrubTo = (pos: number) => {
    const clamped = Math.max(1, Math.min(STOP_COUNT, pos));
    const id = order[clamped - 1];
    update('ui', {
      scrubPos: clamped,
      pendingScrollId: id,
      completedOpen: stops[id].status !== 'pending' ? true : ui.completedOpen,
    });
  };

  // CONSEQUENCE CHAINS — one commit moves navBar fraction, drift pill,
  // rail fill, hero promotion, scrubber value, section counts, badge, and
  // statGrid together; Undo restores the exact snapshot.

  const deliverStop = (id: number) => {
    if (stops[id].status === 'delivered') return;
    const snapshot: RouteSnapshot = {stops, order};
    const newStops: Record<number, StopMut> = {...stops, [id]: {status: 'delivered', reason: null}};
    const driftAfter = order
      .filter(sid => newStops[sid].status !== 'pending')
      .reduce((sum, sid) => sum + STOP_BY_ID[sid].driftDelta, 0);
    const wasOverlay = ui.sheet != null;
    setEntities(prev => ({
      ...prev,
      stops: newStops,
      ui: {
        ...prev.ui,
        sheet: null,
        sheetStopId: null,
        openSwipeId: null,
        scrubPos: null,
        ...toastPatch(\`Stop \${id} delivered · \${driftLabel(driftAfter)} drift\`, snapshot),
      },
    }));
    if (wasOverlay) overlayOpenerRef.current?.focus();
  };

  // Reversible ⇒ NO confirm dialog: execute + Undo (undoOverConfirm law).
  const failStop = (id: number) => {
    if (stops[id].status !== 'pending') return;
    const snapshot: RouteSnapshot = {stops, order};
    const newStops: Record<number, StopMut> = {...stops, [id]: {status: 'failed', reason: FAIL_REASON_NEW}};
    setEntities(prev => ({
      ...prev,
      stops: newStops,
      ui: {
        ...prev.ui,
        sheet: null,
        sheetStopId: null,
        openSwipeId: null,
        scrubPos: null,
        ...toastPatch(\`Stop \${id} attempt failed · moved to Exceptions\`, snapshot),
      },
    }));
    overlayOpenerRef.current?.focus();
  };

  // Retry re-queues the stop as the NEW FIRST PENDING — the store owns
  // ordering; the hero, fraction, drift, and badge all rewind on the same
  // derived math path as Undo.
  const retryStop = (id: number) => {
    if (stops[id].status !== 'failed') return;
    const snapshot: RouteSnapshot = {stops, order};
    const newStops: Record<number, StopMut> = {...stops, [id]: {status: 'pending', reason: null}};
    const without = order.filter(sid => sid !== id);
    const firstPendingIdx = without.findIndex(sid => newStops[sid].status === 'pending');
    const insertAt = firstPendingIdx === -1 ? without.length : firstPendingIdx;
    const newOrder = [...without.slice(0, insertAt), id, ...without.slice(insertAt)];
    setEntities(prev => ({
      ...prev,
      stops: newStops,
      order: newOrder,
      ui: {...prev.ui, scrubPos: null, ...toastPatch(\`Stop \${id} re-queued as next stop\`, snapshot)},
    }));
  };

  const undoLast = () => {
    const snapshot = ui.toast?.undo;
    if (snapshot == null) return;
    setEntities(prev => ({
      ...prev,
      stops: snapshot.stops,
      order: snapshot.order,
      ui: {...prev.ui, scrubPos: null, ...toastPatch('Restored', null)},
    }));
  };

  const scanPackage = (pkgId: string) => {
    update('scanned', {[pkgId]: true});
    showToast(\`\${pkgId} scanned\`);
  };

  // Shift refresh — deterministic skeleton cycle: press 1 enters the
  // loading state ('Loading' announced ONCE, aria-busy list, shimmer-free
  // under reduced motion by construction — static muted blocks only);
  // press 2 on the same row resolves to the fixed 'Updated just now'.
  const onRefreshRow = () => {
    if (ui.refresh === 'loading') {
      update('ui', {refresh: 'done', ...toastPatch('Manifest updated just now', null)});
    } else {
      update('ui', {refresh: 'loading', ...toastPatch('Loading', null)});
    }
  };

  // Search announce — settled counts only (never per keystroke).
  const scanResults =
    ui.scanQuery.trim() === ''
      ? []
      : ALL_PACKAGES.filter(
          pkg => stops[pkg.stopId].status === 'pending' && pkg.id.toUpperCase().includes(ui.scanQuery.trim().toUpperCase()),
        );
  const announceResults = () => {
    if (ui.scanQuery.trim() === '') return;
    showToast(\`\${scanResults.length} result\${scanResults.length === 1 ? '' : 's'}\`);
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const sheetStop = ui.sheetStopId != null ? STOP_BY_ID[ui.sheetStopId] : null;
  const isLate = drift > 0;
  const driftPillStyle: CSSProperties = {
    ...styles.driftPill,
    background: isLate ? LATE_BG : EARLY_BG,
    color: isLate ? LATE_TEXT : EARLY_TEXT,
  };

  // Tablist arrow-key movement (radiogroup-style).
  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TABS.findIndex(tab => tab.id === ui.tab);
    const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
    switchTab(next.id);
    document.getElementById(\`pcl-tab-\${next.id}\`)?.focus();
  };

  // -------------------------------------------------------------------------
  // TAB CONTENT
  // -------------------------------------------------------------------------

  const renderRail = (ids: number[], zone: 'remaining' | 'completed') => (
    <div>
      {ids.map((id, index) => {
        const isFirst = index === 0;
        const isLast = index === ids.length - 1;
        // Line tones: completed rows run in brand; the first remaining
        // row's top half is the fill line reaching the up-next node
        // (segment attemptedCount of 22 is brand), the rest are the
        // amendment-compliant REST_STROKE (meaningful rest fill, ≥3:1).
        const topTone: LineTone = isFirst ? (zone === 'remaining' && attemptedCount > 0 ? 'done' : 'none') : zone === 'completed' ? 'done' : 'rest';
        const bottomTone: LineTone = isLast ? 'none' : zone === 'completed' ? 'done' : 'rest';
        return (
          <StopRow
            key={id}
            stop={STOP_BY_ID[id]}
            mut={stops[id]}
            position={order.indexOf(id) + 1}
            etaMin={stops[id].status === 'pending' ? etaFor(id) : null}
            topTone={topTone}
            bottomTone={bottomTone}
            isSwipeOpen={ui.openSwipeId === id}
            showDivider={!isLast}
            reducedMotion={reducedMotion}
            onSwipeOpen={() => update('ui', {openSwipeId: id})}
            onSwipeClose={() => {
              if (ui.openSwipeId === id) update('ui', {openSwipeId: null});
            }}
            onDeliverSwipe={() => deliverStop(id)}
            onRowTap={opener => {
              if (ui.openSwipeId != null) {
                update('ui', {openSwipeId: null});
                return;
              }
              if (stops[id].status === 'failed') {
                switchTab('exceptions'); // failed row deep-links to Exceptions
              } else if (stops[id].status === 'delivered') {
                openProofSheet(id, opener); // review the recorded proof
              } else {
                openActionSheet(id, opener);
              }
            }}
          />
        );
      })}
    </div>
  );

  const routeTab = (
    <>
      <h1 className="pcl-vh">Route manifest</h1>
      {heroStop != null ? (
        <section key={heroStop.id} className={reducedMotion ? undefined : 'pcl-hero-in'} style={styles.heroCard} aria-label={\`Up next: \${heroStop.address}\`}>
          <div style={styles.heroTextBlock}>
            <span style={styles.heroOverline}>
              UP NEXT — STOP {heroStop.id} OF {STOP_COUNT}
            </span>
            <div className="pcl-clamp2" style={styles.heroAddress}>
              {heroStop.address}
            </div>
            <span style={styles.heroRecipient}>
              {heroStop.recipient} · {heroStop.pkgs} package{heroStop.pkgs === 1 ? '' : 's'}
            </span>
          </div>
          <div style={styles.heroMetaRow}>
            <span style={styles.heroWindow}>Window {fmtWindow(heroStop.windowStartMin)}</span>
            <span style={styles.heroEta}>ETA {fmtClock(etaFor(heroStop.id))}</span>
          </div>
          <div style={styles.heroBtnRow}>
            <button type="button" className="pcl-btn pcl-focusable" style={styles.heroPrimaryBtn} onClick={() => deliverStop(heroStop.id)}>
              Delivered
            </button>
            <button
              type="button"
              className="pcl-btn pcl-focusable"
              style={styles.iconBtn}
              aria-label={\`More actions for \${heroStop.address}\`}
              onClick={event => openActionSheet(heroStop.id, event.currentTarget)}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </button>
          </div>
        </section>
      ) : (
        // ROUTE COMPLETE (stress fixture 5): 39 = 41 − 2 exception
        // packages while stop 4 stays failed — but the figure is DERIVED,
        // never hardcoded.
        <section style={{...styles.heroCard, position: 'static', gap: 8}} aria-label="Route complete">
          <span style={styles.completeIconCircle}>
            <Icon icon={CircleCheckIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.completeTitle}>Route complete</h2>
          <span style={styles.completeBody}>
            {deliveredPkgs} of {TOTAL_PACKAGES} delivered · {exceptionPkgs} in exceptions
          </span>
        </section>
      )}
      <ManifestScrubber orderedIds={order} fill={railFill} currentPos={scrubPos} onScrub={scrubTo} onStep={dir => scrubTo(scrubPos + dir)} />
      {pendingIds.length > 0 ? (
        <>
          <h2 style={styles.sectionHeader}>REMAINING — {pendingIds.length}</h2>
          {renderRail(pendingIds, 'remaining')}
        </>
      ) : null}
      <h2 style={styles.sectionHeader}>COMPLETED — {attemptedCount}</h2>
      <button type="button" className="pcl-btn pcl-focusable" style={styles.disclosureRow} aria-expanded={ui.completedOpen} onClick={() => update('ui', {completedOpen: !ui.completedOpen})}>
        <span
          className="pcl-anim"
          style={{display: 'inline-flex', transform: ui.completedOpen ? 'rotate(180deg)' : undefined}}>
          <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
        </span>
        {ui.completedOpen ? 'Hide completed stops' : \`Show \${attemptedCount} completed stops\`}
      </button>
      {ui.completedOpen ? renderRail(attemptedIds, 'completed') : null}
      <div style={styles.terminalCaption}>
        All {STOP_COUNT} stops · {TOTAL_PACKAGES} packages
      </div>
    </>
  );

  const heroPackages = heroId != null ? packagesFor(heroId) : [];
  const nextStopIds = pendingIds.slice(1, 3);
  const searching = ui.scanQuery.trim() !== '';

  const renderPackageRow = (pkg: PackageFixture, isLast: boolean) => {
    const isScanned = scanned[pkg.id] === true;
    return (
      <div key={pkg.id}>
        <div style={styles.mediaRow}>
          {/* 48px id-derived gradient thumb; the letter sits in the same
              0.45-black scrim pill as the photo caption (≈4.8:1). */}
          <span style={{...styles.pkgThumb, background: proofGradient(pkg.stopId, false)}} aria-hidden>
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: PHOTO_SCRIM,
                display: 'grid',
                placeItems: 'center',
                fontSize: 11,
                fontWeight: 700,
              }}>
              {pkg.id.slice(-1)}
            </span>
          </span>
          <span style={styles.pkgText}>
            <span style={styles.pkgId}>{pkg.id}</span>
            <span style={styles.pkgMeta}>
              {STOP_BY_ID[pkg.stopId].address} · shelf {pkg.shelf}
            </span>
          </span>
          {isScanned ? (
            <span style={styles.scannedTag}>
              <Icon icon={CheckIcon} size="sm" color="inherit" />
              Scanned
            </span>
          ) : (
            <button type="button" className="pcl-btn pcl-focusable" style={styles.scanBtn} onClick={() => scanPackage(pkg.id)}>
              Scan
            </button>
          )}
        </div>
        {isLast ? null : <div style={styles.rowDividerDeep} />}
      </div>
    );
  };

  const scanTab = (
    <>
      <div style={styles.largeTitleRow}>
        <h1 style={styles.largeTitle}>Scan</h1>
      </div>
      <div style={styles.searchBar}>
        <div style={styles.searchField}>
          <Icon icon={SearchIcon} size="sm" color="secondary" />
          <input
            type="search"
            aria-label="Search package ID"
            placeholder="Search package ID"
            style={styles.searchInput}
            value={ui.scanQuery}
            onChange={event => update('ui', {scanQuery: event.target.value})}
            onBlur={announceResults}
            onKeyDown={event => {
              if (event.key === 'Enter') announceResults();
              if (event.key === 'Escape' && ui.scanQuery !== '') {
                event.stopPropagation();
                update('ui', {scanQuery: ''});
              }
            }}
          />
          {searching ? (
            <button type="button" className="pcl-btn pcl-focusable" style={styles.searchClear} aria-label="Clear search" onClick={() => update('ui', {scanQuery: ''})}>
              <Icon icon={XIcon} size="sm" color="inherit" />
            </button>
          ) : null}
        </div>
      </div>
      {searching ? (
        scanResults.length === 0 ? (
          // FILTERED-EMPTY — echoes the query verbatim (stress fixture 6:
          // 'PL-9' matches nothing; every id is PL-1xxx).
          <div style={styles.emptyState}>
            <span style={styles.emptyIconCircle}>
              <Icon icon={SearchXIcon} size="lg" color="inherit" />
            </span>
            <h2 style={styles.emptyTitle}>No results for “{ui.scanQuery.trim()}”</h2>
            <p style={styles.emptyBody}>Package IDs look like PL-1296-A.</p>
            <button type="button" className="pcl-btn pcl-focusable" style={styles.emptyAction} onClick={() => update('ui', {scanQuery: ''})}>
              Clear search
            </button>
          </div>
        ) : (
          <div style={styles.listCard}>{scanResults.map((pkg, index) => renderPackageRow(pkg, index === scanResults.length - 1))}</div>
        )
      ) : heroStop != null ? (
        <>
          <h2 style={styles.sectionHeader}>
            STOP {heroStop.id} — {heroStop.address}
          </h2>
          <div style={styles.listCard}>{heroPackages.map((pkg, index) => renderPackageRow(pkg, index === heroPackages.length - 1))}</div>
          {nextStopIds.length > 0 ? (
            <>
              <h2 style={styles.sectionHeader}>NEXT STOPS</h2>
              <div style={styles.listCard}>
                {nextStopIds.map((id, index) => {
                  const stop = STOP_BY_ID[id];
                  return (
                    <div key={id}>
                      <button
                        type="button"
                        className="pcl-btn pcl-focusable"
                        style={styles.row60}
                        aria-label={\`\${stop.address}, \${stop.pkgs} packages — show on route\`}
                        onClick={() => {
                          switchTab('route');
                          update('ui', {pendingScrollId: id});
                        }}>
                        <span style={styles.rowText}>
                          <span style={styles.rowPrimary}>{stop.address}</span>
                          <span style={styles.rowSecondary}>
                            {stop.pkgs} pkg{stop.pkgs === 1 ? '' : 's'} · window {fmtWindow(stop.windowStartMin)}
                          </span>
                        </span>
                        <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
                      </button>
                      {index === nextStopIds.length - 1 ? null : <div style={styles.rowDivider} />}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </>
      ) : (
        // Exhausted stop groups after route completion (stress fixture 5).
        <div style={styles.emptyState}>
          <span style={styles.emptyIconCircle}>
            <Icon icon={CircleCheckIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.emptyTitle}>Nothing left to scan</h2>
          <p style={styles.emptyBody}>Every remaining stop has been attempted.</p>
        </div>
      )}
    </>
  );

  const exceptionsTab = (
    <>
      <div style={styles.largeTitleRow}>
        <h1 style={styles.largeTitle}>Exceptions</h1>
      </div>
      {failedIds.length === 0 ? (
        // TRUE-EMPTY variant — demonstrable by pressing Retry on stop 4
        // (stress fixture 4); the tab badge unmounts on the same commit.
        <div style={styles.emptyState}>
          <span style={styles.emptyIconCircle}>
            <Icon icon={CircleCheckIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.emptyTitle}>No exceptions</h2>
          <p style={styles.emptyBody}>Failed attempts land here with their reason.</p>
        </div>
      ) : (
        <div style={{...styles.listCard, marginTop: 4}}>
          {failedIds.map((id, index) => {
            const stop = STOP_BY_ID[id];
            return (
              <div key={id}>
                <div style={{...styles.row60, minHeight: 72}}>
                  <button
                    type="button"
                    className="pcl-btn pcl-focusable"
                    style={{...styles.rowText, textAlign: 'left'}}
                    aria-label={\`\${stop.address}, \${stop.pkgs} packages, \${stops[id].reason ?? ''} — show on route\`}
                    onClick={() => {
                      switchTab('route');
                      update('ui', {completedOpen: true, pendingScrollId: id});
                    }}>
                    <span style={styles.rowPrimary}>
                      Stop {stop.id} · {stop.address}
                    </span>
                    <span style={styles.rowSecondary}>
                      {stop.pkgs} pkg{stop.pkgs === 1 ? '' : 's'} · window {fmtWindow(stop.windowStartMin)}
                    </span>
                    <span style={styles.rowErrorText}>{stops[id].reason}</span>
                  </button>
                  <button type="button" className="pcl-btn pcl-focusable" style={styles.retryBtn} onClick={() => retryStop(id)}>
                    Retry
                  </button>
                </div>
                {index === failedIds.length - 1 ? null : <div style={styles.rowDivider} />}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  const shiftTab = (
    <>
      <div style={styles.largeTitleRow}>
        <h1 style={styles.largeTitle}>Shift</h1>
      </div>
      {/* Every figure re-derived from the store — tabular-nums 22/700. */}
      <div style={styles.statGrid}>
        <div style={styles.statTile}>
          <span style={styles.statValue}>
            {attemptedCount}/{STOP_COUNT}
          </span>
          <span style={styles.statLabel}>Stops</span>
        </div>
        <div style={styles.statTile}>
          <span style={styles.statValue}>
            {deliveredPkgs}/{TOTAL_PACKAGES}
          </span>
          <span style={styles.statLabel}>Packages delivered</span>
        </div>
        <div style={styles.statTile}>
          <span style={styles.statValue}>{failedIds.length}</span>
          <span style={styles.statLabel}>Exceptions</span>
        </div>
        <div style={styles.statTile}>
          <span style={{...styles.statValue, color: drift > 0 ? LATE_TEXT : EARLY_TEXT}}>{driftLabel(drift)}</span>
          <span style={styles.statLabel}>Drift</span>
        </div>
      </div>
      <h2 style={styles.sectionHeader}>SHIFT</h2>
      <div style={styles.listCard}>
        <div style={styles.row44}>
          Shift started
          <span style={styles.row44Value}>{COURIER.shiftStart}</span>
        </div>
        <div style={styles.rowDivider} />
        <div style={styles.row44}>
          Vehicle
          <span style={styles.row44Value}>{COURIER.vehicle}</span>
        </div>
        <div style={styles.rowDivider} />
        <div style={styles.row44}>
          Courier
          <span style={styles.row44Value}>{COURIER.name}</span>
        </div>
        <div style={styles.rowDivider} />
        <button type="button" className="pcl-btn pcl-focusable" style={{...styles.row44, color: BRAND_ACCENT, fontWeight: 600}} onClick={onRefreshRow}>
          <Icon icon={RefreshCwIcon} size="sm" color="inherit" />
          {ui.refresh === 'loading' ? 'Refreshing — press to finish' : 'Refresh manifest'}
          {ui.refresh === 'done' ? <span style={{...styles.row44Value, fontWeight: 400}}>Updated just now</span> : null}
        </button>
        {ui.refresh === 'loading' ? (
          <div aria-busy="true">
            {SKELETON_BARS.map(([primary, secondary], index) => (
              <div key={index} aria-hidden>
                <div style={styles.rowDivider} />
                <div style={styles.skeletonRow}>
                  <span style={styles.skelDot} />
                  <span style={styles.skelBars}>
                    <span style={{...styles.skelBar, width: primary}} />
                    <span style={{...styles.skelBar, width: secondary}} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{PCL_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <ParcelineMark />
          </div>
          <div style={styles.navCenter}>
            <span style={styles.navTitle}>{COURIER.route}</span>
            <span style={styles.navFraction}>
              {attemptedCount}/{STOP_COUNT} stops
            </span>
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="pcl-btn pcl-focusable"
              style={styles.driftHit}
              aria-label={\`Route drift \${driftLabel(drift)} — open shift summary\`}
              onClick={() => switchTab('shift')}>
              <span style={driftPillStyle}>{driftLabel(drift)}</span>
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {ui.tab === 'route' ? routeTab : null}
          {ui.tab === 'scan' ? scanTab : null}
          {ui.tab === 'exceptions' ? exceptionsTab : null}
          {ui.tab === 'shift' ? shiftTab : null}
          <div style={{height: 24}} />
        </main>

        {/* THE one polite live region — sticky-in-flow above the tabBar
            (amendment), persists across tab switches, no auto-dismiss. */}
        <div style={styles.toastDock} aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast}>
              <span style={styles.toastMsg}>{ui.toast.text}</span>
              {ui.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="pcl-btn pcl-focusable" style={styles.toastUndoBtn} onClick={undoLast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} role="tablist" aria-label="Sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const isActive = ui.tab === tab.id;
            return (
              <button
                key={tab.id}
                id={\`pcl-tab-\${tab.id}\`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="pcl-btn pcl-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                onClick={() => switchTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'exceptions' && failedIds.length > 0 ? <span style={styles.tabBadge}>{failedIds.length}</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {ui.sheet != null ? <div style={styles.sheetScrim} onClick={closeOverlay} aria-hidden /> : null}
        {ui.sheet === 'action' && sheetStop != null ? (
          <StopActionSheet
            stop={sheetStop}
            position={order.indexOf(sheetStop.id) + 1}
            sheetRef={actionSheetRef}
            onDelivered={() => deliverStop(sheetStop.id)}
            onOpenProof={() => openProofSheet(sheetStop.id)}
            onViewPackages={() => {
              closeOverlay();
              switchTab('scan');
            }}
            onFail={() => failStop(sheetStop.id)}
            onClose={closeOverlay}
          />
        ) : null}
        {ui.sheet === 'proof' && sheetStop != null ? (
          <ProofSheet
            stop={sheetStop}
            detent={ui.sheetDetent}
            proof={ui.proof}
            sheetRef={proofSheetRef}
            reducedMotion={reducedMotion}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onProofPatch={patch => update('ui', {proof: {...ui.proof, ...patch}})}
            onConfirm={() => deliverStop(sheetStop.id)}
            onClose={closeOverlay}
          />
        ) : null}
      </div>
    </div>
  );
}


`;export{e as default};