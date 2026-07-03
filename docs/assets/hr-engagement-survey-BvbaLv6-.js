var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs Q2 ’26 engagement
 *   pulse (11 teams across the six canonical departments whose invited
 *   seats sum to 140 and whose responses sum to 118, per-team scores for
 *   7 engagement categories, fixed last-quarter category scores, fixed
 *   tech-benchmark scores, an eNPS split of 55 promoters / 45 passives /
 *   18 detractors, and 76 comment excerpts clustered into 5 themes). No
 *   clocks, no Math.random(), no network media; every rollup (category
 *   overall scores, department response rates, eNPS, theme counts) is
 *   derived from the same team-level fixtures at module scope so all
 *   panels reconcile by construction.
 * @output Engagement Survey Results — the survey-results readout for the
 *   Kestrel Labs Q2 ’26 pulse (140-person platform company). A
 *   response-rate header (118 of 140, 84%, with per-department progress
 *   rows), an eNPS arc gauge (+31, Q1 tick at +24, benchmark +18) beside
 *   promoter/passive/detractor split bars, a 7-category score board
 *   (score bar on a labeled 1–5 scale, delta-vs-Q1 chip, benchmark
 *   diamond marker), a by-team heat strip with an anonymity threshold
 *   (teams under 5 respondents render "n<5 hidden" instead of scores)
 *   and a Score / vs benchmark view toggle, a driver-analysis callout
 *   linking the lowest category (Compensation confidence) to attrition
 *   risk, and a top-themes panel (theme, sentiment, excerpt count,
 *   anonymized quote) that scopes to the selected category.
 * @position Page template; emitted by \`astryx template hr-engagement-survey\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title, survey window, response-rate readout, export)
 *   | content (summary band: response-rate tile + eNPS gauge + split
 *     bars; category score board; team heat strip; driver callout — one
 *     vertical scroller)
 *   | end panel 340 (top themes from comments, scrolls independently).
 *
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. Summary tiles, category rows, heat cells, theme entries, and
 *   the driver callout are styled bordered divs; the themes list lives
 *   in a LayoutPanel.
 *
 * Color policy: token-pure everywhere; the only literals are (a) the
 *   repo-standard \`light-dark()\` fallback pairs on the data-viz
 *   categorical tokens (eNPS segments, gauge arc, benchmark diamonds),
 *   (b) the red/amber sentiment + delta pairs that follow the same
 *   pattern, and (c) the five-step heat-scale tint ramp — low-alpha
 *   rgba() pairs per scheme so default token text stays AA on every
 *   heat cell. The demo does not inject \`--color-data-categorical-*\`.
 *
 * Responsive contract:
 * - > 1180px: full frame with the 340px themes panel on the end edge.
 * - <= 1180px: the themes panel drops and the same themes section
 *   renders inline below the driver callout in the main scroller.
 * - <= 980px: the summary band falls from [rate | gauge | split] 3-up to
 *   a single column; the heat strip scrolls horizontally on purpose (its
 *   grid keeps a 660px floor so cells never crush).
 * - <= 768px: the category board hides the benchmark diamond column
 *   caption row and the header row wraps instead of clipping the export
 *   button or the heat-view toggle.
 * - The content column and the themes panel scroll independently
 *   (\`minHeight: 0\` down each flex chain).
 */

import {useState, type CSSProperties} from 'react';

import {
  ActivityIcon,
  DownloadIcon,
  GaugeIcon,
  InfoIcon,
  LockIcon,
  MessageSquareTextIcon,
  MinusIcon,
  ShieldAlertIcon,
  SparklesIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UsersIcon,
  XIcon,
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
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  // Summary band: response rate | eNPS gauge | split bars ------------------
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 4fr) minmax(0, 5fr)',
    gap: 'var(--spacing-3)',
  },
  summaryGridCompact: {gridTemplateColumns: 'minmax(0, 1fr)'},
  summaryTile: {
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  bigValue: {fontSize: 28, lineHeight: 1.15, fontWeight: 650, fontVariantNumeric: 'tabular-nums'},
  deptRateRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'},
  deptRateLabel: {width: 88, flexShrink: 0},
  deptRateTrack: {
    flex: 1, minWidth: 0, height: 6, borderRadius: 999, overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  deptRateFill: {height: '100%', borderRadius: 999},
  deptRateCount: {
    width: 64, textAlign: 'end', flexShrink: 0,
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  },
  gaugeWrap: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-1)'},
  gaugeSvg: {display: 'block', maxWidth: '100%'},
  splitRow: {display: 'flex', flexDirection: 'column', gap: 4},
  splitTrack: {
    height: 10, borderRadius: 999, overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  splitFill: {height: '100%', borderRadius: 999},
  splitCount: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Category score board ----------------------------------------------------
  sectionBlock: {minWidth: 0},
  scaleHeaderRow: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    // Match the category rows' horizontal padding so the tick labels line
    // up with the gridlines below.
    paddingInline: 'var(--spacing-2)',
  },
  scaleAxis: {position: 'relative', flex: 1, minWidth: 0, height: 14},
  scaleAxisLabel: {
    position: 'absolute', top: 0, transform: 'translateX(-50%)', fontSize: 10,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  },
  categoryRow: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-2)',
    borderRadius: 'var(--radius-container)', cursor: 'pointer',
    border: 'var(--border-width) solid transparent',
  },
  categoryRowSelected: {
    // Inset outline so the active row never bleeds onto neighbors.
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  categoryLabel: {width: 210, flexShrink: 0, minWidth: 0},
  categoryTrackWrap: {position: 'relative', flex: 1, minWidth: 0, height: 22},
  categoryTrack: {
    position: 'absolute', insetInlineStart: 0, insetInlineEnd: 0,
    top: 7, height: 8, borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
  },
  categoryFill: {position: 'absolute', insetInlineStart: 0, top: 7, height: 8, borderRadius: 999},
  gridTick: {position: 'absolute', top: 4, width: 1, height: 14, backgroundColor: 'var(--color-border)'},
  benchmarkDiamond: {
    position: 'absolute', top: 6, width: 10, height: 10,
    transform: 'translateX(-50%) rotate(45deg)',
    border: '2px solid var(--color-background-surface)', borderRadius: 2,
  },
  scoreCell: {
    width: 44, textAlign: 'end', flexShrink: 0,
    fontVariantNumeric: 'tabular-nums', fontWeight: 600, whiteSpace: 'nowrap',
  },
  deltaChip: {
    display: 'inline-flex', alignItems: 'center', gap: 2,
    width: 64, justifyContent: 'flex-end', flexShrink: 0,
    fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // Intentional literals (light-dark pairs): deltas read as up/down in both
  // schemes — green/red that AA-pass on the surface token.
  deltaUp: {color: 'light-dark(#0B7A1E, #4ADE80)'},
  deltaDown: {color: 'light-dark(#B91C1C, #F87171)'},
  deltaFlat: {color: 'var(--color-text-secondary)'},
  // Heat strip ---------------------------------------------------------------
  heatScrollX: {overflowX: 'auto', minWidth: 0},
  heatGrid: {
    display: 'grid',
    // Team column + 7 category columns; 660px floor so cells never crush —
    // narrow viewports scroll this grid horizontally on purpose. The floor
    // stays under the desktop content column (~678px) so no column ever
    // clips at the default width.
    gridTemplateColumns: '176px repeat(7, minmax(64px, 1fr))',
    gap: 3,
    minWidth: 660,
  },
  heatHeadCell: {padding: '4px 6px', textAlign: 'center', minWidth: 0},
  heatTeamCell: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)',
    padding: '4px 6px', minWidth: 0,
  },
  heatDeptCell: {gridColumn: '1 / -1', paddingTop: 'var(--spacing-2)', paddingBottom: 2},
  heatCell: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '5px 4px', borderRadius: 'var(--radius-control, 6px)',
    fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 600,
    minWidth: 0, whiteSpace: 'nowrap',
  },
  heatCellHidden: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontWeight: 500, fontSize: 11, gap: 3,
  },
  heatCellHighlight: {boxShadow: 'inset 0 0 0 1px var(--color-accent)'},
  heatLegendSwatch: {width: 12, height: 12, borderRadius: 3, flexShrink: 0},
  deptDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  // Driver-analysis callout ---------------------------------------------------
  driverCallout: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    // Intentional literal (light-dark pair): the risk callout carries a
    // low-alpha red tint in both schemes; text inside stays token-pure.
    border: 'var(--border-width) solid light-dark(rgba(185,28,28,0.35), rgba(248,113,113,0.4))',
    backgroundColor: 'light-dark(rgba(220,38,38,0.06), rgba(248,113,113,0.1))',
  },
  driverIcon: {
    flexShrink: 0, display: 'inline-flex', padding: 6,
    borderRadius: 'var(--radius-container)',
    color: 'light-dark(#B91C1C, #F87171)',
    backgroundColor: 'light-dark(rgba(220,38,38,0.1), rgba(248,113,113,0.14))',
  },
  driverStat: {fontVariantNumeric: 'tabular-nums', fontWeight: 650},
  noteRow: {
    display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Themes panel ---------------------------------------------------------------
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  panelHeader: {flexShrink: 0, padding: 'var(--spacing-3)'},
  panelScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-3)', paddingTop: 0},
  themeCard: {
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  themeQuote: {
    margin: 0, paddingInlineStart: 'var(--spacing-3)',
    borderInlineStart: '2px solid var(--color-border)', fontStyle: 'italic',
  },
  excerptCount: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  headerRate: {display: 'inline-flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap'},
  visuallyHidden: {
    position: 'absolute', width: 1, height: 1, margin: -1,
    overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
  },
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard \`light-dark()\` fallback pair.
const VIZ = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  red: 'light-dark(#DC2626, #F87171)',
} as const;

// eNPS segment colors — promoters green, passives neutral, detractors red.
const ENPS_COLOR = {
  promoters: VIZ.green,
  passives: 'var(--color-border)',
  detractors: VIZ.red,
} as const;

// Five-step heat-scale ramp: low-alpha background tints per scheme keep
// default token text AA on every cell; the swatch legend uses the same
// pairs at full strength for the scale key.
interface HeatStep {
  min: number;
  label: string;
  tint: string;
  swatch: string;
}

const HEAT_STEPS: HeatStep[] = [
  {min: 4.2, label: '4.2+',
    tint: 'light-dark(rgba(11,153,31,0.22), rgba(52,199,89,0.28))',
    swatch: 'light-dark(#0B991F, #34C759)'},
  {min: 3.9, label: '3.9–4.1',
    tint: 'light-dark(rgba(11,153,31,0.11), rgba(52,199,89,0.14))',
    swatch: 'light-dark(#7BC98A, #1E7A38)'},
  {min: 3.5, label: '3.5–3.8',
    tint: 'light-dark(rgba(234,179,8,0.18), rgba(250,204,21,0.16))',
    swatch: 'light-dark(#EAB308, #FACC15)'},
  {min: 3.0, label: '3.0–3.4',
    tint: 'light-dark(rgba(235,110,0,0.16), rgba(255,147,48,0.2))',
    swatch: 'light-dark(#EB6E00, #FF9330)'},
  {min: 0, label: '< 3.0',
    tint: 'light-dark(rgba(220,38,38,0.16), rgba(248,113,113,0.22))',
    swatch: 'light-dark(#DC2626, #F87171)'},
];

function heatStepFor(score: number): HeatStep {
  return HEAT_STEPS.find(step => score >= step.min) ?? HEAT_STEPS[4];
}

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs, a 140-person platform
// company. Canonical department headcounts (sum 140): Engineering 52,
// Design 18, GTM 34, Ops 16, Finance 8, People 12. The Q2 ’26 pulse ran
// Jun 15–26, 2026; 118 of the 140 invited responded (84%). Every rollup on
// the page — category overalls, department response rates, the eNPS score —
// is DERIVED from the team fixtures below at module scope, so all panels
// reconcile by construction.
// ---------------------------------------------------------------------------

type CategoryId =
  | 'manager'
  | 'collab'
  | 'mission'
  | 'recognition'
  | 'wellbeing'
  | 'growth'
  | 'comp';

interface CategoryMeta {
  id: CategoryId;
  label: string;
  /** Short column header for the heat strip — full words, never truncated. */
  short: string;
  /** Q1 ’26 overall score — the delta baseline. */
  lastQuarter: number;
  /** Tech-benchmark median (214 companies, 100–500 FTE). */
  benchmark: number;
}

const CATEGORIES: CategoryMeta[] = [
  {id: 'manager', label: 'Manager support', short: 'Manager', lastQuarter: 4.1, benchmark: 4.0},
  {id: 'collab', label: 'Team collaboration', short: 'Collab', lastQuarter: 4.1, benchmark: 4.1},
  {id: 'mission', label: 'Mission & purpose', short: 'Mission', lastQuarter: 4.1, benchmark: 3.9},
  {id: 'recognition', label: 'Recognition', short: 'Recog.', lastQuarter: 3.5, benchmark: 3.7},
  {id: 'wellbeing', label: 'Wellbeing & balance', short: 'Wellbeing', lastQuarter: 3.8, benchmark: 3.8},
  {id: 'growth', label: 'Growth & development', short: 'Growth', lastQuarter: 3.5, benchmark: 3.6},
  {id: 'comp', label: 'Compensation confidence', short: 'Comp.', lastQuarter: 3.4, benchmark: 3.4},
];

const CATEGORY_BY_ID = new Map(CATEGORIES.map(cat => [cat.id, cat]));

type DeptId = 'eng' | 'design' | 'gtm' | 'ops' | 'finance' | 'people';

interface DeptMeta {
  id: DeptId;
  label: string;
  color: string;
}

const DEPTS: DeptMeta[] = [
  {id: 'eng', label: 'Engineering', color: VIZ.blue},
  {id: 'design', label: 'Design', color: VIZ.purple},
  {id: 'gtm', label: 'GTM', color: VIZ.orange},
  {id: 'ops', label: 'Ops', color: VIZ.teal},
  {id: 'finance', label: 'Finance', color: VIZ.green},
  {id: 'people', label: 'People', color: 'light-dark(#DB2777, #F472B6)'},
];

/** Anonymity threshold — teams with fewer respondents render "n<5 hidden". */
const ANONYMITY_MIN = 5;

interface Team {
  id: string;
  label: string;
  dept: DeptId;
  /** Employees invited — team invited counts sum to each canonical
   * department headcount (Eng 52, Design 18, GTM 34, Ops 16, Finance 8,
   * People 12 — total 140). */
  invited: number;
  /** Employees who responded — sums to 118 across all teams. */
  responded: number;
  /** Mean score per category (1–5 scale), ordered like CATEGORIES:
   * manager, collab, mission, recognition, wellbeing, growth, comp.
   * Teams under the anonymity threshold still contribute to rollups —
   * their cells just never render. */
  scores: [number, number, number, number, number, number, number];
}

const TEAMS: Team[] = [
  // ---- Engineering 52 invited · 45 responded ----
  {id: 'platform', label: 'Platform', dept: 'eng', invited: 16, responded: 14,
    scores: [4.2, 4.3, 4.0, 3.7, 3.4, 3.3, 2.8]},
  {id: 'product-eng', label: 'Product Engineering', dept: 'eng', invited: 19, responded: 17,
    scores: [4.4, 4.3, 4.2, 3.9, 3.7, 3.5, 3.2]},
  {id: 'infra', label: 'Infrastructure', dept: 'eng', invited: 17, responded: 14,
    scores: [4.1, 4.0, 4.0, 3.6, 3.3, 3.2, 3.0]},
  // ---- Design 18 invited · 16 responded ----
  {id: 'product-design', label: 'Product Design', dept: 'design', invited: 13, responded: 12,
    scores: [4.5, 4.4, 4.3, 4.0, 3.8, 3.6, 3.3]},
  {id: 'brand', label: 'Brand Studio', dept: 'design', invited: 5, responded: 4,
    scores: [4.2, 4.1, 4.0, 3.8, 3.6, 3.4, 3.1]},
  // ---- GTM 34 invited · 27 responded ----
  {id: 'sales', label: 'Sales', dept: 'gtm', invited: 16, responded: 13,
    scores: [4.2, 4.0, 4.1, 3.9, 3.4, 3.3, 2.9]},
  {id: 'marketing', label: 'Marketing', dept: 'gtm', invited: 10, responded: 8,
    scores: [4.3, 4.2, 4.1, 3.8, 3.6, 3.4, 3.2]},
  {id: 'cs', label: 'Customer Success', dept: 'gtm', invited: 8, responded: 6,
    scores: [4.4, 4.1, 4.2, 3.7, 3.5, 3.3, 3.1]},
  // ---- Ops 16 invited · 13 responded ----
  {id: 'workplace', label: 'Workplace Ops', dept: 'ops', invited: 11, responded: 9,
    scores: [4.3, 4.2, 4.1, 3.8, 3.9, 3.5, 3.3]},
  {id: 'it', label: 'IT & Security', dept: 'ops', invited: 5, responded: 4,
    scores: [4.1, 4.0, 3.9, 3.6, 3.5, 3.2, 3.0]},
  // ---- Finance 8 invited · 7 responded ----
  {id: 'finance-team', label: 'Finance', dept: 'finance', invited: 8, responded: 7,
    scores: [4.0, 4.1, 4.0, 3.7, 3.6, 3.4, 3.5]},
  // ---- People 12 invited · 10 responded ----
  {id: 'people-ops', label: 'People Ops', dept: 'people', invited: 12, responded: 10,
    scores: [4.5, 4.4, 4.4, 4.0, 3.9, 3.7, 3.4]},
];

// ---------------------------------------------------------------------------
// eNPS — "How likely are you to recommend Kestrel Labs as a place to work?"
// (0–10). All 118 respondents answered: 55 promoters (9–10), 45 passives
// (7–8), 18 detractors (0–6). eNPS = round((55 − 18) / 118 × 100) = +31.
// Q1 ’26 landed at +24; the tech benchmark median is +18.
// ---------------------------------------------------------------------------

const ENPS_SPLIT = [
  {id: 'promoters', label: 'Promoters (9–10)', count: 55, color: ENPS_COLOR.promoters},
  {id: 'passives', label: 'Passives (7–8)', count: 45, color: ENPS_COLOR.passives},
  {id: 'detractors', label: 'Detractors (0–6)', count: 18, color: ENPS_COLOR.detractors},
] as const;

const ENPS_LAST_QUARTER = 24;
const ENPS_BENCHMARK = 18;

// Survey window — fixed dates, July 2026 reporting cycle.
const SURVEY_WINDOW = 'Jun 15 – Jun 26, 2026';
const SURVEY_CLOSED = 'Jun 26';
const RESULTS_PUBLISHED = 'Jul 2, 2026';

// ---------------------------------------------------------------------------
// COMMENT THEMES — 76 of the 118 respondents left a free-text comment; the
// clustering pass assigns each comment to exactly one primary theme, so
// excerpt counts sum to 76. Quotes are anonymized excerpts.
// ---------------------------------------------------------------------------

type Sentiment = 'positive' | 'negative' | 'mixed';

interface Theme {
  id: string;
  label: string;
  category: CategoryId;
  sentiment: Sentiment;
  /** Comments whose primary theme this is — all five sum to 76. */
  excerpts: number;
  quote: string;
  quoteSource: string;
}

const THEMES: Theme[] = [
  {
    id: 'career-pathing',
    label: 'Career pathing clarity',
    category: 'growth',
    sentiment: 'negative',
    excerpts: 21,
    quote:
      'I still can’t tell what the bar between L4 and L5 actually is — the leveling guide hasn’t been touched since we were 40 people.',
    quoteSource: 'Engineering · IC',
  },
  {
    id: 'manager-1-1s',
    label: 'Manager 1:1 quality',
    category: 'manager',
    sentiment: 'positive',
    excerpts: 18,
    quote:
      'My manager reworked our 1:1s into real coaching time this quarter. Easily the best part of my week.',
    quoteSource: 'GTM · IC',
  },
  {
    id: 'comp-transparency',
    label: 'Compensation transparency',
    category: 'comp',
    sentiment: 'negative',
    excerpts: 16,
    quote:
      'The bands exist, but nobody will show them to us. Guessing where I sit in the range is exhausting.',
    quoteSource: 'Engineering · IC',
  },
  {
    id: 'cross-team',
    label: 'Cross-team hand-offs',
    category: 'collab',
    sentiment: 'mixed',
    excerpts: 12,
    quote:
      'Platform ↔ Product hand-offs got noticeably smoother after the intake process changed; Design hand-offs still stall.',
    quoteSource: 'Design · Lead',
  },
  {
    id: 'meeting-load',
    label: 'Meeting load & focus time',
    category: 'wellbeing',
    sentiment: 'negative',
    excerpts: 9,
    quote:
      'Four recurring syncs before lunch on Tuesdays. I do my actual work after 6pm and it’s starting to show.',
    quoteSource: 'Ops · IC',
  },
];

const TOTAL_COMMENTS = THEMES.reduce((sum, theme) => sum + theme.excerpts, 0); // 76

// ---------------------------------------------------------------------------
// DERIVED AGGREGATES — computed once at module scope from the team fixtures
// so the header, summary band, category board, heat strip, and callout all
// agree by construction.
// ---------------------------------------------------------------------------

const TOTAL_INVITED = TEAMS.reduce((sum, team) => sum + team.invited, 0); // 140
const TOTAL_RESPONDED = TEAMS.reduce((sum, team) => sum + team.responded, 0); // 118
const RESPONSE_RATE_PCT = Math.round((TOTAL_RESPONDED / TOTAL_INVITED) * 100); // 84

/** Respondent-weighted overall score per category, rounded to 1 decimal.
 * Sub-threshold teams count toward rollups — only their cells hide. */
function overallScore(categoryIndex: number): number {
  const weighted = TEAMS.reduce(
    (sum, team) => sum + team.scores[categoryIndex] * team.responded,
    0,
  );
  return Number((weighted / TOTAL_RESPONDED).toFixed(1));
}

interface CategoryResult extends CategoryMeta {
  score: number;
  /** Score − last quarter, at 1-decimal precision. */
  delta: number;
}

const CATEGORY_RESULTS: CategoryResult[] = CATEGORIES.map((cat, index) => {
  const score = overallScore(index);
  return {...cat, score, delta: Number((score - cat.lastQuarter).toFixed(1))};
});

/** Lowest-scoring category — drives the attrition-risk callout. */
const LOWEST_CATEGORY = CATEGORY_RESULTS.reduce((low, cat) =>
  cat.score < low.score ? cat : low,
);

interface DeptRate extends DeptMeta {
  invited: number;
  responded: number;
  pct: number;
}

/** Per-department response rates — team sums, so Engineering shows 45/52,
 * Design 16/18, GTM 27/34, Ops 13/16, Finance 7/8, People 10/12. */
const DEPT_RATES: DeptRate[] = DEPTS.map(dept => {
  const teams = TEAMS.filter(team => team.dept === dept.id);
  const invited = teams.reduce((sum, team) => sum + team.invited, 0);
  const responded = teams.reduce((sum, team) => sum + team.responded, 0);
  return {...dept, invited, responded, pct: Math.round((responded / invited) * 100)};
});

const ENPS_TOTAL = ENPS_SPLIT.reduce((sum, seg) => sum + seg.count, 0); // 118
const ENPS_SCORE = Math.round(
  ((ENPS_SPLIT[0].count - ENPS_SPLIT[2].count) / ENPS_TOTAL) * 100,
); // +31

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** 1-decimal score display — "4.3", "3.0". */
function formatScore(score: number): string {
  return score.toFixed(1);
}

/** Signed 1-decimal delta — "+0.2", "−0.3", "0.0" (true minus sign). */
function formatDelta(delta: number): string {
  if (delta > 0) return \`+\${delta.toFixed(1)}\`;
  if (delta < 0) return \`−\${Math.abs(delta).toFixed(1)}\`;
  return '0.0';
}

/** Signed eNPS display — "+31", "−4", "0". */
function formatEnps(value: number): string {
  if (value > 0) return \`+\${value}\`;
  if (value < 0) return \`−\${Math.abs(value)}\`;
  return '0';
}

function deltaStyle(delta: number): CSSProperties {
  if (delta > 0) return {...styles.deltaChip, ...styles.deltaUp};
  if (delta < 0) return {...styles.deltaChip, ...styles.deltaDown};
  return {...styles.deltaChip, ...styles.deltaFlat};
}

function deltaIcon(delta: number) {
  if (delta > 0) return TrendingUpIcon;
  if (delta < 0) return TrendingDownIcon;
  return MinusIcon;
}

/** Score (1–5) → percent position on the category track. */
function scaleToPct(score: number): number {
  return ((score - 1) / 4) * 100;
}

const SENTIMENT_TOKEN: Record<Sentiment, {label: string; color: 'green' | 'red' | 'orange'}> = {
  positive: {label: 'Positive', color: 'green'},
  negative: {label: 'Negative', color: 'red'},
  mixed: {label: 'Mixed', color: 'orange'},
};

// ---------------------------------------------------------------------------
// eNPS GAUGE — a semicircular arc from −100 to +100 with the value arc,
// a tick at last quarter's score, and the score centered below. Pure SVG
// with deterministic geometry (fixed inputs, module-scope math only).
// ---------------------------------------------------------------------------

const GAUGE = {width: 220, height: 128, cx: 110, cy: 110, r: 86, stroke: 14};

/** eNPS value (−100..100) → point on the gauge arc. */
function gaugePoint(value: number, radius: number): {x: number; y: number} {
  // −100 maps to 180° (left), +100 to 0° (right).
  const angle = Math.PI * (1 - (value + 100) / 200);
  return {
    x: GAUGE.cx + radius * Math.cos(angle),
    y: GAUGE.cy - radius * Math.sin(angle),
  };
}

/** SVG arc path along the gauge ring between two eNPS values. */
function gaugeArc(from: number, to: number): string {
  const start = gaugePoint(from, GAUGE.r);
  const end = gaugePoint(to, GAUGE.r);
  return \`M \${start.x.toFixed(2)} \${start.y.toFixed(2)} A \${GAUGE.r} \${GAUGE.r} 0 0 1 \${end.x.toFixed(2)} \${end.y.toFixed(2)}\`;
}

/** Radial tick line crossing the ring at an eNPS value. */
function gaugeTick(value: number): string {
  const inner = gaugePoint(value, GAUGE.r - GAUGE.stroke / 2 - 3);
  const outer = gaugePoint(value, GAUGE.r + GAUGE.stroke / 2 + 3);
  return \`M \${inner.x.toFixed(2)} \${inner.y.toFixed(2)} L \${outer.x.toFixed(2)} \${outer.y.toFixed(2)}\`;
}

function EnpsGauge() {
  const axisY = GAUGE.cy + 16;
  return (
    <div style={styles.gaugeWrap}>
      <svg
        width={GAUGE.width}
        height={GAUGE.height + 14}
        viewBox={\`0 0 \${GAUGE.width} \${GAUGE.height + 14}\`}
        style={styles.gaugeSvg}
        role="img"
        aria-label={\`eNPS gauge: \${formatEnps(ENPS_SCORE)} on a scale from −100 to +100. Last quarter \${formatEnps(ENPS_LAST_QUARTER)}, benchmark \${formatEnps(ENPS_BENCHMARK)}.\`}>
        {/* Track: the full −100..+100 semicircle. */}
        <path
          d={gaugeArc(-100, 100)}
          fill="none"
          stroke="var(--color-background-muted)"
          strokeWidth={GAUGE.stroke}
          strokeLinecap="round"
        />
        {/* Value arc: −100 up to the Q2 score. */}
        <path
          d={gaugeArc(-100, ENPS_SCORE)}
          fill="none"
          style={{stroke: ENPS_COLOR.promoters}}
          strokeWidth={GAUGE.stroke}
          strokeLinecap="round"
        />
        {/* Last-quarter tick. */}
        <path
          d={gaugeTick(ENPS_LAST_QUARTER)}
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeWidth={2}
        />
        {/* Axis labels — chart hygiene: the scale is explicit. */}
        <text x={GAUGE.cx - GAUGE.r} y={axisY} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">
          −100
        </text>
        {/* "0" sits fully above the ring — baseline cy − r − stroke/2 − 4
            keeps it clear of the arc band. */}
        <text
          x={GAUGE.cx}
          y={GAUGE.cy - GAUGE.r - GAUGE.stroke / 2 - 4}
          textAnchor="middle"
          fontSize={10}
          fill="var(--color-text-secondary)">
          0
        </text>
        <text x={GAUGE.cx + GAUGE.r} y={axisY} textAnchor="middle" fontSize={10} fill="var(--color-text-secondary)">
          +100
        </text>
        {/* Score readout, centered in the arc. */}
        <text
          x={GAUGE.cx}
          y={GAUGE.cy - 18}
          textAnchor="middle"
          fontSize={34}
          fontWeight={650}
          fill="var(--color-text-primary, currentColor)"
          style={{fontVariantNumeric: 'tabular-nums'}}>
          {formatEnps(ENPS_SCORE)}
        </text>
        <text x={GAUGE.cx} y={GAUGE.cy + 2} textAnchor="middle" fontSize={11} fill="var(--color-text-secondary)">
          eNPS · Q2 ’26
        </text>
      </svg>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        Arc tick = Q1 ’26 ({formatEnps(ENPS_LAST_QUARTER)}) · benchmark{' '}
        {formatEnps(ENPS_BENCHMARK)} · {formatEnps(ENPS_SCORE - ENPS_LAST_QUARTER)} QoQ
      </Text>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUMMARY BAND — response-rate tile, gauge tile, eNPS split-bar tile.
// ---------------------------------------------------------------------------

function ResponseRateTile() {
  return (
    <div style={styles.summaryTile}>
      <HStack gap={2} vAlign="center">
        <Icon icon={UsersIcon} size="sm" color="secondary" />
        <Text type="label" size="sm" color="secondary" maxLines={1}>
          Response rate
        </Text>
      </HStack>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-2)', minWidth: 0}}>
        <span style={styles.bigValue}>{RESPONSE_RATE_PCT}%</span>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {TOTAL_RESPONDED} of {TOTAL_INVITED} invited · closed {SURVEY_CLOSED}
        </Text>
      </div>
      <VStack gap={1}>
        {DEPT_RATES.map(dept => (
          <div key={dept.id} style={styles.deptRateRow}>
            <div style={styles.deptRateLabel}>
              <Text type="supporting" color="secondary" maxLines={1}>
                {dept.label}
              </Text>
            </div>
            <div
              style={styles.deptRateTrack}
              role="img"
              aria-label={\`\${dept.label}: \${dept.responded} of \${dept.invited} responded (\${dept.pct}%)\`}>
              <div
                style={{
                  ...styles.deptRateFill,
                  width: \`\${dept.pct}%\`,
                  backgroundColor: dept.color,
                }}
              />
            </div>
            <span style={styles.deptRateCount}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {dept.responded}/{dept.invited}
              </Text>
            </span>
          </div>
        ))}
      </VStack>
    </div>
  );
}

function EnpsGaugeTile() {
  return (
    <div style={styles.summaryTile}>
      <HStack gap={2} vAlign="center">
        <Icon icon={GaugeIcon} size="sm" color="secondary" />
        {/* Short title — the full "employee net promoter score" phrase
            truncates at the tile's default desktop width. */}
        <Text type="label" size="sm" color="secondary" maxLines={1}>
          Employee NPS
        </Text>
      </HStack>
      <EnpsGauge />
    </div>
  );
}

function EnpsSplitTile() {
  return (
    <div style={styles.summaryTile}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ActivityIcon} size="sm" color="secondary" />
        {/* Short title — "promoter / passive / detractor split" truncates
            at the tile's default desktop width; the rows carry the detail. */}
        <Text type="label" size="sm" color="secondary" maxLines={1}>
          eNPS split
        </Text>
      </HStack>
      <VStack gap={2}>
        {ENPS_SPLIT.map(seg => {
          const pct = Math.round((seg.count / ENPS_TOTAL) * 100);
          return (
            <div key={seg.id} style={styles.splitRow}>
              <HStack gap={2} vAlign="center">
                <Text type="supporting" maxLines={1}>
                  {seg.label}
                </Text>
                <StackItem size="fill" />
                <span style={styles.splitCount}>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {seg.count} · {pct}%
                  </Text>
                </span>
              </HStack>
              <div
                style={styles.splitTrack}
                role="img"
                aria-label={\`\${seg.label}: \${seg.count} respondents, \${pct} percent\`}>
                <div
                  style={{
                    ...styles.splitFill,
                    width: \`\${pct}%\`,
                    backgroundColor: seg.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </VStack>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        All {ENPS_TOTAL} respondents answered the eNPS question. eNPS =
        %promoters − %detractors.
      </Text>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CATEGORY SCORE BOARD — 7 rows on a shared, labeled 1–5 scale. Each row:
// category label, score bar with gridline ticks and a benchmark diamond,
// numeric score, and a delta-vs-Q1 chip. Rows select to scope the heat
// strip highlight and the themes panel.
// ---------------------------------------------------------------------------

/** Gridline positions on the 1–5 scale — labeled in the axis header. */
const SCALE_TICKS = [1, 2, 3, 4, 5];

function ScaleAxisHeader() {
  return (
    <div style={styles.scaleHeaderRow} aria-hidden="true">
      <div style={styles.categoryLabel}>
        <Text type="supporting" color="secondary">
          Category
        </Text>
      </div>
      <div style={styles.scaleAxis}>
        {SCALE_TICKS.map(tick => (
          <span
            key={tick}
            style={{...styles.scaleAxisLabel, left: \`\${scaleToPct(tick)}%\`}}>
            {tick}
          </span>
        ))}
      </div>
      <span style={{...styles.scoreCell, fontWeight: 400}}>
        <Text type="supporting" color="secondary">
          Score
        </Text>
      </span>
      <span style={{...styles.deltaChip, fontWeight: 400}}>
        <Text type="supporting" color="secondary">
          Δ Q1
        </Text>
      </span>
    </div>
  );
}

function CategoryRow({
  category,
  isSelected,
  onSelect,
}: {
  category: CategoryResult;
  isSelected: boolean;
  onSelect: (id: CategoryId) => void;
}) {
  const DeltaIcon = deltaIcon(category.delta);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={\`\${category.label}: score \${formatScore(category.score)} of 5, \${formatDelta(category.delta)} vs last quarter, benchmark \${formatScore(category.benchmark)}. Selects the category to scope themes and the heat strip.\`}
      onClick={() => onSelect(category.id)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(category.id);
        }
      }}
      style={{
        ...styles.categoryRow,
        ...(isSelected ? styles.categoryRowSelected : null),
      }}>
      <div style={styles.categoryLabel}>
        <Text type="label" size="sm" maxLines={1}>
          {category.label}
        </Text>
      </div>
      <div style={styles.categoryTrackWrap}>
        <div style={styles.categoryTrack} />
        {/* Gridlines at each integer scale stop. */}
        {SCALE_TICKS.slice(1, -1).map(tick => (
          <div
            key={tick}
            style={{...styles.gridTick, left: \`\${scaleToPct(tick)}%\`}}
            aria-hidden="true"
          />
        ))}
        <div
          style={{
            ...styles.categoryFill,
            width: \`\${scaleToPct(category.score)}%\`,
            backgroundColor:
              category.id === LOWEST_CATEGORY.id ? VIZ.red : VIZ.blue,
          }}
        />
        {/* Benchmark diamond marker. */}
        <div
          style={{
            ...styles.benchmarkDiamond,
            left: \`\${scaleToPct(category.benchmark)}%\`,
            backgroundColor: VIZ.purple,
          }}
          aria-hidden="true"
        />
      </div>
      <span style={styles.scoreCell}>{formatScore(category.score)}</span>
      <span style={deltaStyle(category.delta)}>
        <Icon icon={DeltaIcon} size="xsm" color="inherit" />
        {formatDelta(category.delta)}
      </span>
    </div>
  );
}

function CategoryBoard({
  selectedCategory,
  onSelect,
  isNarrow,
}: {
  selectedCategory: CategoryId | null;
  onSelect: (id: CategoryId) => void;
  isNarrow: boolean;
}) {
  return (
    <VStack gap={2} style={styles.sectionBlock}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Heading level={2}>Category scores</Heading>
        <StackItem size="fill" />
        <HStack gap={1} vAlign="center">
          <div
            style={{
              ...styles.benchmarkDiamond,
              position: 'static',
              transform: 'rotate(45deg)',
              backgroundColor: VIZ.purple,
            }}
            aria-hidden="true"
          />
          <Text type="supporting" color="secondary">
            Tech benchmark (214 companies)
          </Text>
        </HStack>
      </HStack>
      <Text type="supporting" color="secondary">
        Scale 1–5 · respondent-weighted means · select a row to scope the
        heat strip and comment themes.
      </Text>
      <VStack gap={0}>
        {isNarrow ? null : <ScaleAxisHeader />}
        {CATEGORY_RESULTS.map(category => (
          <CategoryRow
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onSelect={onSelect}
          />
        ))}
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// HEAT STRIP — teams × categories grid grouped by department. Cells tint by
// score bucket (or by gap vs benchmark in the second view); teams under the
// anonymity threshold render a locked "n<5 hidden" cell for every category.
// ---------------------------------------------------------------------------

type HeatView = 'score' | 'benchmark';

/** Benchmark-gap tint: green above, red below, neutral within ±0.05. */
function benchmarkTint(gap: number): CSSProperties {
  if (gap > 0.05)
    return {backgroundColor: 'light-dark(rgba(11,153,31,0.16), rgba(52,199,89,0.2))'};
  if (gap < -0.05)
    return {backgroundColor: 'light-dark(rgba(220,38,38,0.14), rgba(248,113,113,0.2))'};
  return {backgroundColor: 'var(--color-background-muted)'};
}

function HeatCell({
  team,
  categoryIndex,
  view,
  isHighlighted,
}: {
  team: Team;
  categoryIndex: number;
  view: HeatView;
  isHighlighted: boolean;
}) {
  const category = CATEGORIES[categoryIndex];
  if (team.responded < ANONYMITY_MIN) {
    return (
      <div
        style={{
          ...styles.heatCell,
          ...styles.heatCellHidden,
          ...(isHighlighted ? styles.heatCellHighlight : null),
        }}
        role="img"
        aria-label={\`\${team.label}, \${category.label}: hidden — fewer than \${ANONYMITY_MIN} respondents\`}>
        <Icon icon={LockIcon} size="xsm" color="inherit" />
        {'n<5'}
      </div>
    );
  }
  const score = team.scores[categoryIndex];
  if (view === 'benchmark') {
    const gap = Number((score - category.benchmark).toFixed(1));
    return (
      <div
        style={{
          ...styles.heatCell,
          ...benchmarkTint(gap),
          ...(isHighlighted ? styles.heatCellHighlight : null),
        }}
        role="img"
        aria-label={\`\${team.label}, \${category.label}: \${formatDelta(gap)} vs benchmark\`}>
        {formatDelta(gap)}
      </div>
    );
  }
  return (
    <div
      style={{
        ...styles.heatCell,
        backgroundColor: heatStepFor(score).tint,
        ...(isHighlighted ? styles.heatCellHighlight : null),
      }}
      role="img"
      aria-label={\`\${team.label}, \${category.label}: \${formatScore(score)} of 5\`}>
      {formatScore(score)}
    </div>
  );
}

/** Legend items per heat view — the benchmark view keys above/below tints. */
const BENCH_LEGEND = [
  {label: 'Above benchmark', swatch: 'light-dark(rgba(11,153,31,0.4), rgba(52,199,89,0.45))'},
  {label: 'Below benchmark', swatch: 'light-dark(rgba(220,38,38,0.35), rgba(248,113,113,0.45))'},
];

function HeatLegend({view}: {view: HeatView}) {
  const items =
    view === 'benchmark'
      ? BENCH_LEGEND
      : HEAT_STEPS.map(step => ({label: step.label, swatch: step.swatch}));
  return (
    <HStack gap={3} vAlign="center" wrap="wrap" style={{rowGap: 4}}>
      {view === 'benchmark' ? (
        <Text type="supporting" color="secondary">
          Cell = team score − category benchmark
        </Text>
      ) : null}
      {items.map(item => (
        <HStack key={item.label} gap={1} vAlign="center">
          <div style={{...styles.heatLegendSwatch, backgroundColor: item.swatch}} />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {item.label}
          </Text>
        </HStack>
      ))}
    </HStack>
  );
}

function HeatStrip({
  view,
  onViewChange,
  selectedCategory,
}: {
  view: HeatView;
  onViewChange: (view: HeatView) => void;
  selectedCategory: CategoryId | null;
}) {
  const highlightIndex =
    selectedCategory === null
      ? -1
      : CATEGORIES.findIndex(cat => cat.id === selectedCategory);
  const hiddenTeams = TEAMS.filter(team => team.responded < ANONYMITY_MIN);
  return (
    <VStack gap={2} style={styles.sectionBlock}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Heading level={2}>Scores by team</Heading>
        <StackItem size="fill" />
        {/* Short labels so the control never wraps (footgun #7). */}
        <SegmentedControl
          value={view}
          onChange={value => onViewChange(value as HeatView)}
          label="Heat strip view"
          size="sm">
          <SegmentedControlItem value="score" label="Score" />
          <SegmentedControlItem value="benchmark" label="vs bench" />
        </SegmentedControl>
      </HStack>
      <HeatLegend view={view} />
      {/* Deliberate horizontal scroller — the grid keeps a 660px floor. */}
      <div style={styles.heatScrollX}>
        <div style={styles.heatGrid}>
          {/* Column headers. */}
          <div style={styles.heatTeamCell}>
            <Text type="supporting" color="secondary">
              Team · responded
            </Text>
          </div>
          {CATEGORIES.map((cat, index) => (
            <div
              key={cat.id}
              style={{
                ...styles.heatHeadCell,
                ...(index === highlightIndex ? styles.heatCellHighlight : null),
              }}>
              <Text
                type="supporting"
                color={index === highlightIndex ? 'primary' : 'secondary'}
                maxLines={1}>
                {cat.short}
              </Text>
            </div>
          ))}
          {/* Department groups, then one row per team. */}
          {DEPTS.map(dept => {
            const teams = TEAMS.filter(team => team.dept === dept.id);
            return (
              <div key={dept.id} style={{display: 'contents'}}>
                <div style={styles.heatDeptCell}>
                  <HStack gap={1} vAlign="center">
                    <div
                      style={{...styles.deptDot, backgroundColor: dept.color}}
                      aria-hidden="true"
                    />
                    <Text type="label" size="sm" color="secondary">
                      {dept.label}
                    </Text>
                  </HStack>
                </div>
                {teams.map(team => (
                  <div key={team.id} style={{display: 'contents'}}>
                    <div style={styles.heatTeamCell}>
                      <Text type="supporting" maxLines={1}>
                        {team.label}
                      </Text>
                      <StackItem size="fill" />
                      <Text type="supporting" color="secondary" hasTabularNumbers>
                        {team.responded}/{team.invited}
                      </Text>
                    </div>
                    {CATEGORIES.map((cat, index) => (
                      <HeatCell
                        key={cat.id}
                        team={team}
                        categoryIndex={index}
                        view={view}
                        isHighlighted={index === highlightIndex}
                      />
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div style={styles.noteRow}>
        <Icon icon={LockIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary">
          Anonymity threshold: teams with fewer than {ANONYMITY_MIN}{' '}
          respondents ({hiddenTeams.map(team => team.label).join(', ')}) never
          show scores. Their responses still count toward category and
          company rollups.
        </Text>
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// DRIVER-ANALYSIS CALLOUT — links the lowest category to attrition risk.
// The regression figures are fixed fixture outputs of the People-team
// driver model, anchored to the same lowest-category rollup.
// ---------------------------------------------------------------------------

/** Respondents who scored the lowest category ≤ 2 — fixture cohort. */
const AT_RISK_COUNT = 14;
const AT_RISK_MULTIPLIER = '2.4×';

function DriverCallout({onOpenPlan}: {onOpenPlan: () => void}) {
  return (
    <div style={styles.driverCallout}>
      <span style={styles.driverIcon}>
        <Icon icon={ShieldAlertIcon} size="md" color="inherit" />
      </span>
      <VStack gap={2} style={{minWidth: 0}}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Heading level={3}>
            Driver analysis: {LOWEST_CATEGORY.label.toLowerCase()} is the top
            attrition signal
          </Heading>
          <Badge variant="error" label="Attrition risk" />
        </HStack>
        <Text>
          <span style={styles.driverStat}>{LOWEST_CATEGORY.label}</span> is
          this pulse’s lowest category at{' '}
          <span style={styles.driverStat}>
            {formatScore(LOWEST_CATEGORY.score)}
          </span>{' '}
          ({formatDelta(LOWEST_CATEGORY.delta)} QoQ,{' '}
          {formatDelta(
            Number((LOWEST_CATEGORY.score - LOWEST_CATEGORY.benchmark).toFixed(1)),
          )}{' '}
          vs benchmark). Respondents scoring it 2 or lower are{' '}
          <span style={styles.driverStat}>{AT_RISK_MULTIPLIER}</span> more
          likely to appear in the trailing-12-month regretted-attrition
          cohort. <span style={styles.driverStat}>{AT_RISK_COUNT}</span>{' '}
          respondents sit in that band this quarter, concentrated in
          Platform and Sales — the two teams scoring below 3.0.
        </Text>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button
            label="Draft comp-review action plan"
            variant="primary"
            size="sm"
            icon={<Icon icon={SparklesIcon} size="sm" />}
            onClick={onOpenPlan}
          />
          <Text type="supporting" color="secondary">
            Owner: Dana Whitfield (People Ops) · reviewed with Elena Voss
            (Finance) {RESULTS_PUBLISHED}
          </Text>
        </HStack>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TOP THEMES — comment clusters. Scoped to the selected category when one
// is active; renders inline below the callout when the end panel drops.
// ---------------------------------------------------------------------------

function ThemeCard({theme}: {theme: Theme}) {
  const sentiment = SENTIMENT_TOKEN[theme.sentiment];
  const category = CATEGORY_BY_ID.get(theme.category);
  return (
    <div style={styles.themeCard}>
      <HStack gap={2} vAlign="center">
        <Text type="label" maxLines={1}>
          {theme.label}
        </Text>
        <StackItem size="fill" />
        <Token size="sm" color={sentiment.color} label={sentiment.label} />
      </HStack>
      <HStack gap={1} vAlign="center" wrap="wrap">
        <Icon icon={MessageSquareTextIcon} size="xsm" color="secondary" />
        <span style={styles.excerptCount}>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {theme.excerpts} excerpts
          </Text>
        </span>
        <Text type="supporting" color="secondary">
          · {category?.label ?? theme.category}
        </Text>
      </HStack>
      <blockquote style={styles.themeQuote}>
        <Text type="supporting" color="secondary">
          “{theme.quote}”
        </Text>
      </blockquote>
      <Text type="supporting" color="secondary">
        — {theme.quoteSource}
      </Text>
    </div>
  );
}

function ThemesSection({
  selectedCategory,
  onClearCategory,
  isInline,
}: {
  selectedCategory: CategoryId | null;
  onClearCategory: () => void;
  isInline: boolean;
}) {
  const scoped =
    selectedCategory === null
      ? THEMES
      : THEMES.filter(theme => theme.category === selectedCategory);
  const scopedCategory =
    selectedCategory === null ? null : CATEGORY_BY_ID.get(selectedCategory);
  const header = (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <Icon icon={MessageSquareTextIcon} size="sm" color="secondary" />
        <Heading level={2}>Top themes</Heading>
        <StackItem size="fill" />
        {scopedCategory ? (
          <Button
            label="Clear"
            variant="ghost"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClearCategory}
          />
        ) : null}
      </HStack>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {scopedCategory
          ? \`Scoped to \${scopedCategory.label} · \${scoped.reduce((sum, theme) => sum + theme.excerpts, 0)} of \${TOTAL_COMMENTS} comments\`
          : \`\${TOTAL_COMMENTS} of \${TOTAL_RESPONDED} respondents left a comment · 5 auto-clustered themes\`}
      </Text>
    </VStack>
  );
  const cards =
    scoped.length > 0 ? (
      scoped.map(theme => <ThemeCard key={theme.id} theme={theme} />)
    ) : (
      <div style={styles.noteRow}>
        <Icon icon={InfoIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary">
          No comment cluster maps to {scopedCategory?.label.toLowerCase()}{' '}
          this quarter — its excerpts fell below the clustering floor of 8
          comments.
        </Text>
      </div>
    );
  if (isInline) {
    return (
      <VStack gap={3} style={styles.sectionBlock}>
        {header}
        {cards}
      </VStack>
    );
  }
  return (
    <div style={styles.panelFill}>
      <div style={styles.panelHeader}>{header}</div>
      <div style={styles.panelScroll}>
        <VStack gap={3}>{cards}</VStack>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function HrEngagementSurveyTemplate() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [heatView, setHeatView] = useState<HeatView>('score');
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px folds the themes panel inline; <=980px
  // stacks the summary band; <=768px drops the category axis header.
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 980px)');
  const isNarrow = useMediaQuery('(max-width: 768px)');

  const selectCategory = (id: CategoryId) => {
    const next = selectedCategory === id ? null : id;
    setSelectedCategory(next);
    setAnnouncement(
      next === null
        ? 'Cleared the category scope — themes show all comment clusters.'
        : \`Scoped to \${CATEGORY_BY_ID.get(next)?.label ?? next} — the heat strip highlights its column and themes filter to its clusters.\`,
    );
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    setAnnouncement('Cleared the category scope — themes show all comment clusters.');
  };

  const changeHeatView = (view: HeatView) => {
    setHeatView(view);
    setAnnouncement(
      view === 'score'
        ? 'Heat strip shows raw team scores.'
        : 'Heat strip shows each team score minus the category benchmark.',
    );
  };

  const exportResults = () => {
    setAnnouncement('Exported the Q2 2026 pulse results as CSV.');
  };

  const openPlan = () => {
    setAnnouncement(
      \`Drafted a comp-review action plan for \${LOWEST_CATEGORY.label} and assigned it to Dana Whitfield.\`,
    );
  };

  // ----- header: brand, survey window, response readout, export -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isNarrow ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ActivityIcon} size="md" color="secondary" />
          <Heading level={1}>Engagement Survey</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · Q2 ’26 pulse · {SURVEY_WINDOW}
          </Text>
        </HStack>
        <StackItem size="fill" />
        <span style={styles.headerRate}>
          <Text type="label" size="sm" hasTabularNumbers>
            {TOTAL_RESPONDED} of {TOTAL_INVITED} responded
          </Text>
          <Badge variant="success" label={\`\${RESPONSE_RATE_PCT}%\`} />
        </span>
        <Button
          label="Export results"
          variant="secondary"
          size="sm"
          icon={<Icon icon={DownloadIcon} size="sm" />}
          onClick={exportResults}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- summary band: response rate | eNPS gauge | split bars -----
  const summaryBand = (
    <div
      style={{
        ...styles.summaryGrid,
        ...(isCompact ? styles.summaryGridCompact : null),
      }}>
      <ResponseRateTile />
      <EnpsGaugeTile />
      <EnpsSplitTile />
    </div>
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
                {summaryBand}
                <div style={styles.noteRow}>
                  <Icon icon={InfoIcon} size="sm" color="secondary" />
                  <Text type="supporting" color="secondary">
                    Results published {RESULTS_PUBLISHED}. The panel is the
                    full 140-person headcount as of the Jun 15 send; the 2
                    hires still in onboarding — Ava Lindqvist (Engineering)
                    and Ken Tanaka (GTM) — were invited but sit among the 22
                    non-responders, as pulse response is optional during
                    onboarding.
                  </Text>
                </div>
                <CategoryBoard
                  selectedCategory={selectedCategory}
                  onSelect={selectCategory}
                  isNarrow={isNarrow}
                />
                <Divider />
                <HeatStrip
                  view={heatView}
                  onViewChange={changeHeatView}
                  selectedCategory={selectedCategory}
                />
                <DriverCallout onOpenPlan={openPlan} />
                {isPanelHidden ? (
                  <>
                    <Divider />
                    <ThemesSection
                      selectedCategory={selectedCategory}
                      onClearCategory={clearCategory}
                      isInline
                    />
                  </>
                ) : null}
              </VStack>
            </div>
          </LayoutContent>
        }
        end={
          isPanelHidden ? undefined : (
            <LayoutPanel width={340} padding={0} hasDivider label="Top themes">
              <ThemesSection
                selectedCategory={selectedCategory}
                onClearCategory={clearCategory}
                isInline={false}
              />
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};