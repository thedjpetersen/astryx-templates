// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kindling "Bonfire Night" plan
 *   thread: 8 attendees (p1 You/Alex Rivera none, p2 Maya in, p3 Jordan in,
 *   p4 Sam in, p5 Priya maybe, p6 Leo none, p7 Tess out, p8 Noah none —
 *   3+1+1+3 = 8 ✓, meter reads '3/6 in' at rest); event Sat Jul 11 · 7:00 PM
 *   · Ember Beach Pit · $15 each · threshold 6; a 4-slot availability poll
 *   (Fri7=2, Sat5=2, Sat8=4, Sun2=2 — cell sum 10 = per-person picks
 *   2+3+1+3+1 = 10 ✓); 12 seeded messages (1 system, 9 text, 1 rsvpBubble,
 *   1 pollBubble) with fixed timestamp strings. No Date.now(), no
 *   Math.random(), no network media.
 * @output Kindling — Event RSVP Chat: a 390px MOBILE group-chat-native
 *   event planner where the thread IS the event page. NavBar (flame mark ·
 *   'Bonfire Night' + date pill · RefreshCw) over a sticky 64px QuorumMeter
 *   (8px track, brand fill toward the 'Book' notch at 6, one 20px avatar
 *   tick per 'in'), a full-bleed chat stream whose rsvpBubble embeds a live
 *   In/Maybe/Out RsvpChipRow and whose pollBubble embeds a 2×2
 *   TimeGridPoll heat grid, a sticky 64px composer, a sticky toastDock, and
 *   a two-detent Plan sheet (summary card · duplicate RsvpChipRow · Book
 *   button; large detent adds the attendee list + poll grid). SIGNATURE:
 *   one attendee store owns every surface — tap 'In' on the bubble chips
 *   and your tick lands on the meter at slot 4, the header flips '3/6 in' →
 *   '4/6 in', the sheet's duplicate chips agree, and the Undo toast opens;
 *   RefreshCw deterministically brings Leo + Noah in (6/6), appends the
 *   'Quorum reached' system message, and unlocks the sheet's Book button.
 * @position Page template; emitted by `astryx template mobile-event-rsvp-chat`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at y=0
 *   is the first pixel). All overlays (scrim, sheet, toast-in-lock) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   Plan sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and the toastDock switches from sticky-in-flow to shell-absolute
 *   bottom:76 (sticky pins to the document bottom otherwise — binding
 *   amendment). The stage clips to --radius-container; shell paints
 *   full-bleed square. navBar bottom hairline ALWAYS ON (no scroll wiring;
 *   noted per contract).
 * Container policy: full-bleed conversation stream (no listCard in the
 *   chat body — feed exception per the mobile density law); inset-grouped
 *   listCards only inside the Plan sheet. No desktop frames, no asides.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Kindling ember — 'light-dark(#B96604, #F39A3B)'); raw
 *   spec hex #E8850C appears ONLY in the decorative flame-mark SVG
 *   (aria-hidden, accents in --color-text-primary). Meter track, unchecked
 *   chip boundaries, and the max poll-heat cell each carry explicit
 *   light-dark() pairs with ≥3:1 contrast math against their ACTUAL
 *   surfaces (amendment: hairline/muted tokens are passive-separator-only).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px gaps
 *   between message groups · 24px around day separators · 8px chip gaps;
 *   navBar 52px sticky top z20 (paddingInline 8, grid '1fr auto 1fr', title
 *   17/600 ellipsized max 200, 24px date pill); quorumHeader 64px sticky
 *   top:52 z15 (13/600 QUORUM overline + '3/6 in' 17/600 tabular over an
 *   8px track — at 390 the padded content is 358, the track 348 with 5px
 *   insets, 6 slots of exactly 58px: 6×58 = 348 ✓; fills 3→174, 4→232,
 *   6→348, each a 58 multiple ✓ — authored as percentages, 390 is the
 *   reference); bubbles maxWidth min(280px, 82%), padding '10px 12px',
 *   16/400 body + 13/400 meta 4px below, others lead a 28px avatar (8px
 *   gap); RsvpChipRow in a 280 bubble: content 256, chips (256−16)/3 = 80
 *   each (3×80+2×8 = 256 ✓), 36px visual in a 44px hit; TimeGridPoll 2×2
 *   of 124×64 cells, 8px gaps (2×124+8 = 256 ✓); composer 64px sticky
 *   bottom z20 (36px input + 44×44 send, 8px gap); toastDock sticky
 *   bottom:76 (64 composer + 12) z30, toast min-height 48; sheet detents
 *   55% / calc(100% − 56px), 24px grabber zone (36×5 pill), 52px header,
 *   44px utility rows / 60px attendee rows / 48px Book + sheet chips.
 *   TYPE (Figtree via --font-family-body): 17/600 nav+sheet titles ·
 *   16/400 body floor · 13/400-600 meta+overlines · 11/500 pills+captions;
 *   nothing under 11px; tabular-nums on every count. Touch: every target
 *   ≥44×44 with ≥8px clearance or merged full-row; every gesture has a
 *   visible button path (Plan pill + grabber button + X for the sheet;
 *   explicit RefreshCw, no pull-to-refresh; no swipe rows).
 *
 * Responsive contract:
 * - Fluid 320–430, zero horizontal overflow, NO width:390 literals: meter
 *   track = calc(100% − 10px), fill = (inCount/6)·100%, ticks at
 *   ordinal·(100/6)% (percent, not px); bubbles min(280px, 82%); poll cells
 *   gridTemplateColumns '1fr 1fr' with the avatar stack capped at 2 + '+N'
 *   at ALL widths for determinism; chips flex:1; composer input flex:1
 *   (320: 320−32−44−8 = 236 ≥ 160 ✓); the date pill ellipsizes before the
 *   title does. Sheet detents are percentages of the locked shell.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — chat anatomy is deliberately phone
 *   geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  CalendarIcon,
  CircleDollarSignIcon,
  MapPinIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Kindling ember). #B96604 on #FFFFFF ≈
// 4.6:1 (passes 4.5:1 for the 13px/600 chip label rendered in it);
// #F39A3B on the dark body (~#1A1A1A) ≈ 7.2:1. The spec's raw #E8850C
// appears ONLY inside the decorative flame-mark SVG below.
const BRAND_ACCENT = 'light-dark(#B96604, #F39A3B)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #B96604 ≈ 4.6:1 ✓.
// Dark: #1A1A1A on #F39A3B ≈ 8:1 ✓ (white on #F39A3B fails ~1.9:1).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #1A1A1A)';
// Brand washes: self-bubble tint (14% into the card surface — light ≈
// #F6E9DB with text-primary ≈ 13:1 ✓; dark ≈ #3B301F with near-white
// text ≈ 9:1 ✓) and the 12% pill tint behind the Plan pill label.
const BRAND_TINT_14 = `color-mix(in srgb, ${BRAND_ACCENT} 14%, var(--color-background-card))`;
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// METER TRACK — a meaningful rest-state fill (the unfilled quorum run),
// NOT a passive separator, so it gets an explicit pair at ≥3:1 against
// its actual surface (the blurred body-colored quorumHeader). Light:
// #8C8578 vs #FFFFFF ≈ 3.4:1 ✓. Dark: #6F6A61 vs #1A1A1A ≈ 3.3:1 ✓.
const METER_TRACK = 'light-dark(#8C8578, #6F6A61)';
// CONTROL EDGE — unchecked/unselected chip boundaries (interactive rest
// boundaries need ≥3:1 vs their surface, the card-colored bubble).
// Light: #767069 vs #FFFFFF card ≈ 4.5:1 ✓. Dark: #9A948C vs the dark
// card (~#262626) ≈ 5.4:1 ✓.
const CONTROL_EDGE = 'light-dark(#767069, #9A948C)';
// Maybe amber (selected-Maybe outline + label, poll caption accents).
// #9A6700 on the white card ≈ 4.9:1 ✓; #E8B93C on the dark card ≈ 9.3:1 ✓
// — both also clear the 3:1 boundary bar for the 2px outline.
const MAYBE_AMBER = 'light-dark(#9A6700, #E8B93C)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Decorative-only: the spec's raw brand hex, quarantined to the flame SVG.
const RAW_FLAME = '#E8850C';

// Deterministic avatar fills keyed by fixture hue. White 11px/600
// initials: hsl(H 48% 36%) luminance ≈ 0.11 → white ≈ 5.9:1 ✓ (both
// schemes use the same fill; the dark side lifts lightness for the ring).
function avatarFill(hue: number): string {
  return `light-dark(hsl(${hue} 48% 36%), hsl(${hue} 42% 40%))`;
}

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden h1,
// tick/sheet entry animations, reduced-motion guard. Transitions animate
// transform/opacity only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const KINDLING_CSS = `
.knd-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.knd-btn:disabled { cursor: default; }
.knd-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.knd-anim { transition: transform 240ms ease, opacity 240ms ease; }
.knd-fill { transition: transform 240ms ease; }
@keyframes knd-tick-in {
  from { transform: translate(-50%, 0) scale(0.4); opacity: 0; }
  to { transform: translate(-50%, 0) scale(1); opacity: 1; }
}
.knd-tick-in { animation: knd-tick-in 240ms ease; }
@keyframes knd-chip-spring {
  from { transform: scale(0.96); }
  to { transform: none; }
}
.knd-chip-spring { animation: knd-chip-spring 180ms ease; }
@keyframes knd-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.knd-sheet-in { animation: knd-sheet-in 240ms ease; }
.knd-vh {
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
  .knd-anim, .knd-fill { transition: none; }
  .knd-tick-in, .knd-chip-spring, .knd-sheet-in { animation: none; }
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
  // Scroll lock while the Plan sheet is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; hairline + blur ALWAYS ON (no scroll
  // wiring; noted per contract).
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
  navCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexShrink: 0,
  },
  // Date pill — 24px, 11/500, muted fill; ellipsizes BEFORE the title does
  // at 320 (stress fixture 8): minWidth 0 + shrink while the title holds.
  datePill: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // QUORUM HEADER — 64px sticky top:52 z15, same blur surface as navBar.
  quorumHeader: {
    position: 'sticky',
    top: 52,
    zIndex: 15,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  quorumLeft: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 8,
  },
  quorumRow1: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    lineHeight: 1,
  },
  quorumOverline: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  quorumCount: {
    marginLeft: 'auto',
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Track zone — position:relative strip tall enough for the 20px ticks
  // that overlap the 8px track at top:-6 (span −6…14).
  meterZone: {
    position: 'relative',
    height: 16,
    marginInline: 5, // 5px inset each side → 348 track at 390 (358 − 10)
  },
  meterTrack: {
    position: 'absolute',
    insetInline: 0,
    top: 2,
    height: 8,
    borderRadius: 999, // 4px effective on 8px height per cornerMap
    background: METER_TRACK,
    overflow: 'hidden',
  },
  // Fill animates transform-only: full-width bar scaled by inCount/6.
  meterFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    background: BRAND_ACCENT,
    transformOrigin: 'left center',
  },
  // 20px avatar tick centered at ordinal·(100/6)%, top:-6 vs the track →
  // top:-4 in the 16px zone; 2px body-colored ring separates it from the
  // fill. Ticks are decorative (aria-hidden) — identity announces via the
  // one toastDock.
  meterTick: {
    position: 'absolute',
    top: -4,
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: '#FFFFFF',
    boxShadow: '0 0 0 2px var(--color-background-body)',
    transform: 'translate(-50%, 0)',
  },
  // Threshold notch — 2×16 brand bar at 100% with the 'Book' caption.
  notch: {
    position: 'absolute',
    left: '100%',
    top: -4,
    width: 2,
    height: 16,
    background: BRAND_ACCENT,
    transform: 'translateX(-50%)',
  },
  notchCaption: {
    position: 'absolute',
    left: '100%',
    top: 14,
    transform: 'translateX(-50%)',
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1,
    color: 'var(--color-text-secondary)',
  },
  // Plan pill — the sheet's visible non-gesture opener, 36px in the
  // 64px header (vertically centered; ≥8px clearance).
  planPill: {
    height: 36,
    paddingInline: 14,
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  // CHAT BODY — full-bleed conversation stream; the PAGE scrolls.
  chatBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 16,
  },
  daySeparator: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    marginBlock: 12, // + the 12px stream gap = 24px around separators
  },
  systemMsg: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    paddingInline: 24,
  },
  msgGroupOther: {display: 'flex', alignItems: 'flex-end', gap: 8},
  msgGroupSelf: {display: 'flex', justifyContent: 'flex-end'},
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  // flex:1 + alignItems flex-start: text bubbles shrink-to-fit under the
  // maxWidth cap, while widget bubbles (rsvp/poll) take an explicit
  // min(280px, 82%) width so their chip/cell rows never crush.
  bubbleStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    minWidth: 0,
    flex: 1,
  },
  bubbleWide: {width: 'min(280px, 82%)'},
  senderName: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    paddingInline: 4,
  },
  bubble: {
    maxWidth: 'min(280px, 82%)',
    padding: '10px 12px',
    borderRadius: '16px 16px 16px 4px', // tail bottom-leading for others
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    fontSize: 16,
    lineHeight: 1.35,
    overflowWrap: 'anywhere',
  },
  bubbleSelf: {
    maxWidth: 'min(280px, 82%)',
    padding: '10px 12px',
    borderRadius: '16px 16px 4px 16px', // tail bottom-trailing for self
    background: BRAND_TINT_14,
    border: '1px solid var(--color-border)',
    fontSize: 16,
    lineHeight: 1.35,
    overflowWrap: 'anywhere',
  },
  bubbleMeta: {
    marginTop: 4,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  bubbleTitle: {fontSize: 16, fontWeight: 600, marginBottom: 8},
  // RSVP CHIPS — bubble size: 44px hit rows holding a 36px visual pill;
  // sheet size: 48px chips (hit = visual).
  chipRow: {display: 'flex', gap: 8},
  chipBtnBubble: {flex: 1, minWidth: 0, height: 44, display: 'grid', alignItems: 'center'},
  chipBtnSheet: {flex: 1, minWidth: 0, height: 48, display: 'grid', alignItems: 'stretch'},
  chipVisual: {
    height: 36,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    border: `1px solid ${CONTROL_EDGE}`,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  chipVisualSheet: {
    height: 48,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    border: `1px solid ${CONTROL_EDGE}`,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  chipIn: {
    background: BRAND_ACCENT,
    border: `1px solid ${BRAND_ACCENT}`,
    color: BRAND_FILL_TEXT,
  },
  chipMaybe: {
    border: `2px solid ${MAYBE_AMBER}`,
    color: MAYBE_AMBER,
  },
  chipOut: {
    background: 'var(--color-background-muted)',
    border: `2px solid ${CONTROL_EDGE}`,
    color: 'var(--color-text-primary)',
  },
  // TIME GRID POLL — 2×2 of 1fr cells (124×64 at the 390 reference).
  pollGrid: {display: 'flex', flexDirection: 'column', gap: 8},
  pollRow: {display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8},
  pollCell: {
    height: 64,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
    paddingInline: 10,
    minWidth: 0,
  },
  pollCellPicked: {boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`},
  pollCellLabel: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pollCellMetaRow: {display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap', minWidth: 0},
  pollCellCount: {
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  pollAvatarStack: {display: 'flex', alignItems: 'center', flexShrink: 0},
  pollMiniAvatar: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    boxShadow: '0 0 0 1.5px var(--color-background-card)',
    marginLeft: -4,
    flexShrink: 0,
  },
  pollOverflowChip: {
    marginLeft: 2,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // COMPOSER — sticky bottom z20, 64px, blur + top hairline.
  composer: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
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
    height: 36,
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-background-muted)',
    paddingInline: 12,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    flexShrink: 0,
  },
  sendBtnDisabled: {opacity: 0.4},
  // TOAST DOCK — sticky in flow above the composer (bottom 76 = 64 + 12);
  // flips to shell-absolute while the sheet locks the shell (amendment).
  toastDockSticky: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 42, // above the sheet (z41) so Undo stays reachable
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
  toastText: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndoBtn: {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
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
  sheetBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto', // the ONE legal inner scroller
    paddingBottom: 24,
  },
  // Inset-grouped listCard (sheet only — the chat stream is full-bleed).
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
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
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  utilityRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  utilityRowIcon: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  utilityRowLabel: {flex: 1, minWidth: 0, fontSize: 16},
  utilityRowValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '60%',
  },
  sheetChipBlock: {paddingInline: 16},
  bookBlock: {paddingInline: 16, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8},
  bookBtn: {
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
  // Disabled Book = secondary at 40% opacity + explanatory caption.
  bookBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    opacity: 0.4,
  },
  bookCaption: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  attendeeRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: '#FFFFFF',
  },
  attendeeText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  attendeePrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  attendeeSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 24,
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    flexShrink: 0,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  statusDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  sheetPollBlock: {paddingInline: 16, paddingTop: 4},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual-natured fields, cross-checked aggregates.
// CROSS-CHECK LEDGER (verified by hand): rsvp census in=3 (p2,p3,p4),
// maybe=1 (p5), out=1 (p7), none=3 (p1,p6,p8) → 3+1+1+3 = 8 ✓; meter reads
// '3/6 in' at rest. Poll cells: Fri7 = p2+p5 = 2; Sat5 = p3+p5 = 2; Sat8 =
// p2+p3+p4+p5 = 4 (heat max); Sun2 = p3+p6 = 2; cell sum 2+2+4+2 = 10 =
// per-person picks 2+3+1+3+1 = 10 ✓. Refresh path: 3 in + you = 4, +Leo
// +Noah = 6 = threshold ✓. Seeded thread: 1 system + 9 text + 1 rsvpBubble
// + 1 pollBubble = 12 messages ✓.
// ---------------------------------------------------------------------------

const YOU = 'p1';
const THRESHOLD = 6;

type Rsvp = 'in' | 'maybe' | 'out' | 'none';

interface Attendee {
  id: string;
  name: string;
  /** Sheet-row display name — p5's long variant is the 60px-row
   *  truncation stress (stress fixture 3). */
  sheetName: string;
  initials: string;
  hue: number;
}

const ATTENDEES: Attendee[] = [
  {id: 'p1', name: 'Alex Rivera', sheetName: 'Alex Rivera (you)', initials: 'AR', hue: 16},
  {id: 'p2', name: 'Maya Chen', sheetName: 'Maya Chen', initials: 'MC', hue: 262},
  {id: 'p3', name: 'Jordan Blake', sheetName: 'Jordan Blake', initials: 'JB', hue: 205},
  {id: 'p4', name: 'Sam Ortiz', sheetName: 'Sam Ortiz', initials: 'SO', hue: 145},
  {id: 'p5', name: 'Priya Nair', sheetName: 'Priyadarshini Nair-Krishnamurthy', initials: 'PN', hue: 320},
  {id: 'p6', name: 'Leo Fontaine', sheetName: 'Leo Fontaine', initials: 'LF', hue: 45},
  {id: 'p7', name: 'Tess Whitaker', sheetName: 'Tess Whitaker', initials: 'TW', hue: 355},
  {id: 'p8', name: 'Noah Kim', sheetName: 'Noah Kim', initials: 'NK', hue: 95},
];

const ATTENDEES_BY_ID: Record<string, Attendee> = Object.fromEntries(
  ATTENDEES.map(person => [person.id, person]),
);

// Census: in=3, maybe=1, out=1, none=3 → 8 ✓ (ledger above).
const INITIAL_RSVP: Record<string, Rsvp> = {
  p1: 'none',
  p2: 'in',
  p3: 'in',
  p4: 'in',
  p5: 'maybe',
  p6: 'none',
  p7: 'out',
  p8: 'none',
};

// Join order of the 'in' set — ticks NEVER reorder: new joins append, so
// existing avatar ticks hold their slots (you land at slot 4, Leo 5, Noah 6).
const INITIAL_IN_ORDER = ['p2', 'p3', 'p4'];

const EVENT = {
  title: 'Bonfire Night',
  datePill: 'Sat Jul 11',
  whenLabel: 'Sat Jul 11, 7:00 PM',
  whereLabel: 'Ember Beach Pit',
  costLabel: '$15 each',
};

interface PollSlot {
  id: string;
  label: string;
}

const SLOTS: PollSlot[] = [
  {id: 'fri7', label: 'Fri 7 PM'},
  {id: 'sat5', label: 'Sat 5 PM'},
  {id: 'sat8', label: 'Sat 8 PM'},
  {id: 'sun2', label: 'Sun 2 PM'},
];

// Availability of everyone EXCEPT you — your picks live in the store's
// yourSlots and counts re-derive (never stored per-cell).
const AVAILABILITY: Record<string, string[]> = {
  p2: ['fri7', 'sat8'],
  p3: ['sat5', 'sat8', 'sun2'],
  p4: ['sat8'],
  p5: ['fri7', 'sat5', 'sat8'],
  p6: ['sun2'],
};

type MessageKind = 'system' | 'text' | 'rsvp' | 'poll';

interface Message {
  id: string;
  kind: MessageKind;
  from: string | null; // null for system
  text: string;
  time: string; // fixed string — no Date.now()
}

// 12 seeded messages: 1 system + 9 text + 1 rsvpBubble + 1 pollBubble ✓.
const SEED_MESSAGES: Message[] = [
  {id: 'm01', kind: 'system', from: null, text: 'Maya started planning Bonfire Night', time: '6:31 PM'},
  {id: 'm02', kind: 'text', from: 'p2', text: 'ok WHO is actually coming this time', time: '6:42 PM'},
  {id: 'm03', kind: 'text', from: 'p3', text: 'in if we do saturday', time: '6:44 PM'},
  {id: 'm04', kind: 'text', from: 'p7', text: "out, I'm at a wedding 😭", time: '6:45 PM'},
  {id: 'm05', kind: 'text', from: 'p4', text: 'sat works, I can bring the cooler', time: '6:47 PM'},
  {id: 'm06', kind: 'rsvp', from: 'p2', text: 'Lock it in ↓', time: '6:48 PM'},
  {id: 'm07', kind: 'text', from: 'p5', text: 'maybe! depends on my shift ending by 6', time: '6:52 PM'},
  {id: 'm08', kind: 'poll', from: 'p2', text: 'When works?', time: '6:55 PM'},
  {id: 'm09', kind: 'text', from: 'p3', text: "sat 8 has my vote, tide's out by then", time: '6:58 PM'},
  {id: 'm10', kind: 'text', from: 'p6', text: "lurking til I check flights, don't @ me", time: '7:03 PM'},
  {id: 'm11', kind: 'text', from: 'p2', text: 'firewood run = me and Sam. someone claim marshmallows', time: '7:06 PM'},
  {id: 'm12', kind: 'text', from: 'p8', text: 'I claim marshmallows if I come 👀', time: '7:10 PM'},
];

const BOOKED_MSG_ID = 'm-booked';

// ---------------------------------------------------------------------------
// ONE STATE OWNER — everything derives from this single store: the meter,
// every RsvpChipRow instance in scrollback AND in the sheet, the poll cells,
// the Book button, and the toast. quorumAnnounced records that the system
// message was appended (history, not derived — stress fixture 1: dropping
// back below 6 re-disables Book but never deletes the message).
// ---------------------------------------------------------------------------

interface ToastUndoRsvp {
  kind: 'rsvp';
  prior: Rsvp;
  priorInOrder: string[];
}

interface ToastUndoBook {
  kind: 'book';
}

interface ToastState {
  seq: number;
  text: string;
  undo: ToastUndoRsvp | ToastUndoBook | null;
}

interface KindlingStore {
  rsvpById: Record<string, Rsvp>;
  inOrder: string[];
  yourSlots: string[];
  messages: Message[];
  draft: string;
  sheetOpen: boolean;
  detent: 'medium' | 'large';
  toast: ToastState | null;
  refreshed: boolean;
  quorumAnnounced: boolean;
  booked: boolean;
}

const INITIAL_STORE: KindlingStore = {
  rsvpById: INITIAL_RSVP,
  inOrder: INITIAL_IN_ORDER,
  yourSlots: [],
  messages: SEED_MESSAGES,
  draft: '',
  sheetOpen: false,
  detent: 'medium',
  toast: null,
  refreshed: false,
  quorumAnnounced: false,
  booked: false,
};

/** Derived poll count for a slot — others' fixed availability + your live
 *  pick. Never stored per-cell (stress fixture 4 depends on this). */
function slotCount(slotId: string, yourSlots: string[]): number {
  let count = 0;
  for (const person of ATTENDEES) {
    if (person.id === YOU) continue;
    if (AVAILABILITY[person.id]?.includes(slotId)) count += 1;
  }
  return count + (yourSlots.includes(slotId) ? 1 : 0);
}

/** People free for a slot, you last (mini-avatar stacks read join order). */
function slotPeople(slotId: string, yourSlots: string[]): Attendee[] {
  const people = ATTENDEES.filter(
    person => person.id !== YOU && AVAILABILITY[person.id]?.includes(slotId) === true,
  );
  if (yourSlots.includes(slotId)) people.push(ATTENDEES_BY_ID[YOU]);
  return people;
}

// ---------------------------------------------------------------------------
// CONTAINER-WIDTH HOOK (grid-feeder-console pattern) — the desktop stage is
// ~1045px inside a 1440px window, so only a ResizeObserver on the wrapper
// can tell the 390px mobile stage from the desktop stage.
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

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — the sheet traps focus while open; Escape closes the
// topmost overlay only; focus restores to the opener on every close path.
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
// FLAME MARK — 28px Kindling glyph in the 44×44 nav slot. Decorative
// (aria-hidden); the ONLY place the raw spec hex #E8850C appears. Accents
// use --color-text-primary per the color policy.
// ---------------------------------------------------------------------------

function FlameMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        <path
          d="M14 3c.6 3.4-1.2 5.2-3.2 7.2C8.7 12.3 7 14.4 7 17.4A7 7 0 0 0 21 17.4c0-2.6-1.3-4.4-2.8-6.1C16.4 9.2 14.5 7 14 3Z"
          fill={RAW_FLAME}
        />
        <path
          d="M14 14.6c.3 1.6-.6 2.4-1.5 3.3-.8.8-1.5 1.6-1.5 2.9a3 3 0 0 0 6 0c0-1.2-.6-2-1.3-2.8-.8-.9-1.5-1.9-1.7-3.4Z"
          fill="var(--color-background-body)"
          stroke="var(--color-text-primary)"
          strokeWidth="0.75"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// QUORUM METER — 8px track filling toward '6 needed to book'. Fill width =
// inCount/6 of the track via transform-only scaleX (240ms, instant under
// reduced motion); one 20px avatar tick per 'in' attendee snapped at
// ordinal·(100/6)% (58px slots at the 390 reference: 58/116/174/232/290/348,
// 6×58 = 348 ✓; fills 3→174, 4→232, 6→348 ✓). Ticks appear/disappear (they
// never slide — join order appends, so ordinals are stable). role='meter'
// carries the value; ticks are decorative (aria-hidden) — identity is
// announced via the one toastDock on change.
// ---------------------------------------------------------------------------

interface QuorumMeterProps {
  inOrder: string[];
  reducedMotion: boolean;
}

function QuorumMeter({inOrder, reducedMotion}: QuorumMeterProps) {
  const inCount = inOrder.length;
  return (
    <div style={styles.meterZone}>
      <div
        style={styles.meterTrack}
        role="meter"
        aria-valuenow={inCount}
        aria-valuemin={0}
        aria-valuemax={THRESHOLD}
        aria-valuetext={`${inCount} of ${THRESHOLD} in`}
        aria-label="Quorum">
        <div
          className="knd-fill"
          style={{...styles.meterFill, transform: `scaleX(${inCount / THRESHOLD})`}}
        />
      </div>
      {inOrder.map((id, index) => {
        const person = ATTENDEES_BY_ID[id];
        return (
          <span
            key={id}
            className={reducedMotion ? undefined : 'knd-tick-in'}
            style={{
              ...styles.meterTick,
              left: `${(index + 1) * (100 / THRESHOLD)}%`,
              background: avatarFill(person.hue),
            }}
            aria-hidden>
            {person.initials}
          </span>
        );
      })}
      <span style={styles.notch} aria-hidden />
      <span style={styles.notchCaption} aria-hidden>
        Book
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RSVP CHIP ROW — radiogroup of three REAL buttons with arrow-key movement.
// Bubble size: 36px visual pills inside 44px-tall hits (the ≥44px rule via
// the merge clause — 4px block padding each side); sheet size: 48px chips.
// Writes to the ONE store via onChange — never local message state; every
// instance renders from the store, so scrollback and sheet always agree.
// ---------------------------------------------------------------------------

const RSVP_OPTIONS: Array<{value: Rsvp; label: string}> = [
  {value: 'in', label: 'In'},
  {value: 'maybe', label: 'Maybe'},
  {value: 'out', label: 'Out'},
];

interface RsvpChipRowProps {
  value: Rsvp;
  onChange: (next: Rsvp) => void;
  size: 'bubble' | 'sheet';
  reducedMotion: boolean;
}

function RsvpChipRow({value, onChange, size, reducedMotion}: RsvpChipRowProps) {
  const selectedIndex = RSVP_OPTIONS.findIndex(option => option.value === value);
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const from = selectedIndex >= 0 ? selectedIndex : 0;
    const next = RSVP_OPTIONS[(from + step + RSVP_OPTIONS.length) % RSVP_OPTIONS.length];
    onChange(next.value);
    const buttons = event.currentTarget.querySelectorAll<HTMLElement>('button');
    buttons[RSVP_OPTIONS.findIndex(option => option.value === next.value)]?.focus();
  };
  return (
    <div role="radiogroup" aria-label="Your RSVP" style={styles.chipRow} onKeyDown={onKeyDown}>
      {RSVP_OPTIONS.map((option, index) => {
        const selected = option.value === value;
        const variant =
          selected && option.value === 'in'
            ? styles.chipIn
            : selected && option.value === 'maybe'
              ? styles.chipMaybe
              : selected && option.value === 'out'
                ? styles.chipOut
                : null;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (selectedIndex < 0 && index === 0) ? 0 : -1}
            className="knd-btn knd-focusable"
            style={size === 'bubble' ? styles.chipBtnBubble : styles.chipBtnSheet}
            onClick={() => onChange(option.value)}>
            <span
              key={selected ? `on-${option.value}` : `off-${option.value}`}
              className={selected && !reducedMotion ? 'knd-chip-spring' : undefined}
              style={{
                ...(size === 'bubble' ? styles.chipVisual : styles.chipVisualSheet),
                ...variant,
              }}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TIME GRID POLL — 2×2 grid of real cell buttons. Cell heat = color-mix of
// BRAND_ACCENT at (count/maxCount)·32% into the card surface — MAX-HEAT
// CONTRAST (32%): light ≈ 32% #B96604 into #FFFFFF ≈ #E9CFB1, text-primary
// on it ≈ 11:1 ✓; dark ≈ 32% #F39A3B into ~#262626 ≈ #5E4529, near-white
// text ≈ 6.9:1 ✓. Your-picked cells get a 2px brand inset + aria-pressed.
// Tapping toggles YOUR availability only — counts re-derive from the store.
// Avatar stack capped at 2 + '+N' at ALL widths for determinism. Arrow keys
// move across the 2×2; each cell is named 'Sat 8 PM, 4 in, selected'.
// ---------------------------------------------------------------------------

interface TimeGridPollProps {
  yourSlots: string[];
  onToggle: (slotId: string) => void;
}

function TimeGridPoll({yourSlots, onToggle}: TimeGridPollProps) {
  const counts = SLOTS.map(slot => slotCount(slot.id, yourSlots));
  const maxCount = Math.max(...counts, 1);
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
    const index = buttons.indexOf(document.activeElement as HTMLElement);
    if (index < 0) return;
    let next = -1;
    if (event.key === 'ArrowRight') next = index + 1;
    else if (event.key === 'ArrowLeft') next = index - 1;
    else if (event.key === 'ArrowDown') next = index + 2;
    else if (event.key === 'ArrowUp') next = index - 2;
    if (next < 0 || next >= buttons.length) return;
    event.preventDefault();
    buttons[next]?.focus();
  };
  const renderCell = (slot: PollSlot, index: number) => {
    const count = counts[index];
    const picked = yourSlots.includes(slot.id);
    const people = slotPeople(slot.id, yourSlots);
    const shown = people.slice(0, 2);
    const overflow = people.length - shown.length;
    const heatPct = Math.round((count / maxCount) * 32);
    return (
      <div key={slot.id} role="gridcell">
        <button
          type="button"
          className="knd-btn knd-focusable"
          aria-pressed={picked}
          aria-label={`${slot.label}, ${count} in${picked ? ', selected' : ''}`}
          style={{
            ...styles.pollCell,
            width: '100%',
            background: `color-mix(in srgb, ${BRAND_ACCENT} ${heatPct}%, var(--color-background-card))`,
            ...(picked ? styles.pollCellPicked : null),
          }}
          onClick={() => onToggle(slot.id)}>
          <span style={styles.pollCellLabel}>{slot.label}</span>
          <span style={styles.pollCellMetaRow}>
            <span style={styles.pollCellCount}>{count} in</span>
            {shown.length > 0 ? (
              <span style={styles.pollAvatarStack} aria-hidden>
                {shown.map(person => (
                  <span
                    key={person.id}
                    style={{...styles.pollMiniAvatar, background: avatarFill(person.hue)}}
                  />
                ))}
                {overflow > 0 ? <span style={styles.pollOverflowChip}>+{overflow}</span> : null}
              </span>
            ) : null}
          </span>
        </button>
      </div>
    );
  };
  return (
    <div role="grid" aria-label="When works? Availability poll" style={styles.pollGrid} onKeyDown={onKeyDown}>
      <div role="row" style={styles.pollRow}>
        {SLOTS.slice(0, 2).map((slot, i) => renderCell(slot, i))}
      </div>
      <div role="row" style={styles.pollRow}>
        {SLOTS.slice(2, 4).map((slot, i) => renderCell(slot, i + 2))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PLAN SHEET CHROME — grabber zone (real 'Resize sheet' button: click
// toggles medium/large; pointer drag between detents is garnish, >120px
// past medium closes), 52px header with 44×44 X, focus-trapped dialog.
// ---------------------------------------------------------------------------

interface SheetProps {
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function PlanSheet({detent, onDetentChange, onClose, sheetRef, reducedMotion, children}: SheetProps) {
  // Transient pointer-drag delta only — the detent lives in the ONE store.
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
    if (!movedRef.current) return; // plain click → toggle handled by onClick
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
      aria-labelledby="knd-plan-title"
      tabIndex={-1}
      className="knd-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease, height 240ms ease',
      }}>
      <button
        type="button"
        className="knd-btn knd-focusable"
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
        <h2 id="knd-plan-title" style={styles.sheetTitle}>
          Plan
        </h2>
        <button
          type="button"
          className="knd-btn knd-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STATUS PILL — attendee-row trailing status, dot + 11px label. Out is
// error-colored (stress fixture 5: Tess renders NOWHERE except this row).
// ---------------------------------------------------------------------------

const STATUS_META: Record<Rsvp, {label: string; dot: string}> = {
  in: {label: 'IN', dot: 'var(--color-success)'},
  maybe: {label: 'MAYBE', dot: MAYBE_AMBER},
  out: {label: 'OUT', dot: 'var(--color-error)'},
  none: {label: 'NO REPLY', dot: CONTROL_EDGE},
};

function StatusPill({rsvp}: {rsvp: Rsvp}) {
  const meta = STATUS_META[rsvp];
  const isOut = rsvp === 'out';
  return (
    <span
      style={{
        ...styles.statusPill,
        ...(isOut
          ? {
              background: 'color-mix(in srgb, var(--color-error) 12%, transparent)',
              color: 'var(--color-error)',
            }
          : null),
      }}>
      <span style={{...styles.statusDot, background: meta.dot}} aria-hidden />
      {meta.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileEventRsvpChatTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [store, setStore] = useState<KindlingStore>(INITIAL_STORE);

  // Focus plumbing — opener restored on every close path.
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const planPillRef = useRef<HTMLButtonElement | null>(null);
  const toastSeqRef = useRef(0);
  const msgSeqRef = useRef(13); // seed thread ends at m12

  // ALL reads derive from the one store.
  const yourRsvp = store.rsvpById[YOU];
  const inCount = store.inOrder.length;
  // Derive-don't-store cross-check: inOrder length must equal the census.
  // (Both mutate in the same setStore beat, so they can never disagree.)
  const quorum = inCount >= THRESHOLD;
  const moreNeeded = THRESHOLD - inCount;

  const nextToast = useCallback((text: string, undo: ToastState['undo']): ToastState => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, text, undo};
  }, []);

  const sysMessage = (text: string, id?: string): Message => {
    msgSeqRef.current += 1;
    return {id: id ?? `mx-${msgSeqRef.current}`, kind: 'system', from: null, text, time: '7:12 PM'};
  };

  // SIGNATURE PATH — one beat: chip springs, your tick lands at slot 4
  // (232px at 390), header flips '3/6 in' → '4/6 in', sheet's duplicate
  // chips agree (same store key), Undo toast opens (persists — no timer,
  // per undoOverConfirm). Crossing 6 appends the quorum system message
  // exactly once (quorumAnnounced is history, not derived).
  const setYourRsvp = (next: Rsvp) => {
    setStore(prev => {
      const prior = prev.rsvpById[YOU];
      if (prior === next) return prev;
      const rsvpById = {...prev.rsvpById, [YOU]: next};
      let inOrder = prev.inOrder.filter(id => id !== YOU);
      if (next === 'in') inOrder = [...inOrder, YOU];
      let messages = prev.messages;
      let quorumAnnounced = prev.quorumAnnounced;
      if (inOrder.length >= THRESHOLD && !quorumAnnounced) {
        messages = [...messages, sysMessage('Quorum reached — booking unlocked')];
        quorumAnnounced = true;
      }
      const text = next === 'in' ? "You're in" : next === 'maybe' ? 'Marked Maybe' : 'Marked Out';
      return {
        ...prev,
        rsvpById,
        inOrder,
        messages,
        quorumAnnounced,
        toast: nextToast(text, {kind: 'rsvp', prior, priorInOrder: prev.inOrder}),
      };
    });
  };

  // POLL — cell tap toggles YOUR availability only; Sat 8 goes 4→5 and its
  // heat deepens; announced via the one toastDock (replaces any Undo toast
  // — the undo window simply ends, stress fixture 6).
  const toggleSlot = (slotId: string) => {
    setStore(prev => {
      const picked = prev.yourSlots.includes(slotId);
      const yourSlots = picked
        ? prev.yourSlots.filter(id => id !== slotId)
        : [...prev.yourSlots, slotId];
      const label = SLOTS.find(slot => slot.id === slotId)?.label ?? slotId;
      return {
        ...prev,
        yourSlots,
        toast: nextToast(picked ? `${label} removed` : `You're free ${label}`, null),
      };
    });
  };

  // QUORUM PATH (deterministic, user-driven): RefreshCw appends 'Leo is
  // in' + 'Noah is in', flips p6/p8 → in (3 in + you + 2 = 6 ✓ when you
  // tapped In first), announces quorum once, toasts the fixed 'Updated
  // just now'. A second press is idempotent (fixed fixtures — nothing new
  // to fetch).
  const onRefresh = () => {
    setStore(prev => {
      if (prev.refreshed) {
        return {...prev, toast: nextToast('Updated just now', null)};
      }
      const rsvpById: Record<string, Rsvp> = {...prev.rsvpById, p6: 'in', p8: 'in'};
      const inOrder = [...prev.inOrder.filter(id => id !== 'p6' && id !== 'p8'), 'p6', 'p8'];
      let messages = [...prev.messages, sysMessage('Leo is in'), sysMessage('Noah is in')];
      let quorumAnnounced = prev.quorumAnnounced;
      if (inOrder.length >= THRESHOLD && !quorumAnnounced) {
        messages = [...messages, sysMessage('Quorum reached — booking unlocked')];
        quorumAnnounced = true;
      }
      return {
        ...prev,
        refreshed: true,
        rsvpById,
        inOrder,
        messages,
        quorumAnnounced,
        toast: nextToast('Updated just now', null),
      };
    });
  };

  // BOOK — reversible, so no confirm (undoOverConfirm): executes, appends
  // the system message, closes the sheet, offers Undo.
  const onBook = () => {
    setStore(prev => ({
      ...prev,
      booked: true,
      sheetOpen: false,
      messages: [...prev.messages, sysMessage('Ember Beach Pit booked for Sat Jul 11', BOOKED_MSG_ID)],
      toast: nextToast('Booked', {kind: 'book'}),
    }));
    planPillRef.current?.focus();
  };

  const onUndo = () => {
    setStore(prev => {
      const undo = prev.toast?.undo;
      if (undo == null) return prev;
      if (undo.kind === 'rsvp') {
        // Restores the EXACT prior state; quorumAnnounced stays true if the
        // crossing already happened (the system message is history).
        return {
          ...prev,
          rsvpById: {...prev.rsvpById, [YOU]: undo.prior},
          inOrder: undo.priorInOrder,
          toast: nextToast(undo.prior === 'none' ? 'RSVP removed' : 'RSVP restored', null),
        };
      }
      return {
        ...prev,
        booked: false,
        messages: prev.messages.filter(message => message.id !== BOOKED_MSG_ID),
        toast: nextToast('Booking removed', null),
      };
    });
  };

  // SHEET lifecycle — Plan pill is the visible non-gesture opener; scrim
  // click + Escape + X all close; focus restores to the pill on every path.
  const openSheet = () => {
    setStore(prev => ({...prev, sheetOpen: true, detent: 'medium'}));
  };
  const closeSheet = useCallback(() => {
    setStore(prev => ({...prev, sheetOpen: false, detent: 'medium'}));
    planPillRef.current?.focus();
  }, []);

  // Focus into the opening sheet with preventScroll (binding amendment —
  // plain .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen).
  useEffect(() => {
    if (store.sheetOpen) {
      sheetRef.current?.focus({preventScroll: true});
    }
  }, [store.sheetOpen]);

  // Escape closes the topmost overlay only (the sheet is the only one).
  useEffect(() => {
    if (!store.sheetOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store.sheetOpen, closeSheet]);

  // COMPOSER — real controlled input; send appends your bubble.
  const onSend = () => {
    setStore(prev => {
      const text = prev.draft.trim();
      if (text.length === 0) return prev;
      msgSeqRef.current += 1;
      const message: Message = {
        id: `mx-${msgSeqRef.current}`,
        kind: 'text',
        from: YOU,
        text,
        time: '7:12 PM', // fixed string — the demo's frozen "now"
      };
      return {...prev, draft: '', messages: [...prev.messages, message]};
    });
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(store.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // Book button copy: '2 more needed' where 2 = 6 − inCount (re-derives —
  // stress fixture 1: overshoot then Maybe → '1 more needed', 6−5 = 1 ✓).
  const bookDisabled = !quorum || store.booked;
  const bookLabel = store.booked ? 'Booked ✓' : quorum ? 'Book Ember Beach Pit' : 'Book';

  const renderMessage = (message: Message, index: number) => {
    if (message.kind === 'system') {
      return (
        <div key={message.id} style={styles.systemMsg}>
          {message.text}
        </div>
      );
    }
    const sender = message.from != null ? ATTENDEES_BY_ID[message.from] : null;
    const isSelf = message.from === YOU;
    if (isSelf) {
      return (
        <div key={message.id} style={styles.msgGroupSelf}>
          <div style={styles.bubbleSelf}>
            {message.text}
            <div style={{...styles.bubbleMeta, textAlign: 'right'}}>{message.time}</div>
          </div>
        </div>
      );
    }
    const previous = store.messages[index - 1];
    const showName = previous == null || previous.from !== message.from;
    return (
      <div key={message.id} style={styles.msgGroupOther}>
        <span
          style={{...styles.msgAvatar, background: avatarFill(sender?.hue ?? 0)}}
          aria-hidden>
          {sender?.initials}
        </span>
        <div style={styles.bubbleStack}>
          {showName ? <span style={styles.senderName}>{sender?.name}</span> : null}
          <div
            style={{
              ...styles.bubble,
              ...(message.kind === 'rsvp' || message.kind === 'poll' ? styles.bubbleWide : null),
            }}>
            {message.kind === 'rsvp' ? (
              <>
                <div style={styles.bubbleTitle}>{message.text}</div>
                <RsvpChipRow
                  value={yourRsvp}
                  onChange={setYourRsvp}
                  size="bubble"
                  reducedMotion={reducedMotion}
                />
              </>
            ) : message.kind === 'poll' ? (
              <>
                <div style={styles.bubbleTitle}>{message.text}</div>
                <TimeGridPoll yourSlots={store.yourSlots} onToggle={toggleSlot} />
              </>
            ) : (
              message.text
            )}
            <div style={styles.bubbleMeta}>{message.time}</div>
          </div>
        </div>
      </div>
    );
  };

  const toastNode =
    store.toast != null ? (
      <div key={store.toast.seq} style={styles.toast} className="knd-anim">
        <span style={styles.toastText}>{store.toast.text}</span>
        {store.toast.undo != null ? (
          <>
            <span style={styles.toastRule} aria-hidden />
            <button type="button" className="knd-btn knd-focusable" style={styles.toastUndoBtn} onClick={onUndo}>
              Undo
            </button>
          </>
        ) : null}
      </div>
    ) : null;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{KINDLING_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <FlameMark />
          </div>
          <div style={styles.navCenter}>
            <h1 className="knd-vh">Bonfire Night chat</h1>
            <span style={styles.navTitle} aria-hidden>
              {EVENT.title}
            </span>
            <span style={styles.datePill}>{EVENT.datePill}</span>
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="knd-btn knd-focusable"
              style={styles.iconBtn}
              aria-label="Refresh thread"
              onClick={onRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* QUORUM HEADER — sticky top:52 z15; the Plan pill is the sheet's
            visible non-gesture opener. */}
        <div style={styles.quorumHeader}>
          <div style={styles.quorumLeft}>
            <div style={styles.quorumRow1}>
              <span style={styles.quorumOverline}>Quorum</span>
              <span style={styles.quorumCount}>{inCount}/{THRESHOLD} in</span>
            </div>
            <QuorumMeter inOrder={store.inOrder} reducedMotion={reducedMotion} />
          </div>
          <button
            type="button"
            ref={planPillRef}
            className="knd-btn knd-focusable"
            style={styles.planPill}
            aria-haspopup="dialog"
            aria-expanded={store.sheetOpen}
            onClick={openSheet}>
            Plan
          </button>
        </div>

        {/* CHAT BODY — full-bleed stream; the PAGE scrolls (no inner
            scroller outside the open sheet). */}
        <main style={styles.chatBody}>
          <div style={styles.daySeparator}>Today</div>
          {store.messages.map(renderMessage)}
        </main>

        {/* TOAST DOCK — the ONE polite live region. Sticky-in-flow above
            the composer (bottom 76 = 64 + 12); while the sheet locks the
            shell it flips to shell-absolute so it anchors to the visible
            screen (binding amendment). Deviation from the spec's z30
            during lock: z42 (above the sheet) so the sheet's own RSVP
            mutations keep a reachable Undo — at z30 the scrim (z40) would
            bury it. */}
        <div
          style={store.sheetOpen ? styles.toastDockLocked : styles.toastDockSticky}
          aria-live="polite">
          {toastNode}
        </div>

        {/* COMPOSER — sticky bottom z20; real controlled input. */}
        <div style={styles.composer}>
          <input
            type="text"
            value={store.draft}
            placeholder="Message Bonfire Night"
            aria-label="Message Bonfire Night"
            style={styles.composerInput}
            className="knd-focusable"
            onChange={event => {
              const draft = event.target.value;
              setStore(prev => ({...prev, draft}));
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') onSend();
            }}
          />
          <button
            type="button"
            className="knd-btn knd-focusable"
            style={{...styles.sendBtn, ...(store.draft.trim().length === 0 ? styles.sendBtnDisabled : null)}}
            aria-label="Send message"
            disabled={store.draft.trim().length === 0}
            onClick={onSend}>
            <Icon icon={SendHorizontalIcon} size="sm" color="inherit" />
          </button>
        </div>

        {store.sheetOpen ? (
          <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
        ) : null}
        {store.sheetOpen ? (
          <PlanSheet
            detent={store.detent}
            onDetentChange={detent => setStore(prev => ({...prev, detent}))}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}>
            {/* Event summary — three 44px utility rows. */}
            <div style={{...styles.listCard, marginTop: 4}}>
              <div style={styles.utilityRow}>
                <span style={styles.utilityRowIcon}>
                  <Icon icon={MapPinIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.utilityRowLabel}>Where</span>
                <span style={styles.utilityRowValue}>{EVENT.whereLabel}</span>
              </div>
              <div style={styles.rowDivider} />
              <div style={styles.utilityRow}>
                <span style={styles.utilityRowIcon}>
                  <Icon icon={CalendarIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.utilityRowLabel}>When</span>
                <span style={styles.utilityRowValue}>{EVENT.whenLabel}</span>
              </div>
              <div style={styles.rowDivider} />
              <div style={styles.utilityRow}>
                <span style={styles.utilityRowIcon}>
                  <Icon icon={CircleDollarSignIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.utilityRowLabel}>Cost</span>
                <span style={styles.utilityRowValue}>{EVENT.costLabel}</span>
              </div>
            </div>

            <h2 style={styles.sectionHeader}>Your RSVP</h2>
            <div style={styles.sheetChipBlock}>
              {/* The DUPLICATE RsvpChipRow — same store key as the bubble
                  instance, so they can never disagree. */}
              <RsvpChipRow
                value={yourRsvp}
                onChange={setYourRsvp}
                size="sheet"
                reducedMotion={reducedMotion}
              />
            </div>

            <div style={styles.bookBlock}>
              <button
                type="button"
                className="knd-btn knd-focusable"
                style={{...styles.bookBtn, ...(bookDisabled ? styles.bookBtnDisabled : null)}}
                disabled={bookDisabled}
                aria-disabled={bookDisabled}
                onClick={onBook}>
                {bookLabel}
              </button>
              {!quorum && !store.booked ? (
                <span style={styles.bookCaption}>
                  {moreNeeded} more needed
                </span>
              ) : null}
            </div>

            {store.detent === 'large' ? (
              <>
                <h2 style={styles.sectionHeader}>Attendees ({ATTENDEES.length})</h2>
                <div style={styles.listCard}>
                  {ATTENDEES.map((person, index) => (
                    <div key={person.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.attendeeRow}>
                        <span
                          style={{...styles.attendeeAvatar, background: avatarFill(person.hue)}}
                          aria-hidden>
                          {person.initials}
                        </span>
                        <span style={styles.attendeeText}>
                          <span style={styles.attendeePrimary}>{person.sheetName}</span>
                          <span style={styles.attendeeSecondary}>
                            {person.id === YOU
                              ? store.yourSlots.length > 0
                                ? `Free ${store.yourSlots
                                    .map(id => SLOTS.find(slot => slot.id === id)?.label)
                                    .filter(Boolean)
                                    .join(' · ')}`
                                : 'No times yet'
                              : (AVAILABILITY[person.id]?.length ?? 0) > 0
                                ? `Free ${AVAILABILITY[person.id]
                                    .map(id => SLOTS.find(slot => slot.id === id)?.label)
                                    .filter(Boolean)
                                    .join(' · ')}`
                                : 'No times yet'}
                          </span>
                        </span>
                        <StatusPill rsvp={store.rsvpById[person.id]} />
                      </div>
                    </div>
                  ))}
                </div>

                <h2 style={styles.sectionHeader}>When works?</h2>
                <div style={styles.sheetPollBlock}>
                  {/* Same TimeGridPoll, card width — cells stretch. */}
                  <TimeGridPoll yourSlots={store.yourSlots} onToggle={toggleSlot} />
                </div>
              </>
            ) : null}
          </PlanSheet>
        ) : null}
      </div>
    </div>
  );
}
