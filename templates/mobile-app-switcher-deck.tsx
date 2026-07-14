// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Slate OS switcher frozen with 6
 *   open apps (Ledger $2,418.75 · Waypoint 14 min · Perch 3 unread ·
 *   Pantry 5 recipes · Trellis 6 open · Skylark 72°), each a hue-derived
 *   gradient "screenshot" (translucent chrome bars + monogram watermark —
 *   no network media), last-used labels ('2h ago' … 'Yesterday'), and a
 *   4-tile dock (Ledger / Perch / Waypoint / Trellis). No Date.now(), no
 *   Math.random(); the only timers are choreography (zoom delay 380ms,
 *   banner auto-clear 4s), both cleaned up in effects.
 * @output Slate — App Switcher Deck: a 390px MOBILE app-switcher surface.
 *   NavBar (layer mark · 'Switcher' · '6 open' count chip) over a
 *   horizontal scroll-snap deck of 286×404 app cards (center card scale 1,
 *   neighbors 0.92; each card's screenshot content parallaxes ±12px
 *   AGAINST scrollLeft — driven by onScroll, transform-only). Swiping a
 *   card upward (pointer capture, touchAction:'pan-x' so horizontal snap
 *   stays native) follows the finger with slight rotation and opacity
 *   falloff; past 140px it flies out (decelerate bezier) and the deck
 *   closes the gap with a transform-only shift keyframe; each card's
 *   44×44 ✕ commits through the SAME close path. A dock row of 4 tiles
 *   'opens' apps: the matching card scroll-centers, zooms toward
 *   full-stage (scale 1.24 keyframe), settles back, and a success Banner
 *   'Opened Ledger' drops in. The single polite toast dock posts 'Closed
 *   Waypoint' with an 'Undo close' action that reinserts the card at its
 *   original index (restore pop + reverse gap shift). Closing everything
 *   reveals a 'Nothing open' empty state with a Restore path.
 * @position Page template; emitted by `astryx template mobile-app-switcher-deck`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the navBar at
 *   y=0 is the first pixel). The Banner overlay is position:'absolute'
 *   INSIDE shell (top:60); position:fixed is banned. No bottom sheets on
 *   this surface, so the shell never needs the scroll lock. The toast live
 *   region rides a sticky dockWrap at bottom:0, absolutely seated 12px
 *   above the dock card (calc(100% + 12px)) — the sticky-in-flow dock per
 *   the foundations amendment.
 * Animation contract: transform/opacity ONLY. Gap close/reopen are
 *   translateX keyframes (±298px = card 286 + 12 gap); fly-out and spring
 *   settle are inline-transform transitions chained via transitionend;
 *   dock zoom is a scale keyframe chained via animationend; stagger-free
 *   surface (single-card choreography). Springy = cubic-bezier(0.34, 1.56,
 *   0.64, 1); decelerate = cubic-bezier(0.22, 1, 0.36, 1). Reduced motion
 *   (matchMedia in a useEffect + change listener): no parallax, no scale
 *   falloff, fly-out/settle/zoom become instant state changes, snap stays;
 *   the CSS media block additionally zeroes every keyframe.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#0A66C2, #7CC0FF) — white 13px/600 text on
 *   #0A66C2 ≈ 5.6:1; near-black #06233D on #7CC0FF ≈ 8.2:1; as a bare
 *   fill: #0A66C2 on white ≈ 5.6:1, #7CC0FF on the ~#141414 dark body
 *   ≈ 7.8:1 — all clear the bars. Sanctioned non-brand literals: the
 *   poster-art gradients (hsl 45%/40% → 55%/26% stops; white monograms
 *   ≈ 4.6:1+ in both schemes — screenshot art, not chrome) and the
 *   aria-hidden translucent white chrome bars/watermark inside those
 *   screenshots (decorative, non-text). Never var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px section
 *   gaps · 8px chip gaps; navBar 52px sticky top z20 with hairline; deck
 *   cards 20px radius, 1px border; buttons 44×44 icon minimum. TYPE
 *   (Figtree via --font-family-body): 17/600 nav title · 16/600 card
 *   names · 13/400 meta · 11/500 overlines/dock labels; nothing under
 *   11px; tabular-nums on every count. Touch: every interactive target
 *   ≥44×44; both gestures (swipe-up dismiss, horizontal snap) have
 *   visible button paths (per-card ✕, prev/next chevrons).
 *
 * Responsive contract:
 * - Fluid 320–430: fixed 286px cards with paddingInline calc(50% − 143px)
 *   keep the center card centered at every width (320 − 286 = 34 ⇒ 17px
 *   peek gutters at the floor); card names ellipsize, the count chip and
 *   ago labels never do. overflowX:'clip' backstop on the shell.
 * - Desktop stage (~1045px): useElementWidth on the wrapper (container
 *   width, not viewport — though the demo's phone artboard is a real
 *   390px iframe where media queries DO fire, the inline stage is not);
 *   >560px renders the standard centered 430px phone column on a
 *   var(--color-background-muted) backdrop. No adaptive relayout; the
 *   deck anatomy is deliberately phone geometry.
 */

import {useEffect, useRef, useState} from 'react';
import type {
  AnimationEvent as ReactAnimationEvent,
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  RefObject,
  TransitionEvent as ReactTransitionEvent,
} from 'react';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LayersIcon,
  RotateCcwIcon,
  XIcon,
} from 'lucide-react';

import {Banner} from '@astryxdesign/core/Banner';
import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Slate signal blue). White text on #0A66C2
// ≈ 5.6:1; #06233D dark text on #7CC0FF ≈ 8.2:1. As a bare fill: #0A66C2
// on the white body ≈ 5.6:1; #7CC0FF on the ~#141414 dark body ≈ 7.8:1 —
// all ≥3:1 for rest-state fills and ≥4.5:1 for its text uses.
const BRAND_ACCENT = 'light-dark(#0A66C2, #7CC0FF)';
// Brand-tinted wash for the navBar count chip seat.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;

// ---------------------------------------------------------------------------
// GEOMETRY CONSTANTS — the shift keyframes below hardcode STEP; keep in sync.
// ---------------------------------------------------------------------------

const CARD_W = 286;
const CARD_H = 404;
const GAP = 12;
const STEP = CARD_W + GAP; // 298 — one deck slot
const FLY_THRESHOLD = 140; // px of upward drag that commits a close

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, deck scrollbar hide,
// transform/opacity keyframes only, reduced-motion guard that removes them.
// ---------------------------------------------------------------------------

const ASD_CSS = `
.asd-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.asd-btn:disabled { cursor: default; }
.asd-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.asd-deck { scrollbar-width: none; }
.asd-deck::-webkit-scrollbar { display: none; }
/* Gap close after a card leaves — slots to the right glide left one STEP. */
@keyframes asd-shift-left {
  from { transform: translateX(${STEP}px); }
  to { transform: none; }
}
.asd-shift-left { animation: asd-shift-left 300ms cubic-bezier(0.22, 1, 0.36, 1); }
/* Gap reopen on Undo — slots to the right glide back from one STEP left. */
@keyframes asd-shift-right {
  from { transform: translateX(-${STEP}px); }
  to { transform: none; }
}
.asd-shift-right { animation: asd-shift-right 300ms cubic-bezier(0.22, 1, 0.36, 1); }
/* Restored card pops back into its original slot. */
@keyframes asd-restore {
  from { transform: translateY(14px) scale(0.92); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.asd-restore { animation: asd-restore 320ms cubic-bezier(0.34, 1.56, 0.64, 1); }
/* Dock-open demo: the matching card zooms toward full stage, then settles. */
@keyframes asd-zoom {
  0% { transform: scale(1); }
  42% { transform: scale(1.24) translateY(-10px); }
  58% { transform: scale(1.24) translateY(-10px); }
  100% { transform: scale(1); }
}
.asd-zoom { animation: asd-zoom 720ms cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes asd-banner-in {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.asd-banner-in { animation: asd-banner-in 240ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes asd-toast-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.asd-toast-in { animation: asd-toast-in 200ms cubic-bezier(0.22, 1, 0.36, 1); }
@media (prefers-reduced-motion: reduce) {
  .asd-shift-left, .asd-shift-right, .asd-restore, .asd-zoom,
  .asd-banner-in, .asd-toast-in { animation: none; }
}
`;

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
  // NAV BAR — 52px sticky top z20, always-on hairline.
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', alignItems: 'center', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minWidth: 0},
  navBrandSeat: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // The count chip never ellipsizes; static readout, not a control.
  countChip: {
    height: 28,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    marginInlineEnd: 4,
    borderRadius: 999,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0},
  // Deck zone floats between navBar and dock on tall viewports.
  deckZone: {flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'},
  deckHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '16px 16px 12px',
  },
  eyebrow: {
    margin: 0,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  hint: {margin: 0, fontSize: 13, color: 'var(--color-text-secondary)'},
  // DECK — horizontal scroll-snap; fixed 286px slots, 12px gaps; the
  // paddingInline centers slot 0 at rest at every container width.
  deck: {
    display: 'flex',
    gap: GAP,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    paddingBlock: 12,
    paddingInline: `calc(50% - ${CARD_W / 2}px)`,
  },
  cardSlot: {
    position: 'relative',
    width: CARD_W,
    flexShrink: 0,
    scrollSnapAlign: 'center',
  },
  card: {
    position: 'relative',
    width: '100%',
    height: CARD_H,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 4px 16px var(--color-shadow)',
    touchAction: 'pan-x',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  cardHeader: {
    height: 56,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInlineStart: 12,
    borderBottom: '1px solid var(--color-border)',
  },
  appTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  appName: {
    minWidth: 0,
    flex: 1,
    fontSize: 16,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  agoLabel: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  closeBtn: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // SCREENSHOT — gradient poster art; inner chrome parallaxes ±12px.
  screen: {position: 'relative', flex: 1, overflow: 'hidden'},
  screenInner: {
    position: 'absolute',
    inset: 0,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  screenTopBar: {
    height: 32,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 10,
    borderRadius: 10,
    background: 'rgba(0, 0, 0, 0.18)',
  },
  screenDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.85)',
    flexShrink: 0,
  },
  screenTitle: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  screenStat: {
    fontSize: 22,
    fontWeight: 700,
    color: '#FFFFFF',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  screenTileBlock: {
    height: 72,
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.22)',
  },
  screenBar: {height: 12, borderRadius: 6, background: 'rgba(255, 255, 255, 0.35)'},
  watermark: {
    position: 'absolute',
    right: 8,
    bottom: -14,
    fontSize: 96,
    fontWeight: 800,
    lineHeight: 1,
    color: 'rgba(255, 255, 255, 0.16)',
    pointerEvents: 'none',
  },
  // Pager row — 44×44 chevrons flanking the derived position caption.
  pagerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingInline: 16,
  },
  pagerBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  pagerBtnDisabled: {opacity: 0.35},
  pagerCaption: {
    minWidth: 128,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // EMPTY STATE — all six cards closed.
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
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 16px'},
  emptyAction: {
    height: 44,
    paddingInline: 14,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  // DOCK — sticky-in-flow wrapper; the toast region seats 12px above it.
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 20, marginTop: 24},
  dockSection: {padding: '8px 16px 16px'},
  dockCard: {
    display: 'flex',
    justifyContent: 'space-evenly',
    gap: 8,
    padding: 12,
    borderRadius: 20,
    border: '1px solid var(--color-border)',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  dockTileBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    minWidth: 64,
    paddingBlock: 2,
    borderRadius: 14,
  },
  dockTile: {
    width: 56,
    height: 56,
    borderRadius: 14,
    display: 'grid',
    placeItems: 'center',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  dockLabel: {fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)'},
  // TOAST — the single polite live region, 12px above the dock card.
  toastRegion: {
    position: 'absolute',
    bottom: 'calc(100% + 12px)',
    insetInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    pointerEvents: 'auto',
    minHeight: 48,
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
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
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastAction: {
    height: 48,
    minWidth: 44,
    paddingInline: 14,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  // BANNER OVERLAY — absolute inside shell (never fixed), under the navBar.
  bannerWrap: {position: 'absolute', top: 60, insetInline: 16, zIndex: 25},
};

// ============= DATA =============
// 6 open apps in deck order + a 4-tile dock. Every timestamp is a frozen
// label; every "screenshot" is a hue gradient + translucent chrome rows.

interface SwitcherApp {
  id: string;
  name: string;
  mono: string;
  hue: number; // id-derived art gradient hue — no network media
  ago: string; // frozen last-used label
  screenTitle: string; // microtext inside the fake app chrome
  stat: string; // one bold fixture line inside the screenshot
  hasTileBlock: boolean; // apps with a hero block (map / photo grid)
  bars: number[]; // fake chrome row widths, %
}

const APPS: SwitcherApp[] = [
  {id: 'ledger', name: 'Ledger', mono: 'Lg', hue: 152, ago: '2h ago', screenTitle: 'Overview', stat: '$2,418.75', hasTileBlock: false, bars: [64, 48, 72, 40]},
  {id: 'waypoint', name: 'Waypoint', mono: 'Wp', hue: 210, ago: '12m ago', screenTitle: 'Trip to Northgate', stat: '14 min · 6.2 mi', hasTileBlock: true, bars: [56, 42]},
  {id: 'perch', name: 'Perch', mono: 'Pr', hue: 264, ago: '38m ago', screenTitle: 'Inbox', stat: '3 unread', hasTileBlock: false, bars: [70, 52, 64, 44]},
  {id: 'pantry', name: 'Pantry', mono: 'Pn', hue: 26, ago: '1h ago', screenTitle: 'This week', stat: '5 recipes saved', hasTileBlock: true, bars: [60, 46]},
  {id: 'trellis', name: 'Trellis', mono: 'Tl', hue: 330, ago: '4h ago', screenTitle: 'Today', stat: '6 open · 2 due', hasTileBlock: false, bars: [66, 50, 58, 42]},
  {id: 'skylark', name: 'Skylark', mono: 'Sk', hue: 190, ago: 'Yesterday', screenTitle: 'Home', stat: '72° · Clear', hasTileBlock: false, bars: [48, 62, 38]},
];

const APP_BY_ID: Record<string, SwitcherApp> = Object.fromEntries(
  APPS.map(app => [app.id, app]),
);

const DOCK_IDS = ['ledger', 'perch', 'waypoint', 'trellis'];

// Art gradient from the app's hue — white monograms/microtext on 40%/26%-
// lightness stops ≈ 4.6:1+ in both schemes (poster art, not chrome).
function artGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 45% 40%), hsl(${(hue + 40) % 360} 55% 26%))`;
}

// ---------------------------------------------------------------------------
// SHARED HOOKS
// ---------------------------------------------------------------------------

/** Container-width hook — the desktop stage is ~1045px inside a 1440px
 * window, so only a ResizeObserver on the wrapper can tell the stages
 * apart (viewport queries never fire in the inline stage). */
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

/** MANDATORY reduced-motion read — matchMedia once in an effect, with a
 * change listener; JS-side physics consult this in addition to the CSS
 * media block that zeroes the keyframes. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ---------------------------------------------------------------------------
// BRAND MARK — 28px layered-slates glyph: two token-stroke plates behind a
// BRAND_ACCENT front plate.
// ---------------------------------------------------------------------------

function SlateMark() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="9" y="4" width="14" height="18" rx="3" stroke="var(--color-text-primary)" strokeWidth="1.6" opacity="0.4" />
      <rect x="6.5" y="6.5" width="14" height="18" rx="3" stroke="var(--color-text-primary)" strokeWidth="1.6" opacity="0.7" />
      <rect x="4" y="9" width="14" height="15" rx="3" fill={BRAND_ACCENT} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// STATE MODEL — one drag at a time; every count on screen derives from the
// deck array (count chip, pager caption, dock behavior, empty state).
// ---------------------------------------------------------------------------

interface DragState {
  id: string;
  dy: number; // ≤0 while rising; downward drags are damped to 15%
  phase: 'drag' | 'fly' | 'settle';
}

interface GestureRef {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  engaged: boolean;
}

export default function MobileAppSwitcherDeckTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 560px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth > 560 : isWideViewport;
  const reducedMotion = usePrefersReducedMotion();

  const [deck, setDeck] = useState<string[]>(APPS.map(app => app.id));
  const [scrollLeftPx, setScrollLeftPx] = useState(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  // Gap choreography: slots at deckIndex ≥ fromIndex run the shift keyframe.
  const [shift, setShift] = useState<{seq: number; fromIndex: number; dir: 'left' | 'right'} | null>(null);
  const [restoredId, setRestoredId] = useState<string | null>(null);
  const [zoomingId, setZoomingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{seq: number; name: string} | null>(null);
  const [toast, setToast] = useState<{seq: number; text: string; undoable: boolean} | null>(null);
  const [lastClosed, setLastClosed] = useState<{id: string; index: number} | null>(null);

  const deckRef = useRef<HTMLDivElement | null>(null);
  const gestureRef = useRef<GestureRef | null>(null);
  const seqRef = useRef(0);
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Choreography timer hygiene — clear the pending zoom on unmount.
  useEffect(
    () => () => {
      if (zoomTimerRef.current != null) {
        clearTimeout(zoomTimerRef.current);
      }
    },
    [],
  );

  // Banner auto-clear (choreography timer, cleaned up on change/unmount).
  useEffect(() => {
    if (banner == null) {
      return undefined;
    }
    const timer = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(timer);
  }, [banner]);

  const nextSeq = () => {
    seqRef.current += 1;
    return seqRef.current;
  };

  // DERIVED — center card from scrollLeft (slot i centers at i * STEP).
  const centerIndex =
    deck.length === 0
      ? 0
      : Math.max(0, Math.min(deck.length - 1, Math.round(scrollLeftPx / STEP)));
  const centerApp = deck.length > 0 ? APP_BY_ID[deck[centerIndex]] : null;

  // VERBS ---------------------------------------------------------------

  /** THE close path — swipe fly-out, the 44×44 ✕, everything lands here. */
  const closeCard = (id: string) => {
    const index = deck.indexOf(id);
    if (index < 0) {
      return;
    }
    const app = APP_BY_ID[id];
    const seq = nextSeq();
    setDeck(prev => prev.filter(item => item !== id));
    setLastClosed({id, index});
    if (!reducedMotion && index < deck.length - 1) {
      setShift({seq, fromIndex: index, dir: 'left'});
    }
    setToast({seq, text: `Closed ${app.name}`, undoable: true});
    setDrag(null);
    setRestoredId(null);
  };

  /** Button path for the swipe: runs the SAME fly-out, then closeCard. */
  const closeViaButton = (id: string) => {
    if (reducedMotion) {
      closeCard(id);
      return;
    }
    setDrag({id, dy: -640, phase: 'fly'});
  };

  /** Undo close — reinsert the last-closed card at its original index. */
  const undoClose = () => {
    if (lastClosed == null) {
      return;
    }
    const app = APP_BY_ID[lastClosed.id];
    const seq = nextSeq();
    const at = Math.min(lastClosed.index, deck.length);
    setDeck(prev => {
      const next = [...prev];
      next.splice(Math.min(lastClosed.index, prev.length), 0, lastClosed.id);
      return next;
    });
    if (!reducedMotion) {
      setShift({seq, fromIndex: at + 1, dir: 'right'});
      setRestoredId(lastClosed.id);
    }
    setToast({seq, text: `${app.name} restored`, undoable: false});
    setLastClosed(null);
  };

  /** Dock open — center the matching card, zoom it toward full stage,
   * then Banner. Closed apps just get the Banner (demo affordance). */
  const openFromDock = (id: string) => {
    const app = APP_BY_ID[id];
    const index = deck.indexOf(id);
    if (index < 0 || reducedMotion) {
      if (index >= 0) {
        deckRef.current?.scrollTo({left: index * STEP, behavior: 'auto'});
      }
      setBanner({seq: nextSeq(), name: app.name});
      return;
    }
    deckRef.current?.scrollTo({left: index * STEP, behavior: 'smooth'});
    if (zoomTimerRef.current != null) {
      clearTimeout(zoomTimerRef.current);
    }
    zoomTimerRef.current = setTimeout(() => {
      zoomTimerRef.current = null;
      setZoomingId(id);
    }, 380);
  };

  /** Chevron button path for the horizontal snap gesture. */
  const stepTo = (delta: number) => {
    if (deck.length === 0) {
      return;
    }
    const target = Math.max(0, Math.min(deck.length - 1, centerIndex + delta));
    deckRef.current?.scrollTo({
      left: target * STEP,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  // GESTURE PHYSICS — pointer capture drives an inline transform during
  // the drag; release chains a transition (fly or spring settle) whose
  // transitionend commits the state change. touchAction:'pan-x' keeps the
  // horizontal scroll-snap native.

  const onCardPointerDown = (app: SwitcherApp, event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLElement && event.target.closest('button') != null) {
      return;
    }
    if (drag != null && drag.phase !== 'drag') {
      return; // a fly/settle transition is in flight
    }
    gestureRef.current = {
      id: app.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      engaged: false,
    };
  };

  const onCardPointerMove = (app: SwitcherApp, event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (gesture == null || gesture.id !== app.id || gesture.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (!gesture.engaged) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        gestureRef.current = null; // horizontal intent — native snap wins
        return;
      }
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        gesture.engaged = true;
        event.currentTarget.setPointerCapture(event.pointerId);
      } else {
        return;
      }
    }
    const damped = dy < 0 ? dy : dy * 0.15;
    setDrag({id: app.id, dy: damped, phase: 'drag'});
  };

  const onCardPointerEnd = (app: SwitcherApp) => {
    const gesture = gestureRef.current;
    if (gesture == null || gesture.id !== app.id) {
      return;
    }
    gestureRef.current = null;
    if (!gesture.engaged) {
      return;
    }
    const dy = drag != null && drag.id === app.id ? drag.dy : 0;
    if (-dy > FLY_THRESHOLD) {
      if (reducedMotion) {
        closeCard(app.id); // instant removal, no fly-out
      } else {
        setDrag({id: app.id, dy: -640, phase: 'fly'});
      }
    } else if (reducedMotion) {
      setDrag(null);
    } else {
      setDrag({id: app.id, dy: 0, phase: 'settle'});
    }
  };

  const onCardPointerCancel = (app: SwitcherApp) => {
    if (gestureRef.current?.id === app.id) {
      gestureRef.current = null;
    }
    if (drag?.id === app.id && drag.phase === 'drag') {
      setDrag(null);
    }
  };

  const onCardTransitionEnd = (app: SwitcherApp, event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform' || drag == null || drag.id !== app.id) {
      return;
    }
    if (drag.phase === 'fly') {
      closeCard(app.id);
    } else if (drag.phase === 'settle') {
      setDrag(null);
    }
  };

  const onCardAnimationEnd = (app: SwitcherApp, event: ReactAnimationEvent<HTMLDivElement>) => {
    if (event.animationName === 'asd-zoom' && zoomingId === app.id) {
      setZoomingId(null);
      setBanner({seq: nextSeq(), name: app.name});
    }
  };

  const onSlotAnimationEnd = (event: ReactAnimationEvent<HTMLDivElement>) => {
    if (event.animationName.startsWith('asd-shift')) {
      setShift(null);
    } else if (event.animationName === 'asd-restore') {
      setRestoredId(null);
    }
  };

  // RENDER ---------------------------------------------------------------

  const wrapStyle = isDesktopColumn ? {...styles.wrap, ...styles.wrapDesktop} : styles.wrap;
  const shellStyle = isDesktopColumn ? {...styles.shell, ...styles.shellDesktop} : styles.shell;

  return (
    <div ref={wrapRef} style={wrapStyle}>
      <style>{ASD_CSS}</style>
      <div style={shellStyle}>
        {/* NAV BAR */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.navBrandSeat}>
              <SlateMark />
            </span>
          </div>
          <h1 style={styles.navTitle}>Switcher</h1>
          <div style={styles.navTrailing}>
            <span style={styles.countChip}>{deck.length} open</span>
          </div>
        </header>

        <main style={styles.main}>
          <div style={styles.deckZone}>
            <div style={styles.deckHeader}>
              <p style={styles.eyebrow}>Recent apps</p>
              <p style={styles.hint}>Swipe a card up to close it — every card has a ✕ too.</p>
            </div>

            {deck.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyCircle}>
                  <Icon icon={LayersIcon} size="lg" color="inherit" />
                </span>
                <p style={styles.emptyTitle}>Nothing open</p>
                <p style={styles.emptyBody}>
                  Apps you close land here. Reopen the last one, or launch from the dock below.
                </p>
                {lastClosed != null ? (
                  <button
                    type="button"
                    className="asd-btn asd-focusable"
                    style={styles.emptyAction}
                    onClick={undoClose}>
                    <Icon icon={RotateCcwIcon} size="sm" color="inherit" />
                    Restore {APP_BY_ID[lastClosed.id].name}
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <div
                  ref={deckRef}
                  className="asd-deck"
                  style={styles.deck}
                  role="list"
                  aria-label="Open apps"
                  onScroll={event => setScrollLeftPx(event.currentTarget.scrollLeft)}>
                  {deck.map((id, index) => {
                    const app = APP_BY_ID[id];
                    // Center card scale 1, one slot away 0.92; screenshot
                    // content parallaxes ±12px AGAINST the scroll.
                    const offset = index * STEP - scrollLeftPx;
                    const scale = reducedMotion
                      ? 1
                      : Math.max(0.92, 1 - (Math.min(Math.abs(offset), STEP) / STEP) * 0.08);
                    const parallax = reducedMotion
                      ? 0
                      : Math.max(-12, Math.min(12, (-offset / STEP) * 12));
                    const isDragged = drag != null && drag.id === id;
                    const isZooming = zoomingId === id;

                    let transform = `scale(${scale.toFixed(4)})`;
                    let transition: string | undefined;
                    let opacity: number | undefined;
                    if (isDragged && drag != null) {
                      const rotate = Math.max(-10, Math.min(10, drag.dy * 0.02));
                      transform = `translateY(${drag.dy.toFixed(1)}px) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
                      if (drag.phase === 'drag') {
                        transition = 'none';
                        opacity = Math.max(0.55, 1 + drag.dy / 640);
                      } else if (drag.phase === 'fly') {
                        transition =
                          'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)';
                        opacity = 0;
                      } else {
                        transition = 'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1)';
                      }
                    }

                    const shifted = shift != null && index >= shift.fromIndex;
                    const slotClass =
                      [
                        shifted ? (shift.dir === 'left' ? 'asd-shift-left' : 'asd-shift-right') : '',
                        restoredId === id ? 'asd-restore' : '',
                      ]
                        .join(' ')
                        .trim() || undefined;

                    return (
                      <div
                        key={id}
                        role="listitem"
                        className={slotClass}
                        style={{
                          ...styles.cardSlot,
                          zIndex: isDragged || isZooming ? 5 : undefined,
                        }}
                        onAnimationEnd={onSlotAnimationEnd}>
                        <div
                          role="group"
                          aria-label={`${app.name}, last used ${app.ago}`}
                          className={isZooming ? 'asd-zoom' : undefined}
                          style={{...styles.card, transform, transition, opacity}}
                          onPointerDown={event => onCardPointerDown(app, event)}
                          onPointerMove={event => onCardPointerMove(app, event)}
                          onPointerUp={() => onCardPointerEnd(app)}
                          onPointerCancel={() => onCardPointerCancel(app)}
                          onTransitionEnd={event => onCardTransitionEnd(app, event)}
                          onAnimationEnd={event => onCardAnimationEnd(app, event)}>
                          <div style={styles.cardHeader}>
                            <span style={{...styles.appTile, background: artGradient(app.hue)}} aria-hidden>
                              {app.mono}
                            </span>
                            <span style={styles.appName}>{app.name}</span>
                            <span style={styles.agoLabel}>{app.ago}</span>
                            <button
                              type="button"
                              className="asd-btn asd-focusable"
                              style={styles.closeBtn}
                              aria-label={`Close ${app.name}`}
                              onClick={() => closeViaButton(app.id)}>
                              <Icon icon={XIcon} size="sm" color="inherit" />
                            </button>
                          </div>
                          {/* Fake app screenshot — decorative, parallaxed. */}
                          <div style={{...styles.screen, background: artGradient(app.hue)}} aria-hidden>
                            <div
                              style={{
                                ...styles.screenInner,
                                transform: `translateX(${parallax.toFixed(2)}px)`,
                              }}>
                              <div style={styles.screenTopBar}>
                                <span style={styles.screenDot} />
                                <span style={styles.screenTitle}>{app.screenTitle}</span>
                              </div>
                              <div style={styles.screenStat}>{app.stat}</div>
                              {app.hasTileBlock ? <div style={styles.screenTileBlock} /> : null}
                              {app.bars.map((width, barIndex) => (
                                <div key={barIndex} style={{...styles.screenBar, width: `${width}%`}} />
                              ))}
                              <span style={styles.watermark}>{app.mono}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pager — the visible button path for the snap gesture. */}
                <div style={styles.pagerRow}>
                  <button
                    type="button"
                    className="asd-btn asd-focusable"
                    style={{
                      ...styles.pagerBtn,
                      ...(centerIndex === 0 ? styles.pagerBtnDisabled : null),
                    }}
                    aria-label="Previous app"
                    disabled={centerIndex === 0}
                    onClick={() => stepTo(-1)}>
                    <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
                  </button>
                  <span style={styles.pagerCaption}>
                    {centerIndex + 1} of {deck.length}
                    {centerApp != null ? ` · ${centerApp.name}` : ''}
                  </span>
                  <button
                    type="button"
                    className="asd-btn asd-focusable"
                    style={{
                      ...styles.pagerBtn,
                      ...(centerIndex >= deck.length - 1 ? styles.pagerBtnDisabled : null),
                    }}
                    aria-label="Next app"
                    disabled={centerIndex >= deck.length - 1}
                    onClick={() => stepTo(1)}>
                    <Icon icon={ChevronRightIcon} size="md" color="inherit" />
                  </button>
                </div>
              </>
            )}
          </div>
        </main>

        {/* DOCK + TOAST — sticky-in-flow dock; the single polite toast
            region seats 12px above the dock card. */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} aria-live="polite" role="status">
            {toast != null ? (
              <div key={toast.seq} className="asd-toast-in" style={styles.toast}>
                <span style={styles.toastText}>{toast.text}</span>
                <span style={styles.toastHairline} aria-hidden />
                {toast.undoable && lastClosed != null ? (
                  <button
                    type="button"
                    className="asd-btn asd-focusable"
                    style={styles.toastAction}
                    onClick={undoClose}>
                    Undo close
                  </button>
                ) : (
                  <button
                    type="button"
                    className="asd-btn asd-focusable"
                    style={styles.toastAction}
                    aria-label="Dismiss message"
                    onClick={() => setToast(null)}>
                    <Icon icon={XIcon} size="sm" color="inherit" />
                  </button>
                )}
              </div>
            ) : null}
          </div>
          <div style={styles.dockSection}>
            <nav style={styles.dockCard} aria-label="Dock">
              {DOCK_IDS.map(id => {
                const app = APP_BY_ID[id];
                return (
                  <button
                    key={id}
                    type="button"
                    className="asd-btn asd-focusable"
                    style={styles.dockTileBtn}
                    aria-label={`Open ${app.name}`}
                    onClick={() => openFromDock(id)}>
                    <span style={{...styles.dockTile, background: artGradient(app.hue)}} aria-hidden>
                      {app.mono}
                    </span>
                    <span style={styles.dockLabel}>{app.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* OPEN BANNER — absolute inside shell; auto-clears after 4s. */}
        {banner != null ? (
          <div key={banner.seq} className="asd-banner-in" style={styles.bannerWrap}>
            <Banner
              status="success"
              title={`Opened ${banner.name}`}
              description="Switcher demo — the card settles back into the deck."
              isDismissable
              onDismiss={() => setBanner(null)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
