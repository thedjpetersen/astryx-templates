// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — a fixed Kestrel Labs identity tenant
 *   (8 SSO connections with 7-day sign-in series, fixed cert/secret dates,
 *   the 140-person MFA ledger, password/session policy rules, SCIM sync
 *   state with 2 errors), relative ages measured from a frozen
 *   2026-07-03T16:00:00Z "now". No clocks, no randomness, no network media.
 * @output Identity & SSO Administration — the identity-admin surface of the
 *   Kestrel Labs workforce platform (140-person company, the platform is
 *   the IdP). Clickable posture chips (8 connections · 7 active · 1 cert
 *   expiring) and a SAML/OIDC filter scope a sortable connections table
 *   (status dots, labelled 7-day sign-in sparkbars, credential-expiry
 *   countdown with one amber SAML cert); a row's detail strip carries
 *   entity/client ID, ACS/redirect URI, cert serial with a working Rotate,
 *   provisioning + group tokens, and app owner. Below: a directory-sync
 *   panel (SCIM 2.0, 140 users · 12 groups · 6 push targets, 2 error rows
 *   tied to the in-flight hires with Retry), a password-policy card
 *   (per-rule met/attention org compliance) and a session-policy card. A
 *   340px enforcement rail carries the MFA meter (128 of 140 enrolled,
 *   method-split bar with legend), the 12 unenrolled employees with
 *   per-row and bulk Remind, and the break-glass admin-accounts note.
 * @position Page template; emitted by `astryx template it-identity-sso`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (brand, tenant, Sync directory, Add connection, rail toggle)
 *   | content (one scrolling column: connections section with chip toolbar,
 *   table, detail strip; then a 2-col grid — directory sync | password +
 *   session policy) | end panel 340 (MFA enforcement rail, scrolls).
 * Container policy: app-shell archetype — frame rows and styled section
 *   panels only; no Cards. The "policy cards", sync panel, detail strip,
 *   and break-glass note are bordered divs; the enforcement rail is a
 *   LayoutPanel.
 * Color policy: token-pure everywhere. The only literals are the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens used
 *   for app glyph tiles, sparkbars, and the MFA method-split bar (the demo
 *   does not inject `--color-data-categorical-*`); status colors ride
 *   `--color-success/-warning/-error`.
 *
 * Responsive contract:
 * - > 1180px: full header | content | enforcement-rail frame.
 * - <= 1180px: the rail is dropped and its content (MFA meter, unenrolled
 *   list, break-glass note) re-renders as a full-width section at the end
 *   of the scrolling column — MFA posture is primary content, never lost.
 * - <= 860px: the connections table drops the Assigned and Last sign-in
 *   columns so app/status/sparkbars/credential never crush; the policy
 *   grid stacks to one column; the header and chip rows wrap.
 * - The content column and the rail scroll independently (`minHeight: 0`
 *   down every flex chain); the table wrapper scrolls horizontally on
 *   narrow viewports instead of crushing cells.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  BellRingIcon,
  CircleAlertIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  FileKey2Icon,
  FingerprintIcon,
  FolderSyncIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  PanelRightIcon,
  PlusIcon,
  PowerOffIcon,
  RefreshCwIcon,
  RotateCwIcon,
  SearchXIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  TimerIcon,
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
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  Table,
  pixel,
  proportional,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  pageScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  // Connections section ----------------------------------------------------
  chipRow: {flexShrink: 0},
  chipCountDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  chipCount: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  tableWrap: {
    // Pixel columns keep a floor; narrow viewports scroll horizontally
    // instead of crushing cells.
    overflowX: 'auto',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
  },
  appGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-control, 8px)',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  sparkRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    height: 30,
    flexShrink: 0,
  },
  sparkBar: {
    width: 7,
    borderRadius: 2,
    backgroundColor: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  },
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  endAlign: {textAlign: 'end'},
  // URLs/IDs wrap at the <wbr> break points MonoUrl inserts after each
  // slash; break-word only kicks in when a single segment overflows.
  monoUrl: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    overflowWrap: 'break-word',
  },
  monoNowrap: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Section panels (container policy: styled divs, no Cards) ---------------
  sectionPanel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-4)',
    minWidth: 0,
  },
  detailStrip: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-4)',
  },
  policyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  ruleRow: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start'},
  ruleGlyph: {display: 'inline-flex', flexShrink: 0, paddingTop: 2},
  errorRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  errorGlyph: {display: 'inline-flex', flexShrink: 0, color: 'var(--color-error)', paddingTop: 2},
  // MFA enforcement rail ----------------------------------------------------
  railScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  meterBar: {
    display: 'flex',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
  },
  meterSeg: {height: '100%'},
  legendDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  // Text-optimized red (`--color-error` is a status hue and misses AA on
  // dark surfaces at supporting-text size).
  unenrolledOverdue: {color: 'var(--color-text-red)'},
  breakGlass: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  breakGlassGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    color: 'var(--color-warning)',
    paddingTop: 2,
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
const CATEGORICAL = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

type CategoricalKey = keyof typeof CATEGORICAL;

// ---------------------------------------------------------------------------
// DOMAIN CONSTANTS — Kestrel Labs identity tenant, July 2026.
// Frozen "now" for countdowns and relative ages: 2026-07-03T16:00:00Z
// (same frozen now as it-device-inventory).
// ---------------------------------------------------------------------------

const NOW_MS = Date.parse('2026-07-03T16:00:00Z');
const DAY_MS = 86_400_000;

/** The 7-day sign-in window every sparkbar cell shares (Sat Jun 27 → Fri Jul 3). */
const WEEK_LABELS = [
  'Sat Jun 27', 'Sun Jun 28', 'Mon Jun 29', 'Tue Jun 30', 'Wed Jul 1',
  'Thu Jul 2', 'Fri Jul 3',
];

type Protocol = 'SAML' | 'OIDC';
type ConnectionStatus = 'active' | 'disabled';
type Provisioning = 'scim' | 'jit' | 'off';

/** Credential posture derived from days-to-expiry vs the frozen now. */
type CredPosture = 'ok' | 'expiring' | 'critical';

const EXPIRING_WINDOW_DAYS = 45;
const CRITICAL_WINDOW_DAYS = 14;

// The Table generic requires rows assignable to Record<string, unknown>.
interface Connection extends Record<string, unknown> {
  id: string;
  name: string;
  protocol: Protocol;
  status: ConnectionStatus;
  color: CategoricalKey;
  initials: string;
  /** Sign-ins per day across WEEK_LABELS; all zeros while disabled. */
  signIns: number[];
  weekTotal: number;
  /** Minutes since the last successful sign-in; null while disabled. */
  lastSignInMins: number | null;
  assignedCount: number;
  assignedGroups: string[];
  /** SAML: signing-cert dates. OIDC: client-secret dates. */
  credIssued: string;
  credExpires: string;
  credSerial: string;
  /** SAML entity ID / OIDC client ID. */
  issuerId: string;
  /** SAML ACS URL / OIDC redirect URI. */
  callbackUrl: string;
  provisioning: Provisioning;
  owner: string;
  ownerRole: string;
  /** Set by the Rotate action; renders a "Rotated" token. */
  isRotated?: boolean;
}

// Compact fixture tuples:
// [id, name, protocol, status, color, initials, signIns, lastSignInMins,
//  assignedCount, assignedGroups, credIssued, credExpires, credSerial,
//  issuerId, callbackUrl, provisioning, owner, ownerRole]
type ConnectionSpec = [
  string, string, Protocol, ConnectionStatus, CategoricalKey, string,
  number[], number | null, number, string[], string, string, string,
  string, string, Provisioning, string, string,
];

// ---------------------------------------------------------------------------
// DATA — 8 SSO connections. Posture chips are re-derived from this array so
// the numbers can never drift: 8 connections · 7 active · 1 cert expiring
// inside 45 days (Figma, Jul 26 → 23 days out; everything else clears the
// window). SCIM push targets: Google, GitHub, Figma, Salesforce, Slack,
// Datadog = the 6 the directory-sync panel reports. Assigned-seat counts
// reconcile with the canonical department headcounts (Engineering 52,
// Design 18, GTM 34, Ops 16, Finance 8, People 12 — 140 total): GitHub =
// eng-all 52 (why Ava's seat push fails — seats are full), Figma =
// design-all 18 + eng-frontend 16 = 34, Salesforce = gtm-all 34 +
// finance-all 8 = 42, Datadog = eng-all 52 + ops-all 16 = 68.
// ---------------------------------------------------------------------------

const CONNECTION_SPECS: ConnectionSpec[] = [
  ['c-google', 'Google Workspace', 'SAML', 'active', 'blue', 'GW',
    [138, 96, 512, 534, 548, 561, 497], 2, 140, ['all-employees'],
    '2024-03-14', '2027-03-14', '4F:2A:91:C3:0B:77:D4:1E',
    'google.com/a/kestrellabs.com',
    'https://www.google.com/a/kestrellabs.com/acs',
    'scim', 'Tom Okonkwo', 'IT admin'],
  ['c-slack', 'Slack', 'SAML', 'active', 'purple', 'SL',
    [176, 158, 486, 470, 465, 452, 430], 1, 140, ['all-employees'],
    '2025-08-02', '2027-08-02', '9C:E0:44:AB:52:38:F1:06',
    'https://slack.com/kestrellabs',
    'https://kestrellabs.slack.com/sso/saml',
    'scim', 'Tom Okonkwo', 'IT admin'],
  ['c-github', 'GitHub Cloud', 'OIDC', 'active', 'teal', 'GH',
    [41, 36, 178, 190, 201, 188, 172], 7, 52, ['eng-all'],
    '2025-11-30', '2026-11-30', 'Iv1.8a61f9b3a7aba766',
    'Iv1.8a61f9b3a7aba766',
    'https://github.com/login/oauth/callback',
    'scim', 'Marcus Webb', 'Platform lead'],
  ['c-notion', 'Notion', 'OIDC', 'active', 'orange', 'NO',
    [64, 58, 232, 240, 251, 246, 210], 4, 140, [],
    '2026-02-15', '2027-02-15', 'ntn_oidc_2fk9d81m4q',
    'ntn_oidc_2fk9d81m4q',
    'https://www.notion.so/sso/callback',
    'jit', 'Tom Okonkwo', 'IT admin'],
  ['c-datadog', 'Datadog', 'SAML', 'active', 'green', 'DD',
    [52, 49, 168, 175, 171, 169, 158], 26, 68, ['eng-all', 'ops-all'],
    '2025-10-21', '2027-10-21', '71:BD:03:9E:AA:14:C8:52',
    'https://us5.datadoghq.com/account/saml/metadata.xml',
    'https://us5.datadoghq.com/account/saml/assertion',
    'scim', 'Marcus Webb', 'Platform lead'],
  ['c-salesforce', 'Salesforce', 'SAML', 'active', 'blue', 'SF',
    [8, 6, 130, 142, 151, 139, 120], 11, 42, ['gtm-all', 'finance-all'],
    '2026-01-09', '2028-01-09', 'E2:57:1B:C9:60:8D:33:4A',
    'https://kestrellabs.my.salesforce.com',
    'https://kestrellabs.my.salesforce.com/services/saml2/acs',
    'scim', 'Jonah Fields', 'GTM'],
  // THE amber row — signing cert expires Jul 26, 23 days from the frozen
  // now. The Rotate action re-issues it and clears the posture chip.
  ['c-figma', 'Figma', 'SAML', 'active', 'purple', 'FG',
    [12, 9, 96, 104, 99, 110, 88], 18, 34, ['design-all', 'eng-frontend'],
    '2023-07-26', '2026-07-26', 'B8:40:F2:6D:19:E5:7C:03',
    'https://www.figma.com/saml/kestrel-labs',
    'https://www.figma.com/sso/saml/acs/kestrel-labs',
    'scim', 'Sofia Ortiz', 'Design lead'],
  // Disabled — Zendesk sunset after the GTM tooling consolidation; kept for
  // status variety and a zero-volume sparkbar fallback.
  ['c-zendesk', 'Zendesk', 'SAML', 'disabled', 'orange', 'ZD',
    [0, 0, 0, 0, 0, 0, 0], null, 0, [],
    '2024-09-30', '2026-09-30', '1A:C6:88:52:EF:20:9B:47',
    'kestrellabs.zendesk.com',
    'https://kestrellabs.zendesk.com/access/saml',
    'off', 'Tom Okonkwo', 'IT admin'],
];

const INITIAL_CONNECTIONS: Connection[] = CONNECTION_SPECS.map(
  ([id, name, protocol, status, color, initials, signIns, lastSignInMins,
    assignedCount, assignedGroups, credIssued, credExpires, credSerial,
    issuerId, callbackUrl, provisioning, owner, ownerRole]) => ({
    id,
    name,
    protocol,
    status,
    color,
    initials,
    signIns,
    weekTotal: signIns.reduce((sum, v) => sum + v, 0),
    lastSignInMins,
    assignedCount,
    assignedGroups,
    credIssued,
    credExpires,
    credSerial,
    issuerId,
    callbackUrl,
    provisioning,
    owner,
    ownerRole,
  }),
);

// ---------------------------------------------------------------------------
// DATA — MFA enrollment ledger. 140 employees total (the canonical Kestrel
// Labs headcount): 128 enrolled (74 passkeys + 41 authenticator app + 13
// hardware keys) + the 12 unenrolled below. The unenrolled overlap is
// deliberate cross-referencing: Ava Lindqvist and Ken Tanaka are the two
// in-flight hires (accounts pre-provisioned, grace until after their Jul 13
// start), and Ravi/Chloe/Grace/Leo/Sam/Ingrid/Mia are the same employees
// flagged in it-device-inventory (non-compliant or laptop-in-transit) —
// identity posture tracks device posture.
// ---------------------------------------------------------------------------

const HEADCOUNT = 140;

interface MfaMethod {
  id: string;
  label: string;
  count: number;
  color: string;
}

const MFA_METHODS: MfaMethod[] = [
  {id: 'passkey', label: 'Passkeys', count: 74, color: CATEGORICAL.blue},
  {id: 'totp', label: 'Authenticator app', count: 41, color: CATEGORICAL.purple},
  {id: 'key', label: 'Hardware keys', count: 13, color: CATEGORICAL.teal},
];

const ENROLLED_COUNT = MFA_METHODS.reduce((sum, m) => sum + m.count, 0); // 128

type UnenrolledTone = 'grace' | 'due' | 'overdue';

interface UnenrolledPerson {
  id: string;
  name: string;
  dept: string;
  office: string;
  note: string;
  tone: UnenrolledTone;
}

const UNENROLLED: UnenrolledPerson[] = [
  {id: 'u-ava', name: 'Ava Lindqvist', dept: 'Engineering', office: 'SF HQ', note: 'Starts Jul 13 · grace ends Jul 27', tone: 'grace'},
  {id: 'u-ken', name: 'Ken Tanaka', dept: 'GTM', office: 'Remote-US', note: 'Starts Jul 13 · grace ends Jul 27', tone: 'grace'},
  {id: 'u-leo', name: 'Leo Martins', dept: 'Design', office: 'Lisbon', note: 'Overdue 12 days', tone: 'overdue'},
  {id: 'u-ravi', name: 'Ravi Mehta', dept: 'Engineering', office: 'SF HQ', note: 'Overdue 9 days', tone: 'overdue'},
  {id: 'u-chloe', name: 'Chloe Bernard', dept: 'GTM', office: 'Lisbon', note: 'Overdue 6 days', tone: 'overdue'},
  {id: 'u-ingrid', name: 'Ingrid Hoffmann', dept: 'Ops', office: 'SF HQ', note: 'Overdue 3 days', tone: 'overdue'},
  {id: 'u-grace', name: 'Grace Osei', dept: 'GTM', office: 'Remote-US', note: 'Due Jul 8', tone: 'due'},
  {id: 'u-mia', name: 'Mia Chen', dept: 'Design', office: 'SF HQ', note: 'Due Jul 9 · replacement laptop in transit', tone: 'due'},
  {id: 'u-salma', name: 'Salma Idris', dept: 'Design', office: 'SF HQ', note: 'Due Jul 9', tone: 'due'},
  {id: 'u-sam', name: 'Sam Alvarez', dept: 'GTM', office: 'Remote-US', note: 'Due Jul 10', tone: 'due'},
  {id: 'u-tomas', name: 'Tomas Keller', dept: 'Finance', office: 'Lisbon', note: 'Due Jul 11', tone: 'due'},
  {id: 'u-nia', name: 'Nia Park', dept: 'GTM', office: 'Remote-US', note: 'Due Jul 12', tone: 'due'},
];

// 128 + 12 = 140 — the meter, the legend, and the list agree by construction.

// ---------------------------------------------------------------------------
// DATA — password policy, session policy, directory sync, break-glass.
// ---------------------------------------------------------------------------

type RuleState = 'met' | 'attention' | 'note';

interface PasswordRule {
  id: string;
  label: string;
  detail: string;
  state: RuleState;
  action?: string;
}

const PASSWORD_RULES: PasswordRule[] = [
  {id: 'pw-length', label: 'Minimum length 14 characters', detail: '140 of 140 accounts compliant', state: 'met'},
  {id: 'pw-breach', label: 'Breach-corpus screening at set & change', detail: '3 accounts flagged Jun 30 · reset required by Jul 7', state: 'attention', action: 'Force reset (3)'},
  {id: 'pw-reuse', label: 'No reuse of last 10 passwords', detail: 'Enforced by the IdP at every change', state: 'met'},
  {id: 'pw-rotation', label: 'No scheduled rotation (NIST 800-63B)', detail: 'Rotation forced only on compromise signals', state: 'note'},
];

interface SessionRule {
  id: string;
  label: string;
  value: string;
}

const SESSION_RULES: SessionRule[] = [
  {id: 'ss-web', label: 'Web session length', value: '12 hours — one IdP session across all SSO apps'},
  {id: 'ss-idle', label: 'Idle timeout', value: '2 hours'},
  {id: 'ss-admin', label: 'Admin surfaces', value: 'Fresh MFA every 4 hours'},
  {id: 'ss-payroll', label: 'Payroll & banking changes', value: 'Step-up MFA on every change'},
  {id: 'ss-remember', label: 'Remember device', value: '30 days · revoked if MDM posture fails'},
  {id: 'ss-concurrent', label: 'Concurrent sessions', value: '5 per user'},
];

interface SyncError {
  id: string;
  app: string;
  subject: string;
  message: string;
}

// Both errors are the two in-flight hires — the same rows the onboarding
// board and payroll pre-flight track.
const SYNC_ERRORS: SyncError[] = [
  {
    id: 'se-ava',
    app: 'GitHub Cloud',
    subject: 'ava.lindqvist@kestrellabs.com',
    message:
      'Provisioning rejected — all 52 licensed seats are in use. Free a seat or expand the contract before Ava’s Jul 13 start.',
  },
  {
    id: 'se-ken',
    app: 'Salesforce',
    subject: 'ken.tanaka@kestrellabs.com',
    message:
      'Attribute mapping failed — employeeNumber is still empty; payroll onboarding assigns it. Re-runs automatically once payroll pre-flight completes.',
  },
];

const DIRECTORY_SYNC = {
  source: 'Kestrel HRIS (authoritative)',
  usersInScope: HEADCOUNT,
  groups: 12,
  pushTargets: 6, // = connections above with provisioning === 'scim'
  lastSync: '2026-07-03T15:45:00Z',
  nextSync: '2026-07-03T16:45:00Z',
  cadence: 'Hourly',
};

const BREAK_GLASS = {
  accounts: ['kl-breakglass-01', 'kl-breakglass-02'],
  custody: 'Dual custody: Tom Okonkwo (IT admin) + Elena Voss (Finance lead)',
  lastDrill: '2026-06-15',
  nextDrill: '2026-09-15',
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** Whole days until an ISO date, measured from the frozen fixture now. */
function daysUntil(isoDate: string): number {
  return Math.ceil((Date.parse(isoDate) - NOW_MS) / DAY_MS);
}

function credPosture(connection: Connection): CredPosture {
  const days = daysUntil(connection.credExpires);
  if (days <= CRITICAL_WINDOW_DAYS) {
    return 'critical';
  }
  return days <= EXPIRING_WINDOW_DAYS ? 'expiring' : 'ok';
}

/** Deterministic relative age from the frozen fixture "now". */
function minutesAgoLabel(mins: number): string {
  if (mins < 60) {
    return `${mins}m ago`;
  }
  if (mins < 1440) {
    return `${Math.round(mins / 60)}h ago`;
  }
  return `${Math.round(mins / 1440)}d ago`;
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

/** SAML connections carry a signing cert; OIDC ones a client secret. */
function credNoun(protocol: Protocol): string {
  return protocol === 'SAML' ? 'Signing cert' : 'Client secret';
}

/**
 * Mono URL/ID that prefers line breaks after slashes (via <wbr>) so wrapped
 * values read as path segments instead of severing words mid-token.
 */
function MonoUrl({value}: {value: string}) {
  const parts = value.split('/');
  return (
    <Text type="body" style={styles.monoUrl}>
      {parts.map((part, i) => (
        // Segment order is stable for a fixed value — index keys are safe.
        // eslint-disable-next-line react/no-array-index-key
        <span key={i}>
          {i > 0 ? '/' : null}
          {i > 0 ? <wbr /> : null}
          {part}
        </span>
      ))}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// TABLE — cells and columns. Fixed-width columns use pixel() so the header
// carries both width and minWidth (Table cells have max-width: 0). The
// sparkbar cell is labelled (role="img" summary + per-bar day titles) and
// the section caption names the shared Jun 27 – Jul 3 window — no
// axis-less mystery charts.
// ---------------------------------------------------------------------------

const SPARK_MAX_HEIGHT = 28;

function Sparkbars({connection}: {connection: Connection}) {
  const peak = Math.max(1, ...connection.signIns);
  return (
    <div
      role="img"
      aria-label={`${formatCount(connection.weekTotal)} sign-ins Jun 27 to Jul 3, peak ${formatCount(peak)} in one day`}
      style={styles.sparkRow}>
      {connection.signIns.map((value, i) => (
        <span
          key={WEEK_LABELS[i]}
          title={`${WEEK_LABELS[i]} · ${formatCount(value)} sign-ins`}
          style={{
            ...styles.sparkBar,
            height: Math.max(3, Math.round((value / peak) * SPARK_MAX_HEIGHT)),
            // Weekend bars read muted so the workweek shape pops.
            opacity: i < 2 ? 0.45 : 1,
          }}
        />
      ))}
    </div>
  );
}

function AppCell({connection}: {connection: Connection}) {
  const tint = CATEGORICAL[connection.color];
  return (
    <HStack gap={2} vAlign="center">
      <span
        aria-hidden
        style={{
          ...styles.appGlyph,
          color: tint,
          backgroundColor: `color-mix(in srgb, ${tint} 14%, transparent)`,
        }}>
        {connection.initials}
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {connection.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {connection.protocol === 'SAML' ? 'SAML 2.0' : 'OIDC'} ·{' '}
            {connection.provisioning === 'scim'
              ? 'SCIM push'
              : connection.provisioning === 'jit'
                ? 'JIT provisioning'
                : 'Provisioning off'}
          </Text>
        </VStack>
      </StackItem>
      {connection.isRotated === true ? (
        <Token size="sm" color="green" label="Rotated" />
      ) : null}
    </HStack>
  );
}

function StatusCell({connection}: {connection: Connection}) {
  const isActive = connection.status === 'active';
  return (
    <HStack gap={2} vAlign="center">
      <StatusDot
        variant={isActive ? 'success' : 'neutral'}
        label={isActive ? 'Connection active' : 'Connection disabled'}
      />
      <Text type="body" color={isActive ? undefined : 'secondary'}>
        {isActive ? 'Active' : 'Disabled'}
      </Text>
    </HStack>
  );
}

function SignInsCell({connection}: {connection: Connection}) {
  if (connection.status === 'disabled') {
    return (
      <Text type="body" color="secondary">
        —
      </Text>
    );
  }
  return (
    <HStack gap={3} vAlign="center">
      <Sparkbars connection={connection} />
      {/* Fill so the count column shares one right edge down the table. */}
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0} style={styles.endAlign}>
          <Text type="body" hasTabularNumbers style={styles.numericCell}>
            {formatCount(connection.weekTotal)}
          </Text>
          <Text type="supporting" color="secondary">
            7 days
          </Text>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function CredentialCell({connection}: {connection: Connection}) {
  const days = daysUntil(connection.credExpires);
  const posture = credPosture(connection);
  if (connection.status === 'disabled') {
    return (
      <VStack gap={0}>
        <Text type="body" color="secondary" style={styles.numericCell}>
          <Timestamp value={connection.credExpires} format="date" />
        </Text>
        <Text type="supporting" color="secondary">
          Not enforced
        </Text>
      </VStack>
    );
  }
  return (
    <VStack gap={1}>
      <Text type="body" hasTabularNumbers style={styles.numericCell}>
        <Timestamp value={connection.credExpires} format="date" />
      </Text>
      {posture === 'ok' ? (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          in {formatCount(days)} days
        </Text>
      ) : (
        <div>
          <Badge
            variant={posture === 'critical' ? 'error' : 'warning'}
            label={`${credNoun(connection.protocol)} · ${days}d left`}
          />
        </div>
      )}
    </VStack>
  );
}

function AssignedCell({connection}: {connection: Connection}) {
  if (connection.status === 'disabled') {
    return <Text type="body" color="secondary">—</Text>;
  }
  return (
    <VStack gap={0} style={styles.endAlign}>
      <Text type="body" hasTabularNumbers style={styles.numericCell}>
        {formatCount(connection.assignedCount)}
      </Text>
      <Text type="supporting" color="secondary">
        {connection.assignedCount === HEADCOUNT ? 'everyone' : 'employees'}
      </Text>
    </VStack>
  );
}

function LastSignInCell({connection}: {connection: Connection}) {
  if (connection.lastSignInMins === null) {
    return <Text type="body" color="secondary">—</Text>;
  }
  return (
    <Text type="body" hasTabularNumbers style={styles.numericCell}>
      {minutesAgoLabel(connection.lastSignInMins)}
    </Text>
  );
}

function RowMenu({
  connection,
  onRotate,
}: {
  connection: Connection;
  onRotate: (id: string) => void;
}) {
  const canRotate = connection.protocol === 'SAML' && connection.status === 'active';
  return (
    <DropdownMenu
      button={{
        label: `Actions for ${connection.name}`,
        variant: 'ghost',
        size: 'sm',
        isIconOnly: true,
        icon: <Icon icon={EllipsisVerticalIcon} size="sm" />,
      }}
      hasChevron={false}
      menuWidth={240}
      items={[
        {
          label:
            connection.protocol === 'SAML'
              ? 'Download SP metadata'
              : 'Download client config',
          icon: <Icon icon={DownloadIcon} size="sm" color="inherit" />,
          onClick: () => {},
        },
        ...(canRotate
          ? [
              {
                label: 'Rotate signing certificate',
                icon: <Icon icon={RotateCwIcon} size="sm" color="inherit" />,
                onClick: () => onRotate(connection.id),
              },
            ]
          : []),
        {type: 'divider' as const},
        {
          label:
            connection.status === 'active'
              ? 'Disable connection'
              : 'Re-enable connection',
          icon: <Icon icon={PowerOffIcon} size="sm" color="inherit" />,
          onClick: () => {},
        },
      ]}
    />
  );
}

function buildColumns(
  isCompact: boolean,
  onRotate: (id: string) => void,
): TableColumn<Connection>[] {
  const columns: TableColumn<Connection>[] = [
    {
      key: 'name',
      header: 'Application',
      width: proportional(2, {minWidth: 210}),
      sortable: true,
      renderCell: (connection: Connection) => <AppCell connection={connection} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(110),
      sortable: true,
      renderCell: (connection: Connection) => <StatusCell connection={connection} />,
    },
    {
      key: 'signins',
      header: 'Sign-ins (7d)',
      width: pixel(180),
      sortable: {sortKey: 'weekTotal'},
      renderCell: (connection: Connection) => <SignInsCell connection={connection} />,
    },
    {
      key: 'credential',
      header: 'Cert / secret expiry',
      width: pixel(170),
      sortable: {sortKey: 'credExpires'},
      renderCell: (connection: Connection) => <CredentialCell connection={connection} />,
    },
  ];
  if (!isCompact) {
    columns.push(
      {
        key: 'assigned',
        header: 'Assigned',
        width: pixel(100),
        align: 'end',
        sortable: {sortKey: 'assignedCount'},
        renderCell: (connection: Connection) => <AssignedCell connection={connection} />,
      },
      {
        key: 'lastSignIn',
        header: 'Last sign-in',
        width: pixel(110),
        sortable: {sortKey: 'lastSignInMins'},
        renderCell: (connection: Connection) => <LastSignInCell connection={connection} />,
      },
    );
  }
  columns.push({
    key: 'menu',
    header: '',
    width: pixel(56),
    renderCell: (connection: Connection) => (
      <RowMenu connection={connection} onRotate={onRotate} />
    ),
  });
  return columns;
}

// ---------------------------------------------------------------------------
// CONNECTION DETAIL STRIP — renders under the table for the active row:
// entity/client ID, ACS or redirect URI, credential serial + validity with
// a working Rotate for SAML rows, provisioning + group tokens, app owner.
// ---------------------------------------------------------------------------

function ConnectionDetail({
  connection,
  onRotate,
  onClose,
}: {
  connection: Connection;
  onRotate: (id: string) => void;
  onClose: () => void;
}) {
  const isSaml = connection.protocol === 'SAML';
  const days = daysUntil(connection.credExpires);
  const posture = credPosture(connection);
  return (
    <div style={styles.detailStrip}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={FileKey2Icon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={3}>
              {connection.name} — connection detail
            </Heading>
          </StackItem>
          {isSaml && connection.status === 'active' ? (
            <Button
              label="Rotate certificate"
              variant="secondary"
              size="sm"
              icon={<Icon icon={RotateCwIcon} size="sm" />}
              isDisabled={connection.isRotated === true}
              onClick={() => onRotate(connection.id)}
            />
          ) : null}
          <IconButton
            label="Close connection detail"
            tooltip="Close"
            variant="ghost"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClose}
          />
        </HStack>
        <MetadataList columns={2} label={{position: 'start', width: 120}}>
          <MetadataListItem label={isSaml ? 'Entity ID' : 'Client ID'}>
            <MonoUrl value={connection.issuerId} />
          </MetadataListItem>
          <MetadataListItem label={isSaml ? 'ACS URL' : 'Redirect URI'}>
            <MonoUrl value={connection.callbackUrl} />
          </MetadataListItem>
          <MetadataListItem label={credNoun(connection.protocol)}>
            <VStack gap={1}>
              <Text type="body" style={styles.monoNowrap}>
                {connection.credSerial}
              </Text>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  Issued <Timestamp value={connection.credIssued} format="date" /> ·
                  expires <Timestamp value={connection.credExpires} format="date" />
                </Text>
                {connection.status === 'active' && posture !== 'ok' ? (
                  <Badge
                    variant={posture === 'critical' ? 'error' : 'warning'}
                    label={`${days} days left`}
                  />
                ) : null}
                {connection.isRotated === true ? (
                  <Badge variant="success" label="Rotated today" />
                ) : null}
              </HStack>
            </VStack>
          </MetadataListItem>
          <MetadataListItem label="Provisioning">
            {connection.provisioning === 'scim' ? (
              <VStack gap={1}>
                <Text type="body">SCIM push from Kestrel HRIS</Text>
                <HStack gap={1} wrap="wrap">
                  {connection.assignedGroups.map(group => (
                    <Token key={group} size="sm" color="gray" label={group} />
                  ))}
                </HStack>
              </VStack>
            ) : (
              <Text type="body">
                {connection.provisioning === 'jit'
                  ? 'Just-in-time on first sign-in (kestrellabs.com)'
                  : 'Off — connection disabled'}
              </Text>
            )}
          </MetadataListItem>
          <MetadataListItem label="Assigned">
            <Text type="body" hasTabularNumbers>
              {connection.status === 'disabled'
                ? 'No one — connection disabled'
                : `${connection.assignedCount} of ${HEADCOUNT} employees`}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="App owner">
            <HStack gap={2} vAlign="center">
              <Avatar name={connection.owner} size="xsmall" />
              <Text type="body" maxLines={1}>
                {connection.owner}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {connection.ownerRole}
              </Text>
            </HStack>
          </MetadataListItem>
        </MetadataList>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DIRECTORY SYNC — SCIM 2.0 status panel with the two error rows.
// ---------------------------------------------------------------------------

function DirectorySyncPanel({
  retriedIds,
  onRetry,
  onSyncNow,
}: {
  retriedIds: Set<string>;
  onRetry: (id: string) => void;
  onSyncNow: () => void;
}) {
  return (
    <section aria-label="Directory sync" style={styles.sectionPanel}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={FolderSyncIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={2}>Directory sync</Heading>
          </StackItem>
          <HStack gap={2} vAlign="center">
            <StatusDot variant="warning" label="Sync completing with errors" />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {SYNC_ERRORS.length} errors
            </Text>
          </HStack>
          <Button
            label="Sync now"
            variant="secondary"
            size="sm"
            icon={<Icon icon={RefreshCwIcon} size="sm" />}
            onClick={onSyncNow}
          />
        </HStack>
        <MetadataList columns={2} label={{position: 'start', width: 104}}>
          <MetadataListItem label="Source">
            <Text type="body">{DIRECTORY_SYNC.source}</Text>
          </MetadataListItem>
          <MetadataListItem label="Protocol">
            <Text type="body">SCIM 2.0 · {DIRECTORY_SYNC.cadence.toLowerCase()} push</Text>
          </MetadataListItem>
          <MetadataListItem label="In scope">
            <Text type="body" hasTabularNumbers>
              {DIRECTORY_SYNC.usersInScope} users · {DIRECTORY_SYNC.groups} groups ·{' '}
              {DIRECTORY_SYNC.pushTargets} push targets
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Last sync">
            <Text type="body" hasTabularNumbers>
              <Timestamp value={DIRECTORY_SYNC.lastSync} format="date_time" /> · next{' '}
              <Timestamp value={DIRECTORY_SYNC.nextSync} format="time" />
            </Text>
          </MetadataListItem>
        </MetadataList>
        <Divider />
        <VStack gap={2}>
          <Text type="label">Sync errors ({SYNC_ERRORS.length})</Text>
          {SYNC_ERRORS.map(error => (
            <div key={error.id} style={styles.errorRow}>
              <span style={styles.errorGlyph}>
                <Icon icon={CircleAlertIcon} size="sm" color="inherit" />
              </span>
              <StackItem size="fill" style={{minWidth: 0}}>
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Text type="label" size="sm">
                      {error.app}
                    </Text>
                    <Text type="supporting" color="secondary" style={styles.monoNowrap}>
                      {error.subject}
                    </Text>
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {error.message}
                  </Text>
                </VStack>
              </StackItem>
              {retriedIds.has(error.id) ? (
                <Token size="sm" color="blue" label="Retry queued" />
              ) : (
                <Button
                  label="Retry push"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRetry(error.id)}
                />
              )}
            </div>
          ))}
        </VStack>
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// POLICY CARDS — password policy (per-rule org compliance) and session
// policy. Styled section panels per the container policy, not Cards.
// ---------------------------------------------------------------------------

const RULE_GLYPH: Record<RuleState, {icon: typeof ShieldCheckIcon; color: string; label: string}> = {
  met: {icon: ShieldCheckIcon, color: 'var(--color-success)', label: 'Met'},
  attention: {icon: ShieldAlertIcon, color: 'var(--color-warning)', label: 'Needs attention'},
  note: {icon: LockKeyholeIcon, color: 'var(--color-text-secondary)', label: 'Policy note'},
};

function PasswordPolicyCard({onForceReset}: {onForceReset: () => void}) {
  return (
    <section aria-label="Password policy" style={styles.sectionPanel}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={LockKeyholeIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={2}>Password policy</Heading>
          </StackItem>
          <Text type="supporting" color="secondary">
            IdP-enforced
          </Text>
        </HStack>
        <VStack gap={3}>
          {PASSWORD_RULES.map(rule => {
            const glyph = RULE_GLYPH[rule.state];
            return (
              <div key={rule.id} style={styles.ruleRow}>
                <span style={{...styles.ruleGlyph, color: glyph.color}}>
                  <Icon icon={glyph.icon} size="sm" color="inherit" />
                  <span style={styles.visuallyHidden}>{glyph.label}:</span>
                </span>
                <StackItem size="fill" style={{minWidth: 0}}>
                  <VStack gap={0}>
                    <Text type="label" size="sm">
                      {rule.label}
                    </Text>
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {rule.detail}
                    </Text>
                  </VStack>
                </StackItem>
                {rule.action !== undefined ? (
                  <Button
                    label={rule.action}
                    variant="ghost"
                    size="sm"
                    onClick={onForceReset}
                  />
                ) : null}
              </div>
            );
          })}
        </VStack>
      </VStack>
    </section>
  );
}

function SessionPolicyCard() {
  return (
    <section aria-label="Session policy" style={styles.sectionPanel}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={TimerIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={2}>Session policy</Heading>
          </StackItem>
          <Text type="supporting" color="secondary">
            Applies via IdP session
          </Text>
        </HStack>
        <MetadataList columns={1} label={{position: 'start', width: 168}}>
          {SESSION_RULES.map(rule => (
            <MetadataListItem key={rule.id} label={rule.label}>
              <Text type="body" hasTabularNumbers>
                {rule.value}
              </Text>
            </MetadataListItem>
          ))}
        </MetadataList>
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// MFA ENFORCEMENT — meter (method-split bar + legend), the 12 unenrolled
// employees with per-row/bulk Remind, and the break-glass note. Rendered in
// the 340px rail above 1180px and as a full-width content section below.
// ---------------------------------------------------------------------------

const ENROLLED_PCT = Math.round((ENROLLED_COUNT / HEADCOUNT) * 100); // 91

const METER_LEGEND = [
  ...MFA_METHODS.map(m => ({
    id: m.id,
    label: m.label,
    count: m.count,
    dotStyle: {backgroundColor: m.color} as CSSProperties,
  })),
  {
    id: 'none',
    label: 'Not enrolled',
    count: UNENROLLED.length,
    dotStyle: {
      backgroundColor: 'var(--color-background-muted)',
      border: 'var(--border-width) solid var(--color-border)',
    } as CSSProperties,
  },
];

function MfaMeter() {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="end">
        <Heading level={3}>
          {ENROLLED_COUNT} of {HEADCOUNT} enrolled
        </Heading>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {ENROLLED_PCT}%
        </Text>
      </HStack>
      <div
        role="img"
        aria-label={`MFA enrollment by method: ${MFA_METHODS.map(m => `${m.label} ${m.count}`).join(', ')}, unenrolled ${UNENROLLED.length}`}
        style={styles.meterBar}>
        {MFA_METHODS.map(method => (
          <span
            key={method.id}
            style={{
              ...styles.meterSeg,
              flexGrow: method.count,
              backgroundColor: method.color,
            }}
          />
        ))}
        <span
          style={{
            ...styles.meterSeg,
            flexGrow: UNENROLLED.length,
            backgroundColor: 'var(--color-background-muted)',
          }}
        />
      </div>
      <VStack gap={1}>
        {METER_LEGEND.map(entry => (
          <HStack key={entry.id} gap={2} vAlign="center">
            <span aria-hidden style={{...styles.legendDot, ...entry.dotStyle}} />
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                {entry.label}
              </Text>
            </StackItem>
            <Text type="supporting" hasTabularNumbers style={styles.numericCell}>
              {entry.count}
            </Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

function UnenrolledList({
  remindedIds,
  onRemind,
  onRemindAll,
}: {
  remindedIds: Set<string>;
  onRemind: (id: string) => void;
  onRemindAll: () => void;
}) {
  const remainingCount = UNENROLLED.filter(p => !remindedIds.has(p.id)).length;
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label">Not yet enrolled ({UNENROLLED.length})</Text>
        </StackItem>
        <Button
          label={`Remind all (${remainingCount})`}
          variant="secondary"
          size="sm"
          icon={<Icon icon={BellRingIcon} size="sm" />}
          isDisabled={remainingCount === 0}
          onClick={onRemindAll}
        />
      </HStack>
      <VStack gap={2}>
        {UNENROLLED.map(person => (
          <HStack key={person.id} gap={2} vAlign="center">
            <Avatar name={person.name} size="xsmall" />
            <StackItem size="fill" style={{minWidth: 0}}>
              <VStack gap={0}>
                <Text type="body" maxLines={1}>
                  {person.name}
                </Text>
                <Text
                  type="supporting"
                  color={person.tone === 'overdue' ? undefined : 'secondary'}
                  maxLines={2}
                  style={person.tone === 'overdue' ? styles.unenrolledOverdue : undefined}>
                  {person.dept} · {person.office} · {person.note}
                </Text>
              </VStack>
            </StackItem>
            {remindedIds.has(person.id) ? (
              <Token size="sm" color="blue" label="Reminded" />
            ) : (
              <Button
                label={`Remind ${person.name}`}
                variant="ghost"
                size="sm"
                isIconOnly
                tooltip="Send enrollment reminder"
                icon={<Icon icon={BellRingIcon} size="sm" />}
                onClick={() => onRemind(person.id)}
              />
            )}
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}

function BreakGlassNote() {
  return (
    <div style={styles.breakGlass}>
      <span style={styles.breakGlassGlyph}>
        <Icon icon={KeyRoundIcon} size="sm" color="inherit" />
      </span>
      <VStack gap={1} style={{minWidth: 0}}>
        <Text type="label" size="sm">
          Break-glass admin accounts
        </Text>
        <Text type="supporting" color="secondary">
          {BREAK_GLASS.accounts.join(' and ')} bypass SSO and MFA by design
          for IdP-outage recovery. Credentials sealed in the Ops vault.{' '}
          {BREAK_GLASS.custody}. Any use pages #security and forces
          rotation.
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Last rotation drill <Timestamp value={BREAK_GLASS.lastDrill} format="date" /> ·
          next due <Timestamp value={BREAK_GLASS.nextDrill} format="date" />
        </Text>
        <div>
          <Button label="View procedure" variant="ghost" size="sm" onClick={() => {}} />
        </div>
      </VStack>
    </div>
  );
}

function MfaPanel({
  remindedIds,
  onRemind,
  onRemindAll,
}: {
  remindedIds: Set<string>;
  onRemind: (id: string) => void;
  onRemindAll: () => void;
}) {
  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <Icon icon={FingerprintIcon} size="sm" color="secondary" />
          <Heading level={2}>MFA enforcement</Heading>
        </HStack>
        <Text type="supporting" color="secondary">
          Required for all employees · passkey or authenticator · 14-day
          grace for new hires
        </Text>
      </VStack>
      <MfaMeter />
      <Divider />
      <UnenrolledList
        remindedIds={remindedIds}
        onRemind={onRemind}
        onRemindAll={onRemindAll}
      />
      <Divider />
      <BreakGlassNote />
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type ScopeFilter = 'all' | 'active' | 'expiring';
type ProtocolFilter = 'all' | Protocol;

const STATUS_RANK: Record<ConnectionStatus, number> = {active: 0, disabled: 1};

export default function ItIdentitySsoTemplate() {
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [scope, setScope] = useState<ScopeFilter>('all');
  const [protocolFilter, setProtocolFilter] = useState<ProtocolFilter>('all');
  // The amber Figma row starts active so the credential story is visible
  // on first paint.
  const [activeId, setActiveId] = useState<string | null>('c-figma');
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());
  const [retriedIds, setRetriedIds] = useState<Set<string>>(new Set());
  const [isRailOpen, setIsRailOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px folds the enforcement rail into the
  // scrolling column; <=860px drops the Assigned / Last sign-in columns.
  const isRailFolded = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  // Posture chips re-derive from state so Rotate updates them in one pass.
  const summary = useMemo(
    () => ({
      total: connections.length,
      active: connections.filter(c => c.status === 'active').length,
      expiring: connections.filter(
        c => c.status === 'active' && credPosture(c) !== 'ok',
      ).length,
    }),
    [connections],
  );

  const visibleRows = useMemo(
    () =>
      connections.filter(connection => {
        const inScope =
          scope === 'all' ||
          (scope === 'active' && connection.status === 'active') ||
          (scope === 'expiring' &&
            connection.status === 'active' &&
            credPosture(connection) !== 'ok');
        if (!inScope) {
          return false;
        }
        return protocolFilter === 'all' || connection.protocol === protocolFilter;
      }),
    [connections, scope, protocolFilter],
  );

  // Sort plugin — default busiest-first so Google/Slack lead and the
  // disabled Zendesk row sinks.
  const {sortedData, sortConfig} = useTableSortableState<Connection>({
    data: visibleRows,
    defaultSort: [{sortKey: 'weekTotal', direction: 'descending'}],
    comparators: {
      name: (a, b) => a.name.localeCompare(b.name),
      status: (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status],
      weekTotal: (a, b) => a.weekTotal - b.weekTotal,
      credExpires: (a, b) => Date.parse(a.credExpires) - Date.parse(b.credExpires),
      assignedCount: (a, b) => a.assignedCount - b.assignedCount,
      lastSignInMins: (a, b) =>
        (a.lastSignInMins ?? Number.MAX_SAFE_INTEGER) -
        (b.lastSignInMins ?? Number.MAX_SAFE_INTEGER),
    },
  });
  const sortPlugin = useTableSortable<Connection>(sortConfig);

  // Row-click plugin: clicking a row opens the detail strip below the table.
  const activePlugin = useMemo<TablePlugin<Connection>>(
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

  const activeConnection = connections.find(c => c.id === activeId) ?? null;

  // ----- handlers ---------------------------------------------------------

  const rotateCertificate = (id: string) => {
    const target = connections.find(c => c.id === id);
    if (target === undefined || target.protocol !== 'SAML') {
      return;
    }
    setConnections(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              credIssued: '2026-07-03',
              credExpires: '2029-07-03',
              credSerial: 'D4:0C:5E:97:21:6B:F8:3A',
              isRotated: true,
            }
          : c,
      ),
    );
    setAnnouncement(
      `Signing certificate rotated for ${target.name} — new certificate expires Jul 3, 2029. Upload the new metadata to the service provider.`,
    );
  };

  const remindOne = (id: string) => {
    const person = UNENROLLED.find(p => p.id === id);
    setRemindedIds(prev => new Set(prev).add(id));
    setAnnouncement(
      person === undefined
        ? 'Enrollment reminder sent'
        : `MFA enrollment reminder sent to ${person.name}`,
    );
  };

  const remindAll = () => {
    const remaining = UNENROLLED.filter(p => !remindedIds.has(p.id)).length;
    setRemindedIds(new Set(UNENROLLED.map(p => p.id)));
    setAnnouncement(
      `MFA enrollment reminders sent to ${remaining} unenrolled ${remaining === 1 ? 'employee' : 'employees'}`,
    );
  };

  const retrySyncError = (id: string) => {
    const error = SYNC_ERRORS.find(e => e.id === id);
    setRetriedIds(prev => new Set(prev).add(id));
    setAnnouncement(
      error === undefined
        ? 'Provisioning retry queued'
        : `Provisioning retry queued for ${error.subject} on ${error.app}`,
    );
  };

  const syncNow = () => {
    setAnnouncement(
      `Directory sync started — ${DIRECTORY_SYNC.usersInScope} users and ${DIRECTORY_SYNC.groups} groups across ${DIRECTORY_SYNC.pushTargets} push targets`,
    );
  };

  const forcePasswordReset = () => {
    setAnnouncement(
      'Password reset forced for 3 flagged accounts — users will re-authenticate on next sign-in',
    );
  };

  const columns = useMemo(
    () => buildColumns(isCompact, rotateCertificate),
    // rotateCertificate only closes over setState + connections lookup;
    // rebuild alongside connections so menus see fresh rotation state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isCompact, connections],
  );

  // ----- header: brand, tenant, sync, add connection, rail toggle --------
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={FingerprintIcon} size="md" color="secondary" />
          <Heading level={1}>Identity &amp; SSO</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · IdP tenant
          </Text>
        </HStack>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          As of Jul 3, 2026 · 16:00 UTC
        </Text>
        <Button
          label="Sync directory"
          variant="secondary"
          size="sm"
          icon={<Icon icon={FolderSyncIcon} size="sm" />}
          isIconOnly={isCompact}
          tooltip={isCompact ? 'Sync directory' : 'Last sync 15:45 UTC'}
          onClick={syncNow}
        />
        <Button
          label="Add connection"
          variant="primary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" />}
          isIconOnly={isCompact}
          tooltip={isCompact ? 'Add connection' : undefined}
          onClick={() => setAnnouncement('New SSO connection wizard is not part of this demo')}
        />
        {!isRailFolded && (
          <IconButton
            label={isRailOpen ? 'Hide enforcement rail' : 'Show enforcement rail'}
            tooltip={isRailOpen ? 'Hide MFA rail' : 'Show MFA rail'}
            size="sm"
            variant={isRailOpen ? 'secondary' : 'ghost'}
            icon={<Icon icon={PanelRightIcon} size="sm" />}
            onClick={() => setIsRailOpen(open => !open)}
          />
        )}
      </HStack>
    </LayoutHeader>
  );

  // ----- connections section: chips, protocol filter, table, detail ------
  const postureChips: Array<{
    scope: ScopeFilter;
    count: number;
    text: string;
    dot?: string;
    icon?: typeof ShieldCheckIcon;
  }> = [
    {scope: 'all', count: summary.total, text: 'connections', icon: FileKey2Icon},
    {scope: 'active', count: summary.active, text: 'active', dot: 'var(--color-success)'},
    {scope: 'expiring', count: summary.expiring, text: 'cert expiring', dot: 'var(--color-warning)'},
  ];

  const connectionsSection = (
    <section aria-label="SSO connections">
      <VStack gap={3}>
        <HStack gap={3} vAlign="center" wrap="wrap" style={styles.chipRow}>
          <VStack gap={0}>
            <Heading level={2}>SSO connections</Heading>
            <Text type="supporting" color="secondary">
              Sign-in volume Jun 27 – Jul 3, 2026 · weekend bars muted
            </Text>
          </VStack>
          <StackItem size="fill" />
          <HStack gap={2} vAlign="center" wrap="wrap">
            {postureChips.map(chip => (
              <ToggleButton
                key={chip.scope}
                label={`${chip.count} ${chip.text}`}
                size="sm"
                isPressed={scope === chip.scope}
                onPressedChange={isPressed =>
                  setScope(isPressed ? chip.scope : 'all')
                }>
                <HStack gap={1} vAlign="center">
                  {chip.dot !== undefined ? (
                    <span
                      style={{...styles.chipCountDot, backgroundColor: chip.dot}}
                      aria-hidden
                    />
                  ) : chip.icon !== undefined ? (
                    <Icon icon={chip.icon} size="xsm" color="inherit" />
                  ) : null}
                  <Text type="inherit" hasTabularNumbers style={styles.chipCount}>
                    {chip.count}
                  </Text>
                  <Text type="inherit">{chip.text}</Text>
                </HStack>
              </ToggleButton>
            ))}
          </HStack>
          <SegmentedControl
            label="Protocol"
            value={protocolFilter}
            onChange={value => setProtocolFilter(value as ProtocolFilter)}
            size="sm">
            <SegmentedControlItem label="All" value="all" />
            <SegmentedControlItem label="SAML" value="SAML" />
            <SegmentedControlItem label="OIDC" value="OIDC" />
          </SegmentedControl>
        </HStack>
        <div style={styles.tableWrap}>
          <Table<Connection>
            data={sortedData}
            columns={columns}
            idKey="id"
            density="balanced"
            dividers="rows"
            hasHover
            plugins={{sort: sortPlugin, active: activePlugin}}
            emptyState={
              <EmptyState
                isCompact
                icon={<Icon icon={SearchXIcon} size="lg" />}
                title="No connections match"
                description="Clear the posture chip or protocol filter to see all 8 connections."
              />
            }
          />
        </div>
        {activeConnection !== null ? (
          <ConnectionDetail
            connection={activeConnection}
            onRotate={rotateCertificate}
            onClose={() => setActiveId(null)}
          />
        ) : null}
      </VStack>
    </section>
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
              <div style={styles.pageScroll}>
                {connectionsSection}
                <div style={styles.policyGrid}>
                  <DirectorySyncPanel
                    retriedIds={retriedIds}
                    onRetry={retrySyncError}
                    onSyncNow={syncNow}
                  />
                  <VStack gap={4}>
                    <PasswordPolicyCard onForceReset={forcePasswordReset} />
                    <SessionPolicyCard />
                  </VStack>
                </div>
                {/* <=1180px: the enforcement rail folds into the column so
                    MFA posture is never lost. */}
                {isRailFolded ? (
                  <div style={styles.sectionPanel}>
                    <MfaPanel
                      remindedIds={remindedIds}
                      onRemind={remindOne}
                      onRemindAll={remindAll}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isRailFolded && isRailOpen ? (
            <LayoutPanel width={340} padding={0} hasDivider label="MFA enforcement">
              <div style={styles.railScroll}>
                <MfaPanel
                  remindedIds={remindedIds}
                  onRemind={remindOne}
                  onRemindAll={remindAll}
                />
              </div>
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
