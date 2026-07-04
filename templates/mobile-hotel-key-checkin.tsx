// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Maya Okafor's day-of arrival at The
 *   Ardmore Hotel (Thu Jul 2 – Sun Jul 5 · 3 nights, Visa ··4417): two
 *   floor-14 room offers (1408 · King · Courtyard · 1 door from the
 *   elevator; 1412 · King corner · 3 doors · quieter end), a folio that
 *   reconciles line-by-line ($240 × 3 = $720; taxes $108; resort fee
 *   $35 × 3 = $105; 720 + 108 = 828; 828 + 105 = 933 → TOTAL $933), a
 *   10-event arrival timeline (4 visible + 'Show 6 more'; user actions
 *   prepend 'Just now' events → 11, 12, …), and three request chips. No
 *   Date.now(), no Math.random(), no network media — the hero is a
 *   stylized SVG facade, thumbs are id-derived gradients.
 * @output Foyer — Arrival & Room Key: a 390px MOBILE hotel check-in
 *   surface. A transparent-over-hero navBar (arch-keyhole Foyer mark,
 *   RefreshCw) flips to blur+hairline via an IntersectionObserver
 *   sentinel at the hero's bottom; below the 208px hero one dense scroll
 *   body runs arrival readiness rail (4 gating stages, 'x OF 4 READY'
 *   cross-check), stay timeline, room card (offer → assigned anatomy with
 *   live folio), request chips with undo-over-confirm, and — at stage 4
 *   only — the inline key coin. Two two-detent sheets: a room-select
 *   sheet with an SVG floor-strip radiogroup, and a key sheet holding the
 *   160px hold-to-unlock KeyCoin (1200ms arm, 8s auto-relock sweep, ring
 *   C = 2·π·68 = 427.26). The keyhole circle of the nav mark IS the
 *   unlock ring reused at 24px.
 * @position Page template; emitted by `astryx template mobile-hotel-key-checkin`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the
 *   390px stage IS the phone viewport (no simulated OS chrome — the
 *   navBar at y=0 is the first pixel; the hero slides under it via
 *   marginTop:-52). All overlays (scrim, sheets, toast-when-locked) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While a
 *   sheet is open shell locks to {height:'100dvh', overflow:'hidden'}
 *   and restores on close. The stage clips to --radius-container; shell
 *   paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 60 for rail-dot rows); no
 *   desktop Layout frames, no side asides, no tables. No tabBar — the
 *   primary verb lives in the sticky footer.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Foyer green). Sanctioned non-token literals, each with
 *   contrast math at the declaration: BRAND_FILL_TEXT, REST_FILL (the
 *   ≥3:1 meaningful-rest-fill pair for the unlock-ring track and
 *   non-offer floor rooms — per the batch-2 amendment these may NOT use
 *   hairline tokens), NAV_ON_HERO, the hero/thumb art stops (decorative,
 *   non-text), and the foundations scrim pair.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky
 *   top z20 (paddingInline 8, grid '1fr auto 1fr'), transparent at rest,
 *   blur(12px) color-mix 86% + hairline once the hero sentinel scrolls
 *   under; hero 208px full-bleed (scrim rgba(0,0,0,0)→0.55, name 22/700
 *   white, dates 13/500 at 0.85 white); readiness rows 64px (28px disc,
 *   2px connector); timeline rows 60px two-line (28px rail-dot column,
 *   dividers inset 60); room offer/media rows 72px (48px thumb, 12px
 *   radius); folio detail block 96px (4 × 24px lines); request chips
 *   36px visual in 44px hit wrappers; key coin 160px (ring r=68 stroke
 *   8, C=427.26) with 24px block padding; sheets: 24px grabber zone
 *   (36×5 pill 8px from top), 52px header, detents 55% / calc(100% −
 *   56px); buttons 48px primary / 36px secondary / 44×44 icon;
 *   stickyFooter 16px padding z20; toastDock sticky-in-flow above the
 *   footer at rest, absolute insetInline 16 bottom 76 z30 ONLY while the
 *   shell is scroll-locked. TYPE (Figtree via --font-family-body):
 *   22/700 hero name · 17/600 nav+sheet titles · 16/400–600 body ·
 *   13/400 secondary · 11/500 overlines+subtitle floor; tabular-nums on
 *   countdown, folio, and every counter. Touch: every target ≥44×44
 *   with ≥8px clearance or merged full-row; every gesture has a visible
 *   button path (hold-to-unlock ships 'Unlock door'/'Relock now'
 *   buttons + Enter/Space; the strip radiogroup ships the two offer
 *   rows; the sheet grabber is a real button).
 *
 * Responsive contract:
 * - Fluid 320–430px: hero stays 208px (art covers); FloorStrip scales
 *   via width:100% + viewBox '0 0 358 96' (offer hit buttons keep 44px
 *   via min sizes positioned by %, offers 2 columns apart so hits stay
 *   ≥8px clear at 320); key coin stays 160px centered; chips flexWrap;
 *   folio rows space-between; timeline times min-width 72 right-aligned
 *   tabular; nav title max 200px ellipsized. Zero horizontal scroll —
 *   overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth ResizeObserver
 *   on the wrapper (container width, not viewport) — at ≥720px the
 *   shell renders as a centered phone column (maxWidth 430, marginInline
 *   auto, borderInline hairline). No adaptive relayout — arrival is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject} from 'react';

import {
  BellRingIcon,
  CheckIcon,
  DoorOpenIcon,
  KeyRoundIcon,
  LockIcon,
  RefreshCwIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Foyer green). #0E6B5C on #FFFFFF ≈ 6.9:1
// (passes 4.5:1); #5FD4BF on the dark card (~#1C1C1E) ≈ 8.2:1.
const BRAND_ACCENT = 'light-dark(#0E6B5C, #5FD4BF)';
// Text over a BRAND_ACCENT fill. Light: #FFFFFF on #0E6B5C ≈ 6.9:1. Dark:
// white on #5FD4BF fails (~1.7:1), so the dark side flips to a near-black
// green — #06312A on #5FD4BF ≈ 9.6:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #06312A)';
// Brand-tinted wash (12%) for the mark chip and selected-offer surfaces.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;
// MEANINGFUL REST FILL (amendment: ≥3:1 vs the ACTUAL surface, never a
// hairline token) — the unlock ring's idle track and the non-offer room
// rects on the floor strip. #6F7D78 on the white card ≈ 4.4:1; #8A9993 on
// the dark card (~#1C1C1E) ≈ 5.0:1 — both clear the 3:1 boundary law.
const REST_FILL = 'light-dark(#6F7D78, #8A9993)';
// Nav icons while the navBar is transparent over the hero: white on the
// hero art's darkest-to-lightest top stops (#0B4038–#17564A) ≈ 11–8:1.
const NAV_ON_HERO = '#FFFFFF';
// Hero text: white 22px/700 + rgba(255,255,255,0.85) 13px over the
// rgba(0,0,0,0)→0.55 scrim. Worst case (lightest art stop #2E7D6D under
// 0.55 black → composite ≈ #14382F): white ≈ 12.3:1, 85% white ≈ 8.6:1 —
// both clear 4.6:1 (stress fixture 7).
const HERO_TEXT_DIM = 'rgba(255, 255, 255, 0.85)';
// Hero facade art stops (decorative SVG art, never text-bearing).
const ART_SKY_TOP = 'light-dark(#0B4038, #08312B)';
const ART_SKY_BOT = 'light-dark(#2E7D6D, #1E5A4E)';
const ART_FACADE = 'light-dark(#0A332C, #072722)';
const ART_WINDOW = 'light-dark(#F4C97B, #D9A94F)';
const ART_WINDOW_DIM = 'light-dark(#7FA79B, #58857A)';
// Id-derived thumb gradients (stylized room art — no photos).
const THUMB_1408 = 'linear-gradient(135deg, light-dark(#0E6B5C, #1E5A4E), light-dark(#7FB8A8, #3F8375))';
const THUMB_1412 = 'linear-gradient(135deg, light-dark(#8A6D2F, #6E5626), light-dark(#E3C57E, #B99852))';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, button reset, visually-hidden h1
// helper, ring animations (arm 1200ms / relock sweep 8000ms), the arming
// dots, and the reduced-motion guard that collapses all of them.
// ---------------------------------------------------------------------------

const FOYER_CSS = `
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
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.fyr-anim { transition: transform 240ms ease, opacity 240ms ease; }
.fyr-fade { transition: opacity 240ms ease; }
@keyframes fyr-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.fyr-sheet-in { animation: fyr-sheet-in 240ms ease; }
/* Hold-to-unlock arm: dashoffset 427.26 -> 0 over 1200ms. Early release
   removes the class and the base 200ms transition rewinds the ring. */
@keyframes fyr-arm {
  from { stroke-dashoffset: 427.26; }
  to { stroke-dashoffset: 0; }
}
.fyr-arming { animation: fyr-arm 1200ms linear forwards; }
/* 8s auto-relock: the same ring sweeps 0 -> 427.26 over 8000ms. */
@keyframes fyr-relock {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: 427.26; }
}
.fyr-relocking { animation: fyr-relock 8000ms linear forwards; }
/* Three haptic-style tick dots under the coin fill at 400/800/1200ms. */
@keyframes fyr-dot { to { opacity: 1; } }
.fyr-dot { opacity: 0.25; animation: fyr-dot 1ms linear forwards paused; }
.fyr-dot-live { animation-play-state: running; }
.fyr-dot-1 { animation-delay: 400ms; }
.fyr-dot-2 { animation-delay: 800ms; }
.fyr-dot-3 { animation-delay: 1200ms; }
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
  .fyr-anim, .fyr-fade { transition: none; }
  .fyr-sheet-in, .fyr-arming, .fyr-relocking, .fyr-dot { animation: none; }
}
`;

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
  // NAV BAR — 52px sticky top z20; starts transparent + no hairline over
  // the hero (which slides under via marginTop:-52), flips to blur+hairline
  // once the hero-bottom sentinel scrolls under (IntersectionObserver).
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: 'transparent',
    borderBottom: '1px solid transparent',
  },
  navBarSolid: {
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  // Center title stack — opacity 0→1 on the sentinel trigger; title 17/600
  // max 200px ellipsized; subtitle 11/500 tabular (secondary token on the
  // 86% blur surface ≈ the token's own body-surface contrast — passes).
  navCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    minWidth: 0,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.2,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  navSubtitle: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.2,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // HERO — 208px full-bleed stylized SVG facade; slides under the
  // transparent navBar (marginTop −52); content bottom-anchored at 16px.
  hero: {
    position: 'relative',
    height: 208,
    marginTop: -52,
    overflow: 'hidden',
  },
  heroArt: {position: 'absolute', inset: 0, width: '100%', height: '100%'},
  heroScrim: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)',
  },
  heroContent: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  heroName: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#FFFFFF',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  heroDates: {
    fontSize: 13,
    fontWeight: 500,
    color: HERO_TEXT_DIM,
    fontVariantNumeric: 'tabular-nums',
  },
  sentinel: {height: 1},
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 24},
  // sectionHeader — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom; sectionRow adds a trailing counter.
  sectionRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    margin: '20px 0 8px',
    paddingInline: 32,
    gap: 8,
  },
  sectionHeader: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  sectionTrailing: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: BRAND_ACCENT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  requestsBadge: {
    minWidth: 16,
    height: 16,
    display: 'inline-grid',
    placeItems: 'center',
    borderRadius: 999,
    paddingInline: 5,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  updatedCaption: {
    margin: '-4px 0 8px',
    paddingInline: 32,
    fontSize: 13,
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
  // Timeline dividers inset 60 (16 gutter + 28 rail col + 16 gap).
  rowDividerRail: {height: 1, background: 'var(--color-border)', marginInlineStart: 60},
  // READINESS RAIL — 64px stage rows: 28px disc, 2px connector column,
  // 16/500 label, trailing 13/400 status.
  stageRow: {
    position: 'relative',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingInline: 16,
  },
  stageDiscCol: {
    position: 'relative',
    width: 28,
    height: '100%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  // 2px vertical connector segments above/below each disc; done segments
  // BRAND_ACCENT, else --color-border (passive separator — token legal).
  stageConnTop: {position: 'absolute', top: 0, bottom: 'calc(50% + 14px)', left: 13, width: 2},
  stageConnBot: {position: 'absolute', top: 'calc(50% + 14px)', bottom: 0, left: 13, width: 2},
  stageDisc: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  // done: brand fill + 16px white Check (#FFF on #0E6B5C ≈ 6.9:1; dark side
  // uses BRAND_FILL_TEXT #06312A on #5FD4BF ≈ 9.6:1).
  stageDiscDone: {background: BRAND_ACCENT, color: BRAND_FILL_TEXT},
  // active: 2px BRAND_ACCENT ring (interactive-adjacent state boundary —
  // brand pair ≥3:1 vs card by the accent's own 6.9/8.2 contrast).
  stageDiscActive: {
    border: `2px solid ${BRAND_ACCENT}`,
    color: BRAND_ACCENT,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    background: 'var(--color-background-card)',
  },
  // locked: 2px --color-border ring + 14px Lock in text-secondary (status
  // is icon-encoded, ring is passive).
  stageDiscLocked: {
    border: '2px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-background-card)',
  },
  stageLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stageStatus: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // TIMELINE — 60px two-line rows, 28px rail-dot column.
  timelineRow: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingInline: 16,
  },
  railDotCol: {width: 28, flexShrink: 0, display: 'grid', placeItems: 'center'},
  railDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: BRAND_ACCENT,
  },
  railDotMuted: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: REST_FILL,
  },
  timelineText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  timelinePrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  timelineSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  timelineTime: {
    minWidth: 72,
    textAlign: 'right',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
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
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // ROOM CARD — 72px offer/media rows (48px thumb, 12px radius).
  offerRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  roomThumb: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    // Room number sits on the darker gradient start (#0E6B5C / #8A6D2F):
    // white ≈ 6.9:1 / 5.6:1.
    textShadow: '0 1px 2px rgba(0,0,0,0.35)',
  },
  offerText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  offerPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  offerSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  offerRadio: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
  },
  // Unselected radio boundary: interactive control boundary — REST_FILL
  // (≥3:1 vs card, amendment), NOT the hairline token.
  offerRadioOff: {border: `2px solid ${REST_FILL}`},
  offerRadioOn: {background: BRAND_ACCENT, color: BRAND_FILL_TEXT},
  cardPad: {padding: 16},
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
    fontVariantNumeric: 'tabular-nums',
  },
  secondaryBtn: {
    width: '100%',
    height: 36,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    display: 'grid',
    placeItems: 'center',
  },
  // FOLIO — 96px detail block: 4 × 24px lines, space-between so amounts
  // never collide at 320.
  folio: {paddingInline: 16, paddingBlock: 4},
  folioLine: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  folioTotal: {
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // GATED placeholder — 64px collapsed muted card, inert.
  gatedCard: {
    marginInline: 16,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
  },
  // REQUEST chips — 36px visual pills inside 44px-tall hit wrappers, 8px
  // gaps, flexWrap for 320.
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    paddingInline: 16,
    marginBottom: 12,
  },
  chipHit: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    borderRadius: 999,
  },
  chip: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 14,
    borderRadius: 999,
    border: `1px solid ${REST_FILL}`,
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  chipSent: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  requestRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  requestLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  requestMeta: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  // KEY SECTION — 160px coin centered, 24px block padding.
  keySection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    paddingBlock: 24,
  },
  coinBtn: {
    position: 'relative',
    width: 160,
    height: 160,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    touchAction: 'none',
    color: BRAND_ACCENT,
  },
  coinCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    pointerEvents: 'none',
  },
  coinNumeral: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  coinDots: {display: 'flex', gap: 8, height: 8},
  coinDot: {width: 8, height: 8, borderRadius: '50%', background: BRAND_ACCENT},
  coinCaption: {fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'center'},
  // STICKY FOOTER — bottom 0 z20, blur surface, one 48px brand CTA.
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
  // TOAST DOCK — sticky-in-flow above the footer at rest (amendment: the
  // shell grows with content, so document-absolute pins off-viewport);
  // flips to absolute insetInline 16 bottom 76 z30 ONLY while the shell
  // is scroll-locked at 100dvh.
  toastDock: {
    position: 'sticky',
    bottom: 96,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
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
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    paddingInline: 16,
    pointerEvents: 'auto',
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
  toastUndo: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
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
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  // FLOOR STRIP — fluid SVG (viewBox 0 0 358 96) + % positioned 44px
  // offer hit buttons (offers are 2 columns apart: 2 × 38px pitch = 76px
  // ≥ 52px needed for two 44px hits with 8px clearance at 320).
  stripWrap: {position: 'relative', width: '100%'},
  stripSvg: {display: 'block', width: '100%', height: 'auto'},
  stripHit: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 8,
    transform: 'translate(-50%, -50%)',
  },
  stripCaption: {
    marginTop: 8,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  doorLine: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    marginBottom: 12,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields, cross-checking aggregates.
// Ledger (verified by hand): folio 240×3 = 720; 720+108 = 828; 105 = 35×3;
// 828+105 = 933 ✓. Timeline 4 visible + 6 hidden = 10 ✓; assign → 11,
// each unlock → +1. Readiness counter = count(done): 2 → 3 → 4 ✓.
// ---------------------------------------------------------------------------

const GUEST = 'Maya Okafor';
const HOTEL = 'The Ardmore Hotel';
const STAY = 'Thu Jul 2 – Sun Jul 5';
const NIGHTS = 3;
const CARD = 'Visa ·· 4417';

interface RoomOffer {
  id: string;
  floor: number;
  bed: string;
  view: string;
  doorsFromElevator: number;
  // Dual-field discipline: precomputed display strings beside the numbers.
  distanceLabel: string;
  detailLabel: string; // the 1412 line is the 1-line clamp stress
  captionLabel: string;
  thumb: string;
}

const ROOMS: RoomOffer[] = [
  {
    id: '1408',
    floor: 14,
    bed: 'King',
    view: 'Courtyard',
    doorsFromElevator: 1,
    distanceLabel: '1 door from elevator',
    detailLabel: 'King · Courtyard · 1 door from elevator',
    captionLabel: 'Rm 1408 · 1 door from elevator · courtyard',
    thumb: THUMB_1408,
  },
  {
    id: '1412',
    floor: 14,
    bed: 'King corner',
    view: 'Courtyard',
    doorsFromElevator: 3,
    // Stress fixture 1: clamps to one line beside the radio at 320px.
    detailLabel: 'King corner, courtyard, high floor, quieter end',
    distanceLabel: '3 doors from elevator',
    captionLabel: 'Rm 1412 · 3 doors · corner, courtyard, quieter',
    thumb: THUMB_1412,
  },
];

// FOLIO in cents — rendered as all four lines so the sum is checkable:
// 24000×3 = 72000; taxes 10800; 3500×3 = 10500; 72000+10800+10500 = 93300.
const FOLIO_RATE_CENTS = 24000;
const FOLIO_TAX_CENTS = 10800;
const FOLIO_FEE_CENTS = 3500;
const FOLIO_TOTAL_CENTS = FOLIO_RATE_CENTS * NIGHTS + FOLIO_TAX_CENTS + FOLIO_FEE_CENTS * NIGHTS; // 93300

interface StayEvent {
  id: string;
  label: string;
  detail: string;
  time: string;
  fresh?: boolean; // 'Just now' user-action prepends get the brand rail dot
}

// 4 visible + 'Show 6 more' = 10 (cross-check law). Newest first.
const TIMELINE_VISIBLE: StayEvent[] = [
  {id: 'ev_prep', label: 'Room being prepared', detail: 'Housekeeping · floor 14', time: '12:38 PM'},
  {id: 'ev_card', label: 'Card on file', detail: CARD, time: '9:02 AM'},
  {id: 'ev_id', label: 'ID verified', detail: `Front desk · ${GUEST}`, time: '9:02 AM'},
  {id: 'ev_conf', label: 'Reservation confirmed', detail: 'Ardmore reservations', time: '8:47 AM'},
];

const TIMELINE_HIDDEN: StayEvent[] = [
  {id: 'ev_pref', label: 'Stay preferences saved', detail: 'Quiet floor · king bed', time: 'Yesterday'},
  {id: 'ev_auth', label: 'Prepayment authorized', detail: CARD, time: 'Yesterday'},
  {id: 'ev_upgr', label: 'Upgrade offer viewed', detail: 'Corner king · declined', time: 'Tue Jun 30'},
  {id: 'ev_mod', label: 'Reservation modified', detail: '3 nights confirmed', time: 'Mon Jun 29'},
  {id: 'ev_email', label: 'Confirmation email sent', detail: 'maya.okafor@…', time: 'Jun 12'},
  {id: 'ev_created', label: 'Reservation created', detail: 'Foyer app', time: 'Jun 12'},
];

interface RequestChip {
  id: string;
  label: string;
}

const REQUEST_CHIPS: RequestChip[] = [
  {id: 'req_pillows', label: 'Extra pillows'},
  {id: 'req_late', label: 'Late checkout · 1 PM'},
  {id: 'req_amenity', label: 'Welcome amenity'},
];

const STAGE_LABELS = ['ID verified', 'Card on file', 'Room assigned', 'Key issued'];

// KeyCoin ring geometry — r=68 stroke 8 inside the 160px box.
// C = 2·π·68 = 427.26 (strokeDasharray; arm animates 427.26→0, relock 0→427.26).
const RING_R = 68;
const RING_C = 427.26;
const ARM_MS = 1200;
const RELOCK_MS = 8000;

// ---------------------------------------------------------------------------
// ONE STATE OWNER — stayStore: a single flat state object + one update(patch)
// helper; every surface (rail counter, navBar subtitle, timeline, footer CTA,
// both sheets, both KeyCoin instances) derives from it.
// ---------------------------------------------------------------------------

type Stage = 'assigning' | 'assigned' | 'keyed';
type DoorState = 'idle' | 'arming' | 'unlocked' | 'relocked';
type Overlay = null | 'roomSheet' | 'keySheet';

interface StayToast {
  seq: number;
  msg: string;
  undoId: string | null;
}

interface StayStore {
  stage: Stage;
  selectedOffer: string;
  roomId: string | null;
  doorState: DoorState;
  relockSeconds: number; // 8 → 1 while unlocked (visible text; aria-hidden)
  overlay: Overlay;
  sheetDetent: 'medium' | 'large';
  timeline: StayEvent[]; // newest first; user actions PREPEND 'Just now'
  hiddenCount: number; // 6 → 0 after 'Show 6 more' (4 + 6 = 10)
  requests: string[]; // sent chip ids, in send order
  refreshed: boolean; // static 'Updated just now' caption
  toast: StayToast | null; // ONE toast, no timers, Undo where applicable
}

const INITIAL_STORE: StayStore = {
  stage: 'assigning',
  selectedOffer: '1408',
  roomId: null,
  doorState: 'idle',
  relockSeconds: 8,
  overlay: null,
  sheetDetent: 'medium',
  timeline: TIMELINE_VISIBLE,
  hiddenCount: TIMELINE_HIDDEN.length,
  requests: [],
  refreshed: false,
  toast: null,
};

function useStayStore() {
  const [store, setStore] = useState<StayStore>(INITIAL_STORE);
  // Functional setState so callbacks stay stable and patches never race.
  const update = useCallback((patch: Partial<StayStore>) => {
    setStore(prev => ({...prev, ...patch}));
  }, []);
  return {store, update, setStore};
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

/** Cents → '$933.00' → rendered without cents when even: '$720'. */
function fmtUsd(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// FOYER MARK — keyhole cut from a rounded door-arch; the keyhole circle IS
// the unlock progress ring reused at 24px (stroke flips to BRAND_ACCENT
// while the door is unlocked — REST_FILL track otherwise, ≥3:1 pair).
// ---------------------------------------------------------------------------

function FoyerMark({unlocked}: {unlocked: boolean}) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      {/* Door arch: rounded-top outline. */}
      <path
        d="M4 22V12a8 8 0 0 1 16 0v10"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* The keyhole circle = the 24px unlock ring. */}
      <circle
        cx={12}
        cy={12.5}
        r={3.4}
        stroke={unlocked ? BRAND_ACCENT : REST_FILL}
        strokeWidth={2}
        className="fyr-fade"
      />
      <path d="M12 15.9v3.1" stroke={unlocked ? BRAND_ACCENT : REST_FILL} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// HERO ART — stylized SVG facade of The Ardmore (deterministic pattern; no
// network photos). Windows light on a fixed (row + col) % 3 rhythm.
// ---------------------------------------------------------------------------

function HeroArt() {
  const windows: ReactNode[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 9; col++) {
      const lit = (row + col) % 3 === 0;
      windows.push(
        <path
          key={`w-${row}-${col}`}
          d={`M ${52 + col * 32} ${86 + row * 30} v -8 a 6 6 0 0 1 12 0 v 8 z`}
          fill={lit ? ART_WINDOW : ART_WINDOW_DIM}
          opacity={lit ? 0.95 : 0.5}
        />,
      );
    }
  }
  return (
    <svg
      style={styles.heroArt}
      viewBox="0 0 390 208"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden>
      <defs>
        <linearGradient id="fyr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={ART_SKY_TOP} />
          <stop offset="1" stopColor={ART_SKY_BOT} />
        </linearGradient>
      </defs>
      <rect width="390" height="208" fill="url(#fyr-sky)" />
      {/* Facade mass with a grand arched entrance. */}
      <rect x="36" y="62" width="318" height="146" rx="6" fill={ART_FACADE} />
      <rect x="24" y="54" width="342" height="10" rx="4" fill={ART_FACADE} />
      {windows}
      {/* Entrance arch + warm glow — echoes the Foyer mark. */}
      <path d="M177 208v-22a18 18 0 0 1 36 0v22z" fill={ART_WINDOW} opacity={0.9} />
      <path d="M183 208v-16a12 12 0 0 1 24 0v16z" fill={ART_SKY_TOP} opacity={0.55} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// READINESS RAIL — 4 × 64px stage rows in an ordered list; discs 28px with
// 2px connector segments (done = BRAND_ACCENT, else --color-border, passive).
// The 'x OF 4 READY' counter equals count(done) by derivation, never a
// hardcoded string.
// ---------------------------------------------------------------------------

interface StageView {
  label: string;
  state: 'done' | 'active' | 'locked';
  status: string;
  step: number;
}

function ReadinessRail({stages}: {stages: StageView[]}) {
  return (
    <ol style={{listStyle: 'none', margin: 0, padding: 0}}>
      {stages.map((stage, index) => (
        <li key={stage.label}>
          {index > 0 ? <div style={styles.rowDivider} /> : null}
          <div style={styles.stageRow}>
          <span style={styles.stageDiscCol} aria-hidden>
            {index > 0 ? (
              <span
                style={{
                  ...styles.stageConnTop,
                  background: stages[index - 1].state === 'done' && stage.state === 'done'
                    ? BRAND_ACCENT
                    : 'var(--color-border)',
                }}
              />
            ) : null}
            {index < stages.length - 1 ? (
              <span
                style={{
                  ...styles.stageConnBot,
                  background: stage.state === 'done' && stages[index + 1].state === 'done'
                    ? BRAND_ACCENT
                    : 'var(--color-border)',
                }}
              />
            ) : null}
            <span
              style={{
                ...styles.stageDisc,
                ...(stage.state === 'done'
                  ? styles.stageDiscDone
                  : stage.state === 'active'
                    ? styles.stageDiscActive
                    : styles.stageDiscLocked),
              }}>
              {stage.state === 'done' ? (
                <Icon icon={CheckIcon} size="sm" color="inherit" />
              ) : stage.state === 'active' ? (
                stage.step
              ) : (
                <Icon icon={LockIcon} size="sm" color="inherit" />
              )}
            </span>
          </span>
          <span style={styles.stageLabel}>
            {stage.label}
            {stage.state === 'done' ? <span className="fyr-vh"> complete</span> : null}
          </span>
          <span style={styles.stageStatus}>{stage.status}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// FLOOR STRIP — inline SVG cross-section of floor 14 (viewBox 0 0 358 96,
// width 100%, scales 288–398 across the 320–430 stage). 12 room rects
// 24×34 rx4 in two facing rows (38px column pitch), 20px corridor, 30×34
// elevator core between columns 3 and 4, 16×16 ICE square far right. The
// two OFFER rooms are real 44×44 radio buttons overlaid by % position
// (offers sit 2 columns apart: 2 × 38 = 76px ≥ 52px needed, so hits keep
// ≥8px clearance at every width). Non-offer rooms rest at REST_FILL
// (explicit ≥3:1 pair vs the card — amendment). SVG text uses
// var(--color-text-primary), never --color-text.
// ---------------------------------------------------------------------------

const STRIP_COLS = [8, 46, 84, 158, 196, 234]; // room column x origins
const STRIP_TOP_ROOMS = ['1401', '1403', '1405', '1407', '1409', '1411']; // city side
const STRIP_BOT_ROOMS = ['1402', '1404', '1406', '1408', '1410', '1412']; // courtyard side

interface FloorStripProps {
  selectedOffer: string;
  onSelect: (roomId: string) => void;
}

function FloorStrip({selectedOffer, onSelect}: FloorStripProps) {
  const offerIds = ROOMS.map(room => room.id);
  const onRadioKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const next = offerIds.find(id => id !== selectedOffer);
    if (next == null) return;
    onSelect(next);
    const target = event.currentTarget.querySelector<HTMLElement>(`[data-room="${next}"]`);
    target?.focus();
  };
  const hitLeftPct = (roomId: string): number => {
    const col = STRIP_BOT_ROOMS.indexOf(roomId);
    return ((STRIP_COLS[col] + 12) / 358) * 100;
  };
  const selectedRoom = ROOMS.find(room => room.id === selectedOffer) ?? ROOMS[0];
  return (
    <div>
      <div
        style={styles.stripWrap}
        role="radiogroup"
        aria-label="Choose your room on floor 14"
        onKeyDown={onRadioKeyDown}>
        <svg style={styles.stripSvg} viewBox="0 0 358 96" aria-hidden>
          {/* City-side row (top). */}
          {STRIP_TOP_ROOMS.map((roomId, col) => (
            <rect key={roomId} x={STRIP_COLS[col]} y={6} width={24} height={34} rx={4} fill={REST_FILL} opacity={0.6} />
          ))}
          {/* Courtyard row (bottom) — offers get ring/fill treatment. */}
          {STRIP_BOT_ROOMS.map((roomId, col) => {
            const isOffer = offerIds.includes(roomId);
            const isSelected = roomId === selectedOffer;
            if (!isOffer) {
              return <rect key={roomId} x={STRIP_COLS[col]} y={56} width={24} height={34} rx={4} fill={REST_FILL} opacity={0.6} />;
            }
            return (
              <g key={roomId}>
                <rect
                  x={STRIP_COLS[col]}
                  y={56}
                  width={24}
                  height={34}
                  rx={4}
                  style={{
                    fill: isSelected ? BRAND_ACCENT : 'var(--color-background-muted)',
                    stroke: BRAND_ACCENT,
                    strokeWidth: 2,
                  }}
                />
                {/* Last two digits at 11px (the full number lives in the
                    caption + offer rows — 4 digits cannot pass 11px in a
                    24px rect). Selected: BRAND_FILL_TEXT on brand ≈ 6.9:1. */}
                <text
                  x={STRIP_COLS[col] + 12}
                  y={77}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  style={{fill: isSelected ? BRAND_FILL_TEXT : BRAND_ACCENT}}>
                  {roomId.slice(2)}
                </text>
              </g>
            );
          })}
          {/* Elevator core between columns 3 and 4 (adjacent to 1406/1407). */}
          <rect x={118} y={31} width={30} height={34} rx={4} style={{fill: 'var(--color-background-muted)', stroke: 'var(--color-border)'}} />
          <path
            d="M130 40l3-4 3 4M130 56l3 4 3-4"
            fill="none"
            stroke="var(--color-text-primary)"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Ice machine at the far right end. */}
          <rect x={330} y={40} width={16} height={16} rx={3} style={{fill: 'var(--color-background-muted)', stroke: 'var(--color-border)'}} />
          <text x={338} y={70} textAnchor="middle" fontSize={11} fontWeight={600} style={{fill: 'var(--color-text-primary)'}}>
            ICE
          </text>
        </svg>
        {/* Transparent 44×44 radio hits over the two offer rooms only. */}
        {ROOMS.map(room => (
          <button
            key={room.id}
            type="button"
            data-room={room.id}
            role="radio"
            aria-checked={room.id === selectedOffer}
            aria-label={`Room ${room.id}, courtyard side, ${room.distanceLabel}`}
            className="fyr-btn fyr-focusable"
            style={{...styles.stripHit, left: `${hitLeftPct(room.id)}%`, top: '76%'}}
            tabIndex={room.id === selectedOffer ? 0 : -1}
            onClick={() => onSelect(room.id)}
          />
        ))}
      </div>
      <div style={styles.stripCaption}>{selectedRoom.captionLabel}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KEY COIN — 160px circular hold-to-unlock <button>; SVG ring r=68 stroke 8
// (C = 427.26). pointerdown arms a 1200ms fill; early release rewinds over
// 200ms with ZERO store writes (stress fixture 4); ≥1200ms — or the
// 'Unlock door' button, or Enter/Space — unlocks; unlocked runs the 8s
// relock sweep with an aria-hidden numeral. Reduced motion: no sweeps —
// the ring jumps full/empty, arming shows a static 'Keep holding…' label.
// Rendered both inline (stage 4) and inside the key sheet — same store.
// ---------------------------------------------------------------------------

interface KeyCoinProps {
  doorState: DoorState;
  relockSeconds: number;
  roomId: string;
  reducedMotion: boolean;
  onArmStart: () => void;
  onArmCancel: () => void;
  onInstantUnlock: () => void;
  coinRef?: RefObject<HTMLButtonElement | null>;
}

function KeyCoin({doorState, relockSeconds, roomId, reducedMotion, onArmStart, onArmCancel, onInstantUnlock, coinRef}: KeyCoinProps) {
  const arming = doorState === 'arming';
  const unlocked = doorState === 'unlocked';
  // Ring class drives the two sweeps; reduced motion removes both (CSS
  // guard) so the ring reads as a static full/empty fill.
  const ringClass = arming ? 'fyr-arming' : unlocked ? 'fyr-relocking' : undefined;
  const baseOffset = unlocked ? 0 : RING_C;
  const caption =
    doorState === 'relocked'
      ? 'Hold to unlock again'
      : unlocked
        ? 'Unlocked'
        : arming && reducedMotion
          ? 'Keep holding…'
          : 'Hold to unlock';
  return (
    <div style={styles.keySection}>
      <button
        type="button"
        ref={coinRef}
        className="fyr-btn fyr-focusable"
        style={styles.coinBtn}
        aria-label={`Hold to unlock room ${roomId}`}
        onPointerDown={event => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          onArmStart();
        }}
        onPointerUp={onArmCancel}
        onPointerCancel={onArmCancel}
        onKeyDown={event => {
          // Keyboard path: Enter/Space trigger the no-hold unlock.
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          onInstantUnlock();
        }}>
        <svg width={160} height={160} viewBox="0 0 160 160" fill="none" aria-hidden>
          {/* Idle ring track — REST_FILL, the ≥3:1 meaningful rest fill. */}
          <circle cx={80} cy={80} r={RING_R} stroke={REST_FILL} strokeWidth={8} opacity={0.45} />
          <circle
            cx={80}
            cy={80}
            r={RING_R}
            stroke={BRAND_ACCENT}
            strokeWidth={8}
            strokeLinecap="round"
            className={ringClass}
            strokeDasharray={RING_C}
            strokeDashoffset={baseOffset}
            transform="rotate(-90 80 80)"
            style={{transition: arming ? undefined : 'stroke-dashoffset 200ms linear'}}
          />
        </svg>
        <span style={{...styles.coinCenter, position: 'absolute', inset: 0, display: 'grid', placeItems: 'center'}}>
          <span style={styles.coinCenter}>
            {unlocked ? (
              <Icon icon={DoorOpenIcon} size="lg" color="inherit" />
            ) : (
              // 48px keyhole glyph from the brand mark.
              <svg width={48} height={48} viewBox="0 0 48 48" fill="none" aria-hidden>
                <circle cx={24} cy={20} r={7} stroke="currentColor" strokeWidth={3.5} />
                <path d="M24 27v10" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" />
              </svg>
            )}
            {unlocked ? (
              <span style={styles.coinNumeral} aria-hidden>
                {relockSeconds}s
              </span>
            ) : null}
          </span>
        </span>
      </button>
      {/* Haptic-style tick dots fill at 400/800/1200ms while arming. */}
      <span style={styles.coinDots} aria-hidden>
        {[1, 2, 3].map(dot => (
          <span
            key={dot}
            className={`fyr-dot fyr-dot-${dot}${arming && !reducedMotion ? ' fyr-dot-live' : ''}`}
            style={{...styles.coinDot, opacity: arming ? undefined : 0.25}}
          />
        ))}
      </span>
      <span style={styles.coinCaption}>{caption}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET CHROME — 24px grabber zone (real 'Resize sheet' button toggling
// medium/large), 52px header with 44×44 X, focus-trapped dialog. The single
// `overlay` enum in stayStore means two sheets can never stack (stress 8).
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  footer: ReactNode;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, footer, children}: SheetProps) {
  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="fyr-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
      }}>
      <button
        type="button"
        className="fyr-btn fyr-focusable"
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
          className="fyr-btn fyr-focusable"
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
// PAGE
// ---------------------------------------------------------------------------

export default function MobileHotelKeyCheckinTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {store, update, setStore} = useStayStore();

  // Focus + timer plumbing (refs for transient values, never state).
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const coinInlineRef = useRef<HTMLButtonElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const armTimerRef = useRef<number | null>(null);
  const relockTimerRef = useRef<number | null>(null);
  const relockIntervalRef = useRef<number | null>(null);
  const prevDoorRef = useRef<DoorState>('idle');
  // Mirror of store.doorState for timer callbacks (transient read — never
  // a render subscription).
  const doorRef = useRef<DoorState>('idle');
  const toastSeqRef = useRef(0);
  const enterSeqRef = useRef(0);
  const didLoadMoreRef = useRef(false);

  // NavBar transparency — IntersectionObserver sentinel at the hero's
  // bottom; flips to blur+hairline once the hero has scrolled under the
  // 52px navBar line.
  const [navSolid, setNavSolid] = useState(false);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel == null) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry == null) return;
        setNavSolid(!entry.isIntersecting && entry.boundingClientRect.top < 52);
      },
      {rootMargin: '-52px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  doorRef.current = store.doorState;

  // DERIVED (during render, never effects) --------------------------------
  const assignedRoom = store.roomId != null ? ROOMS.find(room => room.id === store.roomId) ?? null : null;
  const readyCount = 2 + (store.stage !== 'assigning' ? 1 : 0) + (store.stage === 'keyed' ? 1 : 0);
  const stages: StageView[] = [
    {label: STAGE_LABELS[0], state: 'done', status: '9:02 AM', step: 1},
    {label: STAGE_LABELS[1], state: 'done', status: '9:02 AM', step: 2},
    store.stage === 'assigning'
      ? {label: STAGE_LABELS[2], state: 'active', status: 'In progress', step: 3}
      : {label: STAGE_LABELS[2], state: 'done', status: 'Just now', step: 3},
    store.stage === 'keyed'
      ? {label: STAGE_LABELS[3], state: 'done', status: 'Just now', step: 4}
      : store.stage === 'assigned'
        ? {label: STAGE_LABELS[3], state: 'active', status: 'In progress', step: 4}
        : {label: STAGE_LABELS[3], state: 'locked', status: 'Waiting', step: 4},
  ];
  const totalEvents = store.timeline.length + store.hiddenCount;
  const navSubtitle =
    store.doorState === 'unlocked'
      ? 'Key active'
      : store.roomId != null
        ? `Room ${store.roomId}`
        : 'Arriving today';
  const locked = store.overlay != null;

  const toastPatch = (msg: string, undoId: string | null = null): Partial<StayStore> => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, msg, undoId}};
  };

  // SHEET LIFECYCLE --------------------------------------------------------
  const openSheet = (overlay: 'roomSheet' | 'keySheet', opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? (document.activeElement as HTMLElement | null);
    update({overlay, sheetDetent: 'medium'});
  };
  const cancelArm = useCallback(() => {
    if (armTimerRef.current != null) {
      window.clearTimeout(armTimerRef.current);
      armTimerRef.current = null;
    }
    setStore(prev => (prev.doorState === 'arming' ? {...prev, doorState: prevDoorRef.current} : prev));
  }, [setStore]);
  const closeSheet = useCallback(() => {
    cancelArm();
    update({overlay: null, sheetDetent: 'medium'});
    sheetOpenerRef.current?.focus();
  }, [cancelArm, update]);

  // Focus into an opening sheet with preventScroll (amendment: a plain
  // .focus() scroll-reveals the animating sheet inside the locked
  // overflow-hidden column); scrollTop reset is the belt to the suspender.
  useEffect(() => {
    if (store.overlay != null) {
      sheetRef.current?.focus({preventScroll: true});
      if (shellRef.current != null) shellRef.current.scrollTop = 0;
    }
  }, [store.overlay]);

  // Escape closes the topmost overlay only (single overlay enum → the
  // sheet IS the topmost whenever one is open).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (store.overlay != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store.overlay, closeSheet]);

  // Timer hygiene on unmount.
  useEffect(
    () => () => {
      if (armTimerRef.current != null) window.clearTimeout(armTimerRef.current);
      if (relockTimerRef.current != null) window.clearTimeout(relockTimerRef.current);
      if (relockIntervalRef.current != null) window.clearInterval(relockIntervalRef.current);
    },
    [],
  );

  // CONSEQUENCE CHAINS -----------------------------------------------------

  // (2) Assign: one beat flips readiness stage 3 (counter 2→3 OF 4), swaps
  // the room card to assigned anatomy + folio, prepends the timeline,
  // rewrites the navBar subtitle and footer CTA, closes the sheet, toasts.
  const assignRoom = () => {
    setStore(prev => {
      const room = ROOMS.find(offer => offer.id === prev.selectedOffer) ?? ROOMS[0];
      return {
        ...prev,
        stage: 'assigned',
        roomId: room.id,
        overlay: null,
        sheetDetent: 'medium',
        timeline: [
          {id: `ev_assign_${room.id}`, label: `Room ${room.id} assigned`, detail: `Floor ${room.floor} · ${room.view} side`, time: 'Just now', fresh: true},
          ...prev.timeline,
        ],
        ...toastPatch(`Room ${room.id} assigned`),
      };
    });
    sheetOpenerRef.current?.focus();
  };

  const clearRelockTimers = () => {
    if (relockTimerRef.current != null) {
      window.clearTimeout(relockTimerRef.current);
      relockTimerRef.current = null;
    }
    if (relockIntervalRef.current != null) {
      window.clearInterval(relockIntervalRef.current);
      relockIntervalRef.current = null;
    }
  };

  // (4b) Relock — countdown end or 'Relock now'.
  const relock = useCallback(() => {
    clearRelockTimers();
    setStore(prev =>
      prev.doorState === 'unlocked'
        ? {...prev, doorState: 'relocked', relockSeconds: 8, ...toastPatch('Door relocked')}
        : prev,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStore]);

  // (4) SIGNATURE — unlock (hold completion, 'Unlock door', or Enter/Space):
  // ring solid, glyph → DoorOpen, 8s relock sweep starts, timeline prepends
  // 'Entered room …', readiness stage 4 flips exactly once (double-unlock
  // stays 4 OF 4 — stress fixture 3), subtitle → 'Key active', toast.
  const unlockNow = useCallback(() => {
    if (doorRef.current === 'unlocked') return; // no timer restarts (stress 3)
    if (armTimerRef.current != null) {
      window.clearTimeout(armTimerRef.current);
      armTimerRef.current = null;
    }
    clearRelockTimers();
    enterSeqRef.current += 1;
    const seq = enterSeqRef.current;
    setStore(prev => {
      if (prev.roomId == null || prev.doorState === 'unlocked') return prev;
      return {
        ...prev,
        stage: 'keyed',
        doorState: 'unlocked',
        relockSeconds: 8,
        timeline: [
          {id: `ev_enter_${seq}`, label: `Entered room ${prev.roomId}`, detail: 'Mobile key · Foyer', time: 'Just now', fresh: true},
          ...prev.timeline,
        ],
        ...toastPatch('Door unlocked'),
      };
    });
    relockIntervalRef.current = window.setInterval(() => {
      setStore(prev =>
        prev.doorState === 'unlocked' ? {...prev, relockSeconds: Math.max(1, prev.relockSeconds - 1)} : prev,
      );
    }, 1000);
    relockTimerRef.current = window.setTimeout(relock, RELOCK_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStore, relock]);

  // Hold-to-unlock arming: pointerdown starts the 1200ms fill; early
  // release rewinds 200ms with zero store writes beyond the transient
  // arming flag (stress fixture 4).
  const armStart = () => {
    if (store.roomId == null || store.doorState === 'unlocked' || store.doorState === 'arming') return;
    prevDoorRef.current = store.doorState;
    update({doorState: 'arming'});
    armTimerRef.current = window.setTimeout(unlockNow, ARM_MS);
  };

  // (5) Requests — undo-over-confirm: execute immediately, one persistent
  // toast with Undo; badge equals rows 0→1→2→3; undo preserves order for
  // the remaining rows (stress fixture 6).
  const sendRequest = (chip: RequestChip) => {
    setStore(prev =>
      prev.requests.includes(chip.id)
        ? prev
        : {...prev, requests: [...prev.requests, chip.id], ...toastPatch(`Request sent · ${chip.label}`, chip.id)},
    );
  };
  const undoRequest = (undoId: string) => {
    setStore(prev => ({
      ...prev,
      requests: prev.requests.filter(id => id !== undoId),
      ...toastPatch('Removed'),
    }));
  };

  // Timeline load-more — appends the fixture batch, announces via the one
  // region, moves focus to the first new row (arithmetic recomputes:
  // 4 + 6 = 10, prepends push to 11/12/13 — never a hardcoded total).
  const loadMore = () => {
    didLoadMoreRef.current = true;
    setStore(prev => ({
      ...prev,
      timeline: [...prev.timeline, ...TIMELINE_HIDDEN],
      hiddenCount: 0,
      ...toastPatch('6 more events loaded'),
    }));
  };
  useEffect(() => {
    if (didLoadMoreRef.current && store.hiddenCount === 0) {
      didLoadMoreRef.current = false;
      document.getElementById('fyr-ev-ev_pref')?.focus();
    }
  }, [store.hiddenCount]);

  const refresh = () => {
    update({refreshed: true, ...toastPatch('Updated just now')});
  };
  const scrollToTop = () => {
    wrapRef.current?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'});
  };
  const anchorKeyCoin = () => {
    coinInlineRef.current?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'center'});
    coinInlineRef.current?.focus({preventScroll: true});
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(locked ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };
  // Nav icons over the hero: NAV_ON_HERO white (≈8–11:1 on the art's top
  // stops); token secondary once the blur surface is under them.
  const navIconColor = navSolid ? 'var(--color-text-secondary)' : NAV_ON_HERO;

  const doorLine =
    store.doorState === 'unlocked' ? (
      <>
        Unlocked · relocks in <span aria-hidden>{store.relockSeconds}s</span>
        <span className="fyr-vh">a few seconds</span>
      </>
    ) : store.doorState === 'arming' ? (
      'Keep holding…'
    ) : store.doorState === 'relocked' ? (
      'Relocked · hold to unlock again'
    ) : (
      'Locked · hold the coin to unlock'
    );

  const footerCta =
    store.stage === 'assigning' ? (
      <button
        type="button"
        className="fyr-btn fyr-focusable"
        style={styles.primaryBtn}
        onClick={event => openSheet('roomSheet', event.currentTarget)}>
        Choose your room
      </button>
    ) : store.stage === 'assigned' ? (
      <button
        type="button"
        className="fyr-btn fyr-focusable"
        style={styles.primaryBtn}
        onClick={event => openSheet('keySheet', event.currentTarget)}>
        Open key
      </button>
    ) : (
      <button type="button" className="fyr-btn fyr-focusable" style={styles.primaryBtn} onClick={anchorKeyCoin}>
        Hold to unlock
      </button>
    );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{FOYER_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={{...styles.navBar, ...(navSolid ? styles.navBarSolid : null)}}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="fyr-btn fyr-focusable"
              style={{...styles.iconBtn, color: navSolid ? BRAND_ACCENT : NAV_ON_HERO}}
              aria-label="Foyer — back to top"
              onClick={scrollToTop}>
              <FoyerMark unlocked={store.doorState === 'unlocked'} />
            </button>
          </div>
          <div
            style={{...styles.navCenter, opacity: navSolid ? 1 : 0}}
            className="fyr-fade"
            aria-hidden={!navSolid}>
            <span style={styles.navTitle}>Foyer · Ardmore</span>
            <span style={styles.navSubtitle}>{navSubtitle}</span>
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="fyr-btn fyr-focusable"
              style={{...styles.iconBtn, color: navIconColor}}
              aria-label="Refresh arrival status"
              onClick={refresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <div style={styles.hero}>
          <HeroArt />
          <div style={styles.heroScrim} aria-hidden />
          <div style={styles.heroContent}>
            <h1 style={styles.heroName}>{HOTEL}</h1>
            <span style={styles.heroDates}>
              {STAY} · {NIGHTS} nights
            </span>
            <span style={{...styles.heroDates, fontWeight: 400}}>Reserved for {GUEST}</span>
          </div>
        </div>
        <div ref={sentinelRef} style={styles.sentinel} aria-hidden />

        <main style={styles.main}>
          <div style={styles.sectionRow}>
            <h2 style={styles.sectionHeader}>Arrival readiness</h2>
            {/* Counter equals count(done) — 2 → 3 → 4, cross-check law. */}
            <span style={styles.sectionTrailing}>{readyCount} OF 4 READY</span>
          </div>
          <div style={styles.listCard}>
            <ReadinessRail stages={stages} />
          </div>

          <div style={styles.sectionRow}>
            <h2 style={styles.sectionHeader}>Stay timeline</h2>
          </div>
          {store.refreshed ? <div style={styles.updatedCaption}>Updated just now</div> : null}
          <div style={styles.listCard}>
            {store.timeline.map((event, index) => (
              <div key={event.id}>
                {index > 0 ? <div style={styles.rowDividerRail} /> : null}
                <div style={styles.timelineRow} id={`fyr-ev-${event.id}`} tabIndex={-1}>
                  <span style={styles.railDotCol} aria-hidden>
                    <span style={event.fresh ? styles.railDot : styles.railDotMuted} />
                  </span>
                  <span style={styles.timelineText}>
                    <span style={styles.timelinePrimary}>{event.label}</span>
                    <span style={styles.timelineSecondary}>{event.detail}</span>
                  </span>
                  <span style={styles.timelineTime}>{event.time}</span>
                </div>
              </div>
            ))}
            {store.hiddenCount > 0 ? (
              <>
                <div style={styles.rowDividerRail} />
                <button type="button" className="fyr-btn fyr-focusable" style={styles.loadMoreRow} onClick={loadMore}>
                  Show {store.hiddenCount} more
                </button>
              </>
            ) : null}
          </div>
          {store.hiddenCount === 0 ? (
            // Terminal caption recomputes from the live array: 10 → 11 → 12…
            <div style={styles.terminalCaption}>All {store.timeline.length} events</div>
          ) : null}

          <div style={styles.sectionRow}>
            <h2 style={styles.sectionHeader}>Your room</h2>
          </div>
          {store.stage === 'assigning' ? (
            <div style={styles.listCard}>
              {ROOMS.map((room, index) => (
                <div key={room.id}>
                  {index > 0 ? <div style={styles.rowDividerRail} /> : null}
                  <button
                    type="button"
                    className="fyr-btn fyr-focusable"
                    style={styles.offerRow}
                    aria-label={`Room ${room.id}, ${room.bed}, ${room.distanceLabel} — compare on floor map`}
                    onClick={event => {
                      update({selectedOffer: room.id});
                      openSheet('roomSheet', event.currentTarget);
                    }}>
                    <span style={{...styles.roomThumb, background: room.thumb}} aria-hidden>
                      {room.id}
                    </span>
                    <span style={styles.offerText}>
                      <span style={styles.offerPrimary}>Room {room.id}</span>
                      <span style={styles.offerSecondary}>{room.detailLabel}</span>
                    </span>
                  </button>
                </div>
              ))}
              <div style={styles.rowDivider} />
              <div style={styles.cardPad}>
                <button
                  type="button"
                  className="fyr-btn fyr-focusable"
                  style={styles.primaryBtn}
                  onClick={event => openSheet('roomSheet', event.currentTarget)}>
                  Compare on floor map
                </button>
              </div>
            </div>
          ) : assignedRoom != null ? (
            <div style={styles.listCard}>
              <div style={styles.offerRow}>
                <span style={{...styles.roomThumb, background: assignedRoom.thumb}} aria-hidden>
                  {assignedRoom.id}
                </span>
                <span style={styles.offerText}>
                  <span style={styles.offerPrimary}>Room {assignedRoom.id}</span>
                  <span style={styles.offerSecondary}>
                    Floor {assignedRoom.floor} · {assignedRoom.bed} · {assignedRoom.view}
                  </span>
                </span>
              </div>
              <div style={styles.rowDivider} />
              {/* FOLIO — all four lines render so the sum is checkable:
                  720 + 108 = 828; 828 + 105 = 933. */}
              <div style={styles.folio}>
                <div style={styles.folioLine}>
                  <span>Rate · {fmtUsd(FOLIO_RATE_CENTS)} × {NIGHTS} nights</span>
                  <span>{fmtUsd(FOLIO_RATE_CENTS * NIGHTS)}</span>
                </div>
                <div style={styles.folioLine}>
                  <span>Taxes</span>
                  <span>{fmtUsd(FOLIO_TAX_CENTS)}</span>
                </div>
                <div style={styles.folioLine}>
                  <span>Resort fee · {fmtUsd(FOLIO_FEE_CENTS)} × {NIGHTS}</span>
                  <span>{fmtUsd(FOLIO_FEE_CENTS * NIGHTS)}</span>
                </div>
                <div style={styles.folioTotal}>
                  <span>Total · {CARD}</span>
                  <span>{fmtUsd(FOLIO_TOTAL_CENTS)}</span>
                </div>
              </div>
              <div style={styles.rowDivider} />
              <div style={styles.cardPad}>
                <button
                  type="button"
                  className="fyr-btn fyr-focusable"
                  style={styles.primaryBtn}
                  onClick={event => openSheet('keySheet', event.currentTarget)}>
                  Open key
                </button>
              </div>
            </div>
          ) : null}

          <div style={styles.sectionRow}>
            <h2 style={styles.sectionHeader}>
              Requests{' '}
              {store.requests.length > 0 ? (
                <span style={styles.requestsBadge}>{store.requests.length}</span>
              ) : null}
            </h2>
          </div>
          <div style={styles.chipRow}>
            {REQUEST_CHIPS.map(chip => {
              const sent = store.requests.includes(chip.id);
              return (
                <span key={chip.id} style={styles.chipHit}>
                  <button
                    type="button"
                    className="fyr-btn fyr-focusable"
                    style={{...styles.chip, ...(sent ? styles.chipSent : null)}}
                    aria-pressed={sent}
                    disabled={sent}
                    onClick={() => sendRequest(chip)}>
                    {sent ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                    {chip.label}
                  </button>
                </span>
              );
            })}
          </div>
          {store.requests.length > 0 ? (
            <div style={styles.listCard}>
              {store.requests.map((id, index) => {
                const chip = REQUEST_CHIPS.find(candidate => candidate.id === id);
                if (chip == null) return null;
                return (
                  <div key={id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.requestRow}>
                      <Icon icon={BellRingIcon} size="sm" color="secondary" />
                      <span style={styles.requestLabel}>{chip.label}</span>
                      <span style={styles.requestMeta}>Sent · Just now</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div style={styles.sectionRow}>
            <h2 style={styles.sectionHeader}>Room key</h2>
          </div>
          {store.stage === 'assigning' ? (
            // Gated placeholder — inert, no focusables (a11y plan).
            <div style={styles.gatedCard} aria-disabled="true">
              <Icon icon={LockIcon} size="sm" color="secondary" />
              Unlocks after room is assigned
            </div>
          ) : store.stage === 'assigned' ? (
            <div style={styles.listCard}>
              <button
                type="button"
                className="fyr-btn fyr-focusable"
                style={{...styles.requestRow, width: '100%', height: 60}}
                onClick={event => openSheet('keySheet', event.currentTarget)}>
                <Icon icon={KeyRoundIcon} size="sm" color="secondary" />
                <span style={styles.offerText}>
                  <span style={styles.offerPrimary}>Key issued to this phone</span>
                  <span style={styles.offerSecondary}>Open the key, then hold to unlock</span>
                </span>
              </button>
            </div>
          ) : (
            // Stage 4 only: the inline key coin — same component + store as
            // the sheet's coin.
            <KeyCoin
              doorState={store.doorState}
              relockSeconds={store.relockSeconds}
              roomId={store.roomId ?? ''}
              reducedMotion={reducedMotion}
              onArmStart={armStart}
              onArmCancel={cancelArm}
              onInstantUnlock={unlockNow}
              coinRef={coinInlineRef}
            />
          )}
        </main>

        {/* THE one polite live region — sticky-in-flow above the footer at
            rest; absolute bottom 76 ONLY while the shell is scroll-locked
            (amendment: absolute pins to the DOCUMENT bottom otherwise). */}
        <div style={locked ? styles.toastDockLocked : styles.toastDock} aria-live="polite">
          {store.toast != null ? (
            <div key={store.toast.seq} style={styles.toast} className="fyr-fade">
              <span style={styles.toastMsg}>{store.toast.msg}</span>
              {store.toast.undoId != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button
                    type="button"
                    className="fyr-btn fyr-focusable"
                    style={styles.toastUndo}
                    onClick={() => undoRequest(store.toast?.undoId ?? '')}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <footer style={styles.stickyFooter}>{footerCta}</footer>

        {store.overlay != null ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {store.overlay === 'roomSheet' ? (
          <Sheet
            titleId="fyr-room-title"
            title="Choose your room"
            detent={store.sheetDetent}
            onDetentChange={detent => update({sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            footer={
              <button type="button" className="fyr-btn fyr-focusable" style={styles.primaryBtn} onClick={assignRoom}>
                Assign Room {store.selectedOffer}
              </button>
            }>
            <FloorStrip selectedOffer={store.selectedOffer} onSelect={roomId => update({selectedOffer: roomId})} />
            <div style={{height: 12}} />
            {/* The two offer rows are the same radio choice as the strip —
                the mandatory non-SVG button path. */}
            <div role="radiogroup" aria-label="Room offers">
              {ROOMS.map((room, index) => {
                const selected = room.id === store.selectedOffer;
                return (
                  <div key={room.id}>
                    {index > 0 ? <div style={styles.rowDividerRail} /> : null}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className="fyr-btn fyr-focusable"
                      style={{...styles.offerRow, paddingInline: 0}}
                      onClick={() => update({selectedOffer: room.id})}>
                      <span style={{...styles.roomThumb, background: room.thumb}} aria-hidden>
                        {room.id}
                      </span>
                      <span style={styles.offerText}>
                        <span style={styles.offerPrimary}>Room {room.id}</span>
                        <span style={styles.offerSecondary}>{room.detailLabel}</span>
                      </span>
                      <span style={{...styles.offerRadio, ...(selected ? styles.offerRadioOn : styles.offerRadioOff)}} aria-hidden>
                        {selected ? <Icon icon={CheckIcon} size="sm" color="inherit" /> : null}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </Sheet>
        ) : null}
        {store.overlay === 'keySheet' ? (
          <Sheet
            titleId="fyr-key-title"
            title={`Room ${store.roomId ?? ''} key`}
            detent={store.sheetDetent}
            onDetentChange={detent => update({sheetDetent: detent})}
            onClose={closeSheet}
            sheetRef={sheetRef}
            footer={
              <>
                <button
                  type="button"
                  className="fyr-btn fyr-focusable"
                  style={{
                    ...styles.primaryBtn,
                    ...(store.doorState === 'unlocked'
                      ? {background: 'var(--color-background-muted)', color: 'var(--color-text-secondary)'}
                      : null),
                  }}
                  disabled={store.doorState === 'unlocked'}
                  onClick={unlockNow}>
                  Unlock door
                </button>
                <button
                  type="button"
                  className="fyr-btn fyr-focusable"
                  style={{...styles.secondaryBtn, ...(store.doorState !== 'unlocked' ? {opacity: 0.45} : null)}}
                  disabled={store.doorState !== 'unlocked'}
                  onClick={relock}>
                  Relock now
                </button>
              </>
            }>
            <div style={styles.doorLine} role="presentation">
              {doorLine}
            </div>
            <KeyCoin
              doorState={store.doorState}
              relockSeconds={store.relockSeconds}
              roomId={store.roomId ?? ''}
              reducedMotion={reducedMotion}
              onArmStart={armStart}
              onArmCancel={cancelArm}
              onInstantUnlock={unlockNow}
            />
          </Sheet>
        ) : null}
      </div>
    </div>
  );
}



