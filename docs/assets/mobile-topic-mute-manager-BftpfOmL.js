var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Sotto mute-rules ledger over a
 *   BASE_DAILY of 49 stories/day: two active rules at load (Layoffs, 7 d /
 *   96 h remaining → '4d left' chip at 57% fill, hides 6/day; Crypto,
 *   24 h / 6 h remaining → '6h left' at 25%, hides 5/day — 49 − 6 − 5 = 38
 *   visible ✓, shelf badge 6 + 5 = 11 ✓); two suggestions (NBA Playoffs
 *   14/day, Election Polls 3/day); a 20-row sample feed (14 NBA + 2 Local +
 *   2 Climate + 1 Markets + 1 Science = 20 ✓) with per-topic peek headlines
 *   for every stub; five wheel stops with fixed end labels ('Until tonight —
 *   9:00 PM', story arc 'NBA Finals conclude Jun 22'). No Date.now(), no
 *   Math.random(), no network media — thumbnails are id-derived gradients.
 * @output Sotto — Topic Mute Manager: a 390px MOBILE mute-rule control
 *   panel that shows what silence costs. NavBar (Sotto speech-bubble mark ·
 *   'Sotto' · RefreshCw) over a searchBar, an 84px DensityMeter card
 *   ('38 stories / day' + 8px visible/hidden segment bar), ACTIVE MUTES · 2
 *   rule rows with draining ExpiryCountdownChips and ellipsis menus
 *   (Extend… / Edit duration… / destructive Unmute now), SUGGESTED rows
 *   with 88×36 Mute pills, and a full-bleed FeedImpactPreview where muted
 *   topics accordion-collapse into 44px ghost stubs with 3-headline peeks.
 *   Signature move: tapping Mute on NBA Playoffs commits immediately
 *   (undo-over-confirm) — 14 rows collapse into one stub, the meter animates
 *   38 → 24, ACTIVE MUTES gains a 100%-fill '24h left' row, the Shelf badge
 *   jumps 11 → 25, and the persistent sticky toast offers exact-prior-state
 *   Undo. Chip taps and 'Mute with duration…' open the two-detent
 *   MuteDurationWheel sheet (snap scroller, 5 radio stops, selection lens,
 *   footer label rebinding to the stop).
 * @position Page template; emitted by \`astryx template mobile-topic-mute-manager\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, anchored menus) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   sheet is open, shell locks to {height:'100dvh', overflow:'hidden'} and
 *   restores on close; the toast dock is sticky-in-flow above the tabBar
 *   (bottom 76) and flips to shell-absolute ONLY during that lock. The
 *   stage clips to --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16); the sample feed is the one
 *   sanctioned full-bleed edge-to-edge list (full-width hairlines, no
 *   card). No desktop Layout frames, no asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Sotto violet — the demo's --color-brand is the demo logo
 *   blue, so the spec hex is quarantined here per house rule). Every other
 *   literal is a light-dark() pair with contrast math at the declaration;
 *   the DensityMeter's hidden-segment rest fill is a MEANINGFUL rest fill
 *   and carries an explicit ≥3:1-vs-its-actual-card-surface pair (the
 *   spec's suggested #A8A29E/#57534E pair measured 2.5:1 / 2.3:1 — both
 *   fail 3:1 — and was corrected; math at the const).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', always-on bottom hairline — the
 *   'always on' choice, noted); searchBar 52px with 36px field; meter card
 *   84px; rule/suggestion rows 60px two-line; feed media rows 72px (48px
 *   thumb, 12px radius); ghost stubs 44px; menu rows 44px; tabBar 64px
 *   sticky bottom z20; sheet detents 55% / calc(100% − 56px), 24px grabber
 *   zone with 36×5 pill, 52px sheet header, 44px wheel rows. sectionHeader
 *   13/600 uppercase 0.06em at 32px (16 gutter + 16 card pad), 20px top /
 *   8px bottom. TYPE (Figtree via --font-family-body): 22/700 meter
 *   numeral · 17/600 nav+sheet titles · 16/400–500 row primary · 13/400
 *   secondary · 11/500–600 chips+tabs+badges; the 28/700 large-title row is
 *   deliberately skipped (compact title only, noted); nothing under 11px;
 *   tabular-nums on every counting numeral. Touch: every target ≥44×44
 *   with ≥8px clearance or merged into a full-row button; ZERO required
 *   gestures — every verb is a visible button (sheet drag is garnish over
 *   the clickable grabber).
 *
 * Responsive contract:
 * - Fluid 320–430px: all rows flex with minWidth 0 + ellipsis on primary
 *   text; the Mute pill (88×36 in a 44px hit) and ExpiryCountdownChip
 *   (64×24 in a ≥44×44 hit) are fixed-size trailing items — row text
 *   truncates first. Ghost-stub counts render before the label and never
 *   truncate (flexShrink 0). Meter bar is flex, numerals fixed. Sheet
 *   insetInline 0 at all widths. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the shell
 *   wrapper (container width, not viewport) — at ≥720px the shell becomes
 *   a centered phone column (maxWidth 430, marginInline auto, borderInline
 *   hairline). No adaptive relayout — the spec's contract is the phone
 *   experience as a centered column.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject} from 'react';

import {
  EyeOffIcon,
  LayersIcon,
  MoreHorizontalIcon,
  NewspaperIcon,
  RefreshCwIcon,
  SearchIcon,
  SearchXIcon,
  VolumeXIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Sotto violet). #6D28D9 on #FFFFFF ≈ 7.1:1
// (passes 4.5:1 for the 13/600 Undo + pill text); #C4B5FD on the dark card
// (~#1C1917, L≈0.010) ≈ 9.5:1.
const BRAND_ACCENT = 'light-dark(#6D28D9, #C4B5FD)';
// Text over a BRAND_ACCENT fill (Mute pill, sheet commit button, active
// meter segment is decorative). Light: #FFFFFF on #6D28D9 ≈ 7.1:1. Dark:
// white on #C4B5FD fails (~1.8:1), so the dark side flips to deep violet —
// #2E1065 on #C4B5FD ≈ 8.3:1. (Spec said 'white 13/600 label'; dark-side
// deviation for contrast, math above.)
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #2E1065)';
// ExpiryCountdownChip track — a brand-tinted wash per spec.
const CHIP_TRACK = 'light-dark(rgba(109, 40, 217, 0.14), rgba(196, 181, 253, 0.22))';
// Chip label sits over the TRACK (not the draining fill), so contrast holds
// even at 1% fill (stress fixture 2). Light: #4C1D95 on the blended track
// (≈#EBE1FA over white) ≈ 8.6:1; dark: #EDE9FE on the blended dark track
// (≈#3E3B52 over #1C1917) ≈ 8.9:1 — both clear 4.5:1 at 11px/600.
const CHIP_LABEL = 'light-dark(#4C1D95, #EDE9FE)';
// DensityMeter hidden-segment rest fill — a MEANINGFUL rest fill, so it
// needs ≥3:1 against its ACTUAL surface (the meter card): #78716C on the
// white card ≈ 4.8:1; #8A837C on the dark card (~#1C1917) ≈ 4.7:1. The
// spec's suggested light-dark(#A8A29E, #57534E) measured 2.5:1 / 2.3:1 —
// both FAIL the 3:1 interactive/meaningful-fill floor — so the pair was
// darkened/lightened per the foundations amendment (deviation, noted).
const METER_REST = 'light-dark(#78716C, #8A837C)';
// Brand wash for the expanded stub peek + active-tier tints (decorative).
const BRAND_TINT_10 = \`color-mix(in srgb, \${BRAND_ACCENT} 10%, transparent)\`;
// Sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';
// Id-derived thumbnail gradient hue pairs (decorative, aria-hidden).
const THUMB_SAT = '52%';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// accordion transitions, reduced-motion guard. Transitions animate
// height/opacity for the accordion (the one sanctioned height animation per
// spec) and transform/opacity elsewhere; all collapse under
// prefers-reduced-motion to instant swaps.
// ---------------------------------------------------------------------------

const SOTTO_CSS = \`
.stt-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.stt-btn:disabled { cursor: default; }
.stt-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.stt-anim { transition: transform 240ms ease, opacity 240ms ease; }
.stt-fade { transition: opacity 240ms ease; }
/* Accordion collapse for muted feed rows + the meter's re-flexing
   segments: 240ms height/opacity -> plain opacity swap under reduced
   motion (spec: FeedImpactPreview mutation animation). */
.stt-collapse { transition: height 240ms ease, opacity 240ms ease; }
.stt-seg { transition: flex-grow 240ms ease; }
@keyframes stt-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.stt-sheet-in { animation: stt-sheet-in 240ms ease; }
.stt-vh {
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
  .stt-anim, .stt-fade, .stt-collapse, .stt-seg { transition: none; }
  .stt-sheet-in { animation: none; }
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
  // Scroll lock while the sheet is open — absolute overlays anchor to the
  // visible screen; restored on close.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px slots optically
  // align content to the 16px gutter. Hairline + blur ALWAYS ON (this
  // template does not wire scroll-under; the 'always on' choice, noted).
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
  navTitle: {fontSize: 17, fontWeight: 600, margin: 0, whiteSpace: 'nowrap'},
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // SEARCH BAR — 52px block in flow below the navBar (same blur surface,
  // no bottom hairline of its own), 36px field.
  searchBar: {
    height: 52,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
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
    color: 'var(--color-text-secondary)',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    background: 'none',
    font: 'inherit',
    fontSize: 16,
    color: 'var(--color-text-primary)',
    outline: 'none',
    padding: 0,
  },
  // 44×36 clear hit (merged into the field's right edge; the field itself
  // is 36px tall so the hit fills its full height).
  searchClearBtn: {
    width: 44,
    height: 36,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  cancelBtn: {
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    fontSize: 17,
    fontWeight: 400,
    color: BRAND_ACCENT,
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // DENSITY METER card — 84px: 12px padding, overline / numeral / 8px bar.
  meterCard: {
    marginInline: 16,
    marginTop: 12,
    minHeight: 84,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
  },
  meterOverlineRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  overline: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  meterHiddenNote: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  meterNumeral: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
  },
  meterBar: {
    display: 'flex',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    gap: 2,
  },
  // Visible segment (BRAND_ACCENT) — min 4px so the all-muted edge (stress
  // fixture 4: 21 visible of 49) never collapses to zero width.
  meterSegVisible: {minWidth: 4, background: BRAND_ACCENT, borderRadius: 999},
  // Hidden segment — METER_REST, the corrected ≥3:1 meaningful rest fill.
  meterSegHidden: {minWidth: 4, background: METER_REST, borderRadius: 999},
  updatedCaption: {
    marginInline: 16,
    marginTop: 6,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
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
  sectionHeaderRow: {
    margin: '20px 0 8px',
    paddingInlineStart: 32,
    paddingInlineEnd: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  clearRecentsBtn: {
    height: 44,
    paddingInline: 8,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  // Inset-grouped listCard — 16px gutter inset, 12px radius, hairline.
  listCard: {
    position: 'relative',
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'visible',
  },
  listCardClip: {borderRadius: 'var(--radius-element, 12px)', overflow: 'hidden'},
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // RULE / SUGGESTION rows — 60px two-line; the row text is one button (or
  // static block), trailing chip + ellipsis are SIBLINGS, never nested.
  ruleRow: {display: 'flex', alignItems: 'center', minHeight: 60, paddingInlineStart: 16},
  rowText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    paddingBlock: 10,
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
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // ExpiryCountdownChip — 64×24 visual pill inside a 44×44+ hit.
  chipHit: {
    minWidth: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    paddingInline: 2,
  },
  chipTrack: {
    position: 'relative',
    width: 64,
    height: 24,
    borderRadius: 999,
    background: CHIP_TRACK,
    overflow: 'hidden',
  },
  chipFill: {
    position: 'absolute',
    insetBlock: 0,
    left: 0,
    background: BRAND_ACCENT,
    opacity: 0.35,
  },
  chipLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingInlineEnd: 8,
    fontSize: 11,
    fontWeight: 600,
    color: CHIP_LABEL,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Mute pill — 88×36 visual inside a 44px-tall padded hit.
  mutePillHit: {
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    paddingInline: 4,
  },
  mutePill: {
    width: 88,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 13,
    fontWeight: 600,
  },
  // Anchored menu card — absolute, 12px radius, 44px rows, z30 (below the
  // sheet scrim's z40).
  anchoredMenu: {
    position: 'absolute',
    right: 8,
    zIndex: 30,
    minWidth: 216,
    maxWidth: 'calc(100% - 16px)',
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
    paddingInline: 14,
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
  // FEED PREVIEW — the sanctioned full-bleed list: 72px media rows, 44px
  // ghost stubs, full-width hairlines, no card.
  feed: {display: 'flex', flexDirection: 'column'},
  feedDivider: {height: 1, background: 'var(--color-border)'},
  feedRowOuter: {overflow: 'hidden'},
  feedRow: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  feedThumb: {width: 48, height: 48, flexShrink: 0, borderRadius: 12},
  feedText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  feedMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Ghost stub — 44px, muted bg, square (full-bleed feed). Count renders
  // FIRST in DOM order with flexShrink 0 so the topic label ellipsizes and
  // the count never truncates (responsive contract).
  stubRow: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 500,
  },
  stubIcon: {flexShrink: 0, display: 'inline-flex'},
  stubCount: {flexShrink: 0, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  stubLabel: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Stub peek — 3 dimmed 44px headline rows + 13/400 caption.
  stubPeek: {background: BRAND_TINT_10},
  stubPeekRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  stubPeekCaption: {
    minHeight: 32,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 16,
    paddingBottom: 6,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  terminalCaption: {
    paddingBlock: 16,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST — sticky-in-flow dock (height 0) pinned 76px above the viewport
  // bottom, ABOVE the tabBar in stacking (z30); flips to shell-absolute
  // only while the shell is scroll-locked by the open sheet (foundations
  // amendment). Always mounted for aria-live.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    height: 0,
    marginInline: 16,
    pointerEvents: 'none',
  },
  toastAnchorLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 30,
    height: 0,
    marginInline: 0,
    pointerEvents: 'none',
  },
  toast: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  toastRule: {width: 1, height: 16, flexShrink: 0, background: 'var(--color-border)'},
  undoBtn: {
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
  // TAB BAR — 64px sticky bottom z20; 3 tabItems, badge on Shelf.
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
  tabLabel: {fontSize: 11, fontWeight: 500},
  tabLabelActive: {fontWeight: 600},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
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
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', paddingInline: 16},
  // MUTE DURATION WHEEL — the sheet's one legal inner scroller: a vertical
  // snap scroller of 44px stop rows behind a fixed centered selection lens.
  wheelWrap: {position: 'relative', flex: 1, minHeight: 220, display: 'flex'},
  wheelLens: {
    position: 'absolute',
    insetInline: 0,
    top: 'calc(50% - 22px)',
    height: 44,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    pointerEvents: 'none',
  },
  wheelScroller: {
    position: 'relative',
    flex: 1,
    overflowY: 'auto',
    scrollSnapType: 'y mandatory',
  },
  wheelRow: {
    width: '100%',
    height: 44,
    scrollSnapAlign: 'center',
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 12,
    borderRadius: 12,
  },
  wheelRowLabel: {fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap'},
  wheelRowSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetFooter: {
    flexShrink: 0,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  commitBtn: {
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
  // SEARCH result / recents rows.
  recentRow: {display: 'flex', alignItems: 'center', minHeight: 44, paddingInlineStart: 16},
  recentRowBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 16,
  },
  recentText: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // EMPTY STATE (no-results + shelf true-empty) per contract.
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
  emptyBody: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '4px 0 16px',
    lineHeight: 1.4,
  },
  emptyActionBtn: {
    height: 36,
    paddingInline: 16,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
  },
  bottomSpacer: {height: 24},
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts, dual fields (id + display) throughout, every
// aggregate cross-checked by hand before shipping:
//   BASE_DAILY 49; load rules hide 6 + 5 → visible 49 − 11 = 38 ✓; shelf
//   badge 6 + 5 = 11 ✓; sample 14 NBA + (2+2+1+1 = 6) others = 20 ✓ ('20 OF
//   38'); mute NBA (24h default) → 38 − 14 = 24 visible, 11 + 14 = 25
//   hidden, 24 + 25 = 49 ✓; mute Election Polls instead → 38 − 3 = 35 /
//   11 + 3 = 14, 35 + 14 = 49 ✓; unmute Layoffs → 38 + 6 = 44 / 5,
//   44 + 5 = 49 ✓; all-muted edge → 49 − 6 − 5 − 14 − 3 = 21 / 28,
//   21 + 28 = 49 ✓ (stress fixture 4 — 4px min meter segment). Peek math:
//   NBA 3 + 11 = 14 ✓; Layoffs 3 + 3 = 6 ✓; Crypto 3 + 2 = 5 ✓; Election
//   Polls 3 + 0 = 3 → NO 'and N more' caption (stress fixture 3, singular
//   remainder-zero grammar).
// ---------------------------------------------------------------------------

const BASE_DAILY = 49;

interface Topic {
  id: string;
  name: string;
  storiesPerDay: number; // stories/day this topic contributes
  stubOrd: number; // fixed slot of this topic's ghost stub in the feed
  peekHeadlines: string[]; // first 3 shelved headlines for the stub peek
}

const TOPICS: Record<string, Topic> = {
  layoffs: {
    id: 'layoffs',
    name: 'Layoffs',
    storiesPerDay: 6,
    stubOrd: 3.5,
    peekHeadlines: [
      'Hollis Systems cuts 1,200 roles in second restructuring this year',
      'Memo: Verdane Media to shrink newsroom by 15%',
      'Which sectors are actually hiring after the Q2 cuts',
    ],
  },
  crypto: {
    id: 'crypto',
    name: 'Crypto',
    storiesPerDay: 5,
    stubOrd: 8.5,
    peekHeadlines: [
      'Solvex token halts withdrawals for third time this month',
      'What the ledger leak means for exchange insurance funds',
      'Regulators circle stablecoin issuers after depeg scare',
    ],
  },
  nba: {
    id: 'nba',
    name: 'NBA Playoffs',
    storiesPerDay: 14,
    stubOrd: 1, // stub takes the first NBA row's slot when muted
    peekHeadlines: [], // derives from the first 3 in-sample NBA stories
  },
  election: {
    id: 'election',
    name: 'Election Polls',
    storiesPerDay: 3,
    stubOrd: 15.5,
    peekHeadlines: [
      'New tri-state poll shows a dead heat within the margin',
      'Why weekend polls skew — a methods explainer',
      'Poll tracker: the average moved 0.4 points this week',
    ],
  },
  local: {id: 'local', name: 'Local', storiesPerDay: 0, stubOrd: 0, peekHeadlines: []},
  climate: {id: 'climate', name: 'Climate', storiesPerDay: 0, stubOrd: 0, peekHeadlines: []},
  markets: {id: 'markets', name: 'Markets', storiesPerDay: 0, stubOrd: 0, peekHeadlines: []},
  science: {id: 'science', name: 'Science', storiesPerDay: 0, stubOrd: 0, peekHeadlines: []},
};

interface Story {
  id: string;
  topicId: string;
  title: string;
  source: string;
  timeLabel: string; // fixed string — the demo's internal 'today'
  ord: number; // fixed feed position
}

// TODAY'S SAMPLE — 20 in-sample stories: 14 NBA + 2 Local + 2 Climate +
// 1 Markets + 1 Science (2+2+1+1 = 6 ✓). Orders interleave the six
// non-NBA stories through the NBA run so the collapse visibly 'ghosts'
// most of the feed when NBA mutes.
const SAMPLE_STORIES: Story[] = [
  {id: 'st_nba01', topicId: 'nba', title: 'Deverell drops 41 as the series swings back to Oakhaven', source: 'Courtside Wire', timeLabel: '7:42 AM', ord: 1},
  {id: 'st_loc01', topicId: 'local', title: 'Riverfront night market returns with 60 vendors this weekend', source: 'City Ledger', timeLabel: '7:58 AM', ord: 2},
  {id: 'st_nba02', topicId: 'nba', title: 'Film breakdown: how the Wolves broke the drop coverage', source: 'The Pick & Pop', timeLabel: '8:05 AM', ord: 3},
  {id: 'st_nba03', topicId: 'nba', title: 'Game 5 injury report: Okafor questionable with ankle sprain', source: 'Courtside Wire', timeLabel: '8:31 AM', ord: 4},
  {id: 'st_cli01', topicId: 'climate', title: 'Reservoir levels rebound to 84% after a wet spring', source: 'Basin Report', timeLabel: '8:47 AM', ord: 5},
  {id: 'st_nba04', topicId: 'nba', title: 'Refs admit missed goaltend in final minute of Game 4', source: 'Whistle Watch', timeLabel: '9:02 AM', ord: 6},
  {id: 'st_nba05', topicId: 'nba', title: 'Bench units decided Game 4 — the numbers behind the run', source: 'The Pick & Pop', timeLabel: '9:15 AM', ord: 7},
  {id: 'st_mkt01', topicId: 'markets', title: 'Freight rates cool for a fourth straight week', source: 'Harbor Desk', timeLabel: '9:28 AM', ord: 8},
  {id: 'st_nba06', topicId: 'nba', title: "Coach Vranes: 'We're not changing the starting five'", source: 'Courtside Wire', timeLabel: '9:40 AM', ord: 9},
  {id: 'st_nba07', topicId: 'nba', title: 'The travel-day roundtable: who wins the rebounding battle?', source: 'Courtside Wire', timeLabel: '10:04 AM', ord: 10},
  {id: 'st_cli02', topicId: 'climate', title: 'Heat-pump rebate program doubles after early demand', source: 'Basin Report', timeLabel: '10:22 AM', ord: 11},
  {id: 'st_nba08', topicId: 'nba', title: 'Rookie watch: Malick logs first playoff double-double', source: 'The Pick & Pop', timeLabel: '10:39 AM', ord: 12},
  {id: 'st_nba09', topicId: 'nba', title: 'Ticket prices for Game 6 hit a five-year high', source: 'City Ledger', timeLabel: '10:55 AM', ord: 13},
  {id: 'st_nba10', topicId: 'nba', title: 'Deverell fined $25K for post-game comments on officiating', source: 'Whistle Watch', timeLabel: '11:10 AM', ord: 14},
  {id: 'st_loc02', topicId: 'local', title: 'Transit board approves the 14th Street bus-lane pilot', source: 'City Ledger', timeLabel: '11:26 AM', ord: 15},
  {id: 'st_nba11', topicId: 'nba', title: 'Inside the Wolves’ zone wrinkle nobody scouted', source: 'The Pick & Pop', timeLabel: '11:41 AM', ord: 16},
  {id: 'st_nba12', topicId: 'nba', title: 'Podcast: Game 5 keys with former assistant Dana Whitfield', source: 'Courtside Wire', timeLabel: '11:58 AM', ord: 17},
  {id: 'st_sci01', topicId: 'science', title: 'Fern genome study rewrites part of the plant family tree', source: 'Lab Notes', timeLabel: '12:14 PM', ord: 18},
  {id: 'st_nba13', topicId: 'nba', title: 'Betting line moves two points on Okafor uncertainty', source: 'Harbor Desk', timeLabel: '12:30 PM', ord: 19},
  {id: 'st_nba14', topicId: 'nba', title: 'Season retrospective: the trade that built this roster', source: 'The Pick & Pop', timeLabel: '12:47 PM', ord: 20},
];

interface MuteRule {
  id: string;
  topicId: string;
  durationH: number;
  remainingH: number;
  chipLabel: string; // '4d left' — fixed per fixture, no live clock
  mutedAgoLabel: string; // 'Muted 3 days ago'
}

// Active rules at load: R1 Layoffs 168h/96h → 96/168 = 57.1% fill, '4d
// left'; R2 Crypto 24h/6h → 6/24 = 25% fill, '6h left'. (Commented
// near-expiry stress: {durationH: 24, remainingH: 0.33, chipLabel: '20m
// left'} → 1.4% fill — the label sits over the TRACK, not the fill, so
// contrast holds at 1% per stress fixture 2.)
const INITIAL_RULES: MuteRule[] = [
  {id: 'rule_layoffs', topicId: 'layoffs', durationH: 168, remainingH: 96, chipLabel: '4d left', mutedAgoLabel: 'Muted 3 days ago'},
  {id: 'rule_crypto', topicId: 'crypto', durationH: 24, remainingH: 6, chipLabel: '6h left', mutedAgoLabel: 'Muted 18 hours ago'},
];

interface Suggestion {
  id: string;
  topicId: string;
  secondary: string;
}

// (Stress fixture 1 lives here in comments: a third suggestion variant
// {topicId with name 'Southeast Asia semiconductor export controls'}
// verifies primary-text ellipsis against the fixed 88px Mute pill at
// 320px — the 44-char name exercises the same truncation path as the two
// shipped rows, whose text already ellipsizes first per the contract.)
const SUGGESTIONS: Suggestion[] = [
  {id: 'sug_nba', topicId: 'nba', secondary: '14 stories/day this week'},
  {id: 'sug_election', topicId: 'election', secondary: '3 stories/day'},
];

interface WheelStop {
  id: string;
  label: string;
  subLabel: string | null; // fixed end label — no clocks
  hours: number;
  chipLabel: string; // chip text when a rule commits at this stop
  commitLabel: string; // footer button verb suffix
}

// The story-end stop binds to the fixture story lifecycle:
const STORY_ARC = {id: 'arc-nba-finals', label: 'NBA Finals conclude Jun 22'};

const WHEEL_STOPS: WheelStop[] = [
  {id: 'stop_tonight', label: 'Until tonight', subLabel: '9:00 PM', hours: 7, chipLabel: '7h left', commitLabel: 'until tonight'},
  {id: 'stop_24h', label: '24 hours', subLabel: null, hours: 24, chipLabel: '24h left', commitLabel: 'for 24 hours'},
  {id: 'stop_7d', label: '7 days', subLabel: null, hours: 168, chipLabel: '7d left', commitLabel: 'for 7 days'},
  {id: 'stop_30d', label: '30 days', subLabel: null, hours: 720, chipLabel: '30d left', commitLabel: 'for 30 days'},
  {id: 'stop_arc', label: 'Until this story ends', subLabel: STORY_ARC.label, hours: 432, chipLabel: 'Jun 22', commitLabel: 'until the story ends'},
];

const DEFAULT_STOP_ID = 'stop_24h';

const INITIAL_RECENTS = ['nba', 'strikes', 'ai'];

type TabId = 'feed' | 'mutes' | 'shelf';

const TAB_DEFS: Array<{id: TabId; label: string}> = [
  {id: 'feed', label: 'Feed'},
  {id: 'mutes', label: 'Mutes'},
  {id: 'shelf', label: 'Shelf'},
];

// ---------------------------------------------------------------------------
// HELPERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Id-derived thumbnail gradient — no network photos, per house law. */
function thumbGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 360;
  }
  const h1 = hash;
  const h2 = (hash + 40) % 360;
  return \`linear-gradient(135deg, hsl(\${h1} \${THUMB_SAT} 72%), hsl(\${h2} \${THUMB_SAT} 48%))\`;
}

/** Ghost-stub label: '14 hidden — NBA Playoffs' (count renders separately). */
function stubLabelFor(topic: Topic): string {
  return \`hidden — \${topic.name}\`;
}

/** Peek headlines for a topic (NBA derives from its in-sample stories). */
function peekFor(topic: Topic): string[] {
  if (topic.id === 'nba') {
    return SAMPLE_STORIES.filter(story => story.topicId === 'nba')
      .slice(0, 3)
      .map(story => story.title);
  }
  return topic.peekHeadlines;
}

/** Substring-match highlight: matched span at weight 600 (weight, not color). */
function highlightMatch(text: string, query: string): ReactNode {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (query === '' || idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{fontWeight: 600}}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

/** Nearest scrollable ancestor — the demo's .preview-wrap owns page scroll. */
function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el != null) {
    const style = window.getComputedStyle(el);
    if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight) return el;
    el = el.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — a single flat store + one update(patch) helper. EVERY
// consequence derives from \`rules\` at render time: density numbers, meter
// segments, stub counts, shelf badge, section counts — never stored twice.
// ---------------------------------------------------------------------------

interface SheetState {
  topicId: string;
  mode: 'create' | 'extend';
  stopId: string;
  detent: 'medium' | 'large';
}

interface UndoSnapshot {
  rules: MuteRule[];
  dismissedSuggestionIds: string[];
}

interface ToastState {
  seq: number;
  msg: string;
  undoSnapshot: UndoSnapshot | null;
}

interface SottoState {
  rules: MuteRule[];
  dismissedSuggestionIds: string[];
  tab: TabId;
  // Per-tab state persistence (ergonomics law): scrollTop + query keyed by
  // tab id; restored on entry, saved on exit.
  tabState: Record<TabId, {scrollTop: number; query: string}>;
  sheet: SheetState | null;
  toast: ToastState | null;
  expandedStubId: string | null;
  menuId: string | null; // open anchored-menu owner (rule id or suggestion id)
  searchFocused: boolean;
  query: string;
  recents: string[];
  refreshed: boolean;
  searchAnnounce: string; // settled 'N results' text for the one polite region
}

const INITIAL_STATE: SottoState = {
  rules: INITIAL_RULES,
  dismissedSuggestionIds: [],
  tab: 'mutes',
  tabState: {
    feed: {scrollTop: 0, query: ''},
    mutes: {scrollTop: 0, query: ''},
    shelf: {scrollTop: 0, query: ''},
  },
  sheet: null,
  toast: null,
  expandedStubId: null,
  menuId: null,
  searchFocused: false,
  query: '',
  recents: INITIAL_RECENTS,
  refreshed: false,
  searchAnnounce: '',
};

function useSottoState() {
  const [state, setState] = useState<SottoState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<SottoState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);
  return {state, update, setState};
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
// FOCUS UTILITIES — the sheet traps focus while open; Escape closes the
// topmost overlay only; focus restores to the opener on every close path.
// ---------------------------------------------------------------------------

function trapTabKey(event: ReactKeyboardEvent<HTMLDivElement>, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || container == null) return;
  const focusables = container.querySelectorAll<HTMLElement>('button:not([disabled]), input');
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
// BRAND MARK — the Sotto glyph: a speech bubble whose interior waveform
// flattens to a line at the tail. stroke = var(--color-text-primary), in a
// 44×44 non-button nav slot.
// ---------------------------------------------------------------------------

function SottoMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={26} height={26} viewBox="0 0 26 26" fill="none" aria-hidden>
        <path
          d="M4 5.5h18a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.8v-3.8H4A1.5 1.5 0 0 1 2.5 17V7A1.5 1.5 0 0 1 4 5.5Z"
          stroke="var(--color-text-primary)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Interior waveform: peaks on the left, flattening to a line at
            the tail — the mute story in one stroke. */}
        <path
          d="M6 12h1.2l1.1-3 1.3 5.4 1.2-4 1 2.2 1-0.9h7.7"
          stroke="var(--color-text-primary)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// DENSITY METER — 8px two-segment bar sized by count; numeral line '38
// stories / day' at 22/700 tabular. role='img', NOT a live region (the
// toast is the single announcer); segments re-flex 240ms (instant under
// reduced motion) via the .stt-seg class.
// ---------------------------------------------------------------------------

interface DensityMeterProps {
  visible: number;
  hidden: number;
  refreshed: boolean;
}

function DensityMeter({visible, hidden, refreshed}: DensityMeterProps) {
  return (
    <>
      <div
        style={styles.meterCard}
        role="img"
        aria-label={\`Feed density: \${visible} visible, \${hidden} hidden of \${BASE_DAILY} daily stories\`}>
        <div style={styles.meterOverlineRow}>
          <span style={styles.overline}>Your feed</span>
          <span style={styles.meterHiddenNote}>{hidden} hidden</span>
        </div>
        <span style={styles.meterNumeral}>{visible} stories / day</span>
        <div style={styles.meterBar} aria-hidden>
          <span className="stt-seg" style={{...styles.meterSegVisible, flexGrow: visible, flexBasis: 0}} />
          <span className="stt-seg" style={{...styles.meterSegHidden, flexGrow: hidden, flexBasis: 0}} />
        </div>
      </div>
      {refreshed ? <div style={styles.updatedCaption}>Updated just now</div> : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// EXPIRY COUNTDOWN CHIP — 64×24 pill in a ≥44×44 hit; BRAND fill bar drains
// left-to-right at (remaining / duration)%, static per fixture (no live
// clock). Label sits over the TRACK, right-aligned, so it stays readable
// down to 1% fill. Tap = extend affordance (opens the wheel preloaded).
// ---------------------------------------------------------------------------

interface ExpiryChipProps {
  rule: MuteRule;
  topicName: string;
  onTap: (opener: HTMLElement) => void;
}

function ExpiryCountdownChip({rule, topicName, onTap}: ExpiryChipProps) {
  const pct = Math.max(1, Math.round((rule.remainingH / rule.durationH) * 100));
  return (
    <button
      type="button"
      className="stt-btn stt-focusable"
      style={styles.chipHit}
      aria-label={\`\${topicName} mute, \${rule.chipLabel.replace('d ', ' days ').replace('h ', ' hours ')}, tap to extend\`}
      onClick={event => onTap(event.currentTarget)}>
      <span style={styles.chipTrack} aria-hidden>
        <span className="stt-anim" style={{...styles.chipFill, width: \`\${pct}%\`}} />
        <span style={styles.chipLabel}>{rule.chipLabel}</span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// ANCHORED MENU — 12px-radius card, 44px rows, ArrowUp/Down roving focus,
// destructive row LAST in --color-error (ergonomics rank a: destructive
// behind one intent step, never in the thumb arc).
// ---------------------------------------------------------------------------

interface MenuItem {
  id: string;
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

interface AnchoredMenuProps {
  items: MenuItem[];
  label: string;
  top: number;
  menuRef: RefObject<HTMLDivElement | null>;
}

function AnchoredMenu({items, label, top, menuRef}: AnchoredMenuProps) {
  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={label}
      style={{...styles.anchoredMenu, top}}
      onKeyDown={event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button'));
        const index = rows.indexOf(document.activeElement as HTMLElement);
        const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
        rows[(next + rows.length) % rows.length]?.focus();
      }}>
      {items.map((item, index) => (
        <div key={item.id}>
          {index > 0 ? <div style={styles.rowDivider} /> : null}
          <button
            type="button"
            role="menuitem"
            className="stt-btn stt-focusable"
            style={{...styles.menuRow, ...(item.destructive === true ? styles.menuRowDestructive : null)}}
            onClick={item.onSelect}>
            <span style={styles.menuRowText}>{item.label}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FEED IMPACT PREVIEW — the live sample feed sharing the mute-rules store.
// Visible stories render 72px media rows; each muted rule renders ONE 44px
// ghost stub at its topic's fixed slot. Muted rows stay mounted and
// accordion-collapse (height/opacity 240ms → opacity swap under reduced
// motion), so Undo restores them in their original order by construction.
// The stub is a real button toggling an inline 3-headline peek
// (aria-expanded wired); 'and N more' caption only when remainder > 0
// (stress fixture 3: Election Polls 3 + 0 = 3 → no caption).
// ---------------------------------------------------------------------------

interface FeedImpactPreviewProps {
  mutedTopicIds: Set<string>;
  rules: MuteRule[];
  expandedStubId: string | null;
  onToggleStub: (topicId: string) => void;
}

type FeedItem =
  | {kind: 'story'; ord: number; story: Story; muted: boolean}
  | {kind: 'stub'; ord: number; topic: Topic};

function FeedImpactPreview({mutedTopicIds, rules, expandedStubId, onToggleStub}: FeedImpactPreviewProps) {
  const items: FeedItem[] = SAMPLE_STORIES.map(story => ({
    kind: 'story' as const,
    ord: story.ord,
    story,
    muted: mutedTopicIds.has(story.topicId),
  }));
  for (const rule of rules) {
    const topic = TOPICS[rule.topicId];
    items.push({kind: 'stub', ord: topic.stubOrd, topic});
  }
  items.sort((a, b) => a.ord - b.ord);

  return (
    <div style={styles.feed}>
      {items.map((item, index) => {
        if (item.kind === 'stub') {
          const expanded = expandedStubId === item.topic.id;
          const peek = peekFor(item.topic);
          const remainder = item.topic.storiesPerDay - peek.length;
          return (
            <div key={\`stub_\${item.topic.id}\`}>
              {index > 0 ? <div style={styles.feedDivider} /> : null}
              <button
                type="button"
                className="stt-btn stt-focusable"
                style={styles.stubRow}
                aria-expanded={expanded}
                aria-label={\`\${item.topic.storiesPerDay} hidden — \${item.topic.name}. \${expanded ? 'Collapse' : 'Peek at'} hidden stories\`}
                onClick={() => onToggleStub(item.topic.id)}>
                <span style={styles.stubIcon} aria-hidden>
                  <Icon icon={EyeOffIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.stubCount}>{item.topic.storiesPerDay}</span>
                <span style={styles.stubLabel}>{stubLabelFor(item.topic)}</span>
              </button>
              {expanded ? (
                <div style={styles.stubPeek}>
                  {peek.map(headline => (
                    <div key={headline} style={styles.stubPeekRow}>
                      {headline}
                    </div>
                  ))}
                  {remainder > 0 ? <div style={styles.stubPeekCaption}>and {remainder} more</div> : null}
                </div>
              ) : null}
            </div>
          );
        }
        // Muted story rows stay mounted at height 0 so the collapse
        // animates and Undo restores original order without bookkeeping.
        const collapsed = item.muted;
        return (
          <div key={item.story.id}>
            {index > 0 && !collapsed ? <div style={styles.feedDivider} /> : null}
            <div
              className="stt-collapse"
              style={{...styles.feedRowOuter, height: collapsed ? 0 : 72, opacity: collapsed ? 0 : 1}}
              aria-hidden={collapsed}>
              <div style={styles.feedRow}>
                <span style={{...styles.feedThumb, background: thumbGradient(item.story.id)}} aria-hidden />
                <span style={styles.feedText}>
                  <span style={styles.feedTitle}>{item.story.title}</span>
                  <span style={styles.feedMeta}>
                    {item.story.source} · {item.story.timeLabel} · {TOPICS[item.story.topicId].name}
                  </span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MUTE DURATION WHEEL — vertical snap scroller of 5 stop rows behind a
// fixed centered selection lens. role='radiogroup'; rows are REAL buttons
// (role='radio', tap selects + scrolls into the lens); ArrowUp/Down move
// selection — the mandatory non-gesture path. Reduced motion: instant jump.
// ---------------------------------------------------------------------------

const WHEEL_ROW_H = 44;

interface MuteDurationWheelProps {
  stopId: string;
  onSelect: (stopId: string) => void;
  reducedMotion: boolean;
}

function MuteDurationWheel({stopId, onSelect, reducedMotion}: MuteDurationWheelProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const suppressScrollRef = useRef(0);

  const scrollToStop = useCallback(
    (id: string, smooth: boolean) => {
      const scroller = scrollerRef.current;
      const index = WHEEL_STOPS.findIndex(stop => stop.id === id);
      if (scroller == null || index < 0) return;
      suppressScrollRef.current += 1;
      scroller.scrollTo({top: index * WHEEL_ROW_H, behavior: smooth && !reducedMotion ? 'smooth' : 'auto'});
      // Release the suppression on the next frame batch — scroll events
      // fired by this programmatic scroll should not re-derive selection.
      window.setTimeout(() => {
        suppressScrollRef.current = Math.max(0, suppressScrollRef.current - 1);
      }, reducedMotion ? 0 : 320);
    },
    [reducedMotion],
  );

  // Snap the lens onto the selected stop on mount + whenever selection
  // changes from a tap or arrow key.
  useEffect(() => {
    scrollToStop(stopId, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    if (suppressScrollRef.current > 0) return;
    const scroller = scrollerRef.current;
    if (scroller == null) return;
    const index = Math.max(0, Math.min(WHEEL_STOPS.length - 1, Math.round(scroller.scrollTop / WHEEL_ROW_H)));
    const stop = WHEEL_STOPS[index];
    if (stop.id !== stopId) onSelect(stop.id);
  };

  const moveSelection = (delta: number) => {
    const index = WHEEL_STOPS.findIndex(stop => stop.id === stopId);
    const next = Math.max(0, Math.min(WHEEL_STOPS.length - 1, index + delta));
    const stop = WHEEL_STOPS[next];
    if (stop.id !== stopId) {
      onSelect(stop.id);
      scrollToStop(stop.id, true);
    }
  };

  const padBlock = \`calc(50% - \${WHEEL_ROW_H / 2}px)\`;
  return (
    <div style={styles.wheelWrap}>
      <div style={styles.wheelLens} aria-hidden />
      <div
        ref={scrollerRef}
        style={styles.wheelScroller}
        role="radiogroup"
        aria-label="Mute duration"
        onScroll={onScroll}
        onKeyDown={event => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            moveSelection(1);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            moveSelection(-1);
          }
        }}>
        <div style={{height: padBlock}} aria-hidden />
        {WHEEL_STOPS.map(stop => {
          const selected = stop.id === stopId;
          return (
            <button
              key={stop.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className="stt-btn stt-focusable"
              style={{...styles.wheelRow, opacity: selected ? 1 : 0.6}}
              onClick={() => {
                onSelect(stop.id);
                scrollToStop(stop.id, true);
              }}>
              <span style={{...styles.wheelRowLabel, fontWeight: selected ? 600 : 500}}>{stop.label}</span>
              {stop.subLabel != null ? <span style={styles.wheelRowSub}>{stop.subLabel}</span> : null}
            </button>
          );
        })}
        <div style={{height: padBlock}} aria-hidden />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MobileTopicMuteManagerTemplate() {
  // Container-width column decision: ≥720px of WRAPPER width → centered
  // 430px phone column (desktop stage); viewport query is the first-frame
  // fallback before the ResizeObserver reports.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {state, update, setState} = useSottoState();

  // Focus plumbing — opener restored on every close path.
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const toastSeqRef = useRef(0);

  // DERIVED — every consequence recomputes from \`rules\`, never stored:
  // visible = 49 − Σ hidden; shelf badge = Σ hidden; sample count = rows
  // whose topic is unmuted; suggestion list = not muted, not dismissed.
  const mutedTopicIds = new Set(state.rules.map(rule => rule.topicId));
  const hiddenPerDay = state.rules.reduce((sum, rule) => sum + TOPICS[rule.topicId].storiesPerDay, 0);
  const visiblePerDay = BASE_DAILY - hiddenPerDay;
  const sampleCount = SAMPLE_STORIES.filter(story => !mutedTopicIds.has(story.topicId)).length;
  const visibleSuggestions = SUGGESTIONS.filter(
    suggestion => !mutedTopicIds.has(suggestion.topicId) && !state.dismissedSuggestionIds.includes(suggestion.id),
  );
  const trimmedQuery = state.query.trim();
  const searchActive = state.searchFocused || trimmedQuery !== '';

  const snapshot = (): UndoSnapshot => ({
    rules: state.rules,
    dismissedSuggestionIds: state.dismissedSuggestionIds,
  });
  const toastPatch = (msg: string, undoSnapshot: UndoSnapshot | null): Partial<SottoState> => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, msg, undoSnapshot}};
  };

  // FOCUS LIFECYCLE ----------------------------------------------------------

  // Focus into the opening sheet with preventScroll — plain .focus() would
  // scroll-reveal the animating sheet inside the locked overflow-hidden
  // column and beach it mid-screen (foundations amendment).
  useEffect(() => {
    if (state.sheet != null) {
      sheetRef.current?.focus({preventScroll: true});
    }
  }, [state.sheet != null]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (state.menuId != null) {
      menuRef.current?.querySelector('button')?.focus({preventScroll: true});
    }
  }, [state.menuId]);

  const closeSheet = useCallback(
    (patch?: Partial<SottoState>) => {
      update({sheet: null, ...patch});
      sheetOpenerRef.current?.focus();
    },
    [update],
  );
  const closeMenu = useCallback(() => {
    update({menuId: null});
    menuOpenerRef.current?.focus();
  }, [update]);

  // Escape closes the TOPMOST overlay only: anchored menu > sheet. (The
  // search field handles its own Escape and stops propagation.)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (state.menuId != null) closeMenu();
      else if (state.sheet != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.menuId, state.sheet, closeMenu, closeSheet]);

  // MUTATIONS — undo-over-confirm: every reversible verb executes
  // immediately and offers exact-prior-state Undo through the ONE toast.
  // A new mutation replaces the toast; the old undo window simply ends
  // (stress fixture 6 — never stacked).
  // ---------------------------------------------------------------------

  const muteTopic = (topicId: string, stopId: string) => {
    const topic = TOPICS[topicId];
    const stop = WHEEL_STOPS.find(item => item.id === stopId) ?? WHEEL_STOPS[1];
    const rule: MuteRule = {
      id: \`rule_\${topicId}\`,
      topicId,
      durationH: stop.hours,
      remainingH: stop.hours, // fresh mute → 100% fill
      chipLabel: stop.chipLabel,
      mutedAgoLabel: 'Muted just now',
    };
    update({
      rules: [...state.rules, rule],
      sheet: null,
      menuId: null,
      ...toastPatch(\`\${topic.storiesPerDay} stories hidden — \${topic.name}\`, snapshot()),
    });
  };

  const extendRule = (ruleId: string, stopId: string) => {
    const stop = WHEEL_STOPS.find(item => item.id === stopId) ?? WHEEL_STOPS[1];
    const rule = state.rules.find(item => item.id === ruleId);
    if (rule == null) return;
    const topic = TOPICS[rule.topicId];
    update({
      rules: state.rules.map(item =>
        item.id === ruleId
          ? {...item, durationH: stop.hours, remainingH: stop.hours, chipLabel: stop.chipLabel}
          : item,
      ),
      sheet: null,
      ...toastPatch(\`\${topic.name} muted \${stop.commitLabel}\`, snapshot()),
    });
  };

  const unmuteRule = (ruleId: string) => {
    const rule = state.rules.find(item => item.id === ruleId);
    if (rule == null) return;
    const topic = TOPICS[rule.topicId];
    update({
      rules: state.rules.filter(item => item.id !== ruleId),
      menuId: null,
      ...toastPatch(\`\${topic.name} unmuted — \${topic.storiesPerDay} stories/day return\`, snapshot()),
    });
    menuOpenerRef.current?.focus();
  };

  const dismissSuggestion = (suggestionId: string) => {
    const suggestion = SUGGESTIONS.find(item => item.id === suggestionId);
    if (suggestion == null) return;
    update({
      dismissedSuggestionIds: [...state.dismissedSuggestionIds, suggestionId],
      menuId: null,
      ...toastPatch(\`Suggestion dismissed — \${TOPICS[suggestion.topicId].name}\`, snapshot()),
    });
    menuOpenerRef.current?.focus();
  };

  // Undo restores the EXACT prior state (rows return in original order by
  // construction — collapsed rows never left the DOM order), then the
  // toast reads the confirmation with no further undo.
  const undo = () => {
    const undoSnapshot = state.toast?.undoSnapshot;
    if (undoSnapshot == null) return;
    update({
      rules: undoSnapshot.rules,
      dismissedSuggestionIds: undoSnapshot.dismissedSuggestionIds,
      ...toastPatch('Restored', null),
    });
  };

  // SHEET ----------------------------------------------------------------

  const openSheet = (topicId: string, mode: 'create' | 'extend', opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    update({
      sheet: {topicId, mode, stopId: DEFAULT_STOP_ID, detent: 'medium'},
      menuId: null,
    });
  };

  const commitSheet = () => {
    const sheet = state.sheet;
    if (sheet == null) return;
    if (sheet.mode === 'create') {
      muteTopic(sheet.topicId, sheet.stopId);
    } else {
      extendRule(\`rule_\${sheet.topicId}\`, sheet.stopId);
    }
    sheetOpenerRef.current?.focus();
  };

  // TABS — per-tab state persists (scrollTop + query keyed by tab id);
  // active-tab re-tap scrolls to top (the one legal reset); the open sheet
  // closes on tab switch, the toast persists.
  const switchTab = (tabId: TabId) => {
    const scroller = getScrollParent(shellRef.current);
    if (tabId === state.tab) {
      if (scroller != null) scroller.scrollTop = 0;
      return;
    }
    const restoreTo = state.tabState[tabId].scrollTop;
    setState(prev => ({
      ...prev,
      tab: tabId,
      sheet: null,
      menuId: null,
      searchFocused: false,
      tabState: {
        ...prev.tabState,
        [prev.tab]: {scrollTop: scroller?.scrollTop ?? 0, query: prev.query},
      },
      query: prev.tabState[tabId].query,
    }));
    requestAnimationFrame(() => {
      if (scroller != null) scroller.scrollTop = restoreTo;
    });
  };

  // SEARCH — filters active rules + suggestions per keystroke; four
  // states: idle / focused-empty (recents) / results / no-results. The
  // settled count announces through the ONE polite region (a visually
  // hidden span in the toast dock — never a second region).
  const runQuery = (query: string) => {
    const trimmed = query.trim();
    let announce = '';
    if (trimmed !== '') {
      const count =
        state.rules.filter(rule => TOPICS[rule.topicId].name.toLowerCase().includes(trimmed.toLowerCase())).length +
        visibleSuggestions.filter(suggestion =>
          TOPICS[suggestion.topicId].name.toLowerCase().includes(trimmed.toLowerCase()),
        ).length;
      announce = \`\${count} \${count === 1 ? 'result' : 'results'}\`;
    }
    update({query, searchAnnounce: announce});
  };
  const exitSearch = () => {
    update({query: '', searchFocused: false, searchAnnounce: ''});
    searchInputRef.current?.blur();
  };

  const refresh = () => {
    update({refreshed: true, ...toastPatch('Updated just now', null)});
  };

  // SEARCH-FILTERED entities (matched substrings weight 600).
  const matchedRules =
    trimmedQuery === ''
      ? []
      : state.rules.filter(rule => TOPICS[rule.topicId].name.toLowerCase().includes(trimmedQuery.toLowerCase()));
  const matchedSuggestions =
    trimmedQuery === ''
      ? []
      : visibleSuggestions.filter(suggestion =>
          TOPICS[suggestion.topicId].name.toLowerCase().includes(trimmedQuery.toLowerCase()),
        );
  const hasResults = matchedRules.length + matchedSuggestions.length > 0;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(state.sheet != null ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const sheetTopic = state.sheet != null ? TOPICS[state.sheet.topicId] : null;
  const sheetStop = state.sheet != null ? WHEEL_STOPS.find(stop => stop.id === state.sheet?.stopId) ?? WHEEL_STOPS[1] : null;

  // ROW RENDERERS ---------------------------------------------------------

  const renderRuleRow = (rule: MuteRule, index: number, withDivider: boolean, inResults: boolean) => {
    const topic = TOPICS[rule.topicId];
    const menuOpen = state.menuId === rule.id;
    return (
      <div key={rule.id}>
        {withDivider ? <div style={styles.rowDivider} /> : null}
        <div style={styles.ruleRow}>
          <div style={styles.rowText}>
            <span style={styles.rowPrimary}>
              {inResults ? highlightMatch(topic.name, trimmedQuery) : topic.name}
            </span>
            <span style={styles.rowSecondary}>
              {rule.mutedAgoLabel} · {topic.storiesPerDay} stories/day hidden
            </span>
          </div>
          <ExpiryCountdownChip
            rule={rule}
            topicName={topic.name}
            onTap={opener => openSheet(rule.topicId, 'extend', opener)}
          />
          <button
            type="button"
            className="stt-btn stt-focusable"
            style={styles.iconBtn}
            aria-label={\`Actions for \${topic.name} mute\`}
            aria-expanded={menuOpen}
            onClick={event => {
              menuOpenerRef.current = event.currentTarget;
              update({menuId: menuOpen ? null : rule.id});
            }}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
        {menuOpen ? (
          <AnchoredMenu
            menuRef={menuRef}
            label={\`Actions for \${topic.name} mute\`}
            top={index * 61 + 52}
            items={[
              {
                id: 'extend',
                label: 'Extend…',
                onSelect: () => {
                  sheetOpenerRef.current = menuOpenerRef.current;
                  update({sheet: {topicId: rule.topicId, mode: 'extend', stopId: DEFAULT_STOP_ID, detent: 'medium'}, menuId: null});
                },
              },
              {
                id: 'edit',
                label: 'Edit duration…',
                onSelect: () => {
                  sheetOpenerRef.current = menuOpenerRef.current;
                  update({sheet: {topicId: rule.topicId, mode: 'extend', stopId: DEFAULT_STOP_ID, detent: 'medium'}, menuId: null});
                },
              },
              {id: 'unmute', label: 'Unmute now', destructive: true, onSelect: () => unmuteRule(rule.id)},
            ]}
          />
        ) : null}
      </div>
    );
  };

  const renderSuggestionRow = (suggestion: Suggestion, index: number, withDivider: boolean, inResults: boolean) => {
    const topic = TOPICS[suggestion.topicId];
    const menuOpen = state.menuId === suggestion.id;
    return (
      <div key={suggestion.id}>
        {withDivider ? <div style={styles.rowDivider} /> : null}
        <div style={styles.ruleRow}>
          <div style={styles.rowText}>
            <span style={styles.rowPrimary}>
              {inResults ? highlightMatch(topic.name, trimmedQuery) : topic.name}
            </span>
            <span style={styles.rowSecondary}>{suggestion.secondary}</span>
          </div>
          <button
            type="button"
            className="stt-btn stt-focusable"
            style={styles.mutePillHit}
            aria-label={\`Mute \${topic.name} for 24 hours\`}
            onClick={() => muteTopic(suggestion.topicId, DEFAULT_STOP_ID)}>
            <span style={styles.mutePill}>Mute</span>
          </button>
          <button
            type="button"
            className="stt-btn stt-focusable"
            style={styles.iconBtn}
            aria-label={\`More options for \${topic.name}\`}
            aria-expanded={menuOpen}
            onClick={event => {
              menuOpenerRef.current = event.currentTarget;
              update({menuId: menuOpen ? null : suggestion.id});
            }}>
            <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
          </button>
        </div>
        {menuOpen ? (
          <AnchoredMenu
            menuRef={menuRef}
            label={\`Options for \${topic.name}\`}
            top={index * 61 + 52}
            items={[
              {
                id: 'duration',
                label: 'Mute with duration…',
                onSelect: () => {
                  sheetOpenerRef.current = menuOpenerRef.current;
                  update({sheet: {topicId: suggestion.topicId, mode: 'create', stopId: DEFAULT_STOP_ID, detent: 'medium'}, menuId: null});
                },
              },
              {id: 'dismiss', label: 'Not interested', onSelect: () => dismissSuggestion(suggestion.id)},
            ]}
          />
        ) : null}
      </div>
    );
  };

  // TAB CONTENT -------------------------------------------------------------

  const feedBlock = (
    <>
      <FeedImpactPreview
        mutedTopicIds={mutedTopicIds}
        rules={state.rules}
        expandedStubId={state.expandedStubId}
        onToggleStub={topicId =>
          update({expandedStubId: state.expandedStubId === topicId ? null : topicId})
        }
      />
      <div style={styles.terminalCaption}>
        Sample of {sampleCount} stories · full feed {visiblePerDay}/day
      </div>
    </>
  );

  const searchContent = (
    <>
      {trimmedQuery === '' ? (
        // FOCUSED-EMPTY — recents card with per-row removes + Clear.
        <>
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeaderText}>Recent</h2>
            <button
              type="button"
              className="stt-btn stt-focusable"
              style={styles.clearRecentsBtn}
              onClick={() => update({recents: []})}>
              Clear
            </button>
          </div>
          <div style={styles.listCard}>
            <div style={styles.listCardClip}>
              {state.recents.length === 0 ? (
                <div style={{...styles.recentRow, minHeight: 44, color: 'var(--color-text-secondary)', fontSize: 13}}>
                  No recent searches
                </div>
              ) : (
                state.recents.map((recent, index) => (
                  <div key={recent}>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <div style={styles.recentRow}>
                      <button
                        type="button"
                        className="stt-btn stt-focusable"
                        style={styles.recentRowBtn}
                        onClick={() => runQuery(recent)}>
                        <Icon icon={SearchIcon} size="sm" color="secondary" />
                        <span style={styles.recentText}>{recent}</span>
                      </button>
                      <button
                        type="button"
                        className="stt-btn stt-focusable"
                        style={styles.iconBtn}
                        aria-label={\`Remove recent search \${recent}\`}
                        onClick={() => update({recents: state.recents.filter(item => item !== recent)})}>
                        <Icon icon={XIcon} size="sm" color="inherit" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : hasResults ? (
        // RESULTS — matched rules + suggestions, substrings weighted 600.
        <>
          <h2 style={styles.sectionHeader}>
            {matchedRules.length + matchedSuggestions.length} results
          </h2>
          <div style={styles.listCard}>
            <div style={styles.listCardClip}>
              {matchedRules.map((rule, index) => renderRuleRow(rule, index, index > 0, true))}
              {matchedSuggestions.map((suggestion, index) =>
                renderSuggestionRow(suggestion, matchedRules.length + index, matchedRules.length + index > 0, true),
              )}
            </div>
          </div>
        </>
      ) : (
        // NO RESULTS — filtered-empty, echoing the query verbatim; ONE
        // action: Clear search.
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={SearchXIcon} size="lg" color="inherit" />
          </span>
          <h2 style={styles.emptyTitle}>No topics for “{trimmedQuery}”</h2>
          <p style={styles.emptyBody}>Check the spelling or try a broader topic.</p>
          <button type="button" className="stt-btn stt-focusable" style={styles.emptyActionBtn} onClick={exitSearch}>
            Clear search
          </button>
        </div>
      )}
    </>
  );

  const mutesContent = searchActive ? (
    searchContent
  ) : (
    <>
      <DensityMeter visible={visiblePerDay} hidden={hiddenPerDay} refreshed={state.refreshed} />

      <h2 style={styles.sectionHeader}>Active mutes · {state.rules.length}</h2>
      <div style={styles.listCard}>
        <div style={styles.listCardClip}>
          {state.rules.length === 0 ? (
            <div style={{...styles.ruleRow, minHeight: 60}}>
              <div style={styles.rowText}>
                <span style={{...styles.rowSecondary, whiteSpace: 'normal'}}>
                  No active mutes — your full {BASE_DAILY} stories/day are flowing.
                </span>
              </div>
            </div>
          ) : (
            state.rules.map((rule, index) => renderRuleRow(rule, index, index > 0, false))
          )}
        </div>
      </div>

      <h2 style={styles.sectionHeader}>Suggested</h2>
      <div style={styles.listCard}>
        <div style={styles.listCardClip}>
          {visibleSuggestions.length === 0 ? (
            <div style={{...styles.ruleRow, minHeight: 44}}>
              <div style={styles.rowText}>
                <span style={styles.rowSecondary}>No suggestions right now</span>
              </div>
            </div>
          ) : (
            visibleSuggestions.map((suggestion, index) => renderSuggestionRow(suggestion, index, index > 0, false))
          )}
        </div>
      </div>

      <h2 style={styles.sectionHeader}>
        Preview — today's sample · {sampleCount} of {visiblePerDay}
      </h2>
      {feedBlock}
    </>
  );

  const feedTabContent = (
    <>
      <h2 style={styles.sectionHeader}>
        Today's sample · {sampleCount} of {visiblePerDay}
      </h2>
      {feedBlock}
    </>
  );

  const shelfTabContent = (
    <>
      <h2 style={styles.sectionHeader}>Shelved today · {hiddenPerDay}</h2>
      {state.rules.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyCircle}>
            <Icon icon={EyeOffIcon} size="lg" color="inherit" />
          </span>
          <h3 style={styles.emptyTitle}>Nothing shelved</h3>
          <p style={styles.emptyBody}>Stories from muted topics land here instead of your feed.</p>
        </div>
      ) : (
        state.rules.map(rule => {
          const topic = TOPICS[rule.topicId];
          const peek = peekFor(topic);
          const remainder = topic.storiesPerDay - peek.length;
          return (
            <div key={rule.id} style={{...styles.listCard, marginBottom: 12}}>
              <div style={styles.listCardClip}>
                <div style={styles.ruleRow}>
                  <div style={styles.rowText}>
                    <span style={styles.rowPrimary}>{topic.name}</span>
                    <span style={styles.rowSecondary}>
                      {topic.storiesPerDay} stories/day · {rule.chipLabel}
                    </span>
                  </div>
                </div>
                <div style={styles.rowDivider} />
                {peek.map(headline => (
                  <div key={headline} style={styles.stubPeekRow}>
                    {headline}
                  </div>
                ))}
                {remainder > 0 ? <div style={styles.stubPeekCaption}>and {remainder} more</div> : null}
              </div>
            </div>
          );
        })
      )}
    </>
  );

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{SOTTO_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <SottoMark />
          </div>
          <h1 style={styles.navTitle}>Sotto</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="stt-btn stt-focusable"
              style={styles.iconBtn}
              aria-label="Refresh feed stats"
              onClick={refresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {state.tab === 'mutes' ? (
            <div style={styles.searchBar}>
              <div style={styles.searchField}>
                <Icon icon={SearchIcon} size="sm" color="inherit" />
                <input
                  ref={searchInputRef}
                  type="search"
                  style={styles.searchInput}
                  placeholder="Search topics"
                  aria-label="Search topics"
                  value={state.query}
                  onChange={event => runQuery(event.target.value)}
                  onFocus={() => update({searchFocused: true})}
                  onKeyDown={event => {
                    if (event.key !== 'Escape') return;
                    event.stopPropagation();
                    // First Escape clears the query; Escape on an empty
                    // focused field exits search entirely (= Cancel).
                    if (state.query !== '') runQuery('');
                    else exitSearch();
                  }}
                />
                {state.query !== '' ? (
                  <button
                    type="button"
                    className="stt-btn stt-focusable"
                    style={styles.searchClearBtn}
                    aria-label="Clear search"
                    onClick={() => {
                      runQuery('');
                      searchInputRef.current?.focus();
                    }}>
                    <Icon icon={XCircleIcon} size="sm" color="inherit" />
                  </button>
                ) : null}
              </div>
              {searchActive ? (
                <button type="button" className="stt-btn stt-focusable" style={styles.cancelBtn} onClick={exitSearch}>
                  Cancel
                </button>
              ) : null}
            </div>
          ) : null}

          {state.tab === 'mutes' ? mutesContent : state.tab === 'feed' ? feedTabContent : shelfTabContent}
          <div style={styles.bottomSpacer} />
        </main>

        {/* THE one polite live region — sticky-in-flow dock above the
            tabBar; flips to shell-absolute only while the sheet locks the
            shell. Persistent toast (NO auto-dismiss timer): it survives
            until Undo, replacement, or a screen change. The visually
            hidden span carries settled search counts — same region. */}
        <div
          style={state.sheet != null ? styles.toastAnchorLocked : styles.toastAnchor}
          aria-live="polite"
          role="status">
          <span className="stt-vh">{state.searchAnnounce}</span>
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast} className="stt-fade">
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undoSnapshot != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="stt-btn stt-focusable" style={styles.undoBtn} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <nav style={styles.tabBar} aria-label="Sotto sections">
          {TAB_DEFS.map(tab => {
            const active = state.tab === tab.id;
            const TabIcon = tab.id === 'feed' ? NewspaperIcon : tab.id === 'mutes' ? VolumeXIcon : LayersIcon;
            return (
              <button
                key={tab.id}
                type="button"
                className="stt-btn stt-focusable"
                style={{...styles.tabItem, ...(active ? styles.tabItemActive : null)}}
                aria-current={active ? 'page' : undefined}
                onClick={() => switchTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={TabIcon} size="md" color="inherit" />
                  {tab.id === 'shelf' && hiddenPerDay > 0 ? (
                    <span style={styles.tabBadge}>{hiddenPerDay}</span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, ...(active ? styles.tabLabelActive : null)}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {state.sheet != null ? (
          <div style={styles.sheetScrim} onClick={() => closeSheet()} aria-hidden />
        ) : null}
        {state.sheet != null && sheetTopic != null && sheetStop != null ? (
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stt-sheet-title"
            tabIndex={-1}
            className="stt-sheet-in"
            onKeyDown={event => trapTabKey(event, sheetRef.current)}
            style={{
              ...styles.sheet,
              height: state.sheet.detent === 'medium' ? '55%' : 'calc(100% - 56px)',
              transition: reducedMotion ? 'none' : 'height 240ms ease',
            }}>
            {/* Grabber = a REAL button toggling detents (drag is garnish
                this template deliberately omits — zero required gestures). */}
            <button
              type="button"
              className="stt-btn stt-focusable"
              style={styles.grabberZone}
              aria-label="Resize sheet"
              onClick={() =>
                update({
                  sheet: {...state.sheet!, detent: state.sheet!.detent === 'medium' ? 'large' : 'medium'},
                })
              }>
              <span style={styles.grabberPill} aria-hidden />
            </button>
            <div style={styles.sheetHeader}>
              <span aria-hidden />
              <h2 id="stt-sheet-title" style={styles.sheetTitle}>
                {state.sheet.mode === 'create' ? \`Mute “\${sheetTopic.name}”\` : \`Extend “\${sheetTopic.name}”\`}
              </h2>
              <button
                type="button"
                className="stt-btn stt-focusable"
                style={styles.iconBtn}
                aria-label="Close sheet"
                onClick={() => closeSheet()}>
                <Icon icon={XIcon} size="md" color="inherit" />
              </button>
            </div>
            <div style={styles.sheetBody}>
              <MuteDurationWheel
                stopId={state.sheet.stopId}
                reducedMotion={reducedMotion}
                onSelect={stopId => update({sheet: {...state.sheet!, stopId}})}
              />
            </div>
            <div style={styles.sheetFooter}>
              <button type="button" className="stt-btn stt-focusable" style={styles.commitBtn} onClick={commitSheet}>
                {state.sheet.mode === 'create' ? \`Mute \${sheetStop.commitLabel}\` : \`Extend \${sheetStop.commitLabel}\`}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};