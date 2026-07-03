var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (three Kestrel Labs provisioning runs
 *   frozen at Fri, Jul 3 2026 09:30 PT — Ava Lindqvist complete 9/9, Ken
 *   Tanaka running 6/9, Ines Ferreira pre-start with one failed GitHub
 *   seat step — plus three upcoming starts, three kit templates, and a
 *   trailing-90-day SLA block; no clocks, no randomness, no network).
 * @output IT-side Day-1 Provisioning status console for the Kestrel Labs
 *   workforce platform: a run rail with per-run step progress and a pinned
 *   SLA strip (98% day-1 ready, median ready-by 18h before start), a
 *   selected-run detail with a 9-step chip pipeline (account, email, SSO
 *   groups, Slack, seat grant, laptop imaged, shipped, MDM, day-1 check),
 *   a failed-step error card (GitHub seat pool exhausted) with working
 *   Retry/Skip actions, an upcoming-starts list with kit-readiness pills,
 *   and a kit-template chip row diffing the Engineering vs GTM kits.
 * @position Page template; emitted by \`astryx template it-onboarding-provisioning\`
 *
 * Frame: root 100dvh div > Layout height="fill". Header toolbar; start
 *   rail 300px (active runs, upcoming starts, pinned SLA strip); content
 *   column (run header, step-chip pipeline, failed-step card, step rows,
 *   kit-template section); end panel 340px with a Step / Run log toggle.
 * Responsive contract: <=1180px drops the end panel and renders the
 *   selected step's detail inline below the step rows; <=860px swaps the
 *   rail for a run Selector and appends upcoming starts + SLA stats to
 *   the content column. Step chips wrap; nothing horizontally clips.
 * Container policy: frame-first rows and panels only — no Cards. The
 *   failed-step error block is a tinted, bordered region, not a Card.
 * Color policy: token-pure; status literals use light-dark() pairs and
 *   data-viz categorical tokens carry the repo-standard fallbacks.
 */

import {useMemo, useState, type CSSProperties} from 'react';
import {
  ActivityIcon,
  AlertTriangleIcon,
  BriefcaseIcon,
  CalendarClockIcon,
  CheckIcon,
  ClipboardCheckIcon,
  ClockIcon,
  GitBranchIcon,
  HardDriveDownloadIcon,
  KeyRoundIcon,
  ListChecksIcon,
  LoaderCircleIcon,
  MailIcon,
  MessageSquareIcon,
  PanelRightIcon,
  PenToolIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  SkipForwardIcon,
  TruckIcon,
  UserRoundPlusIcon,
  ZapIcon,
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
import {IconButton} from '@astryxdesign/core/IconButton';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
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
  railPinned: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  detailSticky: {
    position: 'sticky',
    insetBlockStart: 0,
    maxHeight: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },

  // --- rail -----------------------------------------------------------------
  railSectionLabel: {
    padding: 'var(--spacing-1) var(--spacing-1) 0',
  },
  runRow: {
    display: 'block',
    width: '100%',
    textAlign: 'start',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  runRowActive: {
    backgroundColor: 'var(--color-background-muted)',
    borderColor: 'var(--color-border)',
  },
  runProgressTrack: {
    display: 'flex',
    gap: 2,
    width: '100%',
  },
  runProgressSeg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'var(--color-background-muted)',
  },
  upcomingRow: {
    display: 'block',
    width: '100%',
    textAlign: 'start',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid transparent',
    backgroundColor: 'transparent',
    cursor: 'default',
    font: 'inherit',
    color: 'inherit',
  },
  slaValue: {
    fontVariantNumeric: 'tabular-nums',
  },

  // --- run header + pipeline --------------------------------------------------
  runHeaderMeta: {
    minWidth: 0,
  },
  pipelineWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  stepChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: '4px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    whiteSpace: 'nowrap',
  },
  stepChipSelected: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  stepChipDone: {
    backgroundColor: 'light-dark(#F0FDF4, rgba(52,199,89,0.12))',
    borderColor: 'light-dark(#BBF7D0, rgba(52,199,89,0.35))',
  },
  stepChipRunning: {
    backgroundColor: 'light-dark(#EFF6FF, rgba(76,158,255,0.12))',
    borderColor: 'light-dark(#BFDBFE, rgba(76,158,255,0.4))',
  },
  stepChipFailed: {
    backgroundColor: 'light-dark(#FEF2F2, rgba(248,113,113,0.12))',
    borderColor: 'light-dark(#FECACA, rgba(248,113,113,0.4))',
  },
  stepChipQueued: {
    backgroundColor: 'light-dark(#FFFBEB, rgba(255,147,48,0.12))',
    borderColor: 'light-dark(#FDE68A, rgba(255,147,48,0.4))',
  },
  chipTime: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
  },

  // --- failed-step region -------------------------------------------------
  errorRegion: {
    border: 'var(--border-width) solid light-dark(#FECACA, rgba(248,113,113,0.4))',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'light-dark(#FEF2F2, rgba(248,113,113,0.08))',
    padding: 'var(--spacing-3)',
  },
  errorCode: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    padding: '2px 6px',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'light-dark(rgba(220,38,38,0.08), rgba(248,113,113,0.16))',
    color: 'light-dark(#B91C1C, #FCA5A5)',
    whiteSpace: 'nowrap',
  },

  // --- step rows ------------------------------------------------------------
  stepRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    width: '100%',
    textAlign: 'start',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  stepRowSelected: {
    backgroundColor: 'var(--color-background-muted)',
    borderColor: 'var(--color-border)',
  },
  stepRowTime: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    textAlign: 'end',
    width: 96,
    flexShrink: 0,
    paddingTop: 2,
  },

  // --- kit templates ----------------------------------------------------------
  kitChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: '5px 12px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    whiteSpace: 'nowrap',
  },
  kitChipSelected: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  kitStepToken: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 8px',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  kitStepTokenUnique: {
    borderColor:
      'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
    backgroundColor: 'light-dark(rgba(107,30,253,0.06), rgba(157,107,255,0.14))',
  },
  kitGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
  },

  // --- end panel -------------------------------------------------------------
  outputBlock: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    lineHeight: 1.6,
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Hanging indent so long output lines wrap under the value column instead
  // of clipping at the narrow end panel's right edge.
  outputLine: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    paddingLeft: '13ch',
    textIndent: '-13ch',
  },
  logRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
  },
  logTime: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    width: 92,
    flexShrink: 0,
    paddingTop: 2,
  },
  inlineTwoUp: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-4)',
  },
  inlineCol: {
    flex: '1 1 320px',
    minWidth: 0,
  },
};

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

type StepStatus = 'done' | 'running' | 'failed' | 'pending' | 'queued' | 'skipped';

type KitId = 'eng' | 'gtm' | 'design';

/** One of the nine canonical provisioning steps in a kit template. */
interface KitStep {
  id: string;
  label: string;
  /** What the step provisions, shown in the kit diff and step rows. */
  detail: string;
  icon: typeof MailIcon;
  /** Set when the step differs from the other kits (highlighted in diffs). */
  isKitSpecific?: boolean;
}

interface Kit {
  id: KitId;
  name: string;
  version: string;
  /** Count shown on the chip; active runs + queued upcoming starts. */
  usedByLine: string;
  /** One-line diff vs the Engineering baseline (or vs GTM for Engineering). */
  diffLine: string;
  steps: KitStep[];
}

interface RunStep {
  /** Matches the kit step id. */
  id: string;
  status: StepStatus;
  /** Pre-formatted deterministic display time, e.g. 'Jul 2 · 09:41'. */
  at?: string;
  /** Wall-clock duration of the step once finished. */
  duration?: string;
  /** 'System · run-book v4' or a named IT admin. */
  actor: string;
  /** One-line outcome note under the step row. */
  note?: string;
  /** Mono output lines for the end-panel step detail. */
  output: string[];
}

interface ProvisioningError {
  title: string;
  code: string;
  detail: string;
  hint: string;
  escalation: string;
}

interface Run {
  id: string;
  hire: string;
  role: string;
  department: 'Engineering' | 'GTM' | 'Design';
  office: 'SF HQ' | 'Lisbon' | 'Remote-US';
  manager: string;
  startsOn: string;
  startLabel: string;
  kitId: KitId;
  kickedOffAt: string;
  statusLine: string;
  slaBadge?: {variant: 'warning' | 'success'; label: string};
  /** Failed-step error rendered in the content column; keyed by step id. */
  error?: {stepId: string} & ProvisioningError;
  steps: RunStep[];
  log: Array<{at: string; text: string}>;
}

interface UpcomingStart {
  id: string;
  name: string;
  role: string;
  department: string;
  office: string;
  startLabel: string;
  kitId: KitId;
  pill: {variant: 'error' | 'success' | 'neutral' | 'warning'; label: string};
  note: string;
  /** Set when the hire already has an active run to jump to. */
  runId?: string;
}

// ---------------------------------------------------------------------------
// FIXTURES — Kestrel Labs (140 people), frozen at Fri, Jul 3 2026 09:30 PT.
// Three runs: Ava Lindqvist (Engineering kit, complete 9/9, missed the
// day-1 SLA when the GitHub seat pool blocked her on Jul 1 — she is the
// single miss in the trailing-90-day 47-of-48 stat), Ken Tanaka (GTM kit,
// 6 of 9, Salesforce seat running ahead of his Mon Jul 6 start), and Ines
// Ferreira (Engineering kit pre-start for Wed Jul 8, 4 of 9 with the
// GitHub step failed — Copilot Business pool 52/52). Laptops KL-MBP-1042
// and KL-MBP-1057 and carriers match the onboarding board's equipment
// tracks; step chips, rail counts, and the run log all derive from the
// same step arrays so every number reconciles.
// ---------------------------------------------------------------------------

const SHARED_STEPS: {[id: string]: Omit<KitStep, 'isKitSpecific'>} = {
  account: {
    id: 'account',
    label: 'Account created',
    detail: 'Google Workspace account + HRIS link',
    icon: UserRoundPlusIcon,
  },
  email: {
    id: 'email',
    label: 'Email + lists',
    detail: 'Mailbox live, dept lists + aliases',
    icon: MailIcon,
  },
  slack: {
    id: 'slack',
    label: 'Slack',
    detail: 'Workspace invite + default channels',
    icon: MessageSquareIcon,
  },
  image: {
    id: 'image',
    label: 'Laptop imaged',
    detail: 'MacBook Pro 14" imaged + configured',
    icon: HardDriveDownloadIcon,
  },
  ship: {
    id: 'ship',
    label: 'Shipped',
    detail: 'Handed to carrier, tracking on file',
    icon: TruckIcon,
  },
  mdm: {
    id: 'mdm',
    label: 'MDM enrolled',
    detail: 'Device enrolled, FileVault verified',
    icon: ShieldCheckIcon,
  },
  day1: {
    id: 'day1',
    label: 'Day-1 check',
    detail: 'Sign-in sweep across all granted apps',
    icon: ClipboardCheckIcon,
  },
};

const KITS: Kit[] = [
  {
    id: 'eng',
    name: 'Engineering kit',
    version: 'v4',
    usedByLine: '2 active runs · 1 queued start',
    diffLine:
      'vs GTM kit — GitHub org + Copilot instead of a Salesforce seat; SSO groups eng-all + github-eng; dev image (Xcode, Docker) instead of the standard image.',
    steps: [
      SHARED_STEPS.account,
      SHARED_STEPS.email,
      {
        id: 'sso',
        label: 'SSO groups',
        detail: 'eng-all · github-eng · vpn-users',
        icon: KeyRoundIcon,
        isKitSpecific: true,
      },
      SHARED_STEPS.slack,
      {
        id: 'seat',
        label: 'GitHub seat',
        detail: 'GitHub org Member + Copilot Business',
        icon: GitBranchIcon,
        isKitSpecific: true,
      },
      {...SHARED_STEPS.image, detail: 'eng-dev image 14.2 (Xcode, Docker)', isKitSpecific: true},
      SHARED_STEPS.ship,
      SHARED_STEPS.mdm,
      SHARED_STEPS.day1,
    ],
  },
  {
    id: 'gtm',
    name: 'GTM kit',
    version: 'v2',
    usedByLine: '1 active run · 1 queued start',
    diffLine:
      'vs Engineering kit — Salesforce seat + territory instead of GitHub + Copilot; SSO groups gtm-all + crm-users; standard image instead of the dev image.',
    steps: [
      SHARED_STEPS.account,
      SHARED_STEPS.email,
      {
        id: 'sso',
        label: 'SSO groups',
        detail: 'gtm-all · crm-users · vpn-users',
        icon: KeyRoundIcon,
        isKitSpecific: true,
      },
      SHARED_STEPS.slack,
      {
        id: 'seat',
        label: 'Salesforce seat',
        detail: 'Sales Cloud seat + territory assignment',
        icon: BriefcaseIcon,
        isKitSpecific: true,
      },
      {...SHARED_STEPS.image, detail: 'standard image 14.2', isKitSpecific: true},
      SHARED_STEPS.ship,
      SHARED_STEPS.mdm,
      SHARED_STEPS.day1,
    ],
  },
  {
    id: 'design',
    name: 'Design kit',
    version: 'v3',
    usedByLine: 'No runs this cycle',
    diffLine:
      'vs Engineering kit — Figma editor seat instead of GitHub + Copilot; SSO groups design-all; standard image with the Adobe bundle.',
    steps: [
      SHARED_STEPS.account,
      SHARED_STEPS.email,
      {
        id: 'sso',
        label: 'SSO groups',
        detail: 'design-all · vpn-users',
        icon: KeyRoundIcon,
        isKitSpecific: true,
      },
      SHARED_STEPS.slack,
      {
        id: 'seat',
        label: 'Figma seat',
        detail: 'Figma editor seat + team libraries',
        icon: PenToolIcon,
        isKitSpecific: true,
      },
      {...SHARED_STEPS.image, detail: 'standard image 14.2 + Adobe bundle', isKitSpecific: true},
      SHARED_STEPS.ship,
      SHARED_STEPS.mdm,
      SHARED_STEPS.day1,
    ],
  },
];

const AVA_RUN: Run = {
  id: 'ava',
  hire: 'Ava Lindqvist',
  role: 'Product Engineer',
  department: 'Engineering',
  office: 'SF HQ',
  manager: 'Marcus Webb',
  startsOn: 'Wed, Jul 1',
  startLabel: 'Started Jul 1 · day 3',
  kitId: 'eng',
  kickedOffAt: 'Jun 25 · 10:12',
  statusLine: 'Complete · ready Jul 3 09:02, two days after start',
  slaBadge: {variant: 'warning', label: 'Missed day-1 SLA'},
  steps: [
    {
      id: 'account',
      status: 'done',
      at: 'Jun 30 · 09:12',
      duration: '38s',
      actor: 'System · run-book v4',
      note: 'ava.lindqvist@kestrellabs.com',
      output: [
        'create_user  ava.lindqvist@kestrellabs.com',
        'org_unit     /Engineering/Platform',
        'hris_link    EMP-0141 → workspace OK',
      ],
    },
    {
      id: 'email',
      status: 'done',
      at: 'Jun 30 · 09:13',
      duration: '11s',
      actor: 'System · run-book v4',
      note: 'eng@ · platform@ · sf-hq@',
      output: [
        'mailbox      provisioned (region us-west1)',
        'lists        eng@, platform@, sf-hq@',
        'alias        alindqvist@ → primary',
      ],
    },
    {
      id: 'sso',
      status: 'done',
      at: 'Jul 2 · 17:20',
      duration: '52s',
      actor: 'Tom Okonkwo',
      note: 'eng-all · github-eng · vpn-users — ran late, see GitHub seat',
      output: [
        'idp_groups   +eng-all +github-eng +vpn-users',
        'scim_push    GitHub, Figma, Slack queued',
        'note         held Jul 1–2 behind the seat-pool failure',
      ],
    },
    {
      id: 'slack',
      status: 'done',
      at: 'Jul 1 · 09:02',
      duration: '9s',
      actor: 'System · run-book v4',
      note: '#eng-platform · #announce · #sf-hq',
      output: [
        'invite       accepted Jul 1 09:14',
        'channels     #eng-platform, #announce, #sf-hq',
        'profile      title + manager synced from HRIS',
      ],
    },
    {
      id: 'seat',
      status: 'done',
      at: 'Jul 2 · 17:24',
      duration: '2m 04s',
      actor: 'Tom Okonkwo',
      note: 'Retried ×1 — pool was 80/80 on Jul 1; 7 seats reclaimed Jul 2',
      output: [
        'grant_seat   FAILED Jul 1 08:41 — seat_limit_reached (80/80)',
        'reclaim      7 inactive seats freed Jul 2 (quarterly cleanup)',
        'retry        OK Jul 2 17:24 — Member + Copilot Business',
        'teams        kestrel/platform, kestrel/eng-all',
      ],
    },
    {
      id: 'image',
      status: 'done',
      at: 'Jun 26 · 16:40',
      duration: '1h 12m',
      actor: 'System · SF depot',
      note: 'KL-MBP-1042 · eng-dev image 14.2',
      output: [
        'asset        KL-MBP-1042 (serial FVFHK204Q6L7)',
        'image        eng-dev 14.2 — Xcode 17.4, Docker, dotfiles',
        'firmware     verified, FileVault pre-staged',
      ],
    },
    {
      id: 'ship',
      status: 'done',
      at: 'Jun 27 · 18:05',
      duration: '—',
      actor: 'System · SF depot',
      note: 'UPS 1Z 999 AA1 01 2345 6784 · delivered Jun 30',
      output: [
        'carrier      UPS ground — SF HQ front desk',
        'tracking     1Z 999 AA1 01 2345 6784',
        'delivered    Jun 30 09:41, signed D. Whitfield',
      ],
    },
    {
      id: 'mdm',
      status: 'done',
      at: 'Jul 2 · 18:03',
      duration: '6m 18s',
      actor: 'Tom Okonkwo',
      note: 'Enrolled at the IT bar once SSO groups landed',
      output: [
        'enrolled     KL-MBP-1042 → Kestrel MDM',
        'filevault    enabled, key escrowed',
        'baseline     os 15.5 current, 14 profiles applied',
      ],
    },
    {
      id: 'day1',
      status: 'done',
      at: 'Jul 3 · 09:02',
      duration: '3m 40s',
      actor: 'System · run-book v4',
      note: 'All 9 grants verified — run closed',
      output: [
        'signin_sweep 9/9 apps OK (last: GitHub Jul 3 08:58)',
        'sla          day-1 ready MISSED — ready T+2d',
        'ticket       IT-4821 closed, linked to seat-pool RCA',
      ],
    },
  ],
  log: [
    {at: 'Jun 25 · 10:12', text: 'Run kicked off from the hire record (T-4 business days).'},
    {at: 'Jun 26 · 16:40', text: 'KL-MBP-1042 imaged at the SF depot (eng-dev 14.2).'},
    {at: 'Jun 27 · 18:05', text: 'Laptop handed to UPS — SF HQ front desk.'},
    {at: 'Jun 30 · 09:12', text: 'Workspace account + mailbox created.'},
    {at: 'Jul 1 · 08:41', text: 'GitHub seat grant failed — seat pool 80/80.'},
    {at: 'Jul 2 · 17:24', text: 'GitHub retry OK after 7 seats reclaimed; SSO groups + MDM completed.'},
    {at: 'Jul 3 · 09:02', text: 'Day-1 check passed 9/9 — run complete, day-1 SLA missed.'},
  ],
};

const KEN_RUN: Run = {
  id: 'ken',
  hire: 'Ken Tanaka',
  role: 'Account Executive',
  department: 'GTM',
  office: 'Remote-US',
  manager: 'Jonah Fields',
  startsOn: 'Mon, Jul 6',
  startLabel: 'Starts Mon, Jul 6',
  kitId: 'gtm',
  kickedOffAt: 'Jun 27 · 09:20',
  statusLine: 'In progress · on track for day-1 ready',
  steps: [
    {
      id: 'account',
      status: 'done',
      at: 'Jul 2 · 09:05',
      duration: '35s',
      actor: 'System · run-book v2',
      note: 'ken.tanaka@kestrellabs.com',
      output: [
        'create_user  ken.tanaka@kestrellabs.com',
        'org_unit     /GTM/Sales',
        'hris_link    EMP-0142 → workspace OK',
      ],
    },
    {
      id: 'email',
      status: 'done',
      at: 'Jul 2 · 09:06',
      duration: '10s',
      actor: 'System · run-book v2',
      note: 'gtm@ · sales@ · remote-us@',
      output: [
        'mailbox      provisioned (region us-east1)',
        'lists        gtm@, sales@, remote-us@',
        'alias        ktanaka@ → primary',
      ],
    },
    {
      id: 'sso',
      status: 'done',
      at: 'Jul 2 · 09:40',
      duration: '47s',
      actor: 'System · run-book v2',
      note: 'gtm-all · crm-users · vpn-users',
      output: [
        'idp_groups   +gtm-all +crm-users +vpn-users',
        'scim_push    Salesforce, Slack, Notion queued',
      ],
    },
    {
      id: 'slack',
      status: 'done',
      at: 'Jul 2 · 09:41',
      duration: '8s',
      actor: 'System · run-book v2',
      note: '#gtm · #announce · #remote-us',
      output: [
        'invite       sent — accepts on day 1',
        'channels     #gtm, #announce, #remote-us',
        'profile      title + manager synced from HRIS',
      ],
    },
    {
      id: 'seat',
      status: 'running',
      at: 'Jul 3 · 09:05',
      actor: 'System · run-book v2',
      note: 'Waiting on territory assignment from Jonah Fields',
      output: [
        'grant_seat   Sales Cloud seat reserved',
        'territory    awaiting input — request sent to J. Fields Jul 3 09:05',
        'eta          auto-completes once territory is set',
      ],
    },
    {
      id: 'image',
      status: 'done',
      at: 'Jun 30 · 15:10',
      duration: '58m',
      actor: 'System · SF depot',
      note: 'KL-MBP-1057 · standard image 14.2',
      output: [
        'asset        KL-MBP-1057 (serial FVFHK311T8M2)',
        'image        standard 14.2 — Chrome, Zoom, Salesforce desktop',
        'firmware     verified, FileVault pre-staged',
      ],
    },
    {
      id: 'ship',
      status: 'done',
      at: 'Jul 1 · 10:32',
      duration: '—',
      actor: 'System · SF depot',
      note: 'FedEx 7489 0155 2201 · in transit, arrives Jul 3',
      output: [
        'carrier      FedEx 2-day — home address (Remote-US)',
        'tracking     7489 0155 2201',
        'eta          Fri, Jul 3 — before the Mon Jul 6 start',
      ],
    },
    {
      id: 'mdm',
      status: 'pending',
      actor: 'Tom Okonkwo',
      note: 'Remote enrollment on the day-1 IT call · Jul 6 09:45',
      output: [
        'scheduled    day-1 IT call, Jul 6 09:45 PT',
        'prereq       laptop delivered (ETA Jul 3)',
      ],
    },
    {
      id: 'day1',
      status: 'pending',
      actor: 'System · run-book v2',
      note: 'Runs automatically after MDM enrollment on Jul 6',
      output: ['scheduled    sign-in sweep after MDM enrollment, Jul 6'],
    },
  ],
  log: [
    {at: 'Jun 27 · 09:20', text: 'Run kicked off from the hire record (T-5 business days).'},
    {at: 'Jun 30 · 15:10', text: 'KL-MBP-1057 imaged at the SF depot (standard 14.2).'},
    {at: 'Jul 1 · 10:32', text: 'Laptop handed to FedEx — home address, ETA Jul 3.'},
    {at: 'Jul 2 · 09:05', text: 'Workspace account, mailbox, SSO groups, and Slack completed.'},
    {at: 'Jul 3 · 09:05', text: 'Salesforce seat reserved — waiting on territory from J. Fields.'},
  ],
};

const INES_RUN: Run = {
  id: 'ines',
  hire: 'Ines Ferreira',
  role: 'Data Platform Engineer',
  department: 'Engineering',
  office: 'Lisbon',
  manager: 'Marcus Webb',
  startsOn: 'Wed, Jul 8',
  startLabel: 'Starts Wed, Jul 8',
  kitId: 'eng',
  kickedOffAt: 'Jul 1 · 10:04',
  statusLine: 'Pre-start · blocked on the GitHub seat step',
  error: {
    stepId: 'seat',
    title: 'GitHub seat pool exhausted',
    code: 'seat_limit_reached · HTTP 422',
    detail:
      'grant_seat(copilot_business) was rejected — 52 of 52 Copilot Business add-on seats are assigned. The base Enterprise seat was reserved, but the Copilot add-on required by the Engineering kit could not be granted.',
    hint:
      'A contractor seat releases at term end on Sun, Jul 5. Retry queues the grant to run as soon as a seat frees; Skip grants the base seat only and files the Copilot add-on to the IT backlog.',
    escalation:
      'Second seat-pool failure in 30 days (A. Lindqvist, Jul 1). Consider raising the pool with GitHub before the Jul 13–16 starts.',
  },
  steps: [
    {
      id: 'account',
      status: 'done',
      at: 'Jul 1 · 10:04',
      duration: '36s',
      actor: 'System · run-book v4',
      note: 'ines.ferreira@kestrellabs.com',
      output: [
        'create_user  ines.ferreira@kestrellabs.com',
        'org_unit     /Engineering/Data Platform',
        'hris_link    EMP-0143 → workspace OK',
      ],
    },
    {
      id: 'email',
      status: 'done',
      at: 'Jul 1 · 10:05',
      duration: '12s',
      actor: 'System · run-book v4',
      note: 'eng@ · data-platform@ · lisbon@',
      output: [
        'mailbox      provisioned (region europe-west1)',
        'lists        eng@, data-platform@, lisbon@',
        'alias        iferreira@ → primary',
      ],
    },
    {
      id: 'sso',
      status: 'done',
      at: 'Jul 1 · 10:31',
      duration: '49s',
      actor: 'System · run-book v4',
      note: 'eng-all · github-eng · vpn-users',
      output: [
        'idp_groups   +eng-all +github-eng +vpn-users',
        'scim_push    GitHub, Figma, Slack queued',
      ],
    },
    {
      id: 'slack',
      status: 'done',
      at: 'Jul 1 · 10:32',
      duration: '8s',
      actor: 'System · run-book v4',
      note: '#eng-data · #announce · #lisbon',
      output: [
        'invite       sent — accepts on day 1',
        'channels     #eng-data, #announce, #lisbon',
        'profile      title + manager synced from HRIS',
      ],
    },
    {
      id: 'seat',
      status: 'failed',
      at: 'Jul 3 · 08:14',
      actor: 'System · run-book v4',
      note: 'seat_limit_reached — Copilot Business pool 52/52',
      output: [
        'grant_seat   member OK — base Enterprise seat reserved',
        'grant_seat   copilot_business FAILED — 52/52 assigned',
        'response     HTTP 422 seat_limit_reached',
        'next_free    contractor seat releases Sun, Jul 5',
      ],
    },
    {
      id: 'image',
      status: 'running',
      at: 'Jul 3 · 07:50',
      actor: 'System · Lisbon depot',
      note: 'KL-MBP-1063 imaging at the Lisbon depot',
      output: [
        'asset        KL-MBP-1063 (serial FVFHK338R2P9)',
        'image        eng-dev 14.2 — 72% (Xcode payload)',
        'eta          ~35 min remaining',
      ],
    },
    {
      id: 'ship',
      status: 'pending',
      actor: 'System · Lisbon depot',
      note: 'Courier pickup booked Mon, Jul 6',
      output: ['scheduled    DHL pickup Jul 6 — Lisbon office, desk 2F-14'],
    },
    {
      id: 'mdm',
      status: 'pending',
      actor: 'Tom Okonkwo',
      note: 'Enrolls at first boot after delivery',
      output: ['scheduled    automated enrollment at first boot'],
    },
    {
      id: 'day1',
      status: 'pending',
      actor: 'System · run-book v4',
      note: 'Runs automatically on Wed, Jul 8',
      output: ['scheduled    sign-in sweep on start date, Jul 8'],
    },
  ],
  log: [
    {at: 'Jul 1 · 10:04', text: 'Run kicked off early for Lisbon shipping lead time (T-5 business days).'},
    {at: 'Jul 1 · 10:32', text: 'Account, mailbox, SSO groups, and Slack completed.'},
    {at: 'Jul 3 · 07:50', text: 'KL-MBP-1063 imaging started at the Lisbon depot.'},
    {at: 'Jul 3 · 08:14', text: 'GitHub seat grant failed — Copilot Business pool 52/52.'},
    {at: 'Jul 3 · 08:15', text: 'Failure paged #it-oncall; Tom Okonkwo acknowledged.'},
  ],
};

const RUNS: Run[] = [INES_RUN, KEN_RUN, AVA_RUN];

const UPCOMING: UpcomingStart[] = [
  {
    id: 'up-ines',
    name: 'Ines Ferreira',
    role: 'Data Platform Engineer',
    department: 'Engineering',
    office: 'Lisbon',
    startLabel: 'Wed, Jul 8',
    kitId: 'eng',
    pill: {variant: 'error', label: 'Blocked · 1 step failed'},
    note: 'Run in flight — GitHub seat pool exhausted',
    runId: 'ines',
  },
  {
    id: 'up-noor',
    name: 'Noor Haddad',
    role: 'Account Manager',
    department: 'GTM',
    office: 'Remote-US',
    startLabel: 'Mon, Jul 13',
    kitId: 'gtm',
    pill: {variant: 'success', label: 'On track · laptop ordered'},
    note: 'Run kicks off Mon, Jul 6 (T-5 business days)',
  },
  {
    id: 'up-felix',
    name: 'Felix Baumann',
    role: 'Security Engineer',
    department: 'Engineering',
    office: 'SF HQ',
    startLabel: 'Thu, Jul 16',
    kitId: 'eng',
    pill: {variant: 'neutral', label: 'Queued · kicks off Jul 9'},
    note: 'Hardware reserved at the SF depot',
  },
];

/** Trailing-90-day SLA block — the single miss is Ava's GitHub-blocked run. */
const SLA = {
  day1ReadyPct: '98%',
  day1ReadyDetail: '47 of 48 runs · trailing 90 days',
  medianReadyBy: '18h before start',
  medianDuration: '3d 4h',
  missNote: '1 miss — A. Lindqvist (GitHub seat pool, Jul 1)',
};

const STATUS_META: Record<
  StepStatus,
  {
    label: string;
    icon: typeof CheckIcon;
    chip?: CSSProperties;
    tokenColor: 'green' | 'blue' | 'red' | 'gray' | 'orange';
    glyphColor: string;
  }
> = {
  done: {
    label: 'Done',
    icon: CheckIcon,
    chip: styles.stepChipDone,
    tokenColor: 'green',
    glyphColor: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  },
  running: {
    label: 'Running',
    icon: LoaderCircleIcon,
    chip: styles.stepChipRunning,
    tokenColor: 'blue',
    glyphColor: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  },
  failed: {
    label: 'Failed',
    icon: AlertTriangleIcon,
    chip: styles.stepChipFailed,
    tokenColor: 'red',
    glyphColor: 'light-dark(#DC2626, #F87171)',
  },
  pending: {
    label: 'Pending',
    icon: ClockIcon,
    tokenColor: 'gray',
    glyphColor: 'var(--color-text-secondary)',
  },
  queued: {
    label: 'Queued',
    icon: RotateCcwIcon,
    chip: styles.stepChipQueued,
    tokenColor: 'orange',
    glyphColor: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },
  skipped: {
    label: 'Skipped',
    icon: SkipForwardIcon,
    chip: styles.stepChipQueued,
    tokenColor: 'orange',
    glyphColor: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },
};

const SEG_COLOR: Record<StepStatus, string | undefined> = {
  done: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  running: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  failed: 'light-dark(#DC2626, #F87171)',
  queued: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  skipped: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  pending: undefined,
};

const RUN_OPTIONS = RUNS.map(run => ({label: run.hire, value: run.id}));

const KIT_BY_ID: Record<KitId, Kit> = {
  eng: KITS[0],
  gtm: KITS[1],
  design: KITS[2],
};

/**
 * Retry/Skip act on the one failed step; overrides are keyed
 * \`\${runId}:\${stepId}\` so state stays serializable and deterministic.
 */
type StepOverride = 'queued' | 'skipped';

interface RunView {
  run: Run;
  kit: Kit;
  steps: Array<{def: KitStep; step: RunStep; status: StepStatus}>;
  doneCount: number;
  failedCount: number;
  skippedCount: number;
  totalCount: number;
  progressLine: string;
}

function buildRunView(run: Run, overrides: Record<string, StepOverride>): RunView {
  const kit = KIT_BY_ID[run.kitId];
  const steps = kit.steps.map((def, index) => {
    const step = run.steps[index];
    const override = overrides[\`\${run.id}:\${step.id}\`];
    const status: StepStatus =
      override !== undefined && step.status === 'failed' ? override : step.status;
    return {def, step, status};
  });
  const doneCount = steps.filter(entry => entry.status === 'done').length;
  const failedCount = steps.filter(entry => entry.status === 'failed').length;
  const skippedCount = steps.filter(entry => entry.status === 'skipped').length;
  const totalCount = steps.length;
  const parts = [\`\${doneCount} of \${totalCount} done\`];
  if (failedCount > 0) parts.push(\`\${failedCount} failed\`);
  if (skippedCount > 0) parts.push(\`\${skippedCount} skipped\`);
  return {
    run,
    kit,
    steps,
    doneCount,
    failedCount,
    skippedCount,
    totalCount,
    progressLine: parts.join(' · '),
  };
}

// ---------------------------------------------------------------------------
// RAIL — active runs, upcoming starts, pinned SLA strip
// ---------------------------------------------------------------------------

function RunProgressTrack({view}: {view: RunView}) {
  return (
    <div style={styles.runProgressTrack} aria-hidden>
      {view.steps.map(entry => (
        <div
          key={entry.def.id}
          style={{
            ...styles.runProgressSeg,
            ...(SEG_COLOR[entry.status] !== undefined
              ? {backgroundColor: SEG_COLOR[entry.status]}
              : null),
          }}
        />
      ))}
    </div>
  );
}

function RunRow({
  view,
  isActive,
  onSelect,
}: {
  view: RunView;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  const {run} = view;
  return (
    <button
      type="button"
      style={{...styles.runRow, ...(isActive ? styles.runRowActive : null)}}
      aria-pressed={isActive}
      onClick={() => onSelect(run.id)}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <Avatar name={run.hire} size="small" />
          <StackItem size="fill">
            <Text type="label" maxLines={1}>
              {run.hire}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {run.role} · {run.department}
            </Text>
          </StackItem>
          {view.failedCount > 0 ? (
            <StatusDot variant="error" label="Run has a failed step" />
          ) : view.doneCount === view.totalCount ? (
            <StatusDot variant="success" label="Run complete" />
          ) : (
            <StatusDot variant="accent" label="Run in progress" />
          )}
        </HStack>
        <RunProgressTrack view={view} />
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
            {view.progressLine}
          </Text>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" maxLines={1}>
            {run.startLabel}
          </Text>
        </HStack>
      </VStack>
    </button>
  );
}

function UpcomingRow({
  entry,
  onJump,
}: {
  entry: UpcomingStart;
  onJump: (runId: string) => void;
}) {
  const kit = KIT_BY_ID[entry.kitId];
  const body = (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <Avatar name={entry.name} size="small" />
        <StackItem size="fill">
          <Text type="label" maxLines={1}>
            {entry.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {entry.role} · {entry.office}
          </Text>
        </StackItem>
        <span style={{flexShrink: 0}}>
          <Text type="supporting" color="secondary" maxLines={1}>
            {entry.startLabel}
          </Text>
        </span>
      </HStack>
      <HStack gap={1} vAlign="center" wrap="wrap">
        <Badge variant={entry.pill.variant} label={entry.pill.label} />
        <Token size="sm" color="gray" label={\`\${kit.name} \${kit.version}\`} />
      </HStack>
      <Text type="supporting" color="secondary" maxLines={1}>
        {entry.note}
      </Text>
    </VStack>
  );
  if (entry.runId !== undefined) {
    const runId = entry.runId;
    return (
      <button
        type="button"
        style={{...styles.upcomingRow, cursor: 'pointer'}}
        onClick={() => onJump(runId)}>
        {body}
      </button>
    );
  }
  return <div style={styles.upcomingRow}>{body}</div>;
}

function SlaStrip() {
  return (
    <div style={styles.railPinned}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ActivityIcon} size="xsm" color="secondary" />
          <Text type="label">Provisioning SLA</Text>
        </HStack>
        <HStack gap={4} vAlign="start">
          <VStack gap={0}>
            <Text type="supporting" color="secondary">
              Day-1 ready
            </Text>
            <span style={styles.slaValue}>
              <Text type="label" hasTabularNumbers>
                {SLA.day1ReadyPct}
              </Text>
            </span>
          </VStack>
          <VStack gap={0}>
            <Text type="supporting" color="secondary">
              Median ready-by
            </Text>
            <Text type="label" hasTabularNumbers>
              {SLA.medianReadyBy}
            </Text>
          </VStack>
          <VStack gap={0}>
            <Text type="supporting" color="secondary">
              Median run
            </Text>
            <Text type="label" hasTabularNumbers>
              {SLA.medianDuration}
            </Text>
          </VStack>
        </HStack>
        <Text type="supporting" color="secondary">
          {SLA.day1ReadyDetail}
        </Text>
        <Text type="supporting" color="secondary">
          {SLA.missNote}
        </Text>
      </VStack>
    </div>
  );
}

function RunRail({
  views,
  activeId,
  onSelect,
}: {
  views: RunView[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <VStack gap={2}>
          <div style={styles.railSectionLabel}>
            <HStack gap={2} vAlign="center">
              <Text type="label">Active runs</Text>
              <StackItem size="fill" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {views.length}
              </Text>
            </HStack>
          </div>
          {views.map(view => (
            <RunRow
              key={view.run.id}
              view={view}
              isActive={view.run.id === activeId}
              onSelect={onSelect}
            />
          ))}
          <Divider />
          <div style={styles.railSectionLabel}>
            <HStack gap={2} vAlign="center">
              <Icon icon={CalendarClockIcon} size="xsm" color="secondary" />
              <Text type="label">Upcoming starts</Text>
              <StackItem size="fill" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Next 2 weeks · {UPCOMING.length}
              </Text>
            </HStack>
          </div>
          {UPCOMING.map(entry => (
            <UpcomingRow key={entry.id} entry={entry} onJump={onSelect} />
          ))}
        </VStack>
      </div>
      <SlaStrip />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CONTENT — run header, step-chip pipeline, error region, step rows, kits
// ---------------------------------------------------------------------------

function RunHeader({view}: {view: RunView}) {
  const {run, kit} = view;
  return (
    <HStack gap={3} vAlign="center" wrap="wrap">
      <Avatar name={run.hire} size="medium" />
      <StackItem size="fill">
        <div style={styles.runHeaderMeta}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Heading level={2}>{run.hire}</Heading>
            <Token size="sm" color="gray" label={run.department} />
            <Token size="sm" color="default" label={\`\${kit.name} \${kit.version}\`} />
            {run.slaBadge !== undefined ? (
              <Badge variant={run.slaBadge.variant} label={run.slaBadge.label} />
            ) : null}
          </HStack>
          <Text type="supporting" color="secondary">
            {run.role} · {run.office} · Manager {run.manager} · Starts {run.startsOn}
          </Text>
        </div>
      </StackItem>
      <VStack gap={0}>
        <Text type="supporting" color="secondary">
          Kicked off {run.kickedOffAt}
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {run.statusLine}
        </Text>
      </VStack>
    </HStack>
  );
}

function StepChip({
  entry,
  isSelected,
  onSelect,
}: {
  entry: RunView['steps'][number];
  isSelected: boolean;
  onSelect: (stepId: string) => void;
}) {
  const meta = STATUS_META[entry.status];
  return (
    <button
      type="button"
      style={{
        ...styles.stepChip,
        ...meta.chip,
        ...(isSelected ? styles.stepChipSelected : null),
      }}
      aria-pressed={isSelected}
      aria-label={\`\${entry.def.label} — \${meta.label}\${
        entry.step.at !== undefined ? \`, \${entry.step.at}\` : ''
      }\`}
      onClick={() => onSelect(entry.def.id)}>
      <span style={{display: 'inline-flex', color: meta.glyphColor}}>
        <Icon icon={meta.icon} size="xsm" color="inherit" />
      </span>
      <Text type="supporting">{entry.def.label}</Text>
      {entry.step.at !== undefined && entry.status !== 'queued' ? (
        <span style={styles.chipTime}>{entry.step.at}</span>
      ) : null}
    </button>
  );
}

function StepPipeline({
  view,
  selectedStepId,
  onSelect,
}: {
  view: RunView;
  selectedStepId: string;
  onSelect: (stepId: string) => void;
}) {
  return (
    <div style={styles.pipelineWrap} role="list" aria-label="Provisioning steps">
      {view.steps.map(entry => (
        <div key={entry.def.id} role="listitem">
          <StepChip
            entry={entry}
            isSelected={entry.def.id === selectedStepId}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}

function FailedStepRegion({
  view,
  override,
  onRetry,
  onSkip,
}: {
  view: RunView;
  override: StepOverride | undefined;
  onRetry: () => void;
  onSkip: () => void;
}) {
  const error = view.run.error;
  if (error === undefined) {
    return null;
  }
  if (override === 'queued') {
    return (
      <Banner
        status="info"
        icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
        title="Retry queued — GitHub seat grant"
        description="Runs as soon as a Copilot Business seat frees (contractor seat releases Sun, Jul 5). The run stays blocked until the grant lands."
      />
    );
  }
  if (override === 'skipped') {
    return (
      <Banner
        status="warning"
        icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
        title="Step skipped — base seat only"
        description="Base Enterprise seat granted; the Copilot Business add-on moved to the IT backlog (IT-4837). The run continues without it."
      />
    );
  }
  const stepDef = view.kit.steps.find(step => step.id === error.stepId);
  return (
    <div style={styles.errorRegion} role="group" aria-label="Failed step detail">
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <span
            style={{display: 'inline-flex', color: 'light-dark(#DC2626, #F87171)'}}>
            <Icon icon={AlertTriangleIcon} size="sm" color="inherit" />
          </span>
          <Text type="label">
            {stepDef !== undefined ? \`\${stepDef.label} — \` : ''}
            {error.title}
          </Text>
          <span style={styles.errorCode}>{error.code}</span>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Failed Jul 3 · 08:14
          </Text>
        </HStack>
        <Text type="body">{error.detail}</Text>
        <Text type="supporting" color="secondary">
          {error.hint}
        </Text>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button
            label="Retry step"
            variant="primary"
            size="sm"
            icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
            onClick={onRetry}
          />
          <Button
            label="Skip · base seat only"
            variant="secondary"
            size="sm"
            icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
            onClick={onSkip}
          />
          <StackItem size="fill" />
          <Text type="supporting" color="secondary">
            {error.escalation}
          </Text>
        </HStack>
      </VStack>
    </div>
  );
}

function StepRow({
  entry,
  isSelected,
  onSelect,
}: {
  entry: RunView['steps'][number];
  isSelected: boolean;
  onSelect: (stepId: string) => void;
}) {
  const meta = STATUS_META[entry.status];
  return (
    <button
      type="button"
      style={{...styles.stepRow, ...(isSelected ? styles.stepRowSelected : null)}}
      aria-pressed={isSelected}
      onClick={() => onSelect(entry.def.id)}>
      <span style={{display: 'inline-flex', color: meta.glyphColor, paddingTop: 2}}>
        <Icon icon={entry.def.icon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill">
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Text type="label">{entry.def.label}</Text>
          <Token size="sm" color={meta.tokenColor} label={meta.label} />
          {entry.step.duration !== undefined && entry.step.duration !== '—' ? (
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {entry.step.duration}
            </Text>
          ) : null}
        </HStack>
        <Text type="supporting" color="secondary" maxLines={2}>
          {entry.step.note ?? entry.def.detail}
        </Text>
      </StackItem>
      <span style={styles.stepRowTime}>{entry.step.at ?? '—'}</span>
    </button>
  );
}

function KitTemplatesSection({
  selectedKitId,
  onSelectKit,
}: {
  selectedKitId: KitId;
  onSelectKit: (id: KitId) => void;
}) {
  const kit = KIT_BY_ID[selectedKitId];
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ListChecksIcon} size="xsm" color="secondary" />
        <Text type="label">Kit templates</Text>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary">
          9 steps per kit · kit-specific steps highlighted
        </Text>
      </HStack>
      <HStack gap={2} vAlign="center" wrap="wrap">
        {KITS.map(entry => (
          <button
            key={entry.id}
            type="button"
            style={{
              ...styles.kitChip,
              ...(entry.id === selectedKitId ? styles.kitChipSelected : null),
            }}
            aria-pressed={entry.id === selectedKitId}
            onClick={() => onSelectKit(entry.id)}>
            <Text type="supporting">{\`\${entry.name} \${entry.version}\`}</Text>
            <Text type="supporting" color="secondary">
              · {entry.usedByLine}
            </Text>
          </button>
        ))}
      </HStack>
      <div style={styles.kitGrid}>
        {kit.steps.map(step => (
          <span
            key={step.id}
            style={{
              ...styles.kitStepToken,
              ...(step.isKitSpecific === true ? styles.kitStepTokenUnique : null),
            }}>
            <Icon icon={step.icon} size="xsm" color="secondary" />
            {step.label}
            <Text type="supporting" color="secondary">
              — {step.detail}
            </Text>
          </span>
        ))}
      </div>
      <Text type="supporting" color="secondary">
        {kit.diffLine}
      </Text>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// END PANEL — selected step detail / run log toggle
// ---------------------------------------------------------------------------

function StepDetail({entry, run}: {entry: RunView['steps'][number]; run: Run}) {
  const meta = STATUS_META[entry.status];
  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <span style={{display: 'inline-flex', color: meta.glyphColor}}>
          <Icon icon={entry.def.icon} size="sm" color="inherit" />
        </span>
        <Text type="label">{entry.def.label}</Text>
        <Token size="sm" color={meta.tokenColor} label={meta.label} />
      </HStack>
      <MetadataList>
        <MetadataListItem label="Run">
          <Text type="body">{run.hire}</Text>
        </MetadataListItem>
        <MetadataListItem label="Timestamp">
          <Text type="body" hasTabularNumbers>
            {entry.step.at ?? 'Not started'}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Duration">
          <Text type="body" hasTabularNumbers>
            {entry.step.duration ?? '—'}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Actor">
          <Text type="body">{entry.step.actor}</Text>
        </MetadataListItem>
        <MetadataListItem label="Provisions">
          <Text type="body">{entry.def.detail}</Text>
        </MetadataListItem>
      </MetadataList>
      <VStack gap={1}>
        <Text type="label">Step output</Text>
        <div style={styles.outputBlock} tabIndex={0} aria-label="Step output log">
          {entry.step.output.map((line, index) => (
            <div key={index} style={styles.outputLine}>
              {line}
            </div>
          ))}
        </div>
      </VStack>
      {entry.step.note !== undefined ? (
        <Text type="supporting" color="secondary">
          {entry.step.note}
        </Text>
      ) : null}
    </VStack>
  );
}

function RunLog({run}: {run: Run}) {
  return (
    <VStack gap={2}>
      {run.log.map(event => (
        <div key={\`\${event.at}-\${event.text}\`} style={styles.logRow}>
          <span style={styles.logTime}>{event.at}</span>
          <Text type="supporting">{event.text}</Text>
        </div>
      ))}
      <Divider />
      <Text type="supporting" color="secondary">
        Full audit trail lives on the hire record; this log covers this
        provisioning run only.
      </Text>
    </VStack>
  );
}

function DetailPanel({
  view,
  selectedStepId,
  tab,
  onTabChange,
}: {
  view: RunView;
  selectedStepId: string;
  tab: string;
  onTabChange: (tab: string) => void;
}) {
  const entry =
    view.steps.find(step => step.def.id === selectedStepId) ?? view.steps[0];
  return (
    <div style={styles.detailSticky}>
      <VStack gap={3}>
        <SegmentedControl
          label="Detail panel view"
          value={tab}
          onChange={onTabChange}
          size="sm">
          <SegmentedControlItem label="Step" value="step" />
          <SegmentedControlItem label="Run log" value="log" />
        </SegmentedControl>
        {tab === 'step' ? (
          <StepDetail entry={entry} run={view.run} />
        ) : (
          <RunLog run={view.run} />
        )}
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function ItOnboardingProvisioningTemplate() {
  const [activeRunId, setActiveRunId] = useState<string>('ines');
  const [selectedStepIds, setSelectedStepIds] = useState<Record<string, string>>({
    ines: 'seat',
    ken: 'seat',
    ava: 'day1',
  });
  const [overrides, setOverrides] = useState<Record<string, StepOverride>>({});
  const [detailTab, setDetailTab] = useState('step');
  const [selectedKitId, setSelectedKitId] = useState<KitId>('eng');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const views = useMemo(
    () => RUNS.map(run => buildRunView(run, overrides)),
    [overrides],
  );
  const activeView = views.find(view => view.run.id === activeRunId) ?? views[0];
  const activeRun = activeView.run;
  const selectedStepId =
    selectedStepIds[activeRun.id] ?? activeView.steps[0].def.id;
  const failedOverride =
    activeRun.error !== undefined
      ? overrides[\`\${activeRun.id}:\${activeRun.error.stepId}\`]
      : undefined;

  const selectRun = (id: string) => {
    setActiveRunId(id);
  };

  const selectStep = (stepId: string) => {
    setSelectedStepIds(prev => ({...prev, [activeRun.id]: stepId}));
    setDetailTab('step');
  };

  const retryFailedStep = () => {
    const error = activeRun.error;
    if (error === undefined) return;
    setOverrides(prev => ({...prev, [\`\${activeRun.id}:\${error.stepId}\`]: 'queued'}));
    setAnnouncement(
      \`Retry queued for \${activeRun.hire}'s GitHub seat grant — runs when a Copilot seat frees on Jul 5.\`,
    );
  };

  const skipFailedStep = () => {
    const error = activeRun.error;
    if (error === undefined) return;
    setOverrides(prev => ({...prev, [\`\${activeRun.id}:\${error.stepId}\`]: 'skipped'}));
    setAnnouncement(
      \`GitHub seat step skipped for \${activeRun.hire} — base seat granted, Copilot add-on filed to the IT backlog.\`,
    );
  };

  const failedStepTotal = views.reduce(
    (total, view) => total + view.failedCount,
    0,
  );

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ZapIcon} size="md" color="secondary" />
          <Heading level={1}>Day-1 Provisioning</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · IT
          </Text>
        </HStack>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {views.length} active runs
          {failedStepTotal > 0 ? \` · \${failedStepTotal} failed step\` : ''} · next
          start Mon, Jul 6
        </Text>
        <Button
          label="New run"
          variant="primary"
          size="sm"
          icon={<Icon icon={UserRoundPlusIcon} size="sm" color="inherit" />}
        />
        {!isPanelHidden ? (
          <IconButton
            label={isPanelOpen ? 'Hide detail panel' : 'Show detail panel'}
            tooltip={isPanelOpen ? 'Hide step detail' : 'Show step detail'}
            size="sm"
            variant={isPanelOpen ? 'secondary' : 'ghost'}
            icon={<Icon icon={PanelRightIcon} size="sm" />}
            onClick={() => setIsPanelOpen(open => !open)}
          />
        ) : null}
      </HStack>
    </LayoutHeader>
  );

  const selectedEntry =
    activeView.steps.find(step => step.def.id === selectedStepId) ??
    activeView.steps[0];

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
                label="Provisioning run"
                isLabelHidden
                options={RUN_OPTIONS}
                value={activeRunId}
                onChange={value => selectRun(value)}
                size="sm"
                width={220}
              />
            ) : null}
            <RunHeader view={activeView} />
            <StepPipeline
              view={activeView}
              selectedStepId={selectedStepId}
              onSelect={selectStep}
            />
            <FailedStepRegion
              view={activeView}
              override={failedOverride}
              onRetry={retryFailedStep}
              onSkip={skipFailedStep}
            />
            <Divider />
            <VStack gap={1}>
              <HStack gap={2} vAlign="center">
                <Text type="label">Steps</Text>
                <StackItem size="fill" />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {activeView.progressLine}
                </Text>
              </HStack>
              {activeView.steps.map(entry => (
                <StepRow
                  key={entry.def.id}
                  entry={entry}
                  isSelected={entry.def.id === selectedStepId}
                  onSelect={selectStep}
                />
              ))}
            </VStack>
            {isPanelHidden ? (
              <>
                <Divider />
                <div style={styles.inlineTwoUp}>
                  <div style={styles.inlineCol}>
                    <StepDetail entry={selectedEntry} run={activeRun} />
                  </div>
                  <div style={styles.inlineCol}>
                    <VStack gap={2}>
                      <Text type="label">Run log</Text>
                      <RunLog run={activeRun} />
                    </VStack>
                  </div>
                </div>
              </>
            ) : null}
            <Divider />
            <KitTemplatesSection
              selectedKitId={selectedKitId}
              onSelectKit={setSelectedKitId}
            />
            {isCompact ? (
              <>
                <Divider />
                <VStack gap={2}>
                  <Text type="label">Upcoming starts · next 2 weeks</Text>
                  {UPCOMING.map(entry => (
                    <UpcomingRow key={entry.id} entry={entry} onJump={selectRun} />
                  ))}
                </VStack>
                <SlaStrip />
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
            <LayoutPanel width={300} padding={0} hasDivider label="Provisioning runs">
              <RunRail views={views} activeId={activeRun.id} onSelect={selectRun} />
            </LayoutPanel>
          )
        }
        content={content}
        end={
          !isPanelHidden && isPanelOpen ? (
            <LayoutPanel width={340} padding={0} hasDivider label="Run details">
              <DetailPanel
                view={activeView}
                selectedStepId={selectedStepId}
                tab={detailTab}
                onTabChange={setDetailTab}
              />
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
`;export{e as default};