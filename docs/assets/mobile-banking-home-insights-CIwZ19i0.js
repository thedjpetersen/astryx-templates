var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Alderbank's July ledger for the
 *   Everyday Checking account: 45 transactions (44 debits totaling exactly
 *   $1,778.50 across Bills $541.90 / Groceries $486.20 / Dining $312.40 /
 *   Shopping $273.15 / Transport $164.85, plus one +$12.00 ATM-fee-refund
 *   credit EXCLUDED from ring math), a $2,600.00 monthly budget (safe to
 *   spend $821.50 = 2,600.00 − 1,778.50), four accounts summing to
 *   $21,506.00, six insight cards whose percentages re-derive from the
 *   rows, and two cards (credit available $4,517.81 = $5,000.00 − $482.19).
 *   Every money figure is dual-field (cents integer + display string via
 *   one formatter). No Date.now(), no Math.random(), no network media.
 * @output Alderbank — Banking Home with Spend Insights: a 390px MOBILE
 *   banking home. NavBar (alder-leaf mark · 'Alderbank' · Eye privacy
 *   toggle + Refresh) over a 40px maskableAmount balance hero, a 200px
 *   five-arc spendRing with a safe-to-spend center and 5 category chips,
 *   a 6-card insightPeekRail (280×148, 82px peek), and an inset-grouped
 *   45-row transaction list paginated 12→24→36→45. Signature move: ONE
 *   setActiveCategory dispatch produces FIVE consequences — arc dims to
 *   its category, chip fills, list filters to 14 dining rows + a Clear
 *   pill, the rail scrolls to the matching insight card, the ring center
 *   swaps to $312.40 · 'Dining · 14 transactions', and the toastDock
 *   announces it. The navBar eye masks all 20+ currency figures through
 *   one width-stable maskableAmount ('$4,286.31' → '$•,•••.••', zero
 *   layout shift), cross-wired to the More tab's Privacy mode switch.
 *   Tabs: Cards (lock switch dims card art + grows a '1 card locked'
 *   hero pill), Move (blur-validated transfer form, sticky Review
 *   footer, Undo toast), More (settings + Sign out alertdialog).
 * @position Page template; emitted by \`astryx template mobile-banking-home-insights\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (sheetScrim/accountSheet z40/41,
 *   alertScrim/alert z60/61) are position:'absolute' INSIDE shell;
 *   position:fixed is banned. While the sheet or alert is open, shell
 *   locks to {height:'100dvh', overflow:'hidden'} and restores on close.
 *   The toastDock is sticky-in-flow (bottom 76, above the 64px tabBar +
 *   12px) per the batch-1 amendment — shell-absolute would pin it to the
 *   DOCUMENT bottom on this tall scrolling view.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 — no avatars in the ledger);
 *   full-bleed is reserved for the insight rail. No desktop Layout
 *   frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Alderbank alder green). The five category colors are
 *   DATA-ENCODING palette values living in the CATEGORIES fixture objects
 *   (light-dark pairs, contrast math at each), plus the sanctioned credit
 *   green and the ≥3:1 rest-control pair (switch OFF tracks, inactive
 *   dots, unselected radio circles) per the batch-2 amendment.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr'); tabBar exactly 64px, 4
 *   tabItems flex:1 (24px icon over 11px/500 label, 4px gap); balance
 *   hero ≈132px (20px pads, 44px overline switcher button, 40px/700
 *   numeral, 13px caption); ring 200×200 (r=80, strokeWidth 18); rail
 *   cards 280×148, gap 12, scrollPaddingInline 16 → peek 82px at 390 /
 *   24px at 320; transaction rows 60px two-line (16px/500 + 13px/400,
 *   2px gap), rowDivider inset 16, loadMoreRow 44px; sheet rows 72px
 *   media (40px circle icon); sectionHeader 13px/600 uppercase 0.06em at
 *   32px, 20px top / 8px bottom. TYPE (Figtree via --font-family-body):
 *   40/700 hero numeral (the one deliberate step above 28 for the money
 *   moment) · 28/700 ring center · 22/700 section titles · 17/600
 *   nav+sheet titles · 16/400 body+inputs · 13/400 meta · 11/500
 *   overlines+tab labels; nothing under 11px; tabular-nums on every
 *   numeral. Touch: every target ≥44×44 with ≥8px clearance or merged
 *   full-row (36px pills/secondary buttons are the sanctioned exception
 *   per the density foundation); ring arcs are aria-hidden garnish — the
 *   44px chips are the compliant path.
 *
 * Responsive contract:
 * - Fluid 320–430px, no width:390 literals: chips flexWrap to two rows
 *   below ~360px; rail peek shrinks 82→24px (cards stay 280, gap 12,
 *   scrollPaddingInline 16 — 320−16−280 = 24px, exactly the floor); the
 *   hero numeral never wraps (max fixture $12,940.87 = 9 glyph cells,
 *   masking is width-stable). overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): useElementWidth on the wrapper (container
 *   width, not viewport — the demo stage sits inside a 1440px window);
 *   at >560px the shell becomes a centered phone column (maxWidth 430,
 *   marginInline auto, borderInline hairline). No adaptive relayout —
 *   this is deliberately a phone surface, presented as one.
 * - navBar hairline+blur ALWAYS ON (no scroll-under wiring — the chosen
 *   variant, noted per the chrome contract). No large-title collapse:
 *   the compact 'Alderbank' title is always visible (sanctioned skip).
 */

import {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, RefObject} from 'react';

import {
  AlertCircleIcon,
  ArrowLeftRightIcon,
  BadgeCheckIcon,
  BusIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,
  EyeIcon,
  EyeOffIcon,
  HomeIcon,
  LockIcon,
  MoreHorizontalIcon,
  PiggyBankIcon,
  PlaneIcon,
  ReceiptIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UsersIcon,
  UtensilsIcon,
  WalletIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Alderbank alder green). #175E54 on #FFFFFF
// ≈ 6.9:1 (passes 4.5:1); #7FD1C0 on the dark card (~#1C1C1E) ≈ 10.4:1.
const BRAND_ACCENT = 'light-dark(#175E54, #7FD1C0)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #175E54 ≈ 6.9:1. Dark:
// white on #7FD1C0 fails (~1.7:1), so the dark side flips to near-black
// alder — #0B2B26 on #7FD1C0 ≈ 8.9:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #0B2B26)';
// Brand-tinted wash for the brand mark chip and the '1 card locked' pill.
// BRAND_ACCENT text on this 12% wash: light ≈ 6.3:1, dark ≈ 9.6:1 — the
// wash barely shifts the surface, both clear 4.5:1 (amendment: tinted
// washes count as the ACTUAL surface).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// Credit-amount green (the +$12.00 refund, Rent split +$1,150.00).
// #1B7A3D on the white card ≈ 4.9:1; #8CD9A4 on the dark card ≈ 11.2:1.
const GREEN_CREDIT = 'light-dark(#1B7A3D, #8CD9A4)';
// REST-STATE CONTROL pair (batch-2 amendment: interactive boundaries and
// meaningful rest fills need ≥3:1 against their ACTUAL surface — hairline
// tokens are for passive separators only). Used for: switch OFF tracks,
// inactive carousel dots, unselected destination radio circles.
// #767C87 on the white card ≈ 3.5:1; #7A828E on the dark card ≈ 3.6:1.
const REST_CONTROL = 'light-dark(#767C87, #7A828E)';
// Sheet/alert scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Text over a filled (active) category chip — category light-side fills
// are 400–700-weight darks (white passes: worst is Dining #B4551F ≈
// 4.6:1); dark-side fills are 300-weight lights (near-black #14181D
// passes: worst ≈ 9.3:1).
const ON_CAT_TEXT = 'light-dark(#FFFFFF, #14181D)';
// Chrome blur surface (navBar / tabBar / sticky Move footer).
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden h1,
// skeleton shimmer, sheet/alert entrances, reduced-motion guard. All
// transitions animate transform/opacity only and collapse under
// prefers-reduced-motion (shimmer is REMOVED entirely — static muted
// blocks still encode 'loading').
// ---------------------------------------------------------------------------

const ALDERBANK_CSS = \`
.adb-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.adb-btn:disabled { cursor: default; }
.adb-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.adb-fade { transition: opacity 200ms ease; }
.adb-move { transition: transform 200ms ease, opacity 200ms ease; }
@keyframes adb-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.adb-sheet-in { animation: adb-sheet-in 200ms ease; }
@keyframes adb-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.adb-shimmer {
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  animation: adb-shimmer 1.6s ease-in-out infinite;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-background-card) 55%, transparent), transparent);
}
.adb-vh {
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
  .adb-fade, .adb-move { transition: none; }
  .adb-sheet-in { animation: none; }
  .adb-shimmer { display: none; }
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
  // Scroll lock while the account sheet or alert is open.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage >560px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px icon buttons
  // optically align to the 16px gutter. Hairline + blur ALWAYS ON.
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
  navTitle: {fontSize: 17, fontWeight: 600, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  // 44×44 brand button holding the 28px alder-leaf mark (opens More tab).
  brandBtn: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
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
  // BALANCE HERO — 20px pads, 44px overline switcher, 40px numeral, 13px
  // caption ≈ 132px total.
  hero: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingInline: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  heroOverlineBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    color: 'var(--color-text-secondary)',
  },
  heroOverline: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  heroBalance: {fontSize: 40, fontWeight: 700, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums'},
  heroCaption: {marginTop: 4, fontSize: 13, color: 'var(--color-text-secondary)'},
  // '1 card locked' 24px status pill (cross-surface consequence of the
  // Cards-tab lock switch). Display-only span; the switch is the control.
  lockedPill: {
    marginTop: 8,
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 10,
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom; rendered as real h2s.
  sectionHeaderRow: {
    margin: '20px 0 8px',
    paddingInline: 32,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
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
  sectionCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // SPEND RING — 200×200 centered, chips 16px below (8px gaps, flexWrap).
  ringSection: {display: 'flex', flexDirection: 'column', alignItems: 'center', paddingInline: 16},
  ringWrap: {position: 'relative', width: 200, height: 200},
  ringCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
    textAlign: 'center',
  },
  ringCenterStack: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, maxWidth: 128},
  ringOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  ringValue: {fontSize: 28, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'},
  ringCaption: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  chipRow: {
    marginTop: 16,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  // Category chip — 44px tall pill, aria-pressed toggle. Rest boundary is
  // the CATEGORY color itself (≥3:1 on both card/body surfaces — see the
  // per-category math in CATEGORIES), never the passive hairline token.
  chip: {
    height: 44,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    background: 'var(--color-background-card)',
  },
  chipDot: {width: 10, height: 10, borderRadius: '50%', flexShrink: 0},
  chipName: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap'},
  chipAmt: {fontSize: 13, fontWeight: 400, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // INSIGHT PEEK RAIL — full-bleed; cards 280×148, gap 12, snap start;
  // peek = 390−16−280−12 = 82px at 390, 320−16−280−12−(−12)… = 24px at 320.
  rail: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 16,
    paddingBlock: 2,
  },
  railCard: {
    flexShrink: 0,
    width: 280,
    height: 148,
    scrollSnapAlign: 'start',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '14px 16px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    boxSizing: 'border-box',
  },
  railHead: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  railHeadline: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '20px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minWidth: 0,
  },
  railStat: {
    fontSize: 13,
    lineHeight: '18px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  railCta: {
    marginTop: 'auto',
    height: 36,
    alignSelf: 'flex-start',
    paddingInline: 12,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 'var(--radius-element, 12px)',
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  dotRow: {height: 44, display: 'flex', justifyContent: 'center', alignItems: 'center'},
  dotBtn: {width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 12},
  // Inactive dots use REST_CONTROL (≥3:1 vs body — amendment), not muted.
  dot: {width: 8, height: 8, borderRadius: '50%', background: REST_CONTROL},
  dotActive: {background: BRAND_ACCENT},
  // FILTER PILL — 36px (sanctioned secondary-button height) above the card.
  filterPillRow: {paddingInline: 16, marginBottom: 12, display: 'flex'},
  filterPill: {
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
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
  // 60px two-line transaction row (non-interactive ledger row: a div with
  // tabIndex −1 so load-more can move focus to it; rows carry no verb, so
  // a <button> would lie to the accessibility tree).
  txRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  txText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  txPrimary: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  txSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  txAmount: {fontSize: 16, fontWeight: 400, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  loadMoreRow: {
    width: '100%',
    height: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // 60px note card shown for non-checking accounts (insights collapse).
  noteCard: {
    marginInline: 16,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  noteText: {flex: 1, minWidth: 0, fontSize: 13, color: 'var(--color-text-secondary)'},
  secondaryBtn36: {
    height: 36,
    paddingInline: 12,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 'var(--radius-element, 12px)',
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // EMPTY STATE (Travel Vault true-empty), per emptyAndSkeleton verbatim.
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
  // SKELETON — 60px rows, same geometry as txRow; deterministic widths.
  skeletonRow: {height: 60, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skelText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skelBar: {
    position: 'relative',
    height: 12,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  // TAB BAR — exactly 64px; 4 tabs flex:1; blur + top hairline.
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
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // TOAST DOCK — sticky-in-flow (height 0) so it pins 76px above the
  // viewport bottom even mid-scroll on this tall view (batch-1 amendment:
  // shell-absolute pins to the DOCUMENT bottom). Bumps to 156 on the Move
  // tab to clear its sticky 80px footer. Always mounted for aria-live.
  toastAnchor: {
    position: 'sticky',
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 'calc(100% - 32px)',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    borderRadius: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
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
  toastUndo: {height: 48, minWidth: 44, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, color: BRAND_ACCENT},
  // ACCOUNT SHEET — scrim z40 + sheet z41, absolute inside shell; medium
  // 55% / large calc(100% − 56px) detents.
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 16},
  // 72px account media row (40px circle icon + two-line + trailing amount).
  acctRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  acctIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  acctText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  acctName: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  acctMeta: {fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  acctCheck: {width: 20, flexShrink: 0, color: BRAND_ACCENT, display: 'grid', placeItems: 'center'},
  sheetFooterCaption: {
    padding: '12px 16px 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  rowDividerSheet: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // ALERT — scrim z60 + centered alertdialog z61 (above everything).
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
  alertBody: {padding: 20, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center'},
  alertTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  alertText: {fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: '18px'},
  alertBtnRow: {display: 'flex', borderTop: '1px solid var(--color-border)'},
  alertBtn: {flex: 1, height: 44, display: 'grid', placeItems: 'center', fontSize: 17},
  alertBtnRule: {width: 1, background: 'var(--color-border)'},
  // CARDS TAB — 16px-radius card-art tiles + 44px rows.
  cardTile: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardArt: {
    position: 'relative',
    height: 120,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: BRAND_FILL_TEXT,
    background: \`linear-gradient(135deg, \${BRAND_ACCENT}, color-mix(in srgb, \${BRAND_ACCENT} 62%, light-dark(#0B2B26, #103B33)))\`,
  },
  cardArtName: {fontSize: 13, fontWeight: 600, letterSpacing: '0.04em'},
  cardArtNumber: {fontSize: 16, fontWeight: 600, letterSpacing: '0.12em', fontVariantNumeric: 'tabular-nums'},
  cardArtExp: {fontSize: 11, fontWeight: 500, opacity: 0.85, fontVariantNumeric: 'tabular-nums'},
  lockedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 10,
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontSize: 11,
    fontWeight: 500,
  },
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  utilityLabel: {flex: 1, minWidth: 0, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  utilityValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  // SWITCH — 51×31 track / 27px thumb per inputControls; OFF track uses
  // REST_CONTROL (≥3:1 amendment), not the foundations' 14% alpha.
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    flexShrink: 0,
    position: 'relative',
    background: REST_CONTROL,
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
  switchThumbOn: {transform: 'translateX(20px)'},
  // MOVE TAB — form fields + quick chips + sticky footer above the tabBar.
  formField: {display: 'flex', flexDirection: 'column', gap: 8, padding: 16},
  fieldLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  fieldInput: {
    height: 48,
    borderRadius: 12,
    border: 'none',
    background: 'var(--color-background-muted)',
    paddingInline: 16,
    fontSize: 16,
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    boxShadow: 'inset 0 0 0 2px transparent',
  },
  fieldInputFocus: {boxShadow: \`inset 0 0 0 2px \${BRAND_ACCENT}\`},
  fieldInputError: {boxShadow: 'inset 0 0 0 2px var(--color-error)'},
  fieldError: {
    marginTop: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: 'var(--color-error)',
  },
  quickChipRow: {display: 'flex', gap: 8, paddingInline: 16},
  quickChip: {
    height: 36,
    paddingInline: 16,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  // Unselected destination circle: 2px REST_CONTROL boundary (amendment).
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    flexShrink: 0,
    border: \`2px solid \${REST_CONTROL}\`,
    display: 'grid',
    placeItems: 'center',
    boxSizing: 'border-box',
  },
  radioCircleOn: {border: 'none', background: BRAND_ACCENT, color: BRAND_FILL_TEXT},
  moveFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 20,
    padding: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  primaryBtn48: {
    width: '100%',
    height: 48,
    borderRadius: 'var(--radius-element, 12px)',
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  signOutText: {color: 'var(--color-error)', fontSize: 16, fontWeight: 500},
};

// ---------------------------------------------------------------------------
// FIXTURES — module-level consts, dual fields (cents integer + display
// string), ticket-shaped prose, every aggregate arithmetically
// constructible. Cross-check ledger (verified by hand before shipping):
//   Categories: 54,190 + 48,620 + 31,240 + 27,315 + 16,485 = 177,850¢
//     = $1,778.50 spent · 4+9+14+6+11 = 44 debits ✓
//   Safe to spend: 260,000 − 177,850 = 82,150¢ = $821.50 ✓
//   Accounts: 428,631 + 1,294,087 + 187,322 + 240,560 = 2,150,600¢
//     = $21,506.00 ✓
//   Credit card: 500,000 − 48,219 = 451,781¢ = $4,517.81 available ✓
//   Pagination: 12 + 12 + 12 + 9 = 45 rows ✓
//   The +$12.00 refund credit is category 'adjustments' and is EXCLUDED
//   from ring/spend math by the category filter below — the list total
//   differs from the ring total by exactly 1,200¢, deliberately.
// ---------------------------------------------------------------------------

type IconComponent = typeof WalletIcon;

type CategoryId = 'bills' | 'groceries' | 'dining' | 'shopping' | 'transport';

interface SpendCategory {
  id: CategoryId;
  name: string;
  txCount: number;
  totalCents: number;
  totalDisplay: string;
  // Data-encoding light-dark pair (distinct from the ONE quarantined
  // BRAND_ACCENT). Doubles as the chip's REST boundary color — each light
  // side ≥3:1 on the white card/body, each dark side ≥3:1 on ~#1C1C1E
  // (amendment: interactive boundaries never lean on hairline tokens).
  color: string;
  icon: IconComponent;
}

// Ring order largest-first from 12 o'clock (arc shares 30.5 / 27.3 /
// 17.6 / 15.4 / 9.3% — computed from exact fractions in code, displayed
// nowhere as a set because the rounded percents sum to 100.1).
const CATEGORIES: SpendCategory[] = [
  {
    id: 'bills',
    name: 'Bills',
    txCount: 4,
    totalCents: 54190,
    totalDisplay: '$541.90',
    // #5A6472 on #FFF ≈ 5.9:1; #AFB9C6 on #1C1C1E ≈ 8.7:1.
    color: 'light-dark(#5A6472, #AFB9C6)',
    icon: ReceiptIcon,
  },
  {
    id: 'groceries',
    name: 'Groceries',
    txCount: 9,
    totalCents: 48620,
    totalDisplay: '$486.20',
    // #3A7D44 on #FFF ≈ 5.0:1; #8FD19A on #1C1C1E ≈ 10.6:1.
    color: 'light-dark(#3A7D44, #8FD19A)',
    icon: ShoppingCartIcon,
  },
  {
    id: 'dining',
    name: 'Dining',
    txCount: 14,
    totalCents: 31240,
    totalDisplay: '$312.40',
    // #B4551F on #FFF ≈ 4.6:1; #F0A171 on #1C1C1E ≈ 9.5:1.
    color: 'light-dark(#B4551F, #F0A171)',
    icon: UtensilsIcon,
  },
  {
    id: 'shopping',
    name: 'Shopping',
    txCount: 6,
    totalCents: 27315,
    totalDisplay: '$273.15',
    // #7B4FA6 on #FFF ≈ 6.6:1; #C9A8ED on #1C1C1E ≈ 9.3:1.
    color: 'light-dark(#7B4FA6, #C9A8ED)',
    icon: ShoppingBagIcon,
  },
  {
    id: 'transport',
    name: 'Transport',
    txCount: 11,
    totalCents: 16485,
    totalDisplay: '$164.85',
    // #2C6E9E on #FFF ≈ 5.4:1; #8CC5EC on #1C1C1E ≈ 10.0:1.
    color: 'light-dark(#2C6E9E, #8CC5EC)',
    icon: BusIcon,
  },
];

const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map(cat => [cat.id, cat])) as Record<CategoryId, SpendCategory>;

// Aggregates DERIVE from the rows (cross-check law): 177,850¢ spent.
const SPENT_CENTS = CATEGORIES.reduce((sum, cat) => sum + cat.totalCents, 0);
const BUDGET_CENTS = 260000; // $2,600.00 monthly budget
const SAFE_TO_SPEND_CENTS = BUDGET_CENTS - SPENT_CENTS; // 82,150 = $821.50

interface Txn {
  id: string;
  merchant: string;
  categoryId: CategoryId | 'adjustments';
  kind: 'debit' | 'credit';
  cents: number;
  display: string;
  dateLabel: string; // fixed string, Jul 1–27 — never Date.now()
}

// 45 rows, newest first; the Jul 27 credit tops the list. Sums re-checked
// per category: dining 31,240 · groceries 48,620 · transport 16,485 ·
// shopping 27,315 · bills 54,190. t45's 47-char merchant is the 60px-row
// single-line ellipsis stress; t19 carries the Figtree diacritic stress.
const TXNS: Txn[] = [
  {id: 't01', merchant: 'Alderbank ATM fee refund', categoryId: 'adjustments', kind: 'credit', cents: 1200, display: '$12.00', dateLabel: 'Jul 27'},
  {id: 't02', merchant: 'Marlow Coffee', categoryId: 'dining', kind: 'debit', cents: 815, display: '$8.15', dateLabel: 'Jul 27'},
  {id: 't03', merchant: 'Fernwood Market', categoryId: 'groceries', kind: 'debit', cents: 6620, display: '$66.20', dateLabel: 'Jul 26'},
  {id: 't04', merchant: 'Cedar & Vine', categoryId: 'dining', kind: 'debit', cents: 4255, display: '$42.55', dateLabel: 'Jul 26'},
  {id: 't05', merchant: 'Lyra Rides', categoryId: 'transport', kind: 'debit', cents: 1560, display: '$15.60', dateLabel: 'Jul 25'},
  {id: 't06', merchant: 'Golden Hour Bagels', categoryId: 'dining', kind: 'debit', cents: 940, display: '$9.40', dateLabel: 'Jul 25'},
  {id: 't07', merchant: 'Halewood Insurance', categoryId: 'bills', kind: 'debit', cents: 27216, display: '$272.16', dateLabel: 'Jul 24'},
  {id: 't08', merchant: 'Pho Lantern', categoryId: 'dining', kind: 'debit', cents: 2175, display: '$21.75', dateLabel: 'Jul 24'},
  {id: 't09', merchant: 'Corner Greens', categoryId: 'groceries', kind: 'debit', cents: 1370, display: '$13.70', dateLabel: 'Jul 23'},
  {id: 't10', merchant: 'Metro reload', categoryId: 'transport', kind: 'debit', cents: 2000, display: '$20.00', dateLabel: 'Jul 23'},
  {id: 't11', merchant: "Tomlin's Hardware", categoryId: 'shopping', kind: 'debit', cents: 2685, display: '$26.85', dateLabel: 'Jul 22'},
  {id: 't12', merchant: 'Harvest Bowl', categoryId: 'dining', kind: 'debit', cents: 1465, display: '$14.65', dateLabel: 'Jul 22'},
  {id: 't13', merchant: 'Hillside Co-op', categoryId: 'groceries', kind: 'debit', cents: 4415, display: '$44.15', dateLabel: 'Jul 21'},
  {id: 't14', merchant: 'Meterly Parking', categoryId: 'transport', kind: 'debit', cents: 1275, display: '$12.75', dateLabel: 'Jul 21'},
  {id: 't15', merchant: 'Arcadia Outfitters', categoryId: 'shopping', kind: 'debit', cents: 5850, display: '$58.50', dateLabel: 'Jul 20'},
  {id: 't16', merchant: 'Sunmill Pizza', categoryId: 'dining', kind: 'debit', cents: 2890, display: '$28.90', dateLabel: 'Jul 19'},
  {id: 't17', merchant: 'VoltPoint Charging', categoryId: 'transport', kind: 'debit', cents: 1850, display: '$18.50', dateLabel: 'Jul 19'},
  {id: 't18', merchant: 'Fernwood Market', categoryId: 'groceries', kind: 'debit', cents: 9145, display: '$91.45', dateLabel: 'Jul 18'},
  {id: 't19', merchant: 'Taquería Norte', categoryId: 'dining', kind: 'debit', cents: 1930, display: '$19.30', dateLabel: 'Jul 18'},
  {id: 't20', merchant: 'CityBike', categoryId: 'transport', kind: 'debit', cents: 450, display: '$4.50', dateLabel: 'Jul 17'},
  {id: 't21', merchant: 'Pixel & Thread', categoryId: 'shopping', kind: 'debit', cents: 4720, display: '$47.20', dateLabel: 'Jul 16'},
  {id: 't22', merchant: 'Marlow Coffee', categoryId: 'dining', kind: 'debit', cents: 675, display: '$6.75', dateLabel: 'Jul 16'},
  {id: 't23', merchant: 'Corner Greens', categoryId: 'groceries', kind: 'debit', cents: 3160, display: '$31.60', dateLabel: 'Jul 15'},
  {id: 't24', merchant: 'Fernline Internet', categoryId: 'bills', kind: 'debit', cents: 7999, display: '$79.99', dateLabel: 'Jul 15'},
  {id: 't25', merchant: 'Cedar & Vine', categoryId: 'dining', kind: 'debit', cents: 6285, display: '$62.85', dateLabel: 'Jul 14'},
  {id: 't26', merchant: 'Lyra Rides', categoryId: 'transport', kind: 'debit', cents: 2430, display: '$24.30', dateLabel: 'Jul 13'},
  {id: 't27', merchant: 'Hillside Co-op', categoryId: 'groceries', kind: 'debit', cents: 5890, display: '$58.90', dateLabel: 'Jul 12'},
  {id: 't28', merchant: 'Golden Hour Bagels', categoryId: 'dining', kind: 'debit', cents: 1210, display: '$12.10', dateLabel: 'Jul 12'},
  {id: 't29', merchant: 'Metro reload', categoryId: 'transport', kind: 'debit', cents: 2000, display: '$20.00', dateLabel: 'Jul 11'},
  {id: 't30', merchant: 'Arcadia Outfitters', categoryId: 'shopping', kind: 'debit', cents: 8995, display: '$89.95', dateLabel: 'Jul 10'},
  {id: 't31', merchant: 'Pho Lantern', categoryId: 'dining', kind: 'debit', cents: 2340, display: '$23.40', dateLabel: 'Jul 10'},
  {id: 't32', merchant: 'Fernwood Market', categoryId: 'groceries', kind: 'debit', cents: 7210, display: '$72.10', dateLabel: 'Jul 9'},
  {id: 't33', merchant: 'Meterly Parking', categoryId: 'transport', kind: 'debit', cents: 625, display: '$6.25', dateLabel: 'Jul 9'},
  {id: 't34', merchant: 'Cascade Water', categoryId: 'bills', kind: 'debit', cents: 6135, display: '$61.35', dateLabel: 'Jul 8'},
  {id: 't35', merchant: 'Marlow Coffee', categoryId: 'dining', kind: 'debit', cents: 725, display: '$7.25', dateLabel: 'Jul 8'},
  {id: 't36', merchant: 'CityBike', categoryId: 'transport', kind: 'debit', cents: 450, display: '$4.50', dateLabel: 'Jul 7'},
  {id: 't37', merchant: 'Northloop Books', categoryId: 'shopping', kind: 'debit', cents: 1825, display: '$18.25', dateLabel: 'Jul 6'},
  {id: 't38', merchant: 'Cedar & Vine', categoryId: 'dining', kind: 'debit', cents: 4860, display: '$48.60', dateLabel: 'Jul 5'},
  {id: 't39', merchant: 'Corner Greens', categoryId: 'groceries', kind: 'debit', cents: 2375, display: '$23.75', dateLabel: 'Jul 4'},
  {id: 't40', merchant: 'Lyra Rides', categoryId: 'transport', kind: 'debit', cents: 1845, display: '$18.45', dateLabel: 'Jul 3'},
  {id: 't41', merchant: 'Fernwood Market', categoryId: 'groceries', kind: 'debit', cents: 8435, display: '$84.35', dateLabel: 'Jul 2'},
  {id: 't42', merchant: 'Marlow Coffee', categoryId: 'dining', kind: 'debit', cents: 675, display: '$6.75', dateLabel: 'Jul 2'},
  {id: 't43', merchant: 'Metro reload', categoryId: 'transport', kind: 'debit', cents: 2000, display: '$20.00', dateLabel: 'Jul 1'},
  {id: 't44', merchant: 'Northloop Books', categoryId: 'shopping', kind: 'debit', cents: 3240, display: '$32.40', dateLabel: 'Jul 1'},
  {
    id: 't45',
    merchant: 'Grid & Main Electric Co. Autopay — Budget Billing Plan',
    categoryId: 'bills',
    kind: 'debit',
    cents: 12840,
    display: '$128.40',
    dateLabel: 'Jul 1',
  },
];

const PAGE_SIZE = 12;
const TXN_TOTAL = TXNS.length; // 45

interface Account {
  id: string;
  name: string;
  last4: string;
  balanceCents: number;
  balanceDisplay: string;
  icon: IconComponent;
  status: 'ready' | 'syncing' | 'empty';
}

// Sheet footer 'Total across 4 accounts · $21,506.00' derives live:
// 428,631 + 1,294,087 + 187,322 + 240,560 = 2,150,600¢ ✓.
const ACCOUNTS: Account[] = [
  {id: 'acct-checking', name: 'Everyday Checking', last4: '••1428', balanceCents: 428631, balanceDisplay: '$4,286.31', icon: WalletIcon, status: 'ready'},
  {id: 'acct-hysave', name: 'High-Yield Savings', last4: '••3016', balanceCents: 1294087, balanceDisplay: '$12,940.87', icon: PiggyBankIcon, status: 'ready'},
  {id: 'acct-shared', name: 'Shared Household', last4: '••8842', balanceCents: 187322, balanceDisplay: '$1,873.22', icon: UsersIcon, status: 'syncing'},
  {id: 'acct-travel', name: 'Travel Vault', last4: '••5590', balanceCents: 240560, balanceDisplay: '$2,405.60', icon: PlaneIcon, status: 'empty'},
];

const ACCOUNT_BY_ID = Object.fromEntries(ACCOUNTS.map(acct => [acct.id, acct])) as Record<string, Account>;
const TOTAL_ACROSS_CENTS = ACCOUNTS.reduce((sum, acct) => sum + acct.balanceCents, 0);

interface SideRow {
  id: string;
  title: string;
  kind: 'debit' | 'credit';
  cents: number;
  display: string;
  meta: string; // 'Jul 15 · Bills'
}

// Shared Household resolves from 4 skeleton rows into these 3 on the next
// Refresh press (user-driven appearance AND resolution — no timers).
const SHARED_ROWS: SideRow[] = [
  {id: 'sh1', title: 'Rent split — Maya P.', kind: 'credit', cents: 115000, display: '$1,150.00', meta: 'Jul 22 · Transfer'},
  {id: 'sh2', title: 'Grid & Main Electric Co. Autopay — Budget Billing Plan', kind: 'debit', cents: 12840, display: '$128.40', meta: 'Jul 15 · Bills'},
  {id: 'sh3', title: 'Fernwood Market', kind: 'debit', cents: 6620, display: '$66.20', meta: 'Jul 9 · Groceries'},
];

// High-Yield Savings July rows (spec was silent on this account's ledger;
// two deposit rows added so the account isn't a dead end — noted as a
// deviation in the summary).
const HYSAVE_ROWS: SideRow[] = [
  {id: 'hy1', title: 'Transfer from Everyday Checking', kind: 'credit', cents: 50000, display: '$500.00', meta: 'Jul 15 · Transfer'},
  {id: 'hy2', title: 'Interest payment · 3.90% APY', kind: 'credit', cents: 4211, display: '$42.11', meta: 'Jul 1 · Interest'},
];

// Deterministic skeleton widths (60%/45%/70%/60% primary · 40%/55%/30%/40%
// secondary — fixed pattern, never Math.random()).
const SKELETON_WIDTHS: Array<{primary: string; secondary: string}> = [
  {primary: '60%', secondary: '40%'},
  {primary: '45%', secondary: '55%'},
  {primary: '70%', secondary: '30%'},
  {primary: '60%', secondary: '40%'},
];

type StatSeg = {text: string} | {cents: number; sign?: '+'};

interface InsightCard {
  id: string;
  categoryId: CategoryId | null;
  icon: IconComponent;
  headline: string;
  stat: StatSeg[];
  ctaLabel: string;
}

// Six cards; indices 1–5 mirror ring order. Percent cross-checks:
// 27,216 / 54,190 = 50.2% ✓ · 590 / 49,210 = 1.2% ✓ · 4,765 / 26,475 =
// 18.0% and 26,475 + 4,765 = 31,240 ✓ · 8,995 + 5,850 = 14,845 ✓ ·
// 6,000 / 16,485 = 36.4% ✓.
const INSIGHTS: InsightCard[] = [
  {
    id: 'ins-refund',
    categoryId: null,
    icon: BadgeCheckIcon,
    headline: 'Fee refunded',
    stat: [{cents: 1200}, {text: ' ATM fee credited Jul 27'}],
    ctaLabel: 'View credit',
  },
  {
    id: 'ins-bills',
    categoryId: 'bills',
    icon: ReceiptIcon,
    headline: 'One bill is half your bills total',
    stat: [{text: 'Halewood Insurance '}, {cents: 27216}, {text: ' is 50.2% of '}, {cents: 54190}],
    ctaLabel: 'Filter to Bills',
  },
  {
    id: 'ins-groceries',
    categoryId: 'groceries',
    icon: ShoppingCartIcon,
    headline: 'Groceries steady',
    stat: [{cents: 48620}, {text: ' vs '}, {cents: 49210}, {text: ' in June, down '}, {cents: 590}, {text: ' (−1.2%)'}],
    ctaLabel: 'Filter to Groceries',
  },
  {
    id: 'ins-dining',
    categoryId: 'dining',
    icon: UtensilsIcon,
    headline: 'Dining up 18%',
    stat: [{cents: 31240}, {text: ' vs '}, {cents: 26475}, {text: ' in June, '}, {cents: 4765, sign: '+'}],
    ctaLabel: 'Filter to Dining',
  },
  {
    id: 'ins-shopping',
    categoryId: 'shopping',
    icon: ShoppingBagIcon,
    headline: 'Top shopping merchant',
    stat: [{text: 'Arcadia Outfitters · 2 purchases · '}, {cents: 14845}],
    ctaLabel: 'Filter to Shopping',
  },
  {
    id: 'ins-transport',
    categoryId: 'transport',
    icon: BusIcon,
    headline: 'Metro reloads',
    stat: [{text: '3 × '}, {cents: 2000}, {text: ' = '}, {cents: 6000}, {text: ', 36.4% of transport'}],
    ctaLabel: 'Filter to Transport',
  },
];

// Rail card index for a category (card 0 is the refund card).
const RAIL_INDEX: Record<CategoryId, number> = {bills: 1, groceries: 2, dining: 3, shopping: 4, transport: 5};
// Card 280 + gap 12 — the rail's scroll stride.
const RAIL_STRIDE = 292;

interface BankCard {
  id: string;
  name: string;
  last4: string;
  kind: 'debit' | 'credit';
  exp: string;
  linkedTo: string | null;
  balanceCents: number | null;
  balanceDisplay: string | null;
  limitCents: number | null;
  limitDisplay: string | null;
  availableCents: number | null; // 500,000 − 48,219 = 451,781 ✓
  availableDisplay: string | null;
}

const BANK_CARDS: BankCard[] = [
  {
    id: 'card-debit-1428',
    name: 'Alderbank Visa',
    last4: '••1428',
    kind: 'debit',
    exp: '09/28',
    linkedTo: 'Everyday Checking ••1428',
    balanceCents: null,
    balanceDisplay: null,
    limitCents: null,
    limitDisplay: null,
    availableCents: null,
    availableDisplay: null,
  },
  {
    id: 'card-credit-7731',
    name: 'Alderbank Credit',
    last4: '••7731',
    kind: 'credit',
    exp: '11/27',
    linkedTo: null,
    balanceCents: 48219,
    balanceDisplay: '$482.19',
    limitCents: 500000,
    limitDisplay: '$5,000.00',
    availableCents: 451781,
    availableDisplay: '$4,517.81',
  },
];

const QUICK_AMOUNTS: Array<{cents: number; label: string}> = [
  {cents: 5000, label: '$50'},
  {cents: 10000, label: '$100'},
  {cents: 25000, label: '$250'},
];

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Cents → '$4,286.31' (comma thousands, always 2 decimals). */
function fmtMoney(cents: number): string {
  const abs = Math.abs(Math.round(cents));
  const dollars = String(Math.floor(abs / 100)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  return \`$\${dollars}.\${String(abs % 100).padStart(2, '0')}\`;
}

/** '4,286.31' / '$50' / '50' → cents integer, or null when unparsable. */
function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[$,\\s]/g, '');
  if (cleaned === '' || !/^\\d*\\.?\\d{0,2}$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

// ---------------------------------------------------------------------------
// MASKABLE AMOUNT — the ONLY way currency renders (20+ instances: hero,
// ring center + budget line, 5 chips, 6 insight stats, 45 ledger rows,
// 4 sheet balances + sheet total, Cards tab, Move form). When masked,
// every DIGIT glyph swaps to '•' inside an inline-block 1ch cell — under
// fontVariantNumeric: tabular-nums, 1ch equals the uniform digit advance,
// so '$4,286.31' → '$•,•••.••' with IDENTICAL total width (zero layout
// shift is the acceptance test). '$', ',', '.', '+', '−' pass through.
// ---------------------------------------------------------------------------

type AmountSize = 'hero40' | 'ring28' | 'row16' | 'meta13';

const AMOUNT_BASE: CSSProperties = {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'};
const AMOUNT_SIZE: Record<AmountSize, CSSProperties> = {
  hero40: {fontSize: 40, fontWeight: 700, lineHeight: 1.15},
  ring28: {fontSize: 28, fontWeight: 700, lineHeight: 1.1},
  row16: {fontSize: 16, fontWeight: 400},
  meta13: {fontSize: 13, fontWeight: 400},
};
const DIGIT_CELL: CSSProperties = {display: 'inline-block', width: '1ch', textAlign: 'center'};

interface MaskableAmountProps {
  cents: number;
  masked: boolean;
  size: AmountSize;
  sign?: '+' | '−';
  color?: string;
  weight?: number;
}

function MaskableAmount({cents, masked, size, sign, color, weight}: MaskableAmountProps) {
  const display = \`\${sign ?? ''}\${fmtMoney(cents)}\`;
  const style: CSSProperties = {
    ...AMOUNT_BASE,
    ...AMOUNT_SIZE[size],
    ...(color != null ? {color} : null),
    ...(weight != null ? {fontWeight: weight} : null),
  };
  return (
    // Screen readers never read bullet soup — the label flips wholesale.
    <span style={style} aria-label={masked ? 'Amount hidden' : display}>
      <span aria-hidden>
        {masked
          ? display.split('').map((ch, index) =>
              /\\d/.test(ch) ? (
                <span key={index} style={DIGIT_CELL}>
                  •
                </span>
              ) : (
                <span key={index}>{ch}</span>
              ),
            )
          : display}
      </span>
    </span>
  );
}

/** Insight stat line: text segments + masked-aware amounts, one clamp. */
function StatLine({segments, masked}: {segments: StatSeg[]; masked: boolean}) {
  return (
    <span style={styles.railStat}>
      {segments.map((seg, index) =>
        'text' in seg ? (
          <span key={index}>{seg.text}</span>
        ) : (
          <MaskableAmount key={index} cents={seg.cents} masked={masked} size="meta13" sign={seg.sign === '+' ? '+' : undefined} />
        ),
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// SPEND RING — 200×200 viewBox donut, r=80, strokeWidth 18, circumference
// 2π·80 ≈ 502.65. Arc length = (categoryTotal / 177,850) × C, computed
// from exact fractions (Bills ≈ 153.16 · Groceries ≈ 137.41 · Dining ≈
// 88.29 · Shopping ≈ 77.20 · Transport ≈ 46.60 — sums to C within float
// rounding). strokeLinecap 'butt' (round caps would corrupt adjacent-arc
// boundaries at 18px stroke). Arcs are pointer garnish (aria-hidden); the
// COMPLIANT path is the 44px chip row rendered by the caller. Inactive
// arcs dim to 0.25 opacity — still ≥ the 3:1 shape floor against the body
// in both schemes for the 46.6px Transport arc (verified on screenshots);
// the chips, not the arcs, are the interaction contract.
// ---------------------------------------------------------------------------

const RING_R = 80;
const RING_C = 2 * Math.PI * RING_R;

interface SpendRingProps {
  activeCategory: CategoryId | null;
  masked: boolean;
  onToggleCategory: (id: CategoryId) => void;
}

function SpendRing({activeCategory, masked, onToggleCategory}: SpendRingProps) {
  const active = activeCategory != null ? CATEGORY_BY_ID[activeCategory] : null;
  let acc = 0;
  const arcs = CATEGORIES.map(cat => {
    const len = (cat.totalCents / SPENT_CENTS) * RING_C;
    const arc = {cat, len, offset: acc};
    acc += len;
    return arc;
  });
  return (
    <div style={styles.ringSection}>
      <div style={styles.ringWrap}>
        {/* Garnish pointer path — aria-hidden; chips below are semantic. */}
        <svg width={200} height={200} viewBox="0 0 200 200" fill="none" aria-hidden>
          {arcs.map(({cat, len, offset}) => (
            <circle
              key={cat.id}
              cx={100}
              cy={100}
              r={RING_R}
              stroke={cat.color}
              strokeWidth={18}
              strokeLinecap="butt"
              strokeDasharray={\`\${len} \${RING_C - len}\`}
              strokeDashoffset={-offset}
              transform="rotate(-90 100 100)"
              className="adb-fade"
              opacity={activeCategory == null || activeCategory === cat.id ? 1 : 0.25}
              style={{cursor: 'pointer', pointerEvents: 'stroke'}}
              onClick={() => onToggleCategory(cat.id)}
            />
          ))}
        </svg>
        <div style={styles.ringCenter}>
          <div style={styles.ringCenterStack}>
            {active == null ? (
              <>
                <span style={styles.ringOverline}>Safe to spend</span>
                <MaskableAmount cents={SAFE_TO_SPEND_CENTS} masked={masked} size="ring28" />
                <span style={styles.ringCaption}>
                  <MaskableAmount cents={BUDGET_CENTS} masked={masked} size="meta13" /> budget
                </span>
              </>
            ) : (
              <>
                <span style={styles.ringOverline}>{active.name}</span>
                <MaskableAmount cents={active.totalCents} masked={masked} size="ring28" />
                <span style={styles.ringCaption}>
                  {active.name} · {active.txCount} transactions
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div style={styles.chipRow}>
        {CATEGORIES.map(cat => {
          const isOn = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className="adb-btn adb-focusable adb-fade"
              aria-pressed={isOn}
              aria-label={\`\${cat.name}, \${masked ? 'amount hidden' : cat.totalDisplay}, filter transactions\`}
              style={{
                ...styles.chip,
                border: \`1.5px solid \${cat.color}\`,
                ...(isOn ? {background: cat.color, color: ON_CAT_TEXT} : null),
              }}
              onClick={() => onToggleCategory(cat.id)}>
              <span style={{...styles.chipDot, background: isOn ? ON_CAT_TEXT : cat.color}} aria-hidden />
              <span style={styles.chipName}>{cat.name}</span>
              <span style={styles.chipAmt}>
                <MaskableAmount cents={cat.totalCents} masked={masked} size="meta13" color={isOn ? ON_CAT_TEXT : undefined} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// INSIGHT PEEK RAIL — full-bleed snap rail (cards 280×148, gap 12,
// scrollPaddingInline 16 → 82px peek at 390 / exactly 24px at 320) + 6
// real dot buttons (8px dots in 44×44 hits). Active dot derives from the
// scroll position; ArrowLeft/ArrowRight page the rail when it has focus.
// ---------------------------------------------------------------------------

interface InsightRailProps {
  masked: boolean;
  reducedMotion: boolean;
  railRef: RefObject<HTMLDivElement | null>;
  onCta: (card: InsightCard) => void;
}

function InsightRail({masked, reducedMotion, railRef, onCta}: InsightRailProps) {
  const [activeDot, setActiveDot] = useState(0);
  const scrollToIndex = useCallback(
    (index: number) => {
      railRef.current?.scrollTo({
        left: index * RAIL_STRIDE,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    },
    [railRef, reducedMotion],
  );
  return (
    <div>
      <div
        ref={railRef}
        style={styles.rail}
        role="group"
        aria-label="Spending insights"
        tabIndex={0}
        className="adb-focusable"
        onScroll={event => {
          const index = Math.round(event.currentTarget.scrollLeft / RAIL_STRIDE);
          setActiveDot(Math.max(0, Math.min(INSIGHTS.length - 1, index)));
        }}
        onKeyDown={event => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            scrollToIndex(Math.min(INSIGHTS.length - 1, activeDot + 1));
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            scrollToIndex(Math.max(0, activeDot - 1));
          }
        }}>
        {INSIGHTS.map(card => {
          const color = card.categoryId != null ? CATEGORY_BY_ID[card.categoryId].color : GREEN_CREDIT;
          return (
            <article key={card.id} style={styles.railCard}>
              <div style={styles.railHead}>
                <span style={{color, display: 'inline-flex'}} aria-hidden>
                  <Icon icon={card.icon} size="md" color="inherit" />
                </span>
                <span style={styles.railHeadline}>{card.headline}</span>
              </div>
              <StatLine segments={card.stat} masked={masked} />
              <button type="button" className="adb-btn adb-focusable" style={styles.railCta} onClick={() => onCta(card)}>
                {card.ctaLabel}
              </button>
            </article>
          );
        })}
      </div>
      <div style={styles.dotRow}>
        {INSIGHTS.map((card, index) => (
          <button
            key={card.id}
            type="button"
            className="adb-btn adb-focusable"
            style={styles.dotBtn}
            aria-label={\`Insight \${index + 1} of \${INSIGHTS.length}: \${card.headline}\`}
            aria-current={index === activeDot}
            onClick={() => scrollToIndex(index)}>
            <span style={{...styles.dot, ...(index === activeDot ? styles.dotActive : null)}} aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useReducer at the root; update(id, patch) is the
// single mutation path for the keyed card records; tab-scoped state
// (activeCategory, visibleCount, moveDraft) lives here so it survives tab
// switches (per-tab persistence law). Overlays close on tab switch; the
// toast dock persists.
// ---------------------------------------------------------------------------

type TabId = 'home' | 'cards' | 'move' | 'more';

interface MoveDraft {
  amountText: string;
  toId: string | null;
  error: string | null;
}

interface ToastState {
  seq: number;
  text: string;
  role: 'polite' | 'status';
  undo: boolean;
}

interface BankState {
  masked: boolean;
  tab: TabId;
  activeCategory: CategoryId | null;
  activeAccountId: string;
  visibleCount: number;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  alertOpen: boolean;
  syncResolved: boolean;
  cardFrozen: Record<string, boolean>;
  moveDraft: MoveDraft;
  toast: ToastState | null;
}

const INITIAL_STATE: BankState = {
  masked: false,
  tab: 'home',
  activeCategory: null,
  activeAccountId: 'acct-checking',
  visibleCount: PAGE_SIZE,
  sheetOpen: false,
  sheetDetent: 'medium',
  alertOpen: false,
  syncResolved: false,
  cardFrozen: {'card-debit-1428': false, 'card-credit-7731': false},
  moveDraft: {amountText: '', toId: null, error: null},
  toast: null,
};

type BankAction =
  | {kind: 'patch'; patch: Partial<BankState>}
  | {kind: 'updateCard'; id: string; patch: {frozen: boolean}}
  | {kind: 'draft'; patch: Partial<MoveDraft>}
  | {kind: 'toast'; text: string; role?: 'polite' | 'status'; undo?: boolean};

function bankReducer(state: BankState, action: BankAction): BankState {
  switch (action.kind) {
    case 'patch':
      return {...state, ...action.patch};
    case 'updateCard':
      return {...state, cardFrozen: {...state.cardFrozen, [action.id]: action.patch.frozen}};
    case 'draft':
      return {...state, moveDraft: {...state.moveDraft, ...action.patch}};
    case 'toast':
      // ONE toast at a time; a new mutation replaces the old. NO
      // auto-dismiss timers — deterministic fixtures forbid racing the
      // reader; it persists until replaced.
      return {
        ...state,
        toast: {
          seq: (state.toast?.seq ?? 0) + 1,
          text: action.text,
          role: action.role ?? 'polite',
          undo: action.undo ?? false,
        },
      };
  }
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

// Focus trap — sheets/alerts trap Tab while open; Escape closes the
// topmost overlay only; focus restores to the opener on every close path.
function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])');
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
// BRAND MARK — 28px alder-leaf glyph, stroke-only currentColor; the
// midrib is a 3-segment rising polyline (the 'insights' sparkline).
// ---------------------------------------------------------------------------

function AlderMark() {
  return (
    <span style={styles.brandMark}>
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
        <path
          d="M9 1.6C4.7 4.1 2.6 8 3.6 12.3 4.9 15.7 7.9 16.6 9 16.6c1.1 0 4.1-.9 5.4-4.3 1-4.3-1.1-8.2-5.4-10.7Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polyline
          points="5.4,12.4 7.9,10.6 10.3,11.2 12.7,7.4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Alderbank banking home. One reducer owns everything; every
// surface (arcs, chips, rail CTAs, pill, eye, switch rows, sheet, alert,
// Move form) dispatches into it.
// ---------------------------------------------------------------------------

const TABS: Array<{id: TabId; label: string; icon: IconComponent}> = [
  {id: 'home', label: 'Home', icon: HomeIcon},
  {id: 'cards', label: 'Cards', icon: CreditCardIcon},
  {id: 'move', label: 'Move', icon: ArrowLeftRightIcon},
  {id: 'more', label: 'More', icon: MoreHorizontalIcon},
];

const CHECKING = ACCOUNT_BY_ID['acct-checking'];

export default function MobileBankingHomeInsightsPage() {
  const [state, dispatch] = useReducer(bankReducer, INITIAL_STATE);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const txSectionRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const alertRef = useRef<HTMLDivElement | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const firstToRowRef = useRef<HTMLButtonElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const alertOpenerRef = useRef<HTMLElement | null>(null);
  const undoDraftRef = useRef<MoveDraft | null>(null);
  const pendingRowFocusRef = useRef<number | null>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollByTabRef = useRef<Record<TabId, number>>({home: 0, cards: 0, move: 0, more: 0});
  const [amountFocused, setAmountFocused] = useState(false);

  const width = useElementWidth(wrapRef);
  const isDesktop = width > 560;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const overlayOpen = state.sheetOpen || state.alertOpen;
  const activeAccount = ACCOUNT_BY_ID[state.activeAccountId];
  const isChecking = state.activeAccountId === 'acct-checking';
  const frozenCount = Object.values(state.cardFrozen).filter(Boolean).length;
  const activeCat = state.activeCategory != null ? CATEGORY_BY_ID[state.activeCategory] : null;

  const announce = useCallback(
    (text: string, role: 'polite' | 'status' = 'polite', undo = false) => {
      dispatch({kind: 'toast', text, role, undo});
    },
    [],
  );

  // The demo's .preview-wrap owns scroll — find the nearest scrollable
  // ancestor for per-tab scroll persistence and re-tap-to-top.
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

  const scrollRailTo = useCallback(
    (index: number) => {
      railRef.current?.scrollTo({left: index * RAIL_STRIDE, behavior: reducedMotion ? 'auto' : 'smooth'});
    },
    [reducedMotion],
  );

  // SIGNATURE — one dispatch, five consequences (arc/chip state, filtered
  // list + Clear pill, rail scroll, ring center swap, toast announcement).
  const applyCategory = useCallback(
    (next: CategoryId | null) => {
      dispatch({kind: 'patch', patch: {activeCategory: next}});
      if (next != null) {
        const cat = CATEGORY_BY_ID[next];
        scrollRailTo(RAIL_INDEX[next]);
        announce(\`\${cat.txCount} \${cat.name.toLowerCase()} transactions, \${cat.totalDisplay} this month\`);
      } else {
        announce(\`Filter cleared · all \${TXN_TOTAL} transactions\`);
      }
    },
    [announce, scrollRailTo],
  );

  const toggleCategory = useCallback(
    (id: CategoryId) => {
      applyCategory(state.activeCategory === id ? null : id);
    },
    [applyCategory, state.activeCategory],
  );

  const handleInsightCta = useCallback(
    (card: InsightCard) => {
      if (card.categoryId == null) {
        // 'View credit' — clear the filter and scroll the ledger (whose
        // first row IS the Jul 27 credit) into view.
        dispatch({kind: 'patch', patch: {activeCategory: null}});
        txSectionRef.current?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'});
        announce('Showing all transactions · the Jul 27 credit is at the top');
      } else {
        applyCategory(card.categoryId);
      }
    },
    [announce, applyCategory, reducedMotion],
  );

  const toggleMask = useCallback(() => {
    const next = !state.masked;
    dispatch({kind: 'patch', patch: {masked: next}});
    announce(next ? 'Balances hidden' : 'Balances shown');
  }, [announce, state.masked]);

  // Refresh is an explicit navBar button (pull-to-refresh is banned).
  // It also resolves the Shared Household skeletons — user-driven
  // appearance AND resolution, no timers.
  const refresh = useCallback(() => {
    if (state.activeAccountId === 'acct-shared' && !state.syncResolved) {
      dispatch({kind: 'patch', patch: {syncResolved: true}});
    }
    announce('Updated just now', 'status');
  }, [announce, state.activeAccountId, state.syncResolved]);

  const switchTab = useCallback(
    (next: TabId) => {
      const scroller = getScroller();
      if (next === state.tab) {
        // The one legal reset: re-tapping the active tab scrolls to top.
        scroller?.scrollTo({top: 0, behavior: reducedMotion ? 'auto' : 'smooth'});
        return;
      }
      if (scroller != null) {
        scrollByTabRef.current[state.tab] = scroller.scrollTop;
      }
      // Overlays close on tab switch; the toast dock persists.
      dispatch({kind: 'patch', patch: {tab: next, sheetOpen: false, alertOpen: false}});
    },
    [getScroller, reducedMotion, state.tab],
  );

  // Per-tab scroll restore (persistence law: tabs never reset).
  useEffect(() => {
    const scroller = getScroller();
    if (scroller != null) {
      scroller.scrollTop = scrollByTabRef.current[state.tab] ?? 0;
    }
  }, [getScroller, state.tab]);

  const openSheet = useCallback((opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    dispatch({kind: 'patch', patch: {sheetOpen: true, sheetDetent: 'medium'}});
  }, []);

  const closeSheet = useCallback(() => {
    dispatch({kind: 'patch', patch: {sheetOpen: false}});
    sheetOpenerRef.current?.focus({preventScroll: true});
  }, []);

  const selectAccount = useCallback(
    (id: string) => {
      dispatch({kind: 'patch', patch: {activeAccountId: id, sheetOpen: false}});
      if (id === 'acct-shared' && !state.syncResolved) {
        // 'Loading' announces ONCE through the one polite region.
        announce('Loading');
      }
      sheetOpenerRef.current?.focus({preventScroll: true});
    },
    [announce, state.syncResolved],
  );

  const openAlert = useCallback((opener: HTMLElement) => {
    alertOpenerRef.current = opener;
    dispatch({kind: 'patch', patch: {alertOpen: true}});
  }, []);

  const closeAlert = useCallback(() => {
    dispatch({kind: 'patch', patch: {alertOpen: false}});
    alertOpenerRef.current?.focus({preventScroll: true});
  }, []);

  // Focus enters overlays via focus({preventScroll: true}) — a plain
  // .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen (amendment).
  useEffect(() => {
    if (state.sheetOpen) {
      sheetRef.current?.querySelector<HTMLElement>('button')?.focus({preventScroll: true});
    }
  }, [state.sheetOpen]);
  useEffect(() => {
    if (state.alertOpen) {
      cancelBtnRef.current?.focus({preventScroll: true});
    }
  }, [state.alertOpen]);

  // ESCAPE LADDER — topmost overlay only: alert > sheet > filter-clear.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const target = event.target as HTMLElement | null;
      if (target != null && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (state.alertOpen) {
        closeAlert();
      } else if (state.sheetOpen) {
        closeSheet();
      } else if (state.tab === 'home' && state.activeCategory != null) {
        applyCategory(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [applyCategory, closeAlert, closeSheet, state.activeCategory, state.alertOpen, state.sheetOpen, state.tab]);

  // Ledger selection — the credit row is category 'adjustments' so any
  // category filter excludes it (ring total ≠ list total by exactly
  // 1,200¢, deliberately).
  const filteredRows = useMemo(
    () => (state.activeCategory != null ? TXNS.filter(txn => txn.categoryId === state.activeCategory) : TXNS),
    [state.activeCategory],
  );
  const visibleRows = state.activeCategory != null ? filteredRows : filteredRows.slice(0, state.visibleCount);

  const loadMore = useCallback(() => {
    const add = Math.min(PAGE_SIZE, TXN_TOTAL - state.visibleCount);
    pendingRowFocusRef.current = state.visibleCount;
    dispatch({kind: 'patch', patch: {visibleCount: state.visibleCount + add}});
    announce(\`\${add} more loaded\`);
  }, [announce, state.visibleCount]);

  // Focus moves to the first newly appended row (listExtras contract).
  useEffect(() => {
    const index = pendingRowFocusRef.current;
    if (index != null) {
      pendingRowFocusRef.current = null;
      rowRefs.current[index]?.focus();
    }
  }, [state.visibleCount]);

  const toggleCard = useCallback(
    (card: BankCard) => {
      const next = !state.cardFrozen[card.id];
      // Reversible — switches toggle, never ask (undoOverConfirm).
      dispatch({kind: 'updateCard', id: card.id, patch: {frozen: next}});
      announce(next ? \`\${card.name} \${card.last4} locked\` : \`\${card.name} \${card.last4} unlocked\`);
    },
    [announce, state.cardFrozen],
  );

  // MOVE — validation fires on blur, never per keystroke; the error
  // clears the moment the value becomes valid while typing.
  const validateAmount = useCallback((text: string): string | null => {
    const cents = parseAmount(text);
    if (cents == null) return 'Enter a valid amount';
    if (cents > CHECKING.balanceCents) return \`Enter an amount up to \${CHECKING.balanceDisplay}\`;
    return null;
  }, []);

  const submitTransfer = useCallback(() => {
    // The sticky-footer submit stays ENABLED; pressing it validates and
    // focuses the first invalid field (disabled-mute submits are banned).
    const error = validateAmount(state.moveDraft.amountText);
    if (error != null) {
      dispatch({kind: 'draft', patch: {error}});
      amountInputRef.current?.focus();
      return;
    }
    if (state.moveDraft.toId == null) {
      announce('Choose a destination account');
      firstToRowRef.current?.focus();
      return;
    }
    const cents = parseAmount(state.moveDraft.amountText) ?? 0;
    undoDraftRef.current = state.moveDraft;
    dispatch({kind: 'draft', patch: {amountText: '', toId: null, error: null}});
    announce(\`Transfer scheduled · \${fmtMoney(cents)} to \${ACCOUNT_BY_ID[state.moveDraft.toId].name}\`, 'polite', true);
  }, [announce, state.moveDraft, validateAmount]);

  const undoTransfer = useCallback(() => {
    const prev = undoDraftRef.current;
    if (prev != null) {
      undoDraftRef.current = null;
      dispatch({kind: 'draft', patch: prev});
      announce('Transfer draft restored');
    }
  }, [announce]);

  // -------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------

  const renderSideRows = (rows: SideRow[], terminal: string) => (
    <>
      <div style={styles.listCard}>
        {rows.map((row, index) => (
          <div key={row.id}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <div style={styles.txRow}>
              <div style={styles.txText}>
                <span style={styles.txPrimary}>{row.title}</span>
                <span style={styles.txSecondary}>{row.meta}</span>
              </div>
              <MaskableAmount
                cents={row.cents}
                masked={state.masked}
                size="row16"
                sign={row.kind === 'credit' ? '+' : '−'}
                color={row.kind === 'credit' ? GREEN_CREDIT : undefined}
              />
            </div>
          </div>
        ))}
      </div>
      <p style={styles.terminalCaption}>{terminal}</p>
    </>
  );

  const renderHome = () => (
    <>
      {/* BALANCE HERO */}
      <div style={styles.hero}>
        <button
          type="button"
          className="adb-btn adb-focusable"
          style={styles.heroOverlineBtn}
          aria-expanded={state.sheetOpen}
          aria-label={\`\${activeAccount.name} \${activeAccount.last4}, switch account\`}
          onClick={event => openSheet(event.currentTarget)}>
          <span style={styles.heroOverline}>
            {activeAccount.name} {activeAccount.last4}
          </span>
          <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
        </button>
        <MaskableAmount cents={activeAccount.balanceCents} masked={state.masked} size="hero40" />
        <span style={styles.heroCaption}>Available now · Updated just now</span>
        {frozenCount > 0 ? (
          <span style={styles.lockedPill}>
            <Icon icon={LockIcon} size="xsm" color="inherit" />
            {frozenCount} card{frozenCount > 1 ? 's' : ''} locked
          </span>
        ) : null}
      </div>

      {isChecking ? (
        <>
          {/* JULY SPENDING — ring + chips */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeader}>July spending</h2>
            <span style={styles.sectionCaption}>
              <MaskableAmount cents={SPENT_CENTS} masked={state.masked} size="meta13" /> of{' '}
              <MaskableAmount cents={BUDGET_CENTS} masked={state.masked} size="meta13" />
            </span>
          </div>
          <SpendRing activeCategory={state.activeCategory} masked={state.masked} onToggleCategory={toggleCategory} />

          {/* INSIGHTS — peek rail + dots */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeader}>Insights</h2>
            <span style={styles.sectionCaption}>6 this month</span>
          </div>
          <InsightRail masked={state.masked} reducedMotion={reducedMotion} railRef={railRef} onCta={handleInsightCta} />

          {/* JULY ACTIVITY — filter pill + inset-grouped ledger */}
          <div style={styles.sectionHeaderRow} ref={txSectionRef}>
            <h2 style={styles.sectionHeader}>July activity</h2>
            <span style={styles.sectionCaption}>
              {activeCat != null ? \`\${activeCat.txCount} \${activeCat.name.toLowerCase()}\` : \`\${TXN_TOTAL} transactions\`}
            </span>
          </div>
          {activeCat != null ? (
            <div style={styles.filterPillRow}>
              <button
                type="button"
                className="adb-btn adb-focusable"
                style={styles.filterPill}
                aria-label={\`Showing \${activeCat.name}, \${activeCat.txCount} transactions — clear filter\`}
                onClick={() => applyCategory(null)}>
                Showing {activeCat.name} · {activeCat.txCount}
                <Icon icon={XIcon} size="sm" color="inherit" />
                Clear
              </button>
            </div>
          ) : null}
          <div style={styles.listCard}>
            {visibleRows.map((txn, index) => (
              <div key={txn.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                {/* Ledger rows carry no verb — divs with tabIndex −1 so
                    load-more can move focus, not lying <button>s. */}
                <div
                  style={styles.txRow}
                  tabIndex={-1}
                  className="adb-focusable"
                  ref={el => {
                    rowRefs.current[index] = el;
                  }}>
                  <div style={styles.txText}>
                    <span style={styles.txPrimary}>{txn.merchant}</span>
                    <span style={styles.txSecondary}>
                      {txn.dateLabel} · {txn.categoryId === 'adjustments' ? 'Adjustment' : CATEGORY_BY_ID[txn.categoryId].name}
                    </span>
                  </div>
                  <MaskableAmount
                    cents={txn.cents}
                    masked={state.masked}
                    size="row16"
                    sign={txn.kind === 'credit' ? '+' : '−'}
                    color={txn.kind === 'credit' ? GREEN_CREDIT : undefined}
                  />
                </div>
              </div>
            ))}
            {activeCat == null && state.visibleCount < TXN_TOTAL ? (
              <>
                <div style={styles.rowDivider} />
                <button type="button" className="adb-btn adb-focusable" style={styles.loadMoreRow} onClick={loadMore}>
                  Show {Math.min(PAGE_SIZE, TXN_TOTAL - state.visibleCount)} more
                </button>
              </>
            ) : null}
          </div>
          {activeCat != null ? (
            <p style={styles.terminalCaption}>
              All {activeCat.txCount} {activeCat.name.toLowerCase()} transactions
            </p>
          ) : state.visibleCount >= TXN_TOTAL ? (
            <p style={styles.terminalCaption}>All {TXN_TOTAL} transactions</p>
          ) : null}
        </>
      ) : (
        <>
          {/* Non-checking accounts collapse insights to a 60px note. */}
          <div style={styles.noteCard}>
            <span style={styles.noteText}>Spending insights track Everyday Checking</span>
            <button
              type="button"
              className="adb-btn adb-focusable"
              style={styles.secondaryBtn36}
              onClick={() => dispatch({kind: 'patch', patch: {activeAccountId: 'acct-checking'}})}>
              Switch back
            </button>
          </div>
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeader}>July activity</h2>
          </div>
          {state.activeAccountId === 'acct-shared' ? (
            state.syncResolved ? (
              renderSideRows(SHARED_ROWS, 'All 3 transactions')
            ) : (
              // 4 skeletonRows at exact 60px row geometry (zero shift on
              // resolve); resolution is the navBar Refresh press.
              <div style={styles.listCard} aria-busy="true">
                {SKELETON_WIDTHS.map((widths, index) => (
                  <div key={index}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.skeletonRow} aria-hidden>
                      <div style={styles.skelText}>
                        <div style={{...styles.skelBar, width: widths.primary}}>
                          <span className="adb-shimmer" />
                        </div>
                        <div style={{...styles.skelBar, width: widths.secondary}}>
                          <span className="adb-shimmer" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : state.activeAccountId === 'acct-hysave' ? (
            renderSideRows(HYSAVE_ROWS, 'All 2 transactions')
          ) : (
            // Travel Vault true-empty (emptyAndSkeleton anatomy verbatim).
            <div style={styles.emptyState}>
              <span style={styles.emptyCircle}>
                <Icon icon={PlaneIcon} size="lg" color="inherit" />
              </span>
              <h3 style={styles.emptyTitle}>No activity yet</h3>
              <p style={styles.emptyBody}>Transfers you make appear here.</p>
              <button type="button" className="adb-btn adb-focusable" style={styles.secondaryBtn36} onClick={() => switchTab('move')}>
                Make a transfer
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  const renderCards = () => (
    <>
      <div style={styles.sectionHeaderRow}>
        <h2 style={styles.sectionHeader}>Your cards</h2>
        <span style={styles.sectionCaption}>{BANK_CARDS.length} cards</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {BANK_CARDS.map(card => {
          const frozen = state.cardFrozen[card.id] === true;
          return (
            <div key={card.id} style={styles.cardTile}>
              <div style={{position: 'relative'}}>
                <div style={{...styles.cardArt, opacity: frozen ? 0.4 : 1}} className="adb-fade">
                  <span style={styles.cardArtName}>{card.name}</span>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                    <span style={styles.cardArtNumber}>{card.last4}</span>
                    <span style={styles.cardArtExp}>Exp {card.exp}</span>
                  </div>
                </div>
                {frozen ? (
                  <span style={styles.lockedBadge}>
                    <Icon icon={LockIcon} size="xsm" color="inherit" />
                    Locked
                  </span>
                ) : null}
              </div>
              {card.kind === 'credit' && card.balanceCents != null && card.availableCents != null && card.limitCents != null ? (
                <>
                  <div style={styles.utilityRow}>
                    <span style={styles.utilityLabel}>Balance</span>
                    <MaskableAmount cents={card.balanceCents} masked={state.masked} size="row16" />
                  </div>
                  <div style={styles.rowDivider} />
                  <div style={styles.utilityRow}>
                    <span style={styles.utilityLabel}>Available</span>
                    <span style={styles.utilityValue}>
                      <MaskableAmount cents={card.availableCents} masked={state.masked} size="row16" /> of{' '}
                      <MaskableAmount cents={card.limitCents} masked={state.masked} size="meta13" />
                    </span>
                  </div>
                </>
              ) : (
                <div style={styles.utilityRow}>
                  <span style={styles.utilityLabel}>Linked account</span>
                  <span style={styles.utilityValue}>{card.linkedTo}</span>
                </div>
              )}
              <div style={styles.rowDivider} />
              {/* Whole 44px row is the switch (inputControls contract). */}
              <button
                type="button"
                role="switch"
                aria-checked={frozen}
                className="adb-btn adb-focusable"
                style={styles.utilityRow}
                onClick={() => toggleCard(card)}>
                <span style={styles.utilityLabel}>Lock card</span>
                <span style={{...styles.switchTrack, ...(frozen ? styles.switchTrackOn : null)}} aria-hidden>
                  <span className="adb-move" style={{...styles.switchThumb, ...(frozen ? styles.switchThumbOn : null)}} />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderMove = () => {
    const draft = state.moveDraft;
    const destinations = ACCOUNTS.filter(acct => acct.id !== 'acct-checking');
    return (
      <>
        <div style={styles.sectionHeaderRow}>
          <h2 style={styles.sectionHeader}>Move money</h2>
        </div>
        <div style={styles.listCard}>
          <div style={styles.txRow}>
            <div style={styles.txText}>
              <span style={styles.txPrimary}>From · Everyday Checking ••1428</span>
              <span style={styles.txSecondary}>
                Available · <MaskableAmount cents={CHECKING.balanceCents} masked={state.masked} size="meta13" />
              </span>
            </div>
          </div>
        </div>
        <div style={styles.sectionHeaderRow}>
          <h2 style={styles.sectionHeader}>To</h2>
        </div>
        <div style={styles.listCard} role="radiogroup" aria-label="Destination account">
          {destinations.map((acct, index) => {
            const isOn = draft.toId === acct.id;
            return (
              <div key={acct.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <button
                  type="button"
                  role="radio"
                  aria-checked={isOn}
                  ref={index === 0 ? firstToRowRef : undefined}
                  className="adb-btn adb-focusable"
                  style={styles.utilityRow}
                  onClick={() => dispatch({kind: 'draft', patch: {toId: acct.id}})}>
                  <span style={{...styles.radioCircle, ...(isOn ? styles.radioCircleOn : null)}} aria-hidden>
                    {isOn ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
                  </span>
                  <span style={styles.utilityLabel}>
                    {acct.name} {acct.last4}
                  </span>
                  <MaskableAmount cents={acct.balanceCents} masked={state.masked} size="meta13" />
                </button>
              </div>
            );
          })}
        </div>
        <div style={styles.formField}>
          <label style={styles.fieldLabel} htmlFor="adb-move-amount">
            Amount
          </label>
          <input
            id="adb-move-amount"
            ref={amountInputRef}
            type="text"
            inputMode="decimal"
            placeholder="$0.00"
            value={draft.amountText}
            aria-invalid={draft.error != null}
            aria-describedby={draft.error != null ? 'adb-move-amount-error' : undefined}
            style={{
              ...styles.fieldInput,
              ...(draft.error != null ? styles.fieldInputError : amountFocused ? styles.fieldInputFocus : null),
            }}
            onFocus={() => setAmountFocused(true)}
            onBlur={() => {
              setAmountFocused(false);
              if (draft.amountText !== '') {
                dispatch({kind: 'draft', patch: {error: validateAmount(draft.amountText)}});
              }
            }}
            onChange={event => {
              const amountText = event.target.value;
              // Reward the fix immediately: error clears while typing the
              // moment the value becomes valid (never validate-on-keystroke).
              dispatch({
                kind: 'draft',
                patch: {
                  amountText,
                  ...(draft.error != null && validateAmount(amountText) == null ? {error: null} : null),
                },
              });
            }}
          />
          {draft.error != null ? (
            <span id="adb-move-amount-error" style={styles.fieldError}>
              <Icon icon={AlertCircleIcon} size="sm" color="inherit" />
              {draft.error}
            </span>
          ) : null}
        </div>
        <div style={styles.quickChipRow}>
          {QUICK_AMOUNTS.map(quick => (
            <button
              key={quick.cents}
              type="button"
              className="adb-btn adb-focusable"
              style={styles.quickChip}
              onClick={() => dispatch({kind: 'draft', patch: {amountText: (quick.cents / 100).toFixed(2), error: null}})}>
              {quick.label}
            </button>
          ))}
        </div>
        <div style={{height: 24}} />
        <div style={styles.moveFooter}>
          <button type="button" className="adb-btn adb-focusable" style={styles.primaryBtn48} onClick={submitTransfer}>
            Review transfer
          </button>
        </div>
      </>
    );
  };

  const renderMore = () => (
    <>
      <div style={styles.sectionHeaderRow}>
        <h2 style={styles.sectionHeader}>Settings</h2>
      </div>
      <div style={styles.listCard}>
        {/* Privacy mode reads/writes the SAME masked flag as the navBar
            eye — the cross-surface proof. */}
        <button
          type="button"
          role="switch"
          aria-checked={state.masked}
          className="adb-btn adb-focusable"
          style={styles.utilityRow}
          onClick={toggleMask}>
          <span style={styles.utilityLabel}>Privacy mode</span>
          <span style={{...styles.switchTrack, ...(state.masked ? styles.switchTrackOn : null)}} aria-hidden>
            <span className="adb-move" style={{...styles.switchThumb, ...(state.masked ? styles.switchThumbOn : null)}} />
          </span>
        </button>
        <div style={styles.rowDivider} />
        <button
          type="button"
          className="adb-btn adb-focusable"
          style={styles.utilityRow}
          aria-label={\`Default account, \${activeAccount.name}\`}
          onClick={event => openSheet(event.currentTarget)}>
          <span style={styles.utilityLabel}>Default account</span>
          <span style={styles.utilityValue}>
            {activeAccount.name}
            <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
          </span>
        </button>
        <div style={styles.rowDivider} />
        <button
          type="button"
          className="adb-btn adb-focusable"
          style={styles.utilityRow}
          onClick={event => openAlert(event.currentTarget)}>
          <span style={styles.signOutText}>Sign out</span>
        </button>
      </div>
      <p style={styles.terminalCaption}>Alderbank · Member FDIC · App 4.19.2</p>
    </>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{ALDERBANK_CSS}</style>
      <div
        ref={shellRef}
        style={{
          ...styles.shell,
          ...(overlayOpen ? styles.shellLocked : null),
          ...(isDesktop ? styles.shellDesktop : null),
        }}>
        <h1 className="adb-vh">Alderbank home</h1>

        {/* NAV BAR */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="adb-btn adb-focusable"
              style={styles.brandBtn}
              aria-label="Alderbank — open More"
              onClick={() => switchTab('more')}>
              <AlderMark />
            </button>
          </div>
          <span style={styles.navTitle}>Alderbank</span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="adb-btn adb-focusable"
              style={styles.iconBtn}
              aria-pressed={state.masked}
              aria-label={state.masked ? 'Show balances' : 'Hide balances'}
              onClick={toggleMask}>
              <Icon icon={state.masked ? EyeOffIcon : EyeIcon} size="md" color="inherit" />
            </button>
            <button type="button" className="adb-btn adb-focusable" style={styles.iconBtn} aria-label="Refresh" onClick={refresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'home' ? renderHome() : state.tab === 'cards' ? renderCards() : state.tab === 'move' ? renderMove() : renderMore()}
          <div style={{height: 24}} />
        </main>

        {/* TOAST DOCK — the ONE polite live region; sticky-in-flow so it
            pins above the tabBar even mid-scroll (156 on Move to clear
            its sticky footer). Persists across tab switches. */}
        <div style={{...styles.toastAnchor, bottom: state.tab === 'move' ? 156 : 76}} aria-live="polite">
          {state.toast != null ? (
            <div style={styles.toast} role={state.toast.role === 'status' ? 'status' : undefined}>
              <span style={styles.toastText}>{state.toast.text}</span>
              {state.toast.undo ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="adb-btn adb-focusable" style={styles.toastUndo} onClick={undoTransfer}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* TAB BAR */}
        <nav style={styles.tabBar} aria-label="Alderbank sections">
          {TABS.map(tab => {
            const isActive = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className="adb-btn adb-focusable"
                style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => switchTab(tab.id)}>
                <Icon icon={tab.icon} size="lg" color="inherit" />
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ACCOUNT SHEET — medium 55% / large calc(100% − 56px). */}
        {state.sheetOpen ? (
          <>
            <div style={styles.sheetScrim} className="adb-fade" onClick={closeSheet} aria-hidden />
            <div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Accounts"
              className="adb-sheet-in"
              style={{...styles.sheet, height: state.sheetDetent === 'medium' ? '55%' : 'calc(100% - 56px)'}}
              onKeyDown={event => trapTabKey(event, sheetRef.current)}>
              <button
                type="button"
                className="adb-btn adb-focusable"
                style={styles.grabberZone}
                aria-label="Resize sheet"
                onClick={() =>
                  dispatch({kind: 'patch', patch: {sheetDetent: state.sheetDetent === 'medium' ? 'large' : 'medium'}})
                }>
                <span style={styles.grabberPill} aria-hidden />
              </button>
              <div style={styles.sheetHeader}>
                <span />
                <h2 style={styles.sheetTitle}>Accounts</h2>
                <button type="button" className="adb-btn adb-focusable" style={styles.iconBtn} aria-label="Close accounts" onClick={closeSheet}>
                  <Icon icon={XIcon} size="md" color="inherit" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                {ACCOUNTS.map((acct, index) => {
                  const isActive = acct.id === state.activeAccountId;
                  return (
                    <div key={acct.id}>
                      {index > 0 ? <div style={styles.rowDividerSheet} /> : null}
                      <button
                        type="button"
                        className="adb-btn adb-focusable"
                        style={styles.acctRow}
                        aria-label={\`\${acct.name} \${acct.last4}, \${state.masked ? 'amount hidden' : acct.balanceDisplay}\${isActive ? ', selected' : ''}\`}
                        onClick={() => selectAccount(acct.id)}>
                        <span style={styles.acctIcon} aria-hidden>
                          <Icon icon={acct.icon} size="md" color="inherit" />
                        </span>
                        <span style={styles.acctText}>
                          <span style={styles.acctName}>{acct.name}</span>
                          <span style={styles.acctMeta}>
                            {acct.last4}
                            {acct.id === 'acct-shared' && !state.syncResolved ? ' · Syncing…' : ''}
                          </span>
                        </span>
                        <MaskableAmount cents={acct.balanceCents} masked={state.masked} size="row16" />
                        <span style={{...styles.acctCheck, visibility: isActive ? 'visible' : 'hidden'}} aria-hidden>
                          <Icon icon={CheckIcon} size="sm" color="inherit" />
                        </span>
                      </button>
                    </div>
                  );
                })}
                <div style={styles.sheetFooterCaption}>
                  Total across {ACCOUNTS.length} accounts ·{' '}
                  <MaskableAmount cents={TOTAL_ACROSS_CENTS} masked={state.masked} size="meta13" />
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* SIGN-OUT ALERT — blocking choice; scrim click does NOT dismiss. */}
        {state.alertOpen ? (
          <>
            <div style={styles.alertScrim} className="adb-fade" aria-hidden />
            <div
              ref={alertRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="adb-alert-title"
              aria-describedby="adb-alert-body"
              style={styles.alert}
              className="adb-fade"
              onKeyDown={event => trapTabKey(event, alertRef.current)}>
              <div style={styles.alertBody}>
                <h2 id="adb-alert-title" style={styles.alertTitle}>
                  Sign out?
                </h2>
                <p id="adb-alert-body" style={styles.alertText}>
                  You&apos;ll need your passcode to sign back in.
                </p>
              </div>
              <div style={styles.alertBtnRow}>
                <button
                  type="button"
                  ref={cancelBtnRef}
                  className="adb-btn adb-focusable"
                  style={{...styles.alertBtn, fontWeight: 400}}
                  onClick={closeAlert}>
                  Cancel
                </button>
                <span style={styles.alertBtnRule} aria-hidden />
                <button
                  type="button"
                  className="adb-btn adb-focusable"
                  style={{...styles.alertBtn, fontWeight: 600, color: 'var(--color-error)'}}
                  onClick={() => {
                    dispatch({kind: 'patch', patch: {alertOpen: false}});
                    announce('Signed out of Alderbank');
                    alertOpenerRef.current?.focus({preventScroll: true});
                  }}>
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