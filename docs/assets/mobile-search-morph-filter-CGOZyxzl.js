var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the "Fernway" neighborhood guide
 *   frozen on a July 2026 evening: 14 venue rows (name, category, price
 *   tier 1-3, walk minutes, openNow flag + hours label, rooftop flag,
 *   id-derived hue for the gradient tile, monogram). Filter cross-checks
 *   (all derived through ONE matchesVenue predicate, never hand-typed):
 *   Open now → 10 of 14 (closed 4: Meridian Oyster Room, The Brass Kite,
 *   Cardamom House, Anemone; 10+4=14 ✓); ≤ $$ → 11 of 14 ($$$ = Juniper
 *   Rooftop, Meridian, Anemone); Rooftop → 3 of 14 (Juniper Rooftop,
 *   Solstice Terrace, Skylark Deck — all open, so Open now ∧ Rooftop
 *   stays 3); Open now ∧ ≤ $$ → 9. Recent-search chips map to real
 *   matches: 'ramen' → 1, 'rooftop' → 3 (name + category substrings),
 *   'espresso' → 1, 'wine bar' → 1. No Date.now(), no Math.random(),
 *   no network media (art = hue-gradient tiles + monograms).
 * @output Fernway — Search Morph & Filter: a 390px MOBILE places list
 *   whose centerpiece is the navBar search MORPH plus ANIMATED LIST
 *   RE-FLOW. Tapping the 44px search icon expands it into the full-width
 *   field (width transition with the overshoot bezier — see the sanctioned
 *   exception note below) while the brand title fades/slides out and a
 *   Cancel button slides in; a recent-chips row staggers up and the list
 *   dims to suggest the keyboard. Typing live-filters the 14 rows: leaving
 *   rows collapse as absolute ghosts (scaleY + opacity, transform-origin
 *   top) while surviving rows glide to their new slots via a FLIP pass
 *   (getBoundingClientRect before, inverse translateY after, transition to
 *   identity); the match substring in each name draws a tinted underline
 *   (scaleX 0→1). Filter chips (Open now / ≤ $$ / Rooftop) toggle with a
 *   fill transition, re-run the same FLIP re-flow, and pop a count badge
 *   on the navBar filter glyph. Cancel reverses the morph and restores
 *   the list with a gentle per-index stagger; a zero-match query fades in
 *   the shrug empty state. Bookmark buttons per row post the single
 *   polite toast; a \`9 of 14 places\` caption is the aria-live result
 *   announcement. Everything is tap-driven, so every "gesture" IS its own
 *   button path.
 * @position Page template; emitted by \`astryx template mobile-search-morph-filter\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the 52px navBar
 *   at y=0 is the first pixel). All overlays (the search takeover row, the
 *   list dim veil, ghost rows) are position:'absolute' INSIDE shell;
 *   position:fixed is banned. No sheets open here, so the shell never
 *   scroll-locks. The single polite toast dock rides a sticky bottom:16
 *   in-flow wrapper (no tabBar on this screen).
 * Motion policy: transform/opacity only, with ONE sanctioned exception —
 *   the navBar search field animates \`width\` 44px ⇄ calc(100% − 76px)
 *   (the spec's icon-to-field morph; it is a single 40px-tall element
 *   inside the fixed 52px navBar, so no document layout moves with it).
 *   List re-flow is pure FLIP: layout changes apply instantly, then rows
 *   receive inverse translateY transforms that transition to identity on
 *   the decelerate bezier; leaving rows are re-rendered as absolute
 *   ghosts collapsing via scaleY+opacity. prefers-reduced-motion (read
 *   once via matchMedia with a change listener) removes ghosts, FLIP
 *   glides, staggers, and the underline draw entirely — rows swap
 *   instantly and the morph becomes an opacity crossfade.
 * Container policy: inset-grouped mobile listCard (12px radius, 1px
 *   border, hairline dividers via \`.smf-row + .smf-row\`); no desktop
 *   frames, no side asides, no data tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#0F766E, #5EEAD4) — white 13px/600 text on
 *   #0F766E ≈ 5.9:1; near-black #04201C on #5EEAD4 ≈ 12.1:1. As a bare
 *   fill (active chips, underline, count badge): #0F766E on the white
 *   card ≈ 5.9:1 and #5EEAD4 on the ~#1C1C1E dark card ≈ 9.5:1 — both
 *   clear the ≥3:1 bar. Venue tile art is the same id-derived hue
 *   gradient in both schemes (poster art, not chrome) with #FFFFFF
 *   monograms on 45%/26%-lightness stops ≈ 4.6:1+. The list dim veil is
 *   a color-mix over the body token. Never var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px
 *   section gaps · 8px chip gaps; navBar 52px sticky top z20 with
 *   always-on hairline; filterBar 52px sticky top:52 z19 on the same
 *   blur surface; venue rows 72px (48px tile, 12px radius) with hairline
 *   sibling borders (.smf-row + .smf-row); chips 36px visual pill inside a
 *   44px hit button. TYPE (Figtree via --font-family-body): 17/600 nav
 *   title · 16/500 row names · 13/400 meta · 11/500 chip overline;
 *   nothing under 11px; tabular-nums on every count. Touch: every
 *   target ≥44×44 (chip pills ride 44px buttons; bookmark, search,
 *   filter, Cancel, clear-field all ≥44).
 *
 * Responsive contract:
 * - Fluid 320-430: the search field expands to calc(100% − 76px) so the
 *   morph fills any stage (358px at 390); venue names ellipsize, meta
 *   lines ellipsize, the results count never does; recent chips wrap to
 *   a second line below 360. overflowX:'clip' backstop.
 * - Desktop stage (~1045px): useElementWidth on the wrapper (container
 *   width, not viewport — the demo's inline stage never fires viewport
 *   media queries) — >560px renders the standard centered phone column
 *   (maxWidth 430, marginInline auto, borderInline hairline) on a muted
 *   backdrop. No adaptive relayout; the morph is phone geometry.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type {CSSProperties, ReactNode, RefObject} from 'react';

import {
  BookmarkIcon,
  BookmarkCheckIcon,
  CompassIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Fernway teal). White 13px/600 text on
// #0F766E ≈ 5.9:1; #04201C dark text on #5EEAD4 ≈ 12.1:1. As a bare fill
// vs surfaces: #0F766E on the white card ≈ 5.9:1; #5EEAD4 on the ~#1C1C1E
// dark card ≈ 9.5:1 — both clear the ≥3:1 bar for meaningful fills
// (active chips, match underline, badge, open dots).
const BRAND_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
// Text over a BRAND_ACCENT fill (math above).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #04201C)';
// Brand-tinted wash behind the matched substring (the underline carries
// the ≥3:1 signal; the wash is decorative reinforcement).
const BRAND_TINT_14 = \`color-mix(in srgb, \${BRAND_ACCENT} 14%, transparent)\`;
// List dim veil while the search takeover awaits typing — token-derived.
const DIM_VEIL = 'color-mix(in srgb, var(--color-background-body) 62%, transparent)';

// ---------------------------------------------------------------------------
// MOTION CONSTANTS — one motion voice for the whole surface.
// ---------------------------------------------------------------------------

/** Overshoot ease for the icon→field morph and the badge pop. */
const SPRING_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
/** Decelerate ease for FLIP glides, chip staggers, and restores. */
const SETTLE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
/** FLIP glide duration (ms) — cleanup timers ride this + a margin. */
const FLIP_MS = 300;
/** Ghost collapse duration (ms). */
const GHOST_MS = 220;
/** Per-index stagger step (ms) for the Cancel restore. */
const RESTORE_STEP_MS = 36;

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, morph transitions,
// keyframes (transform/opacity only), visually-hidden, reduced-motion
// guard that removes every animation outright.
// ---------------------------------------------------------------------------

const SMF_CSS = \`
.smf-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.smf-btn:disabled { cursor: default; }
.smf-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.smf-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* Icon→field morph — width/right on this one 40px navBar element is THE
   sanctioned exception (header note): closed it sits exactly over the
   search icon seat; open it expands leftward while ceding 64px to Cancel. */
.smf-field {
  transition: width 340ms \${SPRING_EASE}, right 340ms \${SPRING_EASE},
    opacity 160ms ease;
}
.smf-row + .smf-row { border-top: 1px solid var(--color-border); }
.smf-cancel {
  transition: transform 260ms \${SETTLE_EASE}, opacity 180ms ease;
}
.smf-titleblock {
  transition: transform 240ms \${SETTLE_EASE}, opacity 160ms ease;
}
.smf-dim { transition: opacity 220ms ease; }
.smf-chipfill {
  transition: background-color 200ms ease, color 200ms ease,
    border-color 200ms ease;
}
@keyframes smf-chip-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.smf-chip-up { animation: smf-chip-up 260ms \${SETTLE_EASE} both; }
@keyframes smf-ghost-collapse {
  from { transform: scaleY(1); opacity: 1; }
  to { transform: scaleY(0.5); opacity: 0; }
}
.smf-ghost {
  animation: smf-ghost-collapse \${GHOST_MS}ms ease both;
  transform-origin: top center;
  pointer-events: none;
}
@keyframes smf-enter {
  from { transform: translateY(-8px) scaleY(0.94); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.smf-enter {
  animation: smf-enter 240ms \${SETTLE_EASE} both;
  transform-origin: top center;
}
@keyframes smf-underline-draw {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.smf-underline {
  animation: smf-underline-draw 260ms \${SETTLE_EASE} both;
  transform-origin: left center;
}
@keyframes smf-badge-pop {
  0% { transform: scale(0.4); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.smf-badge-pop { animation: smf-badge-pop 300ms \${SPRING_EASE} both; }
@keyframes smf-empty-in {
  from { transform: translateY(6px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.smf-empty-in { animation: smf-empty-in 240ms ease both; }
@keyframes smf-toast-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.smf-toast-in { animation: smf-toast-in 200ms \${SETTLE_EASE} both; }
@media (prefers-reduced-motion: reduce) {
  .smf-field, .smf-cancel, .smf-titleblock, .smf-chipfill {
    transition: opacity 160ms ease;
  }
  .smf-dim { transition: none; }
  .smf-chip-up, .smf-ghost, .smf-enter, .smf-underline,
  .smf-badge-pop, .smf-empty-in, .smf-toast-in {
    animation: none;
  }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  wrapDesktop: {background: 'var(--color-background-muted)'},
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
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20, always-on hairline; hosts the morph.
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: 52,
    flexShrink: 0,
    background:
      'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navInner: {position: 'relative', height: '100%'},
  navBase: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    gap: 0,
  },
  navBaseHidden: {transform: 'translateX(-10px)', opacity: 0, pointerEvents: 'none'},
  brandSeat: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: BRAND_ACCENT,
  },
  navTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  iconBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 10,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // SEARCH TAKEOVER — absolute inside the navBar; field anchored right so
  // it expands leftward out of the icon's seat.
  searchLayer: {
    position: 'absolute',
    insetInline: 16,
    top: 6,
    height: 40,
    zIndex: 2,
    pointerEvents: 'none',
  },
  searchField: {
    position: 'absolute',
    top: 0,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInlineStart: 10,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  searchGlyph: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    font: 'inherit',
    fontSize: 16,
    color: 'var(--color-text-primary)',
  },
  clearBtn: {
    width: 40,
    height: 40,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  cancelBtn: {
    position: 'absolute',
    right: -8,
    top: -2,
    height: 44,
    paddingInline: 8,
    display: 'flex',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  cancelHidden: {transform: 'translateX(16px)', opacity: 0, pointerEvents: 'none'},
  // FILTER BAR — 52px sticky at top:52 z19, same blur surface.
  filterBar: {
    position: 'sticky',
    top: 52,
    zIndex: 19,
    minHeight: 52,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
    background:
      'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  chipBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  chipPill: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  chipPillActive: {
    background: BRAND_ACCENT,
    borderColor: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
  },
  // The results count NEVER ellipsizes; it is the aria-live announcement.
  resultsCount: {
    marginLeft: 'auto',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // RECENT CHIPS — appear while the takeover awaits typing; rides ABOVE
  // the z5 dim veil so the chips stay tappable while the list dims.
  recentRow: {
    position: 'relative',
    zIndex: 6,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px 4px',
  },
  recentLabel: {
    width: '100%',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', position: 'relative'},
  // LIST — inset-grouped card; position:relative so ghosts anchor to it.
  listCard: {
    margin: '12px 16px 24px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
    position: 'relative',
  },
  row: {
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
  },
  tile: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  rowText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2},
  rowName: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  openDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: BRAND_ACCENT,
    flexShrink: 0,
  },
  closedDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    border: '1px solid var(--color-border-emphasized)',
    flexShrink: 0,
  },
  matchSeg: {
    position: 'relative',
    background: BRAND_TINT_14,
    borderRadius: 3,
  },
  matchUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -2,
    height: 2,
    borderRadius: 1,
    background: BRAND_ACCENT,
  },
  bookmarkBtn: {
    width: 44,
    height: 72,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
    marginInlineEnd: 4,
  },
  bookmarkOn: {color: BRAND_ACCENT},
  ghostLayer: {position: 'absolute', insetInline: 0, top: 0},
  ghostRow: {position: 'absolute', insetInline: 0},
  // DIM VEIL — absolute inside main, over the list, under the chips row.
  dimVeil: {
    position: 'absolute',
    inset: 0,
    zIndex: 5,
    background: DIM_VEIL,
    opacity: 0,
    pointerEvents: 'none',
  },
  dimVeilOn: {opacity: 1, pointerEvents: 'auto'},
  // EMPTY STATE — shrug glyph + query echo.
  emptyState: {
    maxWidth: 280,
    marginInline: 'auto',
    paddingBlock: 48,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  emptyShrug: {
    fontSize: 22,
    color: 'var(--color-text-secondary)',
    marginBottom: 8,
    fontVariantNumeric: 'tabular-nums',
  },
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: 0},
  // TOAST — the single polite live region on a sticky in-flow dock.
  dockWrap: {
    position: 'sticky',
    bottom: 16,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    paddingInline: 16,
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'auto',
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
  },
  toastText: {
    fontSize: 13,
    fontWeight: 500,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  toastDismiss: {
    width: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
};

// ---------------------------------------------------------------------------
// ============= DATA =============
// 14 venues; every count on screen derives from matchesVenue. Fixture
// cross-checks live in the header JSDoc.
// ---------------------------------------------------------------------------

interface Venue {
  id: string;
  name: string;
  category: string;
  price: 1 | 2 | 3;
  walkMin: number;
  openNow: boolean;
  hoursLabel: string; // 'Open until 11 PM' / 'Opens 5 PM'
  rooftop: boolean;
  hue: number;
  mono: string;
}

const VENUES: Venue[] = [
  {id: 'copper-fern', name: 'Copper Fern', category: 'Bistro', price: 2, walkMin: 6, openNow: true, hoursLabel: 'Open until 11 PM', rooftop: false, hue: 28, mono: 'CF'},
  {id: 'tanuki', name: 'Tanuki Ramen Annex', category: 'Ramen bar', price: 1, walkMin: 9, openNow: true, hoursLabel: 'Open until 12 AM', rooftop: false, hue: 4, mono: 'TR'},
  {id: 'juniper', name: 'Juniper Rooftop', category: 'Rooftop bar', price: 3, walkMin: 12, openNow: true, hoursLabel: 'Open until 1 AM', rooftop: true, hue: 152, mono: 'JR'},
  {id: 'little-relay', name: 'Little Relay Espresso', category: 'Café', price: 1, walkMin: 3, openNow: true, hoursLabel: 'Open until 9 PM', rooftop: false, hue: 36, mono: 'LR'},
  {id: 'meridian', name: 'Meridian Oyster Room', category: 'Seafood', price: 3, walkMin: 14, openNow: false, hoursLabel: 'Opens 5 PM', rooftop: false, hue: 208, mono: 'MO'},
  {id: 'palomita', name: 'Palomita', category: 'Taqueria', price: 1, walkMin: 7, openNow: true, hoursLabel: 'Open until 10 PM', rooftop: false, hue: 330, mono: 'P'},
  {id: 'brass-kite', name: 'The Brass Kite', category: 'Cocktail lounge', price: 2, walkMin: 10, openNow: false, hoursLabel: 'Opens 6 PM', rooftop: false, hue: 264, mono: 'BK'},
  {id: 'solstice', name: 'Solstice Terrace', category: 'Rooftop café', price: 2, walkMin: 11, openNow: true, hoursLabel: 'Open until 10 PM', rooftop: true, hue: 88, mono: 'ST'},
  {id: 'wren-wheel', name: 'Wren & Wheel', category: 'Gastropub', price: 2, walkMin: 8, openNow: true, hoursLabel: 'Open until 11 PM', rooftop: false, hue: 196, mono: 'WW'},
  {id: 'cardamom', name: 'Cardamom House', category: 'Indian', price: 2, walkMin: 15, openNow: false, hoursLabel: 'Opens 5:30 PM', rooftop: false, hue: 52, mono: 'CH'},
  {id: 'night-heron', name: 'Night Heron', category: 'Wine bar', price: 2, walkMin: 13, openNow: true, hoursLabel: 'Open until 12 AM', rooftop: false, hue: 288, mono: 'NH'},
  {id: 'marigold', name: 'Marigold Diner', category: 'Diner', price: 1, walkMin: 4, openNow: true, hoursLabel: 'Open 24 hours', rooftop: false, hue: 44, mono: 'MD'},
  {id: 'anemone', name: 'Anemone', category: 'Tasting menu', price: 3, walkMin: 16, openNow: false, hoursLabel: 'Opens 6 PM', rooftop: false, hue: 316, mono: 'A'},
  {id: 'skylark', name: 'Skylark Deck', category: 'Rooftop grill', price: 2, walkMin: 18, openNow: true, hoursLabel: 'Open until 11 PM', rooftop: true, hue: 176, mono: 'SD'},
];

const VENUE_BY_ID: Record<string, Venue> = Object.fromEntries(
  VENUES.map(venue => [venue.id, venue]),
);
const ALL_IDS = VENUES.map(venue => venue.id);
const TOTAL_VENUES = VENUES.length; // 14

const RECENT_SEARCHES = ['ramen', 'rooftop', 'espresso', 'wine bar'];

const PRICE_LABELS: Record<number, string> = {1: '$', 2: '$$', 3: '$$$'};

interface FilterState {
  openNow: boolean;
  budget: boolean; // ≤ $$
  rooftop: boolean;
}

const NO_FILTERS: FilterState = {openNow: false, budget: false, rooftop: false};

/** THE predicate — every visible count and row derives from this. */
function matchesVenue(venue: Venue, query: string, filters: FilterState): boolean {
  const q = query.trim().toLowerCase();
  const textHit =
    q === '' ||
    venue.name.toLowerCase().includes(q) ||
    venue.category.toLowerCase().includes(q);
  if (!textHit) {
    return false;
  }
  if (filters.openNow && !venue.openNow) {
    return false;
  }
  if (filters.budget && venue.price > 2) {
    return false;
  }
  if (filters.rooftop && !venue.rooftop) {
    return false;
  }
  return true;
}

function targetIdsFor(query: string, filters: FilterState): string[] {
  return VENUES.filter(venue => matchesVenue(venue, query, filters)).map(
    venue => venue.id,
  );
}

// Art gradient from the venue's id-derived hue — white monogram on
// 45%/26%-lightness stops ≈ 4.6:1+ in both schemes (poster art, not chrome).
function artGradient(hue: number): string {
  return \`linear-gradient(135deg, hsl(\${hue} 45% 40%), hsl(\${(hue + 40) % 360} 55% 26%))\`;
}

// ---------------------------------------------------------------------------
// HOOKS
// ---------------------------------------------------------------------------

/** Container-width measurement (the demo stage never fires viewport MQs). */
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

/** prefers-reduced-motion, read once + change listener (contract). */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ---------------------------------------------------------------------------
// NAME HIGHLIGHT — match substring gets a tinted wash + a drawing underline.
// ---------------------------------------------------------------------------

function highlightName(
  name: string,
  query: string,
  reducedMotion: boolean,
): ReactNode {
  const q = query.trim().toLowerCase();
  if (q === '') {
    return name;
  }
  const index = name.toLowerCase().indexOf(q);
  if (index < 0) {
    return name;
  }
  return (
    <>
      {name.slice(0, index)}
      <span style={styles.matchSeg}>
        {name.slice(index, index + q.length)}
        <span
          aria-hidden="true"
          // Keyed by query so the draw-on replays per keystroke.
          key={q}
          className={reducedMotion ? undefined : 'smf-underline'}
          style={styles.matchUnderline}
        />
      </span>
      {name.slice(index + q.length)}
    </>
  );
}

// ---------------------------------------------------------------------------
// TEMPLATE
// ---------------------------------------------------------------------------

interface Ghost {
  id: string;
  top: number; // px, relative to the listCard
}

interface ToastState {
  seq: number;
  text: string;
}

export default function MobileSearchMorphFilterTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isDesktopStage = wrapWidth > 560;
  const reducedMotion = useReducedMotion();
  const reducedMotionRef = useRef(false);
  reducedMotionRef.current = reducedMotion;

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(NO_FILTERS);
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(['copper-fern', 'night-heron']),
  );
  const [toast, setToast] = useState<ToastState | null>(null);

  // Re-flow state: rows currently in the DOM, collapsing ghosts, entering
  // rows (with optional restore stagger), and a FLIP sequence key.
  const [displayedIds, setDisplayedIds] = useState<string[]>(ALL_IDS);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set());
  const [staggerEntering, setStaggerEntering] = useState(false);
  const [flipSeq, setFlipSeq] = useState(0);

  const displayedRef = useRef<string[]>(ALL_IDS);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchBtnRef = useRef<HTMLButtonElement | null>(null);
  const prevTopsRef = useRef<Map<string, number>>(new Map());
  const timersRef = useRef<number[]>([]);
  const toastTimerRef = useRef<number | null>(null);
  const toastSeqRef = useRef(0);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(id => window.clearTimeout(id));
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const pushTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  // ONE toast at a time; a new toast REPLACES the old (contract).
  const showToast = useCallback((text: string) => {
    toastSeqRef.current += 1;
    setToast({seq: toastSeqRef.current, text});
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  /**
   * THE RE-FLOW — FIRST: measure visual tops of every rendered row (rects,
   * so interrupted glides hand off smoothly). LAST+INVERT+PLAY runs in the
   * layout effect keyed by flipSeq. Leaving rows re-render as absolute
   * ghosts collapsing in place; entering rows animate in (staggered on
   * restore). Reduced motion: swap the arrays, no ghosts, no glides.
   */
  const applyChange = useCallback(
    (nextQuery: string, nextFilters: FilterState, staggerRestore: boolean) => {
      const target = targetIdsFor(nextQuery, nextFilters);
      const current = displayedRef.current;
      if (
        target.length === current.length &&
        target.every((id, index) => id === current[index])
      ) {
        return;
      }
      if (reducedMotionRef.current) {
        displayedRef.current = target;
        setDisplayedIds(target);
        setGhosts([]);
        setEnteringIds(new Set());
        return;
      }
      const listEl = listRef.current;
      const listTop = listEl?.getBoundingClientRect().top ?? 0;
      const prevTops = new Map<string, number>();
      const nextGhosts: Ghost[] = [];
      const targetSet = new Set(target);
      current.forEach(id => {
        const el = rowRefs.current.get(id);
        if (el == null) {
          return;
        }
        const top = el.getBoundingClientRect().top - listTop;
        if (targetSet.has(id)) {
          prevTops.set(id, top);
        } else {
          nextGhosts.push({id, top});
        }
      });
      const currentSet = new Set(current);
      const entering = new Set(target.filter(id => !currentSet.has(id)));
      prevTopsRef.current = prevTops;
      displayedRef.current = target;
      setDisplayedIds(target);
      setGhosts(nextGhosts);
      setEnteringIds(entering);
      setStaggerEntering(staggerRestore);
      setFlipSeq(seq => seq + 1);
      pushTimer(() => setGhosts([]), GHOST_MS + 40);
      pushTimer(() => setEnteringIds(new Set()), FLIP_MS + (staggerRestore ? target.length * RESTORE_STEP_MS : 0) + 80);
    },
    [pushTimer],
  );

  // FLIP: invert survivors from their measured tops, then release to
  // identity on the settle bezier. Transforms only — layout already moved.
  useLayoutEffect(() => {
    if (flipSeq === 0) {
      return;
    }
    const listEl = listRef.current;
    if (listEl == null) {
      return;
    }
    const listTop = listEl.getBoundingClientRect().top;
    const moved: HTMLDivElement[] = [];
    prevTopsRef.current.forEach((prevTop, id) => {
      const el = rowRefs.current.get(id);
      if (el == null) {
        return;
      }
      el.style.transition = 'none';
      el.style.transform = '';
      const newTop = el.getBoundingClientRect().top - listTop;
      const delta = prevTop - newTop;
      if (Math.abs(delta) > 0.5) {
        el.style.transform = \`translateY(\${delta}px)\`;
        moved.push(el);
      }
    });
    if (moved.length > 0) {
      // Force a style flush so the inverse transform paints before playing.
      void listEl.offsetHeight;
      moved.forEach(el => {
        el.style.transition = \`transform \${FLIP_MS}ms \${SETTLE_EASE}\`;
        el.style.transform = '';
      });
      pushTimer(() => {
        moved.forEach(el => {
          el.style.transition = '';
        });
      }, FLIP_MS + 40);
    }
    prevTopsRef.current = new Map();
  }, [flipSeq, pushTimer]);

  // --- Handlers -----------------------------------------------------------

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    // Focus after the morph starts; instant under reduced motion.
    pushTimer(() => inputRef.current?.focus(), reducedMotionRef.current ? 0 : 120);
  }, [pushTimer]);

  const cancelSearch = useCallback(() => {
    setSearchOpen(false);
    if (query.trim() !== '') {
      applyChange('', filters, true);
    }
    setQuery('');
    searchBtnRef.current?.focus();
  }, [applyChange, filters, query]);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      applyChange(value, filters, false);
    },
    [applyChange, filters],
  );

  const handleRecent = useCallback(
    (term: string) => {
      setQuery(term);
      applyChange(term, filters, false);
      inputRef.current?.focus();
    },
    [applyChange, filters],
  );

  const toggleFilter = useCallback(
    (key: keyof FilterState) => {
      const next = {...filters, [key]: !filters[key]};
      setFilters(next);
      applyChange(query, next, false);
    },
    [applyChange, filters, query],
  );

  const toggleSaved = useCallback(
    (venue: Venue) => {
      setSavedIds(prev => {
        const next = new Set(prev);
        if (next.has(venue.id)) {
          next.delete(venue.id);
          showToast(\`Removed \${venue.name} from shortlist\`);
        } else {
          next.add(venue.id);
          showToast(\`Saved \${venue.name} to shortlist\`);
        }
        return next;
      });
    },
    [showToast],
  );

  // --- Derived ------------------------------------------------------------

  const activeFilterCount =
    (filters.openNow ? 1 : 0) + (filters.budget ? 1 : 0) + (filters.rooftop ? 1 : 0);
  const shownCount = displayedIds.length;
  const dimActive = searchOpen && query.trim() === '';
  const trimmedQuery = query.trim();

  const filterChips: Array<{key: keyof FilterState; label: string}> = [
    {key: 'openNow', label: 'Open now'},
    {key: 'budget', label: '≤ $$'},
    {key: 'rooftop', label: 'Rooftop'},
  ];

  const renderRowContent = (venue: Venue, withHighlight: boolean) => (
    <>
      <span aria-hidden="true" style={{...styles.tile, background: artGradient(venue.hue)}}>
        {venue.mono}
      </span>
      <span style={styles.rowText}>
        <span style={styles.rowName}>
          {withHighlight
            ? highlightName(venue.name, trimmedQuery, reducedMotion)
            : venue.name}
        </span>
        <span style={styles.rowMeta}>
          <span
            aria-hidden="true"
            style={venue.openNow ? styles.openDot : styles.closedDot}
          />
          {venue.category} · {PRICE_LABELS[venue.price]} · {venue.walkMin} min ·{' '}
          {venue.hoursLabel}
        </span>
      </span>
    </>
  );

  return (
    <div
      ref={wrapRef}
      style={isDesktopStage ? {...styles.wrap, ...styles.wrapDesktop} : styles.wrap}>
      <style>{SMF_CSS}</style>
      <div
        style={
          isDesktopStage ? {...styles.shell, ...styles.shellDesktop} : styles.shell
        }>
        <h1 className="smf-vh">Fernway — search morph and filter places list</h1>

        {/* NAV BAR — base row crossfades with the search takeover. */}
        <header style={styles.navBar}>
          <div style={styles.navInner}>
            <div
              className="smf-titleblock"
              style={
                searchOpen
                  ? {...styles.navBase, ...styles.navBaseHidden}
                  : styles.navBase
              }
              aria-hidden={searchOpen}>
              <span aria-hidden="true" style={styles.brandSeat}>
                <Icon icon={CompassIcon} size="md" />
              </span>
              <p style={styles.navTitle}>Fernway</p>
              <button
                type="button"
                className="smf-btn smf-focusable"
                style={styles.iconBtn}
                aria-label={
                  activeFilterCount > 0
                    ? \`Filters, \${activeFilterCount} active\`
                    : 'Filters'
                }
                onClick={() => {
                  // Scroll target: the sticky filter bar is always visible;
                  // announce state instead of navigating.
                  showToast(
                    activeFilterCount > 0
                      ? \`\${activeFilterCount} filter\${activeFilterCount === 1 ? '' : 's'} active · \${shownCount} of \${TOTAL_VENUES} places\`
                      : 'No filters active',
                  );
                }}
                tabIndex={searchOpen ? -1 : 0}>
                <Icon icon={SlidersHorizontalIcon} size="sm" />
                {activeFilterCount > 0 ? (
                  <span
                    key={activeFilterCount}
                    className={reducedMotion ? undefined : 'smf-badge-pop'}
                    style={styles.filterBadge}
                    aria-hidden="true">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>
              <button
                ref={searchBtnRef}
                type="button"
                className="smf-btn smf-focusable"
                style={styles.iconBtn}
                aria-label="Search places"
                aria-expanded={searchOpen}
                onClick={openSearch}
                tabIndex={searchOpen ? -1 : 0}>
                <Icon icon={SearchIcon} size="sm" />
              </button>
            </div>

            {/* SEARCH TAKEOVER — field expands right-anchored out of the
                icon seat; Cancel slides in. Width is the sanctioned
                exception (header note). */}
            <div style={styles.searchLayer}>
              <div
                className="smf-field"
                style={{
                  ...styles.searchField,
                  // Closed: a 44px square sitting over the search icon seat.
                  // Open: expands leftward, ceding 64px to Cancel.
                  width: searchOpen ? 'calc(100% - 64px)' : 44,
                  right: searchOpen ? 64 : 0,
                  opacity: searchOpen ? 1 : 0,
                  pointerEvents: searchOpen ? 'auto' : 'none',
                }}>
                <span style={styles.searchGlyph} aria-hidden="true">
                  <Icon icon={SearchIcon} size="sm" />
                </span>
                <input
                  ref={inputRef}
                  className="smf-focusable"
                  style={styles.searchInput}
                  type="text"
                  value={query}
                  placeholder="Search places"
                  aria-label="Search places"
                  onChange={event => handleQueryChange(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Escape') {
                      cancelSearch();
                    }
                  }}
                  tabIndex={searchOpen ? 0 : -1}
                />
                {query !== '' ? (
                  <button
                    type="button"
                    className="smf-btn smf-focusable"
                    style={styles.clearBtn}
                    aria-label="Clear search"
                    onClick={() => handleQueryChange('')}>
                    <Icon icon={XIcon} size="sm" />
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                className="smf-btn smf-focusable smf-cancel"
                style={
                  searchOpen
                    ? // pointer-events is INHERITED — the layer is none, so
                      // the visible Cancel must re-opt-in explicitly.
                      {...styles.cancelBtn, pointerEvents: 'auto'}
                    : {...styles.cancelBtn, ...styles.cancelHidden}
                }
                onClick={cancelSearch}
                tabIndex={searchOpen ? 0 : -1}
                aria-hidden={!searchOpen}>
                Cancel
              </button>
            </div>
          </div>
        </header>

        {/* FILTER BAR — chips re-run the same FLIP re-flow. */}
        <div style={styles.filterBar}>
          {filterChips.map(chip => {
            const active = filters[chip.key];
            return (
              <button
                key={chip.key}
                type="button"
                className="smf-btn smf-focusable"
                style={styles.chipBtn}
                aria-pressed={active}
                onClick={() => toggleFilter(chip.key)}>
                <span
                  className="smf-chipfill"
                  style={
                    active
                      ? {...styles.chipPill, ...styles.chipPillActive}
                      : styles.chipPill
                  }>
                  {chip.label}
                </span>
              </button>
            );
          })}
          <span style={styles.resultsCount} aria-live="polite">
            {shownCount} of {TOTAL_VENUES} places
          </span>
        </div>

        <main style={styles.main}>
          {/* RECENT CHIPS — stagger up while the takeover awaits typing. */}
          {dimActive ? (
            <div style={styles.recentRow}>
              <span style={styles.recentLabel}>Recent</span>
              {RECENT_SEARCHES.map((term, index) => (
                <button
                  key={term}
                  type="button"
                  className={
                    reducedMotion
                      ? 'smf-btn smf-focusable'
                      : 'smf-btn smf-focusable smf-chip-up'
                  }
                  style={{
                    ...styles.chipBtn,
                    animationDelay: reducedMotion ? undefined : \`\${index * 50}ms\`,
                  }}
                  onClick={() => handleRecent(term)}>
                  <span className="smf-chipfill" style={styles.chipPill}>
                    {term}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {/* LIST — FLIP rows + absolute collapsing ghosts. */}
          {shownCount > 0 ? (
            <div ref={listRef} style={styles.listCard}>
              {displayedIds.map((id, index) => {
                const venue = VENUE_BY_ID[id];
                const entering = enteringIds.has(id);
                const saved = savedIds.has(id);
                return (
                  <div
                    key={id}
                    ref={el => {
                      if (el == null) {
                        rowRefs.current.delete(id);
                      } else {
                        rowRefs.current.set(id, el);
                      }
                    }}
                    className={
                      entering && !reducedMotion ? 'smf-row smf-enter' : 'smf-row'
                    }
                    style={{
                      ...styles.row,
                      animationDelay:
                        entering && !reducedMotion && staggerEntering
                          ? \`\${index * RESTORE_STEP_MS}ms\`
                          : undefined,
                    }}>
                    {renderRowContent(venue, true)}
                    <button
                      type="button"
                      className="smf-btn smf-focusable"
                      style={
                        saved
                          ? {...styles.bookmarkBtn, ...styles.bookmarkOn}
                          : styles.bookmarkBtn
                      }
                      aria-pressed={saved}
                      aria-label={
                        saved
                          ? \`Remove \${venue.name} from shortlist\`
                          : \`Save \${venue.name} to shortlist\`
                      }
                      onClick={() => toggleSaved(venue)}>
                      <Icon icon={saved ? BookmarkCheckIcon : BookmarkIcon} size="sm" />
                    </button>
                  </div>
                );
              })}

              {/* GHOSTS — leaving rows collapse in place, out of flow. */}
              {ghosts.length > 0 ? (
                <div style={styles.ghostLayer} aria-hidden="true">
                  {ghosts.map(ghost => {
                    const venue = VENUE_BY_ID[ghost.id];
                    return (
                      <div
                        key={\`ghost-\${ghost.id}\`}
                        className="smf-ghost"
                        style={{...styles.ghostRow, top: ghost.top}}>
                        <div style={styles.row}>{renderRowContent(venue, false)}</div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : (
            <div
              className={reducedMotion ? undefined : 'smf-empty-in'}
              style={styles.emptyState}>
              <span aria-hidden="true" style={styles.emptyShrug}>
                {'¯\\\\_(ツ)_/¯'}
              </span>
              <p style={styles.emptyTitle}>
                No places for &ldquo;{trimmedQuery === '' ? '—' : trimmedQuery}&rdquo;
              </p>
              <p style={styles.emptyBody}>
                Try a shorter search or clear a filter.
              </p>
            </div>
          )}

          {/* DIM VEIL — suggests the keyboard while awaiting typing; a tap
              cancels (the Cancel button is the labeled path). */}
          <div
            className="smf-dim"
            style={
              dimActive ? {...styles.dimVeil, ...styles.dimVeilOn} : styles.dimVeil
            }
            onClick={dimActive ? cancelSearch : undefined}
            aria-hidden="true"
          />
        </main>

        {/* TOAST DOCK — the single polite live region. */}
        <div style={styles.dockWrap} aria-live="polite">
          {toast != null ? (
            <div
              key={toast.seq}
              className={reducedMotion ? undefined : 'smf-toast-in'}
              style={styles.toast}>
              <span style={styles.toastText}>{toast.text}</span>
              <button
                type="button"
                className="smf-btn smf-focusable"
                style={styles.toastDismiss}
                aria-label="Dismiss notification"
                onClick={() => setToast(null)}>
                <Icon icon={XIcon} size="sm" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
`;export{e as default};