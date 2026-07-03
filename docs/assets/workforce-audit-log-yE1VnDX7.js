var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — a fixed Kestrel Labs admin audit
 *   ledger (21 loaded events, fixed ISO timestamps 1–3 July 2026, fixed
 *   hex hashes, fixed IPs/locations). No clocks, no randomness, no network
 *   media; "now" is pinned to 2026-07-03T09:30:00Z for the range chips.
 * @output Admin Audit Log — the compliance-grade action trail for the
 *   Kestrel Labs workforce platform (140 employees). A filter bar (actor,
 *   action type, target system, date-range chips, free-text search); an
 *   expandable event table (UTC timestamp, actor avatar + role, severity
 *   color-coded action chip, target with system icon, source IP + location,
 *   hash-chain integrity mark); an expanded comp-change row with a
 *   before/after JSON-ish diff whose comp amounts are masked behind a
 *   reveal-permission note; a suspicious-activity banner (3 failed admin
 *   sign-ins) that can pivot the filters; export controls (CSV split
 *   button, live SIEM stream status); and a pinned 7-year retention note.
 * @position Page template; emitted by \`astryx template workforce-audit-log\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title, chain-integrity chip, export split button)
 *   | content (suspicious-activity Banner, filter toolbar, summary strip,
 *     event table scrolling independently)
 *   | footer (retention-policy note + SIEM stream status).
 * Container policy: app-shell archetype — frame rows only; no Cards. The
 *   expanded event detail is a full-width table row (colSpan), the diff
 *   block and banner are styled divs / Banner.
 * Color policy: token-pure everywhere; the only literals are the
 *   \`light-dark()\` fallback pairs on the data-viz categorical tokens
 *   (system glyphs) and the added/removed diff-line tints, whose dark side
 *   shifts to the lighter 400-weight hue.
 *
 * Responsive contract:
 * - > 1160px: full seven-column table (chevron, time, actor, action,
 *   target, source, integrity).
 * - <= 1160px: the Source column drops (IP + location stay available in
 *   the expanded detail); the filter toolbar wraps.
 * - <= 900px: the Integrity column also drops (chain hashes stay in the
 *   expanded detail); the header row and footer wrap instead of clipping.
 * - The event table scrolls independently under the pinned banner/filter
 *   rows and footer (\`minHeight: 0\` down the flex chain).
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArchiveIcon,
  BanknoteIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileJsonIcon,
  FileSpreadsheetIcon,
  GlobeIcon,
  KeyRoundIcon,
  LaptopIcon,
  LayoutGridIcon,
  Link2Icon,
  LockIcon,
  RadioTowerIcon,
  SearchIcon,
  ShieldCheckIcon,
  TimerIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import type {TokenColor} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentFill: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  bannerWrap: {flexShrink: 0, padding: 'var(--spacing-3) var(--spacing-4) 0'},
  filterBar: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-2)',
  },
  summaryStrip: {
    flexShrink: 0,
    padding: '0 var(--spacing-4) var(--spacing-2)',
  },
  tableScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    // Fixed-width pixel columns keep a floor; narrow viewports scroll the
    // table horizontally instead of crushing cells.
    overflowX: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-3)',
  },
  tableEmpty: {padding: 'var(--spacing-6) var(--spacing-4)'},
  mono: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  integrityChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  countChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '1px 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  sevDot: {width: 7, height: 7, borderRadius: '50%', flexShrink: 0},
  systemGlyph: {display: 'inline-flex', flexShrink: 0},
  eventRow: {cursor: 'pointer'},
  eventRowExpanded: {
    cursor: 'pointer',
    boxShadow: 'inset 2px 0 0 var(--color-accent)',
  },
  chevronCell: {color: 'var(--color-text-secondary)', display: 'inline-flex'},
  // Expanded detail row --------------------------------------------------
  detailCell: {
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-4)',
  },
  detailGrid: {
    display: 'flex',
    gap: 'var(--spacing-5)',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  detailMeta: {flex: '0 1 320px', minWidth: 260},
  detailDiff: {flex: '1 1 420px', minWidth: 300},
  diffBlock: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 12,
    lineHeight: 1.7,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    overflow: 'hidden',
  },
  diffHeader: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  diffLine: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    padding: '0 var(--spacing-3)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  // Intentional literals: diff-line tints; dark side shifts to the lighter
  // 400-weight hue per the suite color policy.
  diffLineRemoved: {
    backgroundColor: 'light-dark(rgba(220,38,38,0.08), rgba(248,113,113,0.12))',
    color: 'light-dark(#B91C1C, #FCA5A5)',
  },
  diffLineAdded: {
    backgroundColor: 'light-dark(rgba(11,153,31,0.08), rgba(52,199,89,0.12))',
    color: 'light-dark(#15803D, #86EFAC)',
  },
  diffGutter: {width: 12, flexShrink: 0, textAlign: 'center', userSelect: 'none'},
  maskGlyph: {display: 'inline-flex', verticalAlign: -2, marginInlineStart: 4},
  maskNote: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  chainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  footerBar: {padding: 'var(--spacing-2) var(--spacing-4)'},
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
const SYSTEM_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

const VERIFIED_COLOR = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';

// ---------------------------------------------------------------------------
// DOMAIN — severities, target systems, action catalog. One shared fictional
// company: Kestrel Labs, a 140-person platform company. Signed-in reviewer:
// Elena Voss's audit delegate is not modeled — the viewer is a read-only
// "Audit Viewer" role (audit.read), which is why comp values stay masked.
// "Now" is pinned to 2026-07-03T09:30:00Z.
// ---------------------------------------------------------------------------

const NOW_ISO = '2026-07-03T09:30:00Z';
const TOTAL_RETAINED = '1,284';

type Severity = 'critical' | 'high' | 'medium' | 'info';

const SEVERITY_META: Record<
  Severity,
  {label: string; token: TokenColor; dot: string}
> = {
  critical: {label: 'Critical', token: 'red', dot: 'light-dark(#DC2626, #F87171)'},
  high: {label: 'High', token: 'orange', dot: SYSTEM_COLOR.orange},
  medium: {label: 'Medium', token: 'blue', dot: SYSTEM_COLOR.blue},
  info: {label: 'Info', token: 'gray', dot: 'var(--color-text-secondary)'},
};

const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'info'];

type SystemId = 'identity' | 'payroll' | 'hris' | 'devices' | 'apps';

const SYSTEM_META: Record<
  SystemId,
  {label: string; icon: typeof KeyRoundIcon; color: string}
> = {
  identity: {label: 'Identity', icon: KeyRoundIcon, color: SYSTEM_COLOR.purple},
  payroll: {label: 'Payroll', icon: BanknoteIcon, color: SYSTEM_COLOR.green},
  hris: {label: 'HRIS', icon: UsersIcon, color: SYSTEM_COLOR.blue},
  devices: {label: 'Devices', icon: LaptopIcon, color: SYSTEM_COLOR.teal},
  apps: {label: 'Apps', icon: LayoutGridIcon, color: SYSTEM_COLOR.orange},
};

const SYSTEM_IDS: SystemId[] = ['identity', 'payroll', 'hris', 'devices', 'apps'];

type ActionCategory = 'auth' | 'access' | 'comp' | 'employee' | 'config' | 'data';

const CATEGORY_LABEL: Record<ActionCategory, string> = {
  auth: 'Authentication',
  access: 'Access & roles',
  comp: 'Compensation',
  employee: 'Employee lifecycle',
  config: 'Configuration',
  data: 'Data & exports',
};

const CATEGORY_IDS: ActionCategory[] = [
  'auth',
  'access',
  'comp',
  'employee',
  'config',
  'data',
];

interface ActionMeta {
  /** Short color-coded verb chip in the Action column. */
  verb: string;
  category: ActionCategory;
  severity: Severity;
}

/** Action catalog — event rows reference these by id. */
const ACTIONS = {
  'auth.login.failed': {verb: 'Login failed', category: 'auth', severity: 'critical'},
  'auth.login.success': {verb: 'Signed in', category: 'auth', severity: 'info'},
  'auth.mfa.reset': {verb: 'MFA reset', category: 'auth', severity: 'high'},
  'access.role.granted': {verb: 'Role granted', category: 'access', severity: 'high'},
  'access.role.revoked': {verb: 'Role revoked', category: 'access', severity: 'medium'},
  'access.review.certified': {verb: 'Review certified', category: 'access', severity: 'info'},
  'comp.change.applied': {verb: 'Comp changed', category: 'comp', severity: 'critical'},
  'comp.band.viewed': {verb: 'Band viewed', category: 'comp', severity: 'medium'},
  'employee.created': {verb: 'Profile created', category: 'employee', severity: 'info'},
  'employee.suspended': {verb: 'Accounts suspended', category: 'employee', severity: 'high'},
  'config.sso.cert_rotated': {verb: 'SSO cert rotated', category: 'config', severity: 'high'},
  'config.policy.updated': {verb: 'Policy updated', category: 'config', severity: 'medium'},
  'data.export.generated': {verb: 'Export generated', category: 'data', severity: 'medium'},
  'apps.seat.granted': {verb: 'Seats granted', category: 'access', severity: 'info'},
  'devices.assigned': {verb: 'Device assigned', category: 'employee', severity: 'info'},
} satisfies Record<string, ActionMeta>;

type ActionId = keyof typeof ACTIONS;

// ---------------------------------------------------------------------------
// EVENT FIXTURES — the loaded 7-day window (21 events of 1,284 retained).
// Kestrel Labs roster stays canonical: Tom Okonkwo (IT admin), Dana
// Whitfield (People Ops), Elena Voss (Finance lead), Priya Raman (VP
// Engineering); Ava Lindqvist and Ken Tanaka appear only as in-flight
// hires. Numbers reconcile across panels: the banner's 3 failed sign-ins
// are the 3 \`auth.login.failed\` rows; the certified access review covers
// Engineering's canonical 52 seats; the roster export counts 140 employees.
// Hash chain: each event's prevHash is the hash of the next-older event.
// ---------------------------------------------------------------------------

const ACTOR_ROLE: Record<string, string> = {
  'Tom Okonkwo': 'IT admin',
  'Dana Whitfield': 'People Ops',
  'Elena Voss': 'Finance lead',
  'Priya Raman': 'VP Engineering',
  'Okta SCIM sync': 'Service account',
};

/** Named source networks — IPs repeat exactly per actor/location. */
const NET = {
  sfHq: {ip: '73.158.12.94', location: 'San Francisco, US'},
  sfHq2: {ip: '73.158.12.101', location: 'San Francisco, US'},
  lisbon: {ip: '85.245.66.30', location: 'Lisbon, PT'},
  scim: {ip: '10.0.4.21', location: 'Internal · SCIM'},
  suspect: {ip: '185.220.101.47', location: 'Frankfurt, DE'},
} as const;

interface AuditEvent extends Record<string, unknown> {
  id: string;
  at: string; // fixed ISO UTC
  actor: string;
  actionId: ActionId;
  system: SystemId;
  /** Target entity (who/what was acted on). */
  target: string;
  /** One-line context under the target. */
  detail: string;
  ip: string;
  location: string;
  /** Truncated event hash (chain: prevHash -> hash). */
  hash: string;
  prevHash: string;
  /** Newest event is still awaiting its anchor batch. */
  integrity: 'verified' | 'sealing';
  requestId: string;
  authMethod: string;
}

type EventSpec = [
  string, // id
  string, // at
  string, // actor
  ActionId,
  SystemId,
  string, // target
  string, // detail
  keyof typeof NET,
  string, // hash
];

const EVENT_SPECS: EventSpec[] = [
  // ---- 3 July 2026 ----
  ['ev-01', '2026-07-03T09:14:22Z', 'Tom Okonkwo', 'auth.login.failed', 'identity',
    'Admin console', 'Attempt 3 of 3 — password rejected, MFA never reached', 'suspect', 'f4c2a9'],
  ['ev-02', '2026-07-03T09:13:05Z', 'Tom Okonkwo', 'auth.login.failed', 'identity',
    'Admin console', 'Attempt 2 of 3 — password rejected', 'suspect', 'e8d310'],
  ['ev-03', '2026-07-03T09:12:41Z', 'Tom Okonkwo', 'auth.login.failed', 'identity',
    'Admin console', 'Attempt 1 of 3 — unrecognized device fingerprint', 'suspect', 'd97b5e'],
  ['ev-04', '2026-07-03T09:02:17Z', 'Elena Voss', 'comp.change.applied', 'payroll',
    'Comp record — Marcus Webb', 'Promotion cycle H2-2026 · effective 1 Aug 2026', 'sfHq', 'c1508f'],
  ['ev-05', '2026-07-03T08:55:40Z', 'Elena Voss', 'data.export.generated', 'payroll',
    'Payroll register — Jul 2026 draft', 'CSV · 140 employee rows · delivered to secure inbox', 'sfHq', 'b66d21'],
  ['ev-06', '2026-07-03T08:47:03Z', 'Tom Okonkwo', 'access.role.granted', 'identity',
    'Dana Whitfield', 'Granted role “Payroll Admin” · approved by Elena Voss', 'sfHq2', 'a3f19c'],
  ['ev-07', '2026-07-03T08:31:56Z', 'Elena Voss', 'auth.login.success', 'identity',
    'Admin console', 'Okta SSO · MFA (touch key)', 'sfHq', '99c4d7'],
  ['ev-08', '2026-07-03T08:20:12Z', 'Dana Whitfield', 'config.policy.updated', 'hris',
    'PTO accrual policy v5', 'Carry-over cap raised 5 → 10 days for Lisbon office', 'sfHq2', '8e07ba'],
  ['ev-09', '2026-07-03T07:58:31Z', 'Okta SCIM sync', 'apps.seat.granted', 'apps',
    'Ava Lindqvist', 'Figma + Slack seats · onboarding plan “Design IC”', 'scim', '7d92e4'],
  ['ev-10', '2026-07-03T07:58:04Z', 'Tom Okonkwo', 'devices.assigned', 'devices',
    'Ken Tanaka', 'MacBook Pro 16″ · asset KL-MBP-0424 · shipped to Lisbon', 'sfHq2', '6ba8f0'],
  ['ev-11', '2026-07-03T07:45:59Z', 'Okta SCIM sync', 'employee.created', 'hris',
    'Ken Tanaka', 'New hire profile · start date 13 Jul 2026 · Engineering', 'scim', '5c3d18'],
  // ---- 2 July 2026 ----
  ['ev-12', '2026-07-02T17:20:44Z', 'Tom Okonkwo', 'config.sso.cert_rotated', 'identity',
    'SAML signing certificate', 'Rotated ahead of 12 Jul expiry · fingerprint pinned', 'sfHq2', '4f61ce'],
  ['ev-13', '2026-07-02T16:05:27Z', 'Priya Raman', 'access.review.certified', 'identity',
    'Q3 access review — Engineering', 'Certified 52 of 52 seats · 0 exceptions', 'sfHq', '3e94ab'],
  ['ev-14', '2026-07-02T14:12:38Z', 'Tom Okonkwo', 'employee.suspended', 'identity',
    'M. Duarte (contractor)', 'Contract ended · 7 app seats suspended, 1 laptop reclaimed', 'sfHq2', '2d70f5'],
  ['ev-15', '2026-07-02T11:40:09Z', 'Dana Whitfield', 'comp.band.viewed', 'payroll',
    'Comp band — Design L4–L6', 'Band midpoints viewed · amounts masked (no comp.reveal)', 'sfHq2', '1cb862'],
  ['ev-16', '2026-07-02T10:15:50Z', 'Okta SCIM sync', 'employee.created', 'hris',
    'Ava Lindqvist', 'New hire profile · start date 6 Jul 2026 · Design', 'scim', '0aa943'],
  ['ev-17', '2026-07-02T09:30:33Z', 'Tom Okonkwo', 'auth.login.success', 'identity',
    'Admin console', 'Okta SSO · MFA (touch key) · recognized device', 'sfHq2', 'f0e2c1'],
  ['ev-18', '2026-07-02T09:05:11Z', 'Tom Okonkwo', 'auth.mfa.reset', 'identity',
    'Jonah Fields', 'MFA re-enrolled after phone replacement · verified via manager', 'sfHq2', 'e1b7d9'],
  // ---- 1 July 2026 ----
  ['ev-19', '2026-07-01T18:22:48Z', 'Dana Whitfield', 'data.export.generated', 'hris',
    'Headcount roster — Jul 2026', 'CSV · 140 employees across 6 departments', 'sfHq2', 'd2a4e6'],
  ['ev-20', '2026-07-01T16:44:25Z', 'Tom Okonkwo', 'access.role.revoked', 'apps',
    'M. Duarte (contractor)', 'Revoked “GitHub org admin” · pre-offboarding cleanup', 'sfHq2', 'c39b17'],
  ['ev-21', '2026-07-01T09:00:02Z', 'Priya Raman', 'auth.login.success', 'identity',
    'Admin console', 'Okta SSO · MFA (touch key)', 'sfHq', 'b480a3'],
];

/** Hash before the oldest loaded event (tail of the un-loaded ledger). */
const TAIL_HASH = 'a571f2';

const EVENTS: AuditEvent[] = EVENT_SPECS.map(
  ([id, at, actor, actionId, system, target, detail, net, hash], index) => ({
    id,
    at,
    actor,
    actionId,
    system,
    target,
    detail,
    ip: NET[net].ip,
    location: NET[net].location,
    hash,
    prevHash: EVENT_SPECS[index + 1]?.[8] ?? TAIL_HASH,
    integrity: index === 0 ? 'sealing' : 'verified',
    requestId: \`req_9\${String(2140 - index * 7).padStart(4, '0')}\`,
    authMethod:
      actionId === 'auth.login.failed'
        ? 'Password rejected — MFA never reached'
        : actor === 'Okta SCIM sync'
          ? 'OAuth 2.0 service token (scim-connector)'
          : 'Okta SSO · MFA (touch key)',
  }),
);

// ---------------------------------------------------------------------------
// COMP-CHANGE DIFF — before/after payload for ev-04. Comp amounts are
// masked: the viewer's Audit Viewer role carries audit.read only, and
// revealing requires comp.reveal. Line kinds drive the -/+ gutter tints.
// ---------------------------------------------------------------------------

interface DiffLine {
  kind: 'same' | 'removed' | 'added';
  text: string;
  isMasked?: boolean;
}

const COMP_DIFF: DiffLine[] = [
  {kind: 'same', text: '{'},
  {kind: 'same', text: '  "employee_id": "E-1042",'},
  {kind: 'same', text: '  "employee": "Marcus Webb — Platform lead",'},
  {kind: 'same', text: '  "effective_date": "2026-08-01",'},
  {kind: 'removed', text: '  "level": "L6",'},
  {kind: 'added', text: '  "level": "L7",'},
  {kind: 'removed', text: '  "base_salary": "$•••,••• USD",', isMasked: true},
  {kind: 'added', text: '  "base_salary": "$•••,••• USD",', isMasked: true},
  {kind: 'removed', text: '  "equity_refresh": "•,••• units",', isMasked: true},
  {kind: 'added', text: '  "equity_refresh": "•,••• units",', isMasked: true},
  {kind: 'same', text: '  "bonus_target_pct": 15,'},
  {kind: 'added', text: '  "change_reason": "Promotion cycle H2-2026",'},
  {kind: 'same', text: '  "approval_chain": ["Priya Raman", "Elena Voss"]'},
  {kind: 'same', text: '}'},
];

/** Generic JSON-ish payload snippets for non-comp events (no diff). */
const EVENT_PAYLOAD: Partial<Record<string, string[]>> = {
  'ev-01': [
    '{',
    '  "outcome": "denied",',
    '  "reason": "invalid_credentials",',
    '  "attempt": 3,',
    '  "device_fingerprint": "unrecognized",',
    '  "lockout_triggered": true',
    '}',
  ],
  'ev-06': [
    '{',
    '  "role": "Payroll Admin",',
    '  "grantee": "dana.whitfield@kestrellabs.com",',
    '  "approver": "elena.voss@kestrellabs.com",',
    '  "expires": "2027-01-03 (180-day recert)"',
    '}',
  ],
  'ev-08': [
    '{',
    '  "policy": "pto-accrual",',
    '  "version": "v4 → v5",',
    '  "carry_over_cap_days": "5 → 10",',
    '  "scope": "office:lisbon"',
    '}',
  ],
  'ev-12': [
    '{',
    '  "certificate": "saml-signing",',
    '  "old_expiry": "2026-07-12",',
    '  "new_expiry": "2027-07-12",',
    '  "fingerprint": "SHA256:9f:2c:…:4e"',
    '}',
  ],
};

// ---------------------------------------------------------------------------
// HELPERS — fixed UTC formatting (audit trails render in UTC by convention;
// slicing the ISO string keeps output independent of the viewer's zone).
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function utcTime(iso: string): string {
  return iso.slice(11, 19);
}

function utcDay(iso: string): string {
  const month = MONTH_NAMES[Number(iso.slice(5, 7)) - 1];
  return \`\${month} \${Number(iso.slice(8, 10))}\`;
}

// ---------------------------------------------------------------------------
// FILTERS — actor / action category / target system / date-range chips.
// Range cutoffs are fixed ISO strings derived from the pinned NOW.
// ---------------------------------------------------------------------------

type RangeId = '24h' | '48h' | '7d' | '30d';

const RANGE_CUTOFF: Record<RangeId, string> = {
  '24h': '2026-07-02T09:30:00Z',
  '48h': '2026-07-01T09:30:00Z',
  '7d': '2026-06-26T09:30:00Z',
  '30d': '2026-06-03T09:30:00Z',
};

const RANGE_IDS: RangeId[] = ['24h', '48h', '7d', '30d'];

const ACTOR_OPTIONS = [
  {value: 'all', label: 'All actors'},
  {value: 'Tom Okonkwo', label: 'Tom Okonkwo'},
  {value: 'Dana Whitfield', label: 'Dana Whitfield'},
  {value: 'Elena Voss', label: 'Elena Voss'},
  {value: 'Priya Raman', label: 'Priya Raman'},
  {value: 'Okta SCIM sync', label: 'Okta SCIM sync'},
];

const CATEGORY_OPTIONS = [
  {value: 'all', label: 'All actions'},
  ...CATEGORY_IDS.map(id => ({value: id, label: CATEGORY_LABEL[id]})),
];

const SYSTEM_OPTIONS = [
  {value: 'all', label: 'All systems'},
  ...SYSTEM_IDS.map(id => ({value: id, label: SYSTEM_META[id].label})),
];

interface Filters {
  actor: string;
  category: ActionCategory | 'all';
  system: SystemId | 'all';
  range: RangeId;
  query: string;
}

const DEFAULT_FILTERS: Filters = {
  actor: 'all',
  category: 'all',
  system: 'all',
  range: '7d',
  query: '',
};

function applyFilters(events: AuditEvent[], filters: Filters): AuditEvent[] {
  const needle = filters.query.trim().toLowerCase();
  return events.filter(event => {
    const action = ACTIONS[event.actionId];
    if (event.at < RANGE_CUTOFF[filters.range]) {
      return false;
    }
    if (filters.actor !== 'all' && event.actor !== filters.actor) {
      return false;
    }
    if (filters.category !== 'all' && action.category !== filters.category) {
      return false;
    }
    if (filters.system !== 'all' && event.system !== filters.system) {
      return false;
    }
    if (needle.length === 0) {
      return true;
    }
    return \`\${event.actor} \${action.verb} \${event.target} \${event.detail} \${event.ip}\`
      .toLowerCase()
      .includes(needle);
  });
}

function severityCounts(events: AuditEvent[]): Record<Severity, number> {
  const counts: Record<Severity, number> = {critical: 0, high: 0, medium: 0, info: 0};
  for (const event of events) {
    counts[ACTIONS[event.actionId].severity] += 1;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// DIFF BLOCK — JSON-ish before/after rendering with -/+ gutters, tinted
// lines, and lock glyphs on masked comp amounts.
// ---------------------------------------------------------------------------

function DiffLineRow({line}: {line: DiffLine}) {
  const tint =
    line.kind === 'removed'
      ? styles.diffLineRemoved
      : line.kind === 'added'
        ? styles.diffLineAdded
        : undefined;
  return (
    <div style={{...styles.diffLine, ...tint}}>
      <span style={styles.diffGutter} aria-hidden="true">
        {line.kind === 'removed' ? '−' : line.kind === 'added' ? '+' : ''}
      </span>
      <span>
        {line.text}
        {line.isMasked === true ? (
          <span
            style={styles.maskGlyph}
            role="img"
            aria-label="Value masked — comp.reveal permission required">
            <Icon icon={LockIcon} size="xsm" color="inherit" />
          </span>
        ) : null}
      </span>
    </div>
  );
}

function CompDiffBlock() {
  return (
    <VStack gap={2}>
      <div style={styles.diffBlock}>
        <div style={styles.diffHeader}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" size="sm">
                comp_record — before / after
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              3 fields changed · 1 added
            </Text>
          </HStack>
        </div>
        <div role="figure" aria-label="Compensation record change, before and after">
          {COMP_DIFF.map((line, index) => (
            <DiffLineRow key={index} line={line} />
          ))}
        </div>
      </div>
      <div style={styles.maskNote}>
        <Icon icon={LockIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              Comp amounts are masked. Revealing values requires the{' '}
              <span style={styles.mono}>comp.reveal</span> permission — your
              role <strong>Audit Viewer</strong> carries{' '}
              <span style={styles.mono}>audit.read</span> only.
            </Text>
            <div>
              <Button label="Request reveal access" variant="secondary" size="sm" isDisabled />
            </div>
          </VStack>
        </StackItem>
      </div>
    </VStack>
  );
}

function PayloadBlock({eventId, lines}: {eventId: string; lines: string[]}) {
  return (
    <div style={styles.diffBlock}>
      <div style={styles.diffHeader}>
        <Text type="label" size="sm">
          Event payload
        </Text>
      </div>
      <div role="figure" aria-label={\`Payload for event \${eventId}\`}>
        {lines.map((text, index) => (
          <DiffLineRow key={index} line={{kind: 'same', text}} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EXPANDED DETAIL — full-width row under an event: request metadata +
// hash-chain link on the left, comp diff / payload on the right.
// ---------------------------------------------------------------------------

function ChainLink({event}: {event: AuditEvent}) {
  return (
    <VStack gap={1}>
      <div style={styles.chainRow}>
        <Icon icon={Link2Icon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary" style={styles.mono}>
          prev {event.prevHash}… → this {event.hash}…
        </Text>
      </div>
      {event.integrity === 'verified' ? (
        <div style={styles.chainRow}>
          <span style={{...styles.systemGlyph, color: VERIFIED_COLOR}}>
            <Icon icon={ShieldCheckIcon} size="xsm" color="inherit" />
          </span>
          <Text type="supporting" color="secondary">
            Chain link verified against anchor batch #4,411
          </Text>
        </div>
      ) : (
        <div style={styles.chainRow}>
          <Icon icon={TimerIcon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary">
            Sealing — anchor batch #4,412 publishes 10:00 UTC
          </Text>
        </div>
      )}
    </VStack>
  );
}

function ExpandedDetail({event, colCount}: {event: AuditEvent; colCount: number}) {
  const payload = EVENT_PAYLOAD[event.id];
  return (
    <TableRow>
      <TableCell colSpan={colCount} style={styles.detailCell}>
        <div style={styles.detailGrid}>
          <div style={styles.detailMeta}>
            <VStack gap={3}>
              <MetadataList columns={1} label={{position: 'start', width: 104}}>
                <MetadataListItem label="Event ID">
                  <Text type="body" style={styles.mono}>
                    {event.id} · {event.requestId}
                  </Text>
                </MetadataListItem>
                <MetadataListItem label="Recorded">
                  <Text type="body" hasTabularNumbers>
                    {utcDay(event.at)} 2026 · {utcTime(event.at)} UTC
                  </Text>
                </MetadataListItem>
                <MetadataListItem label="Actor">
                  <Text type="body">
                    {event.actor} · {ACTOR_ROLE[event.actor] ?? 'Kestrel Labs'}
                  </Text>
                </MetadataListItem>
                <MetadataListItem label="Auth">
                  <Text type="body">{event.authMethod}</Text>
                </MetadataListItem>
                <MetadataListItem label="Source">
                  <VStack gap={0}>
                    <Text type="body" style={styles.mono}>
                      {event.ip}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {event.location}
                    </Text>
                  </VStack>
                </MetadataListItem>
                <MetadataListItem label="Severity">
                  <Token
                    size="sm"
                    color={SEVERITY_META[ACTIONS[event.actionId].severity].token}
                    label={SEVERITY_META[ACTIONS[event.actionId].severity].label}
                  />
                </MetadataListItem>
              </MetadataList>
              <Divider />
              <ChainLink event={event} />
            </VStack>
          </div>
          <div style={styles.detailDiff}>
            {event.actionId === 'comp.change.applied' ? (
              <CompDiffBlock />
            ) : payload !== undefined ? (
              <PayloadBlock eventId={event.id} lines={payload} />
            ) : (
              <Text type="supporting" color="secondary">
                No structured payload — this event records the action line
                above verbatim. Full context is available in the SIEM stream.
              </Text>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// EVENT TABLE — children-mode Table. Fixed-width columns carry both width
// and minWidth on the header cell (Table cells have max-width: 0).
// ---------------------------------------------------------------------------

const COL = {
  chevron: {width: 36, minWidth: 36},
  time: {width: 118, minWidth: 118},
  actor: {minWidth: 180},
  action: {width: 168, minWidth: 168},
  target: {minWidth: 220},
  source: {width: 190, minWidth: 190},
  integrity: {width: 110, minWidth: 110},
} as const;

function EventRow({
  event,
  isExpanded,
  colCount,
  showSource,
  showIntegrity,
  onToggle,
}: {
  event: AuditEvent;
  isExpanded: boolean;
  colCount: number;
  showSource: boolean;
  showIntegrity: boolean;
  onToggle: (id: string) => void;
}) {
  const action = ACTIONS[event.actionId];
  const severity = SEVERITY_META[action.severity];
  const system = SYSTEM_META[event.system];

  return (
    <>
      <TableRow
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={() => onToggle(event.id)}
        onKeyDown={keyEvent => {
          if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
            keyEvent.preventDefault();
            onToggle(event.id);
          }
        }}
        style={isExpanded ? styles.eventRowExpanded : styles.eventRow}>
        <TableCell>
          <span style={styles.chevronCell} aria-hidden="true">
            <Icon
              icon={isExpanded ? ChevronDownIcon : ChevronRightIcon}
              size="sm"
              color="inherit"
            />
          </span>
        </TableCell>
        <TableCell>
          <VStack gap={0}>
            <Text type="body" style={styles.mono}>
              {utcTime(event.at)}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {utcDay(event.at)} · UTC
            </Text>
          </VStack>
        </TableCell>
        <TableCell scope="row">
          <HStack gap={2} vAlign="center">
            <Avatar name={event.actor} size="xsmall" />
            <StackItem size="fill" style={{minWidth: 0}}>
              <VStack gap={0}>
                <Text type="body" maxLines={1}>
                  {event.actor}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {ACTOR_ROLE[event.actor] ?? 'Kestrel Labs'}
                </Text>
              </VStack>
            </StackItem>
          </HStack>
        </TableCell>
        <TableCell>
          <VStack gap={1}>
            <div>
              <Token size="sm" color={severity.token} label={action.verb} />
            </div>
            <Text type="supporting" color="secondary" style={styles.mono} maxLines={1}>
              {event.actionId}
            </Text>
          </VStack>
        </TableCell>
        <TableCell>
          <HStack gap={2} vAlign="center">
            <span style={{...styles.systemGlyph, color: system.color}}>
              <Icon icon={system.icon} size="sm" color="inherit" />
            </span>
            <StackItem size="fill" style={{minWidth: 0}}>
              <VStack gap={0}>
                <Text type="body" maxLines={1}>
                  {event.target}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {system.label} · {event.detail}
                </Text>
              </VStack>
            </StackItem>
          </HStack>
        </TableCell>
        {showSource ? (
          <TableCell>
            <VStack gap={0}>
              <Text type="body" style={styles.mono}>
                {event.ip}
              </Text>
              <HStack gap={1} vAlign="center">
                <Icon icon={GlobeIcon} size="xsm" color="secondary" />
                <Text type="supporting" color="secondary" maxLines={1}>
                  {event.location}
                </Text>
              </HStack>
            </VStack>
          </TableCell>
        ) : null}
        {showIntegrity ? (
          <TableCell>
            {event.integrity === 'verified' ? (
              <HStack gap={1} vAlign="center">
                <span
                  style={{...styles.systemGlyph, color: VERIFIED_COLOR}}
                  role="img"
                  aria-label="Hash chain verified">
                  <Icon icon={ShieldCheckIcon} size="sm" color="inherit" />
                </span>
                <Text type="supporting" color="secondary" style={styles.mono}>
                  {event.hash}…
                </Text>
              </HStack>
            ) : (
              <HStack gap={1} vAlign="center">
                <Icon icon={TimerIcon} size="sm" color="secondary" />
                <Text type="supporting" color="secondary">
                  Sealing
                </Text>
              </HStack>
            )}
          </TableCell>
        ) : null}
      </TableRow>
      {isExpanded ? <ExpandedDetail event={event} colCount={colCount} /> : null}
    </>
  );
}

function EventTable({
  events,
  expandedIds,
  showSource,
  showIntegrity,
  onToggle,
  onClearFilters,
}: {
  events: AuditEvent[];
  expandedIds: Set<string>;
  showSource: boolean;
  showIntegrity: boolean;
  onToggle: (id: string) => void;
  onClearFilters: () => void;
}) {
  const colCount = 5 + (showSource ? 1 : 0) + (showIntegrity ? 1 : 0);

  if (events.length === 0) {
    return (
      <div style={styles.tableEmpty}>
        <EmptyState
          isCompact
          icon={<Icon icon={SearchIcon} size="lg" />}
          title="No events match these filters"
          description="Widen the date range or clear the actor, action, and system filters. Retained events are never deleted — they are just outside this view."
          actions={
            <Button label="Clear filters" variant="secondary" size="sm" onClick={onClearFilters} />
          }
        />
      </div>
    );
  }

  return (
    <Table density="compact" dividers="rows" hasHover>
      <TableHeader>
        <TableRow isHeaderRow>
          <TableHeaderCell scope="col" style={COL.chevron}>
            <span style={styles.visuallyHidden}>Expand</span>
          </TableHeaderCell>
          <TableHeaderCell scope="col" style={COL.time}>
            Time (UTC)
          </TableHeaderCell>
          <TableHeaderCell scope="col" style={COL.actor}>
            Actor
          </TableHeaderCell>
          <TableHeaderCell scope="col" style={COL.action}>
            Action
          </TableHeaderCell>
          <TableHeaderCell scope="col" style={COL.target}>
            Target
          </TableHeaderCell>
          {showSource ? (
            <TableHeaderCell scope="col" style={COL.source}>
              Source
            </TableHeaderCell>
          ) : null}
          {showIntegrity ? (
            <TableHeaderCell scope="col" style={COL.integrity}>
              Integrity
            </TableHeaderCell>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map(event => (
          <EventRow
            key={event.id}
            event={event}
            isExpanded={expandedIds.has(event.id)}
            colCount={colCount}
            showSource={showSource}
            showIntegrity={showIntegrity}
            onToggle={onToggle}
          />
        ))}
      </TableBody>
    </Table>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const FAILED_LOGINS = EVENTS.filter(
  event => event.actionId === 'auth.login.failed',
);

export default function WorkforceAuditLogTemplate() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  // The comp-change event starts expanded so the masked before/after diff
  // is visible on first paint.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(['ev-04']),
  );
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1160px drops the Source column; <=900px also
  // drops Integrity (both stay available in the expanded detail).
  const isNarrow = useMediaQuery('(max-width: 1160px)');
  const isCompact = useMediaQuery('(max-width: 900px)');
  const showSource = !isNarrow;
  const showIntegrity = !isCompact;

  const visibleEvents = useMemo(() => applyFilters(EVENTS, filters), [filters]);
  const counts = useMemo(() => severityCounts(visibleEvents), [visibleEvents]);

  const hasActiveFilters =
    filters.actor !== 'all' ||
    filters.category !== 'all' ||
    filters.system !== 'all' ||
    filters.range !== DEFAULT_FILTERS.range ||
    filters.query.trim().length > 0;

  const toggleExpanded = (id: string) => {
    setExpandedIds(previous => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAnnouncement('Filters cleared');
  };

  // Banner pivot: focus the trail on the 3 failed admin sign-ins.
  const focusSuspiciousActivity = () => {
    setFilters({...DEFAULT_FILTERS, actor: 'Tom Okonkwo', category: 'auth', range: '24h'});
    setExpandedIds(new Set(['ev-01']));
    setAnnouncement('Filtered to authentication events for Tom Okonkwo in the last 24 hours');
  };

  const queueExport = (format: string) => {
    setAnnouncement(
      \`\${format} export queued — \${visibleEvents.length} events, delivery to your secure inbox is itself audited\`,
    );
  };

  // ----- header: title, chain-integrity chip, export controls -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <Icon icon={ShieldCheckIcon} size="md" color="secondary" />
          <Heading level={1}>Audit log</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · Workforce platform
          </Text>
        </HStack>
        <StackItem size="fill" />
        <span style={styles.integrityChip}>
          <span style={{...styles.systemGlyph, color: VERIFIED_COLOR}}>
            <Icon icon={ShieldCheckIcon} size="xsm" color="inherit" />
          </span>
          Hash chain verified · {TOTAL_RETAINED} events
        </span>
        <ButtonGroup label="Export audit events" size="sm">
          <Button
            label="Export CSV"
            variant="secondary"
            size="sm"
            icon={<Icon icon={DownloadIcon} size="sm" />}
            onClick={() => queueExport('CSV')}
          />
          <DropdownMenu
            button={{
              label: 'More export options',
              variant: 'secondary',
              size: 'sm',
              isIconOnly: true,
              icon: <Icon icon={ChevronDownIcon} size="sm" />,
            }}
            hasChevron={false}
            menuWidth={260}
            items={[
              {
                label: 'CSV — filtered view',
                icon: <Icon icon={FileSpreadsheetIcon} size="sm" color="inherit" />,
                onClick: () => queueExport('CSV'),
              },
              {
                label: 'JSON — filtered view',
                icon: <Icon icon={FileJsonIcon} size="sm" color="inherit" />,
                onClick: () => queueExport('JSON'),
              },
              {
                label: 'Replay range to SIEM',
                icon: <Icon icon={RadioTowerIcon} size="sm" color="inherit" />,
                onClick: () => queueExport('SIEM replay'),
              },
            ]}
          />
        </ButtonGroup>
      </HStack>
    </LayoutHeader>
  );

  // ----- suspicious-activity banner: 3 failed admin sign-ins -----
  const banner =
    isBannerVisible && FAILED_LOGINS.length > 0 ? (
      <div style={styles.bannerWrap}>
        <Banner
          status="error"
          title={\`Suspicious activity — \${FAILED_LOGINS.length} failed admin sign-ins for Tom Okonkwo\`}
          description={\`\${FAILED_LOGINS.length} consecutive failures from unrecognized IP 185.220.101.47 (Frankfurt, DE) between 09:12 and 09:14 UTC today. Tom's last verified sign-in was from SF HQ yesterday; his account is locked pending MFA re-verification.\`}
          endContent={
            <Button
              label="Review these events"
              variant="secondary"
              size="sm"
              onClick={focusSuspiciousActivity}
            />
          }
          isDismissable
          onDismiss={() => setIsBannerVisible(false)}
        />
      </div>
    ) : null;

  // ----- filter bar: actor / action / system selectors + range chips -----
  const filterBar = (
    <HStack gap={2} vAlign="center" wrap="wrap" style={styles.filterBar}>
      <Selector
        label="Actor"
        isLabelHidden
        options={ACTOR_OPTIONS}
        value={filters.actor}
        onChange={value => setFilters(previous => ({...previous, actor: value}))}
        size="sm"
        width={170}
      />
      <Selector
        label="Action type"
        isLabelHidden
        options={CATEGORY_OPTIONS}
        value={filters.category}
        onChange={value =>
          setFilters(previous => ({
            ...previous,
            category: value as ActionCategory | 'all',
          }))
        }
        size="sm"
        width={180}
      />
      <Selector
        label="Target system"
        isLabelHidden
        options={SYSTEM_OPTIONS}
        value={filters.system}
        onChange={value =>
          setFilters(previous => ({...previous, system: value as SystemId | 'all'}))
        }
        size="sm"
        width={150}
      />
      {/* Date-range chips — labels measured to fit on one line. */}
      <SegmentedControl
        label="Date range"
        value={filters.range}
        onChange={value =>
          setFilters(previous => ({...previous, range: value as RangeId}))
        }
        size="sm">
        {RANGE_IDS.map(range => (
          <SegmentedControlItem key={range} label={range} value={range} />
        ))}
      </SegmentedControl>
      {hasActiveFilters ? (
        <Button
          label="Clear"
          variant="ghost"
          size="sm"
          icon={<Icon icon={XIcon} size="sm" />}
          onClick={clearFilters}
        />
      ) : null}
      <StackItem size="fill" />
      <TextInput
        label="Search events"
        isLabelHidden
        size="sm"
        width={isCompact ? 180 : 260}
        placeholder="Search actor, target, IP…"
        startIcon={<Icon icon={SearchIcon} size="sm" />}
        value={filters.query}
        onChange={value => setFilters(previous => ({...previous, query: value}))}
        hasClear
      />
    </HStack>
  );

  // ----- summary strip: visible count + per-severity chips -----
  const summaryStrip = (
    <HStack gap={2} vAlign="center" wrap="wrap" style={styles.summaryStrip}>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        Showing {visibleEvents.length} of {TOTAL_RETAINED} retained events ·
        last {filters.range} · times in UTC
      </Text>
      <StackItem size="fill" />
      {SEVERITY_ORDER.map(severity => (
        <span key={severity} style={styles.countChip}>
          <span
            style={{...styles.sevDot, backgroundColor: SEVERITY_META[severity].dot}}
            aria-hidden="true"
          />
          {counts[severity]} {SEVERITY_META[severity].label.toLowerCase()}
        </span>
      ))}
    </HStack>
  );

  // ----- footer: retention-policy note + live SIEM stream status -----
  const footer = (
    <LayoutFooter hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap" style={styles.footerBar}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ArchiveIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            Retention: 7 years (SOX / SOC 2) · events are immutable and
            hash-chained · oldest retained event 12 Jul 2019
          </Text>
        </HStack>
        <StackItem size="fill" />
        <HStack gap={2} vAlign="center">
          <StatusDot variant="success" label="SIEM stream live" isPulsing />
          <Icon icon={RadioTowerIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            SIEM stream · Splunk HEC · 0 backlog · last delivery 09:29:47 UTC
          </Text>
        </HStack>
      </HStack>
    </LayoutFooter>
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
              {banner}
              {filterBar}
              {summaryStrip}
              <Divider />
              <div style={styles.tableScroll}>
                <EventTable
                  events={visibleEvents}
                  expandedIds={expandedIds}
                  showSource={showSource}
                  showIntegrity={showIntegrity}
                  onToggle={toggleExpanded}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          </LayoutContent>
        }
        footer={footer}
      />
    </div>
  );
}
`;export{e as default};