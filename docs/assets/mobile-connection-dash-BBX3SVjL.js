var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Gatewise tight-connection war
 *   room for AY 1442 MUC → HEL (departs 14:52, doors close 14:37), frozen
 *   on a simulated clock that advances ONLY on checkpoint taps: deplaned
 *   A26 at 13:59 → budget 14:37 − 13:59 = 38 min; checkpoints est
 *   5+7+8+4 = 24 → slack +14; scripted actuals (c2 14:06 → slack +12,
 *   c3 14:20 tram overrun 14 min + gate change B44 → K21 flipping c5's
 *   walk 4 → 12 → slack −3, c4 14:29, c5 14:41); three rebook alternates
 *   (2+9+23 = 34 seats). No Date.now(), no Math.random(), no timers, no
 *   network media.
 * @output Gatewise — Connection Dash: a 390px MOBILE transfer surface.
 *   NavBar (44×44 gate-sign brand mark · 'MUC → HEL' · countdownPill
 *   'Buffer +14' in a 44×44 hit) over a flightCard (60px two-line row,
 *   error-tint gate chip + 44px gateChangeBanner after the scripted gate
 *   change), a bufferCard whose 20px BufferBar decomposes the 38-minute
 *   budget into flex-grow minute segments (spent actuals in muted brand
 *   tint, walk/tram/passport estimates in category colors, slack in
 *   success tint, a 45° hatched OVERDRAFT segment once 21+8+12 = 41 > 38),
 *   a five-row CheckpointChain (24px nodes: done brand fill + check,
 *   current pulsing ring, upcoming rest ring; 'Mark reached' on the
 *   current row only), and a sticky 'Backup plans · 3' footer opening the
 *   two-detent RebookTray that self-presents at medium and re-ranks
 *   fallback flights by seats left the instant slack goes negative. One
 *   connectionStore drives pill, bar, chain, banner, and tray; every
 *   aggregate derives per render.
 * @position Page template; emitted by \`astryx template mobile-connection-dash\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, absolute toast dock) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   rebook sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close. The stage clips to
 *   --radius-container; shell paints full-bleed square. NO width:390
 *   literals anywhere.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 56 for the 40px-node chain
 *   rows); no desktop Layout frames, no side asides, no tables. NO tabBar
 *   — the thumb-zone primary is the sticky-footer 'Backup plans' button.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Gatewise signal orange); the sanctioned non-brand
 *   literals are the tram/passport/slack/spent/overdraft segment pairs and
 *   the tricolor pill/chip tint pairs, each with contrast math at the
 *   declaration. Per the batch-2 amendment, meaningful rest-state marks
 *   (upcoming node rings) use an explicit ≥3:1 pair, not hairline tokens.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px
 *   card gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top
 *   z20 (paddingInline 8, grid '1fr auto 1fr', blur 86% color-mix,
 *   hairline ALWAYS ON — declared choice, no scroll wiring); flight row
 *   60px two-line; gateChangeBanner 44px; buffer bar 20px; checkpoint
 *   rows 72px (40px node column + 16 pad → divider inset 56);
 *   sectionHeader 13px/600 uppercase 0.06em at 32px (16 gutter + 16 card
 *   pad), 20px top / 8px bottom; sticky footer padding 16, 48px primary
 *   button radius 12; countdownPill 28px in a 44×44 hit; etaChip 24px
 *   radius 6; 'Mark reached' 36px secondary min-width 88; sheet detents
 *   55% medium / calc(100% − 56px) large, 24px grabber zone with 36×5
 *   pill, 52px sheet header, 72px rebookRows; toastDock sticky-in-flow
 *   bottom 84 (absolute insetInline 16 bottom 84 z45 only during sheet
 *   scroll-lock, per the sticky-dock amendment). TYPE (Figtree via
 *   --font-family-body): 17/600 nav + card + sheet titles · 16/500 row
 *   primaries · 16/400 body floor · 13/400 meta · 13/600 banner + pill ·
 *   11/500 chips + legend; nothing under 11px; tabular-nums on the pill,
 *   ETAs, minutes, ranks, and seat counts. Touch: every target ≥44×44
 *   with ≥8px clearance or merged into a full-row button; TAP is the only
 *   gesture shipped (no swipe/long-press/pull), so every affordance is
 *   already a visible button.
 *
 * Responsive contract:
 * - Fluid 320–430px: buffer segments are flex-grow minutes (zero px
 *   widths); legend chips flexWrap with 8px gaps; nav title
 *   maxWidth:'min(200px, 40vw)' ellipsis so pill + title coexist at 320;
 *   checkpoint secondaries ellipsize; the etaChip/Mark-reached trailing
 *   stack is fixed 96px with the primary column flex 1 minWidth 0;
 *   rebookRow meta ellipsizes; sheet insetInline 0 always; footer button
 *   full width. overflowX:'clip' on shell is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as a
 *   centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the chain anatomy is deliberately
 *   phone geometry.
 */

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject} from 'react';

import {
  CheckIcon,
  ClockIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math. Card surfaces: light ≈ #FFFFFF, dark ≈ #1C1C1E.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Gatewise signal orange). White on #E8590C
// = 4.53:1 (passes 4.5:1 for the node CheckIcon and footer label);
// #FFA94D on the dark card ≈ 8.7:1; as a fill vs the white card #E8590C
// ≈ 3.5:1 (≥3:1 for the 20px walk segments and 24px node rings).
const BRAND_ACCENT = 'light-dark(#E8590C, #FFA94D)';
// Text over a BRAND_ACCENT fill: #FFFFFF on #E8590C = 4.53:1;
// #15110C on #FFA94D ≈ 9.8:1.
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #15110C)';
// SPENT segments — muted brand tint for done actuals, still ≥3:1 vs the
// card per the rest-fill amendment: #C06A2F on #FFFFFF ≈ 3.9:1; #C98A57
// on #1C1C1E ≈ 5.6:1.
const SEG_SPENT = 'light-dark(#C06A2F, #C98A57)';
// TRAM segment: #7048E8 on #FFFFFF ≈ 5.0:1; #B197FC on #1C1C1E ≈ 7.6:1.
const SEG_TRAM = 'light-dark(#7048E8, #B197FC)';
// PASSPORT segment: #1971C2 on #FFFFFF ≈ 4.9:1; #74C0FC on #1C1C1E ≈ 8.9:1.
const SEG_PASSPORT = 'light-dark(#1971C2, #74C0FC)';
// SLACK segment (success): #2F9E44 on #FFFFFF ≈ 3.4:1; #69DB7C on
// #1C1C1E ≈ 9.0:1.
const SEG_SLACK = 'light-dark(#2F9E44, #69DB7C)';
// OVERDRAFT segment base (error): #C92A2A on #FFFFFF ≈ 5.5:1; #FF8A6B on
// #1C1C1E ≈ 6.5:1. The 45° hatch stripes overlay this fill.
const SEG_OVER = 'light-dark(#C92A2A, #FF8A6B)';
const OVER_HATCH = 'light-dark(rgba(255, 255, 255, 0.45), rgba(0, 0, 0, 0.35))';
// Countdown pill + etaChip tricolor tints. Text-on-tint math:
// positive — #1B7A3D on #DCF5E4 ≈ 4.6:1; #7ADFA0 on #14331F ≈ 8.1:1.
const TONE_POS_BG = 'light-dark(#DCF5E4, #14331F)';
const TONE_POS_TEXT = 'light-dark(#1B7A3D, #7ADFA0)';
// warning — #8A5A00 on #FCEBC8 ≈ 4.9:1; #F2C14E on #3A2A08 ≈ 8.5:1.
const TONE_WARN_BG = 'light-dark(#FCEBC8, #3A2A08)';
const TONE_WARN_TEXT = 'light-dark(#8A5A00, #F2C14E)';
// negative — #C22F17 on #FBE3DC ≈ 4.5:1; #FF8A6B on #3B1710 ≈ 6.6:1.
// The same pair styles the gateChangeBanner and the gate chip.
const TONE_NEG_BG = 'light-dark(#FBE3DC, #3B1710)';
const TONE_NEG_TEXT = 'light-dark(#C22F17, #FF8A6B)';
// UPCOMING node rings — meaningful rest-state boundaries, so an explicit
// ≥3:1 pair per the batch-2 amendment (NOT var(--color-border); spec
// deviation, noted): #867B6E on #FFFFFF ≈ 3.9:1; #9C9489 on #1C1C1E ≈ 5.2:1.
const NODE_REST = 'light-dark(#867B6E, #9C9489)';
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the visually-hidden
// h1, the current-node pulse, and the sheet slide-in. Transitions animate
// transform/opacity only; ALL of them collapse under prefers-reduced-motion
// (pulse removed entirely — the static ring+dot still encode 'current').
// ---------------------------------------------------------------------------

const GTW_CSS = \`
.gtw-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.gtw-btn:disabled { cursor: default; }
.gtw-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.gtw-fade { transition: opacity 240ms ease, background-color 240ms ease, color 240ms ease; }
@keyframes gtw-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.55); opacity: 0.55; }
}
.gtw-pulse { animation: gtw-pulse 1.6s ease-in-out infinite; }
@keyframes gtw-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.gtw-sheet-in { animation: gtw-sheet-in 240ms ease; }
.gtw-vh {
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
  .gtw-fade { transition: none; }
  .gtw-pulse { animation: none; }
  .gtw-sheet-in { animation: none; }
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
  // Scroll lock while the rebook sheet is open — absolute overlays anchor
  // to the visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8; hairline + blur ALWAYS
  // ON (declared choice; no scroll wiring).
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
  brandBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
  },
  // Center title — ellipsizes at min(200px, 40vw) so title + pill coexist
  // at 320 (spec: 44 + 200 + 94 = 338 > 320 → the 40vw clamp).
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 'min(200px, 40vw)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  // countdownPill — 28px pill inside a 44×44 hit-area button that scrolls
  // the buffer card into view.
  pillHit: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 999,
  },
  countdownPill: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 12},
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  cardGap: {height: 12},
  // FLIGHT CARD — 44px gateChangeBanner (post-event) above the 60px row.
  gateChangeBanner: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    background: TONE_NEG_BG,
    color: TONE_NEG_TEXT,
    fontSize: 13,
    fontWeight: 600,
    borderRadius: '8px 8px 0 0',
  },
  flightRowBtn: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  flightText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  flightPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  flightSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 20px-tall error-tint gate chip, shown once the gate change lands.
  gateChip: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 6,
    borderRadius: 6,
    background: TONE_NEG_BG,
    color: TONE_NEG_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  // BUFFER CARD — listCard with padding 16.
  bufferCard: {padding: 16},
  bufferHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  bufferTitle: {flex: 1, minWidth: 0, margin: 0, fontSize: 17, fontWeight: 600},
  bufferTotal: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // BUFFER BAR — 20px track, radius 8, segments flex-grow = minutes (zero
  // px widths → fluid 320–430); 2px scheme-background gaps via marginRight.
  bufferBar: {
    display: 'flex',
    height: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bufferSegment: {height: '100%', minWidth: 0},
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  legendChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  legendSwatch: {width: 10, height: 10, borderRadius: 3, flexShrink: 0},
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
  // CHECKPOINT CHAIN — <ol> reset; 72px rows; divider inset 56 (40px node
  // column + 16 pad).
  chainList: {listStyle: 'none', margin: 0, padding: 0},
  checkpointRow: {
    position: 'relative',
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    paddingInlineEnd: 16,
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 56},
  nodeCol: {
    position: 'relative',
    width: 40,
    alignSelf: 'stretch',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginInlineStart: 16,
  },
  // 2px connector line spanning row height behind the node.
  connTop: {
    position: 'absolute',
    top: 0,
    bottom: '50%',
    left: 19,
    width: 2,
    background: 'var(--color-border)',
  },
  connBottom: {
    position: 'absolute',
    top: '50%',
    bottom: 0,
    left: 19,
    width: 2,
    background: 'var(--color-border)',
  },
  nodeDone: {
    position: 'relative',
    width: 24,
    height: 24,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  nodeCurrent: {
    position: 'relative',
    width: 24,
    height: 24,
    borderRadius: 999,
    border: \`2px solid \${BRAND_ACCENT}\`,
    background: 'var(--color-background-card)',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  nodeDot: {width: 8, height: 8, borderRadius: 999, background: BRAND_ACCENT},
  nodeUpcoming: {
    position: 'relative',
    width: 24,
    height: 24,
    borderRadius: 999,
    border: \`2px solid \${NODE_REST}\`,
    background: 'var(--color-background-card)',
    flexShrink: 0,
  },
  ckText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    paddingInlineStart: 12,
    paddingBlock: 10,
  },
  ckPrimary: {
    fontSize: 16,
    fontWeight: 500,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  ckSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Trailing stack — fixed 96px so the flex-1 text column ellipsizes.
  ckTrailing: {
    width: 96,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    paddingBlock: 8,
  },
  etaChip: {
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 7,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // 'Mark reached' — 36px secondary VISUAL inside the one row <button>
  // (full 44px hit via the 72px row itself).
  markBtn: {
    height: 36,
    minWidth: 88,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: 12,
    borderRadius: 10,
    border: \`1px solid \${BRAND_ACCENT}\`,
    color: BRAND_ACCENT,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  reachedText: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  captionRow: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  bottomSpacer: {height: 24},
  // TOAST DOCK — sticky-in-flow above the footer (the shell grows with
  // content, so shell-absolute would pin to the DOCUMENT bottom); flips to
  // absolute bottom 84 z45 only while the sheet scroll-locks the shell.
  toastDock: {
    position: 'sticky',
    bottom: 84,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toastDockAbs: {
    position: 'absolute',
    insetInline: 16,
    bottom: 84,
    zIndex: 45,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    maxWidth: '100%',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    pointerEvents: 'auto',
  },
  toastText: {
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndoBtn: {
    minWidth: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
  },
  // STICKY FOOTER — thumb-zone primary; same blur surface as navBar.
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
  backupBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontSize: 16,
    fontWeight: 600,
  },
  backupBadge: {
    minWidth: 20,
    height: 20,
    display: 'grid',
    placeItems: 'center',
    paddingInline: 6,
    borderRadius: 999,
    background: 'color-mix(in srgb, #FFFFFF 24%, transparent)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // SHEET — scrim z40 + sheet z41, absolute inside shell.
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
  sheetGrabberZone: {
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
  sheetTitle: {margin: 0, fontSize: 17, fontWeight: 600, textAlign: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // The one legal inner scroller.
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 16},
  sortNoteRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 36,
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  rebookRow: {
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'var(--color-background-card)',
  },
  rankBadge: {
    width: 24,
    height: 24,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)',
  },
  rankBadgeTop: {background: BRAND_ACCENT, color: BRAND_FILL_TEXT},
  rebookText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  rebookPrimary: {
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rebookSecondary: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // 'Hold' visual affordance / 'Held' state tag (row is ONE button).
  holdChip: {
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 12,
    borderRadius: 10,
    border: \`1px solid \${BRAND_ACCENT}\`,
    color: BRAND_ACCENT,
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  heldTag: {
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  rowDividerFull: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  loadNote: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — one frozen sim clock (advances ONLY on checkpoint taps), dual
// fields everywhere ({min, label}), identity consts at top. ARITHMETIC
// AUDIT (every sum verified by hand; any drift is a reject):
//   budget: 14:37 − 13:59 = 38 min ✓
//   estimates: 5 + 7 + 8 + 4 = 24; slack = 38 − 24 = 14 ✓
//   state-A ETAs from 13:59: c2 14:04, c3 14:11, c4 14:19, c5 14:23;
//     14:23 + 0:14 slack = 14:37 ✓
//   tap 1 (c2 @ 14:06, actual 7 vs est 5): left 31, remaining 7+8+4 = 19,
//     slack 31 − 19 = 12; ETAs c3 14:13, c4 14:21, c5 14:25;
//     14:25 + 0:12 = 14:37 ✓
//   tap 2 (c3 @ 14:20, tram actual 14 vs est 7; gate B44 → K21, c5 walk
//     4 + 8 = 12 ✓): left 14:37 − 14:20 = 17, remaining 8 + 12 = 20,
//     slack 17 − 20 = −3 ✓; bar spent 7 + 14 = 21, units 21+8+12 = 41,
//     overdraft hatch 41 − 38 = 3 ✓
//   legend state A: Walk 5 · Tram 7 · Passport 8 · Walk 4 · Slack 14 = 38 ✓
//   alternates: seats 2 + 9 + 23 = 34 ✓; re-rank at slack < 0 by seats
//     23 > 9 > 2 ✓
// ---------------------------------------------------------------------------

/** Minutes-since-midnight → 'H:MM' 24-hour label ('14:37'). */
function fmtTime(min: number): string {
  return \`\${Math.floor(min / 60)}:\${String(min % 60).padStart(2, '0')}\`;
}

const DOORS_CLOSE = '14:37';
const DOORS_CLOSE_MIN = 877; // 14×60 + 37
const DEPARTS = '14:52';
const FLIGHT = 'AY 1442';
const TERMINAL_CAPTION = '5 checkpoints · Terminal 2';

type CheckpointKind = 'deplane' | 'walk' | 'tram' | 'passport';

interface Checkpoint {
  id: string;
  name: string;
  kind: CheckpointKind;
  estMin: number;
  // Scripted actual arrival — the sim clock jumps here on 'Mark reached'.
  // Spec scripts taps 1–2; c4/c5 actuals are extended here (deviation,
  // noted) so EVERY tap stays deterministic: c4 14:29 (actual 9 vs est 8
  // → slack 8 − 12 = −4), c5 14:41 (actual 12 → slack −4, all done).
  actualAtMin: number;
  actualAtLabel: string;
  done: boolean;
}

// c4's long name is the 320px two-line-clamp stress fixture.
const CHECKPOINTS: Checkpoint[] = [
  {id: 'c1', name: 'Deplane at A26', kind: 'deplane', estMin: 0, actualAtMin: 839, actualAtLabel: '13:59', done: true},
  {id: 'c2', name: 'Walk to tram', kind: 'walk', estMin: 5, actualAtMin: 846, actualAtLabel: '14:06', done: false},
  {id: 'c3', name: 'Tram to Terminal 2', kind: 'tram', estMin: 7, actualAtMin: 860, actualAtLabel: '14:20', done: false},
  {
    id: 'c4',
    name: 'Passport control · non-Schengen transfer, Level 04',
    kind: 'passport',
    estMin: 8,
    actualAtMin: 869,
    actualAtLabel: '14:29',
    done: false,
  },
  {id: 'c5', name: 'Walk to gate B44', kind: 'walk', estMin: 4, actualAtMin: 881, actualAtLabel: '14:41', done: false},
];

interface Alternate {
  id: string;
  flight: string;
  depMin: number;
  depLabel: string;
  seatsLeft: number;
  onTimePct: number;
  via: string | null;
}

// Seats 2 + 9 + 23 = 34 (loadNote cross-check). r3's secondary line
// ('via London Heathrow · 23 seats · 97% on-time') is the one-line
// ellipsis stress at 320px — it must never wrap to a third line.
const ALTERNATES: Alternate[] = [
  {id: 'r1', flight: 'LH 2237', depMin: 970, depLabel: '16:10', seatsLeft: 2, onTimePct: 88, via: null},
  {id: 'r2', flight: 'AY 1448', depMin: 1025, depLabel: '17:05', seatsLeft: 9, onTimePct: 92, via: null},
  {id: 'r3', flight: 'BA 951', depMin: 1120, depLabel: '18:40', seatsLeft: 23, onTimePct: 97, via: 'via London Heathrow'},
];

const ALTERNATE_SEAT_TOTAL = ALTERNATES.reduce((sum, alt) => sum + alt.seatsLeft, 0); // 34

// ---------------------------------------------------------------------------
// ONE STATE OWNER — connectionStore. EVERYTHING ELSE DERIVES per render:
// slackMin, barSegments, etaByCheckpoint, chipBand, rebookOrder, pillTone.
// No duplicated state anywhere.
// ---------------------------------------------------------------------------

interface Toast {
  seq: number;
  text: string;
  // Present only on hold toasts — Undo restores prevHeldId exactly.
  undo: {prevHeldId: string | null} | null;
}

interface ConnectionStore {
  nowSimMin: number; // 839 = 13:59 — frozen; advances only on taps
  currentIdx: number;
  checkpoints: Checkpoint[];
  gate: string;
  gateChanged: boolean;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  heldId: string | null;
  toast: Toast | null;
}

const INITIAL_STORE: ConnectionStore = {
  nowSimMin: 839,
  currentIdx: 1,
  checkpoints: CHECKPOINTS,
  gate: 'B44',
  gateChanged: false,
  sheetOpen: false,
  sheetDetent: 'medium',
  heldId: null,
  toast: null,
};

/** slack = (doors close − sim now) − Σ est of not-done checkpoints. */
function slackFor(nowSimMin: number, checkpoints: Checkpoint[]): number {
  const remaining = checkpoints.reduce((sum, ck) => sum + (ck.done ? 0 : ck.estMin), 0);
  return DOORS_CLOSE_MIN - nowSimMin - remaining;
}

type Band = 'pos' | 'warn' | 'neg';

/** Tricolor threshold: slack ≥ 10 → pos; 1–9 → warn; ≤ 0 → neg. */
function bandFor(slack: number): Band {
  if (slack >= 10) return 'pos';
  if (slack >= 1) return 'warn';
  return 'neg';
}

const BAND_BG: Record<Band, string> = {pos: TONE_POS_BG, warn: TONE_WARN_BG, neg: TONE_NEG_BG};
const BAND_TEXT: Record<Band, string> = {pos: TONE_POS_TEXT, warn: TONE_WARN_TEXT, neg: TONE_NEG_TEXT};
const BAND_ICON: Record<Band, typeof CheckIcon> = {pos: CheckIcon, warn: ClockIcon, neg: TriangleAlertIcon};

interface BarSegment {
  id: string;
  label: string;
  minutes: number;
  color: string;
  spent: boolean;
  over: boolean;
}

const KIND_COLOR: Record<CheckpointKind, string> = {
  deplane: BRAND_ACCENT,
  walk: BRAND_ACCENT,
  tram: SEG_TRAM,
  passport: SEG_PASSPORT,
};

const KIND_LABEL: Record<CheckpointKind, string> = {
  deplane: 'Deplane',
  walk: 'Walk',
  tram: 'Tram',
  passport: 'Passport',
};

interface BarModel {
  // Visual flex units — Σ minutes = max(38, spent + remaining) per the
  // spec's denominator law (state B: 21 + 8 + 12 = 41 units, of which the
  // FINAL 3 render as the hatched overdraft — trimmed off the tail
  // estimate, not added on top).
  visual: BarSegment[];
  // Legend/aria keep the LOGICAL minutes (Walk 12, Over 3 — not the
  // trimmed Walk 9 the visual shows).
  legend: BarSegment[];
  planned: number; // spent + remaining (41 in state B, 24 in state A)
}

function barModelFor(nowSimMin: number, checkpoints: Checkpoint[]): BarModel {
  const logical: BarSegment[] = [];
  let prevArrival = checkpoints[0].actualAtMin; // 839 — deplane moment
  for (const ck of checkpoints) {
    if (ck.id === 'c1') continue;
    if (ck.done) {
      const spentMin = ck.actualAtMin - prevArrival;
      prevArrival = ck.actualAtMin;
      if (spentMin > 0) {
        logical.push({
          id: \`\${ck.id}-spent\`,
          label: \`\${KIND_LABEL[ck.kind]} ✓\`,
          minutes: spentMin,
          color: SEG_SPENT,
          spent: true,
          over: false,
        });
      }
    } else if (ck.estMin > 0) {
      logical.push({
        id: \`\${ck.id}-est\`,
        label: KIND_LABEL[ck.kind],
        minutes: ck.estMin,
        color: KIND_COLOR[ck.kind],
        spent: false,
        over: false,
      });
    }
  }
  const slack = slackFor(nowSimMin, checkpoints);
  const planned = logical.reduce((sum, seg) => sum + seg.minutes, 0);
  const legend = [...logical];
  let visual = [...logical];
  if (slack > 0) {
    const slackSeg: BarSegment = {id: 'slack', label: 'Slack', minutes: slack, color: SEG_SLACK, spent: false, over: false};
    visual = [...visual, slackSeg];
    legend.push(slackSeg);
  } else if (slack < 0) {
    // Trim the overdraft minutes off the tail so total stays \`planned\`
    // (41 in state B), then hatch exactly that many trailing units.
    let need = -slack;
    for (let i = visual.length - 1; i >= 0 && need > 0; i--) {
      const take = Math.min(visual[i].minutes, need);
      visual[i] = {...visual[i], minutes: visual[i].minutes - take};
      need -= take;
    }
    visual = visual.filter(seg => seg.minutes > 0);
    const overSeg: BarSegment = {id: 'over', label: 'Over', minutes: -slack, color: SEG_OVER, spent: false, over: true};
    visual = [...visual, overSeg];
    legend.push(overSeg);
  }
  return {visual, legend, planned};
}

/** ETA per not-done checkpoint: sim now + cumulative remaining estimates. */
function etasFor(nowSimMin: number, checkpoints: Checkpoint[]): Record<string, number> {
  const etas: Record<string, number> = {};
  let cursor = nowSimMin;
  for (const ck of checkpoints) {
    if (ck.done) continue;
    cursor += ck.estMin;
    etas[ck.id] = cursor;
  }
  return etas;
}

/**
 * Rebook ranking law (stated in the sheet's sortNoteRow): slack ≥ 0 →
 * departure ascending (make the earliest); slack < 0 → seats left
 * descending (maximize the odds of ANY seat).
 */
function rebookOrderFor(slack: number): Alternate[] {
  const sorted = [...ALTERNATES];
  if (slack >= 0) sorted.sort((a, b) => a.depMin - b.depMin);
  else sorted.sort((a, b) => b.seatsLeft - a.seatsLeft);
  return sorted;
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

// Focus trap for the sheet dialog — Tab cycles within; Escape handled at
// the page level (topmost overlay only — the sheet is the only overlay).
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
// BRAND MARK — 24px gate-sign glyph (20×14 rect radius 3 with a punched-out
// ChevronRight), stroke currentColor = var(--color-text-primary), inside a
// 44×44 button.
// ---------------------------------------------------------------------------

function GatewiseMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x={2} y={5} width={20} height={14} rx={3} stroke="currentColor" strokeWidth={1.8} />
      <path
        d="M10 8.5l3.5 3.5-3.5 3.5"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// BUFFER BAR — stacked horizontal budget bar. role='img' with a label built
// from derived state; segments aria-hidden. Each segment flexGrow = its
// minutes (no px widths → fluid 320–430); 2px scheme-background gaps via
// marginRight except last; the OVERDRAFT segment wears a 45° hatch.
// ---------------------------------------------------------------------------

function bufferBarLabel(model: BarModel, slack: number): string {
  const parts = model.legend.map(seg => {
    if (seg.over) return \`\${seg.minutes} minutes over budget\`;
    if (seg.id === 'slack') return \`\${seg.minutes} slack\`;
    const verb = seg.spent ? 'spent' : 'estimated';
    return \`\${seg.minutes} \${seg.label.replace(' ✓', '')} \${verb}\`;
  });
  const budget = slack < 0 ? \`38 minute budget, \${model.planned} planned\` : '38 minute connection';
  return \`\${budget}: \${parts.join(', ')}\`;
}

interface BufferBarProps {
  model: BarModel;
  slack: number;
}

function BufferBar({model, slack}: BufferBarProps) {
  const {visual, legend} = model;
  return (
    <>
      <div style={styles.bufferBar} role="img" aria-label={bufferBarLabel(model, slack)}>
        {visual.map((seg, index) => (
          <div
            key={seg.id}
            aria-hidden
            className="gtw-fade"
            style={{
              ...styles.bufferSegment,
              flexGrow: seg.minutes,
              background: seg.over
                ? \`repeating-linear-gradient(45deg, \${SEG_OVER} 0, \${SEG_OVER} 4px, \${OVER_HATCH} 4px, \${OVER_HATCH} 8px)\`
                : seg.color,
              marginRight: index === visual.length - 1 ? 0 : 2,
            }}
          />
        ))}
      </div>
      <div style={styles.legend} aria-hidden>
        {legend.map(seg => (
          <span key={seg.id} style={styles.legendChip}>
            <span
              style={{
                ...styles.legendSwatch,
                background: seg.over
                  ? \`repeating-linear-gradient(45deg, \${SEG_OVER} 0, \${SEG_OVER} 2px, \${OVER_HATCH} 2px, \${OVER_HATCH} 4px)\`
                  : seg.color,
              }}
            />
            {seg.label} {seg.minutes}
          </span>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// CHECKPOINT ROW — 72px; leading 24px node in a 40px column with the 2px
// connector; ONLY the current row is a <button> (accessible name 'Mark
// reached: <name>'); done and upcoming rows are static. The visible 'Mark
// reached' 36px secondary is a styled span INSIDE the one row button.
// ---------------------------------------------------------------------------

interface CheckpointRowProps {
  checkpoint: Checkpoint;
  status: 'done' | 'current' | 'upcoming';
  etaMin: number | null;
  band: Band;
  isFirst: boolean;
  isLast: boolean;
  onMark: () => void;
}

function CheckpointRow({checkpoint, status, etaMin, band, isFirst, isLast, onMark}: CheckpointRowProps) {
  const BandIcon = BAND_ICON[band];
  const node =
    status === 'done' ? (
      <span style={styles.nodeDone} aria-hidden>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <path
            d="M4.5 12.5l5 5 10-11"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    ) : status === 'current' ? (
      <span style={styles.nodeCurrent} aria-hidden>
        <span className="gtw-pulse" style={styles.nodeDot} />
      </span>
    ) : (
      <span style={styles.nodeUpcoming} aria-hidden />
    );

  const secondary =
    status === 'done'
      ? \`Was est \${checkpoint.estMin} min\`
      : \`Est \${checkpoint.estMin} min · ETA \${etaMin == null ? '—' : fmtTime(etaMin)}\`;

  const body = (
    <>
      <span style={styles.nodeCol}>
        {isFirst ? null : <span style={styles.connTop} aria-hidden />}
        {isLast ? null : <span style={styles.connBottom} aria-hidden />}
        {node}
      </span>
      <span style={styles.ckText}>
        <span style={styles.ckPrimary}>{checkpoint.name}</span>
        <span style={styles.ckSecondary}>{secondary}</span>
      </span>
      <span style={styles.ckTrailing}>
        {status === 'done' ? (
          <span style={styles.reachedText}>Reached {checkpoint.actualAtLabel}</span>
        ) : (
          <span
            className="gtw-fade"
            style={{...styles.etaChip, background: BAND_BG[band], color: BAND_TEXT[band]}}>
            <Icon icon={BandIcon} size="xsm" color="inherit" />
            ETA {etaMin == null ? '—' : fmtTime(etaMin)}
          </span>
        )}
        {status === 'current' ? <span style={styles.markBtn}>Mark reached</span> : null}
      </span>
    </>
  );

  if (status === 'current') {
    return (
      <button
        type="button"
        className="gtw-btn gtw-focusable"
        style={styles.checkpointRow}
        aria-label={\`Mark reached: \${checkpoint.name}\`}
        onClick={onMark}>
        {body}
      </button>
    );
  }
  return <div style={styles.checkpointRow}>{body}</div>;
}

// ---------------------------------------------------------------------------
// REBOOK TRAY — two-detent bottom sheet (medium 55% / large calc(100% −
// 56px)). Rows re-sort live off connectionStore's derived slack; rank
// badges FLIP via transform only (plain reorder under reduced motion —
// the useLayoutEffect below is transform bookkeeping, not state). Row tap
// = 'Hold seat' executes immediately (undoOverConfirm); no confirms.
// ---------------------------------------------------------------------------

interface RebookTrayProps {
  slack: number;
  heldId: string | null;
  detent: 'medium' | 'large';
  reducedMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onToggleDetent: () => void;
  onClose: () => void;
  onHold: (id: string) => void;
}

function RebookTray({slack, heldId, detent, reducedMotion, sheetRef, onToggleDetent, onClose, onHold}: RebookTrayProps) {
  const ordered = rebookOrderFor(slack);
  const orderKey = ordered.map(alt => alt.id).join('|');

  // FLIP re-rank: remember each row's previous top; on reorder, invert
  // with a transform and release. Transform-only; skipped entirely under
  // reduced motion (rows simply appear in the new order).
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const prevTops = useRef(new Map<string, number>());
  useLayoutEffect(() => {
    rowRefs.current.forEach((el, id) => {
      const prev = prevTops.current.get(id);
      const next = el.getBoundingClientRect().top;
      if (prev != null && prev !== next && !reducedMotion) {
        el.style.transition = 'none';
        el.style.transform = \`translateY(\${prev - next}px)\`;
        requestAnimationFrame(() => {
          el.style.transition = 'transform 240ms ease';
          el.style.transform = '';
        });
      }
      prevTops.current.set(id, next);
    });
  }, [orderKey, reducedMotion]);

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gtw-sheet-title"
      tabIndex={-1}
      className="gtw-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transition: reducedMotion ? 'none' : 'height 240ms ease',
      }}>
      <button
        type="button"
        className="gtw-btn gtw-focusable"
        style={styles.sheetGrabberZone}
        aria-label="Resize sheet"
        onClick={onToggleDetent}>
        <span style={styles.sheetGrabber} aria-hidden />
      </button>
      <div style={styles.sheetHeader}>
        <span aria-hidden />
        <h2 id="gtw-sheet-title" style={styles.sheetTitle}>
          Backup flights
        </h2>
        <button
          type="button"
          className="gtw-btn gtw-focusable"
          style={styles.iconBtn}
          aria-label="Close backup flights"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>
        <div style={styles.sortNoteRow}>
          {slack < 0
            ? 'Sorted by seats left — buffer is negative'
            : 'Sorted by departure — buffer is holding'}
        </div>
        {ordered.map((alt, index) => {
          const held = heldId === alt.id;
          return (
            <div
              key={alt.id}
              ref={el => {
                if (el == null) rowRefs.current.delete(alt.id);
                else rowRefs.current.set(alt.id, el);
              }}>
              {index > 0 ? <div style={styles.rowDividerFull} /> : null}
              <button
                type="button"
                className="gtw-btn gtw-focusable"
                style={styles.rebookRow}
                aria-label={
                  held
                    ? \`\${alt.flight}, departs \${alt.depLabel}, seat held — release with Undo in the toast\`
                    : \`Hold seat on \${alt.flight}, departs \${alt.depLabel}, \${alt.seatsLeft} seats left\`
                }
                onClick={() => onHold(alt.id)}>
                <span
                  style={{...styles.rankBadge, ...(index === 0 ? styles.rankBadgeTop : null)}}
                  aria-hidden>
                  {index + 1}
                </span>
                <span style={styles.rebookText}>
                  <span style={styles.rebookPrimary}>
                    {alt.flight} · {alt.depLabel}
                  </span>
                  <span style={styles.rebookSecondary}>
                    {alt.via != null ? \`\${alt.via} · \` : ''}
                    {alt.seatsLeft} seats · {alt.onTimePct}% on-time
                  </span>
                </span>
                {held ? (
                  <span style={styles.heldTag}>Held</span>
                ) : (
                  <span style={styles.holdChip}>Hold seat</span>
                )}
              </button>
            </div>
          );
        })}
        <div style={styles.loadNote}>All 3 alternates · {ALTERNATE_SEAT_TOTAL} seats</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileConnectionDashTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [store, setStore] = useState<ConnectionStore>(INITIAL_STORE);
  const toastSeqRef = useRef(0);

  // One update helper — every mutation flows through it.
  const update = useCallback((patch: Partial<ConnectionStore>) => {
    setStore(prev => ({...prev, ...patch}));
  }, []);

  // Focus plumbing — opener restored on every close path.
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const backupBtnRef = useRef<HTMLButtonElement | null>(null);
  const bufferCardRef = useRef<HTMLElement | null>(null);
  const chainCardRef = useRef<HTMLDivElement | null>(null);

  // DERIVED — nothing below is stored.
  const slack = slackFor(store.nowSimMin, store.checkpoints);
  const band = bandFor(slack);
  const barModel = barModelFor(store.nowSimMin, store.checkpoints);
  const etas = etasFor(store.nowSimMin, store.checkpoints);
  const doneCount = store.checkpoints.filter(ck => ck.done).length;
  // Unicode minus for the negative pill, per spec ('Buffer −3').
  const pillLabel = \`Buffer \${slack >= 0 ? '+' : '−'}\${Math.abs(slack)}\`;

  const toastPatch = (text: string, undo: Toast['undo'] = null): Pick<ConnectionStore, 'toast'> => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, text, undo}};
  };

  // Focus moves into the opening sheet with preventScroll — plain .focus()
  // scroll-reveals the animating sheet inside the locked overflow-hidden
  // column and beaches it mid-screen (binding amendment).
  useEffect(() => {
    if (store.sheetOpen) sheetRef.current?.focus({preventScroll: true});
  }, [store.sheetOpen]);

  // Escape closes the topmost overlay — the sheet is the only overlay.
  useEffect(() => {
    if (!store.sheetOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      update({sheetOpen: false});
      sheetOpenerRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store.sheetOpen, update]);

  // (1) 'Mark reached' — the tap advances the sim clock to the scripted
  // actual, marks the checkpoint, and (on c3) fires the scripted gate
  // change; the auto-present is an inline check in the SAME synchronous
  // state change (no useEffect), so the whole beat is deterministic.
  const markReached = (id: string) => {
    setStore(prev => {
      const idx = prev.checkpoints.findIndex(ck => ck.id === id);
      if (idx !== prev.currentIdx) return prev;
      const tapped = prev.checkpoints[idx];
      let checkpoints = prev.checkpoints.map(ck => (ck.id === id ? {...ck, done: true} : ck));
      let gate = prev.gate;
      let gateChanged = prev.gateChanged;
      if (id === 'c3') {
        // Scripted delay event: gate B44 → K21; c5 walk 4 + 8 = 12 min.
        gate = 'K21';
        gateChanged = true;
        checkpoints = checkpoints.map(ck =>
          ck.id === 'c5' ? {...ck, name: 'Walk to gate K21', estMin: 12} : ck,
        );
      }
      const nowSimMin = tapped.actualAtMin;
      const nextSlack = slackFor(nowSimMin, checkpoints);
      const goesNegative = nextSlack < 0 && slackFor(prev.nowSimMin, prev.checkpoints) >= 0;
      const autoPresent = goesNegative && !prev.sheetOpen;
      if (autoPresent) sheetOpenerRef.current = backupBtnRef.current;
      const text = autoPresent
        ? 'Buffer negative — showing backup flights'
        : \`\${tapped.name} reached \${fmtTime(nowSimMin)} · buffer \${nextSlack >= 0 ? '+' : '−'}\${Math.abs(nextSlack)} min\`;
      toastSeqRef.current += 1;
      return {
        ...prev,
        nowSimMin,
        currentIdx: Math.min(idx + 1, prev.checkpoints.length),
        checkpoints,
        gate,
        gateChanged,
        sheetOpen: autoPresent ? true : prev.sheetOpen,
        sheetDetent: autoPresent ? 'medium' : prev.sheetDetent,
        toast: {seq: toastSeqRef.current, text, undo: null},
      };
    });
  };

  // (2) Persistent non-gesture path to the same sheet.
  const openSheet = (opener: HTMLElement | null) => {
    sheetOpenerRef.current = opener ?? backupBtnRef.current;
    update({sheetOpen: true, sheetDetent: 'medium'});
  };
  const closeSheet = () => {
    update({sheetOpen: false});
    sheetOpenerRef.current?.focus();
  };

  // (4) Hold seat — executes immediately (undoOverConfirm); Undo restores
  // the prior hold state exactly; the toast persists until replaced.
  const holdSeat = (id: string) => {
    setStore(prev => {
      const alt = ALTERNATES.find(a => a.id === id);
      if (alt == null || prev.heldId === id) return prev;
      toastSeqRef.current += 1;
      return {
        ...prev,
        heldId: id,
        toast: {seq: toastSeqRef.current, text: \`Seat held on \${alt.flight}\`, undo: {prevHeldId: prev.heldId}},
      };
    });
  };
  const undoHold = () => {
    setStore(prev => {
      if (prev.toast?.undo == null) return prev;
      toastSeqRef.current += 1;
      return {
        ...prev,
        heldId: prev.toast.undo.prevHeldId,
        toast: {seq: toastSeqRef.current, text: 'Hold released', undo: null},
      };
    });
  };

  // (5) countdownPill scrolls the buffer card into view.
  const scrollToBuffer = () => {
    bufferCardRef.current?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'center'});
  };

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(store.sheetOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const toastNode =
    store.toast != null ? (
      <div key={store.toast.seq} style={styles.toast} className="gtw-fade">
        <span style={styles.toastText}>{store.toast.text}</span>
        {store.toast.undo != null ? (
          <>
            <span style={styles.toastRule} aria-hidden />
            <button type="button" className="gtw-btn gtw-focusable" style={styles.toastUndoBtn} onClick={undoHold}>
              Undo
            </button>
          </>
        ) : null}
      </div>
    ) : null;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{GTW_CSS}</style>
      <div style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="gtw-btn gtw-focusable"
              style={styles.brandBtn}
              aria-label={\`Gatewise — connection \${FLIGHT}, Munich to Helsinki\`}
              onClick={scrollToBuffer}>
              <GatewiseMark />
            </button>
          </div>
          <span style={styles.navTitle}>MUC → HEL</span>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="gtw-btn gtw-focusable"
              style={styles.pillHit}
              aria-label={\`\${pillLabel} minutes — view connection budget\`}
              onClick={scrollToBuffer}>
              <span
                className="gtw-fade"
                style={{...styles.countdownPill, background: BAND_BG[band], color: BAND_TEXT[band]}}>
                {pillLabel}
              </span>
            </button>
          </div>
        </header>

        <main style={styles.main}>
          <h1 className="gtw-vh">Gatewise connection dashboard</h1>

          <section style={styles.listCard} aria-labelledby="gtw-flight-h2">
            <h2 id="gtw-flight-h2" className="gtw-vh">
              Flight
            </h2>
            {store.gateChanged ? (
              <div style={styles.gateChangeBanner} role="img" aria-label="Gate changed from B44 to K21, adding 8 minutes of walking">
                <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
                <span>Gate changed B44 → K21 · +8 min walk</span>
              </div>
            ) : null}
            <button
              type="button"
              className="gtw-btn gtw-focusable"
              style={styles.flightRowBtn}
              aria-label={\`Flight \${FLIGHT} to Helsinki, doors close \${DOORS_CLOSE}, gate \${store.gate} — view checkpoints\`}
              onClick={() =>
                chainCardRef.current?.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'})
              }>
              <span style={styles.flightText}>
                <span style={styles.flightPrimary}>{FLIGHT} · Helsinki</span>
                <span style={styles.flightSecondary}>
                  <span>
                    Doors close {DOORS_CLOSE} · Departs {DEPARTS} ·
                  </span>
                  {store.gateChanged ? (
                    <span style={styles.gateChip}>Gate {store.gate}</span>
                  ) : (
                    <span>Gate {store.gate}</span>
                  )}
                </span>
              </span>
            </button>
          </section>

          <div style={styles.cardGap} />

          <section
            ref={bufferCardRef}
            style={{...styles.listCard, ...styles.bufferCard}}
            aria-labelledby="gtw-budget-h2">
            <div style={styles.bufferHeader}>
              <h2 id="gtw-budget-h2" style={styles.bufferTitle}>
                Connection budget
              </h2>
              <span style={styles.bufferTotal}>{slack < 0 ? \`\${barModel.planned} of 38 min\` : '38 min'}</span>
            </div>
            <BufferBar model={barModel} slack={slack} />
          </section>

          <h2 style={styles.sectionHeader}>Checkpoints</h2>
          <div ref={chainCardRef} style={styles.listCard}>
            <ol style={styles.chainList}>
              {store.checkpoints.map((ck, index) => {
                const status = ck.done ? 'done' : index === store.currentIdx ? 'current' : 'upcoming';
                return (
                  <li key={ck.id}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <CheckpointRow
                      checkpoint={ck}
                      status={status}
                      etaMin={etas[ck.id] ?? null}
                      band={band}
                      isFirst={index === 0}
                      isLast={index === store.checkpoints.length - 1}
                      onMark={() => markReached(ck.id)}
                    />
                  </li>
                );
              })}
            </ol>
          </div>
          <div style={styles.captionRow}>
            {TERMINAL_CAPTION} · {doneCount} of 5 reached
          </div>
          <div style={styles.bottomSpacer} />
        </main>

        {/* THE one polite live region — sticky-in-flow above the footer;
            flips to shell-absolute (bottom 84, z45) only while the sheet
            scroll-locks the shell, per the sticky-dock amendment. */}
        <div style={store.sheetOpen ? styles.toastDockAbs : styles.toastDock} aria-live="polite">
          {toastNode}
        </div>

        <footer style={styles.stickyFooter}>
          <button
            type="button"
            ref={backupBtnRef}
            className="gtw-btn gtw-focusable"
            style={styles.backupBtn}
            aria-label={\`Backup plans — \${ALTERNATES.length} alternate flights\`}
            onClick={event => openSheet(event.currentTarget)}>
            Backup plans
            <span style={styles.backupBadge} aria-hidden>
              {ALTERNATES.length}
            </span>
          </button>
        </footer>

        {store.sheetOpen ? <div style={styles.sheetScrim} onClick={closeSheet} aria-hidden /> : null}
        {store.sheetOpen ? (
          <RebookTray
            slack={slack}
            heldId={store.heldId}
            detent={store.sheetDetent}
            reducedMotion={reducedMotion}
            sheetRef={sheetRef}
            onToggleDetent={() => update({sheetDetent: store.sheetDetent === 'medium' ? 'large' : 'medium'})}
            onClose={closeSheet}
            onHold={holdSeat}
          />
        ) : null}
      </div>
    </div>
  );
}


`;export{e as default};