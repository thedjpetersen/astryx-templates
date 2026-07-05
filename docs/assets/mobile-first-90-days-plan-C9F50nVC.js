var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Rampline onboarding ramp for a
 *   platform engineer frozen at Day 34 of 90 (started May 18, 2026):
 *   exactly 18 tasks ({id, title, homePhase, currentPhase, done, withId,
 *   dueDay} — homePhase 30: 8 tasks / 6 done / 2 open-and-slipped into 60;
 *   homePhase 60: 6 / 2 done; homePhase 90: 4 / 0 done; cross-check
 *   8+6+4 = 18, done 6+2+0 = 8, open 10); 3 stakeholders with 6-dot 1:1
 *   cadence strips (18 dots, 8 held); 5 logged wins (3 Day-30 + 2 Day-60).
 *   No Date.now(), no Math.random(), no network media.
 * @output Rampline — First 90 Days: a 390px MOBILE onboarding ramp planner
 *   where time is the primary control. The navBar carries a 36px
 *   three-segment 30/60/90 PhaseDial (104°×3 + 16°×3 = 360°) whose outer
 *   arcs fill with per-phase task completion (6/8, 2/6, 0/4) and whose
 *   inner sub-arcs fill with 1:1s held per phase (7/10, 1/6, 0/2);
 *   tapping it advances the phase in view with a directional slide.
 *   Incomplete Day-30 tasks carry into Day 60 as 72px slipped-provenance
 *   rows (amber rail + 'Slipped from Day 30' chip, swipe-reveal Done /
 *   Re-home with a mandatory 44×44 ellipsis fallback). Plan / People /
 *   Wins tab bar; edit-mode re-homing via an editToolbar; task-detail and
 *   stakeholder bottom sheets; every mutation executes immediately and
 *   routes through one snapshot-exact Undo toast. Signature chain:
 *   completing t7 'Meet your skip-level manager' fills the dial 30-segment
 *   75%→87.5%, flips Marcus's Day-60 dot upcoming→held (60 sub-arc
 *   1/6→2/6), mints a suggested win (Wins badge '1'), and moves the
 *   global stat 8/18→9/18.
 * @position Page template; emitted by \`astryx template mobile-first-90-days-plan\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheets, actionSheet) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While a
 *   sheet or actionSheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close; the toastDock is
 *   sticky-in-flow above the tabBar normally and switches to absolute
 *   insetInline 16 / bottom 76 ONLY during that scroll-lock (shell-absolute
 *   pins to the document bottom otherwise — off-viewport on tall views).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16, or 60 where rows lead with the
 *   28px check circle: 16 pad + 28 circle + 16 gap = 60); no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Rampline amber — spec #D97706 raw fails 4.5:1 on white
 *   at ≈2.9:1, so the light leg darkens to #B45309); sanctioned non-brand
 *   literals are the slipped-chip amber pair, the held/missed dot pairs,
 *   and CHECK_RING — the amendment-mandated ≥3:1 interactive-boundary
 *   ring for unchecked circles (var(--color-border) hairlines are for
 *   passive separators only). Contrast math at each declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen inset · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', blur color-mix 86% +
 *   backdropFilter blur(12px), borderBottom hairline ALWAYS ON — this
 *   template does not wire scroll-under; per-template choice noted);
 *   phaseHeader 72px in flow (h1 22px/700 + 13px/400 meta, 2px gap,
 *   trailing 17px/600 tabular fraction); tabBar 64px sticky bottom z20
 *   (3 tabItems flex:1, 24px icon over 11px/500 label, 4px gap; Wins
 *   badge 16px min-width brand pill 10px/600 offset top −4 right −8).
 *   ROWS: 44px utility (sheet rows) / 60px two-line task + win rows
 *   (16px/500 + 13px/400, 2px gap) / 72px slipped carry + stakeholder
 *   media rows (40px initials avatar). sectionHeader 13px/600 uppercase
 *   0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px bottom.
 *   TYPE (Figtree via --font-family-body): 22/700 phase title · 17/600
 *   nav + sheet titles · 16/400–500 row primary · 13/400 meta · 11/500
 *   chips, tab labels, dot legend; nothing under 11px; tabular-nums on
 *   every count, day number, and fraction. Buttons: 48px full-width sheet
 *   primary · 36px secondary · 44×44 icon buttons with 20–24px glyphs.
 *   Primary verb placement: completion lives in the rows + sheet footer;
 *   the tab bar owns navigation; NO FAB (creation is not this screen's
 *   verb). Destructive ('Delete task', edit Delete) only inside the
 *   actionSheet and at the LEADING end of the editToolbar.
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow (overflowX:'clip' is
 *   backstop only). Task titles and stakeholder names ellipsize
 *   (minWidth:0 on every flex text column — the classic trap);
 *   CadenceDotStrip is a fixed 90px trailing block (6×10px dots + 5×6px
 *   gaps = 90), the name column shrinks first; the phaseHeader fraction
 *   never wraps (flexShrink:0, tabular-nums). At 320 the navBar three-zone
 *   grid holds (center title max 200px, minWidth:0); suggestedWinCard
 *   buttons stay side-by-side: 2×120 + 16 gap + 32 padding = 288 < 320 ✓.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   renders as a centered 430px phone column with hairline borderInline
 *   per the house default; no adaptive relayout.
 *
 * Skeletons: NONE ship in this template — there is no refresh verb and
 * every tab renders instantly from fixtures, so no loading state is
 * demonstrable (determinism rule; noted per contract).
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  CheckIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  MoreHorizontalIcon,
  TrophyIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Rampline amber). Spec brandColor #D97706
// on #FFFFFF ≈ 2.9:1 — fails 4.5:1 — so the light leg darkens to #B45309:
// #B45309 on #FFFFFF ≈ 4.8:1 ✓; #FBBF24 on the dark card (~#1C1C1E) ≈
// 8.0:1 ✓. Also serves as the DOT_HELD meaningful rest fill (≥3:1 vs its
// ACTUAL card surface in both schemes, per the batch-2 amendment).
const BRAND_ACCENT = 'light-dark(#B45309, #FBBF24)';
// Text/glyphs over a BRAND_ACCENT fill: #FFFFFF on #B45309 ≈ 4.8:1 ✓;
// white on #FBBF24 fails (~1.6:1), so the dark side flips to near-black
// amber — #451A03 on #FBBF24 ≈ 9.3:1 ✓ (check glyph, badge text, swipe
// block labels).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #451A03)';
// Brand-tinted wash for the suggestedWinCard and dial-active tick base.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Slipped-provenance chip: #92400E on #FEF3C7 ≈ 5.9:1 ✓; #FCD34D on
// #451A03 ≈ 9.3:1 ✓ (spec pairs, math restated).
const CHIP_BG = 'light-dark(#FEF3C7, #451A03)';
const CHIP_TEXT = 'light-dark(#92400E, #FCD34D)';
// Cadence dots — MEANINGFUL rest fills, so explicit pairs at ≥3:1 vs the
// card surface (amendment): held solid #B45309 on #FFFFFF ≈ 4.8:1 ✓ /
// #FBBF24 on dark card ≈ 8.0:1 ✓; missed 2px hollow ring #B91C1C on
// #FFFFFF ≈ 6.6:1 ✓ / #F87171 on dark card ≈ 6.2:1 ✓. Upcoming dots are
// PASSIVE (future placeholders) and legally use the --color-border
// hairline ring; the 11px caption text is the accessible channel.
const DOT_HELD = 'light-dark(#B45309, #FBBF24)';
const DOT_MISSED = 'light-dark(#B91C1C, #F87171)';
// 3px slipped-row rail — meaningful fill, reuses the ≥3:1 held pair.
const RAIL_AMBER = 'light-dark(#B45309, #FBBF24)';
// AMENDMENT (batch 1-2, binding): interactive control boundaries — the
// unchecked 28px check circles and 24px edit selectionCircles — may NOT
// rest on the passive --color-border hairline; they get an explicit pair
// at ≥3:1 vs their actual card surface: #6B7280 on #FFFFFF ≈ 4.8:1 ✓;
// #9CA3AF on the dark card ≈ 6.9:1 ✓. (Deviation from the spec's
// 'var(--color-border) ring' wording, mandated by the brief amendment.)
const CHECK_RING = 'light-dark(#6B7280, #9CA3AF)';
// Sheet/actionSheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, directional
// PhaseTransition keyframes (transform/opacity only), reduced-motion guard.
// ---------------------------------------------------------------------------

const RAMPLINE_CSS = \`
.rl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.rl-btn:disabled { cursor: default; }
.rl-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.rl-anim { transition: transform 200ms ease, opacity 200ms ease; }
.rl-fade { transition: opacity 200ms ease; }
/* PhaseTransition — incoming view slides ±24px→0 with a fade, 200ms,
   transform/opacity only; collapses to a plain opacity swap under
   prefers-reduced-motion. (Single-mount keyed swap: the outgoing view
   unmounts; the directional story is carried by the incoming slide.) */
@keyframes rl-in-fwd {
  from { transform: translateX(24px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
@keyframes rl-in-back {
  from { transform: translateX(-24px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.rl-in-fwd { animation: rl-in-fwd 200ms ease; }
.rl-in-back { animation: rl-in-back 200ms ease; }
@keyframes rl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.rl-sheet-in { animation: rl-sheet-in 200ms ease; }
.rl-vh {
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
  .rl-anim, .rl-fade { transition: none; }
  .rl-in-fwd, .rl-in-back { animation: rl-in-fwd 1ms linear; }
  .rl-sheet-in { animation: none; }
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
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline ALWAYS ON.
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
    maxWidth: 200,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  // Edit-mode count title — 17px/600 tabular, aria-live=polite (the one
  // sanctioned second live region per the editMode contract).
  navCount: {
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  navTextBtn: {
    height: 44,
    paddingInline: 8,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  navTextBtnStrong: {fontWeight: 600},
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
  // PHASE HEADER — 72px block in flow below the navBar; h1 22/700 + 13
  // meta (2px gap), trailing fraction 17/600 tabular, flexShrink 0.
  phaseHeader: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  phaseHeadText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  phaseTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  phaseMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  phaseFraction: {
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom margin.
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
  // 60px inset where rows lead with the 28px check circle: 16 pad + 28
  // circle + 16 gap = 60 (derivation per spec).
  rowDivider60: {height: 1, background: 'var(--color-border)', marginInlineStart: 60},
  caption: {
    margin: '12px 16px 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TASK ROW — 60px two-line; the check circle is its own 44×44 button,
  // the row body is a second sibling button (never nested).
  taskRow: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 60,
    paddingInlineStart: 8,
  },
  checkHit: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    flexShrink: 0,
  },
  // Unchecked = 2px CHECK_RING (≥3:1 interactive boundary; see COLOR
  // LITERALS); checked = brand fill + 16px check in BRAND_FILL_TEXT.
  circleOff: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: \`2px solid \${CHECK_RING}\`,
  },
  circleOn: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 60,
    paddingInlineEnd: 16,
    paddingBlock: 8,
  },
  rowText: {
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
  rowTitleDone: {color: 'var(--color-text-secondary)'},
  rowMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  metaLine: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  // SlippedCarryChip — 20px pill, 11/500, paddingInline 8.
  carryChip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: CHIP_BG,
    color: CHIP_TEXT,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  // SLIPPED CARRY ROW — 72px; 3px amber rail as inset box-shadow on the
  // row content (not the card).
  slippedOuter: {position: 'relative'},
  swipeClip: {position: 'relative', overflow: 'hidden'},
  swipeActions: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 144,
    display: 'flex',
  },
  swipeDone: {
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
  swipeRehome: {
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
  },
  slippedContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minHeight: 72,
    paddingInlineStart: 8,
    background: 'var(--color-background-card)',
    boxShadow: \`inset 3px 0 0 \${RAIL_AMBER}\`,
    touchAction: 'pan-y',
  },
  slippedBody: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 72,
    paddingBlock: 8,
  },
  // GHOST CARRY ROW (Day 90) — DERIVED preview, non-interactive except
  // the explicit 36px 'Re-home here' button (button-path law).
  ghostRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    paddingInline: 16,
    paddingBlock: 8,
  },
  ghostText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    opacity: 0.62,
  },
  secondaryBtn36: {
    height: 36,
    paddingInline: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    background: 'var(--color-background-card)',
  },
  brandBtn36: {
    height: 36,
    paddingInline: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // STAKEHOLDER ROW — 72px media row; 40px initials avatar; trailing
  // fixed 90px CadenceDotStrip block (6×10 + 5×6 = 90).
  stakeRow: {
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  stakeText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  stakeTrailing: {
    width: 90,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  dotStrip: {display: 'flex', gap: 6},
  dotHeld: {width: 10, height: 10, borderRadius: '50%', background: DOT_HELD},
  dotMissed: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: \`2px solid \${DOT_MISSED}\`,
    boxSizing: 'border-box',
  },
  dotUpcoming: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: '1px solid var(--color-border)',
    boxSizing: 'border-box',
  },
  dotCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // People legend key row — the dots' accessible legend.
  keyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 32,
    marginBottom: 4,
  },
  keyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  // WINS
  filterRow: {display: 'flex', gap: 8, paddingInline: 16, flexWrap: 'wrap'},
  chipHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 999,
  },
  chipPill: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  chipPillOn: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontWeight: 600,
  },
  suggestedCard: {
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 'var(--radius-element, 12px)',
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_TINT_12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: BRAND_ACCENT,
  },
  suggestedTitle: {fontSize: 16, fontWeight: 500},
  // Buttons side-by-side at 320: 2×120 + 16 gap + 32 card padding = 288
  // < 320 ✓ (math per spec).
  suggestedBtns: {display: 'flex', gap: 16, marginTop: 4},
  winRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingInline: 16,
    paddingBlock: 8,
  },
  // TAB BAR — 64px sticky bottom z20, 3 tabItems flex:1.
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
  tabItemOn: {color: BRAND_ACCENT},
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelOn: {fontWeight: 600},
  // Badge — 16px min-width brand pill, 10px/600 BRAND_FILL_TEXT (white on
  // #B45309 ≈ 4.8:1 / #451A03 on #FBBF24 ≈ 9.3:1), offset top −4 right −8.
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // EDIT TOOLBAR — replaces tabBar with identical 64px sticky geometry;
  // Delete at the LEADING end (ergonomics law), Move buttons after.
  editToolbar: {
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
  toolBtn: {
    flex: 1,
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  toolBtnDelete: {color: 'var(--color-error)'},
  toolBtnDisabled: {opacity: 0.4},
  // Edit selectionCircle — 24px, leading; unselected uses CHECK_RING (the
  // ≥3:1 amendment boundary), selected = brand fill + 16px check.
  selCircleOff: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: \`2px solid \${CHECK_RING}\`,
    flexShrink: 0,
  },
  selCircleOn: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  // TOAST DOCK — sticky-in-flow above the tabBar (amendment: the shell
  // grows with content, so shell-absolute bottom pins to the DOCUMENT
  // bottom — off-viewport on tall views). Switches to absolute
  // insetInline 16 / bottom 76 z30 ONLY during sheet scroll-lock.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    paddingInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    paddingInline: 0,
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
  toastHair: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // SHEETS — scrim z40 + sheet z41, absolute inside shell.
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
    gap: 4,
  },
  sheetTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  primaryBtn48: {
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
  primaryBtn48Muted: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  sheetRow44: {
    width: '100%',
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingBlock: 4,
    fontSize: 16,
  },
  sheetRowLabel: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    width: 88,
    flexShrink: 0,
  },
  sheetRowValue: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  noteText: {fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5},
  // ACTION SHEET — absolute insetInline 16 bottom 16 z41; two cards 8px
  // apart; options card + separate Cancel card.
  asWrap: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  asCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  asHeader: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    borderBottom: '1px solid var(--color-border)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  asRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  asRowDestructive: {color: 'var(--color-error)'},
  asRowHair: {height: 1, background: 'var(--color-border)'},
  asCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  // ANCHORED MENU — slipped-row ellipsis fallback; 12px radius, 44px rows.
  menuCard: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    minWidth: 220,
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
    paddingInline: 12,
    fontSize: 16,
  },
  // EMPTY STATE — maxWidth 280 centered, 64px muted circle + 28px icon.
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    display: 'grid',
    placeItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600},
  emptyBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 1.5,
  },
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checking aggregates.
// PLAN math: today 34 + 56 remaining = 90 ✓; Day 60 view '26 days left'
// (60 − 34 = 26); Day 90 'Starts Day 61 · in 27 days' (61 − 34 = 27).
// ---------------------------------------------------------------------------

const PLAN = {startLabel: 'May 18, 2026', today: 34, horizon: 90};

type PhaseId = 30 | 60 | 90;

const PHASES: Array<{id: PhaseId; name: string}> = [
  {id: 30, name: 'Land'},
  {id: 60, name: 'Integrate'},
  {id: 90, name: 'Own'},
];

function phaseName(id: PhaseId): string {
  return PHASES.find(phase => phase.id === id)?.name ?? '';
}

interface Task {
  id: string;
  title: string;
  homePhase: PhaseId; // dial-accounting segment
  currentPhase: PhaseId; // where the row renders
  done: boolean;
  withId: string | null; // stakeholder link
  dueDay: number;
  note?: string;
}

// TASKS: exactly 18. homePhase 30: 8 (6 done; t7 + t8 open-and-slipped
// with currentPhase 60). homePhase 60: 6 (2 done, 4 open). homePhase 90:
// 4 (0 done). CROSS-CHECKS: 8 + 6 + 4 = 18 total; done 6 + 2 + 0 = 8;
// open 10; global stat '8 of 18 tasks · 44%' (8/18 = 44.4% → 44). Day 60
// view rows: 2 slipped + 6 native = 8 → caption 'All 8 tasks in this
// view'. Day 90 ghost carries: 4 open Day-60 natives + 2 slipped = 6.
// t6's 52-char title is the 320px two-line/ellipsis stress fixture.
const TASKS: Task[] = [
  {id: 't1', title: 'Complete security and compliance onboarding', homePhase: 30, currentPhase: 30, done: true, withId: null, dueDay: 5},
  {id: 't2', title: 'Set up dev environment and repo access', homePhase: 30, currentPhase: 30, done: true, withId: null, dueDay: 3},
  {id: 't3', title: 'Meet all six platform team members 1:1', homePhase: 30, currentPhase: 30, done: true, withId: 'elena', dueDay: 10},
  {id: 't4', title: 'Read the platform architecture primer', homePhase: 30, currentPhase: 30, done: true, withId: null, dueDay: 12},
  {id: 't5', title: 'Shadow two on-call rotations', homePhase: 30, currentPhase: 30, done: true, withId: null, dueDay: 21},
  {id: 't6', title: 'Present 30-day findings to the platform leadership sync', homePhase: 30, currentPhase: 30, done: true, withId: 'priya', dueDay: 30},
  {
    id: 't7',
    title: 'Meet your skip-level manager',
    homePhase: 30,
    currentPhase: 60, // slipped — provenance chip renders in the Day 60 view
    done: false,
    withId: 'marcus',
    dueDay: 28,
    note: 'Marcus keeps Thursdays open after 3 PM. Priya suggested bringing the 30-day findings one-pager — he reads ahead.',
  },
  {
    id: 't8',
    title: 'Ship first production PR',
    homePhase: 30,
    currentPhase: 60, // slipped
    done: false,
    withId: null,
    dueDay: 25,
    note: 'The ingest-service config cleanup is scoped and reviewed — blocked on the deploy-pipeline migration landing first.',
  },
  {id: 't9', title: 'Own the deploy-pipeline migration ticket', homePhase: 60, currentPhase: 60, done: true, withId: null, dueDay: 40},
  {
    id: 't10',
    title: 'Draft the Q3 reliability proposal',
    homePhase: 60,
    currentPhase: 60,
    done: true,
    withId: 'priya',
    dueDay: 45,
    note: 'Draft shared in the team channel; Priya wants the error-budget section tightened before the leadership review.',
  },
  {id: 't11', title: 'Lead a weekly team standup solo', homePhase: 60, currentPhase: 60, done: false, withId: null, dueDay: 50},
  {id: 't12', title: 'Pair with Elena on the caching rewrite', homePhase: 60, currentPhase: 60, done: false, withId: 'elena', dueDay: 52},
  {id: 't13', title: 'Publish the runbook for the ingest service', homePhase: 60, currentPhase: 60, done: false, withId: null, dueDay: 55},
  {id: 't14', title: 'Take the pager for a full rotation', homePhase: 60, currentPhase: 60, done: false, withId: null, dueDay: 60},
  {id: 't15', title: 'Propose your first roadmap item', homePhase: 90, currentPhase: 90, done: false, withId: null, dueDay: 75},
  {id: 't16', title: 'Run the platform quarterly review', homePhase: 90, currentPhase: 90, done: false, withId: 'priya', dueDay: 80},
  {id: 't17', title: "Mentor the next new hire's first week", homePhase: 90, currentPhase: 90, done: false, withId: 'elena', dueDay: 85},
  {id: 't18', title: 'Write your 90-day retrospective', homePhase: 90, currentPhase: 90, done: false, withId: null, dueDay: 90},
];

type DotStatus = 'held' | 'missed' | 'upcoming';

interface CadenceDot {
  phase: PhaseId;
  status: DotStatus;
}

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  cadence: string;
  dots: CadenceDot[]; // exactly 6 per stakeholder
}

// DOT ARITHMETIC (spec, restated): total dots 3×6 = 18. Per phase 30:
// 4 + 2 + 4 = 10 dots, held 3 + 0 + 4 = 7 → inner sub-arc 7/10 = 70%.
// Phase 60: 2 + 2 + 2 = 6 dots, held 1 + 0 + 0 = 1 → 1/6 ≈ 16.7%.
// Phase 90: 0 + 2 + 0 = 2 dots, held 0 → 0%. Total held 7 + 1 + 0 = 8 →
// People header '8 of 18 1:1s held'. Strip captions: Priya '4 held ·
// 1 missed' (3 + 1 held ✓), Marcus '0 held · 2 missed' (the all-missed
// 0%-sub-arc stress — its --color-border track must still render), Elena
// '4 held · 1 missed'. Completing t7 flips marcus.dots[2] 60:upcoming →
// 60:held (see completeTask).
const STAKEHOLDERS: Stakeholder[] = [
  {
    id: 'priya',
    name: 'Priya Raghavan',
    role: 'Manager',
    cadence: 'Weekly 1:1 · Mondays',
    dots: [
      {phase: 30, status: 'held'},
      {phase: 30, status: 'held'},
      {phase: 30, status: 'missed'},
      {phase: 30, status: 'held'},
      {phase: 60, status: 'held'},
      {phase: 60, status: 'upcoming'},
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus Bell',
    role: 'Skip-level',
    cadence: 'Biweekly · Thursdays',
    dots: [
      {phase: 30, status: 'missed'},
      {phase: 30, status: 'missed'},
      {phase: 60, status: 'upcoming'},
      {phase: 60, status: 'upcoming'},
      {phase: 90, status: 'upcoming'},
      {phase: 90, status: 'upcoming'},
    ],
  },
  {
    id: 'elena',
    name: 'Elena Kwon',
    role: 'Peer buddy',
    cadence: 'Weekly coffee · Fridays',
    dots: [
      {phase: 30, status: 'held'},
      {phase: 30, status: 'held'},
      {phase: 30, status: 'held'},
      {phase: 30, status: 'held'},
      {phase: 60, status: 'missed'},
      {phase: 60, status: 'upcoming'},
    ],
  },
];

interface Win {
  id: string;
  title: string;
  phase: PhaseId;
  weekLabel: string;
}

// WINS: 5 = 3 tagged Day 30 + 2 tagged Day 60 → Wins header '5 logged ·
// 3 in Day 30 · 2 in Day 60' (3 + 2 = 5 ✓). Accepting the suggested win
// appends w6 'Day 60 · Week 5' → '6 logged · 3 in Day 30 · 3 in Day 60'
// (3 + 3 = 6 ✓). Day 90 has ZERO wins — the filtered TRUE-empty state.
const WINS: Win[] = [
  {id: 'w1', title: 'First PR reviewed and merged', phase: 30, weekLabel: 'Day 30 · Week 2'},
  {id: 'w2', title: 'Caught a real page on the on-call shadow', phase: 30, weekLabel: 'Day 30 · Week 3'},
  {id: 'w3', title: 'Presented 30-day findings without notes', phase: 30, weekLabel: 'Day 30 · Week 4'},
  {id: 'w4', title: 'Deploy-pipeline migration shipped clean', phase: 60, weekLabel: 'Day 60 · Week 5'},
  {id: 'w5', title: 'Q3 reliability proposal drafted', phase: 60, weekLabel: 'Day 60 · Week 5'},
];

const SUGGESTED_WIN_TITLE = 'Completed onboarding circuit';

// ---------------------------------------------------------------------------
// DERIVED COUNTERS — every aggregate recomputes from rows in render.
// ---------------------------------------------------------------------------

/** done/total for tasks whose homePhase = phase (dial outer arcs). */
function taskCounts(tasks: Task[], phase: PhaseId): {done: number; total: number} {
  const home = tasks.filter(task => task.homePhase === phase);
  return {done: home.filter(task => task.done).length, total: home.length};
}

/** held/total 1:1 dots tagged to a phase (dial inner sub-arcs). */
function dotCounts(stakeholders: Stakeholder[], phase: PhaseId): {held: number; total: number} {
  let held = 0;
  let total = 0;
  for (const stakeholder of stakeholders) {
    for (const dot of stakeholder.dots) {
      if (dot.phase !== phase) continue;
      total += 1;
      if (dot.status === 'held') held += 1;
    }
  }
  return {held, total};
}

/** Per-stakeholder caption: '4 held · 1 missed'. */
function stripCaption(dots: CadenceDot[]): string {
  const held = dots.filter(dot => dot.status === 'held').length;
  const missed = dots.filter(dot => dot.status === 'missed').length;
  return \`\${held} held · \${missed} missed\`;
}

// ---------------------------------------------------------------------------
// PHASE DIAL GEOMETRY — three segments of 104° separated by three 16°
// gaps: 3×104 + 3×16 = 360° exactly. Angles measured with 0° at 12
// o'clock, clockwise positive; segment order clockwise: 30 starts at +8°
// (half-gap), 60 at +128°, 90 at +248°. Outer task arc r=15 (strokeWidth
// 3.5), inner relationship sub-arc r=10 (strokeWidth 2), inside a 36px
// viewBox (center 18) in a 44×44 button.
// ---------------------------------------------------------------------------

const SEG_SWEEP = 104;
const SEG_STARTS: Record<PhaseId, number> = {30: 8, 60: 128, 90: 248};
const DIAL_CENTER = 18;

function dialPoint(radius: number, deg: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {
    x: DIAL_CENTER + radius * Math.sin(rad),
    y: DIAL_CENTER - radius * Math.cos(rad),
  };
}

function dialArc(radius: number, fromDeg: number, toDeg: number): string {
  const from = dialPoint(radius, fromDeg);
  const to = dialPoint(radius, toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return \`M \${from.x.toFixed(2)} \${from.y.toFixed(2)} A \${radius} \${radius} 0 \${large} 1 \${to.x.toFixed(2)} \${to.y.toFixed(2)}\`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — usePlanState: one entities object, one update(id,
// patch); multi-slice actions go through setEntities in a single write.
// Undo is snapshot-exact: each reversible mutation stows the prior data
// slices; Undo restores them atomically (rows return to their original
// positions, selection and scroll untouched).
// ---------------------------------------------------------------------------

type TabId = 'plan' | 'people' | 'wins';

interface DataSnapshot {
  tasks: Task[];
  stakeholders: Stakeholder[];
  wins: Win[];
  suggestedWin: {title: string; phase: PhaseId} | null;
}

interface ScreenByTab {
  plan: {phaseInView: PhaseId; scrollTop: number};
  people: {scrollTop: number};
  wins: {filter: PhaseId | null; scrollTop: number};
}

interface UiState {
  activeTab: TabId;
  screenByTab: ScreenByTab;
  sheet: null | {kind: 'task' | 'person'; id: string; detent: 'medium' | 'large'};
  actionSheet: null | {kind: 'overflow'} | {kind: 'taskDelete'; id: string};
  edit: {on: boolean; ids: string[]};
  openSwipeId: string | null;
  rowMenuId: string | null;
  toast: null | {seq: number; msg: string; snapshot: DataSnapshot | null};
}

interface PlanEntities {
  tasks: Task[];
  stakeholders: Stakeholder[];
  wins: Win[];
  suggestedWin: {title: string; phase: PhaseId} | null;
  ui: UiState;
}

const INITIAL_ENTITIES: PlanEntities = {
  tasks: TASKS,
  stakeholders: STAKEHOLDERS,
  wins: WINS,
  suggestedWin: null, // badge hidden at rest
  ui: {
    activeTab: 'plan',
    screenByTab: {
      plan: {phaseInView: 60, scrollTop: 0},
      people: {scrollTop: 0},
      wins: {filter: null, scrollTop: 0},
    },
    sheet: null,
    actionSheet: null,
    edit: {on: false, ids: []},
    openSwipeId: null,
    rowMenuId: null,
    toast: null,
  },
};

function usePlanState() {
  const [entities, setEntities] = useState<PlanEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof PlanEntities>(id: K, patch: Partial<PlanEntities[K]>) => {
      setEntities(prev => ({...prev, [id]: {...(prev[id] as object), ...patch} as PlanEntities[K]}));
    },
    [],
  );
  return {entities, update, setEntities};
}

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
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

/** Nearest scrollable ancestor of the shell (the demo's .preview-wrap owns
 * page scroll) — used for per-tab scrollTop persistence and the
 * active-tab-re-tap pop-to-root. */
function getScroller(from: HTMLElement | null): HTMLElement | null {
  let node = from?.parentElement ?? null;
  while (node != null) {
    const overflowY = window.getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
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
// RAMPLINE MARK — three ramp polylines of increasing slope converging to a
// 6px flag at top-right. Stroke uses --color-text-primary (var(--color-text)
// does not exist in this token set); the flag fill is BRAND_ACCENT.
// ---------------------------------------------------------------------------

function RamplineMark() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      {/* Ramps rising ~15° / 30° / 45° left-to-right. */}
      <polyline points="3,23 25,17.5" stroke="var(--color-text-primary)" strokeWidth={2} strokeLinecap="round" />
      <polyline points="3,18 25,5.6" stroke="var(--color-text-primary)" strokeWidth={2} strokeLinecap="round" opacity={0.62} />
      <polyline points="3,13 13,3" stroke="var(--color-text-primary)" strokeWidth={2} strokeLinecap="round" opacity={0.38} />
      {/* 6px flag triangle at the steepest ramp's summit. */}
      <path d="M19 3.5 L25 6.5 L19 9.5 Z" fill={BRAND_ACCENT} />
      <path d="M19 3.5 v8" stroke={BRAND_ACCENT} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PHASE DIAL — 36px SVG inside a 44×44 navBar button. Outer task arcs fill
// doneCount/totalCount per homePhase segment (30: 6/8 = 75% of its 104°;
// 60: 2/6 ≈ 33.3%; 90: 0/4 = 0%); inner sub-arcs fill heldDots/totalDots
// (30: 7/10 = 70%; 60: 1/6 ≈ 16.7%; 90: 0/2 = 0% — the 0% track still
// renders in --color-border, never disappears). Active segment gets a
// 1.5px outer ring tick at r=17.25; the locked past segment (30, once the
// dial has left it) renders a small filled endpoint dot. Arcs aria-hidden;
// the button's aria-label carries the data. Tap advances 30→60→90→30;
// ArrowLeft/Right move phase while focused; direct access lives in the
// overflow actionSheet's 'Go to Day X' rows (the non-gesture path).
// ---------------------------------------------------------------------------

interface PhaseDialProps {
  tasks: Task[];
  stakeholders: Stakeholder[];
  phaseInView: PhaseId;
  onAdvance: () => void;
  onArrow: (dir: -1 | 1) => void;
}

function PhaseDial({tasks, stakeholders, phaseInView, onAdvance, onArrow}: PhaseDialProps) {
  const nextPhase: PhaseId = phaseInView === 30 ? 60 : phaseInView === 60 ? 90 : 30;
  const inView = taskCounts(tasks, phaseInView);
  const label = \`Phase dial: viewing Day \${phaseInView} of \${PLAN.horizon}, \${inView.done} of \${inView.total} tasks done. Activate to view Day \${nextPhase}\`;
  return (
    <button
      type="button"
      className="rl-btn rl-focusable"
      style={styles.iconBtn}
      aria-label={label}
      onClick={onAdvance}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          onArrow(1);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          onArrow(-1);
        }
      }}>
      <svg width={36} height={36} viewBox="0 0 36 36" fill="none" aria-hidden>
        {PHASES.map(phase => {
          const start = SEG_STARTS[phase.id];
          const end = start + SEG_SWEEP;
          const outer = taskCounts(tasks, phase.id);
          const inner = dotCounts(stakeholders, phase.id);
          const outerFrac = outer.total > 0 ? outer.done / outer.total : 0;
          const innerFrac = inner.total > 0 ? inner.held / inner.total : 0;
          const outerFillEnd = start + outerFrac * SEG_SWEEP;
          const innerFillEnd = start + innerFrac * SEG_SWEEP;
          const isActive = phase.id === phaseInView;
          // Segment 30 is the locked past segment once the dial has left
          // it (today is Day 34 — its window ended at Day 30).
          const isLockedPast = phase.id === 30 && phaseInView !== 30;
          const dotAt = dialPoint(15, outerFillEnd);
          return (
            <g key={phase.id}>
              {/* Outer track + fill (r=15, sw 3.5). */}
              <path d={dialArc(15, start, end)} stroke="var(--color-border)" strokeWidth={3.5} strokeLinecap="butt" />
              {outerFrac > 0 ? (
                <path d={dialArc(15, start, outerFillEnd)} stroke={BRAND_ACCENT} strokeWidth={3.5} strokeLinecap="butt" className="rl-fade" />
              ) : null}
              {/* Inner sub-arc track + fill (r=10, sw 2). */}
              <path d={dialArc(10, start, end)} stroke="var(--color-border)" strokeWidth={2} strokeLinecap="butt" />
              {innerFrac > 0 ? (
                <path d={dialArc(10, start, innerFillEnd)} stroke={DOT_HELD} strokeWidth={2} strokeLinecap="butt" className="rl-fade" />
              ) : null}
              {/* Active-in-view 1.5px outer ring tick. */}
              {isActive ? (
                <path d={dialArc(17.25, start, end)} stroke={BRAND_ACCENT} strokeWidth={1.5} strokeLinecap="round" opacity={0.9} />
              ) : null}
              {/* Locked-past endpoint dot at the fill boundary. */}
              {isLockedPast ? <circle cx={dotAt.x} cy={dotAt.y} r={2} fill={BRAND_ACCENT} /> : null}
            </g>
          );
        })}
        <text
          x={18}
          y={18}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={600}
          fill="var(--color-text-primary)"
          style={{fontVariantNumeric: 'tabular-nums'}}>
          {phaseInView}
        </text>
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// CADENCE DOT STRIP — 6 dots × 10px with 6px gaps = 90px fixed block.
// Dots are aria-hidden decoration; the adjacent 11px caption is the
// accessible text, and the People header key row is the legend.
// ---------------------------------------------------------------------------

function CadenceDotStrip({dots}: {dots: CadenceDot[]}) {
  return (
    <span style={styles.dotStrip} aria-hidden>
      {dots.map((dot, index) => (
        <span
          key={index}
          style={dot.status === 'held' ? styles.dotHeld : dot.status === 'missed' ? styles.dotMissed : styles.dotUpcoming}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// SLIPPED CARRY ROW — 72px, 3px amber inset rail, provenance chip line.
// Swipe-reveal: −72 'Done' brand block, −144 'Re-home' block (two actions,
// snap open at −144, one row open at a time) + the MANDATORY 44×44
// ellipsis fallback opening the same actions as an anchored menu. The
// check circle and row body are sibling buttons (never nested); swipe and
// menus are disabled during edit mode (the page renders selection rows
// instead of this component there).
// ---------------------------------------------------------------------------

interface SlippedCarryRowProps {
  task: Task;
  chipText: string;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  menuActions: Array<{id: string; label: string; onPick: () => void}>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onToggleDone: () => void;
  onRowTap: (opener: HTMLElement) => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onSwipeDone: () => void;
  onSwipeRehome: () => void;
}

function SlippedCarryRow({
  task,
  chipText,
  isSwipeOpen,
  isMenuOpen,
  isLast,
  reducedMotion,
  menuRef,
  menuActions,
  onSwipeOpen,
  onSwipeClose,
  onToggleDone,
  onRowTap,
  onToggleMenu,
  onSwipeDone,
  onSwipeRehome,
}: SlippedCarryRowProps) {
  // Transient drag delta only — open/closed lives in the state owner.
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const base = isSwipeOpen ? -144 : 0;
  const offset = dragX != null ? Math.max(-144, Math.min(0, base + dragX)) : base;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    setDragX(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - startXRef.current;
    if (Math.abs(dx) > 8) movedRef.current = true;
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (dragX == null) return;
    const settled = Math.max(-144, Math.min(0, base + dragX));
    setDragX(null);
    if (movedRef.current) {
      if (settled < -72) onSwipeOpen();
      else onSwipeClose();
    }
  };
  const guardClick = (handler: (opener: HTMLElement) => void) => (event: {currentTarget: HTMLElement}) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    handler(event.currentTarget);
  };

  return (
    <div style={styles.slippedOuter}>
      <div style={styles.swipeClip}>
        <div style={styles.swipeActions}>
          <button
            type="button"
            className="rl-btn"
            style={styles.swipeDone}
            tabIndex={isSwipeOpen ? 0 : -1}
            aria-hidden={!isSwipeOpen}
            onClick={onSwipeDone}>
            <Icon icon={CheckIcon} size="sm" color="inherit" />
            Done
          </button>
          <button
            type="button"
            className="rl-btn"
            style={styles.swipeRehome}
            tabIndex={isSwipeOpen ? 0 : -1}
            aria-hidden={!isSwipeOpen}
            onClick={onSwipeRehome}>
            Re-home
          </button>
        </div>
        <div
          style={{
            ...styles.slippedContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 200ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="rl-btn rl-focusable"
            style={styles.checkHit}
            role="checkbox"
            aria-checked={task.done}
            aria-label={task.title}
            onClick={guardClick(() => onToggleDone())}>
            <span style={task.done ? styles.circleOn : styles.circleOff} aria-hidden>
              {task.done ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
            </span>
          </button>
          <button
            type="button"
            className="rl-btn rl-focusable"
            style={styles.slippedBody}
            aria-label={\`\${task.title}, \${chipText.toLowerCase()}, due Day \${task.dueDay} — open details\`}
            onClick={guardClick(onRowTap)}>
            <span style={styles.rowText}>
              <span style={{...styles.rowTitle, ...(task.done ? styles.rowTitleDone : null)}}>{task.title}</span>
              <span style={styles.metaLine}>
                <span style={styles.carryChip}>{chipText}</span>
                <span style={styles.rowMeta}>due Day {task.dueDay}</span>
              </span>
            </span>
          </button>
          <button
            type="button"
            className="rl-btn rl-focusable"
            style={styles.iconBtn}
            aria-label={\`Actions for \${task.title}\`}
            aria-expanded={isMenuOpen}
            onClick={guardClick(onToggleMenu)}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Actions for \${task.title}\`}
          style={{...styles.menuCard, top: 60}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          {menuActions.map((action, index) => (
            <div key={action.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <button type="button" role="menuitem" className="rl-btn rl-focusable" style={styles.menuRow} onClick={action.onPick}>
                <span style={{flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{action.label}</span>
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDivider60} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — two detents (medium 55% / large calc(100% − 56px)), 24px
// grabber zone with a 36×5 grabber-as-button, 52px header, inner
// overflowY auto body (the one legal inner scroller), focus-trapped
// dialog; focus enters with preventScroll:true (amendment: plain .focus()
// scroll-reveals the animating sheet inside the locked column).
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  headerAction?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, headerAction, footer, children}: SheetProps) {
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
      className="rl-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease',
      }}>
      <button
        type="button"
        className="rl-btn rl-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onPointerDown={onGrabberPointerDown}
        onPointerMove={onGrabberPointerMove}
        onPointerUp={onGrabberPointerUp}
        onClick={onGrabberClick}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        {headerAction ?? <span aria-hidden />}
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button type="button" className="rl-btn rl-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      {footer != null ? <div style={styles.sheetFooter}>{footer}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TAB_ORDER: TabId[] = ['plan', 'people', 'wins'];
const PHASE_ORDER: PhaseId[] = [30, 60, 90];

export default function MobileFirst90DaysPlanTemplate() {
  // Desktop-stage decision: ≥720px of WRAPPER width → centered 430px
  // phone column; viewport query is the first-frame fallback only.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {entities, update, setEntities} = usePlanState();
  const {tasks, stakeholders, wins, suggestedWin, ui} = entities;
  const phaseInView = ui.screenByTab.plan.phaseInView;

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const asOpenerRef = useRef<HTMLElement | null>(null);
  const asCancelRef = useRef<HTMLButtonElement | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);
  const rowMenuOpenerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);
  const phaseDirRef = useRef<1 | -1>(1);

  // Scroll lock: while a sheet OR the actionSheet is open (both occupy
  // the overlay layer), shell locks and the toastDock goes absolute.
  const locked = ui.sheet != null || ui.actionSheet != null;

  // Derived aggregates — recomputed from rows every render. Global:
  // done 8 of 18 = 44.4% → 44; after the signature action 9/18 = 50%.
  const doneTotal = tasks.filter(task => task.done).length;
  const taskTotal = tasks.length;
  const donePct = taskTotal > 0 ? Math.round((doneTotal / taskTotal) * 100) : 0;
  const heldDots = stakeholders.reduce((sum, s) => sum + s.dots.filter(dot => dot.status === 'held').length, 0);
  const totalDots = stakeholders.reduce((sum, s) => sum + s.dots.length, 0);
  // NOTE the deliberate coincidence: completing t7 flips one task
  // (8→9 of 18 tasks) AND one dot (8→9 of 18 1:1s) — both read 9/18.
  // That is two independent counters agreeing, not a shared source;
  // don't 'fix' one to derive from the other.

  const viewCounts = taskCounts(tasks, phaseInView);
  const slippedInView = tasks.filter(task => task.currentPhase === phaseInView && task.homePhase !== phaseInView);
  const nativeInView = tasks.filter(task => task.currentPhase === phaseInView && task.homePhase === phaseInView);
  const nativeDone = nativeInView.filter(task => task.done).length;
  // Day 90 ghost carries: DERIVED preview of every open earlier task —
  // 4 open Day-60 natives + 2 slipped-30 = 6 at rest (never a mutation).
  const ghostCarries = tasks.filter(task => !task.done && task.currentPhase !== 90);
  const home30 = tasks.filter(task => task.homePhase === 30);

  const winsFilter = ui.screenByTab.wins.filter;
  const visibleWins = winsFilter == null ? wins : wins.filter(win => win.phase === winsFilter);
  const winsByPhase = (phase: PhaseId) => wins.filter(win => win.phase === phase).length;

  const sheetTask = ui.sheet?.kind === 'task' ? tasks.find(task => task.id === ui.sheet?.id) ?? null : null;
  const sheetPerson = ui.sheet?.kind === 'person' ? stakeholders.find(s => s.id === ui.sheet?.id) ?? null : null;
  const actionSheetState = ui.actionSheet;
  const deleteTaskTarget =
    actionSheetState?.kind === 'taskDelete' ? tasks.find(task => task.id === actionSheetState.id) ?? null : null;

  // TOASTS — one region, one toast at a time, NO auto-dismiss timers; a
  // new mutation replaces the old (its undo window ends).
  const toastPatch = (msg: string, snapshot: DataSnapshot | null) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, msg, snapshot}};
  };
  const snapshotOf = (prev: PlanEntities): DataSnapshot => ({
    tasks: prev.tasks,
    stakeholders: prev.stakeholders,
    wins: prev.wins,
    suggestedWin: prev.suggestedWin,
  });
  const undoToast = () => {
    setEntities(prev => {
      const snapshot = prev.ui.toast?.snapshot;
      if (snapshot == null) return prev;
      return {
        ...prev,
        ...snapshot,
        ui: {...prev.ui, edit: {on: prev.ui.edit.on, ids: []}, ...toastPatch('Restored', null)},
      };
    });
  };

  // FOCUS EFFECTS — preventScroll on every overlay entry (amendment).
  useEffect(() => {
    if (ui.sheet != null) sheetRef.current?.focus({preventScroll: true});
  }, [ui.sheet?.kind, ui.sheet?.id, ui.sheet]);
  useEffect(() => {
    // Action sheet: first focus lands on Cancel (safe default).
    if (ui.actionSheet != null) asCancelRef.current?.focus({preventScroll: true});
  }, [ui.actionSheet]);
  useEffect(() => {
    if (ui.rowMenuId != null) rowMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [ui.rowMenuId]);

  // ESCAPE closes the TOPMOST overlay only: anchored row menu >
  // actionSheet > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.rowMenuId != null) {
        update('ui', {rowMenuId: null});
        rowMenuOpenerRef.current?.focus();
      } else if (ui.actionSheet != null) {
        update('ui', {actionSheet: null});
        asOpenerRef.current?.focus();
      } else if (ui.sheet != null) {
        update('ui', {sheet: null});
        sheetOpenerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ui.rowMenuId, ui.actionSheet, ui.sheet, update]);

  // PER-TAB SCROLL PERSISTENCE — restore the entering tab's saved
  // scrollTop after the tab content commits.
  useEffect(() => {
    const scroller = getScroller(shellRef.current);
    if (scroller != null) {
      scroller.scrollTop = entities.ui.screenByTab[entities.ui.activeTab].scrollTop;
    }
    // Only when the active tab changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.activeTab]);

  // NAVIGATION -----------------------------------------------------------

  const announcePhase = (phase: PhaseId) => {
    const counts = taskCounts(tasks, phase);
    return toastPatch(\`Viewing Day \${phase} · \${counts.done} of \${counts.total} done\`, null);
  };

  const setPhase = (phase: PhaseId) => {
    if (phase === phaseInView) return;
    phaseDirRef.current = PHASE_ORDER.indexOf(phase) > PHASE_ORDER.indexOf(phaseInView) ? 1 : -1;
    setEntities(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        screenByTab: {...prev.ui.screenByTab, plan: {...prev.ui.screenByTab.plan, phaseInView: phase}},
        openSwipeId: null,
        rowMenuId: null,
        ...announcePhase(phase),
      },
    }));
  };
  const advancePhase = () => setPhase(phaseInView === 30 ? 60 : phaseInView === 60 ? 90 : 30);
  const arrowPhase = (dir: -1 | 1) => {
    const index = PHASE_ORDER.indexOf(phaseInView);
    setPhase(PHASE_ORDER[(index + dir + PHASE_ORDER.length) % PHASE_ORDER.length]);
  };

  const selectTab = (tab: TabId) => {
    const scroller = getScroller(shellRef.current);
    if (tab === ui.activeTab) {
      // THE ONE LEGAL RESET: re-tapping the active tab pops to root +
      // scrollTop 0 (works from the keyboard too).
      setEntities(prev => ({
        ...prev,
        ui: {...prev.ui, sheet: null, actionSheet: null, openSwipeId: null, rowMenuId: null},
      }));
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    const savedTop = scroller?.scrollTop ?? 0;
    setEntities(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        activeTab: tab,
        // Overlays belong to their moment — they close; the toast stays.
        sheet: null,
        actionSheet: null,
        openSwipeId: null,
        rowMenuId: null,
        screenByTab: {
          ...prev.ui.screenByTab,
          [prev.ui.activeTab]: {...prev.ui.screenByTab[prev.ui.activeTab], scrollTop: savedTop},
        },
      },
    }));
  };
  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const index = TAB_ORDER.indexOf(ui.activeTab);
    const dir = event.key === 'ArrowRight' ? 1 : -1;
    selectTab(TAB_ORDER[(index + dir + TAB_ORDER.length) % TAB_ORDER.length]);
  };
  const onMarkTap = () => {
    if (ui.activeTab === 'plan') {
      selectTab('plan'); // pop-to-root reset
    } else {
      selectTab('plan');
    }
  };

  // SHEET / MENU LIFECYCLE -------------------------------------------------

  const openTaskSheet = (id: string, opener: HTMLElement) => {
    if (ui.edit.on) return; // sheets disabled while editing
    sheetOpenerRef.current = opener;
    update('ui', {sheet: {kind: 'task', id, detent: 'medium'}, openSwipeId: null, rowMenuId: null});
  };
  const openPersonSheet = (id: string, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    update('ui', {sheet: {kind: 'person', id, detent: 'medium'}, openSwipeId: null, rowMenuId: null});
  };
  const closeSheet = () => {
    update('ui', {sheet: null});
    sheetOpenerRef.current?.focus();
  };
  const openOverflow = (opener: HTMLElement) => {
    asOpenerRef.current = opener;
    update('ui', {actionSheet: {kind: 'overflow'}, openSwipeId: null, rowMenuId: null});
  };
  const closeActionSheet = () => {
    update('ui', {actionSheet: null});
    asOpenerRef.current?.focus();
  };

  // MUTATIONS — execute immediately, Undo restores the exact prior state.

  // (2) SIGNATURE CHAIN — completing t7 in ONE write: t7.done = true →
  // dial 30-segment 75% → 87.5% (6+1 = 7 done of 8); marcus.dots[2]
  // flips 60:upcoming → 60:held (People strip '0 held · 2 missed' →
  // '1 held · 2 missed'; dial 60 inner sub-arc 1/6 → 2/6 = 33.3%);
  // suggestedWin minted → Wins badge '1'; global stat 8/18 = 44% →
  // 9/18 = 50%. Undo reverses every field of the one action atomically.
  const toggleTaskDone = (id: string) => {
    setEntities(prev => {
      const task = prev.tasks.find(item => item.id === id);
      if (task == null) return prev;
      const snapshot = snapshotOf(prev);
      const nextDone = !task.done;
      let nextStakeholders = prev.stakeholders;
      let nextSuggested = prev.suggestedWin;
      if (id === 't7' && nextDone) {
        nextStakeholders = prev.stakeholders.map(s =>
          s.id === 'marcus'
            ? {...s, dots: s.dots.map((dot, index) => (index === 2 ? {...dot, status: 'held' as DotStatus} : dot))}
            : s,
        );
        nextSuggested = {title: SUGGESTED_WIN_TITLE, phase: 60};
      }
      return {
        ...prev,
        tasks: prev.tasks.map(item => (item.id === id ? {...item, done: nextDone} : item)),
        stakeholders: nextStakeholders,
        suggestedWin: nextSuggested,
        ui: {
          ...prev.ui,
          sheet: null,
          openSwipeId: null,
          rowMenuId: null,
          ...toastPatch(nextDone ? 'Task done · Undo' : 'Marked not done · Undo', snapshot),
        },
      };
    });
  };

  // (3) SLIP RE-HOMING — formal adoption: homePhase ← currentPhase,
  // chip + rail clear. Dial accounting moves between segments: re-homing
  // t7 to 60 leaves segment 30 at 6 done of 7 home = 85.7% (8 − 1 = 7)
  // and segment 60 at 2 done of 7 home = 28.6% (6 + 1 = 7).
  const rehomeTask = (id: string) => {
    setEntities(prev => {
      const task = prev.tasks.find(item => item.id === id);
      if (task == null || task.homePhase === task.currentPhase) return prev;
      const snapshot = snapshotOf(prev);
      const toPhase = task.currentPhase;
      return {
        ...prev,
        tasks: prev.tasks.map(item => (item.id === id ? {...item, homePhase: toPhase} : item)),
        ui: {...prev.ui, openSwipeId: null, rowMenuId: null, ...toastPatch(\`Re-homed to Day \${toPhase} · Undo\`, snapshot)},
      };
    });
  };
  const sendBackTask = (id: string) => {
    setEntities(prev => {
      const task = prev.tasks.find(item => item.id === id);
      if (task == null) return prev;
      const snapshot = snapshotOf(prev);
      return {
        ...prev,
        tasks: prev.tasks.map(item => (item.id === id ? {...item, currentPhase: item.homePhase} : item)),
        ui: {...prev.ui, openSwipeId: null, rowMenuId: null, ...toastPatch(\`Sent back to Day \${task.homePhase} · Undo\`, snapshot)},
      };
    });
  };
  // Day 90 ghost 'Re-home here': formally mutates currentPhase → 90 (the
  // spec's skeleton wording); the task leaves the Day 60 view and the
  // ghost list and renders as a Day 90 slipped-provenance row.
  const carryTo90 = (id: string) => {
    setEntities(prev => {
      const snapshot = snapshotOf(prev);
      return {
        ...prev,
        tasks: prev.tasks.map(item => (item.id === id ? {...item, currentPhase: 90 as PhaseId} : item)),
        ui: {...prev.ui, ...toastPatch('Moved to Day 90 · Undo', snapshot)},
      };
    });
  };
  const deleteTask = (id: string) => {
    setEntities(prev => {
      const snapshot = snapshotOf(prev);
      return {
        ...prev,
        tasks: prev.tasks.filter(item => item.id !== id),
        ui: {...prev.ui, sheet: null, actionSheet: null, ...toastPatch('Task deleted · Undo', snapshot)},
      };
    });
    sheetOpenerRef.current?.focus();
  };

  const acceptSuggestedWin = () => {
    setEntities(prev => {
      if (prev.suggestedWin == null) return prev;
      const snapshot = snapshotOf(prev);
      // Day 34 sits in Week 5 (34 / 7 = 4.86 → Week 5).
      const win: Win = {id: \`w\${prev.wins.length + 1}\`, title: prev.suggestedWin.title, phase: prev.suggestedWin.phase, weekLabel: 'Day 60 · Week 5'};
      return {
        ...prev,
        wins: [...prev.wins, win],
        suggestedWin: null,
        ui: {...prev.ui, ...toastPatch('Added to wins · Undo', snapshot)},
      };
    });
  };
  const dismissSuggestedWin = () => {
    setEntities(prev => {
      if (prev.suggestedWin == null) return prev;
      const snapshot = snapshotOf(prev);
      return {...prev, suggestedWin: null, ui: {...prev.ui, ...toastPatch('Suggestion dismissed · Undo', snapshot)}};
    });
  };

  // (4) EDIT MODE — entry ONLY via the overflow actionSheet 'Edit tasks'
  // row; navBar flips atomically, editToolbar replaces the tabBar, swipe
  // and sheets are disabled, Moves/Deletes execute + Undo + exit.
  const enterEdit = () => {
    update('ui', {actionSheet: null, edit: {on: true, ids: []}, sheet: null, openSwipeId: null, rowMenuId: null});
  };
  const exitEdit = () => update('ui', {edit: {on: false, ids: []}});
  const toggleSelect = (id: string) => {
    const ids = ui.edit.ids.includes(id) ? ui.edit.ids.filter(item => item !== id) : [...ui.edit.ids, id];
    update('ui', {edit: {on: true, ids}});
  };
  const editMove = (toPhase: PhaseId) => {
    const count = ui.edit.ids.length;
    if (count === 0) return;
    setEntities(prev => {
      const snapshot = snapshotOf(prev);
      return {
        ...prev,
        tasks: prev.tasks.map(item =>
          prev.ui.edit.ids.includes(item.id) ? {...item, homePhase: toPhase, currentPhase: toPhase} : item,
        ),
        ui: {
          ...prev.ui,
          edit: {on: false, ids: []},
          ...toastPatch(\`Moved \${count} \${count === 1 ? 'task' : 'tasks'} to Day \${toPhase} · Undo\`, snapshot),
        },
      };
    });
  };
  const editDelete = () => {
    const count = ui.edit.ids.length;
    if (count === 0) return;
    setEntities(prev => {
      const snapshot = snapshotOf(prev);
      return {
        ...prev,
        tasks: prev.tasks.filter(item => !prev.ui.edit.ids.includes(item.id)),
        ui: {
          ...prev.ui,
          edit: {on: false, ids: []},
          ...toastPatch(\`Deleted \${count} \${count === 1 ? 'task' : 'tasks'} · Undo\`, snapshot),
        },
      };
    });
  };

  // Task-sheet stakeholder link: switch to People AND open that
  // stakeholder (screenByTab respected — plan scroll already saved by
  // the tab-switch path baked in here).
  const jumpToStakeholder = (stakeholderId: string) => {
    const scroller = getScroller(shellRef.current);
    const savedTop = scroller?.scrollTop ?? 0;
    setEntities(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        activeTab: 'people',
        sheet: {kind: 'person', id: stakeholderId, detent: 'medium'},
        actionSheet: null,
        openSwipeId: null,
        rowMenuId: null,
        screenByTab:
          prev.ui.activeTab === 'people'
            ? prev.ui.screenByTab
            : {
                ...prev.ui.screenByTab,
                [prev.ui.activeTab]: {...prev.ui.screenByTab[prev.ui.activeTab], scrollTop: savedTop},
              },
      },
    }));
  };

  // RENDER HELPERS ---------------------------------------------------------

  const renderCheckCircle = (task: Task) => (
    <button
      type="button"
      className="rl-btn rl-focusable"
      style={styles.checkHit}
      role="checkbox"
      aria-checked={task.done}
      aria-label={task.title}
      onClick={() => toggleTaskDone(task.id)}>
      <span style={task.done ? styles.circleOn : styles.circleOff} aria-hidden>
        {task.done ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
      </span>
    </button>
  );

  const taskMeta = (task: Task) => {
    const withName = task.withId != null ? stakeholders.find(s => s.id === task.withId)?.name.split(' ')[0] : null;
    return withName != null ? \`With \${withName} · due Day \${task.dueDay}\` : \`Due Day \${task.dueDay}\`;
  };

  const renderTaskRow = (task: Task, isLast: boolean) => (
    <div key={task.id}>
      <div style={styles.taskRow}>
        {renderCheckCircle(task)}
        <button
          type="button"
          className="rl-btn rl-focusable"
          style={styles.rowBody}
          aria-label={\`\${task.title}, \${taskMeta(task).toLowerCase()} — open details\`}
          onClick={event => openTaskSheet(task.id, event.currentTarget)}>
          <span style={styles.rowText}>
            <span style={{...styles.rowTitle, ...(task.done ? styles.rowTitleDone : null)}}>{task.title}</span>
            <span style={styles.rowMeta}>{taskMeta(task)}</span>
          </span>
        </button>
      </div>
      {isLast ? null : <div style={styles.rowDivider60} />}
    </div>
  );

  // Edit-mode selection row — whole row toggles, role=checkbox,
  // accessible name = the task title only.
  const renderEditRow = (task: Task, isLast: boolean) => {
    const selected = ui.edit.ids.includes(task.id);
    const isSlipped = task.homePhase !== task.currentPhase;
    return (
      <div key={task.id}>
        <button
          type="button"
          className="rl-btn rl-focusable"
          role="checkbox"
          aria-checked={selected}
          aria-label={task.title}
          style={{...styles.taskRow, width: '100%', paddingInlineStart: 16, gap: 16, minHeight: isSlipped ? 72 : 60}}
          onClick={() => toggleSelect(task.id)}>
          <span style={selected ? styles.selCircleOn : styles.selCircleOff} aria-hidden>
            {selected ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
          </span>
          <span style={{...styles.rowText, paddingBlock: 8}}>
            <span style={{...styles.rowTitle, ...(task.done ? styles.rowTitleDone : null)}}>{task.title}</span>
            {isSlipped ? (
              <span style={styles.metaLine}>
                <span style={styles.carryChip}>Slipped from Day {task.homePhase}</span>
                <span style={styles.rowMeta}>due Day {task.dueDay}</span>
              </span>
            ) : (
              <span style={styles.rowMeta}>{taskMeta(task)}</span>
            )}
          </span>
        </button>
        {isLast ? null : <div style={styles.rowDivider} />}
      </div>
    );
  };

  const slippedMenuActions = (task: Task) => [
    {id: 'done', label: 'Mark done', onPick: () => toggleTaskDone(task.id)},
    {id: 'rehome', label: \`Re-home to Day \${task.currentPhase}\`, onPick: () => rehomeTask(task.id)},
    {id: 'back', label: \`Send back to Day \${task.homePhase}\`, onPick: () => sendBackTask(task.id)},
  ];

  const renderSlippedRow = (task: Task, isLast: boolean) => (
    <SlippedCarryRow
      key={task.id}
      task={task}
      chipText={\`Slipped from Day \${task.homePhase}\`}
      isSwipeOpen={ui.openSwipeId === task.id}
      isMenuOpen={ui.rowMenuId === task.id}
      isLast={isLast}
      reducedMotion={reducedMotion}
      menuRef={rowMenuRef}
      menuActions={slippedMenuActions(task)}
      onSwipeOpen={() => update('ui', {openSwipeId: task.id, rowMenuId: null})}
      onSwipeClose={() => {
        if (ui.openSwipeId === task.id) update('ui', {openSwipeId: null});
      }}
      onToggleDone={() => toggleTaskDone(task.id)}
      onRowTap={opener => {
        if (ui.openSwipeId != null) {
          update('ui', {openSwipeId: null});
          return;
        }
        openTaskSheet(task.id, opener);
      }}
      onToggleMenu={opener => {
        rowMenuOpenerRef.current = opener;
        update('ui', {rowMenuId: ui.rowMenuId === task.id ? null : task.id, openSwipeId: null});
      }}
      onSwipeDone={() => toggleTaskDone(task.id)}
      onSwipeRehome={() => rehomeTask(task.id)}
    />
  );

  // PLAN VIEWS ---------------------------------------------------------------

  const planHeader = (() => {
    if (phaseInView === 30) {
      return {title: 'Day 30 · Land', meta: 'Ended Day 30 · segment locked'};
    }
    if (phaseInView === 60) {
      // 60 − 34 = 26 days left in this phase.
      return {title: 'Day 60 · Integrate', meta: \`Day \${PLAN.today} of \${PLAN.horizon} · \${60 - PLAN.today} days left in this phase\`};
    }
    // 61 − 34 = 27 days until the Day 90 window opens.
    return {title: 'Day 90 · Own', meta: \`Starts Day 61 · in \${61 - PLAN.today} days\`};
  })();

  const editableRows = phaseInView === 30 ? home30 : [...slippedInView, ...nativeInView];

  const renderPlanBody = () => {
    if (ui.edit.on) {
      return (
        <div>
          <h2 style={styles.sectionHeader}>
            Editing Day {phaseInView} · {editableRows.length} tasks
          </h2>
          <div style={styles.listCard}>
            {editableRows.map((task, index) => renderEditRow(task, index === editableRows.length - 1))}
          </div>
        </div>
      );
    }
    if (phaseInView === 30) {
      const c30 = taskCounts(tasks, 30);
      return (
        <div>
          <h2 style={styles.sectionHeader}>
            Day 30 tasks · {c30.done} of {c30.total} done
          </h2>
          <div style={styles.listCard}>
            {home30.map((task, index) => {
              const away = task.currentPhase !== 30;
              const isLast = index === home30.length - 1;
              if (away) {
                // Slipped-away ghost: grayed, provenance chip, explicit
                // 'View in Day 60' button path.
                return (
                  <div key={task.id}>
                    <div style={styles.ghostRow}>
                      <span style={styles.ghostText}>
                        <span style={styles.rowTitle}>{task.title}</span>
                        <span style={styles.metaLine}>
                          <span style={styles.carryChip}>Now in Day {task.currentPhase}</span>
                          <span style={styles.rowMeta}>due Day {task.dueDay}</span>
                        </span>
                      </span>
                      <button
                        type="button"
                        className="rl-btn rl-focusable"
                        style={styles.secondaryBtn36}
                        onClick={() => setPhase(task.currentPhase)}>
                        View in Day {task.currentPhase}
                      </button>
                    </div>
                    {isLast ? null : <div style={styles.rowDivider} />}
                  </div>
                );
              }
              return renderTaskRow(task, isLast);
            })}
          </div>
          <p style={styles.caption}>All {home30.length} tasks in this view</p>
        </div>
      );
    }
    if (phaseInView === 90) {
      const c90native = {done: nativeDone, total: nativeInView.length};
      return (
        <div>
          {slippedInView.length > 0 ? (
            <>
              <h2 style={styles.sectionHeader}>Slipped from earlier · {slippedInView.length}</h2>
              <div style={styles.listCard}>
                {slippedInView.map((task, index) => renderSlippedRow(task, index === slippedInView.length - 1))}
              </div>
            </>
          ) : null}
          <h2 style={styles.sectionHeader}>Carried forward if unfinished · {ghostCarries.length}</h2>
          <div style={styles.listCard}>
            {ghostCarries.length === 0 ? (
              <div style={{...styles.ghostRow, minHeight: 60}}>
                <span style={{...styles.rowMeta, flex: 1}}>Nothing left to carry — earlier phases are clear.</span>
              </div>
            ) : (
              ghostCarries.map((task, index) => (
                <div key={task.id}>
                  <div style={styles.ghostRow}>
                    <span style={styles.ghostText}>
                      <span style={styles.rowTitle}>{task.title}</span>
                      <span style={styles.rowMeta}>
                        {task.homePhase !== task.currentPhase ? \`Slipped from Day \${task.homePhase} · \` : ''}
                        open in Day {task.currentPhase}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="rl-btn rl-focusable"
                      style={styles.secondaryBtn36}
                      onClick={() => carryTo90(task.id)}>
                      Re-home here
                    </button>
                  </div>
                  {index === ghostCarries.length - 1 ? null : <div style={styles.rowDivider} />}
                </div>
              ))
            )}
          </div>
          <h2 style={styles.sectionHeader}>
            Day 90 tasks · {c90native.done} of {c90native.total} done
          </h2>
          <div style={styles.listCard}>
            {nativeInView.map((task, index) => renderTaskRow(task, index === nativeInView.length - 1))}
          </div>
        </div>
      );
    }
    // Day 60 — the default view.
    return (
      <div>
        {slippedInView.length > 0 ? (
          <>
            <h2 style={styles.sectionHeader}>Slipped from Day 30 · {slippedInView.length}</h2>
            <div style={styles.listCard}>
              {slippedInView.map((task, index) => renderSlippedRow(task, index === slippedInView.length - 1))}
            </div>
          </>
        ) : null}
        <h2 style={styles.sectionHeader}>
          Day 60 tasks · {nativeDone} of {nativeInView.length} done
        </h2>
        <div style={styles.listCard}>
          {nativeInView.map((task, index) => renderTaskRow(task, index === nativeInView.length - 1))}
        </div>
        {/* 2 slipped + 6 native = 8 rows at rest. */}
        <p style={styles.caption}>All {slippedInView.length + nativeInView.length} tasks in this view</p>
      </div>
    );
  };

  // TAB CONTENT ---------------------------------------------------------------

  const renderPlanTab = () => (
    <div>
      <div style={styles.phaseHeader}>
        <div style={styles.phaseHeadText}>
          <h1 style={styles.phaseTitle}>{planHeader.title}</h1>
          <span style={styles.phaseMeta}>{planHeader.meta}</span>
        </div>
        <span style={styles.phaseFraction} aria-label={\`\${viewCounts.done} of \${viewCounts.total} tasks done\`}>
          {viewCounts.done}/{viewCounts.total}
        </span>
      </div>
      <div key={phaseInView} className={phaseDirRef.current === 1 ? 'rl-in-fwd' : 'rl-in-back'}>
        {renderPlanBody()}
        {ui.edit.on ? null : (
          <p style={styles.caption}>
            {doneTotal} of {taskTotal} tasks done overall · {donePct}%
          </p>
        )}
      </div>
    </div>
  );

  const renderPeopleTab = () => (
    <div>
      <div style={styles.phaseHeader}>
        <div style={styles.phaseHeadText}>
          <h1 style={styles.phaseTitle}>People</h1>
          <span style={styles.phaseMeta}>
            {stakeholders.length} stakeholders · {heldDots} of {totalDots} 1:1s held
          </span>
        </div>
      </div>
      {/* Legend — the dots' accessible key. */}
      <div style={styles.keyRow} aria-hidden>
        <span style={styles.keyItem}>
          <span style={styles.dotHeld} /> Held
        </span>
        <span style={styles.keyItem}>
          <span style={styles.dotMissed} /> Missed
        </span>
        <span style={styles.keyItem}>
          <span style={styles.dotUpcoming} /> Upcoming
        </span>
      </div>
      <div style={styles.listCard}>
        {stakeholders.map((person, index) => (
          <div key={person.id}>
            <button
              type="button"
              className="rl-btn rl-focusable"
              style={styles.stakeRow}
              aria-label={\`\${person.name}, \${person.role}, \${person.cadence}, \${stripCaption(person.dots)} — open history\`}
              onClick={event => openPersonSheet(person.id, event.currentTarget)}>
              <span style={styles.avatar} aria-hidden>
                {person.name
                  .split(' ')
                  .map(part => part[0])
                  .join('')}
              </span>
              <span style={styles.stakeText}>
                <span style={styles.rowTitle}>{person.name}</span>
                <span style={styles.rowMeta}>{person.cadence}</span>
              </span>
              <span style={styles.stakeTrailing}>
                <CadenceDotStrip dots={person.dots} />
                <span style={styles.dotCaption}>{stripCaption(person.dots)}</span>
              </span>
            </button>
            {index === stakeholders.length - 1 ? null : <div style={styles.rowDivider} />}
          </div>
        ))}
      </div>
    </div>
  );

  const renderWinsTab = () => {
    const winsMeta = [
      \`\${wins.length} logged\`,
      \`\${winsByPhase(30)} in Day 30\`,
      \`\${winsByPhase(60)} in Day 60\`,
      ...(winsByPhase(90) > 0 ? [\`\${winsByPhase(90)} in Day 90\`] : []),
    ].join(' · ');
    return (
      <div>
        <div style={styles.phaseHeader}>
          <div style={styles.phaseHeadText}>
            <h1 style={styles.phaseTitle}>Wins</h1>
            <span style={styles.phaseMeta}>{winsMeta}</span>
          </div>
        </div>
        <div style={styles.filterRow}>
          {PHASE_ORDER.map(phase => {
            const on = winsFilter === phase;
            return (
              <button
                key={phase}
                type="button"
                className="rl-btn rl-focusable"
                style={styles.chipHit}
                aria-pressed={on}
                onClick={() =>
                  update('ui', {
                    screenByTab: {...ui.screenByTab, wins: {...ui.screenByTab.wins, filter: on ? null : phase}},
                  })
                }>
                <span style={{...styles.chipPill, ...(on ? styles.chipPillOn : null)}}>Day {phase}</span>
              </button>
            );
          })}
        </div>
        {suggestedWin != null && (winsFilter == null || winsFilter === suggestedWin.phase) ? (
          <div style={styles.suggestedCard}>
            <span style={styles.overline}>Suggested win</span>
            <span style={styles.suggestedTitle}>{suggestedWin.title}</span>
            <div style={styles.suggestedBtns}>
              <button type="button" className="rl-btn rl-focusable" style={{...styles.secondaryBtn36, flex: 1}} onClick={dismissSuggestedWin}>
                Dismiss
              </button>
              {/* Safe action trailing. */}
              <button type="button" className="rl-btn rl-focusable" style={{...styles.brandBtn36, flex: 1}} onClick={acceptSuggestedWin}>
                Add to wins
              </button>
            </div>
          </div>
        ) : null}
        {visibleWins.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyCircle}>
              <Icon icon={TrophyIcon} size="lg" color="inherit" />
            </span>
            <span style={styles.emptyTitle}>No Day {winsFilter} wins yet</span>
            <span style={styles.emptyBody}>Wins you log after Day 61 land here.</span>
            <button
              type="button"
              className="rl-btn rl-focusable"
              style={styles.secondaryBtn36}
              onClick={() => update('ui', {screenByTab: {...ui.screenByTab, wins: {...ui.screenByTab.wins, filter: 60}}})}>
              View Day 60 wins
            </button>
          </div>
        ) : (
          <div style={{...styles.listCard, marginTop: 12}}>
            {visibleWins.map((win, index) => (
              <div key={win.id}>
                <div style={styles.winRow}>
                  <span style={{color: BRAND_ACCENT, display: 'inline-flex', flexShrink: 0}} aria-hidden>
                    <Icon icon={TrophyIcon} size="sm" color="inherit" />
                  </span>
                  <span style={styles.rowText}>
                    <span style={styles.rowTitle}>{win.title}</span>
                    <span style={styles.rowMeta}>{win.weekLabel}</span>
                  </span>
                </div>
                {index === visibleWins.length - 1 ? null : <div style={styles.rowDivider} />}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // CHROME ---------------------------------------------------------------------

  const selectedCount = ui.edit.ids.length;
  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(locked ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const tabDefs: Array<{id: TabId; label: string; icon: typeof ClipboardListIcon; badge?: string}> = [
    {id: 'plan', label: 'Plan', icon: ClipboardListIcon},
    {id: 'people', label: 'People', icon: UsersIcon},
    {id: 'wins', label: 'Wins', icon: TrophyIcon, badge: suggestedWin != null ? '1' : undefined},
  ];

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{RAMPLINE_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          {ui.edit.on ? (
            <>
              <div style={styles.navLeading}>
                <button type="button" className="rl-btn rl-focusable" style={styles.navTextBtn} onClick={exitEdit}>
                  Cancel
                </button>
              </div>
              {/* The one sanctioned second live region (editMode contract). */}
              <span style={styles.navCount} aria-live="polite">
                {selectedCount === 0 ? 'Select Tasks' : \`\${selectedCount} Selected\`}
              </span>
              <div style={styles.navTrailing}>
                <button
                  type="button"
                  className="rl-btn rl-focusable"
                  style={{...styles.navTextBtn, ...styles.navTextBtnStrong}}
                  onClick={exitEdit}>
                  Done
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={styles.navLeading}>
                <button
                  type="button"
                  className="rl-btn rl-focusable"
                  style={styles.iconBtn}
                  aria-label="Rampline — back to Plan, top"
                  onClick={onMarkTap}>
                  <RamplineMark />
                </button>
              </div>
              <span style={styles.navTitle}>Rampline</span>
              <div style={styles.navTrailing}>
                <PhaseDial
                  tasks={tasks}
                  stakeholders={stakeholders}
                  phaseInView={phaseInView}
                  onAdvance={advancePhase}
                  onArrow={arrowPhase}
                />
                <button
                  type="button"
                  className="rl-btn rl-focusable"
                  style={styles.iconBtn}
                  aria-label="More actions"
                  aria-expanded={ui.actionSheet?.kind === 'overflow'}
                  onClick={event => openOverflow(event.currentTarget)}>
                  <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
                </button>
              </div>
            </>
          )}
        </header>

        <main style={styles.main}>
          {ui.activeTab === 'plan' ? renderPlanTab() : ui.activeTab === 'people' ? renderPeopleTab() : renderWinsTab()}
          <div style={styles.bottomSpacer} />
        </main>

        {/* THE single polite toast region — sticky-in-flow above the
            tabBar; absolute insetInline 16 bottom 76 only while the shell
            is scroll-locked (amendment). No auto-dismiss timers. */}
        <div style={locked ? {...styles.toastDock, ...styles.toastDockLocked} : styles.toastDock} aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="rl-fade">
              <span style={styles.toastMsg}>{ui.toast.msg}</span>
              {ui.toast.snapshot != null ? (
                <>
                  <span style={styles.toastHair} aria-hidden />
                  <button type="button" className="rl-btn rl-focusable" style={styles.toastUndo} onClick={undoToast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {ui.edit.on ? (
          // EDIT TOOLBAR — identical 64px sticky geometry; Delete at the
          // LEADING end; the Move matching the phase in view disabled.
          <div style={styles.editToolbar}>
            <button
              type="button"
              className="rl-btn rl-focusable"
              style={{...styles.toolBtn, ...styles.toolBtnDelete, ...(selectedCount === 0 ? styles.toolBtnDisabled : null)}}
              disabled={selectedCount === 0}
              onClick={editDelete}>
              Delete
            </button>
            {PHASE_ORDER.map(phase => {
              const disabled = selectedCount === 0 || phase === phaseInView;
              return (
                <button
                  key={phase}
                  type="button"
                  className="rl-btn rl-focusable"
                  style={{...styles.toolBtn, ...(disabled ? styles.toolBtnDisabled : null)}}
                  disabled={disabled}
                  onClick={() => editMove(phase)}>
                  Move to Day {phase}
                </button>
              );
            })}
          </div>
        ) : (
          <nav style={styles.tabBar} aria-label="Rampline tabs" onKeyDown={onTabKeyDown}>
            {tabDefs.map(tab => {
              const on = ui.activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className="rl-btn rl-focusable"
                  style={{...styles.tabItem, ...(on ? styles.tabItemOn : null)}}
                  aria-current={on ? 'page' : undefined}
                  aria-label={tab.badge != null ? \`\${tab.label}, \${tab.badge} new\` : tab.label}
                  onClick={() => selectTab(tab.id)}>
                  <span style={styles.tabIconWrap}>
                    <Icon icon={tab.icon} size="md" color="inherit" />
                    {tab.badge != null ? <span style={styles.badge}>{tab.badge}</span> : null}
                  </span>
                  <span style={{...styles.tabLabel, ...(on ? styles.tabLabelOn : null)}}>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* OVERLAYS — all absolute inside shell. */}
        {locked ? (
          <div
            style={styles.sheetScrim}
            onClick={() => {
              if (ui.actionSheet != null) closeActionSheet();
              else closeSheet();
            }}
            aria-hidden
          />
        ) : null}

        {sheetTask != null && ui.sheet != null ? (
          <Sheet
            titleId="rl-task-sheet-title"
            title={sheetTask.title}
            detent={ui.sheet.detent}
            onDetentChange={detent => update('ui', {sheet: {...ui.sheet!, detent}})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            headerAction={
              <button
                type="button"
                className="rl-btn rl-focusable"
                style={styles.iconBtn}
                aria-label={\`More actions for \${sheetTask.title}\`}
                onClick={event => {
                  asOpenerRef.current = event.currentTarget;
                  update('ui', {actionSheet: {kind: 'taskDelete', id: sheetTask.id}});
                }}>
                <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
              </button>
            }
            footer={
              <button
                type="button"
                className="rl-btn rl-focusable"
                style={{...styles.primaryBtn48, ...(sheetTask.done ? styles.primaryBtn48Muted : null)}}
                onClick={() => toggleTaskDone(sheetTask.id)}>
                {sheetTask.done ? 'Mark not done' : 'Mark done'}
              </button>
            }>
            <div style={styles.sheetRow44}>
              <span style={styles.sheetRowLabel}>Home</span>
              <span style={styles.sheetRowValue}>
                Day {sheetTask.homePhase} · {phaseName(sheetTask.homePhase)}
              </span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.sheetRow44}>
              <span style={styles.sheetRowLabel}>Currently</span>
              <span style={styles.sheetRowValue}>
                Day {sheetTask.currentPhase}
                {sheetTask.currentPhase !== sheetTask.homePhase ? (
                  <span style={styles.carryChip}>Slipped from Day {sheetTask.homePhase}</span>
                ) : null}
              </span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.sheetRow44}>
              <span style={styles.sheetRowLabel}>Due</span>
              <span style={styles.sheetRowValue}>Day {sheetTask.dueDay}</span>
            </div>
            {sheetTask.withId != null ? (
              <>
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  className="rl-btn rl-focusable"
                  style={styles.sheetRow44}
                  onClick={() => jumpToStakeholder(sheetTask.withId!)}>
                  <span style={styles.sheetRowLabel}>With</span>
                  <span style={styles.sheetRowValue}>{stakeholders.find(s => s.id === sheetTask.withId)?.name}</span>
                  <span style={{color: 'var(--color-text-secondary)', display: 'inline-flex'}} aria-hidden>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </span>
                </button>
              </>
            ) : null}
            <div style={styles.rowDivider} />
            <p style={{...styles.noteText, marginTop: 12}}>{sheetTask.note ?? 'No notes yet.'}</p>
          </Sheet>
        ) : null}

        {sheetPerson != null && ui.sheet != null ? (
          <Sheet
            titleId="rl-person-sheet-title"
            title={sheetPerson.name}
            detent={ui.sheet.detent}
            onDetentChange={detent => update('ui', {sheet: {...ui.sheet!, detent}})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}>
            <div style={styles.sheetRow44}>
              <span style={styles.sheetRowLabel}>Role</span>
              <span style={styles.sheetRowValue}>{sheetPerson.role}</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.sheetRow44}>
              <span style={styles.sheetRowLabel}>Cadence</span>
              <span style={styles.sheetRowValue}>{sheetPerson.cadence}</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.sheetRow44}>
              <span style={styles.sheetRowLabel}>Held</span>
              <span style={styles.sheetRowValue}>{stripCaption(sheetPerson.dots)}</span>
            </div>
            <h2 style={{...styles.sectionHeader, paddingInline: 0, marginTop: 16}}>1:1 history</h2>
            {sheetPerson.dots.map((dot, index) => (
              <div key={index}>
                <div style={styles.sheetRow44}>
                  <span
                    style={dot.status === 'held' ? styles.dotHeld : dot.status === 'missed' ? styles.dotMissed : styles.dotUpcoming}
                    aria-hidden
                  />
                  <span style={styles.sheetRowValue}>
                    1:1 #{index + 1} · Day {dot.phase} window
                  </span>
                  <span style={{...styles.rowMeta, textTransform: 'capitalize'}}>{dot.status}</span>
                </div>
                {index === sheetPerson.dots.length - 1 ? null : <div style={styles.rowDivider} />}
              </div>
            ))}
          </Sheet>
        ) : null}

        {ui.actionSheet != null ? (
          <div
            style={styles.asWrap}
            role="dialog"
            aria-modal="true"
            aria-label={ui.actionSheet.kind === 'overflow' ? 'Rampline plan actions' : 'Task actions'}
            className="rl-sheet-in"
            onKeyDown={event => trapTabKey(event, event.currentTarget)}>
            <div style={styles.asCard}>
              {ui.actionSheet.kind === 'overflow' ? (
                <>
                  <div style={styles.asHeader}>Rampline plan</div>
                  {PHASE_ORDER.map(phase => (
                    <div key={phase}>
                      <button
                        type="button"
                        className="rl-btn rl-focusable"
                        style={styles.asRow}
                        onClick={() => {
                          closeActionSheet();
                          setPhase(phase);
                        }}>
                        Go to Day {phase}
                      </button>
                      <div style={styles.asRowHair} />
                    </div>
                  ))}
                  <button type="button" className="rl-btn rl-focusable" style={styles.asRow} onClick={enterEdit}>
                    Edit tasks
                  </button>
                </>
              ) : (
                <>
                  <div style={styles.asHeader}>
                    {deleteTaskTarget != null ? \`'\${deleteTaskTarget.title}' will be removed from your plan\` : 'Task actions'}
                  </div>
                  <button
                    type="button"
                    className="rl-btn rl-focusable"
                    style={{...styles.asRow, ...styles.asRowDestructive}}
                    onClick={() => {
                      if (deleteTaskTarget != null) deleteTask(deleteTaskTarget.id);
                    }}>
                    Delete task
                  </button>
                </>
              )}
            </div>
            <div style={styles.asCard}>
              <button type="button" ref={asCancelRef} className="rl-btn rl-focusable" style={styles.asCancel} onClick={closeActionSheet}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}


`;export{e as default};