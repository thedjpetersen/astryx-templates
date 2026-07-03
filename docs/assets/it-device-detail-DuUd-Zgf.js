var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — one Kestrel Labs endpoint record:
 *   asset KL-MBP-0147 (MacBook Pro 16" M4 Pro, SN C02XK9AKMD6R, 48 GB /
 *   1 TB, macOS 15.5) assigned to Marcus Webb (Platform Lead, Engineering,
 *   SF HQ) on 2025-10-20 — the same asset row the HR employee-profile
 *   surface links to. Storage segments sum to 612.4 GB used of 1 TB; a
 *   4-check compliance posture with exactly one failing check (EDR agent
 *   24.2.1 below the 25.1.0 minimum, flagged 2026-06-27); 12 installed
 *   apps (8 managed, 4 self-installed); a 5-event lifecycle timeline; and
 *   AppleCare+ coverage 2025-10-20 → 2028-10-20. Fixed ISO timestamps in
 *   July 2026; no clocks, randomness, or network media.
 * @output Device Detail & Remote Actions — the IT-admin drill-down for a
 *   single employee endpoint in the Kestrel Labs workforce platform. A
 *   breadcrumbed header (IT / Devices / KL-MBP-0147) with a sync action;
 *   an identity band (device glyph, model, managed/supervised Tokens,
 *   posture chips); a warning Banner for the one failing compliance check
 *   with a "Push agent update" remediation CTA that queues in place; a
 *   hardware spec MetadataList beside a segmented storage-usage bar with
 *   legend; a 4-row compliance checklist (FileVault, screen lock, OS
 *   version, EDR agent) with pass/fail StatusDots and per-check evidence;
 *   a filterable installed-apps Table (search + Managed/Self-installed
 *   SegmentedControl, version column with update chips, managed-source
 *   Badges); and a lifecycle timeline from PO receipt through the
 *   compliance flag. An end rail pins remote actions (Lock, Restart, and
 *   a destructive Wipe with confirm Dialog + required-reason field —
 *   every action queues with an aria-live announcement), the assigned-to
 *   card, attached peripherals, and an AppleCare warranty card with a
 *   coverage-elapsed meter.
 * @position Page template; emitted by \`astryx template it-device-detail\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (breadcrumbs + sync/actions) | content (identity band, warning
 *   banner, four sections in one scroll column, maxWidth 880) | end panel
 *   320 (remote actions, assignee, peripherals, warranty; sticky, scrolls
 *   independently).
 * Container policy: record-detail archetype — page chrome and the four
 *   content sections are frame-first rows; Cards only for the bounded
 *   rail widgets (remote actions, assignee, peripherals, warranty), per
 *   hr-employee-profile. Checklist rows, spec grid, storage bar, and
 *   timeline entries are styled divs so the record reads as one document.
 * Color policy: token-pure everywhere except the repo-standard
 *   \`light-dark()\` fallback pairs on data-viz categorical tokens (storage
 *   segments, timeline markers) and the failing-check tint, which uses an
 *   explicit light-dark pair so the row reads as a warning wash in both
 *   schemes.
 *
 * Responsive contract:
 * - > 1100px: content column + end rail 320; rail is sticky and scrolls
 *   independently.
 * - <= 1100px: the rail drops and its four cards re-render at the bottom
 *   of the content column (remote actions stay reachable; nothing is
 *   lost silently).
 * - <= 760px: identity band wraps under the device glyph; the apps table
 *   drops the Last-updated column; spec grid and storage legend stack to
 *   one column; timeline dates move above each entry.
 * - The content column is the only vertical scroller besides the rail
 *   (\`minHeight: 0\` down the flex chain).
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  AppWindowIcon,
  BatteryChargingIcon,
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  KeyRoundIcon,
  LaptopIcon,
  LockIcon,
  MonitorIcon,
  PowerIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  TimerIcon,
  Trash2Icon,
  UsbIcon,
  WifiIcon,
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
import {Banner} from '@astryxdesign/core/Banner';
import {BreadcrumbItem, Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  headerBar: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)',
    flexWrap: 'wrap', width: '100%',
  },
  contentScroll: {
    height: '100%', overflowY: 'auto', minHeight: 0,
    padding: 'var(--spacing-5) var(--spacing-6)',
  },
  contentColumn: {
    maxWidth: 880, marginInline: 'auto', display: 'flex',
    flexDirection: 'column', gap: 'var(--spacing-6)',
  },
  // Identity band -----------------------------------------------------------
  deviceGlyph: {
    width: 64, height: 64, borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 9px',
    borderRadius: 999, border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)', fontSize: 12, whiteSpace: 'nowrap',
  },
  chipRow: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)'},
  // Sections ----------------------------------------------------------------
  section: {display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)'},
  sectionHead: {
    display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
  },
  // Spec grid + storage -----------------------------------------------------
  specGrid: {
    display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
    gap: 'var(--spacing-5)', alignItems: 'start',
  },
  specGridCompact: {gridTemplateColumns: 'minmax(0, 1fr)'},
  storageBar: {
    display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
  },
  storageSegment: {height: '100%'},
  storageFree: {backgroundColor: 'var(--color-background-muted)'},
  legendRow: {
    display: 'flex', alignItems: 'center', gap: 8, minWidth: 0,
  },
  legendSwatch: {
    width: 10, height: 10, borderRadius: 3, flexShrink: 0,
  },
  legendGrid: {
    display: 'grid', gridTemplateColumns: '1fr', gap: 6,
  },
  // Compliance checklist ----------------------------------------------------
  checkRow: {
    display: 'flex', gap: 'var(--spacing-3)', alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
  },
  checkRowFailing: {
    borderColor: 'light-dark(#E8A13C, #B97F2A)',
    backgroundColor: 'light-dark(#FDF6EA, rgba(185, 127, 42, 0.12))',
  },
  checkIconWell: {
    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Apps table --------------------------------------------------------------
  appsToolbar: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  appMonogram: {
    width: 26, height: 26, borderRadius: 7, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: '#FFFFFF',
  },
  versionText: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', fontSize: 12,
  },
  tableEmpty: {padding: 'var(--spacing-6)'},
  // Timeline ----------------------------------------------------------------
  timelineRow: {display: 'flex', gap: 'var(--spacing-3)', alignItems: 'stretch'},
  timelineDate: {width: 92, flexShrink: 0, paddingTop: 2, textAlign: 'end'},
  timelineSpine: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    width: 16, flexShrink: 0,
  },
  timelineDot: {
    width: 10, height: 10, borderRadius: 999, marginTop: 5, flexShrink: 0,
    backgroundColor: 'var(--color-border)',
  },
  timelineLine: {
    width: 2, flex: 1, backgroundColor: 'var(--color-border)', marginTop: 4,
  },
  timelineBody: {flex: 1, minWidth: 0, paddingBottom: 'var(--spacing-4)'},
  // End rail ----------------------------------------------------------------
  railScroll: {
    position: 'sticky', insetBlockStart: 0, maxHeight: '100%',
    overflowY: 'auto', padding: 'var(--spacing-4) var(--spacing-3)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)',
  },
  inlineRailGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 'var(--spacing-3)',
  },
  queuedNote: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 10px', borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  visuallyHidden: {
    position: 'absolute', width: 1, height: 1, margin: -1, padding: 0,
    overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
    border: 0,
  },
  wipeSummary: {
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  dialogBody: {padding: 'var(--spacing-1)'},
};

// ---------------------------------------------------------------------------
// TOKENS — repo-standard data-viz categorical fallbacks (calendar-month-grid)
// ---------------------------------------------------------------------------

const CAT_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const CAT_PURPLE = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const CAT_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const CAT_ORANGE = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const CAT_TEAL = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';

// ---------------------------------------------------------------------------
// FIXTURES — asset KL-MBP-0147, the same row hr-employee-profile links to.
// All timestamps fixed ISO; "today" for the demo narrative is 2026-07-03.
// ---------------------------------------------------------------------------

const DEVICE = {
  assetTag: 'KL-MBP-0147',
  model: 'MacBook Pro 16" (2025)',
  modelId: 'Mac16,7',
  chip: 'Apple M4 Pro (14-core CPU, 20-core GPU)',
  ram: '48 GB unified memory',
  serial: 'C02XK9AKMD6R',
  os: 'macOS 15.5 (24F74)',
  hostname: 'kl-mbp-0147.corp.kestrel.dev',
  lastIp: '10.24.8.117 (SF HQ — Wi-Fi)',
  batteryCycles: 118,
  batteryHealth: 94,
  enrolledVia: 'Apple Business Manager — zero-touch',
  mdmProfile: 'Kestrel Endpoint Baseline v3.2',
  supervision: 'Supervised · Activation Lock on',
  lastCheckIn: '2026-07-03T07:42:00Z',
  assignedAt: '2025-10-20',
  assignee: {
    name: 'Marcus Webb',
    role: 'Platform Lead',
    department: 'Engineering',
    office: 'SF HQ',
    employeeId: 'KL-0034',
  },
};

// Storage — segments sum to 612.4 GB used of a 1 TB (1000 GB) drive.
const STORAGE = {
  totalGb: 1000,
  segments: [
    {id: 'system', label: 'System & macOS', gb: 31.2, color: CAT_TEAL},
    {id: 'apps', label: 'Applications', gb: 84.6, color: CAT_PURPLE},
    {id: 'user', label: 'User data', gb: 466.1, color: CAT_BLUE},
    {id: 'other', label: 'Other & caches', gb: 30.5, color: CAT_ORANGE},
  ],
};
const STORAGE_USED_GB = STORAGE.segments.reduce((sum, s) => sum + s.gb, 0);

interface ComplianceCheck {
  id: string;
  label: string;
  icon: typeof LockIcon;
  status: 'pass' | 'fail';
  value: string;
  requirement: string;
  detail: string;
  flaggedAt?: string;
  remediationLabel?: string;
}

// Exactly one failing check. FileVault/OS values match the posture chips on
// the hr-employee-profile laptop card (FileVault on, macOS 15.5 compliant).
const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  {
    id: 'filevault',
    label: 'FileVault disk encryption',
    icon: LockIcon,
    status: 'pass',
    value: 'On — XTS-AES-128',
    requirement: 'Required on all laptops',
    detail: 'Enabled at enrollment on Oct 20, 2025. Recovery key escrowed to MDM.',
  },
  {
    id: 'screenlock',
    label: 'Screen lock',
    icon: TimerIcon,
    status: 'pass',
    value: 'Locks after 2 min idle',
    requirement: 'Must lock within 5 min',
    detail: 'Password + Touch ID required immediately after sleep or screen saver.',
  },
  {
    id: 'os',
    label: 'OS version',
    icon: CheckIcon,
    status: 'pass',
    value: 'macOS 15.5 (24F74)',
    requirement: 'Minimum macOS 15.4',
    detail: 'Updated 15.4 → 15.5 via MDM on May 14, 2026. Deferral window: 14 days.',
  },
  {
    id: 'edr',
    label: 'EDR agent',
    icon: ShieldAlertIcon,
    status: 'fail',
    value: 'SentinelOne 24.2.1',
    requirement: 'Minimum 25.1.0',
    detail:
      'Agent is running and reporting, but the installed build predates the 25.1.0 sensor baseline. Push the managed update to clear the flag.',
    flaggedAt: '2026-06-27T14:05:00Z',
    remediationLabel: 'Push agent update',
  },
];
const PASSING_CHECKS = COMPLIANCE_CHECKS.filter(c => c.status === 'pass').length;
const FAILING_CHECK = COMPLIANCE_CHECKS.find(c => c.status === 'fail');

interface InstalledApp extends Record<string, unknown> {
  id: string;
  name: string;
  monogram: string;
  tint: string;
  version: string;
  managed: boolean;
  source: string;
  updatedAt: string;
  updateAvailable?: string;
  belowMinimum?: boolean;
}

// 12 installed apps — 8 managed (MDM-pushed), 4 self-installed.
const INSTALLED_APPS: InstalledApp[] = [
  {id: 'chrome', name: 'Google Chrome', monogram: 'GC', tint: 'light-dark(#0171E3, #4C9EFF)',
    version: '138.0.7204.93', managed: true, source: 'MDM · Browsers', updatedAt: '2026-06-30T03:12:00Z'},
  {id: 'slack', name: 'Slack', monogram: 'Sl', tint: 'light-dark(#6B1EFD, #9D6BFF)',
    version: '4.44.65', managed: true, source: 'MDM · Collaboration', updatedAt: '2026-06-24T02:40:00Z',
    updateAvailable: '4.45.60'},
  {id: 'zoom', name: 'Zoom Workplace', monogram: 'Zm', tint: 'light-dark(#0171E3, #4C9EFF)',
    version: '6.5.3', managed: true, source: 'MDM · Collaboration', updatedAt: '2026-06-18T02:05:00Z'},
  {id: 'onepw', name: '1Password', monogram: '1P', tint: 'light-dark(#0E7E8B, #33B8C7)',
    version: '8.10.82', managed: true, source: 'MDM · Security', updatedAt: '2026-06-26T01:58:00Z'},
  {id: 's1', name: 'SentinelOne Agent', monogram: 'S1', tint: 'light-dark(#EB6E00, #FF9330)',
    version: '24.2.1', managed: true, source: 'MDM · Security', updatedAt: '2026-02-11T04:20:00Z',
    updateAvailable: '25.1.2', belowMinimum: true},
  {id: 'figma', name: 'Figma', monogram: 'Fg', tint: 'light-dark(#6B1EFD, #9D6BFF)',
    version: '125.6.5', managed: true, source: 'MDM · Design', updatedAt: '2026-06-29T02:22:00Z'},
  {id: 'notion', name: 'Notion', monogram: 'No', tint: 'light-dark(#333333, #B8B8B8)',
    version: '4.12.0', managed: true, source: 'MDM · Collaboration', updatedAt: '2026-06-21T02:15:00Z'},
  {id: 'tailscale', name: 'Tailscale', monogram: 'Ts', tint: 'light-dark(#0B991F, #34C759)',
    version: '1.86.2', managed: true, source: 'MDM · Networking', updatedAt: '2026-06-15T01:47:00Z'},
  {id: 'vscode', name: 'Visual Studio Code', monogram: 'VS', tint: 'light-dark(#0171E3, #4C9EFF)',
    version: '1.101.2', managed: false, source: 'Self-installed', updatedAt: '2026-06-27T18:31:00Z'},
  {id: 'docker', name: 'Docker Desktop', monogram: 'Dk', tint: 'light-dark(#0E7E8B, #33B8C7)',
    version: '4.42.1', managed: false, source: 'Self-installed', updatedAt: '2026-06-12T20:04:00Z',
    updateAvailable: '4.43.0'},
  {id: 'iterm', name: 'iTerm2', monogram: 'iT', tint: 'light-dark(#333333, #B8B8B8)',
    version: '3.5.14', managed: false, source: 'Self-installed', updatedAt: '2026-05-30T16:52:00Z'},
  {id: 'postman', name: 'Postman', monogram: 'Pm', tint: 'light-dark(#EB6E00, #FF9330)',
    version: '11.42.3', managed: false, source: 'Self-installed', updatedAt: '2026-06-08T15:26:00Z'},
];
const MANAGED_COUNT = INSTALLED_APPS.filter(a => a.managed).length;

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  detail: string;
  actor: string;
  kind: 'receive' | 'enroll' | 'assign' | 'update' | 'flag';
}

// Lifecycle — matches the hr-employee-profile record (assigned 2025-10-20)
// and the Jun 27 EDR flag surfaced in the compliance checklist above.
const TIMELINE: TimelineEvent[] = [
  {
    id: 'ev-flag',
    date: '2026-06-27',
    title: 'Compliance flag raised — EDR agent below minimum',
    detail: 'Nightly posture scan found SentinelOne 24.2.1 < required 25.1.0. Device moved to "1 failing check".',
    actor: 'Posture scan (automated)',
    kind: 'flag',
  },
  {
    id: 'ev-os',
    date: '2026-05-14',
    title: 'OS updated — macOS 15.4 → 15.5',
    detail: 'Managed software update completed inside the 14-day deferral window; restart confirmed 07:12 PT.',
    actor: 'Kestrel MDM',
    kind: 'update',
  },
  {
    id: 'ev-assign',
    date: '2025-10-20',
    title: 'Assigned to Marcus Webb',
    detail: 'Handed off at SF HQ IT bar. Replaced KL-MBP-0089 (returned to loaner pool same day).',
    actor: 'Tom Okonkwo (IT admin)',
    kind: 'assign',
  },
  {
    id: 'ev-enroll',
    date: '2025-10-17',
    title: 'Enrolled via Apple Business Manager',
    detail: 'Zero-touch enrollment applied "Kestrel Endpoint Baseline v3.2"; FileVault enforced, recovery key escrowed.',
    actor: 'Tom Okonkwo (IT admin)',
    kind: 'enroll',
  },
  {
    id: 'ev-receive',
    date: '2025-10-14',
    title: 'Received at SF HQ',
    detail: 'PO KL-PO-2025-0288, ordered under the FY26 Engineering refresh batch (4 units).',
    actor: 'Receiving — Ops',
    kind: 'receive',
  },
];

const TIMELINE_DOT_COLOR: Record<TimelineEvent['kind'], string> = {
  receive: 'var(--color-border)',
  enroll: CAT_TEAL,
  assign: CAT_BLUE,
  update: CAT_GREEN,
  flag: CAT_ORANGE,
};

const PERIPHERALS = [
  {id: 'per-mon', icon: MonitorIcon, name: 'LG UltraFine 27" 5K', assetTag: 'KL-MON-0312', assignedAt: '2025-10-20'},
  {id: 'per-key', icon: UsbIcon, name: 'YubiKey 5C NFC', assetTag: 'KL-KEY-0089', assignedAt: '2024-02-06'},
];

// Coverage runs 2025-10-20 → 2028-10-20 (1096 days). As of 2026-07-03,
// 256 days have elapsed — the meter below shows 256/1096.
const WARRANTY = {
  plan: 'AppleCare+ for Business',
  contract: 'AC2-8842-1907',
  purchasedAt: '2025-10-20',
  expiresAt: '2028-10-20',
  daysTotal: 1096,
  daysElapsed: 256,
  coverage: ['Hardware repairs', 'Battery service (< 80%)', '2 accidental-damage incidents / yr'],
  incidentsUsed: 0,
};

type RemoteActionId = 'lock' | 'restart' | 'wipe';

const REMOTE_ACTION_META: Record<RemoteActionId, {queuedLabel: string}> = {
  lock: {queuedLabel: 'Lock command queued — waiting for MDM ack'},
  restart: {queuedLabel: 'Restart command queued — waiting for MDM ack'},
  wipe: {queuedLabel: 'Wipe requested — pending security approval'},
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2025-10-20" → "Oct 20, 2025" without touching Date/locale. */
function monthDayYear(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return \`\${MONTHS[Number(m) - 1]} \${Number(d)}, \${y}\`;
}

/** "2025-10-20" → "Oct 20" for tight timeline gutters. */
function monthDay(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split('-');
  return \`\${MONTHS[Number(m) - 1]} \${Number(d)}\`;
}

function formatGb(gb: number): string {
  return gb >= 100 ? \`\${Math.round(gb)} GB\` : \`\${gb.toFixed(1)} GB\`;
}

// ---------------------------------------------------------------------------
// SECTION SCAFFOLD + IDENTITY BAND
// ---------------------------------------------------------------------------

function SectionHeader({title, meta}: {title: string; meta?: ReactNode}) {
  return (
    <div style={styles.sectionHead}>
      <Heading level={2}>{title}</Heading>
      {meta != null ? (
        <StackItem size="fill">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {meta}
          </Text>
        </StackItem>
      ) : null}
    </div>
  );
}

function IdentityBand({isCompact}: {isCompact: boolean}) {
  return (
    <HStack gap={4} vAlign="start" wrap={isCompact ? 'wrap' : undefined}>
      <div style={styles.deviceGlyph} aria-hidden>
        <Icon icon={LaptopIcon} size="lg" color="secondary" />
      </div>
      <StackItem size="fill" style={{minWidth: 240}}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Heading level={1}>{DEVICE.model}</Heading>
            <Token size="sm" color="blue" label="Managed" />
            <Token size="sm" color="teal" label="Supervised" />
          </HStack>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {DEVICE.assetTag} · SN {DEVICE.serial} · {DEVICE.modelId} · assigned
            to {DEVICE.assignee.name} since {monthDayYear(DEVICE.assignedAt)}
          </Text>
          <div style={styles.chipRow}>
            <span style={styles.chip}>
              <StatusDot variant="success" label="Online" />
              Checked in <Timestamp value={DEVICE.lastCheckIn} format="relative" color="secondary" />
            </span>
            <span style={styles.chip}>
              <Icon icon={ShieldCheckIcon} size="xsm" color="inherit" />
              {PASSING_CHECKS} of {COMPLIANCE_CHECKS.length} checks passing
            </span>
            <span style={styles.chip}>
              <Icon icon={WifiIcon} size="xsm" color="inherit" />
              {DEVICE.lastIp}
            </span>
            <span style={styles.chip}>
              <Icon icon={KeyRoundIcon} size="xsm" color="inherit" />
              {DEVICE.supervision}
            </span>
          </div>
        </VStack>
      </StackItem>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// HARDWARE & STORAGE — spec MetadataList beside the segmented usage bar.
// ---------------------------------------------------------------------------

function SpecList() {
  return (
    <MetadataList columns={1} label={{position: 'start', width: 96}}>
      <MetadataListItem label="Serial">
        <Text type="body" hasTabularNumbers>{DEVICE.serial}</Text>
      </MetadataListItem>
      <MetadataListItem label="Chip">
        <Text type="body">{DEVICE.chip}</Text>
      </MetadataListItem>
      <MetadataListItem label="Memory">
        <Text type="body">{DEVICE.ram}</Text>
      </MetadataListItem>
      <MetadataListItem label="OS">
        <Text type="body" hasTabularNumbers>{DEVICE.os}</Text>
      </MetadataListItem>
      <MetadataListItem label="Hostname">
        <Text type="body" hasTabularNumbers>{DEVICE.hostname}</Text>
      </MetadataListItem>
      <MetadataListItem label="Battery">
        <HStack gap={1} vAlign="center">
          <Icon icon={BatteryChargingIcon} size="xsm" color="secondary" />
          <Text type="body" hasTabularNumbers>
            {DEVICE.batteryHealth}% health · {DEVICE.batteryCycles} cycles
          </Text>
        </HStack>
      </MetadataListItem>
      <MetadataListItem label="Enrollment">
        <Text type="body">{DEVICE.enrolledVia}</Text>
      </MetadataListItem>
      <MetadataListItem label="MDM profile">
        <Text type="body">{DEVICE.mdmProfile}</Text>
      </MetadataListItem>
    </MetadataList>
  );
}

function StorageMeter() {
  const freeGb = STORAGE.totalGb - STORAGE_USED_GB;
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Text type="label">Storage</Text>
        <StackItem size="fill">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatGb(STORAGE_USED_GB)} used of 1 TB
          </Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {formatGb(freeGb)} free
        </Text>
      </HStack>
      <div
        style={styles.storageBar}
        role="img"
        aria-label={\`Storage: \${formatGb(STORAGE_USED_GB)} used of 1 terabyte\`}>
        {STORAGE.segments.map(segment => (
          <div
            key={segment.id}
            style={{
              ...styles.storageSegment,
              width: \`\${(segment.gb / STORAGE.totalGb) * 100}%\`,
              backgroundColor: segment.color,
            }}
          />
        ))}
        <div style={{...styles.storageSegment, ...styles.storageFree, flex: 1}} />
      </div>
      <div style={styles.legendGrid}>
        {STORAGE.segments.map(segment => (
          <div key={segment.id} style={styles.legendRow}>
            <span
              style={{...styles.legendSwatch, backgroundColor: segment.color}}
              aria-hidden
            />
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text type="supporting" color="secondary" maxLines={1}>
                {segment.label}
              </Text>
            </StackItem>
            <span style={{whiteSpace: 'nowrap', flexShrink: 0}}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {formatGb(segment.gb)}
              </Text>
            </span>
          </div>
        ))}
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// COMPLIANCE CHECKLIST — 4 rows, one failing with an in-place remediation
// CTA. Once pushed, the CTA swaps to a queued chip (no fake progress).
// ---------------------------------------------------------------------------

function ComplianceRow({
  check,
  isRemediationQueued,
  onRemediate,
}: {
  check: ComplianceCheck;
  isRemediationQueued: boolean;
  onRemediate: () => void;
}) {
  const isFailing = check.status === 'fail';
  return (
    <div
      style={
        isFailing
          ? {...styles.checkRow, ...styles.checkRowFailing}
          : styles.checkRow
      }>
      <div style={styles.checkIconWell} aria-hidden>
        <Icon icon={check.icon} size="sm" color="secondary" />
      </div>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Text type="label">{check.label}</Text>
            {isFailing ? (
              <Badge variant="warning" label="Failing" />
            ) : (
              <HStack gap={1} vAlign="center">
                <StatusDot variant="success" label="Passing" />
                <Text type="supporting" color="secondary">
                  Passing
                </Text>
              </HStack>
            )}
            <StackItem size="fill" />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {check.requirement}
            </Text>
          </HStack>
          <Text type="body" hasTabularNumbers>
            {check.value}
          </Text>
          <Text type="supporting" color="secondary">
            {check.detail}
          </Text>
          {isFailing ? (
            <HStack gap={2} vAlign="center" wrap="wrap" style={{marginTop: 4}}>
              {isRemediationQueued ? (
                <span style={styles.queuedNote}>
                  <Icon icon={ClockIcon} size="xsm" color="secondary" />
                  <Text type="supporting" color="secondary">
                    Update queued — installs at next check-in (~15 min)
                  </Text>
                </span>
              ) : (
                <Button
                  label={check.remediationLabel ?? 'Remediate'}
                  variant="primary"
                  size="sm"
                  icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
                  onClick={onRemediate}
                />
              )}
              {check.flaggedAt != null ? (
                <Text type="supporting" color="secondary">
                  Flagged <Timestamp value={check.flaggedAt} format="relative" color="secondary" />
                </Text>
              ) : null}
            </HStack>
          ) : null}
        </VStack>
      </StackItem>
    </div>
  );
}

function ComplianceSection({
  isRemediationQueued,
  onRemediate,
}: {
  isRemediationQueued: boolean;
  onRemediate: () => void;
}) {
  return (
    <section style={styles.section} aria-label="Compliance checklist">
      <SectionHeader
        title="Compliance"
        meta={\`\${PASSING_CHECKS} of \${COMPLIANCE_CHECKS.length} checks passing · scanned nightly by Kestrel MDM\`}
      />
      <VStack gap={2}>
        {COMPLIANCE_CHECKS.map(check => (
          <ComplianceRow
            key={check.id}
            check={check}
            isRemediationQueued={isRemediationQueued}
            onRemediate={onRemediate}
          />
        ))}
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// INSTALLED APPS — filterable table with managed/self-installed Badges and a
// mono version column that surfaces available updates.
// ---------------------------------------------------------------------------

type AppScope = 'all' | 'managed' | 'unmanaged';

function AppNameCell({app}: {app: InstalledApp}) {
  return (
    <HStack gap={2} vAlign="center">
      <span
        style={{...styles.appMonogram, backgroundColor: app.tint}}
        aria-hidden>
        {app.monogram}
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <Text type="body" maxLines={1}>
          {app.name}
        </Text>
      </StackItem>
    </HStack>
  );
}

function AppVersionCell({app}: {app: InstalledApp}) {
  return (
    <VStack gap={0}>
      <span style={styles.versionText}>{app.version}</span>
      {app.belowMinimum ? (
        <Text type="supporting" color="secondary">
          below minimum — {app.updateAvailable} required
        </Text>
      ) : app.updateAvailable != null ? (
        <Text type="supporting" color="secondary">
          {app.updateAvailable} available
        </Text>
      ) : null}
    </VStack>
  );
}

function AppManagedCell({app}: {app: InstalledApp}) {
  return (
    <VStack gap={0}>
      <div>
        {app.belowMinimum ? (
          <Badge variant="warning" label="Managed" />
        ) : app.managed ? (
          <Badge variant="neutral" label="Managed" />
        ) : (
          <Badge variant="orange" label="Self-installed" />
        )}
      </div>
      {app.managed ? (
        <Text type="supporting" color="secondary" maxLines={1}>
          {app.source}
        </Text>
      ) : null}
    </VStack>
  );
}

function buildAppColumns(isCompact: boolean): TableColumn<InstalledApp>[] {
  const columns: TableColumn<InstalledApp>[] = [
    {
      key: 'name',
      header: 'Application',
      width: proportional(2, {minWidth: 180}),
      renderCell: (app: InstalledApp) => <AppNameCell app={app} />,
    },
    {
      key: 'version',
      header: 'Version',
      width: proportional(1, {minWidth: 130}),
      renderCell: (app: InstalledApp) => <AppVersionCell app={app} />,
    },
    {
      key: 'managed',
      header: 'Management',
      width: pixel(150),
      renderCell: (app: InstalledApp) => <AppManagedCell app={app} />,
    },
  ];
  if (!isCompact) {
    columns.push({
      key: 'updated',
      header: 'Last updated',
      align: 'end',
      width: pixel(130),
      renderCell: (app: InstalledApp) => (
        <Timestamp value={app.updatedAt} format="relative" color="secondary" />
      ),
    });
  }
  return columns;
}

function InstalledAppsSection({isCompact}: {isCompact: boolean}) {
  const [scope, setScope] = useState<AppScope>('all');
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();
  const filtered = INSTALLED_APPS.filter(app => {
    if (scope === 'managed' && !app.managed) return false;
    if (scope === 'unmanaged' && app.managed) return false;
    return trimmed === '' || app.name.toLowerCase().includes(trimmed);
  });

  return (
    <section style={styles.section} aria-label="Installed applications">
      <SectionHeader
        title="Installed apps"
        meta={\`\${INSTALLED_APPS.length} apps · \${MANAGED_COUNT} managed by MDM · \${INSTALLED_APPS.length - MANAGED_COUNT} self-installed · inventoried at last check-in\`}
      />
      <div style={styles.appsToolbar}>
        <div style={{width: isCompact ? '100%' : 240}}>
          <TextInput
            label="Search installed apps"
            isLabelHidden
            placeholder="Search apps…"
            size="sm"
            width="100%"
            value={query}
            onChange={setQuery}
            startIcon={SearchIcon}
          />
        </div>
        <SegmentedControl
          label="Filter by management"
          value={scope}
          onChange={value => setScope(value as AppScope)}
          size="sm">
          <SegmentedControlItem label={\`All \${INSTALLED_APPS.length}\`} value="all" />
          <SegmentedControlItem label={\`Managed \${MANAGED_COUNT}\`} value="managed" />
          <SegmentedControlItem
            label={\`Self \${INSTALLED_APPS.length - MANAGED_COUNT}\`}
            value="unmanaged"
          />
        </SegmentedControl>
      </div>
      <Table<InstalledApp>
        data={filtered}
        columns={buildAppColumns(isCompact)}
        idKey="id"
        density="compact"
        dividers="rows"
        hasHover
        emptyState={
          <div style={styles.tableEmpty}>
            <EmptyState
              isCompact
              title="No apps match"
              description="Clear the search or switch the management filter."
              icon={<Icon icon={AppWindowIcon} size="lg" />}
            />
          </div>
        }
      />
    </section>
  );
}

// ---------------------------------------------------------------------------
// LIFECYCLE TIMELINE — PO receipt → enrollment → assignment → OS update →
// compliance flag. Dates in a fixed gutter; dots colored by event kind.
// ---------------------------------------------------------------------------

function TimelineSection({isCompact}: {isCompact: boolean}) {
  return (
    <section style={styles.section} aria-label="Assignment history">
      <SectionHeader
        title="Assignment history"
        meta={\`\${TIMELINE.length} lifecycle events since \${monthDayYear(TIMELINE[TIMELINE.length - 1].date)}\`}
      />
      <VStack gap={0}>
        {TIMELINE.map((event, index) => (
          <div
            key={event.id}
            style={
              isCompact
                ? {...styles.timelineRow, flexDirection: 'column', gap: 4}
                : styles.timelineRow
            }>
            {isCompact ? (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {monthDayYear(event.date)}
              </Text>
            ) : (
              <div style={styles.timelineDate}>
                <VStack gap={0}>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {monthDay(event.date)}
                  </Text>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {event.date.slice(0, 4)}
                  </Text>
                </VStack>
              </div>
            )}
            {isCompact ? null : (
              <div style={styles.timelineSpine} aria-hidden>
                <div
                  style={{
                    ...styles.timelineDot,
                    backgroundColor: TIMELINE_DOT_COLOR[event.kind],
                  }}
                />
                {index < TIMELINE.length - 1 ? (
                  <div style={styles.timelineLine} />
                ) : null}
              </div>
            )}
            <div style={styles.timelineBody}>
              <VStack gap={1}>
                <Text type="label">{event.title}</Text>
                <Text type="supporting" color="secondary">
                  {event.detail}
                </Text>
                <Text type="supporting" color="secondary">
                  {event.actor}
                </Text>
              </VStack>
            </div>
          </div>
        ))}
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// RAIL CARDS — remote actions, assignee, peripherals, warranty. Cards are
// reserved for these bounded rail widgets per the container policy.
// ---------------------------------------------------------------------------

function RemoteActionsCard({
  queuedActions,
  onRequestAction,
}: {
  queuedActions: RemoteActionId[];
  onRequestAction: (action: RemoteActionId) => void;
}) {
  const isWipeQueued = queuedActions.includes('wipe');
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <Heading level={2}>Remote actions</Heading>
        <Text type="supporting" color="secondary">
          Commands are delivered at the next MDM check-in (device polls every
          15 minutes; currently online).
        </Text>
        <VStack gap={2}>
          <Button
            label="Lock device"
            variant="secondary"
            size="sm"
            icon={<Icon icon={LockIcon} size="sm" color="inherit" />}
            isDisabled={queuedActions.includes('lock') || isWipeQueued}
            onClick={() => onRequestAction('lock')}
          />
          <Button
            label="Restart"
            variant="secondary"
            size="sm"
            icon={<Icon icon={PowerIcon} size="sm" color="inherit" />}
            isDisabled={queuedActions.includes('restart') || isWipeQueued}
            onClick={() => onRequestAction('restart')}
          />
          <Divider />
          <Button
            label="Wipe device…"
            variant="destructive"
            size="sm"
            icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
            isDisabled={isWipeQueued}
            onClick={() => onRequestAction('wipe')}
          />
        </VStack>
        {queuedActions.length > 0 ? (
          <VStack gap={1}>
            {queuedActions.map(action => (
              <span key={action} style={styles.queuedNote}>
                <Icon icon={ClockIcon} size="xsm" color="secondary" />
                <Text type="supporting" color="secondary">
                  {REMOTE_ACTION_META[action].queuedLabel}
                </Text>
              </span>
            ))}
          </VStack>
        ) : null}
      </VStack>
    </Card>
  );
}

function AssigneeCard() {
  const {assignee} = DEVICE;
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <Heading level={2}>Assigned to</Heading>
        <HStack gap={2} vAlign="center">
          <Avatar name={assignee.name} size="small" />
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <Text type="label" maxLines={1}>
                {assignee.name}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {assignee.role} · {assignee.department}
              </Text>
            </VStack>
          </StackItem>
        </HStack>
        <MetadataList columns={1} label={{position: 'start', width: 96}}>
          <MetadataListItem label="Employee ID">
            <Text type="body" hasTabularNumbers>{assignee.employeeId}</Text>
          </MetadataListItem>
          <MetadataListItem label="Office">
            <Text type="body">{assignee.office}</Text>
          </MetadataListItem>
          <MetadataListItem label="Assigned">
            <Text type="body" hasTabularNumbers>
              {monthDayYear(DEVICE.assignedAt)}
            </Text>
          </MetadataListItem>
        </MetadataList>
        <Link onClick={() => {}}>View employee record</Link>
      </VStack>
    </Card>
  );
}

function PeripheralsCard() {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <Heading level={2}>Peripherals</Heading>
        <VStack gap={2}>
          {PERIPHERALS.map(item => (
            <HStack key={item.id} gap={2} vAlign="start">
              <span style={{display: 'inline-flex', paddingTop: 2}}>
                <Icon icon={item.icon} size="sm" color="secondary" />
              </span>
              <StackItem size="fill" style={{minWidth: 0}}>
                <VStack gap={0}>
                  <Text type="body" maxLines={1}>
                    {item.name}
                  </Text>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {item.assetTag} · assigned {monthDayYear(item.assignedAt)}
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

function WarrantyCard() {
  const coveragePct = Math.round(
    (WARRANTY.daysElapsed / WARRANTY.daysTotal) * 100,
  );
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={2}>Warranty</Heading>
          </StackItem>
          <Badge variant="success" label="Active" />
        </HStack>
        <VStack gap={0}>
          <Text type="label">{WARRANTY.plan}</Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Contract {WARRANTY.contract}
          </Text>
        </VStack>
        <VStack gap={1}>
          <ProgressBar
            label="Coverage elapsed"
            value={WARRANTY.daysElapsed}
            max={WARRANTY.daysTotal}
            variant="accent"
            hasValueLabel
            formatValueLabel={() => \`\${coveragePct}% elapsed\`}
          />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {monthDayYear(WARRANTY.purchasedAt)} → {monthDayYear(WARRANTY.expiresAt)}
          </Text>
        </VStack>
        <VStack gap={1}>
          {WARRANTY.coverage.map(item => (
            <HStack key={item} gap={1} vAlign="center">
              <Icon icon={CheckIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary">
                {item}
              </Text>
            </HStack>
          ))}
        </VStack>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {WARRANTY.incidentsUsed} of 2 accidental-damage incidents used this
          year.
        </Text>
        <Link onClick={() => {}}>File a claim with Apple</Link>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// REMOTE-ACTION DIALOGS — Lock/Restart use AlertDialog confirms; Wipe is a
// destructive Dialog with a required-reason field gating the confirm.
// ---------------------------------------------------------------------------

function WipeDialog({
  isOpen,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const trimmedReason = reason.trim();

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={open => {
        if (!open) {
          setReason('');
          onCancel();
        }
      }}
      purpose="form"
      width="min(480px, 94vw)">
      <VStack gap={3} style={styles.dialogBody}>
        <DialogHeader
          title="Wipe this device?"
          subtitle={\`\${DEVICE.model} · \${DEVICE.assetTag}\`}
          onOpenChange={open => {
            if (!open) {
              setReason('');
              onCancel();
            }
          }}
        />
        <Banner
          status="error"
          icon={<Icon icon={ShieldAlertIcon} size="sm" color="inherit" />}
          title="This erases all data at the next check-in"
          description="macOS is reinstalled and the APFS data volume is destroyed. FileVault recovery keys stop working. This cannot be undone once the device acknowledges the command."
        />
        <div style={styles.wipeSummary}>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              Assigned to {DEVICE.assignee.name} ({DEVICE.assignee.employeeId})
              — no offboarding run is in flight for this employee.
            </Text>
            <Text type="supporting" color="secondary">
              Activation Lock stays on, so the hardware remains tied to the
              Kestrel ABM org after the wipe.
            </Text>
          </VStack>
        </div>
        <TextArea
          label="Reason (required — logged to the device audit trail)"
          placeholder="e.g. Device reported stolen from SF HQ on Jul 2; SEC-2026-0119"
          rows={3}
          width="100%"
          value={reason}
          onChange={setReason}
        />
        <HStack gap={2} hAlign="end">
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            onClick={() => {
              setReason('');
              onCancel();
            }}
          />
          <Button
            label="Wipe device"
            variant="destructive"
            size="sm"
            icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
            isDisabled={trimmedReason.length === 0}
            onClick={() => {
              onConfirm(trimmedReason);
              setReason('');
            }}
          />
        </HStack>
      </VStack>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function ItDeviceDetailTemplate() {
  const isRailDocked = useMediaQuery('(max-width: 1100px)');
  const isCompact = useMediaQuery('(max-width: 760px)');

  // Remediation CTA on the failing EDR check queues in place.
  const [isRemediationQueued, setIsRemediationQueued] = useState(false);
  // Remote actions: which commands have been queued, plus the open confirm.
  const [queuedActions, setQueuedActions] = useState<RemoteActionId[]>([]);
  const [pendingConfirm, setPendingConfirm] = useState<RemoteActionId | null>(null);
  // aria-live announcement for queued commands.
  const [announcement, setAnnouncement] = useState('');
  const [isSyncQueued, setIsSyncQueued] = useState(false);

  const queueAction = (action: RemoteActionId) => {
    setQueuedActions(prev => (prev.includes(action) ? prev : [...prev, action]));
    setAnnouncement(REMOTE_ACTION_META[action].queuedLabel);
    setPendingConfirm(null);
  };

  const railCards = (
    <>
      <RemoteActionsCard
        queuedActions={queuedActions}
        onRequestAction={setPendingConfirm}
      />
      <AssigneeCard />
      <PeripheralsCard />
      <WarrantyCard />
    </>
  );

  const header = (
    <LayoutHeader hasDivider>
      <div style={styles.headerBar}>
        <StackItem size="fill" style={{minWidth: 200}}>
          <Breadcrumbs variant="supporting" label="IT navigation">
            <BreadcrumbItem onClick={() => {}}>IT</BreadcrumbItem>
            <BreadcrumbItem onClick={() => {}}>Devices</BreadcrumbItem>
            <BreadcrumbItem isCurrent>{DEVICE.assetTag}</BreadcrumbItem>
          </Breadcrumbs>
        </StackItem>
        {isSyncQueued ? (
          <Text type="supporting" color="secondary">
            Sync requested — device polls every 15 min
          </Text>
        ) : null}
        <Button
          label="Sync now"
          variant="secondary"
          size="sm"
          icon={<Icon icon={RefreshCwIcon} size="sm" color="inherit" />}
          isDisabled={isSyncQueued}
          onClick={() => {
            setIsSyncQueued(true);
            setAnnouncement('MDM sync requested for KL-MBP-0147.');
          }}
        />
        <DropdownMenu
          button={{label: 'More', variant: 'secondary', size: 'sm'}}
          menuWidth={230}
          items={[
            {label: 'Reassign device…', onClick: () => {}},
            {label: 'Move to loaner pool…', onClick: () => {}},
            {label: 'Export device report (CSV)', onClick: () => {}},
            {type: 'divider' as const},
            {label: 'Retire asset…', onClick: () => {}},
          ]}
        />
      </div>
    </LayoutHeader>
  );

  const complianceBanner =
    FAILING_CHECK != null && !isRemediationQueued ? (
      <Banner
        status="warning"
        icon={<Icon icon={ShieldAlertIcon} size="sm" color="inherit" />}
        title="1 failing compliance check"
        description={\`\${FAILING_CHECK.label}: \${FAILING_CHECK.value} — requirement is \${FAILING_CHECK.requirement.toLowerCase()}. Flagged \${monthDayYear(FAILING_CHECK.flaggedAt ?? '')} by the nightly posture scan.\`}
        endContent={
          <Button
            label={FAILING_CHECK.remediationLabel ?? 'Remediate'}
            variant="primary"
            size="sm"
            icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
            onClick={() => {
              setIsRemediationQueued(true);
              setAnnouncement(
                'EDR agent update queued; installs at next check-in.',
              );
            }}
          />
        }
      />
    ) : FAILING_CHECK != null ? (
      <Banner
        status="info"
        icon={<Icon icon={ClockIcon} size="sm" color="inherit" />}
        title="Remediation queued"
        description="SentinelOne 25.1.2 will install at the next MDM check-in (~15 min). The compliance flag clears after the nightly posture scan."
      />
    ) : null;

  const content = (
    <LayoutContent>
      <div style={styles.contentScroll}>
        <div style={styles.contentColumn}>
          <IdentityBand isCompact={isCompact} />
          {complianceBanner}
          <Divider />
          <section style={styles.section} aria-label="Hardware and storage">
            <SectionHeader
              title="Hardware"
              meta={\`Inventoried at last check-in · \${DEVICE.mdmProfile}\`}
            />
            <div
              style={
                isCompact
                  ? {...styles.specGrid, ...styles.specGridCompact}
                  : styles.specGrid
              }>
              <SpecList />
              <StorageMeter />
            </div>
          </section>
          <Divider />
          <ComplianceSection
            isRemediationQueued={isRemediationQueued}
            onRemediate={() => {
              setIsRemediationQueued(true);
              setAnnouncement(
                'EDR agent update queued; installs at next check-in.',
              );
            }}
          />
          <Divider />
          <InstalledAppsSection isCompact={isCompact} />
          <Divider />
          <TimelineSection isCompact={isCompact} />
          {isRailDocked ? (
            <>
              <Divider />
              <section style={styles.section} aria-label="Device actions and coverage">
                <SectionHeader title="Actions & coverage" />
                <div style={styles.inlineRailGrid}>{railCards}</div>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </LayoutContent>
  );

  return (
    <div style={styles.root}>
      <div aria-live="polite" style={styles.visuallyHidden}>
        {announcement}
      </div>
      <Layout
        height="fill"
        header={header}
        content={content}
        end={
          isRailDocked ? undefined : (
            <LayoutPanel width={320} hasDivider>
              <div style={styles.railScroll}>{railCards}</div>
            </LayoutPanel>
          )
        }
      />
      <AlertDialog
        isOpen={pendingConfirm === 'lock'}
        onOpenChange={open => {
          if (!open) setPendingConfirm(null);
        }}
        title="Lock this device?"
        description={\`\${DEVICE.model} (\${DEVICE.assetTag}) locks at the next check-in and shows the IT recovery message. \${DEVICE.assignee.name} will need the 6-digit PIN from IT to unlock.\`}
        actionLabel="Lock device"
        cancelLabel="Cancel"
        onAction={() => queueAction('lock')}
      />
      <AlertDialog
        isOpen={pendingConfirm === 'restart'}
        onOpenChange={open => {
          if (!open) setPendingConfirm(null);
        }}
        title="Restart this device?"
        description={\`\${DEVICE.assignee.name} gets a 60-second warning to save work, then \${DEVICE.assetTag} restarts. Unsaved changes may be lost.\`}
        actionLabel="Restart"
        cancelLabel="Cancel"
        onAction={() => queueAction('restart')}
      />
      <WipeDialog
        isOpen={pendingConfirm === 'wipe'}
        onCancel={() => setPendingConfirm(null)}
        onConfirm={() => queueAction('wipe')}
      />
    </div>
  );
}
`;export{e as default};