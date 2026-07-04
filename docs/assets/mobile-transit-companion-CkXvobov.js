var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Wayline transit network at the
 *   suite "now" anchor NOW_LABEL = '7:59 AM': twelve departures across two
 *   stops (Cedar Junction 8, Alder & 3rd 4) with dual fields per pill
 *   (clock '8:02' + mins 3, every mins value = clock − 7:59), a six-line
 *   roster, two resting service alerts, three saved rows, and the seven-stop
 *   Line 4 strand (8:02 → 8:14, Willow Park skipped). No Date.now(), no
 *   Math.random(), no network assets — every countdown is a fixed string.
 * @output Wayline — Transit Companion, a maps-free MOBILE surface: sticky
 *   52px navBar (stop name + RefreshCw) over inset-grouped headsign
 *   departure boards whose trailing rails are 64x48 tabular-nums countdown
 *   pills with embedded 3-cell crowd meters; a 64px 4-tab tabBar
 *   (Nearby / Lines / Saved / Alerts-with-badge). Tapping a departure opens
 *   a bottom sheet; the 48px 'Start trip' flips ONE trip state that
 *   reshapes four surfaces at once — the sheet expands to the large detent
 *   with the LineStrand stop spine, the navBar swaps to a Line 4 badge +
 *   'ETA 8:14 / to Fern St', the Alerts badge grows 2 → 3 with a reroute
 *   advisory, and the deterministic 'Next stop' stepper advances the strand
 *   bead stop-by-stop ('Two stops to Fern St' announced politely).
 *   'End trip' restores all four.
 * @position Page template; emitted by \`astryx template mobile-transit-companion\`
 *
 * Frame: MOBILE KIT shell contract — the 390px stage IS the phone viewport.
 *   Root \`shell\` {position:'relative', flex column, width:'100%',
 *   minHeight:'100dvh', overflowX:'clip'}; NO simulated OS chrome (no 9:41,
 *   no notch, no home indicator); the navBar at y=0 is the first pixel.
 *   All overlays (scrim, sheet, menu) are absolute-in-shell — never fixed.
 *   While the sheet is open the shell locks to {height:'100dvh',
 *   overflow:'hidden'}. Page scroll belongs to the demo's .preview-wrap;
 *   the ONE legal inner scroller is the open sheet's content.
 * Container policy: mobile inset-grouped language — \`listCard\` cards inset
 *   by the 16px gutter with 1px \`rowDivider\` hairlines (inset 16, 68 after
 *   a leading badge, none on the last row). No Layout/LayoutPanel; the kit
 *   vocabulary (shell, navBar, tabBar, tabItem, sheetScrim, sheet,
 *   sheetGrabber, listCard, row, rowDivider, sectionHeader) is the frame.
 * Color policy: token-pure chrome. ONE quarantined brand pair
 *   BRAND_ACCENT = light-dark(#0F766E, #5EEAD4) — the Wayline teal —
 *   appears exactly once; text over it uses BRAND_ON
 *   (white on #0F766E = 6.0:1 ✓ light; #04211E on #5EEAD4 ≈ 10:1 ✓ dark).
 *   Non-brand line badges use data-categorical tints at 18% wash with
 *   default-token text (contrast = body text, no new hexes). Scrim rgba
 *   pair per the kit foundations. Transitions animate transform/opacity
 *   only and collapse under prefers-reduced-motion (pulse → static dot,
 *   sheet slide → fade).
 *
 * Mobile density grid (verbatim): 16px screen inset · 12px between stacked
 *   cards · 24px between sections · 8px between chips/pills. navBar 52px
 *   content row (paddingInline 8, grid '1fr auto 1fr', 17px/600 title,
 *   44x44 trailing RefreshCw; blur surface + hairline ALWAYS ON — no
 *   scroll wiring, compact title always visible). tabBar exactly 64px,
 *   4 tabItems flex:1, 24px icon over 11px/500 label, 4px gap. Rows: 44px
 *   utility, 60px two-line (16px/500 + 13px/400, 2px gap). departureBoard:
 *   52px header row (28x28 line badge r8, headsign 16px/600) + 64px pill
 *   rail (gap 8, paddingInline 16, paddingBottom 12); countdown pills
 *   64x48 buttons r12, '3 min' 16px/700 tabular-nums over a 3-cell
 *   7x9px crowd meter (gap 2, r2, 4px gap). lineStrand rows 56px served /
 *   44px skipped; rail 3px at left:14; beads 12px (10px hollow skipped,
 *   16px current + 3px ring). Buttons: 48px full-width primary, 36px
 *   inline secondary, 44x44 icon buttons, all r12. Type scale: 22px/700 ·
 *   17px/600 · 16px/400-500 · 13px · 11px/500 floor; countdowns/times
 *   tabular-nums. Touch: every target ≥44x44 with ≥8px clearance.
 *
 * Responsive contract:
 * - Authored at 390; zero \`width: 390\` literals — clean from 320–430px.
 *   Pill rails are the only horizontal scrollers (overflowX auto,
 *   scrollSnapType 'x proximity', 24px next-pill peek at 320); headsigns
 *   and nav titles ellipsize (Line 22's 'Riverside–Eastbank Industrial
 *   Park via Old Mill Rd' is the proof fixture).
 * - Desktop stage (~1045px demo container): measured via the
 *   useElementWidth ResizeObserver on the shell's wrapper (viewport query
 *   only as first-frame fallback); width > 560px renders a CENTERED PHONE
 *   COLUMN — shell maxWidth 430, borderInline hairlines, muted backdrop.
 *   All sticky/absolute geometry stays anchored inside the shell. No
 *   multi-pane adaptation: the chrome-reshaping trip mode is the point.
 *
 * Gesture law: every gesture ships its visible button path — Saved rows
 *   swipe to reveal Remove AND carry a 44x44 ellipsis opening the same
 *   action as an anchored menu; the sheet's grabber is a real button that
 *   toggles medium/large detents; refresh is an explicit navBar button
 *   (pull-to-refresh banned). Escape closes the topmost layer only
 *   (anchored menu → sheet); focus moves into the sheet on open and
 *   restores to the opener on every close path.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';

import {
  BellIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronRightIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  RouteIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark pair.
// ---------------------------------------------------------------------------

// THE one quarantined brand pair — Wayline teal. Appears exactly once.
const BRAND_ACCENT = 'light-dark(#0F766E, #5EEAD4)';
// Text over the brand fill. Contrast math: white on #0F766E = 6.0:1 ✓
// (light scheme); #04211E on #5EEAD4 ≈ 10:1 ✓ (dark scheme).
const BRAND_ON = 'light-dark(#FFFFFF, #04211E)';
// Brand washes derive from the pair via color-mix — no additional hexes.
const BRAND_SOFT = \`color-mix(in srgb, \${BRAND_ACCENT} 14%, transparent)\`;
const BRAND_EDGE = \`color-mix(in srgb, \${BRAND_ACCENT} 55%, transparent)\`;
// Kit-standard sheet scrim pair (mobile foundations token).
const SCRIM = 'light-dark(rgba(21,17,12,0.32), rgba(0,0,0,0.55))';
// Non-brand line-badge tints: categorical tokens at an 18% wash with
// default-token text on top (contrast = body text; no new hex literals).
const TINT_BLUE =
  'color-mix(in srgb, var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF)) 18%, transparent)';
const TINT_PURPLE =
  'color-mix(in srgb, var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF)) 18%, transparent)';
const TINT_ORANGE =
  'color-mix(in srgb, var(--color-data-categorical-orange, light-dark(#D96C0B, #FFB03A)) 18%, transparent)';
const TINT_GREEN =
  'color-mix(in srgb, var(--color-data-categorical-green, light-dark(#0B991F, #34C759)) 18%, transparent)';
const INFO_DOT = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';

// Nav/tab blur surface — kit contract, always on (no scroll wiring; the
// compact title is always visible, no large-title row).
const CHROME_SURFACE = 'color-mix(in srgb, var(--color-background-body) 86%, transparent)';

// ---------------------------------------------------------------------------
// KEYFRAMES + PSEUDO-STATE CSS — inline CSSProperties cannot express
// :focus-visible, @keyframes, or hover guards; this one <style> block owns
// them, scoped under .wayline-shell. Hover is enhancement only (canHover
// guard) — nothing is gated on it.
// ---------------------------------------------------------------------------

const WAYLINE_CSS = \`
@keyframes wayline-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
@keyframes wayline-sheet-up {
  from { transform: translateY(24px); opacity: 0.4; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes wayline-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
.wayline-shell button:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}
@media (hover: hover) {
  .wayline-shell .wayline-hoverable:hover {
    background-color: color-mix(in srgb, var(--color-text-primary) 5%, transparent);
  }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — kit vocabulary names are binding: shell, navBar, tabBar, tabItem,
// sheetScrim, sheet, sheetGrabber, listCard, row, rowDivider, sectionHeader.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Desktop-stage wrapper: >560px measured width centers the phone column.
  stageOuter: {width: '100%'},
  stageCenter: {
    display: 'flex',
    justifyContent: 'center',
    background: 'var(--color-background-muted)',
  },
  // THE SHELL — full-bleed to the stage's clipped 16px corners; draws no
  // radius of its own; position:relative anchors every overlay.
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
  shellCentered: {
    maxWidth: 430,
    marginInline: 'auto',
    borderInline: '1px solid var(--color-border)',
  },
  // Scroll lock while a sheet is open — overlays anchor to the visible
  // screen instead of the full document height.
  shellLocked: {height: '100dvh', overflow: 'hidden'},
  // NAV BAR — 52px content row, three-zone grid, blur surface always on.
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    height: 52,
    paddingInline: 8,
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
  },
  navSlotLead: {display: 'flex', justifyContent: 'flex-start'},
  navSlotTrail: {display: 'flex', justifyContent: 'flex-end'},
  navIconBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    padding: 0,
    border: 'none',
    borderRadius: 12,
    background: 'transparent',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
  },
  navStaticSlot: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  navTitle: {
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
    lineHeight: '22px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  navTitleStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    minWidth: 0,
  },
  navOverline: {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: '14px',
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  navEta: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: '20px',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Body block — natural flow; the demo's .preview-wrap owns page scroll.
  body: {display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: 24},
  // 13px caption row under the navBar (role=status refresh target).
  statusCaption: {
    paddingInline: 16,
    paddingTop: 12,
    fontSize: 13,
    lineHeight: '18px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SECTION HEADER — 13px/600 uppercase, 32px from the stage edge is the
  // in-card text line; the header itself sits at the 16px gutter.
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
    paddingInline: 16,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  // LIST CARD — inset-grouped list language.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGap: {height: 12},
  // ROW DIVIDER — 1px hairline, inset 16 (68 after a leading 28px badge
  // + 16px padding + 12px gap + 12 optical).
  rowDivider: {height: 1, background: 'var(--color-border)', marginLeft: 16},
  rowDividerInset: {height: 1, background: 'var(--color-border)', marginLeft: 68},
  // DEPARTURE BOARD — 52px header row (full-row button target).
  boardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    height: 52,
    paddingInline: 16,
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  boardHeadsign: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 600,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  boardMeta: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // PILL RAIL — 64px lane; the ONLY horizontal scrollers on the page.
  pillRail: {
    display: 'flex',
    gap: 8,
    height: 64,
    alignItems: 'flex-start',
    paddingInline: 16,
    paddingBottom: 12,
    overflowX: 'auto',
    scrollSnapType: 'x proximity',
    scrollPaddingInline: 16,
  },
  // COUNTDOWN PILL — 64x48 button; soonest = brand fill; later = muted.
  pill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 64,
    height: 48,
    paddingInline: 8,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    border: '1px solid transparent',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
  },
  pillSoon: {background: BRAND_ACCENT, color: BRAND_ON},
  pillBoarded: {
    background: BRAND_SOFT,
    border: \`2px solid \${BRAND_ACCENT}\`,
    color: 'var(--color-text-primary)',
  },
  pillMinsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 16,
    fontWeight: 700,
    lineHeight: '18px',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  pillStruck: {
    fontSize: 13,
    fontWeight: 400,
    textDecoration: 'line-through',
    color: 'var(--color-text-secondary)',
  },
  pillDelay: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-error)',
    whiteSpace: 'nowrap',
  },
  pillBottomRow: {display: 'flex', alignItems: 'center', gap: 6},
  pulseDot: {width: 6, height: 6, borderRadius: '50%', background: BRAND_ON},
  boardedLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px'},
  // CROWD METER — 3 person-cells, 7x9 each, gap 2, r2. Never standalone:
  // always inside a ≥44px parent target.
  crowdRow: {display: 'flex', gap: 2},
  crowdCell: {width: 7, height: 9, borderRadius: 2},
  // ROWS — 44px utility, 60px two-line.
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    minHeight: 44,
    paddingInline: 16,
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  rowTwoLine: {minHeight: 60, paddingBlock: 8},
  rowTextStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowSecondary: {
    fontSize: 13,
    fontWeight: 400,
    lineHeight: '17px',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowTrailing: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
  },
  // LINE BADGE — 28x28, r8, 13px/700 number.
  lineBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  // SAVED swipe rows.
  savedRowWrap: {position: 'relative', overflow: 'hidden'},
  savedRowInner: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    background: 'var(--color-background-card)',
    transition: 'transform 160ms ease',
    touchAction: 'pan-y',
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    border: 'none',
    background: 'var(--color-error)',
    color: 'light-dark(#FFFFFF, #1A0505)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  ellipsisBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    flexShrink: 0,
    padding: 0,
    border: 'none',
    borderRadius: 12,
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  // Anchored menu (the swipe action's keyboard path).
  menuCard: {
    position: 'absolute',
    right: 12,
    zIndex: 30,
    minWidth: 200,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'hidden',
  },
  menuRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    height: 44,
    paddingInline: 16,
    border: 'none',
    background: 'transparent',
    color: 'var(--color-error)',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
  },
  // Saved empty state.
  emptyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginInline: 16,
    padding: '32px 16px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    textAlign: 'center',
  },
  emptyTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    marginBottom: 4,
  },
  emptyTitle: {fontSize: 16, fontWeight: 600, lineHeight: '20px'},
  emptyHint: {fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '18px'},
  // ALERTS.
  alertRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    width: '100%',
    minHeight: 52,
    paddingInline: 4,
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  severitySlot: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    flexShrink: 0,
  },
  severityDot: {width: 8, height: 8, borderRadius: '50%'},
  alertTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
  },
  alertBody: {
    padding: '0 16px 12px 48px',
    fontSize: 13,
    fontWeight: 400,
    lineHeight: '18px',
    color: 'var(--color-text-secondary)',
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
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  tabItemActive: {color: BRAND_ACCENT},
  tabIconWrap: {position: 'relative', display: 'inline-flex'},
  tabLabel: {fontSize: 11, fontWeight: 500, lineHeight: '13px', whiteSpace: 'nowrap'},
  tabLabelActive: {fontWeight: 600},
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    paddingInline: 4,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 10,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // LIVE REGION toast — sticky-in-flow (height 0) so it pins 76px above
  // the viewport bottom even mid-scroll; absolute-in-shell would anchor to
  // the document bottom on long tabs. Always mounted for aria-live.
  toastAnchor: {
    position: 'sticky',
    bottom: 76,
    zIndex: 45,
    height: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastPill: {
    position: 'absolute',
    bottom: 0,
    maxWidth: 'calc(100% - 48px)',
    paddingInline: 16,
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 999,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Resume pill — appears bottom-right while a trip runs with the sheet
  // collapsed; sticky (not absolute) for the same document-height reason.
  resumeAnchor: {
    position: 'sticky',
    bottom: 80,
    zIndex: 30,
    height: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    paddingInline: 16,
  },
  resumeBtn: {
    position: 'absolute',
    bottom: 0,
    right: 16,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingInline: 16,
    border: 'none',
    borderRadius: 999,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontVariantNumeric: 'tabular-nums',
  },
  // SHEET.
  sheetScrim: {position: 'absolute', inset: 0, background: SCRIM, zIndex: 40},
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
  sheetMedium: {height: '55%'},
  sheetLarge: {height: 'calc(100% - 56px)'},
  sheetGrabberZone: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 24,
    paddingTop: 8,
    width: '100%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    flexShrink: 0,
  },
  sheetGrabber: {width: 36, height: 5, borderRadius: 999, background: 'var(--color-border)'},
  sheetHeader: {
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    height: 52,
    paddingInline: 8,
    flexShrink: 0,
  },
  sheetTitle: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 600,
    lineHeight: '22px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sheetSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    marginTop: -4,
    paddingInline: 52,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // The ONE legal inner scroller.
  sheetContent: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 16px 16px'},
  sheetFooter: {
    display: 'flex',
    gap: 8,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
    background: CHROME_SURFACE,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    flexShrink: 0,
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    border: 'none',
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  secondaryBtn: {
    height: 36,
    paddingInline: 16,
    alignSelf: 'center',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  // Sheet preview blocks.
  previewSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: 'var(--color-background-muted)',
    borderRadius: 12,
  },
  legendCard: {
    marginTop: 12,
    padding: '12px 16px',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  legendLine: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  legendRow: {display: 'flex', alignItems: 'center', gap: 10, fontSize: 13},
  delayNote: {
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--color-error)',
  },
  // LINE STRAND.
  strandList: {listStyle: 'none', margin: 0, padding: 0, position: 'relative'},
  strandRow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 56,
  },
  strandRowSkipped: {height: 44},
  strandRailCol: {
    position: 'relative',
    width: 32,
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  strandBead: {
    position: 'absolute',
    left: 14 + 1.5 - 6,
    top: '50%',
    marginTop: -6,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: 'var(--color-border)',
  },
  strandBeadDone: {background: BRAND_ACCENT},
  strandBeadCurrent: {
    left: 14 + 1.5 - 8,
    marginTop: -8,
    width: 16,
    height: 16,
    background: BRAND_ACCENT,
    boxShadow: \`0 0 0 3px \${BRAND_SOFT}\`,
  },
  strandBeadSkipped: {
    left: 14 + 1.5 - 5,
    marginTop: -5,
    width: 10,
    height: 10,
    background: 'var(--color-background-card)',
    border: '2px solid var(--color-border)',
  },
  strandName: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  strandNameSkipped: {
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  strandTime: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ---------------------------------------------------------------------------
// DATA — the fictional Wayline network, anchored at NOW_LABEL = '7:59 AM'.
// Cross-check law: every \`mins\` equals clock − 7:59; the '12 departures'
// caption = Cedar Junction 8 (3+2+3) + Alder & 3rd 4 (2+2); the crowd
// legend 5 light · 4 moderate · 3 full sums to the same 12; the Alerts
// badge derives from the alert rows (2 resting, +1 while trip.active).
// ---------------------------------------------------------------------------

const NOW_LABEL = '7:59 AM';
const HOME_STOP = 'Cedar Junction';
const TRIP_DEST = 'Fern St';
const TRIP_ETA = '8:14';

type Crowd = 'light' | 'moderate' | 'full';

const CROWD_META: Record<Crowd, {label: string; filled: number; legend: string}> = {
  light: {label: 'Light', filled: 1, legend: 'Light — seats available'},
  moderate: {label: 'Moderate', filled: 2, legend: 'Moderate — some standing'},
  full: {label: 'Full', filled: 3, legend: 'Full — expect a squeeze'},
};

interface Departure {
  id: string;
  clock: string; // dual field: display clock time…
  mins: number; // …and minutes from 7:59 (clock − 7:59, cross-checked)
  minsLabel: string;
  crowd: Crowd;
  crowdLabel: string;
  // Delay-amendment stress fixture: scheduled 8:01 + 4 late = 8:05 ✓ (and
  // 8:05 − 7:59 = 6 min ✓).
  scheduledClock?: string;
  delayLabel?: string;
}

interface BoardGroup {
  id: string;
  stopId: 'cedar' | 'alder';
  lineId: string;
  headsign: string;
  dest: string; // short destination for sheet titles
  bay: string;
  departures: Departure[];
}

interface StopInfo {
  id: 'cedar' | 'alder';
  name: string;
  walk: string;
}

const STOPS: StopInfo[] = [
  {id: 'cedar', name: HOME_STOP, walk: '2 min walk'},
  {id: 'alder', name: 'Alder & 3rd', walk: '5 min walk'},
];

const BOARDS: BoardGroup[] = [
  {
    id: 'g-4',
    stopId: 'cedar',
    lineId: '4',
    headsign: 'Fern St via Market',
    dest: TRIP_DEST,
    bay: 'Bay A',
    departures: [
      {id: 'd-4-802', clock: '8:02', mins: 3, minsLabel: '3 min', crowd: 'moderate', crowdLabel: 'Moderate'},
      {id: 'd-4-810', clock: '8:10', mins: 11, minsLabel: '11 min', crowd: 'light', crowdLabel: 'Light'},
      {id: 'd-4-823', clock: '8:23', mins: 24, minsLabel: '24 min', crowd: 'light', crowdLabel: 'Light'},
    ],
  },
  {
    id: 'g-12',
    stopId: 'cedar',
    lineId: '12',
    headsign: 'Northgate',
    dest: 'Northgate',
    bay: 'Bay B',
    departures: [
      {
        id: 'd-12-805',
        clock: '8:05',
        mins: 6,
        minsLabel: '6 min',
        crowd: 'full',
        crowdLabel: 'Full',
        scheduledClock: '8:01',
        delayLabel: '+4 min',
      },
      {id: 'd-12-817', clock: '8:17', mins: 18, minsLabel: '18 min', crowd: 'moderate', crowdLabel: 'Moderate'},
    ],
  },
  {
    id: 'g-7',
    stopId: 'cedar',
    lineId: '7',
    headsign: 'Airport',
    dest: 'Airport',
    bay: 'Bay C',
    departures: [
      {id: 'd-7-808', clock: '8:08', mins: 9, minsLabel: '9 min', crowd: 'full', crowdLabel: 'Full'},
      {id: 'd-7-820', clock: '8:20', mins: 21, minsLabel: '21 min', crowd: 'moderate', crowdLabel: 'Moderate'},
      {id: 'd-7-832', clock: '8:32', mins: 33, minsLabel: '33 min', crowd: 'light', crowdLabel: 'Light'},
    ],
  },
  {
    id: 'g-22',
    stopId: 'alder',
    lineId: '22',
    // Long-headsign truncation stress fixture — must ellipsize at 320px
    // without pushing the pill rail.
    headsign: 'Riverside–Eastbank Industrial Park via Old Mill Rd',
    dest: 'Eastbank',
    bay: 'Bay A',
    departures: [
      {id: 'd-22-803', clock: '8:03', mins: 4, minsLabel: '4 min', crowd: 'full', crowdLabel: 'Full'},
      {id: 'd-22-815', clock: '8:15', mins: 16, minsLabel: '16 min', crowd: 'light', crowdLabel: 'Light'},
    ],
  },
  {
    id: 'g-9',
    stopId: 'alder',
    lineId: '9',
    headsign: 'Loop',
    dest: 'Loop',
    bay: 'Bay B',
    departures: [
      {id: 'd-9-811', clock: '8:11', mins: 12, minsLabel: '12 min', crowd: 'moderate', crowdLabel: 'Moderate'},
      {id: 'd-9-827', clock: '8:27', mins: 28, minsLabel: '28 min', crowd: 'light', crowdLabel: 'Light'},
    ],
  },
];

const ALL_DEPARTURES = BOARDS.flatMap(group => group.departures);
// '12 departures' caption + '5 light · 4 moderate · 3 full' legend both
// derive live from the rows (aggregates cross-check by construction).
const DEPARTURE_COUNT = ALL_DEPARTURES.length; // = 12
const CROWD_COUNTS: Record<Crowd, number> = {
  light: ALL_DEPARTURES.filter(d => d.crowd === 'light').length, // 5
  moderate: ALL_DEPARTURES.filter(d => d.crowd === 'moderate').length, // 4
  full: ALL_DEPARTURES.filter(d => d.crowd === 'full').length, // 3
};

interface LineInfo {
  id: string;
  name: string;
  route: string;
  tint: string | null; // null = brand solid (Line 4); string = 18% wash
  hasAlert: boolean;
}

// Night Owl's 'First run 11:40 PM' explains its absence from the 7:59 AM
// board; '2 with alerts' matches the two resting alert rows below.
const LINES: LineInfo[] = [
  {id: '4', name: 'Harbor', route: 'Cedar Junction → Fern St', tint: null, hasAlert: false},
  {id: '7', name: 'Foothill', route: 'Terminal Sq → Airport', tint: TINT_BLUE, hasAlert: false},
  {id: '9', name: 'Loop', route: 'Downtown circulator', tint: TINT_ORANGE, hasAlert: false},
  {id: '12', name: 'Crosstown', route: 'Westgate → Northgate', tint: TINT_PURPLE, hasAlert: true},
  {id: '22', name: 'Riverside', route: 'Riverside → Eastbank via Old Mill Rd', tint: TINT_GREEN, hasAlert: false},
  {id: '31', name: 'Night Owl', route: 'First run 11:40 PM', tint: TINT_PURPLE, hasAlert: true},
];
// Caption '6 lines · 2 with alerts': hasAlert marks 12 & 31 — exactly the
// two resting alert rows below (the Line 4 reroute exists only in trip
// mode and never counts here).

type Severity = 'warning' | 'info' | 'reroute';

interface ServiceAlert {
  id: string;
  lineId: string;
  severity: Severity;
  title: string;
  body: string;
  tripOnly?: boolean;
}

// Resting alerts = 2 → Alerts tab badge '2'; trip.active adds the Line 4
// reroute → badge '3' (2 + 1 ✓). The reroute text states the same fact the
// strand's dashed Willow Park segment draws.
const ALERTS: ServiceAlert[] = [
  {
    id: 'a-4',
    lineId: '4',
    severity: 'reroute',
    title: 'Line 4 · Express run — skipping Willow Park',
    body:
      'Your 8:02 Harbor trip is running express between Grove Ave and Delancey. ' +
      'Willow Park is not served on this run — next local departs 8:10.',
    tripOnly: true,
  },
  {
    id: 'a-12',
    lineId: '12',
    severity: 'warning',
    title: 'Line 12 · Detour via 9th Ave through Friday',
    body:
      'Water-main work on Crosstown Blvd shifts Line 12 to 9th Ave between ' +
      'Market & 5th and Northgate. Allow 4 extra minutes; the 8:01 is running +4 late today.',
  },
  {
    id: 'a-31',
    lineId: '31',
    severity: 'info',
    title: 'Line 31 · Late-night service suspended this weekend',
    body:
      'Night Owl trips after 1:00 AM are suspended Saturday and Sunday for ' +
      'terminal maintenance. Regular first run 11:40 PM is unaffected.',
  },
];

const SEVERITY_COLOR: Record<Severity, string> = {
  warning: 'var(--color-warning)',
  info: INFO_DOT,
  reroute: 'var(--color-error)',
};

interface SavedItem {
  id: string;
  kind: 'Stop' | 'Line';
  title: string;
  subtitle: string;
}

const SAVED_ITEMS: SavedItem[] = [
  {id: 'sv-cedar', kind: 'Stop', title: HOME_STOP, subtitle: 'Lines 4 · 7 · 12 · 2 min walk'},
  {id: 'sv-alder', kind: 'Stop', title: 'Alder & 3rd', subtitle: 'Lines 9 · 22 · 5 min walk'},
  {id: 'sv-line4', kind: 'Line', title: 'Line 4 Harbor', subtitle: 'Cedar Junction → Fern St'},
];

interface StrandStop {
  id: string;
  name: string;
  time: string | null; // null = the skipped stop
}

// Seven listed stops; served = 6, advances = 5; ride 8:14 − 8:02 = 12 min
// ('Arrives 8:14 · 12 min'); navBar 'ETA 8:14' equals the last strand time;
// the boarded departure is the 8:02 / 3-min pill.
const STRAND: StrandStop[] = [
  {id: 's-cedar', name: HOME_STOP, time: '8:02'},
  {id: 's-market', name: 'Market & 5th', time: '8:04'},
  {id: 's-grove', name: 'Grove Ave', time: '8:06'},
  {id: 's-willow', name: 'Willow Park', time: null}, // skipped-stop fixture
  {id: 's-delancey', name: 'Delancey', time: '8:08'},
  {id: 's-kern', name: 'Kern Plaza', time: '8:10'},
  {id: 's-fern', name: TRIP_DEST, time: '8:14'},
];
const SERVED_STRAND_INDEXES = STRAND.flatMap((stop, index) =>
  stop.time != null ? [index] : [],
); // [0,1,2,4,5,6] — six served stops, five advances

const BOARDED_DEPARTURE_ID = 'd-4-802';
const TRIP_GROUP_ID = 'g-4';

// Fixed stepper announcements (Willow Park not counted — skipped). Index
// matches trip.stopIndex after each 'Next stop' press.
const STEP_ANNOUNCEMENTS = [
  '', // index 0 — boarding, no announcement
  \`Four stops to \${TRIP_DEST}\`,
  \`Three stops to \${TRIP_DEST}\`,
  \`Two stops to \${TRIP_DEST}\`,
  \`One stop to \${TRIP_DEST}\`,
  \`Arrived at \${TRIP_DEST}\`,
];
const LAST_STOP_INDEX = SERVED_STRAND_INDEXES.length - 1; // 5

const LINE_BY_ID = new Map(LINES.map(line => [line.id, line]));
const GROUP_BY_DEPARTURE = new Map(
  BOARDS.flatMap(group => group.departures.map(dep => [dep.id, group] as const)),
);
const DEPARTURE_BY_ID = new Map(ALL_DEPARTURES.map(dep => [dep.id, dep]));

// ---------------------------------------------------------------------------
// SMALL COMPONENTS
// ---------------------------------------------------------------------------

/**
 * WaylineMark — stroke-only brand glyph: three route strands converging
 * rightward into one arrowhead. Stroked in the brand accent at opacity
 * 1 / 0.62 / 0.34; decorative (aria-hidden) inside a labeled 44x44 slot.
 */
function WaylineMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 7 H12 C15 7 17 9 19 11"
        stroke={BRAND_ACCENT}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={1}
      />
      <path d="M3 12 H16" stroke={BRAND_ACCENT} strokeWidth={2} strokeLinecap="round" opacity={0.62} />
      <path
        d="M3 17 H12 C15 17 17 15 19 13"
        stroke={BRAND_ACCENT}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.34}
      />
      <path
        d="M17 9 L21 12 L17 15"
        stroke={BRAND_ACCENT}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * LineBadge — 28x28 rounded-8 tile. Line 4 = the brand fill with the
 * explicit BRAND_ON text pair; other lines = categorical 18% washes with
 * default-token text (contrast = body text, no new hexes).
 */
function LineBadge({lineId}: {lineId: string}) {
  const line = LINE_BY_ID.get(lineId);
  const isBrand = line?.tint == null;
  return (
    <span
      style={{
        ...styles.lineBadge,
        background: isBrand ? BRAND_ACCENT : line?.tint ?? 'var(--color-background-muted)',
        color: isBrand ? BRAND_ON : 'var(--color-text-primary)',
      }}
      aria-hidden>
      {lineId}
    </span>
  );
}

/**
 * CrowdMeter — three 7x9 person-cells, 1–3 filled = Light/Moderate/Full.
 * Count encodes the level (brand fill, never a red ramp); the text label
 * travels in the parent's aria-label and the sheet legend. Never rendered
 * as a standalone control — always inside a ≥44px parent target.
 */
function CrowdMeter({crowd, onBrand}: {crowd: Crowd; onBrand: boolean}) {
  const filled = CROWD_META[crowd].filled;
  const fillColor = onBrand ? BRAND_ON : BRAND_ACCENT;
  const emptyColor = onBrand
    ? \`color-mix(in srgb, \${BRAND_ON} 35%, transparent)\`
    : 'var(--color-border)';
  return (
    <span style={styles.crowdRow} aria-hidden>
      {[0, 1, 2].map(cell => (
        <span
          key={cell}
          style={{...styles.crowdCell, background: cell < filled ? fillColor : emptyColor}}
        />
      ))}
    </span>
  );
}

interface CountdownPillProps {
  group: BoardGroup;
  departure: Departure;
  isSoonest: boolean;
  isBoarded: boolean;
  isMotionReduced: boolean;
  onOpen: (departureId: string) => void;
}

/**
 * CountdownPill — 64x48 button (min-width; the delayed pill grows for its
 * strikethrough amendment). Soonest pill is brand-filled with a 6px
 * pulsing dot — static filled dot under prefers-reduced-motion. Boarded
 * state (trip.active on the 8:02) = brand outline + check.
 */
function CountdownPill({
  group,
  departure,
  isSoonest,
  isBoarded,
  isMotionReduced,
  onOpen,
}: CountdownPillProps) {
  const pillStyle: CSSProperties = isBoarded
    ? {...styles.pill, ...styles.pillBoarded}
    : isSoonest
      ? {...styles.pill, ...styles.pillSoon}
      : styles.pill;
  const name =
    \`Line \${group.lineId} to \${group.dest}, \${departure.minsLabel.replace(' min', ' minutes')}, \` +
    \`\${departure.crowdLabel.toLowerCase()} crowding\` +
    (departure.scheduledClock != null
      ? \`, delayed from \${departure.scheduledClock}\`
      : '') +
    (isBoarded ? ', boarded' : '');
  return (
    <button type="button" style={pillStyle} aria-label={name} onClick={() => onOpen(departure.id)}>
      <span style={styles.pillMinsRow}>
        {isBoarded ? (
          <Icon icon={CheckIcon} size="xsm" color="inherit" />
        ) : isSoonest ? (
          <span
            style={{
              ...styles.pulseDot,
              animation: isMotionReduced ? undefined : 'wayline-pulse 1.6s ease-in-out infinite',
            }}
            aria-hidden
          />
        ) : null}
        {departure.scheduledClock != null ? (
          // On the brand-filled soonest pill the struck time inherits
          // BRAND_ON at reduced opacity (secondary grey fails on teal).
          <s
            style={
              isSoonest
                ? {...styles.pillStruck, color: 'inherit', opacity: 0.72}
                : styles.pillStruck
            }>
            {departure.scheduledClock}
          </s>
        ) : null}
        {departure.minsLabel}
      </span>
      {isBoarded ? (
        <span style={styles.boardedLabel}>Boarded</span>
      ) : (
        <span style={styles.pillBottomRow}>
          <CrowdMeter crowd={departure.crowd} onBrand={isSoonest} />
          {departure.delayLabel != null ? (
            <span style={{...styles.pillDelay, color: isSoonest ? BRAND_ON : 'var(--color-error)'}}>
              {departure.delayLabel}
            </span>
          ) : null}
        </span>
      )}
    </button>
  );
}

interface DepartureBoardProps {
  group: BoardGroup;
  boardedId: string | null;
  isMotionReduced: boolean;
  onOpen: (departureId: string) => void;
}

/**
 * DepartureBoard — 52px header row (LineBadge + headsign + bay meta, a
 * full-row button opening the soonest departure's preview) over the 64px
 * pill rail. Rails scroll horizontally with a next-pill peek at 320px and
 * ArrowLeft/Right moves focus between pills.
 */
function DepartureBoard({group, boardedId, isMotionReduced, onOpen}: DepartureBoardProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const onRailKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const rail = railRef.current;
    if (rail == null) return;
    const pills = Array.from(rail.querySelectorAll<HTMLButtonElement>('button'));
    const current = pills.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    const next = event.key === 'ArrowRight' ? current + 1 : current - 1;
    if (next >= 0 && next < pills.length) {
      event.preventDefault();
      pills[next].focus();
      pills[next].scrollIntoView({block: 'nearest', inline: 'nearest'});
    }
  };
  return (
    <div>
      <button
        type="button"
        className="wayline-hoverable"
        style={styles.boardHeader}
        aria-label={\`Line \${group.lineId} to \${group.headsign}, next \${group.departures[0].minsLabel}\`}
        onClick={() => onOpen(group.departures[0].id)}>
        <LineBadge lineId={group.lineId} />
        <span style={styles.boardHeadsign}>{group.headsign}</span>
        <span style={styles.boardMeta}>{group.bay}</span>
      </button>
      <div
        ref={railRef}
        style={styles.pillRail}
        role="group"
        aria-label={\`Line \${group.lineId} departures\`}
        onKeyDown={onRailKeyDown}>
        {group.departures.map((departure, index) => (
          <CountdownPill
            key={departure.id}
            group={group}
            departure={departure}
            isSoonest={index === 0 && departure.id !== boardedId}
            isBoarded={departure.id === boardedId}
            isMotionReduced={isMotionReduced}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}

interface LineStrandProps {
  stopIndex: number; // 0..5 over served stops
}

/**
 * LineStrand — vertical stop spine: 3px rail at left:14 behind an <ol>;
 * 12px beads (traversed = brand), 16px current bead + 3px halo with
 * aria-current="step"; Willow Park = dashed rail span, 10px hollow bead,
 * 44px row, italic 'Express — skips this stop'; trailing times
 * tabular-nums. The strand IS the canvas — no map placeholder.
 */
function LineStrand({stopIndex}: LineStrandProps) {
  const currentStrandIndex = SERVED_STRAND_INDEXES[stopIndex];
  return (
    <ol
      style={styles.strandList}
      aria-label={\`Route to \${TRIP_DEST}, 6 stops, Willow Park skipped\`}>
      {STRAND.map((stop, index) => {
        const isSkipped = stop.time == null;
        const isLast = index === STRAND.length - 1;
        const isDone = !isSkipped && index < currentStrandIndex;
        const isCurrent = index === currentStrandIndex;
        const segmentTraversed = index < currentStrandIndex;
        const beadStyle: CSSProperties = isSkipped
          ? {...styles.strandBead, ...styles.strandBeadSkipped}
          : isCurrent
            ? {...styles.strandBead, ...styles.strandBeadCurrent}
            : isDone
              ? {...styles.strandBead, ...styles.strandBeadDone}
              : styles.strandBead;
        return (
          <li
            key={stop.id}
            style={isSkipped ? {...styles.strandRow, ...styles.strandRowSkipped} : styles.strandRow}
            aria-current={isCurrent ? 'step' : undefined}>
            <span style={styles.strandRailCol} aria-hidden>
              {!isLast ? (
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    width: 3,
                    top: '50%',
                    // Rows differ in height (56 vs 44) so '-50%' slightly
                    // overlaps the next segment — a continuous line either way.
                    bottom: '-50%',
                    // Dashed segment = the express skip, the same fact the
                    // reroute alert states in words.
                    background:
                      isSkipped || STRAND[index + 1].time == null
                        ? \`repeating-linear-gradient(to bottom, \${
                            segmentTraversed ? BRAND_EDGE : 'var(--color-border)'
                          } 0 5px, transparent 5px 10px)\`
                        : segmentTraversed
                          ? BRAND_ACCENT
                          : 'var(--color-border)',
                  }}
                />
              ) : null}
              <span style={beadStyle} />
            </span>
            <span
              style={
                isSkipped
                  ? {...styles.strandName, ...styles.strandNameSkipped}
                  : styles.strandName
              }>
              {stop.name}
              {isSkipped ? ' · Express — skips this stop' : ''}
            </span>
            <span style={styles.strandTime}>{stop.time ?? '—'}</span>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// useElementWidth — container-width breakpoints (the demo stage is ~1045px
// inside a 1440px window, so viewport queries never fire there).
// ---------------------------------------------------------------------------

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
// STATE — ONE state owner at the App root; every mutation flows through
// update()/setState and every flip has an observable consequence elsewhere
// (Start trip reshapes sheet + navBar + Alerts badge + the boarded pill).
// ---------------------------------------------------------------------------

type TabId = 'nearby' | 'lines' | 'saved' | 'alerts';

interface AppState {
  tab: TabId;
  trip: {active: boolean; stopIndex: number};
  sheet: null | 'preview' | 'trip';
  sheetDetent: 'medium' | 'large';
  selectedDepartureId: string | null;
  savedIds: string[];
  openSwipeRowId: string | null;
  openMenuId: string | null;
  openAlertId: string | null;
  refreshed: boolean;
  toast: string;
}

const INITIAL_STATE: AppState = {
  tab: 'nearby',
  trip: {active: false, stopIndex: 0},
  sheet: null,
  sheetDetent: 'medium',
  selectedDepartureId: null,
  savedIds: SAVED_ITEMS.map(item => item.id),
  openSwipeRowId: null,
  openMenuId: null,
  openAlertId: 'a-12',
  refreshed: false,
  toast: '',
};

const TAB_META: Array<{id: TabId; label: string; icon: typeof MapPinIcon}> = [
  {id: 'nearby', label: 'Nearby', icon: MapPinIcon},
  {id: 'lines', label: 'Lines', icon: RouteIcon},
  {id: 'saved', label: 'Saved', icon: BookmarkIcon},
  {id: 'alerts', label: 'Alerts', icon: BellIcon},
];

const NAV_TITLES: Record<TabId, string> = {
  nearby: HOME_STOP,
  lines: 'Lines',
  saved: 'Saved',
  alerts: 'Alerts',
};

// ---------------------------------------------------------------------------
// VIEWS
// ---------------------------------------------------------------------------

interface NearbyViewProps {
  refreshed: boolean;
  boardedId: string | null;
  isMotionReduced: boolean;
  onOpen: (departureId: string) => void;
}

function NearbyView({refreshed, boardedId, isMotionReduced, onOpen}: NearbyViewProps) {
  return (
    <div>
      <h1 style={styles.visuallyHidden}>Nearby departures</h1>
      {/* role=status: the refresh result is announced from here too. */}
      <div style={styles.statusCaption} role="status">
        {refreshed ? 'Updated just now' : \`As of \${NOW_LABEL}\`} · {DEPARTURE_COUNT} departures
      </div>
      {STOPS.map(stop => (
        <div key={stop.id}>
          <h2 style={styles.sectionHeader}>
            {stop.name} · {stop.walk}
          </h2>
          <div style={styles.listCard}>
            {BOARDS.filter(group => group.stopId === stop.id).map((group, index) => (
              <div key={group.id}>
                {index > 0 ? <div style={styles.rowDivider} aria-hidden /> : null}
                <DepartureBoard
                  group={group}
                  boardedId={boardedId}
                  isMotionReduced={isMotionReduced}
                  onOpen={onOpen}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface LinesViewProps {
  onOpenLine: (lineId: string) => void;
}

function LinesView({onOpenLine}: LinesViewProps) {
  const alertCount = LINES.filter(line => line.hasAlert).length;
  return (
    <div>
      <h1 style={styles.visuallyHidden}>Lines</h1>
      <div style={styles.statusCaption}>
        {LINES.length} lines · {alertCount} with alerts
      </div>
      <div style={{...styles.listCard, marginTop: 12}}>
        {LINES.map((line, index) => (
          <div key={line.id}>
            {index > 0 ? <div style={styles.rowDividerInset} aria-hidden /> : null}
            <button
              type="button"
              className="wayline-hoverable"
              style={{...styles.row, ...styles.rowTwoLine}}
              aria-label={\`Line \${line.id} \${line.name}\${line.hasAlert ? ', has service alert' : ''}\`}
              onClick={() => onOpenLine(line.id)}>
              <LineBadge lineId={line.id} />
              <span style={styles.rowTextStack}>
                <span style={styles.rowPrimary}>
                  Line {line.id} {line.name}
                </span>
                <span style={styles.rowSecondary}>{line.route}</span>
              </span>
              <span style={styles.rowTrailing}>
                {line.hasAlert ? (
                  <span style={{color: 'var(--color-warning)', display: 'inline-flex'}}>
                    <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
                  </span>
                ) : null}
                <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SavedRowProps {
  item: SavedItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isSwipedOpen: boolean;
  onSwipe: (id: string | null) => void;
  onMenuToggle: (id: string, index: number) => void;
  onRemove: (id: string) => void;
  onActivate: (item: SavedItem) => void;
}

/**
 * Swipe-to-reveal row (snap −72px, one open at a time) — the gesture's
 * visible button path is the trailing 44x44 ellipsis opening the same
 * 'Remove from Saved' action as an anchored menu. Drag offsets live in a
 * transient pointer ref; only the committed open/closed state touches the
 * single state owner.
 */
function SavedRow({
  item,
  index,
  isFirst,
  isLast,
  isSwipedOpen,
  onSwipe,
  onMenuToggle,
  onRemove,
  onActivate,
}: SavedRowProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({startX: 0, dx: 0, active: false, moved: false});

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = {startX: event.clientX, dx: 0, active: true, moved: false};
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const raw = event.clientX - drag.startX + (isSwipedOpen ? -72 : 0);
    drag.dx = Math.max(-72, Math.min(0, raw));
    if (Math.abs(event.clientX - drag.startX) > 8) {
      drag.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const inner = innerRef.current;
    if (inner != null && drag.moved) {
      inner.style.transition = 'none';
      inner.style.transform = \`translateX(\${drag.dx}px)\`;
    }
  };
  const endDrag = () => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    const inner = innerRef.current;
    if (inner != null) {
      inner.style.transition = '';
      inner.style.transform = '';
    }
    if (drag.moved) onSwipe(drag.dx < -36 ? item.id : null);
  };

  const cornerFix: CSSProperties = {
    ...(isFirst ? {borderTopLeftRadius: 12, borderTopRightRadius: 12} : null),
    ...(isLast ? {borderBottomLeftRadius: 12, borderBottomRightRadius: 12} : null),
  };
  return (
    <div style={{...styles.savedRowWrap, ...cornerFix}} data-swipe-row={item.id}>
      <div
        ref={innerRef}
        style={{
          ...styles.savedRowInner,
          transform: isSwipedOpen ? 'translateX(-72px)' : 'translateX(0)',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}>
        <button
          type="button"
          className="wayline-hoverable"
          style={{...styles.row, ...styles.rowTwoLine, flex: 1, paddingRight: 0}}
          aria-label={item.title}
          onClick={() => {
            if (dragRef.current.moved) return; // drag, not a tap
            if (isSwipedOpen) {
              onSwipe(null);
              return;
            }
            onActivate(item);
          }}>
          <span
            style={{
              ...styles.lineBadge,
              background: 'var(--color-background-muted)',
              color: 'var(--color-text-secondary)',
            }}
            aria-hidden>
            <Icon icon={item.kind === 'Stop' ? MapPinIcon : RouteIcon} size="sm" color="inherit" />
          </span>
          <span style={styles.rowTextStack}>
            <span style={styles.rowPrimary}>{item.title}</span>
            <span style={styles.rowSecondary}>{item.subtitle}</span>
          </span>
        </button>
        <button
          type="button"
          style={styles.ellipsisBtn}
          aria-label={\`More actions for \${item.title}\`}
          aria-haspopup="menu"
          onClick={() => onMenuToggle(item.id, index)}>
          <Icon icon={MoreHorizontalIcon} size="md" color="inherit" />
        </button>
      </div>
      {/* Revealed swipe action — covered by the row surface until swiped;
          keyboard users reach the same verb via the ellipsis menu. */}
      <button
        type="button"
        style={styles.swipeAction}
        tabIndex={-1}
        aria-hidden
        onClick={() => onRemove(item.id)}>
        <Icon icon={XIcon} size="sm" color="inherit" />
        Remove
      </button>
    </div>
  );
}

interface SavedViewProps {
  savedIds: string[];
  openSwipeRowId: string | null;
  openMenuId: string | null;
  menuIndex: number;
  menuRef: RefObject<HTMLButtonElement | null>;
  onSwipe: (id: string | null) => void;
  onMenuToggle: (id: string, index: number) => void;
  onRemove: (id: string) => void;
  onActivate: (item: SavedItem) => void;
  onBrowseLines: () => void;
}

function SavedView({
  savedIds,
  openSwipeRowId,
  openMenuId,
  menuIndex,
  menuRef,
  onSwipe,
  onMenuToggle,
  onRemove,
  onActivate,
  onBrowseLines,
}: SavedViewProps) {
  const items = SAVED_ITEMS.filter(item => savedIds.includes(item.id));
  return (
    <div>
      <h1 style={styles.visuallyHidden}>Saved stops and lines</h1>
      <div style={styles.statusCaption}>{items.length} saved</div>
      {items.length === 0 ? (
        // Saved empty-state stress fixture: reached by removing all three
        // rows; 'Browse lines' is the observable cross-surface path.
        <div style={{...styles.emptyCard, marginTop: 12}}>
          <span style={styles.emptyTile}>
            <Icon icon={BookmarkIcon} size="lg" color="inherit" />
          </span>
          <span style={styles.emptyTitle}>Nothing saved yet</span>
          <span style={styles.emptyHint}>
            Save a stop or a line and it will be one tap away here.
          </span>
          <button type="button" style={{...styles.secondaryBtn, marginTop: 8}} onClick={onBrowseLines}>
            Browse lines
          </button>
        </div>
      ) : (
        <div style={{position: 'relative', marginTop: 12}}>
          <div style={{...styles.listCard, overflow: 'visible'}}>
            {items.map((item, index) => (
              <div key={item.id}>
                {index > 0 ? <div style={styles.rowDividerInset} aria-hidden /> : null}
                <SavedRow
                  item={item}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  isSwipedOpen={openSwipeRowId === item.id}
                  onSwipe={onSwipe}
                  onMenuToggle={onMenuToggle}
                  onRemove={onRemove}
                  onActivate={onActivate}
                />
              </div>
            ))}
          </div>
          {openMenuId != null ? (
            // Anchored menu — the ellipsis' (and swipe's) keyboard path.
            // Rows are 60px + 1px dividers; the menu anchors under its row.
            <div
              style={{...styles.menuCard, right: 28, top: 1 + menuIndex * 61 + 52}}
              role="menu"
              aria-label="Saved item actions">
              <button
                type="button"
                ref={menuRef}
                style={styles.menuRow}
                role="menuitem"
                onClick={() => onRemove(openMenuId)}>
                <Icon icon={XIcon} size="sm" color="inherit" />
                Remove from Saved
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

interface AlertsViewProps {
  tripActive: boolean;
  openAlertId: string | null;
  onToggle: (id: string) => void;
}

function AlertsView({tripActive, openAlertId, onToggle}: AlertsViewProps) {
  const visible = ALERTS.filter(alert => !alert.tripOnly || tripActive);
  return (
    <div>
      <h1 style={styles.visuallyHidden}>Service alerts</h1>
      <div style={styles.statusCaption}>
        {visible.length} service alerts{tripActive ? ' · 1 for your trip' : ''}
      </div>
      <div style={{...styles.listCard, marginTop: 12}}>
        {visible.map((alert, index) => {
          const isOpen = openAlertId === alert.id;
          return (
            <div key={alert.id}>
              {index > 0 ? <div style={styles.rowDivider} aria-hidden /> : null}
              <button
                type="button"
                className="wayline-hoverable"
                style={styles.alertRow}
                aria-expanded={isOpen}
                onClick={() => onToggle(alert.id)}>
                <span style={styles.severitySlot}>
                  <span
                    style={{...styles.severityDot, background: SEVERITY_COLOR[alert.severity]}}
                    aria-hidden
                  />
                </span>
                <span style={styles.alertTitle}>{alert.title}</span>
                <span style={{...styles.rowTrailing, paddingRight: 12}}>
                  <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
                </span>
              </button>
              {isOpen ? <div style={styles.alertBody}>{alert.body}</div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TRIP SHEET — medium detent = departure preview + Start trip; large
// detent = trip mode with the LineStrand + Next-stop stepper. Deliberately
// NOT a ride-status clone: no driver card, no plate, no map placeholder.
// ---------------------------------------------------------------------------

interface TripSheetProps {
  mode: 'preview' | 'trip';
  detent: 'medium' | 'large';
  departureId: string | null;
  stopIndex: number;
  isMotionReduced: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  onToggleDetent: () => void;
  onClose: () => void;
  onStartTrip: () => void;
  onNextStop: () => void;
  onEndTrip: () => void;
}

function TripSheet({
  mode,
  detent,
  departureId,
  stopIndex,
  isMotionReduced,
  sheetRef,
  onToggleDetent,
  onClose,
  onStartTrip,
  onNextStop,
  onEndTrip,
}: TripSheetProps) {
  const departure =
    (departureId != null ? DEPARTURE_BY_ID.get(departureId) : undefined) ??
    DEPARTURE_BY_ID.get(BOARDED_DEPARTURE_ID)!;
  const group = GROUP_BY_DEPARTURE.get(departure.id) ?? BOARDS[0];
  const stop = STOPS.find(s => s.id === group.stopId) ?? STOPS[0];
  const isTripLine = group.id === TRIP_GROUP_ID;
  const arrived = stopIndex >= LAST_STOP_INDEX;

  // Focus-trap sentinels: Tab wraps within the open sheet.
  const focusEdge = (last: boolean) => {
    const root = sheetRef.current;
    if (root == null) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
    );
    const target = last ? focusables[focusables.length - 1] : focusables[0];
    target?.focus();
  };

  return (
    <>
      <div style={styles.sheetScrim} onClick={onClose} aria-hidden />
      <div
        ref={sheetRef}
        style={{
          ...styles.sheet,
          ...(detent === 'large' ? styles.sheetLarge : styles.sheetMedium),
          animation: isMotionReduced
            ? 'wayline-fade 160ms ease-out'
            : 'wayline-sheet-up 240ms ease-out',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={\`Line \${group.lineId} · \${group.dest}\`}
        tabIndex={-1}>
        <div tabIndex={0} onFocus={() => focusEdge(true)} style={styles.visuallyHidden} />
        <button type="button" style={styles.sheetGrabberZone} aria-label="Resize sheet" onClick={onToggleDetent}>
          <span style={styles.sheetGrabber} aria-hidden />
        </button>
        <div style={styles.sheetHeader}>
          <span aria-hidden />
          <span style={styles.sheetTitle}>
            Line {group.lineId} · {group.dest}
          </span>
          <button type="button" style={styles.navIconBtn} aria-label="Close sheet" onClick={onClose}>
            <Icon icon={XIcon} size="md" color="inherit" />
          </button>
        </div>
        {isTripLine ? (
          // Ride 8:14 − 8:02 = 12 min; navBar 'ETA 8:14' = last strand time.
          <div style={styles.sheetSubtitle}>Arrives {TRIP_ETA} · 12 min</div>
        ) : null}
        <div style={styles.sheetContent}>
          {mode === 'trip' ? (
            <LineStrand stopIndex={stopIndex} />
          ) : (
            <>
              <div style={styles.previewSummary}>
                <LineBadge lineId={group.lineId} />
                <span style={styles.rowTextStack}>
                  <span style={styles.rowPrimary}>{group.headsign}</span>
                  <span style={{...styles.rowSecondary, whiteSpace: 'normal'}}>
                    Departs {departure.clock} · {departure.minsLabel} · from {stop.name} · {group.bay}
                  </span>
                </span>
                <span style={{flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6}}>
                  <CrowdMeter crowd={departure.crowd} onBrand={false} />
                  <span style={styles.rowSecondary}>{departure.crowdLabel}</span>
                </span>
              </div>
              {departure.scheduledClock != null ? (
                <div style={styles.delayNote}>
                  <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
                  Running {departure.delayLabel} late — scheduled {departure.scheduledClock},{' '}
                  now {departure.clock}.
                </div>
              ) : null}
              <div style={styles.legendCard}>
                <span style={{fontSize: 13, fontWeight: 600}}>Crowding right now</span>
                <span style={styles.legendLine}>
                  {CROWD_COUNTS.light} light · {CROWD_COUNTS.moderate} moderate ·{' '}
                  {CROWD_COUNTS.full} full right now
                </span>
                {(Object.keys(CROWD_META) as Crowd[]).map(crowd => (
                  <span key={crowd} style={styles.legendRow}>
                    <CrowdMeter crowd={crowd} onBrand={false} />
                    <span>{CROWD_META[crowd].legend}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={styles.sheetFooter}>
          {mode === 'trip' ? (
            <>
              {!arrived ? (
                <button type="button" style={styles.secondaryBtn} onClick={onEndTrip}>
                  End trip
                </button>
              ) : null}
              <button
                type="button"
                style={styles.primaryBtn}
                onClick={arrived ? onEndTrip : onNextStop}>
                {arrived ? 'End trip' : 'Next stop'}
              </button>
            </>
          ) : isTripLine ? (
            <button type="button" style={styles.primaryBtn} onClick={onStartTrip}>
              Start trip
            </button>
          ) : (
            // Trip guidance is fixtured for the Line 4 strand only; other
            // previews close from the footer (noted deviation).
            <button type="button" style={styles.primaryBtn} onClick={onClose}>
              Done
            </button>
          )}
        </div>
        <div tabIndex={0} onFocus={() => focusEdge(false)} style={styles.visuallyHidden} />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// APP
// ---------------------------------------------------------------------------

export default function MobileTransitCompanionTemplate() {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const outerWidth = useElementWidth(outerRef);
  // First pre-observer frame: fall back to a viewport query so the desktop
  // stage doesn't flash the uncentered layout.
  const isViewportWide = useMediaQuery('(min-width: 561px)');
  const isCentered = outerWidth > 0 ? outerWidth > 560 : isViewportWide;
  const isMotionReduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<AppState>(INITIAL_STATE);

  // The single mutation path — every handler merges a patch here.
  const update = useCallback((patch: Partial<AppState>) => {
    setState(prev => ({...prev, ...patch}));
  }, []);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const menuOpenerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLButtonElement | null>(null);
  const menuIndexRef = useRef(0);

  // Focus moves into the sheet on open and restores to the opener on
  // EVERY close path (X, scrim, Escape, End trip).
  const isSheetOpen = state.sheet != null;
  useEffect(() => {
    if (isSheetOpen) {
      sheetRef.current?.focus();
    } else if (openerRef.current != null) {
      openerRef.current.focus();
      openerRef.current = null;
    }
  }, [isSheetOpen]);

  // Anchored-menu focus: into the menu row on open, back to the ellipsis
  // on close.
  const isMenuOpen = state.openMenuId != null;
  useEffect(() => {
    if (isMenuOpen) {
      menuRef.current?.focus();
    } else if (menuOpenerRef.current != null) {
      menuOpenerRef.current.focus();
      menuOpenerRef.current = null;
    }
  }, [isMenuOpen]);

  // Escape closes the TOPMOST layer only: anchored menu → sheet.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setState(prev => {
        if (prev.openMenuId != null) return {...prev, openMenuId: null};
        if (prev.sheet != null) return {...prev, sheet: null};
        if (prev.openSwipeRowId != null) return {...prev, openSwipeRowId: null};
        return prev;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // -- handlers --------------------------------------------------------
  const openDeparture = (departureId: string) => {
    openerRef.current = document.activeElement as HTMLElement | null;
    if (state.trip.active && departureId === BOARDED_DEPARTURE_ID) {
      update({selectedDepartureId: departureId, sheet: 'trip', sheetDetent: 'large'});
    } else {
      update({selectedDepartureId: departureId, sheet: 'preview', sheetDetent: 'medium'});
    }
  };

  const openLine = (lineId: string) => {
    const nextGroup = BOARDS.find(group => group.lineId === lineId);
    if (nextGroup == null) {
      // Night Owl has no 7:59 AM departure — its first run explains why.
      update({toast: 'Line 31 Night Owl · First run 11:40 PM'});
      return;
    }
    openDeparture(nextGroup.departures[0].id);
  };

  const closeSheet = () => update({sheet: null});

  // ONE FLIP, FOUR SURFACES: sheet → trip/large, navBar → Line 4 + ETA,
  // Alerts badge 2 → 3 (reroute row appears), Nearby 8:02 pill → Boarded.
  const startTrip = () =>
    update({
      trip: {active: true, stopIndex: 0},
      sheet: 'trip',
      sheetDetent: 'large',
      selectedDepartureId: BOARDED_DEPARTURE_ID,
      toast: \`Trip started · boarding the 8:02 at \${HOME_STOP}\`,
    });

  const nextStop = () =>
    setState(prev => {
      const stopIndex = Math.min(prev.trip.stopIndex + 1, LAST_STOP_INDEX);
      return {
        ...prev,
        trip: {...prev.trip, stopIndex},
        toast: STEP_ANNOUNCEMENTS[stopIndex],
      };
    });

  const endTrip = () =>
    update({
      trip: {active: false, stopIndex: 0},
      sheet: null,
      sheetDetent: 'medium',
      toast: 'Trip ended',
    });

  const refresh = () => update({refreshed: true, toast: 'Departures updated'});

  const selectTab = (tab: TabId) =>
    update({tab, openSwipeRowId: null, openMenuId: null, toast: ''});

  const removeSaved = (id: string) =>
    setState(prev => ({
      ...prev,
      savedIds: prev.savedIds.filter(savedId => savedId !== id),
      openSwipeRowId: null,
      openMenuId: null,
      toast: 'Removed from Saved',
    }));

  const toggleMenu = (id: string, index: number) => {
    menuOpenerRef.current = document.activeElement as HTMLElement | null;
    menuIndexRef.current = index;
    update({openMenuId: state.openMenuId === id ? null : id, openSwipeRowId: null});
  };

  const activateSaved = (item: SavedItem) => {
    if (item.kind === 'Stop') {
      selectTab('nearby');
    } else {
      openLine('4');
    }
  };

  // Tab bar arrow keys (tablist contract).
  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const order = TAB_META.map(tab => tab.id);
    const current = order.indexOf(state.tab);
    const next =
      event.key === 'ArrowRight'
        ? order[(current + 1) % order.length]
        : order[(current + order.length - 1) % order.length];
    selectTab(next);
    document.getElementById(\`wayline-tab-\${next}\`)?.focus();
  };

  // Tap-elsewhere closes an open swipe row.
  const onShellPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (state.openSwipeRowId == null) return;
    const target = event.target as HTMLElement;
    if (target.closest(\`[data-swipe-row="\${state.openSwipeRowId}"]\`) == null) {
      update({openSwipeRowId: null});
    }
  };

  // -- derived ----------------------------------------------------------
  const tripActive = state.trip.active;
  const alertBadge = ALERTS.filter(alert => !alert.tripOnly || tripActive).length;
  const boardedId = tripActive ? BOARDED_DEPARTURE_ID : null;

  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isCentered ? styles.shellCentered : null),
    ...(isSheetOpen ? styles.shellLocked : null),
  };

  return (
    <div ref={outerRef} style={isCentered ? {...styles.stageOuter, ...styles.stageCenter} : styles.stageOuter}>
      <style>{WAYLINE_CSS}</style>
      <div className="wayline-shell" style={shellStyle} onPointerDown={onShellPointerDown}>
        {/* NAV BAR — 52px, three-zone grid; trip mode swaps leading +
            center in place (chrome reshapes, screen does not push). */}
        <header style={styles.navBar}>
          <div style={styles.navSlotLead}>
            {tripActive ? (
              <span style={styles.navStaticSlot}>
                <LineBadge lineId="4" />
              </span>
            ) : (
              <button
                type="button"
                style={styles.navIconBtn}
                aria-label="Wayline home"
                onClick={() => selectTab('nearby')}>
                <WaylineMark />
              </button>
            )}
          </div>
          {tripActive ? (
            <div style={styles.navTitleStack}>
              <span style={styles.navOverline}>to {TRIP_DEST}</span>
              <span style={styles.navEta}>ETA {TRIP_ETA}</span>
            </div>
          ) : (
            <div style={styles.navTitle}>{NAV_TITLES[state.tab]}</div>
          )}
          <div style={styles.navSlotTrail}>
            <button type="button" style={styles.navIconBtn} aria-label="Refresh departures" onClick={refresh}>
              <Icon icon={RefreshCwIcon} size="md" color="inherit" />
            </button>
          </div>
        </header>

        {/* BODY — natural flow; page scroll belongs to the demo wrapper. */}
        <main style={styles.body}>
          {state.tab === 'nearby' ? (
            <NearbyView
              refreshed={state.refreshed}
              boardedId={boardedId}
              isMotionReduced={isMotionReduced}
              onOpen={openDeparture}
            />
          ) : state.tab === 'lines' ? (
            <LinesView onOpenLine={openLine} />
          ) : state.tab === 'saved' ? (
            <SavedView
              savedIds={state.savedIds}
              openSwipeRowId={state.openSwipeRowId}
              openMenuId={state.openMenuId}
              menuIndex={menuIndexRef.current}
              menuRef={menuRef}
              onSwipe={id => update({openSwipeRowId: id, openMenuId: null})}
              onMenuToggle={toggleMenu}
              onRemove={removeSaved}
              onActivate={activateSaved}
              onBrowseLines={() => selectTab('lines')}
            />
          ) : (
            <AlertsView
              tripActive={tripActive}
              openAlertId={state.openAlertId}
              onToggle={id =>
                update({openAlertId: state.openAlertId === id ? null : id})
              }
            />
          )}
        </main>

        {/* Resume pill — the button path back into a collapsed trip. */}
        {tripActive && !isSheetOpen ? (
          <div style={styles.resumeAnchor}>
            <button
              type="button"
              style={styles.resumeBtn}
              onClick={() => {
                openerRef.current = document.activeElement as HTMLElement | null;
                update({sheet: 'trip', sheetDetent: 'large'});
              }}>
              <Icon icon={RouteIcon} size="sm" color="inherit" />
              Resume · ETA {TRIP_ETA}
            </button>
          </div>
        ) : null}

        {/* THE one polite live region — refresh, removals, and every
            stepper advance announce from here, never a second region. */}
        <div style={styles.toastAnchor} aria-live="polite">
          {state.toast !== '' ? <div style={styles.toastPill}>{state.toast}</div> : null}
        </div>

        {/* TAB BAR — exactly 64px, 4 tabs, arrow-key tablist. */}
        <nav style={styles.tabBar} role="tablist" aria-label="Wayline sections" onKeyDown={onTabKeyDown}>
          {TAB_META.map(tab => {
            const isActive = state.tab === tab.id;
            return (
              <button
                key={tab.id}
                id={\`wayline-tab-\${tab.id}\`}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                style={isActive ? {...styles.tabItem, ...styles.tabItemActive} : styles.tabItem}
                onClick={() => selectTab(tab.id)}>
                <span style={styles.tabIconWrap}>
                  <Icon icon={tab.icon} size="lg" color="inherit" />
                  {tab.id === 'alerts' ? (
                    <span style={styles.tabBadge} aria-label={\`\${alertBadge} alerts\`}>
                      {alertBadge}
                    </span>
                  ) : null}
                </span>
                <span style={isActive ? {...styles.tabLabel, ...styles.tabLabelActive} : styles.tabLabel}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* SHEET — the one legal inner scroller lives inside. */}
        {state.sheet != null ? (
          <TripSheet
            mode={state.sheet}
            detent={state.sheetDetent}
            departureId={state.selectedDepartureId}
            stopIndex={state.trip.stopIndex}
            isMotionReduced={isMotionReduced}
            sheetRef={sheetRef}
            onToggleDetent={() =>
              update({sheetDetent: state.sheetDetent === 'medium' ? 'large' : 'medium'})
            }
            onClose={closeSheet}
            onStartTrip={startTrip}
            onNextStop={nextStop}
            onEndTrip={endTrip}
          />
        ) : null}
      </div>
    </div>
  );
}


`;export{e as default};