// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Parcelo parcel-updates inbox
 *   frozen mid-morning: 9 seed update rows (5 in motion + 2 delivered + 2
 *   needing attention = 9 ✓) across five invented carriers, plus exactly 3
 *   staged fresh rows that the FIRST refresh prepends (12 total = 8 in
 *   motion + 2 delivered + 2 attention ✓ — the THIS WEEK summary card
 *   derives every count from the live rows array via one kind filter,
 *   never hand-typed). No Date.now(), no Math.random(), no network media
 *   (carrier art = hue-gradient tiles + monograms); every time label is a
 *   fixed string ('8 min ago', 'Yesterday', 'Just now').
 * @output Parcelo — Pull to Refresh Inbox: a 390px MOBILE updates feed
 *   whose centerpiece is pull-to-refresh physics. Pointer-drag down from
 *   rest (the gesture only engages when the page scroller sits at
 *   scrollTop 0, after an 8px slop so row taps stay taps): the content
 *   column translates with rubber-band damping (translate = drag × 0.5,
 *   capped 110px) while a 28px indicator arrow rotates with progress; at
 *   72px the gesture ARMS — the arrow flips to 180°, tints brand, and a
 *   hairline halo pops once. Release below 72px springs the list back;
 *   release past it snaps the list to a 64px holding seat, the arrow
 *   morphs to a spinner (rotation keyframe), and a 1.4s staged timer
 *   completes: refresh #1 prepends 3 new rows (each slides down + fades
 *   from −8px on a 60ms stagger) and posts a '3 new updates' toast;
 *   refresh #2+ posts 'You're all caught up' and settles with an
 *   overshoot bounce. The 44×44 RefreshCw navBar button is the mandatory
 *   button path through the SAME beginRefresh choreography (no drag).
 *   Rows: 48px carrier monogram tile, event title with a status dot,
 *   status line, relative time, unread dot (tapping a row marks it read).
 *   Below: the derived THIS WEEK summary card and a cadence footnote.
 * @position Page template; emitted by `astryx template mobile-pull-refresh-inbox`
 *
 * Frame: MOBILE SHELL CONTRACT — root `shell` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the 52px sticky
 *   navBar at y=0 is the first pixel). No sheets on this surface, so the
 *   shell never scroll-locks; position:fixed is banned throughout. ONE
 *   polite toast dock: a zero-height sticky bottom:0 wrapper at the end of
 *   flow with the aria-live region absolute at bottom:16 (no tabBar here);
 *   one toast at a time — a new toast REPLACES the old.
 * Animation contract: transform/opacity only. The drag drives an inline
 *   translateY with transition:none; releases settle via transition
 *   (decelerate cubic-bezier(0.22,1,0.36,1); the caught-up settle swaps in
 *   the overshoot cubic-bezier(0.34,1.56,0.64,1) for the spec'd bounce),
 *   and transitionend chains settling → idle. Spinner / armed halo /
 *   fresh-row entry / toast entry are keyframes in the PTR_CSS constant
 *   (unique `ptr-` class prefix). Reduced motion (matchMedia read once in
 *   a useEffect with a change listener): NO rubber-band — a drag that
 *   crosses the threshold commits an instant refresh, rows appear
 *   instantly, and spinner/halo/stagger are removed entirely (JS gate
 *   plus a prefers-reduced-motion CSS kill).
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#0B7285, #66D9E8) — white glyphs on #0B7285
 *   ≈ 5.9:1; near-black #062A30 on #66D9E8 ≈ 9.5:1; as a bare 8px dot
 *   fill: #0B7285 on the white card ≈ 5.9:1 and #66D9E8 on the ~#1C1C1E
 *   dark card ≈ 8.9:1 — both clear the ≥3:1 bar. Status dots use the
 *   --color-success/-warning/-error tokens and are never color-alone (the
 *   event title carries the words: 'Delivered', 'Delayed'). Carrier tiles
 *   are id-derived hue gradients (white monogram on 45%/26%-lightness
 *   stops ≈ 4.6:1+ in both schemes — poster art, not chrome). Never
 *   var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px
 *   section gaps · 8px chip gaps; navBar 52px sticky top z20 (grid
 *   '1fr auto 1fr', paddingInline 8, always-on hairline); large-title row
 *   52 (28/700) + 13px derived caption; inset-grouped listCards (12px
 *   radius, 1px border, hairline dividers inset 76 after 48px tiles);
 *   72px update rows · 44px summary rows; touch law: every target ≥44×44
 *   (full-width row buttons, 44×44 navBar refresh, 44×44 toast dismiss).
 *   TYPE (--font-family-body): 28/700 large title · 17/600 nav wordmark ·
 *   16/400 body floor · 13/400 meta · 11/500 eyebrows + indicator hint;
 *   tabular-nums on every count and time column.
 *
 * Responsive contract:
 * - Fluid 320-430: rows are flex with minWidth 0 — title and status line
 *   ellipsize, the time/unread column never shrinks; the pull indicator
 *   centers with insetInline 0 + margin auto. overflowX:'clip' backstop.
 * - Container >560px (useElementWidth ResizeObserver on the wrapper —
 *   the demo's inline desktop stage is ~1045px wide inside a 1440px
 *   window, so only container width can tell the stages apart): the
 *   shell renders as a centered 430px phone column with borderInline
 *   hairlines on a var(--color-background-muted) backdrop — never a
 *   stretched relayout. The real 390px demo iframe stays fluid.
 * - Gesture coexistence: touchAction is 'pan-down' only while the
 *   scroller rests at top (the browser keeps normal downward scrolling;
 *   the pull owns top overscroll) and 'pan-y' otherwise; pointer capture
 *   starts only after the 8px slop, so taps and upward scrolls pass
 *   through untouched.
 */

import {useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  RefObject,
  TransitionEvent as ReactTransitionEvent,
} from 'react';

import {
  ArrowDownIcon,
  LoaderCircleIcon,
  PackageCheckIcon,
  PackageIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  TruckIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Parcelo teal). White glyphs on #0B7285 ≈
// 5.9:1; near-black #062A30 on #66D9E8 ≈ 9.5:1. As a bare dot fill vs
// surfaces: #0B7285 on the white card ≈ 5.9:1 and #66D9E8 on the ~#1C1C1E
// dark card ≈ 8.9:1 — both ≥3:1 for meaningful non-text fills.
const BRAND_ACCENT = 'light-dark(#0B7285, #66D9E8)';
// Brand-tinted wash for the navBar brand seat + armed indicator seat.
const BRAND_TINT_12 = `color-mix(in srgb, ${BRAND_ACCENT} 12%, transparent)`;

// ---------------------------------------------------------------------------
// PULL PHYSICS CONSTANTS — the spec'd numbers, named once.
// ---------------------------------------------------------------------------

const PULL_DAMPING = 0.5; // translate = drag × 0.5 …
const PULL_MAX = 110; // … capped at 110px
const ARM_THRESHOLD = 72; // past this, release commits a refresh
const HOLD_OFFSET = 64; // holding seat while the spinner runs
const HOLD_MS = 1400; // staged refresh duration
const DRAG_SLOP = 8; // px of downward travel before the gesture engages
const STAGGER_MS = 60; // fresh-row entry stagger

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden text,
// and the four keyframes (spinner, armed halo, fresh-row entry, toast
// entry) — transform/opacity only, unique `ptr-` prefix. The
// prefers-reduced-motion block removes every animation outright (the JS
// gate already skips the choreography; this is the belt to its braces).
// ---------------------------------------------------------------------------

const PTR_CSS = `
.ptr-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.ptr-btn:disabled { cursor: default; }
.ptr-focusable:focus-visible {
  outline: 2px solid ${BRAND_ACCENT};
  outline-offset: 2px;
}
.ptr-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@keyframes ptr-spin {
  to { transform: rotate(360deg); }
}
.ptr-spin {
  animation: ptr-spin 900ms linear infinite;
  display: grid;
  place-items: center;
}
@keyframes ptr-halo-pop {
  from { transform: scale(0.55); opacity: 0.9; }
  to { transform: scale(1.3); opacity: 0; }
}
.ptr-halo {
  animation: ptr-halo-pop 380ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes ptr-row-in {
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.ptr-row-in {
  animation: ptr-row-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes ptr-toast-in {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.ptr-toast-in {
  animation: ptr-toast-in 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
@media (prefers-reduced-motion: reduce) {
  .ptr-spin, .ptr-halo, .ptr-row-in, .ptr-toast-in { animation: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  wrap: {width: '100%'},
  // Desktop-stage backdrop behind the centered phone column.
  wrapDesktop: {background: 'var(--color-background-muted)', minHeight: '100dvh'},
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
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 0},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', minWidth: 0},
  navBrandSeat: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
  },
  navBrandGlyph: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'grid',
    placeItems: 'center',
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
    maxWidth: 200,
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
    color: BRAND_ACCENT,
  },
  iconBtnDisabled: {opacity: 0.35},
  // PULL ZONE — relative stage owning the indicator + translating column.
  pullZone: {position: 'relative', flex: 1, display: 'flex', flexDirection: 'column'},
  // Indicator — absolute in the gap the pulled column reveals.
  indicatorZone: {
    position: 'absolute',
    top: 14,
    insetInline: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    pointerEvents: 'none',
  },
  indicatorSeat: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  indicatorSeatArmed: {
    border: `1px solid ${BRAND_ACCENT}`,
    background: BRAND_TINT_12,
    color: BRAND_ACCENT,
  },
  // 28px arrow glyph — rotation driven inline from pull progress.
  indicatorArrow: {
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    transition: 'transform 160ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  // Hairline halo — mounts once when the gesture arms, pops, fades.
  indicatorHalo: {
    position: 'absolute',
    inset: -4,
    borderRadius: '50%',
    border: `1px solid ${BRAND_ACCENT}`,
    pointerEvents: 'none',
  },
  indicatorHint: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // The translating column — opaque so it covers the indicator at rest.
  content: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-body)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  largeTitleRow: {height: 52, display: 'flex', alignItems: 'flex-end', paddingInline: 16},
  largeTitle: {fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1},
  feedCaption: {
    paddingInline: 16,
    marginTop: 4,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Inset-grouped listCard.
  listCard: {
    marginInline: 16,
    marginTop: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 76},
  // 72px update row — tile 48 · text col · time/unread col.
  updateRow: {
    width: '100%',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  carrierTile: {
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
  rowText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 3},
  rowTitleLine: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  statusDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  rowTitle: {
    fontSize: 16,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowDetail: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowTrailing: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  rowTime: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  unreadDot: {width: 8, height: 8, borderRadius: '50%', background: BRAND_ACCENT},
  readDotGhost: {width: 8, height: 8},
  sectionHeader: {
    margin: '24px 0 8px',
    paddingInline: 32,
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  summaryCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  summaryRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
  },
  summaryDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 42},
  summaryIcon: {display: 'inline-flex', flexShrink: 0, color: 'var(--color-text-secondary)'},
  summaryLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  summaryValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  footnote: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: '16px 16px 0',
  },
  spacer24: {height: 24},
  // TOAST DOCK — zero-height sticky wrapper at flow end; the polite live
  // region floats 16px above the viewport bottom (no tabBar here).
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 20},
  toastRegion: {
    position: 'absolute',
    bottom: 16,
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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastDismiss: {
    width: 44,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. The summary card and header caption
// derive from these arrays at render time; no count is hand-typed twice.
// ---------------------------------------------------------------------------

type StatusTone = 'accent' | 'success' | 'warning' | 'error' | 'neutral';
type UpdateKind = 'motion' | 'delivered' | 'attention';

interface UpdateFixture {
  id: string;
  carrier: string;
  mono: string;
  hue: number; // id-derived tile gradient hue — no network media
  title: string; // event line ('Out for delivery')
  detail: string; // item · tracking number
  time: string; // fixed relative label
  tone: StatusTone;
  kind: UpdateKind;
  unread: boolean;
}

// 9 seed rows: 5 motion + 2 delivered + 2 attention = 9 ✓ (the summary
// card filters these by kind, so the cross-check lives in the render).
const BASE_ROWS: UpdateFixture[] = [
  {id: 'b1', carrier: 'Bluejay Express', mono: 'BJ', hue: 210, title: 'Out for delivery', detail: 'Ceramic pour-over set · BJ-482911', time: '8 min ago', tone: 'accent', kind: 'motion', unread: true},
  {id: 'b2', carrier: 'Velo Freight', mono: 'VF', hue: 262, title: 'Arrived at local facility', detail: 'Trail runners, size 10 · VF-775210', time: '32 min ago', tone: 'neutral', kind: 'motion', unread: true},
  {id: 'b3', carrier: 'Nimbus Post', mono: 'NP', hue: 152, title: 'Delivered · front porch', detail: 'Birthday card for June · NP-104428', time: '1 hr ago', tone: 'success', kind: 'delivered', unread: false},
  {id: 'b4', carrier: 'Cardinal Courier', mono: 'CC', hue: 348, title: 'Delivery attempted', detail: 'Standing desk mat · CC-318772', time: '2 hr ago', tone: 'warning', kind: 'attention', unread: true},
  {id: 'b5', carrier: 'Metro Parcel', mono: 'MP', hue: 42, title: 'In transit · Chicago, IL', detail: 'Espresso grinder burrs · MP-902185', time: '5 hr ago', tone: 'neutral', kind: 'motion', unread: false},
  {id: 'b6', carrier: 'Nimbus Post', mono: 'NP', hue: 152, title: 'Customs cleared', detail: 'Linen table runner · NP-661043', time: 'Yesterday', tone: 'neutral', kind: 'motion', unread: false},
  {id: 'b7', carrier: 'Bluejay Express', mono: 'BJ', hue: 210, title: 'Delayed · weather hold', detail: 'Garden trellis kit · BJ-119306', time: 'Yesterday', tone: 'error', kind: 'attention', unread: false},
  {id: 'b8', carrier: 'Velo Freight', mono: 'VF', hue: 262, title: 'Label created', detail: 'Watch strap, 20 mm · VF-833559', time: 'Tue', tone: 'neutral', kind: 'motion', unread: false},
  {id: 'b9', carrier: 'Metro Parcel', mono: 'MP', hue: 42, title: 'Delivered · locker 14', detail: 'Collapsible cat tunnel · MP-556201', time: 'Mon', tone: 'success', kind: 'delivered', unread: false},
];

// The 3 rows the FIRST refresh prepends (the '3 new updates' toast is
// FRESH_ROWS.length, asserted where it posts). 9 + 3 = 12 = 8 motion +
// 2 delivered + 2 attention ✓.
const FRESH_ROWS: UpdateFixture[] = [
  {id: 'f1', carrier: 'Bluejay Express', mono: 'BJ', hue: 210, title: 'Arriving in 3 stops', detail: 'Ceramic pour-over set · BJ-482911', time: 'Just now', tone: 'accent', kind: 'motion', unread: true},
  {id: 'f2', carrier: 'Nimbus Post', mono: 'NP', hue: 152, title: 'Picked up by carrier', detail: 'Framed trail map print · NP-718304', time: 'Just now', tone: 'neutral', kind: 'motion', unread: true},
  {id: 'f3', carrier: 'Cardinal Courier', mono: 'CC', hue: 348, title: 'Rescheduled for tomorrow', detail: 'Standing desk mat · CC-318772', time: 'Just now', tone: 'neutral', kind: 'motion', unread: true},
];

const FRESH_IDS = new Set(FRESH_ROWS.map(row => row.id));

// Status-dot fills — tokens except the ONE brand literal (math at its
// declaration). Neutral rows render no dot (the words carry the state).
const TONE_FILL: Record<Exclude<StatusTone, 'neutral'>, string> = {
  accent: BRAND_ACCENT,
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

// Tile art from the carrier's fixed hue — white monogram on 45%/26%-
// lightness stops ≈ 4.6:1+ in both schemes (poster art, not chrome).
function tileGradient(hue: number): string {
  return `linear-gradient(135deg, hsl(${hue} 45% 40%), hsl(${(hue + 40) % 360} 55% 26%))`;
}

// ---------------------------------------------------------------------------
// SHARED HOOKS + SCROLLER UTILITY
// ---------------------------------------------------------------------------

/** Container-width hook — the demo's desktop stage is ~1045px inside a
 * 1440px window, so only a ResizeObserver on the wrapper can tell the two
 * stages apart (viewport queries lie in the inline stage). */
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

/** Nearest scrollable ancestor — the demo's stage owns the page scroll,
 * so the pull gesture reads scrollTop against it, not the shell. */
function getScroller(element: HTMLElement | null): HTMLElement | null {
  let node = element?.parentElement ?? null;
  while (node != null) {
    const overflowY = window.getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}

// ---------------------------------------------------------------------------
// TEMPLATE
// ---------------------------------------------------------------------------

type PullPhase = 'idle' | 'pulling' | 'holding' | 'settling';

interface ToastState {
  seq: number;
  text: string;
}

export default function MobilePullRefreshInboxTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth > 560 : isWideViewport;

  // Reduced motion — read via matchMedia in an effect (with a change
  // listener) per the animation contract; gates ALL choreography in JS.
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // ---- Feed state ---------------------------------------------------------
  const [rows, setRows] = useState<UpdateFixture[]>(BASE_ROWS);
  const [freshVisible, setFreshVisible] = useState(false); // fresh rows inserted?
  const [lastChecked, setLastChecked] = useState('26 min ago');
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastSeqRef = useRef(0);
  const refreshCountRef = useRef(0);

  // ---- Pull state machine -------------------------------------------------
  const [phase, setPhase] = useState<PullPhase>('idle');
  const [pull, setPull] = useState(0);
  const [springSettle, setSpringSettle] = useState(false); // caught-up bounce
  const armed = phase === 'pulling' && pull >= ARM_THRESHOLD;

  const shellRef = useRef<HTMLDivElement | null>(null);
  const startYRef = useRef<number | null>(null);
  const engagedRef = useRef(false);
  const pullRef = useRef(0); // mirror for release decisions
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [atTop, setAtTop] = useState(true);

  // Track whether the page scroller rests at top — gates the gesture and
  // flips touchAction so normal scrolling never fights the pull.
  useEffect(() => {
    const scroller = getScroller(shellRef.current);
    if (scroller == null) {
      return undefined;
    }
    const isDocument = scroller === document.scrollingElement;
    const target: EventTarget = isDocument ? window : scroller;
    const onScroll = () => setAtTop(scroller.scrollTop <= 0);
    onScroll();
    target.addEventListener('scroll', onScroll, {passive: true});
    return () => target.removeEventListener('scroll', onScroll);
  }, []);

  // Clear the staged refresh timer on unmount.
  useEffect(
    () => () => {
      if (holdTimerRef.current != null) {
        clearTimeout(holdTimerRef.current);
      }
    },
    [],
  );

  const postToast = (text: string) => {
    toastSeqRef.current += 1;
    setToast({seq: toastSeqRef.current, text}); // replaces any prior toast
  };

  /** Shared refresh RESULT — both the gesture and the button path land
   * here. First completion prepends the 3 staged rows; later ones report
   * the caught-up state. */
  const applyRefreshResult = () => {
    const isFirst = refreshCountRef.current === 0;
    refreshCountRef.current += 1;
    if (isFirst) {
      setRows(previous => [...FRESH_ROWS, ...previous]);
      setFreshVisible(true);
      postToast(`${FRESH_ROWS.length} new updates`);
    } else {
      setSpringSettle(true); // settle bounce via the overshoot bezier
      postToast("You're all caught up");
    }
    setLastChecked('just now');
  };

  /** Shared refresh CHOREOGRAPHY — snap to the 64px holding seat, spin
   * for 1.4s, then apply the result and settle. Reduced motion: instant
   * result, no holding phase at all. */
  const beginRefresh = () => {
    if (phase === 'holding' || phase === 'settling') {
      return;
    }
    if (reducedMotion) {
      setPhase('idle');
      setPull(0);
      applyRefreshResult();
      return;
    }
    setPhase('holding');
    setPull(0);
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      applyRefreshResult();
      setPhase('settling');
    }, HOLD_MS);
  };

  // ---- Pointer physics ----------------------------------------------------
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== 'idle') {
      return;
    }
    const scroller = getScroller(shellRef.current);
    if (scroller != null && scroller.scrollTop > 0) {
      return;
    }
    startYRef.current = event.clientY;
    engagedRef.current = false;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const startY = startYRef.current;
    if (startY == null) {
      return;
    }
    const dy = event.clientY - startY;
    if (!engagedRef.current) {
      if (dy < -6) {
        startYRef.current = null; // user is scrolling up — not ours
        return;
      }
      if (dy <= DRAG_SLOP) {
        return; // inside the tap slop
      }
      engagedRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      if (!reducedMotion) {
        setPhase('pulling');
      }
    }
    const damped = Math.min(Math.max(dy - DRAG_SLOP, 0) * PULL_DAMPING, PULL_MAX);
    if (reducedMotion) {
      // No rubber-band: crossing the threshold commits instantly.
      if (damped >= ARM_THRESHOLD) {
        startYRef.current = null;
        engagedRef.current = false;
        applyRefreshResult();
      }
      return;
    }
    pullRef.current = damped;
    setPull(damped);
  };

  const settleBack = () => {
    if (pullRef.current < 1) {
      // Nothing to transition — no transitionend would fire.
      setPhase('idle');
      setPull(0);
      return;
    }
    setPhase('settling');
    setPull(0);
  };

  const handlePointerEnd = () => {
    const wasEngaged = engagedRef.current;
    startYRef.current = null;
    engagedRef.current = false;
    if (!wasEngaged || reducedMotion) {
      return;
    }
    if (pullRef.current >= ARM_THRESHOLD) {
      pullRef.current = 0;
      beginRefresh(); // past the armed threshold — commit
    } else {
      settleBack(); // below threshold — spring back
    }
  };

  // transitionend chains settling → idle (per the animation contract).
  const handleContentTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform' || event.target !== event.currentTarget) {
      return;
    }
    if (phase === 'settling') {
      setPhase('idle');
      setSpringSettle(false);
    }
  };

  const handleRowTap = (id: string) => {
    setRows(previous =>
      previous.map(row => (row.id === id && row.unread ? {...row, unread: false} : row)),
    );
  };

  // ---- Derived counts (never hand-typed) ----------------------------------
  const motionCount = rows.filter(row => row.kind === 'motion').length;
  const deliveredCount = rows.filter(row => row.kind === 'delivered').length;
  const attentionCount = rows.filter(row => row.kind === 'attention').length;
  const unreadCount = rows.filter(row => row.unread).length;

  // ---- Transform + transition for the translating column ------------------
  const contentTransform =
    phase === 'pulling'
      ? `translateY(${pull}px)`
      : phase === 'holding'
        ? `translateY(${HOLD_OFFSET}px)`
        : 'translateY(0px)';
  const contentTransition =
    reducedMotion || phase === 'pulling' || phase === 'idle'
      ? 'none'
      : phase === 'holding'
        ? 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)'
        : springSettle
          ? 'transform 480ms cubic-bezier(0.34, 1.56, 0.64, 1)' // settle bounce
          : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)';

  const indicatorVisible = !reducedMotion && phase !== 'idle';
  const pullProgress = Math.min(pull / ARM_THRESHOLD, 1);
  const indicatorOpacity =
    phase === 'pulling' ? Math.min(pull / 48, 1) : phase === 'holding' ? 1 : 0;
  // Arrow rotates with progress, then FLIPS to 180° once armed.
  const arrowRotation = armed ? 180 : Math.round(pullProgress * 140);

  const busy = phase === 'holding' || phase === 'settling';

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };
  const wrapStyle: CSSProperties = {
    ...styles.wrap,
    ...(isDesktopColumn ? styles.wrapDesktop : null),
  };

  return (
    <div ref={wrapRef} style={wrapStyle}>
      <style>{PTR_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — brand seat · wordmark · 44×44 refresh (button path) */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            <span style={styles.navBrandSeat} aria-hidden>
              <span style={styles.navBrandGlyph}>
                <Icon icon={PackageIcon} size="sm" color="inherit" />
              </span>
            </span>
          </div>
          <h1 style={styles.navTitle}>Parcelo</h1>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="ptr-btn ptr-focusable"
              style={{...styles.iconBtn, ...(busy ? styles.iconBtnDisabled : null)}}
              onClick={beginRefresh}
              disabled={busy}
              aria-label="Refresh updates">
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* PULL ZONE — indicator behind, translating column in front */}
        <div style={styles.pullZone}>
          <div
            style={{
              ...styles.indicatorZone,
              opacity: indicatorOpacity,
              transition: phase === 'pulling' ? 'none' : 'opacity 180ms ease',
            }}
            aria-hidden>
            {indicatorVisible ? (
              <>
                <span
                  style={{
                    ...styles.indicatorSeat,
                    ...(armed || phase === 'holding' ? styles.indicatorSeatArmed : null),
                  }}>
                  {phase === 'holding' ? (
                    <span className="ptr-spin">
                      <Icon icon={LoaderCircleIcon} size="md" color="inherit" />
                    </span>
                  ) : (
                    <span
                      style={{
                        ...styles.indicatorArrow,
                        transform: `rotate(${arrowRotation}deg)`,
                      }}>
                      <Icon icon={ArrowDownIcon} size="md" color="inherit" />
                    </span>
                  )}
                  {armed ? <span className="ptr-halo" style={styles.indicatorHalo} /> : null}
                </span>
                <span style={styles.indicatorHint}>
                  {phase === 'holding'
                    ? 'CHECKING CARRIERS'
                    : armed
                      ? 'RELEASE TO UPDATE'
                      : 'PULL TO UPDATE'}
                </span>
              </>
            ) : null}
          </div>

          <div
            style={{
              ...styles.content,
              transform: contentTransform,
              transition: contentTransition,
              touchAction: atTop && phase !== 'holding' ? 'pan-down' : 'pan-y',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onTransitionEnd={handleContentTransitionEnd}>
            <div style={styles.largeTitleRow}>
              <h2 style={styles.largeTitle}>Updates</h2>
            </div>
            <p style={styles.feedCaption}>
              {rows.length} updates · {unreadCount} unread · checked {lastChecked}
            </p>

            {/* UPDATE ROWS — 72px, tile 48, dividers inset 76 */}
            <div style={styles.listCard}>
              {rows.map((row, index) => {
                const isFresh = freshVisible && FRESH_IDS.has(row.id);
                return (
                  <div
                    key={row.id}
                    className={isFresh && !reducedMotion ? 'ptr-row-in' : undefined}
                    style={
                      isFresh && !reducedMotion
                        ? {animationDelay: `${index * STAGGER_MS}ms`}
                        : undefined
                    }>
                    {index > 0 ? <div style={styles.rowDivider} /> : null}
                    <button
                      type="button"
                      className="ptr-btn ptr-focusable"
                      style={styles.updateRow}
                      onClick={() => handleRowTap(row.id)}>
                      <span
                        style={{...styles.carrierTile, background: tileGradient(row.hue)}}
                        aria-hidden>
                        {row.mono}
                      </span>
                      <span style={styles.rowText}>
                        <span style={styles.rowTitleLine}>
                          {row.tone !== 'neutral' ? (
                            <span
                              style={{...styles.statusDot, background: TONE_FILL[row.tone]}}
                              aria-hidden
                            />
                          ) : null}
                          <span
                            style={{...styles.rowTitle, fontWeight: row.unread ? 600 : 500}}>
                            {row.title}
                          </span>
                        </span>
                        <span style={styles.rowDetail}>
                          {row.detail} · {row.carrier}
                        </span>
                      </span>
                      <span style={styles.rowTrailing}>
                        <span style={styles.rowTime}>{row.time}</span>
                        {row.unread ? (
                          <span style={styles.unreadDot} aria-hidden />
                        ) : (
                          <span style={styles.readDotGhost} aria-hidden />
                        )}
                        {row.unread ? <span className="ptr-vh">Unread</span> : null}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* THIS WEEK — every value derives from the rows array */}
            <h3 style={styles.sectionHeader}>This week</h3>
            <div style={styles.summaryCard}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryIcon}>
                  <Icon icon={TruckIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.summaryLabel}>In motion</span>
                <span style={styles.summaryValue}>{motionCount}</span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}>
                <span style={{...styles.summaryIcon, color: 'var(--color-success)'}}>
                  <Icon icon={PackageCheckIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.summaryLabel}>Delivered</span>
                <span style={styles.summaryValue}>{deliveredCount}</span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}>
                <span style={{...styles.summaryIcon, color: 'var(--color-warning)'}}>
                  <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
                </span>
                <span style={styles.summaryLabel}>Needs attention</span>
                <span style={styles.summaryValue}>{attentionCount}</span>
              </div>
            </div>

            <p style={styles.footnote}>Parcelo checks carriers every 15 minutes.</p>
            <div style={styles.spacer24} />
          </div>
        </div>

        {/* TOAST DOCK — the single polite live region; new toast replaces */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} role="status" aria-live="polite">
            {toast != null ? (
              <div
                key={toast.seq}
                className={reducedMotion ? undefined : 'ptr-toast-in'}
                style={styles.toast}>
                <span style={styles.toastText}>{toast.text}</span>
                <span style={styles.toastHairline} aria-hidden />
                <button
                  type="button"
                  className="ptr-btn ptr-focusable"
                  style={styles.toastDismiss}
                  onClick={() => setToast(null)}
                  aria-label="Dismiss notification">
                  <Icon icon={XIcon} size="sm" color="inherit" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
