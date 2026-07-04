// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Rotunda's election-night canvass
 *   desk for Ridgeline State General — Tue 2026-06-02, District 4 Regional
 *   Canvass (operator Desk 2 — R. Calloway): six counties whose expected
 *   ballots sum to exactly 90,000, thirteen pre-scripted vote batches
 *   B-01..B-13 whose per-county ballots reconcile to every county total,
 *   and per-batch vote triples for three races (Governor, U.S. Senate,
 *   Measure 12) each summing to its batch's ballot count. Every verify
 *   stamp is a pre-authored string (20:14 .. 22:19); no Date.now(), no
 *   Math.random(), no network assets. ALL tallies, margins, reported %,
 *   and envelope floors are useMemo derivations from the verified batch
 *   set — nothing displayed can drift from the fixtures.
 * @output Election Returns Desk — a canvass-night operator surface:
 *   a 48px ticker header with per-race leader/margin chips; a 300px race
 *   rail (84px rows: leader, tally pair, opposing-hue margin bar, status
 *   pill); a main column with the county-by-batch PrecinctReportingMatrix
 *   (6 county rows x 13 batch columns, vertical-fill cells with provenance
 *   popovers), the CallConfidenceGauge (SVG net-margin axis whose
 *   outstanding-vote envelope [M−O, M+O] narrows on every verify and
 *   tints green the instant the floor M−O crosses zero), and the selected
 *   race's tally table; a 340px append-only BatchLedgerTape whose single
 *   enabled "Verify batch" button walks the pending queue in strict
 *   ledger order; and a 64px call-desk bar whose "Call race" button
 *   enables only when leader margin exceeds the mathematically reachable
 *   swing. Scripted drama: Senate goes CALLABLE by exactly 80 votes at
 *   B-09, Measure 12 collapses to a +30 margin at the same batch, and
 *   Governor clears at B-12 with a +690 floor.
 * @position Page template; emitted by `astryx template election-returns-desk`
 *
 * DENSITY GRID (fixed, verbatim): 8px base grid. TickerHeader 48px.
 *   CallDeskBar 64px. Left RaceRail 300px wide, rail rows 84px. Right
 *   BatchLedgerTape 340px wide, tape entries 96px collapsed / auto
 *   expanded. Matrix rows 32px, matrix cells 20px wide x 24px tall, 2px
 *   cell gap, 92px county-label column. Gauge panel 132px tall, envelope
 *   band 12px, margin marker 4px. Panel padding 16px, inter-panel gutter
 *   16px. Font scale: 11 (micro labels), 12 (body/meta), 13 (controls),
 *   15 (row titles), 20 (ticker leads + gauge margin readout). All
 *   numerals fontVariantNumeric 'tabular-nums'. Corner radii per corner
 *   map only.
 *
 * CORNER MAP: shell and full-width bars (ticker, call-desk) 0. Panels 8px.
 *   Buttons + DS controls 6px. Matrix cells 2px. Tape entries 6px on the
 *   right three corners, 0 on the left (spine) side. Gauge envelope band
 *   and margin marker square-ended (0). Status pills / callable chip /
 *   party swatches 999. Popovers 8px.
 *
 * Frame: <div shell> (100dvh, flex column, overflow hidden)
 *   > TickerHeader 48px
 *   > [600–859 band] 48px horizontal race tab strip
 *   > view root (flex row, flex 1, minHeight 0, overflow hidden)
 *     { RaceRail aside 300 | main column (matrix panel, gauge panel,
 *       tally table panel — one scroll) | BatchLedgerTape aside 340 }
 *   > CallDeskBar 64px (normal flex row of the shell — NOT position:fixed).
 * Container policy: dense tool surface — frame bars, rails, and panels;
 *   no Cards. Matrix cells / rail rows / tape entries are raw <button>s
 *   and styled divs; overlays are DS Popover / Dialog / Tooltip.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (Rotunda violet light-dark(#4C3F91, #5D4EB3)) for the RotundaMark and
 *   the primary Call action; a separate brandText pair
 *   light-dark(#3F3479, #A99BEB) for brand-tinted text (10.6:1 / 6.9:1).
 *   Party data-viz hues use the repo-standard categorical token fallbacks
 *   (Meridian teal / Summit amber); party *text* uses darker/lighter
 *   pairs passing 4.5:1 in both schemes (math at each const). Party is
 *   never hue alone: Meridian = circle swatch + label, Summit = square
 *   swatch + label.
 *
 * Responsive contract — bands key off CONTAINER width via useElementWidth
 * (ResizeObserver) on the shell; viewport queries are only the
 * first-frame fallback (demo stage is ~1045–1075px inside a 1440px
 * window, so the >=1024 band is the hero state):
 * - >=1024px: full 3-column (300 / fluid / 340), 13 matrix columns.
 * - 860–1023px: BatchLedgerTape leaves the row; a "Ledger (n pending)"
 *   button in the CallDeskBar opens the tape in a DS Dialog sheet
 *   (verify still works there); matrix cells widen toward 24px.
 * - 600–859px: RaceRail replaced by the 48px race tab strip under the
 *   ticker; main column full width; gauge readouts stack two-line.
 * - <600px: matrix switches to county-rows-only summary bars (cells
 *   behind a per-row popover list); ticker shows the selected race only.
 * - No band changes arithmetic — placement only. Nothing squeezes;
 *   segments drop. (One measured concession, documented at CELL geometry:
 *   in hosts narrower than the 13-column budget the cell width derives
 *   from measured pane width, clamped to the band max of 20/24px, so all
 *   13 columns stay visible without horizontal scroll.)
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CircleCheckBigIcon,
  MegaphoneIcon,
  ScrollTextIcon,
  XIcon,
} from 'lucide-react';

import {Button} from '@astryxdesign/core/Button';
import {Dialog} from '@astryxdesign/core/Dialog';
import {Icon} from '@astryxdesign/core/Icon';
import {Popover} from '@astryxdesign/core/Popover';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color, each a light-dark() pair (dark side
// shifted to the lighter 300–400-weight hue). Data-viz categorical tokens are
// not injected by the demo, so each carries the repo-standard fallback.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (spec hex #4C3F91). White label text:
// 8.65:1 on #4C3F91, 6.54:1 on #5D4EB3 — both pass 4.5:1.
const BRAND = 'light-dark(#4C3F91, #5D4EB3)';
const ON_BRAND = '#FFFFFF';
// Brand-tinted TEXT is a different value from brand fill: 10.6:1 on white,
// 6.9:1 on the dark panel — both pass 4.5:1.
const BRAND_TEXT = 'light-dark(#3F3479, #A99BEB)';
const BRAND_SOFT = 'color-mix(in srgb, light-dark(#4C3F91, #5D4EB3) 12%, transparent)';

// Party fills (bars, matrix cells, swatches) — categorical tokens with the
// repo-standard fallback pairs. Meridian = teal circle, Summit = amber
// square; hue is never the sole party carrier.
const MERIDIAN = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
const SUMMIT = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9838))';
// Party TEXT pairs (deltas, leader names): #0A6773 6.6:1 on white,
// #55C6D4 8.4:1 on dark; #9A4E00 6.1:1 on white, #F0A050 8.3:1 on dark.
const MERIDIAN_TEXT = 'light-dark(#0A6773, #55C6D4)';
const SUMMIT_TEXT = 'light-dark(#9A4E00, #F0A050)';
const MERIDIAN_SOFT = `color-mix(in srgb, ${MERIDIAN} 20%, transparent)`;
const SUMMIT_SOFT = `color-mix(in srgb, ${SUMMIT} 20%, transparent)`;

// Callable/called success family. Text pair: #0A7A19 5.5:1 on white,
// #4CD964 9.6:1 on dark.
const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const OK_TEXT = 'light-dark(#0A7A19, #4CD964)';
const OK_SOFT = `color-mix(in srgb, ${OK_GREEN} 14%, transparent)`;

// Gauge envelope fill — neutral uncertainty wash (never a party hue); the
// success tint takes over the instant the floor crosses zero.
const ENVELOPE = 'light-dark(rgba(28, 28, 30, 0.10), rgba(235, 235, 245, 0.14))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the visually-hidden live region, and the
// reduced-motion guard. Transitions animate transform/opacity/color only
// (matrix fills scale via transform, never height), and collapse under
// prefers-reduced-motion.
// ---------------------------------------------------------------------------

const DESK_CSS = `
.erd-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.erd-cell-fill {
  transform-origin: center bottom;
  transition: transform 240ms ease, background-color 240ms ease, opacity 240ms ease;
}
.erd-pill {
  transition: background-color 240ms ease, color 240ms ease;
}
.erd-vhidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  clip-path: inset(50%);
  overflow: hidden;
  white-space: nowrap;
}
@media (prefers-reduced-motion: reduce) {
  .erd-cell-fill, .erd-pill {
    transition: none;
  }
}
`;

// ---------------------------------------------------------------------------
// DENSITY CONSTANTS — the spec grid, used as the only geometry literals.
// ---------------------------------------------------------------------------

const TICKER_H = 48;
const CALLBAR_H = 64;
const RAIL_W = 300;
const RAIL_ROW_H = 84;
const TAPE_W = 340;
const TAPE_ENTRY_MIN_H = 96;
const MATRIX_ROW_H = 32;
const CELL_W = 20; // >=1024 band budget; 24 at 860–1023 (see cellWidth calc)
const CELL_H = 24;
const CELL_GAP = 2;
const LABEL_W = 92;
const GAUGE_H = 132;
const BAND_H = 12;
const MARKER_W = 4;
const PAD = 16;

const styles: Record<string, CSSProperties> = {
  // Footgun: the demo stage is auto-height — the shell pins to 100dvh.
  shell: {
    height: '100dvh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-family, system-ui, sans-serif)',
  },
  // Ticker (48px, radius 0) --------------------------------------------------
  ticker: {
    height: TICKER_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: PAD,
    padding: `0 ${PAD}px`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  brandLockup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    color: BRAND_TEXT,
  },
  brandName: {fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap'},
  tickerMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    minWidth: 0,
    flexShrink: 1,
  },
  micro: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontVariantNumeric: 'tabular-nums',
  },
  tickerChips: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  raceChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 32,
    padding: '0 10px',
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  raceChipSelected: {
    borderColor: BRAND_TEXT,
    backgroundColor: BRAND_SOFT,
  },
  tickerLead: {fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  // Race tab strip (600–859 band) --------------------------------------------
  tabStrip: {
    height: TICKER_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'stretch',
    gap: 8,
    padding: `8px ${PAD}px`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    overflowX: 'auto',
  },
  // View root -----------------------------------------------------------------
  viewRoot: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  rail: {
    width: RAIL_W,
    flexShrink: 0,
    overflowY: 'auto',
    borderRight: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    display: 'flex',
    flexDirection: 'column',
  },
  railHeader: {
    padding: `12px ${PAD}px 4px`,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  railRow: {
    minHeight: RAIL_ROW_H,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
    padding: `8px ${PAD}px`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    borderLeft: '3px solid transparent',
    background: 'none',
    textAlign: 'start',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    width: '100%',
  },
  railRowSelected: {
    borderLeftColor: BRAND_TEXT,
    backgroundColor: BRAND_SOFT,
  },
  railTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  railTitle: {fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap'},
  railMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  marginBarTrack: {
    position: 'relative',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
  },
  // Near-flip stress (Measure 12 at B-09: 30,250 vs 30,220): the 50% center
  // tick stays visible over the segment boundary so a hairline lead reads.
  marginBarCenter: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: 'var(--color-text-primary)',
    opacity: 0.55,
  },
  // Main column ----------------------------------------------------------------
  main: {
    flex: 1,
    minWidth: 0,
    overflowY: 'auto',
    padding: PAD,
    display: 'flex',
    flexDirection: 'column',
    gap: PAD, // inter-panel gutter 16px
  },
  panel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 8,
    backgroundColor: 'var(--color-background-card)',
    padding: PAD,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  panelTitleRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  panelTitle: {fontSize: 15, fontWeight: 600},
  // Matrix ----------------------------------------------------------------------
  matrixRow: {
    height: MATRIX_ROW_H,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  countyHeader: {
    // +8 compensates the button's own 4px side padding (border-box) so the
    // visible label column stays exactly 92px wide.
    width: LABEL_W + 8,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0,
    background: 'none',
    border: 'none',
    borderRadius: 6,
    padding: '2px 4px',
    margin: '-2px -4px',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
  },
  // Flex pair: the name ellipsizes, the integer % is pinned — "Brightwater
  // 45%" is the width stress for the fixed 92px column.
  countyName: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 3,
    width: LABEL_W,
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  countyNameText: {overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0},
  countyStat: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  cellRun: {display: 'flex', alignItems: 'center', gap: CELL_GAP},
  cellSlot: {
    height: CELL_H,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cellButton: {
    position: 'relative',
    height: CELL_H,
    borderRadius: 2,
    border: 'var(--border-width) solid transparent',
    padding: 0,
    background: 'none',
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'block',
  },
  baselineDot: {
    width: 2,
    height: 2,
    borderRadius: 999,
    backgroundColor: 'var(--color-border)',
  },
  matrixLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
  },
  legendItem: {display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap'},
  // County summary bars (<600 band) ------------------------------------------
  summaryTrack: {
    flex: 1,
    minWidth: 0,
    height: BAND_H,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  // Gauge -----------------------------------------------------------------------
  // 132px budget: 32 padding + 16 title + 36 svg + 30 readouts + 2×4 gaps.
  gaugePanel: {
    height: GAUGE_H,
    flexShrink: 0,
    boxSizing: 'border-box',
    gap: 4,
  },
  gaugeBody: {position: 'relative', height: 36, flexShrink: 0},
  gaugeReadouts: {
    display: 'flex',
    alignItems: 'baseline',
    gap: PAD,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  gaugeMarginReadout: {fontSize: 20, fontWeight: 700},
  readoutLabel: {fontSize: 11, color: 'var(--color-text-secondary)'},
  readoutValue: {fontSize: 13, fontWeight: 600},
  gaugeOverlay: {position: 'absolute', top: 0, height: '100%'},
  // Tally table -------------------------------------------------------------
  tallyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: MATRIX_ROW_H,
  },
  tallyName: {
    width: 148,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tallyVotes: {
    width: 72,
    flexShrink: 0,
    textAlign: 'end',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
  },
  tallyShare: {
    width: 52,
    flexShrink: 0,
    textAlign: 'end',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  tallyBarTrack: {
    flex: 1,
    minWidth: 40,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  // Swatches: Meridian circle, Summit square — shape carries party with hue.
  swatchCircle: {
    width: 10,
    height: 10,
    borderRadius: 999,
    flexShrink: 0,
    display: 'inline-block',
  },
  swatchSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    flexShrink: 0,
    display: 'inline-block',
  },
  // Status pills (radius 999) -------------------------------------------------
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    padding: '0 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
  },
  // Ledger tape ---------------------------------------------------------------
  tape: {
    width: TAPE_W,
    flexShrink: 0,
    overflowY: 'auto',
    borderLeft: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    display: 'flex',
    flexDirection: 'column',
  },
  tapeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: `12px ${PAD}px 8px`,
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: 'var(--color-background-card)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  tapeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: `8px ${PAD}px ${PAD}px 12px`,
  },
  // Tape entries: 6px radius on the right three corners, 0 on the spine side
  // where they abut the 2px vertical tape spine.
  tapeEntry: {
    minHeight: TAPE_ENTRY_MIN_H,
    borderLeft: `2px solid var(--color-border)`,
    borderTop: 'var(--border-width) solid var(--color-border)',
    borderRight: 'var(--border-width) solid var(--color-border)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    borderRadius: '0 6px 6px 0',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    backgroundColor: 'var(--color-background)',
    textAlign: 'start',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    width: '100%',
  },
  tapeEntryVerified: {borderLeftColor: OK_GREEN},
  tapeEntryHead: {borderLeftColor: BRAND_TEXT},
  tapeTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontVariantNumeric: 'tabular-nums',
  },
  seqBadge: {
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: 6,
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  mono11: {
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  tapeMemo: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  tapeMemoExpanded: {whiteSpace: 'normal'},
  tapeDeltaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    flexWrap: 'wrap',
  },
  deltaChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // Call-desk bar (64px, radius 0) ---------------------------------------------
  callBar: {
    height: CALLBAR_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: PAD,
    padding: `0 ${PAD}px`,
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  callStats: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    minWidth: 0,
    overflow: 'hidden',
  },
  callStat: {display: 'flex', flexDirection: 'column', gap: 0},
  callStatValue: {fontSize: 13, fontWeight: 700},
  callRight: {display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0},
  // Popover / provenance -------------------------------------------------------
  provenance: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 12,
    fontSize: 12,
    minWidth: 220,
    fontVariantNumeric: 'tabular-nums',
  },
  provRow: {display: 'flex', justifyContent: 'space-between', gap: 12},
  provLabel: {color: 'var(--color-text-secondary)', fontSize: 11},
};

// ---------------------------------------------------------------------------
// DATA — Ridgeline State General — Tue 2026-06-02, District 4 Regional
// Canvass, operator Desk 2 — R. Calloway. Deterministic by law: every verify
// stamp is a pre-authored fixture string; the demo's "tonight" is scripted
// 20:14 → 22:19. Batches store RAW counts only — every displayed total,
// margin, %, and envelope floor derives in useMemo from the verified set,
// so aggregates can never drift from fixtures.
// ---------------------------------------------------------------------------

const ELECTION_NAME = 'Ridgeline State General — Tue 2026-06-02';
const DESK_NAME = 'District 4 Regional Canvass';
const OPERATOR = 'Desk 2 — R. Calloway';
const TOTAL_EXPECTED = 90_000; // 18,400+9,200+31,600+6,800+14,000+10,000

type Party = 'meridian' | 'summit';
type RaceId = 'R-01' | 'R-02' | 'R-03';
type CountyId = 'alder' | 'brightwater' | 'cascade' | 'dunmore' | 'eastfall' | 'fenwick';
type BatchStatus = 'verified' | 'pending';

interface County {
  id: CountyId;
  name: string;
  expectedBallots: number;
  lean: Party; // historical lean drives the matrix cell hue
  leanLabel: string;
}

const COUNTIES: County[] = [
  {id: 'alder', name: 'Alder', expectedBallots: 18_400, lean: 'meridian', leanLabel: 'Meridian +8'},
  {id: 'brightwater', name: 'Brightwater', expectedBallots: 9_200, lean: 'summit', leanLabel: 'Summit +6'},
  {id: 'cascade', name: 'Cascade', expectedBallots: 31_600, lean: 'meridian', leanLabel: 'Meridian +11'},
  // Stress fixture (1): Dunmore is 0% reported at load — an all-outline
  // matrix row and a 0/6,800 county header until B-06 verifies.
  {id: 'dunmore', name: 'Dunmore', expectedBallots: 6_800, lean: 'summit', leanLabel: 'Summit +14'},
  {id: 'eastfall', name: 'Eastfall', expectedBallots: 14_000, lean: 'summit', leanLabel: 'Summit +3'},
  {id: 'fenwick', name: 'Fenwick', expectedBallots: 10_000, lean: 'summit', leanLabel: 'Summit +5'},
];

const COUNTY_BY_ID = new Map(COUNTIES.map(c => [c.id, c]));

interface RaceOption {
  name: string;
  short: string; // last name / Yes / No for readouts + announcements
  party: Party; // Measure 12 borrows the hue axis: Yes=teal, No=amber
}

interface RaceDef {
  id: RaceId;
  name: string;
  abbrev: string; // ticker chip label
  optionA: RaceOption; // teal / positive axis side
  optionB: RaceOption; // amber / negative axis side
  otherLabel: string;
  // Gauge domain frozen at mount: |margin at load| + outstanding at load,
  // rounded UP to the nearest 10,000. Gov |+2,700|+55,900=58,600 → 60,000;
  // Senate |+16,180|+55,900=72,080 → 80,000; Measure |+330|+55,900=56,230
  // → 60,000.
  domain: number;
}

const RACES: RaceDef[] = [
  {
    id: 'R-01',
    name: 'Governor',
    abbrev: 'GOV',
    optionA: {name: 'Marisol Vane', short: 'Vane', party: 'meridian'},
    optionB: {name: 'Grant Okafor', short: 'Okafor', party: 'summit'},
    otherLabel: 'Other',
    domain: 60_000,
  },
  {
    id: 'R-02',
    name: 'U.S. Senate',
    abbrev: 'SEN',
    optionA: {name: 'Elena Ibarra', short: 'Ibarra', party: 'meridian'},
    optionB: {name: 'Del Stroud', short: 'Stroud', party: 'summit'},
    otherLabel: 'Other',
    domain: 80_000,
  },
  {
    id: 'R-03',
    name: 'Measure 12 — Transit levy',
    abbrev: 'M-12',
    optionA: {name: 'Yes on 12', short: 'Yes', party: 'meridian'},
    optionB: {name: 'No on 12', short: 'No', party: 'summit'},
    otherLabel: 'Blank',
    domain: 60_000,
  },
];

const RACE_BY_ID = new Map(RACES.map(r => [r.id, r]));

interface BatchFixture {
  id: string;
  seq: number;
  countyId: CountyId;
  ballots: number;
  scanner: string;
  checksum: string;
  stamp: string; // scripted verify time — stamped verbatim on verify
  memo: string;
  initialStatus: BatchStatus;
  // Raw vote triples [optionA, optionB, other] per race; every triple sums
  // to the batch's ballot count (cross-checked below).
  votes: Record<RaceId, readonly [number, number, number]>;
}

// County-by-batch cross-check law (all verified):
//   Alder 6,200+7,300+4,900 = 18,400 · Brightwater 4,100+5,100 = 9,200
//   Cascade 9,800+8,400+13,400 = 31,600 · Dunmore 6,800
//   Eastfall 5,600+8,400 = 14,000 · Fenwick 5,200+4,800 = 10,000
//   All 13 batches sum 90,000. (Spec's struck "B-11 3,700" fragment is a
//   typo the spec itself corrects to 5,100 — binding arithmetic holds.)
const BATCHES: BatchFixture[] = [
  {
    id: 'B-01', seq: 1, countyId: 'alder', ballots: 6_200, scanner: 'SC-A1',
    checksum: 'A3F2-9C41', stamp: '20:14', initialStatus: 'verified',
    memo: 'Alder in-person precincts 1–9; pollpads reconciled at close',
    votes: {'R-01': [3_410, 2_650, 140], 'R-02': [4_530, 1_550, 120], 'R-03': [3_020, 3_050, 130]},
  },
  {
    id: 'B-02', seq: 2, countyId: 'cascade', ballots: 9_800, scanner: 'SC-C2',
    checksum: '7B08-D115', stamp: '20:31', initialStatus: 'verified',
    memo: 'Cascade early-vote tranche 1 — chain-of-custody form CC-118 on file',
    votes: {'R-01': [5_590, 4_010, 200], 'R-02': [7_240, 2_360, 200], 'R-03': [4_980, 4_610, 210]},
  },
  {
    id: 'B-03', seq: 3, countyId: 'brightwater', ballots: 4_100, scanner: 'SC-B1',
    checksum: 'E29C-40F7', stamp: '20:47', initialStatus: 'verified',
    memo: 'Brightwater election-day precincts; two spoiled ballots logged',
    votes: {'R-01': [1_780, 2_240, 80], 'R-02': [2_890, 1_130, 80], 'R-03': [1_940, 2_070, 90]},
  },
  {
    id: 'B-04', seq: 4, countyId: 'eastfall', ballots: 5_600, scanner: 'SC-E1',
    checksum: '51AD-B360', stamp: '21:02', initialStatus: 'verified',
    memo: 'Eastfall vote centers A/B; ballot box seals verified by two judges',
    votes: {'R-01': [2_510, 2_980, 110], 'R-02': [3_960, 1_530, 110], 'R-03': [2_720, 2_760, 120]},
  },
  {
    id: 'B-05', seq: 5, countyId: 'cascade', ballots: 8_400, scanner: 'SC-C1',
    checksum: '9E44-27C8', stamp: '21:18', initialStatus: 'verified',
    memo: 'Cascade early-vote tranche 2 — batch header count matched tape',
    votes: {'R-01': [4_760, 3_470, 170], 'R-02': [6_180, 2_050, 170], 'R-03': [4_190, 4_030, 180]},
  },
  {
    id: 'B-06', seq: 6, countyId: 'dunmore', ballots: 6_800, scanner: 'SC-D1',
    checksum: 'C7F0-1183', stamp: '21:26', initialStatus: 'pending',
    memo: 'Dunmore drop-box sweep 1 of 1 — seal 0442117 intact',
    votes: {'R-01': [2_770, 3_890, 140], 'R-02': [4_620, 2_040, 140], 'R-03': [3_180, 3_470, 150]},
  },
  {
    id: 'B-07', seq: 7, countyId: 'alder', ballots: 7_300, scanner: 'SC-A2',
    checksum: '2D6B-F5A9', stamp: '21:33', initialStatus: 'pending',
    memo: 'Alder in-person precincts 10–17; one curbside envelope included',
    votes: {'R-01': [4_120, 3_020, 160], 'R-02': [5_320, 1_820, 160], 'R-03': [3_660, 3_480, 160]},
  },
  {
    id: 'B-08', seq: 8, countyId: 'fenwick', ballots: 5_200, scanner: 'SC-F1',
    checksum: '88E1-0C3D', stamp: '21:41', initialStatus: 'pending',
    memo: 'Fenwick election-day precincts; write-in tray hand-keyed',
    votes: {'R-01': [2_340, 2_750, 110], 'R-02': [3_640, 1_450, 110], 'R-03': [2_480, 2_610, 110]},
  },
  {
    id: 'B-09', seq: 9, countyId: 'eastfall', ballots: 8_400, scanner: 'SC-E2',
    checksum: '4A97-6E20', stamp: '21:48', initialStatus: 'pending',
    // Stress fixtures (3)+(4): verifying B-09 makes Senate CALLABLE by
    // exactly 80 votes (M 28,280 vs O 28,200) and collapses Measure 12 to
    // a +30 margin (30,250 Yes vs 30,220 No).
    memo: 'Eastfall vote centers C/D — final election-day pickup',
    votes: {'R-01': [3_980, 4_230, 190], 'R-02': [6_020, 2_190, 190], 'R-03': [4_080, 4_140, 180]},
  },
  {
    id: 'B-10', seq: 10, countyId: 'cascade', ballots: 13_400, scanner: 'SC-CC4',
    checksum: 'F1B3-8A52', stamp: '21:56', initialStatus: 'pending',
    // Stress fixture (2): the long two-clause central-count memo exercises
    // the tape's single-line ellipsis + click-to-expand path.
    memo: 'Central-count absentee tranche 2 — rescan after feed jam on scanner CC-04; supervisor initials KL/MO',
    votes: {'R-01': [8_150, 4_960, 290], 'R-02': [9_610, 3_500, 290], 'R-03': [6_750, 6_360, 290]},
  },
  {
    id: 'B-11', seq: 11, countyId: 'brightwater', ballots: 5_100, scanner: 'SC-B2',
    checksum: '63C8-D9E4', stamp: '22:04', initialStatus: 'pending',
    memo: 'Brightwater mail tranche — signature-cure ballots excluded, 41 held',
    votes: {'R-01': [2_280, 2_720, 100], 'R-02': [3_560, 1_440, 100], 'R-03': [2_440, 2_550, 110]},
  },
  {
    id: 'B-12', seq: 12, countyId: 'alder', ballots: 4_900, scanner: 'SC-A1',
    checksum: '0B5F-72A1', stamp: '22:11', initialStatus: 'pending',
    memo: 'Alder mail tranche 2 — governor goes CALLABLE here (floor +690)',
    votes: {'R-01': [2_760, 2_040, 100], 'R-02': [3_430, 1_370, 100], 'R-03': [2_420, 2_370, 110]},
  },
  {
    id: 'B-13', seq: 13, countyId: 'fenwick', ballots: 4_800, scanner: 'SC-F2',
    checksum: 'DA19-4C66', stamp: '22:19', initialStatus: 'pending',
    memo: 'Fenwick final mail sweep — county certifies 100% on this batch',
    votes: {'R-01': [2_230, 2_470, 100], 'R-02': [3_310, 1_390, 100], 'R-03': [2_330, 2_380, 90]},
  },
];

const BATCH_BY_ID = new Map(BATCHES.map(b => [b.id, b]));

// Dev-time cross-check law (throws in dev if a fixture drifts): every vote
// triple sums to its batch ballots; county batch sums equal expected; the
// 13 batches sum to 90,000.
if (process.env.NODE_ENV !== 'production') {
  let all = 0;
  const perCounty = new Map<CountyId, number>();
  for (const b of BATCHES) {
    all += b.ballots;
    perCounty.set(b.countyId, (perCounty.get(b.countyId) ?? 0) + b.ballots);
    for (const race of RACES) {
      const [a, bb, o] = b.votes[race.id];
      if (a + bb + o !== b.ballots) {
        throw new Error(`Fixture drift: ${b.id} ${race.id} triple != ballots`);
      }
    }
  }
  if (all !== TOTAL_EXPECTED) throw new Error('Fixture drift: batches != 90,000');
  for (const c of COUNTIES) {
    if (perCounty.get(c.id) !== c.expectedBallots) {
      throw new Error(`Fixture drift: ${c.name} batches != expected`);
    }
  }
}

// Static ledger math (order never changes — the tape is append-only):
// per-race net-margin delta of each batch and the cumulative net after
// batches 1..seq. For verified entries the cumulative IS history; for
// pending entries it renders dimmed as "on verify".
const BATCH_NET_DELTA: Record<RaceId, number[]> = {'R-01': [], 'R-02': [], 'R-03': []};
const CUMULATIVE_NET: Record<RaceId, number[]> = {'R-01': [], 'R-02': [], 'R-03': []};
for (const race of RACES) {
  let running = 0;
  for (const b of BATCHES) {
    const delta = b.votes[race.id][0] - b.votes[race.id][1];
    running += delta;
    BATCH_NET_DELTA[race.id].push(delta);
    CUMULATIVE_NET[race.id].push(running);
  }
}

// ---------------------------------------------------------------------------
// STATE OWNER — single resultsStore with update(id, patch) as the ONLY
// mutator. Verify is legal only on the pending head (append-only ledger);
// calling a race is permanent (no retract — append-only ethos).
// ---------------------------------------------------------------------------

interface RaceCallState {
  id: RaceId;
  called: boolean;
  calledAtBatch: string | null;
}

interface ResultsStore {
  batches: Record<string, BatchStatus>;
  races: RaceCallState[];
  selectedRaceId: RaceId;
  countyFilter: CountyId | null; // tape filter (county header toggle)
}

interface StorePatch {
  status?: 'verified'; // id = batch id; pending head only
  called?: boolean; // id = race id; one-way
  selected?: boolean; // id = race id
  filtered?: boolean; // id = county id; toggles the tape filter
}

interface RaceDerived {
  def: RaceDef;
  votesA: number;
  votesB: number;
  votesOther: number;
  counted: number;
  net: number; // optionA − optionB (signed axis value)
  leader: RaceOption;
  trailer: RaceOption;
  leaderMargin: number; // |net|
  floor: number; // leaderMargin − outstanding: CALLABLE iff > 0
  callable: boolean;
  called: boolean;
  calledAtBatch: string | null;
  status: 'COUNTING' | 'CALLABLE' | 'CALLED';
}

interface CountyDerived {
  county: County;
  reported: number;
  pct: number; // 0–100, one decimal via formatPct
}

const numberFormat = new Intl.NumberFormat('en-US');
const fmt = (n: number): string => numberFormat.format(n);
const fmtSigned = (n: number): string => (n >= 0 ? `+${fmt(n)}` : `−${fmt(Math.abs(n))}`);
const fmtPct = (n: number): string => `${(Math.round(n * 10) / 10).toFixed(1)}%`;

// ---------------------------------------------------------------------------
// useElementWidth — container-width bands. The demo stage renders this page
// in a ~1045–1075px container inside a 1440px window, so viewport queries
// never fire there; the shell's own measured width drives every band, with
// the viewport query kept only as the width-0 first-frame fallback.
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
// SMALL PRIMITIVES — mark, swatches, pills
// ---------------------------------------------------------------------------

/** RotundaMark: half-circle dome over a baseline + one ballot tick, 20x20,
 * strokeWidth 2, currentColor. */
function RotundaMark() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden focusable="false">
      <path
        d="M4 16 A 6 6 0 0 1 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M2 16 H 18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <path
        d="M7.5 10.5 l 2 2 L 13 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Party swatch — shape + hue together (Meridian circle, Summit square) so
 * hue is never the sole party carrier. */
function Swatch({party}: {party: Party}) {
  return (
    <span
      aria-hidden
      style={{
        ...(party === 'meridian' ? styles.swatchCircle : styles.swatchSquare),
        backgroundColor: party === 'meridian' ? MERIDIAN : SUMMIT,
      }}
    />
  );
}

const PILL_STYLE: Record<RaceDerived['status'], CSSProperties> = {
  COUNTING: {backgroundColor: 'var(--color-background-muted)', color: 'var(--color-text-secondary)'},
  CALLABLE: {backgroundColor: OK_SOFT, color: OK_TEXT},
  CALLED: {backgroundColor: BRAND, color: ON_BRAND},
};

function StatusPill({status}: {status: RaceDerived['status']}) {
  return (
    <span className="erd-pill" style={{...styles.pill, ...PILL_STYLE[status]}}>
      {status === 'CALLED' ? <Icon icon={CircleCheckBigIcon} size="xsm" color="inherit" /> : null}
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TICKER HEADER — 48px; chips are the race-select affordance. <600 the
// ticker shows the selected race only (subtraction, not reflow).
// ---------------------------------------------------------------------------

interface TickerProps {
  derivedRaces: RaceDerived[];
  selectedRaceId: RaceId;
  reported: number;
  reportedPct: string;
  isTiny: boolean;
  onSelect: (id: RaceId) => void;
}

function TickerHeader({derivedRaces, selectedRaceId, reported, reportedPct, isTiny, onSelect}: TickerProps) {
  const chips = isTiny ? derivedRaces.filter(r => r.def.id === selectedRaceId) : derivedRaces;
  return (
    <header style={styles.ticker}>
      <span style={styles.brandLockup}>
        <span style={{color: BRAND_TEXT, display: 'inline-flex'}}>
          <RotundaMark />
        </span>
        <h1 style={{...styles.brandName, margin: 0}}>Rotunda Returns Desk</h1>
      </span>
      {isTiny ? null : (
        <span style={styles.tickerMeta}>
          <span style={styles.micro}>{ELECTION_NAME}</span>
          <span style={styles.micro}>
            {DESK_NAME} · {reportedPct} reported
          </span>
        </span>
      )}
      <span style={styles.tickerChips}>
        {chips.map(race => {
          const isSelected = race.def.id === selectedRaceId;
          const leadText = race.leader.party === 'meridian' ? MERIDIAN_TEXT : SUMMIT_TEXT;
          return (
            <button
              key={race.def.id}
              type="button"
              className="erd-focusable"
              style={isSelected ? {...styles.raceChip, ...styles.raceChipSelected} : styles.raceChip}
              aria-pressed={isSelected}
              onClick={() => onSelect(race.def.id)}>
              <span style={{fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)'}}>
                {race.def.abbrev}
              </span>
              <Swatch party={race.leader.party} />
              <span>{race.leader.short}</span>
              <span style={{...styles.tickerLead, color: leadText}}>
                {fmtSigned(race.leaderMargin)}
              </span>
              {race.status === 'COUNTING' ? null : <StatusPill status={race.status} />}
            </button>
          );
        })}
      </span>
    </header>
  );
}

// Race tab strip — replaces the RaceRail at the 600–859 band.
function RaceTabStrip({derivedRaces, selectedRaceId, onSelect}: Omit<TickerProps, 'reported' | 'reportedPct' | 'isTiny'>) {
  return (
    <nav style={styles.tabStrip} aria-label="Races">
      {derivedRaces.map(race => {
        const isSelected = race.def.id === selectedRaceId;
        return (
          <button
            key={race.def.id}
            type="button"
            className="erd-focusable"
            style={isSelected ? {...styles.raceChip, ...styles.raceChipSelected, height: 'auto'} : {...styles.raceChip, height: 'auto'}}
            aria-pressed={isSelected}
            onClick={() => onSelect(race.def.id)}>
            <span style={{fontSize: 13, fontWeight: 600}}>{race.def.abbrev}</span>
            <Swatch party={race.leader.party} />
            <span>{race.leader.short} {fmtSigned(race.leaderMargin)}</span>
            {race.status === 'COUNTING' ? null : <StatusPill status={race.status} />}
          </button>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// RACE RAIL — 300px aside, 84px rows; the entire row is the race-select
// affordance. Margin bar: two opposing hue segments scaled to vote share
// with a fixed 50% center tick — the near-flip stress (Measure 12 at +30)
// stays readable because the boundary sits a hair off the tick.
// ---------------------------------------------------------------------------

interface RaceRailProps {
  derivedRaces: RaceDerived[];
  selectedRaceId: RaceId;
  reportedPct: string;
  onSelect: (id: RaceId) => void;
}

function RaceRailItem({race, isSelected, reportedPct, onSelect}: {
  race: RaceDerived;
  isSelected: boolean;
  reportedPct: string;
  onSelect: (id: RaceId) => void;
}) {
  const leadText = race.leader.party === 'meridian' ? MERIDIAN_TEXT : SUMMIT_TEXT;
  const twoWay = race.votesA + race.votesB;
  return (
    <button
      type="button"
      className="erd-focusable"
      style={isSelected ? {...styles.railRow, ...styles.railRowSelected} : styles.railRow}
      aria-pressed={isSelected}
      onClick={() => onSelect(race.def.id)}>
      <span style={styles.railTitleRow}>
        <span style={styles.railTitle}>{race.def.name}</span>
        <StatusPill status={race.status} />
      </span>
      <span style={styles.railMeta}>
        <Swatch party={race.leader.party} />
        <span style={{color: leadText, fontWeight: 600}}>
          {race.leader.short} {fmtSigned(race.leaderMargin)}
        </span>
        <span>
          {fmt(race.votesA)} – {fmt(race.votesB)}
        </span>
      </span>
      <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{...styles.marginBarTrack, flex: 1}} aria-hidden>
          <span style={{flexGrow: race.votesA, backgroundColor: MERIDIAN, minWidth: 0}} />
          <span style={{flexGrow: Math.max(twoWay - race.votesA, 0), backgroundColor: SUMMIT, minWidth: 0}} />
          <span style={styles.marginBarCenter} />
        </span>
        <span style={{...styles.countyStat, width: 44, textAlign: 'end'}}>{reportedPct}</span>
      </span>
    </button>
  );
}

function RaceRail({derivedRaces, selectedRaceId, reportedPct, onSelect}: RaceRailProps) {
  return (
    <aside style={styles.rail} aria-label="Races">
      <h2 style={{...styles.railHeader, margin: 0}}>Races — District 4</h2>
      {derivedRaces.map(race => (
        <RaceRailItem
          key={race.def.id}
          race={race}
          isSelected={race.def.id === selectedRaceId}
          reportedPct={reportedPct}
          onSelect={onSelect}
        />
      ))}
      <div style={{padding: `8px ${PAD}px`, ...styles.matrixLegend}}>
        <span style={styles.legendItem}>
          <Swatch party="meridian" /> Meridian
        </span>
        <span style={styles.legendItem}>
          <Swatch party="summit" /> Summit
        </span>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// PRECINCT REPORTING MATRIX — 6 county rows x 13 batch columns. A cell
// exists only at fixture (county, batch) pairs; other positions render a
// 2px baseline dot. Vertical fill = batchBallots / countyExpectedBallots;
// hue = county historical lean; verified = full saturation, pending =
// outline-only at reduced alpha. Every cell is a real <button> opening a
// provenance Popover. County headers are buttons that toggle the tape's
// county filter.
// ---------------------------------------------------------------------------

interface MatrixProps {
  batchStatus: Record<string, BatchStatus>;
  countyDerived: CountyDerived[];
  countyFilter: CountyId | null;
  cellWidth: number;
  isTiny: boolean;
  onToggleFilter: (id: CountyId) => void;
}

function CellProvenance({batch, status}: {batch: BatchFixture; status: BatchStatus}) {
  const county = COUNTY_BY_ID.get(batch.countyId)!;
  const rows: Array<[string, ReactNode]> = [
    ['Batch', batch.id],
    ['County', county.name],
    ['Ballots', fmt(batch.ballots)],
    ['Scanner', batch.scanner],
    ['Checksum', batch.checksum],
    ['Verified', status === 'verified' ? batch.stamp : 'pending'],
  ];
  return (
    <div style={styles.provenance}>
      {rows.map(([label, value]) => (
        <div key={label} style={styles.provRow}>
          <span style={styles.provLabel}>{label}</span>
          <span style={{fontFamily: label === 'Checksum' || label === 'Scanner' ? MONO : undefined}}>
            {value}
          </span>
        </div>
      ))}
      <div style={{...styles.provLabel, maxWidth: 240}}>{batch.memo}</div>
    </div>
  );
}

function MatrixCell({batch, status, cellWidth}: {
  batch: BatchFixture;
  status: BatchStatus;
  cellWidth: number;
}) {
  const county = COUNTY_BY_ID.get(batch.countyId)!;
  const hue = county.lean === 'meridian' ? MERIDIAN : SUMMIT;
  const fillPct = Math.round((batch.ballots / county.expectedBallots) * 100);
  const label = `${county.name}, batch ${batch.id}, ${fmt(batch.ballots)} ballots, ${
    status === 'verified' ? `verified ${batch.stamp}` : 'pending'
  }`;
  return (
    <Popover
      label={`Batch ${batch.id} provenance`}
      placement="below"
      content={<CellProvenance batch={batch} status={status} />}>
      <button
        type="button"
        className="erd-focusable"
        aria-label={label}
        style={{
          ...styles.cellButton,
          width: cellWidth,
          borderColor: 'var(--color-border)',
        }}>
        <span
          className="erd-cell-fill"
          aria-hidden
          style={{
            position: 'absolute',
            left: 1,
            right: 1,
            bottom: 1,
            height: `${fillPct}%`,
            borderRadius: 1,
            backgroundColor: status === 'verified' ? hue : 'transparent',
            border: status === 'verified' ? 'none' : `1px solid ${hue}`,
            opacity: status === 'verified' ? 1 : 0.45,
          }}
        />
      </button>
    </Popover>
  );
}

function CountyHeaderButton({row, isFiltered, onToggleFilter}: {
  row: CountyDerived;
  isFiltered: boolean;
  onToggleFilter: (id: CountyId) => void;
}) {
  const pct = row.county.expectedBallots === 0 ? 0 : (row.reported / row.county.expectedBallots) * 100;
  return (
    <Tooltip content={`${row.county.name} · ${row.county.leanLabel} · ${isFiltered ? 'clear tape filter' : 'filter tape to county'}`}>
      <button
        type="button"
        className="erd-focusable"
        aria-pressed={isFiltered}
        aria-label={`${row.county.name}: ${fmt(row.reported)} of ${fmt(row.county.expectedBallots)} ballots reported (${fmtPct(pct)}). Toggles the ledger tape county filter.`}
        style={{
          ...styles.countyHeader,
          backgroundColor: isFiltered ? BRAND_SOFT : undefined,
        }}
        onClick={() => onToggleFilter(row.county.id)}>
        {/* Integer % in the 92px header (one-decimal value lives in the
            aria-label + tooltip). "Brightwater" is the column's width
            stress: the name ellipsizes a few px against the fixed 92px
            label column while the % stays pinned — full name + exact
            figures always recoverable from the tooltip and aria-label. */}
        <span style={{...styles.countyName, color: isFiltered ? BRAND_TEXT : undefined}}>
          <span style={styles.countyNameText}>{row.county.name}</span>
          <span style={{fontSize: 11, fontWeight: 400, flexShrink: 0, fontVariantNumeric: 'tabular-nums'}}>
            {Math.round(pct)}%
          </span>
        </span>
        <span style={styles.countyStat}>
          {fmt(row.reported)}/{fmt(row.county.expectedBallots)}
        </span>
      </button>
    </Tooltip>
  );
}

/** <600 band: county-rows-only summary bars; the 13 cells fold into a
 * per-row popover list. Same arithmetic, different placement. */
function CountySummaryRow({row, batchStatus, isFiltered, onToggleFilter}: {
  row: CountyDerived;
  batchStatus: Record<string, BatchStatus>;
  isFiltered: boolean;
  onToggleFilter: (id: CountyId) => void;
}) {
  const hue = row.county.lean === 'meridian' ? MERIDIAN : SUMMIT;
  const soft = row.county.lean === 'meridian' ? MERIDIAN_SOFT : SUMMIT_SOFT;
  const batches = BATCHES.filter(b => b.countyId === row.county.id);
  const pct = (row.reported / row.county.expectedBallots) * 100;
  return (
    <div style={{...styles.matrixRow, height: 'auto', minHeight: MATRIX_ROW_H}}>
      <CountyHeaderButton row={row} isFiltered={isFiltered} onToggleFilter={onToggleFilter} />
      <span style={{...styles.summaryTrack, display: 'flex'}} aria-hidden>
        <span style={{width: `${pct}%`, backgroundColor: hue}} />
        <span style={{flex: 1, backgroundColor: soft}} />
      </span>
      <Popover
        label={`${row.county.name} batches`}
        placement="below"
        content={
          <div style={styles.provenance}>
            {batches.map(b => (
              <div key={b.id} style={styles.provRow}>
                <span style={{fontFamily: MONO}}>{b.id}</span>
                <span>{fmt(b.ballots)}</span>
                <span style={styles.provLabel}>
                  {batchStatus[b.id] === 'verified' ? `✓ ${b.stamp}` : 'pending'}
                </span>
              </div>
            ))}
          </div>
        }>
        <button type="button" className="erd-focusable" style={{...styles.raceChip, height: 24, fontSize: 11}}>
          {batches.length} {batches.length === 1 ? 'batch' : 'batches'}
        </button>
      </Popover>
    </div>
  );
}

function PrecinctReportingMatrix({batchStatus, countyDerived, countyFilter, cellWidth, isTiny, onToggleFilter}: MatrixProps) {
  const reported = countyDerived.reduce((sum, c) => sum + c.reported, 0);
  return (
    <section style={styles.panel} aria-label="Precinct reporting matrix">
      <div style={styles.panelTitleRow}>
        <h2 style={{...styles.panelTitle, margin: 0}}>County × batch reporting</h2>
        <span style={styles.micro}>
          {fmt(reported)}/{fmt(TOTAL_EXPECTED)} ballots · {fmtPct((reported / TOTAL_EXPECTED) * 100)} · B-01–B-13 in global order
        </span>
      </div>
      {isTiny ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          {countyDerived.map(row => (
            <CountySummaryRow
              key={row.county.id}
              row={row}
              batchStatus={batchStatus}
              isFiltered={countyFilter === row.county.id}
              onToggleFilter={onToggleFilter}
            />
          ))}
        </div>
      ) : (
        <div>
          {countyDerived.map(row => (
            <div key={row.county.id} style={styles.matrixRow}>
              <CountyHeaderButton
                row={row}
                isFiltered={countyFilter === row.county.id}
                onToggleFilter={onToggleFilter}
              />
              <span style={styles.cellRun}>
                {BATCHES.map(batch =>
                  batch.countyId === row.county.id ? (
                    <MatrixCell
                      key={batch.id}
                      batch={batch}
                      status={batchStatus[batch.id]}
                      cellWidth={cellWidth}
                    />
                  ) : (
                    <span key={batch.id} style={{...styles.cellSlot, width: cellWidth}} aria-hidden>
                      <span style={styles.baselineDot} />
                    </span>
                  ),
                )}
              </span>
            </div>
          ))}
        </div>
      )}
      <div style={styles.matrixLegend}>
        <span style={styles.legendItem}>
          <Swatch party="meridian" /> Meridian-lean county
        </span>
        <span style={styles.legendItem}>
          <Swatch party="summit" /> Summit-lean county
        </span>
        <span style={styles.legendItem}>solid = verified · outline = pending · fill height = share of county</span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CALL CONFIDENCE GAUGE — custom SVG. Linear net-margin axis, domain frozen
// at mount per race (±60k / ±80k / ±60k — see RaceDef.domain math). Renders
// the zero line, the 12px outstanding-vote envelope [M−O, M+O], the 4px
// margin marker at M, and numeric readouts M / O / floor M−O. Invariant in
// text on the pill: CALLABLE iff M − O > 0. The band takes the success tint
// the moment the floor crosses zero. role="img" with a computed label so
// the dual-band geometry is never the sole carrier.
// ---------------------------------------------------------------------------

function CallConfidenceGauge({race, outstanding, isNarrow}: {
  race: RaceDerived;
  outstanding: number;
  isNarrow: boolean;
}) {
  const {def} = race;
  const clampPct = (v: number) => Math.min(100, Math.max(0, 50 + (50 * v) / def.domain));
  const bandLo = clampPct(race.net - outstanding);
  const bandHi = clampPct(race.net + outstanding);
  const markerPct = clampPct(race.net);
  const isCallable = race.floor > 0;
  const floorSigned = race.net >= 0 ? race.net - outstanding : -(Math.abs(race.net) - outstanding);
  const gaugeLabel =
    `${def.name}: ${race.leader.short} leads by ${fmt(race.leaderMargin)} with ${fmt(outstanding)} ` +
    `ballots outstanding. Envelope floor ${fmtSigned(race.floor)}. ` +
    (race.called
      ? `CALLED at ${race.calledAtBatch ?? '—'}.`
      : isCallable
        ? 'CALLABLE: the margin exceeds every reachable swing.'
        : 'Not callable: outstanding ballots could still reverse the lead.');
  const readouts = (
    <div style={{...styles.gaugeReadouts, flexWrap: isNarrow ? 'wrap' : 'nowrap'}}>
      <Tooltip content="M — current leader margin among counted ballots">
        <span style={{...styles.gaugeMarginReadout, color: race.leader.party === 'meridian' ? MERIDIAN_TEXT : SUMMIT_TEXT}}>
          {race.leader.short} {fmtSigned(race.leaderMargin)}
        </span>
      </Tooltip>
      <Tooltip content="O — ballots not yet verified; the maximum reachable swing">
        <span style={styles.callStat}>
          <span style={styles.readoutLabel}>Outstanding O</span>
          <span style={styles.readoutValue}>{fmt(outstanding)}</span>
        </span>
      </Tooltip>
      <Tooltip content="Envelope floor M − O: the lead if every outstanding ballot broke against the leader. CALLABLE iff M − O > 0.">
        <span style={styles.callStat}>
          <span style={styles.readoutLabel}>Floor M − O</span>
          <span style={{...styles.readoutValue, color: isCallable ? OK_TEXT : undefined}}>
            {fmtSigned(race.floor)}
          </span>
        </span>
      </Tooltip>
    </div>
  );
  return (
    <section
      style={{...styles.panel, ...(isNarrow ? {} : styles.gaugePanel)}}
      aria-label="Call confidence gauge">
      <div style={{...styles.panelTitleRow, marginBottom: -4}}>
        <h2 style={{...styles.panelTitle, margin: 0, fontSize: 13}}>
          Call confidence — {def.name}
        </h2>
        {race.called ? (
          // Call annotation replaces the invariant caption once it is moot.
          <span style={{...styles.micro, color: BRAND_TEXT, fontWeight: 700}}>
            CALLED at {race.calledAtBatch} ·{' '}
            {race.calledAtBatch != null ? BATCH_BY_ID.get(race.calledAtBatch)?.stamp : ''}
          </span>
        ) : (
          <span style={styles.micro}>axis ±{fmt(def.domain)} · CALLABLE iff M − O &gt; 0</span>
        )}
      </div>
      <div style={styles.gaugeBody} role="img" aria-label={gaugeLabel}>
        <svg width="100%" height={36} aria-hidden focusable="false" style={{display: 'block'}}>
          {/* zero line */}
          <line x1="50%" x2="50%" y1={2} y2={34} stroke="var(--color-text-secondary)" strokeWidth={1} />
          {/* axis baseline */}
          <line x1="0%" x2="100%" y1={18} y2={18} stroke="var(--color-border)" strokeWidth={1} />
          {/* outstanding-vote envelope band (12px, square-ended) */}
          <rect
            x={`${bandLo}%`}
            width={`${Math.max(bandHi - bandLo, 0.4)}%`}
            y={18 - BAND_H / 2}
            height={BAND_H}
            fill={isCallable ? OK_SOFT : ENVELOPE}
            stroke={isCallable ? OK_GREEN : 'var(--color-border)'}
            strokeWidth={1}
          />
          {/* margin marker (4px, square-ended) */}
          <line
            x1={`${markerPct}%`}
            x2={`${markerPct}%`}
            y1={8}
            y2={28}
            stroke={race.leader.party === 'meridian' ? MERIDIAN : SUMMIT}
            strokeWidth={MARKER_W}
          />
        </svg>
        <span style={{position: 'absolute', top: 0, left: 0, ...styles.micro, color: SUMMIT_TEXT}}>
          ← {def.optionB.short}
        </span>
        <span style={{position: 'absolute', top: 0, right: 0, ...styles.micro, color: MERIDIAN_TEXT}}>
          {def.optionA.short} →
        </span>
        {/* transparent overlays so band + marker carry explanatory tooltips */}
        <Tooltip content={`Envelope [M − O, M + O]: final margin must land between ${fmtSigned(floorSigned)} and ${fmtSigned(race.net >= 0 ? race.net + outstanding : -(Math.abs(race.net) + outstanding))}`}>
          <span
            style={{...styles.gaugeOverlay, left: `${bandLo}%`, width: `${Math.max(bandHi - bandLo, 1)}%`}}
            aria-hidden
          />
        </Tooltip>
        <Tooltip content={`M: ${race.leader.short} ${fmtSigned(race.leaderMargin)} among counted ballots`}>
          <span style={{...styles.gaugeOverlay, left: `calc(${markerPct}% - 6px)`, width: 12}} aria-hidden />
        </Tooltip>
      </div>
      {readouts}
    </section>
  );
}

// ---------------------------------------------------------------------------
// RACE DETAIL — tally table for the selected race, share bars over counted
// ballots only; the footer restates the counted/outstanding cross-check.
// ---------------------------------------------------------------------------

function TallyTable({race, outstanding}: {race: RaceDerived; outstanding: number}) {
  const rows = [
    {name: race.def.optionA.name, votes: race.votesA, party: 'meridian' as Party | null},
    {name: race.def.optionB.name, votes: race.votesB, party: 'summit' as Party | null},
    {name: race.def.otherLabel, votes: race.votesOther, party: null},
  ];
  return (
    <section style={styles.panel} aria-label="Race detail">
      <div style={styles.panelTitleRow}>
        <h2 style={{...styles.panelTitle, margin: 0}}>Race detail — {race.def.name}</h2>
        <StatusPill status={race.status} />
      </div>
      {rows.map(row => {
        const share = race.counted === 0 ? 0 : (row.votes / race.counted) * 100;
        return (
          <div key={row.name} style={styles.tallyRow}>
            <span style={styles.tallyName}>
              {row.party != null ? <Swatch party={row.party} /> : <span style={{...styles.swatchCircle, backgroundColor: 'var(--color-border)'}} aria-hidden />}
              {row.name}
            </span>
            <span style={styles.tallyVotes}>{fmt(row.votes)}</span>
            <span style={styles.tallyShare}>{fmtPct(share)}</span>
            <span style={styles.tallyBarTrack} aria-hidden>
              <span
                style={{
                  display: 'block',
                  height: '100%',
                  width: `${share}%`,
                  borderRadius: 999,
                  backgroundColor: row.party == null ? 'var(--color-border)' : row.party === 'meridian' ? MERIDIAN : SUMMIT,
                }}
              />
            </span>
          </div>
        );
      })}
      <span style={styles.micro}>
        {fmt(race.counted)} counted of {fmt(TOTAL_EXPECTED)} expected · {fmt(outstanding)} outstanding
      </span>
    </section>
  );
}

// ---------------------------------------------------------------------------
// BATCH LEDGER TAPE — append-only, 2px left spine, strict sequence
// B-01..B-13. Exactly ONE entry (the pending head) carries the enabled
// Verify button; later pending entries render it disabled with the
// "Verify in ledger order" tooltip. No delete/edit affordances anywhere.
// Entry click (the upper region button) expands the memo and the per-race
// deltas for all three races; Escape collapses and focus stays put.
// ---------------------------------------------------------------------------

interface TapeProps {
  batchStatus: Record<string, BatchStatus>;
  selectedRaceId: RaceId;
  countyFilter: CountyId | null;
  pendingHeadId: string | null;
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  onVerify: (id: string) => void;
  onClearFilter: () => void;
}

function TapeEntry({batch, status, selectedRaceId, isHead, isExpanded, onExpand, onVerify}: {
  batch: BatchFixture;
  status: BatchStatus;
  selectedRaceId: RaceId;
  isHead: boolean;
  isExpanded: boolean;
  onExpand: (id: string | null) => void;
  onVerify: (id: string) => void;
}) {
  const county = COUNTY_BY_ID.get(batch.countyId)!;
  const delta = BATCH_NET_DELTA[selectedRaceId][batch.seq - 1];
  const cumulative = CUMULATIVE_NET[selectedRaceId][batch.seq - 1];
  const race = RACE_BY_ID.get(selectedRaceId)!;
  const deltaUp = delta >= 0;
  const deltaColor = deltaUp ? MERIDIAN_TEXT : SUMMIT_TEXT;
  const entryStyle = {
    ...styles.tapeEntry,
    ...(status === 'verified' ? styles.tapeEntryVerified : isHead ? styles.tapeEntryHead : null),
    cursor: 'default',
  };
  return (
    <div style={entryStyle}>
      <button
        type="button"
        className="erd-focusable"
        aria-expanded={isExpanded}
        aria-label={`Batch ${batch.id}, ${county.name}, ${fmt(batch.ballots)} ballots, ${
          status === 'verified' ? `verified ${batch.stamp}` : 'pending'
        }. Toggles memo and per-race deltas.`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          font: 'inherit',
          color: 'inherit',
          textAlign: 'start',
          cursor: 'pointer',
          borderRadius: 4,
        }}
        onClick={() => onExpand(isExpanded ? null : batch.id)}
        onKeyDown={event => {
          // Escape layering: collapse the expanded entry only; overlays
          // (Popover/Dialog) own their own Escape. No global shortcuts on
          // this page, so no typing-target guard is needed.
          if (event.key === 'Escape' && isExpanded) {
            event.stopPropagation();
            onExpand(null);
          }
        }}>
        <span style={styles.tapeTopRow}>
          <span style={styles.seqBadge}>{String(batch.seq).padStart(2, '0')}</span>
          <span style={{fontSize: 13, fontWeight: 700, fontFamily: MONO}}>{batch.id}</span>
          <span style={{fontSize: 12, color: 'var(--color-text-secondary)'}}>{county.name}</span>
          <span style={{marginLeft: 'auto', fontSize: 13, fontVariantNumeric: 'tabular-nums'}}>
            {fmt(batch.ballots)}
          </span>
        </span>
        <span style={styles.tapeTopRow}>
          <span style={styles.mono11}>
            {batch.scanner} · chk {batch.checksum}
          </span>
          <span style={{marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: status === 'verified' ? OK_TEXT : 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'}}>
            {status === 'verified' ? (
              <>
                <Icon icon={CheckIcon} size="xsm" color="inherit" /> {batch.stamp}
              </>
            ) : (
              'pending'
            )}
          </span>
        </span>
        <span style={isExpanded ? {...styles.tapeMemo, ...styles.tapeMemoExpanded} : styles.tapeMemo}>
          {batch.memo}
        </span>
        {isExpanded ? (
          <span style={{display: 'flex', flexDirection: 'column', gap: 2, fontSize: 12, fontVariantNumeric: 'tabular-nums'}}>
            {RACES.map(r => {
              const d = BATCH_NET_DELTA[r.id][batch.seq - 1];
              return (
                <span key={r.id} style={{display: 'flex', gap: 8}}>
                  <span style={{...styles.provLabel, width: 34}}>{r.abbrev}</span>
                  <span style={{color: d >= 0 ? MERIDIAN_TEXT : SUMMIT_TEXT, fontWeight: 600}}>
                    {fmtSigned(d)} {d >= 0 ? r.optionA.short : r.optionB.short}
                  </span>
                  <span style={styles.provLabel}>cum {fmtSigned(CUMULATIVE_NET[r.id][batch.seq - 1])}</span>
                </span>
              );
            })}
          </span>
        ) : null}
      </button>
      <span style={styles.tapeDeltaRow}>
        <span style={{...styles.deltaChip, color: deltaColor}}>
          <Icon icon={deltaUp ? ArrowUpIcon : ArrowDownIcon} size="xsm" color="inherit" />
          {fmtSigned(delta)} {deltaUp ? race.optionA.short : race.optionB.short}
        </span>
        <span style={{...styles.micro, opacity: status === 'verified' ? 1 : 0.7}}>
          cum {fmtSigned(cumulative)}
          {status === 'verified' ? '' : ' on verify'}
        </span>
        <span style={{marginLeft: 'auto'}}>
          {status === 'pending' ? (
            isHead ? (
              <Button label="Verify batch" variant="primary" size="sm" onClick={() => onVerify(batch.id)} />
            ) : (
              <Tooltip content="Verify in ledger order">
                <span style={{display: 'inline-flex'}}>
                  <Button label="Verify batch" variant="secondary" size="sm" isDisabled onClick={() => {}} />
                </span>
              </Tooltip>
            )
          ) : null}
        </span>
      </span>
    </div>
  );
}

function BatchLedgerTape({batchStatus, selectedRaceId, countyFilter, pendingHeadId, expandedId, onExpand, onVerify, onClearFilter}: TapeProps) {
  const filterCounty = countyFilter != null ? COUNTY_BY_ID.get(countyFilter) : null;
  const visible = filterCounty == null ? BATCHES : BATCHES.filter(b => b.countyId === filterCounty.id);
  const pendingCount = BATCHES.filter(b => batchStatus[b.id] === 'pending').length;
  return (
    <>
      <div style={styles.tapeHeader}>
        <h2 style={{margin: 0, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6}}>
          <Icon icon={ScrollTextIcon} size="sm" color="secondary" />
          Ledger tape
          <span style={styles.micro}>{pendingCount} pending</span>
        </h2>
        {filterCounty != null ? (
          <button
            type="button"
            className="erd-focusable"
            style={{...styles.raceChip, height: 24, fontSize: 11, gap: 4}}
            onClick={onClearFilter}
            aria-label={`Clear county filter: ${filterCounty.name}`}>
            {filterCounty.name} only
            <Icon icon={XIcon} size="xsm" color="inherit" />
          </button>
        ) : (
          <span style={styles.micro}>append-only</span>
        )}
      </div>
      <div style={styles.tapeList}>
        {visible.map(batch => (
          <TapeEntry
            key={batch.id}
            batch={batch}
            status={batchStatus[batch.id]}
            selectedRaceId={selectedRaceId}
            isHead={batch.id === pendingHeadId}
            isExpanded={expandedId === batch.id}
            onExpand={onExpand}
            onVerify={onVerify}
          />
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// CALL DESK BAR — 64px, a normal flex row of the shell (never fixed).
// Shows the selected race: leader, M, O, floor M−O, status chip; the Call
// action goes through the same update() as everything else and is
// permanent. Below 1024px it also hosts the "Ledger (n pending)" button.
// ---------------------------------------------------------------------------

function CallDeskBar({race, outstanding, pendingCount, isTapeDocked, isRailDocked, onCall, onOpenLedger}: {
  race: RaceDerived;
  outstanding: number;
  pendingCount: number;
  isTapeDocked: boolean;
  isRailDocked: boolean;
  onCall: (id: RaceId) => void;
  onOpenLedger: () => void;
}) {
  const canCall = race.callable && !race.called;
  const reason = `Margin ${fmt(race.leaderMargin)} does not exceed ${fmt(outstanding)} outstanding ballots`;
  return (
    <footer style={styles.callBar}>
      <StatusPill status={race.status} />
      <span style={{display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden'}}>
        <span style={{fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap'}}>{race.def.name}</span>
        <Swatch party={race.leader.party} />
        <span style={{fontSize: 13, whiteSpace: 'nowrap', color: race.leader.party === 'meridian' ? MERIDIAN_TEXT : SUMMIT_TEXT, fontWeight: 600}}>
          {race.leader.short}
        </span>
      </span>
      <span style={styles.callStats}>
        <span style={styles.callStat}>
          <span style={styles.readoutLabel}>Margin M</span>
          <span style={styles.callStatValue}>{fmtSigned(race.leaderMargin)}</span>
        </span>
        <span style={styles.callStat}>
          <span style={styles.readoutLabel}>Outstanding O</span>
          <span style={styles.callStatValue}>{fmt(outstanding)}</span>
        </span>
        <span style={styles.callStat}>
          <span style={styles.readoutLabel}>Floor M − O</span>
          <span style={{...styles.callStatValue, color: race.floor > 0 ? OK_TEXT : undefined}}>
            {fmtSigned(race.floor)}
          </span>
        </span>
      </span>
      <span style={styles.callRight}>
        {isTapeDocked ? null : (
          <Button
            label={`Ledger (${pendingCount} pending)`}
            variant="secondary"
            size="sm"
            icon={<Icon icon={ScrollTextIcon} size="sm" />}
            onClick={onOpenLedger}
          />
        )}
        {race.called ? (
          <span style={{...styles.micro, color: BRAND_TEXT, fontWeight: 700}}>
            Called at {race.calledAtBatch}
            {race.calledAtBatch != null ? ` · ${BATCH_BY_ID.get(race.calledAtBatch)?.stamp}` : ''}
          </span>
        ) : (
          <>
            <button
              type="button"
              className="erd-focusable"
              disabled={!canCall}
              aria-describedby={canCall ? undefined : 'erd-call-reason'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 32,
                padding: '0 12px',
                borderRadius: 6,
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                font: 'inherit',
                cursor: canCall ? 'pointer' : 'not-allowed',
                backgroundColor: canCall ? BRAND : 'var(--color-background-muted)',
                color: canCall ? ON_BRAND : 'var(--color-text-secondary)',
              }}
              onClick={() => onCall(race.def.id)}>
              <Icon icon={MegaphoneIcon} size="sm" color="inherit" />
              Call race
            </button>
            {canCall ? null : (
              <span id="erd-call-reason" className="erd-vhidden">
                {reason}
              </span>
            )}
          </>
        )}
        {isRailDocked ? <span style={styles.micro}>{OPERATOR}</span> : null}
      </span>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the resultsStore lives here; update(id, patch) is the ONLY
// mutator. Every verify re-derives the three race tallies, fills the
// matching matrix cell, narrows the gauge envelope, updates ticker/rail
// chips and the call bar, and speaks one polite announcement.
// ---------------------------------------------------------------------------

export default function ElectionReturnsDeskTemplate() {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const shellWidth = useElementWidth(shellRef);
  // Width 0 = first pre-observer frame; viewport queries cover that frame
  // so wide hosts never flash pane removal.
  const vpTapeHidden = useMediaQuery('(max-width: 1023px)');
  const vpRailHidden = useMediaQuery('(max-width: 859px)');
  const vpTiny = useMediaQuery('(max-width: 599px)');
  const isTapeDocked = shellWidth > 0 ? shellWidth >= 1024 : !vpTapeHidden;
  const isRailDocked = shellWidth > 0 ? shellWidth >= 860 : !vpRailHidden;
  const isTiny = shellWidth > 0 ? shellWidth < 600 : vpTiny;

  const [store, setStore] = useState<ResultsStore>(() => ({
    batches: Object.fromEntries(BATCHES.map(b => [b.id, b.initialStatus])),
    races: RACES.map(r => ({id: r.id, called: false, calledAtBatch: null})),
    selectedRaceId: 'R-01',
    countyFilter: null,
  }));
  const [announcement, setAnnouncement] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // ---- Derivations: the fixtures are raw counts only; everything below is
  // recomputed from the verified set on each store change. -----------------
  const derived = useMemo(() => {
    const verified = BATCHES.filter(b => store.batches[b.id] === 'verified');
    const reported = verified.reduce((sum, b) => sum + b.ballots, 0);
    const outstanding = TOTAL_EXPECTED - reported;
    const pendingHead = BATCHES.find(b => store.batches[b.id] === 'pending') ?? null;
    const countyDerived: CountyDerived[] = COUNTIES.map(county => {
      const rep = verified.filter(b => b.countyId === county.id).reduce((s, b) => s + b.ballots, 0);
      return {county, reported: rep, pct: (rep / county.expectedBallots) * 100};
    });
    const races: RaceDerived[] = RACES.map(def => {
      let votesA = 0;
      let votesB = 0;
      let votesOther = 0;
      for (const b of verified) {
        const [a, bb, o] = b.votes[def.id];
        votesA += a;
        votesB += bb;
        votesOther += o;
      }
      const net = votesA - votesB;
      const leader = net >= 0 ? def.optionA : def.optionB;
      const trailer = net >= 0 ? def.optionB : def.optionA;
      const leaderMargin = Math.abs(net);
      const floor = leaderMargin - outstanding;
      const callState = store.races.find(r => r.id === def.id)!;
      const callable = floor > 0;
      return {
        def,
        votesA,
        votesB,
        votesOther,
        counted: votesA + votesB + votesOther,
        net,
        leader,
        trailer,
        leaderMargin,
        floor,
        callable,
        called: callState.called,
        calledAtBatch: callState.calledAtBatch,
        status: callState.called ? 'CALLED' : callable ? 'CALLABLE' : 'COUNTING',
      } as RaceDerived;
    });
    return {
      reported,
      outstanding,
      reportedPct: fmtPct((reported / TOTAL_EXPECTED) * 100),
      pendingHeadId: pendingHead?.id ?? null,
      pendingCount: BATCHES.length - verified.length,
      countyDerived,
      races,
      lastVerifiedId: [...verified].sort((a, b) => a.seq - b.seq).at(-1)?.id ?? null,
    };
  }, [store]);

  const selectedRace = derived.races.find(r => r.def.id === store.selectedRaceId)!;

  // ---- THE one mutator ----------------------------------------------------
  const update = useCallback(
    (id: string, patch: StorePatch) => {
      if (patch.status === 'verified') {
        // Append-only law: only the pending head may verify.
        if (id !== derived.pendingHeadId) return;
        const batch = BATCH_BY_ID.get(id)!;
        // Announce with post-verify numbers for the selected race.
        const race = derived.races.find(r => r.def.id === store.selectedRaceId)!;
        const [dA, dB] = [batch.votes[race.def.id][0], batch.votes[race.def.id][1]];
        const nextA = race.votesA + dA;
        const nextB = race.votesB + dB;
        const nextOutstanding = derived.outstanding - batch.ballots;
        setAnnouncement(
          `Batch ${batch.id} verified. ${race.def.name}: ${race.def.optionA.short} ${fmt(nextA)}, ` +
            `${race.def.optionB.short} ${fmt(nextB)}, margin ${fmt(Math.abs(nextA - nextB))}, ` +
            `outstanding ${fmt(nextOutstanding)}.`,
        );
        setStore(prev => ({...prev, batches: {...prev.batches, [id]: 'verified'}}));
        return;
      }
      if (patch.called === true) {
        const race = derived.races.find(r => r.def.id === id);
        if (race == null || race.called || !race.callable) return;
        setAnnouncement(
          `${race.def.name} called for ${race.leader.name}. Margin ${fmt(race.leaderMargin)}, ` +
            `outstanding ${fmt(derived.outstanding)}, floor ${fmtSigned(race.floor)}.`,
        );
        setStore(prev => ({
          ...prev,
          races: prev.races.map(r =>
            r.id === id ? {...r, called: true, calledAtBatch: derived.lastVerifiedId} : r,
          ),
        }));
        return;
      }
      if (patch.selected === true) {
        setStore(prev => ({...prev, selectedRaceId: id as RaceId}));
        return;
      }
      if (patch.filtered != null) {
        setStore(prev => ({
          ...prev,
          countyFilter: prev.countyFilter === (id as CountyId) ? null : (id as CountyId),
        }));
      }
    },
    [derived, store.selectedRaceId],
  );

  const selectRace = useCallback((id: RaceId) => update(id, {selected: true}), [update]);
  const verifyBatch = useCallback((id: string) => update(id, {status: 'verified'}), [update]);
  const callRace = useCallback((id: RaceId) => update(id, {called: true}), [update]);
  const toggleCountyFilter = useCallback((id: CountyId) => update(id, {filtered: true}), [update]);
  const clearCountyFilter = useCallback(() => {
    setStore(prev => ({...prev, countyFilter: null}));
  }, []);

  // Matrix cell width, derived from the measured pane budget (see the
  // responsive-contract note in the header: cells clamp to the band max of
  // 20px / 24px and compress in starved hosts so all 13 columns stay
  // visible without horizontal scroll — geometry law unchanged).
  const cellWidth = useMemo(() => {
    const shell = shellWidth > 0 ? shellWidth : 1045;
    const mainWidth =
      shell - (isRailDocked ? RAIL_W + 1 : 0) - (isTapeDocked ? TAPE_W + 1 : 0);
    const paneWidth = mainWidth - 2 * PAD - 2 * PAD - 2; // main + panel padding + border
    const bandMax = isTapeDocked ? CELL_W : 24;
    return Math.max(12, Math.min(bandMax, Math.floor((paneWidth - LABEL_W - 8 - CELL_GAP * 12) / 13)));
  }, [shellWidth, isRailDocked, isTapeDocked]);

  const tape = (
    <BatchLedgerTape
      batchStatus={store.batches}
      selectedRaceId={store.selectedRaceId}
      countyFilter={store.countyFilter}
      pendingHeadId={derived.pendingHeadId}
      expandedId={expandedId}
      onExpand={setExpandedId}
      onVerify={verifyBatch}
      onClearFilter={clearCountyFilter}
    />
  );

  return (
    <div ref={shellRef} style={styles.shell}>
      <style>{DESK_CSS}</style>
      {/* Polite live region — one sentence per commit/call. */}
      <div aria-live="polite" className="erd-vhidden">
        {announcement}
      </div>
      <TickerHeader
        derivedRaces={derived.races}
        selectedRaceId={store.selectedRaceId}
        reported={derived.reported}
        reportedPct={derived.reportedPct}
        isTiny={isTiny}
        onSelect={selectRace}
      />
      {isRailDocked ? null : (
        <RaceTabStrip
          derivedRaces={derived.races}
          selectedRaceId={store.selectedRaceId}
          onSelect={selectRace}
        />
      )}
      <div style={styles.viewRoot}>
        {isRailDocked ? (
          <RaceRail
            derivedRaces={derived.races}
            selectedRaceId={store.selectedRaceId}
            reportedPct={derived.reportedPct}
            onSelect={selectRace}
          />
        ) : null}
        <main style={styles.main}>
          <PrecinctReportingMatrix
            batchStatus={store.batches}
            countyDerived={derived.countyDerived}
            countyFilter={store.countyFilter}
            cellWidth={cellWidth}
            isTiny={isTiny}
            onToggleFilter={toggleCountyFilter}
          />
          <CallConfidenceGauge
            race={selectedRace}
            outstanding={derived.outstanding}
            isNarrow={!isRailDocked}
          />
          <TallyTable race={selectedRace} outstanding={derived.outstanding} />
        </main>
        {isTapeDocked ? <aside style={styles.tape} aria-label="Batch ledger tape">{tape}</aside> : null}
      </div>
      <CallDeskBar
        race={selectedRace}
        outstanding={derived.outstanding}
        pendingCount={derived.pendingCount}
        isTapeDocked={isTapeDocked}
        isRailDocked={isRailDocked}
        onCall={callRace}
        onOpenLedger={() => setIsLedgerOpen(true)}
      />
      {/* Ledger sheet for the <1024 bands — verify works here too; the DS
          Dialog owns focus trap, Escape, and focus restore. */}
      {isTapeDocked ? null : (
        <Dialog
          isOpen={isLedgerOpen}
          onOpenChange={setIsLedgerOpen}
          aria-label="Batch ledger tape"
          width={TAPE_W + 40}
          maxHeight="85vh"
          purpose="info">
          {tape}
        </Dialog>
      )}
    </div>
  );
}
