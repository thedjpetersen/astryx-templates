var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Foyer DM waiting room: a
 *   requestsQueue of 15 records = 8 people + 4 brands + 3 filtered
 *   (8+4+3=15 cross-checked), 6 existing chats (c1–c6), fixed relative
 *   stamps ('2d', '1w' — never Date.now()), fixture stances
 *   (Priya/Dana/Amara 'accept' = 3, the other five people 'decline' = 5,
 *   3+5=8 ✓), Priya's peek-sheet context (2 shared groups, 4 mutual
 *   avatars matching her mutuals count of 4 ✓), and deterministic
 *   skeleton bar widths (60/45/70/60 primary, 40/55/30/40 secondary).
 *   No Math.random, no network media.
 * @output Foyer — DM Request Triage: a 390px MOBILE inbox-zero client
 *   for message requests. NavBar (28px Foyer door-mark, fade-in title,
 *   Refresh + Edit) over a 'Requests' large title, a 52px segmented
 *   filterBar ('People 8 · Brands 4 · Filtered 3'), and a listCard of
 *   72px TrustSignalRows: 40px avatar (circle person / 12px-radius
 *   brand), name + mutuals pill + account-age dot, and a first line
 *   BLURRED until peeked. Row tap opens the half-detent ContextPeekSheet
 *   ('Peeking is private — Priya won't know you looked.'); swipe right
 *   reveals Accept, swipe left reveals Decline+Limit, each with a 44×44
 *   ellipsis-menu fallback; navBar Edit swaps the tabBar for a
 *   BatchSweepBar whose Accept 3 / Decline 5 tallies derive live from
 *   per-row stance pills. Every mutation lands in ONE requestsQueue
 *   owner so consequences read across three surfaces at once: accepting
 *   Priya animates her row out, drops the Requests tab badge 12→11,
 *   prepends a NEW 'Moved to Chats' entry on the Chats tab, and raises
 *   a persistent Undo toast that replays all of it (11→12, 7→6).
 * @position Page template; emitted by \`astryx template mobile-dm-request-triage\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the
 *   first pixel). All overlays (scrim, sheet, menus, alert) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While
 *   the sheet or alert is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The stage clips to
 *   --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 68 for avatar-led rows / 16
 *   otherwise); no desktop Layout frames, no side asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Foyer teal — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule).
 *   Sanctioned non-brand literals, each with contrast math at the
 *   declaration: the age-dot pairs (established/new), the swipe-block
 *   error and limit fills + their fill-text pairs, the ≥3:1 rest-state
 *   pairs for the switch OFF track and the unchecked selectionCircle
 *   border (foundations amendment), and the sheet scrim.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON —
 *   this template wires the large-title fade, not the hairline);
 *   largeTitle row 52px (28px/700 at the 16px gutter, total header
 *   104px, scrolls away; navBar center title fades in via an
 *   IntersectionObserver sentinel); filterBar 52px in flow (8+36+8,
 *   36px segmented track radius 12, active pill radius 8 = 12−4);
 *   tabBar exactly 64px sticky bottom z20 (three flex:1 tabItems, 24px
 *   icon over 11px/500 label, 4px gap; badge = brand pill min-width 16,
 *   10px/600, offset top:-4 right:-8, reads '12'); TrustSignalRow 72px
 *   (40px avatar, 16px/500 + 13px/400 at 2px gap, paddingInline 16);
 *   Chats rows 72px; Settings rows 44px; sectionHeader 13px/600
 *   uppercase 0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px
 *   bottom; swipe action blocks 72px wide full-row-height; toast dock
 *   sticky bottom 76 (64 tabBar + 12) z30; sheet detents 55% medium /
 *   calc(100% − 56px) large, 24px grabber zone with 36×5 pill, 52px
 *   sheet header. People card height check: 8 rows×72 + 7 dividers×1 =
 *   583px content. TYPE (Figtree via --font-family-body): 28/700 large
 *   title · 17/600 nav + sheet titles · 16/400–500 body + row primary ·
 *   13/400 secondary + meta · 11/500 tab labels + overlines; nothing
 *   under 11px; tabular-nums on every updating count. Buttons: 48px
 *   primary, 36px secondary, 44×44 icon buttons. THUMB LAW: the
 *   constructive sweep verb (Accept) sits at the BatchSweepBar's
 *   trailing end; destructive Decline sits at its LEADING end.
 *
 * GESTURE ↔ BUTTON PARITY (every gesture has a visible, Tab-reachable
 * button path):
 *   swipe row right (Accept) / left (Decline+Limit)  ↔  44×44 ellipsis
 *     button on every row opening the same verbs as an anchored menu;
 *   long-press row (450ms, cancelled at 8px movement) ↔  the same
 *     ellipsis menu;
 *   sheet drag (grabber, >120px down past medium closes) ↔ grabber
 *     click toggles detents + 44×44 X + Escape + scrim tap.
 * ESCAPE LADDER (topmost only): block alert → ContextPeekSheet /
 *   anchored rowMenu → clears the swipe-open row. Edit mode exits via
 *   Cancel/Done only, never Escape.
 *
 * Responsive contract:
 * - Fluid 320–430px, ZERO width literals. Segments keep 'People 8' /
 *   'Brands 4' / 'Filtered 3' at 13px/600 at every width (3 × ~96px min
 *   = 288 + 2×16 gutter ≈ 320 ✓). Name line minWidth:0 + ellipsis;
 *   mutuals pill flexShrink:0; preview single-line ellipsis at every
 *   width. Swipe pair 144px still leaves 320−144 = 176px of row ✓.
 *   BatchSweepBar ships the short 'All in filter (8)' label at all
 *   widths (44+8+~120+8+~92 = 272 < 288 available ✓). Alert width
 *   min(280px, calc(100% − 64px)). 320px checklist: segmented fits,
 *   sweep bar fits, swipe pair leaves 176px of row, no horizontal
 *   scroll (overflowX clip is backstop only).
 * - Desktop stage (~1045px): measured via useElementWidth on the
 *   wrapper (container width, not viewport) — at ≥720px the shell
 *   becomes a centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout; the anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  BanIcon,
  CheckIcon,
  CircleMinusIcon,
  EyeOffIcon,
  InboxIcon,
  MailQuestionIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  SettingsIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Foyer teal). White 13px/600 labels on
// #0E7C7B pass 4.6:1; on the dark side the fill lightens to #2DD4BF and
// the label flips dark — #042F2E on #2DD4BF ≈ 8.9:1.
const BRAND_ACCENT = 'light-dark(#0E7C7B, #2DD4BF)';
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #042F2E)';
// Brand-tinted 12% wash for the brand avatar mark and NEW overline chip
// backgrounds (text on it stays BRAND_ACCENT, which passes on both card
// surfaces: #0E7C7B on white ≈ 5.0:1, #2DD4BF on #1C1C1E ≈ 9.6:1).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Account-age dots — DECORATIVE encoding duplicated by the adjacent
// 13px 'Joined 2019' text, but still held to the ≥3:1 amendment against
// their ACTUAL surface (the white/#1C1C1E listCard):
//   established: #0E7C7B on #FFFFFF ≈ 5.0:1 ✓ · #5EEAD4 on #1C1C1E ≈ 11.9:1 ✓
//   new:         #B45309 on #FFFFFF ≈ 4.7:1 ✓ · #FCD34D on #1C1C1E ≈ 12.4:1 ✓
const AGE_ESTABLISHED = 'light-dark(#0E7C7B, #5EEAD4)';
const AGE_NEW = 'light-dark(#B45309, #FCD34D)';
// Destructive swipe block + alert commit verb. #C92A2A on white ≈ 5.5:1;
// #FF8787 on #1C1C1E ≈ 7.4:1. Fill text: #FFFFFF on #C92A2A ≈ 5.5:1;
// #300808 on #FF8787 ≈ 7.8:1.
const ERROR_STRONG = 'light-dark(#C92A2A, #FF8787)';
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #300808)';
// Limit swipe block (the spec's text-secondary-surface pair). #57534E on
// white card ≈ 6.5:1 as a fill boundary; label #FFFFFF on #57534E ≈
// 6.5:1. Dark: #A8A29E fill with #1C1917 label ≈ 7.0:1.
const LIMIT_FILL = 'light-dark(#57534E, #A8A29E)';
const LIMIT_FILL_TEXT = 'light-dark(#FFFFFF, #1C1917)';
// FOUNDATIONS AMENDMENT (≥3:1 interactive rest states vs their actual
// surface): the switch OFF track vs the white/#1C1C1E card — #8A847B on
// #FFFFFF ≈ 3.3:1 ✓, #767169 on #1C1C1E ≈ 3.4:1 ✓ — and the unchecked
// selectionCircle border — #6E6A63 on #FFFFFF ≈ 4.9:1 ✓, #9A958C on
// #1C1C1E ≈ 5.6:1 ✓. Hairline/muted tokens are NOT used for either.
const SWITCH_OFF_TRACK = 'light-dark(#8A847B, #767169)';
const SELECT_CIRCLE_BORDER = 'light-dark(#6E6A63, #9A958C)';
// Sheet/alert scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// sheet slide-in, and the reduced-motion guard (transitions collapse to
// instant; the sheet slide becomes a fade).
// ---------------------------------------------------------------------------

const FOYER_CSS = \`
.fyr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.fyr-btn:disabled { cursor: default; }
.fyr-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.fyr-anim { transition: transform 200ms ease, opacity 200ms ease; }
.fyr-fade { transition: opacity 200ms ease; }
.fyr-exit { transition: opacity 200ms ease, max-height 200ms ease; }
@keyframes fyr-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.fyr-sheet-in { animation: fyr-sheet-in 200ms ease; }
.fyr-vh {
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
  .fyr-anim, .fyr-fade, .fyr-exit { transition: none; }
  .fyr-sheet-in { animation: none; }
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
  // NAV BAR — 52px sticky top z20; hairline + blur ALWAYS ON.
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
  // Center title — 17/600, max 200px, ellipsized; opacity wired to the
  // large-title IntersectionObserver sentinel.
  navTitle: {
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  // Edit / Cancel / Done text buttons — 44px hit, 17px labels.
  textBtn: {
    height: 44,
    minWidth: 44,
    paddingInline: 10,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  textBtnStrong: {fontWeight: 600},
  // Large-title row — 52px, 28/700 at the 16px gutter; scrolls away.
  largeTitleRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitle: {margin: 0, fontSize: 28, fontWeight: 700, lineHeight: 1.1},
  // FILTER BAR — 52px in flow below the sticky navBar (8+36+8), same
  // blur surface.
  filterBar: {
    height: 52,
    paddingBlock: 8,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  // Segmented control — 36px track radius 12, active pill radius 8
  // (nested: 12 − 4 padding).
  segTrack: {
    display: 'flex',
    height: 36,
    padding: 4,
    gap: 2,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  segBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  segBtnActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
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
  // Avatar-led rows: divider inset 68 (16 pad + 40 avatar + 12 gap).
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // Terminal caption — 13/400 centered, 16px below the card.
  terminalCaption: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TRUST SIGNAL ROW — 72px media row; swipe blocks live behind it.
  rowOuter: {position: 'relative'},
  rowClip: {position: 'relative', overflow: 'hidden'},
  rowContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  rowBtn: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
  },
  // Brand accounts get 12px-radius avatars to visually type Brands.
  avatarBrand: {borderRadius: 12},
  rowText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  primaryLine: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  rowName: {
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mutualsPill: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 500,
    background: 'var(--color-background-muted)',
    borderRadius: 999,
    padding: '2px 8px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  ageWrap: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    whiteSpace: 'nowrap',
  },
  ageDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  ageText: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  previewLine: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Blur-until-peeked — 6px blur bar (radius 6 via inline block), text
  // unselectable and aria-hidden until the sheet reveals it.
  previewBlurred: {
    filter: 'blur(6px)',
    userSelect: 'none',
    borderRadius: 6,
  },
  filteredOverline: {
    fontSize: 13,
    fontWeight: 500,
    color: AGE_NEW,
    whiteSpace: 'nowrap',
  },
  limitedChip: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    border: \`1px solid \${LIMIT_FILL}\`,
    color: 'var(--color-text-secondary)',
    borderRadius: 999,
    padding: '1px 7px',
  },
  // Trailing meta — 13px stamp + peeked-dot slot over the 44×44
  // ellipsis; the 6px dot lives in a static 16px non-interactive slot
  // (exempt from the 44px rule).
  rowTrailing: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    paddingInlineEnd: 4,
    flexShrink: 0,
  },
  stampLine: {display: 'flex', alignItems: 'center', gap: 4, height: 16, paddingInlineEnd: 12},
  stamp: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  peekedDot: {width: 6, height: 6, borderRadius: 999, background: BRAND_ACCENT},
  peekedDotSlot: {width: 16, height: 16, display: 'grid', placeItems: 'center'},
  // Swipe blocks — 72px wide, full row height, square (the card's 12px
  // radius clips them at the corners).
  acceptBlock: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
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
  actionsPair: {position: 'absolute', top: 0, bottom: 0, right: 0, width: 144, display: 'flex'},
  declineBlock: {
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: ERROR_STRONG,
    color: ERROR_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  limitBlock: {
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    background: LIMIT_FILL,
    color: LIMIT_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  // Edit-mode selection circle — 24px, unchecked border is the ≥3:1
  // SELECT_CIRCLE_BORDER pair (amendment), checked = brand fill +
  // BRAND_FILL_TEXT check.
  selectionCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 999,
    border: \`2px solid \${SELECT_CIRCLE_BORDER}\`,
    display: 'grid',
    placeItems: 'center',
  },
  selectionCircleOn: {
    border: \`2px solid transparent\`,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  // Stance pill — 36px visual inside a 44px hit wrapper.
  stanceHit: {height: 44, display: 'flex', alignItems: 'center', paddingInlineEnd: 12},
  stancePill: {
    height: 36,
    paddingInline: 12,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  stanceAccept: {background: BRAND_ACCENT, color: BRAND_FILL_TEXT},
  stanceDecline: {border: \`1px solid \${ERROR_STRONG}\`, color: ERROR_STRONG},
  // Anchored row menu — card surface, radius 12, 44px rows, z30 (below
  // the sheet scrim's z40).
  anchoredMenu: {
    position: 'absolute',
    right: 12,
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
  menuRowDestructive: {color: ERROR_STRONG},
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Skeletons — same 72px geometry as the rows they impersonate.
  skeletonRow: {height: 72, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skeletonAvatar: {width: 40, height: 40, borderRadius: '50%', background: 'var(--color-background-muted)', flexShrink: 0},
  skeletonBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // Empty state — centered block, 64px muted circle, one action or none.
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
  emptyBody: {margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-secondary)'},
  // CHATS rows — 72px media rows; NEW overline 11/500 in BRAND_ACCENT.
  chatRowBtn: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  chatOverline: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: BRAND_ACCENT,
    textTransform: 'uppercase',
  },
  // SETTINGS — 44px utility switch rows; the WHOLE row is the switch.
  switchRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  switchLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Switch — 51×31 track radius 999, 27px white thumb, 20px travel.
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
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
  },
  // TAB BAR — exactly 64px, sticky bottom z20, blur + top hairline.
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
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
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
  // BATCH SWEEP BAR — IDENTICAL tabBar geometry (64px sticky bottom z20,
  // blur, top hairline). Destructive 'Decline n' at the LEADING end,
  // 'Accept n' pill at the TRAILING end (thumb law).
  sweepBar: {
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
  sweepDecline: {
    height: 44,
    paddingInline: 8,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500,
    color: ERROR_STRONG,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  sweepSelectAll: {
    flex: 1,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  sweepAcceptHit: {height: 44, display: 'flex', alignItems: 'center'},
  sweepAccept: {
    height: 36,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  disabledDim: {opacity: 0.4},
  // TOAST — sticky-in-flow dock (foundations amendment: shell grows
  // with content, so absolute bottom pins to the DOCUMENT bottom;
  // sticky bottom 76 pins 76px above the viewport bottom = 64 tabBar +
  // 12 while remaining in flow). height 0 so it occupies no layout.
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 48,
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
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
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
  sheetTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // The ONE legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  privacyNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  sheetMessage: {margin: '16px 0 0', fontSize: 16, lineHeight: 1.45},
  sheetSectionHeader: {
    margin: '24px 0 8px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  sheetCard: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  contextRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    fontSize: 16,
  },
  contextLabel: {flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  contextValue: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  mutualStrip: {display: 'flex', flexShrink: 0},
  mutualAvatar: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 700,
    border: '2px solid var(--color-background-card)',
  },
  // Sheet footer — Decline (error text, 36px visual in a 48 slot) LEFT,
  // 16px dead space, Accept 48px primary RIGHT (destructive left, safe
  // on the thumb-trailing edge; the 16px gap satisfies non-adjacency).
  sheetFooter: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  sheetDecline: {
    flex: 1,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 16,
    fontWeight: 600,
    color: ERROR_STRONG,
  },
  sheetAccept: {
    flex: 1.4,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
  },
  // ALERT — the one blocking overlay (irreversible Block only).
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
  alertBody: {padding: 20, textAlign: 'center'},
  alertTitle: {margin: 0, fontSize: 17, fontWeight: 600},
  alertText: {margin: '8px 0 0', fontSize: 13, color: 'var(--color-text-secondary)'},
  alertButtons: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtn: {flex: 1, height: 44, display: 'grid', placeItems: 'center', fontSize: 17},
  alertBtnRule: {width: 1, background: 'var(--color-border)'},
  alertCommit: {fontWeight: 600, color: ERROR_STRONG},
  bottomSpacer: {height: 24},
  updatedCaption: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — deterministic identity consts, dual fields (display +
// machine). THE ARITHMETIC CONTRACT (cross-checked): the queue holds 15
// records = 8 people + 4 brands + 3 filtered (8+4+3 = 15). The segmented
// control renders 'People 8 · Brands 4 · Filtered 3'. The Requests tab
// badge = people 8 + brands 4 = 12; filtered 3 excluded by design (the
// spam quarantine never counts against the user's attention — flipping
// Settings › 'Filter spam' OFF folds them back in, 12 → 15). Mutuals sum
// 4+2+6+1+3+0+5+2 = 23 — never displayed as an aggregate; no fake sums.
// Fixture stances pre-seed the sweep demo: Priya/Dana/Amara 'accept' (3),
// the other five people 'decline' (5); 3+5 = 8 ✓ — so 'All in filter (8)'
// instantly reproduces the spec's tallies. Marcus ships peeked:true so
// the blurred state, the unblurred state, and the peeked-dot all appear
// in the first screenshot (stress fixture 5). All stamps fixed strings.
// ---------------------------------------------------------------------------

type Tab = 'chats' | 'requests' | 'settings';
type Segment = 'people' | 'brands' | 'filtered';
type Kind = 'person' | 'brand' | 'filtered';
type Stance = 'accept' | 'decline';

interface RequestRecord {
  id: string;
  name: string;
  handle: string;
  kind: Kind;
  mutuals: number;
  joinedLabel: string; // 'Joined 2019' (display)
  joinedYear: number; // 2019 (machine)
  joinedFull: string; // 'March 2019' — the peek sheet's row
  ageBand: 'established' | 'new';
  preview: string;
  stamp: string; // fixed relative string — never a clock read
  peeked: boolean;
  stance: Stance;
  limited: boolean;
  resolved: null | 'accepted' | 'declined' | 'blocked';
  sharedGroups: string[];
}

const REQUESTS: RequestRecord[] = [
  // PEOPLE (8) — mutuals 4+2+6+1+3+0+5+2 = 23.
  {id: 'rq_priya', name: 'Priya Raman', handle: '@priyar', kind: 'person', mutuals: 4, joinedLabel: 'Joined 2019', joinedYear: 2019, joinedFull: 'March 2019', ageBand: 'established', preview: 'Hi! Loved your talk at Config — quick question about your grid tokens…', stamp: '2d', peeked: false, stance: 'accept', limited: false, resolved: null, sharedGroups: ['Design Systems ATL', 'Figma Friends']},
  {id: 'rq_marcus', name: 'Marcus Webb', handle: '@mwebb', kind: 'person', mutuals: 2, joinedLabel: 'Joined 2021', joinedYear: 2021, joinedFull: 'June 2021', ageBand: 'established', preview: 'Hey, we met at the Beltline popup — do you still sell prints?', stamp: '3d', peeked: true, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
  {id: 'rq_dana', name: 'Dana Okafor', handle: '@danaok', kind: 'person', mutuals: 6, joinedLabel: 'Joined 2018', joinedYear: 2018, joinedFull: 'February 2018', ageBand: 'established', preview: 'Amara said you two collaborated on the zine — would love to chat!', stamp: '3d', peeked: false, stance: 'accept', limited: false, resolved: null, sharedGroups: ['Design Systems ATL']},
  {id: 'rq_leo', name: 'Leo Tanaka', handle: '@leot', kind: 'person', mutuals: 1, joinedLabel: 'Joined 2024', joinedYear: 2024, joinedFull: 'October 2024', ageBand: 'new', preview: 'yo is this the account from the pottery video??', stamp: '5d', peeked: false, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
  {id: 'rq_sofia', name: 'Sofia Reyes', handle: '@sofiar', kind: 'person', mutuals: 3, joinedLabel: 'Joined 2020', joinedYear: 2020, joinedFull: 'August 2020', ageBand: 'established', preview: 'Hola! I run a small studio in Oaxaca and admire your bookbinding work.', stamp: '6d', peeked: false, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
  // Stress fixture 2 — zero-mutuals, brand-new account: the trust
  // cluster renders '0 mutuals' honestly and the amber new-account dot.
  {id: 'rq_jonas', name: 'Jonas Berg', handle: '@jberg', kind: 'person', mutuals: 0, joinedLabel: 'Joined 2026', joinedYear: 2026, joinedFull: 'May 2026', ageBand: 'new', preview: 'Fast question about crypto — big opportunity, dm me back', stamp: '1w', peeked: false, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
  {id: 'rq_amara', name: 'Amara Diallo', handle: '@amarad', kind: 'person', mutuals: 5, joinedLabel: 'Joined 2017', joinedYear: 2017, joinedFull: 'January 2017', ageBand: 'established', preview: "It has been AGES. Are you going to Lena's wedding in September?", stamp: '1w', peeked: false, stance: 'accept', limited: false, resolved: null, sharedGroups: ['Figma Friends']},
  {id: 'rq_chen', name: 'Chen Wei', handle: '@chenw', kind: 'person', mutuals: 2, joinedLabel: 'Joined 2023', joinedYear: 2023, joinedFull: 'April 2023', ageBand: 'established', preview: 'Your bookbinding thread finally convinced me to try it — tips?', stamp: '2w', peeked: false, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
  // BRANDS (4) — 0 mutuals each, 12px-radius avatars, pitch-line
  // previews. Kite & Compass is stress fixture 1: the single-line
  // ellipsis proof at 320px with the mutuals pill surviving.
  {id: 'rq_loam', name: 'Loamstead Coffee', handle: '@loamstead', kind: 'brand', mutuals: 0, joinedLabel: 'Joined 2020', joinedYear: 2020, joinedFull: 'July 2020', ageBand: 'established', preview: 'Partner with us for our fall single-origin drop — free beans on us!', stamp: '4d', peeked: false, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
  {id: 'rq_kite', name: 'Kite & Compass Travel Collective — Pacific Northwest', handle: '@kitecompasspnw', kind: 'brand', mutuals: 0, joinedLabel: 'Joined 2019', joinedYear: 2019, joinedFull: 'November 2019', ageBand: 'established', preview: "We'd love to feature your photos in our autumn campaign.", stamp: '5d', peeked: false, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
  {id: 'rq_pelican', name: 'Pelican Press', handle: '@pelicanpress', kind: 'brand', mutuals: 0, joinedLabel: 'Joined 2016', joinedYear: 2016, joinedFull: 'March 2016', ageBand: 'established', preview: 'Advance review copy of our September list — interested?', stamp: '1w', peeked: false, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
  {id: 'rq_orbit', name: 'Orbit Fitness', handle: '@orbitfit', kind: 'brand', mutuals: 0, joinedLabel: 'Joined 2022', joinedYear: 2022, joinedFull: 'September 2022', ageBand: 'established', preview: "You've been selected for our ambassador program!", stamp: '2w', peeked: false, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
  // FILTERED (3) — flagged previews; rows swap the mutuals pill for a
  // 13px 'Filtered for spam' overline. Quarantined out of the badge.
  {id: 'rq_prize', name: 'Winner Alert', handle: '@prizedesk94', kind: 'filtered', mutuals: 0, joinedLabel: 'Joined 2026', joinedYear: 2026, joinedFull: 'June 2026', ageBand: 'new', preview: 'CONGRATULATIONS you have been chosen to receive $500 click here…', stamp: '1d', peeked: false, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
  {id: 'rq_mia', name: 'Mia', handle: '@mia_mia_4821', kind: 'filtered', mutuals: 0, joinedLabel: 'Joined 2026', joinedYear: 2026, joinedFull: 'June 2026', ageBand: 'new', preview: 'i made 3k this week from home, ask me how', stamp: '4d', peeked: false, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
  {id: 'rq_verify', name: 'Support Team', handle: '@acct_verify_hq', kind: 'filtered', mutuals: 0, joinedLabel: 'Joined 2026', joinedYear: 2026, joinedFull: 'July 2026', ageBand: 'new', preview: 'Your account will be suspended. Verify immediately at the link…', stamp: '6d', peeked: false, stance: 'decline', limited: false, resolved: null, sharedGroups: []},
];

interface ChatRecord {
  id: string;
  name: string;
  line: string;
  stamp: string;
  isNew: boolean; // accepted-request entries wear the NEW overline
}

// CHATS (6, c1–c6) — names distinct from every request sender. Accepting
// Priya prepends c0_rq_priya: 6 → 7 rows; Undo → 6.
const CHATS: ChatRecord[] = [
  {id: 'c1', name: 'Nadia Osei', line: 'Sketches are in the shared folder', stamp: '10:05 AM', isNew: false},
  {id: 'c2', name: 'Tomás Rivera', line: 'That kerning talk was so good', stamp: 'Yesterday', isNew: false},
  {id: 'c3', name: 'Book Club · Row 7', line: 'Ida: chapter 12 tonight!', stamp: 'Yesterday', isNew: false},
  {id: 'c4', name: 'Grace Park', line: 'Sending the invoice tomorrow', stamp: 'Tue', isNew: false},
  {id: 'c5', name: 'Hakim Bello', line: 'Trail run Saturday 8am?', stamp: 'Mon', isNew: false},
  {id: 'c6', name: 'Design Systems ATL', line: 'June recap notes posted', stamp: 'Jun 28', isNew: false},
];

// Mutual-avatar roster for the peek sheet's 'Mutuals — n' strip —
// Priya's 4 avatars match her mutuals count of 4 ✓ (take first n).
const MUTUAL_ROSTER = ['Ana Silva', 'Ben Ito', 'Cleo Marsh', 'Dev Rao', 'Esme Cole', 'Femi Ade'];

// Deterministic skeleton bar widths (refresh state): primary
// 60/45/70/60, secondary 40/55/30/40 — never Math.random().
const SKELETON_WIDTHS: Array<{primary: string; secondary: string}> = [
  {primary: '60%', secondary: '40%'},
  {primary: '45%', secondary: '55%'},
  {primary: '70%', secondary: '30%'},
  {primary: '60%', secondary: '40%'},
];

// Id-derived avatar gradients — stylized stand-ins for photos (no
// network media). Decorative (aria-hidden initial), so the white
// initial is not contrast-bound; both stops sit dark enough that it
// reads in both schemes anyway.
const AVATAR_GRADIENTS = [
  ['#0E7C7B', '#0F4C4B'],
  ['#4C51BF', '#2D3282'],
  ['#9D4E8C', '#5E2B54'],
  ['#B4530A', '#7A3707'],
  ['#4A6FA5', '#2C4368'],
  ['#5F7A38', '#3B4D20'],
];

function avatarGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 997;
  const [from, to] = AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
  return \`linear-gradient(135deg, \${from}, \${to})\`;
}

function initialsOf(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

function firstNameOf(name: string): string {
  return name.split(' ')[0] ?? name;
}

const SEGMENT_KIND: Record<Segment, Kind> = {
  people: 'person',
  brands: 'brand',
  filtered: 'filtered',
};

const SEGMENT_LABEL: Record<Segment, string> = {
  people: 'People',
  brands: 'Brands',
  filtered: 'Filtered',
};

const TAB_TITLE: Record<Tab, string> = {
  chats: 'Chats',
  requests: 'Requests',
  settings: 'Settings',
};

// ---------------------------------------------------------------------------
// ONE STATE OWNER — everything derives from state.queue + state.chats;
// zero duplicated counts anywhere in the tree.
// ---------------------------------------------------------------------------

interface ToastState {
  seq: number;
  text: string;
  // Undo-over-confirm: reversible mutations snapshot the exact prior
  // queue+chats; Undo restores wholesale (original positions, badge,
  // Chats entries). null = informational toast, no Undo button.
  undo: {queue: RequestRecord[]; chats: ChatRecord[]} | null;
}

interface FoyerState {
  tab: Tab;
  segment: Segment; // persists across tab switches (per-tab state law)
  queue: RequestRecord[];
  chats: ChatRecord[];
  edit: boolean;
  selected: ReadonlySet<string>;
  sheetId: string | null; // ContextPeekSheet — request id
  sheetDetent: 'medium' | 'large';
  menuId: string | null; // anchored rowMenu — request id
  swipeId: string | null; // swipe-open row (one at a time)
  swipeSide: 'accept' | 'actions';
  alertId: string | null; // Block alert — request id
  toast: ToastState | null;
  refreshing: boolean;
  refreshed: boolean; // 'Updated just now' caption
  filterSpam: boolean;
  blurPreviews: boolean;
  showMutuals: boolean;
  notifyRequests: boolean;
  notifyDigest: boolean;
  scrollByTab: Record<Tab, number>;
}

const INITIAL_STATE: FoyerState = {
  tab: 'requests',
  segment: 'people',
  queue: REQUESTS,
  chats: CHATS,
  edit: false,
  selected: new Set<string>(),
  sheetId: null,
  sheetDetent: 'medium',
  menuId: null,
  swipeId: null,
  swipeSide: 'accept',
  alertId: null,
  toast: null,
  refreshing: false,
  refreshed: false,
  filterSpam: true,
  blurPreviews: true,
  showMutuals: true,
  notifyRequests: true,
  notifyDigest: false,
  scrollByTab: {chats: 0, requests: 0, settings: 0},
};

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
// BRAND MARK — 28px Foyer door-mark: two facing chat-bubble door panels
// with a 2px light gap; the trailing panel carries the brand accent.
// ---------------------------------------------------------------------------

function FoyerMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
        {/* Leading door panel — outlined chat-bubble half. */}
        <path
          d="M12.5 5H7a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h1.2v3l3.3-3h1V5Z"
          stroke="var(--color-text-primary)"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        {/* Trailing door panel — filled with the brand accent, 2px gap. */}
        <path
          d="M15.5 5H21a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-5.5V5Z"
          fill={BRAND_ACCENT}
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SWITCH — 51×31 visual inside a whole-row 44px button (role=switch).
// ---------------------------------------------------------------------------

interface SwitchRowProps {
  label: string;
  checked: boolean;
  reducedMotion: boolean;
  onToggle: () => void;
}

function SwitchRow({label, checked, reducedMotion, onToggle}: SwitchRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="fyr-btn fyr-focusable"
      style={styles.switchRow}
      onClick={onToggle}>
      <span style={styles.switchLabel}>{label}</span>
      <span style={{...styles.switchTrack, ...(checked ? styles.switchTrackOn : null)}} aria-hidden>
        <span
          style={{
            ...styles.switchThumb,
            transform: checked ? 'translateX(20px)' : undefined,
            transition: reducedMotion ? 'none' : 'transform 200ms ease',
          }}
        />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// TRUST SIGNAL ROW — 72px full-width <button> named by the sender only.
// Swipe right (+72 snap) reveals Accept; swipe left (−144 snap) reveals
// Decline+Limit; the 44×44 ellipsis and 450ms long-press open the same
// verbs as an anchored menu (gesture ↔ button parity). Swipe and
// long-press are disabled while editing; whole-row tap then toggles
// selection (role=checkbox) instead of peeking.
// ---------------------------------------------------------------------------

interface TrustRowProps {
  row: RequestRecord;
  isLast: boolean;
  blurPreviews: boolean;
  showMutuals: boolean;
  edit: boolean;
  selected: boolean;
  swipeOpen: 'accept' | 'actions' | null;
  menuOpen: boolean;
  exiting: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onPeek: (opener: HTMLElement) => void;
  onToggleSelect: () => void;
  onCycleStance: () => void;
  onSwipe: (side: 'accept' | 'actions' | null) => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onAccept: () => void;
  onDecline: () => void;
  onLimit: () => void;
  onBlock: (opener: HTMLElement) => void;
}

function TrustSignalRow({
  row,
  isLast,
  blurPreviews,
  showMutuals,
  edit,
  selected,
  swipeOpen,
  menuOpen,
  exiting,
  reducedMotion,
  menuRef,
  onPeek,
  onToggleSelect,
  onCycleStance,
  onSwipe,
  onToggleMenu,
  onAccept,
  onDecline,
  onLimit,
  onBlock,
}: TrustRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const pressTimerRef = useRef<number | null>(null);

  const base = swipeOpen === 'accept' ? 72 : swipeOpen === 'actions' ? -144 : 0;
  const offset = dragX != null ? Math.max(-144, Math.min(72, base + dragX)) : base;

  const clearPressTimer = () => {
    if (pressTimerRef.current != null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (edit) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    setDragX(0);
    event.currentTarget.setPointerCapture(event.pointerId);
    // Long-press (450ms, cancelled at 8px movement) opens the rowMenu —
    // same verbs as the visible ellipsis (parity law).
    const target = event.currentTarget;
    clearPressTimer();
    pressTimerRef.current = window.setTimeout(() => {
      pressTimerRef.current = null;
      movedRef.current = true; // swallow the click that follows
      setDragX(null);
      onToggleMenu(target.querySelector('button') ?? target);
    }, 450);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - startXRef.current;
    if (Math.abs(dx) > 8) {
      movedRef.current = true;
      clearPressTimer();
    }
    setDragX(dx);
  };
  const onPointerUp = () => {
    clearPressTimer();
    if (dragX == null) return;
    const settled = Math.max(-144, Math.min(72, base + dragX));
    setDragX(null);
    if (!movedRef.current) return;
    if (settled > 36) onSwipe('accept');
    else if (settled < -36) onSwipe('actions');
    else onSwipe(null);
  };

  const guardClick = (handler: (opener: HTMLElement) => void) => (event: {currentTarget: HTMLElement}) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    handler(event.currentTarget);
  };

  const isBrand = row.kind === 'brand';
  const blurred = blurPreviews && !row.peeked && row.kind !== 'filtered';
  const dotColor = row.ageBand === 'established' ? AGE_ESTABLISHED : AGE_NEW;

  const rowTap = (opener: HTMLElement) => {
    if (edit) {
      onToggleSelect();
      return;
    }
    if (swipeOpen != null) {
      onSwipe(null);
      return;
    }
    onPeek(opener);
  };

  return (
    <div
      style={{
        ...styles.rowOuter,
        // Row exit — height+opacity 200ms per spec; instant under
        // reduced motion (the .fyr-exit transition collapses).
        maxHeight: exiting ? 0 : 73,
        opacity: exiting ? 0 : 1,
        overflow: exiting ? 'hidden' : undefined,
      }}
      className="fyr-exit">
      <div style={styles.rowClip}>
        {/* Swipe blocks — square, clipped by the card's 12px radius. */}
        <button
          type="button"
          className="fyr-btn"
          style={styles.acceptBlock}
          tabIndex={swipeOpen === 'accept' ? 0 : -1}
          aria-hidden={swipeOpen !== 'accept'}
          onClick={onAccept}>
          <Icon icon={CheckIcon} size="sm" color="inherit" />
          Accept
        </button>
        <div style={styles.actionsPair}>
          <button
            type="button"
            className="fyr-btn"
            style={styles.declineBlock}
            tabIndex={swipeOpen === 'actions' ? 0 : -1}
            aria-hidden={swipeOpen !== 'actions'}
            onClick={onDecline}>
            <Icon icon={XIcon} size="sm" color="inherit" />
            Decline
          </button>
          <button
            type="button"
            className="fyr-btn"
            style={styles.limitBlock}
            tabIndex={swipeOpen === 'actions' ? 0 : -1}
            aria-hidden={swipeOpen !== 'actions'}
            onClick={onLimit}>
            <Icon icon={CircleMinusIcon} size="sm" color="inherit" />
            Limit
          </button>
        </div>
        <div
          style={{
            ...styles.rowContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 200ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            clearPressTimer();
            setDragX(null);
          }}>
          <button
            type="button"
            className="fyr-btn fyr-focusable"
            style={styles.rowBtn}
            role={edit ? 'checkbox' : undefined}
            aria-checked={edit ? selected : undefined}
            aria-label={row.name}
            onClick={guardClick(rowTap)}>
            {edit ? (
              <span
                style={{...styles.selectionCircle, ...(selected ? styles.selectionCircleOn : null)}}
                className="fyr-fade"
                aria-hidden>
                {selected ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
              </span>
            ) : null}
            <span
              style={{...styles.avatar, ...(isBrand ? styles.avatarBrand : null), background: avatarGradient(row.id)}}
              aria-hidden>
              {initialsOf(row.name)}
            </span>
            <span style={styles.rowText}>
              <span style={styles.primaryLine}>
                <span style={styles.rowName}>{row.name}</span>
                {row.kind === 'filtered' ? null : showMutuals ? (
                  <span style={styles.mutualsPill}>{row.mutuals === 1 ? '1 mutual' : \`\${row.mutuals} mutuals\`}</span>
                ) : null}
                {/* Age wrap: visual = dot + year (keeps 16px/500 names
                    whole at 390); accessible text stays 'Joined 2019'
                    verbatim via the visually-hidden prefix. */}
                {row.kind === 'filtered' ? null : (
                  <span style={styles.ageWrap}>
                    <span style={{...styles.ageDot, background: dotColor}} aria-hidden />
                    <span style={styles.ageText}>
                      <span className="fyr-vh">Joined </span>
                      {row.joinedYear}
                    </span>
                  </span>
                )}
                {row.limited ? <span style={styles.limitedChip}>Limited</span> : null}
              </span>
              {row.kind === 'filtered' ? (
                <span style={styles.filteredOverline}>Filtered for spam</span>
              ) : (
                <span
                  style={{...styles.previewLine, ...(blurred ? styles.previewBlurred : null)}}
                  aria-hidden={blurred}>
                  {row.preview}
                </span>
              )}
            </span>
          </button>
          {edit ? (
            selected ? (
              <span style={styles.stanceHit}>
                <button
                  type="button"
                  className="fyr-btn fyr-focusable"
                  style={{
                    ...styles.stancePill,
                    ...(row.stance === 'accept' ? styles.stanceAccept : styles.stanceDecline),
                  }}
                  aria-label={\`\${row.name} sweep action: \${row.stance}. Tap to switch.\`}
                  onClick={onCycleStance}>
                  {row.stance === 'accept' ? 'Accept' : 'Decline'}
                </button>
              </span>
            ) : null
          ) : (
            <span style={styles.rowTrailing}>
              <span style={styles.stampLine}>
                <span style={styles.peekedDotSlot} aria-hidden>
                  {row.peeked ? <span style={styles.peekedDot} /> : null}
                </span>
                <span style={styles.stamp}>{row.stamp}</span>
              </span>
              <button
                type="button"
                className="fyr-btn fyr-focusable"
                style={styles.iconBtn}
                aria-label={\`Actions for \${row.name}\`}
                aria-expanded={menuOpen}
                onClick={guardClick(onToggleMenu)}>
                <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
              </button>
            </span>
          )}
        </div>
      </div>
      {menuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Actions for \${row.name}\`}
          style={{...styles.anchoredMenu, top: 60}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button type="button" role="menuitem" className="fyr-btn fyr-focusable" style={styles.menuRow} onClick={onAccept}>
            <Icon icon={CheckIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Accept</span>
          </button>
          <div style={styles.rowDivider} />
          <button type="button" role="menuitem" className="fyr-btn fyr-focusable" style={styles.menuRow} onClick={onDecline}>
            <Icon icon={XIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Decline</span>
          </button>
          <div style={styles.rowDivider} />
          <button type="button" role="menuitem" className="fyr-btn fyr-focusable" style={styles.menuRow} onClick={onLimit}>
            <Icon icon={CircleMinusIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Limit</span>
          </button>
          <div style={styles.rowDivider} />
          {/* Block — the ONLY irreversible verb; routes through the
              centered alert, last row, error color (one destructive). */}
          <button
            type="button"
            role="menuitem"
            className="fyr-btn fyr-focusable"
            style={{...styles.menuRow, ...styles.menuRowDestructive}}
            onClick={event => onBlock(event.currentTarget)}>
            <Icon icon={BanIcon} size="sm" color="inherit" />
            <span style={styles.menuRowText}>Block {row.handle}</span>
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDividerDeep} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CONTEXT PEEK SHEET — half-detent dialog opened by tapping a row. The
// privacy contract is the first card: peeking is invisible to the
// sender. Every close path (X, scrim, Escape, grabber-drag >120px past
// medium) marks the row peeked:true — the row unblurs its first line
// and gains the 6px peeked-dot — and focus restores to the opener.
// ---------------------------------------------------------------------------

interface PeekSheetProps {
  row: RequestRecord;
  detent: 'medium' | 'large';
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
}

function ContextPeekSheet({row, detent, reducedMotion, sheetRef, onDetentChange, onClose, onAccept, onDecline}: PeekSheetProps) {
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

  const mutualAvatars = MUTUAL_ROSTER.slice(0, Math.min(row.mutuals, 4));
  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fyr-peek-title"
      tabIndex={-1}
      className="fyr-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 200ms ease',
      }}>
      <button
        type="button"
        className="fyr-btn fyr-focusable"
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
        <h2 id="fyr-peek-title" style={styles.sheetTitle}>
          {row.name}
        </h2>
        <button type="button" className="fyr-btn fyr-focusable" style={styles.iconBtn} aria-label="Close" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <div style={styles.privacyNote}>
          <Icon icon={EyeOffIcon} size="sm" color="inherit" />
          <span>
            Peeking is private — {firstNameOf(row.name)} won&rsquo;t know you looked.
          </span>
        </div>
        <p style={styles.sheetMessage}>{row.preview}</p>
        <h3 style={styles.sheetSectionHeader}>Shared context</h3>
        <div style={styles.sheetCard}>
          <div style={styles.contextRow}>
            <span style={styles.contextLabel}>Shared groups — {row.sharedGroups.length}</span>
            <span style={styles.contextValue}>
              {row.sharedGroups.length > 0 ? row.sharedGroups.join(', ') : 'None yet'}
            </span>
          </div>
          <div style={styles.rowDivider} />
          <div style={styles.contextRow}>
            <span style={styles.contextLabel}>Mutuals — {row.mutuals}</span>
            {mutualAvatars.length > 0 ? (
              <span style={styles.mutualStrip} aria-hidden>
                {mutualAvatars.map((name, index) => (
                  <span
                    key={name}
                    style={{
                      ...styles.mutualAvatar,
                      background: avatarGradient(name),
                      marginLeft: index === 0 ? 0 : -8,
                    }}>
                    {initialsOf(name)}
                  </span>
                ))}
              </span>
            ) : (
              <span style={styles.contextValue}>None</span>
            )}
          </div>
          <div style={styles.rowDivider} />
          <div style={styles.contextRow}>
            <span style={styles.contextLabel}>Joined</span>
            <span style={styles.contextValue}>{row.joinedFull}</span>
          </div>
        </div>
      </div>
      <div style={styles.sheetFooter}>
        <button type="button" className="fyr-btn fyr-focusable" style={styles.sheetDecline} onClick={onDecline}>
          Decline
        </button>
        <button type="button" className="fyr-btn fyr-focusable" style={styles.sheetAccept} onClick={onAccept}>
          Accept
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EMPTY STATES — TRUE-EMPTY (post-sweep People: no action, creation is
// not the user's verb here; the tab badge can simultaneously read 4,
// proving badge ≠ visible list) and FILTERED-EMPTY (quarantine cleared).
// ---------------------------------------------------------------------------

const EMPTY_COPY: Record<Segment, {title: string; body: string}> = {
  people: {title: 'No pending requests', body: 'New requests land here first.'},
  brands: {title: 'No brand requests', body: 'Pitches from brands appear here.'},
  filtered: {title: 'No filtered requests', body: 'Requests we filter for you appear here.'},
};

function EmptyState({segment}: {segment: Segment}) {
  const copy = EMPTY_COPY[segment];
  return (
    <div style={styles.emptyState}>
      <span style={styles.emptyCircle}>
        <Icon icon={InboxIcon} size="lg" color="inherit" />
      </span>
      <h3 style={styles.emptyTitle}>{copy.title}</h3>
      <p style={styles.emptyBody}>{copy.body}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileDmRequestTriageTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ONE STATE OWNER — every surface reads state; every mutation goes
  // through setState/update. Zero duplicated counts in the tree.
  const [state, setState] = useState<FoyerState>(INITIAL_STATE);
  const update = useCallback((id: string, patch: Partial<RequestRecord>) => {
    setState(prev => ({...prev, queue: prev.queue.map(row => (row.id === id ? {...row, ...patch} : row))}));
  }, []);

  // Transient view state (not fixtures): exiting rows mid-animation and
  // the large-title sentinel visibility.
  const [exitingIds, setExitingIds] = useState<ReadonlySet<string>>(new Set());
  const [titleUnderNav, setTitleUnderNav] = useState(false);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const alertOpenerRef = useRef<HTMLElement | null>(null);
  const alertCancelRef = useRef<HTMLButtonElement | null>(null);
  const toastSeqRef = useRef(0);

  // DERIVED, ALL FROM THE QUEUE — the arithmetic contract lives here.
  const unresolved = state.queue.filter(row => row.resolved == null);
  const countPeople = unresolved.filter(row => row.kind === 'person').length; // 8 shipped
  const countBrands = unresolved.filter(row => row.kind === 'brand').length; // 4 shipped
  const countFiltered = unresolved.filter(row => row.kind === 'filtered').length; // 3 shipped
  // badge = people 8 + brands 4 = 12; filtered 3 excluded by design
  // (Settings › Filter spam OFF folds them back in: 12 → 15).
  const badge = state.filterSpam ? countPeople + countBrands : countPeople + countBrands + countFiltered;
  const segmentCounts: Record<Segment, number> = {people: countPeople, brands: countBrands, filtered: countFiltered};
  const visibleRows = unresolved.filter(row => row.kind === SEGMENT_KIND[state.segment]);
  const selectedRows = state.queue.filter(row => state.selected.has(row.id) && row.resolved == null);
  const acceptTally = selectedRows.filter(row => row.stance === 'accept').length;
  const declineTally = selectedRows.filter(row => row.stance === 'decline').length;
  const sheetRow = state.sheetId != null ? state.queue.find(row => row.id === state.sheetId) ?? null : null;
  const alertRow = state.alertId != null ? state.queue.find(row => row.id === state.alertId) ?? null : null;
  const overlayLocked = state.sheetId != null || state.alertId != null;

  const toastPatch = (text: string, undo: ToastState['undo'] = null) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undo}};
  };

  // Row-exit choreography — height+opacity 200ms, instant under reduced
  // motion; the state commit lands when the exit finishes.
  const runExit = (ids: string[], commit: () => void) => {
    if (reducedMotion) {
      commit();
      return;
    }
    setExitingIds(prev => new Set([...prev, ...ids]));
    window.setTimeout(() => {
      setExitingIds(prev => {
        const next = new Set(prev);
        for (const id of ids) next.delete(id);
        return next;
      });
      commit();
    }, 200);
  };

  // CONSEQUENCE CHAINS -------------------------------------------------------

  // SIGNATURE FLOW — accept: row exits, badge 12→11 on the tabBar,
  // Chats prepends the NEW 'Moved to Chats' entry (6→7), one persistent
  // Undo toast. Undo restores the snapshot wholesale: original list
  // position, badge 11→12, chats 7→6, toast text swaps to 'Restored'.
  const acceptOne = (id: string) => {
    const row = state.queue.find(r => r.id === id);
    if (row == null) return;
    const snap = {queue: state.queue, chats: state.chats};
    runExit([id], () => {
      setState(prev => ({
        ...prev,
        queue: prev.queue.map(r => (r.id === id ? {...r, resolved: 'accepted' as const} : r)),
        chats: [
          {id: \`c0_\${id}\`, name: row.name, line: 'Moved to Chats · say hi', stamp: 'now', isNew: true},
          ...prev.chats,
        ],
        sheetId: null,
        menuId: null,
        swipeId: null,
        ...toastPatch(\`\${firstNameOf(row.name)} moved to Chats\`, snap),
      }));
    });
  };

  // DECLINE — same pipeline, no chats write.
  const declineOne = (id: string) => {
    const row = state.queue.find(r => r.id === id);
    if (row == null) return;
    const snap = {queue: state.queue, chats: state.chats};
    runExit([id], () => {
      setState(prev => ({
        ...prev,
        queue: prev.queue.map(r => (r.id === id ? {...r, resolved: 'declined' as const} : r)),
        sheetId: null,
        menuId: null,
        swipeId: null,
        ...toastPatch('Request declined', snap),
      }));
    });
  };

  // LIMIT — row stays, wears the 'Limited' chip.
  const limitOne = (id: string) => {
    const row = state.queue.find(r => r.id === id);
    if (row == null) return;
    const snap = {queue: state.queue, chats: state.chats};
    setState(prev => ({
      ...prev,
      queue: prev.queue.map(r => (r.id === id ? {...r, limited: true} : r)),
      menuId: null,
      swipeId: null,
      ...toastPatch(\`\${firstNameOf(row.name)} limited\`, snap),
    }));
    menuOpenerRef.current?.focus();
  };

  // BLOCK — the one irreversible path: centered alert, scrim inert,
  // no Undo on the resulting toast.
  const openBlockAlert = (id: string, opener: HTMLElement) => {
    alertOpenerRef.current = opener;
    setState(prev => ({...prev, alertId: id, menuId: null, swipeId: null}));
  };
  const cancelBlock = () => {
    setState(prev => ({...prev, alertId: null}));
    alertOpenerRef.current?.focus();
  };
  const confirmBlock = () => {
    const row = alertRow;
    if (row == null) return;
    setState(prev => ({
      ...prev,
      queue: prev.queue.map(r => (r.id === row.id ? {...r, resolved: 'blocked' as const} : r)),
      alertId: null,
      ...toastPatch(\`Blocked \${row.handle}\`, null),
    }));
  };

  const undoToast = () => {
    setState(prev => {
      const snap = prev.toast?.undo;
      if (snap == null) return prev;
      return {
        ...prev,
        queue: snap.queue,
        chats: snap.chats,
        ...(() => {
          toastSeqRef.current += 1;
          return {toast: {seq: toastSeqRef.current, text: 'Restored', undo: null}};
        })(),
      };
    });
  };

  // PEEK — open on row tap; EVERY close path marks peeked:true (the
  // row unblurs and gains the dot) and restores focus to the opener.
  const openPeek = (id: string, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    setState(prev => ({...prev, sheetId: id, sheetDetent: 'medium', menuId: null, swipeId: null}));
  };
  const closePeek = () => {
    const id = state.sheetId;
    setState(prev => ({
      ...prev,
      sheetId: null,
      sheetDetent: 'medium',
      queue: id != null ? prev.queue.map(r => (r.id === id ? {...r, peeked: true} : r)) : prev.queue,
    }));
    sheetOpenerRef.current?.focus();
  };

  // MENUS ----------------------------------------------------------------

  const toggleMenu = (id: string, opener: HTMLElement) => {
    menuOpenerRef.current = opener;
    setState(prev => ({...prev, menuId: prev.menuId === id ? null : id, swipeId: null}));
  };
  const closeMenu = () => {
    setState(prev => ({...prev, menuId: null}));
    menuOpenerRef.current?.focus();
  };

  // EDIT MODE ------------------------------------------------------------

  const enterEdit = () => {
    setState(prev => ({...prev, edit: true, selected: new Set<string>(), menuId: null, swipeId: null, sheetId: null}));
  };
  // Cancel discards selection AND stances (restore fixture stances).
  const cancelEdit = () => {
    setState(prev => ({
      ...prev,
      edit: false,
      selected: new Set<string>(),
      queue: prev.queue.map(row => {
        const fixture = REQUESTS.find(r => r.id === row.id);
        return fixture != null ? {...row, stance: fixture.stance} : row;
      }),
    }));
  };
  const doneEdit = () => {
    setState(prev => ({...prev, edit: false, selected: new Set<string>()}));
  };
  const toggleSelect = (id: string) => {
    setState(prev => {
      const next = new Set(prev.selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return {...prev, selected: next};
    });
  };
  const cycleStance = (id: string) => {
    setState(prev => ({
      ...prev,
      queue: prev.queue.map(row =>
        row.id === id ? {...row, stance: row.stance === 'accept' ? ('decline' as const) : ('accept' as const)} : row,
      ),
    }));
  };
  // Selects every unresolved row in the ACTIVE segment only.
  const selectAllInSegment = () => {
    setState(prev => {
      const kind = SEGMENT_KIND[prev.segment];
      const ids = prev.queue.filter(row => row.resolved == null && row.kind === kind).map(row => row.id);
      return {...prev, selected: new Set(ids)};
    });
  };

  // EXECUTE SWEEP — one composite execution: every selected row resolves
  // per its stance (the two bar buttons are the tallies' verbs; the spec
  // ships ONE combined toast 'Accepted 3 · Declined 5'). Badge 12−8=4,
  // People goes true-empty, Chats 6+3=9; Undo restores 12/8/6.
  const executeSweep = () => {
    const rows = selectedRows;
    if (rows.length === 0) return;
    const snap = {queue: state.queue, chats: state.chats};
    const accepted = rows.filter(row => row.stance === 'accept');
    const declined = rows.filter(row => row.stance === 'decline');
    const parts = [
      accepted.length > 0 ? \`Accepted \${accepted.length}\` : null,
      declined.length > 0 ? \`Declined \${declined.length}\` : null,
    ].filter((part): part is string => part != null);
    runExit(rows.map(row => row.id), () => {
      setState(prev => ({
        ...prev,
        queue: prev.queue.map(row => {
          const hit = rows.find(r => r.id === row.id);
          if (hit == null) return row;
          return {...row, resolved: hit.stance === 'accept' ? ('accepted' as const) : ('declined' as const)};
        }),
        chats: [
          ...accepted.map(row => ({
            id: \`c0_\${row.id}\`,
            name: row.name,
            line: 'Moved to Chats · say hi',
            stamp: 'now',
            isNew: true,
          })),
          ...prev.chats,
        ],
        edit: false,
        selected: new Set<string>(),
        ...toastPatch(parts.join(' · '), snap),
      }));
    });
  };

  // TABS — per-tab state persistence: scroll saved on exit and restored
  // on entry; segment selection persists; overlays close on switch (the
  // toast dock persists). Re-tap of the active tab scrolls to top (the
  // one legal reset). Tab switching is frozen in edit mode by geometry:
  // the BatchSweepBar replaces the tabBar 1:1.
  const scrollerTop = () => document.scrollingElement?.scrollTop ?? 0;
  const switchTab = (tab: Tab) => {
    if (tab === state.tab) {
      const scroller = document.scrollingElement;
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    const from = state.tab;
    const savedTop = scrollerTop();
    setState(prev => ({
      ...prev,
      tab,
      sheetId: null,
      menuId: null,
      swipeId: null,
      alertId: null,
      scrollByTab: {...prev.scrollByTab, [from]: savedTop},
    }));
    const scroller = document.scrollingElement;
    if (scroller != null) scroller.scrollTop = state.scrollByTab[tab];
  };

  // REFRESH — explicit navBar button (pull-to-refresh is banned). Press
  // once → 4 deterministic skeleton rows + one polite 'Loading'
  // announcement; the NEXT user click anywhere resolves to 'Updated
  // just now' (a click-capture on the shell — the initiating click's
  // capture phase runs before the button sets state, so it never
  // self-resolves).
  const startRefresh = () => {
    if (state.refreshing) return;
    setState(prev => ({...prev, refreshing: true, menuId: null, swipeId: null, ...toastPatch('Loading', null)}));
  };
  const resolveRefreshOnCapture = () => {
    if (!state.refreshing) return;
    setState(prev => ({...prev, refreshing: false, refreshed: true, ...toastPatch('Updated just now', null)}));
  };

  // FOCUS + KEY PLUMBING ---------------------------------------------------

  // Focus into the opening sheet with preventScroll — a plain .focus()
  // scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen (amendment).
  useEffect(() => {
    if (state.sheetId != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [state.sheetId]);
  useEffect(() => {
    if (state.menuId != null) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [state.menuId]);
  // Alert: first focus lands on Cancel (never the destructive verb).
  useEffect(() => {
    if (state.alertId != null) alertCancelRef.current?.focus({preventScroll: true});
  }, [state.alertId]);

  // ESCAPE LADDER — topmost only: alert → sheet/menu → swipe-open row.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.alertId != null) cancelBlock();
      else if (state.sheetId != null) closePeek();
      else if (state.menuId != null) closeMenu();
      else if (state.swipeId != null) setState(prev => ({...prev, swipeId: null}));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.alertId, state.sheetId, state.menuId, state.swipeId]);

  // Large-title sentinel — the navBar center title fades in once the
  // large title has scrolled under the sticky navBar (user-driven, so
  // it stays deterministic).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry != null) setTitleUnderNav(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [state.tab]);

  // Segmented radiogroup arrow keys.
  const SEGMENTS: Segment[] = ['people', 'brands', 'filtered'];
  const onSegKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = SEGMENTS.indexOf(state.segment);
    const next = SEGMENTS[(index + (event.key === 'ArrowRight' ? 1 : -1) + SEGMENTS.length) % SEGMENTS.length];
    setState(prev => ({...prev, segment: next, swipeId: null, menuId: null}));
    const buttons = event.currentTarget.querySelectorAll<HTMLElement>('button');
    buttons[SEGMENTS.indexOf(next)]?.focus();
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayLocked ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const navTitleText = state.edit
    ? state.selected.size === 0
      ? 'Select Items'
      : \`\${state.selected.size} Selected\`
    : TAB_TITLE[state.tab];

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{FOYER_CSS}</style>
      <div ref={shellRef} style={shellStyle} onClickCapture={resolveRefreshOnCapture}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {state.edit ? (
              <button type="button" className="fyr-btn fyr-focusable" style={styles.textBtn} onClick={cancelEdit}>
                Cancel
              </button>
            ) : (
              <FoyerMark />
            )}
          </div>
          {/* Edit-count title is the sanctioned second polite region
              (editMode contract); otherwise the title rides the
              large-title sentinel. */}
          <span
            style={{...styles.navTitle, opacity: state.edit || titleUnderNav ? 1 : 0}}
            className="fyr-fade"
            aria-live={state.edit ? 'polite' : undefined}>
            {navTitleText}
          </span>
          <div style={styles.navTrailing}>
            {state.edit ? (
              <button
                type="button"
                className="fyr-btn fyr-focusable"
                style={{...styles.textBtn, ...styles.textBtnStrong}}
                onClick={doneEdit}>
                Done
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="fyr-btn fyr-focusable"
                  style={styles.iconBtn}
                  aria-label="Refresh requests"
                  onClick={startRefresh}>
                  <Icon icon={RefreshCwIcon} size="md" color="inherit" />
                </button>
                {state.tab === 'requests' ? (
                  <button type="button" className="fyr-btn fyr-focusable" style={styles.textBtn} onClick={enterEdit}>
                    Edit
                  </button>
                ) : null}
              </>
            )}
          </div>
        </header>

        <main style={styles.main}>
          <div ref={sentinelRef} aria-hidden />
          <div style={styles.largeTitleRow}>
            <h1 style={styles.largeTitle}>{TAB_TITLE[state.tab]}</h1>
          </div>

          {state.tab === 'requests' ? (
            <>
              <div style={styles.filterBar}>
                <div role="radiogroup" aria-label="Filter requests" style={styles.segTrack} onKeyDown={onSegKeyDown}>
                  {SEGMENTS.map(segment => {
                    const active = segment === state.segment;
                    return (
                      <button
                        key={segment}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        className="fyr-btn fyr-focusable"
                        style={{...styles.segBtn, ...(active ? styles.segBtnActive : null)}}
                        onClick={() => setState(prev => ({...prev, segment, swipeId: null, menuId: null}))}>
                        {SEGMENT_LABEL[segment]} {segmentCounts[segment]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {state.refreshing ? (
                <div style={{...styles.listCard, marginTop: 4}} aria-busy>
                  {SKELETON_WIDTHS.map((widths, index) => (
                    <div key={widths.primary + index}>
                      {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                      <div style={styles.skeletonRow} aria-hidden>
                        <span style={styles.skeletonAvatar} />
                        <span style={styles.skeletonBars}>
                          <span style={{...styles.skeletonBar, width: widths.primary}} />
                          <span style={{...styles.skeletonBar, width: widths.secondary}} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : visibleRows.length === 0 ? (
                <EmptyState segment={state.segment} />
              ) : (
                <>
                  <div style={{...styles.listCard, marginTop: 4}}>
                    {visibleRows.map((row, index) => (
                      <TrustSignalRow
                        key={row.id}
                        row={row}
                        isLast={index === visibleRows.length - 1}
                        blurPreviews={state.blurPreviews}
                        showMutuals={state.showMutuals}
                        edit={state.edit}
                        selected={state.selected.has(row.id)}
                        swipeOpen={state.swipeId === row.id ? state.swipeSide : null}
                        menuOpen={state.menuId === row.id}
                        exiting={exitingIds.has(row.id)}
                        reducedMotion={reducedMotion}
                        menuRef={menuRef}
                        onPeek={opener => openPeek(row.id, opener)}
                        onToggleSelect={() => toggleSelect(row.id)}
                        onCycleStance={() => cycleStance(row.id)}
                        onSwipe={side =>
                          setState(prev => ({
                            ...prev,
                            swipeId: side == null ? null : row.id,
                            swipeSide: side ?? prev.swipeSide,
                            menuId: null,
                          }))
                        }
                        onToggleMenu={opener => toggleMenu(row.id, opener)}
                        onAccept={() => acceptOne(row.id)}
                        onDecline={() => declineOne(row.id)}
                        onLimit={() => limitOne(row.id)}
                        onBlock={opener => openBlockAlert(row.id, opener)}
                      />
                    ))}
                  </div>
                  <div style={styles.terminalCaption}>
                    All {visibleRows.length} request{visibleRows.length === 1 ? '' : 's'}
                  </div>
                </>
              )}
              {state.refreshed && !state.refreshing ? (
                <div style={styles.updatedCaption}>Updated just now</div>
              ) : null}
            </>
          ) : null}

          {state.tab === 'chats' ? (
            <div style={{...styles.listCard, marginTop: 8}}>
              {state.chats.map((chat, index) => (
                <div key={chat.id}>
                  {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                  <button type="button" className="fyr-btn fyr-focusable" style={styles.chatRowBtn} aria-label={chat.name}>
                    <span style={{...styles.avatar, background: avatarGradient(chat.id)}} aria-hidden>
                      {initialsOf(chat.name)}
                    </span>
                    <span style={styles.rowText}>
                      {chat.isNew ? <span style={styles.chatOverline}>New</span> : null}
                      <span style={styles.primaryLine}>
                        <span style={styles.rowName}>{chat.name}</span>
                      </span>
                      <span style={styles.previewLine}>{chat.line}</span>
                    </span>
                    <span style={styles.stamp}>{chat.stamp}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {state.tab === 'settings' ? (
            <>
              <h2 style={styles.sectionHeader}>Requests</h2>
              <div style={styles.listCard}>
                <SwitchRow
                  label="Filter spam"
                  checked={state.filterSpam}
                  reducedMotion={reducedMotion}
                  onToggle={() => setState(prev => ({...prev, filterSpam: !prev.filterSpam}))}
                />
                <div style={styles.rowDivider} />
                {/* Toggling OFF unblurs every unpeeked row at once —
                    the single-owner proof (stress fixture 7). */}
                <SwitchRow
                  label="Blur previews"
                  checked={state.blurPreviews}
                  reducedMotion={reducedMotion}
                  onToggle={() => setState(prev => ({...prev, blurPreviews: !prev.blurPreviews}))}
                />
                <div style={styles.rowDivider} />
                <SwitchRow
                  label="Show mutuals"
                  checked={state.showMutuals}
                  reducedMotion={reducedMotion}
                  onToggle={() => setState(prev => ({...prev, showMutuals: !prev.showMutuals}))}
                />
              </div>
              <h2 style={styles.sectionHeader}>Notifications</h2>
              <div style={styles.listCard}>
                <SwitchRow
                  label="New request alerts"
                  checked={state.notifyRequests}
                  reducedMotion={reducedMotion}
                  onToggle={() => setState(prev => ({...prev, notifyRequests: !prev.notifyRequests}))}
                />
                <div style={styles.rowDivider} />
                <SwitchRow
                  label="Weekly digest"
                  checked={state.notifyDigest}
                  reducedMotion={reducedMotion}
                  onToggle={() => setState(prev => ({...prev, notifyDigest: !prev.notifyDigest}))}
                />
              </div>
            </>
          ) : null}

          <div style={styles.bottomSpacer} />
        </main>

        {/* THE one polite live region — sticky-in-flow dock 76px above
            the viewport bottom (64 tabBar + 12); persists across tab
            switches; ONE toast at a time, no auto-dismiss timers. */}
        <div style={styles.toastDock} aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="fyr-fade">
              <span style={styles.toastMsg}>{state.toast.text}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="fyr-btn fyr-focusable" style={styles.toastUndo} onClick={undoToast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {state.edit ? (
          <div style={styles.sweepBar}>
            {/* Destructive at the LEADING end (ergonomics law). */}
            <button
              type="button"
              className="fyr-btn fyr-focusable"
              style={{...styles.sweepDecline, ...(declineTally === 0 ? styles.disabledDim : null)}}
              disabled={declineTally === 0}
              aria-disabled={declineTally === 0}
              onClick={executeSweep}>
              Decline {declineTally}
            </button>
            <button type="button" className="fyr-btn fyr-focusable" style={styles.sweepSelectAll} onClick={selectAllInSegment}>
              All in filter ({segmentCounts[state.segment]})
            </button>
            <span style={styles.sweepAcceptHit}>
              <button
                type="button"
                className="fyr-btn fyr-focusable"
                style={{...styles.sweepAccept, ...(acceptTally === 0 ? styles.disabledDim : null)}}
                disabled={acceptTally === 0}
                aria-disabled={acceptTally === 0}
                onClick={executeSweep}>
                Accept {acceptTally}
              </button>
            </span>
          </div>
        ) : (
          <nav style={styles.tabBar} aria-label="Foyer tabs">
            {(['chats', 'requests', 'settings'] as Tab[]).map(tab => {
              const active = tab === state.tab;
              const icon = tab === 'chats' ? MessageCircleIcon : tab === 'requests' ? MailQuestionIcon : SettingsIcon;
              return (
                <button
                  key={tab}
                  type="button"
                  className="fyr-btn fyr-focusable"
                  style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                  aria-current={active ? 'page' : undefined}
                  aria-label={tab === 'requests' ? \`Requests, \${badge} pending\` : TAB_TITLE[tab]}
                  onClick={() => switchTab(tab)}>
                  <span style={styles.tabIconWrap}>
                    <Icon icon={icon} size="md" color="inherit" />
                    {tab === 'requests' && badge > 0 ? (
                      <span style={styles.tabBadge} aria-hidden>
                        {badge}
                      </span>
                    ) : null}
                  </span>
                  <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{TAB_TITLE[tab]}</span>
                </button>
              );
            })}
          </nav>
        )}

        {state.sheetId != null ? <div style={styles.sheetScrim} onClick={closePeek} aria-hidden /> : null}
        {sheetRow != null ? (
          <ContextPeekSheet
            row={sheetRow}
            detent={state.sheetDetent}
            reducedMotion={reducedMotion}
            sheetRef={sheetRef}
            onDetentChange={detent => setState(prev => ({...prev, sheetDetent: detent}))}
            onClose={closePeek}
            onAccept={() => acceptOne(sheetRow.id)}
            onDecline={() => declineOne(sheetRow.id)}
          />
        ) : null}

        {/* Block alert — scrim click does NOT dismiss (the one overlay
            demanding an explicit choice). */}
        {alertRow != null ? (
          <>
            <div style={styles.alertScrim} aria-hidden />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="fyr-alert-title"
              aria-describedby="fyr-alert-body"
              style={styles.alert}
              onKeyDown={event => trapTabKey(event, event.currentTarget)}>
              <div style={styles.alertBody}>
                <h2 id="fyr-alert-title" style={styles.alertTitle}>
                  Block {alertRow.handle}?
                </h2>
                <p id="fyr-alert-body" style={styles.alertText}>
                  They can&rsquo;t message you again. This can&rsquo;t be undone.
                </p>
              </div>
              <div style={styles.alertButtons}>
                <button
                  type="button"
                  ref={alertCancelRef}
                  className="fyr-btn fyr-focusable"
                  style={styles.alertBtn}
                  onClick={cancelBlock}>
                  Cancel
                </button>
                <span style={styles.alertBtnRule} aria-hidden />
                <button
                  type="button"
                  className="fyr-btn fyr-focusable"
                  style={{...styles.alertBtn, ...styles.alertCommit}}
                  onClick={confirmBlock}>
                  Block
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};