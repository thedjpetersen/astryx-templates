var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Sevenfold GTD weekly review:
 *   ONE shared store of 25 items across six steps (5 inbox + 3 past-week
 *   calendar + 6 stale tasks + 4 projects + 4 someday + 3 calendar-ahead
 *   = 25, cross-checked below), with exactly 3 stale tasks carrying
 *   projectId p-02 'Garage rebuild' (the cascade set: t-03/t-05/t-06).
 *   Ages are fixed strings ('Captured 47 days ago'); day/time labels are
 *   fixed ('TUE 09:30'). No Date.now(), no Math.random(), no network
 *   media, no real maps/photos.
 * @output Sevenfold — Weekly Review Walkthrough: a 390px MOBILE
 *   seven-step, thumb-paced GTD review. A 52px navBar carries a 32px
 *   seven-notch StepDial (one merged role='slider' control, 7th notch is
 *   a checkmark) between a 44×44 prev chevron and a 44×44 ledger button;
 *   the body is a horizontally paged step view (translateX(-step*100%)).
 *   Every step header shows a live SweepCounter of unresolved items;
 *   every item is a 116px DispositionRow with an inline Do/Defer/
 *   Delegate/Drop verb strip staging verdicts into a session ledger.
 *   Signature move: dropping project p-02 on step 4 cascades — its 3
 *   stale tasks on step 3 auto-stamp as Drop with 'Dropped with Garage
 *   rebuild' provenance, step 3's counter decrements visibly, and the
 *   sticky Undo toast restores exactly (cascades die, direct verdicts
 *   survive). Stamping the last unresolved item on a page auto-advances
 *   the pager after 400ms and inks the matching notch. Step 7 is a
 *   ReviewRecapCard derived entirely from the ledger at render. No
 *   tabBar; a sticky-footer 'Next step' button always advances; a
 *   half-detent DispositionSheet is every gesture's button path.
 * @position Page template; emitted by
 *   \`astryx template mobile-weekly-review-walkthrough\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome: no status
 *   bar, notch, home indicator, or bezel — the navBar at y=0 is the
 *   first pixel). All overlays (scrim, sheets, toast-while-locked) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While a
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and the toastDock flips sticky→absolute (sticky-in-flow otherwise,
 *   per the batch-2 amendment — shell-absolute pins to the DOCUMENT
 *   bottom on tall scrolling views). Stage clips to --radius-container;
 *   shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 on day-block rows); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Sevenfold olive #4D7C0F — the demo's --color-brand is
 *   the demo logo blue, so the spec hex is quarantined here per house
 *   rule). Sanctioned non-brand literals: the defer amber and delegate
 *   blue verdict pairs (contrast math at declaration) and DIAL_TICK_REST
 *   — un-inked StepDial notches are meaningful rest-state fills ("future
 *   beads" per the amendment), so they get an explicit ≥3:1 pair against
 *   the navBar blur surface instead of hairline --color-border.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', blur color-mix 86% +
 *   blur(12px), borderBottom hairline ALWAYS ON — this template does not
 *   wire scroll-under); PAGE HEADER 109px = 16 top + overline 11px/600
 *   (13px line) + 4 + h2 22px/700 (28px line) + 8 + 24px SweepCounter
 *   pill + 16 bottom; DISPOSITIONROW 116px = 12 top + primary 16px/500
 *   (20px line) + 2 + secondary 13px/400 (18px line, tabular ages) + 8 +
 *   44px verb strip + 12 bottom; verb strip 4 × flex:1 segments, 6px
 *   gaps, 44px tall, 13px/600, radius 8 (77px wide at 390 / 59px at 320,
 *   both ≥44px hit width; 'Delegate' fits 59px at 13px — verified
 *   longest); STICKY FOOTER 81px = 16 padding + 48px brand button + 1px
 *   hairline; TOASTDOCK sticky bottom 92 (81 footer + 11) z30, absolute
 *   bottom 92 while sheet-locked; sheet detents 55% medium /
 *   calc(100% − 56px) large, 24px grabber zone with 36×5 pill, 52px
 *   sheet header. TYPE (Figtree via --font-family-body): 28/700 recap
 *   headline · 22/700 step titles · 17/600 nav+sheet titles · 16/500 row
 *   primary · 13/400 meta · 11/500 overlines+chips; nothing under 11px;
 *   tabular-nums on every count. Touch: every target ≥44×44 with ≥8px
 *   clearance or merged (StepDial is ONE merged 44px-tall slider); every
 *   gesture (page swipe) has a visible button path (footer Next, prev
 *   chevron, dial notches/arrow keys).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero horizontal overflow (overflowX:'clip' is
 *   backstop only). NO width:390 literals — pager pages are width:'100%'
 *   and the track translates in %, so paging survives resize. Row
 *   primary ellipsizes single-line (inb-01 is the long-text stress);
 *   navBar center is ~64px fixed (32 dial + 8 gap + ~24 fraction) so
 *   44+64+44 = 152 < 320 never collides.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the paged-walkthrough anatomy is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  CheckCircle2Icon,
  ChevronLeftIcon,
  ClockIcon,
  ListChecksIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  Trash2Icon,
  UserRoundIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Sevenfold olive). #4D7C0F on the #FFFFFF
// card ≈ 4.6:1 (passes 4.5:1 for the 13px/600 counter text and 3:1 for the
// 3px Do verdict edge); #A3C76D on the dark card (~#1C1C1E) ≈ 8.0:1.
const BRAND_ACCENT = 'light-dark(#4D7C0F, #A3C76D)';
// Brand FILL pair for the footer button + 'Clear' pill (fill ≠ text law):
// light #3F6212 fill with #FFFFFF text ≈ 6.0:1; dark #A3C76D fill with
// #1A2E05 text ≈ 8.1:1 — math per spec, both clear 4.5:1.
const BRAND_FILL = 'light-dark(#3F6212, #A3C76D)';
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #1A2E05)';
// Verdict colors (chips, 3px edge bars, ledger dots, recap stat dots).
// VERDICT_DO = BRAND_ACCENT (4.6:1 light / 8.0:1 dark, above).
const VERDICT_DO = BRAND_ACCENT;
// #B45309 on the #FFFFFF card ≈ 4.8:1; #FBBF24 on the dark card ≈ 10.5:1.
const VERDICT_DEFER = 'light-dark(#B45309, #FBBF24)';
// #1D4ED8 on the #FFFFFF card ≈ 6.3:1; #93C5FD on the dark card ≈ 9.9:1.
const VERDICT_DELEGATE = 'light-dark(#1D4ED8, #93C5FD)';
// Drop rides the DS error token (≥4.5:1 on card in both schemes by token
// contract; used for 17px sheet text and the 3px non-text edge at 3:1).
const VERDICT_DROP = 'var(--color-error)';
// Un-inked StepDial notches — meaningful rest-state marks on the navBar
// blur surface (≈ body background), so hairline tokens are banned here
// per the batch-2 amendment. #6E6E73 on #FFFFFF ≈ 4.6:1; #98989F on the
// dark body (~#151515) ≈ 5.6:1 — both clear the 3:1 non-text floor.
const DIAL_TICK_REST = 'light-dark(#6E6E73, #98989F)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden h1,
// SweepCounter flip, dial pulse, sheet slide-in. Transitions animate
// transform/opacity only and collapse under prefers-reduced-motion (the
// static colors still encode every state).
// ---------------------------------------------------------------------------

const SVF_CSS = \`
.svf-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.svf-btn:disabled { cursor: default; }
.svf-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
@keyframes svf-flip-in {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.svf-flip { display: inline-block; animation: svf-flip-in 200ms ease; }
@keyframes svf-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
.svf-pulse { animation: svf-pulse 1.6s ease-in-out infinite; }
@keyframes svf-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.svf-sheet-in { animation: svf-sheet-in 240ms ease; }
.svf-vh {
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
  .svf-flip { animation: none; }
  .svf-pulse { animation: none; }
  .svf-sheet-in { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window; viewport queries
  // alone cannot tell the two stages apart).
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
  // Scroll lock while a sheet is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline + blur ALWAYS
  // ON (scroll-under not wired; noted per contract).
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
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  iconBtnDisabled: {opacity: 0.35},
  // StepDial — ONE merged 44px-tall slider control: 32px SVG + '3/7'
  // fraction; ~64px total, so 44+64+44 = 152 < 320 (never collides).
  dialControl: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 6,
    borderRadius: 12,
  },
  dialFraction: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // PAGER — viewport clips; track is 7 × width:100% pages translated in %.
  pagerViewport: {overflow: 'hidden', flex: 1},
  pagerTrack: {display: 'flex', width: '100%', alignItems: 'flex-start'},
  page: {width: '100%', flexShrink: 0, minWidth: 0},
  // PAGE HEADER — 109px total: 16 top + 13 overline line + 4 + 28 h2 line
  // + 8 + 24 counter + 16 bottom.
  pageHeader: {padding: 16},
  overline: {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    marginBottom: 4,
  },
  pageTitle: {fontSize: 22, fontWeight: 700, lineHeight: '28px', margin: '0 0 8px'},
  // SweepCounter — 24px pill, 13/600 tabular on muted; at 0 it swaps to
  // the BRAND_FILL 'Clear' pill (fill/text pair 6.0:1 / 8.1:1 above).
  counterPill: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  counterPillClear: {background: BRAND_FILL, color: BRAND_FILL_TEXT},
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
  // DISPOSITIONROW — 116px: 12 top + 20 primary + 2 + 18 secondary + 8 +
  // 44 verb strip + 12 bottom. The 44×44 ellipsis sits absolute top 6 /
  // right 6 (bottom edge y=50, 10px clear of the strip at y=60).
  row: {position: 'relative', padding: '12px 16px', display: 'flex', gap: 12},
  rowStamped: {},
  edgeBar: {position: 'absolute', top: 0, bottom: 0, left: 0, width: 3},
  // 48px day/time meta block (steps 2 and 6) — 13/600 day over 13/400
  // time; divider inset moves to 68 on these rows.
  dayBlock: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    background: 'var(--color-background-muted)',
  },
  dayBlockDay: {fontSize: 13, fontWeight: 600, lineHeight: '16px', letterSpacing: '0.04em'},
  dayBlockTime: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  rowMain: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'},
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 44,
  },
  rowSecondary: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: '18px',
    marginTop: 2,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ellipsisBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Verb strip — 4 × flex:1 segments, 6px gaps, 44px tall, 13/600, radius
  // 8, muted resting fill. The 13px/600 text-primary label on muted is
  // the affordance (≥4.5:1 on the card by token contract); segments are
  // real buttons with aria-pressed.
  verbStrip: {display: 'flex', gap: 6, marginTop: 8, height: 44},
  verbBtn: {
    flex: 1,
    minWidth: 0,
    height: 44,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  // Stamped state — the strip collapses to one 24px verdict chip inside a
  // 44px-tall tap target that reopens the sheet to change/clear.
  verdictZone: {
    marginTop: 8,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
    borderRadius: 8,
  },
  verdictChip: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  provenance: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  // clearedState — emptyState anatomy; no button (the footer Next step IS
  // the action).
  clearedState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  clearedCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    display: 'grid',
    placeItems: 'center',
    color: BRAND_ACCENT,
    marginBottom: 16,
  },
  clearedTitle: {fontSize: 17, fontWeight: 600},
  clearedBody: {fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4},
  // REVIEW RECAP CARD — step 7 output artifact, fully ledger-derived.
  recapCard: {
    marginInline: 16,
    padding: 20,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  recapHeadline: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: '34px',
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
    margin: 0,
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
    width: '100%',
  },
  statCell: {
    minWidth: 0,
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  statDotRow: {display: 'flex', alignItems: 'center', gap: 6},
  statDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  statCount: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: '26px'},
  statLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  statSub: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)'},
  recapLine: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
  },
  recapLineLabel: {color: 'var(--color-text-secondary)'},
  recapLineValue: {fontWeight: 600},
  // STICKY FOOTER — 81px total: 16 padding + 48 button + 1px hairline.
  stickyFooter: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  footerBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_FILL,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  footerBtnDone: {background: 'var(--color-background-muted)', color: 'var(--color-text-secondary)'},
  // TOASTDOCK — sticky-in-flow height-0 anchor at bottom 92 (81 footer +
  // 11) so it pins above the footer even mid-scroll; flips to absolute
  // bottom 92 while the sheet scroll-lock is active (shell = 100dvh box).
  // ONE polite live region; no timers; one toast at a time.
  toastDock: {
    position: 'sticky',
    bottom: 92,
    zIndex: 30,
    height: 0,
    paddingInline: 16,
  },
  toastDockLocked: {
    position: 'absolute',
    bottom: 92,
    insetInline: 0,
    zIndex: 30,
    height: 0,
    paddingInline: 16,
  },
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
  toastMsg: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  // SHEETS — scrim z40 + sheet z41, absolute inside shell; medium detent
  // 55% (the spec's half-detent), large calc(100% − 56px) via grabber.
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
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 16px'},
  contextLine: {fontSize: 13, fontWeight: 400, color: 'var(--color-text-secondary)', padding: '4px 0 8px'},
  sheetVerbRow: {
    width: '100%',
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 4,
    fontSize: 17,
    fontWeight: 500,
    borderRadius: 12,
  },
  sheetVerbIcon: {width: 20, display: 'grid', placeItems: 'center', flexShrink: 0},
  sheetVerbHint: {
    marginLeft: 'auto',
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // LEDGER SHEET — 44px rows grouped by verb; counts sum to verdicts.size.
  ledgerGroupHeader: {
    margin: '12px 0 4px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  ledgerRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 4,
    borderRadius: 8,
  },
  ledgerDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  ledgerRowText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ledgerRowVerb: {fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0},
  ledgerEmpty: {fontSize: 13, color: 'var(--color-text-secondary)', paddingBlock: 16},
  pageBottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — ONE store, module-level consts, dual-field items (id + display
// strings). ARITHMETIC CONTRACT (asserted by eye, kept exact):
//   sum over 6 steps of items = 5 + 3 + 6 + 4 + 4 + 3 = 25 ✓
//   remaining(step) = items(step).length − verdicted(step)
//   recap doCount + deferCount + delegateCount + dropCount === verdicts.size
//   verdicts.size + carriedForward === 25
//   dropCount = direct drops + cascade drops (cascade set = the exactly-3
//     step-3 tasks with projectId p-02: t-03, t-05, t-06 ✓)
//   golden screenshot path: Do 7 + Defer 9 + Delegate 3 + Drop 6 = 25
//     (7+9=16, 16+3=19, 19+6=25 ✓); Drop 6 = 3 direct (inb-05, s-03, p-02)
//     + 3 cascaded (t-03, t-05, t-06 ✓); oldestResolved = 47 (t-01, max of
//     47 > 33 > 28 > 21 > 19 > 12 ✓).
// Ages and day labels are fixed strings — no Math.random, no Date.now.
// ---------------------------------------------------------------------------

type Verb = 'do' | 'defer' | 'delegate' | 'drop';

const VERB_ORDER: Verb[] = ['do', 'defer', 'delegate', 'drop'];

const VERB_META: Record<Verb, {label: string; stamped: string; color: string}> = {
  do: {label: 'Do', stamped: 'Do it', color: VERDICT_DO},
  defer: {label: 'Defer', stamped: 'Deferred', color: VERDICT_DEFER},
  delegate: {label: 'Delegate', stamped: 'Delegated', color: VERDICT_DELEGATE},
  drop: {label: 'Drop', stamped: 'Dropped', color: VERDICT_DROP},
};

interface ReviewItem {
  id: string;
  step: number; // 0..5 (step 7 / index 6 is the ledger-derived recap)
  title: string;
  meta: string;
  day?: string; // steps 2 & 6 lead with a 48px day/time block
  timeLabel?: string;
  ageDays?: number; // step 3 dual field beside the 'Captured N days ago' meta
  projectId?: string; // exactly 3 step-3 tasks carry p-02 — the cascade set
  isProject?: boolean;
}

const STEP_ITEMS: ReviewItem[] = [
  // STEP 1 — Sweep inbox (5). inb-01 is the single-line-ellipsis stress
  // (stress fixture 5 shipped in the data, per house rule).
  {
    id: 'inb-01',
    step: 0,
    title:
      "Reply to Marisol about the co-op board's revised sublet policy attachment and the two follow-up questions",
    meta: 'Email · flagged Tue',
  },
  {id: 'inb-02', step: 0, title: 'Dentist referral voicemail', meta: 'Voicemail · 0:42'},
  {id: 'inb-03', step: 0, title: 'Expense report receipts', meta: 'Photo scan · 4 receipts'},
  {id: 'inb-04', step: 0, title: 'Conference CFP idea', meta: 'Note · captured Thu'},
  {id: 'inb-05', step: 0, title: 'Broken porch light photo', meta: 'Photo · captured Sun'},
  // STEP 2 — Past-week calendar (3, dual day+time meta blocks).
  {
    id: 'cal-01',
    step: 1,
    title: '1:1 with Priya — follow-ups?',
    meta: '30 min · notes attached',
    day: 'TUE',
    timeLabel: '09:30',
  },
  {
    id: 'cal-02',
    step: 1,
    title: 'Vendor demo debrief',
    meta: '45 min · 3 attendees',
    day: 'WED',
    timeLabel: '14:00',
  },
  {
    id: 'cal-03',
    step: 1,
    title: 'Sprint retro actions',
    meta: '60 min · 2 actions unowned',
    day: 'FRI',
    timeLabel: '16:30',
  },
  // STEP 3 — Stale tasks (6, ageDays dual field, tabular meta). The three
  // projectId:p-02 rows are the cascade set.
  {id: 't-01', step: 2, title: 'Renew passport', meta: 'Captured 47 days ago', ageDays: 47},
  {id: 't-02', step: 2, title: 'Draft neighbor letter', meta: 'Captured 33 days ago', ageDays: 33},
  {
    id: 't-03',
    step: 2,
    title: 'Price roll-up doors',
    meta: 'Captured 28 days ago',
    ageDays: 28,
    projectId: 'p-02',
  },
  {id: 't-04', step: 2, title: 'Cancel unused SaaS seat', meta: 'Captured 21 days ago', ageDays: 21},
  {
    id: 't-05',
    step: 2,
    title: 'Sketch garage layout',
    meta: 'Captured 19 days ago',
    ageDays: 19,
    projectId: 'p-02',
  },
  {
    id: 't-06',
    step: 2,
    title: 'Call structural engineer',
    meta: 'Captured 12 days ago',
    ageDays: 12,
    projectId: 'p-02',
  },
  // STEP 4 — Projects (4). staleCount is DERIVED at render (never stored):
  // p-02's '3 stale tasks' badge must equal the count of step-3 tasks with
  // projectId p-02 — and does, by derivation.
  {id: 'p-01', step: 3, title: 'Kitchen quotes', meta: 'Next action set · quotes due Fri', isProject: true},
  {id: 'p-02', step: 3, title: 'Garage rebuild', meta: 'Stalled since May', isProject: true},
  {id: 'p-03', step: 3, title: 'Q3 offsite plan', meta: 'On track · venue booked', isProject: true},
  {id: 'p-04', step: 3, title: 'Portfolio site refresh', meta: 'On track · copy drafted', isProject: true},
  // STEP 5 — Someday list (4).
  {id: 's-01', step: 4, title: 'Learn letterpress', meta: 'Someday / Maybe · added Mar'},
  {id: 's-02', step: 4, title: 'Cabin trip with Dana', meta: 'Someday / Maybe · added Apr'},
  {id: 's-03', step: 4, title: 'Rebuild home server', meta: 'Someday / Maybe · added Jan'},
  {id: 's-04', step: 4, title: 'Write woodworking zine', meta: 'Someday / Maybe · added Jun'},
  // STEP 6 — Calendar ahead (3, day/time blocks).
  {
    id: 'ah-01',
    step: 5,
    title: 'Board prep — block focus time?',
    meta: 'No prep block yet',
    day: 'MON',
    timeLabel: '08:00',
  },
  {
    id: 'ah-02',
    step: 5,
    title: 'Lunch w/ recruiter',
    meta: 'Location unconfirmed',
    day: 'WED',
    timeLabel: '12:00',
  },
  {
    id: 'ah-03',
    step: 5,
    title: 'Dentist (from inb-02)',
    meta: 'Referral needed first',
    day: 'THU',
    timeLabel: '15:00',
  },
];

const TOTAL_ITEMS = STEP_ITEMS.length; // 25 — cross-check: 5+3+6+4+4+3 = 25 ✓

const ITEM_BY_ID: Record<string, ReviewItem> = Object.fromEntries(
  STEP_ITEMS.map(item => [item.id, item]),
);

interface StepDef {
  title: string;
  clearedLine: string; // clearedState one-liner
  semantics: string; // DispositionSheet context line naming the step
}

const STEP_DEFS: StepDef[] = [
  {
    title: 'Sweep inbox',
    clearedLine: 'Every capture has a verdict staged.',
    semantics: 'Inbox capture — stage where it goes next.',
  },
  {
    title: 'Past-week calendar',
    clearedLine: 'Last week has been mined for follow-ups.',
    semantics: 'Past meeting — stage any follow-up it left behind.',
  },
  {
    title: 'Stale tasks',
    clearedLine: 'No task is quietly aging anymore.',
    semantics: 'Aging task — recommit, hand off, or let it go.',
  },
  {
    title: 'Projects',
    clearedLine: 'Every project has a live next action.',
    semantics: 'Project — dropping it also drops its stale tasks.',
  },
  {
    title: 'Someday list',
    clearedLine: 'The someday list earned its keep.',
    semantics: 'Someday / Maybe — still worth keeping around?',
  },
  {
    title: 'Calendar ahead',
    clearedLine: 'Next week is prepped, not ambushed.',
    semantics: 'Upcoming event — stage the prep it needs.',
  },
  {
    title: 'Recap',
    clearedLine: '',
    semantics: '',
  },
];

const STEP_COUNT = 7;

function itemsForStep(step: number): ReviewItem[] {
  return STEP_ITEMS.filter(item => item.step === step);
}

/** Derived — never stored: p-02's badge must equal this count (= 3). */
function staleCountFor(projectId: string): number {
  return STEP_ITEMS.filter(item => item.projectId === projectId).length;
}

// ---------------------------------------------------------------------------
// SINGLE STATE OWNER — useReducer reviewSession. Verdicts STAGE into the
// ledger (nothing is destroyed → no alerts anywhere; undoOverConfirm is
// satisfied by chip-clear + the cascade Undo toast).
// ---------------------------------------------------------------------------

interface VerdictEntry {
  verb: Verb;
  source: 'direct' | \`cascade:\${string}\`;
  order: number;
}

interface SheetState {
  kind: 'disposition' | 'ledger';
  itemId: string | null;
  detent: 'medium' | 'large';
}

interface ToastState {
  seq: number;
  msg: string;
  undoProjectId?: string; // present only on the cascade-drop toast
}

interface ReviewSession {
  stepIndex: number;
  verdicts: Record<string, VerdictEntry>;
  orderSeq: number;
  visited: boolean[];
  finished: boolean;
  sheet: SheetState | null;
  toast: ToastState | null;
}

type SessionAction =
  | {type: 'STAMP'; id: string; verb: Verb}
  | {type: 'CLEAR'; id: string}
  | {type: 'GOTO'; step: number}
  | {type: 'ADVANCE'; from: number} // 400ms auto-advance tied to a stamp
  | {type: 'OPEN_SHEET'; kind: 'disposition' | 'ledger'; itemId: string | null}
  | {type: 'SET_DETENT'; detent: 'medium' | 'large'}
  | {type: 'CLOSE_SHEET'}
  | {type: 'UNDO'}
  | {type: 'FINISH'};

const INITIAL_SESSION: ReviewSession = {
  stepIndex: 0,
  verdicts: {},
  orderSeq: 0,
  visited: [true, false, false, false, false, false, false],
  finished: false,
  sheet: null,
  toast: null,
};

function remainingFor(step: number, verdicts: Record<string, VerdictEntry>): number {
  return itemsForStep(step).filter(item => verdicts[item.id] == null).length;
}

function markVisited(visited: boolean[], step: number): boolean[] {
  if (visited[step]) return visited;
  const next = visited.slice();
  next[step] = true;
  return next;
}

function sessionReducer(state: ReviewSession, action: SessionAction): ReviewSession {
  switch (action.type) {
    case 'STAMP': {
      const item = ITEM_BY_ID[action.id];
      if (item == null) return state;
      let seq = state.orderSeq;
      const verdicts: Record<string, VerdictEntry> = {...state.verdicts};
      // Re-stamping a project away from Drop retracts its cascades first
      // (clearing/changing a dropped project deletes ONLY cascade entries;
      // direct verdicts on the same tasks survive).
      if (item.isProject) {
        for (const key of Object.keys(verdicts)) {
          if (verdicts[key].source === \`cascade:\${item.id}\`) delete verdicts[key];
        }
      }
      verdicts[action.id] = {verb: action.verb, source: 'direct', order: seq++};
      let toast = state.toast;
      // CASCADE: dropping a project auto-stamps its still-unverdicted
      // stale tasks as Drop with provenance (stress fixture 2: a direct
      // verdict on t-03 keeps it out of the cascade — '2 stale tasks').
      if (item.isProject && action.verb === 'drop') {
        const cascaded = STEP_ITEMS.filter(
          task => task.projectId === item.id && state.verdicts[task.id] == null,
        );
        for (const task of cascaded) {
          verdicts[task.id] = {verb: 'drop', source: \`cascade:\${item.id}\`, order: seq++};
        }
        if (cascaded.length > 0) {
          toast = {
            seq: seq++,
            msg: \`\${item.title} dropped — \${cascaded.length} stale task\${
              cascaded.length === 1 ? '' : 's'
            } cleared\`,
            undoProjectId: item.id,
          };
        }
      }
      return {...state, verdicts, orderSeq: seq, toast};
    }
    case 'CLEAR': {
      const item = ITEM_BY_ID[action.id];
      if (item == null || state.verdicts[action.id] == null) return state;
      const verdicts: Record<string, VerdictEntry> = {...state.verdicts};
      delete verdicts[action.id];
      // Clearing a dropped project also deletes its cascades (only entries
      // whose source names this project — direct verdicts survive).
      if (item.isProject) {
        for (const key of Object.keys(verdicts)) {
          if (verdicts[key].source === \`cascade:\${item.id}\`) delete verdicts[key];
        }
      }
      return {...state, verdicts};
    }
    case 'GOTO': {
      const step = Math.max(0, Math.min(STEP_COUNT - 1, action.step));
      if (step === state.stepIndex) return state;
      return {...state, stepIndex: step, visited: markVisited(state.visited, step)};
    }
    case 'ADVANCE': {
      // Tied to the stamp that emptied the page; ignored if the user
      // already navigated elsewhere during the 400ms beat.
      if (state.stepIndex !== action.from || action.from >= STEP_COUNT - 1) return state;
      const step = action.from + 1;
      // The dock announces the auto-advance — unless a cascade Undo toast
      // is live (one toast at a time; the undo window outranks a courtesy
      // announcement — deviation noted in the summary).
      const toast: ToastState | null =
        state.toast?.undoProjectId != null
          ? state.toast
          : {seq: state.orderSeq + 1, msg: \`Step \${step + 1}: \${STEP_DEFS[step].title}\`};
      return {
        ...state,
        stepIndex: step,
        visited: markVisited(state.visited, step),
        orderSeq: state.orderSeq + 1,
        toast,
      };
    }
    case 'OPEN_SHEET':
      return {...state, sheet: {kind: action.kind, itemId: action.itemId, detent: 'medium'}};
    case 'SET_DETENT':
      return state.sheet == null ? state : {...state, sheet: {...state.sheet, detent: action.detent}};
    case 'CLOSE_SHEET':
      return state.sheet == null ? state : {...state, sheet: null};
    case 'UNDO': {
      const projectId = state.toast?.undoProjectId;
      if (projectId == null) return state;
      const project = ITEM_BY_ID[projectId];
      const verdicts: Record<string, VerdictEntry> = {...state.verdicts};
      delete verdicts[projectId];
      // Only cascade:<projectId> entries die — direct verdicts survive,
      // restoring counters exactly (stress fixture 1: '3 remaining' → '6
      // remaining' on step 3).
      for (const key of Object.keys(verdicts)) {
        if (verdicts[key].source === \`cascade:\${projectId}\`) delete verdicts[key];
      }
      return {
        ...state,
        verdicts,
        orderSeq: state.orderSeq + 1,
        toast: {seq: state.orderSeq + 1, msg: \`\${project.title} restored\`},
      };
    }
    case 'FINISH': {
      if (state.finished) return state;
      const resolved = Object.keys(state.verdicts).length;
      return {
        ...state,
        finished: true,
        orderSeq: state.orderSeq + 1,
        toast: {
          seq: state.orderSeq + 1,
          msg: \`Weekly review complete — \${resolved} of \${TOTAL_ITEMS} cleared\`,
        },
      };
    }
    default:
      return state;
  }
}

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
// STEP DIAL — seven-notch SVG dial. Geometry: circle r=13 (stroke 2,
// --color-border, passive ring); 7 ticks 5px long crossing the ring at
// angles −90 + k·(360/7)° (k=0..6, 51.43° pitch); tick k=6 is replaced by
// a 7px checkmark that inks only on Finish. Un-inked ticks use
// DIAL_TICK_REST (≥3:1 math at the declaration); completed notches stroke
// 2.5px BRAND_ACCENT; the current notch is a 3px-radius filled dot at the
// tip (pulse removed under reduced motion — the static dot remains).
// Shared by the 32px navBar control and the 56px recap mini dial.
// ---------------------------------------------------------------------------

const DIAL_ANGLES = Array.from({length: 7}, (_, k) => -90 + (k * 360) / 7);

function dialXY(center: number, radius: number, deg: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad)};
}

interface StepDialGraphicProps {
  size: number; // 32 navBar · 56 recap
  inked: boolean[]; // notches 0..5 ink when remaining===0 && visited; 6 on Finish
  current: number; // −1 for the recap (no live position)
  reducedMotion: boolean;
}

function StepDialGraphic({size, inked, current, reducedMotion}: StepDialGraphicProps) {
  const scale = size / 32;
  const center = size / 2;
  const ringR = 13 * scale;
  const tickIn = 10.5 * scale;
  const tickOut = 15.5 * scale;
  return (
    <svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`} fill="none" aria-hidden>
      <circle cx={center} cy={center} r={ringR} stroke="var(--color-border)" strokeWidth={2 * scale} />
      {DIAL_ANGLES.map((deg, k) => {
        const isInked = inked[k];
        const stroke = isInked ? BRAND_ACCENT : DIAL_TICK_REST;
        if (k === 6) {
          // The 7px checkmark notch (scaled), centered on the tick tip.
          const tip = dialXY(center, ringR, deg);
          return (
            <path
              key={k}
              d={\`M \${(tip.x - 3.5 * scale).toFixed(2)} \${tip.y.toFixed(2)} l \${(2.4 * scale).toFixed(2)} \${(2.4 * scale).toFixed(2)} l \${(4.6 * scale).toFixed(2)} \${(-5 * scale).toFixed(2)}\`}
              stroke={stroke}
              strokeWidth={(isInked ? 2.5 : 2) * scale}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        }
        const from = dialXY(center, tickIn, deg);
        const to = dialXY(center, tickOut, deg);
        return (
          <line
            key={k}
            x1={from.x.toFixed(2)}
            y1={from.y.toFixed(2)}
            x2={to.x.toFixed(2)}
            y2={to.y.toFixed(2)}
            stroke={stroke}
            strokeWidth={(isInked ? 2.5 : 2) * scale}
            strokeLinecap="butt"
          />
        );
      })}
      {current >= 0 ? (
        <circle
          className={reducedMotion ? undefined : 'svf-pulse'}
          cx={dialXY(center, ringR, DIAL_ANGLES[current]).x.toFixed(2)}
          cy={dialXY(center, ringR, DIAL_ANGLES[current]).y.toFixed(2)}
          r={3 * scale}
          fill={BRAND_ACCENT}
        />
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SWEEP COUNTER — live '<n> remaining' pill; the number does a 12px
// translateY flip on change (opacity+transform only; instant swap under
// reduced motion). NOT a live region — the toastDock speaks for it.
// ---------------------------------------------------------------------------

interface SweepCounterProps {
  remaining: number;
  reducedMotion: boolean;
}

function SweepCounter({remaining, reducedMotion}: SweepCounterProps) {
  if (remaining === 0) {
    return (
      <span style={{...styles.counterPill, ...styles.counterPillClear}}>
        <svg width={12} height={12} viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2 6.4 4.6 9 10 3.2"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Clear
      </span>
    );
  }
  return (
    <span style={styles.counterPill}>
      <span key={remaining} className={reducedMotion ? undefined : 'svf-flip'}>
        {remaining}
      </span>
      remaining
    </span>
  );
}

// ---------------------------------------------------------------------------
// DISPOSITION ROW — 116px staged-verdict row. Unstamped: two-line item +
// inline four-verb strip (STAGES a verdict; nothing is deleted). Stamped:
// 3px verdict edge bar + one 24px chip inside a 44px-tall tap target that
// reopens the sheet to change/clear; cascade rows carry the provenance
// caption. The trailing 44×44 MoreHorizontal is the gesture-free button
// path to the DispositionSheet in both states.
// ---------------------------------------------------------------------------

interface DispositionRowProps {
  item: ReviewItem;
  verdict: VerdictEntry | null;
  metaOverride?: string;
  onStamp: (id: string, verb: Verb) => void;
  onOpenSheet: (id: string, opener: HTMLElement) => void;
}

function DispositionRow({item, verdict, metaOverride, onStamp, onOpenSheet}: DispositionRowProps) {
  const cascade = verdict != null && verdict.source.startsWith('cascade:');
  const cascadeProject = cascade ? ITEM_BY_ID[verdict.source.slice('cascade:'.length)] : null;
  return (
    <div style={styles.row}>
      {verdict != null ? (
        <span style={{...styles.edgeBar, background: VERB_META[verdict.verb].color}} aria-hidden />
      ) : null}
      {item.day != null ? (
        <span style={styles.dayBlock} aria-hidden>
          <span style={styles.dayBlockDay}>{item.day}</span>
          <span style={styles.dayBlockTime}>{item.timeLabel}</span>
        </span>
      ) : null}
      <div style={styles.rowMain}>
        <span style={styles.rowPrimary}>{item.title}</span>
        <span style={styles.rowSecondary}>{metaOverride ?? item.meta}</span>
        {verdict == null ? (
          <div style={styles.verbStrip} role="group" aria-label={\`Verdict for \${item.title}\`}>
            {VERB_ORDER.map(verb => (
              <button
                key={verb}
                type="button"
                className="svf-btn svf-focusable"
                style={styles.verbBtn}
                aria-pressed={false}
                aria-label={\`\${VERB_META[verb].label}: \${item.title}\`}
                onClick={() => onStamp(item.id, verb)}>
                {VERB_META[verb].label}
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            className="svf-btn svf-focusable"
            style={styles.verdictZone}
            aria-label={\`\${VERB_META[verdict.verb].stamped}: \${item.title} — change or clear verdict\`}
            onClick={event => onOpenSheet(item.id, event.currentTarget)}>
            <span
              style={{
                ...styles.verdictChip,
                color: VERB_META[verdict.verb].color,
                border: \`1px solid \${VERB_META[verdict.verb].color}\`,
              }}>
              {VERB_META[verdict.verb].stamped}
            </span>
            {cascadeProject != null ? (
              <span style={styles.provenance}>with {cascadeProject.title}</span>
            ) : null}
          </button>
        )}
      </div>
      <button
        type="button"
        className="svf-btn svf-focusable"
        style={styles.ellipsisBtn}
        aria-label={\`Disposition options for \${item.title}\`}
        onClick={event => onOpenSheet(item.id, event.currentTarget)}>
        <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button toggling the 55%
// half-detent to calc(100% − 56px)), 52px header with 44×44 X, focus-
// trapped dialog. Single sheet state slot ⇒ Disposition and Ledger can
// never be open at once.
// ---------------------------------------------------------------------------

interface SheetShellProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function SheetShell({
  titleId,
  title,
  detent,
  onDetentChange,
  onClose,
  sheetRef,
  reducedMotion,
  children,
}: SheetShellProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="svf-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transition: reducedMotion ? 'none' : 'height 240ms ease',
      }}>
      <button
        type="button"
        className="svf-btn svf-focusable"
        style={styles.grabberZone}
        aria-label="Resize sheet"
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
          className="svf-btn svf-focusable"
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
// REVIEW RECAP CARD — fully derived from the ledger at render: mini
// StepDial, tabular headline, 2×2 verb stat grid (Drop cell grows an
// 'incl. N via dropped project' sub-caption when cascades exist), oldest-
// resolved line (max ageDays over resolved step-3 tasks; '—' when none),
// carried-forward line (25 − resolved).
// ---------------------------------------------------------------------------

interface RecapProps {
  verdicts: Record<string, VerdictEntry>;
  inked: boolean[];
  reducedMotion: boolean;
}

function ReviewRecapCard({verdicts, inked, reducedMotion}: RecapProps) {
  const entries = Object.entries(verdicts);
  const resolved = entries.length;
  const counts: Record<Verb, number> = {do: 0, defer: 0, delegate: 0, drop: 0};
  let cascadeDrops = 0;
  let oldestResolved: number | null = null;
  for (const [id, entry] of entries) {
    counts[entry.verb] += 1;
    if (entry.source.startsWith('cascade:')) cascadeDrops += 1;
    const age = ITEM_BY_ID[id]?.ageDays;
    if (age != null && (oldestResolved == null || age > oldestResolved)) oldestResolved = age;
  }
  // Cross-check law: do+defer+delegate+drop === verdicts.size, and
  // verdicts.size + carriedForward === 25.
  const carried = TOTAL_ITEMS - resolved;
  return (
    <div style={styles.recapCard}>
      <StepDialGraphic size={56} inked={inked} current={-1} reducedMotion={reducedMotion} />
      <h3 style={styles.recapHeadline}>
        {resolved} of {TOTAL_ITEMS} items cleared
      </h3>
      <div style={styles.statGrid}>
        {VERB_ORDER.map(verb => (
          <div key={verb} style={styles.statCell}>
            <span style={styles.statDotRow}>
              <span style={{...styles.statDot, background: VERB_META[verb].color}} aria-hidden />
              <span style={styles.statLabel}>{VERB_META[verb].label}</span>
            </span>
            <span style={styles.statCount}>{counts[verb]}</span>
            {verb === 'drop' && cascadeDrops > 0 ? (
              <span style={styles.statSub}>incl. {cascadeDrops} via dropped project</span>
            ) : null}
          </div>
        ))}
      </div>
      <div style={styles.recapLine}>
        <span style={styles.recapLineLabel}>Oldest item resolved</span>
        <span style={styles.recapLineValue}>
          {oldestResolved != null ? \`\${oldestResolved} days\` : '—'}
        </span>
      </div>
      <div style={styles.recapLine}>
        <span style={styles.recapLineLabel}>Carried forward</span>
        <span style={styles.recapLineValue}>{carried}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const VERB_ICONS: Record<Verb, typeof ZapIcon> = {
  do: ZapIcon,
  defer: ClockIcon,
  delegate: UserRoundIcon,
  drop: Trash2Icon,
};

export default function MobileWeeklyReviewWalkthroughTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [session, dispatch] = useReducer(sessionReducer, INITIAL_SESSION);
  const {stepIndex, verdicts, visited, finished, sheet, toast} = session;

  // Focus plumbing — opener restored on every close path.
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const dialControlRef = useRef<HTMLButtonElement | null>(null);
  const dialFaceRef = useRef<HTMLSpanElement | null>(null);
  const advanceTimerRef = useRef<number | null>(null);

  // Derived — everything below re-derives from the ONE store per render.
  const remainingByStep = Array.from({length: 6}, (_, step) => remainingFor(step, verdicts));
  const verdictCount = Object.keys(verdicts).length;
  // Notch k inks when remaining(k)===0 and the step was visited; the
  // checkmark notch (k=6) inks only on Finish (finishing ≠ clearing).
  const inked = Array.from({length: 7}, (_, k) =>
    k < 6 ? visited[k] && remainingByStep[k] === 0 : finished,
  );

  // 400ms auto-advance tied to the stamp that emptied the page (cleared on
  // unmount; under reduced motion the timeout still runs — user-caused and
  // deterministic — but the slide becomes an instant swap via CSS).
  useEffect(
    () => () => {
      if (advanceTimerRef.current != null) window.clearTimeout(advanceTimerRef.current);
    },
    [],
  );

  const stampItem = useCallback(
    (id: string, verb: Verb) => {
      const item = ITEM_BY_ID[id];
      const wasStamped = session.verdicts[id] != null;
      dispatch({type: 'STAMP', id, verb});
      const step = session.stepIndex;
      if (item.step !== step) return; // rows only render on their own page
      const post = remainingFor(step, session.verdicts) - (wasStamped ? 0 : 1);
      if (post === 0 && step < STEP_COUNT - 1) {
        if (advanceTimerRef.current != null) window.clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = window.setTimeout(
          () => dispatch({type: 'ADVANCE', from: step}),
          400,
        );
      }
    },
    [session.verdicts, session.stepIndex],
  );

  // SHEET LIFECYCLE — single sheet slot; focus moves in with
  // preventScroll:true (plain .focus() scroll-reveals the animating sheet
  // inside the locked overflow-hidden column) and restores to the opener
  // on X / scrim / Escape / verb-choice close paths.
  const openSheet = (kind: 'disposition' | 'ledger', itemId: string | null, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    dispatch({type: 'OPEN_SHEET', kind, itemId});
  };
  const closeSheet = useCallback(() => {
    dispatch({type: 'CLOSE_SHEET'});
    requestAnimationFrame(() => {
      const opener = sheetOpenerRef.current;
      if (opener != null && opener.isConnected) opener.focus();
      else dialControlRef.current?.focus();
    });
  }, []);

  const sheetKind = sheet?.kind ?? null;
  const sheetItemId = sheet?.itemId ?? null;
  useEffect(() => {
    if (sheetKind != null) sheetRef.current?.focus({preventScroll: true});
  }, [sheetKind, sheetItemId]);

  // Escape closes the topmost overlay — the sheet is the only overlay.
  useEffect(() => {
    if (sheet == null) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sheet, closeSheet]);

  // STEP DIAL control — arrow keys move steps; pointerdown on a notch
  // jumps to it (merged-target clause: the whole 44px-tall control is ONE
  // slider; per-notch hits resolve by angle).
  const onDialKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = stepIndex - 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = stepIndex + 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = STEP_COUNT - 1;
    if (next == null) return;
    event.preventDefault();
    dispatch({type: 'GOTO', step: next});
  };
  const onDialPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const face = dialFaceRef.current?.getBoundingClientRect();
    if (face == null) return;
    const dx = event.clientX - (face.left + face.width / 2);
    const dy = event.clientY - (face.top + face.height / 2);
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) return; // fraction text etc.
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI; // −90 = top notch
    const norm = (((deg + 90) % 360) + 360) % 360;
    dispatch({type: 'GOTO', step: Math.round(norm / (360 / 7)) % 7});
  };

  // PAGE SWIPE (garnish — footer/chevron/dial are the button paths):
  // horizontal delta > 60px with |dx| > |dy| pages; 8px slop cancels the
  // row/button click underneath.
  const swipeRef = useRef<{x: number; y: number; moved: boolean} | null>(null);
  const onPagerPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    swipeRef.current = {x: event.clientX, y: event.clientY, moved: false};
  };
  const onPagerPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    if (start == null) return;
    if (Math.abs(event.clientX - start.x) > 8) start.moved = true;
  };
  const onPagerPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    if (start == null) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      dispatch({type: 'GOTO', step: stepIndex + (dx < 0 ? 1 : -1)});
    }
  };
  const onPagerClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (swipeRef.current?.moved) {
      event.preventDefault();
      event.stopPropagation();
    }
    swipeRef.current = null;
  };

  const sheetItem = sheetKind === 'disposition' && sheetItemId != null ? ITEM_BY_ID[sheetItemId] : null;
  const sheetVerdict = sheetItem != null ? verdicts[sheetItem.id] ?? null : null;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const onLastStep = stepIndex === STEP_COUNT - 1;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SVF_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="svf-btn svf-focusable"
              style={{...styles.iconBtn, ...(stepIndex === 0 ? styles.iconBtnDisabled : null)}}
              aria-label="Previous step"
              disabled={stepIndex === 0}
              onClick={() => dispatch({type: 'GOTO', step: stepIndex - 1})}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
            </button>
          </div>
          <button
            type="button"
            ref={dialControlRef}
            role="slider"
            aria-valuemin={1}
            aria-valuemax={STEP_COUNT}
            aria-valuenow={stepIndex + 1}
            aria-valuetext={\`Step \${stepIndex + 1} of \${STEP_COUNT}: \${STEP_DEFS[stepIndex].title}\`}
            aria-label="Review step"
            className="svf-btn svf-focusable"
            style={styles.dialControl}
            onKeyDown={onDialKeyDown}
            onPointerDown={onDialPointerDown}>
            <span ref={dialFaceRef} style={{display: 'inline-flex'}}>
              <StepDialGraphic size={32} inked={inked} current={stepIndex} reducedMotion={reducedMotion} />
            </span>
            <span style={styles.dialFraction}>
              {stepIndex + 1}/{STEP_COUNT}
            </span>
          </button>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="svf-btn svf-focusable"
              style={styles.iconBtn}
              aria-label={\`Session ledger, \${verdictCount} staged\`}
              onClick={event => openSheet('ledger', null, event.currentTarget)}>
              <Icon icon={ListChecksIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <h1 className="svf-vh">Sevenfold weekly review</h1>

        <div
          style={styles.pagerViewport}
          onPointerDown={onPagerPointerDown}
          onPointerMove={onPagerPointerMove}
          onPointerUp={onPagerPointerUp}
          onClickCapture={onPagerClickCapture}>
          <div
            style={{
              ...styles.pagerTrack,
              transform: \`translateX(-\${stepIndex * 100}%)\`,
              transition: reducedMotion ? 'none' : 'transform 240ms ease',
            }}>
            {Array.from({length: 6}, (_, step) => {
              const items = itemsForStep(step);
              const remaining = remainingByStep[step];
              const hasDayBlocks = items[0]?.day != null;
              return (
                <section
                  key={step}
                  style={styles.page}
                  inert={step !== stepIndex}
                  aria-hidden={step !== stepIndex}>
                  <header style={styles.pageHeader}>
                    <div style={styles.overline}>
                      STEP {step + 1} OF {STEP_COUNT}
                    </div>
                    <h2 style={styles.pageTitle}>{STEP_DEFS[step].title}</h2>
                    <SweepCounter remaining={remaining} reducedMotion={reducedMotion} />
                  </header>
                  <div style={styles.listCard}>
                    {items.map((item, index) => (
                      <div key={item.id}>
                        {index > 0 ? (
                          <div style={hasDayBlocks ? styles.rowDividerDeep : styles.rowDivider} />
                        ) : null}
                        <DispositionRow
                          item={item}
                          verdict={verdicts[item.id] ?? null}
                          metaOverride={
                            item.isProject && staleCountFor(item.id) > 0
                              ? \`\${staleCountFor(item.id)} stale tasks · \${item.meta}\`
                              : undefined
                          }
                          onStamp={stampItem}
                          onOpenSheet={(id, opener) => openSheet('disposition', id, opener)}
                        />
                      </div>
                    ))}
                  </div>
                  {remaining === 0 ? (
                    <div style={styles.clearedState}>
                      <span style={styles.clearedCircle}>
                        <Icon icon={CheckCircle2Icon} size="lg" color="inherit" />
                      </span>
                      <span style={styles.clearedTitle}>Step clear</span>
                      <span style={styles.clearedBody}>{STEP_DEFS[step].clearedLine}</span>
                    </div>
                  ) : null}
                  <div style={styles.pageBottomSpacer} />
                </section>
              );
            })}
            <section
              style={styles.page}
              inert={stepIndex !== STEP_COUNT - 1}
              aria-hidden={stepIndex !== STEP_COUNT - 1}>
              <header style={styles.pageHeader}>
                <div style={styles.overline}>STEP 7 OF 7</div>
                <h2 style={styles.pageTitle}>Recap</h2>
              </header>
              <ReviewRecapCard verdicts={verdicts} inked={inked} reducedMotion={reducedMotion} />
              <div style={styles.pageBottomSpacer} />
            </section>
          </div>
        </div>

        {/* THE one polite live region — announces cascades, auto-advance,
            restore, and finish; the SweepCounter itself is never live. */}
        <div style={sheet != null ? styles.toastDockLocked : styles.toastDock} aria-live="polite">
          {toast != null ? (
            <div key={toast.seq} style={styles.toast}>
              <span style={styles.toastMsg}>{toast.msg}</span>
              {toast.undoProjectId != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    className="svf-btn svf-focusable"
                    style={styles.toastUndo}
                    onClick={() => dispatch({type: 'UNDO'})}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <footer style={styles.stickyFooter}>
          {onLastStep ? (
            <button
              type="button"
              className="svf-btn svf-focusable"
              style={{...styles.footerBtn, ...(finished ? styles.footerBtnDone : null)}}
              disabled={finished}
              aria-disabled={finished}
              onClick={() => dispatch({type: 'FINISH'})}>
              {finished ? 'Review saved' : 'Finish review'}
            </button>
          ) : (
            <button
              type="button"
              className="svf-btn svf-focusable"
              style={styles.footerBtn}
              onClick={() => dispatch({type: 'GOTO', step: stepIndex + 1})}>
              Next step
            </button>
          )}
        </footer>

        {sheet != null ? (
          <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
        ) : null}

        {sheetItem != null && sheet != null ? (
          <SheetShell
            titleId="svf-disposition-title"
            title={sheetItem.title}
            detent={sheet.detent}
            onDetentChange={detent => dispatch({type: 'SET_DETENT', detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}>
            <div style={styles.contextLine}>{STEP_DEFS[sheetItem.step].semantics}</div>
            {VERB_ORDER.map(verb => (
              <button
                key={verb}
                type="button"
                className="svf-btn svf-focusable"
                style={{
                  ...styles.sheetVerbRow,
                  ...(verb === 'drop' ? {color: VERDICT_DROP} : null),
                }}
                aria-pressed={sheetVerdict?.verb === verb}
                aria-label={\`\${VERB_META[verb].label}: \${sheetItem.title}\`}
                onClick={() => {
                  stampItem(sheetItem.id, verb);
                  closeSheet();
                }}>
                <span
                  style={{
                    ...styles.sheetVerbIcon,
                    color: verb === 'drop' ? VERDICT_DROP : VERB_META[verb].color,
                  }}>
                  <Icon icon={VERB_ICONS[verb]} size="sm" color="inherit" />
                </span>
                {VERB_META[verb].label}
                {sheetVerdict?.verb === verb ? <span style={styles.sheetVerbHint}>Current</span> : null}
              </button>
            ))}
            {sheetVerdict != null ? (
              <button
                type="button"
                className="svf-btn svf-focusable"
                style={styles.sheetVerbRow}
                aria-label={\`Clear verdict for \${sheetItem.title}\`}
                onClick={() => {
                  dispatch({type: 'CLEAR', id: sheetItem.id});
                  closeSheet();
                }}>
                <span style={{...styles.sheetVerbIcon, color: 'var(--color-text-secondary)'}}>
                  <Icon icon={RotateCcwIcon} size="sm" color="inherit" />
                </span>
                Clear verdict
              </button>
            ) : null}
          </SheetShell>
        ) : null}

        {sheetKind === 'ledger' && sheet != null ? (
          <SheetShell
            titleId="svf-ledger-title"
            title={\`Session ledger · \${verdictCount}\`}
            detent={sheet.detent}
            onDetentChange={detent => dispatch({type: 'SET_DETENT', detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}>
            {verdictCount === 0 ? (
              <div style={styles.ledgerEmpty}>
                No verdicts staged yet — stamp items with Do, Defer, Delegate, or Drop and they
                collect here.
              </div>
            ) : (
              VERB_ORDER.map(verb => {
                // Per-verb counts sum to verdicts.size by construction.
                const group = Object.entries(verdicts)
                  .filter(([, entry]) => entry.verb === verb)
                  .sort(([, a], [, b]) => a.order - b.order);
                if (group.length === 0) return null;
                return (
                  <div key={verb}>
                    <div style={styles.ledgerGroupHeader}>
                      <span style={{...styles.ledgerDot, background: VERB_META[verb].color}} aria-hidden />
                      {VERB_META[verb].stamped} · {group.length}
                    </div>
                    {group.map(([id, entry]) => {
                      const item = ITEM_BY_ID[id];
                      return (
                        <button
                          key={id}
                          type="button"
                          className="svf-btn svf-focusable"
                          style={styles.ledgerRow}
                          aria-label={\`\${item.title} — \${VERB_META[verb].stamped}\${
                            entry.source.startsWith('cascade:') ? ' via dropped project' : ''
                          }; go to step \${item.step + 1}\`}
                          onClick={() => {
                            dispatch({type: 'GOTO', step: item.step});
                            closeSheet();
                          }}>
                          <span
                            style={{...styles.ledgerDot, background: VERB_META[verb].color}}
                            aria-hidden
                          />
                          <span style={styles.ledgerRowText}>{item.title}</span>
                          <span style={styles.ledgerRowVerb}>
                            {entry.source.startsWith('cascade:') ? 'cascade' : \`Step \${item.step + 1}\`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </SheetShell>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};