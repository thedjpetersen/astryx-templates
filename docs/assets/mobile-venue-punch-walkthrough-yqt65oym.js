var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Snagline venue punch list for
 *   Riverside Hall (Meridian Product Summit — load-in Jul 12, inspector
 *   Dana Okafor): six zones (z1 Lobby … z6 Patio) and 16 punch items with
 *   arithmetic locked by cross-check — open by zone 2+4+3+2+0+1 = 12,
 *   resolved 4 (p03, p11, p14, p15), 12+4 = 16 total; the 12 open split
 *   blocker 2 + functional 5 + cosmetic 5 = 12 and venue 7 + tape 5 = 12.
 *   No Date.now(), no Math.random(), no map tiles or network media —
 *   the floorplan is a stylized isometric inline SVG.
 * @output Snagline — Venue Punch Walkthrough: a 390px MOBILE event-ops
 *   surface with NO tabBar (the walkthrough is linear). A 52px navBar
 *   (clipboard brand mark · 6-room RoomDots radiogroup rail · 44×44
 *   sign-off button) over a sticky ZonePlan panel — a 358×228 skewed
 *   isometric floorplan whose six rooms carry live open-count chips and
 *   numbered severity-ring pins — over a 56px Prev/Next roomNav and a
 *   scrolling per-room punch list (72px open rows with swipe-to-resolve +
 *   44×44 ellipsis fallback, 60px struck resolved rows, 44px collapsed
 *   rows for the other five rooms). Signature move: filing an item from
 *   the two-detent sheet (zone pre-tagged, ghost pin on the plan)
 *   increments the room's chip, re-sorts the list blockers-first with a
 *   linked pin/row pulse, recomputes the HandoffLedger 'VENUE FIXES |
 *   WE BRING TAPE' split, and keeps the room's nav dot amber; resolving
 *   swipes with persistent Undo, and a room at zero open dims to a
 *   resolved tint with a check chip while its dot flips green.
 * @position Page template; emitted by \`astryx template
 *   mobile-venue-punch-walkthrough\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, menus, cover, alert) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   sheet or the sign-off cover is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. Escape layering, topmost
 *   first: alert (z61) > anchored menu (z35) > sheet (z41) > cover (z50) —
 *   the menu never coexists with the sheet (opening one closes the other),
 *   so the runtime order is alert > menu > sheet > cover.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 68 under the pin column); no
 *   desktop Layout frames, no side asides, no tabBar — the ledger occupies
 *   the tab-bar slot and the walkthrough is linear via Prev/Next.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Snagline teal); sanctioned non-brand literals are the
 *   amber room-dot pair, the inactive zone-boundary pair (interactive
 *   boundary — hairline tokens are for passive separators only), and the
 *   text-on-brand-fill pair, each with contrast math at the declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', always-on hairline — this
 *   template does not wire scroll-under, noted per contract); planPanel
 *   sticky top:52 z15, 16px padding around the 358×228 SVG (≤260px tall,
 *   maxHeight-capped so the top-third promise holds at 430); roomNav 56px
 *   grid '44px 1fr 44px'; rows 72px open / 60px resolved / 44px collapsed
 *   room + utility; sectionHeader 13px/600 uppercase 0.06em at 32px (16
 *   gutter + 16 card pad), 20px top / 8px bottom; toastDock sticky
 *   bottom:76 z30 (absolute bottom:76 ONLY while the shell is
 *   scroll-locked); HandoffLedger 64px sticky bottom:0 z20; sheet detents
 *   55% medium / calc(100% − 56px) large, 24px grabber zone with 36×5
 *   pill, 52px sheet header, 48px inputs, 48px sticky-footer primary.
 *   TYPE (Figtree via --font-family-body): 17/600 nav + card titles ·
 *   16/400–500 body + row primary · 13/400 meta · 11/500 chips/overlines;
 *   28/700 large title deliberately unused (compact title always visible);
 *   nothing under 11px in HTML; SVG plan text is 14 design-units so it
 *   renders ≥11px at the 320 stage (see ZonePlan comment); tabular-nums on
 *   every count. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   (RoomDots rail = one radiogroup with arrow keys under the
 *   adjacent-target merge clause); every gesture has a visible button path
 *   (swipe-resolve ↔ ellipsis menu, zone-tap ↔ 'Add item' header button,
 *   sheet drag ↔ grabber click/X/Escape).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow (overflowX:'clip' backstop
 *   only, no width:390 literals). ZonePlan scales via viewBox with
 *   width:'100%'; at 320 the plan is 288px wide and ~183px tall (planPanel
 *   height auto, maxHeight 260). RoomDots rail is 6×24 + 5×8 = 184px and
 *   fits every width (320 − 2×8 − 2×44 = 216 ≥ 184 ✓). roomNav title
 *   ellipsizes at one line; toast message ellipsizes, Undo never shrinks
 *   below 44px; ledger columns flex, counts tabular.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the pinned-plan anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  CheckSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Snagline teal). #0F7B6C on #FFFFFF ≈
// 5.6:1 (passes 4.5:1 for the 13px/600 'Add item' and Undo text);
// #5FD3C0 on the dark card (~#1C1917 class) ≈ 8.9:1.
const BRAND_ACCENT = 'light-dark(#0F7B6C, #5FD3C0)';
// Text over a BRAND_ACCENT fill (sign-off pill, swipe Resolve block,
// segmented active text). Light: #FFFFFF on #0F7B6C ≈ 5.6:1. Dark: white
// on #5FD3C0 fails, so the dark side flips near-black — #10201D on
// #5FD3C0 ≈ 9.8:1.
const BRAND_ON = 'light-dark(#FFFFFF, #10201D)';
// Amber room-dot pair — a STATE marker (open items remain), never sole
// channel (aria-labels carry the counts). Vs the blurred nav surface
// (≈ body): #B45309 on #FFF ≈ 4.6:1; #FBBF24 on #111 ≈ 9.9:1 — both
// clear the 3:1 non-text minimum with margin.
const AMBER_DOT = 'light-dark(#B45309, #FBBF24)';
// Inactive zone boundary on the ZonePlan — an INTERACTIVE control
// boundary, so hairline/muted tokens are banned here (foundations
// amendment). Vs the brand-mixed zone fills (8–20% teal over muted):
// #8A9996 vs ≈#E9ECEA-class fills ≈ 3.1:1 light; #6B7C78 vs the
// ≈#2A2E2C-class dark fills ≈ 3.2:1. (Spec suggested #B9C4C1/#4A5553 at
// "≈3.2:1"; those measure ≈1.9:1/1.6:1 against the actual mixed fills,
// so both sides are darkened/lightened to honestly clear 3:1 — noted
// deviation, math here.)
const ZONE_EDGE = 'light-dark(#8A9996, #6B7C78)';
// Sheet/cover scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// Brand-derived washes (id-derived zone fills live in ZONE_FILL below).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Resolved-zone tint — a room at 0 open dims to this on the plan.
const RESOLVED_TINT = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, var(--color-background-card))\`;

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings (HTML outline + SVG
// stroke swap), the visually-hidden h1, and the pulse/sheet keyframes.
// Transitions animate transform/opacity only and collapse under
// prefers-reduced-motion (pulses are REMOVED entirely there — a static
// highlight held until the next interaction encodes the link instead).
// ---------------------------------------------------------------------------

const SNAGLINE_CSS = \`
.svp-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.svp-btn:disabled { cursor: default; }
.svp-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.svp-zone { cursor: pointer; }
.svp-zone:focus { outline: none; }
.svp-zone:focus-visible .svp-zone-shape {
  stroke: \${BRAND_ACCENT};
  stroke-width: 2.5;
}
.svp-pin { cursor: pointer; }
.svp-pin:focus { outline: none; }
.svp-pin:focus-visible .svp-pin-hit {
  stroke: \${BRAND_ACCENT};
  stroke-width: 2;
}
.svp-anim { transition: transform 220ms ease, opacity 220ms ease; }
.svp-fade { transition: opacity 220ms ease; }
.svp-swipe { transition: transform 200ms ease; }
@keyframes svp-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.svp-sheet-in { animation: svp-sheet-in 240ms ease; }
@keyframes svp-row-pulse {
  0% { opacity: 1; }
  60% { opacity: 1; }
  100% { opacity: 0; }
}
.svp-row-pulse { animation: svp-row-pulse 1200ms ease forwards; }
@keyframes svp-pin-pulse {
  0% { transform: scale(1); }
  35% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
.svp-pin-pulse {
  animation: svp-pin-pulse 1200ms ease;
  transform-origin: center;
  transform-box: fill-box;
}
.svp-vh {
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
  .svp-anim, .svp-fade, .svp-swipe { transition: none; }
  .svp-sheet-in, .svp-row-pulse, .svp-pin-pulse { animation: none; }
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
  // Scroll lock while the sheet or cover is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline + blur
  // ALWAYS ON (scroll-under not wired; noted per contract).
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
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // ROOM DOTS — one radiogroup rail (adjacent-target merge clause): six
  // 24×44 radio buttons, 8px gaps → 6×24 + 5×8 = 184px total.
  dotsRail: {display: 'flex', alignItems: 'center', gap: 8},
  dotBtn: {
    width: 24,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
  },
  // 8px visual dot; the active room's dot is 10px with a 2px brand ring
  // offset 2 (body-colored border supplies the offset).
  dot: {width: 8, height: 8, borderRadius: 999},
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 999,
    border: '2px solid var(--color-background-body)',
    boxSizing: 'content-box',
    boxShadow: \`0 0 0 2px \${BRAND_ACCENT}\`,
  },
  // PLAN PANEL — sticky top:52 z15, full-bleed card surface; height auto
  // capped at 260 (16 + 228 + 16 at the 390 stage) so the top-third
  // promise holds from 320–430.
  planPanel: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    maxHeight: 260,
    padding: 16,
    background: 'var(--color-background-card)',
    borderBottom: '1px solid var(--color-border)',
  },
  planSvg: {display: 'block', width: '100%', height: 'auto', maxHeight: 228},
  // ROOM NAV — 56px in-flow row, grid '44px 1fr 44px'.
  roomNav: {
    height: 56,
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    paddingInline: 16,
    gap: 8,
  },
  roomNavBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
  },
  roomNavBtnDisabled: {opacity: 0.35},
  roomTitleStack: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    textAlign: 'center',
  },
  roomTitle: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  roomTitleSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // SECTION HEADER — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom; trailing 'Add item' brand text button
  // (44px hit) is the visible non-gesture path to the sheet.
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '20px 0 8px',
    paddingInlineStart: 32,
    paddingInlineEnd: 16,
    minHeight: 24,
  },
  sectionHeader: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  addItemBtn: {
    height: 44,
    marginBlock: -10,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  cardGap: {height: 12},
  // rowDivider — PASSIVE separator (token hairline legal), inset 68 under
  // the 44px pin column + 16 pad + 8 gap.
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // PUNCH ROW — 72px; swipe track + content; the resolve block sits at
  // the LEFT and the row translates +72 to reveal it.
  rowOuter: {position: 'relative'},
  rowClip: {position: 'relative', overflow: 'hidden'},
  resolveBlock: {
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
    color: BRAND_ON,
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
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
  },
  // 28px pin badge centered in a 44px leading column.
  pinCol: {
    width: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  pinBadge: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    background: 'var(--color-background-card)',
    boxSizing: 'border-box',
  },
  textStack: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  blockerBang: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--color-error)',
  },
  ellipsisBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    marginInlineEnd: 4,
  },
  // Pulse overlay — 2px inset brand ring; animated 1200ms with motion,
  // static (held until next interaction) under reduced motion.
  pulseOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 0,
    boxShadow: \`inset 0 0 0 2px \${BRAND_ACCENT}\`,
    pointerEvents: 'none',
    zIndex: 2,
  },
  // RESOLVED ROW — 60px, struck-through, 20px check in the pin column.
  resolvedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 60,
    paddingInlineStart: 16,
    paddingInlineEnd: 16,
  },
  resolvedCheck: {color: BRAND_ACCENT, display: 'grid', placeItems: 'center', width: 44, flexShrink: 0},
  resolvedTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textDecoration: 'line-through',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // COLLAPSED ROOM ROW — 44px utility row jumping activeZone.
  collapsedRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  collapsedName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  collapsedCount: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  chevron: {color: 'var(--color-text-secondary)', display: 'grid', placeItems: 'center', flexShrink: 0},
  // EMPTY STATE — 'Room clear' variant inside the card (no action button;
  // the resolved card below it carries the struck rows).
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 32,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    textAlign: 'center',
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 12,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  updatedCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '16px 0 24px',
  },
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom mid-scroll (shell-absolute would pin to the DOCUMENT
  // bottom on this tall page); it switches to absolute bottom:76 ONLY
  // while the shell is scroll-locked at 100dvh (sheet/cover open). Always
  // mounted for aria-live. No auto-dismiss timers.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    marginInline: 16,
  },
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    height: 0,
    marginInline: 0,
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    minWidth: 44,
    height: 48,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // HANDOFF LEDGER — 64px sticky bottom (occupies the tabBar slot; no
  // tabBar exists), grid '1fr 1px 1fr auto'.
  ledger: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'grid',
    gridTemplateColumns: '1fr 1px 1fr auto',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  ledgerCol: {minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  ledgerOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ledgerCount: {fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  // Passive separator — token hairline legal.
  ledgerHairline: {width: 1, height: 32, background: 'var(--color-border)'},
  signOffPill: {
    height: 36,
    paddingInline: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  signOffPillReady: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_ACCENT,
    color: BRAND_ON,
  },
  // ANCHORED ELLIPSIS MENU — z35 (above rows, below sheet scrim z40);
  // invisible overlay closes it on outside tap.
  menuOverlay: {position: 'absolute', inset: 0, zIndex: 34},
  menu: {
    position: 'absolute',
    right: 12,
    top: 60,
    zIndex: 35,
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
    paddingInline: 14,
    fontSize: 16,
  },
  menuDivider: {height: 1, background: 'var(--color-border)'},
  menuRowDanger: {color: 'var(--color-error)'},
  // SHEET — scrim z40 + sheet z41; two detents.
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
  fileBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  formField: {display: 'flex', flexDirection: 'column', gap: 8},
  fieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  input: {
    height: 48,
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-background-muted)',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputError: {boxShadow: 'inset 0 0 0 2px var(--color-error)'},
  fieldErrorText: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-error)',
  },
  zoneChipRow: {display: 'flex', flexWrap: 'wrap', gap: 8},
  zoneChip: {
    height: 32,
    paddingInline: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  zoneChipOn: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  // Segmented control — 36px muted track radius 12, active card pill 10.
  segTrack: {
    display: 'flex',
    height: 36,
    padding: 2,
    gap: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  segBtnOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  // SIGN-OFF COVER — absolute inset 0 z50, own navBar.
  cover: {
    position: 'absolute',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-body)',
    overflowY: 'auto',
  },
  coverNavBar: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    height: 52,
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: '44px 1fr auto',
    alignItems: 'center',
    paddingInline: 8,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  coverConfirmBtn: {
    height: 44,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  coverBody: {padding: '8px 0 24px'},
  coverSummaryRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '12px 16px',
  },
  coverSummaryLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  coverSummaryValue: {fontSize: 16, fontWeight: 500, fontVariantNumeric: 'tabular-nums'},
  // ALERT — the sign-off lock is blocking + irreversible, so it earns the
  // rare centered alert; scrim z60 (above the cover), alert z61.
  alertScrim: {position: 'absolute', inset: 0, zIndex: 60, background: SCRIM},
  alert: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: 'min(280px, calc(100% - 64px))',
    zIndex: 61,
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  alertBody: {padding: 20, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center'},
  alertTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  alertText: {fontSize: 13, color: 'var(--color-text-secondary)', margin: 0},
  alertBtnRow: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtn: {
    flex: 1,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
  },
  alertBtnRule: {width: 1, background: 'var(--color-border)'},
  alertCommit: {fontWeight: 600, color: BRAND_ACCENT},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, six zones, 16 punch items, arithmetic locked.
// CROSS-CHECKS (every rendered number derives from ITEMS at render):
//   open by zone  z1=2 z2=4 z3=3 z4=2 z5=0 z6=1 → 2+4+3+2+0+1 = 12 open
//   resolved      p03, p11, p14, p15 = 4;   12 + 4 = 16 total ✓
//   severity of the 12 open: blocker 2 (p07,p10) + functional 5
//     (p02,p04,p05,p09,p13) + cosmetic 5 (p01,p06,p08,p12,p16) = 12 ✓
//   responsibility of the 12 open: venue 7 (p01,p02,p04,p06,p07,p10,p13)
//     + tape 5 (p05,p08,p09,p12,p16) = 12 ✓ → ledger 'VENUE FIXES 7 |
//     WE BRING TAPE 5', pill '12 open'
//   RoomDots: 5 amber (z1,z2,z3,z4,z6) + 1 green (z5) = 6 ✓
// ---------------------------------------------------------------------------

const VENUE = 'Riverside Hall';
const EVENT = 'Meridian Product Summit — load-in Jul 12';
const INSPECTOR = 'Dana Okafor';
const UPDATED_CAPTION = 'Updated just now'; // fixed string — no clock

type ZoneId = 'z1' | 'z2' | 'z3' | 'z4' | 'z5' | 'z6';
type Severity = 'cosmetic' | 'functional' | 'blocker';
type Responsibility = 'venue' | 'tape';

interface ZoneDef {
  id: ZoneId;
  name: string;
  // Plan rect in the 358×228 design space (pre-skew).
  x: number;
  y: number;
  w: number;
  h: number;
  // Where a zone-tap drops the ghost pin / where 'Add item' pins land.
  drop: [number, number];
  // Label lines (Green Room wraps to two so 14-design-unit text fits its
  // 74-wide zone).
  labelLines: string[];
}

// Bar/Green Room are 74 wide (spec said 80): with the spec's skewX(-8)
// the layer needs translate(22.4) to keep the Lobby's bottom-left corner
// at x≥0 (8 + 22.4 − tan8°·216 ≈ 0.05), and at that translate an 80-wide
// Bar's top-right corner would land at 350 + 22.4 − tan8°·64 ≈ 363 > 358.
// 74 wide puts it at 357.4 ✓ — geometry deviation noted in the summary.
const ZONES: ZoneDef[] = [
  {id: 'z1', name: 'Lobby', x: 8, y: 158, w: 96, h: 58, drop: [56, 195], labelLines: ['Lobby']},
  {id: 'z2', name: 'Main Hall', x: 112, y: 64, w: 150, h: 122, drop: [187, 130], labelLines: ['Main Hall']},
  {id: 'z3', name: 'Stage', x: 112, y: 8, w: 150, h: 48, drop: [187, 40], labelLines: ['Stage']},
  {id: 'z4', name: 'Bar', x: 270, y: 64, w: 74, h: 74, drop: [307, 110], labelLines: ['Bar']},
  {id: 'z5', name: 'Green Room', x: 270, y: 146, w: 74, h: 70, drop: [307, 185], labelLines: ['Green', 'Room']},
  {id: 'z6', name: 'Patio', x: 8, y: 64, w: 96, h: 86, drop: [52, 110], labelLines: ['Patio']},
];

const ZONE_BY_ID = Object.fromEntries(ZONES.map(zone => [zone.id, zone])) as Record<ZoneId, ZoneDef>;
const ZONE_ORDER: ZoneId[] = ZONES.map(zone => zone.id);

// Id-derived zone fills, NOT random: pct = 8 + (hash(zoneId) % 5) × 3
// where hash is the char-code sum — precomputed at authoring time into
// this locked table (Lobby 14 · Main Hall 20 · Stage 8 · Bar 17 ·
// Green Room 11 · Patio 14) per the spec fixture.
const ZONE_FILL_PCT: Record<ZoneId, number> = {z1: 14, z2: 20, z3: 8, z4: 17, z5: 11, z6: 14};
const ZONE_FILL = Object.fromEntries(
  ZONE_ORDER.map(id => [
    id,
    \`color-mix(in srgb, \${BRAND_ACCENT} \${ZONE_FILL_PCT[id]}%, var(--color-background-muted))\`,
  ]),
) as Record<ZoneId, string>;

interface PunchItem {
  id: string;
  zoneId: ZoneId;
  title: string;
  severity: Severity;
  responsibility: Responsibility;
  status: 'open' | 'resolved';
  seq: number; // filing order — open groups sort newest-first within severity
  pin: [number, number]; // plan coords inside the zone rect (design space)
}

// PIN_POS — fixed per-item plan coordinates, all inside their zone rects
// (spec pins p07 at (196,120); the rest placed clear of labels + chips).
const PIN_POS: Record<string, [number, number]> = {
  p01: [34, 192],
  p02: [74, 198],
  p03: [52, 178],
  p04: [140, 104],
  p05: [166, 158],
  p06: [232, 152],
  p07: [196, 120],
  p08: [150, 40],
  p09: [184, 40],
  p10: [214, 39],
  p11: [206, 30],
  p12: [290, 100],
  p13: [322, 120],
  p14: [300, 170],
  p15: [326, 192],
  p16: [46, 110],
};

const item = (
  id: string,
  zoneId: ZoneId,
  title: string,
  severity: Severity,
  responsibility: Responsibility,
  status: 'open' | 'resolved',
  seq: number,
): PunchItem => ({id, zoneId, title, severity, responsibility, status, seq, pin: PIN_POS[id]});

const ITEMS: PunchItem[] = [
  item('p01', 'z1', 'Scuffed wall by coat check', 'cosmetic', 'venue', 'open', 1),
  item('p02', 'z1', 'Loose threshold plate at entry', 'functional', 'venue', 'open', 2),
  item('p03', 'z1', 'Replace lobby sign vinyl', 'cosmetic', 'venue', 'resolved', 3),
  item('p04', 'z2', 'Dead outlet, stage-left wall', 'functional', 'venue', 'open', 4),
  item('p05', 'z2', 'Tape down FOH cable run before doors — production owns gaff', 'functional', 'tape', 'open', 5),
  item('p06', 'z2', 'Chipped floor paint at row C', 'cosmetic', 'venue', 'open', 6),
  item('p07', 'z2', 'Rigging point cert missing', 'blocker', 'venue', 'open', 7),
  item('p08', 'z3', 'Gaff the stage lip edge', 'cosmetic', 'tape', 'open', 8),
  item('p09', 'z3', 'Monitor wedge XLR frayed', 'functional', 'tape', 'open', 9),
  item('p10', 'z3', 'Trapdoor latch will not lock', 'blocker', 'venue', 'open', 10),
  item('p11', 'z3', 'Sweep stage of loose screws', 'cosmetic', 'venue', 'resolved', 11),
  item('p12', 'z4', 'Label allergen shelf behind bar', 'cosmetic', 'tape', 'open', 12),
  item('p13', 'z4', 'Ice machine drain leak', 'functional', 'venue', 'open', 13),
  item('p14', 'z5', 'Mirror light bulb out', 'functional', 'venue', 'resolved', 14),
  item('p15', 'z5', 'Steam-clean couch stain', 'cosmetic', 'venue', 'resolved', 15),
  item('p16', 'z6', 'Mark trip edge on patio step', 'cosmetic', 'tape', 'open', 16),
];

const SEV_ORDER: Record<Severity, number> = {blocker: 0, functional: 1, cosmetic: 2};
const SEV_LABEL: Record<Severity, string> = {cosmetic: 'Cosmetic', functional: 'Functional', blocker: 'Blocker'};
const RESP_LABEL: Record<Responsibility, string> = {venue: 'Venue fixes', tape: 'We bring tape'};
// Severity double-encodes as ring THICKNESS (2/4/6) + ring color (blocker
// flips to the error token) + the 11px '!' meta suffix — never color-only.
const SEV_RING_WIDTH: Record<Severity, number> = {cosmetic: 2, functional: 4, blocker: 6};

// ---------------------------------------------------------------------------
// DERIVATIONS — every aggregate recomputes from the items array at render;
// no stored copies anywhere (stress fixture 4 is grep-proof of this).
// ---------------------------------------------------------------------------

function countOpen(items: PunchItem[], zoneId?: ZoneId): number {
  return items.filter(it => it.status === 'open' && (zoneId == null || it.zoneId === zoneId)).length;
}

function countResolved(items: PunchItem[], zoneId?: ZoneId): number {
  return items.filter(it => it.status === 'resolved' && (zoneId == null || it.zoneId === zoneId)).length;
}

function countOpenBy(items: PunchItem[], responsibility: Responsibility): number {
  return items.filter(it => it.status === 'open' && it.responsibility === responsibility).length;
}

/** Open rows: blockers → functional → cosmetic, newest-first inside each. */
function sortOpen(items: PunchItem[]): PunchItem[] {
  return [...items].sort(
    (a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || b.seq - a.seq,
  );
}

function itemNumber(id: string): number {
  return Number(id.slice(1));
}

function rowDomId(id: string): string {
  return \`svp-row-\${id}\`;
}

function roomDomId(zoneId: ZoneId): string {
  return \`svp-room-\${zoneId}\`;
}

// ---------------------------------------------------------------------------
// HOOKS + FOCUS UTILITIES
// ---------------------------------------------------------------------------

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

/** In-file reduced-motion guard — pulses are removed, sheet fades. */
function useReducedMotion(): boolean {
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

/** Sheets/cover/alert trap Tab while open; Escape closes topmost only. */
function trapTabKey(event: ReactKeyboardEvent<HTMLElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), input, textarea');
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

function scrollToDomId(id: string): void {
  // behavior 'auto' always — deterministic, and the reduced-motion contract
  // asks exactly this for programmatic jumps.
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({block: 'nearest', behavior: 'auto'});
  });
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — usePunchList(): the \`punchList\` object + update(id,
// patch) for per-item patches + set() for top-level fields. All aggregates
// derive via filters at render.
// ---------------------------------------------------------------------------

interface SheetState {
  detent: 'medium' | 'large';
  zoneId: ZoneId;
  pendingPinXY: [number, number];
  editingId: string | null;
  startWithPicker: boolean;
}

interface ToastState {
  seq: number;
  msg: string;
  // Exact pre-mutation items array — Undo restores it in ONE assignment
  // (row position, chip, ledger split, dot color, plan tint all revert
  // because every one of those derives from items).
  snapshot: PunchItem[] | null;
}

interface PunchListState {
  items: PunchItem[];
  activeZone: ZoneId;
  sheet: SheetState | null;
  openSwipeRowId: string | null;
  menuForId: string | null;
  cover: 'signoff' | null;
  alertOpen: boolean;
  signedOff: boolean;
  toast: ToastState | null;
  highlightId: string | null;
}

const INITIAL_STATE: PunchListState = {
  items: ITEMS,
  activeZone: 'z2',
  sheet: null,
  openSwipeRowId: null,
  menuForId: null,
  cover: null,
  alertOpen: false,
  signedOff: false,
  toast: null,
  highlightId: null,
};

function usePunchList() {
  const [punchList, setPunchList] = useState<PunchListState>(INITIAL_STATE);
  const update = useCallback((id: string, patch: Partial<PunchItem>) => {
    setPunchList(prev => ({
      ...prev,
      items: prev.items.map(it => (it.id === id ? {...it, ...patch} : it)),
    }));
  }, []);
  const set = useCallback((patch: Partial<PunchListState>) => {
    setPunchList(prev => ({...prev, ...patch}));
  }, []);
  return {punchList, update, set, setPunchList};
}

// ---------------------------------------------------------------------------
// BRAND MARK — 24px Snagline glyph (clipboard with a map-pin clip and one
// strikethrough row) in a 44×44 non-button nav slot.
// ---------------------------------------------------------------------------

function SnaglineMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x={4.5} y={4} width={15} height={17} rx={2.5} stroke="var(--color-text-primary)" strokeWidth={1.7} />
        {/* map-pin clip at the clipboard head; dot in BRAND_ACCENT */}
        <path
          d="M12 1.6c-1.9 0-3.4 1.5-3.4 3.4 0 1.4 3.4 4 3.4 4s3.4-2.6 3.4-4c0-1.9-1.5-3.4-3.4-3.4Z"
          fill="var(--color-background-body)"
          stroke="var(--color-text-primary)"
          strokeWidth={1.5}
        />
        <circle cx={12} cy={4.9} r={1.4} fill={BRAND_ACCENT} />
        {/* one struck row + one open row */}
        <line x1={7.5} y1={13} x2={16.5} y2={13} stroke="var(--color-text-primary)" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={7.5} y1={17} x2={13.5} y2={17} stroke="var(--color-text-primary)" strokeWidth={1.5} strokeLinecap="round" opacity={0.45} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// ROOM DOTS — navBar-center radiogroup rail: six 24×44 radio buttons (8px
// visual dot, 10px + 2px brand ring when active), 6×24 + 5×8 = 184px, legal
// via the adjacent-target merge clause. Dot color: amber while the zone has
// open items, green (brand pair) at zero — state never color-only, the
// aria-labels carry the counts. ArrowLeft/ArrowRight move rooms (same
// handler as the Prev/Next buttons).
// ---------------------------------------------------------------------------

interface RoomDotsProps {
  items: PunchItem[];
  activeZone: ZoneId;
  onSelect: (zoneId: ZoneId) => void;
}

function RoomDots({items, activeZone, onSelect}: RoomDotsProps) {
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = ZONE_ORDER.indexOf(activeZone);
  const handleKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = event.key === 'ArrowLeft' ? Math.max(0, activeIndex - 1) : Math.min(ZONE_ORDER.length - 1, activeIndex + 1);
    if (next === activeIndex) return;
    onSelect(ZONE_ORDER[next]);
    btnRefs.current[next]?.focus();
  };
  return (
    <div style={styles.dotsRail} role="radiogroup" aria-label="Rooms" onKeyDown={handleKey}>
      {ZONES.map((zone, index) => {
        const open = countOpen(items, zone.id);
        const isActive = zone.id === activeZone;
        return (
          <button
            key={zone.id}
            ref={el => {
              btnRefs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={\`\${zone.name} — \${open} open\`}
            tabIndex={isActive ? 0 : -1}
            className="svp-btn svp-focusable"
            style={styles.dotBtn}
            onClick={() => onSelect(zone.id)}>
            <span
              style={{
                ...(isActive ? styles.dotActive : styles.dot),
                background: open > 0 ? AMBER_DOT : BRAND_ACCENT,
              }}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ZONE PLAN — 358×228 inline SVG. The zone layer carries the isometric
// feel: transform 'translate(22.4 0) skewX(-8)' (22.4 keeps every skewed
// corner inside the design space — see ZONES comment); labels, chips, and
// pins counter-skew with local 'translate(x y) skewX(8)' groups so glyphs
// stay upright. Pins render as SIBLINGS of the zone buttons (never nested
// interactive controls). SVG text is 14 design-units: the plan renders
// 288px wide at the 320 stage (scale ×0.804), so 14 → ≈11.3px rendered ≥
// the 11px floor (spec said 13; 13 × 0.804 ≈ 10.5 < 11 — corrected, noted
// as deviation). SVG text uses var(--color-text-primary).
// ---------------------------------------------------------------------------

const SKEW_TX = 22.4;

interface ZonePlanProps {
  items: PunchItem[];
  activeZone: ZoneId;
  ghost: {zoneId: ZoneId; xy: [number, number]} | null;
  highlightId: string | null;
  reducedMotion: boolean;
  onZoneTap: (zoneId: ZoneId, opener: HTMLElement) => void;
  onPinTap: (target: PunchItem) => void;
}

function ZonePlan({items, activeZone, ghost, highlightId, reducedMotion, onZoneTap, onPinTap}: ZonePlanProps) {
  return (
    <svg viewBox="0 0 358 228" preserveAspectRatio="xMidYMid meet" style={styles.planSvg} aria-label={\`\${VENUE} floorplan\`} role="group">
      <g transform={\`translate(\${SKEW_TX} 0) skewX(-8)\`}>
        {/* Zone layer — each zone is a real focusable button. */}
        {ZONES.map(zone => {
          const open = countOpen(items, zone.id);
          const isActive = zone.id === activeZone;
          const isClear = open === 0;
          return (
            <g
              key={zone.id}
              className="svp-zone"
              role="button"
              tabIndex={0}
              aria-label={\`\${zone.name}, \${open} open item\${open === 1 ? '' : 's'} — add item here\`}
              onClick={event => onZoneTap(zone.id, event.currentTarget as unknown as HTMLElement)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onZoneTap(zone.id, event.currentTarget as unknown as HTMLElement);
                }
              }}>
              <rect
                className="svp-zone-shape"
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                rx={6}
                fill={isClear ? RESOLVED_TINT : ZONE_FILL[zone.id]}
                stroke={isActive ? BRAND_ACCENT : ZONE_EDGE}
                strokeWidth={isActive ? 2 : 1}
                strokeLinejoin="round"
              />
              {/* zone label — counter-skewed, upright */}
              <g transform={\`translate(\${zone.x + 8} \${zone.y + 18}) skewX(8)\`} pointerEvents="none">
                <text fontSize={14} fontWeight={500} fill="var(--color-text-primary)">
                  {zone.labelLines.map((line, lineIndex) => (
                    <tspan key={line} x={0} dy={lineIndex === 0 ? 0 : 15}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
              {/* count chip top-right — flips to a check glyph at 0 open */}
              <g transform={\`translate(\${zone.x + zone.w - 36} \${zone.y + 6}) skewX(8)\`} pointerEvents="none">
                {isClear ? (
                  <g>
                    <circle cx={15} cy={10} r={9} fill="var(--color-background-card)" stroke={BRAND_ACCENT} strokeWidth={2} />
                    <path
                      d="M11 10.2l2.6 2.6 5.2-5.6"
                      fill="none"
                      stroke={BRAND_ACCENT}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ) : (
                  <g>
                    <rect width={30} height={20} rx={10} fill="var(--color-background-card)" stroke="var(--color-border)" strokeWidth={1} />
                    <text
                      x={15}
                      y={14.5}
                      textAnchor="middle"
                      fontSize={14}
                      fontWeight={600}
                      fill="var(--color-text-primary)"
                      style={{fontVariantNumeric: 'tabular-nums'}}>
                      {open}
                    </text>
                  </g>
                )}
              </g>
            </g>
          );
        })}
        {/* Pins layer — siblings of the zone buttons; a resolved zone's pin
            layer dims to 0.35 (resolved items render no pin at all). */}
        {ZONES.map(zone => {
          const zoneOpen = items.filter(it => it.zoneId === zone.id && it.status === 'open');
          return (
            <g key={\`pins-\${zone.id}\`} opacity={zoneOpen.length === 0 ? 0.35 : 1}>
              {zoneOpen.map(pinItem => {
                const num = itemNumber(pinItem.id);
                const isBlocker = pinItem.severity === 'blocker';
                const highlighted = highlightId === pinItem.id;
                return (
                  <g
                    key={pinItem.id}
                    className="svp-pin"
                    role="button"
                    tabIndex={0}
                    aria-label={\`Item \${num}, \${SEV_LABEL[pinItem.severity].toLowerCase()}, \${pinItem.title}\`}
                    transform={\`translate(\${pinItem.pin[0]} \${pinItem.pin[1]}) skewX(8)\`}
                    onClick={() => onPinTap(pinItem)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onPinTap(pinItem);
                      }
                    }}>
                    {/* transparent 44px-diameter hit circle behind the 28px pin */}
                    <circle className="svp-pin-hit" r={22} fill="transparent" stroke="none" />
                    {highlighted ? (
                      <circle
                        r={18}
                        fill="none"
                        stroke={BRAND_ACCENT}
                        strokeWidth={2}
                        className={reducedMotion ? undefined : 'svp-pin-pulse'}
                      />
                    ) : null}
                    <circle
                      r={14}
                      fill="var(--color-background-card)"
                      stroke={isBlocker ? 'var(--color-error)' : BRAND_ACCENT}
                      strokeWidth={SEV_RING_WIDTH[pinItem.severity]}
                    />
                    <text
                      y={5}
                      textAnchor="middle"
                      fontSize={14}
                      fontWeight={700}
                      fill="var(--color-text-primary)"
                      style={{fontVariantNumeric: 'tabular-nums'}}>
                      {num}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
        {/* Provisional dashed ghost pin while the sheet is open. */}
        {ghost != null ? (
          <g transform={\`translate(\${ghost.xy[0]} \${ghost.xy[1]}) skewX(8)\`} pointerEvents="none">
            <circle r={14} fill="none" stroke={BRAND_ACCENT} strokeWidth={2} strokeDasharray="4 4" />
          </g>
        ) : null}
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PUNCH ROW — 72px; leading swipe (pointer drag rightward, snap open at
// +72px) reveals a left-side BRAND_ACCENT Resolve block (BRAND_ON text —
// contrast pair at the declaration). MANDATORY fallback: the visible
// 44×44 ellipsis opens the same actions as an anchored menu. One row open
// at a time; tap elsewhere closes. Resolve executes IMMEDIATELY
// (undoOverConfirm) — the toast carries the snapshot.
// ---------------------------------------------------------------------------

type MenuAction = 'resolve' | 'edit' | 'reassign' | 'delete';

interface PunchRowProps {
  rowItem: PunchItem;
  swipeOpen: boolean;
  highlighted: boolean;
  reducedMotion: boolean;
  menuOpen: boolean;
  showDivider: boolean;
  onSwipeOpenChange: (open: boolean) => void;
  onRowTap: () => void;
  onResolve: () => void;
  onMenuToggle: (opener: HTMLElement) => void;
  onMenuAction: (action: MenuAction) => void;
}

function PunchRow({
  rowItem,
  swipeOpen,
  highlighted,
  reducedMotion,
  menuOpen,
  showDivider,
  onSwipeOpenChange,
  onRowTap,
  onResolve,
  onMenuToggle,
  onMenuAction,
}: PunchRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const dragRef = useRef<{startX: number; base: number; moved: boolean} | null>(null);
  const suppressClickRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuOpen) {
      menuRef.current?.querySelector<HTMLElement>('button')?.focus({preventScroll: true});
    }
  }, [menuOpen]);

  const num = itemNumber(rowItem.id);
  const isBlocker = rowItem.severity === 'blocker';
  const translate = dragX ?? (swipeOpen ? 72 : 0);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = {startX: event.clientX, base: swipeOpen ? 72 : 0, moved: false};
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag == null) return;
    const dx = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) > 8) {
      drag.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (drag.moved) {
      setDragX(Math.max(0, Math.min(72, drag.base + dx)));
    }
  };
  const endDrag = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.moved) {
      suppressClickRef.current = true;
      onSwipeOpenChange((dragX ?? 0) > 36);
      requestAnimationFrame(() => {
        suppressClickRef.current = false;
      });
    }
    setDragX(null);
  };

  const sevMeta = \`\${SEV_LABEL[rowItem.severity]} · \${RESP_LABEL[rowItem.responsibility]}\`;

  return (
    <div style={styles.rowOuter} id={rowDomId(rowItem.id)}>
      <div style={styles.rowClip}>
        <button
          type="button"
          className="svp-btn svp-focusable"
          style={styles.resolveBlock}
          tabIndex={swipeOpen ? 0 : -1}
          aria-hidden={!swipeOpen}
          onClick={onResolve}>
          <Icon icon={CheckIcon} size="sm" />
          Resolve
        </button>
        <div
          className={dragX == null ? 'svp-swipe' : undefined}
          style={{...styles.rowContent, transform: \`translateX(\${translate}px)\`}}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}>
          {highlighted ? (
            <span
              style={styles.pulseOverlay}
              className={reducedMotion ? undefined : 'svp-row-pulse'}
              aria-hidden
            />
          ) : null}
          <button
            type="button"
            className="svp-btn svp-focusable"
            style={styles.rowBtn}
            aria-label={rowItem.title}
            onClick={() => {
              if (suppressClickRef.current) return;
              if (swipeOpen) {
                onSwipeOpenChange(false);
                return;
              }
              onRowTap();
            }}>
            <span style={styles.pinCol} aria-hidden>
              <span
                style={{
                  ...styles.pinBadge,
                  border: \`\${SEV_RING_WIDTH[rowItem.severity]}px solid \${isBlocker ? 'var(--color-error)' : BRAND_ACCENT}\`,
                }}>
                {num}
              </span>
            </span>
            <span style={styles.textStack}>
              <span style={styles.rowTitle}>{rowItem.title}</span>
              <span style={styles.rowMeta}>
                {sevMeta}
                {isBlocker ? <span style={styles.blockerBang}> !</span> : null}
              </span>
            </span>
          </button>
          <button
            type="button"
            className="svp-btn svp-focusable"
            style={styles.ellipsisBtn}
            aria-label={\`Actions for \${rowItem.title}\`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={event => onMenuToggle(event.currentTarget)}>
            <Icon icon={MoreHorizontalIcon} size="sm" />
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div ref={menuRef} style={styles.menu} role="menu" aria-label={\`Actions for \${rowItem.title}\`}>
          <button type="button" role="menuitem" className="svp-btn svp-focusable" style={styles.menuRow} onClick={() => onMenuAction('resolve')}>
            Resolve
          </button>
          <div style={styles.menuDivider} />
          <button type="button" role="menuitem" className="svp-btn svp-focusable" style={styles.menuRow} onClick={() => onMenuAction('edit')}>
            Edit
          </button>
          <div style={styles.menuDivider} />
          <button type="button" role="menuitem" className="svp-btn svp-focusable" style={styles.menuRow} onClick={() => onMenuAction('reassign')}>
            Reassign zone
          </button>
          <div style={styles.menuDivider} />
          <button
            type="button"
            role="menuitem"
            className="svp-btn svp-focusable"
            style={{...styles.menuRow, ...styles.menuRowDanger}}
            onClick={() => onMenuAction('delete')}>
            Delete
          </button>
        </div>
      ) : null}
      {showDivider ? <div style={styles.rowDivider} /> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SEGMENTED CONTROL — 36px muted track (radius 12), active card pill
// (radius 10); radiogroup with roving tabIndex + arrow keys.
// ---------------------------------------------------------------------------

interface SegmentedProps<T extends string> {
  label: string;
  options: Array<{value: T; label: string}>;
  value: T;
  onChange: (value: T) => void;
}

function Segmented<T extends string>({label, options, value, onChange}: SegmentedProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = options.findIndex(option => option.value === value);
  const handleKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next =
      event.key === 'ArrowLeft' ? Math.max(0, activeIndex - 1) : Math.min(options.length - 1, activeIndex + 1);
    if (next === activeIndex) return;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div style={styles.formField}>
      <span style={styles.fieldLabel}>{label}</span>
      <div role="radiogroup" aria-label={label} style={styles.segTrack} onKeyDown={handleKey}>
        {options.map((option, index) => {
          const isOn = option.value === value;
          return (
            <button
              key={option.value}
              ref={el => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isOn}
              tabIndex={isOn ? 0 : -1}
              className="svp-btn svp-focusable"
              style={{...styles.segBtn, ...(isOn ? styles.segBtnOn : null)}}
              onClick={() => onChange(option.value)}>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NEW-ITEM SHEET — two detents (medium 55%, large calc(100% − 56px)); 24px
// grabber zone with a REAL resize button, 52px header, content is the one
// legal inner scroller, sticky 48px 'File item' footer (always enabled —
// invalid submit focuses the first invalid field). Zone chip is pre-tagged
// and tappable to reveal a 6-chip zone picker row inside the sheet (no
// second sheet). Title validates on BLUR ('Name the snag'), error clears
// the moment the value becomes valid while typing. Focus enters the title
// field with {preventScroll:true} — plain .focus() would scroll-reveal the
// animating sheet inside the locked column and beach it mid-screen.
// ---------------------------------------------------------------------------

interface SheetDraft {
  title: string;
  severity: Severity;
  responsibility: Responsibility;
  notes: string;
}

interface NewItemSheetProps {
  sheet: SheetState;
  editingItem: PunchItem | null;
  onClose: () => void;
  onToggleDetent: () => void;
  onZonePick: (zoneId: ZoneId) => void;
  onSubmit: (draft: SheetDraft) => void;
}

function NewItemSheet({sheet, editingItem, onClose, onToggleDetent, onZonePick, onSubmit}: NewItemSheetProps) {
  const [draft, setDraft] = useState<SheetDraft>(() => ({
    title: editingItem?.title ?? '',
    severity: editingItem?.severity ?? 'cosmetic',
    responsibility: editingItem?.responsibility ?? 'venue',
    notes: '',
  }));
  const [titleError, setTitleError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(sheet.startWithPicker);
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus({preventScroll: true});
  }, []);

  const zone = ZONE_BY_ID[sheet.zoneId];
  const isEdit = editingItem != null;

  const submit = () => {
    if (draft.title.trim().length === 0) {
      setTitleError('Name the snag');
      titleRef.current?.scrollIntoView({block: 'nearest', behavior: 'auto'});
      titleRef.current?.focus({preventScroll: true});
      return;
    }
    onSubmit({...draft, title: draft.title.trim()});
  };

  return (
    <div
      ref={sheetRef}
      className="svp-sheet-in"
      style={{...styles.sheet, height: sheet.detent === 'medium' ? '55%' : 'calc(100% - 56px)'}}
      role="dialog"
      aria-modal="true"
      aria-labelledby="svp-sheet-title"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}>
      <div style={styles.grabberZone}>
        <button
          type="button"
          className="svp-btn svp-focusable"
          aria-label="Resize sheet"
          onClick={onToggleDetent}
          style={{paddingInline: 24, paddingBlock: 6, borderRadius: 999}}>
          <span style={styles.grabberPill} aria-hidden />
        </button>
      </div>
      <div style={styles.sheetHeader}>
        <span />
        <h2 id="svp-sheet-title" style={styles.sheetTitle}>
          {isEdit ? 'Edit punch item' : 'New punch item'}
        </h2>
        <button type="button" className="svp-btn svp-focusable" style={styles.iconBtn} aria-label="Close" onClick={onClose}>
          <Icon icon={XIcon} size="sm" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <div style={styles.formField}>
          <span style={styles.fieldLabel}>Zone</span>
          <div style={styles.zoneChipRow}>
            <button
              type="button"
              className="svp-btn svp-focusable"
              style={{...styles.zoneChip, ...styles.zoneChipOn}}
              aria-expanded={pickerOpen}
              aria-label={\`Zone: \${zone.name} — change zone\`}
              onClick={() => setPickerOpen(open => !open)}>
              {zone.name}
              <Icon icon={ChevronRightIcon} size="sm" />
            </button>
          </div>
          {pickerOpen ? (
            <div style={styles.zoneChipRow} role="radiogroup" aria-label="Pick a zone">
              {ZONES.map(option => {
                const isOn = option.id === sheet.zoneId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isOn}
                    className="svp-btn svp-focusable"
                    style={{...styles.zoneChip, ...(isOn ? styles.zoneChipOn : null)}}
                    onClick={() => onZonePick(option.id)}>
                    {option.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
        <div style={styles.formField}>
          <label style={styles.fieldLabel} htmlFor="svp-title-input">
            Title
          </label>
          <input
            id="svp-title-input"
            ref={titleRef}
            type="text"
            maxLength={80}
            style={{...styles.input, ...(titleError != null ? styles.inputError : null)}}
            className="svp-focusable"
            value={draft.title}
            placeholder="What needs fixing?"
            aria-invalid={titleError != null}
            aria-describedby={titleError != null ? 'svp-title-error' : undefined}
            onChange={event => {
              const title = event.target.value;
              setDraft(prev => ({...prev, title}));
              if (titleError != null && title.trim().length > 0) {
                setTitleError(null);
              }
            }}
            onBlur={() => {
              if (draft.title.trim().length === 0) {
                setTitleError('Name the snag');
              }
            }}
          />
          {titleError != null ? (
            <span id="svp-title-error" style={styles.fieldErrorText}>
              <Icon icon={AlertCircleIcon} size="sm" />
              {titleError}
            </span>
          ) : null}
        </div>
        <Segmented<Severity>
          label="Severity"
          value={draft.severity}
          onChange={severity => setDraft(prev => ({...prev, severity}))}
          options={[
            {value: 'cosmetic', label: 'Cosmetic'},
            {value: 'functional', label: 'Functional'},
            {value: 'blocker', label: 'Blocker'},
          ]}
        />
        <Segmented<Responsibility>
          label="Responsibility"
          value={draft.responsibility}
          onChange={responsibility => setDraft(prev => ({...prev, responsibility}))}
          options={[
            {value: 'venue', label: 'Venue fixes'},
            {value: 'tape', label: 'We bring tape'},
          ]}
        />
        <div style={styles.formField}>
          <label style={styles.fieldLabel} htmlFor="svp-notes-input">
            Notes (optional)
          </label>
          <input
            id="svp-notes-input"
            type="text"
            style={styles.input}
            className="svp-focusable"
            value={draft.notes}
            placeholder="Context for the venue crew"
            onChange={event => {
              const notes = event.target.value;
              setDraft(prev => ({...prev, notes}));
            }}
          />
        </div>
      </div>
      <div style={styles.sheetFooter}>
        <button type="button" className="svp-btn svp-focusable" style={styles.fileBtn} onClick={submit}>
          {isEdit ? 'Save changes' : 'File item'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Snagline venue punch walkthrough.
// ---------------------------------------------------------------------------

export default function MobileVenuePunchWalkthroughTemplate() {
  const {punchList, set, setPunchList} = usePunchList();
  const reducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(wrapRef);
  const isDesktop = width >= 720;
  const toastSeq = useRef(0);
  // Focus restore — sheet/cover share one opener slot (they never coexist
  // with each other in this template), the anchored menu has its own.
  const overlayOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const coverCloseRef = useRef<HTMLButtonElement>(null);
  const alertCancelRef = useRef<HTMLButtonElement>(null);

  const {items, activeZone, sheet, openSwipeRowId, menuForId, cover, alertOpen, signedOff, toast, highlightId} =
    punchList;

  // Derived aggregates — recomputed every render, never stored.
  const openTotal = countOpen(items);
  const venueOpen = countOpenBy(items, 'venue');
  const tapeOpen = countOpenBy(items, 'tape');
  const activeZoneDef = ZONE_BY_ID[activeZone];
  const activeIndex = ZONE_ORDER.indexOf(activeZone);
  const scrollLocked = sheet != null || cover != null;
  const editingItem = sheet?.editingId != null ? items.find(it => it.id === sheet.editingId) ?? null : null;

  const mkToast = (msg: string, snapshot: PunchItem[] | null = null): ToastState => {
    toastSeq.current += 1;
    return {seq: toastSeq.current, msg, snapshot};
  };

  const restoreFocus = (slot: {current: HTMLElement | null}) => {
    slot.current?.focus();
    slot.current = null;
  };

  // Pulse lifetime — 1200ms with motion; under reduced motion the static
  // highlight is held until the next interaction clears it.
  useEffect(() => {
    if (highlightId == null || reducedMotion) return undefined;
    const timer = window.setTimeout(() => set({highlightId: null}), 1200);
    return () => window.clearTimeout(timer);
  }, [highlightId, reducedMotion, set]);

  // Escape closes the TOPMOST overlay only: alert > menu > sheet > cover.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (alertOpen) {
        set({alertOpen: false});
        return;
      }
      if (menuForId != null) {
        set({menuForId: null});
        restoreFocus(menuOpenerRef);
        return;
      }
      if (sheet != null) {
        set({sheet: null});
        restoreFocus(overlayOpenerRef);
        return;
      }
      if (cover != null) {
        set({cover: null});
        restoreFocus(overlayOpenerRef);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [alertOpen, menuForId, sheet, cover, set]);

  // Overlay entry focus (the sheet handles its own title-field focus).
  useEffect(() => {
    if (cover != null) {
      coverCloseRef.current?.focus({preventScroll: true});
    }
  }, [cover]);
  useEffect(() => {
    if (alertOpen) {
      alertCancelRef.current?.focus({preventScroll: true});
    }
  }, [alertOpen]);

  const openSheetForZone = (
    zoneId: ZoneId,
    xy: [number, number],
    opener: HTMLElement,
    editingId: string | null = null,
    startWithPicker = false,
  ) => {
    if (signedOff) {
      set({toast: mkToast('Punch list is locked — walkthrough signed off')});
      return;
    }
    overlayOpenerRef.current = opener;
    set({
      sheet: {detent: 'medium', zoneId, pendingPinXY: xy, editingId, startWithPicker},
      menuForId: null,
      openSwipeRowId: null,
      highlightId: null,
    });
  };

  const closeSheet = () => {
    set({sheet: null});
    restoreFocus(overlayOpenerRef);
  };

  // File / save — ONE commit: append or patch the item, close + unlock,
  // jump to the item's room, re-sort (derived), pulse pin + row, recompute
  // chips + ledger + dots (all derived), announce via the toast dock.
  const submitSheet = (draft: SheetDraft) => {
    const current = sheet;
    if (current == null) return;
    if (current.editingId != null) {
      const targetId = current.editingId;
      setPunchList(prev => {
        const prevItem = prev.items.find(it => it.id === targetId);
        const zoneChanged = prevItem != null && prevItem.zoneId !== current.zoneId;
        return {
          ...prev,
          items: prev.items.map(it =>
            it.id === targetId
              ? {
                  ...it,
                  title: draft.title,
                  severity: draft.severity,
                  responsibility: draft.responsibility,
                  zoneId: current.zoneId,
                  // A reassigned item re-pins at its new zone's drop point.
                  pin: zoneChanged ? ZONE_BY_ID[current.zoneId].drop : it.pin,
                }
              : it,
          ),
          sheet: null,
          activeZone: current.zoneId,
          highlightId: targetId,
          toast: mkToast(\`Item updated in \${ZONE_BY_ID[current.zoneId].name}\`),
        };
      });
      scrollToDomId(rowDomId(targetId));
    } else {
      const nextNum = items.reduce((max, it) => Math.max(max, itemNumber(it.id)), 0) + 1;
      const id = \`p\${String(nextNum).padStart(2, '0')}\`;
      const maxSeq = items.reduce((max, it) => Math.max(max, it.seq), 0);
      const newItem: PunchItem = {
        id,
        zoneId: current.zoneId,
        title: draft.title,
        severity: draft.severity,
        responsibility: draft.responsibility,
        status: 'open',
        seq: maxSeq + 1,
        pin: current.pendingPinXY,
      };
      setPunchList(prev => ({
        ...prev,
        items: [...prev.items, newItem],
        sheet: null,
        activeZone: current.zoneId,
        highlightId: id,
        toast: mkToast(\`Item filed to \${ZONE_BY_ID[current.zoneId].name}\`),
      }));
      scrollToDomId(rowDomId(id));
    }
    restoreFocus(overlayOpenerRef);
  };

  // Resolve/delete execute IMMEDIATELY (undoOverConfirm); the toast holds
  // the exact pre-mutation snapshot. One toast at a time, no timers — a
  // second mutation replaces the first and its undo window ends silently.
  const resolveItem = (id: string) => {
    setPunchList(prev => {
      const target = prev.items.find(it => it.id === id);
      if (target == null || target.status !== 'open') return prev;
      const snapshot = prev.items;
      const nextItems = prev.items.map(it => (it.id === id ? {...it, status: 'resolved' as const} : it));
      const zoneOpenAfter = countOpen(nextItems, target.zoneId);
      const msg = zoneOpenAfter === 0 ? \`Resolved — \${ZONE_BY_ID[target.zoneId].name} clear\` : 'Item resolved';
      return {
        ...prev,
        items: nextItems,
        openSwipeRowId: null,
        menuForId: null,
        highlightId: null,
        toast: mkToast(msg, snapshot),
      };
    });
  };

  const deleteItem = (id: string) => {
    setPunchList(prev => {
      const target = prev.items.find(it => it.id === id);
      if (target == null) return prev;
      return {
        ...prev,
        items: prev.items.filter(it => it.id !== id),
        openSwipeRowId: null,
        menuForId: null,
        highlightId: null,
        toast: mkToast('Item deleted', prev.items),
      };
    });
  };

  const undo = () => {
    setPunchList(prev => {
      if (prev.toast?.snapshot == null) return prev;
      return {...prev, items: prev.toast.snapshot, toast: mkToast('Restored')};
    });
  };

  // Room change closes open overlays (menu, sheet, swipe); toast persists.
  const selectRoom = (zoneId: ZoneId, scroll = true) => {
    set({activeZone: zoneId, sheet: null, menuForId: null, openSwipeRowId: null, highlightId: null});
    if (scroll) {
      scrollToDomId(roomDomId(zoneId));
    }
  };

  const onPinTap = (target: PunchItem) => {
    setPunchList(prev => ({
      ...prev,
      activeZone: target.zoneId,
      sheet: null,
      menuForId: null,
      openSwipeRowId: null,
      highlightId: target.id,
    }));
    scrollToDomId(rowDomId(target.id));
  };

  const onMenuToggle = (id: string, opener: HTMLElement) => {
    if (menuForId === id) {
      set({menuForId: null});
      restoreFocus(menuOpenerRef);
      return;
    }
    menuOpenerRef.current = opener;
    set({menuForId: id, openSwipeRowId: null});
  };

  const onMenuAction = (target: PunchItem, action: MenuAction) => {
    if (action === 'resolve') {
      resolveItem(target.id);
      return;
    }
    if (action === 'delete') {
      deleteItem(target.id);
      return;
    }
    const opener = menuOpenerRef.current ?? document.body;
    openSheetForZone(target.zoneId, target.pin, opener, target.id, action === 'reassign');
  };

  // Sign-off — the pill stays ENABLED at all times: with items open it
  // jumps to the first open room and nags via the toast (no dead disabled
  // button); at zero open it opens the sign-off cover.
  const onSignOff = (opener: HTMLElement) => {
    if (signedOff) {
      set({toast: mkToast('Walkthrough already signed off')});
      return;
    }
    if (openTotal > 0) {
      const firstOpen = ZONE_ORDER.find(zoneId => countOpen(items, zoneId) > 0) ?? 'z1';
      setPunchList(prev => ({
        ...prev,
        activeZone: firstOpen,
        sheet: null,
        menuForId: null,
        openSwipeRowId: null,
        toast: mkToast(\`Resolve \${openTotal} open item\${openTotal === 1 ? '' : 's'} to sign off\`),
      }));
      scrollToDomId(roomDomId(firstOpen));
      return;
    }
    overlayOpenerRef.current = opener;
    set({cover: 'signoff'});
  };

  const closeCover = () => {
    set({cover: null, alertOpen: false});
    restoreFocus(overlayOpenerRef);
  };

  const confirmSignOff = () => {
    set({
      alertOpen: false,
      cover: null,
      signedOff: true,
      toast: mkToast('Walkthrough signed off — punch list locked'),
    });
    restoreFocus(overlayOpenerRef);
  };

  const ghost = sheet != null && sheet.editingId == null ? {zoneId: sheet.zoneId, xy: sheet.pendingPinXY} : null;
  const closedVenue = items.filter(it => it.status === 'resolved' && it.responsibility === 'venue').length;
  const closedTape = items.filter(it => it.status === 'resolved' && it.responsibility === 'tape').length;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SNAGLINE_CSS}</style>
      <div
        style={{
          ...styles.shell,
          ...(scrollLocked ? styles.shellLocked : null),
          ...(isDesktop ? styles.shellDesktop : null),
        }}>
        <h1 className="svp-vh">Snagline walkthrough — {VENUE}</h1>

        {/* NAV BAR — brand mark | RoomDots rail | sign-off. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <SnaglineMark />
          </div>
          <RoomDots items={items} activeZone={activeZone} onSelect={zoneId => selectRoom(zoneId)} />
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="svp-btn svp-focusable"
              style={styles.iconBtn}
              aria-label="Sign-off"
              onClick={event => onSignOff(event.currentTarget)}>
              <Icon icon={CheckSquareIcon} size="sm" />
            </button>
          </div>
        </header>

        {/* PLAN PANEL — sticky under the navBar. */}
        <div style={styles.planPanel}>
          <ZonePlan
            items={items}
            activeZone={activeZone}
            ghost={ghost}
            highlightId={highlightId}
            reducedMotion={reducedMotion}
            onZoneTap={(zoneId, opener) => openSheetForZone(zoneId, ZONE_BY_ID[zoneId].drop, opener)}
            onPinTap={onPinTap}
          />
        </div>

        {/* ROOM NAV — Prev / title / Next (linear walkthrough, no tabBar). */}
        <div style={styles.roomNav}>
          <button
            type="button"
            className="svp-btn svp-focusable"
            style={{...styles.roomNavBtn, ...(activeIndex === 0 ? styles.roomNavBtnDisabled : null)}}
            aria-label="Previous room"
            disabled={activeIndex === 0}
            onClick={() => selectRoom(ZONE_ORDER[activeIndex - 1])}>
            <Icon icon={ChevronLeftIcon} size="sm" />
          </button>
          <div style={styles.roomTitleStack}>
            <span style={styles.roomTitle}>{activeZoneDef.name}</span>
            <span style={styles.roomTitleSub}>{countOpen(items, activeZone)} open</span>
          </div>
          <button
            type="button"
            className="svp-btn svp-focusable"
            style={{
              ...styles.roomNavBtn,
              ...(activeIndex === ZONE_ORDER.length - 1 ? styles.roomNavBtnDisabled : null),
            }}
            aria-label="Next room"
            disabled={activeIndex === ZONE_ORDER.length - 1}
            onClick={() => selectRoom(ZONE_ORDER[activeIndex + 1])}>
            <Icon icon={ChevronRightIcon} size="sm" />
          </button>
        </div>

        <main style={styles.main}>
          {ZONES.map(zone => {
            const zoneOpen = sortOpen(items.filter(it => it.zoneId === zone.id && it.status === 'open'));
            const zoneResolved = items
              .filter(it => it.zoneId === zone.id && it.status === 'resolved')
              .sort((a, b) => a.seq - b.seq);

            if (zone.id !== activeZone) {
              // Collapsed room — 44px utility row jumping the walkthrough.
              return (
                <div key={zone.id} id={roomDomId(zone.id)} style={{marginTop: 12}}>
                  <div style={styles.listCard}>
                    <button
                      type="button"
                      className="svp-btn svp-focusable"
                      style={styles.collapsedRow}
                      onClick={() => selectRoom(zone.id)}>
                      <span style={styles.collapsedName}>{zone.name}</span>
                      <span style={styles.collapsedCount}>{zoneOpen.length} open</span>
                      <span style={styles.chevron} aria-hidden>
                        <Icon icon={ChevronRightIcon} size="sm" />
                      </span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <section key={zone.id}>
                <div style={styles.sectionHeaderRow} id={roomDomId(zone.id)}>
                  <h2 style={styles.sectionHeader}>
                    {zone.name} — {zoneOpen.length} open · {zoneResolved.length} resolved
                  </h2>
                  <button
                    type="button"
                    className="svp-btn svp-focusable"
                    style={styles.addItemBtn}
                    onClick={event => openSheetForZone(zone.id, zone.drop, event.currentTarget)}>
                    Add item
                  </button>
                </div>
                <div style={styles.listCard}>
                  {zoneOpen.length === 0 ? (
                    <div style={styles.emptyState}>
                      <span style={styles.emptyCircle}>
                        <Icon icon={CheckCircle2Icon} size="lg" />
                      </span>
                      <span style={styles.emptyTitle}>Room clear</span>
                      <span style={styles.emptyBody}>
                        All {zoneResolved.length} item{zoneResolved.length === 1 ? '' : 's'} resolved.
                      </span>
                    </div>
                  ) : (
                    zoneOpen.map((rowItem, index) => (
                      <PunchRow
                        key={rowItem.id}
                        rowItem={rowItem}
                        swipeOpen={openSwipeRowId === rowItem.id}
                        highlighted={highlightId === rowItem.id}
                        reducedMotion={reducedMotion}
                        menuOpen={menuForId === rowItem.id}
                        showDivider={index < zoneOpen.length - 1}
                        onSwipeOpenChange={open => set({openSwipeRowId: open ? rowItem.id : null, menuForId: null})}
                        onRowTap={() => set({highlightId: rowItem.id})}
                        onResolve={() => resolveItem(rowItem.id)}
                        onMenuToggle={opener => onMenuToggle(rowItem.id, opener)}
                        onMenuAction={action => onMenuAction(rowItem, action)}
                      />
                    ))
                  )}
                </div>
                {zoneResolved.length > 0 ? (
                  <>
                    <div style={styles.cardGap} />
                    <div style={styles.listCard}>
                      {zoneResolved.map((rowItem, index) => (
                        <div key={rowItem.id}>
                          <div style={styles.resolvedRow}>
                            <span style={styles.resolvedCheck} aria-hidden>
                              <Icon icon={CheckCircle2Icon} size="sm" />
                            </span>
                            <span style={styles.resolvedTitle}>{rowItem.title}</span>
                          </div>
                          {index < zoneResolved.length - 1 ? <div style={styles.rowDivider} /> : null}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </section>
            );
          })}
          <p style={styles.updatedCaption}>{UPDATED_CAPTION}</p>
        </main>

        {/* TOAST DOCK — the single polite live region; sticky-in-flow,
            absolute only while the shell is scroll-locked. */}
        <div style={scrollLocked ? styles.toastAnchorLocked : styles.toastAnchor} aria-live="polite">
          {toast != null ? (
            <div key={toast.seq} style={styles.toast} className="svp-fade">
              <span style={styles.toastMsg}>{toast.msg}</span>
              {toast.snapshot != null ? (
                <>
                  <span style={styles.toastHairline} aria-hidden />
                  <button type="button" className="svp-btn svp-focusable" style={styles.undoBtn} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* HANDOFF LEDGER — 64px sticky bottom; counts derive live. */}
        <footer style={styles.ledger}>
          <div style={styles.ledgerCol}>
            <span style={styles.ledgerOverline}>Venue fixes</span>
            <span style={styles.ledgerCount}>{venueOpen}</span>
          </div>
          <span style={styles.ledgerHairline} aria-hidden />
          <div style={styles.ledgerCol}>
            <span style={styles.ledgerOverline}>We bring tape</span>
            <span style={styles.ledgerCount}>{tapeOpen}</span>
          </div>
          <button
            type="button"
            className="svp-btn svp-focusable"
            style={{...styles.signOffPill, ...(openTotal === 0 ? styles.signOffPillReady : null)}}
            aria-label={
              signedOff
                ? 'Walkthrough signed off'
                : openTotal > 0
                  ? \`\${openTotal} open items — resolve all to sign off\`
                  : 'Sign off walkthrough'
            }
            onClick={event => onSignOff(event.currentTarget)}>
            {signedOff ? (
              <>
                <Icon icon={CheckIcon} size="sm" />
                Signed off
              </>
            ) : openTotal > 0 ? (
              \`\${openTotal} open\`
            ) : (
              'Sign off'
            )}
          </button>
        </footer>

        {/* Outside-tap catcher for the anchored menu (below z35). */}
        {menuForId != null ? (
          <div
            style={styles.menuOverlay}
            onClick={() => {
              set({menuForId: null});
              restoreFocus(menuOpenerRef);
            }}
            aria-hidden
          />
        ) : null}

        {/* SHEET — scrim z40 + two-detent sheet z41. */}
        {sheet != null ? (
          <>
            <div style={styles.sheetScrim} className="svp-fade" onClick={closeSheet} aria-hidden />
            <NewItemSheet
              key={\`\${sheet.zoneId}-\${sheet.editingId ?? 'new'}\`}
              sheet={sheet}
              editingItem={editingItem}
              onClose={closeSheet}
              onToggleDetent={() =>
                set({sheet: {...sheet, detent: sheet.detent === 'medium' ? 'large' : 'medium'}})
              }
              onZonePick={zoneId =>
                set({sheet: {...sheet, zoneId, pendingPinXY: ZONE_BY_ID[zoneId].drop}})
              }
              onSubmit={submitSheet}
            />
          </>
        ) : null}

        {/* SIGN-OFF COVER — absolute inset 0 z50, own navBar. */}
        {cover === 'signoff' ? (
          <div
            style={styles.cover}
            role="dialog"
            aria-modal="true"
            aria-label="Sign off walkthrough"
            onKeyDown={event => trapTabKey(event, event.currentTarget)}>
            <div style={styles.coverNavBar}>
              <button
                ref={coverCloseRef}
                type="button"
                className="svp-btn svp-focusable"
                style={styles.iconBtn}
                aria-label="Close sign-off"
                onClick={closeCover}>
                <Icon icon={XIcon} size="sm" />
              </button>
              <span style={{...styles.sheetTitle, minWidth: 0}}>Sign-off</span>
              <button
                type="button"
                className="svp-btn svp-focusable"
                style={styles.coverConfirmBtn}
                onClick={() => set({alertOpen: true})}>
                Confirm
              </button>
            </div>
            <div style={styles.coverBody}>
              <div style={styles.coverSummaryRow}>
                <span style={styles.coverSummaryLabel}>Venue</span>
                <span style={styles.coverSummaryValue}>{VENUE}</span>
              </div>
              <div style={styles.coverSummaryRow}>
                <span style={styles.coverSummaryLabel}>Event</span>
                <span style={styles.coverSummaryValue}>{EVENT}</span>
              </div>
              <div style={styles.coverSummaryRow}>
                <span style={styles.coverSummaryLabel}>Inspector</span>
                <span style={styles.coverSummaryValue}>{INSPECTOR}</span>
              </div>
              <div style={styles.coverSummaryRow}>
                <span style={styles.coverSummaryLabel}>Walkthrough</span>
                <span style={styles.coverSummaryValue}>
                  Venue fixes {closedVenue} · We bring tape {closedTape} · {items.length} items closed
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* ALERT — sign-off locks the walkthrough (blocking, irreversible):
            scrim z60 does NOT dismiss on click; Escape cancels. */}
        {alertOpen ? (
          <>
            <div style={styles.alertScrim} aria-hidden />
            <div
              style={styles.alert}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="svp-alert-title"
              aria-describedby="svp-alert-body"
              onKeyDown={event => trapTabKey(event, event.currentTarget)}>
              <div style={styles.alertBody}>
                <h2 id="svp-alert-title" style={styles.alertTitle}>
                  Sign off walkthrough?
                </h2>
                <p id="svp-alert-body" style={styles.alertText}>
                  This locks the punch list.
                </p>
              </div>
              <div style={styles.alertBtnRow}>
                <button
                  ref={alertCancelRef}
                  type="button"
                  className="svp-btn svp-focusable"
                  style={styles.alertBtn}
                  onClick={() => set({alertOpen: false})}>
                  Cancel
                </button>
                <span style={styles.alertBtnRule} aria-hidden />
                <button
                  type="button"
                  className="svp-btn svp-focusable"
                  style={{...styles.alertBtn, ...styles.alertCommit}}
                  onClick={confirmSignOff}>
                  Sign off
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};