var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Tidejar round-up week frozen at
 *   ANCHOR_DATE '2026-07-04' (Sat Jul 4): 8 transactions on Visa ····4821
 *   whose round-ups sum to exactly $4.00 (62+83+45+29+94+52+35 = 400¢, the
 *   $30.00 Transit Pass contributes $0.00), three goal jars (Japan Trip
 *   $780/$1,200 = 65% · Emergency Cushion $410/$500 = 82% · New Camera
 *   $315/$900 = 35%) with weekly transfers 38+22+15 = $75.00, and per-jar
 *   droplet sums Japan $2.01 / Emergency $1.35 / Camera $0.64 (2.01+1.35+
 *   0.64 = 4.00 ✓). Every projection date is COMPUTED — days =
 *   ceil(remaining·7/velocity), velocity = weeklyTransfer + assignedSum ×
 *   multiplier, date = ANCHOR + days: Sep 16 2026 / Jul 31 2026 /
 *   Mar 23 2027 at 1x. No Date.now(), no Math.random(), no network media.
 * @output Tidejar — Round-Up Goals: a 390px MOBILE spare-change app. Four
 *   tabs (Jars · Activity · Boost · Profile) under a 52px navBar. Jars:
 *   large title, $4.00 weekly hero, three 168px JarGaugeCards (88×120 SVG
 *   jars with wave meniscus + milestone notches), and a 3-row droplet
 *   preview with 'Show 5 more'. Activity: full 4-state search flow over
 *   the 8-row feed plus a refresh-triggered skeleton state. Boost: a 270°
 *   MultiplierDial (1x/2x/3x detents, role=slider) over an arithmetic
 *   VelocityReadout. Profile: account rows, inline weekday sweep picker,
 *   51×31 switch, Sign out alert. Signature move: pending round-up
 *   DROPLET COINS on the feed drag (or route via the mandatory 44×44
 *   ellipsis → action sheet) between jars; ONE assignments map plus ONE
 *   multiplier value drive coins, weekly hero, all three live projection
 *   dates, the jar meniscus coins, and the Boost velocity rows — moving
 *   txn5's $0.94 Japan→Camera slips Japan Sep 16→Sep 18 and pulls Camera
 *   Mar 23→Mar 8 2027 while the header stays $4.00; Undo round-trips
 *   exactly. Undo-over-confirm throughout; the sticky toastDock is the one
 *   polite announcer.
 * @position Page template; emitted by \`astryx template mobile-roundup-goals\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrims, jar sheet, action sheet, alert, drag
 *   layer) are position:'absolute' INSIDE shell; position:fixed is banned.
 *   While the jar sheet / action sheet / alert is open, shell locks to
 *   {height:'100dvh', overflow:'hidden'} and restores on close. The toast
 *   dock is STICKY-IN-FLOW at bottom:76 (above the 64px tabBar + 12px) —
 *   never shell-absolute, which would pin to the document bottom on tall
 *   scrolling tabs. The stage clips to --radius-container; shell paints
 *   full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 68 on the droplet feed / 16
 *   elsewhere, none on last rows); no desktop Layout frames, no asides,
 *   no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Tidejar teal) used only for meniscus fills, droplet
 *   coins, the dial, and the active tab; COIN_TEXT is the contrast-checked
 *   on-brand pair; REST_TRACK is the amendment-mandated ≥3:1 pair for
 *   interactive/rest-state fills (switch OFF track, dial track, future
 *   milestone notches) — math at each declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', blur surface, hairline ALWAYS
 *   ON); largeTitle row 52px in-flow on Jars only (28/700, navBar center
 *   title fades in via an IntersectionObserver sentinel); tabBar exactly
 *   64px sticky bottom z20, 4 tabItem flex:1 (24px icon + 11/500 label,
 *   4px gap); rows 44px utility / 60px two-line / 72px droplet media row
 *   (48px merchant tile, 12px radius); row padding 16px inline;
 *   sectionHeader 13/600 uppercase 0.06em at 32px, 20px top / 8px bottom;
 *   buttons 48px primary / 36px secondary / 44×44 icon. Jar gauge card
 *   168px (88×120 jar SVG left); dial card 180px (120px dial); weekly hero
 *   '$4.00' 34/700 tabular is the one sanctioned display size. TYPE
 *   (Figtree via --font-family-body): 28/700 large title · 34/700 hero
 *   numerals · 22/700 jar percents · 17/600 nav+card titles · 16/400 body
 *   floor · 13/400 meta · 11/500 overlines; nothing under 11px;
 *   tabular-nums on EVERY money and date value. Touch: every target
 *   ≥44×44 (coin drag handles padded, dial detents wrapped) with ≥8px
 *   clearance or merged full-row; every gesture has a visible button path
 *   (coin drag → 44×44 row ellipsis → identical action-sheet write; dial
 *   drag → detent buttons + arrow keys; sheet drag → clickable grabber).
 *
 * Responsive contract:
 * - Fluid 320–430px: no width literals; jar SVGs fixed 88×120 but the
 *   right stat stack is minWidth:0 with ellipsized names; DropletTxnRow's
 *   trailing value+coin column is fixed 84px and the merchant stack
 *   flexes/ellipsizes ('Grand Army Farmers Market' truncates at 320 —
 *   intended); coin routing tails hide below 360px (pure garnish; the jar
 *   chip label remains). overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as a
 *   centered phone column (maxWidth 430, marginInline auto, hairline
 *   borderInline). Hover tints live behind the canHover guard only.
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
  CheckIcon,
  ClockIcon,
  GaugeIcon,
  MoreHorizontalIcon,
  PlusIcon,
  ReceiptTextIcon,
  RefreshCwIcon,
  SearchIcon,
  SearchXIcon,
  UserRoundIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Tidejar teal). #0F766E on #FFFFFF ≈ 5.7:1
// (passes 4.5:1 for the 11px coin labels' background and 13px brand text);
// #5EEAD4 on the dark card (~#1C1C1E) ≈ 9:1.
const BRAND_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
// Text ON a BRAND_ACCENT fill (coin labels, NOW pills, primary buttons).
// Light: #FFFFFF on #0F766E ≈ 5.7:1. Dark: white on #5EEAD4 fails (~1.5:1),
// so the dark side flips to deep teal — #134E4A on #5EEAD4 ≈ 8:1.
const COIN_TEXT = 'light-dark(#FFFFFF, #134E4A)';
// Brand washes (12% chips/active-tint; 8% drop-ring flash base).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// AMENDMENT PAIR — interactive boundaries & meaningful rest-state fills
// need ≥3:1 against their ACTUAL surface (hairline/muted tokens are for
// passive separators only). Used for: switch OFF track, dial track arc,
// future (unpassed) milestone notches, and the dotted coin routing tail.
// Light #8A8A8F on the white card: L≈0.254 → (1.05)/(0.304) ≈ 3.45:1 ✓.
// Dark #767680 on the ~#1C1C1E card: L≈0.181 → (0.231)/(0.062) ≈ 3.7:1 ✓.
const REST_TRACK = 'light-dark(#8A8A8F, #767680)';
// Projection-flash washes (drag consequences): target date pulls earlier →
// brand wash; source date slips later → error wash. Both are transient
// 14% tints under 13px/500 text that keeps its own ≥4.5:1 token color.
const FLASH_EARLIER = \`color-mix(in srgb, \${BRAND_ACCENT} 14%, transparent)\`;
const FLASH_LATER = 'color-mix(in srgb, var(--color-error) 14%, transparent)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Chrome blur surface (navBar, tabBar).
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, transitions, the
// projection-flash keyframes, skeleton shimmer, and the reduced-motion
// guard. Transitions animate transform/opacity/color only.
// ---------------------------------------------------------------------------

const TJR_CSS = \`
.tjr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tjr-btn:disabled { cursor: default; }
.tjr-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.tjr-anim { transition: transform 300ms ease, opacity 300ms ease; }
.tjr-fade { transition: opacity 240ms ease; }
@keyframes tjr-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.tjr-sheet-in { animation: tjr-sheet-in 240ms ease; }
@keyframes tjr-flash-earlier {
  from { background: \${FLASH_EARLIER}; }
  to { background: transparent; }
}
@keyframes tjr-flash-later {
  from { background: \${FLASH_LATER}; }
  to { background: transparent; }
}
.tjr-flash-earlier { animation: tjr-flash-earlier 900ms ease-out forwards; }
.tjr-flash-later { animation: tjr-flash-later 900ms ease-out forwards; }
@keyframes tjr-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.tjr-shimmer {
  animation: tjr-shimmer 1.6s linear infinite;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-background-card) 55%, transparent),
    transparent
  );
}
.tjr-vh {
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
  .tjr-anim, .tjr-fade { transition: none; }
  .tjr-sheet-in { animation: none; }
  .tjr-flash-earlier, .tjr-flash-later { animation: none; }
  .tjr-shimmer { animation: none; background: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, largeTitle,
// tabBar, tabItem, sheetScrim, sheet, sheetGrabber, listCard, row,
// rowDivider, sectionHeader.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Measured wrapper — useElementWidth watches CONTAINER width (the demo's
  // desktop stage is ~1045px inside a 1440px window, so viewport queries
  // cannot tell the two stages apart).
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
  // Scroll lock while an overlay is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline + blur ALWAYS
  // ON (noted per contract; the large-title collapse drives only the
  // center-title opacity, not the hairline).
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
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  // LARGE TITLE — 52px in-flow row on the Jars root; scrolls under the
  // sticky navBar (IntersectionObserver sentinel fades the nav title in).
  largeTitleRow: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
  },
  largeTitle: {margin: 0, fontSize: 28, fontWeight: 700, lineHeight: 1.1},
  // WEEKLY HERO — overline + 34/700 tabular numeral (the one sanctioned
  // display size) + caption; 96px block under the 52px large title.
  weeklyHero: {
    paddingInline: 16,
    paddingBottom: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  heroNumeral: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  heroCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  updatedCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
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
  // Droplet feed rows lead with a 48px tile → divider inset 68.
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // JAR GAUGE CARD — 168px, full-card button; 88×120 jar SVG left, stat
  // stack right; relative for the drop ring + projection flash overlays.
  jarCard: {
    position: 'relative',
    width: '100%',
    height: 168,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  jarCardStack: {
    marginInline: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  jarStats: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    textAlign: 'left',
  },
  jarName: {
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  jarAmounts: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  jarPct: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  // Projection label — 13/500 tabular, relative so the flash wash paints
  // behind the text only.
  jarProj: {
    position: 'relative',
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingInline: 4,
    marginInlineStart: -4,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 2px dashed brand drop ring while a dragged coin hovers this jar.
  dropRing: {
    position: 'absolute',
    inset: 4,
    borderRadius: 8,
    border: \`2px dashed \${BRAND_ACCENT}\`,
    pointerEvents: 'none',
  },
  // DROPLET TXN ROW — 72px media row: [main button: 48px tile + text]
  // [fixed 84px value+coin column] [44×44 ellipsis]. Buttons are SIBLINGS,
  // never nested.
  dropletRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: 72,
    paddingInlineStart: 16,
    paddingInlineEnd: 4,
  },
  dropletMainBtn: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  merchTile: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 17,
    fontWeight: 600,
  },
  dropletText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  dropletPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dropletSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  trailingCol: {
    width: 84,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1,
  },
  purchaseAmt: {
    fontSize: 16,
    fontWeight: 400,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  coinRow: {display: 'flex', alignItems: 'center'},
  // Coin hit area padded to 44×44 via negative margins (28px visual keeps
  // the 72px row geometry; neighbors are non-interactive text).
  coinBtn: {
    width: 44,
    height: 44,
    margin: -8,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    touchAction: 'none',
  },
  coin: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: COIN_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    boxShadow: '0 1px 3px var(--color-shadow)',
  },
  jarChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    maxWidth: 84,
    color: 'var(--color-text-secondary)',
  },
  jarChipLabel: {
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  noRoundup: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
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
  ellipsisSpacer: {width: 44, height: 44, flexShrink: 0},
  // loadMoreRow — final 44px row, 16/500 brand, top hairline in-list.
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
  // SEARCH — 52px searchBar in flow below the navBar; 36px muted field.
  searchBar: {
    height: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  searchField: {
    flex: 1,
    minWidth: 0,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 12,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    fontSize: 16,
    color: 'var(--color-text-primary)',
    outline: 'none',
    padding: 0,
  },
  searchClear: {
    width: 44,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  searchCancel: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  recentsHeaderRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingInlineEnd: 16,
  },
  recentsClear: {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    height: 44,
    display: 'flex',
    alignItems: 'center',
  },
  recentRow: {
    display: 'flex',
    alignItems: 'center',
    height: 44,
    paddingInlineStart: 16,
  },
  recentBtn: {
    flex: 1,
    minWidth: 0,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 16,
  },
  resultsCaption: {
    margin: '12px 0 8px',
    paddingInline: 32,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // EMPTY STATE — centered block, 64px icon circle, one action max.
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyIconCircle: {
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
    lineHeight: '18px',
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'grid',
    placeItems: 'center',
  },
  // SKELETON — 72px rows matching the droplet geometry exactly.
  skelRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 72,
    paddingInline: 16,
    overflow: 'hidden',
  },
  skelThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  skelBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  skelShimmer: {position: 'absolute', inset: 0, pointerEvents: 'none'},
  // BOOST — dial card 180px with a 120px dial; velocity readout below.
  dialCard: {
    height: 180,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  dialWrap: {position: 'relative', width: 120, height: 120, flexShrink: 0},
  dialCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  dialReadout: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    textAlign: 'center',
  },
  dialNumeral: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.05,
    fontVariantNumeric: 'tabular-nums',
  },
  // 44×44 invisible detent buttons over the 1x/2x/3x dots.
  detentHit: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
  },
  detentTicks: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  detentTickLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  detentTickLabelOn: {color: BRAND_ACCENT, fontWeight: 600},
  velocityHero: {
    padding: '16px 16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingInline: 16,
  },
  breakdownLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  breakdownTotal: {fontWeight: 600, color: 'var(--color-text-primary)'},
  // UTILITY ROWS (Profile / weekly transfers) — 44px.
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingInline: 16,
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Sweep-day pill — 36px value pill button (datePanel convention).
  sweepPill: {
    height: 36,
    paddingInline: 16,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    fontSize: 16,
    display: 'grid',
    placeItems: 'center',
  },
  weekdayPanel: {
    display: 'flex',
    gap: 4,
    padding: '4px 12px 12px',
    justifyContent: 'space-between',
  },
  weekdayBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
  },
  weekdayBtnOn: {background: BRAND_ACCENT, color: COIN_TEXT},
  // SWITCH — 51×31 track; whole row is the role=switch button. OFF track
  // uses REST_TRACK (amendment: ≥3:1 vs the card it sits on — math at the
  // declaration), not a hairline token.
  switchTrack: {
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    position: 'relative',
  },
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
  signOutRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--color-error)',
  },
  // SHEET — scrim z40 + sheet z41; two detents.
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
  sheetGrabber: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
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
  sheetJarBlock: {display: 'flex', justifyContent: 'center', paddingBlock: 8},
  milestoneRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    height: 44,
    paddingInline: 4,
    fontSize: 16,
  },
  milestoneMeta: {
    marginInlineStart: 'auto',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  projLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  sheetDropletRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 60,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    marginTop: 16,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: COIN_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // ACTION SHEET — insetInline 16, bottom 16, z41 over the z40 scrim.
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
  actionHeader: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  actionRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
  },
  actionCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
  },
  actionDivider: {height: 1, background: 'var(--color-border)'},
  // TOAST DOCK — STICKY-IN-FLOW (amendment): height-0 anchor at bottom 76
  // (64px tabBar + 12) so the toast rides the viewport on tall tabs;
  // shell-absolute would pin to the document bottom. Always mounted for
  // aria-live; z30 below the sheet scrim's z40.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    insetInline: 16,
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
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
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    paddingInline: 16,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // ALERT — z60/61, blocking irreversible choice (Sign out only).
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
  alertText: {
    margin: '8px 0 0',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    lineHeight: '18px',
  },
  alertBtnRow: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtn: {
    flex: 1,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
  },
  alertBtnDivider: {width: 1, background: 'var(--color-border)'},
  // TAB BAR — exactly 64px, 4 tabs flex:1.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    height: 64,
    flexShrink: 0,
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
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // DRAG LAYER — z30 coin clone following the pointer (transform only).
  dragLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 30,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  dragCoin: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_ACCENT,
    color: COIN_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields (cents + label), cross-checked
// aggregates. Ledger (verified by hand): round-ups 62+83+45+29+94+52+35 =
// 400¢ = $4.00 weekly hero at 1x ($8.00 at 2x, $12.00 at 3x). Per-jar
// droplet sums: Japan 62+45+94 = 201¢; Emergency 83+52 = 135¢; Camera
// 29+35 = 64¢; 201+135+64 = 400 ✓. Transfers 3800+2200+1500 = 7500¢;
// Boost total 7500+400 = 7900¢/wk at 1x (8300 at 2x, 8700 at 3x) ✓.
// ---------------------------------------------------------------------------

// The demo's frozen "today": Sat Jul 4, 2026. All projections are ANCHOR +
// computed days — no Date.now() anywhere.
const ANCHOR_DATE = '2026-07-04';
const ANCHOR_UTC = Date.UTC(2026, 6, 4);
const CARD_LAST4 = '4821';

type TabId = 'jars' | 'activity' | 'boost' | 'profile';
type JarId = 'jar_japan' | 'jar_emergency' | 'jar_camera';
type Multiplier = 1 | 2 | 3;

interface Jar {
  id: JarId;
  name: string;
  savedCents: number;
  savedLabel: string;
  goalCents: number;
  goalLabel: string;
  weeklyTransferCents: number;
  weeklyTransferLabel: string;
}

// Percent spot-checks: Japan 78000/120000 = 65%; Emergency 41000/50000 =
// 82% (stress (c): meniscus near the shoulder, all three notches passed);
// Camera 31500/90000 = 35% (stress (d): the Mar 23, 2027 long-horizon
// date must fit the stat stack at 320px).
const JARS: Jar[] = [
  {
    id: 'jar_japan',
    name: 'Japan Trip',
    savedCents: 78000,
    savedLabel: '$780.00',
    goalCents: 120000,
    goalLabel: '$1,200.00',
    weeklyTransferCents: 3800,
    weeklyTransferLabel: '$38.00',
  },
  {
    id: 'jar_emergency',
    name: 'Emergency Cushion',
    savedCents: 41000,
    savedLabel: '$410.00',
    goalCents: 50000,
    goalLabel: '$500.00',
    weeklyTransferCents: 2200,
    weeklyTransferLabel: '$22.00',
  },
  {
    id: 'jar_camera',
    name: 'New Camera',
    savedCents: 31500,
    savedLabel: '$315.00',
    goalCents: 90000,
    goalLabel: '$900.00',
    weeklyTransferCents: 1500,
    weeklyTransferLabel: '$15.00',
  },
];

const JAR_BY_ID: Record<JarId, Jar> = {
  jar_japan: JARS[0],
  jar_emergency: JARS[1],
  jar_camera: JARS[2],
};

interface Txn {
  id: string;
  merchant: string;
  dateLabel: string;
  amountCents: number;
  amountLabel: string;
  // roundup = next whole dollar − amount; stated AND derivable:
  // ceil(amountCents/100)·100 − amountCents.
  roundupCents: number;
  roundupLabel: string;
  jarId: JarId; // initial assignment (the live map lives in state)
}

// 8 transactions, newest first, all this week (Sun Jun 28 – Sat Jul 4).
// txn7's merchant is the 320px single-line ellipsis stress (a); txn8 is
// the whole-dollar no-coin stress (b).
const TXNS: Txn[] = [
  {id: 'txn1', merchant: 'Blue Bottle Coffee', dateLabel: 'Jul 4', amountCents: 438, amountLabel: '$4.38', roundupCents: 62, roundupLabel: '$0.62', jarId: 'jar_japan'},
  {id: 'txn2', merchant: "Trader Joe's", dateLabel: 'Jul 3', amountCents: 2317, amountLabel: '$23.17', roundupCents: 83, roundupLabel: '$0.83', jarId: 'jar_emergency'},
  {id: 'txn3', merchant: 'Lyft', dateLabel: 'Jul 3', amountCents: 1255, amountLabel: '$12.55', roundupCents: 45, roundupLabel: '$0.45', jarId: 'jar_japan'},
  {id: 'txn4', merchant: 'Bergen Bagels', dateLabel: 'Jul 2', amountCents: 671, amountLabel: '$6.71', roundupCents: 29, roundupLabel: '$0.29', jarId: 'jar_camera'},
  {id: 'txn5', merchant: 'Greenlight Bookshop', dateLabel: 'Jul 1', amountCents: 1806, amountLabel: '$18.06', roundupCents: 94, roundupLabel: '$0.94', jarId: 'jar_japan'},
  {id: 'txn6', merchant: 'Walgreens', dateLabel: 'Jun 30', amountCents: 948, amountLabel: '$9.48', roundupCents: 52, roundupLabel: '$0.52', jarId: 'jar_emergency'},
  {id: 'txn7', merchant: 'Grand Army Farmers Market', dateLabel: 'Jun 29', amountCents: 1465, amountLabel: '$14.65', roundupCents: 35, roundupLabel: '$0.35', jarId: 'jar_camera'},
  {id: 'txn8', merchant: 'MTA Transit Pass', dateLabel: 'Jun 28', amountCents: 3000, amountLabel: '$30.00', roundupCents: 0, roundupLabel: '$0.00', jarId: 'jar_japan'},
];

const TXN_BY_ID: Record<string, Txn> = Object.fromEntries(TXNS.map(txn => [txn.id, txn]));
const INITIAL_ASSIGNMENTS: Record<string, JarId> = Object.fromEntries(
  TXNS.filter(txn => txn.roundupCents > 0).map(txn => [txn.id, txn.jarId]),
);

const FULL_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const TABS: Array<{id: TabId; label: string}> = [
  {id: 'jars', label: 'Jars'},
  {id: 'activity', label: 'Activity'},
  {id: 'boost', label: 'Boost'},
  {id: 'profile', label: 'Profile'},
];

// Skeleton bar widths — deterministic staggered pattern, never random.
const SKEL_WIDTHS: Array<[string, string]> = [
  ['60%', '40%'],
  ['45%', '55%'],
  ['70%', '30%'],
  ['60%', '55%'],
];

// ---------------------------------------------------------------------------
// FORMATTERS + PROJECTION MATH — pure, deterministic.
// ---------------------------------------------------------------------------

/** Cents → '$4.38' (thousands comma for the jar goals). */
function fmtUsd(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const withComma = dollars.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  return \`\${sign}$\${withComma}.\${String(abs % 100).padStart(2, '0')}\`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** ANCHOR + days → 'Sep 16, 2026' (UTC arithmetic — no DST drift). */
function addDaysLabel(days: number): string {
  const d = new Date(ANCHOR_UTC + days * 86400000);
  return \`\${MONTHS[d.getUTCMonth()]} \${d.getUTCDate()}, \${d.getUTCFullYear()}\`;
}

/**
 * Projection law — days = ceil(remaining·7 / velocity); velocity =
 * weeklyTransfer + assignedDropletSum × multiplier (all cents). Spot
 * checks at 1x from the fixture ledger: Japan rem 42000, vel 3800+201 =
 * 4001 → ceil(294000/4001) = 74d → Sep 16, 2026; Emergency rem 9000, vel
 * 2335 → 27d → Jul 31, 2026; Camera rem 58500, vel 1564 → 262d → Mar 23,
 * 2027. At 2x: 70d → Sep 12 / 26d → Jul 30 / 252d → Mar 13, 2027.
 * Signature drag (txn5 $0.94 Japan→Camera at 1x): Japan vel 3907 → 76d →
 * Sep 18 (+2 later); Camera vel 1658 → 247d → Mar 8, 2027 (15 earlier).
 */
function projectionDays(remainingCents: number, velocityCents: number): number {
  return Math.ceil((remainingCents * 7) / velocityCents);
}

interface JarDerived {
  jar: Jar;
  savedCents: number; // fixture saved + one-time boosts
  pct: number; // 0-100, rounded for display
  fillRatio: number; // 0-1 for the meniscus
  pendingCents: number; // assigned droplet sum × multiplier
  velocityCents: number;
  projLabel: string; // 'Est. Sep 16, 2026' | 'Funded'
  projDays: number;
}

function deriveJar(
  jar: Jar,
  assignments: Record<string, JarId>,
  boosts: Record<JarId, number>,
  multiplier: Multiplier,
): JarDerived {
  let assignedBase = 0;
  for (const [txnId, jarId] of Object.entries(assignments)) {
    if (jarId === jar.id) assignedBase += TXN_BY_ID[txnId].roundupCents;
  }
  const pendingCents = assignedBase * multiplier;
  const savedCents = jar.savedCents + boosts[jar.id];
  const remainingCents = jar.goalCents - savedCents;
  const velocityCents = jar.weeklyTransferCents + pendingCents;
  const funded = remainingCents <= 0;
  const projDays = funded ? 0 : projectionDays(remainingCents, velocityCents);
  return {
    jar,
    savedCents,
    pct: Math.min(100, Math.round((savedCents / jar.goalCents) * 100)),
    fillRatio: Math.min(1, savedCents / jar.goalCents),
    pendingCents,
    velocityCents,
    projLabel: funded ? 'Funded' : \`Est. \${addDaysLabel(projDays)}\`,
    projDays,
  };
}

// ---------------------------------------------------------------------------
// STATE — ONE owner (roundupStore): a flat state record + one
// update(patch). Jar gauges, projection dates, the weekly hero, coin
// labels, and the VelocityReadout are ALL selectors over assignments +
// multiplier — one map, five surfaces. Transient pointer deltas (dial
// drag angle) are the only child-held state.
// ---------------------------------------------------------------------------

interface ToastState {
  seq: number;
  msg: string;
  // Undo restores this exact snapshot (assignments + boosts) in one write.
  undo: {assignments: Record<string, JarId>; boosts: Record<JarId, number>} | null;
}

interface DragState {
  txnId: string;
  x: number; // pointer position relative to shell
  y: number;
  originX: number; // coin center at drag start (spring-back target)
  originY: number;
  overJar: JarId | null;
  releasing: boolean;
}

interface RoundupState {
  tab: TabId;
  // Reserved push-stack slots — every tab in this fixture is a root-only
  // surface (the jar detail is a SHEET, not a push), so these stay 'root';
  // per-tab scroll lives in a ref beside this record.
  screenByTab: Record<TabId, 'root'>;
  multiplier: Multiplier;
  assignments: Record<string, JarId>;
  boosts: Record<JarId, number>;
  dropletsShown: 3 | 8;
  sheet: {jarId: JarId; detent: 'medium' | 'large'} | null;
  actionSheetFor: string | null;
  alertOpen: boolean;
  drag: DragState | null;
  toast: ToastState | null;
  search: {focused: boolean; query: string; recents: string[]};
  activitySkeleton: boolean;
  jarsUpdated: boolean; // 'Updated just now' caption (fixed string)
  // Projection-flash seqs per jar: dir 'earlier' → brand wash, 'later' →
  // error wash; keyed spans restart the CSS animation (no JS timers).
  flashes: Partial<Record<JarId, {seq: number; dir: 'earlier' | 'later'}>>;
  sweepDay: string;
  sweepPickerOpen: boolean;
  notifications: boolean;
}

const INITIAL_STATE: RoundupState = {
  tab: 'jars',
  screenByTab: {jars: 'root', activity: 'root', boost: 'root', profile: 'root'},
  multiplier: 1,
  assignments: INITIAL_ASSIGNMENTS,
  boosts: {jar_japan: 0, jar_emergency: 0, jar_camera: 0},
  dropletsShown: 3,
  sheet: null,
  actionSheetFor: null,
  alertOpen: false,
  drag: null,
  toast: null,
  search: {focused: false, query: '', recents: ['coffee', 'lyft']},
  activitySkeleton: false,
  jarsUpdated: false,
  flashes: {},
  sweepDay: 'Sunday',
  sweepPickerOpen: false,
  notifications: true,
};

function useRoundupStore() {
  const [state, setState] = useState<RoundupState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<RoundupState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);
  const updateFn = useCallback((fn: (prev: RoundupState) => Partial<RoundupState>) => {
    setState(prev => ({...prev, ...fn(prev)}));
  }, []);
  return {state, update, updateFn};
}

/** Container-width hook (grid-feeder-console pattern). */
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
// FOCUS UTILITIES — overlays trap Tab; Escape closes the topmost only;
// focus restores to the opener on every close path.
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
// TIDEJAR MARK — inline SVG brand mark: jar outline in
// --color-text-primary strokes (there is no --color-text token), BRAND
// wave meniscus line, one coin circle mid-drop above the wave.
// ---------------------------------------------------------------------------

function TidejarMark({size}: {size: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      {/* Jar: lip + rounded-shoulder body. */}
      <path d="M9 4.5h10" stroke="var(--color-text-primary)" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M10 4.5v2.4c-2.8 1-4.6 3.1-4.6 6v8.1a4.5 4.5 0 0 0 4.5 4.5h8.2a4.5 4.5 0 0 0 4.5-4.5v-8.1c0-2.9-1.8-5-4.6-6V4.5"
        stroke="var(--color-text-primary)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Wave meniscus line (brand, 2px). */}
      <path d="M6.5 17.5q3.7-3 7.5 0t7.5 0" stroke={BRAND_ACCENT} strokeWidth="2" strokeLinecap="round" />
      {/* One coin mid-drop above the wave. */}
      <circle cx="14" cy="11" r="2" fill={BRAND_ACCENT} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// JAR SVG — 88×120 viewBox (the sheet renders 120×164, same 0.733 aspect).
// Interior fill is a wave-crest path CLIPPED to the jar interior and
// TRANSLATED (transform-only animation, 300ms, instant under reduced
// motion) so the 6px-amplitude crest never distorts. Milestone notches at
// 25/50/75% sit on the jar wall outside the fill: passed = BRAND 2px on
// the card bg (#0F766E on #FFF 5.7:1 ✓), future = REST_TRACK (≥3:1
// amendment pair). A 10px coin hangs 8px above the meniscus while pending
// droplets > $0.
// ---------------------------------------------------------------------------

// Interior geometry: x 16→72, bottom y=110, usable height 82 (y 28→110).
const JAR_INNER_TOP = 28;
const JAR_INNER_BOTTOM = 110;
const JAR_INNER_H = JAR_INNER_BOTTOM - JAR_INNER_TOP; // 82

interface JarSvgProps {
  width: number;
  height: number;
  fillRatio: number; // 0-1
  pct: number; // rounded display percent for milestone pass tests
  hasPending: boolean;
  clipId: string; // unique per render site
}

function JarSvg({width, height, fillRatio, pct, hasPending, clipId}: JarSvgProps) {
  const fillH = JAR_INNER_H * fillRatio;
  const meniscusY = JAR_INNER_BOTTOM - fillH;
  return (
    <svg width={width} height={height} viewBox="0 0 88 120" fill="none" aria-hidden style={{flexShrink: 0}}>
      <defs>
        <clipPath id={clipId}>
          {/* Interior — slightly inside the 1.5px wall stroke. */}
          <path d="M20 14h48v6c8.5 3 12 9.5 12 18v62a10 10 0 0 1-10 10H18a10 10 0 0 1-10-10V38c0-8.5 3.5-15 12-18v-6z" />
        </clipPath>
      </defs>
      {/* Meniscus fill — wave path drawn at y=0 crest, translated to the
          fill line; translateY animates via .tjr-anim (transform only). */}
      <g clipPath={\`url(#\${clipId})\`}>
        <g className="tjr-anim" style={{transform: \`translateY(\${meniscusY - 6}px)\`}}>
          <path d="M4 6 Q 24 -3 44 6 T 84 6 L 84 130 L 4 130 Z" fill={BRAND_ACCENT} opacity={0.85} />
        </g>
      </g>
      {/* Pending-droplet coin suspended 8px above the meniscus. */}
      {hasPending ? (
        <circle className="tjr-anim" cx={44} cy={meniscusY - 13} r={5} fill={BRAND_ACCENT} />
      ) : null}
      {/* Jar outline — lip + rounded-shoulder body, 1.5px primary stroke. */}
      <path d="M26 8h36" stroke="var(--color-text-primary)" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M28 8v10c-9 3-13 10-13 19v63a11 11 0 0 0 11 11h36a11 11 0 0 0 11-11V37c0-9-4-16-13-19V8"
        stroke="var(--color-text-primary)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Milestone notches at 25/50/75% on the left wall. */}
      {[25, 50, 75].map(q => {
        const y = JAR_INNER_BOTTOM - (JAR_INNER_H * q) / 100;
        const passed = pct >= q;
        return (
          <line
            key={q}
            x1={15}
            y1={y}
            x2={passed ? 23 : 21}
            y2={y}
            stroke={passed ? BRAND_ACCENT : REST_TRACK}
            strokeWidth={passed ? 2 : 1}
          />
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DIAL GEOMETRY — 120px dial, 270° sweep, 0° at 12 o'clock, clockwise
// positive: 1x at −135°, 2x at 0°, 3x at +135°.
// ---------------------------------------------------------------------------

const DIAL_C = 60;
const DIAL_R = 46;
const DETENT_DEG: Record<Multiplier, number> = {1: -135, 2: 0, 3: 135};

function dialPolar(deg: number, r: number = DIAL_R): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: DIAL_C + r * Math.sin(rad), y: DIAL_C - r * Math.cos(rad)};
}

function dialArc(fromDeg: number, toDeg: number): string {
  const from = dialPolar(fromDeg);
  const to = dialPolar(toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return \`M \${from.x.toFixed(2)} \${from.y.toFixed(2)} A \${DIAL_R} \${DIAL_R} 0 \${large} 1 \${to.x.toFixed(2)} \${to.y.toFixed(2)}\`;
}

// ---------------------------------------------------------------------------
// MULTIPLIER DIAL — role=slider (aria-valuetext '2x'), ArrowLeft/Right
// step detents, three 44×44 detent buttons are Tab-reachable, pointer
// drag rotates the knob and snaps to the nearest detent on release. On
// detent: ONE {multiplier} store write.
// ---------------------------------------------------------------------------

interface MultiplierDialProps {
  multiplier: Multiplier;
  onSet: (next: Multiplier) => void;
  reducedMotion: boolean;
}

function MultiplierDial({multiplier, onSet, reducedMotion}: MultiplierDialProps) {
  // Transient pointer-drag angle only — the committed value lives in the
  // single store (rerender-use-ref-transient-values would also work, but
  // the knob must re-render while dragging).
  const [dragDeg, setDragDeg] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const degFromPointer = (event: ReactPointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect == null) return null;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return Math.max(-135, Math.min(135, deg));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const deg = degFromPointer(event);
    if (deg != null) setDragDeg(deg);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragDeg == null) return;
    const deg = degFromPointer(event);
    if (deg != null) setDragDeg(deg);
  };
  const onPointerUp = () => {
    if (dragDeg == null) return;
    const detent = (Math.round((dragDeg + 135) / 135) + 1) as Multiplier;
    setDragDeg(null);
    onSet(Math.max(1, Math.min(3, detent)) as Multiplier);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: Multiplier | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(1, multiplier - 1) as Multiplier;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(3, multiplier + 1) as Multiplier;
    else if (event.key === 'Home') next = 1;
    else if (event.key === 'End') next = 3;
    if (next != null) {
      event.preventDefault();
      if (next !== multiplier) onSet(next);
    }
  };

  const knobDeg = dragDeg ?? DETENT_DEG[multiplier];
  const knobPos = dialPolar(knobDeg);
  const progressTo = Math.max(knobDeg, -134.9);

  return (
    <div
      ref={wrapRef}
      style={styles.dialWrap}
      role="slider"
      tabIndex={0}
      className="tjr-focusable"
      aria-label="Round-up multiplier"
      aria-valuemin={1}
      aria-valuemax={3}
      aria-valuenow={multiplier}
      aria-valuetext={\`\${multiplier}x\`}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setDragDeg(null)}>
      <svg width={120} height={120} viewBox="0 0 120 120" fill="none" aria-hidden style={{touchAction: 'none'}}>
        {/* Track arc — REST_TRACK (≥3:1 amendment pair), not muted. */}
        <path d={dialArc(-135, 135)} stroke={REST_TRACK} strokeWidth={10} strokeLinecap="round" opacity={0.55} />
        <path
          d={dialArc(-135, progressTo)}
          stroke={BRAND_ACCENT}
          strokeWidth={10}
          strokeLinecap="round"
          className={reducedMotion ? undefined : 'tjr-fade'}
        />
        {/* Detent dots at 1x/2x/3x. */}
        {([1, 2, 3] as Multiplier[]).map(detent => {
          const p = dialPolar(DETENT_DEG[detent]);
          const on = detent <= multiplier;
          return <circle key={detent} cx={p.x} cy={p.y} r={3.5} fill={on ? COIN_TEXT : 'var(--color-background-card)'} stroke={on ? BRAND_ACCENT : REST_TRACK} strokeWidth={1.5} />;
        })}
        {/* 16px knob at the current (or dragged) angle. */}
        <circle cx={knobPos.x} cy={knobPos.y} r={8} fill="var(--color-background-card)" stroke={BRAND_ACCENT} strokeWidth={3} className={dragDeg == null && !reducedMotion ? 'tjr-anim' : undefined} />
      </svg>
      <div style={styles.dialCenter}>
        <div style={styles.dialReadout}>
          <span style={styles.dialNumeral}>{multiplier}x</span>
          <span style={styles.overline}>round-up multiplier</span>
        </div>
      </div>
      {/* 44×44 invisible detent buttons (Tab-reachable button path). */}
      {([1, 2, 3] as Multiplier[]).map(detent => {
        const p = dialPolar(DETENT_DEG[detent]);
        return (
          <button
            key={detent}
            type="button"
            className="tjr-btn tjr-focusable"
            style={{...styles.detentHit, left: p.x - 22, top: p.y - 22}}
            aria-label={\`Set \${detent}x multiplier\`}
            aria-pressed={multiplier === detent}
            onClick={() => onSet(detent)}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DROPLET TXN ROW — 72px media row. Sibling buttons, never nested:
// [main row button: tile + merchant stack] [84px trailing column with the
// draggable coin (44×44 hit)] [44×44 ellipsis — the mandatory non-gesture
// path]. Whole-dollar rows (txn8) render 'No round-up' in the coin slot.
// ---------------------------------------------------------------------------

/** Search-result emphasis: matched substring at weight 600 (weight, not
 * color). */
function HighlightedText({text, query}: {text: string; query: string}) {
  const idx = query === '' ? -1 : text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{fontWeight: 600}}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

interface DropletTxnRowProps {
  txn: Txn;
  destJar: Jar | null; // null when no round-up
  multiplier: Multiplier;
  showTail: boolean; // routing tail hides below 360px (garnish)
  highlight?: string;
  onRowTap: (txnId: string, opener: HTMLElement) => void;
  onEllipsis: (txnId: string, opener: HTMLElement) => void;
  onCoinDown: (txnId: string, event: ReactPointerEvent<HTMLButtonElement>) => void;
  rowRef?: (el: HTMLButtonElement | null) => void;
}

function DropletTxnRow({txn, destJar, multiplier, showTail, highlight, onRowTap, onEllipsis, onCoinDown, rowRef}: DropletTxnRowProps) {
  const coinLabel = fmtUsd(txn.roundupCents * multiplier);
  const hasCoin = txn.roundupCents > 0 && destJar != null;
  return (
    <div style={styles.dropletRow}>
      {hasCoin ? (
        <button
          type="button"
          ref={rowRef}
          className="tjr-btn tjr-focusable"
          style={styles.dropletMainBtn}
          aria-label={\`\${txn.merchant}, \${txn.amountLabel} — send \${coinLabel} round-up\`}
          onClick={event => onRowTap(txn.id, event.currentTarget)}>
          <span style={styles.merchTile} aria-hidden>
            {txn.merchant.charAt(0)}
          </span>
          <span style={styles.dropletText}>
            <span style={styles.dropletPrimary}>
              <HighlightedText text={txn.merchant} query={highlight ?? ''} />
            </span>
            <span style={styles.dropletSecondary}>
              {txn.dateLabel} · Visa ····{CARD_LAST4}
            </span>
          </span>
        </button>
      ) : (
        <div style={styles.dropletMainBtn}>
          <span style={styles.merchTile} aria-hidden>
            {txn.merchant.charAt(0)}
          </span>
          <span style={styles.dropletText}>
            <span style={styles.dropletPrimary}>
              <HighlightedText text={txn.merchant} query={highlight ?? ''} />
            </span>
            <span style={styles.dropletSecondary}>
              {txn.dateLabel} · Visa ····{CARD_LAST4}
            </span>
          </span>
        </div>
      )}
      <div style={styles.trailingCol}>
        <span style={styles.purchaseAmt}>{txn.amountLabel}</span>
        {hasCoin ? (
          <>
            <span style={styles.coinRow}>
              {showTail ? (
                // Dotted routing tail — 2px REST_TRACK dots angling toward
                // the jar chip below (pure garnish; hidden < 360px).
                <svg width={14} height={10} viewBox="0 0 14 10" aria-hidden style={{marginRight: 2}}>
                  <circle cx={2} cy={8} r={1} fill={REST_TRACK} />
                  <circle cx={6.5} cy={5} r={1} fill={REST_TRACK} />
                  <circle cx={11} cy={2} r={1} fill={REST_TRACK} />
                </svg>
              ) : null}
              <button
                type="button"
                className="tjr-btn tjr-focusable"
                style={styles.coinBtn}
                aria-label={\`Drag \${coinLabel} round-up from \${txn.merchant} — or open Send to\`}
                onClick={event => onEllipsis(txn.id, event.currentTarget)}
                onPointerDown={event => onCoinDown(txn.id, event)}>
                {/* Coin label contrast: #FFF on #0F766E 5.7:1 (light);
                    #134E4A on #5EEAD4 ≈ 8:1 (dark). */}
                <span style={styles.coin}>{coinLabel}</span>
              </button>
            </span>
            <span style={styles.jarChip}>
              <TidejarMark size={12} />
              <span style={styles.jarChipLabel}>{destJar.name}</span>
            </span>
          </>
        ) : (
          <span style={styles.noRoundup}>No round-up</span>
        )}
      </div>
      {hasCoin ? (
        <button
          type="button"
          className="tjr-btn tjr-focusable"
          style={styles.ellipsisBtn}
          aria-label={\`Send \${txn.merchant} round-up to a jar\`}
          onClick={event => onEllipsis(txn.id, event.currentTarget)}>
          <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
        </button>
      ) : (
        <span style={styles.ellipsisSpacer} aria-hidden />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// JAR GAUGE CARD — 168px full-card button; drop ring while a dragged coin
// hovers; keyed flash span behind the projection label on date changes.
// ---------------------------------------------------------------------------

interface JarGaugeCardProps {
  derived: JarDerived;
  dropActive: boolean;
  flash: {seq: number; dir: 'earlier' | 'later'} | undefined;
  onOpen: (jarId: JarId, opener: HTMLElement) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}

function JarGaugeCard({derived, dropActive, flash, onOpen, cardRef}: JarGaugeCardProps) {
  const {jar, pct, fillRatio, pendingCents, projLabel} = derived;
  return (
    <button
      type="button"
      ref={cardRef}
      className="tjr-btn tjr-focusable"
      style={styles.jarCard}
      aria-label={\`\${jar.name}, \${fmtUsd(derived.savedCents)} of \${jar.goalLabel}, \${pct} percent, \${projLabel}\`}
      onClick={event => onOpen(jar.id, event.currentTarget)}>
      <JarSvg width={88} height={120} fillRatio={fillRatio} pct={pct} hasPending={pendingCents > 0} clipId={\`tjr-clip-\${jar.id}\`} />
      <span style={styles.jarStats}>
        <span style={styles.jarName}>{jar.name}</span>
        <span style={styles.jarAmounts}>
          {fmtUsd(derived.savedCents)} of {jar.goalLabel}
        </span>
        <span style={styles.jarPct}>{pct}%</span>
        <span style={styles.jarProj}>
          {flash != null ? (
            <span
              key={flash.seq}
              className={flash.dir === 'earlier' ? 'tjr-flash-earlier' : 'tjr-flash-later'}
              style={{position: 'absolute', inset: 0, borderRadius: 6}}
              aria-hidden
            />
          ) : null}
          <span style={{position: 'relative'}}>{projLabel}</span>
        </span>
      </span>
      {dropActive ? <span style={styles.dropRing} aria-hidden /> : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Tidejar Round-Up Goals.
// ---------------------------------------------------------------------------

const JAR_IDS: JarId[] = ['jar_japan', 'jar_emergency', 'jar_camera'];

export default function MobileRoundupGoalsTemplate() {
  const {state, update, updateFn} = useRoundupStore();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(wrapRef);
  // Viewport query is only the first-frame fallback; container width wins.
  const viewportWide = useMediaQuery('(min-width: 720px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const effectiveWidth = containerWidth > 0 ? containerWidth : viewportWide ? 1045 : 390;
  const isDesktop = effectiveWidth >= 720;
  const showTail = effectiveWidth >= 360; // routing-tail garnish threshold

  // ---- refs -------------------------------------------------------------
  const seqRef = useRef(0);
  const scrollByTabRef = useRef<Partial<Record<TabId, number>>>({});
  const jarCardRefs = useRef<Partial<Record<JarId, HTMLButtonElement | null>>>({});
  const rowBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabBtnRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const alertCancelRef = useRef<HTMLButtonElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const actionOpenerRef = useRef<HTMLElement | null>(null);
  const alertOpenerRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const pendingFocusTxnRef = useRef<string | null>(null);
  const suppressCoinClickRef = useRef(false);
  const lastCountAnnouncedRef = useRef<number | null>(null);
  const dragSessionRef = useRef<{
    txnId: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    started: boolean;
    cleanup: () => void;
  } | null>(null);

  // Large-title collapse — transient view state driven by the sentinel IO.
  const [largeTitleVisible, setLargeTitleVisible] = useState(true);

  // ---- selectors: ONE map (assignments) + ONE multiplier, five surfaces --
  const derivedJars = JAR_IDS.map(id => deriveJar(JAR_BY_ID[id], state.assignments, state.boosts, state.multiplier));
  const derivedById: Record<JarId, JarDerived> = {
    jar_japan: derivedJars[0],
    jar_emergency: derivedJars[1],
    jar_camera: derivedJars[2],
  };
  // Weekly hero — derives live: 62+83+45+29+94+52+35 = 400¢ × multiplier.
  const pendingBaseCents = Object.keys(state.assignments).reduce(
    (sum, txnId) => sum + TXN_BY_ID[txnId].roundupCents,
    0,
  );
  const heroLabel = fmtUsd(pendingBaseCents * state.multiplier);
  const transfersCents = JARS.reduce((sum, jar) => sum + jar.weeklyTransferCents, 0); // 7500
  const boostTotalCents = transfersCents + pendingBaseCents * state.multiplier;

  const searchQuery = state.search.query.trim();
  const searchResults =
    searchQuery === ''
      ? TXNS
      : TXNS.filter(txn => txn.merchant.toLowerCase().includes(searchQuery.toLowerCase()));

  // ---- announcer ---------------------------------------------------------
  const announce = useCallback(
    (msg: string, undo: ToastState['undo'] = null) => {
      seqRef.current += 1;
      update({toast: {seq: seqRef.current, msg, undo}});
    },
    [update],
  );

  // ---- scroller plumbing (per-tab persistence law) ------------------------
  const getScroller = useCallback((): HTMLElement | null => {
    let el: HTMLElement | null = shellRef.current?.parentElement ?? null;
    while (el != null) {
      const css = window.getComputedStyle(el);
      if ((css.overflowY === 'auto' || css.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return document.scrollingElement as HTMLElement | null;
  }, []);

  const switchTab = useCallback(
    (next: TabId) => {
      const scroller = getScroller();
      if (next === state.tab) {
        // The one legal reset: re-tapping the active tab pops to root and
        // scrolls to top (all tabs are root-only here).
        scroller?.scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'});
        return;
      }
      if (scroller != null) {
        scrollByTabRef.current[state.tab] = scroller.scrollTop;
      }
      // Overlays close on tab switch; toast + search + sweep state persist.
      update({tab: next, sheet: null, actionSheetFor: null, alertOpen: false, drag: null});
    },
    [getScroller, reducedMotion, state.tab, update],
  );

  useEffect(() => {
    const scroller = getScroller();
    if (scroller != null) {
      scroller.scrollTop = scrollByTabRef.current[state.tab] ?? 0;
    }
  }, [getScroller, state.tab]);

  const onTabKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const idx = TABS.findIndex(tab => tab.id === state.tab);
      const nextIdx =
        event.key === 'ArrowLeft' ? (idx + TABS.length - 1) % TABS.length : (idx + 1) % TABS.length;
      const nextId = TABS[nextIdx].id;
      switchTab(nextId);
      tabBtnRefs.current[nextId]?.focus();
    },
    [state.tab, switchTab],
  );

  // ---- large-title collapse (IntersectionObserver sentinel) --------------
  useEffect(() => {
    if (state.tab !== 'jars') return undefined;
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(entries => {
      setLargeTitleVisible(entries[0]?.isIntersecting ?? true);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [state.tab]);

  // ---- THE write: move a round-up (drag drop AND action sheet share it) --
  const moveRoundup = useCallback(
    (txnId: string, jarId: JarId) => {
      seqRef.current += 2;
      const toastSeq = seqRef.current;
      updateFn(prev => {
        const from = prev.assignments[txnId];
        if (from === jarId) {
          return {actionSheetFor: null};
        }
        // Saved amounts don't move — only projections: source date slips
        // later (error flash), target pulls earlier (brand flash).
        return {
          assignments: {...prev.assignments, [txnId]: jarId},
          actionSheetFor: null,
          toast: {
            seq: toastSeq,
            msg: \`Round-up moved to \${JAR_BY_ID[jarId].name}\`,
            undo: {assignments: prev.assignments, boosts: prev.boosts},
          },
          flashes: {
            ...prev.flashes,
            [from]: {seq: toastSeq - 1, dir: 'later' as const},
            [jarId]: {seq: toastSeq, dir: 'earlier' as const},
          },
        };
      });
    },
    [updateFn],
  );

  const undoToast = useCallback(() => {
    seqRef.current += 1;
    const toastSeq = seqRef.current;
    updateFn(prev => {
      if (prev.toast?.undo == null) return {};
      return {
        assignments: prev.toast.undo.assignments,
        boosts: prev.toast.undo.boosts,
        toast: {seq: toastSeq, msg: 'Restored', undo: null},
        flashes: {},
      };
    });
  }, [updateFn]);

  const setMultiplier = useCallback(
    (next: Multiplier) => {
      update({multiplier: next});
      announce(\`Multiplier set to \${next}x\`);
    },
    [announce, update],
  );

  // ---- overlays -----------------------------------------------------------
  const openJarSheet = useCallback(
    (jarId: JarId, opener: HTMLElement) => {
      sheetOpenerRef.current = opener;
      update({sheet: {jarId, detent: 'medium'}});
    },
    [update],
  );
  const closeSheet = useCallback(() => {
    update({sheet: null});
    sheetOpenerRef.current?.focus({preventScroll: true});
  }, [update]);

  const openActionSheet = useCallback(
    (txnId: string, opener: HTMLElement) => {
      if (suppressCoinClickRef.current) {
        suppressCoinClickRef.current = false;
        return;
      }
      actionOpenerRef.current = opener;
      update({actionSheetFor: txnId});
    },
    [update],
  );
  const closeActionSheet = useCallback(() => {
    update({actionSheetFor: null});
    actionOpenerRef.current?.focus({preventScroll: true});
  }, [update]);

  // NEVER stack sheets: 'Send to…' inside the jar sheet closes the sheet
  // first, then opens the action sheet next frame.
  const sendFromSheet = useCallback(
    (txnId: string) => {
      update({sheet: null});
      requestAnimationFrame(() => {
        actionOpenerRef.current = sheetOpenerRef.current;
        update({actionSheetFor: txnId});
      });
    },
    [update],
  );

  const openAlert = useCallback(
    (opener: HTMLElement) => {
      alertOpenerRef.current = opener;
      update({alertOpen: true});
    },
    [update],
  );
  const closeAlert = useCallback(() => {
    update({alertOpen: false});
    alertOpenerRef.current?.focus({preventScroll: true});
  }, [update]);

  // Focus enters overlays via focus({preventScroll: true}) — a plain
  // .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen (amendment).
  const sheetIsOpen = state.sheet != null;
  useEffect(() => {
    if (sheetIsOpen) {
      sheetRef.current?.focus({preventScroll: true});
    }
  }, [sheetIsOpen]);
  useEffect(() => {
    if (state.actionSheetFor != null) {
      actionCancelRef.current?.focus({preventScroll: true});
    }
  }, [state.actionSheetFor]);
  useEffect(() => {
    if (state.alertOpen) {
      alertCancelRef.current?.focus({preventScroll: true});
    }
  }, [state.alertOpen]);

  // ESCAPE LADDER — topmost overlay only: alert z61 > action sheet /
  // sheet z41. The search field handles its own Escape (typing target).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const target = event.target as HTMLElement | null;
      if (target != null && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (state.alertOpen) {
        event.preventDefault();
        closeAlert();
      } else if (state.actionSheetFor != null) {
        event.preventDefault();
        closeActionSheet();
      } else if (state.sheet != null) {
        event.preventDefault();
        closeSheet();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeActionSheet, closeAlert, closeSheet, state.actionSheetFor, state.alertOpen, state.sheet]);

  // ---- coin drag (gesture; the row ellipsis is the button path) ----------
  const onCoinDown = useCallback(
    (txnId: string, event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      const shellRect = shellRef.current?.getBoundingClientRect();
      if (shellRect == null) return;
      const coinRect = event.currentTarget.getBoundingClientRect();
      const originX = coinRect.left + coinRect.width / 2 - shellRect.left;
      const originY = coinRect.top + coinRect.height / 2 - shellRect.top;
      const startX = event.clientX;
      const startY = event.clientY;

      const hitJar = (clientX: number, clientY: number): JarId | null => {
        for (const jarId of JAR_IDS) {
          const el = jarCardRefs.current[jarId];
          if (el == null) continue;
          const r = el.getBoundingClientRect();
          if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
            return jarId;
          }
        }
        return null;
      };

      const onMove = (ev: PointerEvent) => {
        const session = dragSessionRef.current;
        if (session == null) return;
        if (!session.started) {
          // 8px slop before the drag arms.
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return;
          session.started = true;
          suppressCoinClickRef.current = true;
        }
        const rect = shellRef.current?.getBoundingClientRect();
        if (rect == null) return;
        update({
          drag: {
            txnId: session.txnId,
            x: ev.clientX - rect.left,
            y: ev.clientY - rect.top,
            originX: session.originX,
            originY: session.originY,
            overJar: hitJar(ev.clientX, ev.clientY),
            releasing: false,
          },
        });
      };

      const onUp = (ev: PointerEvent) => {
        const session = dragSessionRef.current;
        dragSessionRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        if (session == null || !session.started) return; // plain tap → click opens the action sheet
        const overJar = hitJar(ev.clientX, ev.clientY);
        if (overJar != null) {
          update({drag: null});
          moveRoundup(session.txnId, overJar);
        } else if (reducedMotion) {
          update({drag: null});
        } else {
          // Spring back 200ms to the coin's origin, then clear.
          updateFn(prev =>
            prev.drag == null
              ? {}
              : {drag: {...prev.drag, x: session.originX, y: session.originY, overJar: null, releasing: true}},
          );
        }
      };

      dragSessionRef.current = {
        txnId,
        startX,
        startY,
        originX,
        originY,
        started: false,
        cleanup: () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onUp);
        },
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [moveRoundup, reducedMotion, update, updateFn],
  );
  // Drag listeners never outlive the page.
  useEffect(() => () => dragSessionRef.current?.cleanup(), []);

  // ---- jars: load more ----------------------------------------------------
  const showMoreDroplets = useCallback(() => {
    pendingFocusTxnRef.current = TXNS[3].id;
    update({dropletsShown: 8});
    announce('5 more loaded');
  }, [announce, update]);
  useEffect(() => {
    if (state.dropletsShown === 8 && pendingFocusTxnRef.current != null) {
      rowBtnRefs.current[pendingFocusTxnRef.current]?.focus({preventScroll: true});
      pendingFocusTxnRef.current = null;
    }
  }, [state.dropletsShown]);

  // ---- refresh (explicit button; pull-to-refresh is banned) ---------------
  const onRefresh = useCallback(() => {
    if (state.tab === 'jars') {
      update({jarsUpdated: true}); // fixed 'Updated just now' caption, role=status
    } else if (state.tab === 'activity' && !state.activitySkeleton) {
      update({activitySkeleton: true});
      announce('Loading'); // announced ONCE via the one polite region
    }
  }, [announce, state.activitySkeleton, state.tab, update]);

  // Skeletons resolve on the NEXT user action (any tap) — never a timer.
  const onShellPointerDownCapture = useCallback(() => {
    if (state.activitySkeleton) {
      update({activitySkeleton: false});
    }
  }, [state.activitySkeleton, update]);

  // ---- search -------------------------------------------------------------
  const setSearch = useCallback(
    (patch: Partial<RoundupState['search']>) => {
      updateFn(prev => ({search: {...prev.search, ...patch}}));
    },
    [updateFn],
  );
  const cancelSearch = useCallback(() => {
    setSearch({focused: false, query: ''});
    searchInputRef.current?.blur();
  }, [setSearch]);
  const onSearchKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (state.search.query !== '') {
          setSearch({query: ''});
        } else {
          cancelSearch();
        }
      } else if (event.key === 'Enter' && searchQuery !== '') {
        updateFn(prev => ({
          search: {
            ...prev.search,
            recents: [searchQuery, ...prev.search.recents.filter(r => r !== searchQuery)].slice(0, 4),
          },
        }));
      }
    },
    [cancelSearch, searchQuery, setSearch, state.search.query, updateFn],
  );
  // Announce settled result counts (only when the count actually changes —
  // never a live region per keystroke).
  useEffect(() => {
    if (state.tab !== 'activity' || searchQuery === '') {
      lastCountAnnouncedRef.current = null;
      return;
    }
    if (lastCountAnnouncedRef.current !== searchResults.length) {
      lastCountAnnouncedRef.current = searchResults.length;
      announce(\`\${searchResults.length} result\${searchResults.length === 1 ? '' : 's'}\`);
    }
  }, [announce, searchQuery, searchResults.length, state.tab]);

  // ---- profile ------------------------------------------------------------
  const pickSweepDay = useCallback(
    (day: string) => {
      update({sweepDay: day, sweepPickerOpen: false});
      announce(\`Sweep day set to \${day}\`);
    },
    [announce, update],
  );
  const toggleNotifications = useCallback(() => {
    updateFn(prev => ({notifications: !prev.notifications}));
  }, [updateFn]);
  const confirmSignOut = useCallback(() => {
    update({alertOpen: false});
    announce('Signed out of Tidejar');
    alertOpenerRef.current?.focus({preventScroll: true});
  }, [announce, update]);

  // ---- one-time boost (jar sheet primary) ---------------------------------
  const addBoost = useCallback(
    (jarId: JarId) => {
      seqRef.current += 1;
      const toastSeq = seqRef.current;
      updateFn(prev => ({
        boosts: {...prev.boosts, [jarId]: prev.boosts[jarId] + 2500},
        toast: {
          seq: toastSeq,
          msg: \`Added $25.00 to \${JAR_BY_ID[jarId].name}\`,
          undo: {assignments: prev.assignments, boosts: prev.boosts},
        },
      }));
    },
    [updateFn],
  );

  // ---- render helpers ------------------------------------------------------
  const anyOverlay = state.sheet != null || state.actionSheetFor != null || state.alertOpen;
  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(anyOverlay ? styles.shellLocked : null),
    ...(isDesktop ? styles.shellDesktop : null),
  };

  const renderDropletRow = (txn: Txn, options?: {highlight?: string; withRef?: boolean}) => {
    const jarId = state.assignments[txn.id];
    return (
      <DropletTxnRow
        key={txn.id}
        txn={txn}
        destJar={jarId != null ? JAR_BY_ID[jarId] : null}
        multiplier={state.multiplier}
        showTail={showTail}
        highlight={options?.highlight}
        onRowTap={openActionSheet}
        onEllipsis={openActionSheet}
        onCoinDown={onCoinDown}
        rowRef={
          options?.withRef
            ? el => {
                rowBtnRefs.current[txn.id] = el;
              }
            : undefined
        }
      />
    );
  };

  const withDividers = (nodes: Array<{key: string; node: ReactNode}>, deep: boolean) =>
    nodes.map((item, index) => (
      <div key={item.key}>
        {index > 0 ? <div style={deep ? styles.rowDividerDeep : styles.rowDivider} /> : null}
        {item.node}
      </div>
    ));

  const activeTxn = state.actionSheetFor != null ? TXN_BY_ID[state.actionSheetFor] : null;
  const sheetJar = state.sheet != null ? derivedById[state.sheet.jarId] : null;
  const navTitleByTab: Record<TabId, string> = {
    jars: 'Tidejar',
    activity: 'Activity',
    boost: 'Boost',
    profile: 'Profile',
  };

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{TJR_CSS}</style>
      <div ref={shellRef} style={shellStyle} onPointerDownCapture={onShellPointerDownCapture}>
        {/* ---------------- NAV BAR ---------------- */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {state.tab === 'jars' ? (
              <span style={styles.brandSlot}>
                <TidejarMark size={28} />
              </span>
            ) : (
              <span style={styles.brandSlot} aria-hidden />
            )}
          </div>
          {state.tab === 'jars' ? (
            // Center title fades in as the large title scrolls under
            // (IntersectionObserver sentinel); the h1 is the large title.
            <span
              style={{...styles.navTitle, opacity: largeTitleVisible ? 0 : 1}}
              className="tjr-fade"
              aria-hidden={largeTitleVisible}>
              Tidejar
            </span>
          ) : (
            <h1 style={styles.navTitle}>{navTitleByTab[state.tab]}</h1>
          )}
          <div style={styles.navTrailing}>
            {state.tab === 'jars' || state.tab === 'activity' ? (
              <button
                type="button"
                className="tjr-btn tjr-focusable"
                style={styles.iconBtn}
                aria-label="Refresh"
                onClick={onRefresh}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            ) : (
              <span style={styles.brandSlot} aria-hidden />
            )}
          </div>
        </header>

        <main style={styles.main}>
          {/* ---------------- JARS ---------------- */}
          {state.tab === 'jars' ? (
            <>
              <div ref={sentinelRef} style={{height: 1}} aria-hidden />
              <div style={styles.largeTitleRow}>
                <h1 style={styles.largeTitle}>Tidejar</h1>
              </div>
              <div style={styles.weeklyHero}>
                <span style={styles.overline}>This week's round-ups</span>
                <span style={styles.heroNumeral}>{heroLabel}</span>
                <span style={styles.heroCaption}>8 purchases · {state.multiplier}x multiplier</span>
                <span role="status" style={styles.updatedCaption}>
                  {state.jarsUpdated ? 'Updated just now' : ''}
                </span>
              </div>
              <h2 style={styles.sectionHeader}>Goal jars</h2>
              <div style={styles.jarCardStack}>
                {derivedJars.map(derived => (
                  <JarGaugeCard
                    key={derived.jar.id}
                    derived={derived}
                    dropActive={state.drag?.overJar === derived.jar.id && !state.drag.releasing}
                    flash={state.flashes[derived.jar.id]}
                    onOpen={openJarSheet}
                    cardRef={el => {
                      jarCardRefs.current[derived.jar.id] = el;
                    }}
                  />
                ))}
              </div>
              <h2 style={styles.sectionHeader}>Pending droplets</h2>
              <div style={styles.listCard}>
                {withDividers(
                  TXNS.slice(0, state.dropletsShown).map(txn => ({
                    key: txn.id,
                    node: renderDropletRow(txn, {withRef: true}),
                  })),
                  true,
                )}
                {state.dropletsShown === 3 ? (
                  <>
                    <div style={styles.rowDivider} />
                    <button
                      type="button"
                      className="tjr-btn tjr-focusable"
                      style={styles.loadMoreRow}
                      onClick={showMoreDroplets}>
                      Show 5 more
                    </button>
                  </>
                ) : null}
              </div>
              {state.dropletsShown === 8 ? (
                <div style={styles.terminalCaption}>All 8 purchases this week</div>
              ) : null}
            </>
          ) : null}

          {/* ---------------- ACTIVITY ---------------- */}
          {state.tab === 'activity' ? (
            <>
              <div style={styles.searchBar}>
                <div style={styles.searchField}>
                  <Icon icon={SearchIcon} size="sm" color="secondary" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    style={styles.searchInput}
                    placeholder="Search purchases"
                    aria-label="Search purchases"
                    value={state.search.query}
                    onFocus={() => setSearch({focused: true})}
                    onChange={event => setSearch({query: event.target.value})}
                    onKeyDown={onSearchKeyDown}
                  />
                  {state.search.query !== '' ? (
                    <button
                      type="button"
                      className="tjr-btn tjr-focusable"
                      style={styles.searchClear}
                      aria-label="Clear search text"
                      onClick={() => {
                        setSearch({query: ''});
                        searchInputRef.current?.focus();
                      }}>
                      <Icon icon={XCircleIcon} size="sm" color="inherit" />
                    </button>
                  ) : null}
                </div>
                {state.search.focused ? (
                  <button
                    type="button"
                    className="tjr-btn tjr-focusable"
                    style={styles.searchCancel}
                    onClick={cancelSearch}>
                    Cancel
                  </button>
                ) : null}
              </div>

              {state.activitySkeleton ? (
                <>
                  <h2 style={styles.sectionHeader}>This week</h2>
                  <div style={styles.listCard} aria-busy="true">
                    {SKEL_WIDTHS.map(([primary, secondary], index) => (
                      <div key={\`\${primary}-\${secondary}-\${String(index)}\`}>
                        {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                        <div style={styles.skelRow} aria-hidden>
                          <span style={styles.skelThumb} />
                          <span style={styles.skelBars}>
                            <span style={{...styles.skelBar, width: primary}} />
                            <span style={{...styles.skelBar, width: secondary}} />
                          </span>
                          <span style={styles.skelShimmer} className="tjr-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : state.search.focused && state.search.query === '' ? (
                state.search.recents.length > 0 ? (
                  <>
                    <div style={styles.recentsHeaderRow}>
                      <h2 style={styles.sectionHeader}>Recent</h2>
                      <button
                        type="button"
                        className="tjr-btn tjr-focusable"
                        style={styles.recentsClear}
                        onClick={() => setSearch({recents: []})}>
                        Clear
                      </button>
                    </div>
                    <div style={styles.listCard}>
                      {withDividers(
                        state.search.recents.map(recent => ({
                          key: recent,
                          node: (
                            <div style={styles.recentRow}>
                              <button
                                type="button"
                                className="tjr-btn tjr-focusable"
                                style={styles.recentBtn}
                                onClick={() => {
                                  setSearch({query: recent});
                                  searchInputRef.current?.focus();
                                }}>
                                <Icon icon={ClockIcon} size="sm" color="secondary" />
                                <span>{recent}</span>
                              </button>
                              <button
                                type="button"
                                className="tjr-btn tjr-focusable"
                                style={styles.ellipsisBtn}
                                aria-label={\`Remove recent search \${recent}\`}
                                onClick={() =>
                                  updateFn(prev => ({
                                    search: {
                                      ...prev.search,
                                      recents: prev.search.recents.filter(r => r !== recent),
                                    },
                                  }))
                                }>
                                <Icon icon={XIcon} size="sm" color="inherit" />
                              </button>
                            </div>
                          ),
                        })),
                        false,
                      )}
                    </div>
                  </>
                ) : null
              ) : searchQuery !== '' && searchResults.length === 0 ? (
                // FILTERED-EMPTY — echoes the query verbatim (stress (g)).
                <div style={styles.emptyState}>
                  <span style={styles.emptyIconCircle}>
                    <Icon icon={SearchXIcon} size="lg" color="inherit" />
                  </span>
                  <h2 style={styles.emptyTitle}>No results for &ldquo;{state.search.query}&rdquo;</h2>
                  <p style={styles.emptyBody}>Try a merchant from this week's purchases.</p>
                  <button
                    type="button"
                    className="tjr-btn tjr-focusable"
                    style={styles.secondaryBtn}
                    onClick={() => {
                      setSearch({query: ''});
                      searchInputRef.current?.focus();
                    }}>
                    Clear search
                  </button>
                </div>
              ) : (
                <>
                  {searchQuery !== '' ? (
                    <div style={styles.resultsCaption}>
                      {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
                    </div>
                  ) : (
                    <h2 style={styles.sectionHeader}>This week</h2>
                  )}
                  <div style={styles.listCard}>
                    {withDividers(
                      searchResults.map(txn => ({
                        key: txn.id,
                        node: renderDropletRow(txn, {highlight: searchQuery}),
                      })),
                      true,
                    )}
                  </div>
                  {searchQuery === '' ? (
                    <div style={styles.terminalCaption}>All 8 purchases this week</div>
                  ) : null}
                </>
              )}
            </>
          ) : null}

          {/* ---------------- BOOST ---------------- */}
          {state.tab === 'boost' ? (
            <>
              <h2 style={styles.sectionHeader}>Multiplier</h2>
              <div style={{...styles.listCard, ...styles.dialCard}}>
                <MultiplierDial multiplier={state.multiplier} onSet={setMultiplier} reducedMotion={reducedMotion} />
                <div style={styles.detentTicks} aria-hidden>
                  {([1, 2, 3] as Multiplier[]).map(detent => (
                    <span
                      key={detent}
                      style={{
                        ...styles.detentTickLabel,
                        ...(state.multiplier === detent ? styles.detentTickLabelOn : null),
                      }}>
                      {detent}x round-ups
                    </span>
                  ))}
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Velocity</h2>
              <div style={styles.listCard}>
                <div style={styles.velocityHero}>
                  <span style={styles.overline}>Saving velocity</span>
                  {/* Arithmetic rows: $75.00 + $4.00×m = total. */}
                  <span style={styles.heroNumeral}>{fmtUsd(boostTotalCents)}/wk</span>
                  <span style={styles.heroCaption}>at {state.multiplier}x round-ups</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.breakdownRow}>
                  <span style={styles.breakdownLabel}>Weekly transfers</span>
                  <span style={styles.breakdownValue}>{fmtUsd(transfersCents)}</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.breakdownRow}>
                  <span style={styles.breakdownLabel}>Round-up velocity</span>
                  <span style={styles.breakdownValue}>{fmtUsd(pendingBaseCents * state.multiplier)}</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.breakdownRow}>
                  <span style={{...styles.breakdownLabel, fontWeight: 600}}>Total</span>
                  <span style={{...styles.breakdownValue, ...styles.breakdownTotal}}>
                    {fmtUsd(boostTotalCents)}
                  </span>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Weekly transfers</h2>
              <div style={styles.listCard}>
                {withDividers(
                  JARS.map(jar => ({
                    key: jar.id,
                    node: (
                      <div style={styles.row}>
                        <span style={styles.rowLabel}>{jar.name}</span>
                        <span style={styles.rowValue}>{jar.weeklyTransferLabel}/wk</span>
                      </div>
                    ),
                  })),
                  false,
                )}
              </div>
            </>
          ) : null}

          {/* ---------------- PROFILE ---------------- */}
          {state.tab === 'profile' ? (
            <>
              <h2 style={styles.sectionHeader}>Account</h2>
              <div style={styles.listCard}>
                <div style={styles.row}>
                  <span style={styles.rowLabel}>Round-up account</span>
                  <span style={styles.rowValue}>Visa ····{CARD_LAST4}</span>
                </div>
              </div>
              <h2 style={styles.sectionHeader}>Preferences</h2>
              <div style={styles.listCard}>
                <div style={styles.row}>
                  <span style={styles.rowLabel} id="tjr-sweep-label">
                    Sweep day
                  </span>
                  <button
                    type="button"
                    className="tjr-btn tjr-focusable"
                    style={styles.sweepPill}
                    aria-labelledby="tjr-sweep-label"
                    aria-expanded={state.sweepPickerOpen}
                    onClick={() => updateFn(prev => ({sweepPickerOpen: !prev.sweepPickerOpen}))}>
                    {state.sweepDay}
                  </button>
                </div>
                {state.sweepPickerOpen ? (
                  <div style={styles.weekdayPanel} role="radiogroup" aria-label="Sweep day">
                    {FULL_WEEKDAYS.map((day, index) => {
                      const selected = state.sweepDay === day;
                      return (
                        <button
                          key={day}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={day}
                          className="tjr-btn tjr-focusable"
                          style={{...styles.weekdayBtn, ...(selected ? styles.weekdayBtnOn : null)}}
                          onClick={() => pickSweepDay(day)}>
                          {WEEKDAY_INITIALS[index]}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                <div style={styles.rowDivider} />
                {/* Whole 44px row is the switch (role=switch, aria-checked).
                    OFF track = REST_TRACK ≥3:1 vs the card (amendment). */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.notifications}
                  className="tjr-btn tjr-focusable"
                  style={{...styles.row, width: '100%'}}
                  onClick={toggleNotifications}>
                  <span style={styles.rowLabel}>Notifications</span>
                  <span
                    style={{
                      ...styles.switchTrack,
                      background: state.notifications ? BRAND_ACCENT : REST_TRACK,
                    }}
                    aria-hidden>
                    <span
                      className="tjr-anim"
                      style={{
                        ...styles.switchThumb,
                        transform: state.notifications ? 'translateX(20px)' : 'none',
                      }}
                    />
                  </span>
                </button>
              </div>
              <h2 style={styles.sectionHeader}>Session</h2>
              <div style={styles.listCard}>
                <button
                  type="button"
                  className="tjr-btn tjr-focusable"
                  style={styles.signOutRow}
                  onClick={event => openAlert(event.currentTarget)}>
                  Sign out
                </button>
              </div>
            </>
          ) : null}
        </main>

        {/* TOAST DOCK — sticky-in-flow, the ONE polite region; no
            auto-dismiss timers: persists until Undo, replacement, or a
            screen change. */}
        <div style={styles.toastAnchor} aria-live="polite">
          {state.toast != null ? (
            <div style={styles.toast}>
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo != null ? (
                <>
                  <span style={styles.toastHairline} aria-hidden />
                  <button
                    type="button"
                    className="tjr-btn tjr-focusable"
                    style={styles.toastUndo}
                    onClick={undoToast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* ---------------- TAB BAR ---------------- */}
        <nav style={styles.tabBar} role="tablist" aria-label="Tidejar sections" onKeyDown={onTabKeyDown}>
          {TABS.map(tab => {
            const active = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                ref={el => {
                  tabBtnRefs.current[tab.id] = el;
                }}
                className="tjr-btn tjr-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                onClick={() => switchTab(tab.id)}>
                {tab.id === 'jars' ? (
                  <TidejarMark size={24} />
                ) : (
                  <Icon
                    icon={tab.id === 'activity' ? ReceiptTextIcon : tab.id === 'boost' ? GaugeIcon : UserRoundIcon}
                    size="lg"
                    color="inherit"
                  />
                )}
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ---------------- DRAG LAYER ---------------- */}
        {state.drag != null ? (
          <div style={styles.dragLayer} aria-hidden>
            <div
              style={{
                ...styles.dragCoin,
                transform: \`translate(\${state.drag.x - 16}px, \${state.drag.y - 16}px)\`,
                transition: state.drag.releasing ? 'transform 200ms ease' : 'none',
              }}
              onTransitionEnd={() => update({drag: null})}>
              {fmtUsd(TXN_BY_ID[state.drag.txnId].roundupCents * state.multiplier)}
            </div>
          </div>
        ) : null}

        {/* ---------------- JAR SHEET ---------------- */}
        {sheetJar != null && state.sheet != null ? (
          <>
            <div className="tjr-fade" style={styles.sheetScrim} onClick={closeSheet} aria-hidden />
            <div
              ref={sheetRef}
              className={reducedMotion ? undefined : 'tjr-sheet-in'}
              style={{
                ...styles.sheet,
                ...(state.sheet.detent === 'medium' ? styles.sheetMedium : styles.sheetLarge),
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tjr-sheet-title"
              tabIndex={-1}
              onKeyDown={event => trapTabKey(event, sheetRef.current)}>
              <button
                type="button"
                className="tjr-btn tjr-focusable"
                style={styles.grabberZone}
                aria-label="Resize sheet"
                onClick={() =>
                  updateFn(prev =>
                    prev.sheet == null
                      ? {}
                      : {sheet: {...prev.sheet, detent: prev.sheet.detent === 'medium' ? 'large' : 'medium'}},
                  )
                }>
                <span style={styles.sheetGrabber} />
              </button>
              <div style={styles.sheetHeader}>
                <span aria-hidden />
                <h2 id="tjr-sheet-title" style={styles.sheetTitle}>
                  {sheetJar.jar.name}
                </h2>
                <button
                  type="button"
                  className="tjr-btn tjr-focusable"
                  style={styles.iconBtn}
                  aria-label="Close"
                  onClick={closeSheet}>
                  <Icon icon={XIcon} size="md" color="inherit" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                <div style={styles.sheetJarBlock}>
                  <JarSvg
                    width={120}
                    height={164}
                    fillRatio={sheetJar.fillRatio}
                    pct={sheetJar.pct}
                    hasPending={sheetJar.pendingCents > 0}
                    clipId="tjr-clip-sheet"
                  />
                </div>
                <div style={styles.projLine}>
                  <TidejarMark size={16} />
                  <span>
                    {sheetJar.projDays === 0 ? 'Funded' : \`On track for \${addDaysLabel(sheetJar.projDays)}\`}
                  </span>
                </div>
                {[25, 50, 75].map(q => {
                  const passed = sheetJar.pct >= q;
                  return (
                    <div key={q} style={styles.milestoneRow}>
                      <span style={{width: 20, display: 'inline-flex', color: BRAND_ACCENT}} aria-hidden>
                        {passed ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                      </span>
                      <span>
                        {q}% milestone{passed ? ' · passed' : ''}
                      </span>
                      <span style={styles.milestoneMeta}>{fmtUsd((sheetJar.jar.goalCents * q) / 100)}</span>
                    </div>
                  );
                })}
                <h3 style={{...styles.sectionHeader, paddingInline: 4, margin: '16px 0 4px'}}>
                  This week's droplets
                </h3>
                {TXNS.filter(txn => state.assignments[txn.id] === sheetJar.jar.id).map(txn => (
                  <div key={txn.id} style={styles.sheetDropletRow}>
                    <span
                      style={{...styles.merchTile, width: 36, height: 36, fontSize: 13, borderRadius: 10}}
                      aria-hidden>
                      {txn.merchant.charAt(0)}
                    </span>
                    <span style={{...styles.dropletText, gap: 1}}>
                      <span style={styles.dropletPrimary}>{txn.merchant}</span>
                      <span style={styles.dropletSecondary}>
                        {txn.dateLabel} · {fmtUsd(txn.roundupCents * state.multiplier)} round-up
                      </span>
                    </span>
                    <button
                      type="button"
                      className="tjr-btn tjr-focusable"
                      style={styles.ellipsisBtn}
                      aria-label={\`Send \${txn.merchant} round-up to another jar\`}
                      onClick={() => sendFromSheet(txn.id)}>
                      <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="tjr-btn tjr-focusable"
                  style={styles.primaryBtn}
                  onClick={() => addBoost(sheetJar.jar.id)}>
                  <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
                    <Icon icon={PlusIcon} size="sm" color="inherit" />
                    Add one-time boost · $25.00
                  </span>
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* ---------------- SEND-TO ACTION SHEET ---------------- */}
        {activeTxn != null ? (
          <>
            <div className="tjr-fade" style={styles.sheetScrim} onClick={closeActionSheet} aria-hidden />
            <div
              ref={actionSheetRef}
              className={reducedMotion ? undefined : 'tjr-sheet-in'}
              style={styles.actionSheet}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tjr-action-title"
              onKeyDown={event => trapTabKey(event, actionSheetRef.current)}>
              <div style={styles.actionCard}>
                <div id="tjr-action-title" style={styles.actionHeader}>
                  Send {fmtUsd(activeTxn.roundupCents * state.multiplier)} round-up to…
                </div>
                {JAR_IDS.map(jarId => {
                  const isCurrent = state.assignments[activeTxn.id] === jarId;
                  return (
                    <div key={jarId}>
                      <div style={styles.actionDivider} />
                      <button
                        type="button"
                        className="tjr-btn tjr-focusable"
                        style={styles.actionRow}
                        onClick={() => {
                          if (isCurrent) {
                            closeActionSheet();
                          } else {
                            moveRoundup(activeTxn.id, jarId);
                            actionOpenerRef.current?.focus({preventScroll: true});
                          }
                        }}>
                        <span>
                          {JAR_BY_ID[jarId].name}
                          {isCurrent ? (
                            <span style={{fontSize: 13, color: 'var(--color-text-secondary)', marginInlineStart: 6}}>
                              · current
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div style={styles.actionCard}>
                <button
                  type="button"
                  ref={actionCancelRef}
                  className="tjr-btn tjr-focusable"
                  style={styles.actionCancel}
                  onClick={closeActionSheet}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* SIGN-OUT ALERT — irreversible class; scrim does NOT dismiss. */}
        {state.alertOpen ? (
          <>
            <div style={styles.alertScrim} aria-hidden />
            <div
              style={styles.alert}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="tjr-alert-title"
              aria-describedby="tjr-alert-body"
              onKeyDown={event => trapTabKey(event, event.currentTarget)}>
              <div style={styles.alertBody}>
                <h2 id="tjr-alert-title" style={styles.alertTitle}>
                  Sign out of Tidejar?
                </h2>
                <p id="tjr-alert-body" style={styles.alertText}>
                  Pending round-ups keep collecting while you're signed out.
                </p>
              </div>
              <div style={styles.alertBtnRow}>
                <button
                  type="button"
                  ref={alertCancelRef}
                  className="tjr-btn tjr-focusable"
                  style={{...styles.alertBtn, fontWeight: 400}}
                  onClick={closeAlert}>
                  Cancel
                </button>
                <span style={styles.alertBtnDivider} aria-hidden />
                <button
                  type="button"
                  className="tjr-btn tjr-focusable"
                  style={{...styles.alertBtn, fontWeight: 600, color: 'var(--color-error)'}}
                  onClick={confirmSignOut}>
                  Sign Out
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