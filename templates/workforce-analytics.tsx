// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs (140-person
 *   platform company) trailing-twelve-month workforce series, Aug 2025 –
 *   Jul 2026: month-end headcount vs the FY26 base-plan trajectory
 *   (Jul actual 140 vs plan 148, base plan lands at 156 by Sep 30), a
 *   named 8-exit attrition ledger split regretted / non-regretted per
 *   department (TTM rate 6.2% on a 128.7 average headcount), three
 *   140-person diversity cuts (gender, office, tenure — each sums to
 *   the canonical 140), and a monthly payroll cost table (base + bonus +
 *   benefits + employer taxes, Jul total $2,310K = $2.31M). No clocks,
 *   no Math.random(), no network media; every KPI, chart point, and
 *   insight figure is derived from these module-scope tables so all
 *   panels reconcile by construction.
 * @output Workforce Analytics — the cross-pillar analytics dashboard for
 *   the Kestrel Labs workforce platform. A 4-up KPI row (headcount 140
 *   with +8 QoQ, attrition 6.2% with good-direction coloring, time-to-
 *   hire 34d, payroll cost $2.31M/mo), a headcount-growth line chart
 *   with a dashed plan overlay and labeled axes, an attrition-by-
 *   department bar chart with a regretted / non-regretted split and a
 *   company-average marker (clicking a department reveals its named
 *   exits), a diversity snapshot of three donut charts with legends, a
 *   payroll-cost stacked-area trend with a toggleable series legend, and
 *   an end-edge insights rail of three generated-insight cards that each
 *   cite the metric they were derived from. A 12 mo / 6 mo range toggle
 *   rescopes both time-series charts, and clicking a month in either
 *   chart cross-highlights it in both and pins its readout row.
 * @position Page template; emitted by `astryx template workforce-analytics`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title, as-of line, range SegmentedControl, export)
 *   | content (KPI Grid, 2x2 chart-widget Grid — one vertical scroller)
 *   | end panel 320 (generated-insights rail, scrolls independently).
 *
 * Container policy: analytics-dashboard archetype — chart widgets are
 *   Cards (per kpi-dashboard / activation-funnel-analytics); the page
 *   chrome and the insights rail stay frame-first (LayoutHeader /
 *   LayoutPanel), and KPI tiles, insight entries, and exit rows are
 *   styled bordered divs, not Cards.
 *
 * Color policy: token-pure everywhere; the only literals are the
 *   repo-standard `light-dark()` fallback pairs on the data-viz
 *   categorical tokens (series lines, donut segments, area fills) plus
 *   the same-pattern pink/red/slate pairs used for the People
 *   department, regretted-exit segments, and the plan overlay — the
 *   demo does not inject `--color-data-categorical-*`. No scheme-locked
 *   surfaces on this page.
 *
 * Responsive contract:
 * - > 1180px: full frame with the 320px insights rail on the end edge.
 * - <= 1180px: the rail drops and the same insight cards render inline
 *   below the chart grid in the main scroller.
 * - Chart widgets: Grid minWidth 430, repeat 'fit' — 2x2 wide, single
 *   full-width column below ~900px (auto-fit so a lone track stretches;
 *   the `max` cap locks tracks at minWidth in narrow containers); KPI
 *   Grid minWidth 240, repeat 'fit' — 4-up wide, 2x2 in the compact
 *   range, 1-up on very narrow viewports.
 * - <= 860px: the header row wraps (range toggle + export drop below the
 *   title); the headcount chart thins its x labels to every other month
 *   in the 12-month range so labels never collide.
 * - The content column and the insights rail scroll independently
 *   (`minHeight: 0` down each flex chain).
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  CalendarClockIcon,
  DownloadIcon,
  InfoIcon,
  SparklesIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UserMinusIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// DATA-VIZ PALETTE — categorical tokens are not injected by the demo, so
// every use carries the repo-standard `light-dark()` fallback pair (copied
// from calendar-month-grid.tsx). pink / red / slate follow the same pattern.
// ---------------------------------------------------------------------------

const VIZ = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  pink: 'light-dark(#DB2777, #F472B6)',
  red: 'light-dark(#D92D20, #F2655A)',
  slate: 'light-dark(#64748B, #94A3B8)',
};

/** Tinted washes for selection states, mixed from the same palette. */
const TINT = {
  blue: `color-mix(in srgb, ${VIZ.blue} 10%, transparent)`,
  red: `color-mix(in srgb, ${VIZ.red} 10%, transparent)`,
};

// ---------------------------------------------------------------------------
// STYLES — one module-level typed record; dynamic values compose per render.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — pin the frame with a 100dvh root.
  root: {height: '100dvh', width: '100%'},
  contentScroll: {height: '100%', overflowY: 'auto', padding: 'var(--spacing-4)', minHeight: 0},
  railScroll: {height: '100%', overflowY: 'auto', padding: 'var(--spacing-3)', minHeight: 0},
  visuallyHidden: {position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap'},

  // KPI tiles — bordered divs, not Cards (frame-first chrome).
  kpiTile: {border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--radius-container)', backgroundColor: 'var(--color-background-surface)', padding: 'var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', minWidth: 0},
  kpiValue: {fontSize: 26, lineHeight: '32px', fontWeight: 650, fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-primary)', whiteSpace: 'nowrap'},
  kpiDeltaRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)', flexWrap: 'wrap'},

  // Shared chart scaffolding: fixed-height plot area, HTML axis labels
  // flanking a stretched SVG (preserveAspectRatio="none" +
  // vectorEffect="non-scaling-stroke" keeps stroke weights honest).
  chartBody: {display: 'flex', gap: 'var(--spacing-2)', minWidth: 0},
  // Height matches the 190px plot exactly so the bottom tick aligns with
  // the plot baseline instead of the month-label row below it.
  yAxisCol: {display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', width: 42, flexShrink: 0, height: 190},
  axisLabel: {fontSize: 10, lineHeight: '12px', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  axisTitle: {fontSize: 10, lineHeight: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em'},
  plotWrap: {position: 'relative', flex: 1, minWidth: 0},
  plotSvg: {position: 'absolute', inset: 0, width: '100%', height: '100%'},
  // Invisible per-month hit strips over the plot (cross-chart month select).
  monthHitRow: {position: 'absolute', inset: 0},
  monthHit: {background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', minWidth: 0},
  monthBand: {position: 'absolute', insetBlock: 0, backgroundColor: TINT.blue, borderInline: `1px solid color-mix(in srgb, ${VIZ.blue} 35%, transparent)`, pointerEvents: 'none'},
  pointDot: {position: 'absolute', width: 7, height: 7, borderRadius: '50%', transform: 'translate(-50%, -50%)', backgroundColor: VIZ.blue, boxShadow: '0 0 0 2px var(--color-background-card)', pointerEvents: 'none'},
  legendItem: {display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, lineHeight: '14px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  legendSwatch: {width: 10, height: 10, borderRadius: 3, flexShrink: 0},
  legendDash: {width: 14, height: 0, borderTop: `2px dashed ${VIZ.slate}`, flexShrink: 0},
  // Toggleable legend chips (payroll series on/off).
  legendToggle: {display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, lineHeight: '14px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', border: 'var(--border-width) solid var(--color-border)', borderRadius: 999, paddingBlock: 2, paddingInline: 8, background: 'var(--color-background-surface)', cursor: 'pointer'},
  legendToggleOff: {color: 'var(--color-text-secondary)', textDecorationLine: 'line-through', background: 'var(--color-background-muted)'},
  readoutRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap', borderTop: 'var(--border-width) solid var(--color-border)', paddingTop: 'var(--spacing-2)', marginTop: 'var(--spacing-2)'},
  readoutValue: {fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap'},

  // Attrition bars — HTML tracks on a shared 0–10% scale.
  attrRow: {display: 'grid', gridTemplateColumns: '92px 1fr 88px', alignItems: 'center', columnGap: 'var(--spacing-2)', width: '100%', border: 'none', background: 'transparent', padding: 'var(--spacing-1)', borderRadius: 'var(--radius-control, 6px)', cursor: 'pointer', textAlign: 'start'},
  attrRowSelected: {backgroundColor: TINT.blue, boxShadow: 'inset 0 0 0 1px var(--color-accent)'},
  attrTrack: {position: 'relative', height: 16, borderRadius: 4, backgroundColor: 'var(--color-background-muted)', overflow: 'hidden', minWidth: 0},
  attrSegment: {position: 'absolute', insetBlock: 0},
  // Solid full-height benchmark tick — a dashed border fragments into
  // dot-like artifacts at 16px, and slate vanishes over the slate
  // non-regretted segment, so this uses text-primary instead.
  attrAvgLine: {position: 'absolute', insetBlock: 0, width: 0, borderInlineStart: '2px solid var(--color-text-primary)', opacity: 0.7, pointerEvents: 'none'},
  legendTick: {width: 2, height: 12, backgroundColor: 'var(--color-text-primary)', opacity: 0.7, flexShrink: 0},
  attrScaleRow: {display: 'grid', gridTemplateColumns: '92px 1fr 88px', columnGap: 'var(--spacing-2)', paddingInline: 'var(--spacing-1)'},
  attrScaleTrack: {position: 'relative', height: 14},
  attrScaleTick: {position: 'absolute', transform: 'translateX(-50%)', fontSize: 10, lineHeight: '12px', color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  exitRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: 'var(--spacing-1) 0', minWidth: 0},

  // Donuts.
  donutWrap: {position: 'relative', width: 108, height: 108, flexShrink: 0},
  donutCenter: {position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'},
  donutValue: {fontSize: 18, lineHeight: '22px', fontWeight: 650, fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-primary)'},
  // Centered so a group that wraps to its own flex row (the 2 + 1 layout
  // in the single-column range) doesn't leave a dead right-hand quadrant.
  donutGroup: {display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center', justifyContent: 'center', minWidth: 0, flex: '1 1 240px'},
  donutLegend: {display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0},

  // Insights rail.
  insightCard: {border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--radius-container)', backgroundColor: 'var(--color-background-surface)', padding: 'var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)'},
  insightAccent: {borderInlineStartWidth: 3, borderInlineStartStyle: 'solid'},
  numeric: {fontVariantNumeric: 'tabular-nums'},
};

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs, the 140-person platform
// company (Engineering 52, Design 18, GTM 34, Ops 16, Finance 8, People 12 —
// sums to 140 everywhere it appears). TTM window: Aug 2025 – Jul 2026, data
// as of Fri Jul 3, 2026. All money in USD; payroll figures in $K per month.
// ---------------------------------------------------------------------------

interface MonthRow {
  id: string;
  /** Short x-axis label. */
  label: string;
  /** Full label for aria text and readouts. */
  full: string;
  /** Month-end active headcount (Jul = as-of Jul 3 snapshot). */
  actual: number;
  /** FY26 base-plan trajectory — same plan that totals 156 seats by Sep 30
   *  in hr-headcount-planning (filled 140 + 12 open + 4 offers). */
  plan: number;
  /** Payroll cost components, $K/month. base+bonus+benefits+taxes = total. */
  baseK: number;
  bonusK: number;
  benefitsK: number;
  taxesK: number;
}

// Reconciliation, by construction:
// - Jul actual 140 = canonical headcount; Apr 132 -> Jul 140 = +8 QoQ.
// - TTM average headcount = 1,544 / 12 = 128.67 -> 8 exits / 128.7 = 6.2%.
// - TTM hires = 140 - 118 + 8 exits = 30 (the "<1 yr" tenure donut slice).
// - Jul payroll 1,620 + 200 + 262 + 228 = 2,310 $K = $2.31M/mo.
// - Apr payroll total 2,160 -> Jul 2,310 = +6.9% QoQ vs +6.1% headcount.
const MONTHS: MonthRow[] = [
  {id: 'aug25', label: 'Aug', full: 'Aug 2025', actual: 118, plan: 118, baseK: 1340, bonusK: 156, benefitsK: 214, taxesK: 188},
  {id: 'sep25', label: 'Sep', full: 'Sep 2025', actual: 120, plan: 122, baseK: 1364, bonusK: 159, benefitsK: 218, taxesK: 191},
  {id: 'oct25', label: 'Oct', full: 'Oct 2025', actual: 122, plan: 125, baseK: 1389, bonusK: 162, benefitsK: 222, taxesK: 195},
  {id: 'nov25', label: 'Nov', full: 'Nov 2025', actual: 124, plan: 128, baseK: 1414, bonusK: 165, benefitsK: 226, taxesK: 198},
  {id: 'dec25', label: 'Dec', full: 'Dec 2025', actual: 126, plan: 130, baseK: 1440, bonusK: 172, benefitsK: 230, taxesK: 202},
  {id: 'jan26', label: 'Jan', full: 'Jan 2026', actual: 128, plan: 133, baseK: 1466, bonusK: 175, benefitsK: 234, taxesK: 206},
  {id: 'feb26', label: 'Feb', full: 'Feb 2026', actual: 130, plan: 136, baseK: 1492, bonusK: 179, benefitsK: 238, taxesK: 210},
  {id: 'mar26', label: 'Mar', full: 'Mar 2026', actual: 131, plan: 138, baseK: 1506, bonusK: 181, benefitsK: 241, taxesK: 212},
  {id: 'apr26', label: 'Apr', full: 'Apr 2026', actual: 132, plan: 140, baseK: 1520, bonusK: 183, benefitsK: 243, taxesK: 214},
  {id: 'may26', label: 'May', full: 'May 2026', actual: 135, plan: 143, baseK: 1556, bonusK: 189, benefitsK: 250, taxesK: 219},
  {id: 'jun26', label: 'Jun', full: 'Jun 2026', actual: 138, plan: 146, baseK: 1590, bonusK: 195, benefitsK: 256, taxesK: 224},
  {id: 'jul26', label: 'Jul', full: 'Jul 2026', actual: 140, plan: 148, baseK: 1620, bonusK: 200, benefitsK: 262, taxesK: 228},
];

const monthTotalK = (m: MonthRow) => m.baseK + m.bonusK + m.benefitsK + m.taxesK;

const LAST = MONTHS[MONTHS.length - 1]; // Jul 2026
const QOQ_BASE = MONTHS[MONTHS.length - 4]; // Apr 2026
const HEADCOUNT = LAST.actual; // 140
const HEADCOUNT_QOQ = LAST.actual - QOQ_BASE.actual; // +8
const PLAN_GAP = LAST.plan - LAST.actual; // 8 seats behind plan
const AVG_HEADCOUNT =
  MONTHS.reduce((sum, m) => sum + m.actual, 0) / MONTHS.length; // 128.67
const PAYROLL_NOW_K = monthTotalK(LAST); // 2,310 = $2.31M
const PAYROLL_QOQ_PCT =
  ((monthTotalK(LAST) - monthTotalK(QOQ_BASE)) / monthTotalK(QOQ_BASE)) * 100; // +6.9%
const HEADCOUNT_QOQ_PCT = (HEADCOUNT_QOQ / QOQ_BASE.actual) * 100; // +6.1%
const COST_PER_EMPLOYEE_K = PAYROLL_NOW_K / HEADCOUNT; // 16.5

// Time-to-hire: average of the 9 reqs closed in Q2 FY26 (Apr–Jun), per the
// recruiting fixtures behind hr-headcount-planning; prior quarter ran 41d.
const TIME_TO_HIRE_DAYS = 34;
const TIME_TO_HIRE_PRIOR = 41;
const OFFERS_OUT = 4; // same 4 offers as hr-headcount-planning's KPI strip

// --- Departments (canonical colors match hr-headcount-planning) -----------

interface Dept {
  id: string;
  label: string;
  headcount: number;
  color: string;
  tokenColor: 'blue' | 'purple' | 'orange' | 'teal' | 'green' | 'pink';
}

const DEPTS: Dept[] = [
  {id: 'eng', label: 'Engineering', headcount: 52, color: VIZ.blue, tokenColor: 'blue'},
  {id: 'design', label: 'Design', headcount: 18, color: VIZ.purple, tokenColor: 'purple'},
  {id: 'gtm', label: 'GTM', headcount: 34, color: VIZ.orange, tokenColor: 'orange'},
  {id: 'ops', label: 'Ops', headcount: 16, color: VIZ.teal, tokenColor: 'teal'},
  {id: 'finance', label: 'Finance', headcount: 8, color: VIZ.green, tokenColor: 'green'},
  {id: 'people', label: 'People', headcount: 12, color: VIZ.pink, tokenColor: 'pink'},
]; // headcounts sum to 140

// --- Attrition ledger: the 8 TTM exits, each a named ex-employee ----------
// (extends the roster with leavers only — never the canonical seven).

interface ExitRecord {
  name: string;
  role: string;
  deptId: string;
  office: 'SF HQ' | 'Lisbon' | 'Remote-US';
  exitMonth: string; // display label
  regretted: boolean;
}

const EXITS: ExitRecord[] = [
  {name: 'Miguel Santos', role: 'Workplace coordinator', deptId: 'ops', office: 'Lisbon', exitMonth: 'Oct 2025', regretted: true},
  {name: 'Ravi Mehta', role: 'Senior engineer, Platform', deptId: 'eng', office: 'SF HQ', exitMonth: 'Nov 2025', regretted: true},
  {name: 'Grace Yoon', role: 'Account executive', deptId: 'gtm', office: 'Remote-US', exitMonth: 'Jan 2026', regretted: true},
  {name: 'Colin Dwyer', role: 'Infrastructure engineer', deptId: 'eng', office: 'Remote-US', exitMonth: 'Feb 2026', regretted: false},
  {name: 'Tyler Brooks', role: 'Sales development rep', deptId: 'gtm', office: 'SF HQ', exitMonth: 'Mar 2026', regretted: false},
  {name: 'Petra Novak', role: 'Product designer', deptId: 'design', office: 'Lisbon', exitMonth: 'Apr 2026', regretted: false},
  {name: 'Martina Silva', role: 'QA engineer', deptId: 'eng', office: 'Lisbon', exitMonth: 'May 2026', regretted: false},
  {name: 'Nadia Karim', role: 'Solutions engineer', deptId: 'gtm', office: 'SF HQ', exitMonth: 'Jun 2026', regretted: true},
];

const TOTAL_EXITS = EXITS.length; // 8
const REGRETTED_EXITS = EXITS.filter(exit => exit.regretted).length; // 4
// Company TTM attrition: 8 exits / 128.7 average headcount = 6.2%.
const ATTRITION_PCT = (TOTAL_EXITS / AVG_HEADCOUNT) * 100;
const ATTRITION_PRIOR_PCT = 7.4; // prior TTM window (Aug 2024 – Jul 2025)

/** Per-department attrition, derived from the same exit ledger. */
interface DeptAttrition extends Dept {
  regretted: number;
  nonRegretted: number;
  exits: number;
  ratePct: number; // TTM exits / current headcount
}

const DEPT_ATTRITION: DeptAttrition[] = DEPTS.map(dept => {
  const deptExits = EXITS.filter(exit => exit.deptId === dept.id);
  const regretted = deptExits.filter(exit => exit.regretted).length;
  return {
    ...dept,
    regretted,
    nonRegretted: deptExits.length - regretted,
    exits: deptExits.length,
    ratePct: (deptExits.length / dept.headcount) * 100,
  };
});

const ATTR_SCALE_MAX = 10; // shared 0–10% scale across department bars
const GTM_ATTRITION = DEPT_ATTRITION.find(d => d.id === 'gtm')!;

// --- Diversity snapshot: three cuts of the same 140 people ----------------

interface DonutSlice {
  label: string;
  count: number;
  color: string;
}

interface DonutSpec {
  id: string;
  title: string;
  slices: DonutSlice[]; // counts sum to 140 in every cut
}

const DONUTS: DonutSpec[] = [
  {
    id: 'gender',
    title: 'Gender',
    slices: [
      {label: 'Women', count: 62, color: VIZ.purple},
      {label: 'Men', count: 74, color: VIZ.blue},
      {label: 'Self-described', count: 4, color: VIZ.teal},
    ],
  },
  {
    id: 'office',
    title: 'Office',
    slices: [
      {label: 'SF HQ', count: 78, color: VIZ.blue},
      {label: 'Lisbon', count: 33, color: VIZ.orange},
      {label: 'Remote-US', count: 29, color: VIZ.green},
    ],
  },
  {
    id: 'tenure',
    title: 'Tenure',
    slices: [
      // "<1 yr" = the 30 TTM hires (140 - 118 + 8 exits), by construction.
      {label: '< 1 yr', count: 30, color: VIZ.teal},
      {label: '1–2 yrs', count: 42, color: VIZ.blue},
      {label: '2–4 yrs', count: 48, color: VIZ.purple},
      {label: '4+ yrs', count: 20, color: VIZ.pink},
    ],
  },
];

// --- Payroll stacked-area series (bottom-up stacking order) ----------------

interface PayrollSeries {
  id: 'base' | 'bonus' | 'benefits' | 'taxes';
  label: string;
  color: string;
  valueK: (m: MonthRow) => number;
}

const PAYROLL_SERIES: PayrollSeries[] = [
  {id: 'base', label: 'Base', color: VIZ.blue, valueK: m => m.baseK},
  {id: 'bonus', label: 'Bonus', color: VIZ.purple, valueK: m => m.bonusK},
  {id: 'benefits', label: 'Benefits', color: VIZ.teal, valueK: m => m.benefitsK},
  {id: 'taxes', label: 'Employer taxes', color: VIZ.orange, valueK: m => m.taxesK},
];

const PAYROLL_MAX_K = 2400; // fixed y ceiling: $0 – $2.4M
const PAYROLL_TICKS_K = [2400, 1800, 1200, 600, 0];

const HC_MIN = 110; // fixed headcount y domain: 110–150 across both ranges
const HC_MAX = 150;
const HC_TICKS = [150, 140, 130, 120, 110];

// --- Generated insights: each card cites the metric it was derived from ---

interface Insight {
  id: string;
  tone: 'warning' | 'error' | 'success';
  accent: string;
  icon: typeof UsersIcon;
  title: string;
  body: string;
  /** The metric / chart this insight cites. */
  cites: string;
  citesShort: string;
  footer: string;
}

const INSIGHTS: Insight[] = [
  {
    id: 'plan-gap',
    tone: 'warning',
    accent: VIZ.orange,
    icon: UsersIcon,
    title: `Hiring is ${PLAN_GAP} seats behind the FY26 base plan`,
    body:
      'July actual is 140 vs 148 planned. The 12 open requisitions plus ' +
      '4 outstanding offers still cover the path to the 156-seat plan by ' +
      'Sep 30 — if offer-accept holds at the Q2 rate.',
    cites: 'Headcount growth vs plan',
    citesShort: 'Headcount',
    footer: 'Generated Jul 3, 2026 · plan-tracking rule',
  },
  {
    id: 'gtm-attrition',
    tone: 'error',
    accent: VIZ.red,
    icon: UserMinusIcon,
    title: 'GTM attrition is running 2.6 pp above company average',
    body:
      'GTM sits at 8.8% TTM vs 6.2% company-wide, and 2 of its 3 exits ' +
      'were regretted (Grace Yoon, Nadia Karim). Both cited comp in exit ' +
      'notes — see the Aug 1 band review with Elena Voss.',
    cites: 'Attrition by department',
    citesShort: 'Attrition',
    footer: 'Generated Jul 3, 2026 · outlier-detection rule',
  },
  {
    id: 'tth-improvement',
    tone: 'success',
    accent: VIZ.green,
    icon: CalendarClockIcon,
    title: 'Time-to-hire improved 7 days quarter over quarter',
    body:
      'Q2 closed reqs averaged 34 days from open to offer-accept, down ' +
      'from 41 in Q1 after Engineering consolidated its loop to four ' +
      'interviews. The 4 offers now out are trending at 31 days.',
    cites: 'Time to hire (KPI)',
    citesShort: 'Time to hire',
    footer: 'Generated Jul 3, 2026 · trend-improvement rule',
  },
];

// ---------------------------------------------------------------------------
// FORMATTING + CHART GEOMETRY HELPERS
// ---------------------------------------------------------------------------

/** $K -> compact dollars: 2310 -> "$2.31M", 262 -> "$262K". */
const formatK = (valueK: number): string =>
  valueK >= 1000 ? `$${(valueK / 1000).toFixed(2)}M` : `$${Math.round(valueK)}K`;

const formatPct1 = (value: number): string => `${value.toFixed(1)}%`;

/** Signed value: 8 -> "+8", -7 -> "−7" (true minus sign). */
const formatSigned = (value: number, suffix = ''): string =>
  `${value >= 0 ? '+' : '−'}${Math.abs(value)}${suffix}`;

/** Map a series onto the 0–100 viewBox (y inverted). */
function toPlotPoints(
  values: number[],
  min: number,
  max: number,
): Array<{x: number; y: number}> {
  const lastIndex = Math.max(values.length - 1, 1);
  return values.map((value, index) => ({
    x: (index / lastIndex) * 100,
    y: 100 - ((value - min) / (max - min)) * 100,
  }));
}

const toPolylinePoints = (points: Array<{x: number; y: number}>): string =>
  points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

/** Hit-strip bounds so each month's click region is centered on its point. */
function monthBounds(index: number, count: number) {
  const step = 100 / (count - 1);
  const left = Math.max(0, (index - 0.5) * step);
  return {left, width: Math.min(100, (index + 0.5) * step) - left};
}

// ---------------------------------------------------------------------------
// KPI TILES
// ---------------------------------------------------------------------------

interface KpiSpec {
  icon: typeof UsersIcon;
  label: string;
  value: string;
  delta: string;
  /** Good-direction coloring: success/error follow the metric's good side. */
  deltaVariant: 'success' | 'error' | 'neutral';
  deltaDown: boolean;
  detail: string;
}

function KpiTile({kpi}: {kpi: KpiSpec}) {
  return (
    <div style={styles.kpiTile}>
      <HStack gap={2} vAlign="center">
        <Icon icon={kpi.icon} size="sm" color="secondary" />
        <Text type="label" size="sm" color="secondary" maxLines={1}>
          {kpi.label}
        </Text>
      </HStack>
      <span style={styles.kpiValue}>{kpi.value}</span>
      <div style={styles.kpiDeltaRow}>
        <Badge
          variant={kpi.deltaVariant}
          label={kpi.delta}
          icon={
            <Icon
              icon={kpi.deltaDown ? TrendingDownIcon : TrendingUpIcon}
              size="xsm"
              color="inherit"
            />
          }
        />
        <Text type="supporting" size="sm" color="secondary" maxLines={1}>
          {kpi.detail}
        </Text>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MONTH AXIS + HIT STRIPS (shared by both time-series charts)
// ---------------------------------------------------------------------------

function MonthTicks({months, thin}: {months: MonthRow[]; thin: boolean}) {
  const count = months.length;
  return (
    <div style={{position: 'relative', height: 14}} aria-hidden="true">
      {months.map((month, index) => {
        // Thin mode keeps every other label anchored on the newest month,
        // so "Jul" always renders and no two kept labels are adjacent.
        if (thin && (count - 1 - index) % 2 === 1) {
          return null;
        }
        const x = (index / (count - 1)) * 100;
        const translate =
          index === 0 ? '0' : index === count - 1 ? '-100%' : '-50%';
        return (
          <span
            key={month.id}
            style={{
              ...styles.axisLabel,
              position: 'absolute',
              left: `${x}%`,
              transform: `translateX(${translate})`,
            }}>
            {month.label}
          </span>
        );
      })}
    </div>
  );
}

function MonthHitStrips({
  months,
  selectedId,
  onSelect,
  chartName,
}: {
  months: MonthRow[];
  selectedId: string;
  onSelect: (id: string) => void;
  chartName: string;
}) {
  const count = months.length;
  return (
    <div style={styles.monthHitRow}>
      {months.map((month, index) => {
        const bounds = monthBounds(index, count);
        return (
          <button
            key={month.id}
            type="button"
            aria-label={`${chartName}: select ${month.full}`}
            aria-pressed={month.id === selectedId}
            onClick={() => onSelect(month.id)}
            style={{
              ...styles.monthHit,
              position: 'absolute',
              insetBlock: 0,
              left: `${bounds.left}%`,
              width: `${bounds.width}%`,
            }}
          />
        );
      })}
    </div>
  );
}

function SelectedMonthBand({index, count}: {index: number; count: number}) {
  const bounds = monthBounds(index, count);
  return (
    <div
      style={{
        ...styles.monthBand,
        left: `${bounds.left}%`,
        width: `${bounds.width}%`,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// HEADCOUNT GROWTH — actual line + dashed plan overlay, labeled axes.
// ---------------------------------------------------------------------------

function HeadcountChart({
  months,
  selectedId,
  onSelectMonth,
  thinTicks,
}: {
  months: MonthRow[];
  selectedId: string;
  onSelectMonth: (id: string) => void;
  thinTicks: boolean;
}) {
  const actualPoints = toPlotPoints(months.map(m => m.actual), HC_MIN, HC_MAX);
  const planPoints = toPlotPoints(months.map(m => m.plan), HC_MIN, HC_MAX);
  const selectedIndex = Math.max(
    months.findIndex(m => m.id === selectedId),
    0,
  );
  const selected = months[selectedIndex];
  const gap = selected.actual - selected.plan;

  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Heading level={3}>Headcount growth</Heading>
          </StackItem>
          <span style={styles.legendItem}>
            <span style={{...styles.legendSwatch, backgroundColor: VIZ.blue}} />
            Actual
          </span>
          <span style={styles.legendItem}>
            <span style={styles.legendDash} />
            FY26 base plan
          </span>
        </HStack>
        <Text type="supporting" size="sm" color="secondary">
          Month-end active employees vs the 156-seat FY26 plan trajectory
        </Text>
        <div style={styles.chartBody}>
          <div style={styles.yAxisCol} aria-hidden="true">
            {HC_TICKS.map(tick => (
              <span key={tick} style={styles.axisLabel}>
                {tick}
              </span>
            ))}
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div
              style={{...styles.plotWrap, height: 190}}
              role="img"
              aria-label={`Headcount growth line chart, ${months[0].full} to ${
                months[months.length - 1].full
              }. Actual ends at ${HEADCOUNT} employees vs ${LAST.plan} planned.`}>
              <SelectedMonthBand index={selectedIndex} count={months.length} />
              <svg
                style={styles.plotSvg}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true">
                {HC_TICKS.map(tick => {
                  const y = 100 - ((tick - HC_MIN) / (HC_MAX - HC_MIN)) * 100;
                  return (
                    <line
                      key={tick}
                      x1={0}
                      x2={100}
                      y1={y}
                      y2={y}
                      stroke="var(--color-border)"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
                <polygon
                  points={`0,100 ${toPolylinePoints(actualPoints)} 100,100`}
                  fill={VIZ.blue}
                  opacity={0.08}
                />
                <polyline
                  points={toPolylinePoints(planPoints)}
                  fill="none"
                  stroke={VIZ.slate}
                  strokeWidth={2}
                  strokeDasharray="6 5"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={toPolylinePoints(actualPoints)}
                  fill="none"
                  stroke={VIZ.blue}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              {actualPoints.map((point, index) => (
                <div
                  key={months[index].id}
                  style={{
                    ...styles.pointDot,
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    ...(index === selectedIndex
                      ? {width: 10, height: 10}
                      : null),
                  }}
                />
              ))}
              <MonthHitStrips
                months={months}
                selectedId={selectedId}
                onSelect={onSelectMonth}
                chartName="Headcount growth"
              />
            </div>
            <MonthTicks months={months} thin={thinTicks} />
          </div>
        </div>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <span style={styles.axisTitle}>
            Employees · {months[0].full} – {months[months.length - 1].full}
          </span>
        </HStack>
        <div style={styles.readoutRow}>
          <span style={styles.readoutValue}>{selected.full}</span>
          <span style={{...styles.readoutValue, color: VIZ.blue}}>
            {selected.actual} active
          </span>
          <Text type="supporting" size="sm" color="secondary">
            plan {selected.plan}
          </Text>
          <Badge
            variant={gap >= 0 ? 'success' : 'warning'}
            label={`${formatSigned(gap)} vs plan`}
          />
        </div>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// ATTRITION BY DEPARTMENT — regretted / non-regretted split on a shared
// 0–10% scale with a dashed company-average marker; clicking a department
// reveals its named exits.
// ---------------------------------------------------------------------------

function AttritionRow({
  dept,
  isSelected,
  onSelect,
}: {
  dept: DeptAttrition;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const regrettedPct = (dept.regretted / dept.headcount) * 100;
  const nonRegrettedPct = (dept.nonRegretted / dept.headcount) * 100;
  const toWidth = (pct: number) => `${(pct / ATTR_SCALE_MAX) * 100}%`;
  return (
    <button
      type="button"
      onClick={() => onSelect(dept.id)}
      aria-pressed={isSelected}
      aria-label={`${dept.label}: ${formatPct1(dept.ratePct)} trailing-twelve-month attrition, ${dept.regretted} regretted and ${dept.nonRegretted} non-regretted exits of ${dept.headcount} employees`}
      style={{...styles.attrRow, ...(isSelected ? styles.attrRowSelected : null)}}>
      <HStack gap={1} vAlign="center">
        <span style={{...styles.legendSwatch, backgroundColor: dept.color, borderRadius: '50%', width: 8, height: 8}} />
        <Text type="label" size="sm" maxLines={1}>
          {dept.label}
        </Text>
      </HStack>
      <div style={styles.attrTrack}>
        <div
          style={{
            ...styles.attrSegment,
            insetInlineStart: 0,
            width: toWidth(regrettedPct),
            backgroundColor: VIZ.red,
          }}
        />
        <div
          style={{
            ...styles.attrSegment,
            insetInlineStart: toWidth(regrettedPct),
            width: toWidth(nonRegrettedPct),
            backgroundColor: VIZ.slate,
          }}
        />
        <div
          style={{
            ...styles.attrAvgLine,
            insetInlineStart: toWidth(ATTRITION_PCT),
          }}
        />
      </div>
      <span style={{...styles.readoutValue, textAlign: 'end'}}>
        {formatPct1(dept.ratePct)}
        <Text type="supporting" size="sm" color="secondary">
          {` · ${dept.exits}`}
        </Text>
      </span>
    </button>
  );
}

function AttritionChart({
  selectedDeptId,
  onSelectDept,
}: {
  selectedDeptId: string | null;
  onSelectDept: (id: string) => void;
}) {
  const selectedDept = DEPT_ATTRITION.find(d => d.id === selectedDeptId);
  const selectedExits = selectedDept
    ? EXITS.filter(exit => exit.deptId === selectedDept.id)
    : [];

  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Heading level={3}>Attrition by department</Heading>
          </StackItem>
          <span style={styles.legendItem}>
            <span style={{...styles.legendSwatch, backgroundColor: VIZ.red}} />
            Regretted
          </span>
          <span style={styles.legendItem}>
            <span style={{...styles.legendSwatch, backgroundColor: VIZ.slate}} />
            Non-regretted
          </span>
          <span style={styles.legendItem}>
            <span style={styles.legendTick} />
            Company {formatPct1(ATTRITION_PCT)}
          </span>
        </HStack>
        <Text type="supporting" size="sm" color="secondary">
          TTM exits over current headcount · {TOTAL_EXITS} exits company-wide
          ({REGRETTED_EXITS} regretted) · select a department for its exits
        </Text>
        <VStack gap={0}>
          {DEPT_ATTRITION.map(dept => (
            <AttritionRow
              key={dept.id}
              dept={dept}
              isSelected={dept.id === selectedDeptId}
              onSelect={onSelectDept}
            />
          ))}
        </VStack>
        <div style={styles.attrScaleRow} aria-hidden="true">
          <span />
          <div style={styles.attrScaleTrack}>
            {[0, 2.5, 5, 7.5, 10].map(tick => (
              <span
                key={tick}
                style={{
                  ...styles.attrScaleTick,
                  insetInlineStart: `${(tick / ATTR_SCALE_MAX) * 100}%`,
                  ...(tick === 0 ? {transform: 'none'} : null),
                }}>
                {tick}%
              </span>
            ))}
          </div>
          <span style={{...styles.axisTitle, textAlign: 'end'}}>rate · n</span>
        </div>
        {selectedDept ? (
          <div style={styles.readoutRow}>
            <VStack gap={0} style={{width: '100%'}}>
              <HStack gap={2} vAlign="center">
                <Token
                  size="sm"
                  color={selectedDept.tokenColor}
                  label={selectedDept.label}
                />
                <StackItem size="fill">
                  <Text type="label" size="sm">
                    {selectedDept.exits} exits of {selectedDept.headcount} (
                    {formatPct1(selectedDept.ratePct)})
                  </Text>
                </StackItem>
                <Button
                  label="Clear"
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectDept(selectedDept.id)}
                />
              </HStack>
              {selectedExits.length === 0 ? (
                <Text type="supporting" size="sm" color="secondary">
                  No exits in the trailing twelve months.
                </Text>
              ) : (
                selectedExits.map(exit => (
                  <div key={exit.name} style={styles.exitRow}>
                    <Avatar name={exit.name} size="xsmall" />
                    <StackItem size="fill" style={{minWidth: 0}}>
                      <Text type="label" size="sm" maxLines={1}>
                        {exit.name}
                        <Text type="supporting" size="sm" color="secondary">
                          {` · ${exit.role} · ${exit.office}`}
                        </Text>
                      </Text>
                    </StackItem>
                    <span style={{whiteSpace: 'nowrap', flexShrink: 0}}>
                      <Text type="supporting" size="sm" color="secondary">
                        {exit.exitMonth}
                      </Text>
                    </span>
                    <Badge
                      variant={exit.regretted ? 'error' : 'neutral'}
                      label={exit.regretted ? 'Regretted' : 'Non-regretted'}
                    />
                  </div>
                ))
              )}
            </VStack>
          </div>
        ) : null}
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// DIVERSITY SNAPSHOT — three donut cuts of the same 140 people, each with
// a count + percent legend. SVG circles use the pathLength=100 trick so
// dash arithmetic stays in percent.
// ---------------------------------------------------------------------------

function Donut({spec}: {spec: DonutSpec}) {
  const total = spec.slices.reduce((sum, slice) => sum + slice.count, 0);
  let offset = 25; // start at 12 o'clock (dash offset runs clockwise here)
  const arcs = spec.slices.map(slice => {
    const pct = (slice.count / total) * 100;
    const arc = {...slice, pct, dashOffset: offset};
    offset -= pct;
    return arc;
  });
  const ariaLabel = `${spec.title} donut: ${spec.slices
    .map(slice => `${slice.label} ${slice.count}`)
    .join(', ')} of ${total} employees`;

  return (
    <div style={styles.donutGroup}>
      <div style={styles.donutWrap} role="img" aria-label={ariaLabel}>
        <svg viewBox="0 0 42 42" style={{width: '100%', height: '100%'}}>
          <circle
            cx={21}
            cy={21}
            r={15.5}
            fill="none"
            stroke="var(--color-background-muted)"
            strokeWidth={6}
          />
          {arcs.map(arc => (
            <circle
              key={arc.label}
              cx={21}
              cy={21}
              r={15.5}
              fill="none"
              stroke={arc.color}
              strokeWidth={6}
              pathLength={100}
              strokeDasharray={`${Math.max(arc.pct - 0.6, 0.4)} ${
                100 - Math.max(arc.pct - 0.6, 0.4)
              }`}
              strokeDashoffset={arc.dashOffset}
            />
          ))}
        </svg>
        <div style={styles.donutCenter}>
          <span style={styles.donutValue}>{total}</span>
          <span style={styles.axisLabel}>{spec.title}</span>
        </div>
      </div>
      <div style={styles.donutLegend}>
        {arcs.map(arc => (
          <span key={arc.label} style={styles.legendItem}>
            <span
              style={{...styles.legendSwatch, backgroundColor: arc.color}}
            />
            <span
              style={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
              {arc.label}
            </span>
            <span
              style={{
                ...styles.numeric,
                color: 'var(--color-text-primary)',
                fontWeight: 600,
              }}>
              {arc.count}
            </span>
            <span style={styles.numeric}>{arc.pct.toFixed(1)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function DiversityCard() {
  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Heading level={3}>Diversity snapshot</Heading>
          </StackItem>
          <Badge variant="neutral" label="140 employees" />
        </HStack>
        <Text type="supporting" size="sm" color="secondary">
          Self-reported as of Jul 1, 2026 · every cut sums to the same 140
          active employees
        </Text>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--spacing-4)',
            rowGap: 'var(--spacing-3)',
          }}>
          {DONUTS.map(spec => (
            <Donut key={spec.id} spec={spec} />
          ))}
        </div>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// PAYROLL COST TREND — stacked area (base / bonus / benefits / employer
// taxes) with a toggleable series legend and a pinned month readout.
// Hidden series are removed from the stack, so visible layers re-seat on
// the baseline and the chart stays honest.
// ---------------------------------------------------------------------------

function PayrollChart({
  months,
  selectedId,
  onSelectMonth,
  thinTicks,
}: {
  months: MonthRow[];
  selectedId: string;
  onSelectMonth: (id: string) => void;
  thinTicks: boolean;
}) {
  const [hidden, setHidden] = useState<ReadonlySet<PayrollSeries['id']>>(
    new Set(),
  );
  const visibleSeries = PAYROLL_SERIES.filter(
    series => !hidden.has(series.id),
  );

  const toggleSeries = (id: PayrollSeries['id']) => {
    setHidden(previous => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < PAYROLL_SERIES.length - 1) {
        next.add(id); // keep at least one series visible
      }
      return next;
    });
  };

  // Cumulative stack tops per visible series, bottom-up.
  const layers = useMemo(() => {
    const running = months.map(() => 0);
    return visibleSeries.map(series => {
      const bottoms = [...running];
      months.forEach((month, index) => {
        running[index] += series.valueK(month);
      });
      const tops = [...running];
      const topPoints = toPlotPoints(tops, 0, PAYROLL_MAX_K);
      const bottomPoints = toPlotPoints(bottoms, 0, PAYROLL_MAX_K).reverse();
      const polygon = [...topPoints, ...bottomPoints];
      return {series, topPoints, polygon};
    });
  }, [months, hidden]); // `hidden` fully determines visibleSeries

  const selectedIndex = Math.max(
    months.findIndex(m => m.id === selectedId),
    0,
  );
  const selected = months[selectedIndex];
  const selectedVisibleTotalK = visibleSeries.reduce(
    (sum, series) => sum + series.valueK(selected),
    0,
  );

  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Heading level={3}>Payroll cost trend</Heading>
          </StackItem>
          {PAYROLL_SERIES.map(series => {
            const isHidden = hidden.has(series.id);
            return (
              <button
                key={series.id}
                type="button"
                onClick={() => toggleSeries(series.id)}
                aria-pressed={!isHidden}
                aria-label={`${isHidden ? 'Show' : 'Hide'} ${series.label}`}
                style={{
                  ...styles.legendToggle,
                  ...(isHidden ? styles.legendToggleOff : null),
                }}>
                <span
                  style={{
                    ...styles.legendSwatch,
                    backgroundColor: series.color,
                    opacity: isHidden ? 0.35 : 1,
                  }}
                />
                {series.label}
              </button>
            );
          })}
        </HStack>
        <Text type="supporting" size="sm" color="secondary">
          Monthly gross cost, USD · Jul runs {formatK(PAYROLL_NOW_K)}/mo (
          {formatK(Math.round(COST_PER_EMPLOYEE_K * 10) / 10)} per employee)
        </Text>
        <div style={styles.chartBody}>
          <div style={styles.yAxisCol} aria-hidden="true">
            {PAYROLL_TICKS_K.map(tick => (
              <span key={tick} style={styles.axisLabel}>
                {tick === 0 ? '$0' : `$${(tick / 1000).toFixed(1)}M`}
              </span>
            ))}
          </div>
          <div style={{flex: 1, minWidth: 0}}>
            <div
              style={{...styles.plotWrap, height: 190}}
              role="img"
              aria-label={`Payroll cost stacked area chart, ${
                months[0].full
              } to ${months[months.length - 1].full}. July total ${formatK(
                PAYROLL_NOW_K,
              )} per month across base, bonus, benefits, and employer taxes.`}>
              <SelectedMonthBand index={selectedIndex} count={months.length} />
              <svg
                style={styles.plotSvg}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true">
                {PAYROLL_TICKS_K.map(tick => {
                  const y = 100 - (tick / PAYROLL_MAX_K) * 100;
                  return (
                    <line
                      key={tick}
                      x1={0}
                      x2={100}
                      y1={y}
                      y2={y}
                      stroke="var(--color-border)"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
                {layers.map(layer => (
                  <g key={layer.series.id}>
                    <polygon
                      points={toPolylinePoints(layer.polygon)}
                      fill={layer.series.color}
                      opacity={0.55}
                    />
                    <polyline
                      points={toPolylinePoints(layer.topPoints)}
                      fill="none"
                      stroke={layer.series.color}
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
              </svg>
              <MonthHitStrips
                months={months}
                selectedId={selectedId}
                onSelect={onSelectMonth}
                chartName="Payroll cost trend"
              />
            </div>
            <MonthTicks months={months} thin={thinTicks} />
          </div>
        </div>
        <div style={styles.readoutRow}>
          <span style={styles.readoutValue}>{selected.full}</span>
          {visibleSeries.map(series => (
            <span key={series.id} style={styles.legendItem}>
              <span
                style={{
                  ...styles.legendSwatch,
                  backgroundColor: series.color,
                }}
              />
              {series.label}{' '}
              <span style={styles.readoutValue}>
                {formatK(series.valueK(selected))}
              </span>
            </span>
          ))}
          <StackItem size="fill" />
          <span style={styles.readoutValue}>
            {hidden.size > 0 ? 'Shown ' : 'Total '}
            {formatK(selectedVisibleTotalK)}
          </span>
        </div>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// INSIGHTS RAIL — three generated-insight cards, each citing its metric.
// ---------------------------------------------------------------------------

function InsightCard({insight}: {insight: Insight}) {
  return (
    <div
      style={{
        ...styles.insightCard,
        ...styles.insightAccent,
        borderInlineStartColor: insight.accent,
      }}>
      <HStack gap={2} vAlign="center">
        <StatusDot variant={insight.tone} label={`${insight.tone} insight`} />
        <StackItem size="fill">
          <Text type="label" size="sm">
            {insight.title}
          </Text>
        </StackItem>
      </HStack>
      <Text type="supporting" size="sm" color="secondary">
        {insight.body}
      </Text>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Icon icon={insight.icon} size="xsm" color="secondary" />
        <Text type="supporting" size="sm" color="secondary">
          Cites
        </Text>
        <Badge variant="info" label={insight.cites} />
      </HStack>
      <Text type="supporting" size="sm" color="secondary">
        {insight.footer}
      </Text>
    </div>
  );
}

function InsightsSection({isInline}: {isInline: boolean}) {
  return (
    <VStack gap={3} style={isInline ? undefined : {padding: 0}}>
      <HStack gap={2} vAlign="center">
        <Icon icon={SparklesIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Heading level={2}>Generated insights</Heading>
        </StackItem>
        <Badge variant="neutral" label={`${INSIGHTS.length}`} />
      </HStack>
      <Text type="supporting" size="sm" color="secondary">
        Rule-based findings recomputed nightly from the same fixtures the
        charts read — every figure below appears on this page.
      </Text>
      {INSIGHTS.map(insight => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
      <Divider />
      <HStack gap={2} vAlign="center">
        <Icon icon={InfoIcon} size="sm" color="secondary" />
        <Text type="supporting" size="sm" color="secondary">
          Ava Lindqvist and Ken Tanaka are mid-onboarding and counted in the
          140 active headcount; their first full payroll posts Jul 31.
        </Text>
      </HStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE — KPI row derived from the same module-scope tables as the charts.
// ---------------------------------------------------------------------------

const KPIS: KpiSpec[] = [
  {
    icon: UsersIcon,
    label: 'Headcount',
    value: `${HEADCOUNT}`,
    delta: `${formatSigned(HEADCOUNT_QOQ)} QoQ`,
    deltaVariant: 'success',
    deltaDown: false,
    detail: `vs plan ${LAST.plan} · 2 in onboarding`,
  },
  {
    icon: UserMinusIcon,
    label: 'Attrition (TTM)',
    value: `${ATTRITION_PCT.toFixed(1)}%`,
    // Good-direction coloring: attrition falling is good, so the down
    // arrow pairs with a success badge.
    delta: `${(ATTRITION_PCT - ATTRITION_PRIOR_PCT).toFixed(1).replace('-', '−')} pp`,
    deltaVariant: 'success',
    deltaDown: true,
    detail: `${TOTAL_EXITS} exits / ${AVG_HEADCOUNT.toFixed(1)} avg · ${REGRETTED_EXITS} regretted`,
  },
  {
    icon: CalendarClockIcon,
    label: 'Time to hire',
    value: `${TIME_TO_HIRE_DAYS}d`,
    delta: `${formatSigned(TIME_TO_HIRE_DAYS - TIME_TO_HIRE_PRIOR, 'd')} QoQ`,
    deltaVariant: 'success',
    deltaDown: true,
    detail: `open → accept · ${OFFERS_OUT} offers out`,
  },
  {
    icon: WalletIcon,
    label: 'Payroll cost',
    value: `${formatK(PAYROLL_NOW_K)}/mo`,
    // Neutral: growth here is headcount-driven, not good or bad by itself.
    delta: `+${PAYROLL_QOQ_PCT.toFixed(1)}% QoQ`,
    deltaVariant: 'neutral',
    deltaDown: false,
    detail: `tracks +${HEADCOUNT_QOQ_PCT.toFixed(1)}% headcount`,
  },
];

export default function WorkforceAnalyticsTemplate() {
  const [range, setRange] = useState<'12m' | '6m'>('12m');
  const [selectedMonthId, setSelectedMonthId] = useState(LAST.id);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>('gtm');
  const [announcement, setAnnouncement] = useState('');

  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const months = range === '12m' ? MONTHS : MONTHS.slice(6);
  // Keep the cross-chart selection valid when the range narrows.
  const effectiveMonthId = months.some(m => m.id === selectedMonthId)
    ? selectedMonthId
    : LAST.id;

  const handleSelectMonth = (id: string) => {
    setSelectedMonthId(id);
    const month = MONTHS.find(m => m.id === id);
    setAnnouncement(
      month ? `${month.full} selected in both trend charts` : '',
    );
  };

  const handleSelectDept = (id: string) => {
    setSelectedDeptId(previous => (previous === id ? null : id));
    const dept = DEPT_ATTRITION.find(d => d.id === id);
    setAnnouncement(
      dept && selectedDeptId !== id
        ? `Showing ${dept.exits} ${dept.label} exits`
        : 'Department filter cleared',
    );
  };

  const handleRange = (value: string) => {
    setRange(value === '6m' ? '6m' : '12m');
  };

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={1}>Workforce analytics</Heading>
            <Text type="supporting" size="sm" color="secondary">
              Kestrel Labs · 140 employees · TTM Aug 2025 – Jul 2026 · as of
              Jul 3, 2026
            </Text>
          </VStack>
        </StackItem>
        <SegmentedControl
          value={range}
          onChange={handleRange}
          label="Trend range"
          size={isCompact ? 'lg' : 'md'}>
          <SegmentedControlItem value="12m" label="12 mo" />
          <SegmentedControlItem value="6m" label="6 mo" />
        </SegmentedControl>
        <Button
          label="Export"
          variant="secondary"
          size={isCompact ? 'lg' : 'md'}
          icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
        />
      </HStack>
    </LayoutHeader>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentScroll}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              <VStack gap={4}>
                <Grid columns={{minWidth: 240, repeat: 'fit'}} gap={3}>
                  {KPIS.map(kpi => (
                    <KpiTile key={kpi.label} kpi={kpi} />
                  ))}
                </Grid>
                <Grid columns={{minWidth: 430, repeat: 'fit'}} gap={3}>
                  <HeadcountChart
                    months={months}
                    selectedId={effectiveMonthId}
                    onSelectMonth={handleSelectMonth}
                    thinTicks={isCompact && range === '12m'}
                  />
                  <AttritionChart
                    selectedDeptId={selectedDeptId}
                    onSelectDept={handleSelectDept}
                  />
                  <DiversityCard />
                  <PayrollChart
                    months={months}
                    selectedId={effectiveMonthId}
                    onSelectMonth={handleSelectMonth}
                    thinTicks={isCompact && range === '12m'}
                  />
                </Grid>
                {isPanelHidden ? (
                  <>
                    <Divider />
                    <InsightsSection isInline />
                  </>
                ) : null}
              </VStack>
            </div>
          </LayoutContent>
        }
        end={
          isPanelHidden ? undefined : (
            <LayoutPanel
              width={320}
              padding={0}
              hasDivider
              label="Generated insights">
              <div style={styles.railScroll}>
                <InsightsSection isInline={false} />
              </div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
