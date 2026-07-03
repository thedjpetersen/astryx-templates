var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs (140-person)
 *   managed-SaaS catalog: six apps (Slack, GitHub, Figma, Notion,
 *   Salesforce, Zoom) with seat counts, per-seat pricing, group-based
 *   assignment rules, SSO posture, renewal dates, and the two in-flight
 *   hires' queued grants. Renewal countdowns are fixed day counts relative
 *   to the fixture "today" (Fri, Jul 3 2026). No clocks, no randomness,
 *   no network media.
 * @output SaaS App Catalog & Provisioning — the IT-admin surface of a
 *   workforce platform. A KPI strip (managed apps, seat utilization,
 *   monthly spend, reclaimable spend, queued grants) above a filterable,
 *   sortable grid of app cards (brand monogram tile, SSO badge, seat
 *   usage with utilization bar, monthly cost, provisioning-rule chip);
 *   a 380px selected-app panel with seat usage + queued onboarding
 *   grants, license-renewal countdown, a group-based assignment-rules
 *   table, an inactive-seat reclaim suggestion (12 idle Salesforce seats
 *   with a savings estimate and a working Reclaim action), and a
 *   deprovisioning-policy note.
 * @position Page template; emitted by \`astryx template it-app-provisioning\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (brand, search, Add app)
 *   | content (KPI strip, filter/sort toolbar, card grid scrolling)
 *   | end panel 380 (selected-app inspector, scrolls independently).
 * Container policy: catalog archetype — the card grid is the one place
 *   Cards are earned: each app is a ClickableCard tile (per the
 *   settings-extension-catalog precedent). Everything else — KPI strip,
 *   toolbar, the entire selected-app panel — is frame rows and styled
 *   divs, no Cards.
 * Color policy: token-pure everywhere except (a) the app monogram tiles,
 *   which pin real vendor brand colors as \`light-dark()\` literals with
 *   fixed white glyphs (they are brand marks, not themed surfaces), and
 *   (b) the repo-standard \`light-dark()\` fallback pairs on data-viz
 *   categorical tokens (the demo does not inject them).
 *
 * Responsive contract:
 * - > 1180px: full frame — grid auto-fills 320px-min columns + 380px panel.
 * - <= 1180px: the selected-app panel is dropped; cards keep SSO, seats,
 *   cost, and rule chips so the grid stays the source of truth.
 * - <= 860px: the header wraps; the KPI strip and toolbar wrap; the grid
 *   floor relaxes to 260px so two columns survive to phone-landscape.
 * - The card grid and the panel each scroll independently (\`minHeight: 0\`
 *   down the flex chains); the KPI strip and toolbar are pinned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArrowDownCircleIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  LayoutGridIcon,
  PlusIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UsersIcon,
  UserXIcon,
  WorkflowIcon,
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
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
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
  // KPI strip — pinned above the grid; wraps instead of clipping.
  kpiStrip: {
    flexShrink: 0,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: 'var(--spacing-4)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    rowGap: 'var(--spacing-2)',
  },
  kpiBlock: {minWidth: 132},
  kpiDivider: {
    width: 'var(--border-width)',
    alignSelf: 'stretch',
    backgroundColor: 'var(--color-border)',
    flexShrink: 0,
  },
  toolbarRow: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-4)',
  },
  gridScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-4) var(--spacing-4)',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  cardGridCompact: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  },
  // Inset ring so the selected card never bleeds onto grid neighbors.
  cardSelected: {boxShadow: 'inset 0 0 0 2px var(--color-accent)'},
  // App monogram tiles pin real vendor brand colors (light-dark literals,
  // fixed near-white glyph) — brand marks, not themed surfaces; see the
  // header Color policy block.
  monogram: {
    width: 40,
    height: 40,
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.02em',
    flexShrink: 0,
    userSelect: 'none',
  },
  monogramLg: {width: 48, height: 48, fontSize: 18},
  seatBar: {minWidth: 0, width: '100%'},
  numeric: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  costLine: {fontVariantNumeric: 'tabular-nums'},
  inactiveFlag: {
    color: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },
  // Selected-app panel ----------------------------------------------------
  panelScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  seatFigures: {alignItems: 'baseline'},
  pendingBox: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  deprovNote: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  inactiveList: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  inactiveRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  rowDivider: {
    borderTop: 'var(--border-width) solid var(--color-border)',
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

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs (140-person platform company) managed-SaaS catalog.
// Fixture "today" is Fri, Jul 3 2026; every renewal countdown below is a
// fixed day count relative to that date. Department headcounts are the
// canonical suite numbers: Engineering 52, Design 18, GTM 34, Ops 16,
// Finance 8, People 12 (= 140). Seat math reconciles everywhere:
//   assigned per app = sum of its assignment-rule seat counts;
//   monthly cost = assigned seats x per-seat price;
//   KPI totals = sums across the six apps (519 of 563 seats, $13,668/mo);
//   the 12 idle Salesforce seats x $165 = $1,980/mo ($23,760/yr) savings;
//   the 6 queued grants belong to the two in-flight hires from the
//   onboarding board (Ava Lindqvist: Slack/GitHub/Figma, overdue Jul 2;
//   Ken Tanaka: Slack/Notion/Salesforce, due Jul 3).
// ---------------------------------------------------------------------------

const AS_OF_LABEL = 'Fri, Jul 3 2026';
const IT_ADMIN = 'Tom Okonkwo';

type SsoStatus = 'enforced' | 'configured' | 'optional';
type RuleKind = 'auto' | 'manual';

/** One group-based assignment rule; a row of the panel rules table. */
interface AssignmentRule extends Record<string, unknown> {
  id: string;
  /** Okta-style group the rule targets. */
  group: string;
  /** Department(s) the group draws from — supporting line in the table. */
  scope: string;
  kind: RuleKind;
  /** Seat tier/role the rule grants. */
  role: string;
  seats: number;
  /** Seats in this rule with no sign-in for 90+ days (reclaim candidates). */
  inactive: number;
}

/** A seat queued by the onboarding workflow for an in-flight hire. */
interface PendingGrant {
  hire: string;
  dept: string;
  /** ISO date the grant is due (onboarding-board task due date). */
  dueOn: string;
  isOverdue: boolean;
}

interface SaasApp {
  id: string;
  name: string;
  vendor: string;
  plan: string;
  monogram: string;
  /** Brand tile color — light-dark literal (see Color policy). */
  tileBg: string;
  sso: SsoStatus;
  /** Provisioning-rule chip label + kind for filtering. */
  chip: {kind: RuleKind | 'mixed'; label: string};
  assigned: number;
  purchased: number;
  /** USD per seat per month; monthly cost = assigned x seatPrice. */
  seatPrice: number;
  renewsOn: string;
  /** Fixed fixture countdown relative to Jul 3 2026. */
  daysToRenewal: number;
  term: string;
  autoRenews: boolean;
  rules: AssignmentRule[];
  pending: PendingGrant[];
  deprovision: string;
  /** Where the deprovision trigger comes from (cross-pillar join). */
  deprovisionTrigger: string;
}

const AVA: Omit<PendingGrant, 'dueOn' | 'isOverdue'> = {
  hire: 'Ava Lindqvist',
  dept: 'Engineering',
};
const KEN: Omit<PendingGrant, 'dueOn' | 'isOverdue'> = {
  hire: 'Ken Tanaka',
  dept: 'GTM',
};

// Ava's grants were due Jul 2 with her onboarding "Provision Okta SSO +
// app grants" task and are overdue; Ken's are due Jul 3.
const AVA_GRANT: PendingGrant = {...AVA, dueOn: '2026-07-02', isOverdue: true};
const KEN_GRANT: PendingGrant = {...KEN, dueOn: '2026-07-03', isOverdue: false};

const APPS: SaasApp[] = [
  {
    id: 'slack',
    name: 'Slack',
    vendor: 'Salesforce Inc.',
    plan: 'Business+',
    monogram: 'Sl',
    tileBg: 'light-dark(#4A154B, #7C3085)',
    sso: 'enforced',
    chip: {kind: 'auto', label: 'Auto · all employees'},
    assigned: 140,
    purchased: 150,
    seatPrice: 8.75,
    renewsOn: '2027-02-28',
    daysToRenewal: 240,
    term: 'Annual · Mar 2026 – Feb 2027',
    autoRenews: true,
    rules: [
      {
        id: 'slack-all',
        group: 'kestrel-everyone',
        scope: 'All departments · 140 people',
        kind: 'auto',
        role: 'Member',
        seats: 140,
        inactive: 0,
      },
    ],
    pending: [AVA_GRANT, KEN_GRANT],
    deprovision:
      'Deactivate the account and sign out all sessions within 1 hour of ' +
      'termination; the seat returns to the pool immediately.',
    deprovisionTrigger: 'Runs automatically when People Ops records a termination in the HRIS.',
  },
  {
    id: 'github',
    name: 'GitHub',
    vendor: 'GitHub Inc.',
    plan: 'Enterprise Cloud',
    monogram: 'GH',
    tileBg: 'light-dark(#24292F, #57606A)',
    sso: 'enforced',
    chip: {kind: 'auto', label: 'Auto · by department'},
    assigned: 73,
    purchased: 80,
    seatPrice: 21,
    renewsOn: '2027-01-31',
    daysToRenewal: 212,
    term: 'Annual · Feb 2026 – Jan 2027',
    autoRenews: true,
    rules: [
      {
        id: 'gh-eng',
        group: 'eng-all',
        scope: 'Engineering · 52 people',
        kind: 'auto',
        role: 'Member',
        seats: 52,
        inactive: 0,
      },
      {
        id: 'gh-design',
        group: 'design-all',
        scope: 'Design · 18 people',
        kind: 'auto',
        role: 'Member',
        seats: 18,
        inactive: 0,
      },
      {
        id: 'gh-itops',
        group: 'it-admins',
        scope: 'Ops (IT) · request + approval',
        kind: 'manual',
        role: 'Owner',
        seats: 3,
        inactive: 0,
      },
    ],
    pending: [AVA_GRANT],
    deprovision:
      'Remove from the Kestrel org same-day; revoke PATs and SSH keys. ' +
      'Org-owned repos are unaffected.',
    deprovisionTrigger: 'Runs automatically when People Ops records a termination in the HRIS.',
  },

  {
    id: 'figma',
    name: 'Figma',
    vendor: 'Figma Inc.',
    plan: 'Organization',
    monogram: 'Fg',
    tileBg: 'light-dark(#D6431A, #F24E1E)',
    sso: 'enforced',
    chip: {kind: 'mixed', label: 'Auto · Design + requests'},
    assigned: 34,
    purchased: 40,
    seatPrice: 45,
    renewsOn: '2026-11-30',
    daysToRenewal: 150,
    term: 'Annual · Dec 2025 – Nov 2026',
    autoRenews: true,
    rules: [
      {
        id: 'fig-design',
        group: 'design-all',
        scope: 'Design · 18 people',
        kind: 'auto',
        role: 'Editor',
        seats: 18,
        inactive: 0,
      },
      {
        id: 'fig-eng',
        group: 'fig-eng-editors',
        scope: 'Engineering · request + approval',
        kind: 'manual',
        role: 'Editor',
        seats: 11,
        inactive: 0,
      },
      {
        id: 'fig-gtm',
        group: 'fig-gtm-editors',
        scope: 'GTM · request + approval',
        kind: 'manual',
        role: 'Editor',
        seats: 5,
        inactive: 0,
      },
    ],
    pending: [AVA_GRANT],
    deprovision:
      'Downgrade to viewer at termination; transfer owned files to the ' +
      'team lead within 7 days, then release the editor seat.',
    deprovisionTrigger: 'Runs automatically when People Ops records a termination in the HRIS.',
  },
  {
    id: 'notion',
    name: 'Notion',
    vendor: 'Notion Labs Inc.',
    plan: 'Business',
    monogram: 'No',
    tileBg: 'light-dark(#191919, #4D4D4D)',
    sso: 'configured',
    chip: {kind: 'auto', label: 'Auto · all employees'},
    assigned: 140,
    purchased: 145,
    seatPrice: 10,
    renewsOn: '2026-10-31',
    daysToRenewal: 120,
    term: 'Annual · Nov 2025 – Oct 2026',
    autoRenews: true,
    rules: [
      {
        id: 'no-all',
        group: 'kestrel-everyone',
        scope: 'All departments · 140 people',
        kind: 'auto',
        role: 'Member',
        seats: 140,
        inactive: 0,
      },
    ],
    pending: [KEN_GRANT],
    deprovision:
      'Remove workspace access within 1 hour of termination; private ' +
      'pages transfer to the manager before the seat is released.',
    deprovisionTrigger: 'Runs automatically when People Ops records a termination in the HRIS.',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    vendor: 'Salesforce Inc.',
    plan: 'Sales Cloud Enterprise',
    monogram: 'Sf',
    tileBg: 'light-dark(#0176D3, #1B96FF)',
    sso: 'optional',
    chip: {kind: 'mixed', label: 'Auto · Sales + requests'},
    assigned: 40,
    purchased: 48,
    seatPrice: 165,
    renewsOn: '2026-08-14',
    daysToRenewal: 42,
    term: 'Annual · Aug 2025 – Aug 2026',
    autoRenews: true,
    rules: [
      {
        id: 'sf-sales',
        group: 'sf-sales-am',
        scope: 'GTM (Sales & AM) · 22 people',
        kind: 'auto',
        role: 'Sales User',
        seats: 22,
        inactive: 0,
      },
      {
        id: 'sf-mktg',
        group: 'sf-marketing',
        scope: 'GTM (Marketing ops) · request',
        kind: 'manual',
        role: 'Sales User',
        seats: 12,
        inactive: 8,
      },
      {
        id: 'sf-fin',
        group: 'sf-finance',
        scope: 'Finance · request + approval',
        kind: 'manual',
        role: 'Read-write',
        seats: 4,
        inactive: 2,
      },
      {
        id: 'sf-revops',
        group: 'sf-revops',
        scope: 'Ops (RevOps) · request',
        kind: 'manual',
        role: 'Admin',
        seats: 2,
        inactive: 2,
      },
    ],
    pending: [KEN_GRANT],
    deprovision:
      'Freeze the user at termination; transfer owned accounts and open ' +
      'opportunities to the manager within 7 days, then reclaim the seat.',
    deprovisionTrigger: 'Runs automatically when People Ops records a termination in the HRIS.',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    vendor: 'Zoom Video Communications',
    plan: 'Business',
    monogram: 'Zm',
    tileBg: 'light-dark(#0B5CFF, #4C8CFF)',
    sso: 'configured',
    chip: {kind: 'manual', label: 'Manual request'},
    assigned: 92,
    purchased: 100,
    seatPrice: 15,
    renewsOn: '2027-03-31',
    daysToRenewal: 271,
    term: 'Annual · Apr 2026 – Mar 2027',
    autoRenews: false,
    rules: [
      {
        id: 'zm-req',
        group: 'zoom-licensed',
        scope: 'Any department · auto-approved',
        kind: 'manual',
        role: 'Licensed',
        seats: 92,
        inactive: 0,
      },
    ],
    pending: [],
    deprovision:
      'Move to Basic at termination; cloud recordings transfer to the ' +
      'manager after 14 days, then the licensed seat is released.',
    deprovisionTrigger: 'Runs automatically when People Ops records a termination in the HRIS.',
  },
];

// Sample rows for the Salesforce reclaim suggestion — 3 of the 12 idle
// seats, named to match the rule groups they sit in (8 Marketing ops,
// 2 Finance, 2 RevOps). Last sign-ins are all 90+ days before Jul 3.
interface InactiveSeat {
  person: string;
  group: string;
  lastSeenOn: string;
}

const SALESFORCE_INACTIVE_SAMPLE: InactiveSeat[] = [
  {person: 'Rosa Vidal', group: 'Marketing ops', lastSeenOn: '2026-03-19'},
  {person: 'Miles Archer', group: 'Marketing ops', lastSeenOn: '2026-02-27'},
  {person: 'Hana Sato', group: 'Finance', lastSeenOn: '2026-03-30'},
];

const SSO_META: Record<
  SsoStatus,
  {label: string; variant: 'success' | 'neutral' | 'warning'; icon: typeof ShieldIcon; note: string}
> = {
  enforced: {
    label: 'SSO enforced',
    variant: 'success',
    icon: ShieldCheckIcon,
    note: 'SAML via Okta — password sign-in disabled.',
  },
  configured: {
    label: 'SSO configured',
    variant: 'neutral',
    icon: ShieldIcon,
    note: 'SAML via Okta available; password sign-in still allowed.',
  },
  optional: {
    label: 'SSO optional',
    variant: 'warning',
    icon: ShieldAlertIcon,
    note: 'SAML connected but not enforced — flagged by the access review.',
  },
};

const RULE_TOKEN: Record<RuleKind | 'mixed', {color: 'blue' | 'gray' | 'purple'; icon: typeof ZapIcon}> = {
  auto: {color: 'blue', icon: ZapIcon},
  manual: {color: 'gray', icon: UsersIcon},
  mixed: {color: 'purple', icon: WorkflowIcon},
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function usd(amount: number, opts?: {cents?: boolean}): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: opts?.cents === true ? 2 : 0,
    maximumFractionDigits: opts?.cents === true ? 2 : 0,
  });
}

function monthlyCost(app: SaasApp): number {
  return app.assigned * app.seatPrice;
}

function utilizationPct(app: SaasApp): number {
  return Math.round((app.assigned / app.purchased) * 100);
}

function inactiveSeats(app: SaasApp): number {
  return app.rules.reduce((sum, rule) => sum + rule.inactive, 0);
}

/** Potential monthly savings from reclaiming every idle seat on the app. */
function reclaimableMonthly(app: SaasApp): number {
  return inactiveSeats(app) * app.seatPrice;
}

function firstName(person: string): string {
  return person.split(' ')[0];
}

function shortDate(iso: string): string {
  const [, month, day] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return \`\${months[Number(month) - 1]} \${Number(day)}\`;
}

/**
 * Full fixture date, formatted without a Date object — \`Timestamp\` parses
 * ISO midnight-UTC strings into local time and renders renewal dates a day
 * early west of UTC.
 */
function fullDate(iso: string): string {
  const [year] = iso.split('-');
  return \`\${shortDate(iso)}, \${year}\`;
}

// ---------------------------------------------------------------------------
// SMALL PIECES — monogram tile, SSO badge, rule chip, KPI block.
// ---------------------------------------------------------------------------

function MonogramTile({app, size = 'md'}: {app: SaasApp; size?: 'md' | 'lg'}) {
  return (
    <div
      aria-hidden
      style={{
        ...styles.monogram,
        ...(size === 'lg' ? styles.monogramLg : null),
        backgroundColor: app.tileBg,
      }}>
      {app.monogram}
    </div>
  );
}

function SsoBadge({sso}: {sso: SsoStatus}) {
  const meta = SSO_META[sso];
  return (
    <Badge
      variant={meta.variant}
      label={meta.label}
      icon={<Icon icon={meta.icon} size="xsm" color="inherit" />}
    />
  );
}

function RuleChip({chip}: {chip: SaasApp['chip']}) {
  const meta = RULE_TOKEN[chip.kind];
  return (
    <Token
      size="sm"
      color={meta.color}
      label={chip.label}
      icon={<Icon icon={meta.icon} size="xsm" color="inherit" />}
    />
  );
}

function KpiBlock({
  label,
  value,
  detail,
  valueStyle,
}: {
  label: string;
  value: string;
  detail: string;
  valueStyle?: CSSProperties;
}) {
  return (
    <VStack gap={0} style={styles.kpiBlock}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <Heading level={3} style={{...styles.numeric, ...valueStyle}}>
        {value}
      </Heading>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {detail}
      </Text>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// APP CARD — one catalog tile. ClickableCard so the whole tile is a single
// action target (select for the inspector panel); the tile carries SSO
// posture, seat usage + utilization bar, monthly cost, and the
// provisioning-rule chip so the grid stays useful when the panel is
// dropped below 1180px.
// ---------------------------------------------------------------------------

function AppCard({
  app,
  isSelected,
  onSelect,
}: {
  app: SaasApp;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const pct = utilizationPct(app);
  const idle = inactiveSeats(app);
  return (
    <ClickableCard
      label={\`\${app.name} — \${app.assigned} of \${app.purchased} seats, \${usd(monthlyCost(app))} per month\`}
      onClick={() => onSelect(app.id)}
      width="100%"
      padding={4}
      style={isSelected ? styles.cardSelected : undefined}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="start">
          <MonogramTile app={app} />
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <Text type="label" maxLines={1}>
                {app.name}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {app.plan}
              </Text>
            </VStack>
          </StackItem>
          <SsoBadge sso={app.sso} />
        </HStack>

        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Seats
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {app.assigned} / {app.purchased} · {pct}%
            </Text>
          </HStack>
          {/* Footgun: ProgressBar enforces minWidth 48 — pin minWidth 0 so
              the bar can never blow out a narrow grid cell. */}
          <ProgressBar
            label={\`\${app.name} seat utilization\`}
            isLabelHidden
            value={app.assigned}
            max={app.purchased}
            variant={pct >= 95 ? 'warning' : 'neutral'}
            style={styles.seatBar}
          />
        </VStack>

        <HStack gap={2} vAlign="center" wrap="wrap">
          <RuleChip chip={app.chip} />
          {app.pending.length > 0 ? (
            <Token
              size="sm"
              color={app.pending.some(grant => grant.isOverdue) ? 'orange' : 'teal'}
              label={\`\${app.pending.length} provisioning\`}
              icon={<Icon icon={ClockIcon} size="xsm" color="inherit" />}
            />
          ) : null}
          {idle > 0 ? (
            <Token
              size="sm"
              color="orange"
              label={\`\${idle} inactive\`}
              icon={<Icon icon={UserXIcon} size="xsm" color="inherit" />}
            />
          ) : null}
          <StackItem size="fill" />
          <VStack gap={0} hAlign="end">
            <Text type="label" hasTabularNumbers style={styles.costLine}>
              {usd(monthlyCost(app))}/mo
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {usd(app.seatPrice, {cents: app.seatPrice % 1 !== 0})}/seat
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </ClickableCard>
  );
}

// ---------------------------------------------------------------------------
// SELECTED-APP PANEL SECTIONS — seat usage + queued onboarding grants,
// renewal countdown, assignment-rules table, reclaim suggestion,
// deprovisioning-policy note.
// ---------------------------------------------------------------------------

function SeatUsageBlock({app}: {app: SaasApp}) {
  const pct = utilizationPct(app);
  return (
    <VStack gap={2}>
      <Text type="label">Seat usage</Text>
      <HStack gap={2} style={styles.seatFigures}>
        <Heading level={2} style={styles.numeric}>
          {app.assigned}
        </Heading>
        <Text type="body" color="secondary" hasTabularNumbers>
          of {app.purchased} purchased · {pct}%
        </Text>
      </HStack>
      <ProgressBar
        label={\`\${app.name} seats assigned\`}
        isLabelHidden
        value={app.assigned}
        max={app.purchased}
        variant={pct >= 95 ? 'warning' : 'neutral'}
        style={styles.seatBar}
      />
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {app.purchased - app.assigned} seats free ·{' '}
          {usd(monthlyCost(app))}/mo at{' '}
          {usd(app.seatPrice, {cents: app.seatPrice % 1 !== 0})}/seat
        </Text>
      </HStack>
      {app.pending.length > 0 ? (
        <VStack gap={2} style={styles.pendingBox}>
          <Text type="label" size="sm">
            Queued by onboarding
          </Text>
          {app.pending.map(grant => (
            <HStack key={grant.hire} gap={2} vAlign="center">
              <Avatar name={grant.hire} size="xsmall" />
              <StackItem size="fill" style={{minWidth: 0}}>
                <Text type="supporting" maxLines={1}>
                  {grant.hire} · {grant.dept}
                </Text>
              </StackItem>
              {grant.isOverdue ? (
                <Badge variant="error" label={\`Due \${shortDate(grant.dueOn)} · overdue\`} />
              ) : (
                <Badge variant="neutral" label={\`Due \${shortDate(grant.dueOn)}\`} />
              )}
            </HStack>
          ))}
          <Text type="supporting" color="secondary">
            Grants land with the hire&rsquo;s &ldquo;Provision Okta SSO&rdquo;
            onboarding task — seats are not billed until activation.
          </Text>
        </VStack>
      ) : null}
    </VStack>
  );
}

function RenewalBlock({app}: {app: SaasApp}) {
  const isSoon = app.daysToRenewal <= 60;
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label">License renewal</Text>
        </StackItem>
        <Badge
          variant={isSoon ? 'warning' : 'neutral'}
          label={\`\${app.daysToRenewal} days\`}
          icon={<Icon icon={CalendarClockIcon} size="xsm" color="inherit" />}
        />
      </HStack>
      <MetadataList columns={1} label={{position: 'start', width: 104}}>
        <MetadataListItem label="Renews on">
          <Text type="body" hasTabularNumbers>
            {fullDate(app.renewsOn)}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Term">
          <Text type="body">{app.term}</Text>
        </MetadataListItem>
        <MetadataListItem label="Auto-renew">
          <Text type="body">{app.autoRenews ? 'On — 30-day notice to cancel' : 'Off — PO required'}</Text>
        </MetadataListItem>
        <MetadataListItem label="Annual value">
          <Text type="body" hasTabularNumbers>
            {usd(monthlyCost(app) * 12)} at current seats
          </Text>
        </MetadataListItem>
      </MetadataList>
      {isSoon && inactiveSeats(app) > 0 ? (
        <Text type="supporting" color="secondary">
          Seat changes made before {shortDate(app.renewsOn)} apply to the
          renewal order form.
        </Text>
      ) : null}
    </VStack>
  );
}

// Assignment-rules table. Footgun: Table cells carry max-width: 0, so the
// fixed columns use pixel() (width + minWidth on the header cell).
const RULE_COLUMNS: TableColumn<AssignmentRule>[] = [
  {
    key: 'group',
    header: 'Group',
    width: proportional(1, {minWidth: 120}),
    renderCell: (rule: AssignmentRule) => (
      <VStack gap={0}>
        <Text type="label" size="sm" maxLines={1}>
          {rule.group}
        </Text>
        <Text type="supporting" color="secondary" maxLines={1}>
          {rule.scope}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'kind',
    header: 'Rule',
    width: pixel(86),
    renderCell: (rule: AssignmentRule) => (
      <Token
        size="sm"
        color={rule.kind === 'auto' ? 'blue' : 'gray'}
        label={rule.kind === 'auto' ? 'Auto' : 'Manual'}
      />
    ),
  },
  {
    key: 'seats',
    header: 'Seats',
    align: 'end',
    width: pixel(72),
    renderCell: (rule: AssignmentRule) => (
      <VStack gap={0} hAlign="end">
        <Text type="body" hasTabularNumbers style={styles.numeric}>
          {rule.seats}
        </Text>
        {rule.inactive > 0 ? (
          <Text type="supporting" hasTabularNumbers style={styles.inactiveFlag}>
            {rule.inactive} idle
          </Text>
        ) : null}
      </VStack>
    ),
  },
];

function RulesTable({app}: {app: SaasApp}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label">Assignment rules</Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {app.rules.length} {app.rules.length === 1 ? 'rule' : 'rules'} ·{' '}
          {app.assigned} seats
        </Text>
      </HStack>
      <Table<AssignmentRule>
        data={app.rules}
        columns={RULE_COLUMNS}
        idKey="id"
        density="compact"
        dividers="rows"
      />
      <Text type="supporting" color="secondary">
        Auto rules grant on start date from HRIS group membership; manual
        seats need an IT approval in the request queue.
      </Text>
    </VStack>
  );
}

function ReclaimSuggestion({
  app,
  isReclaimed,
  onReclaim,
}: {
  app: SaasApp;
  isReclaimed: boolean;
  onReclaim: (appId: string) => void;
}) {
  const idle = inactiveSeats(app);
  if (isReclaimed) {
    return (
      <Banner
        status="success"
        icon={<Icon icon={CheckCircle2Icon} size="sm" color="inherit" />}
        title="12 idle seats reclaimed"
        description={\`$1,980/mo returned to the pool — the \${shortDate(app.renewsOn)} renewal order form drops to \${app.assigned} seats.\`}
      />
    );
  }
  if (idle === 0) {
    return null;
  }
  const monthly = reclaimableMonthly(app);
  return (
    <Banner
      status="warning"
      icon={<Icon icon={UserXIcon} size="sm" color="inherit" />}
      title={\`\${idle} inactive seats flagged\`}
      description={\`No \${app.name} sign-in for 90+ days. Reclaiming before the \${shortDate(app.renewsOn)} renewal saves \${usd(monthly)}/mo (\${usd(monthly * 12)}/yr).\`}
      defaultIsExpanded>
      <VStack gap={3}>
        <div style={styles.inactiveList}>
          {SALESFORCE_INACTIVE_SAMPLE.map((seat, index) => (
            <div
              key={seat.person}
              style={{
                ...styles.inactiveRow,
                ...(index > 0 ? styles.rowDivider : null),
              }}>
              <Avatar name={seat.person} size="xsmall" />
              <StackItem size="fill" style={{minWidth: 0}}>
                <Text type="supporting" maxLines={1}>
                  {seat.person} · {seat.group}
                </Text>
              </StackItem>
              <Text
                type="supporting"
                color="secondary"
                hasTabularNumbers
                style={styles.numeric}>
                Last seen {shortDate(seat.lastSeenOn)}
              </Text>
            </div>
          ))}
          <div style={{...styles.inactiveRow, ...styles.rowDivider}}>
            <Text type="supporting" color="secondary">
              + {idle - SALESFORCE_INACTIVE_SAMPLE.length} more flagged by the
              access review
            </Text>
          </div>
        </div>
        <HStack gap={2} vAlign="center">
          <Button
            label={\`Reclaim \${idle} seats\`}
            variant="secondary"
            size="sm"
            icon={<Icon icon={ArrowDownCircleIcon} size="sm" />}
            onClick={() => onReclaim(app.id)}
          />
          <Button
            label="Export list"
            variant="ghost"
            size="sm"
            icon={<Icon icon={DownloadIcon} size="sm" />}
          />
        </HStack>
      </VStack>
    </Banner>
  );
}

function DeprovisionNote({app}: {app: SaasApp}) {
  return (
    <div style={styles.deprovNote}>
      <Icon icon={UserXIcon} size="sm" color="secondary" />
      <StackItem size="fill">
        <VStack gap={1}>
          <Text type="label" size="sm">
            Deprovisioning policy
          </Text>
          <Text type="supporting" color="secondary">
            {app.deprovision}
          </Text>
          <Text type="supporting" color="secondary">
            {app.deprovisionTrigger}
          </Text>
        </VStack>
      </StackItem>
    </div>
  );
}

function AppDetailPanel({
  app,
  isReclaimed,
  onReclaim,
}: {
  app: SaasApp | null;
  isReclaimed: boolean;
  onReclaim: (appId: string) => void;
}) {
  if (app === null) {
    return (
      <div style={styles.panelScroll}>
        <EmptyState
          isCompact
          icon={<Icon icon={LayoutGridIcon} size="lg" />}
          title="No app selected"
          description="Select an app card to see seats, rules, renewal, and deprovisioning."
        />
      </div>
    );
  }
  const meta = SSO_META[app.sso];
  return (
    <div style={styles.panelScroll}>
      <VStack gap={4}>
        <HStack gap={3} vAlign="center">
          <MonogramTile app={app} size="lg" />
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <Heading level={3}>{app.name}</Heading>
              <Text type="supporting" color="secondary" maxLines={1}>
                {app.vendor} · {app.plan}
              </Text>
            </VStack>
          </StackItem>
        </HStack>

        <HStack gap={2} vAlign="center" wrap="wrap">
          <SsoBadge sso={app.sso} />
          <RuleChip chip={app.chip} />
        </HStack>
        <Text type="supporting" color="secondary">
          {meta.note} App owner: {IT_ADMIN} (IT).
        </Text>

        <Divider />
        <SeatUsageBlock app={app} />
        <Divider />
        <RenewalBlock app={app} />
        <ReclaimSuggestion app={app} isReclaimed={isReclaimed} onReclaim={onReclaim} />
        <Divider />
        <RulesTable app={app} />
        <Divider />
        <DeprovisionNote app={app} />
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type RuleFilter = 'all' | 'auto' | 'manual';
type SortKey = 'cost' | 'name' | 'utilization';

const SORT_OPTIONS = [
  {value: 'cost', label: 'Sort: Monthly cost'},
  {value: 'name', label: 'Sort: Name'},
  {value: 'utilization', label: 'Sort: Utilization'},
];

/** \`mixed\` apps carry both auto and manual rules, so they match either filter. */
function matchesRuleFilter(app: SaasApp, filter: RuleFilter): boolean {
  if (filter === 'all') {
    return true;
  }
  return app.chip.kind === filter || app.chip.kind === 'mixed';
}

export default function ItAppProvisioningTemplate() {
  const [apps, setApps] = useState<SaasApp[]>(APPS);
  const [selectedId, setSelectedId] = useState<string | null>('salesforce');
  const [query, setQuery] = useState('');
  const [ruleFilter, setRuleFilter] = useState<RuleFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('cost');
  const [reclaimedIds, setReclaimedIds] = useState<Set<string>>(new Set());
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px drops the selected-app panel (the grid
  // keeps SSO/seats/cost/rule chips); <=860px wraps the header and KPI
  // strip and relaxes the grid floor to 260px.
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  // Filter + sort, derived during render.
  const visibleApps = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = apps.filter(app => {
      if (!matchesRuleFilter(app, ruleFilter)) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return \`\${app.name} \${app.vendor} \${app.plan}\`.toLowerCase().includes(needle);
    });
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortKey === 'utilization') {
        return utilizationPct(b) - utilizationPct(a);
      }
      return monthlyCost(b) - monthlyCost(a);
    });
  }, [apps, query, ruleFilter, sortKey]);

  // KPI totals — live sums so the reclaim action moves every number that
  // repeats it: 6 apps, 519/563 seats (92%), $13,668/mo, $1,980/mo
  // reclaimable, 6 queued grants.
  const totals = useMemo(() => {
    const assigned = apps.reduce((sum, app) => sum + app.assigned, 0);
    const purchased = apps.reduce((sum, app) => sum + app.purchased, 0);
    const monthly = apps.reduce((sum, app) => sum + monthlyCost(app), 0);
    const reclaimable = apps.reduce((sum, app) => sum + reclaimableMonthly(app), 0);
    const queued = apps.reduce((sum, app) => sum + app.pending.length, 0);
    return {assigned, purchased, monthly, reclaimable, queued};
  }, [apps]);

  const selectedApp = apps.find(app => app.id === selectedId) ?? null;

  const reclaimSeats = (appId: string) => {
    const target = apps.find(app => app.id === appId);
    if (target === undefined) {
      return;
    }
    const idle = inactiveSeats(target);
    const saved = reclaimableMonthly(target);
    setApps(prev =>
      prev.map(app =>
        app.id === appId
          ? {
              ...app,
              assigned: app.assigned - idle,
              rules: app.rules.map(rule => ({
                ...rule,
                seats: rule.seats - rule.inactive,
                inactive: 0,
              })),
            }
          : app,
      ),
    );
    setReclaimedIds(prev => new Set(prev).add(appId));
    setAnnouncement(
      \`Reclaimed \${idle} \${target.name} seats — \${usd(saved)} per month returned to the pool\`,
    );
  };

  // ----- header: brand, search, Add app -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={LayoutGridIcon} size="md" color="secondary" />
          <Heading level={1}>App Catalog</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · IT
          </Text>
        </HStack>
        <StackItem size="fill">
          <TextInput
            label="Search apps"
            isLabelHidden
            size="sm"
            width="100%"
            style={{maxWidth: 480}}
            placeholder="Search apps, vendors, plans…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        <Button
          label="Add app"
          variant="primary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- KPI strip: totals that reconcile with the cards below -----
  const kpiStrip = (
    <div style={styles.kpiStrip}>
      <KpiBlock
        label="Managed apps"
        value={String(apps.length)}
        detail="SSO via Okta on all 6"
      />
      <div style={styles.kpiDivider} aria-hidden />
      <KpiBlock
        label="Seats assigned"
        value={\`\${totals.assigned} / \${totals.purchased}\`}
        detail={\`\${Math.round((totals.assigned / totals.purchased) * 100)}% utilization\`}
      />
      <div style={styles.kpiDivider} aria-hidden />
      <KpiBlock
        label="Monthly spend"
        value={usd(totals.monthly)}
        detail={\`\${usd(totals.monthly * 12)} annualized\`}
      />
      <div style={styles.kpiDivider} aria-hidden />
      <KpiBlock
        label="Reclaimable"
        value={\`\${usd(totals.reclaimable)}/mo\`}
        detail={
          totals.reclaimable > 0
            ? '12 idle Salesforce seats'
            : 'No idle seats flagged'
        }
        valueStyle={totals.reclaimable > 0 ? styles.inactiveFlag : undefined}
      />
      <div style={styles.kpiDivider} aria-hidden />
      <KpiBlock
        label="Queued grants"
        value={String(totals.queued)}
        detail="2 in-flight hires"
      />
      {!isCompact ? (
        <>
          <StackItem size="fill" />
          <VStack gap={0} hAlign="end">
            <Text type="supporting" color="secondary">
              As of {AS_OF_LABEL}
            </Text>
            <Text type="supporting" color="secondary">
              Admin: {IT_ADMIN}
            </Text>
          </VStack>
        </>
      ) : null}
    </div>
  );

  // ----- toolbar: provisioning-rule filter, count, sort -----
  const toolbar = (
    <HStack gap={3} vAlign="center" wrap="wrap" style={styles.toolbarRow}>
      <SegmentedControl
        label="Provisioning rule filter"
        value={ruleFilter}
        onChange={value => setRuleFilter(value as RuleFilter)}
        size="sm">
        <SegmentedControlItem label="All" value="all" />
        <SegmentedControlItem label="Auto" value="auto" />
        <SegmentedControlItem label="Manual" value="manual" />
      </SegmentedControl>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {visibleApps.length} of {apps.length} apps
      </Text>
      <StackItem size="fill" />
      <Selector
        label="Sort apps"
        isLabelHidden
        options={SORT_OPTIONS}
        value={sortKey}
        onChange={value => setSortKey(value as SortKey)}
        size="sm"
        width={188}
      />
    </HStack>
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
              {kpiStrip}
              <Divider />
              {toolbar}
              <div style={styles.gridScroll}>
                {visibleApps.length === 0 ? (
                  <EmptyState
                    isCompact
                    icon={<Icon icon={SearchIcon} size="lg" />}
                    title="No matching apps"
                    description="Try a different name, vendor, or provisioning filter."
                  />
                ) : (
                  <div
                    style={{
                      ...styles.cardGrid,
                      ...(isCompact ? styles.cardGridCompact : null),
                    }}>
                    {visibleApps.map(app => (
                      <AppCard
                        key={app.id}
                        app={app}
                        isSelected={app.id === selectedId}
                        onSelect={setSelectedId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isPanelHidden ? (
            <LayoutPanel width={380} padding={0} hasDivider label="App details">
              <AppDetailPanel
                app={selectedApp}
                isReclaimed={selectedApp !== null && reclaimedIds.has(selectedApp.id)}
                onReclaim={reclaimSeats}
              />
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
`;export{e as default};