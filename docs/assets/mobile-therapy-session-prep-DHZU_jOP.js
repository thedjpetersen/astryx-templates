var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Tether session prep for Maya Chen
 *   with Dr. Elena Ruiz, frozen at TODAY 'Tue Jul 7' (next session
 *   'Thu Jul 9 · 4:30 PM' → the fixed 'In 2 days' countdown; last session
 *   'Fri Jun 27'). Exactly 17 logged moments across Mon Jun 30 – Sun Jul 6
 *   (per-day 3+2+4+1+3+2+2 = 17; tags anxious 5 + calm 5 + drained 3 +
 *   frustrated 2 + proud 2 = 17; valence ≥ 0 on 8 of 17; valence sum −4 →
 *   week trend −4/17 ≈ −0.2). Three talking points at rest (two
 *   moment-sourced with timeline halos + one Jun 27 carry-over), two Jun 27
 *   carry-overs (one in list, one pending), and a 6-topic Jun 27 history
 *   (4 discussed + 2 carried over). No Date.now(), no Math.random(), no
 *   network media.
 * @output Tether — Session Prep: a 390px MOBILE therapy prep assembler.
 *   NavBar (KnotMark · 'In 2 days · 3 ready' CountdownPill · History) over
 *   the 'Session prep' large title, a 220px MoodWeekTimeline (7 fixed 46px
 *   day columns over a 160px 5-band valence plot, 14px feeling-tag dots in
 *   46×44 buttons, brand halos on active talking points), a 3×76px
 *   TalkingPointStack with rank numerals + OriginChips + 'Carried over'
 *   badges, a 2×60px FROM LAST SESSION card, and a sticky 64px footer
 *   (5-segment DensityMeter mini + 'Open prep card'). Signature move: drag
 *   a timeline dot — a DragGhostChip rides the pointer, the stack opens a
 *   76px dashed drop slot at the computed index, the footer meter previews
 *   pointCount+1 mid-drag — and dropping inserts the point, halos the dot,
 *   bumps the pill to '4 ready', and announces through the one toast dock.
 *   Every dot also has the non-gesture path (tap → action sheet). The
 *   two-detent prep sheet live re-typesets a shareable PrepCardPreview
 *   (auto-densifies past 4 points; 6th meter segment renders error fill
 *   with 'Over budget — sessions fit 3–5 topics').
 * @position Page template; emitted by \`astryx template mobile-therapy-session-prep\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrims, sheets, action sheet,
 *   anchored menus, ghost chip) are position:'absolute' INSIDE shell;
 *   position:fixed is banned. While any sheet/action sheet is open, shell
 *   locks to {height:'100dvh', overflow:'hidden'} and restores on close;
 *   the toast dock is sticky-in-flow (bottom 76) while unlocked and
 *   re-anchors absolute (insetInline 16, bottom 76, z45) while locked.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); no desktop Layout frames, no
 *   side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Tether teal #1F7A6D). Sanctioned non-brand literals,
 *   each with contrast math at the declaration: five feeling-tag pairs
 *   (≥3:1 vs the card surface per the interactive-boundary amendment),
 *   the halo ring pair, the carry-over amber pair, the error pair, the
 *   meter empty-segment pair (rest-state fill ≥3:1 vs its ACTUAL blur
 *   footer surface — hairline/muted tokens are for passive separators
 *   only), and the scrim.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — noted
 *   choice, no scroll-under wiring); largeTitle 52px in-flow (28/700 at
 *   the 16px gutter; the navBar center is the CountdownPill, not a
 *   duplicate title, so no collapse wiring — compact-always variant);
 *   MoodWeekTimeline card height 220 = 12 top pad + 160 plot (5 × 32px
 *   valence bands) + 8 gap + 20 day-label row + 20 bottom pad, inner rail
 *   334 = 7×46 + 6×2; talking-point rows 76px; carry rows 60px;
 *   sectionHeader 13/600 uppercase 0.06em at 32px inset, 20/8 margins;
 *   sticky footer 64px (padding '8px 16px', 48px brand button maxWidth
 *   220, DensityMeter mini 136 = 5×24 + 4×4); sheet detents 55% medium /
 *   calc(100% − 56px) large, 24px grabber zone with 36×5 pill, 52px sheet
 *   header; action sheet insetInline 16 bottom 16. TYPE (Figtree via
 *   --font-family-body): 28/700 · 22/700 rank numerals · 17/600 ·
 *   16/400–500 · 13/400 · 11/500 floor; tabular-nums on every counter.
 *   Touch: every target ≥44×44 (dots are 46×44 buttons; same-band
 *   collisions stagger into stacked 0-gap buttons) with ≥8px clearance or
 *   full-row merge; the signature drag has the mandatory button path (tap
 *   any dot → action sheet with 'Add to talking points').
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals on shell: cards are
 *   calc(100% − 32px) via 16px margins; the timeline rail is a FIXED
 *   334px inside an overflowX-auto snap rail (exact fit at 390; below
 *   374px shell width it scrolls with a ≥24px Sunday peek — 46×44 hits
 *   hold at 320). Footer button shrinks on flex; meter mini fixed 136px.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout; the prep anatomy is phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HistoryIcon,
  ListPlusIcon,
  MinusCircleIcon,
  MoreHorizontalIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Tether teal). #1F7A6D on #FFFFFF ≈ 4.9:1;
// #5FC0B0 on the dark card (~#1C1917) ≈ 8.3:1.
const BRAND_ACCENT = 'light-dark(#1F7A6D, #5FC0B0)';
// Text over a BRAND_ACCENT fill: #FFFFFF on #1F7A6D ≈ 4.9:1; near-black
// teal #0B2E28 on #5FC0B0 ≈ 8.3:1.
const BRAND_ON_FILL = 'light-dark(#FFFFFF, #0B2E28)';
// Brand-tinted text (CountdownPill, Edit, chips): #14574E on the 12% tint
// over white ≈ 6.8:1; #7FD4C6 on the 18% tint over #1C1917 ≈ 7.2:1.
const BRAND_TEXT = 'light-dark(#14574E, #7FD4C6)';
// CountdownPill / selected-row wash.
const BRAND_TINT = 'light-dark(rgba(31, 122, 109, 0.12), rgba(95, 192, 176, 0.18))';
// Halo ring for dots with an active talking point — the darker a11y pair:
// #14574E vs white card ≈ 8.7:1, #7FD4C6 vs dark card ≈ 9.6:1 (≥3:1 law).
const HALO_RING = 'light-dark(#14574E, #7FD4C6)';
// Feeling-tag dot fills — each ≥3:1 vs the card surface it actually sits
// on (white light / #1C1917 dark), per the interactive-boundary amendment:
// anxious #B45309 ≈ 4.0:1 / #F5A524 ≈ 8.6:1; frustrated #B3261E ≈ 5.9:1 /
// #F2857C ≈ 5.2:1; drained #5B5E66 ≈ 5.6:1 / #9BA0AA ≈ 5.7:1; calm
// #1F7A6D ≈ 4.9:1 / #5FC0B0 ≈ 8.3:1; proud #6D28D9 ≈ 6.6:1 / #B79BF5 ≈
// 6.1:1.
const TAG_COLOR: Record<FeelingTag, string> = {
  anxious: 'light-dark(#B45309, #F5A524)',
  frustrated: 'light-dark(#B3261E, #F2857C)',
  drained: 'light-dark(#5B5E66, #9BA0AA)',
  calm: 'light-dark(#1F7A6D, #5FC0B0)',
  proud: 'light-dark(#6D28D9, #B79BF5)',
};
// 'Carried over' badge: bg 14%/16% amber washes; text #8A4207 ≈ 5.1:1 on
// the light wash-over-white, #F5C36B ≈ 6.0:1 on the dark wash-over-card.
const CARRY_BG = 'light-dark(rgba(180, 83, 9, 0.14), rgba(245, 165, 36, 0.16))';
const CARRY_TEXT = 'light-dark(#8A4207, #F5C36B)';
// Error / over-budget pair: #B3261E on card white ≈ 5.9:1; #F2857C on the
// dark card ≈ 5.2:1.
const ERROR_PAIR = 'light-dark(#B3261E, #F2857C)';
// DensityMeter EMPTY segments — a meaningful rest-state fill, so NOT the
// muted token (amendment): #8A857E vs the ~white blur footer ≈ 3.4:1;
// #78716C vs the ~#1C1917 blur footer ≈ 3.4:1 — both clear 3:1.
const METER_EMPTY = 'light-dark(#8A857E, #78716C)';
// Drop-slot dashed boundary — brand at 40% per spec (transient mid-drag
// affordance, always paired with the solid tint wash behind it).
const SLOT_BORDER = \`color-mix(in srgb, \${BRAND_ACCENT} 40%, transparent)\`;
const SLOT_TINT = \`color-mix(in srgb, \${BRAND_ACCENT} 8%, transparent)\`;
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Chrome blur surface (navBar, footer, editToolbar).
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, reduced-motion guard.
// Transitions animate transform/opacity only and collapse to instant under
// prefers-reduced-motion.
// ---------------------------------------------------------------------------

const TETHER_CSS = \`
.ttr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.ttr-btn:disabled { cursor: default; }
.ttr-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.ttr-anim { transition: transform 200ms ease, opacity 200ms ease; }
@keyframes ttr-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.ttr-sheet-in { animation: ttr-sheet-in 200ms ease; }
@media (prefers-reduced-motion: reduce) {
  .ttr-anim { transition: none; }
  .ttr-sheet-in { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries
  // cannot tell the stages apart).
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
  // Scroll lock while any sheet / action sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
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
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  navTextBtn: {
    height: 44,
    paddingInline: 8,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_TEXT,
    whiteSpace: 'nowrap',
  },
  navTextBtnStrong: {fontWeight: 600},
  navEditTitle: {
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  // CountdownPill — 28px, tint bg, brand text, tabular.
  countdownPill: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    background: BRAND_TINT,
    color: BRAND_TEXT,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // LARGE TITLE — 52px in-flow block, 28/700 at the 16px gutter.
  largeTitle: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitleText: {margin: 0, fontSize: 28, fontWeight: 700, lineHeight: 1.15},
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // sectionHeader — 13/600 uppercase 0.06em at 32px inset, 20/8 margins;
  // headerRow variant carries a trailing text button at the 16px gutter.
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '20px 0 8px',
    paddingInlineStart: 32,
    paddingInlineEnd: 16,
    minHeight: 20,
  },
  sectionHeader: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  editTextBtn: {
    height: 44,
    marginBlock: -12,
    paddingInline: 8,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_TEXT,
  },
  // Inset-grouped listCard.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // MOOD WEEK TIMELINE — card 220 = 12 + 160 plot + 8 + 20 labels + 20.
  timelineCard: {
    marginInline: 16,
    height: 220,
    padding: '12px 0 20px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  railScroller: {
    overflowX: 'auto',
    scrollSnapType: 'x proximity',
    scrollPaddingInline: 12,
    paddingInline: 12,
  },
  rail: {position: 'relative', width: 334, display: 'flex', gap: 2},
  // Midline hairline at valence 0 (band 2 center: 2×32 + 16 = 80).
  railMidline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 80,
    height: 1,
    background: 'var(--color-border)',
    pointerEvents: 'none',
  },
  dayCol: {
    position: 'relative',
    width: 46,
    flexShrink: 0,
    height: 188, // 160 plot + 8 gap + 20 label
    scrollSnapAlign: 'start',
  },
  dayLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 20,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  // Dots — 14px glyphs inside 46×44 absolute buttons (greedy-stacked so
  // same-band / adjacent-band hits never overlap; 0-gap merge clause).
  dotBtn: {
    position: 'absolute',
    left: 0,
    width: 46,
    height: 44,
    borderRadius: 12,
  },
  dot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: '50%',
  },
  dotDimmed: {opacity: 0.4},
  weekCaption: {
    margin: '8px 16px 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TALKING POINT STACK — 76px rows.
  pointRowWrap: {position: 'relative'},
  pointRow: {
    height: 76,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  pointRowSelected: {background: BRAND_TINT},
  rankNum: {
    width: 24,
    flexShrink: 0,
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  pointTextWrap: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  pointPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipRow: {display: 'flex', alignItems: 'center', gap: 8, height: 20, minWidth: 0},
  originChip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    paddingInline: 8,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    flexShrink: 0,
  },
  originDot: {width: 12, height: 12, borderRadius: '50%', flexShrink: 0},
  carryBadge: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: CARRY_BG,
    color: CARRY_TEXT,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  editIconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  editIconBtnDisabled: {opacity: 0.35},
  removeIconBtn: {color: ERROR_PAIR},
  // 76px dashed drop slot — opens at the computed insertion index mid-drag.
  dropSlot: {
    height: 60,
    margin: 8,
    borderRadius: 8,
    border: \`2px dashed \${SLOT_BORDER}\`,
    background: SLOT_TINT,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
  },
  // Empty state (stack card slot).
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
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {margin: 0, fontSize: 17, fontWeight: 600},
  emptyBody: {
    margin: '4px 0 16px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: '18px',
  },
  emptyActionBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    display: 'grid',
    placeItems: 'center',
  },
  // CARRY-OVER rows — 60px.
  carryRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  carryText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  carryStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  carryCheck: {color: BRAND_ACCENT, display: 'inline-flex'},
  carryAddBtn: {
    height: 36,
    paddingInline: 14,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  bottomSpacer: {height: 24},
  // STICKY FOOTER — 64px, blur surface, meter mini + brand CTA.
  stickyFooter: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px',
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  meterMini: {
    width: 136,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  meterRow: {display: 'flex', gap: 4},
  meterSeg: {width: 24, height: 6, borderRadius: 3},
  meterSegFull: {flex: 1, height: 6, borderRadius: 3},
  meterLabel: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  footerCta: {
    flex: 1,
    maxWidth: 220,
    marginLeft: 'auto',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON_FILL,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
  },
  footerCtaDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // Edit toolbar — replaces the footer with identical 64px geometry.
  editToolbarBtn: {
    height: 44,
    paddingInline: 8,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  editToolbarRemove: {color: ERROR_PAIR},
  editToolbarMove: {color: BRAND_TEXT, marginLeft: 'auto'},
  editToolbarDisabled: {opacity: 0.4},
  // TOAST DOCK — sticky-in-flow (height 0) pinned 76px above the viewport
  // bottom (above the 64px footer + 12px); absolute-in-shell would anchor
  // to the DOCUMENT bottom on this tall scrolling view (amendment).
  // Always mounted for aria-live.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  // While the shell is scroll-locked (sheet open) the dock re-anchors
  // absolute — legal only under the 100dvh lock.
  toastFloat: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 45,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 'calc(100% - 32px)',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastStatic: {position: 'static'},
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  toastRule: {
    width: 1,
    height: 16,
    background: 'var(--color-border)',
    marginInline: 12,
    flexShrink: 0,
  },
  toastUndoBtn: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
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
  sheetMedium: {height: '55%'},
  sheetLarge: {height: 'calc(100% - 56px)'},
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
  sheetTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: '8px 16px',
    minHeight: 48,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  shareBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON_FILL,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // Compact numbered list (medium detent).
  compactRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
    minHeight: 44,
    paddingBlock: 6,
  },
  compactIndex: {
    width: 20,
    flexShrink: 0,
    fontSize: 16,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  compactText: {flex: 1, minWidth: 0, fontSize: 16, lineHeight: '22px'},
  compactMeta: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // PREP CARD PREVIEW (large detent) — the shareable card.
  prepCard: {
    width: '100%',
    borderRadius: 12,
    border: \`2px solid \${SLOT_BORDER}\`,
    padding: 20,
    background: 'var(--color-background-card)',
  },
  prepBrandRow: {display: 'flex', alignItems: 'center', gap: 8, color: BRAND_ACCENT},
  prepBrandName: {fontSize: 13, fontWeight: 600, color: BRAND_TEXT},
  prepTitle: {margin: '10px 0 0', fontSize: 17, fontWeight: 600, lineHeight: '22px'},
  prepSub: {margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-secondary)'},
  prepHr: {height: 1, background: 'var(--color-border)', marginBlock: 12},
  prepPointRow: {display: 'flex', gap: 8, paddingBlock: 5},
  prepIndex: {
    width: 18,
    flexShrink: 0,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  prepPointText: {
    flex: 1,
    minWidth: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: 1.35,
  },
  prepChipInline: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  meterCaption: {
    marginTop: 6,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  meterCaptionWarn: {color: ERROR_PAIR, fontWeight: 500},
  // HISTORY sheet rows — 60px.
  historySummaryRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  historyRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  historyText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  historyPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  historySecondary: {fontSize: 13, color: 'var(--color-text-secondary)'},
  historySection: {
    margin: '16px 0 4px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // ACTION SHEET — two stacked cards, insetInline 16 bottom 16 z41.
  actionSheetWrap: {
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
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    borderBottom: '1px solid var(--color-border)',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  asRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
  },
  asRowDivider: {height: 1, background: 'var(--color-border)'},
  asDestructive: {color: ERROR_PAIR},
  asCancel: {fontWeight: 600},
  // ANCHORED point menu — z30 (below sheet scrims).
  pointMenu: {
    position: 'absolute',
    right: 12,
    top: 64,
    zIndex: 30,
    minWidth: 200,
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
    paddingInline: 14,
    fontSize: 16,
  },
  // DRAG GHOST CHIP — follows the pointer via transform only.
  ghostChip: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 60,
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — frozen calendar, dual fields everywhere, aggregates derive
// live from rows. Cross-check ledger (verified by hand): per-day counts
// 3+2+4+1+3+2+2 = 17; tags anxious 5 + calm 5 + drained 3 + frustrated 2 +
// proud 2 = 17; valence ≥ 0 on 8 rows; valence sum = (−1+1−2) + (0−1) +
// (−2−1+2+1) + (−1) + (−2+0+1) + (2−1) + (1−1) = −4 → −4/17 ≈ −0.235 →
// '−0.2'; points at rest 3 (2 moment-sourced halos + 1 carry-over);
// Jun 27 history 6 = 4 discussed + 2 carried over.
// ---------------------------------------------------------------------------

const CLIENT = 'Maya Chen';
const THERAPIST = 'Dr. Elena Ruiz';
const NEXT_SESSION = 'Thu Jul 9 · 4:30 PM';
const NEXT_SESSION_TITLE = 'Session prep — Thu Jul 9, 4:30 PM';
const LAST_SESSION = 'Fri Jun 27';
const TODAY_LABEL = 'Tue Jul 7'; // hence 'In 2 days' — fixed string, no clock
const COUNTDOWN = 'In 2 days';
const WEEK_RANGE = 'Mon Jun 30 to Sun Jul 6';
const TOPIC_BUDGET = 5; // sessions fit 3–5 topics

type FeelingTag = 'anxious' | 'frustrated' | 'drained' | 'calm' | 'proud';

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Cross-check aggregate for MOMENTS: derived per-day counts must equal
// [3, 2, 4, 1, 3, 2, 2] (sum 17).
const MOMENTS_PER_DAY = [3, 2, 4, 1, 3, 2, 2];

interface Moment {
  id: string;
  day: number; // 0 = Mon Jun 30 … 6 = Sun Jul 6
  time: string;
  tag: FeelingTag;
  valence: -2 | -1 | 0 | 1 | 2;
  note: string;
  pointId: string | null; // set when an active talking point sources here
}

// Sat 4:50 PM carries the LONG-TEXT stress note (1-line ellipsis in the
// 76px stack row, 2-line clamp in PrepCardPreview) — spec's stress point
// merged into the anxious Mom-call moment; see deviations in the doc.
const MOMENTS_FIXTURE: Moment[] = [
  {id: 'm-mon-0810', day: 0, time: '8:10 AM', tag: 'anxious', valence: -1, note: 'Commute dread', pointId: null},
  {id: 'm-mon-1240', day: 0, time: '12:40 PM', tag: 'calm', valence: 1, note: 'Lunch walk', pointId: null},
  {id: 'm-mon-2105', day: 0, time: '9:05 PM', tag: 'drained', valence: -2, note: 'Doomscrolled', pointId: null},
  {id: 'm-tue-0755', day: 1, time: '7:55 AM', tag: 'calm', valence: 0, note: 'Slept 7 hours', pointId: null},
  {id: 'm-tue-1830', day: 1, time: '6:30 PM', tag: 'frustrated', valence: -1, note: 'Sprint review ran over', pointId: null},
  {id: 'm-wed-0920', day: 2, time: '9:20 AM', tag: 'anxious', valence: -2, note: '1:1 with manager', pointId: 'p1'},
  {id: 'm-wed-1100', day: 2, time: '11:00 AM', tag: 'anxious', valence: -1, note: 'Waiting on feedback', pointId: null},
  {id: 'm-wed-1515', day: 2, time: '3:15 PM', tag: 'proud', valence: 2, note: 'Shipped the fix', pointId: null},
  {id: 'm-wed-2045', day: 2, time: '8:45 PM', tag: 'calm', valence: 1, note: 'Called Dana', pointId: null},
  {id: 'm-thu-1940', day: 3, time: '7:40 PM', tag: 'drained', valence: -1, note: 'Skipped gym again', pointId: null},
  {id: 'm-fri-1030', day: 4, time: '10:30 AM', tag: 'frustrated', valence: -2, note: 'Talked over in meeting', pointId: 'p2'},
  {id: 'm-fri-1320', day: 4, time: '1:20 PM', tag: 'anxious', valence: 0, note: 'Asked to lead demo', pointId: null},
  {id: 'm-fri-1915', day: 4, time: '7:15 PM', tag: 'proud', valence: 1, note: 'Said no to weekend work', pointId: null},
  {id: 'm-sat-1110', day: 5, time: '11:10 AM', tag: 'calm', valence: 2, note: 'Long run', pointId: null},
  {
    id: 'm-sat-1650',
    day: 5,
    time: '4:50 PM',
    tag: 'anxious',
    valence: -1,
    note: "Feeling like I have to manage everyone's emotions at family events, especially around Mom's health updates",
    pointId: null,
  },
  {id: 'm-sun-0930', day: 6, time: '9:30 AM', tag: 'calm', valence: 1, note: 'Slow morning', pointId: null},
  {id: 'm-sun-2020', day: 6, time: '8:20 PM', tag: 'drained', valence: -1, note: 'Sunday scaries', pointId: null},
];

type PointOrigin =
  | {kind: 'moment'; momentId: string; day: string; time: string; tag: FeelingTag}
  | {kind: 'session'; label: string};

interface Point {
  id: string;
  text: string;
  origin: PointOrigin;
  carriedOver: boolean;
  carryId: string | null;
}

const POINTS_FIXTURE: Point[] = [
  {
    id: 'p1',
    text: '1:1 with manager',
    origin: {kind: 'moment', momentId: 'm-wed-0920', day: 'Wed', time: '9:20 AM', tag: 'anxious'},
    carriedOver: false,
    carryId: null,
  },
  {
    id: 'p2',
    text: 'Talked over in meeting',
    origin: {kind: 'moment', momentId: 'm-fri-1030', day: 'Fri', time: '10:30 AM', tag: 'frustrated'},
    carriedOver: false,
    carryId: null,
  },
  {
    id: 'p3',
    text: 'Boundary-setting at work',
    origin: {kind: 'session', label: 'Jun 27 session'},
    carriedOver: true,
    carryId: 'c1',
  },
];

type CarryStatus = 'inList' | 'pending' | 'discussed';

interface CarryOver {
  id: string;
  text: string;
  status: CarryStatus;
}

const CARRY_FIXTURE: CarryOver[] = [
  {id: 'c1', text: 'Boundary-setting at work', status: 'inList'},
  {id: 'c2', text: 'Sleep routine follow-up', status: 'pending'},
];

// Jun 27 history: 6 topics = 4 discussed + 2 carried over ✓ (summary row
// '6 topics · 4 resolved · 2 carried over' derives from these arrays).
const HISTORY_DISCUSSED = [
  'Panic on Sunday nights',
  'Medication check-in',
  "Sister's wedding plan",
  'Grounding exercise review',
];
const HISTORY_CARRIED = ['Boundary-setting at work', 'Sleep routine follow-up'];

// ---------------------------------------------------------------------------
// ONE STATE OWNER — usePrepStore(): every surface reads from and writes to
// this single object through one update(id, patch); derived selectors
// (pointCount, haloIds, steady/trend caption) recompute per render.
// ---------------------------------------------------------------------------

type SheetDetent = 'closed' | 'medium' | 'large';

interface DragState {
  momentId: string;
  x: number; // shell-relative pointer coords (transform-only ghost)
  y: number;
  overIndex: number | null; // insertion index while over the stack rect
}

interface UndoSnapshot {
  moments: Moment[];
  points: Point[];
  carryOvers: CarryOver[];
  weekDiscussed: Point[];
}

interface ToastState {
  seq: number;
  msg: string;
  undo: UndoSnapshot | null;
}

interface UiState {
  sheet: SheetDetent; // prep-card sheet
  historyOpen: boolean;
  actionSheetFor: string | null; // momentId
  pointMenuFor: string | null; // pointId (anchored ellipsis menu)
  editMode: boolean;
  editSelectedId: string | null; // toolbar Remove / Move-to-top target
  editSnapshot: Point[] | null; // Cancel restores this
  drag: DragState | null;
  toast: ToastState | null;
}

interface PrepStore {
  moments: Moment[];
  points: Point[];
  carryOvers: CarryOver[];
  weekDiscussed: Point[]; // 'Mark discussed' moves points here
  ui: UiState;
}

const INITIAL_STORE: PrepStore = {
  moments: MOMENTS_FIXTURE,
  points: POINTS_FIXTURE,
  carryOvers: CARRY_FIXTURE,
  weekDiscussed: [],
  ui: {
    sheet: 'closed',
    historyOpen: false,
    actionSheetFor: null,
    pointMenuFor: null,
    editMode: false,
    editSelectedId: null,
    editSnapshot: null,
    drag: null,
    toast: null,
  },
};

function usePrepStore() {
  const [store, setStore] = useState<PrepStore>(INITIAL_STORE);
  const update = useCallback(
    <K extends keyof PrepStore>(id: K, patch: Partial<PrepStore[K]>) => {
      setStore(prev => ({...prev, [id]: {...(prev[id] as object), ...patch} as PrepStore[K]}));
    },
    [],
  );
  return {store, update, setStore};
}

/**
 * Container-width hook (grid-feeder-console pattern): only a
 * ResizeObserver on the wrapper can tell the 390px mobile stage from the
 * ~1045px desktop stage inside the same 1440px window.
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

// Sheets and the action sheet trap focus while open.
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
// KNOT MARK — one continuous over-under knot path (two loops joined), 24px
// viewBox, 2px currentColor stroke, no fills.
// ---------------------------------------------------------------------------

function KnotMark({size = 24}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12c0-2.5-2-4.7-4.4-4.7a4.7 4.7 0 1 0 0 9.4c1.7 0 3.2-1.2 4.4-2.6 1.2 1.4 2.7 2.6 4.4 2.6a4.7 4.7 0 1 0 0-9.4C14 7.3 12 9.5 12 12Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DENSITY METER — 5 base segments; overflow segments (6th+) render in the
// error pair. Filled = brand; EMPTY = METER_EMPTY (≥3:1 vs its actual
// surface — amendment: rest-state fills never use hairline/muted tokens).
// ---------------------------------------------------------------------------

function DensityMeter({count, variant}: {count: number; variant: 'mini' | 'full'}) {
  const segCount = Math.max(TOPIC_BUDGET, count);
  const segStyle = variant === 'mini' ? styles.meterSeg : styles.meterSegFull;
  const segments = [];
  for (let i = 0; i < segCount; i++) {
    const fill = i < count ? (i < TOPIC_BUDGET ? BRAND_ACCENT : ERROR_PAIR) : METER_EMPTY;
    segments.push(<span key={i} style={{...segStyle, background: fill}} />);
  }
  return (
    <span style={styles.meterRow} aria-hidden>
      {segments}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ORIGIN CHIP — 20px provenance chip: feeling dot + 'Wed · anxious', or a
// 12px KnotMark + 'Jun 27 session' for session-sourced points.
// ---------------------------------------------------------------------------

function OriginChip({origin}: {origin: PointOrigin}) {
  if (origin.kind === 'session') {
    return (
      <span style={styles.originChip}>
        <span style={{display: 'inline-flex', color: BRAND_TEXT}}>
          <KnotMark size={12} />
        </span>
        {origin.label}
      </span>
    );
  }
  return (
    <span style={styles.originChip}>
      <span style={{...styles.originDot, position: 'static', background: TAG_COLOR[origin.tag]}} />
      {origin.day} · {origin.tag}
    </span>
  );
}

// ---------------------------------------------------------------------------
// MOOD WEEK TIMELINE — 7 fixed 46px day columns over a 160px 5-band
// valence plot (+2…−2, 32px/band). Every moment is a 14px tag-colored dot
// inside its own 46×44 <button>; same-day dots greedy-stack so hit areas
// never overlap (0-gap merge clause — a same-band pair staggers 16px
// within its band and the buttons butt into a 46×88 column zone). Brand
// halo ring = moment has an active talking point. Rail scrolls (snap x
// proximity) below 374px shell width with a ≥24px Sunday peek; arrow keys
// move dot-to-dot chronologically when a dot is focused.
// ---------------------------------------------------------------------------

interface DotLayout {
  moment: Moment;
  index: number; // chronological index across all 17
  dotY: number; // rail-local center y within the 160px plot
  btnTop: number;
}

function layoutDay(dayMoments: Array<{moment: Moment; index: number}>): DotLayout[] {
  // Same-(day, band) collision stagger: k dots offset 16px apart within
  // the 32px band (2 dots → −8/+8 from the band center).
  const byBand = new Map<number, Array<{moment: Moment; index: number}>>();
  for (const entry of dayMoments) {
    const band = 2 - entry.moment.valence;
    const list = byBand.get(band) ?? [];
    list.push(entry);
    byBand.set(band, list);
  }
  const placed: DotLayout[] = [];
  for (const [band, list] of Array.from(byBand.entries())) {
    list.forEach((entry, i) => {
      const offset = list.length === 1 ? 0 : i * 16 - ((list.length - 1) * 16) / 2;
      placed.push({moment: entry.moment, index: entry.index, dotY: band * 32 + 16 + offset, btnTop: 0});
    });
  }
  placed.sort((a, b) => a.dotY - b.dotY);
  // Greedy non-overlapping 44px hit buttons centered on each dot.
  let prevBottom = -Infinity;
  for (const item of placed) {
    item.btnTop = Math.max(item.dotY - 22, prevBottom);
    prevBottom = item.btnTop + 44;
  }
  return placed;
}

interface MoodWeekTimelineProps {
  moments: Moment[];
  dragMomentId: string | null;
  onDotTap: (momentId: string, opener: HTMLElement) => void;
  onDotPointerDown: (momentId: string, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onDotPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onDotPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
}

function MoodWeekTimeline({
  moments,
  dragMomentId,
  onDotTap,
  onDotPointerDown,
  onDotPointerMove,
  onDotPointerUp,
}: MoodWeekTimelineProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const focusDotAt = (index: number) => {
    const target = railRef.current?.querySelector<HTMLButtonElement>(\`button[data-dot-index="\${index}"]\`);
    target?.focus();
  };
  const handleKeyNav = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      focusDotAt(Math.min(moments.length - 1, index + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusDotAt(Math.max(0, index - 1));
    }
  };

  const days = DAY_SHORT.map((label, day) => {
    const dayMoments = moments
      .map((moment, index) => ({moment, index}))
      .filter(entry => entry.moment.day === day);
    return {label, day, layout: layoutDay(dayMoments)};
  });

  return (
    <div style={styles.timelineCard}>
      <div style={styles.railScroller}>
        <div ref={railRef} style={styles.rail} role="group" aria-label={\`Mood timeline, \${WEEK_RANGE}\`}>
          <span style={styles.railMidline} aria-hidden />
          {days.map(({label, day, layout}) => (
            <div key={day} style={styles.dayCol}>
              {layout.map(({moment, index, dotY, btnTop}) => {
                const haloed = moment.pointId != null;
                const dragging = dragMomentId === moment.id;
                return (
                  <button
                    key={moment.id}
                    type="button"
                    data-dot-index={index}
                    className="ttr-btn ttr-focusable"
                    style={{...styles.dotBtn, top: btnTop, touchAction: 'none'}}
                    aria-label={\`\${DAY_FULL[day]} \${moment.time}, \${moment.tag}, \${moment.note}\${haloed ? ' — in talking points' : ''}\`}
                    onKeyDown={event => handleKeyNav(event, index)}
                    onPointerDown={event => onDotPointerDown(moment.id, event)}
                    onPointerMove={onDotPointerMove}
                    onPointerUp={onDotPointerUp}
                    onClick={event => onDotTap(moment.id, event.currentTarget)}>
                    <span
                      aria-hidden
                      style={{
                        ...styles.dot,
                        ...(dragging ? styles.dotDimmed : null),
                        left: 16,
                        top: dotY - btnTop - 7,
                        background: TAG_COLOR[moment.tag],
                        // Halo: 2px card-color gap then a 3px ring in the
                        // darker a11y pair (≥3:1 vs card) — state is also
                        // voiced in the accessible name, never color alone.
                        boxShadow: haloed
                          ? \`0 0 0 2px var(--color-background-card), 0 0 0 5px \${HALO_RING}\`
                          : undefined,
                      }}
                    />
                  </button>
                );
              })}
              <span style={styles.dayLabel} aria-hidden>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PREP CARD PREVIEW — the live-rendered shareable card. Re-typesets from
// prepStore.points on every mutation (including the mid-drag hover-insert
// preview count): numbered lines auto-densify from 16/400 to 13/400 past
// 4 points; the meter caption flips to the over-budget warning past 5.
// ---------------------------------------------------------------------------

function originChipText(origin: PointOrigin): string {
  return origin.kind === 'session' ? origin.label : \`\${origin.day} · \${origin.tag}\`;
}

function PrepCardPreview({points, count}: {points: Point[]; count: number}) {
  const dense = count > 4; // auto-densify past 4 points
  const over = count > TOPIC_BUDGET;
  return (
    <div style={styles.prepCard}>
      <div style={styles.prepBrandRow}>
        <KnotMark size={24} />
        <span style={styles.prepBrandName}>Tether</span>
      </div>
      <p style={styles.prepTitle}>{NEXT_SESSION_TITLE}</p>
      <p style={styles.prepSub}>with {THERAPIST}</p>
      <div style={styles.prepHr} />
      {points.map((point, index) => (
        <div key={point.id} style={{...styles.prepPointRow, fontSize: dense ? 13 : 16}}>
          <span style={{...styles.prepIndex, fontSize: dense ? 13 : 16}}>{index + 1}</span>
          <span style={styles.prepPointText}>
            {point.text}{' '}
            <span style={styles.prepChipInline}>· {originChipText(point.origin)}</span>
          </span>
        </div>
      ))}
      {count > points.length ? (
        <div style={{...styles.prepPointRow, fontSize: dense ? 13 : 16, color: 'var(--color-text-secondary)'}}>
          <span style={{...styles.prepIndex, fontSize: dense ? 13 : 16}}>{count}</span>
          <span style={styles.prepPointText}>Adding…</span>
        </div>
      ) : null}
      <div style={styles.prepHr} />
      <DensityMeter count={count} variant="full" />
      <p style={{...styles.meterCaption, ...(over ? styles.meterCaptionWarn : null)}}>
        {over
          ? 'Over budget — sessions fit 3–5 topics'
          : \`\${count} of \${TOPIC_BUDGET} topics · sessions fit 3–5\`}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileTherapySessionPrepTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {store, update, setStore} = usePrepStore();
  const {moments, points, carryOvers, weekDiscussed, ui} = store;

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const grabberRef = useRef<HTMLButtonElement | null>(null);
  const historyCloseRef = useRef<HTMLButtonElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const historyOpenerRef = useRef<HTMLElement | null>(null);
  const actionOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const toastSeqRef = useRef(0);
  const pointSeqRef = useRef(4); // p1–p3 shipped; next minted id is p4
  const pendingDragRef = useRef<{momentId: string; startX: number; startY: number; active: boolean} | null>(null);
  const didDragRef = useRef(false);

  // DERIVED — every counter derives from the rows it summarizes.
  const pointCount = points.length;
  const previewCount = pointCount + (ui.drag?.overIndex != null ? 1 : 0);
  const momentTotal = MOMENTS_PER_DAY.reduce((sum, n) => sum + n, 0); // 17 ✓ (= moments.length)
  const steadyCount = moments.filter(moment => moment.valence >= 0).length; // 8 ✓
  const valenceSum = moments.reduce((sum, moment) => sum + moment.valence, 0); // −4 ✓
  const trend = Math.round((valenceSum / momentTotal) * 10) / 10; // −0.2 ✓
  const trendLabel = \`\${trend < 0 ? '−' : trend > 0 ? '+' : ''}\${Math.abs(trend).toFixed(1)}\`;
  const anySheetOpen = ui.sheet !== 'closed' || ui.historyOpen || ui.actionSheetFor != null;

  const makeToast = (msg: string, undo: UndoSnapshot | null = null): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, msg, undo};
  };

  const addedToastMsg = (newCount: number) =>
    newCount > TOPIC_BUDGET
      ? \`\${newCount} of \${TOPIC_BUDGET} — over the 3 to 5 topic budget\`
      : 'Added to talking points';

  // MUTATIONS — every one lands in the single store and every consequence
  // (pill, header count, meter, halos, carry rows, prep card) re-derives.
  const addPointFromMoment = (momentId: string, insertIndex: number | null) => {
    setStore(prev => {
      const moment = prev.moments.find(m => m.id === momentId);
      if (moment == null || moment.pointId != null) {
        return {...prev, ui: {...prev.ui, drag: null, actionSheetFor: null}};
      }
      const id = \`p\${pointSeqRef.current}\`;
      pointSeqRef.current += 1;
      const point: Point = {
        id,
        text: moment.note,
        origin: {kind: 'moment', momentId, day: DAY_SHORT[moment.day], time: moment.time, tag: moment.tag},
        carriedOver: false,
        carryId: null,
      };
      const nextPoints = [...prev.points];
      nextPoints.splice(insertIndex ?? nextPoints.length, 0, point);
      return {
        ...prev,
        moments: prev.moments.map(m => (m.id === momentId ? {...m, pointId: id} : m)),
        points: nextPoints,
        ui: {...prev.ui, drag: null, actionSheetFor: null, toast: makeToast(addedToastMsg(nextPoints.length))},
      };
    });
  };

  const addCarryOver = (carryId: string) => {
    setStore(prev => {
      const carry = prev.carryOvers.find(c => c.id === carryId);
      if (carry == null || carry.status !== 'pending') return prev;
      const id = \`p\${pointSeqRef.current}\`;
      pointSeqRef.current += 1;
      const point: Point = {
        id,
        text: carry.text,
        origin: {kind: 'session', label: 'Jun 27 session'},
        carriedOver: true,
        carryId,
      };
      const nextPoints = [...prev.points, point];
      return {
        ...prev,
        points: nextPoints,
        carryOvers: prev.carryOvers.map(c => (c.id === carryId ? {...c, status: 'inList' as const} : c)),
        ui: {...prev.ui, toast: makeToast(addedToastMsg(nextPoints.length))},
      };
    });
  };

  // Snapshot-based Undo (undoOverConfirm): reversible removals execute
  // IMMEDIATELY; Undo restores the exact index, halo, and carry state.
  const removePoint = (pointId: string) => {
    setStore(prev => {
      const point = prev.points.find(p => p.id === pointId);
      if (point == null) return prev;
      const snapshot: UndoSnapshot = {
        moments: prev.moments,
        points: prev.points,
        carryOvers: prev.carryOvers,
        weekDiscussed: prev.weekDiscussed,
      };
      return {
        ...prev,
        moments: prev.moments.map(m => (m.pointId === pointId ? {...m, pointId: null} : m)),
        points: prev.points.filter(p => p.id !== pointId),
        carryOvers:
          point.carryId != null
            ? prev.carryOvers.map(c => (c.id === point.carryId ? {...c, status: 'pending' as const} : c))
            : prev.carryOvers,
        ui: {
          ...prev.ui,
          pointMenuFor: null,
          actionSheetFor: null,
          editSelectedId: prev.ui.editSelectedId === pointId ? null : prev.ui.editSelectedId,
          toast: makeToast('Removed from talking points', snapshot),
        },
      };
    });
  };

  const markDiscussed = (pointId: string) => {
    setStore(prev => {
      const point = prev.points.find(p => p.id === pointId);
      if (point == null) return prev;
      const snapshot: UndoSnapshot = {
        moments: prev.moments,
        points: prev.points,
        carryOvers: prev.carryOvers,
        weekDiscussed: prev.weekDiscussed,
      };
      return {
        ...prev,
        moments: prev.moments.map(m => (m.pointId === pointId ? {...m, pointId: null} : m)),
        points: prev.points.filter(p => p.id !== pointId),
        weekDiscussed: [...prev.weekDiscussed, {...point, carriedOver: false}],
        carryOvers:
          point.carryId != null
            ? prev.carryOvers.map(c => (c.id === point.carryId ? {...c, status: 'discussed' as const} : c))
            : prev.carryOvers,
        ui: {...prev.ui, pointMenuFor: null, toast: makeToast('Marked discussed', snapshot)},
      };
    });
  };

  const undo = () => {
    setStore(prev => {
      const snapshot = prev.ui.toast?.undo;
      if (snapshot == null) return prev;
      return {
        ...prev,
        moments: snapshot.moments,
        points: snapshot.points,
        carryOvers: snapshot.carryOvers,
        weekDiscussed: snapshot.weekDiscussed,
        ui: {...prev.ui, toast: makeToast('Restored')},
      };
    });
  };

  const movePoint = (pointId: string, dir: -1 | 1) => {
    setStore(prev => {
      const index = prev.points.findIndex(p => p.id === pointId);
      const target = index + dir;
      if (index < 0 || target < 0 || target >= prev.points.length) return prev;
      const next = [...prev.points];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return {...prev, points: next};
    });
  };

  const moveToTop = (pointId: string) => {
    setStore(prev => {
      const index = prev.points.findIndex(p => p.id === pointId);
      if (index <= 0) return prev;
      const next = [...prev.points];
      const [moved] = next.splice(index, 1);
      next.unshift(moved);
      return {...prev, points: next};
    });
  };

  // EDIT MODE — entered only by the visible Edit text button; Cancel
  // restores the entry snapshot (all four slices, since in-edit removals
  // touch moments/carryOvers too); Done commits.
  const editEntrySnapRef = useRef<UndoSnapshot | null>(null);
  const enterEdit = () => {
    editEntrySnapRef.current = {moments, points, carryOvers, weekDiscussed};
    update('ui', {editMode: true, editSelectedId: null, pointMenuFor: null, editSnapshot: points});
  };
  const exitEdit = (cancel: boolean) => {
    setStore(prev => {
      const snap = cancel ? editEntrySnapRef.current : null;
      return {
        ...prev,
        ...(snap != null
          ? {moments: snap.moments, points: snap.points, carryOvers: snap.carryOvers, weekDiscussed: snap.weekDiscussed}
          : null),
        ui: {...prev.ui, editMode: false, editSelectedId: null, editSnapshot: null, toast: null},
      };
    });
    editEntrySnapRef.current = null;
  };

  // SHEET / OVERLAY LIFECYCLE — never two sheets at once; toast clears on
  // sheet change (the sanctioned end of an undo window).
  const openPrepSheet = (opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener;
    update('ui', {sheet: 'medium', historyOpen: false, actionSheetFor: null, pointMenuFor: null, toast: null});
  };
  const closePrepSheet = () => {
    update('ui', {sheet: 'closed', toast: null});
    sheetOpenerRef.current?.focus();
  };
  const toggleDetent = () => {
    update('ui', {sheet: ui.sheet === 'medium' ? 'large' : 'medium'});
  };
  const openHistory = (opener: HTMLElement | null) => {
    historyOpenerRef.current = opener;
    update('ui', {historyOpen: true, sheet: 'closed', actionSheetFor: null, pointMenuFor: null, toast: null});
  };
  const closeHistory = () => {
    update('ui', {historyOpen: false, toast: null});
    historyOpenerRef.current?.focus();
  };
  const openActionSheet = (momentId: string, opener: HTMLElement) => {
    actionOpenerRef.current = opener;
    update('ui', {actionSheetFor: momentId, pointMenuFor: null});
  };
  const closeActionSheet = () => {
    update('ui', {actionSheetFor: null});
    actionOpenerRef.current?.focus();
  };
  const closePointMenu = () => {
    update('ui', {pointMenuFor: null});
    menuOpenerRef.current?.focus();
  };

  // Focus INTO an opening overlay uses focus({preventScroll: true}) —
  // plain .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen (amendment).
  useEffect(() => {
    if (ui.sheet !== 'closed') {
      grabberRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [ui.sheet]);
  useEffect(() => {
    if (ui.historyOpen) {
      historyCloseRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [ui.historyOpen]);
  useEffect(() => {
    // Action sheet: first focus = the safe Cancel row.
    if (ui.actionSheetFor != null) actionCancelRef.current?.focus({preventScroll: true});
  }, [ui.actionSheetFor]);
  useEffect(() => {
    // Anchored point menu: focus its first item (opener was just tapped —
    // the menu is on screen, so no scroll wanted).
    if (ui.pointMenuFor != null) {
      stackRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus({preventScroll: true});
    }
  }, [ui.pointMenuFor]);

  // Escape closes the TOPMOST overlay only: point menu > action sheet >
  // prep/history sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.pointMenuFor != null) closePointMenu();
      else if (ui.actionSheetFor != null) closeActionSheet();
      else if (ui.historyOpen) closeHistory();
      else if (ui.sheet !== 'closed') closePrepSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.pointMenuFor, ui.actionSheetFor, ui.historyOpen, ui.sheet]);

  // SIGNATURE DRAG — pointerdown on an un-haloed dot + 8px threshold →
  // DragGhostChip rides the pointer (transform only); the stack opens a
  // dashed slot at the computed index; pointerup inside the stack rect
  // inserts, anywhere else cancels. Tap (below threshold) falls through
  // to the action-sheet button path.
  const onDotPointerDown = (momentId: string, event: ReactPointerEvent<HTMLButtonElement>) => {
    const moment = moments.find(m => m.id === momentId);
    if (moment == null || moment.pointId != null) return; // haloed dots: tap only
    event.currentTarget.setPointerCapture(event.pointerId);
    pendingDragRef.current = {momentId, startX: event.clientX, startY: event.clientY, active: false};
  };
  const onDotPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const pending = pendingDragRef.current;
    if (pending == null) return;
    if (!pending.active) {
      const dist = Math.hypot(event.clientX - pending.startX, event.clientY - pending.startY);
      if (dist <= 8) return;
      pending.active = true;
      didDragRef.current = true;
    }
    const shellRect = shellRef.current?.getBoundingClientRect();
    if (shellRect == null) return;
    let overIndex: number | null = null;
    const stackRect = stackRef.current?.getBoundingClientRect();
    if (
      stackRect != null &&
      event.clientX >= stackRect.left &&
      event.clientX <= stackRect.right &&
      event.clientY >= stackRect.top - 8 &&
      event.clientY <= stackRect.bottom + 8
    ) {
      overIndex = Math.max(0, Math.min(pointCount, Math.floor((event.clientY - stackRect.top) / 76)));
    }
    update('ui', {
      drag: {momentId: pending.momentId, x: event.clientX - shellRect.left, y: event.clientY - shellRect.top, overIndex},
    });
  };
  const onDotPointerUp = () => {
    const pending = pendingDragRef.current;
    pendingDragRef.current = null;
    if (pending == null || !pending.active) return;
    if (ui.drag?.overIndex != null) {
      addPointFromMoment(pending.momentId, ui.drag.overIndex);
    } else {
      update('ui', {drag: null}); // cancel — ghost fades
    }
  };
  const onDotTap = (momentId: string, opener: HTMLElement) => {
    if (didDragRef.current) {
      didDragRef.current = false; // suppress the click that follows a drag
      return;
    }
    openActionSheet(momentId, opener);
  };

  const scrollToTop = () => {
    wrapRef.current?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'});
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(anySheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const actionMoment = ui.actionSheetFor != null ? moments.find(m => m.id === ui.actionSheetFor) : null;
  const dragMoment = ui.drag != null ? moments.find(m => m.id === ui.drag?.momentId) : null;
  const dropIndex = ui.drag?.overIndex ?? null;
  const editSelected = ui.editSelectedId != null ? points.find(p => p.id === ui.editSelectedId) : null;

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  const toastNode =
    ui.toast != null ? (
      <div className="ttr-anim" style={{...styles.toast, ...(anySheetOpen ? styles.toastStatic : null)}}>
        <span style={styles.toastMsg}>{ui.toast.msg}</span>
        {ui.toast.undo != null ? (
          <>
            <span style={styles.toastRule} aria-hidden />
            <button type="button" className="ttr-btn ttr-focusable" style={styles.toastUndoBtn} onClick={undo}>
              Undo
            </button>
          </>
        ) : null}
      </div>
    ) : null;

  const pointRows = points.map((point, index) => {
    const menuOpen = ui.pointMenuFor === point.id;
    const selected = ui.editSelectedId === point.id;
    return (
      <div key={point.id} style={styles.pointRowWrap}>
        {index > 0 ? <div style={styles.rowDivider} /> : null}
        {dropIndex === index ? (
          <div style={styles.dropSlot} aria-hidden>
            Add here
          </div>
        ) : null}
        <div style={{...styles.pointRow, ...(selected && ui.editMode ? styles.pointRowSelected : null)}}>
          {ui.editMode ? (
            <button
              type="button"
              className="ttr-btn ttr-focusable"
              style={{...styles.editIconBtn, ...styles.removeIconBtn, marginInlineStart: -12}}
              aria-label={\`Remove \${point.text}\`}
              onClick={() => removePoint(point.id)}>
              <Icon icon={MinusCircleIcon} size="md" color="inherit" />
            </button>
          ) : (
            <span style={styles.rankNum} aria-hidden>
              {index + 1}
            </span>
          )}
          {ui.editMode ? (
            <button
              type="button"
              className="ttr-btn ttr-focusable"
              style={{...styles.pointTextWrap, height: 76, justifyContent: 'center'}}
              aria-pressed={selected}
              aria-label={\`Select \${point.text} for the toolbar actions\`}
              onClick={() => update('ui', {editSelectedId: selected ? null : point.id})}>
              <span style={styles.pointPrimary}>{point.text}</span>
              <span style={styles.chipRow}>
                <OriginChip origin={point.origin} />
                {point.carriedOver ? <span style={styles.carryBadge}>Carried over</span> : null}
              </span>
            </button>
          ) : (
            <div style={styles.pointTextWrap}>
              <span style={styles.pointPrimary}>{point.text}</span>
              <span style={styles.chipRow}>
                <OriginChip origin={point.origin} />
                {point.carriedOver ? <span style={styles.carryBadge}>Carried over</span> : null}
              </span>
            </div>
          )}
          {ui.editMode ? (
            <span style={{display: 'flex', flexShrink: 0}}>
              <button
                type="button"
                className="ttr-btn ttr-focusable"
                style={{...styles.editIconBtn, ...(index === 0 ? styles.editIconBtnDisabled : null)}}
                aria-label={\`Reorder: move \${point.text} up\`}
                disabled={index === 0}
                onClick={() => movePoint(point.id, -1)}>
                <Icon icon={ChevronUpIcon} size="md" color="inherit" />
              </button>
              <button
                type="button"
                className="ttr-btn ttr-focusable"
                style={{...styles.editIconBtn, ...(index === points.length - 1 ? styles.editIconBtnDisabled : null)}}
                aria-label={\`Reorder: move \${point.text} down\`}
                disabled={index === points.length - 1}
                onClick={() => movePoint(point.id, 1)}>
                <Icon icon={ChevronDownIcon} size="md" color="inherit" />
              </button>
            </span>
          ) : (
            <button
              type="button"
              className="ttr-btn ttr-focusable"
              style={styles.editIconBtn}
              aria-label={\`Options for \${point.text}\`}
              aria-expanded={menuOpen}
              onClick={event => {
                menuOpenerRef.current = event.currentTarget;
                update('ui', {pointMenuFor: menuOpen ? null : point.id});
              }}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </button>
          )}
        </div>
        {menuOpen ? (
          <div style={styles.pointMenu} role="menu" aria-label={\`Options for \${point.text}\`}>
            <button
              type="button"
              className="ttr-btn ttr-focusable"
              role="menuitem"
              style={styles.menuRow}
              onClick={() => markDiscussed(point.id)}>
              Mark discussed
            </button>
            <div style={styles.asRowDivider} />
            <button
              type="button"
              className="ttr-btn ttr-focusable"
              role="menuitem"
              style={{...styles.menuRow, color: ERROR_PAIR}}
              onClick={() => removePoint(point.id)}>
              Remove point
            </button>
          </div>
        ) : null}
      </div>
    );
  });

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{TETHER_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — flips atomically in edit mode. */}
        <header style={styles.navBar}>
          {ui.editMode ? (
            <>
              <div style={styles.navLeading}>
                <button type="button" className="ttr-btn ttr-focusable" style={styles.navTextBtn} onClick={() => exitEdit(true)}>
                  Cancel
                </button>
              </div>
              <span style={styles.navEditTitle}>Reorder points</span>
              <div style={styles.navTrailing}>
                <button
                  type="button"
                  className="ttr-btn ttr-focusable"
                  style={{...styles.navTextBtn, ...styles.navTextBtnStrong}}
                  onClick={() => exitEdit(false)}>
                  Done
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={styles.navLeading}>
                <button
                  type="button"
                  className="ttr-btn ttr-focusable"
                  style={{...styles.iconBtn, color: 'var(--color-text-primary)'}}
                  aria-label="Tether — scroll to top"
                  onClick={scrollToTop}>
                  <KnotMark size={24} />
                </button>
              </div>
              <span
                style={styles.countdownPill}
                title={\`Today \${TODAY_LABEL} · next session \${NEXT_SESSION}\`}
                aria-label={\`Next session \${NEXT_SESSION}, in 2 days, \${pointCount} points ready\`}>
                {COUNTDOWN} · {pointCount} ready
              </span>
              <div style={styles.navTrailing}>
                <button
                  type="button"
                  className="ttr-btn ttr-focusable"
                  style={styles.iconBtn}
                  aria-label={\`Session history — last session \${LAST_SESSION}\`}
                  onClick={event => openHistory(event.currentTarget)}>
                  <Icon icon={HistoryIcon} size="md" color="inherit" />
                </button>
              </div>
            </>
          )}
        </header>

        <main style={styles.main}>
          <div style={styles.largeTitle}>
            <h1 style={styles.largeTitleText} aria-label={\`Session prep for \${CLIENT}\`}>
              Session prep
            </h1>
          </div>

          {/* YOUR WEEK */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeader}>Your week</h2>
          </div>
          <MoodWeekTimeline
            moments={moments}
            dragMomentId={ui.drag?.momentId ?? null}
            onDotTap={onDotTap}
            onDotPointerDown={onDotPointerDown}
            onDotPointerMove={onDotPointerMove}
            onDotPointerUp={onDotPointerUp}
          />
          <p style={styles.weekCaption}>
            {steadyCount} of {momentTotal} moments steady or better · week trend {trendLabel}
          </p>

          {/* TALKING POINTS */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeader}>Talking points ({pointCount})</h2>
            {ui.editMode || pointCount === 0 ? null : (
              <button type="button" className="ttr-btn ttr-focusable" style={styles.editTextBtn} onClick={enterEdit}>
                Edit
              </button>
            )}
          </div>
          <div ref={stackRef} style={styles.listCard}>
            {pointCount === 0 && dropIndex == null ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyCircle}>
                  <Icon icon={ListPlusIcon} size="lg" color="inherit" />
                </span>
                <h3 style={styles.emptyTitle}>No talking points yet</h3>
                <p style={styles.emptyBody}>Drag a moment from your week, or tap any dot.</p>
                <button
                  type="button"
                  className="ttr-btn ttr-focusable"
                  style={styles.emptyActionBtn}
                  onClick={event => openActionSheet(moments[0].id, event.currentTarget)}>
                  Pick from this week
                </button>
              </div>
            ) : (
              <>
                {pointRows}
                {dropIndex === pointCount ? (
                  <div style={styles.dropSlot} aria-hidden>
                    Add here
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* FROM LAST SESSION */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeader}>From last session</h2>
          </div>
          <div style={styles.listCard}>
            {carryOvers.map((carry, index) => (
              <div key={carry.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <div style={styles.carryRow}>
                  <span style={styles.carryText}>{carry.text}</span>
                  {carry.status === 'pending' ? (
                    <button
                      type="button"
                      className="ttr-btn ttr-focusable"
                      style={styles.carryAddBtn}
                      aria-label={\`Add \${carry.text} to talking points\`}
                      onClick={() => addCarryOver(carry.id)}>
                      Add
                    </button>
                  ) : (
                    <span style={styles.carryStatus}>
                      <span style={styles.carryCheck}>
                        <Icon icon={CheckIcon} size="sm" color="inherit" />
                      </span>
                      {carry.status === 'discussed' ? 'Discussed' : 'In your list'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.bottomSpacer} />
        </main>

        {/* TOAST DOCK — the ONE aria-live region; sticky-in-flow above the
            footer, re-anchored absolute while the shell is scroll-locked.
            No auto-dismiss timers: a toast persists until Undo, the next
            mutation, or a sheet change. */}
        <div
          style={anySheetOpen ? styles.toastFloat : styles.toastAnchor}
          aria-live="polite"
          role="status">
          {toastNode}
        </div>

        {/* STICKY FOOTER ⇄ EDIT TOOLBAR (identical 64px geometry). */}
        {ui.editMode ? (
          <div style={styles.stickyFooter}>
            <button
              type="button"
              className="ttr-btn ttr-focusable"
              style={{
                ...styles.editToolbarBtn,
                ...styles.editToolbarRemove,
                ...(editSelected == null ? styles.editToolbarDisabled : null),
              }}
              disabled={editSelected == null}
              onClick={() => (editSelected != null ? removePoint(editSelected.id) : undefined)}>
              Remove
            </button>
            <button
              type="button"
              className="ttr-btn ttr-focusable"
              style={{
                ...styles.editToolbarBtn,
                ...styles.editToolbarMove,
                ...(editSelected == null ? styles.editToolbarDisabled : null),
              }}
              disabled={editSelected == null}
              onClick={() => (editSelected != null ? moveToTop(editSelected.id) : undefined)}>
              Move to top
            </button>
          </div>
        ) : (
          <div style={styles.stickyFooter}>
            <div style={styles.meterMini}>
              <DensityMeter count={previewCount} variant="mini" />
              <span style={styles.meterLabel}>
                {previewCount} of {TOPIC_BUDGET}
              </span>
            </div>
            <button
              type="button"
              className="ttr-btn ttr-focusable"
              style={{...styles.footerCta, ...(pointCount === 0 ? styles.footerCtaDisabled : null)}}
              disabled={pointCount === 0}
              onClick={event => openPrepSheet(event.currentTarget)}>
              Open prep card
            </button>
          </div>
        )}

        {/* Click-away layer for the anchored point menu. */}
        {ui.pointMenuFor != null ? (
          <div
            style={{position: 'absolute', inset: 0, zIndex: 29}}
            aria-hidden
            onClick={closePointMenu}
          />
        ) : null}

        {/* DOT ACTION SHEET — the mandatory non-gesture path. */}
        {actionMoment != null ? (
          <>
            <div style={styles.sheetScrim} aria-hidden onClick={closeActionSheet} />
            <div
              ref={actionSheetRef}
              className="ttr-sheet-in"
              style={styles.actionSheetWrap}
              role="dialog"
              aria-modal
              aria-labelledby="ttr-as-header"
              onKeyDown={event => trapTabKey(event, actionSheetRef.current)}>
              <div style={styles.asCard}>
                <div id="ttr-as-header" style={styles.asHeader}>
                  {DAY_SHORT[actionMoment.day]} {actionMoment.time} · {actionMoment.tag} · “{actionMoment.note}”
                </div>
                {/* Destructive row is always LAST (action-sheet contract). */}
                {actionMoment.pointId == null ? (
                  <>
                    <button
                      type="button"
                      className="ttr-btn ttr-focusable"
                      style={styles.asRow}
                      onClick={() => {
                        addPointFromMoment(actionMoment.id, null);
                        actionOpenerRef.current?.focus();
                      }}>
                      Add to talking points
                    </button>
                    <div style={styles.asRowDivider} />
                  </>
                ) : null}
                <button
                  type="button"
                  className="ttr-btn ttr-focusable"
                  style={styles.asRow}
                  onClick={() => {
                    update('ui', {
                      actionSheetFor: null,
                      toast: makeToast(\`\${DAY_FULL[actionMoment.day]} \${actionMoment.time} — “\${actionMoment.note}”\`),
                    });
                    actionOpenerRef.current?.focus();
                  }}>
                  View note
                </button>
                {actionMoment.pointId != null ? (
                  <>
                    <div style={styles.asRowDivider} />
                    <button
                      type="button"
                      className="ttr-btn ttr-focusable"
                      style={{...styles.asRow, ...styles.asDestructive}}
                      onClick={() => {
                        removePoint(actionMoment.pointId as string);
                        actionOpenerRef.current?.focus();
                      }}>
                      Remove from talking points
                    </button>
                  </>
                ) : null}
              </div>
              <div style={styles.asCard}>
                <button
                  type="button"
                  ref={actionCancelRef}
                  className="ttr-btn ttr-focusable"
                  style={{...styles.asRow, ...styles.asCancel}}
                  onClick={closeActionSheet}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* PREP SHEET — two detents; grabber click toggles. */}
        {ui.sheet !== 'closed' ? (
          <>
            <div style={styles.sheetScrim} aria-hidden onClick={closePrepSheet} />
            <div
              ref={sheetRef}
              className="ttr-sheet-in"
              style={{...styles.sheet, ...(ui.sheet === 'large' ? styles.sheetLarge : styles.sheetMedium)}}
              role="dialog"
              aria-modal
              aria-labelledby="ttr-prep-title"
              onKeyDown={event => trapTabKey(event, sheetRef.current)}>
              <div style={styles.grabberZone}>
                <button
                  type="button"
                  ref={grabberRef}
                  className="ttr-btn ttr-focusable"
                  style={{width: 60, height: 24, display: 'grid', placeItems: 'center', borderRadius: 8}}
                  aria-label={ui.sheet === 'medium' ? 'Resize sheet — expand' : 'Resize sheet — collapse'}
                  onClick={toggleDetent}>
                  <span style={styles.grabberPill} aria-hidden />
                </button>
              </div>
              <div style={styles.sheetHeader}>
                <span />
                <h2 id="ttr-prep-title" style={styles.sheetTitle}>
                  Prep card · {previewCount} {previewCount === 1 ? 'point' : 'points'}
                </h2>
                <button
                  type="button"
                  className="ttr-btn ttr-focusable"
                  style={styles.iconBtn}
                  aria-label="Close prep card"
                  onClick={closePrepSheet}>
                  <Icon icon={XIcon} size="md" color="inherit" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                {ui.sheet === 'medium' ? (
                  points.map((point, index) => (
                    <div key={point.id} style={styles.compactRow}>
                      <span style={styles.compactIndex}>{index + 1}</span>
                      <span style={styles.compactText}>{point.text}</span>
                      <span style={styles.compactMeta}>{originChipText(point.origin)}</span>
                    </div>
                  ))
                ) : (
                  <PrepCardPreview points={points} count={previewCount} />
                )}
              </div>
              {ui.sheet === 'large' ? (
                <div style={styles.sheetFooter}>
                  <button
                    type="button"
                    className="ttr-btn ttr-focusable"
                    style={styles.shareBtn}
                    onClick={() => update('ui', {toast: makeToast('Card copied to share sheet')})}>
                    Share card
                  </button>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {/* HISTORY SHEET — medium only. */}
        {ui.historyOpen ? (
          <>
            <div style={styles.sheetScrim} aria-hidden onClick={closeHistory} />
            <div
              className="ttr-sheet-in"
              style={{...styles.sheet, ...styles.sheetMedium}}
              role="dialog"
              aria-modal
              aria-labelledby="ttr-history-title"
              onKeyDown={event => trapTabKey(event, event.currentTarget)}>
              <div style={{...styles.sheetHeader, marginTop: 8}}>
                <span />
                <h2 id="ttr-history-title" style={styles.sheetTitle}>
                  Jun 27 session
                </h2>
                <button
                  type="button"
                  ref={historyCloseRef}
                  className="ttr-btn ttr-focusable"
                  style={styles.iconBtn}
                  aria-label="Close session history"
                  onClick={closeHistory}>
                  <Icon icon={XIcon} size="md" color="inherit" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                <div style={styles.historySummaryRow}>
                  {HISTORY_DISCUSSED.length + HISTORY_CARRIED.length} topics · {HISTORY_DISCUSSED.length} resolved ·{' '}
                  {HISTORY_CARRIED.length} carried over
                </div>
                {HISTORY_DISCUSSED.map(topic => (
                  <div key={topic} style={styles.historyRow}>
                    <span style={styles.carryCheck}>
                      <Icon icon={CheckIcon} size="sm" color="inherit" />
                    </span>
                    <div style={styles.historyText}>
                      <span style={styles.historyPrimary}>{topic}</span>
                      <span style={styles.historySecondary}>Discussed {LAST_SESSION}</span>
                    </div>
                  </div>
                ))}
                {HISTORY_CARRIED.map(topic => (
                  <div key={topic} style={styles.historyRow}>
                    <span style={styles.carryBadge}>Carried over</span>
                    <div style={styles.historyText}>
                      <span style={styles.historyPrimary}>{topic}</span>
                    </div>
                  </div>
                ))}
                {weekDiscussed.length > 0 ? (
                  <>
                    <div style={styles.historySection}>This week</div>
                    {weekDiscussed.map(point => (
                      <div key={point.id} style={styles.historyRow}>
                        <span style={styles.carryCheck}>
                          <Icon icon={CheckIcon} size="sm" color="inherit" />
                        </span>
                        <div style={styles.historyText}>
                          <span style={styles.historyPrimary}>{point.text}</span>
                          <span style={styles.historySecondary}>Marked discussed while prepping</span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : null}
              </div>
            </div>
          </>
        ) : null}

        {/* DRAG GHOST CHIP — transform-only, above everything. */}
        {ui.drag != null && dragMoment != null ? (
          <span
            style={{
              ...styles.ghostChip,
              transform: \`translate(\${ui.drag.x - 20}px, \${ui.drag.y - 40}px)\`,
            }}
            aria-hidden>
            <span style={{...styles.originDot, position: 'static', background: TAG_COLOR[dragMoment.tag]}} />
            {DAY_SHORT[dragMoment.day]} · {dragMoment.tag}
          </span>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};