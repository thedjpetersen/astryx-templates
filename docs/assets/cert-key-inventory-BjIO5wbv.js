var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (15 TLS certificates across four owning
 *   teams — Edge Platform, Payments, Internal Tools, Data Platform — with
 *   fixed ISO issued/expires dates, issuing CAs, key algorithms, serials,
 *   fingerprints, SAN lists, and deployment locations; a fixed 2026-07-01
 *   status date; two certs already expired and three inside the 30-day
 *   window)
 * @output TLS lifecycle console: summary tiles for healthy / expiring-soon /
 *   expired counts that double as status filters, a controls row with a
 *   Table/Timeline view SegmentedControl plus toggleable CA, status, and
 *   team filter chips with live counts and a clear-filters affordance, a
 *   sortable certificate table (expiry countdown Badges, issuer, covered
 *   domains, key, deployment counts), an alternate horizontal expiry
 *   timeline (lanes by team, CSS bars positioned by validity window on a
 *   shared px-per-day scale, dashed status-date line), a 340px detail
 *   drawer rendering the chain (root > intermediate > leaf), fingerprint
 *   copy feedback, and the deployment list, and a three-step rotate wizard
 *   modal (choose CA, key size, confirm) whose confirm updates the cert's
 *   expiry date, countdown badge, timeline bar, chain, and summary tiles in
 *   one pass with a one-level undo
 * @position Page template; emitted by \`astryx template cert-key-inventory\`
 *
 * Frame: Layout height="fill", zero page scroll. LayoutHeader carries the
 * console title and inventory caption. LayoutContent stacks the summary
 * tiles and the view/filter controls row over the active view: the table is
 * a vertically scrolling grid of row buttons; the timeline is a fixed
 * 160px team column (120px compact) beside a horizontally scrolling canvas
 * where the quarter axis, validity bars, and the dashed Jul 1 status-date
 * line all derive from one px-per-day scale. LayoutPanel end 340 holds the
 * certificate detail drawer and opens on row/bar selection. The rotate
 * wizard is a Dialog over everything.
 *
 * Interaction contract:
 * - View toggle: Table/Timeline SegmentedControl; both views read the same
 *   filtered set so every filter applies identically to each.
 * - Filters: status, CA, and team chips toggle independently and combine;
 *   the "N of 15 shown" caption and a clear-filters button track them, and
 *   the summary tiles are pressable aliases for the status chips.
 * - Sorting: the Certificate and Expires column headers toggle asc/desc
 *   without losing the current selection.
 * - Selection: any table row or timeline bar selects a cert and opens the
 *   drawer; the drawer renders the derived chain for the cert's current CA
 *   plus its deployments, and the fingerprint copy button flips its Tooltip
 *   to "Copied" with a timed reset.
 * - Rotate wizard: choose CA (validity period shown per option), choose key
 *   size, confirm a before/after summary. Confirm re-issues the cert as of
 *   the status date — expiry, countdown badge, timeline bar position, chain,
 *   serial/fingerprint, and all three summary tiles recompute in one pass —
 *   and the drawer offers a one-level undo that restores the prior cert.
 *
 * Responsive contract:
 * - >960px: header | tiles + controls | active view (fill) | detail drawer
 *   340 (opens on selection, closes via its header X).
 * - <=960px (single-pane fallback for the docked drawer): the drawer leaves
 *   the frame; selecting a cert swaps the whole content region to a
 *   full-width detail view with a 40px back IconButton. The table also
 *   drops its Key and Deployments columns at this width.
 * - <=640px: summary tiles wrap two-up (flex-basis floor), filter chips and
 *   the back button grow to 40px touch targets, table rows restack as
 *   two-line entries (name + countdown badge over issuer · team) so no
 *   horizontal scroll is needed at 375px, the timeline team column narrows
 *   to 120px, and the wizard Dialog caps at min(560px, 92vw).
 * - The timeline canvas scrolls horizontally at every width by design (the
 *   four-year window is ~1460px at 1px/day) while the team column stays
 *   fixed; no hover-only affordances — rows, bars, tiles, and chips are
 *   real buttons and the fingerprint Tooltip also opens on focus.
 *
 * Container policy (ops-console archetype): frame-first rows and panels;
 * the only Cards are the three summary tiles. The timeline axis, lanes, and
 * validity bars are styled divs/buttons — CSS colors and fixture date math,
 * never chart libraries, clocks, or network images.
 *
 * Color policy: no scheme-locked surfaces. Team swatches and status
 * line/track hues are explicit light-dark() pairs (same hue, lighter dark
 * variant; translucent tracks via color-mix over the pair); everything else
 * uses Astryx var(--color-*) tokens.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  FilterXIcon,
  GlobeIcon,
  KeyRoundIcon,
  LockIcon,
  RotateCwIcon,
  ServerIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldXIcon,
  Undo2Icon,
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
import {Badge} from '@astryxdesign/core/Badge';
import type {BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Code} from '@astryxdesign/core/Code';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= DATE MATH =============
// Fixture math over fixed ISO strings — no Date objects, no clocks. The
// day-number epoch is 2024-01-01; every year in play (2024–2028) follows
// the simple mod-4 leap rule.

const TODAY = '2026-07-01'; // fixed status date — never a clock

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_STARTS: number[] = MONTH_DAYS.reduce<number[]>(
  (starts, _days, i) => {
    starts.push(i === 0 ? 0 : starts[i - 1] + MONTH_DAYS[i - 1]);
    return starts;
  },
  [],
);
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const EPOCH_YEAR = 2024;

function isLeap(year: number): boolean {
  return year % 4 === 0; // exact for 2024–2028
}

/** '2026-07-01' -> days since 2024-01-01. */
function dayNumber(iso: string): number {
  const year = Number(iso.slice(0, 4));
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  let n = 0;
  for (let y = EPOCH_YEAR; y < year; y++) {
    n += isLeap(y) ? 366 : 365;
  }
  n += MONTH_STARTS[month - 1] + (month > 2 && isLeap(year) ? 1 : 0);
  return n + (day - 1);
}

/** Inverse of dayNumber: fixed-epoch serial day back to an ISO string. */
function isoFromDayNumber(serial: number): string {
  let remaining = serial;
  let year = EPOCH_YEAR;
  for (;;) {
    const yearDays = isLeap(year) ? 366 : 365;
    if (remaining < yearDays) {
      break;
    }
    remaining -= yearDays;
    year += 1;
  }
  let month = 0;
  for (; month < 12; month++) {
    const monthDays = MONTH_DAYS[month] + (month === 1 && isLeap(year) ? 1 : 0);
    if (remaining < monthDays) {
      break;
    }
    remaining -= monthDays;
  }
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(remaining + 1).padStart(2, '0');
  return \`\${year}-\${mm}-\${dd}\`;
}

function addDays(iso: string, delta: number): string {
  return isoFromDayNumber(dayNumber(iso) + delta);
}

/** '2026-07-01' -> 'Jul 1, 2026'. */
function formatDate(iso: string): string {
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  return \`\${MONTH_LABELS[month - 1]} \${day}, \${iso.slice(0, 4)}\`;
}

const TODAY_DAY = dayNumber(TODAY);

// ============= FIXTURES =============

type CAId = 'lets-encrypt' | 'digicert' | 'globalsign' | 'internal';
type TeamId = 'edge' | 'payments' | 'tools' | 'data';
type CertStatus = 'healthy' | 'expiring' | 'expired';
type KeyAlg = 'RSA 2048' | 'RSA 3072' | 'EC P-256';

interface CAMeta {
  id: CAId;
  name: string;
  short: string;
  root: string;
  intermediate: string;
  /** Leaf validity a re-issue from this CA gets, in days. */
  validityDays: number;
  wizardNote: string;
}

const CA_ORDER: CAId[] = ['lets-encrypt', 'digicert', 'globalsign', 'internal'];

const CA_META: Record<CAId, CAMeta> = {
  'lets-encrypt': {
    id: 'lets-encrypt',
    name: "Let's Encrypt",
    short: 'LE',
    root: 'ISRG Root X1',
    intermediate: "Let's Encrypt R11",
    validityDays: 90,
    wizardNote: 'Free ACME issuance · 90-day leaf, auto-renew required',
  },
  digicert: {
    id: 'digicert',
    name: 'DigiCert',
    short: 'DigiCert',
    root: 'DigiCert Global Root G2',
    intermediate: 'DigiCert TLS RSA SHA256 2020 CA1',
    validityDays: 365,
    wizardNote: 'OV issuance on the enterprise contract · 1-year leaf',
  },
  globalsign: {
    id: 'globalsign',
    name: 'GlobalSign',
    short: 'GlobalSign',
    root: 'GlobalSign Root R6',
    intermediate: 'GlobalSign Atlas R6 TLS CA 2026',
    validityDays: 365,
    wizardNote: 'Atlas API issuance · 1-year leaf',
  },
  internal: {
    id: 'internal',
    name: 'Helios Internal CA',
    short: 'Internal',
    root: 'Helios Root CA 2030',
    intermediate: 'Helios Issuing CA 03',
    validityDays: 730,
    wizardNote: 'Private trust only — mTLS and *.helios.internal · 2-year leaf',
  },
};

interface TeamMeta {
  id: TeamId;
  name: string;
  color: string;
}

const TEAMS: TeamMeta[] = [
  {id: 'edge', name: 'Edge Platform', color: 'light-dark(#6366F1, #818CF8)'},
  {id: 'payments', name: 'Payments', color: 'light-dark(#EC4899, #F472B6)'},
  {id: 'tools', name: 'Internal Tools', color: 'light-dark(#14B8A6, #2DD4BF)'},
  {id: 'data', name: 'Data Platform', color: 'light-dark(#F97316, #FB923C)'},
];

const TEAM_META: Record<TeamId, TeamMeta> = Object.fromEntries(
  TEAMS.map(team => [team.id, team]),
) as Record<TeamId, TeamMeta>;

interface Deployment {
  id: string;
  name: string;
  kind: 'ALB' | 'CDN' | 'Ingress' | 'Gateway' | 'Service mesh';
  location: string;
}

interface Cert {
  id: string;
  commonName: string;
  team: TeamId;
  ca: CAId;
  keyAlg: KeyAlg;
  issuedOn: string;
  expiresOn: string;
  serial: string;
  fingerprint: string; // SHA-256, first eight bytes shown
  domains: string[];
  deployments: Deployment[];
  /** Bumped by the rotate wizard; >0 renders the "Rotated" badge. */
  rotations: number;
}

// 15 certs: two already expired (checkout, grafana), three inside the
// 30-day window (www, pay, admin) against the fixed 2026-07-01 status date.
const CERTS: Cert[] = [
  {
    id: 'cert-api',
    commonName: 'api.helios.dev',
    team: 'edge',
    ca: 'lets-encrypt',
    keyAlg: 'EC P-256',
    issuedOn: '2026-05-12',
    expiresOn: '2026-08-10',
    serial: '4a:1f:88:c2:7d:03:b6:51',
    fingerprint: '9c:e2:41:0b:57:aa:1d:83',
    domains: ['api.helios.dev', '*.api.helios.dev'],
    deployments: [
      {id: 'dep-api-1', name: 'edge-alb-01', kind: 'ALB', location: 'us-east-1'},
      {id: 'dep-api-2', name: 'edge-alb-02', kind: 'ALB', location: 'eu-west-1'},
    ],
    rotations: 0,
  },
  {
    id: 'cert-www',
    commonName: 'www.helios.dev',
    team: 'edge',
    ca: 'lets-encrypt',
    keyAlg: 'EC P-256',
    issuedOn: '2026-04-20',
    expiresOn: '2026-07-19',
    serial: '7b:e0:15:9a:44:c8:2f:d1',
    fingerprint: '3f:8a:c7:12:96:5e:b0:24',
    domains: ['www.helios.dev', 'helios.dev'],
    deployments: [
      {id: 'dep-www-1', name: 'marketing-cdn', kind: 'CDN', location: 'global'},
    ],
    rotations: 0,
  },
  {
    id: 'cert-cdn',
    commonName: 'cdn.helios.dev',
    team: 'edge',
    ca: 'digicert',
    keyAlg: 'RSA 2048',
    issuedOn: '2025-08-01',
    expiresOn: '2026-08-31',
    serial: '2d:9c:63:f7:18:be:05:4a',
    fingerprint: 'ab:04:d9:66:2c:f1:78:e5',
    domains: ['cdn.helios.dev', 'assets.helios.dev', 'static.helios.dev'],
    deployments: [
      {id: 'dep-cdn-1', name: 'asset-cdn', kind: 'CDN', location: 'global'},
      {id: 'dep-cdn-2', name: 'edge-alb-01', kind: 'ALB', location: 'us-east-1'},
    ],
    rotations: 0,
  },
  {
    id: 'cert-edge-mtls',
    commonName: 'edge-mtls.helios.internal',
    team: 'edge',
    ca: 'internal',
    keyAlg: 'EC P-256',
    issuedOn: '2025-01-15',
    expiresOn: '2027-01-15',
    serial: 'c1:07:5e:92:3b:6d:f0:88',
    fingerprint: '61:bd:33:fa:08:47:9c:d2',
    domains: ['edge-mtls.helios.internal'],
    deployments: [
      {
        id: 'dep-mtls-1',
        name: 'mesh-gateway',
        kind: 'Service mesh',
        location: 'us-east-1',
      },
      {
        id: 'dep-mtls-2',
        name: 'mesh-gateway',
        kind: 'Service mesh',
        location: 'eu-west-1',
      },
    ],
    rotations: 0,
  },
  {
    id: 'cert-pay',
    commonName: 'pay.helios.dev',
    team: 'payments',
    ca: 'digicert',
    keyAlg: 'RSA 2048',
    issuedOn: '2025-07-10',
    expiresOn: '2026-07-25',
    serial: '90:44:af:1e:c3:72:58:0b',
    fingerprint: 'de:17:82:4c:a9:30:65:fb',
    domains: ['pay.helios.dev'],
    deployments: [
      {id: 'dep-pay-1', name: 'pay-alb', kind: 'ALB', location: 'us-east-1'},
      {id: 'dep-pay-2', name: 'pay-alb-dr', kind: 'ALB', location: 'us-west-2'},
    ],
    rotations: 0,
  },
  {
    id: 'cert-checkout',
    commonName: 'checkout.helios.dev',
    team: 'payments',
    ca: 'digicert',
    keyAlg: 'RSA 2048',
    issuedOn: '2025-06-01',
    expiresOn: '2026-06-21',
    serial: '5f:2b:d8:07:96:e4:31:ca',
    fingerprint: '48:0e:f5:9d:71:b2:c6:03',
    domains: ['checkout.helios.dev', 'buy.helios.dev'],
    deployments: [
      {
        id: 'dep-checkout-1',
        name: 'checkout-alb',
        kind: 'ALB',
        location: 'us-east-1',
      },
    ],
    rotations: 0,
  },
  {
    id: 'cert-vault',
    commonName: 'vault.pay.helios.internal',
    team: 'payments',
    ca: 'internal',
    keyAlg: 'RSA 3072',
    issuedOn: '2024-09-30',
    expiresOn: '2026-09-30',
    serial: 'e8:3d:70:b5:29:fc:46:17',
    fingerprint: '12:c4:6b:e9:53:88:0f:a7',
    domains: ['vault.pay.helios.internal'],
    deployments: [
      {
        id: 'dep-vault-1',
        name: 'vault-ingress',
        kind: 'Ingress',
        location: 'pci-cluster-1',
      },
    ],
    rotations: 0,
  },
  {
    id: 'cert-webhooks',
    commonName: 'webhooks.pay.helios.dev',
    team: 'payments',
    ca: 'globalsign',
    keyAlg: 'EC P-256',
    issuedOn: '2025-11-05',
    expiresOn: '2026-12-05',
    serial: '36:a9:14:df:80:5c:eb:72',
    fingerprint: 'f0:59:27:81:ce:4a:b3:16',
    domains: ['webhooks.pay.helios.dev'],
    deployments: [
      {
        id: 'dep-webhooks-1',
        name: 'webhook-gw',
        kind: 'Gateway',
        location: 'us-east-1',
      },
    ],
    rotations: 0,
  },
  {
    id: 'cert-admin',
    commonName: 'admin.helios.dev',
    team: 'tools',
    ca: 'lets-encrypt',
    keyAlg: 'EC P-256',
    issuedOn: '2026-04-08',
    expiresOn: '2026-07-07',
    serial: 'aa:60:3c:97:e1:2b:54:f8',
    fingerprint: '85:d1:4e:70:b9:2f:c8:33',
    domains: ['admin.helios.dev'],
    deployments: [
      {
        id: 'dep-admin-1',
        name: 'admin-ingress',
        kind: 'Ingress',
        location: 'tools-cluster',
      },
    ],
    rotations: 0,
  },
  {
    id: 'cert-grafana',
    commonName: 'grafana.helios.internal',
    team: 'tools',
    ca: 'internal',
    keyAlg: 'RSA 2048',
    issuedOn: '2025-03-22',
    expiresOn: '2026-03-22',
    serial: '19:f2:85:4b:d6:0e:73:ac',
    fingerprint: '6e:38:aa:05:91:dc:47:b0',
    domains: ['grafana.helios.internal', 'alerts.helios.internal'],
    deployments: [
      {
        id: 'dep-grafana-1',
        name: 'obs-ingress',
        kind: 'Ingress',
        location: 'tools-cluster',
      },
    ],
    rotations: 0,
  },
  {
    id: 'cert-ci',
    commonName: 'ci.helios.internal',
    team: 'tools',
    ca: 'internal',
    keyAlg: 'RSA 3072',
    issuedOn: '2026-02-14',
    expiresOn: '2028-02-14',
    serial: '73:0a:ce:58:b1:94:2d:e6',
    fingerprint: 'c9:72:06:ed:38:5b:a4:1f',
    domains: ['ci.helios.internal', 'artifacts.helios.internal'],
    deployments: [
      {
        id: 'dep-ci-1',
        name: 'ci-ingress',
        kind: 'Ingress',
        location: 'build-cluster',
      },
      {
        id: 'dep-ci-2',
        name: 'runner-mesh',
        kind: 'Service mesh',
        location: 'build-cluster',
      },
    ],
    rotations: 0,
  },
  {
    id: 'cert-wiki',
    commonName: 'wiki.helios.internal',
    team: 'tools',
    ca: 'internal',
    keyAlg: 'RSA 2048',
    issuedOn: '2026-01-09',
    expiresOn: '2027-01-09',
    serial: 'b4:8e:21:6f:d0:37:9a:55',
    fingerprint: '20:97:cb:44:ef:63:1a:88',
    domains: ['wiki.helios.internal'],
    deployments: [
      {
        id: 'dep-wiki-1',
        name: 'wiki-ingress',
        kind: 'Ingress',
        location: 'tools-cluster',
      },
    ],
    rotations: 0,
  },
  {
    id: 'cert-warehouse',
    commonName: 'warehouse.data.helios.internal',
    team: 'data',
    ca: 'internal',
    keyAlg: 'RSA 3072',
    issuedOn: '2025-10-01',
    expiresOn: '2027-10-01',
    serial: '0c:d7:49:a2:65:1b:f8:3e',
    fingerprint: '57:e6:90:2a:bd:14:78:c3',
    domains: ['warehouse.data.helios.internal'],
    deployments: [
      {
        id: 'dep-wh-1',
        name: 'warehouse-lb',
        kind: 'ALB',
        location: 'us-east-1',
      },
    ],
    rotations: 0,
  },
  {
    id: 'cert-kafka',
    commonName: 'kafka.data.helios.internal',
    team: 'data',
    ca: 'internal',
    keyAlg: 'EC P-256',
    issuedOn: '2026-03-30',
    expiresOn: '2027-03-30',
    serial: '68:35:fb:0d:c4:a1:92:7e',
    fingerprint: 'e4:0b:76:c1:59:8d:23:fa',
    domains: ['kafka.data.helios.internal', '*.brokers.helios.internal'],
    deployments: [
      {
        id: 'dep-kafka-1',
        name: 'broker-mesh',
        kind: 'Service mesh',
        location: 'data-cluster-1',
      },
      {
        id: 'dep-kafka-2',
        name: 'broker-mesh',
        kind: 'Service mesh',
        location: 'data-cluster-2',
      },
    ],
    rotations: 0,
  },
  {
    id: 'cert-metrics',
    commonName: 'metrics.data.helios.dev',
    team: 'data',
    ca: 'globalsign',
    keyAlg: 'EC P-256',
    issuedOn: '2025-09-18',
    expiresOn: '2026-10-18',
    serial: 'd2:41:8a:36:ef:70:1c:b9',
    fingerprint: '3a:c8:12:f7:64:09:de:51',
    domains: ['metrics.data.helios.dev'],
    deployments: [
      {
        id: 'dep-metrics-1',
        name: 'metrics-gw',
        kind: 'Gateway',
        location: 'us-east-1',
      },
    ],
    rotations: 0,
  },
];

// ============= STATUS DERIVATION =============

interface StatusMeta {
  label: string;
  tileLabel: string;
  badge: BadgeVariant;
  /** Timeline bar border + chip dot. */
  line: string;
  /** Translucent timeline bar background. */
  track: string;
  icon: typeof ShieldCheckIcon;
}

const STATUS_ORDER: CertStatus[] = ['expiring', 'expired', 'healthy'];

const STATUS_META: Record<CertStatus, StatusMeta> = {
  healthy: {
    label: 'Healthy',
    tileLabel: 'Healthy',
    badge: 'success',
    line: 'light-dark(#22C55E, #4ADE80)',
    track: 'color-mix(in srgb, light-dark(#22C55E, #4ADE80) 18%, transparent)',
    icon: ShieldCheckIcon,
  },
  expiring: {
    label: 'Expiring ≤30d',
    tileLabel: 'Expiring soon',
    badge: 'warning',
    line: 'light-dark(#F59E0B, #FBBF24)',
    track: 'color-mix(in srgb, light-dark(#F59E0B, #FBBF24) 20%, transparent)',
    icon: ShieldAlertIcon,
  },
  expired: {
    label: 'Expired',
    tileLabel: 'Expired',
    badge: 'error',
    line: 'light-dark(#EF4444, #F87171)',
    track: 'color-mix(in srgb, light-dark(#EF4444, #F87171) 20%, transparent)',
    icon: ShieldXIcon,
  },
};

function daysLeft(cert: Cert): number {
  return dayNumber(cert.expiresOn) - TODAY_DAY;
}

function certStatus(cert: Cert): CertStatus {
  const left = daysLeft(cert);
  if (left < 0) {
    return 'expired';
  }
  if (left <= 30) {
    return 'expiring';
  }
  return 'healthy';
}

function countdownLabel(cert: Cert): string {
  const left = daysLeft(cert);
  return left < 0 ? \`Expired \${-left}d ago\` : \`\${left}d left\`;
}

/** Deterministic "re-issue": bump the first byte of a colon-hex string so a
 * rotated cert visibly gets a new serial and fingerprint. */
function bumpHex(value: string): string {
  const first = (parseInt(value.slice(0, 2), 16) + 1) % 256;
  return first.toString(16).padStart(2, '0') + value.slice(2);
}

// ============= TIMELINE GEOMETRY =============

const TL_START = '2024-07-01';
const TL_END = '2028-06-30';
const TL_START_DAY = dayNumber(TL_START);
const TL_END_DAY = dayNumber(TL_END);
const TL_DAYS = TL_END_DAY - TL_START_DAY + 1;
const PX_PER_DAY = 1;
const TL_WIDTH = TL_DAYS * PX_PER_DAY;

const AXIS_H = 28;
const TL_ROW_H = 36;
const TL_BAR_H = 22;
const TL_EMPTY_LANE_H = 40;
const TEAM_COL_W = 160;
const TEAM_COL_W_COMPACT = 120;

const MONO = 'var(--font-family-code, monospace)';

interface QuarterCell {
  label: string;
  left: number;
  width: number;
}

/** Quarter cells across the fixed four-year window, clamped to its edges. */
const QUARTER_CELLS: QuarterCell[] = (() => {
  const cells: QuarterCell[] = [];
  for (let year = 2024; year <= 2028; year++) {
    for (let quarter = 0; quarter < 4; quarter++) {
      const startIso = \`\${year}-\${String(quarter * 3 + 1).padStart(2, '0')}-01\`;
      const endIso =
        quarter === 3
          ? \`\${year + 1}-01-01\`
          : \`\${year}-\${String(quarter * 3 + 4).padStart(2, '0')}-01\`;
      const start = dayNumber(startIso);
      const endExclusive = dayNumber(endIso);
      if (endExclusive <= TL_START_DAY || start > TL_END_DAY) {
        continue;
      }
      const clampedStart = Math.max(start, TL_START_DAY);
      const clampedEnd = Math.min(endExclusive, TL_END_DAY + 1);
      cells.push({
        label: \`Q\${quarter + 1} '\${String(year).slice(2)}\`,
        left: (clampedStart - TL_START_DAY) * PX_PER_DAY,
        width: (clampedEnd - clampedStart) * PX_PER_DAY,
      });
    }
  }
  return cells;
})();

const TODAY_X = (TODAY_DAY - TL_START_DAY) * PX_PER_DAY;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  mono: {fontFamily: MONO},
  // Summary tiles: wrap two-up on phones via the flex-basis floor.
  tilesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-4) 0',
  },
  tileButton: {
    flex: '1 1 150px',
    minWidth: 0,
    padding: 0,
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
  },
  tileActive: {
    borderRadius: 'var(--radius-container)',
    boxShadow: '0 0 0 2px var(--color-accent)',
  },
  // Controls row: view toggle left, filter chips wrap after it.
  controlsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-2) var(--spacing-3)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  chipGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 28,
    paddingInline: 10,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-primary)',
  },
  chipActive: {
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  chipDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  // <=640px: grow chips and the back button to 40px touch targets.
  tapTarget: {minWidth: 40, minHeight: 40},
  viewFill: {flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'},
  scrollY: {flex: 1, minHeight: 0, overflowY: 'auto'},
  // ---- table ----
  tableHead: {
    display: 'grid',
    gap: 'var(--spacing-2)',
    alignItems: 'center',
    padding: 'var(--spacing-1) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  headButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-secondary)',
  },
  tableRow: {
    display: 'grid',
    gap: 'var(--spacing-2)',
    alignItems: 'center',
    width: '100%',
    padding: 'var(--spacing-2) var(--spacing-4)',
    border: 'none',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-primary)',
  },
  tableRowSelected: {
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 3px 0 0 var(--color-accent)',
  },
  cellClamp: {minWidth: 0, overflow: 'hidden'},
  // <=640px stacked row: two lines, no grid, no horizontal scroll.
  stackRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    width: '100%',
    padding: 'var(--spacing-2) var(--spacing-4)',
    border: 'none',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-primary)',
  },
  // ---- timeline ----
  tlBody: {flex: 1, minHeight: 0, display: 'flex', overflowY: 'auto'},
  teamCol: {
    flexShrink: 0,
    borderRight: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
  },
  teamColSpacer: {
    height: AXIS_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  teamCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  teamSwatch: {width: 8, height: 8, borderRadius: 2, flexShrink: 0},
  tlScroll: {flex: 1, minWidth: 0, overflowX: 'auto', overflowY: 'hidden'},
  tlCanvas: {position: 'relative', width: TL_WIDTH},
  tlAxis: {
    position: 'relative',
    height: AXIS_H,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  quarterCell: {
    position: 'absolute',
    top: 0,
    height: AXIS_H,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: '0.05em',
    color: 'var(--color-text-secondary)',
    userSelect: 'none',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  tlLane: {
    position: 'relative',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  tlBar: {
    position: 'absolute',
    height: TL_BAR_H,
    minWidth: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: 0,
    overflow: 'hidden',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
  },
  tlBarLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 8,
    fontSize: 11,
    color: 'var(--color-text-primary)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    pointerEvents: 'none',
  },
  todayLine: {
    position: 'absolute',
    top: 0,
    width: 0,
    borderLeft: '2px dashed var(--color-accent)',
    opacity: 0.7,
    pointerEvents: 'none',
    zIndex: 1,
  },
  todayPill: {
    position: 'absolute',
    top: 4,
    transform: 'translateX(-50%)',
    fontFamily: MONO,
    fontSize: 9,
    lineHeight: '14px',
    paddingInline: 5,
    borderRadius: 999,
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-background-body)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    zIndex: 2,
  },
  emptyState: {padding: 'var(--spacing-8) var(--spacing-4)', textAlign: 'center'},
  // ---- drawer ----
  panelScroll: {height: '100%', overflowY: 'auto', padding: 'var(--spacing-3)'},
  panelEmpty: {paddingTop: 'var(--spacing-8)', textAlign: 'center'},
  chainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  detailPane: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  detailPaneColumn: {maxWidth: 560, marginInline: 'auto'},
  // ---- rotate wizard ----
  optionButton: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-primary)',
  },
  optionButtonActive: {
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  optionCheck: {width: 20, flexShrink: 0, paddingTop: 2},
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: MONO,
    fontSize: 11,
    flexShrink: 0,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  stepDotActive: {
    backgroundColor: 'var(--color-accent)',
    borderColor: 'var(--color-accent)',
    color: 'var(--color-background-body)',
  },
  diffRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    flexWrap: 'wrap',
  },
};

const COPY_RESET_MS = 1800;

// Table grid templates. Desktop: cert | team | issuer | key | expires |
// deploys. <=960px drops Key and Deployments; <=640px restacks entirely.
const GRID_FULL =
  'minmax(150px, 2fr) minmax(90px, 1fr) minmax(96px, 1fr) 80px minmax(132px, max-content) 64px';
const GRID_NARROW =
  'minmax(160px, 2fr) minmax(96px, 1fr) minmax(132px, max-content)';

// ============= SMALL PIECES =============

function CountdownBadge({cert}: {cert: Cert}) {
  return (
    <Badge
      variant={STATUS_META[certStatus(cert)].badge}
      label={countdownLabel(cert)}
    />
  );
}

function FilterChip({
  label,
  count,
  dotColor,
  isActive,
  isCompact,
  onToggle,
}: {
  label: string;
  count: number;
  dotColor?: string;
  isActive: boolean;
  isCompact: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      style={{
        ...styles.chip,
        ...(isCompact ? styles.tapTarget : undefined),
        ...(isActive ? styles.chipActive : undefined),
      }}
      aria-pressed={isActive}
      aria-label={\`Filter \${label}, \${count} certificates\`}
      onClick={onToggle}>
      {dotColor != null && (
        <span style={{...styles.chipDot, backgroundColor: dotColor}} aria-hidden />
      )}
      <Text type="supporting" color={isActive ? 'primary' : 'secondary'}>
        {label} · {count}
      </Text>
    </button>
  );
}

function SummaryTile({
  status,
  count,
  isActive,
  onToggle,
}: {
  status: CertStatus;
  count: number;
  isActive: boolean;
  onToggle: () => void;
}) {
  const meta = STATUS_META[status];
  return (
    <button
      type="button"
      style={styles.tileButton}
      aria-pressed={isActive}
      aria-label={\`\${meta.tileLabel}: \${count} certificates. \${
        isActive ? 'Filter active — press to clear.' : 'Press to filter.'
      }\`}
      onClick={onToggle}>
      <div style={isActive ? styles.tileActive : undefined}>
        <Card padding={3}>
          <HStack gap={2} vAlign="center">
            <Icon
              icon={meta.icon}
              size="md"
              color={
                status === 'healthy'
                  ? 'success'
                  : status === 'expiring'
                    ? 'warning'
                    : 'error'
              }
            />
            <VStack gap={0}>
              <Text type="body" weight="semibold" style={styles.mono}>
                {count}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {meta.tileLabel}
              </Text>
            </VStack>
          </HStack>
        </Card>
      </div>
    </button>
  );
}

// ============= DETAIL DRAWER =============

/** Drawer body shared by the 340px docked panel (>960px) and the
 * single-pane fallback view (<=960px). The chain derives from the cert's
 * current CA, so a rotation re-renders it automatically. */
function CertDetail({
  cert,
  isCopied,
  canUndo,
  onCopy,
  onRotate,
  onUndo,
}: {
  cert: Cert;
  isCopied: boolean;
  canUndo: boolean;
  onCopy: () => void;
  onRotate: () => void;
  onUndo: () => void;
}) {
  const status = certStatus(cert);
  const meta = STATUS_META[status];
  const ca = CA_META[cert.ca];
  const team = TEAM_META[cert.team];
  const chain = [
    {label: 'Root', name: ca.root, icon: LockIcon, indent: 0},
    {label: 'Intermediate', name: ca.intermediate, icon: LockIcon, indent: 16},
    {label: 'Leaf', name: cert.commonName, icon: GlobeIcon, indent: 32},
  ];

  return (
    <VStack gap={3}>
      <Card padding={3}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="body" weight="semibold" maxLines={2}>
                {cert.commonName}
              </Text>
            </StackItem>
            <Badge label={meta.label} variant={meta.badge} />
          </HStack>
          <HStack gap={2} vAlign="center">
            <span
              style={{...styles.teamSwatch, backgroundColor: team.color}}
              aria-hidden
            />
            <Text type="supporting" color="secondary">
              {team.name} · {ca.name}
            </Text>
          </HStack>
          <HStack gap={2} vAlign="center">
            <CountdownBadge cert={cert} />
            {cert.rotations > 0 && (
              <Badge variant="blue" label="Rotated this session" />
            )}
          </HStack>
        </VStack>
      </Card>

      {canUndo && (
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Re-issued as of {formatDate(TODAY)}.
            </Text>
          </StackItem>
          <Button
            label="Undo rotation"
            variant="ghost"
            size="sm"
            icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
            onClick={onUndo}
          />
        </HStack>
      )}

      <VStack gap={1}>
        <Text type="label" color="secondary">
          Validity
        </Text>
        <Text type="supporting">
          {formatDate(cert.issuedOn)} – {formatDate(cert.expiresOn)}
        </Text>
        <Text type="supporting" color="secondary">
          {cert.keyAlg} · serial{' '}
          <span style={styles.mono}>{cert.serial}</span>
        </Text>
      </VStack>

      <VStack gap={1}>
        <Text type="label" color="secondary">
          SHA-256 fingerprint
        </Text>
        <HStack gap={1} vAlign="center">
          <StackItem size="fill">
            <div style={styles.cellClamp}>
              <Text type="code" color="secondary" maxLines={1}>
                {cert.fingerprint}…
              </Text>
            </div>
          </StackItem>
          <Tooltip content={isCopied ? 'Copied' : 'Copy fingerprint'}>
            <IconButton
              label={\`Copy fingerprint for \${cert.commonName}\`}
              size="sm"
              variant="ghost"
              icon={<Icon icon={CopyIcon} size="sm" />}
              onClick={() => {
                // Clipboard write is best-effort in the demo sandbox; the
                // Tooltip flip is the visible contract.
                void navigator.clipboard
                  ?.writeText(cert.fingerprint)
                  .catch(() => undefined);
                onCopy();
              }}
            />
          </Tooltip>
        </HStack>
      </VStack>

      <Divider />

      <VStack gap={1}>
        <Text type="label" color="secondary">
          Chain
        </Text>
        {chain.map(link => (
          <div
            key={link.label}
            style={{...styles.chainRow, paddingLeft: link.indent}}>
            <Icon
              icon={link.icon}
              size="sm"
              color={link.label === 'Leaf' ? 'primary' : 'secondary'}
            />
            <div style={styles.cellClamp}>
              <Text type="supporting" maxLines={1}>
                {link.name}
              </Text>
            </div>
            <Text type="supporting" color="secondary">
              {link.label}
            </Text>
          </div>
        ))}
      </VStack>

      <VStack gap={1}>
        <Text type="label" color="secondary">
          Covered domains
        </Text>
        {cert.domains.map(domain => (
          <HStack key={domain} gap={2} vAlign="center">
            <Icon icon={GlobeIcon} size="sm" color="secondary" />
            <Code>{domain}</Code>
          </HStack>
        ))}
      </VStack>

      <Divider />

      <VStack gap={1}>
        <Text type="label" color="secondary">
          Deployed to · {cert.deployments.length}
        </Text>
        {cert.deployments.map(deployment => (
          <HStack key={deployment.id} gap={2} vAlign="center">
            <Icon icon={ServerIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text type="supporting" maxLines={1}>
                {deployment.name}
              </Text>
            </StackItem>
            <Badge variant="neutral" label={deployment.kind} />
            <Text type="supporting" color="secondary" style={styles.mono}>
              {deployment.location}
            </Text>
          </HStack>
        ))}
      </VStack>

      <Button
        label="Rotate certificate"
        variant="primary"
        icon={<Icon icon={RotateCwIcon} size="sm" color="inherit" />}
        onClick={onRotate}
      />
    </VStack>
  );
}

// ============= WIZARD OPTION ROW =============

function WizardOption({
  title,
  note,
  isSelected,
  onSelect,
}: {
  title: string;
  note: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      style={{
        ...styles.optionButton,
        ...(isSelected ? styles.optionButtonActive : undefined),
      }}
      aria-pressed={isSelected}
      onClick={onSelect}>
      <span style={styles.optionCheck} aria-hidden>
        {isSelected && <Icon icon={CheckIcon} size="sm" color="primary" />}
      </span>
      <VStack gap={0}>
        <Text type="body" weight="semibold">
          {title}
        </Text>
        <Text type="supporting" color="secondary">
          {note}
        </Text>
      </VStack>
    </button>
  );
}

// ============= PAGE =============

type ViewMode = 'table' | 'timeline';
type SortKey = 'name' | 'expiry';
type WizardStep = 1 | 2 | 3;

const KEY_OPTIONS: Array<{value: KeyAlg; note: string}> = [
  {value: 'EC P-256', note: 'Modern default — small handshakes, fast signing'},
  {value: 'RSA 2048', note: 'Broadest client compatibility'},
  {value: 'RSA 3072', note: 'Long-lived internal trust — larger, slower'},
];

export default function CertKeyInventoryTemplate() {
  // <=960px: the drawer leaves the frame; selection swaps the content
  // region to a single-pane detail view. <=640px: stacked table rows and
  // 40px chips/back button.
  const isNarrow = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  const [certs, setCerts] = useState<Cert[]>(CERTS);
  const [view, setView] = useState<ViewMode>('table');
  const [selectedId, setSelectedId] = useState<string | null>('cert-checkout');

  // Filters: empty set = facet inactive (show everything).
  const [statusFilter, setStatusFilter] = useState<ReadonlySet<CertStatus>>(
    () => new Set(),
  );
  const [caFilter, setCaFilter] = useState<ReadonlySet<CAId>>(() => new Set());
  const [teamFilter, setTeamFilter] = useState<ReadonlySet<TeamId>>(
    () => new Set(),
  );

  const [sortKey, setSortKey] = useState<SortKey>('expiry');
  const [sortAsc, setSortAsc] = useState(true);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Rotate wizard + one-level undo of the latest rotation.
  const [rotateTargetId, setRotateTargetId] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [wizardCA, setWizardCA] = useState<CAId>('digicert');
  const [wizardKey, setWizardKey] = useState<KeyAlg>('EC P-256');
  const [lastRotation, setLastRotation] = useState<{
    certId: string;
    previous: Cert;
  } | null>(null);

  // ---- derived: counts, filters, sorting ----
  const statusCounts = useMemo(() => {
    const counts: Record<CertStatus, number> = {
      healthy: 0,
      expiring: 0,
      expired: 0,
    };
    for (const cert of certs) {
      counts[certStatus(cert)] += 1;
    }
    return counts;
  }, [certs]);

  const caCounts = useMemo(() => {
    const counts = {} as Record<CAId, number>;
    for (const id of CA_ORDER) {
      counts[id] = certs.filter(cert => cert.ca === id).length;
    }
    return counts;
  }, [certs]);

  const teamCounts = useMemo(() => {
    const counts = {} as Record<TeamId, number>;
    for (const team of TEAMS) {
      counts[team.id] = certs.filter(cert => cert.team === team.id).length;
    }
    return counts;
  }, [certs]);

  const filtered = useMemo(
    () =>
      certs.filter(
        cert =>
          (statusFilter.size === 0 || statusFilter.has(certStatus(cert))) &&
          (caFilter.size === 0 || caFilter.has(cert.ca)) &&
          (teamFilter.size === 0 || teamFilter.has(cert.team)),
      ),
    [certs, statusFilter, caFilter, teamFilter],
  );

  const sorted = useMemo(() => {
    const next = [...filtered];
    next.sort((a, b) => {
      const delta =
        sortKey === 'name'
          ? a.commonName.localeCompare(b.commonName)
          : dayNumber(a.expiresOn) - dayNumber(b.expiresOn);
      return sortAsc ? delta : -delta;
    });
    return next;
  }, [filtered, sortKey, sortAsc]);

  const hasFilters =
    statusFilter.size > 0 || caFilter.size > 0 || teamFilter.size > 0;

  const selected = certs.find(cert => cert.id === selectedId) ?? null;
  const rotateTarget = certs.find(cert => cert.id === rotateTargetId) ?? null;

  // ---- handlers ----
  function toggleSetMember<T>(
    set: ReadonlySet<T>,
    value: T,
  ): ReadonlySet<T> {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    return next;
  }

  const toggleStatus = (status: CertStatus) =>
    setStatusFilter(prev => toggleSetMember(prev, status));
  const toggleCA = (ca: CAId) => setCaFilter(prev => toggleSetMember(prev, ca));
  const toggleTeam = (team: TeamId) =>
    setTeamFilter(prev => toggleSetMember(prev, team));

  const clearFilters = () => {
    setStatusFilter(new Set());
    setCaFilter(new Set());
    setTeamFilter(new Set());
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(prev => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const markCopied = (id: string) => {
    setCopiedId(id);
    setTimeout(() => {
      // Only clear if another copy hasn't taken over the feedback slot.
      setCopiedId(current => (current === id ? null : current));
    }, COPY_RESET_MS);
  };

  const openWizard = (cert: Cert) => {
    setRotateTargetId(cert.id);
    setWizardStep(1);
    setWizardCA(cert.ca);
    setWizardKey(cert.keyAlg);
  };

  const confirmRotation = () => {
    if (rotateTarget == null) {
      return;
    }
    setLastRotation({certId: rotateTarget.id, previous: rotateTarget});
    setCerts(prev =>
      prev.map(cert =>
        cert.id === rotateTarget.id
          ? {
              ...cert,
              ca: wizardCA,
              keyAlg: wizardKey,
              issuedOn: TODAY,
              expiresOn: addDays(TODAY, CA_META[wizardCA].validityDays),
              serial: bumpHex(cert.serial),
              fingerprint: bumpHex(cert.fingerprint),
              rotations: cert.rotations + 1,
            }
          : cert,
      ),
    );
    setRotateTargetId(null);
    setSelectedId(rotateTarget.id);
  };

  const undoRotation = () => {
    if (lastRotation == null) {
      return;
    }
    setCerts(prev =>
      prev.map(cert =>
        cert.id === lastRotation.certId ? lastRotation.previous : cert,
      ),
    );
    setLastRotation(null);
  };

  // ---- header ----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center">
        <Icon icon={KeyRoundIcon} size="md" color="secondary" />
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={1}>Certificate &amp; key inventory</Heading>
            {!isCompact && (
              <Text type="supporting" color="secondary">
                {certs.length} certificates · 4 teams · status{' '}
                {formatDate(TODAY)}
              </Text>
            )}
          </VStack>
        </StackItem>
        <Badge
          variant={statusCounts.expired > 0 ? 'error' : 'success'}
          label={
            statusCounts.expired > 0
              ? \`\${statusCounts.expired} expired\`
              : 'All valid'
          }
        />
      </HStack>
    </LayoutHeader>
  );

  // ---- summary tiles ----
  const tiles = (
    <div style={styles.tilesRow} role="group" aria-label="Certificate status summary">
      {(['healthy', 'expiring', 'expired'] as CertStatus[]).map(status => (
        <SummaryTile
          key={status}
          status={status}
          count={statusCounts[status]}
          isActive={statusFilter.has(status)}
          onToggle={() => toggleStatus(status)}
        />
      ))}
    </div>
  );

  // ---- controls row: view toggle + filter chips ----
  const controls = (
    <div style={styles.controlsRow}>
      <SegmentedControl
        value={view}
        onChange={value => setView(value as ViewMode)}
        label="Inventory view"
        size="sm">
        <SegmentedControlItem value="table" label="Table" />
        <SegmentedControlItem value="timeline" label="Timeline" />
      </SegmentedControl>
      <div style={styles.chipGroup} role="group" aria-label="Status filters">
        {STATUS_ORDER.map(status => (
          <FilterChip
            key={status}
            label={STATUS_META[status].label}
            count={statusCounts[status]}
            dotColor={STATUS_META[status].line}
            isActive={statusFilter.has(status)}
            isCompact={isCompact}
            onToggle={() => toggleStatus(status)}
          />
        ))}
      </div>
      <div style={styles.chipGroup} role="group" aria-label="CA filters">
        {CA_ORDER.map(ca => (
          <FilterChip
            key={ca}
            label={CA_META[ca].short}
            count={caCounts[ca]}
            isActive={caFilter.has(ca)}
            isCompact={isCompact}
            onToggle={() => toggleCA(ca)}
          />
        ))}
      </div>
      <div style={styles.chipGroup} role="group" aria-label="Team filters">
        {TEAMS.map(team => (
          <FilterChip
            key={team.id}
            label={team.name}
            count={teamCounts[team.id]}
            dotColor={team.color}
            isActive={teamFilter.has(team.id)}
            isCompact={isCompact}
            onToggle={() => toggleTeam(team.id)}
          />
        ))}
      </div>
      <Text type="supporting" color="secondary" style={styles.mono}>
        {filtered.length} of {certs.length} shown
      </Text>
      {hasFilters && (
        <Button
          label="Clear filters"
          variant="ghost"
          size="sm"
          icon={<Icon icon={FilterXIcon} size="sm" color="inherit" />}
          onClick={clearFilters}
        />
      )}
    </div>
  );

  const emptyState = (
    <div style={styles.emptyState}>
      <VStack gap={2} hAlign="center">
        <Text type="body" weight="semibold">
          No certificates match these filters
        </Text>
        <Button label="Clear filters" variant="ghost" onClick={clearFilters} />
      </VStack>
    </div>
  );

  // ---- table view ----
  const gridTemplate = isNarrow ? GRID_NARROW : GRID_FULL;

  const sortHeader = (key: SortKey, label: string) => (
    <button
      type="button"
      style={styles.headButton}
      aria-label={\`Sort by \${label}, currently \${
        sortKey === key ? (sortAsc ? 'ascending' : 'descending') : 'inactive'
      }\`}
      onClick={() => toggleSort(key)}>
      <Text type="label" color="secondary">
        {label}
      </Text>
      <Icon
        icon={
          sortKey === key
            ? sortAsc
              ? ArrowUpIcon
              : ArrowDownIcon
            : ArrowUpDownIcon
        }
        size="sm"
        color={sortKey === key ? 'primary' : 'secondary'}
      />
    </button>
  );

  const tableView = (
    <div style={styles.scrollY}>
      {!isCompact && (
        <div style={{...styles.tableHead, gridTemplateColumns: gridTemplate}}>
          {sortHeader('name', 'Certificate')}
          <Text type="label" color="secondary">
            Team
          </Text>
          <Text type="label" color="secondary">
            Issuer
          </Text>
          {!isNarrow && (
            <Text type="label" color="secondary">
              Key
            </Text>
          )}
          {sortHeader('expiry', 'Expires')}
          {!isNarrow && (
            <Text type="label" color="secondary">
              Deploys
            </Text>
          )}
        </div>
      )}
      {sorted.length === 0
        ? emptyState
        : sorted.map(cert => {
            const isSelected = cert.id === selectedId;
            const team = TEAM_META[cert.team];
            const rowLabel = \`\${cert.commonName}, \${team.name}, \${
              CA_META[cert.ca].name
            }, \${countdownLabel(cert)}\`;
            if (isCompact) {
              // <=640px stacked row: name + countdown over issuer · team,
              // so 375px viewports never scroll horizontally.
              return (
                <button
                  key={cert.id}
                  type="button"
                  style={{
                    ...styles.stackRow,
                    ...(isSelected ? styles.tableRowSelected : undefined),
                  }}
                  aria-pressed={isSelected}
                  aria-label={rowLabel}
                  onClick={() => setSelectedId(cert.id)}>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <div style={styles.cellClamp}>
                        <Text type="body" weight="semibold" maxLines={1}>
                          {cert.commonName}
                        </Text>
                      </div>
                    </StackItem>
                    <CountdownBadge cert={cert} />
                  </HStack>
                  <HStack gap={1} vAlign="center">
                    <span
                      style={{...styles.teamSwatch, backgroundColor: team.color}}
                      aria-hidden
                    />
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {CA_META[cert.ca].short} · {team.name} · expires{' '}
                      {formatDate(cert.expiresOn)}
                    </Text>
                  </HStack>
                </button>
              );
            }
            return (
              <button
                key={cert.id}
                type="button"
                style={{
                  ...styles.tableRow,
                  gridTemplateColumns: gridTemplate,
                  ...(isSelected ? styles.tableRowSelected : undefined),
                }}
                aria-pressed={isSelected}
                aria-label={rowLabel}
                onClick={() => setSelectedId(cert.id)}>
                <div style={styles.cellClamp}>
                  <VStack gap={0}>
                    <Text type="body" weight="semibold" maxLines={1}>
                      {cert.commonName}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {cert.domains.join(', ')}
                    </Text>
                  </VStack>
                </div>
                <HStack gap={1} vAlign="center">
                  <span
                    style={{...styles.teamSwatch, backgroundColor: team.color}}
                    aria-hidden
                  />
                  <div style={styles.cellClamp}>
                    <Text type="supporting" maxLines={1}>
                      {team.name}
                    </Text>
                  </div>
                </HStack>
                <div style={styles.cellClamp}>
                  <Text type="supporting" maxLines={1}>
                    {CA_META[cert.ca].name}
                  </Text>
                </div>
                {!isNarrow && (
                  <Text type="supporting" color="secondary" style={styles.mono}>
                    {cert.keyAlg}
                  </Text>
                )}
                <VStack gap={0.5}>
                  <CountdownBadge cert={cert} />
                  <Text type="supporting" color="secondary" style={styles.mono}>
                    {formatDate(cert.expiresOn)}
                  </Text>
                </VStack>
                {!isNarrow && (
                  <Text type="supporting" color="secondary" style={styles.mono}>
                    {cert.deployments.length}
                  </Text>
                )}
              </button>
            );
          })}
    </div>
  );

  // ---- timeline view ----
  // Lanes by team; each filtered cert gets its own row inside its lane, and
  // every bar spans issued → expires on the shared px-per-day scale.
  const teamColW = isCompact ? TEAM_COL_W_COMPACT : TEAM_COL_W;
  const laneCerts: Record<TeamId, Cert[]> = {
    edge: [],
    payments: [],
    tools: [],
    data: [],
  };
  for (const cert of sorted) {
    laneCerts[cert.team].push(cert);
  }
  const laneHeights: Record<TeamId, number> = {
    edge: 0,
    payments: 0,
    tools: 0,
    data: 0,
  };
  let lanesTotal = 0;
  for (const team of TEAMS) {
    const height =
      laneCerts[team.id].length === 0
        ? TL_EMPTY_LANE_H
        : laneCerts[team.id].length * TL_ROW_H;
    laneHeights[team.id] = height;
    lanesTotal += height;
  }

  const timelineView =
    sorted.length === 0 ? (
      emptyState
    ) : (
      <div style={styles.tlBody}>
        {/* Fixed team column — never scrolls horizontally; heights mirror
            the lane stack exactly. */}
        <div style={{...styles.teamCol, width: teamColW}}>
          <div style={styles.teamColSpacer}>
            <Text type="supporting" color="secondary" style={styles.mono}>
              Team
            </Text>
          </div>
          {TEAMS.map(team => (
            <div
              key={team.id}
              style={{...styles.teamCell, height: laneHeights[team.id]}}>
              <span
                style={{...styles.teamSwatch, backgroundColor: team.color}}
                aria-hidden
              />
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="body" weight="semibold" maxLines={1}>
                    {isCompact ? team.name.split(' ')[0] : team.name}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {laneCerts[team.id].length} certs
                  </Text>
                </VStack>
              </StackItem>
            </div>
          ))}
        </div>
        {/* Horizontally scrolling canvas; the axis, bars, and the dashed
            status-date line share one px-per-day scale. */}
        <div style={styles.tlScroll}>
          <div style={styles.tlCanvas}>
            <div style={styles.tlAxis} aria-hidden>
              {QUARTER_CELLS.map(cell => (
                <div
                  key={cell.label}
                  style={{
                    ...styles.quarterCell,
                    left: cell.left,
                    width: cell.width,
                  }}>
                  {cell.label}
                </div>
              ))}
            </div>
            {TEAMS.map(team => (
              <div
                key={team.id}
                style={{...styles.tlLane, height: laneHeights[team.id]}}>
                {laneCerts[team.id].map((cert, rowIndex) => {
                  const status = certStatus(cert);
                  const meta = STATUS_META[status];
                  const startDay = Math.max(
                    dayNumber(cert.issuedOn),
                    TL_START_DAY,
                  );
                  const endDay = Math.min(
                    dayNumber(cert.expiresOn),
                    TL_END_DAY,
                  );
                  const isSelected = cert.id === selectedId;
                  return (
                    <button
                      key={cert.id}
                      type="button"
                      style={{
                        ...styles.tlBar,
                        left: (startDay - TL_START_DAY) * PX_PER_DAY,
                        width: Math.max(
                          (endDay - startDay + 1) * PX_PER_DAY,
                          40,
                        ),
                        top:
                          rowIndex * TL_ROW_H + (TL_ROW_H - TL_BAR_H) / 2,
                        backgroundColor: meta.track,
                        borderColor: isSelected
                          ? 'var(--color-accent)'
                          : meta.line,
                        boxShadow: isSelected
                          ? 'inset 0 0 0 1px var(--color-accent)'
                          : undefined,
                      }}
                      aria-pressed={isSelected}
                      aria-label={\`\${cert.commonName}, valid \${formatDate(
                        cert.issuedOn,
                      )} to \${formatDate(cert.expiresOn)}, \${countdownLabel(
                        cert,
                      )}\`}
                      onClick={() => setSelectedId(cert.id)}>
                      <span style={styles.tlBarLabel} aria-hidden>
                        {cert.commonName}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
            {/* Fixed status-date line across the axis and every lane. */}
            <div
              style={{
                ...styles.todayLine,
                left: TODAY_X,
                height: AXIS_H + lanesTotal,
              }}
              aria-hidden
            />
            <div style={{...styles.todayPill, left: TODAY_X}} aria-hidden>
              {formatDate(TODAY)}
            </div>
          </div>
        </div>
      </div>
    );

  // ---- <=960px single-pane fallback: detail swaps in for the views ----
  const singlePaneDetail = selected != null && (
    <div style={styles.detailPane}>
      <div style={styles.detailPaneColumn}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <IconButton
              label="Back to inventory"
              icon={<Icon icon={ArrowLeftIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              style={styles.tapTarget}
              onClick={() => setSelectedId(null)}
            />
            <Text type="body" weight="semibold">
              Certificate detail
            </Text>
          </HStack>
          <CertDetail
            cert={selected}
            isCopied={copiedId === selected.id}
            canUndo={lastRotation?.certId === selected.id}
            onCopy={() => markCopied(selected.id)}
            onRotate={() => openWizard(selected)}
            onUndo={undoRotation}
          />
        </VStack>
      </div>
    </div>
  );

  const inventory = (
    <div style={styles.viewFill}>
      {tiles}
      {controls}
      {view === 'table' ? tableView : timelineView}
    </div>
  );

  const content = (
    <LayoutContent padding={0}>
      {isNarrow && selected != null ? singlePaneDetail : inventory}
    </LayoutContent>
  );

  // ---- detail drawer (340px, desktop only) ----
  const drawer = !isNarrow ? (
    <LayoutPanel width={340} padding={0} hasDivider label="Certificate detail">
      <div style={styles.panelScroll}>
        {selected == null ? (
          <div style={styles.panelEmpty}>
            <VStack gap={1} hAlign="center">
              <Text type="body" weight="semibold">
                No certificate selected
              </Text>
              <Text type="supporting" color="secondary">
                Select a table row or a timeline bar to inspect its chain and
                deployments.
              </Text>
            </VStack>
          </div>
        ) : (
          <CertDetail
            cert={selected}
            isCopied={copiedId === selected.id}
            canUndo={lastRotation?.certId === selected.id}
            onCopy={() => markCopied(selected.id)}
            onRotate={() => openWizard(selected)}
            onUndo={undoRotation}
          />
        )}
      </div>
    </LayoutPanel>
  ) : undefined;

  // ---- rotate wizard ----
  const newExpiry = addDays(TODAY, CA_META[wizardCA].validityDays);
  const closeWizard = () => setRotateTargetId(null);

  const wizardSteps: Array<{step: WizardStep; label: string}> = [
    {step: 1, label: 'CA'},
    {step: 2, label: 'Key'},
    {step: 3, label: 'Confirm'},
  ];

  const wizard = (
    <Dialog
      isOpen={rotateTarget !== null}
      onOpenChange={isOpen => {
        if (!isOpen) {
          closeWizard();
        }
      }}
      purpose="form"
      width="min(560px, 92vw)">
      <Layout
        header={
          <DialogHeader
            title={\`Rotate \${rotateTarget?.commonName ?? 'certificate'}\`}
            subtitle="Re-issues the key pair and swaps the chain in place."
            onOpenChange={isOpen => {
              if (!isOpen) {
                closeWizard();
              }
            }}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                {wizardSteps.map(({step, label}) => (
                  <HStack key={step} gap={1} vAlign="center">
                    <span
                      style={{
                        ...styles.stepDot,
                        ...(wizardStep >= step
                          ? styles.stepDotActive
                          : undefined),
                      }}
                      aria-hidden>
                      {step}
                    </span>
                    <Text
                      type="supporting"
                      color={wizardStep === step ? 'primary' : 'secondary'}>
                      {label}
                    </Text>
                  </HStack>
                ))}
              </HStack>

              {wizardStep === 1 && (
                <VStack gap={2}>
                  <Text type="label" color="secondary">
                    Issuing CA
                  </Text>
                  {CA_ORDER.map(ca => (
                    <WizardOption
                      key={ca}
                      title={CA_META[ca].name}
                      note={CA_META[ca].wizardNote}
                      isSelected={wizardCA === ca}
                      onSelect={() => setWizardCA(ca)}
                    />
                  ))}
                </VStack>
              )}

              {wizardStep === 2 && (
                <VStack gap={2}>
                  <Text type="label" color="secondary">
                    Key algorithm
                  </Text>
                  {KEY_OPTIONS.map(option => (
                    <WizardOption
                      key={option.value}
                      title={option.value}
                      note={option.note}
                      isSelected={wizardKey === option.value}
                      onSelect={() => setWizardKey(option.value)}
                    />
                  ))}
                </VStack>
              )}

              {wizardStep === 3 && rotateTarget != null && (
                <VStack gap={2}>
                  <Text type="label" color="secondary">
                    Review changes
                  </Text>
                  <div style={styles.diffRow}>
                    <Text type="supporting" color="secondary">
                      CA
                    </Text>
                    <Text type="supporting">
                      {CA_META[rotateTarget.ca].name} →{' '}
                      <Text type="supporting" weight="semibold">
                        {CA_META[wizardCA].name}
                      </Text>
                    </Text>
                  </div>
                  <div style={styles.diffRow}>
                    <Text type="supporting" color="secondary">
                      Key
                    </Text>
                    <Text type="supporting">
                      {rotateTarget.keyAlg} →{' '}
                      <Text type="supporting" weight="semibold">
                        {wizardKey}
                      </Text>
                    </Text>
                  </div>
                  <div style={styles.diffRow}>
                    <Text type="supporting" color="secondary">
                      Expires
                    </Text>
                    <Text type="supporting">
                      {formatDate(rotateTarget.expiresOn)} →{' '}
                      <Text type="supporting" weight="semibold">
                        {formatDate(newExpiry)}
                      </Text>
                    </Text>
                  </div>
                  <Text type="supporting" color="secondary">
                    The new chain is {CA_META[wizardCA].root} →{' '}
                    {CA_META[wizardCA].intermediate} →{' '}
                    {rotateTarget.commonName}. All{' '}
                    {rotateTarget.deployments.length} deployment
                    {rotateTarget.deployments.length === 1 ? '' : 's'} pick up
                    the new leaf on their next config sync.
                  </Text>
                </VStack>
              )}
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} vAlign="center">
              <Button label="Cancel" variant="ghost" onClick={closeWizard} />
              <StackItem size="fill" />
              {wizardStep > 1 && (
                <Button
                  label="Back"
                  variant="ghost"
                  onClick={() =>
                    setWizardStep(prev => (prev - 1) as WizardStep)
                  }
                />
              )}
              {wizardStep < 3 ? (
                <Button
                  label="Next"
                  variant="primary"
                  onClick={() =>
                    setWizardStep(prev => (prev + 1) as WizardStep)
                  }
                />
              ) : (
                <Button
                  label="Rotate certificate"
                  variant="primary"
                  icon={<Icon icon={RotateCwIcon} size="sm" color="inherit" />}
                  onClick={confirmRotation}
                />
              )}
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );

  return (
    <>
      <Layout height="fill" header={header} content={content} end={drawer} />
      {wizard}
    </>
  );
}
`;export{e as default};