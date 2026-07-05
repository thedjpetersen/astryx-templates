// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Lightline date-safety session
 *   ses-0704, armed 7:45 PM for tonight's plan (Bar Meridian, 214 Fount
 *   St · with Alex M. · code word Marigold · home by 11:30 PM). Four
 *   checkpoints on a 60-min interval (8:30 done / 9:30 due / 10:30 /
 *   11:30 home-safe — 8:30+60=9:30, 9:30+60=10:30, 10:30+60=11:30 ✓),
 *   two guardians (Priya Raman, Marcus Webb — 2 of MAX_GUARDIANS 3
 *   slots), four history sessions whose header stat derives live
 *   (4+3+2+3 = 12 check-ins; 190+165+110+195 = 660 min = 11h 0m ✓), and
 *   an escalation fixture (missed 9:30, elapsed 28 s → 5:00−0:28 = 4:32)
 *   entered ONLY via the Me tab's labeled DEMO CONTROLS. No Date.now(),
 *   no Math.random(), no network media — the lighthouse mark and avatar
 *   gradients are inline SVG / id-derived CSS.
 * @output Lightline — Date Safety Check-in: a 390px MOBILE pre-date
 *   safety net that behaves like a flight checklist, not a panic button.
 *   NavBar (lighthouse mark · 'Tonight' · 'Armed · next 9:30' status
 *   pill) over a Tonight tab — plan card, 5-node session timeline,
 *   two GuardianChips — with a sticky 128px ringDock (96px
 *   hold-to-confirm CheckinRing + deadline column + Options) above a
 *   64px 4-tab tabBar. Signature move: ONE completed 1200 ms hold fires
 *   completeCheckin() — a single sessionStore write that flips the
 *   checkpoint, re-etches the ring rim '9:30'→'10:30', rewrites the
 *   navBar pill, appends the green timeline node, flips BOTH guardian
 *   chips to 'updated 9:30 ✓', and announces through the one aria-live
 *   toast: five surfaces from one press, screenshot-provable. The Me
 *   tab's 'Simulate missed 9:30 check-in' arms a two-detent escalation
 *   sheet whose EscalationLadder shows exactly what happens at
 *   T+5/T+10/T+15, and cancelling it is the one place confirm beats
 *   undo (two-step in-sheet confirm that sends the code word).
 * @position Page template; emitted by `astryx template mobile-date-safety-checkin`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel). All overlays (scrim, escalation
 *   sheet, actionSheet, floating toast) are position:'absolute' INSIDE
 *   shell; position:fixed is banned. While a sheet is open, shell locks
 *   to {height:'100dvh', overflow:'hidden'} and restores on close.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for avatar-led rows); no
 *   desktop Layout frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Lightline cyan). Sanctioned non-brand literals, each
 *   with contrast math at the declaration: the amber banner/notified
 *   pair, the success-green text pair, the ≥3:1 REST_STROKE for
 *   interactive boundaries and meaningful rest fills (ring track,
 *   pending timeline beads, standby dot — the foundations amendment),
 *   the switch OFF track, and the two id-derived avatar gradients.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON —
 *   noted choice); tabBar exactly 64px, 4 tabItems flex:1 (24px icon
 *   over 11px/500 label, 4px gap); ringDock sticky bottom 64 z19,
 *   height 128 (16 pad + 96 ring + 16 pad), same blur surface as
 *   tabBar; rows 44px utility / 60px timeline nodes / 72px media;
 *   sectionHeader 13px/600 uppercase 0.06em at 32px (16 gutter + 16
 *   card pad), 20px top / 8px bottom; GuardianChips 64px, flex:1,
 *   minWidth 136. TYPE (Figtree via --font-family-body): 44/700
 *   escalation countdown (the one sanctioned oversize) · 22/700
 *   deadline time · 17/600 nav+sheet titles · 16/400 body floor ·
 *   13/400 meta · 11/500 pills+overlines; nothing under 11px;
 *   tabular-nums on every updating numeral. TONIGHT VERTICAL SUM
 *   (armed, top→bottom): navBar 52 + 12 gap + plan card 178 (44 header
 *   + 3×44 rows + 2px borders) + timeline section (46 header + 302
 *   card = 5×60 + 2px borders) + guardians section (46 header + 64
 *   chips) + 24 bottom = 724px of flow, then sticky ringDock 128 +
 *   tabBar 64. Escalating inserts a 64px full-bleed amber banner under
 *   the navBar: 724 + 64 = 788px flow.
 * Touch: every target ≥44×44 with ≥8px clearance or merged full-row;
 *   the ring is one real 96px <button> with Space/Enter hold parity
 *   plus a plain-tap path (Options → 'Mark safe'); every gesture has a
 *   visible button path (clickable grabber + X on the sheet).
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals. GuardianChips flex:1
 *   minWidth 136 — at 320: 320−32 gutter−8 gap = 280 → 140 each ≥136 ✓,
 *   never wrapping. ringDock row 16+96+16+88(Options minWidth)+16 =
 *   232 ≤ 320 ✓ with 88px slack for the deadline column (minWidth 0).
 * - navBar statusPill maxWidth 148, ellipsized at 320; plan-card values
 *   ellipsize (minWidth 0), proven by the long-venue stress string.
 * - Timeline trailing times are a fixed 72px column so the connector
 *   alignment holds at every width. History row trailing meta wraps to
 *   a second line ≤340px (container width check), never truncating.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrap
 *   (container width, not viewport) — at ≥720px the shell becomes a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout; the spec's contract is the phone
 *   experience as a centered column.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  MinusIcon,
  MoonStarIcon,
  PhoneIcon,
  PlusIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math at the declaration.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Lightline cyan). #0E7490 (cyan-700) on
// #FFFFFF ≈ 4.9:1 ✓; #67E8F9 (cyan-300) on the dark card (~#1C1C1E) ≈ 8.1:1 ✓.
const BRAND_ACCENT = 'light-dark(#0E7490, #67E8F9)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #0E7490 ≈ 5.4:1 ✓. Dark:
// white on #67E8F9 fails (~1.4:1), so the dark side flips to near-black
// cyan — #083344 on #67E8F9 ≈ 9.6:1 ✓.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #083344)';
// 12% brand wash for the statusPill fill and active-tier tints. Text on it
// uses PILL_TEXT, checked against the TINTED surface (amendment), not the
// bare body: light tint over white ≈ #E3F0F3; #155E75 (cyan-800) on it ≈
// 6.5:1 ✓ (the 11px pill text is the smallest brand-tinted text). Dark tint
// over the dark bar ≈ #22333B; #A5F3FC on it ≈ 10.2:1 ✓.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
const PILL_TEXT = 'light-dark(#155E75, #A5F3FC)';
// REST_STROKE — the ≥3:1 amendment pair for interactive boundaries and
// meaningful rest fills against their ACTUAL surface (ring rim track on the
// blur dock ≈ body, pending timeline beads + standby dot on the card):
// #64748B (slate-500) on #FFFFFF ≈ 4.7:1 ✓ (≥3:1); #94A3B8 (slate-400) on
// the dark card ≈ 6.2:1 ✓. Hairline/muted tokens stay on passive separators.
const REST_STROKE = 'light-dark(#64748B, #94A3B8)';
// Switch OFF track (interactive control boundary at rest — same amendment):
// #8A8A8E on #FFFFFF ≈ 3.5:1 ✓ (≥3:1); #98989D on the dark card ≈ 5.6:1 ✓.
const SWITCH_OFF = 'light-dark(#8A8A8E, #98989D)';
// Amber (missed check-in) text — chip 'Notified 9:35' line and banner text.
// #B45309 on the white card ≈ 4.6:1 ✓; #FCD34D on the dark card ≈ 10.9:1 ✓.
const AMBER_TEXT = 'light-dark(#B45309, #FCD34D)';
// Amber banner surface + its text: #92400E on #FEF3C7 ≈ 6.3:1 ✓; #FCD34D on
// #451A03 ≈ 8.9:1 ✓.
const BANNER_BG = 'light-dark(#FEF3C7, #451A03)';
const BANNER_TEXT = 'light-dark(#92400E, #FCD34D)';
// Success green text — 'updated 9:30 ✓' chip line, done timeline beads.
// #15803D on the white card ≈ 4.5:1 ✓; #86EFAC on the dark card ≈ 12.4:1 ✓.
const GREEN_TEXT = 'light-dark(#15803D, #86EFAC)';
// Green tint for done-bead fills (bead glyph uses GREEN_TEXT at ≥3:1).
const GREEN_TINT_14 = `color-mix(in srgb, ${GREEN_TEXT} 14%, transparent)`;
const AMBER_TINT_16 = `color-mix(in srgb, ${AMBER_TEXT} 16%, transparent)`;
// Id-derived avatar gradients (no photos by law). White 16px/700 initial:
// on #7C3AED ≈ 5.9:1 ✓; on #DC2626 ≈ 4.6:1 ✓ (the initial sits on the
// darker end of each 135° ramp).
const GRADIENTS: Record<string, string> = {
  'g-priya': 'linear-gradient(135deg, #7C3AED, #0891B2)',
  'g-marcus': 'linear-gradient(135deg, #F59E0B, #DC2626)',
};
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// Top-level reduced-motion guard (a11yPlan): rAF hold-fill, pulse, slides,
// and the ladder width transition all collapse under it.
const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// keyframes (transform/opacity only), reduced-motion collapse.
// ---------------------------------------------------------------------------

const LIGHTLINE_CSS = `
.llx-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.llx-btn:disabled { cursor: default; }
.llx-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.llx-anim { transition: transform 240ms ease, opacity 240ms ease; }
.llx-fade { transition: opacity 240ms ease; }
.llx-bar { transition: transform 800ms ease; }
@keyframes llx-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.llx-sheet-in { animation: llx-sheet-in 240ms ease; }
@keyframes llx-banner-in {
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.llx-banner-in { animation: llx-banner-in 200ms ease; }
@keyframes llx-pulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.9; }
}
.llx-pulse { animation: llx-pulse 1400ms ease-in-out infinite; }
.llx-vh {
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
  .llx-anim, .llx-fade, .llx-bar { transition: none; }
  .llx-sheet-in, .llx-banner-in, .llx-pulse { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, tabBar, tabItem,
// sheetScrim, sheet, listCard, rowDivider, sectionHeader.
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
  // Scroll lock while any sheet is open; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px CONTAINER width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; hairline + blur ALWAYS ON (this template
  // does not wire scroll-under; noted per contract).
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', minWidth: 0},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
    margin: 0,
  },
  brandBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
  },
  // 44×44 back button — leading slot on pushed screens.
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
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
  // statusPill — 28px tall, radius 999, 11px/600 tabular; inside a 44px hit.
  statusPillHit: {height: 44, display: 'flex', alignItems: 'center', borderRadius: 999},
  statusPill: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: PILL_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.02em',
    maxWidth: 148,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statusPillEscalating: {
    background: BANNER_BG,
    color: BANNER_TEXT,
  },
  // ESCALATION BANNER — 64px full-bleed (radius 0), directly under navBar;
  // a real <button> reopening the escalation sheet (the persistent
  // affordance while the sheet is dismissed).
  banner: {
    width: '100%',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
    background: BANNER_BG,
    color: BANNER_TEXT,
    fontSize: 13,
    fontWeight: 600,
    borderBottom: '1px solid var(--color-border)',
  },
  bannerText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    textAlign: 'left',
  },
  bannerSub: {fontSize: 11, fontWeight: 500, opacity: 0.9},
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  // sectionHeader — 13/600 uppercase 0.06em at 32px, 20px top / 8px bottom.
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
  rowDivider68: {height: 1, background: 'var(--color-border)', marginInlineStart: 68},
  // PLAN CARD — 44px header + 3×44 utility rows = 178 with borders.
  planHeader: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    paddingInlineEnd: 4,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: 600,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  planCount: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'right',
  },
  planEditBtn: {
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
  utilityRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  rowLabel: {fontSize: 16, whiteSpace: 'nowrap', flexShrink: 0},
  rowValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
  // TIMELINE — 60px two-line nodes; 24px glyph column with a 2px connector;
  // trailing time fixed 72px so alignment holds at all widths.
  tlRow: {
    position: 'relative',
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  tlGlyphCol: {
    position: 'relative',
    width: 24,
    height: '100%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  tlConnectorTop: {
    position: 'absolute',
    top: 0,
    bottom: 'calc(50% + 12px)',
    left: 11,
    width: 2,
    background: 'var(--color-border)', // passive separator — token is legal
  },
  tlConnectorBottom: {
    position: 'absolute',
    top: 'calc(50% + 12px)',
    bottom: 0,
    left: 11,
    width: 2,
    background: 'var(--color-border)',
  },
  tlBead: {
    position: 'relative',
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
  },
  tlBeadDone: {background: GREEN_TINT_14, color: GREEN_TEXT},
  tlBeadDue: {background: AMBER_TINT_16, color: AMBER_TEXT},
  // Future bead = meaningful rest fill → REST_STROKE (≥3:1 amendment), not
  // a hairline token.
  tlBeadPending: {border: `2px solid ${REST_STROKE}`, color: REST_STROKE},
  tlBeadInfo: {border: `2px solid ${REST_STROKE}`, color: 'var(--color-text-secondary)'},
  tlText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  tlPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tlSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tlSecondaryDue: {color: AMBER_TEXT, fontWeight: 500},
  tlSecondaryDone: {color: GREEN_TEXT},
  tlTime: {
    width: 72,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // GUARDIAN CHIPS — 2 per row, flex:1, minWidth 136, 64px, 8px gap.
  chipRow: {display: 'flex', gap: 8, paddingInline: 16},
  chip: {
    position: 'relative',
    flex: 1,
    minWidth: 136,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 10,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  chipAvatar: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 700,
  },
  chipText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  chipName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipState: {
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // 8px state dot centered in a 20px badge — meaningful rest fill,
  // explicit pairs per the amendment (never bare tokens). DEVIATION:
  // anchored on the avatar's bottom-trailing corner (presence-dot idiom,
  // card-surface ring) instead of center-trailing, because a trailing
  // badge leaves only ~71px of text column in the chip's 175px share of a
  // 390 stage — this way 'Priya Raman' AND 'updated 8:30 ✓' both render
  // untruncated (the long-name alt fixture still exercises the ellipsis).
  chipBadge: {
    position: 'absolute',
    left: 36,
    top: 34,
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
  },
  chipDot: {width: 8, height: 8, borderRadius: '50%'},
  // GUARDIANS TAB — 72px media rows + 44px invite row + caption.
  mediaRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  mediaText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  inviteRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
  },
  caption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Guardian detail screen.
  detailHero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '24px 16px 12px',
    textAlign: 'center',
  },
  detailAvatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 700,
  },
  detailName: {fontSize: 22, fontWeight: 700, margin: 0},
  detailMeta: {fontSize: 13, color: 'var(--color-text-secondary)'},
  callGuardianBtn: {
    height: 36,
    paddingInline: 16,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    border: `1px solid ${BRAND_ACCENT}`,
    color: BRAND_ACCENT,
    fontSize: 16,
    fontWeight: 600,
    marginTop: 4,
  },
  // HISTORY — summary header row + 72px session rows.
  historySummary: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    background: 'var(--color-background-muted)',
  },
  historyRow: {
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    paddingBlock: 8,
  },
  historyThumb: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  historyBody: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'nowrap',
  },
  historyBodyNarrow: {flexWrap: 'wrap', rowGap: 2},
  historyText: {minWidth: 0, flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: 2},
  historyMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // EMPTY STATE (HISTORY_EMPTY alt fixture) — per emptyAndSkeleton.
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0'},
  // ME TAB — settings rows, switch, stepper, value pills.
  valuePill: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 51×31 switch — whole 44px row is the role=switch button.
  switchTrack: {
    width: 51,
    height: 31,
    flexShrink: 0,
    borderRadius: 999,
    position: 'relative',
    background: SWITCH_OFF,
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
  // 96×32 stepper — halves reach 44px hits via the row's padding.
  stepper: {
    width: 96,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    background: 'var(--color-background-muted)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperHalf: {
    flex: 1,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-primary)',
  },
  stepperRule: {width: 1, background: 'var(--color-border)'},
  stepperValue: {
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  demoRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    fontSize: 16,
    color: BRAND_ACCENT,
    fontWeight: 500,
  },
  demoRowDisabled: {color: 'var(--color-text-secondary)', opacity: 0.5},
  // RING DOCK — sticky bottom 64 (above tabBar), z19, height 128
  // (16 + 96 + 16); same blur surface as the tabBar.
  ringDock: {
    position: 'sticky',
    bottom: 64,
    zIndex: 19,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    height: 128,
    paddingInline: 16,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--color-border)',
  },
  // Due state: dock lifts 4px (transform only; instant under reduced
  // motion, where the pulse becomes a static 2px outer glow instead).
  ringDockDue: {transform: 'translateY(-4px)'},
  ringBtn: {
    position: 'relative',
    width: 96,
    height: 96,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
  },
  ringGlow: {boxShadow: `0 0 0 2px ${BRAND_ACCENT}`},
  ringInner: {
    position: 'absolute',
    inset: 6,
    borderRadius: '50%',
    background: 'var(--color-background-card)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    pointerEvents: 'none',
  },
  ringHoldLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  ringCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  ringDeadlineLabel: {fontSize: 13, color: 'var(--color-text-secondary)'},
  ringDeadlineTime: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  optionsBtn: {
    height: 36,
    minWidth: 88,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginTop: 4,
  },
  // TAB BAR — exactly 64px; 4 tabs flex:1.
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 64,
    color: 'var(--color-text-secondary)',
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  // TOAST — sticky-in-flow anchor (height 0) per the batch amendment:
  // absolute bottom:N pins to the DOCUMENT bottom on tall scrolling views.
  // While the shell is scroll-locked (sheet open) it flips to the
  // shell-absolute variant, which is legal only in that locked state.
  toastAnchor: {
    position: 'sticky',
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastFloat: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 'calc(100% - 48px)',
    minHeight: 36,
    paddingInline: 16,
    paddingBlock: 8,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastStatic: {position: 'static'},
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
  iconBtn44: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // Escalation countdown block.
  countBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingBlock: 8,
    textAlign: 'center',
  },
  countOverline: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  countNumeral: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  countTerminal: {fontSize: 22, fontWeight: 700, color: AMBER_TEXT},
  cancelBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    marginTop: 12,
  },
  cancelBtnConfirm: {background: AMBER_TEXT, color: 'light-dark(#FFFFFF, #451A03)'},
  cancelCaption: {
    margin: '8px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  // EscalationLadder — 3 rungs × 44px in a listCard inside the sheet.
  ladderCard: {
    marginTop: 16,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  rung: {
    position: 'relative',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 12,
  },
  rungActive: {boxShadow: `inset 0 0 0 2px ${BRAND_ACCENT}`},
  rungBadge: {
    minWidth: 36,
    height: 20,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    border: `1px solid ${REST_STROKE}`,
    color: 'var(--color-text-secondary)',
  },
  rungBadgeFired: {
    border: 'none',
    background: GREEN_TINT_14,
    color: GREEN_TEXT,
  },
  rungLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rungGlyph: {width: 20, flexShrink: 0, display: 'grid', placeItems: 'center', color: 'var(--color-text-secondary)'},
  rungGlyphFired: {color: GREEN_TEXT},
  // 3px bottom progress bar — scaleX reflects elapsedSec/300; only moves on
  // the visible demo button's writes (800ms transition, none under RM).
  rungBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    background: BRAND_ACCENT,
    transformOrigin: 'left center',
  },
  // Guardian script cards (large detent).
  scriptCard: {
    marginTop: 12,
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  scriptHead: {display: 'flex', alignItems: 'center', gap: 10},
  scriptAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  scriptName: {fontSize: 16, fontWeight: 600, flex: 1, minWidth: 0},
  scriptText: {
    background: 'var(--color-background-muted)',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    lineHeight: '18px',
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
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  asRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  asDivider: {height: 1, background: 'var(--color-border)'},
  asCancel: {fontWeight: 600},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields (min + label), fixed strings, no
// clocks. Cross-check ledger (verified by hand): checkpoints 8:30+60=9:30,
// 9:30+60=10:30, 10:30+60=11:30 ✓; done count 1 of 4 ✓; history 4+3+2+3=12
// check-ins ✓ and 190+165+110+195=660 min = 11h 0m ✓; escalation
// 5:00−0:28=4:32 ✓; rung ladder 3 × 5 min = 15 min ✓; extend twice
// 11:30 PM+30+30 = 12:30 AM (midnight rollover stress) ✓.
// ---------------------------------------------------------------------------

const SESSION_ID = 'ses-0704';
const MAX_GUARDIANS = 3;

// The signed-in user is a named entity like any other roster member.
const USER = {id: 'u-dana', name: 'Dana K.'};

interface GuardianFixture {
  id: string;
  name: string;
  initial: string;
  phone: string;
  since: string;
  notifyVia: string;
}

const GUARDIANS: GuardianFixture[] = [
  {
    id: 'g-priya',
    name: 'Priya Raman',
    initial: 'P',
    phone: '(415) 555-0142',
    since: 'Guardian since May 2026',
    notifyVia: 'Text first, then call',
  },
  {
    id: 'g-marcus',
    name: 'Marcus Webb',
    // STRESS ALT (2): swap the display name to
    // 'Alexandria Konstantinopoulos-Whitfield' — the chip name ellipsizes,
    // the state line stays intact.
    initial: 'M',
    phone: '(628) 555-0177',
    since: 'Guardian since Jun 2026',
    notifyVia: 'Call immediately',
  },
];

const PLAN = {
  venue: 'Bar Meridian, 214 Fount St',
  // STRESS ALT (1): the long-venue string — must single-line ellipsize at
  // 320 without pushing the row's trailing edge:
  // 'The Botanical Conservatory Rooftop at Grand Meridian Hotel'
  withWho: 'Alex M. · code word Marigold',
  codeWord: 'Marigold',
  homeBy: '11:30 PM',
  homeByMin: 1410, // 23:30
};

type CheckpointStatus = 'done' | 'due' | 'pending';

interface Checkpoint {
  id: string;
  min: number; // minutes since midnight; may exceed 1440 after extensions
  kind: 'checkin' | 'homesafe';
  status: CheckpointStatus;
}

// Interval 60 min from the first check: 1230 (8:30 PM) → 1290 → 1350 →
// homesafe 1410 (11:30 PM). Done count = 1 of 4 → plan header '1 of 4
// check-ins done' ✓.
const CHECKPOINTS: Checkpoint[] = [
  {id: 'c1', min: 1230, kind: 'checkin', status: 'done'},
  {id: 'c2', min: 1290, kind: 'checkin', status: 'due'},
  {id: 'c3', min: 1350, kind: 'checkin', status: 'pending'},
  {id: 'c4', min: 1410, kind: 'homesafe', status: 'pending'},
];

type EventTone = 'done' | 'info';

interface SessionEvent {
  id: string;
  min: number;
  label: string;
  detail: string;
  tone: EventTone;
  icon: 'shield' | 'pin' | 'check' | 'phone';
}

// Armed/arrived are EVENTS, not checkpoints — which is why the timeline
// shows 3 green nodes while the plan header says 1 of 4 check-ins done.
const EVENTS: SessionEvent[] = [
  {id: 'e-armed', min: 1185, label: 'Session armed', detail: `Guardians on standby · ${SESSION_ID}`, tone: 'done', icon: 'shield'},
  {id: 'e-arrived', min: 1202, label: 'Arrived at Bar Meridian', detail: 'Location matched the plan', tone: 'done', icon: 'pin'},
  {id: 'e-c1', min: 1230, label: 'Checked in', detail: 'Both guardians updated', tone: 'done', icon: 'check'},
];

type GuardianStanding = 'standby' | 'notified' | 'acknowledged';

interface GuardianState {
  id: string;
  standing: GuardianStanding;
  stateLine: string;
}

// At rest both guardians acknowledged the 8:30 check-in.
const GUARDIAN_STATES: GuardianState[] = [
  {id: 'g-priya', standing: 'acknowledged', stateLine: 'updated 8:30 ✓'},
  {id: 'g-marcus', standing: 'acknowledged', stateLine: 'updated 8:30 ✓'},
];

interface HistoryRow {
  id: string;
  kind: 'session' | 'alert';
  title: string;
  sub: string;
  checkins: number;
  durationMin: number;
  meta: string; // '4 check-ins · 3h 10m' — dual-field render of the two above
}

// Header stat derives live: 4 nights · 4+3+2+3 = 12 check-ins ·
// 190+165+110+195 = 660 min = 11h 0m ✓. Terminal caption 'All 4 sessions'.
const HISTORY: HistoryRow[] = [
  {id: 'h-0627', kind: 'session', title: 'Jun 27', sub: 'Cafe Solene', checkins: 4, durationMin: 190, meta: '4 check-ins · 3h 10m'},
  {id: 'h-0619', kind: 'session', title: 'Jun 19', sub: 'Pin & Feather', checkins: 3, durationMin: 165, meta: '3 check-ins · 2h 45m'},
  {id: 'h-0612', kind: 'session', title: 'Jun 12', sub: 'Union Hall', checkins: 2, durationMin: 110, meta: '2 check-ins · 1h 50m'},
  {id: 'h-0605', kind: 'session', title: 'Jun 5', sub: 'The Greenline', checkins: 3, durationMin: 195, meta: '3 check-ins · 3h 15m'},
];

// STRESS ALT (8): true-empty History — swap HISTORY for HISTORY_EMPTY to
// render the MoonStar empty state (zero buttons — creation isn't History's
// verb).
// const HISTORY_EMPTY: HistoryRow[] = [];

interface Rung {
  tMin: 5 | 10 | 15;
  label: string;
  fired: boolean;
}

const RUNGS: Rung[] = [
  {tMin: 5, label: 'Text Priya & Marcus your plan + code word', fired: false},
  {tMin: 10, label: 'Auto-call both guardians', fired: false},
  {tMin: 15, label: 'Share live location + local resources', fired: false},
];

interface Escalation {
  missedAtMin: number; // 1290 = 9:30 PM
  elapsedSec: number; // 28 at entry → 5:00 − 0:28 = 4:32 ✓
  rungs: Rung[];
}

const ESCALATION_FIXTURE: Escalation = {
  missedAtMin: 1290,
  elapsedSec: 28,
  rungs: RUNGS,
};

// Guardian SMS scripts (large detent) — the exact text Lightline sends.
function scriptFor(guardian: GuardianFixture): string {
  return (
    `Lightline: Hi ${guardian.name.split(' ')[0]} — ${USER.name} missed her 9:30 PM ` +
    `check-in at ${PLAN.venue}. Plan: with Alex M., home by ${PLAN.homeBy}. ` +
    `Reply when you reach her. All-clear code word: ${PLAN.codeWord}.`
  );
}

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Minutes-since-midnight (rollover-safe) → '9:30 PM' / '12:00 AM'. */
function fmtClock(min: number): string {
  const total = ((min % 1440) + 1440) % 1440;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Short clock for the pill + ring rim — '9:30', '12:00'. */
function fmtShort(min: number): string {
  return fmtClock(min).replace(/ [AP]M$/, '');
}

/** Seconds → 'm:ss' countdown ('4:32'). */
function fmtMmSs(sec: number): string {
  const s = Math.max(0, sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Minutes → '11h 0m'. */
function fmtHm(min: number): string {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — sessionStore per the spec: one useState object, one
// update(patch) plus update-by-id helpers; every surface reads from it and
// every mutation lands as ONE write with cross-surface consequences.
// ---------------------------------------------------------------------------

type TabId = 'tonight' | 'guardians' | 'history' | 'me';
type OverlayId = null | 'options' | 'escalation';

interface SessionStore {
  tab: TabId;
  // Push-stack per tab (screenByTab law): guardians pushes 'g-priya' /
  // 'g-marcus'; the other tabs are single-root.
  screenByTab: {tonight: string; guardians: string; history: string; me: string};
  overlay: OverlayId;
  sheetDetent: 'medium' | 'large';
  cancelStep: 0 | 1;
  status: 'armed' | 'escalating' | 'complete';
  checkpoints: Checkpoint[];
  events: SessionEvent[];
  guardians: GuardianState[];
  escalation: Escalation | null;
  history: HistoryRow[];
  intervalMin: number;
  haptics: boolean;
  toast: string;
}

const INITIAL_STORE: SessionStore = {
  tab: 'tonight',
  screenByTab: {tonight: 'root', guardians: 'root', history: 'root', me: 'root'},
  overlay: null,
  sheetDetent: 'medium',
  cancelStep: 0,
  status: 'armed',
  checkpoints: CHECKPOINTS,
  events: EVENTS,
  guardians: GUARDIAN_STATES,
  escalation: null,
  history: HISTORY,
  intervalMin: 60,
  haptics: true,
  toast: '',
};

/** First checkpoint that has not been completed (drives pill/ring/dock). */
function nextCheckpoint(checkpoints: Checkpoint[]): Checkpoint | null {
  return checkpoints.find(c => c.status !== 'done') ?? null;
}

/** Countdown to the next unfired rung: nextRungMin*60 − elapsedSec. */
function rungCountdownSec(escalation: Escalation): number | null {
  const next = escalation.rungs.find(r => !r.fired);
  if (next == null) return null;
  return next.tMin * 60 - escalation.elapsedSec;
}

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

/** Nearest scrollable ancestor — the demo's .preview-wrap owns page scroll. */
function getScroller(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;
  while (current != null) {
    const style = window.getComputedStyle(current);
    if (
      current.scrollHeight > current.clientHeight &&
      (style.overflowY === 'auto' || style.overflowY === 'scroll')
    ) {
      return current;
    }
    current = current.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
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
// LIGHTHOUSE MARK — 8px anchored dot + 270° stroked beam arc. Stroke uses
// var(--color-text-primary) (house rule: never var(--color-text)).
// ---------------------------------------------------------------------------

function LighthouseMark() {
  return (
    <span style={styles.brandMark} aria-hidden>
      <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
        {/* 270° arc: from 12 o'clock clockwise to 9 o'clock, r=6.5. */}
        <path
          d="M 9 2.5 A 6.5 6.5 0 1 1 2.5 9"
          stroke="var(--color-text-primary)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* 8px anchored dot (r=4 at the 18px mark scale → 4px radius dot
            rendered as r=2 in this 18-unit viewBox × 28px slot ≈ 8px). */}
        <circle cx="9" cy="9" r="2" fill={BRAND_ACCENT} />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// CHECKIN RING — 96×96 hold-to-confirm. One real <button>; pointer AND
// Space/Enter hold semantics are identical; the plain-tap path is the
// Options sheet's 'Mark safe'. Circumference 2π×44 = 276.46 (comment per
// spec). Hold progress is the sanctioned transient-pointer-state exception
// to the single owner — it lives here, everything durable lives in the
// store write fired exactly once at progress 1.0.
// ---------------------------------------------------------------------------

const RING_C = 276.46; // 2 × π × 44

interface CheckinRingProps {
  deadlineShort: string; // '9:30' — etched on the rim textPath
  deadlineLabel: string; // '9:30 PM' — aria
  due: boolean;
  disabled: boolean;
  onComplete: () => void;
}

function CheckinRing({deadlineShort, deadlineLabel, due, disabled, onComplete}: CheckinRingProps) {
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(false);
  const rafRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const firedRef = useRef(false);
  const holdingRef = useRef(false);

  const clearTimers = () => {
    cancelAnimationFrame(rafRef.current);
    for (const t of timersRef.current) window.clearTimeout(t);
    timersRef.current = [];
  };
  useEffect(() => clearTimers, []);

  const complete = useCallback(() => {
    if (firedRef.current) return; // fires exactly once per hold
    firedRef.current = true;
    holdingRef.current = false;
    clearTimers();
    setFlash(true);
    setProgress(1);
    onComplete();
    timersRef.current.push(
      window.setTimeout(
        () => {
          setFlash(false);
          setProgress(0);
        },
        REDUCED_MOTION ? 0 : 200,
      ),
    );
  }, [onComplete]);

  const startHold = useCallback(() => {
    if (disabled || holdingRef.current) return;
    holdingRef.current = true;
    firedRef.current = false;
    clearTimers();
    if (REDUCED_MOTION) {
      // Static 3-step fill: empty → half at 600 ms → full at 1200 ms.
      setProgress(0);
      timersRef.current.push(window.setTimeout(() => setProgress(0.5), 600));
      timersRef.current.push(window.setTimeout(complete, 1200));
      return;
    }
    const startedAt = performance.now();
    const from = 0;
    const step = (now: number) => {
      const p = Math.min(1, from + (now - startedAt) / 1200);
      setProgress(p);
      if (p >= 1) {
        complete();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [complete, disabled]);

  const releaseHold = useCallback(() => {
    if (!holdingRef.current || firedRef.current) {
      holdingRef.current = false;
      return;
    }
    holdingRef.current = false;
    clearTimers();
    if (REDUCED_MOTION) {
      setProgress(0);
      return;
    }
    // Drain at 3× speed (≤400 ms from full).
    const startedAt = performance.now();
    setProgress(prev => {
      const from = prev;
      const step = (now: number) => {
        const p = Math.max(0, from - ((now - startedAt) / 400) * from);
        setProgress(p);
        if (p > 0) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
      return prev;
    });
  }, []);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      event.preventDefault();
      startHold();
    }
  };
  const onKeyUp = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      releaseHold();
    }
  };

  const arcColor = flash ? 'var(--color-success)' : BRAND_ACCENT;
  const showStaticGlow = due && REDUCED_MOTION;
  return (
    <button
      type="button"
      className="llx-btn llx-focusable"
      style={{...styles.ringBtn, ...(showStaticGlow ? styles.ringGlow : null)}}
      aria-label={disabled ? 'All check-ins complete' : `Hold to check in, next deadline ${deadlineLabel}`}
      disabled={disabled}
      onPointerDown={startHold}
      onPointerUp={releaseHold}
      onPointerLeave={releaseHold}
      onPointerCancel={releaseHold}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}>
      <svg width={96} height={96} viewBox="0 0 96 96" fill="none" aria-hidden>
        <defs>
          {/* Top arc for the rim countdown textPath (r=33, inside disc). */}
          <path id="llx-rim-arc" d="M 20 40 A 33 33 0 0 1 76 40" fill="none" />
        </defs>
        {/* Rim track — interactive control boundary at rest → REST_STROKE
            (≥3:1 vs the dock surface; math at the declaration), not the
            hairline token. */}
        <circle cx={48} cy={48} r={44} stroke={REST_STROKE} strokeWidth={4} opacity={0.55} />
        {/* Due pulse — opacity keyframes; removed under reduced motion
            (static 2px outer glow ring on the button instead). */}
        {due && !disabled && !REDUCED_MOTION ? (
          <circle className="llx-pulse" cx={48} cy={48} r={44} stroke={BRAND_ACCENT} strokeWidth={4} />
        ) : null}
        {/* Hold-progress arc: 2π×44 = 276.46; dashoffset (1−p)×C. */}
        <circle
          cx={48}
          cy={48}
          r={44}
          stroke={arcColor}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={(1 - progress) * RING_C}
          transform="rotate(-90 48 48)"
        />
      </svg>
      <span style={styles.ringInner} aria-hidden>
        <span style={{color: disabled ? GREEN_TEXT : BRAND_ACCENT, display: 'inline-flex'}}>
          <Icon icon={disabled ? CheckIcon : ShieldCheckIcon} size="lg" color="inherit" />
        </span>
        <span style={styles.ringHoldLabel}>{disabled ? 'DONE' : 'HOLD'}</span>
      </span>
      {/* Rim-etched next deadline — 11px/600 tabular on the top arc. */}
      <svg
        width={96}
        height={96}
        viewBox="0 0 96 96"
        style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
        aria-hidden>
        <text
          fontSize={11}
          fontWeight={600}
          fill="var(--color-text-secondary)"
          style={{fontVariantNumeric: 'tabular-nums'}}>
          <textPath href="#llx-rim-arc" startOffset="50%" textAnchor="middle">
            {disabled ? '✓' : deadlineShort}
          </textPath>
        </text>
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// GUARDIAN CHIP — 64px trusted-contact chip; the WHOLE chip is a <button>
// pushing that guardian's detail on the Guardians tab. State flips are pure
// sessionStore reads — no local state.
// ---------------------------------------------------------------------------

const STANDING_COLORS: Record<GuardianStanding, {text: string; dot: string; tint: string}> = {
  // Standby dot = meaningful rest fill → REST_STROKE pair, never a bare
  // hairline token (amendment).
  standby: {text: 'var(--color-text-secondary)', dot: REST_STROKE, tint: 'transparent'},
  notified: {text: AMBER_TEXT, dot: AMBER_TEXT, tint: AMBER_TINT_16},
  acknowledged: {text: GREEN_TEXT, dot: GREEN_TEXT, tint: GREEN_TINT_14},
};

interface GuardianChipProps {
  guardian: GuardianFixture;
  state: GuardianState;
  onOpen: () => void;
}

function GuardianChip({guardian, state, onOpen}: GuardianChipProps) {
  const colors = STANDING_COLORS[state.standing];
  const stateText = state.standing === 'standby' ? 'Standby' : state.stateLine;
  return (
    <button
      type="button"
      className="llx-btn llx-focusable"
      style={styles.chip}
      aria-label={`${guardian.name}, ${stateText} — open guardian details`}
      onClick={onOpen}>
      <span style={{...styles.chipAvatar, background: GRADIENTS[guardian.id]}} aria-hidden>
        {guardian.initial}
      </span>
      <span style={styles.chipText}>
        <span style={styles.chipName}>{guardian.name}</span>
        <span style={{...styles.chipState, color: colors.text}}>{stateText}</span>
      </span>
      <span style={styles.chipBadge} aria-hidden>
        <span style={{...styles.chipDot, background: colors.dot}} />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// ESCALATION LADDER — 3 rungs × 44px. The active rung's 3px bottom bar is
// scaleX(elapsed-within-rung / 300) and ONLY moves when the visible
// 'Advance escalation +5 min' demo button writes state (800 ms width
// transition smooths each write; none under reduced motion).
// ---------------------------------------------------------------------------

function EscalationLadder({escalation}: {escalation: Escalation}) {
  const activeIndex = escalation.rungs.findIndex(r => !r.fired);
  return (
    <div style={styles.ladderCard}>
      {escalation.rungs.map((rung, index) => {
        const isActive = index === activeIndex;
        const withinRung = isActive
          ? Math.max(0, Math.min(1, (escalation.elapsedSec - (rung.tMin - 5) * 60) / 300))
          : 0;
        return (
          <div key={rung.tMin}>
            {index > 0 ? <div style={styles.asDivider} /> : null}
            <div style={{...styles.rung, ...(isActive ? styles.rungActive : null)}}>
              <span style={{...styles.rungBadge, ...(rung.fired ? styles.rungBadgeFired : null)}}>
                T+{rung.tMin}
              </span>
              <span style={styles.rungLabel}>{rung.label}</span>
              <span style={{...styles.rungGlyph, ...(rung.fired ? styles.rungGlyphFired : null)}}>
                <Icon icon={rung.fired ? CheckIcon : ClockIcon} size="sm" color="inherit" />
              </span>
              {isActive ? (
                <span
                  className="llx-bar"
                  style={{...styles.rungBar, transform: `scaleX(${withinRung})`}}
                  aria-hidden
                />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TIMELINE — completed EVENTS, then the next upcoming checkpoint, then the
// terminal home-safe checkpoint. Interim future checks collapse (the
// checklist shows what's next, not every future row) — which is why the
// rest state is exactly 5 nodes while c3 exists in the fixture.
// ---------------------------------------------------------------------------

interface TimelineNode {
  id: string;
  label: string;
  detail: string;
  min: number;
  tone: 'done' | 'due' | 'pending' | 'info';
  icon: 'shield' | 'pin' | 'check' | 'phone' | 'clock' | 'moon';
  isDueAction: boolean;
}

function deriveTimeline(store: SessionStore): TimelineNode[] {
  const nodes: TimelineNode[] = store.events.map(event => ({
    id: event.id,
    label: event.label,
    detail: event.detail,
    min: event.min,
    tone: event.tone,
    icon: event.icon,
    isDueAction: false,
  }));
  const next = nextCheckpoint(store.checkpoints);
  if (next != null && next.kind === 'checkin') {
    const due = next.status === 'due';
    nodes.push({
      id: next.id,
      label: 'Check-in',
      detail:
        store.status === 'escalating'
          ? 'Missed — escalation armed'
          : due
            ? 'Due now — hold the ring below'
            : 'Scheduled',
      min: next.min,
      tone: due ? 'due' : 'pending',
      icon: 'clock',
      isDueAction: due && store.status === 'armed',
    });
  }
  const homesafe = store.checkpoints.find(c => c.kind === 'homesafe');
  if (homesafe != null && homesafe.status !== 'done') {
    nodes.push({
      id: homesafe.id,
      label: 'Home safe',
      detail: 'Ends the session, tells everyone',
      min: homesafe.min,
      tone: 'pending',
      icon: 'moon',
      isDueAction: false,
    });
  }
  return nodes;
}

const NODE_ICONS = {
  shield: ShieldCheckIcon,
  pin: MapPinIcon,
  check: CheckIcon,
  phone: PhoneIcon,
  clock: ClockIcon,
  moon: MoonStarIcon,
} as const;

const BEAD_STYLES: Record<TimelineNode['tone'], CSSProperties> = {
  done: styles.tlBeadDone,
  due: styles.tlBeadDue,
  pending: styles.tlBeadPending,
  info: styles.tlBeadInfo,
};

interface TimelineCardProps {
  nodes: TimelineNode[];
  onDueTap: (opener: HTMLElement) => void;
}

function TimelineCard({nodes, onDueTap}: TimelineCardProps) {
  return (
    <div style={styles.listCard}>
      {nodes.map((node, index) => {
        const inner = (
          <>
            <span style={styles.tlGlyphCol} aria-hidden>
              {index > 0 ? <span style={styles.tlConnectorTop} /> : null}
              {index < nodes.length - 1 ? <span style={styles.tlConnectorBottom} /> : null}
              <span style={{...styles.tlBead, ...BEAD_STYLES[node.tone]}}>
                <Icon icon={NODE_ICONS[node.icon]} size="xsm" color="inherit" />
              </span>
            </span>
            <span style={styles.tlText}>
              <span style={styles.tlPrimary}>
                {node.label}
                {node.tone === 'done' ? ' ✓' : ''}
              </span>
              <span
                style={{
                  ...styles.tlSecondary,
                  ...(node.tone === 'due' ? styles.tlSecondaryDue : null),
                  ...(node.tone === 'done' ? styles.tlSecondaryDone : null),
                }}>
                {node.detail}
              </span>
            </span>
            <span style={styles.tlTime}>{fmtClock(node.min)}</span>
          </>
        );
        return (
          <div key={node.id}>
            {node.isDueAction ? (
              <button
                type="button"
                className="llx-btn llx-focusable"
                style={styles.tlRow}
                aria-label={`Check-in due ${fmtClock(node.min)} — open check-in options`}
                onClick={event => onDueTap(event.currentTarget)}>
                {inner}
              </button>
            ) : (
              <div style={styles.tlRow}>{inner}</div>
            )}
            {index < nodes.length - 1 ? <div style={styles.rowDivider} /> : null}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — Lightline Date Safety Check-in.
// ---------------------------------------------------------------------------

const TAB_META: Array<{id: TabId; label: string; icon: typeof UserIcon}> = [
  {id: 'tonight', label: 'Tonight', icon: ShieldCheckIcon},
  {id: 'guardians', label: 'Guardians', icon: UsersIcon},
  {id: 'history', label: 'History', icon: ClockIcon},
  {id: 'me', label: 'Me', icon: UserIcon},
];

const TAB_TITLES: Record<TabId, string> = {
  tonight: 'Tonight',
  guardians: 'Guardians',
  history: 'History',
  me: 'Me',
};

export default function MobileDateSafetyCheckinPage() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const actionSheetRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const scrollByTabRef = useRef<Partial<Record<TabId, number>>>({});
  const lockScrollRef = useRef(0);
  const outcallSeqRef = useRef(0);

  const width = useElementWidth(wrapRef);
  // First-frame fallback only — the desktop stage is ~1045px inside a
  // 1440px window, so container width is the real signal.
  const viewportWide = useMediaQuery('(min-width: 720px)');
  const isDesktop = width > 0 ? width >= 720 : viewportWide;
  const historyNarrow = width > 0 && width <= 340;

  const [store, setStore] = useState<SessionStore>(INITIAL_STORE);
  // The one update(patch) helper; entity-level writes compose prev-state.
  const update = useCallback((patch: Partial<SessionStore>) => {
    setStore(prev => ({...prev, ...patch}));
  }, []);

  const next = nextCheckpoint(store.checkpoints);
  const doneCount = store.checkpoints.filter(c => c.status === 'done').length;
  const timeline = deriveTimeline(store);
  const overlayOpen = store.overlay != null;
  const guardiansScreen = store.screenByTab.guardians;
  const detailGuardian =
    store.tab === 'guardians' && guardiansScreen !== 'root'
      ? GUARDIANS.find(g => g.id === guardiansScreen) ?? null
      : null;
  const escalation = store.escalation;
  const countdownSec = escalation != null ? rungCountdownSec(escalation) : null;
  const dockVisible = store.tab === 'tonight';
  const ringDue = next?.status === 'due' && store.status === 'armed';

  // navBar status pill — one derived string, tabular, ellipsized at 148px.
  const pillText =
    store.status === 'escalating'
      ? `Escalating · T-${countdownSec != null ? fmtMmSs(countdownSec) : '0:00'}`
      : store.status === 'complete'
        ? 'Home safe ✓'
        : next != null
          ? `Armed · next ${fmtShort(next.min)}`
          : 'Armed';

  // Scroll-lock bookkeeping: save the demo scroller's position when the
  // shell locks to 100dvh, restore on unlock.
  useEffect(() => {
    const scroller = getScroller(shellRef.current);
    if (scroller == null) return;
    if (overlayOpen) {
      lockScrollRef.current = scroller.scrollTop;
    } else {
      scroller.scrollTop = lockScrollRef.current;
    }
  }, [overlayOpen]);

  // Per-tab scroll restore (positions recorded in selectTab).
  useEffect(() => {
    const scroller = getScroller(shellRef.current);
    if (scroller != null) {
      scroller.scrollTop = scrollByTabRef.current[store.tab] ?? 0;
    }
  }, [store.tab]);

  // Focus into overlays with preventScroll (amendment: plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen); restore to opener on close.
  useEffect(() => {
    if (store.overlay === 'escalation') {
      sheetRef.current?.focus({preventScroll: true});
    } else if (store.overlay === 'options') {
      // Safe default: first focus lands on the Cancel row.
      actionSheetRef.current
        ?.querySelector<HTMLElement>('[data-cancel-row]')
        ?.focus({preventScroll: true});
    }
  }, [store.overlay]);
  useEffect(() => {
    if (!overlayOpen && openerRef.current != null) {
      openerRef.current.focus({preventScroll: true});
      openerRef.current = null;
    }
  }, [overlayOpen]);

  // Escape closes the TOPMOST overlay only. Closing the escalation sheet
  // does NOT cancel the escalation — the amber banner + pill remain the
  // persistent affordance (deliberate; cancel requires the two-step).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (store.overlay != null) {
        update({overlay: null, cancelStep: 0});
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store.overlay, update]);

  // TAB NAVIGATION — per-tab persistence; overlays close on switch, toast
  // persists; re-tapping the active tab pops to root + scrolls to top (the
  // one legal reset).
  const selectTab = (tab: TabId) => {
    const scroller = getScroller(shellRef.current);
    if (tab === store.tab) {
      setStore(prev => ({
        ...prev,
        screenByTab: {...prev.screenByTab, [tab]: 'root'},
      }));
      scroller?.scrollTo({top: 0});
      return;
    }
    if (scroller != null) scrollByTabRef.current[store.tab] = scroller.scrollTop;
    setStore(prev => ({...prev, tab, overlay: null, cancelStep: 0}));
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TAB_META.map(t => t.id);
    const index = order.indexOf(store.tab);
    const nextTab = order[(index + (event.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length];
    selectTab(nextTab);
    document.getElementById(`llx-tab-${nextTab}`)?.focus();
  };

  // WIRE (1) — completeCheckin(): ONE write flips the checkpoint, advances
  // the deadline (pill + ring rim + dock), appends the green timeline node,
  // flips BOTH guardian chips, and announces via the single toast. Five
  // surfaces from one press.
  const completeCheckin = useCallback(() => {
    setStore(prev => {
      if (prev.status !== 'armed') return prev;
      const target = nextCheckpoint(prev.checkpoints);
      if (target == null) return prev;
      const short = fmtShort(target.min);
      const isHome = target.kind === 'homesafe';
      return {
        ...prev,
        status: isHome ? 'complete' : 'armed',
        overlay: null,
        cancelStep: 0,
        checkpoints: prev.checkpoints.map(c =>
          c.id === target.id ? {...c, status: 'done' as const} : c,
        ),
        events: [
          ...prev.events,
          {
            id: `e-${target.id}`,
            min: target.min,
            label: isHome ? 'Home safe' : 'Checked in',
            detail: isHome ? 'Session complete — everyone told' : 'Both guardians updated',
            tone: 'done' as const,
            icon: isHome ? ('shield' as const) : ('check' as const),
          },
        ],
        guardians: prev.guardians.map(g => ({
          ...g,
          standing: 'acknowledged' as const,
          stateLine: `updated ${short} ✓`,
        })),
        toast: isHome
          ? 'Home safe — session complete, guardians updated'
          : 'Checked in — guardians updated',
      };
    });
  }, []);

  // WIRE (2b) — Extend 30 min: shifts every non-done checkpoint +30
  // (midnight rollover: 11:30 PM+30+30 = 12:30 AM, fmtClock is
  // rollover-safe; tabular-nums keep the pill width stable).
  const extendThirty = useCallback(() => {
    setStore(prev => {
      if (prev.status !== 'armed') return prev;
      const checkpoints = prev.checkpoints.map(c =>
        c.status === 'done' ? c : {...c, min: c.min + 30},
      );
      const upcoming = nextCheckpoint(checkpoints);
      return {
        ...prev,
        checkpoints,
        overlay: null,
        cancelStep: 0,
        toast: upcoming != null ? `Extended — next check ${fmtShort(upcoming.min)}` : 'Extended 30 min',
      };
    });
  }, []);

  // WIRE (2c) — the discreet out-call.
  const requestOutCall = useCallback(() => {
    outcallSeqRef.current += 1;
    setStore(prev => ({
      ...prev,
      overlay: null,
      cancelStep: 0,
      events: [
        ...prev.events,
        {
          id: `e-outcall-${outcallSeqRef.current}`,
          min: 1272, // 9:12 PM — fixed fixture string, no clock
          label: 'Out-call requested',
          detail: 'A discreet ring in 2 minutes',
          tone: 'info' as const,
          icon: 'phone' as const,
        },
      ],
      toast: "We'll call in 2 minutes",
    }));
  }, []);

  // WIRE (3) — Simulate missed check-in (Me tab, labeled DEMO CONTROLS):
  // banner + amber pill + auto-opened medium-detent escalation sheet.
  const simulateMissed = useCallback(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setStore(prev => {
      if (prev.status !== 'armed') return prev;
      return {
        ...prev,
        status: 'escalating',
        escalation: ESCALATION_FIXTURE,
        overlay: 'escalation',
        sheetDetent: 'medium',
        cancelStep: 0,
        toast: 'Escalation armed — guardians notified in 4 minutes 32 seconds',
      };
    });
  }, []);

  // DEMO — Advance escalation +5 min: adds 300 s and fires the crossed
  // rung. Press 1 → 328 s, T+5 fired, Priya 'Notified 9:35' (9:30+5 ✓),
  // History gains the alert row; press 2 → T+10, both guardians notified;
  // press 3 → 928 s > 900, all rungs fired, countdown goes terminal.
  const advanceEscalation = useCallback(() => {
    setStore(prev => {
      const esc = prev.escalation;
      if (esc == null || prev.status !== 'escalating') return prev;
      const elapsedSec = esc.elapsedSec + 300;
      const firedNow = esc.rungs.filter(r => !r.fired && elapsedSec >= r.tMin * 60);
      const rungs = esc.rungs.map(r =>
        firedNow.some(f => f.tMin === r.tMin) ? {...r, fired: true} : r,
      );
      let guardians = prev.guardians;
      let history = prev.history;
      let toast = prev.toast;
      for (const rung of firedNow) {
        const atMin = esc.missedAtMin + rung.tMin;
        const at = fmtShort(atMin);
        if (rung.tMin === 5) {
          guardians = guardians.map(g =>
            g.id === 'g-priya' ? {...g, standing: 'notified' as const, stateLine: `Notified ${at}`} : g,
          );
          history = [
            {
              id: `h-alert-${rung.tMin}`,
              kind: 'alert' as const,
              title: 'Lightline notified Priya',
              sub: 'Missed 9:30 check-in — plan + code word sent',
              checkins: 0,
              durationMin: 0,
              meta: `Tonight, ${fmtClock(atMin)}`,
            },
            ...history,
          ];
          toast = `T+5 — texted Priya & Marcus your plan (${fmtClock(atMin)})`;
        } else if (rung.tMin === 10) {
          guardians = guardians.map(g =>
            g.id === 'g-marcus' ? {...g, standing: 'notified' as const, stateLine: `Notified ${at}`} : g,
          );
          history = [
            {
              id: `h-alert-${rung.tMin}`,
              kind: 'alert' as const,
              title: 'Lightline called both guardians',
              sub: 'Auto-call after missed check-in',
              checkins: 0,
              durationMin: 0,
              meta: `Tonight, ${fmtClock(atMin)}`,
            },
            ...history,
          ];
          toast = `T+10 — auto-calling both guardians (${fmtClock(atMin)})`;
        } else {
          history = [
            {
              id: `h-alert-${rung.tMin}`,
              kind: 'alert' as const,
              title: 'Live location shared',
              sub: 'Guardians + local resources can see you',
              checkins: 0,
              durationMin: 0,
              meta: `Tonight, ${fmtClock(atMin)}`,
            },
            ...history,
          ];
          toast = 'T+15 — live location shared, all guardians engaged';
        }
      }
      return {...prev, escalation: {...esc, elapsedSec, rungs}, guardians, history, toast};
    });
  }, []);

  // WIRE (4) — two-step cancel: the ONE place confirm beats undo (sending
  // the code word to guardians is not undoable). First press morphs the
  // button; a stray tap anywhere else in the sheet resets to step 1
  // (deliberate — see sheet onClickCapture).
  const cancelEscalationPress = useCallback(() => {
    setStore(prev => {
      if (prev.status !== 'escalating') return prev;
      if (prev.cancelStep === 0) {
        return {...prev, cancelStep: 1, toast: 'Press again to confirm'};
      }
      return {
        ...prev,
        status: 'armed',
        escalation: null,
        overlay: null,
        cancelStep: 0,
        guardians: prev.guardians.map(g => ({
          ...g,
          standing: 'acknowledged' as const,
          stateLine: 'updated 8:30 ✓', // reverts to the pre-escalation state
        })),
        events: [
          ...prev.events,
          {
            id: 'e-cancel',
            min: 1294, // 9:34 PM
            label: 'Escalation cancelled',
            detail: `Code word ${PLAN.codeWord} sent to guardians`,
            tone: 'done' as const,
            icon: 'check' as const,
          },
        ],
        toast: `All clear — code word ${PLAN.codeWord} sent`,
      };
    });
  }, []);

  // Stepper — re-spaces pending check-ins after the next deadline; the
  // home-by checkpoint is the PLAN's, so it never moves.
  const stepInterval = useCallback((delta: number) => {
    setStore(prev => {
      const value = Math.min(120, Math.max(30, prev.intervalMin + delta));
      if (value === prev.intervalMin) return prev;
      const anchor = nextCheckpoint(prev.checkpoints);
      let laterIndex = 0;
      const checkpoints = prev.checkpoints.map(c => {
        if (c.status === 'done' || anchor == null || c.id === anchor.id || c.kind === 'homesafe') {
          return c;
        }
        if (c.min > anchor.min && c.kind === 'checkin') {
          laterIndex += 1;
          return {...c, min: anchor.min + value * laterIndex};
        }
        return c;
      });
      return {...prev, intervalMin: value, checkpoints, toast: `Check-ins every ${value} min`};
    });
  }, []);

  const openOptions = (opener: HTMLElement | null) => {
    openerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update({overlay: 'options'});
  };
  const openEscalationSheet = (opener: HTMLElement | null) => {
    openerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update({overlay: 'escalation', sheetDetent: 'medium', cancelStep: 0});
  };
  const closeOverlay = () => update({overlay: null, cancelStep: 0});

  const resetDemo = () => {
    setStore({...INITIAL_STORE, tab: 'me', toast: 'Demo reset — session re-armed · 7:45 PM'});
  };

  // Stray taps inside the escalation sheet reset the two-step cancel to
  // step 1 — deliberate: confirm-beats-undo HERE because sending the code
  // word to guardians cannot be undone.
  const onSheetClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (store.cancelStep === 1 && (event.target as HTMLElement).closest('[data-cancel-btn]') == null) {
      update({cancelStep: 0});
    }
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktop ? styles.shellDesktop : null),
  };

  // Guardians-tab helpers.
  const stateFor = (id: string): GuardianState =>
    store.guardians.find(g => g.id === id) ?? {id, standing: 'standby', stateLine: 'Standby'};

  // History aggregates derive LIVE from the rows (cross-check in fixtures).
  const historySessions = store.history.filter(h => h.kind === 'session');
  const historyCheckins = historySessions.reduce((sum, h) => sum + h.checkins, 0);
  const historyMinutes = historySessions.reduce((sum, h) => sum + h.durationMin, 0);

  const utilityRow = (label: string, value: string, key: string): ReactNode => (
    <div key={key} style={styles.utilityRow}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowValue}>{value}</span>
    </div>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{LIGHTLINE_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — 52px, grid '1fr auto 1fr', hairline always on. */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {detailGuardian != null ? (
              <button
                type="button"
                className="llx-btn llx-focusable"
                style={styles.backBtn}
                aria-label="Back to Guardians"
                onClick={() =>
                  setStore(prev => ({
                    ...prev,
                    screenByTab: {...prev.screenByTab, guardians: 'root'},
                  }))
                }>
                <Icon icon={ChevronLeftIcon} size="lg" color="inherit" />
                <span style={styles.backLabel}>Guardians</span>
              </button>
            ) : (
              <button
                type="button"
                className="llx-btn llx-focusable"
                style={styles.brandBtn}
                aria-label="Lightline — go to Tonight"
                onClick={() => selectTab('tonight')}>
                <LighthouseMark />
              </button>
            )}
          </div>
          <h2 style={styles.navTitle}>
            {detailGuardian != null ? detailGuardian.name : TAB_TITLES[store.tab]}
          </h2>
          <div style={styles.navTrailing}>
            {/* statusPill — a real affordance: escalating → reopen the
                sheet; otherwise → jump to Tonight's dock. */}
            <button
              type="button"
              className="llx-btn llx-focusable"
              style={styles.statusPillHit}
              aria-label={
                store.status === 'escalating'
                  ? `${pillText} — review escalation`
                  : `Session status: ${pillText}`
              }
              onClick={event =>
                store.status === 'escalating'
                  ? openEscalationSheet(event.currentTarget)
                  : selectTab('tonight')
              }>
              <span
                style={{
                  ...styles.statusPill,
                  ...(store.status === 'escalating' ? styles.statusPillEscalating : null),
                }}>
                {pillText}
              </span>
            </button>
          </div>
        </header>

        <h1 className="llx-vh">{detailGuardian != null ? detailGuardian.name : TAB_TITLES[store.tab]}</h1>

        <main style={styles.main}>
          {/* ------------------------------------------------ TONIGHT --- */}
          {store.tab === 'tonight' ? (
            <>
              {store.status === 'escalating' ? (
                <button
                  type="button"
                  className="llx-btn llx-focusable llx-banner-in"
                  style={styles.banner}
                  aria-label="Missed 9:30 check-in — escalation armed. Review escalation."
                  onClick={event => openEscalationSheet(event.currentTarget)}>
                  <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
                  <span style={styles.bannerText}>
                    <span>Missed 9:30 check-in — escalation armed</span>
                    <span style={styles.bannerSub}>
                      {countdownSec != null
                        ? `T-${fmtMmSs(countdownSec)} to next step · tap to review`
                        : 'All guardians engaged · tap to review'}
                    </span>
                  </span>
                  <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                </button>
              ) : null}

              {/* PLAN CARD — 44 header + 3×44 rows = 178px. */}
              <div style={{...styles.listCard, marginTop: 12}}>
                <div style={styles.planHeader}>
                  <span style={styles.planTitle}>Tonight&rsquo;s plan</span>
                  <span style={styles.planCount}>{doneCount} of {store.checkpoints.length} check-ins done</span>
                  <button
                    type="button"
                    className="llx-btn llx-focusable"
                    style={styles.planEditBtn}
                    onClick={() => update({toast: 'Plan is locked while the session is armed'})}>
                    Edit
                  </button>
                </div>
                <div style={styles.rowDivider} />
                {utilityRow('Where', PLAN.venue, 'p-where')}
                <div style={styles.rowDivider} />
                {utilityRow('With', PLAN.withWho, 'p-with')}
                <div style={styles.rowDivider} />
                {utilityRow('Home by', PLAN.homeBy, 'p-home')}
              </div>

              <h2 style={styles.sectionHeader}>Session timeline</h2>
              <TimelineCard nodes={timeline} onDueTap={openOptions} />

              <h2 style={styles.sectionHeader}>Guardians</h2>
              <div style={styles.chipRow}>
                {GUARDIANS.map(guardian => (
                  <GuardianChip
                    key={guardian.id}
                    guardian={guardian}
                    state={stateFor(guardian.id)}
                    onOpen={() =>
                      setStore(prev => ({
                        ...prev,
                        tab: 'guardians',
                        overlay: null,
                        cancelStep: 0,
                        screenByTab: {...prev.screenByTab, guardians: guardian.id},
                      }))
                    }
                  />
                ))}
              </div>
              <div style={{height: 24}} />
            </>
          ) : null}

          {/* ---------------------------------------------- GUARDIANS --- */}
          {store.tab === 'guardians' && detailGuardian == null ? (
            <>
              <div style={{...styles.listCard, marginTop: 12}}>
                {GUARDIANS.map((guardian, index) => {
                  const state = stateFor(guardian.id);
                  const colors = STANDING_COLORS[state.standing];
                  return (
                    <div key={guardian.id}>
                      {index > 0 ? <div style={styles.rowDivider68} /> : null}
                      <button
                        type="button"
                        className="llx-btn llx-focusable"
                        style={styles.mediaRow}
                        aria-label={`${guardian.name} — guardian details`}
                        onClick={() =>
                          setStore(prev => ({
                            ...prev,
                            screenByTab: {...prev.screenByTab, guardians: guardian.id},
                          }))
                        }>
                        <span style={{...styles.chipAvatar, background: GRADIENTS[guardian.id]}} aria-hidden>
                          {guardian.initial}
                        </span>
                        <span style={styles.mediaText}>
                          <span style={styles.chipName}>{guardian.name}</span>
                          <span style={{...styles.chipState, color: colors.text}}>
                            {state.standing === 'standby' ? 'Standby' : state.stateLine}
                            {' · '}
                            {guardian.notifyVia}
                          </span>
                        </span>
                        <span style={{color: 'var(--color-text-secondary)', display: 'inline-flex'}}>
                          <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                        </span>
                      </button>
                    </div>
                  );
                })}
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  className="llx-btn llx-focusable"
                  style={styles.inviteRow}
                  onClick={() =>
                    update({toast: `Guardian invite ready — ${MAX_GUARDIANS - GUARDIANS.length} slot left`})
                  }>
                  <Icon icon={PlusIcon} size="sm" color="inherit" />
                  Invite a guardian
                </button>
              </div>
              {/* MAX_GUARDIANS=3 → '2 of 3 guardian slots used' ✓ */}
              <p style={styles.caption}>
                {GUARDIANS.length} of {MAX_GUARDIANS} guardian slots used
              </p>
              <div style={{height: 24}} />
            </>
          ) : null}

          {store.tab === 'guardians' && detailGuardian != null ? (
            <>
              <div style={styles.detailHero}>
                <span style={{...styles.detailAvatar, background: GRADIENTS[detailGuardian.id]}} aria-hidden>
                  {detailGuardian.initial}
                </span>
                <h2 style={styles.detailName}>{detailGuardian.name}</h2>
                <span style={styles.detailMeta}>{detailGuardian.since}</span>
                <button
                  type="button"
                  className="llx-btn llx-focusable"
                  style={styles.callGuardianBtn}
                  onClick={() => update({toast: `Calling ${detailGuardian.name.split(' ')[0]}…`})}>
                  <Icon icon={PhoneIcon} size="sm" color="inherit" />
                  Call {detailGuardian.name.split(' ')[0]} now
                </button>
              </div>
              <div style={styles.listCard}>
                {utilityRow('Phone', detailGuardian.phone, 'd-phone')}
                <div style={styles.rowDivider} />
                {utilityRow('Notify via', detailGuardian.notifyVia, 'd-notify')}
                <div style={styles.rowDivider} />
                {utilityRow(
                  'Tonight',
                  stateFor(detailGuardian.id).standing === 'standby'
                    ? 'Standby'
                    : stateFor(detailGuardian.id).stateLine,
                  'd-state',
                )}
              </div>
              <h2 style={styles.sectionHeader}>Can see during escalation</h2>
              <div style={styles.listCard}>
                {utilityRow('Your plan', 'Venue, who, home-by', 'd-plan')}
                <div style={styles.rowDivider} />
                {utilityRow('Live location', 'After T+15 only', 'd-loc')}
              </div>
              <div style={{height: 24}} />
            </>
          ) : null}

          {/* ------------------------------------------------ HISTORY --- */}
          {store.tab === 'history' ? (
            <>
              {store.history.length === 0 ? (
                /* TRUE-EMPTY (HISTORY_EMPTY alt fixture): zero buttons —
                   creation isn't History's verb. */
                <div style={styles.emptyState}>
                  <span style={styles.emptyIconCircle}>
                    <Icon icon={MoonStarIcon} size="lg" color="inherit" />
                  </span>
                  <h2 style={styles.emptyTitle}>No past sessions</h2>
                  <p style={styles.emptyBody}>Your completed nights appear here.</p>
                </div>
              ) : (
                <>
                  <div style={{...styles.listCard, marginTop: 12}}>
                    {/* Header stat derives LIVE: 4+3+2+3 = 12 · 660 min = 11h 0m ✓ */}
                    <div style={styles.historySummary}>
                      Watched over {historySessions.length} nights · {historyCheckins} check-ins ·{' '}
                      {fmtHm(historyMinutes)}
                    </div>
                    {store.history.map(row => (
                      <div key={row.id}>
                        <div style={styles.rowDivider} />
                        <div style={styles.historyRow}>
                          <span
                            style={{
                              ...styles.historyThumb,
                              ...(row.kind === 'alert'
                                ? {background: AMBER_TINT_16, color: AMBER_TEXT}
                                : null),
                            }}
                            aria-hidden>
                            <Icon
                              icon={row.kind === 'alert' ? TriangleAlertIcon : ShieldCheckIcon}
                              size="sm"
                              color="inherit"
                            />
                          </span>
                          <span
                            style={{
                              ...styles.historyBody,
                              ...(historyNarrow ? styles.historyBodyNarrow : null),
                            }}>
                            <span style={styles.historyText}>
                              <span style={styles.chipName}>{row.title}</span>
                              <span style={styles.tlSecondary}>{row.sub}</span>
                            </span>
                            <span style={styles.historyMeta}>{row.meta}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={styles.caption}>All {historySessions.length} sessions</p>
                </>
              )}
              <div style={{height: 24}} />
            </>
          ) : null}

          {/* ----------------------------------------------------- ME --- */}
          {store.tab === 'me' ? (
            <>
              <div style={{...styles.listCard, marginTop: 12}}>
                <button
                  type="button"
                  className="llx-btn llx-focusable"
                  style={styles.utilityRow}
                  onClick={() =>
                    update({toast: `Code word ${PLAN.codeWord} — shared only when you cancel an escalation`})
                  }>
                  <span style={{...styles.rowLabel, flex: 1}}>Code word</span>
                  <span style={styles.valuePill}>{PLAN.codeWord}</span>
                </button>
                <div style={styles.rowDivider} />
                {/* 96×32 stepper; halves reach 44px hits via row padding. */}
                <div style={styles.utilityRow}>
                  <span style={{...styles.rowLabel, flex: 1}}>Check-in interval</span>
                  <span style={styles.stepper}>
                    <button
                      type="button"
                      className="llx-btn llx-focusable"
                      style={{...styles.stepperHalf, opacity: store.intervalMin <= 30 ? 0.35 : 1}}
                      aria-label="Decrease check-in interval"
                      disabled={store.intervalMin <= 30}
                      onClick={() => stepInterval(-15)}>
                      <Icon icon={MinusIcon} size="sm" color="inherit" />
                    </button>
                    <span style={styles.stepperRule} aria-hidden />
                    <button
                      type="button"
                      className="llx-btn llx-focusable"
                      style={{...styles.stepperHalf, opacity: store.intervalMin >= 120 ? 0.35 : 1}}
                      aria-label="Increase check-in interval"
                      disabled={store.intervalMin >= 120}
                      onClick={() => stepInterval(15)}>
                      <Icon icon={PlusIcon} size="sm" color="inherit" />
                    </button>
                  </span>
                  <span
                    className="llx-focusable"
                    style={styles.stepperValue}
                    role="spinbutton"
                    tabIndex={0}
                    aria-label="Check-in interval in minutes"
                    aria-valuenow={store.intervalMin}
                    aria-valuemin={30}
                    aria-valuemax={120}
                    onKeyDown={event => {
                      if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        stepInterval(15);
                      } else if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        stepInterval(-15);
                      }
                    }}>
                    {store.intervalMin} min
                  </span>
                </div>
                <div style={styles.rowDivider} />
                {/* 51×31 switch — the ENTIRE 44px row is the role=switch. */}
                <button
                  type="button"
                  className="llx-btn llx-focusable"
                  style={styles.utilityRow}
                  role="switch"
                  aria-checked={store.haptics}
                  onClick={() => update({haptics: !store.haptics})}>
                  <span style={{...styles.rowLabel, flex: 1}}>Check-in haptics</span>
                  <span
                    style={{...styles.switchTrack, ...(store.haptics ? styles.switchTrackOn : null)}}
                    aria-hidden>
                    <span
                      className="llx-anim"
                      style={{...styles.switchThumb, ...(store.haptics ? styles.switchThumbOn : null)}}
                    />
                  </span>
                </button>
              </div>

              {/* The deterministic fixture path, visibly labeled. */}
              <h2 style={styles.sectionHeader}>Demo controls</h2>
              <div style={styles.listCard}>
                <button
                  type="button"
                  className="llx-btn llx-focusable"
                  style={{
                    ...styles.demoRow,
                    ...(store.status !== 'armed' ? styles.demoRowDisabled : null),
                  }}
                  disabled={store.status !== 'armed'}
                  onClick={simulateMissed}>
                  Simulate missed 9:30 check-in
                </button>
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  className="llx-btn llx-focusable"
                  style={{
                    ...styles.demoRow,
                    ...(store.status !== 'escalating' ? styles.demoRowDisabled : null),
                  }}
                  disabled={store.status !== 'escalating'}
                  onClick={advanceEscalation}>
                  Advance escalation +5 min
                </button>
                <div style={styles.rowDivider} />
                <button
                  type="button"
                  className="llx-btn llx-focusable"
                  style={styles.demoRow}
                  onClick={resetDemo}>
                  Reset session
                </button>
              </div>
              <p style={styles.caption}>
                Signed in as {USER.name} · session {SESSION_ID}
              </p>
              <div style={{height: 24}} />
            </>
          ) : null}
        </main>

        {/* THE one polite live region — sticky-in-flow dock (amendment:
            shell-absolute pins to the DOCUMENT bottom on tall views); flips
            to the legal shell-absolute variant only while scroll-locked. */}
        <div
          style={
            overlayOpen
              ? styles.toastFloat
              : {...styles.toastAnchor, bottom: dockVisible ? 204 : 76}
          }
          aria-live="polite">
          {store.toast !== '' ? (
            <div style={{...styles.toast, ...(overlayOpen ? styles.toastStatic : null)}}>
              {store.toast}
            </div>
          ) : null}
        </div>

        {/* RING DOCK — Tonight only; sticky bottom 64, height 128. Due
            state lifts the dock 4px + pulses the rim (static glow under
            reduced motion). */}
        {dockVisible ? (
          <div
            className="llx-anim"
            style={{...styles.ringDock, ...(ringDue ? styles.ringDockDue : null)}}>
            <CheckinRing
              deadlineShort={next != null ? fmtShort(next.min) : '—'}
              deadlineLabel={next != null ? fmtClock(next.min) : 'none'}
              due={ringDue}
              disabled={store.status !== 'armed' || next == null}
              onComplete={completeCheckin}
            />
            <div style={styles.ringCol}>
              <span
                style={{
                  ...styles.ringDeadlineLabel,
                  ...(store.status === 'escalating' ? {color: AMBER_TEXT, fontWeight: 600} : null),
                }}>
                {store.status === 'complete'
                  ? 'Session complete'
                  : store.status === 'escalating'
                    ? 'Missed check-in'
                    : next?.kind === 'homesafe'
                      ? 'Home safe by'
                      : 'Next check-in'}
              </span>
              <span style={styles.ringDeadlineTime}>
                {store.status === 'complete'
                  ? 'Home safe ✓'
                  : next != null
                    ? fmtClock(next.min)
                    : '—'}
              </span>
              {store.status === 'escalating' ? (
                <button
                  type="button"
                  className="llx-btn llx-focusable"
                  style={styles.optionsBtn}
                  onClick={event => openEscalationSheet(event.currentTarget)}>
                  Review
                </button>
              ) : store.status === 'armed' ? (
                <button
                  type="button"
                  className="llx-btn llx-focusable"
                  style={styles.optionsBtn}
                  aria-label="Check-in options"
                  onClick={event => openOptions(event.currentTarget)}>
                  Options
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* TAB BAR — exactly 64px, 4 tabs, arrow-key tablist. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Lightline sections" onKeyDown={onTabKeyDown}>
          {TAB_META.map(tab => {
            const isActive = store.tab === tab.id;
            return (
              <button
                key={tab.id}
                id={`llx-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                className="llx-btn llx-focusable"
                style={{...styles.tabItem, ...(isActive ? styles.tabItemActive : null)}}
                onClick={() => selectTab(tab.id)}>
                <Icon icon={tab.icon} size="lg" color="inherit" />
                <span style={{...styles.tabLabel, ...(isActive ? styles.tabLabelActive : null)}}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* -------------------------------------------- ACTION SHEET --- */}
        {store.overlay === 'options' ? (
          <>
            <div style={styles.sheetScrim} onClick={closeOverlay} aria-hidden />
            <div
              ref={actionSheetRef}
              className="llx-sheet-in"
              style={styles.actionSheetWrap}
              role="dialog"
              aria-modal="true"
              aria-label={`Check-in options for tonight at ${PLAN.venue.split(',')[0]}`}
              onKeyDown={event => trapTabKey(event, actionSheetRef.current)}>
              <div style={styles.asCard}>
                <div style={styles.asHeader}>
                  Check-in options for tonight at {PLAN.venue.split(',')[0]}
                </div>
                <div style={styles.asDivider} />
                {/* 'Mark safe' is the ring's plain-tap keyboard path. */}
                <button type="button" className="llx-btn llx-focusable" style={styles.asRow} onClick={completeCheckin}>
                  Mark safe
                </button>
                <div style={styles.asDivider} />
                <button type="button" className="llx-btn llx-focusable" style={styles.asRow} onClick={extendThirty}>
                  Extend 30 min
                </button>
                <div style={styles.asDivider} />
                <button type="button" className="llx-btn llx-focusable" style={styles.asRow} onClick={requestOutCall}>
                  Call me with an out
                </button>
              </div>
              <div style={styles.asCard}>
                <button
                  type="button"
                  data-cancel-row
                  className="llx-btn llx-focusable"
                  style={{...styles.asRow, ...styles.asCancel}}
                  onClick={closeOverlay}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* ---------------------------------------- ESCALATION SHEET --- */}
        {store.overlay === 'escalation' && escalation != null ? (
          <>
            {/* Scrim click closes the SHEET only — escalation itself is
                cancelled exclusively by the two-step confirm. */}
            <div style={styles.sheetScrim} onClick={closeOverlay} aria-hidden />
            <div
              ref={sheetRef}
              className="llx-sheet-in"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Missed check-in — escalation"
              style={{
                ...styles.sheet,
                height: store.sheetDetent === 'medium' ? '55%' : 'calc(100% - 56px)',
              }}
              onKeyDown={event => trapTabKey(event, sheetRef.current)}
              onClickCapture={onSheetClickCapture}>
              <div style={styles.grabberZone}>
                <button
                  type="button"
                  className="llx-btn llx-focusable"
                  style={{width: 88, height: 24, display: 'grid', placeItems: 'center', borderRadius: 8}}
                  aria-label="Resize sheet"
                  aria-expanded={store.sheetDetent === 'large'}
                  onClick={() =>
                    update({sheetDetent: store.sheetDetent === 'medium' ? 'large' : 'medium'})
                  }>
                  <span style={styles.grabberPill} />
                </button>
              </div>
              <div style={styles.sheetHeader}>
                <span />
                <h2 style={styles.sheetTitle}>Missed check-in</h2>
                <button
                  type="button"
                  className="llx-btn llx-focusable"
                  style={styles.iconBtn44}
                  aria-label="Close sheet (escalation stays armed)"
                  onClick={closeOverlay}>
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              </div>
              <div style={styles.sheetBody}>
                <div style={styles.countBlock}>
                  {countdownSec != null ? (
                    <>
                      <span style={styles.countOverline}>Guardians notified in</span>
                      {/* 5:00 − 0:28 = 4:32 ✓ (fixture-driven, no clock). */}
                      <span style={styles.countNumeral}>{fmtMmSs(countdownSec)}</span>
                    </>
                  ) : (
                    <span style={{...styles.countNumeral, ...styles.countTerminal}}>
                      All guardians engaged
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  data-cancel-btn
                  className="llx-btn llx-focusable llx-fade"
                  style={{...styles.cancelBtn, ...(store.cancelStep === 1 ? styles.cancelBtnConfirm : null)}}
                  onClick={cancelEscalationPress}>
                  {store.cancelStep === 0
                    ? "I'm safe — cancel escalation"
                    : `Confirm — send code word ${PLAN.codeWord}`}
                </button>
                <p style={styles.cancelCaption}>
                  {store.cancelStep === 0
                    ? 'Cancelling requires a second, confirming press.'
                    : 'Guardians receive your code word'}
                </p>
                <EscalationLadder escalation={escalation} />
                {store.sheetDetent === 'large' ? (
                  <>
                    <h3 style={{...styles.sectionHeader, paddingInline: 0}}>What guardians receive</h3>
                    {GUARDIANS.map(guardian => (
                      <div key={guardian.id} style={styles.scriptCard}>
                        <div style={styles.scriptHead}>
                          <span
                            style={{...styles.scriptAvatar, background: GRADIENTS[guardian.id]}}
                            aria-hidden>
                            {guardian.initial}
                          </span>
                          <span style={styles.scriptName}>{guardian.name}</span>
                        </div>
                        <p style={{...styles.scriptText, margin: 0}}>{scriptFor(guardian)}</p>
                        <button
                          type="button"
                          className="llx-btn llx-focusable"
                          style={{...styles.callGuardianBtn, marginTop: 0, alignSelf: 'flex-start'}}
                          onClick={() =>
                            update({toast: `Calling ${guardian.name.split(' ')[0]}…`})
                          }>
                          <Icon icon={PhoneIcon} size="sm" color="inherit" />
                          Call {guardian.name.split(' ')[0]} now
                        </button>
                      </div>
                    ))}
                  </>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
