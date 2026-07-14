var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Wayline field-scout survey of
 *   "District 4 · Riverside grid": 5 quick actions (Pin, Note, Photo,
 *   Share, Route — one LucideIcon each), a 358×420 LOGICAL map coordinate
 *   space (6 columns A–F × 7 rows 1–7 for grid-cell refs), and 5 pre-seeded
 *   log entries whose cells are DERIVED from their coords by the same
 *   cellFor() the commit path uses (cross-check: (150,96)→C2, (284,262)→E5,
 *   (82,318)→B6, (216,154)→D3, (38,210)→A4 — col = floor(x/(358/6)),
 *   row = floor(y/60)+1). No Date.now(), no Math.random(), no network
 *   media — map art is a hand-placed schematic SVG of token-tinted city
 *   blocks, a slanted canal band, a park, and a plaza circle.
 * @output Wayline Scout — Radial Quick Menu: a 390px MOBILE map-annotation
 *   surface. NavBar (compass mark · 'Wayline Scout' · hint toggle) over a
 *   420px schematic map canvas. Long-pressing the canvas (450ms hold with
 *   a filling ring cursor at the press point; >10px slop cancels) spawns a
 *   radial menu AT the press point: 5 action petals fan out along a 96px
 *   arc with 40ms-staggered overshoot (cubic-bezier(0.34,1.56,0.64,1));
 *   the arc auto-flips by quadrant to stay inside the shell — fan-up when
 *   y≥168 else fan-down, 140° centered spread mid-canvas, 100° quarter
 *   arcs tilted ±45° within 132px of either side edge, origin clamped to
 *   [44, edge−44]. Continuing the SAME press and dragging from the center
 *   hit-tests petals by angle+distance (nearest angle ≤ halfstep+6°, ring
 *   30–160px): the hot petal scales 1.15, fills with the brand accent and
 *   grows a label chip; release COMMITS — the petal flies to the bottom
 *   'Recent actions' tray (transform/opacity keyframe toward the newest
 *   chip slot) while the tray chip and log row slide in, a marker pops on
 *   the map, and the toast announces 'Pin logged at C3 · (162, 240)' with
 *   a real Undo. Releasing over the dead zone leaves the menu open for
 *   plain taps; tapping elsewhere retracts with reverse stagger. The
 *   persistent 44×44 '+' FAB (above the toast dock) opens the SAME menu
 *   centered — petals become a roving-tabindex menu (Arrow keys move
 *   focus+highlight, Enter/Space commits, Escape closes back to the FAB).
 *   Below the canvas: the full 'Recent actions' inset-grouped log (5
 *   seeded + commits, newest first, slide-in on insert).
 * @position Page template; emitted by \`astryx template mobile-radial-quick-menu\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the 52px navBar
 *   at y=0 is the first pixel). The radial menu, hold-ring cursor, tray,
 *   hint pill and markers are all position:'absolute' INSIDE the map
 *   canvas card (itself inside shell); position:fixed is banned. No
 *   sheets, so the shell never scroll-locks. ONE polite toast dock
 *   (aria-live) rides a zero-height sticky dock at bottom:16; the FAB sits
 *   at bottom:76 right:16 in the same dock (above the toast, per the
 *   fab-over-dock convention). The map canvas uses touchAction:'none' —
 *   it is a map surface whose pan gesture is deliberately repurposed for
 *   hold-and-drag; the page scrolls from every other region.
 * Animation contract: transform/opacity only (plus stroke-dashoffset on
 *   the 450ms hold ring). Overshoot = cubic-bezier(0.34,1.56,0.64,1),
 *   decelerate = cubic-bezier(0.22,1,0.36,1); per-index animationDelay
 *   staggers fan-in (i·40ms) and reverse retract ((4−i)·35ms); phase
 *   chaining via cleaned-up setTimeout (open→closing→null, commit fly
 *   400ms→finalize). Gesture physics = pointer events with
 *   setPointerCapture on the canvas; NO physics libraries. MANDATORY
 *   button path: the FAB opens the identical menu with ArrowKeys+Enter,
 *   and every petal is a real ≥44×44 role=menuitem button that commits
 *   through the same finalizeCommit. MANDATORY reduced motion (matchMedia
 *   effect + change listener, with a CSS backstop): petals appear in place
 *   with no fan/stagger, retract/fly/pop/slide become instant state
 *   changes, the hold ring renders as a static full ring — drag-highlight
 *   still works.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#0F766E, #5EEAD4) — white icon/13px+600 text
 *   on #0F766E ≈ 5.5:1; near-black #06201B on #5EEAD4 ≈ 11.4:1; as a bare
 *   fill (FAB, markers, hot petal, unread ring): #0F766E on the white body
 *   ≈ 5.5:1 and #5EEAD4 on the ~#141414 dark body ≈ 10.9:1 — both clear
 *   ≥3:1. Water/park washes derive via color-mix from BRAND_ACCENT /
 *   var(--color-success) at low opacity over the body (decorative art, not
 *   state). Never var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px section
 *   gaps · 8px chip gaps; navBar 52px sticky top z20 hairline (grid
 *   '1fr auto 1fr', paddingInline 8); canvas card 420px inset-grouped
 *   (12px radius, 1px border); log rows 52px with hairline dividers inset
 *   56; petals 52px circles (≥44 hit); FAB exactly 44×44; every target
 *   ≥44×44. TYPE (Figtree via --font-family-body): 17/600 nav title ·
 *   16/400 body · 13/400 meta · 11/500 overlines + SVG street labels
 *   (nothing under 11px); tabular-nums on every coordinate readout.
 *
 * Responsive contract:
 * - Fluid 320–430: the map SVG stretches via preserveAspectRatio='none'
 *   at a fixed 420px height; commit coords convert px→logical through the
 *   measured canvas width so grid cells stay truthful; petal geometry
 *   computes against the live width (arc clamps use real edges). Log rows
 *   ellipsize their meta line; the toast ellipsizes, its Undo never does.
 * - Desktop stage (>560px container, measured by useElementWidth on the
 *   wrapper — NOT viewport media queries): the shell renders as the
 *   standard centered 430px phone column (borderInline hairline) on a
 *   var(--color-background-muted) backdrop; no adaptive relayout — the
 *   radial anatomy is deliberately phone geometry.
 */

import {useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import type {LucideIcon} from 'lucide-react';
import {
  CameraIcon,
  InfoIcon,
  MapPinIcon,
  PlusIcon,
  RouteIcon,
  Share2Icon,
  StickyNoteIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — the single quarantined brand accent + its fill text.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Wayline teal). White on #0F766E ≈ 5.5:1;
// #06201B on #5EEAD4 ≈ 11.4:1. As a bare fill: #0F766E on the white body
// ≈ 5.5:1, #5EEAD4 on the ~#141414 dark body ≈ 10.9:1 — both ≥3:1.
const BRAND_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
// Text/icon over a BRAND_ACCENT fill (math above).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #06201B)';
// Brand-tinted wash for log-row icon seats and the hint pill glyph.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Decorative map washes (art, not state) — derived, no new literals.
const WATER_WASH = \`color-mix(in srgb, \${BRAND_ACCENT} 22%, var(--color-background-body))\`;
const PARK_WASH = 'color-mix(in srgb, var(--color-success) 16%, var(--color-background-body))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the radial-menu
// choreography (transform/opacity only; stroke-dashoffset on the hold
// ring), row/tray/marker entries, and the reduced-motion backstop.
// ---------------------------------------------------------------------------

const RQM_CSS = \`
.rqm-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.rqm-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.rqm-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Petal base — final transform reads the per-petal --dx/--dy vars. */
.rqm-petal {
  transform: translate(-50%, -50%) translate(var(--dx), var(--dy));
  transition: transform 140ms cubic-bezier(0.34, 1.56, 0.64, 1),
    background 140ms ease, color 140ms ease;
}
.rqm-petal-hot {
  transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(1.15);
}
@keyframes rqm-fan-in {
  from { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
  to {
    transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(1);
    opacity: 1;
  }
}
.rqm-fan {
  animation: rqm-fan-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: var(--delay);
}
@keyframes rqm-retract-out {
  from {
    transform: translate(-50%, -50%) translate(var(--dx), var(--dy));
    opacity: 1;
  }
  to { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
}
.rqm-retract {
  animation: rqm-retract-out 200ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--rdelay);
}
@keyframes rqm-fly-out {
  from {
    transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(1.15);
    opacity: 1;
  }
  to {
    transform: translate(-50%, -50%) translate(var(--fx), var(--fy)) scale(0.3);
    opacity: 0.1;
  }
}
.rqm-fly {
  animation: rqm-fly-out 380ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes rqm-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.rqm-guide-in { animation: rqm-fade-in 240ms ease both; }
.rqm-chip-in { animation: rqm-fade-in 120ms ease both; }
/* Hold ring — circumference 2π·20 ≈ 125.7; fills over the 450ms hold. */
@keyframes rqm-ring-fill {
  from { stroke-dashoffset: 125.7; }
  to { stroke-dashoffset: 0; }
}
.rqm-ringfill { animation: rqm-ring-fill 450ms linear forwards; }
@keyframes rqm-pop-in {
  from { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}
.rqm-pop { animation: rqm-pop-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes rqm-row-in {
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.rqm-row-in { animation: rqm-row-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes rqm-tray-in {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.rqm-tray-in { animation: rqm-tray-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.rqm-fade { transition: opacity 200ms ease; }
/* Reduced motion backstop — the JS path already swaps to instant states;
   this kills anything that slips through. Loops: none exist by design. */
@media (prefers-reduced-motion: reduce) {
  .rqm-fan, .rqm-retract, .rqm-fly, .rqm-pop, .rqm-row-in, .rqm-tray-in,
  .rqm-ringfill, .rqm-guide-in, .rqm-chip-in { animation: none; }
  .rqm-petal, .rqm-fade { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  wrapWide: {background: 'var(--color-background-muted)'},
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
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20 with an always-on hairline.
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', minWidth: 0},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    maxWidth: 220,
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
  brandSeat: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  // Section eyebrow — 11px uppercase tracking-wide, 16px gutter (+16 card
  // inset = 32 like the sibling mobile templates).
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // MAP CANVAS — inset-grouped 420px card; the long-press surface.
  canvasCard: {
    position: 'relative',
    marginInline: 16,
    height: 420,
    background: 'var(--color-background-body)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  mapSvg: {position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block'},
  // Logged-action markers — brand dot with a card ring; % positions in the
  // 358×420 logical space so they track the stretched art.
  marker: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    border: '2px solid var(--color-background-card)',
    boxShadow: '0 1px 4px var(--color-shadow)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  // Hint pill — top-center overlay, pointer-transparent.
  hintWrap: {
    position: 'absolute',
    top: 12,
    insetInline: 12,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 3,
  },
  hintPill: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 8px var(--color-shadow)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  hintGlyph: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  // RECENT-ACTIONS TRAY — bottom row inside the canvas; visual echo of the
  // log list below (aria-hidden, pointer-transparent so gestures pass).
  tray: {
    position: 'absolute',
    bottom: 12,
    insetInline: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    pointerEvents: 'none',
    zIndex: 3,
  },
  trayLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  trayChip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 8px var(--color-shadow)',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  trayChipIcon: {color: BRAND_ACCENT, display: 'inline-flex'},
  // HOLD RING — 48px filling cursor at the press point.
  holdRing: {position: 'absolute', width: 48, height: 48, marginLeft: -24, marginTop: -24, pointerEvents: 'none', zIndex: 5},
  // RADIAL MENU — zero-size origin; petals/chips position from it.
  menuRoot: {position: 'absolute', width: 0, height: 0, zIndex: 6},
  guideRing: {
    position: 'absolute',
    left: -96,
    top: -96,
    width: 192,
    height: 192,
    borderRadius: '50%',
    border: '1px dashed var(--color-border-emphasized)',
    opacity: 0.6,
    pointerEvents: 'none',
  },
  centerClose: {
    position: 'absolute',
    left: -22,
    top: -22,
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 8px var(--color-shadow)',
    color: 'var(--color-text-secondary)',
  },
  petal: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 52,
    height: 52,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    color: 'var(--color-text-primary)',
  },
  petalHot: {
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    borderColor: 'transparent',
  },
  petalChip: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 8px var(--color-shadow)',
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  // LOG LIST — inset-grouped card, 52px rows, dividers inset 56.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  logRow: {
    minHeight: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
  },
  logSeat: {
    width: 28,
    height: 28,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  rowText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 1, paddingBlock: 8},
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 56},
  footNote: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '16px 16px 0',
  },
  spacer: {height: 96},
  // DOCK — zero-height sticky wrapper: toast at bottom:16, FAB at
  // bottom:76 right:16 (above the toast dock, fab-over-dock convention).
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 25, height: 0, marginTop: 'auto'},
  toastRegion: {
    position: 'absolute',
    bottom: 16,
    insetInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'auto',
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastText: {
    fontSize: 13,
    fontWeight: 500,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastBtn: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 76,
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
};

// ---------------------------------------------------------------------------
// ============= DATA =============
// Logical map space 358×420; grid refs = 6 cols A–F × 7 rows 1–7. Every
// cell string on screen derives from cellFor() — never hand-typed.
// ---------------------------------------------------------------------------

const MAP_W = 358;
const MAP_H = 420;
const HOLD_MS = 450;
const PETAL_RADIUS = 96;
const GRID_COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

function cellFor(x: number, y: number): string {
  const col = GRID_COLS[Math.min(5, Math.max(0, Math.floor(x / (MAP_W / 6))))];
  const row = Math.min(7, Math.max(1, Math.floor(y / (MAP_H / 7)) + 1));
  return \`\${col}\${row}\`;
}

type ActionId = 'pin' | 'note' | 'photo' | 'share' | 'route';

interface QuickAction {
  id: ActionId;
  label: string;
  icon: LucideIcon;
}

const ACTIONS: QuickAction[] = [
  {id: 'pin', label: 'Pin', icon: MapPinIcon},
  {id: 'note', label: 'Note', icon: StickyNoteIcon},
  {id: 'photo', label: 'Photo', icon: CameraIcon},
  {id: 'share', label: 'Share', icon: Share2Icon},
  {id: 'route', label: 'Route', icon: RouteIcon},
];

const ACTION_BY_ID: Record<ActionId, QuickAction> = {
  pin: ACTIONS[0],
  note: ACTIONS[1],
  photo: ACTIONS[2],
  share: ACTIONS[3],
  route: ACTIONS[4],
};

interface LogEntry {
  id: string;
  actionId: ActionId;
  x: number; // logical px, 0–358
  y: number; // logical px, 0–420
  time: string;
}

// 5 pre-seeded actions. Cells derive from coords via cellFor (header
// cross-check: C2 / E5 / B6 / D3 / A4). Fixed clock labels, morning of
// Fri Jul 10 2026 — no wall-clock reads.
const SEED_ENTRIES: LogEntry[] = [
  {id: 'seed-1', actionId: 'pin', x: 150, y: 96, time: '9:41 AM'},
  {id: 'seed-2', actionId: 'route', x: 284, y: 262, time: '9:36 AM'},
  {id: 'seed-3', actionId: 'photo', x: 82, y: 318, time: '9:28 AM'},
  {id: 'seed-4', actionId: 'note', x: 216, y: 154, time: '9:14 AM'},
  {id: 'seed-5', actionId: 'share', x: 38, y: 210, time: '8:57 AM'},
];

// ---------------------------------------------------------------------------
// RADIAL GEOMETRY — quadrant table (header math):
//   vertical: fan UP when y ≥ 168 (96 arc + 26 petal + 30 chip headroom),
//   else fan DOWN; horizontal: within 132px of a side edge the arc becomes
//   a 100° quarter fan tilted ±45°; mid-canvas keeps the full 140° spread.
//   Origin clamps to x∈[44, w−44], y∈[44, 376] so every petal + chip stays
//   ≥8px inside the canvas in all six quadrant combos.
// ---------------------------------------------------------------------------

interface MenuGeom {
  x: number;
  y: number;
  angles: number[]; // degrees; 0 = +x, 90 = +y (down)
  chipSide: 'top' | 'bottom';
}

function menuGeometry(rawX: number, rawY: number, width: number): MenuGeom {
  const x = Math.min(Math.max(rawX, 44), width - 44);
  const y = Math.min(Math.max(rawY, 44), MAP_H - 44);
  const fanDown = y < 168;
  const zone = x < 132 ? 'left' : x > width - 132 ? 'right' : 'center';
  const center = fanDown
    ? zone === 'left' ? 45 : zone === 'right' ? 135 : 90
    : zone === 'left' ? -45 : zone === 'right' ? -135 : -90;
  const spread = zone === 'center' ? 140 : 100;
  const step = spread / 4;
  const angles = [0, 1, 2, 3, 4].map(i => center - spread / 2 + step * i);
  return {x, y, angles, chipSide: fanDown ? 'bottom' : 'top'};
}

function petalOffset(angleDeg: number): {dx: number; dy: number} {
  const rad = (angleDeg * Math.PI) / 180;
  return {dx: PETAL_RADIUS * Math.cos(rad), dy: PETAL_RADIUS * Math.sin(rad)};
}

/** Drag hit-test: nearest petal by angle (≤ halfstep+6°) inside 30–160px. */
function hitTest(geom: MenuGeom, px: number, py: number): number | null {
  const dx = px - geom.x;
  const dy = py - geom.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 30 || dist > 160) return null;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const halfStep = Math.abs(geom.angles[1] - geom.angles[0]) / 2 + 6;
  let best: number | null = null;
  let bestDiff = Infinity;
  geom.angles.forEach((angle, index) => {
    let diff = Math.abs(deg - angle) % 360;
    if (diff > 180) diff = 360 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = index;
    }
  });
  return bestDiff <= halfStep ? best : null;
}

// ---------------------------------------------------------------------------
// SHARED HOOKS
// ---------------------------------------------------------------------------

/** Container-width hook — the demo's desktop stage is ~1045px inside a
 * 1440px window, so only a ResizeObserver on the wrapper is truthful. */
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

/** Reduced-motion — matchMedia once in an effect, with a change listener
 * (batch animation contract). */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 28px compass rose: ring + brand needle.
// ---------------------------------------------------------------------------

function WaylineMark() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="11" stroke="var(--color-text-primary)" strokeWidth="1.8" />
      <path d="M18.6 9.4 15.4 15.4 9.4 18.6 12.6 12.6Z" fill={BRAND_ACCENT} />
      <circle cx="14" cy="14" r="1.6" fill="var(--color-text-primary)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MAP ART — hand-placed schematic blocks in the 358×420 logical space.
// Columns A 16–76 / B 84–142, a slanted canal band 154→166 / 182→194, then
// C 204–260 / D 276–342; rows at y 16/84/168/236/312/380. Park = D-row2,
// plaza circle = C-row4, bridge crosses the canal at the row-3/4 street.
// ---------------------------------------------------------------------------

const BLOCK_ROWS: Array<[number, number]> = [
  [16, 56],
  [84, 72],
  [168, 56],
  [236, 64],
  [312, 56],
  [380, 24],
];

const BLOCK_COLS: Array<[number, number]> = [
  [16, 60],
  [84, 58],
  [204, 56],
  [276, 66],
];

function MapArt() {
  const blocks: Array<{x: number; y: number; w: number; h: number; kind: 'block' | 'park' | 'plaza'}> = [];
  BLOCK_COLS.forEach(([bx, bw], colIndex) => {
    BLOCK_ROWS.forEach(([by, bh], rowIndex) => {
      const kind =
        colIndex === 3 && rowIndex === 1 ? 'park' : colIndex === 2 && rowIndex === 3 ? 'plaza' : 'block';
      blocks.push({x: bx, y: by, w: bw, h: bh, kind});
    });
  });
  return (
    <svg
      style={styles.mapSvg}
      viewBox={\`0 0 \${MAP_W} \${MAP_H}\`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Schematic map of the Riverside grid: city blocks, Otter Canal, Dockside Park and Founders Plaza">
      {blocks.map(block => (
        <rect
          key={\`\${block.x}-\${block.y}\`}
          x={block.x}
          y={block.y}
          width={block.w}
          height={block.h}
          rx={4}
          fill={block.kind === 'park' ? PARK_WASH : 'var(--color-background-muted)'}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
      ))}
      {/* Otter Canal — slanted water band between columns B and C. */}
      <polygon points="154,0 182,0 194,420 166,420" fill={WATER_WASH} />
      {/* Bridge at the row-3/4 street. */}
      <rect x={148} y={225} width={56} height={10} rx={2} fill="var(--color-background-body)" stroke="var(--color-border)" strokeWidth={1} />
      {/* Founders Plaza circle inside C-row4. */}
      <circle cx={232} cy={268} r={18} fill="var(--color-background-body)" stroke="var(--color-border)" strokeWidth={1} />
      {/* Dockside Park canopies. */}
      <circle cx={294} cy={104} r={6} fill="var(--color-success)" opacity={0.3} />
      <circle cx={312} cy={126} r={8} fill="var(--color-success)" opacity={0.3} />
      <circle cx={326} cy={100} r={5} fill="var(--color-success)" opacity={0.3} />
      {/* Street + canal labels — 11px floor. */}
      <text x={79} y={165} textAnchor="middle" fontSize={11} fontWeight={500} fill="var(--color-text-secondary)">
        FOUNDRY ST
      </text>
      <text
        x={268}
        y={210}
        textAnchor="middle"
        fontSize={11}
        fontWeight={500}
        fill="var(--color-text-secondary)"
        transform="rotate(-90 268 210)">
        MERCER AVE
      </text>
      <text
        x={176}
        y={330}
        textAnchor="middle"
        fontSize={11}
        fontWeight={500}
        fill="var(--color-text-secondary)"
        transform="rotate(87 176 330)">
        OTTER CANAL
      </text>
      {/* Grid refs — match cellFor's 6×7 partition. */}
      {GRID_COLS.map((letter, index) => (
        <text
          key={letter}
          x={(MAP_W / 6) * (index + 0.5)}
          y={12}
          textAnchor="middle"
          fontSize={11}
          fontWeight={500}
          opacity={0.7}
          fill="var(--color-text-secondary)">
          {letter}
        </text>
      ))}
      {[1, 2, 3, 4, 5, 6, 7].map(row => (
        <text
          key={row}
          x={7}
          y={(MAP_H / 7) * (row - 0.5) + 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={500}
          opacity={0.7}
          fill="var(--color-text-secondary)">
          {row}
        </text>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// TEMPLATE
// ---------------------------------------------------------------------------

type PetalVars = CSSProperties & {
  ['--dx']?: string;
  ['--dy']?: string;
  ['--delay']?: string;
  ['--rdelay']?: string;
  ['--fx']?: string;
  ['--fy']?: string;
};

type MenuPhase = 'open' | 'closing' | 'committing';

interface MenuState extends MenuGeom {
  source: 'press' | 'fab';
  phase: MenuPhase;
  highlight: number | null;
  committed: number | null;
  fly: {fx: number; fy: number} | null;
}

interface ToastState {
  seq: number;
  text: string;
  undoId: string | null;
}

export default function MobileRadialQuickMenuTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isDesktopColumn = wrapWidth > 560;
  const reducedMotion = usePrefersReducedMotion();

  const [entries, setEntries] = useState<LogEntry[]>(SEED_ENTRIES);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [holdPoint, setHoldPoint] = useState<{x: number; y: number} | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const petalRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const holdRef = useRef<{x: number; y: number} | null>(null);
  const dragRef = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seqRef = useRef(1);

  // All choreography timers are cleaned up on unmount.
  useEffect(
    () => () => {
      if (holdTimer.current != null) clearTimeout(holdTimer.current);
      if (phaseTimer.current != null) clearTimeout(phaseTimer.current);
    },
    [],
  );

  // FAB-opened menus are keyboard menus: focus the first petal on open.
  const menuSource = menu?.source ?? null;
  const menuPhase = menu?.phase ?? null;
  useEffect(() => {
    if (menuSource === 'fab' && menuPhase === 'open') {
      petalRefs.current[0]?.focus({preventScroll: true});
    }
  }, [menuSource, menuPhase]);

  const canvasWidth = () => canvasRef.current?.getBoundingClientRect().width ?? MAP_W;

  const bumpToast = (text: string, undoId: string | null) =>
    setToast(prev => ({seq: (prev?.seq ?? 0) + 1, text, undoId}));

  // VERBS ---------------------------------------------------------------

  const openMenu = (x: number, y: number, source: 'press' | 'fab') => {
    if (phaseTimer.current != null) clearTimeout(phaseTimer.current);
    const geom = menuGeometry(x, y, canvasWidth());
    setMenu({...geom, source, phase: 'open', highlight: null, committed: null, fly: null});
  };

  const closeMenu = (refocusFab: boolean) => {
    setMenu(prev => {
      if (prev == null || prev.phase !== 'open') return prev;
      if (reducedMotion) return null;
      return {...prev, phase: 'closing'};
    });
    if (!reducedMotion) {
      if (phaseTimer.current != null) clearTimeout(phaseTimer.current);
      // 200ms retract + 4·35ms reverse stagger.
      phaseTimer.current = setTimeout(() => setMenu(null), 360);
    }
    if (refocusFab) fabRef.current?.focus();
  };

  const finalizeCommit = (origin: MenuState, index: number) => {
    const width = canvasWidth();
    const lx = Math.round((origin.x / width) * MAP_W);
    const ly = Math.round(origin.y);
    const action = ACTIONS[index];
    const id = \`log-\${seqRef.current}\`;
    seqRef.current += 1;
    setEntries(prev => [{id, actionId: action.id, x: lx, y: ly, time: 'Just now'}, ...prev]);
    setLastAddedId(id);
    bumpToast(\`\${action.label} logged at \${cellFor(lx, ly)} · (\${lx}, \${ly})\`, id);
    setShowHint(false);
    setMenu(null);
    if (origin.source === 'fab') fabRef.current?.focus();
  };

  const commitFromMenu = (index: number) => {
    const current = menu;
    if (current == null || current.phase !== 'open') return;
    if (reducedMotion) {
      finalizeCommit(current, index);
      return;
    }
    // Fly target: the newest tray-chip slot at the canvas bottom-left.
    const fly = {fx: 96 - current.x, fy: MAP_H - 26 - current.y};
    setMenu({...current, phase: 'committing', committed: index, highlight: index, fly});
    if (phaseTimer.current != null) clearTimeout(phaseTimer.current);
    phaseTimer.current = setTimeout(() => finalizeCommit(current, index), 400);
  };

  const undoEntry = (undoId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== undoId));
    setLastAddedId(prev => (prev === undoId ? null : prev));
    bumpToast('Action removed', null);
  };

  // GESTURE — long-press spawn + drag-to-petal (pointer capture on the
  // canvas; petal/FAB presses never reach these handlers).

  const cancelHold = () => {
    if (holdTimer.current != null) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    holdRef.current = null;
    setHoldPoint(null);
  };

  const canvasPoint = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {x: event.clientX - rect.left, y: event.clientY - rect.top};
  };

  const onCanvasPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (menu != null) {
      // Tapping elsewhere retracts with reverse stagger.
      closeMenu(false);
      return;
    }
    const point = canvasPoint(event);
    holdRef.current = point;
    setHoldPoint(point);
    event.currentTarget.setPointerCapture(event.pointerId);
    if (holdTimer.current != null) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      holdTimer.current = null;
      holdRef.current = null;
      setHoldPoint(null);
      dragRef.current = true; // same press continues as a drag
      openMenu(point.x, point.y, 'press');
    }, HOLD_MS);
  };

  const onCanvasPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = canvasPoint(event);
    if (holdRef.current != null) {
      if (Math.hypot(point.x - holdRef.current.x, point.y - holdRef.current.y) > 10) {
        cancelHold();
      }
      return;
    }
    if (dragRef.current) {
      setMenu(prev =>
        prev != null && prev.phase === 'open'
          ? {...prev, highlight: hitTest(prev, point.x, point.y)}
          : prev,
      );
    }
  };

  const onCanvasPointerUp = () => {
    if (holdRef.current != null) {
      cancelHold();
      return;
    }
    if (dragRef.current) {
      dragRef.current = false;
      if (menu != null && menu.phase === 'open' && menu.highlight != null) {
        commitFromMenu(menu.highlight);
      }
      // Released over the dead zone: menu stays open for plain taps.
    }
  };

  const onCanvasPointerCancel = () => {
    cancelHold();
    dragRef.current = false;
  };

  // KEYBOARD — ArrowKeys+Enter petal navigation for the FAB path.
  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const current = menu;
    if (current == null || current.phase !== 'open') return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    const active = current.highlight ?? 0;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (active + 1) % 5;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (active + 4) % 5;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 4;
    if (next != null) {
      event.preventDefault();
      setMenu({...current, highlight: next});
      petalRefs.current[next]?.focus({preventScroll: true});
    }
  };

  const onFabClick = () => {
    if (menu != null) {
      closeMenu(true);
      return;
    }
    canvasRef.current?.scrollIntoView({block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth'});
    openMenu(canvasWidth() / 2, MAP_H / 2, 'fab');
  };

  // RENDER ----------------------------------------------------------------

  const trayEntries = entries.slice(0, 3);

  return (
    <div
      ref={wrapRef}
      style={isDesktopColumn ? {...styles.wrap, ...styles.wrapWide} : styles.wrap}>
      <style>{RQM_CSS}</style>
      <div style={isDesktopColumn ? {...styles.shell, ...styles.shellDesktop} : styles.shell}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.brandSeat}>
              <WaylineMark />
            </span>
          </div>
          <h1 style={styles.navTitle}>Wayline Scout</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="rqm-btn rqm-focusable"
              style={styles.iconBtn}
              aria-label={showHint ? 'Hide the gesture hint' : 'Show the gesture hint'}
              aria-pressed={showHint}
              onClick={() => setShowHint(prev => !prev)}>
              <Icon icon={InfoIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <div style={styles.sectionHeader}>District 4 · Riverside grid</div>

        {/* MAP CANVAS — the long-press surface. touchAction:none because the
            map's pan gesture is repurposed for hold-and-drag; the FAB below
            is the equivalent button path. */}
        <div
          ref={canvasRef}
          style={styles.canvasCard}
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onCanvasPointerMove}
          onPointerUp={onCanvasPointerUp}
          onPointerCancel={onCanvasPointerCancel}>
          <MapArt />

          {/* Logged-action markers (log list below is the record). */}
          {entries.map(entry => (
            <span
              key={entry.id}
              className={entry.id === lastAddedId && !reducedMotion ? 'rqm-pop' : undefined}
              style={{
                ...styles.marker,
                left: \`\${(entry.x / MAP_W) * 100}%\`,
                top: \`\${(entry.y / MAP_H) * 100}%\`,
              }}
              aria-hidden
            />
          ))}

          {showHint ? (
            <div style={styles.hintWrap}>
              <span style={styles.hintPill} className="rqm-fade">
                <span style={styles.hintGlyph} aria-hidden>
                  <Icon icon={PlusIcon} size="xsm" color="inherit" />
                </span>
                Hold the map — or tap + — for quick actions
              </span>
            </div>
          ) : null}

          {/* Recent-actions tray — the commit fly target; visual echo of the
              log list (aria-hidden, pointer-transparent). */}
          <div style={styles.tray} aria-hidden>
            <span style={styles.trayLabel}>Recent</span>
            {trayEntries.map(entry => (
              <span
                key={entry.id}
                className={entry.id === lastAddedId && !reducedMotion ? 'rqm-tray-in' : undefined}
                style={styles.trayChip}>
                <span style={styles.trayChipIcon}>
                  <Icon icon={ACTION_BY_ID[entry.actionId].icon} size="sm" color="inherit" />
                </span>
                {cellFor(entry.x, entry.y)}
              </span>
            ))}
          </div>

          {/* Filling ring cursor during the 450ms hold. Reduced motion: the
              CSS backstop drops the fill animation → static full ring. */}
          {holdPoint != null ? (
            <svg
              style={{...styles.holdRing, left: holdPoint.x, top: holdPoint.y}}
              viewBox="0 0 48 48"
              aria-hidden>
              <circle cx={24} cy={24} r={20} stroke="var(--color-border-emphasized)" strokeWidth={2} fill="none" opacity={0.5} />
              <circle
                className="rqm-ringfill"
                cx={24}
                cy={24}
                r={20}
                stroke={BRAND_ACCENT}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={125.7}
                strokeDashoffset={0}
                transform="rotate(-90 24 24)"
              />
              <circle cx={24} cy={24} r={3} fill={BRAND_ACCENT} />
            </svg>
          ) : null}

          {/* RADIAL MENU — petals fan from the press point / canvas center. */}
          {menu != null ? (
            <div
              role="menu"
              aria-label="Quick actions"
              style={{...styles.menuRoot, left: menu.x, top: menu.y}}
              onPointerDown={event => event.stopPropagation()}
              onKeyDown={onMenuKeyDown}>
              <span
                className={reducedMotion ? undefined : 'rqm-guide-in'}
                style={{
                  ...styles.guideRing,
                  ...(menu.phase !== 'open' ? {opacity: 0} : null),
                }}
                aria-hidden
              />
              {menu.phase === 'open' ? (
                <button
                  type="button"
                  className="rqm-btn rqm-focusable"
                  style={styles.centerClose}
                  aria-label="Close quick actions"
                  onClick={() => closeMenu(menu.source === 'fab')}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              ) : null}
              {ACTIONS.map((action, index) => {
                const {dx, dy} = petalOffset(menu.angles[index]);
                const hot = menu.highlight === index;
                const phaseClass =
                  menu.phase === 'open'
                    ? reducedMotion
                      ? ''
                      : ' rqm-fan'
                    : menu.phase === 'committing' && menu.committed === index
                      ? ' rqm-fly'
                      : ' rqm-retract';
                const vars: PetalVars = {
                  ...styles.petal,
                  ...(hot ? styles.petalHot : null),
                  '--dx': \`\${dx.toFixed(1)}px\`,
                  '--dy': \`\${dy.toFixed(1)}px\`,
                  '--delay': \`\${index * 40}ms\`,
                  '--rdelay': \`\${(4 - index) * 35}ms\`,
                  '--fx': \`\${(menu.fly?.fx ?? 0).toFixed(1)}px\`,
                  '--fy': \`\${(menu.fly?.fy ?? 0).toFixed(1)}px\`,
                };
                return (
                  <button
                    key={action.id}
                    ref={element => {
                      petalRefs.current[index] = element;
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={(menu.highlight ?? 0) === index ? 0 : -1}
                    className={\`rqm-btn rqm-focusable rqm-petal\${hot ? ' rqm-petal-hot' : ''}\${phaseClass}\`}
                    style={vars}
                    aria-label={\`\${action.label} here\`}
                    disabled={menu.phase !== 'open'}
                    onFocus={() =>
                      setMenu(prev =>
                        prev != null && prev.phase === 'open' ? {...prev, highlight: index} : prev,
                      )
                    }
                    onClick={() => commitFromMenu(index)}>
                    <Icon icon={action.icon} size="md" color="inherit" />
                  </button>
                );
              })}
              {menu.highlight != null && menu.phase === 'open'
                ? (() => {
                    const {dx, dy} = petalOffset(menu.angles[menu.highlight]);
                    return (
                      <span
                        className="rqm-chip-in"
                        style={{
                          ...styles.petalChip,
                          left: dx,
                          top: dy + (menu.chipSide === 'top' ? -42 : 42),
                        }}
                        aria-hidden>
                        {ACTIONS[menu.highlight].label}
                      </span>
                    );
                  })()
                : null}
            </div>
          ) : null}
        </div>

        {/* RECENT ACTIONS LOG — the accessible record of every commit. */}
        <div style={styles.sectionHeader}>Recent actions · {entries.length}</div>
        <div style={styles.listCard}>
          {entries.map((entry, index) => {
            const action = ACTION_BY_ID[entry.actionId];
            return (
              <div key={entry.id}>
                {index > 0 ? <div style={styles.rowDivider} aria-hidden /> : null}
                <div
                  style={styles.logRow}
                  className={entry.id === lastAddedId && !reducedMotion ? 'rqm-row-in' : undefined}>
                  <span style={styles.logSeat} aria-hidden>
                    <Icon icon={action.icon} size="sm" color="inherit" />
                  </span>
                  <div style={styles.rowText}>
                    <span style={styles.rowPrimary}>
                      {action.label} — {cellFor(entry.x, entry.y)}
                    </span>
                    <span style={styles.rowSecondary}>
                      ({entry.x}, {entry.y}) · {entry.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p style={styles.footNote}>
          Hold anywhere on the map for 450ms, or use the + button — Arrow keys and Enter pick a
          petal.
        </p>
        <div style={styles.spacer} aria-hidden />

        {/* DOCK — one polite toast (bottom:16) + the 44×44 FAB above it. */}
        <div style={styles.dockWrap}>
          <button
            ref={fabRef}
            type="button"
            className="rqm-btn rqm-focusable"
            style={styles.fab}
            aria-label="Open quick actions at the map center"
            aria-haspopup="menu"
            aria-expanded={menu != null}
            onClick={onFabClick}>
            <Icon icon={PlusIcon} size="md" color="inherit" />
          </button>
          <div style={styles.toastRegion} aria-live="polite" role="status">
            {toast != null ? (
              <div key={toast.seq} style={styles.toast} className="rqm-fade">
                <span style={styles.toastText}>{toast.text}</span>
                <span style={styles.toastHairline} aria-hidden />
                {toast.undoId != null ? (
                  <button
                    type="button"
                    className="rqm-btn rqm-focusable"
                    style={styles.toastBtn}
                    onClick={() => undoEntry(toast.undoId as string)}>
                    Undo
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rqm-btn rqm-focusable"
                    style={styles.toastBtn}
                    aria-label="Dismiss message"
                    onClick={() => setToast(null)}>
                    <Icon icon={XIcon} size="sm" color="inherit" />
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
`;export{e as default};