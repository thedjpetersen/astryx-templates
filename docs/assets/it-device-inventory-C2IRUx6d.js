var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — a fixed Kestrel Labs MDM device
 *   fleet (142 endpoints: hand-authored roster/new-hire/non-compliant rows
 *   plus a deterministic index-derived filler roster), fixed ISO enrollment
 *   and warranty dates, and check-in ages in minutes measured from a frozen
 *   2026-07-03T16:00:00Z "now". No clocks, no randomness, no network media.
 * @output Device Fleet Inventory — the IT/MDM posture surface of the
 *   Kestrel Labs workforce platform (140-person company, 142 managed
 *   laptop/phone endpoints). Clickable summary chips (142 devices, 131
 *   encrypted, 6 non-compliant, 5 in transit) scope a sortable
 *   multi-select device table (hostname + model, assignee avatar, OS with
 *   outdated/out-of-policy badges, encryption status dot, last check-in
 *   age, compliance pill); a non-compliant violation pill row narrows to
 *   offending rows; a bulk-action bar queues remote locks and OS-update
 *   pushes; a 320px quick panel shows serial, warranty, storage,
 *   shipment tracking, and per-violation remediation.
 * @position Page template; emitted by \`astryx template it-device-inventory\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (brand, search, Sync MDM) | content (summary-chip toolbar,
 *   violation pill row, bulk bar when rows are checked, device Table
 *   scrolling both axes) | end panel 320 (device quick panel, scrolls).
 *   No start rail — scoping runs through the summary chips and pills, per
 *   the MDM-console archetype (contrast office-shared-drive's tree rail).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. The quick panel is a LayoutPanel; the device glyph tile,
 *   summary chips, and shipping notice are styled divs.
 * Color policy: token-pure everywhere. The only literals are the
 *   \`light-dark()\` fallback pairs on the data-viz categorical tokens used
 *   for device-kind glyphs (the demo does not inject
 *   \`--color-data-categorical-*\`); status colors — encryption dots,
 *   summary-chip count dots, overdue check-ins — ride
 *   \`--color-success/-warning/-error\`.
 *
 * Responsive contract:
 * - > 1180px: full header | table | quick-panel frame.
 * - <= 1180px: the quick panel is dropped (the table stays the source of
 *   truth); the header panel toggle hides with it.
 * - <= 860px: the table drops the Encryption and Last check-in columns so
 *   device/assignee/OS/compliance never crush; the header and the
 *   summary-chip row wrap instead of clipping; bulk-bar buttons collapse
 *   to icon-only.
 * - The table and the quick panel scroll independently (\`minHeight: 0\`
 *   down every flex chain); toolbars and the bulk bar are pinned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArchiveIcon,
  CircleAlertIcon,
  DownloadIcon,
  LaptopIcon,
  LockIcon,
  MonitorSmartphoneIcon,
  PackageIcon,
  PanelRightIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  SmartphoneIcon,
  TruckIcon,
  UserRoundIcon,
  WrenchIcon,
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
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  Table,
  pixel,
  proportional,
  useTableSelection,
  useTableSelectionState,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  chipToolbar: {flexShrink: 0, padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-2)'},
  pillRow: {flexShrink: 0, padding: '0 var(--spacing-4) var(--spacing-2)'},
  bulkBar: {flexShrink: 0},
  tableScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    // Pixel columns + the proportional device column keep a floor; narrow
    // viewports scroll the table horizontally instead of crushing cells.
    overflowX: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-3)',
  },
  tableEmpty: {padding: 'var(--spacing-6) var(--spacing-4)'},
  // Summary chips ---------------------------------------------------------
  chipCountDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  chipCount: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Table cells ------------------------------------------------------------
  kindGlyph: {display: 'inline-flex', flexShrink: 0},
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  checkinStale: {color: 'var(--color-error)'},
  osCell: {whiteSpace: 'nowrap'},
  // Quick panel ------------------------------------------------------------
  panelScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  deviceTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  shipNotice: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  violationRow: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start'},
  violationGlyph: {display: 'inline-flex', flexShrink: 0, color: 'var(--color-error)', paddingTop: 2},
  storageBar: {minWidth: 0},
  serialText: {fontFamily: 'var(--font-family-code, monospace)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  visuallyHidden: {position: 'absolute', width: 1, height: 1, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap'},
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard \`light-dark()\` fallback pair.
const KIND_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

// ---------------------------------------------------------------------------
// DOMAIN CONSTANTS — Kestrel Labs MDM policy, July 2026.
// Frozen "now" for relative check-in ages: 2026-07-03T16:00:00Z.
// ---------------------------------------------------------------------------

const NOW_MS = Date.parse('2026-07-03T16:00:00Z');
const MINUTES_PER_DAY = 1440;

type DeviceKind = 'laptop' | 'phone';
type ModelId = 'mbp16' | 'mbp14' | 'mba13' | 'tpx1' | 'iph16' | 'iph15';

interface ModelMeta {
  label: string;
  kind: DeviceKind;
  /** Asset-tag prefix, e.g. KL-MBP-0142. */
  tag: string;
  /** Device hostname suffix, e.g. priya-r-mbp16. */
  suffix: string;
  storageGb: number;
}

const MODEL_META: Record<ModelId, ModelMeta> = {
  mbp16: {label: 'MacBook Pro 16″ M4', kind: 'laptop', tag: 'MBP', suffix: 'mbp16', storageGb: 1024},
  mbp14: {label: 'MacBook Pro 14″ M4', kind: 'laptop', tag: 'MBP', suffix: 'mbp14', storageGb: 512},
  mba13: {label: 'MacBook Air 13″ M3', kind: 'laptop', tag: 'MBA', suffix: 'mba13', storageGb: 512},
  tpx1: {label: 'ThinkPad X1 Carbon G12', kind: 'laptop', tag: 'TPX', suffix: 'x1c', storageGb: 512},
  iph16: {label: 'iPhone 16', kind: 'phone', tag: 'IPH', suffix: 'iph', storageGb: 256},
  iph15: {label: 'iPhone 15', kind: 'phone', tag: 'IPH', suffix: 'iph', storageGb: 128},
};

/** OS posture vs the July 2026 baseline (macOS 15.5 / iOS 18.5 / Win 24H2). */
type OsStatus = 'current' | 'outdated' | 'blocked';

const OS_STATUS_LABEL: Record<OsStatus, string> = {current: 'Up to date', outdated: 'Outdated', blocked: 'Out of policy'};

type Violation = 'encryption' | 'os' | 'checkin';

const VIOLATION_LABEL: Record<Violation, string> = {
  encryption: 'Encryption off',
  os: 'OS out of policy',
  checkin: 'Check-in overdue',
};

const VIOLATION_DETAIL: Record<Violation, string> = {
  encryption: 'Disk encryption is reporting off or unknown. Policy requires FileVault / BitLocker / iOS data protection on every endpoint.',
  os: 'OS build is older than the enforced baseline (macOS 15.4 / iOS 18.3 / Windows 11 24H2 minus one). Push the pending update.',
  checkin: 'No MDM agent check-in for 14+ days. The device may be offline, wiped, or evading management.',
};

type DeviceStatus = 'compliant' | 'noncompliant' | 'transit';

const STATUS_TOKEN: Record<DeviceStatus, {color: 'green' | 'red' | 'blue'; label: string}> = {
  compliant: {color: 'green', label: 'Compliant'},
  noncompliant: {color: 'red', label: 'Non-compliant'},
  transit: {color: 'blue', label: 'In transit'},
};

type Dept = 'Engineering' | 'Design' | 'GTM' | 'Ops' | 'Finance' | 'People';
type Office = 'SF HQ' | 'Lisbon' | 'Remote-US';

interface Shipment {
  carrier: string;
  trackingRef: string;
  shippedAt: string;
  eta: string;
  reason: string;
}

// The Table generic requires rows assignable to Record<string, unknown>.
interface DeviceRow extends Record<string, unknown> {
  id: string;
  /** MDM hostname, e.g. kl-priya-r-mbp16. */
  name: string;
  model: ModelId;
  assignee: string;
  dept: Dept;
  office: Office;
  os: string;
  osStatus: OsStatus;
  isEncrypted: boolean;
  /** Minutes since the last MDM agent check-in; null while in transit. */
  checkInMins: number | null;
  status: DeviceStatus;
  violations: Violation[];
  serial: string;
  assetTag: string;
  /** null while in transit (enrollment happens on first boot). */
  enrolledAt: string | null;
  warrantyUntil: string;
  storageUsedGb: number;
  shipping?: Shipment;
  /** Set by the bulk bar / quick panel; renders as a queued-action chip. */
  queuedAction?: 'lock' | 'update';
}

/** MDM hostname: kl-<first>-<last initial>-<model suffix>. */
function deviceName(assignee: string, model: ModelId): string {
  const [first, last] = assignee.split(' ');
  return \`kl-\${first.toLowerCase()}-\${last[0].toLowerCase()}-\${MODEL_META[model].suffix}\`;
}

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs fleet, 142 managed endpoints. Chip math reconciles by
// construction and is re-derived from the array below:
//   142 total = 131 encrypted-and-compliant-or-core + 6 non-compliant
//   (every one reporting encryption off) + 5 in transit (not yet enrolled,
//   so encryption is pending). Violation pills: encryption 6 · OS 3 ·
//   check-in 2 (Chloe/Grace/Ingrid carry OS; Leo/Sam carry check-in).
// Hand-authored rows cover the canonical roster, the two in-flight hires
// (Ava Lindqvist, Ken Tanaka — same laptops the onboarding board ships),
// all 6 non-compliant devices, and all 5 shipments. Signed-in admin:
// Tom Okonkwo (IT admin).
// ---------------------------------------------------------------------------

// Compact fixture rows (tuple pattern, see office-shared-drive.tsx):
// [id, assignee, dept, office, model, os, osStatus, isEncrypted,
//  checkInMins, status, violations, serial, assetTag, enrolledAt,
//  warrantyUntil, storageUsedGb, shipping?]
type DeviceSpec = [
  string, string, Dept, Office, ModelId, string, OsStatus, boolean,
  number | null, DeviceStatus, Violation[], string, string, string | null,
  string, number, Shipment?,
];

const HAND_SPECS: DeviceSpec[] = [
  // ---- Core roster (compliant, encrypted) ----
  ['d-priya-mbp', 'Priya Raman', 'Engineering', 'SF HQ', 'mbp16', 'macOS 15.5', 'current', true,
    12, 'compliant', [], 'C02R41PRK9M4', 'KL-MBP-0141', '2025-02-10', '2028-02-10', 486],
  ['d-marcus-mbp', 'Marcus Webb', 'Engineering', 'SF HQ', 'mbp16', 'macOS 15.5', 'current', true,
    28, 'compliant', [], 'C02R42MWB0M4', 'KL-MBP-0142', '2025-02-10', '2028-02-10', 663],
  ['d-sofia-mbp', 'Sofia Ortiz', 'Design', 'SF HQ', 'mbp14', 'macOS 15.5', 'current', true,
    64, 'compliant', [], 'C02Q87SOZ4M4', 'KL-MBP-0087', '2024-08-22', '2027-08-22', 402],
  ['d-jonah-mbp', 'Jonah Fields', 'GTM', 'Remote-US', 'mbp14', 'macOS 15.4', 'outdated', true,
    178, 'compliant', [], 'C02Q95JFD1M4', 'KL-MBP-0095', '2024-09-30', '2027-09-30', 355],
  ['d-dana-mba', 'Dana Whitfield', 'People', 'SF HQ', 'mba13', 'macOS 15.5', 'current', true,
    41, 'compliant', [], 'C02P64DWH8M3', 'KL-MBA-0064', '2024-05-14', '2027-05-14', 288],
  ['d-elena-mba', 'Elena Voss', 'Finance', 'Lisbon', 'mba13', 'macOS 15.5', 'current', true,
    122, 'compliant', [], 'C02P71EVS2M3', 'KL-MBA-0071', '2024-06-03', '2027-06-03', 231],
  ['d-tom-mbp', 'Tom Okonkwo', 'Ops', 'SF HQ', 'mbp16', 'macOS 15.5', 'current', true,
    4, 'compliant', [], 'C02R50TOK7M4', 'KL-MBP-0150', '2025-03-18', '2028-03-18', 704],
  ['d-priya-iph', 'Priya Raman', 'Engineering', 'SF HQ', 'iph16', 'iOS 18.5', 'current', true,
    9, 'compliant', [], 'F17T03PRK2J9', 'KL-IPH-0203', '2025-09-19', '2027-09-19', 118],
  ['d-jonah-iph', 'Jonah Fields', 'GTM', 'Remote-US', 'iph15', 'iOS 18.3', 'outdated', true,
    301, 'compliant', [], 'F17T66JFD5J8', 'KL-IPH-0166', '2024-10-02', '2026-10-02', 96],
  ['d-tom-iph', 'Tom Okonkwo', 'Ops', 'SF HQ', 'iph16', 'iOS 18.5', 'current', true,
    22, 'compliant', [], 'F17T10TOK1J9', 'KL-IPH-0210', '2025-09-19', '2027-09-19', 74],
  // ---- Non-compliant (all six report encryption off; three also out of
  //      OS policy, two also overdue on check-in) ----
  ['d-ravi-mbp', 'Ravi Mehta', 'Engineering', 'SF HQ', 'mbp14', 'macOS 15.5', 'current', false,
    110, 'noncompliant', ['encryption'], 'C02R04RMH6M4', 'KL-MBP-0104', '2024-11-12', '2027-11-12', 296],
  ['d-chloe-mba', 'Chloe Bernard', 'GTM', 'Lisbon', 'mba13', 'macOS 14.7', 'blocked', false,
    372, 'noncompliant', ['encryption', 'os'], 'C02N38CBD3M2', 'KL-MBA-0038', '2023-10-05', '2026-10-05', 407],
  ['d-grace-tpx', 'Grace Osei', 'GTM', 'Remote-US', 'tpx1', 'Windows 11 23H2', 'blocked', false,
    208, 'noncompliant', ['encryption', 'os'], 'PF3KTX21GOS9', 'KL-TPX-0021', '2023-12-01', '2026-12-01', 388],
  ['d-leo-mbp', 'Leo Martins', 'Design', 'Lisbon', 'mbp14', 'macOS 15.4', 'outdated', false,
    16 * MINUTES_PER_DAY, 'noncompliant', ['encryption', 'checkin'], 'C02Q76LMT9M4', 'KL-MBP-0076', '2024-07-21', '2027-07-21', 344],
  ['d-sam-iph', 'Sam Alvarez', 'GTM', 'Remote-US', 'iph15', 'iOS 18.3', 'outdated', false,
    21 * MINUTES_PER_DAY, 'noncompliant', ['encryption', 'checkin'], 'F17T58SAZ4J8', 'KL-IPH-0158', '2024-09-12', '2026-09-12', 88],
  ['d-ingrid-mba', 'Ingrid Hoffmann', 'Ops', 'SF HQ', 'mba13', 'macOS 14.7', 'blocked', false,
    540, 'noncompliant', ['encryption', 'os'], 'C02N42IHF7M2', 'KL-MBA-0042', '2023-11-08', '2026-11-08', 366],
  // ---- In transit (5 shipments; encryption pending until first boot).
  //      Ava's and Ken's laptops are the onboarding-board shipments. ----
  ['d-ava-mbp', 'Ava Lindqvist', 'Engineering', 'SF HQ', 'mbp14', 'macOS 15.5', 'current', false,
    null, 'transit', [], 'C02R63ALQ2M4', 'KL-MBP-0163', null, '2029-07-01', 24,
    {carrier: 'FedEx', trackingRef: '7841 2296 4410', shippedAt: '2026-07-01', eta: '2026-07-07', reason: 'New-hire onboarding — Ava starts Jul 13'}],
  ['d-ken-mbp', 'Ken Tanaka', 'GTM', 'Remote-US', 'mbp14', 'macOS 15.5', 'current', false,
    null, 'transit', [], 'C02R64KTN8M4', 'KL-MBP-0164', null, '2029-07-02', 24,
    {carrier: 'FedEx', trackingRef: '7841 2296 5583', shippedAt: '2026-07-02', eta: '2026-07-08', reason: 'New-hire onboarding — Ken starts Jul 13'}],
  ['d-ava-iph', 'Ava Lindqvist', 'Engineering', 'SF HQ', 'iph16', 'iOS 18.5', 'current', false,
    null, 'transit', [], 'F17T21ALQ6J9', 'KL-IPH-0221', null, '2028-07-01', 12,
    {carrier: 'UPS', trackingRef: '1Z 884A 02 6690 1174', shippedAt: '2026-07-01', eta: '2026-07-07', reason: 'New-hire onboarding — Ava starts Jul 13'}],
  ['d-mia-mba', 'Mia Chen', 'Design', 'SF HQ', 'mba13', 'macOS 15.5', 'current', false,
    null, 'transit', [], 'C02R88MCN1M3', 'KL-MBA-0088', null, '2029-06-30', 24,
    {carrier: 'FedEx', trackingRef: '7841 2295 9012', shippedAt: '2026-06-30', eta: '2026-07-06', reason: 'Battery-swap replacement for KL-MBA-0029'}],
  ['d-dana-iph', 'Dana Whitfield', 'People', 'SF HQ', 'iph16', 'iOS 18.5', 'current', false,
    null, 'transit', [], 'F17T22DWH9J9', 'KL-IPH-0222', null, '2028-07-02', 12,
    {carrier: 'UPS', trackingRef: '1Z 884A 02 6690 2287', shippedAt: '2026-07-02', eta: '2026-07-07', reason: 'Device refresh — replaces iPhone 13'}],
];

// ---------------------------------------------------------------------------
// FILLER ROSTER — 121 additional compliant, encrypted endpoints derived
// from the row index only (no randomness). 23 first names × 11 last names
// keep every (first, last-initial) pair — and therefore every hostname —
// unique for i < 253. None of the surnames collide with hand-authored rows.
// ---------------------------------------------------------------------------

const FILLER_COUNT = 121; // 21 hand rows + 121 = 142 devices total.

const FIRST_NAMES = [
  'Noor', 'Felix', 'Amara', 'Dmitri', 'Lucia', 'Owen', 'Zara', 'Mateo',
  'Ines', 'Caleb', 'Yuki', 'Hannah', 'Tobias', 'Nadia', 'Oscar', 'Bianca',
  'Ethan', 'Freya', 'Diego', 'Salma', 'Viktor', 'Aisha', 'Rohan',
];

const LAST_NAMES = [
  'Kowalski', 'Ferreira', 'Nakamura', 'Brooks', 'Silva', 'Haddad', 'Novak',
  'Iyer', 'Costa', 'Lund', 'Adeyemi',
];

// Department mix tracks the canonical Kestrel Labs headcount shape
// (Engineering 52 · GTM 34 · Design 18 · Ops 16 · People 12 · Finance 8).
const DEPT_CYCLE: Dept[] = [
  'Engineering', 'Engineering', 'Engineering', 'Engineering', 'GTM', 'GTM',
  'GTM', 'Design', 'Design', 'Ops', 'People', 'Finance',
];

const OFFICE_CYCLE: Office[] = ['SF HQ', 'SF HQ', 'Lisbon', 'Remote-US', 'SF HQ', 'Remote-US'];

const pad2 = (value: number): string => String(value).padStart(2, '0');

function fillerModel(i: number, dept: Dept): ModelId {
  if (i % 8 === 5) {
    // Every 8th filler endpoint is a managed phone.
    return i % 16 === 5 ? 'iph15' : 'iph16';
  }
  if (dept === 'GTM' && i % 12 === 4) {
    return 'tpx1'; // A handful of GTM sellers run Windows.
  }
  if (dept === 'Engineering') {
    return i % 2 === 0 ? 'mbp16' : 'mbp14';
  }
  if (dept === 'Design') {
    return 'mbp14';
  }
  return i % 3 === 0 ? 'mbp14' : 'mba13';
}

function fillerOs(model: ModelId, i: number): {os: string; osStatus: OsStatus} {
  const kind = MODEL_META[model].kind;
  if (model === 'tpx1') {
    return {os: 'Windows 11 24H2', osStatus: 'current'};
  }
  if (kind === 'phone') {
    return i % 7 === 3
      ? {os: 'iOS 18.3', osStatus: 'outdated'}
      : {os: 'iOS 18.5', osStatus: 'current'};
  }
  return i % 9 === 4
    ? {os: 'macOS 15.4', osStatus: 'outdated'}
    : {os: 'macOS 15.5', osStatus: 'current'};
}

function buildFillerRow(i: number): DeviceRow {
  const assignee = \`\${FIRST_NAMES[i % FIRST_NAMES.length]} \${LAST_NAMES[i % LAST_NAMES.length]}\`;
  const dept = DEPT_CYCLE[i % DEPT_CYCLE.length];
  const office = OFFICE_CYCLE[i % OFFICE_CYCLE.length];
  const model = fillerModel(i, dept);
  const meta = MODEL_META[model];
  const {os, osStatus} = fillerOs(model, i);
  // Check-in ages spread deterministically across the last ~43 hours.
  const checkInMins = 4 + ((i * 97) % 2600);
  const enrolledYear = 2023 + (i % 3);
  const enrolledMonth = 1 + ((i * 5) % 12);
  const enrolledDay = 1 + ((i * 11) % 27);
  const enrolledAt = \`\${enrolledYear}-\${pad2(enrolledMonth)}-\${pad2(enrolledDay)}\`;
  const warrantyUntil = \`\${enrolledYear + 3}-\${pad2(enrolledMonth)}-\${pad2(enrolledDay)}\`;
  return {
    id: \`d-fleet-\${String(i).padStart(3, '0')}\`,
    name: deviceName(assignee, model),
    model,
    assignee,
    dept,
    office,
    os,
    osStatus,
    isEncrypted: true,
    checkInMins,
    status: 'compliant',
    violations: [],
    serial: \`\${meta.kind === 'phone' ? 'F17T' : 'C02T'}\${String(30 + i)}\${assignee[0]}\${assignee.split(' ')[1][0]}L\${i % 10}M\${(i * 3) % 10}\`,
    assetTag: \`KL-\${meta.tag}-\${String(300 + i).padStart(4, '0')}\`,
    enrolledAt,
    warrantyUntil,
    // Base + spread keep every derived figure inside the model's capacity
    // (phones: 48..capacity-16 GB; laptops: 96..capacity-64 GB).
    storageUsedGb:
      meta.kind === 'phone'
        ? 48 + ((i * 37) % (meta.storageGb - 64))
        : 96 + ((i * 37) % (meta.storageGb - 160)),
  };
}

const INITIAL_DEVICES: DeviceRow[] = [
  ...HAND_SPECS.map(
    ([id, assignee, dept, office, model, os, osStatus, isEncrypted, checkInMins, status, violations, serial, assetTag, enrolledAt, warrantyUntil, storageUsedGb, shipping]) => ({
      id, name: deviceName(assignee, model), model, assignee, dept, office,
      os, osStatus, isEncrypted, checkInMins, status, violations, serial,
      assetTag, enrolledAt, warrantyUntil, storageUsedGb, shipping,
    }),
  ),
  ...Array.from({length: FILLER_COUNT}, (_, i) => buildFillerRow(i)),
];

// Summary chips are re-derived from the fixture so the numbers can never
// drift from the table: 142 · 131 · 6 · 5.
const SUMMARY = {
  total: INITIAL_DEVICES.length,
  encrypted: INITIAL_DEVICES.filter(d => d.isEncrypted).length,
  noncompliant: INITIAL_DEVICES.filter(d => d.status === 'noncompliant').length,
  transit: INITIAL_DEVICES.filter(d => d.status === 'transit').length,
};

const VIOLATION_ORDER: Violation[] = ['encryption', 'os', 'checkin'];

const VIOLATION_COUNTS: Record<Violation, number> = {
  encryption: INITIAL_DEVICES.filter(d => d.violations.includes('encryption')).length,
  os: INITIAL_DEVICES.filter(d => d.violations.includes('os')).length,
  checkin: INITIAL_DEVICES.filter(d => d.violations.includes('checkin')).length,
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** Deterministic relative age from the frozen fixture "now". */
function checkInLabel(mins: number): string {
  if (mins < 60) {
    return \`\${mins}m ago\`;
  }
  if (mins < MINUTES_PER_DAY) {
    return \`\${Math.round(mins / 60)}h ago\`;
  }
  return \`\${Math.round(mins / MINUTES_PER_DAY)}d ago\`;
}

/** Absolute timestamp for the quick panel, derived from the frozen now. */
function checkInIso(mins: number): string {
  return new Date(NOW_MS - mins * 60_000).toISOString();
}

function kindIcon(model: ModelId): typeof LaptopIcon {
  return MODEL_META[model].kind === 'laptop' ? LaptopIcon : SmartphoneIcon;
}

function kindColor(model: ModelId): string {
  if (model === 'tpx1') {
    return KIND_COLOR.teal;
  }
  return MODEL_META[model].kind === 'laptop' ? KIND_COLOR.blue : KIND_COLOR.purple;
}

/** Encryption mechanism name shown under the status dot. */
function encryptionMechanism(device: DeviceRow): string {
  if (MODEL_META[device.model].kind === 'phone') {
    return 'Data protection';
  }
  return device.model === 'tpx1' ? 'BitLocker' : 'FileVault';
}

function encryptionMeta(device: DeviceRow): {
  dot: 'success' | 'error' | 'neutral';
  label: string;
} {
  if (device.status === 'transit') {
    return {dot: 'neutral', label: 'Pending'};
  }
  return device.isEncrypted
    ? {dot: 'success', label: 'On'}
    : {dot: 'error', label: 'Off'};
}

const OS_BADGE: Record<Exclude<OsStatus, 'current'>, 'warning' | 'error'> = {
  outdated: 'warning',
  blocked: 'error',
};

type ScopeFilter = 'all' | 'encrypted' | 'noncompliant' | 'transit';
type TypeFilter = 'all' | DeviceKind;

// ---------------------------------------------------------------------------
// TABLE — cells and columns. Fixed-width columns use pixel() so the header
// carries both width and minWidth (Table cells have max-width: 0).
// ---------------------------------------------------------------------------

function DeviceCell({device}: {device: DeviceRow}) {
  return (
    <HStack gap={2} vAlign="center">
      <span style={{...styles.kindGlyph, color: kindColor(device.model)}}>
        <Icon icon={kindIcon(device.model)} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {device.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {MODEL_META[device.model].label} · {device.assetTag}
          </Text>
        </VStack>
      </StackItem>
      {device.queuedAction === 'lock' ? (
        <Token size="sm" color="gray" label="Lock pending" />
      ) : null}
      {device.queuedAction === 'update' ? (
        <Token size="sm" color="blue" label="Update queued" />
      ) : null}
    </HStack>
  );
}

function AssigneeCell({device}: {device: DeviceRow}) {
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={device.assignee} size="xsmall" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="body" maxLines={1}>
            {device.assignee}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {device.dept} · {device.office}
          </Text>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function OsCell({device}: {device: DeviceRow}) {
  return (
    <VStack gap={1} style={styles.osCell}>
      <Text type="body" hasTabularNumbers maxLines={1}>
        {device.os}
      </Text>
      {device.osStatus !== 'current' ? (
        <div>
          <Badge
            variant={OS_BADGE[device.osStatus]}
            label={OS_STATUS_LABEL[device.osStatus]}
          />
        </div>
      ) : null}
    </VStack>
  );
}

function EncryptionCell({device}: {device: DeviceRow}) {
  const meta = encryptionMeta(device);
  return (
    <HStack gap={2} vAlign="center">
      <StatusDot
        variant={meta.dot}
        label={\`Encryption \${meta.label.toLowerCase()}\`}
      />
      <VStack gap={0}>
        <Text type="body">{meta.label}</Text>
        <Text type="supporting" color="secondary" maxLines={1}>
          {encryptionMechanism(device)}
        </Text>
      </VStack>
    </HStack>
  );
}

function CheckInCell({device}: {device: DeviceRow}) {
  if (device.checkInMins === null) {
    return (
      <VStack gap={0}>
        <Text type="body" color="secondary">
          Not enrolled
        </Text>
        <Text type="supporting" color="secondary" maxLines={1}>
          Shipped {device.shipping?.shippedAt.slice(5).replace('-', '/')}
        </Text>
      </VStack>
    );
  }
  const isOverdue = device.violations.includes('checkin');
  return (
    <VStack gap={0}>
      <Text
        type="body"
        hasTabularNumbers
        style={isOverdue ? {...styles.numericCell, ...styles.checkinStale} : styles.numericCell}>
        {checkInLabel(device.checkInMins)}
      </Text>
      {isOverdue ? (
        <Text type="supporting" style={styles.checkinStale}>
          Overdue
        </Text>
      ) : null}
    </VStack>
  );
}

function ComplianceCell({device}: {device: DeviceRow}) {
  const token = STATUS_TOKEN[device.status];
  return <Token size="sm" color={token.color} label={token.label} />;
}

/** Severity rank for the default sort: worst posture first. */
const STATUS_RANK: Record<DeviceStatus, number> = {noncompliant: 0, transit: 1, compliant: 2};

function buildColumns(isCompact: boolean): TableColumn<DeviceRow>[] {
  const columns: TableColumn<DeviceRow>[] = [
    {
      key: 'name',
      header: 'Device',
      // Floor kept low so Device + Assigned to stay fully visible before
      // the horizontal scroll cut in the demo's narrow content pane.
      width: proportional(2, {minWidth: 230}),
      sortable: true,
      renderCell: (device: DeviceRow) => <DeviceCell device={device} />,
    },
    {
      key: 'assignee',
      header: 'Assigned to',
      width: proportional(1, {minWidth: 170}),
      sortable: true,
      renderCell: (device: DeviceRow) => <AssigneeCell device={device} />,
    },
    {
      key: 'os',
      header: 'OS',
      width: pixel(150),
      sortable: true,
      renderCell: (device: DeviceRow) => <OsCell device={device} />,
    },
  ];
  if (!isCompact) {
    columns.push(
      {
        key: 'encryption',
        header: 'Encryption',
        width: pixel(140),
        sortable: {sortKey: 'isEncrypted'},
        renderCell: (device: DeviceRow) => <EncryptionCell device={device} />,
      },
      {
        key: 'checkin',
        header: 'Last check-in',
        width: pixel(130),
        sortable: {sortKey: 'checkInMins'},
        renderCell: (device: DeviceRow) => <CheckInCell device={device} />,
      },
    );
  }
  columns.push({
    key: 'status',
    header: 'Compliance',
    width: pixel(130),
    sortable: {sortKey: 'status'},
    renderCell: (device: DeviceRow) => <ComplianceCell device={device} />,
  });
  return columns;
}

// ---------------------------------------------------------------------------
// QUICK PANEL — active-device inspector: serial, warranty, storage bar,
// assignment, shipping notice for in-transit rows, and the violation list
// with per-issue remediation. With 2+ rows checked it becomes a selection
// summary so bulk totals stay visible while the action bar is in use.
// ---------------------------------------------------------------------------

function ViolationList({device}: {device: DeviceRow}) {
  if (device.violations.length === 0) {
    return null;
  }
  return (
    <VStack gap={2}>
      <Text type="label">Violations ({device.violations.length})</Text>
      {device.violations.map(violation => (
        <div key={violation} style={styles.violationRow}>
          <span style={styles.violationGlyph}>
            <Icon icon={CircleAlertIcon} size="sm" color="inherit" />
          </span>
          <VStack gap={0} style={{minWidth: 0}}>
            <Text type="label" size="sm">
              {VIOLATION_LABEL[violation]}
            </Text>
            <Text type="supporting" color="secondary">
              {VIOLATION_DETAIL[violation]}
            </Text>
          </VStack>
        </div>
      ))}
    </VStack>
  );
}

function ShippingNotice({shipping}: {shipping: Shipment}) {
  return (
    <div style={styles.shipNotice}>
      <Icon icon={TruckIcon} size="sm" color="secondary" />
      <StackItem size="fill">
        <VStack gap={1}>
          <Text type="label" size="sm">
            {shipping.reason}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {shipping.carrier} {shipping.trackingRef}
          </Text>
          <Text type="supporting" color="secondary">
            Shipped <Timestamp value={shipping.shippedAt} format="date" /> ·
            arrives <Timestamp value={shipping.eta} format="date" />
          </Text>
        </VStack>
      </StackItem>
    </div>
  );
}

/** Warranty posture vs the frozen fixture now (90-day "soon" window). */
function warrantyBadge(warrantyUntil: string) {
  const warrantyMs = Date.parse(warrantyUntil);
  if (warrantyMs < NOW_MS) {
    return <Badge variant="error" label="Expired" />;
  }
  if (warrantyMs < NOW_MS + 90 * MINUTES_PER_DAY * 60_000) {
    return <Badge variant="warning" label="Expires soon" />;
  }
  return null;
}

function DeviceMetadata({device}: {device: DeviceRow}) {
  const meta = MODEL_META[device.model];
  const storagePct = Math.round((device.storageUsedGb / meta.storageGb) * 100);
  return (
    <MetadataList columns={1} label={{position: 'start', width: 96}}>
      <MetadataListItem label="Serial">
        <Text type="body" style={styles.serialText}>
          {device.serial}
        </Text>
      </MetadataListItem>
      <MetadataListItem label="Asset tag">
        <Text type="body" style={styles.serialText}>
          {device.assetTag}
        </Text>
      </MetadataListItem>
      <MetadataListItem label="Enrolled">
        {device.enrolledAt === null ? (
          <Text type="body" color="secondary">
            Pending first boot
          </Text>
        ) : (
          <Timestamp value={device.enrolledAt} format="date" />
        )}
      </MetadataListItem>
      <MetadataListItem label="Warranty">
        <HStack gap={2} vAlign="center">
          <Timestamp value={device.warrantyUntil} format="date" />
          {warrantyBadge(device.warrantyUntil)}
        </HStack>
      </MetadataListItem>
      <MetadataListItem label="Storage">
        <VStack gap={1}>
          <Text type="body" hasTabularNumbers>
            {device.storageUsedGb} of {meta.storageGb} GB ({storagePct}%)
          </Text>
          {/* Footgun: ProgressBar enforces minWidth 48 — pin minWidth 0 so
              the 96px-label metadata column can never blow out the panel. */}
          <ProgressBar
            label={\`Storage used on \${device.name}\`}
            isLabelHidden
            value={device.storageUsedGb}
            max={meta.storageGb}
            variant={storagePct >= 85 ? 'warning' : 'neutral'}
            style={styles.storageBar}
          />
        </VStack>
      </MetadataListItem>
      <MetadataListItem label="Last seen">
        {device.checkInMins === null ? (
          <Text type="body" color="secondary">
            Never — in transit
          </Text>
        ) : (
          <Timestamp value={checkInIso(device.checkInMins)} format="date_time" />
        )}
      </MetadataListItem>
    </MetadataList>
  );
}

function AssigneeSummary({device}: {device: DeviceRow}) {
  return (
    <VStack gap={2}>
      <Text type="label">Assigned to</Text>
      <HStack gap={2} vAlign="center">
        <Avatar name={device.assignee} size="small" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="body" maxLines={1}>
              {device.assignee}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {device.dept} · {device.office}
            </Text>
          </VStack>
        </StackItem>
        <IconButton
          label={\`Reassign \${device.name}\`}
          tooltip="Reassign"
          variant="ghost"
          size="sm"
          icon={<Icon icon={UserRoundIcon} size="sm" />}
        />
      </HStack>
    </VStack>
  );
}

function QuickPanel({
  device,
  selectedDevices,
  onLock,
  onPushUpdate,
}: {
  device: DeviceRow | null;
  selectedDevices: DeviceRow[];
  onLock: (ids: string[]) => void;
  onPushUpdate: (ids: string[]) => void;
}) {
  // 2+ checked rows: the panel becomes a selection summary so bulk totals
  // stay visible while the action bar is in use.
  if (selectedDevices.length > 1) {
    const encryptedCount = selectedDevices.filter(d => d.isEncrypted).length;
    const outdatedCount = selectedDevices.filter(
      d => d.osStatus !== 'current',
    ).length;
    return (
      <div style={styles.panelScroll}>
        <VStack gap={3}>
          <div style={styles.deviceTile}>
            <VStack gap={1} hAlign="center">
              <Heading level={3}>{selectedDevices.length} selected</Heading>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {encryptedCount} encrypted · {outdatedCount} need updates
              </Text>
            </VStack>
          </div>
          <VStack gap={2}>
            {selectedDevices.slice(0, 6).map(row => (
              <HStack key={row.id} gap={2} vAlign="center">
                <span style={{...styles.kindGlyph, color: kindColor(row.model)}}>
                  <Icon icon={kindIcon(row.model)} size="sm" color="inherit" />
                </span>
                <StackItem size="fill" style={{minWidth: 0}}>
                  <Text type="body" maxLines={1}>
                    {row.name}
                  </Text>
                </StackItem>
                <Token
                  size="sm"
                  color={STATUS_TOKEN[row.status].color}
                  label={STATUS_TOKEN[row.status].label}
                />
              </HStack>
            ))}
            {selectedDevices.length > 6 ? (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                +{selectedDevices.length - 6} more in the selection
              </Text>
            ) : null}
          </VStack>
          <Text type="supporting" color="secondary">
            Use the action bar above the table to lock the selection or push
            the pending OS update.
          </Text>
        </VStack>
      </div>
    );
  }

  if (device === null) {
    return (
      <div style={styles.panelScroll}>
        <EmptyState
          isCompact
          icon={<Icon icon={MonitorSmartphoneIcon} size="lg" />}
          title="No device selected"
          description="Select a row to see serial, warranty, storage, and compliance detail."
        />
      </div>
    );
  }

  const statusToken = STATUS_TOKEN[device.status];
  const canPushUpdate =
    device.status !== 'transit' && device.osStatus !== 'current';
  return (
    <div style={styles.panelScroll}>
      <VStack gap={4}>
        <div style={styles.deviceTile}>
          <span style={{...styles.kindGlyph, color: kindColor(device.model)}}>
            <Icon icon={kindIcon(device.model)} size="lg" color="inherit" />
          </span>
        </div>
        <VStack gap={1}>
          <Heading level={3}>{device.name}</Heading>
          <Text type="supporting" color="secondary">
            {MODEL_META[device.model].label}
          </Text>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Token size="sm" color={statusToken.color} label={statusToken.label} />
            {device.queuedAction === 'lock' ? (
              <Token size="sm" color="gray" label="Lock pending" />
            ) : null}
            {device.queuedAction === 'update' ? (
              <Token size="sm" color="blue" label="Update queued" />
            ) : null}
          </HStack>
        </VStack>

        {device.shipping !== undefined ? (
          <ShippingNotice shipping={device.shipping} />
        ) : null}

        {device.status !== 'transit' ? (
          <HStack gap={2}>
            <Button
              label="Lock"
              variant="secondary"
              size="sm"
              icon={<Icon icon={LockIcon} size="sm" />}
              isDisabled={device.queuedAction === 'lock'}
              onClick={() => onLock([device.id])}
            />
            <Button
              label="Push update"
              variant="secondary"
              size="sm"
              icon={<Icon icon={DownloadIcon} size="sm" />}
              isDisabled={!canPushUpdate || device.queuedAction === 'update'}
              onClick={() => onPushUpdate([device.id])}
            />
            <DropdownMenu
              button={{
                label: 'More device actions',
                variant: 'ghost',
                size: 'sm',
                isIconOnly: true,
                icon: <Icon icon={WrenchIcon} size="sm" />,
              }}
              hasChevron={false}
              menuWidth={220}
              items={[
                {
                  label: 'Restart device',
                  icon: <Icon icon={RefreshCwIcon} size="sm" color="inherit" />,
                  onClick: () => {},
                },
                {type: 'divider' as const},
                {
                  label: 'Retire device',
                  icon: <Icon icon={ArchiveIcon} size="sm" color="inherit" />,
                  onClick: () => {},
                },
              ]}
            />
          </HStack>
        ) : null}

        <ViolationList device={device} />
        <Divider />
        <DeviceMetadata device={device} />
        <Divider />
        <AssigneeSummary device={device} />
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

interface SummaryChip {
  scope: ScopeFilter;
  icon: typeof LaptopIcon;
  count: number;
  text: string;
  /** Count-dot color matches the scope's status color in the table. */
  dot: string | null;
}

const SUMMARY_CHIPS: SummaryChip[] = [
  {scope: 'all', icon: MonitorSmartphoneIcon, count: SUMMARY.total, text: 'devices', dot: null},
  {scope: 'encrypted', icon: ShieldCheckIcon, count: SUMMARY.encrypted, text: 'encrypted', dot: 'var(--color-success)'},
  {scope: 'noncompliant', icon: ShieldOffIcon, count: SUMMARY.noncompliant, text: 'non-compliant', dot: 'var(--color-error)'},
  // In-transit reads blue everywhere else (STATUS_TOKEN + panel tokens), so
  // the chip dot rides the same blue instead of the warning palette.
  {scope: 'transit', icon: TruckIcon, count: SUMMARY.transit, text: 'in transit', dot: KIND_COLOR.blue},
];

export default function ItDeviceInventoryTemplate() {
  const [devices, setDevices] = useState<DeviceRow[]>(INITIAL_DEVICES);
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<ScopeFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [violationFilter, setViolationFilter] = useState<Violation | null>(null);
  const [activeId, setActiveId] = useState<string | null>('d-ravi-mbp');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px drops the quick panel; <=860px drops the
  // Encryption and Last check-in columns and collapses bulk-bar labels.
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const changeScope = (nextScope: ScopeFilter) => {
    setScope(nextScope);
    if (nextScope !== 'noncompliant') {
      setViolationFilter(null);
    }
  };

  // Pressing a violation pill always narrows to the non-compliant scope.
  const changeViolation = (violation: Violation | null) => {
    setViolationFilter(violation);
    setScope(violation === null ? 'all' : 'noncompliant');
  };

  // Scope + violation + kind + search filters, derived during render.
  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return devices.filter(row => {
      const inScope =
        scope === 'all' ||
        (scope === 'encrypted' && row.isEncrypted) ||
        (scope === 'noncompliant' && row.status === 'noncompliant') ||
        (scope === 'transit' && row.status === 'transit');
      if (!inScope) {
        return false;
      }
      if (violationFilter !== null && !row.violations.includes(violationFilter)) {
        return false;
      }
      if (typeFilter !== 'all' && MODEL_META[row.model].kind !== typeFilter) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      const haystack =
        \`\${row.name} \${MODEL_META[row.model].label} \${row.assignee} \${row.serial} \${row.assetTag}\`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [devices, scope, violationFilter, typeFilter, query]);

  // Sort plugin — default worst-posture-first (non-compliant, then the
  // in-transit shipments, then compliant by staleness).
  const {sortedData, sortConfig} = useTableSortableState<DeviceRow>({
    data: visibleRows,
    defaultSort: [{sortKey: 'status', direction: 'ascending'}],
    comparators: {
      status: (a, b) =>
        STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
        (b.checkInMins ?? -1) - (a.checkInMins ?? -1),
      name: (a, b) => a.name.localeCompare(b.name),
      assignee: (a, b) => a.assignee.localeCompare(b.assignee),
      os: (a, b) => a.os.localeCompare(b.os),
      isEncrypted: (a, b) => Number(a.isEncrypted) - Number(b.isEncrypted),
      checkInMins: (a, b) =>
        (a.checkInMins ?? Number.MAX_SAFE_INTEGER) -
        (b.checkInMins ?? Number.MAX_SAFE_INTEGER),
    },
  });
  const sortPlugin = useTableSortable<DeviceRow>(sortConfig);

  // Selection plugin — operates on the visible (sorted) rows only, so
  // select-all never reaches into filtered-out scopes.
  const {selectionConfig} = useTableSelectionState<DeviceRow>({
    data: sortedData,
    idKey: 'id',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useTableSelection(selectionConfig);

  // Row-click plugin: clicking anywhere on a row makes it the quick-panel
  // subject (checkbox clicks bubble here too — matches office-shared-drive).
  const activePlugin = useMemo<TablePlugin<DeviceRow>>(
    () => ({
      transformBodyRow: (props, item) => {
        const prevOnClick = props.htmlProps.onClick;
        const isActive = item.id === activeId;
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            onClick: event => {
              prevOnClick?.(event);
              setActiveId(item.id);
            },
            'aria-selected': isActive || undefined,
            style: {
              ...props.htmlProps.style,
              cursor: 'pointer',
              // Inset outline so the active row never bleeds onto neighbors.
              ...(isActive
                ? {boxShadow: 'inset 2px 0 0 var(--color-accent)'}
                : null),
            },
          },
        };
      },
    }),
    [activeId],
  );

  const columns = useMemo(() => buildColumns(isCompact), [isCompact]);

  const selectedDevices = sortedData.filter(row => selectedKeys.has(row.id));
  const selectedCount = selectedDevices.length;
  const deviceWord = selectedCount === 1 ? 'device' : 'devices';
  const activeDevice = devices.find(row => row.id === activeId) ?? null;

  const clearSelection = () => setSelectedKeys(new Set());

  const lockDevices = (ids: string[]) => {
    const idSet = new Set(ids);
    const eligible = devices.filter(
      row => idSet.has(row.id) && row.status !== 'transit',
    ).length;
    setDevices(prev =>
      prev.map(row =>
        idSet.has(row.id) && row.status !== 'transit'
          ? {...row, queuedAction: 'lock' as const}
          : row,
      ),
    );
    setAnnouncement(
      eligible === 0
        ? 'In-transit devices cannot be locked before enrollment'
        : \`Remote lock queued for \${eligible} \${eligible === 1 ? 'device' : 'devices'}\`,
    );
    clearSelection();
  };

  const pushUpdates = (ids: string[]) => {
    const idSet = new Set(ids);
    const eligible = devices.filter(
      row =>
        idSet.has(row.id) &&
        row.status !== 'transit' &&
        row.osStatus !== 'current',
    ).length;
    setDevices(prev =>
      prev.map(row =>
        idSet.has(row.id) && row.status !== 'transit' && row.osStatus !== 'current'
          ? {...row, queuedAction: 'update' as const}
          : row,
      ),
    );
    setAnnouncement(
      eligible === 0
        ? 'No selected devices need an OS update'
        : \`OS update pushed to \${eligible} \${eligible === 1 ? 'device' : 'devices'}\`,
    );
    clearSelection();
  };

  // ----- header: brand, search, Sync MDM, panel toggle -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={MonitorSmartphoneIcon} size="md" color="secondary" />
          <Heading level={1}>Device Inventory</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · MDM
          </Text>
        </HStack>
        <StackItem size="fill">
          <TextInput
            label="Search devices"
            isLabelHidden
            size="sm"
            width="100%"
            style={{maxWidth: 480}}
            placeholder="Search device, employee, serial, asset tag…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        <Button
          label="Sync MDM"
          variant="secondary"
          size="sm"
          icon={<Icon icon={RefreshCwIcon} size="sm" />}
          isIconOnly={isCompact}
          tooltip={isCompact ? 'Sync MDM' : 'Last sync 16:00 UTC'}
          onClick={() =>
            setAnnouncement('MDM sync complete — 142 endpoints reported')
          }
        />
        {!isPanelHidden && (
          <IconButton
            label={isPanelOpen ? 'Hide device panel' : 'Show device panel'}
            tooltip={isPanelOpen ? 'Hide details' : 'Show details'}
            size="sm"
            variant={isPanelOpen ? 'secondary' : 'ghost'}
            icon={<Icon icon={PanelRightIcon} size="sm" />}
            onClick={() => setIsPanelOpen(open => !open)}
          />
        )}
      </HStack>
    </LayoutHeader>
  );

  // ----- summary chips: clickable fleet-posture scopes -----
  const chipToolbar = (
    <HStack gap={3} vAlign="center" style={styles.chipToolbar} wrap="wrap">
      <HStack gap={2} vAlign="center" wrap="wrap">
        {SUMMARY_CHIPS.map(chip => (
          <ToggleButton
            key={chip.scope}
            label={\`\${chip.count} \${chip.text}\`}
            size="sm"
            isPressed={scope === chip.scope}
            onPressedChange={isPressed =>
              changeScope(isPressed ? chip.scope : 'all')
            }>
            <HStack gap={1} vAlign="center">
              <Icon icon={chip.icon} size="xsm" color="inherit" />
              {chip.dot !== null ? (
                <span
                  style={{...styles.chipCountDot, backgroundColor: chip.dot}}
                  aria-hidden
                />
              ) : null}
              <Text type="inherit" hasTabularNumbers style={styles.chipCount}>
                {chip.count}
              </Text>
              <Text type="inherit">{chip.text}</Text>
            </HStack>
          </ToggleButton>
        ))}
      </HStack>
      <StackItem size="fill" />
      <SegmentedControl
        label="Device kind"
        value={typeFilter}
        onChange={value => setTypeFilter(value as TypeFilter)}
        size="sm">
        <SegmentedControlItem label="All" value="all" />
        <SegmentedControlItem label="Laptops" value="laptop" />
        <SegmentedControlItem label="Phones" value="phone" />
      </SegmentedControl>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {sortedData.length} of {SUMMARY.total} devices
      </Text>
    </HStack>
  );

  // ----- non-compliant filter pill row -----
  const pillRow = (
    <HStack gap={2} vAlign="center" style={styles.pillRow} wrap="wrap">
      <Text type="supporting" color="secondary">
        Non-compliant:
      </Text>
      {VIOLATION_ORDER.map(violation => (
        <ToggleButton
          key={violation}
          label={\`\${VIOLATION_LABEL[violation]} — \${VIOLATION_COUNTS[violation]} devices\`}
          size="sm"
          isPressed={violationFilter === violation}
          onPressedChange={isPressed =>
            changeViolation(isPressed ? violation : null)
          }>
          <HStack gap={1} vAlign="center">
            <Text type="inherit">{VIOLATION_LABEL[violation]}</Text>
            <Text type="inherit" hasTabularNumbers style={styles.chipCount}>
              {VIOLATION_COUNTS[violation]}
            </Text>
          </HStack>
        </ToggleButton>
      ))}
    </HStack>
  );

  // ----- bulk action bar: appears while any row is checked -----
  const selectedIds = selectedDevices.map(row => row.id);
  const bulkBar =
    selectedCount === 0 ? null : (
      <div style={styles.bulkBar}>
        <Toolbar
          label="Bulk device actions"
          size="sm"
          gap={2}
          variant="section"
          dividers={['bottom', 'top']}
          startContent={
            <HStack gap={2} vAlign="center">
              <Text type="label">
                {selectedCount} {deviceWord} selected
              </Text>
              <Button
                label="Clear"
                variant="ghost"
                size="sm"
                icon={<Icon icon={XIcon} size="sm" />}
                isIconOnly={isCompact}
                tooltip={isCompact ? 'Clear selection' : undefined}
                onClick={clearSelection}
              />
            </HStack>
          }
          endContent={
            <HStack gap={2} vAlign="center">
              <Button
                label="Lock"
                variant="secondary"
                size="sm"
                icon={<Icon icon={LockIcon} size="sm" />}
                isIconOnly={isCompact}
                tooltip={isCompact ? 'Lock devices' : 'Queue a remote lock'}
                onClick={() => lockDevices(selectedIds)}
              />
              <Button
                label="Push update"
                variant="secondary"
                size="sm"
                icon={<Icon icon={DownloadIcon} size="sm" />}
                isIconOnly={isCompact}
                tooltip={
                  isCompact ? 'Push update' : 'Push the pending OS update'
                }
                onClick={() => pushUpdates(selectedIds)}
              />
              <DropdownMenu
                button={{
                  label: 'More bulk actions',
                  variant: 'ghost',
                  size: 'sm',
                  isIconOnly: true,
                  icon: <Icon icon={WrenchIcon} size="sm" />,
                }}
                hasChevron={false}
                menuWidth={220}
                items={[
                  {
                    label: 'Reassign owners',
                    icon: <Icon icon={UserRoundIcon} size="sm" color="inherit" />,
                    onClick: () => {},
                  },
                  {
                    label: 'Export selection (CSV)',
                    icon: <Icon icon={PackageIcon} size="sm" color="inherit" />,
                    onClick: () => {},
                  },
                  {type: 'divider' as const},
                  {
                    label: 'Retire devices',
                    icon: <Icon icon={ArchiveIcon} size="sm" color="inherit" />,
                    onClick: () => {},
                  },
                ]}
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
              {chipToolbar}
              {pillRow}
              {bulkBar}
              <div style={styles.tableScroll}>
                <Table<DeviceRow>
                  data={sortedData}
                  columns={columns}
                  idKey="id"
                  density="balanced"
                  dividers="rows"
                  hasHover
                  plugins={{
                    selection: selectionPlugin,
                    sort: sortPlugin,
                    active: activePlugin,
                  }}
                  emptyState={
                    <div style={styles.tableEmpty}>
                      <EmptyState
                        isCompact
                        icon={<Icon icon={SearchIcon} size="lg" />}
                        title="No devices match"
                        description="Clear the search or relax the posture, violation, and kind filters."
                      />
                    </div>
                  }
                />
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isPanelHidden && isPanelOpen ? (
            <LayoutPanel
              width={320}
              padding={0}
              hasDivider
              label="Device details">
              <QuickPanel
                device={activeDevice}
                selectedDevices={selectedDevices}
                onLock={lockDevices}
                onPushUpdate={pushUpdates}
              />
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
`;export{e as default};