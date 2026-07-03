var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs 2026–27 open
 *   enrollment (window Jul 1–15 2026, fixed "as of" reference Jul 3 so the
 *   12-day countdown never ticks), a per-department status matrix whose
 *   enrolled/started/not-started columns sum to the canonical 140
 *   headcount (112 / 19 / 9), five benefit plans with fixed per-employee
 *   monthly premiums and election counts that reconcile against the 112
 *   completed enrollments, an employee sample per status segment, a
 *   3-document dependent-verification queue, and four QLE exception
 *   fixtures. No clocks, no Math.random(), no network media; every
 *   banner figure and employer-cost subtotal is derived from the same
 *   fixtures at module scope so all panels reconcile by construction.
 * @output Benefits Enrollment Admin — the open-enrollment console for
 *   Kestrel Labs (140-person platform company). An enrollment-window
 *   banner (Jul 1–15 window, static 12-days-left countdown, tri-segment
 *   completion meter for 112 enrolled / 19 started / 9 not started); five
 *   plan cards (Meridian PPO, Cascade HMO, Brightside Dental, Lumen
 *   Vision, Vantage 401k) with carrier monogram tiles, election counts,
 *   and employer/employee monthly cost splits plus a derived employer
 *   monthly spend line; a status-segmented employee table with per-row
 *   and bulk nudge actions; a QLE exceptions row (marriage, birth, two
 *   new-hire windows); and a dependent-verification queue panel with
 *   3 pending documents and approve / request-new actions.
 * @position Page template; emitted by \`astryx template hr-benefits-enrollment\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title, plan-year note, export)
 *   | content (window banner, plan-card grid, employee status table,
 *     QLE exceptions row — one vertical scroller)
 *   | end panel 320 (dependent-verification queue, scrolls independently).
 *
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. Plan cards, QLE tiles, and verification entries are styled
 *   bordered divs; the queue lives in a LayoutPanel.
 *
 * Color policy: token-pure everywhere; the only literals are the
 *   repo-standard \`light-dark()\` fallback pairs on the data-viz
 *   categorical tokens (carrier monogram tiles, completion-meter
 *   segments, election dots) plus a pink pair following the same
 *   pattern — the demo does not inject \`--color-data-categorical-*\`.
 *
 * Responsive contract:
 * - > 1180px: full frame with the 320px verification panel on the end
 *   edge.
 * - <= 1180px: the verification panel drops and the same queue renders
 *   inline between the employee table and the QLE row, so every pending
 *   document stays reachable.
 * - The plan grid and QLE row are container-driven (auto-fill floors of
 *   200px / 240px), so they rewrap by available width — 5-up / 4-up on a
 *   full-width frame, 3-up / 2-up in narrower stages — without relying
 *   on viewport media queries.
 * - <= 860px: the banner stacks (window copy, countdown, meter become
 *   rows) and the header wraps instead of clipping the export button.
 * - The employee table keeps five compact columns (office lives in the
 *   fixtures, not a column) so the action column stays visible without
 *   horizontal scrolling even in a ~700px content column.
 * - The content column and the verification panel scroll independently
 *   (\`minHeight: 0\` down each flex chain).
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  BellRingIcon,
  CalendarClockIcon,
  CheckIcon,
  ClipboardCheckIcon,
  DownloadIcon,
  EyeIcon,
  FileCheck2Icon,
  FileClockIcon,
  HeartPulseIcon,
  HourglassIcon,
  PiggyBankIcon,
  RefreshCcwIcon,
  ShieldCheckIcon,
  SmileIcon,
  SparklesIcon,
  UserPlusIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // Enrollment-window banner ------------------------------------------------
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-5)',
    padding: 'var(--spacing-4)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  bannerStacked: {flexDirection: 'column', alignItems: 'stretch', gap: 'var(--spacing-3)'},
  bannerWindow: {minWidth: 0},
  bannerCountdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    paddingInline: 'var(--spacing-4)',
    borderInlineStart: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  bannerCountdownStacked: {borderInlineStart: 'none', paddingInline: 0},
  countdownValue: {
    fontSize: 28,
    lineHeight: 1.1,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  bannerMeter: {flex: 1, minWidth: 220},
  // Tri-segment completion meter: enrolled + started + not-started = 140.
  meterTrack: {
    display: 'flex',
    height: 10,
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  meterSegment: {height: '100%'},
  legendSwatch: {width: 10, height: 10, borderRadius: 3, flexShrink: 0},
  legendRow: {rowGap: 4},
  // Plan cards ---------------------------------------------------------------
  // Container-driven: 5-up on a full-width frame, 3-up in narrower
  // stages — the demo preview column is narrower than the viewport, so
  // a fixed 5-column track would crush the cards.
  planGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 'var(--spacing-3)',
  },
  planCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  // Carrier monogram tile — initials on a tinted square; the tint pair is
  // the same light-dark fallback the categorical tokens carry.
  monogram: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-container)',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.4,
    flexShrink: 0,
  },
  planCount: {
    fontSize: 22,
    lineHeight: 1.15,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
  },
  // Employer/employee monthly premium split bar.
  splitTrack: {
    display: 'flex',
    height: 6,
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  splitSegment: {height: '100%'},
  splitFigure: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Employee status table ----------------------------------------------------
  sectionBlock: {minWidth: 0},
  tableScrollX: {overflowX: 'auto', minWidth: 0},
  numericCell: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  electionDots: {display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0},
  electionDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  deadlineText: {whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'},
  // QLE exceptions row ---------------------------------------------------
  qleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 'var(--spacing-3)',
  },
  qleTile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  qleCode: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Dependent-verification queue -------------------------------------------
  panelFill: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {flexShrink: 0, padding: 'var(--spacing-3)'},
  panelScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    paddingTop: 0,
  },
  docCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  // Prevents Tokens from stretching to full width inside column-flex
  // tiles (default align-items: stretch turns them into full-width bars).
  tokenInline: {alignSelf: 'flex-start'},
  verifiedRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    minWidth: 0,
  },
  noteRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
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
  pink: 'light-dark(#DB2777, #F472B6)',
} as const;

// Completion-meter segments — one legend for the banner and the table
// SegmentedControl to agree on.
const STATUS_COLOR = {
  enrolled: VIZ.green,
  started: VIZ.orange,
  // Not-started renders as the neutral border tone so the meter still
  // reads window-shaped where nobody has acted yet.
  notStarted: 'var(--color-border)',
} as const;

// Monogram tile tints: 12%-alpha washes of the same categorical hues so
// carrier initials keep AA contrast in both schemes.
const MONOGRAM_BG = {
  blue: 'light-dark(rgba(1,113,227,0.12), rgba(76,158,255,0.18))',
  teal: 'light-dark(rgba(14,126,139,0.12), rgba(51,184,199,0.18))',
  purple: 'light-dark(rgba(107,30,253,0.10), rgba(157,107,255,0.18))',
  orange: 'light-dark(rgba(235,110,0,0.12), rgba(255,147,48,0.18))',
  green: 'light-dark(rgba(11,153,31,0.12), rgba(52,199,89,0.18))',
} as const;

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs, a 140-person platform
// company, running 2026–27 open enrollment. Signed-in admin: Dana Whitfield
// (People Ops). Window Jul 1–15 2026; coverage effective Aug 1 2026. The
// page is frozen at a fixed "as of" reference (Jul 3, 09:00 PT) so the
// 12-day countdown is deterministic — no clocks.
// ---------------------------------------------------------------------------

const WINDOW = {
  opensLabel: 'Jul 1',
  closesLabel: 'Jul 15, 2026',
  closesTimeLabel: '11:59 PM PT',
  effectiveLabel: 'Aug 1, 2026',
  daysLeft: 12,
  asOfLabel: 'Jul 3, 9:00 AM PT',
} as const;

type StatusId = 'enrolled' | 'started' | 'notStarted';

const STATUS_LABEL: Record<StatusId, string> = {
  enrolled: 'Enrolled',
  started: 'Started',
  notStarted: 'Not started',
};

// Per-department enrollment status matrix. Row totals are the canonical
// Kestrel Labs headcounts (Engineering 52, Design 18, GTM 34, Ops 16,
// Finance 8, People 12 — sum 140); the banner's 112 / 19 / 9 figures are
// DERIVED by summing these columns, so the meter reconciles by
// construction. The 140 eligible includes the 2 hires mid-onboarding
// (Ava Lindqvist, Ken Tanaka) — both sit in "not started" with new-hire
// windows surfaced in the QLE exceptions row.
interface DeptStatus {
  id: string;
  label: string;
  enrolled: number;
  started: number;
  notStarted: number;
}

const DEPT_STATUS: DeptStatus[] = [
  {id: 'eng', label: 'Engineering', enrolled: 41, started: 8, notStarted: 3},
  {id: 'design', label: 'Design', enrolled: 15, started: 2, notStarted: 1},
  {id: 'gtm', label: 'GTM', enrolled: 27, started: 5, notStarted: 2},
  {id: 'ops', label: 'Ops', enrolled: 13, started: 2, notStarted: 1},
  {id: 'finance', label: 'Finance', enrolled: 7, started: 1, notStarted: 0},
  {id: 'people', label: 'People', enrolled: 9, started: 1, notStarted: 2},
];

const sumBy = (key: StatusId) =>
  DEPT_STATUS.reduce((sum, dept) => sum + dept[key], 0);

/** 112 / 19 / 9 — derived from the department matrix above. */
const STATUS_TOTALS: Record<StatusId, number> = {
  enrolled: sumBy('enrolled'), // 112
  started: sumBy('started'), // 19
  notStarted: sumBy('notStarted'), // 9
};

/** Canonical company size — 140, the sum of every status column. */
const TOTAL_ELIGIBLE =
  STATUS_TOTALS.enrolled + STATUS_TOTALS.started + STATUS_TOTALS.notStarted;

const PCT_ENROLLED = Math.round((STATUS_TOTALS.enrolled / TOTAL_ELIGIBLE) * 100); // 80

// ---------------------------------------------------------------------------
// PLANS — five benefit plans with fixed employee-only monthly premiums.
// Election counts are among the 112 COMPLETED enrollments and reconcile
// per line of coverage: medical 64 PPO + 41 HMO + 7 waived = 112; dental
// 101 + 11 waived; vision 89 + 23 waived; 401k 96 + 16 opted out. The
// employer monthly spend line under the grid is derived from these
// fixtures (enrolled × employer share), never hand-typed.
// ---------------------------------------------------------------------------

type VizColor = keyof typeof MONOGRAM_BG;

interface Plan {
  id: string;
  carrier: string;
  planName: string;
  monogram: string;
  color: VizColor;
  kindLabel: string;
  /** Elections among the 112 completed enrollments. */
  elected: number;
  /** Employees who explicitly declined this line of coverage. */
  declined: number;
  declinedVerb: string;
  /** Employer / employee share of the monthly per-employee cost (USD). */
  erMonthly: number;
  eeMonthly: number;
  /** 401k only — the ER figure is an average match, not a premium. */
  costNote: string;
}

const PLANS: Plan[] = [
  {
    id: 'ppo',
    carrier: 'Meridian Health',
    planName: 'Meridian PPO 500',
    monogram: 'MH',
    color: 'blue',
    kindLabel: 'Medical · PPO',
    elected: 64,
    declined: 0,
    declinedVerb: 'waived',
    erMonthly: 912,
    eeMonthly: 228,
    costNote: 'per employee / mo',
  },
  {
    id: 'hmo',
    carrier: 'Cascade Health',
    planName: 'Cascade HMO Select',
    monogram: 'CH',
    color: 'teal',
    kindLabel: 'Medical · HMO',
    elected: 41,
    declined: 7,
    declinedVerb: 'waived medical',
    erMonthly: 688,
    eeMonthly: 172,
    costNote: 'per employee / mo',
  },
  {
    id: 'dental',
    carrier: 'Brightside Dental',
    planName: 'Brightside Dental PPO',
    monogram: 'BD',
    color: 'purple',
    kindLabel: 'Dental',
    elected: 101,
    declined: 11,
    declinedVerb: 'waived',
    erMonthly: 42,
    eeMonthly: 10,
    costNote: 'per employee / mo',
  },
  {
    id: 'vision',
    carrier: 'Lumen Vision',
    planName: 'Lumen Vision Plus',
    monogram: 'LV',
    color: 'orange',
    kindLabel: 'Vision',
    elected: 89,
    declined: 23,
    declinedVerb: 'waived',
    erMonthly: 12,
    eeMonthly: 6,
    costNote: 'per employee / mo',
  },
  {
    id: 'k401',
    carrier: 'Vantage Retirement',
    planName: 'Vantage 401(k) · 4% match',
    monogram: 'VR',
    color: 'green',
    kindLabel: 'Retirement',
    elected: 96,
    declined: 16,
    declinedVerb: 'opted out',
    erMonthly: 310,
    eeMonthly: 623,
    costNote: 'avg match / avg deferral',
  },
];

/** Derived: total employer monthly spend across completed elections. */
const ER_MONTHLY_TOTAL = PLANS.reduce(
  (sum, plan) => sum + plan.elected * plan.erMonthly,
  0,
); // $121,646

function fmtUsd(value: number): string {
  return \`$\${value.toLocaleString('en-US')}\`;
}

// ---------------------------------------------------------------------------
// EMPLOYEES — sample rows per status segment. "Not started" lists all 9
// employees (its department mix matches the matrix: Eng 3, Design 1,
// GTM 2, Ops 1, People 2); "Enrolled" and "Started" show representative
// samples with an explicit "Showing N of M" line so the table never
// pretends to be the full 112/19. \`elections\` counts the four benefit
// decisions (medical, dental, vision, 401k) an employee has saved.
// ---------------------------------------------------------------------------

type Office = 'SF HQ' | 'Lisbon' | 'Remote-US';

interface EmployeeRow {
  id: string;
  name: string;
  role: string;
  dept: string;
  office: Office;
  status: StatusId;
  /** 0–4 saved decisions; 4 for every enrolled row. */
  elections: number;
  /** Enrolled rows — ISO submit time. Started rows — last activity. */
  activityAt: string;
  /** Display deadline; QLE/new-hire rows carry extended windows. */
  deadlineLabel: string;
  isExtended?: boolean;
  isNewHire?: boolean;
  /** Fixture reminders already sent before the frozen "as of" moment. */
  nudgedAt?: string;
}

const EMPLOYEES: EmployeeRow[] = [
  // ---- Enrolled (8 of 112 shown) ----
  {id: 'e-priya', name: 'Priya Raman', role: 'VP Engineering', dept: 'Engineering', office: 'SF HQ', status: 'enrolled', elections: 4, activityAt: '2026-07-01T16:24:00Z', deadlineLabel: 'Jul 15'},
  {id: 'e-sofia', name: 'Sofia Ortiz', role: 'Design lead', dept: 'Design', office: 'SF HQ', status: 'enrolled', elections: 4, activityAt: '2026-07-01T18:02:00Z', deadlineLabel: 'Jul 15'},
  {id: 'e-elena', name: 'Elena Voss', role: 'Finance lead', dept: 'Finance', office: 'SF HQ', status: 'enrolled', elections: 4, activityAt: '2026-07-02T09:15:00Z', deadlineLabel: 'Jul 15'},
  {id: 'e-tom', name: 'Tom Okonkwo', role: 'IT admin', dept: 'Ops', office: 'SF HQ', status: 'enrolled', elections: 4, activityAt: '2026-07-01T20:47:00Z', deadlineLabel: 'Jul 15'},
  {id: 'e-dana', name: 'Dana Whitfield', role: 'People Ops', dept: 'People', office: 'SF HQ', status: 'enrolled', elections: 4, activityAt: '2026-07-01T15:05:00Z', deadlineLabel: 'Jul 15'},
  {id: 'e-nadia', name: 'Nadia Osei', role: 'Staff engineer', dept: 'Engineering', office: 'Remote-US', status: 'enrolled', elections: 4, activityAt: '2026-07-02T13:38:00Z', deadlineLabel: 'Jul 15'},
  {id: 'e-leo', name: 'Leo Martins', role: 'Account executive', dept: 'GTM', office: 'Lisbon', status: 'enrolled', elections: 4, activityAt: '2026-07-02T10:56:00Z', deadlineLabel: 'Jul 15'},
  {id: 'e-grace', name: 'Grace Liu', role: 'Product engineer', dept: 'Engineering', office: 'SF HQ', status: 'enrolled', elections: 4, activityAt: '2026-07-03T08:12:00Z', deadlineLabel: 'Jul 15'},
  // ---- Started (10 of 19 shown) ----
  {id: 's-marcus', name: 'Marcus Webb', role: 'Platform lead', dept: 'Engineering', office: 'SF HQ', status: 'started', elections: 3, activityAt: '2026-07-02T19:21:00Z', deadlineLabel: 'Jul 31', isExtended: true},
  {id: 's-jonah', name: 'Jonah Fields', role: 'GTM lead', dept: 'GTM', office: 'SF HQ', status: 'started', elections: 2, activityAt: '2026-07-01T22:10:00Z', deadlineLabel: 'Jul 15'},
  {id: 's-omar', name: 'Omar Haddad', role: 'Ops lead', dept: 'Ops', office: 'SF HQ', status: 'started', elections: 3, activityAt: '2026-07-02T16:44:00Z', deadlineLabel: 'Jul 15'},
  {id: 's-tessa', name: 'Tessa Nguyen', role: 'Product designer', dept: 'Design', office: 'Remote-US', status: 'started', elections: 1, activityAt: '2026-07-01T19:33:00Z', deadlineLabel: 'Jul 15', nudgedAt: '2026-07-02T17:00:00Z'},
  {id: 's-rafael', name: 'Rafael Costa', role: 'Solutions engineer', dept: 'GTM', office: 'Lisbon', status: 'started', elections: 2, activityAt: '2026-07-02T11:08:00Z', deadlineLabel: 'Jul 15'},
  {id: 's-hannah', name: 'Hannah Kim', role: 'Infra engineer', dept: 'Engineering', office: 'SF HQ', status: 'started', elections: 3, activityAt: '2026-07-02T21:52:00Z', deadlineLabel: 'Jul 15'},
  {id: 's-derek', name: 'Derek Boone', role: 'Sales development', dept: 'GTM', office: 'Remote-US', status: 'started', elections: 1, activityAt: '2026-07-01T17:26:00Z', deadlineLabel: 'Jul 15', nudgedAt: '2026-07-02T17:00:00Z'},
  {id: 's-yuki', name: 'Yuki Mori', role: 'ML engineer', dept: 'Engineering', office: 'SF HQ', status: 'started', elections: 2, activityAt: '2026-07-02T14:59:00Z', deadlineLabel: 'Jul 15'},
  {id: 's-claire', name: 'Claire Fontaine', role: 'People partner', dept: 'People', office: 'Lisbon', status: 'started', elections: 3, activityAt: '2026-07-02T08:40:00Z', deadlineLabel: 'Jul 15'},
  {id: 's-sam', name: 'Sam Whitaker', role: 'Revenue analyst', dept: 'Finance', office: 'Remote-US', status: 'started', elections: 2, activityAt: '2026-07-01T23:17:00Z', deadlineLabel: 'Jul 15'},
  // ---- Not started (all 9) ----
  {id: 'n-ava', name: 'Ava Lindqvist', role: 'Product engineer', dept: 'Engineering', office: 'SF HQ', status: 'notStarted', elections: 0, activityAt: '2026-07-01T08:00:00Z', deadlineLabel: 'Aug 5', isNewHire: true},
  {id: 'n-ken', name: 'Ken Tanaka', role: 'Field marketer', dept: 'GTM', office: 'Remote-US', status: 'notStarted', elections: 0, activityAt: '2026-07-01T08:00:00Z', deadlineLabel: 'Aug 12', isNewHire: true},
  {id: 'n-ben', name: 'Ben Alvarez', role: 'Mobile engineer', dept: 'Engineering', office: 'SF HQ', status: 'notStarted', elections: 0, activityAt: '2026-07-01T08:00:00Z', deadlineLabel: 'Jul 15'},
  {id: 'n-noor', name: 'Noor Rahman', role: 'Security engineer', dept: 'Engineering', office: 'Remote-US', status: 'notStarted', elections: 0, activityAt: '2026-07-01T08:00:00Z', deadlineLabel: 'Jul 15', nudgedAt: '2026-07-02T17:00:00Z'},
  {id: 'n-iris', name: 'Iris Cole', role: 'Brand designer', dept: 'Design', office: 'SF HQ', status: 'notStarted', elections: 0, activityAt: '2026-07-01T08:00:00Z', deadlineLabel: 'Jul 15'},
  {id: 'n-marta', name: 'Marta Silva', role: 'Customer success', dept: 'GTM', office: 'Lisbon', status: 'notStarted', elections: 0, activityAt: '2026-07-01T08:00:00Z', deadlineLabel: 'Jul 15'},
  {id: 'n-victor', name: 'Victor Adeyemi', role: 'Workplace ops', dept: 'Ops', office: 'SF HQ', status: 'notStarted', elections: 0, activityAt: '2026-07-01T08:00:00Z', deadlineLabel: 'Jul 15'},
  {id: 'n-ruth', name: 'Ruth Bennett', role: 'Recruiter', dept: 'People', office: 'Remote-US', status: 'notStarted', elections: 0, activityAt: '2026-07-01T08:00:00Z', deadlineLabel: 'Jul 15'},
  {id: 'n-diego', name: 'Diego Paz', role: 'People analyst', dept: 'People', office: 'SF HQ', status: 'notStarted', elections: 0, activityAt: '2026-07-01T08:00:00Z', deadlineLabel: 'Jul 15'},
];

/** Rows shown per segment vs the segment's true population. */
const SHOWN_OF: Record<StatusId, {shown: number; of: number}> = {
  enrolled: {shown: 8, of: STATUS_TOTALS.enrolled},
  started: {shown: 10, of: STATUS_TOTALS.started},
  notStarted: {shown: 9, of: STATUS_TOTALS.notStarted},
};

// ---------------------------------------------------------------------------
// QLE EXCEPTIONS — qualifying life events and new-hire windows that run
// outside (or extend) the Jul 1–15 window. Marcus Webb's marriage QLE and
// Nadia Osei's birth QLE each reference a pending document in the
// verification queue below; Ava Lindqvist and Ken Tanaka are the 2 hires
// mid-onboarding, enrolling via 30-day new-hire windows.
// ---------------------------------------------------------------------------

type QleKind = 'marriage' | 'birth' | 'newHire';

interface QleException {
  id: string;
  kind: QleKind;
  kindLabel: string;
  employee: string;
  dept: string;
  eventLabel: string;
  windowLabel: string;
  /** Pending verification doc id, when the QLE is blocked on paperwork. */
  docId?: string;
}

const QLE_KIND_ICON: Record<QleKind, typeof SparklesIcon> = {
  marriage: SparklesIcon,
  birth: SmileIcon,
  newHire: UserPlusIcon,
};

const QLE_EXCEPTIONS: QleException[] = [
  {id: 'QLE-1042', kind: 'marriage', kindLabel: 'Marriage', employee: 'Marcus Webb', dept: 'Engineering', eventLabel: 'Married Jul 1 · reported Jul 2', windowLabel: 'Window extended to Jul 31', docId: 'dv-1'},
  {id: 'QLE-1043', kind: 'birth', kindLabel: 'Birth of child', employee: 'Nadia Osei', dept: 'Engineering', eventLabel: 'Born Jul 1 · reported Jul 1', windowLabel: 'Add-dependent window to Jul 31', docId: 'dv-2'},
  {id: 'QLE-1044', kind: 'newHire', kindLabel: 'New hire', employee: 'Ava Lindqvist', dept: 'Engineering', eventLabel: 'Starts Jul 6 · mid-onboarding', windowLabel: 'New-hire window Jul 6 – Aug 5'},
  {id: 'QLE-1045', kind: 'newHire', kindLabel: 'New hire', employee: 'Ken Tanaka', dept: 'GTM', eventLabel: 'Starts Jul 13 · mid-onboarding', windowLabel: 'New-hire window Jul 13 – Aug 12'},
];

// ---------------------------------------------------------------------------
// DEPENDENT VERIFICATION — 3 pending documents. dv-1/dv-2 are the
// paperwork behind QLE-1042/1043; dv-3 is a domestic-partner affidavit
// from a completed open-enrollment election (Leo Martins, enrolled).
// ---------------------------------------------------------------------------

type DocState = 'pending' | 'approved' | 'requested';

interface DependentDoc {
  id: string;
  employee: string;
  dependent: string;
  relationship: string;
  docLabel: string;
  submittedAt: string;
  addsTo: string;
  qleId?: string;
}

const DEPENDENT_DOCS: DependentDoc[] = [
  {id: 'dv-1', employee: 'Marcus Webb', dependent: 'Claire Webb', relationship: 'Spouse', docLabel: 'Marriage certificate', submittedAt: '2026-07-02T14:12:00Z', addsTo: 'Meridian PPO 500 + Brightside Dental', qleId: 'QLE-1042'},
  {id: 'dv-2', employee: 'Nadia Osei', dependent: 'Kofi Osei', relationship: 'Child', docLabel: 'Birth certificate', submittedAt: '2026-07-01T18:40:00Z', addsTo: 'Meridian PPO 500 + Lumen Vision Plus', qleId: 'QLE-1043'},
  {id: 'dv-3', employee: 'Leo Martins', dependent: 'Tomás Aguiar', relationship: 'Domestic partner', docLabel: 'Partnership affidavit', submittedAt: '2026-07-02T09:05:00Z', addsTo: 'Cascade HMO Select'},
];

/** Already-cleared docs — the static tail of the verification panel. */
const VERIFIED_DOCS = [
  {id: 'dv-0a', employee: 'Grace Liu', dependent: 'Wei Liu (spouse)', docLabel: 'Marriage certificate', verifiedLabel: 'Verified Jul 2 by Dana Whitfield'},
  {id: 'dv-0b', employee: 'Omar Haddad', dependent: 'Lina Haddad (child)', docLabel: 'Birth certificate', verifiedLabel: 'Verified Jul 1 by Dana Whitfield'},
] as const;

// ---------------------------------------------------------------------------
// ENROLLMENT-WINDOW BANNER — window copy, static countdown, tri-segment
// completion meter (enrolled + started + not-started = 140) with legend.
// ---------------------------------------------------------------------------

function LegendItem({
  color,
  label,
  count,
}: {
  color: string;
  label: string;
  count: number;
}) {
  return (
    <HStack gap={1} vAlign="center">
      <span style={{...styles.legendSwatch, backgroundColor: color}} />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {label} {count}
      </Text>
    </HStack>
  );
}

function CompletionMeter() {
  const segments: {id: StatusId; color: string}[] = [
    {id: 'enrolled', color: STATUS_COLOR.enrolled},
    {id: 'started', color: STATUS_COLOR.started},
    {id: 'notStarted', color: STATUS_COLOR.notStarted},
  ];
  return (
    <VStack gap={2} style={styles.bannerMeter}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label">Enrollment completion</Text>
        </StackItem>
        <Text type="label" hasTabularNumbers>
          {STATUS_TOTALS.enrolled} of {TOTAL_ELIGIBLE} enrolled · {PCT_ENROLLED}%
        </Text>
      </HStack>
      <div
        style={styles.meterTrack}
        role="img"
        aria-label={\`Enrollment completion: \${STATUS_TOTALS.enrolled} enrolled, \${STATUS_TOTALS.started} started, \${STATUS_TOTALS.notStarted} not started of \${TOTAL_ELIGIBLE} eligible\`}>
        {segments.map(segment => (
          <span
            key={segment.id}
            style={{
              ...styles.meterSegment,
              backgroundColor: segment.color,
              width: \`\${(STATUS_TOTALS[segment.id] / TOTAL_ELIGIBLE) * 100}%\`,
            }}
          />
        ))}
      </div>
      <HStack gap={3} vAlign="center" wrap="wrap" style={styles.legendRow}>
        <LegendItem color={STATUS_COLOR.enrolled} label="Enrolled" count={STATUS_TOTALS.enrolled} />
        <LegendItem color={STATUS_COLOR.started} label="Started" count={STATUS_TOTALS.started} />
        <LegendItem color={STATUS_COLOR.notStarted} label="Not started" count={STATUS_TOTALS.notStarted} />
      </HStack>
    </VStack>
  );
}

function WindowBanner({isStacked}: {isStacked: boolean}) {
  return (
    <div style={isStacked ? {...styles.banner, ...styles.bannerStacked} : styles.banner}>
      <HStack gap={3} vAlign="center" style={styles.bannerWindow}>
        <Icon icon={CalendarClockIcon} size="md" color="secondary" />
        <VStack gap={0} style={{minWidth: 0}}>
          <Text type="label">Open enrollment is live</Text>
          <Text type="supporting" color="secondary">
            {WINDOW.opensLabel} – {WINDOW.closesLabel} · coverage effective{' '}
            {WINDOW.effectiveLabel}
          </Text>
          <Text type="supporting" color="secondary">
            As of {WINDOW.asOfLabel}
          </Text>
        </VStack>
      </HStack>
      <div
        style={
          isStacked
            ? {...styles.bannerCountdown, ...styles.bannerCountdownStacked}
            : styles.bannerCountdown
        }>
        <span style={styles.countdownValue}>{WINDOW.daysLeft} days left</span>
        <Text type="supporting" color="secondary">
          Closes {WINDOW.closesLabel}, {WINDOW.closesTimeLabel}
        </Text>
      </div>
      <CompletionMeter />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PLAN CARDS — carrier monogram tile, election count vs the 112 completed
// enrollments, and the employer/employee monthly cost split bar.
// ---------------------------------------------------------------------------

function CostSplit({plan}: {plan: Plan}) {
  const total = plan.erMonthly + plan.eeMonthly;
  const erPct = (plan.erMonthly / total) * 100;
  return (
    <VStack gap={1}>
      <div
        style={styles.splitTrack}
        role="img"
        aria-label={\`\${plan.planName}: employer \${fmtUsd(plan.erMonthly)}, employee \${fmtUsd(plan.eeMonthly)} monthly\`}>
        <span
          style={{
            ...styles.splitSegment,
            width: \`\${erPct}%\`,
            backgroundColor: VIZ[plan.color],
          }}
        />
        <span
          style={{
            ...styles.splitSegment,
            width: \`\${100 - erPct}%\`,
            backgroundColor: 'var(--color-border)',
          }}
        />
      </div>
      {/* Stacked lines — a side-by-side row overlaps in narrow cards
          because the nowrap figure cannot shrink. */}
      <VStack gap={0}>
        <Text type="supporting" style={styles.splitFigure}>
          ER {fmtUsd(plan.erMonthly)} · EE {fmtUsd(plan.eeMonthly)}
        </Text>
        <Text type="supporting" color="secondary" maxLines={1}>
          {plan.costNote}
        </Text>
      </VStack>
    </VStack>
  );
}

function PlanCard({plan}: {plan: Plan}) {
  const pct = Math.round((plan.elected / STATUS_TOTALS.enrolled) * 100);
  return (
    <div style={styles.planCard}>
      <HStack gap={2} vAlign="center">
        <span
          style={{
            ...styles.monogram,
            color: VIZ[plan.color],
            backgroundColor: MONOGRAM_BG[plan.color],
          }}
          aria-hidden>
          {plan.monogram}
        </span>
        <VStack gap={0} style={{minWidth: 0}}>
          <Text type="label" maxLines={1}>
            {plan.carrier}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {plan.kindLabel}
          </Text>
        </VStack>
      </HStack>
      <Text type="supporting" color="secondary" maxLines={1}>
        {plan.planName}
      </Text>
      <HStack gap={2} vAlign="end">
        <span style={styles.planCount}>{plan.elected}</span>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          of {STATUS_TOTALS.enrolled} elected · {pct}%
        </Text>
      </HStack>
      <CostSplit plan={plan} />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {plan.declined > 0
          ? \`\${plan.declined} \${plan.declinedVerb} · ER \${fmtUsd(plan.elected * plan.erMonthly)}/mo\`
          : \`ER \${fmtUsd(plan.elected * plan.erMonthly)}/mo\`}
      </Text>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EMPLOYEE STATUS TABLE — segmented by enrollment status; started and
// not-started rows carry per-row Nudge actions plus a bulk "Nudge all".
// ---------------------------------------------------------------------------

function ElectionDots({count, name}: {count: number; name: string}) {
  return (
    <HStack gap={2} vAlign="center">
      <span
        style={styles.electionDots}
        role="img"
        aria-label={\`\${name}: \${count} of 4 elections saved\`}>
        {[0, 1, 2, 3].map(index => (
          <span
            key={index}
            style={{
              ...styles.electionDot,
              backgroundColor:
                index < count ? STATUS_COLOR.enrolled : 'var(--color-border)',
            }}
          />
        ))}
      </span>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {count} of 4
      </Text>
    </HStack>
  );
}

function StatusToken({row}: {row: EmployeeRow}) {
  if (row.isNewHire) {
    return <Token size="sm" color="blue" label="New-hire window" />;
  }
  if (row.isExtended) {
    return <Token size="sm" color="purple" label="QLE extended" />;
  }
  if (row.status === 'enrolled') {
    return <Token size="sm" color="green" label="Enrolled" />;
  }
  if (row.status === 'started') {
    return <Token size="sm" color="orange" label="In progress" />;
  }
  return <Token size="sm" color="gray" label="Not started" />;
}

function EmployeeTable({
  segment,
  rows,
  nudgedIds,
  onNudge,
}: {
  segment: StatusId;
  rows: EmployeeRow[];
  nudgedIds: Set<string>;
  onNudge: (row: EmployeeRow) => void;
}) {
  return (
    <div style={styles.tableScrollX}>
      {/* Column floors sum to ~678px so the action column stays visible
          without horizontal scrolling in a ~700px content column. */}
      <Table
        density="balanced"
        dividers="rows"
        hasHover
        tableProps={{
          'aria-label': \`Employees — \${STATUS_LABEL[segment]}\`,
        }}>
        <TableHeader>
          <TableRow isHeaderRow>
            <TableHeaderCell scope="col" style={{minWidth: 200}}>
              Employee
            </TableHeaderCell>
            <TableHeaderCell scope="col" style={{width: 112, minWidth: 112}}>
              Elections
            </TableHeaderCell>
            <TableHeaderCell scope="col" style={{width: 148, minWidth: 148}}>
              Status
            </TableHeaderCell>
            <TableHeaderCell scope="col" style={{width: 108, minWidth: 108}}>
              {segment === 'enrolled' ? 'Submitted' : 'Last activity'}
            </TableHeaderCell>
            <TableHeaderCell
              scope="col"
              style={{width: 110, minWidth: 110, textAlign: 'end'}}>
              {segment === 'enrolled' ? 'Details' : 'Reminder'}
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(row => {
            const isNudged = nudgedIds.has(row.id) || row.nudgedAt !== undefined;
            return (
              <TableRow key={row.id}>
                <TableCell scope="row">
                  <HStack gap={2} vAlign="center">
                    <Avatar name={row.name} size="small" />
                    <VStack gap={0} style={{minWidth: 0}}>
                      <Text type="label" maxLines={1}>
                        {row.name}
                      </Text>
                      <Text type="supporting" color="secondary" maxLines={1}>
                        {row.role} · {row.dept}
                      </Text>
                    </VStack>
                  </HStack>
                </TableCell>
                <TableCell>
                  <ElectionDots count={row.elections} name={row.name} />
                </TableCell>
                <TableCell>
                  <VStack gap={0}>
                    <StatusToken row={row} />
                    <Text
                      type="supporting"
                      color="secondary"
                      style={styles.deadlineText}>
                      Due {row.deadlineLabel}
                    </Text>
                  </VStack>
                </TableCell>
                <TableCell>
                  <Timestamp
                    value={row.activityAt}
                    format="date"
                    color="secondary"
                  />
                </TableCell>
                <TableCell style={styles.numericCell}>
                  {segment === 'enrolled' ? (
                    <Button
                      label="View"
                      variant="ghost"
                      size="sm"
                      icon={<Icon icon={EyeIcon} size="sm" />}
                    />
                  ) : isNudged ? (
                    <HStack gap={1} vAlign="center" hAlign="end">
                      <Icon icon={CheckIcon} size="sm" color="secondary" />
                      <Text type="supporting" color="secondary">
                        Nudged
                      </Text>
                    </HStack>
                  ) : (
                    <Button
                      label="Nudge"
                      variant="secondary"
                      size="sm"
                      icon={<Icon icon={BellRingIcon} size="sm" />}
                      onClick={() => onNudge(row)}
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QLE EXCEPTIONS ROW — event tiles with extended windows; doc-blocked
// events reference the verification queue and resolve when the linked
// document is approved.
// ---------------------------------------------------------------------------

function QleTile({
  qle,
  docState,
}: {
  qle: QleException;
  docState: DocState | undefined;
}) {
  return (
    <div style={styles.qleTile}>
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary" style={styles.qleCode}>
          {qle.id}
        </Text>
        <StackItem size="fill" />
        <Badge
          variant={qle.kind === 'newHire' ? 'info' : 'neutral'}
          label={qle.kindLabel}
          icon={<Icon icon={QLE_KIND_ICON[qle.kind]} size="xsm" color="inherit" />}
        />
      </HStack>
      <HStack gap={2} vAlign="center">
        <Avatar name={qle.employee} size="small" />
        <VStack gap={0} style={{minWidth: 0}}>
          <Text type="label" maxLines={1}>
            {qle.employee}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {qle.dept}
          </Text>
        </VStack>
      </HStack>
      <VStack gap={0}>
        <Text type="supporting" color="secondary" maxLines={1}>
          {qle.eventLabel}
        </Text>
        <Text type="supporting" color="secondary" maxLines={1}>
          {qle.windowLabel}
        </Text>
      </VStack>
      <span style={styles.tokenInline}>
        {qle.docId === undefined ? (
          <Token size="sm" color="blue" label="Window open" />
        ) : docState === 'approved' ? (
          <Token size="sm" color="green" label="Dependent verified" />
        ) : docState === 'requested' ? (
          <Token size="sm" color="orange" label="New doc requested" />
        ) : (
          <Token size="sm" color="orange" label="Doc in verification" />
        )}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DEPENDENT-VERIFICATION QUEUE — pending documents with approve /
// request-new actions; approved docs drop into the verified tail.
// ---------------------------------------------------------------------------

function DocCard({
  doc,
  state,
  onApprove,
  onRequestNew,
}: {
  doc: DependentDoc;
  state: DocState;
  onApprove: (doc: DependentDoc) => void;
  onRequestNew: (doc: DependentDoc) => void;
}) {
  return (
    <div style={styles.docCard}>
      <HStack gap={2} vAlign="center">
        <Icon icon={FileClockIcon} size="sm" color="secondary" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="label" maxLines={1}>
            {doc.docLabel}
          </Text>
        </StackItem>
        {doc.qleId !== undefined && (
          <Text type="supporting" color="secondary" style={styles.qleCode}>
            {doc.qleId}
          </Text>
        )}
      </HStack>
      <VStack gap={0}>
        <Text type="supporting" maxLines={1}>
          {doc.employee} → {doc.dependent} ({doc.relationship})
        </Text>
        <Text type="supporting" color="secondary" maxLines={2}>
          Adds to {doc.addsTo}
        </Text>
        <Text type="supporting" color="secondary">
          Submitted <Timestamp value={doc.submittedAt} format="date_time" />
        </Text>
      </VStack>
      {state === 'requested' ? (
        <span style={styles.tokenInline}>
          <Token size="sm" color="orange" label="New document requested" />
        </span>
      ) : (
        <HStack gap={2} vAlign="center">
          <Button
            label="Approve"
            variant="primary"
            size="sm"
            icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
            onClick={() => onApprove(doc)}
          />
          <Button
            label="Request new"
            variant="ghost"
            size="sm"
            icon={<Icon icon={RefreshCcwIcon} size="sm" />}
            onClick={() => onRequestNew(doc)}
          />
        </HStack>
      )}
    </div>
  );
}

function VerificationQueue({
  docStates,
  onApprove,
  onRequestNew,
}: {
  docStates: Record<string, DocState>;
  onApprove: (doc: DependentDoc) => void;
  onRequestNew: (doc: DependentDoc) => void;
}) {
  const openDocs = DEPENDENT_DOCS.filter(
    doc => docStates[doc.id] !== 'approved',
  );
  const approvedDocs = DEPENDENT_DOCS.filter(
    doc => docStates[doc.id] === 'approved',
  );
  return (
    <VStack gap={3}>
      {openDocs.length === 0 ? (
        <EmptyState
          isCompact
          icon={<Icon icon={FileCheck2Icon} size="lg" />}
          title="Queue clear"
          description="Every submitted dependent document has been reviewed."
        />
      ) : (
        openDocs.map(doc => (
          <DocCard
            key={doc.id}
            doc={doc}
            state={docStates[doc.id] ?? 'pending'}
            onApprove={onApprove}
            onRequestNew={onRequestNew}
          />
        ))
      )}
      <Divider />
      <Text type="label" size="sm" color="secondary">
        Recently verified
      </Text>
      <VStack gap={2}>
        {approvedDocs.map(doc => (
          <div key={doc.id} style={styles.verifiedRow}>
            <Icon icon={FileCheck2Icon} size="sm" color="secondary" />
            <VStack gap={0} style={{minWidth: 0}}>
              <Text type="supporting" maxLines={1}>
                {doc.employee} — {doc.dependent} ({doc.relationship})
              </Text>
              <Text type="supporting" color="secondary" maxLines={2}>
                {doc.docLabel} · Verified Jul 3 by Dana Whitfield
              </Text>
            </VStack>
          </div>
        ))}
        {VERIFIED_DOCS.map(doc => (
          <div key={doc.id} style={styles.verifiedRow}>
            <Icon icon={FileCheck2Icon} size="sm" color="secondary" />
            <VStack gap={0} style={{minWidth: 0}}>
              <Text type="supporting" maxLines={1}>
                {doc.employee} — {doc.dependent}
              </Text>
              <Text type="supporting" color="secondary" maxLines={2}>
                {doc.docLabel} · {doc.verifiedLabel}
              </Text>
            </VStack>
          </div>
        ))}
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function HrBenefitsEnrollmentTemplate() {
  const [segment, setSegment] = useState<StatusId>('started');
  const [nudgedIds, setNudgedIds] = useState<Set<string>>(new Set());
  const [docStates, setDocStates] = useState<Record<string, DocState>>({});
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px inlines the verification panel;
  // <=860px stacks the banner and drops the Office column. The plan/QLE
  // grids rewrap on their own auto-fill floors (container-driven).
  const isPanelInline = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const rows = useMemo(
    () => EMPLOYEES.filter(row => row.status === segment),
    [segment],
  );

  const unNudgedRows = rows.filter(
    row =>
      row.status !== 'enrolled' &&
      !nudgedIds.has(row.id) &&
      row.nudgedAt === undefined,
  );

  const nudgeOne = (row: EmployeeRow) => {
    setNudgedIds(prev => new Set(prev).add(row.id));
    setAnnouncement(\`Enrollment reminder sent to \${row.name}\`);
  };

  const nudgeAll = () => {
    const count = unNudgedRows.length;
    setNudgedIds(prev => {
      const next = new Set(prev);
      for (const row of unNudgedRows) {
        next.add(row.id);
      }
      return next;
    });
    setAnnouncement(
      \`Enrollment reminders sent to \${count} \${count === 1 ? 'employee' : 'employees'}\`,
    );
  };

  const approveDoc = (doc: DependentDoc) => {
    setDocStates(prev => ({...prev, [doc.id]: 'approved'}));
    setAnnouncement(
      \`Approved \${doc.docLabel} for \${doc.dependent} (\${doc.employee})\`,
    );
  };

  const requestNewDoc = (doc: DependentDoc) => {
    setDocStates(prev => ({...prev, [doc.id]: 'requested'}));
    setAnnouncement(
      \`Requested a new \${doc.docLabel.toLowerCase()} from \${doc.employee}\`,
    );
  };

  const openDocCount = DEPENDENT_DOCS.filter(
    doc => docStates[doc.id] !== 'approved',
  ).length;

  const shown = SHOWN_OF[segment];

  // ----- header: title, plan-year note, export -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={HeartPulseIcon} size="md" color="secondary" />
          <Heading level={1}>Benefits Enrollment</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · 2026–27 plan year
          </Text>
        </HStack>
        <StackItem size="fill" />
        <Token size="sm" color="green" label="Window open" />
        <Button
          label="Export elections"
          variant="secondary"
          size="sm"
          icon={<Icon icon={DownloadIcon} size="sm" />}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- verification queue (end panel >1180px, inline section below) -----
  const verificationHeader = (
    <HStack gap={2} vAlign="center" style={isPanelInline ? undefined : styles.panelHeader}>
      <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
      <StackItem size="fill">
        <Heading level={2}>
          Dependent verification
        </Heading>
      </StackItem>
      {/* flexShrink 0 — the wrapping heading otherwise squeezes the
          token into "3 pendi…" truncation. */}
      <span style={{flexShrink: 0}}>
        <Token
          size="sm"
          color={openDocCount > 0 ? 'orange' : 'green'}
          label={\`\${openDocCount} pending\`}
        />
      </span>
    </HStack>
  );

  const verificationQueue = (
    <VerificationQueue
      docStates={docStates}
      onApprove={approveDoc}
      onRequestNew={requestNewDoc}
    />
  );

  // ----- main content column -----
  const content = (
    <LayoutContent padding={0}>
      <div style={styles.contentScroll}>
        <div aria-live="polite" style={styles.visuallyHidden}>
          {announcement}
        </div>
        <VStack gap={5}>
          <WindowBanner isStacked={isCompact} />

          {/* Plan lineup ------------------------------------------------- */}
          <VStack gap={3} style={styles.sectionBlock}>
            <Heading level={2}>
              Plan lineup · 2026–27
            </Heading>
            <div style={styles.planGrid}>
              {PLANS.map(plan => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
            {/* Derived from the plan fixtures — never hand-typed. */}
            <div style={styles.noteRow}>
              <Icon icon={PiggyBankIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Projected employer cost across the {STATUS_TOTALS.enrolled}{' '}
                completed enrollments: {fmtUsd(ER_MONTHLY_TOTAL)}/mo. Medical
                reconciles as 64 PPO + 41 HMO + 7 waived = 112.
              </Text>
            </div>
          </VStack>

          {/* Employee status segments ------------------------------------ */}
          <VStack gap={3} style={styles.sectionBlock}>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <HStack gap={2} vAlign="center">
                <Icon icon={ClipboardCheckIcon} size="sm" color="secondary" />
                <Heading level={2}>
                  Employees by status
                </Heading>
              </HStack>
              <StackItem size="fill" />
              {segment !== 'enrolled' && unNudgedRows.length > 0 ? (
                <Button
                  label={\`Nudge all (\${unNudgedRows.length})\`}
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={BellRingIcon} size="sm" />}
                  onClick={nudgeAll}
                />
              ) : null}
            </HStack>
            <SegmentedControl
              label="Enrollment status segment"
              value={segment}
              onChange={value => setSegment(value as StatusId)}
              size="sm">
              <SegmentedControlItem
                label={\`Enrolled · \${STATUS_TOTALS.enrolled}\`}
                value="enrolled"
              />
              <SegmentedControlItem
                label={\`Started · \${STATUS_TOTALS.started}\`}
                value="started"
              />
              <SegmentedControlItem
                label={\`Not started · \${STATUS_TOTALS.notStarted}\`}
                value="notStarted"
              />
            </SegmentedControl>
            <EmployeeTable
              segment={segment}
              rows={rows}
              nudgedIds={nudgedIds}
              onNudge={nudgeOne}
            />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {shown.shown === shown.of
                ? \`Showing all \${shown.of} \${STATUS_LABEL[segment].toLowerCase()} employees.\`
                : \`Showing \${shown.shown} of \${shown.of} \${STATUS_LABEL[segment].toLowerCase()} employees.\`}{' '}
              Segment counts: {STATUS_TOTALS.enrolled} enrolled +{' '}
              {STATUS_TOTALS.started} started + {STATUS_TOTALS.notStarted} not
              started = {TOTAL_ELIGIBLE} eligible.
            </Text>
          </VStack>

          {/* Inline verification queue when the end panel is dropped ------ */}
          {isPanelInline ? (
            <VStack gap={3} style={styles.sectionBlock}>
              {verificationHeader}
              {verificationQueue}
            </VStack>
          ) : null}

          {/* QLE exceptions row ------------------------------------------ */}
          <VStack gap={3} style={styles.sectionBlock}>
            <HStack gap={2} vAlign="center">
              <Icon icon={HourglassIcon} size="sm" color="secondary" />
              <Heading level={2}>
                QLE exceptions & special windows
              </Heading>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {QLE_EXCEPTIONS.length} active
              </Text>
            </HStack>
            <div style={styles.qleGrid}>
              {QLE_EXCEPTIONS.map(qle => (
                <QleTile
                  key={qle.id}
                  qle={qle}
                  docState={
                    qle.docId === undefined ? undefined : docStates[qle.docId]
                  }
                />
              ))}
            </div>
          </VStack>
        </VStack>
      </div>
    </LayoutContent>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={content}
        end={
          isPanelInline ? undefined : (
            <LayoutPanel
              width={320}
              padding={0}
              hasDivider
              label="Dependent verification queue">
              <div style={styles.panelFill}>
                {verificationHeader}
                <Divider />
                <div style={styles.panelScroll}>
                  <VStack gap={3} style={{paddingTop: 'var(--spacing-3)'}}>
                    {verificationQueue}
                  </VStack>
                </div>
              </div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};