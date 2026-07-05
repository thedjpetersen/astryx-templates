// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Afterglow date-debrief journal:
 *   12 committed entries across 6 people (per-person counts 1+3+2+1+3+2 =
 *   12; verdict distribution 1 Never + 1 Unsure + 2 Friends + 5 Again +
 *   3 Excited = 12; ease≥7 entries = 9 of 12; first-date-ease≥7 people =
 *   5, of whom 4 got a second date), one live draft (Alex · date #2,
 *   spark 4 · ease 7, 'Made me laugh' w1 → score 4+7+2·1 = 13 → Unsure),
 *   a 12-flag catalog (6 green / 6 red), fixed dateLabel strings — no
 *   Date.now(), no Math.random(), no network media.
 * @output Afterglow — Date Debrief Log: a 390px MOBILE post-date journal.
 *   Log tab: paired Spark/Ease slider blocks (track + 96×32 stepper), a
 *   260px SparkEaseScatter card whose 18px dashed-ring draft dot glides
 *   live as sliders move (whole card is ONE button opening a two-detent
 *   pattern-map sheet), a weighted FlagTray (taps cycle 0→1→2→0, border
 *   thickness encodes weight), a 240×130 semicircle VerdictDial whose
 *   ghost tick tracks the suggestion formula score = spark + ease +
 *   2·(Σgreen − Σred) (bands ≤8 Never · 9–13 Unsure · 14–16 Friends ·
 *   17–19 Again · ≥20 Excited), a note field, and a swipeable RECENT
 *   DEBRIEFS list with delete-then-Undo. Committing appends e13 and every
 *   surface recomputes: the 13th dot settles with a pulse, People's Alex
 *   ring grows 1→2 segments, Patterns' '9 of 12' flips to '10 of 13', the
 *   recent list reads 'All 13 debriefs'. People tab: 6× 72px DateCountRing
 *   rows. Patterns tab: 3 computed insight cards + VerdictDistBar. Me tab:
 *   switch + utility rows.
 * @position Page template; emitted by `astryx template mobile-date-debrief-log`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (sheet scrim/sheet, anchored
 *   menus, alert) are position:'absolute' INSIDE shell; position:fixed is
 *   banned. While the sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and the toastDock switches from sticky-in-flow to
 *   shell-absolute for the duration; both restore on close.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 after avatars); no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Afterglow pink #DB2777); sanctioned non-brand literals
 *   are the flag tints (green/red), four verdict tints, the CONTROL_REST
 *   rest-state pair (per the ≥3:1 interactive-boundary amendment), and the
 *   six person-gradient hex pairs (decorative dot/avatar fills) — each
 *   with contrast math at the declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', 44×44 icon buttons, 17px/600
 *   center title fading in via IntersectionObserver sentinel); largeTitle
 *   row 52px in flow (28px/700 + 13px/400 inline sub; total header 104px);
 *   tabBar 64px sticky bottom z20 (4 tabs, 24px icon over 11px/500 label);
 *   commitFooter sticky bottom:64 z19, 64px (48px primary + 8px block
 *   pad); toastDock sticky bottom:140 on Log (64 tab + 64 footer + 12),
 *   bottom:76 elsewhere; rows 44px utility / 60px two-line / 72px media
 *   (40px avatar); sectionHeader 13px/600 uppercase 0.06em at 32px, 20px
 *   top / 8px bottom; slider blocks 76px (16px/500 label + 22px/700
 *   tabular value, 28px control row: 4px track, 28px thumb, 96×32
 *   stepper with 44×44 half hits); chips 36px in 44px hit rows; dial
 *   240×130 centered; scatter card 260px (plot insets 12/12/20/20,
 *   committed dots 12px, draft 18px). TYPE (Figtree via
 *   --font-family-body): 28/700 · 22/700 · 17/600 · 16/400 body floor ·
 *   13/400 meta · 11/500 overlines; tabular-nums on every updating
 *   numeral. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   into full-row buttons; every gesture (row swipe, sheet drag) has a
 *   visible button path (44×44 ellipsis per row, clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow (overflowX:'clip' is
 *   backstop, not license): all cards gutter-inset with fluid widths; the
 *   scatter plot and slider tracks flex; the dial is a fixed 240×130
 *   block centered with marginInline auto (fits 320−32 = 288); chips
 *   wrap; VerdictDistBar bars are % of a flex track; stop-label buttons
 *   compress to flex:1 but never below 44px height.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   renders as a centered 390–430px phone column (maxWidth 430,
 *   marginInline auto, borderInline hairline). No desktop-specific
 *   anatomy.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  ChevronRightIcon,
  FlagIcon,
  MinusIcon,
  MoreHorizontalIcon,
  NotebookPenIcon,
  PlusIcon,
  RefreshCwIcon,
  ScatterChartIcon,
  SearchXIcon,
  Trash2Icon,
  UserIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Afterglow pink). White on #DB2777 ≈ 4.6:1
// (passes 4.5:1); #4C0524 text on #F9A8D4 ≈ 9.8:1.
const BRAND_ACCENT = 'light-dark(#DB2777, #F9A8D4)';
// Text over a BRAND_ACCENT fill — the pairs proven above.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #4C0524)';
// 12% brand wash for weight-2 chip fills and active filter chips.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// AMENDMENT PAIR — interactive rest-state boundaries/fills (slider rest
// track, switch OFF track, weight-0 chip borders) need ≥3:1 vs their
// ACTUAL surface, not the hairline token. #767E8B on the white card:
// relative luminance ≈ 0.207 → (1.05)/(0.257) ≈ 4.1:1 ✓ (≥3:1). #8B93A1
// on the dark card (~#1C1C1E, L ≈ 0.012): (0.328)/(0.062) ≈ 5.3:1 ✓.
const CONTROL_REST = 'light-dark(#767E8B, #8B93A1)';
// Green-flag tint: #15803D on white ≈ 4.6:1 (text) ✓; #86EFAC on the dark
// card ≈ 10.7:1 ✓ — both clear 4.5:1 text AND 3:1 for the chip borders
// against the card surface, including the 12% tinted wash at weight 2
// (the wash shifts the surface < 4% in luminance; math holds).
const GREEN_TINT = 'light-dark(#15803D, #86EFAC)';
// Red-flag tint: #B91C1C on white ≈ 6.4:1 ✓; #FCA5A5 on dark card ≈ 8.5:1 ✓.
const RED_TINT = 'light-dark(#B91C1C, #FCA5A5)';
// Verdict tints (meaningful fills — each ≥3:1 vs the card surface in its
// scheme; the light hexes ≥4.5:1 on white, the dark 300–400-weight hexes
// ≥7:1 on ~#1C1C1E): Never #6B7280/white ≈ 4.8:1, #9CA3AF/dark ≈ 7.4:1;
// Unsure #B45309/white ≈ 4.6:1, #FCD34D/dark ≈ 12.4:1; Friends
// #0F766E/white ≈ 5.4:1, #5EEAD4/dark ≈ 12.1:1; Excited #C2410C/white ≈
// 4.9:1, #FDBA74/dark ≈ 10.8:1. Again = BRAND_ACCENT (4.6:1 / 9.8:1).
const VERDICT_TINTS: Record<string, string> = {
  Never: 'light-dark(#6B7280, #9CA3AF)',
  Unsure: 'light-dark(#B45309, #FCD34D)',
  Friends: 'light-dark(#0F766E, #5EEAD4)',
  Again: BRAND_ACCENT,
  Excited: 'light-dark(#C2410C, #FDBA74)',
};
// Person gradients (decorative dot/avatar fills; the count/name always
// also renders as text). White avatar initials sit on the darker gradient
// midpoints — worst case Riley #34D399→#A3E635 midpoint ≈ #6CD967, where
// white ≈ 1.9:1, so avatar initials use a fixed dark ink instead:
// #1F2933 on every gradient midpoint ≥ 5.4:1 in both schemes ✓.
const AVATAR_INK = '#1F2933';
const PERSON_GRADIENTS: Record<string, [string, string]> = {
  Alex: ['#F472B6', '#FB923C'],
  Sam: ['#A78BFA', '#60A5FA'],
  Riley: ['#34D399', '#A3E635'],
  Jordan: ['#F87171', '#FBBF24'],
  Priya: ['#22D3EE', '#818CF8'],
  Marcus: ['#FB7185', '#F472B6'],
};
// Draft-dot gradient endpoints — two fixed stops, each channel-lerped by
// t = (spark + ease − 2) / 18 (cool at 2/20, warm at 20/20).
const DRAFT_COOL: [string, string] = ['#22D3EE', '#818CF8'];
const DRAFT_WARM: [string, string] = ['#F472B6', '#FB923C'];
// Sheet/alert scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, transform/opacity
// transitions, settle-pulse keyframes; everything collapses under
// prefers-reduced-motion (static color still encodes every state).
// ---------------------------------------------------------------------------

const AGL_CSS = `
.agl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.agl-btn:disabled { cursor: default; }
.agl-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.agl-anim { transition: transform 200ms ease, opacity 200ms ease; }
.agl-fade { transition: opacity 200ms ease; }
@keyframes agl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.agl-sheet-in { animation: agl-sheet-in 200ms ease; }
@keyframes agl-settle {
  0% { transform: translate(-50%, 50%) scale(1); }
  50% { transform: translate(-50%, 50%) scale(1.15); }
  100% { transform: translate(-50%, 50%) scale(1); }
}
.agl-settle { animation: agl-settle 320ms ease; }
@keyframes agl-whisper-up {
  from { transform: translateY(6px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.agl-whisper { animation: agl-whisper-up 200ms ease; }
.agl-vh {
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
  .agl-anim, .agl-fade { transition: none; }
  .agl-sheet-in, .agl-settle, .agl-whisper { animation: none; }
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
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline + blur always
  // on (this template's compact title is opacity-wired instead).
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
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // LARGE TITLE — 52px in flow below the navBar; whole line ellipsizes.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  h1: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.15},
  largeTitleSub: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  refreshCaption: {
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  sentinel: {height: 1, marginBottom: -1},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  section: {marginTop: 24},
  sectionFirst: {marginTop: 12},
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
  listCardPad: {padding: 16},
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // SLIDER BLOCK — 76px: label row then 28px control row.
  sliderBlock: {
    height: 76,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 16,
  },
  sliderHead: {display: 'flex', alignItems: 'baseline', gap: 20},
  sliderLabel: {flex: 1, fontSize: 16, fontWeight: 500},
  sliderValue: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  sliderControlRow: {display: 'flex', alignItems: 'center', gap: 12, height: 28},
  // Track — focusable role=slider; flex:1 min 80px so the 96px stepper
  // always fits at 320px.
  sliderTrackHit: {
    position: 'relative',
    flex: 1,
    minWidth: 80,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 8,
    touchAction: 'none',
  },
  // Rest track: CONTROL_REST (≥3:1 vs the card — amendment; math at the
  // declaration), NOT the hairline token.
  sliderTrack: {
    position: 'relative',
    width: '100%',
    height: 4,
    borderRadius: 999,
    background: CONTROL_REST,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    background: BRAND_ACCENT,
  },
  sliderThumb: {
    position: 'absolute',
    top: '50%',
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--color-background-card)',
    border: `2px solid ${BRAND_ACCENT}`,
    boxShadow: '0 1px 3px var(--color-shadow)',
    transform: 'translate(-50%, -50%)',
  },
  // Stepper — 96×32 visual, halves padded to 44×44 hits.
  stepperWrap: {position: 'relative', width: 96, height: 44, flexShrink: 0},
  stepperVisual: {
    position: 'absolute',
    inset: '6px 0',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    pointerEvents: 'none',
  },
  stepperHairline: {
    position: 'absolute',
    left: '50%',
    top: 6,
    bottom: 6,
    width: 1,
    background: 'var(--color-border)',
    pointerEvents: 'none',
  },
  stepperHalf: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 48,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperHalfDisabled: {opacity: 0.35},
  sliderCaption: {
    padding: '0 16px 12px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // SCATTER CARD — whole card is ONE button; 260px plot region.
  scatterCardBtn: {
    display: 'block',
    width: 'calc(100% - 32px)',
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  plotOuter: {position: 'relative', height: 260},
  plotInner: {position: 'absolute', top: 12, right: 12, bottom: 20, left: 20},
  plotMidX: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    background: 'var(--color-border)',
  },
  plotMidY: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '50%',
    height: 1,
    background: 'var(--color-border)',
  },
  axisX: {
    position: 'absolute',
    right: 12,
    bottom: 4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  axisY: {
    position: 'absolute',
    left: 4,
    top: 12,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: '50%',
    transform: 'translate(-50%, 50%)',
  },
  draftLayer: {position: 'absolute', inset: 0, pointerEvents: 'none'},
  draftDot: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 18,
    height: 18,
    borderRadius: '50%',
    transform: 'translate(-50%, 50%)',
    boxShadow: '0 1px 4px var(--color-shadow)',
  },
  draftRing: {
    position: 'absolute',
    inset: -5,
    borderRadius: '50%',
    border: `2px dashed ${BRAND_ACCENT}`,
  },
  whisperStrip: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 500,
    fontStyle: 'italic',
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  // FLAG TRAY — 36px chip visuals inside 44px hit rows, 8px inline gaps
  // (44px hits touching vertically ⇒ 8px visual clearance between pills).
  chipWrap: {display: 'flex', flexWrap: 'wrap', columnGap: 8, rowGap: 0, paddingInline: 16},
  chipHit: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  chipPill: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  tallyCaption: {
    padding: '4px 16px 12px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // VERDICT DIAL — 240×130 semicircle centered in the fluid card.
  dialCard: {
    marginInline: 16,
    padding: '16px 16px 8px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  dialCardError: {boxShadow: 'inset 0 0 0 2px var(--color-error)'},
  dialSvgWrap: {width: 240, height: 130, marginInline: 'auto'},
  suggestLine: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  stopRow: {display: 'flex', height: 44, marginTop: 4},
  stopBtn: {
    flex: 1,
    minWidth: 0,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  stopBtnOn: {color: BRAND_ACCENT, background: BRAND_TINT_12},
  fieldError: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
    fontSize: 13,
    color: 'var(--color-error)',
    justifyContent: 'center',
  },
  // NOTE FIELD.
  formField: {marginInline: 16, display: 'flex', flexDirection: 'column', gap: 8},
  fieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  textarea: {
    height: 88,
    resize: 'none',
    border: 'none',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    padding: '12px 16px',
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
  },
  // RECENT ROWS — 60px two-line, swipe-reveal delete + ellipsis fallback.
  rowOuter: {position: 'relative'},
  rowClip: {position: 'relative', overflow: 'hidden'},
  deleteAction: {
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
    background: 'var(--color-error)',
    // White on --color-error (error tokens are ≥4.5:1 with white by the
    // design system's own contract in both schemes).
    color: '#FFFFFF',
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
  recentRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  rowTextStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
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
  verdictDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // COMMITTED CARD — replaces the form after commit.
  committedCard: {
    marginInline: 16,
    padding: 20,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    textAlign: 'center',
  },
  committedTitle: {fontSize: 17, fontWeight: 600},
  secondaryBtn: {
    height: 36,
    paddingInline: 16,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // PEOPLE — 72px media rows with 40px DateCountRing avatars.
  peopleRowBtn: {
    width: '100%',
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  ringWrap: {position: 'relative', width: 48, height: 48, flexShrink: 0, display: 'grid', placeItems: 'center'},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: AVATAR_INK,
  },
  ringSvg: {position: 'absolute', inset: 0},
  // PATTERNS.
  insightStat: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  insightBody: {marginTop: 4, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.45},
  distRow: {display: 'flex', alignItems: 'center', gap: 8, height: 24, marginBottom: 8},
  distLabel: {
    width: 56,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  distTrack: {flex: 1, height: 24, display: 'flex', alignItems: 'center'},
  distBar: {height: 24, borderRadius: 6, minWidth: 2},
  distCount: {
    width: 20,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // ME — 44px utility rows; 51×31 switch on a full-row role=switch button.
  meRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  meRowLabel: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
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
    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
  },
  // TOAST DOCK — sticky-in-flow (bottom 140 on Log above footer+tabBar,
  // 76 elsewhere); flips to shell-absolute ONLY during sheet scroll-lock.
  toastDock: {
    position: 'sticky',
    zIndex: 30,
    paddingInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  // Shell-absolute variant — ONLY while the sheet scroll-locks the shell.
  toastDockAbs: {position: 'absolute', insetInline: 0},
  toast: {
    pointerEvents: 'auto',
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    paddingInline: 16,
  },
  toastText: {
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
  // COMMIT FOOTER — sticky bottom:64 z19 (stacks above the tabBar), 64px.
  commitFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    padding: '8px 16px',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  commitBtn: {
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
  tabItemOn: {color: BRAND_ACCENT},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelOn: {fontWeight: 600},
  // ANCHORED MENUS — absolute cards z30 (below the sheet scrim's z40).
  anchoredMenu: {
    position: 'absolute',
    right: 8,
    zIndex: 30,
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
    paddingInline: 12,
    fontSize: 16,
  },
  menuRowDestructive: {color: 'var(--color-error)'},
  menuRowText: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
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
  sheetSubhead: {fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', margin: '12px 0 8px'},
  readoutRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  readoutCell: {
    flex: 1,
    minWidth: 0,
    padding: '10px 12px',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  readoutValue: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  sheetPlot: {
    position: 'relative',
    height: 320,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    marginBottom: 12,
  },
  sheetPlotMedium: {height: 150},
  countCaption: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums', textAlign: 'center', marginTop: 8},
  // Empty state (filtered-empty only — no skeletons in this template).
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
  emptyTitle: {fontSize: 17, fontWeight: 600},
  emptyBody: {marginTop: 4, fontSize: 13, color: 'var(--color-text-secondary)'},
  emptyAction: {marginTop: 16},
  // ALERT — z60/z61, scrim click does NOT dismiss.
  alertScrim: {position: 'absolute', inset: 0, zIndex: 60, background: SCRIM},
  alert: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
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
  alertBtn: {flex: 1, height: 44, display: 'grid', placeItems: 'center', fontSize: 17},
  alertBtnRule: {width: 1, background: 'var(--color-border)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — SINGLE identity consts block. Cross-check ledger (verified by
// hand): per-person counts 1(Alex)+3(Sam)+2(Riley)+1(Jordan)+3(Priya)+
// 2(Marcus) = 12; verdict distribution 1 Never + 1 Unsure + 2 Friends +
// 5 Again + 3 Excited = 12; ease≥7 entries = e02,e03,e04,e05,e07,e08,e09,
// e10,e11 = 9 of 12; first-date-ease≥7 people = Sam(7), Riley(7),
// Jordan(7), Priya(9), Marcus(7) = 5, of whom Sam/Riley/Priya/Marcus have
// a date #2 → '4 of 5' (Alex's first-date ease is 6, so committing the
// draft NEVER moves that card); Excited entries = exactly e04, e08, e09,
// all carrying 'Planned it' → the whisper claim; e04 and e10 share
// (spark 9, ease 8) → the deterministic collision offset fixture.
// ---------------------------------------------------------------------------

const VERDICTS = ['Never', 'Unsure', 'Friends', 'Again', 'Excited'] as const;
type Verdict = (typeof VERDICTS)[number];

const PEOPLE_ORDER = ['Alex', 'Sam', 'Riley', 'Jordan', 'Priya', 'Marcus'] as const;
type PersonName = (typeof PEOPLE_ORDER)[number];

const GREEN_FLAGS = ['Asked questions', 'On time', 'Made me laugh', 'Planned it', 'Easy silences', 'Paid attention'] as const;
const RED_FLAGS = ['Phone out', 'Talked over me', 'Late no text', 'Ex talk', 'Rude to staff', 'Vague plans'] as const;

type FlagWeight = 0 | 1 | 2;

interface EntryFlag {
  flag: string;
  weight: 1 | 2;
}

interface Entry {
  id: string;
  person: PersonName;
  dateNum: number;
  spark: number; // 1–10, dual field beside the scatter's bottom% render
  ease: number; // 1–10, dual field beside the scatter's left% render
  verdict: Verdict;
  flags: EntryFlag[];
  dateLabel: string; // fixed string — no Date.now()
  note: string;
}

// Chronological order e01..e12; the RECENT list renders newest-first
// (e12..e01) and commit appends e13 at the end (top of the list).
const ENTRIES: Entry[] = [
  {id: 'e01', person: 'Alex', dateNum: 1, spark: 6, ease: 6, verdict: 'Again', flags: [{flag: 'Made me laugh', weight: 1}], dateLabel: 'May 3', note: 'Talked till the bar closed.'},
  {id: 'e02', person: 'Sam', dateNum: 1, spark: 8, ease: 7, verdict: 'Again', flags: [{flag: 'Asked questions', weight: 1}], dateLabel: 'May 9', note: 'Remembered my sister’s name.'},
  {id: 'e03', person: 'Sam', dateNum: 2, spark: 8, ease: 8, verdict: 'Again', flags: [{flag: 'Easy silences', weight: 1}], dateLabel: 'May 16', note: 'Quiet walk, zero awkward.'},
  {id: 'e04', person: 'Sam', dateNum: 3, spark: 9, ease: 8, verdict: 'Excited', flags: [{flag: 'Planned it', weight: 2}], dateLabel: 'May 24', note: 'Booked the rooftop without being asked.'},
  {id: 'e05', person: 'Riley', dateNum: 1, spark: 5, ease: 7, verdict: 'Unsure', flags: [], dateLabel: 'May 30', note: 'Nice, but no pull.'},
  {id: 'e06', person: 'Riley', dateNum: 2, spark: 4, ease: 6, verdict: 'Friends', flags: [{flag: 'Phone out', weight: 1}], dateLabel: 'Jun 5', note: 'Checked scores twice mid-story.'},
  {id: 'e07', person: 'Jordan', dateNum: 1, spark: 3, ease: 7, verdict: 'Never', flags: [{flag: 'Ex talk', weight: 2}], dateLabel: 'Jun 7', note: 'Forty minutes on the ex’s dog.'},
  {id: 'e08', person: 'Priya', dateNum: 1, spark: 9, ease: 9, verdict: 'Excited', flags: [{flag: 'Planned it', weight: 1}, {flag: 'Made me laugh', weight: 1}], dateLabel: 'Jun 12', note: 'Gallery, then dumplings. Perfect.'},
  {id: 'e09', person: 'Priya', dateNum: 2, spark: 8, ease: 9, verdict: 'Excited', flags: [{flag: 'Planned it', weight: 1}], dateLabel: 'Jun 18', note: 'She had a backup plan for rain.'},
  {id: 'e10', person: 'Priya', dateNum: 3, spark: 9, ease: 8, verdict: 'Again', flags: [{flag: 'On time', weight: 1}], dateLabel: 'Jun 21', note: 'Early, with iced coffee for me.'},
  {id: 'e11', person: 'Marcus', dateNum: 1, spark: 7, ease: 7, verdict: 'Again', flags: [], dateLabel: 'Jun 24', note: 'Solid first — split the bill clean.'},
  {id: 'e12', person: 'Marcus', dateNum: 2, spark: 6, ease: 5, verdict: 'Friends', flags: [{flag: 'Vague plans', weight: 1}], dateLabel: 'Jun 28', note: '“Somewhere around 8-ish” again.'},
];

interface Draft {
  person: PersonName;
  dateNum: number;
  spark: number;
  ease: number;
  flags: Record<string, FlagWeight>;
  verdict: Verdict | null;
  note: string;
}

// Initial ghost: score = 4 + 7 + 2·(1 − 0) = 13 → Unsure. Signature
// check: spark→8 gives 8 + 7 + 2 = 17 → Again.
const DRAFT_FIXTURE: Draft = {
  person: 'Alex',
  dateNum: 2,
  spark: 4,
  ease: 7,
  flags: {'Made me laugh': 1},
  verdict: null,
  note: '',
};

// Stress fixture (1): a 240-char note demonstrated via placeholder only —
// committed e13 stores whatever is typed (empty is legal).
const NOTE_PLACEHOLDER =
  'The moment worth keeping — e.g. “Halfway through dessert Alex did the thing where they narrate both sides of an argument between the espresso machine and the pastry case, complete with voices, and the table next to us started taking sides, and I realized I hadn’t checked my phone once all night.”';

// ---------------------------------------------------------------------------
// SUGGESTION FORMULA (verbatim per spec):
//   score = spark + ease + 2*(Σgreen − Σred)
//   bands: ≤8 Never, 9–13 Unsure, 14–16 Friends, 17–19 Again, ≥20 Excited.
// Extreme-score demo (stress fixture 3, documented — no NaN/overflow in
// the angle map because the band is discrete): all 6 reds at weight 2
// with spark 1 / ease 1 → 1+1+2·(0−12) = −22 → clamps into Never (≤8);
// all 6 greens at weight 2 with 10/10 → 10+10+2·12 = 44 → Excited (≥20).
// ---------------------------------------------------------------------------

function flagSums(flags: Record<string, FlagWeight>): {green: number; red: number} {
  let green = 0;
  let red = 0;
  for (const flag of GREEN_FLAGS) green += flags[flag] ?? 0;
  for (const flag of RED_FLAGS) red += flags[flag] ?? 0;
  return {green, red};
}

function scoreFor(spark: number, ease: number, flags: Record<string, FlagWeight>): number {
  const {green, red} = flagSums(flags);
  return spark + ease + 2 * (green - red);
}

function bandFor(score: number): Verdict {
  if (score <= 8) return 'Never';
  if (score <= 13) return 'Unsure';
  if (score <= 16) return 'Friends';
  if (score <= 19) return 'Again';
  return 'Excited';
}

// Dial stop angles — Never/Unsure/Friends/Again/Excited at −90/−45/0/+45/+90.
const STOP_ANGLE: Record<Verdict, number> = {Never: -90, Unsure: -45, Friends: 0, Again: 45, Excited: 90};

/** Channel-lerp two hex colors by t ∈ [0,1] — deterministic, no randomness. */
function lerpHex(from: string, to: string, t: number): string {
  const f = parseInt(from.slice(1), 16);
  const g = parseInt(to.slice(1), 16);
  const ch = (shift: number) => {
    const a = (f >> shift) & 0xff;
    const b = (g >> shift) & 0xff;
    return Math.round(a + (b - a) * t);
  };
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

/** Draft-dot gradient: two fixed stops lerped by t = (spark+ease−2)/18. */
function draftGradient(spark: number, ease: number): string {
  const t = Math.max(0, Math.min(1, (spark + ease - 2) / 18));
  return `radial-gradient(circle at 35% 30%, ${lerpHex(DRAFT_COOL[0], DRAFT_WARM[0], t)}, ${lerpHex(DRAFT_COOL[1], DRAFT_WARM[1], t)})`;
}

function personGradient(person: PersonName): string {
  const [a, b] = PERSON_GRADIENTS[person];
  return `radial-gradient(circle at 35% 30%, ${a}, ${b})`;
}

// Scatter coordinates — x = Ease 1–10, y = Spark 1–10:
// left% = (ease−1)/9·100, bottom% = (spark−1)/9·100 within plot insets.
function leftPct(ease: number): number {
  return ((ease - 1) / 9) * 100;
}
function bottomPct(spark: number): number {
  return ((spark - 1) / 9) * 100;
}

// COLLISION RULE (deterministic, never random): dots are laid down in
// entry order; the nth dot sharing an exact (spark, ease) coordinate
// shifts x by +8px per collision index. Fixture proof: e04 and e10 share
// (spark 9, ease 8) → e10 renders 8px right of e04.
function collisionOffsets(entries: Entry[]): Map<string, number> {
  const seen = new Map<string, number>();
  const offsets = new Map<string, number>();
  for (const entry of entries) {
    const key = `${entry.spark}:${entry.ease}`;
    const n = seen.get(key) ?? 0;
    offsets.set(entry.id, n * 8);
    seen.set(key, n + 1);
  }
  return offsets;
}

// ---------------------------------------------------------------------------
// HOOKS & FOCUS UTILITIES
// ---------------------------------------------------------------------------

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
 * wrapper can tell the 390px mobile stage from the desktop stage. */
function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) return undefined;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) setWidth(rect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), textarea, [tabindex="0"]');
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

/** Find the scrolling ancestor of the shell (the demo's .preview-wrap owns
 * page scroll; falls back to the document scroller). */
function scrollParentOf(node: HTMLElement | null): HTMLElement {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const style = window.getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 24px crescent-moon-dissolving-to-three-dots in a 44×44
// NON-button nav slot (Log is the root; the mark pushes nothing).
// ---------------------------------------------------------------------------

function AfterglowMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        {/* Crescent: full disc minus an offset disc. */}
        <path d="M13.6 3.2a8.8 8.8 0 1 0 6.9 12.9 7 7 0 0 1-6.9-12.9Z" fill={BRAND_ACCENT} />
        {/* ...dissolving to three afterglow dots. */}
        <circle cx="16.4" cy="6.4" r="1.6" fill={BRAND_ACCENT} opacity={0.8} />
        <circle cx="19.6" cy="9.4" r="1.2" fill={BRAND_ACCENT} opacity={0.55} />
        <circle cx="21.4" cy="13" r="0.9" fill={BRAND_ACCENT} opacity={0.35} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SLIDER BLOCK — 76px: 16px/500 label + 22px/700 tabular value row, then a
// 28px control row (4px track flex:1 min 80px, 28px thumb, 12px gap,
// 96×32 stepper with 44×44 half hits). Track is role=slider with
// ArrowLeft/Right step 1 and Home/End to 1/10; stepper halves are real
// buttons 'Increase/Decrease <thing>' disabled at the exhausted end.
// ---------------------------------------------------------------------------

interface SliderBlockProps {
  label: 'Spark' | 'Ease';
  value: number;
  onChange: (next: number) => void;
}

function SliderBlock({label, value, onChange}: SliderBlockProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (track == null) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(Math.round(ratio * 9) + 1);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(1, value - 1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(10, value + 1);
    else if (event.key === 'Home') next = 1;
    else if (event.key === 'End') next = 10;
    if (next != null) {
      event.preventDefault();
      onChange(next);
    }
  };

  const pct = leftPct(value); // same 1–10 → 0–100% law as the scatter
  return (
    <div style={styles.sliderBlock}>
      <div style={styles.sliderHead}>
        <span style={styles.sliderLabel} id={`agl-slider-${label}`}>
          {label}
        </span>
        <span style={styles.sliderValue}>{value}</span>
      </div>
      <div style={styles.sliderControlRow}>
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          className="agl-focusable"
          aria-label={label}
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={value}
          style={styles.sliderTrackHit}
          onKeyDown={onKeyDown}
          onPointerDown={event => {
            draggingRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            setFromClientX(event.clientX);
          }}
          onPointerMove={event => {
            if (draggingRef.current) setFromClientX(event.clientX);
          }}
          onPointerUp={() => {
            draggingRef.current = false;
          }}>
          <div style={styles.sliderTrack}>
            <div style={{...styles.sliderFill, width: `${pct}%`}} />
          </div>
          <div className="agl-anim" style={{...styles.sliderThumb, left: `${pct}%`}} />
        </div>
        <div style={styles.stepperWrap}>
          <span style={styles.stepperVisual} aria-hidden />
          <span style={styles.stepperHairline} aria-hidden />
          <button
            type="button"
            className="agl-btn agl-focusable"
            style={{...styles.stepperHalf, left: 0, ...(value <= 1 ? styles.stepperHalfDisabled : null)}}
            aria-label={`Decrease ${label.toLowerCase()}`}
            disabled={value <= 1}
            onClick={() => onChange(Math.max(1, value - 1))}>
            <Icon icon={MinusIcon} size="sm" color="inherit" />
          </button>
          <button
            type="button"
            className="agl-btn agl-focusable"
            style={{...styles.stepperHalf, right: 0, ...(value >= 10 ? styles.stepperHalfDisabled : null)}}
            aria-label={`Increase ${label.toLowerCase()}`}
            disabled={value >= 10}
            onClick={() => onChange(Math.min(10, value + 1))}>
            <Icon icon={PlusIcon} size="sm" color="inherit" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SCATTER PLOT — shared by the Log card (260px) and the sheet (150/320px).
// Dots are aria-hidden (the data is reachable as rows in the recent list
// and the sheet's readout); the Log card's single wrapping <button>
// carries the computed summary label.
// ---------------------------------------------------------------------------

interface ScatterPlotProps {
  entries: Entry[];
  draft: Draft | null;
  pulseId: string | null;
  reducedMotion: boolean;
}

function ScatterPlot({entries, draft, pulseId, reducedMotion}: ScatterPlotProps) {
  const offsets = collisionOffsets(entries);
  return (
    <div style={styles.plotInner} aria-hidden>
      <div style={styles.plotMidX} />
      <div style={styles.plotMidY} />
      {entries.map(entry => (
        <span
          key={entry.id}
          className={entry.id === pulseId && !reducedMotion ? 'agl-settle' : undefined}
          style={{
            ...styles.dot,
            left: `${leftPct(entry.ease)}%`,
            bottom: `${bottomPct(entry.spark)}%`,
            marginLeft: offsets.get(entry.id) ?? 0,
            background: personGradient(entry.person),
          }}
        />
      ))}
      {draft != null ? (
        <div
          className="agl-anim"
          style={{
            ...styles.draftLayer,
            // Transform-only glide (200ms; instant under reduced motion):
            // the full-size layer translates by (left%, top%) of the plot,
            // the dot sits at the layer's origin.
            transform: `translate(${leftPct(draft.ease)}%, ${100 - bottomPct(draft.spark)}%)`,
            transition: reducedMotion ? 'none' : undefined,
          }}>
          <span style={{...styles.draftDot, background: draftGradient(draft.spark, draft.ease)}}>
            <span style={styles.draftRing} />
          </span>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// VERDICT DIAL — 240×130 semicircle; 5 stops at −90/−45/0/+45/+90°;
// committed needle 3×92 BRAND (hidden until a stop is picked); ghost tick
// 2×14 dashed at the suggested stop, always visible, aria-hidden (its
// info lives in the visible 'Suggested: X' line). Stop labels are a
// role=radiogroup with arrow-key movement.
// ---------------------------------------------------------------------------

const DIAL_CX = 120;
const DIAL_CY = 122;
const DIAL_R = 92;

function dialPoint(deg: number, radius: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: DIAL_CX + radius * Math.sin(rad), y: DIAL_CY - radius * Math.cos(rad)};
}

interface VerdictDialProps {
  suggested: Verdict;
  chosen: Verdict | null;
  error: boolean;
  reducedMotion: boolean;
  onChoose: (verdict: Verdict) => void;
  firstStopRef: RefObject<HTMLButtonElement | null>;
}

function VerdictDial({suggested, chosen, error, reducedMotion, onChoose, firstStopRef}: VerdictDialProps) {
  const arcFrom = dialPoint(-90, DIAL_R);
  const arcTo = dialPoint(90, DIAL_R);
  const ghostA = dialPoint(STOP_ANGLE[suggested], DIAL_R - 7);
  const ghostB = dialPoint(STOP_ANGLE[suggested], DIAL_R + 7);
  const suggestText =
    chosen != null && chosen !== suggested ? `Suggested: ${suggested} · You chose: ${chosen}` : `Suggested: ${suggested}`;

  const onGroupKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const current = chosen ?? suggested;
    const index = VERDICTS.indexOf(current);
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, index - 1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(VERDICTS.length - 1, index + 1);
    if (next != null) {
      event.preventDefault();
      onChoose(VERDICTS[next]);
      const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button');
      buttons[next]?.focus();
    }
  };

  return (
    <div style={{...styles.dialCard, ...(error ? styles.dialCardError : null)}}>
      <div style={styles.dialSvgWrap}>
        <svg width="100%" height="100%" viewBox="0 0 240 130" fill="none" aria-hidden>
          {/* Scale arc — CONTROL_REST per the ≥3:1 rest-fill amendment
              (math at the declaration), not the hairline token. */}
          <path
            d={`M ${arcFrom.x.toFixed(1)} ${arcFrom.y.toFixed(1)} A ${DIAL_R} ${DIAL_R} 0 0 1 ${arcTo.x.toFixed(1)} ${arcTo.y.toFixed(1)}`}
            stroke={CONTROL_REST}
            strokeWidth={4}
            strokeLinecap="round"
          />
          {VERDICTS.map(verdict => {
            const a = dialPoint(STOP_ANGLE[verdict], DIAL_R - 5);
            const b = dialPoint(STOP_ANGLE[verdict], DIAL_R + 5);
            return (
              <line
                key={verdict}
                x1={a.x.toFixed(1)}
                y1={a.y.toFixed(1)}
                x2={b.x.toFixed(1)}
                y2={b.y.toFixed(1)}
                stroke={CONTROL_REST}
                strokeWidth={2}
              />
            );
          })}
          {/* Ghost tick — 2×14 dashed at the suggested stop. */}
          <line
            x1={ghostA.x.toFixed(1)}
            y1={ghostA.y.toFixed(1)}
            x2={ghostB.x.toFixed(1)}
            y2={ghostB.y.toFixed(1)}
            stroke="var(--color-text-secondary)"
            strokeWidth={2}
            strokeDasharray="3 3"
            className="agl-fade"
          />
          {/* Committed needle — 3×92, rotates 200ms (instant under
              reduced motion), hidden until the user picks. */}
          {chosen != null ? (
            <g
              className="agl-anim"
              style={{
                transform: `rotate(${STOP_ANGLE[chosen]}deg)`,
                transformOrigin: `${DIAL_CX}px ${DIAL_CY}px`,
                transformBox: 'view-box',
                transition: reducedMotion ? 'none' : undefined,
              }}>
              <rect x={DIAL_CX - 1.5} y={DIAL_CY - DIAL_R} width={3} height={DIAL_R} rx={1.5} fill={BRAND_ACCENT} />
            </g>
          ) : null}
          <circle cx={DIAL_CX} cy={DIAL_CY} r={5} fill={chosen != null ? BRAND_ACCENT : CONTROL_REST} />
        </svg>
      </div>
      <p style={styles.suggestLine}>{suggestText}</p>
      <div role="radiogroup" aria-label="Verdict" style={styles.stopRow} onKeyDown={onGroupKeyDown}>
        {VERDICTS.map((verdict, index) => {
          const on = chosen === verdict;
          return (
            <button
              key={verdict}
              ref={index === 0 ? firstStopRef : undefined}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on || (chosen == null && index === 0) ? 0 : -1}
              className="agl-btn agl-focusable"
              style={{...styles.stopBtn, ...(on ? styles.stopBtnOn : null)}}
              onClick={() => onChoose(verdict)}>
              {verdict}
            </button>
          );
        })}
      </div>
      {error ? (
        <div style={styles.fieldError} id="agl-dial-error">
          Pick a verdict
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DATE COUNT RING — 40px avatar (person gradient + 17px/600 initial in
// AVATAR_INK, ≥5.4:1 on every gradient midpoint) wrapped by an SVG ring of
// N arc segments (270° total split N ways, 3px stroke, 4px gaps ≈ 10.4°
// at r22) in the person's latest-verdict tint. Decorative (aria-hidden) —
// the count also lives in the row meta text.
// ---------------------------------------------------------------------------

interface DateCountRingProps {
  person: PersonName;
  count: number;
  tint: string | null;
}

function DateCountRing({person, count, tint}: DateCountRingProps) {
  const segments: string[] = [];
  if (count > 0 && tint != null) {
    const gapDeg = 10.4;
    const segDeg = count === 1 ? 270 : 270 / count - gapDeg;
    for (let i = 0; i < count; i++) {
      const start = -135 + i * (segDeg + gapDeg);
      const from = {x: 24 + 22 * Math.sin((start * Math.PI) / 180), y: 24 - 22 * Math.cos((start * Math.PI) / 180)};
      const end = start + segDeg;
      const to = {x: 24 + 22 * Math.sin((end * Math.PI) / 180), y: 24 - 22 * Math.cos((end * Math.PI) / 180)};
      segments.push(
        `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A 22 22 0 ${segDeg > 180 ? 1 : 0} 1 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`,
      );
    }
  }
  return (
    <span style={styles.ringWrap} aria-hidden>
      <svg width={48} height={48} viewBox="0 0 48 48" fill="none" style={styles.ringSvg} aria-hidden>
        {segments.map(d => (
          <path key={d} d={d} stroke={tint ?? 'var(--color-border)'} strokeWidth={3} strokeLinecap="round" />
        ))}
      </svg>
      <span
        style={{
          ...styles.avatar,
          background: count > 0 ? personGradient(person) : 'var(--color-background-muted)',
          color: count > 0 ? AVATAR_INK : 'var(--color-text-secondary)',
        }}>
        {person[0]}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// VERDICT DIST BAR — 5 horizontal 24px bars, widths proportional to counts
// (fixture: 1/1/2/5/3 of 12), verdict tints, trailing tabular counts,
// footer 'All 12 debriefs' (1+1+2+5+3 = 12 — derives live).
// ---------------------------------------------------------------------------

function VerdictDistBar({entries}: {entries: Entry[]}) {
  const counts = VERDICTS.map(verdict => entries.filter(entry => entry.verdict === verdict).length);
  const total = entries.length;
  return (
    <div style={{...styles.listCard, ...styles.listCardPad}}>
      {VERDICTS.map((verdict, index) => (
        <div key={verdict} style={styles.distRow}>
          <span style={styles.distLabel}>{verdict}</span>
          <span style={styles.distTrack}>
            <span
              style={{
                ...styles.distBar,
                width: `${total > 0 ? (counts[index] / total) * 100 : 0}%`,
                background: VERDICT_TINTS[verdict],
              }}
            />
          </span>
          <span style={styles.distCount}>{counts[index]}</span>
        </div>
      ))}
      <div style={{...styles.terminalCaption, marginTop: 8}}>All {total} debriefs</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone is a real 'Resize sheet' button toggling
// MEDIUM (55%) / LARGE (calc(100% − 56px)); 52px header with 44×44 X;
// focus-trapped dialog; content owns the ONE legal inner overflowY:auto.
// ---------------------------------------------------------------------------

interface SheetProps {
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

function Sheet({detent, onDetentChange, onClose, sheetRef, children}: SheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="agl-sheet-title"
      tabIndex={-1}
      className="agl-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{...styles.sheet, height: detent === 'medium' ? '55%' : 'calc(100% - 56px)'}}>
      <button
        type="button"
        className="agl-btn agl-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
        onClick={() => onDetentChange(detent === 'medium' ? 'large' : 'medium')}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id="agl-sheet-title" style={styles.sheetTitle}>
          Pattern map
        </h2>
        <button type="button" className="agl-btn agl-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RECENT ROW — 60px two-line row; horizontal drag reveals the 72px
// --color-error Delete block (snap −72, one open at a time) with the
// MANDATORY visible 44×44 ellipsis fallback opening the same action as an
// anchored menu. Delete obeys undo-over-confirm: executes immediately.
// ---------------------------------------------------------------------------

interface RecentRowProps {
  entry: Entry;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  rowBtnRef?: RefObject<HTMLButtonElement | null>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onDelete: () => void;
}

function RecentRow({
  entry,
  isSwipeOpen,
  isMenuOpen,
  isLast,
  reducedMotion,
  menuRef,
  rowBtnRef,
  onSwipeOpen,
  onSwipeClose,
  onToggleMenu,
  onDelete,
}: RecentRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const base = isSwipeOpen ? -72 : 0;
  const offset = dragX != null ? Math.max(-72, Math.min(0, base + dragX)) : base;

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
    const settled = Math.max(-72, Math.min(0, base + dragX));
    setDragX(null);
    if (movedRef.current) {
      if (settled < -36) onSwipeOpen();
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
    <div style={styles.rowOuter}>
      <div style={styles.rowClip}>
        <button
          type="button"
          className="agl-btn"
          style={styles.deleteAction}
          tabIndex={isSwipeOpen ? 0 : -1}
          aria-hidden={!isSwipeOpen}
          onClick={onDelete}>
          <Icon icon={Trash2Icon} size="sm" color="inherit" />
          Delete
        </button>
        <div
          style={{
            ...styles.rowContent,
            transform: offset !== 0 ? `translateX(${offset}px)` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 200ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            ref={rowBtnRef}
            className="agl-btn agl-focusable"
            style={styles.recentRowBtn}
            aria-label={`${entry.person}, date ${entry.dateNum}, verdict ${entry.verdict}`}
            onClick={guardClick(opener => {
              if (isSwipeOpen) onSwipeClose();
              else onToggleMenu(opener);
            })}>
            <span style={styles.rowTextStack}>
              <span style={styles.rowPrimary}>
                {entry.person} · date #{entry.dateNum}
              </span>
              <span style={styles.rowSecondary}>
                {entry.verdict} · spark {entry.spark} · ease {entry.ease} · {entry.dateLabel}
              </span>
            </span>
            <span style={{...styles.verdictDot, background: VERDICT_TINTS[entry.verdict]}} aria-hidden />
          </button>
          <button
            type="button"
            className="agl-btn agl-focusable"
            style={styles.iconBtn}
            aria-label={`Actions for ${entry.person} date ${entry.dateNum}`}
            aria-expanded={isMenuOpen}
            onClick={guardClick(onToggleMenu)}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div ref={menuRef} role="menu" aria-label={`Actions for ${entry.person} date ${entry.dateNum}`} style={{...styles.anchoredMenu, top: 52, right: 12}}>
          <button
            type="button"
            role="menuitem"
            className="agl-btn agl-focusable"
            style={{...styles.menuRow, ...styles.menuRowDestructive}}
            onClick={onDelete}>
            <Icon icon={Trash2Icon} size="sm" color="inherit" />
            <span style={styles.menuRowText}>Delete debrief</span>
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — journalStore: entries + draft + all UI state behind a
// single update(patch) mutator (complex mutations go through the same
// setState). People rows, verdict distribution, insight cards, the ghost
// suggestion, and every count are DERIVED in render from entries + draft —
// never duplicated.
// ---------------------------------------------------------------------------

type TabId = 'log' | 'people' | 'patterns' | 'me';

interface ToastState {
  seq: number;
  text: string;
  undo: {entry: Entry; index: number} | null;
}

interface JournalState {
  entries: Entry[];
  draft: Draft;
  committed: boolean;
  activeTab: TabId;
  scrollByTab: Partial<Record<TabId, number>>;
  sheet: null | 'medium' | 'large';
  sheetFilters: {person: PersonName | null; verdict: Verdict | null};
  navMenuOpen: boolean;
  rowMenuId: string | null;
  openSwipeId: string | null;
  alert: null | 'discard';
  toast: ToastState | null;
  dialTouched: boolean;
  dialError: boolean;
  refreshed: boolean;
  expandedRecent: boolean;
  remindersOn: boolean;
  pulseId: string | null;
}

const INITIAL_STATE: JournalState = {
  entries: ENTRIES,
  draft: DRAFT_FIXTURE,
  committed: false,
  activeTab: 'log',
  scrollByTab: {},
  sheet: null,
  sheetFilters: {person: null, verdict: null},
  navMenuOpen: false,
  rowMenuId: null,
  openSwipeId: null,
  alert: null,
  toast: null,
  dialTouched: false,
  dialError: false,
  refreshed: false,
  expandedRecent: false,
  remindersOn: true,
  pulseId: null,
};

const TABS: {id: TabId; label: string; icon: typeof UserIcon; title: string}[] = [
  {id: 'log', label: 'Log', icon: NotebookPenIcon, title: 'Debrief'},
  {id: 'people', label: 'People', icon: UsersIcon, title: 'People'},
  {id: 'patterns', label: 'Patterns', icon: ScatterChartIcon, title: 'Patterns'},
  {id: 'me', label: 'Me', icon: UserIcon, title: 'Me'},
];

function quadrantCaption(spark: number, ease: number): string {
  const hiSpark = spark > 5.5;
  const hiEase = ease > 5.5;
  if (hiSpark && hiEase) return 'High spark · high ease — the keeper quadrant';
  if (hiSpark) return 'High spark · low ease — exciting but effortful';
  if (hiEase) return 'High ease · spark still warming';
  return 'Low spark · low ease — probably a pass';
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileDateDebriefLogTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<JournalState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<JournalState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);

  const {entries, draft, committed} = state;

  // Refs — focus restored to the opener on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const alertOpenerRef = useRef<HTMLElement | null>(null);
  const navMenuRef = useRef<HTMLDivElement | null>(null);
  const rowMenuRef = useRef<HTMLDivElement | null>(null);
  const alertKeepRef = useRef<HTMLButtonElement | null>(null);
  const dialCardRef = useRef<HTMLDivElement | null>(null);
  const firstStopRef = useRef<HTMLButtonElement | null>(null);
  const firstAppendedRef = useRef<HTMLButtonElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const toastSeqRef = useRef(0);
  const [navTitleVisible, setNavTitleVisible] = useState(false);

  const toastPatch = (text: string, undo: ToastState['undo'] = null): {toast: ToastState} => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undo}};
  };

  // DERIVED — everything recomputes from entries + draft in render.
  const suggested = bandFor(scoreFor(draft.spark, draft.ease, draft.flags));
  const tally = flagSums(draft.flags);
  const people = PEOPLE_ORDER.map(name => {
    const theirs = entries.filter(entry => entry.person === name);
    const last = theirs.length > 0 ? theirs[theirs.length - 1] : null;
    return {name, count: theirs.length, lastVerdict: last?.verdict ?? null};
  });
  const easeHighCount = entries.filter(entry => entry.ease >= 7).length;
  const firstHighEasePeople = PEOPLE_ORDER.filter(name =>
    entries.some(entry => entry.person === name && entry.dateNum === 1 && entry.ease >= 7),
  );
  const gotSecondDate = firstHighEasePeople.filter(name =>
    entries.some(entry => entry.person === name && entry.dateNum === 2),
  );
  const excitedEntries = entries.filter(entry => entry.verdict === 'Excited');
  const excitedPlanned = excitedEntries.filter(entry => entry.flags.some(flag => flag.flag === 'Planned it'));
  const excitedInsight =
    excitedEntries.length > 0 && excitedPlanned.length === excitedEntries.length
      ? `All ${excitedEntries.length} of your Excited dates were planned by them`
      : `${excitedPlanned.length} of ${excitedEntries.length} Excited dates were planned by them`;
  const whisperOn = !committed && draft.spark > 5.5 && draft.ease > 5.5;
  const recentNewestFirst = [...entries].reverse();
  const visibleRecent = state.expandedRecent ? recentNewestFirst : recentNewestFirst.slice(0, 3);
  const hiddenCount = recentNewestFirst.length - 3;
  const sheetEntries = entries.filter(
    entry =>
      (state.sheetFilters.person == null || entry.person === state.sheetFilters.person) &&
      (state.sheetFilters.verdict == null || entry.verdict === state.sheetFilters.verdict),
  );
  const filtersActive = state.sheetFilters.person != null || state.sheetFilters.verdict != null;
  const activeTabDef = TABS.find(tab => tab.id === state.activeTab) ?? TABS[0];
  const footerVisible = state.activeTab === 'log' && !committed;
  const dockBottom = footerVisible ? 140 : 76;

  // Large-title collapse — IntersectionObserver on the sentinel above the
  // largeTitle (user-scroll driven, deterministic).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(
      observed => setNavTitleVisible(observed[0] != null && !observed[0].isIntersecting),
      {root: null, rootMargin: '-53px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [state.activeTab]);

  // Focus into an opening sheet — preventScroll, or the browser scroll-
  // reveals the animating sheet inside the locked overflow-hidden column
  // and beaches it mid-screen (foundations amendment).
  useEffect(() => {
    if (state.sheet != null) sheetRef.current?.focus({preventScroll: true});
  }, [state.sheet != null]);
  useEffect(() => {
    if (state.navMenuOpen) navMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [state.navMenuOpen]);
  useEffect(() => {
    if (state.rowMenuId != null) rowMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [state.rowMenuId]);
  useEffect(() => {
    if (state.alert != null) alertKeepRef.current?.focus({preventScroll: true});
  }, [state.alert]);
  useEffect(() => {
    if (state.expandedRecent) firstAppendedRef.current?.focus({preventScroll: true});
  }, [state.expandedRecent]);

  // OVERLAY LIFECYCLE --------------------------------------------------------

  const openSheet = (detent: 'medium' | 'large', opener: HTMLElement | null, personFilter: PersonName | null = null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update({
      sheet: detent,
      sheetFilters: {person: personFilter, verdict: null},
      navMenuOpen: false,
      rowMenuId: null,
      openSwipeId: null,
    });
  };
  const closeSheet = () => {
    update({sheet: null});
    sheetOpenerRef.current?.focus();
  };
  const closeNavMenu = () => {
    update({navMenuOpen: false});
    menuOpenerRef.current?.focus();
  };
  const closeRowMenu = () => {
    update({rowMenuId: null});
    menuOpenerRef.current?.focus();
  };
  const closeAlert = () => {
    update({alert: null});
    alertOpenerRef.current?.focus();
  };

  // Escape order (cornerMap 10): alert > sheet > anchored menu — each
  // closes only the topmost and restores focus to its opener.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.alert != null) closeAlert();
      else if (state.sheet != null) closeSheet();
      else if (state.navMenuOpen) closeNavMenu();
      else if (state.rowMenuId != null) closeRowMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.alert, state.sheet, state.navMenuOpen, state.rowMenuId]);

  // TABS — per-tab persistence law: scroll saved on exit / restored on
  // entry, draft + dialTouched survive everything, overlays close on
  // switch (the toast dock persists); active-tab re-tap scrolls to top.
  const switchTab = (tab: TabId) => {
    const scroller = scrollParentOf(shellRef.current);
    if (tab === state.activeTab) {
      scroller.scrollTop = 0;
      return;
    }
    const savedScroll = state.scrollByTab[tab] ?? 0;
    setState(prev => ({
      ...prev,
      activeTab: tab,
      scrollByTab: {...prev.scrollByTab, [prev.activeTab]: scroller.scrollTop},
      sheet: null,
      navMenuOpen: false,
      rowMenuId: null,
      openSwipeId: null,
      alert: null,
    }));
    requestAnimationFrame(() => {
      scroller.scrollTop = savedScroll;
    });
  };

  // CONSEQUENCE CHAINS -------------------------------------------------------

  // Commit: validates the dial (error ring + scroll + focus per cornerMap
  // 6), then appends e13 and every surface recomputes — the 13th dot
  // settles with a pulse, Alex's ring grows 1→2, Patterns' '9 of 12'
  // flips to '10 of 13', the recent list reads 13.
  const commitDebrief = () => {
    if (draft.verdict == null) {
      update({dialError: true});
      dialCardRef.current?.scrollIntoView({block: 'center', behavior: reducedMotion ? 'auto' : 'smooth'});
      firstStopRef.current?.focus({preventScroll: true});
      return;
    }
    const flags: EntryFlag[] = Object.entries(draft.flags)
      .filter((pair): pair is [string, 1 | 2] => pair[1] > 0)
      .map(([flag, weight]) => ({flag, weight}));
    const e13: Entry = {
      id: 'e13',
      person: draft.person,
      dateNum: draft.dateNum,
      spark: draft.spark,
      ease: draft.ease,
      verdict: draft.verdict,
      flags,
      dateLabel: 'Today',
      note: draft.note,
    };
    setState(prev => ({
      ...prev,
      entries: [...prev.entries, e13],
      committed: true,
      pulseId: 'e13',
      dialError: false,
      ...toastPatch('Debrief saved'),
    }));
  };

  // Delete: undo-over-confirm — executes immediately; Undo restores the
  // exact array index (ring segments, tint, list position all re-derive).
  const deleteEntry = (id: string) => {
    setState(prev => {
      const index = prev.entries.findIndex(entry => entry.id === id);
      if (index < 0) return prev;
      const entry = prev.entries[index];
      return {
        ...prev,
        entries: prev.entries.filter(item => item.id !== id),
        rowMenuId: null,
        openSwipeId: null,
        ...toastPatch('Debrief deleted', {entry, index}),
      };
    });
    menuOpenerRef.current = null;
  };
  const undoDelete = () => {
    setState(prev => {
      const undo = prev.toast?.undo;
      if (undo == null) return prev;
      const next = [...prev.entries];
      next.splice(undo.index, 0, undo.entry);
      return {...prev, entries: next, ...toastPatch('Restored')};
    });
  };

  const discardDraft = () => {
    setState(prev => ({
      ...prev,
      draft: DRAFT_FIXTURE,
      dialTouched: false,
      dialError: false,
      alert: null,
      ...toastPatch('Draft discarded'),
    }));
    alertOpenerRef.current?.focus();
  };

  const patchDraft = (patch: Partial<Draft>) => {
    setState(prev => ({...prev, draft: {...prev.draft, ...patch}}));
  };
  const cycleFlag = (flag: string) => {
    setState(prev => {
      const current = prev.draft.flags[flag] ?? 0;
      const next = ((current + 1) % 3) as FlagWeight;
      return {...prev, draft: {...prev.draft, flags: {...prev.draft.flags, [flag]: next}}};
    });
  };
  const chooseVerdict = (verdict: Verdict) => {
    setState(prev => ({...prev, draft: {...prev.draft, verdict}, dialTouched: true, dialError: false}));
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheet != null || state.alert != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // FLAG CHIP RENDER ---------------------------------------------------------

  const renderChips = (catalog: readonly string[], tint: string) => (
    <div style={styles.chipWrap}>
      {catalog.map(flag => {
        const weight = draft.flags[flag] ?? 0;
        const pill: CSSProperties = {
          ...styles.chipPill,
          ...(weight === 0
            ? {border: `1px solid ${CONTROL_REST}`, color: 'var(--color-text-secondary)'}
            : weight === 1
              ? {border: `1px solid ${tint}`, color: tint}
              : {
                  border: `3px solid ${tint}`,
                  color: tint,
                  fontWeight: 700,
                  background: `color-mix(in srgb, ${tint} 12%, transparent)`,
                }),
        };
        const weightName = weight === 2 ? ', double weight' : weight === 1 ? ', single weight' : '';
        return (
          <button
            key={flag}
            type="button"
            className="agl-btn agl-focusable"
            style={styles.chipHit}
            aria-pressed={weight > 0}
            aria-label={`${flag}${weightName}`}
            onClick={() => cycleFlag(flag)}>
            <span style={pill}>
              <Icon icon={FlagIcon} size="sm" color="inherit" />
              {flag}
            </span>
          </button>
        );
      })}
    </div>
  );

  // TAB BODIES ---------------------------------------------------------------

  const logBody = (
    <>
      {committed ? (
        <div style={{...styles.committedCard, marginTop: 12}}>
          <span style={styles.committedTitle}>Logged. Alex is now 2 dates in.</span>
          <button type="button" className="agl-btn agl-focusable" style={styles.secondaryBtn} onClick={() => switchTab('patterns')}>
            View Patterns
          </button>
        </div>
      ) : (
        <>
          {/* [a] Paired sliders. */}
          <div style={{...styles.listCard, marginTop: 12}}>
            <SliderBlock label="Spark" value={draft.spark} onChange={next => patchDraft({spark: next})} />
            <div style={styles.rowDivider} />
            <SliderBlock label="Ease" value={draft.ease} onChange={next => patchDraft({ease: next})} />
            <div style={styles.sliderCaption}>Draft dot moves live in the map below</div>
          </div>
        </>
      )}

      {/* [b] SparkEaseScatter — the WHOLE card is one button opening the
          pattern-map sheet at MEDIUM. Dots aria-hidden; label summarizes. */}
      <div style={styles.section}>
        <button
          type="button"
          className="agl-btn agl-focusable"
          style={styles.scatterCardBtn}
          aria-label={`Open pattern map. ${entries.length} past dates${committed ? '' : `, draft at spark ${draft.spark} ease ${draft.ease}`}`}
          onClick={event => openSheet('medium', event.currentTarget)}>
          <span style={{...styles.plotOuter, display: 'block'}}>
            <ScatterPlot entries={entries} draft={committed ? null : draft} pulseId={state.pulseId} reducedMotion={reducedMotion} />
            <span style={styles.axisX}>EASE →</span>
            <span style={styles.axisY}>↑ SPARK</span>
          </span>
          <span style={{...styles.whisperStrip, display: 'flex'}}>
            {whisperOn ? (
              <span className={reducedMotion ? undefined : 'agl-whisper'}>{excitedInsight}</span>
            ) : null}
          </span>
        </button>
      </div>

      {!committed ? (
        <>
          {/* [c] FlagTray — taps cycle 0→1→2→0; weight encoded by border
              thickness (1px vs 3px + 700 label + 12% tint fill). */}
          <div style={styles.section}>
            <div style={styles.listCard}>
              <h2 style={{...styles.sectionHeader, paddingInline: 16, marginTop: 16}}>Green flags</h2>
              {renderChips(GREEN_FLAGS, GREEN_TINT)}
              <h2 style={{...styles.sectionHeader, paddingInline: 16}}>Red flags</h2>
              {renderChips(RED_FLAGS, RED_TINT)}
              <div style={styles.tallyCaption}>
                +{tally.green} green · −{tally.red} red
              </div>
            </div>
          </div>

          {/* [d] VerdictDial. */}
          <div style={styles.section} ref={dialCardRef}>
            <VerdictDial
              suggested={suggested}
              chosen={draft.verdict}
              error={state.dialError}
              reducedMotion={reducedMotion}
              onChoose={chooseVerdict}
              firstStopRef={firstStopRef}
            />
          </div>

          {/* [e] Note. */}
          <div style={{...styles.formField, ...styles.section}}>
            <label style={styles.fieldLabel} htmlFor="agl-note">
              One line to remember
            </label>
            <textarea
              id="agl-note"
              className="agl-focusable"
              style={styles.textarea}
              placeholder={NOTE_PLACEHOLDER}
              value={draft.note}
              onChange={event => patchDraft({note: event.target.value})}
            />
          </div>
        </>
      ) : null}

      {/* [f] Recent debriefs — newest-first; 3 rows + counted load-more. */}
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Recent debriefs</h2>
        <div style={styles.listCard}>
          {visibleRecent.map((entry, index) => (
            <RecentRow
              key={entry.id}
              entry={entry}
              isSwipeOpen={state.openSwipeId === entry.id}
              isMenuOpen={state.rowMenuId === entry.id}
              isLast={index === visibleRecent.length - 1 && state.expandedRecent}
              reducedMotion={reducedMotion}
              menuRef={rowMenuRef}
              rowBtnRef={index === 3 ? firstAppendedRef : undefined}
              onSwipeOpen={() => update({openSwipeId: entry.id, rowMenuId: null})}
              onSwipeClose={() => {
                if (state.openSwipeId === entry.id) update({openSwipeId: null});
              }}
              onToggleMenu={opener => {
                menuOpenerRef.current = opener;
                update({rowMenuId: state.rowMenuId === entry.id ? null : entry.id, openSwipeId: null});
              }}
              onDelete={() => deleteEntry(entry.id)}
            />
          ))}
          {!state.expandedRecent ? (
            <>
              <div style={styles.rowDivider} />
              <button
                type="button"
                className="agl-btn agl-focusable"
                style={styles.loadMoreRow}
                onClick={() => setState(prev => ({...prev, expandedRecent: true, ...toastPatch(`${hiddenCount} more loaded`)}))}>
                Show {hiddenCount} more
              </button>
            </>
          ) : null}
        </div>
        {state.expandedRecent ? <div style={styles.terminalCaption}>All {entries.length} debriefs</div> : null}
      </div>
    </>
  );

  const peopleBody = (
    <div style={{...styles.listCard, marginTop: 12}}>
      {people.map((person, index) => {
        const tint = person.lastVerdict != null ? VERDICT_TINTS[person.lastVerdict] : null;
        return (
          <div key={person.name}>
            {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
            <button
              type="button"
              className="agl-btn agl-focusable"
              style={styles.peopleRowBtn}
              aria-label={`${person.name}, ${person.count} ${person.count === 1 ? 'date' : 'dates'}${person.lastVerdict != null ? `, last verdict ${person.lastVerdict}` : ''} — open in pattern map`}
              onClick={event => openSheet('large', event.currentTarget, person.name)}>
              <DateCountRing person={person.name} count={person.count} tint={tint} />
              <span style={styles.rowTextStack}>
                <span style={styles.rowPrimary}>{person.name}</span>
                <span style={styles.rowSecondary}>
                  {person.count} {person.count === 1 ? 'date' : 'dates'}
                  {person.lastVerdict != null ? ` · last verdict ${person.lastVerdict}` : ''}
                </span>
              </span>
              <span
                style={{...styles.verdictDot, background: tint ?? 'var(--color-text-secondary)'}}
                aria-hidden
              />
            </button>
          </div>
        );
      })}
    </div>
  );

  const patternsBody = (
    <>
      {/* Insight cards — computed, never hardcoded (arithmetic pinned in
          the fixture comments): '4 of 5' · '9 of 12' → '10 of 13'. */}
      <div style={{...styles.listCard, ...styles.listCardPad, marginTop: 12}}>
        <div style={styles.insightStat}>
          {gotSecondDate.length} of {firstHighEasePeople.length}
        </div>
        <div style={styles.insightBody}>
          Ease ≥7 on a first date led to a second date {gotSecondDate.length} of {firstHighEasePeople.length} times.
        </div>
      </div>
      <div style={{...styles.listCard, ...styles.listCardPad, marginTop: 12}}>
        <div style={styles.insightStat}>
          {easeHighCount} of {entries.length}
        </div>
        <div style={styles.insightBody}>{easeHighCount} of {entries.length} dates rated ease ≥7.</div>
      </div>
      <div style={{...styles.listCard, ...styles.listCardPad, marginTop: 12}}>
        <div style={styles.insightStat}>
          {excitedPlanned.length} of {excitedEntries.length}
        </div>
        <div style={styles.insightBody}>{excitedInsight}.</div>
      </div>
      <div style={styles.section}>
        <h2 style={styles.sectionHeader}>Verdicts</h2>
        <VerdictDistBar entries={entries} />
      </div>
    </>
  );

  const meBody = (
    <div style={{...styles.listCard, marginTop: 12}}>
      {/* Full-row role=switch — the whole 44px row is the toggle; the
          51×31 track never stands alone. OFF track uses CONTROL_REST
          (≥3:1 vs the card — amendment math at the declaration). */}
      <button
        type="button"
        role="switch"
        aria-checked={state.remindersOn}
        className="agl-btn agl-focusable"
        style={styles.meRow}
        onClick={() => update({remindersOn: !state.remindersOn})}>
        <span style={styles.meRowLabel}>Debrief reminders</span>
        <span style={{...styles.switchTrack, background: state.remindersOn ? BRAND_ACCENT : CONTROL_REST}} aria-hidden>
          <span
            className="agl-anim"
            style={{...styles.switchThumb, transform: state.remindersOn ? 'translateX(20px)' : undefined}}
          />
        </span>
      </button>
      <div style={styles.rowDivider} />
      <button
        type="button"
        className="agl-btn agl-focusable"
        style={styles.meRow}
        onClick={() => update(toastPatch(`Export ready — ${entries.length} entries`))}>
        <span style={styles.meRowLabel}>Export entries</span>
        <span style={{color: 'var(--color-text-secondary)', display: 'inline-flex'}} aria-hidden>
          <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
        </span>
      </button>
      <div style={styles.rowDivider} />
      <button
        type="button"
        className="agl-btn agl-focusable"
        style={styles.meRow}
        onClick={() => update(toastPatch('Afterglow 1.4 — a kinder debrief'))}>
        <span style={styles.meRowLabel}>About Afterglow</span>
        <span style={{color: 'var(--color-text-secondary)', display: 'inline-flex'}} aria-hidden>
          <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
        </span>
      </button>
    </div>
  );

  // SHEET CONTENT --------------------------------------------------------

  const sheetContent =
    state.sheet == null ? null : state.sheet === 'medium' ? (
      <>
        <h3 style={styles.sheetSubhead}>Your draft in context</h3>
        {!committed ? (
          <div style={styles.readoutRow}>
            <div style={styles.readoutCell}>
              <span style={styles.fieldLabel}>Spark</span>
              <span style={styles.readoutValue}>{draft.spark}</span>
            </div>
            <div style={styles.readoutCell}>
              <span style={styles.fieldLabel}>Ease</span>
              <span style={styles.readoutValue}>{draft.ease}</span>
            </div>
            <div style={styles.readoutCell}>
              <span style={styles.fieldLabel}>Suggested</span>
              <span style={{...styles.readoutValue, fontSize: 17}}>{suggested}</span>
            </div>
          </div>
        ) : null}
        <div style={{...styles.sheetPlot, ...styles.sheetPlotMedium}}>
          <ScatterPlot entries={entries} draft={committed ? null : draft} pulseId={null} reducedMotion={reducedMotion} />
        </div>
        <div style={styles.countCaption}>
          {committed ? `${entries.length} dates at a glance` : quadrantCaption(draft.spark, draft.ease)}
        </div>
      </>
    ) : (
      <>
        {sheetEntries.length > 0 || !filtersActive ? (
          <div style={styles.sheetPlot}>
            <ScatterPlot
              entries={sheetEntries}
              draft={committed || filtersActive ? null : draft}
              pulseId={null}
              reducedMotion={reducedMotion}
            />
          </div>
        ) : (
          // Filtered-empty (never true-empty here): echoes the filters
          // verbatim, ONE action that clears them.
          <div style={styles.emptyState}>
            <span style={styles.emptyIconCircle}>
              <Icon icon={SearchXIcon} size="lg" color="inherit" />
            </span>
            <span style={styles.emptyTitle}>
              No dates match {[state.sheetFilters.person, state.sheetFilters.verdict].filter(Boolean).join(' · ')}
            </span>
            <span style={styles.emptyBody}>Try a different person or verdict.</span>
            <span style={styles.emptyAction}>
              <button
                type="button"
                className="agl-btn agl-focusable"
                style={styles.secondaryBtn}
                onClick={() => update({sheetFilters: {person: null, verdict: null}})}>
                Clear filters
              </button>
            </span>
          </div>
        )}
        <h3 style={styles.sheetSubhead}>Person</h3>
        <div style={{...styles.chipWrap, paddingInline: 0}}>
          {PEOPLE_ORDER.map(name => {
            const on = state.sheetFilters.person === name;
            return (
              <button
                key={name}
                type="button"
                className="agl-btn agl-focusable"
                style={styles.chipHit}
                aria-pressed={on}
                onClick={() =>
                  update({sheetFilters: {...state.sheetFilters, person: on ? null : name}})
                }>
                <span
                  style={{
                    ...styles.chipPill,
                    ...(on
                      ? {border: `1px solid ${BRAND_ACCENT}`, color: BRAND_ACCENT, background: BRAND_TINT_12}
                      : {border: `1px solid ${CONTROL_REST}`, color: 'var(--color-text-secondary)'}),
                  }}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>
        <h3 style={styles.sheetSubhead}>Verdict</h3>
        <div style={{...styles.chipWrap, paddingInline: 0}}>
          {VERDICTS.map(verdict => {
            const on = state.sheetFilters.verdict === verdict;
            return (
              <button
                key={verdict}
                type="button"
                className="agl-btn agl-focusable"
                style={styles.chipHit}
                aria-pressed={on}
                onClick={() =>
                  update({sheetFilters: {...state.sheetFilters, verdict: on ? null : verdict}})
                }>
                <span
                  style={{
                    ...styles.chipPill,
                    ...(on
                      ? {border: `1px solid ${BRAND_ACCENT}`, color: BRAND_ACCENT, background: BRAND_TINT_12}
                      : {border: `1px solid ${CONTROL_REST}`, color: 'var(--color-text-secondary)'}),
                  }}>
                  {verdict}
                </span>
              </button>
            );
          })}
        </div>
        <div style={styles.countCaption}>
          Showing {sheetEntries.length} of {entries.length}
        </div>
      </>
    );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{AGL_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — brand mark (non-button; Log is root, no push), fading
            compact title, 44×44 Refresh + ellipsis trailing. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <AfterglowMark />
          </div>
          <span className="agl-fade" style={{...styles.navTitle, opacity: navTitleVisible ? 1 : 0}} aria-hidden={!navTitleVisible}>
            {activeTabDef.title}
          </span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="agl-btn agl-focusable"
              style={styles.iconBtn}
              aria-label="Refresh"
              onClick={() => setState(prev => ({...prev, refreshed: true, ...toastPatch('Updated just now')}))}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
            <button
              type="button"
              className="agl-btn agl-focusable"
              style={styles.iconBtn}
              aria-label="More options"
              aria-expanded={state.navMenuOpen}
              onClick={event => {
                menuOpenerRef.current = event.currentTarget;
                update({navMenuOpen: !state.navMenuOpen, rowMenuId: null});
              }}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>
        {state.navMenuOpen ? (
          <div ref={navMenuRef} role="menu" aria-label="Debrief options" style={{...styles.anchoredMenu, top: 52}}>
            <button
              type="button"
              role="menuitem"
              className="agl-btn agl-focusable"
              style={{
                ...styles.menuRow,
                ...styles.menuRowDestructive,
                ...(committed ? {opacity: 0.35} : null),
              }}
              disabled={committed}
              onClick={() => {
                alertOpenerRef.current = menuOpenerRef.current;
                update({navMenuOpen: false, alert: 'discard'});
              }}>
              <Icon icon={Trash2Icon} size="sm" color="inherit" />
              <span style={styles.menuRowText}>Discard draft</span>
            </button>
          </div>
        ) : null}

        <main style={styles.main}>
          {/* Sentinel — drives the compact-title fade. */}
          <div ref={sentinelRef} style={styles.sentinel} aria-hidden />
          <div style={styles.largeTitle}>
            <h1 style={styles.h1}>{activeTabDef.title}</h1>
            {state.activeTab === 'log' ? <span style={styles.largeTitleSub}>Alex · date #2</span> : null}
          </div>
          {state.refreshed ? <div style={styles.refreshCaption}>Updated just now</div> : null}

          {state.activeTab === 'log' ? logBody : null}
          {state.activeTab === 'people' ? peopleBody : null}
          {state.activeTab === 'patterns' ? patternsBody : null}
          {state.activeTab === 'me' ? meBody : null}
        </main>

        {/* TOAST DOCK — sticky-in-flow (bottom 140 above footer+tabBar on
            Log, 76 elsewhere); shell-absolute ONLY during sheet lock. The
            single polite live region; no auto-dismiss timers. */}
        <div
          style={{
            ...styles.toastDock,
            ...(state.sheet != null || state.alert != null ? styles.toastDockAbs : null),
            bottom: dockBottom,
          }}
          aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="agl-fade">
              <span style={styles.toastText}>{state.toast.text}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="agl-btn agl-focusable" style={styles.toastUndoBtn} onClick={undoDelete}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* COMMIT FOOTER — Log only, sticky bottom:64 z19 above the tabBar. */}
        {footerVisible ? (
          <footer style={styles.commitFooter}>
            <button type="button" className="agl-btn agl-focusable" style={styles.commitBtn} onClick={commitDebrief}>
              Commit debrief
            </button>
          </footer>
        ) : null}

        {/* TAB BAR — 64px sticky bottom z20. */}
        <nav style={styles.tabBar} aria-label="Afterglow tabs">
          {TABS.map(tab => {
            const on = state.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className="agl-btn agl-focusable"
                style={{...styles.tabItem, ...(on ? styles.tabItemOn : null)}}
                aria-current={on ? 'page' : undefined}
                onClick={() => switchTab(tab.id)}>
                <Icon icon={tab.icon} size="md" color="inherit" />
                <span style={{...styles.tabLabel, ...(on ? styles.tabLabelOn : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* SHEET — scrim z40 + sheet z41; scrim click, X, Escape close. */}
        {state.sheet != null ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {state.sheet != null ? (
          <Sheet detent={state.sheet} onDetentChange={detent => update({sheet: detent})} onClose={closeSheet} sheetRef={sheetRef}>
            {sheetContent}
          </Sheet>
        ) : null}

        {/* ALERT — blocking discard of unsaved work; scrim click does NOT
            dismiss; verbs, never 'OK'; first focus on Keep. */}
        {state.alert === 'discard' ? (
          <>
            <div style={styles.alertScrim} aria-hidden />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="agl-alert-title"
              aria-describedby="agl-alert-body"
              style={styles.alert}
              onKeyDown={event => trapTabKey(event, event.currentTarget)}>
              <div style={styles.alertBody}>
                <h2 id="agl-alert-title" style={styles.alertTitle}>
                  Discard this debrief?
                </h2>
                <p id="agl-alert-body" style={styles.alertText}>
                  Sliders, flags, and verdict will reset.
                </p>
              </div>
              <div style={styles.alertBtnRow}>
                <button
                  type="button"
                  ref={alertKeepRef}
                  className="agl-btn agl-focusable"
                  style={{...styles.alertBtn, fontWeight: 400}}
                  onClick={closeAlert}>
                  Keep
                </button>
                <span style={styles.alertBtnRule} aria-hidden />
                <button
                  type="button"
                  className="agl-btn agl-focusable"
                  style={{...styles.alertBtn, fontWeight: 600, color: 'var(--color-error)'}}
                  onClick={discardDraft}>
                  Discard
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}


