var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Airlume go-live preflight for
 *   Ayla Reyes (@aylalive) on stream st-0712 'Late Night Synth Build
 *   Vol. 12' (Music · Live Production): 7 gates = 4 blocking checks + 3
 *   signal meters (cross-check 4+3=7); initially met 4 = 2 blocking + 2
 *   green meters (2+2=4 ✓), blockers = 3 (copyright scan, moderator,
 *   battery 18% < 20%). Meters: bitrate 4,212 kbps (min 2,500 — headroom
 *   4,212−2,500 = 1,712), audio −14 dB in [−20,−6], battery 18% RED with a
 *   'Plug in' fix → 64%. Followers 1,284 = 941 push + 343 email-only
 *   (941+343=1,284 ✓). Sparklines are fixed 24-sample arrays; no
 *   Date.now(), no Math.random(), no network media (cover is an
 *   id-derived stylized SVG gradient).
 * @output Airlume — Stream Preflight: a 390px MOBILE go-live ritual.
 *   NavBar (44×44 Close · 22px ReadinessRing 4/7 = 206° + 'Go Live' ·
 *   44×44 Bell with notify dot) over a 194px streamCard (120px id-derived
 *   SVG cover, one-line title, two 24px chips), a 274px SignalMeterCluster
 *   ('2 of 3 green', three 76px meter rows with 24-bar sparklines), a
 *   243px REQUIRED card (4 × 60px ChecklistGateRow — unmet rows paint a
 *   2px error lock-tether toward the footer, 'Run scan'/'Assign' fix
 *   verbs), a 182px OPTIONAL card (3 switch rows), a sticky-in-flow
 *   toastDock, and a 124px stickyFooter whose 56px CountdownArmBar is the
 *   thumb-zone primary. Signature move: every gate toggle re-derives ONE
 *   store — ring arc, arm-bar readiness, 'Review blockers (N)' ↔ 'Go
 *   Live' aux, '2 of 3 green' caption, and the notify sheet's recipient
 *   math move together; completing the slide (release ≥85% of measured
 *   travel) runs a T-minus 5 countdown (any tap aborts → Undo re-arms at
 *   5), and at 0 the navBar flips to a tinted 'ON AIR · 00:00' treatment.
 *   Rejected slides rubber-band and fire a BlockerCallout pinned to the
 *   first unmet gate. Ending the live stream routes through Undo.
 * @position Page template; emitted by \`astryx template mobile-stream-preflight\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheets, callout, toast)
 *   are position:'absolute' or sticky INSIDE shell; position:fixed is
 *   banned. While a sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close; the toastDock is
 *   sticky-in-flow above the footer normally and shell-absolute ONLY
 *   during that scroll-lock (binding rider). Focus enters sheets with
 *   focus({preventScroll:true}).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 56 when a 24px status glyph
 *   leads: 16 pad + 24 glyph + 16 gap = 56); no desktop Layout frames, no
 *   asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Airlume sky — the demo --color-brand is the demo logo
 *   blue, so the spec hex is quarantined per house rule). Sanctioned
 *   non-brand literals with contrast math at each declaration: green
 *   meter pair, error interactive-border pair, error fill + fill-text
 *   pair, switch OFF-track pair (amendment: interactive rest fills need
 *   ≥3:1 vs their ACTUAL surface — hairline tokens are for passive
 *   separators only), and the sheet scrim. Passive dividers stay hairline
 *   tokens.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr'); rows 44px utility / 60px
 *   ChecklistGateRow (16px/500 + 13px/400, 2px gap); sectionHeader
 *   13px/600 uppercase 0.06em at 32px (16 gutter + 16 card pad), 20px
 *   top / 8px bottom. HARD HEIGHTS (cross-checked): streamCard 194 = 120
 *   cover + 12 pad + 22 title + 4 + 24 chips + 12 pad; SignalMeterCluster
 *   274 = 44 header + 3×76 rows + 2×1 dividers; meter row 76 = 12 + 18
 *   label + 6 + 28 sparkline + 12; REQUIRED card 243 = 4×60 + 3;
 *   OPTIONAL card 182 = 3×60 + 2; stickyFooter 124 = 12 + 36 aux + 8 +
 *   56 arm bar + 12. Buttons: 36px secondary in 44px hit wrappers, 44×44
 *   icon buttons; switch 51×31 inside whole-row 60px targets. TYPE
 *   (Figtree via --font-family-body): 17/600 nav + sheet titles · 17/700
 *   tabular 'ON AIR · 00:00' · 16/400–600 body · 13/400 meta · 11/500
 *   overlines, thresholds, chips; nothing under 11px; tabular-nums on
 *   every meter value, count, and countdown numeral.
 *
 * Responsive contract:
 * - Fluid 320–430px: zero width literals — arm-bar travel is measured on
 *   pointerdown (390: track 358 = 390−32, travel 302 = 358−48−8,
 *   threshold ≈257 = 85%; 320: track 288, travel 232, threshold ≈197);
 *   sparkline bars are flex:1 with 2px gaps; meter captions ellipsize
 *   first (minWidth:0); chips fit at 320 (two chips ≈150px). Lock tethers
 *   draw inside cards so they can never overflow. overflowX:'clip' on
 *   shell is the backstop, not the strategy.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the preflight anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  BellIcon,
  CheckIcon,
  ChevronsRightIcon,
  LockIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Airlume sky). #0284C7 on #FFFFFF = 4.6:1
// (passes 4.5:1 for the 16px/600 arm label and 13px/600 fix verbs);
// #38BDF8 on the dark card (~#1C1C1E) ≈ 8.1:1.
const BRAND_ACCENT = 'light-dark(#0284C7, #38BDF8)';
// Text/glyphs over a BRAND_ACCENT fill (met-gate check, arm thumb chevron).
// Light: #FFFFFF on #0284C7 = 4.6:1. Dark: white on #38BDF8 fails (~2.1:1),
// so the dark side flips to near-black sky — #082F49 on #38BDF8 ≈ 6.5:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #082F49)';
// Ready-state fill behind the thumb path — 16% brand mix per spec; the
// MEANINGFUL ready state also flips the thumb to a solid brand fill, so
// the wash is reinforcement, not the sole encoding.
const BRAND_TINT_16 = \`color-mix(in srgb, \${BRAND_ACCENT} 16%, transparent)\`;
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Green meter pair (bar fills + values). #15803D on the #FFFFFF card =
// 5.0:1; #4ADE80 on the dark card (~#1C1C1E) ≈ 9.8:1 — both pass 4.5:1
// for the 16px values and clear the ≥3:1 amendment for the bar fills
// against the card surface.
const GREEN_METER = 'light-dark(#15803D, #4ADE80)';
// Interactive-adjacent error boundary (unmet-gate ring, BlockerCallout
// border, plug/fix outlines): explicit pair per the amendment —
// #DC2626 vs the white card = 3.9:1, #F87171 vs the dark card = 4.4:1,
// both ≥3:1 against their ACTUAL surface.
const ERROR_BORDER = 'light-dark(#DC2626, #F87171)';
// Destructive fill (End-stream bar). #C92A2A on white ≈ 5.5:1; #FF8787 on
// the dark card ≈ 7.4:1.
const ERROR_STRONG = 'light-dark(#C92A2A, #FF8787)';
// Text over an ERROR_STRONG fill: #FFFFFF on #C92A2A ≈ 5.5:1; #300808 on
// #FF8787 ≈ 7.8:1.
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #300808)';
// Live navBar tint — 12% error mix over the body surface per spec.
const LIVE_NAV_TINT = 'color-mix(in srgb, var(--color-error) 12%, var(--color-background-body))';
// Lock-tether line — pure decoration (aria-hidden), 55% error mix per
// spec; exempt from text-contrast law because it encodes nothing that the
// unmet ring + lock glyph + aria-description don't already state.
const TETHER = 'color-mix(in srgb, var(--color-error) 55%, transparent)';
// Switch OFF track — AMENDMENT CLASS: a rest-state interactive fill, so
// the foundations' 14%-alpha default is overridden with an explicit pair
// at ≥3:1 vs the ACTUAL card surface. #64748B vs #FFFFFF = 4.8:1;
// #94A3B8 vs #1C1C1E ≈ 6.7:1.
const SWITCH_OFF_TRACK = 'light-dark(#64748B, #94A3B8)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, the visually-hidden h1, keyframes,
// and the reduced-motion guard. Transitions animate transform/opacity/color
// only and collapse to instant under prefers-reduced-motion (countdown fill
// then steps discretely; the ON AIR pulse dot goes static).
// ---------------------------------------------------------------------------

const AIRLUME_CSS = \`
.alm-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.alm-btn:disabled { cursor: default; }
.alm-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.alm-fade { transition: opacity 240ms ease; }
.alm-color { transition: background-color 200ms ease, color 200ms ease; }
@keyframes alm-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.alm-sheet-in { animation: alm-sheet-in 240ms ease; }
@keyframes alm-callout-in {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.alm-callout-in { animation: alm-callout-in 200ms ease; }
@keyframes alm-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.8); }
}
.alm-pulse { animation: alm-pulse 1.2s ease-in-out infinite; }
.alm-vh {
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
  .alm-fade, .alm-color { transition: none; }
  .alm-sheet-in { animation: none; }
  .alm-callout-in { animation: none; opacity: 1; }
  .alm-pulse { animation: none; }
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
  // Scroll lock while a sheet is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 icon buttons
  // optically align content to the 16px gutter. Hairline + blur ALWAYS ON
  // (this template does not wire scroll-under; noted per contract).
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
  navBarLive: {background: LIVE_NAV_TINT},
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 0,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // ON AIR — 17px/700 tabular so '00:09' → '00:10' never shifts.
  navTitleLive: {
    fontSize: 17,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: 'var(--color-error)',
    flexShrink: 0,
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    position: 'relative',
  },
  // Notify dot on the bell — shows only while the 'Notify followers'
  // optional gate is ON (counts live in the sheet, not the badge).
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 999,
    background: BRAND_ACCENT,
    border: '2px solid var(--color-background-body)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // STREAM CARD — 194 = 120 cover + 12 pad + 22 title line + 4 + 24 chips
  // + 12 pad (cross-checked).
  streamCard: {
    marginInline: 16,
    marginTop: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  cover: {display: 'block', width: '100%', height: 120},
  streamBody: {padding: 12, display: 'flex', flexDirection: 'column', gap: 4},
  streamTitle: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: '22px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
  },
  chipRow: {display: 'flex', gap: 8, height: 24},
  chip: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom.
  sectionHeader: {
    margin: '20px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // Passive separators stay hairline tokens (amendment: only interactive
  // boundaries need the explicit ≥3:1 pairs).
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // 56 = 16 pad + 24 glyph + 16 gap for glyph-led checklist rows.
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 56},
  // SIGNAL METER CLUSTER — 274 = 44 header + 3×76 + 2×1 dividers.
  clusterHeader: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  clusterTitle: {flex: 1, minWidth: 0, fontSize: 16, fontWeight: 500},
  clusterCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Meter row 76 = 12 + 18 label row + 6 + 28 sparkline + 12.
  meterRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 12,
    height: 76,
    boxSizing: 'border-box',
  },
  meterCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  meterLabelRow: {
    height: 18,
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    minWidth: 0,
  },
  meterName: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0},
  // Caption ellipsizes FIRST at 320 (minWidth 0, flex 1).
  meterCaption: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  meterValue: {
    fontSize: 16,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  sparkline: {height: 28, display: 'flex', alignItems: 'flex-end', gap: 2},
  sparkBar: {flex: 1, minWidth: 0, borderRadius: 2},
  // Trailing 36px pill verbs ('Plug in' / 'Run scan' / 'Assign' / 'Fix')
  // rendered inside 44px-tall hit wrappers per the touch-target law.
  sideBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    borderRadius: 12,
  },
  sideBtnPill: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  sideBtnPillError: {border: \`1px solid \${ERROR_BORDER}\`, color: 'var(--color-error)'},
  // CHECKLIST GATE ROW — 60px; whole row is a real <button> (fix verbs are
  // SIBLINGS outside it, never nested).
  checkRowWrap: {position: 'relative', display: 'flex', alignItems: 'center', paddingInlineEnd: 8},
  checkRow: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingInlineStart: 16,
  },
  glyphMet: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
  },
  // Unmet ring — interactive boundary, so the explicit ERROR_BORDER pair
  // (≥3:1 vs the card in both schemes), never a hairline token.
  glyphUnmet: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 999,
    border: \`2px solid \${ERROR_BORDER}\`,
    color: 'var(--color-error)',
    display: 'grid',
    placeItems: 'center',
    boxSizing: 'border-box',
  },
  checkText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  checkPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  checkDetail: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // Lock tether — 2px causality line from the unmet glyph down the card's
  // left inner edge toward the arm bar; aria-hidden decoration; drawn
  // INSIDE the card (the card's overflow:hidden clips it) so it can never
  // cause horizontal overflow. Glyph center x = 16 + 12 = 28 → left 27.
  tether: {
    position: 'absolute',
    left: 27,
    top: 44,
    width: 2,
    height: 480,
    background: TETHER,
    pointerEvents: 'none',
  },
  // SWITCH — 51×31 track / 27px thumb per the input contract; the WHOLE
  // 60px row is the role='switch' target, never the bare 51×31 visual.
  switchTrack: {
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    background: SWITCH_OFF_TRACK,
    position: 'relative',
  },
  switchTrackOn: {background: BRAND_ACCENT},
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
  switchThumbOn: {transform: 'translateX(20px)'},
  // BLOCKER CALLOUT — absolute pill (z30) pinned above the first unmet
  // row; 8×8 rotated-square tail points down at the row. Border is the
  // interactive-adjacent ERROR_BORDER pair (3.9:1 / 4.4:1 vs the cards).
  calloutPill: {
    position: 'absolute',
    top: -44,
    right: 12,
    zIndex: 30,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: \`1px solid \${ERROR_BORDER}\`,
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  calloutTail: {
    position: 'absolute',
    bottom: -5,
    right: 24,
    width: 8,
    height: 8,
    background: 'var(--color-background-card)',
    borderRight: \`1px solid \${ERROR_BORDER}\`,
    borderBottom: \`1px solid \${ERROR_BORDER}\`,
    transform: 'rotate(45deg)',
  },
  // TOAST DOCK — sticky-in-flow above the 124px footer (binding rider:
  // shell-absolute pins to the DOCUMENT bottom on tall scrolling views);
  // switches to shell-absolute ONLY while the sheet scroll-lock is active.
  toastDock: {
    position: 'sticky',
    bottom: 136,
    zIndex: 30,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 140,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
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
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // STICKY FOOTER — 124 = 12 top + 36 aux + 8 + 56 arm bar + 12 bottom.
  stickyFooter: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '12px 16px',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  auxRow: {height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'},
  auxBtn: {
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  auxBtnGoLive: {color: BRAND_ACCENT, border: \`1px solid \${BRAND_ACCENT}\`},
  auxCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // COUNTDOWN ARM BAR — 56px pill track (radius 28); the rest-state track
  // stays --color-background-muted (passive here per spec — the MEANINGFUL
  // state is the ready fill + solid brand thumb).
  armTrack: {
    position: 'relative',
    height: 56,
    borderRadius: 28,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
    touchAction: 'none',
  },
  armReadyFill: {position: 'absolute', inset: 0, background: BRAND_TINT_16},
  // Countdown fill — scaleX from the left, 20%/s × 5 = 100%; transform
  // only (1s linear per tick; discrete steps under reduced motion). A 28%
  // brand mix keeps the 16px/600 label ≥4.5:1 on both schemes (label is
  // text-primary over body-muted ∪ 28% brand wash).
  armCountFill: {
    position: 'absolute',
    inset: 0,
    background: \`color-mix(in srgb, \${BRAND_ACCENT} 28%, transparent)\`,
    transformOrigin: 'left center',
  },
  armLabel: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'none',
    paddingInline: 56,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  armLabelMuted: {color: 'var(--color-text-secondary)'},
  // 48px circular thumb inset 4px; travel measured at pointerdown (no
  // width literals): travel = trackWidth − 48 − 8.
  armThumb: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
  },
  armThumbNotReady: {opacity: 0.4},
  // Whole-bar abort button during counting / End-stream bar while live.
  armFullBtn: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 28,
  },
  endBar: {
    height: 56,
    borderRadius: 28,
    background: ERROR_STRONG,
    color: ERROR_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    width: '100%',
  },
  // SHEETS — scrim z40 + sheet z41, absolute inside shell; medium 55% /
  // large calc(100% − 56px) detents.
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
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  // Sheet cards reuse listCard geometry without the gutter inset.
  sheetCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  utilRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  utilLabel: {flex: 1, minWidth: 0, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'},
  utilValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  switchRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingInline: 16,
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
  confirmBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  confirmCaption: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  sheetSectionLabel: {
    margin: '16px 0 8px',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checking aggregates.
// Ledger (verified by hand): GATES 7 = 4 blocking + 3 meters ✓; initially
// met 4 = 2 blocking (b1, b2) + 2 green meters (bitrate, audio) ✓; blockers
// 3 = b3 + b4 + battery, 4 met + 3 unmet = 7 ✓; ring arc 4/7 × 360° ≈ 206°
// (dash 4/7 × 61.26 = 35.0); bitrate headroom 4,212 − 2,500 = 1,712 ✓;
// followers 941 + 343 = 1,284 ✓.
// ---------------------------------------------------------------------------

const CREATOR = {id: 'u-ayla', name: 'Ayla Reyes', handle: '@aylalive'};
const MOD = {id: 'u-nova', handle: '@nova_mods'};
const STREAM = {
  id: 'st-0712',
  title: 'Late Night Synth Build Vol. 12',
  category: 'Music',
  subcategory: 'Live Production',
};
// Stress fixture (1): swap STREAM.title for this to exercise the one-line
// streamCard ellipsis — the nav title stays the static 'Go Live' either way.
const STREAM_TITLE_LONG =
  'Late Night Synth Build Vol. 12 — Modular Jam, Q&A, and Patch Giveaway (Members Early Access)';
void STREAM_TITLE_LONG;

// FOLLOWERS: 1,284 total = 941 push-enabled + 343 email-only (941+343=1,284 ✓).
const FOLLOWERS = {total: 1284, push: 941, emailOnly: 343};

type BlockerId = 'b3' | 'b4' | 'battery';

interface BlockingCheck {
  id: 'b1' | 'b2' | 'b3' | 'b4';
  label: string;
  met: boolean;
  detail: string;
  metDetail: string;
  fixVerb: string | null; // 'Run scan' / 'Assign' — one deterministic assignment
  calloutLabel: string;
}

interface OptionalCheck {
  id: 'o1' | 'o2' | 'o3';
  label: string;
  on: boolean;
  detail: string;
}

// 4 blocking (2 met) — b3/b4 carry fix verbs that resolve in one assignment.
const BLOCKING_FIXTURE: BlockingCheck[] = [
  {
    id: 'b1',
    label: 'Stream title & category',
    met: true,
    detail: STREAM.title,
    metDetail: STREAM.title,
    fixVerb: null,
    calloutLabel: 'Title & category required',
  },
  {
    id: 'b2',
    label: 'Destination connected',
    met: true,
    detail: 'Airlume RTMP · key ****7741',
    metDetail: 'Airlume RTMP · key ****7741',
    fixVerb: null,
    calloutLabel: 'Destination required',
  },
  {
    id: 'b3',
    label: 'Copyright audio scan',
    met: false,
    detail: 'Not run for this session',
    metDetail: 'Passed · 0 flags',
    fixVerb: 'Run scan',
    calloutLabel: 'Copyright scan required',
  },
  {
    id: 'b4',
    label: 'Moderator assigned',
    met: false,
    detail: 'No moderator for chat',
    metDetail: MOD.handle,
    fixVerb: 'Assign',
    calloutLabel: 'Moderator required',
  },
];

// 3 optional (2 ON) — whole-row switches, never gates.
const OPTIONAL_FIXTURE: OptionalCheck[] = [
  {id: 'o1', label: 'Notify followers', on: true, detail: 'Push to 941 · email optional'},
  {id: 'o2', label: 'Save VOD replay', on: true, detail: 'Kept for 60 days'},
  {id: 'o3', label: 'Share to Story', on: false, detail: 'Posts a 24 h go-live card'},
];

interface Meter {
  id: 'bitrate' | 'audio' | 'battery';
  name: string;
  value: number;
  unit: string;
  // greenness rule inputs — bitrate/battery use min; audio uses [lo, hi]
  min?: number;
  lo?: number;
  hi?: number;
  calloutLabel: string;
}

// METERS: bitrate green (4,212 ≥ 2,500), audio green (−14 ∈ [−20, −6]),
// battery RED (18 < 20; 'Plug in' → 64). BOUNDARY (stress fixture 8): the
// rule is value ≥ min, so battery at exactly 20 is GREEN.
const METERS_FIXTURE: Record<Meter['id'], Meter> = {
  bitrate: {id: 'bitrate', name: 'Bitrate', value: 4212, unit: 'kbps', min: 2500, calloutLabel: 'Bitrate below 2,500 kbps'},
  audio: {id: 'audio', name: 'Audio', value: -14, unit: 'dB', lo: -20, hi: -6, calloutLabel: 'Audio outside −20…−6 dB'},
  battery: {id: 'battery', name: 'Battery', value: 18, unit: '%', min: 20, calloutLabel: 'Battery below 20%'},
};

// Sparklines — exactly 24 fixed samples each; no Math.random, no device
// APIs. BITRATE cycles a 6-step wave ×4; AUDIO cycles an 8-step wave ×3;
// BATTERY descends 0.24 → 0.18 in 24 flat steps.
const BITRATE_STEPS = [0.78, 0.84, 0.71, 0.9, 0.8, 0.86];
const BITRATE_WAVE = [...BITRATE_STEPS, ...BITRATE_STEPS, ...BITRATE_STEPS, ...BITRATE_STEPS];
const AUDIO_STEPS = [0.42, 0.66, 0.5, 0.73, 0.58, 0.61, 0.45, 0.7];
const AUDIO_WAVE = [...AUDIO_STEPS, ...AUDIO_STEPS, ...AUDIO_STEPS];
const BATTERY_WAVE = Array.from({length: 24}, (_, i) => 0.24 - (i * 0.06) / 23);
const WAVES: Record<Meter['id'], number[]> = {
  bitrate: BITRATE_WAVE,
  audio: AUDIO_WAVE,
  battery: BATTERY_WAVE,
};

// Blockers are ORDERED b3 → b4 → battery (stress fixture 3: a rejected
// slide deterministically pins the callout to b3 first).
const METER_ORDER: Meter['id'][] = ['bitrate', 'audio', 'battery'];

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** 4212 → '4,212' (fixed en-US grouping — no locale drift). */
function fmtNum(n: number): string {
  const sign = n < 0 ? '−' : '';
  const digits = Math.abs(n).toString();
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ',';
    out += digits[i];
  }
  return sign + out;
}

/** Elapsed seconds → '00:00' / '12:07'. */
function fmtElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return \`\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}\`;
}

function meterGreen(meter: Meter): boolean {
  if (meter.lo != null && meter.hi != null) {
    return meter.value >= meter.lo && meter.value <= meter.hi;
  }
  // value ≥ min: battery at exactly 20 is green (boundary, stress 8).
  return meter.min != null && meter.value >= meter.min;
}

function meterValueLabel(meter: Meter): string {
  if (meter.id === 'audio') return \`\${fmtNum(meter.value)} \${meter.unit}\`;
  return \`\${fmtNum(meter.value)} \${meter.unit}\`;
}

function meterCaptionLabel(meter: Meter): string {
  if (meter.id === 'bitrate') {
    // Headroom shown while green: 4,212 − 2,500 = 1,712 ✓.
    return meterGreen(meter)
      ? \`min \${fmtNum(meter.min ?? 0)} · +\${fmtNum(meter.value - (meter.min ?? 0))} headroom\`
      : \`min \${fmtNum(meter.min ?? 0)} \${meter.unit}\`;
  }
  if (meter.id === 'audio') return 'target −20 to −6 dB';
  return \`min \${fmtNum(meter.min ?? 0)}%\`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useReducer store; DERIVED (never stored): meterGreen,
// metGates, isReady, blockers, recipients. scrollLock from the spec's store
// shape is derived as (sheet != null) instead of stored — one fewer flag to
// desync (noted deviation).
// ---------------------------------------------------------------------------

type ArmedState = 'idle' | 'counting' | 'live';
type SheetId = null | 'notify' | 'blockers';

interface Toast {
  seq: number;
  text: string;
  // Undo routes: 'abort' re-arms at T-5 (a fresh arm, NOT the aborted
  // tick — stated per stress fixture 7); 'end' restores the live state
  // with the elapsed clock intact.
  undo: null | 'abort' | 'end';
}

interface PreflightState {
  blocking: BlockingCheck[];
  optional: OptionalCheck[];
  meters: Record<Meter['id'], Meter>;
  armed: ArmedState;
  countdown: number;
  elapsed: number;
  sheet: SheetId;
  sheetDetent: 'medium' | 'large';
  emailAlso: boolean;
  toast: Toast | null;
  callout: BlockerId | null;
  toastSeq: number;
  endedElapsed: number | null; // snapshot for the End-stream Undo
}

const INITIAL_STATE: PreflightState = {
  blocking: BLOCKING_FIXTURE,
  optional: OPTIONAL_FIXTURE,
  meters: METERS_FIXTURE,
  armed: 'idle',
  countdown: 5,
  elapsed: 0,
  sheet: null,
  sheetDetent: 'medium',
  emailAlso: false,
  toast: null,
  callout: null,
  toastSeq: 0,
  endedElapsed: null,
};

type Action =
  | {type: 'check'; id: BlockingCheck['id']; patch: Partial<BlockingCheck>; toast?: string}
  | {type: 'toggleOptional'; id: OptionalCheck['id']}
  | {type: 'meter'; id: Meter['id']; patch: Partial<Meter>; toast?: string}
  | {type: 'ui'; patch: Partial<Pick<PreflightState, 'sheet' | 'sheetDetent' | 'emailAlso' | 'callout'>>}
  | {type: 'reject'; firstBlocker: BlockerId; blockerCount: number; label: string}
  | {type: 'toast'; text: string; undo?: Toast['undo']}
  | {type: 'arm'}
  | {type: 'tick'}
  | {type: 'abort'}
  | {type: 'elapsedTick'}
  | {type: 'end'}
  | {type: 'undo'};

function withToast(state: PreflightState, text: string, undo: Toast['undo'] = null): PreflightState {
  const seq = state.toastSeq + 1;
  return {...state, toastSeq: seq, toast: {seq, text, undo}};
}

function reducer(state: PreflightState, action: Action): PreflightState {
  switch (action.type) {
    case 'check': {
      const blocking = state.blocking.map(check =>
        check.id === action.id ? {...check, ...action.patch} : check,
      );
      // Fixing the callout's target removes the callout.
      const callout = state.callout === action.id ? null : state.callout;
      const next = {...state, blocking, callout};
      return action.toast != null ? withToast(next, action.toast) : next;
    }
    case 'toggleOptional': {
      const optional = state.optional.map(check =>
        check.id === action.id ? {...check, on: !check.on} : check,
      );
      return {...state, optional};
    }
    case 'meter': {
      const meters = {
        ...state.meters,
        [action.id]: {...state.meters[action.id], ...action.patch},
      };
      const callout = state.callout === action.id ? null : state.callout;
      const next = {...state, meters, callout};
      return action.toast != null ? withToast(next, action.toast) : next;
    }
    case 'ui':
      return {...state, ...action.patch};
    case 'reject':
      // Rejected slide: settled message, not per-pixel (a11y plan).
      return withToast(
        {...state, callout: action.firstBlocker},
        \`\${action.label} — \${action.blockerCount} blocker\${action.blockerCount === 1 ? '' : 's'} remain\`,
      );
    case 'toast':
      return withToast(state, action.text, action.undo ?? null);
    case 'arm':
      return withToast(
        {...state, armed: 'counting', countdown: 5, callout: null, sheet: null},
        'Armed — going live in 5',
      );
    case 'tick': {
      if (state.armed !== 'counting') return state;
      if (state.countdown > 1) return {...state, countdown: state.countdown - 1};
      return withToast({...state, armed: 'live', countdown: 0, elapsed: 0}, "You're live");
    }
    case 'abort':
      if (state.armed !== 'counting') return state;
      return withToast({...state, armed: 'idle', countdown: 5}, 'Countdown aborted', 'abort');
    case 'elapsedTick':
      return state.armed === 'live' ? {...state, elapsed: state.elapsed + 1} : state;
    case 'end':
      if (state.armed !== 'live') return state;
      return withToast(
        {...state, armed: 'idle', countdown: 5, endedElapsed: state.elapsed},
        \`Stream ended · \${fmtElapsed(state.elapsed)}\`,
        'end',
      );
    case 'undo': {
      if (state.toast?.undo === 'abort') {
        // Undo re-arms at T-5: a fresh arm, not a resume at the aborted
        // second (stress fixture 7).
        return withToast({...state, armed: 'counting', countdown: 5}, 'Armed — going live in 5');
      }
      if (state.toast?.undo === 'end' && state.endedElapsed != null) {
        return withToast(
          {...state, armed: 'live', elapsed: state.endedElapsed, endedElapsed: null},
          "Back on air",
        );
      }
      return state;
    }
    default:
      return state;
  }
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

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — sheets trap focus while open; Escape closes the topmost
// overlay only; focus restores to the opener on every close path.
// ---------------------------------------------------------------------------

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
// READINESS RING — 22px SVG in the navBar center. r = 9.75 → C = 2π·9.75 =
// 61.26; arc = metGates/7 × C (initial 4/7 → dash 35.0/61.26 ≈ 206°).
// Track stroke uses --color-border; aria-hidden — the accessible readiness
// lives in the arm bar's aria-valuetext and the toastDock.
// ---------------------------------------------------------------------------

const RING_R = 9.75;
const RING_C = 2 * Math.PI * RING_R; // 61.26

function ReadinessRing({met, total}: {met: number; total: number}) {
  const dash = (met / total) * RING_C;
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" aria-hidden style={{flexShrink: 0}}>
      <circle cx={11} cy={11} r={RING_R} stroke="var(--color-border)" strokeWidth={2.5} />
      <circle
        cx={11}
        cy={11}
        r={RING_R}
        stroke={BRAND_ACCENT}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={\`\${dash.toFixed(2)} \${RING_C.toFixed(2)}\`}
        transform="rotate(-90 11 11)"
        className="alm-fade"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// STREAM COVER — stylized SVG, id-derived (no photos, no network). Hues
// derive from STREAM.id char codes; the equalizer bars reuse the fixed
// AUDIO_STEPS wave. Decorative: aria-hidden.
// ---------------------------------------------------------------------------

function idHue(id: string, offset: number): number {
  let acc = 0;
  for (let i = 0; i < id.length; i++) acc = (acc + id.charCodeAt(i) * (i + 3)) % 360;
  return (acc + offset) % 360;
}

function StreamCover({streamId}: {streamId: string}) {
  const h1 = idHue(streamId, 0); // st-0712 → deterministic hue pair
  const h2 = idHue(streamId, 140);
  return (
    <svg viewBox="0 0 390 120" style={styles.cover} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="alm-cover-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={\`hsl(\${h1} 62% 30%)\`} />
          <stop offset="100%" stopColor={\`hsl(\${h2} 68% 42%)\`} />
        </linearGradient>
      </defs>
      <rect width="390" height="120" fill="url(#alm-cover-grad)" />
      {/* Equalizer skyline from the fixed AUDIO_STEPS wave. */}
      {AUDIO_STEPS.map((sample, i) => (
        <rect
          key={i}
          x={24 + i * 44}
          y={120 - sample * 88}
          width={20}
          height={sample * 88}
          rx={4}
          fill="rgba(255, 255, 255, 0.28)"
        />
      ))}
      <circle cx={330} cy={34} r={46} fill={\`hsl(\${h2} 70% 60% / 0.35)\`} />
      <circle cx={352} cy={18} r={20} fill={\`hsl(\${h1} 70% 68% / 0.4)\`} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SIGNAL METER CLUSTER — one listCard: 44px header + three 76px meter rows.
// Green bars/values use the GREEN_METER pair (5.0:1 / ~9.8:1 vs the card);
// below-threshold rows use var(--color-error). The battery 'Plug in' fix is
// the meter-side deterministic assignment (18 → 64).
// ---------------------------------------------------------------------------

interface MeterRowProps {
  meter: Meter;
  calloutText: string | null;
  rowRef: (node: HTMLDivElement | null) => void;
  onPlugIn: (() => void) | null;
}

function MeterRow({meter, calloutText, rowRef, onPlugIn}: MeterRowProps) {
  const green = meterGreen(meter);
  const color = green ? GREEN_METER : 'var(--color-error)';
  const wave = WAVES[meter.id];
  return (
    <div style={styles.meterRow} ref={rowRef}>
      <div style={styles.meterCol}>
        <div style={styles.meterLabelRow}>
          <span style={styles.meterName}>{meter.name}</span>
          <span style={styles.meterCaption}>{meterCaptionLabel(meter)}</span>
          <span style={{...styles.meterValue, color}}>{meterValueLabel(meter)}</span>
        </div>
        <div style={styles.sparkline} aria-hidden>
          {wave.map((sample, i) => (
            <span
              key={i}
              className="alm-color"
              style={{...styles.sparkBar, height: Math.max(4, Math.round(sample * 28)), background: color}}
            />
          ))}
        </div>
      </div>
      {onPlugIn != null ? (
        <button
          type="button"
          className="alm-btn alm-focusable"
          style={styles.sideBtn}
          aria-label="Plug in — battery to 64%"
          onClick={onPlugIn}>
          <span style={{...styles.sideBtnPill, ...styles.sideBtnPillError}}>Plug in</span>
        </button>
      ) : null}
      {calloutText != null ? <BlockerCallout text={calloutText} /> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BLOCKER CALLOUT — absolute pill above its anchor row, 8×8 rotated-square
// tail pointing down at the row; transform/opacity entrance (fades in place
// under reduced motion); removed on next pointerdown anywhere or when the
// target gate is fixed.
// ---------------------------------------------------------------------------

function BlockerCallout({text}: {text: string}) {
  return (
    <div style={styles.calloutPill} className="alm-callout-in" role="presentation">
      {text}
      <span style={styles.calloutTail} aria-hidden />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CHECKLIST GATE ROW — 60px, whole row a real <button>; blocking-met =
// brand-filled circle + white check (#FFFFFF on #0284C7 = 4.6:1; dark flips
// to #082F49 on #38BDF8 ≈ 6.5:1 — BRAND_FILL_TEXT), blocking-unmet = 24px
// ring in the ERROR_BORDER pair + lock glyph. Fix verbs are sibling
// buttons, never nested. Unmet rows paint the aria-hidden lock tether.
// ---------------------------------------------------------------------------

interface CheckRowProps {
  check: BlockingCheck;
  calloutText: string | null;
  rowRef: (node: HTMLDivElement | null) => void;
  onRowTap: () => void;
  onFix: (() => void) | null;
}

function ChecklistGateRow({check, calloutText, rowRef, onRowTap, onFix}: CheckRowProps) {
  return (
    <div style={styles.checkRowWrap} ref={rowRef}>
      {!check.met ? <span style={styles.tether} aria-hidden /> : null}
      <button
        type="button"
        className="alm-btn alm-focusable"
        style={styles.checkRow}
        aria-description={check.met ? 'Met' : 'Not met — blocks going live'}
        onClick={onRowTap}>
        {check.met ? (
          <span style={styles.glyphMet} aria-hidden>
            <Icon icon={CheckIcon} size="sm" color="inherit" />
          </span>
        ) : (
          <span style={styles.glyphUnmet} aria-hidden>
            {/* Spec sketches a 12px lock; the Icon component's smallest
                token is 16px 'sm' — noted deviation, still fits the 20px
                inner circle. */}
            <Icon icon={LockIcon} size="sm" color="inherit" />
          </span>
        )}
        <span style={styles.checkText}>
          <span style={styles.checkPrimary}>{check.label}</span>
          <span style={styles.checkDetail}>{check.met ? check.metDetail : check.detail}</span>
        </span>
      </button>
      {!check.met && check.fixVerb != null && onFix != null ? (
        <button
          type="button"
          className="alm-btn alm-focusable"
          style={styles.sideBtn}
          aria-label={\`\${check.fixVerb} — resolves \${check.label}\`}
          onClick={onFix}>
          <span style={styles.sideBtnPill}>{check.fixVerb}</span>
        </button>
      ) : null}
      {calloutText != null ? <BlockerCallout text={calloutText} /> : null}
    </div>
  );
}

// Optional row — the WHOLE 60px row is the role='switch' button; the 51×31
// visual never stands alone.
interface OptionalRowProps {
  check: OptionalCheck;
  onToggle: () => void;
}

function OptionalGateRow({check, onToggle}: OptionalRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={check.on}
      className="alm-btn alm-focusable"
      style={styles.switchRow}
      onClick={onToggle}>
      <span style={styles.checkText}>
        <span style={styles.checkPrimary}>{check.label}</span>
        <span style={styles.checkDetail}>{check.detail}</span>
      </span>
      <span
        style={{...styles.switchTrack, ...(check.on ? styles.switchTrackOn : null)}}
        className="alm-color"
        aria-hidden>
        <span style={{...styles.switchThumb, ...(check.on ? styles.switchThumbOn : null)}} />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// COUNTDOWN ARM BAR — role='slider' with derived aria-valuetext; travel is
// MEASURED at pointerdown (390: 358 track → 302 travel → 257 ≈ 85%
// threshold; 320: 288 → 232 → 197). Release ≥85% + ready → counting; not
// ready → rubber-band spring (instant under reduced motion) + rejection.
// Enter/Space arms directly when ready, aborts while counting.
// ---------------------------------------------------------------------------

interface ArmBarProps {
  armed: ArmedState;
  countdown: number;
  isReady: boolean;
  blockerCount: number;
  reducedMotion: boolean;
  onArm: () => void;
  onReject: () => void;
  onAbort: () => void;
  onEnd: () => void;
}

function CountdownArmBar({armed, countdown, isReady, blockerCount, reducedMotion, onArm, onReject, onAbort, onEnd}: ArmBarProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragX, setDragX] = useState<number | null>(null);
  const travelRef = useRef(1);
  const startXRef = useRef(0);
  const movedRef = useRef(false);

  if (armed === 'live') {
    return (
      <button type="button" className="alm-btn alm-focusable" style={styles.endBar} onClick={onEnd}>
        End stream
      </button>
    );
  }

  if (armed === 'counting') {
    // The ENTIRE bar is one <button> during countdown — any tap aborts.
    const progress = (5 - countdown) / 5;
    return (
      <div style={styles.armTrack}>
        <span
          style={{
            ...styles.armCountFill,
            transform: \`scaleX(\${progress})\`,
            transition: reducedMotion ? 'none' : 'transform 1s linear',
          }}
          aria-hidden
        />
        <button
          type="button"
          className="alm-btn alm-focusable"
          style={styles.armFullBtn}
          aria-label={\`Going live in \${countdown} — press to cancel\`}
          onClick={onAbort}>
          Going live in {countdown}
        </button>
      </div>
    );
  }

  const onThumbPointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const rect = trackRef.current?.getBoundingClientRect();
    // travel = trackWidth − 48 thumb − 2×4 inset (measured, no literals).
    travelRef.current = Math.max(1, (rect?.width ?? 358) - 48 - 8);
    startXRef.current = event.clientX;
    movedRef.current = false;
    setDragX(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onThumbPointerMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - startXRef.current;
    if (Math.abs(dx) > 8) movedRef.current = true;
    setDragX(Math.max(0, Math.min(travelRef.current, dx)));
  };
  const onThumbPointerUp = () => {
    if (dragX == null) return;
    const settled = dragX;
    setDragX(null); // spring-back happens via the transition on transform
    if (!movedRef.current) return;
    if (isReady && settled >= 0.85 * travelRef.current) onArm();
    else if (!isReady && settled > 12) onReject();
  };

  const valuetext = isReady
    ? 'Slide or press Enter to go live'
    : \`Not ready — \${blockerCount} blocker\${blockerCount === 1 ? '' : 's'}\`;
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (isReady) onArm();
    else onReject();
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      className="alm-focusable"
      aria-label="Go live"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(((dragX ?? 0) / travelRef.current) * 100)}
      aria-valuetext={valuetext}
      style={styles.armTrack}
      onKeyDown={onKeyDown}>
      {isReady ? <span style={styles.armReadyFill} aria-hidden /> : null}
      <span style={{...styles.armLabel, ...(isReady ? null : styles.armLabelMuted)}}>
        {isReady ? 'Slide to go live' : \`Fix \${blockerCount} blocker\${blockerCount === 1 ? '' : 's'} to go live\`}
      </span>
      <span
        style={{
          ...styles.armThumb,
          ...(isReady ? null : styles.armThumbNotReady),
          transform: dragX != null ? \`translateX(\${dragX}px)\` : undefined,
          // Rubber-band spring 300ms; instant snap under reduced motion.
          transition:
            dragX != null || reducedMotion ? 'none' : 'transform 300ms cubic-bezier(0.2, 0.9, 0.3, 1.2)',
        }}
        aria-hidden
        onPointerDown={onThumbPointerDown}
        onPointerMove={onThumbPointerMove}
        onPointerUp={onThumbPointerUp}>
        <Icon icon={ChevronsRightIcon} size="md" color="inherit" />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; pointer drag between detents is garnish, >120px past medium
// closes), 52px header with 44×44 X, focus-trapped dialog. Only one sheet
// mounts at a time; opening blockers from notify is banned (bell disables
// while any sheet is open).
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, footer, children}: SheetProps) {
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
      aria-labelledby={titleId}
      tabIndex={-1}
      className="alm-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="alm-btn alm-focusable"
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
          className="alm-btn alm-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileStreamPreflightTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const {blocking, optional, meters, armed, countdown, elapsed, sheet, sheetDetent, emailAlso, toast, callout} = state;

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const blockerRowRefs = useRef<Record<BlockerId, HTMLDivElement | null>>({b3: null, b4: null, battery: null});
  const setBlockerRowRef = useCallback(
    (id: BlockerId) => (node: HTMLDivElement | null) => {
      blockerRowRefs.current[id] = node;
    },
    [],
  );

  // DERIVED, never stored — the causal chain: any gate write re-derives the
  // ring arc, arm readiness, aux label, cluster caption, and sheet math.
  const blockingMet = blocking.filter(check => check.met).length;
  const greenMeters = METER_ORDER.filter(id => meterGreen(meters[id])).length;
  const metGates = blockingMet + greenMeters; // initial 2 + 2 = 4 of 7
  const blockers: {id: BlockerId; label: string; detail: string}[] = [
    ...blocking
      .filter((check): check is BlockingCheck & {id: 'b3' | 'b4'} => !check.met && (check.id === 'b3' || check.id === 'b4'))
      .map(check => ({id: check.id as BlockerId, label: check.calloutLabel, detail: check.detail})),
    ...METER_ORDER.filter(id => !meterGreen(meters[id])).map(id => ({
      id: id as BlockerId,
      label: meters[id].calloutLabel,
      detail: \`\${meterValueLabel(meters[id])} · \${meterCaptionLabel(meters[id])}\`,
    })),
  ];
  const isReady = blockers.length === 0;
  const notifyOn = optional.find(check => check.id === 'o1')?.on ?? false;
  const recipients = FOLLOWERS.push + (emailAlso ? FOLLOWERS.emailOnly : 0); // 941 or 941+343=1,284

  // Countdown — 1s user-started interval (armed via slide/Enter, so the
  // timer is a consequence of user action, not a page clock).
  useEffect(() => {
    if (armed !== 'counting') return undefined;
    const timer = setInterval(() => dispatch({type: 'tick'}), 1000);
    return () => clearInterval(timer);
  }, [armed]);
  // ON AIR elapsed clock — content, not decoration; keeps ticking under
  // reduced motion.
  useEffect(() => {
    if (armed !== 'live') return undefined;
    const timer = setInterval(() => dispatch({type: 'elapsedTick'}), 1000);
    return () => clearInterval(timer);
  }, [armed]);

  // BlockerCallout is removed on the next pointerdown anywhere.
  useEffect(() => {
    if (callout == null) return undefined;
    const onPointerDown = () => dispatch({type: 'ui', patch: {callout: null}});
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [callout]);

  // Focus into an opening sheet uses preventScroll — plain .focus() would
  // scroll-reveal the animating sheet inside the locked overflow-hidden
  // column and beach it mid-screen (binding rider).
  useEffect(() => {
    if (sheet != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [sheet]);

  const openSheet = (id: 'notify' | 'blockers', opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    dispatch({type: 'ui', patch: {sheet: id, sheetDetent: 'medium', callout: null}});
  };
  const closeSheet = useCallback(() => {
    dispatch({type: 'ui', patch: {sheet: null, sheetDetent: 'medium'}});
    sheetOpenerRef.current?.focus();
  }, []);

  // Escape closes the TOPMOST overlay only (sheets are the only modal
  // layer here; the callout clears on any pointerdown instead).
  useEffect(() => {
    if (sheet == null) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sheet, closeSheet]);

  // REJECTED SLIDE — deterministic: blockers are ordered b3 → b4 →
  // battery, so the initial fixture pins the callout to the copyright
  // scan row (stress fixture 3). scrollIntoView is smooth (not a scrub
  // drag), 'auto' under reduced motion.
  const rejectSlide = () => {
    const first = blockers[0];
    if (first == null) return;
    dispatch({type: 'reject', firstBlocker: first.id, blockerCount: blockers.length, label: first.label});
    blockerRowRefs.current[first.id]?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'center',
    });
  };

  // Fix verbs — one deterministic assignment each; the ring, arm bar, aux
  // label, and cluster caption all move on the same dispatch.
  const runScan = () => dispatch({type: 'check', id: 'b3', patch: {met: true}, toast: 'Scan passed · 0 flags'});
  const assignMod = () =>
    dispatch({type: 'check', id: 'b4', patch: {met: true}, toast: \`Moderator assigned · \${MOD.handle}\`});
  const plugIn = () => dispatch({type: 'meter', id: 'battery', patch: {value: 64}, toast: 'Plugged in — battery 64%'});

  // Blockers-sheet 'Fix' closes the sheet and scrolls the target into
  // view, landing focus on the target row (not the opener).
  const navigateToBlocker = (id: BlockerId) => {
    dispatch({type: 'ui', patch: {sheet: null, sheetDetent: 'medium'}});
    window.setTimeout(() => {
      const row = blockerRowRefs.current[id];
      row?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'center'});
      row?.querySelector('button')?.focus({preventScroll: true});
    }, 0);
  };

  const confirmNotify = () => {
    dispatch({type: 'toast', text: \`Notifying \${fmtNum(recipients)} followers\`});
    closeSheet();
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const auxContent = (() => {
    if (armed === 'counting') {
      return <span style={styles.auxCaption}>Tap the bar to cancel</span>;
    }
    if (armed === 'live') {
      return (
        <span style={styles.auxCaption}>
          {notifyOn ? \`Notified \${fmtNum(recipients)} followers\` : 'Follower notifications are off'}
        </span>
      );
    }
    if (!isReady) {
      return (
        <button
          type="button"
          className="alm-btn alm-focusable"
          style={styles.auxBtn}
          onClick={event => openSheet('blockers', event.currentTarget)}>
          Review blockers ({blockers.length})
        </button>
      );
    }
    // Non-slide path — same countdown as the completed slide.
    return (
      <button
        type="button"
        className="alm-btn alm-focusable"
        style={{...styles.auxBtn, ...styles.auxBtnGoLive}}
        onClick={() => dispatch({type: 'arm'})}>
        Go Live
      </button>
    );
  })();

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{AIRLUME_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={{...styles.navBar, ...(armed === 'live' ? styles.navBarLive : null)}}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="alm-btn alm-focusable"
              style={styles.iconBtn}
              aria-label="Close preflight"
              onClick={() => dispatch({type: 'toast', text: 'Preflight saved — settings keep until you go live'})}>
              <Icon icon={XIcon} size="md" color="inherit" />
            </button>
          </div>
          <div style={styles.navCenter}>
            {armed === 'live' ? (
              <>
                <span style={styles.liveDot} className="alm-pulse" aria-hidden />
                <span style={styles.navTitleLive}>ON AIR · {fmtElapsed(elapsed)}</span>
              </>
            ) : (
              <>
                <ReadinessRing met={metGates} total={7} />
                <span style={styles.navTitle}>Go Live</span>
              </>
            )}
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="alm-btn alm-focusable"
              style={styles.iconBtn}
              aria-label={notifyOn ? 'Notify followers — on' : 'Notify followers — off'}
              disabled={sheet != null}
              onClick={event => openSheet('notify', event.currentTarget)}>
              <Icon icon={BellIcon} size="md" color="inherit" />
              {notifyOn ? <span style={styles.bellDot} aria-hidden /> : null}
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <h1 className="alm-vh">Stream preflight</h1>

          <div style={styles.streamCard}>
            <StreamCover streamId={STREAM.id} />
            <div style={styles.streamBody}>
              <p style={styles.streamTitle}>{STREAM.title}</p>
              <div style={styles.chipRow}>
                <span style={styles.chip}>{STREAM.category}</span>
                <span style={styles.chip}>{STREAM.subcategory}</span>
              </div>
            </div>
          </div>

          <h2 style={styles.sectionHeader}>Signal</h2>
          <div style={styles.listCard}>
            <div style={styles.clusterHeader}>
              <span style={styles.clusterTitle}>Signals</span>
              <span style={styles.clusterCaption}>{greenMeters} of 3 green</span>
            </div>
            {METER_ORDER.map(id => {
              const meter = meters[id];
              const isBatteryRed = id === 'battery' && !meterGreen(meter);
              return (
                <div key={id}>
                  <div style={styles.rowDivider} />
                  <MeterRow
                    meter={meter}
                    calloutText={callout === id ? meter.calloutLabel : null}
                    rowRef={id === 'battery' ? setBlockerRowRef('battery') : () => undefined}
                    onPlugIn={isBatteryRed ? plugIn : null}
                  />
                </div>
              );
            })}
          </div>

          <h2 style={styles.sectionHeader}>Required to go live</h2>
          <div style={styles.listCard}>
            {blocking.map((check, index) => (
              <div key={check.id}>
                {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                <ChecklistGateRow
                  check={check}
                  calloutText={callout === check.id ? check.calloutLabel : null}
                  rowRef={check.id === 'b3' || check.id === 'b4' ? setBlockerRowRef(check.id) : () => undefined}
                  onRowTap={() =>
                    dispatch({
                      type: 'toast',
                      text: \`\${check.label}: \${check.met ? check.metDetail : check.detail}\`,
                    })
                  }
                  onFix={check.id === 'b3' ? runScan : check.id === 'b4' ? assignMod : null}
                />
              </div>
            ))}
          </div>

          <h2 style={styles.sectionHeader}>Optional</h2>
          <div style={styles.listCard}>
            {optional.map((check, index) => (
              <div key={check.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <OptionalGateRow check={check} onToggle={() => dispatch({type: 'toggleOptional', id: check.id})} />
              </div>
            ))}
          </div>

          <div style={{height: 24}} aria-hidden />

          {/* The single polite live region — sticky-in-flow above the
              footer; shell-absolute ONLY while the sheet scroll-lock is
              active (binding rider). NO auto-dismiss timers: the toast
              persists until Undo, replacement, or a state change. */}
          <div style={sheet != null ? styles.toastDockLocked : styles.toastDock} aria-live="polite">
            {toast != null ? (
              <div key={toast.seq} style={styles.toast} className="alm-fade">
                <span style={styles.toastMsg}>{toast.text}</span>
                {toast.undo != null ? (
                  <>
                    <span style={styles.toastRule} aria-hidden />
                    <button
                      type="button"
                      className="alm-btn alm-focusable"
                      style={styles.undoBtn}
                      onClick={() => dispatch({type: 'undo'})}>
                      Undo
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </main>

        <footer style={styles.stickyFooter}>
          <div style={styles.auxRow}>{auxContent}</div>
          <CountdownArmBar
            armed={armed}
            countdown={countdown}
            isReady={isReady}
            blockerCount={blockers.length}
            reducedMotion={reducedMotion}
            onArm={() => dispatch({type: 'arm'})}
            onReject={rejectSlide}
            onAbort={() => dispatch({type: 'abort'})}
            onEnd={() => dispatch({type: 'end'})}
          />
        </footer>

        {sheet != null ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {sheet === 'notify' ? (
          <Sheet
            titleId="alm-notify-title"
            title="Notify followers"
            detent={sheetDetent}
            onDetentChange={detent => dispatch({type: 'ui', patch: {sheetDetent: detent}})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <>
                <button
                  type="button"
                  className="alm-btn alm-focusable"
                  style={{...styles.confirmBtn, ...(notifyOn ? null : styles.confirmBtnDisabled)}}
                  disabled={!notifyOn}
                  aria-disabled={!notifyOn}
                  onClick={confirmNotify}>
                  Notify {fmtNum(recipients)} followers
                </button>
                {!notifyOn ? (
                  <div style={styles.confirmCaption}>Follower notifications are off</div>
                ) : null}
              </>
            }>
            {/* Recipient math derives from the same store as everything
                else: 941 push + (emailAlso ? 343 : 0) → 941 or 1,284. */}
            <div style={styles.sheetSectionLabel}>{CREATOR.handle} · {fmtNum(FOLLOWERS.total)} followers</div>
            <div style={styles.sheetCard}>
              <div style={styles.utilRow}>
                <span style={styles.utilLabel}>Push</span>
                <span style={styles.utilValue}>{fmtNum(FOLLOWERS.push)}</span>
              </div>
              <div style={styles.rowDivider} />
              <div style={styles.utilRow}>
                <span style={styles.utilLabel}>Email</span>
                <span style={styles.utilValue}>{fmtNum(FOLLOWERS.emailOnly)}</span>
              </div>
              <div style={styles.rowDivider} />
              <button
                type="button"
                role="switch"
                aria-checked={emailAlso}
                className="alm-btn alm-focusable"
                style={styles.switchRow}
                onClick={() => dispatch({type: 'ui', patch: {emailAlso: !emailAlso}})}>
                <span style={styles.checkText}>
                  <span style={styles.checkPrimary}>Also send email</span>
                  <span style={styles.checkDetail}>Reaches the {fmtNum(FOLLOWERS.emailOnly)} email-only followers</span>
                </span>
                <span
                  style={{...styles.switchTrack, ...(emailAlso ? styles.switchTrackOn : null)}}
                  className="alm-color"
                  aria-hidden>
                  <span style={{...styles.switchThumb, ...(emailAlso ? styles.switchThumbOn : null)}} />
                </span>
              </button>
            </div>
          </Sheet>
        ) : null}
        {sheet === 'blockers' ? (
          <Sheet
            titleId="alm-blockers-title"
            title={\`Blockers (\${blockers.length})\`}
            detent={sheetDetent}
            onDetentChange={detent => dispatch({type: 'ui', patch: {sheetDetent: detent}})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button type="button" className="alm-btn alm-focusable" style={styles.confirmBtn} onClick={closeSheet}>
                Done
              </button>
            }>
            <div style={styles.sheetSectionLabel}>Fix these to arm the slider</div>
            <div style={styles.sheetCard}>
              {blockers.map((blocker, index) => (
                <div key={blocker.id}>
                  {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                  <div style={styles.checkRowWrap}>
                    <div style={{...styles.checkRow, cursor: 'default'}}>
                      <span style={styles.glyphUnmet} aria-hidden>
                        <Icon icon={LockIcon} size="sm" color="inherit" />
                      </span>
                      <span style={styles.checkText}>
                        <span style={styles.checkPrimary}>{blocker.label}</span>
                        <span style={styles.checkDetail}>{blocker.detail}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="alm-btn alm-focusable"
                      style={styles.sideBtn}
                      aria-label={\`Fix: \${blocker.label}\`}
                      onClick={() => navigateToBlocker(blocker.id)}>
                      <span style={styles.sideBtnPill}>Fix</span>
                    </button>
                  </div>
                </div>
              ))}
              {blockers.length === 0 ? (
                <div style={styles.utilRow}>
                  <span style={styles.utilLabel}>All clear — slide to go live</span>
                </div>
              ) : null}
            </div>
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};