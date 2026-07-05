// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Foldover newsletter inbox for
 *   one reader: 5 senders (Morning Ledger daily · The Slipstream weekly ·
 *   Kiln & Crumb biweekly · Tabs Open weekly · Field Notes Quarterly) with
 *   12-week cadence/open histories; 15 issues total = 12 unread + 3
 *   pre-rolled (rollOrder [i13, i14, i15] → 4+6+2 = 12 tray minutes);
 *   per-sender unread cross-check 5+2+1+3+1 = 12 = navBar pill = tab
 *   badge; sender totals 6+3+2+3+1 = 15 ✓; two past digests (Jun 28:
 *   5+4+3+2+4 = 18 min · Jun 21: 6+4+3+2 = 15 min). No Date.now(), no
 *   Math.random(), no network media; 'Updated just now' is a fixed string.
 * @output Foldover — Newsletter Triage: a 390px MOBILE triage surface.
 *   Inbox tab = 5 sender listCards (64px SenderCadenceRow header with a
 *   116px 12-week sparkline + live 'n of m rolled', then 104px issueRows
 *   with a Keep / Roll up / Unsub verdict strip); Senders tab = five 88px
 *   cadence-evidence rows with Unsub/Restore; Digests tab = the past-
 *   digest archive. Signature move: flicking 'Roll up' (button or
 *   swipe-right garnish) grows ONE rollOrder array that every surface
 *   derives from — the 64px sticky DigestTray's paper-spine stack
 *   thickens bar-by-bar while its '3 issues · 12 min' recomputes, the
 *   sender header ticks '1 of 6' → '3 of 6 rolled', the unread pill and
 *   tab badge drop 12 → 8 in the same render, and the two-detent
 *   SundayPreviewSheet's TOC + '7 issues · 23 min' subtitle can never
 *   disagree with the tray. Unsubscribe is undo-over-confirm throughout:
 *   'Unsub' collapses the sender's rows to a 44px stub and raises the
 *   UnsubscribeCooldownToast (10s CSS-drain ring, decorative — NO timer
 *   commit); the batch commits ONLY via the RestoreSheet's 'Confirm n
 *   unsubscribes' or a tab switch (the documented screen-change end of
 *   the undo window), and 'Undo all' restores every row in place.
 * @position Page template; emitted by `astryx template mobile-newsletter-triage`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheets, menus, toast)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While
 *   a sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close; the toastDock switches from sticky-in-flow to
 *   absolute insetInline 16 / bottom 140 for the lock's duration. The
 *   stage clips to --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); anchored menu cards 12px; no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Foldover ember — the demo --color-brand is the demo
 *   logo blue, so the spec hex is quarantined per house rule). Sanctioned
 *   non-brand literals: BRAND_ON (text over brand fills), SPARK_RING (the
 *   sparkline's hollow sent-unopened ring — an interactive-adjacent
 *   evidence boundary, so an explicit ≥3:1-vs-card pair per the
 *   foundations amendment), BTN_EDGE (Keep's rest boundary, same
 *   amendment), and the foundations scrim. Contrast math at each
 *   declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip/button gaps; navBar 52px
 *   sticky top z20 (paddingInline 8, grid '1fr auto 1fr', hairline
 *   ALWAYS ON — chosen variant; the center title fades in via an
 *   IntersectionObserver sentinel under the large title); largeTitle row
 *   52px (28px/700 'Inbox' + trailing brand unread pill, total large
 *   header 104px); tabBar exactly 64px sticky bottom z20 (three flex:1
 *   tabItems, 24px icon over 11px/500 label, 4px gap; badge 16px-min
 *   brand pill top −4 / right −8). BOTTOM STACK (in flow, sticky):
 *   toastDock sticky bottom 140 z18 (bottom 76 when the DigestTray is
 *   hidden; absolute bottom 140 while a sheet locks the shell) ·
 *   DigestTray 64px sticky bottom 64 z19 · tabBar sticky bottom 0 z20.
 *   ROWS: SenderCadenceRow header 64px; issueRow 104px = 56px title zone
 *   + 4px seam + 44px verdict strip (three buttons, 8px gaps, 36px
 *   visual in a 44px hit); kept caption row 44px; unsub stub 44px;
 *   Senders rows 88px; Digest rows 60px; sheet TOC rows 60px; rowDivider
 *   1px inset 16, none on last row; sectionHeader 13px/600 uppercase
 *   0.06em at 32px (16 gutter + 16 card pad), 20px top / 8px bottom.
 *   SHEETS: detents 55% medium / calc(100% − 56px) large; 24px grabber
 *   zone with 36×5 pill (real 'Resize sheet' button on the two-detent
 *   sheet); 52px header; sticky 48px brand footer button. TYPE (Figtree
 *   via --font-family-body): 28/700 large title · 22/700 (unused rank,
 *   reserved) · 17/600 nav + sheet titles · 16/400–600 body + row
 *   primary · 13/400 secondary + meta · 11/500 overlines + tab labels;
 *   nothing under 11px; tabular-nums on every updating count (tray
 *   totals, badges, 'n of m rolled'). Buttons: 48px sheet-footer
 *   primary, 36px secondary, 44×44 icon buttons.
 *
 * GESTURE ↔ BUTTON PARITY: swipe-right ≥72px = Roll up (72px brand
 *   reveal block) with the verdict strip's 'Roll up' as the mandatory
 *   visible path; long-press (450ms, cancel on 8px move) = the same
 *   anchored menu as the row's visible 44×44 ellipsis; sheet drag
 *   between detents = grabber click + X + Escape + scrim.
 *
 * Responsive contract:
 * - Fluid 320–430px: verdict strip = three flex:1 buttons (13px/600
 *   labels fit at 320); sparkline fixed 116px + 32px avatar + gaps, the
 *   sender name (minWidth 0) ellipsizes before 'n of m rolled'; tray
 *   center text ellipsizes before the spine zone or chevron shrink;
 *   sheets insetInline 0; toast insetInline 16. No width literals;
 *   overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout; the anatomy is deliberately phone
 *   geometry. All sticky offsets (0 / 64 / 76 / 140) are height-derived
 *   constants, width-independent.
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
  BookmarkIcon,
  CheckIcon,
  ChevronUpIcon,
  InboxIcon,
  LayersIcon,
  MailOpenIcon,
  MinusCircleIcon,
  MoreHorizontalIcon,
  NewspaperIcon,
  RefreshCwIcon,
  UsersIcon,
  UserXIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Foldover ember). Per spec: white on
// #C2402A ≈ 5.2:1 (≥4.5 ✓); #F0876C on the dark card (~#1C1C1E) ≈ 8.5:1 as
// a fill/glyph (≥3:1 ✓ for non-text UI, and its text pairing is below).
const BRAND_ACCENT = 'light-dark(#C2402A, #F0876C)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #C2402A ≈ 5.2:1 ✓.
// Dark: near-black ink on the salmon fill — #15110C on #F0876C ≈ 7.8:1 ✓.
const BRAND_ON = 'light-dark(#FFFFFF, #15110C)';
// Brand washes (12% chips/tints; 20% fold shadow uses text-primary mix).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Sparkline hollow ring (sent + unopened) — cadence EVIDENCE, so the
// foundations amendment applies: an explicit pair at ≥3:1 against the
// ACTUAL surface (--color-background-card), not a hairline token.
// #6F6154 on the white card ≈ 5.6:1 ✓; #A89C8E on the dark card
// (~#1C1C1E) ≈ 6.9:1 ✓ — both clear 3:1 with margin.
const SPARK_RING = 'light-dark(#6F6154, #A89C8E)';
// Keep-button rest boundary (interactive control boundary, same
// amendment): #8A7A6B on the white card ≈ 3.3:1 ✓; #8F8578 on the dark
// card ≈ 5.0:1 ✓.
const BTN_EDGE = 'light-dark(#8A7A6B, #8F8578)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// the cooldown ring drain (10s, decorative ONLY — no timer commits), the
// tray minutes tick, sheet slide-in, skeleton shimmer, and the roll-up
// arc-out. Transitions animate transform/opacity only and collapse under
// prefers-reduced-motion (shimmer + drain removed entirely; static color
// still encodes the state).
// ---------------------------------------------------------------------------

const FOLDOVER_CSS = `
.fld-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.fld-btn:disabled { cursor: default; }
.fld-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.fld-fade { transition: opacity 200ms ease; }
@keyframes fld-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.fld-sheet-in { animation: fld-sheet-in 240ms ease; }
/* Roll-up exit: the row 'arcs' down-right (transform+opacity only). */
.fld-arc-out {
  transform: translate(28px, 20px) rotate(2deg);
  opacity: 0;
  transition: transform 240ms ease-in, opacity 240ms ease-in;
}
/* Tray minutes tick — 160ms opacity pulse on change (keyed remount). */
@keyframes fld-tick {
  from { opacity: 0.25; }
  to { opacity: 1; }
}
.fld-tick { animation: fld-tick 160ms ease-out; }
/* Cooldown ring drain — 10s stroke-dashoffset sweep, DECORATIVE only:
   nothing commits when it empties; the toast persists. */
@keyframes fld-drain {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: 50.27; }
}
.fld-drain { animation: fld-drain 10s linear forwards; }
/* One shared skeleton shimmer (1.6s), removed under reduced motion. */
@keyframes fld-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.fld-shimmer {
  animation: fld-shimmer 1.6s linear infinite;
}
.fld-vh {
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
  .fld-fade { transition: none; }
  .fld-sheet-in { animation: none; }
  .fld-arc-out { transform: none; transition: opacity 160ms ease-in; }
  .fld-tick { animation: none; }
  .fld-drain { animation: none; }
  .fld-shimmer { animation: none; display: none; }
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
  // NAV BAR — 52px sticky top z20; hairline + blur ALWAYS ON (chosen
  // variant; the large-title fade is wired instead).
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
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
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
  // LARGE TITLE — 52px row below the navBar (total large header 104px).
  largeTitleRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingInline: 16,
  },
  largeTitle: {fontSize: 28, fontWeight: 700, lineHeight: 1.1, margin: 0},
  // Unread pill — BRAND fill, 11px/600 tabular. BRAND_ON math above.
  unreadPill: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  updatedCaption: {
    paddingInline: 16,
    paddingBottom: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline;
  // 12px between stacked cards.
  listCard: {
    position: 'relative',
    marginInline: 16,
    marginBottom: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
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
  // SENDER CADENCE ROW — 64px card header: 32px avatar · name/caption
  // stack · trailing 'n of m rolled'. The sparkline zone is deliberately
  // NON-interactive (no sub-44px targets; dots aria-hidden, caption is
  // the accessible evidence).
  senderHeader: {
    minHeight: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 700,
  },
  senderHeadText: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  senderNameLine: {display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0},
  senderName: {
    minWidth: 0,
    fontSize: 16,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
  },
  senderRolled: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  sparkLine: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  // 12 dots × 6px + 11 gaps × 4px = 116px total.
  sparkRow: {display: 'flex', gap: 4, flexShrink: 0},
  sparkDot: {width: 6, height: 6, borderRadius: 999},
  sparkCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  // ISSUE ROW — 104px = 56px title zone + 4px seam + 44px verdict strip.
  issueOuter: {position: 'relative'},
  issueClip: {position: 'relative', overflow: 'hidden'},
  // Swipe-right reveal — 72px BRAND block on the LEADING edge (garnish;
  // the strip's 'Roll up' is the mandatory visible path).
  swipeReveal: {
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
    color: BRAND_ON,
    fontSize: 13,
    fontWeight: 600,
  },
  issueContent: {
    position: 'relative',
    background: 'var(--color-background-card)',
    paddingInline: 16,
    paddingBottom: 8,
    touchAction: 'pan-y',
  },
  titleZone: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  titleStack: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  issueMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ellipsisBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Verdict strip — 44px zone; each button 44px hit with a 36px visual.
  verdictStrip: {display: 'flex', gap: 8, height: 44, marginTop: 4},
  verdictBtn: {
    flex: 1,
    minWidth: 0,
    height: 44,
    display: 'grid',
    placeItems: 'center',
  },
  verdictVisual: {
    width: '100%',
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // Keep — secondary muted; BTN_EDGE boundary math at the declaration.
  keepVisual: {
    background: 'var(--color-background-muted)',
    border: `1px solid ${BTN_EDGE}`,
    color: 'var(--color-text-primary)',
  },
  rollVisual: {background: BRAND_ACCENT, color: BRAND_ON},
  unsubVisual: {color: 'var(--color-error)'},
  // Kept caption row — 44px, replaces the strip once triaged.
  keptRow: {
    height: 44,
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  // Unsub-pending stub — the sender's rows collapse to this 44px line.
  stubRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
  },
  terminalCaption: {
    margin: '4px 16px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Anchored menu — 12px radius card, 44px rows, destructive LAST.
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    top: 52,
    zIndex: 30,
    minWidth: 224,
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
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // EMPTY STATE — per the foundations anatomy.
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
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 16,
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '4px 0 16px',
  },
  emptyAction: {
    height: 36,
    paddingInline: 16,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'inline-flex',
    alignItems: 'center',
  },
  // SKELETONS — same card, exact 64px + 104px geometries; deterministic
  // staggered widths (60/45/70% primary · 40/55/30% secondary).
  skelHeader: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  skelRow: {
    height: 104,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 10,
    paddingInline: 16,
  },
  skelCircle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  skelShimmerClip: {position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 12, pointerEvents: 'none'},
  skelShimmer: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-background-card) 55%, transparent), transparent)',
  },
  // SENDERS TAB — 88px evidence rows.
  senderRow88: {
    minHeight: 88,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 8,
  },
  senderRowDim: {opacity: 0.6},
  senderRowStack: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  unsubscribedLabel: {fontSize: 13, color: 'var(--color-error)', fontWeight: 500},
  smallActionHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  smallAction: {
    height: 36,
    paddingInline: 14,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  smallActionBrand: {color: BRAND_ACCENT, borderColor: BRAND_ACCENT},
  smallActionError: {color: 'var(--color-error)'},
  // DIGESTS TAB — 60px two-line archive rows.
  digestRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  digestStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  digestPrimary: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  digestSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // DIGEST TRAY — 64px sticky accumulator (bottom 64, z19), ONE button.
  trayBtn: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  // Spine-stack zone — 44×44; one 28×4 brand bar per rolled issue,
  // stacked bottom-up (column-reverse), 2px gaps, capped at 6 + '+n'.
  spineZone: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
    paddingBottom: 2,
  },
  spineBar: {width: 28, height: 4, borderRadius: 2, background: BRAND_ACCENT, flexShrink: 0},
  spinePlus: {
    fontSize: 11,
    fontWeight: 600,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  trayCenter: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    textAlign: 'left',
  },
  trayLabel: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  trayTotals: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  trayChevron: {color: 'var(--color-text-secondary)', flexShrink: 0, display: 'inline-flex'},
  // TAB BAR — exactly 64px, sticky bottom 0 z20, three flex:1 items.
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
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: 1},
  tabLabelActive: {fontWeight: 600},
  // TOAST DOCK — the ONE polite live region. Sticky-in-flow (height 0)
  // so it pins above the tray+tabBar even mid-scroll on tall tabs
  // (shell-absolute would anchor to the DOCUMENT bottom); flips to
  // absolute insetInline 16 / bottom 140 while a sheet locks the shell.
  toastAnchor: {
    position: 'sticky',
    zIndex: 18,
    height: 0,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
  },
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 140,
    zIndex: 42,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 12,
    paddingBlock: 6,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastMsg: {
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    paddingInline: 8,
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  cooldownRing: {flexShrink: 0, display: 'inline-flex', color: BRAND_ACCENT},
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
  },
  sheetTitleStack: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  sheetTitle: {fontSize: 17, fontWeight: 600, margin: 0, lineHeight: 1.2},
  sheetSubtitle: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.2,
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 8},
  sheetSubhead: {
    margin: '16px 0 4px',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  tocRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    paddingInlineEnd: 4,
  },
  tocTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  tocMin: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  confirmBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  restoreRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  restoreStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  restoreName: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  restoreMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  restoreBtn: {
    height: 44,
    paddingInline: 12,
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
    borderRadius: 12,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, every minute value listed so the
// sums are checkable by hand. CROSS-CHECK LEDGER (verified before shipping):
// unread 5+2+1+3+1 = 12 = largeTitle pill = Inbox tab badge; totals per
// sender 6+3+2+3+1 = 15 = 12 unread + 3 pre-rolled ✓; tray at load 4+6+2 =
// 12 min over 3 issues ✓; signature path 12+4+3+2+2 = 23 min over 7 ✓
// (per-issue 4+6+2+4+3+2+2 = 23 ✓); all-rolled stress 12 + (4+3+4+5+4+6+7+
// 2+3+5+2+8 = 53) = 65 min over 15 ✓; digests 5+4+3+2+4 = 18 ✓ and
// 6+4+3+2 = 15 ✓. No Math.random, no Date.now.
// ---------------------------------------------------------------------------

/** One 12-week cadence cell: opened / sent-unopened / no send. */
type Week = 'open' | 'sent' | 'none';

interface Sender {
  id: string;
  name: string;
  initial: string;
  cadence: string; // 'daily' | 'weekly' | ... display form lives in caption
  weeks: Week[]; // exactly 12 — index 0 is 12 weeks ago, 11 is last week
  caption: string; // the accessible cadence evidence (dots are aria-hidden)
}

const SENDERS: Sender[] = [
  {
    id: 's1',
    name: 'Morning Ledger',
    initial: 'M',
    cadence: 'daily',
    // 12/12 sent, opened only weeks 4 and 10 — the over-sender indictment.
    weeks: ['sent', 'sent', 'sent', 'open', 'sent', 'sent', 'sent', 'sent', 'sent', 'open', 'sent', 'sent'],
    caption: 'Sends daily · opened 2 of 12 wks',
  },
  {
    id: 's2',
    name: 'The Slipstream',
    initial: 'S',
    cadence: 'weekly',
    // 12/12 sent, 9 opened (unopened weeks 3, 7, 11).
    weeks: ['open', 'open', 'sent', 'open', 'open', 'open', 'sent', 'open', 'open', 'open', 'sent', 'open'],
    caption: 'Sends weekly · opened 9 of 12 wks',
  },
  {
    id: 's3',
    name: 'Kiln & Crumb',
    initial: 'K',
    cadence: 'biweekly',
    // 6/12 sent (even weeks), all 6 opened — the healthy subscription.
    weeks: ['none', 'open', 'none', 'open', 'none', 'open', 'none', 'open', 'none', 'open', 'none', 'open'],
    caption: 'Sends biweekly · opened 6 of 6 sends',
  },
  {
    id: 's4',
    name: 'Tabs Open',
    initial: 'T',
    cadence: 'weekly',
    // 12/12 sent, 3 opened (weeks 1, 6, 12).
    weeks: ['open', 'sent', 'sent', 'sent', 'sent', 'open', 'sent', 'sent', 'sent', 'sent', 'sent', 'open'],
    caption: 'Sends weekly · opened 3 of 12 wks',
  },
  {
    id: 's5',
    name: 'Field Notes Quarterly',
    initial: 'F',
    cadence: 'quarterly',
    // 1/12 sent (week 6), opened — stress fixture 5: 11 transparent dots
    // + 1 filled must not collapse the 88px row.
    weeks: ['none', 'none', 'none', 'none', 'none', 'open', 'none', 'none', 'none', 'none', 'none', 'none'],
    caption: 'Sends quarterly · opened 1 of 1 sends',
  },
];

const SENDER_BY_ID = Object.fromEntries(SENDERS.map(sender => [sender.id, sender]));

interface Issue {
  id: string;
  senderId: string;
  title: string;
  minutes: number; // dual field beside the rendered 'n min read' label
  day: string;
}

// UNREAD (verdict 'none' at load, 12 total — cross-check 5+2+1+3+1 = 12).
// i7 carries the long-title truncation stress from the spec's stress plan
// (single-line ellipsis in the 104px row, 2-line clamp in the sheet TOC).
const ISSUES: Issue[] = [
  {id: 'i1', senderId: 's1', title: 'Rates hold, markets shrug', minutes: 4, day: 'Mon'},
  {id: 'i2', senderId: 's1', title: 'The Tuesday close', minutes: 3, day: 'Tue'},
  {id: 'i3', senderId: 's1', title: 'Midweek movers', minutes: 4, day: 'Wed'},
  {id: 'i4', senderId: 's1', title: 'Jobs print preview', minutes: 5, day: 'Thu'},
  {id: 'i5', senderId: 's1', title: 'Friday wrap', minutes: 4, day: 'Fri'},
  {id: 'i6', senderId: 's2', title: 'GPU shortage, again', minutes: 6, day: 'Tue'},
  {
    id: 'i7',
    senderId: 's2',
    title: 'The API tax: why every wrapper startup is one pricing email from oblivion',
    minutes: 7,
    day: 'Sun',
  },
  {id: 'i8', senderId: 's3', title: 'Sourdough in July heat', minutes: 2, day: 'Sat'},
  {id: 'i9', senderId: 's4', title: '11 tabs about attention', minutes: 3, day: 'Mon'},
  {id: 'i10', senderId: 's4', title: 'Reading as procrastination', minutes: 5, day: 'Wed'},
  {id: 'i11', senderId: 's4', title: 'The link dump', minutes: 2, day: 'Fri'},
  {id: 'i12', senderId: 's5', title: 'Q2: fences and swallows', minutes: 8, day: 'Tue'},
  // PRE-ROLLED (verdict 'rollup', rollOrder [i13, i14, i15] → 4+6+2 = 12).
  {id: 'i13', senderId: 's1', title: 'Monday brief', minutes: 4, day: 'Mon'},
  {id: 'i14', senderId: 's2', title: 'Chips and moats', minutes: 6, day: 'Thu'},
  {id: 'i15', senderId: 's3', title: 'Lamination basics', minutes: 2, day: 'Sun'},
];

const ISSUE_BY_ID = Object.fromEntries(ISSUES.map(issue => [issue.id, issue]));

interface Digest {
  id: string;
  dateLabel: string;
  minutes: number[]; // per-issue minutes — the aggregate derives from these
  scheduled?: boolean;
}

// PAST DIGESTS — aggregates derive live: 5+4+3+2+4 = 18 ✓; 6+4+3+2 = 15 ✓.
const PAST_DIGESTS: Digest[] = [
  {id: 'd1', dateLabel: 'Sun, Jun 28', minutes: [5, 4, 3, 2, 4]},
  {id: 'd2', dateLabel: 'Sun, Jun 21', minutes: [6, 4, 3, 2]},
];

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useFoldoverState(): one flat state object + one
// update(patch) (functional). EVERY aggregate is DERIVED, never stored:
// unreadCount from verdicts, tray totals from rollOrder, 'n of m rolled'
// from rollOrder ∩ sender issues, sheet subtitle/TOC from rollOrder.
// ---------------------------------------------------------------------------

type TabId = 'inbox' | 'senders' | 'digests';
// 'read' (via the menu's Mark read) leaves the inbox without joining the
// digest; the spec's 'unsub-pending' verdict is DERIVED from unsubBatch
// membership instead of stored per issue (single source of truth).
type Verdict = 'none' | 'keep' | 'read' | 'rollup' | 'scheduled';

interface Toast {
  seq: number;
  kind: 'status' | 'unsub';
  msg: string; // for 'unsub' the visible text derives live from the batch
}

interface FoldoverState {
  tab: TabId;
  scrollByTab: Record<TabId, number>;
  verdicts: Record<string, Verdict>;
  rollOrder: string[]; // issue ids in roll order — THE digest source
  unsubBatch: string[]; // sender ids in the reversible cooldown window
  unsubscribed: Record<string, boolean>; // committed unsubscribes
  digests: Digest[];
  sheetOpen: false | 'medium' | 'large'; // SundayPreviewSheet detent
  restoreSheetOpen: boolean; // medium-only RestoreSheet
  toast: Toast | null;
  refreshed: boolean; // 'Updated just now' fixed caption
  loading: boolean; // skeletons until the next user action
  openSwipeRow: string | null; // row currently mid-swipe (one at a time)
  openMenuRow: string | null; // anchored verdict menu owner
}

const INITIAL_STATE: FoldoverState = {
  tab: 'inbox',
  scrollByTab: {inbox: 0, senders: 0, digests: 0},
  verdicts: Object.fromEntries(
    ISSUES.map(issue => [issue.id, (issue.id === 'i13' || issue.id === 'i14' || issue.id === 'i15' ? 'rollup' : 'none') as Verdict]),
  ),
  rollOrder: ['i13', 'i14', 'i15'],
  unsubBatch: [],
  unsubscribed: {},
  digests: PAST_DIGESTS,
  sheetOpen: false,
  restoreSheetOpen: false,
  toast: null,
  refreshed: false,
  loading: false,
  openSwipeRow: null,
  openMenuRow: null,
};

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
// FOLDOVER MARK — 28px inline SVG in the 44×44 nav slot: a paper square
// (card fill, border stroke) with the top-right corner folded over as a
// BRAND triangle; the fold's shadow stroke traces a lowercase 'f'. The
// shadow is --color-text-primary at 20% (light-dark follows the token
// automatically via color-mix — both schemes stay a soft graphite). Uses
// --color-text-primary, never --color-text.
// ---------------------------------------------------------------------------

function FoldoverMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
        <rect
          x={4}
          y={4}
          width={20}
          height={20}
          rx={3}
          fill="var(--color-background-card)"
          stroke="var(--color-border)"
          strokeWidth={1.5}
        />
        {/* Folded corner — the one brand moment in the chrome. */}
        <path d="M15 4 H21 A3 3 0 0 1 24 7 V13 Z" fill={BRAND_ACCENT} />
        {/* Fold shadow tracing a lowercase 'f' (stem + crossbar). */}
        <path
          d="M15 4 Q13 8 13 13 V21 M10.5 12.5 H16"
          stroke="color-mix(in srgb, var(--color-text-primary) 20%, transparent)"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// CADENCE SPARKLINE — 12 dots × 6px + 11 × 4px gaps = 116px. BRAND fill =
// sent+opened; SPARK_RING 1.5px hollow = sent+unopened (contrast math at
// the literal); transparent = no send (the 6px cell still occupies space —
// stress fixture 5). Decorative (aria-hidden); the caption is the evidence.
// ---------------------------------------------------------------------------

function CadenceSparkline({weeks}: {weeks: Week[]}) {
  return (
    <span style={styles.sparkRow} aria-hidden>
      {weeks.map((week, index) => (
        <span
          // Fixture arrays are static — index keys are stable here.
          key={index}
          style={{
            ...styles.sparkDot,
            ...(week === 'open'
              ? {background: BRAND_ACCENT}
              : week === 'sent'
                ? {boxShadow: `inset 0 0 0 1.5px ${SPARK_RING}`}
                : {background: 'transparent'}),
          }}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// SENDER CADENCE ROW — the 64px sender-card header. 'n of m rolled'
// derives from rollOrder ∩ sender issues; the whole header is the card's
// non-interactive zone (no sub-44px targets near the dots).
// ---------------------------------------------------------------------------

interface SenderCadenceRowProps {
  sender: Sender;
  rolledCount: number;
  totalCount: number;
}

function SenderCadenceRow({sender, rolledCount, totalCount}: SenderCadenceRowProps) {
  return (
    <div style={styles.senderHeader}>
      <span style={styles.avatar} aria-hidden>
        {sender.initial}
      </span>
      <div style={styles.senderHeadText}>
        <div style={styles.senderNameLine}>
          <h2 style={styles.senderName}>{sender.name}</h2>
          <span style={styles.senderRolled}>
            {rolledCount} of {totalCount} rolled
          </span>
        </div>
        <div style={styles.sparkLine}>
          <CadenceSparkline weeks={sender.weeks} />
          <span style={styles.sparkCaption}>{sender.caption}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ISSUE ROW — 104px (56 title zone + 4 seam + 44 verdict strip). The strip
// is the mandatory visible path; swipe-right ≥72px (BRAND reveal block)
// and long-press (450ms, cancel on 8px move → the same anchored menu as
// the 44×44 ellipsis) are garnish. Roll-up arcs the row out 240ms
// (transform+opacity; plain 160ms fade under reduced motion) then commits
// — every derived surface (tray, badge, header counts) moves in that one
// commit render.
// ---------------------------------------------------------------------------

interface IssueRowProps {
  issue: Issue;
  verdict: Verdict;
  isLast: boolean;
  isMenuOpen: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onRollUp: (id: string) => void;
  onKeep: (id: string) => void;
  onMarkRead: (id: string) => void;
  onUnsub: (id: string) => void;
  onToggleMenu: (id: string, opener: HTMLElement) => void;
  onCloseMenu: () => void;
}

function IssueRow({
  issue,
  verdict,
  isLast,
  isMenuOpen,
  reducedMotion,
  menuRef,
  onRollUp,
  onKeep,
  onMarkRead,
  onUnsub,
  onToggleMenu,
  onCloseMenu,
}: IssueRowProps) {
  // Transient gesture state only — verdicts live in the single owner.
  const [dragX, setDragX] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const startRef = useRef({x: 0, y: 0});
  const movedRef = useRef(false);
  const longPressRef = useRef<number | null>(null);
  const longPressFiredRef = useRef(false);
  const commitRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (longPressRef.current != null) window.clearTimeout(longPressRef.current);
      if (commitRef.current != null) window.clearTimeout(commitRef.current);
    },
    [],
  );

  const beginRollUp = () => {
    if (leaving) return;
    setLeaving(true);
    // Animation-then-commit: the arc/fade runs, then ONE state commit
    // moves tray, pill, badge, and header count together.
    commitRef.current = window.setTimeout(() => onRollUp(issue.id), reducedMotion ? 160 : 250);
  };

  const clearLongPress = () => {
    if (longPressRef.current != null) {
      window.clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startRef.current = {x: event.clientX, y: event.clientY};
    movedRef.current = false;
    longPressFiredRef.current = false;
    setDragX(0);
    const opener = event.currentTarget;
    clearLongPress();
    // Long-press garnish → the same menu as the visible ellipsis.
    longPressRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      setDragX(null);
      onToggleMenu(issue.id, opener);
    }, 450);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      movedRef.current = true;
      clearLongPress();
    }
    // Swipe-RIGHT reveal only (0..96px, resistance past the 72px block).
    setDragX(Math.max(0, Math.min(96, dx)));
  };
  const onPointerUp = () => {
    clearLongPress();
    if (dragX == null) return;
    const settled = dragX;
    setDragX(null);
    if (longPressFiredRef.current) return;
    if (movedRef.current && settled >= 72) beginRollUp();
  };

  const guardClick = (handler: () => void) => () => {
    if (movedRef.current || longPressFiredRef.current) {
      movedRef.current = false;
      longPressFiredRef.current = false;
      return;
    }
    handler();
  };

  const offset = dragX ?? 0;
  const metaLabel = `${issue.minutes} min read · ${issue.day}`;
  return (
    <div style={styles.issueOuter}>
      <div style={styles.issueClip}>
        <div style={styles.swipeReveal} aria-hidden={offset < 72}>
          <Icon icon={LayersIcon} size="md" color="inherit" />
          Roll up
        </div>
        <div
          className={leaving ? 'fld-arc-out' : undefined}
          style={{
            ...styles.issueContent,
            transform: offset > 0 ? `translateX(${offset}px)` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 240ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            clearLongPress();
            setDragX(null);
          }}>
          <div style={styles.titleZone}>
            <div style={styles.titleStack}>
              <span style={styles.issueTitle}>{issue.title}</span>
              <span style={styles.issueMeta}>{metaLabel}</span>
            </div>
            <button
              type="button"
              className="fld-btn fld-focusable"
              style={styles.ellipsisBtn}
              aria-label={`More actions: ${issue.title}`}
              aria-expanded={isMenuOpen}
              onClick={event => {
                const opener = event.currentTarget;
                guardClick(() => onToggleMenu(issue.id, opener))();
              }}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </button>
          </div>
          {verdict === 'keep' ? (
            <div style={styles.keptRow}>
              <Icon icon={CheckIcon} size="sm" color="inherit" />
              Kept
            </div>
          ) : (
            <div style={styles.verdictStrip}>
              <button
                type="button"
                className="fld-btn fld-focusable"
                style={styles.verdictBtn}
                aria-label={`Keep: ${issue.title}`}
                onClick={guardClick(() => onKeep(issue.id))}>
                <span style={{...styles.verdictVisual, ...styles.keepVisual}}>Keep</span>
              </button>
              <button
                type="button"
                className="fld-btn fld-focusable"
                style={styles.verdictBtn}
                aria-label={`Roll up: ${issue.title}`}
                onClick={guardClick(beginRollUp)}>
                <span style={{...styles.verdictVisual, ...styles.rollVisual}}>Roll up</span>
              </button>
              <button
                type="button"
                className="fld-btn fld-focusable"
                style={styles.verdictBtn}
                aria-label={`Unsubscribe from ${SENDER_BY_ID[issue.senderId].name}: ${issue.title}`}
                onClick={guardClick(() => onUnsub(issue.id))}>
                <span style={{...styles.verdictVisual, ...styles.unsubVisual}}>Unsub</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {isMenuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={`Actions for ${issue.title}`}
          style={styles.anchoredMenu}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button type="button" role="menuitem" className="fld-btn fld-focusable" style={styles.menuRow} onClick={() => onKeep(issue.id)}>
            <Icon icon={BookmarkIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Keep</span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            role="menuitem"
            className="fld-btn fld-focusable"
            style={styles.menuRow}
            onClick={() => {
              onCloseMenu();
              beginRollUp();
            }}>
            <Icon icon={LayersIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Roll up</span>
          </button>
          <div style={styles.rowDivider} />
          <button
            type="button"
            role="menuitem"
            className="fld-btn fld-focusable"
            style={styles.menuRow}
            onClick={() => onMarkRead(issue.id)}>
            <Icon icon={MailOpenIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Mark read</span>
          </button>
          <div style={styles.rowDivider} />
          {/* Destructive verb LAST, behind one intent step (ergonomics). */}
          <button
            type="button"
            role="menuitem"
            className="fld-btn fld-focusable"
            style={{...styles.menuRow, ...styles.menuRowDestructive}}
            onClick={() => onUnsub(issue.id)}>
            <Icon icon={UserXIcon} size="sm" color="inherit" />
            <span style={styles.menuRowText}>Unsubscribe sender</span>
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DIGEST TRAY — the 64px sticky accumulator (bottom 64, z19), rendered
// only while rollOrder has issues; the WHOLE tray is one real button. The
// spine stack draws one 28×4 bar per rolled issue bottom-up (cap 6, then
// '+n'); totals recompute from rollOrder every render — never a stored
// counter. The minutes line remounts (key) for its 160ms tick, removed
// under reduced motion (the new value still renders).
// ---------------------------------------------------------------------------

interface DigestTrayProps {
  count: number;
  minutes: number;
  reducedMotion: boolean;
  onOpen: (opener: HTMLElement) => void;
}

function DigestTray({count, minutes, reducedMotion, onOpen}: DigestTrayProps) {
  const bars = Math.min(count, 6);
  return (
    <button
      type="button"
      className="fld-btn fld-focusable"
      style={styles.trayBtn}
      aria-label={`Open Sunday digest preview — ${count} issues, ${minutes} minutes`}
      onClick={event => onOpen(event.currentTarget)}>
      <span style={styles.spineZone} aria-hidden>
        {count > 6 ? <span style={styles.spinePlus}>+{count - 6}</span> : null}
        {Array.from({length: bars}, (_, index) => (
          <span key={index} style={styles.spineBar} />
        ))}
      </span>
      <span style={styles.trayCenter}>
        <span style={styles.trayLabel}>Sunday digest</span>
        <span
          key={`${count}-${minutes}`}
          className={reducedMotion ? undefined : 'fld-tick'}
          style={styles.trayTotals}>
          {count} issues · {minutes} min
        </span>
      </span>
      <span style={styles.trayChevron} aria-hidden>
        <Icon icon={ChevronUpIcon} size="md" color="inherit" />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// UNSUBSCRIBE COOLDOWN TOAST — lives in the ONE polite toastDock. The 20px
// ring drains once over 10s via CSS only (decorative: it rests empty and
// the toast persists — NO setTimeout, NO auto-commit; static full ring
// under reduced motion). The body is a real button reopening the batch as
// the RestoreSheet; 'Undo all' restores every sender. The batch commits
// ONLY via the RestoreSheet's confirm or a tab switch.
// ---------------------------------------------------------------------------

interface CooldownToastProps {
  batchSize: number;
  batchKey: string;
  reducedMotion: boolean;
  bodyRef: RefObject<HTMLButtonElement | null>;
  onOpenRestore: (opener: HTMLElement) => void;
  onUndoAll: () => void;
}

function CooldownToast({batchSize, batchKey, reducedMotion, bodyRef, onOpenRestore, onUndoAll}: CooldownToastProps) {
  return (
    <div style={styles.toast}>
      <span style={styles.cooldownRing} aria-hidden>
        {/* r=8 → circumference 2π·8 ≈ 50.27 (the dasharray below). */}
        <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <circle cx={10} cy={10} r={8} stroke="var(--color-border)" strokeWidth={2.5} />
          <circle
            key={batchKey}
            className={reducedMotion ? undefined : 'fld-drain'}
            cx={10}
            cy={10}
            r={8}
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="50.27"
            strokeDashoffset={0}
            transform="rotate(-90 10 10)"
          />
        </svg>
      </span>
      <button
        type="button"
        ref={bodyRef}
        className="fld-btn fld-focusable"
        style={styles.toastMsg}
        aria-label={`Unsubscribing ${batchSize} ${batchSize === 1 ? 'sender' : 'senders'} — review the batch`}
        onClick={event => onOpenRestore(event.currentTarget)}>
        Unsubscribing {batchSize} {batchSize === 1 ? 'sender' : 'senders'}
      </button>
      <span style={styles.toastRule} aria-hidden />
      <button type="button" className="fld-btn fld-focusable" style={styles.toastUndo} onClick={onUndoAll}>
        Undo all
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button on the
// two-detent Sunday sheet; decorative pill on the medium-only Restore
// sheet), 52px header (title + live subtitle + 44×44 X), focus-trapped
// dialog. Drag between detents is garnish; >120px past medium closes.
// Sheets never stack: opening one closes the other.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  subtitle: string | null;
  detent: 'medium' | 'large';
  resizable: boolean;
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({
  titleId,
  title,
  subtitle,
  detent,
  resizable,
  onDetentChange,
  onClose,
  sheetRef,
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
      className="fld-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease, height 240ms ease',
      }}>
      {resizable ? (
        <button
          type="button"
          className="fld-btn fld-focusable"
          style={styles.grabberZone}
          aria-label="Resize sheet"
          onPointerDown={onGrabberPointerDown}
          onPointerMove={onGrabberPointerMove}
          onPointerUp={onGrabberPointerUp}
          onClick={onGrabberClick}>
          <span style={styles.grabberPill} aria-hidden />
        </button>
      ) : (
        <div style={styles.grabberZone} aria-hidden>
          <span style={styles.grabberPill} />
        </div>
      )}
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <div style={styles.sheetTitleStack}>
          <h2 id={titleId} style={styles.sheetTitle}>
            {title}
          </h2>
          {subtitle != null ? <span style={styles.sheetSubtitle}>{subtitle}</span> : null}
        </div>
        <button type="button" className="fld-btn fld-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — ONE state owner; every count on screen derives from verdicts +
// rollOrder + unsubBatch in the same render.
// ---------------------------------------------------------------------------

const TABS: {id: TabId; label: string; icon: typeof InboxIcon}[] = [
  {id: 'inbox', label: 'Inbox', icon: InboxIcon},
  {id: 'senders', label: 'Senders', icon: UsersIcon},
  {id: 'digests', label: 'Digests', icon: NewspaperIcon},
];

const TAB_TITLES: Record<TabId, string> = {inbox: 'Inbox', senders: 'Senders', digests: 'Digests'};

// Deterministic skeleton widths — 60/45/70(/60)% primary, 40/55/30(/40)%
// secondary; never Math.random().
const SKELETON_PRIMARY = ['60%', '45%', '70%', '60%'];
const SKELETON_SECONDARY = ['40%', '55%', '30%', '40%'];

export default function MobileNewsletterTriageTemplate() {
  // Desktop-stage decision — container width via ResizeObserver; the
  // viewport query is only the first-frame fallback.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<FoldoverState>(INITIAL_STATE);
  // The one mutation door — functional patches so gesture callbacks stay
  // stable against stale closures.
  const update = useCallback((patch: (prev: FoldoverState) => Partial<FoldoverState>) => {
    setState(prev => ({...prev, ...patch(prev)}));
  }, []);

  // Focus plumbing — every overlay restores focus to its opener.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const sundaySheetRef = useRef<HTMLDivElement | null>(null);
  const restoreSheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toastBodyRef = useRef<HTMLButtonElement | null>(null);
  const tabBarRef = useRef<HTMLDivElement | null>(null);
  const toastSeqRef = useRef(0);
  const [titleUnderNav, setTitleUnderNav] = useState(false);

  // DERIVED — never stored. unreadCount counts verdict 'none' issues of
  // still-subscribed senders (a batch-pending sender's issues are muted
  // but still pending until the commit); tray totals recompute from
  // rollOrder on every render.
  const {verdicts, rollOrder, unsubBatch, unsubscribed} = state;
  const unreadCount = ISSUES.filter(
    issue => verdicts[issue.id] === 'none' && !unsubscribed[issue.senderId],
  ).length;
  const trayCount = rollOrder.length;
  const trayMinutes = rollOrder.reduce((sum, id) => sum + ISSUE_BY_ID[id].minutes, 0);
  const rolledBySender = Object.fromEntries(
    SENDERS.map(sender => [
      sender.id,
      rollOrder.filter(id => ISSUE_BY_ID[id].senderId === sender.id).length,
    ]),
  );
  const totalBySender = Object.fromEntries(
    SENDERS.map(sender => [sender.id, ISSUES.filter(issue => issue.senderId === sender.id).length]),
  );
  const allUnsubscribed = SENDERS.every(sender => unsubscribed[sender.id]);
  const sheetLocked = state.sheetOpen !== false || state.restoreSheetOpen;
  const trayVisible = trayCount > 0;

  const nextToast = (kind: Toast['kind'], msg: string): Toast => {
    toastSeqRef.current += 1;
    return {seq: toastSeqRef.current, kind, msg};
  };
  // Every user action resolves a pending refresh (skeletons never sit on
  // a timer) — fold this into each mutation.
  const afterAction = (prev: FoldoverState) => ({
    loading: false,
    refreshed: prev.refreshed || prev.loading,
  });
  // The cooldown window ends when its toast is REPLACED by a new
  // mutation (undo-over-confirm law: one toast; a new mutation ends the
  // old undo window) — ending the unsubscribe window means committing.
  const commitBatch = (prev: FoldoverState) => {
    if (prev.unsubBatch.length === 0) return {};
    return {
      unsubscribed: {
        ...prev.unsubscribed,
        ...Object.fromEntries(prev.unsubBatch.map(id => [id, true])),
      },
      unsubBatch: [] as string[],
    };
  };

  // VERDICT PATHS — one commit render moves tray, pill, badge, headers.
  const rollUp = (issueId: string) => {
    update(prev => {
      if (prev.verdicts[issueId] === 'rollup') return {};
      const nextOrder = [...prev.rollOrder, issueId];
      const nextMinutes = nextOrder.reduce((sum, id) => sum + ISSUE_BY_ID[id].minutes, 0);
      return {
        ...afterAction(prev),
        ...commitBatch(prev),
        verdicts: {...prev.verdicts, [issueId]: 'rollup' as Verdict},
        rollOrder: nextOrder,
        openMenuRow: null,
        toast: nextToast('status', `Rolled up — ${nextOrder.length} issues, ${nextMinutes} min`),
      };
    });
  };
  const keepIssue = (issueId: string) => {
    update(prev => ({
      ...afterAction(prev),
      ...commitBatch(prev),
      verdicts: {...prev.verdicts, [issueId]: 'keep' as Verdict},
      openMenuRow: null,
      toast: nextToast('status', `Kept — ${ISSUE_BY_ID[issueId].title}`),
    }));
  };
  const markRead = (issueId: string) => {
    update(prev => ({
      ...afterAction(prev),
      ...commitBatch(prev),
      verdicts: {...prev.verdicts, [issueId]: 'read' as Verdict},
      openMenuRow: null,
      toast: nextToast('status', 'Marked read'),
    }));
  };
  // UNSUB — reversible, so it executes immediately (rows collapse to the
  // stub) and the cooldown toast opens the undo window. NO confirm modal.
  const unsubSender = (senderId: string) => {
    update(prev => {
      if (prev.unsubBatch.includes(senderId) || prev.unsubscribed[senderId]) {
        return {openMenuRow: null};
      }
      const nextBatch = [...prev.unsubBatch, senderId];
      return {
        ...afterAction(prev),
        unsubBatch: nextBatch,
        openMenuRow: null,
        toast: nextToast('unsub', ''),
      };
    });
  };
  const undoAll = () => {
    update(prev => ({
      ...afterAction(prev),
      unsubBatch: [],
      restoreSheetOpen: false,
      toast: nextToast('status', 'Restored'),
    }));
  };
  const restoreOne = (senderId: string) => {
    update(prev => {
      const nextBatch = prev.unsubBatch.filter(id => id !== senderId);
      return {
        ...afterAction(prev),
        unsubBatch: nextBatch,
        restoreSheetOpen: nextBatch.length > 0 && prev.restoreSheetOpen,
        toast: nextBatch.length === 0 ? nextToast('status', 'Restored') : prev.toast,
      };
    });
  };
  const confirmUnsubs = () => {
    const count = state.unsubBatch.length;
    update(prev => ({
      ...afterAction(prev),
      ...commitBatch(prev),
      restoreSheetOpen: false,
      toast: nextToast('status', `Unsubscribed ${count} ${count === 1 ? 'sender' : 'senders'}`),
    }));
    tabBarRef.current?.querySelector('button')?.focus();
  };
  // Committed-sender resubscribe (Senders tab 'Restore').
  const resubscribe = (senderId: string) => {
    update(prev => ({
      ...afterAction(prev),
      unsubscribed: {...prev.unsubscribed, [senderId]: false},
      toast: nextToast('status', `Restored ${SENDER_BY_ID[senderId].name}`),
    }));
  };

  // SHEET LIFECYCLE — sheets never stack; opening one closes the other.
  const openSunday = (opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    update(prev => ({
      ...afterAction(prev),
      sheetOpen: 'medium' as const,
      restoreSheetOpen: false,
      openMenuRow: null,
    }));
  };
  const closeSunday = () => {
    update(() => ({sheetOpen: false as const}));
    sheetOpenerRef.current?.focus();
  };
  const openRestore = (opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    update(() => ({restoreSheetOpen: true, sheetOpen: false as const, openMenuRow: null}));
  };
  const closeRestore = () => {
    update(() => ({restoreSheetOpen: false}));
    // The opener is the toast body, which persists while the batch does.
    const opener = sheetOpenerRef.current;
    if (opener != null && opener.isConnected) opener.focus();
  };
  const removeFromRoll = (issueId: string) => {
    update(prev => ({
      ...afterAction(prev),
      verdicts: {...prev.verdicts, [issueId]: 'none' as Verdict},
      rollOrder: prev.rollOrder.filter(id => id !== issueId),
    }));
  };
  const scheduleDigest = () => {
    update(prev => {
      if (prev.rollOrder.length === 0) return {};
      const minutes = prev.rollOrder.map(id => ISSUE_BY_ID[id].minutes);
      const total = minutes.reduce((sum, value) => sum + value, 0);
      return {
        ...afterAction(prev),
        digests: [
          {id: `d0-${prev.digests.length}`, dateLabel: 'Sun, Jul 6', minutes, scheduled: true},
          ...prev.digests,
        ],
        verdicts: {
          ...prev.verdicts,
          ...Object.fromEntries(prev.rollOrder.map(id => [id, 'scheduled' as Verdict])),
        },
        rollOrder: [],
        sheetOpen: false as const,
        toast: nextToast('status', `Scheduled for Sunday — ${prev.rollOrder.length} issues, ${total} min`),
      };
    });
    sheetOpenerRef.current?.focus();
  };

  // MENUS.
  const toggleMenu = (issueId: string, opener: HTMLElement) => {
    menuOpenerRef.current = opener;
    update(prev => ({openMenuRow: prev.openMenuRow === issueId ? null : issueId}));
  };
  const closeMenu = () => {
    update(() => ({openMenuRow: null}));
    menuOpenerRef.current?.focus();
  };

  // TABS — per-tab scroll persists; overlays close; the pending unsub
  // batch COMMITS (the documented screen-change end of the undo window);
  // re-tapping the active tab scrolls to top.
  const findScroller = (): Element | null => {
    let element: HTMLElement | null = wrapRef.current;
    while (element != null) {
      const overflowY = getComputedStyle(element).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight) {
        return element;
      }
      element = element.parentElement;
    }
    return document.scrollingElement;
  };
  const selectTab = (next: TabId) => {
    const scroller = findScroller();
    if (next === state.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    update(prev => {
      const committed = prev.unsubBatch.length;
      return {
        ...afterAction(prev),
        tab: next,
        scrollByTab: {...prev.scrollByTab, [prev.tab]: scroller?.scrollTop ?? 0},
        ...commitBatch(prev),
        sheetOpen: false as const,
        restoreSheetOpen: false,
        openMenuRow: null,
        toast:
          committed > 0
            ? nextToast('status', `Unsubscribed ${committed} ${committed === 1 ? 'sender' : 'senders'}`)
            : prev.toast,
      };
    });
  };
  useEffect(() => {
    const scroller = findScroller();
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.tab] ?? 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);
  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TABS.map(tab => tab.id);
    const current = order.indexOf(state.tab);
    const next =
      event.key === 'ArrowRight'
        ? order[(current + 1) % order.length]
        : order[(current + order.length - 1) % order.length];
    selectTab(next);
    tabBarRef.current?.querySelectorAll('button')[order.indexOf(next)]?.focus();
  };

  // REFRESH — explicit button (pull-to-refresh is banned); skeletons
  // resolve on the NEXT user action, never a timer.
  const pressRefresh = () => {
    if (state.loading) return;
    update(() => ({loading: true, refreshed: false, toast: nextToast('status', 'Loading')}));
  };

  // Large-title collapse — IntersectionObserver sentinel (user-driven).
  useEffect(() => {
    if (state.tab !== 'inbox') return undefined;
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry != null) setTitleUnderNav(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [state.tab]);

  // Focus INTO an opening sheet — preventScroll, because the locked
  // overflow-hidden shell would otherwise scroll-reveal the animating
  // sheet and beach it mid-screen (foundations amendment).
  useEffect(() => {
    if (state.sheetOpen !== false) {
      sundaySheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [state.sheetOpen]);
  useEffect(() => {
    if (state.restoreSheetOpen) {
      restoreSheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [state.restoreSheetOpen]);
  useEffect(() => {
    if (state.openMenuRow != null) menuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [state.openMenuRow]);

  // Escape closes the TOPMOST overlay only: menu > RestoreSheet > Sunday.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.openMenuRow != null) closeMenu();
      else if (state.restoreSheetOpen) closeRestore();
      else if (state.sheetOpen !== false) closeSunday();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.openMenuRow, state.restoreSheetOpen, state.sheetOpen]);

  // INBOX derivations — a sender card renders while it has visible rows
  // (unread/kept) or sits in the cooldown batch (44px stub).
  const inboxCards = SENDERS.map(sender => {
    if (unsubscribed[sender.id]) return null;
    const pending = unsubBatch.includes(sender.id);
    const rows = ISSUES.filter(
      issue => issue.senderId === sender.id && (verdicts[issue.id] === 'none' || verdicts[issue.id] === 'keep'),
    );
    if (!pending && rows.length === 0) return null;
    return {sender, pending, rows};
  }).filter(card => card != null);
  const inboxEmpty = inboxCards.length === 0;

  // Sheet TOC — rollOrder grouped under sender subheads by first
  // appearance, so tray, badge, and TOC derive from the SAME array.
  const tocGroups: {sender: Sender; ids: string[]}[] = [];
  for (const id of rollOrder) {
    const sender = SENDER_BY_ID[ISSUE_BY_ID[id].senderId];
    const group = tocGroups.find(candidate => candidate.sender.id === sender.id);
    if (group == null) tocGroups.push({sender, ids: [id]});
    else group.ids.push(id);
  }

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(sheetLocked ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };
  const toastAnchorStyle: CSSProperties = sheetLocked
    ? styles.toastAnchorLocked
    : {...styles.toastAnchor, bottom: trayVisible ? 140 : 76};

  const batchKey = unsubBatch.join('-');
  const navTitle = TAB_TITLES[state.tab];

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{FOLDOVER_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — 52px sticky; hairline always-on (chosen variant). */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <FoldoverMark />
          </div>
          <div
            className="fld-fade"
            style={{
              ...styles.navTitle,
              opacity: state.tab === 'inbox' && !titleUnderNav ? 0 : 1,
            }}
            aria-hidden={state.tab === 'inbox' && !titleUnderNav}>
            {navTitle}
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="fld-btn fld-focusable"
              style={styles.iconBtn}
              aria-label="Refresh inbox"
              onClick={pressRefresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'inbox' ? (
            <>
              <div ref={sentinelRef} aria-hidden />
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Inbox</h1>
                {unreadCount > 0 ? <span style={styles.unreadPill}>{unreadCount} unread</span> : null}
              </div>
            </>
          ) : (
            <h1 className="fld-vh">{navTitle}</h1>
          )}
          {state.refreshed && !state.loading ? (
            <div style={styles.updatedCaption}>Updated just now</div>
          ) : null}

          {state.loading ? (
            // SKELETON — same card, exact 64px + 104px geometries; one
            // shared 1.6s shimmer, removed entirely under reduced motion;
            // 'Loading' was announced ONCE via the toastDock on press.
            <div style={{...styles.listCard, marginTop: 8, overflow: 'hidden'}} aria-busy="true">
              <div style={styles.skelHeader} aria-hidden>
                <span style={styles.skelCircle} />
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 8}}>
                  <span style={{...styles.skelBar, width: SKELETON_PRIMARY[0]}} />
                  <span style={{...styles.skelBar, width: SKELETON_SECONDARY[0], height: 8}} />
                </div>
              </div>
              <div style={styles.rowDivider} aria-hidden />
              {[1, 2, 3].map(index => (
                <div key={index} aria-hidden>
                  <div style={styles.skelRow}>
                    <span style={{...styles.skelBar, width: SKELETON_PRIMARY[index]}} />
                    <span style={{...styles.skelBar, width: SKELETON_SECONDARY[index], height: 8}} />
                    <div style={{display: 'flex', gap: 8, marginTop: 6}}>
                      <span style={{...styles.skelBar, flex: 1, height: 36, borderRadius: 8}} />
                      <span style={{...styles.skelBar, flex: 1, height: 36, borderRadius: 8}} />
                      <span style={{...styles.skelBar, flex: 1, height: 36, borderRadius: 8}} />
                    </div>
                  </div>
                  {index < 3 ? <div style={styles.rowDivider} /> : null}
                </div>
              ))}
              {!reducedMotion ? (
                <div style={styles.skelShimmerClip} aria-hidden>
                  <div className="fld-shimmer" style={styles.skelShimmer} />
                </div>
              ) : null}
            </div>
          ) : state.tab === 'inbox' ? (
            inboxEmpty ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyCircle}>
                  <Icon icon={InboxIcon} size="lg" color="inherit" />
                </span>
                <h2 style={styles.emptyTitle}>{allUnsubscribed ? 'No subscriptions' : 'Inbox zero'}</h2>
                <p style={styles.emptyBody}>
                  {allUnsubscribed
                    ? 'Newsletters you subscribe to appear here.'
                    : 'Everything is rolled into Sunday.'}
                </p>
                {/* One action or none — none on true-empty (creation is
                    not the verb here); 'Preview digest' on filtered. */}
                {!allUnsubscribed && trayVisible ? (
                  <button
                    type="button"
                    className="fld-btn fld-focusable"
                    style={styles.emptyAction}
                    onClick={event => openSunday(event.currentTarget)}>
                    Preview digest
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <div style={{height: 8}} aria-hidden />
                {inboxCards.map(card => (
                  <section key={card.sender.id} style={styles.listCard}>
                    <SenderCadenceRow
                      sender={card.sender}
                      rolledCount={rolledBySender[card.sender.id]}
                      totalCount={totalBySender[card.sender.id]}
                    />
                    <div style={styles.rowDivider} />
                    {card.pending ? (
                      <div style={styles.stubRow}>Unsubscribing — issues muted</div>
                    ) : (
                      card.rows.map((issue, index) => (
                        <IssueRow
                          key={issue.id}
                          issue={issue}
                          verdict={verdicts[issue.id]}
                          isLast={index === card.rows.length - 1}
                          isMenuOpen={state.openMenuRow === issue.id}
                          reducedMotion={reducedMotion}
                          menuRef={menuRef}
                          onRollUp={rollUp}
                          onKeep={keepIssue}
                          onMarkRead={markRead}
                          onUnsub={id => unsubSender(ISSUE_BY_ID[id].senderId)}
                          onToggleMenu={toggleMenu}
                          onCloseMenu={() => update(() => ({openMenuRow: null}))}
                        />
                      ))
                    )}
                  </section>
                ))}
                <div style={styles.terminalCaption}>All {unreadCount} unread issues</div>
              </>
            )
          ) : state.tab === 'senders' ? (
            <>
              <h2 style={styles.sectionHeader}>All senders</h2>
              <div style={styles.listCard}>
                {SENDERS.map((sender, index) => {
                  const isOut = Boolean(unsubscribed[sender.id]);
                  const isPending = unsubBatch.includes(sender.id);
                  return (
                    <div key={sender.id}>
                      <div style={{...styles.senderRow88, ...(isOut ? styles.senderRowDim : null)}}>
                        <div style={styles.senderRowStack}>
                          <h2 style={{...styles.senderName, fontWeight: 500}}>{sender.name}</h2>
                          <CadenceSparkline weeks={sender.weeks} />
                          <span style={styles.sparkCaption}>{sender.caption}</span>
                          {isOut ? <span style={styles.unsubscribedLabel}>Unsubscribed</span> : null}
                          {isPending ? <span style={styles.unsubscribedLabel}>Unsubscribing…</span> : null}
                        </div>
                        <span style={styles.smallActionHit}>
                          {isOut ? (
                            <button
                              type="button"
                              className="fld-btn fld-focusable"
                              style={{...styles.smallAction, ...styles.smallActionBrand}}
                              onClick={() => resubscribe(sender.id)}>
                              Restore
                            </button>
                          ) : isPending ? (
                            <button
                              type="button"
                              className="fld-btn fld-focusable"
                              style={{...styles.smallAction, ...styles.smallActionBrand}}
                              onClick={() => restoreOne(sender.id)}>
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="fld-btn fld-focusable"
                              style={{...styles.smallAction, ...styles.smallActionError}}
                              onClick={() => unsubSender(sender.id)}>
                              Unsub
                            </button>
                          )}
                        </span>
                      </div>
                      {index < SENDERS.length - 1 ? <div style={styles.rowDivider} /> : null}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h2 style={styles.sectionHeader}>Past digests</h2>
              {state.digests.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyCircle}>
                    <Icon icon={NewspaperIcon} size="lg" color="inherit" />
                  </span>
                  <h2 style={styles.emptyTitle}>No digests yet</h2>
                  <p style={styles.emptyBody}>Roll issues up and they arrive here on Sundays.</p>
                </div>
              ) : (
                <div style={styles.listCard}>
                  {state.digests.map((digest, index) => {
                    const total = digest.minutes.reduce((sum, value) => sum + value, 0);
                    return (
                      <div key={digest.id}>
                        <div style={styles.digestRow}>
                          <div style={styles.digestStack}>
                            <span style={styles.digestPrimary}>{digest.dateLabel}</span>
                            <span style={styles.digestSecondary}>
                              {digest.minutes.length} issues, {total} min
                              {digest.scheduled ? ' · scheduled' : ''}
                            </span>
                          </div>
                        </div>
                        {index < state.digests.length - 1 ? <div style={styles.rowDivider} /> : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>

        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow above
            the tray+tabBar (140/76), absolute at 140 while sheet-locked. */}
        <div style={toastAnchorStyle} aria-live="polite">
          {state.toast != null ? (
            state.toast.kind === 'unsub' && unsubBatch.length > 0 ? (
              <CooldownToast
                batchSize={unsubBatch.length}
                batchKey={batchKey}
                reducedMotion={reducedMotion}
                bodyRef={toastBodyRef}
                onOpenRestore={openRestore}
                onUndoAll={undoAll}
              />
            ) : state.toast.kind === 'status' ? (
              <div key={state.toast.seq} style={{...styles.toast, pointerEvents: 'none'}} className="fld-fade">
                <span style={styles.toastMsg}>{state.toast.msg}</span>
              </div>
            ) : null
          ) : null}
        </div>

        {/* DIGEST TRAY — sticky bottom 64, only while rollOrder rolls. */}
        {trayVisible ? (
          <DigestTray count={trayCount} minutes={trayMinutes} reducedMotion={reducedMotion} onOpen={openSunday} />
        ) : null}

        {/* TAB BAR — 64px, tablist with arrow keys; badge derives. */}
        <div ref={tabBarRef} role="tablist" aria-label="Foldover sections" style={styles.tabBar} onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const isActive = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="fld-btn fld-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'inbox' && unreadCount > 0 ? (
                    <span style={styles.tabBadge}>{unreadCount}</span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* OVERLAYS — absolute in shell; scrim click closes. */}
        {sheetLocked ? (
          <div
            style={styles.sheetScrim}
            onClick={() => (state.restoreSheetOpen ? closeRestore() : closeSunday())}
            aria-hidden
          />
        ) : null}
        {state.sheetOpen !== false ? (
          <Sheet
            titleId="fld-sunday-title"
            title="Sunday digest"
            subtitle={`${trayCount} issues · ${trayMinutes} min`}
            detent={state.sheetOpen}
            resizable
            onDetentChange={detent => update(() => ({sheetOpen: detent}))}
            onClose={closeSunday}
            sheetRef={sundaySheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button
                type="button"
                className="fld-btn fld-focusable"
                style={{
                  ...styles.confirmBtn,
                  ...(trayCount === 0 ? {background: 'var(--color-background-muted)', color: 'var(--color-text-secondary)'} : null),
                }}
                disabled={trayCount === 0}
                aria-disabled={trayCount === 0}
                onClick={scheduleDigest}>
                Schedule for Sunday
              </button>
            }>
            {tocGroups.length === 0 ? (
              <div style={{...styles.stubRow, fontStyle: 'normal'}}>Nothing rolled yet — flick issues into the digest.</div>
            ) : (
              tocGroups.map(group => (
                <div key={group.sender.id}>
                  <h3 style={styles.sheetSubhead}>{group.sender.name}</h3>
                  {group.ids.map((id, index) => {
                    const issue = ISSUE_BY_ID[id];
                    return (
                      <div key={id}>
                        <div style={styles.tocRow}>
                          <span style={styles.tocTitle}>{issue.title}</span>
                          <span style={styles.tocMin}>{issue.minutes} min</span>
                          <button
                            type="button"
                            className="fld-btn fld-focusable"
                            style={styles.ellipsisBtn}
                            aria-label={`Remove from digest: ${issue.title}`}
                            onClick={() => removeFromRoll(id)}>
                            <Icon icon={MinusCircleIcon} size="md" color="inherit" />
                          </button>
                        </div>
                        {index < group.ids.length - 1 ? <div style={styles.rowDivider} /> : null}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </Sheet>
        ) : null}
        {state.restoreSheetOpen ? (
          <Sheet
            titleId="fld-restore-title"
            title={`Unsubscribing ${unsubBatch.length}`}
            subtitle="Restore any, or confirm the batch"
            detent="medium"
            resizable={false}
            onDetentChange={() => undefined}
            onClose={closeRestore}
            sheetRef={restoreSheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button
                type="button"
                className="fld-btn fld-focusable"
                style={styles.confirmBtn}
                onClick={confirmUnsubs}>
                Confirm {unsubBatch.length} {unsubBatch.length === 1 ? 'unsubscribe' : 'unsubscribes'}
              </button>
            }>
            {unsubBatch.map((senderId, index) => {
              const sender = SENDER_BY_ID[senderId];
              const muted = ISSUES.filter(
                issue => issue.senderId === senderId && verdicts[issue.id] === 'none',
              ).length;
              return (
                <div key={senderId}>
                  <div style={styles.restoreRow}>
                    <div style={styles.restoreStack}>
                      <span style={styles.restoreName}>{sender.name}</span>
                      <span style={styles.restoreMeta}>
                        {sender.caption} · {muted} unread muted
                      </span>
                    </div>
                    <button
                      type="button"
                      className="fld-btn fld-focusable"
                      style={styles.restoreBtn}
                      aria-label={`Restore ${sender.name}`}
                      onClick={() => restoreOne(senderId)}>
                      Restore
                    </button>
                  </div>
                  {index < unsubBatch.length - 1 ? <div style={styles.rowDivider} /> : null}
                </div>
              );
            })}
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
