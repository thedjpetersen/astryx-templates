var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Daylight public-records console
 *   for the City of Alder Bay records office, anchored to TODAY = Fri,
 *   Jul 4 (ordinal 20260704). Seven FOIA requests with PRE-COMPUTED
 *   business-day math (dual fields everywhere: dueDateDisplay +
 *   dueDateOrdinal + businessDaysRemaining — no Date.now(), no clock
 *   arithmetic at runtime), page-level exemption runs for the selected
 *   request's four documents, a fee block whose lines reconcile by
 *   construction (3.5 h × $44.00 + 2.0 h × $60.00 + 262 pp × $0.25 =
 *   $339.50), and a per-request correspondence log of ticket-shaped
 *   letters. No network assets, no randomness.
 * @output Public Records Console — a FOIA officer's working surface:
 *   340px request queue with statutory due-date cells (amber at-risk,
 *   red overdue, slate TOLLED ⏸), a detail column led by a
 *   StatutoryClockRail that renders the 20-business-day clock as one
 *   cell per day with hatched tolling spans EXCLUDED from the sum,
 *   scrubbable ExemptionPageMap strips (exemption × page-range
 *   distribution per document), a DispositionLedger whose footer is a
 *   copy-safe quotable fee estimate, and a 300px correspondence rail.
 *   One 'Request clarification' action tolls the clock, flips the queue
 *   chip, decrements the derived at-risk counter, and files the
 *   templated letter — four surfaces, one store.
 * @position Page template; emitted by \`astryx template public-records-console\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   HeaderBar 52px (mark + wordmark | risk counter + officer identity)
 *   | body row: QueueAside 340 (44px filter row + scroll list + 36px
 *   footer) | MainColumn flex 1 minWidth 0 (44px detail header + scroll:
 *   clock rail, exemption maps, disposition ledger) | Correspondence
 *   rail 300 (44px header + role="log" scroll + 36px templates footer).
 * Container policy: app-shell archetype — the three regions are styled
 *   panes on the shell surface; cards inside the main scroll only.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (DAYLIGHT_ORANGE, light-dark pair) used only as the DaylightMark sun
 *   fill and the header accent underline. Data-viz exemption colors use
 *   var(--color-data-categorical-*) with the repo-standard fallbacks;
 *   at-risk amber / overdue red / tolled slate are declared once below
 *   with contrast math. Tolled state is triple-encoded (hatch + pause
 *   glyph + label), never color-only.
 *
 * Responsive contract — KEYED OFF CONTAINER WIDTH, NOT VIEWPORT (the
 * demo stage measures ~1045–1075px inside a 1440px window, so viewport
 * queries lie; useElementWidth ResizeObserver on the view root, with a
 * viewport query only as the width-0 first-frame fallback):
 * - W >= 1160: all three columns (340 + fluid >= 496 + 300).
 * - 900 <= W < 1160 (THE DEFAULT STAGE BAND — must look complete here):
 *   the correspondence rail unmounts; the detail header gains a
 *   'Correspondence (n)' toggle that opens the rail as a right-pinned
 *   DS Dialog (300px; Dialog owns focus trap, Escape, focus restore).
 * - 720 <= W < 900: QueueAside narrows 340 → 280 (subject line drops,
 *   rows still 44px); the ledger hides its exemption mini-tally column.
 * - W < 720: QueueAside collapses to a 52px icon strip of status dots;
 *   selecting via the strip still drives the detail column.
 * Nothing ever horizontal-scrolls; MainColumn keeps minWidth 0
 * throughout. Subtraction, not reflow.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react';

import {
  ArrowDownLeftIcon,
  ArrowUpDownIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  MailIcon,
  PauseIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback.
// ---------------------------------------------------------------------------

// ONE quarantined brand literal: the Daylight sun orange. FILL ONLY — it
// colors the DaylightMark sun and the 2px header accent underline, never
// text (#D97917 on white is ~2.9:1; brand-tinted TEXT uses BRAND_TEXT).
const DAYLIGHT_ORANGE = 'light-dark(#D97917, #F0A150)';
// Brand-warm fills for elapsed clock cells, selection accents, and outbound
// correspondence rules — the data-viz orange token, not the brand literal.
const BRAND_WARM = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
// Text-weight brand warm: #9A540D on white ≈ 6.3:1; #F0B072 on the dark
// surface ≈ 8.5:1 — both pass 4.5:1.
const BRAND_TEXT = 'light-dark(#9A540D, #F0B072)';
const BRAND_SOFT = 'light-dark(rgba(217, 121, 23, 0.10), rgba(240, 161, 80, 0.16))';
// At-risk amber TEXT: #B54708 on white ≈ 5.9:1; #FFB566 on dark passes.
const AMBER_TEXT = 'light-dark(#B54708, #FFB566)';
const AMBER_DOT = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const AMBER_SOFT = 'light-dark(rgba(235, 110, 0, 0.10), rgba(255, 147, 48, 0.16))';
// Overdue red: #DC2626 on white ≈ 4.5:1; #F87171 on dark passes.
const RED = 'light-dark(#DC2626, #F87171)';
const RED_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
const GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const GREEN_SOFT = 'light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))';
// Tolled slate — also the b(7)(E) exemption swatch. #64748B on white ≈
// 4.8:1 as text; #94A3B8 on dark passes.
const SLATE = 'light-dark(#64748B, #94A3B8)';
const SLATE_SOFT = 'light-dark(rgba(100, 116, 139, 0.12), rgba(148, 163, 184, 0.18))';
// Exemption palette (spec-fixed): b(5) violet, b(6) blue, b(7)(C) teal,
// b(7)(E) slate; clean pages transparent over a 1px baseline rule.
const EX_B5 = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const EX_B6 = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const EX_B7C = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
const EX_B7E = SLATE;

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings and the appended-letter fade. Transitions animate
// opacity/color only and collapse under prefers-reduced-motion.
// ---------------------------------------------------------------------------

const CONSOLE_CSS = \`
.prc-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.prc-fade {
  animation: prc-fade-in 200ms ease;
}
@keyframes prc-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.prc-dim {
  transition: opacity 150ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .prc-fade { animation: none; }
  .prc-dim { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// DENSITY GRID — FIXED, repeated verbatim everywhere: header bar 52px; heavy
// rows 44px (queue request rows, ledger footer, detail header, rail header,
// queue filter row); list rows 36px (ledger rows, correspondence meta rows,
// queue/rail footers); left aside 340px fixed (280px in the 720–899 band,
// 52px strip below 720); right aside 300px fixed; GUTTER = 12px for ALL
// column gaps and card padding; detail-pane section spacing 2×GUTTER = 24px;
// chips/badges 24px tall; ExemptionPageMap strips 24px tall;
// StatutoryClockRail block 96px tall. No other magic spacing numbers.
// ---------------------------------------------------------------------------

const GUTTER = 12;
const HEADER_H = 52;
const HEAVY_ROW = 44;
const LIST_ROW = 36;
const QUEUE_W = 340;
const QUEUE_W_NARROW = 280;
const QUEUE_W_STRIP = 52;
const RAIL_W = 300;
const SECTION_GAP = 2 * GUTTER; // 24
const CHIP_H = 24;
const STRIP_H = 24;
const CLOCK_H = 96;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // Header bar 52px — corner map: top-left mark + wordmark + office caption;
  // top-right risk counter pill + officer identity. The 2px underline is the
  // second (and last) sanctioned use of the brand literal.
  header: {
    height: HEADER_H,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    padding: \`0 \${GUTTER}px\`,
    borderBottom: \`2px solid \${DAYLIGHT_ORANGE}\`,
    boxSizing: 'border-box',
  },
  brandCluster: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  wordmark: {fontSize: 15, fontWeight: 600, margin: 0, whiteSpace: 'nowrap'},
  headerSpacer: {flex: 1, minWidth: 0},
  riskPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: CHIP_H,
    padding: '0 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text)',
    font: 'inherit',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  riskDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  officerCluster: {display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap'},
  officerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 600,
    backgroundColor: BRAND_SOFT,
    color: BRAND_TEXT,
    flexShrink: 0,
  },
  // View root + body row ---------------------------------------------------
  viewRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  bodyRow: {flex: 1, display: 'flex', minHeight: 0, position: 'relative'},
  // Queue aside ------------------------------------------------------------
  queueAside: {
    width: QUEUE_W,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRight: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
  },
  queueFilterRow: {
    height: HEAVY_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    padding: \`0 \${GUTTER}px\`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  queueList: {flex: 1, minHeight: 0, overflowY: 'auto'},
  queueRow: {
    height: HEAVY_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    width: '100%',
    padding: \`0 \${GUTTER}px 0 \${GUTTER - 2}px\`,
    borderLeft: '2px solid transparent',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
    background: 'none',
    borderTop: 'none',
    borderRight: 'none',
    textAlign: 'start',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  queueRowSelected: {
    borderLeftColor: BRAND_WARM,
    backgroundColor: BRAND_SOFT,
  },
  queueRowMain: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1},
  queueRowLine1: {display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0},
  trackingId: {
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  requesterName: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  subjectLine: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // DueDateCell — fixed 76px right rail on every queue row.
  dueCell: {
    width: 76,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 0,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  dueDate: {fontSize: 12, fontWeight: 600},
  dueMeta: {fontSize: 11},
  queueFooter: {
    height: LIST_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    padding: \`0 \${GUTTER}px\`,
    borderTop: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
    flexShrink: 0,
    fontSize: 11,
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  // <720 icon strip: one 28px dot-button per request, stacked.
  queueStrip: {
    width: QUEUE_W_STRIP,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingTop: GUTTER,
    borderRight: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
    overflowY: 'auto',
    minHeight: 0,
  },
  stripButton: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'var(--border-width) solid var(--color-border)',
    background: 'var(--color-background-card)',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  },
  stripButtonSelected: {borderColor: BRAND_WARM, backgroundColor: BRAND_SOFT},
  stripDot: {width: 10, height: 10, borderRadius: 999},
  // Main column ------------------------------------------------------------
  mainColumn: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0},
  detailHeader: {
    height: HEAVY_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    padding: \`0 \${GUTTER}px\`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  detailTitleCluster: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    overflow: 'hidden',
  },
  detailSubject: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
    margin: 0,
  },
  mainScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: GUTTER,
    display: 'flex',
    flexDirection: 'column',
    gap: SECTION_GAP,
  },
  card: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: GUTTER,
    boxSizing: 'border-box',
  },
  // StatutoryClockRail — 96px block: 20px label row / 28px track / 20px
  // legend row (+ the card's 12px padding top and bottom = 96 total).
  clockCard: {
    height: CLOCK_H,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  clockLabelRow: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    minWidth: 0,
  },
  clockTrack: {height: 28, display: 'flex', gap: 2, alignItems: 'stretch'},
  clockCell: {
    flex: 1,
    minWidth: 10,
    borderRadius: 3,
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellElapsed: {backgroundColor: BRAND_WARM},
  cellRemaining: {border: \`1px solid var(--color-border)\`},
  cellTolled: {
    // Hatched 45° stripes, 4px pitch, muted amber — pattern + pause glyph +
    // legend label make the tolled state triple-encoded, never color-only.
    backgroundImage: \`repeating-linear-gradient(45deg, \${AMBER_SOFT} 0 4px, transparent 4px 8px)\`,
    border: \`1px solid \${SLATE}\`,
  },
  clockLegendRow: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    minWidth: 0,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
  },
  legendSwatch: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
    verticalAlign: -1,
  },
  dueChip: {
    height: CHIP_H,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 8px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  // ExemptionPageMap --------------------------------------------------------
  mapHeaderRow: {
    height: LIST_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    minWidth: 0,
  },
  mapDocTitle: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
    flex: 1,
    margin: 0,
  },
  mapStrip: {
    height: STRIP_H,
    position: 'relative',
    cursor: 'crosshair',
  },
  mapBaseline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: 'var(--color-border)',
  },
  mapRun: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  mapCursor: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 1,
    backgroundColor: 'var(--color-text)',
    pointerEvents: 'none',
  },
  mapReadout: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mapTallyRow: {
    height: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  tallyChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 16,
    padding: 0,
    border: 'none',
    background: 'none',
    font: 'inherit',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  // DispositionLedger -------------------------------------------------------
  ledgerHeaderRow: {
    height: LIST_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    minWidth: 0,
  },
  ledgerGridHeader: {
    height: LIST_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    fontSize: 11,
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
  },
  ledgerRow: {
    height: LIST_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
  },
  ledgerTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ledgerPages: {
    width: 56,
    flexShrink: 0,
    textAlign: 'end',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
  },
  ledgerChipCol: {width: 88, flexShrink: 0, display: 'flex'},
  ledgerTally: {
    width: 120,
    flexShrink: 0,
    fontSize: 11,
    fontFamily: MONO,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ledgerFee: {
    width: 88,
    flexShrink: 0,
    textAlign: 'end',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  dispositionChip: {
    height: CHIP_H,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  // Ledger footer — 44px heavy row, quotable and clickable (copies the
  // fee.quotable string verbatim for the response letter).
  ledgerFooter: {
    minHeight: HEAVY_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    borderTop: '1px solid var(--color-border)',
    marginTop: -1,
    paddingTop: GUTTER,
    width: '100%',
    background: 'none',
    border: 'none',
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: 'var(--color-border)',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'copy',
    boxSizing: 'border-box',
  },
  feeBreakdown: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    lineHeight: '18px',
  },
  feeTotal: {
    fontSize: 14,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  ledgerEmpty: {
    height: 120,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    padding: \`0 \${SECTION_GAP}px\`,
  },
  filterBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: CHIP_H,
    padding: '0 8px',
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    font: 'inherit',
    fontSize: 11,
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  // Correspondence rail ------------------------------------------------------
  rail: {
    width: RAIL_W,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderLeft: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
  },
  railHeader: {
    height: HEAVY_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: \`0 \${GUTTER}px\`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  railScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: GUTTER,
    display: 'flex',
    flexDirection: 'column',
    gap: GUTTER,
  },
  letterCard: {
    padding: SECTION_GAP,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    borderLeftWidth: 2,
    backgroundColor: 'var(--color-background-card)',
    boxSizing: 'border-box',
  },
  letterMetaRow: {
    height: LIST_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: -8,
    minWidth: 0,
  },
  letterTypeChip: {
    height: CHIP_H,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 8px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    backgroundColor: 'var(--color-background-muted)',
    whiteSpace: 'nowrap',
  },
  letterDate: {
    marginLeft: 'auto',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  letterExcerpt: {
    fontSize: 12,
    lineHeight: '17px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  railFooter: {
    height: LIST_ROW,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: \`0 \${GUTTER}px\`,
    borderTop: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
    flexShrink: 0,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  railTemplateLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    font: 'inherit',
    fontSize: 11,
    color: 'var(--color-accent)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  sortButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: CHIP_H,
    padding: '0 8px',
    marginLeft: 'auto',
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'var(--color-background-card)',
    font: 'inherit',
    fontSize: 11,
    color: 'var(--color-text)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ---------------------------------------------------------------------------
// DATA — one fictional world: Daylight, the records-office console for the
// City of Alder Bay. Suite "now" anchor: TODAY = Fri, Jul 4 (ordinal
// 20260704) — every relative time and every business-day figure below is a
// PRE-COMPUTED dual field (display + ordinal + businessDaysRemaining), never
// clock math. Signed-in user: Kelechi Onwudiwe, FOIA Officer (roster entry).
// ---------------------------------------------------------------------------

const TODAY_DISPLAY = 'Fri, Jul 4';
const TODAY_ORDINAL = 20260704;

const OFFICER = {
  id: 'onwudiwe',
  name: 'Kelechi Onwudiwe',
  short: 'K. Onwudiwe',
  initials: 'KO',
  role: 'FOIA Officer',
};

type SegmentKind = 'elapsed' | 'tolled' | 'remaining';

interface ClockSegment {
  kind: SegmentKind;
  days: number;
  label?: string;
  citation?: string;
}

type FoiaStatus = 'active' | 'tolled' | 'overdue';

type Disposition = 'Release' | 'Partial' | 'Withhold';

interface ExemptionRun {
  exemption: string;
  startPage: number;
  endPage: number;
}

interface LedgerDoc {
  id: string;
  title: string;
  pages: number;
  disposition: Disposition;
  runs: ExemptionRun[];
  /** '$53.50' | 'waived' | '—' — string branch, never a fake $0.00. */
  feeDisplay: string;
  feeCents: number;
  billablePages: number;
}

interface FeeBlock {
  searchHours: number;
  searchRateCents: number;
  reviewHours: number;
  reviewRateCents: number;
  pages: number; // billable duplication pages
  perPageCents: number;
  totalCents: number;
  totalDisplay: string;
  /** Copy-safe, legally-quotable line rendered verbatim in the footer. */
  quotable: string;
}

interface ClarificationOutcome {
  tolledSegment: ClockSegment;
  newDueDateDisplay: string;
  newDueDateOrdinal: number;
}

interface FoiaRequest {
  id: string;
  trackingId: string;
  requester: string;
  subject: string;
  receivedDisplay: string;
  receivedOrdinal: number;
  statutoryDays: number;
  segments: ClockSegment[];
  dueDateDisplay: string;
  dueDateOrdinal: number;
  /** null while tolled (the clock is stopped); negative when overdue. */
  businessDaysRemaining: number | null;
  status: FoiaStatus;
  feeEstimateDisplay?: string;
  fee?: FeeBlock;
  documents: LedgerDoc[];
  ledgerEmptyNote?: string;
  clarificationRequested?: boolean;
  clarificationOutcome?: ClarificationOutcome;
}

type LetterType =
  | 'Request'
  | 'Acknowledgment'
  | 'Clarification'
  | 'Fee estimate'
  | 'Final response';

interface Letter {
  id: string;
  direction: 'in' | 'out';
  type: LetterType;
  dateDisplay: string;
  dateOrdinal: number;
  excerpt: string;
}

// Exemption vocabulary — swatch + plain-language gloss for the scrub readout.
const EXEMPTIONS: Record<string, {color: string; gloss: string}> = {
  'b(5)': {color: EX_B5, gloss: 'deliberative process'},
  'b(6)': {color: EX_B6, gloss: 'personal privacy'},
  'b(7)(C)': {color: EX_B7C, gloss: 'law-enforcement privacy'},
  'b(7)(E)': {color: EX_B7E, gloss: 'law-enforcement techniques'},
};

// --- REQ_CALLOWHILL — the selected default and the signature-action target.
// Clock law (asserted below): sum(elapsed)+sum(remaining) === 20; tolled
// days are EXCLUDED from the sum. 18 elapsed + 2 remaining; due Tue Jul 8
// = 2 business days out from Fri Jul 4 (Jul 7, Jul 8) → at-risk (≤ 3 bd).
// Fee arithmetic cross-checks BY CONSTRUCTION:
//   search 3.5 h × $44.00 = $154.00 (15400¢)
//   review 2.0 h × $60.00 = $120.00 (12000¢)
//   duplication 262 pp × $0.25 = $65.50 (6550¢ = 1200¢ + 5350¢ line fees)
//   total 33950¢ = '$339.50' = feeEstimateDisplay (cross-checked constant).
// Billable pages: 48 + 214 + 37 + 11 = 310 total, minus 11 withheld
// (DOC_LIT_MEMO) and 37 fee-waived (DOC_EMAILS) → 262 explicit
// billablePages (48 + 214).
const DOC_INSPECTIONS: LedgerDoc = {
  id: 'doc-inspections',
  title: 'Housing inspection reports — 900 blk Spring Garden St',
  pages: 48,
  disposition: 'Partial',
  runs: [{exemption: 'b(6)', startPage: 3, endPage: 9}], // 7 pp
  feeDisplay: '$12.00', // 48 pp × $0.25
  feeCents: 1200,
  billablePages: 48,
};

// The scrub stress doc: 214 pp, 4 runs including the 8-pp b(7)(E) sliver at
// 190–197 (~3.7% width — exercises minWidth 3px + 1px gap handling).
const DOC_COMPLAINT_LOG: LedgerDoc = {
  id: 'doc-complaint-log',
  title: 'Code-complaint intake log, 2019–2026',
  pages: 214,
  disposition: 'Partial',
  runs: [
    {exemption: 'b(6)', startPage: 12, endPage: 40}, // 29 pp
    {exemption: 'b(7)(C)', startPage: 41, endPage: 58}, // 18 pp
    {exemption: 'b(5)', startPage: 120, endPage: 131}, // 12 pp
    {exemption: 'b(7)(E)', startPage: 190, endPage: 197}, // 8 pp sliver
  ],
  feeDisplay: '$53.50', // 214 pp × $0.25
  feeCents: 5350,
  billablePages: 214,
};

// Fee-waived stress row: the fee cell renders the string 'waived', not $0.00.
const DOC_EMAILS: LedgerDoc = {
  id: 'doc-emails',
  title: 'Inspector email thread — case 24-CE-118',
  pages: 37,
  disposition: 'Release',
  runs: [],
  feeDisplay: 'waived',
  feeCents: 0,
  billablePages: 0,
};

const DOC_LIT_MEMO: LedgerDoc = {
  id: 'doc-lit-memo',
  title: 'Litigation strategy memo — Callowhill v. City of Alder Bay',
  pages: 11,
  disposition: 'Withhold',
  runs: [{exemption: 'b(5)', startPage: 1, endPage: 11}],
  feeDisplay: '—', // withheld in full — nothing duplicated
  feeCents: 0,
  billablePages: 0,
};

const CALLOWHILL_FEE: FeeBlock = {
  searchHours: 3.5,
  searchRateCents: 4400,
  reviewHours: 2.0,
  reviewRateCents: 6000,
  pages: 262,
  perPageCents: 25,
  totalCents: 33950,
  totalDisplay: '$339.50',
  quotable:
    'Fee estimate — DL-2026-0158: Search 3.5 h × $44.00 = $154.00; ' +
    'Review 2.0 h × $60.00 = $120.00; Duplication 262 pp × $0.25 = $65.50. ' +
    'Estimate total $339.50.',
};

const REQ_CALLOWHILL: FoiaRequest = {
  id: 'callowhill',
  trackingId: 'DL-2026-0158',
  requester: 'Callowhill Tenants Union',
  subject: 'Inspection reports & complaint history, 900 block Spring Garden St',
  receivedDisplay: 'Jun 5',
  receivedOrdinal: 20260605,
  statutoryDays: 20,
  segments: [
    {kind: 'elapsed', days: 18},
    {kind: 'remaining', days: 2},
  ],
  dueDateDisplay: 'Jul 8',
  dueDateOrdinal: 20260708,
  businessDaysRemaining: 2,
  status: 'active',
  feeEstimateDisplay: '$339.50',
  fee: CALLOWHILL_FEE,
  documents: [DOC_INSPECTIONS, DOC_COMPLAINT_LOG, DOC_EMAILS, DOC_LIT_MEMO],
  // Pre-computed tolling outcome — the signature action does ZERO date math:
  // due Jul 8 + 10 tolled business days = Jul 22 (weekends Jul 11/12,
  // 18/19 skipped on the fixture calendar anchored to Fri Jul 4).
  clarificationOutcome: {
    tolledSegment: {
      kind: 'tolled',
      days: 10,
      label: 'clarification pending',
      citation: '§552(a)(6)(A)(ii)(I)',
    },
    newDueDateDisplay: 'Jul 22',
    newDueDateOrdinal: 20260722,
  },
};

// --- REQ_HARBORLEDGER — journalist, at-risk (3 bd), and the truncation
// stress fixture: the subject is exactly 96 characters to exercise QueueRow
// and detail-header ellipsis with a title attribute.
const REQ_HARBORLEDGER: FoiaRequest = {
  id: 'harborledger',
  trackingId: 'DL-2026-0163',
  requester: 'Dana Okafor · Harbor Ledger Gazette',
  subject:
    'Police overtime ledgers FY2025 incl. all supplemental authorization memoranda and reconciliation',
  receivedDisplay: 'Jun 9',
  receivedOrdinal: 20260609,
  statutoryDays: 20,
  segments: [
    {kind: 'elapsed', days: 17},
    {kind: 'remaining', days: 3},
  ],
  dueDateDisplay: 'Jul 9',
  dueDateOrdinal: 20260709,
  businessDaysRemaining: 3,
  status: 'active',
  feeEstimateDisplay: '$226.00',
  // search 2.0 h × $44 = $88.00; review 1.5 h × $60 = $90.00;
  // duplication 192 pp × $0.25 = $48.00 (3200¢ + 1600¢); total 22600¢.
  fee: {
    searchHours: 2.0,
    searchRateCents: 4400,
    reviewHours: 1.5,
    reviewRateCents: 6000,
    pages: 192,
    perPageCents: 25,
    totalCents: 22600,
    totalDisplay: '$226.00',
    quotable:
      'Fee estimate — DL-2026-0163: Search 2.0 h × $44.00 = $88.00; ' +
      'Review 1.5 h × $60.00 = $90.00; Duplication 192 pp × $0.25 = $48.00. ' +
      'Estimate total $226.00.',
  },
  documents: [
    {
      id: 'doc-ot-ledger',
      title: 'Overtime ledger FY2025 — patrol division',
      pages: 128,
      disposition: 'Partial',
      runs: [{exemption: 'b(6)', startPage: 2, endPage: 24}], // 23 pp
      feeDisplay: '$32.00',
      feeCents: 3200,
      billablePages: 128,
    },
    {
      id: 'doc-ot-recon',
      title: 'Reconciliation spreadsheets, Q1–Q4',
      pages: 64,
      disposition: 'Release',
      runs: [],
      feeDisplay: '$16.00',
      feeCents: 1600,
      billablePages: 64,
    },
  ],
};

// --- REQ_MERIDIAN — ALREADY tolled 4 days (fee estimate outstanding):
// proves the hatched span renders from fixtures, not only via the action.
// 9 elapsed + 11 remaining = 20; the 4 tolled days sit inline, excluded.
const REQ_MERIDIAN: FoiaRequest = {
  id: 'meridian',
  trackingId: 'DL-2026-0149',
  requester: 'Meridian & Vance LLP',
  subject: 'Contract award file, RFP 26-081 — fleet telematics',
  receivedDisplay: 'May 28',
  receivedOrdinal: 20260528,
  statutoryDays: 20,
  segments: [
    {kind: 'elapsed', days: 9},
    {
      kind: 'tolled',
      days: 4,
      label: 'fee estimate pending',
      citation: '§552(a)(6)(A)(ii)(II)',
    },
    {kind: 'remaining', days: 11},
  ],
  dueDateDisplay: 'Jul 25',
  dueDateOrdinal: 20260725,
  businessDaysRemaining: null, // clock stopped
  status: 'tolled',
  feeEstimateDisplay: '$441.50',
  // search 4.0 h × $44 = $176.00; review 3.0 h × $60 = $180.00;
  // duplication 342 pp × $0.25 = $85.50; total 44150¢.
  fee: {
    searchHours: 4.0,
    searchRateCents: 4400,
    reviewHours: 3.0,
    reviewRateCents: 6000,
    pages: 342,
    perPageCents: 25,
    totalCents: 44150,
    totalDisplay: '$441.50',
    quotable:
      'Fee estimate — DL-2026-0149: Search 4.0 h × $44.00 = $176.00; ' +
      'Review 3.0 h × $60.00 = $180.00; Duplication 342 pp × $0.25 = $85.50. ' +
      'Estimate total $441.50.',
  },
  documents: [
    {
      id: 'doc-rfp-file',
      title: 'RFP 26-081 award file & evaluation scores',
      pages: 342,
      disposition: 'Partial',
      runs: [
        {exemption: 'b(5)', startPage: 41, endPage: 72}, // 32 pp
        {exemption: 'b(6)', startPage: 118, endPage: 129}, // 12 pp
      ],
      feeDisplay: '$85.50',
      feeCents: 8550,
      billablePages: 342,
    },
  ],
};

// --- REQ_SUNLIGHT — OVERDUE: -3 business days (due Tue Jul 1), the red
// DueDateCell path. All 20 statutory days elapsed; nothing remaining.
const REQ_SUNLIGHT: FoiaRequest = {
  id: 'sunlight',
  trackingId: 'DL-2026-0141',
  requester: 'Sunlight Collective',
  subject: 'All body-camera retention policies & audit logs',
  receivedDisplay: 'May 20',
  receivedOrdinal: 20260520,
  statutoryDays: 20,
  segments: [{kind: 'elapsed', days: 20}],
  dueDateDisplay: 'Jul 1',
  dueDateOrdinal: 20260701,
  businessDaysRemaining: -3,
  status: 'overdue',
  documents: [],
  ledgerEmptyNote:
    'No documents scoped yet — request in review backlog; escalated to the Records Supervisor on Jul 2.',
};

// --- Routine requests -------------------------------------------------------
const REQ_PARKSIDE: FoiaRequest = {
  id: 'parkside',
  trackingId: 'DL-2026-0170',
  requester: 'Parkside Neighbors Assn.',
  subject: 'Tree-removal permits, Wissahickon Ave corridor',
  receivedDisplay: 'Jun 27',
  receivedOrdinal: 20260627,
  statutoryDays: 20,
  segments: [
    {kind: 'elapsed', days: 4},
    {kind: 'remaining', days: 16},
  ],
  dueDateDisplay: 'Jul 28',
  dueDateOrdinal: 20260728,
  businessDaysRemaining: 16,
  status: 'active',
  feeEstimateDisplay: '$57.50',
  // search 0.5 h × $44 = $22.00; review 0.5 h × $60 = $30.00;
  // duplication 22 pp × $0.25 = $5.50; total 5750¢.
  fee: {
    searchHours: 0.5,
    searchRateCents: 4400,
    reviewHours: 0.5,
    reviewRateCents: 6000,
    pages: 22,
    perPageCents: 25,
    totalCents: 5750,
    totalDisplay: '$57.50',
    quotable:
      'Fee estimate — DL-2026-0170: Search 0.5 h × $44.00 = $22.00; ' +
      'Review 0.5 h × $60.00 = $30.00; Duplication 22 pp × $0.25 = $5.50. ' +
      'Estimate total $57.50.',
  },
  documents: [
    {
      id: 'doc-permits',
      title: 'Permit register extract, 2024–2026',
      pages: 22,
      disposition: 'Release',
      runs: [],
      feeDisplay: '$5.50',
      feeCents: 550,
      billablePages: 22,
    },
  ],
};

const REQ_WATERMAIN: FoiaRequest = {
  id: 'watermain',
  trackingId: 'DL-2026-0166',
  requester: 'M. Grasso',
  subject: 'Water-main break history, Fishtown 19125',
  receivedDisplay: 'Jun 17',
  receivedOrdinal: 20260617,
  statutoryDays: 20,
  segments: [
    {kind: 'elapsed', days: 7},
    {kind: 'remaining', days: 13},
  ],
  dueDateDisplay: 'Jul 23',
  dueDateOrdinal: 20260723,
  businessDaysRemaining: 13,
  status: 'active',
  feeEstimateDisplay: '$84.25',
  // search 1.0 h × $44 = $44.00; review 0.5 h × $60 = $30.00;
  // duplication 41 pp × $0.25 = $10.25; total 8425¢.
  fee: {
    searchHours: 1.0,
    searchRateCents: 4400,
    reviewHours: 0.5,
    reviewRateCents: 6000,
    pages: 41,
    perPageCents: 25,
    totalCents: 8425,
    totalDisplay: '$84.25',
    quotable:
      'Fee estimate — DL-2026-0166: Search 1.0 h × $44.00 = $44.00; ' +
      'Review 0.5 h × $60.00 = $30.00; Duplication 41 pp × $0.25 = $10.25. ' +
      'Estimate total $84.25.',
  },
  documents: [
    {
      id: 'doc-breaks',
      title: 'Break & repair log, ZIP 19125 (2015–2026)',
      pages: 41,
      disposition: 'Release',
      runs: [],
      feeDisplay: '$10.25',
      feeCents: 1025,
      billablePages: 41,
    },
  ],
};

// --- REQ_ACADEMY — the empty-state fixture: zero documents, so the
// DispositionLedger renders its 120px empty block and the fee footer is
// SUPPRESSED (fee omitted-when-undefined, never '$0.00').
const REQ_ACADEMY: FoiaRequest = {
  id: 'academy',
  trackingId: 'DL-2026-0172',
  requester: 'Alder Bay Academy · J. Whitfield',
  subject: 'School crossing-guard staffing assignments',
  receivedDisplay: 'Jul 1',
  receivedOrdinal: 20260701,
  statutoryDays: 20,
  segments: [
    {kind: 'elapsed', days: 2},
    {kind: 'remaining', days: 18},
  ],
  dueDateDisplay: 'Jul 30',
  dueDateOrdinal: 20260730,
  businessDaysRemaining: 18,
  status: 'active',
  documents: [],
  ledgerEmptyNote:
    'No documents scoped yet — search pending assignment to Records Unit 2.',
};

const REQUEST_LIST: FoiaRequest[] = [
  REQ_CALLOWHILL,
  REQ_HARBORLEDGER,
  REQ_MERIDIAN,
  REQ_SUNLIGHT,
  REQ_PARKSIDE,
  REQ_WATERMAIN,
  REQ_ACADEMY,
];

// --- Correspondence — ticket-shaped letters keyed by request id. Newest
// renders first. The 5-line Callowhill acknowledgment proves the 3-line
// excerpt clamp.
const CORRESPONDENCE: Record<string, Letter[]> = {
  callowhill: [
    {
      id: 'cw-4',
      direction: 'in',
      type: 'Fee estimate',
      dateDisplay: 'Jul 1',
      dateOrdinal: 20260701,
      excerpt:
        'We accept the fee estimate of $339.50 for DL-2026-0158. Please proceed with duplication; an association check will follow by mail this week.',
    },
    {
      id: 'cw-3',
      direction: 'out',
      type: 'Fee estimate',
      dateDisplay: 'Jun 26',
      dateOrdinal: 20260626,
      excerpt:
        'Estimated fees for DL-2026-0158: Search 3.5 h × $44.00 = $154.00; Review 2.0 h × $60.00 = $120.00; Duplication 262 pp × $0.25 = $65.50. Estimate total $339.50. Duplication begins on written acceptance.',
    },
    {
      id: 'cw-2',
      direction: 'out',
      type: 'Acknowledgment',
      dateDisplay: 'Jun 6',
      dateOrdinal: 20260606,
      excerpt:
        'We received your request on Jun 5 and assigned tracking number DL-2026-0158. Your request has been routed to Records Unit 2 for search and review. Under the Alder Bay Open Records Ordinance the City has 20 business days to respond. If fees are expected to exceed $25.00 you will receive a written estimate before duplication begins. You may contact this office citing your tracking number.',
    },
    {
      id: 'cw-1',
      direction: 'in',
      type: 'Request',
      dateDisplay: 'Jun 5',
      dateOrdinal: 20260605,
      excerpt:
        'On behalf of the Callowhill Tenants Union we request all inspection reports and the complete complaint history for the 900 block of Spring Garden St, 2019 to present, in electronic form where available.',
    },
  ],
  harborledger: [
    {
      id: 'hl-2',
      direction: 'out',
      type: 'Acknowledgment',
      dateDisplay: 'Jun 10',
      dateOrdinal: 20260610,
      excerpt:
        'We received your request on Jun 9 and assigned tracking number DL-2026-0163. A fee estimate will issue before duplication.',
    },
    {
      id: 'hl-1',
      direction: 'in',
      type: 'Request',
      dateDisplay: 'Jun 9',
      dateOrdinal: 20260609,
      excerpt:
        'For a Harbor Ledger Gazette series on overtime spending, we request the FY2025 police overtime ledgers with all supplemental authorization memoranda and reconciliation spreadsheets.',
    },
  ],
  meridian: [
    {
      id: 'md-2',
      direction: 'out',
      type: 'Fee estimate',
      dateDisplay: 'Jun 30',
      dateOrdinal: 20260630,
      excerpt:
        'Estimated fees for DL-2026-0149 total $441.50. Under §552(a)(6)(A)(ii)(II) the response clock is tolled pending your written acceptance of this estimate.',
    },
    {
      id: 'md-1',
      direction: 'in',
      type: 'Request',
      dateDisplay: 'May 28',
      dateOrdinal: 20260528,
      excerpt:
        'Meridian & Vance LLP requests the complete contract award file for RFP 26-081 (fleet telematics), including evaluation scores and the bid tabulation.',
    },
  ],
  sunlight: [
    {
      id: 'sl-2',
      direction: 'out',
      type: 'Acknowledgment',
      dateDisplay: 'May 21',
      dateOrdinal: 20260521,
      excerpt:
        'We received your request on May 20 and assigned tracking number DL-2026-0141.',
    },
    {
      id: 'sl-1',
      direction: 'in',
      type: 'Request',
      dateDisplay: 'May 20',
      dateOrdinal: 20260520,
      excerpt:
        'The Sunlight Collective requests all body-worn-camera retention policies in force since 2020, together with the audit logs of retention-schedule changes.',
    },
  ],
  parkside: [
    {
      id: 'pk-1',
      direction: 'in',
      type: 'Request',
      dateDisplay: 'Jun 27',
      dateOrdinal: 20260627,
      excerpt:
        'Parkside Neighbors Assn. requests all tree-removal permits issued for the Wissahickon Ave corridor since Jan 2024.',
    },
  ],
  watermain: [
    {
      id: 'wm-2',
      direction: 'out',
      type: 'Acknowledgment',
      dateDisplay: 'Jun 18',
      dateOrdinal: 20260618,
      excerpt:
        'We received your request on Jun 17 and assigned tracking number DL-2026-0166.',
    },
    {
      id: 'wm-1',
      direction: 'in',
      type: 'Request',
      dateDisplay: 'Jun 17',
      dateOrdinal: 20260617,
      excerpt:
        'Requesting the history of water-main breaks and repairs in ZIP 19125 for the past ten years, including dates and street locations.',
    },
  ],
  academy: [
    {
      id: 'ac-2',
      direction: 'out',
      type: 'Acknowledgment',
      dateDisplay: 'Jul 2',
      dateOrdinal: 20260702,
      excerpt:
        'We received your request on Jul 1 and assigned tracking number DL-2026-0172.',
    },
    {
      id: 'ac-1',
      direction: 'in',
      type: 'Request',
      dateDisplay: 'Jul 1',
      dateOrdinal: 20260701,
      excerpt:
        'Alder Bay Academy requests the current crossing-guard staffing assignments for school zones within a half mile of the Jefferson St campus.',
    },
  ],
};

// Templated clarification letter — requester name interpolated at
// FIXTURE-BUILD time, not runtime (the signature action does no string math
// beyond appending this constant).
const CLARIFICATION_LETTER: Letter = {
  id: 'cw-clarify',
  direction: 'out',
  type: 'Clarification',
  dateDisplay: 'Jul 4',
  dateOrdinal: TODAY_ORDINAL,
  excerpt:
    \`To process DL-2026-0158 for the \${REQ_CALLOWHILL.requester}, please \` +
    'confirm whether "complaint history" includes tenant-initiated 311 ' +
    'service requests in addition to code-enforcement complaints. The ' +
    '20-business-day clock is tolled under §552(a)(6)(A)(ii)(I) until we ' +
    \`receive your response. — \${OFFICER.short}, \${OFFICER.role}\`,
};

// ---------------------------------------------------------------------------
// FIXTURE INVARIANTS — asserted once at module load (deterministic data, so
// this can never fire in production; it guards future fixture edits).
//   1. sum(elapsed) + sum(remaining) === statutoryDays (tolled EXCLUDED).
//   2. fee lines reconcile: search + review + pages×rate === totalCents,
//      duplication === Σ(row feeCents), pages === Σ(row billablePages),
//      totalDisplay === feeEstimateDisplay.
// ---------------------------------------------------------------------------

for (const req of REQUEST_LIST) {
  const elapsed = req.segments
    .filter(s => s.kind === 'elapsed')
    .reduce((n, s) => n + s.days, 0);
  const remaining = req.segments
    .filter(s => s.kind === 'remaining')
    .reduce((n, s) => n + s.days, 0);
  if (elapsed + remaining !== req.statutoryDays) {
    console.error(
      \`[public-records-console] clock invariant broken for \${req.trackingId}\`,
    );
  }
  if (req.fee != null) {
    const dupCents = req.documents.reduce((n, d) => n + d.feeCents, 0);
    const billable = req.documents.reduce((n, d) => n + d.billablePages, 0);
    const computed =
      Math.round(req.fee.searchHours * req.fee.searchRateCents) +
      Math.round(req.fee.reviewHours * req.fee.reviewRateCents) +
      req.fee.pages * req.fee.perPageCents;
    if (
      computed !== req.fee.totalCents ||
      dupCents !== req.fee.pages * req.fee.perPageCents ||
      billable !== req.fee.pages ||
      req.fee.totalDisplay !== req.feeEstimateDisplay
    ) {
      console.error(
        \`[public-records-console] fee invariant broken for \${req.trackingId}\`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// SMALL PRIMITIVES
// ---------------------------------------------------------------------------

/**
 * DaylightMark — 24×24 inline SVG: half-sun arc filled with the quarantined
 * DAYLIGHT_ORANGE, three 2px rays at 60°/90°/120°, and two document rules
 * (x 4→20 at y 17; x 4→14 at y 21) that inherit currentColor.
 */
function DaylightMark() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable="false"
      style={{flexShrink: 0}}>
      <path
        d="M5 13 A7 7 0 0 1 19 13 Z"
        fill={DAYLIGHT_ORANGE}
        stroke={DAYLIGHT_ORANGE}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Rays at 60° / 90° / 120° from the arc apex, ~3px long */}
      <path
        d="M12 5 V2 M6.5 7.5 L4.4 5.4 M17.5 7.5 L19.6 5.4"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M4 17 H20 M4 21 H14"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Container-width hook — the demo stage renders this template in a
 * ~1045–1075px container inside a 1440px window, so viewport media queries
 * lie. ResizeObserver on the view root; width 0 means the pre-observer first
 * frame (callers fall back to a viewport query for that frame only).
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

// Derived helpers ------------------------------------------------------------

function segDays(segments: ClockSegment[], kind: SegmentKind): number {
  return segments.filter(s => s.kind === kind).reduce((n, s) => n + s.days, 0);
}

/** Per-document exemption tallies derived live from the runs. */
function tallyRuns(runs: ExemptionRun[]): Array<{code: string; pages: number}> {
  const byCode = new Map<string, number>();
  for (const run of runs) {
    const pages = run.endPage - run.startPage + 1;
    byCode.set(run.exemption, (byCode.get(run.exemption) ?? 0) + pages);
  }
  return [...byCode.entries()].map(([code, pages]) => ({code, pages}));
}

// ---------------------------------------------------------------------------
// StatutoryClockRail — TIER: fully custom. A ProgressBar cannot encode
// pause/resume spans whose SUM (not span) is the legal clock: one flex cell
// per business day; tolled cells sit inline in chronological order but are
// EXCLUDED from the 20-day sum (hatch + pause glyph + legend, never
// color-only). 96px block: 20px label row / 28px track / 20px legend.
// ---------------------------------------------------------------------------

interface StatutoryClockRailProps {
  statutoryDays: number;
  segments: ClockSegment[];
  dueDateDisplay: string;
  status: FoiaStatus;
  businessDaysRemaining: number | null;
}

function StatutoryClockRail({
  statutoryDays,
  segments,
  dueDateDisplay,
  status,
  businessDaysRemaining,
}: StatutoryClockRailProps) {
  const elapsed = segDays(segments, 'elapsed');
  const tolledDays = segDays(segments, 'tolled');
  const tolledSeg = segments.find(s => s.kind === 'tolled');

  // Expand segments into per-day cells (chronological order preserved).
  const cells: Array<{kind: SegmentKind; isFirstTolled: boolean}> = [];
  let sawTolled = false;
  for (const seg of segments) {
    for (let i = 0; i < seg.days; i++) {
      const isFirstTolled = seg.kind === 'tolled' && !sawTolled;
      if (isFirstTolled) {
        sawTolled = true;
      }
      cells.push({kind: seg.kind, isFirstTolled});
    }
  }

  const ariaLabel =
    \`Day \${elapsed} of \${statutoryDays} business days\` +
    (tolledSeg != null
      ? \`; \${tolledDays} days tolled for \${tolledSeg.label ?? 'tolling'}\`
      : '') +
    \`; due \${dueDateDisplay}\` +
    (status === 'overdue' ? \` — overdue by \${Math.abs(businessDaysRemaining ?? 0)} business days\` : '');

  const dueChipStyle: CSSProperties =
    status === 'tolled'
      ? {backgroundColor: SLATE_SOFT, color: SLATE, border: \`1px solid \${SLATE}\`}
      : status === 'overdue'
        ? {backgroundColor: RED_SOFT, color: RED, border: \`1px solid \${RED}\`}
        : businessDaysRemaining != null && businessDaysRemaining <= 3
          ? {backgroundColor: AMBER_SOFT, color: AMBER_TEXT, border: '1px solid var(--color-border)'}
          : {backgroundColor: 'var(--color-background-muted)', border: '1px solid var(--color-border)'};

  return (
    <div style={{...styles.card, ...styles.clockCard}} role="img" aria-label={ariaLabel}>
      <div style={styles.clockLabelRow} aria-hidden>
        <Heading level={3} style={{fontSize: 13, margin: 0, whiteSpace: 'nowrap'}}>
          Statutory clock — {statutoryDays} business days · §552(a)(6)(A)(i)
        </Heading>
        <span style={styles.headerSpacer} />
        <span style={{...styles.dueChip, ...dueChipStyle}}>
          {status === 'tolled' ? <Icon icon={PauseIcon} size="xsm" color="inherit" /> : null}
          Due {dueDateDisplay}
          {status === 'tolled' ? ' · TOLLED' : status === 'overdue' ? ' · OVERDUE' : ''}
        </span>
      </div>
      <div style={styles.clockTrack} aria-hidden>
        {cells.map((cell, i) => (
          <span
            key={i}
            style={{
              ...styles.clockCell,
              ...(cell.kind === 'elapsed'
                ? styles.cellElapsed
                : cell.kind === 'tolled'
                  ? styles.cellTolled
                  : styles.cellRemaining),
            }}>
            {cell.isFirstTolled ? (
              <Icon icon={PauseIcon} size="xsm" color="secondary" />
            ) : null}
          </span>
        ))}
      </div>
      <div style={styles.clockLegendRow} aria-hidden>
        <span style={{whiteSpace: 'nowrap'}}>
          <span style={{...styles.legendSwatch, backgroundColor: BRAND_WARM}} />
          elapsed
        </span>
        <span style={{whiteSpace: 'nowrap'}}>
          <span
            style={{
              ...styles.legendSwatch,
              backgroundImage: \`repeating-linear-gradient(45deg, \${AMBER_SOFT} 0 3px, transparent 3px 6px)\`,
              border: \`1px solid \${SLATE}\`,
              boxSizing: 'border-box',
            }}
          />
          tolled (clock stopped)
        </span>
        <span style={{whiteSpace: 'nowrap'}}>
          <span
            style={{
              ...styles.legendSwatch,
              border: '1px solid var(--color-border)',
              boxSizing: 'border-box',
            }}
          />
          remaining
        </span>
        <span style={styles.headerSpacer} />
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontVariantNumeric: 'tabular-nums',
          }}>
          {tolledSeg != null
            ? \`\${tolledDays} days tolled — \${tolledSeg.label}, \${tolledSeg.citation}\`
            : \`\${segDays(segments, 'remaining')} business days remaining\`}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExemptionPageMap — TIER: fully custom. Badges count exemptions but cannot
// encode exemption × page-range DISTRIBUTION. 24px strip, runs at
// (pages/totalPages)% width with a 3px floor (the 8-pp b(7)(E) sliver on
// DOC_COMPLAINT_LOG renders ~3.7%); scrub lifts the page to the owner; tally
// chips are real buttons that set the ledger's exemption filter. Stateless.
// ---------------------------------------------------------------------------

interface ExemptionPageMapProps {
  doc: LedgerDoc;
  scrubPage: number | null;
  onScrub: (docId: string, page: number | null) => void;
  onExemptionFilter: (code: string) => void;
}

function ExemptionPageMap({doc, scrubPage, onScrub, onExemptionFilter}: ExemptionPageMapProps) {
  const tallies = tallyRuns(doc.runs);
  const mapLabel =
    tallies.length > 0
      ? \`\${doc.title}: \${tallies.map(t => \`\${t.code} on \${t.pages} of \${doc.pages} pages\`).join(', ')}\`
      : \`\${doc.title}: no exemptions claimed on \${doc.pages} pages\`;

  const handleMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) {
      return;
    }
    const frac = (event.clientX - rect.left) / rect.width;
    const page = Math.min(doc.pages, Math.max(1, Math.ceil(frac * doc.pages)));
    onScrub(doc.id, page);
  };

  const scrubRun =
    scrubPage != null
      ? doc.runs.find(r => scrubPage >= r.startPage && scrubPage <= r.endPage)
      : undefined;

  return (
    <div style={styles.card}>
      <div style={styles.mapHeaderRow} title={doc.title}>
        <Heading level={4} style={styles.mapDocTitle}>
          {doc.title}
        </Heading>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {doc.pages} pp
        </Text>
      </div>
      <div
        style={styles.mapStrip}
        role="img"
        aria-label={mapLabel}
        onMouseMove={handleMove}
        onMouseLeave={() => onScrub(doc.id, null)}>
        <span style={styles.mapBaseline} aria-hidden />
        {doc.runs.map(run => {
          const pages = run.endPage - run.startPage + 1;
          const widthPct = (pages / doc.pages) * 100;
          return (
            <span
              key={\`\${run.exemption}-\${run.startPage}\`}
              aria-hidden
              style={{
                ...styles.mapRun,
                left: \`\${((run.startPage - 1) / doc.pages) * 100}%\`,
                width: \`max(calc(\${widthPct}% - 1px), 3px)\`,
                backgroundColor: EXEMPTIONS[run.exemption]?.color,
              }}
            />
          );
        })}
        {scrubPage != null ? (
          <span
            aria-hidden
            style={{
              ...styles.mapCursor,
              left: \`\${((scrubPage - 0.5) / doc.pages) * 100}%\`,
            }}
          />
        ) : null}
      </div>
      {/* Scrub readout — aria-hidden duplication of the strip label. */}
      <div style={styles.mapReadout} aria-hidden>
        {scrubPage != null
          ? scrubRun != null
            ? \`p. \${scrubPage} — \${scrubRun.exemption} · \${EXEMPTIONS[scrubRun.exemption]?.gloss}\`
            : \`p. \${scrubPage} — no exemption claimed\`
          : 'Hover the strip to inspect a page'}
      </div>
      {tallies.length > 0 ? (
        <div style={styles.mapTallyRow}>
          {tallies.map(t => (
            <button
              key={t.code}
              type="button"
              className="prc-focusable"
              style={styles.tallyChip}
              onClick={() => onExemptionFilter(t.code)}
              aria-label={\`Filter disposition ledger to \${t.code} (\${t.pages} pages)\`}>
              <span
                aria-hidden
                style={{...styles.legendSwatch, marginRight: 0, backgroundColor: EXEMPTIONS[t.code]?.color}}
              />
              {t.code} ×{t.pages}pp
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DispositionLedger — TIER: fully custom composite. A Table cannot express
// rows whose footer is a legally-quotable running invoice that must
// reconcile. 36px column header, 36px body rows, 44px heavy footer whose
// bold total equals request.feeEstimateDisplay by construction; the footer
// carries the quotable string via data-quotable and copies it verbatim.
// ---------------------------------------------------------------------------

const DISPOSITION_STYLE: Record<Disposition, CSSProperties> = {
  Release: {backgroundColor: GREEN_SOFT, color: GREEN},
  Partial: {backgroundColor: AMBER_SOFT, color: AMBER_TEXT},
  Withhold: {border: \`1px solid \${RED}\`, color: RED},
};

interface DispositionLedgerProps {
  request: FoiaRequest;
  filterExemption: string | null;
  showTallyColumn: boolean;
  isQuoteCopied: boolean;
  onClearFilter: () => void;
  onCopyQuote: (quotable: string) => void;
}

function DispositionLedger({
  request,
  filterExemption,
  showTallyColumn,
  isQuoteCopied,
  onClearFilter,
  onCopyQuote,
}: DispositionLedgerProps) {
  const docs = request.documents;
  const fee = request.fee;
  const totalPages = docs.reduce((n, d) => n + d.pages, 0);

  return (
    <div style={styles.card}>
      <div style={styles.ledgerHeaderRow}>
        <Heading level={3} style={{fontSize: 13, margin: 0, whiteSpace: 'nowrap'}}>
          Disposition ledger
        </Heading>
        {docs.length > 0 ? (
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            {docs.length} documents · {totalPages} pp
          </Text>
        ) : null}
        {filterExemption != null ? (
          <button
            type="button"
            className="prc-focusable"
            style={styles.filterBadge}
            onClick={onClearFilter}
            aria-label={\`Clear exemption filter \${filterExemption}\`}>
            filtered: {filterExemption}
            <Icon icon={XIcon} size="xsm" color="inherit" />
          </button>
        ) : null}
        <span style={styles.headerSpacer} />
        {isQuoteCopied ? (
          <span
            style={{...styles.dueChip, backgroundColor: GREEN_SOFT, color: GREEN, border: 'none'}}
            role="status">
            <Icon icon={CheckIcon} size="xsm" color="inherit" />
            Copied fee quotation
          </span>
        ) : null}
      </div>
      {docs.length === 0 ? (
        <div style={styles.ledgerEmpty}>{request.ledgerEmptyNote}</div>
      ) : (
        <>
          <div style={styles.ledgerGridHeader} aria-hidden>
            <span style={styles.ledgerTitle}>DOCUMENT</span>
            <span style={styles.ledgerPages}>PAGES</span>
            <span style={styles.ledgerChipCol}>DISPOSITION</span>
            {showTallyColumn ? <span style={styles.ledgerTally}>EXEMPTIONS</span> : null}
            <span style={styles.ledgerFee}>LINE FEE</span>
          </div>
          {docs.map(doc => {
            const codes = tallyRuns(doc.runs).map(t => t.code);
            const isDimmed =
              filterExemption != null && !codes.includes(filterExemption);
            return (
              <div
                key={doc.id}
                className="prc-dim"
                style={{...styles.ledgerRow, opacity: isDimmed ? 0.35 : 1}}>
                <span style={styles.ledgerTitle} title={doc.title}>
                  {doc.title}
                </span>
                <span style={styles.ledgerPages}>{doc.pages}</span>
                <span style={styles.ledgerChipCol}>
                  <span style={{...styles.dispositionChip, ...DISPOSITION_STYLE[doc.disposition]}}>
                    {doc.disposition}
                  </span>
                </span>
                {showTallyColumn ? (
                  <span style={styles.ledgerTally}>{codes.join(' ') || '—'}</span>
                ) : null}
                <span
                  style={{
                    ...styles.ledgerFee,
                    color:
                      doc.feeDisplay === 'waived' || doc.feeDisplay === '—'
                        ? 'var(--color-text-secondary)'
                        : 'inherit',
                  }}>
                  {doc.feeDisplay}
                </span>
              </div>
            );
          })}
          {fee != null ? (
            <button
              type="button"
              className="prc-focusable"
              style={styles.ledgerFooter}
              data-quotable={fee.quotable}
              onClick={() => onCopyQuote(fee.quotable)}
              aria-label={\`Copy fee quotation: \${fee.quotable}\`}>
              <span style={styles.feeBreakdown}>
                Search {fee.searchHours.toFixed(1)} h × $
                {(fee.searchRateCents / 100).toFixed(2)} = $
                {((fee.searchHours * fee.searchRateCents) / 100).toFixed(2)} · Review{' '}
                {fee.reviewHours.toFixed(1)} h × \${(fee.reviewRateCents / 100).toFixed(2)} = $
                {((fee.reviewHours * fee.reviewRateCents) / 100).toFixed(2)} · Duplication{' '}
                {fee.pages} pp × \${(fee.perPageCents / 100).toFixed(2)} = $
                {((fee.pages * fee.perPageCents) / 100).toFixed(2)}
              </span>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0}}>
                <Icon icon={CopyIcon} size="xsm" color="secondary" />
                <span style={styles.feeTotal}>Estimate total {fee.totalDisplay}</span>
              </span>
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// QueueRow / DueDateCell — TIER: thin wrappers (product opinion only).
// 44px two-line rows; the 76px DueDateCell right rail carries the statutory
// state: amber when ≤ 3 business days remain, red negative when overdue,
// slate 'TOLLED ⏸' when the clock is stopped.
// ---------------------------------------------------------------------------

function DueDateCell({request}: {request: FoiaRequest}) {
  if (request.status === 'tolled') {
    return (
      <span style={{...styles.dueCell, color: SLATE}}>
        <span style={{...styles.dueDate, display: 'inline-flex', alignItems: 'center', gap: 3}}>
          <Icon icon={PauseIcon} size="xsm" color="inherit" />
          TOLLED
        </span>
        <span style={styles.dueMeta}>clock stopped</span>
      </span>
    );
  }
  if (request.status === 'overdue') {
    return (
      <span style={{...styles.dueCell, color: RED}}>
        <span style={styles.dueDate}>{request.dueDateDisplay}</span>
        <span style={styles.dueMeta}>{request.businessDaysRemaining} bd</span>
      </span>
    );
  }
  const bd = request.businessDaysRemaining ?? 0;
  const isAtRisk = bd <= 3;
  return (
    <span style={{...styles.dueCell, color: isAtRisk ? AMBER_TEXT : 'var(--color-text-secondary)'}}>
      <span style={styles.dueDate}>{request.dueDateDisplay}</span>
      <span style={styles.dueMeta}>in {bd} bd</span>
    </span>
  );
}

interface QueueRowProps {
  request: FoiaRequest;
  isSelected: boolean;
  showSubject: boolean;
  rowRef: (node: HTMLButtonElement | null) => void;
  onSelect: () => void;
}

function QueueRow({request, isSelected, showSubject, rowRef, onSelect}: QueueRowProps) {
  return (
    <button
      type="button"
      ref={rowRef}
      role="option"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      className="prc-focusable"
      style={{...styles.queueRow, ...(isSelected ? styles.queueRowSelected : null)}}
      title={request.subject}
      onClick={onSelect}>
      <span style={styles.queueRowMain}>
        <span style={styles.queueRowLine1}>
          <span style={styles.trackingId}>{request.trackingId}</span>
          <span style={styles.requesterName}>{request.requester}</span>
        </span>
        {showSubject ? <span style={styles.subjectLine}>{request.subject}</span> : null}
      </span>
      <DueDateCell request={request} />
    </button>
  );
}

const STATUS_DOT_COLOR: Record<FoiaStatus, string> = {
  active: GREEN,
  tolled: SLATE,
  overdue: RED,
};

// ---------------------------------------------------------------------------
// CorrespondenceEntry — TIER: thin wrapper. 36px meta row (direction glyph,
// 24px type chip, tabular date) + 3-line-clamped excerpt. Outbound letters
// get a 2px brand-warm left rule, inbound neutral. The appended
// clarification letter fades in over 200ms (disabled under
// prefers-reduced-motion via the injected CSS).
// ---------------------------------------------------------------------------

function CorrespondenceEntry({letter, isAppended}: {letter: Letter; isAppended: boolean}) {
  const isOut = letter.direction === 'out';
  return (
    <div
      className={isAppended ? 'prc-fade' : undefined}
      style={{
        ...styles.letterCard,
        borderLeftColor: isOut ? BRAND_WARM : 'var(--color-border)',
      }}>
      <div style={styles.letterMetaRow}>
        <Icon
          icon={isOut ? ArrowUpRightIcon : ArrowDownLeftIcon}
          size="xsm"
          color="secondary"
          aria-label={isOut ? 'Outbound' : 'Inbound'}
        />
        <span style={styles.letterTypeChip}>{letter.type}</span>
        <span style={styles.letterDate}>{letter.dateDisplay}</span>
      </div>
      <div style={styles.letterExcerpt}>{letter.excerpt}</div>
    </div>
  );
}

interface CorrespondenceLogProps {
  letters: Letter[];
  appendedId: string | null;
}

function CorrespondenceLog({letters, appendedId}: CorrespondenceLogProps) {
  return (
    <div style={styles.railScroll} role="log" aria-live="polite" aria-label="Correspondence log">
      {letters.map(letter => (
        <CorrespondenceEntry key={letter.id} letter={letter} isAppended={letter.id === appendedId} />
      ))}
    </div>
  );
}

/** Bottom-right corner: template quick-links row (36px rail footer). */
function RailTemplatesFooter() {
  return (
    <div style={styles.railFooter}>
      <span>Templates:</span>
      {(['Clarification', 'Fee estimate', 'Final response'] as const).map(name => (
        <button key={name} type="button" className="prc-focusable" style={styles.railTemplateLink}>
          {name}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — ConsoleRoot owns the ONE store; every surface mutates through
// update(id, patch) / appendLetter. The signature action ('Request
// clarification') has four observable consequences: the clock rail sprouts
// the hatched 10-day span, the queue DueDateCell flips to TOLLED ⏸, the
// derived at-risk counter decrements 2 → 1 (aria-live announces), and the
// correspondence log prepends the templated letter.
// ---------------------------------------------------------------------------

interface ConsoleState {
  requests: Record<string, FoiaRequest>;
  correspondence: Record<string, Letter[]>;
  selectedId: string;
  queueSort: 'due' | 'received';
  exemptionFilter: string | null;
  scrub: {docId: string; page: number} | null;
  appendedLetterId: string | null;
}

const INITIAL_STATE: ConsoleState = {
  requests: Object.fromEntries(REQUEST_LIST.map(r => [r.id, r])),
  correspondence: CORRESPONDENCE,
  selectedId: REQ_CALLOWHILL.id,
  queueSort: 'due',
  exemptionFilter: null,
  scrub: null,
  appendedLetterId: null,
};

export default function PublicRecordsConsoleTemplate() {
  // Container-width bands (see the responsive contract in the header
  // comment). Width 0 = pre-observer first frame → viewport fallback only.
  const viewRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(viewRef);
  const vpWide = useMediaQuery('(min-width: 1160px)');
  const vpMid = useMediaQuery('(min-width: 900px)');
  const vpNarrowOk = useMediaQuery('(min-width: 720px)');
  const isRailDocked = containerWidth > 0 ? containerWidth >= 1160 : vpWide;
  const isQueueStrip = containerWidth > 0 ? containerWidth < 720 : !vpNarrowOk;
  const isQueueNarrow =
    containerWidth > 0
      ? containerWidth >= 720 && containerWidth < 900
      : vpNarrowOk && !vpMid;

  const [state, setState] = useState<ConsoleState>(INITIAL_STATE);
  const [isRailDialogOpen, setIsRailDialogOpen] = useState(false);
  const [isQuoteCopied, setIsQuoteCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current != null) {
        window.clearTimeout(copyTimer.current);
      }
    },
    [],
  );

  // THE single mutation path — merges a patch into requests[id].
  const update = useCallback((id: string, patch: Partial<FoiaRequest>) => {
    setState(prev => ({
      ...prev,
      requests: {...prev.requests, [id]: {...prev.requests[id], ...patch}},
    }));
  }, []);

  const appendLetter = useCallback((id: string, letter: Letter) => {
    setState(prev => ({
      ...prev,
      correspondence: {
        ...prev.correspondence,
        [id]: [letter, ...(prev.correspondence[id] ?? [])],
      },
      appendedLetterId: letter.id,
    }));
  }, []);

  const selectRequest = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedId: id,
      exemptionFilter: null,
      scrub: null,
    }));
    setIsQuoteCopied(false);
  }, []);

  const toggleSort = useCallback(() => {
    setState(prev => ({
      ...prev,
      queueSort: prev.queueSort === 'due' ? 'received' : 'due',
    }));
  }, []);

  const setExemptionFilter = useCallback((code: string) => {
    setState(prev => ({
      ...prev,
      exemptionFilter: prev.exemptionFilter === code ? null : code,
    }));
  }, []);

  const clearExemptionFilter = useCallback(() => {
    setState(prev => ({...prev, exemptionFilter: null}));
  }, []);

  const setScrub = useCallback((docId: string, page: number | null) => {
    setState(prev => ({...prev, scrub: page == null ? null : {docId, page}}));
  }, []);

  // SIGNATURE ACTION — zero date math: the tolled segment and both due-date
  // fields come pre-computed from clarificationOutcome.
  const requestClarification = useCallback(() => {
    const req = INITIAL_STATE.requests[REQ_CALLOWHILL.id];
    const outcome = req.clarificationOutcome;
    if (outcome == null) {
      return;
    }
    const elapsedSeg = req.segments.filter(s => s.kind === 'elapsed');
    const remainingSeg = req.segments.filter(s => s.kind === 'remaining');
    update(req.id, {
      status: 'tolled',
      segments: [...elapsedSeg, outcome.tolledSegment, ...remainingSeg],
      dueDateDisplay: outcome.newDueDateDisplay,
      dueDateOrdinal: outcome.newDueDateOrdinal,
      businessDaysRemaining: null,
      clarificationRequested: true,
    });
    appendLetter(req.id, CLARIFICATION_LETTER);
  }, [update, appendLetter]);

  const copyQuote = useCallback((quotable: string) => {
    void navigator.clipboard?.writeText(quotable).catch(() => {});
    setIsQuoteCopied(true);
    if (copyTimer.current != null) {
      window.clearTimeout(copyTimer.current);
    }
    copyTimer.current = window.setTimeout(() => setIsQuoteCopied(false), 2400);
  }, []);

  // Derived, never stored: counts re-derive from the rows they summarize.
  const requests = useMemo(() => Object.values(state.requests), [state.requests]);
  const atRiskCount = requests.filter(
    r =>
      r.status === 'active' &&
      r.businessDaysRemaining != null &&
      r.businessDaysRemaining >= 0 &&
      r.businessDaysRemaining <= 3,
  ).length;
  const overdueCount = requests.filter(r => r.status === 'overdue').length;
  const activeCount = requests.filter(r => r.status === 'active').length;
  const tolledCount = requests.filter(r => r.status === 'tolled').length;

  const sortedQueue = useMemo(
    () =>
      [...requests].sort((a, b) =>
        state.queueSort === 'due'
          ? a.dueDateOrdinal - b.dueDateOrdinal
          : a.receivedOrdinal - b.receivedOrdinal,
      ),
    [requests, state.queueSort],
  );

  const selected = state.requests[state.selectedId];
  const letters = state.correspondence[state.selectedId] ?? [];
  const mappableDocs = selected.documents.filter(d => d.runs.length > 0);

  // Roving-tabindex keyboard support for the queue listbox.
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const handleQueueKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') {
      return;
    }
    event.preventDefault();
    const index = sortedQueue.findIndex(r => r.id === state.selectedId);
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? sortedQueue.length - 1
          : Math.min(
              sortedQueue.length - 1,
              Math.max(0, index + (event.key === 'ArrowDown' ? 1 : -1)),
            );
    const next = sortedQueue[nextIndex];
    if (next != null && next.id !== state.selectedId) {
      selectRequest(next.id);
      rowRefs.current.get(next.id)?.focus();
    }
  };

  const clarifyDisabled = selected.clarificationRequested === true;

  const railContent = (
    <>
      <CorrespondenceLog letters={letters} appendedId={state.appendedLetterId} />
      <RailTemplatesFooter />
    </>
  );

  return (
    <div style={styles.root}>
      <style>{CONSOLE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0}>
            <div style={styles.header}>
              {/* Corner: top-left — Daylight mark + wordmark + office caption */}
              <div style={styles.brandCluster}>
                <DaylightMark />
                <Heading level={1} style={styles.wordmark}>
                  Daylight
                </Heading>
                <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                  Records Office · City of Alder Bay · {TODAY_DISPLAY}
                </Text>
              </div>
              <span style={styles.headerSpacer} />
              {/* Corner: top-right — derived risk counter (click selects the
                  overdue request) + officer identity */}
              <button
                type="button"
                className="prc-focusable"
                style={styles.riskPill}
                onClick={() => selectRequest(REQ_SUNLIGHT.id)}
                title="Select the overdue request">
                <span aria-hidden style={{...styles.riskDot, backgroundColor: AMBER_DOT}} />
                <span aria-hidden style={{...styles.riskDot, backgroundColor: RED}} />
                <span aria-live="polite">
                  {atRiskCount} at risk · {overdueCount} overdue
                </span>
              </button>
              <span style={styles.officerCluster}>
                <span style={styles.officerAvatar} aria-hidden>
                  {OFFICER.initials}
                </span>
                <Text type="supporting" size="xsm" color="secondary">
                  {OFFICER.short} · {OFFICER.role}
                </Text>
              </span>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={viewRef} style={styles.viewRoot}>
              <div style={styles.bodyRow}>
                {/* Queue aside: 340px / 280px narrow / 52px dot strip */}
                {isQueueStrip ? (
                  <div style={styles.queueStrip} role="listbox" aria-label="Request queue" onKeyDown={handleQueueKeyDown}>
                    {sortedQueue.map(req => (
                      <button
                        key={req.id}
                        type="button"
                        role="option"
                        aria-selected={req.id === state.selectedId}
                        tabIndex={req.id === state.selectedId ? 0 : -1}
                        ref={node => {
                          if (node != null) {
                            rowRefs.current.set(req.id, node);
                          } else {
                            rowRefs.current.delete(req.id);
                          }
                        }}
                        className="prc-focusable"
                        style={{
                          ...styles.stripButton,
                          ...(req.id === state.selectedId ? styles.stripButtonSelected : null),
                        }}
                        title={\`\${req.trackingId} · \${req.requester}\`}
                        aria-label={\`\${req.trackingId}, \${req.requester}, \${req.status}\`}
                        onClick={() => selectRequest(req.id)}>
                        <span
                          aria-hidden
                          style={{...styles.stripDot, backgroundColor: STATUS_DOT_COLOR[req.status]}}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      ...styles.queueAside,
                      width: isQueueNarrow ? QUEUE_W_NARROW : QUEUE_W,
                    }}>
                    <div style={styles.queueFilterRow}>
                      <Heading level={2} style={{fontSize: 13, margin: 0}}>
                        Requests
                      </Heading>
                      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                        {requests.length}
                      </Text>
                      {/* Sorting affordance for the DueDateCell column —
                          observable reorder by dueDateOrdinal. */}
                      <button
                        type="button"
                        className="prc-focusable"
                        style={styles.sortButton}
                        onClick={toggleSort}
                        aria-label={\`Sort by \${state.queueSort === 'due' ? 'received date' : 'due date'}\`}>
                        <Icon icon={ArrowUpDownIcon} size="xsm" color="secondary" />
                        {state.queueSort === 'due' ? 'Due' : 'Received'}
                      </button>
                    </div>
                    <div
                      style={styles.queueList}
                      role="listbox"
                      aria-label="Request queue"
                      onKeyDown={handleQueueKeyDown}>
                      {sortedQueue.map(req => (
                        <QueueRow
                          key={req.id}
                          request={req}
                          isSelected={req.id === state.selectedId}
                          showSubject={!isQueueNarrow}
                          rowRef={node => {
                            if (node != null) {
                              rowRefs.current.set(req.id, node);
                            } else {
                              rowRefs.current.delete(req.id);
                            }
                          }}
                          onSelect={() => selectRequest(req.id)}
                        />
                      ))}
                    </div>
                    {/* Corner: bottom-left — derived status counts */}
                    <div style={styles.queueFooter}>
                      ACTIVE {activeCount} · TOLLED {tolledCount} · OVERDUE {overdueCount}
                    </div>
                  </div>
                )}

                {/* Main column */}
                <div style={styles.mainColumn}>
                  <div style={styles.detailHeader}>
                    <div style={styles.detailTitleCluster} title={selected.subject}>
                      <span style={styles.trackingId}>{selected.trackingId}</span>
                      <Heading level={2} style={styles.detailSubject}>
                        {selected.requester} — {selected.subject}
                      </Heading>
                    </div>
                    {!isRailDocked ? (
                      <Button
                        label={\`Correspondence (\${letters.length})\`}
                        variant="ghost"
                        size="sm"
                        icon={<Icon icon={MailIcon} size="sm" />}
                        onClick={() => setIsRailDialogOpen(true)}
                      />
                    ) : null}
                    {selected.clarificationOutcome != null || selected.clarificationRequested ? (
                      <>
                        <button
                          type="button"
                          className="prc-focusable"
                          aria-disabled={clarifyDisabled}
                          aria-describedby={clarifyDisabled ? 'prc-clarify-note' : undefined}
                          onClick={clarifyDisabled ? undefined : requestClarification}
                          style={{
                            ...styles.dueChip,
                            height: 28,
                            cursor: clarifyDisabled ? 'default' : 'pointer',
                            border: 'none',
                            font: 'inherit',
                            fontSize: 12,
                            fontWeight: 600,
                            backgroundColor: clarifyDisabled ? SLATE_SOFT : BRAND_SOFT,
                            color: clarifyDisabled ? SLATE : BRAND_TEXT,
                          }}>
                          {clarifyDisabled ? (
                            <Icon icon={PauseIcon} size="xsm" color="inherit" />
                          ) : (
                            <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
                          )}
                          {clarifyDisabled ? 'Clarification pending' : 'Request clarification'}
                        </button>
                        {clarifyDisabled ? (
                          <span id="prc-clarify-note" style={styles.srOnly}>
                            A clarification letter was sent on {TODAY_DISPLAY}; the statutory
                            clock is tolled until the requester responds.
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                  <div style={styles.mainScroll}>
                    <StatutoryClockRail
                      statutoryDays={selected.statutoryDays}
                      segments={selected.segments}
                      dueDateDisplay={selected.dueDateDisplay}
                      status={selected.status}
                      businessDaysRemaining={selected.businessDaysRemaining}
                    />
                    {mappableDocs.length > 0 ? (
                      <section
                        aria-label="Exemption page maps"
                        style={{display: 'flex', flexDirection: 'column', gap: GUTTER}}>
                        {mappableDocs.map(doc => (
                          <ExemptionPageMap
                            key={doc.id}
                            doc={doc}
                            scrubPage={state.scrub?.docId === doc.id ? state.scrub.page : null}
                            onScrub={setScrub}
                            onExemptionFilter={setExemptionFilter}
                          />
                        ))}
                      </section>
                    ) : null}
                    <DispositionLedger
                      request={selected}
                      filterExemption={state.exemptionFilter}
                      showTallyColumn={!isQueueNarrow && !isQueueStrip}
                      isQuoteCopied={isQuoteCopied}
                      onClearFilter={clearExemptionFilter}
                      onCopyQuote={copyQuote}
                    />
                  </div>
                </div>

                {/* Correspondence rail — docked ≥ 1160px of container width */}
                {isRailDocked ? (
                  <div style={styles.rail}>
                    <div style={styles.railHeader}>
                      <Heading level={2} style={{fontSize: 13, margin: 0}}>
                        Correspondence
                      </Heading>
                      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                        {letters.length}
                      </Text>
                    </div>
                    {railContent}
                  </div>
                ) : null}
              </div>
            </div>

            {/* 900–1159 band (and below): the rail rides a right-pinned DS
                Dialog — Dialog owns focus trap, Escape, and focus restore. */}
            {!isRailDocked ? (
              <Dialog
                isOpen={isRailDialogOpen}
                onOpenChange={setIsRailDialogOpen}
                purpose="info"
                width={RAIL_W}
                maxHeight="86vh"
                position={{top: HEADER_H + GUTTER, right: GUTTER}}>
                <Layout
                  header={
                    <DialogHeader
                      title="Correspondence"
                      subtitle={\`\${selected.trackingId} · \${letters.length} letters\`}
                      onOpenChange={setIsRailDialogOpen}
                    />
                  }
                  content={<LayoutContent padding={0}>{railContent}</LayoutContent>}
                />
              </Dialog>
            ) : null}
          </LayoutContent>
        }
      />
    </div>
  );
}


`;export{e as default};