// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Cuelight's producer rundown for the
 *   fictional 6PM newscast "The Six" (FRI JUL 04): 19 ordered rundown rows
 *   (16 content rows + 3 break anchors) with dual duration fields
 *   (`durationLabel: '2:10'` + `durationSec: 130`), a V/G/S readiness lamp
 *   matrix per content row, ticket-shaped script notes, and one pre-seeded
 *   floated row (F01) on the FloatShelf. SHOW_START 18:00:00 (64800 s),
 *   HARD_OUT 18:28:30, ALLOTTED 28:30 (1710 s); initial durations sum to
 *   1752 s = 29:12, so the show opens +0:42 HEAVY. There is NO clock —
 *   every backtime is pure cascading arithmetic over fixture durations,
 *   recomputed by a pure selector on every mutation. No randomness, no
 *   network media.
 * @output Broadcast Rundown Console — a timing-obsessed producer table:
 *   56px header strip (TallyMark + wordmark + show window "AIR 18:00:00 →
 *   HARD OUT 18:28:30", OverUnderChip "+0:42 HEAVY ▲", AirReadyChip
 *   "13/16 AIR-READY"); a real-<table> rundown whose BacktimeSpine column
 *   derives a cascading hit time per row and a delta chip at each hard hit
 *   (HH1 Break 1 @ 18:09:00 lands 0:00 ON, HH2 Break 2 @ 18:17:30 computes
 *   18:18:12 = +0:42 HEAVY, HH3 hard out shows +0:42 HEAVY); a tri-lamp
 *   ReadinessTallyCell with a 20px rollup ring; a FloatShelf dock where
 *   floated rows are present but visibly excluded from every aggregate
 *   (struck ghost backtimes recompute live); and a 400px script-and-asset
 *   aside for the selected row. Floating B01 (1:00) drops every downstream
 *   backtime by exactly 1:00 and flips HH2/HH3 heavy → light.
 * @position Page template; emitted by `astryx template broadcast-rundown-console`
 *
 * DENSITY GRID (fixed, verbatim): 4px base grid. Space steps:
 *   4 / 8 / 12 / 16 / 20 / 24 / 32. Header strip 56px. Rundown row height
 *   44px (hard-hit anchor rows 36px). FloatShelf 72px expanded / 28px
 *   collapsed rail; shelf cards 220x56px. Right aside 400px fixed.
 *   Backtime column 88px fixed. Font sizes: 11 (labels/overlines),
 *   12 (meta), 13 (body/cells), 15 (slug titles), 18 (header chips). ALL
 *   times in mono with font-variant-numeric tabular-nums. Control heights:
 *   chips 28px, buttons/inputs 32px, lamp dots 10px, rollup ring 20px.
 *   Cell padding 12px horizontal / 0 vertical (row height carries vertical
 *   rhythm). Icons 16px.
 *
 * Frame: root 100dvh div > Layout height="fill" > view root
 *   (flex column, height 100%, minHeight 0, overflow hidden) >
 *   [1] header strip 56px | [2] body row (flex 1):
 *   [2a] main column (rundown table scroll region > FloatShelf dock) |
 *   [2b] right aside 400px (own scroll).
 * Container policy: dense broadcast-console surface — square frame, table
 *   rows, docked shelf, bordered aside. No Cards; shelf cards are the one
 *   8px-radius card shape (they represent excluded rows, not content
 *   panes).
 * Corner map: shell/header/table rows 0 (square console frame); hard-hit
 *   anchor rows 0 with a 3px left rule; panes/shelf cards 8px; buttons and
 *   inputs 6px; chips/pills 999px; readiness lamps 4px rounded-square
 *   (echoes the tally mark); rollup ring circular; TallyMark 4px radius
 *   with a notched top-right corner.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (Cuelight #D7263D) consumed only by the BRAND token block below, which
 *   derives brandFill (TallyMark, wordmark accent) and brandText (4.5:1
 *   checked both schemes). HEAVY uses danger text/wash pairs, LIGHT uses
 *   cool info pairs, ON/exact uses success pairs — each carries its
 *   contrast math at the declaration. Every state chip pairs color with
 *   signed text + arrow, never color alone.
 *
 * Responsive contract (subtraction, not reflow) — bands keyed to the VIEW
 * ROOT's own width via a ResizeObserver (useElementWidth), NOT the
 * viewport: the demo stage renders this page in a ~1045–1075px container
 * inside a 1440px window, so viewport queries never fire there. Width 0 =
 * first pre-observer frame; viewport queries cover only that frame.
 * - Band A >= 1000px: full 3-region layout — aside 400px, all 7 table
 *   columns (PAGE 40 | SLUG flex >= 220 | TYPE 56 | DUR 64 | BACKTIME 88 |
 *   READY 76 | FLOAT 36; fixed columns sum 360px, slug gets ~285–315px in
 *   the ~660px main at demo width), shelf 72px.
 * - Band B 760–999px: aside collapses to a 56px icon rail (script/assets
 *   buttons open a 400px overlay panel); TYPE column drops — the type chip
 *   moves into the slug subline.
 * - Band C < 760px: aside rail hidden (row selection opens the script pane
 *   as a full overlay); PAGE column also drops; ReadinessTallyCell
 *   condenses to the 24px rollup ring only; shelf cards shrink to 180px.
 *
 * Escape layering: one layer — the Band B/C overlay panel. Escape closes
 * it and focus returns to the element that opened it (rail button or
 * rundown row). Shortcuts have no single-key bindings, so no typing-target
 * guards are needed beyond the DurationField handling its own Enter.
 * A polite live region announces the over/under after every timing
 * mutation. prefers-reduced-motion collapses the chip flip and shelf
 * transitions.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react';

import {
  ArrowDownToLineIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardListIcon,
  FilmIcon,
  ImageIcon,
  MinusIcon,
  PlusIcon,
  RadioTowerIcon,
  SettingsIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback.
// ---------------------------------------------------------------------------

// ONE quarantined brand literal: Cuelight red #D7263D. Consumed ONLY by the
// two derived tokens below (TallyMark + wordmark accent); no other hex
// literal on the page references it.
const BRAND = '#D7263D';
// Brand FILL — the TallyMark lamp square and dot. Fill-only in light mode.
const BRAND_FILL = `light-dark(${BRAND}, #E0475B)`;
// Brand TEXT — darker mix for light scheme: #C21F35 on white ≈ 5.9:1
// (passes 4.5:1; raw #D7263D is 4.97:1 — too close to the wire for 13px
// text). #F27585 on the dark surface ≈ 6.1:1.
const BRAND_TEXT = 'light-dark(#C21F35, #F27585)';

// HEAVY (over time) — danger pair. Text #B42318 on white ≈ 6.6:1; #F97066
// on the dark surface ≈ 5.6:1.
const HEAVY_TEXT = 'light-dark(#B42318, #F97066)';
const HEAVY_SOFT = 'light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.16))';
// LIGHT (under time) — cool info pair. Text #175CD3 on white ≈ 5.4:1;
// #84CAFF on the dark surface ≈ 9.7:1.
const LIGHT_TEXT = 'light-dark(#175CD3, #84CAFF)';
const LIGHT_SOFT = 'light-dark(rgba(23, 92, 211, 0.10), rgba(132, 202, 255, 0.16))';
// ON TIME / exact — success pair. Text #067647 on white ≈ 5.5:1; #75E0A7
// on the dark surface ≈ 9.4:1.
const ON_TEXT = 'light-dark(#067647, #75E0A7)';
const ON_SOFT = 'light-dark(rgba(6, 118, 71, 0.10), rgba(117, 224, 167, 0.16))';
// Lamp fills (10px dots; state is never color-only — V/G/S letter glyphs
// sit above each lamp and every lamp carries an aria-label + tooltip).
const LAMP_READY = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const LAMP_PENDING = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const LAMP_MISSING = 'light-dark(#DC2626, #F87171)';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, the OverUnderChip flip (transform/opacity only),
// and the reduced-motion guard.
// ---------------------------------------------------------------------------

const CONSOLE_CSS = `
.brc-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.brc-flip {
  animation: brc-flip 150ms ease;
}
@keyframes brc-flip {
  from { transform: scaleY(-1); opacity: 0; }
  to { transform: scaleY(1); opacity: 1; }
}
.brc-fade {
  transition: opacity 150ms ease, color 150ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .brc-flip { animation: none; }
  .brc-fade { transition: none; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  viewRoot: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background)',
  },
  // [1] Header strip — 56px fixed, square broadcast-console frame.
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 56,
    flexShrink: 0,
    padding: '0 16px',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  wordmark: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: BRAND_TEXT,
    whiteSpace: 'nowrap',
  },
  showTitle: {fontSize: 13, whiteSpace: 'nowrap', color: 'var(--color-text)'},
  showWindow: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  headerSpacer: {flex: 1, minWidth: 8},
  // 28px chips, pill radius, 18px figures inside the over/under chip.
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    padding: '0 12px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'none',
    cursor: 'pointer',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  overUnderFigure: {fontSize: 18, fontWeight: 700, lineHeight: 1},
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
  },
  // [2] Body row.
  body: {flex: 1, display: 'flex', minHeight: 0},
  mainColumn: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  tableScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  th: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    height: 28,
    padding: '0 12px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-background)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    whiteSpace: 'nowrap',
  },
  // 44px content rows; 12px horizontal cell padding, 0 vertical — the row
  // height carries the vertical rhythm.
  td: {
    height: 44,
    padding: '0 12px',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    verticalAlign: 'middle',
    overflow: 'hidden',
  },
  // Hard-hit anchor rows: 36px, square, 3px left rule.
  tdAnchor: {height: 36, backgroundColor: 'var(--color-background-muted)'},
  anchorRule: {boxShadow: `inset 3px 0 0 0 ${BRAND_FILL}`},
  rowSelected: {backgroundColor: 'var(--color-background-selected, var(--color-background-muted))'},
  pageCell: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  pageCellInner: {display: 'flex', alignItems: 'center', gap: 2},
  moveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 14,
    height: 14,
    padding: 0,
    border: 'none',
    borderRadius: 4,
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
  },
  slugButton: {
    display: 'block',
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    color: 'inherit',
    font: 'inherit',
    minWidth: 0,
  },
  // 15px slug title — single-line ellipsis is exercised by B02's 90-char
  // fixture title at every band.
  slugTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  slugSub: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  slugMuted: {color: 'var(--color-text-secondary)', fontWeight: 500},
  typeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    padding: '0 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // DurationField: [−5s][input][+5s] inside the 64px column; steppers stay
  // in the DOM (keyboard-reachable) and fade in on row hover / focus.
  durWrap: {display: 'flex', alignItems: 'center', gap: 1},
  durInput: {
    width: 34,
    height: 32,
    padding: 0,
    border: 'var(--border-width) solid transparent',
    borderRadius: 6,
    background: 'none',
    textAlign: 'center',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 13,
    color: 'var(--color-text)',
  },
  stepper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 13,
    height: 32,
    padding: 0,
    border: 'none',
    borderRadius: 4,
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    opacity: 0,
  },
  stepperVisible: {opacity: 1},
  // BacktimeSpine cell: 2px spine at the cell's left edge; hard hits widen
  // to a 6px tick behind the delta chip.
  backtimeCell: {position: 'relative'},
  spine: {
    position: 'absolute',
    left: 3,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'var(--color-border)',
  },
  spineTick: {width: 6, left: 1},
  hitLabel: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 13,
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
  },
  deltaChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    height: 18,
    padding: '0 6px',
    borderRadius: 999,
    border: 'none',
    cursor: 'pointer',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  // ReadinessTallyCell: three lamp buttons (letter glyph over a 10px
  // rounded-square dot) + the 20px rollup ring.
  readyWrap: {display: 'flex', alignItems: 'center', gap: 4},
  lampButton: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    width: 14,
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
  lampLetter: {fontSize: 9, fontWeight: 700, lineHeight: 1, color: 'var(--color-text-secondary)'},
  lampDot: {width: 10, height: 10, borderRadius: 4},
  lampNa: {
    width: 10,
    height: 10,
    borderRadius: 4,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'none',
  },
  floatButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    padding: 0,
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 700,
  },
  // FloatShelf — 72px dock / 28px collapsed rail; cards 220x56 (180 at
  // Band C), 8px radius.
  shelf: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'stretch',
    gap: 12,
    height: 72,
    padding: '0 12px',
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  shelfCollapsed: {height: 28, alignItems: 'center'},
  shelfCap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    border: 'none',
    background: 'none',
    padding: 0,
    cursor: 'pointer',
  },
  shelfOverline: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  shelfRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    overflowX: 'auto',
    minWidth: 0,
  },
  shelfCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: 220,
    height: 56,
    flexShrink: 0,
    padding: '0 8px',
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
  },
  shelfCardBody: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  shelfSlug: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  shelfMeta: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  shelfDurChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    padding: '0 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // Ghost backtime: struck-through, 50% opacity — "present but excluded".
  ghostHit: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    textDecoration: 'line-through',
    opacity: 0.5,
    whiteSpace: 'nowrap',
  },
  restoreButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 32,
    padding: '0 10px',
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'none',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--color-text)',
    flexShrink: 0,
  },
  // [2b] Aside — 400px fixed, own scroll; 56px icon rail at Band B.
  aside: {
    width: 400,
    flexShrink: 0,
    borderLeft: 'var(--border-width) solid var(--color-border)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  asideRail: {
    width: 56,
    flexShrink: 0,
    borderLeft: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 400,
    maxWidth: '100%',
    zIndex: 10,
    backgroundColor: 'var(--color-background)',
    borderLeft: 'var(--border-width) solid var(--color-border)',
    boxShadow: 'var(--shadow-overlay, 0 8px 24px rgba(0, 0, 0, 0.18))',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  asideTabs: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  asideTab: {
    height: 28,
    padding: '0 12px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  asideTabActive: {
    borderColor: BRAND_TEXT,
    color: BRAND_TEXT,
  },
  asideBody: {display: 'flex', flexDirection: 'column', gap: 12, padding: 16},
  asideOverline: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--color-text-secondary)',
  },
  asideSlug: {fontSize: 15, fontWeight: 700, color: 'var(--color-text)'},
  scriptNote: {
    padding: 12,
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-text)',
  },
  assetRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 36,
    padding: '0 8px',
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
  },
  assetSlug: {
    fontFamily: MONO,
    fontSize: 12,
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: 1,
    minWidth: 0,
  },
  metaLine: {fontSize: 12, color: 'var(--color-text-secondary)'},
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
// TIME MATH — pure helpers; the ONLY time source on this page is fixture
// arithmetic (no Date.now(), ever).
// ---------------------------------------------------------------------------

const SHOW_START_SEC = 64800; // 18:00:00
const ALLOTTED_SEC = 1710; // 28:30
const HARD_OUT_SEC = SHOW_START_SEC + ALLOTTED_SEC; // 66510 = 18:28:30

/** 65340 -> '18:09:00' */
function fmtClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** 130 -> '2:10' */
function fmtDur(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

/** +42 -> '+0:42', -18 -> '-0:18', 0 -> '0:00' */
function fmtDelta(sec: number): string {
  if (sec === 0) {
    return '0:00';
  }
  const sign = sec > 0 ? '+' : '-';
  return `${sign}${fmtDur(Math.abs(sec))}`;
}

/** '2:10' -> 130; null when malformed. */
function parseDur(text: string): number | null {
  const match = /^(\d{1,2}):([0-5]\d)$/.exec(text.trim());
  if (match == null) {
    return null;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

type DeltaState = 'exact' | 'heavy' | 'light';

// Exact threshold: |delta| <= 5 s reads ON; beyond that heavy/light.
function deltaStateOf(deltaSec: number): DeltaState {
  if (Math.abs(deltaSec) <= 5) {
    return 'exact';
  }
  return deltaSec > 5 ? 'heavy' : 'light';
}

// ---------------------------------------------------------------------------
// DATA — 'The Six' FRI JUL 04 rundown for the fictional Cuelight console.
// Signed-in user: Jules Marsh (line producer) — the voice signing the B03
// revision note. Every row carries dual duration fields; durations were
// hand-summed: Block A = 540 s (BRK1 hits 18:09:00 EXACTLY = the 'exact'
// spine state on first paint), Block B = 432 s (BRK2 computes 18:18:12 vs
// 18:17:30 scheduled = +0:42 HEAVY), grand total 1752 s = 29:12, so the
// show opens +0:42 over the 28:30 allotment. The pre-seeded floated F01
// (0:40) is excluded from ALL of those sums.
// ---------------------------------------------------------------------------

const PEOPLE = {
  dana: 'Dana Whitlock',
  miguel: 'Miguel Serrano',
  priya: 'Priya Nair',
  lena: 'Lena Brandt',
  cole: 'Cole Draper',
  marsh: 'Jules Marsh',
} as const;

type RowType = 'PKG' | 'VO' | 'SOT' | 'LIVE' | 'RDR' | 'WX' | 'BRK';
type LampKey = 'vt' | 'gfx' | 'script';
type LampState = 'ready' | 'pending' | 'missing' | 'na';

interface AssetRef {
  label: string;
  kind: 'VT' | 'GFX' | 'REMOTE';
  status: string;
}

interface RundownItem {
  id: string;
  kind: 'content' | 'break';
  block: 'A' | 'B' | 'C' | 'D';
  /** Breaks keep a fixed label; content page numbers DERIVE from order. */
  breakLabel?: string;
  slug: string;
  subline?: string;
  type: RowType;
  durationLabel: string;
  durationSec: number;
  /** Hard hits: scheduled second-of-day this row must begin at. */
  hardHitSec?: number;
  floated: boolean;
  lamps?: Record<LampKey, LampState>;
  scriptStatus?: 'locked' | 'unlocked';
  scriptNote?: string;
  assets?: AssetRef[];
}

const row = (item: RundownItem): RundownItem => item;

// Lamp legend: V = VT (edited tape), G = GFX, S = script. Air-ready = every
// lamp ready-or-na. Air-ready rows: A01 A02 A04 A05 A06 B01 B02 B04 B05 C01
// C02 C03 D02 = 13 of 16 content rows; not ready: A03 (GFX missing, VT n/a),
// B03 (script unlocked), D01 (VT pending) — with D01's 'pending', A03's
// 'missing' + 'na', and the ready majority, all four lamp states are visible
// on first paint (stress fixture 6).
const READY_ALL: Record<LampKey, LampState> = {vt: 'ready', gfx: 'ready', script: 'ready'};

const INITIAL_ITEMS: RundownItem[] = [
  row({
    id: 'A01', kind: 'content', block: 'A', type: 'RDR', floated: false,
    slug: 'COLD OPEN: Headlines', subline: `${PEOPLE.dana} · studio`,
    durationLabel: '0:45', durationSec: 45,
    lamps: {vt: 'na', gfx: 'ready', script: 'ready'},
    scriptStatus: 'locked',
    scriptNote: `Locked Rev 2 — three headlines, crane collapse leads. Keep the strike tease to one line (${PEOPLE.marsh}, 15:58).`,
    assets: [{label: 'GFX: OPEN-STINGER', kind: 'GFX', status: 'Built'}],
  }),
  row({
    id: 'A02', kind: 'content', block: 'A', type: 'PKG', floated: false,
    slug: 'PKG: Harbor crane collapse', subline: `${PEOPLE.miguel} · VT CRANE-0704`,
    durationLabel: '2:10', durationSec: 130,
    lamps: READY_ALL, scriptStatus: 'locked',
    scriptNote: `Locked Rev 3 — port authority statement in at 1:44; TRT confirmed 2:10 out of edit (${PEOPLE.miguel}, 16:20).`,
    assets: [
      {label: 'CRANE-0704', kind: 'VT', status: 'In server · 2:10'},
      {label: 'GFX: Pier 9 locator', kind: 'GFX', status: 'Built'},
    ],
  }),
  row({
    id: 'A03', kind: 'content', block: 'A', type: 'LIVE', floated: false,
    slug: 'LIVE: Serrano at Pier 9', subline: `${PEOPLE.miguel} · live remote`,
    durationLabel: '1:35', durationSec: 95,
    lamps: {vt: 'na', gfx: 'missing', script: 'ready'},
    scriptStatus: 'locked',
    scriptNote: `Locked Rev 2 — Q1 cleanup timeline, Q2 injured worker condition. GFX lower-third for the union rep NOT built yet — chasing design (${PEOPLE.marsh}, 16:35).`,
    assets: [
      {label: 'REMOTE: Truck 2 · Pier 9', kind: 'REMOTE', status: 'Window 18:02–18:06'},
      {label: 'GFX: Union rep L3', kind: 'GFX', status: 'MISSING — with design'},
    ],
  }),
  row({
    id: 'A04', kind: 'content', block: 'A', type: 'SOT', floated: false,
    slug: 'VO/SOT: Council vote on shelter levy', subline: `${PEOPLE.dana} · SOT COUNCIL-0704`,
    durationLabel: '1:25', durationSec: 85,
    lamps: READY_ALL, scriptStatus: 'locked',
    scriptNote: 'Locked Rev 1 — SOT runs 0:22, in-cue "…this levy is overdue", out-cue "…and that is final." 7-2 vote graphic tagged.',
    assets: [
      {label: 'COUNCIL-0704', kind: 'VT', status: 'In server · 0:22 SOT'},
      {label: 'GFX: Vote board 7-2', kind: 'GFX', status: 'Built'},
    ],
  }),
  row({
    id: 'A05', kind: 'content', block: 'A', type: 'PKG', floated: false,
    slug: 'PKG: Transit strike, day 3', subline: `${PEOPLE.priya} · VT STRIKE-D3`,
    durationLabel: '2:30', durationSec: 150,
    lamps: READY_ALL, scriptStatus: 'locked',
    scriptNote: `Locked Rev 2 — union and agency both on camera; day-3 ridership figure sourced to the transit authority (${PEOPLE.priya}, 15:47).`,
    assets: [
      {label: 'STRIKE-D3', kind: 'VT', status: 'In server · 2:30'},
      {label: 'GFX: Ridership chart', kind: 'GFX', status: 'Built'},
    ],
  }),
  row({
    id: 'A06', kind: 'content', block: 'A', type: 'RDR', floated: false,
    slug: 'RDR: WX headline + Tease 1', subline: `${PEOPLE.dana} · studio`,
    durationLabel: '0:35', durationSec: 35,
    lamps: {vt: 'na', gfx: 'ready', script: 'ready'},
    scriptStatus: 'locked',
    scriptNote: 'Locked Rev 1 — one-line heat advisory, tease the full forecast and sports.',
    assets: [{label: 'GFX: Tease bar', kind: 'GFX', status: 'Built'}],
  }),
  row({
    id: 'BRK1', kind: 'break', block: 'A', breakLabel: 'BRK 1', type: 'BRK', floated: false,
    slug: 'BREAK 1', durationLabel: '2:00', durationSec: 120,
    hardHitSec: 65340, // scheduled 18:09:00 — HH1
  }),
  row({
    id: 'B01', kind: 'content', block: 'B', type: 'VO', floated: false,
    slug: 'VO: Ferry Lane resurfacing', subline: `${PEOPLE.dana} · VO FERRY-LN`,
    durationLabel: '1:00', durationSec: 60,
    lamps: READY_ALL, scriptStatus: 'locked',
    // THE FLOAT TARGET: floating this 1:00 row is the signature interaction
    // — every downstream backtime drops exactly 1:00 and HH2/HH3 flip
    // heavy -> light.
    scriptNote: `Locked Rev 1 — 30-day closure map, detour via Quay St. First to float if we're heavy (${PEOPLE.marsh}, 16:05).`,
    assets: [
      {label: 'FERRY-LN', kind: 'VT', status: 'In server · 1:00'},
      {label: 'GFX: Detour map', kind: 'GFX', status: 'Built'},
    ],
  }),
  row({
    id: 'B02', kind: 'content', block: 'B', type: 'PKG', floated: false,
    // 92-char slug — the single-line-ellipsis stress fixture for the flex
    // slug column at every band.
    slug: 'PKG: School lunch pilot — "Trays of Change" expands to nine campuses despite vendor dispute',
    subline: `${PEOPLE.priya} · VT LUNCH-PILOT`,
    durationLabel: '2:25', durationSec: 145,
    lamps: READY_ALL, scriptStatus: 'locked',
    scriptNote: `Locked Rev 2 — district and vendor both respond; nine-campus figure confirmed with the superintendent's office (${PEOPLE.priya}, 16:12).`,
    assets: [
      {label: 'LUNCH-PILOT', kind: 'VT', status: 'In server · 2:25'},
      {label: 'GFX: Campus map x9', kind: 'GFX', status: 'Built'},
    ],
  }),
  row({
    id: 'B03', kind: 'content', block: 'B', type: 'LIVE', floated: false,
    slug: 'LIVE: Statehouse Q&A w/ Sen. Okafor', subline: `${PEOPLE.dana} · remote Statehouse`,
    durationLabel: '2:12', durationSec: 132,
    lamps: {vt: 'na', gfx: 'ready', script: 'pending'},
    scriptStatus: 'unlocked',
    // Long ticket-shaped revision note — stress-tests the 400px aside wrap.
    scriptNote: `Rev 4 — legal wants the levy figure sourced; DO NOT lock until Okafor pretape clears (${'J. Marsh'}, 16:42). Q3 on the veto override is OUT pending counsel review; if the pretape slips past 17:30, fall back to the 0:45 RDR version filed under B03-ALT and give the balance to the kicker.`,
    assets: [
      {label: 'REMOTE: Statehouse cam', kind: 'REMOTE', status: 'Window 18:13–18:18'},
      {label: 'GFX: Okafor L3', kind: 'GFX', status: 'Built'},
    ],
  }),
  row({
    id: 'B04', kind: 'content', block: 'B', type: 'RDR', floated: false,
    slug: 'RDR: Gas prices', subline: `${PEOPLE.dana} · studio`,
    durationLabel: '1:00', durationSec: 60,
    lamps: READY_ALL, scriptStatus: 'locked',
    scriptNote: 'Locked Rev 1 — weekly average down 4 cents; pump graphic tagged.',
    assets: [{label: 'GFX: Pump chart', kind: 'GFX', status: 'Built'}],
  }),
  // Pre-seeded shelf resident: present in the ordered list (restore slot =
  // after B04) but floated, so the timeline walks PAST it — its 0:40 is in
  // none of the sums and its ghost hit ('was 18:17:37' initially) recomputes
  // whenever upstream durations change (stress fixture 4).
  row({
    id: 'F01', kind: 'content', block: 'B', type: 'VO', floated: true,
    slug: 'VO: Raccoon in the newsroom vestibule', subline: `${PEOPLE.cole} · VO RACCOON`,
    durationLabel: '0:40', durationSec: 40,
    lamps: READY_ALL, scriptStatus: 'locked',
    scriptNote: `Locked Rev 1 — security-cam VO, 0:40. Floats until we're light (${PEOPLE.marsh}, 15:30).`,
    assets: [{label: 'RACCOON', kind: 'VT', status: 'In server · 0:40'}],
  }),
  row({
    id: 'B05', kind: 'content', block: 'B', type: 'RDR', floated: false,
    slug: 'Tease 2', subline: `${PEOPLE.dana} · studio`,
    durationLabel: '0:35', durationSec: 35,
    lamps: {vt: 'na', gfx: 'ready', script: 'ready'},
    scriptStatus: 'locked',
    scriptNote: 'Locked Rev 1 — tease weather and sports.',
    assets: [{label: 'GFX: Tease bar', kind: 'GFX', status: 'Built'}],
  }),
  row({
    id: 'BRK2', kind: 'break', block: 'B', breakLabel: 'BRK 2', type: 'BRK', floated: false,
    slug: 'BREAK 2', durationLabel: '2:00', durationSec: 120,
    hardHitSec: 65850, // scheduled 18:17:30 — HH2
  }),
  row({
    id: 'C01', kind: 'content', block: 'C', type: 'WX', floated: false,
    slug: 'WX: Full forecast', subline: `${PEOPLE.lena} · studio wall`,
    durationLabel: '3:00', durationSec: 180, // max-duration stress fixture
    lamps: {vt: 'na', gfx: 'ready', script: 'ready'},
    scriptStatus: 'locked',
    scriptNote: `Ad-lib off the wall — heat advisory through Sunday, holiday fireworks window looks clear (${PEOPLE.lena}, 16:00).`,
    assets: [{label: 'GFX: 7-day wall', kind: 'GFX', status: 'Built'}],
  }),
  row({
    id: 'C02', kind: 'content', block: 'C', type: 'RDR', floated: false,
    slug: 'SPORTS: Rundown', subline: `${PEOPLE.cole} · studio`,
    durationLabel: '1:45', durationSec: 105,
    lamps: READY_ALL, scriptStatus: 'locked',
    scriptNote: 'Locked Rev 1 — doubleheader recap plus the regatta highlight reel.',
    assets: [
      {label: 'SPORTS-REEL', kind: 'VT', status: 'In server · 0:50'},
      {label: 'GFX: Scores board', kind: 'GFX', status: 'Built'},
    ],
  }),
  row({
    id: 'C03', kind: 'content', block: 'C', type: 'RDR', floated: false,
    slug: 'Tease 3', subline: `${PEOPLE.dana} · studio`,
    durationLabel: '0:20', durationSec: 20, // min-duration stress fixture
    lamps: {vt: 'na', gfx: 'ready', script: 'ready'},
    scriptStatus: 'locked',
    scriptNote: 'Locked Rev 1 — tease the kicker.',
    assets: [{label: 'GFX: Tease bar', kind: 'GFX', status: 'Built'}],
  }),
  row({
    id: 'BRK3', kind: 'break', block: 'C', breakLabel: 'BRK 3', type: 'BRK', floated: false,
    slug: 'BREAK 3', durationLabel: '1:30', durationSec: 90,
    // No hardHitSec — BRK3 floats with the show; only HH1/HH2/hard-out are
    // anchored.
  }),
  row({
    id: 'D01', kind: 'content', block: 'D', type: 'PKG', floated: false,
    slug: 'KICKER PKG: Lighthouse dog of Port Bray', subline: `${PEOPLE.miguel} · VT PENDING`,
    durationLabel: '1:40', durationSec: 100,
    lamps: {vt: 'pending', gfx: 'ready', script: 'ready'},
    scriptStatus: 'locked',
    scriptNote: `Locked Rev 2 — edit says color pass done by 17:20; TRT target 1:40, will confirm out of edit (${PEOPLE.miguel}, 16:28).`,
    assets: [
      {label: 'LIGHTHOUSE-DOG', kind: 'VT', status: 'PENDING — in edit'},
      {label: 'GFX: Port Bray locator', kind: 'GFX', status: 'Built'},
    ],
  }),
  row({
    id: 'D02', kind: 'content', block: 'D', type: 'RDR', floated: false,
    slug: 'GOODNIGHT', subline: `${PEOPLE.dana} · studio`,
    durationLabel: '0:45', durationSec: 45,
    lamps: {vt: 'na', gfx: 'ready', script: 'ready'},
    scriptStatus: 'locked',
    scriptNote: 'Locked Rev 1 — holiday sign-off, credits over the harbor cam.',
    assets: [{label: 'GFX: Credits bed', kind: 'GFX', status: 'Built'}],
  }),
];

// ---------------------------------------------------------------------------
// PURE SELECTOR — computeTimeline. NEVER stored: every hit time, ghost hit,
// hard-hit delta, and the over/under derive from the current items on every
// render. Initial cross-check (hand-verified against the fixture durations):
// A01 18:00:00 · A02 18:00:45 · A03 18:02:55 · A04 18:04:30 · A05 18:05:55 ·
// A06 18:08:25 · BRK1 18:09:00 (HH1 delta 0:00 ON — the 'exact' state) ·
// B01 18:11:00 · B02 18:12:00 · B03 18:14:25 · B04 18:16:37 · B05 18:17:37 ·
// BRK2 18:18:12 (HH2 delta +0:42 HEAVY) · C01 18:20:12 · C02 18:23:12 ·
// C03 18:24:57 · BRK3 18:25:17 · D01 18:26:47 · D02 18:28:27 · off-air
// 18:29:12 = +0:42 over the 18:28:30 hard out. The 'light' coloring is
// reached by the signature float of B01 (all three delta colorings are
// therefore demonstrable: exact on first paint at HH1, heavy at HH2/HH3,
// light after the float).
// ---------------------------------------------------------------------------

interface TimelineEntry {
  hitSec: number;
  hitLabel: string;
  ghost: boolean;
  deltaSec: number | null;
  deltaState: DeltaState | null;
}

interface Timeline {
  rows: Map<string, TimelineEntry>;
  offAirSec: number;
  offAirLabel: string;
  overUnderSec: number;
  overUnderState: DeltaState;
}

function computeTimeline(items: readonly RundownItem[]): Timeline {
  const rows = new Map<string, TimelineEntry>();
  let acc = SHOW_START_SEC;
  for (const item of items) {
    if (item.floated) {
      // Present but excluded: the ghost hit is where the row WOULD start if
      // restored at its slot right now.
      rows.set(item.id, {
        hitSec: acc,
        hitLabel: fmtClock(acc),
        ghost: true,
        deltaSec: null,
        deltaState: null,
      });
      continue;
    }
    const deltaSec = item.hardHitSec != null ? acc - item.hardHitSec : null;
    rows.set(item.id, {
      hitSec: acc,
      hitLabel: fmtClock(acc),
      ghost: false,
      deltaSec,
      deltaState: deltaSec != null ? deltaStateOf(deltaSec) : null,
    });
    acc += item.durationSec;
  }
  const overUnderSec = acc - HARD_OUT_SEC;
  return {
    rows,
    offAirSec: acc,
    offAirLabel: fmtClock(acc),
    overUnderSec,
    overUnderState: deltaStateOf(overUnderSec),
  };
}

/** Derived page labels: block letter + ordinal among that block's active
 * content rows, so floating/restoring/moving renumbers pages live. Breaks
 * keep their fixed labels. Floated rows have no page (they live on the
 * shelf). */
function computePageLabels(items: readonly RundownItem[]): Map<string, string> {
  const labels = new Map<string, string>();
  const counters: Record<string, number> = {};
  for (const item of items) {
    if (item.kind === 'break') {
      labels.set(item.id, item.breakLabel ?? item.id);
      continue;
    }
    if (item.floated) {
      continue;
    }
    const next = (counters[item.block] ?? 0) + 1;
    counters[item.block] = next;
    labels.set(item.id, `${item.block}${String(next).padStart(2, '0')}`);
  }
  return labels;
}

/** Air-ready = every lamp ready-or-na. Floated rows leave BOTH numerator and
 * denominator (13/16 -> 12/15 after floating B01). */
function isAirReady(item: RundownItem): boolean {
  if (item.kind !== 'content' || item.lamps == null) {
    return false;
  }
  return (['vt', 'gfx', 'script'] as const).every(
    key => item.lamps![key] === 'ready' || item.lamps![key] === 'na',
  );
}

// ---------------------------------------------------------------------------
// STATE OWNER — rundownStore: ONE reducer, ONE mutation shape
// update(id, patch). Every surface (float toggles, duration edits, lamp
// cycles, reorders, selection, shelf, aside tabs, overlay) dispatches
// through it; every consequence (backtimes, deltas, over/under, air-ready
// counts, ghost hits, page numbers) derives in selectors.
// ---------------------------------------------------------------------------

type AsideTab = 'script' | 'assets';

interface ConsoleState {
  items: RundownItem[];
  selectedId: string;
  shelfOpen: boolean;
  asideTab: AsideTab;
  overlayOpen: boolean;
}

interface Patch {
  floated?: boolean;
  durationSec?: number;
  cycleLamp?: LampKey;
  move?: -1 | 1;
  selected?: true;
  shelfOpen?: boolean;
  asideTab?: AsideTab;
  overlayOpen?: boolean;
}

const LAMP_CYCLE: Record<LampState, LampState> = {
  ready: 'pending',
  pending: 'missing',
  missing: 'na',
  na: 'ready',
};

interface UpdateAction {
  id: string | null;
  patch: Patch;
}

function moveWithinBlock(items: RundownItem[], id: string, dir: -1 | 1): RundownItem[] {
  const index = items.findIndex(item => item.id === id);
  if (index < 0) {
    return items;
  }
  const moving = items[index];
  if (moving.kind !== 'content' || moving.floated) {
    return items;
  }
  // Skip floated residents (they hold their restore slot but don't block
  // reorders); stop at block edges and break anchors.
  let target = index + dir;
  while (target >= 0 && target < items.length && items[target].floated) {
    target += dir;
  }
  if (target < 0 || target >= items.length) {
    return items;
  }
  const other = items[target];
  if (other.kind !== 'content' || other.block !== moving.block) {
    return items;
  }
  const next = items.slice();
  next[index] = other;
  next[target] = moving;
  return next;
}

function rundownReducer(state: ConsoleState, action: UpdateAction): ConsoleState {
  const {id, patch} = action;
  let next = state;
  if (id != null) {
    if (patch.floated !== undefined || patch.durationSec !== undefined || patch.cycleLamp != null) {
      next = {
        ...next,
        items: next.items.map(item => {
          if (item.id !== id) {
            return item;
          }
          let updated = item;
          if (patch.floated !== undefined && item.kind === 'content') {
            updated = {...updated, floated: patch.floated};
          }
          if (patch.durationSec !== undefined) {
            const clamped = Math.min(599, Math.max(5, patch.durationSec));
            updated = {...updated, durationSec: clamped, durationLabel: fmtDur(clamped)};
          }
          if (patch.cycleLamp != null && updated.lamps != null) {
            const lamp = patch.cycleLamp;
            const lamps = {...updated.lamps, [lamp]: LAMP_CYCLE[updated.lamps[lamp]]};
            const scriptStatus =
              lamp === 'script'
                ? lamps.script === 'ready'
                  ? ('locked' as const)
                  : ('unlocked' as const)
                : updated.scriptStatus;
            updated = {...updated, lamps, scriptStatus};
          }
          return updated;
        }),
      };
    }
    if (patch.move != null) {
      next = {...next, items: moveWithinBlock(next.items, id, patch.move)};
    }
    if (patch.selected) {
      next = {...next, selectedId: id};
    }
  }
  if (patch.shelfOpen !== undefined) {
    next = {...next, shelfOpen: patch.shelfOpen};
  }
  if (patch.asideTab != null) {
    next = {...next, asideTab: patch.asideTab};
  }
  if (patch.overlayOpen !== undefined) {
    next = {...next, overlayOpen: patch.overlayOpen};
  }
  return next;
}

const INITIAL_STATE: ConsoleState = {
  items: INITIAL_ITEMS,
  selectedId: 'B01',
  shelfOpen: true,
  asideTab: 'script',
  overlayOpen: false,
};

type UpdateFn = (id: string | null, patch: Patch) => void;

// ---------------------------------------------------------------------------
// RESPONSIVE — container-width bands via ResizeObserver on the view root.
// Width 0 = first pre-observer frame; viewport queries cover only that
// frame so wide hosts never flash pane removal.
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

type Band = 'A' | 'B' | 'C';

// ---------------------------------------------------------------------------
// TallyMark — inline SVG logo; the ONLY consumer of the brand fill. Rounded
// square (4px radius), top-right corner notched like a cue card, inner dot
// offset upper-left in the surface color.
// ---------------------------------------------------------------------------

function TallyMark({size = 20}: {size?: number}) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden focusable="false">
      <path
        d="M5 1 H12 V6 H19 V15 Q19 19 15 19 H5 Q1 19 1 15 V5 Q1 1 5 1 Z"
        fill={BRAND_FILL}
      />
      <rect x={4.5} y={4.5} width={6} height={6} rx={2} fill="var(--color-background)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Delta / over-under chips — color always paired with signed text + arrow.
// ---------------------------------------------------------------------------

const DELTA_META: Record<DeltaState, {word: string; arrow: string; text: string; soft: string}> = {
  heavy: {word: 'HEAVY', arrow: '▲', text: HEAVY_TEXT, soft: HEAVY_SOFT},
  light: {word: 'LIGHT', arrow: '▼', text: LIGHT_TEXT, soft: LIGHT_SOFT},
  exact: {word: 'ON', arrow: '●', text: ON_TEXT, soft: ON_SOFT},
};

interface DeltaChipProps {
  deltaSec: number;
  state: DeltaState;
  compact: boolean;
  ariaLabel: string;
  onClick: () => void;
}

/** Row-level hard-hit delta chip; clicking scrolls to the hard-out anchor. */
function DeltaChip({deltaSec, state, compact, ariaLabel, onClick}: DeltaChipProps) {
  const meta = DELTA_META[state];
  return (
    <button
      type="button"
      className="brc-focusable"
      style={{
        ...styles.deltaChip,
        backgroundColor: meta.soft,
        color: meta.text,
        padding: compact ? '0 4px' : '0 6px',
      }}
      aria-label={ariaLabel}
      onClick={onClick}>
      {fmtDelta(deltaSec)}
      {compact ? null : ` ${meta.word}`} {meta.arrow}
    </button>
  );
}

interface OverUnderChipProps {
  overUnderSec: number;
  state: DeltaState;
  onClick: () => void;
}

/** Header chip — 18px mono figure; remounts on state flip so the 150ms
 * scaleY flip runs exactly when the total crosses zero (reduced motion
 * collapses it via the injected CSS). */
function OverUnderChip({overUnderSec, state, onClick}: OverUnderChipProps) {
  const meta = DELTA_META[state];
  const word = state === 'exact' ? 'ON TIME' : meta.word;
  return (
    <button
      key={state}
      type="button"
      className="brc-focusable brc-flip"
      style={{...styles.chip, backgroundColor: meta.soft, color: meta.text, borderColor: 'transparent'}}
      aria-label={`Over/under ${fmtDelta(overUnderSec)} ${word.toLowerCase()} — scroll to hard out`}
      onClick={onClick}>
      <span style={styles.overUnderFigure}>{fmtDelta(overUnderSec)}</span>
      {word} {state === 'exact' ? '' : meta.arrow}
    </button>
  );
}

// ---------------------------------------------------------------------------
// DurationField — mm:ss inline editor, parse on blur/Enter, clamp 0:05–9:59
// (C03 0:20 and C01 3:00 bound the fixtures). ±5s micro-steppers stay in
// the DOM (keyboard-reachable) and fade in on row hover/focus.
// ---------------------------------------------------------------------------

interface DurationFieldProps {
  slug: string;
  label: string;
  seconds: number;
  showSteppers: boolean;
  onCommit: (sec: number) => void;
}

function DurationField({slug, label, seconds, showSteppers, onCommit}: DurationFieldProps) {
  const [text, setText] = useState(label);
  const [isFocused, setIsFocused] = useState(false);
  // Reflect external changes (stepper clicks, restore) when not editing.
  useEffect(() => {
    if (!isFocused) {
      setText(label);
    }
  }, [label, isFocused]);
  const commit = () => {
    const parsed = parseDur(text);
    if (parsed == null) {
      setText(label); // malformed: revert, never mutate
    } else {
      onCommit(parsed);
    }
  };
  const stepperStyle = showSteppers ? {...styles.stepper, ...styles.stepperVisible} : styles.stepper;
  return (
    <span style={styles.durWrap}>
      <button
        type="button"
        className="brc-focusable brc-fade"
        style={stepperStyle}
        aria-label={`Trim 5 seconds from ${slug}`}
        onClick={() => onCommit(seconds - 5)}>
        <Icon icon={MinusIcon} size="xsm" color="inherit" />
      </button>
      <input
        className="brc-focusable"
        style={{...styles.durInput, borderColor: isFocused ? 'var(--color-border)' : 'transparent'}}
        value={text}
        aria-label={`Duration for ${slug}, mm:ss`}
        onChange={e => setText(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          commit();
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            commit();
            e.currentTarget.blur();
          }
        }}
      />
      <button
        type="button"
        className="brc-focusable brc-fade"
        style={stepperStyle}
        aria-label={`Add 5 seconds to ${slug}`}
        onClick={() => onCommit(seconds + 5)}>
        <Icon icon={PlusIcon} size="xsm" color="inherit" />
      </button>
    </span>
  );
}

// ---------------------------------------------------------------------------
// ReadinessTallyCell — V/G/S lamps (10px rounded-square dots, 4px radius —
// echoing the tally mark) + 20px rollup ring. Lamps are real <button>s that
// cycle ready → pending → missing → n/a; state is never color-only (letter
// glyphs + aria-label + tooltip). Band C condenses to the ring alone.
// ---------------------------------------------------------------------------

const LAMP_LABEL: Record<LampKey, string> = {vt: 'VT', gfx: 'GFX', script: 'Script'};
const LAMP_LETTER: Record<LampKey, string> = {vt: 'V', gfx: 'G', script: 'S'};
const LAMP_FILL: Record<Exclude<LampState, 'na'>, string> = {
  ready: LAMP_READY,
  pending: LAMP_PENDING,
  missing: LAMP_MISSING,
};

function RollupRing({goodCount}: {goodCount: number}) {
  const frac = goodCount / 3;
  const c = 2 * Math.PI * 8; // r=8 in a 20px viewBox
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden focusable="false">
      <circle cx={10} cy={10} r={8} fill="none" stroke="var(--color-border)" strokeWidth={3} />
      <circle
        cx={10}
        cy={10}
        r={8}
        fill="none"
        stroke={frac === 1 ? LAMP_READY : LAMP_PENDING}
        strokeWidth={3}
        strokeDasharray={`${frac * c} ${c}`}
        transform="rotate(-90 10 10)"
      />
    </svg>
  );
}

interface ReadinessTallyCellProps {
  slug: string;
  lamps: Record<LampKey, LampState>;
  ringOnly: boolean;
  onCycle: (lamp: LampKey) => void;
}

function ReadinessTallyCell({slug, lamps, ringOnly, onCycle}: ReadinessTallyCellProps) {
  const goodCount = (['vt', 'gfx', 'script'] as const).filter(
    key => lamps[key] === 'ready' || lamps[key] === 'na',
  ).length;
  if (ringOnly) {
    return (
      <span style={styles.readyWrap} aria-label={`${slug}: ${goodCount} of 3 readiness lamps clear`}>
        <RollupRing goodCount={goodCount} />
      </span>
    );
  }
  return (
    <span style={styles.readyWrap}>
      {(['vt', 'gfx', 'script'] as const).map(key => {
        const state = lamps[key];
        const label = `${LAMP_LABEL[key]}: ${state === 'na' ? 'n/a' : state} — click to cycle`;
        return (
          <Tooltip key={key} content={label}>
            <button
              type="button"
              className="brc-focusable"
              style={styles.lampButton}
              aria-label={`${slug} — ${label}`}
              onClick={() => onCycle(key)}>
              <span style={styles.lampLetter} aria-hidden>
                {LAMP_LETTER[key]}
              </span>
              {state === 'na' ? (
                <span style={styles.lampNa} aria-hidden />
              ) : (
                <span style={{...styles.lampDot, backgroundColor: LAMP_FILL[state]}} aria-hidden />
              )}
            </button>
          </Tooltip>
        );
      })}
      <RollupRing goodCount={goodCount} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// RUNDOWN ROWS — real <table> semantics inside the scroll region. Content
// rows 44px; break/hard-hit anchor rows 36px with the 3px brand left rule.
// The BacktimeSpine cell: 2px spine segment + mono hit time; anchors widen
// the spine to a 6px tick and surface the delta chip in the trailing
// (READY+FLOAT colSpan) cell so the chip sits beside its backtime.
// ---------------------------------------------------------------------------

interface RundownRowProps {
  item: RundownItem;
  pageLabel: string;
  entry: TimelineEntry;
  band: Band;
  isSelected: boolean;
  update: UpdateFn;
  onSelect: (id: string, opener: HTMLElement | null) => void;
  onScrollToOut: () => void;
  rowRef: (id: string, el: HTMLTableRowElement | null) => void;
}

function RundownRow({
  item,
  pageLabel,
  entry,
  band,
  isSelected,
  update,
  onSelect,
  onScrollToOut,
  rowRef,
}: RundownRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const showControls = isHovered || hasFocusWithin;

  const isAnchor = item.kind === 'break';
  const isHardHit = item.hardHitSec != null;
  const airReady = isAirReady(item);
  const cellStyle = isAnchor ? {...styles.td, ...styles.tdAnchor} : styles.td;
  const firstCellStyle =
    isAnchor && isHardHit ? {...cellStyle, ...styles.anchorRule} : cellStyle;
  const rowStyle = isSelected && !isAnchor ? styles.rowSelected : undefined;

  const typeChip = <span style={styles.typeChip}>{item.type}</span>;
  const subline =
    band === 'A' || isAnchor ? item.subline : `${item.type} · ${item.subline ?? ''}`;

  return (
    <tr
      ref={el => rowRef(item.id, el)}
      style={rowStyle}
      aria-selected={isAnchor ? undefined : isSelected}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocusWithin(true)}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setHasFocusWithin(false);
        }
      }}>
      {band !== 'C' ? (
        <td style={{...firstCellStyle, ...styles.pageCell}}>
          <span style={styles.pageCellInner}>
            {pageLabel}
            {!isAnchor ? (
              <span style={{display: 'inline-flex', flexDirection: 'column'}}>
                <button
                  type="button"
                  className="brc-focusable brc-fade"
                  style={{...styles.moveButton, opacity: showControls ? 1 : 0}}
                  aria-label={`Move ${item.slug} up within block ${item.block}`}
                  onClick={() => update(item.id, {move: -1})}>
                  <Icon icon={ChevronUpIcon} size="xsm" color="inherit" />
                </button>
                <button
                  type="button"
                  className="brc-focusable brc-fade"
                  style={{...styles.moveButton, opacity: showControls ? 1 : 0}}
                  aria-label={`Move ${item.slug} down within block ${item.block}`}
                  onClick={() => update(item.id, {move: 1})}>
                  <Icon icon={ChevronDownIcon} size="xsm" color="inherit" />
                </button>
              </span>
            ) : null}
          </span>
        </td>
      ) : null}
      <td style={band === 'C' ? firstCellStyle : cellStyle}>
        {isAnchor ? (
          <div>
            <div style={{...styles.slugTitle, fontSize: 13}}>{item.slug}</div>
            <div style={styles.slugSub}>
              {isHardHit
                ? `hard hit · sched ${fmtClock(item.hardHitSec!)}`
                : 'floats with the show'}
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="brc-focusable"
            style={styles.slugButton}
            aria-label={`Open script for ${pageLabel} ${item.slug}`}
            onClick={e => onSelect(item.id, e.currentTarget)}>
            {/* Non-air-ready rows take the muted slug treatment; the rollup
                ring carries the same signal. */}
            <div style={{...styles.slugTitle, opacity: airReady ? 1 : 0.6}}>{item.slug}</div>
            <div style={styles.slugSub}>{subline}</div>
          </button>
        )}
      </td>
      {band === 'A' ? (
        <td style={cellStyle}>{isAnchor ? null : typeChip}</td>
      ) : null}
      <td style={{...cellStyle, padding: '0 2px'}}>
        <DurationField
          slug={item.slug}
          label={item.durationLabel}
          seconds={item.durationSec}
          showSteppers={showControls}
          onCommit={sec => update(item.id, {durationSec: sec})}
        />
      </td>
      <td style={{...cellStyle, ...styles.backtimeCell}}>
        <span
          style={isAnchor && isHardHit ? {...styles.spine, ...styles.spineTick} : styles.spine}
          aria-hidden
        />
        <span style={{...styles.hitLabel, paddingLeft: 8}}>{entry.hitLabel}</span>
      </td>
      {isAnchor ? (
        <td style={cellStyle} colSpan={2}>
          {isHardHit && entry.deltaSec != null && entry.deltaState != null ? (
            <DeltaChip
              deltaSec={entry.deltaSec}
              state={entry.deltaState}
              compact={band === 'C'}
              ariaLabel={`${item.slug} running ${fmtDelta(entry.deltaSec)} ${DELTA_META[entry.deltaState].word.toLowerCase()} — scroll to hard out`}
              onClick={onScrollToOut}
            />
          ) : (
            <span style={styles.metaLine}>—</span>
          )}
        </td>
      ) : (
        <>
          <td style={{...cellStyle, padding: band === 'C' ? 0 : '0 12px'}}>
            {item.lamps != null ? (
              <ReadinessTallyCell
                slug={item.slug}
                lamps={item.lamps}
                ringOnly={band === 'C'}
                onCycle={lamp => update(item.id, {cycleLamp: lamp})}
              />
            ) : null}
          </td>
          <td style={{...cellStyle, padding: '0 4px'}}>
            <button
              type="button"
              className="brc-focusable"
              style={styles.floatButton}
              aria-pressed={item.floated}
              aria-label={`Float ${item.slug} — remove from timing without deleting`}
              onClick={() => update(item.id, {floated: true})}>
              <Icon icon={ArrowDownToLineIcon} size="xsm" color="inherit" />
            </button>
          </td>
        </>
      )}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// FloatShelf — 72px dock (28px collapsed rail). Cards recompute their ghost
// backtime from the CURRENT timeline: trim A02 by 0:10 and F01's struck
// 'was 18:17:37' becomes 'was 18:17:27' without restoring anything.
// ---------------------------------------------------------------------------

interface FloatShelfProps {
  items: RundownItem[];
  timeline: Timeline;
  open: boolean;
  band: Band;
  update: UpdateFn;
}

function FloatShelf({items, timeline, open, band, update}: FloatShelfProps) {
  const cardWidth = band === 'C' ? 180 : 220;
  return (
    <div style={open ? styles.shelf : {...styles.shelf, ...styles.shelfCollapsed}}>
      <button
        type="button"
        className="brc-focusable"
        style={styles.shelfCap}
        aria-expanded={open}
        onClick={() => update(null, {shelfOpen: !open})}>
        <Icon icon={open ? ChevronDownIcon : ChevronUpIcon} size="xsm" color="secondary" />
        <span style={styles.shelfOverline}>FLOAT SHELF ({items.length})</span>
      </button>
      {open ? (
        <div style={styles.shelfRow}>
          {items.map(item => {
            const entry = timeline.rows.get(item.id);
            return (
              <div key={item.id} style={{...styles.shelfCard, width: cardWidth}}>
                <div style={styles.shelfCardBody}>
                  <span style={styles.shelfSlug}>{item.slug}</span>
                  <span style={styles.shelfMeta}>
                    <span style={styles.shelfDurChip}>{item.durationLabel}</span>
                    <span style={styles.ghostHit}>was {entry?.hitLabel}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="brc-focusable"
                  style={styles.restoreButton}
                  aria-label={`Restore ${item.slug} to the rundown`}
                  onClick={() => update(item.id, {floated: false})}>
                  <Icon icon={Undo2Icon} size="xsm" color="inherit" />
                  RESTORE
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ASIDE — script-and-asset pane for the selected row (400px fixed at Band
// A; overlay panel at Bands B/C).
// ---------------------------------------------------------------------------

interface AsidePaneProps {
  item: RundownItem;
  entry: TimelineEntry | undefined;
  pageLabel: string | undefined;
  tab: AsideTab;
  update: UpdateFn;
  onClose?: () => void;
}

function AsidePane({item, entry, pageLabel, tab, update, onClose}: AsidePaneProps) {
  return (
    <>
      <div style={styles.asideTabs}>
        <button
          type="button"
          className="brc-focusable"
          style={tab === 'script' ? {...styles.asideTab, ...styles.asideTabActive} : styles.asideTab}
          aria-pressed={tab === 'script'}
          onClick={() => update(null, {asideTab: 'script'})}>
          SCRIPT
        </button>
        <button
          type="button"
          className="brc-focusable"
          style={tab === 'assets' ? {...styles.asideTab, ...styles.asideTabActive} : styles.asideTab}
          aria-pressed={tab === 'assets'}
          onClick={() => update(null, {asideTab: 'assets'})}>
          ASSETS
        </button>
        <span style={{flex: 1}} aria-hidden />
        {onClose != null ? (
          <button
            type="button"
            className="brc-focusable"
            style={styles.iconButton}
            aria-label="Close panel"
            onClick={onClose}>
            <Icon icon={XIcon} size="sm" color="inherit" />
          </button>
        ) : null}
      </div>
      <div style={styles.asideBody}>
        <span style={styles.asideOverline}>
          {tab === 'script' ? 'SCRIPT' : 'ASSETS'} — {item.floated ? 'FLOATED' : pageLabel} ·{' '}
          {item.type}
        </span>
        <h2 style={{...styles.asideSlug, margin: 0}}>{item.slug}</h2>
        <span style={styles.metaLine}>
          {item.subline} · {item.durationLabel}
          {item.floated
            ? ` · floated — would hit ${entry?.hitLabel}`
            : ` · hits ${entry?.hitLabel}`}
        </span>
        {tab === 'script' ? (
          <>
            <span
              style={{
                ...styles.typeChip,
                color: item.scriptStatus === 'unlocked' ? HEAVY_TEXT : ON_TEXT,
                borderColor: 'currentcolor',
              }}>
              SCRIPT {item.scriptStatus === 'unlocked' ? 'UNLOCKED' : 'LOCKED'}
            </span>
            <p style={{...styles.scriptNote, margin: 0}}>{item.scriptNote}</p>
          </>
        ) : (
          <>
            {(item.assets ?? []).map(asset => (
              <div key={asset.label} style={styles.assetRow}>
                <Icon
                  icon={
                    asset.kind === 'VT'
                      ? FilmIcon
                      : asset.kind === 'REMOTE'
                        ? RadioTowerIcon
                        : ImageIcon
                  }
                  size="sm"
                  color="secondary"
                />
                <span style={styles.assetSlug}>{asset.label}</span>
                <span style={{...styles.metaLine, flexShrink: 0}}>{asset.status}</span>
              </div>
            ))}
            {(item.assets ?? []).length === 0 ? (
              <span style={styles.metaLine}>No assets attached.</span>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function BroadcastRundownConsoleTemplate() {
  const [state, dispatch] = useReducer(rundownReducer, INITIAL_STATE);
  const update: UpdateFn = useCallback((id, patch) => dispatch({id, patch}), []);

  // Container-width bands (Band A >= 1000 / B 760–999 / C < 760), measured
  // on the view root — the demo stage is ~1045–1075px wide inside a 1440px
  // window, so viewport queries alone would never leave Band A there.
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const rootWidth = useElementWidth(viewRootRef);
  const isViewportB = useMediaQuery('(max-width: 999px)');
  const isViewportC = useMediaQuery('(max-width: 759px)');
  const band: Band =
    rootWidth > 0
      ? rootWidth >= 1000
        ? 'A'
        : rootWidth >= 760
          ? 'B'
          : 'C'
      : isViewportC
        ? 'C'
        : isViewportB
          ? 'B'
          : 'A';
  const isMotionReduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  // PURE derivations — never stored (spec law).
  const timeline = useMemo(() => computeTimeline(state.items), [state.items]);
  const pageLabels = useMemo(() => computePageLabels(state.items), [state.items]);
  const activeContent = state.items.filter(item => item.kind === 'content' && !item.floated);
  const readyCount = activeContent.filter(isAirReady).length;
  const floatedItems = state.items.filter(item => item.floated);
  const selected = state.items.find(item => item.id === state.selectedId) ?? state.items[0];

  // Scroll-to-anchor plumbing.
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const setRowRef = useCallback((id: string, el: HTMLTableRowElement | null) => {
    rowRefs.current[id] = el;
  }, []);
  const scrollToRow = useCallback(
    (id: string) => {
      rowRefs.current[id]?.scrollIntoView({
        block: 'center',
        behavior: isMotionReduced ? 'auto' : 'smooth',
      });
    },
    [isMotionReduced],
  );
  const scrollToOut = useCallback(() => scrollToRow('HARDOUT'), [scrollToRow]);
  const firstNotReadyId = activeContent.find(item => !isAirReady(item))?.id;

  // Polite live region — announces the over/under after every timing
  // mutation (skips the initial paint).
  const [announcement, setAnnouncement] = useState('');
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const meta = DELTA_META[deltaStateOf(timeline.overUnderSec)];
    const word = deltaStateOf(timeline.overUnderSec) === 'exact' ? 'on time' : meta.word.toLowerCase();
    setAnnouncement(`Over/under now ${fmtDelta(timeline.overUnderSec)} ${word}`);
  }, [timeline.overUnderSec]);

  // Overlay (Bands B/C): Escape closes, focus returns to the opener.
  const openerRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const openOverlay = useCallback(
    (tab: AsideTab, opener: HTMLElement | null) => {
      openerRef.current = opener;
      update(null, {asideTab: tab, overlayOpen: true});
    },
    [update],
  );
  const closeOverlay = useCallback(() => {
    update(null, {overlayOpen: false});
    openerRef.current?.focus();
  }, [update]);
  useEffect(() => {
    if (state.overlayOpen && band !== 'A') {
      overlayRef.current?.focus();
    }
  }, [state.overlayOpen, band]);
  const onOverlayKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeOverlay();
    }
  };

  const onSelectRow = useCallback(
    (id: string, opener: HTMLElement | null) => {
      update(id, {selected: true});
      if (band === 'C') {
        openOverlay('script', opener);
      }
    },
    [update, band, openOverlay],
  );

  // Table geometry per band (fixed columns sum 360px at Band A; slug takes
  // the remaining ~285–315px of the ~660px main at demo width).
  const columns: number[] =
    band === 'A'
      ? [40, 0, 56, 64, 88, 76, 36]
      : band === 'B'
        ? [40, 0, 64, 88, 76, 36]
        : [0, 64, 88, 24, 36];
  const headers: string[] =
    band === 'A'
      ? ['PAGE', 'SLUG', 'TYPE', 'DUR', 'BACKTIME', 'READY', 'FLT']
      : band === 'B'
        ? ['PAGE', 'SLUG', 'DUR', 'BACKTIME', 'READY', 'FLT']
        : ['SLUG', 'DUR', 'BACKTIME', 'RDY', 'FLT'];

  const outState = timeline.overUnderState;
  const outMeta = DELTA_META[outState];
  const tableRows = state.items.filter(item => !item.floated);

  return (
    <div style={styles.root}>
      <style>{CONSOLE_CSS}</style>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0}>
            <div ref={viewRootRef} style={styles.viewRoot}>
              {/* [1] Header strip — 56px */}
              <header style={styles.header}>
                <TallyMark />
                <span style={styles.wordmark}>CUELIGHT</span>
                {band === 'A' ? (
                  <h1 style={{...styles.showTitle, margin: 0, fontWeight: 600, fontSize: 13}}>
                    The Six — FRI JUL 04
                  </h1>
                ) : null}
                {band !== 'C' ? (
                  <>
                    <span style={styles.headerSpacer} aria-hidden />
                    <span style={styles.showWindow}>AIR 18:00:00 → HARD OUT 18:28:30</span>
                  </>
                ) : null}
                <span style={styles.headerSpacer} aria-hidden />
                <OverUnderChip
                  overUnderSec={timeline.overUnderSec}
                  state={outState}
                  onClick={scrollToOut}
                />
                <button
                  type="button"
                  className="brc-focusable"
                  style={styles.chip}
                  aria-label={`${readyCount} of ${activeContent.length} rows air-ready — jump to the first row that is not ready`}
                  onClick={() => {
                    if (firstNotReadyId != null) {
                      scrollToRow(firstNotReadyId);
                      update(firstNotReadyId, {selected: true});
                    }
                  }}>
                  {readyCount}/{activeContent.length} AIR-READY
                </button>
                <Tooltip content="Console settings">
                  <button
                    type="button"
                    className="brc-focusable"
                    style={styles.iconButton}
                    aria-label="Console settings">
                    <Icon icon={SettingsIcon} size="sm" color="inherit" />
                  </button>
                </Tooltip>
              </header>
              {/* [2] Body row */}
              <div style={{...styles.body, position: 'relative'}}>
                {/* [2a] Main column: table scroll region + FloatShelf dock */}
                <div style={styles.mainColumn}>
                  <div style={styles.tableScroll}>
                    <table style={styles.table} aria-label="Rundown — The Six, Fri Jul 04">
                      <colgroup>
                        {columns.map((width, i) => (
                          <col key={i} style={width > 0 ? {width} : undefined} />
                        ))}
                      </colgroup>
                      <thead>
                        <tr>
                          {headers.map(label => (
                            <th key={label} scope="col" style={styles.th}>
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map(item => (
                          <RundownRow
                            key={item.id}
                            item={item}
                            pageLabel={pageLabels.get(item.id) ?? item.id}
                            entry={timeline.rows.get(item.id)!}
                            band={band}
                            isSelected={item.id === state.selectedId}
                            update={update}
                            onSelect={onSelectRow}
                            onScrollToOut={scrollToOut}
                            rowRef={setRowRef}
                          />
                        ))}
                        {/* HH3 — the hard out itself, as a synthetic anchor
                            row: computed off-air vs 18:28:30. */}
                        <tr ref={el => setRowRef('HARDOUT', el)}>
                          {band !== 'C' ? (
                            <td style={{...styles.td, ...styles.tdAnchor, ...styles.anchorRule, ...styles.pageCell}}>
                              OUT
                            </td>
                          ) : null}
                          <td
                            style={
                              band === 'C'
                                ? {...styles.td, ...styles.tdAnchor, ...styles.anchorRule}
                                : {...styles.td, ...styles.tdAnchor}
                            }>
                            <div style={{...styles.slugTitle, fontSize: 13}}>HARD OUT</div>
                            <div style={styles.slugSub}>sched 18:28:30 · off-air is computed</div>
                          </td>
                          {band === 'A' ? <td style={{...styles.td, ...styles.tdAnchor}} /> : null}
                          <td style={{...styles.td, ...styles.tdAnchor}}>
                            <span style={styles.metaLine}>—</span>
                          </td>
                          <td style={{...styles.td, ...styles.tdAnchor, ...styles.backtimeCell}}>
                            <span style={{...styles.spine, ...styles.spineTick}} aria-hidden />
                            <span style={{...styles.hitLabel, paddingLeft: 8, color: outMeta.text}}>
                              {timeline.offAirLabel}
                            </span>
                          </td>
                          <td style={{...styles.td, ...styles.tdAnchor}} colSpan={2}>
                            <DeltaChip
                              deltaSec={timeline.overUnderSec}
                              state={outState}
                              compact={band === 'C'}
                              ariaLabel={`Off-air ${timeline.offAirLabel} — ${fmtDelta(timeline.overUnderSec)} against the 18:28:30 hard out`}
                              onClick={scrollToOut}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <FloatShelf
                    items={floatedItems}
                    timeline={timeline}
                    open={state.shelfOpen}
                    band={band}
                    update={update}
                  />
                </div>
                {/* [2b] Aside: 400px pane (A) / 56px icon rail (B) / hidden (C) */}
                {band === 'A' ? (
                  <aside style={styles.aside} aria-label="Script and assets">
                    <AsidePane
                      item={selected}
                      entry={timeline.rows.get(selected.id)}
                      pageLabel={pageLabels.get(selected.id)}
                      tab={state.asideTab}
                      update={update}
                    />
                  </aside>
                ) : null}
                {band === 'B' ? (
                  <div style={styles.asideRail} aria-label="Script and assets rail">
                    <Tooltip content="Script">
                      <button
                        type="button"
                        className="brc-focusable"
                        style={styles.iconButton}
                        aria-label="Open script panel"
                        onClick={e => openOverlay('script', e.currentTarget)}>
                        <Icon icon={ClipboardListIcon} size="sm" color="inherit" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Assets">
                      <button
                        type="button"
                        className="brc-focusable"
                        style={styles.iconButton}
                        aria-label="Open assets panel"
                        onClick={e => openOverlay('assets', e.currentTarget)}>
                        <Icon icon={FilmIcon} size="sm" color="inherit" />
                      </button>
                    </Tooltip>
                  </div>
                ) : null}
                {band !== 'A' && state.overlayOpen ? (
                  <div
                    ref={overlayRef}
                    role="dialog"
                    aria-label={`Script and assets — ${selected.slug}`}
                    tabIndex={-1}
                    style={styles.overlay}
                    onKeyDown={onOverlayKeyDown}>
                    <AsidePane
                      item={selected}
                      entry={timeline.rows.get(selected.id)}
                      pageLabel={pageLabels.get(selected.id)}
                      tab={state.asideTab}
                      update={update}
                      onClose={closeOverlay}
                    />
                  </div>
                ) : null}
              </div>
              {/* Polite announcements: 'Over/under now -0:18 light' etc. */}
              <div aria-live="polite" style={styles.srOnly}>
                <Text type="supporting" size="xsm">
                  {announcement}
                </Text>
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}



