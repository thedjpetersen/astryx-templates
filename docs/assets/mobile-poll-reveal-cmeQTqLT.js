var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Team Lunch group chat (34
 *   members) in "Relay Rooms", frozen mid-day: three poll cards in one
 *   thread. LUNCH poll (open, the centerpiece): 4 options with base counts
 *   9+6+5+3 = 23 votes (matches the "23 votes" caption); voter chips
 *   4/3/3/3 with overflow +5/+3/+2/— (4+5=9 ✓, 3+3=6 ✓, 3+2=5 ✓, 3+0=3 ✓).
 *   OFFSITE poll (open, pre-vote shimmer specimen): 6+3+2 = 11 votes,
 *   chips 3/3/2 with overflow +3/—/—. TEAMNAME poll (closed): 18+12+7+4 =
 *   41 votes = the "Poll ended · 41 votes" caption (percents 44/29/17/10
 *   sum 100). Your vote adds +1 to the tapped option, so revealed totals
 *   are 24 and 12. No Date.now(), no Math.random(), no network media —
 *   avatars are hue-gradient monogram tiles.
 * @output Relay Rooms — Poll Reveal Motion: a 390px MOBILE group-chat
 *   thread whose centerpiece is poll-reveal choreography. Tapping an
 *   option pops its selection ring (scale keyframe), then 240ms later ALL
 *   bars reveal: each fill springs scaleX 0→pct with the shared decelerate
 *   bezier cubic-bezier(0.22, 1, 0.36, 1) and a 70ms per-row stagger while
 *   the value labels count up IN SYNC from one 40ms interval clock
 *   (tabular-nums, per-row delay folded into the easing), the leading
 *   option's crown drops in with an overshoot bounce, and fixed voter
 *   avatar chips slide into each row with a stagger. Changing your vote
 *   re-targets both affected bars (scaleX transitions), live-updates the
 *   counts, and posts a "Vote moved" toast with a real Undo. The second
 *   poll sits in the pre-vote state with a transform-only shimmer sweep
 *   across its "Tap to vote" pill; the third is CLOSED — winner banded and
 *   crowned, "Poll ended · 41 votes". A 44×44 navBar toggle flips every
 *   value label between counts and percentages with a per-label rotateX
 *   flip (30ms stagger). The composer actually sends: text appends as an
 *   outgoing bubble with a pop-in.
 * @position Page template; emitted by \`astryx template mobile-poll-reveal\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the 52px navBar
 *   at y=0 is the first pixel). position:fixed is banned. This surface has
 *   NO sheets/menus, so the scroll-lock clause never engages. ONE polite
 *   toast dock (aria-live) rides the sticky composer dock at bottom:76
 *   (above the 64px composer bar); a new toast REPLACES the old.
 * Motion contract: transform/opacity ONLY. Bar fills are scaleX transforms
 *   (transform-origin left, unrounded fill inside an overflow-hidden
 *   rounded track — NEVER width). Reveal = CSS transitions with per-index
 *   transitionDelay; count-ups are interval-driven (40ms ticks against a
 *   fixed choreography span — no wall-clock reads); crown/chips/flip/
 *   message-in are keyframe classes with per-index animationDelay; the
 *   "Tap to vote" shimmer is a translateX sweep stripe (not background-
 *   position). Springy = cubic-bezier(0.34, 1.56, 0.64, 1); decelerate =
 *   cubic-bezier(0.22, 1, 0.36, 1). Reduced motion (matchMedia read in a
 *   useEffect with a change listener, plus a CSS guard): bars set
 *   instantly, counts render final, crown appears statically, chip/flip
 *   staggers removed, shimmer REMOVED entirely. Every gesture-free
 *   interaction is already a ≥44×44 button; outcomes announce through the
 *   toast dock.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#4F46E5, #A5B4FC) — white 13px/600 text on
 *   #4F46E5 ≈ 6.3:1; near-black #171233 on #A5B4FC ≈ 8.1:1; as a bare bar
 *   fill: #4F46E5 on the white card ≈ 6.3:1, #A5B4FC on the ~#1C1C1E dark
 *   card ≈ 6.9:1 — all ≥3:1. Sanctioned non-brand literal BAR_NEUTRAL
 *   (other members' poll bars — a meaningful data fill, so ≥3:1 vs the
 *   card surface, NOT a hairline token): #8E8E96 on #FFFFFF ≈ 3.3:1;
 *   #77777F on ~#1C1C1E ≈ 3.2:1. Monogram tiles use hsl(h 55% 38%)
 *   gradients (lightness ≤42%) so white 11px/600 initials stay ≥4.5:1 in
 *   both modes. Never var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px section
 *   gaps · 8px chip gaps; navBar 52px sticky top z20 (grid '1fr auto 1fr',
 *   always-on hairline, blur surface); composer dock 64px sticky bottom
 *   z20; poll option rows are full-width buttons ≥56px with a 44×44
 *   selector seat; bar tracks 10px; voter chips 22px (initials 11px/600 —
 *   nothing under 11px); TYPE: 17/600 nav title · 16/600 questions ·
 *   15/500 option labels · 13/400 meta · 11/500-600 eyebrows/chips;
 *   tabular-nums on every count. Touch law: every target ≥44×44.
 *
 * Responsive contract:
 * - Fluid 320–430: option labels ellipsize (minWidth 0) while the 48px
 *   value column and 44px selector seat never shrink; bubbles cap at 78%;
 *   chip clusters wrap-free (max 5 chips + overflow ≈ 132px < the 168px
 *   floor at 320). overflowX:'clip' backstop on the shell.
 * - Desktop stage: useElementWidth on the wrapper (container width, not
 *   viewport — the demo's inline stage is ~1045px wide); >560px renders
 *   the standard centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline) on a var(--color-background-muted) backdrop —
 *   never a stretched relayout.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, RefObject} from 'react';

import {
  CheckIcon,
  ChevronLeftIcon,
  CrownIcon,
  HashIcon,
  PercentIcon,
  SendHorizontalIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Relay indigo). White 13px/600 text on
// #4F46E5 ≈ 6.3:1; near-black #171233 on #A5B4FC ≈ 8.1:1. As a bare bar
// fill: #4F46E5 on the white card ≈ 6.3:1 and #A5B4FC on the ~#1C1C1E dark
// card ≈ 6.9:1 — both clear the ≥3:1 bar for meaningful fills.
const BRAND_ACCENT = 'light-dark(#4F46E5, #A5B4FC)';
// Text over a BRAND_ACCENT fill (math above).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #171233)';
// Brand-tinted wash — crown seats + the closed poll's winner band.
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Other members' poll bars — a meaningful DATA fill (not a hairline), so an
// explicit pair at ≥3:1 against the card surface it paints on:
// #8E8E96 on #FFFFFF ≈ 3.3:1; #77777F on ~#1C1C1E ≈ 3.2:1.
const BAR_NEUTRAL = 'light-dark(#8E8E96, #77777F)';
// White initials over hue-gradient monogram tiles: hsl(h 55% 38%) keeps
// relative luminance ≤ 0.11 for every hue used below ⇒ ≥4.7:1 with #FFFFFF.
const MONOGRAM_TEXT = '#FFFFFF';

// ---------------------------------------------------------------------------
// MOTION CONSTANTS — one shared clock for bars + count-ups.
// ---------------------------------------------------------------------------

const DECELERATE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const REVEAL_BAR_MS = 620; // one bar's spring span
const REVEAL_STAGGER_MS = 70; // per-row stagger (spec)
const REVEAL_TICK_MS = 40; // count-up interval resolution
const RING_POP_LEAD_MS = 240; // selection ring pops, THEN bars reveal

function revealSpanMs(optionCount: number): number {
  // Full choreography span: last bar's delay + its spring + settle buffer.
  return REVEAL_BAR_MS + (optionCount - 1) * REVEAL_STAGGER_MS + 120;
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

function easeOutCubic(u: number): number {
  return 1 - Math.pow(1 - u, 3);
}

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, and the keyframe set
// (transform/opacity only). Unique \`mpr-\` prefix. The reduced-motion guard
// kills every animation outright (shimmer is REMOVED, not slowed).
// ---------------------------------------------------------------------------

const MPR_CSS = \`
.mpr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.mpr-btn:disabled { cursor: default; }
.mpr-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.mpr-fade { transition: opacity 200ms ease; }
/* Selection ring pop — an expanding ring that fades as it overshoots. */
@keyframes mpr-pop {
  0% { transform: scale(0.55); opacity: 0.9; }
  70% { transform: scale(1.3); opacity: 0.35; }
  100% { transform: scale(1.5); opacity: 0; }
}
.mpr-pop { animation: mpr-pop 340ms \${DECELERATE} both; }
/* Crown drop-in with an overshoot bounce (springy bezier). */
@keyframes mpr-crown-in {
  from { transform: translateY(-12px) scale(0.5); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.mpr-crown-in { animation: mpr-crown-in 460ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
/* Voter chips slide into the row (per-chip animationDelay staggers). */
@keyframes mpr-chip-in {
  from { transform: translateX(12px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.mpr-chip-in { animation: mpr-chip-in 300ms \${DECELERATE} both; }
/* Count ⇄ percent label flip (per-label, 30ms index stagger). */
@keyframes mpr-flip-in {
  from { transform: rotateX(-80deg); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.mpr-flip-in {
  display: inline-block;
  transform-origin: bottom center;
  animation: mpr-flip-in 260ms \${DECELERATE} both;
}
/* "Tap to vote" hint shimmer — a translateX sweep stripe (transform-only,
   never background-position on a layout box). */
@keyframes mpr-sweep {
  from { transform: translateX(-44px); }
  to { transform: translateX(150px); }
}
.mpr-sweep { animation: mpr-sweep 2100ms linear infinite; }
/* Sent-message pop-in. */
@keyframes mpr-msg-in {
  from { transform: translateY(6px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.mpr-msg-in { animation: mpr-msg-in 220ms \${DECELERATE} both; }
@media (prefers-reduced-motion: reduce) {
  .mpr-pop, .mpr-crown-in, .mpr-chip-in, .mpr-flip-in, .mpr-msg-in { animation: none; }
  .mpr-sweep { animation: none; display: none; }
  .mpr-fade { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  wrapDesktop: {background: 'var(--color-background-muted)'},
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
  // NAV BAR — 52px sticky top z20; always-on hairline, blur surface.
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
  navCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 0,
    maxWidth: 210,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    lineHeight: 1.2,
    maxWidth: 210,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  navSub: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
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
  toggleSeat: {position: 'relative', width: 20, height: 20},
  toggleIcon: {position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'},
  // THREAD — 16px screen inset, 12px item rhythm, 24px around poll cards.
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  thread: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '16px 16px 24px',
  },
  dayDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBlock: 4,
  },
  dayDividerLine: {height: 1, flex: 1, background: 'var(--color-border)'},
  dayDividerLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // MESSAGE BUBBLES.
  msgRow: {display: 'flex', alignItems: 'flex-end', gap: 8},
  msgRowMine: {justifyContent: 'flex-end'},
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: MONOGRAM_TEXT,
  },
  msgStack: {display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '78%', minWidth: 0},
  msgMeta: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    paddingInlineStart: 12,
    fontVariantNumeric: 'tabular-nums',
  },
  bubble: {
    padding: '8px 12px',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    background: 'var(--color-background-muted)',
    fontSize: 15,
    lineHeight: 1.35,
    overflowWrap: 'anywhere',
  },
  bubbleMine: {
    padding: '8px 12px',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 15,
    lineHeight: 1.35,
    overflowWrap: 'anywhere',
  },
  msgMetaMine: {textAlign: 'right', paddingInlineEnd: 12, paddingInlineStart: 0},
  // POLL CARD — inset-grouped card, 12px radius, 1px border.
  pollCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  pollEyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  pollEyebrowDot: {
    width: 3,
    height: 3,
    borderRadius: '50%',
    background: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  pollQuestion: {fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.3},
  optionList: {display: 'flex', flexDirection: 'column', gap: 4},
  // Option row — full-width button, ≥56px, 44×44 selector seat.
  optionRow: {
    position: 'relative',
    width: '100%',
    minHeight: 56,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 4,
    paddingBlock: 6,
    paddingInlineEnd: 8,
    borderRadius: 10,
  },
  optionRowWinner: {background: BRAND_TINT_12},
  selectorSeat: {
    position: 'relative',
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  selectorCircle: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '2px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
  },
  selectorCircleMine: {
    border: 'none',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  popRing: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: \`2px solid \${BRAND_ACCENT}\`,
    pointerEvents: 'none',
    opacity: 0,
  },
  optionMain: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingTop: 5,
  },
  optionLabelRow: {display: 'flex', alignItems: 'center', gap: 6, minHeight: 20},
  optionLabel: {
    fontSize: 15,
    fontWeight: 500,
    lineHeight: 1.3,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  crownSeat: {
    width: 20,
    height: 20,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 6,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  // Bar track — rounded clip; the fill is an UNROUNDED scaleX layer inside.
  barTrack: {
    height: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    height: '100%',
    transformOrigin: 'left center',
  },
  // Voter chips — 22px hue-gradient monograms, tight cluster.
  chipRow: {display: 'flex', alignItems: 'center', minHeight: 22},
  voterChip: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: MONOGRAM_TEXT,
    border: '2px solid var(--color-background-card)',
    flexShrink: 0,
  },
  chipOverlap: {marginInlineStart: -6},
  youChip: {
    height: 22,
    paddingInline: 8,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    marginInlineStart: 6,
    flexShrink: 0,
  },
  overflowChip: {
    height: 22,
    paddingInline: 7,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginInlineStart: 6,
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  // Value column — fixed seat so count-ups never shift layout.
  valueCol: {
    minWidth: 48,
    flexShrink: 0,
    textAlign: 'right',
    paddingTop: 8,
    fontSize: 15,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Footer caption row + shimmer hint pill.
  pollFooter: {display: 'flex', alignItems: 'center', gap: 8, minHeight: 28},
  pollTotal: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  hintPill: {
    position: 'relative',
    height: 28,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: BRAND_ACCENT,
    overflow: 'hidden',
    flexShrink: 0,
  },
  hintSweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 44,
    background: \`linear-gradient(90deg, transparent, \${BRAND_TINT_12}, transparent)\`,
    pointerEvents: 'none',
  },
  // COMPOSER DOCK — sticky bottom:0 z20 wrapper; toast rides bottom:76.
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 20, marginTop: 24},
  composerBar: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  composerInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-muted)',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    outline: 'none',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  // TOAST — the single polite live region above the 64px composer.
  toastRegion: {
    position: 'absolute',
    bottom: 76,
    insetInline: 16,
    zIndex: 30,
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
  toastAction: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. Cross-checks live in the JSDoc @input.
// ---------------------------------------------------------------------------

type MemberId = 'priya' | 'marco' | 'ivy' | 'me';

interface Member {
  name: string;
  initials: string;
  hue: number;
}

const MEMBERS: Record<MemberId, Member> = {
  priya: {name: 'Priya', initials: 'PK', hue: 262},
  marco: {name: 'Marco', initials: 'MB', hue: 174},
  ivy: {name: 'Ivy', initials: 'IK', hue: 24},
  me: {name: 'You', initials: 'You', hue: 210},
};

/** Hue-gradient monogram tile (fixture art — no network media). */
function monogramArt(hue: number): string {
  return \`linear-gradient(135deg, hsl(\${hue} 55% 42%), hsl(\${(hue + 40) % 360} 60% 32%))\`;
}

interface VoterChipFixture {
  initials: string;
  hue: number;
}

interface PollOptionFixture {
  id: string;
  label: string;
  /** Pre-existing votes, before yours. */
  baseCount: number;
  /** Fixed voter chips (subset of baseCount; overflow = baseCount − chips). */
  chips: VoterChipFixture[];
}

type PollId = 'teamname' | 'lunch' | 'offsite';

interface PollFixture {
  id: PollId;
  question: string;
  askedBy: Exclude<MemberId, 'me'>;
  time: string;
  status: 'open' | 'closed';
  options: PollOptionFixture[];
}

// LUNCH — 9+6+5+3 = 23 base votes; chips 4/3/3/3 (overflow +5/+3/+2/—).
const LUNCH_POLL: PollFixture = {
  id: 'lunch',
  question: 'Where for team lunch?',
  askedBy: 'priya',
  time: '11:53',
  status: 'open',
  options: [
    {
      id: 'noodle',
      label: 'Súp Noodle Bar',
      baseCount: 9,
      chips: [
        {initials: 'PK', hue: 262},
        {initials: 'DT', hue: 96},
        {initials: 'RS', hue: 318},
        {initials: 'AL', hue: 48},
      ],
    },
    {
      id: 'tacos',
      label: 'Casa Verde Tacos',
      baseCount: 6,
      chips: [
        {initials: 'MB', hue: 174},
        {initials: 'JW', hue: 200},
        {initials: 'EF', hue: 12},
      ],
    },
    {
      id: 'deli',
      label: 'Golden Hour Deli',
      baseCount: 5,
      chips: [
        {initials: 'TN', hue: 138},
        {initials: 'CV', hue: 286},
        {initials: 'OM', hue: 60},
      ],
    },
    {
      id: 'banh',
      label: 'Bánh Mì Bureau',
      baseCount: 3,
      chips: [
        {initials: 'HS', hue: 232},
        {initials: 'GK', hue: 156},
        {initials: 'LP', hue: 340},
      ],
    },
  ],
};

// OFFSITE — 6+3+2 = 11 base votes; chips 3/3/2 (overflow +3/—/—).
const OFFSITE_POLL: PollFixture = {
  id: 'offsite',
  question: 'Friday offsite — which block first?',
  askedBy: 'marco',
  time: '11:56',
  status: 'open',
  options: [
    {
      id: 'trail',
      label: 'Morning trail walk',
      baseCount: 6,
      chips: [
        {initials: 'IK', hue: 24},
        {initials: 'PS', hue: 190},
        {initials: 'DT', hue: 96},
      ],
    },
    {
      id: 'workshop',
      label: 'Afternoon workshop',
      baseCount: 3,
      chips: [
        {initials: 'MB', hue: 174},
        {initials: 'RS', hue: 318},
        {initials: 'CV', hue: 286},
      ],
    },
    {
      id: 'split',
      label: 'Split the day',
      baseCount: 2,
      chips: [
        {initials: 'JW', hue: 200},
        {initials: 'HS', hue: 232},
      ],
    },
  ],
};

// TEAMNAME (closed) — 18+12+7+4 = 41 votes; percents 44/29/17/10 (sum 100).
const TEAMNAME_POLL: PollFixture = {
  id: 'teamname',
  question: 'Summer league team name?',
  askedBy: 'ivy',
  time: 'Yesterday 17:42',
  status: 'closed',
  options: [
    {
      id: 'squad',
      label: 'Notification Squad',
      baseCount: 18,
      chips: [
        {initials: 'IK', hue: 24},
        {initials: 'PK', hue: 262},
        {initials: 'TN', hue: 138},
        {initials: 'AL', hue: 48},
      ],
    },
    {
      id: 'async',
      label: 'The Async Awaits',
      baseCount: 12,
      chips: [
        {initials: 'MB', hue: 174},
        {initials: 'EF', hue: 12},
        {initials: 'OM', hue: 60},
      ],
    },
    {
      id: 'merge',
      label: 'Merge Conflicts',
      baseCount: 7,
      chips: [
        {initials: 'DT', hue: 96},
        {initials: 'GK', hue: 156},
        {initials: 'LP', hue: 340},
      ],
    },
    {
      id: 'found',
      label: '404 Found',
      baseCount: 4,
      chips: [
        {initials: 'JW', hue: 200},
        {initials: 'HS', hue: 232},
        {initials: 'RS', hue: 318},
      ],
    },
  ],
};

const POLL_BY_ID: Record<PollId, PollFixture> = {
  teamname: TEAMNAME_POLL,
  lunch: LUNCH_POLL,
  offsite: OFFSITE_POLL,
};

type OpenPollId = 'lunch' | 'offsite';

type ThreadItem =
  | {kind: 'divider'; id: string; label: string}
  | {kind: 'message'; id: string; from: Exclude<MemberId, 'me'>; text: string; time: string}
  | {kind: 'poll'; id: string; pollId: PollId};

const THREAD: ThreadItem[] = [
  {kind: 'divider', id: 'd1', label: 'Yesterday'},
  {
    kind: 'message',
    id: 'm1',
    from: 'ivy',
    text: 'League bracket is locked. Final call on our team name below — poll closes at 6.',
    time: '17:41',
  },
  {kind: 'poll', id: 'p-teamname', pollId: 'teamname'},
  {kind: 'message', id: 'm2', from: 'marco', text: 'The Async Awaits was robbed.', time: '17:58'},
  {kind: 'divider', id: 'd2', label: 'Today'},
  {
    kind: 'message',
    id: 'm3',
    from: 'priya',
    text: 'We leave at 12:30 — settling lunch the democratic way this time.',
    time: '11:52',
  },
  {kind: 'poll', id: 'p-lunch', pollId: 'lunch'},
  {
    kind: 'message',
    id: 'm4',
    from: 'marco',
    text: 'Noodle bar has a 20 minute line at noon, just saying.',
    time: '11:54',
  },
  {kind: 'poll', id: 'p-offsite', pollId: 'offsite'},
  {kind: 'message', id: 'm5', from: 'priya', text: 'Vote by noon and I will book both.', time: '11:57'},
];

// ---------------------------------------------------------------------------
// SHARED HOOKS
// ---------------------------------------------------------------------------

/** Container-width hook — the demo's inline desktop stage is ~1045px inside
 * a 1440px window, so only a ResizeObserver on the wrapper can tell the two
 * stages apart (never a viewport media query). */
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

/** prefers-reduced-motion, read once via matchMedia with a change listener
 * (per the motion contract) — mirrored by the CSS @media guard. */
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
// POLL STATE MODEL
// ---------------------------------------------------------------------------

interface LivePollState {
  myVote: string | null;
  /** Bars visible; flips 240ms after the first vote (ring pops first). */
  revealed: boolean;
  /** Choreography clock 0→1 across revealSpanMs(n) — interval-driven. */
  progress: number;
  /** Clock finished (or reduced motion) — crown may show, bars settle. */
  done: boolean;
  /** Keys the selection-ring pop so every (re)vote replays it. */
  voteSeq: number;
}

const INITIAL_LIVE: Record<OpenPollId, LivePollState> = {
  lunch: {myVote: null, revealed: false, progress: 0, done: false, voteSeq: 0},
  offsite: {myVote: null, revealed: false, progress: 0, done: false, voteSeq: 0},
};

// The closed poll renders through the same view-model, fully settled.
const CLOSED_STATE: LivePollState = {myVote: null, revealed: true, progress: 1, done: true, voteSeq: 0};

interface ToastState {
  seq: number;
  text: string;
  undo: {pollId: OpenPollId; option: string} | null;
}

type PollMode = 'percent' | 'count';

// ---------------------------------------------------------------------------
// POLL CARD
// ---------------------------------------------------------------------------

interface PollCardProps {
  poll: PollFixture;
  state: LivePollState;
  mode: PollMode;
  /** Increments on every mode toggle; 0 = initial mount (no flip). */
  modeSeq: number;
  reduced: boolean;
  onVote?: (optionId: string) => void;
}

function PollCard({poll, state, mode, modeSeq, reduced, onVote}: PollCardProps) {
  const asker = MEMBERS[poll.askedBy];
  const counts = poll.options.map(
    option => option.baseCount + (state.myVote === option.id ? 1 : 0),
  );
  const total = counts.reduce((sum, count) => sum + count, 0);
  const percents = counts.map(count => Math.round((count / total) * 100));
  // Leader = highest count, first index wins ties (deterministic).
  let leaderIndex = 0;
  counts.forEach((count, index) => {
    if (count > (counts[leaderIndex] ?? 0)) {
      leaderIndex = index;
    }
  });

  const spanMs = revealSpanMs(poll.options.length);
  const elapsedMs = state.progress * spanMs;
  const closed = poll.status === 'closed';
  const interactive = !closed && onVote != null;

  return (
    <section style={styles.pollCard} aria-label={\`Poll: \${poll.question}\`}>
      <div style={styles.pollEyebrow}>
        <span>Poll</span>
        <span style={styles.pollEyebrowDot} aria-hidden />
        <span>{asker.name}</span>
        <span style={styles.pollEyebrowDot} aria-hidden />
        <span>{poll.time}</span>
      </div>
      <h2 style={styles.pollQuestion}>{poll.question}</h2>

      <div style={styles.optionList} role="list">
        {poll.options.map((option, index) => {
          const count = counts[index] ?? 0;
          const pct = percents[index] ?? 0;
          const mine = state.myVote === option.id;
          const isLeader = state.revealed && index === leaderIndex;
          const target = mode === 'percent' ? pct : count;
          // Count-up IN SYNC with the bar: same clock, same per-row delay,
          // same decelerate shape (cubic ease-out ≈ the reveal bezier).
          const upness = state.done
            ? 1
            : easeOutCubic(clamp01((elapsedMs - index * REVEAL_STAGGER_MS) / REVEAL_BAR_MS));
          const shown = state.done ? target : Math.round(target * upness);
          const overflow = option.baseCount - option.chips.length;

          const fillStyle: CSSProperties = {
            ...styles.barFill,
            background: mine ? BRAND_ACCENT : BAR_NEUTRAL,
            transform: \`scaleX(\${state.revealed ? pct / 100 : 0})\`,
            opacity: state.revealed ? 1 : 0,
            transition: reduced
              ? 'none'
              : state.done
                ? \`transform 420ms \${DECELERATE}, opacity 160ms ease\`
                : \`transform \${REVEAL_BAR_MS}ms \${DECELERATE} \${index * REVEAL_STAGGER_MS}ms, opacity 160ms ease \${index * REVEAL_STAGGER_MS}ms\`,
          };

          const rowStyle: CSSProperties = {
            ...styles.optionRow,
            ...(closed && index === leaderIndex ? styles.optionRowWinner : null),
          };

          const ariaLabel = state.revealed
            ? \`\${option.label} — \${count} votes, \${pct} percent\${mine ? ', your vote' : ''}\${isLeader ? ', leading' : ''}\`
            : \`Vote for \${option.label}\`;

          const body = (
            <>
              <span style={styles.selectorSeat} aria-hidden>
                <span style={{...styles.selectorCircle, ...(mine ? styles.selectorCircleMine : null)}}>
                  {mine ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                </span>
                {mine && !reduced ? (
                  <span key={state.voteSeq} style={styles.popRing} className="mpr-pop" />
                ) : null}
              </span>
              <span style={styles.optionMain}>
                <span style={styles.optionLabelRow}>
                  <span style={styles.optionLabel}>{option.label}</span>
                  {isLeader && (state.done || reduced) ? (
                    <span
                      style={styles.crownSeat}
                      className={reduced ? undefined : 'mpr-crown-in'}
                      title="Leading option">
                      <Icon icon={CrownIcon} size="xsm" color="inherit" />
                    </span>
                  ) : null}
                </span>
                <span style={styles.barTrack}>
                  <span style={fillStyle} />
                </span>
                {state.revealed ? (
                  <span style={styles.chipRow}>
                    {option.chips.map((chip, chipIndex) => (
                      <span
                        key={chip.initials}
                        className={reduced ? undefined : 'mpr-chip-in'}
                        style={{
                          ...styles.voterChip,
                          ...(chipIndex > 0 ? styles.chipOverlap : null),
                          background: monogramArt(chip.hue),
                          animationDelay: reduced
                            ? undefined
                            : state.done && !closed
                              ? '0ms'
                              : \`\${260 + index * REVEAL_STAGGER_MS + chipIndex * 45}ms\`,
                        }}>
                        {chip.initials}
                      </span>
                    ))}
                    {overflow > 0 ? <span style={styles.overflowChip}>+{overflow}</span> : null}
                    {mine ? (
                      <span
                        key={\`you-\${option.id}\`}
                        style={styles.youChip}
                        className={reduced ? undefined : 'mpr-chip-in'}>
                        You
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </span>
              <span style={styles.valueCol} aria-hidden>
                {state.revealed ? (
                  <span
                    key={\`\${mode}-\${modeSeq}\`}
                    className={modeSeq > 0 && !reduced ? 'mpr-flip-in' : undefined}
                    style={modeSeq > 0 && !reduced ? {animationDelay: \`\${index * 30}ms\`} : undefined}>
                    {mode === 'percent' ? \`\${shown}%\` : shown}
                  </span>
                ) : null}
              </span>
            </>
          );

          return interactive ? (
            <button
              key={option.id}
              type="button"
              role="listitem"
              className="mpr-btn mpr-focusable"
              style={rowStyle}
              aria-pressed={mine}
              aria-label={ariaLabel}
              onClick={() => onVote(option.id)}>
              {body}
            </button>
          ) : (
            <div key={option.id} role="listitem" style={rowStyle} aria-label={ariaLabel}>
              {body}
            </div>
          );
        })}
      </div>

      <div style={styles.pollFooter}>
        {closed ? (
          <span style={styles.pollTotal}>
            Poll ended · {total} votes · “{poll.options[leaderIndex]?.label}” wins
          </span>
        ) : state.revealed ? (
          <span style={styles.pollTotal}>{total} votes · Tap another option to change</span>
        ) : (
          <>
            <span style={styles.pollTotal}>{total} votes so far</span>
            <span style={styles.hintPill}>
              Tap to vote
              {reduced ? null : <span style={styles.hintSweep} className="mpr-sweep" aria-hidden />}
            </span>
          </>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobilePollRevealTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  // >560px container = the demo's desktop stage ⇒ centered phone column.
  const isDesktopColumn = wrapWidth > 560;
  const reduced = usePrefersReducedMotion();

  const [polls, setPolls] = useState<Record<OpenPollId, LivePollState>>(INITIAL_LIVE);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [mode, setMode] = useState<PollMode>('percent');
  const [modeSeq, setModeSeq] = useState(0);
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>([]);

  // Choreography timers — cleaned up on unmount (interval per poll + the
  // ring-pop lead timeout).
  const intervalRef = useRef<Record<string, number>>({});
  const timeoutRef = useRef<Record<string, number>>({});
  useEffect(() => {
    const intervals = intervalRef.current;
    const timeouts = timeoutRef.current;
    return () => {
      Object.values(intervals).forEach(id => window.clearInterval(id));
      Object.values(timeouts).forEach(id => window.clearTimeout(id));
    };
  }, []);

  const nextToastSeq = useCallback(
    () => (toast?.seq ?? 0) + 1,
    [toast],
  );

  const startRevealClock = useCallback((pollId: OpenPollId) => {
    const span = revealSpanMs(POLL_BY_ID[pollId].options.length);
    setPolls(prev => ({...prev, [pollId]: {...prev[pollId], revealed: true}}));
    window.clearInterval(intervalRef.current[pollId]);
    intervalRef.current[pollId] = window.setInterval(() => {
      setPolls(prev => {
        const current = prev[pollId];
        const nextProgress = Math.min(1, current.progress + REVEAL_TICK_MS / span);
        if (nextProgress >= 1) {
          window.clearInterval(intervalRef.current[pollId]);
          return {...prev, [pollId]: {...current, progress: 1, done: true}};
        }
        return {...prev, [pollId]: {...current, progress: nextProgress}};
      });
    }, REVEAL_TICK_MS);
  }, []);

  const optionLabel = (pollId: OpenPollId, optionId: string): string =>
    POLL_BY_ID[pollId].options.find(option => option.id === optionId)?.label ?? '';

  const vote = useCallback(
    (pollId: OpenPollId, optionId: string) => {
      const current = polls[pollId];
      if (current.myVote === optionId) {
        return; // Already your vote — nothing to animate, nothing to change.
      }
      if (current.myVote == null) {
        // FIRST VOTE — ring pops immediately; bars reveal after the lead.
        setPolls(prev => ({
          ...prev,
          [pollId]: {...prev[pollId], myVote: optionId, voteSeq: prev[pollId].voteSeq + 1},
        }));
        setToast({seq: nextToastSeq(), text: \`You voted \${optionLabel(pollId, optionId)}\`, undo: null});
        if (reduced) {
          // Reduced motion: bars set instantly, counts render final.
          setPolls(prev => ({
            ...prev,
            [pollId]: {...prev[pollId], myVote: optionId, revealed: true, progress: 1, done: true},
          }));
        } else {
          window.clearTimeout(timeoutRef.current[pollId]);
          timeoutRef.current[pollId] = window.setTimeout(
            () => startRevealClock(pollId),
            RING_POP_LEAD_MS,
          );
        }
        return;
      }
      // VOTE CHANGE — both affected bars re-target via their scaleX
      // transitions; counts live-update; Undo restores the previous vote.
      const previous = current.myVote;
      setPolls(prev => ({
        ...prev,
        [pollId]: {...prev[pollId], myVote: optionId, voteSeq: prev[pollId].voteSeq + 1},
      }));
      setToast({
        seq: nextToastSeq(),
        text: \`Vote moved to \${optionLabel(pollId, optionId)}\`,
        undo: {pollId, option: previous},
      });
    },
    [polls, reduced, nextToastSeq, startRevealClock],
  );

  const undoVote = useCallback(() => {
    if (toast?.undo == null) {
      return;
    }
    const {pollId, option} = toast.undo;
    setPolls(prev => ({
      ...prev,
      [pollId]: {...prev[pollId], myVote: option, voteSeq: prev[pollId].voteSeq + 1},
    }));
    setToast({seq: toast.seq + 1, text: \`Vote restored to \${optionLabel(pollId, option)}\`, undo: null});
  }, [toast]);

  const toggleMode = useCallback(() => {
    setMode(prev => (prev === 'percent' ? 'count' : 'percent'));
    setModeSeq(prev => prev + 1);
  }, []);

  const sendDraft = useCallback(() => {
    const text = draft.trim();
    if (text.length === 0) {
      return;
    }
    setSent(prev => [...prev, text]);
    setDraft('');
  }, [draft]);

  const canSend = draft.trim().length > 0;

  const wrapStyle: CSSProperties = {
    ...styles.wrap,
    ...(isDesktopColumn ? styles.wrapDesktop : null),
  };
  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  return (
    <div ref={wrapRef} style={wrapStyle}>
      <style>{MPR_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="mpr-btn mpr-focusable"
              style={styles.backBtn}
              aria-label="Back to Rooms"
              onClick={() => {}}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
              <span style={styles.backLabel}>Rooms</span>
            </button>
          </div>
          <div style={styles.navCenter}>
            <h1 style={styles.navTitle}>Team Lunch</h1>
            <span style={styles.navSub}>34 members</span>
          </div>
          <div style={styles.navTrailing}>
            {/* The 44×44 results toggle — counts ⇄ percentages (per-label
                flip transitions in every revealed poll). */}
            <button
              type="button"
              className="mpr-btn mpr-focusable"
              style={styles.iconBtn}
              aria-label={
                mode === 'percent' ? 'Show vote counts' : 'Show percentages'
              }
              onClick={toggleMode}>
              <span style={styles.toggleSeat} aria-hidden>
                <span
                  style={{...styles.toggleIcon, opacity: mode === 'percent' ? 1 : 0}}
                  className="mpr-fade">
                  <Icon icon={HashIcon} size="md" color="inherit" />
                </span>
                <span
                  style={{...styles.toggleIcon, opacity: mode === 'percent' ? 0 : 1}}
                  className="mpr-fade">
                  <Icon icon={PercentIcon} size="md" color="inherit" />
                </span>
              </span>
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <div style={styles.thread}>
            {THREAD.map(item => {
              if (item.kind === 'divider') {
                return (
                  <div key={item.id} style={styles.dayDivider} role="separator" aria-label={item.label}>
                    <span style={styles.dayDividerLine} aria-hidden />
                    <span style={styles.dayDividerLabel}>{item.label}</span>
                    <span style={styles.dayDividerLine} aria-hidden />
                  </div>
                );
              }
              if (item.kind === 'message') {
                const member = MEMBERS[item.from];
                return (
                  <div key={item.id} style={styles.msgRow}>
                    <span
                      style={{...styles.msgAvatar, background: monogramArt(member.hue)}}
                      aria-hidden>
                      {member.initials}
                    </span>
                    <div style={styles.msgStack}>
                      <span style={styles.msgMeta}>
                        {member.name} · {item.time}
                      </span>
                      <div style={styles.bubble}>{item.text}</div>
                    </div>
                  </div>
                );
              }
              const poll = POLL_BY_ID[item.pollId];
              const isOpen = poll.status === 'open';
              const openId = item.pollId as OpenPollId;
              return (
                <PollCard
                  key={item.id}
                  poll={poll}
                  state={isOpen ? polls[openId] : CLOSED_STATE}
                  mode={mode}
                  modeSeq={modeSeq}
                  reduced={reduced}
                  onVote={isOpen ? optionId => vote(openId, optionId) : undefined}
                />
              );
            })}
            {sent.map((text, index) => (
              <div
                key={\`sent-\${index}\`}
                style={{...styles.msgRow, ...styles.msgRowMine}}
                className={reduced ? undefined : 'mpr-msg-in'}>
                <div style={styles.msgStack}>
                  <span style={{...styles.msgMeta, ...styles.msgMetaMine}}>You · now</span>
                  <div style={styles.bubbleMine}>{text}</div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Sticky composer dock — the toast live region rides 12px above
            the 64px bar (bottom: 76 per the shell contract). */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} aria-live="polite" role="status">
            {toast != null ? (
              <div key={toast.seq} style={styles.toast} className="mpr-fade">
                <span style={styles.toastText}>{toast.text}</span>
                <span style={styles.toastHairline} aria-hidden />
                {toast.undo != null ? (
                  <button
                    type="button"
                    className="mpr-btn mpr-focusable"
                    style={styles.toastAction}
                    onClick={undoVote}>
                    Undo
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mpr-btn mpr-focusable"
                    style={styles.toastAction}
                    aria-label="Dismiss message"
                    onClick={() => setToast(null)}>
                    <Icon icon={XIcon} size="sm" color="inherit" />
                  </button>
                )}
              </div>
            ) : null}
          </div>
          <div style={styles.composerBar}>
            <input
              type="text"
              style={styles.composerInput}
              value={draft}
              placeholder="Message Team Lunch"
              aria-label="Message Team Lunch"
              onChange={event => setDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  sendDraft();
                }
              }}
            />
            <button
              type="button"
              className="mpr-btn mpr-focusable"
              style={{
                ...styles.sendBtn,
                background: canSend ? BRAND_ACCENT : 'var(--color-background-muted)',
                color: canSend ? BRAND_FILL_TEXT : 'var(--color-text-secondary)',
              }}
              aria-label="Send message"
              disabled={!canSend}
              onClick={sendDraft}>
              <Icon icon={SendHorizontalIcon} size="md" color="inherit" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;export{e as default};