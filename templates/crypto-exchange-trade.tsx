// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one trading pair, SOL-USD on the
 *   fictional Meridian Markets exchange: four candle series — 15m/1H/4H/1D,
 *   48 candles each — produced by a seeded mulberry32 random walk that is
 *   affine-corrected to land exactly on the 168.42 last price; 12 ask and
 *   12 bid order-book levels around a 168.41/168.43 spread; 18 recent
 *   prints ending at the 168.42 last trade; two wallet balances; and three
 *   open orders, one 43% partially filled. The 24h high/low/volume chips
 *   and the 24h delta are DERIVED from the 1H series' trailing 24 candles
 *   so header, chart, and tape always reconcile. No clocks, no
 *   Math.random, no network media.)
 * @output Exchange trading view on a scheme-locked dark stage: 56px top nav
 *   (Meridian Markets cyan wordmark, Trade/Markets/Portfolio/Earn links,
 *   search + alerts + Avatar), a pair header (SOL-USD, 168.42 with signed
 *   24h delta, high/low/volume chips), an SVG candlestick chart with
 *   labeled price/time axes, volume band, dashed last-price line, and a
 *   15m/1H/4H/1D SegmentedControl; an order book column (asks red above a
 *   spread row, bids green below, cumulative depth bars meeting at the
 *   spread), a recent-trades ticker column, a trade ticket card (Buy/Sell
 *   tabs, Market/Limit SegmentedControl, amount input with 25/50/75/Max
 *   chips, maker/taker fee breakdown, cyan confirm CTA), and an
 *   open-orders strip whose partially-filled row carries a fill
 *   ProgressBar and working Cancel buttons.
 * @position Page template; emitted by `astryx template crypto-exchange-trade`
 *
 * Frame: root 100dvh div > Layout height="fill" > LayoutContent padding 0 >
 * one dark stage div (colorScheme pinned to 'dark'). Inside: nav 56px,
 * pair header 64px, then a four-column desk grid — chart column (flex;
 * chart on top, open-orders strip pinned beneath at full width; at
 * tape-hidden widths the strip spans the stage below the desk), order
 * book 264px, recent trades 216px, trade ticket 320px. Chart geometry derives
 * from one 720x318 viewBox (48 slots x 15 units); axis labels are HTML
 * overlays positioned by the same y()/x() scale so gridlines, wicks, and
 * labels stay registered at any width.
 *
 * Responsive contract (breakpoints are the STAGE's measured width via
 * ResizeObserver — the demo host renders templates in a panel narrower
 * than the viewport, so viewport media queries are only the fallback
 * until the first measurement lands):
 * - >1240px: all four columns visible; book and trades scroll internally;
 *   the page itself does not scroll; open-orders strip pinned under the
 *   chart.
 * - <=1240px: the recent-trades ticker column hides (its last print stays
 *   visible as the pair-header price and the book spread row) and the
 *   open-orders strip moves below the desk at full width so all eight
 *   columns stay legible.
 * - <=980px: the desk stacks into one scrolling column — pair header,
 *   chart, trade ticket, order book, open orders — and the nav drops its
 *   link row to brand + icons.
 *
 * Container policy (trading-desk archetype per streaming-browse-home):
 * frame-first custom chrome — panels are bordered stage divs, not Cards;
 * the only Card-like surface is the trade ticket, which is a genuine
 * order-entry widget. Tables are custom monospace rows (order book, tape)
 * because every cell is a tabular numeral at 11-12px density the
 * design-system Table does not reach.
 *
 * Color policy: the ENTIRE page is a scheme-locked dark trading stage
 * (colorScheme: 'dark'), so all custom paint uses explicit literals from
 * the SURFACE CONSTANTS block below (footgun 9) and design-system
 * components resolve their dark tokens. ONE brand accent — Meridian cyan
 * #22D3EE as an explicit literal (locked stage, so no light-dark() pair) —
 * used only for the wordmark, the active nav link, the last-price tag, and
 * the confirm CTA (scoped --color-accent/--color-on-accent re-pin; dark
 * #062A30 text on cyan clears AA at 10.9:1). Green/red are market
 * up/down semantics (not brand): #34D399 / #F87171, both AA on this stage.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  BellIcon,
  ChevronDownIcon,
  HexagonIcon,
  SearchIcon,
  StarIcon,
  XIcon,
} from 'lucide-react';

import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SURFACE CONSTANTS =============
// The whole page is a scheme-locked dark trading stage. Custom (non-token)
// paint uses these literals; Astryx components inside pick up their dark
// tokens because the stage div pins colorScheme to 'dark' (footgun 9).

const PAGE_BG = '#0B0E14';
const PANEL_BG = '#10141D';
const PANEL_BG_RAISED = '#141926';
const PANEL_BORDER = 'rgba(148, 163, 184, 0.16)';
const HAIRLINE = 'rgba(148, 163, 184, 0.10)';
const TEXT = '#E7EBF3';
const TEXT_DIM = 'rgba(231, 235, 243, 0.64)';
const TEXT_FAINT = 'rgba(231, 235, 243, 0.42)';
const ROW_HOVER = 'rgba(148, 163, 184, 0.08)';

// ONE brand accent: Meridian cyan. Explicit literals (locked dark stage).
const BRAND_CYAN = '#22D3EE';
const ON_BRAND_CYAN = '#062A30'; // 10.9:1 on BRAND_CYAN

// Market semantics (up/down), not brand colors.
const UP_GREEN = '#34D399';
const UP_GREEN_SOFT = 'rgba(52, 211, 153, 0.13)';
const DOWN_RED = '#F87171';
const DOWN_RED_SOFT = 'rgba(248, 113, 113, 0.13)';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// Chart geometry: everything derives from this one viewBox scale.
const CHART_W = 720; // 48 slots x 15 units
const CHART_H = 318;
const PRICE_TOP = 6;
const PRICE_H = 208; // candles occupy y 6..214
const VOL_TOP = 232;
const VOL_H = 78; // volume band occupies y 232..310
const SLOT_W = CHART_W / 48;

// ============= DETERMINISTIC FIXTURES =============

const PAIR = 'SOL-USD';
const LAST_PRICE = 168.42;
const BEST_BID = 168.41;
const BEST_ASK = 168.43;
const USD_AVAILABLE = 2450.0;
const SOL_AVAILABLE = 18.6402;
const TAKER_FEE = 0.004; // 0.40%
const MAKER_FEE = 0.0025; // 0.25%
// Fixed "as of" moment: Thu Jul 2 2026 14:30 UTC. No clocks anywhere.
const SERIES_END_MS = Date.UTC(2026, 6, 2, 14, 0, 0);
const AS_OF_LABEL = 'Jul 2, 2026 · 14:30 UTC';

interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number; // SOL
}

/** Deterministic 32-bit PRNG — fixed seeds, so every render and every
 *  session draws the identical series. No Math.random anywhere. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Seeded random walk, affine-corrected so the final close lands EXACTLY
 *  on `endPrice` (= LAST_PRICE) — chart, pair header, and tape agree. */
function buildSeries(
  seed: number,
  startPrice: number,
  endPrice: number,
  vol: number,
): Candle[] {
  const rand = mulberry32(seed);
  const count = 48;
  const closes: number[] = [];
  let p = startPrice;
  for (let i = 0; i < count; i++) {
    p += (rand() - 0.485) * vol;
    closes.push(p);
  }
  const drift = endPrice - closes[count - 1];
  for (let i = 0; i < count; i++) {
    closes[i] += drift * ((i + 1) / count);
  }
  const candles: Candle[] = [];
  for (let i = 0; i < count; i++) {
    const o = round2(i === 0 ? startPrice : closes[i - 1]);
    const c = round2(closes[i]);
    const h = round2(Math.max(o, c) + rand() * vol * 0.45);
    const l = round2(Math.min(o, c) - rand() * vol * 0.45);
    const v = 42000 + Math.round(rand() * 74000);
    candles.push({o, h, l, c, v});
  }
  return candles;
}

type IntervalId = '15m' | '1H' | '4H' | '1D';

interface IntervalDef {
  id: IntervalId;
  minutes: number;
  series: Candle[];
}

const INTERVALS: IntervalDef[] = [
  {id: '15m', minutes: 15, series: buildSeries(7, 166.9, LAST_PRICE, 0.55)},
  {id: '1H', minutes: 60, series: buildSeries(11, 160.8, LAST_PRICE, 1.35)},
  {id: '4H', minutes: 240, series: buildSeries(23, 149.2, LAST_PRICE, 2.6)},
  {id: '1D', minutes: 1440, series: buildSeries(41, 121.5, LAST_PRICE, 4.8)},
];

// 24h stats DERIVED from the 1H series' trailing 24 candles so the pair
// header chips always reconcile with the chart.
const HOUR_SERIES = INTERVALS[1].series;
const LAST_24 = HOUR_SERIES.slice(24);
const DAY_HIGH = LAST_24.reduce((m, k) => Math.max(m, k.h), -Infinity);
const DAY_LOW = LAST_24.reduce((m, k) => Math.min(m, k.l), Infinity);
const DAY_VOL_SOL = LAST_24.reduce((s, k) => s + k.v, 0);
const DAY_VOL_USD = LAST_24.reduce((s, k) => s + k.v * k.c, 0);
const OPEN_24H = LAST_24[0].o;
const DAY_DELTA = round2(LAST_PRICE - OPEN_24H);
const DAY_DELTA_PCT = (DAY_DELTA / OPEN_24H) * 100;
const DAY_UP = DAY_DELTA >= 0;

// ---- Order book: 12 levels a side around the 168.41 / 168.43 spread. ----
interface BookLevel {
  price: number;
  size: number; // SOL
}

const ASKS: BookLevel[] = [
  // ordered best (lowest) first; rendered top-down worst -> best.
  {price: 168.43, size: 14.2},
  {price: 168.45, size: 6.8},
  {price: 168.48, size: 22.5},
  {price: 168.52, size: 9.4},
  {price: 168.55, size: 31.0},
  {price: 168.6, size: 12.7},
  {price: 168.64, size: 45.3},
  {price: 168.71, size: 18.9},
  {price: 168.77, size: 27.6},
  {price: 168.85, size: 52.1},
  {price: 168.94, size: 34.8},
  {price: 169.05, size: 61.4},
];

const BIDS: BookLevel[] = [
  {price: 168.41, size: 11.6},
  {price: 168.39, size: 8.3},
  {price: 168.36, size: 25.1},
  {price: 168.31, size: 15.7},
  {price: 168.27, size: 29.4},
  {price: 168.22, size: 10.2},
  {price: 168.15, size: 48.6},
  {price: 168.08, size: 21.3},
  {price: 167.99, size: 36.9},
  {price: 167.9, size: 55.8},
  {price: 167.81, size: 30.5},
  {price: 167.7, size: 68.2},
];

// ---- Recent trades tape: 18 prints, newest first; the newest print IS
// the 168.42 last price shown in the pair header. ----
interface Print {
  id: string;
  time: string; // HH:MM:SS UTC
  price: number;
  size: number; // SOL
  side: 'buy' | 'sell';
}

const PRINTS: Print[] = [
  {id: 't18', time: '14:29:58', price: 168.42, size: 3.21, side: 'buy'},
  {id: 't17', time: '14:29:54', price: 168.41, size: 0.85, side: 'sell'},
  {id: 't16', time: '14:29:51', price: 168.43, size: 12.4, side: 'buy'},
  {id: 't15', time: '14:29:47', price: 168.41, size: 5.06, side: 'sell'},
  {id: 't14', time: '14:29:40', price: 168.44, size: 1.92, side: 'buy'},
  {id: 't13', time: '14:29:36', price: 168.46, size: 0.4, side: 'buy'},
  {id: 't12', time: '14:29:28', price: 168.44, size: 8.75, side: 'sell'},
  {id: 't11', time: '14:29:21', price: 168.47, size: 2.13, side: 'buy'},
  {id: 't10', time: '14:29:15', price: 168.45, size: 0.62, side: 'sell'},
  {id: 't09', time: '14:29:03', price: 168.48, size: 17.3, side: 'buy'},
  {id: 't08', time: '14:28:55', price: 168.44, size: 4.28, side: 'sell'},
  {id: 't07', time: '14:28:49', price: 168.4, size: 6.51, side: 'sell'},
  {id: 't06', time: '14:28:42', price: 168.38, size: 1.07, side: 'sell'},
  {id: 't05', time: '14:28:31', price: 168.42, size: 9.6, side: 'buy'},
  {id: 't04', time: '14:28:24', price: 168.39, size: 0.33, side: 'sell'},
  {id: 't03', time: '14:28:16', price: 168.37, size: 22.08, side: 'sell'},
  {id: 't02', time: '14:28:09', price: 168.41, size: 2.77, side: 'buy'},
  {id: 't01', time: '14:28:01', price: 168.36, size: 5.94, side: 'sell'},
];

// ---- Open orders: one partially filled (2.15 of 5.00 = 43%). ----
interface OpenOrder {
  id: string;
  market: string;
  side: 'buy' | 'sell';
  type: 'Limit';
  price: number;
  amount: number;
  filled: number;
  unit: string;
  placed: string;
}

type OrderRow = [string, string, 'buy' | 'sell', number, number, number, string, string];

const OPEN_ORDER_ROWS: OrderRow[] = [
  ['ord-58213', 'SOL-USD', 'buy', 165.5, 5.0, 2.15, 'SOL', 'Jul 2, 09:14'],
  ['ord-58204', 'SOL-USD', 'sell', 174.0, 3.25, 0, 'SOL', 'Jul 1, 22:41'],
  ['ord-58197', 'ETH-USD', 'buy', 3120.0, 0.45, 0, 'ETH', 'Jul 1, 18:03'],
];

const OPEN_ORDERS: OpenOrder[] = OPEN_ORDER_ROWS.map(
  ([id, market, side, price, amount, filled, unit, placed]) => ({
    id, market, side, type: 'Limit', price, amount, filled, unit, placed,
  }),
);

// ============= FORMATTERS =============

const fmtUsd = (n: number, dp = 2): string =>
  n.toLocaleString('en-US', {minimumFractionDigits: dp, maximumFractionDigits: dp});

const fmtCompact = (n: number): string => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
};

// prettier-ignore
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Time-axis tick label for candle index i at a given interval. */
function tickLabel(i: number, minutes: number): string {
  const d = new Date(SERIES_END_MS - (47 - i) * minutes * 60000);
  if (minutes >= 1440) {
    return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  }
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Pick a "nice" price-gridline step for a given visible range. */
function niceStep(range: number): number {
  const steps = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50];
  const target = range / 5;
  for (const s of steps) {
    if (s >= target) return s;
  }
  return 100;
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Footgun 6: Layout height="fill" needs a real-height root in the demo.
  root: {height: '100dvh', width: '100%'},
  // The scheme-locked stage; colorScheme 'dark' resolves every light-dark()
  // token inside to its dark value.
  stage: {
    height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0,
    backgroundColor: PAGE_BG, color: TEXT, colorScheme: 'dark',
    fontFamily: 'var(--font-family-body, system-ui, sans-serif)',
  },
  stageScroll: {overflowY: 'auto'},
  nav: {
    height: 56, flexShrink: 0, display: 'flex', alignItems: 'center',
    gap: 'var(--spacing-4)', paddingInline: 'var(--spacing-4)',
    borderBottom: `1px solid ${PANEL_BORDER}`, backgroundColor: PANEL_BG,
  },
  brandMark: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-1-5)',
    color: BRAND_CYAN, fontWeight: 800, letterSpacing: '0.1em', fontSize: 14,
    whiteSpace: 'nowrap',
  },
  navLinks: {display: 'flex', alignItems: 'stretch', gap: 'var(--spacing-1)', alignSelf: 'stretch'},
  navLink: {
    display: 'flex', alignItems: 'center', paddingInline: 'var(--spacing-3)',
    fontSize: 13, fontWeight: 600, color: TEXT_DIM, cursor: 'pointer',
    background: 'none', border: 'none', borderTop: '2px solid transparent',
    borderBottom: '2px solid transparent', fontFamily: 'inherit',
  },
  navLinkActive: {color: BRAND_CYAN, borderBottomColor: BRAND_CYAN},
  navRight: {marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'},
  portfolioChip: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    lineHeight: 1.25, paddingInline: 'var(--spacing-2)',
  },
  // ---- Pair header ----
  pairHeader: {
    minHeight: 64, flexShrink: 0, display: 'flex', alignItems: 'center',
    flexWrap: 'wrap', gap: 'var(--spacing-4)', rowGap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-4)', paddingBlock: 'var(--spacing-2)',
    borderBottom: `1px solid ${PANEL_BORDER}`, backgroundColor: PAGE_BG,
  },
  pairButton: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    background: PANEL_BG_RAISED, border: `1px solid ${PANEL_BORDER}`,
    borderRadius: 'var(--radius-container, 8px)', color: TEXT,
    paddingInline: 'var(--spacing-3)', paddingBlock: 'var(--spacing-1-5)',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  pairGlyph: {
    width: 26, height: 26, borderRadius: '50%', display: 'flex',
    background: 'linear-gradient(135deg, #7C3AED 0%, #22D3EE 100%)',
    alignItems: 'center', justifyContent: 'center', color: '#FFFFFF',
    fontSize: 10, fontWeight: 800,
  },
  lastPrice: {
    fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 22,
    fontWeight: 700, lineHeight: 1.1,
  },
  statChip: {
    display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2,
    paddingInline: 'var(--spacing-3)', borderLeft: `1px solid ${HAIRLINE}`,
    whiteSpace: 'nowrap',
  },
  statLabel: {fontSize: 11, color: TEXT_FAINT},
  statValue: {fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 13, color: TEXT},
  // ---- Desk grid ----
  desk: {
    flex: 1, minHeight: 0, display: 'flex', gap: 1,
    backgroundColor: PANEL_BORDER, borderBottom: `1px solid ${PANEL_BORDER}`,
  },
  deskStacked: {flex: 'none', display: 'flex', flexDirection: 'column'},
  chartCol: {
    flex: 1, minWidth: 0, minHeight: 0, display: 'flex',
    flexDirection: 'column', backgroundColor: PAGE_BG,
  },
  panelCol: {
    flexShrink: 0, minHeight: 0, display: 'flex', flexDirection: 'column',
    backgroundColor: PANEL_BG,
  },
  panelHead: {
    height: 36, flexShrink: 0, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', paddingInline: 'var(--spacing-3)',
    borderBottom: `1px solid ${HAIRLINE}`, fontSize: 12, fontWeight: 700,
    color: TEXT,
  },
  // ---- Chart ----
  chartToolbar: {
    display: 'flex', alignItems: 'center', flexWrap: 'wrap',
    gap: 'var(--spacing-3)', paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)', borderBottom: `1px solid ${HAIRLINE}`,
  },
  ohlcReadout: {
    display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)',
    fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 11,
    color: TEXT_DIM, whiteSpace: 'nowrap', minWidth: 0,
  },
  chartBody: {flex: 1, minHeight: 260, display: 'flex', paddingTop: 'var(--spacing-2)'},
  plotArea: {flex: 1, minWidth: 0, position: 'relative'},
  plotSvg: {display: 'block', width: '100%', height: '100%'},
  yAxis: {width: 56, flexShrink: 0, position: 'relative', borderLeft: `1px solid ${HAIRLINE}`},
  yTick: {
    position: 'absolute', left: 6, transform: 'translateY(-50%)',
    fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 10,
    color: TEXT_FAINT, whiteSpace: 'nowrap',
  },
  lastPriceTag: {
    position: 'absolute', left: 2, transform: 'translateY(-50%)',
    backgroundColor: BRAND_CYAN, color: ON_BRAND_CYAN, fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums', fontSize: 10, fontWeight: 700,
    paddingInline: 4, paddingBlock: 1, borderRadius: 3, whiteSpace: 'nowrap',
  },
  xAxis: {
    position: 'relative', height: 20, flexShrink: 0, marginRight: 56,
    borderTop: `1px solid ${HAIRLINE}`,
  },
  xTick: {
    position: 'absolute', top: 4, transform: 'translateX(-50%)',
    fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 10,
    color: TEXT_FAINT, whiteSpace: 'nowrap',
  },
  volTag: {
    position: 'absolute', left: 8, fontFamily: MONO, fontSize: 10,
    color: TEXT_FAINT, backgroundColor: 'rgba(11, 14, 20, 0.78)',
    paddingInline: 4, paddingBlock: 1, borderRadius: 3,
  },
  // ---- Order book & tape shared row grammar ----
  bookScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  bookColsHead: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', flexShrink: 0,
    paddingInline: 'var(--spacing-3)', paddingBlock: 4, fontSize: 10,
    color: TEXT_FAINT, borderBottom: `1px solid ${HAIRLINE}`,
  },
  bookRow: {
    position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
    paddingInline: 'var(--spacing-3)', height: 21, alignItems: 'center',
    fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 11,
    cursor: 'default',
  },
  depthBar: {position: 'absolute', insetBlock: 1, right: 0, pointerEvents: 'none'},
  cellNum: {textAlign: 'end', position: 'relative'},
  spreadRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingInline: 'var(--spacing-3)', height: 28, flexShrink: 0,
    backgroundColor: PANEL_BG_RAISED, borderBlock: `1px solid ${HAIRLINE}`,
    fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 11,
  },
  // ---- Trade ticket ----
  ticket: {
    display: 'flex', flexDirection: 'column', minHeight: 0,
    overflowY: 'auto', padding: 'var(--spacing-3)', gap: 'var(--spacing-3)',
  },
  sideTabs: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: 2,
    borderRadius: 'var(--radius-container, 8px)',
    backgroundColor: PANEL_BG_RAISED, border: `1px solid ${HAIRLINE}`,
  },
  sideTab: {
    height: 32, border: 'none', borderRadius: 6, background: 'transparent',
    color: TEXT_DIM, fontSize: 13, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  fieldLabelRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'baseline', marginBottom: 4,
  },
  fieldLabel: {fontSize: 12, fontWeight: 600, color: TEXT_DIM},
  fieldUnit: {fontSize: 11, fontFamily: MONO, color: TEXT_FAINT},
  pctChips: {display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 6},
  pctChip: {
    height: 24, borderRadius: 6, border: `1px solid ${PANEL_BORDER}`,
    background: 'transparent', color: TEXT_DIM, fontSize: 11,
    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  feeRow: {
    display: 'flex', justifyContent: 'space-between', fontSize: 12,
    color: TEXT_DIM, paddingBlock: 2,
  },
  feeVal: {fontFamily: MONO, fontVariantNumeric: 'tabular-nums', color: TEXT},
  ticketDivider: {height: 1, backgroundColor: HAIRLINE, border: 'none', margin: 0},
  balanceBox: {
    borderRadius: 'var(--radius-container, 8px)', border: `1px solid ${HAIRLINE}`,
    backgroundColor: PANEL_BG_RAISED, padding: 'var(--spacing-2)',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  // ---- Open orders strip ----
  ordersStrip: {
    flexShrink: 0, borderTop: `1px solid ${PANEL_BORDER}`,
    backgroundColor: PANEL_BG, display: 'flex', flexDirection: 'column',
  },
  orderGrid: {
    display: 'grid', alignItems: 'center', minHeight: 34, fontSize: 12,
    gridTemplateColumns: '86px 52px 56px 90px 138px minmax(120px, 1fr) 96px 72px',
    columnGap: 'var(--spacing-2)', paddingInline: 'var(--spacing-3)',
  },
  ordersScrollX: {overflowX: 'auto'},
  ordersMinW: {minWidth: 760},
  mono: {fontFamily: MONO, fontVariantNumeric: 'tabular-nums'},
  monoEnd: {fontFamily: MONO, fontVariantNumeric: 'tabular-nums', textAlign: 'end'},
};

// Scoped brand re-pin for the ONE accent CTA (precedent:
// storefront-admin-home.tsx). Dark text on cyan clears AA at 10.9:1.
const brandCtaScope = {
  '--color-accent': BRAND_CYAN,
  '--color-on-accent': ON_BRAND_CYAN,
} as CSSProperties;

// ============= TOP NAV =============

const NAV_LINKS = ['Trade', 'Markets', 'Portfolio', 'Earn'] as const;

function TopNav({isCompact}: {isCompact: boolean}) {
  return (
    <nav style={styles.nav} aria-label="Meridian Markets">
      <div style={styles.brandMark}>
        <Icon icon={HexagonIcon} size="sm" color="inherit" />
        <span>MERIDIAN&nbsp;MARKETS</span>
      </div>
      {!isCompact && (
        <div style={styles.navLinks} role="tablist" aria-label="Sections">
          {NAV_LINKS.map(link => (
            <button
              key={link}
              type="button"
              role="tab"
              aria-selected={link === 'Trade'}
              style={{
                ...styles.navLink,
                ...(link === 'Trade' ? styles.navLinkActive : undefined),
              }}>
              {link}
            </button>
          ))}
        </div>
      )}
      <div style={styles.navRight}>
        {!isCompact && (
          <div style={styles.portfolioChip}>
            <span style={{fontSize: 10, color: TEXT_FAINT}}>Portfolio value</span>
            <span style={{...styles.mono, fontSize: 12, fontWeight: 700}}>
              $12,847.31
            </span>
          </div>
        )}
        <IconButton
          label="Search markets"
          size="sm"
          variant="ghost"
          icon={<Icon icon={SearchIcon} size="sm" color="inherit" />}
        />
        <IconButton
          label="Price alerts"
          size="sm"
          variant="ghost"
          icon={<Icon icon={BellIcon} size="sm" color="inherit" />}
        />
        <Avatar name="Priya Raman" size="small" />
      </div>
    </nav>
  );
}

// ============= PAIR HEADER =============

function PairHeader({isCompact}: {isCompact: boolean}) {
  const deltaColor = DAY_UP ? UP_GREEN : DOWN_RED;
  const sign = DAY_UP ? '+' : '';
  return (
    <header style={styles.pairHeader}>
      <button type="button" style={styles.pairButton} aria-label="Change market, current SOL-USD">
        <span style={styles.pairGlyph} aria-hidden="true">
          SOL
        </span>
        <span style={{fontWeight: 700, fontSize: 14}}>{PAIR}</span>
        <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
      </button>
      <Tooltip content="Add SOL-USD to watchlist">
        <IconButton
          label="Add to watchlist"
          size="sm"
          variant="ghost"
          icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
        />
      </Tooltip>
      <div>
        <div style={styles.lastPrice} aria-label={`Last price ${fmtUsd(LAST_PRICE)} US dollars`}>
          ${fmtUsd(LAST_PRICE)}
        </div>
        <div
          style={{
            ...styles.mono,
            fontSize: 12,
            fontWeight: 600,
            color: deltaColor,
          }}>
          {sign}
          {fmtUsd(DAY_DELTA)} ({sign}
          {DAY_DELTA_PCT.toFixed(2)}%) 24h
        </div>
      </div>
      <div style={styles.statChip}>
        <span style={styles.statLabel}>24h high</span>
        <span style={styles.statValue}>${fmtUsd(DAY_HIGH)}</span>
      </div>
      <div style={styles.statChip}>
        <span style={styles.statLabel}>24h low</span>
        <span style={styles.statValue}>${fmtUsd(DAY_LOW)}</span>
      </div>
      <div style={styles.statChip}>
        <span style={styles.statLabel}>24h volume (SOL)</span>
        <span style={styles.statValue}>{fmtCompact(DAY_VOL_SOL)}</span>
      </div>
      {!isCompact && (
        <div style={styles.statChip}>
          <span style={styles.statLabel}>24h volume (USD)</span>
          <span style={styles.statValue}>${fmtCompact(DAY_VOL_USD)}</span>
        </div>
      )}
      <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'}}>
        <Badge label="Spot" variant="neutral" />
        <Text size="xsm" color="secondary">
          {AS_OF_LABEL}
        </Text>
      </div>
    </header>
  );
}

// ============= CANDLESTICK CHART =============

interface ChartScale {
  minP: number;
  maxP: number;
  maxV: number;
  y: (p: number) => number;
  gridPrices: number[];
}

function buildScale(series: Candle[]): ChartScale {
  let minP = Infinity;
  let maxP = -Infinity;
  let maxV = 0;
  for (const k of series) {
    if (k.l < minP) minP = k.l;
    if (k.h > maxP) maxP = k.h;
    if (k.v > maxV) maxV = k.v;
  }
  const pad = (maxP - minP) * 0.06;
  minP -= pad;
  maxP += pad;
  const y = (p: number) => PRICE_TOP + ((maxP - p) / (maxP - minP)) * PRICE_H;
  const step = niceStep(maxP - minP);
  const gridPrices: number[] = [];
  for (let g = Math.ceil(minP / step) * step; g <= maxP; g += step) {
    gridPrices.push(round2(g));
  }
  return {minP, maxP, maxV, y, gridPrices};
}

function CandleChart({
  interval,
  onIntervalChange,
}: {
  interval: IntervalId;
  onIntervalChange: (id: IntervalId) => void;
}) {
  const def = INTERVALS.find(d => d.id === interval) ?? INTERVALS[1];
  const {series, minutes} = def;
  const scale = useMemo(() => buildScale(series), [series]);
  const last = series[series.length - 1];
  const lastUp = last.c >= last.o;
  const lastY = scale.y(last.c);
  // Time ticks every 8 slots -> 6 labels; anchored at slot centers.
  const tickIdx = [2, 10, 18, 26, 34, 42];

  return (
    <section
      aria-label={`SOL-USD ${interval} candlestick chart`}
      style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
      <div style={styles.chartToolbar}>
        <span style={{fontSize: 12, fontWeight: 700}}>Price chart</span>
        <div style={styles.ohlcReadout} aria-label="Latest candle OHLC">
          <span>
            O <span style={{color: TEXT}}>{fmtUsd(last.o)}</span>
          </span>
          <span>
            H <span style={{color: TEXT}}>{fmtUsd(last.h)}</span>
          </span>
          <span>
            L <span style={{color: TEXT}}>{fmtUsd(last.l)}</span>
          </span>
          <span>
            C{' '}
            <span style={{color: lastUp ? UP_GREEN : DOWN_RED}}>
              {fmtUsd(last.c)}
            </span>
          </span>
        </div>
        <div style={{marginLeft: 'auto'}}>
          <SegmentedControl
            value={interval}
            onChange={v => onIntervalChange(v as IntervalId)}
            label="Candle interval"
            size="sm">
            <SegmentedControlItem value="15m" label="15m" />
            <SegmentedControlItem value="1H" label="1H" />
            <SegmentedControlItem value="4H" label="4H" />
            <SegmentedControlItem value="1D" label="1D" />
          </SegmentedControl>
        </div>
      </div>

      <div style={styles.chartBody}>
        <div style={styles.plotArea}>
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            preserveAspectRatio="none"
            style={styles.plotSvg}
            role="img"
            aria-label={`48 ${interval} candles ending ${AS_OF_LABEL}, last close ${fmtUsd(last.c)} dollars`}>
            {/* Horizontal price gridlines */}
            {scale.gridPrices.map(p => (
              <line
                key={`g-${p}`}
                x1={0}
                x2={CHART_W}
                y1={scale.y(p)}
                y2={scale.y(p)}
                stroke={HAIRLINE}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {/* Vertical time gridlines at the labeled ticks */}
            {tickIdx.map(i => (
              <line
                key={`vg-${i}`}
                x1={i * SLOT_W + SLOT_W / 2}
                x2={i * SLOT_W + SLOT_W / 2}
                y1={PRICE_TOP}
                y2={VOL_TOP + VOL_H}
                stroke={HAIRLINE}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {/* Volume band (bottom) */}
            {series.map((k, i) => {
              const up = k.c >= k.o;
              const h = Math.max(2, (k.v / scale.maxV) * VOL_H);
              return (
                <rect
                  key={`v-${i}`}
                  x={i * SLOT_W + 3}
                  y={VOL_TOP + VOL_H - h}
                  width={SLOT_W - 6}
                  height={h}
                  fill={up ? UP_GREEN : DOWN_RED}
                  opacity={0.38}
                />
              );
            })}
            {/* Candles: thin rect wick + body rect */}
            {series.map((k, i) => {
              const up = k.c >= k.o;
              const color = up ? UP_GREEN : DOWN_RED;
              const x = i * SLOT_W;
              const bodyTop = scale.y(Math.max(k.o, k.c));
              const bodyH = Math.max(
                1.2,
                scale.y(Math.min(k.o, k.c)) - bodyTop,
              );
              return (
                <g key={`k-${i}`}>
                  <rect
                    x={x + SLOT_W / 2 - 0.7}
                    y={scale.y(k.h)}
                    width={1.4}
                    height={Math.max(1, scale.y(k.l) - scale.y(k.h))}
                    fill={color}
                  />
                  <rect
                    x={x + 3}
                    y={bodyTop}
                    width={SLOT_W - 6}
                    height={bodyH}
                    fill={color}
                    rx={0.8}
                  />
                </g>
              );
            })}
            {/* Dashed last-price line in the ONE brand accent */}
            <line
              x1={0}
              x2={CHART_W}
              y1={lastY}
              y2={lastY}
              stroke={BRAND_CYAN}
              strokeWidth={1}
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* Volume band label (HTML overlay, same scale) */}
          <span
            style={{...styles.volTag, top: `${(VOL_TOP / CHART_H) * 100}%`}}>
            Vol ({interval}) · max {fmtCompact(scale.maxV)} SOL
          </span>
        </div>
        {/* Price axis: HTML labels registered to the same y() scale */}
        <div style={styles.yAxis} aria-hidden="true">
          {scale.gridPrices.map(p => (
            <span
              key={`yl-${p}`}
              style={{...styles.yTick, top: `${(scale.y(p) / CHART_H) * 100}%`}}>
              {fmtUsd(p)}
            </span>
          ))}
          <span
            style={{
              ...styles.lastPriceTag,
              top: `${(lastY / CHART_H) * 100}%`,
            }}>
            {fmtUsd(last.c)}
          </span>
        </div>
      </div>
      {/* Time axis */}
      <div style={styles.xAxis} aria-hidden="true">
        {tickIdx.map(i => (
          <span
            key={`xl-${i}`}
            style={{
              ...styles.xTick,
              left: `${((i * SLOT_W + SLOT_W / 2) / CHART_W) * 100}%`,
            }}>
            {tickLabel(i, minutes)}
          </span>
        ))}
      </div>
    </section>
  );
}

// ============= ORDER BOOK =============

// Cumulative depth, best level outward; bars meet at the spread row.
const ASK_CUM = ASKS.reduce<number[]>((acc, lvl, i) => {
  acc.push((i === 0 ? 0 : acc[i - 1]) + lvl.size);
  return acc;
}, []);
const BID_CUM = BIDS.reduce<number[]>((acc, lvl, i) => {
  acc.push((i === 0 ? 0 : acc[i - 1]) + lvl.size);
  return acc;
}, []);
const MAX_CUM = Math.max(ASK_CUM[ASK_CUM.length - 1], BID_CUM[BID_CUM.length - 1]);
const SPREAD = round2(BEST_ASK - BEST_BID);
const SPREAD_PCT = (SPREAD / BEST_ASK) * 100;

function BookRow({
  level,
  cum,
  side,
  isHovered,
  onHover,
}: {
  level: BookLevel;
  cum: number;
  side: 'ask' | 'bid';
  isHovered: boolean;
  onHover: (key: string | null) => void;
}) {
  const key = `${side}-${level.price}`;
  const color = side === 'ask' ? DOWN_RED : UP_GREEN;
  const soft = side === 'ask' ? DOWN_RED_SOFT : UP_GREEN_SOFT;
  return (
    <div
      style={{
        ...styles.bookRow,
        backgroundColor: isHovered ? ROW_HOVER : undefined,
      }}
      onMouseEnter={() => onHover(key)}
      onMouseLeave={() => onHover(null)}>
      <div
        style={{
          ...styles.depthBar,
          width: `${(cum / MAX_CUM) * 100}%`,
          backgroundColor: soft,
        }}
        aria-hidden="true"
      />
      <span style={{color, position: 'relative'}}>{fmtUsd(level.price)}</span>
      <span style={{...styles.cellNum, color: TEXT}}>
        {level.size.toFixed(1)}
      </span>
      <span style={{...styles.cellNum, color: TEXT_DIM}}>{cum.toFixed(1)}</span>
    </div>
  );
}

function OrderBook() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <section
      aria-label="Order book"
      style={{display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1}}>
      <div style={styles.panelHead}>
        <span>Order book</span>
        <span style={{...styles.mono, fontSize: 10, color: TEXT_FAINT}}>
          0.01 tick
        </span>
      </div>
      <div style={styles.bookColsHead} aria-hidden="true">
        <span>Price (USD)</span>
        <span style={{textAlign: 'end'}}>Size (SOL)</span>
        <span style={{textAlign: 'end'}}>Total (SOL)</span>
      </div>
      <div style={styles.bookScroll}>
        {/* Asks: worst at top, best ask immediately above the spread row */}
        {[...ASKS].reverse().map((lvl, i) => {
          const idx = ASKS.length - 1 - i;
          return (
            <BookRow
              key={`ask-${lvl.price}`}
              level={lvl}
              cum={ASK_CUM[idx]}
              side="ask"
              isHovered={hovered === `ask-${lvl.price}`}
              onHover={setHovered}
            />
          );
        })}
        <div style={styles.spreadRow}>
          {/* Last price sits in the left slot so it aligns under the
              Price (USD) column like every other price in the book. */}
          <span style={{color: DAY_UP ? UP_GREEN : DOWN_RED, fontWeight: 700}}>
            {fmtUsd(LAST_PRICE)}
          </span>
          <span style={{color: TEXT_FAINT, fontSize: 10}}>
            Spread{' '}
            <span style={{color: TEXT, fontWeight: 700, fontSize: 11}}>
              {fmtUsd(SPREAD)}
            </span>{' '}
            ({SPREAD_PCT.toFixed(3)}%)
          </span>
        </div>
        {/* Bids: best bid immediately below the spread row */}
        {BIDS.map((lvl, i) => (
          <BookRow
            key={`bid-${lvl.price}`}
            level={lvl}
            cum={BID_CUM[i]}
            side="bid"
            isHovered={hovered === `bid-${lvl.price}`}
            onHover={setHovered}
          />
        ))}
      </div>
    </section>
  );
}

// ============= RECENT TRADES TICKER =============

function TradesTicker() {
  return (
    <section
      aria-label="Recent trades"
      style={{display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1}}>
      <div style={styles.panelHead}>
        <span>Recent trades</span>
        <span style={{...styles.mono, fontSize: 10, color: TEXT_FAINT}}>UTC</span>
      </div>
      <div style={styles.bookColsHead} aria-hidden="true">
        <span>Price</span>
        <span style={{textAlign: 'end'}}>Size (SOL)</span>
        <span style={{textAlign: 'end'}}>Time</span>
      </div>
      <div style={styles.bookScroll}>
        {PRINTS.map(p => (
          <div key={p.id} style={styles.bookRow}>
            <span style={{color: p.side === 'buy' ? UP_GREEN : DOWN_RED}}>
              {fmtUsd(p.price)}
            </span>
            <span style={{...styles.cellNum, color: TEXT}}>
              {p.size.toFixed(2)}
            </span>
            <span style={{...styles.cellNum, color: TEXT_FAINT}}>{p.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============= TRADE TICKET =============

type Side = 'buy' | 'sell';
type OrderType = 'market' | 'limit';

function TradeTicket() {
  const [side, setSide] = useState<Side>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [amount, setAmount] = useState('500.00');
  const [limitPrice, setLimitPrice] = useState('168.40');

  const isBuy = side === 'buy';
  const amountNum = Number.parseFloat(amount) || 0;
  const limitNum = Number.parseFloat(limitPrice) || 0;
  // Market orders cross the spread (taker); limit orders rest (maker).
  const execPrice =
    orderType === 'limit' ? limitNum : isBuy ? BEST_ASK : BEST_BID;
  const feeRate = orderType === 'market' ? TAKER_FEE : MAKER_FEE;
  const feeLabel =
    orderType === 'market'
      ? `Fee (${(TAKER_FEE * 100).toFixed(2)}% taker)`
      : `Fee (${(MAKER_FEE * 100).toFixed(2)}% maker)`;

  // Buy: amount is USD spent. Sell: amount is SOL sold.
  const grossUsd = isBuy ? amountNum : amountNum * execPrice;
  const feeUsd = grossUsd * feeRate;
  const receive = isBuy
    ? execPrice > 0
      ? (grossUsd - feeUsd) / execPrice
      : 0
    : grossUsd - feeUsd;

  const available = isBuy ? USD_AVAILABLE : SOL_AVAILABLE;
  const availableLabel = isBuy
    ? `$${fmtUsd(USD_AVAILABLE)} USD`
    : `${SOL_AVAILABLE.toFixed(4)} SOL`;
  const overBalance = amountNum > available + 1e-9;

  const setPct = (pct: number) => {
    const next = available * pct;
    setAmount(isBuy ? next.toFixed(2) : next.toFixed(4));
  };

  const sideColor = isBuy ? UP_GREEN : DOWN_RED;
  const sideSoft = isBuy ? UP_GREEN_SOFT : DOWN_RED_SOFT;
  const ctaLabel = `${isBuy ? 'Buy' : 'Sell'} SOL · ${
    orderType === 'market' ? 'Market' : 'Limit'
  }`;

  return (
    <section aria-label="Trade ticket" style={styles.ticket}>
      <div style={styles.sideTabs} role="tablist" aria-label="Order side">
        {(['buy', 'sell'] as const).map(s => {
          const active = side === s;
          return (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSide(s)}
              style={{
                ...styles.sideTab,
                ...(active
                  ? {
                      backgroundColor: s === 'buy' ? UP_GREEN_SOFT : DOWN_RED_SOFT,
                      color: s === 'buy' ? UP_GREEN : DOWN_RED,
                    }
                  : undefined),
              }}>
              {s === 'buy' ? 'Buy' : 'Sell'}
            </button>
          );
        })}
      </div>

      <SegmentedControl
        value={orderType}
        onChange={v => setOrderType(v as OrderType)}
        label="Order type"
        size="sm"
        layout="fill">
        <SegmentedControlItem value="market" label="Market" />
        <SegmentedControlItem value="limit" label="Limit" />
      </SegmentedControl>

      {orderType === 'limit' && (
        <div>
          <div style={styles.fieldLabelRow}>
            <span style={styles.fieldLabel}>Limit price</span>
            <span style={styles.fieldUnit}>USD</span>
          </div>
          <TextInput
            label="Limit price in USD"
            isLabelHidden
            size="sm"
            width="100%"
            value={limitPrice}
            onChange={setLimitPrice}
            placeholder="0.00"
          />
        </div>
      )}

      <div>
        <div style={styles.fieldLabelRow}>
          <span style={styles.fieldLabel}>Amount</span>
          <span style={styles.fieldUnit}>{isBuy ? 'USD' : 'SOL'}</span>
        </div>
        <TextInput
          label={isBuy ? 'Amount to spend in USD' : 'Amount of SOL to sell'}
          isLabelHidden
          size="sm"
          width="100%"
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          status={overBalance ? {type: 'error', message: 'Exceeds available balance'} : undefined}
        />
        <div style={styles.pctChips}>
          {[0.25, 0.5, 0.75, 1].map(pct => (
            <button
              key={pct}
              type="button"
              style={styles.pctChip}
              onClick={() => setPct(pct)}>
              {pct === 1 ? 'Max' : `${pct * 100}%`}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.balanceBox}>
        <div style={styles.feeRow}>
          <span>Available to {isBuy ? 'buy with' : 'sell'}</span>
          <span style={styles.feeVal}>{availableLabel}</span>
        </div>
        <div style={styles.feeRow}>
          <span>{orderType === 'market' ? `Est. price (${isBuy ? 'ask' : 'bid'})` : 'Limit price'}</span>
          <span style={styles.feeVal}>${fmtUsd(execPrice)}</span>
        </div>
      </div>

      <div>
        <div style={styles.feeRow}>
          <span>Order total</span>
          <span style={styles.feeVal}>${fmtUsd(grossUsd)}</span>
        </div>
        <div style={styles.feeRow}>
          <span>{feeLabel}</span>
          <span style={styles.feeVal}>-${fmtUsd(feeUsd)}</span>
        </div>
        <hr style={styles.ticketDivider} />
        <div style={{...styles.feeRow, paddingTop: 6}}>
          <span style={{color: TEXT, fontWeight: 600}}>
            {isBuy ? 'Est. SOL received' : 'Est. USD received'}
          </span>
          <span style={{...styles.feeVal, fontWeight: 700, color: sideColor}}>
            {isBuy ? `${receive.toFixed(4)} SOL` : `$${fmtUsd(receive)}`}
          </span>
        </div>
      </div>

      {/* The ONE brand-accent CTA: scoped --color-accent re-pin. */}
      <div style={brandCtaScope}>
        <Button
          label={ctaLabel}
          variant="primary"
          size="lg"
          isDisabled={overBalance || amountNum <= 0 || (orderType === 'limit' && limitNum <= 0)}
          style={{width: '100%'}}
        />
      </div>
      <Text size="xsm" color="secondary">
        Demo venue — orders are simulated. Maker {`${(MAKER_FEE * 100).toFixed(2)}%`} /
        taker {`${(TAKER_FEE * 100).toFixed(2)}%`} fee tier: Tide 2.
      </Text>
    </section>
  );
}

// ============= OPEN ORDERS STRIP =============

function OpenOrdersStrip() {
  const [orders, setOrders] = useState<OpenOrder[]>(OPEN_ORDERS);
  const cancel = (id: string) =>
    setOrders(prev => prev.filter(o => o.id !== id));

  return (
    <section aria-label="Open orders" style={styles.ordersStrip}>
      <div style={styles.panelHead}>
        <span>
          Open orders{' '}
          <span style={{color: TEXT_FAINT, fontWeight: 400}}>
            ({orders.length})
          </span>
        </span>
        <span style={{fontSize: 10, color: TEXT_FAINT}}>
          Fills settle instantly to your Meridian wallet
        </span>
      </div>
      <div style={styles.ordersScrollX}>
        <div style={styles.ordersMinW}>
          <div
            style={{
              ...styles.orderGrid,
              minHeight: 26,
              fontSize: 10,
              color: TEXT_FAINT,
              borderBottom: `1px solid ${HAIRLINE}`,
            }}
            aria-hidden="true">
            <span>Market</span>
            <span>Side</span>
            <span>Type</span>
            <span style={{textAlign: 'end'}}>Price</span>
            <span style={{textAlign: 'end'}}>Amount</span>
            <span>Filled</span>
            <span>Placed</span>
            <span style={{textAlign: 'end'}}>Action</span>
          </div>
          {orders.map(o => {
            const pct = Math.round((o.filled / o.amount) * 100);
            const partial = o.filled > 0;
            return (
              <div
                key={o.id}
                style={{
                  ...styles.orderGrid,
                  borderBottom: `1px solid ${HAIRLINE}`,
                }}>
                <span style={{fontWeight: 600}}>{o.market}</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: o.side === 'buy' ? UP_GREEN : DOWN_RED,
                  }}>
                  {o.side === 'buy' ? 'Buy' : 'Sell'}
                </span>
                <span style={{color: TEXT_DIM}}>{o.type}</span>
                <span style={styles.monoEnd}>${fmtUsd(o.price)}</span>
                <span style={styles.monoEnd}>
                  {o.filled > 0
                    ? `${o.filled.toFixed(2)} / ${o.amount.toFixed(2)} ${o.unit}`
                    : `${o.amount.toFixed(2)} ${o.unit}`}
                </span>
                <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <ProgressBar
                    label={`${o.market} ${o.side} order ${pct}% filled`}
                    isLabelHidden
                    value={pct}
                    max={100}
                    variant={partial ? 'accent' : 'neutral'}
                    // Footgun 12: ProgressBar enforces minWidth 48; re-pin
                    // so the bar fits its grid cell. brandCtaScope keeps the
                    // 'accent' fill on the ONE Meridian cyan.
                    style={{minWidth: 0, width: 64, flexShrink: 0, ...brandCtaScope}}
                  />
                  <span
                    style={{
                      ...styles.mono,
                      fontSize: 11,
                      color: partial ? TEXT : TEXT_DIM,
                    }}>
                    {pct}%
                  </span>
                  {partial && <Badge label="Partial" variant="warning" />}
                </span>
                <span style={{...styles.mono, fontSize: 11, color: TEXT_FAINT}}>
                  {o.placed}
                </span>
                <span style={{textAlign: 'end'}}>
                  <Button
                    label="Cancel"
                    size="sm"
                    variant="ghost"
                    icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                    clickAction={() => cancel(o.id)}
                  />
                </span>
              </div>
            );
          })}
          {orders.length === 0 && (
            <div
              style={{
                paddingInline: 'var(--spacing-3)',
                paddingBlock: 'var(--spacing-3)',
                fontSize: 12,
                color: TEXT_FAINT,
              }}>
              No open orders. Fills and cancellations appear in your account
              activity.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============= PAGE =============

/**
 * Observe the stage's real width. The demo host renders templates in a
 * panel narrower than the viewport, so viewport media queries alone
 * cannot tell when the four-column desk is out of room (precedent:
 * table-index-detail.tsx).
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

export default function CryptoExchangeTradeTemplate() {
  // Viewport queries are only the pre-measurement fallback; once the
  // stage reports its width the breakpoints run on container width.
  const viewportHidesTape = useMediaQuery('(max-width: 1240px)');
  const viewportStacks = useMediaQuery('(max-width: 980px)');
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stageWidth = useElementWidth(stageRef);
  const hideTape = stageWidth > 0 ? stageWidth <= 1240 : viewportHidesTape;
  const isStacked = stageWidth > 0 ? stageWidth <= 980 : viewportStacks;
  const [chartInterval, setChartInterval] = useState<IntervalId>('1H');

  const chartColumn = (
    <div style={{...styles.chartCol, ...(isStacked ? {minHeight: 460} : undefined)}}>
      <CandleChart interval={chartInterval} onIntervalChange={setChartInterval} />
      {!isStacked && !hideTape && <OpenOrdersStrip />}
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        content={
          <LayoutContent padding={0}>
            <div
              ref={stageRef}
              style={{
                ...styles.stage,
                ...(isStacked ? styles.stageScroll : undefined),
              }}>
              <TopNav isCompact={isStacked} />
              <PairHeader isCompact={hideTape} />
              <div
                style={{
                  ...styles.desk,
                  ...(isStacked ? styles.deskStacked : undefined),
                }}>
                {chartColumn}
                {isStacked && (
                  <div style={{...styles.panelCol, width: '100%'}}>
                    <TradeTicket />
                  </div>
                )}
                <div
                  style={{
                    ...styles.panelCol,
                    width: isStacked ? '100%' : 264,
                    ...(isStacked ? {maxHeight: 560} : undefined),
                  }}>
                  <OrderBook />
                </div>
                {!hideTape && !isStacked && (
                  <div style={{...styles.panelCol, width: 216}}>
                    <TradesTicker />
                  </div>
                )}
                {!isStacked && (
                  <div style={{...styles.panelCol, width: 320}}>
                    <TradeTicket />
                  </div>
                )}
                {isStacked && <OpenOrdersStrip />}
              </div>
              {/* At tape-hidden desk widths the chart column is too narrow
                  for the eight-column orders grid, so the strip spans the
                  full stage below the desk instead. */}
              {hideTape && !isStacked && <OpenOrdersStrip />}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
