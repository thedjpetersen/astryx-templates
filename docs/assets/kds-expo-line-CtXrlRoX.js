var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — one dinner service at Harbor & Vine
 *   on the Brigade KDS: 6 open tickets (TKT_0412…0418) + 2 bumped recalls
 *   (TKT_0409/0410), a flat line array with dual numeric/display fields
 *   (elapsedMin/elapsedDisplay, cookRemainMin/cookRemainDisplay), four
 *   stations, and an 86 list (Duck Confit, Oysters). No Date.now(), no
 *   Math.random(), no network assets — every elapsed value is a fixture
 *   integer and every relative time a pre-computed string.
 * @output Brigade — KDS Expo Line: an expeditor's kitchen display. A
 *   horizontally scrolling rail of fixed-width fire tickets (oldest,
 *   most-urgent leftmost) whose 32px rows carry inline tri-state
 *   hold/fire/plate segment controls, radial ticket-age chips (outer
 *   age-vs-target arc, inner course-progress ring), per-station load
 *   meters, and a pinned 320px expo aside with all-day counts, 86'd
 *   items, and a recall stack. One state owner: plating a line visibly
 *   ripples across the row, the ticket chip, the station meter, and the
 *   all-day counts — all derived, never stored.
 * @position Page template; emitted by \`astryx template kds-expo-line\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (48px bar: brand cluster | station tablist | expo identity)
 *   | content (40px all-day strip → ticket rail, horizontal scroll,
 *     244px columns with internal column scroll)
 *   | end panel 320 (station meters → all-day list → 86'd block →
 *     recall stack footer), own scroll.
 * Container policy: app-shell archetype — frame rows, rails, and panels;
 *   no Cards. Ticket columns are bordered divs on the content surface;
 *   the expo aside is a LayoutPanel.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (#E8590C as a light-dark pair) used only for the knife-tick mark
 *   fill and the active-station tab underline. Age-arc / fire-state
 *   colors are data-viz categorical tokens with the repo-standard
 *   light-dark fallbacks; every soft wash is a light-dark pair. Fire
 *   states are never color-only (H/F/P letterforms + fill).
 *
 * DENSITY GRID (obeyed everywhere): header bar 48px; all-day strip 40px;
 * CourseFireRow 32px (modifier microrows +16px each, indented 28px);
 * aside list rows 36px; ticket column width 244px fixed; ticket column
 * header 44px; ticket column footer (bump bar) 32px; expo aside 320px
 * fixed; gutter token GUTTER = 8px (the only spacing literal besides 4px
 * microgaps); TicketAgeChip 36px diameter / 3px arc stroke;
 * StationLoadMeter row 36px with 12px track; station tab 32px tall (40px
 * icon-only when collapsed); corner radius 6px on tickets, 4px on
 * chips/segments.
 *
 * Responsive contract (CONTAINER width via useElementWidth on the view
 * root — the demo stage is ~1045–1075px inside a 1440px window, so
 * viewport queries only serve the first pre-observer frame). Strictly
 * subtractive:
 * - >= 1024px: full layout — 320px aside + 244px columns + labeled
 *   station tabs + all-day strip.
 * - 880–1023px: aside unmounts; a 'Recalls (2)' pill appears top-right
 *   (click restores the most recent bumped ticket); the all-day strip
 *   becomes the sole aggregate surface and gains the 86'd chips at its
 *   tail; station meters fold into the tab count badges.
 * - 700–879px: station tabs collapse to 40px icon-only with count badge;
 *   the all-day strip trims to the top-4 chips + an overflow chip.
 * - < 700px: ticket columns narrow 244→216px and the 'TBL 21 · DANA R.'
 *   microtext drops from column headers.
 * Nothing new is ever added at smaller widths; the rail stays
 * horizontally scrollable at every band.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

import {
  BanIcon,
  CookingPotIcon,
  FlameIcon,
  SnowflakeIcon,
  Undo2Icon,
  UtensilsIcon,
} from 'lucide-react';

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens carry the repo-standard fallback pairs (the demo does not inject
// them).
// ---------------------------------------------------------------------------

// THE one quarantined brand literal — knife-tick mark fill + active-station
// tab underline ONLY. Both usages are non-text (a 24px glyph fill and a 2px
// decorative underline that always pairs with aria-selected + label weight),
// so 4.5:1 text contrast does not apply to it.
const BRAND = 'light-dark(#E8590C, #FF7A2E)';

const OK = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const OK_SOFT = 'light-dark(rgba(11, 153, 31, 0.14), rgba(52, 199, 89, 0.22))';
// Plated-segment letterform: #14532D on the light green wash ≈ 9.9:1;
// #8FF0A4 on the dark wash over --color-background-card ≈ 8.4:1.
const OK_TEXT = 'light-dark(#14532D, #8FF0A4)';
// Bump-button label: #FFFFFF on #0B991F ≈ 4.6:1; #1A1A1A on the lighter
// dark-scheme green #34C759 ≈ 8.1:1.
const OK_FILL_TEXT = 'light-dark(#FFFFFF, #1A1A1A)';

const WARN = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const WARN_SOFT = 'light-dark(rgba(235, 110, 0, 0.16), rgba(255, 147, 48, 0.24))';
// Fired-segment letterform: #7C2D12 on the light amber wash ≈ 9.6:1;
// #FFC38A on the dark wash ≈ 9.0:1.
const WARN_TEXT = 'light-dark(#7C2D12, #FFC38A)';

const RED = 'light-dark(#DC2626, #F87171)';
const RED_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
// 86'd row / over-target text: #B91C1C on the light red wash ≈ 6.3:1;
// #FCA5A5 on the dark wash ≈ 9.2:1.
const RED_TEXT = 'light-dark(#B91C1C, #FCA5A5)';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// The only spacing literal besides 4px microgaps (density grid).
const GUTTER = 8;

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings and the 120ms plated-row collapse (32→24px, spec'd
// height animation; the reduced-motion guard removes it). No continuous
// animation anywhere — arcs are static path math, there is no clock.
// ---------------------------------------------------------------------------

const KDS_CSS = \`
.kds-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.kds-line-row {
  transition: height 120ms ease, opacity 120ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .kds-line-row { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%', overflow: 'hidden'},
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    border: 0,
    clipPath: 'inset(50%)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  // Header bar 48px (density grid) — brand cluster | tablist | expo id.
  headerBar: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    overflow: 'hidden',
  },
  brandCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  wordmark: {fontSize: 14, fontWeight: 700, letterSpacing: '0.02em'},
  microLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  openPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingInline: GUTTER,
    borderRadius: 4,
    border: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary, inherit)',
  },
  tablist: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 4,
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  // Station tab 32px tall; 40px icon-only when collapsed (density grid).
  stationTab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 32,
    alignSelf: 'center',
    paddingInline: GUTTER,
    border: 'none',
    borderRadius: 4,
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
    position: 'relative',
  },
  stationTabIconOnly: {width: 40, height: 40, justifyContent: 'center', paddingInline: 0},
  stationTabActive: {color: 'var(--color-text-primary, inherit)'},
  // Decorative brand underline — always paired with aria-selected + weight.
  tabUnderline: {
    position: 'absolute',
    insetInline: 4,
    bottom: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: BRAND,
  },
  tabBadge: {
    fontFamily: MONO,
    fontSize: 10,
    fontVariantNumeric: 'tabular-nums',
    paddingInline: 4,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
  },
  expoCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  recallPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingInline: GUTTER,
    borderRadius: 4,
    border: \`1px solid \${WARN}\`,
    background: 'none',
    cursor: 'pointer',
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    color: WARN_TEXT,
    whiteSpace: 'nowrap',
  },
  // All-day strip 40px (density grid) — horizontally scrollable chip row.
  allDayStrip: {
    height: 40,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: GUTTER,
    overflowX: 'auto',
    overflowY: 'hidden',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  // AllDayChip — 28px pill inside the 40px strip.
  allDayChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 28,
    paddingInline: GUTTER,
    borderRadius: 4,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'none',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  allDayChipActive: {
    borderColor: 'var(--color-accent)',
    color: 'var(--color-text-primary, inherit)',
  },
  allDayCount: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary, inherit)',
  },
  eightySixDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: RED,
    flexShrink: 0,
  },
  // TICKET RAIL — horizontal scroll, GUTTER gaps/padding (density grid).
  rail: {
    flex: 1,
    minHeight: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    display: 'flex',
    gap: GUTTER,
    padding: GUTTER,
    alignItems: 'stretch',
  },
  // TicketColumn — 244px fixed (216px < 700px band), 6px ticket radius.
  ticketColumn: {
    width: 244,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  ticketColumnRush: {borderTop: \`2px solid \${RED}\`},
  ticketColumnHighlight: {outline: '2px solid var(--color-accent)', outlineOffset: -2},
  // Ticket column header 44px (density grid).
  ticketHeader: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    flexShrink: 0,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  ageChipButton: {
    width: 36,
    height: 36,
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'inline-flex',
    borderRadius: 18,
  },
  ticketNo: {
    fontFamily: MONO,
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.2,
  },
  ticketMicro: {
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  elapsedOver: {color: RED_TEXT, fontFamily: MONO, fontSize: 11, fontWeight: 700},
  elapsedOk: {
    color: 'var(--color-text-secondary)',
    fontFamily: MONO,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
  },
  ticketBody: {flex: 1, minHeight: 0, overflowY: 'auto', padding: \`4px \${GUTTER}px\`},
  // Course divider — 16px microlabel between course groups.
  courseDivider: {
    height: 16,
    display: 'flex',
    alignItems: 'center',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--color-text-secondary)',
  },
  // CourseFireRow — 32px composite row, 4px microgaps (density grid).
  lineRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  seatBox: {
    width: 20,
    height: 20,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--color-border)',
    borderRadius: 4,
    fontFamily: MONO,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  lineName: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  lineNamePlated: {textDecoration: 'line-through', opacity: 0.55},
  qty: {
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // Fire segment control 78x24 — three 26x24 segments, 4px outer radius.
  fireGroup: {
    display: 'inline-flex',
    width: 78,
    height: 24,
    flexShrink: 0,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fireSegment: {
    width: 26,
    height: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    padding: 0,
    color: 'var(--color-text-secondary)',
  },
  // Modifier microrow — 16px, indented 28px (density grid).
  modifierRow: {
    height: 16,
    display: 'flex',
    alignItems: 'center',
    paddingInlineStart: 28,
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Ticket column footer (bump bar) 32px (density grid).
  ticketFooter: {
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: 'var(--border-width) solid var(--color-border)',
    paddingInline: 4,
  },
  bumpButton: {
    width: '100%',
    height: 24,
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    backgroundColor: OK,
    color: OK_FILL_TEXT,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
  },
  footerMicro: {
    fontFamily: MONO,
    fontSize: 10,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.06em',
  },
  // ASIDE — 320px fixed; sections stacked, all-day list owns the scroll.
  aside: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  asideSection: {padding: GUTTER, flexShrink: 0},
  asideHeader: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: 'var(--color-text-secondary)',
    marginBottom: 4,
  },
  // StationLoadMeter row 36px with 12px track (density grid).
  meterRow: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
  },
  meterLabel: {
    width: 56,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  meterTrack: {
    flex: 1,
    minWidth: 0,
    height: 12,
    borderRadius: 4,
    border: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    gap: 1,
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  meterTrackEmpty: {border: '1px dashed var(--color-border)'},
  meterSegment: {
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: MONO,
    fontSize: 9,
    lineHeight: 1,
    minWidth: 0,
  },
  meterCount: {
    width: 24,
    flexShrink: 0,
    textAlign: 'right',
    fontFamily: MONO,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
  },
  // Aside list rows — 36px (density grid).
  asideRow: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    width: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    paddingInline: 4,
    borderRadius: 4,
    textAlign: 'start',
    fontSize: 12,
    color: 'var(--color-text-primary, inherit)',
  },
  asideRowName: {
    flex: 1,
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  asideRowCount: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  allDayList: {flex: 1, minHeight: 0, overflowY: 'auto', padding: GUTTER},
  eightySixRow: {color: RED_TEXT, backgroundColor: RED_SOFT},
  recallRow: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: 4,
  },
  divider: {
    borderTop: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
};

// ---------------------------------------------------------------------------
// DATA — one dinner service at Harbor & Vine. Frozen consts, zero
// Date.now()/Math.random(); every elapsed value is a fixture integer with a
// pre-computed display twin. Signed-in user: expeditor M. Osei.
//
// AGGREGATES CROSS-CHECK STRUCTURALLY: all-day counts, station meter
// segments, per-ticket platedCount, and the header open-ticket pill are all
// DERIVED at render from LINES — never stored — so they cannot drift.
// Assertion: ribeye unplated across TKT_0412 (qty 1) / TKT_0415 (qty 1) /
// TKT_0417 (qty 2) = 4 → the all-day RIBEYE chip reads 4 on load.
// ---------------------------------------------------------------------------

const ST_GRILL = 'st-grill';
const ST_SAUTE = 'st-saute';
const ST_FRY = 'st-fry';
const ST_COLD = 'st-cold';

const IT_RIBEYE = 'it-ribeye';
const IT_HALIBUT = 'it-halibut';
const IT_GNOCCHI = 'it-gnocchi';
const IT_CAESAR = 'it-caesar';
const IT_BURGER = 'it-burger';
const IT_FRIES = 'it-fries';
const IT_DUCK = 'it-duck';
const IT_OYSTERS = 'it-oysters';
const IT_TART = 'it-tart';

const TKT_0409 = 'tkt-0409';
const TKT_0410 = 'tkt-0410';
const TKT_0412 = 'tkt-0412';
const TKT_0413 = 'tkt-0413';
const TKT_0415 = 'tkt-0415';
const TKT_0416 = 'tkt-0416';
const TKT_0417 = 'tkt-0417';
const TKT_0418 = 'tkt-0418';

interface StationFixture {
  id: string;
  label: string;
  icon: typeof FlameIcon;
}

const STATIONS: StationFixture[] = [
  {id: ST_GRILL, label: 'Grill', icon: FlameIcon},
  {id: ST_SAUTE, label: 'Sauté', icon: CookingPotIcon},
  {id: ST_FRY, label: 'Fry', icon: UtensilsIcon},
  {id: ST_COLD, label: 'Cold', icon: SnowflakeIcon},
];

interface ItemFixture {
  id: string;
  short: string; // all-day chip label
  name: string;
}

const ITEMS: Record<string, ItemFixture> = {
  // 45-char name — exists to exercise ellipsis in the 244px column and the
  // 216px < 700px band (stress fixture; also truncates in the 320px aside).
  [IT_RIBEYE]: {id: IT_RIBEYE, short: 'RIBEYE', name: 'Dry-Aged Ribeye au Poivre, Bone-Marrow Butter'},
  [IT_HALIBUT]: {id: IT_HALIBUT, short: 'HALIBUT', name: 'Pan-Seared Halibut, Brown Butter'},
  [IT_GNOCCHI]: {id: IT_GNOCCHI, short: 'GNOCCHI', name: 'Ricotta Gnocchi'},
  [IT_CAESAR]: {id: IT_CAESAR, short: 'CAESAR', name: 'Little Gem Caesar'},
  [IT_BURGER]: {id: IT_BURGER, short: 'BURGER', name: 'Brigade Burger'},
  [IT_FRIES]: {id: IT_FRIES, short: 'FRIES', name: 'Duck-Fat Fries'},
  [IT_DUCK]: {id: IT_DUCK, short: 'DUCK', name: 'Duck Confit'},
  [IT_OYSTERS]: {id: IT_OYSTERS, short: 'OYSTERS', name: 'Oysters, Half Dozen'},
  [IT_TART]: {id: IT_TART, short: 'TART', name: 'Chocolate Tart'},
};

type Course = 'app' | 'main' | 'dessert';
type FireState = 'hold' | 'fired' | 'plated';
type TicketFireState = 'hold' | 'fired' | 'done';

interface TicketFixture {
  id: string;
  no: string; // '0415'
  table: string; // 'TBL 21'
  server: string; // 'Dana R.'
  course: Course; // dominant course → age-chip center glyph
  elapsedMin: number;
  targetMin: number;
  elapsedDisplay: string; // dual field of elapsedMin
  status: 'open' | 'bumped';
  rush: boolean;
  bumpSeq: number; // 0 = never bumped; recall stack sorts descending
  bumpedLabel?: string; // pre-computed, e.g. 'bumped after 14m'
}

// Rail order derives from elapsedMin (oldest/most-urgent leftmost, rush
// pinned to the front) — TKT_0415 at 18m of a 15m target sits far-left with
// a fully swept red arc + rush border (over-target stress fixture).
const TICKETS: TicketFixture[] = [
  {id: TKT_0415, no: '0415', table: 'TBL 21', server: 'Dana R.', course: 'main', elapsedMin: 18, targetMin: 15, elapsedDisplay: '18m', status: 'open', rush: true, bumpSeq: 0},
  {id: TKT_0412, no: '0412', table: 'TBL 14', server: 'Dana R.', course: 'main', elapsedMin: 12, targetMin: 15, elapsedDisplay: '12m', status: 'open', rush: false, bumpSeq: 0},
  {id: TKT_0413, no: '0413', table: 'BAR 3', server: 'Miguel A.', course: 'app', elapsedMin: 9, targetMin: 12, elapsedDisplay: '9m', status: 'open', rush: false, bumpSeq: 0},
  {id: TKT_0416, no: '0416', table: 'TBL 8', server: 'Priya K.', course: 'main', elapsedMin: 7, targetMin: 15, elapsedDisplay: '7m', status: 'open', rush: false, bumpSeq: 0},
  {id: TKT_0417, no: '0417', table: 'TBL 30', server: 'Miguel A.', course: 'main', elapsedMin: 6, targetMin: 20, elapsedDisplay: '6m', status: 'open', rush: false, bumpSeq: 0},
  {id: TKT_0418, no: '0418', table: 'TBL 5', server: 'Priya K.', course: 'main', elapsedMin: 2, targetMin: 12, elapsedDisplay: '2m', status: 'open', rush: false, bumpSeq: 0},
  // Recall stack pre-seed — the BR corner is never empty on load.
  {id: TKT_0410, no: '0410', table: 'TBL 19', server: 'Dana R.', course: 'dessert', elapsedMin: 11, targetMin: 12, elapsedDisplay: '11m', status: 'bumped', rush: false, bumpSeq: 2, bumpedLabel: 'bumped after 11m'},
  {id: TKT_0409, no: '0409', table: 'TBL 12', server: 'Miguel A.', course: 'main', elapsedMin: 14, targetMin: 15, elapsedDisplay: '14m', status: 'bumped', rush: false, bumpSeq: 1, bumpedLabel: 'bumped after 14m'},
];

interface LineFixture {
  id: string;
  ticketId: string;
  itemId: string;
  name: string;
  stationId: string;
  seat?: number; // omitted on shared sides / bar orders
  qty: number;
  course: 1 | 2;
  fireState: FireState;
  cookRemainMin: number;
  cookRemainDisplay: string; // dual field of cookRemainMin
  modifiers: string[];
  allergyNote?: string;
}

// Kitchen-shorthand prose only ('sub GF bun', 'temp: med-rare', 'SOS
// ranch'). Stress fixtures baked in: TKT_0417 carries 9 lines across 2
// courses (internal column scroll); TKT_0416 course 2 is all 'hold';
// TKT_0412 loads with 2 lines already plated (struck rows with zero
// interaction); ST_COLD has exactly ONE unplated line (ln-0413-3) so
// plating it live produces the dashed empty-track meter.
const LINES: LineFixture[] = [
  // TKT_0415 — 3 of 5 plated; ln-0415-2 is the signature-interaction ribeye.
  {id: 'ln-0415-1', ticketId: TKT_0415, itemId: IT_CAESAR, name: ITEMS[IT_CAESAR].name, stationId: ST_COLD, seat: 1, qty: 1, course: 1, fireState: 'plated', cookRemainMin: 0, cookRemainDisplay: '0m', modifiers: []},
  {id: 'ln-0415-3', ticketId: TKT_0415, itemId: IT_GNOCCHI, name: ITEMS[IT_GNOCCHI].name, stationId: ST_SAUTE, seat: 3, qty: 1, course: 1, fireState: 'plated', cookRemainMin: 0, cookRemainDisplay: '0m', modifiers: []},
  {id: 'ln-0415-2', ticketId: TKT_0415, itemId: IT_RIBEYE, name: ITEMS[IT_RIBEYE].name, stationId: ST_GRILL, seat: 2, qty: 1, course: 2, fireState: 'fired', cookRemainMin: 2, cookRemainDisplay: '2m', modifiers: ['temp: med-rare', 'sauce on side']},
  {id: 'ln-0415-4', ticketId: TKT_0415, itemId: IT_HALIBUT, name: ITEMS[IT_HALIBUT].name, stationId: ST_SAUTE, seat: 1, qty: 1, course: 2, fireState: 'plated', cookRemainMin: 0, cookRemainDisplay: '0m', modifiers: []},
  {id: 'ln-0415-5', ticketId: TKT_0415, itemId: IT_FRIES, name: ITEMS[IT_FRIES].name, stationId: ST_FRY, qty: 1, course: 2, fireState: 'fired', cookRemainMin: 1, cookRemainDisplay: '1m', modifiers: ['SOS ranch']},
  // TKT_0412 — loads with 2 plated (struck/collapsed rows on load).
  {id: 'ln-0412-1', ticketId: TKT_0412, itemId: IT_CAESAR, name: ITEMS[IT_CAESAR].name, stationId: ST_COLD, seat: 1, qty: 1, course: 1, fireState: 'plated', cookRemainMin: 0, cookRemainDisplay: '0m', modifiers: []},
  {id: 'ln-0412-2', ticketId: TKT_0412, itemId: IT_GNOCCHI, name: ITEMS[IT_GNOCCHI].name, stationId: ST_SAUTE, seat: 2, qty: 1, course: 1, fireState: 'plated', cookRemainMin: 0, cookRemainDisplay: '0m', modifiers: []},
  {id: 'ln-0412-3', ticketId: TKT_0412, itemId: IT_RIBEYE, name: ITEMS[IT_RIBEYE].name, stationId: ST_GRILL, seat: 1, qty: 1, course: 2, fireState: 'fired', cookRemainMin: 4, cookRemainDisplay: '4m', modifiers: ['temp: rare']},
  {id: 'ln-0412-4', ticketId: TKT_0412, itemId: IT_BURGER, name: ITEMS[IT_BURGER].name, stationId: ST_GRILL, seat: 2, qty: 1, course: 2, fireState: 'fired', cookRemainMin: 3, cookRemainDisplay: '3m', modifiers: ['sub GF bun', 'no onion'], allergyNote: 'gluten allergy — seat 2'},
  {id: 'ln-0412-5', ticketId: TKT_0412, itemId: IT_FRIES, name: ITEMS[IT_FRIES].name, stationId: ST_FRY, qty: 2, course: 2, fireState: 'fired', cookRemainMin: 2, cookRemainDisplay: '2m', modifiers: []},
  // TKT_0413 — bar order, seatless lines; ln-0413-3 is the ONLY unplated
  // COLD line on the board (near-empty meter stress fixture).
  {id: 'ln-0413-1', ticketId: TKT_0413, itemId: IT_BURGER, name: ITEMS[IT_BURGER].name, stationId: ST_GRILL, qty: 1, course: 1, fireState: 'fired', cookRemainMin: 5, cookRemainDisplay: '5m', modifiers: ['temp: med', 'add bacon']},
  {id: 'ln-0413-2', ticketId: TKT_0413, itemId: IT_FRIES, name: ITEMS[IT_FRIES].name, stationId: ST_FRY, qty: 1, course: 1, fireState: 'fired', cookRemainMin: 3, cookRemainDisplay: '3m', modifiers: []},
  {id: 'ln-0413-3', ticketId: TKT_0413, itemId: IT_CAESAR, name: ITEMS[IT_CAESAR].name, stationId: ST_COLD, qty: 1, course: 1, fireState: 'fired', cookRemainMin: 1, cookRemainDisplay: '1m', modifiers: ['no anchovy — allergy'], allergyNote: 'anchovy allergy'},
  // TKT_0416 — course 2 all 'hold' (hold demo).
  {id: 'ln-0416-1', ticketId: TKT_0416, itemId: IT_GNOCCHI, name: ITEMS[IT_GNOCCHI].name, stationId: ST_SAUTE, seat: 1, qty: 1, course: 1, fireState: 'fired', cookRemainMin: 4, cookRemainDisplay: '4m', modifiers: ['extra parm']},
  {id: 'ln-0416-2', ticketId: TKT_0416, itemId: IT_FRIES, name: ITEMS[IT_FRIES].name, stationId: ST_FRY, qty: 1, course: 1, fireState: 'fired', cookRemainMin: 2, cookRemainDisplay: '2m', modifiers: []},
  {id: 'ln-0416-3', ticketId: TKT_0416, itemId: IT_HALIBUT, name: ITEMS[IT_HALIBUT].name, stationId: ST_SAUTE, seat: 1, qty: 1, course: 2, fireState: 'hold', cookRemainMin: 8, cookRemainDisplay: '8m', modifiers: ['no citrus — allergy seat 1'], allergyNote: 'citrus allergy — seat 1'},
  {id: 'ln-0416-4', ticketId: TKT_0416, itemId: IT_BURGER, name: ITEMS[IT_BURGER].name, stationId: ST_GRILL, seat: 2, qty: 1, course: 2, fireState: 'hold', cookRemainMin: 7, cookRemainDisplay: '7m', modifiers: ['temp: med-well']},
  {id: 'ln-0416-5', ticketId: TKT_0416, itemId: IT_BURGER, name: ITEMS[IT_BURGER].name, stationId: ST_GRILL, seat: 3, qty: 1, course: 2, fireState: 'hold', cookRemainMin: 7, cookRemainDisplay: '7m', modifiers: ['no pickle']},
  // TKT_0417 — 9-line large party (internal column scroll stress); carries
  // the qty-2 ribeye and the long GF-bun allergy modifier.
  {id: 'ln-0417-1', ticketId: TKT_0417, itemId: IT_GNOCCHI, name: ITEMS[IT_GNOCCHI].name, stationId: ST_SAUTE, seat: 1, qty: 1, course: 1, fireState: 'fired', cookRemainMin: 1, cookRemainDisplay: '1m', modifiers: []},
  {id: 'ln-0417-2', ticketId: TKT_0417, itemId: IT_GNOCCHI, name: ITEMS[IT_GNOCCHI].name, stationId: ST_SAUTE, seat: 5, qty: 1, course: 1, fireState: 'fired', cookRemainMin: 1, cookRemainDisplay: '1m', modifiers: ['extra parm']},
  {id: 'ln-0417-3', ticketId: TKT_0417, itemId: IT_CAESAR, name: ITEMS[IT_CAESAR].name, stationId: ST_COLD, seat: 4, qty: 1, course: 1, fireState: 'plated', cookRemainMin: 0, cookRemainDisplay: '0m', modifiers: []},
  {id: 'ln-0417-4', ticketId: TKT_0417, itemId: IT_RIBEYE, name: ITEMS[IT_RIBEYE].name, stationId: ST_GRILL, seat: 2, qty: 2, course: 2, fireState: 'fired', cookRemainMin: 9, cookRemainDisplay: '9m', modifiers: ['temp: med-rare ×1, med ×1']},
  {id: 'ln-0417-5', ticketId: TKT_0417, itemId: IT_BURGER, name: ITEMS[IT_BURGER].name, stationId: ST_GRILL, seat: 3, qty: 1, course: 2, fireState: 'fired', cookRemainMin: 8, cookRemainDisplay: '8m', modifiers: ['sub GF bun — allergy seat 3, no cross-contact'], allergyNote: 'gluten allergy — seat 3'},
  {id: 'ln-0417-6', ticketId: TKT_0417, itemId: IT_HALIBUT, name: ITEMS[IT_HALIBUT].name, stationId: ST_SAUTE, seat: 6, qty: 1, course: 2, fireState: 'fired', cookRemainMin: 10, cookRemainDisplay: '10m', modifiers: ['crispy skin']},
  {id: 'ln-0417-7', ticketId: TKT_0417, itemId: IT_FRIES, name: ITEMS[IT_FRIES].name, stationId: ST_FRY, qty: 2, course: 2, fireState: 'fired', cookRemainMin: 4, cookRemainDisplay: '4m', modifiers: ['SOS ranch']},
  {id: 'ln-0417-8', ticketId: TKT_0417, itemId: IT_BURGER, name: ITEMS[IT_BURGER].name, stationId: ST_GRILL, seat: 7, qty: 1, course: 2, fireState: 'hold', cookRemainMin: 8, cookRemainDisplay: '8m', modifiers: ['temp: rare']},
  {id: 'ln-0417-9', ticketId: TKT_0417, itemId: IT_FRIES, name: ITEMS[IT_FRIES].name, stationId: ST_FRY, qty: 1, course: 2, fireState: 'hold', cookRemainMin: 4, cookRemainDisplay: '4m', modifiers: []},
  // TKT_0418 — fresh, rightmost.
  {id: 'ln-0418-1', ticketId: TKT_0418, itemId: IT_GNOCCHI, name: ITEMS[IT_GNOCCHI].name, stationId: ST_SAUTE, seat: 2, qty: 1, course: 1, fireState: 'fired', cookRemainMin: 6, cookRemainDisplay: '6m', modifiers: []},
  {id: 'ln-0418-2', ticketId: TKT_0418, itemId: IT_BURGER, name: ITEMS[IT_BURGER].name, stationId: ST_GRILL, seat: 1, qty: 1, course: 1, fireState: 'fired', cookRemainMin: 7, cookRemainDisplay: '7m', modifiers: ['temp: med']},
  {id: 'ln-0418-3', ticketId: TKT_0418, itemId: IT_FRIES, name: ITEMS[IT_FRIES].name, stationId: ST_FRY, qty: 1, course: 1, fireState: 'fired', cookRemainMin: 3, cookRemainDisplay: '3m', modifiers: []},
  {id: 'ln-0418-4', ticketId: TKT_0418, itemId: IT_HALIBUT, name: ITEMS[IT_HALIBUT].name, stationId: ST_SAUTE, seat: 3, qty: 1, course: 2, fireState: 'hold', cookRemainMin: 9, cookRemainDisplay: '9m', modifiers: []},
  // Bumped tickets keep their (all-plated) lines so a recall can re-fire
  // them and the meters/counts visibly re-inflate.
  {id: 'ln-0409-1', ticketId: TKT_0409, itemId: IT_BURGER, name: ITEMS[IT_BURGER].name, stationId: ST_GRILL, seat: 1, qty: 1, course: 1, fireState: 'plated', cookRemainMin: 3, cookRemainDisplay: '3m', modifiers: ['temp: med']},
  {id: 'ln-0409-2', ticketId: TKT_0409, itemId: IT_FRIES, name: ITEMS[IT_FRIES].name, stationId: ST_FRY, qty: 1, course: 1, fireState: 'plated', cookRemainMin: 2, cookRemainDisplay: '2m', modifiers: []},
  {id: 'ln-0410-1', ticketId: TKT_0410, itemId: IT_TART, name: ITEMS[IT_TART].name, stationId: ST_COLD, seat: 2, qty: 1, course: 2, fireState: 'plated', cookRemainMin: 1, cookRemainDisplay: '1m', modifiers: ['candles — birthday']},
  {id: 'ln-0410-2', ticketId: TKT_0410, itemId: IT_CAESAR, name: ITEMS[IT_CAESAR].name, stationId: ST_COLD, seat: 1, qty: 1, course: 1, fireState: 'plated', cookRemainMin: 0, cookRemainDisplay: '0m', modifiers: []},
];

// 86'd fixture — strikethrough chips + danger rows; click un-86s.
const INITIAL_86: Record<string, boolean> = {[IT_DUCK]: true, [IT_OYSTERS]: true};

// ---------------------------------------------------------------------------
// STATE OWNER TYPES — one db, one update(id, patch); id prefix routes the
// patch to its slice. All custom components are dumb: props in, callbacks
// out.
// ---------------------------------------------------------------------------

interface UiState {
  stationFilter: string | null;
  highlightItem: string | null;
}

interface Db {
  lines: Record<string, LineFixture>;
  tickets: Record<string, TicketFixture>;
  eightySixed: Record<string, boolean>;
  ui: UiState;
}

type Patch = Partial<LineFixture> & Partial<TicketFixture> & Partial<UiState>;

const keyBy = <T extends {id: string}>(rows: T[]): Record<string, T> =>
  Object.fromEntries(rows.map(row => [row.id, row]));

// ---------------------------------------------------------------------------
// useElementWidth — container-width breakpoints (the demo stage renders
// templates in a ~1045–1075px container inside a 1440px window, so viewport
// queries never fire there). Width 0 = first pre-observer frame; callers
// fall back to viewport queries for that frame only.
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
// TicketAgeChip — fully custom inline SVG, purely presentational. Outer arc
// (r=16, stroke 3) sweeps elapsedMin/targetMin clockwise from 12 o'clock;
// inner ring (r=12, stroke 2) sweeps platedCount/itemCount; center 16px
// course glyph; 4px fire-state notch at 12 o'clock. Thresholds computed
// from NUMERIC fixture fields, never parsed from display strings. No
// animation — arcs are static path math.
// ---------------------------------------------------------------------------

function arcPath(cx: number, cy: number, r: number, frac: number): string {
  const f = Math.min(Math.max(frac, 0), 0.9999);
  const angle = f * 2 * Math.PI - Math.PI / 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  const large = f > 0.5 ? 1 : 0;
  return \`M \${cx} \${cy - r} A \${r} \${r} 0 \${large} 1 \${x.toFixed(2)} \${y.toFixed(2)}\`;
}

const COURSE_GLYPH: Record<Course, ReactNode> = {
  // Small-plate glyph (app).
  app: (
    <>
      <circle cx={18} cy={18} r={6} fill="none" stroke="currentColor" strokeWidth={1.5} />
      <circle cx={18} cy={18} r={2.5} fill="none" stroke="currentColor" strokeWidth={1.2} />
    </>
  ),
  // Cloche glyph (main).
  main: (
    <>
      <path d="M11.5 21 a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <line x1={10.5} y1={21} x2={25.5} y2={21} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={18} cy={13} r={1.2} fill="currentColor" />
    </>
  ),
  // Flame-off glyph (dessert — candle out, ready to run).
  dessert: (
    <>
      <path
        d="M18 11.5 c2.4 2.6 3.8 4.3 3.8 6.4 a3.8 3.8 0 0 1 -7.6 0 c0 -2.1 1.4 -3.8 3.8 -6.4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
      />
      <line x1={12.5} y1={12.5} x2={23.5} y2={23.5} stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
};

interface TicketAgeChipProps {
  elapsedMin: number;
  targetMin: number;
  elapsedDisplay: string;
  platedCount: number;
  itemCount: number;
  course: Course;
  fireState: TicketFireState;
  isRush: boolean;
  onClick: () => void; // toggles the ticket rush flag
}

function TicketAgeChip(props: TicketAgeChipProps) {
  const {elapsedMin, targetMin, elapsedDisplay, platedCount, itemCount, course, fireState, isRush, onClick} = props;
  const ratio = elapsedMin / targetMin;
  const arcColor = ratio >= 1 ? RED : ratio >= 0.6 ? WARN : OK;
  const ageFrac = Math.min(ratio, 1);
  const plateFrac = itemCount === 0 ? 0 : platedCount / itemCount;
  return (
    <button
      type="button"
      className="kds-focusable"
      style={styles.ageChipButton}
      onClick={onClick}
      aria-pressed={isRush}
      aria-label={\`Ticket age \${elapsedDisplay} of \${targetMin}m target, \${platedCount} of \${itemCount} plated — toggle rush\`}>
      <svg viewBox="0 0 36 36" width={36} height={36} aria-hidden>
        {/* Hairline tracks under both arcs so sweep amount reads as a fraction. */}
        <circle cx={18} cy={18} r={16} fill="none" stroke="var(--color-border)" strokeWidth={1} />
        <circle cx={18} cy={18} r={12} fill="none" stroke="var(--color-border)" strokeWidth={1} />
        {ageFrac >= 1 ? (
          <circle cx={18} cy={18} r={16} fill="none" stroke={arcColor} strokeWidth={3} />
        ) : ageFrac > 0 ? (
          <path d={arcPath(18, 18, 16, ageFrac)} fill="none" stroke={arcColor} strokeWidth={3} strokeLinecap="butt" />
        ) : null}
        {plateFrac >= 1 ? (
          <circle cx={18} cy={18} r={12} fill="none" stroke="var(--color-accent)" strokeWidth={2} opacity={0.55} />
        ) : plateFrac > 0 ? (
          <path d={arcPath(18, 18, 12, plateFrac)} fill="none" stroke="var(--color-accent)" strokeWidth={2} opacity={0.55} />
        ) : null}
        <g color="var(--color-text-secondary)">{COURSE_GLYPH[course]}</g>
        {fireState === 'fired' ? (
          <polygon points="15.5,0.5 20.5,0.5 18,5" fill={RED} />
        ) : fireState === 'hold' ? (
          <polygon points="15.5,0.5 20.5,0.5 18,5" fill="none" stroke="var(--color-text-secondary)" strokeWidth={1} />
        ) : null}
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// CourseFireRow — 32px dense composite row, omit-when-undefined segments;
// no internal state. Plated: name strikes at 55% opacity, modifier
// microrows unmount, row height animates 32→24px (120ms, disabled under
// prefers-reduced-motion via the .kds-line-row media guard).
// ---------------------------------------------------------------------------

const FIRE_SEGMENTS: {value: FireState; letter: string; label: string}[] = [
  {value: 'hold', letter: 'H', label: 'Hold'},
  {value: 'fired', letter: 'F', label: 'Fire'},
  {value: 'plated', letter: 'P', label: 'Plate'},
];

const FIRE_FILL: Record<FireState, CSSProperties> = {
  hold: {backgroundColor: 'var(--color-background-muted)', color: 'var(--color-text-primary, inherit)'},
  fired: {backgroundColor: WARN_SOFT, color: WARN_TEXT},
  plated: {backgroundColor: OK_SOFT, color: OK_TEXT},
};

interface CourseFireRowProps {
  line: LineFixture;
  isDimmed: boolean; // station filter dims, never unmounts — counts stay honest
  onFireState: (next: FireState) => void;
}

function CourseFireRow({line, isDimmed, onFireState}: CourseFireRowProps) {
  const isPlated = line.fireState === 'plated';
  return (
    <div style={isDimmed ? {opacity: 0.45} : undefined}>
      <div
        className="kds-line-row"
        style={{...styles.lineRow, height: isPlated ? 24 : 32}}>
        {line.seat != null ? <span style={styles.seatBox}>{line.seat}</span> : null}
        {line.allergyNote != null ? (
          <svg width={14} height={14} viewBox="0 0 14 14" style={{flexShrink: 0}} role="img">
            <title>{line.allergyNote}</title>
            <path d="M7 1.5 L13 12.5 H1 Z" fill="none" stroke={RED} strokeWidth={1.5} strokeLinejoin="round" />
            <line x1={7} y1={5.5} x2={7} y2={8.5} stroke={RED} strokeWidth={1.4} strokeLinecap="round" />
            <circle cx={7} cy={10.6} r={0.9} fill={RED} />
          </svg>
        ) : null}
        <span style={isPlated ? {...styles.lineName, ...styles.lineNamePlated} : styles.lineName}>
          {line.name}
        </span>
        {line.qty > 1 ? <span style={styles.qty}>×{line.qty}</span> : null}
        <span role="radiogroup" aria-label={\`Fire state for \${line.name}\`} style={styles.fireGroup}>
          {FIRE_SEGMENTS.map((seg, i) => (
            <button
              key={seg.value}
              type="button"
              role="radio"
              aria-checked={line.fireState === seg.value}
              aria-label={seg.label}
              className="kds-focusable"
              data-kds-radio={isPlated ? undefined : line.ticketId}
              onClick={() => onFireState(seg.value)}
              style={{
                ...styles.fireSegment,
                ...(i > 0 ? {borderLeft: 'var(--border-width) solid var(--color-border)'} : null),
                ...(line.fireState === seg.value ? FIRE_FILL[seg.value] : null),
              }}>
              {seg.letter}
            </button>
          ))}
        </span>
      </div>
      {!isPlated
        ? line.modifiers.map(modifier => (
            <div key={modifier} style={styles.modifierRow}>
              · {modifier}
            </div>
          ))
        : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StationLoadMeter — 36px row, 12px track; one segment per UNPLATED line
// routed to the station (fired = warm wash, hold = muted), width
// proportional to cookRemainMin (14px flex-basis floor). Segment click
// jumps the rail to the owning ticket. role=group (NOT role=img — the
// segments are real buttons and img would swallow them from AT).
// ---------------------------------------------------------------------------

interface StationLoadMeterProps {
  station: StationFixture;
  lines: LineFixture[]; // derived unplated lines for this station
  ticketsById: Record<string, TicketFixture>;
  onFocusTicket: (ticketId: string) => void;
}

function StationLoadMeter({station, lines, ticketsById, onFocusTicket}: StationLoadMeterProps) {
  const isEmpty = lines.length === 0;
  return (
    <div
      style={styles.meterRow}
      role="group"
      aria-label={\`\${station.label}: \${lines.length} item\${lines.length === 1 ? '' : 's'} in queue\`}>
      <span style={styles.meterLabel}>{station.label}</span>
      <div style={isEmpty ? {...styles.meterTrack, ...styles.meterTrackEmpty} : styles.meterTrack}>
        {lines.map(line => (
          <button
            key={line.id}
            type="button"
            className="kds-focusable"
            onClick={() => onFocusTicket(line.ticketId)}
            aria-label={\`\${line.name} — ticket \${ticketsById[line.ticketId]?.no ?? '?'}, \${line.cookRemainDisplay} remaining; show ticket\`}
            style={{
              ...styles.meterSegment,
              flexGrow: Math.max(line.cookRemainMin, 1),
              flexBasis: 14,
              // Cap so a lone segment (COLD's single caesar) doesn't fill
              // the track and read as a full station.
              maxWidth: 40,
              backgroundColor: line.fireState === 'fired' ? WARN_SOFT : 'var(--color-background-muted)',
              color: line.fireState === 'fired' ? WARN_TEXT : 'var(--color-text-secondary)',
            }}>
            {/* First-letter glyph on the wider (longer-cook) segments; the
                cookRemainMin >= 6 proxy stands in for the ">= 20px wide"
                rule since flexed widths aren't known at render. */}
            {line.cookRemainMin >= 6 ? line.name.charAt(0) : null}
          </button>
        ))}
      </div>
      <span style={styles.meterCount}>{lines.length}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TicketColumn — 244px fixed column (216px < 700px band): 44px header with
// TicketAgeChip, body of CourseFireRows grouped under 16px course
// dividers with internal scroll, 32px footer that flips to BUMP TICKET
// when every line is plated. Rush tickets carry a 2px danger top border.
// ---------------------------------------------------------------------------

interface TicketColumnProps {
  ticket: TicketFixture;
  lines: LineFixture[];
  isHighlighted: boolean;
  stationFilter: string | null;
  width: number;
  showMicro: boolean;
  onFireState: (lineId: string, next: FireState) => void;
  onBump: (ticketId: string) => void;
  onToggleRush: (ticketId: string) => void;
  registerNode: (ticketId: string, node: HTMLDivElement | null) => void;
}

function TicketColumn(props: TicketColumnProps) {
  const {ticket, lines, isHighlighted, stationFilter, width, showMicro, onFireState, onBump, onToggleRush, registerNode} = props;
  const platedCount = lines.filter(line => line.fireState === 'plated').length;
  const isDone = platedCount === lines.length && lines.length > 0;
  const fireState: TicketFireState = isDone
    ? 'done'
    : lines.some(line => line.fireState === 'fired')
      ? 'fired'
      : 'hold';
  const isOver = ticket.elapsedMin >= ticket.targetMin;
  const courses: (1 | 2)[] = [1, 2];
  return (
    <div
      role="listitem"
      ref={node => registerNode(ticket.id, node)}
      aria-label={\`Ticket \${ticket.no}, \${ticket.table.toLowerCase()}, \${ticket.elapsedDisplay} elapsed, \${platedCount} of \${lines.length} plated\`}
      style={{
        ...styles.ticketColumn,
        width,
        ...(ticket.rush ? styles.ticketColumnRush : null),
        ...(isHighlighted ? styles.ticketColumnHighlight : null),
      }}>
      <div style={styles.ticketHeader}>
        <TicketAgeChip
          elapsedMin={ticket.elapsedMin}
          targetMin={ticket.targetMin}
          elapsedDisplay={ticket.elapsedDisplay}
          platedCount={platedCount}
          itemCount={lines.length}
          course={ticket.course}
          fireState={fireState}
          isRush={ticket.rush}
          onClick={() => onToggleRush(ticket.id)}
        />
        <div style={{minWidth: 0, flex: 1}}>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 4}}>
            <span style={styles.ticketNo}>{ticket.no}</span>
            <span style={isOver ? styles.elapsedOver : styles.elapsedOk}>
              {ticket.elapsedDisplay}
              {ticket.rush ? ' · RUSH' : ''}
            </span>
          </div>
          {showMicro ? (
            <div style={styles.ticketMicro}>
              {ticket.table} · {ticket.server.toUpperCase()}
            </div>
          ) : null}
        </div>
      </div>
      <div style={styles.ticketBody}>
        {courses.map(course => {
          const courseLines = lines.filter(line => line.course === course);
          if (courseLines.length === 0) {
            return null;
          }
          return (
            <div key={course}>
              <div style={styles.courseDivider}>COURSE {course}</div>
              {courseLines.map(line => (
                <CourseFireRow
                  key={line.id}
                  line={line}
                  isDimmed={stationFilter != null && line.stationId !== stationFilter}
                  onFireState={next => onFireState(line.id, next)}
                />
              ))}
            </div>
          );
        })}
      </div>
      <div style={styles.ticketFooter}>
        {isDone ? (
          // DS Button has no success variant (primary/secondary/ghost/
          // destructive), so the bump bar is a native button on the success
          // token pair — contrast math at OK_FILL_TEXT.
          <button
            type="button"
            className="kds-focusable"
            style={styles.bumpButton}
            onClick={() => onBump(ticket.id)}>
            BUMP TICKET
          </button>
        ) : (
          <span style={styles.footerMicro}>
            {platedCount}/{lines.length} PLATED
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AllDayChip — 28px pill in the 40px strip; count is a derived aggregate.
// Click toggles the item highlight (tickets holding unplated instances get
// an accent outline). 86'd chips strike through and carry a danger dot.
// ---------------------------------------------------------------------------

interface AllDayChipProps {
  short: string;
  count: number | null; // null on 86'd tail chips (count is always 0)
  is86d: boolean;
  isActive: boolean;
  onClick: () => void;
}

function AllDayChip({short, count, is86d, isActive, onClick}: AllDayChipProps) {
  return (
    <button
      type="button"
      className="kds-focusable"
      onClick={onClick}
      aria-pressed={isActive}
      style={isActive ? {...styles.allDayChip, ...styles.allDayChipActive} : styles.allDayChip}>
      {is86d ? <span style={styles.eightySixDot} aria-hidden /> : null}
      <span style={is86d ? {textDecoration: 'line-through'} : undefined}>{short}</span>
      {count != null ? <span style={styles.allDayCount}>{count}</span> : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// StationTab — 32px tab (40px icon-only when collapsed) with unplated-count
// badge. Active tab filter-DIMS rows on other stations (never unmounts —
// counts stay honest); clicking the active tab clears the filter.
// ---------------------------------------------------------------------------

interface StationTabProps {
  station: StationFixture;
  count: number;
  isActive: boolean;
  isIconOnly: boolean;
  onClick: () => void;
}

function StationTab({station, count, isActive, isIconOnly, onClick}: StationTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-label={\`\${station.label} — \${count} unplated\`}
      className="kds-focusable"
      onClick={onClick}
      style={{
        ...styles.stationTab,
        ...(isIconOnly ? styles.stationTabIconOnly : null),
        ...(isActive ? styles.stationTabActive : null),
      }}>
      <Icon icon={station.icon} size="xsm" color="inherit" />
      {isIconOnly ? null : <span>{station.label.toUpperCase()}</span>}
      <span style={styles.tabBadge}>{count}</span>
      {isActive ? <span style={styles.tabUnderline} aria-hidden /> : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Brand mark — the knife-tick, 24×24 inline SVG. The ONE brand-hex usage
// besides the active-tab underline.
// ---------------------------------------------------------------------------

function KnifeTickMark() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden style={{flexShrink: 0}}>
      <rect x={1} y={1} width={22} height={22} rx={6} fill={BRAND} />
      {/* Tick doubling as a knife edge. Mark foreground is white in both
          schemes: #FFFFFF on #E8590C ≈ 3.5:1 — decorative glyph, not text. */}
      <path
        d="M6.5 12.5 L10.5 16.5 L17.5 7.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner. One db, one update(id, patch); the id
// prefix routes the patch ('ln-*' → lines, 'tkt-*' → tickets, 'it-*' →
// toggles 86, 'ui' → ui). Every aggregate on screen (all-day counts,
// station meters, tab badges, per-ticket plated counts, the open pill) is
// derived from db.lines at render — never stored — so one plate click
// visibly ripples across the row, the age chip, the meter, and the counts.
// ---------------------------------------------------------------------------

const sentence = (short: string) => short.charAt(0) + short.slice(1).toLowerCase();

export default function KdsExpoLineTemplate() {
  // Container-width bands measured on the view root; viewport queries only
  // cover the width-0 pre-observer frame so wide hosts don't flash pane
  // removal.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const measuredWidth = useElementWidth(rootRef);
  const isViewportBelow1024 = useMediaQuery('(max-width: 1023px)');
  const isViewportBelow880 = useMediaQuery('(max-width: 879px)');
  const isViewportBelow700 = useMediaQuery('(max-width: 699px)');
  const isMotionReduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hasAside = measuredWidth > 0 ? measuredWidth >= 1024 : !isViewportBelow1024;
  const isTabsIconOnly = measuredWidth > 0 ? measuredWidth < 880 : isViewportBelow880;
  const isStripTrimmed = isTabsIconOnly; // same 700–879 band
  const isNarrowCols = measuredWidth > 0 ? measuredWidth < 700 : isViewportBelow700;
  const columnWidth = isNarrowCols ? 216 : 244;

  const [db, setDb] = useState<Db>(() => ({
    lines: keyBy(LINES),
    tickets: keyBy(TICKETS),
    eightySixed: {...INITIAL_86},
    ui: {stationFilter: null, highlightItem: null},
  }));
  // Polite live region — plate/bump/recall events only.
  const [announcement, setAnnouncement] = useState('');

  const columnNodes = useRef<Map<string, HTMLDivElement>>(new Map());
  const registerNode = useCallback((ticketId: string, node: HTMLDivElement | null) => {
    if (node == null) {
      columnNodes.current.delete(ticketId);
    } else {
      columnNodes.current.set(ticketId, node);
    }
  }, []);

  // THE mutator — every surface calls this.
  const update = useCallback((id: string, patch: Patch) => {
    setDb(prev => {
      if (id === 'ui') {
        return {...prev, ui: {...prev.ui, ...patch}};
      }
      if (id.startsWith('ln-') && prev.lines[id] != null) {
        return {...prev, lines: {...prev.lines, [id]: {...prev.lines[id], ...patch}}};
      }
      if (id.startsWith('tkt-') && prev.tickets[id] != null) {
        return {...prev, tickets: {...prev.tickets, [id]: {...prev.tickets[id], ...patch}}};
      }
      if (id.startsWith('it-')) {
        return {...prev, eightySixed: {...prev.eightySixed, [id]: !prev.eightySixed[id]}};
      }
      return prev;
    });
  }, []);

  // ---- Derivations (render-time, from db.lines — the cross-check law) ----
  const allLines = Object.values(db.lines);
  const allTickets = Object.values(db.tickets);
  // Oldest (most urgent) leftmost; rush pinned to the front. TKT_0415 at
  // 18m owns the far-left / BL corner on load.
  const openTickets = [...allTickets]
    .filter(ticket => ticket.status === 'open')
    .sort(
      (a, b) =>
        Number(b.rush) - Number(a.rush) || b.elapsedMin - a.elapsedMin || a.no.localeCompare(b.no),
    );
  const bumpedTickets = [...allTickets]
    .filter(ticket => ticket.status === 'bumped')
    .sort((a, b) => b.bumpSeq - a.bumpSeq);
  const openTicketIds = new Set(openTickets.map(ticket => ticket.id));
  const linesForTicket = (ticketId: string) =>
    allLines.filter(line => line.ticketId === ticketId);
  const unplatedOpenLines = allLines.filter(
    line => openTicketIds.has(line.ticketId) && line.fireState !== 'plated',
  );
  // All-day counts: qty sums of unplated lines per item, movers first.
  const allDayCounts = new Map<string, number>();
  for (const line of unplatedOpenLines) {
    allDayCounts.set(line.itemId, (allDayCounts.get(line.itemId) ?? 0) + line.qty);
  }
  const allDayRows = [...allDayCounts.entries()]
    .map(([itemId, count]) => ({item: ITEMS[itemId], count}))
    .sort((a, b) => b.count - a.count || a.item.short.localeCompare(b.item.short));
  const eightySixedItems = Object.keys(db.eightySixed)
    .filter(itemId => db.eightySixed[itemId])
    .map(itemId => ITEMS[itemId]);
  const highlightTicketIds = new Set(
    db.ui.highlightItem == null
      ? []
      : unplatedOpenLines
          .filter(line => line.itemId === db.ui.highlightItem)
          .map(line => line.ticketId),
  );
  const stripChipLimit = isStripTrimmed ? 4 : 6;
  const visibleStripRows = allDayRows.slice(0, stripChipLimit);
  const hiddenStripCount = Math.max(allDayRows.length - stripChipLimit, 0);

  // ---- Handlers (each an update() call + its announcement) ----
  const handleFireState = (lineId: string, next: FireState) => {
    const line = db.lines[lineId];
    if (line == null || line.fireState === next) {
      return;
    }
    update(lineId, {fireState: next});
    if (next === 'plated') {
      const ticket = db.tickets[line.ticketId];
      const ticketLines = linesForTicket(line.ticketId);
      const platedAfter = ticketLines.filter(l => l.fireState === 'plated').length + 1;
      setAnnouncement(
        \`\${sentence(ITEMS[line.itemId].short)} plated — ticket \${ticket?.no ?? '?'}, \${platedAfter} of \${ticketLines.length}.\`,
      );
    }
  };

  const handleBump = (ticketId: string) => {
    const ticket = db.tickets[ticketId];
    if (ticket == null) {
      return;
    }
    const nextSeq = Math.max(0, ...allTickets.map(t => t.bumpSeq)) + 1;
    update(ticketId, {
      status: 'bumped',
      bumpSeq: nextSeq,
      bumpedLabel: \`bumped after \${ticket.elapsedDisplay}\`,
    });
    setAnnouncement(\`Ticket \${ticket.no} bumped.\`);
    // Focus contract: bumping moves focus to the next ticket's first
    // unplated row (its Hold radio — the first button in the row).
    const remaining = openTickets.filter(t => t.id !== ticketId);
    const nextTicket = remaining[0];
    if (nextTicket != null) {
      requestAnimationFrame(() => {
        const target = rootRef.current?.querySelector<HTMLButtonElement>(
          \`[data-kds-radio="\${nextTicket.id}"]\`,
        );
        target?.focus();
      });
    }
  };

  const handleRecall = (ticketId: string) => {
    const ticket = db.tickets[ticketId];
    if (ticket == null) {
      return;
    }
    update(ticketId, {status: 'open'});
    // A recall re-fires the ticket's lines (expo pulled it back for a
    // reason) — this is what makes the meters and all-day counts visibly
    // re-inflate. Same mutator, one call per line.
    for (const line of linesForTicket(ticketId)) {
      if (line.fireState === 'plated') {
        update(line.id, {fireState: 'fired'});
      }
    }
    setAnnouncement(\`Ticket \${ticket.no} recalled — lines re-fired.\`);
  };

  const handleFocusTicket = (ticketId: string) => {
    columnNodes.current.get(ticketId)?.scrollIntoView({
      behavior: isMotionReduced ? 'auto' : 'smooth',
      inline: 'start',
      block: 'nearest',
    });
  };

  const handleToggleRush = (ticketId: string) => {
    const ticket = db.tickets[ticketId];
    if (ticket != null) {
      update(ticketId, {rush: !ticket.rush});
    }
  };

  const handleStationTab = (stationId: string) =>
    update('ui', {stationFilter: db.ui.stationFilter === stationId ? null : stationId});
  const handleHighlight = (itemId: string) =>
    update('ui', {highlightItem: db.ui.highlightItem === itemId ? null : itemId});

  const stationUnplated = (stationId: string) =>
    unplatedOpenLines.filter(line => line.stationId === stationId);

  return (
    <div ref={rootRef} style={styles.root}>
      <style>{KDS_CSS}</style>
      <div aria-live="polite" style={styles.srOnly}>
        {announcement}
      </div>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div style={styles.headerBar}>
              {/* TL corner: brand cluster + open-ticket pill. */}
              <div style={styles.brandCluster}>
                <KnifeTickMark />
                <h1 style={{...styles.wordmark, margin: 0}}>Brigade</h1>
                {isTabsIconOnly ? null : (
                  <span style={styles.microLabel}>HARBOR &amp; VINE — DINNER</span>
                )}
                <span style={styles.openPill}>{openTickets.length} OPEN</span>
              </div>
              <div style={styles.tablist} role="tablist" aria-label="Station filter">
                {STATIONS.map(station => (
                  <StationTab
                    key={station.id}
                    station={station}
                    count={stationUnplated(station.id).length}
                    isActive={db.ui.stationFilter === station.id}
                    isIconOnly={isTabsIconOnly}
                    onClick={() => handleStationTab(station.id)}
                  />
                ))}
              </div>
              {/* TR corner: expo identity; the Recalls pill renders ONLY
                  when the aside is dropped (< 1024px band). */}
              <div style={styles.expoCluster}>
                <span style={styles.microLabel}>EXPO · M. OSEI</span>
                {!hasAside && bumpedTickets.length > 0 ? (
                  <button
                    type="button"
                    className="kds-focusable"
                    style={styles.recallPill}
                    onClick={() => handleRecall(bumpedTickets[0].id)}
                    aria-label={\`Recalls (\${bumpedTickets.length}) — restore ticket \${bumpedTickets[0].no}\`}>
                    <Icon icon={Undo2Icon} size="xsm" color="inherit" />
                    Recalls ({bumpedTickets.length})
                  </button>
                ) : null}
              </div>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={{height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'}}>
              <div style={styles.allDayStrip} aria-label="All-day counts">
                <span style={styles.microLabel}>ALL DAY</span>
                {visibleStripRows.map(row => (
                  <AllDayChip
                    key={row.item.id}
                    short={row.item.short}
                    count={row.count}
                    is86d={Boolean(db.eightySixed[row.item.id])}
                    isActive={db.ui.highlightItem === row.item.id}
                    onClick={() => handleHighlight(row.item.id)}
                  />
                ))}
                {hiddenStripCount > 0 ? (
                  <span style={{...styles.allDayChip, cursor: 'default'}} aria-hidden>
                    +{hiddenStripCount}
                  </span>
                ) : null}
                {/* < 1024px: the strip is the sole aggregate surface and
                    gains the 86'd chips at its tail (click un-86s). */}
                {!hasAside
                  ? eightySixedItems.map(item => (
                      <AllDayChip
                        key={item.id}
                        short={item.short}
                        count={null}
                        is86d
                        isActive={false}
                        onClick={() => update(item.id, {})}
                      />
                    ))
                  : null}
              </div>
              <div style={styles.rail} role="list" aria-label="Open tickets, oldest first">
                {openTickets.map(ticket => (
                  <TicketColumn
                    key={ticket.id}
                    ticket={ticket}
                    lines={linesForTicket(ticket.id)}
                    isHighlighted={highlightTicketIds.has(ticket.id)}
                    stationFilter={db.ui.stationFilter}
                    width={columnWidth}
                    showMicro={!isNarrowCols}
                    onFireState={handleFireState}
                    onBump={handleBump}
                    onToggleRush={handleToggleRush}
                    registerNode={registerNode}
                  />
                ))}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          hasAside ? (
            <LayoutPanel
              width={320}
              padding={0}
              hasDivider
              isScrollable={false}
              label="Expo aside — station loads, all-day counts, 86 list, recalls">
              <div style={styles.aside}>
                <div style={styles.asideSection}>
                  <div style={styles.asideHeader}>STATIONS</div>
                  {STATIONS.map(station => (
                    <StationLoadMeter
                      key={station.id}
                      station={station}
                      lines={stationUnplated(station.id)}
                      ticketsById={db.tickets}
                      onFocusTicket={handleFocusTicket}
                    />
                  ))}
                </div>
                <div style={styles.divider} />
                <div style={styles.allDayList}>
                  <div style={styles.asideHeader}>ALL DAY</div>
                  {allDayRows.map(row => (
                    <button
                      key={row.item.id}
                      type="button"
                      className="kds-focusable"
                      style={styles.asideRow}
                      aria-pressed={db.ui.highlightItem === row.item.id}
                      onClick={() => handleHighlight(row.item.id)}>
                      <span style={styles.asideRowName}>{row.item.name}</span>
                      <span style={styles.asideRowCount}>{row.count}</span>
                    </button>
                  ))}
                </div>
                <div style={styles.divider} />
                <div style={styles.asideSection}>
                  <div style={styles.asideHeader}>86&apos;D</div>
                  {eightySixedItems.length === 0 ? (
                    <div style={{...styles.recallRow, ...{color: 'var(--color-text-secondary)', fontSize: 11}}}>
                      Nothing 86&apos;d
                    </div>
                  ) : (
                    eightySixedItems.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className="kds-focusable"
                        style={{...styles.asideRow, ...styles.eightySixRow}}
                        onClick={() => update(item.id, {})}
                        aria-label={\`\${item.name} is 86'd — restore to menu\`}>
                        <Icon icon={BanIcon} size="xsm" color="inherit" />
                        <span style={styles.asideRowName}>{item.name}</span>
                        <span style={{fontFamily: MONO, fontSize: 10, fontWeight: 700}}>86</span>
                      </button>
                    ))
                  )}
                </div>
                <div style={styles.divider} />
                {/* BR corner: recall stack footer, max 3 visible. */}
                <div style={styles.asideSection}>
                  <div style={styles.asideHeader}>RECALL</div>
                  {bumpedTickets.slice(0, 3).map(ticket => (
                    <div key={ticket.id} style={styles.recallRow}>
                      <span style={styles.ticketNo}>{ticket.no}</span>
                      <span style={{...styles.asideRowName, fontSize: 11, color: 'var(--color-text-secondary)'}}>
                        {ticket.table} · {ticket.bumpedLabel ?? 'bumped'}
                      </span>
                      <Button
                        label="Restore"
                        variant="ghost"
                        size="sm"
                        icon={<Icon icon={Undo2Icon} size="xsm" />}
                        onClick={() => handleRecall(ticket.id)}
                      />
                    </div>
                  ))}
                  {bumpedTickets.length === 0 ? (
                    <div style={{...styles.recallRow, color: 'var(--color-text-secondary)', fontSize: 11}}>
                      No bumped tickets
                    </div>
                  ) : null}
                </div>
              </div>
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}



`;export{e as default};