var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Curbit parking session for
 *   sess_01 in Zone D · Meridian Ave, frozen at NOW_MIN 852 ('2:12 PM'):
 *   session started 1:15 PM (795), paid through 2:45 PM (885, 90 paid
 *   minutes, $3.00 charged), zone cap 3 h (max end 4:15 PM); two vehicles
 *   (Blue Fit active, the long-named camper van as the truncation stress);
 *   four weekly receipts summing to exactly $11.25 (300+450+250+125 ¢);
 *   a two-tier rate table ($2.00/hr to 120 min, $3.00/hr to 180). No
 *   Date.now(), no Math.random(), no network media.
 * @output Curbit — Parking Session: a 390px MOBILE meter surface. NavBar
 *   (Curbit meter mark · ZONE D pill · Help) over a 220px radial
 *   sessionDial hero (270° gauge: elapsed arc, paid-until tick at 12
 *   o'clock, red zone-max tick at +135°), a 44px statusStrip, a
 *   municipal-signage zoneRateCard with a live NOW tier pill, a 72px
 *   vehicle row with an anchored change menu, four swipeable 60px receipt
 *   rows (72px Email block + mandatory 44×44 ellipsis fallback), and a
 *   sticky End/Extend footer. Signature move: the medium-detent extend
 *   sheet writes ONE pendingMinutes value that simultaneously draws a
 *   dashed ghost arc on the dial (visible above the 55% sheet), recomputes
 *   the tiered price breakdown, flags the rate card's tier-2 row PREVIEW,
 *   enforces the 3 h cap, and rewrites the confirm button to
 *   'Extend to 3:45 PM · $2.50'. Confirming commits the arc, appends a
 *   receipt, bumps the weekly total to $13.75, and announces via the one
 *   aria-live toast.
 * @position Page template; emitted by \`astryx template mobile-parking-session\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheets, menus, toast) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While a
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close. The stage clips to --radius-container; shell
 *   paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Curbit teal — the demo's --color-brand is the demo
 *   logo blue, so the spec hex is quarantined here per house rule); the
 *   two sanctioned non-brand literals are the zone-max/error red pair and
 *   the capNotice amber pair, each with contrast math at the declaration.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter ·
 *   12px card gaps · 24px section gaps · 8px chip gaps; navBar 52px
 *   sticky top z20 (paddingInline 8, grid '1fr auto 1fr'); statusStrip
 *   44px; rows 44px utility / 60px two-line receipt / 72px vehicle media
 *   (48px thumb, 12px radius); sectionHeader 13px/600 uppercase 0.06em at
 *   32px (16 gutter + 16 card pad), 20px top / 8px bottom; sticky
 *   actionFooter 16px padding, 48px buttons; sheet detents 55% medium /
 *   calc(100% − 56px) large, 24px grabber zone with 36×5 pill, 52px sheet
 *   header; toast absolute insetInline 16 bottom 96 z45. TYPE (Figtree via
 *   --font-family-body): 34/700 dial numeral (the one sanctioned
 *   oversize) · 22/700 stepper readout · 17/600 nav+sheet titles ·
 *   16/400–600 body · 13/400 secondary · 11/500 overlines+badges; nothing
 *   under 11px; tabular-nums on every updating numeral. Touch: every
 *   target ≥44×44 with ≥8px clearance or merged into a full-row button;
 *   every gesture (swipe-reveal, sheet drag) has a visible button path
 *   (44×44 ellipsis per row, clickable grabber + X).
 *
 * Responsive contract:
 * - Fluid 320–430px: dial fixed 220px centered; statusStrip cells flex 1
 *   min-width 0 ellipsis; preset buttons flex 1; receipt amounts never
 *   wrap (primary line ellipsizes). overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell becomes
 *   a centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline); sticky navBar/footer and absolute sheets stay inside the
 *   column because they anchor to shell. No adaptive relayout — the
 *   dial-hero anatomy is deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject} from 'react';

import {
  CarFrontIcon,
  CaravanIcon,
  CheckIcon,
  CircleHelpIcon,
  FlagIcon,
  MailIcon,
  MinusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Curbit teal). #0B7285 on #FFFFFF ≈ 5.6:1
// (WCAG, passes 4.5:1); #66C7DA on the dark card (~#1C1C1E) ≈ 8.8:1.
const BRAND_ACCENT = 'light-dark(#0B7285, #66C7DA)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #0B7285 ≈ 5.6:1. Dark:
// white on #66C7DA fails (~1.9:1), so the dark side flips to a near-black
// teal — #0E2A31 on #66C7DA ≈ 7.7:1. (Spec said "white label on brand
// fill"; deviation for dark-scheme contrast, math above.)
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #0E2A31)';
// Brand-tinted washes (12% active-tier pill / zone block, 45% ghost arc).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
const BRAND_GHOST_45 = \`color-mix(in srgb, \${BRAND_ACCENT} 45%, transparent)\`;
// Zone-max tick + destructive fills. #C92A2A on white ≈ 5.5:1; #FF8787 on
// the dark card ≈ 7.4:1 — both pass 4.5:1 for the 11px 'MAX' label.
const ERROR_STRONG = 'light-dark(#C92A2A, #FF8787)';
// Text over an ERROR_STRONG fill: #FFFFFF on #C92A2A ≈ 5.5:1; #300808 on
// #FF8787 ≈ 7.8:1.
const ERROR_FILL_TEXT = 'light-dark(#FFFFFF, #300808)';
// capNotice amber for 13px warning text: #9A6700 on the white card ≈
// 4.9:1; #E8B93C on the dark card ≈ 9.3:1 — both clear 4.5:1.
const CAP_AMBER = 'light-dark(#9A6700, #E8B93C)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the button reset, the visually-hidden h1, and the
// reduced-motion guard. Transitions animate transform/opacity only and
// collapse to instant under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const CURBIT_CSS = \`
.cbt-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.cbt-btn:disabled { cursor: default; }
.cbt-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.cbt-anim { transition: transform 240ms ease, opacity 240ms ease; }
.cbt-fade { transition: opacity 240ms ease; }
@keyframes cbt-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.cbt-sheet-in { animation: cbt-sheet-in 240ms ease; }
.cbt-vh {
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
  .cbt-anim, .cbt-fade { transition: none; }
  .cbt-sheet-in { animation: none; }
}
\`;

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
  // Scroll lock while a sheet is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px icon buttons
  // optically align content to the 16px gutter. Hairline + blur ALWAYS ON
  // (this template does not wire scroll-under; noted per contract).
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
  // 44×44 non-button brand slot holding the 28px Curbit meter mark.
  brandSlot: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  // zoneBadge — 28px pill inside a 44px-tall hit area.
  zoneBadgeHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 999,
  },
  zoneBadge: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    whiteSpace: 'nowrap',
  },
  zoneBadgeZone: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: BRAND_ACCENT,
  },
  zoneBadgeStreet: {fontSize: 13, fontWeight: 500},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // DIAL HERO — 24px top padding, 220×220 dial, statusStrip 12px below,
  // 24px bottom margin.
  dialHero: {
    paddingTop: 24,
    paddingInline: 16,
    marginBottom: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  dialWrap: {position: 'relative', width: 220, height: 220},
  dialCenter: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  dialCenterStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    textAlign: 'center',
  },
  // 34px/700 — the one sanctioned oversize numeral; tabular so '0:33' →
  // '1:33' never shifts the caption (stress fixture 6).
  dialNumeral: {
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  dialCaption: {fontSize: 13, color: 'var(--color-text-secondary)'},
  dialCaptionPreview: {fontSize: 13, fontWeight: 600, color: BRAND_ACCENT},
  // 44px statusStrip — three flex-1 cells, min-width 0, ellipsis.
  statusStrip: {
    display: 'flex',
    width: '100%',
    height: 44,
    gap: 8,
  },
  statusCell: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    textAlign: 'center',
  },
  overline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
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
    fontVariantNumeric: 'tabular-nums',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // ZONE RATE CARD — posted-sign metaphor.
  rateHeader: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  zoneBlock: {
    width: 40,
    height: 40,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 22,
    fontWeight: 800,
  },
  rateHeaderText: {minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  rateHeaderTitle: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rateHeaderSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tierRow: {
    position: 'relative',
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  // Active-tier treatment: 8px-radius brand-tint pill inset 4px from the
  // card edges, painted behind the row content.
  tierActivePill: {
    position: 'absolute',
    inset: 4,
    borderRadius: 8,
    background: BRAND_TINT_12,
    pointerEvents: 'none',
  },
  tierLabel: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tierRate: {
    position: 'relative',
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
  },
  nowChip: {
    position: 'relative',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: BRAND_FILL_TEXT,
    background: BRAND_ACCENT,
    borderRadius: 999,
    padding: '2px 8px',
    flexShrink: 0,
  },
  previewChip: {
    position: 'relative',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: BRAND_ACCENT,
    border: \`1px dashed \${BRAND_ACCENT}\`,
    borderRadius: 999,
    padding: '1px 7px',
    flexShrink: 0,
  },
  // 36px muted enforcement band — full-bleed inside the card.
  enforceBand: {
    width: '100%',
    height: 36,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  towRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 500,
  },
  towIcon: {color: ERROR_STRONG, display: 'inline-flex', flexShrink: 0},
  // VEHICLE — 72px media row; the Change button sits OUTSIDE the row
  // button (siblings, never nested).
  vehicleCard: {position: 'relative'},
  vehicleRow: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  vehicleWrap: {display: 'flex', alignItems: 'center', paddingInlineEnd: 8},
  vehicleThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  vehicleText: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  vehiclePrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  vehicleSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  plateChip: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: '2px 6px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  paySlug: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  changeBtn: {
    height: 44,
    minWidth: 44,
    paddingInline: 12,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // Anchored menus (vehicle change · receipt actions) — absolute cards,
  // 12px radius, 44px+ rows, z30 (below the sheet scrim's z40).
  anchoredMenu: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    minWidth: 220,
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
  menuRowText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  menuCheck: {width: 20, flexShrink: 0, display: 'grid', placeItems: 'center', color: BRAND_ACCENT},
  // RECEIPTS — swipeable 60px rows.
  receiptOuter: {position: 'relative'},
  receiptClip: {position: 'relative', overflow: 'hidden'},
  // 72px swipe-reveal Email block behind the row (square; the card's 12px
  // radius clips it at the card corners).
  emailAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
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
  receiptContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    touchAction: 'pan-y',
  },
  receiptRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  receiptText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  receiptPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  receiptSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  receiptAmount: {
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // ACTION FOOTER — sticky bottom z20, same blur+hairline surface as the
  // navBar; 48px buttons, gap 12.
  actionFooter: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    gap: 12,
    padding: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  endBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-error)',
    display: 'grid',
    placeItems: 'center',
  },
  extendBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
  },
  // TOAST — the single aria-live region; absolute insetInline 16 bottom 96
  // z45 (clears the 80px footer).
  toastRegion: {
    position: 'absolute',
    insetInline: 16,
    bottom: 96,
    zIndex: 45,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    maxWidth: '100%',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
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
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
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
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    display: 'grid',
    placeItems: 'center',
  },
  confirmBtnDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  presetRow: {display: 'flex', gap: 8},
  presetBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  presetBtnOn: {
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  presetBtnDisabled: {opacity: 0.45},
  stepperRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepReadout: {
    minWidth: 116,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  breakdown: {
    marginTop: 16,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: '4px 12px',
  },
  breakdownLine: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    minHeight: 32,
    paddingBlock: 4,
    fontSize: 13,
  },
  breakdownLabel: {
    flex: 1,
    minWidth: 0,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  breakdownCents: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  breakdownEmpty: {
    minHeight: 32,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  breakdownRule: {height: 1, background: 'var(--color-border)'},
  breakdownTotal: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  capNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    fontSize: 13,
    fontWeight: 500,
    color: CAP_AMBER,
  },
  endSummaryRow: {
    height: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 4,
  },
  endNowBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: ERROR_STRONG,
    color: ERROR_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    marginTop: 12,
  },
  keepBtn: {
    width: '100%',
    height: 44,
    marginTop: 4,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  endSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — one frozen clock, dual fields everywhere ({min, label}), every
// money value in cents beside a fmtUsd render. Cross-check ledger (verified
// by hand before shipping): 300+450+250+125 = 1125¢ weekly; 1125+250 = 1375¢
// post-commit weekly; 300+250 = 550¢ session total after +60; 90+60 = 150 ≤
// 180 cap; 852−795 = 57 elapsed; 885−852 = 33 remaining; −135+57×1.5 =
// −49.5° elapsed arc; −135+90×1.5 = 0° paid tick; −135+180×1.5 = +135° max.
// ---------------------------------------------------------------------------

// The suite's frozen "now": 852 minutes since midnight = 2:12 PM.
const NOW_MIN = 852;

interface RateTier {
  upToMin: number; // paid-time boundary in minutes from session start
  centsPerHour: number;
  centsPer15: number;
}

const RATE_TIERS: RateTier[] = [
  {upToMin: 120, centsPerHour: 200, centsPer15: 50},
  {upToMin: 180, centsPerHour: 300, centsPer15: 75},
];

interface ParkingSession {
  id: string;
  startedMin: number; // 795 = 1:15 PM
  startedLabel: string;
  paidThroughMin: number; // 885 = 2:45 PM
  paidThroughLabel: string;
  paidMinutes: number; // 90
  chargedCents: number; // 300 = 90 min all Tier 1 at 50¢/15: 6×50 ✓
  chargedLabel: string;
  zoneMaxMin: number; // 180 → max end 795+180 = 975 = 4:15 PM
  status: 'active' | 'ended';
  endedAtMin: number | null;
  endedAtLabel: string | null;
}

const SESSION_FIXTURE: ParkingSession = {
  id: 'sess_01',
  startedMin: 795,
  startedLabel: '1:15 PM',
  paidThroughMin: 885,
  paidThroughLabel: '2:45 PM',
  paidMinutes: 90,
  chargedCents: 300,
  chargedLabel: '$3.00',
  zoneMaxMin: 180,
  status: 'active',
  endedAtMin: null,
  endedAtLabel: null,
};

interface Vehicle {
  id: string;
  nickname: string;
  model: string;
  plate: string;
  pay: string;
}

// veh_van's nickname is the 72px-row + anchored-menu truncation stress.
const VEHICLES: Vehicle[] = [
  {id: 'veh_fit', nickname: 'Blue Fit', model: '2021 Honda Fit', plate: '7KDM214', pay: 'Visa ··4417'},
  {
    id: 'veh_van',
    nickname: "Weekend Camper Van (Aunt Rosa's)",
    model: '2009 Ford E-350',
    plate: '8TRV992',
    pay: 'Visa ··4417',
  },
];

interface Receipt {
  id: string;
  zone: string;
  durationMin: number;
  durationLabel: string;
  window: string;
  cents: number;
}

// Weekly aggregate in the RECEIPTS header derives live from these rows:
// 300+450+250+125 = 1125¢ = $11.25 ✓. rcpt_03a's zone name is the one-line
// ellipsis stress beside its $4.50 amount at 320px. Per-row math: rcpt_03a
// Zone B flat $2.25/hr × 2 h = 450¢ ✓; rcpt_01a 75 min all Tier 1 = 5×50 =
// 250¢ ✓; rcpt_30a Zone F $1.25/hr × 1 h = 125¢ ✓.
const RECEIPTS: Receipt[] = [
  {
    id: 'rcpt_04a',
    zone: 'Zone D · Meridian Ave',
    durationMin: 90,
    durationLabel: '1 h 30 m',
    window: 'Today · 1:15 PM – 2:45 PM',
    cents: 300,
  },
  {
    id: 'rcpt_03a',
    zone: 'Zone B — Whitmore Transit Overflow Lot North Annex',
    durationMin: 120,
    durationLabel: '2 h',
    window: 'Fri Jul 3 · 9:40 AM – 11:40 AM',
    cents: 450,
  },
  {
    id: 'rcpt_01a',
    zone: 'Zone D · Meridian Ave',
    durationMin: 75,
    durationLabel: '1 h 15 m',
    window: 'Wed Jul 1 · 2:00 PM – 3:15 PM',
    cents: 250,
  },
  {
    id: 'rcpt_30a',
    zone: 'Zone F · Dockside',
    durationMin: 60,
    durationLabel: '1 h',
    window: 'Tue Jun 30 · 7:05 PM – 8:05 PM',
    cents: 125,
  },
];

// Extension-receipt id suffixes — deterministic, in commit order.
const EXT_SUFFIXES = ['b', 'c', 'd', 'e', 'f', 'g'];

const ZONE_SIGN = 'Sign #D-114';
const ZONE_STREET = 'Meridian Ave';

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Minutes-since-midnight → '2:45 PM'. */
function fmtTime(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return \`\${h12}:\${String(m).padStart(2, '0')} \${suffix}\`;
}

/** Cents → '$2.50'. */
function fmtUsd(cents: number): string {
  return \`$\${(cents / 100).toFixed(2)}\`;
}

/** Remaining minutes → 'H:MM' countdown ('0:33', '1:33'). */
function fmtRemaining(min: number): string {
  return \`\${Math.floor(min / 60)}:\${String(min % 60).padStart(2, '0')}\`;
}

/** Duration span → '30 min' / '1 hour' / '1 h 15 m'. */
function fmtSpan(min: number): string {
  if (min < 60) return \`\${min} min\`;
  if (min % 60 === 0) return min === 60 ? '1 hour' : \`\${min / 60} hours\`;
  return \`\${Math.floor(min / 60)} h \${min % 60} m\`;
}

interface PriceLine {
  id: string;
  label: string;
  cents: number;
}

/**
 * Pure tiered pricing for an extension of \`pendingMin\` on top of \`paidMin\`
 * already-paid minutes. Extension table (paid base 90, cross-checked): +30
 * → 2×50 = 100¢ (3:15 PM); +45 → 100+75 = 175¢ (3:30 PM); +60 → 100+2×75 =
 * 250¢ (3:45 PM); +75 → 100+3×75 = 325¢ (4:00 PM); +90 To max → 100+4×75 =
 * 400¢ (4:15 PM). The +45 tier straddle (30 T1 / 15 T2) proves the math is
 * per-15-minute, not hourly-only (stress fixture 4).
 */
function priceFor(paidMin: number, pendingMin: number): {lines: PriceLine[]; totalCents: number} {
  const lines: PriceLine[] = [];
  let cursor = paidMin;
  let remaining = pendingMin;
  for (let i = 0; i < RATE_TIERS.length && remaining > 0; i++) {
    const tier = RATE_TIERS[i];
    const span = Math.min(tier.upToMin - cursor, remaining);
    if (span <= 0) continue;
    lines.push({
      id: \`tier-\${i + 1}\`,
      label: \`Next \${fmtSpan(span)} · Tier \${i + 1} @ \${fmtUsd(tier.centsPerHour)}/hr\`,
      cents: (span / 15) * tier.centsPer15,
    });
    cursor += span;
    remaining -= span;
  }
  return {lines, totalCents: lines.reduce((sum, line) => sum + line.cents, 0)};
}

// ---------------------------------------------------------------------------
// GAUGE GEOMETRY — 270° sweep; angle measured with 0° at 12 o'clock,
// clockwise positive. GAUGE_START −135° (7:30 position) → GAUGE_END +135°
// (4:30 position); ZONE_MAX_MIN 180 so DEG_PER_MIN = 270/180 = 1.5.
// Elapsed 57 min → −135 + 57×1.5 = −49.5°; paid 90 min → 0° (12 o'clock —
// deliberate fixture choice); zone max → +135°.
// ---------------------------------------------------------------------------

const GAUGE_START = -135;
const GAUGE_END = 135;
const ZONE_MAX_MIN = 180;
const DEG_PER_MIN = (GAUGE_END - GAUGE_START) / ZONE_MAX_MIN; // 1.5
const DIAL_C = 110; // viewBox center
const DIAL_R = 92; // ring radius (strokeWidth 12 → ring spans r 86–98)

function degFor(min: number): number {
  return GAUGE_START + min * DEG_PER_MIN;
}

function polar(deg: number): {x: number; y: number} {
  const rad = (deg * Math.PI) / 180;
  return {x: DIAL_C + DIAL_R * Math.sin(rad), y: DIAL_C - DIAL_R * Math.cos(rad)};
}

/** SVG arc path from \`fromDeg\` to \`toDeg\` (clockwise, sweep flag 1). */
function arcPath(fromDeg: number, toDeg: number): string {
  const from = polar(fromDeg);
  const to = polar(toDeg);
  const largeArcFlag = toDeg - fromDeg > 180 ? 1 : 0;
  return \`M \${from.x.toFixed(2)} \${from.y.toFixed(2)} A \${DIAL_R} \${DIAL_R} 0 \${largeArcFlag} 1 \${to.x.toFixed(2)} \${to.y.toFixed(2)}\`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useCurbitState(): a flat entity map + one update(id,
// patch); commit-level helpers in the page are thin wrappers over it. No
// child owns mirrored state except transient pointer-drag deltas.
// ---------------------------------------------------------------------------

type SheetId = null | 'extend' | 'endConfirm';

interface UiState {
  sheetId: SheetId;
  sheetDetent: 'medium' | 'large';
  pendingMinutes: number;
  openSwipeRowId: string | null;
  vehicleMenuOpen: boolean;
  receiptMenuId: string | null;
  toast: {seq: number; text: string} | null;
}

interface CurbitEntities {
  session: ParkingSession;
  receipts: {byId: Record<string, Receipt>; order: string[]};
  vehicles: {byId: Record<string, Vehicle>; order: string[]; activeId: string};
  ui: UiState;
}

const INITIAL_ENTITIES: CurbitEntities = {
  session: SESSION_FIXTURE,
  receipts: {
    byId: Object.fromEntries(RECEIPTS.map(receipt => [receipt.id, receipt])),
    order: RECEIPTS.map(receipt => receipt.id),
  },
  vehicles: {
    byId: Object.fromEntries(VEHICLES.map(vehicle => [vehicle.id, vehicle])),
    order: VEHICLES.map(vehicle => vehicle.id),
    activeId: 'veh_fit',
  },
  ui: {
    sheetId: null,
    sheetDetent: 'medium',
    pendingMinutes: 0,
    openSwipeRowId: null,
    vehicleMenuOpen: false,
    receiptMenuId: null,
    toast: null,
  },
};

function useCurbitState() {
  const [entities, setEntities] = useState<CurbitEntities>(INITIAL_ENTITIES);
  const update = useCallback(
    <K extends keyof CurbitEntities>(id: K, patch: Partial<CurbitEntities[K]>) => {
      setEntities(prev => ({...prev, [id]: {...prev[id], ...patch}}));
    },
    [],
  );
  return {entities, update, setEntities};
}

/**
 * Container-width hook (grid-feeder-console pattern): the desktop stage is
 * ~1045px inside a 1440px window, so only a ResizeObserver on the shell
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

// ---------------------------------------------------------------------------
// FOCUS UTILITIES — sheets trap focus while open; Escape closes the topmost
// overlay only; focus restores to the opener on every close path.
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
// BRAND MARK — 28px Curbit meter glyph (clock-head meter on a stem) in a
// 44×44 non-button nav slot.
// ---------------------------------------------------------------------------

function CurbitMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <span style={styles.brandMark}>
        <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="6.5" r="4.75" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 4.4v2.4l1.6 1.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M9 11.5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SESSION DIAL — 220×220 SVG, 270° gauge. Layers bottom→top: track arc,
// elapsed arc (brand, round cap), ghost arc (45% brand, 4-6 dash, butt cap,
// only while the extend sheet previews), paid-until tick (rotates on commit
// via CSS transform), zone-max tick + MAX label, HTML center overlay. The
// dial is role='img' with a computed label and is NOT a live region — the
// toast is the single announcer.
// ---------------------------------------------------------------------------

interface SessionDialProps {
  session: ParkingSession;
  pendingMinutes: number;
  showGhost: boolean;
}

function SessionDial({session, pendingMinutes, showGhost}: SessionDialProps) {
  const isEnded = session.status === 'ended';
  const elapsedMin = (isEnded && session.endedAtMin != null ? session.endedAtMin : NOW_MIN) - session.startedMin;
  const elapsedDeg = degFor(Math.min(elapsedMin, ZONE_MAX_MIN));
  const paidDeg = degFor(session.paidMinutes);
  const ghostEndDeg = degFor(Math.min(session.paidMinutes + pendingMinutes, ZONE_MAX_MIN));
  const remainingMin = session.paidThroughMin - NOW_MIN;
  const previewThrough = session.paidThroughMin + pendingMinutes;
  const ariaLabel = isEnded
    ? \`Session ended at \${session.endedAtLabel ?? ''}\`
    : \`\${remainingMin} minutes remaining, paid until \${session.paidThroughLabel}, zone limit 3 hours\`;
  return (
    <div style={styles.dialWrap} role="img" aria-label={ariaLabel}>
      <svg width={220} height={220} viewBox="0 0 220 220" fill="none" aria-hidden>
        <path
          d={arcPath(GAUGE_START, GAUGE_END)}
          stroke="var(--color-background-muted)"
          strokeWidth={12}
          strokeLinecap="round"
        />
        <path
          d={arcPath(GAUGE_START, elapsedDeg)}
          stroke={BRAND_ACCENT}
          strokeWidth={12}
          strokeLinecap="round"
          className="cbt-fade"
        />
        {showGhost ? (
          <path
            d={arcPath(paidDeg, ghostEndDeg)}
            stroke={BRAND_GHOST_45}
            strokeWidth={12}
            strokeLinecap="butt"
            strokeDasharray="4 6"
            className="cbt-fade"
          />
        ) : null}
        {/* Paid-until tick — 2×16 rect centered on the ring; rotates from
            0° to +90° when the +60 commit lands (CSS transform, 240ms,
            instant under reduced motion). */}
        <g
          className="cbt-anim"
          style={{
            transform: \`rotate(\${paidDeg}deg)\`,
            transformOrigin: '110px 110px',
            transformBox: 'view-box',
          }}>
          <rect x={109} y={10} width={2} height={16} fill="var(--color-text-primary)" />
        </g>
        {/* Zone-max tick at +135° (180 min × 1.5°/min − 135°). */}
        <rect x={109} y={10} width={2} height={16} fill={ERROR_STRONG} transform="rotate(135 110 110)" />
        <text
          x={192}
          y={200}
          textAnchor="middle"
          fontSize={11}
          fontWeight={500}
          letterSpacing="0.06em"
          fill={ERROR_STRONG}>
          MAX
        </text>
      </svg>
      <div style={styles.dialCenter}>
        <div style={styles.dialCenterStack}>
          {isEnded ? (
            <>
              <span style={styles.dialNumeral}>Ended</span>
              <span style={styles.dialCaption}>at {session.endedAtLabel}</span>
            </>
          ) : (
            <>
              <span style={styles.dialNumeral}>{fmtRemaining(remainingMin)}</span>
              {showGhost ? (
                <span style={styles.dialCaptionPreview}>until {fmtTime(previewThrough)} · preview</span>
              ) : (
                <span style={styles.dialCaption}>until {session.paidThroughLabel}</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ZONE RATE CARD — the posted-sign metaphor. Every row is a real
// affordance: tier rows open the extend sheet; enforcement + tow rows toast
// the posted rules and focus the Help button.
// ---------------------------------------------------------------------------

interface ZoneRateCardProps {
  activeTier: 1 | 2;
  previewTier2: boolean;
  onTierTap: (opener: HTMLElement) => void;
  onRulesTap: () => void;
}

function ZoneRateCard({activeTier, previewTier2, onTierTap, onRulesTap}: ZoneRateCardProps) {
  const tierRows = RATE_TIERS.map((tier, index) => ({
    tierNo: (index + 1) as 1 | 2,
    label: index === 0 ? 'First 2 hours' : 'After 2 hours',
    rate: \`\${fmtUsd(tier.centsPerHour)} / hr\`,
  }));
  return (
    <div style={styles.listCard}>
      <div style={styles.rateHeader}>
        <span style={styles.zoneBlock} aria-hidden>
          D
        </span>
        <div style={styles.rateHeaderText}>
          <span style={styles.rateHeaderTitle}>{ZONE_STREET}</span>
          <span style={styles.rateHeaderSub}>Metered zone · {ZONE_SIGN}</span>
        </div>
      </div>
      <div style={styles.rowDivider} />
      {tierRows.map(row => {
        const isActive = row.tierNo === activeTier;
        const isPreview = row.tierNo === 2 && previewTier2;
        return (
          <button
            key={row.tierNo}
            type="button"
            className="cbt-btn cbt-focusable"
            style={styles.tierRow}
            aria-label={\`\${row.label}, \${row.rate.replace('/', 'per')}\${isActive ? ', applies now' : ''} — extend parking\`}
            onClick={event => onTierTap(event.currentTarget)}>
            {isActive ? <span style={styles.tierActivePill} aria-hidden /> : null}
            <span style={styles.tierLabel}>{row.label}</span>
            {isActive ? <span style={styles.nowChip}>NOW</span> : null}
            {isPreview ? <span style={styles.previewChip}>PREVIEW</span> : null}
            <span style={styles.tierRate}>{row.rate}</span>
          </button>
        );
      })}
      <button
        type="button"
        className="cbt-btn cbt-focusable"
        style={styles.enforceBand}
        onClick={onRulesTap}>
        Enforced Mon–Sat · 8 AM–8 PM
      </button>
      <button type="button" className="cbt-btn cbt-focusable" style={styles.towRow} onClick={onRulesTap}>
        <span style={styles.towIcon}>
          <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
        </span>
        Tow-away over the 3 h limit
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone (real 'Resize sheet' button: click toggles
// medium/large; pointer drag between detents is garnish, >120px past medium
// closes), 52px header with 44×44 X, focus-trapped dialog. Only one sheet
// mounts at a time.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, footer, children}: SheetProps) {
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

  const translate = dragY != null && dragY > 0 ? \`translateY(\${dragY}px)\` : undefined;
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="cbt-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="cbt-btn cbt-focusable"
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
        <h2 id={titleId} style={styles.sheetTitle}>
          {title}
        </h2>
        <button
          type="button"
          className="cbt-btn cbt-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RECEIPT ROW — 60px two-line row; horizontal pointer drag reveals the 72px
// brand Email block (snap open at −72; one row open at a time), with the
// MANDATORY visible 44×44 ellipsis opening the same actions as an anchored
// menu. The row itself is a single <button> named 'Zone …, duration,
// amount'; the ellipsis sits OUTSIDE it (sibling, never nested).
// ---------------------------------------------------------------------------

interface ReceiptRowProps {
  receipt: Receipt;
  isSwipeOpen: boolean;
  isMenuOpen: boolean;
  isLast: boolean;
  reducedMotion: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
  onRowTap: (opener: HTMLElement) => void;
  onToggleMenu: (opener: HTMLElement) => void;
  onEmail: () => void;
  onReport: () => void;
}

function ReceiptRow({
  receipt,
  isSwipeOpen,
  isMenuOpen,
  isLast,
  reducedMotion,
  menuRef,
  onSwipeOpen,
  onSwipeClose,
  onRowTap,
  onToggleMenu,
  onEmail,
  onReport,
}: ReceiptRowProps) {
  const [dragX, setDragX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const base = isSwipeOpen ? -72 : 0;
  const offset = dragX != null ? Math.max(-72, Math.min(0, base + dragX)) : base;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startXRef.current = event.clientX;
    movedRef.current = false;
    setDragX(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragX == null) return;
    const dx = event.clientX - startXRef.current;
    if (Math.abs(dx) > 8) movedRef.current = true;
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (dragX == null) return;
    const settled = Math.max(-72, Math.min(0, base + dragX));
    setDragX(null);
    if (movedRef.current) {
      if (settled < -36) onSwipeOpen();
      else onSwipeClose();
    }
  };

  const guardClick = (handler: (opener: HTMLElement) => void) => (event: {currentTarget: HTMLElement}) => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }
    handler(event.currentTarget);
  };

  return (
    <div style={styles.receiptOuter}>
      <div style={styles.receiptClip}>
        <button
          type="button"
          className="cbt-btn"
          style={styles.emailAction}
          tabIndex={isSwipeOpen ? 0 : -1}
          aria-hidden={!isSwipeOpen}
          onClick={onEmail}>
          <Icon icon={MailIcon} size="md" color="inherit" />
          Email
        </button>
        <div
          style={{
            ...styles.receiptContent,
            transform: offset !== 0 ? \`translateX(\${offset}px)\` : undefined,
            transition: dragX != null || reducedMotion ? 'none' : 'transform 240ms ease',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}>
          <button
            type="button"
            className="cbt-btn cbt-focusable"
            style={styles.receiptRowBtn}
            aria-label={\`\${receipt.zone}, \${receipt.durationLabel}, \${fmtUsd(receipt.cents)}\`}
            onClick={guardClick(onRowTap)}>
            <span style={styles.receiptText}>
              <span style={styles.receiptPrimary}>{receipt.zone}</span>
              <span style={styles.receiptSecondary}>
                {receipt.window} · {receipt.durationLabel}
              </span>
            </span>
            <span style={styles.receiptAmount}>{fmtUsd(receipt.cents)}</span>
          </button>
          <button
            type="button"
            className="cbt-btn cbt-focusable"
            style={styles.iconBtn}
            aria-label={\`Receipt actions for \${receipt.zone}\`}
            aria-expanded={isMenuOpen}
            onClick={guardClick(onToggleMenu)}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
      </div>
      {isMenuOpen ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={\`Receipt actions for \${receipt.zone}\`}
          style={{...styles.anchoredMenu, top: 52}}
          onKeyDown={event => {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
            const index = items.indexOf(document.activeElement as HTMLElement);
            const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
            items[(next + items.length) % items.length]?.focus();
          }}>
          <button type="button" role="menuitem" className="cbt-btn cbt-focusable" style={styles.menuRow} onClick={onEmail}>
            <Icon icon={MailIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Email receipt</span>
          </button>
          <div style={styles.rowDivider} />
          <button type="button" role="menuitem" className="cbt-btn cbt-focusable" style={styles.menuRow} onClick={onReport}>
            <Icon icon={FlagIcon} size="sm" color="secondary" />
            <span style={styles.menuRowText}>Report issue</span>
          </button>
        </div>
      ) : null}
      {isLast ? null : <div style={styles.rowDivider} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EXTEND SHEET BODY — presets + ±15 stepper write the ONE pendingMinutes
// value; the price breakdown, cap notice, and confirm label all derive from
// it (the dial's ghost arc and the rate card's PREVIEW chip read the same
// value outside the sheet — that shared sightline is the point).
// ---------------------------------------------------------------------------

interface ExtendBodyProps {
  session: ParkingSession;
  pendingMinutes: number;
  onSetPending: (minutes: number) => void;
}

function ExtendBody({session, pendingMinutes, onSetPending}: ExtendBodyProps) {
  const capRemaining = session.zoneMaxMin - session.paidMinutes;
  const atCap = pendingMinutes >= capRemaining;
  const presets = [
    {id: 'p30', label: '+30 min', value: 30},
    {id: 'p60', label: '+1 hour', value: 60},
    {id: 'pmax', label: 'To max', value: capRemaining},
  ];
  const price = priceFor(session.paidMinutes, pendingMinutes);
  // capNotice renders whenever any preset or the +15 step is cap-disabled
  // (stress fixture 2: at 'To max' all three presets AND +15 disable at
  // once and the ghost arc terminates exactly on the +135° max tick).
  const capNoticeVisible = atCap || presets.some(preset => preset.value > capRemaining);
  const maxEndLabel = fmtTime(session.startedMin + session.zoneMaxMin);
  return (
    <div>
      <div style={styles.presetRow}>
        {presets.map(preset => {
          const disabled = preset.value > capRemaining || atCap;
          const pressed = pendingMinutes > 0 && pendingMinutes === preset.value;
          return (
            <button
              key={preset.id}
              type="button"
              className="cbt-btn cbt-focusable"
              style={{
                ...styles.presetBtn,
                ...(pressed ? styles.presetBtnOn : null),
                ...(disabled ? styles.presetBtnDisabled : null),
              }}
              aria-pressed={pressed}
              disabled={disabled}
              aria-disabled={disabled}
              onClick={() => onSetPending(preset.value)}>
              {preset.label}
            </button>
          );
        })}
      </div>
      <div style={styles.stepperRow}>
        <button
          type="button"
          className="cbt-btn cbt-focusable"
          style={{...styles.stepBtn, ...(pendingMinutes === 0 ? styles.presetBtnDisabled : null)}}
          aria-label="Remove 15 minutes"
          disabled={pendingMinutes === 0}
          aria-disabled={pendingMinutes === 0}
          onClick={() => onSetPending(Math.max(0, pendingMinutes - 15))}>
          <Icon icon={MinusIcon} size="md" color="inherit" />
        </button>
        <span style={styles.stepReadout} aria-live="off">
          +{pendingMinutes} min
        </span>
        <button
          type="button"
          className="cbt-btn cbt-focusable"
          style={{...styles.stepBtn, ...(pendingMinutes + 15 > capRemaining ? styles.presetBtnDisabled : null)}}
          aria-label="Add 15 minutes"
          disabled={pendingMinutes + 15 > capRemaining}
          aria-disabled={pendingMinutes + 15 > capRemaining}
          onClick={() => onSetPending(Math.min(capRemaining, pendingMinutes + 15))}>
          <Icon icon={PlusIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.breakdown}>
        {price.lines.length === 0 ? (
          <div style={styles.breakdownEmpty}>No extra time selected</div>
        ) : (
          price.lines.map(line => (
            <div key={line.id} style={styles.breakdownLine}>
              <span style={styles.breakdownLabel}>{line.label}</span>
              <span style={styles.breakdownCents}>{fmtUsd(line.cents)}</span>
            </div>
          ))
        )}
        <div style={styles.breakdownRule} />
        <div style={styles.breakdownTotal}>
          <span style={{flex: 1}}>Total</span>
          <span>{fmtUsd(price.totalCents)}</span>
        </div>
      </div>
      {capNoticeVisible ? (
        <div style={styles.capNotice}>
          <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
          <span>Zone D max is 3 h — this session ends {maxEndLabel} at the latest</span>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileParkingSessionTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {entities, update, setEntities} = useCurbitState();
  const {session, receipts, vehicles, ui} = entities;

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const vehicleMenuRef = useRef<HTMLDivElement | null>(null);
  const receiptMenuRef = useRef<HTMLDivElement | null>(null);
  const extendBtnRef = useRef<HTMLButtonElement | null>(null);
  const helpBtnRef = useRef<HTMLButtonElement | null>(null);
  const toastSeqRef = useRef(0);

  // Derived — aggregates derive live from the rows they summarize.
  const weeklyCents = receipts.order.reduce((sum, id) => sum + receipts.byId[id].cents, 0);
  const elapsedMin = (session.status === 'ended' && session.endedAtMin != null ? session.endedAtMin : NOW_MIN) - session.startedMin;
  const activeTier: 1 | 2 = elapsedMin < RATE_TIERS[0].upToMin ? 1 : 2;
  const activeVehicle = vehicles.byId[vehicles.activeId];
  const previewTier2 =
    ui.sheetId === 'extend' &&
    ui.pendingMinutes > 0 &&
    session.paidMinutes + ui.pendingMinutes > RATE_TIERS[0].upToMin;
  const showGhost = ui.sheetId === 'extend' && ui.pendingMinutes > 0 && session.status === 'active';
  const price = priceFor(session.paidMinutes, ui.pendingMinutes);

  const toastPatch = (text: string) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text}};
  };
  const showToast = (text: string) => update('ui', toastPatch(text));

  // Toast auto-clears after 4s (fixed interval — no clock reads).
  useEffect(() => {
    if (ui.toast == null) return undefined;
    const timer = setTimeout(() => update('ui', {toast: null}), 4000);
    return () => clearTimeout(timer);
  }, [ui.toast, update]);

  // Focus moves into the sheet on open — preventScroll, because the locked
  // shell is an overflow:hidden box the browser would otherwise silently
  // scroll while the sheet's 24px slide-in is mid-flight (shifting every
  // bottom-anchored overlay up by that scroll); the scrollTop reset is the
  // belt to that suspender.
  useEffect(() => {
    if (ui.sheetId != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [ui.sheetId]);
  // Anchored menus focus their first item on open (the opener was just
  // tapped, so the menu is already on screen — no scroll wanted).
  useEffect(() => {
    if (ui.vehicleMenuOpen) vehicleMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [ui.vehicleMenuOpen]);
  useEffect(() => {
    if (ui.receiptMenuId != null) receiptMenuRef.current?.querySelector('button')?.focus({preventScroll: true});
  }, [ui.receiptMenuId]);

  // SHEET / MENU LIFECYCLE ---------------------------------------------------

  const openSheet = (sheetId: 'extend' | 'endConfirm', opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update('ui', {
      sheetId,
      sheetDetent: 'medium',
      pendingMinutes: 0,
      openSwipeRowId: null,
      vehicleMenuOpen: false,
      receiptMenuId: null,
    });
  };
  const closeSheet = (focusTarget?: HTMLElement | null) => {
    update('ui', {sheetId: null, pendingMinutes: 0, sheetDetent: 'medium'});
    (focusTarget ?? sheetOpenerRef.current)?.focus();
  };
  const closeVehicleMenu = () => {
    update('ui', {vehicleMenuOpen: false});
    menuOpenerRef.current?.focus();
  };
  const closeReceiptMenu = () => {
    update('ui', {receiptMenuId: null});
    menuOpenerRef.current?.focus();
  };

  // Escape closes the TOPMOST overlay only: anchored menu > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (ui.vehicleMenuOpen) closeVehicleMenu();
      else if (ui.receiptMenuId != null) closeReceiptMenu();
      else if (ui.sheetId != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.vehicleMenuOpen, ui.receiptMenuId, ui.sheetId]);

  // CONSEQUENCE CHAINS -------------------------------------------------------

  // (2) COMMIT — one beat moves the dial tick (0°→+90° on +60), the ENDS
  // cell, the weekly header ($11.25→$13.75), the receipts card, and the
  // aria-live toast; focus returns to the footer Extend button.
  const commitExtend = () => {
    if (ui.pendingMinutes === 0) return;
    const pending = ui.pendingMinutes;
    const {totalCents} = priceFor(session.paidMinutes, pending);
    const newPaidThrough = session.paidThroughMin + pending;
    const extCount = receipts.order.filter(id => id.startsWith('rcpt_04') && id !== 'rcpt_04a').length;
    const receipt: Receipt = {
      id: \`rcpt_04\${EXT_SUFFIXES[Math.min(extCount, EXT_SUFFIXES.length - 1)]}\`,
      zone: 'Zone D · Meridian Ave',
      durationMin: pending,
      durationLabel: \`\${fmtSpan(pending)} extension\`,
      window: \`Today · \${fmtTime(session.paidThroughMin)} – \${fmtTime(newPaidThrough)}\`,
      cents: totalCents,
    };
    setEntities(prev => ({
      ...prev,
      session: {
        ...prev.session,
        paidThroughMin: newPaidThrough,
        paidThroughLabel: fmtTime(newPaidThrough),
        paidMinutes: prev.session.paidMinutes + pending,
        chargedCents: prev.session.chargedCents + totalCents,
        chargedLabel: fmtUsd(prev.session.chargedCents + totalCents),
      },
      receipts: {
        byId: {...prev.receipts.byId, [receipt.id]: receipt},
        order: [receipt.id, ...prev.receipts.order],
      },
      ui: {
        ...prev.ui,
        sheetId: null,
        pendingMinutes: 0,
        sheetDetent: 'medium',
        ...toastPatch(
          \`Extended to \${fmtTime(newPaidThrough)} · \${fmtUsd(totalCents)} charged to \${activeVehicle.pay}\`,
        ),
      },
    }));
    extendBtnRef.current?.focus();
  };

  // (3) END — dial flips to 'Ended / at 2:12 PM', ENDS cell and footer swap,
  // toast announces.
  const endSession = () => {
    update('session', {status: 'ended', endedAtMin: NOW_MIN, endedAtLabel: fmtTime(NOW_MIN)});
    update('ui', {sheetId: null, pendingMinutes: 0, ...toastPatch(\`Session ended at \${fmtTime(NOW_MIN)}\`)});
  };
  // Honest reset: restores the shipped fixture wholesale.
  const startNewSession = () => {
    setEntities({
      ...INITIAL_ENTITIES,
      ui: {...INITIAL_ENTITIES.ui, ...toastPatch('New session started — demo fixture restored · 1:15 PM')},
    });
  };

  // (4) VEHICLE — row primary, plate chip, and future charge toasts all
  // follow the swap.
  const selectVehicle = (id: string) => {
    const vehicle = vehicles.byId[id];
    update('vehicles', {activeId: id});
    update('ui', {vehicleMenuOpen: false, ...toastPatch(\`Active vehicle: \${vehicle.nickname}\`)});
    menuOpenerRef.current?.focus();
  };

  // (5) RECEIPTS — swipe Email block and ellipsis menu land on the same
  // action; one aria-live toast announces either path.
  const emailReceipt = (id: string) => {
    update('ui', {receiptMenuId: null, openSwipeRowId: null, ...toastPatch(\`Receipt \${id} emailed\`)});
  };
  const reportReceiptIssue = (id: string) => {
    update('ui', {receiptMenuId: null, openSwipeRowId: null, ...toastPatch(\`Issue reported for \${id} — support will reply by email\`)});
  };

  const postedRulesTap = () => {
    showToast(\`Posted rules for Zone D — \${ZONE_SIGN}\`);
    helpBtnRef.current?.focus();
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(ui.sheetId != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const confirmDisabled = ui.pendingMinutes === 0;
  const confirmLabel = confirmDisabled
    ? 'Choose extra time'
    : \`Extend to \${fmtTime(session.paidThroughMin + ui.pendingMinutes)} · \${fmtUsd(price.totalCents)}\`;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{CURBIT_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <CurbitMark />
          </div>
          <button
            type="button"
            className="cbt-btn cbt-focusable"
            style={styles.zoneBadgeHit}
            aria-label="Zone D, Meridian Ave — posted rules"
            onClick={postedRulesTap}>
            <span style={styles.zoneBadge}>
              <span style={styles.zoneBadgeZone}>ZONE D</span>
              <span style={styles.zoneBadgeStreet}>Meridian Ave</span>
            </span>
          </button>
          <div style={styles.navTrailing}>
            <button
              type="button"
              ref={helpBtnRef}
              className="cbt-btn cbt-focusable"
              style={styles.iconBtn}
              aria-label="Curbit help"
              onClick={() => showToast('Curbit support — Zone D rules attached')}>
              <Icon icon={CircleHelpIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <h1 className="cbt-vh">Active parking session</h1>

          <div style={styles.dialHero}>
            <SessionDial session={session} pendingMinutes={ui.pendingMinutes} showGhost={showGhost} />
            <div style={styles.statusStrip}>
              <div style={styles.statusCell}>
                <span style={styles.overline}>Started</span>
                <span style={styles.statusValue}>{session.startedLabel}</span>
              </div>
              <div style={styles.statusCell}>
                <span style={styles.overline}>{session.status === 'ended' ? 'Ended' : 'Ends'}</span>
                <span style={styles.statusValue}>
                  {session.status === 'ended' ? session.endedAtLabel : session.paidThroughLabel}
                </span>
              </div>
              <div style={styles.statusCell}>
                <span style={styles.overline}>Zone max</span>
                <span style={styles.statusValue}>3 h</span>
              </div>
            </div>
          </div>

          <ZoneRateCard
            activeTier={activeTier}
            previewTier2={previewTier2}
            onTierTap={opener => openSheet('extend', opener)}
            onRulesTap={postedRulesTap}
          />

          <h2 style={styles.sectionHeader}>Vehicle</h2>
          <div style={{...styles.listCard, ...styles.vehicleCard}}>
            <div style={styles.vehicleWrap}>
              <button
                type="button"
                className="cbt-btn cbt-focusable"
                style={styles.vehicleRow}
                aria-label={\`Vehicle: \${activeVehicle.nickname}, plate \${activeVehicle.plate} — change vehicle\`}
                aria-expanded={ui.vehicleMenuOpen}
                onClick={event => {
                  menuOpenerRef.current = event.currentTarget;
                  update('ui', {vehicleMenuOpen: !ui.vehicleMenuOpen, receiptMenuId: null, openSwipeRowId: null});
                }}>
                <span style={styles.vehicleThumb} aria-hidden>
                  <Icon icon={activeVehicle.id === 'veh_van' ? CaravanIcon : CarFrontIcon} size="md" color="inherit" />
                </span>
                <span style={styles.vehicleText}>
                  <span style={styles.vehiclePrimary}>{activeVehicle.nickname}</span>
                  <span style={styles.vehicleSecondary}>
                    <span style={styles.plateChip}>{activeVehicle.plate}</span>
                    <span style={styles.paySlug}>
                      {activeVehicle.model} · {activeVehicle.pay}
                    </span>
                  </span>
                </span>
              </button>
              <button
                type="button"
                className="cbt-btn cbt-focusable"
                style={styles.changeBtn}
                aria-expanded={ui.vehicleMenuOpen}
                onClick={event => {
                  menuOpenerRef.current = event.currentTarget;
                  update('ui', {vehicleMenuOpen: !ui.vehicleMenuOpen, receiptMenuId: null, openSwipeRowId: null});
                }}>
                Change
              </button>
            </div>
            {ui.vehicleMenuOpen ? (
              <div
                ref={vehicleMenuRef}
                role="menu"
                aria-label="Choose active vehicle"
                style={{...styles.anchoredMenu, top: 64}}
                onKeyDown={event => {
                  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                  event.preventDefault();
                  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
                  const index = items.indexOf(document.activeElement as HTMLElement);
                  const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
                  items[(next + items.length) % items.length]?.focus();
                }}>
                {vehicles.order.map((id, index) => {
                  const vehicle = vehicles.byId[id];
                  const isActive = id === vehicles.activeId;
                  return (
                    <div key={id}>
                      {index > 0 ? <div style={styles.rowDivider} /> : null}
                      <button
                        type="button"
                        role="menuitem"
                        className="cbt-btn cbt-focusable"
                        style={styles.menuRow}
                        aria-label={\`\${vehicle.nickname}, \${vehicle.model}, plate \${vehicle.plate}\${isActive ? ' — active' : ''}\`}
                        onClick={() => selectVehicle(id)}>
                        <span style={styles.menuCheck} aria-hidden>
                          {isActive ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                        </span>
                        <span style={styles.menuRowText}>{vehicle.nickname}</span>
                        <span style={styles.plateChip}>{vehicle.plate}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <h2 style={styles.sectionHeader}>Receipts — this week · {fmtUsd(weeklyCents)}</h2>
          <div style={styles.listCard}>
            {receipts.order.map((id, index) => (
              <ReceiptRow
                key={id}
                receipt={receipts.byId[id]}
                isSwipeOpen={ui.openSwipeRowId === id}
                isMenuOpen={ui.receiptMenuId === id}
                isLast={index === receipts.order.length - 1}
                reducedMotion={reducedMotion}
                menuRef={receiptMenuRef}
                onSwipeOpen={() => update('ui', {openSwipeRowId: id, receiptMenuId: null, vehicleMenuOpen: false})}
                onSwipeClose={() => {
                  if (ui.openSwipeRowId === id) update('ui', {openSwipeRowId: null});
                }}
                onRowTap={opener => {
                  if (ui.openSwipeRowId != null) {
                    update('ui', {openSwipeRowId: null});
                    return;
                  }
                  menuOpenerRef.current = opener;
                  update('ui', {receiptMenuId: ui.receiptMenuId === id ? null : id, vehicleMenuOpen: false});
                }}
                onToggleMenu={opener => {
                  menuOpenerRef.current = opener;
                  update('ui', {
                    receiptMenuId: ui.receiptMenuId === id ? null : id,
                    vehicleMenuOpen: false,
                    openSwipeRowId: null,
                  });
                }}
                onEmail={() => emailReceipt(id)}
                onReport={() => reportReceiptIssue(id)}
              />
            ))}
          </div>
          <div style={styles.endSpacer} />
        </main>

        <footer style={styles.actionFooter}>
          {session.status === 'active' ? (
            <>
              <button
                type="button"
                className="cbt-btn cbt-focusable"
                style={styles.endBtn}
                onClick={event => openSheet('endConfirm', event.currentTarget)}>
                End session
              </button>
              <button
                type="button"
                ref={extendBtnRef}
                className="cbt-btn cbt-focusable"
                style={styles.extendBtn}
                onClick={event => openSheet('extend', event.currentTarget)}>
                Extend
              </button>
            </>
          ) : (
            <button
              type="button"
              className="cbt-btn cbt-focusable"
              style={{...styles.extendBtn, flex: 1}}
              onClick={startNewSession}>
              Start new session
            </button>
          )}
        </footer>

        {/* The single polite live region — announces every mutation. */}
        <div style={styles.toastRegion} aria-live="polite">
          {ui.toast != null ? (
            <div key={ui.toast.seq} style={styles.toast} className="cbt-fade">
              {ui.toast.text}
            </div>
          ) : null}
        </div>

        {ui.sheetId != null ? (
          <div style={styles.sheetScrim} onClick={() => closeSheet()} aria-hidden />
        ) : null}
        {ui.sheetId === 'extend' ? (
          <Sheet
            titleId="cbt-extend-title"
            title="Extend parking"
            detent={ui.sheetDetent}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onClose={() => closeSheet()}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button
                type="button"
                className="cbt-btn cbt-focusable"
                style={{...styles.confirmBtn, ...(confirmDisabled ? styles.confirmBtnDisabled : null)}}
                disabled={confirmDisabled}
                aria-disabled={confirmDisabled}
                onClick={commitExtend}>
                {confirmLabel}
              </button>
            }>
            <ExtendBody
              session={session}
              pendingMinutes={ui.pendingMinutes}
              onSetPending={minutes => update('ui', {pendingMinutes: minutes})}
            />
          </Sheet>
        ) : null}
        {ui.sheetId === 'endConfirm' ? (
          <Sheet
            titleId="cbt-end-title"
            title="End session?"
            detent={ui.sheetDetent}
            onDetentChange={detent => update('ui', {sheetDetent: detent})}
            onClose={() => closeSheet()}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button type="button" className="cbt-btn cbt-focusable" style={styles.keepBtn} onClick={() => closeSheet()}>
                Keep parking
              </button>
            }>
            <div style={styles.endSummaryRow}>
              <span style={{fontSize: 16, fontWeight: 500, fontVariantNumeric: 'tabular-nums'}}>
                Session total {session.chargedLabel}
              </span>
              <span style={{fontSize: 13, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'}}>
                {elapsedMin} min used · Zone D · {ZONE_STREET} · {activeVehicle.pay}
              </span>
            </div>
            <button type="button" className="cbt-btn cbt-focusable" style={styles.endNowBtn} onClick={endSession}>
              End now
            </button>
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};