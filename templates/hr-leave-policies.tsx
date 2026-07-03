// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs (140-person) leave
 *   policy catalog: four policies (Vacation, Sick, Parental, Sabbatical)
 *   with accrual schedules by tenure, carryover / negative-balance rules,
 *   department and office assignments, two holiday calendars (US, Portugal)
 *   with fixed 2026 dates, and one seeded pending change (Vacation
 *   carryover cap 10 → 5 days) whose 2 affected employees are fixture
 *   rows. No clocks, no randomness, no network media.
 * @output Leave Policy Administration — the admin/policy side of PTO for
 *   the Kestrel Labs workforce platform. A policy rail (four policy cards
 *   with accrual-rate / cap / carryover summaries, department + office
 *   assignment chips, covered counts); a policy-detail pane for the
 *   selected policy (Vacation default) with a pending-change Banner
 *   naming the 2 affected employees, an accrual-schedule Table by tenure
 *   band, carryover and negative-balance rule toggles gated behind an
 *   explicit edit mode, and assignment breakdowns that reconcile to 140;
 *   and a holiday-calendar panel (US / Portugal SegmentedControl, office
 *   coverage counts, upcoming 2026 holidays with observed-date notes).
 * @position Page template; emitted by `astryx template hr-leave-policies`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | rail 300 (policy cards, scrolls) | content (detail pane,
 *   scrolls) | end panel 320 (holiday calendars, scrolls).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. Policy cards in the rail, stat tiles, rule rows, and holiday
 *   rows are styled divs; the pending-change surface is a Banner.
 * Color policy: token-pure everywhere; the only literals are the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens used
 *   for policy glyphs and holiday date blocks (the demo does not inject
 *   `--color-data-categorical-*`).
 *
 * Responsive contract:
 * - > 1180px: full three-region frame.
 * - <= 1180px: the holiday panel is dropped from the end slot and the
 *   same content re-renders as a section at the bottom of the detail
 *   pane, so both calendars stay reachable.
 * - <= 900px: the policy rail is dropped; a policy Selector appears in
 *   the content toolbar. Header and toolbar rows wrap instead of
 *   clipping; the accrual table scrolls horizontally past its column
 *   floor.
 * - Rail, detail pane, and holiday panel scroll independently
 *   (`minHeight: 0` down every flex chain).
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  BabyIcon,
  Building2Icon,
  CalendarDaysIcon,
  CheckIcon,
  ClockIcon,
  CompassIcon,
  FlagIcon,
  GlobeIcon,
  HistoryIcon,
  InfoIcon,
  LandmarkIcon,
  MapPinIcon,
  PencilIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  ThermometerIcon,
  TreePalmIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-3)'},
  // Policy cards in the rail are styled buttons, not Cards (app-shell
  // container policy). Selection uses an inset outline so it never bleeds.
  policyCard: {
    display: 'block',
    width: '100%',
    textAlign: 'start',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  policyCardActive: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  policyGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-container)',
    flexShrink: 0,
  },
  assignChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 7px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Detail pane -----------------------------------------------------------
  detailScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4) var(--spacing-5) var(--spacing-6)',
  },
  detailColumn: {maxWidth: 880, width: '100%', marginInline: 'auto'},
  contentToolbar: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-5)'},
  statTile: {
    flex: 1,
    minWidth: 150,
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  ruleRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  ruleRowChanged: {
    borderColor: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
    boxShadow:
      'inset 0 0 0 1px var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },
  affectedRow: {minWidth: 0},
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Accrual table scrolls horizontally past its column floor on narrow
  // panes instead of crushing cells.
  tableScrollX: {overflowX: 'auto'},
  // Holiday panel ----------------------------------------------------------
  holidayScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  holidayDateBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 'var(--radius-container)',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
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
// carries the repo-standard `light-dark()` fallback pair.
const POLICY_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

// Tinted glyph backgrounds — 12% alpha over the categorical hue keeps AA
// contrast for the icon in both schemes.
const POLICY_TINT = {
  green: 'light-dark(rgba(11,153,31,0.12), rgba(52,199,89,0.16))',
  orange: 'light-dark(rgba(235,110,0,0.12), rgba(255,147,48,0.16))',
  purple: 'light-dark(rgba(107,30,253,0.10), rgba(157,107,255,0.16))',
  teal: 'light-dark(rgba(14,126,139,0.12), rgba(51,184,199,0.16))',
} as const;

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs, a 140-person platform
// company. Signed-in admin: Dana Whitfield (People Ops). Fixed ISO
// timestamps, July 2026. Every count reconciles: department headcounts sum
// to 140, office headcounts sum to 140, tenure-band employee counts sum to
// 140, and the US (107) + Portugal (33) holiday-calendar coverage sums to
// 140. The 2 in-flight hires (Ava Lindqvist, Ken Tanaka) appear only as
// "starting soon" rows, never as active employees.
// ---------------------------------------------------------------------------

const CURRENT_USER = 'Dana Whitfield';

type DeptId = 'eng' | 'design' | 'gtm' | 'ops' | 'finance' | 'people';
type OfficeId = 'sf' | 'lisbon' | 'remote';

/** Canonical Kestrel Labs headcounts — sum to 140 everywhere they appear. */
const DEPARTMENTS: Record<DeptId, {label: string; headcount: number}> = {
  eng: {label: 'Engineering', headcount: 52},
  design: {label: 'Design', headcount: 18},
  gtm: {label: 'GTM', headcount: 34},
  ops: {label: 'Ops', headcount: 16},
  finance: {label: 'Finance', headcount: 8},
  people: {label: 'People', headcount: 12},
};

const ALL_DEPTS: DeptId[] = ['eng', 'design', 'gtm', 'ops', 'finance', 'people'];

/** Office headcounts — 58 + 33 + 49 = 140. */
const OFFICES: Record<OfficeId, {label: string; headcount: number}> = {
  sf: {label: 'SF HQ', headcount: 58},
  lisbon: {label: 'Lisbon', headcount: 33},
  remote: {label: 'Remote-US', headcount: 49},
};

const ALL_OFFICES: OfficeId[] = ['sf', 'lisbon', 'remote'];

const TOTAL_HEADCOUNT = 140;

type PolicyId = 'vacation' | 'sick' | 'parental' | 'sabbatical';

/** Tenure band row for accrual-schedule tables. Employee counts sum to the
 * policy's assigned headcount (140 for Vacation: 61+48+24+7). */
interface TenureBand extends Record<string, unknown> {
  id: string;
  band: string;
  monthlyDays: number;
  annualDays: number;
  capDays: number;
  employees: number;
}

/** The two rule keys that are editable in this surface. `carryoverCap` is
 * a value change; the other two are enable/disable toggles. */
type RuleKey = 'carryoverEnabled' | 'carryoverCap' | 'negativeEnabled';

interface PolicyRules {
  carryoverEnabled: boolean;
  carryoverCapDays: number;
  carryoverExpiry: string;
  negativeEnabled: boolean;
  negativeFloorDays: number;
  accrualTiming: string;
  waitingPeriod: string;
  exitPayout: string;
}

/** Draft edits held against a policy until published or discarded. */
interface RuleDraft {
  carryoverEnabled?: boolean;
  carryoverCapDays?: number;
  negativeEnabled?: boolean;
}

interface GrantTerm {
  label: string;
  value: string;
}

interface LeavePolicy {
  id: PolicyId;
  name: string;
  kind: 'accrual' | 'grant';
  icon: typeof TreePalmIcon;
  colorKey: keyof typeof POLICY_TINT;
  version: number;
  updatedAt: string;
  updatedBy: string;
  description: string;
  /** Rail summary line, e.g. "1.25–2.00 d/mo · cap 22.5–36 d". */
  accrualSummary: string;
  carryoverSummary: string;
  departments: DeptId[];
  offices: OfficeId[];
  /** Active employees covered (excludes pending starts). */
  covered: number;
  /** In-flight hires who join coverage on their start date. */
  pendingStart: number;
  schedule: TenureBand[];
  grantTerms: GrantTerm[];
  rules: PolicyRules | null;
  /** One extra locale/compliance note surfaced under the rules. */
  complianceNote: string;
}

const INITIAL_POLICIES: Record<PolicyId, LeavePolicy> = {
  vacation: {
    id: 'vacation',
    name: 'Vacation',
    kind: 'accrual',
    icon: TreePalmIcon,
    colorKey: 'green',
    version: 4,
    updatedAt: '2026-06-12T16:40:00Z',
    updatedBy: 'Dana Whitfield',
    description:
      'Company-wide paid vacation. Days accrue monthly on the 1st at a tenure-banded rate and are requested through the time-off planner.',
    accrualSummary: '1.25–2.00 d/mo · cap 22.5–36 d',
    carryoverSummary: 'Carryover 10 d · neg. to −3 d',
    departments: ALL_DEPTS,
    offices: ALL_OFFICES,
    covered: 138,
    pendingStart: 2,
    // Band employee counts sum to 140 (61 + 48 + 24 + 7).
    schedule: [
      {id: 'b0', band: '< 2 years', monthlyDays: 1.25, annualDays: 15, capDays: 22.5, employees: 61},
      {id: 'b2', band: '2–5 years', monthlyDays: 1.5, annualDays: 18, capDays: 27, employees: 48},
      {id: 'b5', band: '5–8 years', monthlyDays: 1.75, annualDays: 21, capDays: 31.5, employees: 24},
      {id: 'b8', band: '8+ years', monthlyDays: 2, annualDays: 24, capDays: 36, employees: 7},
    ],
    grantTerms: [],
    rules: {
      carryoverEnabled: true,
      carryoverCapDays: 10,
      carryoverExpiry: 'Expires March 31',
      negativeEnabled: true,
      negativeFloorDays: 3,
      accrualTiming: 'Monthly, on the 1st',
      waitingPeriod: 'None — accrual starts on hire date',
      exitPayout: 'Unused balance paid out (required for SF HQ)',
    },
    complianceNote:
      'California requires vacation payout on exit; the SF HQ assignment locks the exit-payout rule for the 58 employees there.',
  },
  sick: {
    id: 'sick',
    name: 'Sick',
    kind: 'accrual',
    icon: ThermometerIcon,
    colorKey: 'orange',
    version: 3,
    updatedAt: '2026-05-04T10:15:00Z',
    updatedBy: 'Dana Whitfield',
    description:
      'Paid sick leave for illness and medical appointments. Flat monthly accrual with no tenure bands; unused days do not carry over.',
    accrualSummary: '0.83 d/mo · cap 15 d',
    carryoverSummary: 'No carryover · neg. to −2 d',
    departments: ALL_DEPTS,
    offices: ALL_OFFICES,
    covered: 138,
    pendingStart: 2,
    schedule: [
      {id: 'b0', band: 'All tenure', monthlyDays: 0.83, annualDays: 10, capDays: 15, employees: 140},
    ],
    grantTerms: [],
    rules: {
      carryoverEnabled: false,
      carryoverCapDays: 0,
      carryoverExpiry: 'Balance resets January 1',
      negativeEnabled: true,
      negativeFloorDays: 2,
      accrualTiming: 'Monthly, on the 1st',
      waitingPeriod: 'None — accrual starts on hire date',
      exitPayout: 'Not paid out on exit',
    },
    complianceNote:
      'Lisbon (33 employees) switches to Portugal statutory sick pay from day 4 of an absence; this policy covers days 1–3 there.',
  },
  parental: {
    id: 'parental',
    name: 'Parental',
    kind: 'grant',
    icon: BabyIcon,
    colorKey: 'purple',
    version: 2,
    updatedAt: '2026-03-20T09:00:00Z',
    updatedBy: 'Priya Raman',
    description:
      'Fully paid parental leave granted per birth or adoption event — no accrual. Runs concurrently with statutory leave where required.',
    accrualSummary: 'Grant · 16 wk primary / 8 wk secondary',
    carryoverSummary: 'Per-event grant · no carryover',
    departments: ALL_DEPTS,
    offices: ALL_OFFICES,
    covered: 138,
    pendingStart: 2,
    schedule: [],
    grantTerms: [
      {label: 'Primary caregiver', value: '16 weeks, 100% pay'},
      {label: 'Secondary caregiver', value: '8 weeks, 100% pay'},
      {label: 'Eligibility', value: 'After 90 days of employment'},
      {label: 'Scheduling', value: 'Continuous, or split into 2 blocks within 12 months'},
      {label: 'Currently on leave', value: '3 employees (2 Engineering, 1 GTM)'},
    ],
    rules: null,
    complianceNote:
      'Lisbon employees take statutory licença parental first; this grant tops pay up to 100% and extends the total to 16 weeks.',
  },
  sabbatical: {
    id: 'sabbatical',
    name: 'Sabbatical',
    kind: 'grant',
    icon: CompassIcon,
    colorKey: 'teal',
    version: 1,
    updatedAt: '2026-01-15T18:30:00Z',
    updatedBy: 'Priya Raman',
    description:
      'A four-week paid recharge after every five years of service. Piloting with Engineering and Design before a company-wide rollout.',
    accrualSummary: 'Grant · 4 wk after 5 yrs',
    carryoverSummary: 'Once per 5-year cycle',
    departments: ['eng', 'design'],
    offices: ALL_OFFICES,
    covered: 70,
    pendingStart: 0,
    schedule: [],
    grantTerms: [
      {label: 'Grant', value: '4 consecutive weeks, 100% pay'},
      {label: 'Eligibility', value: 'Every 5 years of continuous service'},
      {label: 'Assigned', value: '70 employees (Engineering 52, Design 18)'},
      {label: 'Currently eligible', value: '14 employees with 5+ years tenure'},
      {label: 'Scheduled for 2026 H2', value: '2 sabbaticals (both Engineering)'},
    ],
    rules: null,
    complianceNote:
      'Pilot review scheduled October 2026 — GTM, Ops, Finance, and People join the policy if the pilot holds.',
  },
};

const POLICY_ORDER: PolicyId[] = ['vacation', 'sick', 'parental', 'sabbatical'];

// ---------------------------------------------------------------------------
// CHANGE-IMPACT FIXTURES — precomputed per rule change, so the edit-mode
// banner is deterministic. Counts reference real balances: Marcus Webb and
// Sofia Ortiz are the only two employees carrying more than 5 vacation
// days, so the seeded cap change (10 → 5) affects exactly 2 people.
// ---------------------------------------------------------------------------

interface AffectedEmployee {
  name: string;
  role: string;
  office: string;
  detail: string;
}

interface RuleImpact {
  /** Total employees whose current balance violates the new rule. */
  count: number;
  /** Named sample rows shown in the banner (count - samples = overflow). */
  samples: AffectedEmployee[];
}

// Compact fixture rows: [name, role, office, detail].
function affected(spec: [string, string, string, string]): AffectedEmployee {
  return {name: spec[0], role: spec[1], office: spec[2], detail: spec[3]};
}

const MARCUS: [string, string, string] = ['Marcus Webb', 'Platform lead · Engineering', 'SF HQ'];
const SOFIA: [string, string, string] = ['Sofia Ortiz', 'Design lead · Design', 'Lisbon'];

const RULE_IMPACT: Record<PolicyId, Partial<Record<RuleKey, RuleImpact>>> = {
  vacation: {
    carryoverCap: {
      count: 2,
      samples: [
        affected([...MARCUS, 'Carried over 8.0 d — 3.0 d forfeited on publish']),
        affected([...SOFIA, 'Carried over 6.5 d — 1.5 d forfeited on publish']),
      ],
    },
    carryoverEnabled: {
      count: 41,
      samples: [
        affected([...MARCUS, 'Carried over 8.0 d — full amount forfeited']),
        affected([...SOFIA, 'Carried over 6.5 d — full amount forfeited']),
        affected(['Elena Voss', 'Finance lead · Finance', 'SF HQ', 'Carried over 4.0 d — full amount forfeited']),
      ],
    },
    negativeEnabled: {
      count: 1,
      samples: [
        affected(['Jonah Fields', 'Account executive · GTM', 'Remote-US', 'Balance −1.5 d — reset to 0, deducted from next accrual']),
      ],
    },
  },
  sick: {
    carryoverEnabled: {count: 0, samples: []},
    negativeEnabled: {
      count: 3,
      samples: [
        affected(['Tom Okonkwo', 'IT admin · Ops', 'SF HQ', 'Balance −1.0 d — reset to 0, deducted from next accrual']),
      ],
    },
  },
  parental: {},
  sabbatical: {},
};

/** Seeded pending change: Dana drafted a Vacation carryover-cap cut
 * (10 → 5 days) on 2 July; it is unpublished when the page loads. */
const INITIAL_DRAFTS: Record<PolicyId, RuleDraft | null> = {
  vacation: {carryoverCapDays: 5},
  sick: null,
  parental: null,
  sabbatical: null,
};

const DRAFT_AUTHORED_AT = '2026-07-02T15:12:00Z';
const PUBLISH_AT = '2026-07-03T09:30:00Z';

const CARRYOVER_CAP_OPTIONS = [
  {value: '5', label: '5 days'},
  {value: '10', label: '10 days'},
  {value: '15', label: '15 days'},
];

// ---------------------------------------------------------------------------
// HOLIDAY CALENDARS — fixed 2026 dates. US covers SF HQ + Remote-US
// (58 + 49 = 107 employees); Portugal covers Lisbon (33). 107 + 33 = 140.
// "Upcoming" is anchored to the fixture date, Friday 3 July 2026.
// ---------------------------------------------------------------------------

type CalendarId = 'us' | 'pt';

interface Holiday {
  id: string;
  month: string;
  day: number;
  weekday: string;
  name: string;
  kind: 'public' | 'company';
  note?: string;
}

interface HolidayCalendar {
  id: CalendarId;
  label: string;
  offices: OfficeId[];
  totalIn2026: number;
  holidays: Holiday[];
}

const HOLIDAY_CALENDARS: Record<CalendarId, HolidayCalendar> = {
  us: {
    id: 'us',
    label: 'United States',
    offices: ['sf', 'remote'],
    totalIn2026: 12,
    // 7 remaining of 12 — Jan 1, MLK, Presidents, Memorial, and Juneteenth
    // have already been observed by 3 July 2026.
    holidays: [
      {id: 'us-jul4', month: 'Jul', day: 3, weekday: 'Fri', name: 'Independence Day', kind: 'public', note: 'Observed — Jul 4 falls on a Saturday'},
      {id: 'us-labor', month: 'Sep', day: 7, weekday: 'Mon', name: 'Labor Day', kind: 'public'},
      {id: 'us-thanks', month: 'Nov', day: 26, weekday: 'Thu', name: 'Thanksgiving', kind: 'public'},
      {id: 'us-thanks2', month: 'Nov', day: 27, weekday: 'Fri', name: 'Day after Thanksgiving', kind: 'company'},
      {id: 'us-xmas-eve', month: 'Dec', day: 24, weekday: 'Thu', name: 'Christmas Eve', kind: 'company'},
      {id: 'us-xmas', month: 'Dec', day: 25, weekday: 'Fri', name: 'Christmas Day', kind: 'public'},
      {id: 'us-nye', month: 'Dec', day: 31, weekday: 'Thu', name: "New Year's Eve", kind: 'company'},
    ],
  },
  pt: {
    id: 'pt',
    label: 'Portugal',
    offices: ['lisbon'],
    totalIn2026: 15,
    // 7 remaining of 15 — the national holidays through Portugal Day plus
    // St. Anthony's (Lisbon municipal) fall before July.
    holidays: [
      {id: 'pt-assump', month: 'Aug', day: 15, weekday: 'Sat', name: 'Assumption Day', kind: 'public', note: 'Falls on a Saturday — not shifted in Portugal'},
      {id: 'pt-republic', month: 'Oct', day: 5, weekday: 'Mon', name: 'Republic Day', kind: 'public'},
      {id: 'pt-saints', month: 'Nov', day: 1, weekday: 'Sun', name: "All Saints' Day", kind: 'public', note: 'Falls on a Sunday — not shifted in Portugal'},
      {id: 'pt-restore', month: 'Dec', day: 1, weekday: 'Tue', name: 'Restoration of Independence', kind: 'public'},
      {id: 'pt-immac', month: 'Dec', day: 8, weekday: 'Tue', name: 'Immaculate Conception', kind: 'public'},
      {id: 'pt-xmas-eve', month: 'Dec', day: 24, weekday: 'Thu', name: 'Christmas Eve', kind: 'company'},
      {id: 'pt-xmas', month: 'Dec', day: 25, weekday: 'Fri', name: 'Christmas Day', kind: 'public'},
    ],
  },
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** Tabular one-decimal day figure, e.g. "1.25" / "0.83" / "15". */
function formatDays(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0$/, '');
}

function deptChipLabel(policy: LeavePolicy): string {
  return policy.departments.length === ALL_DEPTS.length
    ? 'All departments'
    : policy.departments.map(id => DEPARTMENTS[id].label).join(' + ');
}

function officeChipLabel(policy: LeavePolicy): string {
  return policy.offices.length === ALL_OFFICES.length
    ? 'All offices'
    : policy.offices.map(id => OFFICES[id].label).join(' + ');
}

/** Effective rule values with the draft overlaid on the saved policy. */
function effectiveRules(rules: PolicyRules, draft: RuleDraft | null): PolicyRules {
  return draft === null
    ? rules
    : {
        ...rules,
        carryoverEnabled: draft.carryoverEnabled ?? rules.carryoverEnabled,
        carryoverCapDays: draft.carryoverCapDays ?? rules.carryoverCapDays,
        negativeEnabled: draft.negativeEnabled ?? rules.negativeEnabled,
      };
}

interface PendingChange {
  key: RuleKey;
  label: string;
  impact: RuleImpact;
}

/** Diff draft vs saved rules into banner-ready change rows. Impact rows
 * only count when the change is restrictive (disable / lower cap) — a
 * loosening change affects nobody's current balance. */
function diffDraft(policy: LeavePolicy, draft: RuleDraft | null): PendingChange[] {
  if (policy.rules === null || draft === null) {
    return [];
  }
  const {rules} = policy;
  const impacts = RULE_IMPACT[policy.id];
  const none: RuleImpact = {count: 0, samples: []};
  const changes: PendingChange[] = [];
  if (draft.carryoverEnabled !== undefined && draft.carryoverEnabled !== rules.carryoverEnabled) {
    changes.push({
      key: 'carryoverEnabled',
      label: draft.carryoverEnabled ? 'Carryover: off → on' : 'Carryover: on → off',
      impact: draft.carryoverEnabled ? none : (impacts.carryoverEnabled ?? none),
    });
  }
  if (draft.carryoverCapDays !== undefined && draft.carryoverCapDays !== rules.carryoverCapDays) {
    changes.push({
      key: 'carryoverCap',
      label: `Carryover cap: ${rules.carryoverCapDays} d → ${draft.carryoverCapDays} d`,
      impact:
        draft.carryoverCapDays < rules.carryoverCapDays ? (impacts.carryoverCap ?? none) : none,
    });
  }
  if (draft.negativeEnabled !== undefined && draft.negativeEnabled !== rules.negativeEnabled) {
    changes.push({
      key: 'negativeEnabled',
      label: draft.negativeEnabled ? 'Negative balance: off → on' : 'Negative balance: on → off',
      impact: draft.negativeEnabled ? none : (impacts.negativeEnabled ?? none),
    });
  }
  return changes;
}

function affectedTotal(changes: PendingChange[]): number {
  return changes.reduce((sum, change) => sum + change.impact.count, 0);
}

// ---------------------------------------------------------------------------
// RAIL — one styled-button card per policy: glyph, name, status badge,
// accrual/carryover summary lines, assignment chips, covered count.
// ---------------------------------------------------------------------------

function AssignChip({icon, label}: {icon: typeof UsersIcon; label: string}) {
  return (
    <span style={styles.assignChip}>
      <Icon icon={icon} size="xsm" color="inherit" />
      {label}
    </span>
  );
}

function PolicyCard({
  policy,
  isActive,
  hasPendingChange,
  onSelect,
}: {
  policy: LeavePolicy;
  isActive: boolean;
  hasPendingChange: boolean;
  onSelect: (id: PolicyId) => void;
}) {
  return (
    <button
      type="button"
      style={isActive ? {...styles.policyCard, ...styles.policyCardActive} : styles.policyCard}
      aria-pressed={isActive}
      onClick={() => onSelect(policy.id)}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <span
            style={{
              ...styles.policyGlyph,
              color: POLICY_COLOR[policy.colorKey],
              backgroundColor: POLICY_TINT[policy.colorKey],
            }}>
            <Icon icon={policy.icon} size="sm" color="inherit" />
          </span>
          <StackItem size="fill" style={{minWidth: 0}}>
            <Text type="label" maxLines={1}>
              {policy.name}
            </Text>
          </StackItem>
          {hasPendingChange ? (
            <Badge label="Pending change" variant="warning" />
          ) : (
            <Badge label="Active" variant="success" />
          )}
        </HStack>
        <VStack gap={0}>
          <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
            {policy.accrualSummary}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
            {policy.carryoverSummary}
          </Text>
        </VStack>
        <HStack gap={1} wrap="wrap">
          <AssignChip icon={Building2Icon} label={deptChipLabel(policy)} />
          <AssignChip icon={MapPinIcon} label={officeChipLabel(policy)} />
          <AssignChip
            icon={UsersIcon}
            label={
              policy.pendingStart > 0
                ? `${policy.covered} + ${policy.pendingStart} starting`
                : `${policy.covered} covered`
            }
          />
        </HStack>
      </VStack>
    </button>
  );
}

function PolicyRail({
  policies,
  drafts,
  activeId,
  onSelect,
}: {
  policies: Record<PolicyId, LeavePolicy>;
  drafts: Record<PolicyId, RuleDraft | null>;
  activeId: PolicyId;
  onSelect: (id: PolicyId) => void;
}) {
  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" style={{paddingInline: 'var(--spacing-1)'}}>
            <StackItem size="fill">
              <Text type="label" size="sm" color="secondary">
                Leave policies
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {POLICY_ORDER.length}
            </Text>
          </HStack>
          {POLICY_ORDER.map(id => (
            <PolicyCard
              key={id}
              policy={policies[id]}
              isActive={id === activeId}
              hasPendingChange={diffDraft(policies[id], drafts[id]).length > 0}
              onSelect={onSelect}
            />
          ))}
          <Divider />
          {/* Coverage cross-check pinned to the catalog: department
              headcounts sum to the canonical 140. */}
          <VStack gap={1} style={{paddingInline: 'var(--spacing-1)'}}>
            <Text type="label" size="sm" color="secondary">
              Coverage check
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {ALL_DEPTS.map(id => `${DEPARTMENTS[id].label} ${DEPARTMENTS[id].headcount}`).join(' · ')}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Total {TOTAL_HEADCOUNT} employees · 2 starting soon
            </Text>
          </VStack>
        </VStack>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DETAIL — stat tiles, accrual schedule table, pending-change banner,
// rule rows, assignments, grant terms.
// ---------------------------------------------------------------------------

function StatTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div style={styles.statTile}>
      <VStack gap={0}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <Text type="label" size="lg" hasTabularNumbers>
          {value}
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {detail}
        </Text>
      </VStack>
    </div>
  );
}

// Accrual table — fixed columns carry both width and minWidth via pixel()
// (Table cells have max-width: 0); numeric columns right-align with
// tabular numerals.
/** Right-aligned day-figure column with tabular numerals. */
function dayColumn(
  key: string,
  header: string,
  widthPx: number,
  pick: (row: TenureBand) => number,
): TableColumn<TenureBand> {
  return {
    key,
    header,
    align: 'end',
    width: pixel(widthPx),
    renderCell: (row: TenureBand) => (
      <Text type="body" hasTabularNumbers style={styles.numericCell}>
        {formatDays(pick(row))} d
      </Text>
    ),
  };
}

// Column floor sums to ≤ 390px — the demo's detail-column width — so the
// full schedule is visible without horizontal scrolling; the wrapper's
// overflowX only engages below that floor.
const SCHEDULE_COLUMNS: TableColumn<TenureBand>[] = [
  {
    key: 'band',
    header: 'Tenure',
    width: proportional(1, {minWidth: 88}),
    renderCell: (row: TenureBand) => <Text type="label">{row.band}</Text>,
  },
  dayColumn('monthly', 'Monthly', 82, row => row.monthlyDays),
  dayColumn('annual', 'Annual', 70, row => row.annualDays),
  dayColumn('cap', 'Cap', 62, row => row.capDays),
  {
    key: 'employees',
    header: 'Employees',
    align: 'end',
    width: pixel(88),
    renderCell: (row: TenureBand) => (
      <Text type="body" color="secondary" hasTabularNumbers style={styles.numericCell}>
        {row.employees}
      </Text>
    ),
  },
];

function AffectedEmployeeRow({employee}: {employee: AffectedEmployee}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.affectedRow}>
      <Avatar name={employee.name} size="small" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {employee.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {employee.role} · {employee.office}
          </Text>
        </VStack>
      </StackItem>
      <Text type="supporting" color="secondary" hasTabularNumbers style={{textAlign: 'end'}}>
        {employee.detail}
      </Text>
    </HStack>
  );
}

function PendingChangeBanner({
  policy,
  changes,
  onPublish,
  onDiscard,
}: {
  policy: LeavePolicy;
  changes: PendingChange[];
  onPublish: () => void;
  onDiscard: () => void;
}) {
  const total = affectedTotal(changes);
  const employeeWord = total === 1 ? 'employee' : 'employees';
  return (
    // Footgun: Banner `endContent` reserves its full width beside the title,
    // which crushes the title into a sliver at this pane width — the
    // Discard / Publish actions live in the banner body instead.
    <Banner
      status="warning"
      title={`Pending change — ${total} ${employeeWord} affected`}
      description={`${changes.map(change => change.label).join(' · ')} · drafted by ${CURRENT_USER}`}
      defaultIsExpanded>
      <VStack gap={3}>
        {changes.map(change => {
          const overflow = change.impact.count - change.impact.samples.length;
          return (
            <VStack key={change.key} gap={2}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text type="label" size="sm">
                    {change.label}
                  </Text>
                </StackItem>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {change.impact.count === 0
                    ? 'No balances affected'
                    : `${change.impact.count} affected`}
                </Text>
              </HStack>
              {change.impact.samples.map(employee => (
                <AffectedEmployeeRow key={employee.name} employee={employee} />
              ))}
              {overflow > 0 ? (
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  + {overflow} more — full list in the change review
                </Text>
              ) : null}
            </VStack>
          );
        })}
        <Text type="supporting" color="secondary">
          Drafted <Timestamp value={DRAFT_AUTHORED_AT} format="date_time" />. Publishing notifies
          affected employees and their managers before balances change.
        </Text>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" />
          <Button label="Discard" variant="ghost" size="sm" icon={<Icon icon={XIcon} size="sm" />} onClick={onDiscard} />
          <Button
            label={`Publish v${policy.version + 1}`}
            variant="primary"
            size="sm"
            icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
            onClick={onPublish}
          />
        </HStack>
      </VStack>
    </Banner>
  );
}

function RuleRow({
  icon,
  title,
  description,
  isChanged,
  control,
}: {
  icon: typeof ClockIcon;
  title: string;
  description: string;
  isChanged: boolean;
  control?: ReactNode;
}) {
  return (
    <div style={isChanged ? {...styles.ruleRow, ...styles.ruleRowChanged} : styles.ruleRow}>
      <Icon icon={icon} size="sm" color="secondary" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <Text type="label">{title}</Text>
            {isChanged ? <Badge label="Edited" variant="warning" /> : null}
          </HStack>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {description}
          </Text>
        </VStack>
      </StackItem>
      {control}
    </div>
  );
}

function RulesSection({
  policy,
  draft,
  isEditing,
  changes,
  onDraftChange,
}: {
  policy: LeavePolicy;
  draft: RuleDraft | null;
  isEditing: boolean;
  changes: PendingChange[];
  onDraftChange: (patch: RuleDraft) => void;
}) {
  const saved = policy.rules;
  if (saved === null) {
    return null;
  }
  const effective = effectiveRules(saved, draft);
  const changedKeys = new Set(changes.map(change => change.key));
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={3}>Balance rules</Heading>
        </StackItem>
        {!isEditing && (
          <Text type="supporting" color="secondary">
            Enter edit mode to change rules
          </Text>
        )}
      </HStack>
      <RuleRow
        icon={HistoryIcon}
        title="Carryover"
        description={
          effective.carryoverEnabled
            ? `Up to ${effective.carryoverCapDays} days roll into the next year · ${saved.carryoverExpiry}`
            : `Unused days do not roll over · ${saved.carryoverExpiry}`
        }
        isChanged={changedKeys.has('carryoverEnabled') || changedKeys.has('carryoverCap')}
        control={
          <HStack gap={3} vAlign="center">
            {effective.carryoverEnabled ? (
              <Selector
                label="Carryover cap"
                isLabelHidden
                size="sm"
                width={110}
                options={CARRYOVER_CAP_OPTIONS}
                value={String(effective.carryoverCapDays)}
                isDisabled={!isEditing}
                onChange={value => onDraftChange({carryoverCapDays: Number(value)})}
              />
            ) : null}
            <Switch
              label="Allow carryover"
              isLabelHidden
              value={effective.carryoverEnabled}
              isDisabled={!isEditing}
              onChange={checked => onDraftChange({carryoverEnabled: checked})}
            />
          </HStack>
        }
      />
      <RuleRow
        icon={ScrollTextIcon}
        title="Negative balance"
        description={
          effective.negativeEnabled
            ? `Requests may overdraw up to −${saved.negativeFloorDays} days ahead of accrual`
            : 'Requests are capped at the accrued balance'
        }
        isChanged={changedKeys.has('negativeEnabled')}
        control={
          <Switch
            label="Allow negative balance"
            isLabelHidden
            value={effective.negativeEnabled}
            isDisabled={!isEditing}
            onChange={checked => onDraftChange({negativeEnabled: checked})}
          />
        }
      />
      <RuleRow
        icon={ClockIcon}
        title="Accrual timing"
        description={`${saved.accrualTiming} · ${saved.waitingPeriod} · prorated for mid-month starts`}
        isChanged={false}
      />
      <RuleRow
        icon={ShieldCheckIcon}
        title="Exit payout"
        description={saved.exitPayout}
        isChanged={false}
      />
      <HStack gap={2} vAlign="start" style={{paddingInline: 'var(--spacing-1)'}}>
        <Icon icon={InfoIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            {policy.complianceNote}
          </Text>
        </StackItem>
      </HStack>
    </VStack>
  );
}

function AssignmentsSection({policy}: {policy: LeavePolicy}) {
  const deptTotal = policy.departments.reduce(
    (sum, id) => sum + DEPARTMENTS[id].headcount,
    0,
  );
  return (
    <VStack gap={2}>
      <Heading level={3}>Assignments</Heading>
      <VStack gap={1}>
        <Text type="label" size="sm" color="secondary">
          Departments
        </Text>
        <HStack gap={1} wrap="wrap">
          {policy.departments.map(id => (
            <AssignChip
              key={id}
              icon={Building2Icon}
              label={`${DEPARTMENTS[id].label} · ${DEPARTMENTS[id].headcount}`}
            />
          ))}
        </HStack>
      </VStack>
      <VStack gap={1}>
        <Text type="label" size="sm" color="secondary">
          Offices
        </Text>
        <HStack gap={1} wrap="wrap">
          {policy.offices.map(id => (
            <AssignChip
              key={id}
              icon={MapPinIcon}
              label={`${OFFICES[id].label} · ${OFFICES[id].headcount}`}
            />
          ))}
        </HStack>
      </VStack>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {policy.pendingStart > 0
          ? `${deptTotal} assigned — ${policy.covered} active, ${policy.pendingStart} starting soon (Ava Lindqvist · Jul 6, Ken Tanaka · Jul 13)`
          : `${deptTotal} assigned — pilot departments only; new hires join on eligibility`}
      </Text>
    </VStack>
  );
}

function GrantTermsSection({policy}: {policy: LeavePolicy}) {
  return (
    <VStack gap={2}>
      <Heading level={3}>Grant terms</Heading>
      <MetadataList columns={1} label={{position: 'start', width: 180}}>
        {policy.grantTerms.map(term => (
          <MetadataListItem key={term.label} label={term.label}>
            <Text type="body" hasTabularNumbers>
              {term.value}
            </Text>
          </MetadataListItem>
        ))}
      </MetadataList>
      <HStack gap={2} vAlign="start" style={{paddingInline: 'var(--spacing-1)'}}>
        <Icon icon={InfoIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            {policy.complianceNote}
          </Text>
        </StackItem>
      </HStack>
    </VStack>
  );
}

function ScheduleSection({policy}: {policy: LeavePolicy}) {
  const bandTotal = policy.schedule.reduce((sum, band) => sum + band.employees, 0);
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={3}>Accrual schedule</Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {policy.schedule.length > 1
            ? `${policy.schedule.length} tenure bands · ${bandTotal} employees`
            : `Flat rate · ${bandTotal} employees`}
        </Text>
      </HStack>
      <div style={styles.tableScrollX}>
        <Table<TenureBand>
          data={policy.schedule}
          columns={SCHEDULE_COLUMNS}
          idKey="id"
          density="compact"
          dividers="rows"
        />
      </div>
      <Text type="supporting" color="secondary">
        Band rates apply from the anniversary month. Schedule changes ship as a
        new policy version and never rewrite accrued balances.
      </Text>
    </VStack>
  );
}

/** Per-policy stat tiles — fixture figures that agree with the schedule
 * and rail chips (covered counts, band sums, eligibility). */
const POLICY_STATS: Record<PolicyId, {label: string; value: string; detail: string}[]> = {
  vacation: [
    {label: 'Covered', value: '138', detail: '+ 2 starting soon · 140 assigned'},
    {label: 'Avg balance', value: '9.4 d', detail: 'Across 138 active employees'},
    {label: 'Carried into 2026', value: '41', detail: 'Employees with carryover days'},
    {label: 'Negative balances', value: '1', detail: 'Within the −3 d floor'},
  ],
  sick: [
    {label: 'Covered', value: '138', detail: '+ 2 starting soon · 140 assigned'},
    {label: 'Avg balance', value: '6.1 d', detail: 'Across 138 active employees'},
    {label: 'Used in June', value: '54 d', detail: 'Company-wide, 31 employees'},
    {label: 'Negative balances', value: '3', detail: 'Within the −2 d floor'},
  ],
  parental: [
    {label: 'Covered', value: '138', detail: '+ 2 starting soon · 140 assigned'},
    {label: 'On leave now', value: '3', detail: '2 Engineering · 1 GTM'},
    {label: 'Returning in Q3', value: '2', detail: 'Aug 10 and Sep 21'},
    {label: 'Taken in 2026', value: '5', detail: 'Grants started this year'},
  ],
  sabbatical: [
    {label: 'Assigned', value: '70', detail: 'Engineering 52 · Design 18'},
    {label: 'Eligible now', value: '14', detail: '5+ years of service'},
    {label: 'Scheduled H2', value: '2', detail: 'Both Engineering'},
    {label: 'Completed', value: '0', detail: 'Policy launched Jan 2026'},
  ],
};

function PolicyDetail({
  policy,
  draft,
  isEditing,
  onToggleEdit,
  onDraftChange,
  onPublish,
  onDiscard,
}: {
  policy: LeavePolicy;
  draft: RuleDraft | null;
  isEditing: boolean;
  onToggleEdit: () => void;
  onDraftChange: (patch: RuleDraft) => void;
  onPublish: () => void;
  onDiscard: () => void;
}) {
  const changes = diffDraft(policy, draft);
  return (
    <VStack gap={5} style={styles.detailColumn}>
      {/* ---- heading row: glyph, name, version, edit toggle ---- */}
      <VStack gap={2}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <span
            style={{
              ...styles.policyGlyph,
              width: 36,
              height: 36,
              color: POLICY_COLOR[policy.colorKey],
              backgroundColor: POLICY_TINT[policy.colorKey],
            }}>
            <Icon icon={policy.icon} size="md" color="inherit" />
          </span>
          <StackItem size="fill" style={{minWidth: 160}}>
            <VStack gap={0}>
              <HStack gap={2} vAlign="center">
                <Heading level={2}>{policy.name}</Heading>
                <Badge label={`v${policy.version}`} variant="neutral" />
                {isEditing ? <Badge label="Editing" variant="warning" /> : null}
              </HStack>
              <Text type="supporting" color="secondary">
                Updated <Timestamp value={policy.updatedAt} format="date" /> by{' '}
                {policy.updatedBy}
              </Text>
            </VStack>
          </StackItem>
          {policy.kind === 'accrual' ? (
            <Button
              label={isEditing ? 'Done editing' : 'Edit rules'}
              variant={isEditing ? 'secondary' : 'ghost'}
              size="sm"
              icon={<Icon icon={isEditing ? CheckIcon : PencilIcon} size="sm" />}
              onClick={onToggleEdit}
            />
          ) : (
            <Tooltip content="Grant policies change via a People-team review, not inline edits">
              <Button label="Request change" variant="ghost" size="sm" isDisabled />
            </Tooltip>
          )}
        </HStack>
        <Text type="body" color="secondary">
          {policy.description}
        </Text>
      </VStack>

      {/* ---- pending-change banner (edit-mode) ---- */}
      {changes.length > 0 ? (
        <PendingChangeBanner
          policy={policy}
          changes={changes}
          onPublish={onPublish}
          onDiscard={onDiscard}
        />
      ) : null}

      {/* ---- stat tiles ---- */}
      <HStack gap={2} wrap="wrap">
        {POLICY_STATS[policy.id].map(stat => (
          <StatTile key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
        ))}
      </HStack>

      {policy.schedule.length > 0 ? <ScheduleSection policy={policy} /> : null}
      {policy.kind === 'accrual' ? (
        <RulesSection
          policy={policy}
          draft={draft}
          isEditing={isEditing}
          changes={changes}
          onDraftChange={onDraftChange}
        />
      ) : (
        <GrantTermsSection policy={policy} />
      )}
      <Divider />
      <AssignmentsSection policy={policy} />
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// HOLIDAY PANEL — calendar selector (US / Portugal), office coverage, and
// the upcoming-2026 holiday list. Renders in the end panel on desktop and
// inline below the detail pane at <= 1180px.
// ---------------------------------------------------------------------------

function HolidayRow({holiday}: {holiday: Holiday}) {
  return (
    <HStack gap={3} vAlign="center">
      <div
        style={{
          ...styles.holidayDateBlock,
          color: POLICY_COLOR.blue,
          backgroundColor: 'var(--color-background-muted)',
          border: 'var(--border-width) solid var(--color-border)',
        }}>
        <Text type="supporting" size="sm" color="secondary">
          {holiday.month}
        </Text>
        <Text type="label" hasTabularNumbers>
          {holiday.day}
        </Text>
      </div>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={2}>
            {holiday.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={2}>
            {holiday.weekday}
            {holiday.note !== undefined ? ` · ${holiday.note}` : ''}
          </Text>
        </VStack>
      </StackItem>
      {/* flexShrink 0 — long holiday names otherwise crush the Token to "Pu…". */}
      <span style={{display: 'inline-flex', flexShrink: 0}}>
        <Token
          size="sm"
          color={holiday.kind === 'public' ? 'blue' : 'gray'}
          label={holiday.kind === 'public' ? 'Public' : 'Company'}
        />
      </span>
    </HStack>
  );
}

function HolidayCalendarBody({
  calendarId,
  onCalendarChange,
}: {
  calendarId: CalendarId;
  onCalendarChange: (id: CalendarId) => void;
}) {
  const calendar = HOLIDAY_CALENDARS[calendarId];
  const coverage = calendar.offices.reduce((sum, id) => sum + OFFICES[id].headcount, 0);
  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={CalendarDaysIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Heading level={3}>Holiday calendars</Heading>
        </StackItem>
      </HStack>
      {/* Short labels — "US" / "Portugal" fit one line at 320px (footgun 7). */}
      <SegmentedControl
        label="Holiday calendar"
        value={calendarId}
        onChange={value => onCalendarChange(value as CalendarId)}
        size="sm">
        <SegmentedControlItem label="US" value="us" />
        <SegmentedControlItem label="Portugal" value="pt" />
      </SegmentedControl>
      <HStack gap={2} vAlign="center">
        <Icon icon={calendarId === 'us' ? FlagIcon : LandmarkIcon} size="sm" color="secondary" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {calendar.label}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
              {calendar.offices.map(id => OFFICES[id].label).join(' + ')} · {coverage} employees
            </Text>
          </VStack>
        </StackItem>
      </HStack>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label" size="sm" color="secondary">
            Upcoming in 2026
          </Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {calendar.holidays.length} of {calendar.totalIn2026} remain
        </Text>
      </HStack>
      <VStack gap={2}>
        {calendar.holidays.map(holiday => (
          <HolidayRow key={holiday.id} holiday={holiday} />
        ))}
      </VStack>
      <Divider />
      <HStack gap={2} vAlign="start">
        <Icon icon={GlobeIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Holidays never draw from leave balances. US covers SF HQ + Remote-US
            (107) and Portugal covers Lisbon (33) — together the full 140.
          </Text>
        </StackItem>
      </HStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const POLICY_SELECT_OPTIONS = POLICY_ORDER.map(id => ({
  value: id,
  label: INITIAL_POLICIES[id].name,
}));

export default function HrLeavePoliciesTemplate() {
  const [policies, setPolicies] = useState<Record<PolicyId, LeavePolicy>>(INITIAL_POLICIES);
  const [drafts, setDrafts] = useState<Record<PolicyId, RuleDraft | null>>(INITIAL_DRAFTS);
  const [activeId, setActiveId] = useState<PolicyId>('vacation');
  const [editingId, setEditingId] = useState<PolicyId | null>(null);
  const [calendarId, setCalendarId] = useState<CalendarId>('us');
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px moves the holiday panel inline below the
  // detail pane; <=900px drops the rail (policy Selector appears).
  const isHolidayInline = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 900px)');

  const activePolicy = policies[activeId];
  const activeDraft = drafts[activeId];
  const activeChanges = useMemo(
    () => diffDraft(activePolicy, activeDraft),
    [activePolicy, activeDraft],
  );

  // Total pending changes across the catalog for the header chip.
  const pendingPolicies = POLICY_ORDER.filter(
    id => diffDraft(policies[id], drafts[id]).length > 0,
  );

  const selectPolicy = (id: PolicyId) => {
    setActiveId(id);
    setEditingId(null);
  };

  const toggleEdit = () => {
    setEditingId(current => (current === activeId ? null : activeId));
  };

  const patchDraft = (patch: RuleDraft) => {
    setDrafts(current => {
      const merged: RuleDraft = {...(current[activeId] ?? {}), ...patch};
      const saved = policies[activeId].rules;
      // Drop entries that match the saved rules so the draft empties out
      // when every edit is reverted by hand.
      if (saved !== null) {
        if (merged.carryoverEnabled === saved.carryoverEnabled) {
          delete merged.carryoverEnabled;
        }
        if (merged.carryoverCapDays === saved.carryoverCapDays) {
          delete merged.carryoverCapDays;
        }
        if (merged.negativeEnabled === saved.negativeEnabled) {
          delete merged.negativeEnabled;
        }
      }
      return {
        ...current,
        [activeId]: Object.keys(merged).length > 0 ? merged : null,
      };
    });
  };

  const publishDraft = () => {
    const draft = drafts[activeId];
    const saved = policies[activeId];
    if (draft === null || saved.rules === null) {
      return;
    }
    const affected = affectedTotal(diffDraft(saved, draft));
    setPolicies(current => ({
      ...current,
      [activeId]: {
        ...saved,
        version: saved.version + 1,
        updatedAt: PUBLISH_AT,
        updatedBy: CURRENT_USER,
        rules: effectiveRules(saved.rules as PolicyRules, draft),
      },
    }));
    setDrafts(current => ({...current, [activeId]: null}));
    setEditingId(null);
    setAnnouncement(
      `Published ${saved.name} policy v${saved.version + 1} — ${affected} ${
        affected === 1 ? 'employee' : 'employees'
      } affected`,
    );
  };

  const discardDraft = () => {
    const name = policies[activeId].name;
    setDrafts(current => ({...current, [activeId]: null}));
    setAnnouncement(`Discarded the pending ${name} change`);
  };

  // ----- header: brand + reconciling summary chips -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ScrollTextIcon} size="md" color="secondary" />
          <Heading level={1}>Leave Policies</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · Workforce
          </Text>
        </HStack>
        <StackItem size="fill" />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Token size="sm" color="gray" label="4 policies" />
          <Token size="sm" color="gray" label="140 employees" />
          <Token size="sm" color="gray" label="2 holiday calendars" />
          {pendingPolicies.length > 0 ? (
            <Token
              size="sm"
              color="orange"
              label={`${pendingPolicies.length} pending ${
                pendingPolicies.length === 1 ? 'change' : 'changes'
              }`}
            />
          ) : null}
        </HStack>
        <HStack gap={2} vAlign="center">
          <Avatar name={CURRENT_USER} size="small" />
          {!isCompact && (
            <VStack gap={0}>
              <Text type="label" size="sm">
                {CURRENT_USER}
              </Text>
              <Text type="supporting" color="secondary">
                People Ops · admin
              </Text>
            </VStack>
          )}
        </HStack>
      </HStack>
    </LayoutHeader>
  );

  // ----- content toolbar: policy Selector when the rail is dropped -----
  const contentToolbar = isCompact ? (
    <HStack gap={2} vAlign="center" style={styles.contentToolbar} wrap="wrap">
      <Selector
        label="Policy"
        isLabelHidden
        options={POLICY_SELECT_OPTIONS}
        value={activeId}
        onChange={value => selectPolicy(value as PolicyId)}
        size="sm"
        width={200}
      />
      <StackItem size="fill" />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {activePolicy.covered + activePolicy.pendingStart} assigned
      </Text>
    </HStack>
  ) : null;

  const detailPane = (
    <div style={styles.panelFill}>
      <div aria-live="polite" style={styles.visuallyHidden}>
        {announcement}
      </div>
      {contentToolbar}
      <div style={styles.detailScroll}>
        <VStack gap={6}>
          <PolicyDetail
            policy={activePolicy}
            draft={activeDraft}
            isEditing={editingId === activeId}
            onToggleEdit={toggleEdit}
            onDraftChange={patchDraft}
            onPublish={publishDraft}
            onDiscard={discardDraft}
          />
          {isHolidayInline ? (
            <VStack gap={4} style={styles.detailColumn}>
              <Divider />
              <HolidayCalendarBody
                calendarId={calendarId}
                onCalendarChange={setCalendarId}
              />
            </VStack>
          ) : null}
        </VStack>
      </div>
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel width={300} padding={0} hasDivider label="Leave policies">
              <PolicyRail
                policies={policies}
                drafts={drafts}
                activeId={activeId}
                onSelect={selectPolicy}
              />
            </LayoutPanel>
          )
        }
        content={<LayoutContent padding={0}>{detailPane}</LayoutContent>}
        end={
          isHolidayInline ? undefined : (
            <LayoutPanel width={320} padding={0} hasDivider label="Holiday calendars">
              <div style={styles.panelFill}>
                <div style={styles.holidayScroll}>
                  <HolidayCalendarBody
                    calendarId={calendarId}
                    onCalendarChange={setCalendarId}
                  />
                </div>
              </div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
