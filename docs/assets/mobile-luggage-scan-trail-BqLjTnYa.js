var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Tetherline luggage roster frozen
 *   at NOW '13:05' on 'Fri, Jul 4' (Day 2): THREE BAGS cross-checked —
 *   TL-7F2K 'Checked duffel — SEA→LIS' DIVERGED, 7 scans, last scan 11:35
 *   → 90 min → confidence 100−90/3 = 70%; TL-3M81 'Carry-on tote' with
 *   you, 5 scans, 12:41 → 24 min → 92%; TL-9Q44 (the long-nickname
 *   truncation stress) with you, 4 scans, 12:59 → 6 min → 98%. Aggregates
 *   derive live: 7+5+4 = 16 scans logged, '3 bags tracked · 1 divergence',
 *   Alerts badge 2 = 1 divergence + 1 battery alert. Divergence lane axis
 *   05:00–12:00 (420 min), 8 scrubber detents with pre-written captions;
 *   3 reroute options; per-bag ping fixtures. No Date.now(), no
 *   Math.random(), no network media — the "map" is a stylized SVG fork.
 * @output Tetherline — Luggage Scan Trail: a 390px MOBILE anti-anxiety
 *   luggage tracker. TAB bags → bagsList (28px large title + caption, 3 ×
 *   72px gradient-thumb bag rows, WATCH PRIORITY note, edit mode with
 *   selection circles + move/remove toolbar) → bagDetail (112px
 *   tagIdentityCard, 76px stalenessMeter with decaying confidence, 7-link
 *   scanChainTimeline whose links age by fill and end in a dashed
 *   staleness tail, and — for the diverged bag — divergenceLanes: your
 *   journey vs the bag's over one shared time axis with a draggable
 *   8-detent playhead that rewrites the caption per position and arms
 *   'Reroute delivery' once scrubbed past the 05:47 split). TAB alerts →
 *   2 × 60px alert rows whose acknowledge flips the bagsList chip and
 *   re-derives the badge. Sheets: Ping results + Reroute (radio rows,
 *   confirm executes immediately per undo-over-confirm with a persistent
 *   Undo toast). Signature move: ONE playheadIndex threads the caption
 *   zone, the split-diamond pulse, the armed step-button row, and the
 *   reroute pathway — and ONE store fans acknowledge/reroute consequences
 *   out to chips, badges, and captions.
 * @position Page template; emitted by \`astryx template mobile-luggage-scan-trail\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). All overlays (scrim, sheets, action sheets)
 *   are position:'absolute' INSIDE shell; position:fixed is banned. While
 *   a sheet/action sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The toast dock is
 *   STICKY-IN-FLOW (bottom 76 above the tabBar; 156 above the bagDetail
 *   footer stack) — never shell-absolute, which would pin to the document
 *   bottom on tall scrolling views.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 under thumb-led rows); no
 *   desktop frames, no asides, no tables.
 * Color policy: token-pure chrome; ONE quarantined brand literal
 *   BRAND_ACCENT (Tetherline copper). Interactive boundaries and
 *   meaningful rest fills (unchecked selection circles, aged chain links,
 *   the scrubber's unfilled track) use explicit light-dark() pairs at
 *   ≥3:1 against their ACTUAL surface — hairline/muted tokens are for
 *   passive separators only. Contrast math at every declaration.
 * Density grid (MOBILE, repeated verbatim): navBar 52px content row,
 *   paddingInline 8, grid '1fr auto 1fr'; tabBar exactly 64px, 2 tabs
 *   (Bags / Alerts), tabItem flex:1, 24px icon over 11px/500 label, 4px
 *   gap; 16px SAFE GUTTER on every content block; 12px between stacked
 *   cards; 24px between sections; 8px between chips. Rows: 72px bag media
 *   rows (48px gradient tag thumb at 12px radius, 16px/500 + 13px/400
 *   two-line stack, 2px gap, trailing 13px meta); 60px alert / scan-chain
 *   / reroute-option rows; 44px settings-style rows. Row padding 16px
 *   inline; dividers inset 68 under thumb-led rows, 16 otherwise, last
 *   row none. TYPE: 28px/700 large title · 22px/700 detail values ·
 *   17px/600 navBar + sheet titles · 16px/400 body · 13px/400 meta ·
 *   11px/500 tab labels + overlines + lane axis ticks; nothing under
 *   11px; tabular-nums on every time, %, and count. Buttons: 48px
 *   full-width primary in the sticky footer, 36px secondary, 44×44 icon
 *   buttons; every touch target ≥44×44 with ≥8px clearance or merged.
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals: lanes/scrubber positions are %
 *   of a flex track; micro-stat cells flex 1 and ellipsize; scan-chain
 *   location text truncates before its flexShrink:0 time; navBar center
 *   title ellipsized at 200px, back label at 96px. The adjacent 09:05 /
 *   09:10 lane dots (58.3% vs 59.5% ≈ 3.4px apart at a 283px track) are
 *   distinguished by a 2px card-colored ring on the later dot, and their
 *   hit columns are merged into ONE 44px button at every width (they are
 *   never ≥8px apart below 720px of track).
 * - Desktop stage (~1045px, measured via useElementWidth ResizeObserver
 *   on the wrapper — container width, not viewport): the shell renders as
 *   a centered 430px phone column with hairline borderInline. No adaptive
 *   relayout — the anatomy is deliberately phone geometry.
 */

import {useEffect, useReducer, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  BatteryLowIcon,
  BellIcon,
  BellOffIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  GitBranchIcon,
  LuggageIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math written out (verified with the WCAG relative-luminance
// formula, not eyeballed).
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Tetherline copper). #B4530A on #FFFFFF ≈
// 5.0:1 (spec said "≈5.0", verified 5.02); #F0954E on the dark card
// (~#1C1C1E) ≈ 7.4:1 (verified 7.37). Both clear 4.5:1 for 11px text.
const BRAND_ACCENT = 'light-dark(#B4530A, #F0954E)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #B4530A ≈ 5.0:1 (the
// ratio is symmetric with brand-on-white — spec's "4.6:1" was low; actual
// 5.02). Dark: white on #F0954E fails (~2.2:1), so the dark side flips to
// a near-black copper — #331803 on #F0954E ≈ 8.9:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #331803)';
// 12% brand wash for active tints (decorative only, never text-bearing).
const BRAND_TINT_12 = \`color-mix(in srgb, \${BRAND_ACCENT} 12%, transparent)\`;
// MID-AGE chain-link fill (scans 61–180 min old). Spec proposed
// light-dark(#C98A55, #B87A45), but #C98A55 vs the white card is only
// 2.9:1 — under the ≥3:1 rest-fill law — so the light side darkens to
// #BE7E43: 3.4:1 vs #FFFFFF. Dark side #B87A45 vs ~#1C1C1E ≈ 4.8:1.
// (Deviation from spec hex, required by the amendment; math above.)
const MID_AGE_FILL = 'light-dark(#BE7E43, #B87A45)';
// INTERACTIVE/REST boundaries (unchecked selection circles, radio rings,
// outline-only aged chain links, the scrubber's unfilled track). Hairline
// tokens are for passive separators ONLY — this pair is ≥3:1 against the
// card in both schemes: #6E6B66 on #FFFFFF ≈ 5.3:1; #A9A29A on ~#1C1C1E ≈
// 6.7:1.
const CONTROL_EDGE = 'light-dark(#6E6B66, #A9A29A)';
// Confidence-meter warning fill for 30–59% (explicit pair per spec):
// #92400E on #FFFFFF ≈ 8.0:1; #F5A65B on ~#1C1C1E ≈ 8.2:1. (Fixtures rest
// at 70/92/98 — this band is reachable only by the comment-documented
// clamp test in StalenessMeter.)
const WARN_FILL = 'light-dark(#92400E, #F5A65B)';
// Divergence chip: wash light-dark(#F6E3D3, #4A2B12) with an EXPLICIT text
// pair (11px text needs 4.5:1 vs the chip wash, its actual surface):
// #8A3D06 on #F6E3D3 ≈ 6.1:1; #F6C79C on #4A2B12 ≈ 8.3:1.
const CHIP_WASH = 'light-dark(#F6E3D3, #4A2B12)';
const CHIP_TEXT = 'light-dark(#8A3D06, #F6C79C)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Chrome blur surface shared by navBar / tabBar / footer / toolbars.
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ID-DERIVED tag-band gradients — deterministic, precomputed per bag.
// White 17px/600 tag ids sit on the darker half; contrast of #FFFFFF vs
// the LIGHTEST stop of each: #B4530A ≈ 5.0:1, #8A5A24 ≈ 5.9:1, #A34A1E ≈
// 5.9:1 — all ≥4.5:1, and the 135° blend only darkens from there.
const TAG_GRADIENTS: Record<string, string> = {
  'TL-7F2K': 'linear-gradient(135deg, #B4530A, #6E2E05)',
  'TL-3M81': 'linear-gradient(135deg, #8A5A24, #4A2E10)',
  'TL-9Q44': 'linear-gradient(135deg, #A34A1E, #5C2A0C)',
  'TL-1A05': 'linear-gradient(135deg, #97531D, #55300E)',
};

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// pulse/sheet keyframes, skeleton shimmer, and the ONE reduced-motion guard
// every animation routes through (pulses removed → static ring encodes;
// sheet slide → fade; shimmer removed entirely).
// ---------------------------------------------------------------------------

const TTL_CSS = \`
.ttl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.ttl-btn:disabled { cursor: default; }
.ttl-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.ttl-anim { transition: transform 220ms ease, opacity 220ms ease; }
.ttl-fade { transition: opacity 200ms ease; }
@keyframes ttl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.ttl-sheet-in { animation: ttl-sheet-in 220ms ease; }
@keyframes ttl-pulse {
  0% { transform: rotate(45deg) scale(1); opacity: 1; }
  50% { transform: rotate(45deg) scale(1.5); opacity: 0.55; }
  100% { transform: rotate(45deg) scale(1); opacity: 1; }
}
.ttl-pulse-once { animation: ttl-pulse 600ms ease 1; }
@keyframes ttl-dot-pulse {
  0% { box-shadow: 0 0 0 0 \${BRAND_TINT_12}, 0 0 0 0 \${BRAND_ACCENT}; }
  70% { box-shadow: 0 0 0 8px transparent, 0 0 0 2px \${BRAND_ACCENT}; }
  100% { box-shadow: 0 0 0 0 transparent, 0 0 0 2px \${BRAND_ACCENT}; }
}
.ttl-now-pulse { animation: ttl-dot-pulse 1.8s ease infinite; }
@keyframes ttl-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.ttl-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-background-card) 60%, transparent), transparent);
  animation: ttl-shimmer 1.6s linear infinite;
}
.ttl-vh {
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
  .ttl-anim, .ttl-fade { transition: none; }
  .ttl-sheet-in, .ttl-pulse-once, .ttl-now-pulse { animation: none; }
  .ttl-now-pulse { box-shadow: 0 0 0 2px \${BRAND_ACCENT}; }
  .ttl-shimmer { display: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — binding kit vocabulary: shell, navBar, largeTitle, tabBar,
// tabItem, sheetScrim, sheet, sheetGrabber, listCard, row, rowDivider,
// sectionHeader.
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
  // Scroll-lock variant while any sheet/action sheet is open — absolute
  // overlays anchor to the visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage (container ≥720px): centered phone column, no relayout.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px content row, paddingInline 8, three-zone grid. The
  // hairline variant is ALWAYS ON (deliberate: three screens share one bar
  // and only bagsList wires the large-title sentinel — a sometimes-hairline
  // would flicker across pushes; noted per the chrome contract).
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', alignItems: 'center', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minWidth: 0},
  navTitle: {
    margin: 0,
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  // Text buttons in the nav bar — 44px-tall hit areas.
  navTextBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    borderRadius: 12,
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  navTextBtnStrong: {fontWeight: 600},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // 44×44 back button: 24px chevron + previous screen's title at 13px/500,
  // ellipsized at 96px.
  backBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 0,
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
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center', flexShrink: 0},
  // LARGE TITLE row — 52px block below the sticky navBar; scrolls away.
  largeTitleBlock: {
    minHeight: 52,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 16,
    paddingBottom: 8,
  },
  largeTitle: {margin: 0, fontSize: 28, fontWeight: 700, lineHeight: 1.15},
  largeCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // Inset-grouped listCard — 16px gutter, 12px radius, hairline border.
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
  // 68px inset under thumb-led 72px rows (48px thumb + 16 pad + 4).
  rowDividerDeep: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // BAG ROW — 72px media row.
  bagRowWrap: {display: 'flex', alignItems: 'center', paddingInlineEnd: 8},
  bagRow: {
    flex: 1,
    minWidth: 0,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  bagThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
  },
  bagThumbId: {fontSize: 11, fontWeight: 700, letterSpacing: '0.04em'},
  bagText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  bagPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bagSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  bagSecondaryText: {minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  bagMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    paddingInlineEnd: 8,
  },
  // Divergence chip — 11px/500 on the CHIP_WASH pill; icon + text, text
  // ellipsizes first (stress fixture 8's simpler branch).
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    paddingInline: 6,
    paddingBlock: 2,
    borderRadius: 999,
    background: CHIP_WASH,
    color: CHIP_TEXT,
    fontSize: 11,
    fontWeight: 500,
    flexShrink: 1,
  },
  chipText: {minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'},
  chipNeutral: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // Selection circle (edit mode) — 24px; unchecked border is CONTROL_EDGE
  // (≥3:1 vs card — the hairline token is banned on interactive
  // boundaries). Checked: brand fill + white check (#FFF on #B4530A ≈
  // 5.0:1; dark scheme swaps to BRAND_FILL_TEXT #331803 on #F0954E ≈ 8.9:1).
  selectionCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: '50%',
    border: \`2px solid \${CONTROL_EDGE}\`,
    display: 'grid',
    placeItems: 'center',
    marginInlineStart: 16,
  },
  selectionCircleOn: {
    border: \`2px solid \${BRAND_ACCENT}\`,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  moveBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // 44px settings-style note row (WATCH PRIORITY).
  noteRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  updatedCaption: {
    paddingInline: 32,
    paddingBottom: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // ALERT ROW — 60px two-line row + trailing 44×44 ellipsis (sibling).
  alertRowWrap: {display: 'flex', alignItems: 'center', paddingInlineEnd: 8},
  alertRow: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
  },
  alertIconWrap: {
    width: 24,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_ACCENT,
  },
  alertText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  alertPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  alertSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // SKELETONS — same card, same row heights, deterministic widths.
  skeletonRow72: {height: 72, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skeletonRow60: {height: 60, display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skeletonThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
  },
  skeletonBars: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8},
  skeletonBar: {height: 12, borderRadius: 6, background: 'var(--color-background-muted)'},
  // EMPTY STATE — centered block per the contract.
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
  emptyAction: {
    marginTop: 16,
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
  // TAG IDENTITY CARD — 112px: 64px gradient band + 48px micro-stat strip.
  identityBand: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingInline: 16,
    color: '#FFFFFF',
  },
  identityId: {fontSize: 17, fontWeight: 600, letterSpacing: '0.02em', flexShrink: 0},
  identityNick: {
    fontSize: 13,
    fontWeight: 500,
    opacity: 0.92,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'right',
  },
  statStrip: {height: 48, display: 'flex', alignItems: 'stretch'},
  statCell: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 12,
  },
  statHairline: {width: 1, height: 16, alignSelf: 'center', background: 'var(--color-border)'},
  statOverline: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statValue: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // STALENESS METER — 76px card.
  meterCard: {
    height: 76,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 6,
    paddingInline: 16,
  },
  meterTop: {display: 'flex', alignItems: 'baseline', gap: 8},
  meterValue: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  meterCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 6px track: the remainder is a PASSIVE decay track (muted token is
  // legal here — it encodes nothing by itself; the fill is the datum).
  meterTrack: {
    height: 6,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  meterFill: {height: '100%', borderRadius: 999},
  // SCAN CHAIN — 60px rows with a leading 24px link-glyph column.
  chainRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    position: 'relative',
  },
  chainGlyphCol: {
    width: 24,
    alignSelf: 'stretch',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  chainConnector: {width: 2, flex: 1, background: 'var(--color-border)'},
  chainConnectorHidden: {width: 2, flex: 1, background: 'transparent'},
  // 20px rounded-rect link outline, 2px stroke. Fill by age — brand ≤60
  // min, MID_AGE_FILL 61–180 min, CONTROL_EDGE outline-only older (rest
  // fills at ≥3:1 vs the card per the amendment; math at the constants).
  chainLink: {width: 20, height: 20, flexShrink: 0, borderRadius: 7, boxSizing: 'border-box'},
  chainText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  chainPrimary: {
    fontSize: 16,
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chainSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chainTime: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // STALENESS TAIL — dashed 2px line, 6px per 15 min since last scan
  // (90 min → 36px), ending in the pulsing 8px 'now' dot (pulse removed
  // under reduced motion; the static BRAND ring still encodes 'now').
  tailWrap: {display: 'flex', gap: 12, paddingInline: 16, paddingBottom: 14},
  tailCol: {
    width: 24,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  tailLine: {width: 0, borderInlineStart: \`2px dashed \${CONTROL_EDGE}\`},
  nowDot: {width: 8, height: 8, borderRadius: '50%', background: BRAND_ACCENT, flexShrink: 0},
  tailCaption: {
    alignSelf: 'flex-end',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // DIVERGENCE LANES — 188px = 24 caption + 2×56 lanes + 28 axis + 24 rail.
  divCard: {paddingInline: 12, paddingBlock: 0},
  divCaption: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  lanesWrap: {position: 'relative', height: 112},
  laneLabel: {
    position: 'absolute',
    left: 0,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  laneSvg: {position: 'absolute', inset: 0, width: '100%', height: '100%'},
  laneDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  // 14px split diamond at 11.2% — pulses once when the playhead crosses it
  // (opacity/scale only; removed under reduced motion, where the armed
  // state's brand ring encodes the crossing).
  splitDiamond: {
    position: 'absolute',
    width: 14,
    height: 14,
    background: BRAND_ACCENT,
    transform: 'rotate(45deg)',
    transformOrigin: 'center',
    pointerEvents: 'none',
    borderRadius: 3,
  },
  hitCol: {
    position: 'absolute',
    width: 44,
    height: 44,
    transform: 'translate(-50%, -50%)',
    borderRadius: 12,
    background: 'transparent',
  },
  axisRow: {position: 'relative', height: 28},
  axisTick: {
    position: 'absolute',
    top: 6,
    transform: 'translateX(-50%)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // SCRUBBER — 24px rail; the knob is a 20px circle inside a 44×44 hit.
  scrubRail: {position: 'relative', height: 24, touchAction: 'none'},
  // Unfilled track = CONTROL_EDGE (an interactive slider's rest track,
  // ≥3:1 vs card — not a passive hairline); filled side = brand.
  railTrack: {
    position: 'absolute',
    insetInline: 0,
    top: 10,
    height: 4,
    borderRadius: 999,
    background: CONTROL_EDGE,
    opacity: 0.5,
  },
  railFill: {
    position: 'absolute',
    left: 0,
    top: 10,
    height: 4,
    borderRadius: 999,
    background: BRAND_ACCENT,
  },
  railDetent: {
    position: 'absolute',
    top: 8,
    width: 2,
    height: 8,
    borderRadius: 1,
    background: CONTROL_EDGE,
    transform: 'translateX(-50%)',
  },
  knobHit: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    transform: 'translate(-50%, -50%)',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    zIndex: 2,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    boxShadow: '0 1px 3px var(--color-shadow)',
  },
  // Step-button row below the card: two 36px secondaries + armed caption.
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginInline: 16,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  stepBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  stepBtnDisabled: {opacity: 0.4},
  armedCaption: {fontSize: 13, fontWeight: 600, color: BRAND_ACCENT, whiteSpace: 'nowrap'},
  restCaption: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  rerouteBtn: {
    height: 36,
    paddingInline: 12,
    borderRadius: 12,
    border: \`1px solid \${BRAND_ACCENT}\`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  // STICKY FOOTER (bagDetail only) — sits ABOVE the 64px tabBar, so
  // bottom:64; same blur surface; single 48px primary.
  stickyFooter: {
    position: 'sticky',
    bottom: 64,
    zIndex: 20,
    padding: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
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
  // TAB BAR — exactly 64px, 2 tabs.
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
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px'},
  tabLabelActive: {fontWeight: 600},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // EDIT TOOLBAR — replaces tabBar with identical geometry.
  editToolbar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    height: 64,
    paddingInline: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  toolbarBtn: {
    minHeight: 44,
    paddingInline: 8,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500,
  },
  toolbarBtnDisabled: {color: 'var(--color-text-secondary)', opacity: 0.4},
  toolbarDestructive: {color: 'var(--color-error)'},
  toolbarGroup: {display: 'flex', alignItems: 'center', gap: 8},
  // TOAST DOCK — STICKY-IN-FLOW (the shell grows with content; absolute
  // bottom:N would pin to the *document* bottom on tall views). Always
  // mounted; the one polite live region.
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
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    pointerEvents: 'auto',
  },
  toastMsg: {
    fontSize: 13,
    fontWeight: 500,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    minWidth: 44,
    height: 48,
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
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
  sheetGrabber: {
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
  sheetTitle: {margin: 0, fontSize: 17, fontWeight: 600, textAlign: 'center'},
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  // Reroute option rows — 60px, radio-style selection circles.
  optionRow: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: '50%',
    border: \`2px solid \${CONTROL_EDGE}\`,
    display: 'grid',
    placeItems: 'center',
  },
  radioCircleOn: {border: \`2px solid \${BRAND_ACCENT}\`},
  radioDot: {width: 12, height: 12, borderRadius: '50%', background: BRAND_ACCENT},
  optionText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  optionPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  optionSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  optionPrice: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Ping result rows — 44px label/value pairs.
  pingHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBlock: 12,
  },
  pingHeroDot: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  pingHeroText: {display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0},
  pingHeroTitle: {fontSize: 16, fontWeight: 600},
  pingHeroSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pingRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  pingLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  pingValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // ACTION SHEET — insetInline 16 bottom 16 on the sheet layer.
  actionSheetWrap: {
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
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actionRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
  },
  actionRowDestructive: {color: 'var(--color-error)'},
  actionCancel: {fontWeight: 600},
  actionDividerFull: {height: 1, background: 'var(--color-border)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — one frozen clock, dual fields everywhere. Identity consts:
// NOW = '13:05' local on Day 2 ('Fri, Jul 4'); Day 1 is 'Thu, Jul 3'.
// Absolute minutes count from Day 1 00:00, so NOW_ABS = 1440 + 13×60 + 5 =
// 2225. Cross-check ledger (verified by hand): scans 7+5+4 = 16; bags 3,
// divergences 1; alerts badge 2 = 1 divergence + 1 battery; confidence =
// max(0, 100 − round(minutesSinceLastScan / 3)) with minutes divisible by
// 3 → 90→70, 24→92, 6→98; staleness tail 6px per 15 min → 90→36px,
// 24→9.6px, 6→2.4px; lane deltas 05:12→06:25 = 73 min connection,
// 05:47→09:10 = 3 h 23 m stranded, 06:25→09:45 = 3 h 20 m behind,
// 09:05→11:35 = 2 h 30 m after.
// ---------------------------------------------------------------------------

const NOW_LABEL = '13:05';
const TODAY_LABEL = 'Fri, Jul 4';
const NOW_ABS = 2225; // Day 2, 13:05

/** confidence = max(0, 100 − round(minutesSinceLastScan / 3)). Clamp test
 * (stress fixture 3, comment-documented — shipped fixtures stay at
 * 70/92/98): a scan 300+ min old yields max(0, 100 − 100) = 0%, the meter
 * shows the error fill and the caption flips to 'Signal lost'. */
function confidenceFor(minutesSinceScan: number): number {
  return Math.max(0, 100 - Math.round(minutesSinceScan / 3));
}

interface ScanEvent {
  id: string;
  place: string; // ellipsizes before the flexShrink:0 time cell
  code: string; // airport code
  dayLabel: string;
  timeLabel: string;
  absMin: number; // minutes from Day 1 00:00
  missed?: string; // flight the bag missed at this link (split marker)
}

interface Bag {
  id: string;
  tagId: string;
  nickname: string;
  battery: number; // %
  tamper: 'Sealed';
  lastScanLabel: string;
  minutesSinceScan: number; // NOW_ABS − last scan absMin, divisible by 3
  diverged: boolean;
  scans: ScanEvent[];
  pingGateway: string;
  pingDbm: number;
  pingHops: number;
}

// Bag 1 — TL-7F2K, DIVERGED. 7 scans; last 11:35 (abs 2135) → 90 min →
// confidence 70. Split at Transfer belt 22B 05:47 (missed KL1693).
const BAG_7F2K: Bag = {
  id: 'bag_7f2k',
  tagId: 'TL-7F2K',
  nickname: 'Checked duffel — SEA→LIS',
  battery: 64,
  tamper: 'Sealed',
  lastScanLabel: '11:35',
  minutesSinceScan: 90,
  diverged: true,
  scans: [
    {id: 'sc_7f2k_1', place: 'Bag drop', code: 'SEA', dayLabel: 'Thu, Jul 3', timeLabel: '08:05', absMin: 485},
    {id: 'sc_7f2k_2', place: 'Security scan', code: 'SEA', dayLabel: 'Thu, Jul 3', timeLabel: '08:32', absMin: 512},
    {id: 'sc_7f2k_3', place: 'Loaded DL142', code: 'SEA', dayLabel: 'Thu, Jul 3', timeLabel: '09:38', absMin: 578},
    {id: 'sc_7f2k_4', place: 'Unloaded', code: 'AMS', dayLabel: 'Fri, Jul 4', timeLabel: '05:12', absMin: 1752},
    {id: 'sc_7f2k_5', place: 'Transfer belt 22B', code: 'AMS', dayLabel: 'Fri, Jul 4', timeLabel: '05:47', absMin: 1787, missed: 'KL1693'},
    {id: 'sc_7f2k_6', place: 'Loaded KL1697', code: 'AMS', dayLabel: 'Fri, Jul 4', timeLabel: '09:10', absMin: 1990},
    {id: 'sc_7f2k_7', place: 'Unloaded', code: 'LIS', dayLabel: 'Fri, Jul 4', timeLabel: '11:35', absMin: 2135},
  ],
  pingGateway: 'LIS carousel gateway',
  pingDbm: -62,
  pingHops: 2,
};

// Bag 2 — TL-3M81, WITH YOU. 5 scans; last 12:41 (abs 2201) → 24 min → 92.
const BAG_3M81: Bag = {
  id: 'bag_3m81',
  tagId: 'TL-3M81',
  nickname: 'Carry-on tote',
  battery: 81,
  tamper: 'Sealed',
  lastScanLabel: '12:41',
  minutesSinceScan: 24,
  diverged: false,
  scans: [
    {id: 'sc_3m81_1', place: 'Tag paired', code: 'SEA', dayLabel: 'Thu, Jul 3', timeLabel: '07:12', absMin: 432},
    {id: 'sc_3m81_2', place: 'Security scan', code: 'SEA', dayLabel: 'Thu, Jul 3', timeLabel: '08:32', absMin: 512},
    {id: 'sc_3m81_3', place: 'Gate reader B6', code: 'SEA', dayLabel: 'Thu, Jul 3', timeLabel: '09:21', absMin: 561},
    {id: 'sc_3m81_4', place: 'Cabin check', code: 'AMS', dayLabel: 'Fri, Jul 4', timeLabel: '05:20', absMin: 1760},
    {id: 'sc_3m81_5', place: 'Carousel hall reader', code: 'LIS', dayLabel: 'Fri, Jul 4', timeLabel: '12:41', absMin: 2201},
  ],
  pingGateway: 'Your phone (direct)',
  pingDbm: -41,
  pingHops: 0,
};

// Bag 3 — TL-9Q44, WITH YOU. 4 scans; last 12:59 (abs 2219) → 6 min → 98.
// The nickname is the truncation stress (stress fixture 2 — spec's plain
// 'Ski bag' replaced by the mandated long string; deviation noted).
const BAG_9Q44: Bag = {
  id: 'bag_9q44',
  tagId: 'TL-9Q44',
  nickname: "Grandma's quilted wheeled duffel (fragile!)",
  battery: 97,
  tamper: 'Sealed',
  lastScanLabel: '12:59',
  minutesSinceScan: 6,
  diverged: false,
  scans: [
    {id: 'sc_9q44_1', place: 'Oversize bag drop', code: 'SEA', dayLabel: 'Thu, Jul 3', timeLabel: '08:11', absMin: 491},
    {id: 'sc_9q44_2', place: 'Loaded DL142', code: 'SEA', dayLabel: 'Thu, Jul 3', timeLabel: '09:33', absMin: 573},
    {id: 'sc_9q44_3', place: 'Loaded KL1693', code: 'AMS', dayLabel: 'Fri, Jul 4', timeLabel: '06:02', absMin: 1802},
    {id: 'sc_9q44_4', place: 'Claimed, carousel 7', code: 'LIS', dayLabel: 'Fri, Jul 4', timeLabel: '12:59', absMin: 2219},
  ],
  pingGateway: 'LIS arrivals gateway',
  pingDbm: -58,
  pingHops: 1,
};

const INITIAL_BAGS: Bag[] = [BAG_7F2K, BAG_3M81, BAG_9Q44];

// 'Add a bag' fixture for the all-removed true-empty state: paired 13:02 →
// 3 min → confidence 99 (3/3 = 1; divisible-by-3 law holds).
const NEW_BAG: Bag = {
  id: 'bag_1a05',
  tagId: 'TL-1A05',
  nickname: 'Everyday backpack',
  battery: 100,
  tamper: 'Sealed',
  lastScanLabel: '13:02',
  minutesSinceScan: 3,
  diverged: false,
  scans: [
    {id: 'sc_1a05_1', place: 'Tag paired', code: 'LIS', dayLabel: 'Fri, Jul 4', timeLabel: '13:02', absMin: 2222},
  ],
  pingGateway: 'Your phone (direct)',
  pingDbm: -38,
  pingHops: 0,
};

interface TagAlert {
  id: string;
  kind: 'divergence' | 'battery';
  title: string;
  body: string;
  timeLabel: string;
  bagId: string;
  unread: boolean;
}

const INITIAL_ALERTS: TagAlert[] = [
  {
    id: 'al_div',
    kind: 'divergence',
    title: 'Missed connection',
    body: 'TL-7F2K missed connection KL1693 at AMS',
    timeLabel: '05:52',
    bagId: 'bag_7f2k',
    unread: true,
  },
  {
    id: 'al_batt',
    kind: 'battery',
    title: 'Battery notice',
    body: 'TL-3M81 tag battery at 81%',
    timeLabel: '12:41',
    bagId: 'bag_3m81',
    unread: true,
  },
];

// DIVERGENCE LANES — shared axis 05:00–12:00 (420 min); positions are
// minutesFrom0500/420 as percentages (all arithmetic-checked): 05:12 →
// 12/420 = 2.9%; 05:47 → 11.2% (SPLIT); 06:25 → 20.2%; 08:40 → 52.4%;
// 09:05 → 58.3%; 09:10 → 59.5%; 09:45 → 67.9%; 11:35 → 94.0%.
interface LaneDetent {
  index: number;
  pct: number;
  timeLabel: string;
  lane: 'shared' | 'you' | 'bag';
  label: string;
  caption: string;
}

const DETENTS: LaneDetent[] = [
  {index: 0, pct: 2.9, timeLabel: '05:12', lane: 'shared', label: 'Landed AMS', caption: 'You and bag landed AMS together'},
  {index: 1, pct: 11.2, timeLabel: '05:47', lane: 'shared', label: 'Transfer belt 22B', caption: "Bag on transfer belt 22B; you're in the transit hall"},
  {index: 2, pct: 20.2, timeLabel: '06:25', lane: 'you', label: 'Boarded KL1693', caption: 'You boarded KL1693; bag still at transfer belt'},
  {index: 3, pct: 52.4, timeLabel: '08:40', lane: 'you', label: 'Landed LIS', caption: 'You landed LIS; bag waiting at AMS'},
  {index: 4, pct: 58.3, timeLabel: '09:05', lane: 'you', label: 'At carousel 7', caption: "You're at carousel 7; bag still at AMS"},
  {index: 5, pct: 59.5, timeLabel: '09:10', lane: 'bag', label: 'Loaded KL1697', caption: 'Bag loaded onto KL1697'},
  {index: 6, pct: 67.9, timeLabel: '09:45', lane: 'bag', label: 'Departed AMS', caption: 'Bag departed AMS — 3h 20m behind you'},
  {index: 7, pct: 94.0, timeLabel: '11:35', lane: 'bag', label: 'Unloaded LIS', caption: 'Bag landed LIS — 2h 30m after you'},
];

const SPLIT_PCT = 11.2;
// Axis tick labels at 0 / 120 / 240 / 360 / 420 min.
const AXIS_TICKS = [
  {label: '05:00', pct: 0},
  {label: '07:00', pct: 28.6},
  {label: '09:00', pct: 57.1},
  {label: '11:00', pct: 85.7},
  {label: '12:00', pct: 100},
];

interface RerouteOption {
  id: string;
  name: string;
  shortName: string;
  detail: string;
  windowLabel: string;
  price: string;
}

const REROUTE_OPTIONS: RerouteOption[] = [
  {
    id: 'ro_hotel',
    name: 'Hotel Alvor Baixa',
    shortName: 'Hotel Alvor',
    detail: 'Delivery window 18:00–20:00',
    windowLabel: '18:00–20:00',
    price: 'Free',
  },
  {
    id: 'ro_office',
    name: 'LIS baggage office hold',
    shortName: 'LIS baggage office',
    detail: 'Ready for pickup 14:30',
    windowLabel: 'from 14:30',
    price: 'Free',
  },
  {
    id: 'ro_courier',
    name: 'Courier to address',
    shortName: 'courier',
    detail: 'Delivery 16:15–17:15',
    windowLabel: '16:15–17:15',
    price: '€12',
  },
];

// Deterministic skeleton bar widths — primary cycle 60/45/70, secondary
// 40/55/30 (never Math.random()).
const SKELETON_PRIMARY = ['60%', '45%', '70%'];
const SKELETON_SECONDARY = ['40%', '55%', '30%'];

// ---------------------------------------------------------------------------
// ONE STATE OWNER — bagStore via useReducer in the root component. Named
// actions plus a generic PATCH; every surface dispatches into it and every
// aggregate (badge, caption, chip) DERIVES from it — never stored twice.
// ---------------------------------------------------------------------------

type TabId = 'bags' | 'alerts';
type SheetId = null | 'ping' | 'reroute';
type ActionSheetId = null | {kind: 'bagMenu'} | {kind: 'alert'; alertId: string};
type RefreshPhase = 'idle' | 'loading' | 'done';

interface UndoSnapshot {
  bags: Bag[];
  alerts: TagAlert[];
  divergenceAcked: boolean;
  reroute: RerouteOption | null;
}

interface TrailState {
  tab: TabId;
  screenByTab: {bags: 'list' | 'detail'; alerts: 'list'};
  detailBagId: string;
  playheadIndex: number; // 0..7, starts 0
  splitPulseSeq: number; // bumps when the playhead crosses index 2
  rerouteArmed: boolean;
  sheet: SheetId;
  sheetDetent: 'medium' | 'large';
  actionSheet: ActionSheetId;
  editMode: boolean;
  selection: string[];
  bags: Bag[];
  alerts: TagAlert[];
  divergenceAcked: boolean;
  reroute: RerouteOption | null;
  rerouteDraftId: string | null;
  toast: null | {seq: number; msg: string; undo: boolean};
  toastSeq: number;
  undoSnapshot: UndoSnapshot | null;
  refreshedByTab: {bags: RefreshPhase; alerts: RefreshPhase};
  scrollByTab: {bags: number; alerts: number};
}

const INITIAL_STATE: TrailState = {
  tab: 'bags',
  screenByTab: {bags: 'list', alerts: 'list'},
  detailBagId: 'bag_7f2k',
  playheadIndex: 0,
  splitPulseSeq: 0,
  rerouteArmed: false,
  sheet: null,
  sheetDetent: 'medium',
  actionSheet: null,
  editMode: false,
  selection: [],
  bags: INITIAL_BAGS,
  alerts: INITIAL_ALERTS,
  divergenceAcked: false,
  reroute: null,
  rerouteDraftId: null,
  toast: null,
  toastSeq: 0,
  undoSnapshot: null,
  refreshedByTab: {bags: 'idle', alerts: 'idle'},
  scrollByTab: {bags: 0, alerts: 0},
};

type TrailAction =
  | {type: 'PATCH'; patch: Partial<TrailState>}
  | {type: 'SWITCH_TAB'; tab: TabId; fromScrollTop: number}
  | {type: 'RETAP_ACTIVE_TAB'}
  | {type: 'PUSH_DETAIL'; bagId: string}
  | {type: 'POP_DETAIL'}
  | {type: 'SET_PLAYHEAD'; index: number; arm: boolean}
  | {type: 'OPEN_SHEET'; sheet: 'ping' | 'reroute'}
  | {type: 'CLOSE_SHEET'}
  | {type: 'OPEN_ACTION_SHEET'; target: NonNullable<ActionSheetId>}
  | {type: 'CLOSE_ACTION_SHEET'}
  | {type: 'ENTER_EDIT'}
  | {type: 'EXIT_EDIT'}
  | {type: 'TOGGLE_SELECT'; bagId: string}
  | {type: 'MOVE_SELECTED'; dir: -1 | 1}
  | {type: 'REMOVE_SELECTED'}
  | {type: 'STOP_TRACKING'}
  | {type: 'RENAME_NOOP'}
  | {type: 'SHARE_TRAIL'}
  | {type: 'ACK_ALERT'; alertId: string}
  | {type: 'SET_REROUTE_DRAFT'; optionId: string}
  | {type: 'CONFIRM_REROUTE'}
  | {type: 'REFRESH'; tab: TabId}
  | {type: 'ADD_BAG'}
  | {type: 'UNDO'};

function snapshotOf(state: TrailState): UndoSnapshot {
  return {
    bags: state.bags,
    alerts: state.alerts,
    divergenceAcked: state.divergenceAcked,
    reroute: state.reroute,
  };
}

function withToast(state: TrailState, msg: string, undo: boolean, snapshot?: UndoSnapshot): TrailState {
  return {
    ...state,
    toastSeq: state.toastSeq + 1,
    toast: {seq: state.toastSeq + 1, msg, undo},
    undoSnapshot: undo ? (snapshot ?? snapshotOf(state)) : state.undoSnapshot,
  };
}

/** Move every selected bag one slot up/down, preserving relative order and
 * blocking at the edges (the classic multi-select reorder). */
function moveSelected(bags: Bag[], selection: string[], dir: -1 | 1): Bag[] {
  const order = [...bags];
  const selected = new Set(selection);
  const indices = order.map((bag, i) => (selected.has(bag.id) ? i : -1)).filter(i => i >= 0);
  const walk = dir === -1 ? indices : [...indices].reverse();
  for (const i of walk) {
    const j = i + dir;
    if (j < 0 || j >= order.length || selected.has(order[j].id)) continue;
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function coreReducer(state: TrailState, action: TrailAction): TrailState {
  switch (action.type) {
    case 'PATCH':
      return {...state, ...action.patch};
    case 'SWITCH_TAB':
      // Per-tab persistence: playheadIndex, rerouteArmed, screenByTab, and
      // scroll all SURVIVE; only open overlays close (they belong to their
      // moment; the toast dock persists).
      return {
        ...state,
        tab: action.tab,
        sheet: null,
        actionSheet: null,
        scrollByTab: {...state.scrollByTab, [state.tab]: action.fromScrollTop},
      };
    case 'RETAP_ACTIVE_TAB':
      // The one legal reset: re-tapping the active tab pops its stack to
      // root (scroll-to-top happens in the component, which owns the DOM).
      return state.tab === 'bags'
        ? {...state, screenByTab: {...state.screenByTab, bags: 'list'}, sheet: null, actionSheet: null}
        : state;
    case 'PUSH_DETAIL':
      return {
        ...state,
        tab: 'bags',
        detailBagId: action.bagId,
        screenByTab: {...state.screenByTab, bags: 'detail'},
        sheet: null,
        actionSheet: null,
        editMode: false,
        selection: [],
      };
    case 'POP_DETAIL':
      return {...state, screenByTab: {...state.screenByTab, bags: 'list'}};
    case 'SET_PLAYHEAD': {
      const index = Math.max(0, Math.min(DETENTS.length - 1, action.index));
      const crossed = state.playheadIndex < 2 && index >= 2;
      return {
        ...state,
        playheadIndex: index,
        splitPulseSeq: crossed ? state.splitPulseSeq + 1 : state.splitPulseSeq,
        // Stepping/tapping to index ≥2 (or releasing a drag there) arms.
        rerouteArmed: state.rerouteArmed || (action.arm && index >= 2),
      };
    }
    case 'OPEN_SHEET':
      return {
        ...state,
        sheet: action.sheet,
        sheetDetent: 'medium',
        actionSheet: null,
        rerouteDraftId: action.sheet === 'reroute' ? state.rerouteDraftId : null,
      };
    case 'CLOSE_SHEET':
      return {...state, sheet: null, sheetDetent: 'medium'};
    case 'OPEN_ACTION_SHEET':
      return {...state, actionSheet: action.target, sheet: null};
    case 'CLOSE_ACTION_SHEET':
      return {...state, actionSheet: null};
    case 'ENTER_EDIT':
      return {...state, editMode: true, selection: []};
    case 'EXIT_EDIT':
      // Cancel and Done both land here: moves committed immediately;
      // selection never survives exit.
      return {...state, editMode: false, selection: []};
    case 'TOGGLE_SELECT':
      return {
        ...state,
        selection: state.selection.includes(action.bagId)
          ? state.selection.filter(id => id !== action.bagId)
          : [...state.selection, action.bagId],
      };
    case 'MOVE_SELECTED':
      return {...state, bags: moveSelected(state.bags, state.selection, action.dir)};
    case 'REMOVE_SELECTED': {
      if (state.selection.length === 0) return state;
      const snapshot = snapshotOf(state);
      const removed = state.bags.filter(bag => state.selection.includes(bag.id));
      const bags = state.bags.filter(bag => !state.selection.includes(bag.id));
      const detailGone = state.selection.includes(state.detailBagId);
      const next: TrailState = {
        ...state,
        bags,
        editMode: false,
        selection: [],
        screenByTab: detailGone ? {...state.screenByTab, bags: 'list'} : state.screenByTab,
      };
      const msg =
        removed.length === 1 ? \`\${removed[0].tagId} removed\` : \`\${removed.length} bags removed\`;
      return withToast(next, msg, true, snapshot);
    }
    case 'STOP_TRACKING': {
      const bag = state.bags.find(candidate => candidate.id === state.detailBagId);
      if (bag == null) return state;
      const snapshot = snapshotOf(state);
      const next: TrailState = {
        ...state,
        bags: state.bags.filter(candidate => candidate.id !== bag.id),
        actionSheet: null,
        screenByTab: {...state.screenByTab, bags: 'list'},
      };
      return withToast(next, \`Stopped tracking \${bag.tagId}\`, true, snapshot);
    }
    case 'RENAME_NOOP': {
      const bag = state.bags.find(candidate => candidate.id === state.detailBagId);
      return withToast({...state, actionSheet: null}, \`Rename saved for \${bag?.tagId ?? 'tag'}\`, false);
    }
    case 'SHARE_TRAIL': {
      const bag = state.bags.find(candidate => candidate.id === state.detailBagId);
      return withToast(
        {...state, actionSheet: null},
        \`Trail link copied · tetherline.app/t/\${bag?.tagId ?? ''}\`,
        false,
      );
    }
    case 'ACK_ALERT': {
      const alert = state.alerts.find(candidate => candidate.id === action.alertId);
      if (alert == null) return state;
      const snapshot = snapshotOf(state);
      // Acknowledge executes immediately (undo-over-confirm): the row
      // leaves the list, unread flips, the divergence chip goes neutral,
      // and the badge RE-DERIVES from unread rows — never stored.
      const next: TrailState = {
        ...state,
        alerts: state.alerts.filter(candidate => candidate.id !== action.alertId),
        divergenceAcked: state.divergenceAcked || alert.kind === 'divergence',
        actionSheet: null,
      };
      return withToast(next, \`Acknowledged: \${alert.title}\`, true, snapshot);
    }
    case 'SET_REROUTE_DRAFT':
      return {...state, rerouteDraftId: action.optionId};
    case 'CONFIRM_REROUTE': {
      const option = REROUTE_OPTIONS.find(candidate => candidate.id === state.rerouteDraftId);
      if (option == null) return state;
      const snapshot = snapshotOf(state);
      const next: TrailState = {...state, reroute: option, sheet: null};
      return withToast(next, \`Delivery rerouted to \${option.shortName}\`, true, snapshot);
    }
    case 'REFRESH':
      return {
        ...state,
        refreshedByTab: {...state.refreshedByTab, [action.tab]: 'loading'},
      };
    case 'ADD_BAG': {
      const next: TrailState = {...state, bags: [...state.bags, NEW_BAG]};
      return withToast(next, \`\${NEW_BAG.tagId} added · paired \${NEW_BAG.lastScanLabel}\`, false);
    }
    case 'UNDO': {
      if (state.undoSnapshot == null) return state;
      const snap = state.undoSnapshot;
      return {
        ...state,
        bags: snap.bags,
        alerts: snap.alerts,
        divergenceAcked: snap.divergenceAcked,
        reroute: snap.reroute,
        undoSnapshot: null,
        toastSeq: state.toastSeq + 1,
        toast: {seq: state.toastSeq + 1, msg: 'Restored', undo: false},
      };
    }
    default:
      return state;
  }
}

/** Wrapper: a 'loading' skeleton resolves on the NEXT user-driven action
 * (never a timer). If that action didn't announce its own toast, the
 * resolution announces 'Updated just now' through the one region. */
function trailReducer(state: TrailState, action: TrailAction): TrailState {
  let next = coreReducer(state, action);
  if (action.type === 'REFRESH') return next;
  (['bags', 'alerts'] as const).forEach(tabId => {
    if (state.refreshedByTab[tabId] === 'loading' && next.refreshedByTab[tabId] === 'loading') {
      next = {...next, refreshedByTab: {...next.refreshedByTab, [tabId]: 'done'}};
      if (next.toast === state.toast) {
        next = {
          ...next,
          toastSeq: next.toastSeq + 1,
          toast: {seq: next.toastSeq + 1, msg: 'Updated just now', undo: false},
        };
      }
    }
  });
  return next;
}

// ---------------------------------------------------------------------------
// HOOKS & FOCUS UTILITIES
// ---------------------------------------------------------------------------

/** Container-width hook (grid-feeder-console pattern): the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver on the
 * wrapper can tell the 390px mobile stage from the desktop stage. */
function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) return undefined;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) setWidth(rect.width);
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

/** The demo's .preview-wrap owns page scroll — walk up to the nearest
 * scrollable ancestor for per-tab scroll save/restore. */
function getScrollParent(node: HTMLElement | null): HTMLElement | Element | null {
  let parent = node?.parentElement ?? null;
  while (parent != null) {
    const style = window.getComputedStyle(parent);
    if (/(auto|scroll)/.test(style.overflowY)) return parent;
    parent = parent.parentElement;
  }
  return document.scrollingElement;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 24px Tetherline luggage-tag loop: tag body + a 2px dotted
// string ending in a 6px filled signal dot (stroke text-primary, dot
// BRAND_ACCENT), inside a 44×44 non-button nav slot.
// ---------------------------------------------------------------------------

function TetherlineMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x={3} y={7} width={10} height={13} rx={2.5} stroke="var(--color-text-primary)" strokeWidth={2} />
        <path d="M6 7V5.5A2.5 2.5 0 0 1 8.5 3h0A2.5 2.5 0 0 1 11 5.5V7" stroke="var(--color-text-primary)" strokeWidth={2} />
        <path d="M13 12c3 0 4-2 6-2" stroke="var(--color-text-primary)" strokeWidth={2} strokeLinecap="round" strokeDasharray="0.5 3.5" />
        <circle cx={20.5} cy={9.5} r={3} fill={BRAND_ACCENT} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — grabber zone is a real 'Resize sheet' button (click
// toggles medium/large; pointer drag between detents is garnish, >120px
// past medium closes). Focus-trapped dialog; only one sheet mounts at a
// time; never stacked.
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
  // Transient pointer-drag delta only — the detent lives in the store.
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
    if (!movedRef.current) return; // plain click → onClick toggle
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
      className="ttl-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 220ms ease',
      }}>
      <button
        type="button"
        className="ttl-btn ttl-focusable"
        style={styles.sheetGrabber}
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
        <button type="button" className="ttl-btn ttl-focusable" style={styles.iconBtn} aria-label="Close sheet" onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
      <div style={styles.sheetFooter}>{footer}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — flat verb picker: options card (56px rows, destructive
// LAST) + separate panic-safe Cancel card. First focus lands on Cancel;
// scrim, Escape, and Cancel all close with nothing taken.
// ---------------------------------------------------------------------------

interface ActionSheetRow {
  id: string;
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

interface ActionSheetProps {
  contextLabel: string;
  rows: ActionSheetRow[];
  onClose: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  cancelRef: RefObject<HTMLButtonElement | null>;
}

function ActionSheet({contextLabel, rows, onClose, containerRef, cancelRef}: ActionSheetProps) {
  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={contextLabel}
      className="ttl-sheet-in"
      style={styles.actionSheetWrap}
      onKeyDown={event => trapTabKey(event, containerRef.current)}>
      <div style={styles.actionCard}>
        <div style={styles.actionContext}>{contextLabel}</div>
        {rows.map(row => (
          <div key={row.id}>
            <div style={styles.actionDividerFull} />
            <button
              type="button"
              className="ttl-btn ttl-focusable"
              style={{...styles.actionRow, ...(row.destructive ? styles.actionRowDestructive : null)}}
              onClick={row.onSelect}>
              {row.label}
            </button>
          </div>
        ))}
      </div>
      <div style={styles.actionCard}>
        <button
          type="button"
          ref={cancelRef}
          className="ttl-btn ttl-focusable"
          style={{...styles.actionRow, ...styles.actionCancel}}
          onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TAG IDENTITY CARD — 112px: 64px id-derived gradient band (white 17px/600
// tag id, ≥4.5:1 vs the lightest gradient stop — math at TAG_GRADIENTS) +
// 48px 3-cell micro-stat strip split by 16px hairlines.
// ---------------------------------------------------------------------------

function TagIdentityCard({bag}: {bag: Bag}) {
  return (
    <div style={styles.listCard}>
      <div style={{...styles.identityBand, background: TAG_GRADIENTS[bag.tagId] ?? TAG_GRADIENTS['TL-1A05']}}>
        <span style={styles.identityId}>{bag.tagId}</span>
        <span style={styles.identityNick}>{bag.nickname}</span>
      </div>
      <div style={styles.statStrip}>
        <div style={styles.statCell}>
          <span style={styles.statOverline}>Tamper</span>
          <span style={styles.statValue}>{bag.tamper}</span>
        </div>
        <span style={styles.statHairline} aria-hidden />
        <div style={styles.statCell}>
          <span style={styles.statOverline}>Battery</span>
          <span style={styles.statValue}>{bag.battery}%</span>
        </div>
        <span style={styles.statHairline} aria-hidden />
        <div style={styles.statCell}>
          <span style={styles.statOverline}>Last scan</span>
          <span style={styles.statValue}>{bag.minutesSinceScan}m ago</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STALENESS METER — 76px card. confidence = max(0, 100 − round(min/3));
// fill BRAND ≥60, WARN_FILL 30–59, --color-error <30 ('Signal lost' at 0 —
// the clamp test documented at confidenceFor). Track remainder is passive
// decay (muted token legal); the FILL carries the datum.
// ---------------------------------------------------------------------------

function StalenessMeter({bag}: {bag: Bag}) {
  const confidence = confidenceFor(bag.minutesSinceScan);
  const fill =
    confidence >= 60 ? BRAND_ACCENT : confidence >= 30 ? WARN_FILL : 'var(--color-error)';
  const caption =
    confidence === 0
      ? 'Signal lost — no scan in 5+ hours'
      : \`decaying since last scan \${bag.lastScanLabel} · now \${NOW_LABEL}\`;
  return (
    <div style={{...styles.listCard, ...styles.meterCard}}>
      <div style={styles.meterTop}>
        {/* flexShrink 0: the overline never truncates — the caption is the
            row's one elastic cell. */}
        <span style={{...styles.statOverline, flexShrink: 0}}>Confidence</span>
        <span style={styles.meterValue}>{confidence}%</span>
        <span style={styles.meterCaption}>{caption}</span>
      </div>
      <div
        style={styles.meterTrack}
        role="img"
        aria-label={\`Confidence \${confidence} percent, \${bag.minutesSinceScan} minutes since last scan\`}>
        <div style={{...styles.meterFill, width: \`\${confidence}%\`, background: fill}} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SCAN CHAIN TIMELINE — 60px rows led by a 24px link-glyph column; links
// AGE by fill (≤60 min BRAND, 61–180 MID_AGE_FILL, older CONTROL_EDGE
// outline only — all ≥3:1 vs the card). Below the last link the STALENESS
// TAIL: dashed 2px line, 6px per 15 min since last scan, ending in the
// pulsing 8px 'now' dot (pulse removed under reduced motion — the static
// brand ring encodes it via the CSS guard).
// ---------------------------------------------------------------------------

function ScanChainTimeline({bag}: {bag: Bag}) {
  const tailHeight = (bag.minutesSinceScan / 15) * 6;
  return (
    <div style={styles.listCard}>
      {bag.scans.map((scan, index) => {
        const ageMin = NOW_ABS - scan.absMin;
        const linkStyle: CSSProperties =
          ageMin <= 60
            ? {...styles.chainLink, background: BRAND_ACCENT, border: \`2px solid \${BRAND_ACCENT}\`}
            : ageMin <= 180
              ? {...styles.chainLink, background: MID_AGE_FILL, border: \`2px solid \${MID_AGE_FILL}\`}
              : {...styles.chainLink, border: \`2px solid \${CONTROL_EDGE}\`};
        return (
          <div key={scan.id} style={styles.chainRow}>
            <div style={styles.chainGlyphCol} aria-hidden>
              <span style={index === 0 ? styles.chainConnectorHidden : styles.chainConnector} />
              <span style={linkStyle} />
              <span style={index === bag.scans.length - 1 ? styles.chainConnectorHidden : styles.chainConnector} />
            </div>
            <div style={styles.chainText}>
              <span style={styles.chainPrimary}>{scan.place}</span>
              <span style={styles.chainSecondary}>
                {scan.code} · {scan.dayLabel}
                {scan.missed != null ? \` · missed \${scan.missed}\` : ''}
              </span>
            </div>
            {scan.missed != null ? (
              <span style={styles.chip}>
                <Icon icon={GitBranchIcon} size="sm" color="inherit" />
                <span style={styles.chipText}>Split</span>
              </span>
            ) : null}
            <span style={styles.chainTime}>{scan.timeLabel}</span>
          </div>
        );
      })}
      <div style={styles.tailWrap}>
        <div style={styles.tailCol} aria-hidden>
          <span style={{...styles.tailLine, height: tailHeight}} />
          <span style={styles.nowDot} className="ttl-now-pulse" />
        </div>
        <span style={styles.tailCaption}>
          {bag.minutesSinceScan} min since last scan · now {NOW_LABEL}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DIVERGENCE LANES + TIME SCRUBBER — two 56px lanes (YOU / BAG) over one
// shared 05:00–12:00 axis; ONE merged 4px line until the 05:47 split
// (11.2%), where a 14px diamond forks it. The scrubber knob is a real
// role='slider' (ArrowLeft/Right step; the visible Step buttons are the
// mandatory non-gesture path). Dot hit targets are merged into 44px
// cluster buttons wherever adjacent dots sit closer than the 8px
// clearance law allows (09:05 vs 09:10 = 1.2% ≈ 3.4px at a 283px track —
// the later dot wears a 2px card-colored ring to stay distinct).
// ---------------------------------------------------------------------------

const YOU_Y = 28;
const MID_Y = 56;
const BAG_Y = 84;
// Static tap clusters (centers <44px apart merge; click x picks nearest).
const DOT_CLUSTERS: number[][] = [[0, 1], [2], [3], [4, 5, 6], [7]];

function laneYFor(lane: LaneDetent['lane']): number {
  return lane === 'you' ? YOU_Y : lane === 'bag' ? BAG_Y : MID_Y;
}

interface DivergenceLanesProps {
  playheadIndex: number;
  splitPulseSeq: number;
  rerouteArmed: boolean;
  reducedMotion: boolean;
  onSetIndex: (index: number, arm: boolean) => void;
  onOpenReroute: (opener: HTMLElement) => void;
}

function DivergenceLanes({
  playheadIndex,
  splitPulseSeq,
  rerouteArmed,
  reducedMotion,
  onSetIndex,
  onOpenReroute,
}: DivergenceLanesProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const detent = DETENTS[playheadIndex];

  const indexFromClientX = (clientX: number): number => {
    const rail = railRef.current;
    if (rail == null) return playheadIndex;
    const rect = rail.getBoundingClientRect();
    const pct = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    DETENTS.forEach(candidate => {
      const dist = Math.abs(candidate.pct - pct);
      if (dist < bestDist) {
        bestDist = dist;
        best = candidate.index;
      }
    });
    return best;
  };

  const onRailPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onSetIndex(indexFromClientX(event.clientX), false);
  };
  const onRailPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    onSetIndex(indexFromClientX(event.clientX), false);
  };
  const onRailPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    // RELEASING arms once the playhead sits past the split (index ≥2).
    onSetIndex(indexFromClientX(event.clientX), true);
  };

  const onKnobKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onSetIndex(playheadIndex - 1, true);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      onSetIndex(playheadIndex + 1, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      onSetIndex(0, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      onSetIndex(DETENTS.length - 1, true);
    }
  };

  return (
    <>
      {/* 188px card = 24 caption + 2×56 lanes + 28 axis + 24 scrubber. */}
      <div style={{...styles.listCard, ...styles.divCard}}>
        {/* Caption zone rewrites per detent by re-render only — the toast
            dock announces on arm/act, never per scrub detent. */}
        <div style={styles.divCaption}>{detent.caption}</div>
        <div style={styles.lanesWrap}>
          <span style={{...styles.laneLabel, top: 2}}>YOU</span>
          <span style={{...styles.laneLabel, top: 58}}>BAG</span>
          <svg style={styles.laneSvg} viewBox="0 0 100 112" preserveAspectRatio="none" aria-hidden>
            {/* Merged pre-split segment (4px), fork, then lane guides. */}
            <path
              d={\`M 0 \${MID_Y} L \${SPLIT_PCT} \${MID_Y}\`}
              stroke={CONTROL_EDGE}
              strokeWidth={4}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={\`M \${SPLIT_PCT} \${MID_Y} L 16 \${YOU_Y} L 58.3 \${YOU_Y}\`}
              stroke={CONTROL_EDGE}
              strokeWidth={2}
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={\`M \${SPLIT_PCT} \${MID_Y} L 16 \${BAG_Y} L 94 \${BAG_Y}\`}
              stroke={CONTROL_EDGE}
              strokeWidth={2}
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* Playhead line tracks the current detent across both lanes. */}
          <span
            aria-hidden
            className="ttl-anim"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: \`\${detent.pct}%\`,
              width: 2,
              background: BRAND_ACCENT,
              opacity: 0.5,
              transform: 'translateX(-50%)',
            }}
          />
          {/* Split diamond — pulses once when the playhead crosses it
              (key restarts the one-shot animation; removed under reduced
              motion where the armed ring below encodes the crossing). */}
          <span
            key={\`split-\${splitPulseSeq}\`}
            aria-hidden
            className={splitPulseSeq > 0 && !reducedMotion ? 'ttl-pulse-once' : undefined}
            style={{
              ...styles.splitDiamond,
              left: \`calc(\${SPLIT_PCT}% - 7px)\`,
              top: MID_Y - 7,
              ...(rerouteArmed ? {boxShadow: \`0 0 0 2px var(--color-background-card), 0 0 0 4px \${BRAND_ACCENT}\`} : null),
            }}
          />
          {DETENTS.map(event => {
            if (event.index === 1) return null; // the diamond IS the split node
            const isBag = event.lane === 'bag';
            return (
              <span
                key={event.index}
                aria-hidden
                style={{
                  ...styles.laneDot,
                  left: \`\${event.pct}%\`,
                  top: laneYFor(event.lane),
                  background: isBag ? BRAND_ACCENT : 'var(--color-text-primary)',
                  // Later dot of the 09:05/09:10 pair stays distinct via a
                  // 2px card-colored ring (stress fixture 1).
                  ...(event.index === 5 ? {boxShadow: '0 0 0 2px var(--color-background-card)'} : null),
                }}
              />
            );
          })}
          {/* Merged 44px tap clusters — every dot reachable by touch; the
              slider + Step buttons are the keyboard path. */}
          {DOT_CLUSTERS.map(cluster => {
            const members = cluster.map(index => DETENTS[index]);
            const centerPct = members.reduce((sum, member) => sum + member.pct, 0) / members.length;
            const label =
              members.length === 1
                ? \`Jump playhead to \${members[0].timeLabel} — \${members[0].label}\`
                : \`Jump playhead to \${members.map(member => member.timeLabel).join(' or ')}\`;
            return (
              <button
                key={\`cluster-\${cluster[0]}\`}
                type="button"
                className="ttl-btn ttl-focusable"
                style={{
                  ...styles.hitCol,
                  left: \`\${centerPct}%\`,
                  top: members.length === 1 ? laneYFor(members[0].lane) : MID_Y,
                }}
                aria-label={label}
                onClick={event => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const clientX =
                    'clientX' in event && event.clientX !== 0 ? event.clientX : rect.left + rect.width / 2;
                  const railRect = railRef.current?.getBoundingClientRect();
                  const pct = railRect == null ? centerPct : ((clientX - railRect.left) / Math.max(1, railRect.width)) * 100;
                  let best = members[0].index;
                  let bestDist = Number.POSITIVE_INFINITY;
                  members.forEach(member => {
                    const dist = Math.abs(member.pct - pct);
                    if (dist < bestDist) {
                      bestDist = dist;
                      best = member.index;
                    }
                  });
                  onSetIndex(best, true);
                }}
              />
            );
          })}
        </div>
        {/* Shared 28px axis — tick labels absolute inside the % track so
            no child forces intrinsic width. */}
        <div style={styles.axisRow} aria-hidden>
          {AXIS_TICKS.map(tick => (
            <span
              key={tick.label}
              style={{
                ...styles.axisTick,
                left: \`\${tick.pct}%\`,
                ...(tick.pct === 0 ? {transform: 'none'} : null),
                ...(tick.pct === 100 ? {transform: 'translateX(-100%)'} : null),
              }}>
              {tick.label}
            </span>
          ))}
        </div>
        {/* 24px scrubber rail; 20px knob inside a 44×44 hit. Unfilled
            track is CONTROL_EDGE (interactive rest fill ≥3:1), not a
            hairline. */}
        <div
          ref={railRef}
          style={styles.scrubRail}
          onPointerDown={onRailPointerDown}
          onPointerMove={onRailPointerMove}
          onPointerUp={onRailPointerUp}>
          <span style={styles.railTrack} aria-hidden />
          <span style={{...styles.railFill, width: \`\${detent.pct}%\`}} aria-hidden />
          {DETENTS.map(mark => (
            <span key={mark.index} style={{...styles.railDetent, left: \`\${mark.pct}%\`}} aria-hidden />
          ))}
          <button
            type="button"
            className="ttl-btn ttl-focusable ttl-anim"
            style={{...styles.knobHit, left: \`\${detent.pct}%\`}}
            role="slider"
            aria-label="Divergence playhead"
            aria-valuemin={0}
            aria-valuemax={DETENTS.length - 1}
            aria-valuenow={playheadIndex}
            aria-valuetext={detent.caption}
            onKeyDown={onKnobKeyDown}>
            <span style={styles.knob} aria-hidden />
          </button>
        </div>
      </div>
      {/* Mandatory non-gesture path: 36px Step buttons + armed caption. */}
      <div style={styles.stepRow}>
        <button
          type="button"
          className="ttl-btn ttl-focusable"
          style={{...styles.stepBtn, ...(playheadIndex === 0 ? styles.stepBtnDisabled : null)}}
          disabled={playheadIndex === 0}
          onClick={() => onSetIndex(playheadIndex - 1, true)}>
          Step back
        </button>
        <button
          type="button"
          className="ttl-btn ttl-focusable"
          style={{...styles.stepBtn, ...(playheadIndex === DETENTS.length - 1 ? styles.stepBtnDisabled : null)}}
          disabled={playheadIndex === DETENTS.length - 1}
          onClick={() => onSetIndex(playheadIndex + 1, true)}>
          Step forward
        </button>
        {rerouteArmed ? (
          <>
            <span style={styles.armedCaption}>Reroute armed</span>
            <button
              type="button"
              className="ttl-btn ttl-focusable"
              style={styles.rerouteBtn}
              onClick={event => onOpenReroute(event.currentTarget)}>
              Reroute delivery
            </button>
          </>
        ) : (
          <span style={styles.restCaption}>Scrub past the split to arm reroute</span>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// EMPTY STATES & SKELETONS
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  icon: typeof LuggageIcon;
  title: string;
  body: string;
  action?: {label: string; onClick: () => void};
}

function EmptyState({icon, title, body, action}: EmptyStateProps) {
  return (
    <div style={styles.emptyState}>
      <span style={styles.emptyCircle}>
        <Icon icon={icon} size="lg" color="inherit" />
      </span>
      <h2 style={styles.emptyTitle}>{title}</h2>
      <p style={styles.emptyBody}>{body}</p>
      {action != null ? (
        <button type="button" className="ttl-btn ttl-focusable" style={styles.emptyAction} onClick={action.onClick}>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
            <Icon icon={PlusIcon} size="sm" color="inherit" />
            {action.label}
          </span>
        </button>
      ) : null}
    </div>
  );
}

/** Skeleton rows at IDENTICAL heights to the rows they impersonate (72px
 * bag rows with the 48px 12px-radius square, 60px alert rows); widths
 * cycle the fixed 60/45/70 · 40/55/30 pattern. Shimmer is one shared
 * sweep, removed entirely under reduced motion. */
function SkeletonCard({variant}: {variant: 'bag' | 'alert'}) {
  const rows = [0, 1, 2];
  return (
    <div style={{...styles.listCard, position: 'relative'}} aria-busy="true">
      {rows.map(index => (
        <div key={index}>
          {index > 0 ? <div style={variant === 'bag' ? styles.rowDividerDeep : styles.rowDivider} /> : null}
          <div style={variant === 'bag' ? styles.skeletonRow72 : styles.skeletonRow60} aria-hidden>
            {variant === 'bag' ? <span style={styles.skeletonThumb} /> : null}
            <span style={styles.skeletonBars}>
              <span style={{...styles.skeletonBar, width: SKELETON_PRIMARY[index]}} />
              <span style={{...styles.skeletonBar, width: SKELETON_SECONDARY[index]}} />
            </span>
          </div>
        </div>
      ))}
      <span className="ttl-shimmer" aria-hidden />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TAB_META = [
  {id: 'bags' as const, label: 'Bags', icon: LuggageIcon},
  {id: 'alerts' as const, label: 'Alerts', icon: BellIcon},
];

export default function MobileLuggageScanTrailTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column; viewport query is the first-frame fallback.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, dispatch] = useReducer(trailReducer, INITIAL_STATE);

  // Focus plumbing — openers restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const actionOpenerRef = useRef<HTMLElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Large-title collapse: navBar center 'Bags' fades in once the 28px
  // large title has scrolled under (IntersectionObserver sentinel,
  // rootMargin offset by the 52px sticky navBar + hairline).
  const [titleUnder, setTitleUnder] = useState(false);

  const onBagsList =
    state.tab === 'bags' && state.screenByTab.bags === 'list';
  const detailBag = state.bags.find(bag => bag.id === state.detailBagId) ?? null;
  const onBagDetail = state.tab === 'bags' && state.screenByTab.bags === 'detail' && detailBag != null;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!onBagsList || sentinel == null) return undefined;
    const observer = new IntersectionObserver(
      entries => setTitleUnder(entries[0] != null && !entries[0].isIntersecting),
      {rootMargin: '-53px 0px 0px 0px', threshold: 0},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onBagsList]);

  // Per-tab scroll persistence: restore the demo scroller on tab entry.
  useEffect(() => {
    const scroller = getScrollParent(shellRef.current);
    if (scroller != null) scroller.scrollTop = state.scrollByTab[state.tab];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.tab]);

  // Focus into an opening sheet/action sheet — preventScroll, or the
  // browser scroll-reveals the animating sheet inside the locked
  // overflow-hidden column and beaches it mid-screen.
  useEffect(() => {
    if (state.sheet != null) sheetRef.current?.focus({preventScroll: true});
  }, [state.sheet]);
  useEffect(() => {
    if (state.actionSheet != null) actionCancelRef.current?.focus({preventScroll: true});
  }, [state.actionSheet]);

  const restoreActionOpener = () => {
    const opener = actionOpenerRef.current;
    if (opener != null && opener.isConnected) opener.focus();
  };
  const closeSheet = () => {
    dispatch({type: 'CLOSE_SHEET'});
    const opener = sheetOpenerRef.current;
    if (opener != null && opener.isConnected) opener.focus();
  };
  const closeActionSheet = () => {
    dispatch({type: 'CLOSE_ACTION_SHEET'});
    restoreActionOpener();
  };

  // Escape closes the TOPMOST overlay only: action sheet > sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.actionSheet != null) closeActionSheet();
      else if (state.sheet != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.actionSheet, state.sheet]);

  // DERIVED — every aggregate recomputes from the one store.
  const divergedCount = state.bags.filter(bag => bag.diverged).length;
  const totalScans = state.bags.reduce((sum, bag) => sum + bag.scans.length, 0);
  const alertBadge = state.alerts.filter(alert => alert.unread).length; // derived, never stored
  const bagsCaption = \`\${state.bags.length} \${state.bags.length === 1 ? 'bag' : 'bags'} tracked · \${divergedCount} \${
    divergedCount === 1 ? 'divergence' : 'divergences'
  } · \${totalScans} scans logged\`;

  const chipFor = (bag: Bag): {text: string; neutral: boolean} | null => {
    if (!bag.diverged) return null;
    if (state.reroute != null) return {text: \`Reroute set · \${state.reroute.windowLabel}\`, neutral: false};
    if (state.divergenceAcked) return {text: 'Acknowledged', neutral: true};
    return {text: 'Diverged at AMS', neutral: false};
  };

  const selectTab = (tab: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (tab === state.tab) {
      // The one legal reset: active-tab re-tap pops to root + scroll top.
      dispatch({type: 'RETAP_ACTIVE_TAB'});
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    dispatch({type: 'SWITCH_TAB', tab, fromScrollTop: scroller?.scrollTop ?? 0});
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    selectTab(state.tab === 'bags' ? 'alerts' : 'bags');
  };

  const openSheet = (sheet: 'ping' | 'reroute', opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    dispatch({type: 'OPEN_SHEET', sheet});
  };
  const openActionSheet = (target: NonNullable<ActionSheetId>, opener: HTMLElement) => {
    actionOpenerRef.current = opener;
    dispatch({type: 'OPEN_ACTION_SHEET', target});
  };

  const locked = state.sheet != null || state.actionSheet != null;
  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(locked ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const rerouteDraft = REROUTE_OPTIONS.find(option => option.id === state.rerouteDraftId) ?? null;
  const activeAlertId = state.actionSheet?.kind === 'alert' ? state.actionSheet.alertId : null;
  const activeAlert = activeAlertId == null ? null : (state.alerts.find(alert => alert.id === activeAlertId) ?? null);
  const activeAlertBag = activeAlert == null ? null : (state.bags.find(bag => bag.id === activeAlert.bagId) ?? null);

  // ---------------------------------------------------------------- NAV BAR
  const renderNavBar = () => {
    if (state.editMode && onBagsList) {
      // Edit mode flips the bar atomically; the count title is the ONE
      // sanctioned second live element.
      return (
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button type="button" className="ttl-btn ttl-focusable" style={styles.navTextBtn} onClick={() => dispatch({type: 'EXIT_EDIT'})}>
              Cancel
            </button>
          </div>
          <span style={styles.navTitle} aria-live="polite">
            {state.selection.length} Selected
          </span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="ttl-btn ttl-focusable"
              style={{...styles.navTextBtn, ...styles.navTextBtnStrong}}
              onClick={() => dispatch({type: 'EXIT_EDIT'})}>
              Done
            </button>
          </div>
        </header>
      );
    }
    if (onBagDetail && detailBag != null) {
      return (
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="ttl-btn ttl-focusable"
              style={styles.backBtn}
              aria-label="Back to Bags"
              onClick={() => dispatch({type: 'POP_DETAIL'})}>
              <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
              <span style={styles.backLabel}>Bags</span>
            </button>
          </div>
          <h1 style={styles.navTitle}>{detailBag.tagId}</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="ttl-btn ttl-focusable"
              style={styles.iconBtn}
              aria-label={\`More actions for \${detailBag.tagId}\`}
              aria-expanded={state.actionSheet?.kind === 'bagMenu'}
              onClick={event => openActionSheet({kind: 'bagMenu'}, event.currentTarget)}>
              <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>
      );
    }
    if (state.tab === 'alerts') {
      return (
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <TetherlineMark />
          </div>
          <h1 style={styles.navTitle}>Alerts</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="ttl-btn ttl-focusable"
              style={styles.iconBtn}
              aria-label="Refresh alerts"
              onClick={() => dispatch({type: 'REFRESH', tab: 'alerts'})}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>
      );
    }
    return (
      <header style={styles.navBar}>
        <div style={styles.navLeading}>
          <TetherlineMark />
        </div>
        <span style={{...styles.navTitle, opacity: titleUnder ? 1 : 0}} className="ttl-fade" aria-hidden={!titleUnder}>
          Bags
        </span>
        <div style={styles.navTrailing}>
          <button
            type="button"
            className="ttl-btn ttl-focusable"
            style={styles.iconBtn}
            aria-label="Refresh bags"
            onClick={() => dispatch({type: 'REFRESH', tab: 'bags'})}>
            <Icon icon={RefreshCwIcon} size="md" color="inherit" />
          </button>
          <button
            type="button"
            className="ttl-btn ttl-focusable"
            style={styles.navTextBtn}
            disabled={state.bags.length === 0}
            onClick={() => dispatch({type: 'ENTER_EDIT'})}>
            Edit
          </button>
        </div>
      </header>
    );
  };

  // ---------------------------------------------------------------- SCREENS
  const renderBagsList = () => (
    <>
      <div ref={sentinelRef} aria-hidden style={{height: 1, marginBottom: -1}} />
      <div style={styles.largeTitleBlock}>
        <h1 style={styles.largeTitle}>Bags</h1>
        <span style={styles.largeCaption}>{bagsCaption}</span>
      </div>
      {state.refreshedByTab.bags === 'done' ? (
        <div style={styles.updatedCaption} role="none">
          Updated just now
        </div>
      ) : null}
      {state.refreshedByTab.bags === 'loading' ? (
        <SkeletonCard variant="bag" />
      ) : state.bags.length === 0 ? (
        <EmptyState
          icon={LuggageIcon}
          title="No bags tracked"
          body="Add a Tetherline tag to see its scan trail here."
          action={{label: 'Add a bag', onClick: () => dispatch({type: 'ADD_BAG'})}}
        />
      ) : (
        <div style={styles.listCard}>
          {state.bags.map((bag, index) => {
            const chip = chipFor(bag);
            const confidence = confidenceFor(bag.minutesSinceScan);
            const isSelected = state.selection.includes(bag.id);
            return (
              <div key={bag.id}>
                {index > 0 ? <div style={styles.rowDividerDeep} /> : null}
                <div style={styles.bagRowWrap}>
                  {state.editMode ? (
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      className="ttl-btn ttl-focusable"
                      style={{...styles.bagRow, paddingInlineStart: 0}}
                      aria-label={bag.nickname}
                      onClick={() => dispatch({type: 'TOGGLE_SELECT', bagId: bag.id})}>
                      <span style={{...styles.selectionCircle, ...(isSelected ? styles.selectionCircleOn : null)}} aria-hidden>
                        {isSelected ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                      </span>
                      <span style={{...styles.bagThumb, background: TAG_GRADIENTS[bag.tagId]}} aria-hidden>
                        <span style={styles.bagThumbId}>{bag.tagId.slice(3)}</span>
                      </span>
                      <span style={styles.bagText}>
                        <span style={styles.bagPrimary}>{bag.nickname}</span>
                        <span style={styles.bagSecondary}>
                          <span style={styles.bagSecondaryText}>
                            {bag.tagId} · {confidence}%
                          </span>
                        </span>
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="ttl-btn ttl-focusable"
                      style={styles.bagRow}
                      aria-label={\`\${bag.nickname}, \${bag.tagId}, confidence \${confidence} percent, last scan \${bag.minutesSinceScan} minutes ago\`}
                      onClick={() => dispatch({type: 'PUSH_DETAIL', bagId: bag.id})}>
                      <span style={{...styles.bagThumb, background: TAG_GRADIENTS[bag.tagId]}} aria-hidden>
                        <span style={styles.bagThumbId}>{bag.tagId.slice(3)}</span>
                      </span>
                      <span style={styles.bagText}>
                        <span style={styles.bagPrimary}>{bag.nickname}</span>
                        <span style={styles.bagSecondary}>
                          {chip != null ? (
                            <span style={{...styles.chip, ...(chip.neutral ? styles.chipNeutral : null)}}>
                              <Icon icon={GitBranchIcon} size="sm" color="inherit" />
                              <span style={styles.chipText}>{chip.text}</span>
                            </span>
                          ) : null}
                          <span style={styles.bagSecondaryText}>
                            {bag.tagId} · {confidence}%
                          </span>
                        </span>
                      </span>
                      <span style={styles.bagMeta}>{bag.minutesSinceScan}m ago</span>
                    </button>
                  )}
                  {state.editMode ? (
                    <>
                      <button
                        type="button"
                        className="ttl-btn ttl-focusable"
                        style={{...styles.moveBtn, ...(index === 0 ? styles.toolbarBtnDisabled : null)}}
                        aria-label={\`Move \${bag.tagId} up\`}
                        disabled={index === 0}
                        onClick={() => dispatch({type: 'PATCH', patch: {bags: moveSelected(state.bags, [bag.id], -1)}})}>
                        <Icon icon={ChevronUpIcon} size="md" color="inherit" />
                      </button>
                      <button
                        type="button"
                        className="ttl-btn ttl-focusable"
                        style={{...styles.moveBtn, ...(index === state.bags.length - 1 ? styles.toolbarBtnDisabled : null)}}
                        aria-label={\`Move \${bag.tagId} down\`}
                        disabled={index === state.bags.length - 1}
                        onClick={() => dispatch({type: 'PATCH', patch: {bags: moveSelected(state.bags, [bag.id], 1)}})}>
                        <Icon icon={ChevronDownIcon} size="md" color="inherit" />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {state.bags.length > 0 ? (
        <>
          <h2 style={styles.sectionHeader}>Watch priority</h2>
          <div style={styles.listCard}>
            <div style={styles.noteRow}>
              Top row alerts first. Tap Edit to reorder or remove bags.
            </div>
          </div>
        </>
      ) : null}
    </>
  );

  const renderBagDetail = (bag: Bag) => (
    <>
      <div style={{height: 12}} />
      <div style={{paddingInline: 16}}>
        <TagIdentityCard bag={bag} />
      </div>
      <div style={{height: 12}} />
      <div style={{paddingInline: 16}}>
        <StalenessMeter bag={bag} />
      </div>
      <h2 style={styles.sectionHeader}>Scan chain</h2>
      <ScanChainTimeline bag={bag} />
      {bag.diverged ? (
        <>
          <h2 style={styles.sectionHeader}>Divergence</h2>
          <DivergenceLanes
            playheadIndex={state.playheadIndex}
            splitPulseSeq={state.splitPulseSeq}
            rerouteArmed={state.rerouteArmed}
            reducedMotion={reducedMotion}
            onSetIndex={(index, arm) => dispatch({type: 'SET_PLAYHEAD', index, arm})}
            onOpenReroute={opener => openSheet('reroute', opener)}
          />
        </>
      ) : null}
      <div style={{height: 24}} />
    </>
  );

  const renderAlerts = () => (
    <>
      <div style={{height: 12}} />
      {state.refreshedByTab.alerts === 'done' ? (
        <div style={styles.updatedCaption} role="none">
          Updated just now
        </div>
      ) : null}
      {state.refreshedByTab.alerts === 'loading' ? (
        <SkeletonCard variant="alert" />
      ) : state.alerts.length === 0 ? (
        // Zero-action true-empty variant (legal): both alerts acknowledged.
        <EmptyState icon={BellOffIcon} title="No alerts" body="Scan alerts for your tracked bags appear here." />
      ) : (
        <div style={styles.listCard}>
          {state.alerts.map((alert, index) => (
            <div key={alert.id}>
              {index > 0 ? <div style={styles.rowDivider} /> : null}
              <div style={styles.alertRowWrap}>
                <button
                  type="button"
                  className="ttl-btn ttl-focusable"
                  style={styles.alertRow}
                  aria-label={\`Acknowledge: \${alert.body}\`}
                  onClick={() => dispatch({type: 'ACK_ALERT', alertId: alert.id})}>
                  <span style={styles.alertIconWrap} aria-hidden>
                    <Icon icon={alert.kind === 'divergence' ? GitBranchIcon : BatteryLowIcon} size="md" color="inherit" />
                  </span>
                  <span style={styles.alertText}>
                    <span style={styles.alertPrimary}>{alert.title}</span>
                    <span style={styles.alertSecondary}>
                      {alert.body} · {alert.timeLabel}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  className="ttl-btn ttl-focusable"
                  style={styles.iconBtn}
                  aria-label={\`Actions for \${alert.title}\`}
                  aria-expanded={state.actionSheet?.kind === 'alert' && state.actionSheet.alertId === alert.id}
                  onClick={event => openActionSheet({kind: 'alert', alertId: alert.id}, event.currentTarget)}>
                  <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ---------------------------------------------------------------- RENDER
  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{TTL_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {renderNavBar()}

        <main style={styles.main}>
          {state.tab === 'bags' ? (onBagDetail && detailBag != null ? renderBagDetail(detailBag) : renderBagsList()) : renderAlerts()}
        </main>

        {/* TOAST DOCK — sticky-in-flow, ONE polite region; bottom 76 above
            the tabBar, 156 above bagDetail's footer stack. Toasts persist
            (no timers): Undo, replacement, or nothing. */}
        <div
          style={{...styles.toastAnchor, bottom: onBagDetail ? 156 : 76}}
          aria-live="polite"
          role="status">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="ttl-fade">
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undo ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="ttl-btn ttl-focusable" style={styles.toastUndo} onClick={() => dispatch({type: 'UNDO'})}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Sticky footer — bagDetail only, ABOVE the still-visible tabBar
            (bottom: 64); never double-stacked with the reroute verb, which
            lives in the sheet. */}
        {onBagDetail && detailBag != null ? (
          <div style={styles.stickyFooter}>
            <button
              type="button"
              className="ttl-btn ttl-focusable"
              style={styles.primaryBtn}
              onClick={event => openSheet('ping', event.currentTarget)}>
              Ping tag
            </button>
          </div>
        ) : null}

        {/* TAB BAR ⇄ EDIT TOOLBAR (identical 64px geometry). */}
        {state.editMode && onBagsList ? (
          <div style={styles.editToolbar}>
            <button
              type="button"
              className="ttl-btn ttl-focusable"
              style={{
                ...styles.toolbarBtn,
                ...styles.toolbarDestructive,
                ...(state.selection.length === 0 ? styles.toolbarBtnDisabled : null),
              }}
              disabled={state.selection.length === 0}
              onClick={() => dispatch({type: 'REMOVE_SELECTED'})}>
              Remove bag
            </button>
            <div style={styles.toolbarGroup}>
              <button
                type="button"
                className="ttl-btn ttl-focusable"
                style={{...styles.toolbarBtn, ...(state.selection.length === 0 ? styles.toolbarBtnDisabled : null)}}
                disabled={state.selection.length === 0}
                onClick={() => dispatch({type: 'MOVE_SELECTED', dir: -1})}>
                <Icon icon={ChevronUpIcon} size="sm" color="inherit" />
                Move up
              </button>
              <button
                type="button"
                className="ttl-btn ttl-focusable"
                style={{...styles.toolbarBtn, ...(state.selection.length === 0 ? styles.toolbarBtnDisabled : null)}}
                disabled={state.selection.length === 0}
                onClick={() => dispatch({type: 'MOVE_SELECTED', dir: 1})}>
                <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                Move down
              </button>
            </div>
          </div>
        ) : (
          <nav style={styles.tabBar} role="tablist" aria-label="Tetherline sections" onKeyDown={onTabKeyDown}>
            {TAB_META.map(tab => {
              const isActive = state.tab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  className="ttl-btn ttl-focusable"
                  style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                  onClick={() => selectTab(tab.id)}>
                  <span style={styles.tabIconWrap}>
                    <Icon icon={tab.icon} size="lg" color="inherit" />
                    {tab.id === 'alerts' && alertBadge > 0 ? (
                      <span style={styles.tabBadge} aria-label={\`\${alertBadge} unread alerts\`}>
                        {alertBadge}
                      </span>
                    ) : null}
                  </span>
                  <span style={isActive ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* OVERLAYS — scrim z40 under sheet/actionSheet z41. */}
        {state.sheet != null || state.actionSheet != null ? (
          <div
            style={styles.sheetScrim}
            onClick={() => (state.actionSheet != null ? closeActionSheet() : closeSheet())}
            aria-hidden
          />
        ) : null}

        {state.sheet === 'ping' && detailBag != null ? (
          <Sheet
            titleId="ttl-ping-title"
            title="Ping results"
            detent={state.sheetDetent}
            onDetentChange={detent => dispatch({type: 'PATCH', patch: {sheetDetent: detent}})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              <button type="button" className="ttl-btn ttl-focusable" style={styles.primaryBtn} onClick={closeSheet}>
                Done
              </button>
            }>
            {/* Deterministic ping fixture: 'Tag TL-7F2K responded · LIS
                carousel gateway · −62 dBm · 2 hops · matches last scan'. */}
            <div style={styles.pingHero}>
              <span style={styles.pingHeroDot} aria-hidden>
                <Icon icon={CheckIcon} size="md" color="inherit" />
              </span>
              <span style={styles.pingHeroText}>
                <span style={styles.pingHeroTitle}>Tag {detailBag.tagId} responded</span>
                <span style={styles.pingHeroSub}>as of now · {NOW_LABEL} · {TODAY_LABEL}</span>
              </span>
            </div>
            <div style={styles.pingRow}>
              <span style={styles.pingLabel}>Gateway</span>
              <span style={styles.pingValue}>{detailBag.pingGateway}</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.pingRow}>
              <span style={styles.pingLabel}>Signal</span>
              <span style={styles.pingValue}>{'−'}{Math.abs(detailBag.pingDbm)} dBm</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.pingRow}>
              <span style={styles.pingLabel}>Mesh hops</span>
              <span style={styles.pingValue}>{detailBag.pingHops}</span>
            </div>
            <div style={styles.rowDivider} />
            <div style={styles.pingRow}>
              <span style={styles.pingLabel}>Position</span>
              <span style={styles.pingValue}>Matches last scan · {detailBag.lastScanLabel}</span>
            </div>
          </Sheet>
        ) : null}

        {state.sheet === 'reroute' ? (
          <Sheet
            titleId="ttl-reroute-title"
            title="Reroute delivery"
            detent={state.sheetDetent}
            onDetentChange={detent => dispatch({type: 'PATCH', patch: {sheetDetent: detent}})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}
            footer={
              // Confirm EXECUTES immediately (undo-over-confirm): the
              // sheet closes and the persistent Undo toast carries the
              // reversal — no 'Are you sure?'.
              <button
                type="button"
                className="ttl-btn ttl-focusable"
                style={{
                  ...styles.primaryBtn,
                  ...(rerouteDraft == null
                    ? {background: 'var(--color-background-muted)', color: 'var(--color-text-secondary)'}
                    : null),
                }}
                disabled={rerouteDraft == null}
                onClick={() => {
                  dispatch({type: 'CONFIRM_REROUTE'});
                  const opener = sheetOpenerRef.current;
                  if (opener != null && opener.isConnected) opener.focus();
                }}>
                {rerouteDraft == null ? 'Choose a delivery option' : \`Confirm reroute · \${rerouteDraft.windowLabel}\`}
              </button>
            }>
            <div
              role="radiogroup"
              aria-label="Delivery options for TL-7F2K"
              onKeyDown={event => {
                if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
                event.preventDefault();
                const currentIndex = REROUTE_OPTIONS.findIndex(option => option.id === state.rerouteDraftId);
                const delta = event.key === 'ArrowDown' ? 1 : -1;
                const nextIndex = (currentIndex + delta + REROUTE_OPTIONS.length) % REROUTE_OPTIONS.length;
                dispatch({type: 'SET_REROUTE_DRAFT', optionId: REROUTE_OPTIONS[nextIndex].id});
              }}>
              {REROUTE_OPTIONS.map((option, index) => {
                const isChosen = option.id === state.rerouteDraftId;
                return (
                  <div key={option.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isChosen}
                      className="ttl-btn ttl-focusable"
                      style={styles.optionRow}
                      onClick={() => dispatch({type: 'SET_REROUTE_DRAFT', optionId: option.id})}>
                      <span style={{...styles.radioCircle, ...(isChosen ? styles.radioCircleOn : null)}} aria-hidden>
                        {isChosen ? <span style={styles.radioDot} /> : null}
                      </span>
                      <span style={styles.optionText}>
                        <span style={styles.optionPrimary}>{option.name}</span>
                        <span style={styles.optionSecondary}>{option.detail}</span>
                      </span>
                      <span style={styles.optionPrice}>{option.price}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </Sheet>
        ) : null}

        {state.actionSheet?.kind === 'bagMenu' && detailBag != null ? (
          <ActionSheet
            contextLabel={\`\${detailBag.tagId} · \${detailBag.nickname}\`}
            onClose={closeActionSheet}
            containerRef={actionSheetRef}
            cancelRef={actionCancelRef}
            rows={[
              {
                id: 'rename',
                label: 'Rename tag',
                onSelect: () => {
                  dispatch({type: 'RENAME_NOOP'});
                  restoreActionOpener();
                },
              },
              {
                id: 'share',
                label: 'Share trail',
                onSelect: () => {
                  dispatch({type: 'SHARE_TRAIL'});
                  restoreActionOpener();
                },
              },
              {
                id: 'stop',
                label: 'Stop tracking',
                destructive: true,
                // Reversible → executes immediately + Undo toast.
                onSelect: () => dispatch({type: 'STOP_TRACKING'}),
              },
            ]}
          />
        ) : null}

        {activeAlert != null ? (
          <ActionSheet
            contextLabel={activeAlert.body}
            onClose={closeActionSheet}
            containerRef={actionSheetRef}
            cancelRef={actionCancelRef}
            rows={[
              {
                id: 'view',
                label: \`View \${activeAlertBag?.tagId ?? 'bag'}\`,
                onSelect: () => dispatch({type: 'PUSH_DETAIL', bagId: activeAlert.bagId}),
              },
              {
                id: 'ack',
                label: 'Acknowledge',
                onSelect: () => dispatch({type: 'ACK_ALERT', alertId: activeAlert.id}),
              },
            ]}
          />
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};