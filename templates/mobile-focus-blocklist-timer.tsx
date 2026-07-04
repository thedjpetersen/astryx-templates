// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Bulwark focus-session surface:
 *   8 distraction apps with daily averages summing to exactly 90 min
 *   (Chirpr 12 + ReelRoll 18 + SnapDeck 9 + LootBoxer 14 + Newsfeedr 7 +
 *   PingPal 5 + Streamly 21 + MailPile 4 = 90 ✓), default exemptions
 *   PingPal + Streamly (Gentle 6+2=8 ✓, Firm 7+1=8 ✓ — Streamly avg 21 ≥
 *   10 loses exemption, Locked 8+0=8 ✓); three strictness tiers keyed to
 *   duration (Gentle <50m 'take a breath' / Firm 50–85m 'i am choosing
 *   distraction' / Locked ≥90m 'break my commitment'); four scripted
 *   breaches (ReelRoll 8m +18, Chirpr 19m +12, Streamly 27m +21, ReelRoll
 *   41m +18 → 69 min saved ✓, inter-breach gaps 8/11/8/14/9 → longest calm
 *   stretch 14 ✓); pre-session streak stats 6-day streak · 290 week-min
 *   (25+50+50+25+90+50 ✓) · 19 survived (3+4+2+5+1+4 ✓) → 7/340/23 after a
 *   completed 50m session; a last-session recap fixture (yesterday, 90m
 *   Locked, LootBoxer at 62m +14, longest stretch 62m). No Date.now(), no
 *   Math.random(), no timers — the deterministic clock is the footer's
 *   'Skip 5m' scrub button (10 presses complete the 50m default ✓).
 * @output Bulwark — Focus Blocklist Timer: a 390px MOBILE app-blocking
 *   focus timer. NavBar (portcullis-over-hourglass mark · 'Bulwark' →
 *   '08:00 / 50:00' clock when armed · History / 'End early'), a 344px
 *   sticky timerStage holding the 240px CommitmentDial (270° rotary,
 *   10–120 min in 5m snaps, ratcheting tier detents at 25/50/90) that
 *   becomes the BreachLedger ring when armed (elapsed sweep 0→360°, 4×16
 *   error ticks at breach angles, each a 44×44 button), a COMMITMENT tier
 *   contract card, the BLOCKLIST BlocklistArmingTray split by a 48px
 *   shieldEdge band into contained/exempt zones, a PROOF streak stats
 *   card, a sticky-in-flow toastDock, and a sticky Arm footer. A
 *   two-detent sheet handles typed-phrase early-exit confirmation and the
 *   session recap (96px ring thumbnail, breach rows at the large detent).
 * @position Page template; emitted by `astryx template
 *   mobile-focus-blocklist-timer`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, toast-in-lock)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close. No tabBar, no FAB — an immersive stack of
 *   navBar, sticky timerStage, scrolling blocklist, sticky Arm footer.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68); no desktop Layout
 *   frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Bulwark indigo #4F46E5). Per the batch-2 amendment,
 *   hairline/muted tokens serve passive separators ONLY: the dial/ring
 *   rest track, the switch OFF track, and the shieldEdge band each get an
 *   explicit light-dark() pair at ≥3:1 against their ACTUAL surface, with
 *   the contrast math at each declaration. Breach ticks deviate from the
 *   spec's --color-error token to an explicit pair so they hold ≥3:1
 *   against the ring track itself (math below).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps. navBar 52px sticky
 *   top:0 z20 (paddingInline 8, grid '1fr auto 1fr'). timerStage sticky
 *   top:52 z15, height EXACTLY 344px in BOTH idle and armed states (zero
 *   shift): 16 top pad + 260 dial block (240px ring inside) + 8 gap + 44
 *   controls/caption row + 16 bottom pad = 344. Ring 240px ⌀, 12px
 *   stroke; knob 28px in a 44×44 hit; breach ticks 4×16 in 44×44 hits.
 *   Stepper 96×32; preset chips 52×32 in 44px hits → idle controls row =
 *   96 + 8 + 3×52 + 2×8 = 276px ≤ 288px content width at 320. Rows: 72px
 *   app rows (40px glyph tile, two-line stack, trailing 51×31 switch in a
 *   full-row hit), 60px recap breach rows, 44px zone-header rows.
 *   shieldEdge 48px. tierContract ~110px. Streak card 88px, 3 cells.
 *   Sticky footer 80px = 16 + 48 Arm button + 16, blur + top hairline.
 *   toastDock sticky in flow above the footer (bottom:96 = 80 footer +
 *   16); absolute insetInline:16 bottom:96 ONLY while the sheet scroll-
 *   lock is active. TYPE (Figtree via --font-family-body): 44/700 tabular
 *   ring numeral · 22/700 recap + stat numbers · 17/600 nav title
 *   (tabular when it becomes the clock) · 16/400–500 row primary ·
 *   13/400 secondary · 13/600 uppercase sectionHeader (0.06em) · 11/500
 *   overlines; nothing below 11px.
 *
 * Responsive contract:
 * - Fluid 320–430px, no width literals: ring stays 240 centered; idle
 *   controls row 276 ≤ 288 at 320; stat cells 1fr each; app names
 *   one-line ellipsis before the switch hit (8px clearance kept); nav
 *   clock '08:00 / 50:00' ≈ 110px, never near the 200px title cap. At
 *   430 the stage content is fluid (cards stretch, ring centered).
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, NOT viewport) — at ≥720px the shell
 *   renders as a centered 430px phone column with hairline borderInline.
 *   Sticky navBar/timerStage/footer stay in-flow sticky against the page
 *   scroller; the ONLY inner vertical scroller is the open sheet's
 *   content pane.
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
  AlertCircleIcon,
  HistoryIcon,
  LockIcon,
  MinusIcon,
  PlusIcon,
  ShieldIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair, with
// contrast math against its ACTUAL surface (batch-2 amendment).
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Bulwark indigo). #4F46E5 on #FFFFFF ≈
// 6.3:1; #A5B4FC on the dark card (~#1C1C1E) ≈ 8.0:1 — both clear 4.5:1.
const BRAND_ACCENT = 'light-dark(#4F46E5, #A5B4FC)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #4F46E5 ≈ 6.3:1.
// Dark: white on #A5B4FC fails (~1.9:1), so the dark side flips to a
// near-black indigo — #1E1B4B on #A5B4FC ≈ 8.1:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #1E1B4B)';
// 12% brand wash for the tier badge chip / brand mark tile.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// REST FILL — the dial's unfilled 270° track, the armed ring's remaining-
// time track, and the switch OFF track are meaningful rest-state fills of
// INTERACTIVE controls, so hairline/muted tokens are banned here
// (amendment). #8A92A0 vs #FFFFFF ≈ 3.2:1; #6C7183 vs the dark card
// (~#1C1C1E) ≈ 3.6:1 — both ≥3:1 against their actual surfaces.
const REST_FILL = 'light-dark(#8A92A0, #6C7183)';
// Breach ticks sit ON the ring track, so they must clear 3:1 against
// REST_FILL itself, not the page. Light: #7F1D1D (L≈0.054) vs #8A92A0
// (L≈0.278) ≈ 3.15:1 (and ≈10:1 vs white). Dark: #FECACA (L≈0.67) vs
// #6C7183 (L≈0.168) ≈ 3.3:1. Deviation from the spec's --color-error
// token: the token pair cannot guarantee 3:1 against the mid-gray track.
const ERROR_TICK = 'light-dark(#7F1D1D, #FECACA)';
// 11px overlines (stats card, tick captions) — explicit pair per house
// rule: #5A6072 on white ≈ 6.3:1; #A6ADC0 on the dark card ≈ 7.7:1.
const OVERLINE_TEXT = 'light-dark(#5A6072, #A6ADC0)';
// shieldEdge band — a meaningful zone divider, so it gets an explicit
// ≥3:1 pair vs the card surface (amendment). Gradient stops each pass:
// light #4338CA ≈ 7.9:1 and #4F46E5 ≈ 6.3:1 vs the white card; dark
// #5F5FD9 ≈ 3.4:1 and #5B5BD6 ≈ 3.2:1 vs #1C1C1E. White 13px/600 band
// text: 7.9 / 6.3 (light stops) and 5.1 / 5.4 (dark stops) — all ≥4.5:1.
const SHIELD_STOP_A = 'light-dark(#4338CA, #5F5FD9)';
const SHIELD_STOP_B = 'light-dark(#4F46E5, #5B5BD6)';
const SHIELD_TEXT = '#FFFFFF';
// Switch thumb per the foundations (white in both schemes, shadowed).
const SWITCH_THUMB = '#FFFFFF';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// App glyph tiles — fixed 4-color light-dark palette keyed by index % 4
// (no real icons; 17/700 initial on each tile: 7.0 / 6.4 / 7.4 / 6.9 in
// light, 8.6 / 8.0 / 9.9 / 9.4 in dark — all clear 4.5:1).
const GLYPH_BG = [
  'light-dark(#E0E7FF, #312E81)',
  'light-dark(#FCE7F3, #831843)',
  'light-dark(#D1FAE5, #064E3B)',
  'light-dark(#FEF3C7, #78350F)',
];
const GLYPH_TEXT = [
  'light-dark(#3730A3, #C7D2FE)',
  'light-dark(#9D174D, #FBCFE8)',
  'light-dark(#065F46, #A7F3D0)',
  'light-dark(#92400E, #FDE68A)',
];

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden h1,
// ratchet pulse (transform-only), sheet slide-in, reduced-motion guard.
// ---------------------------------------------------------------------------

const BULWARK_CSS = `
.bfx-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.bfx-btn:disabled { cursor: default; }
.bfx-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.bfx-anim { transition: transform 240ms ease, opacity 240ms ease; }
.bfx-fade { transition: opacity 240ms ease; }
@keyframes bfx-ratchet {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
.bfx-ratchet { animation: bfx-ratchet 240ms ease; }
@keyframes bfx-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.bfx-sheet-in { animation: bfx-sheet-in 240ms ease; }
.bfx-vh {
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
  .bfx-anim, .bfx-fade { transition: none; }
  .bfx-ratchet, .bfx-sheet-in { animation: none; }
}
`;

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
  // NAV BAR — 52px sticky top z20; hairline + blur ALWAYS ON (chosen; this
  // template does not wire scroll-under state).
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    flexShrink: 0,
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
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
  },
  navTitle: {fontSize: 17, fontWeight: 600, maxWidth: 200, whiteSpace: 'nowrap'},
  navClock: {
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    maxWidth: 200,
    whiteSpace: 'nowrap',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  endEarlyBtn: {
    height: 44,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 400,
    color: 'var(--color-error)',
    whiteSpace: 'nowrap',
  },
  // TIMER STAGE — sticky top:52 z15, height EXACTLY 344 in both states:
  // 16 pad + 260 dial block + 8 gap + 44 controls row + 16 pad = 344.
  timerStage: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    height: 344,
    flexShrink: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingInline: 16,
    background: 'var(--color-background-body)',
    borderBottom: '1px solid var(--color-border)',
  },
  dialBlock: {
    position: 'relative',
    width: 240,
    height: 260,
    marginBottom: 8,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  dialSvgWrap: {position: 'relative', width: 240, height: 240},
  dialCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  dialCenterStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    textAlign: 'center',
    pointerEvents: 'auto',
  },
  // 44/700 tabular ring-center numeral.
  dialNumeral: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    borderRadius: 8,
  },
  tierBadge: {
    display: 'inline-block',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: BRAND_ACCENT,
    background: BRAND_TINT_12,
    borderRadius: 999,
    padding: '3px 10px',
  },
  armedCaption: {fontSize: 13, color: 'var(--color-text-secondary)'},
  // 28px knob in a 44×44 hit.
  knobHit: {
    position: 'absolute',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    touchAction: 'none',
  },
  knob: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--color-background-card)',
    border: `3px solid ${BRAND_ACCENT}`,
    boxShadow: '0 2px 8px var(--color-shadow)',
    boxSizing: 'border-box',
  },
  // 44×44 invisible breach-tick buttons.
  tickHit: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: '50%',
  },
  // Controls row — 44px; idle stepper+chips 276px wide, armed caption.
  controlsRow: {
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    maxWidth: '100%',
  },
  stepperWrap: {position: 'relative', width: 96, height: 44, flexShrink: 0},
  stepperTrack: {
    position: 'absolute',
    insetInline: 0,
    top: 6,
    height: 32,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    pointerEvents: 'none',
  },
  stepperDivider: {
    position: 'absolute',
    left: '50%',
    top: 12,
    width: 1,
    height: 20,
    background: 'var(--color-border)',
    pointerEvents: 'none',
  },
  stepperHalf: {
    position: 'absolute',
    top: 0,
    width: 48,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    color: 'var(--color-text-primary)',
  },
  presetChipHit: {
    width: 52,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    flexShrink: 0,
  },
  presetChip: {
    width: 52,
    height: 32,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  presetChipOn: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom. First section gets 24px top (section gap).
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
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // COMMITMENT tier contract card (~110px: 16 pad + 17/600 + two 13 lines).
  tierCard: {padding: 16, display: 'flex', flexDirection: 'column', gap: 6},
  tierCardName: {fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8},
  tierCardLine: {fontSize: 13, lineHeight: '18px', color: 'var(--color-text-secondary)'},
  // BLOCKLIST tray.
  zoneHeaderRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 72px app row — the WHOLE row is the switch button (role='switch').
  appRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  glyphTile: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    fontSize: 17,
    fontWeight: 700,
  },
  appText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  appName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  appNameText: {minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'},
  appMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  forcedLock: {display: 'inline-flex', color: 'var(--color-text-secondary)', flexShrink: 0},
  // 51×31 switch visual — the hit is the whole 72px row. OFF track uses
  // REST_FILL (≥3:1 vs card, math at the declaration), never a muted token.
  switchTrack: {
    position: 'relative',
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    background: REST_FILL,
  },
  switchTrackOn: {background: BRAND_ACCENT},
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 27,
    height: 27,
    borderRadius: '50%',
    background: SWITCH_THUMB,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
  switchThumbOn: {transform: 'translateX(20px)'},
  armedLockGlyph: {
    width: 51,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // shieldEdge — 48px band; gradient stops + white text math at the
  // SHIELD_STOP declarations.
  shieldEdge: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    background: `linear-gradient(90deg, ${SHIELD_STOP_A}, ${SHIELD_STOP_B})`,
    color: SHIELD_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  exemptEmptyCaption: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  trayFooterCaption: {
    minHeight: 40,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // PROOF — 88px stats card, 3 equal cells.
  statsCard: {
    marginInline: 16,
    height: 88,
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  statCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    paddingInline: 4,
  },
  statNum: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1},
  statOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: OVERLINE_TEXT,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  terminalCaption: {
    margin: '16px 16px 24px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // toastDock — sticky in flow above the 80px footer (bottom 96 = 80+16);
  // switches to shell-absolute ONLY while the sheet scroll-lock is active.
  toastDockSticky: {
    position: 'sticky',
    bottom: 96,
    zIndex: 30,
    paddingInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 96,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    minHeight: 48,
    maxWidth: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  // Sticky footer — 80px = 16 + 48 + 16, blur surface + top hairline.
  footer: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    padding: 16,
    display: 'flex',
    justifyContent: 'center',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  armBtn: {
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
  // Armed footer: 36px secondary demo-scrub button inside the same 80px
  // footer (centered — footer height stays 80 via 6px block margins).
  skipBtn: {
    height: 36,
    marginBlock: 6,
    paddingInline: 24,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
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
  sheetTitle: {fontSize: 17, fontWeight: 600, textAlign: 'center', margin: 0},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  // Early-exit phrase confirmation.
  phraseQuote: {
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    padding: '12px 8px 16px',
  },
  formLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: 8,
  },
  formInput: {
    width: '100%',
    height: 48,
    boxSizing: 'border-box',
    background: 'var(--color-background-muted)',
    border: 'none',
    borderRadius: 12,
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`,
  },
  formInputError: {boxShadow: 'inset 0 0 0 2px var(--color-error)'},
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    fontSize: 13,
    color: 'var(--color-error)',
  },
  confirmEndBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: 'var(--color-error)',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  keepBtn: {
    width: '100%',
    height: 44,
    marginTop: 4,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // Recap sheet.
  recapTop: {display: 'flex', alignItems: 'center', gap: 16, padding: '8px 4px 16px'},
  recapThumbWrap: {position: 'relative', width: 96, height: 96, flexShrink: 0},
  recapNumbers: {display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0},
  recapNum: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2},
  recapLine: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  recapCard: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  breachRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  breachRowText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  breachRowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  breachRowMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  breachRowSaved: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  recapHint: {
    marginTop: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  recapFooterLine: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: 500,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — IDENTITY CONSTS, dual fields, cross-checking aggregates. All
// strings fixed; no Date.now(), no Math.random(), no timers.
// ---------------------------------------------------------------------------

interface DistractionApp {
  id: string;
  name: string;
  avgMin: number; // daily average, minutes
  avgLabel: string;
}

// 8 apps; avgMin sum = 12+18+9+14+7+5+21+4 = 90 ✓ — the tray footer's
// '90 min combined daily average' derives live from these rows.
// STRESS FIXTURE (1): flip SNAPDECK_STRESS to true to rename SnapDeck to
// 'Infinite Scrolldeck Pro Max' and verify the one-line ellipsis truncates
// before the switch hit with 8px clearance kept.
const SNAPDECK_STRESS = false;
const APPS: DistractionApp[] = [
  {id: 'chirpr', name: 'Chirpr', avgMin: 12, avgLabel: '12 min avg open'},
  {id: 'reelroll', name: 'ReelRoll', avgMin: 18, avgLabel: '18 min avg open'},
  {
    id: 'snapdeck',
    name: SNAPDECK_STRESS ? 'Infinite Scrolldeck Pro Max' : 'SnapDeck',
    avgMin: 9,
    avgLabel: '9 min avg open',
  },
  {id: 'lootboxer', name: 'LootBoxer', avgMin: 14, avgLabel: '14 min avg open'},
  {id: 'newsfeedr', name: 'Newsfeedr', avgMin: 7, avgLabel: '7 min avg open'},
  {id: 'pingpal', name: 'PingPal', avgMin: 5, avgLabel: '5 min avg open'},
  {id: 'streamly', name: 'Streamly', avgMin: 21, avgLabel: '21 min avg open'},
  {id: 'mailpile', name: 'MailPile', avgMin: 4, avgLabel: '4 min avg open'},
];
const APP_BY_ID: Record<string, DistractionApp> = Object.fromEntries(
  APPS.map(app => [app.id, app]),
);
// Sum cross-check: 12+18+9+14+7+5+21+4 = 90 ✓.
const COMBINED_AVG_MIN = APPS.reduce((sum, app) => sum + app.avgMin, 0);

// Default exemptions — Gentle counts 6 contained + 2 exempt = 8 ✓; Firm
// force-contains Streamly (avg 21 ≥ 10) → 7+1 = 8 ✓; Locked → 8+0 = 8 ✓.
const DEFAULT_EXEMPT_IDS = ['pingpal', 'streamly'];

type TierId = 'gentle' | 'firm' | 'locked';

interface Tier {
  id: TierId;
  name: string;
  badge: string;
  phrase: string;
  line1: string;
  line2: string;
}

const TIERS: Record<TierId, Tier> = {
  gentle: {
    id: 'gentle',
    name: 'Gentle',
    badge: 'GENTLE',
    phrase: 'take a breath',
    line1: 'All exemptions honored — PingPal and Streamly stay reachable.',
    line2: 'Early exit asks you to type “take a breath”. A pause, not a wall.',
  },
  firm: {
    id: 'firm',
    name: 'Firm',
    badge: 'FIRM',
    phrase: 'i am choosing distraction',
    line1: 'Apps averaging 10+ min lose their exemption — Streamly is forced in.',
    line2: 'Early exit requires typing “i am choosing distraction” in full.',
  },
  locked: {
    id: 'locked',
    name: 'Locked',
    badge: 'LOCKED',
    phrase: 'break my commitment',
    line1: 'Every app contained. No exemptions, no exceptions, no edits.',
    line2: 'Early exit requires typing “break my commitment” in full.',
  },
};

// Duration → tier: Gentle <50m · Firm 50–85m · Locked ≥90m.
function tierFor(duration: number): Tier {
  if (duration >= 90) return TIERS.locked;
  if (duration >= 50) return TIERS.firm;
  return TIERS.gentle;
}

interface ScriptedBreach {
  id: string;
  appId: string;
  minute: number;
  savedMin: number; // = the app's avgMin
}

// Scripted breach attempts for the armed session. Saved total 18+12+21+18
// = 69 ✓; inter-breach gaps at 50m are 8/11/8/14/9 → longest calm stretch
// 14 ✓ (recap line). Tick angles at 50m: 8→57.6° · 19→136.8° · 27→194.4°
// · 41→295.2° (minute/50×360; 41/50×360 = 295.2 ✓ — stress fixture 4).
const SCRIPTED_BREACHES: ScriptedBreach[] = [
  {id: 'br_08', appId: 'reelroll', minute: 8, savedMin: 18},
  {id: 'br_19', appId: 'chirpr', minute: 19, savedMin: 12},
  {id: 'br_27', appId: 'streamly', minute: 27, savedMin: 21},
  {id: 'br_41', appId: 'reelroll', minute: 41, savedMin: 18},
];

// Pre-session PROOF stats. Week minutes 25+50+50+25+90+50 = 290 ✓;
// breaches survived 3+4+2+5+1+4 = 19 ✓. A COMPLETED session writes
// streak 7 · 290+50 = 340 ✓ · 19+4 = 23 ✓; early exit holds all three
// except the recap notes 'Streak held at 6' (stress fixture 3).
const INITIAL_STATS = {streak: 6, weekMin: 290, survived: 19};

// LAST-SESSION recap fixture (idle HistoryIcon): yesterday, 90m Locked,
// one breach (LootBoxer at 62m, +14 saved), longest calm stretch 62m.
const LAST_SESSION = {
  dateLabel: 'Yesterday · Jul 3',
  durationMin: 90,
  tierName: 'Locked',
  savedMin: 14,
  longestCalm: 62,
  breaches: [{id: 'lb_62', appId: 'lootboxer', minute: 62, savedMin: 14}] as ScriptedBreach[],
};

const TERMINAL_CAPTION = 'Sessions since June 28';
const DEFAULT_DURATION = 50; // Firm ✓ — completing takes exactly 10 Skip-5m presses ✓
const DURATION_MIN = 10;
const DURATION_MAX = 120;
const DURATION_STEP = 5;
const TIER_THRESHOLDS = [25, 50, 90]; // dial detents / PageUp-PageDown stops

// ---------------------------------------------------------------------------
// FORMATTERS + GEOMETRY — pure, deterministic. Idle dial: 270° track from
// −135° to +135° (the spec's 135°→405° in 12-o'clock-zero terms), mapping
// 10–120 min in 5m snaps → 270/110 ≈ 2.4545°/min-of-range. Armed ring:
// full 360°, 0° at 12 o'clock, clockwise.
// ---------------------------------------------------------------------------

/** Whole minutes → 'MM:00' scrub-clock label ('08:00', '42:00'). */
function fmtClock(min: number): string {
  return `${String(min).padStart(2, '0')}:00`;
}

const DIAL_SIZE = 240;
const DIAL_C = 120;
const DIAL_R = 108; // 12px stroke spans r 102–114 inside the 240 box
const IDLE_START = -135;
const IDLE_END = 135;
const IDLE_SWEEP = IDLE_END - IDLE_START; // 270
const DEG_PER_VALUE = IDLE_SWEEP / (DURATION_MAX - DURATION_MIN); // 270/110

function idleDegFor(value: number): number {
  return IDLE_START + (value - DURATION_MIN) * DEG_PER_VALUE;
}

function polar(deg: number, radius: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: DIAL_C + radius * Math.sin(rad), y: DIAL_C - radius * Math.cos(rad)};
}

/** SVG arc path from fromDeg to toDeg (clockwise; both 12-o'clock-zero). */
function arcPath(fromDeg: number, toDeg: number, radius: number): string {
  const from = polar(fromDeg, radius);
  const to = polar(toDeg, radius);
  const largeArcFlag = toDeg - fromDeg > 180 ? 1 : 0;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

/** Pointer position → snapped duration (atan2, 12-o'clock-zero degrees). */
function valueForPointer(dx: number, dy: number): number {
  let deg = (Math.atan2(dx, -dy) * 180) / Math.PI; // −180..180, 0 at top
  deg = Math.max(IDLE_START, Math.min(IDLE_END, deg));
  const raw = DURATION_MIN + (deg - IDLE_START) / DEG_PER_VALUE;
  const snapped = Math.round(raw / DURATION_STEP) * DURATION_STEP;
  return Math.max(DURATION_MIN, Math.min(DURATION_MAX, snapped));
}

/** Longest calm stretch: max gap in [0, ...materialized minutes, elapsed]. */
function longestCalmStretch(minutes: number[], elapsed: number): number {
  const points = [0, ...minutes, elapsed];
  let longest = 0;
  for (let i = 1; i < points.length; i++) {
    longest = Math.max(longest, points[i] - points[i - 1]);
  }
  return longest;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — sessionMachine via useReducer. Every mutation flows
// through dispatch(action); children own only transient pointer deltas.
// The spec's 'confirmExit' phase is represented as phase:'armed' with
// sheet.mode:'confirm' (Escape returns to armed with elapsed intact —
// stress fixture 8's per-state persistence law; only the phrase draft
// clears on close, by design).
// ---------------------------------------------------------------------------

type SheetMode = 'confirm' | 'recap' | 'history';

interface SessionState {
  phase: 'idle' | 'armed' | 'recap';
  duration: number;
  elapsed: number;
  exemptIds: string[]; // user-chosen exemptions (tier rules derive on top)
  selectedBreachId: string | null;
  sheet: {open: boolean; detent: 'medium' | 'large'; mode: SheetMode};
  phraseInput: string;
  phraseError: string | null;
  endedEarly: boolean;
  ratchetSeq: number; // increments when the dial crosses 50 or 90
  stats: {streak: number; weekMin: number; survived: number};
  toast: {seq: number; text: string} | null;
}

type SessionAction =
  | {type: 'SET_DURATION'; value: number}
  | {type: 'STEP_DURATION'; delta: number}
  | {type: 'PRESET'; value: number}
  | {type: 'TOGGLE_EXEMPT'; id: string}
  | {type: 'ARM'}
  | {type: 'SKIP_5M'}
  | {type: 'SELECT_BREACH'; id: string | null}
  | {type: 'REQUEST_END_EARLY'}
  | {type: 'OPEN_HISTORY'}
  | {type: 'SET_PHRASE'; value: string}
  | {type: 'PHRASE_BLUR'}
  | {type: 'CONFIRM_END'}
  | {type: 'SET_DETENT'; detent: 'medium' | 'large'}
  | {type: 'CLOSE_SHEET'};

const INITIAL_SESSION: SessionState = {
  phase: 'idle',
  duration: DEFAULT_DURATION,
  elapsed: 0,
  exemptIds: DEFAULT_EXEMPT_IDS,
  selectedBreachId: null,
  sheet: {open: false, detent: 'medium', mode: 'history'},
  phraseInput: '',
  phraseError: null,
  endedEarly: false,
  ratchetSeq: 0,
  stats: INITIAL_STATS,
  toast: null,
};

let toastSeq = 0;
function toast(text: string): {seq: number; text: string} {
  toastSeq += 1;
  return {seq: toastSeq, text};
}

/** Effective containment per tier: Locked contains all; Firm force-
 * contains any exempt app with avg ≥ 10; Gentle honors all exemptions. */
function isContained(app: DistractionApp, tier: Tier, exemptIds: string[]): boolean {
  if (tier.id === 'locked') return true;
  if (!exemptIds.includes(app.id)) return true;
  if (tier.id === 'firm' && app.avgMin >= 10) return true;
  return false;
}

/** True when the app sits in exemptIds but the tier forces it contained. */
function isForced(app: DistractionApp, tier: Tier, exemptIds: string[]): boolean {
  return exemptIds.includes(app.id) && isContained(app, tier, exemptIds);
}

function materializedBreaches(elapsed: number): ScriptedBreach[] {
  return SCRIPTED_BREACHES.filter(breach => breach.minute <= elapsed);
}

function withDuration(state: SessionState, value: number): SessionState {
  const clamped = Math.max(DURATION_MIN, Math.min(DURATION_MAX, value));
  if (clamped === state.duration) return state;
  const crossed = tierFor(clamped).id !== tierFor(state.duration).id;
  return {
    ...state,
    duration: clamped,
    ratchetSeq: crossed ? state.ratchetSeq + 1 : state.ratchetSeq,
  };
}

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_DURATION':
      return state.phase === 'idle' ? withDuration(state, action.value) : state;
    case 'STEP_DURATION':
      return state.phase === 'idle' ? withDuration(state, state.duration + action.delta) : state;
    case 'PRESET':
      return state.phase === 'idle' ? withDuration(state, action.value) : state;
    case 'TOGGLE_EXEMPT': {
      if (state.phase !== 'idle') return state;
      const app = APP_BY_ID[action.id];
      const tier = tierFor(state.duration);
      // Tier rules gate the toggle: Locked disables all; Firm disables
      // avg ≥ 10 apps (they are force-contained regardless).
      if (tier.id === 'locked') return state;
      if (tier.id === 'firm' && app.avgMin >= 10) return state;
      const nowExempt = !state.exemptIds.includes(action.id);
      const exemptIds = nowExempt
        ? [...state.exemptIds, action.id]
        : state.exemptIds.filter(id => id !== action.id);
      // Undo-over-confirm: the toggle executes immediately with a toast;
      // tapping again is its own undo.
      return {...state, exemptIds, toast: toast(`${app.name} ${nowExempt ? 'exempted' : 'contained'}`)};
    }
    case 'ARM': {
      if (state.phase !== 'idle') return state;
      const tier = tierFor(state.duration);
      const containedCount = APPS.filter(app => isContained(app, tier, state.exemptIds)).length;
      return {
        ...state,
        phase: 'armed',
        elapsed: 0,
        selectedBreachId: null,
        endedEarly: false,
        toast: toast(`Session armed — ${containedCount} apps contained`),
      };
    }
    case 'SKIP_5M': {
      if (state.phase !== 'armed' || state.sheet.open) return state;
      const elapsed = Math.min(state.duration, state.elapsed + 5);
      const fresh = SCRIPTED_BREACHES.filter(
        breach => breach.minute > state.elapsed && breach.minute <= elapsed,
      );
      const latest = fresh[fresh.length - 1];
      if (elapsed >= state.duration) {
        // COMPLETION — phase→recap, sheet opens medium in recap mode, the
        // reducer banks the stats in the same beat: streak+1, weekMin+
        // duration, survived+materialized count (50m Firm → 7/340/23 ✓).
        const survivedCount = materializedBreaches(elapsed).length;
        return {
          ...state,
          phase: 'recap',
          elapsed,
          endedEarly: false,
          selectedBreachId: null,
          sheet: {open: true, detent: 'medium', mode: 'recap'},
          stats: {
            streak: state.stats.streak + 1,
            weekMin: state.stats.weekMin + state.duration,
            survived: state.stats.survived + survivedCount,
          },
          toast: toast('Session complete'),
        };
      }
      return {
        ...state,
        elapsed,
        toast: latest
          ? toast(`Blocked ${APP_BY_ID[latest.appId].name} — ${latest.savedMin} min saved`)
          : state.toast,
      };
    }
    case 'SELECT_BREACH':
      return {...state, selectedBreachId: action.id};
    case 'REQUEST_END_EARLY':
      if (state.phase !== 'armed') return state;
      return {
        ...state,
        sheet: {open: true, detent: 'medium', mode: 'confirm'},
        phraseInput: '',
        phraseError: null,
      };
    case 'OPEN_HISTORY':
      if (state.phase !== 'idle') return state;
      return {...state, sheet: {open: true, detent: 'medium', mode: 'history'}};
    case 'SET_PHRASE': {
      const tier = tierFor(state.duration);
      // The error clears the moment the typed value matches (reward the
      // fix immediately — stress fixture 5).
      const matches = action.value.trim().toLowerCase() === tier.phrase;
      return {
        ...state,
        phraseInput: action.value,
        phraseError: matches ? null : state.phraseError,
      };
    }
    case 'PHRASE_BLUR': {
      const tier = tierFor(state.duration);
      const matches = state.phraseInput.trim().toLowerCase() === tier.phrase;
      if (matches || state.phraseInput.trim() === '') return state;
      return {...state, phraseError: "Phrase doesn't match"};
    }
    case 'CONFIRM_END': {
      if (state.sheet.mode !== 'confirm') return state;
      const tier = tierFor(state.duration);
      const matches = state.phraseInput.trim().toLowerCase() === tier.phrase;
      if (!matches) return {...state, phraseError: "Phrase doesn't match"};
      // Early exit: recap flags 'Ended early'; saved counts ONLY
      // materialized breaches; stats untouched (streak held — fixture 3).
      return {
        ...state,
        phase: 'recap',
        endedEarly: true,
        selectedBreachId: null,
        sheet: {open: true, detent: 'medium', mode: 'recap'},
        phraseInput: '',
        phraseError: null,
      };
    }
    case 'SET_DETENT':
      return {...state, sheet: {...state.sheet, detent: action.detent}};
    case 'CLOSE_SHEET': {
      if (!state.sheet.open) return state;
      if (state.sheet.mode === 'recap') {
        // Recap close → reset idle with updated (or held) stats.
        return {
          ...state,
          phase: 'idle',
          elapsed: 0,
          endedEarly: false,
          selectedBreachId: null,
          sheet: {open: false, detent: 'medium', mode: 'recap'},
        };
      }
      // Confirm/history close → return to the state beneath; only the
      // phrase draft clears (by design, noted in the reducer header).
      return {
        ...state,
        sheet: {...state.sheet, open: false},
        phraseInput: '',
        phraseError: null,
      };
    }
    default:
      return state;
  }
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

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled])',
  );
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
// BRAND MARK — 28px portcullis gate half-lowered over an hourglass
// silhouette; frame strokes in currentColor (text-primary), gate bars in
// BRAND_ACCENT. Non-button 44×44 nav slot.
// ---------------------------------------------------------------------------

function BulwarkMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={{...styles.brandMark, color: 'var(--color-text-primary)'}}>
        <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
          {/* Hourglass silhouette */}
          <path
            d="M6 4h8M6 16h8M7 4c0 3 2.2 4.6 3 6-0.8 1.4-3 3-3 6M13 4c0 3-2.2 4.6-3 6 0.8 1.4 3 3 3 6"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Portcullis gate, half-lowered */}
          <path d="M3 2v8M17 2v8M3 2h14" stroke={BRAND_ACCENT} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M6.5 2v4.5M10 2v3M13.5 2v4.5" stroke={BRAND_ACCENT} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// COMMITMENT DIAL (idle) — 240px rotary: 270° REST_FILL track, BRAND
// filled arc to the current value, body-background detent notches at
// 25/50/90 (2×16 square-ended strokes per the corner map), 28px knob
// button role='slider' (ArrowUp/Down ±5m; PageUp/PageDown jump tier
// thresholds; pointer drag maps atan2 → value). Visible button path: the
// 96×32 stepper + 25m/50m/90m preset chips in the controls row below.
// ---------------------------------------------------------------------------

interface CommitmentDialProps {
  duration: number;
  tier: Tier;
  ratchetSeq: number;
  onSetDuration: (value: number) => void;
}

function CommitmentDial({duration, tier, ratchetSeq, onSetDuration}: CommitmentDialProps) {
  const svgWrapRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const applyPointer = useCallback(
    (clientX: number, clientY: number) => {
      const rect = svgWrapRef.current?.getBoundingClientRect();
      if (rect == null) return;
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      onSetDuration(valueForPointer(dx, dy));
    },
    [onSetDuration],
  );

  const onKnobPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    applyPointer(event.clientX, event.clientY);
  };
  const onKnobPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    applyPointer(event.clientX, event.clientY);
  };
  const onKnobPointerUp = () => {
    draggingRef.current = false;
  };
  const onKnobKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') next = duration + DURATION_STEP;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') next = duration - DURATION_STEP;
    else if (event.key === 'PageUp') next = TIER_THRESHOLDS.find(t => t > duration) ?? DURATION_MAX;
    else if (event.key === 'PageDown')
      next = [...TIER_THRESHOLDS].reverse().find(t => t < duration) ?? DURATION_MIN;
    else if (event.key === 'Home') next = DURATION_MIN;
    else if (event.key === 'End') next = DURATION_MAX;
    if (next == null) return;
    event.preventDefault();
    onSetDuration(next);
  };

  const valueDeg = idleDegFor(duration);
  const knobPos = polar(valueDeg, DIAL_R);

  return (
    <div ref={svgWrapRef} style={styles.dialSvgWrap}>
      <svg width={DIAL_SIZE} height={DIAL_SIZE} viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`} fill="none" aria-hidden>
        {/* Rest track — REST_FILL, ≥3:1 vs the body surface (math at decl). */}
        <path d={arcPath(IDLE_START, IDLE_END, DIAL_R)} stroke={REST_FILL} strokeWidth={12} strokeLinecap="round" />
        {/* Committed arc — BRAND_ACCENT to the current value. */}
        <path
          d={arcPath(IDLE_START, valueDeg, DIAL_R)}
          stroke={BRAND_ACCENT}
          strokeWidth={12}
          strokeLinecap="round"
        />
        {/* Detent notches at 25/50/90 — 2×16 square-ended body-background
            strokes cut through the track (corner map: no radius). */}
        {TIER_THRESHOLDS.map(threshold => {
          const deg = idleDegFor(threshold);
          const inner = polar(deg, DIAL_R - 8);
          const outer = polar(deg, DIAL_R + 8);
          return (
            <line
              key={threshold}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--color-background-body)"
              strokeWidth={2}
            />
          );
        })}
      </svg>
      {/* 28px knob in a 44×44 hit — role='slider', the gesture's keyboard
          path lives right here. */}
      <button
        type="button"
        className="bfx-btn bfx-focusable"
        role="slider"
        aria-label="Session duration"
        aria-valuemin={DURATION_MIN}
        aria-valuemax={DURATION_MAX}
        aria-valuenow={duration}
        aria-valuetext={`${duration} minutes — ${tier.name} tier`}
        style={{
          ...styles.knobHit,
          left: knobPos.x - 22,
          top: knobPos.y - 22,
        }}
        onPointerDown={onKnobPointerDown}
        onPointerMove={onKnobPointerMove}
        onPointerUp={onKnobPointerUp}
        onKeyDown={onKnobKeyDown}>
        <span style={styles.knob} aria-hidden />
      </button>
      <div style={styles.dialCenter}>
        <div style={styles.dialCenterStack}>
          {/* Ring-center value doubles as the stepper pair's spinbutton. */}
          <span
            style={styles.dialNumeral}
            role="spinbutton"
            tabIndex={0}
            className="bfx-focusable"
            aria-label="Session duration in minutes"
            aria-valuemin={DURATION_MIN}
            aria-valuemax={DURATION_MAX}
            aria-valuenow={duration}
            aria-valuetext={`${duration} minutes`}
            onKeyDown={event => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                onSetDuration(duration + DURATION_STEP);
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                onSetDuration(duration - DURATION_STEP);
              }
            }}>
            {duration}m
          </span>
          {/* Ratchet pulse: transform-only scale 1→1.06→1, keyed per
              crossing; removed under reduced motion (the badge color swap
              alone encodes the detent). */}
          <span key={ratchetSeq} className="bfx-ratchet" style={styles.tierBadge}>
            {tier.badge}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BREACH LEDGER (armed) — full-circle ring: REST_FILL remaining track,
// BRAND elapsed sweep 0→(elapsed/duration)×360°, ERROR_TICK 4×16 ticks at
// (minute/duration)×360° for each materialized breach, each wrapped in a
// 44×44 transparent button that writes the detail line into the stage
// caption row. Ticks persist into the recap thumbnail.
// ---------------------------------------------------------------------------

interface BreachLedgerProps {
  duration: number;
  elapsed: number;
  tier: Tier;
  containedCount: number;
  selectedBreachId: string | null;
  onSelectBreach: (id: string | null) => void;
}

function BreachLedger({
  duration,
  elapsed,
  tier,
  containedCount,
  selectedBreachId,
  onSelectBreach,
}: BreachLedgerProps) {
  const sweepDeg = Math.min(359.99, (elapsed / duration) * 360);
  const breaches = materializedBreaches(elapsed);
  const remaining = duration - elapsed;
  return (
    <div style={styles.dialSvgWrap}>
      <svg width={DIAL_SIZE} height={DIAL_SIZE} viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`} fill="none" aria-hidden>
        <circle cx={DIAL_C} cy={DIAL_C} r={DIAL_R} stroke={REST_FILL} strokeWidth={12} />
        {sweepDeg > 0 ? (
          <path
            d={arcPath(0, sweepDeg, DIAL_R)}
            stroke={BRAND_ACCENT}
            strokeWidth={12}
            strokeLinecap="round"
            className="bfx-fade"
          />
        ) : null}
        {breaches.map(breach => {
          const deg = (breach.minute / duration) * 360;
          const inner = polar(deg, DIAL_R - 8);
          const outer = polar(deg, DIAL_R + 8);
          const isSelected = breach.id === selectedBreachId;
          return (
            <g key={breach.id}>
              {isSelected ? (
                <circle
                  cx={polar(deg, DIAL_R).x}
                  cy={polar(deg, DIAL_R).y}
                  r={14}
                  stroke={BRAND_ACCENT}
                  strokeWidth={2}
                />
              ) : null}
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={ERROR_TICK}
                strokeWidth={4}
              />
            </g>
          );
        })}
      </svg>
      {/* 44×44 invisible tick buttons — the gesture-free affordance IS the
          button; tap elsewhere on the stage or Escape clears. */}
      {breaches.map(breach => {
        const deg = (breach.minute / duration) * 360;
        const pos = polar(deg, DIAL_R);
        const app = APP_BY_ID[breach.appId];
        return (
          <button
            key={breach.id}
            type="button"
            className="bfx-btn bfx-focusable"
            style={{...styles.tickHit, left: pos.x - 22, top: pos.y - 22}}
            aria-label={`Blocked ${app.name} at ${breach.minute} minutes, ${breach.savedMin} minutes saved`}
            aria-pressed={breach.id === selectedBreachId}
            onClick={event => {
              event.stopPropagation();
              onSelectBreach(breach.id === selectedBreachId ? null : breach.id);
            }}
          />
        );
      })}
      <div style={styles.dialCenter}>
        <div style={styles.dialCenterStack}>
          <span style={styles.dialNumeral}>{fmtClock(remaining)}</span>
          <span style={styles.armedCaption}>
            {tier.name} · {containedCount} contained
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BLOCKLIST ARMING TRAY — one listCard split by the 48px shieldEdge band
// into contained/exempt zones with live counts. The WHOLE 72px row is the
// switch (role='switch'); tier coupling force-contains per the rules and
// pre-dims forced rows at 60% with a 14px LockIcon; ARM slides contained
// rows 8px down + dims them behind the band (fade-only reduced motion)
// and swaps switches for 16px LockIcon glyphs.
// ---------------------------------------------------------------------------

interface AppRowViewProps {
  app: DistractionApp;
  glyphIndex: number;
  isExemptRow: boolean;
  forced: boolean;
  armed: boolean;
  toggleDisabled: boolean;
  isLast: boolean;
  onToggle: (id: string) => void;
}

function AppRowView({
  app,
  glyphIndex,
  isExemptRow,
  forced,
  armed,
  toggleDisabled,
  isLast,
  onToggle,
}: AppRowViewProps) {
  const checked = isExemptRow;
  const disabled = toggleDisabled || armed;
  const rowStyle: CSSProperties = {
    ...styles.appRow,
    // ARM: contained rows translate 8px down + dim behind the shield band
    // (transform/opacity only; the transition collapses via .bfx-anim's
    // reduced-motion guard). Idle forced rows pre-dim at 60%.
    ...(armed && !isExemptRow ? {transform: 'translateY(8px)', opacity: 0.6} : null),
    ...(!armed && forced ? {opacity: 0.6} : null),
  };
  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${app.name}, ${app.avgLabel}${forced ? ', locked by tier' : ''} — exempt from blocking`}
        className="bfx-btn bfx-focusable bfx-anim"
        style={rowStyle}
        disabled={disabled}
        aria-disabled={disabled}
        onClick={() => onToggle(app.id)}>
        <span
          style={{
            ...styles.glyphTile,
            background: GLYPH_BG[glyphIndex % 4],
            color: GLYPH_TEXT[glyphIndex % 4],
          }}
          aria-hidden>
          {app.name.charAt(0)}
        </span>
        <span style={styles.appText}>
          <span style={styles.appName}>
            <span style={styles.appNameText}>{app.name}</span>
            {forced && !armed ? (
              <span style={styles.forcedLock} aria-hidden>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x={4} y={10} width={16} height={11} rx={2} />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>
            ) : null}
          </span>
          <span style={styles.appMeta}>{app.avgLabel}</span>
        </span>
        {armed && !isExemptRow ? (
          <span style={styles.armedLockGlyph} aria-hidden>
            <Icon icon={LockIcon} size="sm" color="inherit" />
          </span>
        ) : (
          <span
            style={{
              ...styles.switchTrack,
              ...(checked ? styles.switchTrackOn : null),
              ...(toggleDisabled ? {opacity: 0.35} : null),
            }}
            aria-hidden>
            <span
              className="bfx-anim"
              style={{...styles.switchThumb, ...(checked ? styles.switchThumbOn : null)}}
            />
          </span>
        )}
      </button>
      {isLast ? null : <div style={styles.rowDividerDeep} />}
    </div>
  );
}

interface BlocklistArmingTrayProps {
  tier: Tier;
  exemptIds: string[];
  armed: boolean;
  onToggle: (id: string) => void;
}

function BlocklistArmingTray({tier, exemptIds, armed, onToggle}: BlocklistArmingTrayProps) {
  const contained = APPS.filter(app => isContained(app, tier, exemptIds));
  const exempt = APPS.filter(app => !isContained(app, tier, exemptIds));
  const glyphIndexById: Record<string, number> = Object.fromEntries(
    APPS.map((app, index) => [app.id, index]),
  );
  const toggleDisabledFor = (app: DistractionApp): boolean => {
    if (tier.id === 'locked') return true;
    if (tier.id === 'firm' && app.avgMin >= 10) return true;
    return false;
  };
  return (
    <div style={styles.listCard}>
      <div style={styles.zoneHeaderRow}>Contained · {contained.length}</div>
      <div style={styles.rowDivider} />
      {contained.map((app, index) => (
        <AppRowView
          key={app.id}
          app={app}
          glyphIndex={glyphIndexById[app.id]}
          isExemptRow={false}
          forced={isForced(app, tier, exemptIds)}
          armed={armed}
          toggleDisabled={toggleDisabledFor(app)}
          isLast={index === contained.length - 1}
          onToggle={onToggle}
        />
      ))}
      <div style={styles.shieldEdge}>
        <Icon icon={ShieldIcon} size="sm" color="inherit" />
        <span>Under the shield</span>
      </div>
      <div style={styles.zoneHeaderRow}>Exempt · {exempt.length}</div>
      {exempt.length === 0 ? (
        <div style={styles.exemptEmptyCaption}>Locked tier — no exemptions</div>
      ) : (
        <>
          <div style={styles.rowDivider} />
          {exempt.map((app, index) => (
            <AppRowView
              key={app.id}
              app={app}
              glyphIndex={glyphIndexById[app.id]}
              isExemptRow
              forced={false}
              armed={armed}
              toggleDisabled={toggleDisabledFor(app)}
              isLast={index === exempt.length - 1}
              onToggle={onToggle}
            />
          ))}
        </>
      )}
      <div style={styles.rowDivider} />
      <div style={styles.trayFooterCaption}>
        {COMBINED_AVG_MIN} min combined daily average
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RECAP RING — 96px thumbnail, 6px stroke, ticks at the SAME angles as the
// armed ring ((minute/duration)×360°).
// ---------------------------------------------------------------------------

interface RecapRingProps {
  durationMin: number;
  elapsedMin: number;
  breaches: ScriptedBreach[];
}

function RecapRing({durationMin, elapsedMin, breaches}: RecapRingProps) {
  const C = 48;
  const R = 40;
  const sweep = Math.min(359.99, (elapsedMin / durationMin) * 360);
  const pol = (deg: number, radius: number) => {
    const rad = (deg * Math.PI) / 180;
    return {x: C + radius * Math.sin(rad), y: C - radius * Math.cos(rad)};
  };
  const arc = (toDeg: number) => {
    const from = pol(0, R);
    const to = pol(toDeg, R);
    return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${R} ${R} 0 ${toDeg > 180 ? 1 : 0} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
  };
  return (
    <span style={styles.recapThumbWrap} aria-hidden>
      <svg width={96} height={96} viewBox="0 0 96 96" fill="none" aria-hidden>
        <circle cx={C} cy={C} r={R} stroke={REST_FILL} strokeWidth={6} />
        {sweep > 0 ? <path d={arc(sweep)} stroke={BRAND_ACCENT} strokeWidth={6} strokeLinecap="round" /> : null}
        {breaches.map(breach => {
          const deg = (breach.minute / durationMin) * 360;
          const inner = pol(deg, R - 5);
          const outer = pol(deg, R + 5);
          return (
            <line
              key={breach.id}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={ERROR_TICK}
              strokeWidth={2.5}
            />
          );
        })}
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button; click toggles
// 55% ↔ calc(100% − 56px), drag between detents is garnish, >120px past
// medium closes), 52px header with 44×44 X, focus-trapped dialog. First
// focus lands on the X (the safe control — never Confirm-end).
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  reducedMotion: boolean;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({
  titleId,
  title,
  detent,
  onDetentChange,
  onClose,
  sheetRef,
  closeBtnRef,
  reducedMotion,
  footer,
  children,
}: SheetProps) {
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

  const translate = dragY != null && dragY > 0 ? `translateY(${dragY}px)` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="bfx-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease, height 240ms ease',
      }}>
      <button
        type="button"
        className="bfx-btn bfx-focusable"
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
          ref={closeBtnRef}
          className="bfx-btn bfx-focusable"
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
// RECAP BODY — shared by the live recap and the idle History sheet. The
// breach-row ledger renders ONLY at the large detent (stress fixture 8);
// medium shows a resize hint instead.
// ---------------------------------------------------------------------------

interface RecapBodyProps {
  durationMin: number;
  elapsedMin: number;
  tierName: string;
  breaches: ScriptedBreach[];
  endedEarly: boolean;
  dateLine: string | null;
  detent: 'medium' | 'large';
  footerLine: string;
}

function RecapBody({
  durationMin,
  elapsedMin,
  tierName,
  breaches,
  endedEarly,
  dateLine,
  detent,
  footerLine,
}: RecapBodyProps) {
  const savedMin = breaches.reduce((sum, breach) => sum + breach.savedMin, 0);
  const longest = longestCalmStretch(breaches.map(breach => breach.minute), elapsedMin);
  const attemptsLine =
    breaches.length === 0 ? '0 attempts — clean session' : `${breaches.length} attempts blocked`;
  return (
    <div>
      <div style={styles.recapTop}>
        <RecapRing durationMin={durationMin} elapsedMin={elapsedMin} breaches={breaches} />
        <div style={styles.recapNumbers}>
          <span style={styles.recapNum}>{savedMin} min saved</span>
          {dateLine != null ? <span style={styles.recapLine}>{dateLine}</span> : null}
          <span style={styles.recapLine}>
            {endedEarly
              ? `Ended early at ${fmtClock(elapsedMin)}`
              : `Completed ${durationMin}m ${tierName} session`}
          </span>
          <span style={styles.recapLine}>{attemptsLine}</span>
          <span style={styles.recapLine}>Longest calm stretch {longest} min</span>
        </div>
      </div>
      {detent === 'large' ? (
        breaches.length > 0 ? (
          <div style={styles.recapCard}>
            {breaches.map((breach, index) => {
              const app = APP_BY_ID[breach.appId];
              return (
                <div key={breach.id}>
                  <div style={styles.breachRow}>
                    <span style={styles.breachRowText}>
                      <span style={styles.breachRowPrimary}>{app.name}</span>
                      <span style={styles.breachRowMeta}>Blocked at {breach.minute}m</span>
                    </span>
                    <span style={styles.breachRowSaved}>+{breach.savedMin} min</span>
                  </div>
                  {index === breaches.length - 1 ? null : <div style={styles.rowDivider} />}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={styles.recapHint}>No breach attempts to list.</div>
        )
      ) : (
        <div style={styles.recapHint}>Resize the sheet for the breach ledger</div>
      )}
      <div style={styles.recapFooterLine}>{footerLine}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileFocusBlocklistTimerTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, dispatch] = useReducer(sessionReducer, INITIAL_SESSION);

  // Focus plumbing — opener restored on every close path; first focus in
  // the sheet lands on the X via focus({preventScroll: true}) (a plain
  // .focus() would scroll-reveal the animating sheet inside the locked
  // overflow-hidden column and beach it mid-screen — amendment).
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const armBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevSheetOpenRef = useRef(false);

  useEffect(() => {
    const wasOpen = prevSheetOpenRef.current;
    prevSheetOpenRef.current = state.sheet.open;
    if (state.sheet.open && !wasOpen) {
      sheetCloseBtnRef.current?.focus({preventScroll: true});
    } else if (!state.sheet.open && wasOpen) {
      const opener = sheetOpenerRef.current;
      if (opener != null && opener.isConnected) opener.focus();
      else armBtnRef.current?.focus();
    }
  }, [state.sheet.open]);

  // Escape closes the TOPMOST layer only: sheet first, then a selected
  // breach tick (typing targets are inside the sheet, which wins anyway).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.sheet.open) dispatch({type: 'CLOSE_SHEET'});
      else if (state.selectedBreachId != null) dispatch({type: 'SELECT_BREACH', id: null});
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.sheet.open, state.selectedBreachId]);

  const tier = tierFor(state.duration);
  const containedCount = APPS.filter(app => isContained(app, tier, state.exemptIds)).length;
  const breaches = materializedBreaches(state.elapsed);
  const selectedBreach = breaches.find(breach => breach.id === state.selectedBreachId) ?? null;
  const armed = state.phase === 'armed' || state.phase === 'recap';

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheet.open ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const sheetMode = state.sheet.mode;
  const recapFooterLine = state.endedEarly
    ? `Streak held at ${state.stats.streak} days`
    : `Streak: ${state.stats.streak} days · ${state.stats.survived} survived this week`;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{BULWARK_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <BulwarkMark />
          </div>
          {state.phase === 'armed' ? (
            <span style={styles.navClock} aria-label={`${state.elapsed} of ${state.duration} minutes elapsed`}>
              {fmtClock(state.elapsed)} / {fmtClock(state.duration)}
            </span>
          ) : (
            <span style={styles.navTitle}>Bulwark</span>
          )}
          <div style={styles.navTrailing}>
            {state.phase === 'armed' ? (
              <button
                type="button"
                className="bfx-btn bfx-focusable"
                style={styles.endEarlyBtn}
                onClick={event => {
                  sheetOpenerRef.current = event.currentTarget;
                  dispatch({type: 'REQUEST_END_EARLY'});
                }}>
                End early
              </button>
            ) : (
              <button
                type="button"
                className="bfx-btn bfx-focusable"
                style={styles.iconBtn}
                aria-label="Last session recap"
                onClick={event => {
                  sheetOpenerRef.current = event.currentTarget;
                  dispatch({type: 'OPEN_HISTORY'});
                }}>
                <Icon icon={HistoryIcon} size="md" color="inherit" />
              </button>
            )}
          </div>
        </header>

        <main style={styles.main}>
          <h1 className="bfx-vh">Bulwark focus session</h1>

          {/* TIMER STAGE — 344px in BOTH states (zero shift). Tapping the
              stage outside a tick clears the selected breach. */}
          <div
            style={styles.timerStage}
            onClick={() => {
              if (state.selectedBreachId != null) dispatch({type: 'SELECT_BREACH', id: null});
            }}>
            <div style={styles.dialBlock}>
              {state.phase === 'idle' ? (
                <CommitmentDial
                  duration={state.duration}
                  tier={tier}
                  ratchetSeq={state.ratchetSeq}
                  onSetDuration={value => dispatch({type: 'SET_DURATION', value})}
                />
              ) : (
                <BreachLedger
                  duration={state.duration}
                  elapsed={state.elapsed}
                  tier={tier}
                  containedCount={containedCount}
                  selectedBreachId={state.selectedBreachId}
                  onSelectBreach={id => dispatch({type: 'SELECT_BREACH', id})}
                />
              )}
            </div>
            <div style={styles.controlsRow}>
              {state.phase === 'idle' ? (
                <>
                  {/* 96×32 stepper (44px hits) — the dial gesture's button
                      path, alongside the preset chips. */}
                  <div style={styles.stepperWrap}>
                    <span style={styles.stepperTrack} aria-hidden />
                    <span style={styles.stepperDivider} aria-hidden />
                    <button
                      type="button"
                      className="bfx-btn bfx-focusable"
                      style={{
                        ...styles.stepperHalf,
                        left: 0,
                        ...(state.duration <= DURATION_MIN ? {opacity: 0.35} : null),
                      }}
                      aria-label="Decrease duration"
                      disabled={state.duration <= DURATION_MIN}
                      onClick={() => dispatch({type: 'STEP_DURATION', delta: -5})}>
                      <Icon icon={MinusIcon} size="sm" color="inherit" />
                    </button>
                    <button
                      type="button"
                      className="bfx-btn bfx-focusable"
                      style={{
                        ...styles.stepperHalf,
                        right: 0,
                        ...(state.duration >= DURATION_MAX ? {opacity: 0.35} : null),
                      }}
                      aria-label="Increase duration"
                      disabled={state.duration >= DURATION_MAX}
                      onClick={() => dispatch({type: 'STEP_DURATION', delta: 5})}>
                      <Icon icon={PlusIcon} size="sm" color="inherit" />
                    </button>
                  </div>
                  {[25, 50, 90].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      className="bfx-btn bfx-focusable"
                      style={styles.presetChipHit}
                      aria-pressed={state.duration === preset}
                      aria-label={`${preset} minute preset`}
                      onClick={() => dispatch({type: 'PRESET', value: preset})}>
                      <span
                        style={{
                          ...styles.presetChip,
                          ...(state.duration === preset ? styles.presetChipOn : null),
                        }}>
                        {preset}m
                      </span>
                    </button>
                  ))}
                </>
              ) : (
                <span style={styles.armedCaption}>
                  {selectedBreach != null
                    ? `${APP_BY_ID[selectedBreach.appId].name} at ${selectedBreach.minute}m — ${selectedBreach.savedMin} min saved`
                    : breaches.length === 0
                      ? 'No attempts yet'
                      : `${breaches.length} attempts blocked`}
                </span>
              )}
            </div>
          </div>

          <h2 style={styles.sectionHeader}>Commitment</h2>
          <div style={{...styles.listCard, ...styles.tierCard}}>
            <span style={styles.tierCardName}>
              {tier.name}
              <span style={styles.tierBadge}>{tier.badge}</span>
            </span>
            <span style={styles.tierCardLine}>{tier.line1}</span>
            <span style={styles.tierCardLine}>{tier.line2}</span>
          </div>

          <h2 style={styles.sectionHeader}>Blocklist</h2>
          <BlocklistArmingTray
            tier={tier}
            exemptIds={state.exemptIds}
            armed={armed}
            onToggle={id => dispatch({type: 'TOGGLE_EXEMPT', id})}
          />

          <h2 style={styles.sectionHeader}>Proof</h2>
          <div style={styles.statsCard}>
            <div style={styles.statCell}>
              <span style={styles.statNum}>{state.stats.streak}</span>
              <span style={styles.statOverline}>Days streak</span>
            </div>
            <div style={styles.statCell}>
              <span style={styles.statNum}>{state.stats.weekMin}</span>
              <span style={styles.statOverline}>Min this week</span>
            </div>
            <div style={styles.statCell}>
              <span style={styles.statNum}>{state.stats.survived}</span>
              <span style={styles.statOverline}>Survived</span>
            </div>
          </div>

          <div style={styles.terminalCaption}>{TERMINAL_CAPTION}</div>
        </main>

        {/* toastDock — THE one polite live region. Sticky in flow above
            the footer; shell-absolute only while the sheet scroll-lock is
            active (amendment). No auto-dismiss timers; a new toast
            replaces the old. */}
        <div
          style={state.sheet.open ? styles.toastDockLocked : styles.toastDockSticky}
          aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="bfx-fade">
              {state.toast.text}
            </div>
          ) : null}
        </div>

        <footer style={styles.footer}>
          {state.phase === 'armed' ? (
            <button
              type="button"
              className="bfx-btn bfx-focusable"
              style={styles.skipBtn}
              onClick={event => {
                // If this press completes the session, the recap sheet
                // opens — remember the opener for focus restore.
                sheetOpenerRef.current = event.currentTarget;
                dispatch({type: 'SKIP_5M'});
              }}>
              Skip 5m
            </button>
          ) : (
            <button
              type="button"
              ref={armBtnRef}
              className="bfx-btn bfx-focusable"
              style={styles.armBtn}
              onClick={() => dispatch({type: 'ARM'})}>
              Arm {state.duration}-minute session
            </button>
          )}
        </footer>

        {state.sheet.open ? (
          <div style={styles.sheetScrim} onClick={() => dispatch({type: 'CLOSE_SHEET'})} aria-hidden />
        ) : null}
        {state.sheet.open && sheetMode === 'confirm' ? (
          <Sheet
            titleId="bfx-confirm-title"
            title="Break commitment?"
            detent={state.sheet.detent}
            onDetentChange={detent => dispatch({type: 'SET_DETENT', detent})}
            onClose={() => dispatch({type: 'CLOSE_SHEET'})}
            sheetRef={sheetRef}
            closeBtnRef={sheetCloseBtnRef}
            reducedMotion={reducedMotion}
            footer={
              <>
                <button
                  type="button"
                  className="bfx-btn bfx-focusable"
                  style={styles.confirmEndBtn}
                  onClick={() => dispatch({type: 'CONFIRM_END'})}>
                  End session early
                </button>
                <button
                  type="button"
                  className="bfx-btn bfx-focusable"
                  style={styles.keepBtn}
                  onClick={() => dispatch({type: 'CLOSE_SHEET'})}>
                  Keep going
                </button>
              </>
            }>
            <div style={styles.phraseQuote}>“{tier.phrase}”</div>
            <label style={styles.formLabel} htmlFor="bfx-phrase-input">
              Type the phrase to end this {state.duration}-minute session
            </label>
            <input
              id="bfx-phrase-input"
              type="text"
              autoComplete="off"
              spellCheck={false}
              className="bfx-focusable"
              style={{
                ...styles.formInput,
                ...(state.phraseError != null ? styles.formInputError : null),
              }}
              value={state.phraseInput}
              aria-invalid={state.phraseError != null}
              aria-describedby={state.phraseError != null ? 'bfx-phrase-error' : undefined}
              onChange={event => dispatch({type: 'SET_PHRASE', value: event.target.value})}
              onBlur={() => dispatch({type: 'PHRASE_BLUR'})}
            />
            {state.phraseError != null ? (
              <div id="bfx-phrase-error" style={styles.fieldError}>
                <Icon icon={AlertCircleIcon} size="sm" color="inherit" />
                {state.phraseError}
              </div>
            ) : null}
          </Sheet>
        ) : null}
        {state.sheet.open && sheetMode === 'recap' ? (
          <Sheet
            titleId="bfx-recap-title"
            title="Session recap"
            detent={state.sheet.detent}
            onDetentChange={detent => dispatch({type: 'SET_DETENT', detent})}
            onClose={() => dispatch({type: 'CLOSE_SHEET'})}
            sheetRef={sheetRef}
            closeBtnRef={sheetCloseBtnRef}
            reducedMotion={reducedMotion}
            footer={
              <button
                type="button"
                className="bfx-btn bfx-focusable"
                style={styles.armBtn}
                onClick={() => dispatch({type: 'CLOSE_SHEET'})}>
                Done
              </button>
            }>
            <RecapBody
              durationMin={state.duration}
              elapsedMin={state.elapsed}
              tierName={tier.name}
              breaches={breaches}
              endedEarly={state.endedEarly}
              dateLine={null}
              detent={state.sheet.detent}
              footerLine={recapFooterLine}
            />
          </Sheet>
        ) : null}
        {state.sheet.open && sheetMode === 'history' ? (
          <Sheet
            titleId="bfx-history-title"
            title="Last session"
            detent={state.sheet.detent}
            onDetentChange={detent => dispatch({type: 'SET_DETENT', detent})}
            onClose={() => dispatch({type: 'CLOSE_SHEET'})}
            sheetRef={sheetRef}
            closeBtnRef={sheetCloseBtnRef}
            reducedMotion={reducedMotion}
            footer={
              <button
                type="button"
                className="bfx-btn bfx-focusable"
                style={styles.armBtn}
                onClick={() => dispatch({type: 'CLOSE_SHEET'})}>
                Done
              </button>
            }>
            <RecapBody
              durationMin={LAST_SESSION.durationMin}
              elapsedMin={LAST_SESSION.durationMin}
              tierName={LAST_SESSION.tierName}
              breaches={LAST_SESSION.breaches}
              endedEarly={false}
              dateLine={`${LAST_SESSION.dateLabel} · ${LAST_SESSION.durationMin}m ${LAST_SESSION.tierName}`}
              detent={state.sheet.detent}
              footerLine={`Longest calm stretch ${LAST_SESSION.longestCalm} min`}
            />
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
