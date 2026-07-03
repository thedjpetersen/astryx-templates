// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs endpoint-policy
 *   catalog (5 policies, per-department flagged-device rows, exception
 *   grants, an 8-week enforcement trend, fixed ISO timestamps in July 2026).
 *   No clocks, no randomness, no network media.
 * @output Endpoint Security Policies — the IT-admin policy center of the
 *   Kestrel Labs workforce platform (142 managed devices, 137 in policy
 *   scope). Five policy cards (Disk Encryption, Screen Lock, OS Updates,
 *   EDR Required, USB Storage) with enforcement pills, coverage meters, and
 *   platform icons; a department x policy compliance matrix whose cells
 *   drill into the selected-policy panel; an exceptions table with one
 *   expired grant flagged red; a Screen Lock draft-change banner
 *   (10 min -> 5 min, 34 devices affected) with a schedule-rollout action;
 *   an enforcement-trend mini chart; and a 340px policy inspector with an
 *   enforcement SegmentedControl and the flagged-device list.
 * @position Page template; emitted by `astryx template it-security-policies`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title + fleet chips + sync stamp)
 *   | content (draft banner, policy-card rack, matrix + trend row,
 *     exceptions table — one vertical scroller)
 *   | end panel 340 (policy inspector, scrolls independently).
 * Container policy: app-shell archetype — frame rows and panels only; the
 *   policy cards are styled clickable divs (selection state, aria-pressed),
 *   not Cards; matrix and chart are styled divs inside framed sections.
 * Color policy: token-pure everywhere; the only literals are the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens used
 *   for policy glyphs, matrix cell states, and the trend bars (the demo
 *   does not inject `--color-data-categorical-*`).
 *
 * Responsive contract:
 * - > 1180px: full frame with the 340px inspector panel.
 * - <= 1180px: the inspector is dropped — the cards, matrix, and
 *   exceptions table remain the source of truth.
 * - The card rack auto-fits (185px floor) and the trend chart wraps under
 *   the matrix whenever the matrix cannot keep all 5 policy columns —
 *   both are container-width driven, so the demo's narrow preview panel
 *   lays out correctly even though media queries see the full window.
 * - <= 900px: the card rack wraps 2-up, the matrix and exceptions table
 *   scroll horizontally inside their sections (deliberate), and the
 *   header chip row wraps.
 * - The content column is the single vertical scroller; the inspector
 *   scrolls independently (`minHeight: 0` down both flex chains).
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  CalendarClockIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ClockIcon,
  HardDriveIcon,
  HistoryIcon,
  LaptopIcon,
  LockIcon,
  MonitorIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  ShieldIcon,
  SmartphoneIcon,
  UsbIcon,
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
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  headerBar: {padding: 'var(--spacing-3) var(--spacing-4)'},
  headerChips: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)', alignItems: 'center'},
  fleetChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px',
    borderRadius: 999, border: 'var(--border-width) solid var(--color-border)',
    fontSize: 12, fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)', whiteSpace: 'nowrap',
  },
  syncStamp: {display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'},
  // Content column --------------------------------------------------------
  contentScroll: {
    height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)',
  },
  sectionHead: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  // Policy card rack — auto-fit so cards wrap instead of crushing their
  // labels when the content column narrows (5-up only when they all fit).
  cardRack: {display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 'var(--spacing-3)'},
  cardRackCompact: {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'},
  policyCard: {
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) 10px', borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    textAlign: 'start', cursor: 'pointer', font: 'inherit', color: 'inherit', minWidth: 0,
  },
  // Inset outline so selection never bleeds onto grid neighbors.
  policyCardActive: {boxShadow: 'inset 0 0 0 2px var(--color-accent)', borderColor: 'transparent'},
  policyGlyph: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 24, height: 24, borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)', flexShrink: 0,
  },
  enforcePill: {
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '1px 6px',
    borderRadius: 999, fontSize: 10, fontWeight: 600, letterSpacing: '0.01em',
    textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
  },
  platformRow: {display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary)'},
  coverageNums: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Framed sections --------------------------------------------------------
  section: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    display: 'flex', flexDirection: 'column', minWidth: 0,
  },
  sectionBar: {
    padding: 'var(--spacing-2) var(--spacing-3)', display: 'flex',
    alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap',
  },
  sectionBody: {padding: 'var(--spacing-3)', paddingTop: 0},
  // Flex-wrap row: side-by-side only when the matrix keeps its full 620px
  // (all 5 policy columns visible); otherwise the trend wraps below.
  matrixTrendRow: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)', alignItems: 'stretch'},
  matrixFlex: {flex: '99 1 620px', minWidth: 0},
  trendFlex: {flex: '1 1 300px', minWidth: 280},
  // Compliance matrix ------------------------------------------------------
  matrixScroll: {overflowX: 'auto', padding: '0 var(--spacing-3) var(--spacing-3)'},
  matrixGrid: {display: 'grid', minWidth: 620, alignItems: 'stretch'},
  // Two-line policy header (icon + short name / pill) — never overlaps a
  // neighbor even at the 94px column floor.
  matrixHeadCell: {
    padding: '6px 8px', borderBottom: 'var(--border-width) solid var(--color-border)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'flex-end', gap: 3, minWidth: 0,
  },
  matrixHeadName: {display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: '100%', minWidth: 0},
  matrixHeadDept: {
    padding: '6px 10px', borderBottom: 'var(--border-width) solid var(--color-border)',
    display: 'flex', alignItems: 'flex-end',
  },
  matrixDeptCell: {
    padding: '7px 10px', display: 'flex', alignItems: 'baseline', gap: 6,
    whiteSpace: 'nowrap', borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  matrixCell: {
    margin: 0, padding: '5px 10px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 1,
    cursor: 'pointer', font: 'inherit', color: 'inherit', backgroundColor: 'transparent',
    border: 'none', borderBottom: 'var(--border-width) solid var(--color-border)',
    minWidth: 0,
  },
  matrixCellActive: {boxShadow: 'inset 0 0 0 2px var(--color-accent)', borderRadius: 6},
  matrixPct: {fontVariantNumeric: 'tabular-nums', fontSize: 13, fontWeight: 600, lineHeight: 1.2},
  matrixSub: {fontSize: 10.5, lineHeight: 1.2, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap'},
  matrixTotalCell: {padding: '7px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1},
  // Enforcement trend chart ------------------------------------------------
  chartArea: {display: 'flex', gap: 8, padding: '0 var(--spacing-3)'},
  chartYAxis: {
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    alignItems: 'flex-end', width: 34, flexShrink: 0,
    // Extend past the plot so the axis labels center on the gridlines.
    margin: '-6px 0',
  },
  chartPlot: {position: 'relative', flex: 1, minWidth: 0, height: 120},
  chartGridline: {position: 'absolute', insetInline: 0, borderTop: 'var(--border-width) dashed var(--color-border)'},
  chartBars: {position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 6},
  chartBarSlot: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%'},
  chartBar: {
    width: '100%', maxWidth: 42, borderRadius: '3px 3px 0 0',
    backgroundColor: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  },
  chartBarEvent: {backgroundColor: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))'},
  chartXAxis: {display: 'flex', gap: 6, padding: '4px var(--spacing-3) 0', marginInlineStart: 42},
  chartXLabel: {
    flex: 1, minWidth: 0, textAlign: 'center', fontSize: 10,
    color: 'var(--color-text-secondary)', whiteSpace: 'nowrap',
  },
  eventRow: {display: 'flex', alignItems: 'flex-start', gap: 8, minWidth: 0},
  eventDot: {
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
    backgroundColor: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  },
  // Exceptions table -------------------------------------------------------
  exceptionsScroll: {overflowX: 'auto', padding: '0 var(--spacing-3) var(--spacing-3)'},
  expiredText: {color: 'light-dark(#DC2626, #F87171)', fontWeight: 600, whiteSpace: 'nowrap'},
  monoText: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  },
  // Inspector panel --------------------------------------------------------
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  panelScroll: {
    flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)',
  },
  flaggedRow: {display: 'flex', alignItems: 'center', gap: 8, minWidth: 0},
  deptChip: {
    display: 'inline-flex', alignItems: 'center', padding: '0 7px',
    borderRadius: 999, border: 'var(--border-width) solid var(--color-border)',
    fontSize: 10.5, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap',
  },
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard `light-dark()` fallback pair.
const PALETTE = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  red: 'light-dark(#DC2626, #F87171)',
} as const;

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs, a 140-person platform
// company (Engineering 52, Design 18, GTM 34, Ops 16, Finance 8, People 12).
// The MDM fleet matches `it-device-inventory`: 142 managed devices, 5 in
// transit (incl. the Ava Lindqvist / Ken Tanaka new-hire laptops), so 137
// active endpoints sit in policy scope. Encryption-off 6 and OS-out-of-
// policy 3 reconcile with that template's violation pills. All timestamps
// are fixed ISO strings in early July 2026.
// ---------------------------------------------------------------------------

type EnforcementLevel = 'enforce' | 'warn' | 'report';
type PolicyId = 'encryption' | 'screenlock' | 'osupdate' | 'edr' | 'usb';
type Dept = 'Engineering' | 'Design' | 'GTM' | 'Ops' | 'Finance' | 'People';
type Platform = 'macos' | 'windows' | 'mobile';

const FLEET = {
  managed: 142,
  inTransit: 5,
  inScope: 137, // managed - inTransit; every policy denominator below.
  lastSyncAt: '2026-07-02T16:40:00Z',
} as const;

const ENFORCEMENT_META: Record<
  EnforcementLevel,
  {label: string; color: string; bg: string; help: string}
> = {
  enforce: {
    label: 'Enforce',
    color: 'light-dark(#0B991F, #34C759)',
    bg: 'light-dark(rgba(11,153,31,0.12), rgba(52,199,89,0.16))',
    help: 'Non-compliant devices are blocked from company resources.',
  },
  warn: {
    label: 'Warn',
    color: 'light-dark(#B45309, #FBBF24)',
    bg: 'light-dark(rgba(180,83,9,0.12), rgba(251,191,36,0.14))',
    help: 'Owners get a nag with a remediation deadline; access stays on.',
  },
  report: {
    label: 'Report',
    color: 'light-dark(#475569, #94A3B8)',
    bg: 'light-dark(rgba(71,85,105,0.10), rgba(148,163,184,0.14))',
    help: 'Silent telemetry only — violations are logged, never surfaced.',
  },
};

const PLATFORM_META: Record<Platform, {label: string; icon: typeof LaptopIcon}> = {
  macos: {label: 'macOS', icon: LaptopIcon},
  windows: {label: 'Windows', icon: MonitorIcon},
  mobile: {label: 'iOS / Android', icon: SmartphoneIcon},
};

interface Policy {
  id: PolicyId;
  name: string;
  /** Compact label for the matrix column headers (94px floor). */
  shortName: string;
  glyph: typeof LaptopIcon;
  glyphColor: string;
  level: EnforcementLevel;
  platforms: Platform[];
  summary: string;
  rules: Array<{label: string; value: string}>;
  lastChangedBy: string;
  lastChangedAt: string;
  note?: string;
}

const POLICIES: Policy[] = [
  {
    id: 'encryption',
    name: 'Disk Encryption',
    shortName: 'Encryption',
    glyph: HardDriveIcon,
    glyphColor: PALETTE.blue,
    level: 'enforce',
    platforms: ['macos', 'windows'],
    summary:
      'FileVault / BitLocker must be on with the recovery key escrowed to MDM.',
    rules: [
      {label: 'Requirement', value: 'Full-disk encryption on'},
      {label: 'Recovery key', value: 'Escrowed to MDM'},
      {label: 'Grace period', value: '24h after enrollment'},
    ],
    lastChangedBy: 'Tom Okonkwo',
    lastChangedAt: '2026-04-14T09:20:00Z',
  },
  {
    id: 'screenlock',
    name: 'Screen Lock',
    shortName: 'Screen Lock',
    glyph: LockIcon,
    glyphColor: PALETTE.teal,
    level: 'enforce',
    platforms: ['macos', 'windows', 'mobile'],
    summary:
      'Idle screens must lock and require a password (or biometric) to resume.',
    rules: [
      {label: 'Max idle', value: '10 min (draft: 5 min)'},
      {label: 'Re-auth', value: 'Immediately on wake'},
      {label: 'Mobile', value: 'Passcode + Face/Touch ID'},
    ],
    lastChangedBy: 'Tom Okonkwo',
    lastChangedAt: '2026-05-06T14:05:00Z',
  },
  {
    id: 'osupdate',
    name: 'OS Updates',
    shortName: 'OS Updates',
    glyph: RefreshCwIcon,
    glyphColor: PALETTE.green,
    level: 'enforce',
    platforms: ['macos', 'windows', 'mobile'],
    summary:
      'Devices must run an OS released or patched within the last 60 days.',
    rules: [
      {label: 'Max patch age', value: '60 days'},
      {label: 'Deferral', value: 'Up to 14 days, then forced'},
      {label: 'Install window', value: '02:00–05:00 local'},
    ],
    lastChangedBy: 'Tom Okonkwo',
    lastChangedAt: '2026-06-03T10:12:00Z',
    note: 'Moved from Warn to Enforce on Jun 3 after the deferral window closed.',
  },
  {
    id: 'edr',
    name: 'EDR Required',
    shortName: 'EDR',
    glyph: ShieldCheckIcon,
    glyphColor: PALETTE.purple,
    level: 'warn',
    platforms: ['macos', 'windows'],
    summary:
      'The CrowdStrike Falcon sensor must be installed, healthy, and phoning home.',
    rules: [
      {label: 'Sensor', value: 'Falcon ≥ 7.16'},
      {label: 'Health check', value: 'Heartbeat < 24h old'},
      {label: 'Tamper', value: 'Uninstall token required'},
    ],
    lastChangedBy: 'Tom Okonkwo',
    lastChangedAt: '2026-06-17T11:30:00Z',
    note: 'Pilot moved from Report to Warn on Jun 17; Enforce planned for Aug 1.',
  },
  {
    id: 'usb',
    name: 'USB Storage',
    shortName: 'USB',
    glyph: UsbIcon,
    glyphColor: PALETTE.orange,
    level: 'report',
    platforms: ['macos', 'windows'],
    summary:
      'Mounting removable mass storage is logged; write access needs an exception.',
    rules: [
      {label: 'Mount events', value: 'Logged to MDM'},
      {label: 'Write access', value: 'Exception required'},
      {label: 'Mobile', value: 'Out of scope — counted compliant'},
    ],
    lastChangedBy: 'Tom Okonkwo',
    lastChangedAt: '2026-05-20T15:45:00Z',
  },
];

const POLICY_BY_ID = new Map(POLICIES.map(policy => [policy.id, policy]));

// Canonical department headcounts sum to 140; device counts sum to the
// 137 in-scope endpoints (the 5 in-transit units are unassigned to scope).
const DEPARTMENTS: Array<{dept: Dept; headcount: number; devices: number}> = [
  {dept: 'Engineering', headcount: 52, devices: 51},
  {dept: 'Design', headcount: 18, devices: 18},
  {dept: 'GTM', headcount: 34, devices: 33},
  {dept: 'Ops', headcount: 16, devices: 15},
  {dept: 'Finance', headcount: 8, devices: 8},
  {dept: 'People', headcount: 12, devices: 12},
];

// Every flagged (non-compliant) device, one row each. The matrix, the
// policy-card coverage meters, the header chips, and the inspector list are
// all DERIVED from this single list, so the numbers reconcile by
// construction: encryption 6 · screenlock 2 · osupdate 3 · edr 13 · usb 8.
interface FlaggedDevice {
  policy: PolicyId;
  dept: Dept;
  owner: string;
  host: string;
  detail: string;
}

const FLAGGED: FlaggedDevice[] = [
  // Disk Encryption — 6 (matches the device-inventory "Encryption off 6").
  {policy: 'encryption', dept: 'Engineering', owner: 'Rhea Solano', host: 'kl-rhea-s-mbp16', detail: 'FileVault off since re-image'},
  {policy: 'encryption', dept: 'Engineering', owner: 'Dev Batra', host: 'kl-dev-b-mbp14', detail: 'Recovery key not escrowed'},
  {policy: 'encryption', dept: 'GTM', owner: 'Jonah Fields', host: 'kl-jonah-f-mbp14', detail: 'Expired kiosk exception (KL-MBP-0104)'},
  {policy: 'encryption', dept: 'GTM', owner: 'Carla Mendes', host: 'kl-carla-m-air13', detail: 'FileVault deferred 3×'},
  {policy: 'encryption', dept: 'GTM', owner: 'Ben Ashworth', host: 'kl-ben-a-mbp14', detail: 'Recovery key not escrowed'},
  {policy: 'encryption', dept: 'Ops', owner: 'Yusuf Adeyemi', host: 'kl-yusuf-a-mbp14', detail: 'FileVault off since re-image'},
  // Screen Lock — 2.
  {policy: 'screenlock', dept: 'Design', owner: 'Milo Grant', host: 'kl-milo-g-mbp16', detail: 'Idle lock set to 20 min'},
  {policy: 'screenlock', dept: 'GTM', owner: 'Tessa Bright', host: 'kl-tessa-b-iph15', detail: 'No passcode on managed phone'},
  // OS Updates — 3 (matches the device-inventory "OS out of policy 3").
  {policy: 'osupdate', dept: 'Engineering', owner: 'Marcus Webb', host: 'kl-marcus-w-mbp16', detail: 'macOS 15.2 — 74 days stale'},
  {policy: 'osupdate', dept: 'GTM', owner: 'Ines Duarte', host: 'kl-ines-d-air13', detail: 'Deferral window exhausted'},
  {policy: 'osupdate', dept: 'People', owner: 'Grace Njeri', host: 'kl-grace-n-mbp14', detail: 'Pending 02:00 install window'},
  // EDR Required — 13 (Warn pilot since Jun 17; Enforce planned Aug 1).
  {policy: 'edr', dept: 'Engineering', owner: 'Petra Kovac', host: 'kl-petra-k-mbp16', detail: 'Sensor never installed'},
  {policy: 'edr', dept: 'Engineering', owner: 'Sam Whitaker', host: 'kl-sam-w-mbp14', detail: 'Heartbeat 6 days stale'},
  {policy: 'edr', dept: 'Engineering', owner: 'Lena Fischer', host: 'kl-lena-f-mbp16', detail: 'Falcon 7.12 — below floor'},
  {policy: 'edr', dept: 'Engineering', owner: 'Owen Reyes', host: 'kl-owen-r-mbp14', detail: 'Sensor in reduced-functionality mode'},
  {policy: 'edr', dept: 'Design', owner: 'Sofia Ortiz', host: 'kl-sofia-o-mbp16', detail: 'Sensor never installed'},
  {policy: 'edr', dept: 'Design', owner: 'Nils Bergman', host: 'kl-nils-b-mbp14', detail: 'Falcon 7.14 — below floor'},
  {policy: 'edr', dept: 'GTM', owner: 'Aisha Bello', host: 'kl-aisha-b-air13', detail: 'Sensor never installed'},
  {policy: 'edr', dept: 'GTM', owner: 'Ravi Menon', host: 'kl-ravi-m-mbp14', detail: 'Sensor never installed'},
  {policy: 'edr', dept: 'GTM', owner: 'Chloe Paquet', host: 'kl-chloe-p-air13', detail: 'Heartbeat 3 days stale'},
  {policy: 'edr', dept: 'GTM', owner: 'Diego Salas', host: 'kl-diego-s-mbp14', detail: 'Sensor never installed'},
  {policy: 'edr', dept: 'GTM', owner: 'Hana Yoshida', host: 'kl-hana-y-air13', detail: 'Falcon 7.15 — below floor'},
  {policy: 'edr', dept: 'Ops', owner: 'Piotr Zielinski', host: 'kl-piotr-z-mbp14', detail: 'Sensor never installed'},
  {policy: 'edr', dept: 'People', owner: 'Dana Whitfield', host: 'kl-dana-w-mbp14', detail: 'Heartbeat 2 days stale'},
  // USB Storage — 8 devices with mount events in the last 30 days (Report).
  {policy: 'usb', dept: 'Engineering', owner: 'Felix Marsh', host: 'kl-felix-m-mbp16', detail: '3 mounts — firmware flash drive'},
  {policy: 'usb', dept: 'Engineering', owner: 'Ada Lindgren', host: 'kl-ada-l-mbp14', detail: '1 mount — conference USB-C hub'},
  {policy: 'usb', dept: 'Engineering', owner: 'Tomas Ruiz', host: 'kl-tomas-r-mbp16', detail: '2 mounts — unlabeled drive'},
  {policy: 'usb', dept: 'GTM', owner: 'Priya Nair', host: 'kl-priya-n-air13', detail: '4 mounts — booth media kit'},
  {policy: 'usb', dept: 'GTM', owner: 'Mark Sillanpaa', host: 'kl-mark-s-mbp14', detail: '1 mount — customer handoff'},
  {policy: 'usb', dept: 'Ops', owner: 'June Park', host: 'kl-june-p-mbp14', detail: '2 mounts — badge printer install'},
  {policy: 'usb', dept: 'Ops', owner: 'Noor Haddad', host: 'kl-noor-h-mbp14', detail: '1 mount — AV closet console'},
  {policy: 'usb', dept: 'Finance', owner: 'Elena Voss', host: 'kl-elena-v-mbp14', detail: '1 mount — auditor evidence drive'},
];

// Exception grants — devices excused from a policy check until expiry.
// KL-MBP-0104 (Jonah Fields) expired Jun 28 and is now counted in the
// encryption flagged list above — the red row below and the flagged row
// are the same device.
interface ExceptionRow extends Record<string, unknown> {
  id: string;
  assetTag: string;
  host: string;
  owner: string;
  policy: PolicyId;
  reason: string;
  approvedBy: string;
  expiresAt: string;
  isExpired: boolean;
}

// Tuple order: [id, assetTag, host, owner, policy, reason, approvedBy,
// expiresAt, isExpired].
const EXCEPTION_ROWS: Array<
  [string, string, string, string, PolicyId, string, string, string, boolean]
> = [
  ['exc-1', 'KL-MBP-0104', 'kl-jonah-f-mbp14', 'Jonah Fields', 'encryption',
    'Trade-show kiosk build — FileVault breaks the demo display loop',
    'Tom Okonkwo', '2026-06-28T00:00:00Z', true],
  ['exc-2', 'KL-MBP-0076', 'kl-victor-h-mbp16', 'Victor Hale', 'edr',
    'Perf-benchmark rig — Falcon sensor skews latency baselines',
    'Priya Raman', '2026-07-21T00:00:00Z', false],
  ['exc-3', 'KL-MBP-0087', 'kl-sofia-o-mbp16', 'Sofia Ortiz', 'usb',
    'Print-vendor handoff — Q3 brand kit ships on vendor media',
    'Tom Okonkwo', '2026-08-15T00:00:00Z', false],
  ['exc-4', 'KL-TAB-0311', 'kl-lobby-sched-01', 'Ops shared', 'screenlock',
    'Lobby room-scheduler tablet — kiosk mode, physically secured',
    'Tom Okonkwo', '2026-09-30T00:00:00Z', false],
  ['exc-5', 'KL-MBP-0150', 'kl-mira-c-mbp16', 'Mira Chen', 'osupdate',
    'Audio-driver cert pinned to macOS 15.3 until vendor re-signs',
    'Tom Okonkwo', '2026-07-12T00:00:00Z', false],
];

const EXCEPTIONS: ExceptionRow[] = EXCEPTION_ROWS.map(
  ([id, assetTag, host, owner, policy, reason, approvedBy, expiresAt, isExpired]) => ({
    id, assetTag, host, owner, policy, reason, approvedBy, expiresAt, isExpired,
  }),
);

// Policy-change draft — authored but not yet rolled out.
const DRAFT = {
  policy: 'screenlock' as PolicyId,
  change: 'Max idle 10 min → 5 min',
  affected: 34,
  author: 'Tom Okonkwo',
  authoredAt: '2026-07-01T18:22:00Z',
  rolloutAt: '2026-07-08T09:00:00Z', // Wed Jul 8, 02:00 PT maintenance window
} as const;

// Enforcement trend — % of the 685 weekly policy checks (137 devices × 5
// policies) passing, Mondays May 11 → Jun 29. The Jun 1 and Jun 15 weeks
// carry enforcement-change events (bars tinted purple, listed at right).
const TREND_FLOOR = 80;
const TREND_WEEKS: Array<{week: string; passing: number; hasEvent: boolean}> = [
  {week: 'May 11', passing: 88, hasEvent: false},
  {week: 'May 18', passing: 89, hasEvent: true}, // USB Storage report rollout
  {week: 'May 25', passing: 89, hasEvent: false},
  {week: 'Jun 1', passing: 91, hasEvent: true}, // OS Updates → Enforce
  {week: 'Jun 8', passing: 93, hasEvent: false},
  {week: 'Jun 15', passing: 92, hasEvent: true}, // EDR Report → Warn
  {week: 'Jun 22', passing: 94, hasEvent: false},
  {week: 'Jun 29', passing: 95, hasEvent: false}, // 653/685 checks = 95.3%
];

const TREND_EVENTS: Array<{date: string; text: string}> = [
  {date: 'May 20', text: 'USB Storage — Report mode rolled out fleet-wide'},
  {date: 'Jun 3', text: 'OS Updates — Warn → Enforce after deferral window'},
  {date: 'Jun 17', text: 'EDR Required — Report → Warn (Enforce Aug 1)'},
];

// ---------------------------------------------------------------------------
// DERIVED FIXTURES — computed once from FLAGGED so every panel that repeats
// a number agrees by construction.
// ---------------------------------------------------------------------------

/** flaggedCount.get(policyId) → fleet-wide non-compliant devices. */
const FLAGGED_BY_POLICY = new Map<PolicyId, FlaggedDevice[]>(
  POLICIES.map(policy => [
    policy.id,
    FLAGGED.filter(device => device.policy === policy.id),
  ]),
);

/** matrixFlagged.get(`${dept}|${policyId}`) → flagged rows for that cell. */
const MATRIX_FLAGGED = new Map<string, FlaggedDevice[]>();
for (const device of FLAGGED) {
  const key = `${device.dept}|${device.policy}`;
  const bucket = MATRIX_FLAGGED.get(key);
  if (bucket) {
    bucket.push(device);
  } else {
    MATRIX_FLAGGED.set(key, [device]);
  }
}

const TOTAL_CHECKS = FLEET.inScope * POLICIES.length; // 685
const TOTAL_FAILING = FLAGGED.length; // 32
const CHECKS_PASSING_PCT = Math.round(
  ((TOTAL_CHECKS - TOTAL_FAILING) / TOTAL_CHECKS) * 100,
); // 95

const ACTIVE_EXCEPTIONS = EXCEPTIONS.filter(row => !row.isExpired).length; // 4
const EXPIRED_EXCEPTIONS = EXCEPTIONS.length - ACTIVE_EXCEPTIONS; // 1

function compliantCount(policyId: PolicyId): number {
  return FLEET.inScope - (FLAGGED_BY_POLICY.get(policyId)?.length ?? 0);
}

function cellStats(dept: Dept, policyId: PolicyId): {
  devices: number;
  flagged: number;
  pct: number;
} {
  const deptRow = DEPARTMENTS.find(row => row.dept === dept);
  const devices = deptRow ? deptRow.devices : 0;
  const flagged = MATRIX_FLAGGED.get(`${dept}|${policyId}`)?.length ?? 0;
  return {
    devices,
    flagged,
    pct: devices === 0 ? 100 : Math.round(((devices - flagged) / devices) * 100),
  };
}

/** Matrix cell text color by compliance band: ≥98 default, 94–97 orange, <94 red. */
function pctColor(pct: number): string | undefined {
  if (pct < 94) {
    return PALETTE.red;
  }
  if (pct < 98) {
    return PALETTE.orange;
  }
  return undefined;
}

function shortDate(iso: string): string {
  const [, month, day] = iso.slice(0, 10).split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[Number(month) - 1]} ${Number(day)}, ${iso.slice(0, 4)}`;
}

// ---------------------------------------------------------------------------
// HEADER — title, fleet chips (each number reconciles with a section below),
// MDM sync stamp, and the New-policy action.
// ---------------------------------------------------------------------------

function FleetChip({icon, text}: {icon?: typeof ShieldIcon; text: string}) {
  return (
    <span style={styles.fleetChip}>
      {icon ? <Icon icon={icon} size="xsm" color="inherit" /> : null}
      {text}
    </span>
  );
}

function HeaderBar() {
  return (
    <VStack gap={2} style={styles.headerBar}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <Icon icon={ShieldIcon} size="md" color="secondary" />
          <VStack gap={0}>
            <Heading level={1}>Endpoint Security Policies</Heading>
            <Text type="supporting" color="secondary">
              Kestrel Labs · IT · MDM policy center
            </Text>
          </VStack>
        </HStack>
        <StackItem size="fill"><span /></StackItem>
        <Text type="supporting" color="secondary" style={styles.syncStamp}>
          <Icon icon={ClockIcon} size="xsm" color="inherit" />
          MDM sync <Timestamp value={FLEET.lastSyncAt} format="relative" />
        </Text>
        <Button
          label="New policy"
          variant="primary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" />}
        />
      </HStack>
      <div style={styles.headerChips}>
        <FleetChip icon={LaptopIcon} text={`${FLEET.managed} managed devices`} />
        <FleetChip
          icon={ShieldCheckIcon}
          text={`${FLEET.inScope} in policy scope · ${FLEET.inTransit} in transit`}
        />
        <FleetChip
          icon={CheckCircle2Icon}
          text={`${CHECKS_PASSING_PCT}% of ${TOTAL_CHECKS} checks passing`}
        />
        <FleetChip
          icon={CalendarClockIcon}
          text={`${ACTIVE_EXCEPTIONS} exceptions · ${EXPIRED_EXCEPTIONS} expired`}
        />
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// POLICY CARDS — one clickable card per policy: enforcement pill, coverage
// meter (compliant / 137), and affected-platform icons. Selection drives
// the inspector panel and the matrix column highlight.
// ---------------------------------------------------------------------------

function EnforcementPill({level}: {level: EnforcementLevel}) {
  const meta = ENFORCEMENT_META[level];
  return (
    <span
      style={{
        ...styles.enforcePill,
        color: meta.color,
        backgroundColor: meta.bg,
      }}>
      {meta.label}
    </span>
  );
}

function PlatformIcons({platforms}: {platforms: Platform[]}) {
  return (
    <span
      style={styles.platformRow}
      title={platforms.map(platform => PLATFORM_META[platform].label).join(' · ')}>
      {platforms.map(platform => (
        <Icon
          key={platform}
          icon={PLATFORM_META[platform].icon}
          size="xsm"
          color="inherit"
        />
      ))}
    </span>
  );
}

function PolicyCard({
  policy,
  level,
  isActive,
  onSelect,
}: {
  policy: Policy;
  level: EnforcementLevel;
  isActive: boolean;
  onSelect: (id: PolicyId) => void;
}) {
  const compliant = compliantCount(policy.id);
  const flagged = FLEET.inScope - compliant;
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={() => onSelect(policy.id)}
      style={{
        ...styles.policyCard,
        ...(isActive ? styles.policyCardActive : null),
      }}>
      <HStack gap={1} vAlign="center">
        <span style={{...styles.policyGlyph, color: policy.glyphColor}}>
          <Icon icon={policy.glyph} size="sm" color="inherit" />
        </span>
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="label" size="sm" maxLines={1}>
            {policy.name}
          </Text>
        </StackItem>
        <EnforcementPill level={level} />
      </HStack>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill" style={{minWidth: 0}}>
          {/* maxLines keeps the count from colliding with the flagged text
              when the rack is at its 185px column floor. */}
          <Text type="supporting" color="secondary" maxLines={1} style={{fontVariantNumeric: 'tabular-nums'}}>
            {compliant} of {FLEET.inScope} compliant
          </Text>
        </StackItem>
        <Text
          type="supporting"
          color={flagged === 0 ? 'secondary' : undefined}
          style={{
            ...styles.coverageNums,
            ...(flagged > 0 ? {color: PALETTE.red, fontWeight: 600} : null),
          }}>
          {flagged === 0 ? 'Clear' : `${flagged} flagged`}
        </Text>
      </HStack>
      {/* Footgun: ProgressBar enforces minWidth 48 — pin 0 for the card. */}
      <ProgressBar
        label={`${policy.name} coverage`}
        isLabelHidden
        value={compliant}
        max={FLEET.inScope}
        variant={flagged > 4 ? 'warning' : 'neutral'}
        style={{minWidth: 0}}
      />
      <HStack gap={2} vAlign="center">
        <PlatformIcons platforms={policy.platforms} />
        <StackItem size="fill"><span /></StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {Math.round((compliant / FLEET.inScope) * 100)}%
        </Text>
      </HStack>
    </button>
  );
}

// ---------------------------------------------------------------------------
// COMPLIANCE MATRIX — departments × policies. Each cell shows the percent
// compliant and the flagged count; clicking a cell selects the policy and
// scopes the inspector's flagged list to that department (the drill).
// ---------------------------------------------------------------------------

function MatrixCell({
  dept,
  policyId,
  isActive,
  onDrill,
}: {
  dept: Dept;
  policyId: PolicyId;
  isActive: boolean;
  onDrill: (policyId: PolicyId, dept: Dept) => void;
}) {
  const {devices, flagged, pct} = cellStats(dept, policyId);
  const policy = POLICY_BY_ID.get(policyId);
  return (
    <button
      type="button"
      onClick={() => onDrill(policyId, dept)}
      title={`${dept} · ${policy?.name ?? policyId} — view ${flagged === 0 ? `${devices} compliant devices` : `${flagged} flagged device${flagged === 1 ? '' : 's'}`}`}
      aria-label={`${dept}, ${policy?.name ?? policyId}: ${pct}% compliant, ${flagged} flagged of ${devices} devices. Drill in.`}
      style={{
        ...styles.matrixCell,
        ...(isActive ? styles.matrixCellActive : null),
      }}>
      <span style={{...styles.matrixPct, color: pctColor(pct)}}>{pct}%</span>
      <span style={styles.matrixSub}>
        {flagged === 0 ? `${devices} dev` : `${flagged} of ${devices}`}
      </span>
    </button>
  );
}

function ComplianceMatrix({
  levels,
  selectedPolicy,
  drillDept,
  onDrill,
}: {
  levels: Record<PolicyId, EnforcementLevel>;
  selectedPolicy: PolicyId;
  drillDept: Dept | null;
  onDrill: (policyId: PolicyId, dept: Dept) => void;
}) {
  return (
    <section style={{...styles.section, ...styles.matrixFlex}} aria-label="Compliance by department">
      <div style={styles.sectionBar}>
        <Heading level={3}>Compliance by department</Heading>
        <StackItem size="fill"><span /></StackItem>
        <Text type="supporting" color="secondary">
          Click a cell to drill into flagged devices
        </Text>
      </div>
      <div style={styles.matrixScroll}>
        <div
          style={{
            ...styles.matrixGrid,
            gridTemplateColumns: `150px repeat(${POLICIES.length}, minmax(94px, 1fr))`,
          }}>
          {/* Header row */}
          <div style={styles.matrixHeadDept}>
            <Text type="label" size="sm" color="secondary">
              Department
            </Text>
          </div>
          {POLICIES.map(policy => (
            <div key={policy.id} style={styles.matrixHeadCell}>
              {/* No glyph here — 94px columns need the full width for the
                  name; the pill carries the state, the cards carry color. */}
              <span style={styles.matrixHeadName}>
                <Text
                  type="label"
                  size="sm"
                  maxLines={1}
                  color={policy.id === selectedPolicy ? undefined : 'secondary'}>
                  {policy.shortName}
                </Text>
              </span>
              <EnforcementPill level={levels[policy.id]} />
            </div>
          ))}
          {/* Department rows */}
          {DEPARTMENTS.map(row => (
            <div key={row.dept} style={{display: 'contents'}}>
              <div style={styles.matrixDeptCell}>
                <Text type="label" size="sm">
                  {row.dept}
                </Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {row.devices} dev · {row.headcount} ppl
                </Text>
              </div>
              {POLICIES.map(policy => (
                <MatrixCell
                  key={policy.id}
                  dept={row.dept}
                  policyId={policy.id}
                  isActive={selectedPolicy === policy.id && drillDept === row.dept}
                  onDrill={onDrill}
                />
              ))}
            </div>
          ))}
          {/* Fleet total row — column sums match the policy-card meters. */}
          <div style={{...styles.matrixDeptCell, borderBottom: 'none'}}>
            <Text type="label" size="sm">
              All Kestrel
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {FLEET.inScope} dev · 140 ppl
            </Text>
          </div>
          {POLICIES.map(policy => {
            const compliant = compliantCount(policy.id);
            const pct = Math.round((compliant / FLEET.inScope) * 100);
            return (
              <div key={policy.id} style={styles.matrixTotalCell}>
                <span style={{...styles.matrixPct, color: pctColor(pct)}}>
                  {pct}%
                </span>
                <span style={styles.matrixSub}>
                  {compliant} of {FLEET.inScope}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ENFORCEMENT TREND — weekly % of policy checks passing (137 devices × 5
// policies = 685 checks). Y axis 80–100%, gridlines every 5 pts; purple
// bars mark weeks with an enforcement change, listed underneath.
// ---------------------------------------------------------------------------

const TREND_GRIDLINES = [100, 95, 90, 85, 80];

function EnforcementTrend() {
  return (
    <section style={{...styles.section, ...styles.trendFlex}} aria-label="Enforcement trend">
      <div style={styles.sectionBar}>
        <Heading level={3}>Checks passing — 8 weeks</Heading>
        <StackItem size="fill"><span /></StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {TOTAL_CHECKS - TOTAL_FAILING} / {TOTAL_CHECKS} this week
        </Text>
      </div>
      <div style={styles.chartArea}>
        <div style={styles.chartYAxis} aria-hidden>
          {TREND_GRIDLINES.map(line => (
            <span key={line} style={styles.matrixSub}>
              {line}%
            </span>
          ))}
        </div>
        <div style={styles.chartPlot}>
          {TREND_GRIDLINES.map(line => (
            <div
              key={line}
              aria-hidden
              style={{
                ...styles.chartGridline,
                top: `${((100 - line) / (100 - TREND_FLOOR)) * 100}%`,
              }}
            />
          ))}
          <div style={styles.chartBars}>
            {TREND_WEEKS.map(week => (
              <div key={week.week} style={styles.chartBarSlot}>
                <div
                  role="img"
                  aria-label={`Week of ${week.week}: ${week.passing}% of checks passing${week.hasEvent ? ' (enforcement change)' : ''}`}
                  title={`${week.week} — ${week.passing}%`}
                  style={{
                    ...styles.chartBar,
                    ...(week.hasEvent ? styles.chartBarEvent : null),
                    height: `${((week.passing - TREND_FLOOR) / (100 - TREND_FLOOR)) * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={styles.chartXAxis} aria-hidden>
        {/* Alternate labels — eight would collide when the chart shares a
            row with the matrix. */}
        {TREND_WEEKS.map((week, index) => (
          <span key={week.week} style={styles.chartXLabel}>
            {index % 2 === 0 ? week.week : ''}
          </span>
        ))}
      </div>
      <div style={{...styles.sectionBody, paddingTop: 'var(--spacing-2)'}}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Icon icon={HistoryIcon} size="xsm" color="secondary" />
            <Text type="label" size="sm" color="secondary">
              Enforcement changes (purple weeks)
            </Text>
          </HStack>
          {TREND_EVENTS.map(event => (
            <div key={event.date} style={styles.eventRow}>
              <span style={styles.eventDot} />
              <Text type="supporting" color="secondary">
                <strong>{event.date}</strong> — {event.text}
              </Text>
            </div>
          ))}
        </VStack>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// DRAFT BANNER — the pending Screen Lock tightening. Scheduling flips the
// banner to its confirmed state; discarding removes it for the session.
// ---------------------------------------------------------------------------

function DraftBanner({
  state,
  onSchedule,
  onDiscard,
  onReview,
}: {
  state: 'draft' | 'scheduled';
  onSchedule: () => void;
  onDiscard: () => void;
  onReview: () => void;
}) {
  const policy = POLICY_BY_ID.get(DRAFT.policy);
  if (state === 'scheduled') {
    return (
      <Banner
        status="success"
        icon={<Icon icon={CalendarClockIcon} size="sm" color="inherit" />}
        title={`Rollout scheduled — ${policy?.name ?? 'Screen Lock'}: ${DRAFT.change}`}
        description={`Applies ${shortDate(DRAFT.rolloutAt)} in the 02:00–05:00 local maintenance window. The ${DRAFT.affected} devices with idle locks between 5 and 10 minutes will re-sync first; owners were notified.`}
      />
    );
  }
  return (
    <Banner
      status="info"
      icon={<Icon icon={LockIcon} size="sm" color="inherit" />}
      title={`Draft policy change — ${policy?.name ?? 'Screen Lock'}: ${DRAFT.change}`}
      description={`${DRAFT.affected} of ${FLEET.inScope} devices currently lock between 5 and 10 minutes and would fall out of compliance until they re-sync. Drafted by ${DRAFT.author} · ${shortDate(DRAFT.authoredAt)}.`}
      defaultIsExpanded>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Button
          label="Schedule rollout"
          variant="primary"
          size="sm"
          icon={<Icon icon={CalendarClockIcon} size="sm" />}
          onClick={onSchedule}
        />
        <Button
          label={`Review ${DRAFT.affected} devices`}
          variant="secondary"
          size="sm"
          icon={<Icon icon={ChevronRightIcon} size="sm" />}
          onClick={onReview}
        />
        <Button
          label="Discard draft"
          variant="ghost"
          size="sm"
          icon={<Icon icon={XIcon} size="sm" />}
          onClick={onDiscard}
        />
        <StackItem size="fill"><span /></StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Proposed window: {shortDate(DRAFT.rolloutAt)} · 02:00–05:00 local
        </Text>
      </HStack>
    </Banner>
  );
}

// ---------------------------------------------------------------------------
// EXCEPTIONS TABLE — active grants excusing a device from one policy check.
// The expired Jonah Fields row renders red and is the same device now
// counted in the Disk Encryption flagged list (numbers agree).
// ---------------------------------------------------------------------------

function ExceptionDeviceCell({row}: {row: ExceptionRow}) {
  // No avatar here — at the 160px column floor the mono hostname needs the
  // full cell width; the inspector's flagged list carries the avatars.
  return (
    <VStack gap={0}>
      <Text type="label" size="sm" maxLines={1} style={styles.monoText}>
        {row.host}
      </Text>
      <Text type="supporting" color="secondary" maxLines={1}>
        {row.owner}
      </Text>
    </VStack>
  );
}

function ExceptionPolicyCell({row}: {row: ExceptionRow}) {
  const policy = POLICY_BY_ID.get(row.policy);
  if (!policy) {
    return null;
  }
  return (
    <HStack gap={2} vAlign="center">
      <span style={{color: policy.glyphColor, display: 'inline-flex'}}>
        <Icon icon={policy.glyph} size="xsm" color="inherit" />
      </span>
      {/* shortName — the 110px column keeps the Expires column on screen. */}
      <Text type="body" maxLines={1}>
        {policy.shortName}
      </Text>
    </HStack>
  );
}

function ExceptionExpiryCell({row}: {row: ExceptionRow}) {
  if (row.isExpired) {
    return (
      <VStack gap={0}>
        <HStack gap={1} vAlign="center">
          <Badge variant="error" label="Expired" />
          <Text type="body" hasTabularNumbers style={styles.expiredText}>
            {shortDate(row.expiresAt).replace(', 2026', '')}
          </Text>
        </HStack>
        <Text type="supporting" color="secondary" maxLines={1}>
          Now non-compliant
        </Text>
      </VStack>
    );
  }
  return (
    <VStack gap={0}>
      <Text type="body" hasTabularNumbers style={{whiteSpace: 'nowrap'}}>
        {shortDate(row.expiresAt)}
      </Text>
      <Text type="supporting" color="secondary" maxLines={1}>
        by {row.approvedBy}
      </Text>
    </VStack>
  );
}

function buildExceptionColumns(
  onRevoke: (id: string) => void,
): TableColumn<ExceptionRow>[] {
  return [
    {
      key: 'device',
      header: 'Device',
      // Footgun: the Table's min width is pixelTotal + max over flexible
      // columns of (minWidth × totalProportion / proportion) — these
      // 2.4:2 proportions with 160/140 floors keep that at ~630px so every
      // column (incl. the red Expired beat and the action button) fits the
      // narrow demo preview without a horizontal scroll, and the mono
      // hostnames render unclipped.
      width: proportional(2.4, {minWidth: 160}),
      renderCell: (row: ExceptionRow) => <ExceptionDeviceCell row={row} />,
    },
    {
      key: 'policy',
      header: 'Policy',
      width: pixel(110),
      renderCell: (row: ExceptionRow) => <ExceptionPolicyCell row={row} />,
    },
    {
      key: 'reason',
      header: 'Reason',
      width: proportional(2, {minWidth: 140}),
      renderCell: (row: ExceptionRow) => (
        <Text type="body" color="secondary" maxLines={2}>
          {row.reason}
        </Text>
      ),
    },
    {
      key: 'expiry',
      header: 'Expires',
      width: pixel(128),
      renderCell: (row: ExceptionRow) => <ExceptionExpiryCell row={row} />,
    },
    {
      key: 'action',
      header: '',
      width: pixel(84),
      align: 'end',
      renderCell: (row: ExceptionRow) => (
        <Button
          label={row.isExpired ? 'Re-review' : 'Revoke'}
          variant="ghost"
          size="sm"
          onClick={() => onRevoke(row.id)}
        />
      ),
    },
  ];
}

function ExceptionsSection({
  exceptions,
  onRevoke,
}: {
  exceptions: ExceptionRow[];
  onRevoke: (id: string) => void;
}) {
  const columns = useMemo(() => buildExceptionColumns(onRevoke), [onRevoke]);
  const expired = exceptions.filter(row => row.isExpired).length;
  return (
    <section style={styles.section} aria-label="Policy exceptions">
      <div style={styles.sectionBar}>
        <Heading level={3}>Exceptions</Heading>
        <Token
          size="sm"
          color="gray"
          label={`${exceptions.length - expired} active`}
        />
        {expired > 0 ? (
          <Token size="sm" color="red" label={`${expired} expired`} />
        ) : null}
        <StackItem size="fill"><span /></StackItem>
        <Text type="supporting" color="secondary">
          Grants excuse one device from one policy check until expiry
        </Text>
      </div>
      <div style={styles.exceptionsScroll}>
        <Table<ExceptionRow>
          data={exceptions}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// INSPECTOR PANEL — the selected policy: enforcement SegmentedControl,
// coverage, platforms, rule parameters, flagged devices (optionally scoped
// to the matrix-drilled department), exceptions count, and change stamp.
// ---------------------------------------------------------------------------

function FlaggedDeviceRow({device}: {device: FlaggedDevice}) {
  return (
    <div style={styles.flaggedRow}>
      <Avatar name={device.owner} size="xsmall" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" size="sm" maxLines={1} style={styles.monoText}>
            {device.host}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {device.detail}
          </Text>
        </VStack>
      </StackItem>
      <span style={styles.deptChip}>{device.dept}</span>
    </div>
  );
}

function PolicyInspector({
  policy,
  level,
  drillDept,
  onLevelChange,
  onClearDrill,
}: {
  policy: Policy;
  level: EnforcementLevel;
  drillDept: Dept | null;
  onLevelChange: (id: PolicyId, level: EnforcementLevel) => void;
  onClearDrill: () => void;
}) {
  const allFlagged = FLAGGED_BY_POLICY.get(policy.id) ?? [];
  const flagged = drillDept
    ? allFlagged.filter(device => device.dept === drillDept)
    : allFlagged;
  const compliant = FLEET.inScope - allFlagged.length;
  const exceptionsForPolicy = EXCEPTIONS.filter(
    row => row.policy === policy.id && !row.isExpired,
  ).length;
  const drillDevices = drillDept
    ? DEPARTMENTS.find(row => row.dept === drillDept)?.devices ?? 0
    : FLEET.inScope;
  return (
    <div style={styles.panelFill}>
      <div style={styles.panelScroll}>
        <HStack gap={2} vAlign="center">
          <span style={{...styles.policyGlyph, color: policy.glyphColor}}>
            <Icon icon={policy.glyph} size="sm" color="inherit" />
          </span>
          <StackItem size="fill" style={{minWidth: 0}}>
            <Heading level={3}>{policy.name}</Heading>
          </StackItem>
          {/* StatusDot's label is aria-only — pair it with visible text so
              the dot never reads as a stray artifact. */}
          <HStack gap={1} vAlign="center">
            <StatusDot
              variant={allFlagged.length === 0 ? 'success' : allFlagged.length > 4 ? 'error' : 'warning'}
              label={`${allFlagged.length} devices flagged`}
            />
            <Text type="supporting" color="secondary" hasTabularNumbers style={{whiteSpace: 'nowrap'}}>
              {allFlagged.length} flagged
            </Text>
          </HStack>
        </HStack>
        <Text type="supporting" color="secondary">
          {policy.summary}
        </Text>

        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary">
            Enforcement
          </Text>
          {/* One-word segments — fits the 340px panel on one line. */}
          <SegmentedControl
            label={`${policy.name} enforcement level`}
            value={level}
            onChange={value => onLevelChange(policy.id, value as EnforcementLevel)}
            size="sm">
            <SegmentedControlItem label="Enforce" value="enforce" />
            <SegmentedControlItem label="Warn" value="warn" />
            <SegmentedControlItem label="Report" value="report" />
          </SegmentedControl>
          <Text type="supporting" color="secondary">
            {ENFORCEMENT_META[level].help}
          </Text>
        </VStack>

        <Divider />

        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" size="sm" color="secondary">
                Coverage
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {compliant} of {FLEET.inScope}
            </Text>
          </HStack>
          <ProgressBar
            label={`${policy.name} fleet coverage`}
            isLabelHidden
            value={compliant}
            max={FLEET.inScope}
            variant={allFlagged.length > 4 ? 'warning' : 'neutral'}
            style={{minWidth: 0}}
          />
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Platforms
            </Text>
            <StackItem size="fill"><span /></StackItem>
            {policy.platforms.map(platform => (
              <span key={platform} style={styles.platformRow}>
                <Icon icon={PLATFORM_META[platform].icon} size="xsm" color="inherit" />
                <Text type="supporting" color="secondary">
                  {PLATFORM_META[platform].label}
                </Text>
              </span>
            ))}
          </HStack>
        </VStack>

        <Divider />

        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary">
            Rule parameters
          </Text>
          <MetadataList columns={1} label={{position: 'start', width: 110}}>
            {policy.rules.map(rule => (
              <MetadataListItem key={rule.label} label={rule.label}>
                <Text type="body" hasTabularNumbers>
                  {rule.value}
                </Text>
              </MetadataListItem>
            ))}
          </MetadataList>
          {policy.note ? (
            <Text type="supporting" color="secondary">
              {policy.note}
            </Text>
          ) : null}
        </VStack>

        <Divider />

        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" size="sm" color="secondary">
                Flagged devices
              </Text>
            </StackItem>
            {drillDept ? (
              <Token
                size="sm"
                color="blue"
                label={`${drillDept} · ${drillDevices} dev`}
                onRemove={onClearDrill}
              />
            ) : (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {flagged.length} fleet-wide
              </Text>
            )}
          </HStack>
          {flagged.length === 0 ? (
            <HStack gap={2} vAlign="center">
              <Icon icon={CheckCircle2Icon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary">
                {drillDept
                  ? `All ${drillDevices} ${drillDept} devices pass this check.`
                  : 'Every in-scope device passes this check.'}
              </Text>
            </HStack>
          ) : (
            <VStack gap={2}>
              {flagged.map(device => (
                <FlaggedDeviceRow key={device.host} device={device} />
              ))}
            </VStack>
          )}
          {flagged.length > 0 ? (
            <Button
              label={level === 'report' ? 'Export event log' : 'Notify owners'}
              variant="secondary"
              size="sm"
            />
          ) : null}
        </VStack>

        <Divider />

        <MetadataList columns={1} label={{position: 'start', width: 110}}>
          <MetadataListItem label="Exceptions">
            <Text type="body" hasTabularNumbers>
              {exceptionsForPolicy} active grant{exceptionsForPolicy === 1 ? '' : 's'}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Last changed">
            <Text type="body">
              <Timestamp value={policy.lastChangedAt} format="date" /> ·{' '}
              {policy.lastChangedBy}
            </Text>
          </MetadataListItem>
        </MetadataList>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — state: selected policy (cards + matrix + inspector), per-policy
// enforcement overrides, the matrix drill department, the draft-banner
// lifecycle, and revoked exception ids.
// ---------------------------------------------------------------------------

const INITIAL_LEVELS: Record<PolicyId, EnforcementLevel> = {
  encryption: 'enforce',
  screenlock: 'enforce',
  osupdate: 'enforce',
  edr: 'warn',
  usb: 'report',
};

export default function EndpointSecurityPoliciesTemplate() {
  const [selectedPolicyId, setSelectedPolicyId] = useState<PolicyId>('encryption');
  const [levels, setLevels] = useState<Record<PolicyId, EnforcementLevel>>(INITIAL_LEVELS);
  const [drillDept, setDrillDept] = useState<Dept | null>(null);
  const [draftState, setDraftState] = useState<'draft' | 'scheduled' | 'discarded'>('draft');
  const [revokedIds, setRevokedIds] = useState<ReadonlySet<string>>(new Set());

  // <=1180px drops the inspector; <=900px is the compact fallback (cards
  // 2-up, matrix + exceptions scroll horizontally, trend stacks).
  const showPanel = useMediaQuery('(min-width: 1181px)');
  const isCompact = useMediaQuery('(max-width: 900px)');

  const selectedPolicy = POLICY_BY_ID.get(selectedPolicyId) ?? POLICIES[0];
  const exceptions = useMemo(
    () => EXCEPTIONS.filter(row => !revokedIds.has(row.id)),
    [revokedIds],
  );

  const selectPolicy = (id: PolicyId) => {
    setSelectedPolicyId(id);
    setDrillDept(null);
  };

  const drillCell = (policyId: PolicyId, dept: Dept) => {
    setSelectedPolicyId(policyId);
    setDrillDept(prev => (prev === dept && policyId === selectedPolicyId ? null : dept));
  };

  const reviewDraft = () => {
    // "Review 34 devices" jumps the inspector to Screen Lock fleet-wide.
    setSelectedPolicyId(DRAFT.policy);
    setDrillDept(null);
  };

  const revokeException = (id: string) => {
    setRevokedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const content = (
    <div style={styles.contentScroll}>
      {draftState === 'discarded' ? null : (
        <DraftBanner
          state={draftState}
          onSchedule={() => setDraftState('scheduled')}
          onDiscard={() => setDraftState('discarded')}
          onReview={reviewDraft}
        />
      )}

      <VStack gap={2}>
        <div style={styles.sectionHead}>
          <Heading level={3}>Policies</Heading>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            5 active · {FLEET.inScope} devices in scope
          </Text>
        </div>
        <div
          style={{
            ...styles.cardRack,
            ...(isCompact ? styles.cardRackCompact : null),
          }}>
          {POLICIES.map(policy => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              level={levels[policy.id]}
              isActive={policy.id === selectedPolicyId}
              onSelect={selectPolicy}
            />
          ))}
        </div>
      </VStack>

      <div style={styles.matrixTrendRow}>
        <ComplianceMatrix
          levels={levels}
          selectedPolicy={selectedPolicyId}
          drillDept={drillDept}
          onDrill={drillCell}
        />
        <EnforcementTrend />
      </div>

      <ExceptionsSection exceptions={exceptions} onRevoke={revokeException} />
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider padding={0}>
            <HeaderBar />
          </LayoutHeader>
        }
        content={<LayoutContent padding={0}>{content}</LayoutContent>}
        end={
          showPanel ? (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              label="Policy inspector">
              <PolicyInspector
                policy={selectedPolicy}
                level={levels[selectedPolicyId]}
                drillDept={drillDept}
                onLevelChange={(id, level) =>
                  setLevels(prev => ({...prev, [id]: level}))
                }
                onClearDrill={() => setDrillDept(null)}
              />
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
