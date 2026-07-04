// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Liftledger elevator-compliance
 *   world for Marlowe Property Group: a fixed day epoch (day 0 = Jan 1,
 *   2025; FIXTURE_TODAY_NUM = 518 = "Jun 3, 2026" — no Date.now(), no
 *   Math.random(), no network assets), 6 buildings, 17 cars with DOB-style
 *   device numbers 1P10453–1P10469, dual-field certificate dates
 *   ({num, display}) for every CAT1/CAT5/cert boundary, one open DOB
 *   violation (VIO_HH2, cure deadline Jul 18, 2026 = day 563, 45 days out)
 *   and one fully-cured historical violation (VIO_QPS4).
 * @output Elevator Compliance Console — a property operator's portfolio
 *   compliance surface: 46px header bar (shaft mark + wordmark, frozen
 *   as-of chip, inspector chip), 72px portfolio meter strip (71% numeral,
 *   segmented bar, four clickable stat chips), a 300px building rail with
 *   derived x/y compliance chips and a pinned "6 buildings · 17 cars"
 *   footer, a center scroll column holding the ShaftBankDiagram (true
 *   vertical shafts with per-landing ticks, dashed skipped floor 13 at
 *   Harrow, condensed 8px pitch for the 34-floor Wexford tower) above a
 *   17-row test-schedule table with per-row mini regulatory-window bands,
 *   and a 380px detail aside with the full ComplianceWindowBand
 *   (valid → due window → grace hatch → violation, hard cutoff tick, today
 *   marker at day 518), certificate facts, and a ViolationCureStepper bound
 *   to the frozen 45-day deadline. Signature ripple: "Log CAT1 test" on
 *   Harrow Car 2 updates band, shaft dot, rail chip (1/3 → 2/3), meter
 *   strip (71% → 76%), and stepper in one beat through the single
 *   update(id, patch) owner.
 * @position Page template; emitted by `astryx template elevator-compliance-console`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (46px header bar + 72px portfolio meter strip)
 *   | content (ViewRoot flex row, GUTTER 16px pad/gaps:
 *     building rail 300 | main column (40px filter row > scroll region:
 *     shaft-bank diagram card, then schedule table card) | detail aside 380
 *     with sticky 56px action footer).
 * Container policy: the two center work surfaces (diagram, schedule) are
 *   8px-radius cards on the content background; the rail and aside are
 *   bordered panes, not Cards; frame rows are styled divs.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (LIFTLEDGER_GREEN, light-dark pair) used only for the mark's filled
 *   chevron. Status colors ride the data-categorical tokens with the
 *   repo-standard light-dark fallbacks; zone tints are rgba light-dark
 *   pairs and every zone also carries a 1px full-strength border (+ hatch
 *   on grace) so legal state never reads by color alone.
 * Responsive contract (CONTAINER width via useElementWidth on the view
 *   root — the demo stage is ~1045–1075px inside a 1440px window, so
 *   viewport queries only serve the first pre-observer frame):
 * - >= 1180px: rail 300px, aside 380px, center fluid.
 * - 980–1179px (STAGE BAND — must look complete): rail 260px (address
 *   line hidden), aside 320px (band tick-label row hidden, legend
 *   collapses to dots), schedule table drops the Building AND CAT5
 *   columns (the center column is ~400px here; CAT5 stays in the aside
 *   facts — deviation from the spec's Building-only drop, noted).
 * - 760–979px: aside leaves the flow; selection opens a 380px right
 *   overlay panel inside the view root (Escape closes, focus returns to
 *   the invoking row); rail stays 260px.
 * - < 760px: rail collapses to 64px initials chips with status-dot
 *   badges, meter strip 72 → 48px dropping the stat chips, filter row
 *   scrolls horizontally.
 *   Subtraction only — segments drop; nothing squeezes.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react';

import {
  Building2Icon,
  CalendarClockIcon,
  CheckIcon,
  CircleAlertIcon,
  FileTextIcon,
  ShieldCheckIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz colors
// carry the repo-standard categorical fallbacks; the demo does not inject
// them.
// ---------------------------------------------------------------------------

// THE one quarantined brand literal (spec #2B8A3E). Used ONLY as the runtime
// fill of the mark's middle chevron — never as text, never as chrome.
const LIFTLEDGER_GREEN = 'light-dark(#2B8A3E, #57B26A)';
// Brand FILL (car markers, done-step discs) vs brand TEXT are different
// values: #217233 on white ≈ 5.6:1; #7BD08D on the dark card (#1E1E1E) ≈ 9:1.
const BRAND_FILL = 'light-dark(#2F9247, #4FA867)';
const BRAND_TEXT = 'light-dark(#217233, #7BD08D)';
const BRAND_TINT = 'light-dark(rgba(43, 138, 62, 0.08), rgba(87, 178, 106, 0.14))';
// Check glyph inside a filled done disc: #FFF on #2F9247 ≈ 4.6:1;
// #14321C on #4FA867 ≈ 6.5:1.
const DISC_TEXT = 'light-dark(#FFFFFF, #14321C)';

const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const WARN_AMBER = 'var(--color-data-categorical-yellow, light-dark(#B45309, #FBBF24))';
const WARN_STRONG = 'var(--color-data-categorical-orange, light-dark(#C2410C, #FB923C))';
const DANGER_RED = 'var(--color-data-categorical-red, light-dark(#DC2626, #F87171))';

// Zone tints (spec percentages) — each zone ALSO draws a 1px full-strength
// border so zones stay distinguishable without color alone; grace adds a
// 45° hatch on top of the warning tint.
const ZONE_VALID_FILL = 'light-dark(rgba(11, 153, 31, 0.18), rgba(52, 199, 89, 0.18))';
const ZONE_DUE_FILL = 'light-dark(rgba(180, 83, 9, 0.22), rgba(251, 191, 36, 0.20))';
const ZONE_GRACE_HATCH =
  'repeating-linear-gradient(45deg, transparent 0px, transparent 3px, light-dark(rgba(194, 65, 12, 0.35), rgba(251, 146, 60, 0.35)) 3px, light-dark(rgba(194, 65, 12, 0.35), rgba(251, 146, 60, 0.35)) 6px)';
const ZONE_VIO_FILL = 'light-dark(rgba(220, 38, 38, 0.20), rgba(248, 113, 113, 0.20))';
const DANGER_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
const WARN_SOFT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// Reduced-motion const at module top (spec a11y plan): with reduce, every
// state flip is instant — the injected CSS also guards the classes.
const REDUCED_MOTION =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

// ---------------------------------------------------------------------------
// DENSITY GRID — fixed numbers, repeated verbatim everywhere:
// header bar 46px; portfolio meter strip 72px (48px at the narrowest band);
// filter row 40px; schedule table rows 36px; heavy rows (building rail rows,
// stepper rows, stat chips) 44px; left building rail 300px (260px mid-band,
// 64px narrowest); right detail aside 380px (320px mid-band); GUTTER = 16px
// for all pane gaps and pad; card radius 8px; window band height 28px;
// shaft landing pitch 16px (8px condensed).
// ---------------------------------------------------------------------------

const HEADER_H = 46;
const METER_H = 72;
const METER_H_TIGHT = 48;
const FILTER_H = 40;
const ROW_H = 36;
const HEAVY_H = 44;
const RAIL_W = 300;
const RAIL_W_MID = 260;
const RAIL_W_TIGHT = 64;
const ASIDE_W = 380;
const ASIDE_W_MID = 320;
const GUTTER = 16;
const RADIUS = 8;
const BAND_H = 28;
const PITCH = 16;
const PITCH_CONDENSED = 8;
const FOOTER_H = 56;

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings and the reduced-motion guard. The spec's signature
// ripple animates zone/segment WIDTH (200ms) by design — the one sanctioned
// exception to transform/opacity/color-only — and collapses to instant under
// prefers-reduced-motion.
// ---------------------------------------------------------------------------

const CONSOLE_CSS = `
.ecc-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.ecc-shaft:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 8px;
}
.ecc-zone {
  transition: left 200ms ease, width 200ms ease, background-color 200ms ease;
}
.ecc-seg {
  transition: width 200ms ease, background-color 200ms ease;
}
.ecc-dot {
  transition: fill 200ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .ecc-zone { transition: none; }
  .ecc-seg { transition: none; }
  .ecc-dot { transition: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  srOnly: {
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
  // 46px header bar — corners: shaft mark + wordmark top-left; frozen
  // as-of chip + inspector chip top-right.
  headerBar: {
    height: HEADER_H,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: `0 ${GUTTER}px`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  wordmarkBlock: {display: 'flex', flexDirection: 'column', lineHeight: 1.1},
  wordmark: {fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em'},
  wordmarkCaption: {fontSize: 11, color: 'var(--color-text-secondary)'},
  headerRight: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  inspectorChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  },
  // 72px portfolio meter strip (48px tight: chips drop, bar + percent stay).
  meterStrip: {
    height: METER_H,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    padding: `0 ${GUTTER}px`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  meterLeft: {display: 'flex', flexDirection: 'column', flexShrink: 0},
  meterCaps: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  meterPercent: {
    fontSize: 28,
    fontWeight: 650,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  meterBarWrap: {flex: 1, minWidth: 120},
  meterBar: {
    display: 'flex',
    gap: 2,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  meterChips: {display: 'flex', alignItems: 'stretch', gap: 'var(--spacing-2)', flexShrink: 0},
  // 44px stat chips (heavy-row height) — real buttons; click sets the
  // schedule filter.
  meterChip: {
    height: HEAVY_H,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 12px',
    borderRadius: RADIUS,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  meterChipActive: {
    borderColor: 'var(--color-accent)',
    backgroundColor: BRAND_TINT,
  },
  meterChipCount: {
    fontSize: 16,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  meterChipLabel: {fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.2},
  // View root — measured by useElementWidth; owns the overlay positioning
  // context for the 760–979px band.
  viewRoot: {
    position: 'relative',
    display: 'flex',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    gap: GUTTER,
    padding: GUTTER,
  },
  // Building rail: 300 / 260 / 64. Own scroll; footer pinned (bottom-left
  // corner owner).
  rail: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRadius: RADIUS,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  railRows: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 6},
  // 44px heavy rows.
  railRow: {
    width: '100%',
    minHeight: HEAVY_H,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 8px',
    borderRadius: RADIUS - 2,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'left',
  },
  railRowSelected: {
    borderColor: 'var(--color-accent)',
    backgroundColor: BRAND_TINT,
  },
  railInitials: {
    width: 28,
    height: 28,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS - 2,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 11,
    fontWeight: 650,
    letterSpacing: '0.02em',
    position: 'relative',
  },
  railBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 999,
    border: '1.5px solid var(--color-background-card)',
  },
  railName: {
    fontSize: 13,
    fontWeight: 550,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  railMeta: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  railChip: {
    marginLeft: 'auto',
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    padding: '2px 7px',
    borderRadius: 999,
    border: '1px solid',
  },
  railFooter: {
    flexShrink: 0,
    padding: '8px 12px',
    borderTop: 'var(--border-width) solid var(--color-border)',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Main column: 40px filter row above the scroll region.
  mainCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    gap: GUTTER,
  },
  filterRow: {
    height: FILTER_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minWidth: 0,
  },
  filterRowScroll: {overflowX: 'auto', overflowY: 'hidden'},
  filterCaption: {
    marginLeft: 'auto',
    flexShrink: 0,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  scrollRegion: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: GUTTER,
  },
  card: {
    borderRadius: RADIUS,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    flexShrink: 0,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '10px 12px',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    minWidth: 0,
  },
  bankBlock: {padding: '10px 12px'},
  bankHeader: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
  },
  bankScroll: {overflowX: 'auto', overflowY: 'hidden'},
  // Schedule table: 36px rows, one shared grid template per band.
  tableHeaderRow: {
    display: 'grid',
    alignItems: 'center',
    columnGap: 12,
    padding: '0 12px',
    height: 30,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  tableRow: {
    display: 'grid',
    alignItems: 'center',
    columnGap: 12,
    padding: '0 12px',
    height: ROW_H,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    cursor: 'pointer',
  },
  tableRowSelected: {backgroundColor: BRAND_TINT},
  cellMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  cellText: {
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cellMono: {
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  cellDate: {
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  headCell: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Detail aside: 380 / 320 / overlay. Sticky 56px action footer
  // (bottom-right corner owner).
  aside: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRadius: RADIUS,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  overlayPanel: {
    position: 'absolute',
    top: GUTTER,
    right: GUTTER,
    bottom: GUTTER,
    width: ASIDE_W,
    maxWidth: `calc(100% - ${GUTTER * 2}px)`,
    zIndex: 3,
    boxShadow: 'var(--shadow-high)',
  },
  asideHeader: {
    flexShrink: 0,
    padding: '10px 12px',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  asideTabs: {
    display: 'flex',
    gap: 4,
    padding: '6px 8px 0',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  tabBtn: {
    font: 'inherit',
    fontSize: 12,
    fontWeight: 550,
    color: 'var(--color-text-secondary)',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '6px 10px 8px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  tabBtnActive: {
    color: BRAND_TEXT,
    borderBottomColor: BRAND_FILL,
  },
  asideScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  asideFooter: {
    flexShrink: 0,
    height: FOOTER_H,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: `0 12px`,
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  // 44px cert-fact rows.
  factRow: {
    minHeight: HEAVY_H,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  factLabel: {fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  factValue: {
    marginLeft: 'auto',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  vioCard: {
    borderRadius: RADIUS,
    border: `1px solid ${DANGER_RED}`,
    backgroundColor: DANGER_SOFT,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  vioCardCured: {
    borderRadius: RADIUS,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  dobNumber: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 600,
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: 'inherit',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
  // ViolationCureStepper — vertical <ol>, 3 × 44px rows.
  stepperOl: {listStyle: 'none', margin: 0, padding: 0},
  stepRow: {
    minHeight: HEAVY_H,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    position: 'relative',
  },
  stepDiscWrap: {
    width: 20,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepConnector: {width: 2, height: 24, flexShrink: 0},
  deadlinePill: {
    marginLeft: 'auto',
    flexShrink: 0,
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    border: '1px solid',
  },
  // ComplianceWindowBand.
  bandTrack: {
    position: 'relative',
    width: '100%',
    height: BAND_H,
    borderRadius: 6,
    backgroundColor: 'var(--color-background-muted)',
  },
  bandLabels: {
    position: 'relative',
    height: 16,
    marginTop: 2,
  },
  bandLabel: {
    position: 'absolute',
    top: 0,
    transform: 'translateX(-50%)',
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  legendSwatch: {width: 10, height: 10, borderRadius: 3, border: '1px solid'},
  emptyWrap: {padding: '16px 8px'},
  chipBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 26,
    padding: '0 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    font: 'inherit',
    fontSize: 12,
    color: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};

// ---------------------------------------------------------------------------
// RESPONSIVE — container-width bands measured on the view root. The demo
// stage renders this template in a ~1045–1075px container inside a 1440px
// window, so viewport media queries never fire there; they only serve the
// first pre-observer frame (width === 0).
// ---------------------------------------------------------------------------

function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    let frame = 0;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        // rAF-throttled: coalesce resize bursts into one state write/frame.
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => setWidth(rect.width));
      }
    });
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [ref]);
  return width;
}

type Band = 'wide' | 'mid' | 'narrow' | 'tight';

function bandFor(width: number): Band {
  if (width >= 1180) return 'wide';
  if (width >= 980) return 'mid';
  if (width >= 760) return 'narrow';
  return 'tight';
}

// ---------------------------------------------------------------------------
// DATA — deterministic BY LAW. Day epoch: day 0 = 'Jan 1, 2025'; the band's
// fixed time domain runs day 0 → day 1095 ('Dec 31, 2027' per spec;
// x = (num / 1095) * 100%). FIXTURE_TODAY is frozen at day 518 = Jun 3,
// 2026 — every relative string ('45 days to cure') is pre-computed against
// it. Dual fields everywhere: {num, display}. Signed-in context: portfolio
// manager at Marlowe Property Group; QEI inspector of record M. Okafor.
// ---------------------------------------------------------------------------

interface DualDate {
  num: number;
  display: string;
}

const d = (num: number, display: string): DualDate => ({num, display});

const DOMAIN_END_NUM = 1095;
const FIXTURE_TODAY_NUM = 518;
const FIXTURE_TODAY_DISPLAY = 'Jun 3, 2026';

type CarStatus = 'compliant' | 'dueSoon' | 'overdueGrace' | 'inViolation';

interface Car {
  entity: 'car';
  id: string;
  buildingId: string;
  label: string; // 'Car 2'
  device: string; // DOB device number, '1P10462'
  kind: 'Passenger' | 'Service' | 'Freight';
  bankLabel: string; // 'Bank A — Passenger'
  floorsServed: number; // Wexford tower 34 → condensed diagram (spec stress)
  positionFloor: number; // deterministic parked position for the car marker
  status: CarStatus;
  lastCat1: DualDate;
  certValidFrom: DualDate;
  certValidTo: DualDate;
  dueWindowStart: DualDate; // cat1Due − 90
  cat1Due: DualDate;
  graceEnd?: DualDate; // omitted on the Canal freight car (no grace path)
  cat5Due: DualDate;
}

type ViolationStatus = 'open' | 'aoc-filed' | 'cured';

interface Violation {
  entity: 'violation';
  id: string;
  carId: string;
  dobNumber: string;
  violationClass: string;
  issued: DualDate;
  cureDeadline: DualDate;
  daysRemainingNum: number;
  daysRemainingDisplay: string;
  cureStep: number; // 0-based index of the CURRENT step; 3 = all done
  status: ViolationStatus;
  prose: string;
}

type Entity = Car | Violation;

const isCar = (e: Entity): e is Car => e.entity === 'car';
const isViolation = (e: Entity): e is Violation => e.entity === 'violation';

interface Building {
  id: string;
  name: string;
  address?: string;
  initials: string;
  floors: number;
  skipFloor?: number; // Harrow skips 13 — dashed landing tick
  banksNote: string;
}

const BLDG_QPS = 'bldg-qps';
const BLDG_HARROW = 'bldg-harrow';
const BLDG_WEXFORD = 'bldg-wexford';
const BLDG_CANAL = 'bldg-canal';
const BLDG_FOUNDRY = 'bldg-foundry';
const BLDG_MERCER = 'bldg-mercer';

const BUILDINGS: Building[] = [
  {
    id: BLDG_QPS,
    name: '30-18 Queens Plaza South',
    initials: 'QP',
    floors: 12,
    banksNote: 'Banks A + B · 6 cars',
  },
  {
    id: BLDG_HARROW,
    name: 'Harrow House',
    address: '214 W 92nd St',
    initials: 'HH',
    floors: 16,
    skipFloor: 13,
    banksNote: 'Bank A · 3 cars · skips 13',
  },
  {
    // 46-char name — the rail-truncation stress fixture (ellipsis + title
    // attr at the 260px mid-band rail; see RailRow).
    id: BLDG_WEXFORD,
    name: 'The Wexford-Anthracite Cooperative Residences',
    address: '1120 Amsterdam Ave',
    initials: 'WA',
    floors: 34,
    banksNote: 'Tower + Annex · 2 cars',
  },
  {
    id: BLDG_CANAL,
    name: '88 Canal Street',
    initials: 'CS',
    floors: 9,
    banksNote: 'Passenger + freight · 2 cars',
  },
  {
    id: BLDG_FOUNDRY,
    name: 'Foundry Lofts',
    address: '41-07 Vernon Blvd',
    initials: 'FL',
    floors: 10,
    banksNote: 'Banks A + B · 3 cars',
  },
  {
    id: BLDG_MERCER,
    // Fully compliant — drives the 'No open violations' empty panel.
    name: '145 Mercer Street',
    initials: 'ME',
    floors: 6,
    banksNote: 'Bank A · 1 car',
  },
];

const BUILDING_BY_ID: ReadonlyMap<string, Building> = new Map(
  BUILDINGS.map(b => [b.id, b]),
);

const CAR_QPS_1 = 'car-qps-1';
const CAR_QPS_4 = 'car-qps-4';
const CAR_HH_2 = 'car-hh-2';
const CAR_CANAL_F1 = 'car-canal-f1';
const VIO_HH2 = 'vio-hh2';
const VIO_QPS4 = 'vio-qps4';

// Status ledger cross-check (the law these rows must satisfy):
// 12 compliant + 3 dueSoon + 1 overdueGrace + 1 inViolation = 17 cars;
// per-building rail chips (5/6, 1/3, 1/2, 2/2, 2/3, 1/1) sum to the strip
// chips; portfolio % = round(12/17 × 100) = 71 — ALWAYS derived in render,
// never stored.
const CARS: Car[] = [
  {
    entity: 'car', id: CAR_QPS_1, buildingId: BLDG_QPS, label: 'Car 1',
    device: '1P10453', kind: 'Passenger', bankLabel: 'Bank A — Passenger',
    floorsServed: 12, positionFloor: 7, status: 'compliant',
    lastCat1: d(292, 'Oct 20, 2025'), certValidFrom: d(292, 'Oct 20, 2025'),
    certValidTo: d(657, 'Oct 20, 2026'), dueWindowStart: d(567, 'Jul 22, 2026'),
    cat1Due: d(657, 'Oct 20, 2026'), graceEnd: d(702, 'Dec 4, 2026'),
    cat5Due: d(1168, 'Mar 14, 2028'),
  },
  {
    entity: 'car', id: 'car-qps-2', buildingId: BLDG_QPS, label: 'Car 2',
    device: '1P10454', kind: 'Passenger', bankLabel: 'Bank A — Passenger',
    floorsServed: 12, positionFloor: 1, status: 'compliant',
    lastCat1: d(308, 'Nov 5, 2025'), certValidFrom: d(308, 'Nov 5, 2025'),
    certValidTo: d(673, 'Nov 5, 2026'), dueWindowStart: d(583, 'Aug 7, 2026'),
    cat1Due: d(673, 'Nov 5, 2026'), graceEnd: d(718, 'Dec 20, 2026'),
    cat5Due: d(981, 'Sep 9, 2027'),
  },
  {
    entity: 'car', id: 'car-qps-3', buildingId: BLDG_QPS, label: 'Car 3',
    device: '1P10455', kind: 'Passenger', bankLabel: 'Bank A — Passenger',
    floorsServed: 12, positionFloor: 12, status: 'compliant',
    lastCat1: d(343, 'Dec 10, 2025'), certValidFrom: d(343, 'Dec 10, 2025'),
    certValidTo: d(708, 'Dec 10, 2026'), dueWindowStart: d(618, 'Sep 11, 2026'),
    cat1Due: d(708, 'Dec 10, 2026'), graceEnd: d(753, 'Jan 24, 2027'),
    cat5Due: d(1276, 'Jun 30, 2028'),
  },
  {
    // The 1-in-grace car: CAT1 lapsed Apr 28, grace runs to Jun 12 (day
    // 527, 9 days past today). Carries the CURED historical violation
    // VIO_QPS4 — its aside stepper renders the all-done state.
    entity: 'car', id: CAR_QPS_4, buildingId: BLDG_QPS, label: 'Car 4',
    device: '1P10456', kind: 'Passenger', bankLabel: 'Bank A — Passenger',
    floorsServed: 12, positionFloor: 5, status: 'overdueGrace',
    lastCat1: d(117, 'Apr 28, 2025'), certValidFrom: d(117, 'Apr 28, 2025'),
    certValidTo: d(482, 'Apr 28, 2026'), dueWindowStart: d(392, 'Jan 28, 2026'),
    cat1Due: d(482, 'Apr 28, 2026'), graceEnd: d(527, 'Jun 12, 2026'),
    cat5Due: d(771, 'Feb 11, 2027'),
  },
  {
    entity: 'car', id: 'car-qps-5', buildingId: BLDG_QPS, label: 'Car 5',
    device: '1P10457', kind: 'Service', bankLabel: 'Bank B — Service',
    floorsServed: 12, positionFloor: 9, status: 'compliant',
    lastCat1: d(254, 'Sep 12, 2025'), certValidFrom: d(254, 'Sep 12, 2025'),
    certValidTo: d(619, 'Sep 12, 2026'), dueWindowStart: d(529, 'Jun 14, 2026'),
    cat1Due: d(619, 'Sep 12, 2026'), graceEnd: d(664, 'Oct 27, 2026'),
    cat5Due: d(1036, 'Nov 3, 2027'),
  },
  {
    entity: 'car', id: 'car-qps-6', buildingId: BLDG_QPS, label: 'Car 6',
    device: '1P10458', kind: 'Service', bankLabel: 'Bank B — Service',
    floorsServed: 12, positionFloor: 3, status: 'compliant',
    lastCat1: d(267, 'Sep 25, 2025'), certValidFrom: d(267, 'Sep 25, 2025'),
    certValidTo: d(632, 'Sep 25, 2026'), dueWindowStart: d(542, 'Jun 27, 2026'),
    cat1Due: d(632, 'Sep 25, 2026'), graceEnd: d(677, 'Nov 9, 2026'),
    cat5Due: d(1204, 'Apr 19, 2028'),
  },
  {
    // 34 served floors → ShaftBankDiagram condensed 8px-pitch mode with
    // labels every 5th floor (spec stress fixture).
    entity: 'car', id: 'car-wex-1', buildingId: BLDG_WEXFORD, label: 'Car 1',
    device: '1P10459', kind: 'Passenger', bankLabel: 'Tower — Passenger',
    floorsServed: 34, positionFloor: 21, status: 'dueSoon',
    lastCat1: d(233, 'Aug 22, 2025'), certValidFrom: d(233, 'Aug 22, 2025'),
    certValidTo: d(598, 'Aug 22, 2026'), dueWindowStart: d(508, 'May 24, 2026'),
    cat1Due: d(598, 'Aug 22, 2026'), graceEnd: d(643, 'Oct 6, 2026'),
    cat5Due: d(917, 'Jul 7, 2027'),
  },
  {
    entity: 'car', id: 'car-wex-2', buildingId: BLDG_WEXFORD, label: 'Car 2',
    device: '1P10460', kind: 'Passenger', bankLabel: 'Annex — Passenger',
    floorsServed: 12, positionFloor: 4, status: 'compliant',
    lastCat1: d(409, 'Feb 14, 2026'), certValidFrom: d(409, 'Feb 14, 2026'),
    certValidTo: d(774, 'Feb 14, 2027'), dueWindowStart: d(684, 'Nov 16, 2026'),
    cat1Due: d(774, 'Feb 14, 2027'), graceEnd: d(819, 'Mar 31, 2027'),
    cat5Due: d(1441, 'Dec 12, 2028'),
  },
  {
    entity: 'car', id: 'car-hh-1', buildingId: BLDG_HARROW, label: 'Car 1',
    device: '1P10461', kind: 'Passenger', bankLabel: 'Bank A — Passenger',
    floorsServed: 15, positionFloor: 10, status: 'compliant',
    lastCat1: d(386, 'Jan 22, 2026'), certValidFrom: d(386, 'Jan 22, 2026'),
    certValidTo: d(751, 'Jan 22, 2027'), dueWindowStart: d(661, 'Oct 24, 2026'),
    cat1Due: d(751, 'Jan 22, 2027'), graceEnd: d(796, 'Mar 8, 2027'),
    cat5Due: d(956, 'Aug 15, 2027'),
  },
  {
    // THE violation car — device 1P10462. CAT1 lapsed Apr 1, 2026; grace
    // burned out May 16; DOB violation VIO_HH2 open with a Jul 18 cure
    // deadline. The signature 'Log CAT1 test' ripple starts here.
    entity: 'car', id: CAR_HH_2, buildingId: BLDG_HARROW, label: 'Car 2',
    device: '1P10462', kind: 'Passenger', bankLabel: 'Bank A — Passenger',
    floorsServed: 15, positionFloor: 1, status: 'inViolation',
    lastCat1: d(90, 'Apr 1, 2025'), certValidFrom: d(90, 'Apr 1, 2025'),
    certValidTo: d(455, 'Apr 1, 2026'), dueWindowStart: d(365, 'Jan 1, 2026'),
    cat1Due: d(455, 'Apr 1, 2026'), graceEnd: d(500, 'May 16, 2026'),
    cat5Due: d(639, 'Oct 2, 2026'),
  },
  {
    entity: 'car', id: 'car-hh-3', buildingId: BLDG_HARROW, label: 'Car 3',
    device: '1P10463', kind: 'Passenger', bankLabel: 'Bank A — Passenger',
    floorsServed: 15, positionFloor: 16, status: 'dueSoon',
    lastCat1: d(195, 'Jul 15, 2025'), certValidFrom: d(195, 'Jul 15, 2025'),
    certValidTo: d(560, 'Jul 15, 2026'), dueWindowStart: d(470, 'Apr 16, 2026'),
    cat1Due: d(560, 'Jul 15, 2026'), graceEnd: d(605, 'Aug 29, 2026'),
    cat5Due: d(1124, 'Jan 30, 2028'),
  },
  {
    entity: 'car', id: 'car-canal-1', buildingId: BLDG_CANAL, label: 'Car 1',
    device: '1P10464', kind: 'Passenger', bankLabel: 'Bank A — Passenger',
    floorsServed: 8, positionFloor: 2, status: 'compliant',
    lastCat1: d(425, 'Mar 2, 2026'), certValidFrom: d(425, 'Mar 2, 2026'),
    certValidTo: d(790, 'Mar 2, 2027'), dueWindowStart: d(700, 'Dec 2, 2026'),
    cat1Due: d(790, 'Mar 2, 2027'), graceEnd: d(835, 'Apr 16, 2027'),
    cat5Due: d(874, 'May 25, 2027'),
  },
  {
    // Freight car: NO grace zone — graceEnd omitted; ComplianceWindowBand
    // exercises its omit-when-undefined segment path here.
    entity: 'car', id: CAR_CANAL_F1, buildingId: BLDG_CANAL, label: 'Car F1',
    device: '1P10465', kind: 'Freight', bankLabel: 'Freight',
    floorsServed: 9, positionFloor: 1, status: 'compliant',
    lastCat1: d(278, 'Oct 6, 2025'), certValidFrom: d(278, 'Oct 6, 2025'),
    certValidTo: d(643, 'Oct 6, 2026'), dueWindowStart: d(553, 'Jul 8, 2026'),
    cat1Due: d(643, 'Oct 6, 2026'),
    cat5Due: d(1008, 'Oct 6, 2027'),
  },
  {
    entity: 'car', id: 'car-fdy-1', buildingId: BLDG_FOUNDRY, label: 'Car 1',
    device: '1P10466', kind: 'Passenger', bankLabel: 'Bank A — Passenger',
    floorsServed: 10, positionFloor: 6, status: 'compliant',
    lastCat1: d(321, 'Nov 18, 2025'), certValidFrom: d(321, 'Nov 18, 2025'),
    certValidTo: d(686, 'Nov 18, 2026'), dueWindowStart: d(596, 'Aug 20, 2026'),
    cat1Due: d(686, 'Nov 18, 2026'), graceEnd: d(731, 'Jan 2, 2027'),
    cat5Due: d(1522, 'Mar 3, 2029'),
  },
  {
    entity: 'car', id: 'car-fdy-2', buildingId: BLDG_FOUNDRY, label: 'Car 2',
    device: '1P10467', kind: 'Passenger', bankLabel: 'Bank A — Passenger',
    floorsServed: 10, positionFloor: 10, status: 'dueSoon',
    lastCat1: d(170, 'Jun 20, 2025'), certValidFrom: d(170, 'Jun 20, 2025'),
    certValidTo: d(535, 'Jun 20, 2026'), dueWindowStart: d(445, 'Mar 22, 2026'),
    cat1Due: d(535, 'Jun 20, 2026'), graceEnd: d(580, 'Aug 4, 2026'),
    cat5Due: d(900, 'Jun 20, 2027'),
  },
  {
    entity: 'car', id: 'car-fdy-3', buildingId: BLDG_FOUNDRY, label: 'Car 3',
    device: '1P10468', kind: 'Service', bankLabel: 'Bank B — Service',
    floorsServed: 10, positionFloor: 1, status: 'compliant',
    lastCat1: d(372, 'Jan 8, 2026'), certValidFrom: d(372, 'Jan 8, 2026'),
    certValidTo: d(737, 'Jan 8, 2027'), dueWindowStart: d(647, 'Oct 10, 2026'),
    cat1Due: d(737, 'Jan 8, 2027'), graceEnd: d(782, 'Feb 22, 2027'),
    cat5Due: d(1000, 'Sep 28, 2027'),
  },
  {
    entity: 'car', id: 'car-mer-1', buildingId: BLDG_MERCER, label: 'Car 1',
    device: '1P10469', kind: 'Passenger', bankLabel: 'Bank A — Passenger',
    floorsServed: 6, positionFloor: 3, status: 'compliant',
    lastCat1: d(335, 'Dec 2, 2025'), certValidFrom: d(335, 'Dec 2, 2025'),
    certValidTo: d(700, 'Dec 2, 2026'), dueWindowStart: d(610, 'Sep 3, 2026'),
    cat1Due: d(700, 'Dec 2, 2026'), graceEnd: d(745, 'Jan 16, 2027'),
    cat5Due: d(1315, 'Aug 8, 2028'),
  },
];

const VIOLATIONS: Violation[] = [
  {
    entity: 'violation',
    id: VIO_HH2,
    carId: CAR_HH_2,
    dobNumber: 'V*040126LL10-01',
    violationClass: 'CAT1 LATE — NO TEST FILED',
    issued: d(455, 'Apr 1, 2026'),
    cureDeadline: d(563, 'Jul 18, 2026'), // 518 + 45 — the frozen deadline
    daysRemainingNum: 45,
    daysRemainingDisplay: '45 days to cure',
    cureStep: 0,
    status: 'open',
    // Two sentences + citation — tests aside text wrap (spec stress).
    prose:
      'CAT1 periodic test not performed within the 12-month window for device 1P10462. Cure requires test performance by a QEI-certified inspector and AOC filing per RCNY §8-1(b). Failure to cure escalates to aggravated penalty class.',
  },
  {
    // Historical, fully accepted — renders the all-done stepper on QPS Car 4.
    entity: 'violation',
    id: VIO_QPS4,
    carId: CAR_QPS_4,
    dobNumber: 'V*061525LL10-04',
    violationClass: 'CAT1 LATE — NO TEST FILED',
    issued: d(165, 'Jun 15, 2025'),
    cureDeadline: d(225, 'Aug 14, 2025'),
    daysRemainingNum: 0,
    daysRemainingDisplay: 'Cured',
    cureStep: 3,
    status: 'cured',
    prose:
      'CAT1 performed Jul 28, 2025 by M. Okafor (QEI-2214); AOC accepted by DOB Aug 3, 2025. Violation cured within the 60-day window.',
  },
];

// The ONE flat entity record the single state owner holds.
const INITIAL_ENTITIES: Record<string, Entity> = Object.fromEntries(
  [...CARS, ...VIOLATIONS].map(e => [e.id, e]),
);

// Frozen patches for the signature ripple — dual fields pre-computed
// against the fixture epoch, identical for every car ('today' is always
// Jun 3, 2026): new CAT1 window Jun 3 2026 → Jun 3 2027 (883), due window
// opens Mar 5 2027 (793), grace runs to Jul 18 2027 (928).
const LOGGED_CAT1_PATCH: Partial<Car> = {
  lastCat1: d(FIXTURE_TODAY_NUM, FIXTURE_TODAY_DISPLAY),
  certValidFrom: d(FIXTURE_TODAY_NUM, FIXTURE_TODAY_DISPLAY),
  certValidTo: d(883, 'Jun 3, 2027'),
  dueWindowStart: d(793, 'Mar 5, 2027'),
  cat1Due: d(883, 'Jun 3, 2027'),
  status: 'compliant',
};
const LOGGED_CAT1_GRACE = d(928, 'Jul 18, 2027');

const STATUS_META: Record<
  CarStatus,
  {
    label: string;
    tokenColor: 'green' | 'yellow' | 'orange' | 'red';
    dotVariant: 'success' | 'warning' | 'error';
    fill: string;
  }
> = {
  compliant: {label: 'Compliant', tokenColor: 'green', dotVariant: 'success', fill: OK_GREEN},
  dueSoon: {label: 'Due ≤90d', tokenColor: 'yellow', dotVariant: 'warning', fill: WARN_AMBER},
  overdueGrace: {label: 'In grace', tokenColor: 'orange', dotVariant: 'warning', fill: WARN_STRONG},
  inViolation: {label: 'In violation', tokenColor: 'red', dotVariant: 'error', fill: DANGER_RED},
};

const STATUS_ORDER: CarStatus[] = ['compliant', 'dueSoon', 'overdueGrace', 'inViolation'];

// ---------------------------------------------------------------------------
// DERIVATIONS — everything aggregate is computed from the rows in render.
// ---------------------------------------------------------------------------

type ZoneKind = 'valid' | 'dueWindow' | 'grace' | 'violation';

interface Zone {
  kind: ZoneKind;
  startNum: number;
  endNum: number;
  startDisplay: string;
  endDisplay: string;
}

const ZONE_META: Record<ZoneKind, {label: string; fill: string; border: string}> = {
  valid: {label: 'Valid', fill: ZONE_VALID_FILL, border: OK_GREEN},
  dueWindow: {label: 'Due window', fill: ZONE_DUE_FILL, border: WARN_AMBER},
  grace: {label: 'Grace', fill: ZONE_DUE_FILL, border: WARN_STRONG},
  violation: {label: 'Violation', fill: ZONE_VIO_FILL, border: DANGER_RED},
};

/** Regulatory-window zones derive live from the car's dual fields. */
function zonesForCar(car: Car, violation: Violation | undefined): Zone[] {
  const zones: Zone[] = [
    {
      kind: 'valid',
      startNum: car.certValidFrom.num,
      endNum: car.dueWindowStart.num,
      startDisplay: car.certValidFrom.display,
      endDisplay: car.dueWindowStart.display,
    },
    {
      kind: 'dueWindow',
      startNum: car.dueWindowStart.num,
      endNum: car.cat1Due.num,
      startDisplay: car.dueWindowStart.display,
      endDisplay: car.cat1Due.display,
    },
  ];
  // Omit-when-undefined: the Canal freight car has no grace path.
  if (car.graceEnd != null) {
    zones.push({
      kind: 'grace',
      startNum: car.cat1Due.num,
      endNum: car.graceEnd.num,
      startDisplay: car.cat1Due.display,
      endDisplay: car.graceEnd.display,
    });
  }
  if (
    car.status === 'inViolation' &&
    violation != null &&
    violation.status !== 'cured' &&
    car.graceEnd != null
  ) {
    zones.push({
      kind: 'violation',
      startNum: car.graceEnd.num,
      endNum: violation.cureDeadline.num,
      startDisplay: car.graceEnd.display,
      endDisplay: violation.cureDeadline.display,
    });
  }
  return zones;
}

function statusCounts(cars: Car[]): Record<CarStatus, number> {
  const counts: Record<CarStatus, number> = {
    compliant: 0,
    dueSoon: 0,
    overdueGrace: 0,
    inViolation: 0,
  };
  for (const car of cars) {
    counts[car.status] += 1;
  }
  return counts;
}

function openViolationForCar(entities: Record<string, Entity>, carId: string) {
  return Object.values(entities).find(
    (e): e is Violation => isViolation(e) && e.carId === carId && e.status !== 'cured',
  );
}

function curedViolationForCar(entities: Record<string, Entity>, carId: string) {
  return Object.values(entities).find(
    (e): e is Violation => isViolation(e) && e.carId === carId && e.status === 'cured',
  );
}

// ---------------------------------------------------------------------------
// MARK — 20px rounded rect, 3 stacked chevrons; the middle chevron is the
// ONLY use of the quarantined LIFTLEDGER_GREEN literal.
// ---------------------------------------------------------------------------

function LiftledgerMark() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden style={{flexShrink: 0}}>
      <rect
        x={0.5}
        y={0.5}
        width={19}
        height={19}
        rx={5}
        fill="var(--color-background-muted)"
        stroke="var(--color-border)"
      />
      <path
        d="M5.5 7.6 L10 4.8 L14.5 7.6"
        fill="none"
        stroke="var(--color-text-secondary)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.8 13.2 L10 9.4 L15.2 13.2 L15.2 11.2 L10 7.4 L4.8 11.2 Z"
        fill={LIFTLEDGER_GREEN}
      />
      <path
        d="M5.5 16.6 L10 13.8 L14.5 16.6"
        fill="none"
        stroke="var(--color-text-secondary)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// COMPLIANCE METER STRIP — 72px (48px tight, chips drop). Percent and
// segment widths are DERIVED from the live rows; chips set the schedule
// filter. THIN-WRAPPER-plus tier: DS chips + a custom segmented bar.
// ---------------------------------------------------------------------------

interface MeterStripProps {
  counts: Record<CarStatus, number>;
  total: number;
  filter: CarStatus | null;
  onFilter: (status: CarStatus | null) => void;
  isTight: boolean;
}

const CHIP_LABEL: Record<CarStatus, (n: number) => string> = {
  compliant: n => `${n} compliant`,
  dueSoon: n => `${n} due ≤90d`,
  overdueGrace: n => `${n} in grace`,
  inViolation: n => `${n} in violation`,
};

function ComplianceMeterStrip({counts, total, filter, onFilter, isTight}: MeterStripProps) {
  const percent = Math.round((counts.compliant / total) * 100); // 12/17 → 71
  return (
    <div style={{...styles.meterStrip, height: isTight ? METER_H_TIGHT : METER_H}}>
      <div style={styles.meterLeft}>
        {!isTight && <span style={styles.meterCaps}>Portfolio compliance</span>}
        {/* Static once rendered — updates only on explicit user mutations,
            which the polite live region announces; keep this off. */}
        <span aria-live="off" style={styles.meterPercent}>
          {percent}%
        </span>
      </div>
      <div style={styles.meterBarWrap}>
        <div
          style={styles.meterBar}
          role="img"
          aria-label={`Portfolio compliance ${percent} percent: ${STATUS_ORDER.map(
            s => CHIP_LABEL[s](counts[s]),
          ).join(', ')}`}>
          {STATUS_ORDER.map(status => (
            <div
              key={status}
              className="ecc-seg"
              style={{
                width: `${(counts[status] / total) * 100}%`,
                backgroundColor: STATUS_META[status].fill,
              }}
            />
          ))}
        </div>
      </div>
      {!isTight && (
        <div style={styles.meterChips}>
          {STATUS_ORDER.map(status => {
            const isActive = filter === status;
            return (
              <button
                key={status}
                type="button"
                className="ecc-focusable"
                style={isActive ? {...styles.meterChip, ...styles.meterChipActive} : styles.meterChip}
                aria-pressed={isActive}
                onClick={() => onFilter(isActive ? null : status)}>
                <StatusDot
                  variant={STATUS_META[status].dotVariant}
                  label={STATUS_META[status].label}
                />
                <span style={styles.meterChipCount}>{counts[status]}</span>
                <span style={styles.meterChipLabel}>
                  {CHIP_LABEL[status](counts[status]).replace(/^\d+ /, '')}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPLIANCE WINDOW BAND — absolutely-positioned zone divs in a 100%×28px
// track. Fixed domain: day 0 = Jan 1, 2025 → day 1095; x = num/1095 × 100%.
// Zones render omit-when-undefined; grace adds the 45° hatch; the hard
// cutoff tick overhangs 4px top/bottom; today (518) is a dashed vline with
// a triangle cap. Rendered full-size in the aside and mini (18px, no
// labels) inside table rows.
// ---------------------------------------------------------------------------

interface ComplianceWindowBandProps {
  zones: Zone[];
  todayNum: number;
  cutoffNum?: number;
  compact?: boolean;
  showLabels?: boolean;
  ariaLabel: string;
  onZoneClick?: (kind: ZoneKind) => void;
}

const pctX = (num: number) => `${(Math.min(num, DOMAIN_END_NUM) / DOMAIN_END_NUM) * 100}%`;

function ComplianceWindowBand({
  zones,
  todayNum,
  cutoffNum,
  compact = false,
  showLabels = false,
  ariaLabel,
  onZoneClick,
}: ComplianceWindowBandProps) {
  const height = compact ? 18 : BAND_H;
  const overhang = compact ? 2 : 4;
  // Boundary labels: each zone start + the final end (deduped by num).
  const labelPoints = new Map<number, string>();
  for (const zone of zones) {
    if (!labelPoints.has(zone.startNum)) labelPoints.set(zone.startNum, zone.startDisplay);
  }
  const last = zones[zones.length - 1];
  if (last != null && !labelPoints.has(last.endNum)) {
    labelPoints.set(last.endNum, last.endDisplay);
  }
  return (
    <div>
      {/* role img + full-sentence label; the zone hit-targets inside are a
          pointer-only affordance (aria-hidden, tabIndex −1) — the keyboard
          path to the same selections is the rows/chips/tabs. */}
      <div role="img" aria-label={ariaLabel} style={{...styles.bandTrack, height}}>
        {zones.map(zone => {
          const meta = ZONE_META[zone.kind];
          const left = pctX(zone.startNum);
          const width = `${((Math.min(zone.endNum, DOMAIN_END_NUM) - Math.min(zone.startNum, DOMAIN_END_NUM)) / DOMAIN_END_NUM) * 100}%`;
          const zoneStyle: CSSProperties = {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left,
            width,
            display: 'block',
          };
          const face: CSSProperties = {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderRadius: 3,
            border: `1px solid ${meta.border}`,
            backgroundColor: meta.fill,
            backgroundImage: zone.kind === 'grace' ? ZONE_GRACE_HATCH : undefined,
            padding: 0,
            cursor: onZoneClick != null ? 'pointer' : 'default',
          };
          return (
            <span key={`${zone.kind}-${zone.startNum}`} className="ecc-zone" style={zoneStyle}>
              <Tooltip
                content={`${meta.label} · ${zone.startDisplay} – ${zone.endDisplay}`}>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  style={face}
                  onClick={onZoneClick != null ? () => onZoneClick(zone.kind) : undefined}
                />
              </Tooltip>
            </span>
          );
        })}
        {cutoffNum != null && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: pctX(cutoffNum),
              top: -overhang,
              bottom: -overhang,
              width: 2,
              backgroundColor: DANGER_RED,
              zIndex: 2,
            }}
          />
        )}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: pctX(todayNum),
            top: 0,
            bottom: 0,
            width: 0,
            borderLeft: '1px dashed var(--color-text-secondary)',
            zIndex: 1,
          }}>
          <div
            style={{
              position: 'absolute',
              top: -1,
              left: -3.5,
              width: 0,
              height: 0,
              borderLeft: '3px solid transparent',
              borderRight: '3px solid transparent',
              borderTop: '6px solid var(--color-text-secondary)',
            }}
          />
        </div>
      </div>
      {showLabels && !compact && (
        <div style={styles.bandLabels} aria-hidden>
          {[...labelPoints.entries()].map(([num, display]) => (
            <span key={num} style={{...styles.bandLabel, left: pctX(num)}}>
              {display}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHAFT BANK DIAGRAM — fully custom inline SVG, purely presentational. One
// <svg> per bank; left 24px floor axis; 56px slot per car with a 40px shaft
// rect; landing ticks per served floor (skipped floor 13 at Harrow renders
// dashed); 32×12 car marker at the deterministic parked floor; 8px status
// dot 6px above the shaft top. Condensed mode (floorsServed > 22 — the
// 34-floor Wexford tower): 8px pitch, labels every 5th floor. Each shaft is
// a focusable role="button" group; ArrowLeft/Right move car-to-car.
// ---------------------------------------------------------------------------

const SLOT_W = 56;
const AXIS_W = 24;
const TOP_PAD = 24;
const LABEL_ROW = 20;

interface ShaftBankDiagramProps {
  building: Building;
  cars: Car[];
  selectedCarId: string | null;
  onSelectCar: (id: string, invoker: HTMLElement) => void;
}

function ShaftBankDiagram({building, cars, selectedCarId, onSelectCar}: ShaftBankDiagramProps) {
  const banks: {label: string; cars: Car[]}[] = [];
  for (const car of cars) {
    const bank = banks.find(b => b.label === car.bankLabel);
    if (bank != null) bank.cars.push(car);
    else banks.push({label: car.bankLabel, cars: [car]});
  }
  const carOrder = cars.map(c => c.id);

  const handleKey = (event: ReactKeyboardEvent<SVGGElement>, car: Car) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectCar(car.id, event.currentTarget as unknown as HTMLElement);
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const next = carOrder[carOrder.indexOf(car.id) + delta];
      if (next != null) {
        document.getElementById(`ecc-shaft-${next}`)?.focus();
      }
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <Icon icon={Building2Icon} size="sm" color="secondary" />
        <Heading level={2} style={{fontSize: 14}}>
          {building.name}
        </Heading>
        <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
          {building.banksNote}
        </Text>
      </div>
      <div
        style={{
          ...styles.bankBlock,
          display: 'flex',
          alignItems: 'flex-start',
          gap: GUTTER,
          flexWrap: 'wrap',
        }}>
        {banks.map(bank => {
          const bankFloors =
            building.skipFloor != null
              ? building.floors
              : Math.max(...bank.cars.map(c => c.floorsServed));
          const condensed = bankFloors > 22;
          const pitch = condensed ? PITCH_CONDENSED : PITCH;
          const labelEvery = condensed ? 5 : bankFloors > 12 ? 2 : 1;
          const svgW = AXIS_W + bank.cars.length * SLOT_W + 8;
          const svgH = TOP_PAD + bankFloors * pitch + LABEL_ROW;
          const floorY = (floor: number) => TOP_PAD + (bankFloors - floor) * pitch;
          return (
            <div key={bank.label} style={styles.bankScroll}>
              <div style={styles.bankHeader}>{bank.label}</div>
              <svg
                width={svgW}
                height={svgH}
                viewBox={`0 0 ${svgW} ${svgH}`}
                role="group"
                aria-label={`${bank.label}, ${bank.cars.length} car${bank.cars.length === 1 ? '' : 's'}`}>
                {/* Floor axis labels */}
                {Array.from({length: bankFloors}, (_, i) => i + 1)
                  .filter(
                    f => f === 1 || f === bankFloors || f % labelEvery === 0,
                  )
                  .map(f => (
                    <text
                      key={f}
                      x={AXIS_W - 6}
                      y={floorY(f) + 3}
                      textAnchor="end"
                      fontSize={10}
                      fill="var(--color-text-secondary)"
                      style={{fontVariantNumeric: 'tabular-nums'}}>
                      {f}
                    </text>
                  ))}
                {bank.cars.map((car, i) => {
                  const shaftX = AXIS_W + i * SLOT_W + 8;
                  const isSelected = car.id === selectedCarId;
                  const meta = STATUS_META[car.status];
                  const markerY = floorY(car.positionFloor) - 6;
                  const isSkipped = (f: number) => building.skipFloor === f;
                  return (
                    <g
                      key={car.id}
                      id={`ecc-shaft-${car.id}`}
                      className="ecc-shaft"
                      role="button"
                      tabIndex={0}
                      aria-label={`${car.label}, device ${car.device}, ${meta.label.toLowerCase()}, CAT1 due ${car.cat1Due.display}`}
                      style={{cursor: 'pointer'}}
                      onClick={event =>
                        onSelectCar(car.id, event.currentTarget as unknown as HTMLElement)
                      }
                      onKeyDown={event => handleKey(event, car)}>
                      {/* Shaft rect: surface-sunken fill, 1px border */}
                      <rect
                        x={shaftX}
                        y={TOP_PAD}
                        width={40}
                        height={bankFloors * pitch}
                        rx={8}
                        fill={isSelected ? BRAND_TINT : 'var(--color-background-muted)'}
                        stroke={isSelected ? 'var(--color-accent)' : 'var(--color-border)'}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      {/* Landing ticks — dashed for the skipped floor */}
                      {Array.from({length: bankFloors}, (_, fi) => fi + 1).map(f => (
                        <line
                          key={f}
                          x1={shaftX}
                          y1={floorY(f)}
                          x2={shaftX + 8}
                          y2={floorY(f)}
                          stroke="var(--color-border)"
                          strokeWidth={1}
                          strokeDasharray={isSkipped(f) ? '2 2' : undefined}
                        />
                      ))}
                      {/* Car marker at the parked floor */}
                      <rect
                        x={shaftX + 4}
                        y={Math.max(markerY, TOP_PAD + 1)}
                        width={32}
                        height={12}
                        rx={4}
                        fill={BRAND_FILL}
                      />
                      {/* Status dot 6px above the shaft top */}
                      <circle
                        className="ecc-dot"
                        cx={shaftX + 20}
                        cy={TOP_PAD - 10}
                        r={4}
                        fill={meta.fill}
                      />
                      {/* Under-shaft label */}
                      <text
                        x={shaftX + 20}
                        y={svgH - 10}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={600}
                        fill="var(--color-text-primary, currentColor)">
                        {car.label}
                      </text>
                      <text
                        x={shaftX + 20}
                        y={svgH - 1}
                        textAnchor="middle"
                        fontSize={8.5}
                        fill="var(--color-text-secondary)"
                        style={{fontFamily: 'ui-monospace, monospace'}}>
                        {car.device}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VIOLATION CURE STEPPER — vertical <ol>, 3 × 44px rows; 20px discs joined
// by 2×24px connectors; deadline pill pinned right of the CURRENT step,
// danger ≤14 days, omitted once the AOC is filed. Second instance renders
// the fully-cured historical violation in the all-done state.
// ---------------------------------------------------------------------------

interface StepDef {
  label: string;
  sublabel: string;
}

interface ViolationCureStepperProps {
  steps: StepDef[];
  currentIndex: number; // steps before it are done; === length → all done
  daysRemainingNum: number;
  daysRemainingDisplay: string;
}

function ViolationCureStepper({
  steps,
  currentIndex,
  daysRemainingNum,
  daysRemainingDisplay,
}: ViolationCureStepperProps) {
  return (
    <ol style={styles.stepperOl}>
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const disc: CSSProperties = {
          width: 20,
          height: 20,
          borderRadius: 999,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          backgroundColor: isDone ? BRAND_FILL : 'transparent',
          border: isDone
            ? 'none'
            : isCurrent
              ? `2px solid ${BRAND_FILL}`
              : 'var(--border-width) solid var(--color-border)',
          color: DISC_TEXT,
        };
        const showDeadline = isCurrent && currentIndex < 2 && daysRemainingNum > 0;
        return (
          <li
            key={step.label}
            style={styles.stepRow}
            aria-current={isCurrent ? 'step' : undefined}>
            <span style={styles.stepDiscWrap}>
              <span style={disc} aria-hidden={!isDone}>
                {isDone ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
              </span>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    ...styles.stepConnector,
                    backgroundColor: isDone ? BRAND_FILL : 'var(--color-border)',
                  }}
                />
              )}
            </span>
            <VStack gap={0}>
              <span style={{fontSize: 13, fontWeight: isCurrent ? 600 : 500}}>
                {step.label}
              </span>
              <span style={{fontSize: 11, color: 'var(--color-text-secondary)'}}>
                {step.sublabel}
              </span>
            </VStack>
            {showDeadline && (
              <span
                style={{
                  ...styles.deadlinePill,
                  color: daysRemainingNum <= 14 ? DANGER_RED : WARN_STRONG,
                  borderColor: daysRemainingNum <= 14 ? DANGER_RED : WARN_STRONG,
                  backgroundColor: daysRemainingNum <= 14 ? DANGER_SOFT : WARN_SOFT,
                }}>
                {daysRemainingDisplay}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// BUILDING RAIL — 300 / 260 / 64. 44px rows; the x/y compliance chip is
// DERIVED per building and must sum to the meter-strip chips; the pinned
// footer ('6 buildings · 17 cars') derives from the same rows
// (bottom-left corner owner).
// ---------------------------------------------------------------------------

interface RailStats {
  compliant: number;
  total: number;
  worst: CarStatus;
}

interface BuildingRailProps {
  cars: Car[];
  selectedBuildingId: string | null;
  onSelectBuilding: (id: string | null) => void;
  isTight: boolean; // < 760px: 64px initials chips + status-dot badge
  hideAddress: boolean; // mid band: name + chip only
}

function railStatsFor(cars: Car[], buildingId: string): RailStats {
  const own = cars.filter(c => c.buildingId === buildingId);
  let worst: CarStatus = 'compliant';
  for (const car of own) {
    if (STATUS_ORDER.indexOf(car.status) > STATUS_ORDER.indexOf(worst)) {
      worst = car.status;
    }
  }
  return {compliant: own.filter(c => c.status === 'compliant').length, total: own.length, worst};
}

function BuildingRail({
  cars,
  selectedBuildingId,
  onSelectBuilding,
  isTight,
  hideAddress,
}: BuildingRailProps) {
  return (
    <nav
      style={{...styles.rail, width: isTight ? RAIL_W_TIGHT : hideAddress ? RAIL_W_MID : RAIL_W}}
      aria-label="Buildings">
      <div style={styles.railRows}>
        {BUILDINGS.map(building => {
          const stats = railStatsFor(cars, building.id);
          const isSelected = selectedBuildingId === building.id;
          const chipColor =
            stats.worst === 'inViolation'
              ? DANGER_RED
              : stats.compliant === stats.total
                ? OK_GREEN
                : WARN_STRONG;
          return (
            <button
              key={building.id}
              type="button"
              className="ecc-focusable"
              title={building.address != null ? `${building.name} · ${building.address}` : building.name}
              aria-pressed={isSelected}
              style={{
                ...styles.railRow,
                ...(isSelected ? styles.railRowSelected : null),
                ...(isTight ? {justifyContent: 'center', padding: 0} : null),
              }}
              onClick={() => onSelectBuilding(isSelected ? null : building.id)}>
              <span style={styles.railInitials} aria-hidden>
                {building.initials}
                {isTight && (
                  <span
                    style={{
                      ...styles.railBadge,
                      backgroundColor: STATUS_META[stats.worst].fill,
                    }}
                  />
                )}
              </span>
              {!isTight && (
                <>
                  <span style={{minWidth: 0, display: 'flex', flexDirection: 'column'}}>
                    <span style={styles.railName}>{building.name}</span>
                    {!hideAddress && (
                      <span style={styles.railMeta}>
                        {building.address != null
                          ? `${building.address} · ${building.banksNote}`
                          : building.banksNote}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      ...styles.railChip,
                      color: chipColor,
                      borderColor: chipColor,
                    }}>
                    {stats.compliant}/{stats.total}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
      <div style={styles.railFooter}>
        {isTight
          ? `${cars.length}`
          : `${BUILDINGS.length} buildings · ${cars.length} cars`}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// SCHEDULE TABLE — 36px rows. Mid band drops the Building column; tight
// also drops CAT5. Every property is an affordance: rows select, status
// Tokens set the schedule filter, mini bands select on zone click.
// ---------------------------------------------------------------------------

interface ScheduleTableProps {
  cars: Car[];
  totalCount: number;
  entities: Record<string, Entity>;
  selectedCarId: string | null;
  band: Band;
  scheduleFilter: CarStatus | null;
  onSelectCar: (id: string, invoker: HTMLElement) => void;
  onFilter: (status: CarStatus | null) => void;
}

function ScheduleTable({
  cars,
  totalCount,
  entities,
  selectedCarId,
  band,
  scheduleFilter,
  onSelectCar,
  onFilter,
}: ScheduleTableProps) {
  // Column subtraction per band, sized to the real center width: at the
  // stage band the center column is only ~400px (rail 260 + aside 320 +
  // gutters), so mid drops Building AND CAT5 (CAT5 stays in the aside
  // facts); narrow regains CAT5 (the aside has left the flow); tight keeps
  // Car/Status/CAT1/band. Mid budget must clear a ~404px card: fixed
  // 104+92+76 + 3×8 gaps + 24 row pad + band min 80 = 400, so the band's
  // rounded right cap always lands inside the 12px row padding.
  const hasBuildingCol = band === 'wide';
  const hasCat5Col = band === 'wide' || band === 'narrow';
  const gridTemplateColumns =
    band === 'wide'
      ? '148px minmax(110px, 1fr) 104px 86px 86px minmax(150px, 230px)'
      : band === 'narrow'
        ? '128px 100px 84px 84px minmax(120px, 1fr)'
        : band === 'mid'
          ? '104px 92px 76px minmax(80px, 1fr)'
          : '104px 92px 76px minmax(90px, 1fr)';
  const columnGap = band === 'mid' || band === 'tight' ? 8 : 12;
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
        <Heading level={2} style={{fontSize: 14}}>
          CAT1 / CAT5 test schedule
        </Heading>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {cars.length} of {totalCount} cars
        </Text>
      </div>
      <div role="grid" aria-label="Test schedule">
        <div role="row" style={{...styles.tableHeaderRow, gridTemplateColumns, columnGap}}>
          <span role="columnheader" style={styles.headCell}>Car</span>
          {hasBuildingCol && (
            <span role="columnheader" style={styles.headCell}>Building</span>
          )}
          <span role="columnheader" style={styles.headCell}>Status</span>
          <span role="columnheader" style={styles.headCell}>CAT1 due</span>
          {hasCat5Col && (
            <span role="columnheader" style={styles.headCell}>CAT5 due</span>
          )}
          <span role="columnheader" style={styles.headCell}>Regulatory window</span>
        </div>
        {cars.map(car => {
          const building = BUILDING_BY_ID.get(car.buildingId);
          const violation = openViolationForCar(entities, car.id);
          const meta = STATUS_META[car.status];
          const isSelected = car.id === selectedCarId;
          const isOverdue = car.cat1Due.num < FIXTURE_TODAY_NUM;
          return (
            <div
              key={car.id}
              id={`ecc-row-${car.id}`}
              role="row"
              tabIndex={0}
              className="ecc-focusable"
              aria-selected={isSelected}
              aria-label={`${car.label}, device ${car.device}, ${building?.name ?? ''}, ${meta.label}, CAT1 due ${car.cat1Due.display}`}
              style={{
                ...styles.tableRow,
                gridTemplateColumns,
                columnGap,
                ...(isSelected ? styles.tableRowSelected : null),
              }}
              onClick={event => onSelectCar(car.id, event.currentTarget)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectCar(car.id, event.currentTarget);
                }
              }}>
              <span role="gridcell" style={styles.cellMain}>
                <span style={{...styles.cellText, fontWeight: 600}}>{car.label}</span>
                <span style={styles.cellMono}>{car.device}</span>
              </span>
              {hasBuildingCol && (
                <span role="gridcell" style={styles.cellMain}>
                  <span style={styles.cellText}>{building?.name}</span>
                </span>
              )}
              <span role="gridcell" style={styles.cellMain}>
                <Token
                  size="sm"
                  color={meta.tokenColor}
                  label={meta.label}
                  onClick={() => onFilter(scheduleFilter === car.status ? null : car.status)}
                />
                {violation?.status === 'aoc-filed' && (
                  <Token size="sm" color="blue" label="AOC filed" />
                )}
              </span>
              <span
                role="gridcell"
                style={{...styles.cellDate, color: isOverdue ? DANGER_RED : undefined}}>
                {car.cat1Due.display}
              </span>
              {hasCat5Col && (
                <span role="gridcell" style={styles.cellDate}>
                  {car.cat5Due.display}
                </span>
              )}
              <span role="gridcell" style={{minWidth: 0}}>
                <ComplianceWindowBand
                  compact
                  zones={zonesForCar(car, violation)}
                  todayNum={FIXTURE_TODAY_NUM}
                  cutoffNum={violation != null ? violation.cureDeadline.num : undefined}
                  ariaLabel={`Regulatory window for ${car.label}`}
                  onZoneClick={() => {
                    const row = document.getElementById(`ecc-row-${car.id}`);
                    if (row != null) onSelectCar(car.id, row);
                  }}
                />
              </span>
            </div>
          );
        })}
        {cars.length === 0 && (
          <div style={styles.emptyWrap}>
            <EmptyState
              isCompact
              icon={<Icon icon={ShieldCheckIcon} size="lg" />}
              title="No cars match"
              description="No cars carry this status in the current scope."
              actions={<Button label="Clear filter" size="sm" onClick={() => onFilter(null)} />}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DETAIL ASIDE — 380 / 320 / 380px overlay. Identity header, the full-size
// ComplianceWindowBand (always visible so the Log-CAT1 ripple lands here),
// certificate/violation tabs, and the sticky 56px action footer
// (bottom-right corner owner).
// ---------------------------------------------------------------------------

type AsideTab = 'certificate' | 'violation';

interface DetailAsideProps {
  entities: Record<string, Entity>;
  car: Car | null;
  building: Building | null; // building-summary mode when car == null
  cars: Car[];
  tab: AsideTab;
  band: Band;
  isOverlay: boolean;
  onTabChange: (tab: AsideTab) => void;
  onSelectCar: (id: string, invoker: HTMLElement) => void;
  onSelectBuilding: (id: string) => void;
  onLogCat1: (car: Car) => void;
  onFileAoc: (violation: Violation) => void;
  onClose?: () => void;
  footerButtonRef: RefObject<HTMLDivElement | null>;
}

function FactRow({label, value, danger}: {label: string; value: string; danger?: boolean}) {
  return (
    <div style={styles.factRow}>
      <span style={styles.factLabel}>{label}</span>
      <span style={{...styles.factValue, color: danger ? DANGER_RED : undefined}}>{value}</span>
    </div>
  );
}

function DetailAside({
  entities,
  car,
  building,
  cars,
  tab,
  band,
  isOverlay,
  onTabChange,
  onSelectCar,
  onSelectBuilding,
  onLogCat1,
  onFileAoc,
  onClose,
  footerButtonRef,
}: DetailAsideProps) {
  const width = isOverlay ? undefined : band === 'wide' ? ASIDE_W : ASIDE_W_MID;
  // Tick labels show at the wide band only (mid band hides the 16px
  // tick-label row; legend collapses to dots).
  const showLabels = band === 'wide' && !isOverlay;
  const openVio = car != null ? openViolationForCar(entities, car.id) : undefined;
  const curedVio = car != null ? curedViolationForCar(entities, car.id) : undefined;
  const carBuilding = car != null ? BUILDING_BY_ID.get(car.buildingId) : null;

  let footer: {label: string; disabled: boolean; onClick: () => void; caption: string} | null =
    null;
  if (car != null) {
    if (openVio != null && openVio.cureStep === 1) {
      footer = {
        label: 'File AOC',
        disabled: false,
        onClick: () => onFileAoc(openVio),
        caption: `Deadline ${openVio.cureDeadline.display}`,
      };
    } else if (openVio != null && openVio.cureStep >= 2) {
      footer = {
        label: 'Awaiting DOB acceptance',
        disabled: true,
        onClick: () => {},
        caption: `AOC filed ${FIXTURE_TODAY_DISPLAY}`,
      };
    } else {
      footer = {
        label: 'Log CAT1 test',
        disabled: false,
        onClick: () => onLogCat1(car),
        caption:
          openVio != null
            ? `Cure by ${openVio.cureDeadline.display}`
            : `Next CAT1 ${car.cat1Due.display}`,
      };
    }
  }

  const cureSteps: StepDef[] | null =
    car != null && openVio != null
      ? [
          {
            label: 'CAT1 test performed',
            sublabel:
              openVio.cureStep > 0
                ? `Performed ${car.lastCat1.display} · M. Okafor (QEI-2214)`
                : `Perform by ${openVio.cureDeadline.display} · QEI required`,
          },
          {
            label: 'AOC filed with DOB',
            sublabel:
              openVio.cureStep > 1
                ? `Filed ${FIXTURE_TODAY_DISPLAY}`
                : openVio.cureStep === 1
                  ? 'AOC ready to file'
                  : 'Requires completed CAT1',
          },
          {
            label: 'AOC accepted — violation cured',
            sublabel: openVio.cureStep > 2 ? 'Accepted by DOB' : 'DOB review pending',
          },
        ]
      : null;

  return (
    <section
      style={{...styles.aside, width, ...(isOverlay ? {height: '100%'} : null)}}
      aria-label="Detail">
      <div style={styles.asideHeader}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            {car != null ? (
              <VStack gap={0}>
                <HStack gap={2} vAlign="center">
                  <Heading level={2} style={{fontSize: 15}}>
                    {car.label}
                  </Heading>
                  <span style={styles.cellMono}>{car.device}</span>
                  <Token
                    size="sm"
                    color={STATUS_META[car.status].tokenColor}
                    label={STATUS_META[car.status].label}
                  />
                </HStack>
                <button
                  type="button"
                  className="ecc-focusable"
                  style={{...styles.dobNumber, fontFamily: 'inherit', fontWeight: 500, alignSelf: 'flex-start'}}
                  onClick={() => onSelectBuilding(car.buildingId)}>
                  {carBuilding?.name} · {car.kind}
                </button>
              </VStack>
            ) : building != null ? (
              <VStack gap={0}>
                <Heading level={2} style={{fontSize: 15}}>
                  {building.name}
                </Heading>
                <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                  {building.address != null
                    ? `${building.address} · ${building.banksNote}`
                    : building.banksNote}
                </Text>
              </VStack>
            ) : (
              <Heading level={2} style={{fontSize: 15}}>
                Portfolio
              </Heading>
            )}
          </StackItem>
          {onClose != null && (
            <Button
              label="Close detail"
              variant="ghost"
              size="sm"
              isIconOnly
              icon={<Icon icon={XIcon} size="sm" />}
              onClick={onClose}
            />
          )}
        </HStack>
      </div>

      {car != null ? (
        <>
          <div style={{padding: '12px 12px 8px', flexShrink: 0}}>
            <ComplianceWindowBand
              zones={zonesForCar(car, openVio)}
              todayNum={FIXTURE_TODAY_NUM}
              cutoffNum={openVio != null ? openVio.cureDeadline.num : undefined}
              showLabels={showLabels}
              ariaLabel={`Certificate valid to ${car.certValidTo.display}; ${
                car.graceEnd != null ? `grace ends ${car.graceEnd.display}; ` : 'no grace period; '
              }today ${FIXTURE_TODAY_DISPLAY}`}
              onZoneClick={kind => {
                if (kind === 'violation') onTabChange('violation');
              }}
            />
            <div style={{...styles.legendRow, marginTop: showLabels ? 4 : 8}}>
              {(['valid', 'dueWindow', 'grace', 'violation'] as ZoneKind[]).map(kind => (
                <span key={kind} style={styles.legendItem} title={ZONE_META[kind].label}>
                  <span
                    style={{
                      ...styles.legendSwatch,
                      backgroundColor: ZONE_META[kind].fill,
                      backgroundImage: kind === 'grace' ? ZONE_GRACE_HATCH : undefined,
                      borderColor: ZONE_META[kind].border,
                    }}
                  />
                  {/* Mid band: legend collapses to dots (title attr keeps names) */}
                  {band === 'wide' && !isOverlay ? ZONE_META[kind].label : null}
                </span>
              ))}
            </div>
          </div>
          <div style={styles.asideTabs} role="tablist" aria-label="Detail sections">
            <button
              type="button"
              role="tab"
              id="ecc-tab-certificate"
              aria-selected={tab === 'certificate'}
              aria-controls="ecc-panel-certificate"
              className="ecc-focusable"
              style={tab === 'certificate' ? {...styles.tabBtn, ...styles.tabBtnActive} : styles.tabBtn}
              onClick={() => onTabChange('certificate')}>
              Certificate
            </button>
            <button
              type="button"
              role="tab"
              id="ecc-tab-violation"
              aria-selected={tab === 'violation'}
              aria-controls="ecc-panel-violation"
              className="ecc-focusable"
              style={tab === 'violation' ? {...styles.tabBtn, ...styles.tabBtnActive} : styles.tabBtn}
              onClick={() => onTabChange('violation')}>
              Violations
              {openVio != null && (
                <span
                  style={{
                    minWidth: 16,
                    height: 16,
                    borderRadius: 999,
                    backgroundColor: DANGER_RED,
                    color: DISC_TEXT,
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  1
                </span>
              )}
            </button>
          </div>
          <div
            style={styles.asideScroll}
            role="tabpanel"
            id={`ecc-panel-${tab}`}
            aria-labelledby={`ecc-tab-${tab}`}>
            {tab === 'certificate' ? (
              <VStack gap={0}>
                {openVio != null && (
                  <div style={{marginBottom: 8}}>
                    <Token
                      size="sm"
                      color="red"
                      icon={<Icon icon={CircleAlertIcon} size="xsm" color="inherit" />}
                      label={`Open violation ${openVio.dobNumber}`}
                      onClick={() => onTabChange('violation')}
                    />
                  </div>
                )}
                <FactRow
                  label="Certificate of inspection"
                  value={`${car.certValidFrom.display} – ${car.certValidTo.display}`}
                />
                <FactRow
                  label="CAT1 (annual) due"
                  value={car.cat1Due.display}
                  danger={car.cat1Due.num < FIXTURE_TODAY_NUM}
                />
                <FactRow label="CAT5 (full-load) due" value={car.cat5Due.display} />
                <FactRow label="Last CAT1 performed" value={car.lastCat1.display} />
                {car.graceEnd != null ? (
                  <FactRow label="Grace period ends" value={car.graceEnd.display} />
                ) : (
                  <FactRow label="Grace period" value="None — freight class" />
                )}
                <FactRow label="Inspector of record" value="M. Okafor · QEI-2214" />
                <FactRow label="DOB device" value={car.device} />
              </VStack>
            ) : openVio != null && cureSteps != null ? (
              <div style={styles.vioCard}>
                <HStack gap={2} vAlign="center">
                  <Icon icon={CircleAlertIcon} size="sm" color="inherit" style={{color: DANGER_RED}} />
                  <Tooltip content="Opens the DOB BIS record">
                    <button type="button" className="ecc-focusable" style={styles.dobNumber}>
                      {openVio.dobNumber}
                    </button>
                  </Tooltip>
                  <StackItem size="fill">
                    <span />
                  </StackItem>
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    Issued {openVio.issued.display}
                  </Text>
                </HStack>
                <Text type="label" size="sm">
                  {openVio.violationClass}
                </Text>
                <Text type="supporting" size="xsm" color="secondary">
                  {openVio.prose}
                </Text>
                <Divider />
                <ViolationCureStepper
                  steps={cureSteps}
                  currentIndex={openVio.cureStep}
                  daysRemainingNum={openVio.daysRemainingNum}
                  daysRemainingDisplay={openVio.daysRemainingDisplay}
                />
              </div>
            ) : curedVio != null ? (
              <div style={styles.vioCardCured}>
                <HStack gap={2} vAlign="center">
                  <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
                  <span style={styles.dobNumber as CSSProperties}>{curedVio.dobNumber}</span>
                  <StackItem size="fill">
                    <span />
                  </StackItem>
                  <Token size="sm" color="green" label="Cured" />
                </HStack>
                <Text type="supporting" size="xsm" color="secondary">
                  {curedVio.prose}
                </Text>
                <Divider />
                <ViolationCureStepper
                  steps={[
                    {label: 'CAT1 test performed', sublabel: 'Performed Jul 28, 2025 · M. Okafor'},
                    {label: 'AOC filed with DOB', sublabel: 'Filed Jul 30, 2025'},
                    {label: 'AOC accepted — violation cured', sublabel: 'Accepted Aug 3, 2025'},
                  ]}
                  currentIndex={3}
                  daysRemainingNum={0}
                  daysRemainingDisplay="Cured"
                />
              </div>
            ) : (
              <div style={styles.emptyWrap}>
                <EmptyState
                  isCompact
                  icon={<Icon icon={ShieldCheckIcon} size="lg" />}
                  title="No open violations"
                  description="All certificates current for this car."
                />
              </div>
            )}
          </div>
        </>
      ) : building != null ? (
        <div style={styles.asideScroll}>
          <Text type="supporting" size="xsm" color="secondary">
            {(() => {
              const stats = railStatsFor(cars, building.id);
              return `${stats.compliant} of ${stats.total} cars compliant`;
            })()}
          </Text>
          <VStack gap={0}>
            {cars
              .filter(c => c.buildingId === building.id)
              .map(c => (
                <button
                  key={c.id}
                  type="button"
                  className="ecc-focusable"
                  style={{...styles.factRow, width: '100%', background: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit', textAlign: 'left', border: 'none', borderBottom: 'var(--border-width) solid var(--color-border)', padding: 0}}
                  onClick={event => onSelectCar(c.id, event.currentTarget)}>
                  <StatusDot
                    variant={STATUS_META[c.status].dotVariant}
                    label={STATUS_META[c.status].label}
                  />
                  <span style={{...styles.cellText, fontWeight: 600}}>{c.label}</span>
                  <span style={styles.cellMono}>{c.device}</span>
                  <span style={styles.factValue}>CAT1 {c.cat1Due.display}</span>
                </button>
              ))}
          </VStack>
          {building.id === BLDG_MERCER && (
            <div style={styles.emptyWrap}>
              <EmptyState
                isCompact
                icon={<Icon icon={ShieldCheckIcon} size="lg" />}
                title="No open violations"
                description="All certificates current."
              />
            </div>
          )}
        </div>
      ) : (
        <div style={styles.emptyWrap}>
          <EmptyState
            isCompact
            icon={<Icon icon={Building2Icon} size="lg" />}
            title="Nothing selected"
            description="Pick a building from the rail or a car from the schedule."
          />
        </div>
      )}

      {footer != null && car != null && (
        <div style={styles.asideFooter}>
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            {footer.caption}
          </Text>
          <StackItem size="fill">
            <span />
          </StackItem>
          {/* Focus stays on this (relabeled) button after Log CAT1 — the
              wrapper div is stable across the label swap. */}
          <div ref={footerButtonRef}>
            <Button
              label={footer.label}
              variant="primary"
              size="sm"
              isDisabled={footer.disabled}
              icon={<Icon icon={FileTextIcon} size="sm" />}
              onClick={footer.onClick}
            />
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner. ONE flat Record<string, Car | Violation>
// plus {selectedBuildingId, selectedCarId, scheduleFilter}; the only
// mutator is update(id, patch). Every aggregate on screen derives from the
// record in render.
// ---------------------------------------------------------------------------

export default function ElevatorComplianceConsoleTemplate() {
  const [entities, setEntities] = useState<Record<string, Entity>>(() => INITIAL_ENTITIES);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(CAR_HH_2);
  const [scheduleFilter, setScheduleFilter] = useState<CarStatus | null>(null);
  const [asideTab, setAsideTab] = useState<AsideTab>('violation');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const update = useCallback(
    (id: string, patch: Partial<Car> | Partial<Violation>) =>
      setEntities(prev => ({...prev, [id]: {...prev[id], ...patch} as Entity})),
    [],
  );

  // Container-width bands (see responsive contract in the header comment).
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const viewWidth = useElementWidth(viewRootRef);
  const isViewportMid = useMediaQuery('(max-width: 1179px)');
  const isViewportNarrow = useMediaQuery('(max-width: 979px)');
  const isViewportTight = useMediaQuery('(max-width: 759px)');
  const band: Band =
    viewWidth > 0
      ? bandFor(viewWidth)
      : isViewportTight
        ? 'tight'
        : isViewportNarrow
          ? 'narrow'
          : isViewportMid
            ? 'mid'
            : 'wide';
  const isAsideInFlow = band === 'wide' || band === 'mid';

  const lastInvokerRef = useRef<HTMLElement | null>(null);
  const footerButtonRef = useRef<HTMLDivElement | null>(null);

  const cars = useMemo(() => Object.values(entities).filter(isCar), [entities]);
  const counts = statusCounts(cars);
  const selectedCar =
    selectedCarId != null && isCar(entities[selectedCarId]!)
      ? (entities[selectedCarId] as Car)
      : null;
  const selectedBuilding =
    selectedBuildingId != null ? (BUILDING_BY_ID.get(selectedBuildingId) ?? null) : null;

  // Diagram scope: explicit building, else the selected car's building.
  const diagramBuildingId = selectedBuildingId ?? selectedCar?.buildingId ?? BLDG_QPS;
  const diagramBuilding = BUILDING_BY_ID.get(diagramBuildingId)!;
  const diagramCars = cars.filter(c => c.buildingId === diagramBuildingId);

  const scopedCars =
    selectedBuildingId != null ? cars.filter(c => c.buildingId === selectedBuildingId) : cars;
  const visibleCars =
    scheduleFilter != null ? scopedCars.filter(c => c.status === scheduleFilter) : scopedCars;

  const selectCar = useCallback(
    (id: string, invoker: HTMLElement) => {
      lastInvokerRef.current = invoker;
      setSelectedCarId(id);
      const vio = openViolationForCar(entities, id);
      setAsideTab(vio != null ? 'violation' : 'certificate');
      if (!isAsideInFlow) setIsOverlayOpen(true);
    },
    [entities, isAsideInFlow],
  );

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    lastInvokerRef.current?.focus();
  }, []);

  const handleSelectBuilding = useCallback((id: string | null) => {
    setSelectedBuildingId(id);
    setSelectedCarId(null);
    if (id != null) setIsOverlayOpen(true);
  }, []);

  // SIGNATURE RIPPLE — one beat through update(): band re-derives, shaft
  // dot flips danger→success, rail chip 1/3→2/3, meter 71%→76%, stepper
  // advances, footer button relabels to 'File AOC' (focus stays on it).
  const logCat1 = useCallback(
    (car: Car) => {
      const patch: Partial<Car> = {...LOGGED_CAT1_PATCH};
      if (car.graceEnd != null) {
        patch.graceEnd = LOGGED_CAT1_GRACE; // freight keeps its no-grace path
      }
      update(car.id, patch);
      const vio = openViolationForCar(entities, car.id);
      if (vio != null && vio.cureStep === 0) {
        update(vio.id, {cureStep: 1});
      }
      const building = BUILDING_BY_ID.get(car.buildingId)!;
      const stats = railStatsFor(cars, car.buildingId);
      const wasCompliant = car.status === 'compliant';
      const nextBuildingCompliant = stats.compliant + (wasCompliant ? 0 : 1);
      const nextPortfolio = Math.round(
        ((counts.compliant + (wasCompliant ? 0 : 1)) / cars.length) * 100,
      );
      setAnnouncement(
        `CAT1 logged for ${car.label} at ${building.name} — building now ${nextBuildingCompliant} of ${stats.total} compliant, portfolio ${nextPortfolio} percent.`,
      );
    },
    [cars, counts.compliant, entities, update],
  );

  const fileAoc = useCallback(
    (violation: Violation) => {
      update(violation.id, {cureStep: 2, status: 'aoc-filed'});
      setAnnouncement(
        `AOC filed with DOB for violation ${violation.dobNumber} — awaiting acceptance.`,
      );
    },
    [update],
  );

  // Escape layering: overlay sheet → schedule filter → car selection.
  // Typing-target guard keeps the shortcut away from form fields.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]') != null) {
        return;
      }
      if (!isAsideInFlow && isOverlayOpen) {
        setIsOverlayOpen(false);
        lastInvokerRef.current?.focus();
      } else if (scheduleFilter != null) {
        setScheduleFilter(null);
      } else if (selectedCarId != null) {
        setSelectedCarId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAsideInFlow, isOverlayOpen, scheduleFilter, selectedCarId]);

  const asideNode = (
    <DetailAside
      entities={entities}
      car={selectedCar}
      building={selectedCar == null ? selectedBuilding : null}
      cars={cars}
      tab={asideTab}
      band={band}
      isOverlay={!isAsideInFlow}
      onTabChange={setAsideTab}
      onSelectCar={selectCar}
      onSelectBuilding={id => handleSelectBuilding(id)}
      onLogCat1={logCat1}
      onFileAoc={fileAoc}
      onClose={!isAsideInFlow ? closeOverlay : undefined}
      footerButtonRef={footerButtonRef}
    />
  );

  return (
    <div style={styles.root}>
      <style>{CONSOLE_CSS}</style>
      {/* One polite live region announces mutations portfolio-wide. */}
      <div aria-live="polite" style={styles.srOnly}>
        {announcement}
      </div>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0}>
            <VStack gap={0}>
              <div style={styles.headerBar}>
                <LiftledgerMark />
                <div style={styles.wordmarkBlock}>
                  <span style={styles.wordmark}>Liftledger</span>
                  <span style={styles.wordmarkCaption}>Marlowe Property Group</span>
                </div>
                <div style={styles.headerRight}>
                  <Token
                    size="sm"
                    color="default"
                    icon={<Icon icon={CalendarClockIcon} size="xsm" color="inherit" />}
                    label={`As of ${FIXTURE_TODAY_DISPLAY}`}
                  />
                  {band !== 'tight' && (
                    <span style={styles.inspectorChip}>
                      <Avatar name="Maya Okafor" size="small" />
                      <Text type="supporting" size="xsm" color="secondary">
                        M. Okafor · QEI-2214
                      </Text>
                    </span>
                  )}
                </div>
              </div>
              <ComplianceMeterStrip
                counts={counts}
                total={cars.length}
                filter={scheduleFilter}
                onFilter={setScheduleFilter}
                isTight={band === 'tight'}
              />
            </VStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} style={styles.viewRoot}>
              <BuildingRail
                cars={cars}
                selectedBuildingId={selectedBuildingId}
                onSelectBuilding={handleSelectBuilding}
                isTight={band === 'tight'}
                hideAddress={band !== 'wide'}
              />
              <div style={styles.mainCol}>
                <div
                  style={
                    band === 'tight'
                      ? {...styles.filterRow, ...styles.filterRowScroll}
                      : styles.filterRow
                  }>
                  {selectedBuilding != null ? (
                    <button
                      type="button"
                      className="ecc-focusable"
                      style={styles.chipBtn}
                      onClick={() => handleSelectBuilding(null)}>
                      <Icon icon={Building2Icon} size="xsm" color="secondary" />
                      <span
                        style={{
                          maxWidth: 180,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                        {selectedBuilding.name}
                      </span>
                      <Icon icon={XIcon} size="xsm" color="secondary" />
                    </button>
                  ) : (
                    <Text type="supporting" size="xsm" color="secondary">
                      All buildings
                    </Text>
                  )}
                  {scheduleFilter != null && (
                    <button
                      type="button"
                      className="ecc-focusable"
                      style={{
                        ...styles.chipBtn,
                        borderColor: STATUS_META[scheduleFilter].fill,
                        color: STATUS_META[scheduleFilter].fill,
                      }}
                      onClick={() => setScheduleFilter(null)}>
                      <TriangleFilterGlyph />
                      {STATUS_META[scheduleFilter].label}
                      <Icon icon={XIcon} size="xsm" color="inherit" />
                    </button>
                  )}
                  <span style={styles.filterCaption}>
                    {visibleCars.length} of {cars.length} cars
                  </span>
                </div>
                <div style={styles.scrollRegion}>
                  <ShaftBankDiagram
                    building={diagramBuilding}
                    cars={diagramCars}
                    selectedCarId={selectedCarId}
                    onSelectCar={selectCar}
                  />
                  <ScheduleTable
                    cars={visibleCars}
                    totalCount={cars.length}
                    entities={entities}
                    selectedCarId={selectedCarId}
                    band={band}
                    scheduleFilter={scheduleFilter}
                    onSelectCar={selectCar}
                    onFilter={setScheduleFilter}
                  />
                </div>
              </div>
              {isAsideInFlow && asideNode}
              {!isAsideInFlow && isOverlayOpen && (selectedCar != null || selectedBuilding != null) && (
                <div style={styles.overlayPanel}>{asideNode}</div>
              )}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}

/** Tiny inline filter glyph — keeps the chip at Token scale. */
function TriangleFilterGlyph() {
  return (
    <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden>
      <path d="M1 1 H9 L6 5.5 V9 L4 8 V5.5 Z" fill="currentColor" />
    </svg>
  );
}



