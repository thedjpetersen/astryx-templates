// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs onboarding world as
 *   of Fri, Jul 3 2026: two in-flight hires (Ava Lindqvist, day 3; Ken
 *   Tanaka, starts Monday Jul 6), their cross-team task lists, e-sign
 *   document states, equipment shipments with fixed tracking steps, and
 *   day-1 agendas. Fixed ISO dates, no clocks, no randomness.
 * @output New-Hire Onboarding Flow — the People-team command center for one
 *   hire at a time. A 280px hire rail (per-hire progress, at-risk dot,
 *   pinned open-task summary); a content column with an at-risk banner for
 *   the overdue IT task, a five-phase chip timeline (Offer signed /
 *   Accounts / Equipment / Day 1 / Week 1) whose counts derive from the
 *   checklist, a horizontal day-1 agenda strip, and a cross-team checklist
 *   grouped by owner team (People, IT, Manager, Payroll) with live
 *   check-off; a 340px side panel with e-sign document rows (offer / W-4 /
 *   handbook) and the equipment shipment card with tracking steps.
 * @position Page template; emitted by `astryx template hr-onboarding-flow`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | rail 280 (hire cards + pinned summary strip)
 *   | content (banner, phase strip, agenda strip, grouped checklist —
 *   scrolls) | end panel 340 (documents + shipment, scrolls).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. The shipment card, agenda slots, phase chips, and hire cards
 *   are styled divs inside frame panels.
 * Color policy: token-pure everywhere; the only literals are the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens
 *   (owner-team dots, phase tints) — the demo does not inject
 *   `--color-data-categorical-*` — plus `light-dark()` tint pairs on
 *   phase-chip fills.
 *
 * Responsive contract:
 * - > 1180px: full three-region frame.
 * - <= 1180px: the docs/equipment panel is dropped; the same sections
 *   render inline below the checklist as a two-up wrap row.
 * - <= 860px: the hire rail is dropped; a hire Selector appears in the
 *   content header. Header rows wrap instead of clipping.
 * - The phase strip and the day-1 agenda strip scroll horizontally by
 *   design at every width; rail, content, and side panel each scroll
 *   independently (`minHeight: 0` down every flex chain).
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  AlertTriangleIcon,
  BellIcon,
  BriefcaseIcon,
  CalendarCheckIcon,
  CheckIcon,
  ClockIcon,
  FileSignatureIcon,
  FileTextIcon,
  LandmarkIcon,
  LaptopIcon,
  MapPinIcon,
  PackageIcon,
  PanelRightIcon,
  SendIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UsersIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
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
  panelFill: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  railScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  railPinned: {flexShrink: 0, padding: 'var(--spacing-3)'},
  hireCard: {
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
  hireCardActive: {
    // Inset outline so the active card never bleeds onto neighbors.
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
    borderColor: 'transparent',
  },
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4) var(--spacing-5) var(--spacing-6)',
  },
  sideScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // Phase strip --------------------------------------------------------
  // Mask fades live on this NON-scrolling wrapper, never the scroller —
  // on the scroller the mask stretches over the full scrollWidth and
  // scrolls with the content instead of pinning to the clip edge. The
  // fade dissolves whichever chip the scroll edge slices.
  hStripWrap: {
    minWidth: 0,
    maskImage:
      'linear-gradient(to right, black calc(100% - var(--spacing-5)), transparent 100%)',
    WebkitMaskImage:
      'linear-gradient(to right, black calc(100% - var(--spacing-5)), transparent 100%)',
  },
  phaseStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    overflowX: 'auto',
    paddingBlock: 'var(--spacing-1)',
  },
  phaseChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-3)',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  phaseChipDone: {
    backgroundColor: 'light-dark(rgba(11,153,31,0.10), rgba(52,199,89,0.16))',
    borderColor: 'light-dark(rgba(11,153,31,0.35), rgba(52,199,89,0.45))',
  },
  phaseChipActive: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'transparent',
  },
  phaseChipAttention: {
    backgroundColor: 'light-dark(rgba(220,38,38,0.08), rgba(248,113,113,0.16))',
    borderColor: 'light-dark(rgba(220,38,38,0.40), rgba(248,113,113,0.50))',
  },
  phaseGlyph: {display: 'inline-flex', flexShrink: 0},
  phaseConnector: {
    width: 16,
    height: 2,
    flexShrink: 0,
    backgroundColor: 'var(--color-border)',
    borderRadius: 1,
  },
  // Agenda strip --------------------------------------------------------
  agendaStrip: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBlock: 'var(--spacing-1)',
  },
  agendaSlot: {
    flexShrink: 0,
    width: 190,
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  agendaTime: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Checklist -----------------------------------------------------------
  teamGroup: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  teamDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  taskRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  taskDone: {textDecoration: 'line-through', opacity: 0.6},
  // Footgun: without flexShrink 0 the label column squeezes this cluster
  // until the status Token truncates to "D…" and dates wrap mid-phrase.
  taskMeta: {flexShrink: 0, whiteSpace: 'nowrap'},
  // Docs & equipment ------------------------------------------------------
  docRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-2) 0',
  },
  shipCard: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-3)',
  },
  mono: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Tracking numbers are longer than the 340px panel minus the metadata
  // label column — let them wrap at the group spaces instead of clipping.
  monoWrap: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
  },
  shipStepRail: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  shipStep: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
  },
  shipStepSpine: {
    display: 'flex',
    flexDirection: 'column',
    // No fixed width: the column sizes to the StatusDot's rendered box so
    // the 2px connector line centers under the dot instead of left of it.
    alignItems: 'center',
    alignSelf: 'stretch',
    flexShrink: 0,
    paddingTop: 5,
  },
  shipStepLine: {
    width: 2,
    flex: 1,
    minHeight: 12,
    backgroundColor: 'var(--color-border)',
    borderRadius: 1,
  },
  inlineTwoUp: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-4)',
    alignItems: 'flex-start',
  },
  inlineCol: {flex: '1 1 320px', minWidth: 0},
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
const TEAM_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs (140-person platform
// company; Engineering 52, Design 18, GTM 34, Ops 16, Finance 8, People 12).
// Signed-in user: Dana Whitfield (People Ops). "Today" is fixed at
// Fri, Jul 3 2026. Two hires are in flight everywhere this suite counts
// pending onboarding: Ava Lindqvist (day 3) and Ken Tanaka (starts Monday).
// Task math reconciles across every panel: Ava 8 of 13 done (1 overdue),
// Ken 4 of 12 done — 13 open tasks total in the rail summary strip.
// ---------------------------------------------------------------------------

const AS_OF_LABEL = 'Fri, Jul 3, 2026';

type TeamId = 'people' | 'it' | 'manager' | 'payroll';
type PhaseId = 'offer' | 'accounts' | 'equipment' | 'day1' | 'week1';
type TaskStatus = 'done' | 'inProgress' | 'overdue' | 'todo';
type DocStatus = 'signed' | 'pending';

interface TeamMeta {
  id: TeamId;
  label: string;
  icon: typeof UsersIcon;
  color: string;
}

const TEAM_ORDER: TeamId[] = ['people', 'it', 'manager', 'payroll'];

const TEAMS: Record<TeamId, TeamMeta> = {
  people: {id: 'people', label: 'People', icon: UsersIcon, color: TEAM_COLOR.purple},
  it: {id: 'it', label: 'IT', icon: ShieldCheckIcon, color: TEAM_COLOR.blue},
  manager: {id: 'manager', label: 'Manager', icon: BriefcaseIcon, color: TEAM_COLOR.orange},
  payroll: {id: 'payroll', label: 'Payroll', icon: LandmarkIcon, color: TEAM_COLOR.green},
};

interface Task {
  id: string;
  team: TeamId;
  phase: PhaseId;
  label: string;
  /** Secondary line: blocked-by notes, cross-panel references. */
  detail?: string;
  status: TaskStatus;
  /** ISO date the task is due (todo/inProgress/overdue rows). */
  dueOn?: string;
  /** ISO date the task was completed (done rows). */
  doneOn?: string;
}

interface DocRow {
  id: string;
  name: string;
  status: DocStatus;
  sentOn: string;
  signedOn?: string;
  /** Cross-panel note shown under pending docs. */
  blocks?: string;
}

interface ShipStep {
  label: string;
  /** ISO timestamp for completed steps; ETA text for pending ones. */
  at?: string;
  eta?: string;
  state: 'done' | 'active' | 'pending';
}

interface Equipment {
  asset: string;
  assetTag: string;
  serial: string;
  carrier: string;
  tracking: string;
  status: 'delivered' | 'inTransit';
  statusNote: string;
  kitNote: string;
  steps: ShipStep[];
}

interface AgendaSlot {
  time: string;
  title: string;
  host: string;
  place: string;
  isRemote: boolean;
}

interface PhaseFixture {
  id: PhaseId;
  label: string;
  /** Baseline state before checklist-derived overrides. */
  baseState: 'done' | 'active' | 'upcoming';
  /** Milestone note for phases without checklist tasks driving them. */
  note: string;
}

interface Hire {
  id: string;
  name: string;
  role: string;
  department: string;
  office: string;
  manager: string;
  buddy: string;
  startsOn: string;
  /** Rail + header line: where the hire is in the flow, in words. */
  stageLine: string;
  agendaTitle: string;
  agendaNote: string;
  phases: PhaseFixture[];
  tasks: Task[];
  docs: DocRow[];
  equipment: Equipment;
  agenda: AgendaSlot[];
}

// ---------------------------------------------------------------------------
// FIXTURES — Ava Lindqvist (Engineering, day 3) and Ken Tanaka (GTM,
// starts Monday Jul 6). Owners are the canonical Kestrel people: Dana
// Whitfield (People Ops), Tom Okonkwo (IT admin), the hire's manager, and
// Elena Voss (Finance lead) for payroll. Ava's laptop KL-MBP-1042 and
// Ken's KL-MBP-1057 are the same asset rows the device-inventory surface
// tracks; Ava's Okta grant is the overdue task the at-risk banner flags.
// ---------------------------------------------------------------------------

const TASK_OWNER: Record<TeamId, (hire: Hire) => string> = {
  people: () => 'Dana Whitfield',
  it: () => 'Tom Okonkwo',
  manager: hire => hire.manager,
  payroll: () => 'Elena Voss',
};

const AVA: Hire = {
  id: 'ava',
  name: 'Ava Lindqvist',
  role: 'Product Engineer',
  department: 'Engineering',
  office: 'SF HQ',
  manager: 'Marcus Webb',
  buddy: 'Leah Kim',
  startsOn: '2026-07-01',
  stageLine: 'Day 3 of week 1',
  agendaTitle: 'Day 1 agenda — Wed, Jul 1',
  agendaNote: 'Completed · all six sessions held as scheduled',
  phases: [
    {id: 'offer', label: 'Offer signed', baseState: 'done', note: 'Jun 24'},
    {id: 'accounts', label: 'Accounts', baseState: 'active', note: 'Due Jul 2'},
    {id: 'equipment', label: 'Equipment', baseState: 'active', note: 'Delivered Jun 30'},
    {id: 'day1', label: 'Day 1', baseState: 'done', note: 'Wed, Jul 1'},
    {id: 'week1', label: 'Week 1', baseState: 'active', note: 'In progress'},
  ],
  tasks: [
    // People — Dana Whitfield
    {id: 'a-p1', team: 'people', phase: 'offer', label: 'Send welcome pack + start-date confirmation', status: 'done', doneOn: '2026-06-26'},
    {id: 'a-p2', team: 'people', phase: 'accounts', label: 'Collect I-9 documents', detail: 'Verified in person at SF HQ front desk', status: 'done', doneOn: '2026-06-30'},
    {id: 'a-p3', team: 'people', phase: 'week1', label: 'Schedule benefits orientation', status: 'done', doneOn: '2026-07-01'},
    {id: 'a-p4', team: 'people', phase: 'week1', label: 'Book 30-60-90 check-ins with manager', status: 'inProgress', dueOn: '2026-07-06'},
    // IT — Tom Okonkwo
    {id: 'a-i1', team: 'it', phase: 'accounts', label: 'Create Google Workspace account', detail: 'ava.lindqvist@kestrellabs.com', status: 'done', doneOn: '2026-06-30'},
    {id: 'a-i2', team: 'it', phase: 'accounts', label: 'Provision Okta SSO + app grants', detail: 'GitHub, Figma, Slack — blocks repo access for the starter ticket', status: 'overdue', dueOn: '2026-07-02'},
    {id: 'a-i3', team: 'it', phase: 'equipment', label: 'Ship laptop KL-MBP-1042', detail: 'Delivered to SF HQ, Jun 30', status: 'done', doneOn: '2026-06-30'},
    {id: 'a-i4', team: 'it', phase: 'equipment', label: 'Enroll device in MDM', detail: 'Waiting on the Okta SSO grant above', status: 'todo', dueOn: '2026-07-03'},
    // Manager — Marcus Webb
    {id: 'a-m1', team: 'manager', phase: 'day1', label: 'Prepare 30-day plan', status: 'done', doneOn: '2026-07-01'},
    {id: 'a-m2', team: 'manager', phase: 'day1', label: 'Assign onboarding buddy', detail: 'Leah Kim (Platform)', status: 'done', doneOn: '2026-06-30'},
    {id: 'a-m3', team: 'manager', phase: 'week1', label: 'Scope first-week starter ticket', detail: 'Blocked until GitHub access lands', status: 'inProgress', dueOn: '2026-07-06'},
    // Payroll — Elena Voss
    {id: 'a-y1', team: 'payroll', phase: 'accounts', label: 'Add to Jul 15 payroll run', status: 'done', doneOn: '2026-07-01'},
    {id: 'a-y2', team: 'payroll', phase: 'week1', label: 'Verify W-4 + direct deposit', detail: 'Waiting on the W-4 signature (see Documents)', status: 'todo', dueOn: '2026-07-08'},
  ],
  docs: [
    {id: 'a-d1', name: 'Offer letter', status: 'signed', sentOn: '2026-06-22', signedOn: '2026-06-24'},
    {id: 'a-d2', name: 'Form W-4', status: 'pending', sentOn: '2026-07-01', blocks: 'Blocks Payroll · Verify W-4 + direct deposit'},
    {id: 'a-d3', name: 'Employee handbook', status: 'signed', sentOn: '2026-06-30', signedOn: '2026-07-01'},
  ],
  equipment: {
    asset: 'MacBook Pro 14" (M4 Pro, 36 GB)',
    assetTag: 'KL-MBP-1042',
    serial: 'FVFHK204Q6L7',
    carrier: 'UPS',
    tracking: '1Z 999 AA1 01 2345 6784',
    status: 'delivered',
    statusNote: 'Signed for at SF HQ front desk',
    kitNote: 'Desk kit (monitor, keyboard, badge) handed over on day 1',
    steps: [
      {label: 'Ordered', at: '2026-06-25T10:12:00Z', state: 'done'},
      {label: 'Imaged + configured', at: '2026-06-26T16:40:00Z', state: 'done'},
      {label: 'Shipped', at: '2026-06-27T18:05:00Z', state: 'done'},
      {label: 'Delivered', at: '2026-06-30T16:41:00Z', state: 'done'},
    ],
  },
  agenda: [
    {time: '09:00', title: 'Badge + desk setup', host: 'Dana Whitfield', place: 'SF HQ · Front desk', isRemote: false},
    {time: '09:30', title: 'Laptop + access setup', host: 'Tom Okonkwo', place: 'SF HQ · IT bar', isRemote: false},
    {time: '10:30', title: 'Manager 1:1', host: 'Marcus Webb', place: 'Fern room', isRemote: false},
    {time: '12:00', title: 'Team lunch — Platform', host: 'Leah Kim', place: 'Kitchen', isRemote: false},
    {time: '14:00', title: 'Benefits orientation', host: 'Dana Whitfield', place: 'Video call', isRemote: true},
    {time: '15:30', title: 'Codebase tour', host: 'Leah Kim', place: 'Fern room', isRemote: false},
  ],
};

const KEN: Hire = {
  id: 'ken',
  name: 'Ken Tanaka',
  role: 'Account Executive',
  department: 'GTM',
  office: 'Remote-US',
  manager: 'Jonah Fields',
  buddy: 'Maya Castillo',
  startsOn: '2026-07-06',
  stageLine: 'Starts Monday, Jul 6',
  agendaTitle: 'Day 1 agenda — Mon, Jul 6',
  agendaNote: 'Remote start · invites sent, all hosts confirmed',
  phases: [
    {id: 'offer', label: 'Offer signed', baseState: 'done', note: 'Jun 26'},
    {id: 'accounts', label: 'Accounts', baseState: 'active', note: 'Due Jul 3'},
    {id: 'equipment', label: 'Equipment', baseState: 'active', note: 'Arrives Jul 3'},
    {id: 'day1', label: 'Day 1', baseState: 'upcoming', note: 'Mon, Jul 6'},
    {id: 'week1', label: 'Week 1', baseState: 'upcoming', note: 'Jul 6 – 10'},
  ],
  tasks: [
    // People — Dana Whitfield
    {id: 'k-p1', team: 'people', phase: 'offer', label: 'Send welcome pack + start-date confirmation', status: 'done', doneOn: '2026-06-25'},
    {id: 'k-p2', team: 'people', phase: 'accounts', label: 'Collect I-9 documents', detail: 'Remote verification call booked for day 1', status: 'inProgress', dueOn: '2026-07-06'},
    {id: 'k-p3', team: 'people', phase: 'week1', label: 'Schedule benefits orientation', status: 'todo', dueOn: '2026-07-07'},
    {id: 'k-p4', team: 'people', phase: 'day1', label: 'Publish day-1 agenda + send invites', status: 'done', doneOn: '2026-07-01'},
    // IT — Tom Okonkwo
    {id: 'k-i1', team: 'it', phase: 'accounts', label: 'Create Google Workspace account', detail: 'ken.tanaka@kestrellabs.com', status: 'inProgress', dueOn: '2026-07-03'},
    {id: 'k-i2', team: 'it', phase: 'accounts', label: 'Provision Okta SSO + CRM seat', detail: 'Salesforce, Slack, Notion', status: 'todo', dueOn: '2026-07-03'},
    {id: 'k-i3', team: 'it', phase: 'equipment', label: 'Ship laptop KL-MBP-1057', detail: 'FedEx to home address — arrives before day 1', status: 'done', doneOn: '2026-07-01'},
    {id: 'k-i4', team: 'it', phase: 'equipment', label: 'Enroll device in MDM', detail: 'Remote enrollment during the day-1 IT call', status: 'todo', dueOn: '2026-07-06'},
    // Manager — Jonah Fields
    {id: 'k-m1', team: 'manager', phase: 'day1', label: 'Prepare territory + account plan', status: 'inProgress', dueOn: '2026-07-06'},
    {id: 'k-m2', team: 'manager', phase: 'day1', label: 'Assign onboarding buddy', detail: 'Maya Castillo (GTM)', status: 'done', doneOn: '2026-07-01'},
    {id: 'k-m3', team: 'manager', phase: 'week1', label: 'Book pipeline shadowing sessions', status: 'todo', dueOn: '2026-07-08'},
    // Payroll — Elena Voss
    {id: 'k-y1', team: 'payroll', phase: 'accounts', label: 'Add to Jul 31 payroll run', detail: 'Needs the signed W-4 first', status: 'todo', dueOn: '2026-07-08'},
  ],
  docs: [
    {id: 'k-d1', name: 'Offer letter', status: 'signed', sentOn: '2026-06-24', signedOn: '2026-06-26'},
    {id: 'k-d2', name: 'Form W-4', status: 'pending', sentOn: '2026-07-01', blocks: 'Blocks Payroll · Add to Jul 31 payroll run'},
    {id: 'k-d3', name: 'Employee handbook', status: 'pending', sentOn: '2026-07-01'},
  ],
  equipment: {
    asset: 'MacBook Pro 14" (M4 Pro, 36 GB)',
    assetTag: 'KL-MBP-1057',
    serial: 'FVFHK311T8M2',
    carrier: 'FedEx',
    tracking: '7489 0155 2201',
    status: 'inTransit',
    statusNote: 'In transit — arrives before day 1',
    kitNote: 'Home-office kit (monitor, headset) ships separately Jul 6',
    steps: [
      {label: 'Ordered', at: '2026-06-27T09:20:00Z', state: 'done'},
      {label: 'Imaged + configured', at: '2026-06-30T15:10:00Z', state: 'done'},
      {label: 'Shipped', at: '2026-07-01T17:32:00Z', state: 'active'},
      {label: 'Delivery', eta: 'Estimated Fri, Jul 3', state: 'pending'},
    ],
  },
  agenda: [
    {time: '09:00', title: 'Welcome call', host: 'Dana Whitfield', place: 'Video call', isRemote: true},
    {time: '09:45', title: 'IT setup + MDM enrollment', host: 'Tom Okonkwo', place: 'Video call', isRemote: true},
    {time: '10:30', title: 'Manager 1:1', host: 'Jonah Fields', place: 'Video call', isRemote: true},
    {time: '12:00', title: 'Virtual team lunch — GTM', host: 'Maya Castillo', place: 'Video call', isRemote: true},
    {time: '13:30', title: 'CRM + pipeline walkthrough', host: 'Maya Castillo', place: 'Video call', isRemote: true},
    {time: '15:00', title: 'Benefits orientation', host: 'Dana Whitfield', place: 'Video call', isRemote: true},
  ],
};

const HIRES: Hire[] = [AVA, KEN];

// ---------------------------------------------------------------------------
// HELPERS — status metadata and the derived checklist model. Checking a
// task off flows into every count on the page: team headers, the rail
// progress bar, the phase chips, and the at-risk banner.
// ---------------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Fixed-fixture date label ("2026-07-06" → "Jul 6") — no Intl, no locale drift. */
function shortDate(iso: string): string {
  const [, month, day] = iso.slice(0, 10).split('-');
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
}

type TokenColor = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray';

const STATUS_META: Record<TaskStatus, {label: string; token: TokenColor}> = {
  done: {label: 'Done', token: 'green'},
  inProgress: {label: 'In progress', token: 'blue'},
  overdue: {label: 'Overdue', token: 'red'},
  todo: {label: 'Not started', token: 'gray'},
};

interface TaskView extends Task {
  /** Fixture status with the user's check/uncheck overrides applied. */
  effective: TaskStatus;
}

interface TeamGroupView {
  team: TeamMeta;
  owner: string;
  tasks: TaskView[];
  doneCount: number;
  overdueCount: number;
}

interface PhaseView extends PhaseFixture {
  state: 'done' | 'active' | 'upcoming' | 'attention';
  doneCount: number;
  totalCount: number;
  overdueCount: number;
}

interface HireView {
  hire: Hire;
  groups: TeamGroupView[];
  phases: PhaseView[];
  doneCount: number;
  totalCount: number;
  overdueTasks: TaskView[];
}

/**
 * Applies check/uncheck overrides and derives every count the page shows.
 * `overrides` maps task id → true (checked done) | false (unchecked back
 * to its fixture pre-done state).
 */
function buildHireView(hire: Hire, overrides: Record<string, boolean>): HireView {
  const tasks: TaskView[] = hire.tasks.map(task => {
    const override = overrides[task.id];
    const effective: TaskStatus =
      override === true
        ? 'done'
        : override === false
          ? task.status === 'done'
            ? 'todo'
            : task.status
          : task.status;
    return {...task, effective};
  });

  const groups: TeamGroupView[] = TEAM_ORDER.map(teamId => {
    const teamTasks = tasks.filter(task => task.team === teamId);
    return {
      team: TEAMS[teamId],
      owner: TASK_OWNER[teamId](hire),
      tasks: teamTasks,
      doneCount: teamTasks.filter(task => task.effective === 'done').length,
      overdueCount: teamTasks.filter(task => task.effective === 'overdue').length,
    };
  });

  const phases: PhaseView[] = hire.phases.map(phase => {
    const phaseTasks = tasks.filter(task => task.phase === phase.id);
    const doneCount = phaseTasks.filter(task => task.effective === 'done').length;
    const overdueCount = phaseTasks.filter(task => task.effective === 'overdue').length;
    const state: PhaseView['state'] =
      overdueCount > 0
        ? 'attention'
        : phaseTasks.length > 0 && doneCount === phaseTasks.length && phase.baseState !== 'upcoming'
          ? 'done'
          : phase.baseState;
    return {
      ...phase,
      state,
      doneCount,
      totalCount: phaseTasks.length,
      overdueCount,
    };
  });

  return {
    hire,
    groups,
    phases,
    doneCount: tasks.filter(task => task.effective === 'done').length,
    totalCount: tasks.length,
    overdueTasks: tasks.filter(task => task.effective === 'overdue'),
  };
}

function firstName(person: string): string {
  return person.split(' ')[0];
}

// ---------------------------------------------------------------------------
// RAIL — one card per in-flight hire (progress, at-risk dot) plus a pinned
// summary strip whose numbers derive from the same views as the content.
// ---------------------------------------------------------------------------

function HireCard({
  view,
  isActive,
  onSelect,
}: {
  view: HireView;
  isActive: boolean;
  onSelect: () => void;
}) {
  const {hire} = view;
  const hasRisk = view.overdueTasks.length > 0;
  return (
    <button
      type="button"
      style={{...styles.hireCard, ...(isActive ? styles.hireCardActive : null)}}
      aria-pressed={isActive}
      onClick={onSelect}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Avatar name={hire.name} size="small" />
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <Text type="label" maxLines={1}>
                {hire.name}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {hire.role} · {hire.department}
              </Text>
            </VStack>
          </StackItem>
          {hasRisk ? (
            <StatusDot
              variant="error"
              label={`${hire.name}: overdue task`}
              tooltip={`${view.overdueTasks.length} overdue task`}
            />
          ) : (
            <StatusDot variant="success" label={`${hire.name}: on track`} tooltip="On track" />
          )}
        </HStack>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            {/* Footgun: ProgressBar enforces minWidth 48 — pin 0 for the
                narrow rail card. */}
            <ProgressBar
              label={`${hire.name} onboarding tasks complete`}
              isLabelHidden
              value={view.doneCount}
              max={view.totalCount}
              variant={hasRisk ? 'warning' : 'neutral'}
              style={{minWidth: 0}}
            />
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {view.doneCount}/{view.totalCount}
          </Text>
        </HStack>
        <Text type="supporting" color="secondary" maxLines={1}>
          {hire.stageLine} · {hire.office}
        </Text>
      </VStack>
    </button>
  );
}

function HireRail({
  views,
  activeId,
  onSelect,
}: {
  views: HireView[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const openCount = views.reduce(
    (sum, view) => sum + (view.totalCount - view.doneCount),
    0,
  );
  const overdueCount = views.reduce(
    (sum, view) => sum + view.overdueTasks.length,
    0,
  );
  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <VStack gap={2}>
          <Text type="label" size="sm" color="secondary">
            In flight ({views.length})
          </Text>
          {views.map(view => (
            <HireCard
              key={view.hire.id}
              view={view}
              isActive={view.hire.id === activeId}
              onSelect={() => onSelect(view.hire.id)}
            />
          ))}
          <Text type="supporting" color="secondary">
            Next start: Ken Tanaka · Mon, Jul 6
          </Text>
        </VStack>
      </div>
      <Divider />
      {/* Pinned summary — derives from the same task views as the content
          column, so checking a task off updates this strip too. */}
      <VStack gap={1} style={styles.railPinned}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" size="sm">
              This week
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {openCount} open tasks
          </Text>
        </HStack>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {overdueCount === 0
            ? 'Nothing overdue across in-flight hires'
            : `${overdueCount} overdue · needs attention today`}
        </Text>
        <Text type="supporting" color="secondary">
          As of {AS_OF_LABEL}
        </Text>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PHASE STRIP — five chips with connectors; Accounts/Equipment counts come
// straight from the checklist, so the strip stays registered with it.
// ---------------------------------------------------------------------------

function PhaseChip({phase}: {phase: PhaseView}) {
  const stateStyle =
    phase.state === 'done'
      ? styles.phaseChipDone
      : phase.state === 'attention'
        ? styles.phaseChipAttention
        : phase.state === 'active'
          ? styles.phaseChipActive
          : null;
  const glyphColor =
    phase.state === 'done'
      ? TEAM_COLOR.green
      : phase.state === 'attention'
        ? 'light-dark(#DC2626, #F87171)'
        : phase.state === 'active'
          ? 'var(--color-accent)'
          : 'var(--color-text-secondary)';
  const sub =
    phase.state === 'attention'
      ? `${phase.overdueCount} overdue`
      : phase.totalCount > 0
        ? `${phase.doneCount}/${phase.totalCount} tasks`
        : phase.note;
  return (
    <div style={{...styles.phaseChip, ...stateStyle}}>
      <span style={{...styles.phaseGlyph, color: glyphColor}}>
        <Icon
          icon={
            phase.state === 'done'
              ? CheckIcon
              : phase.state === 'attention'
                ? AlertTriangleIcon
                : ClockIcon
          }
          size="sm"
          color="inherit"
        />
      </span>
      <VStack gap={0}>
        <Text type="label" size="sm">
          {phase.label}
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {sub}
        </Text>
      </VStack>
    </div>
  );
}

function PhaseStrip({view}: {view: HireView}) {
  return (
    <div style={styles.hStripWrap}>
      <div style={styles.phaseStrip} role="list" aria-label="Onboarding phases">
        {view.phases.map((phase, index) => (
          <HStack key={phase.id} gap={1} vAlign="center" role="listitem">
            {index > 0 ? <span style={styles.phaseConnector} /> : null}
            <PhaseChip phase={phase} />
          </HStack>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DAY-1 AGENDA STRIP — fixed-width slot cards in one horizontal scroller.
// ---------------------------------------------------------------------------

function AgendaStrip({hire}: {hire: Hire}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Icon icon={CalendarCheckIcon} size="sm" color="secondary" />
        <Text type="label">{hire.agendaTitle}</Text>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary">
          {hire.agendaNote}
        </Text>
      </HStack>
      <div style={styles.hStripWrap}>
        <div style={styles.agendaStrip} role="list" aria-label={hire.agendaTitle}>
          {hire.agenda.map(slot => (
          <div key={slot.time} style={styles.agendaSlot} role="listitem">
            <VStack gap={1}>
              <HStack gap={2} vAlign="center">
                <Text type="label" size="sm" style={styles.agendaTime}>
                  {slot.time}
                </Text>
                <StackItem size="fill" />
                <Icon
                  icon={slot.isRemote ? VideoIcon : MapPinIcon}
                  size="xsm"
                  color="secondary"
                />
              </HStack>
              <Text type="label" size="sm" maxLines={1}>
                {slot.title}
              </Text>
              <HStack gap={1} vAlign="center">
                <Avatar name={slot.host} size="xsmall" />
                <StackItem size="fill" style={{minWidth: 0}}>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {firstName(slot.host)} · {slot.place}
                  </Text>
                </StackItem>
              </HStack>
            </VStack>
          </div>
          ))}
        </div>
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// CHECKLIST — one Collapsible per owner team; checking a row off updates
// every derived count on the page (group header, rail, phases, banner).
// ---------------------------------------------------------------------------

function TaskRow({
  task,
  onToggle,
}: {
  task: TaskView;
  onToggle: (task: TaskView, checked: boolean) => void;
}) {
  const isDone = task.effective === 'done';
  const meta = STATUS_META[task.effective];
  return (
    <div style={styles.taskRow}>
      <CheckboxInput
        label={`${task.label} — mark done`}
        isLabelHidden
        value={isDone}
        onChange={checked => onToggle(task, checked)}
      />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" size="sm" style={isDone ? styles.taskDone : undefined}>
            {task.label}
          </Text>
          {task.detail !== undefined ? (
            <Text type="supporting" color="secondary" maxLines={2}>
              {task.detail}
            </Text>
          ) : null}
        </VStack>
      </StackItem>
      <HStack gap={2} vAlign="center" style={styles.taskMeta}>
        {isDone ? (
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {task.doneOn !== undefined ? `Done ${shortDate(task.doneOn)}` : 'Done today'}
          </Text>
        ) : task.effective === 'overdue' ? (
          <Badge
            variant="error"
            label={`Overdue · was due ${task.dueOn !== undefined ? shortDate(task.dueOn) : '—'}`}
          />
        ) : task.dueOn !== undefined ? (
          <Badge variant="neutral" label={`Due ${shortDate(task.dueOn)}`} />
        ) : null}
        <Token size="sm" color={meta.token} label={meta.label} />
      </HStack>
    </div>
  );
}

function TeamGroup({
  group,
  onToggle,
}: {
  group: TeamGroupView;
  onToggle: (task: TaskView, checked: boolean) => void;
}) {
  return (
    <div style={styles.teamGroup}>
      <Collapsible
        defaultIsOpen
        trigger={
          <HStack gap={2} vAlign="center" style={{minWidth: 0}}>
            <span style={{...styles.teamDot, backgroundColor: group.team.color}} />
            <Icon icon={group.team.icon} size="sm" color="secondary" />
            <Text type="label">{group.team.label}</Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {group.owner}
            </Text>
            <StackItem size="fill" />
            {group.overdueCount > 0 ? (
              <Badge variant="error" label={`${group.overdueCount} overdue`} />
            ) : null}
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {group.doneCount}/{group.tasks.length} done
            </Text>
          </HStack>
        }>
        <div>
          {group.tasks.map(task => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} />
          ))}
        </div>
      </Collapsible>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DOCUMENTS — e-sign status rows only (the signing ceremony itself lives
// in esignature-envelope-flow). Pending docs cross-reference the payroll
// task they block.
// ---------------------------------------------------------------------------

function DocumentsSection({hire}: {hire: Hire}) {
  const signedCount = hire.docs.filter(doc => doc.status === 'signed').length;
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <Icon icon={FileSignatureIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="label">Documents</Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {signedCount} of {hire.docs.length} signed
        </Text>
      </HStack>
      <div>
        {hire.docs.map((doc, index) => (
          <div key={doc.id}>
            {index > 0 ? <Divider /> : null}
            <div style={styles.docRow}>
              <Icon icon={FileTextIcon} size="sm" color="secondary" />
              <StackItem size="fill" style={{minWidth: 0}}>
                <VStack gap={0}>
                  <Text type="label" size="sm" maxLines={1}>
                    {doc.name}
                  </Text>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {doc.status === 'signed' && doc.signedOn !== undefined
                      ? `Signed ${shortDate(doc.signedOn)} · sent ${shortDate(doc.sentOn)}`
                      : `Sent ${shortDate(doc.sentOn)} · not yet signed`}
                  </Text>
                  {doc.blocks !== undefined && doc.status === 'pending' ? (
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {doc.blocks}
                    </Text>
                  ) : null}
                </VStack>
              </StackItem>
              <VStack gap={1} hAlign="end">
                {doc.status === 'signed' ? (
                  <Badge variant="success" label="Signed" icon={<Icon icon={CheckIcon} size="xsm" color="inherit" />} />
                ) : (
                  <Badge variant="warning" label="Awaiting signature" />
                )}
                {doc.status === 'pending' ? (
                  <Button
                    label="Resend"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={SendIcon} size="sm" />}
                  />
                ) : null}
              </VStack>
            </div>
          </div>
        ))}
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// EQUIPMENT — the shipment card. Asset tags match the device-inventory
// surface (KL-MBP-1042 / KL-MBP-1057); tracking steps are fixed fixtures.
// ---------------------------------------------------------------------------

function ShipStepRow({step, isLast}: {step: ShipStep; isLast: boolean}) {
  return (
    <div style={styles.shipStep}>
      <div style={styles.shipStepSpine}>
        <StatusDot
          variant={step.state === 'done' ? 'success' : step.state === 'active' ? 'accent' : 'neutral'}
          label={`${step.label}: ${step.state}`}
          isPulsing={step.state === 'active'}
        />
        {!isLast ? <span style={styles.shipStepLine} /> : null}
      </div>
      <VStack gap={0} style={{paddingBottom: isLast ? 0 : 'var(--spacing-2)'}}>
        <Text type="label" size="sm">
          {step.label}
        </Text>
        {step.at !== undefined ? (
          <Timestamp value={step.at} format="date_time" color="secondary" />
        ) : (
          <Text type="supporting" color="secondary">
            {step.eta}
          </Text>
        )}
      </VStack>
    </div>
  );
}

function EquipmentSection({hire}: {hire: Hire}) {
  const equipment = hire.equipment;
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Icon icon={LaptopIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="label">Equipment</Text>
        </StackItem>
        {equipment.status === 'delivered' ? (
          <Badge variant="success" label="Delivered" />
        ) : (
          <Badge variant="info" label="In transit" icon={<Icon icon={PackageIcon} size="xsm" color="inherit" />} />
        )}
      </HStack>
      <div style={styles.shipCard}>
        <VStack gap={3}>
          <VStack gap={0}>
            <Text type="label" size="sm">
              {equipment.asset}
            </Text>
            <Text type="supporting" color="secondary">
              {equipment.statusNote}
            </Text>
          </VStack>
          <MetadataList columns={1} label={{position: 'start', width: 84}}>
            <MetadataListItem label="Asset tag">
              <Text type="body" size="sm" style={styles.mono}>
                {equipment.assetTag}
              </Text>
            </MetadataListItem>
            <MetadataListItem label="Serial">
              <Text type="body" size="sm" style={styles.mono}>
                {equipment.serial}
              </Text>
            </MetadataListItem>
            <MetadataListItem label="Tracking">
              <Text type="body" size="sm" style={styles.monoWrap}>
                {equipment.carrier} · {equipment.tracking}
              </Text>
            </MetadataListItem>
          </MetadataList>
          <Divider />
          <div style={styles.shipStepRail}>
            {equipment.steps.map((step, index) => (
              <ShipStepRow
                key={step.label}
                step={step}
                isLast={index === equipment.steps.length - 1}
              />
            ))}
          </div>
          <Text type="supporting" color="secondary">
            {equipment.kitNote}
          </Text>
        </VStack>
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// HIRE HEADER — identity block above the phase strip; the progress figure
// is the same doneCount/totalCount pair the rail card shows.
// ---------------------------------------------------------------------------

function HireHeader({view, isCompact}: {view: HireView; isCompact: boolean}) {
  const {hire} = view;
  return (
    <HStack gap={3} vAlign="center" wrap="wrap">
      <Avatar name={hire.name} size={isCompact ? 'small' : 'medium'} />
      <StackItem size="fill" style={{minWidth: 200}}>
        <VStack gap={0}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Heading level={2}>{hire.name}</Heading>
            <Token size="sm" color="gray" label={hire.department} />
            <Token size="sm" color="gray" label={hire.office} />
          </HStack>
          <Text type="supporting" color="secondary" maxLines={1}>
            {hire.role} · Manager {hire.manager} · Buddy {hire.buddy} · Starts{' '}
            {shortDate(hire.startsOn)}
          </Text>
        </VStack>
      </StackItem>
      <VStack gap={1} hAlign="end">
        <Text type="label" size="sm" hasTabularNumbers>
          {view.doneCount} of {view.totalCount} tasks done
        </Text>
        <ProgressBar
          label={`${hire.name} onboarding progress`}
          isLabelHidden
          value={view.doneCount}
          max={view.totalCount}
          variant={view.overdueTasks.length > 0 ? 'warning' : 'neutral'}
          style={{width: 160}}
        />
      </VStack>
    </HStack>
  );
}

/** Docs + shipment stack — the 340px end panel, reused inline <=1180px. */
function DocsEquipmentStack({hire}: {hire: Hire}) {
  return (
    <VStack gap={4}>
      <DocumentsSection hire={hire} />
      <Divider />
      <EquipmentSection hire={hire} />
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const HIRE_OPTIONS = HIRES.map(hire => ({
  value: hire.id,
  label: hire.name,
}));

export default function HrOnboardingFlowTemplate() {
  const [activeHireId, setActiveHireId] = useState<string>('ava');
  // Task check/uncheck overrides, keyed by task id (see buildHireView).
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [remindedTaskIds, setRemindedTaskIds] = useState<Set<string>>(
    new Set(),
  );
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px moves docs/equipment inline; <=860px
  // swaps the hire rail for a Selector in the content header.
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const views = useMemo(
    () => HIRES.map(hire => buildHireView(hire, overrides)),
    [overrides],
  );
  const activeView =
    views.find(view => view.hire.id === activeHireId) ?? views[0];
  const activeHire = activeView.hire;

  const toggleTask = (task: TaskView, checked: boolean) => {
    setOverrides(prev => ({...prev, [task.id]: checked}));
    setAnnouncement(
      checked
        ? `Marked done: ${task.label}`
        : `Reopened: ${task.label}`,
    );
  };

  const remindOwner = (task: TaskView, owner: string) => {
    setRemindedTaskIds(prev => new Set(prev).add(task.id));
    setAnnouncement(`Reminder sent to ${owner} about “${task.label}”`);
  };

  // ----- at-risk banner: first overdue task for the selected hire -----
  const overdueTask = activeView.overdueTasks[0];
  const overdueOwner =
    overdueTask !== undefined
      ? TASK_OWNER[overdueTask.team](activeHire)
      : null;
  const isReminded =
    overdueTask !== undefined && remindedTaskIds.has(overdueTask.id);

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={UserPlusIcon} size="md" color="secondary" />
          <Heading level={1}>Onboarding</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · People
          </Text>
        </HStack>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {HIRES.length} hires in flight
        </Text>
        <Button label="Add hire" variant="primary" size="sm" icon={<Icon icon={UserPlusIcon} size="sm" color="inherit" />} />
        {!isPanelHidden && (
          <IconButton
            label={isPanelOpen ? 'Hide docs panel' : 'Show docs panel'}
            tooltip={isPanelOpen ? 'Hide docs & equipment' : 'Show docs & equipment'}
            size="sm"
            variant={isPanelOpen ? 'secondary' : 'ghost'}
            icon={<Icon icon={PanelRightIcon} size="sm" />}
            onClick={() => setIsPanelOpen(open => !open)}
          />
        )}
      </HStack>
    </LayoutHeader>
  );

  const banner =
    overdueTask !== undefined && overdueOwner !== null ? (
      <Banner
        status="warning"
        icon={<Icon icon={AlertTriangleIcon} size="sm" color="inherit" />}
        title={`${firstName(activeHire.name)}'s week 1 is at risk — IT task overdue`}
        description={`“${overdueTask.label}” (${overdueOwner}) was due ${
          overdueTask.dueOn !== undefined ? shortDate(overdueTask.dueOn) : '—'
        } and blocks GitHub and Figma access for the starter ticket.`}
        endContent={
          <Button
            label={isReminded ? 'Reminder sent' : `Remind ${firstName(overdueOwner)}`}
            variant="secondary"
            size="sm"
            icon={<Icon icon={BellIcon} size="sm" />}
            isDisabled={isReminded}
            onClick={() => remindOwner(overdueTask, overdueOwner)}
          />
        }
      />
    ) : null;

  const content = (
    <LayoutContent padding={0}>
      <div style={styles.panelFill}>
        <div aria-live="polite" style={styles.visuallyHidden}>
          {announcement}
        </div>
        <div style={styles.contentScroll}>
          <VStack gap={4}>
            {isCompact ? (
              <Selector
                label="Hire"
                isLabelHidden
                options={HIRE_OPTIONS}
                value={activeHireId}
                onChange={value => setActiveHireId(value)}
                size="sm"
                width={220}
              />
            ) : null}
            <HireHeader view={activeView} isCompact={isCompact} />
            {banner}
            <PhaseStrip view={activeView} />
            <Divider />
            <AgendaStrip hire={activeHire} />
            <Divider />
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Text type="label">Cross-team checklist</Text>
                <StackItem size="fill" />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {activeView.doneCount} of {activeView.totalCount} done
                  {activeView.overdueTasks.length > 0
                    ? ` · ${activeView.overdueTasks.length} overdue`
                    : ''}
                </Text>
              </HStack>
              {activeView.groups.map(group => (
                <TeamGroup
                  key={group.team.id}
                  group={group}
                  onToggle={toggleTask}
                />
              ))}
            </VStack>
            {isPanelHidden ? (
              <>
                <Divider />
                <div style={styles.inlineTwoUp}>
                  <div style={styles.inlineCol}>
                    <DocumentsSection hire={activeHire} />
                  </div>
                  <div style={styles.inlineCol}>
                    <EquipmentSection hire={activeHire} />
                  </div>
                </div>
              </>
            ) : null}
          </VStack>
        </div>
      </div>
    </LayoutContent>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel width={280} padding={0} hasDivider label="In-flight hires">
              <HireRail
                views={views}
                activeId={activeHire.id}
                onSelect={setActiveHireId}
              />
            </LayoutPanel>
          )
        }
        content={content}
        end={
          !isPanelHidden && isPanelOpen ? (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              label="Documents and equipment">
              <div style={styles.sideScroll}>
                <DocsEquipmentStack hire={activeHire} />
              </div>
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
