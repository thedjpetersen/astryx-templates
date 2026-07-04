var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Sessions clerk-of-court console
 *   for the Dept. Registry on Monday, Jul 6, 2026 (TODAY = '2026-07-06';
 *   every relative time is a pre-computed string, never clock math): a
 *   six-item e-filing intake queue, the 13-row docket for CV-2026-01847
 *   "Calloway v. Brightline Freight Co. & Kessler" (12 integer entries +
 *   nunc pro tunc 5.1, entry #7 vacated by #11), a rule-offset deadline
 *   chain derived live by computeChain from RULES = {21d answer, 120d
 *   discovery, 30d dispositive, 45d trial setting, 10 court-day CMC, 90d
 *   service completion}, and a judge-by-slot session grid for the week of
 *   Jul 6 (23 sessions: Mon 7 + Tue 5 + Wed 4 + Thu 4 + Fri 3). No clocks,
 *   no randomness, no network media.
 * @output Court Docketing Console — the surface a deputy clerk works all
 *   day: a 280px e-filing intake queue feeds a legally-numbered docket
 *   entry sequencer under an 88px case-header band with SERVICE/ANSWER
 *   status flags; a 336px DeadlineChainRail shows every statutory deadline
 *   WITH its offset arithmetic ('served 6/30 + 21d = 7/21'); a 200px
 *   bottom SessionSlotGrid maps four judges across four hearing slots.
 *   Accepting the pinned Brightline proof-of-service fires ONE
 *   acceptFiling and four surfaces move: entry #13 stamps in, the chain
 *   recomputes (+11d deltas cascade to discovery/dispositive/trial), two
 *   session chips drop onto Thu/Fri, and the header's amber SERVICE flag
 *   flips green while ANSWER DUE 7/21 lights.
 * @position Page template; emitted by \`astryx template court-docketing-console\`
 *
 * DENSITY GRID (verbatim from spec, obeyed everywhere): 8px base spacing,
 * 4px micro-gap. Top bar 56px. Panel headers 44px (13px semibold title +
 * right-aligned count badge). Left intake card 64px (2 lines + meta row).
 * Case header band 88px fixed. Docket row 40px single-line / 56px
 * two-line, 32px number gutter. Rail node 72px, connector column 24px
 * wide. Bottom grid: total 200px = 28px day-tab row + 26px slot header
 * row + 4 judge rows at 34px + 10px padding remainder. Chips 20px tall,
 * radius 4. Fonts: 11 (meta/ticks), 12 (body-secondary, chips), 13
 * (body), 14 (row primary), 16 (case caption), 20 (top-bar brand). Icons
 * 16px. All borders 1px solid token hairline. Number gutter and all
 * dates use tabular-nums monospace variant.
 *
 * CORNER MAP (decided up front): shell panels/asides/bottom band radius 0
 * (flush ledger austerity, hairline dividers only); intake queue cards
 * 8px; docket rows 0 (continuous ledger with row hairlines); rail nodes
 * 8px; session chips 4px; status flags/badges 4px; buttons and inputs
 * 6px; day tabs 6px top-only; file-stamp box 2px (deliberately
 * bureaucratic); PorticoMark seal circle and avatar 9999px. Never mix
 * radii within one component.
 *
 * Frame: root 100dvh div > Layout height="fill" > header (TopBar 56) |
 *   content (viewRoot: mainRow [280 intake | fluid center | 336 rail] +
 *   200px bottom SessionSlotGrid band). Each pane owns exactly one
 *   scroll container.
 * Container policy: dense-console archetype — flush panels and hairline
 *   dividers only; no Cards. Intake cards, docket rows, rail nodes, and
 *   grid chips are styled divs/buttons on the pane surfaces.
 * Color policy: token-pure chrome. ONE quarantined brand literal — the
 *   Sessions oxblood #7A2E2E — split into BRAND_FILL
 *   light-dark(#7A2E2E, #8E4040) (fills only) and BRAND_TEXT
 *   light-dark(#6B2626, #D99C9C) (text only; #6B2626 on white = 8.9:1,
 *   #D99C9C on #1E1E1E = 7.4:1, both past 4.5:1). Amber/green states use
 *   data-viz categorical tokens with the repo-standard fallbacks; amber
 *   TEXT is darkened to light-dark(#96520A, #FFB763) (#96520A on white =
 *   5.6:1). Transitions animate transform/opacity/color only and collapse
 *   under prefers-reduced-motion.
 *
 * Responsive contract — bands keyed to CONTAINER width of viewRoot via a
 * useElementWidth ResizeObserver (the demo stage is ~1045–1075px inside a
 * 1440px window, so viewport queries never fire there; they remain only
 * as the width-0 first-frame fallback). All constants in BANDS.
 * - Band A >= 1040px: full 280 / fluid / 336 three-column + 200px grid.
 * - Band B 880–1039px: rightAside collapses to a 48px icon strip
 *   (next-deadline dot + count); clicking opens the DeadlineChainRail in
 *   a DS Dialog.
 * - Band C 720–879px: leftAside also collapses — intake becomes a TopBar
 *   button with a '6' badge opening a Dialog; bottom grid shrinks to
 *   168px (judge rows 28px).
 * - Band D < 720px: single column — CaseHeader, sequencer, then rail and
 *   grid stacked in one scroll; grid keeps 4 slot columns with internal
 *   overflowX. Subtraction, never reflow-squeeze.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  CalendarClockIcon,
  CheckIcon,
  InboxIcon,
  ScaleIcon,
  SearchIcon,
  StampIcon,
  TriangleAlertIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Icon} from '@astryxdesign/core/Icon';
import {Popover} from '@astryxdesign/core/Popover';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark
// pair (dark side shifted lighter). ONE quarantined brand literal
// (#7A2E2E), split fill vs text per the a11y plan.
// ---------------------------------------------------------------------------

// Brand FILL — used only as a background/rule color, never as text.
const BRAND_FILL = 'light-dark(#7A2E2E, #8E4040)';
// Brand TEXT — #6B2626 on white 8.9:1; #D99C9C on #1E1E1E 7.4:1.
const BRAND_TEXT = 'light-dark(#6B2626, #D99C9C)';
const BRAND_SOFT = 'light-dark(rgba(122, 46, 46, 0.08), rgba(142, 64, 64, 0.20))';
const AMBER = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9838))';
// Amber TEXT darkened for contrast: #96520A on white = 5.6:1.
const AMBER_TEXT = 'light-dark(#96520A, #FFB763)';
const AMBER_SOFT = 'light-dark(rgba(235, 110, 0, 0.10), rgba(255, 152, 56, 0.16))';
const GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
// Green TEXT: #0A7A19 on white = 4.9:1.
const GREEN_TEXT = 'light-dark(#0A7A19, #4CD964)';
const GREEN_SOFT = 'light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';
const HAIRLINE = 'var(--border-width, 1px) solid var(--color-border)';

// Responsive band constants — container-width thresholds on viewRoot.
const BANDS = {full: 1040, railCollapse: 880, intakeCollapse: 720} as const;
type Band = 'A' | 'B' | 'C' | 'D';

// ---------------------------------------------------------------------------
// INJECTED CSS — :focus-visible rings, the 300ms stamp-press, the
// cross-link flash, flag/tab pulses, and the reduced-motion guard. All
// animations are transform/opacity/color only.
// ---------------------------------------------------------------------------

const CONSOLE_CSS = \`
.cdc-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
/* 20px chips keep a >= 24px hit area: the pseudo-element extends the
   button's hit box without moving a pixel of layout. */
.cdc-hit { position: relative; }
.cdc-hit::after { content: ''; position: absolute; inset: -4px; }
.cdc-stamp {
  animation: cdc-stamp-press 300ms cubic-bezier(0.2, 1.4, 0.4, 1);
}
@keyframes cdc-stamp-press {
  0% { transform: scale(1.25); opacity: 0; }
  60% { transform: scale(0.96); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.cdc-flash {
  animation: cdc-flash-bg 1200ms ease-out;
}
@keyframes cdc-flash-bg {
  0%, 40% { background-color: \${BRAND_SOFT}; }
  100% { background-color: transparent; }
}
.cdc-pulse {
  animation: cdc-soft-pulse 1.6s ease-in-out infinite;
}
@keyframes cdc-soft-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
.cdc-delta {
  animation: cdc-delta-in 200ms ease-out;
}
@keyframes cdc-delta-in {
  from { transform: translateY(-2px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .cdc-stamp, .cdc-flash, .cdc-pulse, .cdc-delta { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — density grid: 8px base, 4px micro-gap; all borders 1px token
// hairline; tabular-nums monospace on the number gutter and every date.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // Top bar: 56px, 20px wordmark, 240px search.
  topBar: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 16px',
    boxSizing: 'border-box',
  },
  brandMark: {display: 'inline-flex', color: BRAND_TEXT, flexShrink: 0},
  wordmark: {fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap'},
  topSubtitle: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  searchBox: {width: 240, flexShrink: 0},
  // View root: flex COLUMN (mainRow + bottom band); band detection is a
  // ResizeObserver on this element, not the viewport.
  viewRoot: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100%',
  },
  mainRow: {flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0},
  leftAside: {
    width: 280,
    flexShrink: 0,
    borderRight: HAIRLINE,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  centerMain: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  rightAside: {
    width: 336,
    flexShrink: 0,
    borderLeft: HAIRLINE,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  // Band B: rail collapses to a 48px icon strip.
  railStrip: {
    width: 48,
    flexShrink: 0,
    borderLeft: HAIRLINE,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 8,
    gap: 4,
  },
  bottomBand: {
    height: 200,
    flexShrink: 0,
    borderTop: HAIRLINE,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  // Panel headers: 44px, 13px semibold title + right count badge.
  panelHeader: {
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 12px',
    borderBottom: HAIRLINE,
    boxSizing: 'border-box',
  },
  panelTitle: {fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap'},
  countBadge: {
    marginLeft: 'auto',
    fontSize: 11,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    padding: '2px 6px',
    borderRadius: 4,
    border: HAIRLINE,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // Intake queue — cards 64px min (2 title lines + meta row), radius 8.
  intakeScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 8},
  intakeCard: {
    minHeight: 64,
    boxSizing: 'border-box',
    borderRadius: 8,
    border: HAIRLINE,
    padding: '8px 8px 8px 12px',
    marginBottom: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    cursor: 'pointer',
    position: 'relative',
    backgroundColor: 'var(--color-background-card)',
    textAlign: 'start',
    width: '100%',
    font: 'inherit',
    color: 'inherit',
  },
  intakeCardPinned: {borderLeft: \`3px solid \${BRAND_FILL}\`},
  intakeCardSelected: {backgroundColor: BRAND_SOFT},
  intakeTitle: {
    fontSize: 13,
    fontWeight: 600,
    lineHeight: '16px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  intakeMeta: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  intakeActions: {display: 'flex', gap: 4, alignItems: 'center'},
  // Case header band: 88px fixed; caption 16px.
  caseHeader: {
    height: 88,
    flexShrink: 0,
    boxSizing: 'border-box',
    padding: '8px 12px',
    borderBottom: HAIRLINE,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    overflow: 'hidden',
  },
  caseNumberLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  caseCaption: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  flagRow: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  // Status flags: 4px radius, lit/unlit/pulse.
  flag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    padding: '0 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    border: HAIRLINE,
    cursor: 'pointer',
    background: 'transparent',
    whiteSpace: 'nowrap',
  },
  flagAmber: {backgroundColor: AMBER_SOFT, color: AMBER_TEXT, borderColor: AMBER},
  flagGreen: {backgroundColor: GREEN_SOFT, color: GREEN_TEXT, borderColor: GREEN},
  flagUnlit: {color: 'var(--color-text-secondary)'},
  // Docket sequencer — rows 40px single / 56px two-line; 32px number
  // gutter; 88px file-stamp date column; radius 0 continuous ledger.
  docketScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  docketRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    minHeight: 40,
    boxSizing: 'border-box',
    padding: '4px 12px 4px 0',
    borderBottom: HAIRLINE,
    position: 'relative',
  },
  docketRowTwoLine: {minHeight: 56},
  docketGutter: {
    width: 32,
    flexShrink: 0,
    textAlign: 'end',
    fontSize: 12,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    paddingTop: 4,
  },
  // Nunc pro tunc decimal number: italic + 2px brand-tinted inset rule.
  docketGutterNunc: {
    fontStyle: 'italic',
    color: BRAND_TEXT,
    borderLeft: \`2px solid \${BRAND_FILL}\`,
    marginLeft: 8,
    width: 24,
  },
  stampCol: {
    width: 88,
    flexShrink: 0,
    fontSize: 11,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    paddingTop: 5,
    whiteSpace: 'nowrap',
  },
  // File-stamp box: radius 2, deliberately bureaucratic.
  stampBox: {
    display: 'inline-flex',
    flexDirection: 'column',
    border: \`1px solid \${BRAND_TEXT}\`,
    borderRadius: 2,
    padding: '2px 4px',
    color: BRAND_TEXT,
    fontSize: 10,
    lineHeight: '12px',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    textTransform: 'uppercase',
  },
  entryBody: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 4},
  entryText: {
    fontSize: 14,
    lineHeight: '16px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  entryTextVacated: {textDecoration: 'line-through', color: 'var(--color-text-secondary)'},
  entryMetaLine: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  // Stacked vertically so the entry-text column keeps its width in the
  // Band-A center pane (~430px between the fixed asides).
  entryRight: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
    paddingTop: 4,
  },
  filerChip: {
    fontSize: 12,
    padding: '1px 6px',
    borderRadius: 4,
    border: HAIRLINE,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    maxWidth: 120,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  docTypeBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '1px 6px',
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  vacatedBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: 4,
    backgroundColor: AMBER_SOFT,
    color: AMBER_TEXT,
    whiteSpace: 'nowrap',
  },
  crossLinkPill: {
    fontSize: 11,
    fontFamily: MONO,
    padding: '1px 6px',
    borderRadius: 4,
    border: \`1px solid \${BRAND_TEXT}\`,
    color: BRAND_TEXT,
    background: 'transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  entryHighlight: {backgroundColor: BRAND_SOFT},
  // Deadline chain rail — nodes 72px min, 24px connector column, radius 8.
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px 12px'},
  railList: {listStyle: 'none', margin: 0, padding: 0},
  railItem: {display: 'flex', gap: 8, position: 'relative'},
  railSpineCol: {
    width: 24,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  railDot: {
    width: 10,
    height: 10,
    borderRadius: 9999,
    marginTop: 8,
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  railSpine: {width: 2, flex: 1, backgroundColor: 'var(--color-border)'},
  railSpineHatched: {
    width: 2,
    flex: 1,
    backgroundImage: \`repeating-linear-gradient(to bottom, \${AMBER} 0 3px, transparent 3px 6px)\`,
  },
  railNode: {
    minHeight: 72,
    boxSizing: 'border-box',
    borderRadius: 8,
    border: HAIRLINE,
    padding: '6px 8px',
    marginBottom: 4,
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    cursor: 'pointer',
    background: 'var(--color-background-card)',
    textAlign: 'start',
    font: 'inherit',
    color: 'inherit',
    width: '100%',
  },
  railNodeGhost: {borderStyle: 'dashed', opacity: 0.4},
  railRule: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: MONO,
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.02em',
  },
  railTitle: {fontSize: 13, fontWeight: 600, lineHeight: '16px'},
  railDate: {
    fontSize: 13,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  railMath: {
    fontSize: 11,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  railCaption: {fontSize: 11, color: AMBER_TEXT, fontFamily: MONO},
  tollingSeg: {
    fontSize: 11,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    color: AMBER_TEXT,
    padding: '2px 4px',
    borderRadius: 4,
    backgroundImage: \`repeating-linear-gradient(45deg, \${AMBER_SOFT} 0 4px, transparent 4px 8px)\`,
    border: \`1px dashed \${AMBER}\`,
  },
  offsetChipRow: {display: 'flex', alignItems: 'center', minHeight: 16, paddingLeft: 32},
  offsetChip: {
    fontSize: 11,
    fontFamily: MONO,
    padding: '0 6px',
    height: 16,
    borderRadius: 4,
    border: HAIRLINE,
    color: 'var(--color-text-secondary)',
    background: 'var(--color-background-muted)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  deltaBadge: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: MONO,
    padding: '0 6px',
    borderRadius: 4,
    backgroundColor: BRAND_FILL,
    color: 'light-dark(#FFFFFF, #1A0D0D)',
    whiteSpace: 'nowrap',
  },
  // Session slot grid — 28px day tabs + 26px slot header + 4x34px rows
  // (+10px padding remainder = 200 total); chips 20px radius 4.
  dayTabRow: {
    height: 28,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'stretch',
    gap: 4,
    padding: '0 12px',
    borderBottom: HAIRLINE,
    boxSizing: 'border-box',
  },
  gridWeekLabel: {
    fontSize: 12,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    marginRight: 8,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // Day tabs: radius 6 top-only.
  dayTab: {
    fontSize: 12,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    padding: '0 8px',
    border: HAIRLINE,
    borderBottom: 'none',
    borderRadius: '6px 6px 0 0',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  dayTabActive: {
    backgroundColor: BRAND_SOFT,
    color: BRAND_TEXT,
    fontWeight: 700,
  },
  gridScroll: {flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 10},
  gridTable: {display: 'grid', gridTemplateColumns: '128px repeat(4, minmax(200px, 1fr))'},
  slotHeaderCell: {
    height: 26,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    fontSize: 11,
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    borderBottom: HAIRLINE,
  },
  // Two 11px lines (name / dept) — the spec-fixed 128px column cannot fit
  // 'Hon. L. Whitfield · Dept 5' on one 12px line.
  judgeCell: {
    height: 34,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 8px',
    fontSize: 11,
    lineHeight: '13px',
    overflow: 'hidden',
    borderBottom: HAIRLINE,
    position: 'sticky',
    left: 0,
    backgroundColor: 'var(--color-background)',
    zIndex: 1,
  },
  judgeCellLine: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  slotCell: {
    height: 34,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '0 20px 0 8px',
    borderBottom: HAIRLINE,
    borderLeft: HAIRLINE,
    position: 'relative',
    minWidth: 0,
  },
  sessionChip: {
    height: 20,
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '0 6px',
    borderRadius: 4,
    border: HAIRLINE,
    fontSize: 12,
    background: 'var(--color-background-card)',
    cursor: 'pointer',
    minWidth: 0,
    maxWidth: 150,
    color: 'inherit',
  },
  sessionChipLabel: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  sessionChipConflict: {backgroundColor: AMBER_SOFT, borderColor: AMBER},
  capacityTicks: {
    position: 'absolute',
    top: 3,
    right: 4,
    display: 'flex',
    gap: 2,
  },
  capacityTick: {
    width: 5,
    height: 5,
    border: \`1px solid var(--color-border-strong, var(--color-border))\`,
    boxSizing: 'border-box',
  },
  emptyCellDot: {
    width: 5,
    height: 5,
    borderRadius: 9999,
    backgroundColor: 'var(--color-border)',
    opacity: 0.6,
  },
  // Empty state for non-loaded dockets (PorticoMark glyph).
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: 'var(--color-text-secondary)',
    padding: 16,
    textAlign: 'center',
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
// PURE DATE MATH — fixed-string fixtures plus arithmetic helpers so the
// deadline chain is DERIVED, never stored post-hoc. All math runs on UTC
// date parts of ISO strings; no Date.now(), no locale dependence.
// ---------------------------------------------------------------------------

const TODAY = '2026-07-06'; // Monday — the suite's anchored "today".
const CLERK = 'D. Whitcomb';

const RULES = {
  answerDays: 21,
  discoveryDays: 120,
  dispositiveDays: 30,
  trialSettingDays: 45,
  cmcCourtDays: 10,
  serviceCompletionDays: 90,
} as const;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

function toUtc(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms: number): string {
  const dt = new Date(ms);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return \`\${y}-\${m}-\${d}\`;
}

const DAY_MS = 86400000;

/** Calendar-day offset: addDays('2026-06-30', 21) === '2026-07-21'. */
function addDays(iso: string, days: number): string {
  return fromUtc(toUtc(iso) + days * DAY_MS);
}

/** Court-day offset (skips Sat/Sun; no holiday table in this demo). */
function addCourtDays(iso: string, courtDays: number): string {
  let ms = toUtc(iso);
  let remaining = courtDays;
  while (remaining > 0) {
    ms += DAY_MS;
    const dow = new Date(ms).getUTCDay();
    if (dow !== 0 && dow !== 6) {
      remaining -= 1;
    }
  }
  return fromUtc(ms);
}

function dayOfWeek(iso: string): number {
  return new Date(toUtc(iso)).getUTCDay();
}

/** 'Tue, Jul 21' — the dual-field label form used everywhere. */
function fmtLabel(iso: string): string {
  const dt = new Date(toUtc(iso));
  return \`\${DAY_NAMES[dt.getUTCDay()]}, \${MONTH_NAMES[dt.getUTCMonth()]} \${dt.getUTCDate()}\`;
}

/** Short numeric '7/21' (adds /YY when the year differs from TODAY's). */
function fmtShort(iso: string): string {
  const dt = new Date(toUtc(iso));
  const base = \`\${dt.getUTCMonth() + 1}/\${dt.getUTCDate()}\`;
  return dt.getUTCFullYear() === 2026 ? base : \`\${base}/\${String(dt.getUTCFullYear()).slice(2)}\`;
}

/** Whole-day distance from TODAY, for 'due in 4d' captions. */
function daysFromToday(iso: string): number {
  return Math.round((toUtc(iso) - toUtc(TODAY)) / DAY_MS);
}

/** Weekend roll caption: 'Sat 11/7 → Mon 11/9' (advisory; the chain's
 * cross-check arithmetic stays on the raw computed date). */
function weekendRoll(iso: string): string | null {
  const dow = dayOfWeek(iso);
  if (dow !== 0 && dow !== 6) {
    return null;
  }
  const rolled = addDays(iso, dow === 6 ? 2 : 1);
  return \`\${DAY_NAMES[dow]} \${fmtShort(iso)} → Mon \${fmtShort(rolled)}\`;
}

// ---------------------------------------------------------------------------
// FIXTURES — one fictional registry. Judges, case numbers, and party
// names are consts referenced everywhere, never retyped.
// ---------------------------------------------------------------------------

interface Judge {
  id: string;
  name: string;
  dept: string;
}

const JUDGES: Judge[] = [
  {id: 'okafor', name: 'Hon. R. Okafor', dept: 'Dept 3'},
  {id: 'whitfield', name: 'Hon. L. Whitfield', dept: 'Dept 5'},
  {id: 'ibarra', name: 'Hon. M. Ibarra', dept: 'Dept 7'},
  {id: 'askew', name: 'Hon. T. Askew', dept: 'Dept 9'},
];

const PARTY_AMBERLINE = 'Amberline Builders LLC';

interface CourtCase {
  no: string;
  caption: string;
  shortCaption: string;
  dept: string;
  judge: string;
  filedIso: string;
  entryCount: number; // registry count for non-loaded dockets
  parties: string[];
}

// Stress fixture (1): the Trestle Ridge caption (100+ chars) must
// ellipsize in a 280px intake card (2-line clamp) AND in a 20px grid chip.
const CASES: Record<string, CourtCase> = {
  calloway: {
    no: 'CV-2026-01847',
    caption: 'Calloway v. Brightline Freight Co. & Kessler',
    shortCaption: 'Calloway v. Brightline',
    dept: 'Dept 3',
    judge: 'Hon. R. Okafor',
    filedIso: '2026-04-14',
    entryCount: 12,
    parties: ['Marisol Calloway', 'Brightline Freight Co.', 'Dale Kessler'],
  },
  trestle: {
    no: 'CV-2026-01512',
    caption:
      'Trestle Ridge Homeowners Association v. Amberline Builders LLC, Amberline Development Group LLC, and DOES 1–50',
    shortCaption: 'Trestle Ridge HOA v. Amberline Builders LLC, Amberline Development Group LLC…',
    dept: 'Dept 5',
    judge: 'Hon. L. Whitfield',
    filedIso: '2026-03-02',
    entryCount: 9,
    parties: ['Trestle Ridge Homeowners Association', PARTY_AMBERLINE, 'Amberline Development Group LLC'],
  },
  pena: {
    no: 'CV-2026-02033',
    caption: 'Pena v. Quarry Lake Med. Ctr.',
    shortCaption: 'Pena v. Quarry Lake',
    dept: 'Dept 7',
    judge: 'Hon. M. Ibarra',
    filedIso: '2026-05-18',
    entryCount: 4,
    parties: ['Alonso Pena', 'Quarry Lake Med. Ctr.'],
  },
  odom: {
    no: 'CR-2026-00891',
    caption: 'State v. Odom',
    shortCaption: 'State v. Odom',
    dept: 'Dept 9',
    judge: 'Hon. T. Askew',
    filedIso: '2026-02-11',
    entryCount: 17,
    parties: ['The State', 'Ray Odom'],
  },
  sable: {
    no: 'CV-2026-02201',
    caption: 'Amberline Builders LLC v. Sable Paving Co.',
    shortCaption: 'Amberline v. Sable Paving',
    dept: 'Dept 7',
    judge: 'Hon. M. Ibarra',
    filedIso: '2026-06-01',
    entryCount: 3,
    parties: [PARTY_AMBERLINE, 'Sable Paving Co.'],
  },
  marsh: {
    no: 'CV-2026-01655',
    caption: 'Marsh v. Delgado',
    shortCaption: 'Marsh v. Delgado',
    dept: 'Dept 5',
    judge: 'Hon. L. Whitfield',
    filedIso: '2026-03-20',
    entryCount: 11,
    parties: ['Corinne Marsh', 'Victor Delgado'],
  },
  halvorsen: {
    no: 'CV-2026-01920',
    caption: 'In re Estate of Halvorsen',
    shortCaption: 'In re Estate of Halvorsen',
    dept: 'Dept 5',
    judge: 'Hon. L. Whitfield',
    filedIso: '2026-04-30',
    entryCount: 6,
    parties: ['Estate of N. Halvorsen'],
  },
  foss: {
    no: 'CV-2026-01780',
    caption: 'Foss v. Ridgeline Storage LLC',
    shortCaption: 'Foss v. Ridgeline Storage',
    dept: 'Dept 9',
    judge: 'Hon. T. Askew',
    filedIso: '2026-04-06',
    entryCount: 8,
    parties: ['Peter Foss', 'Ridgeline Storage LLC'],
  },
};

// --- Docket entries for CV-2026-01847 --------------------------------------

interface DocketEntry {
  id: string;
  num: string; // '5.1' for nunc pro tunc — renumbering is forbidden by design
  isNunc?: boolean;
  isVacated?: boolean;
  vacatedBy?: string; // entry num of the vacating order
  vacates?: string; // reciprocal cross-link
  filedIso: string;
  text: string;
  isTwoLine?: boolean; // stress fixture (2): entry #9 runs 2 lines at 56px
  filer: string;
  docType: string;
  nuncMeta?: string;
  servedIso?: string; // for proofs of service — feeds computeChain
  servedParty?: 'kessler' | 'brightline';
  isJustFiled?: boolean; // stamp-press animation target
}

// Cross-checks (verified; do not alter): Kessler served 6/5 + 21d = 6/26;
// 6/26 + 14d stip (entries #6/#8) = 7/10 → 'due in 4d' from TODAY 7/6.
// Service completion: filed 4/14 + 90d = 7/13 (Apr 16 + May 31 + Jun 30 +
// Jul 13 = 90).
const INITIAL_ENTRIES: DocketEntry[] = [
  {
    id: 'e1', num: '1', filedIso: '2026-04-14',
    text: 'Complaint for damages — negligence; motor vehicle',
    filer: 'Calloway', docType: 'Complaint',
  },
  {
    id: 'e2', num: '2', filedIso: '2026-04-14',
    text: 'Civil cover sheet',
    filer: 'Calloway', docType: 'Cover sheet',
  },
  {
    id: 'e3', num: '3', filedIso: '2026-04-15',
    text: 'Summons issued — Kessler & Brightline Freight Co.',
    filer: 'Clerk', docType: 'Summons',
  },
  {
    id: 'e4', num: '4', filedIso: '2026-06-08', servedIso: '2026-06-05', servedParty: 'kessler',
    text: 'Proof of service — Dale Kessler, served 6/5',
    filer: 'Calloway', docType: 'Proof of service',
  },
  {
    id: 'e5', num: '5', filedIso: '2026-04-15',
    text: 'Notice of case assignment',
    filer: 'Clerk', docType: 'Notice',
  },
  {
    // Stress fixture (7): decimal row 5.1 between 5 and 6 — entered late,
    // effective earlier; there is deliberately no reorder affordance.
    id: 'e5-1', num: '5.1', isNunc: true, filedIso: '2026-05-02',
    text: 'Corrected notice of case assignment naming Hon. R. Okafor, Dept 3',
    filer: 'Clerk', docType: 'Nunc pro tunc',
    nuncMeta: 'entered 5/2, effective nunc pro tunc 4/15',
  },
  {
    id: 'e6', num: '6', filedIso: '2026-06-22',
    text: 'Stipulation: 14-day extension of time for Kessler to answer',
    filer: 'Kessler', docType: 'Stipulation',
  },
  {
    // Stress fixture (6): vacated + reciprocal cross-link pills #7 ↔ #11.
    id: 'e7', num: '7', filedIso: '2026-06-24', isVacated: true, vacatedBy: '11',
    text: 'Notice of hearing — OSC re service of Brightline set 7/15',
    filer: 'Clerk', docType: 'Notice of hearing',
  },
  {
    id: 'e8', num: '8', filedIso: '2026-06-25',
    text: 'Order approving stipulation; Kessler answer due 7/10',
    filer: 'Court', docType: 'Order',
  },
  {
    // Stress fixture (2): the designated TWO-LINE row (56px).
    id: 'e9', num: '9', filedIso: '2026-06-26', isTwoLine: true,
    text:
      'Declaration of due diligence re service on Brightline Freight Co. — three attempts at the registered agent; skip trace opened, substituted service to follow',
    filer: 'Calloway', docType: 'Declaration',
  },
  {
    id: 'e10', num: '10', filedIso: '2026-06-29',
    text: 'Plaintiff case management statement',
    filer: 'Calloway', docType: 'CM statement',
  },
  {
    id: 'e11', num: '11', filedIso: '2026-07-01', vacates: '7',
    text: 'Order vacating OSC hearing of 7/15',
    filer: 'Court', docType: 'Order',
  },
  {
    id: 'e12', num: '12', filedIso: '2026-07-02',
    text: 'Notice of change of firm address — counsel for Calloway',
    filer: 'Calloway', docType: 'Notice',
  },
];

// Entry #13 — appended by acceptFiling, never present at load.
const ENTRY_13: DocketEntry = {
  id: 'e13', num: '13', filedIso: TODAY, servedIso: '2026-06-30', servedParty: 'brightline',
  text: 'Proof of service — Brightline Freight Co., served 6/30',
  filer: 'Calloway', docType: 'Proof of service',
  isJustFiled: true,
};

// --- Intake queue -----------------------------------------------------------

interface Filing {
  id: string;
  title: string;
  caseKey: keyof typeof CASES;
  metaLine: string;
  isPinned?: boolean; // the signature filing
}

// Exactly 6 pending (badge '6 pending'; per-case 2 + 2 + 1 + 1 = 6).
const FILINGS: Filing[] = [
  {
    id: 'f-brightline-pos',
    title: 'Proof of Service — Brightline Freight Co.',
    caseKey: 'calloway',
    metaLine: 'served 6/30 · recd 7/6 8:12a',
    isPinned: true,
  },
  {
    id: 'f-kessler-answer',
    title: 'Answer & Affirmative Defenses — Kessler',
    caseKey: 'calloway',
    metaLine: 'recd 7/6 8:40a',
  },
  {
    id: 'f-compel',
    title: 'Motion to Compel Further Responses (Set One)',
    caseKey: 'trestle',
    metaLine: 'recd 7/6 7:55a',
  },
  {
    id: 'f-exparte',
    title: 'Ex Parte Application — shorten time on motion to compel',
    caseKey: 'trestle',
    metaLine: 'recd 7/6 8:02a',
  },
  {
    id: 'f-appearance',
    title: 'Notice of Appearance — defense counsel',
    caseKey: 'pena',
    metaLine: 'recd 7/6 8:21a',
  },
  {
    id: 'f-stip-continue',
    title: 'Stipulation to Continue — sentencing hearing',
    caseKey: 'odom',
    metaLine: 'recd 7/6 8:33a',
  },
];

// --- Session grid: week of Jul 6 --------------------------------------------

const SLOT_TIMES = ['9:00', '10:30', '1:30', '3:00'] as const;
type SlotTime = (typeof SLOT_TIMES)[number];

interface GridDay {
  id: string;
  iso: string;
  label: string; // 'Mon 7/6'
}

const GRID_DAYS: GridDay[] = [
  {id: 'mon', iso: '2026-07-06', label: 'Mon 7/6'},
  {id: 'tue', iso: '2026-07-07', label: 'Tue 7/7'},
  {id: 'wed', iso: '2026-07-08', label: 'Wed 7/8'},
  {id: 'thu', iso: '2026-07-09', label: 'Thu 7/9'},
  {id: 'fri', iso: '2026-07-10', label: 'Fri 7/10'},
];

interface SessionChip {
  id: string;
  dayId: string;
  judgeId: string;
  slot: SlotTime;
  caseKey: keyof typeof CASES;
  label: string; // chip text; Trestle uses the long caption (truncation)
  kind: string; // hearing type, for the tooltip
}

// 23 sessions pre-acceptance: Mon 7 + Tue 5 + Wed 4 + Thu 4 + Fri 3 = 23.
// Mon layout (1+1+3+1+1 = 7): Whitfield 9:00 AT CAPACITY (stress 3);
// Askew's Mon row fully empty (stress 4); CONFLICT (stress 5): party
// 'Amberline Builders LLC' in Whitfield 10:30 AND Ibarra 10:30.
const INITIAL_SESSIONS: SessionChip[] = [
  // Mon 7/6 — 7 chips
  {id: 's-mon-1', dayId: 'mon', judgeId: 'okafor', slot: '9:00', caseKey: 'odom', label: CASES.odom.shortCaption, kind: 'Sentencing'},
  {id: 's-mon-2', dayId: 'mon', judgeId: 'okafor', slot: '10:30', caseKey: 'pena', label: CASES.pena.shortCaption, kind: 'CMC'},
  {id: 's-mon-3', dayId: 'mon', judgeId: 'whitfield', slot: '9:00', caseKey: 'marsh', label: CASES.marsh.shortCaption, kind: 'Calendar call'},
  {id: 's-mon-4', dayId: 'mon', judgeId: 'whitfield', slot: '9:00', caseKey: 'halvorsen', label: CASES.halvorsen.shortCaption, kind: 'Calendar call'},
  {id: 's-mon-5', dayId: 'mon', judgeId: 'whitfield', slot: '9:00', caseKey: 'foss', label: CASES.foss.shortCaption, kind: 'Calendar call'},
  {id: 's-mon-6', dayId: 'mon', judgeId: 'whitfield', slot: '10:30', caseKey: 'trestle', label: CASES.trestle.shortCaption, kind: 'Motion hearing'},
  {id: 's-mon-7', dayId: 'mon', judgeId: 'ibarra', slot: '10:30', caseKey: 'sable', label: CASES.sable.shortCaption, kind: 'OSC'},
  // Tue 7/7 — 5 chips
  {id: 's-tue-1', dayId: 'tue', judgeId: 'okafor', slot: '9:00', caseKey: 'marsh', label: CASES.marsh.shortCaption, kind: 'Motion hearing'},
  {id: 's-tue-2', dayId: 'tue', judgeId: 'whitfield', slot: '1:30', caseKey: 'pena', label: CASES.pena.shortCaption, kind: 'OSC'},
  {id: 's-tue-3', dayId: 'tue', judgeId: 'ibarra', slot: '9:00', caseKey: 'trestle', label: CASES.trestle.shortCaption, kind: 'Ex parte'},
  {id: 's-tue-4', dayId: 'tue', judgeId: 'ibarra', slot: '3:00', caseKey: 'halvorsen', label: CASES.halvorsen.shortCaption, kind: 'Probate review'},
  {id: 's-tue-5', dayId: 'tue', judgeId: 'askew', slot: '10:30', caseKey: 'odom', label: CASES.odom.shortCaption, kind: 'Status'},
  // Wed 7/8 — 4 chips
  {id: 's-wed-1', dayId: 'wed', judgeId: 'okafor', slot: '1:30', caseKey: 'foss', label: CASES.foss.shortCaption, kind: 'CMC'},
  {id: 's-wed-2', dayId: 'wed', judgeId: 'whitfield', slot: '9:00', caseKey: 'sable', label: CASES.sable.shortCaption, kind: 'CMC'},
  {id: 's-wed-3', dayId: 'wed', judgeId: 'ibarra', slot: '10:30', caseKey: 'pena', label: CASES.pena.shortCaption, kind: 'Motion hearing'},
  {id: 's-wed-4', dayId: 'wed', judgeId: 'askew', slot: '9:00', caseKey: 'marsh', label: CASES.marsh.shortCaption, kind: 'Settlement conf'},
  // Thu 7/9 — 4 chips (becomes 5 when the CMC chip drops in)
  {id: 's-thu-1', dayId: 'thu', judgeId: 'okafor', slot: '9:00', caseKey: 'halvorsen', label: CASES.halvorsen.shortCaption, kind: 'Probate review'},
  {id: 's-thu-2', dayId: 'thu', judgeId: 'whitfield', slot: '10:30', caseKey: 'foss', label: CASES.foss.shortCaption, kind: 'Motion hearing'},
  {id: 's-thu-3', dayId: 'thu', judgeId: 'ibarra', slot: '1:30', caseKey: 'odom', label: CASES.odom.shortCaption, kind: 'Pretrial'},
  {id: 's-thu-4', dayId: 'thu', judgeId: 'askew', slot: '3:00', caseKey: 'trestle', label: CASES.trestle.shortCaption, kind: 'OSC'},
  // Fri 7/10 — 3 chips (becomes 4 when the answer-tracking chip drops in)
  {id: 's-fri-1', dayId: 'fri', judgeId: 'okafor', slot: '9:00', caseKey: 'sable', label: CASES.sable.shortCaption, kind: 'Motion hearing'},
  {id: 's-fri-2', dayId: 'fri', judgeId: 'whitfield', slot: '3:00', caseKey: 'marsh', label: CASES.marsh.shortCaption, kind: 'Status'},
  {id: 's-fri-3', dayId: 'fri', judgeId: 'ibarra', slot: '9:00', caseKey: 'pena', label: CASES.pena.shortCaption, kind: 'CMC'},
];

// Chips dropped by acceptFiling — Thu 4→5, Fri 3→4, header 23→25
// (7 + 5 + 4 + 5 + 4 = 25 ✓).
const CMC_CHIP: SessionChip = {
  id: 's-thu-cmc', dayId: 'thu', judgeId: 'okafor', slot: '10:30', caseKey: 'calloway',
  label: \`CMC · \${CASES.calloway.no}\`, kind: 'Case management conference',
};
const ANSWER_CALL_CHIP: SessionChip = {
  id: 's-fri-answer', dayId: 'fri', judgeId: 'okafor', slot: '3:00', caseKey: 'calloway',
  label: \`Answer tracking call · \${CASES.calloway.no}\`, kind: 'Answer tracking call',
};

// ---------------------------------------------------------------------------
// computeChain — the pure selector. Every deadline derives from RULES
// offsets against dates found IN the entries; nothing is stored post-hoc,
// so the acceptance recompute is real, not scripted.
// ---------------------------------------------------------------------------

type NodeStatus = 'done' | 'amber' | 'amber-pulse' | 'ghost' | 'scheduled';

interface ChainNode {
  id: string;
  rule: string;
  title: string;
  dateIso: string;
  dateLabel: string;
  math: string; // the visible arithmetic line
  status: NodeStatus;
  caption?: string; // due-in / provisional / booked captions
  rollCaption?: string; // weekend roll-forward
  tolling?: string; // hatched extension segment text
  triggerEntryNum: string; // sequencer row highlighted on node click
  offsetToNext?: string; // '+120d' chip on the connector below this node
  offsetMathFull?: string; // popover: the full arithmetic sentence
}

function computeChain(entries: DocketEntry[]): ChainNode[] {
  const kesslerProof = entries.find(e => e.servedParty === 'kessler');
  const brightlineProof = entries.find(e => e.servedParty === 'brightline');
  const nodes: ChainNode[] = [];

  // Kessler answer: served 6/5 + 21d = 6/26, tolled +14d (entries #6/#8)
  // → 7/10. Tolling is modeled as a rule-visible extension, not a date edit.
  const kesslerServed = kesslerProof?.servedIso ?? '2026-06-05';
  const kesslerBase = addDays(kesslerServed, RULES.answerDays); // 2026-06-26
  const kesslerDue = addDays(kesslerBase, 14); // 2026-07-10
  nodes.push({
    id: 'n-kessler-answer',
    rule: 'RCP 12(a)',
    title: 'Answer — Kessler',
    dateIso: kesslerDue,
    dateLabel: fmtLabel(kesslerDue),
    math: \`served \${fmtShort(kesslerServed)} + \${RULES.answerDays}d = \${fmtShort(kesslerBase)}\`,
    tolling: \`+14d stip, entries #6/#8: \${fmtShort(kesslerBase)} → \${fmtShort(kesslerDue)}\`,
    status: 'amber',
    caption: \`due in \${daysFromToday(kesslerDue)}d\`,
    triggerEntryNum: '4',
  });

  // Service completion: filed 4/14 + 90d = 7/13.
  const filed = CASES.calloway.filedIso;
  const serviceDue = addDays(filed, RULES.serviceCompletionDays); // 2026-07-13
  const isServed = brightlineProof != null;
  nodes.push({
    id: 'n-service',
    rule: 'RCP 4(m)',
    title: 'Service completion — all defendants',
    dateIso: serviceDue,
    dateLabel: fmtLabel(serviceDue),
    math: \`filed \${fmtShort(filed)} + \${RULES.serviceCompletionDays}d = \${fmtShort(serviceDue)}\`,
    status: isServed ? 'done' : 'amber-pulse',
    caption: isServed ? 'satisfied — 2 of 2 served' : \`due in \${daysFromToday(serviceDue)}d\`,
    triggerEntryNum: isServed ? '13' : '9',
  });

  // Brightline service → answer. Ghost until the proof is docketed.
  if (isServed && brightlineProof?.servedIso != null) {
    const bServed = brightlineProof.servedIso; // 2026-06-30
    const bAnswer = addDays(bServed, RULES.answerDays); // 2026-07-21
    nodes.push({
      id: 'n-brightline-service',
      rule: 'RCP 4(d)',
      title: 'Service — Brightline Freight Co.',
      dateIso: bServed,
      dateLabel: fmtLabel(bServed),
      math: \`proof docketed \${fmtShort(TODAY)} · served \${fmtShort(bServed)}\`,
      status: 'done',
      triggerEntryNum: '13',
      offsetToNext: \`+\${RULES.answerDays}d\`,
      offsetMathFull: \`Answer — Brightline = served \${fmtShort(bServed)} + \${RULES.answerDays}d = \${fmtShort(bAnswer)}\`,
    });
    nodes.push({
      id: 'n-brightline-answer',
      rule: 'RCP 12(a)',
      title: 'Answer — Brightline',
      dateIso: bAnswer,
      dateLabel: fmtLabel(bAnswer),
      math: \`served \${fmtShort(bServed)} + \${RULES.answerDays}d = \${fmtShort(bAnswer)}\`,
      status: 'amber',
      caption: \`due in \${daysFromToday(bAnswer)}d\`,
      triggerEntryNum: '13',
    });
    // CMC: within 10 COURT days of the proof — by Mon 7/20, booked Thu 7/9.
    const cmcOuter = addCourtDays(TODAY, RULES.cmcCourtDays); // 2026-07-20
    nodes.push({
      id: 'n-cmc',
      rule: 'Local 3.110',
      title: 'Case management conference',
      dateIso: '2026-07-09',
      dateLabel: fmtLabel('2026-07-09'),
      math: \`proof \${fmtShort(TODAY)} + \${RULES.cmcCourtDays} court days = by \${fmtLabel(cmcOuter)}\`,
      status: 'scheduled',
      caption: \`booked Thu 7/9 · outer bound counts court days only (Sat/Sun skipped)\`,
      triggerEntryNum: '13',
    });
  } else {
    nodes.push({
      id: 'n-brightline-service',
      rule: 'RCP 4(d)',
      title: 'Service — Brightline Freight Co.',
      dateIso: serviceDue,
      dateLabel: 'awaiting proof',
      math: \`no proof on file · declaration at entry #9\`,
      status: 'ghost',
      caption: 'awaiting trigger — proof of service',
      triggerEntryNum: '9',
    });
  }

  // Discovery cutoff: LAST answer due + 120d. Pre: 7/10 + 120 = 11/7
  // (Jul 21 + Aug 31 + Sep 30 + Oct 31 + Nov 7 = 120). Post: 7/21 + 120 =
  // 11/18 (Jul 10 + Aug 31 + Sep 30 + Oct 31 + Nov 18 = 120).
  const lastAnswer = isServed && brightlineProof?.servedIso != null
    ? addDays(brightlineProof.servedIso, RULES.answerDays)
    : kesslerDue;
  const provisional = !isServed;
  const discovery = addDays(lastAnswer, RULES.discoveryDays);
  const dispositive = addDays(discovery, RULES.dispositiveDays);
  const trialSetting = addDays(dispositive, RULES.trialSettingDays);
  const provCaption = provisional ? 'provisional — Brightline unserved' : undefined;
  nodes.push({
    id: 'n-discovery',
    rule: 'RCP 26(f)',
    title: 'Discovery cutoff',
    dateIso: discovery,
    dateLabel: fmtLabel(discovery),
    math: \`last answer \${fmtShort(lastAnswer)} + \${RULES.discoveryDays}d = \${fmtShort(discovery)}\`,
    status: provisional ? 'ghost' : 'scheduled',
    caption: provCaption,
    rollCaption: weekendRoll(discovery) ?? undefined, // Sat 11/7 → Mon 11/9 pre-acceptance
    triggerEntryNum: isServed ? '13' : '8',
    offsetToNext: \`+\${RULES.dispositiveDays}d\`,
    offsetMathFull: \`Dispositive motions = discovery \${fmtShort(discovery)} + \${RULES.dispositiveDays}d = \${fmtShort(dispositive)}\`,
  });
  nodes.push({
    id: 'n-dispositive',
    rule: 'RCP 56(b)',
    title: 'Dispositive motion deadline',
    dateIso: dispositive,
    dateLabel: fmtLabel(dispositive),
    math: \`discovery \${fmtShort(discovery)} + \${RULES.dispositiveDays}d = \${fmtShort(dispositive)}\`,
    status: provisional ? 'ghost' : 'scheduled',
    caption: provCaption,
    rollCaption: weekendRoll(dispositive) ?? undefined,
    triggerEntryNum: isServed ? '13' : '8',
    offsetToNext: \`+\${RULES.trialSettingDays}d\`,
    offsetMathFull: \`Trial-setting conference = dispositive \${fmtShort(dispositive)} + \${RULES.trialSettingDays}d = \${fmtShort(trialSetting)}\`,
  });
  nodes.push({
    id: 'n-trial-setting',
    rule: 'Local 8.2',
    title: 'Trial-setting conference',
    dateIso: trialSetting,
    dateLabel: fmtLabel(trialSetting),
    math: \`dispositive \${fmtShort(dispositive)} + \${RULES.trialSettingDays}d = \${fmtShort(trialSetting)}\`,
    status: provisional ? 'ghost' : 'scheduled',
    caption: provCaption,
    rollCaption: weekendRoll(trialSetting) ?? undefined,
    triggerEntryNum: isServed ? '13' : '8',
  });

  // Kessler-answer connector chip precedes the discovery node visually;
  // give the first node its offset chip to the discovery stage.
  nodes[0].offsetToNext = \`+\${RULES.discoveryDays}d\`;
  nodes[0].offsetMathFull = \`Discovery cutoff = last answer \${fmtShort(lastAnswer)} + \${RULES.discoveryDays}d = \${fmtShort(discovery)}\`;
  return nodes;
}

// ---------------------------------------------------------------------------
// COMPONENT STYLES (part 2) — buttons-in-chip resets and band-B strip.
// ---------------------------------------------------------------------------

const cstyles: Record<string, CSSProperties> = {
  bareButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    textAlign: 'start',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  chipLabelButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    position: 'relative',
  },
  // 20px visual, >=24px hit area via the .cdc-hit ::after inset of -4px.
  iconActionButton: {
    width: 20,
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: HAIRLINE,
    borderRadius: 6,
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
    padding: 0,
  },
  conflictIconButton: {
    width: 14,
    height: 14,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    padding: 0,
    color: AMBER_TEXT,
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
  },
  railStripButton: {
    width: 36,
    height: 48,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    background: 'none',
    border: HAIRLINE,
    borderRadius: 6,
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    position: 'relative',
    padding: 0,
  },
  nextDeadlineDot: {width: 8, height: 8, borderRadius: 9999, backgroundColor: AMBER},
  popBody: {padding: 12, maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 4},
  popMath: {fontSize: 12, fontFamily: MONO, fontVariantNumeric: 'tabular-nums'},
  dialogBody: {display: 'flex', flexDirection: 'column', minHeight: 0, maxHeight: '60vh'},
};

// ---------------------------------------------------------------------------
// useElementWidth — container-width ResizeObserver (grid-feeder pattern).
// Width 0 = first pre-observer frame; callers fall back to viewport
// queries for that frame only.
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
// PorticoMark — 28x28 inline SVG: two 3px column strokes (x=7, x=21,
// y=10..24), a lintel rect (x=4..24, y=5, h=3), and a 5px seal circle at
// (14,17). Single currentColor; TopBar mark and empty-state glyph.
// ---------------------------------------------------------------------------

function PorticoMark({size = 28}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden focusable="false">
      <rect x={4} y={5} width={20} height={3} fill="currentColor" />
      <line x1={7} y1={10} x2={7} y2={24} stroke="currentColor" strokeWidth={3} />
      <line x1={21} y1={10} x2={21} y2={24} stroke="currentColor" strokeWidth={3} />
      <circle cx={14} cy={17} r={2.5} fill="currentColor" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PanelHeader — 44px, 13px semibold title, right-aligned count badge.
// ---------------------------------------------------------------------------

interface PanelHeaderProps {
  icon: typeof CheckIcon;
  title: string;
  badge: string;
}

function PanelHeader({icon, title, badge}: PanelHeaderProps) {
  return (
    <div style={styles.panelHeader}>
      <Icon icon={icon} size="sm" color="secondary" />
      <Heading level={2} style={styles.panelTitle}>
        {title}
      </Heading>
      <span style={styles.countBadge}>{badge}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// INTAKE QUEUE — 280px aside. Cards 64px (2-line title + meta row with
// inline Accept/Reject icon actions). Stress fixture (10): 6 cards force
// the aside's own scroll; the pane is the single scroll container.
// ---------------------------------------------------------------------------

interface IntakeQueueProps {
  filings: Filing[];
  selectedCaseKey: string;
  onSelectCase: (caseKey: keyof typeof CASES) => void;
  onAccept: (filingId: string) => void;
  onReject: (filingId: string) => void;
}

function IntakeQueue({filings, selectedCaseKey, onSelectCase, onAccept, onReject}: IntakeQueueProps) {
  return (
    <>
      <PanelHeader icon={InboxIcon} title="E-filing intake" badge={\`\${filings.length} pending\`} />
      <div style={styles.intakeScroll}>
        {filings.map(filing => {
          const kase = CASES[filing.caseKey];
          const cardStyle: CSSProperties = {
            ...styles.intakeCard,
            ...(filing.isPinned ? styles.intakeCardPinned : null),
            ...(selectedCaseKey === kase.no ? styles.intakeCardSelected : null),
          };
          return (
            <div key={filing.id} style={cardStyle}>
              <button
                type="button"
                className="cdc-focusable"
                style={cstyles.bareButton}
                onClick={() => onSelectCase(filing.caseKey)}
                aria-label={\`Select case \${kase.no} — \${filing.title}\`}>
                <span style={styles.intakeTitle}>
                  {filing.title} — {kase.caption}
                </span>
              </button>
              <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                <span style={{...styles.intakeMeta, flex: 1}}>
                  {kase.no} · {filing.metaLine}
                </span>
                <Tooltip content="Accept — file-stamps and docketes the filing">
                  <button
                    type="button"
                    className="cdc-focusable cdc-hit"
                    style={{...cstyles.iconActionButton, color: GREEN_TEXT}}
                    onClick={() => onAccept(filing.id)}
                    aria-label={\`Accept filing: \${filing.title}\`}>
                    <Icon icon={CheckIcon} size="xsm" color="inherit" />
                  </button>
                </Tooltip>
                <Tooltip content="Reject — bounce to filer with a deficiency notice">
                  <button
                    type="button"
                    className="cdc-focusable cdc-hit"
                    style={cstyles.iconActionButton}
                    onClick={() => onReject(filing.id)}
                    aria-label={\`Reject filing: \${filing.title}\`}>
                    <Icon icon={XIcon} size="xsm" color="inherit" />
                  </button>
                </Tooltip>
              </div>
            </div>
          );
        })}
        {filings.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{color: 'var(--color-text-secondary)'}} aria-hidden>
              <PorticoMark />
            </span>
            <Text type="supporting" size="xsm" color="secondary">
              Intake clear — nothing awaiting review.
            </Text>
          </div>
        ) : null}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// CASE HEADER BAND (88px) + StatusFlagRow — flags derive from the chain;
// clicking a flag scrolls the rail to its governing node.
// ---------------------------------------------------------------------------

interface HeaderFlag {
  id: string;
  label: string;
  tone: 'amber' | 'green' | 'unlit';
  isPulsing?: boolean;
  nodeId: string;
}

interface CaseHeaderBandProps {
  kase: CourtCase;
  flags: HeaderFlag[];
  onFlagClick: (nodeId: string) => void;
}

function CaseHeaderBand({kase, flags, onFlagClick}: CaseHeaderBandProps) {
  return (
    <div style={styles.caseHeader}>
      <div style={styles.caseNumberLine}>
        <Icon icon={ScaleIcon} size="sm" color="secondary" />
        <span>{kase.no}</span>
        <span aria-hidden>·</span>
        <span>{kase.dept}</span>
        <span aria-hidden>·</span>
        <span>{kase.judge}</span>
        <span aria-hidden>·</span>
        <span>filed {fmtShort(kase.filedIso)}</span>
      </div>
      <Heading level={1} style={styles.caseCaption}>
        {kase.caption}
      </Heading>
      <div style={styles.flagRow}>
        {flags.map(flag => {
          const tone =
            flag.tone === 'amber'
              ? styles.flagAmber
              : flag.tone === 'green'
                ? styles.flagGreen
                : styles.flagUnlit;
          return (
            <button
              key={flag.id}
              type="button"
              className={\`cdc-focusable cdc-hit\${flag.isPulsing ? ' cdc-pulse' : ''}\`}
              style={{...styles.flag, ...tone}}
              onClick={() => onFlagClick(flag.nodeId)}
              aria-label={\`\${flag.label} — show governing deadline\`}>
              {flag.tone === 'amber' ? <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" /> : null}
              {flag.tone === 'green' ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
              {flag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DOCKET ENTRY SEQUENCER — continuous ledger; 32px immutable number
// gutter; 88px file-stamp column; nunc pro tunc decimals render BETWEEN
// integers and renumbering is forbidden by design (no reorder affordance).
// Vacated rows carry line-through + 'VACATED' badge + aria-label suffix
// (strike-through is never the sole indicator) + cross-link pills.
// ---------------------------------------------------------------------------

interface DocketSequencerProps {
  entries: DocketEntry[];
  highlightNum: string | null;
  flashNum: string | null;
  isScrollOwner: boolean;
  registerRow: (num: string, el: HTMLDivElement | null) => void;
  onCrossLink: (num: string) => void;
}

function DocketSequencer({
  entries,
  highlightNum,
  flashNum,
  isScrollOwner,
  registerRow,
  onCrossLink,
}: DocketSequencerProps) {
  const integerCount = entries.filter(e => !e.isNunc).length;
  const nuncCount = entries.filter(e => e.isNunc).length;
  const vacatedCount = entries.filter(e => e.isVacated).length;
  return (
    <>
      <PanelHeader
        icon={StampIcon}
        title="Docket"
        badge={\`\${integerCount} entries · \${nuncCount} nunc pro tunc · \${vacatedCount} vacated\`}
      />
      <div style={isScrollOwner ? styles.docketScroll : undefined}>
        {entries.map(entry => {
          const rowStyle: CSSProperties = {
            ...styles.docketRow,
            ...(entry.isTwoLine ? styles.docketRowTwoLine : null),
            ...(highlightNum === entry.num ? styles.entryHighlight : null),
          };
          const ariaLabel = entry.isVacated
            ? \`Entry \${entry.num}, vacated by entry \${entry.vacatedBy}\`
            : \`Entry \${entry.num}\`;
          return (
            <div
              key={entry.id}
              ref={el => registerRow(entry.num, el)}
              tabIndex={-1}
              className={\`cdc-focusable\${flashNum === entry.num ? ' cdc-flash' : ''}\`}
              style={rowStyle}
              aria-label={ariaLabel}>
              <div
                style={
                  entry.isNunc
                    ? {...styles.docketGutter, ...styles.docketGutterNunc}
                    : styles.docketGutter
                }>
                {entry.num}
              </div>
              <div style={styles.stampCol}>
                {entry.isJustFiled ? (
                  <span className="cdc-stamp" style={styles.stampBox}>
                    <span>FILED {entry.filedIso}</span>
                    <span>{CLERK}, Clerk</span>
                  </span>
                ) : (
                  fmtShort(entry.filedIso)
                )}
              </div>
              <div style={styles.entryBody}>
                <span
                  style={
                    entry.isVacated
                      ? {...styles.entryText, ...styles.entryTextVacated}
                      : styles.entryText
                  }>
                  {entry.text}
                </span>
                {(entry.nuncMeta != null || entry.isVacated || entry.vacates != null) && (
                  <div style={styles.entryMetaLine}>
                    {entry.nuncMeta != null ? <span>{entry.nuncMeta}</span> : null}
                    {entry.isVacated ? <span style={styles.vacatedBadge}>VACATED</span> : null}
                    {entry.isVacated && entry.vacatedBy != null ? (
                      <button
                        type="button"
                        className="cdc-focusable cdc-hit"
                        style={styles.crossLinkPill}
                        onClick={() => onCrossLink(entry.vacatedBy as string)}
                        aria-label={\`Go to vacating order, entry \${entry.vacatedBy}\`}>
                        by #{entry.vacatedBy}
                      </button>
                    ) : null}
                    {entry.vacates != null ? (
                      <button
                        type="button"
                        className="cdc-focusable cdc-hit"
                        style={styles.crossLinkPill}
                        onClick={() => onCrossLink(entry.vacates as string)}
                        aria-label={\`Go to vacated entry \${entry.vacates}\`}>
                        vacates #{entry.vacates}
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
              <div style={styles.entryRight}>
                <span style={styles.filerChip}>{entry.filer}</span>
                <span style={styles.docTypeBadge}>{entry.docType}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Empty docket for cases whose ledger is not loaded in this console view.
interface DocketEmptyStateProps {
  kase: CourtCase;
  onReturn: () => void;
}

function DocketEmptyState({kase, onReturn}: DocketEmptyStateProps) {
  return (
    <div style={styles.emptyState}>
      <span aria-hidden>
        <PorticoMark size={40} />
      </span>
      <Text type="supporting" size="sm" color="secondary">
        {kase.no} — {kase.entryCount} entries on file. The full ledger opens in the Registry;
        this console holds today&apos;s working docket.
      </Text>
      <Button
        label={\`Return to \${CASES.calloway.no}\`}
        variant="secondary"
        size="sm"
        onClick={onReturn}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DEADLINE CHAIN RAIL — ol of 72px nodes on a 24px connector spine. The
// offset math is VISIBLE TEXT so screen readers get the arithmetic;
// connector chips open a Popover with the full derivation sentence.
// ---------------------------------------------------------------------------

const NODE_DOT_STYLE: Record<NodeStatus, CSSProperties> = {
  done: {backgroundColor: GREEN},
  amber: {backgroundColor: AMBER},
  'amber-pulse': {backgroundColor: AMBER},
  ghost: {border: \`1px dashed var(--color-border)\`, backgroundColor: 'transparent'},
  scheduled: {backgroundColor: BRAND_FILL},
};

interface DeadlineRailProps {
  nodes: ChainNode[];
  deltas: Record<string, string>;
  registerNode: (nodeId: string, el: HTMLLIElement | null) => void;
  onNodeClick: (triggerEntryNum: string) => void;
}

function DeadlineRail({nodes, deltas, registerNode, onNodeClick}: DeadlineRailProps) {
  return (
    <>
      <PanelHeader icon={CalendarClockIcon} title="Deadline chain" badge={\`\${nodes.length} deadlines\`} />
      <div style={styles.railScroll}>
        <ol style={styles.railList}>
          {nodes.map((node, i) => {
            const isLast = i === nodes.length - 1;
            const delta = deltas[node.id];
            return (
              <li key={node.id} ref={el => registerNode(node.id, el)}>
                <div style={styles.railItem}>
                  <div style={styles.railSpineCol} aria-hidden>
                    <span
                      className={node.status === 'amber-pulse' ? 'cdc-pulse' : undefined}
                      style={{...styles.railDot, ...NODE_DOT_STYLE[node.status]}}
                    />
                    {!isLast ? (
                      <span
                        style={node.tolling != null ? styles.railSpineHatched : styles.railSpine}
                      />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="cdc-focusable"
                    style={
                      node.status === 'ghost'
                        ? {...styles.railNode, ...styles.railNodeGhost}
                        : styles.railNode
                    }
                    onClick={() => onNodeClick(node.triggerEntryNum)}
                    aria-label={\`\${node.title}, \${node.dateLabel}. \${node.math}. Highlights trigger entry \${node.triggerEntryNum}.\`}>
                    <span style={styles.railRule}>{node.rule}</span>
                    <span style={{display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0}}>
                      <span style={{...styles.railTitle, flex: 1, minWidth: 0}}>{node.title}</span>
                      <span style={styles.railDate}>{node.dateLabel}</span>
                      {delta != null ? (
                        <span className="cdc-delta" style={styles.deltaBadge}>
                          {delta}
                        </span>
                      ) : null}
                    </span>
                    <span style={styles.railMath}>{node.math}</span>
                    {node.tolling != null ? <span style={styles.tollingSeg}>{node.tolling}</span> : null}
                    {node.rollCaption != null ? (
                      <span style={styles.railCaption}>rolls: {node.rollCaption}</span>
                    ) : null}
                    {node.caption != null ? (
                      <span
                        style={{
                          ...styles.railMath,
                          color: node.status === 'done' ? GREEN_TEXT : AMBER_TEXT,
                        }}>
                        {node.caption}
                      </span>
                    ) : null}
                  </button>
                </div>
                {node.offsetToNext != null && !isLast ? (
                  <div style={styles.offsetChipRow}>
                    <Popover
                      content={
                        <div style={cstyles.popBody}>
                          <Text type="label" size="sm">
                            Offset derivation
                          </Text>
                          <span style={cstyles.popMath}>{node.offsetMathFull}</span>
                        </div>
                      }>
                      <button
                        type="button"
                        className="cdc-focusable cdc-hit"
                        style={styles.offsetChip}
                        aria-label={\`Offset \${node.offsetToNext} — show full arithmetic\`}>
                        {node.offsetToNext}
                      </button>
                    </Popover>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// SESSION SLOT GRID — 28px day tabs + role=grid (26px slot header row,
// 4 judge rows at 34px; 28px in band C). Capacity ticks fill per chip;
// full cell shows the amber tick row. Party-conflict propagation is
// cross-slot logic, not per-chip styling: one party in two chips of the
// SAME slot column across judges shades BOTH chips.
// ---------------------------------------------------------------------------

interface ConflictInfo {
  chipIds: Set<string>;
  descriptions: {id: string; text: string}[];
  byChip: Map<string, {party: string; descId: string}>;
}

function computeConflicts(dayChips: SessionChip[], dayId: string): ConflictInfo {
  const chipIds = new Set<string>();
  const descriptions: {id: string; text: string}[] = [];
  const byChip = new Map<string, {party: string; descId: string}>();
  for (const slot of SLOT_TIMES) {
    const slotChips = dayChips.filter(c => c.slot === slot);
    const byParty = new Map<string, SessionChip[]>();
    for (const chip of slotChips) {
      for (const party of CASES[chip.caseKey].parties) {
        const list = byParty.get(party) ?? [];
        list.push(chip);
        byParty.set(party, list);
      }
    }
    for (const [party, list] of byParty) {
      const judgeIds = new Set(list.map(c => c.judgeId));
      if (judgeIds.size > 1) {
        const descId = \`cdc-conflict-\${dayId}-\${slot.replace(':', '')}\`;
        const depts = list
          .map(c => JUDGES.find(j => j.id === c.judgeId)?.dept)
          .filter(Boolean)
          .join(' and ');
        descriptions.push({
          id: descId,
          text: \`Scheduling conflict: party \${party} appears in the \${slot} slot in \${depts}.\`,
        });
        for (const chip of list) {
          chipIds.add(chip.id);
          byChip.set(chip.id, {party, descId});
        }
      }
    }
  }
  return {chipIds, descriptions, byChip};
}

interface SessionSlotGridProps {
  sessions: SessionChip[];
  activeDayId: string;
  pulseDayId: string | null;
  rowHeight: number; // 34 in bands A/B, 28 in band C
  onDayChange: (dayId: string) => void;
  onChipClick: (caseKey: keyof typeof CASES) => void;
}

function SessionSlotGrid({
  sessions,
  activeDayId,
  pulseDayId,
  rowHeight,
  onDayChange,
  onChipClick,
}: SessionSlotGridProps) {
  const dayChips = sessions.filter(c => c.dayId === activeDayId);
  const conflicts = computeConflicts(dayChips, activeDayId);
  return (
    <>
      <div style={styles.dayTabRow} role="tablist" aria-label="Session grid day">
        <span style={styles.gridWeekLabel}>Week of Jul 6 — {sessions.length} sessions</span>
        {GRID_DAYS.map(day => {
          const count = sessions.filter(c => c.dayId === day.id).length;
          const isActive = day.id === activeDayId;
          return (
            <button
              key={day.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={\`cdc-focusable\${pulseDayId === day.id ? ' cdc-pulse' : ''}\`}
              style={isActive ? {...styles.dayTab, ...styles.dayTabActive} : styles.dayTab}
              onClick={() => onDayChange(day.id)}>
              {day.label} · {count}
            </button>
          );
        })}
      </div>
      {conflicts.descriptions.map(desc => (
        <span key={desc.id} id={desc.id} style={styles.visuallyHidden}>
          {desc.text}
        </span>
      ))}
      <div style={styles.gridScroll}>
        <div style={styles.gridTable} role="grid" aria-label="Sessions by judge and slot">
          <div role="row" style={{display: 'contents'}}>
            <div role="columnheader" style={{...styles.slotHeaderCell, position: 'sticky', left: 0, backgroundColor: 'var(--color-background)', zIndex: 1}}>
              Judge
            </div>
            {SLOT_TIMES.map(slot => (
              <div key={slot} role="columnheader" style={{...styles.slotHeaderCell, borderLeft: HAIRLINE}}>
                {slot}
              </div>
            ))}
          </div>
          {JUDGES.map(judge => (
            <div key={judge.id} role="row" style={{display: 'contents'}}>
              <div role="rowheader" style={{...styles.judgeCell, height: rowHeight}}>
                <span style={styles.judgeCellLine}>{judge.name}</span>
                <span style={{...styles.judgeCellLine, color: 'var(--color-text-secondary)'}}>
                  {judge.dept}
                </span>
              </div>
              {SLOT_TIMES.map(slot => {
                const cellChips = dayChips.filter(c => c.judgeId === judge.id && c.slot === slot);
                const isFull = cellChips.length >= 3;
                return (
                  <div key={slot} role="gridcell" style={{...styles.slotCell, height: rowHeight}}>
                    {cellChips.length === 0 ? (
                      // Stress fixture (4): zero-state cells (Askew's whole
                      // Mon row) render a faint seal dot — no layout collapse.
                      <span style={styles.emptyCellDot} aria-hidden />
                    ) : (
                      cellChips.map(chip => {
                        const conflict = conflicts.byChip.get(chip.id);
                        return (
                          <span
                            key={chip.id}
                            style={
                              conflict != null
                                ? {...styles.sessionChip, ...styles.sessionChipConflict}
                                : styles.sessionChip
                            }>
                            <Tooltip content={\`\${chip.kind} · \${CASES[chip.caseKey].no}\`}>
                              <button
                                type="button"
                                className="cdc-focusable cdc-hit"
                                style={cstyles.chipLabelButton}
                                onClick={() => onChipClick(chip.caseKey)}
                                aria-describedby={conflict?.descId}
                                aria-label={\`\${chip.label} — select case\`}>
                                <span style={styles.sessionChipLabel}>{chip.label}</span>
                              </button>
                            </Tooltip>
                            {conflict != null ? (
                              <Popover
                                content={
                                  <div style={cstyles.popBody}>
                                    <Text type="label" size="sm">
                                      Party conflict
                                    </Text>
                                    <Text type="supporting" size="xsm" color="secondary">
                                      {conflict.party} appears in two departments in the {chip.slot} slot.
                                    </Text>
                                  </div>
                                }>
                                <button
                                  type="button"
                                  className="cdc-focusable cdc-hit"
                                  style={cstyles.conflictIconButton}
                                  aria-label={\`Conflict: \${conflict.party} in two departments\`}>
                                  <Icon icon={UsersIcon} size="xsm" color="inherit" />
                                </button>
                              </Popover>
                            ) : null}
                          </span>
                        );
                      })
                    )}
                    {cellChips.length > 0 ? (
                      <Tooltip content={\`calendar call \${cellChips.length} of 3\`}>
                        <span style={styles.capacityTicks} aria-label={\`\${cellChips.length} of 3 slots filled\`}>
                          {[0, 1, 2].map(i => (
                            <span
                              key={i}
                              style={{
                                ...styles.capacityTick,
                                ...(i < cellChips.length
                                  ? {
                                      backgroundColor: isFull ? AMBER : 'var(--color-text-secondary)',
                                      borderColor: isFull ? AMBER : 'var(--color-text-secondary)',
                                    }
                                  : null),
                              }}
                            />
                          ))}
                        </span>
                      </Tooltip>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// STATE OWNER — docketStore. ONE update(id, patch); acceptFiling is
// COMPOSED of update calls. Chain dates are never stored — computeChain
// derives them from the entries on every render.
// ---------------------------------------------------------------------------

type FilingStatus = 'pending' | 'accepted' | 'rejected';

interface ConsoleState {
  filingStatus: Record<string, FilingStatus>;
  entries: DocketEntry[];
  sessions: SessionChip[];
  activeDayId: string;
  selectedCaseKey: keyof typeof CASES;
  flashNum: string | null;
  highlightNum: string | null;
  deltas: Record<string, string>;
  pulseDayId: string | null;
  liveMessage: string;
}

interface EntityPatch {
  filingStatus?: FilingStatus; // id = filing id
  addEntry?: DocketEntry; // id = entry id
  addSession?: SessionChip; // id = session id
  activateDay?: boolean; // id = day id
  pulseDay?: boolean; // id = day id
  selectCase?: boolean; // id = case key
  flash?: boolean; // id = entry num
  highlight?: boolean; // id = entry num
  deltas?: Record<string, string>; // id = 'chain'
  announce?: string; // id = 'live'
}

const INITIAL_STATE: ConsoleState = {
  filingStatus: Object.fromEntries(FILINGS.map(f => [f.id, 'pending' as FilingStatus])),
  entries: INITIAL_ENTRIES,
  sessions: INITIAL_SESSIONS,
  activeDayId: 'mon',
  selectedCaseKey: 'calloway',
  flashNum: null,
  highlightNum: null,
  deltas: {},
  pulseDayId: null,
  liveMessage: '',
};

// ---------------------------------------------------------------------------
// TOP BAR — 56px: PorticoMark + 20px wordmark + registry subtitle +
// 240px case-number search (filters the intake queue live) + clerk
// avatar. Bands C/D swap the intake aside for a badge button here.
// ---------------------------------------------------------------------------

interface TopBarProps {
  band: Band;
  query: string;
  onQueryChange: (value: string) => void;
  pendingCount: number;
  onOpenIntake: () => void;
}

function TopBar({band, query, onQueryChange, pendingCount, onOpenIntake}: TopBarProps) {
  return (
    <div style={styles.topBar}>
      <span style={styles.brandMark} aria-hidden>
        <PorticoMark />
      </span>
      <span style={styles.wordmark}>Sessions</span>
      <span style={styles.topSubtitle}>Clerk of Court — Dept. Registry</span>
      {band === 'C' || band === 'D' ? (
        <Button
          label={\`Intake · \${pendingCount}\`}
          variant="secondary"
          size="sm"
          icon={<Icon icon={InboxIcon} size="sm" />}
          onClick={onOpenIntake}
        />
      ) : null}
      <span style={{flex: 1}} aria-hidden />
      {band !== 'D' ? (
        <div style={styles.searchBox}>
          <TextInput
            label="Search case number"
            isLabelHidden
            size="sm"
            placeholder="Search case number…"
            startIcon={SearchIcon}
            hasClear
            value={query}
            onChange={onQueryChange}
          />
        </div>
      ) : null}
      <Avatar name="Dorothy Whitcomb" size="small" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function CourtDocketingConsoleTemplate() {
  const toast = useToast();
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const viewWidth = useElementWidth(viewRootRef);
  // Width 0 = first pre-observer frame; viewport queries cover that frame
  // only so wide hosts don't flash pane removal.
  const isViewportB = useMediaQuery('(max-width: 1039px)');
  const isViewportC = useMediaQuery('(max-width: 879px)');
  const isViewportD = useMediaQuery('(max-width: 719px)');
  const band: Band =
    viewWidth > 0
      ? viewWidth >= BANDS.full
        ? 'A'
        : viewWidth >= BANDS.railCollapse
          ? 'B'
          : viewWidth >= BANDS.intakeCollapse
            ? 'C'
            : 'D'
      : isViewportD
        ? 'D'
        : isViewportC
          ? 'C'
          : isViewportB
            ? 'B'
            : 'A';

  const [state, setState] = useState<ConsoleState>(INITIAL_STATE);
  const [query, setQuery] = useState('');
  const [isRailOpen, setIsRailOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  const entryRowRefs = useRef(new Map<string, HTMLDivElement>());
  const railNodeRefs = useRef(new Map<string, HTMLLIElement>());

  // THE single mutation path — every surface routes through here.
  const update = useCallback((id: string, patch: EntityPatch) => {
    setState(prev => {
      let next = prev;
      if (patch.filingStatus !== undefined) {
        next = {...next, filingStatus: {...next.filingStatus, [id]: patch.filingStatus}};
      }
      if (patch.addEntry !== undefined && !next.entries.some(e => e.id === id)) {
        next = {...next, entries: [...next.entries, patch.addEntry]};
      }
      if (patch.addSession !== undefined && !next.sessions.some(s => s.id === id)) {
        next = {...next, sessions: [...next.sessions, patch.addSession]};
      }
      if (patch.activateDay) {
        next = {...next, activeDayId: id};
      }
      if (patch.pulseDay) {
        next = {...next, pulseDayId: id};
      }
      if (patch.selectCase) {
        next = {...next, selectedCaseKey: id as keyof typeof CASES};
      }
      if (patch.flash !== undefined) {
        next = {...next, flashNum: patch.flash ? id : null};
      }
      if (patch.highlight !== undefined) {
        next = {...next, highlightNum: patch.highlight ? id : null};
      }
      if (patch.deltas !== undefined) {
        next = {...next, deltas: patch.deltas};
      }
      if (patch.announce !== undefined) {
        next = {...next, liveMessage: patch.announce};
      }
      return next;
    });
  }, []);

  // Delta badges show for 4s after a recompute, then clear.
  useEffect(() => {
    if (Object.keys(state.deltas).length === 0) {
      return undefined;
    }
    const timer = setTimeout(() => update('chain', {deltas: {}}), 4000);
    return () => clearTimeout(timer);
  }, [state.deltas, update]);

  // Cross-link flash clears after the 1.2s animation.
  useEffect(() => {
    if (state.flashNum == null) {
      return undefined;
    }
    const timer = setTimeout(() => update(state.flashNum as string, {flash: false}), 1300);
    return () => clearTimeout(timer);
  }, [state.flashNum, update]);

  // Thu-tab pulse stops after 3s.
  useEffect(() => {
    if (state.pulseDayId == null) {
      return undefined;
    }
    const timer = setTimeout(
      () => setState(prev => ({...prev, pulseDayId: null})),
      3000,
    );
    return () => clearTimeout(timer);
  }, [state.pulseDayId]);

  // THE SIGNATURE CASCADE — one acceptFiling, four surfaces move.
  const acceptFiling = useCallback(
    (filingId: string) => {
      update(filingId, {filingStatus: 'accepted'});
      if (filingId === 'f-brightline-pos') {
        // Recompute is real: diff the pure selector before/after.
        const before = computeChain(state.entries);
        const after = computeChain([...state.entries, ENTRY_13]);
        const deltas: Record<string, string> = {};
        for (const node of after) {
          const prev = before.find(n => n.id === node.id);
          // Badge only deadlines that SHIFTED (discovery, dispositive,
          // trial-setting: 11/7→11/18, 12/7→12/18, 1/21→2/1 = +11d each);
          // a node that merely fills ('done') is a state change, not a shift.
          if (prev != null && node.status !== 'done' && prev.dateIso !== node.dateIso) {
            const diff = Math.round((toUtc(node.dateIso) - toUtc(prev.dateIso)) / DAY_MS);
            if (diff !== 0) {
              deltas[node.id] = \`\${diff > 0 ? '+' : ''}\${diff}d\`;
            }
          }
        }
        update(ENTRY_13.id, {addEntry: ENTRY_13}); // (1) sequencer: #13 stamps in
        update(CMC_CHIP.id, {addSession: CMC_CHIP}); // (3) grid: Thu 4→5
        update(ANSWER_CALL_CHIP.id, {addSession: ANSWER_CALL_CHIP}); // (3) grid: Fri 3→4
        update('thu', {activateDay: true, pulseDay: true}); // Thu tab pulses + activates
        update('chain', {deltas}); // (2) rail: +11d cascade
        update('live', {
          announce:
            'Entry 13 docketed; answer due July 21; case management conference booked Thursday July 9',
        });
        toast({body: 'Entry #13 docketed — 2 deadlines set, 2 sessions booked'});
        // (4) header flags re-derive from the chain on this same commit.
        // Focus moves to the new entry row once it mounts.
        setTimeout(() => {
          const row = entryRowRefs.current.get('13');
          row?.scrollIntoView({block: 'nearest'});
          row?.focus();
        }, 60);
      } else {
        toast({body: 'Filing accepted and docketed to its case'});
      }
    },
    [state.entries, toast, update],
  );

  // Targeted mutation proof: rejecting bounces the filing, docket untouched.
  const rejectFiling = useCallback(
    (filingId: string) => {
      update(filingId, {filingStatus: 'rejected'});
      toast({body: 'Rejected — bounced to filer'});
    },
    [toast, update],
  );

  const selectCase = useCallback(
    (caseKey: keyof typeof CASES) => update(caseKey, {selectCase: true}),
    [update],
  );

  // Cross-link pills + rail node clicks: scroll to a docket row and
  // flash/highlight it; focus follows for keyboard users.
  const scrollFlashEntry = useCallback(
    (num: string) => {
      update(num, {flash: true});
      const row = entryRowRefs.current.get(num);
      row?.scrollIntoView({block: 'center'});
      row?.focus();
    },
    [update],
  );

  const highlightEntry = useCallback(
    (num: string) => {
      update(num, {highlight: true});
      const row = entryRowRefs.current.get(num);
      row?.scrollIntoView({block: 'center'});
      if (band === 'B') {
        setIsRailOpen(false); // Escape layering: dialog closes, focus returns
      }
    },
    [band, update],
  );

  const scrollRailToNode = useCallback(
    (nodeId: string) => {
      if (band === 'B' || band === 'C') {
        setIsRailOpen(true);
        setTimeout(() => railNodeRefs.current.get(nodeId)?.scrollIntoView({block: 'center'}), 80);
        return;
      }
      railNodeRefs.current.get(nodeId)?.scrollIntoView({block: 'center'});
    },
    [band],
  );

  const registerRow = useCallback((num: string, el: HTMLDivElement | null) => {
    if (el == null) {
      entryRowRefs.current.delete(num);
    } else {
      entryRowRefs.current.set(num, el);
    }
  }, []);

  const registerNode = useCallback((nodeId: string, el: HTMLLIElement | null) => {
    if (el == null) {
      railNodeRefs.current.delete(nodeId);
    } else {
      railNodeRefs.current.set(nodeId, el);
    }
  }, []);

  // ---- Derived-on-render (never stored) ----------------------------------
  const chain = useMemo(() => computeChain(state.entries), [state.entries]);
  const normalizedQuery = query.trim().toLowerCase();
  const pendingFilings = FILINGS.filter(
    f =>
      state.filingStatus[f.id] === 'pending' &&
      (normalizedQuery === '' ||
        CASES[f.caseKey].no.toLowerCase().includes(normalizedQuery) ||
        f.title.toLowerCase().includes(normalizedQuery) ||
        CASES[f.caseKey].caption.toLowerCase().includes(normalizedQuery)),
  );
  const pendingCount = FILINGS.filter(f => state.filingStatus[f.id] === 'pending').length;
  const isBrightlineServed = state.entries.some(e => e.servedParty === 'brightline');
  const selectedCase = CASES[state.selectedCaseKey];
  const isCallowaySelected = state.selectedCaseKey === 'calloway';

  // Header flags derive from the chain — stress fixture (8): amber
  // 'due in 4d', amber-pulse service pre-acceptance, green post.
  const flags: HeaderFlag[] = [
    isBrightlineServed
      ? {id: 'service', label: 'SERVICED 2 of 2 · 7/6', tone: 'green', nodeId: 'n-service'}
      : {
          id: 'service',
          label: 'SERVICE DUE 7/13',
          tone: 'amber',
          isPulsing: true,
          nodeId: 'n-service',
        },
    {id: 'answer-k', label: 'ANSWER (K) DUE 7/10', tone: 'amber', nodeId: 'n-kessler-answer'},
    ...(isBrightlineServed
      ? [
          {
            id: 'answer-b',
            label: 'ANSWER (B) DUE 7/21',
            tone: 'amber' as const,
            nodeId: 'n-brightline-answer',
          },
        ]
      : []),
  ];

  const gridRowHeight = band === 'C' ? 28 : 34;
  const bottomBandStyle: CSSProperties =
    band === 'C' ? {...styles.bottomBand, height: 168} : styles.bottomBand;

  const intakePanel = (
    <IntakeQueue
      filings={pendingFilings}
      selectedCaseKey={selectedCase.no}
      onSelectCase={selectCase}
      onAccept={acceptFiling}
      onReject={rejectFiling}
    />
  );

  const railPanel = (
    <DeadlineRail
      nodes={chain}
      deltas={state.deltas}
      registerNode={registerNode}
      onNodeClick={highlightEntry}
    />
  );

  const sequencerPanel = isCallowaySelected ? (
    <DocketSequencer
      entries={state.entries}
      highlightNum={state.highlightNum}
      flashNum={state.flashNum}
      isScrollOwner={band !== 'D'}
      registerRow={registerRow}
      onCrossLink={scrollFlashEntry}
    />
  ) : (
    <DocketEmptyState kase={selectedCase} onReturn={() => selectCase('calloway')} />
  );

  const gridPanel = (
    <SessionSlotGrid
      sessions={state.sessions}
      activeDayId={state.activeDayId}
      pulseDayId={state.pulseDayId}
      rowHeight={gridRowHeight}
      onDayChange={dayId => update(dayId, {activateDay: true})}
      onChipClick={selectCase}
    />
  );

  const nextAmberCount = chain.filter(n => n.status === 'amber' || n.status === 'amber-pulse').length;

  return (
    <div style={styles.root}>
      <style>{CONSOLE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <TopBar
              band={band}
              query={query}
              onQueryChange={setQuery}
              pendingCount={pendingCount}
              onOpenIntake={() => setIsIntakeOpen(true)}
            />
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} style={styles.viewRoot}>
              {band === 'D' ? (
                // Band D: single scroll column — header, sequencer, rail,
                // then the grid with its own horizontal scroll.
                <div style={{flex: 1, minHeight: 0, overflowY: 'auto'}}>
                  {isCallowaySelected ? (
                    <CaseHeaderBand kase={selectedCase} flags={flags} onFlagClick={scrollRailToNode} />
                  ) : (
                    <CaseHeaderBand kase={selectedCase} flags={[]} onFlagClick={scrollRailToNode} />
                  )}
                  {sequencerPanel}
                  <div style={{borderTop: HAIRLINE}}>{isCallowaySelected ? railPanel : null}</div>
                  <div style={{...styles.bottomBand, height: 200}}>{gridPanel}</div>
                </div>
              ) : (
                <>
                  <div style={styles.mainRow}>
                    {band === 'A' || band === 'B' ? (
                      <div style={styles.leftAside}>{intakePanel}</div>
                    ) : null}
                    <div style={styles.centerMain}>
                      <CaseHeaderBand
                        kase={selectedCase}
                        flags={isCallowaySelected ? flags : []}
                        onFlagClick={scrollRailToNode}
                      />
                      <div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
                        {sequencerPanel}
                      </div>
                    </div>
                    {band === 'A' ? (
                      <div style={styles.rightAside}>{railPanel}</div>
                    ) : (
                      <div style={styles.railStrip}>
                        <Tooltip content="Deadline chain — next: Kessler answer 7/10">
                          <button
                            type="button"
                            className="cdc-focusable"
                            style={cstyles.railStripButton}
                            onClick={() => setIsRailOpen(true)}
                            aria-label={\`Open deadline chain — \${nextAmberCount} deadlines due soon\`}>
                            <span style={cstyles.nextDeadlineDot} aria-hidden />
                            <span style={{fontSize: 11, fontFamily: MONO}}>{nextAmberCount}</span>
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                  <div style={bottomBandStyle}>{gridPanel}</div>
                </>
              )}
            </div>
          </LayoutContent>
        }
      />
      {/* Band B/C rail overlay — DS Dialog owns Escape + focus restore. */}
      <Dialog
        isOpen={isRailOpen && (band === 'B' || band === 'C')}
        onOpenChange={setIsRailOpen}
        purpose="info"
        width={380}>
        <DialogHeader title="Deadline chain" onOpenChange={setIsRailOpen} />
        <div style={cstyles.dialogBody}>{railPanel}</div>
      </Dialog>
      {/* Band C/D intake drawer. */}
      <Dialog
        isOpen={isIntakeOpen && (band === 'C' || band === 'D')}
        onOpenChange={setIsIntakeOpen}
        purpose="info"
        width={320}>
        <DialogHeader title="E-filing intake" onOpenChange={setIsIntakeOpen} />
        <div style={cstyles.dialogBody}>{intakePanel}</div>
      </Dialog>
      {/* Polite live region — announces the acceptance cascade. */}
      <div aria-live="polite" style={styles.visuallyHidden}>
        {state.liveMessage}
      </div>
    </div>
  );
}
`;export{e as default};