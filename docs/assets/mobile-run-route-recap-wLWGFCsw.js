var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Pacelight run run-0618 ('Morning
 *   Run' on the Riverside Bolt Loop, 'Thu Jun 18 · 6:42 AM · 21°C'): 8 full
 *   km splits + a 0.4 partial summing EXACTLY to 42:00 over 8.40 km (2520 s
 *   / 8.4 = 300 s/km = the 5:00 avg tile); an 84-sample PACE100 array
 *   (split + zero-sum wobble, so each km's mean IS its split); an 85-point
 *   ELEV array at 0.5 m resolution (ascent 76 m = the ELEV GAIN tile,
 *   descent 70 m, net +6 = 18−12 ✓, peak 68 m at km 4.8); an 84-sample HR
 *   array averaging exactly 159 bpm. No Date.now(), no Math.random(), no
 *   network media, no map tiles — the route is a stylized inline SVG.
 * @output Pacelight — Run Route Recap: a 390px MOBILE post-run analytics
 *   surface where ONE distanceCursor threads every module. NavBar (44×44
 *   Activity back · 18px bolt mark + 'Morning Run' · 44×44 Share) over a
 *   full-bleed 390×260 pace-gradient route ribbon (84 individually-stroked
 *   round-cap segments, fast=brand→slow=amber; 8 km-marker dots; start dot;
 *   finish chevron; a draggable 44×44 puck that IS a keyboard slider), a
 *   64px prev/next-km readout row, a 2×2 stat grid whose tiles are cursor
 *   buttons, a 9×60px diverging split ladder (km 5's +20 s bar fills the
 *   half zone exactly; km 7 wears the PB flag), and a synced 140px
 *   elevation strip. Signature move: setting cursorM from ANY writer (puck
 *   drag, slider keys, prev/next, split-row tap, elevation drag, stat tile)
 *   simultaneously moves the puck, slides the elevation cursor column,
 *   rewrites the readout chip, and highlights the active split row. The
 *   only overlay is the per-split anchored ellipsis menu (jump / copy /
 *   pin-with-Undo); the toast dock is sticky-in-flow.
 * @position Page template; emitted by \`astryx template mobile-run-route-recap\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', background:
 *   var(--color-background-body), overflowX:'clip'}; the 390px stage IS the
 *   phone viewport (no simulated OS chrome — the navBar at y=0 is the
 *   first pixel). No tabBar, no sheet, no FAB; the only absolute overlay is
 *   the anchored split menu (z30). The shell never owns scroll (the demo's
 *   .preview-wrap scrolls), so the toast dock is STICKY-IN-FLOW
 *   (position:'sticky', bottom:16, z30 at the end of shell) — absolute
 *   bottom-pinning would anchor to the document bottom on this tall
 *   scrolling view. position:fixed is banned.
 * Container policy: inset-grouped mobile listCards (16px gutter inset,
 *   12px radius, 1px border, hairline rowDividers inset 16, none on the
 *   last row); the route hero is the one full-bleed block. No desktop
 *   Layout frames, no side asides, no tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Pacelight green; the demo --color-brand is the demo logo
 *   blue, so the spec hex is quarantined here per house rule); BRAND_TEXT
 *   is the darker text-safe sibling (brand-fill vs brand-text split);
 *   PACE_SLOW is the documented dataviz ramp slow end (amber). Contrast
 *   math sits at each declaration. Interactive boundaries/rest fills obey
 *   the ≥3:1-against-actual-surface amendment (notes inline).
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr', hairline ALWAYS ON — this
 *   template does not wire scroll-under; chosen and noted per contract);
 *   route hero full-bleed, viewBox 0 0 390 260, xMidYMid meet; readout row
 *   64px (44×44 chevrons · 44px chip pill · 8px gaps); stat tiles 2×2,
 *   ~173×64, 12px gap, 11/500 overline + 22/700 tabular value + 13/400
 *   unit; sectionHeader 13/600 uppercase 0.06em at 32px (16 gutter + 16
 *   card pad), 20px top / 8px bottom; split rows EXACTLY 60px (32px km
 *   label | flex diverging zone | ≥48px time | 44×44 ellipsis, all gaps
 *   8px ≥ the clearance law); elevation card 140px = 8 + 96 chart + 4 + 24
 *   axis + 8. TYPE (Figtree via --font-family-body): 17/600 nav title ·
 *   16/400 body floor · 13 secondary · 11/500 overlines — nothing below
 *   11px; fontVariantNumeric:'tabular-nums' on every number that updates
 *   or aligns. Touch: every target ≥44×44 (16px puck visual inside a 44×44
 *   hit overlay; whole-row split buttons; full-tile stat buttons) with
 *   ≥8px clearance or merged full-row targets.
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width:390 literals: the hero scales uniformly
 *   via viewBox; the puck hit stays a 44×44 HTML div positioned by
 *   measured-width math (useElementWidth), so it never shrinks below 44px
 *   at 320; split-bar halfZoneWidth and the elevation cursor x both come
 *   from useElementWidth — no hardcoded stage math. Below 360px container
 *   the readout chip drops the bpm segment to a second 11px line (still
 *   one pill, no overflow); the meta line wraps to two lines cleanly.
 * - Desktop stage (~1045px, measured via useElementWidth on the wrapper —
 *   container width, not viewport): the shell renders as a centered
 *   phone column (maxWidth 430, marginInline auto, hairline borderInline)
 *   over the body background. No relayout — sticky navBar and sticky
 *   toastDock behave identically because sticky is in-flow.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  FlagIcon,
  LocateIcon,
  MoreHorizontalIcon,
  PinIcon,
  PinOffIcon,
  Share2Icon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Pacelight green). Used for FILLS, STROKES
// and the focus ring only — never for <18px text. #1E9E6A vs the white body
// (#FFFFFF-ish) ≈ 3.4:1 and vs the white card ≈ 3.4:1 — clears the ≥3:1
// bar for interactive boundaries/graphics against their ACTUAL surface;
// #4ED9A4 vs the dark card (~#1C1C1E) ≈ 9.6:1.
const BRAND_ACCENT = 'light-dark(#1E9E6A, #4ED9A4)';
// Brand-tinted TEXT (PB badge, Undo, pinned glyph) — the darker sibling
// because #1E9E6A fails 4.5:1 for text. #147A50 on the white card ≈ 5.3:1;
// #4ED9A4 on the dark card ≈ 9.6:1 — both pass 4.5:1 at 11px/600.
const BRAND_TEXT = 'light-dark(#147A50, #4ED9A4)';
// Documented dataviz ramp SLOW end (slower-than-average pace). #B45309 on
// the white card ≈ 5.0:1; #FCD34D on the dark card ≈ 10.6:1 — both clear
// 3:1 for 8px bars and 6px route strokes against card/body, and 4.5:1 if
// ever text-adjacent.
const PACE_SLOW = 'light-dark(#B45309, #FCD34D)';
// 10% brand wash for the ACTIVE split row — identification is carried by
// the full-strength 2px leading bar (3.4:1 light / 9.6:1 dark vs card),
// not by the wash, per the rest-fill amendment.
const BRAND_TINT_10 = \`color-mix(in srgb, \${BRAND_ACCENT} 10%, transparent)\`;
// 18% brand fill under the elevation sparkline — decorative area wash; the
// datum is the 2px full-strength BRAND_ACCENT stroke riding its top edge.
const BRAND_TINT_18 = \`color-mix(in srgb, \${BRAND_ACCENT} 18%, transparent)\`;
// 20% brand 'you are here' column on the elevation strip — the position is
// carried by the 1px full-strength BRAND_ACCENT center line (≥3:1 both
// schemes); the 8px column is auxiliary shading.
const BRAND_TINT_20 = \`color-mix(in srgb, \${BRAND_ACCENT} 20%, transparent)\`;
// Puck / start-dot ring: white in light per spec; near-black green in dark
// because a white ring on the light #4ED9A4 puck fill would blur (~1.9:1).
// Light: #FFFFFF ring vs #1E9E6A fill ≈ 3.4:1. Dark: #10201A vs #4ED9A4
// ≈ 8.9:1.
const PUCK_RING = 'light-dark(#FFFFFF, #10201A)';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// and the reduced-motion guard. Transitions animate transform/opacity only
// and are REMOVED under prefers-reduced-motion (positions still update
// instantly); no shimmer or pulse exists anywhere in this file.
// ---------------------------------------------------------------------------

const PACELIGHT_CSS = \`
.plr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.plr-btn:disabled { cursor: default; }
.plr-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.plr-anim { transition: transform 160ms ease, opacity 160ms ease; }
.plr-vh {
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
  .plr-anim { transition: none; }
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
  // Desktop stage ≥720px container width: centered phone column.
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; paddingInline 8 so 44px buttons
  // optically align content to the 16px gutter. Hairline + blur ALWAYS ON
  // (this template does not wire scroll-under state; chosen per contract).
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  backBtn: {
    height: 44,
    minWidth: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInlineEnd: 8,
    borderRadius: 12,
    color: 'var(--color-text-primary)',
  },
  backLabel: {fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)'},
  navCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    maxWidth: 200,
    minWidth: 0,
  },
  // h1 — visible 'Morning Run', accessible name = the full route title
  // (stress fixture 4).
  navTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
  // Meta line — 13/400 secondary at the 16px gutter; wraps to two clean
  // lines at 320px (no nowrap — stress fixture 4).
  metaLine: {
    marginTop: 12,
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.45,
  },
  // ROUTE HERO — the one full-bleed block; the wrapper is the role='slider'
  // keyboard scrubber (2px focus ring via .plr-focusable).
  hero: {
    position: 'relative',
    width: '100%',
    marginTop: 12,
    touchAction: 'none',
    borderRadius: 4,
  },
  heroSvg: {display: 'block', width: '100%', height: 'auto'},
  // 44×44 HTML hit/visual puck — positioned with transform (translate) so
  // motion is transform-only per the reduced-motion law; pointer input is
  // owned by the hero slider surface itself (the whole ribbon ≥44px).
  puckHit: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
  },
  puckDot: {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    border: \`3px solid \${PUCK_RING}\`,
    boxShadow: '0 2px 8px var(--color-shadow)',
  },
  // READOUT ROW — 64px tall, 16px gutter, 8px gaps.
  readoutRow: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  chevBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
  },
  chevBtnDisabled: {opacity: 0.35},
  // 44px pill chip — a READOUT card (not a control): hairline border is
  // container chrome, not a control boundary; the values inside are
  // primary-color 13/600 tabular.
  chip: {
    flex: 1,
    minWidth: 0,
    height: 44,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  chipLine: {
    maxWidth: '100%',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipLine2: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // STAT GRID — 2×2, 12px gap; tiles are full-tile cursor buttons.
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginTop: 12,
    marginInline: 16,
  },
  statTile: {
    height: 64,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingInline: 12,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statValueRow: {display: 'flex', alignItems: 'baseline', gap: 4, minWidth: 0},
  statValue: {fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1},
  statUnit: {fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  hrCaption: {
    marginTop: 8,
    paddingInline: 16,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SECTION HEADERS — 13/600 uppercase 0.06em at 32px (16 gutter + 16 card
  // pad), 20px top / 8px bottom margin.
  sectionHeaderRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    margin: '20px 0 8px',
    paddingInline: 32,
  },
  sectionHeader: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  sectionCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Inset-grouped listCard.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  // SPLIT LADDER — rows exactly 60px: [32px km | flex zone | ≥48px time |
  // 44×44 ellipsis], 8px gaps (≥8px clearance law).
  splitRow: {position: 'relative', display: 'flex', alignItems: 'center'},
  splitRowActive: {background: BRAND_TINT_10},
  // 2px inset leading brand bar — full-strength BRAND_ACCENT carries the
  // active-row identification (≥3:1 vs card in both schemes).
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  splitRowBtn: {
    flex: 1,
    minWidth: 0,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
  },
  kmLabel: {
    width: 32,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  barZone: {flex: 1, minWidth: 0, alignSelf: 'stretch', position: 'relative'},
  // Center axis — a PASSIVE separator, hairline token per the amendment
  // (the bars themselves are the meaningful marks at ≥3:1).
  barAxis: {
    position: 'absolute',
    left: '50%',
    top: 14,
    bottom: 14,
    width: 1,
    background: 'var(--color-border)',
  },
  bar: {
    position: 'absolute',
    top: '50%',
    marginTop: -4,
    height: 8,
    borderRadius: 4,
  },
  pbBadge: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 11,
    fontWeight: 600,
    color: BRAND_TEXT,
    whiteSpace: 'nowrap',
  },
  timeCell: {
    minWidth: 48,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
  },
  pinGlyph: {display: 'inline-flex', color: BRAND_TEXT, flexShrink: 0},
  ellipsisBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignSelf: 'center',
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    marginInlineEnd: 4,
  },
  // ANCHORED MENU — the ONLY overlay: absolute in shell, z30, 200px card.
  menu: {
    position: 'absolute',
    right: 16,
    zIndex: 30,
    width: 200,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'hidden',
  },
  menuRow: {
    width: '100%',
    height: 44,
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
  menuDivider: {height: 1, background: 'var(--color-border)'},
  // ELEVATION STRIP — 140px card = 8 pad + 96 chart + 4 gap + 24 axis + 8.
  elevCard: {
    marginInline: 16,
    marginBottom: 24,
    height: 140,
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    touchAction: 'none',
  },
  elevArea: {position: 'relative', height: 96, minWidth: 0},
  elevSvg: {position: 'absolute', inset: 0, width: '100%', height: '100%'},
  // 'You are here' — 8px shaded column, 1px full-strength brand line child;
  // moved with translateX only (reduced-motion law).
  elevCursor: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -4,
    width: 8,
    background: BRAND_TINT_20,
  },
  elevCursorLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 3.5,
    width: 1,
    background: BRAND_ACCENT,
  },
  peakDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    transform: 'translate(-50%, -50%)',
  },
  peakLabel: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  elevAxis: {position: 'relative', height: 24},
  axisLabel: {
    position: 'absolute',
    top: 5,
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // TOAST DOCK — STICKY-IN-FLOW at the end of shell (bottom:16, z30): the
  // shell grows with content, so absolute bottom-pinning would ride the
  // DOCUMENT bottom, off-viewport mid-scroll. Zero-height anchor; the
  // toast hangs above it. Always mounted for aria-live.
  toastAnchor: {
    position: 'sticky',
    bottom: 16,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
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
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  undoBtn: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — identity consts + dual fields (raw number AND preformatted
// label) throughout. Cross-check ledger (verified by hand before shipping):
//   splits 312+302+295+314+320+288+281+292 = 2404 s; +116 partial = 2520 s
//   = 42:00 TIME tile; 2520 / 8.4 km = EXACTLY 300 s/km = the 5:00 AVG
//   PACE tile. Elevation ascent 12+12+40+4+8 = 76 m (ELEV GAIN tile);
//   descent 4+4+28+20+14 = 70 m; net +6 = 18−12 ✓; min 8 m at km 0.8;
//   peak 68 m at km 4.8. HR 10×(148+152+156+162+168+160+166+158) = 12700;
//   + 4×164 = 656 → 13356 / 84 = EXACTLY 159 → the 'Avg HR 159 bpm · Max
//   168 bpm' caption. All three aggregates are ALSO derived live from the
//   arrays below and rendered from the derivation, never retyped.
// ---------------------------------------------------------------------------

const RUN = {
  id: 'run-0618',
  title: 'Morning Run',
  route: 'Riverside Bolt Loop',
  dateLabel: 'Thu Jun 18 · 6:42 AM · 21°C',
} as const;

const TOTAL_M = 8400;
const AVG_PACE_SEC = 300; // 5:00 /km — the diverging ladder's center axis

interface Split {
  id: string;
  name: string; // 'Split 5' — menu/toast identity
  kmLabel: string; // 32px ladder label
  distanceM: number;
  sec: number; // elapsed seconds for THIS split (partial: 116)
  timeLabel: string;
  paceSec: number; // sec per km (= sec for full kms; 290 for the 0.4)
  paceLabel: string;
  deltaSec: number; // paceSec − 300; + is slower, − is faster
  jumpM: number; // cursor target for the row tap: km midpoint
  pb?: boolean;
  partial?: boolean;
}

// km 5's +20 s is EXACTLY the bar scale max (its bar fills the half zone —
// clamp test, stress fixture 1); km 7 is the PB (fastest full km); the 0.4
// partial exercises the non-1km row path (stress fixture 2).
const SPLITS: Split[] = [
  {id: 'split-1', name: 'Split 1', kmLabel: '1', distanceM: 1000, sec: 312, timeLabel: '5:12', paceSec: 312, paceLabel: '5:12', deltaSec: 12, jumpM: 500},
  {id: 'split-2', name: 'Split 2', kmLabel: '2', distanceM: 1000, sec: 302, timeLabel: '5:02', paceSec: 302, paceLabel: '5:02', deltaSec: 2, jumpM: 1500},
  {id: 'split-3', name: 'Split 3', kmLabel: '3', distanceM: 1000, sec: 295, timeLabel: '4:55', paceSec: 295, paceLabel: '4:55', deltaSec: -5, jumpM: 2500},
  {id: 'split-4', name: 'Split 4', kmLabel: '4', distanceM: 1000, sec: 314, timeLabel: '5:14', paceSec: 314, paceLabel: '5:14', deltaSec: 14, jumpM: 3500},
  {id: 'split-5', name: 'Split 5', kmLabel: '5', distanceM: 1000, sec: 320, timeLabel: '5:20', paceSec: 320, paceLabel: '5:20', deltaSec: 20, jumpM: 4500},
  {id: 'split-6', name: 'Split 6', kmLabel: '6', distanceM: 1000, sec: 288, timeLabel: '4:48', paceSec: 288, paceLabel: '4:48', deltaSec: -12, jumpM: 5500},
  {id: 'split-7', name: 'Split 7', kmLabel: '7', distanceM: 1000, sec: 281, timeLabel: '4:41', paceSec: 281, paceLabel: '4:41', deltaSec: -19, jumpM: 6500, pb: true},
  {id: 'split-8', name: 'Split 8', kmLabel: '8', distanceM: 1000, sec: 292, timeLabel: '4:52', paceSec: 292, paceLabel: '4:52', deltaSec: -8, jumpM: 7500},
  {id: 'split-84', name: 'Split 8.4', kmLabel: '8.4', distanceM: 400, sec: 116, timeLabel: '1:56', paceSec: 290, paceLabel: '4:50', deltaSec: -10, jumpM: 8200, partial: true},
];

const MAX_DELTA_SEC = 20; // |delta| scale max — km 5 by construction

// PACE100 — 84 samples of sec/km, one per 100 m segment. Sample i in km k
// = splitSec[k] + WOBBLE[i % 10]; WOBBLE sums to 0 over 10 samples so each
// km's mean IS its split (the arrays cross-check the ladder). Adjacent
// samples differ by up to 8 s/km, so the ribbon gradient shows visible
// discrete variation (stress fixture 7). Partial wobble sums to 0 over 4.
const WOBBLE = [4, -2, 0, -4, 2, 4, -2, 0, -4, 2];
const PARTIAL_WOBBLE = [4, -2, -4, 2];
const PACE100: number[] = Array.from({length: 84}, (_, i) =>
  i < 80 ? SPLITS[Math.floor(i / 10)].paceSec + WOBBLE[i % 10] : 290 + PARTIAL_WOBBLE[i - 80],
);
// Worked examples (verified): cursorM 3600 → sample 36 (km 4, wobble −2) =
// 312 → '5:12 /km'; default cursorM 4800 → sample 48 (km 5, wobble −4) =
// 316 → '5:16 /km'.

// HR100 — 84 samples, constant per km; averages to exactly 159.
const HR_BY_KM = [148, 152, 156, 162, 168, 160, 166, 158];
const HR100: number[] = Array.from({length: 84}, (_, i) => (i < 80 ? HR_BY_KM[Math.floor(i / 10)] : 164));

// ELEV — 85 points (position i = i×100 m) at 0.5 m resolution, linear per
// anchor segment so every per-step increment is exact: −0.5, +1.5, −0.5,
// +1.5, +2.5, −3.5, +0.5, −2.5, +1.0, −3.5 per the anchor table.
const ELEV_ANCHORS: Array<[number, number]> = [
  [0, 12], [8, 8], [16, 20], [24, 16], [32, 28], [48, 68],
  [56, 40], [64, 44], [72, 24], [80, 32], [84, 18],
];
const ELEV: number[] = (() => {
  const out: number[] = [];
  for (let a = 0; a < ELEV_ANCHORS.length - 1; a++) {
    const [i0, e0] = ELEV_ANCHORS[a];
    const [i1, e1] = ELEV_ANCHORS[a + 1];
    for (let i = i0; i < i1; i++) {
      out[i] = e0 + ((e1 - e0) * (i - i0)) / (i1 - i0);
    }
  }
  out[84] = ELEV_ANCHORS[ELEV_ANCHORS.length - 1][1];
  return out;
})();
const PEAK_IDX = 48; // 68 m at km 4.8
const ELEV_MAX = 70; // y domain 0–70 m

// DERIVED AGGREGATES — the tiles render THESE, never retyped strings.
const TOTAL_SEC = SPLITS.reduce((sum, s) => sum + s.sec, 0); // 2520
const ELEV_GAIN_M = ELEV.reduce((sum, e, i) => (i > 0 && e > ELEV[i - 1] ? sum + (e - ELEV[i - 1]) : sum), 0); // 76
const AVG_HR = Math.round(HR100.reduce((sum, h) => sum + h, 0) / HR100.length); // exactly 159
const MAX_HR = Math.max(...HR100); // 168

// ---------------------------------------------------------------------------
// ROUTE GEOMETRY — the bolt polyline IS the brand mark (PacelightMark is
// its 18px miniature). ROUTE_POINTS[85] derived ONCE by cumulative-length
// interpolation so point[i] = the runner's position at i×100 m.
// ---------------------------------------------------------------------------

const ROUTE_VERTICES: Array<[number, number]> = [
  [36, 64], [150, 38], [236, 92], [118, 134], [300, 118], [186, 200], [340, 168], [306, 232],
];

interface Pt {
  x: number;
  y: number;
}

const ROUTE_POINTS: Pt[] = (() => {
  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < ROUTE_VERTICES.length - 1; i++) {
    const dx = ROUTE_VERTICES[i + 1][0] - ROUTE_VERTICES[i][0];
    const dy = ROUTE_VERTICES[i + 1][1] - ROUTE_VERTICES[i][1];
    const len = Math.sqrt(dx * dx + dy * dy);
    segLens.push(len);
    total += len;
  }
  const points: Pt[] = [];
  for (let i = 0; i <= 84; i++) {
    let target = (i / 84) * total;
    let seg = 0;
    while (seg < segLens.length - 1 && target > segLens[seg]) {
      target -= segLens[seg];
      seg += 1;
    }
    const t = segLens[seg] === 0 ? 0 : target / segLens[seg];
    const [x0, y0] = ROUTE_VERTICES[seg];
    const [x1, y1] = ROUTE_VERTICES[seg + 1];
    points.push({x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t});
  }
  return points;
})();

// Finish chevron rotation — the LAST segment's travel angle. The puck (an
// HTML layer above the SVG) wins the finish-line overlap by z-order
// (stress fixture 5).
const FINISH_DEG =
  (Math.atan2(
    ROUTE_VERTICES[7][1] - ROUTE_VERTICES[6][1],
    ROUTE_VERTICES[7][0] - ROUTE_VERTICES[6][0],
  ) *
    180) /
  Math.PI;

// Pace → ribbon color: fast (277 s/km, the sample min) = BRAND_ACCENT,
// slow (324 s/km, the sample max) = PACE_SLOW; linear color-mix between.
const PACE_FAST_SEC = 277;
const PACE_SLOW_SEC = 324;
function paceColor(sec: number): string {
  const t = Math.min(1, Math.max(0, (sec - PACE_FAST_SEC) / (PACE_SLOW_SEC - PACE_FAST_SEC)));
  return \`color-mix(in srgb, \${PACE_SLOW} \${Math.round(t * 100)}%, \${BRAND_ACCENT})\`;
}

// Fixed menu/toast strings (per spec): 'Split 5 time copied — 5:20',
// 'Split 5 pinned', 'Pin removed', 'Link copied'; Undo confirms with
// 'Restored'. One extra fixed string keeps the navBar back affordance
// honest on this single-screen recap.
const TOAST_LINK = 'Link copied';
const TOAST_PIN_REMOVED = 'Pin removed';
const TOAST_RESTORED = 'Restored';
const TOAST_BACK = 'Activity list is outside this demo';

// ---------------------------------------------------------------------------
// FORMATTERS — pure, deterministic.
// ---------------------------------------------------------------------------

/** Seconds → 'm:ss' ('42:00', '4:41'). */
function fmtMinSec(sec: number): string {
  return \`\${Math.floor(sec / 60)}:\${String(sec % 60).padStart(2, '0')}\`;
}

/** Meters → '4.8 km' (one decimal, tabular downstream). */
function fmtKm(m: number): string {
  return \`\${(m / 1000).toFixed(1)} km\`;
}

/** Cursor meters → the sample index for pace/HR (segment i covers
 * [i×100, i×100+100); the finish clamps to the last segment). */
function sampleIdxFor(cursorM: number): number {
  return Math.min(83, Math.floor(cursorM / 100));
}

interface CursorReading {
  distLabel: string;
  paceLabel: string;
  elevLabel: string;
  hrLabel: string;
}

/** Every readout of the cursor derives from ONE place. Worked example:
 * cursorM 4800 → '4.8 km · 5:16 /km · 68.0 m · 168 bpm'. Elevation stays
 * one tabular decimal at 0.5 m resolution — no jitter (stress fixture 3). */
function readingAt(cursorM: number): CursorReading {
  const s = sampleIdxFor(cursorM);
  return {
    distLabel: fmtKm(cursorM),
    paceLabel: \`\${fmtMinSec(PACE100[s])} /km\`,
    elevLabel: \`\${ELEV[cursorM / 100].toFixed(1)} m\`,
    hrLabel: \`\${HR100[s]} bpm\`,
  };
}

function sliderValueText(cursorM: number): string {
  const r = readingAt(cursorM);
  return \`\${r.distLabel} — \${fmtMinSec(PACE100[sampleIdxFor(cursorM)])} per km, \${r.elevLabel.replace(' m', '')} m elevation, \${r.hrLabel}\`;
}

// Active ladder row for a cursor: floor(cursorM/1000), clamped to the
// partial row past 8000 (row 9 at 8000–8400 — boundary stress fixture 5).
function activeSplitIndex(cursorM: number): number {
  return Math.min(8, Math.floor(cursorM / 1000));
}

// ---------------------------------------------------------------------------
// HOOKS
// ---------------------------------------------------------------------------

/** Container-width hook (grid-feeder-console pattern): only a
 * ResizeObserver on the element can tell the 390px mobile stage from the
 * ~1045px desktop stage inside the same 1440px window. */
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
// PACELIGHT MARK — 18px miniature of the route geometry: the same bolt
// polyline (vertices mapped into an 18×18 box), start dot, and a chevron
// arrowhead rotated to the final segment. SVG text is never used here; the
// mark inherits currentColor.
// ---------------------------------------------------------------------------

function PacelightMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden style={{flexShrink: 0}}>
      <polyline
        points="1.5,4.61 7.13,3 11.37,6.34 5.55,8.94 14.53,7.95 8.9,13.02 16.5,11.04 14.82,15"
        stroke={BRAND_ACCENT}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={1.5} cy={4.61} r={1.5} fill={BRAND_ACCENT} />
      {/* Chevron apex points along the last segment's travel direction. */}
      <g transform={\`translate(14.82 15) rotate(\${(FINISH_DEG - 90).toFixed(1)})\`}>
        <path d="M-2 -2.4 L0 0.6 L2 -2.4" stroke={BRAND_ACCENT} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PACE ROUTE RIBBON — full-bleed 390×260 stylized SVG (NO map tiles): 84
// individually-stroked round-cap 6px segments colored by pace, 8 km-marker
// nodes, start dot, finish chevron, and the 44×44 HTML puck. The wrapper
// div IS the keyboard slider (role='slider', ArrowLeft/Right ±100 m,
// PageUp/PageDown ±1000 m, Home/End) and the pointer surface (nearest of
// the 85 points — euclidean min, deterministic). The prev/next-km buttons
// and split rows are the redundant non-gesture paths.
// ---------------------------------------------------------------------------

interface PaceRouteRibbonProps {
  cursorM: number;
  heroWidth: number;
  heroRef: RefObject<HTMLDivElement | null>;
  onCursor: (m: number) => void;
}

function PaceRouteRibbon({cursorM, heroWidth, heroRef, onCursor}: PaceRouteRibbonProps) {
  const draggingRef = useRef(false);

  const pickNearest = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const host = heroRef.current;
      if (host == null) return;
      const rect = host.getBoundingClientRect();
      const vx = ((event.clientX - rect.left) / rect.width) * 390;
      const vy = ((event.clientY - rect.top) / rect.height) * 260;
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < ROUTE_POINTS.length; i++) {
        const dx = ROUTE_POINTS[i].x - vx;
        const dy = ROUTE_POINTS[i].y - vy;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      onCursor(best * 100);
    },
    [heroRef, onCursor],
  );

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = cursorM - 100;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = cursorM + 100;
    else if (event.key === 'PageUp') next = cursorM + 1000;
    else if (event.key === 'PageDown') next = cursorM - 1000;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TOTAL_M;
    if (next != null) {
      event.preventDefault();
      onCursor(next);
    }
  };

  // Puck position — transform-only motion (translate), scaled from the
  // MEASURED hero width so the 44×44 hit stays 44×44 at every stage width.
  const scale = (heroWidth > 0 ? heroWidth : 390) / 390;
  const puck = ROUTE_POINTS[cursorM / 100];
  const puckTx = puck.x * scale - 22;
  const puckTy = puck.y * scale * (260 / 260) - 22;

  return (
    <div
      ref={heroRef}
      className="plr-focusable"
      style={styles.hero}
      role="slider"
      tabIndex={0}
      aria-label="Route position"
      aria-valuemin={0}
      aria-valuemax={TOTAL_M}
      aria-valuenow={cursorM}
      aria-valuetext={sliderValueText(cursorM)}
      onKeyDown={onKeyDown}
      onPointerDown={event => {
        draggingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        pickNearest(event);
      }}
      onPointerMove={event => {
        if (draggingRef.current) pickNearest(event);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}>
      <svg style={styles.heroSvg} viewBox="0 0 390 260" preserveAspectRatio="xMidYMid meet" fill="none" aria-hidden>
        {/* Stylized ground — abstract city blocks + a park wash; passive
            decoration in muted/tint fills, deliberately NOT map tiles. */}
        <rect x={24} y={22} width={120} height={64} rx={10} fill="var(--color-background-muted)" />
        <rect x={252} y={30} width={112} height={52} rx={10} fill="var(--color-background-muted)" />
        <rect x={40} y={150} width={96} height={76} rx={10} fill="var(--color-background-muted)" />
        <rect x={230} y={190} width={130} height={48} rx={10} fill="var(--color-background-muted)" />
        <rect x={152} y={96} width={150} height={70} rx={12} fill={\`color-mix(in srgb, \${BRAND_ACCENT} 7%, transparent)\`} />
        <line x1={0} y1={140} x2={390} y2={140} stroke="var(--color-border)" strokeWidth={1} />
        <line x1={196} y1={0} x2={196} y2={260} stroke="var(--color-border)" strokeWidth={1} />
        {/* 84 round-capped pace segments — per-segment stroking makes the
            wobble's ±8 s/km neighbor jumps visibly discrete. */}
        {PACE100.map((sec, i) => (
          <line
            key={\`seg-\${i}\`}
            x1={ROUTE_POINTS[i].x}
            y1={ROUTE_POINTS[i].y}
            x2={ROUTE_POINTS[i + 1].x}
            y2={ROUTE_POINTS[i + 1].y}
            stroke={paceColor(sec)}
            strokeWidth={6}
            strokeLinecap="round"
          />
        ))}
        {/* 8 km-marker nodes at each 1000 m. */}
        {[10, 20, 30, 40, 50, 60, 70, 80].map(i => (
          <circle
            key={\`km-\${i}\`}
            cx={ROUTE_POINTS[i].x}
            cy={ROUTE_POINTS[i].y}
            r={4}
            fill="var(--color-background-body)"
            stroke="var(--color-text-secondary)"
            strokeWidth={2}
          />
        ))}
        {/* Start dot — 10px brand with a ring. */}
        <circle cx={ROUTE_POINTS[0].x} cy={ROUTE_POINTS[0].y} r={5} fill={BRAND_ACCENT} stroke={PUCK_RING} strokeWidth={2} />
        {/* Finish chevron rotated to the final segment angle. */}
        <g transform={\`translate(\${ROUTE_POINTS[84].x.toFixed(1)} \${ROUTE_POINTS[84].y.toFixed(1)}) rotate(\${FINISH_DEG.toFixed(1)})\`}>
          <path d="M-4 -7 L6 0 L-4 7" stroke="var(--color-text-primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>
      {/* 16px puck visual inside its 44×44 hit overlay (HTML, so it never
          scales below 44px); transform-only motion. */}
      <div
        className="plr-anim"
        style={{...styles.puckHit, transform: \`translate(\${puckTx.toFixed(1)}px, \${puckTy.toFixed(1)}px)\`}}
        aria-hidden>
        <div style={styles.puckDot} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SPLIT LADDER ROW — 60px; the diverging bar grows from the shared 1px
// center axis: faster-than-avg grows LEFT in BRAND_ACCENT, slower grows
// RIGHT in PACE_SLOW. barLen = min(|delta|, 20)/20 × halfZoneWidth — km
// 5's +20 s fills the half EXACTLY (clamp built in, stress fixture 1);
// halfZoneWidth comes from useElementWidth on the first row's zone (all
// zones share one grid geometry), never hardcoded. The main row area is
// ONE <button> that jumps the cursor; the trailing 44×44 ellipsis is its
// sibling, 8px away (clearance law) — never nested.
// ---------------------------------------------------------------------------

interface SplitLadderRowProps {
  split: Split;
  active: boolean;
  pinned: boolean;
  halfZone: number;
  zoneRef?: RefObject<HTMLDivElement | null>;
  onJump: (m: number) => void;
  onOpenMenu: (splitId: string, opener: HTMLButtonElement) => void;
  registerEllipsis: (splitId: string, el: HTMLButtonElement | null) => void;
}

function SplitLadderRow({split, active, pinned, halfZone, zoneRef, onJump, onOpenMenu, registerEllipsis}: SplitLadderRowProps) {
  const faster = split.deltaSec < 0;
  const barLen = (Math.min(Math.abs(split.deltaSec), MAX_DELTA_SEC) / MAX_DELTA_SEC) * halfZone;
  const barColor = faster ? BRAND_ACCENT : PACE_SLOW;
  const rowName = split.partial
    ? \`Final 0.4 kilometers — \${split.timeLabel}, pace \${split.paceLabel} per kilometer, \${Math.abs(split.deltaSec)} seconds faster than average\${pinned ? ', pinned' : ''}\`
    : \`Kilometer \${split.kmLabel} — \${split.timeLabel}, \${Math.abs(split.deltaSec)} seconds \${faster ? 'faster' : 'slower'} than average\${split.pb ? ', personal best' : ''}\${pinned ? ', pinned' : ''}\`;
  return (
    <div style={{...styles.splitRow, ...(active ? styles.splitRowActive : null)}}>
      {active ? <span style={styles.activeBar} aria-hidden /> : null}
      <button
        type="button"
        className="plr-btn plr-focusable"
        style={styles.splitRowBtn}
        aria-label={rowName}
        aria-current={active ? 'true' : undefined}
        onClick={() => onJump(split.jumpM)}>
        <span style={styles.kmLabel}>{split.kmLabel}</span>
        <span ref={zoneRef} style={styles.barZone} aria-hidden>
          <span style={styles.barAxis} />
          <span
            style={{
              ...styles.bar,
              ...(faster ? {right: '50%'} : {left: 'calc(50% + 1px)'}),
              width: Math.max(2, barLen),
              background: barColor,
              // Partial 0.4 row: 40%-opacity fill per spec; a 1px
              // full-strength outline keeps the mark ≥3:1 against the
              // card per the rest-fill amendment (stress fixture 2).
              ...(split.partial ? {opacity: undefined, background: \`color-mix(in srgb, \${barColor} 40%, transparent)\`, border: \`1px solid \${barColor}\`} : null),
            }}
          />
          {split.pb ? (
            // Flag rides ABOVE the bar, anchored at the tip and extending
            // toward center — a 95%-length bar leaves no room outside the
            // tip, and the badge must never invade the 32px km label.
            <span style={{...styles.pbBadge, top: 7, transform: 'none', left: \`calc(50% - \${barLen.toFixed(1)}px)\`}}>
              <Icon icon={FlagIcon} size="xsm" color="inherit" />
              PB
            </span>
          ) : null}
        </span>
        <span style={styles.timeCell}>
          {pinned ? (
            <span style={styles.pinGlyph} title="Pinned">
              <Icon icon={PinIcon} size="xsm" color="inherit" />
            </span>
          ) : null}
          {split.timeLabel}
        </span>
      </button>
      <button
        type="button"
        ref={el => registerEllipsis(split.id, el)}
        className="plr-btn plr-focusable"
        style={styles.ellipsisBtn}
        aria-label={\`\${split.name} options\`}
        aria-haspopup="menu"
        onClick={event => onOpenMenu(split.id, event.currentTarget)}>
        <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ELEVATION SYNC STRIP — 96px area sparkline of the 85-point ELEV array
// (y domain 0–70 m), 2px brand stroke over an 18% wash. The 8px 'you are
// here' column + 1px brand line mirror cursorM/8400 × innerWidth
// (useElementWidth) and move with translateX only. Pointer drag/click maps
// x → nearest 100 m and writes the SAME cursorM; the KEYBOARD path is the
// ribbon slider plus the prev/next-km buttons (gesture-with-button-path
// law), so the strip itself stays a pointer duplicate, not a tab stop.
// ---------------------------------------------------------------------------

// Static geometry — one path each, precomputed once (x = i×10 across an
// 840-wide viewBox stretched via preserveAspectRatio='none'; the stroke
// stays 2px via vector-effect).
const elevY = (e: number): number => 94 - (e / ELEV_MAX) * 90;
const ELEV_LINE_PATH = ELEV.map((e, i) => \`\${i === 0 ? 'M' : 'L'}\${i * 10} \${elevY(e).toFixed(1)}\`).join(' ');
const ELEV_AREA_PATH = \`\${ELEV_LINE_PATH} L840 96 L0 96 Z\`;

interface ElevationSyncStripProps {
  cursorM: number;
  onCursor: (m: number) => void;
}

function ElevationSyncStrip({cursorM, onCursor}: ElevationSyncStripProps) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const innerWidth = useElementWidth(areaRef);
  const draggingRef = useRef(false);

  const pick = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const host = areaRef.current;
      if (host == null) return;
      const rect = host.getBoundingClientRect();
      const idx = Math.min(84, Math.max(0, Math.round(((event.clientX - rect.left) / rect.width) * 84)));
      onCursor(idx * 100);
    },
    [onCursor],
  );

  const cursorX = (cursorM / TOTAL_M) * (innerWidth > 0 ? innerWidth : 326);
  const peakLeftPct = (PEAK_IDX / 84) * 100;

  return (
    <div
      style={styles.elevCard}
      role="img"
      aria-label={\`Elevation profile — \${Math.round(ELEV_GAIN_M)} m total gain, peak 68 m at 4.8 km. Position follows the route slider and kilometer buttons.\`}
      onPointerDown={event => {
        draggingRef.current = true;
        (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
        pick(event);
      }}
      onPointerMove={event => {
        if (draggingRef.current) pick(event);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}>
      <div ref={areaRef} style={styles.elevArea} aria-hidden>
        <svg style={styles.elevSvg} viewBox="0 0 840 96" preserveAspectRatio="none" fill="none">
          <path d={ELEV_AREA_PATH} fill={BRAND_TINT_18} />
          <path d={ELEV_LINE_PATH} stroke={BRAND_ACCENT} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        </svg>
        {/* Peak marker — static, so percentage positioning is fine. */}
        <span style={{...styles.peakDot, left: \`\${peakLeftPct.toFixed(2)}%\`, top: elevY(68)}} />
        <span style={{...styles.peakLabel, left: \`calc(\${peakLeftPct.toFixed(2)}% + 8px)\`, top: 1}}>68 m</span>
        {/* 'You are here' — translateX-only motion (reduced-motion law). */}
        <div className="plr-anim" style={{...styles.elevCursor, transform: \`translateX(\${cursorX.toFixed(1)}px)\`}}>
          <span style={styles.elevCursorLine} />
        </div>
      </div>
      <div style={styles.elevAxis} aria-hidden>
        {[0, 2, 4, 6, 8].map(k => (
          <span
            key={k}
            style={{
              ...styles.axisLabel,
              left: \`\${((k / 8.4) * 100).toFixed(2)}%\`,
              transform: k === 0 ? undefined : 'translateX(-50%)',
            }}>
            {k === 8 ? '8 km' : k}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STAT TILES — every displayed property is an affordance: each tile is a
// full-tile button that ALSO writes the cursor. Values derive from the
// arrays (TOTAL_SEC, ELEV_GAIN_M, AVG_HR), never retyped.
// ---------------------------------------------------------------------------

interface StatTileDef {
  id: string;
  label: string;
  value: string;
  unit: string | null;
  targetM: number;
  aria: string;
}

const STAT_TILES: StatTileDef[] = [
  {
    id: 'distance',
    label: 'Distance',
    value: (TOTAL_M / 1000).toFixed(2), // '8.40'
    unit: 'km',
    targetM: TOTAL_M,
    aria: 'Distance 8.40 kilometers — jump cursor to the finish',
  },
  {
    id: 'time',
    label: 'Time',
    value: fmtMinSec(TOTAL_SEC), // '42:00' — derives from the splits
    unit: null,
    targetM: 0,
    aria: 'Total time 42 minutes — jump cursor to the start',
  },
  {
    id: 'pace',
    label: 'Avg pace',
    // 2520 s / 8.4 km = exactly 300 s/km — the ladder axis and this tile
    // agree by construction.
    value: fmtMinSec(Math.round(TOTAL_SEC / (TOTAL_M / 1000))),
    unit: '/km',
    targetM: 6500,
    aria: 'Average pace 5:00 per kilometer — jump cursor to the personal-best kilometer',
  },
  {
    id: 'elev',
    label: 'Elev gain',
    value: String(Math.round(ELEV_GAIN_M)), // '76' — derives from ELEV
    unit: 'm',
    targetM: 4800,
    aria: 'Elevation gain 76 meters — jump cursor to the 68 meter peak',
  },
];

// ---------------------------------------------------------------------------
// ONE STATE OWNER — every consequence flows through update(patch):
// cursorM fan-out (puck, elevation column, readout chip, active row),
// pinned map, the single anchored menu, the single toast.
// ---------------------------------------------------------------------------

interface RecapState {
  cursorM: number; // 0–8400, always a 100 m multiple
  pinned: Record<string, boolean>;
  menu: {splitId: string; top: number} | null;
  toast: {seq: number; msg: string; undoPinned?: Record<string, boolean>} | null;
}

const INITIAL_STATE: RecapState = {
  cursorM: 4800, // the peak — chip reads '4.8 km · 5:16 /km · 68.0 m · 168 bpm'
  pinned: {},
  menu: null,
  toast: null,
};

const MENU_HEIGHT = 134; // 3 × 44px rows + 2 hairlines
const backdropStyle: CSSProperties = {position: 'absolute', inset: 0, zIndex: 29};

export default function MobileRunRouteRecapTemplate() {
  // Container-width decisions (never viewport): ≥720px wrapper → centered
  // 430px phone column; <360px shell → chip drops bpm to its second line.
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const shellWidth = wrapWidth > 0 ? Math.min(wrapWidth, 430) : 390;
  const narrowChip = shellWidth < 360;

  const heroRef = useRef<HTMLDivElement | null>(null);
  const heroWidth = useElementWidth(heroRef);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const zoneWidth = useElementWidth(zoneRef);
  // halfZoneWidth from measurement; 88 is only the pre-observer fallback.
  const halfZone = zoneWidth > 0 ? (zoneWidth - 1) / 2 : 88;

  const shellRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const ellipsisRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const toastSeqRef = useRef(0);

  const [state, setState] = useState<RecapState>(INITIAL_STATE);
  const update = useCallback((patch: Partial<RecapState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);

  // THE signature writer — every source funnels here; snap to the 100 m
  // grid, clamp to [0, 8400].
  const setCursor = useCallback(
    (m: number) => {
      update({cursorM: Math.min(TOTAL_M, Math.max(0, Math.round(m / 100) * 100))});
    },
    [update],
  );

  const toastPatch = (msg: string, undoPinned?: Record<string, boolean>) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, msg, undoPinned}};
  };
  const showToast = (msg: string) => update(toastPatch(msg));

  // MENU LIFECYCLE — one menu at a time; focus in with preventScroll (the
  // amendment: plain .focus() scroll-reveals inside the column); Escape /
  // tap-out close and restore focus to the opener ellipsis.
  const openMenu = (splitId: string, opener: HTMLButtonElement) => {
    const shellEl = shellRef.current;
    if (shellEl == null) return;
    const shellRect = shellEl.getBoundingClientRect();
    const btnRect = opener.getBoundingClientRect();
    let top = btnRect.bottom - shellRect.top + 4;
    if (top + MENU_HEIGHT > shellRect.height - 8) {
      top = btnRect.top - shellRect.top - MENU_HEIGHT - 4;
    }
    update({menu: {splitId, top}});
  };
  const closeMenu = useCallback(
    (restoreFocus: boolean) => {
      setState(prev => {
        if (prev.menu != null && restoreFocus) {
          const opener = ellipsisRefs.current[prev.menu.splitId];
          // Restore after the state flush removes the menu.
          setTimeout(() => opener?.focus({preventScroll: true}), 0);
        }
        return {...prev, menu: null};
      });
    },
    [],
  );
  useEffect(() => {
    if (state.menu != null) {
      menuRef.current?.querySelector('button')?.focus({preventScroll: true});
    }
  }, [state.menu]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeMenu]);

  // MENU ACTIONS — pin executes immediately and offers Undo
  // (undo-over-confirm); Undo restores the EXACT prior pinned map.
  const menuSplit = state.menu != null ? SPLITS.find(s => s.id === state.menu?.splitId) ?? null : null;
  const jumpFromMenu = (split: Split) => {
    setCursor(split.jumpM);
    closeMenu(true);
  };
  const copyFromMenu = (split: Split) => {
    update(toastPatch(\`\${split.name} time copied — \${split.timeLabel}\`));
    closeMenu(true);
  };
  const togglePin = (split: Split) => {
    const prevPinned = state.pinned;
    const nowPinned = !prevPinned[split.id];
    toastSeqRef.current += 1;
    update({
      pinned: {...prevPinned, [split.id]: nowPinned},
      toast: {
        seq: toastSeqRef.current,
        msg: nowPinned ? \`\${split.name} pinned\` : TOAST_PIN_REMOVED,
        undoPinned: prevPinned,
      },
    });
    closeMenu(true);
  };
  const undoToast = () => {
    const undoPinned = state.toast?.undoPinned;
    if (undoPinned == null) return;
    update({pinned: undoPinned, ...toastPatch(TOAST_RESTORED)});
  };

  // Readout derivations — one source (readingAt) feeds chip + slider text.
  const reading = readingAt(state.cursorM);
  const prevM = state.cursorM % 1000 === 0 ? state.cursorM - 1000 : Math.floor(state.cursorM / 1000) * 1000;
  const nextM = Math.floor(state.cursorM / 1000) * 1000 + 1000;
  const atStart = state.cursorM === 0;
  const atEnd = state.cursorM === TOTAL_M;
  const activeIdx = activeSplitIndex(state.cursorM);
  const registerEllipsis = useCallback((splitId: string, el: HTMLButtonElement | null) => {
    ellipsisRefs.current[splitId] = el;
  }, []);

  const chipLine1 = narrowChip
    ? \`\${reading.distLabel} · \${reading.paceLabel} · \${reading.elevLabel}\`
    : \`\${reading.distLabel} · \${reading.paceLabel} · \${reading.elevLabel} · \${reading.hrLabel}\`;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{PACELIGHT_CSS}</style>
      <div ref={shellRef} style={{...styles.shell, ...(isDesktopColumn ? styles.shellDesktop : null)}}>
        {/* NAV BAR — 52px sticky z20; hairline always on (noted). */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <button
              type="button"
              className="plr-btn plr-focusable"
              style={styles.backBtn}
              aria-label="Back to Activity"
              onClick={() => showToast(TOAST_BACK)}>
              <Icon icon={ChevronLeftIcon} size="lg" color="inherit" />
              <span style={styles.backLabel}>Activity</span>
            </button>
          </div>
          <div style={styles.navCenter}>
            <PacelightMark />
            <h1 style={styles.navTitle}>
              <span aria-hidden>{RUN.title}</span>
              {/* Accessible name = the full route title (stress fixture 4). */}
              <span className="plr-vh">{\`\${RUN.title} — \${RUN.route}\`}</span>
            </h1>
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="plr-btn plr-focusable"
              style={styles.iconBtn}
              aria-label="Share run"
              onClick={() => showToast(TOAST_LINK)}>
              <Icon icon={Share2Icon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        <main style={styles.main}>
          {/* Meta line — fixed string; wraps cleanly at 320px. */}
          <p style={styles.metaLine}>
            {RUN.dateLabel} · {RUN.route}
          </p>

          {/* ROUTE HERO — the scrubber. */}
          <PaceRouteRibbon cursorM={state.cursorM} heroWidth={heroWidth} heroRef={heroRef} onCursor={setCursor} />

          {/* READOUT ROW — the visible non-gesture cursor path. */}
          <div style={styles.readoutRow}>
            <button
              type="button"
              className="plr-btn plr-focusable"
              style={{...styles.chevBtn, ...(atStart ? styles.chevBtnDisabled : null)}}
              aria-label="Previous kilometer mark"
              disabled={atStart}
              onClick={() => setCursor(prevM)}>
              <Icon icon={ChevronLeftIcon} size="lg" color="inherit" />
            </button>
            <div style={styles.chip}>
              <span style={styles.chipLine}>{chipLine1}</span>
              {narrowChip ? <span style={styles.chipLine2}>{reading.hrLabel}</span> : null}
            </div>
            <button
              type="button"
              className="plr-btn plr-focusable"
              style={{...styles.chevBtn, ...(atEnd ? styles.chevBtnDisabled : null)}}
              aria-label="Next kilometer mark"
              disabled={atEnd}
              onClick={() => setCursor(nextM)}>
              <Icon icon={ChevronRightIcon} size="lg" color="inherit" />
            </button>
          </div>

          {/* STAT GRID — full-tile cursor buttons. */}
          <div style={styles.statGrid}>
            {STAT_TILES.map(tile => (
              <button
                key={tile.id}
                type="button"
                className="plr-btn plr-focusable"
                style={styles.statTile}
                aria-label={tile.aria}
                onClick={() => setCursor(tile.targetM)}>
                <span style={styles.statLabel}>{tile.label}</span>
                <span style={styles.statValueRow}>
                  <span style={styles.statValue}>{tile.value}</span>
                  {tile.unit != null ? <span style={styles.statUnit}>{tile.unit}</span> : null}
                </span>
              </button>
            ))}
          </div>
          <p style={styles.hrCaption}>
            Avg HR {AVG_HR} bpm · Max {MAX_HR} bpm
          </p>

          {/* SPLITS */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeader}>Splits</h2>
            <span style={styles.sectionCaption}>vs {fmtMinSec(AVG_PACE_SEC)} avg</span>
          </div>
          <div style={styles.listCard}>
            {SPLITS.map((split, index) => (
              <div key={split.id}>
                {index > 0 ? <div style={styles.rowDivider} /> : null}
                <SplitLadderRow
                  split={split}
                  active={index === activeIdx}
                  pinned={state.pinned[split.id] === true}
                  halfZone={halfZone}
                  zoneRef={index === 0 ? zoneRef : undefined}
                  onJump={setCursor}
                  onOpenMenu={openMenu}
                  registerEllipsis={registerEllipsis}
                />
              </div>
            ))}
          </div>

          {/* ELEVATION */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.sectionHeader}>Elevation</h2>
            <span style={styles.sectionCaption}>{Math.round(ELEV_GAIN_M)} m gain · 70 m descent</span>
          </div>
          <ElevationSyncStrip cursorM={state.cursorM} onCursor={setCursor} />
        </main>

        {/* ANCHORED SPLIT MENU — the only overlay (z30, backdrop z29). */}
        {state.menu != null && menuSplit != null ? (
          <>
            <div style={backdropStyle} onPointerDown={() => closeMenu(true)} aria-hidden />
            <div ref={menuRef} role="menu" aria-label={\`\${menuSplit.name} options\`} style={{...styles.menu, top: state.menu.top}}>
              <button type="button" role="menuitem" className="plr-btn plr-focusable" style={styles.menuRow} onClick={() => jumpFromMenu(menuSplit)}>
                <Icon icon={LocateIcon} size="md" color="inherit" />
                <span style={styles.menuRowText}>Jump to this split</span>
              </button>
              <div style={styles.menuDivider} />
              <button type="button" role="menuitem" className="plr-btn plr-focusable" style={styles.menuRow} onClick={() => copyFromMenu(menuSplit)}>
                <Icon icon={CopyIcon} size="md" color="inherit" />
                <span style={styles.menuRowText}>Copy split time</span>
              </button>
              <div style={styles.menuDivider} />
              <button type="button" role="menuitem" className="plr-btn plr-focusable" style={styles.menuRow} onClick={() => togglePin(menuSplit)}>
                <Icon icon={state.pinned[menuSplit.id] === true ? PinOffIcon : PinIcon} size="md" color="inherit" />
                <span style={styles.menuRowText}>{state.pinned[menuSplit.id] === true ? 'Unpin split' : 'Pin split'}</span>
              </button>
            </div>
          </>
        ) : null}

        {/* TOAST DOCK — sticky-in-flow, ONE polite live region, no
            auto-dismiss timers: the next mutation replaces the toast. */}
        <div style={styles.toastAnchor} aria-live="polite">
          {state.toast != null ? (
            <div key={state.toast.seq} style={styles.toast}>
              <span style={styles.toastMsg}>{state.toast.msg}</span>
              {state.toast.undoPinned != null ? (
                <>
                  <span style={styles.toastRule} aria-hidden />
                  <button type="button" className="plr-btn plr-focusable" style={styles.undoBtn} onClick={undoToast}>
                    Undo
                  </button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
`;export{e as default};