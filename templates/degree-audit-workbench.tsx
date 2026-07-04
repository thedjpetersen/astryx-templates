// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Laurel registrar-side degree
 *   audit for Priya Raghunathan (ID L-2024-88117, B.S. Biology, catalog
 *   2023–2024, advisor A. Whitfield): a 120-credit requirement tree that
 *   sums exactly (18+12+4+12+12+30+32=120), 78 placed credits that sum
 *   exactly (14+8+4+9+7+21+15=78), four transfer articulations whose
 *   fragment splits reconcile to their source credits (3+1=4, 4+1=5, 3,
 *   2+1+1=4), an 8-row unassigned tray, two declared no-double-count
 *   exclusivity arcs, and a three-ticket exceptions rail. No clocks, no
 *   randomness, no network media — every date is a fixed string.
 * @output Degree Audit Workbench — the advisor board where completed
 *   courses and transfer-credit fragments are dragged from an unassigned
 *   tray into a live requirement-satisfaction tree. Every drop is a
 *   constraint solve: ALL / n-of-m gates and credit pools recompute per
 *   node, exclusivity arcs auto-vacate the prior bucket on a cross-arc
 *   move (amber notice), pool overflow routes surplus credits to Free
 *   Electives, and the 44px header ring plus the remaining-credit figure
 *   react to every placement. Catalog-year switch re-evaluates every gate
 *   while keeping placements. EXC-1057 Approve places all three GEOL 1403
 *   fragments at once (78 → 82 cr, ring 65.0% → 68.3%).
 * @position Page template; emitted by `astryx template degree-audit-workbench`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (64px brand bar: LaurelMark 28, student identity, ProgressRing
 *   44 + credit figures, catalog Selector, Exceptions pill below 1000px)
 *   | content: view root (flex, height 100%, minHeight 0, overflow hidden)
 *     > left tray aside 320 (own scroll) > center tree (fluid, own scroll,
 *     position:relative for the arc SVG overlay) > right exceptions rail
 *     300 (own scroll).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. Tray rows, tree nodes, and rail tickets are styled divs; the
 *   asides are plain flex children (widths are band-driven, so no
 *   LayoutPanel).
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   LAUREL_GREEN #2E7D4F; brand FILL vs brand TEXT are split values
 *   (--brand-text is #1F5A38 on light ≥7:1 on white, #7CC79A on dark);
 *   raw brand green is used only as fills/strokes, never as small text.
 *   Amber/red notice literals and term-dot data-viz categorical tokens
 *   carry the repo-standard light-dark fallbacks. Transitions animate
 *   transform/opacity/color (plus the ring's stroke-dashoffset sweep, the
 *   one spec-mandated exception) and collapse under prefers-reduced-motion.
 *
 * Responsive contract — bands key off CONTAINER width via
 * useElementWidth(viewRootRef), never the viewport (the demo stage is a
 * ~1045–1075px container inside a 1440px window; viewport queries are the
 * first-frame fallback only). Subtraction, not reflow:
 * - >= 1180px: 320 / fluid / 300 three columns; chips show code + short
 *   title + credits; arc midpoint labels visible.
 * - 1000–1179px (DEMO BAND — must read complete): tray 280, rail 280,
 *   center >= 485; chips truncate to code + credits; arc labels hide
 *   (hover/tooltip only).
 * - 820–999px: rail collapses into an overlay sheet toggled by the header
 *   "Exceptions (3)" pill (pending-count dot); two columns 280 / fluid.
 * - < 820px: tray becomes a 56px horizontal chip shelf under the header;
 *   single-column tree; ExclusivityArcs hidden, replaced by per-node lock
 *   badges naming the arc partner.
 */

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type RefObject,
} from 'react';

import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleDashedIcon,
  CornerDownRightIcon,
  LockIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Popover} from '@astryxdesign/core/Popover';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue).
// ---------------------------------------------------------------------------

// THE one quarantined brand literal (spec hex). Used as a runtime value in
// the brand pairs below — never referenced anywhere else.
const LAUREL_GREEN = '#2E7D4F';
// Brand FILL — behind white 12px+ bold text or as strokes only.
const BRAND_FILL = `light-dark(${LAUREL_GREEN}, #3C9663)`;
// Brand TEXT — #1F5A38 on white is ~8.2:1; #7CC79A on the dark canvas is
// ~7.9:1. All green text on this page uses this pair, never the raw fill.
const BRAND_TEXT = 'light-dark(#1F5A38, #7CC79A)';
// Brand SOFT wash for satisfied-node fills and drop highlights.
const BRAND_SOFT = 'light-dark(#E7F2EB, #14261B)';
// Amber notice (exclusivity auto-vacate) — #92400E on light is 4.9:1.
const AMBER_TEXT = 'light-dark(#92400E, #FBBF24)';
const AMBER_SOFT = 'light-dark(rgba(217, 119, 6, 0.10), rgba(251, 191, 36, 0.14))';
const AMBER_LINE = 'light-dark(#D97706, #FBBF24)';
// Red notice (double-count blocked) + denied tickets — #B91C1C is 5.9:1.
const RED_TEXT = 'light-dark(#B91C1C, #F87171)';
const RED_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
// Term dots — data-viz categorical tokens with repo-standard fallbacks,
// keyed by academic year so chips from one year share a dot.
const DOT_2024 = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const DOT_2025 = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
const DOT_2026 = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const DOT_TRANSFER = 'var(--color-data-categorical-orange, light-dark(#B45309, #F59E0B))';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, hover states on dense custom rows, and the
// reduced-motion guard. Transitions animate transform/opacity/color (plus
// the ring's stroke-dashoffset sweep).
// ---------------------------------------------------------------------------

const DAW_CSS = `
.daw-focusable:focus-visible {
  outline: 2px solid ${BRAND_TEXT};
  outline-offset: 2px;
}
.daw-chip { transition: background-color 120ms ease, color 120ms ease, box-shadow 120ms ease; }
.daw-chip:hover { background-color: var(--color-background-muted); }
.daw-trayrow:hover { background-color: var(--color-background-muted); }
.daw-ring { transition: stroke-dashoffset 300ms ease; }
.daw-meter { transition: transform 300ms ease; }
.daw-arc { transition: opacity 120ms ease; }
@media (prefers-reduced-motion: reduce) {
  .daw-chip, .daw-ring, .daw-meter, .daw-arc { transition: none !important; }
}
`;

// ---------------------------------------------------------------------------
// STYLES — density grid, verbatim from spec: 4px base grid. Header bar 64px
// fixed. Left tray aside 320px, right exceptions rail 300px, center tree
// fluid. Tray row 44px; tree node row min-height 40px (grows when chips
// wrap); CourseChip 28px tall; rail card padding 12px; panel padding 16px;
// section gap 12px; inline gap 8px; chip gap 6px. Type scale: 11px
// meta/timestamps, 12px labels+gate badges, 13px body+chip text, 15px
// requirement-node titles, 18px student name. ProgressRing 44px diameter,
// 5px stroke. CreditMeter 4px tall. ExclusivityArc stroke 1.5px dashed,
// 8px corner-rounded elbows.
//
// Corner map (decided up front): panels, rail cards, popovers 10px; tree
// nodes 8px; CourseChip, buttons, inputs, segmented control 6px; gate
// badges, status pills, tray count badge 999px full pill; left/right
// asides square (0) where flush to the frame edges; ProgressRing and
// ExclusivityArc are strokes (n/a); drop-target highlight ring 8px
// matching the node radius.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // Header bar: 64px fixed.
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 64,
    padding: '0 16px',
    boxSizing: 'border-box',
  },
  brandBlock: {display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0},
  brandName: {fontSize: 15, fontWeight: 700, color: BRAND_TEXT, whiteSpace: 'nowrap'},
  brandSub: {fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  headerRule: {
    width: 1,
    height: 32,
    backgroundColor: 'var(--color-border)',
    flexShrink: 0,
  },
  studentName: {fontSize: 18, fontWeight: 650, lineHeight: '22px', whiteSpace: 'nowrap'},
  studentMeta: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  ringBlock: {display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0},
  ringPct: {fontSize: 11, fontWeight: 650, fontVariantNumeric: 'tabular-nums'},
  creditsMain: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  creditsSub: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // View root — the container the ResizeObserver bands key off.
  viewRoot: {
    display: 'flex',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  // Left tray aside: 320px (280 in the demo band); square corners — flush
  // to the frame edge. Panel padding 16px.
  tray: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    flexShrink: 0,
    borderInlineEnd: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
  },
  trayHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '16px 16px 12px',
  },
  trayTitleRow: {display: 'flex', alignItems: 'center', gap: 8},
  // Tray count badge — full pill (999px).
  countPill: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 18,
    padding: '0 6px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    backgroundColor: BRAND_SOFT,
    color: BRAND_TEXT,
  },
  trayScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 16px 16px'},
  // Tray row 44px.
  trayRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    padding: '4px 4px',
    borderRadius: 6,
  },
  trayRowMeta: {
    marginLeft: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
  trayMetaText: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
  // < 820px: tray becomes a 56px horizontal chip shelf under the header.
  trayShelf: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 56,
    padding: '0 16px',
    overflowX: 'auto',
    overflowY: 'hidden',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  // Center tree column.
  main: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    position: 'relative',
  },
  // Tree wrapper: position:relative anchors the absolutely positioned arc
  // SVG; paddingLeft 26 reserves the arc gutter (arc 1 elbows at x=8,
  // arc 2 at x=32 inside the child indent).
  treeWrap: {
    position: 'relative',
    padding: '16px 16px 24px 26px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12, // section gap 12px
  },
  arcSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'visible',
  },
  arcLabel: {
    fontSize: 11,
    fill: 'var(--color-text-secondary)',
  },
  // Tree node card: 8px radius; min-height 40px header row.
  nodeCard: {
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: '0 8px 8px',
  },
  nodeCardSatisfied: {backgroundColor: BRAND_SOFT, borderColor: BRAND_FILL},
  nodeCardDrop: {boxShadow: `0 0 0 2px ${BRAND_FILL}`},
  nodeCardHighlight: {boxShadow: `0 0 0 2px ${BRAND_TEXT}`},
  nodeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8, // inline gap 8px
    minHeight: 40,
    flexWrap: 'wrap',
    paddingTop: 4,
  },
  nodeTitle: {fontSize: 15, fontWeight: 650, whiteSpace: 'nowrap'},
  nodeCredits: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    marginLeft: 'auto',
  },
  surplusText: {color: AMBER_TEXT, fontSize: 12, whiteSpace: 'nowrap'},
  chevronBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    padding: 0,
    border: 'none',
    borderRadius: 6,
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  // Gate badge: 12px text, full pill.
  gateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    padding: '0 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    background: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  gateBadgeOk: {
    borderColor: BRAND_FILL,
    backgroundColor: BRAND_SOFT,
    color: BRAND_TEXT,
  },
  lockPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    padding: '0 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    color: AMBER_TEXT,
    backgroundColor: AMBER_SOFT,
    whiteSpace: 'nowrap',
  },
  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6, // chip gap 6px
    padding: '2px 0 8px',
  },
  // CourseChip: 28px tall, 6px radius, 13px text.
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    padding: '0 8px',
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    fontSize: 13,
    fontFamily: 'inherit',
    color: 'var(--color-text)',
    cursor: 'grab',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  chipInProgress: {borderStyle: 'dashed', cursor: 'default', color: 'var(--color-text-secondary)'},
  chipDim: {opacity: 0.55},
  chipCode: {fontWeight: 600, whiteSpace: 'nowrap'},
  chipTitle: {
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 140,
  },
  chipCredits: {
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  termDot: {width: 6, height: 6, borderRadius: 999, flexShrink: 0},
  fragTick: {display: 'inline-flex', color: AMBER_TEXT, flexShrink: 0},
  // CreditMeter: 4px tall, full node width minus 16px padding.
  meterTrack: {
    position: 'relative',
    height: 4,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    margin: '0 0 4px',
  },
  meterFill: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    backgroundColor: BRAND_FILL,
    transformOrigin: 'left center',
  },
  meterNotch: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 6,
    height: 4,
    backgroundColor: AMBER_LINE,
  },
  // Empty-state slot (Global Perspectives 0/3).
  emptySlot: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    padding: '0 8px',
    borderRadius: 6,
    border: '1px dashed var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
  },
  childBlock: {display: 'flex', flexDirection: 'column', gap: 8, marginLeft: 20, paddingBottom: 8},
  // Right exceptions rail: 300px (280 demo band); square where flush.
  rail: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    flexShrink: 0,
    borderInlineStart: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
  },
  railScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 16, // panel padding 16px
    display: 'flex',
    flexDirection: 'column',
    gap: 12, // section gap 12px
  },
  // Rail ticket card: padding 12px, radius 10px.
  railCard: {
    borderRadius: 10,
    border: 'var(--border-width) solid var(--color-border)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  railCardDenied: {opacity: 0.6},
  railMeta: {fontSize: 11, color: 'var(--color-text-secondary)'},
  railTitle: {fontSize: 13, fontWeight: 600, lineHeight: '18px'},
  excIdBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: 0,
    border: 'none',
    background: 'transparent',
    fontSize: 11,
    fontWeight: 650,
    fontFamily: 'var(--font-family-code, monospace)',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  noticeCard: {
    borderRadius: 10,
    padding: 12,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 12,
    lineHeight: '17px',
  },
  noticeAmber: {backgroundColor: AMBER_SOFT, color: AMBER_TEXT},
  noticeRed: {backgroundColor: RED_SOFT, color: RED_TEXT},
  noticeDismiss: {
    marginLeft: 'auto',
    display: 'inline-flex',
    padding: 2,
    border: 'none',
    borderRadius: 6,
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    flexShrink: 0,
  },
  // 820–999px: exceptions overlay sheet (non-modal complementary panel).
  sheet: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 300,
    zIndex: 20,
    backgroundColor: 'var(--color-background-card)',
    borderInlineStart: 'var(--border-width) solid var(--color-border)',
    boxShadow: 'var(--shadow-overlay, 0 8px 24px rgba(0,0,0,0.18))',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  // Popover body (10px radius comes from the DS overlay).
  popBody: {padding: 12, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 280},
  popMeta: {fontSize: 11, color: 'var(--color-text-secondary)'},
  popActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '6px 8px',
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'var(--color-background-card)',
    fontSize: 13,
    fontFamily: 'inherit',
    color: 'var(--color-text)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  popActionDisabled: {cursor: 'not-allowed', color: 'var(--color-text-secondary)'},
  // Articulation split row (tray): bracket glyph + fragment lines.
  splitRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '8px 4px',
    borderRadius: 6,
  },
  splitFragLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginLeft: 18,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
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
// DATA — one deterministic world: Laurel (registrar degree-audit platform).
// Student Priya Raghunathan, ID L-2024-88117, B.S. Biology, catalog
// 2023–2024, advisor A. Whitfield. Degree 120 cr; placed 78; remaining 42;
// ring 78/120 = 65.0%. Every aggregate below cross-checks by law:
//   requirements 18+12+4+12+12+30+32 = 120
//   placed       14+8+4+9+7+21+15   = 78
//   splits       3+1=4 · 4+1=5 · 3 · 2+1+1=4
// All figures on screen DERIVE from these rows — never stored twice.
// ---------------------------------------------------------------------------

type CatalogYear = '2022-2023' | '2023-2024' | '2024-2025';

interface CatalogDef {
  label: string;
  tracksChoose: 1 | 2; // tracks to satisfy (each track = 6 cr)
  listBCredits: number;
  freeCredits: number;
}

// Each catalog sums to 120:
//   2022–2023: 18+12+4+ 6+12+30+38 = 120 (Tracks choose 1-of-3)
//   2023–2024: 18+12+4+12+12+30+32 = 120 (default)
//   2024–2025: 18+12+4+12+15+30+29 = 120 (List B 15 cr)
const CATALOGS: Record<CatalogYear, CatalogDef> = {
  '2022-2023': {label: '2022–2023', tracksChoose: 1, listBCredits: 12, freeCredits: 38},
  '2023-2024': {label: '2023–2024', tracksChoose: 2, listBCredits: 12, freeCredits: 32},
  '2024-2025': {label: '2024–2025', tracksChoose: 2, listBCredits: 15, freeCredits: 29},
};

const CATALOG_OPTIONS = (Object.keys(CATALOGS) as CatalogYear[]).map(year => ({
  value: year,
  label: `Catalog ${CATALOGS[year].label}`,
}));

const DEGREE_CREDITS = 120;

// Node identity consts.
const NODE_CORE = 'core';
const NODE_CHEM = 'chem';
const NODE_QUANT = 'quant';
const NODE_TRACKS = 'tracks';
const NODE_TRACK_A = 'trackA';
const NODE_TRACK_B = 'trackB';
const NODE_TRACK_C = 'trackC';
const NODE_LIST_B = 'listB';
const NODE_GENED = 'gened';
const NODE_COMP = 'comp';
const NODE_HUM = 'hum';
const NODE_SOCSCI = 'socsci';
const NODE_ARTS = 'arts';
const NODE_GLOBAL = 'global';
const NODE_FREE = 'free';

type GateKind = 'all' | 'oneOf' | 'nOfM' | 'pool' | 'credits' | 'chooseTracks' | 'group';

interface RequirementNode {
  id: string;
  title: string;
  gate: GateKind;
  /** Course slots for all / nOfM / oneOf gates. */
  slots?: string[];
  /** n for nOfM / oneOf gates. */
  need?: number;
  /** Fixed required credits (catalog-independent nodes). */
  credits?: number;
  ruleText: string;
  children?: RequirementNode[];
  emptyHint?: string;
}

// REQUIREMENTS — 2023–2024 shape; List B / Tracks-choose / Free Electives
// figures come from the active catalog at evaluation time.
const REQUIREMENT_TREE: RequirementNode[] = [
  {
    id: NODE_CORE,
    title: 'Core Biology',
    gate: 'all',
    slots: ['BIO 101', 'BIO 102', 'BIO 210', 'BIO 250', 'BIO 301'],
    credits: 18,
    ruleText: 'All 5 core courses required — BIO 101(3), 102(4), 210(4), 250(3), 301(4) = 18 cr.',
  },
  {
    id: NODE_CHEM,
    title: 'Chemistry Sequence',
    gate: 'all',
    slots: ['CHEM 111', 'CHEM 112', 'CHEM 235'],
    credits: 12,
    ruleText: 'All 3 chemistry courses required — CHEM 111(4), 112(4), 235(4) = 12 cr.',
  },
  {
    id: NODE_QUANT,
    title: 'Quantitative Reasoning',
    gate: 'oneOf',
    slots: ['MATH 151', 'STAT 201'],
    need: 1,
    credits: 4,
    ruleText: 'Any 1 of 2 — MATH 151(4) or STAT 201(4). Once satisfied the gate locks.',
  },
  {
    id: NODE_TRACKS,
    title: 'Concentration Tracks',
    gate: 'chooseTracks',
    ruleText: 'Choose 2 of 3 tracks under catalog 2023–2024 (1 of 3 under 2022–2023); each track is 2 of 3 courses at 3 cr = 6 cr.',
    children: [
      {
        id: NODE_TRACK_A,
        title: 'Track A · Ecology',
        gate: 'nOfM',
        slots: ['BIO 320', 'BIO 322', 'BIO 425'],
        need: 2,
        credits: 6,
        ruleText: 'Any 2 of 3 — BIO 320, BIO 322, BIO 425 (3 cr each). BIO 322 accepted per EXC-1041.',
      },
      {
        id: NODE_TRACK_B,
        title: 'Track B · Molecular',
        gate: 'nOfM',
        slots: ['BIO 330', 'BIO 332', 'BIO 430'],
        need: 2,
        credits: 6,
        ruleText: 'Any 2 of 3 — BIO 330, BIO 332, BIO 430 (3 cr each).',
      },
      {
        id: NODE_TRACK_C,
        title: 'Track C · Physiology',
        gate: 'nOfM',
        slots: ['BIO 340', 'BIO 342', 'BIO 440'],
        need: 2,
        credits: 6,
        ruleText: 'Any 2 of 3 — BIO 340, BIO 342, BIO 440 (3 cr each).',
      },
    ],
  },
  {
    id: NODE_LIST_B,
    title: 'List B Pool',
    gate: 'pool',
    // 8 listed options; BIO 332 / BIO 340 / BIO 425 are shared with the
    // Concentration Tracks (Arc 1) — the wrapped-chip-row stress node.
    slots: ['BIO 315', 'BIO 350', 'BIO 360', 'BIO 410', 'BIO 415', 'BIO 332', 'BIO 340', 'BIO 425'],
    ruleText: '12 cr from the List B course list (15 cr under catalog 2024–2025). Overflow routes to Free Electives; no double count with Tracks (Arc 1).',
  },
  {
    id: NODE_GENED,
    title: 'General Education',
    gate: 'group',
    credits: 30,
    ruleText: '30 cr total — Composition 6, Humanities 9, Social Science 9, Arts 3, Global Perspectives 3.',
    children: [
      {
        id: NODE_COMP,
        title: 'Composition',
        gate: 'all',
        slots: ['ENGL 110', 'ENGL 210'],
        credits: 6,
        ruleText: 'Both composition courses required — ENGL 110(3), ENGL 210(3).',
      },
      {
        id: NODE_HUM,
        title: 'Humanities',
        gate: 'credits',
        credits: 9,
        ruleText: '9 cr from the humanities distribution list.',
      },
      {
        id: NODE_SOCSCI,
        title: 'Social Science',
        gate: 'credits',
        credits: 9,
        ruleText: '9 cr from the social-science distribution list. No double count with Global Perspectives (Arc 2).',
      },
      {
        id: NODE_ARTS,
        title: 'Arts',
        gate: 'credits',
        credits: 3,
        ruleText: '3 cr from the arts distribution list.',
      },
      {
        id: NODE_GLOBAL,
        title: 'Global Perspectives',
        gate: 'credits',
        credits: 3,
        ruleText: '3 cr with the global-perspectives attribute. No double count with Social Science (Arc 2).',
        // Stress fixture (d): the empty-state bucket with a dashed slot.
        emptyHint: 'Drop a Global Perspectives course — 3 cr needed',
      },
    ],
  },
  {
    id: NODE_FREE,
    title: 'Free Electives',
    gate: 'credits',
    ruleText: '32 cr of free electives under catalog 2023–2024 (38 under 2022–2023, 29 under 2024–2025). Pool surplus credits land here.',
  },
];

const NODE_BY_ID: Record<string, RequirementNode> = {};
const NODE_PARENT: Record<string, string | null> = {};
for (const node of REQUIREMENT_TREE) {
  NODE_BY_ID[node.id] = node;
  NODE_PARENT[node.id] = null;
  for (const child of node.children ?? []) {
    NODE_BY_ID[child.id] = child;
    NODE_PARENT[child.id] = node.id;
  }
}

// Course identity consts (referenced from interaction comments).
const COURSE_BIO301 = 'crs-bio301';
const COURSE_BIO332 = 'crs-bio332';
const COURSE_BIO340 = 'crs-bio340';
const COURSE_BIO415 = 'crs-bio415';
const COURSE_ANTH120 = 'crs-anth120';
const COURSE_STAT201 = 'crs-stat201';
const COURSE_CHEM235 = 'crs-chem235';
const COURSE_GEOL_FRAG_A = 'crs-geol-frag-a';
const COURSE_GEOL_FRAG_B = 'crs-geol-frag-b';
const COURSE_GEOL_FRAG_C = 'crs-geol-frag-c';

type CourseSource = 'native' | 'transfer' | 'in-progress';

interface CourseFixture {
  id: string;
  code: string;
  title: string;
  credits: number;
  creditsLabel: string; // dual field
  term: string; // machine form, e.g. '2025FA'
  termLabel: string; // dual field, e.g. 'Fall 2025'
  grade: string | null;
  gradePoints: number | null; // dual field
  source: CourseSource;
  /** For transfer fragments: which articulation row produced this chip. */
  articulationId?: string;
  transferNote?: string;
  eligibleNodeIds: string[];
  initialPlacedIn: string | null;
  /** GEOL fragments stay invisible until EXC-1057 is approved. */
  isPendingFragment?: boolean;
}

const COURSES: CourseFixture[] = [
  // --- PLACED · Core Biology 14/18 (3+4+4+3; BIO 301 slot open) ---
  {id: 'crs-bio101-frag', code: 'BIO 101', title: 'General Biology I', credits: 3, creditsLabel: '3 cr', term: '2023TR', termLabel: 'Transfer · Fall 2023', grade: 'T', gradePoints: null, source: 'transfer', articulationId: 'art-biol1408', transferNote: '3 cr of BIOL 1408 · Austin CC', eligibleNodeIds: [NODE_CORE], initialPlacedIn: NODE_CORE},
  {id: 'crs-bio102', code: 'BIO 102', title: 'General Biology II', credits: 4, creditsLabel: '4 cr', term: '2024FA', termLabel: 'Fall 2024', grade: 'A-', gradePoints: 3.7, source: 'native', eligibleNodeIds: [NODE_CORE], initialPlacedIn: NODE_CORE},
  {id: 'crs-bio210', code: 'BIO 210', title: 'Cell Biology', credits: 4, creditsLabel: '4 cr', term: '2025SP', termLabel: 'Spring 2025', grade: 'B+', gradePoints: 3.3, source: 'native', eligibleNodeIds: [NODE_CORE], initialPlacedIn: NODE_CORE},
  {id: 'crs-bio250', code: 'BIO 250', title: 'Genetics', credits: 3, creditsLabel: '3 cr', term: '2025FA', termLabel: 'Fall 2025', grade: 'A', gradePoints: 4.0, source: 'native', eligibleNodeIds: [NODE_CORE], initialPlacedIn: NODE_CORE},
  // --- PLACED · Chemistry 8/12 (4+4; CHEM 235 open) ---
  {id: 'crs-chem111-frag', code: 'CHEM 111', title: 'General Chemistry I', credits: 4, creditsLabel: '4 cr', term: '2023TR', termLabel: 'Transfer · Spring 2024', grade: 'T', gradePoints: null, source: 'transfer', articulationId: 'art-chem1411', transferNote: '4 cr of CHEM 1411 · Houston CC', eligibleNodeIds: [NODE_CHEM], initialPlacedIn: NODE_CHEM},
  {id: 'crs-chem112', code: 'CHEM 112', title: 'General Chemistry II', credits: 4, creditsLabel: '4 cr', term: '2025SP', termLabel: 'Spring 2025', grade: 'B', gradePoints: 3.0, source: 'native', eligibleNodeIds: [NODE_CHEM], initialPlacedIn: NODE_CHEM},
  // --- PLACED · Quantitative 4/4 — the gate STAT 201 finds locked ---
  {id: 'crs-math151', code: 'MATH 151', title: 'Calculus I', credits: 4, creditsLabel: '4 cr', term: '2024FA', termLabel: 'Fall 2024', grade: 'B+', gradePoints: 3.3, source: 'native', eligibleNodeIds: [NODE_QUANT], initialPlacedIn: NODE_QUANT},
  // --- PLACED · Tracks 9/12 (Track A 6 satisfied; Track B 3 partial) ---
  {id: 'crs-bio320', code: 'BIO 320', title: 'Ecology', credits: 3, creditsLabel: '3 cr', term: '2025FA', termLabel: 'Fall 2025', grade: 'A-', gradePoints: 3.7, source: 'native', eligibleNodeIds: [NODE_TRACK_A], initialPlacedIn: NODE_TRACK_A},
  {id: 'crs-bio322', code: 'BIO 322', title: 'Field Ecology', credits: 3, creditsLabel: '3 cr', term: '2025FA', termLabel: 'Fall 2025', grade: 'B+', gradePoints: 3.3, source: 'native', eligibleNodeIds: [NODE_TRACK_A], initialPlacedIn: NODE_TRACK_A},
  {id: 'crs-bio330', code: 'BIO 330', title: 'Molecular Biology', credits: 3, creditsLabel: '3 cr', term: '2025SP', termLabel: 'Spring 2025', grade: 'A', gradePoints: 4.0, source: 'native', eligibleNodeIds: [NODE_TRACK_B], initialPlacedIn: NODE_TRACK_B},
  // --- PLACED · List B 7/12 (3+4) ---
  {id: 'crs-bio315', code: 'BIO 315', title: 'Microbiology', credits: 3, creditsLabel: '3 cr', term: '2025SP', termLabel: 'Spring 2025', grade: 'B+', gradePoints: 3.3, source: 'native', eligibleNodeIds: [NODE_LIST_B], initialPlacedIn: NODE_LIST_B},
  {id: 'crs-bio350', code: 'BIO 350', title: 'Biochemistry Survey', credits: 4, creditsLabel: '4 cr', term: '2025FA', termLabel: 'Fall 2025', grade: 'B', gradePoints: 3.0, source: 'native', eligibleNodeIds: [NODE_LIST_B], initialPlacedIn: NODE_LIST_B},
  // --- PLACED · Gen Ed 21/30 (Comp 6 ✓ · Hum 6 · SocSci 6 · Arts 3 ✓ · Global 0) ---
  {id: 'crs-engl110', code: 'ENGL 110', title: 'Composition I', credits: 3, creditsLabel: '3 cr', term: '2024FA', termLabel: 'Fall 2024', grade: 'A', gradePoints: 4.0, source: 'native', eligibleNodeIds: [NODE_COMP], initialPlacedIn: NODE_COMP},
  {id: 'crs-engl210', code: 'ENGL 210', title: 'Composition II', credits: 3, creditsLabel: '3 cr', term: '2025SP', termLabel: 'Spring 2025', grade: 'A-', gradePoints: 3.7, source: 'native', eligibleNodeIds: [NODE_COMP], initialPlacedIn: NODE_COMP},
  {id: 'crs-hist121', code: 'HIST 121', title: 'World History to 1500', credits: 3, creditsLabel: '3 cr', term: '2024FA', termLabel: 'Fall 2024', grade: 'B+', gradePoints: 3.3, source: 'native', eligibleNodeIds: [NODE_HUM], initialPlacedIn: NODE_HUM},
  {id: 'crs-phil105', code: 'PHIL 105', title: 'Introduction to Ethics', credits: 3, creditsLabel: '3 cr', term: '2025SP', termLabel: 'Spring 2025', grade: 'A', gradePoints: 4.0, source: 'native', eligibleNodeIds: [NODE_HUM], initialPlacedIn: NODE_HUM},
  {id: 'crs-psyc2301-frag', code: 'PSYC 2301', title: 'Introduction to Psychology', credits: 3, creditsLabel: '3 cr', term: '2023TR', termLabel: 'Transfer · Fall 2023', grade: 'T', gradePoints: null, source: 'transfer', articulationId: 'art-psyc2301', transferNote: '3 cr of PSYC 2301 · Austin CC (applied whole)', eligibleNodeIds: [NODE_SOCSCI, NODE_GLOBAL], initialPlacedIn: NODE_SOCSCI},
  {id: 'crs-econ101', code: 'ECON 101', title: 'Principles of Microeconomics', credits: 3, creditsLabel: '3 cr', term: '2025FA', termLabel: 'Fall 2025', grade: 'B', gradePoints: 3.0, source: 'native', eligibleNodeIds: [NODE_SOCSCI], initialPlacedIn: NODE_SOCSCI},
  {id: 'crs-art100', code: 'ART 100', title: 'Art Appreciation', credits: 3, creditsLabel: '3 cr', term: '2024FA', termLabel: 'Fall 2024', grade: 'A', gradePoints: 4.0, source: 'native', eligibleNodeIds: [NODE_ARTS], initialPlacedIn: NODE_ARTS},
  // --- PLACED · Free Electives 15/32 (1+1+4+4+3+2) ---
  {id: 'crs-biol1408-frag', code: 'BIOL 1408', title: 'General Biology I with Lab (remainder)', credits: 1, creditsLabel: '1 cr', term: '2023TR', termLabel: 'Transfer · Fall 2023', grade: 'T', gradePoints: null, source: 'transfer', articulationId: 'art-biol1408', transferNote: '1 cr remainder of BIOL 1408 · Austin CC', eligibleNodeIds: [NODE_FREE], initialPlacedIn: NODE_FREE},
  {id: 'crs-chem1411-frag', code: 'CHEM 1411', title: 'General Chemistry I (remainder)', credits: 1, creditsLabel: '1 cr', term: '2023TR', termLabel: 'Transfer · Spring 2024', grade: 'T', gradePoints: null, source: 'transfer', articulationId: 'art-chem1411', transferNote: '1 cr remainder of CHEM 1411 · Houston CC', eligibleNodeIds: [NODE_FREE], initialPlacedIn: NODE_FREE},
  {id: 'crs-span101', code: 'SPAN 101', title: 'Elementary Spanish I', credits: 4, creditsLabel: '4 cr', term: '2024FA', termLabel: 'Fall 2024', grade: 'A', gradePoints: 4.0, source: 'native', eligibleNodeIds: [NODE_FREE], initialPlacedIn: NODE_FREE},
  {id: 'crs-span102', code: 'SPAN 102', title: 'Elementary Spanish II', credits: 4, creditsLabel: '4 cr', term: '2025SP', termLabel: 'Spring 2025', grade: 'A-', gradePoints: 3.7, source: 'native', eligibleNodeIds: [NODE_FREE], initialPlacedIn: NODE_FREE},
  {id: 'crs-cs105', code: 'CS 105', title: 'Introduction to Computing', credits: 3, creditsLabel: '3 cr', term: '2025FA', termLabel: 'Fall 2025', grade: 'B+', gradePoints: 3.3, source: 'native', eligibleNodeIds: [NODE_FREE], initialPlacedIn: NODE_FREE},
  {id: 'crs-mus110', code: 'MUS 110', title: 'Concert Choir', credits: 2, creditsLabel: '2 cr', term: '2025SP', termLabel: 'Spring 2025', grade: 'A', gradePoints: 4.0, source: 'native', eligibleNodeIds: [NODE_FREE], initialPlacedIn: NODE_FREE},
  // --- TRAY (8 rows incl. the GEOL 1403 split row; badge derives to 8) ---
  {id: COURSE_BIO301, code: 'BIO 301', title: 'Evolutionary Biology', credits: 4, creditsLabel: '4 cr', term: '2026SP', termLabel: 'Spring 2026', grade: 'A', gradePoints: 4.0, source: 'native', eligibleNodeIds: [NODE_CORE], initialPlacedIn: null},
  {id: COURSE_BIO332, code: 'BIO 332', title: 'Recombinant DNA Techniques', credits: 3, creditsLabel: '3 cr', term: '2026SP', termLabel: 'Spring 2026', grade: 'B+', gradePoints: 3.3, source: 'native', eligibleNodeIds: [NODE_TRACK_B, NODE_LIST_B], initialPlacedIn: null},
  {id: COURSE_BIO340, code: 'BIO 340', title: 'Animal Physiology', credits: 3, creditsLabel: '3 cr', term: '2025FA', termLabel: 'Fall 2025', grade: 'A-', gradePoints: 3.7, source: 'native', eligibleNodeIds: [NODE_TRACK_C, NODE_LIST_B], initialPlacedIn: null},
  // Stress fixture (a): 63-char title exercising chip truncation + the
  // popover full-title path.
  {id: COURSE_BIO415, code: 'BIO 415', title: 'Molecular Genetics of Prokaryotic and Eukaryotic Model Systems', credits: 3, creditsLabel: '3 cr', term: '2026SP', termLabel: 'Spring 2026', grade: 'A', gradePoints: 4.0, source: 'native', eligibleNodeIds: [NODE_LIST_B], initialPlacedIn: null},
  {id: COURSE_ANTH120, code: 'ANTH 120', title: 'Cultural Anthropology', credits: 3, creditsLabel: '3 cr', term: '2026SP', termLabel: 'Spring 2026', grade: 'B', gradePoints: 3.0, source: 'native', eligibleNodeIds: [NODE_SOCSCI, NODE_GLOBAL], initialPlacedIn: null},
  // Lockout demo: Quant is already satisfied by MATH 151, so STAT 201 can
  // only land in Free Electives — the Quant node shows a lock pill mid-drag.
  {id: COURSE_STAT201, code: 'STAT 201', title: 'Statistical Methods', credits: 4, creditsLabel: '4 cr', term: '2025FA', termLabel: 'Fall 2025', grade: 'A-', gradePoints: 3.7, source: 'native', eligibleNodeIds: [NODE_QUANT, NODE_FREE], initialPlacedIn: null},
  // Stress fixture (h): registered next term — dashed chip, drag disabled.
  {id: COURSE_CHEM235, code: 'CHEM 235', title: 'Organic Chemistry I', credits: 4, creditsLabel: '4 cr', term: '2026FA', termLabel: 'Registered · Fall 2026', grade: null, gradePoints: null, source: 'in-progress', eligibleNodeIds: [NODE_CHEM], initialPlacedIn: null},
  // --- GEOL 1403 fragments — hidden until EXC-1057 is approved (2+1+1=4).
  // Laurel's B.S. Biology has no GEOL requirement, so the equivalency
  // fragments apply as Free Electives credit when the split is approved.
  {id: COURSE_GEOL_FRAG_A, code: 'GEOL 1403', title: 'Physical Geology → GEOL 101-equiv', credits: 2, creditsLabel: '2 cr', term: '2024TR', termLabel: 'Transfer · Fall 2024', grade: 'T', gradePoints: null, source: 'transfer', articulationId: 'art-geol1403', transferNote: '2 cr of GEOL 1403 · Austin CC → GEOL 101-equiv', eligibleNodeIds: [NODE_FREE], initialPlacedIn: null, isPendingFragment: true},
  {id: COURSE_GEOL_FRAG_B, code: 'GEOL 1403', title: 'Physical Geology → GEOL 101L-equiv', credits: 1, creditsLabel: '1 cr', term: '2024TR', termLabel: 'Transfer · Fall 2024', grade: 'T', gradePoints: null, source: 'transfer', articulationId: 'art-geol1403', transferNote: '1 cr of GEOL 1403 · Austin CC → GEOL 101L-equiv', eligibleNodeIds: [NODE_FREE], initialPlacedIn: null, isPendingFragment: true},
  {id: COURSE_GEOL_FRAG_C, code: 'GEOL 1403', title: 'Physical Geology → Free Electives', credits: 1, creditsLabel: '1 cr', term: '2024TR', termLabel: 'Transfer · Fall 2024', grade: 'T', gradePoints: null, source: 'transfer', articulationId: 'art-geol1403', transferNote: '1 cr of GEOL 1403 · Austin CC → Free Electives', eligibleNodeIds: [NODE_FREE], initialPlacedIn: null, isPendingFragment: true},
];

const COURSE_BY_ID: Record<string, CourseFixture> = {};
for (const course of COURSES) {
  COURSE_BY_ID[course.id] = course;
}

// Transfer articulations — every split sums to its source credits.
interface ArticulationFragment {
  credits: number;
  creditsLabel: string;
  destination: string;
}

interface Articulation {
  id: string;
  sourceCode: string;
  sourceTitle: string;
  institution: string;
  credits: number;
  creditsLabel: string;
  fragments: ArticulationFragment[]; // sums to credits by law
  status: 'applied' | 'pending';
}

const ARTICULATIONS: Articulation[] = [
  {id: 'art-biol1408', sourceCode: 'BIOL 1408', sourceTitle: 'General Biology I with Lab', institution: 'Austin CC', credits: 4, creditsLabel: '4 cr', fragments: [{credits: 3, creditsLabel: '3 cr', destination: 'BIO 101'}, {credits: 1, creditsLabel: '1 cr', destination: 'Free Electives'}], status: 'applied'},
  {id: 'art-chem1411', sourceCode: 'CHEM 1411', sourceTitle: 'General Chemistry I', institution: 'Houston CC', credits: 5, creditsLabel: '5 cr', fragments: [{credits: 4, creditsLabel: '4 cr', destination: 'CHEM 111'}, {credits: 1, creditsLabel: '1 cr', destination: 'Free Electives'}], status: 'applied'},
  {id: 'art-psyc2301', sourceCode: 'PSYC 2301', sourceTitle: 'Introduction to Psychology', institution: 'Austin CC', credits: 3, creditsLabel: '3 cr', fragments: [{credits: 3, creditsLabel: '3 cr', destination: 'Social Science'}], status: 'applied'},
  // Stress fixture (b): the 3-fragment maximum fan-out (2+1+1=4 ✓),
  // rendered as the ArticulationSplitRow in the tray while pending.
  {id: 'art-geol1403', sourceCode: 'GEOL 1403', sourceTitle: 'Physical Geology', institution: 'Austin CC', credits: 4, creditsLabel: '4 cr', fragments: [{credits: 2, creditsLabel: '2 cr', destination: 'GEOL 101-equiv'}, {credits: 1, creditsLabel: '1 cr', destination: 'GEOL 101L-equiv'}, {credits: 1, creditsLabel: '1 cr', destination: 'Free Electives'}], status: 'pending'},
];

const ARTICULATION_BY_ID: Record<string, Articulation> = {};
for (const articulation of ARTICULATIONS) {
  ARTICULATION_BY_ID[articulation.id] = articulation;
}

// Exclusivity arcs — declared in data, drawn by ExclusivityArcOverlay.
interface ExclusivityRule {
  id: string;
  nodeA: string; // top-level or leaf node id
  nodeB: string;
  label: string;
  sharedCodes: string[];
}

const ARCS: ExclusivityRule[] = [
  {id: 'arc-1', nodeA: NODE_TRACKS, nodeB: NODE_LIST_B, label: 'No double count', sharedCodes: ['BIO 332', 'BIO 340', 'BIO 425']},
  {id: 'arc-2', nodeA: NODE_SOCSCI, nodeB: NODE_GLOBAL, label: 'No double count', sharedCodes: ['ANTH 120', 'ANTH 205']},
];

/** Map a leaf node to its arc-relevant identity (track leaves → tracks). */
function arcNodeIdFor(nodeId: string): string {
  return NODE_PARENT[nodeId] === NODE_TRACKS ? NODE_TRACKS : nodeId;
}

/** The arc (if any) that spans two node identities. */
function arcBetween(nodeIdA: string, nodeIdB: string): ExclusivityRule | null {
  const a = arcNodeIdFor(nodeIdA);
  const b = arcNodeIdFor(nodeIdB);
  for (const arc of ARCS) {
    if ((arc.nodeA === a && arc.nodeB === b) || (arc.nodeA === b && arc.nodeB === a)) {
      return arc;
    }
  }
  return null;
}

// Exceptions rail — ticket-shaped.
const EXC_SUBSTITUTION = 'EXC-1041';
const EXC_GEOL_SPLIT = 'EXC-1057';
const EXC_WAIVER = 'EXC-1049';

type ExceptionStatus = 'approved' | 'pending' | 'denied';

interface ExceptionFixture {
  id: string;
  title: string;
  requestedBy: string;
  requestedOn: string;
  resolution?: string;
  initialStatus: ExceptionStatus;
}

const EXCEPTIONS: ExceptionFixture[] = [
  {id: EXC_SUBSTITUTION, title: 'Substitution: accept BIO 322 Field Ecology in place of BIO 321 for Track A', requestedBy: 'A. Whitfield', requestedOn: '2026-02-27', resolution: 'Approved · Registrar · 2026-03-12', initialStatus: 'approved'},
  // Approve places all 3 GEOL fragments: Free Electives 15→19, placed
  // 78→82, ring 65.0%→68.3% — the one-click multi-surface consequence.
  {id: EXC_GEOL_SPLIT, title: 'Apply GEOL 1403 split per articulation table v9', requestedBy: 'A. Whitfield', requestedOn: '2026-06-18', initialStatus: 'pending'},
  // Stress fixture (i): the muted denied-card variant.
  {id: EXC_WAIVER, title: 'Waive Global Perspectives via study-abroad petition', requestedBy: 'A. Whitfield', requestedOn: '2026-04-20', resolution: 'Denied · Registrar · 2026-05-02 — insufficient contact hours', initialStatus: 'denied'},
];

const STUDENT = {
  name: 'Priya Raghunathan',
  idLabel: 'L-2024-88117',
  program: 'B.S. Biology',
  advisor: 'Advisor A. Whitfield',
};

// ---------------------------------------------------------------------------
// STORE — the ONE state owner. Everything on screen derives from this via
// evaluateAudit(); aggregates are never stored.
// ---------------------------------------------------------------------------

interface Notice {
  tone: 'amber' | 'red';
  text: string;
}

interface AuditState {
  catalogYear: CatalogYear;
  /** Placement per course id — the only per-course mutable field. */
  courses: Record<string, {placedIn: string | null}>;
  exceptions: Record<string, ExceptionStatus>;
  lastNotice: Notice | null;
  /** aria-live=polite feed; every mutation writes one sentence. */
  liveMessage: string;
}

interface EntityPatch {
  placedIn?: string | null;
  exceptionStatus?: ExceptionStatus;
  catalogYear?: CatalogYear;
  /** Red "blocked" notice for an ineligible/locked drop — no data change. */
  blockedText?: string;
  dismissNotice?: boolean;
}

const INITIAL_STATE: AuditState = {
  catalogYear: '2023-2024',
  courses: Object.fromEntries(COURSES.map(course => [course.id, {placedIn: course.initialPlacedIn}])),
  exceptions: Object.fromEntries(EXCEPTIONS.map(exc => [exc.id, exc.initialStatus])),
  lastNotice: null,
  liveMessage: '',
};

// ---------------------------------------------------------------------------
// EVALUATION — pure selectors over AuditState. Gate satisfaction, node fill,
// pool surplus, ring %, and remaining credits all re-derive on every render.
// ---------------------------------------------------------------------------

type FillState = 'empty' | 'partial' | 'satisfied' | 'surplus';

interface NodeEvaluation {
  placed: CourseFixture[];
  rawCredits: number;
  required: number;
  /** Credits counted inside this node (min(raw, required)). */
  counted: number;
  /** Overflow routed to Free Electives (pools + gened children + tracks). */
  surplus: number;
  satisfied: boolean;
  fill: FillState;
  gateLabel: string; // badge text, e.g. 'ALL 5' · '1 of 2' · '12 cr'
  statusText: string; // e.g. '4 of 5 courses' · 'satisfied 1 of 2'
}

interface AuditEvaluation {
  byNode: Record<string, NodeEvaluation>;
  placedTotal: number;
  remaining: number;
  pct: number; // 0–100, one decimal
  pctLabel: string; // '65.0%'
  surplusToFree: number;
  trayCourses: CourseFixture[];
  pendingExceptions: number;
}

function requiredCreditsFor(node: RequirementNode, catalog: CatalogDef): number {
  if (node.id === NODE_LIST_B) return catalog.listBCredits;
  if (node.id === NODE_FREE) return catalog.freeCredits;
  if (node.id === NODE_TRACKS) return catalog.tracksChoose * 6;
  return node.credits ?? 0;
}

function gateLabelFor(node: RequirementNode, catalog: CatalogDef): string {
  switch (node.gate) {
    case 'all':
      return `ALL ${node.slots?.length ?? 0}`;
    case 'oneOf':
      return `${node.need ?? 1} of ${node.slots?.length ?? 0}`;
    case 'nOfM':
      return `${node.need ?? 0} of ${node.slots?.length ?? 0}`;
    case 'pool':
      return `${catalog.listBCredits} cr list`;
    case 'chooseTracks':
      return `choose ${catalog.tracksChoose} of 3`;
    default:
      return `${requiredCreditsFor(node, catalog)} cr`;
  }
}

function evaluateAudit(state: AuditState): AuditEvaluation {
  const catalog = CATALOGS[state.catalogYear];
  const byNode: Record<string, NodeEvaluation> = {};

  const placedIn = (nodeId: string): CourseFixture[] =>
    COURSES.filter(course => state.courses[course.id]?.placedIn === nodeId);

  const evalLeaf = (node: RequirementNode): NodeEvaluation => {
    const placed = placedIn(node.id);
    const rawCredits = placed.reduce((sum, c) => sum + c.credits, 0);
    const required = requiredCreditsFor(node, catalog);
    let satisfied: boolean;
    let statusText: string;
    switch (node.gate) {
      case 'all': {
        const slotCount = node.slots?.length ?? 0;
        satisfied = placed.length >= slotCount;
        statusText = `${placed.length} of ${slotCount} courses`;
        break;
      }
      case 'oneOf': {
        satisfied = placed.length >= (node.need ?? 1);
        statusText = satisfied ? `satisfied ${node.need ?? 1} of ${node.slots?.length ?? 0}` : `${placed.length} of ${node.need ?? 1} needed`;
        break;
      }
      case 'nOfM': {
        satisfied = placed.length >= (node.need ?? 0);
        statusText = `${placed.length} of ${node.need ?? 0} courses`;
        break;
      }
      default: {
        satisfied = rawCredits >= required;
        statusText = `${Math.min(rawCredits, required)} of ${required} cr`;
      }
    }
    // Leaf surplus only for the pool + gened children; core/chem/quant/track
    // slots are fixed-size so overflow cannot occur; free keeps its own raw.
    const canOverflow = node.gate === 'pool' || NODE_PARENT[node.id] === NODE_GENED;
    const surplus = canOverflow ? Math.max(0, rawCredits - required) : 0;
    const counted = Math.min(rawCredits, required);
    const fill: FillState =
      surplus > 0 ? 'surplus' : satisfied ? 'satisfied' : rawCredits > 0 || placed.length > 0 ? 'partial' : 'empty';
    return {placed, rawCredits, required, counted, surplus, satisfied, fill, gateLabel: gateLabelFor(node, catalog), statusText};
  };

  // Leaves first.
  for (const top of REQUIREMENT_TREE) {
    if (top.children != null) {
      for (const child of top.children) {
        byNode[child.id] = evalLeaf(child);
      }
    } else {
      byNode[top.id] = evalLeaf(top);
    }
  }

  // Tracks parent: choose k of 3 tracks; parent-level surplus so credits
  // never double-count between a track child and the parent figure.
  {
    const node = NODE_BY_ID[NODE_TRACKS];
    const children = node.children ?? [];
    const rawCredits = children.reduce((sum, c) => sum + byNode[c.id].rawCredits, 0);
    const required = requiredCreditsFor(node, catalog);
    const satisfiedTracks = children.filter(c => byNode[c.id].satisfied).length;
    const satisfied = satisfiedTracks >= catalog.tracksChoose;
    const surplus = Math.max(0, rawCredits - required);
    byNode[NODE_TRACKS] = {
      placed: [],
      rawCredits,
      required,
      counted: Math.min(rawCredits, required),
      surplus,
      satisfied,
      fill: surplus > 0 ? 'surplus' : satisfied ? 'satisfied' : rawCredits > 0 ? 'partial' : 'empty',
      gateLabel: gateLabelFor(node, catalog),
      statusText: `${satisfiedTracks} of ${catalog.tracksChoose} tracks`,
    };
  }

  // Gen Ed parent: sum of child counted credits against 30.
  {
    const node = NODE_BY_ID[NODE_GENED];
    const children = node.children ?? [];
    const rawCredits = children.reduce((sum, c) => sum + byNode[c.id].rawCredits, 0);
    const counted = children.reduce((sum, c) => sum + byNode[c.id].counted, 0);
    const required = requiredCreditsFor(node, catalog);
    const satisfied = children.every(c => byNode[c.id].satisfied);
    byNode[NODE_GENED] = {
      placed: [],
      rawCredits,
      required,
      counted: Math.min(counted, required),
      surplus: 0,
      satisfied,
      fill: satisfied ? 'satisfied' : counted > 0 ? 'partial' : 'empty',
      gateLabel: gateLabelFor(node, catalog),
      statusText: `${Math.min(counted, required)} of ${required} cr`,
    };
  }

  // Surplus routes to Free Electives: pool overflow + tracks overflow +
  // gened-child overflow all land in the free meter and the header math.
  const surplusToFree =
    byNode[NODE_LIST_B].surplus +
    byNode[NODE_TRACKS].surplus +
    (NODE_BY_ID[NODE_GENED].children ?? []).reduce((sum, c) => sum + byNode[c.id].surplus, 0);

  {
    const freeEval = byNode[NODE_FREE];
    const effective = freeEval.rawCredits + surplusToFree;
    const required = freeEval.required;
    const satisfied = effective >= required;
    byNode[NODE_FREE] = {
      ...freeEval,
      counted: Math.min(effective, required),
      satisfied,
      fill: satisfied ? 'satisfied' : effective > 0 ? 'partial' : 'empty',
      statusText: `${Math.min(effective, required)} of ${required} cr`,
    };
  }

  // Header figures — placedTotal counts every placed course exactly once
  // (surplus credits are already inside their course's raw credits).
  const placedTotal = COURSES.reduce(
    (sum, course) => (state.courses[course.id]?.placedIn != null ? sum + course.credits : sum),
    0,
  );
  const pct = Math.round((placedTotal / DEGREE_CREDITS) * 1000) / 10;
  const trayCourses = COURSES.filter(
    course => state.courses[course.id]?.placedIn == null && course.isPendingFragment !== true,
  );
  const pendingExceptions = EXCEPTIONS.filter(exc => state.exceptions[exc.id] === 'pending').length;

  return {
    byNode,
    placedTotal,
    remaining: DEGREE_CREDITS - placedTotal,
    pct,
    pctLabel: `${pct.toFixed(1)}%`,
    surplusToFree,
    trayCourses,
    pendingExceptions,
  };
}

/** oneOf gates lock once satisfied — the STAT 201 lockout demo. */
function isNodeLockedFor(course: CourseFixture, nodeId: string, evaluation: AuditEvaluation): boolean {
  const node = NODE_BY_ID[nodeId];
  if (node == null || node.gate !== 'oneOf') {
    return false;
  }
  const nodeEval = evaluation.byNode[nodeId];
  return nodeEval.satisfied && !nodeEval.placed.some(c => c.id === course.id);
}

// ---------------------------------------------------------------------------
// useElementWidth — ResizeObserver on the view root; all responsive bands
// key off CONTAINER width (the demo stage is ~1045–1075px inside a 1440px
// window, so viewport queries only serve the first pre-observer frame).
// ---------------------------------------------------------------------------

function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
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

type Band = 'wide' | 'demo' | 'sheet' | 'shelf';

// ---------------------------------------------------------------------------
// LaurelMark — single-path SVG: a three-quarter open ring swept by a
// five-leaf laurel sprig with leaf offshoots. Stroke only, brand fill pair.
// ---------------------------------------------------------------------------

function LaurelMark({size = 28}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path
        d={[
          // Three-quarter open ring (opens top-right).
          'M21.1 6.9 A10 10 0 1 0 21.1 21.1',
          // Sprig tail sweeping off the ring's lower-right opening.
          'M21.1 21.1 Q24.5 17.5 25.5 12.5',
          // Five leaf offshoots along the sweep.
          'M20.5 21.9 Q23.5 22.5 24.8 21.2',
          'M22.6 19.4 Q25.6 19.6 26.6 18.1',
          'M23.9 16.9 Q26.7 16.6 27.4 15.0',
          'M24.8 14.3 Q27.3 13.6 27.7 12.0',
          'M25.3 11.6 Q27.4 10.5 27.5 8.9',
        ].join(' ')}
        stroke={BRAND_FILL}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ProgressRing — 44px diameter, 5px stroke; 78/120 = 65.0% at load, 300ms
// sweep on change (collapses under prefers-reduced-motion via .daw-ring).
// ---------------------------------------------------------------------------

function ProgressRing({placed, pct, pctLabel}: {placed: number; pct: number; pctLabel: string}) {
  const radius = 19.5; // (44 - 5) / 2
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(pct, 100) / 100);
  return (
    <div
      role="img"
      aria-label={`${placed} of ${DEGREE_CREDITS} credits, ${pctLabel} complete`}
      style={{position: 'relative', width: 44, height: 44, flexShrink: 0}}>
      <svg width={44} height={44} viewBox="0 0 44 44">
        <circle cx={22} cy={22} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={5} />
        <circle
          className="daw-ring"
          cx={22}
          cy={22}
          r={radius}
          fill="none"
          stroke={BRAND_FILL}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span
        aria-hidden
        style={{
          ...styles.ringPct,
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CreditMeter — 4px fill bar per node (full node width minus 16px padding),
// scaleX transform animated 300ms; amber notch when a pool overflows.
// ---------------------------------------------------------------------------

function CreditMeter({counted, required, surplus}: {counted: number; required: number; surplus: number}) {
  const ratio = required > 0 ? Math.min(counted / required, 1) : 0;
  return (
    <div style={styles.meterTrack} aria-hidden>
      <div className="daw-meter" style={{...styles.meterFill, transform: `scaleX(${ratio})`}} />
      {surplus > 0 ? <div style={styles.meterNotch} /> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gate badge — 12px full pill; tooltip carries the rule text. Never
// color-only: satisfied adds a check glyph next to the text.
// ---------------------------------------------------------------------------

function GateBadge({label, ruleText, satisfied}: {label: string; ruleText: string; satisfied: boolean}) {
  return (
    <Tooltip content={ruleText}>
      <span style={satisfied ? {...styles.gateBadge, ...styles.gateBadgeOk} : styles.gateBadge}>
        {satisfied ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
        {label}
      </span>
    </Tooltip>
  );
}

function termDotColor(term: string): string {
  if (term.endsWith('TR')) return DOT_TRANSFER;
  if (term.startsWith('2024')) return DOT_2024;
  if (term.startsWith('2025')) return DOT_2025;
  return DOT_2026;
}

// ---------------------------------------------------------------------------
// CourseChip — 28px draggable chip: term dot, course code, credits (short
// title in the >=1180 band). Variants: placed / tray / in-progress (dashed,
// drag-disabled) / transfer-fragment (bracket tick). The chip is a real
// <button>; click or Enter opens the "Place in…" popover menu — the full
// keyboard alternative to drag, running the same eligibility logic.
// ---------------------------------------------------------------------------

interface CourseChipProps {
  course: CourseFixture;
  isPlaced: boolean;
  band: Band;
  evaluation: AuditEvaluation;
  isMenuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onPlace: (courseId: string, nodeId: string) => void;
  onReturn: (courseId: string) => void;
  onDragStartChip: (courseId: string) => void;
  onDragEndChip: () => void;
  isArcHighlighted: boolean;
}

function CourseChip({
  course,
  isPlaced,
  band,
  evaluation,
  isMenuOpen,
  onMenuOpenChange,
  onPlace,
  onReturn,
  onDragStartChip,
  onDragEndChip,
  isArcHighlighted,
}: CourseChipProps) {
  const isInProgress = course.source === 'in-progress';
  const isFragment = course.source === 'transfer';
  const chipStyle: CSSProperties = {
    ...styles.chip,
    ...(isInProgress ? styles.chipInProgress : null),
    ...(isArcHighlighted ? {boxShadow: `0 0 0 2px ${BRAND_TEXT}`} : null),
  };
  // Stress fixture (a): the 63-char BIO 415 title truncates here and reads
  // in full inside the popover.
  const showTitle = band === 'wide';
  const menu = (
    <div style={styles.popBody}>
      <Text type="label" size="sm">
        {course.code} — {course.title}
      </Text>
      <span style={styles.popMeta}>
        {course.creditsLabel} · {course.termLabel}
        {course.grade != null ? ` · ${course.grade}` : ''}
        {course.gradePoints != null ? ` (${course.gradePoints.toFixed(1)})` : ''}
      </span>
      <span style={styles.popMeta}>
        {course.source === 'native'
          ? 'Laurel course of record'
          : course.source === 'in-progress'
            ? 'Registered — grades post at term end; placement locked until then'
            : course.transferNote}
      </span>
      {course.articulationId != null ? (
        <span style={styles.popMeta}>
          Articulation {ARTICULATION_BY_ID[course.articulationId].sourceCode} ·{' '}
          {ARTICULATION_BY_ID[course.articulationId].institution} · splits{' '}
          {ARTICULATION_BY_ID[course.articulationId].fragments
            .map(fragment => `${fragment.creditsLabel} → ${fragment.destination}`)
            .join(' + ')}
        </span>
      ) : null}
      {!isInProgress ? (
        <>
          <Divider />
          {isPlaced ? (
            <button
              type="button"
              className="daw-focusable"
              style={styles.popActionBtn}
              onClick={() => {
                onReturn(course.id);
                onMenuOpenChange(false);
              }}>
              <Icon icon={CornerDownRightIcon} size="xsm" color="secondary" />
              Return to tray
            </button>
          ) : null}
          <span style={styles.popMeta}>Place in…</span>
          {course.eligibleNodeIds.map(nodeId => {
            const node = NODE_BY_ID[nodeId];
            const isHere = isPlaced && evaluation.byNode[nodeId].placed.some(c => c.id === course.id);
            const isLocked = isNodeLockedFor(course, nodeId, evaluation);
            return (
              <button
                key={nodeId}
                type="button"
                className="daw-focusable"
                disabled={isHere || isLocked}
                aria-disabled={isHere || isLocked}
                style={
                  isHere || isLocked
                    ? {...styles.popActionBtn, ...styles.popActionDisabled}
                    : styles.popActionBtn
                }
                onClick={() => {
                  onPlace(course.id, nodeId);
                  onMenuOpenChange(false);
                }}>
                <Icon icon={isLocked ? LockIcon : ArrowRightIcon} size="xsm" color="secondary" />
                {node.title}
                {isHere ? ' · current' : isLocked ? ' · gate full' : ''}
              </button>
            );
          })}
        </>
      ) : null}
    </div>
  );
  return (
    <Popover isOpen={isMenuOpen} onOpenChange={onMenuOpenChange} label={`${course.code} actions`} content={menu}>
      <button
        type="button"
        className="daw-chip daw-focusable"
        style={chipStyle}
        draggable={!isInProgress}
        onDragStart={(event: DragEvent<HTMLButtonElement>) => {
          event.dataTransfer.setData('text/plain', course.id);
          event.dataTransfer.effectAllowed = 'move';
          onDragStartChip(course.id);
        }}
        onDragEnd={onDragEndChip}
        aria-label={`${course.code}, ${course.creditsLabel}, ${course.termLabel}${isInProgress ? ', in progress, drag disabled' : ''}. Open placement menu.`}>
        {isInProgress ? (
          <Icon icon={CircleDashedIcon} size="xsm" color="secondary" />
        ) : (
          <span style={{...styles.termDot, backgroundColor: termDotColor(course.term)}} aria-hidden />
        )}
        {isFragment ? (
          <span style={styles.fragTick} aria-hidden>
            <Icon icon={CornerDownRightIcon} size="xsm" color="inherit" />
          </span>
        ) : null}
        <span style={styles.chipCode}>{course.code}</span>
        {showTitle ? <span style={styles.chipTitle}>{course.title}</span> : null}
        <span style={styles.chipCredits}>{course.creditsLabel}</span>
      </button>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// ArticulationSplitRow — one external course fanned into 1–3 credit
// fragments with per-fragment destination labels and a bracket glyph.
// GEOL 1403 (2+1+1=4 ✓) is the max fan-out stress fixture (b).
// ---------------------------------------------------------------------------

function ArticulationSplitRow({articulation, status}: {articulation: Articulation; status: ExceptionStatus}) {
  const statusToken =
    status === 'pending' ? (
      <Token size="sm" color="orange" label="Pending" />
    ) : status === 'approved' ? (
      <Token size="sm" color="green" label="Applied" />
    ) : (
      <Token size="sm" color="red" label="Denied" />
    );
  return (
    <div style={status === 'denied' ? {...styles.splitRow, opacity: 0.55} : styles.splitRow}>
      <div style={{display: 'flex', alignItems: 'center', gap: 6, minWidth: 0}}>
        <span style={{...styles.termDot, backgroundColor: DOT_TRANSFER}} aria-hidden />
        <span style={{fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap'}}>{articulation.sourceCode}</span>
        <span style={styles.trayMetaText}>{articulation.creditsLabel} · {articulation.institution}</span>
        <span style={{marginLeft: 'auto', flexShrink: 0}}>{statusToken}</span>
      </div>
      {articulation.fragments.map(fragment => (
        <span key={fragment.destination} style={styles.splitFragLine}>
          <Icon icon={CornerDownRightIcon} size="xsm" color="secondary" />
          {fragment.creditsLabel} → {fragment.destination}
        </span>
      ))}
      <span style={{...styles.splitFragLine, marginLeft: 18}}>
        {status === 'pending' ? `Per ${EXC_GEOL_SPLIT} — approve in the exceptions rail` : `Resolved via ${EXC_GEOL_SPLIT}`}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExclusivityArcOverlay — 1.5px dashed strokes with 8px corner-rounded
// elbows, DOM-measured endpoints. SVG is aria-hidden; the rule meaning is
// duplicated by gate-badge tooltips and (below 820px) per-node lock badges.
// ---------------------------------------------------------------------------

interface ArcGeom {
  id: string;
  xA: number;
  yA: number;
  xB: number;
  yB: number;
  gx: number;
}

function arcPath(geom: ArcGeom): string {
  const {xA, yA, xB, yB, gx} = geom;
  const r = 8;
  if (Math.abs(yB - yA) < r * 2 + 2) {
    return `M ${xA} ${yA} L ${gx} ${yA} L ${gx} ${yB} L ${xB} ${yB}`;
  }
  const down = yB > yA;
  const s = down ? 1 : -1;
  return [
    `M ${xA} ${yA}`,
    `L ${gx + r} ${yA}`,
    `Q ${gx} ${yA} ${gx} ${yA + s * r}`,
    `L ${gx} ${yB - s * r}`,
    `Q ${gx} ${yB} ${gx + r} ${yB}`,
    `L ${xB} ${yB}`,
  ].join(' ');
}

interface ArcOverlayProps {
  geoms: ArcGeom[];
  hoveredArcId: string | null;
  onHover: (arcId: string | null) => void;
  showLabels: boolean;
}

function ExclusivityArcOverlay({geoms, hoveredArcId, onHover, showLabels}: ArcOverlayProps) {
  return (
    <svg style={styles.arcSvg} aria-hidden>
      {geoms.map(geom => {
        const isHover = hoveredArcId === geom.id;
        return (
          <g key={geom.id}>
            <path
              className="daw-arc"
              d={arcPath(geom)}
              fill="none"
              stroke={isHover ? BRAND_TEXT : AMBER_LINE}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              opacity={isHover ? 1 : 0.75}
            />
            {/* Fat transparent twin = the hover hit area. */}
            <path
              d={arcPath(geom)}
              fill="none"
              stroke="transparent"
              strokeWidth={12}
              style={{pointerEvents: 'stroke', cursor: 'default'}}
              onMouseEnter={() => onHover(geom.id)}
              onMouseLeave={() => onHover(null)}>
              <title>No double count between the connected requirements</title>
            </path>
            {showLabels || isHover ? (
              <text x={geom.gx + 6} y={(geom.yA + geom.yB) / 2} style={styles.arcLabel}>
                no double count
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RequirementSatisfactionTree — purely presentational; every figure arrives
// pre-evaluated from the store selectors. Leaf nodes are drop targets.
// ---------------------------------------------------------------------------

interface TreeSharedProps {
  band: Band;
  evaluation: AuditEvaluation;
  dragCourseId: string | null;
  dragOverNodeId: string | null;
  hoveredArcId: string | null;
  collapsedIds: ReadonlySet<string>;
  openMenuCourseId: string | null;
  onToggleCollapse: (nodeId: string) => void;
  onMenuOpenChange: (courseId: string, open: boolean) => void;
  onPlace: (courseId: string, nodeId: string) => void;
  onReturn: (courseId: string) => void;
  onBlockedDrop: (courseId: string, nodeId: string) => void;
  onDragStartChip: (courseId: string) => void;
  onDragEndChip: () => void;
  onDragOverNode: (nodeId: string | null) => void;
  registerNodeRef: (nodeId: string) => (el: HTMLDivElement | null) => void;
}

function chipHighlightedByArc(courseCode: string, nodeId: string, hoveredArcId: string | null): boolean {
  if (hoveredArcId == null) return false;
  const arc = ARCS.find(a => a.id === hoveredArcId);
  if (arc == null) return false;
  const arcNode = arcNodeIdFor(nodeId);
  return (arc.nodeA === arcNode || arc.nodeB === arcNode) && arc.sharedCodes.includes(courseCode);
}

function nodeIsArcEndpoint(nodeId: string, hoveredArcId: string | null): boolean {
  if (hoveredArcId == null) return false;
  const arc = ARCS.find(a => a.id === hoveredArcId);
  if (arc == null) return false;
  const arcNode = arcNodeIdFor(nodeId);
  return arc.nodeA === arcNode || arc.nodeB === arcNode;
}

function arcPartnerTitle(nodeId: string): string | null {
  const arcNode = arcNodeIdFor(nodeId);
  for (const arc of ARCS) {
    if (arc.nodeA === arcNode) return NODE_BY_ID[arc.nodeB].title;
    if (arc.nodeB === arcNode) return NODE_BY_ID[arc.nodeA].title;
  }
  return null;
}

function RequirementNodeCard(props: TreeSharedProps & {node: RequirementNode; isChild?: boolean}) {
  const {
    node,
    isChild = false,
    band,
    evaluation,
    dragCourseId,
    dragOverNodeId,
    hoveredArcId,
    collapsedIds,
    openMenuCourseId,
    onToggleCollapse,
    onMenuOpenChange,
    onPlace,
    onReturn,
    onBlockedDrop,
    onDragStartChip,
    onDragEndChip,
    onDragOverNode,
    registerNodeRef,
  } = props;
  const nodeEval = evaluation.byNode[node.id];
  const isParent = node.children != null;
  const isCollapsed = collapsedIds.has(node.id);
  const dragCourse = dragCourseId != null ? COURSE_BY_ID[dragCourseId] : null;
  const isEligibleTarget =
    !isParent && dragCourse != null && dragCourse.eligibleNodeIds.includes(node.id);
  const isLockedTarget =
    isEligibleTarget && dragCourse != null && isNodeLockedFor(dragCourse, node.id, evaluation);
  const showDropRing = isEligibleTarget && !isLockedTarget && dragOverNodeId === node.id;
  const isSatisfiedWash = nodeEval.fill === 'satisfied';
  const partnerTitle = arcPartnerTitle(node.id);

  const cardStyle: CSSProperties = {
    ...styles.nodeCard,
    ...(isSatisfiedWash ? styles.nodeCardSatisfied : null),
    ...(isEligibleTarget && !isLockedTarget ? {borderColor: BRAND_FILL} : null),
    ...(showDropRing ? styles.nodeCardDrop : null),
    ...(nodeIsArcEndpoint(node.id, hoveredArcId) ? styles.nodeCardHighlight : null),
  };

  const surplusLine =
    nodeEval.surplus > 0
      ? `${nodeEval.counted} of ${nodeEval.required} · +${nodeEval.surplus} cr surplus → Free Electives`
      : null;
  const isFree = node.id === NODE_FREE;
  const freeEffective = isFree ? nodeEval.counted : 0;

  return (
    <div
      ref={registerNodeRef(node.id)}
      style={cardStyle}
      role="group"
      aria-label={`${node.title}: ${nodeEval.statusText}`}
      aria-describedby={undefined}
      onDragOver={
        isParent
          ? undefined
          : (event: DragEvent<HTMLDivElement>) => {
              if (dragCourseId != null) {
                // preventDefault on every leaf so drops always FIRE — the
                // handler then routes eligible / locked / double-count.
                event.preventDefault();
                event.dataTransfer.dropEffect = isEligibleTarget && !isLockedTarget ? 'move' : 'none';
                if (dragOverNodeId !== node.id) onDragOverNode(node.id);
              }
            }
      }
      onDragLeave={isParent ? undefined : () => {
        if (dragOverNodeId === node.id) onDragOverNode(null);
      }}
      onDrop={
        isParent
          ? undefined
          : (event: DragEvent<HTMLDivElement>) => {
              event.preventDefault();
              const courseId = dragCourseId ?? event.dataTransfer.getData('text/plain');
              onDragOverNode(null);
              if (courseId === '') return;
              const course = COURSE_BY_ID[courseId];
              if (course == null || course.source === 'in-progress') return;
              if (course.eligibleNodeIds.includes(node.id) && !isNodeLockedFor(course, node.id, evaluation)) {
                onPlace(courseId, node.id);
              } else {
                onBlockedDrop(courseId, node.id);
              }
            }
      }>
      <div style={styles.nodeHeader}>
        <button
          type="button"
          className="daw-focusable"
          style={styles.chevronBtn}
          aria-expanded={!isCollapsed}
          aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${node.title}`}
          onClick={() => onToggleCollapse(node.id)}>
          <Icon icon={isCollapsed ? ChevronRightIcon : ChevronDownIcon} size="sm" color="inherit" />
        </button>
        <span style={styles.nodeTitle}>{node.title}</span>
        <GateBadge label={nodeEval.gateLabel} ruleText={node.ruleText} satisfied={nodeEval.satisfied} />
        {isLockedTarget ? (
          <span style={styles.lockPill}>
            <Icon icon={LockIcon} size="xsm" color="inherit" />
            {node.id === NODE_QUANT ? 'Quant gate full' : 'Gate full'}
          </span>
        ) : null}
        {band === 'shelf' && partnerTitle != null ? (
          <span style={styles.lockPill}>
            <Icon icon={LockIcon} size="xsm" color="inherit" />
            No double count with {partnerTitle}
          </span>
        ) : null}
        <span style={surplusLine != null ? {...styles.nodeCredits, ...styles.surplusText} : styles.nodeCredits}>
          {surplusLine ??
            (isFree && evaluation.surplusToFree > 0
              ? `${freeEffective} of ${nodeEval.required} cr · incl. +${evaluation.surplusToFree} cr pool surplus`
              : nodeEval.statusText)}
        </span>
      </div>
      {!isCollapsed ? (
        <>
          {!isParent ? (
            <>
              <CreditMeter counted={nodeEval.counted} required={nodeEval.required} surplus={nodeEval.surplus} />
              <div style={styles.chipsRow}>
                {nodeEval.placed.map(course => (
                  <CourseChip
                    key={course.id}
                    course={course}
                    isPlaced
                    band={band}
                    evaluation={evaluation}
                    isMenuOpen={openMenuCourseId === course.id}
                    onMenuOpenChange={open => onMenuOpenChange(course.id, open)}
                    onPlace={onPlace}
                    onReturn={onReturn}
                    onDragStartChip={onDragStartChip}
                    onDragEndChip={onDragEndChip}
                    isArcHighlighted={chipHighlightedByArc(course.code, node.id, hoveredArcId)}
                  />
                ))}
                {nodeEval.placed.length === 0 && node.emptyHint != null ? (
                  <span style={styles.emptySlot}>
                    <Icon icon={CircleDashedIcon} size="xsm" color="secondary" />
                    {node.emptyHint}
                  </span>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <CreditMeter counted={nodeEval.counted} required={nodeEval.required} surplus={nodeEval.surplus} />
              <div style={styles.childBlock}>
                {node.children?.map(child => (
                  <RequirementNodeCard key={child.id} {...props} node={child} isChild />
                ))}
              </div>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tray — 8 rows at load (badge derives), segmented filter, and the pending
// GEOL 1403 ArticulationSplitRow. Stress fixture (g): 8 rows force tray
// scroll at <= 900px stage heights.
// ---------------------------------------------------------------------------

type TrayFilter = 'all' | 'completed' | 'inprogress' | 'transfer';

interface TrayProps {
  band: Band;
  evaluation: AuditEvaluation;
  geolStatus: ExceptionStatus;
  filter: TrayFilter;
  onFilterChange: (filter: TrayFilter) => void;
  openMenuCourseId: string | null;
  onMenuOpenChange: (courseId: string, open: boolean) => void;
  onPlace: (courseId: string, nodeId: string) => void;
  onReturn: (courseId: string) => void;
  onDragStartChip: (courseId: string) => void;
  onDragEndChip: () => void;
  dragCourseId: string | null;
}

// Short node names keep the 44px tray-row hint on one 11px line at 280px.
const SHORT_NODE_NAME: Record<string, string> = {
  [NODE_CORE]: 'Core Biology',
  [NODE_CHEM]: 'Chemistry',
  [NODE_QUANT]: 'Quant',
  [NODE_TRACK_A]: 'Track A',
  [NODE_TRACK_B]: 'Track B',
  [NODE_TRACK_C]: 'Track C',
  [NODE_LIST_B]: 'List B',
  [NODE_COMP]: 'Composition',
  [NODE_HUM]: 'Humanities',
  [NODE_SOCSCI]: 'Social Science',
  [NODE_ARTS]: 'Arts',
  [NODE_GLOBAL]: 'Global',
  [NODE_FREE]: 'Free Electives',
};

function eligibleHint(course: CourseFixture): string {
  return course.eligibleNodeIds
    .map(nodeId => SHORT_NODE_NAME[nodeId] ?? NODE_BY_ID[nodeId].title)
    .join(' / ');
}

function TrayPane(props: TrayProps) {
  const {band, evaluation, geolStatus, filter, onFilterChange, dragCourseId} = props;
  const geolArticulation = ARTICULATION_BY_ID['art-geol1403'];
  const completed = evaluation.trayCourses.filter(course => course.source === 'native');
  const inProgress = evaluation.trayCourses.filter(course => course.source === 'in-progress');
  const transferRows = 1; // the GEOL 1403 split row (always listed)
  const allCount = evaluation.trayCourses.length + transferRows;
  const rows: CourseFixture[] =
    filter === 'all'
      ? evaluation.trayCourses
      : filter === 'completed'
        ? completed
        : filter === 'inprogress'
          ? inProgress
          : [];
  const showSplitRow = filter === 'all' || filter === 'transfer';
  const isReturnTarget = dragCourseId != null && COURSE_BY_ID[dragCourseId] != null;

  return (
    <aside
      style={{...styles.tray, width: band === 'wide' ? 320 : 280}}
      aria-label="Unassigned tray"
      // The tray is also a drop target: dragging a placed chip back here
      // returns it to the tray (same path as the menu's Return action).
      onDragOver={(event: DragEvent<HTMLElement>) => {
        if (isReturnTarget) event.preventDefault();
      }}
      onDrop={(event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        const courseId = dragCourseId ?? event.dataTransfer.getData('text/plain');
        if (courseId !== '') props.onReturn(courseId);
        props.onDragEndChip();
      }}>
      <div style={styles.trayHead}>
        <div style={styles.trayTitleRow}>
          <Heading level={2}>Unassigned tray</Heading>
          <span style={styles.countPill} aria-label={`${allCount} unassigned items`}>
            {allCount}
          </span>
        </div>
        {/* Segment labels abbreviate to fit the 280px band; full names live
            in the control's aria labels. */}
        <SegmentedControl
          label="Filter tray"
          value={filter}
          onChange={value => onFilterChange(value as TrayFilter)}
          size="sm">
          {/* Non-breaking spaces keep count from wrapping under the label. */}
          <SegmentedControlItem label={`All ${allCount}`} value="all" />
          <SegmentedControlItem label={`Done ${completed.length}`} value="completed" />
          <SegmentedControlItem label={`In prog ${inProgress.length}`} value="inprogress" />
          <SegmentedControlItem label={`Xfer ${transferRows}`} value="transfer" />
        </SegmentedControl>
      </div>
      <div style={styles.trayScroll}>
        {rows.map(course => (
          <div key={course.id} className="daw-trayrow" style={styles.trayRow}>
            <CourseChip
              course={course}
              isPlaced={false}
              band={band}
              evaluation={evaluation}
              isMenuOpen={props.openMenuCourseId === course.id}
              onMenuOpenChange={open => props.onMenuOpenChange(course.id, open)}
              onPlace={props.onPlace}
              onReturn={props.onReturn}
              onDragStartChip={props.onDragStartChip}
              onDragEndChip={props.onDragEndChip}
              isArcHighlighted={false}
            />
            <div style={styles.trayRowMeta}>
              <span style={styles.trayMetaText}>
                {course.grade ?? '—'} · {course.termLabel}
              </span>
              <span style={styles.trayMetaText}>→ {eligibleHint(course)}</span>
            </div>
          </div>
        ))}
        {showSplitRow ? <ArticulationSplitRow articulation={geolArticulation} status={geolStatus} /> : null}
      </div>
    </aside>
  );
}

/** < 820px: the tray reflows into a 56px horizontal chip shelf. */
function TrayShelf(props: Omit<TrayProps, 'filter' | 'onFilterChange'>) {
  const {evaluation, geolStatus} = props;
  return (
    <div style={styles.trayShelf} aria-label="Unassigned tray" role="region">
      <span style={styles.countPill}>{evaluation.trayCourses.length + 1}</span>
      {evaluation.trayCourses.map(course => (
        <CourseChip
          key={course.id}
          course={course}
          isPlaced={false}
          band="shelf"
          evaluation={evaluation}
          isMenuOpen={props.openMenuCourseId === course.id}
          onMenuOpenChange={open => props.onMenuOpenChange(course.id, open)}
          onPlace={props.onPlace}
          onReturn={props.onReturn}
          onDragStartChip={props.onDragStartChip}
          onDragEndChip={props.onDragEndChip}
          isArcHighlighted={false}
        />
      ))}
      <Tooltip content={`GEOL 1403 split pending — ${EXC_GEOL_SPLIT}`}>
        <span style={{...styles.lockPill, flexShrink: 0}}>
          <Icon icon={CornerDownRightIcon} size="xsm" color="inherit" />
          GEOL 1403 · {geolStatus === 'pending' ? 'Pending split' : geolStatus === 'approved' ? 'Applied' : 'Denied'}
        </span>
      </Tooltip>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exceptions rail — ticket-shaped cards; EXC-1057 Approve fires the
// three-fragment placement (78 → 82 cr). The lastNotice card renders at the
// top; exception ids copy on click.
// ---------------------------------------------------------------------------

interface RailProps {
  state: AuditState;
  evaluation: AuditEvaluation;
  onExceptionStatus: (excId: string, status: ExceptionStatus) => void;
  onDismissNotice: () => void;
}

const EXC_TOKEN: Record<ExceptionStatus, {color: 'green' | 'orange' | 'red'; label: string}> = {
  approved: {color: 'green', label: 'Approved'},
  pending: {color: 'orange', label: 'Pending'},
  denied: {color: 'red', label: 'Denied'},
};

function ExceptionsRailContent({state, evaluation, onExceptionStatus, onDismissNotice}: RailProps) {
  const notice = state.lastNotice;
  return (
    <div style={styles.railScroll}>
      <HStack gap={2} vAlign="center">
        <Heading level={2}>Exceptions</Heading>
        <span style={styles.countPill}>{EXCEPTIONS.length}</span>
        {evaluation.pendingExceptions > 0 ? (
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            {evaluation.pendingExceptions} pending
          </Text>
        ) : null}
      </HStack>
      {notice != null ? (
        <div
          style={{
            ...styles.noticeCard,
            ...(notice.tone === 'amber' ? styles.noticeAmber : styles.noticeRed),
          }}>
          <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
          <span style={{minWidth: 0}}>{notice.text}</span>
          <button
            type="button"
            className="daw-focusable"
            style={styles.noticeDismiss}
            aria-label="Dismiss notice"
            onClick={onDismissNotice}>
            <Icon icon={XIcon} size="xsm" color="inherit" />
          </button>
        </div>
      ) : null}
      {EXCEPTIONS.map(exception => {
        const status = state.exceptions[exception.id];
        const meta = EXC_TOKEN[status];
        return (
          <div
            key={exception.id}
            style={status === 'denied' ? {...styles.railCard, ...styles.railCardDenied} : styles.railCard}>
            <HStack gap={2} vAlign="center">
              <Tooltip content="Click to copy the exception id">
                <button
                  type="button"
                  className="daw-focusable"
                  style={styles.excIdBtn}
                  onClick={() => {
                    // Clipboard is a fire-and-forget nicety; the id stays
                    // visible either way.
                    void navigator.clipboard?.writeText(exception.id).catch(() => {});
                  }}>
                  {exception.id}
                </button>
              </Tooltip>
              <StackItem size="fill">
                <span />
              </StackItem>
              <Token size="sm" color={meta.color} label={meta.label} />
            </HStack>
            <span style={styles.railTitle}>{exception.title}</span>
            <span style={styles.railMeta}>
              Requested {exception.requestedBy} · {exception.requestedOn}
            </span>
            {exception.resolution != null && status === exception.initialStatus ? (
              <span style={styles.railMeta}>{exception.resolution}</span>
            ) : null}
            {exception.id === EXC_GEOL_SPLIT && status === 'pending' ? (
              <HStack gap={2}>
                {/* Approve places 2+1+1 cr in Free Electives: 15→19 there,
                    78→82 overall, ring 65.0%→68.3%. */}
                <Button label="Approve" size="sm" onClick={() => onExceptionStatus(exception.id, 'approved')} />
                <Button
                  label="Deny"
                  size="sm"
                  variant="secondary"
                  onClick={() => onExceptionStatus(exception.id, 'denied')}
                />
              </HStack>
            ) : null}
            {exception.id === EXC_GEOL_SPLIT && status === 'approved' ? (
              <span style={styles.railMeta}>Applied — 4 cr placed in Free Electives (2+1+1)</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — auditStore lives here: ONE update(id, patch); placeCourse /
// returnToTray / setCatalog / setExceptionStatus are thin helpers over it.
// Every aggregate on screen re-derives from evaluateAudit(state).
// ---------------------------------------------------------------------------

export default function DegreeAuditWorkbenchTemplate() {
  const [state, setState] = useState<AuditState>(INITIAL_STATE);

  const update = useCallback((id: string, patch: EntityPatch) => {
    setState(prev => {
      if (patch.dismissNotice === true) {
        return {...prev, lastNotice: null};
      }
      if (patch.blockedText != null) {
        return {...prev, lastNotice: {tone: 'red', text: patch.blockedText}, liveMessage: patch.blockedText};
      }
      if (patch.catalogYear != null) {
        const next: AuditState = {...prev, catalogYear: patch.catalogYear, lastNotice: null};
        const evaluated = evaluateAudit(next);
        return {
          ...next,
          liveMessage: `Catalog ${CATALOGS[patch.catalogYear].label} applied; ${evaluated.pctLabel} complete; ${evaluated.remaining} credits remaining.`,
        };
      }
      if (patch.exceptionStatus != null && prev.exceptions[id] != null) {
        let courses = prev.courses;
        if (id === EXC_GEOL_SPLIT && patch.exceptionStatus === 'approved') {
          // The one-click multi-fragment placement (2+1+1 = 4 cr).
          courses = {
            ...courses,
            [COURSE_GEOL_FRAG_A]: {placedIn: NODE_FREE},
            [COURSE_GEOL_FRAG_B]: {placedIn: NODE_FREE},
            [COURSE_GEOL_FRAG_C]: {placedIn: NODE_FREE},
          };
        }
        const next: AuditState = {
          ...prev,
          courses,
          exceptions: {...prev.exceptions, [id]: patch.exceptionStatus},
          lastNotice: null,
        };
        const evaluated = evaluateAudit(next);
        return {
          ...next,
          liveMessage:
            id === EXC_GEOL_SPLIT && patch.exceptionStatus === 'approved'
              ? `${id} approved; GEOL 1403 fragments applied to Free Electives; ${evaluated.placedTotal} of ${DEGREE_CREDITS} credits, ${evaluated.pctLabel} complete.`
              : `${id} ${patch.exceptionStatus}.`,
        };
      }
      if (patch.placedIn !== undefined && prev.courses[id] != null) {
        const course = COURSE_BY_ID[id];
        const prior = prev.courses[id].placedIn;
        if (prior === patch.placedIn) {
          return prev;
        }
        const next: AuditState = {
          ...prev,
          courses: {...prev.courses, [id]: {placedIn: patch.placedIn}},
        };
        const evaluated = evaluateAudit(next);
        let notice: Notice | null = null;
        if (prior != null && patch.placedIn != null) {
          const arc = arcBetween(prior, patch.placedIn);
          if (arc != null) {
            // Exclusivity auto-vacate: the prior bucket visibly un-fills
            // and its gate badge downgrades via the derived selectors.
            notice = {
              tone: 'amber',
              text: `Exclusivity applied: ${course.code} moved out of ${NODE_BY_ID[prior].title} — no double count with ${NODE_BY_ID[patch.placedIn].title}.`,
            };
          }
        }
        const target = patch.placedIn != null ? NODE_BY_ID[patch.placedIn] : null;
        const base =
          target != null
            ? `${course.code} placed in ${target.title}; ${target.title} now ${evaluated.byNode[target.id].statusText}; ${evaluated.pctLabel} complete.`
            : `${course.code} returned to tray; ${evaluated.pctLabel} complete.`;
        return {
          ...next,
          lastNotice: notice,
          liveMessage: notice != null ? `${base} ${notice.text}` : base,
        };
      }
      return prev;
    });
  }, []);

  // Thin helpers over the one mutation path.
  const placeCourse = useCallback((courseId: string, nodeId: string) => update(courseId, {placedIn: nodeId}), [update]);
  const returnToTray = useCallback((courseId: string) => update(courseId, {placedIn: null}), [update]);
  const setCatalog = useCallback((year: CatalogYear) => update('catalog', {catalogYear: year}), [update]);
  const setExceptionStatus = useCallback(
    (excId: string, status: ExceptionStatus) => update(excId, {exceptionStatus: status}),
    [update],
  );
  const blockDrop = useCallback(
    (courseId: string, nodeId: string) => {
      const course = COURSE_BY_ID[courseId];
      const node = NODE_BY_ID[nodeId];
      if (course == null || node == null) return;
      const text = isNodeLockedFor(course, nodeId, evaluateAudit(stateRef.current))
        ? `Blocked: ${node.title} gate is already satisfied — ${course.code} can only apply to Free Electives.`
        : `Double-count blocked: ${course.code} is not eligible for ${node.title}.`;
      update(courseId, {blockedText: text});
    },
    [update],
  );
  const dismissNotice = useCallback(() => update('notice', {dismissNotice: true}), [update]);

  // stateRef lets blockDrop read the latest state without re-binding.
  const stateRef = useRef(state);
  stateRef.current = state;

  const evaluation = useMemo(() => evaluateAudit(state), [state]);

  // ---- UI ephemera (not domain state) ----
  const [dragCourseId, setDragCourseId] = useState<string | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
  const [openMenuCourseId, setOpenMenuCourseId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [hoveredArcId, setHoveredArcId] = useState<string | null>(null);
  const [trayFilter, setTrayFilter] = useState<TrayFilter>('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sheetPillRef = useRef<HTMLButtonElement | null>(null);

  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);
  const handleMenuOpenChange = useCallback((courseId: string, open: boolean) => {
    setOpenMenuCourseId(prev => (open ? courseId : prev === courseId ? null : prev));
  }, []);
  const handleDragStart = useCallback((courseId: string) => setDragCourseId(courseId), []);
  const handleDragEnd = useCallback(() => {
    setDragCourseId(null);
    setDragOverNodeId(null);
  }, []);

  // ---- Responsive bands: CONTAINER width first, viewport fallback only
  // for the pre-observer frame (width === 0). ----
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const containerWidth = useElementWidth(viewRootRef);
  const vpDemo = useMediaQuery('(max-width: 1179px)');
  const vpSheet = useMediaQuery('(max-width: 999px)');
  const vpShelf = useMediaQuery('(max-width: 819px)');
  const band: Band =
    containerWidth > 0
      ? containerWidth >= 1180
        ? 'wide'
        : containerWidth >= 1000
          ? 'demo'
          : containerWidth >= 820
            ? 'sheet'
            : 'shelf'
      : vpShelf
        ? 'shelf'
        : vpSheet
          ? 'sheet'
          : vpDemo
            ? 'demo'
            : 'wide';
  const isRailInline = band === 'wide' || band === 'demo';

  // ---- ExclusivityArc endpoint measurement (refs + ResizeObserver;
  // re-measured on expand/collapse, placement, and band changes). ----
  const treeRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const [arcGeoms, setArcGeoms] = useState<ArcGeom[]>([]);
  const registerNodeRef = useCallback(
    (nodeId: string) => (el: HTMLDivElement | null) => {
      if (el != null) nodeRefs.current.set(nodeId, el);
      else nodeRefs.current.delete(nodeId);
    },
    [],
  );
  const measureArcs = useCallback(() => {
    const container = treeRef.current;
    if (container == null) return;
    const containerRect = container.getBoundingClientRect();
    const geoms: ArcGeom[] = [];
    ARCS.forEach((arc, index) => {
      const elA = nodeRefs.current.get(arc.nodeA);
      const elB = nodeRefs.current.get(arc.nodeB);
      if (elA == null || elB == null) return;
      const rectA = elA.getBoundingClientRect();
      const rectB = elB.getBoundingClientRect();
      geoms.push({
        id: arc.id,
        xA: Math.round(rectA.left - containerRect.left),
        yA: Math.round(rectA.top - containerRect.top + 20),
        xB: Math.round(rectB.left - containerRect.left),
        yB: Math.round(rectB.top - containerRect.top + 20),
        // Arc 1 elbows in the tree's left gutter (x=8); Arc 2 inside the
        // Gen Ed child indent (x=40) so the two verticals never collide.
        gx: index === 0 ? 8 : 40,
      });
    });
    setArcGeoms(prev => (JSON.stringify(prev) === JSON.stringify(geoms) ? prev : geoms));
  }, []);
  useLayoutEffect(() => {
    if (band === 'shelf') {
      setArcGeoms(prev => (prev.length === 0 ? prev : []));
      return undefined;
    }
    measureArcs();
    const container = treeRef.current;
    if (container == null) return undefined;
    const observer = new ResizeObserver(() => measureArcs());
    observer.observe(container);
    return () => observer.disconnect();
  }, [measureArcs, state, collapsedIds, band, containerWidth]);

  const treeShared: TreeSharedProps = {
    band,
    evaluation,
    dragCourseId,
    dragOverNodeId,
    hoveredArcId,
    collapsedIds,
    openMenuCourseId,
    onToggleCollapse: toggleCollapse,
    onMenuOpenChange: handleMenuOpenChange,
    onPlace: placeCourse,
    onReturn: returnToTray,
    onBlockedDrop: blockDrop,
    onDragStartChip: handleDragStart,
    onDragEndChip: handleDragEnd,
    onDragOverNode: setDragOverNodeId,
    registerNodeRef,
  };

  const railProps: RailProps = {
    state,
    evaluation,
    onExceptionStatus: setExceptionStatus,
    onDismissNotice: dismissNotice,
  };

  return (
    <div style={styles.root}>
      <style>{DAW_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div style={styles.headerBar}>
              <div style={styles.brandBlock}>
                <LaurelMark />
                {band !== 'shelf' ? (
                  <VStack gap={0}>
                    <span style={styles.brandName}>Laurel</span>
                    {band === 'wide' ? <span style={styles.brandSub}>Registrar · Degree audit</span> : null}
                  </VStack>
                ) : null}
              </div>
              <span style={styles.headerRule} aria-hidden />
              <StackItem size="fill">
                <VStack gap={0}>
                  <span style={styles.studentName}>{STUDENT.name}</span>
                  <span style={styles.studentMeta}>
                    {STUDENT.idLabel} · {STUDENT.program}
                    {band === 'wide' || band === 'demo' ? ` · ${STUDENT.advisor}` : ''}
                  </span>
                </VStack>
              </StackItem>
              <div style={styles.ringBlock}>
                <ProgressRing placed={evaluation.placedTotal} pct={evaluation.pct} pctLabel={evaluation.pctLabel} />
                {band !== 'shelf' ? (
                  <VStack gap={0}>
                    <span style={styles.creditsMain}>
                      {evaluation.placedTotal} / {DEGREE_CREDITS} credits
                    </span>
                    <span style={styles.creditsSub}>{evaluation.remaining} remaining</span>
                  </VStack>
                ) : null}
              </div>
              <Selector
                label="Catalog year"
                isLabelHidden
                size="sm"
                options={CATALOG_OPTIONS}
                value={state.catalogYear}
                onChange={value => setCatalog(value as CatalogYear)}
              />
              {!isRailInline ? (
                <button
                  ref={sheetPillRef}
                  type="button"
                  className="daw-focusable"
                  style={{...styles.gateBadge, height: 28, cursor: 'pointer', position: 'relative'}}
                  aria-expanded={isSheetOpen}
                  onClick={() => setIsSheetOpen(open => !open)}>
                  Exceptions ({EXCEPTIONS.length})
                  {evaluation.pendingExceptions > 0 ? (
                    <span
                      aria-label={`${evaluation.pendingExceptions} pending`}
                      style={{width: 6, height: 6, borderRadius: 999, backgroundColor: AMBER_LINE}}
                    />
                  ) : null}
                </button>
              ) : null}
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={{height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'}}>
              {band === 'shelf' ? (
                <TrayShelf
                  band={band}
                  evaluation={evaluation}
                  geolStatus={state.exceptions[EXC_GEOL_SPLIT]}
                  openMenuCourseId={openMenuCourseId}
                  onMenuOpenChange={handleMenuOpenChange}
                  onPlace={placeCourse}
                  onReturn={returnToTray}
                  onDragStartChip={handleDragStart}
                  onDragEndChip={handleDragEnd}
                  dragCourseId={dragCourseId}
                />
              ) : null}
              <div ref={viewRootRef} style={{...styles.viewRoot, position: 'relative', flex: 1}}>
                {band !== 'shelf' ? (
                  <TrayPane
                    band={band}
                    evaluation={evaluation}
                    geolStatus={state.exceptions[EXC_GEOL_SPLIT]}
                    filter={trayFilter}
                    onFilterChange={setTrayFilter}
                    openMenuCourseId={openMenuCourseId}
                    onMenuOpenChange={handleMenuOpenChange}
                    onPlace={placeCourse}
                    onReturn={returnToTray}
                    onDragStartChip={handleDragStart}
                    onDragEndChip={handleDragEnd}
                    dragCourseId={dragCourseId}
                  />
                ) : null}
                <main style={styles.main} aria-label="Requirement satisfaction tree">
                  <div ref={treeRef} style={styles.treeWrap}>
                    {band !== 'shelf' ? (
                      <ExclusivityArcOverlay
                        geoms={arcGeoms}
                        hoveredArcId={hoveredArcId}
                        onHover={setHoveredArcId}
                        showLabels={band === 'wide'}
                      />
                    ) : null}
                    {REQUIREMENT_TREE.map(node => (
                      <RequirementNodeCard key={node.id} {...treeShared} node={node} />
                    ))}
                  </div>
                </main>
                {isRailInline ? (
                  <aside style={{...styles.rail, width: band === 'wide' ? 300 : 280}} aria-label="Exceptions rail">
                    <ExceptionsRailContent {...railProps} />
                  </aside>
                ) : null}
                {!isRailInline && isSheetOpen ? (
                  <div
                    style={styles.sheet}
                    role="complementary"
                    aria-label="Exceptions"
                    onKeyDown={event => {
                      // Escape layering: the sheet closes itself and hands
                      // focus back to the header pill; chip popovers above
                      // it consume their own Escape first.
                      if (event.key === 'Escape') {
                        setIsSheetOpen(false);
                        sheetPillRef.current?.focus();
                      }
                    }}>
                    <div style={{display: 'flex', justifyContent: 'flex-end', padding: '8px 8px 0'}}>
                      <button
                        type="button"
                        className="daw-focusable"
                        style={styles.noticeDismiss}
                        aria-label="Close exceptions"
                        onClick={() => {
                          setIsSheetOpen(false);
                          sheetPillRef.current?.focus();
                        }}>
                        <Icon icon={XIcon} size="sm" color="secondary" />
                      </button>
                    </div>
                    <ExceptionsRailContent {...railProps} />
                  </div>
                ) : null}
              </div>
            </div>
            {/* One polite live region narrates every store mutation. */}
            <div aria-live="polite" role="status" style={styles.visuallyHidden}>
              {state.liveMessage}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
