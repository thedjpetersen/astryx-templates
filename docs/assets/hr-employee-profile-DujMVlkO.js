var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — one Kestrel Labs employee record
 *   (Marcus Webb, Platform Lead, Engineering) with a 6-entry level/comp
 *   history (2 promotions), a current comp split (base $218,400 + bonus
 *   target $32,760 + equity $95,000 = $346,160), 7 signed/pending HR
 *   documents, 1 assigned laptop + 2 peripherals with MDM posture, 10
 *   provisioned apps (9 via SSO), and 3 time-off balances that reconcile
 *   (vacation 7.5 used + 3 scheduled + 7.5 remaining = 18 annual). Fixed
 *   ISO timestamps in July 2026; no clocks, randomness, or network media.
 * @output Employee Record — the HR-admin profile surface of the Kestrel
 *   Labs workforce platform. A breadcrumbed action header; an identity band
 *   (large Avatar, name + active StatusDot, level/type Tokens, department ·
 *   office · start-date chips, and a manager-chain chip rail Marcus Webb →
 *   Priya Raman → Camille Duarte); an HR-visibility Banner marking comp
 *   data admin-only with a show/hide-amounts toggle; a sticky section
 *   TabList (Job & Comp / Documents / Devices & Apps / Time off) that
 *   scrolls to sections rendered expanded down the page: a level-history
 *   timeline with promotion markers and a comp split bar + band-position
 *   meter; a signed-documents Table with status Tokens; an assigned-laptop
 *   Card with MDM posture chips plus a provisioned-app grid with SSO
 *   badges; and time-off balance meters with an upcoming/recent ledger.
 *   An end rail keeps at-a-glance metadata and the direct-report roster
 *   (including new hire Ken Tanaka mid-onboarding) pinned.
 * @position Page template; emitted by \`astryx template hr-employee-profile\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (breadcrumbs + record actions) | content (identity band,
 *   visibility banner, sticky section tabs, four expanded sections in one
 *   scroll column, maxWidth 880) | end panel 300 (at-a-glance metadata +
 *   direct reports, scrolls independently).
 * Container policy: record-detail archetype — page chrome and sections are
 *   frame-first rows; Cards only for bounded objects (the assigned laptop
 *   and its peripherals). App tiles, timeline entries, chips, and balance
 *   meters are styled divs so the record reads as one document.
 * Color policy: token-pure everywhere except (a) the repo-standard
 *   \`light-dark()\` fallback pairs on data-viz categorical tokens (comp
 *   split segments, timeline markers, doc glyphs) and (b) the app-tile
 *   brand glyphs — saturated fixed gradients with white monogram text that
 *   deliberately do not flip with the scheme, like real product logos.
 *
 * Responsive contract:
 * - > 1100px: content column + end rail 300; rail scrolls independently.
 * - <= 1100px: the end rail drops; its at-a-glance facts already repeat in
 *   the identity band (department, office, start date, manager) so nothing
 *   is lost silently, and the reports count lives in the Job section.
 * - <= 760px: the identity band stacks under the Avatar; chip rails and
 *   the manager chain wrap; comp legend rows stack; the documents table
 *   drops the Size column; the app grid narrows via auto-fill minmax.
 * - The content column is the only vertical scroller besides the rail;
 *   the section TabList is sticky inside it (\`minHeight: 0\` on the chain).
 */

import {useRef, useState, type CSSProperties, type ReactNode} from 'react';

import {
  AppWindowIcon,
  BriefcaseIcon,
  Building2Icon,
  CalendarDaysIcon,
  ChevronRightIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  HeartHandshakeIcon,
  KeyRoundIcon,
  LaptopIcon,
  LockIcon,
  MapPinIcon,
  MonitorIcon,
  PencilIcon,
  PlaneIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
  TrendingUpIcon,
  UsbIcon,
  UsersIcon,
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
import {BreadcrumbItem, Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
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
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  contentColumn: {
    maxWidth: 880,
    marginInline: 'auto',
    padding: 'var(--spacing-4) var(--spacing-5) var(--spacing-8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  // Identity band ----------------------------------------------------------
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 9px',
    borderRadius: 999, border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)', fontSize: 12, whiteSpace: 'nowrap',
  },
  chainChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px 3px 4px',
    borderRadius: 999, border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)', whiteSpace: 'nowrap',
  },
  chainSelf: {borderColor: 'var(--color-accent)', boxShadow: 'inset 0 0 0 1px var(--color-accent)'},
  // Sticky section tabs ----------------------------------------------------
  // Footgun: the content column sits on \`background-surface\`, not \`-body\`
  // (body is the demo's tinted page backdrop) — using body here paints a
  // visible off-color band behind the tabs in both schemes.
  tabSticky: {
    position: 'sticky', insetBlockStart: 0, zIndex: 2,
    backgroundColor: 'var(--color-background-surface)', paddingBlock: 'var(--spacing-1)',
  },
  section: {scrollMarginTop: 56, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)'},
  sectionCard: {
    border: 'var(--border-width) solid var(--color-border)', borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)', padding: 'var(--spacing-4)',
  },
  // Level history timeline -------------------------------------------------
  timelineRow: {display: 'flex', gap: 'var(--spacing-3)', alignItems: 'stretch'},
  timelineDate: {width: 92, flexShrink: 0, paddingTop: 2, textAlign: 'end'},
  timelineSpine: {display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0},
  timelineDot: {
    width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0,
    backgroundColor: 'var(--color-border)',
  },
  timelineDotPromo: {
    backgroundColor: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
    boxShadow: '0 0 0 3px light-dark(rgba(107,30,253,0.15), rgba(157,107,255,0.22))',
  },
  timelineLine: {width: 2, flex: 1, backgroundColor: 'var(--color-border)', marginTop: 4},
  timelineBody: {flex: 1, minWidth: 0, paddingBottom: 'var(--spacing-4)'},
  moneyText: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Comp split bar ---------------------------------------------------------
  compBar: {
    display: 'flex', height: 14, borderRadius: 999, overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
  },
  compSwatch: {width: 10, height: 10, borderRadius: 3, flexShrink: 0},
  bandTrack: {
    position: 'relative', height: 8, borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  bandMarker: {
    position: 'absolute', top: -4, width: 2, height: 14, borderRadius: 1,
    backgroundColor: 'var(--color-text-primary, currentColor)',
  },
  // Devices & apps ---------------------------------------------------------
  postureChipRow: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)'},
  appGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: 'var(--spacing-3)',
  },
  appTile: {
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)', minWidth: 0,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  // App brand glyphs: saturated fixed gradients with white monogram text —
  // intentional literals that do not flip with the scheme (see Color policy).
  appGlyph: {
    width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#FFFFFF', fontSize: 13, fontWeight: 700,
    letterSpacing: 0.3, flexShrink: 0,
  },
  // Time off ----------------------------------------------------------------
  balanceRow: {
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  // Two-segment balance track — used (solid) then scheduled (faded), so the
  // caption's "used · scheduled · annual" reads back off the bar itself.
  balanceTrack: {
    display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  // End rail ----------------------------------------------------------------
  railScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  docGlyph: {display: 'inline-flex', flexShrink: 0},
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard \`light-dark()\` fallback pair.
const CAT = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs (140-person platform company), July 2026.
// Record subject: Marcus Webb, Platform Lead, Engineering (52 of 140).
// Viewer: Dana Whitfield (People Ops · HR admin). All money USD; all
// timestamps fixed ISO strings. Comp reconciles: 218,400 + 32,760 + 95,000
// = 346,160; vacation reconciles: 7.5 used + 3 scheduled + 7.5 remaining
// = 18 annual.
// ---------------------------------------------------------------------------

const VIEWER = {name: 'Dana Whitfield', role: 'People Ops · HR admin'};

const EMPLOYEE = {
  name: 'Marcus Webb',
  title: 'Platform Lead',
  level: 'IC6',
  department: 'Engineering',
  departmentHeadcount: 52,
  office: 'SF HQ',
  employeeId: 'KL-0034',
  employmentType: 'Full-time',
  status: 'Active',
  startDate: '2021-03-15',
  tenure: '5 yrs 3 mos',
  email: 'marcus.webb@kestrellabs.com',
  phone: '+1 (415) 555-0134',
  team: 'Platform',
};

/** Manager chain, subject first. Roles are stable across the suite. */
const MANAGER_CHAIN = [
  {name: 'Marcus Webb', role: 'Platform Lead', isSelf: true},
  {name: 'Priya Raman', role: 'VP Engineering', isSelf: false},
  {name: 'Camille Duarte', role: 'CEO', isSelf: false},
];

/** Direct reports — Ken Tanaka is mid-onboarding (starts Jul 13), never an
 * active row; matches his in-flight status across the suite. His start date
 * rides in the onboarding token — folding it into \`role\` truncated against
 * the token in the 300px rail. */
const DIRECT_REPORTS = [
  {name: 'Lena Fischer', role: 'Senior Platform Engineer', onboardingLabel: null},
  {name: 'Oskar Lindgren', role: 'Senior Platform Engineer', onboardingLabel: null},
  {name: 'Ravi Menon', role: 'Platform Engineer', onboardingLabel: null},
  {name: 'June Park', role: 'Platform Engineer', onboardingLabel: null},
  {name: 'Ken Tanaka', role: 'Platform Engineer', onboardingLabel: 'Starts Jul 13'},
];

// ----- Job & Comp ----------------------------------------------------------

interface LevelEvent {
  id: string;
  date: string; // ISO date
  kind: 'hire' | 'merit' | 'promotion';
  title: string;
  level: string;
  baseAfter: number;
  baseBefore: number | null;
  note: string;
}

const LEVEL_HISTORY: LevelEvent[] = [
  {
    id: 'lv-2026-merit', date: '2026-04-01', kind: 'merit',
    title: 'Platform Lead', level: 'IC6',
    baseAfter: 218_400, baseBefore: 214_000,
    note: 'Annual merit cycle FY26 — +2.1%; comp adjustment letter signed Apr 2.',
  },
  {
    id: 'lv-2025-promo', date: '2025-10-01', kind: 'promotion',
    title: 'Platform Lead', level: 'IC6',
    baseAfter: 214_000, baseBefore: 204_000,
    note: 'Promoted IC5 → IC6; took over the 4-person Platform team from Priya Raman. Equity refresh KL-EQ-2025-118 granted Oct 14.',
  },
  {
    id: 'lv-2024-merit', date: '2024-04-01', kind: 'merit',
    title: 'Staff Engineer', level: 'IC5',
    baseAfter: 204_000, baseBefore: 196_000,
    note: 'Annual merit cycle FY24 — +4.1%.',
  },
  {
    id: 'lv-2023-promo', date: '2023-09-01', kind: 'promotion',
    title: 'Staff Engineer', level: 'IC5',
    baseAfter: 196_000, baseBefore: 176_500,
    note: 'Promoted IC4 → IC5 after leading the billing-platform rebuild; promo packet approved in the Sep calibration.',
  },
  {
    id: 'lv-2022-merit', date: '2022-04-01', kind: 'merit',
    title: 'Senior Platform Engineer', level: 'IC4',
    baseAfter: 176_500, baseBefore: 168_000,
    note: 'Annual merit cycle FY22 — +5.1%.',
  },
  {
    id: 'lv-2021-hire', date: '2021-03-15', kind: 'hire',
    title: 'Senior Platform Engineer', level: 'IC4',
    baseAfter: 168_000, baseBefore: null,
    note: 'Hired into Engineering, SF HQ. Offer letter and PIIA signed Feb 18.',
  },
];

/** Current comp — segments sum to the quoted total ($346,160). */
const COMP = {
  base: 218_400,
  bonusTarget: 32_760,
  bonusPct: 15,
  equityAnnual: 95_000,
  total: 346_160,
  effectiveDate: '2026-04-01',
  currency: 'USD',
  paySchedule: 'Semi-monthly',
  equityGrant: 'KL-EQ-2025-118 · 4-yr vest, 25% cliff',
  band: {label: 'IC6 · Engineering', min: 195_000, max: 240_000, midpoint: 217_500},
  compaRatio: '1.00',
};

const COMP_SEGMENTS = [
  {id: 'base', label: 'Base salary', amount: COMP.base, color: CAT.blue, note: 'Semi-monthly payroll'},
  {id: 'bonus', label: 'Bonus target', amount: COMP.bonusTarget, color: CAT.orange, note: \`\${COMP.bonusPct}% annual target · paid semi-annually\`},
  {id: 'equity', label: 'Equity (annual vest)', amount: COMP.equityAnnual, color: CAT.purple, note: COMP.equityGrant},
];

// ----- Documents -----------------------------------------------------------
// Signature *status* only — the signing ceremony belongs to
// esignature-envelope-flow.

interface DocRow extends Record<string, unknown> {
  id: string;
  name: string;
  category: string;
  status: 'signed' | 'sent';
  signedAt: string | null;
  sentAt: string | null;
  countersigner: string;
  sizeKb: number;
}

const DOCUMENTS: DocRow[] = [
  {id: 'doc-offer', name: 'Offer letter — Senior Platform Engineer', category: 'Hiring',
    status: 'signed', signedAt: '2021-02-18T17:04:00Z', sentAt: null, countersigner: 'Dana Whitfield', sizeKb: 184},
  {id: 'doc-piia', name: 'Proprietary information & inventions agreement', category: 'Hiring',
    status: 'signed', signedAt: '2021-02-18T17:09:00Z', sentAt: null, countersigner: 'Dana Whitfield', sizeKb: 312},
  {id: 'doc-401k', name: '401(k) beneficiary designation', category: 'Benefits',
    status: 'signed', signedAt: '2021-04-02T15:30:00Z', sentAt: null, countersigner: 'Elena Voss', sizeKb: 96},
  {id: 'doc-eq-2025', name: 'Equity refresh grant notice — KL-EQ-2025-118', category: 'Equity',
    status: 'signed', signedAt: '2025-10-14T18:20:00Z', sentAt: null, countersigner: 'Elena Voss', sizeKb: 148},
  {id: 'doc-handbook', name: 'Employee handbook v6 acknowledgement', category: 'Policy',
    status: 'signed', signedAt: '2026-01-12T16:45:00Z', sentAt: null, countersigner: 'Dana Whitfield', sizeKb: 74},
  {id: 'doc-comp-2026', name: 'FY26 compensation adjustment letter', category: 'Compensation',
    status: 'signed', signedAt: '2026-04-02T19:12:00Z', sentAt: null, countersigner: 'Priya Raman', sizeKb: 122},
  {id: 'doc-eq-2026', name: 'FY26 equity refresh grant notice', category: 'Equity',
    status: 'sent', signedAt: null, sentAt: '2026-06-28T16:00:00Z', countersigner: 'Elena Voss', sizeKb: 151},
];

// ----- Devices & Apps ------------------------------------------------------
// Asset KL-MBP-0147 is the same row the device-inventory surface tracks.

const LAPTOP = {
  model: 'MacBook Pro 16" — M4 Pro, 48 GB / 1 TB',
  assetTag: 'KL-MBP-0147',
  serial: 'C02XK9AKMD6R',
  assignedAt: '2025-10-20',
  os: 'macOS 15.5',
  lastCheckIn: '2026-07-03T07:42:00Z',
  warrantyUntil: '2028-10-20',
};

const PERIPHERALS = [
  {id: 'per-mon', icon: MonitorIcon, name: 'LG UltraFine 27" 5K', assetTag: 'KL-MON-0312', assignedAt: '2025-10-20'},
  {id: 'per-key', icon: UsbIcon, name: 'YubiKey 5C NFC', assetTag: 'KL-KEY-0089', assignedAt: '2024-02-06'},
];

interface AppGrant {
  id: string;
  name: string;
  monogram: string;
  gradient: string; // fixed brand-ish gradient, scheme-stable (Color policy)
  role: string;
  grantSource: string;
  auth: 'sso' | 'password';
  hasScim: boolean;
  grantedAt: string;
}

const APPS: AppGrant[] = [
  {id: 'app-gws', name: 'Google Workspace', monogram: 'GW', gradient: 'linear-gradient(135deg, #4285F4, #1A73E8)',
    role: 'Member', grantSource: 'All employees', auth: 'sso', hasScim: true, grantedAt: '2021-03-15'},
  {id: 'app-slack', name: 'Slack', monogram: 'Sl', gradient: 'linear-gradient(135deg, #611F69, #A0399F)',
    role: 'Member', grantSource: 'All employees', auth: 'sso', hasScim: true, grantedAt: '2021-03-15'},
  {id: 'app-1pw', name: '1Password', monogram: '1P', gradient: 'linear-gradient(135deg, #1A8CFF, #0364D3)',
    role: 'Member', grantSource: 'All employees', auth: 'sso', hasScim: true, grantedAt: '2021-03-15'},
  {id: 'app-github', name: 'GitHub', monogram: 'GH', gradient: 'linear-gradient(135deg, #24292F, #57606A)',
    role: 'Org admin', grantSource: 'Engineering group', auth: 'sso', hasScim: false, grantedAt: '2021-03-16'},
  {id: 'app-linear', name: 'Linear', monogram: 'Ln', gradient: 'linear-gradient(135deg, #5E6AD2, #8B93FF)',
    role: 'Admin', grantSource: 'Platform team', auth: 'sso', hasScim: true, grantedAt: '2021-03-16'},
  {id: 'app-figma', name: 'Figma', monogram: 'Fg', gradient: 'linear-gradient(135deg, #A259FF, #F24E1E)',
    role: 'Editor', grantSource: 'Engineering group', auth: 'sso', hasScim: false, grantedAt: '2022-01-10'},
  {id: 'app-datadog', name: 'Datadog', monogram: 'Dd', gradient: 'linear-gradient(135deg, #632CA6, #9A6BD6)',
    role: 'Admin', grantSource: 'Platform team', auth: 'sso', hasScim: false, grantedAt: '2023-09-04'},
  {id: 'app-pd', name: 'PagerDuty', monogram: 'PD', gradient: 'linear-gradient(135deg, #04AC38, #0B7C2E)',
    role: 'Responder', grantSource: 'Platform on-call', auth: 'sso', hasScim: false, grantedAt: '2023-09-04'},
  {id: 'app-aws', name: 'AWS', monogram: 'AW', gradient: 'linear-gradient(135deg, #FF9900, #E37B00)',
    role: 'PowerUser', grantSource: 'Platform team', auth: 'sso', hasScim: false, grantedAt: '2021-03-18'},
  {id: 'app-appledev', name: 'Apple Developer', monogram: 'AD', gradient: 'linear-gradient(135deg, #555555, #111111)',
    role: 'Developer', grantSource: 'Direct grant · Tom Okonkwo', auth: 'password', hasScim: false, grantedAt: '2024-06-11'},
];

const SSO_COUNT = APPS.filter(app => app.auth === 'sso').length; // 9 of 10

// ----- Time off ------------------------------------------------------------
// Admin-side balance readout (the request composer belongs to
// time-off-planner). Vacation reconciles: 7.5 used + 3 scheduled + 7.5
// remaining = 18 annual; the ledger rows below sum to the same figures.

interface TimeOffBalance {
  id: string;
  label: string;
  icon: typeof PlaneIcon;
  color: string;
  annual: number;
  used: number;
  scheduled: number;
  accrualNote: string;
}

const BALANCES: TimeOffBalance[] = [
  {id: 'to-vac', label: 'Vacation', icon: PlaneIcon, color: CAT.teal,
    annual: 18, used: 7.5, scheduled: 3,
    accrualNote: 'Accrues 1.5 days/mo · carryover max 5 days'},
  {id: 'to-sick', label: 'Sick', icon: StethoscopeIcon, color: CAT.orange,
    annual: 10, used: 2, scheduled: 0,
    accrualNote: 'Granted Jan 1 · no carryover'},
  {id: 'to-vol', label: 'Volunteer', icon: HeartHandshakeIcon, color: CAT.green,
    annual: 3, used: 1, scheduled: 0,
    accrualNote: 'Granted Jan 1 · company program'},
];

interface TimeOffEntry {
  id: string;
  range: string;
  days: number;
  type: string;
  status: 'approved' | 'taken';
  approver: string;
  decidedAt: string;
}

const UPCOMING_TIME_OFF: TimeOffEntry[] = [
  {id: 'up-jul', range: 'Jul 20 – Jul 22, 2026', days: 3, type: 'Vacation',
    status: 'approved', approver: 'Priya Raman', decidedAt: '2026-06-24T20:15:00Z'},
];

const RECENT_TIME_OFF: TimeOffEntry[] = [
  {id: 'led-jun', range: 'Jun 12, 2026 (half day)', days: 0.5, type: 'Vacation',
    status: 'taken', approver: 'Priya Raman', decidedAt: '2026-06-05T17:40:00Z'},
  {id: 'led-may', range: 'May 22, 2026', days: 1, type: 'Volunteer',
    status: 'taken', approver: 'Priya Raman', decidedAt: '2026-05-11T16:02:00Z'},
  {id: 'led-apr', range: 'Apr 27 – Apr 28, 2026', days: 2, type: 'Vacation',
    status: 'taken', approver: 'Priya Raman', decidedAt: '2026-04-14T15:20:00Z'},
  {id: 'led-mar', range: 'Mar 9 – Mar 13, 2026', days: 5, type: 'Vacation',
    status: 'taken', approver: 'Priya Raman', decidedAt: '2026-02-23T18:30:00Z'},
  {id: 'led-feb', range: 'Feb 10 – Feb 11, 2026', days: 2, type: 'Sick',
    status: 'taken', approver: 'Priya Raman', decidedAt: '2026-02-10T15:05:00Z'},
];

// ----- Sections ------------------------------------------------------------

type SectionId = 'job' | 'documents' | 'devices' | 'timeoff';

const SECTIONS: {id: SectionId; label: string; icon: typeof BriefcaseIcon}[] = [
  {id: 'job', label: 'Job & Comp', icon: BriefcaseIcon},
  {id: 'documents', label: 'Documents', icon: FileTextIcon},
  {id: 'devices', label: 'Devices & Apps', icon: LaptopIcon},
  {id: 'timeoff', label: 'Time off', icon: CalendarDaysIcon},
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function formatMoney(amount: number, isVisible: boolean): string {
  if (!isVisible) {
    return '$•••,•••';
  }
  return \`$\${amount.toLocaleString('en-US')}\`;
}

function formatDays(days: number): string {
  return days % 1 === 0 ? String(days) : days.toFixed(1);
}

function pct(part: number, whole: number): string {
  return \`\${((part / whole) * 100).toFixed(1)}%\`;
}

/** Fixed month-year label from an ISO date — no Date() locale drift. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthYear(isoDate: string): string {
  const [year, month] = isoDate.split('-');
  return \`\${MONTHS[Number(month) - 1]} \${year}\`;
}

function monthDayYear(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return \`\${MONTHS[Number(month) - 1]} \${Number(day)}, \${year}\`;
}

// ---------------------------------------------------------------------------
// SHARED PIECES
// ---------------------------------------------------------------------------

function SectionHeader({
  icon,
  title,
  meta,
  endContent,
}: {
  icon: typeof BriefcaseIcon;
  title: string;
  meta: string;
  endContent?: ReactNode;
}) {
  return (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Icon icon={icon} size="sm" color="secondary" />
      <Heading level={2}>{title}</Heading>
      <StackItem size="fill">
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {meta}
        </Text>
      </StackItem>
      {endContent ?? null}
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// JOB & COMP — level history timeline with promotion markers, then the
// current comp split and band-position meter. Every dollar figure routes
// through formatMoney so the banner's hide-amounts toggle masks all of them.
// ---------------------------------------------------------------------------

function LevelHistoryTimeline({showComp}: {showComp: boolean}) {
  return (
    <VStack gap={0}>
      {LEVEL_HISTORY.map((event, index) => {
        const isLast = index === LEVEL_HISTORY.length - 1;
        const isPromo = event.kind === 'promotion';
        return (
          <div key={event.id} style={styles.timelineRow}>
            <div style={styles.timelineDate}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {monthYear(event.date)}
              </Text>
            </div>
            <div style={styles.timelineSpine}>
              <span
                style={
                  isPromo
                    ? {...styles.timelineDot, ...styles.timelineDotPromo}
                    : styles.timelineDot
                }
              />
              {isLast ? null : <span style={styles.timelineLine} />}
            </div>
            <div
              style={
                isLast
                  ? {...styles.timelineBody, paddingBottom: 0}
                  : styles.timelineBody
              }>
              <VStack gap={1}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Text type="label">
                    {event.title} · {event.level}
                  </Text>
                  {isPromo ? (
                    <Badge
                      variant="purple"
                      label="Promotion"
                      icon={<Icon icon={TrendingUpIcon} size="xsm" color="inherit" />}
                    />
                  ) : null}
                  {event.kind === 'hire' ? (
                    <Badge variant="neutral" label="Hired" />
                  ) : null}
                </HStack>
                <Text
                  type="supporting"
                  color="secondary"
                  hasTabularNumbers
                  style={styles.moneyText}>
                  {event.baseBefore === null
                    ? \`Starting base \${formatMoney(event.baseAfter, showComp)}\`
                    : \`Base \${formatMoney(event.baseBefore, showComp)} → \${formatMoney(event.baseAfter, showComp)}\`}
                </Text>
                <Text type="supporting" color="secondary">
                  {event.note}
                </Text>
              </VStack>
            </div>
          </div>
        );
      })}
    </VStack>
  );
}

function CompSplit({showComp}: {showComp: boolean}) {
  const bandSpan = COMP.band.max - COMP.band.min;
  const markerPct = ((COMP.base - COMP.band.min) / bandSpan) * 100; // 52%
  return (
    <VStack gap={4}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <Heading level={3}>Current compensation</Heading>
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            Effective {monthDayYear(COMP.effectiveDate)} · {COMP.currency} ·{' '}
            {COMP.paySchedule}
          </Text>
        </StackItem>
        <Text type="label" hasTabularNumbers style={styles.moneyText}>
          {formatMoney(COMP.total, showComp)} total
        </Text>
      </HStack>
      {/* Split bar — segment widths are exact fixture proportions. */}
      <div
        style={styles.compBar}
        role="img"
        aria-label={\`Compensation split: base \${pct(COMP.base, COMP.total)}, bonus \${pct(COMP.bonusTarget, COMP.total)}, equity \${pct(COMP.equityAnnual, COMP.total)}\`}>
        {COMP_SEGMENTS.map(segment => (
          <span
            key={segment.id}
            style={{
              backgroundColor: segment.color,
              width: \`\${(segment.amount / COMP.total) * 100}%\`,
            }}
          />
        ))}
      </div>
      <VStack gap={2}>
        {COMP_SEGMENTS.map(segment => (
          <HStack key={segment.id} gap={2} vAlign="center" wrap="wrap">
            <span
              style={{...styles.compSwatch, backgroundColor: segment.color}}
            />
            <Text type="label">{segment.label}</Text>
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                {segment.note}
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {pct(segment.amount, COMP.total)}
            </Text>
            <Text type="label" hasTabularNumbers style={styles.moneyText}>
              {formatMoney(segment.amount, showComp)}
            </Text>
          </HStack>
        ))}
      </VStack>
      <Divider />
      {/* Band position — axis labeled with band min/mid/max. */}
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Text type="label">Band position</Text>
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              {COMP.band.label} · compa-ratio {COMP.compaRatio}
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Base at {Math.round(markerPct)}% of band
          </Text>
        </HStack>
        <div style={styles.bandTrack}>
          <span
            style={{...styles.bandMarker, left: \`\${markerPct}%\`}}
            role="img"
            aria-label={\`Base salary sits at \${Math.round(markerPct)}% of the \${COMP.band.label} band\`}
          />
        </div>
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatMoney(COMP.band.min, showComp)}
          </Text>
          <StackItem size="fill">
            <Text
              type="supporting"
              color="secondary"
              hasTabularNumbers
              style={{textAlign: 'center'}}>
              mid {formatMoney(COMP.band.midpoint, showComp)}
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatMoney(COMP.band.max, showComp)}
          </Text>
        </HStack>
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// DOCUMENTS — signed docs list. Status Tokens only; signing itself lives in
// esignature-envelope-flow. Fixed-width columns carry pixel() so the header
// gets both width and minWidth (Table cells have max-width: 0).
// ---------------------------------------------------------------------------

function DocNameCell({doc}: {doc: DocRow}) {
  return (
    <HStack gap={2} vAlign="center">
      <span style={{...styles.docGlyph, color: CAT.blue}}>
        <Icon icon={FileTextIcon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {doc.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {doc.category}
          </Text>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function DocStatusCell({doc}: {doc: DocRow}) {
  if (doc.status === 'sent') {
    return <Token size="sm" color="orange" label="Awaiting signature" />;
  }
  return <Token size="sm" color="green" label="Signed" />;
}

function DocSignedCell({doc}: {doc: DocRow}) {
  if (doc.status === 'sent') {
    return (
      <VStack gap={0}>
        <Text type="supporting" color="secondary">
          Sent <Timestamp value={doc.sentAt ?? ''} format="date" />
        </Text>
        <Text type="supporting" color="secondary" maxLines={1}>
          countersigner {doc.countersigner}
        </Text>
      </VStack>
    );
  }
  return (
    <VStack gap={0}>
      <Timestamp value={doc.signedAt ?? ''} format="date" />
      <Text type="supporting" color="secondary" maxLines={1}>
        countersigned · {doc.countersigner}
      </Text>
    </VStack>
  );
}

function buildDocColumns(isCompact: boolean): TableColumn<DocRow>[] {
  const columns: TableColumn<DocRow>[] = [
    {
      key: 'name',
      header: 'Document',
      width: proportional(2, {minWidth: 220}),
      renderCell: (doc: DocRow) => <DocNameCell doc={doc} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(150),
      renderCell: (doc: DocRow) => <DocStatusCell doc={doc} />,
    },
    {
      key: 'signed',
      header: 'Signed',
      width: pixel(190),
      renderCell: (doc: DocRow) => <DocSignedCell doc={doc} />,
    },
  ];
  if (!isCompact) {
    columns.push({
      key: 'size',
      header: 'Size',
      align: 'end',
      width: pixel(80),
      renderCell: (doc: DocRow) => (
        <Text type="body" color="secondary" hasTabularNumbers style={styles.numericCell}>
          {doc.sizeKb} KB
        </Text>
      ),
    });
  }
  columns.push({
    key: 'actions',
    header: '',
    align: 'end',
    width: pixel(56),
    renderCell: (doc: DocRow) => (
      <IconButton
        label={\`Download \${doc.name}\`}
        tooltip="Download PDF"
        variant="ghost"
        size="sm"
        isDisabled={doc.status === 'sent'}
        icon={<Icon icon={DownloadIcon} size="sm" />}
      />
    ),
  });
  return columns;
}

function DocumentsSection({isCompact}: {isCompact: boolean}) {
  const signedCount = DOCUMENTS.filter(doc => doc.status === 'signed').length;
  const pendingCount = DOCUMENTS.length - signedCount;
  return (
    <VStack gap={3}>
      <SectionHeader
        icon={FileTextIcon}
        title="Documents"
        meta={\`\${DOCUMENTS.length} on file · \${signedCount} signed · \${pendingCount} awaiting signature\`}
      />
      <div style={{...styles.sectionCard, padding: 0, overflowX: 'auto'}}>
        <Table<DocRow>
          data={DOCUMENTS}
          columns={buildDocColumns(isCompact)}
          idKey="id"
          density="balanced"
          dividers="rows"
          hasHover
        />
      </div>
      <Text type="supporting" color="secondary">
        The FY26 equity refresh notice was sent for signature on Jun 28 —
        signature status is tracked here; signing happens in the employee's
        e-signature inbox.
      </Text>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// DEVICES & APPS — assigned laptop Card with MDM posture, peripherals, and
// the provisioned-app grid with SSO badges. Asset tags match the device
// inventory surface (KL-MBP-0147 et al.).
// ---------------------------------------------------------------------------

function LaptopCard() {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Icon icon={LaptopIcon} size="md" color="secondary" />
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <Text type="label" maxLines={1}>
                {LAPTOP.model}
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {LAPTOP.assetTag} · SN {LAPTOP.serial} · assigned{' '}
                {monthDayYear(LAPTOP.assignedAt)}
              </Text>
            </VStack>
          </StackItem>
          <DropdownMenu
            button={{
              label: 'Device actions',
              variant: 'secondary',
              size: 'sm',
            }}
            menuWidth={220}
            items={[
              {label: 'View in device inventory', onClick: () => {}},
              {label: 'Trigger MDM sync', onClick: () => {}},
              {type: 'divider' as const},
              {label: 'Remote lock…', onClick: () => {}},
            ]}
          />
        </HStack>
        <div style={styles.postureChipRow}>
          <span style={styles.chip}>
            <Icon icon={ShieldCheckIcon} size="xsm" color="inherit" />
            MDM enrolled
          </span>
          <span style={styles.chip}>
            <Icon icon={LockIcon} size="xsm" color="inherit" />
            FileVault on
          </span>
          <span style={styles.chip}>
            <StatusDot variant="success" label="OS compliant" />
            {LAPTOP.os} · compliant
          </span>
          <span style={styles.chip}>
            Last check-in{' '}
            <Timestamp value={LAPTOP.lastCheckIn} format="relative" color="secondary" />
          </span>
          <span style={styles.chip}>
            Warranty until {monthDayYear(LAPTOP.warrantyUntil)}
          </span>
        </div>
        <Divider />
        <VStack gap={2}>
          {PERIPHERALS.map(item => (
            <HStack key={item.id} gap={2} vAlign="center">
              <Icon icon={item.icon} size="sm" color="secondary" />
              <StackItem size="fill" style={{minWidth: 0}}>
                <Text type="body" maxLines={1}>
                  {item.name}
                </Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {item.assetTag} · assigned {monthDayYear(item.assignedAt)}
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

function AppTile({app}: {app: AppGrant}) {
  return (
    <div style={styles.appTile}>
      <HStack gap={2} vAlign="center">
        <span style={{...styles.appGlyph, background: app.gradient}} aria-hidden>
          {app.monogram}
        </span>
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {app.name}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {app.role}
            </Text>
          </VStack>
        </StackItem>
      </HStack>
      <HStack gap={1} vAlign="center" wrap="wrap">
        {app.auth === 'sso' ? (
          <Token size="sm" color="blue" label="SAML SSO" />
        ) : (
          <Token
            size="sm"
            color="orange"
            label="Password + 2FA"
            icon={<Icon icon={KeyRoundIcon} size="xsm" color="inherit" />}
          />
        )}
        {app.hasScim ? <Token size="sm" color="default" label="SCIM" /> : null}
      </HStack>
      <Text type="supporting" color="secondary" maxLines={1}>
        via {app.grantSource} · since {monthYear(app.grantedAt)}
      </Text>
    </div>
  );
}

function DevicesSection() {
  return (
    <VStack gap={3}>
      <SectionHeader
        icon={LaptopIcon}
        title="Devices & Apps"
        meta={\`\${1 + PERIPHERALS.length} assets · \${APPS.length} apps · \${SSO_COUNT} via SSO\`}
      />
      <LaptopCard />
      <HStack gap={2} vAlign="center">
        <Icon icon={AppWindowIcon} size="sm" color="secondary" />
        <Heading level={3}>Provisioned apps</Heading>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {SSO_COUNT} of {APPS.length} federated · 1 direct password grant
        </Text>
      </HStack>
      <div style={styles.appGrid}>
        {APPS.map(app => (
          <AppTile key={app.id} app={app} />
        ))}
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// TIME OFF — admin-side balance meters + upcoming/recent ledger. Vacation
// figures reconcile with the ledger rows (5 + 2 + 0.5 taken, 3 scheduled).
// ---------------------------------------------------------------------------

function BalanceMeter({balance}: {balance: TimeOffBalance}) {
  const remaining = balance.annual - balance.used - balance.scheduled;
  return (
    <div style={styles.balanceRow}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <span style={{color: balance.color, display: 'inline-flex'}}>
          <Icon icon={balance.icon} size="sm" color="inherit" />
        </span>
        <Text type="label">{balance.label}</Text>
        <StackItem size="fill" />
        <Text type="label" hasTabularNumbers>
          {formatDays(remaining)} days left
        </Text>
      </HStack>
      <div
        style={styles.balanceTrack}
        role="img"
        aria-label={\`\${balance.label}: \${formatDays(balance.used)} used and \${formatDays(balance.scheduled)} scheduled of \${formatDays(balance.annual)} annual days\`}>
        <span
          style={{
            backgroundColor: balance.color,
            width: \`\${(balance.used / balance.annual) * 100}%\`,
          }}
        />
        {balance.scheduled > 0 ? (
          <span
            style={{
              backgroundColor: balance.color,
              opacity: 0.4,
              width: \`\${(balance.scheduled / balance.annual) * 100}%\`,
            }}
          />
        ) : null}
      </div>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {formatDays(balance.used)} used
          {balance.scheduled > 0
            ? \` · \${formatDays(balance.scheduled)} scheduled\`
            : ''}{' '}
          · {formatDays(balance.annual)} annual
        </Text>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary">
          {balance.accrualNote}
        </Text>
      </HStack>
    </div>
  );
}

function TimeOffSection() {
  return (
    <VStack gap={3}>
      <SectionHeader
        icon={CalendarDaysIcon}
        title="Time off"
        meta="3 policies · 1 upcoming request · balances as of Jul 3, 2026"
      />
      <VStack gap={2}>
        {BALANCES.map(balance => (
          <BalanceMeter key={balance.id} balance={balance} />
        ))}
      </VStack>
      <HStack gap={4} wrap="wrap" vAlign="stretch">
        <StackItem size="fill" style={{minWidth: 260}}>
          <VStack gap={2}>
            <Heading level={3}>Upcoming</Heading>
            <List density="compact" hasDividers>
              {UPCOMING_TIME_OFF.map(entry => (
                <ListItem
                  key={entry.id}
                  label={\`\${entry.range} · \${entry.type}\`}
                  description={
                    <Text type="supporting" color="secondary">
                      {formatDays(entry.days)} days · approved by{' '}
                      {entry.approver} ·{' '}
                      <Timestamp value={entry.decidedAt} format="date" />
                    </Text>
                  }
                  startContent={<Icon icon={PlaneIcon} size="sm" color="secondary" />}
                  endContent={<Token size="sm" color="green" label="Approved" />}
                />
              ))}
            </List>
          </VStack>
        </StackItem>
        <StackItem size="fill" style={{minWidth: 260}}>
          <VStack gap={2}>
            <Heading level={3}>Taken this year</Heading>
            <List density="compact" hasDividers>
              {RECENT_TIME_OFF.map(entry => (
                <ListItem
                  key={entry.id}
                  label={\`\${entry.range} · \${entry.type}\`}
                  description={
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {formatDays(entry.days)}{' '}
                      {entry.days === 1 ? 'day' : 'days'}
                    </Text>
                  }
                  startContent={
                    <Icon
                      icon={
                        entry.type === 'Sick'
                          ? StethoscopeIcon
                          : entry.type === 'Volunteer'
                            ? HeartHandshakeIcon
                            : PlaneIcon
                      }
                      size="sm"
                      color="secondary"
                    />
                  }
                />
              ))}
            </List>
          </VStack>
        </StackItem>
      </HStack>
      <Text type="supporting" color="secondary">
        Balances are the admin-side readout for this record — requests and
        approvals run through the time-off planner.
      </Text>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// END RAIL — at-a-glance metadata + direct reports, pinned beside the record.
// ---------------------------------------------------------------------------

function AtAGlanceRail() {
  return (
    <div style={styles.railScroll}>
      <VStack gap={4}>
        <Heading level={3}>At a glance</Heading>
        <MetadataList columns={1} label={{position: 'start', width: 104}}>
          <MetadataListItem label="Employee ID">
            <Text type="body" hasTabularNumbers>
              {EMPLOYEE.employeeId}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Status">
            <HStack gap={1} vAlign="center">
              <StatusDot variant="success" label="Active" />
              <Text type="body">{EMPLOYEE.status}</Text>
            </HStack>
          </MetadataListItem>
          <MetadataListItem label="Type">
            <Text type="body">{EMPLOYEE.employmentType}</Text>
          </MetadataListItem>
          <MetadataListItem label="Department">
            <Text type="body" hasTabularNumbers>
              {EMPLOYEE.department} · {EMPLOYEE.departmentHeadcount} people
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Office">
            <Text type="body">{EMPLOYEE.office}</Text>
          </MetadataListItem>
          <MetadataListItem label="Start date">
            <Text type="body" hasTabularNumbers>
              {monthDayYear(EMPLOYEE.startDate)}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Tenure">
            <Text type="body" hasTabularNumbers>
              {EMPLOYEE.tenure}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Work email">
            {/* Long address: wrap (anywhere) instead of clipping at the rail
                edge — maxLines here overflowed the 300px panel. */}
            <Text type="body" style={{overflowWrap: 'anywhere'}}>
              {EMPLOYEE.email}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Phone">
            <Text type="body" hasTabularNumbers>
              {EMPLOYEE.phone}
            </Text>
          </MetadataListItem>
        </MetadataList>
        <Divider />
        <HStack gap={2} vAlign="center">
          <Icon icon={UsersIcon} size="sm" color="secondary" />
          <Heading level={3}>Direct reports</Heading>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {DIRECT_REPORTS.length} · 1 onboarding
          </Text>
        </HStack>
        <List density="compact">
          {DIRECT_REPORTS.map(report => (
            <ListItem
              key={report.name}
              label={report.name}
              description={report.role}
              startContent={<Avatar name={report.name} size="small" />}
              endContent={
                report.onboardingLabel ? (
                  <Token size="sm" color="orange" label={report.onboardingLabel} />
                ) : null
              }
            />
          ))}
        </List>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// IDENTITY BAND — avatar, name, level/type tokens, fact chips, and the
// manager-chain chip rail (subject → manager → CEO).
// ---------------------------------------------------------------------------

function ManagerChain() {
  return (
    <HStack gap={1} vAlign="center" wrap="wrap" aria-label="Manager chain">
      {MANAGER_CHAIN.map((person, index) => (
        <HStack key={person.name} gap={1} vAlign="center">
          {index > 0 ? (
            <Icon icon={ChevronRightIcon} size="xsm" color="secondary" />
          ) : null}
          <span
            style={
              person.isSelf
                ? {...styles.chainChip, ...styles.chainSelf}
                : styles.chainChip
            }>
            <Avatar name={person.name} size="xsmall" />
            <Text type="supporting" maxLines={1}>
              {person.name}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {person.role}
            </Text>
          </span>
        </HStack>
      ))}
    </HStack>
  );
}

function IdentityBand({isCompact}: {isCompact: boolean}) {
  return (
    <HStack
      gap={4}
      vAlign="start"
      wrap={isCompact ? 'wrap' : 'nowrap'}>
      <Avatar name={EMPLOYEE.name} size="large" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Heading level={1}>{EMPLOYEE.name}</Heading>
            <StatusDot variant="success" label="Active employee" tooltip="Active" />
            <Token size="sm" color="default" label={EMPLOYEE.level} />
            <Token size="sm" color="default" label={EMPLOYEE.employmentType} />
          </HStack>
          <Text type="body" color="secondary">
            {EMPLOYEE.title} · {EMPLOYEE.team} team
          </Text>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <span style={styles.chip}>
              <Icon icon={Building2Icon} size="xsm" color="inherit" />
              {EMPLOYEE.department} · {EMPLOYEE.departmentHeadcount}
            </span>
            <span style={styles.chip}>
              <Icon icon={MapPinIcon} size="xsm" color="inherit" />
              {EMPLOYEE.office}
            </span>
            <span style={styles.chip}>
              <Icon icon={CalendarDaysIcon} size="xsm" color="inherit" />
              Since {monthDayYear(EMPLOYEE.startDate)}
            </span>
            <span style={styles.chip}>
              <Icon icon={UsersIcon} size="xsm" color="inherit" />
              {DIRECT_REPORTS.length} reports
            </span>
          </HStack>
          <ManagerChain />
        </VStack>
      </StackItem>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function HrEmployeeProfileTemplate() {
  // Comp amounts render for HR admins; the banner toggle masks every dollar
  // figure (split, band, timeline) without collapsing the section.
  const [showComp, setShowComp] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>('job');

  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    job: null,
    documents: null,
    devices: null,
    timeoff: null,
  });
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  // Scroll-spy suppression window: a tab click smooth-scrolls past the
  // intermediate sections — without this the underline flickers through them.
  const spySuppressedUntil = useRef(0);

  // Responsive contract: <=1100px drops the end rail; <=760px compacts the
  // identity band and drops the documents Size column.
  const isRailHidden = useMediaQuery('(max-width: 1100px)');
  const isCompact = useMediaQuery('(max-width: 760px)');

  const jumpToSection = (value: string) => {
    const section = value as SectionId;
    spySuppressedUntil.current = Date.now() + 1000;
    setActiveSection(section);
    sectionRefs.current[section]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // Keep the sticky tabs honest on manual scroll: the active section is the
  // last one whose top has passed under the sticky tab bar.
  const handleContentScroll = () => {
    if (Date.now() < spySuppressedUntil.current) {
      return;
    }
    const scroller = contentScrollRef.current;
    if (!scroller) {
      return;
    }
    const scrollerTop = scroller.getBoundingClientRect().top;
    let next: SectionId = 'job';
    for (const {id} of SECTIONS) {
      const node = sectionRefs.current[id];
      if (node && node.getBoundingClientRect().top - scrollerTop <= 88) {
        next = id;
      }
    }
    setActiveSection(prev => (prev === next ? prev : next));
  };

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <Breadcrumbs variant="supporting" label="People navigation">
            <BreadcrumbItem onClick={() => {}}>People</BreadcrumbItem>
            <BreadcrumbItem onClick={() => {}}>Employees</BreadcrumbItem>
            <BreadcrumbItem isCurrent>{EMPLOYEE.name}</BreadcrumbItem>
          </Breadcrumbs>
        </StackItem>
        <Text type="supporting" color="secondary">
          Viewing as {VIEWER.name} · {VIEWER.role}
        </Text>
        <Button
          label="Edit profile"
          variant="secondary"
          size="sm"
          icon={<Icon icon={PencilIcon} size="sm" />}
        />
        <DropdownMenu
          button={{label: 'More actions', variant: 'secondary', size: 'sm'}}
          menuWidth={240}
          items={[
            {label: 'Start comp change…', onClick: () => {}},
            {label: 'Transfer to new manager…', onClick: () => {}},
            {label: 'Export record (PDF)', onClick: () => {}},
            {type: 'divider' as const},
            {label: 'Start offboarding…', onClick: () => {}},
          ]}
        />
      </HStack>
    </LayoutHeader>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div
                ref={contentScrollRef}
                style={styles.contentScroll}
                onScroll={handleContentScroll}>
                <div style={styles.contentColumn}>
                  <IdentityBand isCompact={isCompact} />

                  {/* HR visibility notice — comp data is admin-only. */}
                  <Banner
                    status="info"
                    icon={<Icon icon={LockIcon} size="sm" color="inherit" />}
                    title="Compensation data is restricted"
                    description={\`Base, bonus, and equity figures on this record are visible only to HR admins and \${EMPLOYEE.name}'s management chain. Access is logged.\`}
                    endContent={
                      <Button
                        label={showComp ? 'Hide amounts' : 'Show amounts'}
                        variant="ghost"
                        size="sm"
                        icon={
                          <Icon
                            icon={showComp ? EyeOffIcon : EyeIcon}
                            size="sm"
                          />
                        }
                        onClick={() => setShowComp(prev => !prev)}
                      />
                    }
                  />

                  {/* Sticky section tabs — sections stay expanded below;
                      tabs jump-scroll the column. */}
                  <div style={styles.tabSticky}>
                    <TabList
                      value={activeSection}
                      onChange={jumpToSection}
                      size="sm"
                      hasDivider>
                      {SECTIONS.map(section => (
                        <Tab
                          key={section.id}
                          value={section.id}
                          label={section.label}
                          icon={
                            <Icon icon={section.icon} size="sm" color="inherit" />
                          }
                        />
                      ))}
                    </TabList>
                  </div>

                  <section
                    ref={node => {
                      sectionRefs.current.job = node;
                    }}
                    style={styles.section}
                    aria-label="Job and compensation">
                    <SectionHeader
                      icon={BriefcaseIcon}
                      title="Job & Comp"
                      meta="6 level events · 2 promotions"
                      endContent={
                        <Token
                          size="sm"
                          color="default"
                          label={showComp ? 'Amounts visible' : 'Amounts hidden'}
                        />
                      }
                    />
                    <div style={styles.sectionCard}>
                      <CompSplit showComp={showComp} />
                    </div>
                    <Heading level={3}>Level history</Heading>
                    <div style={styles.sectionCard}>
                      <LevelHistoryTimeline showComp={showComp} />
                    </div>
                  </section>

                  <Divider />

                  <section
                    ref={node => {
                      sectionRefs.current.documents = node;
                    }}
                    style={styles.section}
                    aria-label="Documents">
                    <DocumentsSection isCompact={isCompact} />
                  </section>

                  <Divider />

                  <section
                    ref={node => {
                      sectionRefs.current.devices = node;
                    }}
                    style={styles.section}
                    aria-label="Devices and apps">
                    <DevicesSection />
                  </section>

                  <Divider />

                  <section
                    ref={node => {
                      sectionRefs.current.timeoff = node;
                    }}
                    style={styles.section}
                    aria-label="Time off">
                    <TimeOffSection />
                  </section>
                </div>
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isRailHidden ? undefined : (
            <LayoutPanel
              width={300}
              padding={0}
              hasDivider
              label="Employee at a glance">
              <AtAGlanceRail />
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};