var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Wattling whole-home meter over a
 *   scripted 4:00–7:00 PM window: 19 ticks (10-minute steps, LIVE_TICK 18 =
 *   7:00 PM), five appliances with full 19-length watt arrays (Heat Pump
 *   cycling 2850→2910→3150, Dryer 5400 W through 6:00 PM then off, EV
 *   ramping 0→3600→7200 from 5:40 PM, Refrigerator with a 420 W defrost
 *   bump at 5:00–5:10, Everything-else 620→780). TOTAL_BY_TICK derives by
 *   summation (anchors: t0 9020 · t11=t12 16440 day peak · t18 11280);
 *   KWH_CUM anchors 38.000 kWh at 4:00 PM → 68.28 kWh at 7:00 PM; RATE
 *   $0.31/kWh → $21.17 today. No Date.now(), no Math.random(), no network.
 * @output Wattling — Home Energy Meter: a 390px MOBILE playback instrument,
 *   not a dashboard poster. NavBar (sparrow mark · 'Wattling' over a
 *   state-driven 'Live · 7:00 PM' subtitle · LivePill) over a 240° dial
 *   gauge (needle + decaying peak-hold ghost + 44px kW readout), five
 *   FLIP-ranked ApplianceStreamBars, a 19-point TimeScrubStrip with a
 *   draggable playhead that IS a keyboard slider, and a CostTicker.
 *   Signature move: ONE MeterClock store owns time — mode 'live'|'pinned'
 *   plus cursor 0–18 — so one scrub snapshots the needle, FLIP-reorders the
 *   bars, freezes the ticker, and rewrites the navBar subtitle in lockstep;
 *   'Return to Live' plays a deterministic 60 ms/tick catch-up sweep
 *   through the missed ticks. Non-gesture path: a two-detent 'Jump to time'
 *   sheet with a 44px snap-scroll time list (flat rows, no OS drum-roll).
 *   Usage/Devices/Settings tabs are real lightweight screens whose fixtures
 *   reconcile on screen (52.28 metered + 16.00 pre-4PM = 68.28 kWh).
 * @position Page template; emitted by \`astryx template mobile-home-energy-meter\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet) are position:'absolute' INSIDE
 *   shell; position:fixed is banned. While the sheet is open, shell locks
 *   to {height:'100dvh', overflow:'hidden'} and restores on close. The
 *   toastDock is sticky-in-flow (bottom 76 above the 64px tabBar), NOT
 *   shell-absolute — the shell grows with content, so absolute bottom pins
 *   to the document bottom on tall scrolls (foundations amendment).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 56 where rows lead with the
 *   40px icon tile); no desktop Layout frames, no asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Wattling leaf-green — raw spec #5C940D is only ~3.9:1 on
 *   white so it is quarantined out of ALL text/fill use; the shipped pair
 *   is #4C7A0B/#A9E34B with math at the declaration). REST_FILL is the one
 *   sanctioned non-brand literal pair: dial track, bar tracks, and the
 *   switch OFF track are MEANINGFUL rest fills / interactive boundaries, so
 *   per the foundations amendment they carry an explicit light-dark() pair
 *   at ≥3:1 against their ACTUAL card surface (math at the declaration) —
 *   hairline/muted tokens stay reserved for passive separators.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', blur surface + always-on 1px
 *   bottom hairline — always-on chosen, noted); tabBar 64px sticky bottom
 *   z20, 4 tabItems flex:1, 24px icon over 11px/500 label, 4px gap;
 *   appliance rows 60px (16px/500 + 13px/400, 2px gap) · utility rows 44px
 *   · sheet time rows 44px; sectionHeader 13px/600 uppercase 0.06em at 32px
 *   from stage edge, 20px top / 8px bottom. TYPE (Figtree via
 *   --font-family-body): 44/700 dial readout (the one sanctioned oversize)
 *   · 22/700 cost figure · 17/600 nav + card titles · 16/400 body + row
 *   primary (the floor) · 13/400 meta · 11/500 pills + tab labels; nothing
 *   under 11px; tabular-nums on every updating numeral. Buttons: 48px
 *   primary full-width, 36px secondary inline, 44×44 icon buttons; every
 *   touch target ≥44×44 with ≥8px clearance or merged full-row. Corners:
 *   cards 12 · icon tiles 8 · bar tracks 4 · pills/dots/thumb 999 · sheet
 *   '16px 16px 0 0' · band 8 · shell 0 (stage clips at --radius-container).
 *
 * Responsive contract:
 * - Author at 390, clean 320–430: zero width:390 literals — shell 100%,
 *   cards auto within 16px gutters, gauge SVG width 100% maxWidth 326 with
 *   intrinsic aspect via viewBox, sparkline width 100% height 96
 *   preserveAspectRatio none (vector-effect keeps strokes honest), bar
 *   widths percentage-of-track (px only in comments for the 390 case). At
 *   320: appliance names ellipsize before the minWidth-64 watts column;
 *   'Jump to time' + 'Return to Live' stay side-by-side. overflowX:'clip'
 *   is the backstop, not the plan.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport — the demo stage sits inside a 1440px
 *   window) — at ≥720px the shell becomes a centered phone column
 *   (maxWidth 430, marginInline auto, borderInline hairline). No adaptive
 *   relayout; the dial anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
  UIEvent as ReactUIEvent,
} from 'react';

import {
  BarChart3Icon,
  CarIcon,
  ChevronRightIcon,
  GaugeIcon,
  HouseIcon,
  PlugIcon,
  RadioIcon,
  RefrigeratorIcon,
  SettingsIcon,
  ShirtIcon,
  ThermometerIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Wattling leaf-green). Raw spec #5C940D is
// only ~3.9:1 on white → quarantined out of text/fill use entirely. Shipped
// pair: #4C7A0B on #FFFFFF ≈ 5.2:1 (L 0.155; (1.05)/(0.205) — passes 4.5:1);
// #A9E34B on the dark card (~#1C1A17, L 0.0098) ≈ 11.5:1.
const BRAND_ACCENT = 'light-dark(#4C7A0B, #A9E34B)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #4C7A0B ≈ 5.2:1. Dark:
// white on #A9E34B fails, so the dark side flips to near-black green —
// #1E2A07 (L ≈ 0.017) on #A9E34B (L 0.637) ≈ 10.3:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #1E2A07)';
// Brand-tinted wash for the LIVE pill / icon tiles (background only; text
// on it stays BRAND_ACCENT which keeps ≥4.5:1 vs the near-white/near-black
// blend).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// MEANINGFUL REST FILLS + INTERACTIVE BOUNDARIES (foundations amendment):
// the dial track, load-bar tracks, and switch OFF track encode real state
// (capacity remaining / off), so they get an explicit ≥3:1 pair vs their
// ACTUAL surface — the white/dark CARD, not the body. Light #838B7B:
// L ≈ 0.246 → vs #FFFFFF card (1.05)/(0.296) ≈ 3.55:1 ✓. Dark #6E7566:
// L ≈ 0.171 → vs #1C1A17 card (0.221)/(0.0598) ≈ 3.7:1 ✓.
const REST_FILL = 'light-dark(#838B7B, #6E7566)';
// Sheet scrim per the mobile foundations (verbatim).
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// the LIVE pulse dot, and the reduced-motion guard. Transitions animate
// transform/opacity only (the dial's stroke-dasharray ease is the SVG
// analogue of scaleX along the arc path — the sanctioned exception, noted)
// and every one collapses under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const WATTLING_CSS = \`
.wtl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.wtl-btn:disabled { cursor: default; }
.wtl-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.wtl-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Needle ease between ticks — transform only. */
.wtl-needle { transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1); }
/* Fill arc ease — stroke-dasharray along a pathLength-normalized arc is
   the arc-space scaleX; collapses to instant under reduced motion. */
.wtl-arc { transition: stroke-dasharray 400ms cubic-bezier(0.22, 1, 0.36, 1); }
/* Peak-hold ghost decay: 40% → 20% opacity, 2 s AFTER the needle drops
   below it (transition-delay carries the 2 s; opacity only). */
.wtl-ghost { transition: opacity 300ms linear 2000ms; }
/* FLIP rank move — transform only, applied per-row from JS. */
.wtl-flip { will-change: transform; }
.wtl-fade { transition: opacity 240ms ease; }
@keyframes wtl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.wtl-sheet-in { animation: wtl-sheet-in 240ms ease; }
@keyframes wtl-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.6); opacity: 0.55; }
}
.wtl-live-dot { animation: wtl-pulse 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .wtl-needle, .wtl-arc, .wtl-ghost, .wtl-fade { transition: none; }
  .wtl-sheet-in { animation: none; }
  /* Pulse removed entirely — the static dot still encodes LIVE. */
  .wtl-live-dot { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, tabBar, tabItem,
// sheetScrim, sheet, listCard, rowDivider, sectionHeader, toastDock.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — container width, not viewport (demo desktop stage is
  // ~1045px inside a 1440px window).
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
  // Scroll lock while the sheet is open; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; blur surface; the 1px
  // bottom hairline is ALWAYS ON (chosen over scroll-wired, noted).
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
  // 44×44 brand-mark button holding the 28px sparrow.
  brandBtn: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  navCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    maxWidth: 200,
    overflow: 'hidden',
  },
  navTitle: {fontSize: 17, fontWeight: 600, lineHeight: '20px', whiteSpace: 'nowrap'},
  // State-driven subtitle: 'Live · 7:00 PM' / 'Pinned · 5:50 PM'.
  navSubtitle: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '13px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // LivePill — 44px hit wrapping a 28px pill; LIVE = brand tint + pulsing
  // dot; PINNED = muted pill with time + 12px radio glyph.
  livePillHit: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  livePill: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  livePillLive: {background: BRAND_TINT_12, color: BRAND_ACCENT},
  livePillPinned: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
  },
  liveDot: {width: 8, height: 8, borderRadius: 999, background: BRAND_ACCENT},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px from the stage edge,
  // 20px top / 8px bottom (24px section rhythm carried by the 20+4).
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
  // 56px inset where rows lead with the 40px icon tile (16 pad + 40 tile).
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 56},
  // DIAL CARD — 12px below navBar, padding 16, gauge SVG centered.
  dialCard: {
    marginTop: 12,
    marginInline: 16,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  dialSvgWrap: {position: 'relative', width: '100%', maxWidth: 326},
  dialSvg: {display: 'block', width: '100%', height: 'auto'},
  // HTML readout overlaid at the gauge center (cy 124 of viewBox 200 = 62%).
  dialReadout: {
    position: 'absolute',
    left: '50%',
    top: '58%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    pointerEvents: 'none',
    textAlign: 'center',
    width: '100%',
  },
  dialKwRow: {display: 'flex', alignItems: 'baseline', gap: 4},
  // 44/700 — the one sanctioned oversize numeral; tabular so 6.17 → 16.44
  // never shifts the caption.
  dialKw: {fontSize: 44, fontWeight: 700, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums'},
  dialUnit: {fontSize: 17, fontWeight: 600, color: 'var(--color-text-secondary)'},
  dialCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // APPLIANCE ROWS — 60px; 40px icon tile radius 8; bar under the text.
  applianceRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  iconTile: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  appText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6},
  appName: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '18px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Load-bar track: 8px tall, radius 4, REST_FILL (meaningful rest fill —
  // capacity headroom — ≥3:1 vs card per the amendment; math at the const).
  // Track spans the text column (~270px at 390; fluid below). Width is set
  // directly (no transition) — the FLIP + needle carry the motion.
  barTrack: {
    position: 'relative',
    width: '100%',
    height: 8,
    borderRadius: 4,
    background: REST_FILL,
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    borderRadius: 4,
    background: BRAND_ACCENT,
  },
  // 0 W renders a 2px stub instead of a fill.
  barStub: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    width: 2,
    background: BRAND_ACCENT,
  },
  appWatts: {
    flexShrink: 0,
    minWidth: 64,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  appIdle: {
    flexShrink: 0,
    minWidth: 64,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
  },
  // TIME SCRUB STRIP — card padding 16; 96px sparkline; axis row; buttons.
  scrubCard: {padding: 16, display: 'flex', flexDirection: 'column', gap: 8},
  scrubStrip: {position: 'relative', width: '100%', height: 96, touchAction: 'pan-y'},
  sparkSvg: {display: 'block', width: '100%', height: 96},
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  // 44×44 slider hit wrapping the 20px thumb, vertically centered.
  playheadHit: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    touchAction: 'none',
  },
  playheadThumb: {
    width: 20,
    height: 20,
    borderRadius: 999,
    background: BRAND_ACCENT,
    border: \`2px solid \${BRAND_FILL_TEXT}\`,
    boxShadow: '0 1px 4px var(--color-shadow)',
  },
  axisRow: {display: 'flex', justifyContent: 'space-between'},
  axisLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 36px button row: secondary 'Jump to time' leading, brand 'Return to
  // Live' trailing (only when pinned; ≥16px dead space between).
  scrubBtnRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    minHeight: 36,
    marginTop: 4,
  },
  jumpBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    color: 'var(--color-text-primary)',
  },
  liveBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
  },
  // COST TICKER — overline / 22px figure / meta / pinned caption.
  costCard: {padding: 16, display: 'flex', flexDirection: 'column', gap: 4},
  costOverline: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  costFigure: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  costMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  costAsOf: {fontSize: 13, fontWeight: 500, color: BRAND_ACCENT, fontVariantNumeric: 'tabular-nums'},
  // TOAST DOCK — sticky-in-flow (height 0) 76px above the viewport bottom
  // (64 tabBar + 12); the ONE polite live region. Absolute-in-shell would
  // pin to the document bottom on tall scrolls (amendment).
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
    minHeight: 40,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // TAB BAR — exactly 64px, 4 tabItems flex:1, 24px icon over 11px label.
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
  tabItemActive: {color: BRAND_ACCENT},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // UTILITY ROWS (Settings / Usage) — 44px; DEVICES rows — 60px.
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  utilLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  utilValue: {
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  chev: {display: 'inline-flex', color: 'var(--color-text-secondary)'},
  // Switch per the inputControls contract — 51×31 track, 27px thumb; the
  // whole 44px row is the role="switch" button. OFF track uses REST_FILL
  // (interactive boundary at rest → ≥3:1 vs card per the amendment).
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
    borderRadius: 999,
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
    transition: 'transform 200ms ease',
  },
  deviceRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  deviceText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  deviceMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Reconciliation caption under the Devices card — the cross-sum is
  // literally on screen (stress fixture 6).
  cardCaption: {
    margin: '8px 32px 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  summaryRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell (foundations).
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
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Snap-scroll time list — the ONE legal inner scroller (open sheet only).
  sheetListWrap: {position: 'relative', flex: 1, minHeight: 0},
  sheetList: {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    overflowY: 'auto',
    scrollSnapType: 'y mandatory',
  },
  // 44px center highlight band — muted fill, hairline top/bottom, radius 8.
  // Passive selection marker (NOT an interactive boundary), so muted/hairline
  // tokens are legal here. Flat rows, no 3D drum-roll transform.
  sheetBand: {
    position: 'absolute',
    insetInline: 16,
    top: 'calc(50% - 22px)',
    height: 44,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
    pointerEvents: 'none',
  },
  timeRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    scrollSnapAlign: 'center',
  },
  timeRowSelected: {fontWeight: 600, color: BRAND_ACCENT},
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
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — module-scope consts, identity ids, dual fields, cross-checked
// aggregates. One scripted clock: 19 ticks, 10-minute steps, 4:00–7:00 PM.
// ---------------------------------------------------------------------------

const TICK_COUNT = 19;
const LIVE_TICK = 18;
/** TICK_LABELS[0] = '4:00 PM' … TICK_LABELS[18] = '7:00 PM'. */
const TICK_LABELS: string[] = Array.from({length: TICK_COUNT}, (_, t) => {
  const min = t * 10;
  const hour = 4 + Math.floor(min / 60);
  return \`\${hour}:\${String(min % 60).padStart(2, '0')} PM\`;
});

type ApplianceId = 'hvac' | 'dryer' | 'ev' | 'fridge' | 'other';

interface Appliance {
  id: ApplianceId;
  name: string;
  icon: typeof ThermometerIcon;
}

const APPLIANCES: Appliance[] = [
  {id: 'hvac', name: 'Heat Pump (HVAC)', icon: ThermometerIcon},
  {id: 'dryer', name: 'Dryer', icon: ShirtIcon},
  {id: 'ev', name: 'EV Charger', icon: CarIcon},
  {id: 'fridge', name: 'Refrigerator', icon: RefrigeratorIcon},
  {id: 'other', name: 'Everything else', icon: HouseIcon},
];

// Full 19-length watt arrays (W). Narrative: HVAC compressor cycles (off at
// t2–t3 and t7–t8 — stress fixture 1's TWO idle rows at t2), stage-up to
// 2910 at t9 and 3150 at t13; Dryer runs 5400 through t12 then shuts off;
// EV ramps 3600 at t10 → 7200 from t11 (the signature FLIP overtake of the
// dryer); Refrigerator defrost bump 420 at t6–t7; Everything-else steps
// 620 → 780 at t9 (evening lights).
const WATTS_BY_TICK: Record<ApplianceId, number[]> = {
  hvac: [2850, 2850, 0, 0, 2850, 2850, 2850, 0, 0, 2910, 2910, 2910, 2910, 3150, 3150, 3150, 3150, 3150, 3150],
  dryer: [5400, 5400, 5400, 5400, 5400, 5400, 5400, 5400, 5400, 5400, 5400, 5400, 5400, 0, 0, 0, 0, 0, 0],
  ev: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3600, 7200, 7200, 7200, 7200, 7200, 7200, 7200, 7200],
  fridge: [150, 150, 150, 150, 150, 150, 420, 420, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150],
  other: [620, 620, 620, 620, 620, 620, 620, 620, 620, 780, 780, 780, 780, 780, 780, 780, 780, 780, 780],
};

// TOTAL_BY_TICK derives by summation. Anchor cross-checks (hand-verified):
// t0  2850+5400+0+150+620    = 9020
// t2     0+5400+0+150+620    = 6170
// t6  2850+5400+0+420+620    = 9290
// t10 2910+5400+3600+150+780 = 12840
// t11 = t12 2910+5400+7200+150+780 = 16440 (day peak; t12 label '6:00 PM')
// t13 3150+0+7200+150+780    = 11280 = t18 (live)
const TOTAL_BY_TICK: number[] = Array.from({length: TICK_COUNT}, (_, t) =>
  APPLIANCES.reduce((sum, appliance) => sum + WATTS_BY_TICK[appliance.id][t], 0),
);

// Dial range 0–18 kW, so the 16440 peak sits at 91.3% of the 240° arc.
const DIAL_MAX_WATTS = 18000;
const BAR_MAX_WATTS = 7200; // EV at full draw = full track

// ENERGY. Interval kWh = TOTAL_BY_TICK[t]/6000 (10 min = 1/6 h). Cumulative
// watt-ticks stay INTEGER so no float drift reaches the ledger:
// CUM_WTICKS[t] = Σ TOTAL_BY_TICK[0..t-1]. Cross-check of the full window,
// Σ TOTAL_BY_TICK[0..17] = 4×9020 + 3×6170 + 9290 + 6440 + 9240 + 12840 +
// 2×16440 + 5×11280 = 36080+18510+9290+6440+9240+12840+32880+56400 =
// 181680 W-ticks → /6000 = 30.28 kWh, so KWH_CUM[18] = 38.000 + 30.28 =
// 68.28 kWh exactly.
const CUM_WTICKS: number[] = TOTAL_BY_TICK.reduce<number[]>((acc, _, t) => {
  acc.push(t === 0 ? 0 : acc[t - 1] + TOTAL_BY_TICK[t - 1]);
  return acc;
}, []);
// Midnight-to-4-PM anchor (metered 22.00 + unmetered 16.00 — see DEVICES).
const KWH_AT_4PM = 38;
const RATE_PER_KWH = 0.31;
/** KWH_CUM[t] = 38.000 + CUM_WTICKS[t]/6000. */
function kwhCumAt(tick: number): number {
  return KWH_AT_4PM + CUM_WTICKS[tick] / 6000;
}
// Cost anchors: t0 38.00×0.31 = $11.78; t11 KWH_CUM = 38 + 92400/6000 =
// 53.40 → 53.40×0.31 = 16.554 → $16.55; t12 = 38 + 108840/6000 = 56.14 →
// $17.40 (17.4034 — stress fixture 2's on-screen mid-window arithmetic);
// t18 68.28×0.31 = 21.1668 → $21.17.
function costCentsAt(tick: number): number {
  return Math.round(kwhCumAt(tick) * RATE_PER_KWH * 100);
}

// PEAK_HOLD anchor: the day peak seen before mount.
const INITIAL_PEAK = {watts: 16440, label: 'Peak 16.44 kW · 6:00 PM'};

// USAGE tab — 7 fixed days; the trailing 'Today' row derives LIVE from
// KWH_CUM[cursor] so the week total re-sums when you pin. Fixed-six sum:
// 26.40+31.80+29.20+30.10+28.90+30.22 = 176.62; at live cursor +68.28 =
// 244.90 kWh. DEVIATION from spec (noted): the spec's 7th value 38.28
// ('today's projected') contradicts its own KWH_CUM[18] = 68.28 already
// consumed by 7:00 PM; the cross-check law (today's row ties to KWH_CUM)
// is kept exact instead.
const USAGE_DAYS: Array<{id: string; day: string; kwh: number}> = [
  {id: 'day_0628', day: 'Sun Jun 28', kwh: 26.4},
  {id: 'day_0629', day: 'Mon Jun 29', kwh: 31.8},
  {id: 'day_0630', day: 'Tue Jun 30', kwh: 29.2},
  {id: 'day_0701', day: 'Wed Jul 1', kwh: 30.1},
  {id: 'day_0702', day: 'Thu Jul 2', kwh: 28.9},
  {id: 'day_0703', day: 'Fri Jul 3', kwh: 30.22},
];
const USAGE_FIXED_SUM = 176.62; // Σ of the six rows above, verified

// DEVICES tab — today's per-device metered kWh. 14.20+21.60+9.00+1.10+6.38
// = 52.28 ('Metered today'); subset note: excludes 16.00 kWh consumed
// before 4:00 PM on the unmetered legacy circuit, and 52.28+16.00 = 68.28
// ties to KWH_CUM[18]. DEVIATION from spec (noted): the spec listed the
// dryer/EV values swapped (dryer 9.00, ev 21.60), but the dryer alone drew
// 11.70 kWh inside the 4–7 PM window (5400×13/6000) — impossible under a
// 9.00 daily total — while the EV's window draw is EXACTLY 9.00 kWh
// (54000/6000; it first plugged in at 5:40 PM). Swapped, every per-device
// figure ≥ its window draw AND the pre-4-PM metered remainder reconciles:
// (14.20−6.94)+(21.60−11.70)+(9.00−9.00)+(1.10−0.54)+(6.38−2.10) =
// 7.26+9.90+0+0.56+4.28 = 22.00 = 38.00 − 16.00 unmetered. ✓
const DEVICE_KWH_TODAY: Record<ApplianceId, number> = {
  hvac: 14.2,
  dryer: 21.6,
  ev: 9.0,
  fridge: 1.1,
  other: 6.38,
};
const DEVICES_METERED_SUM = 52.28;
const PRE_4PM_UNMETERED = 16;

// SETTINGS tab — 4 utility rows (one is the working switch).
const SETTINGS_ROWS: Array<{id: string; label: string; value: string}> = [
  {id: 'set_rate', label: 'Rate plan', value: '$0.31/kWh flat'},
  {id: 'set_meter', label: 'Meter', value: 'WTL-2209 · Cellar'},
  {id: 'set_home', label: 'Household', value: 'Maple Ct · 2,140 sq ft'},
];

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic (no toLocaleString: comma placement is
// hand-rolled so SSR/CSR and every demo locale agree).
// ---------------------------------------------------------------------------

/** 11280 → '11.28' (kW, 2 decimals). */
function fmtKw(watts: number): string {
  return (watts / 1000).toFixed(2);
}

/** 7200 → '7,200'. */
function fmtWatts(watts: number): string {
  return watts >= 1000
    ? \`\${Math.floor(watts / 1000)},\${String(watts % 1000).padStart(3, '0')}\`
    : String(watts);
}

/** Cents → '$21.17'. */
function fmtUsd(cents: number): string {
  return \`$\${(cents / 100).toFixed(2)}\`;
}

/** 68.28 → '68.28' (kWh, 2 decimals). */
function fmtKwh(kwh: number): string {
  return kwh.toFixed(2);
}

// ---------------------------------------------------------------------------
// DIAL GEOMETRY — 240° arc gauge, viewBox 0 0 260 200, center (130, 124),
// arc radius 110, strokeWidth 14. Angles measured from 12 o'clock,
// clockwise positive: GAUGE_START −120° → GAUGE_END +120° (the spec's
// '−210° + watts/18000 × 240°' states the same sweep in the east-zero
// convention). deg(watts) = −120 + watts/18000 × 240; live 11280 → +30.4°;
// peak 16440 → +99.2°.
// ---------------------------------------------------------------------------

const DIAL_CX = 130;
const DIAL_CY = 124;
const DIAL_R = 110;
const GAUGE_SWEEP = 240;
const GAUGE_START = -120;

function dialDeg(watts: number): number {
  return GAUGE_START + (Math.min(watts, DIAL_MAX_WATTS) / DIAL_MAX_WATTS) * GAUGE_SWEEP;
}

function dialPolar(deg: number, radius: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: DIAL_CX + radius * Math.sin(rad), y: DIAL_CY - radius * Math.cos(rad)};
}

/** Full 240° track path (fill arc reuses it via pathLength/dasharray). */
function dialTrackPath(): string {
  const from = dialPolar(GAUGE_START, DIAL_R);
  const to = dialPolar(GAUGE_START + GAUGE_SWEEP, DIAL_R);
  return \`M \${from.x.toFixed(2)} \${from.y.toFixed(2)} A \${DIAL_R} \${DIAL_R} 0 1 1 \${to.x.toFixed(2)} \${to.y.toFixed(2)}\`;
}
const DIAL_TRACK_D = dialTrackPath();

// ---------------------------------------------------------------------------
// HOOKS — container width (grid-feeder-console pattern) + measured height
// for the sheet's snap list spacers.
// ---------------------------------------------------------------------------

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

function useElementHeight(ref: RefObject<HTMLDivElement | null>): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setHeight(rect.height);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return height;
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
// WATTLING MARK — 28px inline SVG sparrow whose wing is a single
// pulse-waveform stroke: body silhouette fill var(--color-text-primary)
// (NOT --color-text, which does not exist), wing stroke BRAND_ACCENT 2px,
// M-shaped waveform of 4 segments.
// ---------------------------------------------------------------------------

function WattlingMark() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      {/* Sparrow silhouette: round breast, notched tail, short beak. */}
      <path
        d="M25.6 8.2 22.8 9c.3-1-.1-2-1.1-2.8-1.3-1-3.2-1.6-5.2-1.6-6 0-11 4.4-11.7 10.2-.3 2.6.5 5 2.1 6.9L2.6 25h9.9c6.1 0 11.1-4.5 11.8-10.4.2-1.6 0-3.1-.5-4.5l1.8-1.9Z"
        fill="var(--color-text-primary)"
      />
      {/* Wing = one pulse waveform, 4 segments (flat · up · down · flat). */}
      <path
        d="M6.8 15.2h3l1.7-4.2 2.5 7 1.8-4.4h3.4"
        stroke={BRAND_ACCENT}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// LIVE DIAL METER — 240° arc gauge. Layers bottom→top: REST_FILL track,
// BRAND fill arc (pathLength 240, dasharray = sweep°, eased 400ms), the
// peak-hold ghost tick (3×18, 40% → decays to 20% opacity 2 s after the
// needle drops below it; static under reduced motion), the needle
// (transform rotate, eased 400ms), hub. HTML center readout overlays. The
// dial is role='img' with a computed label — the toastDock announces.
// ---------------------------------------------------------------------------

interface LiveDialMeterProps {
  watts: number;
  peakWatts: number;
  peakLabel: string;
  mode: 'live' | 'pinned';
  cursorLabel: string;
  reducedMotion: boolean;
}

function LiveDialMeter({watts, peakWatts, peakLabel, mode, cursorLabel, reducedMotion}: LiveDialMeterProps) {
  const sweepDeg = ((Math.min(watts, DIAL_MAX_WATTS) / DIAL_MAX_WATTS) * GAUGE_SWEEP).toFixed(2);
  const needleDeg = dialDeg(watts);
  const ghostDeg = dialDeg(peakWatts);
  const needleBelowPeak = watts < peakWatts;
  // Reduced motion: decay removed entirely — static 40% marker persists.
  const ghostOpacity = reducedMotion ? 0.4 : needleBelowPeak ? 0.2 : 0.4;
  return (
    <div style={styles.dialSvgWrap}>
      <svg
        style={styles.dialSvg}
        viewBox="0 0 260 200"
        role="img"
        aria-label={\`Whole-home load \${fmtKw(watts)} kilowatts, \${mode === 'live' ? 'live at' : 'pinned to'} \${cursorLabel}. \${peakLabel}.\`}>
        {/* Track — meaningful rest fill (headroom to 18 kW): REST_FILL pair
            ≥3:1 vs the card in both schemes (math at the const). */}
        <path d={DIAL_TRACK_D} stroke={REST_FILL} strokeWidth={14} strokeLinecap="round" fill="none" />
        {/* Fill arc — dasharray over pathLength 240 = degrees drawn. */}
        <path
          d={DIAL_TRACK_D}
          pathLength={GAUGE_SWEEP}
          stroke={BRAND_ACCENT}
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
          className="wtl-arc"
          strokeDasharray={\`\${sweepDeg} \${GAUGE_SWEEP}\`}
        />
        {/* Peak-hold ghost — 3×18 tick spanning the ring band, rendered
            BEHIND the needle so t12's coincidence never z-fights. */}
        <g
          className="wtl-ghost"
          style={{
            opacity: ghostOpacity,
            transform: \`rotate(\${ghostDeg}deg)\`,
            transformOrigin: \`\${DIAL_CX}px \${DIAL_CY}px\`,
            transformBox: 'view-box',
          }}>
          <rect x={DIAL_CX - 1.5} y={DIAL_CY - DIAL_R - 9} width={3} height={18} rx={1.5} fill="var(--color-text-primary)" />
        </g>
        {/* Needle — eased 400ms cubic-bezier(0.22,1,0.36,1) between ticks;
            instant under reduced motion (CSS media guard). */}
        <g
          className="wtl-needle"
          style={{
            transform: \`rotate(\${needleDeg}deg)\`,
            transformOrigin: \`\${DIAL_CX}px \${DIAL_CY}px\`,
            transformBox: 'view-box',
          }}>
          {/* Outer pointer segment (r 62→96) — stops well short of the
              center so the 44px readout stays unobstructed. */}
          <line
            x1={DIAL_CX}
            y1={DIAL_CY - 62}
            x2={DIAL_CX}
            y2={DIAL_CY - DIAL_R + 14}
            stroke="var(--color-text-primary)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
        {/* 0 / 18 kW range labels at the arc ends. */}
        <text x={35} y={196} textAnchor="middle" fontSize={11} fontWeight={500} fill="var(--color-text-secondary)">
          0
        </text>
        <text x={225} y={196} textAnchor="middle" fontSize={11} fontWeight={500} fill="var(--color-text-secondary)">
          18 kW
        </text>
      </svg>
      <div style={styles.dialReadout} aria-hidden>
        <span style={styles.dialKwRow}>
          <span style={styles.dialKw}>{fmtKw(watts)}</span>
          <span style={styles.dialUnit}>kW</span>
        </span>
        <span style={styles.dialCaption}>{peakLabel}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// APPLIANCE STREAM BARS — five 60px rows sorted by current watts desc,
// stable tiebreak by APPLIANCES index (the only equal values are 0 W).
// FLIP: row pitch is exactly 61px (60 row + 1 divider), so prior offsets
// are arithmetic — apply inverted translateY, then release into a 300ms
// transform-only transition (instant under reduced motion). Bar width % =
// watts/7200 (≈px of the ~270px text column at 390); 0 W renders a 2px
// stub + 'Idle' meta. Rows are real buttons announcing '<name>: <watts> W'
// through the single toastDock.
// ---------------------------------------------------------------------------

const ROW_PITCH = 61;

interface ApplianceStreamBarsProps {
  cursor: number;
  reducedMotion: boolean;
  onAnnounce: (text: string) => void;
}

function ApplianceStreamBars({cursor, reducedMotion, onAnnounce}: ApplianceStreamBarsProps) {
  const ranked = APPLIANCES.map((appliance, index) => ({
    appliance,
    index,
    watts: WATTS_BY_TICK[appliance.id][cursor],
  })).sort((a, b) => b.watts - a.watts || a.index - b.index);

  const rowRefs = useRef<Map<ApplianceId, HTMLDivElement>>(new Map());
  const prevOrderRef = useRef<ApplianceId[]>(ranked.map(r => r.appliance.id));

  useLayoutEffect(() => {
    const prevOrder = prevOrderRef.current;
    const nextOrder = ranked.map(r => r.appliance.id);
    prevOrderRef.current = nextOrder;
    if (reducedMotion) return;
    nextOrder.forEach((id, newIndex) => {
      const prevIndex = prevOrder.indexOf(id);
      if (prevIndex === -1 || prevIndex === newIndex) return;
      const el = rowRefs.current.get(id);
      if (el == null) return;
      const delta = (prevIndex - newIndex) * ROW_PITCH;
      el.style.transition = 'none';
      el.style.transform = \`translateY(\${delta}px)\`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)';
          el.style.transform = '';
        });
      });
    });
  });

  return (
    <div style={styles.listCard}>
      {ranked.map(({appliance, watts}, rank) => (
        <div
          key={appliance.id}
          className="wtl-flip"
          ref={el => {
            if (el != null) rowRefs.current.set(appliance.id, el);
            else rowRefs.current.delete(appliance.id);
          }}
          style={{position: 'relative', background: 'var(--color-background-card)'}}>
          <button
            type="button"
            className="wtl-btn wtl-focusable"
            style={styles.applianceRow}
            aria-label={appliance.name}
            onClick={() =>
              onAnnounce(
                watts === 0 ? \`\${appliance.name}: idle\` : \`\${appliance.name}: \${fmtWatts(watts)} W\`,
              )
            }>
            <span style={styles.iconTile} aria-hidden>
              <Icon icon={appliance.icon} size="md" color="inherit" />
            </span>
            <span style={styles.appText}>
              <span style={styles.appName}>{appliance.name}</span>
              <span style={styles.barTrack} aria-hidden>
                {watts === 0 ? (
                  <span style={styles.barStub} />
                ) : (
                  <span
                    style={{
                      ...styles.barFill,
                      width: \`\${Math.min(100, (watts / BAR_MAX_WATTS) * 100)}%\`,
                    }}
                  />
                )}
              </span>
            </span>
            {watts === 0 ? (
              <span style={styles.appIdle}>Idle</span>
            ) : (
              <span style={styles.appWatts}>{fmtWatts(watts)} W</span>
            )}
          </button>
          {rank < ranked.length - 1 ? <div style={styles.rowDividerDeep} /> : null}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TIME SCRUB STRIP — 19-point sparkline (SVG width 100%, height 96,
// preserveAspectRatio none, non-scaling strokes), draggable 2px playhead
// whose 44×44 thumb IS a keyboard slider (role slider, ArrowLeft/Right one
// tick, Home → tick 0, End → return to live). Pointer maps clientX to the
// nearest tick. The visible button path lives directly below: 'Jump to
// time' (always) + 'Return to Live' (pinned only).
// ---------------------------------------------------------------------------

// Sparkline geometry: viewBox 0 0 180 96, x = t×10, y = 92 − total/18000×88.
const SPARK_POINTS = TOTAL_BY_TICK.map((total, t) => {
  const x = t * 10;
  const y = 92 - (total / DIAL_MAX_WATTS) * 88;
  return \`\${x},\${y.toFixed(1)}\`;
}).join(' ');

interface TimeScrubStripProps {
  cursor: number;
  mode: 'live' | 'pinned';
  onScrubTo: (tick: number, announce: boolean) => void;
  onReturnToLive: () => void;
  onOpenJumpSheet: (opener: HTMLElement) => void;
}

function TimeScrubStrip({cursor, mode, onScrubTo, onReturnToLive, onOpenJumpSheet}: TimeScrubStripProps) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const tickFromClientX = (clientX: number): number => {
    const rect = stripRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return cursor;
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(frac * LIVE_TICK);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onScrubTo(tickFromClientX(event.clientX), false);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    onScrubTo(tickFromClientX(event.clientX), false);
  };
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    // Announce only on settle — never per move (a11y plan).
    onScrubTo(tickFromClientX(event.clientX), true);
  };

  const onThumbKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onScrubTo(Math.max(0, cursor - 1), false);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onScrubTo(Math.min(LIVE_TICK, cursor + 1), false);
    } else if (event.key === 'Home') {
      event.preventDefault();
      onScrubTo(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      onReturnToLive();
    }
  };

  const pct = (cursor / LIVE_TICK) * 100;
  return (
    <div style={{...styles.listCard, ...styles.scrubCard}}>
      <div
        ref={stripRef}
        style={styles.scrubStrip}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}>
        <svg style={styles.sparkSvg} viewBox="0 0 180 96" preserveAspectRatio="none" aria-hidden>
          <polyline
            points={SPARK_POINTS}
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div style={{...styles.playhead, left: \`\${pct}%\`}} aria-hidden />
        <button
          type="button"
          className="wtl-btn wtl-focusable"
          style={{...styles.playheadHit, left: \`\${pct}%\`}}
          role="slider"
          aria-label="Playback time"
          aria-valuemin={0}
          aria-valuemax={LIVE_TICK}
          aria-valuenow={cursor}
          aria-valuetext={\`\${TICK_LABELS[cursor]}\${mode === 'live' ? ' (live)' : ''}\`}
          onKeyDown={onThumbKeyDown}>
          <span style={styles.playheadThumb} aria-hidden />
        </button>
      </div>
      <div style={styles.axisRow} aria-hidden>
        <span style={styles.axisLabel}>4 PM</span>
        <span style={styles.axisLabel}>5 PM</span>
        <span style={styles.axisLabel}>6 PM</span>
        <span style={styles.axisLabel}>7 PM</span>
      </div>
      <div style={styles.scrubBtnRow}>
        <button
          type="button"
          className="wtl-btn wtl-focusable"
          style={styles.jumpBtn}
          onClick={event => onOpenJumpSheet(event.currentTarget)}>
          Jump to time
        </button>
        {mode === 'pinned' ? (
          <button type="button" className="wtl-btn wtl-focusable" style={styles.liveBtn} onClick={onReturnToLive}>
            Return to Live
          </button>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// JUMP TO TIME SHEET — two detents (medium 55% / large calc(100% − 56px));
// 24px grabber zone whose 36×5 pill is a REAL button toggling detents;
// 52px header + 44×44 X; content is the one legal inner scroller: a
// snap-scroll list of 19 flat 44px rows (every row directly tappable — NOT
// an OS drum-roll clone), a 44px center highlight band marking the
// selection; sticky 48px confirm footer whose label tracks the selection.
// Spacers of (H−44)/2 make scrollTop = index×44 hold at BOTH detents, so a
// detent toggle re-centers losslessly.
// ---------------------------------------------------------------------------

interface JumpToTimeSheetProps {
  detent: 'medium' | 'large';
  selection: number;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDetentToggle: () => void;
  onSelect: (tick: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

function JumpToTimeSheet({detent, selection, sheetRef, onDetentToggle, onSelect, onConfirm, onClose}: JumpToTimeSheetProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const listHeight = useElementHeight(listRef);
  const spacer = Math.max(0, (listHeight - 44) / 2);
  const didCenterRef = useRef(false);

  // Center the current selection once the scroller has a measured height;
  // re-run on detent change (scrollTop = index×44 is height-independent,
  // but the browser may clamp during the resize).
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list == null || listHeight === 0) return;
    if (!didCenterRef.current) {
      didCenterRef.current = true;
    }
    list.scrollTop = selection * 44;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listHeight, detent]);

  const onScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    const idx = Math.min(LIVE_TICK, Math.max(0, Math.round(event.currentTarget.scrollTop / 44)));
    if (idx !== selection) onSelect(idx);
  };

  const confirmLabel =
    selection === LIVE_TICK ? \`Go live · \${TICK_LABELS[LIVE_TICK]}\` : \`Pin to \${TICK_LABELS[selection]}\`;

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wtl-jump-title"
      tabIndex={-1}
      className="wtl-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
      }}>
      <button
        type="button"
        className="wtl-btn wtl-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onClick={onDetentToggle}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id="wtl-jump-title" style={styles.sheetTitle}>
          Jump to time
        </h2>
        <button type="button" className="wtl-btn wtl-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetListWrap}>
        <div style={styles.sheetBand} aria-hidden />
        <div ref={listRef} style={styles.sheetList} onScroll={onScroll}>
          <div style={{height: spacer}} aria-hidden />
          {TICK_LABELS.map((label, tick) => (
            <button
              key={label}
              type="button"
              className="wtl-btn wtl-focusable"
              style={tick === selection ? {...styles.timeRow, ...styles.timeRowSelected} : styles.timeRow}
              aria-pressed={tick === selection}
              onClick={() => {
                onSelect(tick);
                listRef.current?.scrollTo({top: tick * 44});
              }}>
              {label}
              {tick === LIVE_TICK ? ' · Live' : ''}
            </button>
          ))}
          <div style={{height: spacer}} aria-hidden />
        </div>
      </div>
      <div style={styles.sheetFooter}>
        <button type="button" className="wtl-btn wtl-focusable" style={styles.confirmBtn} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SETTINGS SWITCH ROW — the ENTIRE 44px row is the role='switch' button
// (inputControls contract); 51×31 track, 27px thumb travelling 20px. ON
// track = BRAND_ACCENT; OFF track = REST_FILL (interactive boundary at
// rest → ≥3:1 vs the card per the amendment, NOT the foundations' 14%
// alpha wash — math at the const).
// ---------------------------------------------------------------------------

interface SwitchRowProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

function SwitchRow({label, checked, onToggle}: SwitchRowProps) {
  return (
    <button
      type="button"
      className="wtl-btn wtl-focusable"
      style={styles.utilityRow}
      role="switch"
      aria-checked={checked}
      onClick={onToggle}>
      <span style={styles.utilLabel}>{label}</span>
      <span
        style={{...styles.switchTrack, background: checked ? BRAND_ACCENT : REST_FILL}}
        aria-hidden>
        <span
          style={{
            ...styles.switchThumb,
            transform: checked ? 'translateX(20px)' : undefined,
          }}
        />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — MeterClockStore. mode + cursor drive EVERY time-coupled
// surface (dial, bars, ticker, subtitle, pill, Usage 'Today' row); sweep is
// the only interval and it is user-initiated, terminates deterministically
// at tick 18, and never runs ambiently in live mode.
// ---------------------------------------------------------------------------

type TabId = 'meter' | 'usage' | 'devices' | 'settings';

interface MeterState {
  mode: 'live' | 'pinned';
  cursor: number; // 0–18
  sweeping: boolean;
  peakHoldWatts: number;
  peakHoldLabel: string;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  sheetSelection: number;
  activeTab: TabId;
  tabState: {
    usage: {selectedDay: string | null};
    devices: {selectedId: ApplianceId | null};
    settings: {alerts: boolean};
  };
  toast: {seq: number; text: string} | null;
}

const INITIAL_STATE: MeterState = {
  mode: 'live',
  cursor: LIVE_TICK,
  sweeping: false,
  peakHoldWatts: INITIAL_PEAK.watts,
  peakHoldLabel: INITIAL_PEAK.label,
  sheetOpen: false,
  sheetDetent: 'medium',
  sheetSelection: LIVE_TICK,
  activeTab: 'meter',
  tabState: {
    usage: {selectedDay: null},
    devices: {selectedId: null},
    settings: {alerts: true},
  },
  toast: null,
};

const TABS: Array<{id: TabId; label: string; icon: typeof GaugeIcon}> = [
  {id: 'meter', label: 'Meter', icon: GaugeIcon},
  {id: 'usage', label: 'Usage', icon: BarChart3Icon},
  {id: 'devices', label: 'Devices', icon: PlugIcon},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
];

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileHomeEnergyMeterTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<MeterState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<MeterState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);
  const updateTab = useCallback(
    <K extends TabId & keyof MeterState['tabState']>(id: K, patch: Partial<MeterState['tabState'][K]>) => {
      setState(prev => ({
        ...prev,
        tabState: {...prev.tabState, [id]: {...prev.tabState[id], ...patch}},
      }));
    },
    [],
  );

  const toastSeqRef = useRef(0);
  const toastPatch = (text: string) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text}};
  };
  const announce = (text: string) => update(toastPatch(text));

  // Focus plumbing — the sheet restores its opener on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);

  // Derived — every consumer reads the same cursor.
  const watts = TOTAL_BY_TICK[state.cursor];
  const cursorLabel = TICK_LABELS[state.cursor];
  const costCents = costCentsAt(state.cursor);
  const kwhCum = kwhCumAt(state.cursor);
  const subtitle = state.mode === 'live' ? \`Live · \${cursorLabel}\` : \`Pinned · \${cursorLabel}\`;
  const weekTotal = USAGE_FIXED_SUM + kwhCum;

  // SCRUB — one patch moves the whole surface (dial, bars, ticker, navBar
  // subtitle, LivePill). Announce only on settle, never per move/keystroke.
  const scrubTo = (tick: number, announceSettle: boolean) => {
    setState(prev => {
      const next: MeterState = {
        ...prev,
        sweeping: false,
        cursor: tick,
        mode: tick === LIVE_TICK ? 'live' : 'pinned',
        peakHoldWatts: Math.max(prev.peakHoldWatts, TOTAL_BY_TICK[tick]),
        peakHoldLabel:
          TOTAL_BY_TICK[tick] > prev.peakHoldWatts
            ? \`Peak \${fmtKw(TOTAL_BY_TICK[tick])} kW · \${TICK_LABELS[tick]}\`
            : prev.peakHoldLabel,
      };
      if (announceSettle) {
        toastSeqRef.current += 1;
        next.toast = {
          seq: toastSeqRef.current,
          text: tick === LIVE_TICK ? \`Back to live · \${TICK_LABELS[LIVE_TICK]}\` : \`Pinned to \${TICK_LABELS[tick]}\`,
        };
      }
      return next;
    });
  };

  // RETURN TO LIVE — deterministic catch-up sweep, 60 ms/tick (≤ ~1.1 s
  // from t0), user-initiated, self-terminating at tick 18. The peak hold
  // resets to the departure tick and re-accumulates through the sweep.
  // Under reduced motion the sweep is a single jump and the toast alone
  // narrates (peak = max over the skipped range, same arithmetic).
  const returnToLive = () => {
    setState(prev => {
      if (prev.cursor === LIVE_TICK && prev.mode === 'live') {
        toastSeqRef.current += 1;
        return {...prev, toast: {seq: toastSeqRef.current, text: \`Live · \${TICK_LABELS[LIVE_TICK]}\`}};
      }
      if (reducedMotion) {
        let peak = TOTAL_BY_TICK[prev.cursor];
        let peakTick = prev.cursor;
        for (let t = prev.cursor + 1; t <= LIVE_TICK; t++) {
          if (TOTAL_BY_TICK[t] > peak) {
            peak = TOTAL_BY_TICK[t];
            peakTick = t;
          }
        }
        toastSeqRef.current += 1;
        return {
          ...prev,
          mode: 'live',
          cursor: LIVE_TICK,
          sweeping: false,
          peakHoldWatts: peak,
          peakHoldLabel: \`Peak \${fmtKw(peak)} kW · \${TICK_LABELS[peakTick]}\`,
          toast: {seq: toastSeqRef.current, text: \`Back to live · \${TICK_LABELS[LIVE_TICK]}\`},
        };
      }
      return {
        ...prev,
        sweeping: true,
        peakHoldWatts: TOTAL_BY_TICK[prev.cursor],
        peakHoldLabel: \`Peak \${fmtKw(TOTAL_BY_TICK[prev.cursor])} kW · \${TICK_LABELS[prev.cursor]}\`,
      };
    });
  };

  // The sweep interval — mounted only while sweeping; cleared on unmount.
  useEffect(() => {
    if (!state.sweeping) return undefined;
    const id = setInterval(() => {
      setState(prev => {
        if (!prev.sweeping) return prev;
        const next = Math.min(LIVE_TICK, prev.cursor + 1);
        const nextWatts = TOTAL_BY_TICK[next];
        const peaked = nextWatts > prev.peakHoldWatts;
        const base = {
          ...prev,
          cursor: next,
          peakHoldWatts: peaked ? nextWatts : prev.peakHoldWatts,
          peakHoldLabel: peaked ? \`Peak \${fmtKw(nextWatts)} kW · \${TICK_LABELS[next]}\` : prev.peakHoldLabel,
        };
        if (next >= LIVE_TICK) {
          toastSeqRef.current += 1;
          return {
            ...base,
            mode: 'live' as const,
            sweeping: false,
            toast: {seq: toastSeqRef.current, text: \`Back to live · \${TICK_LABELS[LIVE_TICK]}\`},
          };
        }
        return base;
      });
    }, 60);
    return () => clearInterval(id);
  }, [state.sweeping]);

  // SHEET lifecycle — focus in with preventScroll (a plain .focus() would
  // scroll-reveal the animating sheet inside the locked overflow-hidden
  // column and beach it mid-screen — foundations amendment), restore to
  // the opener on every close path.
  const openJumpSheet = (opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    update({sheetOpen: true, sheetDetent: 'medium', sheetSelection: state.cursor});
  };
  const closeSheet = () => {
    update({sheetOpen: false});
    sheetOpenerRef.current?.focus();
  };
  const confirmSheet = () => {
    const sel = state.sheetSelection;
    setState(prev => ({
      ...prev,
      sheetOpen: false,
      sweeping: false,
      cursor: sel,
      mode: sel === LIVE_TICK ? 'live' : 'pinned',
      peakHoldWatts: Math.max(prev.peakHoldWatts, TOTAL_BY_TICK[sel]),
      ...toastPatch(
        sel === LIVE_TICK ? \`Back to live · \${TICK_LABELS[LIVE_TICK]}\` : \`Pinned to \${TICK_LABELS[sel]}\`,
      ),
    }));
    sheetOpenerRef.current?.focus();
  };
  useEffect(() => {
    if (state.sheetOpen) sheetRef.current?.focus({preventScroll: true});
  }, [state.sheetOpen]);
  // Escape closes the topmost overlay only — the sheet is the sole overlay.
  useEffect(() => {
    if (!state.sheetOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sheetOpen]);

  // TABS — switching sets activeTab only (tab-scoped state persists in
  // tabState); an open sheet closes (an overlay belongs to its moment);
  // re-tapping the active tab scrolls the demo scroller to top — the one
  // legal reset.
  const onTabPress = (id: TabId) => {
    if (id === state.activeTab) {
      shellRef.current?.scrollIntoView({block: 'start', behavior: 'auto'});
      return;
    }
    update({activeTab: id, sheetOpen: false});
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{WATTLING_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="wtl-btn wtl-focusable"
              style={styles.brandBtn}
              aria-label="Wattling — whole-home meter WTL-2209"
              onClick={() => announce('Wattling · meter WTL-2209 · Maple Ct')}>
              <WattlingMark />
            </button>
          </div>
          <div style={styles.navCenter}>
            <span style={styles.navTitle}>Wattling</span>
            <span style={styles.navSubtitle}>{subtitle}</span>
          </div>
          <div style={styles.navTrailing}>
            {/* LivePill — the mode indicator AND the persistent
                return-to-live button. Pulse dies under reduced motion; the
                static dot still encodes LIVE. */}
            <button
              type="button"
              className="wtl-btn wtl-focusable"
              style={styles.livePillHit}
              aria-label={
                state.mode === 'live'
                  ? \`Live at \${cursorLabel}\`
                  : \`Pinned to \${cursorLabel} — return to live\`
              }
              onClick={returnToLive}>
              {state.mode === 'live' ? (
                <span style={{...styles.livePill, ...styles.livePillLive}}>
                  <span className="wtl-live-dot" style={styles.liveDot} aria-hidden />
                  LIVE
                </span>
              ) : (
                <span style={{...styles.livePill, ...styles.livePillPinned}}>
                  {cursorLabel}
                  <Icon icon={RadioIcon} size="xsm" color="inherit" />
                </span>
              )}
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <h1 className="wtl-vh">Wattling home energy meter</h1>

          {state.activeTab === 'meter' ? (
            <>
              <section aria-label="Whole-home load">
                <div style={styles.dialCard}>
                  <h2 className="wtl-vh">Whole-home load</h2>
                  <LiveDialMeter
                    watts={watts}
                    peakWatts={state.peakHoldWatts}
                    peakLabel={state.peakHoldLabel}
                    mode={state.mode}
                    cursorLabel={cursorLabel}
                    reducedMotion={reducedMotion}
                  />
                </div>
              </section>

              <section aria-label="By appliance">
                <h2 style={styles.sectionHeader}>By appliance</h2>
                <ApplianceStreamBars cursor={state.cursor} reducedMotion={reducedMotion} onAnnounce={announce} />
              </section>

              <section aria-label="Last 3 hours">
                <h2 style={styles.sectionHeader}>Last 3 hours</h2>
                <TimeScrubStrip
                  cursor={state.cursor}
                  mode={state.mode}
                  onScrubTo={scrubTo}
                  onReturnToLive={returnToLive}
                  onOpenJumpSheet={openJumpSheet}
                />
              </section>

              <section aria-label="Today so far">
                <div style={{...styles.listCard, ...styles.costCard, marginTop: 24}}>
                  <h2 style={styles.costOverline}>Today so far</h2>
                  <span style={styles.costFigure}>{fmtUsd(costCents)}</span>
                  <span style={styles.costMeta}>
                    {fmtKwh(kwhCum)} kWh · \${RATE_PER_KWH.toFixed(2)}/kWh
                  </span>
                  {state.mode === 'pinned' ? <span style={styles.costAsOf}>as of {cursorLabel}</span> : null}
                </div>
              </section>
            </>
          ) : null}

          {state.activeTab === 'usage' ? (
            <section aria-label="Usage — last 7 days">
              <h2 style={styles.sectionHeader}>Last 7 days</h2>
              <div style={styles.listCard}>
                {USAGE_DAYS.map(day => (
                  <div key={day.id}>
                    <button
                      type="button"
                      className="wtl-btn wtl-focusable"
                      style={{
                        ...styles.utilityRow,
                        ...(state.tabState.usage.selectedDay === day.id ? {background: BRAND_TINT_12} : null),
                      }}
                      aria-pressed={state.tabState.usage.selectedDay === day.id}
                      onClick={() => {
                        updateTab('usage', {selectedDay: day.id});
                        announce(\`\${day.day}: \${fmtKwh(day.kwh)} kWh\`);
                      }}>
                      <span style={styles.utilLabel}>{day.day}</span>
                      <span style={styles.utilValue}>{fmtKwh(day.kwh)} kWh</span>
                    </button>
                    <div style={styles.rowDivider} />
                  </div>
                ))}
                {/* 'Today' derives LIVE from KWH_CUM[cursor] — pin 5:50 PM
                    on the Meter tab and this row (and the week total) drops
                    with it. */}
                <button
                  type="button"
                  className="wtl-btn wtl-focusable"
                  style={{
                    ...styles.utilityRow,
                    ...(state.tabState.usage.selectedDay === 'day_today' ? {background: BRAND_TINT_12} : null),
                  }}
                  aria-pressed={state.tabState.usage.selectedDay === 'day_today'}
                  onClick={() => {
                    updateTab('usage', {selectedDay: 'day_today'});
                    announce(\`Today so far: \${fmtKwh(kwhCum)} kWh\`);
                  }}>
                  <span style={styles.utilLabel}>Today · so far</span>
                  <span style={{...styles.utilValue, color: BRAND_ACCENT, fontWeight: 600}}>
                    {fmtKwh(kwhCum)} kWh
                  </span>
                </button>
                {/* 176.62 + 68.28 = 244.90 at live (math at USAGE_DAYS). */}
                <div style={styles.summaryRow}>
                  <span style={{flex: 1}}>Week total</span>
                  <span>{fmtKwh(weekTotal)} kWh</span>
                </div>
              </div>
            </section>
          ) : null}

          {state.activeTab === 'devices' ? (
            <section aria-label="Devices — metered today">
              <h2 style={styles.sectionHeader}>Metered today</h2>
              <div style={styles.listCard}>
                {APPLIANCES.map((appliance, index) => (
                  <div key={appliance.id}>
                    {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                    <button
                      type="button"
                      className="wtl-btn wtl-focusable"
                      style={{
                        ...styles.deviceRow,
                        ...(state.tabState.devices.selectedId === appliance.id ? {background: BRAND_TINT_12} : null),
                      }}
                      aria-pressed={state.tabState.devices.selectedId === appliance.id}
                      onClick={() => {
                        updateTab('devices', {selectedId: appliance.id});
                        announce(\`\${appliance.name}: \${fmtKwh(DEVICE_KWH_TODAY[appliance.id])} kWh today\`);
                      }}>
                      <span style={styles.iconTile} aria-hidden>
                        <Icon icon={appliance.icon} size="md" color="inherit" />
                      </span>
                      <span style={styles.deviceText}>
                        <span style={styles.appName}>{appliance.name}</span>
                        <span style={styles.deviceMeta}>
                          now {WATTS_BY_TICK[appliance.id][state.cursor] === 0 ? 'idle' : \`\${fmtWatts(WATTS_BY_TICK[appliance.id][state.cursor])} W\`}
                        </span>
                      </span>
                      <span style={styles.appWatts}>{fmtKwh(DEVICE_KWH_TODAY[appliance.id])} kWh</span>
                    </button>
                  </div>
                ))}
                {/* 14.20+21.60+9.00+1.10+6.38 = 52.28 (math at the const). */}
                <div style={styles.summaryRow}>
                  <span style={{flex: 1}}>Metered today</span>
                  <span>{fmtKwh(DEVICES_METERED_SUM)} kWh</span>
                </div>
              </div>
              {/* Stress fixture 6 — the cross-sum is literally on screen. */}
              <p style={styles.cardCaption}>
                plus {fmtKwh(PRE_4PM_UNMETERED)} kWh before 4:00 PM = {fmtKwh(DEVICES_METERED_SUM + PRE_4PM_UNMETERED)} kWh
              </p>
            </section>
          ) : null}

          {state.activeTab === 'settings' ? (
            <section aria-label="Settings">
              <h2 style={styles.sectionHeader}>Meter settings</h2>
              <div style={styles.listCard}>
                {SETTINGS_ROWS.map(row => (
                  <div key={row.id}>
                    <button
                      type="button"
                      className="wtl-btn wtl-focusable"
                      style={styles.utilityRow}
                      onClick={() => announce(\`\${row.label}: \${row.value}\`)}>
                      <span style={styles.utilLabel}>{row.label}</span>
                      <span style={styles.utilValue}>{row.value}</span>
                      <span style={styles.chev} aria-hidden>
                        <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                      </span>
                    </button>
                    <div style={styles.rowDivider} />
                  </div>
                ))}
                <SwitchRow
                  label="High-usage alerts"
                  checked={state.tabState.settings.alerts}
                  onToggle={() => {
                    const next = !state.tabState.settings.alerts;
                    updateTab('settings', {alerts: next});
                    announce(next ? 'High-usage alerts on' : 'High-usage alerts off');
                  }}
                />
              </div>
            </section>
          ) : null}
        </main>

        {/* toastDock — the ONE polite live region; sticky-in-flow above the
            tabBar (amendment: never shell-absolute on a scrolling view).
            One toast at a time, NO auto-dismiss timers — the next
            announcement replaces it. */}
        <div style={styles.toastDock} aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="wtl-fade">
              {state.toast.text}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} aria-label="Wattling sections">
          {TABS.map(tab => {
            const isActive = tab.id === state.activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                className="wtl-btn wtl-focusable"
                style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onTabPress(tab.id)}>
                <Icon icon={tab.icon} size="md" color="inherit" />
                <span style={isActive ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {state.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {state.sheetOpen ? (
          <JumpToTimeSheet
            detent={state.sheetDetent}
            selection={state.sheetSelection}
            sheetRef={sheetRef}
            onDetentToggle={() => update({sheetDetent: state.sheetDetent === 'medium' ? 'large' : 'medium'})}
            onSelect={tick => update({sheetSelection: tick})}
            onConfirm={confirmSheet}
            onClose={closeSheet}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};