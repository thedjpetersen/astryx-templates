var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Marquee public profile of Noa
 *   Merritt (@noamerritt), stop-motion animator at Halfmoon Miniatures,
 *   frozen mid-July: 248 posts · 12,438 followers · 186 following (the
 *   followers figure derives from the follow state — 12,439 while
 *   following, never hand-typed twice), 12 post cards (7 photo + 3 note +
 *   2 clip = 12 ✓), 8 clip tiles with fixed durations/views, and a 4-row
 *   About sheet. No Date.now(), no Math.random(), no network media (cover
 *   and post art = hue-gradient tiles + monograms); every time label is a
 *   fixed string ('Jul 11', 'March 2021').
 * @output Marquee — Collapsing Profile Header: a 390px MOBILE creator
 *   profile driven entirely by scroll position (one rAF-throttled scroll
 *   listener on the page scroller; transforms/opacity only). A 220px
 *   hue-gradient cover parallaxes at 0.4× scroll (its oversized inner
 *   layer translates down as the page scrolls, net 0.6× speed) and scales
 *   up on overscroll pull-down (scale 1 + −y/240, origin top). The 88px
 *   avatar is position:sticky top:10 with an interpolated transform —
 *   scale eases 1 → 32/88 over the 218px travel (52 navBar + 220 cover −
 *   44 overlap − 10 seat), so it shrinks continuously and lands as a 32px
 *   chip in the navBar leading slot at exactly the moment sticky engages.
 *   The 28px hero display name and the 17px navBar title are two elements
 *   CROSSFADED on scroll thresholds (hero fades out over y∈[120,184],
 *   nav title fades in over y∈[168,218]). The stats row (Posts /
 *   Followers / Following, tabular-nums) pins at top:52 (z16, under the
 *   navBar) then fades as the tab row approaches; the segmented tab row
 *   (Posts / Clips / About) docks at top:52 (z18) and its hairline +
 *   shadow fade in ONLY once docked (measured, not assumed). Tab switches
 *   swap the panel with a directional slide (±28px enter keyframe chosen
 *   by tab-index delta) over a sliding 2px ink underline. The Follow
 *   button morphs to 'Following ✓' with a width transition (104 → 148)
 *   plus an SVG check draw-on (stroke-dashoffset), increments the
 *   followers stat, and posts a toast; Share posts 'Profile link copied'.
 * @position Page template; emitted by \`astryx template mobile-collapsing-profile-header\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome — the 52px sticky
 *   navBar at y=0 is the first pixel). No sheets on this surface, so the
 *   shell never scroll-locks; position:fixed is banned throughout (the
 *   collapse choreography is sticky + transform, never fixed). ONE polite
 *   toast dock: a zero-height sticky bottom:0 wrapper at the end of flow
 *   with the aria-live region absolute at bottom:16 (no tabBar here); one
 *   toast at a time — a new toast REPLACES the old.
 * Animation contract: transform/opacity only (plus SVG stroke-dashoffset
 *   for the Follow check), with ONE sanctioned exception noted here per
 *   the spec: the Follow button's 104→148 WIDTH transition — a tiny
 *   control morph in the spirit of the live-activity capsule exception,
 *   never a layout-affecting container. Scroll-driven values (cover
 *   parallax/scale, avatar scale, name crossfade) are inline styles with
 *   NO transition — the scroll position is the animation timeline;
 *   discrete changes (tab ink slide, panel enter, docked hairline, toast
 *   entry, check draw-on) use CSS transitions/keyframes in the CPH_CSS
 *   constant (unique \`cph-\` prefix; decelerate cubic-bezier(0.22,1,0.36,1),
 *   overshoot cubic-bezier(0.34,1.56,0.64,1) on the width morph). Reduced
 *   motion (matchMedia read once in a useEffect with a change listener):
 *   NO parallax/interpolation — the cover sits still, the avatar stays in
 *   the hero (a 24px mini avatar crossfades into the navBar title
 *   instead), the name/stats/hairline swap at thresholds through the
 *   .cph-fade opacity transition ONLY (that class deliberately survives
 *   the reduced-motion CSS kill — it IS the reduced pathway), panel
 *   slides/ink/width-morph/toast-entry are removed entirely.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT = light-dark(#C2255C, #FAA2C1) — white glyphs on #C2255C
 *   ≈ 5.7:1; near-black #2B0A18 on #FAA2C1 ≈ 9.8:1; as a bare 2px ink /
 *   check fill: #C2255C on the white body ≈ 5.7:1 and #FAA2C1 on the
 *   ~#1C1C1E dark card ≈ 9.0:1 — all clear the ≥3:1 bar. Cover / avatar /
 *   post art are fixed hue gradients (white monogram on 45%/26%-lightness
 *   stops ≈ 4.6:1+ in both schemes — poster art, not chrome); the clip
 *   duration chip sits on an art-anchored scrim (math at the literal).
 *   Never var(--color-text).
 * Density grid (MOBILE): 16px screen inset · 12px card gaps · 24px
 *   section gaps · 8px chip gaps; navBar 52px sticky top z20 (grid
 *   '1fr auto 1fr', paddingInline 8, always-on hairline, blur surface);
 *   sticky ladder — navBar z20 · docking avatar z21 (it may overlap the
 *   navBar surface while landing) · tab row 48px sticky top:52 z18 ·
 *   stats row 56px sticky top:52 z16 (pins UNDER the tabs, fades, goes
 *   pointer-inert); inset-grouped post cards (12px radius, 1px border,
 *   120px art + body); 44px Follow/Message/Share/toast targets — every
 *   touch target ≥44×44. TYPE (--font-family-body): 28/700 hero name ·
 *   17/600 nav title · 17/700 stat values · 16/400 body floor · 13/400
 *   meta · 11/500 eyebrows + chips; tabular-nums on every count.
 *
 * Responsive contract:
 * - Fluid 320-430: the hero column, stats thirds, and tab thirds are
 *   flex with minWidth 0 — name/bio/post titles ellipsize or wrap, the
 *   stat values never do; the avatar's sticky travel is built only from
 *   fixed heights (52 + 220 − 44 − 10) so it is width-independent.
 *   overflowX:'clip' backstop.
 * - Container >560px (useElementWidth ResizeObserver on the wrapper —
 *   the demo's inline desktop stage is ~1045px wide inside a 1440px
 *   window, so only container width can tell the stages apart): the
 *   shell renders as a centered 430px phone column with borderInline
 *   hairlines on a var(--color-background-muted) backdrop — never a
 *   stretched relayout. The real 390px demo iframe stays fluid.
 * - Scroll ownership: the demo's stage owns the page scroll, so all
 *   measurements read the nearest scrollable ancestor (getScroller) and
 *   derive y from the shell's own rect — sticky and math share one
 *   coordinate system in both stages.
 */

import {useEffect, useRef, useState} from 'react';
import type {CSSProperties, RefObject} from 'react';

import {
  BadgeCheckIcon,
  CalendarIcon,
  ClapperboardIcon,
  LinkIcon,
  MapPinIcon,
  PlayIcon,
  Share2Icon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each with contrast math.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Marquee rose). White glyphs on #C2255C ≈
// 5.7:1; near-black #2B0A18 on #FAA2C1 ≈ 9.8:1. As a bare fill (tab ink,
// check stroke, verified badge): #C2255C on the white body ≈ 5.7:1 and
// #FAA2C1 on the ~#1C1C1E dark card ≈ 9.0:1 — all ≥3:1.
const BRAND_ACCENT = 'light-dark(#C2255C, #FAA2C1)';
// Text over a BRAND_ACCENT fill (math above).
const BRAND_FILL_TEXT = 'light-dark(#FFFFFF, #2B0A18)';
// Cover art — a fixed indigo→rose gradient (same literal in both schemes;
// it reads as cover PHOTOGRAPHY, not chrome). White 11px chip text rides
// its own scrim below, never the raw gradient.
const COVER_GRADIENT = 'linear-gradient(160deg, hsl(258 50% 40%), hsl(324 55% 30%))';
// Avatar tile — white 'NM' monogram on 40%/26%-lightness teal stops ≈
// 4.7:1+ (identical both schemes; poster art).
const AVATAR_GRADIENT = 'linear-gradient(135deg, hsl(174 45% 36%), hsl(214 55% 26%))';
// Art-anchored scrim for the cover chip / clip play seat / duration chip:
// white 11px/600 text over (art ⊕ 55% near-black) — the brightest art stop
// is 50%-lightness, so the composite luminance stays ≤ 0.11 and white
// clears ≈ 6.5:1 everywhere it appears. Same literal both schemes (it
// belongs to the art, not the chrome).
const ART_SCRIM = 'rgba(15, 10, 16, 0.55)';
const ART_TEXT = '#FFFFFF';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, the discrete-motion
// classes, and the reduced-motion kill. NOTE: .cph-fade is deliberately
// EXCLUDED from the kill — threshold opacity crossfades are the sanctioned
// reduced-motion pathway for this surface.
// ---------------------------------------------------------------------------

const CPH_CSS = \`
.cph-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.cph-btn:disabled { cursor: default; }
.cph-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.cph-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.cph-fade { transition: opacity 200ms ease; }
.cph-tabInk { transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1); }
.cph-followBtn { transition: width 260ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.cph-check { transition: stroke-dashoffset 320ms cubic-bezier(0.22, 1, 0.36, 1) 120ms; }
@keyframes cph-from-right {
  from { transform: translateX(28px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
@keyframes cph-from-left {
  from { transform: translateX(-28px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.cph-from-right { animation: cph-from-right 240ms cubic-bezier(0.22, 1, 0.36, 1); }
.cph-from-left { animation: cph-from-left 240ms cubic-bezier(0.22, 1, 0.36, 1); }
@keyframes cph-toast-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.cph-toast-in { animation: cph-toast-in 200ms cubic-bezier(0.22, 1, 0.36, 1); }
@media (prefers-reduced-motion: reduce) {
  .cph-tabInk, .cph-followBtn, .cph-check { transition: none; }
  .cph-from-right, .cph-from-left, .cph-toast-in { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// GEOMETRY CONSTANTS — the collapse math, all width-independent.
// ---------------------------------------------------------------------------

const NAV_H = 52;
const COVER_H = 220;
const AVATAR_SIZE = 88;
const AVATAR_MINI = 32;
const AVATAR_OVERLAP = 44; // the avatar sits half over the cover's bottom edge
const AVATAR_SEAT_TOP = 10; // sticky seat: (52 − 32) / 2 = 10 → centered in the navBar
// Rest flow top = 52 + 220 − 44 = 228; sticky engages at viewport 10 →
// travel = 218px. The scale interpolation completes at exactly this y.
const AVATAR_TRAVEL = NAV_H + COVER_H - AVATAR_OVERLAP - AVATAR_SEAT_TOP;
const HERO_FADE_START = 120; // hero name opacity 1 → 0 over [120, 184]
const HERO_FADE_RANGE = 64;
const NAV_FADE_START = 168; // nav title opacity 0 → 1 over [168, 218]
const NAV_FADE_RANGE = AVATAR_TRAVEL - NAV_FADE_START;
const STATS_FADE_RANGE = 56; // stats fade over the tabs' final 56px approach
const PARALLAX_RATE = 0.4;
const OVERSCROLL_SCALE_DIVISOR = 240;
const Y_CLAMP_MIN = -160; // overscroll cap → cover scale ≤ 1.67
const Y_CLAMP_MAX = 280; // past every interpolation → deep scroll is re-render-free
const FOLLOW_WIDTH = 104;
const FOLLOWING_WIDTH = 148;

// ---------------------------------------------------------------------------
// STYLES
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
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // NAV BAR — 52px sticky top z20; always-on hairline + blur surface.
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    height: NAV_H,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start', minWidth: 44},
  navTrailing: {display: 'flex', justifyContent: 'flex-end', minWidth: 44},
  // The nav title is the aria-hidden CROSSFADE TARGET of the hero name —
  // the hero h1 stays the one accessible name.
  navCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
    maxWidth: 210,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  navMiniAvatar: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    background: AVATAR_GRADIENT,
    color: ART_TEXT,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // COVER — 220px clip box; the oversized inner layer carries parallax
  // translate (scroll > 0) or overscroll scale (scroll < 0).
  coverBox: {height: COVER_H, position: 'relative', overflow: 'hidden'},
  coverInner: {
    position: 'absolute',
    insetInline: 0,
    top: -96, // oversized headroom — the 0.4× translate never exposes a gap
    height: COVER_H + 96,
    background: COVER_GRADIENT,
    transformOrigin: '50% 0',
    willChange: 'transform',
  },
  coverChip: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    borderRadius: 999,
    background: ART_SCRIM,
    color: ART_TEXT,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  // AVATAR — sticky top:10 z21; scale interpolates 1 → 32/88 over the
  // 218px travel so it LANDS as a 32px navBar chip the moment it pins.
  avatar: {
    position: 'sticky',
    top: AVATAR_SEAT_TOP,
    zIndex: 21,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginTop: -AVATAR_OVERLAP,
    marginLeft: 16,
    borderRadius: '50%',
    border: '3px solid var(--color-background-body)',
    background: AVATAR_GRADIENT,
    display: 'grid',
    placeItems: 'center',
    color: ART_TEXT,
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '0.02em',
    transformOrigin: 'left top',
    willChange: 'transform',
  },
  avatarStaticReduced: {position: 'relative', top: 'auto', zIndex: 1},
  heroBlock: {paddingInline: 16},
  nameRow: {display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, minWidth: 0},
  heroName: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  verifiedSeat: {color: BRAND_ACCENT, display: 'inline-flex', flexShrink: 0},
  handle: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    marginTop: 2,
    fontVariantNumeric: 'tabular-nums',
  },
  bio: {fontSize: 16, lineHeight: 1.45, margin: '8px 0 0'},
  followRow: {display: 'flex', alignItems: 'center', gap: 12, marginTop: 12},
  // Follow — the sanctioned width morph (104 → 148) + check draw-on.
  followBtn: {
    height: 44,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_FILL_TEXT,
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    flexShrink: 0,
  },
  followBtnOn: {
    background: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  },
  messageBtn: {
    height: 44,
    paddingInline: 20,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    whiteSpace: 'nowrap',
  },
  // STATS — 56px, sticky top:52 z16 (pins UNDER the navBar, then fades as
  // the tab row approaches; pointer-inert once invisible).
  statsBar: {
    position: 'sticky',
    top: NAV_H,
    zIndex: 16,
    height: 56,
    display: 'flex',
    alignItems: 'stretch',
    marginTop: 16,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  statCell: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 17,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  statHairline: {width: 1, marginBlock: 12, background: 'var(--color-border)'},
  // TABS — 48px, sticky top:52 z18; hairline + shadow only once docked.
  tabsBar: {
    position: 'sticky',
    top: NAV_H,
    zIndex: 18,
    height: 48,
    display: 'flex',
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  tabBtn: {
    flex: 1,
    minWidth: 0,
    height: 48,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  tabBtnActive: {color: BRAND_ACCENT, fontWeight: 600},
  tabInk: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 'calc(100% / 3)',
    height: 2,
    borderRadius: 1,
    background: BRAND_ACCENT,
  },
  tabsEdge: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    height: 1,
    background: 'var(--color-border)',
    boxShadow: '0 4px 12px var(--color-shadow)',
    pointerEvents: 'none',
  },
  // PANELS — minHeight keeps the docked tabs stable on the short tabs.
  panel: {paddingTop: 16, minHeight: 760},
  postCard: {
    marginInline: 16,
    marginBottom: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  postArt: {
    height: 120,
    display: 'grid',
    placeItems: 'center',
    color: ART_TEXT,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  postBody: {display: 'flex', flexDirection: 'column', gap: 6, padding: 12},
  postKindRow: {display: 'flex', alignItems: 'center', gap: 8},
  postKind: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    padding: '2px 8px',
    whiteSpace: 'nowrap',
  },
  postDate: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  postTitle: {fontSize: 16, fontWeight: 500, lineHeight: 1.3, margin: 0},
  postMeta: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  clipsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginInline: 16,
  },
  clipTile: {
    position: 'relative',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
  },
  playSeat: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: ART_SCRIM,
    color: ART_TEXT,
    display: 'grid',
    placeItems: 'center',
  },
  durChip: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 6,
    borderRadius: 6,
    background: ART_SCRIM,
    color: ART_TEXT,
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  clipCaption: {display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6},
  clipTitle: {
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  clipViews: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  aboutCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
  aboutRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingInline: 16,
  },
  aboutIcon: {color: 'var(--color-text-secondary)', display: 'inline-flex', flexShrink: 0},
  aboutLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  aboutValue: {
    fontSize: 16,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  aboutLink: {color: BRAND_ACCENT, fontWeight: 500},
  rowDivider: {height: 1, background: 'var(--color-border)', marginInlineStart: 16},
  aboutPara: {
    marginInline: 16,
    marginTop: 12,
    padding: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    fontSize: 16,
    lineHeight: 1.5,
  },
  sectionHeader: {
    margin: '0 0 8px',
    paddingInline: 32,
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // TOAST DOCK — the single polite live region at the end of flow.
  dockWrap: {position: 'sticky', bottom: 0, zIndex: 25},
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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  toastHairline: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastDismiss: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--color-text-secondary)',
  },
  spacer24: {height: 24},
};

// ---------------------------------------------------------------------------
// ============= DATA =============
// Deterministic fixtures — Noa Merritt's Marquee profile, frozen mid-July.
// 12 posts (7 photo + 3 note + 2 clip = 12 ✓) · 8 clips · 4 About rows.
// ---------------------------------------------------------------------------

const CREATOR_NAME = 'Noa Merritt';
const CREATOR_HANDLE = '@noamerritt';
const CREATOR_MONO = 'NM';
const CREATOR_BIO =
  'Stop-motion animator at Halfmoon Miniatures. 24 frames of patience per second. New short film this fall.';
const POSTS_COUNT = '248';
const FOLLOWING_COUNT = '186';
// Followers derive from the follow state — 12,438 base, 12,439 following.
const FOLLOWERS_BASE = '12,438';
const FOLLOWERS_FOLLOWED = '12,439';

type PostKind = 'Photo' | 'Note' | 'Clip';

interface PostFixture {
  id: string;
  title: string;
  kind: PostKind;
  date: string;
  meta: string; // likes · comments, fixed strings
  hue: number;
  mono: string;
}

const POSTS: PostFixture[] = [
  {id: 'p1', title: 'Armature rig v3 — the brass knees finally hold', kind: 'Photo', date: 'Jul 11', meta: '1,204 likes · 86 comments', hue: 18, mono: 'AR'},
  {id: 'p2', title: 'Set build week: the diner gets its neon', kind: 'Photo', date: 'Jul 9', meta: '2,318 likes · 141 comments', hue: 288, mono: 'SB'},
  {id: 'p3', title: '24 frames of rain, one bottle of glycerin', kind: 'Clip', date: 'Jul 8', meta: '3,102 likes · 197 comments', hue: 204, mono: 'RN'},
  {id: 'p4', title: 'Why I light miniatures with desk lamps', kind: 'Note', date: 'Jul 6', meta: '987 likes · 64 comments', hue: 44, mono: 'DL'},
  {id: 'p5', title: 'Foam latex bake #212 — two survivors', kind: 'Photo', date: 'Jul 5', meta: '1,570 likes · 92 comments', hue: 96, mono: 'FL'},
  {id: 'p6', title: 'The mailbox scene, frame by frame', kind: 'Clip', date: 'Jul 2', meta: '4,051 likes · 233 comments', hue: 332, mono: 'MB'},
  {id: 'p7', title: 'Silicone vs. clay for hero hands', kind: 'Note', date: 'Jun 29', meta: '1,126 likes · 148 comments', hue: 168, mono: 'HH'},
  {id: 'p8', title: 'Storyboards for the rooftop finale', kind: 'Photo', date: 'Jun 26', meta: '1,893 likes · 77 comments', hue: 252, mono: 'RF'},
  {id: 'p9', title: 'Replacing 300 paper leaves by hand', kind: 'Photo', date: 'Jun 23', meta: '2,764 likes · 168 comments', hue: 76, mono: 'PL'},
  {id: 'p10', title: 'How the wobble got fixed (tie-downs)', kind: 'Note', date: 'Jun 19', meta: '845 likes · 59 comments', hue: 12, mono: 'TD'},
  {id: 'p11', title: 'Camera move test on the crane rig', kind: 'Photo', date: 'Jun 16', meta: '1,412 likes · 71 comments', hue: 140, mono: 'CR'},
  {id: 'p12', title: 'Studio tour: the puppet hospital drawer', kind: 'Photo', date: 'Jun 12', meta: '3,388 likes · 216 comments', hue: 312, mono: 'PH'},
];

interface ClipFixture {
  id: string;
  title: string;
  duration: string;
  views: string;
  hue: number;
}

const CLIPS: ClipFixture[] = [
  {id: 'c1', title: 'Rain on the diner window', duration: '0:24', views: '48.2K views', hue: 204},
  {id: 'c2', title: 'Mailbox scene — final cut', duration: '1:12', views: '112K views', hue: 332},
  {id: 'c3', title: 'Walk cycle, 12 vs 24 fps', duration: '0:41', views: '36.9K views', hue: 96},
  {id: 'c4', title: 'Neon sign flicker test', duration: '0:18', views: '21.4K views', hue: 288},
  {id: 'c5', title: 'Crane rig move, take 9', duration: '0:52', views: '64.7K views', hue: 140},
  {id: 'c6', title: 'Puppet blink mechanism', duration: '0:33', views: '92.1K views', hue: 18},
  {id: 'c7', title: 'Miniature fog with dry ice', duration: '0:47', views: '27.8K views', hue: 252},
  {id: 'c8', title: 'Leaf-by-leaf autumn pass', duration: '1:05', views: '58.3K views', hue: 76},
];

// Post / clip art from the fixture's fixed hue — white monogram on
// 45%/26%-lightness stops ≈ 4.6:1+ in both schemes (poster art).
function artGradient(hue: number): string {
  return \`linear-gradient(135deg, hsl(\${hue} 45% 40%), hsl(\${(hue + 40) % 360} 55% 26%))\`;
}

type TabId = 'posts' | 'clips' | 'about';

const TAB_ORDER: TabId[] = ['posts', 'clips', 'about'];
const TAB_LABEL: Record<TabId, string> = {posts: 'Posts', clips: 'Clips', about: 'About'};

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
 * so the collapse math reads scroll position against it, not the shell. */
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

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

// ---------------------------------------------------------------------------
// TEMPLATE
// ---------------------------------------------------------------------------

interface ScrollSnapshot {
  y: number; // shell scroll offset, clamped to [-160, 280] (negative = overscroll)
  statsOpacity: number; // 1 in flow → 0 as the tabs dock over the pinned stats
  tabsDocked: boolean; // tabs pinned at top:52 → hairline + shadow on
}

interface ToastState {
  seq: number;
  text: string;
}

export default function MobileCollapsingProfileHeaderTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth > 560 : isWideViewport;

  // Reduced motion — read via matchMedia in an effect (with a change
  // listener) per the animation contract; gates ALL interpolation in JS.
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // ---- Scroll snapshot ------------------------------------------------------
  const shellRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const [snap, setSnap] = useState<ScrollSnapshot>({y: 0, statsOpacity: 1, tabsDocked: false});

  useEffect(() => {
    const shell = shellRef.current;
    if (shell == null) {
      return undefined;
    }
    const scroller = getScroller(shell);
    const isDocument = scroller == null || scroller === document.scrollingElement;
    const target: EventTarget = isDocument ? window : (scroller as HTMLElement);
    let frame = 0;

    const measure = () => {
      frame = 0;
      // One shared coordinate system for sticky + math: the scroller's
      // viewport top is the origin (0 for the document scroller).
      const originTop =
        isDocument || scroller == null ? 0 : scroller.getBoundingClientRect().top;
      const rawY = originTop - shell.getBoundingClientRect().top;
      // Clamp past every interpolation range so deep scrolling below the
      // header is re-render-free.
      const y = Math.round(Math.max(Y_CLAMP_MIN, Math.min(Y_CLAMP_MAX, rawY)));

      let tabsDocked = false;
      let statsOpacity = 1;
      const tabsEl = tabsRef.current;
      const statsEl = statsRef.current;
      if (tabsEl != null) {
        const tabsTop = tabsEl.getBoundingClientRect().top - originTop;
        tabsDocked = tabsTop <= NAV_H + 0.5;
        if (statsEl != null) {
          const statsTop = statsEl.getBoundingClientRect().top - originTop;
          const statsPinned = statsTop <= NAV_H + 0.5;
          if (statsPinned) {
            // Pinned under the navBar: fade out over the tabs' approach.
            statsOpacity = clamp01((tabsTop - NAV_H) / STATS_FADE_RANGE);
          }
        }
      }
      statsOpacity = Math.round(statsOpacity * 50) / 50;

      setSnap(previous =>
        previous.y === y &&
        previous.statsOpacity === statsOpacity &&
        previous.tabsDocked === tabsDocked
          ? previous
          : {y, statsOpacity, tabsDocked},
      );
    };

    const onScroll = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(measure);
      }
    };
    measure();
    target.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      target.removeEventListener('scroll', onScroll);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  // ---- Profile state --------------------------------------------------------
  const [activeTab, setActiveTab] = useState<TabId>('posts');
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastSeqRef = useRef(0);

  const postToast = (text: string) => {
    toastSeqRef.current += 1;
    setToast({seq: toastSeqRef.current, text}); // replaces any prior toast
  };

  const selectTab = (next: TabId) => {
    if (next === activeTab) {
      return;
    }
    setSlideDir(TAB_ORDER.indexOf(next) > TAB_ORDER.indexOf(activeTab) ? 'right' : 'left');
    setActiveTab(next);
  };

  const toggleFollow = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    postToast(next ? \`Following \${CREATOR_NAME}\` : \`Unfollowed \${CREATOR_NAME}\`);
  };

  // ---- Derived interpolations (the scroll position IS the timeline) --------
  const {y, statsOpacity, tabsDocked} = snap;
  const avatarProgress = clamp01(y / AVATAR_TRAVEL);
  const avatarScale = 1 - avatarProgress * (1 - AVATAR_MINI / AVATAR_SIZE);
  const heroNameOpacity = 1 - clamp01((y - HERO_FADE_START) / HERO_FADE_RANGE);
  const navTitleOpacity = clamp01((y - NAV_FADE_START) / NAV_FADE_RANGE);
  // Reduced motion: threshold swaps through the .cph-fade crossfade only.
  const navTitleOn = y >= NAV_FADE_START;

  const coverTransform = reducedMotion
    ? undefined
    : y >= 0
      ? \`translate3d(0, \${(y * PARALLAX_RATE).toFixed(1)}px, 0)\`
      : \`scale(\${(1 + -y / OVERSCROLL_SCALE_DIVISOR).toFixed(3)})\`;

  const followersLabel = isFollowing ? FOLLOWERS_FOLLOWED : FOLLOWERS_BASE;
  const activeIndex = TAB_ORDER.indexOf(activeTab);
  const panelClass =
    slideDir == null || reducedMotion
      ? undefined
      : slideDir === 'right'
        ? 'cph-from-right'
        : 'cph-from-left';

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };
  const wrapStyle: CSSProperties = {
    ...styles.wrap,
    ...(isDesktopColumn ? {background: 'var(--color-background-muted)'} : null),
  };

  return (
    <div ref={wrapRef} style={wrapStyle}>
      <style>{CPH_CSS}</style>
      <div ref={shellRef} style={shellStyle}>
        {/* NAV BAR — the collapse landing zone */}
        <header style={styles.navBar}>
          <div style={styles.navLeading}>
            {/* The sticky avatar lands here at scale 32/88; the slot stays
                empty in flow so nothing collides with the touchdown. */}
          </div>
          <div
            className={reducedMotion ? 'cph-fade' : undefined}
            style={{
              ...styles.navCenter,
              opacity: reducedMotion ? (navTitleOn ? 1 : 0) : navTitleOpacity,
            }}
            aria-hidden>
            {reducedMotion ? (
              <span style={styles.navMiniAvatar}>{CREATOR_MONO}</span>
            ) : null}
            <span style={styles.navTitle}>{CREATOR_NAME}</span>
          </div>
          <div style={styles.navTrailing}>
            <button
              type="button"
              className="cph-btn cph-focusable"
              style={styles.iconBtn}
              aria-label="Share profile"
              onClick={() => postToast('Profile link copied')}>
              <Icon icon={Share2Icon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* COVER — parallax at 0.4×, scale on overscroll pull-down */}
        <div style={styles.coverBox} aria-hidden>
          <div style={{...styles.coverInner, transform: coverTransform}} />
          <span style={styles.coverChip}>New short this fall</span>
        </div>

        {/* AVATAR — sticky seat + interpolated shrink into the navBar */}
        <div
          style={{
            ...styles.avatar,
            ...(reducedMotion ? styles.avatarStaticReduced : null),
            transform: reducedMotion ? undefined : \`scale(\${avatarScale.toFixed(4)})\`,
          }}
          aria-hidden>
          {CREATOR_MONO}
        </div>

        {/* HERO — name crossfades against the navBar title */}
        <div style={styles.heroBlock}>
          <div
            style={{
              ...styles.nameRow,
              opacity: reducedMotion ? 1 : heroNameOpacity,
            }}>
            <h1 style={styles.heroName}>{CREATOR_NAME}</h1>
            <span style={styles.verifiedSeat} title="Verified creator">
              <Icon icon={BadgeCheckIcon} size="md" color="inherit" />
              <span className="cph-vh">Verified creator</span>
            </span>
          </div>
          <div style={styles.handle}>{CREATOR_HANDLE}</div>
          <p style={styles.bio}>{CREATOR_BIO}</p>
          <div style={styles.followRow}>
            <button
              type="button"
              className="cph-btn cph-focusable cph-followBtn"
              style={{
                ...styles.followBtn,
                ...(isFollowing ? styles.followBtnOn : null),
                width: isFollowing ? FOLLOWING_WIDTH : FOLLOW_WIDTH,
              }}
              aria-pressed={isFollowing}
              onClick={toggleFollow}>
              {isFollowing ? (
                <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden>
                  <polyline
                    className="cph-check"
                    points="2.5,7.5 5.5,10.5 11.5,3.5"
                    fill="none"
                    stroke={BRAND_ACCENT}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={16}
                    strokeDashoffset={0}
                  />
                </svg>
              ) : null}
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button
              type="button"
              className="cph-btn cph-focusable"
              style={styles.messageBtn}
              onClick={() => {}}>
              Message
            </button>
          </div>
        </div>

        {/* STATS — pins under the navBar, fades as the tabs dock over it */}
        <div
          ref={statsRef}
          className={reducedMotion ? 'cph-fade' : undefined}
          style={{
            ...styles.statsBar,
            opacity: reducedMotion ? (tabsDocked ? 0 : 1) : statsOpacity,
            pointerEvents: statsOpacity < 0.05 || (reducedMotion && tabsDocked) ? 'none' : undefined,
          }}>
          <div style={styles.statCell}>
            <span style={styles.statValue}>{POSTS_COUNT}</span>
            <span style={styles.statLabel}>Posts</span>
          </div>
          <div style={styles.statHairline} aria-hidden />
          <div style={styles.statCell}>
            <span style={styles.statValue}>{followersLabel}</span>
            <span style={styles.statLabel}>Followers</span>
          </div>
          <div style={styles.statHairline} aria-hidden />
          <div style={styles.statCell}>
            <span style={styles.statValue}>{FOLLOWING_COUNT}</span>
            <span style={styles.statLabel}>Following</span>
          </div>
        </div>

        {/* TABS — dock at top:52; hairline + shadow only once docked */}
        <div ref={tabsRef} style={styles.tabsBar} role="tablist" aria-label="Profile sections">
          {TAB_ORDER.map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              id={\`cph-tab-\${tab}\`}
              aria-selected={activeTab === tab}
              aria-controls={\`cph-panel-\${tab}\`}
              className="cph-btn cph-focusable"
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab ? styles.tabBtnActive : null),
              }}
              onClick={() => selectTab(tab)}>
              {TAB_LABEL[tab]}
            </button>
          ))}
          <span
            className="cph-tabInk"
            style={{...styles.tabInk, transform: \`translateX(\${activeIndex * 100}%)\`}}
            aria-hidden
          />
          <span
            className="cph-fade"
            style={{...styles.tabsEdge, opacity: tabsDocked ? 1 : 0}}
            aria-hidden
          />
        </div>

        {/* PANEL — directional slide by tab-index delta */}
        <div
          key={activeTab}
          id={\`cph-panel-\${activeTab}\`}
          role="tabpanel"
          aria-labelledby={\`cph-tab-\${activeTab}\`}
          className={panelClass}
          style={styles.panel}>
          {activeTab === 'posts' ? (
            <>
              {POSTS.map(post => (
                <article key={post.id} style={styles.postCard}>
                  <div style={{...styles.postArt, background: artGradient(post.hue)}} aria-hidden>
                    {post.mono}
                  </div>
                  <div style={styles.postBody}>
                    <div style={styles.postKindRow}>
                      <span style={styles.postKind}>{post.kind}</span>
                      <span style={styles.postDate}>{post.date}</span>
                    </div>
                    <h2 style={styles.postTitle}>{post.title}</h2>
                    <div style={styles.postMeta}>{post.meta}</div>
                  </div>
                </article>
              ))}
            </>
          ) : activeTab === 'clips' ? (
            <div style={styles.clipsGrid}>
              {CLIPS.map(clip => (
                <div key={clip.id}>
                  <div style={{...styles.clipTile, background: artGradient(clip.hue)}} aria-hidden>
                    <span style={styles.playSeat}>
                      <Icon icon={PlayIcon} size="sm" color="inherit" />
                    </span>
                    <span style={styles.durChip}>{clip.duration}</span>
                  </div>
                  <div style={styles.clipCaption}>
                    <span style={styles.clipTitle}>{clip.title}</span>
                    <span style={styles.clipViews}>
                      {clip.views} · {clip.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <h3 style={styles.sectionHeader}>Details</h3>
              <div style={styles.aboutCard}>
                <div style={styles.aboutRow}>
                  <span style={styles.aboutIcon}>
                    <Icon icon={ClapperboardIcon} size="sm" color="inherit" />
                  </span>
                  <span style={styles.aboutLabel}>Studio</span>
                  <span style={styles.aboutValue}>Halfmoon Miniatures</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.aboutRow}>
                  <span style={styles.aboutIcon}>
                    <Icon icon={MapPinIcon} size="sm" color="inherit" />
                  </span>
                  <span style={styles.aboutLabel}>Based in</span>
                  <span style={styles.aboutValue}>Portland, OR</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.aboutRow}>
                  <span style={styles.aboutIcon}>
                    <Icon icon={CalendarIcon} size="sm" color="inherit" />
                  </span>
                  <span style={styles.aboutLabel}>Joined</span>
                  <span style={styles.aboutValue}>March 2021</span>
                </div>
                <div style={styles.rowDivider} />
                <div style={styles.aboutRow}>
                  <span style={styles.aboutIcon}>
                    <Icon icon={LinkIcon} size="sm" color="inherit" />
                  </span>
                  <span style={styles.aboutLabel}>Link</span>
                  <span style={{...styles.aboutValue, ...styles.aboutLink}}>halfmoon.studio</span>
                </div>
              </div>
              <p style={styles.aboutPara}>
                Building a 22-minute stop-motion short about a night-shift
                mail carrier and the town that only exists after dark. Sets,
                puppets, and 4,800 paper leaves — all by hand, all on camera.
              </p>
            </>
          )}
          <div style={styles.spacer24} />
        </div>

        {/* TOAST DOCK — the single polite live region; new toast replaces */}
        <div style={styles.dockWrap}>
          <div style={styles.toastRegion} role="status" aria-live="polite">
            {toast != null ? (
              <div
                key={toast.seq}
                className={reducedMotion ? undefined : 'cph-toast-in'}
                style={styles.toast}>
                <span style={styles.toastText}>{toast.text}</span>
                <span style={styles.toastHairline} aria-hidden />
                <button
                  type="button"
                  className="cph-btn cph-focusable"
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
`;export{e as default};