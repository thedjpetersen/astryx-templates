var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Chalkline, tutor Dana Reyes's
 *   session-note book, frozen on the Jul 4 Algebra II session with Maya
 *   Okafor. Six students; five concepts with three prior sessions of
 *   ladder history (column sums 9/11/14 → averages 1.8/2.2/2.8 — the
 *   sparkline IS that math); a 12-segment minutemap tagged
 *   2/5/3/2 segments × 5 min = 10/25/15/10 = 60; four homework chips
 *   (2 on); three past sessions (Jun 27 · 2.8, Jun 20 · 2.2, Jun 13 ·
 *   1.8). No Date.now(), no Math.random(), no network media — 'Rated
 *   just now' and 'Sent · just now' are fixed strings.
 * @output Chalkline — Session Notes: a 390px MOBILE tutoring surface
 *   where every input rewrites the parent recap live. Four tabs
 *   (Students/Sessions/Recaps/More) over a 64px tabBar; the Sessions tab
 *   is the flagship editor: a Minutemap strip (12 tap-cycle segments,
 *   5 min each) above five ConceptMasteryLadder rows (44×44 rung radios
 *   with 3-dot ghost-history strips), a homework chip grid, a live
 *   RecapComposer whose sentences re-derive from the same draft, a
 *   past-session timeline, and a sticky Send footer. Signature move: tap
 *   rung 3 on Quadratic factoring → the composer sentence rewrites in
 *   place with a 240ms tint, the group chip flips Focus→Progressing
 *   (groups 2/2/1 → 1/3/1), the Students-tab sparkline's last point
 *   lifts 2.8→3.0 (sum 14→15 over 5 concepts), and the row meta reads
 *   'Rated just now'. A two-detent sheet previews the recap exactly as
 *   Amara Okafor will read it (TimeSplitDonut degrees = minutes × 6, so
 *   sheet and minutemap can never disagree); Send is undo-over-confirm.
 * @position Page template; emitted by \`astryx template mobile-tutor-session-notes\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, sheet,
 *   actionSheet) are position:'absolute' INSIDE shell; position:fixed is
 *   banned. While the recap sheet or the session-picker actionSheet is
 *   open, shell locks to {height:'100dvh', overflow:'hidden'} and
 *   restores on close (shell-absolute overlays are correct ONLY while
 *   locked). The toastDock is sticky-in-flow (bottom 76 above the 64px
 *   tabBar; 156 on the Sessions editor to clear its 80px send footer) —
 *   NEVER shell-absolute, which would pin to the document bottom on
 *   tall scrolling views. The stage clips to --radius-container; shell
 *   paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for avatar rows); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Chalkline slate blue #345995 — the demo's
 *   --color-brand is the demo logo blue, so the spec hex is quarantined
 *   per house rule). Sanctioned non-brand literals: the four minutemap
 *   block fills (warmup amber / practice teal / review violet — new
 *   material IS the brand), the rung/chip interactive-boundary border
 *   (≥3:1 vs the card surface per the batch-2 amendment), and the
 *   ghost-history dot fill — each with contrast math at the declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr'); largeTitle row 52px
 *   (28/700 — Students header total 104px); tabBar 64px exactly; sheet
 *   header 52px; grabber zone 24px w/ 36×5 pill. Rows: 44px utility
 *   (More) / 60px two-line (Recaps) / 72px media (Students 40px avatars,
 *   timeline) / 96px ConceptMasteryLadder (padding 16 inline, 12 block).
 *   Card sums cross-checked: mastery 5×96+4 = 484px · students 6×72+5 =
 *   437px · timeline 3×72+2 = 218px. Minutemap: card inner padding 12,
 *   12 flex:1 segments with 2px gaps in a 56px track (8px outer radius,
 *   4px segments, first/last inherit via overflow hidden); legend chips
 *   28px, 8px gaps. TYPE (Figtree via --font-family-body): 28/700 large
 *   title · 22/700 recap heading in sheet · 17/600 nav+card titles ·
 *   16/400 body floor · 13/400 secondary · 13/600 uppercase
 *   sectionHeaders (0.06em, at 32px, 20px top / 8px bottom) · 11/500 tab
 *   labels + rung numerals' index strip + donut legend overlines;
 *   tabular-nums on every minute count, average, and rung numeral.
 *   Buttons: 48px primary full-width, 36px chips/secondary in 44px-tall
 *   hits, 44×44 icon buttons.
 *
 * Responsive contract:
 * - Fluid 320–430px: no width literals; cards are gutter-inset fluid
 *   width. Ladder rung strip is 4×44 + 3×8 = 200px and fits the 320px
 *   worst case (320 − 32 gutter − 32 card pad = 256px content, 56px
 *   slack); the group chip wraps under long names via flexWrap. The 12
 *   minutemap segments are flex:1 (at 320 the track is 264px → ≈20.2px
 *   segments, legal because the whole 56px-tall track is the merged
 *   gesture surface and every segment button spans full track height).
 *   Students rows: text block minWidth 0 + ellipsis; sparkline 64px and
 *   avg chip flex:none. Sheet detents are %-based against the locked
 *   100dvh. Donut fixed 120px, legend wraps.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrap
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered 430px phone column (maxWidth 430, marginInline auto,
 *   hairline borderInline). No adaptive relayout — the ladder anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  MoreHorizontalIcon,
  PenLineIcon,
  SearchIcon,
  SendIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Chalkline slate blue). #345995 on #FFFFFF
// ≈ 6.7:1 (passes 4.5:1 for text); #8FB3E8 on the dark card (~#1C1C1E)
// ≈ 7.9:1.
const BRAND_ACCENT = 'light-dark(#345995, #8FB3E8)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #345995 ≈ 6.7:1. Dark:
// white on #8FB3E8 fails (~1.9:1), so the dark side flips to a near-black
// slate — #14233C on #8FB3E8 ≈ 7.4:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #14233C)';
// Brand-tinted washes (12% chip fills / flash tint base).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
const BRAND_TINT_22 = \`color-mix(in srgb, \${BRAND_ACCENT} 22%, transparent)\`;
// MINUTEMAP block fills (new material IS the brand). Contrast of the
// 13px/600 legend label (BLOCK_FILL_TEXT below) on each fill:
//   warmup   #B45309: white ≈ 5.0:1 · dark #F59E0B: #101418 ≈ 8.4:1
//   new      #345995: white ≈ 6.7:1 · dark #8FB3E8: #101418 ≈ 8.5:1
//   practice #0F766E: white ≈ 5.5:1 · dark #2DD4BF: #101418 ≈ 9.7:1
//   review   #6D28D9: white ≈ 7.2:1 · dark #A78BFA: #101418 ≈ 6.6:1
const WARMUP_FILL = 'light-dark(#B45309, #F59E0B)';
const NEW_FILL = BRAND_ACCENT;
const PRACTICE_FILL = 'light-dark(#0F766E, #2DD4BF)';
const REVIEW_FILL = 'light-dark(#6D28D9, #A78BFA)';
const BLOCK_FILL_TEXT = 'light-dark(#FFFFFF, #101418)';
// Interactive-boundary border (unselected rungs, off homework chips) —
// the batch-2 amendment: hairline/muted tokens are for passive separators
// only; interactive boundaries need ≥3:1 vs their ACTUAL surface (the
// card). #8A919E on #FFFFFF ≈ 3.2:1; #6F7B90 on ~#1C1C1E ≈ 4.0:1.
const CONTROL_BORDER = 'light-dark(#8A919E, #6F7B90)';
// Ghost-history dot fill — a meaningful rest-state fill (prior-session
// evidence), so it also clears 3:1 vs the card: #5F6E85 on #FFFFFF ≈
// 5.2:1; #9DB0CC on ~#1C1C1E ≈ 7.7:1.
const GHOST_DOT = 'light-dark(#5F6E85, #9DB0CC)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden h1,
// the 240ms composer flash (opacity-only tint, removed under
// prefers-reduced-motion — the rewritten sentence alone encodes it).
// ---------------------------------------------------------------------------

const CKL_CSS = \`
.ckl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.ckl-btn:disabled { cursor: default; }
.ckl-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.ckl-fade { transition: opacity 240ms ease; }
@keyframes ckl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.ckl-sheet-in { animation: ckl-sheet-in 240ms ease; }
@keyframes ckl-flash {
  from { background-color: \${BRAND_TINT_22}; }
  to { background-color: transparent; }
}
.ckl-flash { animation: ckl-flash 240ms ease-out; }
.ckl-vh {
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
  .ckl-fade { transition: none; }
  .ckl-sheet-in { animation: none; }
  .ckl-flash { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

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
  // NAV BAR — 52px sticky top z20, paddingInline 8, '1fr auto 1fr'.
  // Hairline + blur ALWAYS ON (scroll-under not wired; noted per contract).
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
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
    margin: 0,
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInlineEnd: 8,
    borderRadius: 12,
    color: BRAND_ACCENT,
  },
  backLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    maxWidth: 96,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 44×44 slate-square brand slot: 28px rounded-8 #345995 square with a
  // single white chalk-tick stroke — white on #345995 ≈ 6.7:1 (the stroke
  // deliberately never uses --color-text-primary).
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  // LARGE TITLE row — 52px below the 52px navBar (header total 104px);
  // scrolls away while navBar stays sticky, navBar title fades in.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
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
    fontVariantNumeric: 'tabular-nums',
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // STUDENTS — 72px media rows (40px avatar · name/meta · sparkline+chip).
  studentRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  avatar40: {
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
  avatar28: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 11,
    fontWeight: 700,
  },
  studentText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  studentPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  studentSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // Trailing sparkline stack — flex:none so long names never compress it
  // (stress fixture 2: 'Priyanka Shah-Ramanathan' ellipsizes instead).
  studentTrailing: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  avgChip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  avgChipLive: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    color: BRAND_ACCENT,
    background: BRAND_TINT_12,
  },
  // MINUTEMAP card — inner padding 12; 56px track of 12 flex:1 segments
  // with 2px gaps, 8px outer radius (overflow hidden gives first/last
  // their outer corners), 4px inner segment radius.
  minutemapCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  minuteTrack: {
    display: 'flex',
    gap: 2,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
  },
  minuteSegment: {
    flex: 1,
    minWidth: 0,
    height: 56,
    borderRadius: 4,
  },
  legendRow: {display: 'flex', flexWrap: 'wrap', gap: 8},
  legendChip: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: BLOCK_FILL_TEXT,
    whiteSpace: 'nowrap',
  },
  // 0m legend chips render at 40% opacity, not hidden (stress fixture 4).
  legendChipZero: {opacity: 0.4},
  // CONCEPT MASTERY — 96px rows (minHeight: the long-name stress wraps to
  // two lines and the row grows; ladder alignment is preserved because
  // the rung strip is its own flow row). Padding 16 inline / 12 block.
  ladderRow: {
    minHeight: 96,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 16px',
  },
  ladderTop: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  ladderName: {fontSize: 16, fontWeight: 500, flex: 1, minWidth: 160},
  groupChip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Rung strip — 4×44 + 3×8 = 200px; fits the 256px worst-case content
  // width at a 320px stage with 56px slack.
  rungStrip: {display: 'flex', gap: 8},
  rung: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    // Interactive boundary — CONTROL_BORDER ≥3:1 vs the card surface (the
    // amendment: --color-border hairlines are passive-separator-only).
    border: \`1px solid \${CONTROL_BORDER}\`,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
  },
  rungSelected: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_ACCENT,
    // Numeral over the brand fill: white on #345995 ≈ 6.7:1; #14233C on
    // #8FB3E8 ≈ 7.4:1.
    color: BRAND_FILL_TEXT,
  },
  rungDisabled: {opacity: 0.35},
  rungNumeral: {fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', lineHeight: 1},
  // Ghost-history strip — three 6px dots inside the rung's 44px hit; dot
  // n filled iff prior session n rated this rung (aria-hidden; history is
  // spoken in the radiogroup label instead).
  ghostStrip: {display: 'flex', gap: 3, height: 6},
  ghostDot: {width: 6, height: 6, borderRadius: '50%'},
  // HOMEWORK — 36px visual chips inside 44px-tall padded hits, 8px gaps.
  chipGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    paddingInline: 16,
  },
  chipHit: {
    height: 44,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 999,
  },
  chip: {
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 14,
    borderRadius: 999,
    border: \`1px solid \${CONTROL_BORDER}\`,
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  chipOn: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontWeight: 600,
  },
  // RECAP COMPOSER — live sentence card.
  composerCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  composerBody: {fontSize: 16, fontWeight: 400, lineHeight: '24px', margin: 0},
  composerSentence: {borderRadius: 4},
  composerMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: '18px',
    fontVariantNumeric: 'tabular-nums',
  },
  unratedPill: {
    alignSelf: 'flex-start',
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    border: \`1px solid \${CONTROL_BORDER}\`,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  primaryBtn: {
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
  primaryBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'inline-flex',
    alignItems: 'center',
  },
  // TIMELINE — 72px past-session rows.
  timelineRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  timelineText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  timelineDate: {fontSize: 16, fontWeight: 500},
  timelineMeta: {fontSize: 13, color: 'var(--color-text-secondary)'},
  timelineChevron: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  // Read-only banner when a past (sent) session is on the editor.
  pastBanner: {
    marginInline: 16,
    marginBottom: -12,
    padding: '10px 16px',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
  },
  // RECAPS — 60px two-line rows.
  recapRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  recapText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  recapPrimary: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  recapSecondary: {fontSize: 13, color: 'var(--color-text-secondary)'},
  draftPill: {
    minWidth: 16,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
  },
  // MORE — 44px utility rows.
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
  },
  utilityLabel: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  // EMPTY STATE (non-Maya pushed student screens).
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
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 16px', lineHeight: '18px'},
  // STICKY SEND FOOTER — rendered just before the tabBar; bottom 64 so it
  // rides directly above the 64px tabBar (both sticky, no overlap).
  sendFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 20,
    padding: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  // TAB BAR — exactly 64px, 4 tabs flex:1.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    height: 64,
    background: CHROME_SURFACE,
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
    borderRadius: 12,
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // TOAST DOCK — sticky-in-flow (height 0) so it pins above the bottom
  // chrome even mid-scroll; shell-absolute would pin to the DOCUMENT
  // bottom on tall tabs (the amendment). bottom 76 = 64 tabBar + 12; the
  // Sessions editor uses 156 = 64 + 80 send footer + 12.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
  },
  toastAnchorAboveFooter: {bottom: 156},
  toast: {
    position: 'absolute',
    bottom: 0,
    insetInline: 16,
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    minWidth: 44,
    height: 48,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41, absolute inside the locked shell.
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  recapHeading: {fontSize: 22, fontWeight: 700, margin: '8px 0 4px'},
  recapByline: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 16px'},
  donutWrap: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBlock: 8},
  donut: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: '50%',
  },
  donutHole: {
    position: 'absolute',
    // Hole diameter 88 = 2 × the spec's 44px hole radius; the 17/600
    // '60 min' label needs the full 88px to render un-clipped.
    inset: 16,
    borderRadius: '50%',
    background: 'var(--color-background-card)',
    display: 'grid',
    placeItems: 'center',
  },
  donutLabel: {fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums'},
  donutLegend: {display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8},
  recapPara: {fontSize: 16, lineHeight: '24px', margin: '0 0 12px'},
  recapSign: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '16px 0 8px'},
  // ACTION SHEET — session picker; two stacked cards 8px apart, absolute
  // insetInline 16 bottom 16, z41 over the z40 scrim.
  actionSheet: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  actionCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  actionContext: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  actionDivider: {height: 1, background: 'var(--color-border)'},
  actionRow: {
    width: '100%',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  actionRowCancel: {fontWeight: 600},
  actionCheck: {display: 'inline-flex', color: BRAND_ACCENT},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checking aggregates.
// LEDGER (verified by hand): concept histories per prior session sum
// 1+2+3+1+2 = 9 (÷5 = 1.8) · 2+2+3+1+3 = 11 (2.2) · 2+3+4+2+3 = 14 (2.8);
// today's initial ratings 2+3+4+2+3 = 14 (2.8); the signature c1 2→3 bump
// makes 15 (3.0). These four numbers ARE Maya's sparkline AND the past-
// sessions timeline chips. Minutemap 2/5/3/2 segments × 5 = 10/25/15/10 =
// 60 min; donut degrees ×6 = 60/150/90/60 = 360. Groups (rung ≤2 Focus /
// 3 Progressing / 4 Confident): initial 2/2/1, post-bump 1/3/1 — both sum
// 5. Card sums: students 6×72+5 = 437 · mastery 5×96+4 = 484 · timeline
// 3×72+2 = 218.
// ---------------------------------------------------------------------------

const TUTOR = 'Dana Reyes';
const PARENT = 'Amara Okafor';
const SESSION_LABEL = 'Jul 4';

type BlockId = 'warmup' | 'new' | 'practice' | 'review';

interface BlockDef {
  id: BlockId;
  label: string; // legend chip word
  phrase: string; // recap-sentence phrase
  fill: string;
}

// Canonical order also breaks minute ties in the opening sentence
// ('… and 10 each on warmup and review').
const BLOCKS: BlockDef[] = [
  {id: 'warmup', label: 'Warmup', phrase: 'warmup', fill: WARMUP_FILL},
  {id: 'new', label: 'New', phrase: 'new material', fill: NEW_FILL},
  {id: 'practice', label: 'Practice', phrase: 'practice', fill: PRACTICE_FILL},
  {id: 'review', label: 'Review', phrase: 'review', fill: REVIEW_FILL},
];
const BLOCK_BY_ID = Object.fromEntries(BLOCKS.map(block => [block.id, block])) as Record<BlockId, BlockDef>;
const NEXT_BLOCK: Record<BlockId, BlockId> = {
  warmup: 'new',
  new: 'practice',
  practice: 'review',
  review: 'warmup',
};

// 12 segments × 5 min = 60. Initial: 2 warmup / 5 new / 3 practice / 2
// review = 10/25/15/10 min.
const INITIAL_SEGMENTS: BlockId[] = [
  'warmup',
  'warmup',
  'new',
  'new',
  'new',
  'new',
  'new',
  'practice',
  'practice',
  'practice',
  'review',
  'review',
];

interface Concept {
  id: string;
  name: string;
  // Prior-session rungs, oldest first (Jun 13 · Jun 20 · Jun 27).
  history: [number, number, number];
}

// c5 carries the long-name stress (fixture-plan alias 'Word-problem
// setup'): the ladder row wraps to two lines and the composer sentence
// wraps without overflow at 320.
const CONCEPTS: Concept[] = [
  {id: 'c1', name: 'Quadratic factoring', history: [1, 2, 2]},
  {id: 'c2', name: 'Completing the square', history: [2, 2, 3]},
  {id: 'c3', name: 'Vertex form graphing', history: [3, 3, 4]},
  {id: 'c4', name: 'Discriminant analysis', history: [1, 1, 2]},
  {id: 'c5', name: 'Systems of equations · three-variable word problems', history: [2, 3, 3]},
];

// Today's initial rungs — sum 14 → 2.8 avg; the signature bump (c1 2→3)
// makes 15 → 3.0.
const INITIAL_RATINGS: Record<string, number> = {c1: 2, c2: 3, c3: 4, c4: 2, c5: 3};

const RATING_PHRASE: Record<number, string> = {
  1: 'needs foundational review',
  2: 'needs continued focus',
  3: 'is showing growing confidence',
  4: 'has mastered this',
};

interface HomeworkChip {
  id: string;
  label: string;
}

const HOMEWORK: HomeworkChip[] = [
  {id: 'hw1', label: 'Factoring worksheet 4B'},
  {id: 'hw2', label: 'Khan quadratics set'},
  {id: 'hw3', label: 'Review notes p.12–14'},
  {id: 'hw4', label: 'Practice test #2'},
];
const INITIAL_HOMEWORK: Record<string, boolean> = {hw1: true, hw2: true, hw3: false, hw4: false};

interface Student {
  id: string;
  name: string;
  first: string;
  initials: string;
  subject: string;
  lastLabel: string;
  // Per-session averages for the 64×24 sparkline (y-domain fixed 1–4).
  // Maya's last point derives LIVE from today's ratings; others are
  // static four-point fixtures.
  sparkAvgs: number[];
}

// stu-priya renders the long-name stress ('Priyanka Shah-Ramanathan'):
// the 72px row ellipsizes the name; sparkline + chip are flex:none.
const STUDENTS: Student[] = [
  {id: 'stu-maya', name: 'Maya Okafor', first: 'Maya', initials: 'MO', subject: 'Algebra II', lastLabel: 'Jun 27', sparkAvgs: [1.8, 2.2, 2.8]},
  {id: 'stu-leo', name: 'Leo Tran', first: 'Leo', initials: 'LT', subject: 'Geometry', lastLabel: 'Jul 1', sparkAvgs: [2.4, 2.6, 2.6, 3.2]},
  {id: 'stu-priya', name: 'Priyanka Shah-Ramanathan', first: 'Priyanka', initials: 'PS', subject: 'Precalculus', lastLabel: 'Jun 30', sparkAvgs: [3.0, 3.2, 3.0, 3.4]},
  {id: 'stu-sam', name: 'Sam Whitfield', first: 'Sam', initials: 'SW', subject: 'Algebra I', lastLabel: 'Jul 2', sparkAvgs: [1.6, 1.8, 2.2, 2.4]},
  {id: 'stu-nora', name: 'Nora Kelly', first: 'Nora', initials: 'NK', subject: 'SAT Math', lastLabel: 'Jun 28', sparkAvgs: [2.8, 2.8, 3.2, 3.2]},
  {id: 'stu-dev', name: 'Dev Patel', first: 'Dev', initials: 'DP', subject: 'Calculus AB', lastLabel: 'Jul 3', sparkAvgs: [2.0, 2.4, 2.8, 3.0]},
];
const STUDENT_BY_ID = Object.fromEntries(STUDENTS.map(student => [student.id, student])) as Record<string, Student>;

interface PastSession {
  id: string;
  label: string; // 'Jun 27'
  avgLabel: string; // '2.8' — equals the history column sum ÷ 5
  historyIndex: 0 | 1 | 2; // which column of Concept.history it shows
  segments: BlockId[]; // read-only minutemap for the sent note
  homeworkIds: string[];
}

// Timeline avgs 2.8 / 2.2 / 1.8 are IDENTICAL to the sparkline + history
// column math above — one ledger, three surfaces. Each past segments
// array sums 12 × 5 = 60 min.
const PAST_SESSIONS: PastSession[] = [
  {
    id: 'ses-0627',
    label: 'Jun 27',
    avgLabel: '2.8',
    historyIndex: 2,
    segments: ['warmup', 'warmup', 'new', 'new', 'new', 'new', 'practice', 'practice', 'practice', 'practice', 'review', 'review'],
    homeworkIds: ['hw1', 'hw3'],
  },
  {
    id: 'ses-0620',
    label: 'Jun 20',
    avgLabel: '2.2',
    historyIndex: 1,
    segments: ['warmup', 'warmup', 'warmup', 'new', 'new', 'new', 'new', 'new', 'new', 'practice', 'practice', 'review'],
    homeworkIds: ['hw1'],
  },
  {
    id: 'ses-0613',
    label: 'Jun 13',
    avgLabel: '1.8',
    historyIndex: 0,
    segments: ['warmup', 'warmup', 'warmup', 'new', 'new', 'new', 'new', 'new', 'practice', 'practice', 'review', 'review'],
    homeworkIds: ['hw2'],
  },
];
const PAST_BY_ID = Object.fromEntries(PAST_SESSIONS.map(session => [session.id, session])) as Record<string, PastSession>;

const DRAFT_SESSION_ID = 'ses-0704';

// ---------------------------------------------------------------------------
// DERIVATIONS — pure functions; every surface recomputes from the one
// draft, so the minutemap legend, composer opening line, and sheet donut
// can never disagree.
// ---------------------------------------------------------------------------

/** Tagged-segment counts → minutes per block (counts × 5; sums to 60). */
function minutesByBlock(segments: BlockId[]): Record<BlockId, number> {
  const minutes: Record<BlockId, number> = {warmup: 0, new: 0, practice: 0, review: 0};
  for (const tag of segments) {
    minutes[tag] += 5;
  }
  return minutes;
}

/**
 * Opening recap sentence from the minutemap. Fixture initial: 'We spent
 * 25 minutes on new material, 15 on practice, and 10 each on warmup and
 * review.' All-60-one-block collapses to 'We spent the full 60 minutes
 * on …' (stress fixture 4).
 */
function openingSentence(segments: BlockId[]): string {
  const minutes = minutesByBlock(segments);
  const active = BLOCKS.filter(block => minutes[block.id] > 0).sort(
    (a, b) =>
      minutes[b.id] - minutes[a.id] ||
      BLOCKS.findIndex(block => block.id === a.id) - BLOCKS.findIndex(block => block.id === b.id),
  );
  if (active.length === 1) {
    return \`We spent the full 60 minutes on \${active[0].phrase}.\`;
  }
  const parts: string[] = [];
  let index = 0;
  while (index < active.length) {
    const block = active[index];
    const m = minutes[block.id];
    const isTrailingPair =
      index === active.length - 2 && minutes[active[index + 1].id] === m && active.length >= 3;
    if (isTrailingPair) {
      parts.push(\`\${m} each on \${block.phrase} and \${active[index + 1].phrase}\`);
      index += 2;
    } else {
      parts.push(index === 0 ? \`\${m} minutes on \${block.phrase}\` : \`\${m} on \${block.phrase}\`);
      index += 1;
    }
  }
  if (parts.length === 1) return \`We spent \${parts[0]}.\`;
  return \`We spent \${parts.slice(0, -1).join(', ')}, and \${parts[parts.length - 1]}.\`;
}

/** Rating → mastery group. */
function groupFor(rating: number): 'Focus next time' | 'Progressing' | 'Confident' | 'Not rated' {
  if (rating === 0) return 'Not rated';
  if (rating <= 2) return 'Focus next time';
  if (rating === 3) return 'Progressing';
  return 'Confident';
}

/** Per-concept recap sentence ('' when unrated — composer omits it). */
function conceptSentence(name: string, rating: number, first: string): string {
  if (rating === 0) return '';
  return \`On \${name.charAt(0).toLowerCase()}\${name.slice(1)}, \${first} \${RATING_PHRASE[rating]}.\`;
}

/** Homework recap sentence from the checked chips. */
function homeworkSentence(homework: Record<string, boolean>): string {
  const names = HOMEWORK.filter(chip => homework[chip.id]).map(chip => chip.label);
  if (names.length === 0) return 'No homework assigned this week.';
  if (names.length === 1) return \`Assigned: \${names[0]}.\`;
  return \`Assigned: \${names.slice(0, -1).join(', ')} and \${names[names.length - 1]}.\`;
}

/** Average of the rated concepts, one decimal ('2.8'); '—' at zero rated. */
function averageLabel(ratings: Record<string, number>): string {
  const rated = CONCEPTS.map(concept => ratings[concept.id]).filter(rating => rating > 0);
  if (rated.length === 0) return '—';
  const avg = rated.reduce((sum, rating) => sum + rating, 0) / rated.length;
  return avg.toFixed(1);
}

/** Sparkline geometry — 64×24 viewBox, y-domain fixed 1–4, 2px pad. */
function sparkPoints(avgs: number[]): {points: string; last: {x: number; y: number}} {
  const step = avgs.length > 1 ? 60 / (avgs.length - 1) : 0;
  const coords = avgs.map((value, index) => ({
    x: 2 + index * step,
    y: 22 - ((value - 1) / 3) * 20,
  }));
  return {
    points: coords.map(point => \`\${point.x.toFixed(1)},\${point.y.toFixed(1)}\`).join(' '),
    last: coords[coords.length - 1],
  };
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useChalklineState(): {draft, ui} + one update(id,
// patch). Every surface (minutemap, ladders, chips, composer, sheet,
// students sparkline, recaps rows, toast) derives from it; no child owns
// mirrored state.
// ---------------------------------------------------------------------------

type TabId = 'students' | 'sessions' | 'recaps' | 'more';

interface DraftState {
  ratings: Record<string, number>; // 0 = unrated (tap the selected rung)
  segments: BlockId[];
  homework: Record<string, boolean>;
  sent: boolean;
  touched: boolean; // flips 'Last: Jun 27' → 'Rated just now'
}

interface UiState {
  tab: TabId;
  screenByTab: Record<TabId, string>; // 'root' | 'session:stu-…'
  viewSessionId: string; // DRAFT_SESSION_ID or a past (read-only) id
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  pickerOpen: boolean;
  toast: {seq: number; text: string; undoable: boolean} | null;
  // Composer flash target — sentence key + seq so repeat edits re-flash.
  flash: {key: string; seq: number} | null;
}

interface AppState {
  draft: DraftState;
  ui: UiState;
}

const INITIAL_APP: AppState = {
  draft: {
    ratings: INITIAL_RATINGS,
    segments: INITIAL_SEGMENTS,
    homework: INITIAL_HOMEWORK,
    sent: false,
    touched: false,
  },
  ui: {
    tab: 'sessions',
    screenByTab: {students: 'root', sessions: 'root', recaps: 'root', more: 'root'},
    viewSessionId: DRAFT_SESSION_ID,
    sheetOpen: false,
    sheetDetent: 'medium',
    pickerOpen: false,
    toast: null,
    flash: null,
  },
};

function useChalklineState() {
  const [app, setApp] = useState<AppState>(INITIAL_APP);
  const update = useCallback(
    <K extends keyof AppState>(id: K, patch: Partial<AppState[K]>) => {
      setApp(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );
  return {app, update, setApp};
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

/**
 * Large-title collapse — IntersectionObserver on the in-flow largeTitle
 * row; when it has scrolled under the sticky navBar the compact center
 * title fades in (user-scroll-driven, so it stays deterministic).
 */
function useTitleCollapsed(ref: RefObject<HTMLHeadingElement | null>, screenKey: string): boolean {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    // Re-arm per screen — the largeTitle row only exists on list roots,
    // so the observer must re-attach after every tab/push swap.
    setCollapsed(false);
    const element = ref.current;
    if (element == null) return undefined;
    const observer = new IntersectionObserver(
      entries => setCollapsed(!(entries[0]?.isIntersecting ?? true)),
      {rootMargin: '-52px 0px 0px 0px'},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, screenKey]);
  return collapsed;
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

/** Demo scroller — the page scrolls, not the shell; walk up to it. */
function findScroller(from: HTMLElement | null): HTMLElement | null {
  let el: HTMLElement | null = from?.parentElement ?? null;
  while (el != null) {
    const css = window.getComputedStyle(el);
    if ((css.overflowY === 'auto' || css.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 28px rounded-8 slate square, single white chalk-tick
// stroke (white on #345995 ≈ 6.7:1; the stroke never uses a text token).
// ---------------------------------------------------------------------------

function ChalklineMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandMark}>
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M2.5 8.5 L6 12 L13.5 3.5"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// TREND SPARKLINE — 64×24 polyline, y-domain fixed 1–4, BRAND stroke,
// 4px brand dot on the last point. aria-hidden; the average is duplicated
// as the row's avg chip text.
// ---------------------------------------------------------------------------

function TrendSparkline({avgs}: {avgs: number[]}) {
  const {points, last} = sparkPoints(avgs);
  return (
    <svg width={64} height={24} viewBox="0 0 64 24" fill="none" aria-hidden>
      <polyline
        points={points}
        stroke={BRAND_ACCENT}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={2} fill={BRAND_ACCENT} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CONCEPT MASTERY LADDER — 96px row: name + group chip over a horizontal
// radiogroup of four 44×44 rung buttons. Ghost strip: dot n filled iff
// prior session n rated that rung (c1 history [1,2,2] → one dot over rung
// 1, two over rung 2). ArrowLeft/Right move the rating; tapping the
// selected rung clears it to unrated (the demonstrable path to stress
// fixture 3's '1 concept unrated' composer pill).
// ---------------------------------------------------------------------------

interface LadderRowProps {
  concept: Concept;
  rating: number;
  disabled: boolean;
  onRate: (conceptId: string, rung: number) => void;
}

function ConceptMasteryLadder({concept, rating, disabled, onRate}: LadderRowProps) {
  const group = groupFor(rating);
  const historySpoken = concept.history.join(', ');
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next =
      event.key === 'ArrowRight' ? Math.min(4, Math.max(1, rating + 1)) : Math.max(1, rating - 1);
    if (next !== rating) onRate(concept.id, next);
  };
  return (
    <div style={styles.ladderRow}>
      <div style={styles.ladderTop}>
        <span style={styles.ladderName}>{concept.name}</span>
        <span style={styles.groupChip}>{group}</span>
      </div>
      <div
        role="radiogroup"
        aria-label={\`\${concept.name} mastery, prior sessions \${historySpoken}\`}
        style={styles.rungStrip}
        onKeyDown={onKeyDown}>
        {[1, 2, 3, 4].map(rung => {
          const selected = rating === rung;
          return (
            <button
              key={rung}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={\`Rung \${rung} of 4\${selected ? ', selected — press to clear' : ''}\`}
              className="ckl-btn ckl-focusable"
              disabled={disabled}
              tabIndex={disabled ? -1 : selected || (rating === 0 && rung === 1) ? 0 : -1}
              style={{
                ...styles.rung,
                ...(selected ? styles.rungSelected : null),
                ...(disabled ? styles.rungDisabled : null),
              }}
              onClick={() => onRate(concept.id, selected ? 0 : rung)}>
              <span style={styles.ghostStrip} aria-hidden>
                {concept.history.map((prior, sessionIndex) => (
                  <span
                    key={sessionIndex}
                    style={{
                      ...styles.ghostDot,
                      background: prior === rung ? (selected ? BRAND_FILL_TEXT : GHOST_DOT) : 'transparent',
                    }}
                  />
                ))}
              </span>
              <span style={styles.rungNumeral}>{rung}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MINUTEMAP — 56px tagging track of 12 tap-cycle segment buttons (5 min
// each; the whole 56px-tall track is the merged ≥44px hit surface — each
// segment button spans full track height). Legend chips derive counts ×
// 5 live; 0m chips dim to 40%, never hide.
// ---------------------------------------------------------------------------

interface MinutemapProps {
  segments: BlockId[];
  disabled: boolean;
  onCycle: (index: number) => void;
}

function Minutemap({segments, disabled, onCycle}: MinutemapProps) {
  const minutes = minutesByBlock(segments);
  return (
    <div style={styles.minutemapCard}>
      <div style={styles.minuteTrack}>
        {segments.map((tag, index) => (
          <button
            key={index}
            type="button"
            className="ckl-btn ckl-focusable"
            disabled={disabled}
            style={{
              ...styles.minuteSegment,
              background: BLOCK_BY_ID[tag].fill,
              ...(disabled ? {opacity: 0.6, cursor: 'default'} : null),
            }}
            aria-label={\`Minutes \${index * 5}–\${index * 5 + 5}, tagged \${BLOCK_BY_ID[tag].phrase}\${disabled ? '' : '; press to change'}\`}
            onClick={() => onCycle(index)}
          />
        ))}
      </div>
      <div style={styles.legendRow}>
        {BLOCKS.map(block => (
          <span
            key={block.id}
            style={{
              ...styles.legendChip,
              background: block.fill,
              ...(minutes[block.id] === 0 ? styles.legendChipZero : null),
            }}>
            {block.label} {minutes[block.id]}m
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RECAP COMPOSER — live sentences keyed by source; the changed sentence
// flashes a 240ms tint (opacity-only keyframe, removed under reduced
// motion — the rewritten text alone encodes the change).
// ---------------------------------------------------------------------------

interface ComposerProps {
  ratings: Record<string, number>;
  segments: BlockId[];
  homework: Record<string, boolean>;
  flash: {key: string; seq: number} | null;
  studentFirst: string;
  onPreview: (opener: HTMLElement) => void;
  readOnly: boolean;
}

function RecapComposer({ratings, segments, homework, flash, studentFirst, onPreview, readOnly}: ComposerProps) {
  const unrated = CONCEPTS.filter(concept => ratings[concept.id] === 0).length;
  const groups: Array<{label: string; names: string[]}> = [
    {label: 'Focus next time', names: []},
    {label: 'Progressing', names: []},
    {label: 'Confident', names: []},
  ];
  for (const concept of CONCEPTS) {
    const group = groupFor(ratings[concept.id]);
    const bucket = groups.find(entry => entry.label === group);
    bucket?.names.push(concept.name);
  }
  const sentenceSpan = (key: string, text: string) => (
    <span
      key={flash != null && flash.key === key ? \`\${key}-\${flash.seq}\` : key}
      className={flash != null && flash.key === key ? 'ckl-flash' : undefined}
      style={styles.composerSentence}>
      {text}{' '}
    </span>
  );
  return (
    <div style={styles.composerCard}>
      <p style={styles.composerBody}>
        {sentenceSpan('opening', openingSentence(segments))}
        {CONCEPTS.map(concept =>
          ratings[concept.id] === 0
            ? null
            : sentenceSpan(concept.id, conceptSentence(concept.name, ratings[concept.id], studentFirst)),
        )}
        {sentenceSpan('homework', homeworkSentence(homework))}
      </p>
      <div style={styles.composerMeta}>
        {groups
          .filter(group => group.names.length > 0)
          .map(group => \`\${group.label} (\${group.names.length}): \${group.names.join(', ')}\`)
          .join(' · ')}
      </div>
      {unrated > 0 ? (
        <span style={styles.unratedPill}>
          {unrated} concept{unrated === 1 ? '' : 's'} unrated
        </span>
      ) : null}
      {readOnly ? null : (
        <button
          type="button"
          className="ckl-btn ckl-focusable"
          style={styles.primaryBtn}
          onClick={event => onPreview(event.currentTarget)}>
          Preview parent recap
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TIME SPLIT DONUT — 120px conic-gradient; degrees = minutes × 6
// (fixture: warmup 0–60°, new 60–210°, practice 210–300°, review
// 300–360°; 60+150+90+60 = 360). Legend reuses the Minutemap chip strings
// VERBATIM so the two surfaces can never disagree.
// ---------------------------------------------------------------------------

function TimeSplitDonut({segments}: {segments: BlockId[]}) {
  const minutes = minutesByBlock(segments);
  let cursor = 0;
  const stops: string[] = [];
  for (const block of BLOCKS) {
    const deg = minutes[block.id] * 6;
    if (deg === 0) continue;
    stops.push(\`\${block.fill} \${cursor}deg \${cursor + deg}deg\`);
    cursor += deg;
  }
  const label = BLOCKS.filter(block => minutes[block.id] > 0)
    .map(block => \`\${block.phrase} \${minutes[block.id]} minutes\`)
    .join(', ');
  return (
    <div style={styles.donutWrap}>
      <div
        role="img"
        aria-label={\`Time split: \${label}\`}
        style={{...styles.donut, background: \`conic-gradient(\${stops.join(', ')})\`}}>
        <div style={styles.donutHole}>
          <span style={styles.donutLabel}>60 min</span>
        </div>
      </div>
      <div style={styles.donutLegend} aria-hidden>
        {BLOCKS.map(block => (
          <span
            key={block.id}
            style={{
              ...styles.legendChip,
              background: block.fill,
              ...(minutes[block.id] === 0 ? styles.legendChipZero : null),
            }}>
            {block.label} {minutes[block.id]}m
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET — recap preview; grabber is a real 'Resize sheet' button toggling
// MEDIUM 55% / LARGE calc(100% − 56px); 52px header with 44×44 X. Focus
// trapped; the page moves focus in with {preventScroll: true} (plain
// .focus() would scroll-reveal the animating sheet inside the locked
// overflow-hidden column and beach it mid-screen — the amendment).
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

function RecapSheet({titleId, title, detent, onDetentChange, onClose, sheetRef, children}: SheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="ckl-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
      }}>
      <button
        type="button"
        className="ckl-btn ckl-focusable"
        style={styles.grabberZone}
        aria-label={detent === 'medium' ? 'Resize sheet — expand' : 'Resize sheet — collapse'}
        onClick={() => onDetentChange(detent === 'medium' ? 'large' : 'medium')}>
        <span style={styles.grabberPill} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button
          type="button"
          className="ckl-btn ckl-focusable"
          style={styles.iconBtn}
          aria-label="Close recap preview"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SESSION PICKER — actionSheet per the primitive contract: context
// header, four 56px centered rows, separate Cancel card 8px below; first
// focus lands on Cancel (the safe default), Tab trapped, Escape/scrim/
// Cancel all close with focus restored by the caller.
// ---------------------------------------------------------------------------

interface PickerProps {
  viewSessionId: string;
  pickerRef: RefObject<HTMLDivElement | null>;
  onChoose: (sessionId: string) => void;
  onCancel: () => void;
}

function SessionPicker({viewSessionId, pickerRef, onChoose, onCancel}: PickerProps) {
  const options = [
    {id: DRAFT_SESSION_ID, label: \`\${SESSION_LABEL} · Today (draft)\`},
    ...PAST_SESSIONS.map(session => ({id: session.id, label: session.label})),
  ];
  return (
    <div
      ref={pickerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Sessions with Maya Okafor"
      tabIndex={-1}
      className="ckl-sheet-in"
      style={styles.actionSheet}
      onKeyDown={event => trapTabKey(event, pickerRef.current)}>
      <div style={styles.actionCard}>
        <div style={styles.actionContext}>Sessions with Maya Okafor</div>
        {options.map(option => (
          <div key={option.id}>
            <div style={styles.actionDivider} />
            <button
              type="button"
              className="ckl-btn ckl-focusable"
              style={styles.actionRow}
              onClick={() => onChoose(option.id)}>
              {option.label}
              {option.id === viewSessionId ? (
                <span style={styles.actionCheck} aria-label="(currently open)">
                  <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                </span>
              ) : null}
            </button>
          </div>
        ))}
      </div>
      <div style={styles.actionCard}>
        <button
          type="button"
          data-ckl-cancel
          className="ckl-btn ckl-focusable"
          style={{...styles.actionRow, ...styles.actionRowCancel}}
          onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: typeof UsersIcon}> = [
  {id: 'students', label: 'Students', icon: UsersIcon},
  {id: 'sessions', label: 'Sessions', icon: PenLineIcon},
  {id: 'recaps', label: 'Recaps', icon: SendIcon},
  {id: 'more', label: 'More', icon: MoreHorizontalIcon},
];

export default function MobileTutorSessionNotesTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;

  const {app, update, setApp} = useChalklineState();
  const {draft, ui} = app;

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const pickerOpenerRef = useRef<HTMLElement | null>(null);
  const largeTitleRef = useRef<HTMLHeadingElement | null>(null);
  const toastSeqRef = useRef(0);
  const flashSeqRef = useRef(0);
  const scrollByTabRef = useRef<Partial<Record<TabId, number>>>({});

  const titleCollapsed = useTitleCollapsed(largeTitleRef, \`\${app.ui.tab}:\${app.ui.screenByTab.students}\`);

  // DERIVED — every aggregate recomputes from the one draft.
  const todayAvg = averageLabel(draft.ratings);
  const mayaSparkAvgs = [...STUDENT_BY_ID['stu-maya'].sparkAvgs, todayAvg === '—' ? 2.8 : Number(todayAvg)];
  const viewingPast = ui.viewSessionId !== DRAFT_SESSION_ID;
  const pastSession = viewingPast ? PAST_BY_ID[ui.viewSessionId] : null;
  const editorRatings = pastSession != null
    ? Object.fromEntries(CONCEPTS.map(concept => [concept.id, concept.history[pastSession.historyIndex]]))
    : draft.ratings;
  const editorSegments = pastSession != null ? pastSession.segments : draft.segments;
  const editorHomework = pastSession != null
    ? Object.fromEntries(HOMEWORK.map(chip => [chip.id, pastSession.homeworkIds.includes(chip.id)]))
    : draft.homework;
  const anyOverlayOpen = ui.sheetOpen || ui.pickerOpen;

  const toastPatch = (text: string, undoable = false) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undoable}};
  };
  const flashPatch = (key: string) => {
    flashSeqRef.current += 1;
    return {flash: {key, seq: flashSeqRef.current}};
  };

  // Focus into overlays — preventScroll per the amendment; the picker's
  // safe first focus is its Cancel row.
  useEffect(() => {
    if (ui.sheetOpen) sheetRef.current?.focus({preventScroll: true});
  }, [ui.sheetOpen]);
  useEffect(() => {
    if (ui.pickerOpen) {
      pickerRef.current
        ?.querySelector<HTMLElement>('[data-ckl-cancel]')
        ?.focus({preventScroll: true});
    }
  }, [ui.pickerOpen]);

  // Escape closes the TOPMOST overlay only (picker and sheet are never
  // simultaneously open — the picker closes before the sheet opens).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.pickerOpen) {
        update('ui', {pickerOpen: false});
        pickerOpenerRef.current?.focus();
      } else if (ui.sheetOpen) {
        update('ui', {sheetOpen: false});
        sheetOpenerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ui.pickerOpen, ui.sheetOpen, update]);

  // PER-TAB SCROLL RESTORE — persistence law: tabs never reset.
  useEffect(() => {
    const scroller = findScroller(shellRef.current);
    if (scroller != null) {
      scroller.scrollTop = scrollByTabRef.current[ui.tab] ?? 0;
    }
  }, [ui.tab]);

  // MUTATIONS ---------------------------------------------------------------

  const switchTab = (next: TabId) => {
    const scroller = findScroller(shellRef.current);
    if (next === ui.tab) {
      // The one legal reset: re-tap pops the tab's stack to root + top.
      update('ui', {screenByTab: {...ui.screenByTab, [next]: 'root'}});
      scroller?.scrollTo({top: 0});
      return;
    }
    if (scroller != null) scrollByTabRef.current[ui.tab] = scroller.scrollTop;
    // Overlays close on tab switch; drafts and screens persist.
    update('ui', {tab: next, sheetOpen: false, pickerOpen: false});
  };

  const onTabBarKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = TABS.findIndex(tab => tab.id === ui.tab);
    const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
    switchTab(next.id);
  };

  // SIGNATURE PATH — one update into the draft; composer sentence, group
  // chip, grouped listing, sparkline, and 'Rated just now' all re-derive.
  const rateConcept = (conceptId: string, rung: number) => {
    setApp(prev => ({
      draft: {
        ...prev.draft,
        ratings: {...prev.draft.ratings, [conceptId]: rung},
        touched: true,
      },
      ui: {...prev.ui, ...flashPatch(conceptId)},
    }));
  };

  const cycleSegment = (index: number) => {
    setApp(prev => {
      const segments = prev.draft.segments.slice();
      segments[index] = NEXT_BLOCK[segments[index]];
      return {
        draft: {...prev.draft, segments},
        ui: {...prev.ui, ...flashPatch('opening')},
      };
    });
  };

  const toggleHomework = (chipId: string) => {
    setApp(prev => ({
      draft: {
        ...prev.draft,
        homework: {...prev.draft.homework, [chipId]: !prev.draft.homework[chipId]},
      },
      ui: {...prev.ui, ...flashPatch('homework')},
    }));
  };

  const openSheet = (opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    update('ui', {sheetOpen: true, sheetDetent: 'medium', pickerOpen: false});
  };
  const closeSheet = () => {
    update('ui', {sheetOpen: false});
    sheetOpenerRef.current?.focus();
  };

  const openPicker = (opener: HTMLElement) => {
    pickerOpenerRef.current = opener;
    update('ui', {pickerOpen: true, sheetOpen: false});
  };
  const closePicker = () => {
    update('ui', {pickerOpen: false});
    pickerOpenerRef.current?.focus();
  };
  const chooseSession = (sessionId: string) => {
    update('ui', {
      pickerOpen: false,
      viewSessionId: sessionId,
      ...(sessionId === DRAFT_SESSION_ID
        ? null
        : toastPatch(\`Viewing sent session \${PAST_BY_ID[sessionId].label} — \${SESSION_LABEL} draft unchanged\`)),
    });
    pickerOpenerRef.current?.focus();
  };

  // SEND — reversible, so it executes immediately with Undo (no confirm).
  const sendRecap = () => {
    const wasSheetOpen = ui.sheetOpen;
    setApp(prev => ({
      draft: {...prev.draft, sent: true},
      ui: {
        ...prev.ui,
        sheetOpen: false,
        ...toastPatch(\`Recap sent to \${PARENT}\`, true),
      },
    }));
    // Restore focus to the opener only when the sheet just closed; the
    // footer path keeps focus in place (the button disables in situ).
    if (wasSheetOpen) sheetOpenerRef.current?.focus();
  };
  const undoSend = () => {
    setApp(prev => ({
      draft: {...prev.draft, sent: false},
      ui: {...prev.ui, ...toastPatch('Recap restored to draft')},
    }));
  };

  const showToast = (text: string) => update('ui', toastPatch(text));

  // Students-tab row push (screenByTab law: the pushed screen survives
  // tab switches).
  const pushStudent = (studentId: string) => {
    update('ui', {screenByTab: {...ui.screenByTab, students: \`session:\${studentId}\`}});
  };
  const popStudents = () => {
    update('ui', {screenByTab: {...ui.screenByTab, students: 'root'}});
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(anyOverlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // -------------------------------------------------------------------------
  // SUBTREES
  // -------------------------------------------------------------------------

  const renderStudentRow = (student: Student, index: number) => {
    const isMaya = student.id === 'stu-maya';
    const avgs = isMaya ? mayaSparkAvgs : student.sparkAvgs;
    const avg = avgs[avgs.length - 1].toFixed(1);
    const lastLabel = isMaya && draft.touched ? 'Rated just now' : \`Last: \${student.lastLabel}\`;
    return (
      <div key={student.id}>
        {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
        <button
          type="button"
          className="ckl-btn ckl-focusable"
          style={styles.studentRow}
          aria-label={\`\${student.name}, \${student.subject}, average \${avg}, \${lastLabel.toLowerCase()}\`}
          onClick={() => pushStudent(student.id)}>
          <span style={styles.avatar40} aria-hidden>
            {student.initials}
          </span>
          <span style={styles.studentText}>
            <span style={styles.studentPrimary}>{student.name}</span>
            <span style={styles.studentSecondary}>
              {student.subject} · {lastLabel}
            </span>
          </span>
          <span style={styles.studentTrailing}>
            <TrendSparkline avgs={avgs} />
            <span style={{...styles.avgChip, ...(isMaya && draft.touched ? styles.avgChipLive : null)}}>
              {avg} avg
            </span>
          </span>
        </button>
      </div>
    );
  };

  const sessionEditor = (
    <>
      {pastSession != null ? (
        <>
          <div style={{height: 16}} />
          <div style={styles.pastBanner} role="note">
            Viewing sent session — {SESSION_LABEL} draft unchanged
          </div>
        </>
      ) : null}

      <h2 style={styles.sectionHeader}>Session Minutemap · 60 min</h2>
      <Minutemap segments={editorSegments} disabled={viewingPast} onCycle={cycleSegment} />

      <h2 style={styles.sectionHeader}>Concept mastery · 5 concepts</h2>
      <div style={styles.listCard}>
        {CONCEPTS.map((concept, index) => (
          <div key={concept.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <ConceptMasteryLadder
              concept={concept}
              rating={editorRatings[concept.id]}
              disabled={viewingPast}
              onRate={rateConcept}
            />
          </div>
        ))}
      </div>

      <h2 style={styles.sectionHeader}>Homework assigned</h2>
      <div style={styles.chipGrid} role="group" aria-label="Homework assigned">
        {HOMEWORK.map(chip => {
          const on = editorHomework[chip.id];
          return (
            <button
              key={chip.id}
              type="button"
              className="ckl-btn ckl-focusable"
              style={styles.chipHit}
              aria-pressed={on}
              disabled={viewingPast}
              onClick={() => toggleHomework(chip.id)}>
              <span
                style={{
                  ...styles.chip,
                  ...(on ? styles.chipOn : null),
                  ...(viewingPast ? {opacity: 0.6} : null),
                }}>
                {chip.label}
              </span>
            </button>
          );
        })}
      </div>

      <h2 style={styles.sectionHeader}>Parent recap — live</h2>
      <RecapComposer
        ratings={editorRatings}
        segments={editorSegments}
        homework={editorHomework}
        flash={viewingPast ? null : ui.flash}
        studentFirst="Maya"
        onPreview={openSheet}
        readOnly={viewingPast}
      />

      {viewingPast ? null : (
        <>
          <h2 style={styles.sectionHeader}>Next session · Jul 11</h2>
          <div style={styles.listCard}>
            {HOMEWORK.filter(chip => draft.homework[chip.id]).map((chip, index) => (
              <div key={chip.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>Check {chip.label}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={styles.sectionHeader}>Past sessions</h2>
      <div style={styles.listCard}>
        {PAST_SESSIONS.map((session, index) => (
          <div key={session.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <button
              type="button"
              className="ckl-btn ckl-focusable"
              style={styles.timelineRow}
              aria-label={\`Session \${session.label}, average \${session.avgLabel} — view sent note\`}
              onClick={() => chooseSession(session.id)}>
              <span style={styles.timelineText}>
                <span style={styles.timelineDate}>{session.label}</span>
                <span style={styles.timelineMeta}>Sent · opened</span>
              </span>
              <span style={styles.avgChip}>{session.avgLabel} avg</span>
              <span style={styles.timelineChevron} aria-hidden>
                <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
              </span>
            </button>
          </div>
        ))}
      </div>
    </>
  );

  const studentsScreen = ui.screenByTab.students;
  const pushedStudent = studentsScreen.startsWith('session:')
    ? STUDENT_BY_ID[studentsScreen.slice('session:'.length)]
    : null;

  const renderTabContent = () => {
    if (ui.tab === 'students') {
      if (pushedStudent != null && pushedStudent.id !== 'stu-maya') {
        return (
          <div style={styles.emptyState}>
            <span style={styles.emptyCircle}>
              <Icon icon={PenLineIcon} size="lg" color="inherit" />
            </span>
            <h2 style={styles.emptyTitle}>No session today</h2>
            <p style={styles.emptyBody}>
              Notes for {pushedStudent.first} start when the next {pushedStudent.subject} session begins.
            </p>
            <button
              type="button"
              className="ckl-btn ckl-focusable"
              style={styles.secondaryBtn}
              onClick={() => showToast(\`Session notes for \${pushedStudent.first} start at the next lesson\`)}>
              Start session notes
            </button>
          </div>
        );
      }
      if (pushedStudent != null) {
        return sessionEditor;
      }
      return (
        <>
          <h1 ref={largeTitleRef} style={styles.largeTitle}>
            Students
          </h1>
          <div style={{height: 4}} />
          <div style={styles.listCard}>{STUDENTS.map(renderStudentRow)}</div>
        </>
      );
    }
    if (ui.tab === 'sessions') {
      return (
        <>
          <h1 className="ckl-vh">Session notes — Maya Okafor · {SESSION_LABEL}</h1>
          {sessionEditor}
        </>
      );
    }
    if (ui.tab === 'recaps') {
      return (
        <>
          <h1 ref={largeTitleRef} style={styles.largeTitle}>
            Recaps
          </h1>
          <div style={{height: 4}} />
          <div style={styles.listCard}>
            {[
              {id: DRAFT_SESSION_ID, label: \`Maya Okafor · \${SESSION_LABEL}\`, isDraft: true},
              ...PAST_SESSIONS.map(session => ({
                id: session.id,
                label: \`Maya Okafor · \${session.label}\`,
                isDraft: false,
              })),
            ].map((row, index) => (
              <div key={row.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <button
                  type="button"
                  className="ckl-btn ckl-focusable"
                  style={styles.recapRow}
                  aria-label={\`\${row.label}, \${row.isDraft ? (draft.sent ? 'sent just now' : 'draft') : 'sent and opened'}\`}
                  onClick={() => {
                    update('ui', {
                      tab: 'sessions',
                      viewSessionId: row.id,
                      sheetOpen: false,
                      pickerOpen: false,
                    });
                  }}>
                  <span style={styles.recapText}>
                    <span style={styles.recapPrimary}>{row.label}</span>
                    <span style={styles.recapSecondary}>
                      {row.isDraft ? (draft.sent ? 'Sent · just now' : 'Not yet sent') : 'Sent · opened'}
                    </span>
                  </span>
                  {row.isDraft && !draft.sent ? <span style={styles.draftPill}>Draft</span> : null}
                </button>
              </div>
            ))}
          </div>
        </>
      );
    }
    return (
      <>
        <h1 className="ckl-vh">More — Chalkline settings</h1>
        <h2 style={styles.sectionHeader}>Chalkline</h2>
        <div style={styles.listCard}>
          {['Notification defaults', 'Recap templates', 'About'].map((label, index) => (
            <div key={label}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <button
                type="button"
                className="ckl-btn ckl-focusable"
                style={styles.utilityRow}
                onClick={() => showToast(label === 'About' ? \`Chalkline · tutor \${TUTOR}\` : \`\${label} — unchanged\`)}>
                <span style={styles.utilityLabel}>{label}</span>
                <span style={styles.timelineChevron} aria-hidden>
                  <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                </span>
              </button>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderNavBar = () => {
    if (ui.tab === 'sessions' || (ui.tab === 'students' && pushedStudent?.id === 'stu-maya')) {
      const centerLabel = viewingPast
        ? \`Maya · \${pastSession?.label ?? ''}\`
        : \`Maya · \${SESSION_LABEL}\`;
      return (
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {ui.tab === 'students' ? (
              <button
                type="button"
                className="ckl-btn ckl-focusable"
                style={styles.backBtn}
                onClick={popStudents}>
                <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                <span style={styles.backLabel}>Students</span>
              </button>
            ) : (
              <button
                type="button"
                className="ckl-btn ckl-focusable"
                style={styles.iconBtn}
                aria-label="Open Students"
                onClick={() => switchTab('students')}>
                <span style={styles.avatar28} aria-hidden>
                  MO
                </span>
              </button>
            )}
          </div>
          <span style={styles.navTitle}>{centerLabel}</span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="ckl-btn ckl-focusable"
              style={styles.iconBtn}
              aria-label="Switch session"
              aria-expanded={ui.pickerOpen}
              onClick={event => openPicker(event.currentTarget)}>
              <Icon icon={ChevronsUpDownIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>
      );
    }
    if (ui.tab === 'students' && pushedStudent != null) {
      return (
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button type="button" className="ckl-btn ckl-focusable" style={styles.backBtn} onClick={popStudents}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
              <span style={styles.backLabel}>Students</span>
            </button>
          </div>
          <span style={styles.navTitle}>{pushedStudent.first}</span>
          <div style={styles.navTrailing} />
        </header>
      );
    }
    const title = ui.tab === 'students' ? 'Students' : ui.tab === 'recaps' ? 'Recaps' : 'More';
    const hasLargeTitle = ui.tab !== 'more';
    return (
      <header style={styles.navBar}>
        <div style={styles.navLeading}>
          <ChalklineMark />
        </div>
        <span
          style={{
            ...styles.navTitle,
            opacity: hasLargeTitle && !titleCollapsed ? 0 : 1,
            transition: 'opacity 160ms ease',
          }}
          aria-hidden={hasLargeTitle && !titleCollapsed}>
          {title}
        </span>
        <div style={styles.navTrailing}>
          {ui.tab === 'students' ? (
            <button
              type="button"
              className="ckl-btn ckl-focusable"
              style={styles.iconBtn}
              aria-label="Search students"
              onClick={() => showToast('Search — all 6 students shown')}>
              <Icon icon={SearchIcon} size="md" color="inherit" />
            </button>
          ) : null}
        </div>
      </header>
    );
  };

  const showSendFooter =
    (ui.tab === 'sessions' || (ui.tab === 'students' && pushedStudent?.id === 'stu-maya')) && !viewingPast;
  const showBackToDraftFooter =
    (ui.tab === 'sessions' || (ui.tab === 'students' && pushedStudent?.id === 'stu-maya')) && viewingPast;

  const sheetSendLabel = \`Send recap to \${PARENT}\`;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{CKL_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {renderNavBar()}

        <main style={styles.main}>{renderTabContent()}</main>

        {/* TOAST DOCK — the single polite live region; sticky-in-flow so
            it pins above the bottom chrome on tall scrolling tabs (the
            amendment: shell-absolute pins to the DOCUMENT bottom). No
            auto-dismiss timers — Undo persists until replaced. */}
        <div
          style={{
            ...styles.toastAnchor,
            ...(showSendFooter || showBackToDraftFooter ? styles.toastAnchorAboveFooter : null),
          }}
          aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="ckl-fade">
              <span style={styles.toastText}>{ui.toast.text}</span>
              {ui.toast.undoable ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="ckl-btn ckl-focusable" style={styles.toastUndo} onClick={undoSend}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* STICKY SEND FOOTER — bottom 64 rides above the 64px tabBar. */}
        {showSendFooter ? (
          <div style={styles.sendFooter}>
            <button
              type="button"
              className="ckl-btn ckl-focusable"
              style={{...styles.primaryBtn, ...(draft.sent ? styles.primaryBtnDisabled : null)}}
              disabled={draft.sent}
              aria-disabled={draft.sent}
              onClick={event => {
                sheetOpenerRef.current = event.currentTarget;
                sendRecap();
              }}>
              {draft.sent ? 'Recap sent · undo in the toast below' : 'Send recap'}
            </button>
          </div>
        ) : null}
        {showBackToDraftFooter ? (
          <div style={styles.sendFooter}>
            <button
              type="button"
              className="ckl-btn ckl-focusable"
              style={{...styles.primaryBtn, background: 'var(--color-background-muted)', color: BRAND_ACCENT}}
              onClick={() => chooseSession(DRAFT_SESSION_ID)}>
              Back to {SESSION_LABEL} draft
            </button>
          </div>
        ) : null}

        {/* TAB BAR — 64px, 4 tabs, tablist with arrow keys. */}
        <div style={styles.tabBar} role="tablist" aria-label="Chalkline tabs" onKeyDown={onTabBarKeyDown}>
          {TABS.map(tab => {
            const active = ui.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                className="ckl-btn ckl-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => switchTab(tab.id)}>
                <Icon icon={tab.icon} size="md" color="inherit" />
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* OVERLAYS — scrim z40; sheet/actionSheet z41; shell locked. */}
        {anyOverlayOpen ? (
          <div
            style={styles.sheetScrim}
            onClick={ui.pickerOpen ? closePicker : closeSheet}
            aria-hidden
          />
        ) : null}
        {ui.pickerOpen ? (
          <SessionPicker
            viewSessionId={ui.viewSessionId}
            pickerRef={pickerRef}
            onChoose={chooseSession}
            onCancel={closePicker}
          />
        ) : null}
        {ui.sheetOpen ? (
          <RecapSheet
            titleId="ckl-recap-title"
            title="Recap preview"
            detent={ui.sheetDetent}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}>
            <h3 style={styles.recapHeading}>Session recap — {SESSION_LABEL}</h3>
            <p style={styles.recapByline}>
              Maya Okafor · Algebra II · 60 minutes · from {TUTOR}
            </p>
            <TimeSplitDonut segments={draft.segments} />
            <p style={styles.recapPara}>Hi {PARENT.split(' ')[0]},</p>
            <p style={styles.recapPara}>{openingSentence(draft.segments)}</p>
            <p style={styles.recapPara}>
              {CONCEPTS.filter(concept => draft.ratings[concept.id] > 0)
                .map(concept => conceptSentence(concept.name, draft.ratings[concept.id], 'Maya'))
                .join(' ')}
            </p>
            <p style={styles.recapPara}>{homeworkSentence(draft.homework)}</p>
            <p style={styles.recapSign}>— {TUTOR} · Chalkline</p>
            {ui.sheetDetent === 'large' ? (
              <button
                type="button"
                className="ckl-btn ckl-focusable"
                style={{...styles.primaryBtn, ...(draft.sent ? styles.primaryBtnDisabled : null)}}
                disabled={draft.sent}
                aria-disabled={draft.sent}
                onClick={sendRecap}>
                {draft.sent ? 'Recap sent' : sheetSendLabel}
              </button>
            ) : null}
          </RecapSheet>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};