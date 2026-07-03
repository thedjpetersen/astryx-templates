// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — one Kestrel Labs offboarding run
 *   (departing GTM account executive Nolan Reyes, last day Fri Jul 24 2026,
 *   fixture "today" Fri Jul 3 2026), a 12-item access-revocation checklist
 *   grouped by SSO apps / devices / badges with fixed ISO timestamps, two
 *   return-label asset rows, five knowledge-transfer tasks, and a final-pay
 *   breakdown whose lines sum to the printed total. No clocks, no
 *   randomness, no network media.
 * @output Offboarding & Access Revocation — the People-Ops runbook for one
 *   departing employee. A countdown header (last day, business days
 *   remaining, runbook-window progress); a 280px phase rail (per-phase
 *   done/total counts, overall progress, key dates, stakeholders); a main
 *   column with the access-revocation checklist (scheduled vs completed
 *   states, per-row Revoke now), an asset-return section (laptop + monitor
 *   with return-label steppers), and knowledge-transfer tasks with owners;
 *   a 320px end panel with the final-pay summary card (PTO payout, final
 *   paycheck date) and benefits wind-down; and an irreversible
 *   terminate-access-now strip that confirms via AlertDialog and completes
 *   every remaining revocation.
 * @position Page template; emitted by `astryx template hr-offboarding-flow`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (identity + countdown) | rail 280 (phases, dates, stakeholders)
 *   | content (checklist, assets, knowledge transfer — one scroller)
 *   | end panel 320 (final pay card, benefits, terminate strip).
 * Container policy: app-shell archetype — frame rows and panels; the only
 *   Card is the final-pay summary (a genuine summary widget). Checklist
 *   rows, asset tiles, and task rows are styled divs / frame rows.
 * Color policy: token-pure everywhere except (a) the repo-standard
 *   `light-dark()` fallback pairs on data-viz categorical tokens used for
 *   group glyphs, and (b) the destructive terminate strip + revoked/error
 *   accents, which use explicit `light-dark()` red pairs so the danger
 *   band reads in both schemes.
 *
 * Responsive contract:
 * - > 1240px: full three-region frame.
 * - <= 1240px: the end panel drops; the final-pay card, benefits list, and
 *   terminate strip re-mount at the bottom of the main column.
 * - <= 900px: the phase rail drops; a compact phase-chip strip renders
 *   under the content toolbar, and the header row wraps instead of
 *   clipping the countdown block.
 * - The rail, the main column, and the end panel each scroll independently
 *   (`minHeight: 0` down every flex chain); the header is pinned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  BanknoteIcon,
  CalendarClockIcon,
  CarIcon,
  CheckCircle2Icon,
  ClockIcon,
  CloudIcon,
  FileTextIcon,
  HandshakeIcon,
  IdCardIcon,
  KeyRoundIcon,
  LaptopIcon,
  LockIcon,
  LogOutIcon,
  MailIcon,
  MessageSquareIcon,
  MicIcon,
  MonitorIcon,
  MoonIcon,
  PackageIcon,
  SendIcon,
  ShieldOffIcon,
  TriangleAlertIcon,
  VideoIcon,
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
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  contentScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4) var(--spacing-5) var(--spacing-6)',
  },
  endScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  headerCountdown: {textAlign: 'end'},
  countdownBar: {width: 220, minWidth: 0},
  // Phase rail -------------------------------------------------------------
  phaseRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
  },
  phaseGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  phaseCount: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  phaseChipStrip: {display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  phaseChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Checklist ---------------------------------------------------------------
  section: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  accessRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    minHeight: 56,
  },
  accessRowDivider: {borderTop: 'var(--border-width) solid var(--color-border)'},
  systemGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  // Footgun: at demo width the main column is ~410px — a wide state cell
  // starves the system-label column into "Google Wo…" truncation. Keep the
  // cell narrow by stacking status / timestamp / action vertically.
  stateCell: {minWidth: 132, textAlign: 'end', flexShrink: 0},
  // Ghost buttons carry 12px side padding; pull the label back flush with
  // the right-aligned timestamp column above it.
  revokeButton: {marginInlineEnd: -12},
  stateLine: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  },
  revokedGlyph: {
    display: 'inline-flex',
    color: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  },
  scheduledGlyph: {display: 'inline-flex', color: 'var(--color-text-secondary)'},
  mono: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Assets -------------------------------------------------------------
  assetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-4)',
  },
  assetTile: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  assetStepper: {display: 'flex', alignItems: 'center', gap: 6},
  assetStep: {
    height: 4,
    flex: 1,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
  },
  assetStepDone: {
    backgroundColor: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  },
  // Knowledge transfer ---------------------------------------------------
  taskRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-2) var(--spacing-4)',
  },
  taskMeta: {flexShrink: 0, minWidth: 148, textAlign: 'end'},
  // Final pay / end panel --------------------------------------------------
  payLine: {display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-2)'},
  payAmount: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textAlign: 'end'},
  payTotalRule: {borderTop: 'var(--border-width) solid var(--color-border)', paddingTop: 'var(--spacing-2)'},
  // Destructive terminate strip — intentional literal light-dark() pair so
  // the danger band reads identically in both schemes (documented in the
  // header Color policy block).
  dangerStrip: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid light-dark(#FECACA, rgba(248, 113, 113, 0.4))',
    backgroundColor: 'light-dark(#FEF2F2, rgba(248, 113, 113, 0.08))',
  },
  dangerGlyph: {display: 'inline-flex', color: 'light-dark(#DC2626, #F87171)', flexShrink: 0, marginTop: 2},
  doneStrip: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
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
// carries the repo-standard `light-dark()` fallback pair.
const GROUP_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  red: 'light-dark(#DC2626, #F87171)',
} as const;

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs (140-person platform company), Workforce Platform
// suite world. One offboarding run: Nolan Reyes, Account Executive (GTM,
// SF HQ), voluntary resignation. Fixture "today" is Fri Jul 3 2026; last
// day is Fri Jul 24 2026 (15 business days out; runbook window Jul 1 →
// Jul 24 spans 18 business days, so today is day 3 of 18). Signed-in
// user: Dana Whitfield (People Ops), the runbook owner.
// ---------------------------------------------------------------------------

const CURRENT_USER = 'Dana Whitfield';

const EMPLOYEE = {
  name: 'Nolan Reyes',
  role: 'Account Executive',
  department: 'GTM',
  office: 'SF HQ',
  employeeId: 'KL-0087',
  email: 'nolan.reyes@kestrellabs.com',
  startDate: '2023-03-13T08:00:00Z',
  reason: 'Voluntary resignation',
  manager: 'Jonah Fields',
};

// Countdown fixtures — all derived from the fixed Jul 1 → Jul 24 window.
const COUNTDOWN = {
  lastDayLabel: 'Fri, Jul 24, 2026',
  lastDayIso: '2026-07-24T17:00:00Z',
  businessDaysLeft: 15,
  windowDay: 3,
  windowDays: 18,
  asOfLabel: 'as of Fri, Jul 3',
};

const KEY_DATES = [
  {id: 'notice', label: 'Notice given', value: 'Wed, Jul 1', detail: 'Opened by Dana Whitfield'},
  {id: 'lastday', label: 'Last day', value: 'Fri, Jul 24', detail: 'Access auto-revokes 6:00 PM PT'},
  {id: 'assets', label: 'Assets due back', value: 'Mon, Jul 27', detail: 'FedEx drop-off deadline'},
  {id: 'finalpay', label: 'Final paycheck', value: 'Fri, Jul 31', detail: 'Regular semi-monthly run'},
  {id: 'benefits', label: 'Benefits end', value: 'Fri, Jul 31', detail: 'COBRA packet mails by Aug 7'},
] as const;

const STAKEHOLDERS = [
  {name: 'Dana Whitfield', role: 'People Ops · runbook owner'},
  {name: 'Tom Okonkwo', role: 'IT admin · access & devices'},
  {name: 'Jonah Fields', role: 'GTM · manager of record'},
  {name: 'Elena Voss', role: 'Finance lead · final pay'},
] as const;

// ---- Access-revocation checklist ------------------------------------------
// 12 items across three groups; 7 SSO app seats (the same 7-seat figure the
// provisioning matrix and access review carry for this run) + 2 device
// grants + 3 badge/facility grants. 3 are already revoked as of Jul 3.

type AccessGroupId = 'sso' | 'device' | 'badge';

type AccessState =
  | {kind: 'completed'; at: string; by: string}
  | {kind: 'scheduled'; at: string; isAuto: boolean};

interface AccessItem {
  id: string;
  group: AccessGroupId;
  system: string;
  identifier: string;
  icon: typeof MailIcon;
  note?: string;
  state: AccessState;
}

const AUTO_REVOKE_AT = '2026-07-25T01:00:00Z'; // Jul 24, 6:00 PM PT
const BADGE_REVOKE_AT = '2026-07-25T01:30:00Z'; // Jul 24, 6:30 PM PT

const INITIAL_ACCESS: AccessItem[] = [
  // ---- SSO apps (7 seats) ----
  {id: 'a-gws', group: 'sso', system: 'Google Workspace', identifier: 'nolan.reyes@kestrellabs.com', icon: MailIcon,
    note: 'Mail forwards to Jonah · 30 days',
    state: {kind: 'scheduled', at: AUTO_REVOKE_AT, isAuto: true}},
  {id: 'a-slack', group: 'sso', system: 'Slack', identifier: '@nolan.reyes', icon: MessageSquareIcon,
    state: {kind: 'scheduled', at: AUTO_REVOKE_AT, isAuto: true}},
  {id: 'a-sfdc', group: 'sso', system: 'Salesforce', identifier: 'Seat reassigns to Maya Sundaram', icon: CloudIcon,
    note: 'Read-only since Jul 2 · handed off',
    state: {kind: 'scheduled', at: AUTO_REVOKE_AT, isAuto: true}},
  {id: 'a-gong', group: 'sso', system: 'Gong', identifier: 'Recordings moved to GTM library', icon: MicIcon,
    state: {kind: 'completed', at: '2026-07-02T17:30:00Z', by: 'Tom Okonkwo'}},
  {id: 'a-notion', group: 'sso', system: 'Notion', identifier: 'Workspace member seat', icon: FileTextIcon,
    state: {kind: 'scheduled', at: AUTO_REVOKE_AT, isAuto: true}},
  {id: 'a-zoom', group: 'sso', system: 'Zoom', identifier: 'Licensed seat returns to pool', icon: VideoIcon,
    state: {kind: 'scheduled', at: AUTO_REVOKE_AT, isAuto: true}},
  {id: 'a-outreach', group: 'sso', system: 'Outreach', identifier: 'Sequences paused, seat reclaimed', icon: SendIcon,
    state: {kind: 'completed', at: '2026-07-01T21:15:00Z', by: 'Tom Okonkwo'}},
  // ---- Devices (2 grants) ----
  {id: 'a-mdm', group: 'device', system: 'MDM unenroll + remote lock', identifier: 'MacBook Pro 14" · KL-MBP-0847', icon: LaptopIcon,
    note: 'Also in Asset return below',
    state: {kind: 'scheduled', at: AUTO_REVOKE_AT, isAuto: true}},
  {id: 'a-vpn', group: 'device', system: 'VPN profile revocation', identifier: 'WireGuard peer kl-sf-0087', icon: LockIcon,
    state: {kind: 'scheduled', at: AUTO_REVOKE_AT, isAuto: true}},
  // ---- Badges & facilities (3 grants) ----
  {id: 'a-hq', group: 'badge', system: 'SF HQ badge', identifier: 'Badge B-2214 · deactivate', icon: IdCardIcon,
    state: {kind: 'scheduled', at: BADGE_REVOKE_AT, isAuto: false}},
  {id: 'a-parking', group: 'badge', system: 'Parking garage fob', identifier: 'Fob P-118 · 5th & Brannan', icon: CarIcon,
    state: {kind: 'scheduled', at: BADGE_REVOKE_AT, isAuto: false}},
  {id: 'a-afterhours', group: 'badge', system: 'After-hours building access', identifier: 'Revoked early per policy', icon: MoonIcon,
    state: {kind: 'completed', at: '2026-07-01T22:00:00Z', by: 'Dana Whitfield'}},
];

interface AccessGroupMeta {
  id: AccessGroupId;
  label: string;
  icon: typeof KeyRoundIcon;
  color: string;
}

const ACCESS_GROUPS: AccessGroupMeta[] = [
  {id: 'sso', label: 'SSO apps', icon: KeyRoundIcon, color: GROUP_COLOR.blue},
  {id: 'device', label: 'Devices', icon: LaptopIcon, color: GROUP_COLOR.purple},
  {id: 'badge', label: 'Badges & facilities', icon: IdCardIcon, color: GROUP_COLOR.teal},
];

// Fixed action timestamps — per-row Revoke now and the terminate-all strip
// both stamp deterministic fixture times (Fri Jul 3, 9:41 / 9:45 AM PT).
const REVOKE_NOW_AT = '2026-07-03T16:41:00Z';
const TERMINATE_ALL_AT = '2026-07-03T16:45:00Z';

// ---- Asset return -----------------------------------------------------
// The laptop is the same enrolled device as the MDM row above (1 laptop
// reclaimed per run — matches the device-inventory fixture).

interface AssetRow {
  id: string;
  name: string;
  assetTag: string;
  serial: string;
  icon: typeof LaptopIcon;
  labelStatus: 'Label created' | 'Picked up' | 'Received';
  tracking: string;
  dueBack: string;
}

const ASSET_STEPS = ['Label created', 'Picked up', 'Received'] as const;

const ASSETS: AssetRow[] = [
  {id: 'as-laptop', name: 'MacBook Pro 14" (M3, 2024)', assetTag: 'KL-MBP-0847',
    serial: 'C02XK1AAJHCD', icon: LaptopIcon, labelStatus: 'Label created',
    tracking: 'FedEx 7712 8845 9021', dueBack: 'Mon, Jul 27'},
  {id: 'as-display', name: 'Studio Display 27"', assetTag: 'KL-DSP-0312',
    serial: 'H4TFK0Q2N7LM', icon: MonitorIcon, labelStatus: 'Label created',
    tracking: 'FedEx 7712 8845 9022', dueBack: 'Mon, Jul 27'},
];

// ---- Knowledge transfer -------------------------------------------------

interface TransferTask extends Record<string, unknown> {
  id: string;
  title: string;
  detail: string;
  owner: string;
  ownerRole: string;
  due: string;
  isDone: boolean;
  doneAt?: string;
}

const INITIAL_TASKS: TransferTask[] = [
  {id: 't-pipeline', title: 'Hand off active pipeline to Maya Sundaram',
    detail: '14 open opportunities · $612K weighted value', owner: 'Nolan Reyes',
    ownerRole: 'Departing AE', due: 'Thu, Jul 2', isDone: true, doneAt: '2026-07-02T16:40:00Z'},
  {id: 't-sfdc-owner', title: 'Transfer Salesforce account ownership',
    detail: '38 accounts re-assigned across the West pod', owner: 'Jonah Fields',
    ownerRole: 'GTM manager', due: 'Thu, Jul 2', isDone: true, doneAt: '2026-07-02T18:05:00Z'},
  {id: 't-gong', title: 'Record Gong walkthrough of top 5 accounts',
    detail: 'Renewal context for Halcyon, Northwind, Ferro, Baseline, Quill', owner: 'Nolan Reyes',
    ownerRole: 'Departing AE', due: 'Fri, Jul 17', isDone: false},
  {id: 't-territory', title: 'Update territory map and comp plan doc',
    detail: 'West pod split between Maya Sundaram and Leo Braun', owner: 'Jonah Fields',
    ownerRole: 'GTM manager', due: 'Wed, Jul 22', isDone: false},
  {id: 't-drive', title: 'Archive shared drive and reassign owned docs',
    detail: '61 files move to the GTM shared drive', owner: 'Dana Whitfield',
    ownerRole: 'People Ops', due: 'Fri, Jul 24', isDone: false},
];

// ---- Final pay -----------------------------------------------------------
// Base salary $148,000 → hourly $71.15 ($148,000 / 2080). Lines are fixed
// fixtures; the rendered total is computed with a reduce so the card can
// never drift from its own lines. 3,597.22 + 3,308.48 + 1,840.00 = 8,745.70.

interface PayLine {
  id: string;
  label: string;
  detail: string;
  amount: number;
}

const PAY_LINES: PayLine[] = [
  {id: 'p-salary', label: 'Prorated salary', detail: 'Jul 16–24 · 7 of 12 working days', amount: 3597.22},
  {id: 'p-pto', label: 'Remaining PTO payout', detail: '46.5 hrs × $71.15/hr', amount: 3308.48},
  {id: 'p-commission', label: 'Commission true-up', detail: 'June close · pending approval', amount: 1840.0},
];

const FINAL_PAY = {
  payDateLabel: 'Fri, Jul 31, 2026',
  method: 'Direct deposit ····4417',
  ptoHours: 46.5,
  hourlyRate: 71.15,
};

const BENEFITS_WINDDOWN = [
  {id: 'b-medical', label: 'Medical & dental', value: 'Coverage ends Jul 31'},
  {id: 'b-cobra', label: 'COBRA', value: 'Packet mails by Aug 7'},
  {id: 'b-401k', label: '401(k)', value: 'Contributions stop with final check'},
  {id: 'b-equity', label: 'Equity', value: '90-day exercise window from Jul 24'},
] as const;

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

function formatUsd(amount: number): string {
  return USD.format(amount);
}

type ChecklistFilter = 'all' | 'scheduled' | 'completed';

function matchesFilter(item: AccessItem, filter: ChecklistFilter): boolean {
  if (filter === 'all') {
    return true;
  }
  return item.state.kind === filter;
}

// ---------------------------------------------------------------------------
// ACCESS CHECKLIST — grouped rows with scheduled/completed state cells and a
// per-row Revoke now escape hatch on scheduled grants.
// ---------------------------------------------------------------------------

function AccessStateCell({
  item,
  onRevokeNow,
}: {
  item: AccessItem;
  onRevokeNow: (id: string) => void;
}) {
  if (item.state.kind === 'completed') {
    return (
      <VStack gap={0} hAlign="end" style={styles.stateCell}>
        <span style={styles.stateLine}>
          <span style={styles.revokedGlyph}>
            <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
          </span>
          <Text type="label" size="sm">
            Revoked
          </Text>
        </span>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          <Timestamp value={item.state.at} format="date_time" />
        </Text>
        <Text type="supporting" color="secondary">
          by {item.state.by}
        </Text>
      </VStack>
    );
  }
  return (
    <VStack gap={0} hAlign="end" style={styles.stateCell}>
      <span style={styles.stateLine}>
        <span style={styles.scheduledGlyph}>
          <Icon icon={CalendarClockIcon} size="sm" color="inherit" />
        </span>
        <Text type="label" size="sm" color="secondary">
          Scheduled
        </Text>
        {item.state.isAuto ? <Token size="sm" color="gray" label="Auto" /> : null}
      </span>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        <Timestamp value={item.state.at} format="date_time" />
      </Text>
      <Button
        label="Revoke now"
        variant="ghost"
        size="sm"
        style={styles.revokeButton}
        onClick={() => onRevokeNow(item.id)}
      />
    </VStack>
  );
}

function AccessRow({
  item,
  hasDivider,
  onRevokeNow,
}: {
  item: AccessItem;
  hasDivider: boolean;
  onRevokeNow: (id: string) => void;
}) {
  const group = ACCESS_GROUPS.find(entry => entry.id === item.group);
  return (
    <div
      style={
        hasDivider
          ? {...styles.accessRow, ...styles.accessRowDivider}
          : styles.accessRow
      }>
      <span style={{...styles.systemGlyph, color: group?.color}}>
        <Icon icon={item.icon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {item.system}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {item.identifier}
          </Text>
          {item.note !== undefined ? (
            <Text type="supporting" color="secondary" maxLines={1}>
              {item.note}
            </Text>
          ) : null}
        </VStack>
      </StackItem>
      <AccessStateCell item={item} onRevokeNow={onRevokeNow} />
    </div>
  );
}

function AccessChecklist({
  items,
  filter,
  onFilterChange,
  onRevokeNow,
}: {
  items: AccessItem[];
  filter: ChecklistFilter;
  onFilterChange: (filter: ChecklistFilter) => void;
  onRevokeNow: (id: string) => void;
}) {
  const completedCount = items.filter(
    item => item.state.kind === 'completed',
  ).length;
  return (
    <section style={styles.section} aria-label="Access revocation checklist">
      <div style={styles.sectionHeader}>
        <Icon icon={KeyRoundIcon} size="sm" color="secondary" />
        <Heading level={2}>Access revocation</Heading>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {completedCount} of {items.length} revoked
        </Text>
        <StackItem size="fill" />
        {/* Short labels only — they must fit one line at panel width. */}
        <SegmentedControl
          label="Filter access items"
          value={filter}
          onChange={value => onFilterChange(value as ChecklistFilter)}
          size="sm">
          <SegmentedControlItem label="All" value="all" />
          <SegmentedControlItem label="Scheduled" value="scheduled" />
          <SegmentedControlItem label="Revoked" value="completed" />
        </SegmentedControl>
      </div>
      {ACCESS_GROUPS.map(group => {
        const groupItems = items.filter(item => item.group === group.id);
        const groupDone = groupItems.filter(
          item => item.state.kind === 'completed',
        ).length;
        const visible = groupItems.filter(item => matchesFilter(item, filter));
        return (
          <div key={group.id}>
            <div style={styles.groupHeader}>
              <span style={{display: 'inline-flex', color: group.color}}>
                <Icon icon={group.icon} size="sm" color="inherit" />
              </span>
              <Text type="label" size="sm">
                {group.label}
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {groupDone} of {groupItems.length} revoked
              </Text>
            </div>
            {visible.length === 0 ? (
              <div style={styles.accessRow}>
                <Text type="supporting" color="secondary">
                  {filter === 'scheduled'
                    ? 'Nothing left to revoke in this group.'
                    : 'Nothing revoked in this group yet.'}
                </Text>
              </div>
            ) : (
              visible.map((item, index) => (
                <AccessRow
                  key={item.id}
                  item={item}
                  hasDivider={index > 0}
                  onRevokeNow={onRevokeNow}
                />
              ))
            )}
          </div>
        );
      })}
    </section>
  );
}

// ---------------------------------------------------------------------------
// ASSET RETURN — laptop + monitor tiles with a three-step return-label
// stepper (Label created → Picked up → Received).
// ---------------------------------------------------------------------------

function AssetTile({asset}: {asset: AssetRow}) {
  const stepIndex = ASSET_STEPS.indexOf(asset.labelStatus);
  return (
    <div style={styles.assetTile}>
      <HStack gap={2} vAlign="center">
        <span style={{...styles.systemGlyph, color: GROUP_COLOR.purple}}>
          <Icon icon={asset.icon} size="sm" color="inherit" />
        </span>
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {asset.name}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              <span style={styles.mono}>{asset.assetTag}</span> · SN{' '}
              <span style={styles.mono}>{asset.serial}</span>
            </Text>
          </VStack>
        </StackItem>
        <Badge variant="neutral" label={asset.labelStatus} />
      </HStack>
      <div style={styles.assetStepper} aria-hidden>
        {ASSET_STEPS.map((step, index) => (
          <span
            key={step}
            style={
              index <= stepIndex
                ? {...styles.assetStep, ...styles.assetStepDone}
                : styles.assetStep
            }
          />
        ))}
      </div>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="supporting" color="secondary" maxLines={1}>
            <span style={styles.mono}>{asset.tracking}</span>
          </Text>
        </StackItem>
        <Text type="supporting" color="secondary">
          Due back {asset.dueBack}
        </Text>
      </HStack>
    </div>
  );
}

function AssetSection() {
  return (
    <section style={styles.section} aria-label="Asset return">
      <div style={styles.sectionHeader}>
        <Icon icon={PackageIcon} size="sm" color="secondary" />
        <Heading level={2}>Asset return</Heading>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          0 of {ASSETS.length} received
        </Text>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary">
          Prepaid labels emailed Thu, Jul 2
        </Text>
      </div>
      <div style={styles.assetGrid}>
        {ASSETS.map(asset => (
          <AssetTile key={asset.id} asset={asset} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// KNOWLEDGE TRANSFER — owner-attributed tasks with working checkboxes; the
// rail phase counts derive from this state.
// ---------------------------------------------------------------------------

function TransferSection({
  tasks,
  onToggle,
}: {
  tasks: TransferTask[];
  onToggle: (id: string, done: boolean) => void;
}) {
  const doneCount = tasks.filter(task => task.isDone).length;
  return (
    <section style={styles.section} aria-label="Knowledge transfer">
      <div style={styles.sectionHeader}>
        <Icon icon={HandshakeIcon} size="sm" color="secondary" />
        <Heading level={2}>Knowledge transfer</Heading>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {doneCount} of {tasks.length} done
        </Text>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary">
          All tasks due by the last day
        </Text>
      </div>
      <Divider />
      <VStack gap={0}>
        {tasks.map((task, index) => (
          <div
            key={task.id}
            style={
              index > 0
                ? {...styles.taskRow, ...styles.accessRowDivider}
                : styles.taskRow
            }>
            <StackItem size="fill" style={{minWidth: 0}}>
              <CheckboxInput
                label={task.title}
                description={task.detail}
                value={task.isDone}
                onChange={checked => onToggle(task.id, checked)}
              />
            </StackItem>
            <VStack gap={0} hAlign="end" style={styles.taskMeta}>
              {/* Name before avatar so the avatars form a straight column
                  on the right edge of the meta cell. */}
              <HStack gap={1} vAlign="center">
                <Text type="supporting" maxLines={1}>
                  {task.owner}
                </Text>
                <Avatar name={task.owner} size="xsmall" />
              </HStack>
              <Text type="supporting" color="secondary" maxLines={1}>
                {task.ownerRole}
              </Text>
              {task.isDone && task.doneAt !== undefined ? (
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  Done <Timestamp value={task.doneAt} format="date" />
                </Text>
              ) : (
                <Text type="supporting" color="secondary">
                  Due {task.due}
                </Text>
              )}
            </VStack>
          </div>
        ))}
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FINAL PAY — the only Card on the page (genuine summary widget). The total
// is computed from the lines so the card can never disagree with itself.
// ---------------------------------------------------------------------------

function FinalPayCard() {
  const total = PAY_LINES.reduce((sum, line) => sum + line.amount, 0);
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={BanknoteIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={2}>Final pay</Heading>
          </StackItem>
          <Badge variant="info" label="Scheduled" />
        </HStack>
        <Text type="supporting" color="secondary">
          Pays {FINAL_PAY.payDateLabel} · {FINAL_PAY.method}
        </Text>
        <VStack gap={2}>
          {PAY_LINES.map(line => (
            <div key={line.id} style={styles.payLine}>
              <StackItem size="fill" style={{minWidth: 0}}>
                <VStack gap={0}>
                  <Text type="label" size="sm">
                    {line.label}
                  </Text>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {line.detail}
                  </Text>
                </VStack>
              </StackItem>
              <Text type="body" hasTabularNumbers style={styles.payAmount}>
                {formatUsd(line.amount)}
              </Text>
            </div>
          ))}
          <div style={{...styles.payLine, ...styles.payTotalRule}}>
            <StackItem size="fill">
              <Text type="label">Final gross pay</Text>
            </StackItem>
            <Text type="label" hasTabularNumbers style={styles.payAmount}>
              {formatUsd(total)}
            </Text>
          </div>
        </VStack>
        <Text type="supporting" color="secondary">
          Net pay finalizes after Finance approves the commission true-up.
        </Text>
      </VStack>
    </Card>
  );
}

function BenefitsWinddown() {
  return (
    <VStack gap={2}>
      <Text type="label" size="sm" color="secondary">
        Benefits wind-down
      </Text>
      <MetadataList columns={1} label={{position: 'start', width: 110}}>
        {BENEFITS_WINDDOWN.map(item => (
          <MetadataListItem key={item.id} label={item.label}>
            <Text type="body">{item.value}</Text>
          </MetadataListItem>
        ))}
      </MetadataList>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// TERMINATE STRIP — the irreversible action. Confirms via AlertDialog; once
// run, the strip swaps to a completed notice and every remaining grant is
// stamped revoked.
// ---------------------------------------------------------------------------

function TerminateStrip({
  remainingCount,
  terminatedAt,
  onRequestTerminate,
}: {
  remainingCount: number;
  terminatedAt: string | null;
  onRequestTerminate: () => void;
}) {
  if (terminatedAt !== null) {
    return (
      <div style={styles.doneStrip}>
        <span style={styles.revokedGlyph}>
          <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
        </span>
        <VStack gap={1}>
          <Text type="label" size="sm">
            All access terminated
          </Text>
          <Text type="supporting" color="secondary">
            Every grant was revoked{' '}
            <Timestamp value={terminatedAt} format="date_time" /> by{' '}
            {CURRENT_USER}. Asset return and final pay continue on schedule.
          </Text>
        </VStack>
      </div>
    );
  }
  return (
    <div style={styles.dangerStrip}>
      <span style={styles.dangerGlyph}>
        <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
      </span>
      <VStack gap={2}>
        <Text type="label" size="sm">
          Terminate access now
        </Text>
        <Text type="supporting" color="secondary">
          Immediately revokes the {remainingCount} remaining{' '}
          {remainingCount === 1 ? 'grant' : 'grants'}, locks the enrolled
          laptop, and deactivates badges — ahead of the scheduled Jul 24
          cutover. This cannot be undone.
        </Text>
        <HStack>
          <Button
            label="Terminate access now"
            variant="destructive"
            size="sm"
            icon={<Icon icon={ShieldOffIcon} size="sm" color="inherit" />}
            onClick={onRequestTerminate}
          />
        </HStack>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PHASE RAIL — per-phase done/total counts derived from live state, plus
// key dates and stakeholders. Compact viewports get the chip strip instead.
// ---------------------------------------------------------------------------

interface PhaseSummary {
  id: string;
  label: string;
  icon: typeof KeyRoundIcon;
  done: number;
  total: number;
  detail: string;
}

function buildPhases(
  access: AccessItem[],
  tasks: TransferTask[],
): PhaseSummary[] {
  const accessDone = access.filter(
    item => item.state.kind === 'completed',
  ).length;
  const tasksDone = tasks.filter(task => task.isDone).length;
  return [
    {id: 'access', label: 'Access revocation', icon: KeyRoundIcon,
      done: accessDone, total: access.length,
      detail: accessDone === access.length ? 'All grants revoked' : 'Auto-revokes Jul 24, 6 PM'},
    {id: 'assets', label: 'Asset return', icon: PackageIcon,
      done: 0, total: ASSETS.length, detail: 'Labels emailed · due Jul 27'},
    {id: 'transfer', label: 'Knowledge transfer', icon: HandshakeIcon,
      done: tasksDone, total: tasks.length, detail: 'All tasks due by Jul 24'},
    {id: 'pay', label: 'Final pay', icon: BanknoteIcon,
      done: 2, total: 3, detail: 'True-up pending Finance'},
  ];
}

function PhaseRail({phases}: {phases: PhaseSummary[]}) {
  const done = phases.reduce((sum, phase) => sum + phase.done, 0);
  const total = phases.reduce((sum, phase) => sum + phase.total, 0);
  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <VStack gap={4}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label" size="sm">
                  Runbook progress
                </Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {done} of {total}
              </Text>
            </HStack>
            {/* Footgun: ProgressBar enforces minWidth 48 — pin 0 so the
                280px rail can never blow out. */}
            <ProgressBar
              label="Runbook items complete"
              isLabelHidden
              value={done}
              max={total}
              variant="neutral"
              style={{minWidth: 0}}
            />
          </VStack>
          <VStack gap={1}>
            {phases.map(phase => (
              <div key={phase.id} style={styles.phaseRow}>
                <span style={styles.phaseGlyph}>
                  <Icon icon={phase.icon} size="sm" color="secondary" />
                </span>
                <StackItem size="fill" style={{minWidth: 0}}>
                  <VStack gap={0}>
                    <Text type="label" size="sm" maxLines={1}>
                      {phase.label}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {phase.detail}
                    </Text>
                  </VStack>
                </StackItem>
                <Text
                  type="supporting"
                  color="secondary"
                  hasTabularNumbers
                  style={styles.phaseCount}>
                  {phase.done}/{phase.total}
                </Text>
              </div>
            ))}
          </VStack>
          <Divider />
          <VStack gap={2}>
            <Text type="label" size="sm" color="secondary">
              Key dates
            </Text>
            {KEY_DATES.map(date => (
              <HStack key={date.id} gap={2} vAlign="center">
                <StackItem size="fill" style={{minWidth: 0}}>
                  <VStack gap={0}>
                    <Text type="label" size="sm" maxLines={1}>
                      {date.label}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {date.detail}
                    </Text>
                  </VStack>
                </StackItem>
                <Text type="supporting" hasTabularNumbers style={styles.phaseCount}>
                  {date.value}
                </Text>
              </HStack>
            ))}
          </VStack>
          <Divider />
          <VStack gap={2}>
            <Text type="label" size="sm" color="secondary">
              Stakeholders
            </Text>
            {STAKEHOLDERS.map(person => (
              <HStack key={person.name} gap={2} vAlign="center">
                <Avatar name={person.name} size="small" />
                <StackItem size="fill" style={{minWidth: 0}}>
                  <VStack gap={0}>
                    <Text type="body" maxLines={1}>
                      {person.name}
                      {person.name === CURRENT_USER ? ' (you)' : ''}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {person.role}
                    </Text>
                  </VStack>
                </StackItem>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </div>
    </div>
  );
}

function PhaseChipStrip({phases}: {phases: PhaseSummary[]}) {
  return (
    <div style={styles.phaseChipStrip}>
      {phases.map(phase => (
        <span key={phase.id} style={styles.phaseChip}>
          <Icon icon={phase.icon} size="xsm" color="inherit" />
          {phase.label} {phase.done}/{phase.total}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// END PANEL — final pay + benefits + terminate strip. Re-mounts at the
// bottom of the main column when the end panel is dropped (<=1240px).
// ---------------------------------------------------------------------------

function PaySidebar({
  remainingCount,
  terminatedAt,
  onRequestTerminate,
}: {
  remainingCount: number;
  terminatedAt: string | null;
  onRequestTerminate: () => void;
}) {
  return (
    <VStack gap={4}>
      <FinalPayCard />
      <BenefitsWinddown />
      <Divider />
      <TerminateStrip
        remainingCount={remainingCount}
        terminatedAt={terminatedAt}
        onRequestTerminate={onRequestTerminate}
      />
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function HrOffboardingFlowTemplate() {
  const toast = useToast();
  const [access, setAccess] = useState<AccessItem[]>(INITIAL_ACCESS);
  const [tasks, setTasks] = useState<TransferTask[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<ChecklistFilter>('all');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [terminatedAt, setTerminatedAt] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1240px drops the end panel (sidebar re-mounts
  // below the main column); <=900px drops the rail for the chip strip.
  const isSidebarInline = useMediaQuery('(max-width: 1240px)');
  const isCompact = useMediaQuery('(max-width: 900px)');

  const phases = useMemo(() => buildPhases(access, tasks), [access, tasks]);
  const remaining = access.filter(item => item.state.kind === 'scheduled');
  const remainingCount = remaining.length;

  const revokeNow = (id: string) => {
    const item = access.find(entry => entry.id === id);
    setAccess(prev =>
      prev.map(entry =>
        entry.id === id && entry.state.kind === 'scheduled'
          ? {...entry, state: {kind: 'completed', at: REVOKE_NOW_AT, by: CURRENT_USER}}
          : entry,
      ),
    );
    if (item !== undefined) {
      setAnnouncement(`${item.system} access revoked`);
      toast({body: `${item.system} access revoked`});
    }
  };

  const terminateAll = () => {
    setAccess(prev =>
      prev.map(entry =>
        entry.state.kind === 'scheduled'
          ? {...entry, state: {kind: 'completed', at: TERMINATE_ALL_AT, by: CURRENT_USER}}
          : entry,
      ),
    );
    setTerminatedAt(TERMINATE_ALL_AT);
    setIsConfirmOpen(false);
    setAnnouncement(
      `All access terminated — ${remainingCount} grants revoked`,
    );
    toast({
      body: `All access terminated — ${remainingCount} ${
        remainingCount === 1 ? 'grant' : 'grants'
      } revoked`,
    });
  };

  const toggleTask = (id: string, done: boolean) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {...task, isDone: done, doneAt: done ? REVOKE_NOW_AT : undefined}
          : task,
      ),
    );
  };

  // ----- header: identity + status + countdown -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={4} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={3} vAlign="center">
          <Icon icon={LogOutIcon} size="md" color="secondary" />
          <VStack gap={0}>
            <HStack gap={2} vAlign="center">
              <Heading level={1}>Offboarding — {EMPLOYEE.name}</Heading>
              {terminatedAt !== null ? (
                <Badge variant="error" label="Access terminated" />
              ) : (
                <Badge variant="warning" label="In progress" />
              )}
            </HStack>
            <Text type="supporting" color="secondary">
              {EMPLOYEE.role} · {EMPLOYEE.department} · {EMPLOYEE.office} ·{' '}
              <span style={styles.mono}>{EMPLOYEE.employeeId}</span> ·{' '}
              {EMPLOYEE.reason}
            </Text>
          </VStack>
        </HStack>
        <StackItem size="fill" />
        <HStack gap={3} vAlign="center">
          <Avatar name={EMPLOYEE.name} size="medium" />
          <VStack gap={1} style={styles.headerCountdown}>
            <HStack gap={2} vAlign="center" hAlign="end">
              <Icon icon={ClockIcon} size="sm" color="secondary" />
              <Text type="label" hasTabularNumbers>
                Last day {COUNTDOWN.lastDayLabel}
              </Text>
            </HStack>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {COUNTDOWN.businessDaysLeft} business days remaining · day{' '}
              {COUNTDOWN.windowDay} of {COUNTDOWN.windowDays} (
              {COUNTDOWN.asOfLabel})
            </Text>
            <ProgressBar
              label="Offboarding window elapsed"
              isLabelHidden
              value={COUNTDOWN.windowDay}
              max={COUNTDOWN.windowDays}
              variant="neutral"
              style={styles.countdownBar}
            />
          </VStack>
        </HStack>
      </HStack>
    </LayoutHeader>
  );

  const mainColumn = (
    <div style={styles.contentScroll}>
      <VStack gap={4}>
        {isCompact ? <PhaseChipStrip phases={phases} /> : null}
        {terminatedAt !== null ? (
          <div style={styles.doneStrip}>
            <span style={styles.revokedGlyph}>
              <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
            </span>
            <Text type="supporting" color="secondary">
              Access was terminated early on{' '}
              <Timestamp value={terminatedAt} format="date_time" />. The Jul
              24 scheduled cutover no longer applies.
            </Text>
          </div>
        ) : null}
        <AccessChecklist
          items={access}
          filter={filter}
          onFilterChange={setFilter}
          onRevokeNow={revokeNow}
        />
        <AssetSection />
        <TransferSection tasks={tasks} onToggle={toggleTask} />
        {isSidebarInline ? (
          <PaySidebar
            remainingCount={remainingCount}
            terminatedAt={terminatedAt}
            onRequestTerminate={() => setIsConfirmOpen(true)}
          />
        ) : null}
      </VStack>
    </div>
  );

  return (
    <div style={styles.root}>
      <div aria-live="polite" style={styles.visuallyHidden}>
        {announcement}
      </div>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel
              width={280}
              padding={0}
              hasDivider
              label="Runbook overview">
              <PhaseRail phases={phases} />
            </LayoutPanel>
          )
        }
        content={<LayoutContent padding={0}>{mainColumn}</LayoutContent>}
        end={
          isSidebarInline ? undefined : (
            <LayoutPanel
              width={320}
              padding={0}
              hasDivider
              label="Final pay and irreversible actions">
              <div style={styles.endScroll}>
                <PaySidebar
                  remainingCount={remainingCount}
                  terminatedAt={terminatedAt}
                  onRequestTerminate={() => setIsConfirmOpen(true)}
                />
              </div>
            </LayoutPanel>
          )
        }
      />
      <AlertDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={`Terminate all access for ${EMPLOYEE.name}?`}
        description={`This immediately revokes the ${remainingCount} remaining ${
          remainingCount === 1 ? 'grant' : 'grants'
        } (SSO seats, device enrollment, badges), locks ${
          EMPLOYEE.name
        }'s enrolled laptop, and cannot be undone. Asset return and final pay are not affected.`}
        actionLabel="Terminate access"
        actionVariant="destructive"
        cancelLabel="Keep Jul 24 schedule"
        onAction={terminateAll}
      />
    </div>
  );
}
