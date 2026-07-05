// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Shuttlebee school-run pod for
 *   'Week of Mar 2–6' (fixed string, no Date()): 4 families (Bennett = YOU,
 *   Nakamura, Osei, Delgado), 6 kids (3 boosters), 10 runs = 5 days × AM/PM.
 *   Pre-claim assignments B2+N3+O2+D2 = 9 claimed + 1 open (Thu PM) = 10 ✓;
 *   settled ledger given 6+9+7+6 = 28 = owed 8+7+7+6 ✓ (week-1 Mon holiday:
 *   30−2 = 28); nets −2/+2/0/0 sum 0 ✓. No Math.random(), no network media.
 * @output Shuttlebee — Carpool Week Coordinator: a 390px MOBILE fairness
 *   machine. 52px navBar over a 56px sticky Mon–Fri weekStrip (per-day
 *   status dots: solid disc covered · hollow ring open · triangle backup);
 *   body = AM/PM run cards each carrying a DriverSlotCoin ringed by a
 *   fairness arc, a RouteRibbon of id-derived gradient-roof house stops
 *   with +min offsets, and a SeatPillRow minivan cross-section with the
 *   booster-only-row-2 constraint. Signature: claiming Thursday PM (coin
 *   tap or the 48px 'Claim this run' button — both visible paths) flips 6
 *   surfaces from ONE weekStore transaction: coin → your avatar, every
 *   fairness arc rebalances (your pending tick appears, Nakamura's hatched
 *   provisional segment disappears), the SeatPillRow seats 4 kids with
 *   boosters forced to row 2, the RouteRibbon reorders to your stop order
 *   (School +0 → Osei +4 → Nakamura +9 → Delgado +13 → Bennett +17), Thu's
 *   red strip dot turns solid, and the Alerts badge drops 3→2 as
 *   'Thursday PM needs a driver' self-resolves. Undo-over-confirm
 *   throughout. Tabs: Week / My runs / Families / Alerts; two-detent
 *   claim/backup sheet (Fri PM's needs-backup coin reuses it).
 * @position Page template; emitted by `astryx template mobile-carpool-coordinator`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheet) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'} and
 *   restores on close. The toastDock is sticky-in-flow (bottom 76, above
 *   the 64px tabBar + 12px) per the house amendment — shell-absolute pins
 *   to the document bottom on tall scrolling views.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no desktop
 *   Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_FILL (#F5B62E honey, both schemes) with text-grade BRAND_ACCENT
 *   light-dark pair; sanctioned non-brand literals (open-red, backup-amber,
 *   ahead-green, ≥3:1 rest boundary) each carry contrast math at the
 *   declaration. Per the batch-2 amendment, interactive boundaries and
 *   meaningful rest fills (open-coin dashed ring, empty seat-pill border,
 *   arc rest track, pending arc segment) use explicit ≥3:1 pairs, NOT
 *   --color-border.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr'); weekStrip 56px sticky top 52
 *   z19 (always-on hairline variant chosen), 5 dayCells flex:1 (358/5 =
 *   71.6px at 390, 57.6px at 320, both ≥44) — total sticky chrome 108px;
 *   tabBar 64px, 4 tabItems (24px icon / 4px gap / 11px/500 label), Alerts
 *   badge 16px-min brand pill top:-4 right:-8. Rows: 44px utility, 60px
 *   two-line (16/500 + 13/400, 2px gap), 72px media (40px avatar, 68px
 *   inset divider). Run card: 24px header row (11/500 overline + 22px
 *   status chip) → 12 → coin row (56px coin + 4px arc = 64px box in a
 *   72×72 button beside a 60px two-line driver stack) → 12 → RouteRibbon
 *   72px → 12 → SeatPillRow 96px (two 32px pill rows + 13px caption, 8px
 *   gaps) → 12 → 48px brand claim (open) / 36px 'Run details' (claimed).
 *   Sheet detents 55% / calc(100% − 56px); grabber 36×5 in 24px zone;
 *   sheet header 52px. toastDock sticky bottom 76 z30. TYPE (Figtree via
 *   --font-family-body): 28/700 large title (unused — compact title
 *   always visible, chosen variant) · 22/700 day heading · 17/600
 *   nav+card titles · 16/400 body floor · 13/400 meta · 11/500 overlines;
 *   tabular-nums on every count, offset, and ledger figure. Touch: every
 *   target ≥44×44 (dayCell 56, coin 72×72, dismiss 44×44) with ≥8px
 *   clearance or merged full-row.
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals: dayCells flex 1 (57.6px at 320
 *   ≥ 44 ✓); ribbon SVG scales via viewBox/preserveAspectRatio (11px SVG
 *   text fixed size); seat pills flex-basis 56 min 48, names ellipsize
 *   (row 3 at 320: 3×48 + 2×8 = 160 < 256 content width ✓); coin row =
 *   72px coin + 12 + minmax(0,1fr) stack — text truncates, never wraps
 *   the coin. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the shell
 *   renders as a centered 390–430px phone column (maxWidth 430,
 *   marginInline auto, borderInline hairline). No adaptive relayout.
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
  ArmchairIcon,
  BellIcon,
  BellOffIcon,
  CalendarDaysIcon,
  CarFrontIcon,
  CheckIcon,
  LifeBuoyIcon,
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

// THE quarantined brand literal — Shuttlebee honey #F5B62E as a FILL in
// both schemes (claim button, active-tab treatment uses text-grade accent).
const BRAND_FILL = '#F5B62E';
// Text over the BRAND_FILL: #3B2A06 on #F5B62E ≈ 7.6:1 (passes 4.5:1).
const ON_BRAND_TEXT = '#3B2A06';
// Text-grade brand accent: #9A6E08 on the light body ≈ 5.2:1; #F5C86A on
// the dark body ≈ 9.8:1 — both pass 4.5:1 for 11px overlines and links.
const BRAND_ACCENT = 'light-dark(#9A6E08, #F5C86A)';
// 12% brand wash for tinted chips/pills (never carries text alone).
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// Open-run red status dot / chip text: #C0392B on the light strip ≈ 5.1:1;
// #FF7B6B on the dark strip ≈ 6.9:1 — both ≥3:1 vs their actual surface
// and ≥4.5:1 for the 11px chip text.
const DOT_OPEN = 'light-dark(#C0392B, #FF7B6B)';
// Backup amber dot / needs-backup ring: #8A6100 on light ≈ 5.5:1; #F0B429
// on the dark card ≈ 8.1:1 — both clear 3:1 vs surface.
const DOT_BACKUP = 'light-dark(#8A6100, #F0B429)';
// '+2 ahead' success chip text: #1E7A34 on the light card ≈ 4.7:1; #86D695
// on the dark card ≈ 9.4:1.
const AHEAD_GREEN = 'light-dark(#1E7A34, #86D695)';
// ≥3:1 REST BOUNDARY (batch-2 amendment): interactive control boundaries
// and meaningful rest fills may NOT use hairline tokens. #8B8474 vs the
// white card ≈ 3.5:1; #96907F vs the dark card (~#1C1C1E) ≈ 5.0:1. Used
// for: open-coin dashed ring, empty seat-pill dashed border, fairness-arc
// rest track.
const REST_BOUNDARY = 'light-dark(#8B8474, #96907F)';
// Pending arc segment — spec said "40% opacity same hue", but 40% brand
// over the white card blends to ≈1.7:1 (fails the ≥3:1 amendment), so the
// pending segment is an explicit lighter-honey pair instead: #B8890F vs
// white ≈ 3.2:1; #C79A2A vs the dark card ≈ 6.0:1. Deviation noted in the
// final summary.
const PENDING_ARC = 'light-dark(#B8890F, #C79A2A)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden text,
// the needs-backup ring pulse and refresh spinner (both REMOVED under
// prefers-reduced-motion: static amber ring / static glyph still encode
// the state), and transform/opacity-only transitions.
// ---------------------------------------------------------------------------

const SHB_CSS = `
.shb-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.shb-btn:disabled { cursor: default; }
.shb-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.shb-anim { transition: transform 220ms ease, opacity 220ms ease; }
.shb-fade { transition: opacity 200ms ease; }
@keyframes shb-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.shb-sheet-in { animation: shb-sheet-in 240ms ease; }
@keyframes shb-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
.shb-pulse { animation: shb-pulse 2s ease-in-out infinite; }
@keyframes shb-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.shb-spin { animation: shb-spin 1s linear infinite; }
.shb-vh {
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
  .shb-anim, .shb-fade { transition: none; }
  .shb-sheet-in { animation: none; }
  .shb-pulse { animation: none; }
  .shb-spin { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window, so viewport queries
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
  // Scroll lock while the sheet is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44×44 icon buttons
  // optically align to the 16px gutter. Hairline + blur ALWAYS ON (this
  // template does not wire scroll-under; noted per contract).
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
    fontVariantNumeric: 'tabular-nums',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // WEEK STRIP — 56px sticky top 52 z19, same blur surface, always-on
  // bottom hairline. 5 dayCell buttons flex 1 (71.6px at 390 ≥ 44 ✓).
  weekStrip: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    height: 56,
    flexShrink: 0,
    display: 'flex',
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  dayCell: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    height: 56,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayDot: {height: 10, display: 'grid', placeItems: 'center'},
  dayName: {fontSize: 13, fontWeight: 600, lineHeight: 1.1},
  dayDate: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.1,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  dayUnderline: {
    position: 'absolute',
    bottom: 0,
    insetInline: 8,
    height: 2,
    background: BRAND_ACCENT,
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // WEEK HEADER — 22/700 day heading (the visual h1) + 13px coverage
  // caption; 16px gutter, 24px section gap below the strip.
  weekHeader: {
    padding: '20px 16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  dayHeading: {margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.2},
  coverageCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  updatedCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // RUN CARD — listCard geometry (16px gutter inset, 12px radius, hairline
  // border, 16px internal padding); 12px between stacked cards.
  runCard: {
    marginInline: 16,
    marginBottom: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  runHeader: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  overline: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // 22px status chips — 11/500 text with explicit ≥4.5:1 pairs.
  statusChip: {
    height: 22,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  chipCovered: {color: BRAND_ACCENT, background: BRAND_TINT_12},
  chipOpen: {color: DOT_OPEN, border: `1px solid ${DOT_OPEN}`},
  chipBackup: {color: DOT_BACKUP, border: `1px solid ${DOT_BACKUP}`},
  // COIN ROW — 72×72 coin button + 12px + minmax(0,1fr) 60px driver stack.
  coinRow: {
    display: 'grid',
    gridTemplateColumns: '72px minmax(0, 1fr)',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  coinBtn: {
    width: 72,
    height: 72,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    position: 'relative',
  },
  coinBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: 'var(--color-background-card)',
    border: `1px solid ${DOT_BACKUP}`,
    color: DOT_BACKUP,
  },
  driverStack: {
    height: 60,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
  },
  driverPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  driverSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // ROUTE RIBBON — 72px SVG, full card width; 12px below the coin row.
  ribbonWrap: {marginBottom: 12},
  ribbonCaption: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginTop: 2,
  },
  // SEAT PILL ROW — two 32px pill rows + 13px caption, 8px gaps ≈ 96px.
  seatBlock: {display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12},
  seatRow: {display: 'flex', justifyContent: 'center', gap: 8},
  seatPill: {
    flexBasis: 56,
    minWidth: 48,
    maxWidth: 96,
    height: 32,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingInline: 6,
    overflow: 'hidden',
  },
  // Empty pill — dashed 1px REST_BOUNDARY border (≥3:1 amendment; the
  // hairline token would read ~1.3:1 against the muted fill's card).
  seatPillEmpty: {
    background: 'var(--color-background-muted)',
    border: `1px dashed ${REST_BOUNDARY}`,
  },
  seatPillName: {
    fontSize: 11,
    fontWeight: 500,
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  seatCaption: {
    fontSize: 13,
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  waitingChips: {display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap'},
  waitingChip: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    maxWidth: 140,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  ghosted: {opacity: 0.5},
  // ACTIONS — 48px full-width brand primary / 36px secondary.
  claimBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_FILL,
    color: ON_BRAND_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  detailsBtn: {
    width: '100%',
    height: 36,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
  },
  // LIST LANGUAGE — inset-grouped cards + hairline dividers.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // 72px media row (My runs, Families).
  row72: {
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  rowMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  netChip: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  netBehind: {color: DOT_OPEN, border: `1px solid ${DOT_OPEN}`},
  netAhead: {color: AHEAD_GREEN, border: `1px solid ${AHEAD_GREEN}`},
  netEven: {color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)'},
  // Terminal caption — 13/400 centered, 16px below the card.
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 60px two-line alert row + trailing 44×44 dismiss.
  alertRow: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 60,
    paddingInlineStart: 16,
    gap: 8,
  },
  resolvedGlyph: {color: BRAND_ACCENT, display: 'inline-flex', flexShrink: 0},
  // SEGMENTED CONTROL — 36px track, muted fill, active card pill.
  segmented: {
    margin: '16px 16px 12px',
    height: 36,
    display: 'flex',
    padding: 2,
    gap: 2,
    background: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  segmentOn: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  // EMPTY STATE — filtered-empty variant (Alerts · Unresolved).
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
  emptyTitle: {margin: 0, fontSize: 17, fontWeight: 600},
  emptyBody: {
    margin: '4px 0 16px',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  emptyAction: {
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
  },
  // TAB BAR — 64px sticky bottom z20, 4 flex-1 tabItems.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
    flexShrink: 0,
    display: 'flex',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
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
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_FILL,
    color: ON_BRAND_TEXT,
    fontSize: 10,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  tabLabel: {fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // TOAST DOCK — sticky-in-flow above the tabBar (house amendment: the
  // shell grows with content, so absolute bottom:N pins to the DOCUMENT
  // bottom on tall views; sticky bottom 76 stays above the 64px tabBar).
  toastDock: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    minHeight: 0,
  },
  toast: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    maxWidth: '100%',
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell; two detents.
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  sheetInfoRow: {
    minHeight: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
  },
  sheetSecondaryBtn: {
    width: '100%',
    height: 36,
    marginTop: 16, // 16px dead space between the primary and the secondary
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'grid',
    placeItems: 'center',
  },
  // SKELETON — identical run-card geometry, deterministic bar widths
  // (60/45/70 primary · 40/55/30 secondary), no layout shift on resolve.
  skelBar: {
    height: 12,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
  },
  skelCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
  },
  skelBlock: {
    borderRadius: 6,
    background: 'var(--color-background-muted)',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields (id + display) throughout.
// Cross-checks (verified by hand): pre-claim claimed runs B2+N3+O2+D2 = 9,
// +1 open = 10 ✓; coverage 9 of 10 → 10 of 10 ✓; ledger given 6+9+7+6 = 28
// = owed 8+7+7+6 ✓ (week 1 had a Mon holiday: 3 weeks × 10 − 2 = 28); nets
// −2/+2/0/0 sum 0 ✓; pending arc ticks derive LIVE from runs (pre 2+3+2+2
// = 9, post-claim 3+3+2+2 = 10 ✓); alerts badge 3 → 2 post-claim ✓.
// ---------------------------------------------------------------------------

const ME = 'fam-bennett';
const WEEK_LABEL = 'Week of Mar 2–6';

interface Family {
  id: string;
  name: string;
  parentName: string;
  vehicleName: string;
  givenDrives: number; // weeks 1–3 settled ledger
  owedDrives: number;
}

// Ledger law: Σ given = Σ owed = 28 (28 drives settled · 28 owed).
const FAMILIES: Family[] = [
  {id: 'fam-bennett', name: 'Bennett', parentName: 'Dana Bennett', vehicleName: 'Honda Odyssey', givenDrives: 6, owedDrives: 8},
  {id: 'fam-nakamura', name: 'Nakamura', parentName: 'Yuki Nakamura', vehicleName: 'Toyota Sienna', givenDrives: 9, owedDrives: 7},
  {id: 'fam-osei', name: 'Osei', parentName: 'Kwame Osei', vehicleName: 'VW Atlas', givenDrives: 7, owedDrives: 7},
  {id: 'fam-delgado', name: 'Delgado', parentName: 'Marisol Delgado', vehicleName: 'Kia Carnival', givenDrives: 6, owedDrives: 6},
];
const FAMILY_BY_ID = new Map(FAMILIES.map(family => [family.id, family]));

interface Kid {
  id: string;
  name: string; // display name (first token renders in seat pills)
  familyId: string;
  age: number;
  needsBooster: boolean;
}

// 6 kids, 3 boosters. kid-kenji's display name is STRESS FIXTURE 1 — the
// long-name overflow: it must ellipsize inside a 56px seat pill and the
// 60px driver-stack rider line without pushing the coin.
const KIDS: Kid[] = [
  {id: 'kid-milo', name: 'Milo Bennett', familyId: 'fam-bennett', age: 7, needsBooster: true},
  {id: 'kid-kenji', name: 'Alexandra-Sofía Nakamura-Villanueva', familyId: 'fam-nakamura', age: 9, needsBooster: false},
  {id: 'kid-aiko', name: 'Aiko Nakamura', familyId: 'fam-nakamura', age: 6, needsBooster: true},
  {id: 'kid-ama', name: 'Ama Osei', familyId: 'fam-osei', age: 8, needsBooster: false},
  {id: 'kid-lucia', name: 'Lucía Delgado', familyId: 'fam-delgado', age: 7, needsBooster: true},
  {id: 'kid-mateo', name: 'Mateo Delgado', familyId: 'fam-delgado', age: 10, needsBooster: false},
];
const KID_BY_ID = new Map(KIDS.map(kid => [kid.id, kid]));

interface Day {
  id: string;
  short: string; // 13/600 day label in the strip
  dateNum: string; // 13/400 tabular date under it
  full: string; // 22/700 heading
}

const DAYS: Day[] = [
  {id: 'mon', short: 'Mon', dateNum: '2', full: 'Monday'},
  {id: 'tue', short: 'Tue', dateNum: '3', full: 'Tuesday'},
  {id: 'wed', short: 'Wed', dateNum: '4', full: 'Wednesday'},
  {id: 'thu', short: 'Thu', dateNum: '5', full: 'Thursday'},
  {id: 'fri', short: 'Fri', dateNum: '6', full: 'Friday'},
];
const TODAY_DAY_ID = 'thu'; // the demo's fixed "today"

interface Run {
  id: string;
  dayId: string;
  period: 'AM' | 'PM';
  departLabel: string; // fixed string, no Date()
  driverId: string | null;
  riderIds: string[];
  needsBackup: boolean; // Fri PM — Nakamura requested a backup
  provisionalBackupId: string | null; // Nakamura's standing-backup hatch
  backupRequested: boolean; // set by 'Request a backup instead'
  backupOfferedBy: string | null; // set by the Fri PM offer commit
}

// Rosters never exceed 5 seats and never carry >2 boosters (STRESS
// FIXTURE 3: seatKids throws in dev if boosters > row-2 capacity; no live
// run violates it — Fri AM rides FULL at 5/5 with boosters Milo+Aiko = 2 =
// exactly row-2 capacity, and Lucía rides with her parent that morning).
const RUNS: Run[] = [
  {id: 'run-mon-am', dayId: 'mon', period: 'AM', departLabel: '7:35', driverId: 'fam-nakamura', riderIds: ['kid-kenji', 'kid-aiko', 'kid-milo', 'kid-ama'], needsBackup: false, provisionalBackupId: null, backupRequested: false, backupOfferedBy: null},
  {id: 'run-mon-pm', dayId: 'mon', period: 'PM', departLabel: '3:10', driverId: 'fam-bennett', riderIds: ['kid-milo', 'kid-kenji', 'kid-ama', 'kid-mateo'], needsBackup: false, provisionalBackupId: null, backupRequested: false, backupOfferedBy: null},
  {id: 'run-tue-am', dayId: 'tue', period: 'AM', departLabel: '7:35', driverId: 'fam-osei', riderIds: ['kid-ama', 'kid-lucia', 'kid-mateo', 'kid-kenji'], needsBackup: false, provisionalBackupId: null, backupRequested: false, backupOfferedBy: null},
  {id: 'run-tue-pm', dayId: 'tue', period: 'PM', departLabel: '3:10', driverId: 'fam-delgado', riderIds: ['kid-lucia', 'kid-mateo', 'kid-milo', 'kid-ama'], needsBackup: false, provisionalBackupId: null, backupRequested: false, backupOfferedBy: null},
  {id: 'run-wed-am', dayId: 'wed', period: 'AM', departLabel: '7:35', driverId: 'fam-bennett', riderIds: ['kid-milo', 'kid-kenji', 'kid-aiko', 'kid-ama'], needsBackup: false, provisionalBackupId: null, backupRequested: false, backupOfferedBy: null},
  {id: 'run-wed-pm', dayId: 'wed', period: 'PM', departLabel: '3:10', driverId: 'fam-nakamura', riderIds: ['kid-kenji', 'kid-aiko', 'kid-ama', 'kid-mateo'], needsBackup: false, provisionalBackupId: null, backupRequested: false, backupOfferedBy: null},
  {id: 'run-thu-am', dayId: 'thu', period: 'AM', departLabel: '7:35', driverId: 'fam-osei', riderIds: ['kid-ama', 'kid-milo', 'kid-kenji', 'kid-mateo'], needsBackup: false, provisionalBackupId: null, backupRequested: false, backupOfferedBy: null},
  // THE open slot — 3 riders waiting; Nakamura carries the hatched
  // provisional +1 (standing backup) until someone claims it.
  {id: 'run-thu-pm', dayId: 'thu', period: 'PM', departLabel: '3:10', driverId: null, riderIds: ['kid-kenji', 'kid-ama', 'kid-lucia'], needsBackup: false, provisionalBackupId: 'fam-nakamura', backupRequested: false, backupOfferedBy: null},
  // STRESS FIXTURE 2 — full van: 5 of 5 seats, 0 empty pills, boosters
  // Milo+Aiko = 2 = row-2 capacity exactly met.
  {id: 'run-fri-am', dayId: 'fri', period: 'AM', departLabel: '7:35', driverId: 'fam-delgado', riderIds: ['kid-milo', 'kid-kenji', 'kid-aiko', 'kid-ama', 'kid-mateo'], needsBackup: false, provisionalBackupId: null, backupRequested: false, backupOfferedBy: null},
  // STRESS FIXTURE 4 — needs-backup: amber ring (static under reduced
  // motion) + LifeBuoy badge; coin opens the sheet in backup-offer mode.
  {id: 'run-fri-pm', dayId: 'fri', period: 'PM', departLabel: '3:10', driverId: 'fam-nakamura', riderIds: ['kid-kenji', 'kid-aiko', 'kid-ama', 'kid-milo'], needsBackup: true, provisionalBackupId: null, backupRequested: false, backupOfferedBy: null},
];

interface AlertItem {
  id: string;
  title: string;
  meta: string;
  resolved: boolean;
  dismissed: boolean;
}

// Badge = unresolved ∧ undismissed count: 3 pre-claim → 2 post-claim (al-1
// self-resolves in the claim transaction) ✓.
const ALERTS: AlertItem[] = [
  {id: 'al-1', title: 'Thursday PM needs a driver', meta: 'Open since Sunday · 3 riders waiting', resolved: false, dismissed: false},
  {id: 'al-2', title: 'Fri PM: Nakamura requested a backup', meta: 'Yuki has a 4:00 clinic pickup', resolved: false, dismissed: false},
  {id: 'al-3', title: 'Booster check: Lucía needs a seat Thu PM', meta: 'Delgados left theirs in the other car', resolved: false, dismissed: false},
];

// ---------------------------------------------------------------------------
// ROUTE GEOMETRY — stop order and offsets are a PURE function of driverId:
// non-driver stops sort nearest-to-school first (STOP_RANK), the driver's
// home is always last, and offsets accumulate strictly increasing leg
// minutes. Bennett driving all four stops lands School +0 → Osei +4 →
// Nakamura +9 → Delgado +13 → Bennett +17 (spec-exact ✓).
// ---------------------------------------------------------------------------

const STOP_RANK: Record<string, number> = {
  'fam-osei': 1,
  'fam-nakamura': 2,
  'fam-delgado': 3,
  'fam-bennett': 4,
};
const LEG_MIN: Record<string, number> = {
  'fam-osei': 4,
  'fam-nakamura': 5,
  'fam-delgado': 4,
  'fam-bennett': 4,
};

interface RouteStop {
  familyId: string;
  offsetMin: number;
}

/** Pure: rider families (driver last when set) with cumulative +min offsets. */
function computeStops(riderIds: string[], driverId: string | null): RouteStop[] {
  const famIds = new Set(riderIds.map(id => KID_BY_ID.get(id)?.familyId ?? ''));
  if (driverId != null) famIds.add(driverId);
  const mid = [...famIds].filter(id => id !== driverId).sort((a, b) => STOP_RANK[a] - STOP_RANK[b]);
  const ordered = driverId != null ? [...mid, driverId] : mid;
  let offset = 0;
  return ordered.map(familyId => {
    offset += LEG_MIN[familyId];
    return {familyId, offsetMin: offset};
  });
}

// ---------------------------------------------------------------------------
// SEATING — pure seatKids(riders): boosters sort FIRST and may ONLY render
// in row 2 (2 seats); row 3 holds 3. Throws in dev when boosters exceed
// row-2 capacity — no shipped fixture violates it (max is 2, Fri AM).
// ---------------------------------------------------------------------------

const ROW2_SEATS = 2;
const ROW3_SEATS = 3;

interface SeatPlan {
  row2: (Kid | null)[]; // length 2, booster-capable
  row3: (Kid | null)[]; // length 3
  seated: number;
  boosterCount: number;
}

function seatKids(riderIds: string[]): SeatPlan {
  const riders = riderIds.map(id => KID_BY_ID.get(id)).filter((kid): kid is Kid => kid != null);
  const boosters = riders.filter(kid => kid.needsBooster);
  const others = riders.filter(kid => !kid.needsBooster);
  if (boosters.length > ROW2_SEATS) {
    // Booster overflow guard (stress fixture 3): 3 boosters can never
    // board one run — the pod rule is enforced at the fixture level.
    throw new Error(`seatKids: ${boosters.length} boosters exceed row-2 capacity ${ROW2_SEATS}`);
  }
  const row2Kids: Kid[] = [...boosters];
  const row3Kids: Kid[] = [];
  for (const kid of others) {
    if (row2Kids.length < ROW2_SEATS && row3Kids.length >= ROW3_SEATS) row2Kids.push(kid);
    else if (row3Kids.length < ROW3_SEATS) row3Kids.push(kid);
    else if (row2Kids.length < ROW2_SEATS) row2Kids.push(kid);
  }
  const row2: (Kid | null)[] = [0, 1].map(i => row2Kids[i] ?? null);
  const row3: (Kid | null)[] = [0, 1, 2].map(i => row3Kids[i] ?? null);
  return {row2, row3, seated: riders.length, boosterCount: boosters.length};
}

// ---------------------------------------------------------------------------
// ID-DERIVED GRADIENTS — deterministic hash(familyId) → two HSL stops (no
// real photos/maps). Lightness pinned at 38%/30% so the white 11px pill
// text stays ≥4.5:1 on every derived hue (worst case ~5.1:1 at L38 yellow).
// ---------------------------------------------------------------------------

function hashHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

function gradStops(id: string): [string, string] {
  const hue = hashHue(id);
  return [`hsl(${hue} 55% 38%)`, `hsl(${(hue + 40) % 360} 60% 30%)`];
}

function gradCss(id: string): string {
  const [a, b] = gradStops(id);
  return `linear-gradient(135deg, ${a}, ${b})`;
}

// ---------------------------------------------------------------------------
// FAIRNESS ARC MATH — r=30, circumference 2π·30 = 188.5. Segment degrees:
// units = max(owed, given + pending + provisional) so the ring never
// overflows 360°. Bennett pre-claim: units max(8, 6+2) = 8 → settled
// 6/8·360 = 270° of 360 (spec-exact ✓), pending 2/8·360 = 90°. Nakamura
// pre-claim: units max(7, 9+3+1) = 13 → settled 249.2°, pending 83.1°,
// hatched provisional 27.7°; post-claim the provisional term drops.
// ---------------------------------------------------------------------------

const ARC_R = 30;
const ARC_C = 2 * Math.PI * ARC_R; // 188.5

interface ArcSegments {
  settledDeg: number;
  pendingDeg: number;
  provisionalDeg: number;
}

function arcSegments(family: Family, pending: number, provisional: number): ArcSegments {
  const units = Math.max(family.owedDrives, family.givenDrives + pending + provisional);
  const per = units === 0 ? 0 : 360 / units;
  return {
    settledDeg: family.givenDrives * per,
    pendingDeg: pending * per,
    provisionalDeg: provisional * per,
  };
}

/** SVG arc path on a circle of radius r centered (cx, cy); 0° at 12 o'clock, clockwise. */
function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): string {
  const clamp = Math.min(toDeg, fromDeg + 359.9);
  const a0 = ((fromDeg - 90) * Math.PI) / 180;
  const a1 = ((clamp - 90) * Math.PI) / 180;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = clamp - fromDeg > 180 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

function firstName(kid: Kid): string {
  return kid.name.split(' ')[0];
}

function riderLine(riderIds: string[]): string {
  return riderIds
    .map(id => {
      const kid = KID_BY_ID.get(id);
      return kid != null ? firstName(kid) : '';
    })
    .filter(Boolean)
    .join(', ');
}

// ---------------------------------------------------------------------------
// HOOKS + FOCUS UTILITIES
// ---------------------------------------------------------------------------

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
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="-1"]');
  const buttons = container.querySelectorAll<HTMLElement>('button:not([disabled])');
  if (buttons.length === 0 || focusables.length === 0) return;
  const first = buttons[0];
  const last = buttons[buttons.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === container || !container.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/** Nearest scrollable ancestor (the demo's .preview-wrap owns page scroll). */
function findScroller(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node != null) {
    const {overflowY} = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// BEE MARK — 28px Shuttlebee glyph: two overlapping route-loop wings with
// 3px stop dots, strokes BRAND_ACCENT; a REAL 44×44 button labeled
// 'Shuttlebee' (pod-switcher stub, decorative brand anchor in v1).
// ---------------------------------------------------------------------------

function BeeMark() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path d="M6 18 C 2 12, 8 5, 14 11" stroke={BRAND_ACCENT} strokeWidth={2} strokeLinecap="round" />
      <path d="M22 18 C 26 12, 20 5, 14 11" stroke={BRAND_ACCENT} strokeWidth={2} strokeLinecap="round" />
      <path d="M9 21 C 11 17, 17 17, 19 21" stroke={BRAND_ACCENT} strokeWidth={2} strokeLinecap="round" />
      <circle cx="6" cy="18" r="1.5" fill={BRAND_ACCENT} />
      <circle cx="22" cy="18" r="1.5" fill={BRAND_ACCENT} />
      <circle cx="14" cy="11" r="1.5" fill={BRAND_ACCENT} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// STRIP STATUS DOT — color NEVER encodes alone: covered = solid disc
// (brand text-grade pair), open = hollow ring (red pair), backup =
// triangle badge (amber pair). All pairs ≥3:1 vs the strip surface (math
// at the COLOR LITERALS block). Rendered inside the 56px dayCell hit.
// ---------------------------------------------------------------------------

type DayStatus = 'covered' | 'open' | 'backup';

function dayStatusOf(runs: Run[]): DayStatus {
  if (runs.some(run => run.driverId == null)) return 'open';
  if (runs.some(run => run.needsBackup && run.backupOfferedBy == null)) return 'backup';
  return 'covered';
}

function StatusDot({status}: {status: DayStatus}) {
  if (status === 'open') {
    return <span aria-hidden style={{width: 10, height: 10, borderRadius: '50%', border: `2px solid ${DOT_OPEN}`}} />;
  }
  if (status === 'backup') {
    return (
      <svg width={12} height={10} viewBox="0 0 12 10" aria-hidden>
        <path d="M6 0 L12 10 L0 10 Z" fill={DOT_BACKUP} />
      </svg>
    );
  }
  return <span aria-hidden style={{width: 10, height: 10, borderRadius: '50%', background: BRAND_ACCENT}} />;
}

// ---------------------------------------------------------------------------
// DRIVER SLOT COIN — 56px circle + 4px fairness arc (r=30, C=188.5) inside
// a 72×72 button. open = dashed REST_BOUNDARY ring (≥3:1 amendment; spec
// said --color-border — deviation noted) + 24px brand Plus + 'OPEN'
// overline; claimed = initial on id-derived gradient with settled
// (BRAND_ACCENT) / pending (PENDING_ARC pair) / hatched provisional
// (DOT_BACKUP 4px dashes) segments; needs-backup adds the amber ring pulse
// (2s opacity loop, REMOVED under reduced motion — static ring encodes it)
// + 16px LifeBuoy badge bottom-right.
// ---------------------------------------------------------------------------

interface DriverSlotCoinProps {
  run: Run;
  pendingByFamily: Record<string, number>;
  provisionalByFamily: Record<string, number>;
  size?: number; // 64 default; 40 mini for Families rows
  label: string;
  onPressWithOpener?: (opener: HTMLElement) => void;
}

function CoinArc({family, pending, provisional, size}: {family: Family; pending: number; provisional: number; size: number}) {
  const c = size / 2;
  const r = (size / 2) - 2; // 4px stroke centered 2px inside
  const scale = r / ARC_R; // keep the r=30 math in comments literal
  void scale;
  const seg = arcSegments(family, pending, provisional);
  const settledEnd = seg.settledDeg;
  const pendingEnd = settledEnd + seg.pendingDeg;
  const provisionalEnd = pendingEnd + seg.provisionalDeg;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden style={{position: 'absolute', inset: 0}}>
      {/* Rest track — meaningful rest fill, ≥3:1 REST_BOUNDARY pair. */}
      <circle cx={c} cy={c} r={r} stroke={REST_BOUNDARY} strokeWidth={2} opacity={0.55} />
      {seg.settledDeg > 0 ? (
        <path d={arcPath(c, c, r, 0, settledEnd)} stroke={BRAND_ACCENT} strokeWidth={4} strokeLinecap="butt" />
      ) : null}
      {seg.pendingDeg > 0 ? (
        <path d={arcPath(c, c, r, settledEnd, pendingEnd)} stroke={PENDING_ARC} strokeWidth={4} strokeLinecap="butt" />
      ) : null}
      {seg.provisionalDeg > 0 ? (
        <path
          d={arcPath(c, c, r, pendingEnd, provisionalEnd)}
          stroke={DOT_BACKUP}
          strokeWidth={4}
          strokeLinecap="butt"
          strokeDasharray="4 4"
        />
      ) : null}
    </svg>
  );
}

function DriverSlotCoin({run, pendingByFamily, provisionalByFamily, size = 64, label, onPressWithOpener}: DriverSlotCoinProps) {
  const family = run.driverId != null ? FAMILY_BY_ID.get(run.driverId) : undefined;
  const circle = size - 8; // 56px face inside the 64px arc box
  const needsBackupLive = run.needsBackup && run.backupOfferedBy == null;
  const face =
    family != null ? (
      <span
        aria-hidden
        style={{
          width: circle,
          height: circle,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: gradCss(family.id),
          color: '#FFFFFF',
          fontSize: size >= 64 ? 22 : 16,
          fontWeight: 700,
        }}>
        {family.name.charAt(0)}
      </span>
    ) : (
      <span
        aria-hidden
        style={{
          width: circle,
          height: circle,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          // Interactive boundary at rest — dashed ≥3:1 REST_BOUNDARY ring.
          border: `2px dashed ${REST_BOUNDARY}`,
          background: 'var(--color-background-muted)',
          color: BRAND_ACCENT,
        }}>
        <Icon icon={PlusIcon} size="md" color="inherit" />
      </span>
    );
  const body = (
    <span style={{position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center'}}>
      {family != null ? (
        <span className={needsBackupLive ? 'shb-pulse' : undefined} style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
          <CoinArc
            family={family}
            pending={pendingByFamily[family.id] ?? 0}
            provisional={provisionalByFamily[family.id] ?? 0}
            size={size}
          />
        </span>
      ) : null}
      {needsBackupLive ? (
        // Static amber ring alone encodes needs-backup under reduced
        // motion (the pulse class is removed by the media guard).
        <span aria-hidden style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${DOT_BACKUP}`}} />
      ) : null}
      {face}
      {needsBackupLive || run.backupRequested ? (
        <span style={styles.coinBadge} aria-hidden>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3.6" />
            <path d="M5.7 5.7 9.5 9.5M18.3 5.7 14.5 9.5M18.3 18.3 14.5 14.5M5.7 18.3 9.5 14.5" />
          </svg>
        </span>
      ) : null}
    </span>
  );
  if (onPressWithOpener == null) {
    return <span style={{...styles.coinBtn, width: size + 8, height: size + 8}}>{body}</span>;
  }
  return (
    <button
      type="button"
      className="shb-btn shb-focusable"
      style={styles.coinBtn}
      aria-label={label}
      onClick={event => onPressWithOpener(event.currentTarget)}>
      {body}
      {family == null ? (
        <span
          style={{
            position: 'absolute',
            bottom: -2,
            insetInline: 0,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textAlign: 'center',
            color: BRAND_ACCENT,
          }}
          aria-hidden>
          OPEN
        </span>
      ) : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// SEAT PILL ROW — stylized minivan cross-section, pure divs: row 2 = 2
// booster-capable pills (14px Armchair glyph baked into the leading edge),
// row 3 = 3 pills. Pre-claim open runs ghost the grid at 50% behind 3
// 'waiting' rider chips.
// ---------------------------------------------------------------------------

function SeatPill({kid, boosterSeat}: {kid: Kid | null; boosterSeat: boolean}) {
  if (kid == null) {
    return <span style={{...styles.seatPill, ...styles.seatPillEmpty}} aria-hidden />;
  }
  return (
    <span style={{...styles.seatPill, background: gradCss(kid.familyId)}} title={kid.name}>
      {boosterSeat && kid.needsBooster ? (
        <span aria-hidden style={{display: 'inline-flex', color: '#FFFFFF', flexShrink: 0}}>
          <Icon icon={ArmchairIcon} size="xsm" color="inherit" />
        </span>
      ) : null}
      <span style={styles.seatPillName}>{firstName(kid)}</span>
    </span>
  );
}

function SeatPillRow({run}: {run: Run}) {
  const isOpen = run.driverId == null;
  const plan = seatKids(isOpen ? [] : run.riderIds);
  const vehicle = run.driverId != null ? FAMILY_BY_ID.get(run.driverId)?.vehicleName : undefined;
  const totalSeats = ROW2_SEATS + ROW3_SEATS;
  const waiting = run.riderIds.map(id => KID_BY_ID.get(id)).filter((kid): kid is Kid => kid != null);
  return (
    <div style={styles.seatBlock}>
      {isOpen ? (
        <div style={styles.waitingChips}>
          {waiting.map(kid => (
            <span key={kid.id} style={styles.waitingChip}>
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>{firstName(kid)}</span>
            </span>
          ))}
        </div>
      ) : null}
      <div style={isOpen ? {...styles.ghosted, display: 'flex', flexDirection: 'column', gap: 8} : {display: 'flex', flexDirection: 'column', gap: 8}} aria-hidden={isOpen}>
        <div style={styles.seatRow}>
          {plan.row2.map((kid, i) => (
            <SeatPill key={kid?.id ?? `r2-${i}`} kid={kid} boosterSeat />
          ))}
        </div>
        <div style={styles.seatRow}>
          {plan.row3.map((kid, i) => (
            <SeatPill key={kid?.id ?? `r3-${i}`} kid={kid} boosterSeat={false} />
          ))}
        </div>
      </div>
      <span style={styles.seatCaption}>
        {isOpen
          ? `${waiting.length} riders waiting · van set by driver`
          : `${plan.seated} of ${totalSeats} seats · ${plan.boosterCount} booster${plan.boosterCount === 1 ? '' : 's'} in row 2${vehicle != null ? ` · ${vehicle}` : ''}`}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ROUTE RIBBON — 72px inline SVG, viewBox '0 0 358 72', width 100%: a 3px
// path (BRAND_ACCENT at 45%) threading the stops left→right; school = flag
// glyph at x≈14, each stop a 16px house whose roof is the id-derived
// gradient; '+N min' 11px tabular labels underneath. Decorative
// (aria-hidden) with a visually-hidden text equivalent. Open runs render
// the path dashed with the 'Stop order set by driver' caption.
// ---------------------------------------------------------------------------

function RouteRibbon({run, driverOverride, gradientPrefix}: {run: Run; driverOverride?: string | null; gradientPrefix: string}) {
  const driverId = driverOverride !== undefined ? driverOverride : run.driverId;
  const riderIds = driverOverride === ME && !run.riderIds.includes('kid-milo') ? [...run.riderIds, 'kid-milo'] : run.riderIds;
  const stops = computeStops(riderIds, driverId);
  const isOpen = driverId == null;
  const startX = 18;
  // endX 330 keeps the last '+17 min' centered label (~38px wide) inside
  // the 358 viewBox at every stop count.
  const endX = 330;
  const span = stops.length > 0 ? (endX - startX) / stops.length : 0;
  const yPath = 34;
  const text = isOpen
    ? `Route pending a driver: ${stops.map(s => `${FAMILY_BY_ID.get(s.familyId)?.name} +${s.offsetMin} min`).join(', ')}`
    : `Route: School, then ${stops.map(s => `${FAMILY_BY_ID.get(s.familyId)?.name} at +${s.offsetMin} min`).join(', ')}`;
  return (
    <div style={styles.ribbonWrap}>
      <svg viewBox="0 0 358 72" width="100%" preserveAspectRatio="xMidYMid meet" aria-hidden style={{display: 'block'}}>
        <defs>
          {stops.map(stop => {
            const [a, b] = gradStops(stop.familyId);
            return (
              <linearGradient key={stop.familyId} id={`${gradientPrefix}-${stop.familyId}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={a} />
                <stop offset="1" stopColor={b} />
              </linearGradient>
            );
          })}
        </defs>
        <path
          d={`M ${startX} ${yPath} ${stops.map((_, i) => `L ${(startX + span * (i + 1)).toFixed(1)} ${i % 2 === 0 ? yPath - 8 : yPath + 6}`).join(' ')}`}
          stroke={BRAND_ACCENT}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.45}
          fill="none"
          strokeDasharray={isOpen ? '4 6' : undefined}
        />
        {/* School flag at the origin. */}
        <g transform={`translate(${startX - 4}, ${yPath - 22})`}>
          <path d="M2 0 v20" stroke="var(--color-text-secondary)" strokeWidth={2} strokeLinecap="round" />
          <path d="M3 1 h10 l-3 4 3 4 h-10 z" fill={BRAND_ACCENT} />
        </g>
        <text x={startX - 4} y={yPath + 26} fontSize={11} fontWeight={500} fill="var(--color-text-secondary)" style={{fontVariantNumeric: 'tabular-nums'}}>
          +0
        </text>
        {stops.map((stop, i) => {
          const x = startX + span * (i + 1);
          const y = i % 2 === 0 ? yPath - 8 : yPath + 6;
          const family = FAMILY_BY_ID.get(stop.familyId);
          return (
            <g key={stop.familyId}>
              {/* 16px house: roof = id-derived gradient, body = muted. */}
              <g transform={`translate(${(x - 8).toFixed(1)}, ${(y - 14).toFixed(1)})`}>
                <path d="M0 7 L8 0 L16 7 Z" fill={`url(#${gradientPrefix}-${stop.familyId})`} />
                <rect x={2.5} y={7} width={11} height={8} rx={1} fill="var(--color-background-muted)" stroke={REST_BOUNDARY} strokeWidth={0.75} />
              </g>
              <text
                x={x.toFixed(1)}
                y={y + 16}
                fontSize={11}
                fontWeight={500}
                textAnchor="middle"
                fill="var(--color-text-secondary)"
                style={{fontVariantNumeric: 'tabular-nums'}}>
                +{stop.offsetMin} min
              </text>
              <title>{family?.name}</title>
            </g>
          );
        })}
      </svg>
      <span className="shb-vh">{text}</span>
      {isOpen ? <div style={styles.ribbonCaption}>Stop order set by driver</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — two detents (55% / calc(100% − 56px)), grabber is a real
// 'Resize sheet' button (click toggles; pointer drag between detents is
// garnish, >120px past medium closes), 52px header with 44×44 X,
// focus-trapped dialog; first focus lands on the sheet title
// (preventScroll — the locked overflow-hidden shell would otherwise
// scroll-reveal the animating sheet and beach it mid-screen).
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  titleRef: RefObject<HTMLHeadingElement | null>;
  reducedMotion: boolean;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, titleRef, reducedMotion, footer, children}: SheetProps) {
  // Transient pointer-drag delta only — the detent itself lives in the
  // single state owner.
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
      aria-labelledby={titleId}
      tabIndex={-1}
      className="shb-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="shb-btn shb-focusable"
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
        <h2 id={titleId} ref={titleRef} tabIndex={-1} style={styles.sheetTitle}>
          {title}
        </h2>
        <button type="button" className="shb-btn shb-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RUN CARD — the Week tab's unit: 24px header (overline + 22px chip) →
// coin row → RouteRibbon → SeatPillRow → 48px claim / 36px details.
// ---------------------------------------------------------------------------

interface RunCardProps {
  run: Run;
  day: Day;
  pendingByFamily: Record<string, number>;
  provisionalByFamily: Record<string, number>;
  onOpenSheet: (runId: string, mode: 'claim' | 'backup' | 'details', opener: HTMLElement) => void;
}

function RunCard({run, day, pendingByFamily, provisionalByFamily, onOpenSheet}: RunCardProps) {
  const isOpen = run.driverId == null;
  const family = run.driverId != null ? FAMILY_BY_ID.get(run.driverId) : undefined;
  const needsBackupLive = run.needsBackup && run.backupOfferedBy == null;
  const chip = isOpen
    ? {style: styles.chipOpen, label: run.backupRequested ? 'BACKUP ASKED' : 'NEEDS DRIVER'}
    : needsBackupLive
      ? {style: styles.chipBackup, label: 'BACKUP ASKED'}
      : run.backupOfferedBy === ME
        ? {style: styles.chipCovered, label: 'YOU BACK UP'}
        : {style: styles.chipCovered, label: 'COVERED'};
  const coinLabel = isOpen
    ? `Claim ${day.full} ${run.period} run`
    : `Driver: ${family?.name ?? ''}${needsBackupLive ? ', needs backup' : ''}`;
  const coinMode: 'claim' | 'backup' | 'details' = isOpen ? 'claim' : needsBackupLive ? 'backup' : 'details';
  return (
    <section style={styles.runCard} aria-label={`${day.full} ${run.period} run`}>
      <div style={styles.runHeader}>
        <h2 style={{...styles.overline, margin: 0}}>
          {run.period} RUN · DEPART {run.departLabel}
        </h2>
        <span style={{...styles.statusChip, ...chip.style}}>{chip.label}</span>
      </div>
      <div style={styles.coinRow}>
        <DriverSlotCoin
          run={run}
          pendingByFamily={pendingByFamily}
          provisionalByFamily={provisionalByFamily}
          label={coinLabel}
          onPressWithOpener={opener => onOpenSheet(run.id, coinMode, opener)}
        />
        <div style={styles.driverStack}>
          <span style={styles.driverPrimary}>
            {isOpen ? 'Needs a driver' : run.driverId === ME ? 'You drive' : `${family?.name} drives`}
          </span>
          <span style={styles.driverSecondary}>
            {run.riderIds.length} riders · {riderLine(run.riderIds)}
          </span>
        </div>
      </div>
      <RouteRibbon run={run} gradientPrefix={`rr-${run.id}`} />
      <SeatPillRow run={run} />
      {isOpen ? (
        <button
          type="button"
          className="shb-btn shb-focusable"
          style={styles.claimBtn}
          onClick={event => onOpenSheet(run.id, 'claim', event.currentTarget)}>
          Claim this run
        </button>
      ) : (
        <button
          type="button"
          className="shb-btn shb-focusable"
          style={styles.detailsBtn}
          onClick={event => onOpenSheet(run.id, 'details', event.currentTarget)}>
          Run details
        </button>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// SKELETON RUN CARD — identical geometry to a loaded open-run card so
// resolution causes ZERO layout shift; deterministic bar widths 60/45/70
// primary · 40/55/30 secondary, never Math.random(). Shimmer omitted
// entirely (static muted blocks alone encode 'loading' — reduced-motion
// safe by construction).
// ---------------------------------------------------------------------------

function SkeletonRunCard({variant}: {variant: 0 | 1}) {
  const primary = ['60%', '45%', '70%'];
  const secondary = ['40%', '55%', '30%'];
  const p = (i: number) => primary[(i + variant) % 3];
  const s = (i: number) => secondary[(i + variant) % 3];
  return (
    <div style={styles.runCard} aria-hidden>
      <div style={styles.runHeader}>
        <span style={{...styles.skelBar, width: p(0)}} />
      </div>
      <div style={styles.coinRow}>
        <span style={{...styles.skelCircle, margin: 4}} />
        <div style={styles.driverStack}>
          <span style={{...styles.skelBar, width: p(1)}} />
          <span style={{...styles.skelBar, width: s(0)}} />
        </div>
      </div>
      <div style={{...styles.skelBlock, height: 72, marginBottom: 12}} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginBottom: 12}}>
        <span style={{...styles.skelBar, width: s(1)}} />
        <span style={{...styles.skelBar, width: p(2)}} />
        <span style={{...styles.skelBar, width: s(2)}} />
      </div>
      <div style={{...styles.skelBlock, height: 48}} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// FAMILY MINI COIN — 40px FairnessArc coin for the Families rows.
// ---------------------------------------------------------------------------

function FamilyMiniCoin({family, pending, provisional}: {family: Family; pending: number; provisional: number}) {
  return (
    <span style={{position: 'relative', width: 40, height: 40, display: 'grid', placeItems: 'center', flexShrink: 0}} aria-hidden>
      <CoinArc family={family} pending={pending} provisional={provisional} size={40} />
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: gradCss(family.id),
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 700,
        }}>
        {family.name.charAt(0)}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// MINI RIBBON STRIP — decorative 84×12 stop-dot strip for My-runs rows.
// ---------------------------------------------------------------------------

function MiniRibbon({run}: {run: Run}) {
  const stops = computeStops(run.riderIds, run.driverId);
  return (
    <svg width={84} height={12} viewBox="0 0 84 12" aria-hidden style={{flexShrink: 0}}>
      <line x1={4} y1={6} x2={80} y2={6} stroke={BRAND_ACCENT} strokeWidth={2} opacity={0.35} />
      {stops.map((stop, i) => (
        <circle key={stop.familyId} cx={8 + (68 / Math.max(1, stops.length - 1)) * i} cy={6} r={3.5} fill={gradStops(stop.familyId)[0]} />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — weekStore: runs + alerts entity maps and one ui slice,
// mutated only via update('ui', patch) + the claimRun / requestBackup /
// offerBackup / dismissAlert transactions. Undo restores the exact prior
// runs/alerts snapshot (one toast at a time; a new mutation ends the prior
// undo window).
// ---------------------------------------------------------------------------

type TabId = 'week' | 'runs' | 'families' | 'alerts';
type SheetMode = 'claim' | 'backup' | 'details';

interface ToastState {
  seq: number;
  text: string;
  undoable: boolean;
}

interface UiState {
  tab: TabId;
  selectedDay: string;
  sheet: {runId: string; mode: SheetMode; detent: 'medium' | 'large'} | null;
  toast: ToastState | null;
  refreshing: boolean;
  refreshedOnce: boolean;
  alertSegment: 'all' | 'unresolved';
}

interface WeekStore {
  runs: Record<string, Run>;
  runOrder: string[];
  alerts: Record<string, AlertItem>;
  alertOrder: string[];
  ui: UiState;
}

const INITIAL_STORE: WeekStore = {
  runs: Object.fromEntries(RUNS.map(run => [run.id, run])),
  runOrder: RUNS.map(run => run.id),
  alerts: Object.fromEntries(ALERTS.map(alert => [alert.id, alert])),
  alertOrder: ALERTS.map(alert => alert.id),
  ui: {
    tab: 'week',
    selectedDay: TODAY_DAY_ID,
    sheet: null,
    toast: null,
    refreshing: false,
    refreshedOnce: false,
    alertSegment: 'all',
  },
};

interface UndoSnapshot {
  runs: Record<string, Run>;
  alerts: Record<string, AlertItem>;
  alertOrder: string[];
  restoredText: string;
}

const NAV_TITLES: Record<TabId, string> = {
  week: WEEK_LABEL,
  runs: 'My runs',
  families: 'Families',
  alerts: 'Alerts',
};

const TABS: {id: TabId; label: string; icon: typeof CalendarDaysIcon}[] = [
  {id: 'week', label: 'Week', icon: CalendarDaysIcon},
  {id: 'runs', label: 'My runs', icon: CarFrontIcon},
  {id: 'families', label: 'Families', icon: UsersIcon},
  {id: 'alerts', label: 'Alerts', icon: BellIcon},
];

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileCarpoolCoordinatorTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [store, setStore] = useState<WeekStore>(INITIAL_STORE);
  const {runs, runOrder, alerts, alertOrder, ui} = store;

  const updateUi = useCallback((patch: Partial<UiState>) => {
    setStore(prev => ({...prev, ui: {...prev.ui, ...patch}}));
  }, []);

  // Focus + undo plumbing.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetTitleRef = useRef<HTMLHeadingElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const undoRef = useRef<UndoSnapshot | null>(null);
  const toastSeqRef = useRef(0);
  const scrollPosRef = useRef<Record<TabId, number>>({week: 0, runs: 0, families: 0, alerts: 0});

  const toastPatch = (text: string, undoable: boolean): Pick<UiState, 'toast'> => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undoable}};
  };

  // DERIVED — every aggregate derives live from the rows it summarizes.
  const runsList = runOrder.map(id => runs[id]);
  // Pending arc ticks = this week's claimed runs per family: pre-claim
  // B2+N3+O2+D2 = 9 ✓; post-claim 3+3+2+2 = 10 ✓ (derived, so the law
  // holds by construction).
  const pendingByFamily: Record<string, number> = {};
  for (const run of runsList) {
    if (run.driverId != null) pendingByFamily[run.driverId] = (pendingByFamily[run.driverId] ?? 0) + 1;
  }
  // Nakamura's hatched +1 exists ONLY while the open slot stands.
  const provisionalByFamily: Record<string, number> = {};
  for (const run of runsList) {
    if (run.driverId == null && run.provisionalBackupId != null) {
      provisionalByFamily[run.provisionalBackupId] = (provisionalByFamily[run.provisionalBackupId] ?? 0) + 1;
    }
  }
  const coveredCount = runsList.filter(run => run.driverId != null).length; // 9 → 10
  const alertBadge = alertOrder.filter(id => !alerts[id].resolved && !alerts[id].dismissed).length; // 3 → 2
  const myRuns = runsList.filter(run => run.driverId === ME); // day order via runOrder
  const selectedDay = DAYS.find(day => day.id === ui.selectedDay) ?? DAYS[3];
  const dayRuns = runsList.filter(run => run.dayId === selectedDay.id);
  const sheetRun = ui.sheet != null ? runs[ui.sheet.runId] : null;
  const sheetDay = sheetRun != null ? DAYS.find(day => day.id === sheetRun.dayId) ?? DAYS[3] : null;
  const givenTotal = FAMILIES.reduce((sum, family) => sum + family.givenDrives, 0); // 28
  const owedTotal = FAMILIES.reduce((sum, family) => sum + family.owedDrives, 0); // 28

  // SHEET LIFECYCLE ----------------------------------------------------------

  const openSheet = (runId: string, mode: SheetMode, opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    updateUi({sheet: {runId, mode, detent: 'medium'}});
  };
  const closeSheet = () => {
    updateUi({sheet: null});
    sheetOpenerRef.current?.focus({preventScroll: true});
  };

  // First focus lands on the sheet TITLE with preventScroll (house
  // amendment: plain .focus() scroll-reveals the animating sheet inside
  // the locked overflow-hidden column and beaches it mid-screen).
  useEffect(() => {
    if (ui.sheet != null) {
      sheetTitleRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [ui.sheet?.runId, ui.sheet?.mode, ui.sheet != null]);

  // Escape closes the topmost overlay — the sheet is the only stacked one.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.sheet != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.sheet != null]);

  // TAB SWITCHING — per-tab state persists (selectedDay, alertSegment,
  // scroll position all survive); the ONE legal reset is re-tapping the
  // active tab: scroll to top + selectedDay back to today.
  const selectTab = (tab: TabId) => {
    const scroller = findScroller(shellRef.current);
    if (tab === ui.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      updateUi({selectedDay: TODAY_DAY_ID});
      return;
    }
    if (scroller != null) scrollPosRef.current[ui.tab] = scroller.scrollTop;
    updateUi({tab});
  };
  useEffect(() => {
    const scroller = findScroller(shellRef.current);
    if (scroller != null) scroller.scrollTop = scrollPosRef.current[ui.tab] ?? 0;
  }, [ui.tab]);

  // TRANSACTIONS — each snapshots runs+alerts for exact-restore Undo.
  const snapshot = (restoredText: string) => {
    undoRef.current = {runs: store.runs, alerts: store.alerts, alertOrder: store.alertOrder, restoredText};
  };

  // THE CLAIM — one transaction flips 6 surfaces: coin → your avatar, arcs
  // rebalance (your pending tick + Nakamura's provisional relax), seats
  // reseat with Milo aboard (boosters → row 2), ribbon reorders to your
  // stop order, Thu strip dot error→solid, al-1 resolves (badge 3→2), the
  // My-runs row inserts in day order — all derived from this ONE write.
  const claimRun = (runId: string) => {
    snapshot('Claim removed');
    const day = DAYS.find(d => d.id === runs[runId].dayId) ?? DAYS[3];
    setStore(prev => {
      const run = prev.runs[runId];
      const riderIds = run.riderIds.includes('kid-milo') ? run.riderIds : [...run.riderIds, 'kid-milo'];
      return {
        ...prev,
        runs: {
          ...prev.runs,
          [runId]: {...run, driverId: ME, riderIds, provisionalBackupId: null, backupRequested: false},
        },
        alerts: {...prev.alerts, 'al-1': {...prev.alerts['al-1'], resolved: true}},
        ui: {...prev.ui, sheet: null, ...toastPatch(`You're driving ${day.full} ${run.period}`, true)},
      };
    });
    sheetOpenerRef.current?.focus({preventScroll: true});
  };

  // DECLINE path — posts al-4, badge +1, coin stays open with the badge.
  const requestBackup = (runId: string) => {
    snapshot('Request removed');
    const day = DAYS.find(d => d.id === runs[runId].dayId) ?? DAYS[3];
    setStore(prev => {
      const alert: AlertItem = {
        id: 'al-4',
        title: `Backup requested for ${day.short} ${prev.runs[runId].period}`,
        meta: 'Posted to the pod just now',
        resolved: false,
        dismissed: false,
      };
      return {
        ...prev,
        runs: {...prev.runs, [runId]: {...prev.runs[runId], backupRequested: true}},
        alerts: {...prev.alerts, [alert.id]: alert},
        alertOrder: prev.alertOrder.includes('al-4') ? prev.alertOrder : [...prev.alertOrder, 'al-4'],
        ui: {...prev.ui, sheet: null, ...toastPatch(`Backup requested for ${day.full} ${prev.runs[runId].period}`, true)},
      };
    });
    sheetOpenerRef.current?.focus({preventScroll: true});
  };

  // Fri PM's needs-backup coin proves the sheet's second use: the offer
  // resolves al-2 and swaps the amber ring for a 'YOU BACK UP' chip.
  const offerBackup = (runId: string) => {
    snapshot('Offer removed');
    const day = DAYS.find(d => d.id === runs[runId].dayId) ?? DAYS[3];
    setStore(prev => ({
      ...prev,
      runs: {...prev.runs, [runId]: {...prev.runs[runId], backupOfferedBy: ME}},
      alerts: {...prev.alerts, 'al-2': {...prev.alerts['al-2'], resolved: true}},
      ui: {...prev.ui, sheet: null, ...toastPatch(`You're covering ${day.full} ${prev.runs[runId].period} as backup`, true)},
    }));
    sheetOpenerRef.current?.focus({preventScroll: true});
  };

  // Alert dismiss — executes immediately + Undo (never a confirm).
  const dismissAlert = (id: string) => {
    snapshot('Alert restored');
    setStore(prev => {
      const remaining = prev.alertOrder.filter(aid => aid !== id && !prev.alerts[aid].dismissed).length;
      return {
        ...prev,
        alerts: {...prev.alerts, [id]: {...prev.alerts[id], dismissed: true}},
        ui: {
          ...prev.ui,
          ...toastPatch(`Alert dismissed · ${remaining} alert${remaining === 1 ? '' : 's'} remaining`, true),
        },
      };
    });
  };

  // UNDO — restores the exact prior runs/alerts snapshot in one
  // assignment; the toast then reads the restoration text. Undo storm
  // (stress fixture 7): claim → dismiss al-2 → Undo restores ONLY al-2,
  // because the dismiss snapshot was taken AFTER the claim committed.
  const undo = () => {
    const snap = undoRef.current;
    if (snap == null) return;
    undoRef.current = null;
    setStore(prev => ({
      ...prev,
      runs: snap.runs,
      alerts: snap.alerts,
      alertOrder: snap.alertOrder,
      ui: {...prev.ui, ...toastPatch(snap.restoredText, false)},
    }));
  };

  // REFRESH — press 1: skeleton cards + 'Loading' announced once via the
  // dock (the 16px inline spinner in the pressed button is the one legal
  // spinner); press 2: resolve + fixed 'Updated just now' caption.
  const pressRefresh = () => {
    if (!ui.refreshing) {
      undoRef.current = null; // a new toast ends the prior undo window
      updateUi({refreshing: true, ...toastPatch('Loading', false)});
    } else {
      updateUi({refreshing: false, refreshedOnce: true, ...toastPatch('Updated just now', false)});
    }
  };

  const beeTap = () => updateUi(toastPatch('Shuttlebee pod · Maple Grove Elementary', false));

  // Segmented control arrow keys (radiogroup contract).
  const onSegmentKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = ui.alertSegment === 'all' ? 'unresolved' : 'all';
    updateUi({alertSegment: next});
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  // SHEET CONTENT ------------------------------------------------------------

  let sheetNode: ReactNode = null;
  if (ui.sheet != null && sheetRun != null && sheetDay != null) {
    const mode = ui.sheet.mode;
    const title = `${sheetDay.full} ${sheetRun.period} run`;
    const isOfferMode = mode === 'backup' && sheetRun.needsBackup;
    // Claim preview derives from the SAME pure functions the cards use.
    const previewPlan = seatKids(sheetRun.riderIds.includes('kid-milo') ? sheetRun.riderIds : [...sheetRun.riderIds, 'kid-milo']);
    const me = FAMILY_BY_ID.get(ME) as Family;
    const netNow = me.givenDrives - me.owedDrives; // 6 − 8 = −2
    const fmtNet = (value: number) => (value > 0 ? `+${value}` : `${value}`);
    let body: ReactNode;
    let footer: ReactNode;
    if (mode === 'claim') {
      body = (
        <div>
          <RouteRibbon run={sheetRun} driverOverride={ME} gradientPrefix="sheet-rr" />
          <div style={styles.sheetInfoRow}>
            <span style={styles.rowPrimary}>Milo joins · {previewPlan.seated} of 5 seats</span>
            <span style={styles.rowSecondary}>Boosters ride row 2 · your {me.vehicleName}</span>
          </div>
          <div style={styles.rowDivider} />
          <div style={styles.sheetInfoRow}>
            {/* Fairness delta: given 6→7 vs owed 8 ⇒ −2 → −1 ✓ */}
            <span style={{...styles.rowPrimary, fontVariantNumeric: 'tabular-nums'}}>
              Your balance {fmtNet(netNow)} → {fmtNet(netNow + 1)}
            </span>
            <span style={styles.rowSecondary}>
              Given {me.givenDrives} → {me.givenDrives + 1} vs owed {me.owedDrives}
            </span>
          </div>
        </div>
      );
      footer = (
        <div>
          <button type="button" className="shb-btn shb-focusable" style={styles.claimBtn} onClick={() => claimRun(sheetRun.id)}>
            Claim this run
          </button>
          {/* 16px dead space separates the primary from the decline path. */}
          <button
            type="button"
            className="shb-btn shb-focusable"
            style={styles.sheetSecondaryBtn}
            onClick={() => updateUi({sheet: {...ui.sheet!, mode: 'backup'}})}>
            Request a backup instead
          </button>
        </div>
      );
    } else if (mode === 'backup') {
      body = (
        <div>
          <RouteRibbon run={sheetRun} gradientPrefix="sheet-rr" />
          <div style={styles.sheetInfoRow}>
            <span style={styles.rowPrimary}>
              {isOfferMode
                ? `${FAMILY_BY_ID.get(sheetRun.driverId ?? '')?.name ?? ''} drives · backup wanted`
                : 'A backup keeps the slot covered if no one claims'}
            </span>
            <span style={styles.rowSecondary}>
              {sheetRun.riderIds.length} riders · {riderLine(sheetRun.riderIds)}
            </span>
          </div>
          <div style={styles.rowDivider} />
          <div style={styles.sheetInfoRow}>
            <span style={{...styles.rowPrimary, fontVariantNumeric: 'tabular-nums'}}>Your balance stays {fmtNet(netNow)}</span>
            <span style={styles.rowSecondary}>Backing up only counts if you end up driving</span>
          </div>
        </div>
      );
      footer = (
        <div>
          <button
            type="button"
            className="shb-btn shb-focusable"
            style={styles.claimBtn}
            onClick={() => (isOfferMode ? offerBackup(sheetRun.id) : requestBackup(sheetRun.id))}>
            {isOfferMode ? `Offer to cover ${sheetDay.short} ${sheetRun.period}` : 'Request a backup'}
          </button>
          {!isOfferMode ? (
            <button
              type="button"
              className="shb-btn shb-focusable"
              style={styles.sheetSecondaryBtn}
              onClick={() => updateUi({sheet: {...ui.sheet!, mode: 'claim'}})}>
              Back to claiming
            </button>
          ) : null}
        </div>
      );
    } else {
      const driver = FAMILY_BY_ID.get(sheetRun.driverId ?? '');
      body = (
        <div>
          <div style={styles.sheetInfoRow}>
            <span style={styles.rowPrimary}>
              {sheetRun.driverId === ME ? 'You drive' : `${driver?.name ?? ''} drives`} · {driver?.vehicleName}
            </span>
            <span style={styles.rowSecondary}>Departs {sheetRun.departLabel} · {sheetRun.riderIds.length} riders</span>
          </div>
          <RouteRibbon run={sheetRun} gradientPrefix="sheet-rr" />
          <SeatPillRow run={sheetRun} />
        </div>
      );
      footer = (
        <button type="button" className="shb-btn shb-focusable" style={styles.detailsBtn} onClick={closeSheet}>
          Close
        </button>
      );
    }
    sheetNode = (
      <Sheet
        titleId="shb-sheet-title"
        title={title}
        detent={ui.sheet.detent}
        onDetentChange={detent => updateUi({sheet: {...ui.sheet!, detent}})}
        onClose={closeSheet}
        sheetRef={sheetRef}
        titleRef={sheetTitleRef}
        reducedMotion={reducedMotion}
        footer={footer}>
        {body}
      </Sheet>
    );
  }

  // TAB BODIES -----------------------------------------------------------------

  const visibleAlerts = alertOrder
    .map(id => alerts[id])
    .filter(alert => !alert.dismissed && (ui.alertSegment === 'all' || !alert.resolved));

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SHB_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button type="button" className="shb-btn shb-focusable" style={styles.iconBtn} aria-label="Shuttlebee" onClick={beeTap}>
              <BeeMark />
            </button>
          </div>
          <p style={styles.navTitle}>{NAV_TITLES[ui.tab]}</p>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="shb-btn shb-focusable"
              style={styles.iconBtn}
              aria-label={ui.refreshing ? 'Finish refresh' : 'Refresh'}
              onClick={pressRefresh}>
              <span className={ui.refreshing ? 'shb-spin' : undefined} style={{display: 'inline-flex'}}>
                <Icon icon={RefreshCwIcon} size="sm" color="inherit" />
              </span>
            </button>
          </div>
        </header>

        {ui.tab === 'week' ? (
          <nav style={styles.weekStrip} aria-label="Days of the week">
            {DAYS.map(day => {
              const status = dayStatusOf(runsList.filter(run => run.dayId === day.id));
              const selected = day.id === ui.selectedDay;
              const statusText = status === 'open' ? 'needs a driver' : status === 'backup' ? 'backup requested' : 'covered';
              return (
                <button
                  key={day.id}
                  type="button"
                  className="shb-btn shb-focusable"
                  style={styles.dayCell}
                  aria-label={`${day.full} Mar ${day.dateNum}, ${statusText}`}
                  aria-current={selected ? 'date' : undefined}
                  onClick={() => updateUi({selectedDay: day.id})}>
                  <span style={styles.dayDot}>
                    <StatusDot status={status} />
                  </span>
                  <span style={styles.dayName}>{day.short}</span>
                  <span style={styles.dayDate}>{day.dateNum}</span>
                  {selected ? <span style={styles.dayUnderline} aria-hidden /> : null}
                </button>
              );
            })}
          </nav>
        ) : null}

        <main style={styles.main}>
          {ui.tab === 'week' ? (
            <>
              <div style={styles.weekHeader}>
                <h1 style={styles.dayHeading}>{selectedDay.full}</h1>
                <span style={styles.coverageCaption}>
                  {coveredCount} of {runsList.length} runs covered this week
                  {ui.refreshedOnce ? <span style={styles.updatedCaption}> · Updated just now</span> : null}
                </span>
              </div>
              <div aria-busy={ui.refreshing || undefined}>
                {ui.refreshing ? (
                  <>
                    <SkeletonRunCard variant={0} />
                    <SkeletonRunCard variant={1} />
                  </>
                ) : (
                  dayRuns.map(run => (
                    <RunCard
                      key={run.id}
                      run={run}
                      day={selectedDay}
                      pendingByFamily={pendingByFamily}
                      provisionalByFamily={provisionalByFamily}
                      onOpenSheet={openSheet}
                    />
                  ))
                )}
              </div>
              <div style={{height: 12}} />
            </>
          ) : null}

          {ui.tab === 'runs' ? (
            <>
              <h1 className="shb-vh">My runs</h1>
              <div style={{height: 20}} />
              <div style={styles.listCard}>
                {myRuns.map((run, index) => {
                  const day = DAYS.find(d => d.id === run.dayId) ?? DAYS[0];
                  const stops = computeStops(run.riderIds, run.driverId);
                  const lastOffset = stops.length > 0 ? stops[stops.length - 1].offsetMin : 0;
                  return (
                    <div key={run.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <button
                        type="button"
                        className="shb-btn shb-focusable"
                        style={styles.row72}
                        aria-label={`${day.full} ${run.period} run, departs ${run.departLabel}, plus ${lastOffset} minutes`}
                        onClick={event => openSheet(run.id, 'details', event.currentTarget)}>
                        <span style={styles.rowText}>
                          <span style={styles.rowPrimary}>
                            {day.full} {run.period} · Depart {run.departLabel}
                          </span>
                          <MiniRibbon run={run} />
                        </span>
                        <span style={styles.rowMeta}>+{lastOffset} min</span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <p style={styles.terminalCaption}>All {myRuns.length} runs</p>
            </>
          ) : null}

          {ui.tab === 'families' ? (
            <>
              <h1 className="shb-vh">Families</h1>
              <div style={{height: 20}} />
              <div style={styles.listCard}>
                {FAMILIES.map((family, index) => {
                  const net = family.givenDrives - family.owedDrives;
                  const chipStyle = net < 0 ? styles.netBehind : net > 0 ? styles.netAhead : styles.netEven;
                  const chipLabel = net < 0 ? `${net} behind` : net > 0 ? `+${net} ahead` : 'even';
                  return (
                    <div key={family.id}>
                      {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                      <div style={styles.row72}>
                        <FamilyMiniCoin
                          family={family}
                          pending={pendingByFamily[family.id] ?? 0}
                          provisional={provisionalByFamily[family.id] ?? 0}
                        />
                        <span style={styles.rowText}>
                          <span style={styles.rowPrimary}>
                            {family.name}
                            {family.id === ME ? ' · You' : ''}
                          </span>
                          <span style={styles.rowSecondary}>
                            {family.givenDrives} given · {family.owedDrives} owed
                          </span>
                        </span>
                        <span style={{...styles.netChip, ...chipStyle}}>{chipLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={styles.terminalCaption}>
                All {FAMILIES.length} families · {givenTotal} drives settled · {owedTotal} owed
              </p>
            </>
          ) : null}

          {ui.tab === 'alerts' ? (
            <>
              <h1 className="shb-vh">Alerts</h1>
              <div style={styles.segmented} role="radiogroup" aria-label="Alert filter" onKeyDown={onSegmentKey}>
                {(['all', 'unresolved'] as const).map(segment => (
                  <button
                    key={segment}
                    type="button"
                    role="radio"
                    aria-checked={ui.alertSegment === segment}
                    className="shb-btn shb-focusable"
                    style={{...styles.segmentBtn, ...(ui.alertSegment === segment ? styles.segmentOn : null)}}
                    onClick={() => updateUi({alertSegment: segment})}>
                    {segment === 'all' ? 'All' : 'Unresolved'}
                  </button>
                ))}
              </div>
              {visibleAlerts.length === 0 ? (
                // Filtered-empty (stress fixture 6): BellOff variant, one
                // action that clears the segment filter.
                <div style={styles.emptyState}>
                  <span style={styles.emptyCircle}>
                    <Icon icon={BellOffIcon} size="lg" color="inherit" />
                  </span>
                  <h2 style={styles.emptyTitle}>No open alerts</h2>
                  <p style={styles.emptyBody}>New driver gaps and backup requests appear here.</p>
                  {ui.alertSegment === 'unresolved' ? (
                    <button type="button" className="shb-btn shb-focusable" style={styles.emptyAction} onClick={() => updateUi({alertSegment: 'all'})}>
                      Show all
                    </button>
                  ) : null}
                </div>
              ) : (
                <div style={styles.listCard}>
                  {visibleAlerts.map((alert, index) => (
                    <div key={alert.id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <div style={styles.alertRow}>
                        {alert.resolved ? (
                          <span style={styles.resolvedGlyph} aria-hidden>
                            <Icon icon={CheckIcon} size="sm" color="inherit" />
                          </span>
                        ) : null}
                        <span style={styles.rowText}>
                          <span style={{...styles.rowPrimary, ...(alert.resolved ? {color: 'var(--color-text-secondary)'} : null)}}>
                            {alert.title}
                          </span>
                          <span style={styles.rowSecondary}>{alert.resolved ? 'Resolved · ' : ''}{alert.meta}</span>
                        </span>
                        <button
                          type="button"
                          className="shb-btn shb-focusable"
                          style={styles.iconBtn}
                          aria-label={`Dismiss alert: ${alert.title}`}
                          onClick={() => dismissAlert(alert.id)}>
                          <Icon icon={XIcon} size="sm" color="inherit" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
          <div style={{height: 24}} />
        </main>

        {/* THE one polite live region — sticky dock above the tabBar. */}
        <div style={styles.toastDock} aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="shb-fade">
              <span style={styles.toastMsg}>{ui.toast.text}</span>
              {ui.toast.undoable && undoRef.current != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="shb-btn shb-focusable" style={styles.undoBtn} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} aria-label="Shuttlebee tabs">
          {TABS.map(tab => {
            const active = tab.id === ui.tab;
            return (
              <button
                key={tab.id}
                type="button"
                className="shb-btn shb-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                aria-label={tab.id === 'alerts' && alertBadge > 0 ? `Alerts, ${alertBadge} unresolved` : tab.label}
                aria-current={active ? 'page' : undefined}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'alerts' && alertBadge > 0 ? <span style={styles.tabBadge}>{alertBadge}</span> : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {ui.sheet != null ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {sheetNode}
      </div>
    </div>
  );
}
