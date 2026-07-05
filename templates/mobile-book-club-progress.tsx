// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Dogear club reading 'The Glass
 *   Meridian' by Odessa Vane (20 chapters, 340 pages; chapter lengths cycle
 *   14/18/16/20 ×5 = 340 ✓), frozen 7 days before the Jul 11 meeting. YOU
 *   are at Ch. 11 · p. 184 (= the ch-11 end page). Five members (pages
 *   82+150+184+218+286 = 920 → club average 184 = 54% ✓), eight discussion
 *   threads keyed to chapters (replies 6+2+5+3+4+3+5+2 = 30 ✓; unread in
 *   unlocked = 2+1 = 3 = initial Discuss badge ✓), per-chapter notes
 *   [1,0,2,1,0,3,1,2,0,1,2] (ch1–11, sum 13). No Date.now(), no
 *   Math.random(), no network media.
 * @output Dogear — Book Club Reading Progress: a 390px MOBILE spoiler-gated
 *   book-club surface. A 52px navBar (folded-corner Dogear mark · 'The
 *   Glass Meridian' h1 · pace-tinted 'Jul 11 · 7 days' countdown chip +
 *   Users button) over an 84px sticky ChapterSpineTrack — 20 chapter
 *   segments sized pages/340 as percentages, member avatar dots above,
 *   YOUR draggable 28px bookmark teardrop below (role='slider'), and a
 *   hatched SPOILER FOG from your page to 100%. Four tabs: Reading
 *   (PaceCoachCard + 12→20 chapter rows + page stepper), Discuss (8
 *   SpoilerGateThread rows — locked rows blur behind an unlock caption),
 *   Club (meeting card + 5 member rows with relative tags), Shelf (large
 *   title + 3 book rows). Signature move: ONE reading position unlocks
 *   everything — committing the bookmark (drag, slider keys, 'Mark read to
 *   here', stepper, locked-thread explainer) moves the fog, unblurs gated
 *   threads with a 400ms reply count-up, re-sums the Discuss badge
 *   (11→14 crosses ch12 +4 → 7 then ch14 +3 → 10), re-derives the pace
 *   coach (156 left → 23/day required, projected Jul 10, 1 day early),
 *   flips member relative tags, and re-tints the countdown chip — all
 *   under one Undo toast whose snapshot restores fog, gates, badge, pace,
 *   and tags exactly.
 * @position Page template; emitted by `astryx template mobile-book-club-progress`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet, anchored
 *   explainer) are position:'absolute' INSIDE shell; position:fixed is
 *   banned. While the chapter-notes sheet is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and the toastDock switches from
 *   sticky-in-flow to shell-absolute bottom:76; both restore on close.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); the
 *   Discuss stream is the one full-bleed list (feed convention). No
 *   desktop frames, no asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Dogear green); sanctioned non-brand literals are the
 *   pace-chip tint pairs, the read-segment fill, the spoiler-fog wash, and
 *   the scrim — each declared once with contrast math. Per the
 *   foundations amendment, the read-segment fill (a meaningful rest fill)
 *   carries ≥3:1 against its actual track surface — the spec's soft
 *   #CFE3D8/#2C4A3B pair measured ~1.2:1/1.7:1, so it is deepened here
 *   (deviation, math at the declaration).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — per-template
 *   choice); ChapterSpineTrack 84px sticky top:52 z15 (8 pad + 44 spine
 *   lane + 4 gap + 20 legend + 8 pad); total sticky stack 136px; tabBar
 *   64px sticky bottom z20 (24px icon / 4px gap / 11px 500 label; Discuss
 *   badge 16px-min brand pill 10px/600 at top:-4 right:-8); PaceCoachCard
 *   112px (16 overline + 8 + 32 stat + 6 + 18 caption inside 16 padding);
 *   chapter rows 60px two-line + trailing 36px secondary button; thread &
 *   member rows 72px media (40px avatar); utility rows 44px; sectionHeader
 *   13/600 uppercase 0.06em at 32px, 20 top / 8 bottom; loadMoreRow 44px;
 *   stepper 96×32 radius 8; toastDock sticky bottom:64 marginInline 16
 *   marginBottom 12 z30 (shell-absolute bottom:76 ONLY during sheet
 *   scroll-lock); sheet detents 55% / calc(100% − 56px), 24px grabber zone
 *   with 36×5 pill, 52px sheet header. TYPE: 28/700 large title (Shelf
 *   only) · 17/600 nav+card titles · 16/400 body floor · 13/400 meta ·
 *   11/500 overlines+tab labels; tabular-nums on every live number.
 *   Buttons 48 primary / 36 secondary / 44×44 icon. Touch: every target
 *   ≥44×44 with ≥8px clearance or merged full-row; every gesture has a
 *   button path (per-row 'Mark read to here' + stepper + slider keys are
 *   the bookmark-drag parity).
 *
 * Responsive contract:
 * - Fluid 320–430px: shell width 100%, ALL spine geometry in percentages
 *   (page/340), teardrop translateX(-50%); navBar title maxWidth 200
 *   ellipsized; below 360px CONTAINER width the countdown chip drops the
 *   date ('7 days') and chapter-row buttons shorten to 'Read to here'
 *   (fixed breakpoint 360, measured via useElementWidth); member pills
 *   ellipsize at 96px. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper —
 *   at ≥720px the shell renders as a centered 430px phone column with
 *   hairline borderInline; no adaptive relayout (per spec).
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  BookmarkIcon,
  BookOpenIcon,
  CalendarIcon,
  CheckIcon,
  LibraryIcon,
  LockIcon,
  MessagesSquareIcon,
  MinusIcon,
  NotebookPenIcon,
  PlusIcon,
  RefreshCwIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Dogear green). #2F6F4F on #FFFFFF ≈ 6.0:1
// (passes 4.5:1); #7FC9A4 on the dark card (~#1C1C1E) ≈ 8.9:1.
const BRAND_ACCENT = 'light-dark(#2F6F4F, #7FC9A4)';
// Text/glyphs over a BRAND_ACCENT fill (badge text, teardrop BookmarkIcon).
// Light: #FFFFFF on #2F6F4F ≈ 6.0:1. Dark: white on #7FC9A4 fails (~2.1:1),
// so the dark side flips to near-black green — #0E2B1E on #7FC9A4 ≈ 7.6:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #0E2B1E)';
// Countdown chip + "you're ahead" pill tint, ON-PACE. BRAND_ACCENT text on
// it: #2F6F4F on #E4F0E9 ≈ 5.1:1; #7FC9A4 on #1F3A2D ≈ 6.3:1 — both ≥4.5:1.
const CHIP_ON_BG = 'light-dark(#E4F0E9, #1F3A2D)';
// Countdown chip tint, BEHIND-PACE, carrying var(--color-error) text:
// assuming house error ≈ #B3261E light / #FCA5A5 dark, #B3261E on #F7E6E4 ≈
// 5.4:1 and #FCA5A5 on #42221F ≈ 7.6:1 — both ≥4.5:1.
const CHIP_BEHIND_BG = 'light-dark(#F7E6E4, #42221F)';
// Read-segment fill on the spine track — a MEANINGFUL REST FILL per the
// foundations amendment, so it needs ≥3:1 against its ACTUAL surface (the
// muted unread track base). #4E8A6A (L≈0.21) vs light muted ≈ #ECE9E4
// (L≈0.83) ≈ 3.4:1 ✓; #57996F (L≈0.26) vs dark muted ≈ #2A2A2C (L≈0.02) ≈
// 4.4:1 ✓. DEVIATION: spec named #CFE3D8/#2C4A3B (≈1.2:1/1.7:1 — fails the
// amendment), deepened here.
const READ_FILL = 'light-dark(#4E8A6A, #57996F)';
// Spoiler-fog wash over the unread track span (spec-exact). The fog is a
// passive veil — the ≥3:1 unread/read boundary is carried by READ_FILL and
// the teardrop, and the fog adds the diagonal hatch as a second encoding.
const FOG_WASH = 'light-dark(rgba(21, 17, 12, 0.10), rgba(255, 255, 255, 0.08))';
const FOG_HATCH = 'light-dark(rgba(21, 17, 12, 0.6), rgba(255, 255, 255, 0.6))';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Cover-thumb gradients, id-derived (no network art): stops picked from a
// deterministic hash of each book id, declared as literal pairs.
const COVER_MERIDIAN = 'linear-gradient(160deg, light-dark(#2F6F4F, #3E8A66) 0%, light-dark(#8FB8A6, #1F3A2D) 100%)';
const COVER_CARTOGRAPHER = 'linear-gradient(160deg, light-dark(#8A5A2F, #B07B4A) 0%, light-dark(#D9BFA0, #4A321F) 100%)';
const COVER_WINTER = 'linear-gradient(160deg, light-dark(#3E5A7A, #5B7FA6) 0%, light-dark(#A9BDD1, #22313F) 100%)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1
// helper, skeleton shimmer, and the prefers-reduced-motion guard.
// Transitions animate transform/opacity/color only.
// ---------------------------------------------------------------------------

const DOGEAR_CSS = `
.dge-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.dge-btn:disabled { cursor: default; }
.dge-focusable:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
.dge-fade { transition: opacity 200ms ease; }
.dge-move { transition: transform 200ms ease, opacity 200ms ease; }
@keyframes dge-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.dge-sheet-in { animation: dge-sheet-in 240ms ease; }
@keyframes dge-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.dge-shimmer { animation: dge-shimmer 1.6s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .dge-fade, .dge-move { transition: none; }
  .dge-sheet-in { animation: none; }
  .dge-shimmer { animation: none; display: none; }
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
  // NAV BAR — 52px sticky top z20; hairline + blur ALWAYS ON (this template
  // does not wire scroll-under; per-template choice, noted).
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
  navTrailing: {display: 'flex', justifyContent: 'flex-end', alignItems: 'center'},
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
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
  // Countdown chip — 28px pill in a 44px-tall hit.
  chipHit: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  chip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  chipOn: {background: CHIP_ON_BG, color: BRAND_ACCENT},
  chipBehind: {background: CHIP_BEHIND_BG, color: 'var(--color-error)'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // CHAPTER SPINE TRACK — sticky 84px block below the navBar: 8 pad + 44
  // lane + 4 gap + 20 legend + 8 pad = 84. Same blur surface as navBar.
  spineBlock: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    paddingTop: 8,
    paddingBottom: 8,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  spineLane: {position: 'relative', height: 44, marginInline: 16},
  // Percentage coordinate box — inset 12px inline so Priya's 84.12% dot and
  // the p340 teardrop never clip at the lane edge (stress fixture 2).
  spineBox: {position: 'absolute', top: 0, bottom: 0, left: 12, right: 12},
  spineTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 16,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    display: 'flex',
    gap: 1,
    background: 'var(--color-background-body)',
  },
  spineSeg: {position: 'relative', height: '100%', background: 'var(--color-background-muted)', overflow: 'hidden'},
  spineSegFill: {position: 'absolute', top: 0, bottom: 0, left: 0, background: READ_FILL},
  // SPOILER FOG — from yourPage/340% to 100% with a 20px feathered edge.
  fog: {
    position: 'absolute',
    top: 16,
    height: 12,
    right: 0,
    borderRadius: '0 6px 6px 0',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  fogWash: {position: 'absolute', inset: 0},
  fogHatch: {
    position: 'absolute',
    inset: 0,
    opacity: 0.06,
  },
  // p340 end-cap — fog width 0 renders a CheckIcon instead (stress 3).
  fogCap: {
    position: 'absolute',
    top: 14,
    right: -6,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
  },
  memberDot: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 24,
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    // Spec asks 10px/600 initials in the 24px dot (explicit exception to
    // the 11px floor; decorative — the Club rows carry the names).
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.02em',
  },
  // YOUR bookmark teardrop — 28px, folded-corner radius, rotated so the 4px
  // corner points up at the track; hangs below in a 44×44 hit.
  dropHit: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 44,
    transform: 'translateX(-50%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 12,
    touchAction: 'none',
    zIndex: 2,
  },
  drop: {
    width: 28,
    height: 28,
    borderRadius: '50% 50% 50% 4px',
    transform: 'rotate(225deg)',
    background: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 2px 8px var(--color-shadow)',
  },
  dropInner: {transform: 'rotate(-225deg)', display: 'grid', placeItems: 'center', color: BRAND_FILL_TEXT},
  dropGhost: {opacity: 0.5},
  legend: {
    marginTop: 4,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // PACE COACH CARD — 112px: 16 overline + 8 + 32 stat + 6 + 18 caption
  // inside 16px padding.
  paceCard: {
    position: 'relative',
    marginInline: 16,
    marginTop: 24,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  paceAccentBar: {position: 'absolute', top: 0, bottom: 0, left: 0, width: 3, background: 'var(--color-error)'},
  paceOverline: {
    height: 16,
    display: 'flex',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  paceStat: {
    marginTop: 8,
    height: 32,
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  paceUnit: {fontSize: 16, fontWeight: 500, color: 'var(--color-text-secondary)'},
  paceCaption: {
    marginTop: 6,
    minHeight: 18,
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  rowDividerFull: {height: 1, background: 'var(--color-border)'},
  // CHAPTER ROWS — 60px two-line; body button + trailing 36px secondary.
  chapterRow: {display: 'flex', alignItems: 'center', paddingInlineEnd: 8},
  chapterBody: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    borderRadius: 8,
  },
  chapterCheck: {flexShrink: 0, display: 'grid', placeItems: 'center', color: BRAND_ACCENT},
  chapterStack: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  chapterTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chapterMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chapterLock: {flexShrink: 0, display: 'grid', placeItems: 'center', color: 'var(--color-text-secondary)'},
  // 36px secondary button; the row's vertical padding extends its hit to
  // the 44px law (60px row − 36px button = 12px top/bottom slack merged).
  markBtn: {
    height: 36,
    paddingInline: 10,
    marginBlock: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
  },
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // POSITION card — 44px utility row + 96×32 stepper.
  utilityRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  utilityLabel: {flex: 1, minWidth: 0, fontSize: 16},
  utilityValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    marginInlineEnd: 8,
    borderRadius: 4,
  },
  stepper: {
    width: 96,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    background: 'var(--color-background-muted)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepHalf: {flex: 1, display: 'grid', placeItems: 'center', color: 'var(--color-text-primary)'},
  stepHalfDisabled: {opacity: 0.35},
  stepDivide: {width: 1, background: 'var(--color-border)'},
  // DISCUSS — full-bleed thread stream (feed convention: full dividers,
  // no card).
  threadRow: {
    position: 'relative',
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  threadAvatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  threadStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  threadTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  threadPreview: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  threadMeta: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  unreadDot: {width: 8, height: 8, borderRadius: '50%', background: BRAND_ACCENT, flexShrink: 0},
  veiled: {filter: 'blur(6px)', userSelect: 'none'},
  lockCaptionWrap: {position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingInline: 68},
  lockCaption: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  lockCaptionText: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textAlign: 'left',
  },
  // Anchored locked-thread explainer — the non-gesture unlock path.
  explainer: {
    position: 'absolute',
    right: 16,
    zIndex: 30,
    width: 248,
    maxWidth: 'calc(100% - 32px)',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  explainerText: {fontSize: 13, fontWeight: 500},
  explainerBtn: {
    height: 36,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  discussFooter: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // CLUB
  meetingRow: {height: 60, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  meetingIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: CHIP_ON_BG,
    color: BRAND_ACCENT,
  },
  memberRow: {height: 72, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  memberAvatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  relPill: {
    flexShrink: 0,
    maxWidth: 96,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  relPillAhead: {background: CHIP_ON_BG, color: BRAND_ACCENT},
  clubCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SHELF
  largeTitleRow: {height: 52, display: 'flex', alignItems: 'center', paddingInline: 16},
  largeTitle: {margin: 0, fontSize: 28, fontWeight: 700},
  bookRow: {height: 72, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16, width: '100%'},
  bookThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    overflow: 'hidden',
  },
  bookStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4},
  bookTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bookMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  miniBarTrack: {height: 4, borderRadius: 2, background: 'var(--color-background-muted)', overflow: 'hidden'},
  miniBarFill: {height: '100%', borderRadius: 2, background: BRAND_ACCENT},
  // SKELETON — 72px rows, deterministic widths, zero-shift geometry.
  skelRow: {height: 72, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skelAvatar: {width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background-muted)', flexShrink: 0},
  skelStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)', position: 'relative', overflow: 'hidden'},
  skelShimmer: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, transparent, light-dark(rgba(255,255,255,0.55), rgba(255,255,255,0.08)), transparent)',
  },
  // EMPTY STATE (chapter-notes sheet, ch2 zero-notes stress).
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
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 16px'},
  emptyBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
  },
  // TOAST DOCK — sticky-in-flow above the 64px tabBar (foundations
  // amendment: shell-absolute pins to the DOCUMENT bottom on tall views).
  // While the sheet scroll-lock is active it switches to shell-absolute
  // bottom:76 (the one sanctioned absolute case).
  toastDock: {
    position: 'sticky',
    bottom: 64,
    zIndex: 30,
    marginInline: 16,
    marginBottom: 12,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 45,
    marginInline: 0,
    marginBottom: 0,
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
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    borderRadius: 12,
  },
  // TAB BAR — 64px sticky bottom z20; 4 tabs.
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
  tabItemActive: {color: 'var(--color-brand)'},
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  tabBadge: {
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
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  // SHEET — scrim z40 + chapter-notes sheet z41.
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
  sheetSub: {
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexShrink: 0,
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 16px'},
  noteRow: {paddingBlock: 12},
  noteHead: {display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4},
  noteAuthor: {fontSize: 13, fontWeight: 600},
  noteDate: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  noteText: {fontSize: 16, lineHeight: 1.4},
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic by law. IDENTITY CONSTS first.
// ---------------------------------------------------------------------------

const BOOK_ID = 'bk-meridian';
const MEMBER_YOU = 'm-you';
const MEETING_DATE = 'Jul 11'; // 7 days out — fixed string, no Date().
const TOTAL_PAGES = 340;
const DAYS_LEFT = 7; // matches the navBar countdown chip
const PACE_RECENT = 26; // 'your recent pace · 26 pages/day'

// Chapter page-lengths cycle 14/18/16/20 ×5 — cycle sum 68 × 5 = 340 ✓.
const CH_LENGTHS: number[] = Array.from({length: 20}, (_, i) => [14, 18, 16, 20][i % 4]);
// Cumulative chapter-end pages: 14, 32, 48, 68, 82, 100, 116, 136, 150,
// 168, 184, 204, 218, 236, 252, 272, 286, 304, 320, 340 (last = 340 ✓).
const CH_ENDS: number[] = CH_LENGTHS.reduce<number[]>((acc, len) => {
  acc.push((acc[acc.length - 1] ?? 0) + len);
  return acc;
}, []);
const CH_STARTS: number[] = CH_ENDS.map((end, i) => end - CH_LENGTHS[i]);

// Ch. 7 is the stress-length title (60px row + sheet subtitle ellipsis).
const CH_TITLES: string[] = [
  'Saltglass',
  'The Tide Ledger',
  'The Cartwright Letters',
  'Meridian Zero',
  'The Harbormaster',
  'Inland',
  "The Long Correspondence of the Harbormaster's Widow",
  'Two Rivers Down',
  'Who Keeps the Light',
  'The Archive Fire',
  'Dead Reckoning',
  'The Salt Archive',
  'Northing',
  'The Second Map',
  'Glassworks',
  'The Debt',
  'Falsecolor',
  'The Quiet Meridian',
  'Landfall',
  'True North',
];

interface Member {
  id: string;
  name: string;
  initials: string;
  chapter: number;
  pageEnd: number; // dual field beside the derived pct (pageEnd/340)
}

// Club average = (82 + 150 + 184 + 218 + 286) / 5 = 920 / 5 = 184 = 54% ✓
// (the 184 term is YOUR live page — the caption re-derives when you move).
// Priya's name is the 72px-row ellipsis + 'PW' initials stress.
const MEMBERS: Member[] = [
  {id: 'm-jonah', name: 'Jonah Reyes', initials: 'JR', chapter: 5, pageEnd: 82}, // 24.12%
  {id: 'm-ravi', name: 'Ravi Batra', initials: 'RB', chapter: 9, pageEnd: 150}, // 44.12%
  {id: MEMBER_YOU, name: 'You', initials: 'DP', chapter: 11, pageEnd: 184}, // 54.12%
  {id: 'm-maya', name: 'Maya Lindqvist', initials: 'ML', chapter: 13, pageEnd: 218}, // 64.12%
  {id: 'm-priya', name: 'Priya Alexandra Whitcombe-Okafor', initials: 'PW', chapter: 17, pageEnd: 286}, // 84.12%
];
const FIXED_MEMBER_PAGE_SUM = 82 + 150 + 218 + 286; // 736; + your page = club sum

interface Thread {
  id: string;
  chapter: number;
  title: string;
  preview: string;
  replies: number;
  initials: string;
}

// Reply sum: 6+2+5+3+4+3+5+2 = 30 ✓ ('30 replies across 8 threads').
// Initial unread in unlocked = t3:2 + t4:1 = 3 = Discuss badge ✓.
// Unlocked-at-start visible replies = 6+2+5+3 = 16. t2 (2 replies, 0
// unread) proves the dot means unread, not unlock (stress fixture 7).
const THREADS: Thread[] = [
  {id: 't1', chapter: 3, title: 'The tide ledger is a forgery, right?', preview: "Ravi: the ink dates don't line up with the harbor fire…", replies: 6, initials: 'RB'},
  {id: 't2', chapter: 6, title: 'Pacing check-in — is Inland dragging?', preview: 'Jonah: two chapters of cart travel, I need a map', replies: 2, initials: 'JR'},
  {id: 't3', chapter: 9, title: 'Who is the harbormaster really?', preview: 'Maya: re-read the letter in Ch. 3 and tell me that’s not…', replies: 5, initials: 'ML'},
  {id: 't4', chapter: 11, title: 'Dead Reckoning ending — that last page!!', preview: 'Priya: I gasped on the ferry. People stared.', replies: 3, initials: 'PW'},
  {id: 't5', chapter: 12, title: 'The Salt Archive twist thread', preview: 'Maya: okay so the archive is not what we thought', replies: 4, initials: 'ML'},
  {id: 't6', chapter: 14, title: 'The Second Map — annotated scans', preview: 'Jonah: I traced the coastline against Ch. 4…', replies: 3, initials: 'JR'},
  {id: 't7', chapter: 17, title: 'Falsecolor theories (spoilers!!)', preview: 'Priya: calling it now — the glass was never blue', replies: 5, initials: 'PW'},
  {id: 't8', chapter: 19, title: 'Landfall predictions before True North', preview: 'Ravi: last chance to guess before the finale', replies: 2, initials: 'RB'},
];
const TOTAL_REPLIES = THREADS.reduce((sum, t) => sum + t.replies, 0); // 30 ✓

interface ChapterNote {
  id: string;
  author: string;
  date: string;
  text: string;
}

// Per-chapter note counts (ch1–11): [1,0,2,1,0,3,1,2,0,1,2] → sum 13.
// Chapter rows show '· n notes'; the sheet lists exactly that count.
const NOTES: Record<number, ChapterNote[]> = {
  1: [{id: 'n1a', author: 'You', date: 'Jun 20', text: 'Saltglass = the lighthouse lens? Flagging for the meeting.'}],
  3: [
    {id: 'n3a', author: 'Maya Lindqvist', date: 'Jun 22', text: 'The ledger entries skip every seventh day. Deliberate?'},
    {id: 'n3b', author: 'You', date: 'Jun 23', text: 'Cartwright signs with two different hands — compare p. 41 and p. 46.'},
  ],
  4: [{id: 'n4a', author: 'Ravi Batra', date: 'Jun 24', text: 'Meridian Zero is a bearing, not a place. Called it.'}],
  6: [
    {id: 'n6a', author: 'Jonah Reyes', date: 'Jun 26', text: 'The cart driver quotes the widow verbatim. Nobody noticed?'},
    {id: 'n6b', author: 'Priya Alexandra Whitcombe-Okafor', date: 'Jun 26', text: 'Inland reads slower on purpose — the book breathes here.'},
    {id: 'n6c', author: 'You', date: 'Jun 27', text: 'Mark the salt-cellar scene for discussion.'},
  ],
  7: [{id: 'n7a', author: 'You', date: 'Jun 28', text: 'The widow letters are dated AFTER the fire. Timeline board updated.'}],
  8: [
    {id: 'n8a', author: 'Maya Lindqvist', date: 'Jun 29', text: 'Two Rivers Down mirrors Ch. 2 beat for beat.'},
    {id: 'n8b', author: 'You', date: 'Jun 29', text: 'River names = the two Cartwright daughters?'},
  ],
  10: [{id: 'n10a', author: 'Ravi Batra', date: 'Jun 30', text: 'Archive fire = the ledger gap from Ch. 3. It all connects.'}],
  11: [
    {id: 'n11a', author: 'You', date: 'Jul 1', text: 'Dead Reckoning: the bearing from Ch. 4 finally pays off.'},
    {id: 'n11b', author: 'Priya Alexandra Whitcombe-Okafor', date: 'Jul 2', text: 'That last page. THAT LAST PAGE.'},
  ],
};

function notesFor(chapter: number): ChapterNote[] {
  return NOTES[chapter] ?? [];
}

// Finish-date labels indexed by projected days from the frozen 'today'
// (Jul 4): index 0 = Jul 4 … index 14 = Jul 18 (340 left → ceil(340/26)
// = 14 is the max reachable index).
const FINISH_DATES = [
  'Jul 4', 'Jul 5', 'Jul 6', 'Jul 7', 'Jul 8', 'Jul 9', 'Jul 10',
  'Jul 11', 'Jul 12', 'Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18',
];

interface ShelfBook {
  id: string;
  title: string;
  author: string;
  meta: string;
  cover: string;
  current: boolean;
}

const SHELF_BOOKS: ShelfBook[] = [
  {id: BOOK_ID, title: 'The Glass Meridian', author: 'Odessa Vane', meta: '340 pages', cover: COVER_MERIDIAN, current: true},
  {id: 'bk-cartographer', title: "The Cartographer's Debt", author: 'H. Ellison Marsh', meta: '412 pages · finished Jun 6', cover: COVER_CARTOGRAPHER, current: false},
  {id: 'bk-winter', title: "Winter's Ledger", author: 'Tove Askeland', meta: '288 pages · finished Apr 25', cover: COVER_WINTER, current: false},
];

// ---------------------------------------------------------------------------
// PURE DERIVATIONS — recomputed in render, zero effects (the six cascades).
// ---------------------------------------------------------------------------

/** Chapters fully read at `page` = count of chapter-end pages ≤ page. */
function chaptersReadAt(page: number): number {
  let n = 0;
  for (const end of CH_ENDS) {
    if (end <= page) n += 1;
  }
  return n;
}

/** Nearest chapter-end page (0 counts as the start-of-book anchor). */
function nearestChapterEnd(page: number): number {
  let best = 0;
  let bestDist = Math.abs(page);
  for (const end of CH_ENDS) {
    const dist = Math.abs(end - page);
    if (dist < bestDist) {
      best = end;
      bestDist = dist;
    }
  }
  return best;
}

function pct(page: number): number {
  return (page / TOTAL_PAGES) * 100;
}

function legendFor(page: number): string {
  const ch = chaptersReadAt(page);
  return ch === 0 ? `Start · p. ${page} of ${TOTAL_PAGES}` : `Ch. ${ch} · p. ${page} of ${TOTAL_PAGES}`;
}

interface PaceState {
  kind: 'on' | 'behind' | 'done';
  required: number;
  projected: number;
  finishLabel: string;
  caption: string;
}

/**
 * PaceCoach math — derived checkpoints (all cross-checked by hand):
 *   p184 → 156 left, required ceil(156/7) = 23, projected ceil(156/26) = 6
 *          → Jul 10, 1 day early, ON-PACE (chip green).
 *   p236 (ch14) → 104 left, required 15, projected 4 → Jul 8, 3 early.
 *   p116 (ch7) → 224 left, required 32, projected 9 → Jul 13, 2 LATE
 *          (chip + card error).
 *   p340 → 0 left: guard ceil(0/7) = 0 (never NaN) → TERMINAL
 *          'Finished · 7 days early' (stress fixture 3).
 */
function derivePace(page: number): PaceState {
  const pagesLeft = TOTAL_PAGES - page;
  if (pagesLeft <= 0) {
    return {kind: 'done', required: 0, projected: 0, finishLabel: 'Jul 4', caption: `Finished · ${DAYS_LEFT} days early`};
  }
  const required = Math.ceil(pagesLeft / DAYS_LEFT);
  const projected = Math.ceil(pagesLeft / PACE_RECENT);
  const finishLabel = FINISH_DATES[Math.min(projected, FINISH_DATES.length - 1)];
  if (projected <= DAYS_LEFT) {
    const early = DAYS_LEFT - projected;
    const caption =
      early === 0
        ? `to finish by ${MEETING_DATE} — at your recent ${PACE_RECENT}/day you finish right on ${MEETING_DATE}`
        : `to finish by ${MEETING_DATE} — at your recent ${PACE_RECENT}/day you finish ${finishLabel}, ${early} day${early === 1 ? '' : 's'} early`;
    return {kind: 'on', required, projected, finishLabel, caption};
  }
  const late = projected - DAYS_LEFT;
  return {
    kind: 'behind',
    required,
    projected,
    finishLabel,
    caption: `at ${PACE_RECENT}/day you finish ${finishLabel} — ${late} day${late === 1 ? '' : 's'} late`,
  };
}

/** Threads unlocked at a chapter count. */
function isUnlocked(thread: Thread, chaptersRead: number): boolean {
  return thread.chapter <= chaptersRead;
}

/**
 * Discuss badge = Σ unread over UNLOCKED threads. Checkpoints: start
 * (ch11) = 2+1 = 3 ✓; drag 11→14 crosses ch12 (+4 → 7) then ch14 (+3 →
 * 10) ✓; p340 = 2+1+4+3+5+2 = 17 ✓ (stress fixture 3).
 */
function badgeCount(unread: Record<string, number>, chaptersRead: number): number {
  return THREADS.reduce((sum, t) => (isUnlocked(t, chaptersRead) ? sum + (unread[t.id] ?? 0) : sum), 0);
}

// ---------------------------------------------------------------------------
// HOOKS & UTILITIES
// ---------------------------------------------------------------------------

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver can tell the
 * stages apart. */
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

/**
 * 400ms 0→n reply count-up for freshly unlocked threads; reduced motion
 * renders the final value instantly (no count-up, per the a11y plan).
 */
function CountUp({value, run, reduced}: {value: number; run: boolean; reduced: boolean}) {
  const [shown, setShown] = useState(run && !reduced ? 0 : value);
  useEffect(() => {
    if (!run || reduced) {
      setShown(value);
      return undefined;
    }
    let raf = 0;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start == null) start = ts;
      const t = Math.min((ts - start) / 400, 1);
      setShown(Math.round(t * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, reduced, value]);
  return <span style={{fontVariantNumeric: 'tabular-nums'}}>{shown}</span>;
}

// 28px Dogear mark — folded page corner with a speech-tail, stroke
// var(--color-text-primary) per the a11y plan (never --color-text).
function DogearMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" style={{color: 'var(--color-text-primary)'}}>
        <path d="M6 5.5h11l5 5V19a2 2 0 0 1-2 2h-8l-4 3.5V21H8a2 2 0 0 1-2-2V5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M17 5.5v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// CHAPTER SPINE TRACK — the sticky 84px custom component. All geometry in
// PERCENTAGES of the track box (page/340), zero px positions, so it renders
// clean 320–430px. The teardrop is the slider (role='slider', keyboard
// parity) and the drag ghost + live legend are transient LOCAL state (the
// one sanctioned local mirror: pointer deltas).
// ---------------------------------------------------------------------------

interface SpineProps {
  page: number;
  onCommit: (rawPage: number, opts: {snap: boolean; fine: boolean}) => void;
  reduced: boolean;
}

function ChapterSpineTrack({page, onCommit, reduced}: SpineProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [dragPage, setDragPage] = useState<number | null>(null);
  const chaptersRead = chaptersReadAt(page);
  const shownPage = dragPage ?? page;

  const pageFromClientX = (clientX: number): number => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (rect == null || rect.width === 0) return page;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return Math.round(ratio * TOTAL_PAGES);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragPage(pageFromClientX(event.clientX));
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragPage == null) return;
    setDragPage(pageFromClientX(event.clientX));
  };
  const handlePointerUp = () => {
    if (dragPage == null) return;
    // Pointerup snaps to the NEAREST CHAPTER-END page and commits.
    onCommit(dragPage, {snap: true, fine: false});
    setDragPage(null);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    // Keyboard parity with the drag: Arrow ±1 page (fine, like the
    // stepper), PageUp/Down snap ±1 chapter, Home/End 0/340.
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onCommit(page + 1, {snap: false, fine: true});
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onCommit(page - 1, {snap: false, fine: true});
    } else if (event.key === 'PageUp') {
      event.preventDefault();
      const next = CH_ENDS.find(end => end > page) ?? TOTAL_PAGES;
      onCommit(next, {snap: false, fine: false});
    } else if (event.key === 'PageDown') {
      event.preventDefault();
      const prevEnds = CH_ENDS.filter(end => end < page);
      onCommit(prevEnds.length > 0 ? prevEnds[prevEnds.length - 1] : 0, {snap: false, fine: false});
    } else if (event.key === 'Home') {
      event.preventDefault();
      onCommit(0, {snap: false, fine: false});
    } else if (event.key === 'End') {
      event.preventDefault();
      onCommit(TOTAL_PAGES, {snap: false, fine: false});
    }
  };

  return (
    <div style={styles.spineBlock}>
      <div style={styles.spineLane}>
        <div ref={boxRef} style={styles.spineBox}>
          <div style={styles.spineTrack} aria-hidden>
            {CH_ENDS.map((end, i) => {
              const len = CH_LENGTHS[i];
              const start = CH_STARTS[i];
              // Read fraction of this segment (partial while the stepper
              // sits mid-chapter; full once end ≤ page).
              const frac = Math.min(Math.max((page - start) / len, 0), 1);
              return (
                <span key={end} style={{...styles.spineSeg, flexBasis: `${pct(len)}%`, flexGrow: 0, flexShrink: 0}}>
                  {frac > 0 ? <span className="dge-fade" style={{...styles.spineSegFill, width: `${frac * 100}%`}} /> : null}
                </span>
              );
            })}
          </div>
          {/* SPOILER FOG — from page/340% to 100% with a 20px feathered
              leading edge; width 0 at p340 renders the CheckIcon end-cap
              instead (stress fixture 3). */}
          {page >= TOTAL_PAGES ? (
            <span style={styles.fogCap} aria-hidden>
              <Icon icon={CheckIcon} size="xsm" color="inherit" />
            </span>
          ) : (
            <div style={{...styles.fog, left: `${pct(page)}%`}} aria-hidden>
              {/* Wash with a 20px feathered leading edge (mask ramp). */}
              <span
                style={{
                  ...styles.fogWash,
                  background: FOG_WASH,
                  maskImage: 'linear-gradient(to right, transparent 0, #000 20px)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0, #000 20px)',
                }}
              />
              <span
                style={{
                  ...styles.fogHatch,
                  background: `repeating-linear-gradient(45deg, ${FOG_HATCH} 0 1px, transparent 1px 4px)`,
                }}
              />
            </div>
          )}
          {/* Member avatar dots above the track at pageEnd/340%; dots
              inside the fog (pageEnd > your page) render at 45%. */}
          {MEMBERS.filter(m => m.id !== MEMBER_YOU).map(m => (
            <span
              key={m.id}
              className="dge-fade"
              style={{...styles.memberDot, left: `${pct(m.pageEnd)}%`, opacity: m.pageEnd > page ? 0.45 : 1}}
              title={m.name}
              aria-hidden>
              {m.initials}
            </span>
          ))}
          {/* Drag ghost teardrop. */}
          {dragPage != null ? (
            <span style={{...styles.dropHit, ...styles.dropGhost, left: `${pct(dragPage)}%`, pointerEvents: 'none'}} aria-hidden>
              <span style={styles.drop}>
                <span style={styles.dropInner}>
                  <Icon icon={BookmarkIcon} size="xsm" color="inherit" />
                </span>
              </span>
            </span>
          ) : null}
          {/* YOUR bookmark — role='slider', the drag's keyboard path. */}
          <button
            type="button"
            className={`dge-btn dge-focusable${reduced ? '' : ' dge-move'}`}
            style={{...styles.dropHit, left: `${pct(page)}%`}}
            role="slider"
            aria-label="Your reading position"
            aria-valuemin={0}
            aria-valuemax={TOTAL_PAGES}
            aria-valuenow={page}
            aria-valuetext={`Chapter ${chaptersRead}, page ${page}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => setDragPage(null)}
            onKeyDown={handleKeyDown}>
            <span style={styles.drop}>
              {/* White BookmarkIcon on the brand fill: #FFF on #2F6F4F ≈
                  6.0:1; dark side flips to #0E2B1E on #7FC9A4 ≈ 7.6:1. */}
              <span style={styles.dropInner}>
                <Icon icon={BookmarkIcon} size="xsm" color="inherit" />
              </span>
            </span>
          </button>
        </div>
      </div>
      {/* Legend — live during drag ('Ch. 11 · p. 184 of 340'). */}
      <div style={styles.legend}>{legendFor(shownPage)}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PACE COACH CARD — pure derivative of progressStore, zero own state.
// ---------------------------------------------------------------------------

function PaceCoachCard({page}: {page: number}) {
  const pace = derivePace(page);
  const overlineColor = pace.kind === 'behind' ? 'var(--color-error)' : BRAND_ACCENT;
  return (
    <section style={styles.paceCard} aria-label="Pace coach">
      {pace.kind === 'behind' ? <span style={styles.paceAccentBar} aria-hidden /> : null}
      <div style={{...styles.paceOverline, color: overlineColor}}>
        {pace.kind === 'on' && 'PACE COACH · ON TRACK'}
        {pace.kind === 'behind' && 'PACE COACH · FALLING BEHIND'}
        {pace.kind === 'done' && 'PACE COACH · FINISHED'}
      </div>
      {pace.kind === 'done' ? (
        <>
          <div style={styles.paceStat}>
            Finished
            <span style={styles.paceUnit}>· {DAYS_LEFT} days early</span>
          </div>
          <div style={styles.paceCaption}>All 340 pages read before the {MEETING_DATE} meeting.</div>
        </>
      ) : (
        <>
          <div style={styles.paceStat}>
            {`Read ${pace.required}`}
            <span style={styles.paceUnit}>pages/day</span>
          </div>
          <div style={styles.paceCaption}>{pace.caption}</div>
          <div style={styles.paceCaption}>{`your recent pace · ${PACE_RECENT} pages/day`}</div>
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// SPOILER GATE THREAD — 72px row. UNLOCKED: normal media row (+8px brand
// unread dot inside the merged 44px+ row target). LOCKED: blurred
// title/preview (aria-hidden) under an UNBLURRED lock caption; the whole
// row is a real <button> named by the caption, opening the anchored
// explainer with the non-gesture unlock path.
// ---------------------------------------------------------------------------

interface ThreadRowProps {
  thread: Thread;
  unlocked: boolean;
  unread: number;
  justUnlocked: boolean;
  explainerOpen: boolean;
  reduced: boolean;
  onPress: () => void;
  onUnlockTo: (chapter: number) => void;
}

function SpoilerGateThread({thread, unlocked, unread, justUnlocked, explainerOpen, reduced, onPress, onUnlockTo}: ThreadRowProps) {
  if (unlocked) {
    return (
      <button
        type="button"
        className="dge-btn dge-focusable"
        style={styles.threadRow}
        aria-label={`${thread.title}, ${thread.replies} replies${unread > 0 ? `, ${unread} unread` : ''}`}
        onClick={onPress}>
        <span style={styles.threadAvatar} aria-hidden>
          {thread.initials}
        </span>
        <span style={styles.threadStack}>
          <span style={styles.threadTitle}>{`Ch. ${thread.chapter} · ${thread.title}`}</span>
          <span style={styles.threadPreview}>{thread.preview}</span>
        </span>
        <span style={styles.threadMeta}>
          {justUnlocked ? (
            <>
              <CountUp value={thread.replies} run reduced={reduced} /> replies
            </>
          ) : (
            `${thread.replies} replies`
          )}
          {unread > 0 ? <span style={styles.unreadDot} aria-hidden /> : null}
        </span>
      </button>
    );
  }
  return (
    <div style={{position: 'relative'}}>
      <button
        type="button"
        className="dge-btn dge-focusable"
        style={styles.threadRow}
        aria-label={`${thread.replies} replies, unlocks at chapter ${thread.chapter}`}
        aria-expanded={explainerOpen}
        onClick={onPress}>
        <span style={{...styles.threadAvatar, ...styles.veiled}} aria-hidden>
          {thread.initials}
        </span>
        <span style={{...styles.threadStack, ...styles.veiled}} aria-hidden>
          <span style={styles.threadTitle}>{`Ch. ${thread.chapter} · ${thread.title}`}</span>
          <span style={styles.threadPreview}>{thread.preview}</span>
        </span>
        <span style={styles.lockCaptionWrap}>
          <span style={styles.lockCaption}>
            <Icon icon={LockIcon} size="xsm" color="inherit" />
            <span style={styles.lockCaptionText}>{`${thread.replies} replies · unlocks at Ch. ${thread.chapter}`}</span>
          </span>
        </span>
      </button>
      {explainerOpen ? (
        <div style={{...styles.explainer, top: 60}} role="group" aria-label={`Unlock Ch. ${thread.chapter} discussion`}>
          <span style={styles.explainerText}>{`Read to Ch. ${thread.chapter} to join this thread`}</span>
          <button
            type="button"
            className="dge-btn dge-focusable"
            style={styles.explainerBtn}
            onClick={() => onUnlockTo(thread.chapter)}>
            {`Mark read to Ch. ${thread.chapter}`}
          </button>
        </div>
      ) : null}
    </div>
  );
}


// ---------------------------------------------------------------------------
// ONE STATE OWNER — progressStore. Every mutation flows through update() /
// setPosition(); the six cascades (fog, thread gates, badge, pace, member
// tags, chip tint) are pure render derivations of {page, unread}.
// ---------------------------------------------------------------------------

type TabId = 'reading' | 'discuss' | 'club' | 'shelf';

interface UndoSnapshot {
  page: number;
  unread: Record<string, number>;
}

interface ToastState {
  seq: number;
  msg: string;
  undoTo: UndoSnapshot | null;
}

interface ProgressStore {
  page: number; // 184 = the ch-11 end page
  unread: Record<string, number>;
  addedNotes: Record<number, ChapterNote[]>;
  justUnlocked: string[];
  activeTab: TabId;
  tabState: {
    reading: {shownChapters: number; scrollTop: number};
    discuss: {scrollTop: number; skeleton: boolean};
    club: {scrollTop: number};
    shelf: {scrollTop: number};
  };
  sheet: null | {chapter: number; detent: 'medium' | 'large'};
  explainerFor: string | null;
  toast: ToastState | null;
}

const INITIAL_STORE: ProgressStore = {
  page: 184,
  unread: {t3: 2, t4: 1}, // badge = 2 + 1 = 3 ✓
  addedNotes: {},
  justUnlocked: [],
  activeTab: 'reading',
  tabState: {
    reading: {shownChapters: 12, scrollTop: 0},
    discuss: {scrollTop: 0, skeleton: false},
    club: {scrollTop: 0},
    shelf: {scrollTop: 0},
  },
  sheet: null,
  explainerFor: null,
  toast: null,
};

const TABS: Array<{id: TabId; label: string; icon: typeof BookOpenIcon}> = [
  {id: 'reading', label: 'Reading', icon: BookOpenIcon},
  {id: 'discuss', label: 'Discuss', icon: MessagesSquareIcon},
  {id: 'club', label: 'Club', icon: UsersIcon},
  {id: 'shelf', label: 'Shelf', icon: LibraryIcon},
];

// Deterministic skeleton widths (never Math.random()).
const SKELETON_PRIMARY = ['60%', '45%', '70%', '60%'];
const SKELETON_SECONDARY = ['40%', '55%', '30%', '40%'];

function clampPage(page: number): number {
  return Math.min(Math.max(page, 0), TOTAL_PAGES);
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileBookClubProgressTemplate() {
  const [store, setStore] = useState<ProgressStore>(INITIAL_STORE);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const width = useElementWidth(wrapRef);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isNarrow = width > 0 && width < 360; // fixed breakpoint (contract)
  const isDesktop = width >= 720;

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const chapterRowRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pendingFocusCh = useRef<number | null>(null);
  const [shelfTitleUnder, setShelfTitleUnder] = useState(false);
  const shelfSentinelRef = useRef<HTMLDivElement | null>(null);

  const update = useCallback((patch: Partial<ProgressStore>) => {
    setStore(prev => ({...prev, ...patch}));
  }, []);

  // The demo's outer scroller owns the page scroll (the shell never
  // scrolls itself) — find it for per-tab scrollTop persistence.
  const getScroller = useCallback((): Element | null => {
    let el: HTMLElement | null = wrapRef.current;
    while (el != null) {
      const s = window.getComputedStyle(el);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return document.scrollingElement;
  }, []);

  /**
   * THE COMMIT PATH — identical for drag pointerup, slider keys, 'Mark
   * read to here', the page stepper, and the locked-thread explainer:
   * clamp → optional nearest-chapter-end snap → snapshot prev for Undo →
   * merge newly unlocked threads into unread. Fine-grained ±1 commits
   * skip the toast UNLESS they cross a chapter boundary.
   */
  const setPosition = useCallback((rawPage: number, opts: {snap: boolean; fine: boolean}) => {
    setStore(prev => {
      const clamped = clampPage(rawPage);
      const newPage = opts.snap ? nearestChapterEnd(clamped) : clamped;
      if (newPage === prev.page) return prev;
      const oldCh = chaptersReadAt(prev.page);
      const newCh = chaptersReadAt(newPage);
      const crossed = newCh !== oldCh;
      const newlyUnlocked = THREADS.filter(t => t.chapter > oldCh && t.chapter <= newCh);
      const unread = {...prev.unread};
      for (const t of newlyUnlocked) unread[t.id] = t.replies;
      let toast = prev.toast;
      if (!opts.fine || crossed) {
        let msg = newCh === 0 ? 'Moved back to the start' : `Marked read to Ch. ${newCh}`;
        // Unlock announcements route through the SAME single polite
        // region — merged into the one toast, never a second live region.
        if (newlyUnlocked.length === 1) {
          msg += ` · Ch. ${newlyUnlocked[0].chapter} discussion unlocked (${newlyUnlocked[0].replies} replies)`;
        } else if (newlyUnlocked.length > 1) {
          msg += ` · ${newlyUnlocked.length} discussions unlocked`;
        }
        toast = {
          seq: (prev.toast?.seq ?? 0) + 1,
          msg,
          // Full snapshot — Undo from p340 restores p184 exactly: badge
          // 17→3, five threads re-blur, terminal pace card reverts
          // (stress fixture 4).
          undoTo: {page: prev.page, unread: prev.unread},
        };
      }
      return {
        ...prev,
        page: newPage,
        unread,
        justUnlocked: newlyUnlocked.map(t => t.id),
        toast,
        explainerFor: null,
        // A commit is the "next interaction" that resolves a pending
        // Discuss skeleton (deterministic, user-driven).
        tabState: prev.tabState.discuss.skeleton
          ? {...prev.tabState, discuss: {...prev.tabState.discuss, skeleton: false}}
          : prev.tabState,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setStore(prev => {
      const undoTo = prev.toast?.undoTo;
      if (undoTo == null) return prev;
      const ch = chaptersReadAt(undoTo.page);
      return {
        ...prev,
        page: undoTo.page,
        unread: undoTo.unread,
        justUnlocked: [],
        toast: {
          seq: (prev.toast?.seq ?? 0) + 1,
          msg: ch === 0 ? 'Restored to the start' : `Restored to Ch. ${ch}`,
          undoTo: null,
        },
      };
    });
  }, []);

  const announce = useCallback((msg: string) => {
    setStore(prev => ({...prev, toast: {seq: (prev.toast?.seq ?? 0) + 1, msg, undoTo: null}}));
  }, []);

  // Tab switching — per-tab persistence law: scrollTop saved on exit and
  // restored on entry; overlays die on switch (toast persists); re-tapping
  // the active tab scrolls to top (the one legal reset).
  const switchTab = useCallback(
    (next: TabId) => {
      const scroller = getScroller();
      setStore(prev => {
        if (next === prev.activeTab) {
          if (scroller != null) scroller.scrollTop = 0;
          return prev;
        }
        const savedTop = scroller != null ? scroller.scrollTop : 0;
        return {
          ...prev,
          activeTab: next,
          sheet: null,
          explainerFor: null,
          tabState: {
            ...prev.tabState,
            [prev.activeTab]: {...prev.tabState[prev.activeTab], scrollTop: savedTop},
          },
        };
      });
    },
    [getScroller],
  );

  // Restore the entered tab's scroll position after the view swaps.
  useEffect(() => {
    const scroller = getScroller();
    if (scroller != null) scroller.scrollTop = store.tabState[store.activeTab].scrollTop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.activeTab]);

  // Sheet focus: into the sheet on open with preventScroll (amendment —
  // plain .focus() scroll-reveals the animating sheet inside the locked
  // column); restored to the opener on every close path.
  const sheetOpen = store.sheet != null;
  useEffect(() => {
    if (sheetOpen) sheetCloseRef.current?.focus({preventScroll: true});
  }, [sheetOpen]);

  const closeSheet = useCallback(() => {
    update({sheet: null});
    const opener = openerRef.current;
    if (opener != null) requestAnimationFrame(() => opener.focus());
  }, [update]);

  // Escape layering — topmost only: explainer, then sheet.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setStore(prev => {
        if (prev.explainerFor != null) return {...prev, explainerFor: null};
        return prev;
      });
      if (store.explainerFor == null && store.sheet != null) closeSheet();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [store.explainerFor, store.sheet, closeSheet]);

  // 'Show 8 more' moves focus to the Ch. 13 row (stress fixture 10).
  useEffect(() => {
    if (pendingFocusCh.current != null) {
      chapterRowRefs.current[pendingFocusCh.current - 1]?.focus();
      pendingFocusCh.current = null;
    }
  }, [store.tabState.reading.shownChapters]);

  // Shelf large-title collapse — IntersectionObserver sentinel fades the
  // navBar center title in once the 28px title scrolls under.
  useEffect(() => {
    if (store.activeTab !== 'shelf') return undefined;
    const sentinel = shelfSentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(entries => {
      setShelfTitleUnder(!(entries[0]?.isIntersecting ?? true));
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [store.activeTab]);

  // ---- PURE RENDER DERIVATIONS (the six cascades) ----
  const page = store.page;
  const chaptersRead = chaptersReadAt(page);
  const badge = badgeCount(store.unread, chaptersRead);
  const pace = derivePace(page);
  // Club aggregate derives live from the rows: fixed 736 + your page
  // (82+150+218+286 = 736; at p184 → 920/5 = 184 = 54% ✓).
  const clubAvg = Math.round((FIXED_MEMBER_PAGE_SUM + page) / MEMBERS.length);
  const clubPct = Math.round((clubAvg / TOTAL_PAGES) * 100);
  const aheadOfYou = MEMBERS.filter(m => m.id !== MEMBER_YOU && m.pageEnd > page).length;
  const shownChapters = store.tabState.reading.shownChapters;
  const chipBehind = pace.kind === 'behind';

  const notesCountFor = (ch: number) => notesFor(ch).length + (store.addedNotes[ch]?.length ?? 0);

  const openNotesSheet = (ch: number, opener: HTMLElement) => {
    openerRef.current = opener;
    update({sheet: {chapter: ch, detent: 'medium'}});
  };

  const markReadTo = (ch: number) => {
    setPosition(ch === 0 ? 0 : CH_ENDS[ch - 1], {snap: false, fine: false});
  };

  const onThreadPress = (t: Thread, unlocked: boolean) => {
    if (unlocked) {
      // Reading a thread clears its unread dot; the badge re-sums.
      setStore(prev => (prev.unread[t.id] ? {...prev, unread: {...prev.unread, [t.id]: 0}} : prev));
    } else {
      setStore(prev => ({...prev, explainerFor: prev.explainerFor === t.id ? null : t.id}));
    }
  };

  const onRefreshDiscuss = () => {
    setStore(prev => {
      const wasSkeleton = prev.tabState.discuss.skeleton;
      return {
        ...prev,
        tabState: {...prev.tabState, discuss: {...prev.tabState.discuss, skeleton: !wasSkeleton}},
        toast: {
          seq: (prev.toast?.seq ?? 0) + 1,
          msg: wasSkeleton ? 'Updated just now' : 'Loading discussions…',
          undoTo: null,
        },
      };
    });
  };

  const addNote = (ch: number) => {
    setStore(prev => {
      const existing = prev.addedNotes[ch] ?? [];
      const note: ChapterNote = {
        id: `n${ch}-added-${existing.length + 1}`,
        author: 'You',
        date: 'Today',
        text: 'Dog-eared for the meeting — come back to this.',
      };
      return {
        ...prev,
        addedNotes: {...prev.addedNotes, [ch]: [...existing, note]},
        toast: {seq: (prev.toast?.seq ?? 0) + 1, msg: `Note added to Ch. ${ch}`, undoTo: null},
      };
    });
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const idx = TABS.findIndex(t => t.id === store.activeTab);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next = TABS[(idx + delta + TABS.length) % TABS.length];
    switchTab(next.id);
    requestAnimationFrame(() => document.getElementById(`dge-tab-${next.id}`)?.focus());
  };

  const navTitleByTab: Record<TabId, string> = {
    reading: 'The Glass Meridian',
    discuss: 'Discussion',
    club: 'Club',
    shelf: 'Shelf',
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(sheetOpen ? styles.shellLocked : null),
    ...(isDesktop ? styles.shellDesktop : null),
  };

  const sheetChapter = store.sheet?.chapter ?? 0;
  const sheetNotes = sheetChapter > 0 ? [...notesFor(sheetChapter), ...(store.addedNotes[sheetChapter] ?? [])] : [];

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{DOGEAR_CSS}</style>
      <div style={shellStyle}>
        {/* NAV BAR — 52px sticky; hairline always on (noted). */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <DogearMark />
          </div>
          {store.activeTab === 'shelf' ? (
            <span
              className="dge-fade"
              style={{...styles.navTitle, opacity: shelfTitleUnder ? 1 : 0}}
              aria-hidden={!shelfTitleUnder}>
              Shelf
            </span>
          ) : (
            <h1 style={styles.navTitle}>{navTitleByTab[store.activeTab]}</h1>
          )}
          <div style={styles.navTrailing}>
            {/* Countdown chip — pace-tinted; below 360px container width
                the date drops ('7 days'); press opens the Club tab. */}
            <button
              type="button"
              className="dge-btn dge-focusable"
              style={styles.chipHit}
              aria-label={`Meeting ${MEETING_DATE}, ${DAYS_LEFT} days away${chipBehind ? ', behind pace' : ', on pace'} — open Club tab`}
              onClick={() => switchTab('club')}>
              <span style={{...styles.chip, ...(chipBehind ? styles.chipBehind : styles.chipOn)}}>
                {isNarrow ? `${DAYS_LEFT} days` : `${MEETING_DATE} · ${DAYS_LEFT} days`}
              </span>
            </button>
            {store.activeTab === 'discuss' ? (
              <button
                type="button"
                className="dge-btn dge-focusable"
                style={styles.iconBtn}
                aria-label={store.tabState.discuss.skeleton ? 'Finish refreshing discussions' : 'Refresh discussions'}
                onClick={onRefreshDiscuss}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            ) : (
              <button
                type="button"
                className="dge-btn dge-focusable"
                style={styles.iconBtn}
                aria-label="Club members"
                onClick={() => switchTab('club')}>
                <Icon icon={UsersIcon} size="md" color="inherit" />
              </button>
            )}
          </div>
        </header>

        {/* CHAPTER SPINE TRACK — sticky 84px below the navBar (total
            sticky stack 52 + 84 = 136px). */}
        <ChapterSpineTrack page={page} onCommit={setPosition} reduced={reduced} />

        <main style={styles.main}>
          {store.activeTab === 'reading' ? (
            <>
              <PaceCoachCard page={page} />
              <h2 style={styles.sectionHeader}>Chapters</h2>
              <div style={styles.listCard}>
                {Array.from({length: shownChapters}, (_, idx) => {
                  const ch = idx + 1;
                  const isRead = CH_ENDS[idx] <= page;
                  const isCurrent = ch === chaptersRead + 1 && page < TOTAL_PAGES;
                  const isFuture = ch > chaptersRead + 1;
                  const n = notesCountFor(ch);
                  return (
                    <div key={ch}>
                      {idx > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.chapterRow}>
                        <button
                          type="button"
                          ref={el => {
                            chapterRowRefs.current[idx] = el;
                          }}
                          className="dge-btn dge-focusable"
                          style={styles.chapterBody}
                          aria-label={`Chapter ${ch}, ${CH_TITLES[idx]} — open notes`}
                          onClick={event => openNotesSheet(ch, event.currentTarget)}>
                          {isRead ? (
                            <span style={styles.chapterCheck} aria-hidden>
                              <Icon icon={CheckIcon} size="sm" color="inherit" />
                            </span>
                          ) : null}
                          <span style={styles.chapterStack}>
                            <span
                              style={{
                                ...styles.chapterTitle,
                                ...(isCurrent ? {fontWeight: 600} : null),
                                ...(isFuture ? {opacity: 0.6} : null),
                              }}>
                              {`Ch. ${ch} · ${CH_TITLES[idx]}`}
                            </span>
                            <span style={styles.chapterMeta}>
                              {`${CH_LENGTHS[idx]} pages${n > 0 ? ` · ${n} note${n === 1 ? '' : 's'}` : ''}`}
                            </span>
                          </span>
                          {isFuture ? (
                            <span style={styles.chapterLock} aria-hidden>
                              <Icon icon={LockIcon} size="xsm" color="inherit" />
                            </span>
                          ) : null}
                        </button>
                        <button
                          type="button"
                          className="dge-btn dge-focusable"
                          style={styles.markBtn}
                          aria-label={`Mark read to chapter ${ch}`}
                          onClick={() => markReadTo(ch)}>
                          {isNarrow ? 'Read to here' : 'Mark read to here'}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {shownChapters < 20 ? (
                  <>
                    <div style={styles.rowDivider} />
                    <button
                      type="button"
                      className="dge-btn dge-focusable"
                      style={styles.loadMoreRow}
                      onClick={() => {
                        pendingFocusCh.current = shownChapters + 1;
                        setStore(prev => ({
                          ...prev,
                          tabState: {
                            ...prev.tabState,
                            reading: {...prev.tabState.reading, shownChapters: 20},
                          },
                          toast: {seq: (prev.toast?.seq ?? 0) + 1, msg: '8 more chapters shown', undoTo: null},
                        }));
                      }}>
                      Show 8 more
                    </button>
                  </>
                ) : null}
              </div>
              {shownChapters >= 20 ? <div style={styles.terminalCaption}>All 20 chapters</div> : null}
              <h2 style={styles.sectionHeader}>Position</h2>
              <div style={{...styles.listCard, marginBottom: 24}}>
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>Page</span>
                  {/* Value ≥16px tabular with 8px clearance (contract). */}
                  <span
                    style={styles.utilityValue}
                    className="dge-focusable"
                    tabIndex={0}
                    role="spinbutton"
                    aria-label="Page"
                    aria-valuenow={page}
                    aria-valuemin={0}
                    aria-valuemax={TOTAL_PAGES}
                    onKeyDown={event => {
                      if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setPosition(page + 1, {snap: false, fine: true});
                      } else if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        setPosition(page - 1, {snap: false, fine: true});
                      }
                    }}>
                    {page}
                  </span>
                  {/* 96×32 stepper; halves reach the 44px law via the
                      44px row's merged padding (foundations merge clause). */}
                  <div style={styles.stepper}>
                    <button
                      type="button"
                      className="dge-btn dge-focusable"
                      style={{...styles.stepHalf, ...(page <= 0 ? styles.stepHalfDisabled : null)}}
                      aria-label="Decrease page"
                      disabled={page <= 0}
                      onClick={() => setPosition(page - 1, {snap: false, fine: true})}>
                      <Icon icon={MinusIcon} size="sm" color="inherit" />
                    </button>
                    <span style={styles.stepDivide} aria-hidden />
                    <button
                      type="button"
                      className="dge-btn dge-focusable"
                      style={{...styles.stepHalf, ...(page >= TOTAL_PAGES ? styles.stepHalfDisabled : null)}}
                      aria-label="Increase page"
                      disabled={page >= TOTAL_PAGES}
                      onClick={() => setPosition(page + 1, {snap: false, fine: true})}>
                      <Icon icon={PlusIcon} size="sm" color="inherit" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {store.activeTab === 'discuss' ? (
            <>
              <h2 style={styles.sectionHeader}>{`Discussion · ${THREADS.length} threads`}</h2>
              {store.tabState.discuss.skeleton ? (
                <div aria-busy="true">
                  {SKELETON_PRIMARY.map((w, i) => (
                    <div key={w + String(i)}>
                      {i > 0 ? <div style={styles.rowDividerFull} /> : null}
                      <div style={styles.skelRow} aria-hidden>
                        <span style={styles.skelAvatar} />
                        <span style={styles.skelStack}>
                          <span style={{...styles.skelBar, width: w}}>
                            <span className="dge-shimmer" style={styles.skelShimmer} />
                          </span>
                          <span style={{...styles.skelBar, width: SKELETON_SECONDARY[i]}}>
                            <span className="dge-shimmer" style={styles.skelShimmer} />
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {THREADS.map((t, i) => {
                    const unlocked = isUnlocked(t, chaptersRead);
                    return (
                      <div key={t.id}>
                        {i > 0 ? <div style={styles.rowDividerFull} /> : null}
                        <SpoilerGateThread
                          thread={t}
                          unlocked={unlocked}
                          unread={store.unread[t.id] ?? 0}
                          justUnlocked={store.justUnlocked.includes(t.id)}
                          explainerOpen={store.explainerFor === t.id}
                          reduced={reduced}
                          onPress={() => onThreadPress(t, unlocked)}
                          onUnlockTo={markReadTo}
                        />
                      </div>
                    );
                  })}
                  <div style={{...styles.discussFooter, marginBottom: 24}}>
                    {`${TOTAL_REPLIES} replies across ${THREADS.length} threads`}
                  </div>
                </div>
              )}
            </>
          ) : null}

          {store.activeTab === 'club' ? (
            <>
              <div style={{...styles.listCard, marginTop: 24}}>
                <div style={styles.meetingRow}>
                  <span style={styles.meetingIcon} aria-hidden>
                    <Icon icon={CalendarIcon} size="md" color="inherit" />
                  </span>
                  <span style={styles.threadStack}>
                    <span style={styles.threadTitle}>Next meeting</span>
                    <span style={styles.threadPreview}>{`Fri ${MEETING_DATE} · 7:00 PM · hosted by Priya`}</span>
                  </span>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>{`Members · ${MEMBERS.length}`}</h2>
              <div style={styles.listCard}>
                {MEMBERS.map((m, i) => {
                  const isYou = m.id === MEMBER_YOU;
                  const mPage = isYou ? page : m.pageEnd;
                  const mCh = isYou ? chaptersRead : m.chapter;
                  const youAhead = !isYou && m.pageEnd < page;
                  const theyAhead = !isYou && m.pageEnd > page;
                  const chDiff = Math.max(m.chapter - chaptersRead, 1);
                  return (
                    <div key={m.id}>
                      {i > 0 ? <div style={styles.rowDividerDeep} /> : null}
                      <div style={styles.memberRow}>
                        <span style={styles.memberAvatar} aria-hidden>
                          {m.initials}
                        </span>
                        <span style={styles.threadStack}>
                          <span style={styles.memberName}>{m.name}</span>
                          <span style={styles.chapterMeta}>{mCh === 0 ? `p. ${mPage}` : `Ch. ${mCh} · p. ${mPage}`}</span>
                        </span>
                        {isYou ? (
                          <span style={{...styles.relPill, ...styles.relPillAhead}}>you</span>
                        ) : theyAhead ? (
                          <span style={styles.relPill}>{`${chDiff} ch. ahead`}</span>
                        ) : youAhead ? (
                          <span style={{...styles.relPill, ...styles.relPillAhead}}>you&rsquo;re ahead</span>
                        ) : (
                          <span style={styles.relPill}>with you</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{...styles.clubCaption, marginBottom: 24}}>
                {`Club average · p. ${clubAvg} of ${TOTAL_PAGES} (${clubPct}%) · ahead of you: ${aheadOfYou}`}
              </div>
            </>
          ) : null}

          {store.activeTab === 'shelf' ? (
            <>
              <div ref={shelfSentinelRef} style={{height: 1}} aria-hidden />
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Shelf</h1>
              </div>
              <div style={{...styles.listCard, marginTop: 12, marginBottom: 24}}>
                {SHELF_BOOKS.map((book, i) => {
                  const inner = (
                    <>
                      <span style={{...styles.bookThumb, background: book.cover}} aria-hidden>
                        <Icon icon={book.current ? BookOpenIcon : CheckIcon} size="sm" color="inherit" />
                      </span>
                      <span style={styles.bookStack}>
                        <span style={styles.bookTitle}>{book.title}</span>
                        {book.current ? (
                          <>
                            <span style={styles.bookMeta}>{`by ${book.author} · ${Math.round((page / TOTAL_PAGES) * 100)}%`}</span>
                            <span style={styles.miniBarTrack} aria-hidden>
                              <span className="dge-fade" style={{...styles.miniBarFill, width: `${pct(page)}%`}} />
                            </span>
                          </>
                        ) : (
                          <span style={styles.bookMeta}>{book.meta}</span>
                        )}
                      </span>
                    </>
                  );
                  return (
                    <div key={book.id}>
                      {i > 0 ? <div style={styles.rowDividerDeep} /> : null}
                      {book.current ? (
                        <button
                          type="button"
                          className="dge-btn dge-focusable"
                          style={styles.bookRow}
                          aria-label={`Continue ${book.title} — open Reading tab`}
                          onClick={() => switchTab('reading')}>
                          {inner}
                        </button>
                      ) : (
                        <div style={styles.bookRow}>{inner}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </main>

        {/* TOAST DOCK — the ONE polite live region. Sticky-in-flow above
            the 64px tabBar; shell-absolute bottom:76 ONLY while the sheet
            scroll-lock is active (foundations amendment). No timers. */}
        <div
          style={sheetOpen ? {...styles.toastDock, ...styles.toastDockLocked} : styles.toastDock}
          aria-live="polite">
          {store.toast != null ? (
            <div style={styles.toast}>
              <span style={styles.toastMsg}>{store.toast.msg}</span>
              {store.toast.undoTo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="dge-btn dge-focusable" style={styles.toastUndo} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : (
                <span style={{width: 16, flexShrink: 0}} aria-hidden />
              )}
            </div>
          ) : null}
        </div>

        {/* TAB BAR — 64px, 4 tabs, tablist with arrow keys; the badge
            count lives in the tab's accessible name. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Dogear sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const active = tab.id === store.activeTab;
            const withBadge = tab.id === 'discuss' && badge > 0;
            return (
              <button
                key={tab.id}
                id={`dge-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                className="dge-btn dge-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                aria-label={withBadge ? `${tab.label}, ${badge} unread` : tab.label}
                onClick={() => switchTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                  {withBadge ? (
                    <span style={styles.tabBadge} aria-hidden>
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* CHAPTER-NOTES SHEET — two detents, the one legal inner
            scroller; shell scroll-locks while open. */}
        {store.sheet != null ? (
          <>
            <div className="dge-fade" style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <div
              ref={sheetRef}
              className={reduced ? undefined : 'dge-sheet-in'}
              style={{
                ...styles.sheet,
                height: store.sheet.detent === 'medium' ? '55%' : 'calc(100% - 56px)',
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dge-sheet-title"
              onKeyDown={event => trapTabKey(event, sheetRef.current)}>
              <div style={styles.grabberZone}>
                <button
                  type="button"
                  className="dge-btn dge-focusable"
                  style={{width: 44, height: 24, display: 'grid', placeItems: 'center', borderRadius: 8}}
                  aria-label="Resize sheet"
                  onClick={() =>
                    setStore(prev =>
                      prev.sheet == null
                        ? prev
                        : {...prev, sheet: {...prev.sheet, detent: prev.sheet.detent === 'medium' ? 'large' : 'medium'}},
                    )
                  }>
                  <span style={styles.grabberPill} aria-hidden />
                </button>
              </div>
              <div style={styles.sheetHeader}>
                <span aria-hidden />
                {/* Header uses the chapter NUMBER; the full title sits in
                    the 13px subtitle so the Ch. 7 stress-length title
                    ellipsizes there (stress fixture 1). */}
                <h2 id="dge-sheet-title" style={styles.sheetTitle}>{`Ch. ${sheetChapter} Notes`}</h2>
                <button
                  type="button"
                  ref={sheetCloseRef}
                  className="dge-btn dge-focusable"
                  style={styles.iconBtn}
                  aria-label="Close notes"
                  onClick={closeSheet}>
                  <Icon icon={XIcon} size="md" color="inherit" />
                </button>
              </div>
              <div style={styles.sheetSub}>{CH_TITLES[sheetChapter - 1] ?? ''}</div>
              <div style={styles.sheetBody}>
                {sheetNotes.length === 0 ? (
                  // TRUE-EMPTY (ch2 stress): one icon circle, one-line
                  // fact, what-fills-it body, EXACTLY ONE action.
                  <div style={styles.emptyState}>
                    <span style={styles.emptyCircle}>
                      <Icon icon={NotebookPenIcon} size="lg" color="inherit" />
                    </span>
                    <p style={styles.emptyTitle}>{`No notes for Ch. ${sheetChapter}`}</p>
                    <p style={styles.emptyBody}>Notes you add appear here.</p>
                    <button
                      type="button"
                      className="dge-btn dge-focusable"
                      style={styles.emptyBtn}
                      onClick={() => addNote(sheetChapter)}>
                      Add note
                    </button>
                  </div>
                ) : (
                  <>
                    {sheetNotes.map((note, i) => (
                      <div key={note.id}>
                        {i > 0 ? <div style={styles.rowDividerFull} /> : null}
                        <div style={styles.noteRow}>
                          <div style={styles.noteHead}>
                            <span style={styles.noteAuthor}>{note.author}</span>
                            <span style={styles.noteDate}>{note.date}</span>
                          </div>
                          <div style={styles.noteText}>{note.text}</div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="dge-btn dge-focusable"
                      style={{...styles.emptyBtn, marginTop: 8}}
                      onClick={() => addNote(sheetChapter)}>
                      Add note
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
