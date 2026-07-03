// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs hourly-Ops roster
 *   (8 of the 16 Ops employees are hourly), two fixed pay weeks of punch
 *   data (Jun 22–28 locked, Jun 29 – Jul 5 in review), fixed ISO audit
 *   timestamps, and USD hourly rates. Hours are always computed from the
 *   punch minutes so every total reconciles; no clocks, no randomness.
 * @output Time & Attendance Approvals — a timesheet approval console for
 *   Kestrel Labs' hourly Ops staff. A header week selector pages between
 *   the locked prior week and the current pay week; a pay-period lock
 *   countdown banner sits above a multi-select timesheet table (employee,
 *   seven daily clock-in/out chips with exception icon badges + tooltips,
 *   an overtime-aware total column that flags >40 h in amber, and a status
 *   token). Checking rows raises a bulk approve bar that skips sheets with
 *   blocking exceptions; clicking a row opens a 340px detail drawer with
 *   the day-by-day punch list, the edited-entry audit note, an OT/gross
 *   pay breakdown, and approve/return actions.
 * @position Page template; emitted by `astryx template hr-time-attendance`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (brand, week selector, search)
 *   | content (lock banner, filter toolbar, bulk bar when rows are
 *   checked, timesheet Table scrolling both axes)
 *   | end drawer 340 (punch list + audit, scrolls).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. The detail drawer is a LayoutPanel; punch chips, the audit
 *   note, and the totals block are styled divs.
 * Color policy: token-pure everywhere; the only literals are the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens
 *   (overtime amber, edited-entry blue, approved green — the demo does
 *   not inject `--color-data-categorical-*`) and the blocking-exception
 *   red pair, matching the repo-standard values.
 *
 * Responsive contract:
 * - > 1240px: full frame — table plus the detail drawer.
 * - <= 1240px: the drawer is dropped (the table stays the source of
 *   truth for totals and flags).
 * - <= 1000px: the seven day-chip columns are replaced by one compact
 *   "Week" summary column (worked-day count + exception icon badges) so
 *   employee/total/status never crush; the header row wraps instead of
 *   clipping the search box or the week selector.
 * - The table scrolls both axes independently (`minHeight: 0` down the
 *   flex chain); the banner, toolbar, and bulk bar are pinned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  CalendarClockIcon,
  CheckCheckIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockAlertIcon,
  ClockIcon,
  LockIcon,
  MapPinIcon,
  MapPinOffIcon,
  PencilLineIcon,
  SearchIcon,
  SendHorizonalIcon,
  TriangleAlertIcon,
  Undo2Icon,
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
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {
  Table,
  pixel,
  proportional,
  useTableSelection,
  useTableSelectionState,
  useTableSortable,
  useTableSortableState,
  useTableStickyColumns,
} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  bannerWrap: {flexShrink: 0},
  contentToolbar: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-4)'},
  bulkBar: {flexShrink: 0},
  tableScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    // Day columns are pixel-fixed; narrow viewports scroll the table
    // horizontally instead of crushing punch chips.
    overflowX: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-3)',
  },
  tableEmpty: {padding: 'var(--spacing-6) var(--spacing-4)'},
  weekLabel: {
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    minWidth: 156,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-1)',
  },
  // Room for the badge's -6px overhang so table cells never clip it.
  dayCellPad: {paddingTop: 6, paddingInlineEnd: 6},
  // Punch chips ------------------------------------------------------------
  dayChip: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    padding: '3px 6px',
    borderRadius: 'var(--radius-control, 6px)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    minWidth: 0,
  },
  dayChipOff: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3px 6px',
    borderRadius: 'var(--radius-control, 6px)',
    border: 'var(--border-width) dashed var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  chipTimes: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    lineHeight: '14px',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  chipHours: {
    fontSize: 10,
    lineHeight: '12px',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
  },
  // Exception icon badge anchored to the chip's top-end corner.
  chipBadge: {
    position: 'absolute',
    top: -6,
    insetInlineEnd: -6,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-surface)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  flagPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    padding: '1px 6px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  totalStack: {display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0},
  // Detail drawer ----------------------------------------------------------
  drawerFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  // Identity header stays pinned; the punch list scrolls beneath it.
  drawerHeader: {flexShrink: 0, padding: 'var(--spacing-3) var(--spacing-4)'},
  drawerScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  drawerActions: {flexShrink: 0, padding: 'var(--spacing-3) var(--spacing-4)'},
  punchRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
    padding: '5px 0',
  },
  totalsTile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  totalsRow: {display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-2)'},
  auditNote: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    borderInlineStart: '2px solid var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  },
  exceptionNote: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    borderInlineStart: '2px solid light-dark(#DC2626, #F87171)',
  },
  punchTimes: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    fontSize: 12,
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
const ACCENTS = {
  amber: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  red: 'light-dark(#DC2626, #F87171)',
} as const;

// ---------------------------------------------------------------------------
// TYPES + TIME HELPERS — punches are minutes-from-midnight; hours are always
// computed (out − in − break), so chip, total, drawer, and banner figures
// reconcile by construction.
// ---------------------------------------------------------------------------

type ExceptionKind = 'missed-out' | 'geofence' | 'edited';

/** Blocking exceptions gate approval; 'edited' is informational (audited). */
const BLOCKING: Record<ExceptionKind, boolean> = {
  'missed-out': true,
  geofence: true,
  edited: false,
};

const EXCEPTION_META: Record<
  ExceptionKind,
  {icon: typeof ClockAlertIcon; color: string; label: string}
> = {
  'missed-out': {icon: ClockAlertIcon, color: ACCENTS.red, label: 'Missed clock-out'},
  geofence: {icon: MapPinOffIcon, color: ACCENTS.red, label: 'Geofence mismatch'},
  edited: {icon: PencilLineIcon, color: ACCENTS.blue, label: 'Edited entry'},
};

interface AuditNote {
  editedBy: string;
  /** Fixed ISO timestamp for the edit. */
  editedAt: string;
  change: string;
  reason: string;
}

interface DayEntry {
  /** e.g. "Mon 6/29" (table header uses the same string). */
  short: string;
  /** e.g. "Mon, Jun 29" for the drawer punch list. */
  long: string;
  /** Minutes from midnight; null = scheduled off. */
  inMin: number | null;
  /** null while a missed clock-out is unresolved. */
  outMin: number | null;
  breakMin: number;
  /** Computed worked minutes; null while the punch is unresolved. */
  workedMin: number | null;
  exception?: ExceptionKind;
  note?: string;
  audit?: AuditNote;
}

interface TimesheetRow extends Record<string, unknown> {
  /** `${weekId}:${empId}` — approval state is keyed off this. */
  id: string;
  empId: string;
  name: string;
  role: string;
  office: string;
  /** USD hourly rate; OT pays 1.5x. */
  rate: number;
  days: DayEntry[];
  totalMin: number;
  regMin: number;
  otMin: number;
  /** Days with an unresolved punch (excluded from totalMin). */
  pendingDays: number;
  blockingCount: number;
  infoCount: number;
}

function parseHM(hm: string): number {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

/** 482 → "8:02a"; 997 → "4:37p" (compact, for punch chips). */
function fmtClockShort(min: number): string {
  const suffix = min < 720 ? 'a' : 'p';
  const h12 = ((Math.floor(min / 60) + 11) % 12) + 1;
  const mm = String(min % 60).padStart(2, '0');
  return `${h12}:${mm}${suffix}`;
}

/** 482 → "8:02 AM" (drawer punch list). */
function fmtClockLong(min: number): string {
  const suffix = min < 720 ? 'AM' : 'PM';
  const h12 = ((Math.floor(min / 60) + 11) % 12) + 1;
  const mm = String(min % 60).padStart(2, '0');
  return `${h12}:${mm} ${suffix}`;
}

/** Minutes → decimal hours: 2595 → "43.25", 450 → "7.5", 480 → "8.0". */
function fmtHours(min: number): string {
  const h = min / 60;
  if (Number.isInteger(h)) {
    return `${h}.0`;
  }
  if (Number.isInteger(h * 10)) {
    return h.toFixed(1);
  }
  return h.toFixed(2);
}

function fmtMoney(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

function firstName(person: string): string {
  return person.split(' ')[0];
}

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs (140-person platform company). Ops runs 16 people;
// 8 of them are hourly and clock in and out. Signed-in approver: Dana
// Whitfield (People Ops). Pay weeks are Mon–Sun; the current pay period
// (Jun 29 – Jul 5, 2026) locks Mon, Jul 6 at 6:00 PM PT. "Now" in this
// fixture world is Fri, Jul 3 2026 ~9:40 AM PT — the lock countdown banner
// is a fixed fixture string, never a live clock.
// ---------------------------------------------------------------------------

const APPROVER = 'Dana Whitfield';

interface Employee {
  id: string;
  name: string;
  role: string;
  office: 'SF HQ' | 'Lisbon' | 'Remote-US';
  rate: number;
}

/** 8 hourly Ops staff (of Ops' 16) — suite-new names; approver is Dana. */
const EMPLOYEES: Employee[] = [
  {id: 'e-ruth', name: 'Ruth Alvarez', role: 'Facilities coordinator', office: 'SF HQ', rate: 34},
  {id: 'e-miguel', name: 'Miguel Santos', role: 'Logistics associate', office: 'SF HQ', rate: 29},
  {id: 'e-hana', name: 'Hana Petrova', role: 'Office experience', office: 'Lisbon', rate: 26},
  {id: 'e-devon', name: 'Devon Clarke', role: 'Workplace tech', office: 'SF HQ', rate: 38},
  {id: 'e-grace', name: 'Grace Nakamura', role: 'Facilities technician', office: 'SF HQ', rate: 33},
  {id: 'e-leo', name: 'Leo Barros', role: 'Logistics associate', office: 'Lisbon', rate: 28},
  {id: 'e-tasha', name: 'Tasha Reed', role: 'Front desk lead', office: 'SF HQ', rate: 27},
  {id: 'e-omar', name: 'Omar Haddad', role: 'Shipping & receiving', office: 'SF HQ', rate: 30},
];

type WeekId = 'w26' | 'w27';

interface WeekMeta {
  id: WeekId;
  label: string;
  /** Mon–Sun column headers, e.g. "Mon 6/29". */
  shortDays: string[];
  /** Drawer punch-list labels, e.g. "Mon, Jun 29". */
  longDays: string[];
  isLocked: boolean;
}

const WEEKS: WeekMeta[] = [
  {
    id: 'w26',
    label: 'Jun 22 – 28, 2026',
    shortDays: ['Mon 6/22', 'Tue 6/23', 'Wed 6/24', 'Thu 6/25', 'Fri 6/26', 'Sat 6/27', 'Sun 6/28'],
    longDays: ['Mon, Jun 22', 'Tue, Jun 23', 'Wed, Jun 24', 'Thu, Jun 25', 'Fri, Jun 26', 'Sat, Jun 27', 'Sun, Jun 28'],
    isLocked: true,
  },
  {
    id: 'w27',
    label: 'Jun 29 – Jul 5, 2026',
    shortDays: ['Mon 6/29', 'Tue 6/30', 'Wed 7/1', 'Thu 7/2', 'Fri 7/3', 'Sat 7/4', 'Sun 7/5'],
    longDays: ['Mon, Jun 29', 'Tue, Jun 30', 'Wed, Jul 1', 'Thu, Jul 2', 'Fri, Jul 3', 'Sat, Jul 4', 'Sun, Jul 5'],
    isLocked: false,
  },
];

const CURRENT_WEEK_ID: WeekId = 'w27';

// Compact fixture day spec:
//   [clockIn 'H:MM', workedMin | null, breakMin, exception?, note?]
//   null = scheduled off; workedMin null = unresolved missed clock-out.
// Clock-out is DERIVED (in + worked + break) so hours always reconcile.
type DaySpec =
  | [string, number | null, number]
  | [string, number | null, number, ExceptionKind]
  | [string, number | null, number, ExceptionKind | undefined, string]
  | null;

const SHEET_SPECS: Record<WeekId, Record<string, DaySpec[]>> = {
  // ---- Current pay week: Jun 29 – Jul 5 (in review) ----
  w27: {
    // Ruth: Wed entry edited (audited below); Sat call-in → 43.25 h, 3.25 OT.
    'e-ruth': [
      ['7:58', 480, 30],
      ['8:04', 480, 30],
      ['8:01', 525, 30, 'edited'],
      ['7:55', 480, 30],
      ['8:06', 480, 45],
      ['9:02', 150, 0, undefined, 'Sat call-in — HVAC contractor escort'],
      null,
    ],
    // Miguel: Thu missed clock-out — Thu hours excluded until resolved.
    'e-miguel': [
      ['8:12', 480, 30],
      ['8:05', 480, 30],
      ['8:09', 465, 30],
      ['8:14', null, 30, 'missed-out', 'No clock-out punch recorded Thu — hours held out of the total'],
      ['8:03', 480, 30],
      null,
      null,
    ],
    // Hana: Tue clock-in outside the Lisbon geofence.
    'e-hana': [
      ['9:04', 465, 45],
      ['8:57', 480, 45, 'geofence', 'Clock-in 1.4 km outside the Lisbon office geofence'],
      ['9:01', 465, 45],
      ['9:08', 450, 45],
      ['8:59', 450, 45],
      null,
      null,
    ],
    'e-devon': [
      ['8:31', 480, 60],
      ['8:28', 480, 60],
      ['8:35', 480, 60],
      ['8:30', 480, 60],
      ['8:26', 480, 60],
      null,
      null,
    ],
    'e-grace': [
      ['6:58', 480, 30],
      ['7:02', 480, 30],
      ['7:00', 480, 30],
      ['6:55', 450, 30],
      ['7:04', 480, 30],
      null,
      null,
    ],
    'e-leo': [
      ['9:12', 435, 45],
      ['9:06', 435, 45],
      ['9:15', 435, 45],
      ['9:02', 435, 45],
      ['9:09', 435, 45],
      null,
      null,
    ],
    'e-tasha': [
      ['8:45', 480, 45],
      ['8:47', 480, 45],
      ['8:44', 480, 45],
      ['8:46', 480, 45],
      ['8:45', 480, 45],
      null,
      null,
    ],
    // Omar: Sat freight window → 41.5 h, 1.5 OT (clean — no exceptions).
    'e-omar': [
      ['6:32', 480, 30],
      ['6:28', 480, 30],
      ['6:35', 480, 30],
      ['6:30', 480, 30],
      ['6:29', 480, 30],
      ['7:00', 90, 0, undefined, 'Jul 4 freight window — receiving dock'],
      null,
    ],
  },
  // ---- Prior pay week: Jun 22 – 28 (locked; all approved) ----
  w26: {
    'e-ruth': [
      ['7:59', 480, 30],
      ['8:02', 480, 30],
      ['8:05', 480, 30],
      ['7:57', 480, 30],
      ['8:03', 480, 30],
      null,
      null,
    ],
    'e-miguel': [
      ['8:08', 480, 30],
      ['8:11', 450, 30],
      ['8:06', 480, 30],
      ['8:09', 450, 30],
      ['8:04', 420, 30],
      null,
      null,
    ],
    'e-hana': [
      ['9:02', 450, 45],
      ['8:58', 450, 45],
      ['9:05', 450, 45],
      ['9:00', 450, 45],
      ['9:03', 450, 45],
      null,
      null,
    ],
    'e-devon': [
      ['8:29', 480, 60],
      ['8:33', 480, 60],
      ['8:27', 480, 60],
      ['8:31', 480, 60],
      ['8:30', 480, 60],
      null,
      null,
    ],
    'e-grace': [
      ['6:59', 480, 30],
      ['7:01', 480, 30],
      ['6:57', 480, 30],
      ['7:03', 480, 30],
      ['7:00', 480, 30],
      null,
      null,
    ],
    'e-leo': [
      ['9:10', 435, 45],
      ['9:08', 435, 45],
      ['9:13', 435, 45],
      ['9:05', 435, 45],
      ['9:11', 435, 45],
      null,
      null,
    ],
    'e-tasha': [
      ['8:46', 480, 45],
      ['8:44', 480, 45],
      ['8:47', 480, 45],
      ['8:45', 480, 45],
      ['8:46', 480, 45],
      null,
      null,
    ],
    // Omar: Sat inventory count → 42.0 h, 2.0 OT (approved as worked).
    'e-omar': [
      ['6:31', 480, 30],
      ['6:33', 480, 30],
      ['6:29', 480, 30],
      ['6:34', 480, 30],
      ['6:30', 480, 30],
      ['7:02', 120, 0, undefined, 'Quarterly inventory count — warehouse'],
      null,
    ],
  },
};

// Audit notes for edited entries, keyed `${weekId}:${empId}:${dayIndex}`.
// The corrected clock-out below matches the derived one (8:01a + 8.75 h
// worked + 30 m break = 5:16 PM) so the audit note reconciles with the chip.
const AUDITS: Record<string, AuditNote> = {
  'w27:e-ruth:2': {
    editedBy: APPROVER,
    editedAt: '2026-07-02T16:12:00Z',
    change: 'Clock-out corrected from 11:58 PM to 5:16 PM',
    reason:
      'Forgot to clock out after the vendor walkthrough — verified against the badge-exit log.',
  },
};

// Approval fixture — prior week fully approved (locked); this week Grace
// and Tasha were approved Thu afternoon. Runtime approvals reuse the fixed
// "now" timestamp so the surface stays deterministic.
const INITIAL_APPROVALS: Record<string, {by: string; at: string}> = {
  'w26:e-ruth': {by: APPROVER, at: '2026-06-29T17:05:00Z'},
  'w26:e-miguel': {by: APPROVER, at: '2026-06-29T17:05:00Z'},
  'w26:e-hana': {by: APPROVER, at: '2026-06-29T17:06:00Z'},
  'w26:e-devon': {by: APPROVER, at: '2026-06-29T17:06:00Z'},
  'w26:e-grace': {by: APPROVER, at: '2026-06-29T17:07:00Z'},
  'w26:e-leo': {by: APPROVER, at: '2026-06-29T17:07:00Z'},
  'w26:e-tasha': {by: APPROVER, at: '2026-06-29T17:08:00Z'},
  'w26:e-omar': {by: APPROVER, at: '2026-06-29T17:09:00Z'},
  'w27:e-grace': {by: APPROVER, at: '2026-07-02T23:40:00Z'},
  'w27:e-tasha': {by: APPROVER, at: '2026-07-02T23:41:00Z'},
};

/** Fixed fixture "now" — used for approvals made during the session. */
const SESSION_NOW = '2026-07-03T16:45:00Z';

// ---------------------------------------------------------------------------
// ROW DERIVATION — clock-out and every total are computed from the specs,
// so the chips, the total column, the drawer, and the banner all agree.
// ---------------------------------------------------------------------------

function buildDay(week: WeekMeta, index: number, spec: DaySpec, auditKey: string): DayEntry {
  const base = {
    short: week.shortDays[index],
    long: week.longDays[index],
  };
  if (spec === null) {
    return {...base, inMin: null, outMin: null, breakMin: 0, workedMin: null};
  }
  const [inHM, workedMin, breakMin, exception, note] = spec;
  const inMin = parseHM(inHM);
  return {
    ...base,
    inMin,
    outMin: workedMin === null ? null : inMin + workedMin + breakMin,
    breakMin,
    workedMin,
    exception,
    note,
    audit: AUDITS[`${auditKey}:${index}`],
  };
}

function buildRows(week: WeekMeta): TimesheetRow[] {
  return EMPLOYEES.map(emp => {
    const specs = SHEET_SPECS[week.id][emp.id];
    const days = specs.map((spec, index) =>
      buildDay(week, index, spec, `${week.id}:${emp.id}`),
    );
    let totalMin = 0;
    let pendingDays = 0;
    let blockingCount = 0;
    let infoCount = 0;
    for (const day of days) {
      if (day.inMin !== null && day.workedMin === null) {
        pendingDays += 1;
      }
      totalMin += day.workedMin ?? 0;
      if (day.exception !== undefined) {
        if (BLOCKING[day.exception]) {
          blockingCount += 1;
        } else {
          infoCount += 1;
        }
      }
    }
    const regMin = Math.min(totalMin, 40 * 60);
    return {
      id: `${week.id}:${emp.id}`,
      empId: emp.id,
      name: emp.name,
      role: emp.role,
      office: emp.office,
      rate: emp.rate,
      days,
      totalMin,
      regMin,
      otMin: totalMin - regMin,
      pendingDays,
      blockingCount,
      infoCount,
    };
  });
}

// Rows per week are static fixtures — derive once at module level.
const ROWS_BY_WEEK: Record<WeekId, TimesheetRow[]> = {
  w26: buildRows(WEEKS[0]),
  w27: buildRows(WEEKS[1]),
};

type SheetStatus = 'approved' | 'attention' | 'pending';

function statusOf(row: TimesheetRow, isApproved: boolean): SheetStatus {
  if (isApproved) {
    return 'approved';
  }
  return row.blockingCount > 0 ? 'attention' : 'pending';
}

const STATUS_META: Record<SheetStatus, {label: string; color: 'green' | 'orange' | 'gray'}> = {
  approved: {label: 'Approved', color: 'green'},
  attention: {label: 'Needs attention', color: 'orange'},
  pending: {label: 'Pending', color: 'gray'},
};

// ---------------------------------------------------------------------------
// TABLE CELLS — punch chips with corner exception badges (tooltipped), the
// employee identity cell, the OT-aware total, and the status token.
// ---------------------------------------------------------------------------

function ExceptionBadge({kind, note}: {kind: ExceptionKind; note?: string}) {
  const meta = EXCEPTION_META[kind];
  return (
    <Tooltip content={note !== undefined ? `${meta.label} — ${note}` : meta.label}>
      <span style={{...styles.chipBadge, color: meta.color}}>
        <Icon icon={meta.icon} size="xsm" color="inherit" />
      </span>
    </Tooltip>
  );
}

function DayChip({day}: {day: DayEntry}) {
  if (day.inMin === null) {
    return (
      <div style={styles.dayChipOff} aria-label={`${day.long}: scheduled off`}>
        <Text type="supporting" color="secondary">
          Off
        </Text>
      </div>
    );
  }
  const isPending = day.workedMin === null;
  const tint =
    day.exception !== undefined
      ? {borderColor: EXCEPTION_META[day.exception].color}
      : null;
  return (
    <div style={{...styles.dayChip, ...tint}}>
      <span style={styles.chipTimes}>
        {fmtClockShort(day.inMin)}–{day.outMin !== null ? fmtClockShort(day.outMin) : '——'}
      </span>
      <span style={styles.chipHours}>
        {isPending ? 'pending' : `${fmtHours(day.workedMin ?? 0)} h`}
      </span>
      {day.exception !== undefined ? (
        <ExceptionBadge kind={day.exception} note={day.note ?? day.audit?.change} />
      ) : null}
    </div>
  );
}

function EmployeeCell({row}: {row: TimesheetRow}) {
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={row.name} size="small" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {row.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {row.role} · {row.office}
          </Text>
        </VStack>
      </StackItem>
    </HStack>
  );
}

/** Compact (<=1000px) replacement for the seven day columns. */
function WeekSummaryCell({row}: {row: TimesheetRow}) {
  const workedDays = row.days.filter(day => day.inMin !== null).length;
  const flaggedDays = row.days.filter(day => day.exception !== undefined);
  return (
    <HStack gap={2} vAlign="center">
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {workedDays} days
      </Text>
      {flaggedDays.map(day => (
        <Tooltip
          key={day.short}
          content={`${day.short}: ${EXCEPTION_META[day.exception as ExceptionKind].label}${
            day.note !== undefined ? ` — ${day.note}` : ''
          }`}>
          <span
            style={{
              ...styles.flagPill,
              color: EXCEPTION_META[day.exception as ExceptionKind].color,
            }}>
            <Icon
              icon={EXCEPTION_META[day.exception as ExceptionKind].icon}
              size="xsm"
              color="inherit"
            />
            {day.short.split(' ')[0]}
          </span>
        </Tooltip>
      ))}
    </HStack>
  );
}

function TotalCell({row}: {row: TimesheetRow}) {
  const isOvertime = row.totalMin > 40 * 60;
  return (
    <div style={styles.totalStack}>
      <Text
        type="label"
        hasTabularNumbers
        style={isOvertime ? {color: ACCENTS.amber} : undefined}>
        {fmtHours(row.totalMin)} h
      </Text>
      {isOvertime ? (
        <Text type="supporting" hasTabularNumbers style={{color: ACCENTS.amber}}>
          incl. {fmtHours(row.otMin)} OT
        </Text>
      ) : row.pendingDays > 0 ? (
        <Text type="supporting" hasTabularNumbers style={{color: ACCENTS.red}}>
          {row.pendingDays} day held
        </Text>
      ) : null}
    </div>
  );
}

function StatusCell({status}: {status: SheetStatus}) {
  const meta = STATUS_META[status];
  return <Token size="sm" color={meta.color} label={meta.label} />;
}

// ---------------------------------------------------------------------------
// COLUMNS — employee | 7 day-chip columns (or one compact Week column) |
// OT-aware total | status token.
// ---------------------------------------------------------------------------

function buildColumns(
  week: WeekMeta,
  isNarrow: boolean,
  statusById: Record<string, SheetStatus>,
): TableColumn<TimesheetRow>[] {
  const columns: TableColumn<TimesheetRow>[] = [
    {
      key: 'employee',
      header: 'Employee',
      width: proportional(1.4, {minWidth: 216}),
      sortable: {sortKey: 'name'},
      renderCell: (row: TimesheetRow) => <EmployeeCell row={row} />,
    },
  ];
  if (isNarrow) {
    columns.push({
      key: 'week',
      header: 'Week',
      width: proportional(1, {minWidth: 170}),
      renderCell: (row: TimesheetRow) => <WeekSummaryCell row={row} />,
    });
  } else {
    week.shortDays.forEach((short, index) => {
      columns.push({
        key: `day-${index}`,
        header: short,
        width: pixel(112),
        renderCell: (row: TimesheetRow) => (
          <div style={styles.dayCellPad}>
            <DayChip day={row.days[index]} />
          </div>
        ),
      });
    });
  }
  columns.push(
    {
      key: 'total',
      header: 'Total',
      align: 'end',
      width: pixel(104),
      sortable: {sortKey: 'total'},
      renderCell: (row: TimesheetRow) => <TotalCell row={row} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(148),
      sortable: {sortKey: 'status'},
      renderCell: (row: TimesheetRow) => (
        <StatusCell status={statusById[row.id]} />
      ),
    },
  );
  return columns;
}

// ---------------------------------------------------------------------------
// DETAIL DRAWER — punch list, audit + exception notes, OT/gross pay
// breakdown, approve/return actions.
// ---------------------------------------------------------------------------

function PunchList({row}: {row: TimesheetRow}) {
  return (
    <VStack gap={0}>
      {row.days.map(day => {
        const isPending = day.inMin !== null && day.workedMin === null;
        return (
          <div key={day.short} style={styles.punchRow}>
            <VStack gap={0} style={{minWidth: 0}}>
              <Text type="label" size="sm">
                {day.long}
              </Text>
              {day.inMin !== null ? (
                <span style={{...styles.punchTimes, color: 'var(--color-text-secondary)'}}>
                  {fmtClockLong(day.inMin)} –{' '}
                  {day.outMin !== null ? fmtClockLong(day.outMin) : '——'}
                  {day.breakMin > 0 ? ` · ${day.breakMin} m break` : ''}
                </span>
              ) : (
                <Text type="supporting" color="secondary">
                  Scheduled off
                </Text>
              )}
            </VStack>
            <HStack gap={1} vAlign="center">
              {day.exception !== undefined ? (
                <Tooltip content={EXCEPTION_META[day.exception].label}>
                  <span
                    style={{
                      display: 'inline-flex',
                      color: EXCEPTION_META[day.exception].color,
                    }}>
                    <Icon
                      icon={EXCEPTION_META[day.exception].icon}
                      size="xsm"
                      color="inherit"
                    />
                  </span>
                </Tooltip>
              ) : null}
              <Text
                type="body"
                hasTabularNumbers
                style={isPending ? {color: ACCENTS.red} : styles.numericCell}>
                {day.workedMin !== null
                  ? `${fmtHours(day.workedMin)} h`
                  : isPending
                    ? 'held'
                    : '—'}
              </Text>
            </HStack>
          </div>
        );
      })}
    </VStack>
  );
}

function TotalsTile({row}: {row: TimesheetRow}) {
  const regPay = (row.regMin / 60) * row.rate;
  const otPay = (row.otMin / 60) * row.rate * 1.5;
  const moneyStyle: CSSProperties = {minWidth: 84, textAlign: 'end'};
  return (
    <div style={styles.totalsTile}>
      <div style={styles.totalsRow}>
        <Text type="supporting" color="secondary" style={{flex: 1}}>
          Regular
        </Text>
        <Text type="body" hasTabularNumbers>
          {fmtHours(row.regMin)} h
        </Text>
        <Text type="body" hasTabularNumbers style={moneyStyle}>
          {fmtMoney(regPay)}
        </Text>
      </div>
      <div style={styles.totalsRow}>
        <Text type="supporting" color="secondary" style={{flex: 1}}>
          Overtime ×1.5
        </Text>
        <Text
          type="body"
          hasTabularNumbers
          style={row.otMin > 0 ? {color: ACCENTS.amber} : undefined}>
          {fmtHours(row.otMin)} h
        </Text>
        <Text
          type="body"
          hasTabularNumbers
          style={row.otMin > 0 ? {...moneyStyle, color: ACCENTS.amber} : moneyStyle}>
          {fmtMoney(otPay)}
        </Text>
      </div>
      <Divider />
      <div style={styles.totalsRow}>
        <Text type="label" size="sm" style={{flex: 1}}>
          Gross pay
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          at {fmtMoney(row.rate)}/h
        </Text>
        <Text type="label" hasTabularNumbers style={moneyStyle}>
          {fmtMoney(regPay + otPay)}
        </Text>
      </div>
    </div>
  );
}

interface DrawerProps {
  row: TimesheetRow | null;
  week: WeekMeta;
  approval: {by: string; at: string} | undefined;
  isReturned: boolean;
  onApprove: (row: TimesheetRow) => void;
  onReturn: (row: TimesheetRow) => void;
  onUndo: (row: TimesheetRow) => void;
  onClose: () => void;
}

function DetailDrawer({
  row,
  week,
  approval,
  isReturned,
  onApprove,
  onReturn,
  onUndo,
  onClose,
}: DrawerProps) {
  if (row === null) {
    return (
      <div style={styles.drawerScroll}>
        <EmptyState
          isCompact
          icon={<Icon icon={CalendarClockIcon} size="lg" />}
          title="No timesheet selected"
          description="Select a row to review punches, exceptions, and the pay breakdown."
        />
      </div>
    );
  }
  const auditDay = row.days.find(day => day.audit !== undefined);
  const blockingDays = row.days.filter(
    day => day.exception !== undefined && BLOCKING[day.exception],
  );
  return (
    <div style={styles.drawerFill}>
      <div style={styles.drawerHeader}>
        <HStack gap={2} vAlign="center">
          <Avatar name={row.name} size="medium" />
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <Heading level={3}>{row.name}</Heading>
              <Text type="supporting" color="secondary" maxLines={1}>
                {row.role} · {row.office}
              </Text>
            </VStack>
          </StackItem>
          <IconButton
            label="Close detail drawer"
            size="sm"
            variant="ghost"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClose}
          />
        </HStack>
      </div>
      <Divider />
      <div style={styles.drawerScroll}>
        <VStack gap={4}>
          {approval !== undefined ? (
            <Banner
              status="success"
              container="section"
              title={`Approved by ${approval.by}`}
              description={
                <Timestamp
                  value={approval.at}
                  format="date_time"
                  hasTooltip={false}
                />
              }
            />
          ) : null}
          {isReturned && approval === undefined ? (
            <Banner
              status="info"
              container="section"
              title={`Returned to ${firstName(row.name)}`}
              description="Waiting on a corrected punch before this sheet can be approved."
            />
          ) : null}

          {blockingDays.length > 0 ? (
            <div style={styles.exceptionNote}>
              <span
                style={{
                  display: 'inline-flex',
                  flexShrink: 0,
                  marginTop: 2,
                  color: ACCENTS.red,
                }}>
                <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
              </span>
              <VStack gap={1} style={{minWidth: 0}}>
                {blockingDays.map(day => (
                  <Text key={day.short} type="supporting">
                    <strong>{day.short}:</strong>{' '}
                    {EXCEPTION_META[day.exception as ExceptionKind].label}
                    {day.note !== undefined ? ` — ${day.note}` : ''}
                  </Text>
                ))}
                <Text type="supporting" color="secondary">
                  Blocking exceptions must be resolved before approval.
                </Text>
              </VStack>
            </div>
          ) : null}

          <VStack gap={1}>
            <Text type="label" size="sm" color="secondary">
              Punches — {week.label}
            </Text>
            <PunchList row={row} />
          </VStack>

          {auditDay?.audit !== undefined ? (
            <div style={styles.auditNote}>
              <span
                style={{
                  display: 'inline-flex',
                  flexShrink: 0,
                  marginTop: 2,
                  color: ACCENTS.blue,
                }}>
                <Icon icon={PencilLineIcon} size="sm" color="inherit" />
              </span>
              <VStack gap={0} style={{minWidth: 0}}>
                <Text type="label" size="sm">
                  Edited entry — {auditDay.short}
                </Text>
                <Text type="supporting" color="secondary">
                  {auditDay.audit.change}. {auditDay.audit.reason}
                </Text>
                <Text type="supporting" color="secondary">
                  by {auditDay.audit.editedBy} ·{' '}
                  <Timestamp
                    value={auditDay.audit.editedAt}
                    format="date_time"
                    hasTooltip={false}
                    type="supporting"
                    color="secondary"
                  />
                </Text>
              </VStack>
            </div>
          ) : null}

          <VStack gap={1}>
            <Text type="label" size="sm" color="secondary">
              Hours &amp; pay
            </Text>
            <TotalsTile row={row} />
            {row.pendingDays > 0 ? (
              <Text type="supporting" color="secondary">
                {row.pendingDays === 1 ? 'One day is' : `${row.pendingDays} days are`}{' '}
                held out of the totals until the missing punch is resolved.
              </Text>
            ) : null}
          </VStack>

          <MetadataList columns={1} label={{position: 'start', width: 96}}>
            <MetadataListItem label="Rate">
              <Text type="body" hasTabularNumbers>
                {fmtMoney(row.rate)} / h · OT ×1.5
              </Text>
            </MetadataListItem>
            <MetadataListItem label="Office">
              <HStack gap={1} vAlign="center">
                <Icon icon={MapPinIcon} size="xsm" color="secondary" />
                <Text type="body">{row.office}</Text>
              </HStack>
            </MetadataListItem>
            <MetadataListItem label="Pay week">
              <Text type="body" hasTabularNumbers>
                {week.label}
              </Text>
            </MetadataListItem>
            <MetadataListItem label="Approver">
              <Text type="body">{APPROVER} (you)</Text>
            </MetadataListItem>
          </MetadataList>
        </VStack>
      </div>

      {!week.isLocked ? (
        <>
          <Divider />
          <VStack gap={2} style={styles.drawerActions}>
            {approval === undefined ? (
              <HStack gap={2}>
                <StackItem size="fill">
                  <Button
                    label="Approve"
                    variant="primary"
                    size="sm"
                    style={{width: '100%'}}
                    isDisabled={row.blockingCount > 0}
                    icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
                    onClick={() => onApprove(row)}
                  />
                </StackItem>
                <StackItem size="fill">
                  <Button
                    label="Return"
                    variant="secondary"
                    size="sm"
                    style={{width: '100%'}}
                    tooltip={`Return to ${firstName(row.name)} for correction`}
                    icon={<Icon icon={SendHorizonalIcon} size="sm" />}
                    onClick={() => onReturn(row)}
                  />
                </StackItem>
              </HStack>
            ) : (
              <Button
                label="Undo approval"
                variant="ghost"
                size="sm"
                icon={<Icon icon={Undo2Icon} size="sm" />}
                onClick={() => onUndo(row)}
              />
            )}
            {row.blockingCount > 0 && approval === undefined ? (
              <Text type="supporting" color="secondary">
                Approval is blocked until the{' '}
                {row.blockingCount === 1 ? 'exception is' : 'exceptions are'}{' '}
                resolved — return the sheet for correction.
              </Text>
            ) : null}
          </VStack>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type StatusFilter = 'all' | SheetStatus;

const FILTER_OPTIONS: {value: StatusFilter; label: string}[] = [
  {value: 'all', label: 'All'},
  {value: 'attention', label: 'Needs attention'},
  {value: 'pending', label: 'Pending'},
  {value: 'approved', label: 'Approved'},
];

const STATUS_ORDER: Record<SheetStatus, number> = {
  attention: 0,
  pending: 1,
  approved: 2,
};

export default function HrTimeAttendanceTemplate() {
  const [weekIndex, setWeekIndex] = useState(
    WEEKS.findIndex(week => week.id === CURRENT_WEEK_ID),
  );
  const [approvals, setApprovals] = useState<Record<string, {by: string; at: string}>>(
    INITIAL_APPROVALS,
  );
  const [returnedIds, setReturnedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  // Ruth opens expanded so the audit note + OT breakdown are visible on
  // first paint.
  const [activeId, setActiveId] = useState<string | null>('w27:e-ruth');
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract (see file header).
  const isDrawerHidden = useMediaQuery('(max-width: 1240px)');
  const isNarrow = useMediaQuery('(max-width: 1000px)');

  const week = WEEKS[weekIndex];
  const rows = ROWS_BY_WEEK[week.id];

  const statusById = useMemo(() => {
    const map: Record<string, SheetStatus> = {};
    for (const row of rows) {
      map[row.id] = statusOf(row, approvals[row.id] !== undefined);
    }
    return map;
  }, [rows, approvals]);

  const approvedCount = rows.filter(row => statusById[row.id] === 'approved').length;
  const attentionCount = rows.filter(row => statusById[row.id] === 'attention').length;
  const pendingCount = rows.length - approvedCount - attentionCount;
  const weekTotalMin = rows.reduce((sum, row) => sum + row.totalMin, 0);
  const weekOtMin = rows.reduce((sum, row) => sum + row.otMin, 0);

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter(row => {
      if (filter !== 'all' && statusById[row.id] !== filter) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return `${row.name} ${row.role} ${row.office}`.toLowerCase().includes(needle);
    });
  }, [rows, filter, query, statusById]);

  // Sort plugin — needs-attention first by default.
  const {sortedData, sortConfig} = useTableSortableState<TimesheetRow>({
    data: visibleRows,
    defaultSort: [{sortKey: 'status', direction: 'ascending'}],
    comparators: {
      name: (a, b) => a.name.localeCompare(b.name),
      total: (a, b) => a.totalMin - b.totalMin,
      status: (a, b) => STATUS_ORDER[statusById[a.id]] - STATUS_ORDER[statusById[b.id]],
    },
  });
  const sortPlugin = useTableSortable<TimesheetRow>(sortConfig);

  // Selection plugin — locked or already-approved sheets never get a
  // checkbox; bulk approve additionally skips blocking exceptions.
  const {selectionConfig} = useTableSelectionState<TimesheetRow>({
    data: sortedData,
    idKey: 'id',
    getIsItemSelectable: row =>
      !week.isLocked && statusById[row.id] !== 'approved',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useTableSelection(selectionConfig);

  // Frozen-pane timesheet: identity pins left, total/status pin right, and
  // the seven day-chip columns scroll between them.
  const stickyPlugin = useTableStickyColumns<TimesheetRow>({
    startKeys: ['employee'],
    endKeys: isNarrow ? undefined : ['total'],
  });

  // Row-click plugin: clicking a row opens the detail drawer. The active
  // highlight is painted per-CELL (opaque tint + first-cell accent bar):
  // sticky cells carry their own opaque backgrounds, so a row-level inset
  // shadow would vanish behind them.
  const activePlugin = useMemo<TablePlugin<TimesheetRow>>(
    () => ({
      transformBodyRow: (props, item) => {
        const prevOnClick = props.htmlProps.onClick;
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            onClick: event => {
              prevOnClick?.(event);
              setActiveId(item.id);
            },
            'aria-selected': item.id === activeId || undefined,
            style: {...props.htmlProps.style, cursor: 'pointer'},
          },
        };
      },
      transformBodyCell: (props, _column, item, columnIndex) => {
        if (item.id !== activeId) {
          return props;
        }
        // Inset-shadow tint (not backgroundColor): it paints ABOVE the
        // sticky cells' own backgrounds and scroll-shadow gradients, so
        // the highlight stays continuous across pinned columns.
        const tint =
          'inset 0 0 0 999px color-mix(in srgb, var(--color-accent) 6%, transparent)';
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            style: {
              ...props.htmlProps.style,
              boxShadow:
                columnIndex === 0
                  ? `inset 2px 0 0 var(--color-accent), ${tint}`
                  : tint,
            },
          },
        };
      },
    }),
    [activeId],
  );

  const columns = useMemo(
    () => buildColumns(week, isNarrow, statusById),
    [week, isNarrow, statusById],
  );

  const selectedRows = sortedData.filter(row => selectedKeys.has(row.id));
  const selectedMin = selectedRows.reduce((sum, row) => sum + row.totalMin, 0);
  const eligibleRows = selectedRows.filter(row => row.blockingCount === 0);
  const skippedCount = selectedRows.length - eligibleRows.length;
  const activeRow = rows.find(row => row.id === activeId) ?? null;

  const goToWeek = (index: number) => {
    setWeekIndex(index);
    setSelectedKeys(new Set());
    setActiveId(null);
  };

  const approveSheets = (targets: TimesheetRow[]) => {
    const eligible = targets.filter(
      row => row.blockingCount === 0 && approvals[row.id] === undefined,
    );
    if (eligible.length === 0) {
      return;
    }
    setApprovals(prev => {
      const next = {...prev};
      for (const row of eligible) {
        next[row.id] = {by: APPROVER, at: SESSION_NOW};
      }
      return next;
    });
    setReturnedIds(prev => {
      const next = new Set(prev);
      for (const row of eligible) {
        next.delete(row.id);
      }
      return next;
    });
    setSelectedKeys(new Set());
    setAnnouncement(
      eligible.length === 1
        ? `Approved ${eligible[0].name}'s timesheet — ${fmtHours(eligible[0].totalMin)} hours`
        : `Approved ${eligible.length} timesheets`,
    );
  };

  const returnSheet = (row: TimesheetRow) => {
    setReturnedIds(prev => new Set(prev).add(row.id));
    setSelectedKeys(prev => {
      const next = new Set(prev);
      next.delete(row.id);
      return next;
    });
    setAnnouncement(`Returned ${row.name}'s timesheet for correction`);
  };

  const undoApproval = (row: TimesheetRow) => {
    setApprovals(prev => {
      const next = {...prev};
      delete next[row.id];
      return next;
    });
    setAnnouncement(`Approval removed from ${row.name}'s timesheet`);
  };

  // ----- header: brand, week selector, search, roster stat -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isNarrow ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={CalendarClockIcon} size="md" color="secondary" />
          <Heading level={1}>Time &amp; attendance</Heading>
          {!isNarrow ? (
            <Text type="supporting" color="secondary">
              Kestrel Labs · People Ops
            </Text>
          ) : null}
        </HStack>
        <HStack gap={1} vAlign="center">
          <IconButton
            label="Previous pay week"
            tooltip="Previous pay week"
            size="sm"
            variant="ghost"
            icon={<Icon icon={ChevronLeftIcon} size="sm" />}
            isDisabled={weekIndex === 0}
            onClick={() => goToWeek(weekIndex - 1)}
          />
          <div style={styles.weekLabel}>
            {week.isLocked ? (
              <Icon icon={LockIcon} size="xsm" color="secondary" />
            ) : null}
            <Text type="label" hasTabularNumbers>
              {week.label}
            </Text>
          </div>
          <IconButton
            label="Next pay week"
            tooltip="Next pay week"
            size="sm"
            variant="ghost"
            icon={<Icon icon={ChevronRightIcon} size="sm" />}
            isDisabled={weekIndex === WEEKS.length - 1}
            onClick={() => goToWeek(weekIndex + 1)}
          />
        </HStack>
        <StackItem size="fill">
          <TextInput
            label="Search timesheets"
            isLabelHidden
            size="sm"
            width="100%"
            style={{maxWidth: 360}}
            placeholder="Search name, role, or office…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        <HStack gap={1} vAlign="center">
          <Icon icon={UsersIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {rows.length} hourly · {approvedCount} approved
          </Text>
        </HStack>
      </HStack>
    </LayoutHeader>
  );

  // ----- pay-period lock banner -----
  const lockBanner = (
    <div style={styles.bannerWrap}>
      {week.isLocked ? (
        <Banner
          status="info"
          container="section"
          icon={<Icon icon={LockIcon} size="sm" color="inherit" />}
          title="Pay period locked"
          description={`Jun 22 – 28 closed on Mon, Jun 29 — all ${rows.length} timesheets approved and sent to payroll.`}
        />
      ) : (
        <Banner
          status="warning"
          container="section"
          icon={<Icon icon={LockIcon} size="sm" color="inherit" />}
          title="Pay period locks Monday, Jul 6 at 6:00 PM PT"
          description={`${approvedCount} of ${rows.length} timesheets approved · ${attentionCount} need attention · ${pendingCount} pending review.`}
        />
      )}
    </div>
  );

  // ----- content toolbar: status filter + week readout -----
  const contentToolbar = (
    <HStack gap={3} vAlign="center" style={styles.contentToolbar} wrap="wrap">
      <SegmentedControl
        label="Status filter"
        value={filter}
        onChange={value => setFilter(value as StatusFilter)}
        size="sm">
        {FILTER_OPTIONS.map(option => (
          <SegmentedControlItem
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </SegmentedControl>
      <StackItem size="fill" />
      <HStack gap={1} vAlign="center">
        <Icon icon={ClockIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {fmtHours(weekTotalMin)} h recorded · {fmtHours(weekOtMin)} h OT
        </Text>
      </HStack>
    </HStack>
  );

  // ----- bulk approve bar: appears while rows are checked -----
  const bulkBar =
    selectedRows.length === 0 ? null : (
      <div style={styles.bulkBar}>
        <Toolbar
          label="Bulk approval actions"
          size="sm"
          gap={2}
          variant="section"
          dividers={['top', 'bottom']}
          startContent={
            <HStack gap={2} vAlign="center">
              <Text type="label" hasTabularNumbers>
                {selectedRows.length} selected · {fmtHours(selectedMin)} h
              </Text>
              <Button
                label="Clear"
                variant="ghost"
                size="sm"
                icon={<Icon icon={XIcon} size="sm" />}
                onClick={() => setSelectedKeys(new Set())}
              />
            </HStack>
          }
          endContent={
            <HStack gap={2} vAlign="center">
              {skippedCount > 0 ? (
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {skippedCount} skipped — blocking exceptions
                </Text>
              ) : null}
              <Button
                label={`Approve ${eligibleRows.length}`}
                variant="primary"
                size="sm"
                isDisabled={eligibleRows.length === 0}
                icon={<Icon icon={CheckCheckIcon} size="sm" color="inherit" />}
                onClick={() => approveSheets(eligibleRows)}
              />
            </HStack>
          }
        />
      </div>
    );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              {lockBanner}
              {contentToolbar}
              {bulkBar}
              <div style={styles.tableScroll}>
                <Table<TimesheetRow>
                  data={sortedData}
                  columns={columns}
                  idKey="id"
                  density="balanced"
                  dividers="rows"
                  hasHover
                  plugins={{
                    selection: selectionPlugin,
                    sort: sortPlugin,
                    sticky: stickyPlugin,
                    active: activePlugin,
                  }}
                  emptyState={
                    <div style={styles.tableEmpty}>
                      <EmptyState
                        isCompact
                        icon={<Icon icon={SearchIcon} size="lg" />}
                        title={
                          query.trim().length > 0
                            ? 'No matching timesheets'
                            : 'Nothing under this filter'
                        }
                        description={
                          query.trim().length > 0
                            ? 'Try a different name, role, or office.'
                            : 'No timesheets have this status for the selected week.'
                        }
                      />
                    </div>
                  }
                />
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isDrawerHidden ? (
            <LayoutPanel width={340} padding={0} hasDivider label="Timesheet detail">
              <DetailDrawer
                row={activeRow}
                week={week}
                approval={activeRow !== null ? approvals[activeRow.id] : undefined}
                isReturned={activeRow !== null && returnedIds.has(activeRow.id)}
                onApprove={row => approveSheets([row])}
                onReturn={returnSheet}
                onUndo={undoApproval}
                onClose={() => setActiveId(null)}
              />
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
