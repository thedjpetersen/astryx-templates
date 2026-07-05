var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Lume close-friends story draft
 *   "Tonight's story": four frames (f1 'Golden hour rooftop' 12s, f2
 *   'Studio b-roll' 18s, f3 'Coffee pour macro' 8s, f4 'Outro poll
 *   sticker' 15s — 12+18+8+15 = 53s against the 60s cap, 7s unused),
 *   eleven close friends (8 included + 3 excluded = 11, invariant
 *   asserted below), and two queued stories ('Friday recap' 5 frames ·
 *   47s, 'Launch teaser' 3 frames · 28s; 53+47+28 = 128s planned). All
 *   thumbs/avatars are id-derived CSS gradients — no photos, no network
 *   media, no Date.now(), no Math.random().
 * @output Lume — Story Planner: a 390px MOBILE story-planning surface.
 *   NavBar (Lume crescent mark · 'Tonight's story' · 'Inner 8' audience
 *   pill) over a Plan tab holding a 32px runtime subrow ('53s / 60s'
 *   pill + Edit toggle), a horizontal snap filmstrip of four reorderable
 *   72×108 gradient thumbs with 20px order badges and 20px duration
 *   chips, a 64px DurationBalancer budget track (segments in framesOrder
 *   order, 7s-unused remainder, error notch at the 60s mark), a frame-
 *   detail listCard of four 116px stepper rows, and an AudienceVennChip;
 *   Audience and Scheduled tabs plus a two-detent 'Close friends' sheet
 *   complete the loop. Signature move: drag frame 3 ahead of frame 1 (or
 *   use the edit-mode arrow buttons) and the order badges, balancer
 *   segments, detail rows, runtime pill, and the Scheduled draft's lead
 *   thumbnail all re-sort from the ONE framesOrder array.
 * @position Page template; emitted by \`astryx template mobile-story-planner\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the
 *   first pixel). All overlays (scrim, sheet, anchored menu) are
 *   position:'absolute' INSIDE shell; the toast dock is STICKY-IN-FLOW
 *   (bottom 76, above the 64px tabBar + 12px) so it rides the viewport
 *   on tall scrolling views instead of pinning to the document bottom.
 *   While the audience sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close; focus enters the sheet
 *   with {preventScroll:true} so the locked column is never beached
 *   mid-animation. The stage clips to --radius-container; shell paints
 *   full-bleed square. NavBar hairline is ALWAYS ON (chosen; scroll-under
 *   is not wired).
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 76 for the 48px-thumb frame
 *   rows); no desktop Layout frames, no side asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Lume magenta — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule); the
 *   supporting non-token pairs (badge-fill text, balancer ramp, rest
 *   fill, switch-off track) each carry contrast math at the declaration.
 *   Per the batch-2 amendment, interactive rest states (switch OFF
 *   track) and meaningful rest fills (the unused balancer remainder) use
 *   explicit light-dark() pairs at ≥3:1 against their ACTUAL surface —
 *   never bare hairline/muted tokens.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr'); runtime subrow 32px;
 *   filmstrip rail 156px block (72×108 thumbs radius 12, 8px gap, snap-x
 *   mandatory, scrollPaddingInline 16: 4×72 + 3×8 + 16 = 328 at 390);
 *   DurationBalancer 64px (8px track radius 999, 20px caption row);
 *   frame-detail rows 116px (48×72 thumb, 96×32 stepper, divider inset
 *   76 = 16+48+12); person rows 60px (40px avatar, 51×31 switch);
 *   scheduled draft row 88px, queued rows 72px; tabBar 64px sticky
 *   bottom z20; sectionHeader 13px/600 uppercase 0.06em at 32px inset,
 *   20px top / 8px bottom; sheet detents 55% / calc(100% − 56px), 24px
 *   grabber zone with 36×5 pill, 52px sheet header. TYPE (Figtree via
 *   --font-family-body): 17/600 nav + sheet titles · 16/400–500 body &
 *   row primaries · 13/400 secondary · 13/600 pills + section headers ·
 *   11/500-600 tab labels + badges; nothing under 11px; tabular-nums on
 *   every updating numeral. Touch: every target ≥44×44 with ≥8px
 *   clearance or merged into a full-row button; every gesture (thumb
 *   drag-reorder, sheet drag) has a visible button path (edit-mode
 *   44×44 arrows, clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px: no width:390 literals; the filmstrip rail scrolls
 *   (at 320 three thumbs + a ≥24px peek of the fourth are visible:
 *   3×72 + 2×8 + 16 = 248 < 320); detail-row title columns flex with
 *   minWidth 0 + ellipsis while the 96px stepper holds; the navBar pill
 *   never wraps (whiteSpace nowrap, tabular-nums); balancer percent
 *   widths hold their arithmetic at any track width.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline); sticky navBar/tabBar and absolute overlays
 *   stay inside the column because they anchor to shell. No adaptive
 *   relayout — the filmstrip anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  CalendarClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilmIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Lume magenta). #B4457E on #FFFFFF ≈ 5.9:1
// (passes 4.5:1 for the 13px/600 pill text); #E58BB8 on the dark card
// (~#1C1C1E) ≈ 8.1:1. Also used on the muted pill surface: #B4457E on
// ~#F2F0ED ≈ 5.1:1; #E58BB8 on ~#2C2C2E ≈ 6.9:1 — both clear 4.5:1.
const BRAND_ACCENT = 'light-dark(#B4457E, #E58BB8)';
// Text over a BRAND_ACCENT fill (order badges, active beads). Light:
// #FFFFFF on #B4457E ≈ 5.9:1 (the spec's badge-contrast comment). Dark:
// white on #E58BB8 fails (~1.6:1), so the dark side flips to a near-black
// plum — #46102C on #E58BB8 ≈ 6.0:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #46102C)';
// Brand-tinted wash for the edit-strip surface (decorative tint only —
// text on it stays token primary/secondary).
const BRAND_TINT_10 = \`color-mix(in srgb, \${BRAND_ACCENT} 10%, transparent)\`;
// DurationBalancer 4-step brand ramp, one step per framesOrder slot.
// Segments are aria-hidden decorative (the pill + steppers are the
// arithmetic surface), but every step still reads ≥3:1 against the body
// background so the budget bar survives as a rest-state fill per the
// amendment: solid mixes of #B4457E toward its own darker/lighter ends —
// light steps #B4457E/#C05E90/#A03063/#8C2B57 all ≥3.4:1 on #FFFFFF;
// dark steps #E58BB8/#D678A8/#C86598/#F09EC4 all ≥4.6:1 on ~#151512.
const RAMP: string[] = [
  'light-dark(#B4457E, #E58BB8)',
  'light-dark(#C05E90, #D678A8)',
  'light-dark(#A03063, #C86598)',
  'light-dark(#8C2B57, #F09EC4)',
];
// Unused-remainder rest fill for the balancer track (a "future/unplayed
// segment" per the amendment — NOT the muted token). #857C72 on the white
// body ≈ 3.5:1; #98989E on the dark body (~#151512) ≈ 5.5:1.
const REST_FILL = 'light-dark(#857C72, #98989E)';
// Switch OFF track at rest — an interactive control boundary, so it needs
// ≥3:1 vs the card it sits on (amendment; the foundations' 14%-alpha
// wash reads ~1.4:1 and is superseded). #8A8078 on the white card ≈
// 3.4:1; #98989E on the dark card (~#1C1C1E) ≈ 5.2:1. The white thumb on
// #8A8078 ≈ 3.9:1, and on the ON brand track ≥ 2.9:1 with its own shadow.
const SWITCH_OFF = 'light-dark(#8A8078, #98989E)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden
// heading helper, and the reduced-motion guard. Transitions animate
// transform/opacity only and collapse to instant under reduced motion.
// ---------------------------------------------------------------------------

const LUME_CSS = \`
.lume-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.lume-btn:disabled { cursor: default; }
.lume-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.lume-anim { transition: transform 200ms ease, opacity 200ms ease; }
.lume-seg { transition: width 200ms ease; }
@keyframes lume-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.lume-sheet-in { animation: lume-sheet-in 240ms ease; }
.lume-vh {
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
  .lume-anim, .lume-seg { transition: none; }
  .lume-sheet-in { animation: none; }
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
  // NAV BAR — 52px sticky top z20; hairline ALWAYS ON (noted per contract).
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
    margin: 0,
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  brandBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  // Audience count pill — 28px pill inside a 44px-tall hit.
  audPillHit: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  audPill: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: BRAND_ACCENT,
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // RUNTIME SUBROW — 32px; the 44px-tall Edit button and pill are allowed
  // to overhang the row box vertically (clearance provided by the
  // filmstrip's 8px top pad below).
  runtimeSubrow: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  runtimeLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  editBtn: {
    height: 44,
    paddingInline: 8,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_ACCENT,
    borderRadius: 12,
    flexShrink: 0,
  },
  editBtnOn: {fontWeight: 600},
  runtimePill: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  runtimePillMax: {color: 'var(--color-error)'},
  // FILMSTRIP RAIL — 156px block: 8 pad + 108 thumb + 4 gap + 20 chip +
  // 16 breathing; grows by a 48px edit strip while editMode is on.
  filmstripBlock: {position: 'relative', paddingTop: 8},
  rail: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 16,
    paddingBottom: 16,
  },
  thumbCol: {
    width: 72,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    scrollSnapAlign: 'start',
  },
  thumbBtn: {
    position: 'relative',
    width: 72,
    height: 108,
    borderRadius: 12,
    overflow: 'hidden',
    display: 'block',
    touchAction: 'pan-y',
  },
  thumbActive: {boxShadow: \`0 0 0 2px var(--color-background-body), 0 0 0 4px \${BRAND_ACCENT}\`},
  thumbLifted: {boxShadow: '0 8px 24px var(--color-shadow)', zIndex: 2},
  orderBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  durationChip: {
    height: 20,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  // EDIT STRIP — 48px full-width strip below the rail (44px buttons + 4px
  // breathing) naming the ACTIVE thumb; the keyboard path for drag-reorder.
  editStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 48,
    marginInline: 16,
    marginBottom: 8,
    paddingInline: 4,
    borderRadius: 12,
    background: BRAND_TINT_10,
  },
  moveBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
    flexShrink: 0,
  },
  moveBtnDisabled: {opacity: 0.35},
  editStripLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  // Anchored frame menu (Remove frame) — z30, below the sheet scrim's z40.
  anchoredMenu: {
    position: 'absolute',
    right: 16,
    zIndex: 30,
    minWidth: 200,
    maxWidth: 'calc(100% - 32px)',
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
  menuRowDanger: {color: 'var(--color-error)'},
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // DURATION BALANCER — 64px block: 12 top pad + 8 track + 8 gap + 20
  // caption + 16 bottom.
  balancer: {paddingInline: 16, paddingTop: 12, paddingBottom: 16},
  trackWrap: {position: 'relative'},
  track: {
    display: 'flex',
    height: 8,
    borderRadius: 999,
    background: REST_FILL,
    overflow: 'hidden',
  },
  segment: {height: '100%'},
  // Warning notch — 2×12 error tick at the 60s (100%) mark.
  notch: {
    position: 'absolute',
    right: 0,
    top: -2,
    width: 2,
    height: 12,
    borderRadius: 1,
    background: 'var(--color-error)',
  },
  balancerCaption: {
    height: 20,
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
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
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider16: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // Frame-detail divider inset 76 = 16 gutter-pad + 48 thumb + 12 gap.
  rowDivider76: {height: 1, background: 'var(--color-border)', marginInlineStart: 76},
  frameRow: {
    height: 116,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  detailThumb: {width: 48, height: 72, borderRadius: 12, flexShrink: 0},
  frameText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  // Two-line clamp — the 116px row has the vertical room, so titles wrap
  // before they ellipsize (the 24-char stress still clamps cleanly).
  framePrimary: {
    fontSize: 16,
    fontWeight: 500,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },
  frameSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // STEPPER — 96×32 visual track centered in a 96×44 hit zone; halves are
  // 48×44 buttons (≥44px hit per foundations), value adjacent trailing.
  stepValue: {
    minWidth: 34,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  stepperWrap: {position: 'relative', width: 96, height: 44, flexShrink: 0},
  stepperTrack: {
    position: 'absolute',
    insetInline: 0,
    top: 6,
    height: 32,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
  },
  stepperSplit: {
    position: 'absolute',
    left: 47.5,
    top: 12,
    height: 20,
    width: 1,
    background: 'var(--color-border)',
  },
  stepperHalf: {
    position: 'absolute',
    top: 0,
    width: 48,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperHalfDisabled: {opacity: 0.35},
  // AUDIENCE VENN CHIP — 60px whole-row button.
  chipRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  cluster: {display: 'flex', paddingLeft: 8, flexShrink: 0},
  clusterAvatar: {
    width: 28,
    height: 28,
    borderRadius: 999,
    marginLeft: -8,
    border: '2px solid var(--color-background-card)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: '#FFFFFF',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.45)',
  },
  chipText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipChevron: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  // PERSON ROWS — 60px whole-row role=switch buttons.
  personRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  avatar40: {
    width: 40,
    height: 40,
    borderRadius: 999,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: '#FFFFFF',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.45)',
  },
  avatarExcluded: {opacity: 0.55, filter: 'grayscale(1)'},
  personText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  personName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  personHandle: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  switchTrack: {
    position: 'relative',
    width: 51,
    height: 31,
    borderRadius: 999,
    background: SWITCH_OFF,
    flexShrink: 0,
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
  },
  switchThumbOn: {transform: 'translateX(20px)'},
  // SCHEDULED TAB.
  draftRow: {
    width: '100%',
    height: 88,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  schedRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  schedText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  schedMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  spacer24: {height: 24},
  // TAB BAR — 64px sticky bottom z20, three flex-1 tabItems.
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
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  // TOAST DOCK — STICKY-IN-FLOW (amendment): rides the viewport at
  // bottom 76 (64px tabBar + 12px) instead of pinning to the document
  // bottom of a tall scrolling shell. aria-live polite, one toast at a
  // time, NO auto-dismiss timers (undoOverConfirm law).
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
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    maxWidth: '100%',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    paddingInline: 16,
    pointerEvents: 'auto',
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
  // SHEET — scrim z40 + sheet z41, absolute inside shell; detents 55% /
  // calc(100% − 56px).
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
  // Ghost row — the 3 excluded avatars pinned under the header at 44px.
  ghostRow: {
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    borderBottom: '1px solid var(--color-border)',
  },
  ghostLabel: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto'},
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic, dual fields, identity consts. Cross-check
// ledger (verified by hand before shipping): frames 12+18+8+15 = 53s; pill
// '53s / 60s'; unused 60−53 = 7s; balancer widths 20% + 30% + 13.33% + 25%
// = 88.33% filled, 11.67% remainder. People 8 included + 3 excluded = 11
// (invariant: INCLUDED_IDS.length + EXCLUDED_IDS.length === PEOPLE_ORDER
// .length === 11). Scheduled 53+47+28 = 128s planned. Stress fixtures:
// Rosa's 24-char hyphenated surname ellipsizes before the switch; max
// state f2 18→20 & f4 15→20 → 12+20+8+20 = 60 exactly; min state 4×3 =
// 12s → 48s unused = 80% remainder; remove f3 → 53−8 = 45s, undo → 53s.
// ---------------------------------------------------------------------------

const STORY_CAP_SECONDS = 60;

interface StoryFrame {
  id: string;
  title: string;
  duration: number; // seconds, min 3 max 20
}

const FRAMES: StoryFrame[] = [
  {id: 'f1', title: 'Golden hour rooftop', duration: 12},
  {id: 'f2', title: 'Studio b-roll', duration: 18},
  {id: 'f3', title: 'Coffee pour macro', duration: 8},
  {id: 'f4', title: 'Outro poll sticker', duration: 15},
];

interface Person {
  id: string;
  name: string;
  handle: string;
  included: boolean;
}

// 8 included + 3 excluded = 11. Rosa's hyphenated surname is the sheet-row
// truncation stress (ellipsizes before the 51×31 switch, minWidth 0).
const PEOPLE: Person[] = [
  {id: 'p_ana', name: 'Ana Reyes', handle: '@anareyes', included: true},
  {id: 'p_jordan', name: 'Jordan Blake', handle: '@jblake', included: true},
  {id: 'p_priya', name: 'Priya Nair', handle: '@priyacuts', included: true},
  {id: 'p_sam', name: 'Sam Otieno', handle: '@samotieno', included: true},
  {id: 'p_lena', name: 'Lena Fischer', handle: '@lenaf', included: true},
  {id: 'p_marcus', name: 'Marcus Webb', handle: '@mwebb', included: true},
  {id: 'p_yuki', name: 'Yuki Tanaka', handle: '@yukit', included: true},
  {id: 'p_dev', name: 'Dev Kapoor', handle: '@devk', included: true},
  {id: 'p_maya', name: 'Maya Okafor', handle: '@mayao', included: false},
  {id: 'p_tom', name: 'Tom Álvarez', handle: '@tomalv', included: false},
  {id: 'p_rosa', name: 'Rosa Lindqvist-Åkerström', handle: '@rosalq', included: false},
];

interface ScheduledStory {
  id: string;
  title: string;
  frameCount: number;
  seconds: number;
  when: string;
}

// Queued stories: 47+28 = 75; with the live draft (53 at rest) the
// terminal caption reads '3 stories · 128s planned' (53+47+28 = 128) and
// re-derives when the draft's runtime moves.
const SCHEDULED: ScheduledStory[] = [
  {id: 's_friday', title: 'Friday recap', frameCount: 5, seconds: 47, when: 'Fri 8:00 PM'},
  {id: 's_launch', title: 'Launch teaser', frameCount: 3, seconds: 28, when: 'Sat 6:30 PM'},
];

// ---------------------------------------------------------------------------
// ID-DERIVED GRADIENTS — no photos. A tiny deterministic hash picks two
// hues per id; lightness is fixed low enough (46%/34%) that the white
// 11–13px initials/badge glyphs over them read ≥3.5:1 (decorative media
// surfaces; adjacent text carries the information).
// ---------------------------------------------------------------------------

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 997;
  }
  return h;
}

function gradientFor(id: string): string {
  // ×137 (golden-angle-ish) disperses sequential ids (f1…f4) across the
  // hue wheel instead of clustering them in one band.
  const h = hashId(id);
  const hue1 = (h * 137) % 360;
  const hue2 = (hue1 + 48) % 360;
  return \`linear-gradient(160deg, hsl(\${hue1} 58% 46%), hsl(\${hue2} 62% 34%))\`;
}

function initialsFor(name: string): string {
  const parts = name.split(' ');
  return \`\${parts[0]?.[0] ?? ''}\${parts[parts.length - 1]?.[0] ?? ''}\`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — plannerStore via useState + update(id, value).
// framesOrder is the SOLE sequence authority: badges, balancer segments,
// detail rows, the Scheduled lead thumb, and every 'Frame n of N' string
// derive from it in the same render.
// ---------------------------------------------------------------------------

type TabId = 'plan' | 'audience' | 'scheduled';

interface Toast {
  seq: number;
  text: string;
  canUndo: boolean;
}

interface PlannerStore {
  activeTab: TabId;
  framesOrder: string[];
  frames: Record<string, StoryFrame>;
  people: Record<string, Person>;
  peopleOrder: string[];
  editMode: boolean;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  activeThumbId: string;
  frameMenuOpen: boolean;
  removedFrame: {frame: StoryFrame; index: number} | null;
  toast: Toast | null;
}

const INITIAL_STORE: PlannerStore = {
  activeTab: 'plan',
  framesOrder: FRAMES.map(frame => frame.id),
  frames: Object.fromEntries(FRAMES.map(frame => [frame.id, frame])),
  people: Object.fromEntries(PEOPLE.map(person => [person.id, person])),
  peopleOrder: PEOPLE.map(person => person.id),
  editMode: false,
  sheetOpen: false,
  sheetDetent: 'medium',
  activeThumbId: 'f1',
  frameMenuOpen: false,
  removedFrame: null,
  toast: null,
};

function usePlannerStore() {
  const [store, setStore] = useState<PlannerStore>(INITIAL_STORE);
  const update = useCallback(<K extends keyof PlannerStore>(id: K, value: PlannerStore[K]) => {
    setStore(prev => ({...prev, [id]: value}));
  }, []);
  return {store, update, setStore};
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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns page scroll. */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const overflowY = window.getComputedStyle(current).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
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
// BRAND MARK — 28px Lume crescent in a 44×44 navBar button.
// ---------------------------------------------------------------------------

function LumeMark() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d="M20.5 4.5a11 11 0 1 0 3 15.5A9.5 9.5 0 0 1 20.5 4.5Z"
        fill="currentColor"
        opacity={0.9}
      />
      <circle cx="20" cy="8" r="2" fill="currentColor" opacity={0.55} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// FILMSTRIP REORDER — horizontal snap rail of 72×108 gradient thumbs.
// Pointer drag (8px slop) lifts a thumb (scale 1.05 + shadow) and commits
// a new framesOrder on release; the mandatory button path is the
// edit-mode strip (44×44 move-left/right chevrons + Remove-frame ellipsis
// menu, the long-press fallback). Owns order DISPLAY only; writes go
// through onReorder → update('framesOrder', next).
// ---------------------------------------------------------------------------

const SLOT_WIDTH = 80; // 72px thumb + 8px gap

interface FilmstripProps {
  framesOrder: string[];
  frames: Record<string, StoryFrame>;
  editMode: boolean;
  activeThumbId: string;
  frameMenuOpen: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onSelectThumb: (id: string) => void;
  onReorder: (next: string[], movedId: string) => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onRemoveFrame: () => void;
}

function FilmstripReorder({
  framesOrder,
  frames,
  editMode,
  activeThumbId,
  frameMenuOpen,
  reducedMotion,
  menuRef,
  onSelectThumb,
  onReorder,
  onToggleMenu,
  onRemoveFrame,
}: FilmstripProps) {
  // Transient drag state only — the order itself lives in the one owner.
  const [drag, setDrag] = useState<{id: string; from: number; dx: number} | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const longPressRef = useRef<number | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  const clearLongPress = () => {
    if (longPressRef.current != null) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const onThumbPointerDown = (id: string, index: number) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    setDrag({id, from: index, dx: 0});
    event.currentTarget.setPointerCapture(event.pointerId);
    // Long-press garnish (edit mode): 450ms, cancelled by 8px movement;
    // the visible ellipsis button is the contractual path.
    if (editMode && id === activeThumbId) {
      const opener = event.currentTarget;
      clearLongPress();
      longPressRef.current = window.setTimeout(() => {
        movedRef.current = true; // swallow the trailing click
        setDrag(null);
        onToggleMenu(opener);
      }, 450);
    }
  };

  const onThumbPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    setDrag(prev => {
      if (prev == null) return prev;
      const dx = event.clientX - startXRef.current;
      if (Math.abs(dx) > 8) {
        movedRef.current = true;
        clearLongPress();
      }
      return {...prev, dx};
    });
  };

  const targetIndexFor = (dragState: {from: number; dx: number}): number => {
    const shift = Math.round(dragState.dx / SLOT_WIDTH);
    return Math.max(0, Math.min(framesOrder.length - 1, dragState.from + shift));
  };

  const onThumbPointerEnd = () => {
    clearLongPress();
    setDrag(prev => {
      if (prev == null) return null;
      if (movedRef.current) {
        const to = targetIndexFor(prev);
        if (to !== prev.from) {
          const next = [...framesOrder];
          next.splice(prev.from, 1);
          next.splice(to, 0, prev.id);
          onReorder(next, prev.id);
        }
      }
      return null;
    });
  };

  const onThumbClick = (id: string) => () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    onSelectThumb(id);
  };

  // Arrow keys scroll the rail when it is focused (a11yPlan).
  const onRailKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    railRef.current?.scrollBy({left: event.key === 'ArrowRight' ? SLOT_WIDTH : -SLOT_WIDTH});
  };

  const activeIndex = framesOrder.indexOf(activeThumbId);
  const activeFrame = frames[activeThumbId];
  const dragTarget = drag != null && movedRef.current ? targetIndexFor(drag) : null;

  const moveActive = (delta: -1 | 1) => {
    const from = activeIndex;
    const to = from + delta;
    if (from < 0 || to < 0 || to >= framesOrder.length) return;
    const next = [...framesOrder];
    next.splice(from, 1);
    next.splice(to, 0, activeThumbId);
    onReorder(next, activeThumbId);
  };

  return (
    <div style={styles.filmstripBlock}>
      <div
        ref={railRef}
        style={styles.rail}
        role="list"
        aria-label="Story frames in order"
        tabIndex={0}
        className="lume-focusable"
        onKeyDown={onRailKeyDown}>
        {framesOrder.map((id, index) => {
          const frame = frames[id];
          const isDragging = drag?.id === id && movedRef.current;
          // Sibling shift: while a lifted thumb heads for dragTarget, the
          // displaced thumbs slide one slot the other way (200ms; instant
          // under reduced motion via .lume-anim collapse).
          let shiftX = 0;
          if (drag != null && dragTarget != null && !isDragging) {
            if (drag.from < dragTarget && index > drag.from && index <= dragTarget) shiftX = -SLOT_WIDTH;
            else if (drag.from > dragTarget && index >= dragTarget && index < drag.from) shiftX = SLOT_WIDTH;
          }
          const liftTransform = isDragging ? \`translateX(\${drag.dx}px) scale(1.05)\` : shiftX !== 0 ? \`translateX(\${shiftX}px)\` : undefined;
          return (
            <div key={id} style={styles.thumbCol}>
              <button
                type="button"
                className={\`lume-btn lume-focusable\${isDragging ? '' : ' lume-anim'}\`}
                style={{
                  ...styles.thumbBtn,
                  background: gradientFor(id),
                  ...(id === activeThumbId ? styles.thumbActive : null),
                  ...(isDragging ? styles.thumbLifted : null),
                  transform: liftTransform,
                  transition: isDragging || reducedMotion ? 'none' : undefined,
                }}
                aria-label={\`Frame \${index + 1} of \${framesOrder.length}: \${frame.title}, \${frame.duration} seconds\`}
                aria-pressed={id === activeThumbId}
                onPointerDown={onThumbPointerDown(id, index)}
                onPointerMove={onThumbPointerMove}
                onPointerUp={onThumbPointerEnd}
                onPointerCancel={onThumbPointerEnd}
                onClick={onThumbClick(id)}>
                <span style={styles.orderBadge} aria-hidden>
                  {index + 1}
                </span>
              </button>
              <span style={styles.durationChip} aria-hidden>
                {frame.duration}s
              </span>
            </div>
          );
        })}
      </div>
      {editMode && activeFrame != null ? (
        <div style={styles.editStrip}>
          <button
            type="button"
            className="lume-btn lume-focusable"
            style={{...styles.moveBtn, ...(activeIndex <= 0 ? styles.moveBtnDisabled : null)}}
            aria-label={\`Move \${activeFrame.title} left\`}
            disabled={activeIndex <= 0}
            onClick={() => moveActive(-1)}>
            <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
          </button>
          <span style={styles.editStripLabel}>
            {activeFrame.title} · position {activeIndex + 1}
          </span>
          <button
            type="button"
            className="lume-btn lume-focusable"
            style={styles.moveBtn}
            aria-label={\`Frame actions for \${activeFrame.title}\`}
            aria-expanded={frameMenuOpen}
            onClick={event => onToggleMenu(event.currentTarget)}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
          <button
            type="button"
            className="lume-btn lume-focusable"
            style={{
              ...styles.moveBtn,
              ...(activeIndex >= framesOrder.length - 1 ? styles.moveBtnDisabled : null),
            }}
            aria-label={\`Move \${activeFrame.title} right\`}
            disabled={activeIndex >= framesOrder.length - 1}
            onClick={() => moveActive(1)}>
            <Icon icon={ChevronRightIcon} size="md" color="inherit" />
          </button>
        </div>
      ) : null}
      {frameMenuOpen && activeFrame != null ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Frame actions for \${activeFrame.title}\`}
          style={{...styles.anchoredMenu, bottom: 4}}>
          <button
            type="button"
            role="menuitem"
            className="lume-btn lume-focusable"
            style={{...styles.menuRow, ...styles.menuRowDanger}}
            onClick={onRemoveFrame}>
            <Icon icon={Trash2Icon} size="sm" color="inherit" />
            <span style={styles.menuRowText}>Remove frame</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DURATION BALANCER — 8px segmented budget track. One segment per frame in
// framesOrder order, width = duration/60 (20% + 30% + 13.33% + 25% =
// 88.33% at rest); the remainder shows as the REST_FILL track (7s =
// 11.67%). Segments are aria-hidden decorative — the runtime pill and the
// spinbutton steppers are the arithmetic surface. 2px body-colored gaps
// via borderRight; the error notch marks the 60s (100%) mark.
// ---------------------------------------------------------------------------

interface BalancerProps {
  framesOrder: string[];
  frames: Record<string, StoryFrame>;
  totalSeconds: number;
}

function DurationBalancer({framesOrder, frames, totalSeconds}: BalancerProps) {
  const unused = STORY_CAP_SECONDS - totalSeconds;
  return (
    <div style={styles.balancer}>
      <div style={styles.trackWrap}>
        <div style={styles.track} aria-hidden>
          {framesOrder.map((id, index) => (
            <span
              key={id}
              className="lume-seg"
              style={{
                ...styles.segment,
                width: \`\${((frames[id].duration / STORY_CAP_SECONDS) * 100).toFixed(2)}%\`,
                background: RAMP[index % RAMP.length],
                borderRight:
                  index < framesOrder.length - 1 || totalSeconds < STORY_CAP_SECONDS
                    ? '2px solid var(--color-background-body)'
                    : undefined,
              }}
            />
          ))}
        </div>
        <span style={styles.notch} aria-hidden />
      </div>
      <div style={styles.balancerCaption}>
        <span>{unused > 0 ? \`\${unused}s unused\` : 'At the cap'}</span>
        <span>60s cap</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PERSON ROW — 60px whole-row role=switch button (foundations: the 51×31
// visual never stands alone). Excluded avatars: 55% opacity + grayscale.
// ---------------------------------------------------------------------------

interface PersonRowProps {
  person: Person;
  isLast: boolean;
  onToggle: (id: string) => void;
}

function PersonRow({person, isLast, onToggle}: PersonRowProps) {
  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={person.included}
        className="lume-btn lume-focusable"
        style={styles.personRow}
        aria-label={person.name}
        onClick={() => onToggle(person.id)}>
        <span
          style={{
            ...styles.avatar40,
            background: gradientFor(person.id),
            ...(person.included ? null : styles.avatarExcluded),
          }}
          aria-hidden>
          {initialsFor(person.name)}
        </span>
        <span style={styles.personText}>
          <span style={styles.personName}>{person.name}</span>
          <span style={styles.personHandle}>{person.handle}</span>
        </span>
        <span
          style={{...styles.switchTrack, ...(person.included ? styles.switchTrackOn : null)}}
          aria-hidden>
          <span
            className="lume-anim"
            style={{...styles.switchThumb, ...(person.included ? styles.switchThumbOn : null)}}
          />
        </span>
      </button>
      {isLast ? null : <div style={styles.rowDivider16} />}
    </>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; pointer drag between detents is garnish, >120px past
// medium closes), 52px header with 44×44 X, focus-trapped dialog.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  pinned: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, pinned, children}: SheetProps) {
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
      className="lume-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease, height 240ms ease',
      }}>
      <button
        type="button"
        className="lume-btn lume-focusable"
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
          className="lume-btn lume-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      {pinned}
      <div style={styles.sheetBody}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileStoryPlannerTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {store, update, setStore} = usePlannerStore();
  const {activeTab, framesOrder, frames, people, peopleOrder, editMode, sheetOpen, sheetDetent, activeThumbId, frameMenuOpen, removedFrame, toast} = store;

  // Focus plumbing — opener restored on every explicit close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const frameMenuRef = useRef<HTMLDivElement | null>(null);
  const toastSeqRef = useRef(0);
  // Per-tab scrollTop (ergonomics law: tabs never reset). The demo's
  // .preview-wrap owns page scroll, so we record/restore on its element.
  const tabScrollRef = useRef<Record<TabId, number>>({plan: 0, audience: 0, scheduled: 0});

  // Derived — every aggregate derives live from the one owner.
  const frameCount = framesOrder.length;
  const totalSeconds = framesOrder.reduce((sum, id) => sum + frames[id].duration, 0);
  const atCap = totalSeconds >= STORY_CAP_SECONDS;
  const includedIds = peopleOrder.filter(id => people[id].included);
  const excludedIds = peopleOrder.filter(id => !people[id].included);
  // Invariant: includedIds.length + excludedIds.length === 11 at all times
  // (8+3 at rest; excluding Maya reads 7+4; the exclude-3-more stress path
  // reads 5+6 — always 11).
  const includedCount = includedIds.length;
  const excludedCount = excludedIds.length;
  // Terminal caption law: 53+47+28 = 128 at rest, re-derived live so the
  // cross-check survives stepper edits and frame removal.
  const plannedSeconds = totalSeconds + SCHEDULED.reduce((sum, story) => sum + story.seconds, 0);

  const toastPatch = (text: string, canUndo = false): Pick<PlannerStore, 'toast'> => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, canUndo}};
  };

  // Focus moves into the sheet on open — preventScroll (amendment): a
  // plain .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen.
  useEffect(() => {
    if (sheetOpen) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [sheetOpen]);
  useEffect(() => {
    if (frameMenuOpen) frameMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [frameMenuOpen]);

  const openSheet = (opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    setStore(prev => ({...prev, sheetOpen: true, sheetDetent: 'medium', frameMenuOpen: false}));
  };
  const closeSheet = () => {
    update('sheetOpen', false);
    sheetOpenerRef.current?.focus();
  };
  const closeFrameMenu = () => {
    update('frameMenuOpen', false);
    menuOpenerRef.current?.focus();
  };

  // Escape closes the TOPMOST overlay only: anchored frame menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (frameMenuOpen) closeFrameMenu();
      else if (sheetOpen) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameMenuOpen, sheetOpen]);

  // TAB SWITCHES — persist per-tab scrollTop; open sheet closes (an
  // overlay belongs to its moment); editMode stays Plan-scoped in the
  // store. Re-tapping the ACTIVE tab scrolls to top (the one legal reset).
  const selectTab = (tab: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (tab === activeTab) {
      scroller?.scrollTo({top: 0});
      return;
    }
    tabScrollRef.current[activeTab] = scroller?.scrollTop ?? 0;
    setStore(prev => ({...prev, activeTab: tab, sheetOpen: false, frameMenuOpen: false}));
    requestAnimationFrame(() => {
      const target = getScrollParent(shellRef.current);
      if (target != null) target.scrollTop = tabScrollRef.current[tab] ?? 0;
    });
  };

  // CONSEQUENCE CHAINS -------------------------------------------------------

  // (1) REORDER — one framesOrder write re-sorts filmstrip badges,
  // balancer segments, detail rows, and the Scheduled lead thumb; the
  // toast announces the landing position.
  const handleReorder = (next: string[], movedId: string) => {
    setStore(prev => ({
      ...prev,
      framesOrder: next,
      activeThumbId: movedId,
      ...toastPatch(\`\${frames[movedId].title} moved to position \${next.indexOf(movedId) + 1}\`),
    }));
  };

  // (2) STEPPER — min 3s, max 20s, step 1s; the plus half disables at 35%
  // opacity once the 60s headroom is exhausted. Chip, balancer segment,
  // pill, and the Scheduled '· 53s' all recompute from the same write.
  const setDuration = (id: string, nextDuration: number) => {
    const current = frames[id].duration;
    const clamped = Math.max(3, Math.min(20, nextDuration));
    if (clamped > current && totalSeconds + (clamped - current) > STORY_CAP_SECONDS) return;
    if (clamped === current) return;
    const nextTotal = totalSeconds + (clamped - current);
    setStore(prev => ({
      ...prev,
      frames: {...prev.frames, [id]: {...prev.frames[id], duration: clamped}},
      ...toastPatch(\`Runtime \${nextTotal}s of 60s\`),
    }));
  };

  // (3) AUDIENCE — people[id].included threads the chip, navBar pill,
  // section headers, and the Scheduled '· Inner n' from the one owner.
  const togglePerson = (id: string) => {
    const person = people[id];
    const nowIncluded = !person.included;
    const nextInner = includedCount + (nowIncluded ? 1 : -1);
    setStore(prev => ({
      ...prev,
      people: {...prev.people, [id]: {...prev.people[id], included: nowIncluded}},
      ...toastPatch(\`\${person.name} \${nowIncluded ? 'included' : 'excluded'} · Inner \${nextInner}\`),
    }));
  };

  // (4) UNDO LAW — Remove frame executes immediately; Undo restores the
  // exact framesOrder position (remove f3: 53−8 = 45s; undo → 53s).
  const removeActiveFrame = () => {
    if (framesOrder.length <= 1) {
      setStore(prev => ({...prev, frameMenuOpen: false, ...toastPatch('A story needs at least one frame')}));
      return;
    }
    const index = framesOrder.indexOf(activeThumbId);
    const frame = frames[activeThumbId];
    const next = framesOrder.filter(id => id !== activeThumbId);
    setStore(prev => ({
      ...prev,
      framesOrder: next,
      activeThumbId: next[Math.min(index, next.length - 1)],
      frameMenuOpen: false,
      removedFrame: {frame, index},
      ...toastPatch(\`Frame removed · \${totalSeconds - frame.duration}s\`, true),
    }));
    menuOpenerRef.current?.focus();
  };
  const undoRemove = () => {
    if (removedFrame == null) return;
    const next = [...framesOrder];
    next.splice(Math.min(removedFrame.index, next.length), 0, removedFrame.frame.id);
    setStore(prev => ({
      ...prev,
      framesOrder: next,
      activeThumbId: removedFrame.frame.id,
      removedFrame: null,
      ...toastPatch(\`\${removedFrame.frame.title} restored · \${totalSeconds + removedFrame.frame.duration}s\`),
    }));
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const tabs: Array<{id: TabId; label: string; icon: typeof FilmIcon}> = [
    {id: 'plan', label: 'Plan', icon: FilmIcon},
    {id: 'audience', label: 'Audience', icon: UsersIcon},
    {id: 'scheduled', label: 'Scheduled', icon: CalendarClockIcon},
  ];

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{LUME_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="lume-btn lume-focusable"
              style={styles.brandBtn}
              aria-label="Lume — story drafts save automatically"
              onClick={() => setStore(prev => ({...prev, ...toastPatch('Lume — drafts save automatically')}))}>
              <LumeMark />
            </button>
          </div>
          <h1 style={styles.navTitle}>Tonight&rsquo;s story</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="lume-btn lume-focusable"
              style={styles.audPillHit}
              aria-label={\`Audience: Inner \${includedCount} — manage close friends\`}
              aria-expanded={sheetOpen}
              onClick={event => openSheet(event.currentTarget)}>
              <span style={styles.audPill}>
                <Icon icon={UsersIcon} size="sm" color="inherit" />
                Inner {includedCount}
              </span>
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {activeTab === 'plan' ? (
            <>
              <div style={styles.runtimeSubrow}>
                <span style={styles.runtimeLabel}>Runtime</span>
                <button
                  type="button"
                  className="lume-btn lume-focusable"
                  style={{...styles.editBtn, ...(editMode ? styles.editBtnOn : null)}}
                  aria-pressed={editMode}
                  onClick={() => setStore(prev => ({...prev, editMode: !prev.editMode, frameMenuOpen: false}))}>
                  {editMode ? 'Done' : 'Edit'}
                </button>
                {/* Pill flips to the error pair when the sum hits 60 exactly
                    (stress: f2 18→20 and f4 15→20 → 12+20+8+20 = 60). */}
                <span style={{...styles.runtimePill, ...(atCap ? styles.runtimePillMax : null)}}>
                  {totalSeconds}s / 60s
                </span>
              </div>

              <FilmstripReorder
                framesOrder={framesOrder}
                frames={frames}
                editMode={editMode}
                activeThumbId={activeThumbId}
                frameMenuOpen={frameMenuOpen}
                reducedMotion={reducedMotion}
                menuRef={frameMenuRef}
                onSelectThumb={id => update('activeThumbId', id)}
                onReorder={handleReorder}
                onToggleMenu={opener => {
                  menuOpenerRef.current = opener;
                  update('frameMenuOpen', !frameMenuOpen);
                }}
                onRemoveFrame={removeActiveFrame}
              />

              <DurationBalancer framesOrder={framesOrder} frames={frames} totalSeconds={totalSeconds} />

              <h2 style={styles.sectionHeader}>Frame details</h2>
              <div style={styles.listCard}>
                {framesOrder.map((id, index) => {
                  const frame = frames[id];
                  const minusDisabled = frame.duration <= 3;
                  const plusDisabled = frame.duration >= 20 || atCap;
                  return (
                    <div key={id}>
                      {index > 0 ? <div style={styles.rowDivider76} /> : null}
                      <div style={styles.frameRow}>
                        <span style={{...styles.detailThumb, background: gradientFor(id)}} aria-hidden />
                        <span style={styles.frameText}>
                          <span style={styles.framePrimary}>{frame.title}</span>
                          <span style={styles.frameSecondary}>
                            Frame {index + 1} of {frameCount} · {frame.duration}s
                          </span>
                        </span>
                        <span
                          style={styles.stepValue}
                          role="spinbutton"
                          tabIndex={0}
                          className="lume-focusable"
                          aria-valuenow={frame.duration}
                          aria-valuemin={3}
                          aria-valuemax={20}
                          aria-label={\`\${frame.title} duration in seconds\`}
                          onKeyDown={event => {
                            if (event.key === 'ArrowUp') {
                              event.preventDefault();
                              if (!plusDisabled) setDuration(id, frame.duration + 1);
                            } else if (event.key === 'ArrowDown') {
                              event.preventDefault();
                              if (!minusDisabled) setDuration(id, frame.duration - 1);
                            }
                          }}>
                          {frame.duration}s
                        </span>
                        <span style={styles.stepperWrap}>
                          <span style={styles.stepperTrack} aria-hidden />
                          <span style={styles.stepperSplit} aria-hidden />
                          <button
                            type="button"
                            className="lume-btn lume-focusable"
                            style={{...styles.stepperHalf, left: 0, ...(minusDisabled ? styles.stepperHalfDisabled : null)}}
                            aria-label={\`Decrease \${frame.title} duration\`}
                            disabled={minusDisabled}
                            onClick={() => setDuration(id, frame.duration - 1)}>
                            <Icon icon={MinusIcon} size="sm" color="inherit" />
                          </button>
                          <button
                            type="button"
                            className="lume-btn lume-focusable"
                            style={{...styles.stepperHalf, right: 0, ...(plusDisabled ? styles.stepperHalfDisabled : null)}}
                            aria-label={\`Increase \${frame.title} duration\`}
                            disabled={plusDisabled}
                            onClick={() => setDuration(id, frame.duration + 1)}>
                            <Icon icon={PlusIcon} size="sm" color="inherit" />
                          </button>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AUDIENCE VENN CHIP — whole 60px row opens the two-detent
                  sheet; text recomputes from the one owner. */}
              <div style={{...styles.listCard, marginTop: 12}}>
                <button
                  type="button"
                  className="lume-btn lume-focusable"
                  style={styles.chipRow}
                  aria-expanded={sheetOpen}
                  aria-label={\`Close friends: Inner \${includedCount}, \${excludedCount} excluded — manage audience\`}
                  onClick={event => openSheet(event.currentTarget)}>
                  <span style={styles.cluster} aria-hidden>
                    {includedIds.slice(0, 3).map(id => (
                      <span key={id} style={{...styles.clusterAvatar, background: gradientFor(id)}}>
                        {initialsFor(people[id].name)}
                      </span>
                    ))}
                  </span>
                  <span style={styles.chipText}>
                    Inner {includedCount} · {excludedCount} excluded
                  </span>
                  <span style={styles.chipChevron}>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </span>
                </button>
              </div>
              <div style={styles.spacer24} />
            </>
          ) : null}

          {activeTab === 'audience' ? (
            <>
              <h2 style={styles.sectionHeader}>Included · {includedCount}</h2>
              <div style={styles.listCard}>
                {includedIds.map((id, index) => (
                  <PersonRow key={id} person={people[id]} isLast={index === includedIds.length - 1} onToggle={togglePerson} />
                ))}
              </div>
              <h2 style={styles.sectionHeader}>Excluded · {excludedCount}</h2>
              {excludedCount > 0 ? (
                <div style={styles.listCard}>
                  {excludedIds.map((id, index) => (
                    <PersonRow key={id} person={people[id]} isLast={index === excludedIds.length - 1} onToggle={togglePerson} />
                  ))}
                </div>
              ) : (
                <p style={styles.terminalCaption}>Everyone&rsquo;s in — all 11 close friends included</p>
              )}
              <div style={styles.spacer24} />
            </>
          ) : null}

          {activeTab === 'scheduled' ? (
            <>
              <h2 style={styles.sectionHeader}>Tonight</h2>
              <div style={styles.listCard}>
                {/* Draft preview — the lead 48×72 thumb IS framesOrder[0]'s
                    gradient, live-mirroring the Plan tab's order. */}
                <button
                  type="button"
                  className="lume-btn lume-focusable"
                  style={styles.draftRow}
                  aria-label={\`Draft: Tonight's story, \${frameCount} frames, \${totalSeconds} seconds, Inner \${includedCount} — open Plan\`}
                  onClick={() => selectTab('plan')}>
                  <span style={{...styles.detailThumb, background: gradientFor(framesOrder[0])}} aria-hidden />
                  <span style={styles.schedText}>
                    <span style={styles.framePrimary}>Tonight&rsquo;s story</span>
                    <span style={styles.frameSecondary}>
                      {frameCount} frames · {totalSeconds}s · Inner {includedCount}
                    </span>
                  </span>
                  <span style={styles.chipChevron}>
                    <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                  </span>
                </button>
              </div>
              <h2 style={styles.sectionHeader}>Queued</h2>
              <div style={styles.listCard}>
                {SCHEDULED.map((story, index) => (
                  <div key={story.id}>
                    {index > 0 ? <div style={styles.rowDivider16} /> : null}
                    <button
                      type="button"
                      className="lume-btn lume-focusable"
                      style={styles.schedRow}
                      aria-label={\`\${story.title}, \${story.frameCount} frames, \${story.seconds} seconds, posts \${story.when}\`}
                      onClick={() => setStore(prev => ({...prev, ...toastPatch(\`\${story.title} posts \${story.when}\`)}))}>
                      <span style={styles.schedText}>
                        <span style={styles.framePrimary}>{story.title}</span>
                        <span style={styles.frameSecondary}>
                          {story.frameCount} frames · {story.seconds}s
                        </span>
                      </span>
                      <span style={styles.schedMeta}>{story.when}</span>
                    </button>
                  </div>
                ))}
              </div>
              {/* 53+47+28 = 128 at rest; re-derives with the live draft. */}
              <p style={styles.terminalCaption}>3 stories · {plannedSeconds}s planned</p>
              <div style={styles.spacer24} />
            </>
          ) : null}
        </main>

        {/* THE toast dock — sticky-in-flow at bottom 76 (amendment), the
            single polite live region; no auto-dismiss timers, one toast at
            a time, Undo rides inside for the remove-frame law. */}
        <div style={styles.toastDock} aria-live="polite">
          {toast != null ? (
            <div key={toast.seq} style={styles.toast}>
              <span style={styles.toastText}>{toast.text}</span>
              {toast.canUndo && removedFrame != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="lume-btn lume-focusable" style={styles.undoBtn} onClick={undoRemove}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} aria-label="Lume sections">
          {tabs.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                className="lume-btn lume-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => selectTab(tab.id)}>
                <Icon icon={tab.icon} size="md" color="inherit" />
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {sheetOpen ? (
          <Sheet
            titleId="lume-audience-title"
            title="Close friends"
            detent={sheetDetent}
            onDetentChange={detent => update('sheetDetent', detent)}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            pinned={
              <div style={styles.ghostRow}>
                <span style={styles.cluster} aria-hidden>
                  {excludedIds.slice(0, 3).map(id => (
                    <span
                      key={id}
                      style={{...styles.clusterAvatar, background: gradientFor(id), ...styles.avatarExcluded}}>
                      {initialsFor(people[id].name)}
                    </span>
                  ))}
                </span>
                <span style={styles.ghostLabel}>
                  {excludedCount === 0 ? 'No one excluded' : \`\${excludedCount} excluded · not shown tonight\`}
                </span>
              </div>
            }>
            {peopleOrder.map((id, index) => (
              <PersonRow key={id} person={people[id]} isLast={index === peopleOrder.length - 1} onToggle={togglePerson} />
            ))}
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};