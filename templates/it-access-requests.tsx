// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — a fixed Kestrel Labs access-request
 *   queue (12 pending app/role requests across 10 SaaS apps, fixed ISO
 *   request/approval timestamps in late June – early July 2026, a frozen
 *   2026-07-03T17:00:00Z "now" for age math, and a seeded 5-entry decisions
 *   audit strip). No clocks, no randomness, no network media.
 * @output Access Request Approvals — the IT approvals surface of the
 *   Kestrel Labs workforce platform (140-person company; Tom Okonkwo, IT
 *   admin, is the signed-in reviewer). A sortable multi-select request
 *   table (app glyph + role/scope, requester avatar with dept · office,
 *   business-justification excerpt, policy-check pill auto-approvable /
 *   needs-review / violates-policy, compact Mgr→IT chain cell, age with
 *   SLA-breach amber past 3 days); policy-clean rows are bulk-approvable
 *   via checkboxes and a bulk bar; a 340px expanded-request panel with the
 *   approval-chain stepper (Requested → Manager approved → IT review
 *   pending → Provisioning), the full justification quote, per-rule policy
 *   checks, and pinned Approve/Deny actions; one NetSuite request carries a
 *   separation-of-duties conflict Banner (SOD-FIN-02: invoice entry +
 *   payment approver) that blocks Approve; and a decisions-audit footer
 *   strip that grows as verdicts land.
 * @position Page template; emitted by `astryx template it-access-requests`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (brand, search, queue stat chips, panel toggle)
 *   | content (policy filter + count toolbar, bulk bar when rows are
 *   checked, request Table scrolling both axes)
 *   | end panel 340 (expanded request card: scrolling body + pinned
 *   verdict bar) | footer (decisions-audit strip, scrolls horizontally).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. The expanded request "card" is the LayoutPanel itself; the app
 *   glyph tile, justification quote, stepper, and audit chips are styled
 *   divs.
 * Color policy: token-pure everywhere. The only literals are the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens used
 *   for app glyphs (the demo does not inject `--color-data-categorical-*`);
 *   verdict/policy colors ride `--color-success/-warning/-error`.
 *
 * Choose over expense-approval-queue when the rows are app/role access
 * grants judged against identity policy (group rules, seat pools, SoD
 * conflicts, approval chains), not expense reports with line items and
 * receipts awaiting a financial verdict.
 *
 * Responsive contract:
 * - > 1180px: full header | table | expanded-request panel | footer frame.
 * - <= 1180px: the expanded-request panel is dropped (the table stays the
 *   source of truth); the header panel toggle hides with it.
 * - <= 860px: the policy SegmentedControl swaps for a Selector; the header
 *   and toolbar rows wrap instead of clipping; bulk-bar buttons stay one
 *   line.
 * - The Justification and Chain columns drop whenever the table REGION
 *   (measured via ResizeObserver — the 340px panel and host chrome shrink
 *   it independently of the viewport) is under 1000px, so
 *   request/requester/policy/age never crush or clip.
 * - The table, the request panel body, and the audit strip each scroll
 *   independently (`minHeight: 0` down every flex chain); toolbars, the
 *   bulk bar, the panel verdict bar, and the footer are pinned.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  ActivityIcon,
  BanIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  ClockIcon,
  CloudIcon,
  DownloadIcon,
  FileTextIcon,
  GitPullRequestIcon,
  KeyRoundIcon,
  LandmarkIcon,
  LifeBuoyIcon,
  PanelRightIcon,
  PenToolIcon,
  ScrollTextIcon,
  SearchIcon,
  ServerIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  UserCheckIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
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
import {Selector} from '@astryxdesign/core/Selector';
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
import {Token} from '@astryxdesign/core/Token';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentToolbar: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-4)'},
  bulkBar: {flexShrink: 0},
  tableScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    // Pixel columns + the proportional request column keep a floor; narrow
    // viewports scroll the table horizontally instead of crushing cells.
    overflowX: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-3)',
  },
  tableEmpty: {padding: 'var(--spacing-6) var(--spacing-4)'},
  statChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 9px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  chipDot: {width: 7, height: 7, borderRadius: '50%', flexShrink: 0},
  appGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Text rides --color-text-yellow (AA on both surfaces); --color-warning
  // is reserved for dots/fills where the amber never carries glyphs.
  slaAmber: {color: 'var(--color-text-yellow)'},
  chainMini: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
  },
  justificationExcerpt: {fontStyle: 'italic'},
  // Expanded-request panel ------------------------------------------------
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  panelScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  panelActions: {flexShrink: 0, padding: 'var(--spacing-3) var(--spacing-4)'},
  panelGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  quoteBlock: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderInlineStart: '3px solid var(--color-border)',
    borderRadius: '0 var(--radius-container) var(--radius-container) 0',
    backgroundColor: 'var(--color-background-muted)',
    fontStyle: 'italic',
  },
  checkRow: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start'},
  checkGlyph: {display: 'inline-flex', flexShrink: 0, marginTop: 2},
  // Approval-chain stepper: fixed rail column keeps dots and connectors on
  // one vertical gridline; the connector is a 2px div between dots.
  stepRow: {display: 'flex', gap: 'var(--spacing-3)', alignItems: 'stretch'},
  stepRail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 20,
    flexShrink: 0,
  },
  stepDot: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: '50%',
    flexShrink: 0,
    border: '2px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-background-surface)',
  },
  stepDotDone: {
    border: '2px solid var(--color-success)',
    color: 'var(--color-success)',
  },
  stepDotCurrent: {
    border: '2px solid var(--color-accent)',
    color: 'var(--color-accent)',
  },
  stepDotFailed: {
    border: '2px solid var(--color-error)',
    color: 'var(--color-error)',
  },
  stepConnector: {width: 2, flex: 1, minHeight: 12, backgroundColor: 'var(--color-border)'},
  stepConnectorDone: {backgroundColor: 'var(--color-success)'},
  stepBody: {paddingBottom: 'var(--spacing-3)', minWidth: 0},
  // Decisions-audit footer strip -------------------------------------------
  footerStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    width: '100%',
    minWidth: 0,
  },
  footerLede: {flexShrink: 0},
  auditScroll: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBlock: 2,
  },
  auditChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    padding: '4px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    whiteSpace: 'nowrap',
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
const APP_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs (140-person platform
// company; Engineering 52, Design 18, GTM 34, Ops 16, Finance 8, People 12).
// Signed-in reviewer: Tom Okonkwo (IT admin). Frozen "now" for all age math:
// 2026-07-03T17:00:00Z. Queue reconciles everywhere it is counted:
// 12 pending = 6 auto-approvable + 5 needs-review + 1 violates-policy;
// 3 of the 12 breach the 3-day SLA (AR-2103, AR-2105, AR-2107).
// ---------------------------------------------------------------------------

const CURRENT_USER = 'Tom Okonkwo';
const FROZEN_NOW = Date.parse('2026-07-03T17:00:00Z');
/** Verdicts recorded in-session stamp this fixed time. */
const SESSION_TIME = '2026-07-03T17:05:00Z';
const SLA_DAYS = 3;

type AppId =
  | 'figma'
  | 'github'
  | 'datadog'
  | 'salesforce'
  | 'zendesk'
  | 'aws'
  | 'netsuite'
  | 'okta'
  | 'greenhouse'
  | 'notion';

interface AppMeta {
  label: string;
  icon: typeof PenToolIcon;
  color: string;
}

const APPS: Record<AppId, AppMeta> = {
  figma: {label: 'Figma', icon: PenToolIcon, color: APP_COLOR.purple},
  github: {label: 'GitHub Enterprise', icon: GitPullRequestIcon, color: APP_COLOR.blue},
  datadog: {label: 'Datadog', icon: ActivityIcon, color: APP_COLOR.purple},
  salesforce: {label: 'Salesforce', icon: CloudIcon, color: APP_COLOR.blue},
  zendesk: {label: 'Zendesk', icon: LifeBuoyIcon, color: APP_COLOR.green},
  aws: {label: 'AWS Production', icon: ServerIcon, color: APP_COLOR.orange},
  netsuite: {label: 'NetSuite', icon: LandmarkIcon, color: APP_COLOR.teal},
  okta: {label: 'Okta', icon: ShieldCheckIcon, color: APP_COLOR.blue},
  greenhouse: {label: 'Greenhouse', icon: UsersIcon, color: APP_COLOR.green},
  notion: {label: 'Notion', icon: FileTextIcon, color: APP_COLOR.teal},
};

type Dept = 'Engineering' | 'Design' | 'GTM' | 'Ops' | 'Finance' | 'People';
type Office = 'SF HQ' | 'Lisbon' | 'Remote-US';
type PolicyVerdict = 'auto' | 'review' | 'violation';
type ScopeLevel = 'Standard' | 'Elevated' | 'Admin';
type RequestStatus = 'pending' | 'approved' | 'denied';
type CheckState = 'pass' | 'warn' | 'fail';

interface PolicyCheck {
  state: CheckState;
  label: string;
  note: string;
}

interface SodConflict {
  rule: string;
  heldRole: string;
  detail: string;
}

// The Table generic requires rows assignable to Record<string, unknown>.
interface AccessRequest extends Record<string, unknown> {
  id: string;
  requester: string;
  dept: Dept;
  office: Office;
  /** New hires mid-onboarding (Ava, Ken) get an onboarding token. */
  startsOn?: string;
  app: AppId;
  role: string;
  scope: ScopeLevel;
  justification: string;
  requestedAt: string;
  manager: string;
  managerApprovedAt: string;
  managerNote?: string;
  /** AWS prod adds a security sign-off step after IT review. */
  needsSecuritySignoff?: boolean;
  ticket: string;
  policy: PolicyVerdict;
  checks: PolicyCheck[];
  sod?: SodConflict;
  status: RequestStatus;
  decidedAt?: string;
}

/** Shorthand pass/warn/fail check builders keep the fixture block readable. */
const pass = (label: string, note: string): PolicyCheck => ({state: 'pass', label, note});
const warn = (label: string, note: string): PolicyCheck => ({state: 'warn', label, note});
const fail = (label: string, note: string): PolicyCheck => ({state: 'fail', label, note});

const INITIAL_REQUESTS: AccessRequest[] = [
  // ---- Auto-approvable (6) — every check passes; bulk-approve eligible ----
  {
    id: 'AR-2113',
    requester: 'Ava Lindqvist',
    dept: 'Design',
    office: 'SF HQ',
    startsOn: 'Jul 7',
    app: 'figma',
    role: 'Editor seat',
    scope: 'Standard',
    justification:
      'Day-1 onboarding bundle for the Design team — needs Editor access to the Atlas component library before her first crit on Jul 9.',
    requestedAt: '2026-07-02T08:55:00Z',
    manager: 'Sofia Ortiz',
    managerApprovedAt: '2026-07-02T09:12:00Z',
    ticket: 'HELP-4831',
    policy: 'auto',
    checks: [
      pass('Group rule matched', 'Design → Figma Editor (RULE-APP-014)'),
      pass('Seats available', '34 of 40 Editor seats in use'),
      pass('Security training', 'New-hire module completed Jun 30'),
    ],
    status: 'pending',
  },
  {
    id: 'AR-2114',
    requester: 'Ken Tanaka',
    dept: 'Engineering',
    office: 'Remote-US',
    startsOn: 'Jul 6',
    app: 'github',
    role: 'Member — kestrel-platform org',
    scope: 'Standard',
    justification:
      'Onboarding: needs repo access to kestrel-platform to run the dev-environment setup on day 1.',
    requestedAt: '2026-07-02T15:30:00Z',
    manager: 'Marcus Webb',
    managerApprovedAt: '2026-07-02T16:02:00Z',
    ticket: 'HELP-4836',
    policy: 'auto',
    checks: [
      pass('Group rule matched', 'Engineering → GitHub member (RULE-APP-003)'),
      pass('Seats available', '49 of 60 seats in use'),
      pass('Hardware MFA', 'YubiKey enrolled during pre-boarding'),
    ],
    status: 'pending',
  },
  {
    id: 'AR-2109',
    requester: 'Noor Haddad',
    dept: 'Engineering',
    office: 'SF HQ',
    app: 'datadog',
    role: 'Standard user',
    scope: 'Standard',
    justification:
      'Joining the on-call rotation for the ingest service next sprint — needs dashboards and monitor acknowledge.',
    requestedAt: '2026-07-01T11:20:00Z',
    manager: 'Marcus Webb',
    managerApprovedAt: '2026-07-01T13:45:00Z',
    ticket: 'HELP-4812',
    policy: 'auto',
    checks: [
      pass('Group rule matched', 'Engineering → Datadog standard (RULE-APP-021)'),
      pass('Seats available', '38 of 45 seats in use'),
      pass('Security training', 'Current through May 2027'),
    ],
    status: 'pending',
  },
  {
    id: 'AR-2111',
    requester: 'Grace Obi',
    dept: 'GTM',
    office: 'Remote-US',
    app: 'salesforce',
    role: 'Sales user',
    scope: 'Standard',
    justification:
      'Moving from SDR tooling to full pipeline ownership for mid-market — needs opportunity edit rights.',
    requestedAt: '2026-07-02T09:05:00Z',
    manager: 'Jonah Fields',
    managerApprovedAt: '2026-07-02T09:40:00Z',
    ticket: 'HELP-4826',
    policy: 'auto',
    checks: [
      pass('Group rule matched', 'GTM → Salesforce Sales user (RULE-APP-008)'),
      pass('Seats available', '29 of 34 seats in use'),
      pass('Security training', 'Current through Jan 2027'),
    ],
    status: 'pending',
  },
  {
    id: 'AR-2105',
    requester: 'Lucas Ferreira',
    dept: 'Ops',
    office: 'Lisbon',
    app: 'zendesk',
    role: 'Agent seat',
    scope: 'Standard',
    justification:
      'Covering the EU morning support window starting next week — a light license cannot take ticket assignments.',
    requestedAt: '2026-06-30T10:20:00Z',
    manager: 'Miriam Kessler',
    managerApprovedAt: '2026-06-30T11:05:00Z',
    ticket: 'HELP-4794',
    policy: 'auto',
    checks: [
      pass('Group rule matched', 'Ops → Zendesk agent (RULE-APP-017)'),
      pass('Seats available', '11 of 14 Agent seats in use'),
      pass('Security training', 'Current through Nov 2026'),
    ],
    status: 'pending',
  },
  {
    id: 'AR-2117',
    requester: 'Omar Farouk',
    dept: 'Engineering',
    office: 'Lisbon',
    app: 'notion',
    role: 'Member seat',
    scope: 'Standard',
    justification:
      'Platform team moved the runbook wiki to Notion — currently reading it through exported PDFs.',
    requestedAt: '2026-07-03T08:15:00Z',
    manager: 'Marcus Webb',
    managerApprovedAt: '2026-07-03T08:50:00Z',
    ticket: 'HELP-4840',
    policy: 'auto',
    checks: [
      pass('Group rule matched', 'Engineering → Notion member (RULE-APP-011)'),
      pass('Seats available', '96 of 120 seats in use'),
      pass('Security training', 'Current through Mar 2027'),
    ],
    status: 'pending',
  },
  // ---- Needs review (5) — elevated/admin scope or pool pressure ----------
  {
    id: 'AR-2108',
    requester: 'Felix Braun',
    dept: 'Engineering',
    office: 'Lisbon',
    app: 'aws',
    role: 'prod-read-only (IAM role)',
    scope: 'Elevated',
    justification:
      'Debugging the payroll-export latency needs read access to prod CloudWatch and the S3 audit buckets — re-scoped from AR-2101 per the denial note.',
    requestedAt: '2026-07-01T09:30:00Z',
    manager: 'Marcus Webb',
    managerApprovedAt: '2026-07-01T09:55:00Z',
    needsSecuritySignoff: true,
    ticket: 'HELP-4809',
    policy: 'review',
    checks: [
      warn('Elevated scope', 'Production access always requires IT review (RULE-SEC-031)'),
      pass('Hardware MFA', 'YubiKey enrolled Feb 2026'),
      pass('Prior request narrowed', 'AR-2101 (prod-admin) denied Jul 2 — this re-request is read-only'),
    ],
    status: 'pending',
  },
  {
    id: 'AR-2103',
    requester: 'Maya Chen',
    dept: 'Design',
    office: 'SF HQ',
    app: 'figma',
    role: 'Org admin',
    scope: 'Admin',
    justification:
      'Taking over design-system library governance from Sofia — needs to manage team libraries and font uploads.',
    requestedAt: '2026-06-29T14:10:00Z',
    manager: 'Sofia Ortiz',
    managerApprovedAt: '2026-06-29T16:25:00Z',
    ticket: 'HELP-4781',
    policy: 'review',
    checks: [
      warn('Admin scope', 'Org-admin grants require IT review (RULE-APP-002)'),
      warn('License pool', 'Both Org admin seats in use (Sofia Ortiz, Tom Okonkwo) — approving adds a third'),
      pass('Security training', 'Current through Sep 2026'),
    ],
    status: 'pending',
  },
  {
    id: 'AR-2112',
    requester: 'Tessa Morgan',
    dept: 'GTM',
    office: 'Remote-US',
    app: 'salesforce',
    role: 'Marketing admin',
    scope: 'Admin',
    justification:
      'Owning the Q3 campaign build — needs Journey Builder and field-mapping admin for the launch sequences.',
    requestedAt: '2026-07-02T13:40:00Z',
    manager: 'Jonah Fields',
    managerApprovedAt: '2026-07-02T14:20:00Z',
    ticket: 'HELP-4833',
    policy: 'review',
    checks: [
      warn('Admin scope', 'App-admin grants require IT review (RULE-APP-002)'),
      pass('Seats available', '2 of 4 Marketing admin seats in use'),
      pass('Security training', 'Current through Feb 2027'),
    ],
    status: 'pending',
  },
  {
    id: 'AR-2107',
    requester: 'Ingrid Solberg',
    dept: 'People',
    office: 'SF HQ',
    app: 'greenhouse',
    role: 'Job admin',
    scope: 'Elevated',
    justification:
      'Running the Engineering hiring loops for Q3 — needs to edit job posts, scorecards, and interviewer pools.',
    requestedAt: '2026-06-30T09:40:00Z',
    manager: 'Dana Whitfield',
    managerApprovedAt: '2026-06-30T10:15:00Z',
    ticket: 'HELP-4791',
    policy: 'review',
    checks: [
      warn('Elevated scope', 'Job-admin sees candidate PII — requires IT review (RULE-SEC-044)'),
      pass('Seats available', '6 of 8 Job admin seats in use'),
      pass('Security training', 'PII handling module current'),
    ],
    status: 'pending',
  },
  {
    id: 'AR-2115',
    requester: 'Marcus Webb',
    dept: 'Engineering',
    office: 'SF HQ',
    app: 'okta',
    role: 'Group admin — Contractors',
    scope: 'Admin',
    justification:
      'Platform team onboards three contractors in July — wants to manage the Contractors group directly instead of ticketing IT each time.',
    requestedAt: '2026-07-02T17:25:00Z',
    manager: 'Priya Raman',
    managerApprovedAt: '2026-07-02T18:05:00Z',
    ticket: 'HELP-4838',
    policy: 'review',
    checks: [
      warn('Admin scope', 'Identity-provider group admin requires IT review (RULE-SEC-007)'),
      warn('Broad blast radius', 'The Contractors group gates VPN and GitHub for 11 accounts'),
      pass('Hardware MFA', 'YubiKey enrolled Jan 2025'),
    ],
    status: 'pending',
  },
  // ---- Violates policy (1) — the SoD conflict ----------------------------
  {
    id: 'AR-2110',
    requester: 'Ravi Kapoor',
    dept: 'Finance',
    office: 'SF HQ',
    app: 'netsuite',
    role: 'AP Payment Approver',
    scope: 'Elevated',
    justification:
      'Elena is out for the Jul 15 close — need approver rights as backup so vendor payments are not blocked.',
    requestedAt: '2026-07-01T16:05:00Z',
    manager: 'Elena Voss',
    managerApprovedAt: '2026-07-01T16:30:00Z',
    managerNote: 'Backup approver for month-end close while I travel.',
    ticket: 'HELP-4818',
    policy: 'violation',
    checks: [
      fail('Separation of duties', 'SOD-FIN-02 — requester already holds AP Invoice Entry in NetSuite'),
      warn('Elevated scope', 'Finance-system approver role (RULE-SEC-052)'),
      pass('Hardware MFA', 'YubiKey enrolled Aug 2025'),
    ],
    sod: {
      rule: 'SOD-FIN-02',
      heldRole: 'AP Invoice Entry (granted Mar 2026)',
      detail:
        'One person may not both enter vendor invoices and approve their payment. Granting AP Payment Approver alongside AP Invoice Entry would let a single account create and release a payment end-to-end.',
    },
    status: 'pending',
  },
];

// ---------------------------------------------------------------------------
// DECISIONS AUDIT — seeded strip of the last 48h of verdicts. AR-2101 is the
// prod-admin denial that Felix Braun's pending AR-2108 re-scopes; AR-2099 is
// Ken Tanaka's auto-approved onboarding Notion seat (policy engine, no
// human reviewer).
// ---------------------------------------------------------------------------

type AuditVerdict = 'approved' | 'denied' | 'auto-approved';

interface AuditEntry {
  id: string;
  requestId: string;
  verdict: AuditVerdict;
  app: AppId;
  role: string;
  person: string;
  by: string;
  at: string;
  note?: string;
}

const SEED_AUDIT: AuditEntry[] = [
  {
    id: 'aud-2104',
    requestId: 'AR-2104',
    verdict: 'approved',
    app: 'datadog',
    role: 'Standard user',
    person: 'Ben Ryder',
    by: 'Tom Okonkwo',
    at: '2026-07-03T10:12:00Z',
  },
  {
    id: 'aud-2101',
    requestId: 'AR-2101',
    verdict: 'denied',
    app: 'aws',
    role: 'prod-admin (IAM role)',
    person: 'Felix Braun',
    by: 'Tom Okonkwo',
    at: '2026-07-02T16:40:00Z',
    note: 'Scope too broad — re-request read-only',
  },
  {
    id: 'aud-2100',
    requestId: 'AR-2100',
    verdict: 'approved',
    app: 'salesforce',
    role: 'Sales user',
    person: 'Hana Suzuki',
    by: 'Tom Okonkwo',
    at: '2026-07-02T15:05:00Z',
  },
  {
    id: 'aud-2099',
    requestId: 'AR-2099',
    verdict: 'auto-approved',
    app: 'notion',
    role: 'Member seat',
    person: 'Ken Tanaka',
    by: 'Policy engine',
    at: '2026-07-02T09:18:00Z',
  },
  {
    id: 'aud-2098',
    requestId: 'AR-2098',
    verdict: 'approved',
    app: 'zendesk',
    role: 'Agent seat',
    person: 'Ines Costa',
    by: 'Tom Okonkwo',
    at: '2026-07-01T12:22:00Z',
  },
];

// ---------------------------------------------------------------------------
// HELPERS + POLICY METADATA
// ---------------------------------------------------------------------------

type PolicyFilter = 'all' | PolicyVerdict;

const POLICY_META: Record<
  PolicyVerdict,
  {label: string; token: 'green' | 'orange' | 'red'}
> = {
  auto: {label: 'Auto-approvable', token: 'green'},
  review: {label: 'Needs review', token: 'orange'},
  violation: {label: 'Violates policy', token: 'red'},
};

const CHECK_META: Record<
  CheckState,
  {icon: typeof CircleCheckIcon; color: string}
> = {
  pass: {icon: CircleCheckIcon, color: 'var(--color-success)'},
  warn: {icon: TriangleAlertIcon, color: 'var(--color-warning)'},
  fail: {icon: ShieldAlertIcon, color: 'var(--color-error)'},
};

/** Age in days against the frozen review-session "now". */
function ageDays(iso: string): number {
  return (FROZEN_NOW - Date.parse(iso)) / 86_400_000;
}

/** "9h" under a day, "2.2d" beyond — tabular, never wraps. */
function formatAge(iso: string): string {
  const days = ageDays(iso);
  if (days < 1) {
    return `${Math.round(days * 24)}h`;
  }
  return `${days.toFixed(1)}d`;
}

function isSlaBreached(request: AccessRequest): boolean {
  return request.status === 'pending' && ageDays(request.requestedAt) > SLA_DAYS;
}

function firstName(person: string): string {
  return person.split(' ')[0];
}

function requestSummary(request: AccessRequest): string {
  return `${APPS[request.app].label} ${request.role} for ${request.requester}`;
}

// ---------------------------------------------------------------------------
// TABLE CELLS + COLUMNS — fixed-width columns use pixel() so the header
// carries both width and minWidth (Table cells have max-width: 0).
// ---------------------------------------------------------------------------

function RequestCell({request}: {request: AccessRequest}) {
  const app = APPS[request.app];
  return (
    <HStack gap={2} vAlign="center">
      <span style={styles.appGlyph}>
        <span style={{display: 'inline-flex', color: app.color}}>
          <Icon icon={app.icon} size="sm" color="inherit" />
        </span>
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {app.label} — {request.role}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1} hasTabularNumbers>
            {request.id} · {request.scope} scope
          </Text>
        </VStack>
      </StackItem>
      {request.status !== 'pending' ? (
        <Token
          size="sm"
          color={request.status === 'approved' ? 'green' : 'red'}
          label={request.status === 'approved' ? 'Approved' : 'Denied'}
        />
      ) : null}
    </HStack>
  );
}

function RequesterCell({request}: {request: AccessRequest}) {
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={request.requester} size="xsmall" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="body" maxLines={1}>
            {request.requester}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {request.dept} · {request.office}
          </Text>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function PolicyPill({request}: {request: AccessRequest}) {
  const meta = POLICY_META[request.policy];
  return (
    <HStack gap={1} vAlign="center">
      <Token size="sm" color={meta.token} label={meta.label} />
      {request.sod !== undefined ? (
        <span
          style={{display: 'inline-flex', color: 'var(--color-error)'}}
          aria-label={`Separation-of-duties conflict ${request.sod.rule}`}>
          <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
        </span>
      ) : null}
    </HStack>
  );
}

/** Compact "Mgr ✓ → IT" chain readout; the full stepper lives in the panel. */
function ChainCell({request}: {request: AccessRequest}) {
  const itDone = request.status !== 'pending';
  return (
    <span style={styles.chainMini}>
      <span style={{display: 'inline-flex', color: 'var(--color-success)'}}>
        <Icon icon={CheckIcon} size="xsm" color="inherit" />
      </span>
      <Text type="supporting" color="secondary">
        Mgr
      </Text>
      <Icon icon={ChevronRightIcon} size="xsm" color="secondary" />
      <span
        style={{
          display: 'inline-flex',
          color: itDone
            ? request.status === 'approved'
              ? 'var(--color-success)'
              : 'var(--color-error)'
            : 'var(--color-accent)',
        }}>
        <Icon
          icon={itDone ? (request.status === 'approved' ? CheckIcon : XIcon) : ClockIcon}
          size="xsm"
          color="inherit"
        />
      </span>
      <Text type="supporting" color={itDone ? 'secondary' : 'primary'}>
        IT
      </Text>
    </span>
  );
}

function AgeCell({request}: {request: AccessRequest}) {
  const breached = isSlaBreached(request);
  if (request.status !== 'pending') {
    return (
      <Text type="supporting" color="secondary" hasTabularNumbers style={styles.numericCell}>
        Decided
      </Text>
    );
  }
  return (
    <VStack gap={0} hAlign="end">
      <Text
        type="body"
        hasTabularNumbers
        style={breached ? {...styles.numericCell, ...styles.slaAmber} : styles.numericCell}>
        {formatAge(request.requestedAt)}
      </Text>
      {breached ? (
        <span style={{...styles.numericCell, ...styles.slaAmber, fontSize: 11}}>
          SLA breach
        </span>
      ) : null}
    </VStack>
  );
}

function buildColumns(hidesSecondary: boolean): TableColumn<AccessRequest>[] {
  const columns: TableColumn<AccessRequest>[] = [
    {
      key: 'request',
      header: 'Request',
      width: proportional(2, {minWidth: 230}),
      sortable: {sortKey: 'app'},
      renderCell: (request: AccessRequest) => <RequestCell request={request} />,
    },
    {
      key: 'requester',
      header: 'Requester',
      width: proportional(1.2, {minWidth: 150}),
      sortable: {sortKey: 'requester'},
      renderCell: (request: AccessRequest) => <RequesterCell request={request} />,
    },
  ];
  if (!hidesSecondary) {
    columns.push({
      key: 'justification',
      header: 'Business justification',
      width: proportional(1.6, {minWidth: 180}),
      renderCell: (request: AccessRequest) => (
        <Text
          type="supporting"
          color="secondary"
          maxLines={1}
          style={styles.justificationExcerpt}>
          “{request.justification}”
        </Text>
      ),
    });
  }
  columns.push({
    key: 'policy',
    header: 'Policy check',
    width: pixel(150),
    sortable: {sortKey: 'policy'},
    renderCell: (request: AccessRequest) => <PolicyPill request={request} />,
  });
  if (!hidesSecondary) {
    columns.push({
      key: 'chain',
      header: 'Chain',
      width: pixel(104),
      renderCell: (request: AccessRequest) => <ChainCell request={request} />,
    });
  }
  columns.push({
    key: 'age',
    header: 'Age',
    align: 'end',
    width: pixel(96),
    sortable: {sortKey: 'requestedAt'},
    renderCell: (request: AccessRequest) => <AgeCell request={request} />,
  });
  return columns;
}

// ---------------------------------------------------------------------------
// APPROVAL-CHAIN STEPPER — Requested → Manager approved → IT review →
// (Security sign-off →) Provisioning. Derived from the request during
// render; verdicts recolor the IT step and queue provisioning.
// ---------------------------------------------------------------------------

type StepState = 'done' | 'current' | 'failed' | 'upcoming';

interface ChainStep {
  id: string;
  label: string;
  actor: string;
  at?: string;
  note?: string;
  state: StepState;
}

function chainFor(request: AccessRequest): ChainStep[] {
  const isDecided = request.status !== 'pending';
  const steps: ChainStep[] = [
    {
      id: 'requested',
      label: 'Requested',
      actor: request.requester,
      at: request.requestedAt,
      state: 'done',
    },
    {
      id: 'manager',
      label: 'Manager approval',
      actor: request.manager,
      at: request.managerApprovedAt,
      note: request.managerNote,
      state: 'done',
    },
    {
      id: 'it',
      label: 'IT review',
      actor: `${CURRENT_USER} (you)`,
      at: request.decidedAt,
      note: isDecided
        ? request.status === 'approved'
          ? 'Approved'
          : 'Denied — returned to requester'
        : request.policy === 'violation'
          ? 'Blocked by policy — resolve or deny'
          : 'Awaiting your verdict',
      state: isDecided ? (request.status === 'approved' ? 'done' : 'failed') : 'current',
    },
  ];
  if (request.needsSecuritySignoff === true) {
    steps.push({
      id: 'security',
      label: 'Security sign-off',
      actor: 'Priya Raman',
      note: 'Required for production IAM roles',
      state: request.status === 'approved' ? 'current' : 'upcoming',
    });
  }
  steps.push({
    id: 'provision',
    label: 'Provisioning',
    actor: 'Okta workflow WF-114',
    note:
      request.status === 'approved'
        ? request.needsSecuritySignoff === true
          ? 'Queued behind security sign-off'
          : 'Queued — grant lands within 15 min'
        : request.status === 'denied'
          ? 'Cancelled'
          : 'Runs automatically after approval',
    state: request.status === 'approved' && request.needsSecuritySignoff !== true ? 'current' : 'upcoming',
  });
  return steps;
}

const STEP_DOT_STYLE: Record<StepState, CSSProperties> = {
  done: {...styles.stepDot, ...styles.stepDotDone},
  current: {...styles.stepDot, ...styles.stepDotCurrent},
  failed: {...styles.stepDot, ...styles.stepDotFailed},
  upcoming: styles.stepDot,
};

const STEP_ICON: Record<StepState, typeof CheckIcon> = {
  done: CheckIcon,
  current: ClockIcon,
  failed: XIcon,
  upcoming: CircleDashedIcon,
};

function ChainStepper({request}: {request: AccessRequest}) {
  const steps = chainFor(request);
  return (
    <VStack gap={0} aria-label="Approval chain">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <div key={step.id} style={styles.stepRow}>
            <div style={styles.stepRail}>
              <span style={STEP_DOT_STYLE[step.state]}>
                <Icon icon={STEP_ICON[step.state]} size="xsm" color="inherit" />
              </span>
              {!isLast ? (
                <span
                  style={
                    step.state === 'done'
                      ? {...styles.stepConnector, ...styles.stepConnectorDone}
                      : styles.stepConnector
                  }
                />
              ) : null}
            </div>
            <div style={{...styles.stepBody, ...(isLast ? {paddingBottom: 0} : null)}}>
              <VStack gap={0}>
                <Text
                  type="label"
                  size="sm"
                  color={step.state === 'upcoming' ? 'secondary' : 'primary'}>
                  {step.label}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {step.actor}
                  {step.at !== undefined ? (
                    <>
                      {' · '}
                      <Timestamp
                        value={step.at}
                        format="date_time"
                        hasTooltip={false}
                        type="supporting"
                        color="secondary"
                      />
                    </>
                  ) : null}
                </Text>
                {step.note !== undefined ? (
                  <Text type="supporting" color="secondary" maxLines={2}>
                    {step.note}
                  </Text>
                ) : null}
              </VStack>
            </div>
          </div>
        );
      })}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// EXPANDED-REQUEST PANEL — the "request card": scrolling body (identity,
// justification, SoD banner, policy checks, chain, metadata) + pinned
// verdict bar.
// ---------------------------------------------------------------------------

function PolicyCheckList({checks}: {checks: PolicyCheck[]}) {
  return (
    <VStack gap={2}>
      {checks.map(check => {
        const meta = CHECK_META[check.state];
        return (
          <div key={check.label} style={styles.checkRow}>
            <span style={{...styles.checkGlyph, color: meta.color}}>
              <Icon icon={meta.icon} size="sm" color="inherit" />
            </span>
            <VStack gap={0} style={{minWidth: 0}}>
              <Text type="label" size="sm">
                {check.label}
              </Text>
              <Text type="supporting" color="secondary">
                {check.note}
              </Text>
            </VStack>
          </div>
        );
      })}
    </VStack>
  );
}

function RequestPanel({
  request,
  onApprove,
  onDeny,
}: {
  request: AccessRequest | null;
  onApprove: (ids: string[]) => void;
  onDeny: (id: string) => void;
}) {
  if (request === null) {
    return (
      <div style={styles.panelScroll}>
        <EmptyState
          isCompact
          icon={<Icon icon={KeyRoundIcon} size="lg" />}
          title="No request selected"
          description="Select a row to review the approval chain, policy checks, and justification."
        />
      </div>
    );
  }

  const app = APPS[request.app];
  const policyMeta = POLICY_META[request.policy];
  const breached = isSlaBreached(request);
  const isPending = request.status === 'pending';

  return (
    <div style={styles.panelFill}>
      <div style={styles.panelScroll}>
        <VStack gap={4}>
          {/* Request identity */}
          <HStack gap={3} vAlign="center">
            <span style={styles.panelGlyph}>
              <span style={{display: 'inline-flex', color: app.color}}>
                <Icon icon={app.icon} size="md" color="inherit" />
              </span>
            </span>
            <StackItem size="fill" style={{minWidth: 0}}>
              <VStack gap={0}>
                <Heading level={3}>{app.label}</Heading>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {request.role} · {request.scope} scope
                </Text>
              </VStack>
            </StackItem>
          </HStack>
          <HStack gap={1} wrap="wrap">
            <Token size="sm" color={policyMeta.token} label={policyMeta.label} />
            {breached ? (
              <Token size="sm" color="yellow" label={`SLA breached · ${formatAge(request.requestedAt)}`} />
            ) : null}
            {request.startsOn !== undefined ? (
              <Token size="sm" color="blue" label={`New hire · starts ${request.startsOn}`} />
            ) : null}
          </HStack>

          {/* Verdict banners once decided */}
          {request.status === 'approved' ? (
            <Banner
              status="success"
              container="section"
              title={`Approved by ${CURRENT_USER}`}
              description={`Provisioning queued via Okta workflow WF-114 · ${request.id}`}
            />
          ) : null}
          {request.status === 'denied' ? (
            <Banner
              status="error"
              container="section"
              title={`Denied by ${CURRENT_USER}`}
              description={`Returned to ${firstName(request.requester)} with the review notes · ${request.id}`}
            />
          ) : null}

          {/* SoD conflict — the one violates-policy request */}
          {request.sod !== undefined ? (
            <Banner
              status="error"
              container="section"
              title={`Separation-of-duties conflict — ${request.sod.rule}`}
              description={`${request.requester} already holds ${request.sod.heldRole}. ${request.sod.detail}`}
            />
          ) : null}

          {/* Requester */}
          <HStack gap={2} vAlign="center">
            <Avatar name={request.requester} size="small" />
            <StackItem size="fill" style={{minWidth: 0}}>
              <VStack gap={0}>
                <Text type="label" maxLines={1}>
                  {request.requester}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {request.dept} · {request.office} · reports to {request.manager}
                </Text>
              </VStack>
            </StackItem>
          </HStack>

          <Divider />

          <VStack gap={2}>
            <Text type="label" size="sm" color="secondary">
              Business justification
            </Text>
            <div style={styles.quoteBlock}>
              <Text type="body">“{request.justification}”</Text>
            </div>
          </VStack>

          <VStack gap={2}>
            <Text type="label" size="sm" color="secondary">
              Policy checks
            </Text>
            <PolicyCheckList checks={request.checks} />
          </VStack>

          <Divider />

          <VStack gap={2}>
            <Text type="label" size="sm" color="secondary">
              Approval chain
            </Text>
            <ChainStepper request={request} />
          </VStack>

          <MetadataList columns={1} label={{position: 'start', width: 96}}>
            <MetadataListItem label="Request">
              <Text type="body" hasTabularNumbers>
                {request.id} · {request.ticket}
              </Text>
            </MetadataListItem>
            <MetadataListItem label="Requested">
              <Timestamp value={request.requestedAt} format="date_time" />
            </MetadataListItem>
            <MetadataListItem label="Source">
              <Text type="body">Okta access catalog</Text>
            </MetadataListItem>
            <MetadataListItem label="SLA">
              {breached ? (
                <Text type="body" style={styles.slaAmber} hasTabularNumbers>
                  3-day target — breached by {(ageDays(request.requestedAt) - SLA_DAYS).toFixed(1)}d
                </Text>
              ) : (
                <Text type="body" hasTabularNumbers>
                  Within the 3-day target
                </Text>
              )}
            </MetadataListItem>
          </MetadataList>
        </VStack>
      </div>

      {/* Pinned verdict bar */}
      {isPending ? (
        <>
          <Divider />
          <VStack gap={2} style={styles.panelActions}>
            <HStack gap={2}>
              <StackItem size="fill">
                <Button
                  label="Approve"
                  variant="primary"
                  size="sm"
                  style={{width: '100%'}}
                  isDisabled={request.policy === 'violation'}
                  icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
                  onClick={() => onApprove([request.id])}
                />
              </StackItem>
              <StackItem size="fill">
                <Button
                  label="Deny"
                  variant="destructive"
                  size="sm"
                  style={{width: '100%'}}
                  icon={<Icon icon={BanIcon} size="sm" color="inherit" />}
                  onClick={() => onDeny(request.id)}
                />
              </StackItem>
            </HStack>
            {request.policy === 'violation' ? (
              <Text type="supporting" color="secondary">
                Approval is blocked by {request.sod?.rule ?? 'policy'} — remove the
                conflicting role or deny the request.
              </Text>
            ) : null}
          </VStack>
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DECISIONS-AUDIT FOOTER STRIP
// ---------------------------------------------------------------------------

const AUDIT_META: Record<
  AuditVerdict,
  {icon: typeof CheckIcon; color: string; verb: string}
> = {
  approved: {icon: CircleCheckIcon, color: 'var(--color-success)', verb: 'approved'},
  denied: {icon: BanIcon, color: 'var(--color-error)', verb: 'denied'},
  'auto-approved': {icon: ShieldCheckIcon, color: 'var(--color-accent)', verb: 'auto-approved'},
};

function AuditChip({entry}: {entry: AuditEntry}) {
  const meta = AUDIT_META[entry.verdict];
  return (
    <span style={styles.auditChip}>
      <span style={{display: 'inline-flex', color: meta.color, flexShrink: 0}}>
        <Icon icon={meta.icon} size="sm" color="inherit" />
      </span>
      <VStack gap={0}>
        <Text type="supporting" hasTabularNumbers>
          {entry.requestId} · {APPS[entry.app].label} {entry.role} — {entry.person}
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {meta.verb} by {entry.by} ·{' '}
          <Timestamp
            value={entry.at}
            format="date_time"
            hasTooltip={false}
            type="supporting"
            color="secondary"
          />
          {entry.note !== undefined ? ` · ${entry.note}` : ''}
        </Text>
      </VStack>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const FILTER_OPTIONS: {value: PolicyFilter; label: string}[] = [
  {value: 'all', label: 'All'},
  {value: 'auto', label: 'Auto-approvable'},
  {value: 'review', label: 'Needs review'},
  {value: 'violation', label: 'Violations'},
];

const POLICY_SORT_ORDER: Record<PolicyVerdict, number> = {
  violation: 0,
  review: 1,
  auto: 2,
};

/**
 * Observe the table region's real width. The 340px request panel and any
 * host chrome shrink the table independently of the viewport, so viewport
 * media queries alone cannot tell when the full column set is out of room.
 */
function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

export default function ItAccessRequestsTemplate() {
  const [requests, setRequests] = useState<AccessRequest[]>(INITIAL_REQUESTS);
  const [audit, setAudit] = useState<AuditEntry[]>(SEED_AUDIT);
  const [filter, setFilter] = useState<PolicyFilter>('all');
  const [query, setQuery] = useState('');
  // The SoD-conflict request opens expanded so the blocked-approve state is
  // visible on first paint.
  const [activeId, setActiveId] = useState<string | null>('AR-2110');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px drops the request panel; <=860px swaps
  // the filter control and tightens the header/footer rows.
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  // The Justification/Chain columns key off the table region's measured
  // width, not the viewport — the request panel and host chrome eat width
  // the media query cannot see. Under 1000px the full column set would
  // clip the Policy/Chain/Age cells behind a horizontal scroll edge.
  const tableRegionRef = useRef<HTMLDivElement | null>(null);
  const tableRegionWidth = useElementWidth(tableRegionRef);
  const hidesSecondaryColumns =
    isCompact || (tableRegionWidth > 0 && tableRegionWidth < 1000);

  // Policy filter + search, derived during render.
  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return requests.filter(row => {
      if (filter !== 'all' && row.policy !== filter) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      const haystack =
        `${row.id} ${row.requester} ${APPS[row.app].label} ${row.role} ${row.dept}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [requests, filter, query]);

  // Sort plugin — default oldest-first (most SLA pressure at the top).
  const {sortedData, sortConfig} = useTableSortableState<AccessRequest>({
    data: visibleRows,
    defaultSort: [{sortKey: 'requestedAt', direction: 'ascending'}],
    comparators: {
      requestedAt: (a, b) => a.requestedAt.localeCompare(b.requestedAt),
      requester: (a, b) => a.requester.localeCompare(b.requester),
      app: (a, b) => APPS[a.app].label.localeCompare(APPS[b.app].label),
      policy: (a, b) => POLICY_SORT_ORDER[a.policy] - POLICY_SORT_ORDER[b.policy],
    },
  });
  const sortPlugin = useTableSortable<AccessRequest>(sortConfig);

  // Selection plugin — only policy-clean pending rows are bulk-approvable;
  // flagged rows never render a checkbox, so select-all is always safe.
  const {selectionConfig} = useTableSelectionState<AccessRequest>({
    data: sortedData,
    idKey: 'id',
    getIsItemSelectable: row => row.policy === 'auto' && row.status === 'pending',
    selectedKeys,
    setSelectedKeys,
  });
  const selectionPlugin = useTableSelection(selectionConfig);

  // Row-click plugin: clicking a row expands it into the end panel.
  const activePlugin = useMemo<TablePlugin<AccessRequest>>(
    () => ({
      transformBodyRow: (props, item) => {
        const prevOnClick = props.htmlProps.onClick;
        const isActive = item.id === activeId;
        const isDecided = item.status !== 'pending';
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
              // Decided rows stay for the audit trail but recede.
              ...(isDecided ? {opacity: 0.55} : null),
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

  const columns = useMemo(
    () => buildColumns(hidesSecondaryColumns),
    [hidesSecondaryColumns],
  );

  // Queue stats — pending only, so every chip reconciles with the table.
  const pending = requests.filter(row => row.status === 'pending');
  const pendingAuto = pending.filter(row => row.policy === 'auto');
  const pendingReview = pending.filter(row => row.policy === 'review');
  const pendingViolation = pending.filter(row => row.policy === 'violation');
  const breachedCount = pending.filter(isSlaBreached).length;
  const oldestPending = pending.reduce<AccessRequest | null>(
    (oldest, row) =>
      oldest === null || row.requestedAt < oldest.requestedAt ? row : oldest,
    null,
  );

  const selectedRows = sortedData.filter(row => selectedKeys.has(row.id));
  const selectedCount = selectedRows.length;
  const activeRequest = requests.find(row => row.id === activeId) ?? null;

  const clearSelection = () => setSelectedKeys(new Set());

  const recordDecision = (ids: string[], verdict: 'approved' | 'denied') => {
    const idSet = new Set(ids);
    const decided = requests.filter(row => idSet.has(row.id));
    setRequests(prev =>
      prev.map(row =>
        idSet.has(row.id)
          ? {
              ...row,
              status: verdict,
              decidedAt: SESSION_TIME,
            }
          : row,
      ),
    );
    setAudit(prev => [
      ...decided.map(row => ({
        id: `aud-session-${row.id}`,
        requestId: row.id,
        verdict: verdict === 'approved' ? ('approved' as const) : ('denied' as const),
        app: row.app,
        role: row.role,
        person: row.requester,
        by: CURRENT_USER,
        at: SESSION_TIME,
        note: verdict === 'denied' ? 'Returned to requester' : undefined,
      })),
      ...prev,
    ]);
    clearSelection();
  };

  const approveRequests = (ids: string[]) => {
    recordDecision(ids, 'approved');
    const first = requests.find(row => row.id === ids[0]);
    setAnnouncement(
      ids.length === 1 && first !== undefined
        ? `Approved ${requestSummary(first)}`
        : `Approved ${ids.length} policy-clean requests`,
    );
  };

  const denyRequest = (id: string) => {
    recordDecision([id], 'denied');
    const target = requests.find(row => row.id === id);
    setAnnouncement(
      target !== undefined
        ? `Denied ${requestSummary(target)} — returned to requester`
        : 'Request denied',
    );
  };

  // ----- header: brand, search, queue stat chips, panel toggle -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={KeyRoundIcon} size="md" color="secondary" />
          <Heading level={1}>Access requests</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · IT
          </Text>
        </HStack>
        <StackItem size="fill">
          <TextInput
            label="Search access requests"
            isLabelHidden
            size="sm"
            width="100%"
            style={{maxWidth: 460}}
            placeholder="Search requester, app, role, or ID…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <span style={styles.statChip}>
            <Icon icon={UserCheckIcon} size="xsm" color="inherit" />
            {pending.length} pending
          </span>
          <span style={styles.statChip}>
            <span style={{...styles.chipDot, backgroundColor: 'var(--color-success)'}} />
            {pendingAuto.length} auto-approvable
          </span>
          <span style={styles.statChip}>
            <span style={{...styles.chipDot, backgroundColor: 'var(--color-warning)'}} />
            {breachedCount} SLA {breachedCount === 1 ? 'breach' : 'breaches'}
          </span>
        </HStack>
        {!isPanelHidden && (
          <IconButton
            label={isPanelOpen ? 'Hide request panel' : 'Show request panel'}
            tooltip={isPanelOpen ? 'Hide request panel' : 'Show request panel'}
            size="sm"
            variant={isPanelOpen ? 'secondary' : 'ghost'}
            icon={<Icon icon={PanelRightIcon} size="sm" />}
            onClick={() => setIsPanelOpen(open => !open)}
          />
        )}
      </HStack>
    </LayoutHeader>
  );

  // ----- content toolbar: policy filter + queue readout -----
  const contentToolbar = (
    <HStack gap={3} vAlign="center" style={styles.contentToolbar} wrap="wrap">
      {isCompact ? (
        <Selector
          label="Policy filter"
          isLabelHidden
          options={FILTER_OPTIONS}
          value={filter}
          onChange={value => setFilter(value as PolicyFilter)}
          size="sm"
          width={190}
        />
      ) : (
        <SegmentedControl
          label="Policy filter"
          value={filter}
          onChange={value => setFilter(value as PolicyFilter)}
          size="sm">
          {FILTER_OPTIONS.map(option => (
            <SegmentedControlItem
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </SegmentedControl>
      )}
      <StackItem size="fill" />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {pendingReview.length} to review · {pendingViolation.length}{' '}
        {pendingViolation.length === 1 ? 'violation' : 'violations'}
        {oldestPending !== null
          ? ` · oldest ${formatAge(oldestPending.requestedAt)}`
          : ''}
      </Text>
    </HStack>
  );

  // ----- bulk bar: appears while policy-clean rows are checked -----
  const bulkBar =
    selectedCount === 0 ? null : (
      <div style={styles.bulkBar}>
        <Toolbar
          label="Bulk approval actions"
          size="sm"
          gap={2}
          variant="section"
          dividers={['bottom', 'top']}
          startContent={
            <HStack gap={2} vAlign="center">
              <Text type="label" hasTabularNumbers>
                {selectedCount} policy-clean selected
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
            <Button
              label={`Approve ${selectedCount}`}
              variant="primary"
              size="sm"
              icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
              onClick={() => approveRequests(selectedRows.map(row => row.id))}
            />
          }
        />
      </div>
    );

  // ----- decisions-audit footer strip -----
  const footer = (
    <LayoutFooter hasDivider>
      <div style={styles.footerStrip}>
        <HStack gap={2} vAlign="center" style={styles.footerLede}>
          <Icon icon={ScrollTextIcon} size="sm" color="secondary" />
          {!isCompact ? (
            <VStack gap={0}>
              <Text type="label" size="sm">
                Decisions audit
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {audit.length} in the last 48h
              </Text>
            </VStack>
          ) : (
            <Text type="label" size="sm" hasTabularNumbers>
              {audit.length}
            </Text>
          )}
        </HStack>
        <div style={styles.auditScroll} role="log" aria-label="Recent access decisions">
          {audit.map(entry => (
            <AuditChip key={entry.id} entry={entry} />
          ))}
        </div>
        <Button
          label="Export log"
          variant="ghost"
          size="sm"
          icon={<Icon icon={DownloadIcon} size="sm" />}
          isIconOnly={isCompact}
          tooltip={isCompact ? 'Export log' : undefined}
        />
      </div>
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
              {contentToolbar}
              {bulkBar}
              <div ref={tableRegionRef} style={styles.tableScroll}>
                <Table<AccessRequest>
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
                        title={
                          query.trim().length > 0
                            ? 'No matching requests'
                            : 'Queue is clear'
                        }
                        description={
                          query.trim().length > 0
                            ? 'Try a different requester, app, role, or request ID.'
                            : 'No pending requests under this policy filter.'
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
          !isPanelHidden && isPanelOpen ? (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              label="Expanded request">
              <RequestPanel
                request={activeRequest}
                onApprove={approveRequests}
                onDeny={denyRequest}
              />
            </LayoutPanel>
          ) : undefined
        }
        footer={footer}
      />
    </div>
  );
}
