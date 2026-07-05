var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kinloop household (Priya,
 *   Marcus, Zoe 9, Theo 6) on Friday, Jun 12, "now" frozen at 1:15 PM
 *   (795 min). Twelve distinct events (23.0 distinct hours, 19 attendance
 *   instances, 28.75 person-hours) including three custody handoffs
 *   (school pickup 3:00 driver Priya, piano dropoff 4:00 driver Priya,
 *   soccer dropoff 4:30 driver Marcus) and one all-family dinner
 *   6:30–7:30. Week counts 6/9/7/12/4/0/8 = 46. No Date.now(), no
 *   Math.random(), no network media.
 * @output Kinloop — Family Day Lanes: a 390px MOBILE family-day
 *   coordinator. Sticky 96px header block = 52px navBar (24px four-loop
 *   knot mark · 'Friday, Jun 12' · RefreshCw) + 44px 7-day DateScrubber
 *   with per-day status dots and an overlapping 4-avatar stack. Body is a
 *   MemberLaneSpine: 44px hour rail (7 AM–9 PM, 14 h × 64px = 896px) with
 *   four flex:1 member micro-lanes, absolute EventChips, lane-spanning
 *   HandoffChip custody capsules, a ConflictBraid on Priya's 3:00
 *   double-book, an 'everyone' dinner band fusing all four lanes, and a
 *   fixed 1:15 PM now-line at top 400px. Signature move: reassigning the
 *   school pickup to Marcus (via the event sheet's 'Reassign to…' action
 *   sheet OR the braid's resolver dot) recomputes the whole day in one
 *   render — braid unbraids (conflicts 1→0), the Jun 12 scrubber dot swaps
 *   red→amber (gaps 0→1), a 5:00–5:45 coverage-gap hatch appears, the
 *   People tab badge shows Marcus's new '2' drive count, the open sheet's
 *   Driver row re-renders, and an Undo toast lands in the sticky dock.
 *   Tabs: Today / Week / People / Settings; two-detent event sheet;
 *   user-reachable skeletons via the navBar refresh; Sun Jun 14 true-empty.
 * @position Page template; emitted by \`astryx template mobile-family-day-lanes\`
 *
 * Frame: MOBILE SHELL CONTRACT — root \`shell\` {position:'relative', flex
 *   column, width:'100%', minHeight:'100dvh', overflowX:'clip'}; the 390px
 *   stage IS the phone viewport (no simulated OS chrome: no status bar,
 *   notch, home indicator, or bezel — the navBar at y=0 is the first
 *   pixel). All overlays (scrim, sheet, action sheet) are
 *   position:'absolute' INSIDE shell; position:fixed is banned. While the
 *   sheet or action sheet is open, shell locks to {height:'100dvh',
 *   overflow:'hidden'} and restores on close; the toast dock is
 *   shell-absolute (insetInline 16, bottom 76, zIndex 42) ONLY during that
 *   lock and renders sticky-in-flow above the tabBar otherwise. Stage
 *   clips to --radius-container; shell paints full-bleed square.
 * Container policy: inset-grouped mobile listCards (12px radius, 1px
 *   border, hairline rowDividers inset 16 / 68 for media rows); the Today
 *   body is the one custom canvas (hour spine + lanes); no desktop Layout
 *   frames, no side asides, no multi-column tables.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT (Kinloop coral). Member lane colors, on-fill label pairs,
 *   and status-dot pairs are sanctioned data literals — every pair carries
 *   its contrast math at the declaration; interactive boundaries and
 *   meaningful rest fills hold ≥3:1 against their ACTUAL surface.
 * Density grid (MOBILE, repeated verbatim): 16px screen gutter · 12px card
 *   gaps · 24px section gaps · 8px chip gaps; navBar 52px sticky top z20
 *   (paddingInline 8, grid '1fr auto 1fr'); DateScrubber 44px (pills 44×44
 *   hit / 36×36 visible r12, 2px gaps so 7×44+6×2+32 = 352 fits 360);
 *   sticky header block 96px total; hour spine 64px/hour (15 min = 16px),
 *   hour rail 44px; lanes flex:1 with 6px gaps ((390−32−44−18)/4 = 74px,
 *   never hardcoded); event chips min 28px visual with invisible 44px min
 *   hits; everyone band 64px; tabBar 64px sticky bottom z20 (24px icon
 *   over 11px/500 label, 4px gap); rows 44px utility / 60px two-line /
 *   72px media (40px avatar, divider inset 68); sectionHeader 13px/600
 *   uppercase 0.06em at 32px, 20px top / 8px bottom; toast 48px min. TYPE
 *   (Figtree via --font-family-body): 28/700 large title (People
 *   'Family') · 17/600 nav+sheet titles · 16/400 rows · 13/400 meta ·
 *   11/500 labels (10/600 tab badge per the chrome contract's stated
 *   badge exception); tabular-nums on every count that renders.
 *
 * Responsive contract:
 * - Fluid 320–430px, zero width literals: hour rail fixed 44px, four
 *   lanes flex:1 (430→84px, 390→74px, 360→66.5px, 320→56.5px). Chip text
 *   is 2-line-clamped 11px/600; when the MEASURED lane region is narrow
 *   (<280px, i.e. stage <~350px) chips drop the time line. HandoffChip
 *   spans, the everyone band, and gap hatches are computed from measured
 *   lane geometry, so they scale with the flex lanes. Scrubber snaps with
 *   a pill peek at 320. overflowX:'clip' is backstop only.
 * - Desktop stage (~1045px): measured via useElementWidth on the wrapper
 *   (container width, not viewport) — at ≥720px the shell renders as the
 *   house-default centered phone column (maxWidth 430, marginInline auto,
 *   borderInline hairline). No adaptive relayout; the lane spine is
 *   deliberately phone geometry.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from 'react';

import {
  CalendarDaysIcon,
  CalendarOffIcon,
  CarIcon,
  Columns3Icon,
  RefreshCwIcon,
  SettingsIcon,
  TriangleAlertIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair with the
// contrast math at the declaration (light card/body ≈ #FFFFFF, dark card ≈
// #1C1C1E / dark body ≈ #131315 for the estimates below).
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Kinloop coral).
// #E8604C vs #FFFFFF ≈ 3.4:1 (≥3:1, legal for the now-line, active-pill
// FILL boundary, and focus ring — non-text); #F2907F vs dark body ≈ 8.1:1.
const BRAND_ACCENT = 'light-dark(#E8604C, #F2907F)';
// Label ON a BRAND_ACCENT fill. DEVIATION from the spec's light-side
// #FFFFFF: white on #E8604C is only ≈3.4:1 (the spec's quoted 4.6:1 is the
// figure for #43140C on #E8604C), so BOTH schemes use the deep coral-black:
// #43140C on #E8604C ≈ 4.6:1 ✓; #43140C on #F2907F ≈ 8.9:1 ✓.
const ON_BRAND = 'light-dark(#43140C, #43140C)';
// Brand-tinted TEXT (never the raw fill): #B23A28 on #FFFFFF ≈ 5.9:1;
// #F2907F on dark card ≈ 7.2:1.
const BRAND_TEXT = 'light-dark(#B23A28, #F2907F)';
// Everyone-band wash (14% brand over card) — passive tint, text on it is
// --color-text-primary.
const BRAND_TINT_14 = \`color-mix(in srgb, \${BRAND_ACCENT} 14%, var(--color-background-card))\`;
// Conflict (red) status dot + braid resolver dot: #B3261E vs #FFFFFF ≈
// 6.4:1; #F2B8B5 vs dark body ≈ 10.9:1 — both ≥3:1 non-text.
const STATUS_RED = 'light-dark(#B3261E, #F2B8B5)';
// Label on a STATUS_RED fill: #FFFFFF on #B3261E ≈ 6.4:1; #2B0605 on
// #F2B8B5 ≈ 11:1.
const ON_RED = 'light-dark(#FFFFFF, #2B0605)';
// Coverage-gap amber: dot/border #B45309 vs #FFFFFF ≈ 5.0:1; #FCD34D vs
// dark body ≈ 12.6:1 — both ≥3:1 vs body AND vs the card the hatch sits on.
const STATUS_AMBER = 'light-dark(#B45309, #FCD34D)';
// 13px amber TEXT (gap captions): #92400E on #FFFFFF ≈ 7.1:1; #FCD34D on
// dark card ≈ 11.7:1.
const AMBER_TEXT = 'light-dark(#92400E, #FCD34D)';
// Gap hatch stripes — 22% amber over transparent; the 1px STATUS_AMBER
// border carries the ≥3:1 boundary duty, the stripes are texture.
const AMBER_HATCH_22 = \`color-mix(in srgb, \${STATUS_AMBER} 22%, transparent)\`;
// MEMBER LANE FILLS (chip leading bars, avatars, handoff capsules) — each
// ≥3:1 vs the light card #FFFFFF and the dark card #1C1C1E:
//   priya  #E8604C ≈ 3.4:1 / #F2907F ≈ 7.2:1
//   marcus #0F766E ≈ 5.5:1 / #5EEAD4 ≈ 11.3:1
//   zoe    #7C3AED ≈ 6.2:1 / #C4B5FD ≈ 8.9:1
//   theo   #B45309 ≈ 5.0:1 / #FCD34D ≈ 11.7:1
const MEMBER_FILL: Record<string, string> = {
  priya: 'light-dark(#E8604C, #F2907F)',
  marcus: 'light-dark(#0F766E, #5EEAD4)',
  zoe: 'light-dark(#7C3AED, #C4B5FD)',
  theo: 'light-dark(#B45309, #FCD34D)',
};
// Text/initials ON a member fill (4.5:1+ in both schemes):
//   on priya  #43140C ≈ 4.6:1 / ≈ 8.9:1   on marcus #FFFFFF ≈ 5.5:1 / #022C26 ≈ 9.4:1
//   on zoe    #FFFFFF ≈ 6.2:1 / #2A1065 ≈ 7.6:1   on theo #FFFFFF ≈ 5.0:1 / #3F2404 ≈ 9.8:1
const MEMBER_ON_FILL: Record<string, string> = {
  priya: 'light-dark(#43140C, #43140C)',
  marcus: 'light-dark(#FFFFFF, #022C26)',
  zoe: 'light-dark(#FFFFFF, #2A1065)',
  theo: 'light-dark(#FFFFFF, #3F2404)',
};
// Member TEXT (11px lane names, chip titles tinted) — 4.5:1+ vs card:
//   priya #B23A28 ≈ 5.9:1 / #F2907F ≈ 7.2:1;  marcus #0F766E ≈ 5.5:1 / #5EEAD4;
//   zoe #6D28D9 ≈ 7.1:1 / #C4B5FD;            theo #92400E ≈ 7.1:1 / #FCD34D.
const MEMBER_TEXT: Record<string, string> = {
  priya: 'light-dark(#B23A28, #F2907F)',
  marcus: 'light-dark(#0F766E, #5EEAD4)',
  zoe: 'light-dark(#6D28D9, #C4B5FD)',
  theo: 'light-dark(#92400E, #FCD34D)',
};
// Chip body wash per member: 16% member color over the card (passive fill;
// chip text is text-primary/secondary on top of it).
function chipWash(memberId: string): string {
  return \`color-mix(in srgb, \${MEMBER_FILL[memberId]} 16%, var(--color-background-card))\`;
}
// Sheet/action-sheet scrim per the mobile foundations.
const SCRIM = 'light-dark(rgba(21, 17, 12, 0.32), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// INJECTED CSS — button reset, :focus-visible rings, visually-hidden h1,
// 2-line clamp, shimmer (REMOVED entirely under prefers-reduced-motion; the
// static muted blocks alone encode loading), sheet slide → fade fallback.
// ---------------------------------------------------------------------------

const KFL_CSS = \`
.kfl-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.kfl-btn:disabled { cursor: default; }
.kfl-focusable:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
.kfl-anim { transition: transform 240ms ease, opacity 240ms ease; }
.kfl-fade { transition: opacity 240ms ease; }
.kfl-clamp2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.kfl-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@keyframes kfl-sheet-in {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: none; opacity: 1; }
}
.kfl-sheet-in { animation: kfl-sheet-in 240ms ease; }
@keyframes kfl-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
.kfl-shimmer {
  position: absolute;
  inset: 0;
  animation: kfl-shimmer 1.6s linear infinite;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--color-background-card) 55%, transparent),
    transparent
  );
}
@media (prefers-reduced-motion: reduce) {
  .kfl-anim, .kfl-fade { transition: none; }
  .kfl-sheet-in { animation: none; }
  .kfl-shimmer { display: none; }
}
\`;

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
  // Longhand overflow pair (never the shorthand — shell already sets
  // overflowX, and React warns on shorthand/longhand mixes).
  shellLocked: {height: '100dvh', overflowX: 'hidden', overflowY: 'hidden'},
  shellDesktop: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // STICKY HEADER BLOCK — navBar 52px + scrubber 44px = 96px; hairline +
  // blur ALWAYS ON (choice noted per contract: no scroll-under wiring).
  headerBlock: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navBar: {
    height: 52,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingInline: 8,
  },
  navLeading: {display: 'flex', justifyContent: 'flex-start'},
  navTrailing: {display: 'flex', justifyContent: 'flex-end'},
  navTitle: {
    fontSize: 17,
    fontWeight: 600,
    maxWidth: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
    margin: 0,
  },
  brandSlot: {width: 44, height: 44, display: 'grid', placeItems: 'center'},
  iconBtn: {
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
  },
  // DATE SCRUBBER — 44px snap rail; 7 pills × 44 hit + 6 × 2px gaps + 32
  // gutter = 352, fits ≥360; scroll-snaps with a pill peek at 320.
  scrubberRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 16,
  },
  scrubberRail: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    gap: 2,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    scrollbarWidth: 'none',
  },
  dayPillHit: {
    position: 'relative',
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    scrollSnapAlign: 'start',
  },
  dayPill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  dayPillActive: {background: BRAND_ACCENT},
  dayWeekday: {fontSize: 11, fontWeight: 500, lineHeight: 1.1, color: 'var(--color-text-secondary)'},
  dayDate: {fontSize: 16, fontWeight: 600, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'},
  // 6px status dot at the pill's top-right, inside the merged 44px hit.
  dayDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: '50%',
  },
  // AVATAR STACK — 4 × 28px, −8px overlap, ONE 44px-tall button.
  avatarStackBtn: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: 8,
    borderRadius: 12,
    flexShrink: 0,
  },
  stackAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    marginInlineStart: -8,
    border: '2px solid var(--color-background-body)',
  },
  main: {flex: 1, display: 'flex', flexDirection: 'column'},
  // LANE HEADER — plain 24px row above the spine: 44px rail spacer + 4
  // flex:1 member names (11px/600, member TEXT pairs, 4.5:1 math above).
  laneHeaderRow: {
    display: 'flex',
    gap: 6,
    paddingInline: 16,
    height: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  laneHeaderRailSpacer: {width: 44, flexShrink: 0},
  laneName: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: 600,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // HOUR SPINE — 44px rail + lanes region over one 896px canvas.
  laneRegion: {display: 'flex', paddingInline: 16, paddingBottom: 24},
  hourRail: {position: 'relative', width: 44, flexShrink: 0, height: 896},
  hourLabel: {
    position: 'absolute',
    right: 8,
    transform: 'translateY(-50%)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  lanesWrap: {position: 'relative', flex: 1, minWidth: 0, height: 896},
  gridline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    background: 'var(--color-border)',
  },
  // EVENT CHIP — absolute button; visual body min 28px; hits under 44px
  // get invisible padding (button spans ≥44, visual centered inside).
  chipBtn: {position: 'absolute', zIndex: 2, display: 'flex', alignItems: 'center'},
  chipVisual: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: '3px 4px 3px 7px',
    border: '1px solid var(--color-border)',
  },
  chipBar: {position: 'absolute', top: 0, bottom: 0, left: 0, width: 3},
  chipTitle: {fontSize: 11, fontWeight: 600, lineHeight: '13px', textAlign: 'left'},
  chipTime: {
    fontSize: 11,
    fontWeight: 400,
    lineHeight: '13px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'left',
  },
  // CONFLICT BRAID — seam of alternating 2px dashes in both event colors
  // (8px period) + a 20px red resolver dot in a 44×44 hit.
  braidSeam: {position: 'absolute', width: 4, zIndex: 3, borderRadius: 2},
  braidDotHit: {
    position: 'absolute',
    width: 44,
    height: 44,
    zIndex: 5,
    display: 'grid',
    placeItems: 'center',
  },
  braidDot: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: STATUS_RED,
    color: ON_RED,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    boxShadow: '0 1px 4px var(--color-shadow)',
  },
  // HANDOFF CHIP — 24px capsule spanning owner→kid lanes; wrapped in a
  // 44px-min-height padded button (zIndex 3, above chips).
  handoffHit: {
    position: 'absolute',
    zIndex: 3,
    height: 44,
    display: 'flex',
    alignItems: 'center',
  },
  handoffCapsule: {
    width: '100%',
    height: 24,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 8,
    boxShadow: '0 1px 4px var(--color-shadow)',
    overflow: 'hidden',
  },
  handoffTime: {fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  kidDot: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 10,
    fontWeight: 600,
    flexShrink: 0,
  },
  // EVERYONE BAND — dinner fuses all four lanes; passive brand wash.
  everyoneBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
    borderRadius: 8,
    background: BRAND_TINT_14,
    border: \`1px solid \${BRAND_ACCENT}\`,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
  },
  everyoneLabel: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 10,
    fontWeight: 600,
    marginInlineStart: -6,
    border: '1px solid var(--color-background-card)',
  },
  // COVERAGE-GAP HATCH — 45° amber stripes UNDER chips (zIndex 1); square
  // corners (full lane-region width); 1px amber border is the ≥3:1
  // boundary; 20px AlertTriangle explainer in a 44×44 hit at trailing edge.
  hatchBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    background: \`repeating-linear-gradient(45deg, transparent 0 6px, \${AMBER_HATCH_22} 6px 12px)\`,
    border: \`1px solid \${STATUS_AMBER}\`,
  },
  hatchBtnHit: {
    position: 'absolute',
    top: '50%',
    right: 0,
    transform: 'translateY(-50%)',
    width: 44,
    height: 44,
    display: 'grid',
    placeItems: 'center',
    color: STATUS_AMBER,
  },
  // NOW LINE — fixed 1:15 PM → top 400 ((795−420)×64/60); 2px brand rule +
  // 8px dot at the rail edge; zIndex 4 (above handoffs).
  nowLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 400,
    height: 2,
    zIndex: 4,
    background: BRAND_ACCENT,
    pointerEvents: 'none',
  },
  nowDot: {
    position: 'absolute',
    left: -4,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: BRAND_ACCENT,
  },
  // TAB BAR — 64px sticky bottom z20; 4 flex:1 tabItems.
  tabBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    height: 64,
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
  tabIconWrap: {position: 'relative', display: 'grid', placeItems: 'center'},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: 1},
  // Drive badge — 16px min-width brand pill, 10px/600 (the chrome
  // contract's stated badge exception to the 11px floor), top −4 right −8.
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: ON_BRAND,
    fontSize: 10,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // LISTS — inset-grouped listCard idiom.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    overflow: 'hidden',
  },
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
  largeTitle: {
    margin: 0,
    padding: '12px 16px 8px',
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.15,
  },
  // 60px two-line Week row.
  row60: {
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  rowText: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
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
  // 72px People media row (40px avatar, divider inset 68).
  row72: {
    width: '100%',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  avatar40: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontWeight: 600,
  },
  drivesPill: {
    flexShrink: 0,
    height: 24,
    paddingInline: 10,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    background: BRAND_TINT_14,
    color: BRAND_TEXT,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  terminalCaption: {
    margin: '16px 0 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SETTINGS — 44px switch rows; whole row is the role='switch' button.
  row44: {
    width: '100%',
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingInline: 16,
  },
  rowLabel16: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'left',
  },
  // Switch: 51×31 track / 27px thumb per the input contract. OFF track
  // rest boundary is an explicit ≥3:1 pair vs the card it sits on —
  // NOT a hairline token: rgba(21,17,12,0.42) over #FFFFFF ≈ 3.2:1;
  // rgba(255,255,255,0.42) over #1C1C1E ≈ 3.4:1 (amendment: interactive
  // rest fills need explicit pairs vs their ACTUAL surface).
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 999,
    flexShrink: 0,
    position: 'relative',
    background: 'light-dark(rgba(21, 17, 12, 0.42), rgba(255, 255, 255, 0.42))',
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
  // Stepper: 96×32 track split by a hairline; value trailing, tabular.
  stepperTrack: {
    width: 96,
    height: 32,
    borderRadius: 8,
    background: 'var(--color-background-muted)',
    display: 'flex',
    overflow: 'hidden',
    flexShrink: 0,
  },
  stepperHalf: {
    width: 47.5,
    height: 32,
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
  // EMPTY STATE — centered between chrome, maxWidth 280.
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
  emptyTitle: {fontSize: 17, fontWeight: 600, margin: 0},
  emptyBody: {fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 16px'},
  emptyBtn: {
    height: 36,
    paddingInline: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
    display: 'grid',
    placeItems: 'center',
  },
  // Non-fixtured-day summary card (scrubbing off Jun 12).
  summaryCard: {
    marginInline: 16,
    marginTop: 12,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  // SKELETONS — muted blocks at the real fixture geometry (zero shift).
  skeletonChip: {
    position: 'absolute',
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  skeletonRow: {display: 'flex', alignItems: 'center', gap: 12, paddingInline: 16},
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'var(--color-background-muted)',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  skeletonBar: {
    height: 12,
    borderRadius: 6,
    background: 'var(--color-background-muted)',
    position: 'relative',
    overflow: 'hidden',
  },
  // TOAST DOCK — sticky-in-flow above the tabBar (bottom 76 = 64 tab + 12)
  // on scrolling views; shell-absolute z42 ONLY while the shell is
  // scroll-locked by an open sheet (documented zIndex exception: above the
  // z40 scrim/z41 sheet so the reassign toast clears the medium detent).
  toastDockSticky: {
    position: 'sticky',
    bottom: 76,
    zIndex: 30,
    marginInline: 16,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastDockLocked: {
    position: 'absolute',
    insetInline: 16,
    bottom: 76,
    zIndex: 42,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toast: {
    width: '100%',
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
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  toastRule: {width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0},
  toastUndo: {
    height: 48,
    minWidth: 44,
    display: 'grid',
    placeItems: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: BRAND_TEXT,
  },
  // SHEET — scrim z40 + sheet z41; two detents 55% / calc(100% − 56px).
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
  sheetTitle: {
    fontSize: 17,
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 16px 16px'},
  sheetMetaRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 16,
    fontVariantNumeric: 'tabular-nums',
  },
  sheetMetaLabel: {width: 72, flexShrink: 0, fontSize: 13, color: 'var(--color-text-secondary)'},
  driverRow: {
    minHeight: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBlock: 8,
  },
  driverName: {fontSize: 16, fontWeight: 500},
  conflictCaption: {fontSize: 13, color: STATUS_RED, fontWeight: 500},
  gapCaption: {fontSize: 13, color: AMBER_TEXT, fontWeight: 500},
  reassignBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: ON_BRAND,
    fontSize: 16,
    fontWeight: 600,
    display: 'grid',
    placeItems: 'center',
    marginTop: 12,
  },
  avatar28: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
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
  actionCard: {
    background: 'var(--color-background-card)',
    borderRadius: 16,
    boxShadow: '0 -8px 32px var(--color-shadow)',
    overflow: 'hidden',
  },
  actionContext: {
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  actionRow: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
  },
  actionCancel: {
    width: '100%',
    height: 56,
    display: 'grid',
    placeItems: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  fullDivider: {height: 1, background: 'var(--color-border)'},
};

// ---------------------------------------------------------------------------
// FIXTURES — one frozen clock (NOW_MIN 795 = 1:15 PM), dual fields
// ({startMin, startLabel}), identity consts. Cross-check ledger (verified by
// hand): 12 distinct events; distinct hours 0.5+1.5+1.0+1.0+2.0+0.75+6.5+
// 6.5+0.5+0.75+1.0+1.0 = 23.0; attendance instances 6+5+4+4 = 19 = 12 + 7
// extras (H1 +2, H2 +1, H3 +1, E1 +3); person-hours 5.25+5.75+8.75+9.0 =
// 28.75 = 23.0 + 5.75 extra (H1 +1.0, H2 +0.75, H3 +1.0, E1 +3.0); week
// 6+9+7+12+4+0+8 = 46; drives priya 2 / marcus 1 → 1 / 2 after reassign.
// Every rendered aggregate derives from the events array at render time —
// deleting one fixture line moves every number (stress fixture 7).
// ---------------------------------------------------------------------------

const NOW_MIN = 795; // 1:15 PM → now-line top (795−420)×64/60 = 400px.
const DAY_START_MIN = 420; // 7 AM
const PX_PER_MIN = 64 / 60; // 64px per hour; 15 min = 16px; canvas 896px.
// Coverage rule (comment is the law): the kids need an assigned adult from
// 3:00 PM (school out, 900) to 6:30 PM (family dinner, 1110). The school-
// pickup driver anchors that window. CONFLICT = the driver has a solo event
// spanning the ENTIRE handoff (they cannot drive at all). GAP = any other
// solo event of the pickup driver intersecting the coverage window (they
// can drive, but coverage is thin while they're busy).
const COVERAGE_START = 900;
const COVERAGE_END = 1110;

type MemberId = 'priya' | 'marcus' | 'zoe' | 'theo';

interface Member {
  id: MemberId;
  name: string;
  role: 'adult' | 'kid';
  age: number | null;
  initial: string;
  laneIdx: number;
}

const MEMBERS: Member[] = [
  {id: 'priya', name: 'Priya', role: 'adult', age: null, initial: 'P', laneIdx: 0},
  {id: 'marcus', name: 'Marcus', role: 'adult', age: null, initial: 'M', laneIdx: 1},
  {id: 'zoe', name: 'Zoe', role: 'kid', age: 9, initial: 'Z', laneIdx: 2},
  {id: 'theo', name: 'Theo', role: 'kid', age: 6, initial: 'T', laneIdx: 3},
];
const MEMBER_BY_ID = Object.fromEntries(MEMBERS.map(member => [member.id, member])) as Record<MemberId, Member>;

interface KinEvent {
  id: string;
  title: string;
  startMin: number;
  endMin: number;
  startLabel: string;
  endLabel: string;
  kind: 'solo' | 'handoff' | 'family';
  memberId?: MemberId; // solo owner
  driverId?: MemberId; // handoff driver
  kidIds?: MemberId[]; // handoff passengers
  custody?: 'pickup' | 'dropoff';
  place?: string; // sheet-only detail (H2 carries the truncation stress)
}

// P3's long title is the 2-line-clamp stress at 56.5px lanes (320 stage);
// H2's place string truncates in the sheet only (stress fixture 1).
const EVENTS: KinEvent[] = [
  {id: 'P1', title: 'Standup', startMin: 540, endMin: 570, startLabel: '9:00', endLabel: '9:30', kind: 'solo', memberId: 'priya'},
  {id: 'P2', title: 'Client review', startMin: 660, endMin: 750, startLabel: '11:00', endLabel: '12:30', kind: 'solo', memberId: 'priya'},
  {id: 'P3', title: 'Design sync — Q3 homepage review w/ Ada', startMin: 870, endMin: 930, startLabel: '2:30', endLabel: '3:30', kind: 'solo', memberId: 'priya'},
  {id: 'M1', title: 'Gym', startMin: 450, endMin: 510, startLabel: '7:30', endLabel: '8:30', kind: 'solo', memberId: 'marcus'},
  {id: 'M2', title: 'Deep work', startMin: 570, endMin: 690, startLabel: '9:30', endLabel: '11:30', kind: 'solo', memberId: 'marcus'},
  {id: 'M3', title: 'Sprint review', startMin: 1020, endMin: 1065, startLabel: '5:00', endLabel: '5:45', kind: 'solo', memberId: 'marcus'},
  {id: 'Z1', title: 'School', startMin: 510, endMin: 900, startLabel: '8:30', endLabel: '3:00', kind: 'solo', memberId: 'zoe'},
  {id: 'T1', title: 'School', startMin: 510, endMin: 900, startLabel: '8:30', endLabel: '3:00', kind: 'solo', memberId: 'theo'},
  {id: 'H1', title: 'School pickup', startMin: 900, endMin: 930, startLabel: '3:00', endLabel: '3:30', kind: 'handoff', driverId: 'priya', kidIds: ['zoe', 'theo'], custody: 'pickup'},
  {id: 'H2', title: 'Piano dropoff', startMin: 960, endMin: 1005, startLabel: '4:00', endLabel: '4:45', kind: 'handoff', driverId: 'priya', kidIds: ['zoe'], custody: 'dropoff', place: 'Piano — Ms. Okonkwo, Rm 12'},
  {id: 'H3', title: 'Soccer dropoff', startMin: 990, endMin: 1050, startLabel: '4:30', endLabel: '5:30', kind: 'handoff', driverId: 'marcus', kidIds: ['theo'], custody: 'dropoff'},
  {id: 'E1', title: 'Family dinner', startMin: 1110, endMin: 1170, startLabel: '6:30', endLabel: '7:30', kind: 'family'},
];

interface DayFixture {
  id: string;
  weekday: string;
  dateNum: number;
  navTitle: string; // navBar center
  rowLabel: string; // Week tab row
  fixedCount: number | null; // null → derives live from the events array
}

const DAYS: DayFixture[] = [
  {id: 'jun9', weekday: 'Tue', dateNum: 9, navTitle: 'Tuesday, Jun 9', rowLabel: 'Tue, Jun 9', fixedCount: 6},
  {id: 'jun10', weekday: 'Wed', dateNum: 10, navTitle: 'Wednesday, Jun 10', rowLabel: 'Wed, Jun 10', fixedCount: 9},
  {id: 'jun11', weekday: 'Thu', dateNum: 11, navTitle: 'Thursday, Jun 11', rowLabel: 'Thu, Jun 11', fixedCount: 7},
  {id: 'jun12', weekday: 'Fri', dateNum: 12, navTitle: 'Friday, Jun 12', rowLabel: 'Fri, Jun 12', fixedCount: null},
  {id: 'jun13', weekday: 'Sat', dateNum: 13, navTitle: 'Saturday, Jun 13', rowLabel: 'Sat, Jun 13', fixedCount: 4},
  {id: 'jun14', weekday: 'Sun', dateNum: 14, navTitle: 'Sunday, Jun 14', rowLabel: 'Sun, Jun 14', fixedCount: 0},
  {id: 'jun15', weekday: 'Mon', dateNum: 15, navTitle: 'Monday, Jun 15', rowLabel: 'Mon, Jun 15', fixedCount: 8},
];

// Skeleton chips render at these REAL fixture geometries (zero layout
// shift by construction): P1 128/32, M2 160/128, Z1 96/416, T1 96/416,
// P2 256/96, E1 736/64.
const SKELETON_EVENT_IDS = ['P1', 'M2', 'Z1', 'T1', 'P2', 'E1'];

// ---------------------------------------------------------------------------
// PURE SELECTORS — every status is derived from the events array at render
// time; nothing here is ever stored.
// ---------------------------------------------------------------------------

function topFor(min: number): number {
  return (min - DAY_START_MIN) * PX_PER_MIN;
}

function heightFor(startMin: number, endMin: number): number {
  return Math.max(28, (endMin - startMin) * PX_PER_MIN);
}

/** Minutes-since-midnight → '3:00 PM'. */
function fmtTime(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return \`\${h12}:\${String(m).padStart(2, '0')} \${suffix}\`;
}

/** Minutes → '5.25' / '9.0' hour strings (trailing zero trimmed to .0). */
function fmtHours(min: number): string {
  const hrs = min / 60;
  const two = hrs.toFixed(2);
  return two.endsWith('0') ? hrs.toFixed(1) : two;
}

function participantsOf(event: KinEvent): MemberId[] {
  if (event.kind === 'solo') return event.memberId != null ? [event.memberId] : [];
  if (event.kind === 'handoff') return [event.driverId as MemberId, ...(event.kidIds ?? [])];
  return MEMBERS.map(member => member.id);
}

interface Conflict {
  handoffId: string;
  blockerId: string;
  startMin: number;
  endMin: number;
}

/** CONFLICT law: the driver has a solo event spanning the whole handoff. */
function conflictsFor(events: KinEvent[]): Conflict[] {
  const out: Conflict[] = [];
  for (const handoff of events) {
    if (handoff.kind !== 'handoff') continue;
    for (const blocker of events) {
      if (blocker.kind !== 'solo' || blocker.memberId !== handoff.driverId) continue;
      if (blocker.startMin <= handoff.startMin && blocker.endMin >= handoff.endMin) {
        out.push({
          handoffId: handoff.id,
          blockerId: blocker.id,
          startMin: Math.max(blocker.startMin, handoff.startMin),
          endMin: Math.min(blocker.endMin, handoff.endMin),
        });
      }
    }
  }
  return out;
}

interface CoverageGap {
  eventId: string;
  startMin: number;
  endMin: number;
}

/** GAP law: pickup driver's other solo events inside 3:00–6:30, minus the
 * intervals already flagged as conflicts. Initial (driver Priya): P3 is a
 * conflict blocker → gaps 0. After reassign (driver Marcus): M3 5:00–5:45
 * → 1 gap ✓. */
function gapsFor(events: KinEvent[]): CoverageGap[] {
  const pickup = events.find(event => event.custody === 'pickup');
  if (pickup == null) return [];
  const conflictBlockers = new Set(conflictsFor(events).map(conflict => conflict.blockerId));
  const out: CoverageGap[] = [];
  for (const event of events) {
    if (event.kind !== 'solo' || event.memberId !== pickup.driverId) continue;
    if (conflictBlockers.has(event.id)) continue;
    const start = Math.max(event.startMin, COVERAGE_START);
    const end = Math.min(event.endMin, COVERAGE_END);
    if (end > start) out.push({eventId: event.id, startMin: start, endMin: end});
  }
  return out;
}

function drivesCount(events: KinEvent[], memberId: MemberId): number {
  return events.filter(event => event.kind === 'handoff' && event.driverId === memberId).length;
}

// Baseline from the shipped fixture — the People-tab badge surfaces the
// member whose drive count ROSE vs this baseline (custody changed today).
const BASELINE_DRIVES = Object.fromEntries(
  MEMBERS.map(member => [member.id, drivesCount(EVENTS, member.id)]),
) as Record<MemberId, number>;

function memberStats(events: KinEvent[], memberId: MemberId): {count: number; minutes: number} {
  let count = 0;
  let minutes = 0;
  for (const event of events) {
    if (!participantsOf(event).includes(memberId)) continue;
    count += 1;
    minutes += event.endMin - event.startMin;
  }
  return {count, minutes};
}

// ---------------------------------------------------------------------------
// ONE STATE OWNER — useDayStore in the root component; a single update(id,
// patch) mutator for events plus one ui patcher. Conflicts, gaps, dots,
// badges, and every aggregate derive from \`events\` at render.
// ---------------------------------------------------------------------------

type TabId = 'today' | 'week' | 'people' | 'settings';

interface ToastState {
  seq: number;
  msg: string;
  undo: {eventId: string; patch: Partial<KinEvent>} | null;
}

interface KinSettings {
  coverageAlerts: boolean;
  conflictBadges: boolean;
  weekStartsMonday: boolean;
  handoffWindowMin: number; // 15–60, step 15
}

interface DayStore {
  tab: TabId;
  dayId: string;
  sheet: null | {kind: 'event' | 'gap'; eventId: string | null; detent: 'medium' | 'large'};
  actionSheet: null | {kind: 'reassign' | 'resolve'};
  toast: ToastState | null;
  refreshing: boolean;
  settings: KinSettings;
  events: KinEvent[];
}

const INITIAL_STORE: DayStore = {
  tab: 'today',
  dayId: 'jun12',
  sheet: null,
  actionSheet: null,
  toast: null,
  refreshing: false,
  settings: {coverageAlerts: true, conflictBadges: true, weekStartsMonday: false, handoffWindowMin: 30},
  events: EVENTS,
};

function useDayStore() {
  const [store, setStore] = useState<DayStore>(INITIAL_STORE);
  const patch = useCallback((uiPatch: Partial<DayStore>) => {
    setStore(prev => ({...prev, ...uiPatch}));
  }, []);
  /** THE event mutator — update(id, patch); everything else derives. */
  const update = useCallback((id: string, eventPatch: Partial<KinEvent>, uiPatch?: Partial<DayStore>) => {
    setStore(prev => ({
      ...prev,
      ...uiPatch,
      events: prev.events.map(event => (event.id === id ? {...event, ...eventPatch} : event)),
    }));
  }, []);
  return {store, patch, update, setStore};
}

/** Container-width hook (grid-feeder-console pattern) — the desktop stage
 * is ~1045px inside a 1440px window, so only a ResizeObserver can tell the
 * stages apart. Also reused to measure the lane region for handoff spans. */
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

// ---------------------------------------------------------------------------
// KINLOOP MARK — 24px four-loop family knot: four rounded loops at stroke
// widths 3.5/3/2.5/2, stroke var(--color-text-primary), fill none. (Spec
// asked for one continuous path; SVG cannot vary stroke width mid-path, so
// the knot is four interlocked loop subpaths — noted deviation.)
// ---------------------------------------------------------------------------

function KinloopMark() {
  return (
    <span style={styles.brandSlot} aria-hidden>
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="9" cy="9" r="5" stroke="var(--color-text-primary)" strokeWidth="3.5" />
        <circle cx="15" cy="9" r="5" stroke="var(--color-text-primary)" strokeWidth="3" />
        <circle cx="9" cy="15" r="5" stroke="var(--color-text-primary)" strokeWidth="2.5" />
        <circle cx="15" cy="15" r="5" stroke="var(--color-text-primary)" strokeWidth="2" />
      </svg>
    </span>
  );
}

function MemberAvatar({memberId, size}: {memberId: MemberId; size: CSSProperties}) {
  const member = MEMBER_BY_ID[memberId];
  return (
    <span
      style={{...size, background: MEMBER_FILL[memberId], color: MEMBER_ON_FILL[memberId]}}
      aria-hidden>
      {member.initial}
    </span>
  );
}

// ---------------------------------------------------------------------------
// DATE SCRUBBER — 7-pill radiogroup snap rail with ArrowLeft/ArrowRight;
// per-day status dots DERIVE from selectors (red = conflicts, amber =
// gaps); the 4-avatar stack is one 44px button jumping to People.
// ---------------------------------------------------------------------------

interface DateScrubberProps {
  activeDayId: string;
  jun12Status: 'red' | 'amber' | null;
  onSelectDay: (dayId: string) => void;
  onOpenPeople: () => void;
}

function DateScrubber({activeDayId, jun12Status, onSelectDay, onOpenPeople}: DateScrubberProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = DAYS.findIndex(day => day.id === activeDayId);
    const next = event.key === 'ArrowRight' ? Math.min(DAYS.length - 1, index + 1) : Math.max(0, index - 1);
    onSelectDay(DAYS[next].id);
    railRef.current?.querySelectorAll('button')[next]?.focus();
  };
  return (
    <div style={styles.scrubberRow}>
      <div
        ref={railRef}
        role="radiogroup"
        aria-label="Day of the week"
        style={styles.scrubberRail}
        onKeyDown={onKeyDown}>
        {DAYS.map(day => {
          const isActive = day.id === activeDayId;
          const dot = day.id === 'jun12' ? jun12Status : null;
          return (
            <button
              key={day.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              className="kfl-btn kfl-focusable"
              style={styles.dayPillHit}
              aria-label={\`\${day.navTitle}\${dot === 'red' ? ', has a conflict' : dot === 'amber' ? ', has a coverage gap' : ''}\`}
              onClick={() => onSelectDay(day.id)}>
              <span style={{...styles.dayPill, ...(isActive ? styles.dayPillActive : null)}}>
                <span style={{...styles.dayWeekday, ...(isActive ? {color: ON_BRAND} : null)}}>{day.weekday}</span>
                <span style={{...styles.dayDate, ...(isActive ? {color: ON_BRAND} : null)}}>{day.dateNum}</span>
              </span>
              {dot != null ? (
                <span
                  style={{
                    ...styles.dayDot,
                    background: dot === 'red' ? STATUS_RED : STATUS_AMBER,
                  }}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="kfl-btn kfl-focusable"
        style={styles.avatarStackBtn}
        aria-label="Family — open People tab"
        onClick={onOpenPeople}>
        {MEMBERS.map(member => (
          <MemberAvatar key={member.id} memberId={member.id} size={styles.stackAvatar} />
        ))}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MEMBER LANE SPINE — 44px hour rail + four flex:1 lanes over one absolute
// 896px canvas. zIndex ladder (stress fixture 4): gridlines 0 · gap hatch
// 1 · chips/everyone band 2 · handoff capsules 3 · now-line 4 · braid dot
// 5. Lane geometry is MEASURED (laneW = (w − 18) / 4), never hardcoded, so
// handoff spans and hatches scale with the flex lanes.
// ---------------------------------------------------------------------------

const HOUR_LABELS = Array.from({length: 15}, (_, i) => {
  const h24 = 7 + i;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return \`\${h12} \${h24 >= 12 ? 'PM' : 'AM'}\`;
});

interface LaneSpineProps {
  events: KinEvent[];
  conflicts: Conflict[];
  gaps: CoverageGap[];
  onOpenEvent: (eventId: string, opener: HTMLElement) => void;
  onResolveConflict: (opener: HTMLElement) => void;
  onExplainGap: (opener: HTMLElement) => void;
}

function MemberLaneSpine({events, conflicts, gaps, onOpenEvent, onResolveConflict, onExplainGap}: LaneSpineProps) {
  const lanesRef = useRef<HTMLDivElement | null>(null);
  const lanesW = useElementWidth(lanesRef);
  const laneW = lanesW > 0 ? (lanesW - 18) / 4 : 0;
  const laneLeft = (idx: number) => idx * (laneW + 6);
  // Below ~280px of lane region (stage < ~350px) chips drop the time line —
  // a measured container check, never a 390 assumption.
  const showTime = lanesW >= 280;
  const conflictByBlocker = new Map(conflicts.map(conflict => [conflict.blockerId, conflict]));
  const conflictedHandoffs = new Set(conflicts.map(conflict => conflict.handoffId));
  const byId = new Map(events.map(event => [event.id, event]));
  const sorted = [...events].sort((a, b) => a.startMin - b.startMin);

  const renderChipInner = (event: KinEvent, memberId: MemberId, hideTime: boolean) => (
    <span style={{...styles.chipVisual, background: chipWash(memberId)}}>
      <span style={{...styles.chipBar, background: MEMBER_FILL[memberId]}} aria-hidden />
      <span style={styles.chipTitle} className="kfl-clamp2">
        {event.title}
      </span>
      {showTime && !hideTime ? (
        <span style={styles.chipTime}>
          {event.startLabel}–{event.endLabel}
        </span>
      ) : null}
    </span>
  );

  // A chip button whose HIT is ≥44px tall even when the visual is shorter
  // (P1 Standup = 32px visual inside a 44px hit; the 15-min grid guarantees
  // ≥8px clearance from same-lane neighbors — stress fixture 3).
  const chipButton = (event: KinEvent, memberId: MemberId, left: number, width: number, halfNote?: string) => {
    const visualTop = topFor(event.startMin);
    const visualH = heightFor(event.startMin, event.endMin);
    const hitH = Math.max(44, visualH);
    const hitTop = visualTop - (hitH - visualH) / 2;
    return (
      <button
        key={\`\${event.id}-\${memberId}\`}
        type="button"
        className="kfl-btn kfl-focusable"
        style={{...styles.chipBtn, top: hitTop, left, width, height: hitH}}
        aria-label={\`\${event.title}, \${fmtTime(event.startMin)} to \${fmtTime(event.endMin)}, \${MEMBER_BY_ID[memberId].name}'s lane\${halfNote ?? ''}\`}
        onClick={eventClick => onOpenEvent(event.id, eventClick.currentTarget)}>
        <span style={{display: 'block', width: '100%', height: visualH}}>{renderChipInner(event, memberId, false)}</span>
      </button>
    );
  };

  return (
    <div style={styles.laneRegion}>
      <div style={styles.hourRail} aria-hidden>
        {HOUR_LABELS.map((label, i) => (
          <span key={label} style={{...styles.hourLabel, top: i * 64}}>
            {label}
          </span>
        ))}
      </div>
      <div ref={lanesRef} style={styles.lanesWrap}>
        {HOUR_LABELS.map((label, i) => (
          <div key={label} style={{...styles.gridline, top: i * 64}} aria-hidden />
        ))}

        {/* Coverage-gap hatches — UNDER chips; square corners; amber border
            is the ≥3:1 boundary; explainer button at the trailing edge. */}
        {gaps.map(gap => (
          <div
            key={gap.eventId}
            style={{
              ...styles.hatchBand,
              top: topFor(gap.startMin),
              height: (gap.endMin - gap.startMin) * PX_PER_MIN,
            }}>
            <button
              type="button"
              className="kfl-btn kfl-focusable"
              style={styles.hatchBtnHit}
              aria-label={\`Coverage gap \${fmtTime(gap.startMin)} to \${fmtTime(gap.endMin)} — why?\`}
              onClick={eventClick => onExplainGap(eventClick.currentTarget)}>
              <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
            </button>
          </div>
        ))}

        {/* Chips in DOM order by start time (screen-reader linearization of
            the 2D canvas; lane is announced in the accessible name). */}
        {sorted.map(event => {
          if (event.kind === 'family') {
            // EVERYONE BAND — attendees == all 4 → one full-width band.
            return (
              <button
                key={event.id}
                type="button"
                className="kfl-btn kfl-focusable"
                style={{...styles.everyoneBand, top: topFor(event.startMin), height: heightFor(event.startMin, event.endMin)}}
                aria-label={\`\${event.title}, \${fmtTime(event.startMin)} to \${fmtTime(event.endMin)}, everyone\`}
                onClick={eventClick => onOpenEvent(event.id, eventClick.currentTarget)}>
                <span style={{display: 'flex', paddingInlineStart: 6}} aria-hidden>
                  {MEMBERS.map(member => (
                    <MemberAvatar key={member.id} memberId={member.id} size={styles.miniAvatar} />
                  ))}
                </span>
                <span style={styles.everyoneLabel}>
                  Family dinner · {event.startLabel}–{event.endLabel}
                </span>
              </button>
            );
          }
          if (event.kind === 'handoff') {
            // Conflicted handoff renders inside the braid instead of as a
            // capsule (the two would collide at the same minute).
            if (conflictedHandoffs.has(event.id)) return null;
            const driver = MEMBER_BY_ID[event.driverId as MemberId];
            const kidIdxs = (event.kidIds ?? []).map(kidId => MEMBER_BY_ID[kidId].laneIdx);
            const lo = Math.min(driver.laneIdx, ...kidIdxs);
            const hi = Math.max(driver.laneIdx, ...kidIdxs);
            const left = laneLeft(lo) + 2;
            const width = laneLeft(hi) + laneW - 2 - left;
            const kidNames = (event.kidIds ?? []).map(kidId => MEMBER_BY_ID[kidId].name).join(' and ');
            return (
              <button
                key={event.id}
                type="button"
                className="kfl-btn kfl-focusable"
                style={{...styles.handoffHit, top: topFor(event.startMin) - 10, left, width}}
                aria-label={\`\${event.title}, \${fmtTime(event.startMin)}, driver \${driver.name}, \${kidNames}\`}
                onClick={eventClick => onOpenEvent(event.id, eventClick.currentTarget)}>
                <span
                  style={{
                    ...styles.handoffCapsule,
                    background: MEMBER_FILL[driver.id],
                    color: MEMBER_ON_FILL[driver.id],
                  }}>
                  <Icon icon={CarIcon} size="sm" color="inherit" />
                  <span style={styles.handoffTime}>{event.startLabel}</span>
                  <span style={{flex: 1}} />
                  {(event.kidIds ?? []).map(kidId => (
                    <span
                      key={kidId}
                      style={{
                        ...styles.kidDot,
                        background: MEMBER_FILL[kidId],
                        color: MEMBER_ON_FILL[kidId],
                      }}
                      aria-hidden>
                      {MEMBER_BY_ID[kidId].initial}
                    </span>
                  ))}
                </span>
              </button>
            );
          }
          // Solo chip — braided when it blocks a handoff.
          const memberId = event.memberId as MemberId;
          const laneIdx = MEMBER_BY_ID[memberId].laneIdx;
          const conflict = conflictByBlocker.get(event.id);
          if (conflict == null) {
            return chipButton(event, memberId, laneLeft(laneIdx), laneW);
          }
          // CONFLICT BRAID — blocker and handoff side-by-side at
          // (laneW − 4) / 2 each, braided seam, red resolver dot (44×44
          // hit) centered on the overlap midpoint. At 320px lanes are
          // 56.5px → halves ≈ 26px; titles clamp, hits stay ≥44.
          const handoff = byId.get(conflict.handoffId) as KinEvent;
          const half = (laneW - 4) / 2;
          const seamTop = topFor(conflict.startMin);
          const seamH = (conflict.endMin - conflict.startMin) * PX_PER_MIN;
          const dotCenter = seamTop + seamH / 2;
          return (
            <div key={event.id} style={{display: 'contents'}}>
              {chipButton(event, memberId, laneLeft(laneIdx), half, ', conflicted')}
              {chipButton(handoff, memberId, laneLeft(laneIdx) + half + 4, half, ', conflicted')}
              <span
                style={{
                  ...styles.braidSeam,
                  left: laneLeft(laneIdx) + half,
                  top: seamTop,
                  height: seamH,
                  background: \`repeating-linear-gradient(180deg, \${MEMBER_FILL[memberId]} 0 4px, \${STATUS_RED} 4px 8px)\`,
                }}
                aria-hidden
              />
              <button
                type="button"
                className="kfl-btn kfl-focusable"
                style={{
                  ...styles.braidDotHit,
                  left: laneLeft(laneIdx) + half + 2 - 22,
                  top: dotCenter - 22,
                }}
                aria-label="Resolve conflict: who drives at 3:00?"
                onClick={eventClick => onResolveConflict(eventClick.currentTarget)}>
                <span style={styles.braidDot}>!</span>
              </button>
            </div>
          );
        })}

        {/* NOW LINE — fixed 1:15 PM → topFor(795) = 400. */}
        <div style={{...styles.nowLine, top: topFor(NOW_MIN)}} aria-hidden>
          <span style={styles.nowDot} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHEET — two detents (55% / calc(100% − 56px)); grabber is a real button;
// pointer drag between detents is garnish (>120px past medium closes);
// focus trapped, moved in with {preventScroll: true}, restored on close.
// ---------------------------------------------------------------------------

interface SheetProps {
  titleId: string;
  title: string;
  detent: 'medium' | 'large';
  onDetentChange: (detent: 'medium' | 'large') => void;
  onClose: () => void;
  sheetRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  children: ReactNode;
}

function Sheet({titleId, title, detent, onDetentChange, onClose, sheetRef, reducedMotion, children}: SheetProps) {
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
    if (!movedRef.current) return;
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
      className="kfl-sheet-in"
      onKeyDown={event => trapTabKey(event, sheetRef.current)}
      style={{
        ...styles.sheet,
        height: detent === 'medium' ? '55%' : 'calc(100% - 56px)',
        transform: translate,
        transition: dragY != null || reducedMotion ? 'none' : 'transform 240ms ease',
      }}>
      <button
        type="button"
        className="kfl-btn kfl-focusable"
        style={styles.grabberZone}
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
        <button
          type="button"
          className="kfl-btn kfl-focusable"
          style={styles.iconBtn}
          aria-label="Close sheet"
          onClick={onClose}>
          <Icon icon={XIcon} size="md" color="inherit" />
        </button>
      </div>
      <div style={styles.sheetBody}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ACTION SHEET — two stacked cards (options + separate Cancel), centered
// no-icons rows; focus lands on Cancel; Escape/scrim close; choosing a row
// executes immediately (undo-over-confirm — no confirm step anywhere).
// ---------------------------------------------------------------------------

interface ActionSheetProps {
  contextText: string;
  rows: Array<{id: string; label: string; onPick: () => void}>;
  onCancel: () => void;
  cancelRef: RefObject<HTMLButtonElement | null>;
  wrapRef: RefObject<HTMLDivElement | null>;
}

function KinActionSheet({contextText, rows, onCancel, cancelRef, wrapRef}: ActionSheetProps) {
  return (
    <div
      ref={wrapRef}
      role="dialog"
      aria-modal="true"
      aria-label={contextText}
      style={styles.actionSheetWrap}
      className="kfl-sheet-in"
      onKeyDown={event => trapTabKey(event, wrapRef.current)}>
      <div style={styles.actionCard}>
        <div style={styles.actionContext}>{contextText}</div>
        {rows.map(row => (
          <div key={row.id}>
            <div style={styles.fullDivider} />
            <button type="button" className="kfl-btn kfl-focusable" style={styles.actionRow} onClick={row.onPick}>
              {row.label}
            </button>
          </div>
        ))}
      </div>
      <div style={styles.actionCard}>
        <button
          type="button"
          ref={cancelRef}
          className="kfl-btn kfl-focusable"
          style={styles.actionCancel}
          onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SKELETONS — user-reachable only (navBar RefreshCw enters; the next press
// or a tab switch resolves — no timers). Geometry equals loaded geometry by
// construction; deterministic width cycles, one shared shimmer (removed
// entirely under prefers-reduced-motion).
// ---------------------------------------------------------------------------

const SKELETON_PRIMARY_W = ['60%', '45%', '70%', '60%'];
const SKELETON_SECONDARY_W = ['40%', '55%', '30%', '40%'];

function TodaySkeleton() {
  const blocks = SKELETON_EVENT_IDS.map(id => EVENTS.find(event => event.id === id) as KinEvent);
  return (
    <div style={styles.laneRegion} aria-busy="true">
      <div style={styles.hourRail} aria-hidden>
        {HOUR_LABELS.map((label, i) => (
          <span key={label} style={{...styles.hourLabel, top: i * 64}}>
            {label}
          </span>
        ))}
      </div>
      <div style={styles.lanesWrap}>
        {HOUR_LABELS.map((label, i) => (
          <div key={label} style={{...styles.gridline, top: i * 64}} aria-hidden />
        ))}
        {blocks.map(event => {
          const laneIdx =
            event.kind === 'family' ? null : MEMBER_BY_ID[(event.memberId ?? event.driverId) as MemberId].laneIdx;
          const laneStyle: CSSProperties =
            laneIdx == null
              ? {left: 0, right: 0}
              : {left: \`calc(\${laneIdx} * (25% + 1.5px))\`, width: 'calc(25% - 4.5px)'};
          return (
            <span
              key={event.id}
              style={{
                ...styles.skeletonChip,
                ...laneStyle,
                top: topFor(event.startMin),
                height: heightFor(event.startMin, event.endMin),
              }}
              aria-hidden>
              <span className="kfl-shimmer" />
            </span>
          );
        })}
      </div>
    </div>
  );
}

function ListSkeleton({rows, rowHeight}: {rows: number; rowHeight: number}) {
  return (
    <div style={styles.listCard} aria-busy="true">
      {Array.from({length: rows}, (_, i) => (
        <div key={i}>
          {i > 0 ? <div style={rowHeight === 72 ? styles.rowDivider68 : styles.rowDivider} /> : null}
          <div style={{...styles.skeletonRow, height: rowHeight}} aria-hidden>
            {rowHeight === 72 ? (
              <span style={styles.skeletonCircle}>
                <span className="kfl-shimmer" />
              </span>
            ) : null}
            <span style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8}}>
              <span style={{...styles.skeletonBar, width: SKELETON_PRIMARY_W[i % 4]}}>
                <span className="kfl-shimmer" />
              </span>
              <span style={{...styles.skeletonBar, width: SKELETON_SECONDARY_W[i % 4]}}>
                <span className="kfl-shimmer" />
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const TAB_DEFS: Array<{id: TabId; label: string; icon: typeof CalendarDaysIcon}> = [
  {id: 'today', label: 'Today', icon: CalendarDaysIcon},
  {id: 'week', label: 'Week', icon: Columns3Icon},
  {id: 'people', label: 'People', icon: UsersIcon},
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
];

export default function MobileFamilyDayLanesTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isWideViewport = useMediaQuery('(min-width: 720px)');
  const isDesktopColumn = wrapWidth > 0 ? wrapWidth >= 720 : isWideViewport;
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const {store, patch, update} = useDayStore();
  const {events, settings} = store;

  // Focus plumbing — opener restored on every close path; Escape closes
  // the topmost overlay only (actionSheet → sheet → none).
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetOpenerRef = useRef<HTMLElement | null>(null);
  const actionOpenerRef = useRef<HTMLElement | null>(null);
  const actionWrapRef = useRef<HTMLDivElement | null>(null);
  const actionCancelRef = useRef<HTMLButtonElement | null>(null);
  const toastSeqRef = useRef(0);

  // DERIVED — every status recomputes from the events array each render.
  const conflicts = settings.conflictBadges ? conflictsFor(events) : [];
  const gaps = settings.coverageAlerts ? gapsFor(events) : [];
  const jun12Status: 'red' | 'amber' | null = conflicts.length > 0 ? 'red' : gaps.length > 0 ? 'amber' : null;
  const pickup = events.find(event => event.custody === 'pickup') as KinEvent;
  const pickupDriver = MEMBER_BY_ID[pickup.driverId as MemberId];
  // People-tab badge: the member whose drive count ROSE vs the fixture
  // baseline (custody changed today); content = their new count.
  const badgeMember = MEMBERS.find(member => drivesCount(events, member.id) > BASELINE_DRIVES[member.id]);
  const badgeCount = badgeMember != null ? drivesCount(events, badgeMember.id) : null;
  const weekTotal = DAYS.reduce((sum, day) => sum + (day.fixedCount ?? events.length), 0);
  const totalPersonMinutes = MEMBERS.reduce((sum, member) => sum + memberStats(events, member.id).minutes, 0);
  const activeDay = DAYS.find(day => day.id === store.dayId) as DayFixture;
  const overlayOpen = store.sheet != null || store.actionSheet != null;
  const sheetEvent = store.sheet?.eventId != null ? events.find(event => event.id === store.sheet?.eventId) : null;
  const sheetEventConflicted = sheetEvent != null && conflicts.some(conflict => conflict.handoffId === sheetEvent.id);

  const toastPatch = (msg: string, undo: ToastState['undo'] = null) => {
    toastSeqRef.current += 1;
    return {toast: {seq: toastSeqRef.current, msg, undo}};
  };

  // Focus into an opening sheet with preventScroll — plain .focus() would
  // scroll-reveal the animating sheet inside the locked overflow-hidden
  // column and beach it mid-screen (foundations amendment).
  useEffect(() => {
    if (store.sheet != null && store.actionSheet == null) sheetRef.current?.focus({preventScroll: true});
  }, [store.sheet, store.actionSheet]);
  // Action-sheet focus lands on Cancel (safe default).
  useEffect(() => {
    if (store.actionSheet != null) actionCancelRef.current?.focus({preventScroll: true});
  }, [store.actionSheet]);

  const closeActionSheet = useCallback(() => {
    patch({actionSheet: null});
    actionOpenerRef.current?.focus();
  }, [patch]);
  const closeSheet = useCallback(() => {
    patch({sheet: null, actionSheet: null});
    sheetOpenerRef.current?.focus();
  }, [patch]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (store.actionSheet != null) closeActionSheet();
      else if (store.sheet != null) closeSheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store.actionSheet, store.sheet, closeActionSheet, closeSheet]);

  // HANDLERS ----------------------------------------------------------------

  const openEventSheet = (eventId: string, opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    patch({sheet: {kind: 'event', eventId, detent: 'medium'}});
  };
  const openGapSheet = (opener: HTMLElement) => {
    sheetOpenerRef.current = opener;
    patch({sheet: {kind: 'gap', eventId: null, detent: 'medium'}});
  };
  const openActionSheet = (kind: 'reassign' | 'resolve', opener: HTMLElement) => {
    actionOpenerRef.current = opener;
    patch({actionSheet: {kind}});
  };

  // SIGNATURE FLOW — choosing a driver fires ONE update('H1', {driverId})
  // and every consequence derives in the same render: braid unbraids,
  // scrubber dot red→amber, gap hatch appears, People badge '2', the
  // still-open sheet's Driver row re-renders, Undo toast lands. No confirm
  // (reversible → undo-over-confirm).
  const chooseDriver = (memberId: MemberId) => {
    const prev = pickup.driverId as MemberId;
    if (memberId === prev) {
      closeActionSheet();
      return;
    }
    update(
      pickup.id,
      {driverId: memberId},
      {
        actionSheet: null,
        ...toastPatch(\`Pickup reassigned to \${MEMBER_BY_ID[memberId].name}\`, {
          eventId: pickup.id,
          patch: {driverId: prev},
        }),
      },
    );
    actionOpenerRef.current?.focus();
  };

  const undoToast = () => {
    const undo = store.toast?.undo;
    if (undo == null) return;
    update(undo.eventId, undo.patch, toastPatch('Restored'));
  };

  // Refresh button toggles skeletons; the NEXT user action resolves —
  // deterministic, no timers. role='status' text via the one live region.
  const pressRefresh = () => {
    if (store.refreshing) patch({refreshing: false, ...toastPatch('Updated just now')});
    else patch({refreshing: true, ...toastPatch('Loading')});
  };

  // TAB LAWS: overlays close on tab switch (toast persists); re-tapping
  // the active tab pops to root and scrolls top; a pending refresh
  // resolves on switch.
  const selectTab = (tab: TabId) => {
    if (tab === store.tab) {
      patch({sheet: null, actionSheet: null});
      wrapRef.current?.scrollIntoView({block: 'start'});
      return;
    }
    patch({
      tab,
      sheet: null,
      actionSheet: null,
      ...(store.refreshing ? {refreshing: false, ...toastPatch('Updated just now')} : null),
    });
  };

  const selectDay = (dayId: string) => {
    if (dayId === store.dayId) return;
    patch({dayId, sheet: null, actionSheet: null, ...(store.refreshing ? {refreshing: false} : null)});
  };

  const toggleSetting = (key: 'coverageAlerts' | 'conflictBadges' | 'weekStartsMonday') => {
    patch({settings: {...settings, [key]: !settings[key]}});
  };
  const stepWindow = (delta: number) => {
    const next = Math.min(60, Math.max(15, settings.handoffWindowMin + delta));
    if (next !== settings.handoffWindowMin) patch({settings: {...settings, handoffWindowMin: next}});
  };

  // VIEWS ---------------------------------------------------------------

  const renderToday = () => {
    if (store.refreshing) return <TodaySkeleton />;
    if (store.dayId !== 'jun12') {
      if (activeDay.fixedCount === 0) {
        // TRUE-EMPTY — Sun Jun 14, centered between chrome.
        return (
          <div style={styles.emptyState}>
            <span style={styles.emptyCircle}>
              <Icon icon={CalendarOffIcon} size="lg" color="inherit" />
            </span>
            <h2 style={styles.emptyTitle}>No plans yet</h2>
            <p style={styles.emptyBody}>Events you add for Sunday appear here.</p>
            <button
              type="button"
              className="kfl-btn kfl-focusable"
              style={styles.emptyBtn}
              onClick={() => patch(toastPatch('Adding events is outside this demo fixture'))}>
              Add event
            </button>
          </div>
        );
      }
      return (
        <div style={styles.summaryCard}>
          <span style={styles.rowPrimary}>{activeDay.navTitle}</span>
          <span style={styles.rowSecondary}>{activeDay.fixedCount} events scheduled · no conflicts</span>
          <span style={{...styles.rowSecondary, whiteSpace: 'normal'}}>
            Only Friday carries the full lane fixture — scrub back to Jun 12 for the day view.
          </span>
        </div>
      );
    }
    return (
      <>
        <div style={styles.laneHeaderRow}>
          <span style={styles.laneHeaderRailSpacer} aria-hidden />
          {MEMBERS.map(member => (
            <span key={member.id} style={{...styles.laneName, color: MEMBER_TEXT[member.id]}}>
              {member.name}
            </span>
          ))}
        </div>
        <MemberLaneSpine
          events={events}
          conflicts={conflicts}
          gaps={gaps}
          onOpenEvent={openEventSheet}
          onResolveConflict={opener => openActionSheet('resolve', opener)}
          onExplainGap={openGapSheet}
        />
      </>
    );
  };

  const renderWeek = () => (
    <>
      <h2 style={styles.sectionHeader}>Week of Jun 9</h2>
      {store.refreshing ? (
        <ListSkeleton rows={7} rowHeight={60} />
      ) : (
        <>
          <div style={styles.listCard}>
            {DAYS.map((day, index) => {
              const count = day.fixedCount ?? events.length;
              const status =
                day.id === 'jun12'
                  ? conflicts.length > 0
                    ? \`\${conflicts.length} conflict\`
                    : gaps.length > 0
                      ? \`\${gaps.length} coverage gap\`
                      : 'Clear'
                  : count === 0
                    ? 'No plans'
                    : 'Clear';
              return (
                <div key={day.id}>
                  {index > 0 ? <div style={styles.rowDivider} /> : null}
                  <button
                    type="button"
                    className="kfl-btn kfl-focusable"
                    style={styles.row60}
                    aria-label={\`\${day.rowLabel}, \${count} events, \${status} — open day\`}
                    onClick={() => {
                      selectDay(day.id);
                      patch({tab: 'today'});
                    }}>
                    <span style={styles.rowText}>
                      <span style={styles.rowPrimary}>{day.rowLabel}</span>
                      <span
                        style={{
                          ...styles.rowSecondary,
                          ...(day.id === 'jun12' && conflicts.length > 0 ? {color: STATUS_RED} : null),
                          ...(day.id === 'jun12' && conflicts.length === 0 && gaps.length > 0
                            ? {color: AMBER_TEXT}
                            : null),
                        }}>
                        {count} events · {status}
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
          <p style={styles.terminalCaption}>All {weekTotal} events this week</p>
        </>
      )}
    </>
  );

  const renderPeople = () => (
    <>
      <h2 style={styles.largeTitle}>Family</h2>
      <div style={styles.sectionHeader}>
        Friday · {events.length} events
      </div>
      {store.refreshing ? (
        <ListSkeleton rows={4} rowHeight={72} />
      ) : (
        <>
          <div style={styles.listCard}>
            {MEMBERS.map((member, index) => {
              const stats = memberStats(events, member.id);
              const drives = drivesCount(events, member.id);
              return (
                <div key={member.id}>
                  {index > 0 ? <div style={styles.rowDivider68} /> : null}
                  <button
                    type="button"
                    className="kfl-btn kfl-focusable"
                    style={styles.row72}
                    aria-label={\`\${member.name}, \${stats.count} events, \${fmtHours(stats.minutes)} hours\${member.role === 'adult' ? \`, \${drives} drives\` : ''}\`}
                    onClick={event => openEventSheet(member.role === 'adult' && drives > 0 ? pickup.id : 'E1', event.currentTarget)}>
                    <MemberAvatar memberId={member.id} size={styles.avatar40} />
                    <span style={styles.rowText}>
                      <span style={styles.rowPrimary}>{member.name}</span>
                      <span style={styles.rowSecondary}>
                        {stats.count} events · {fmtHours(stats.minutes)} hrs
                        {member.role === 'kid' ? \` · age \${member.age}\` : ''}
                      </span>
                    </span>
                    {member.role === 'adult' ? (
                      <span style={styles.drivesPill}>
                        {drives} {drives === 1 ? 'drive' : 'drives'}
                      </span>
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
          {/* Deviation: spec quoted '26.0 scheduled hrs' (distinct + dinner
              only); the footer instead derives Σ per-member hours so that
              deleting ANY fixture line moves it — 28.75 as shipped. */}
          <p style={styles.terminalCaption}>
            All {MEMBERS.length} people · {fmtHours(totalPersonMinutes)} person-hrs
          </p>
        </>
      )}
    </>
  );

  const renderSettings = () => (
    <>
      <h2 style={styles.sectionHeader}>Alerts</h2>
      <div style={styles.listCard}>
        {(
          [
            {key: 'coverageAlerts', label: 'Coverage alerts'},
            {key: 'conflictBadges', label: 'Conflict badges'},
            {key: 'weekStartsMonday', label: 'Week starts Monday'},
          ] as const
        ).map((row, index) => (
          <div key={row.key}>
            {index > 0 ? <div style={styles.rowDivider} /> : null}
            <button
              type="button"
              role="switch"
              aria-checked={settings[row.key]}
              className="kfl-btn kfl-focusable"
              style={styles.row44}
              onClick={() => toggleSetting(row.key)}>
              <span style={styles.rowLabel16}>{row.label}</span>
              <span style={{...styles.switchTrack, ...(settings[row.key] ? styles.switchTrackOn : null)}} aria-hidden>
                <span
                  className="kfl-anim"
                  style={{...styles.switchThumb, ...(settings[row.key] ? styles.switchThumbOn : null)}}
                />
              </span>
            </button>
          </div>
        ))}
      </div>
      <h2 style={styles.sectionHeader}>Handoffs</h2>
      <div style={styles.listCard}>
        <div style={styles.row44}>
          <span style={styles.rowLabel16}>Default handoff window</span>
          <span
            role="spinbutton"
            aria-valuenow={settings.handoffWindowMin}
            aria-valuemin={15}
            aria-valuemax={60}
            aria-label="Default handoff window in minutes"
            tabIndex={0}
            className="kfl-focusable"
            style={styles.stepperValue}
            onKeyDown={event => {
              if (event.key === 'ArrowUp') stepWindow(15);
              if (event.key === 'ArrowDown') stepWindow(-15);
            }}>
            {settings.handoffWindowMin} min
          </span>
          <span style={styles.stepperTrack}>
            <button
              type="button"
              className="kfl-btn kfl-focusable"
              style={{...styles.stepperHalf, ...(settings.handoffWindowMin <= 15 ? {opacity: 0.35} : null)}}
              disabled={settings.handoffWindowMin <= 15}
              aria-label="Decrease handoff window"
              onClick={() => stepWindow(-15)}>
              −
            </button>
            <span style={styles.stepperRule} aria-hidden />
            <button
              type="button"
              className="kfl-btn kfl-focusable"
              style={{...styles.stepperHalf, ...(settings.handoffWindowMin >= 60 ? {opacity: 0.35} : null)}}
              disabled={settings.handoffWindowMin >= 60}
              aria-label="Increase handoff window"
              onClick={() => stepWindow(15)}>
              +
            </button>
          </span>
        </div>
      </div>
    </>
  );

  // SHEET BODIES --------------------------------------------------------

  const renderSheetBody = () => {
    if (store.sheet?.kind === 'gap') {
      const gap = gaps[0];
      return (
        <>
          {gap != null ? (
            <>
              <div style={styles.sheetMetaRow}>
                <span style={styles.sheetMetaLabel}>When</span>
                <span>
                  {fmtTime(gap.startMin)}–{fmtTime(gap.endMin)}
                </span>
              </div>
              <div style={styles.rowDivider} />
              <p style={{fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5}}>
                {pickupDriver.name} covers Zoe and Theo from 3:00 to dinner at 6:30, but{' '}
                {events.find(event => event.id === gap.eventId)?.title} runs {fmtTime(gap.startMin)}–
                {fmtTime(gap.endMin)}. Reassign the pickup or move the meeting to close the gap.
              </p>
            </>
          ) : (
            <p style={{fontSize: 13, color: 'var(--color-text-secondary)'}}>Coverage looks solid — no gaps today.</p>
          )}
          <button
            type="button"
            className="kfl-btn kfl-focusable"
            style={styles.reassignBtn}
            onClick={event => openActionSheet('reassign', event.currentTarget)}>
            Reassign the 3:00 pickup…
          </button>
        </>
      );
    }
    if (sheetEvent == null) return null;
    const participants = participantsOf(sheetEvent);
    return (
      <>
        <div style={styles.sheetMetaRow}>
          <span style={styles.sheetMetaLabel}>When</span>
          <span>
            {fmtTime(sheetEvent.startMin)}–{fmtTime(sheetEvent.endMin)}
          </span>
        </div>
        {sheetEvent.place != null ? (
          <>
            <div style={styles.rowDivider} />
            {/* H2's place string truncates HERE only (stress fixture 1). */}
            <div style={styles.sheetMetaRow}>
              <span style={styles.sheetMetaLabel}>Where</span>
              <span style={{minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {sheetEvent.place}
              </span>
            </div>
          </>
        ) : null}
        <div style={styles.rowDivider} />
        <div style={styles.sheetMetaRow}>
          <span style={styles.sheetMetaLabel}>Who</span>
          <span style={{display: 'flex', gap: 6}}>
            {participants.map(memberId => (
              <MemberAvatar key={memberId} memberId={memberId} size={styles.avatar28} />
            ))}
          </span>
        </div>
        {sheetEvent.kind === 'handoff' ? (
          <>
            <div style={styles.rowDivider} />
            <div style={styles.driverRow}>
              <MemberAvatar memberId={sheetEvent.driverId as MemberId} size={styles.avatar28} />
              <span style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2}}>
                <span style={styles.driverName}>{MEMBER_BY_ID[sheetEvent.driverId as MemberId].name} drives</span>
                {sheetEventConflicted ? (
                  <span style={styles.conflictCaption}>Conflicts with Design sync</span>
                ) : sheetEvent.custody === 'pickup' && gaps.length > 0 ? (
                  <span style={styles.gapCaption}>
                    Coverage gap {fmtTime(gaps[0].startMin)}–{fmtTime(gaps[0].endMin)} (
                    {events.find(event => event.id === gaps[0].eventId)?.title})
                  </span>
                ) : null}
              </span>
            </div>
            {sheetEvent.custody === 'pickup' ? (
              <button
                type="button"
                className="kfl-btn kfl-focusable"
                style={styles.reassignBtn}
                onClick={event => openActionSheet('reassign', event.currentTarget)}>
                Reassign to…
              </button>
            ) : null}
          </>
        ) : null}
      </>
    );
  };

  const sheetTitle =
    store.sheet?.kind === 'gap' ? 'Coverage gap' : sheetEvent != null ? sheetEvent.title : '';

  const actionRows =
    store.actionSheet?.kind === 'resolve'
      ? [
          {id: 'priya', label: 'Priya drives (keep)', onPick: () => chooseDriver('priya')},
          {id: 'marcus', label: 'Marcus drives', onPick: () => chooseDriver('marcus')},
        ]
      : [
          {
            id: 'priya',
            label: \`Priya\${conflictsFor(events.map(event => (event.id === pickup.id ? {...event, driverId: 'priya' as MemberId} : event))).length > 0 ? ' (has a conflict)' : ' (free)'}\`,
            onPick: () => chooseDriver('priya'),
          },
          {id: 'marcus', label: 'Marcus (free)', onPick: () => chooseDriver('marcus')},
        ];
  const actionContext =
    store.actionSheet?.kind === 'resolve'
      ? 'This pickup conflicts with Design sync'
      : 'Who drives the 3:00 school pickup?';

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(overlayOpen ? styles.shellLocked : null),
    ...(isDesktopColumn ? styles.shellDesktop : null),
  };

  const navTitle = store.tab === 'today' ? activeDay.navTitle : TAB_DEFS.find(tab => tab.id === store.tab)?.label;
  const h1Text =
    store.tab === 'today' ? \`Today, \${activeDay.navTitle}\` : \`\${TAB_DEFS.find(tab => tab.id === store.tab)?.label}\`;

  const toastNode =
    store.toast != null ? (
      <div key={store.toast.seq} style={styles.toast} className="kfl-fade">
        <span style={styles.toastMsg}>{store.toast.msg}</span>
        {store.toast.undo != null ? (
          <>
            <span style={styles.toastRule} aria-hidden />
            <button type="button" className="kfl-btn kfl-focusable" style={styles.toastUndo} onClick={undoToast}>
              Undo
            </button>
          </>
        ) : null}
      </div>
    ) : null;

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{KFL_CSS}</style>
      <div style={shellStyle}>
        <div style={styles.headerBlock}>
          <header style={styles.navBar}>
            <div style={styles.navLeading}>
              <KinloopMark />
            </div>
            <p style={styles.navTitle}>{navTitle}</p>
            <div style={styles.navTrailing}>
              <button
                type="button"
                className="kfl-btn kfl-focusable"
                style={styles.iconBtn}
                aria-label={store.refreshing ? 'Finish refresh' : 'Refresh'}
                onClick={pressRefresh}>
                <Icon icon={RefreshCwIcon} size="md" color="inherit" />
              </button>
            </div>
          </header>
          {store.tab === 'today' ? (
            <DateScrubber
              activeDayId={store.dayId}
              jun12Status={jun12Status}
              onSelectDay={selectDay}
              onOpenPeople={() => selectTab('people')}
            />
          ) : null}
        </div>

        <main style={styles.main}>
          <h1 className="kfl-vh">{h1Text}</h1>
          {store.tab === 'today' ? renderToday() : null}
          {store.tab === 'week' ? renderWeek() : null}
          {store.tab === 'people' ? renderPeople() : null}
          {store.tab === 'settings' ? renderSettings() : null}
          <div style={{height: 24}} aria-hidden />
        </main>

        {/* TOAST DOCK — the ONE polite live region. Sticky-in-flow above
            the tabBar normally; shell-absolute z42 while scroll-locked so
            the reassign toast clears the medium-detent sheet (documented
            exception — stress fixture 6). */}
        {!overlayOpen ? (
          <div style={styles.toastDockSticky} aria-live="polite" role="status">
            {toastNode}
          </div>
        ) : null}

        <nav style={styles.tabBar} aria-label="Kinloop tabs">
          {TAB_DEFS.map(tab => {
            const isActive = tab.id === store.tab;
            return (
              <button
                key={tab.id}
                type="button"
                className="kfl-btn kfl-focusable"
                style={{
                  ...styles.tabItem,
                  ...(isActive ? {color: 'var(--color-brand)'} : null),
                }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={
                  tab.id === 'people' && badgeCount != null
                    ? \`People, \${badgeMember?.name} now drives \${badgeCount}\`
                    : tab.label
                }
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="md" color="inherit" />
                  {tab.id === 'people' && badgeCount != null ? (
                    <span style={styles.tabBadge}>{badgeCount}</span>
                  ) : null}
                </span>
                <span style={{...styles.tabLabel, fontWeight: isActive ? 600 : 500}}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {overlayOpen ? (
          <div
            style={styles.sheetScrim}
            onClick={() => (store.actionSheet != null ? closeActionSheet() : closeSheet())}
            aria-hidden
          />
        ) : null}
        {store.sheet != null ? (
          <Sheet
            titleId="kfl-sheet-title"
            title={sheetTitle}
            detent={store.sheet.detent}
            onDetentChange={detent =>
              patch({sheet: store.sheet != null ? {...store.sheet, detent} : null})
            }
            onClose={closeSheet}
            sheetRef={sheetRef}
            reducedMotion={reducedMotion}>
            {renderSheetBody()}
          </Sheet>
        ) : null}
        {store.actionSheet != null ? (
          <KinActionSheet
            contextText={actionContext}
            rows={actionRows}
            onCancel={closeActionSheet}
            cancelRef={actionCancelRef}
            wrapRef={actionWrapRef}
          />
        ) : null}

        {/* Locked-shell toast dock (absolute, z42, above scrim+sheet). */}
        {overlayOpen ? (
          <div style={styles.toastDockLocked} aria-live="polite" role="status">
            {toastNode}
          </div>
        ) : null}
      </div>
    </div>
  );
}
`;export{e as default};