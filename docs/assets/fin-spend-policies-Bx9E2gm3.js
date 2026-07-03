var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs (140-person) spend
 *   policy catalog frozen at Fri Jul 3, 2026: five policies (Travel, Meals,
 *   Software, Equipment, Team Events) with per-category limit rows, tiered
 *   approval chains, receipt thresholds, 30-day effectiveness figures that
 *   reconcile (per-policy expenses 50+88+24+12+9 = 183; in-policy
 *   47+86+23+12+8 = 176 → 96.2% overall; violations 3+2+1+0+1 = 7 match
 *   each policy's expenses − in-policy delta and its rail count), and a
 *   seven-row violation ledger with fixed ISO timestamps. No clocks, no
 *   randomness, no locale money APIs.
 * @output Spend Policy Builder — the Finance-pillar policy administration
 *   surface where Elena Voss's team defines how Kestrel Labs money may be
 *   spent. A policy rail (five policies with 30-day violation-count chips
 *   and a pinned org-wide in-policy strip); the selected Travel policy
 *   detail: an effectiveness stat strip (94.0% in-policy with +2.1 pt
 *   trend and a labeled weekly mini bar chart, violations, avg approval
 *   time, spend under policy), a per-category limits Table (domestic
 *   flights $450 / international $1,400, hotel $275/night with a city-tier
 *   note, travel meals $75/day), an approval-chain builder rendered as
 *   connected tier rows (under $500 auto-approve → manager → over $5,000
 *   Finance review) with working add/remove-tier actions, and a receipt
 *   -requirement rule (itemized receipts over $25, working Switch); an
 *   end panel with the 30-day violation feed (over-limit amounts and
 *   justification status, working approve/escalate actions) above a
 *   recent-policy-changes audit list.
 * @position Page template; emitted by \`astryx template fin-spend-policies\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | rail 280 (policy List + pinned in-policy strip)
 *   | content (policy title block, stat strip, limits Table, approval
 *   chain, receipt rule — one vertical scroller) | end panel 340
 *   (violation feed + policy-change audit, scrolls independently).
 * Container policy: app-shell admin archetype — frame rows and panels
 *   only; no Cards. Stat tiles, chain tiers, violation rows, and the
 *   receipt rule block are styled divs inside frame regions.
 * Color policy: token-pure everywhere; the only literals are the
 *   \`light-dark()\` fallback pairs on the data-viz categorical tokens (the
 *   demo does not inject \`--color-data-categorical-*\`) used for policy
 *   glyphs, chain-tier nodes, and the weekly-rate bars, plus \`light-dark()\`
 *   tint pairs on the over-limit amount text and the trend delta.
 *
 * Responsive contract:
 * - > 1180px: full three-region frame (rail 280 | content | end 340).
 * - <= 1180px: the end panel is dropped; the violation feed and the
 *   change audit render inline below the receipt rule so nothing becomes
 *   unreachable.
 * - <= 860px: the rail is dropped and a policy Selector (with violation
 *   counts in the option labels) appears in the content toolbar; stat
 *   tiles wrap 2-up; the limits Table drops the Notes column (notes stay
 *   reachable as supporting text under the category name); header and
 *   title rows wrap instead of clipping.
 * - Rail, content, and end panel each scroll independently
 *   (\`minHeight: 0\` down every flex chain); the header and the rail's
 *   in-policy strip are pinned.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  BadgeCheckIcon,
  BuildingIcon,
  CalendarDaysIcon,
  CheckIcon,
  DownloadIcon,
  HistoryIcon,
  LandmarkIcon,
  LaptopIcon,
  PartyPopperIcon,
  PencilIcon,
  PlaneIcon,
  PlusIcon,
  ReceiptTextIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UtensilsIcon,
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
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
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
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-2)'},
  railStrip: {flexShrink: 0, padding: 'var(--spacing-3)'},
  contentScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4) var(--spacing-5) var(--spacing-6)',
  },
  detailScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  policyGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  // Stat strip -------------------------------------------------------------
  statStrip: {display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap'},
  statTile: {
    flex: '1 1 150px',
    minWidth: 150,
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  statTileWide: {flex: '1 1 220px', minWidth: 220},
  trendUp: {color: 'light-dark(#0B991F, #34C759)', display: 'inline-flex', alignItems: 'center', gap: 4},
  trendDown: {color: 'light-dark(#DC2626, #F87171)', display: 'inline-flex', alignItems: 'center', gap: 4},
  // Weekly mini bar chart — one shared px-per-percent scale; bars are
  // value-labeled and week-labeled (no axis-less charts). No fixed row
  // height: the columns size intrinsically (label + bar + label) so the
  // tallest bar never overflows the tile.
  sparkRow: {display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-2)'},
  sparkCol: {flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 0},
  sparkBar: {
    width: '100%',
    maxWidth: 40,
    borderRadius: 3,
    backgroundColor: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  },
  sparkLabel: {whiteSpace: 'nowrap'},
  // Section shells ----------------------------------------------------------
  section: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  sectionBody: {padding: 'var(--spacing-3) var(--spacing-4)'},
  limitsTableWrap: {paddingInline: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', overflowX: 'auto'},
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Approval chain — tier rows joined by a vertical connector spine.
  chainList: {display: 'flex', flexDirection: 'column'},
  chainRow: {display: 'flex', gap: 'var(--spacing-3)', alignItems: 'stretch'},
  chainRail: {display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0},
  chainNode: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    flexShrink: 0,
    color: 'light-dark(#FFFFFF, #0B0F14)',
  },
  chainConnector: {width: 2, flex: 1, minHeight: 12, backgroundColor: 'var(--color-border)'},
  // The card is a non-wrapping row of [wrapping content | MoreMenu] so the
  // menu stays anchored top-right no matter how the content wraps at
  // narrow pane widths.
  chainCard: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    marginBottom: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  chainCardBody: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    gap: 'var(--spacing-2) var(--spacing-3)',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  chainThreshold: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Violation feed ----------------------------------------------------------
  violationRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  overAmount: {
    color: 'light-dark(#DC2626, #F87171)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  amountCol: {textAlign: 'end'},
  auditRow: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start'},
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
const CATEGORICAL = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs (140-person platform company), frozen Fri Jul 3, 2026.
// Signed-in admin: Elena Voss (Finance lead). All money in USD.
// 30-day window (Jun 4 – Jul 3) reconciles everywhere it repeats:
//   expenses  50 + 88 + 24 + 12 + 9 = 183
//   in-policy 47 + 86 + 23 + 12 + 8 = 176  → 96.2% org-wide
//   violations = expenses − in-policy per policy: 3, 2, 1, 0, 1 (7 total)
// and each policy's violation feed holds exactly that many rows.
// ---------------------------------------------------------------------------

type PolicyId = 'travel' | 'meals' | 'software' | 'equipment' | 'events';

// The Table generic requires rows assignable to Record<string, unknown>.
interface LimitRow extends Record<string, unknown> {
  id: string;
  category: string;
  /** null renders as "Not covered" (e.g. solo meals outside travel). */
  limitUsd: number | null;
  per: string;
  note?: string;
}

type TierKind = 'auto' | 'manager' | 'finance' | 'it';

interface ChainStep {
  id: string;
  /** Threshold band, e.g. "Under $500". */
  condition: string;
  kind: TierKind;
  title: string;
  /** Named approver (must stay consistent with the suite roster). */
  approver?: string;
  approverRole?: string;
  detail: string;
  slaLabel: string;
}

type ViolationStatus = 'pending' | 'justified' | 'escalated';

interface Violation {
  id: string;
  person: string;
  role: string;
  category: string;
  memo: string;
  amountUsd: number;
  limitLabel: string;
  overByUsd: number;
  at: string;
  status: ViolationStatus;
  reviewer?: string;
}

interface Effectiveness {
  ratePct: number;
  trendPts: number;
  expenses30d: number;
  inPolicy30d: number;
  avgApprovalHrs: number;
  spend30dUsd: number;
  /** Weekly in-policy rate, oldest → newest; weeks ending Jun 12/19/26, Jul 3. */
  weeklyRatePct: number[];
}

interface Policy {
  id: PolicyId;
  name: string;
  icon: typeof PlaneIcon;
  color: string;
  scope: string;
  owner: string;
  ownerRole: string;
  version: string;
  effectiveDate: string;
  updatedAt: string;
  updatedBy: string;
  summary: string;
  limits: LimitRow[];
  chain: ChainStep[];
  receiptThresholdUsd: number;
  receiptNote: string;
  effectiveness: Effectiveness;
  violations: Violation[];
}

const WEEK_LABELS = ['Jun 12', 'Jun 19', 'Jun 26', 'Jul 3'];

const TRAVEL_POLICY: Policy = {
  id: 'travel',
  name: 'Travel',
  icon: PlaneIcon,
  color: CATEGORICAL.blue,
  scope: 'All 140 employees',
  owner: 'Elena Voss',
  ownerRole: 'Finance lead',
  version: 'v4',
  // Midday UTC so the date renders as Jul 1 in every US timezone —
  // midnight UTC shows the previous day and contradicts the audit feed.
  effectiveDate: '2026-07-01T15:00:00Z',
  updatedAt: '2026-07-01T09:15:00Z',
  updatedBy: 'Elena Voss',
  summary:
    'Booked travel for customer onsites, the Lisbon office, and company events. Limits apply per traveler; city-tier uplifts are automatic.',
  limits: [
    {id: 'l-t1', category: 'Flights — domestic', limitUsd: 450, per: 'per flight',
      note: 'Economy; booked 14+ days ahead'},
    {id: 'l-t2', category: 'Flights — international', limitUsd: 1400, per: 'per flight',
      note: 'Premium economy allowed over 8h'},
    {id: 'l-t3', category: 'Hotel', limitUsd: 275, per: 'per night',
      note: 'City-tier A (SF, NYC, London) +$75/night'},
    {id: 'l-t4', category: 'Meals while traveling', limitUsd: 75, per: 'per day',
      note: 'Per diem; alcohol excluded'},
    {id: 'l-t5', category: 'Ground transport', limitUsd: 60, per: 'per day',
      note: 'Rideshare and transit; no premium tiers'},
  ],
  chain: [
    {id: 'c-t1', condition: 'Under $500', kind: 'auto', title: 'Auto-approve',
      detail: 'Policy engine checks limits and receipt', slaLabel: 'Instant'},
    {id: 'c-t2', condition: '$500 – $5,000', kind: 'manager', title: 'Manager approval',
      detail: 'Direct manager from the org chain', slaLabel: '24h SLA'},
    {id: 'c-t3', condition: 'Over $5,000', kind: 'finance', title: 'Finance review',
      approver: 'Elena Voss', approverRole: 'Finance lead',
      detail: 'Booked through the travel desk only', slaLabel: '48h SLA'},
  ],
  receiptThresholdUsd: 25,
  receiptNote: 'Itemized receipt required over the threshold; hotel folios are always required.',
  effectiveness: {
    ratePct: 94.0, trendPts: 2.1, expenses30d: 50, inPolicy30d: 47,
    avgApprovalHrs: 11.2, spend30dUsd: 48210,
    weeklyRatePct: [92.0, 93.1, 94.4, 95.6],
  },
  violations: [
    {id: 'v-t1', person: 'Jonah Fields', role: 'GTM', category: 'Hotel',
      memo: 'Meridian renewal onsite — The Alcott, SF, 2 nights at $342/night',
      amountUsd: 684, limitLabel: '$275/night cap', overByUsd: 134,
      at: '2026-07-02T18:40:00Z', status: 'pending'},
    {id: 'v-t2', person: 'Marcus Webb', role: 'Platform lead', category: 'Flight — international',
      memo: 'Lisbon platform summit — only direct SFO→LIS fare',
      amountUsd: 1612.4, limitLabel: '$1,400 cap', overByUsd: 212.4,
      at: '2026-06-28T14:05:00Z', status: 'justified', reviewer: 'Elena Voss'},
    {id: 'v-t3', person: 'Ravi Menon', role: 'Engineering', category: 'Meals while traveling',
      memo: 'Recruiting dinner rolled into the per-diem day',
      amountUsd: 96.5, limitLabel: '$75/day per diem', overByUsd: 21.5,
      at: '2026-06-30T21:20:00Z', status: 'escalated'},
  ],
};

const MEALS_POLICY: Policy = {
  id: 'meals',
  name: 'Meals',
  icon: UtensilsIcon,
  color: CATEGORICAL.orange,
  scope: 'All 140 employees',
  owner: 'Elena Voss',
  ownerRole: 'Finance lead',
  version: 'v3',
  effectiveDate: '2026-05-01T15:00:00Z',
  updatedAt: '2026-06-24T10:30:00Z',
  updatedBy: 'Dana Whitfield',
  summary:
    'Non-travel meals: team lunches, client meals, and office snacks. Per-person caps apply to the whole check, split evenly.',
  limits: [
    {id: 'l-m1', category: 'Team lunch', limitUsd: 25, per: 'per person',
      note: 'Same-team attendees only'},
    {id: 'l-m2', category: 'Client meal', limitUsd: 75, per: 'per person',
      note: 'Attendee list required on the report'},
    {id: 'l-m3', category: 'Coffee & snacks', limitUsd: 15, per: 'per day'},
    {id: 'l-m4', category: 'Solo meals (non-travel)', limitUsd: null, per: '—',
      note: 'Not reimbursable outside booked travel'},
  ],
  chain: [
    {id: 'c-m1', condition: 'Under $100', kind: 'auto', title: 'Auto-approve',
      detail: 'Policy engine checks per-person caps', slaLabel: 'Instant'},
    {id: 'c-m2', condition: '$100 – $1,000', kind: 'manager', title: 'Manager approval',
      detail: 'Direct manager from the org chain', slaLabel: '24h SLA'},
    {id: 'c-m3', condition: 'Over $1,000', kind: 'finance', title: 'Finance review',
      approver: 'Elena Voss', approverRole: 'Finance lead',
      detail: 'Large-group checks need the event context', slaLabel: '48h SLA'},
  ],
  receiptThresholdUsd: 25,
  receiptNote: 'Itemized receipt required over the threshold; client meals also need the attendee list.',
  effectiveness: {
    ratePct: 97.7, trendPts: 0.6, expenses30d: 88, inPolicy30d: 86,
    avgApprovalHrs: 4.1, spend30dUsd: 9840,
    weeklyRatePct: [96.8, 97.5, 97.9, 98.2],
  },
  violations: [
    {id: 'v-m1', person: 'Leah Kim', role: 'GTM', category: 'Team lunch',
      memo: 'Pipeline-review lunch — $31.40/person for 5',
      amountUsd: 157, limitLabel: '$25/person cap ($125)', overByUsd: 32,
      at: '2026-07-01T20:10:00Z', status: 'pending'},
    {id: 'v-m2', person: 'Noor Haddad', role: 'GTM', category: 'Client meal',
      memo: 'Halcyon prospect dinner — $86.30/person for 3',
      amountUsd: 258.9, limitLabel: '$75/person cap ($225)', overByUsd: 33.9,
      at: '2026-06-26T22:45:00Z', status: 'justified', reviewer: 'Elena Voss'},
  ],
};

const SOFTWARE_POLICY: Policy = {
  id: 'software',
  name: 'Software',
  icon: ZapIcon,
  color: CATEGORICAL.purple,
  scope: 'All 140 employees',
  owner: 'Tom Okonkwo',
  ownerRole: 'IT admin',
  version: 'v5',
  effectiveDate: '2026-06-18T15:00:00Z',
  updatedAt: '2026-06-18T15:00:00Z',
  updatedBy: 'Tom Okonkwo',
  summary:
    'SaaS seats and licenses bought outside the managed app catalog. Anything recurring routes through IT so seats land in the provisioning matrix.',
  limits: [
    {id: 'l-s1', category: 'Individual SaaS seat', limitUsd: 30, per: 'per month',
      note: 'Self-serve from the managed app catalog'},
    {id: 'l-s2', category: 'Team tool', limitUsd: 250, per: 'per month',
      note: 'IT review; joins the provisioning matrix'},
    {id: 'l-s3', category: 'Annual license', limitUsd: 2500, per: 'per year',
      note: 'Procurement + security review'},
    {id: 'l-s4', category: 'One-time plugin / asset', limitUsd: 100, per: 'per purchase'},
  ],
  chain: [
    {id: 'c-s1', condition: 'Under $50/mo', kind: 'auto', title: 'Auto-approve',
      detail: 'Catalog apps only; seat is logged automatically', slaLabel: 'Instant'},
    {id: 'c-s2', condition: '$50 – $250/mo', kind: 'manager', title: 'Manager approval',
      detail: 'Direct manager from the org chain', slaLabel: '24h SLA'},
    {id: 'c-s3', condition: 'Over $250/mo', kind: 'it', title: 'IT review',
      approver: 'Tom Okonkwo', approverRole: 'IT admin',
      detail: 'Security review + SSO enrollment', slaLabel: '48h SLA'},
  ],
  receiptThresholdUsd: 0,
  receiptNote: 'Every software purchase needs an invoice or receipt, regardless of amount.',
  effectiveness: {
    ratePct: 95.8, trendPts: -1.9, expenses30d: 24, inPolicy30d: 23,
    avgApprovalHrs: 18.5, spend30dUsd: 12360,
    weeklyRatePct: [97.2, 96.4, 95.5, 94.8],
  },
  violations: [
    {id: 'v-s1', person: 'Ben Carver', role: 'Engineering', category: 'Individual SaaS seat',
      memo: 'Datadog seat add-on bought on card, outside the catalog',
      amountUsd: 58, limitLabel: '$30/month seat cap', overByUsd: 28,
      at: '2026-06-29T16:55:00Z', status: 'escalated'},
  ],
};

const EQUIPMENT_POLICY: Policy = {
  id: 'equipment',
  name: 'Equipment',
  icon: LaptopIcon,
  color: CATEGORICAL.teal,
  scope: 'All 140 employees',
  owner: 'Tom Okonkwo',
  ownerRole: 'IT admin',
  version: 'v2',
  effectiveDate: '2026-04-01T15:00:00Z',
  updatedAt: '2026-05-12T11:20:00Z',
  updatedBy: 'Tom Okonkwo',
  summary:
    'Endpoint hardware and home-office spend. Laptops and monitors are IT-imaged assets and appear in device inventory once approved.',
  limits: [
    {id: 'l-e1', category: 'Laptop refresh', limitUsd: 2400, per: 'per 36 months',
      note: 'Standard config; IT-imaged before handoff'},
    {id: 'l-e2', category: 'External monitor', limitUsd: 450, per: 'per 24 months'},
    {id: 'l-e3', category: 'Peripherals', limitUsd: 150, per: 'per year',
      note: 'Keyboard, mouse, headset, cables'},
    {id: 'l-e4', category: 'Home-office stipend', limitUsd: 500, per: 'per year',
      note: 'Remote-US and Lisbon remote staff'},
  ],
  chain: [
    {id: 'c-e1', condition: 'Under $150', kind: 'auto', title: 'Auto-approve',
      detail: 'Peripherals from the standard list', slaLabel: 'Instant'},
    {id: 'c-e2', condition: '$150 – $1,000', kind: 'manager', title: 'Manager approval',
      detail: 'Direct manager from the org chain', slaLabel: '24h SLA'},
    {id: 'c-e3', condition: 'Over $1,000', kind: 'it', title: 'IT provisioning',
      approver: 'Tom Okonkwo', approverRole: 'IT admin',
      detail: 'Asset-tagged and enrolled in MDM', slaLabel: '72h SLA'},
  ],
  receiptThresholdUsd: 25,
  receiptNote: 'Itemized receipt required over the threshold; serial numbers on laptops and monitors.',
  effectiveness: {
    ratePct: 100.0, trendPts: 3.4, expenses30d: 12, inPolicy30d: 12,
    avgApprovalHrs: 22.0, spend30dUsd: 14520,
    weeklyRatePct: [98.0, 100.0, 100.0, 100.0],
  },
  violations: [],
};

const EVENTS_POLICY: Policy = {
  id: 'events',
  name: 'Team Events',
  icon: PartyPopperIcon,
  color: CATEGORICAL.green,
  scope: 'All 140 employees',
  owner: 'Dana Whitfield',
  ownerRole: 'People Ops',
  version: 'v2',
  effectiveDate: '2026-04-01T15:00:00Z',
  updatedAt: '2026-06-10T09:45:00Z',
  updatedBy: 'Dana Whitfield',
  summary:
    'Team celebrations, quarterly meals, and the annual offsite. Per-person caps apply across the full attendee list on the report.',
  limits: [
    {id: 'l-v1', category: 'Team meal (quarterly)', limitUsd: 75, per: 'per person',
      note: 'Attendee list required'},
    {id: 'l-v2', category: 'Annual offsite', limitUsd: 400, per: 'per person / year',
      note: 'Travel booked under the Travel policy'},
    {id: 'l-v3', category: 'Venue deposit', limitUsd: 1000, per: 'per event',
      note: 'Refundable deposits only'},
    {id: 'l-v4', category: 'Gifts & swag', limitUsd: 50, per: 'per person / year'},
  ],
  chain: [
    {id: 'c-v1', condition: 'Under $500', kind: 'auto', title: 'Auto-approve',
      detail: 'Attendee list attached to the report', slaLabel: 'Instant'},
    {id: 'c-v2', condition: '$500 – $2,500', kind: 'manager', title: 'Manager approval',
      detail: 'Organizing manager signs off', slaLabel: '24h SLA'},
    {id: 'c-v3', condition: 'Over $2,500', kind: 'finance', title: 'Finance review',
      approver: 'Elena Voss', approverRole: 'Finance lead',
      detail: 'Budget line confirmed before booking', slaLabel: '48h SLA'},
  ],
  receiptThresholdUsd: 25,
  receiptNote: 'Itemized receipt over the threshold, plus the attendee list on every event report.',
  effectiveness: {
    ratePct: 88.9, trendPts: -4.2, expenses30d: 9, inPolicy30d: 8,
    avgApprovalHrs: 9.0, spend30dUsd: 6180,
    weeklyRatePct: [94.1, 92.2, 90.4, 88.9],
  },
  violations: [
    {id: 'v-v1', person: 'Dana Whitfield', role: 'People Ops', category: 'Team meal (quarterly)',
      memo: 'Design + People joint dinner — $92/person for 16',
      amountUsd: 1472, limitLabel: '$75/person cap ($1,200)', overByUsd: 272,
      at: '2026-06-27T23:10:00Z', status: 'pending'},
  ],
};

const POLICIES: Policy[] = [
  TRAVEL_POLICY,
  MEALS_POLICY,
  SOFTWARE_POLICY,
  EQUIPMENT_POLICY,
  EVENTS_POLICY,
];

// Org-wide roll-up — sums of the per-policy figures above (183 expenses,
// 176 in-policy, 7 violations, $91,110 spend under policy).
const ORG_ROLLUP = {
  expenses30d: 183,
  inPolicy30d: 176,
  ratePct: 96.2,
  violations: 7,
  spend30dUsd: 91110,
};

// Recent policy changes — entity-anchored audit rows (per-policy edits by
// named admins), not a query-driven log stream.
interface AuditEntry {
  id: string;
  actor: string;
  policyId: PolicyId;
  change: string;
  at: string;
}

const AUDIT_FEED: AuditEntry[] = [
  {id: 'au-1', actor: 'Elena Voss', policyId: 'travel',
    change: 'Raised the international flight cap $1,250 → $1,400 (Travel v4)',
    at: '2026-07-01T09:15:00Z'},
  {id: 'au-2', actor: 'Dana Whitfield', policyId: 'meals',
    change: 'Added the attendee-list requirement to client meals (Meals v3)',
    at: '2026-06-24T10:30:00Z'},
  {id: 'au-3', actor: 'Tom Okonkwo', policyId: 'software',
    change: 'Added the IT review tier for tools over $250/month (Software v5)',
    at: '2026-06-18T15:00:00Z'},
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** Deterministic USD formatting — no locale APIs. */
function fmtUsd(amount: number): string {
  const cents = Math.round(amount * 100);
  const whole = Math.trunc(cents / 100);
  const frac = Math.abs(cents % 100);
  const grouped = String(Math.abs(whole)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  const sign = whole < 0 ? '-' : '';
  return frac === 0 ? \`\${sign}$\${grouped}\` : \`\${sign}$\${grouped}.\${String(frac).padStart(2, '0')}\`;
}

function fmtPct(value: number): string {
  return \`\${value.toFixed(1)}%\`;
}

const TIER_META: Record<TierKind, {icon: typeof ZapIcon; color: string; label: string}> = {
  auto: {icon: ZapIcon, color: CATEGORICAL.green, label: 'Automatic'},
  manager: {icon: UserCheckIcon, color: CATEGORICAL.blue, label: 'Manager'},
  finance: {icon: LandmarkIcon, color: CATEGORICAL.purple, label: 'Finance'},
  it: {icon: BuildingIcon, color: CATEGORICAL.teal, label: 'IT'},
};

const VIOLATION_STATUS_META: Record<
  ViolationStatus,
  {label: string; color: 'yellow' | 'green' | 'red'}
> = {
  pending: {label: 'Justification pending', color: 'yellow'},
  justified: {label: 'Justified — approved', color: 'green'},
  escalated: {label: 'Escalated to Finance', color: 'red'},
};

function policyById(id: PolicyId): Policy {
  return POLICIES.find(policy => policy.id === id) ?? TRAVEL_POLICY;
}

// ---------------------------------------------------------------------------
// RAIL — policy list with 30-day violation-count chips and a pinned
// org-wide in-policy strip whose figures are the per-policy sums.
// ---------------------------------------------------------------------------

function PolicyRail({
  activeId,
  onSelect,
}: {
  activeId: PolicyId;
  onSelect: (id: PolicyId) => void;
}) {
  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <List density="compact" aria-label="Spend policies">
          {POLICIES.map(policy => (
            <ListItem
              key={policy.id}
              label={policy.name}
              description={\`\${policy.version} · \${fmtPct(policy.effectiveness.ratePct)} in-policy\`}
              isSelected={policy.id === activeId}
              onClick={() => onSelect(policy.id)}
              startContent={
                <span style={{...styles.policyGlyph, color: policy.color}}>
                  <Icon icon={policy.icon} size="sm" color="inherit" />
                </span>
              }
              endContent={
                policy.violations.length > 0 ? (
                  <Badge
                    label={String(policy.violations.length)}
                    variant="warning"
                  />
                ) : (
                  <Icon icon={CheckIcon} size="sm" color="secondary" />
                )
              }
            />
          ))}
        </List>
      </div>
      <Divider />
      {/* Pinned org-wide strip — 176 of 183 = 96.2%; 7 violations. */}
      <VStack gap={2} style={styles.railStrip}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" size="sm">
              In-policy · 30 days
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {fmtPct(ORG_ROLLUP.ratePct)}
          </Text>
        </HStack>
        <ProgressBar
          label="Org-wide in-policy rate"
          isLabelHidden
          value={ORG_ROLLUP.inPolicy30d}
          max={ORG_ROLLUP.expenses30d}
          variant="neutral"
          style={{minWidth: 0}}
        />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {ORG_ROLLUP.inPolicy30d} of {ORG_ROLLUP.expenses30d} expenses ·{' '}
          {ORG_ROLLUP.violations} violations
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {fmtUsd(ORG_ROLLUP.spend30dUsd)} spend under policy
        </Text>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STAT STRIP — per-policy effectiveness tiles + a labeled weekly mini bar
// chart sharing one px-per-percent scale (bars span the 80–100% band).
// ---------------------------------------------------------------------------

const SPARK_MIN_PCT = 80;
const SPARK_MAX_PCT = 100;
const SPARK_MAX_PX = 44;

function sparkHeight(ratePct: number): number {
  const clamped = Math.max(SPARK_MIN_PCT, Math.min(SPARK_MAX_PCT, ratePct));
  const span = SPARK_MAX_PCT - SPARK_MIN_PCT;
  return Math.round(((clamped - SPARK_MIN_PCT) / span) * (SPARK_MAX_PX - 8)) + 8;
}

function TrendDelta({points}: {points: number}) {
  const isUp = points >= 0;
  return (
    <span style={isUp ? styles.trendUp : styles.trendDown}>
      <Icon icon={isUp ? TrendingUpIcon : TrendingDownIcon} size="xsm" color="inherit" />
      <Text type="supporting" color="inherit" hasTabularNumbers>
        {isUp ? '+' : ''}
        {points.toFixed(1)} pts vs prior 30d
      </Text>
    </span>
  );
}

function StatTile({
  label,
  value,
  caption,
  children,
  isWide,
}: {
  label: string;
  value?: string;
  caption?: string;
  children?: ReactNode;
  isWide?: boolean;
}) {
  return (
    <div style={isWide ? {...styles.statTile, ...styles.statTileWide} : styles.statTile}>
      <VStack gap={1}>
        <Text type="label" size="sm" color="secondary">
          {label}
        </Text>
        {value !== undefined ? (
          <Heading level={3} style={styles.numericCell}>
            {value}
          </Heading>
        ) : null}
        {caption !== undefined ? (
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {caption}
          </Text>
        ) : null}
        {children}
      </VStack>
    </div>
  );
}

function EffectivenessStrip({policy}: {policy: Policy}) {
  const stats = policy.effectiveness;
  return (
    <div style={styles.statStrip}>
      <StatTile label="In-policy rate · 30d" value={fmtPct(stats.ratePct)}>
        <TrendDelta points={stats.trendPts} />
      </StatTile>
      <StatTile
        label="Violations · 30d"
        value={String(policy.violations.length)}
        caption={\`\${stats.inPolicy30d} of \${stats.expenses30d} expenses in policy\`}
      />
      <StatTile
        label="Avg approval time"
        value={\`\${stats.avgApprovalHrs.toFixed(1)}h\`}
        caption="Across manager and reviewer tiers"
      />
      <StatTile
        label="Spend under policy · 30d"
        value={fmtUsd(stats.spend30dUsd)}
        caption={\`\${policy.scope}\`}
      />
      <StatTile label="Weekly in-policy rate" isWide>
        <div style={styles.sparkRow} role="img"
          aria-label={\`Weekly in-policy rate: \${stats.weeklyRatePct
            .map((rate, index) => \`week ending \${WEEK_LABELS[index]} \${fmtPct(rate)}\`)
            .join(', ')}\`}>
          {stats.weeklyRatePct.map((rate, index) => (
            <div key={WEEK_LABELS[index]} style={styles.sparkCol}>
              <Text type="supporting" size="sm" color="secondary" hasTabularNumbers
                style={styles.sparkLabel}>
                {rate.toFixed(0)}%
              </Text>
              <div style={{...styles.sparkBar, height: sparkHeight(rate)}} />
              <Text type="supporting" size="sm" color="secondary" style={styles.sparkLabel}>
                {WEEK_LABELS[index]}
              </Text>
            </div>
          ))}
        </div>
      </StatTile>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LIMITS TABLE — per-category caps. Fixed-width columns use pixel() so the
// header carries both width and minWidth (Table cells have max-width: 0).
// ---------------------------------------------------------------------------

function buildLimitColumns(isCompact: boolean): TableColumn<LimitRow>[] {
  const columns: TableColumn<LimitRow>[] = [
    {
      key: 'category',
      header: 'Category',
      width: proportional(1.4, {minWidth: 180}),
      renderCell: (row: LimitRow) => (
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {row.category}
          </Text>
          {/* <=860px the Notes column is dropped — the note folds in here. */}
          {isCompact && row.note !== undefined ? (
            <Text type="supporting" color="secondary" maxLines={2}>
              {row.note}
            </Text>
          ) : null}
        </VStack>
      ),
    },
    {
      key: 'limit',
      header: 'Limit',
      align: 'end',
      width: pixel(96),
      renderCell: (row: LimitRow) => (
        <Text type="body" hasTabularNumbers style={styles.numericCell}>
          {row.limitUsd === null ? '—' : fmtUsd(row.limitUsd)}
        </Text>
      ),
    },
    {
      key: 'per',
      header: 'Applies',
      width: pixel(130),
      renderCell: (row: LimitRow) => (
        <Text type="body" color="secondary" maxLines={1}>
          {row.limitUsd === null ? 'Not covered' : row.per}
        </Text>
      ),
    },
  ];
  if (!isCompact) {
    columns.push({
      key: 'note',
      header: 'Notes',
      width: proportional(1.6, {minWidth: 200}),
      renderCell: (row: LimitRow) =>
        row.note !== undefined ? (
          <Text type="supporting" color="secondary" maxLines={2}>
            {row.note}
          </Text>
        ) : (
          <Text type="supporting" color="secondary">
            —
          </Text>
        ),
    });
  }
  return columns;
}

function LimitsSection({policy, isCompact}: {policy: Policy; isCompact: boolean}) {
  const columns = useMemo(() => buildLimitColumns(isCompact), [isCompact]);
  return (
    <section style={styles.section} aria-label={\`\${policy.name} category limits\`}>
      <div style={styles.sectionHeader}>
        <Icon icon={ReceiptTextIcon} size="sm" color="secondary" />
        <Heading level={2}>Category limits</Heading>
        <Token size="sm" color="gray" label={\`\${policy.limits.length} categories\`} />
        <StackItem size="fill" />
        <Button
          label="Edit"
          aria-label={\`Edit \${policy.name} category limits\`}
          variant="ghost"
          size="sm"
          icon={<Icon icon={PencilIcon} size="sm" />}
        />
      </div>
      <div style={styles.limitsTableWrap}>
        <Table<LimitRow>
          data={policy.limits}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="rows"
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// APPROVAL CHAIN — tier rows joined by a connector spine; add/remove work.
// ---------------------------------------------------------------------------

function ChainTierRow({
  step,
  isLast,
  canRemove,
  onRemove,
}: {
  step: ChainStep;
  isLast: boolean;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const meta = TIER_META[step.kind];
  return (
    <div style={styles.chainRow}>
      <div style={styles.chainRail}>
        <span style={{...styles.chainNode, backgroundColor: meta.color}}>
          <Icon icon={meta.icon} size="sm" color="inherit" />
        </span>
        {!isLast ? <span style={styles.chainConnector} /> : null}
      </div>
      <div style={styles.chainCard}>
        <div style={styles.chainCardBody}>
          <VStack gap={0} style={{minWidth: 118}}>
            <Text type="label" hasTabularNumbers style={styles.chainThreshold}>
              {step.condition}
            </Text>
            <Text type="supporting" color="secondary">
              {meta.label} tier
            </Text>
          </VStack>
          <StackItem size="fill" style={{minWidth: 160}}>
            <VStack gap={0}>
              <HStack gap={2} vAlign="center">
                <Text type="label" maxLines={1}>
                  {step.title}
                </Text>
                <Token size="sm" color="gray" label={step.slaLabel} />
              </HStack>
              <Text type="supporting" color="secondary" maxLines={2}>
                {step.detail}
              </Text>
            </VStack>
          </StackItem>
          {step.approver !== undefined ? (
            <HStack gap={2} vAlign="center">
              <Avatar name={step.approver} size="xsmall" />
              <VStack gap={0}>
                <Text type="supporting" maxLines={1}>
                  {step.approver}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {step.approverRole}
                </Text>
              </VStack>
            </HStack>
          ) : null}
        </div>
        <MoreMenu
          label={\`Actions for the \${step.condition} tier\`}
          size="sm"
          items={[
            {label: 'Edit tier', onClick: () => {}},
            {label: 'Change approver', onClick: () => {}},
            {type: 'divider' as const},
            {
              label: 'Remove tier',
              onClick: onRemove,
              isDisabled: !canRemove,
            },
          ]}
        />
      </div>
    </div>
  );
}

function ApprovalChainSection({
  steps,
  onAddTier,
  onRemoveTier,
}: {
  steps: ChainStep[];
  onAddTier: () => void;
  onRemoveTier: (id: string) => void;
}) {
  return (
    <section style={styles.section} aria-label="Approval chain">
      <div style={styles.sectionHeader}>
        <Icon icon={BadgeCheckIcon} size="sm" color="secondary" />
        <Heading level={2}>Approval chain</Heading>
        <Token size="sm" color="gray" label={\`\${steps.length} tiers\`} />
        <StackItem size="fill" />
        <Button
          label="Add tier"
          variant="secondary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" />}
          onClick={onAddTier}
        />
      </div>
      <div style={styles.sectionBody}>
        <div style={styles.chainList}>
          {steps.map((step, index) => (
            <ChainTierRow
              key={step.id}
              step={step}
              isLast={index === steps.length - 1}
              canRemove={steps.length > 1}
              onRemove={() => onRemoveTier(step.id)}
            />
          ))}
        </div>
        <Text type="supporting" color="secondary">
          Expenses route to the first tier whose threshold matches; tiers
          escalate top to bottom.
        </Text>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// RECEIPT RULE — threshold + working Switch.
// ---------------------------------------------------------------------------

function ReceiptRuleSection({
  policy,
  isEnabled,
  onToggle,
}: {
  policy: Policy;
  isEnabled: boolean;
  onToggle: (checked: boolean) => void;
}) {
  const thresholdLabel =
    policy.receiptThresholdUsd === 0
      ? 'for every amount'
      : \`over \${fmtUsd(policy.receiptThresholdUsd)}\`;
  return (
    <section style={styles.section} aria-label="Receipt requirements">
      <div style={styles.sectionHeader}>
        <Icon icon={ReceiptTextIcon} size="sm" color="secondary" />
        <Heading level={2}>Receipt requirements</Heading>
        <StackItem size="fill" />
        <Token
          size="sm"
          color={isEnabled ? 'green' : 'gray'}
          label={isEnabled ? 'Rule active' : 'Rule off'}
        />
      </div>
      <div style={styles.sectionBody}>
        <VStack gap={2}>
          <Switch
            label="Require itemized receipts"
            value={isEnabled}
            onChange={onToggle}
          />
          <Text type="body">
            Itemized receipt required {thresholdLabel}
            {policy.receiptThresholdUsd > 0 ? ' per expense line.' : '.'}
          </Text>
          <Text type="supporting" color="secondary">
            {policy.receiptNote}
          </Text>
          {!isEnabled ? (
            <HStack gap={1} vAlign="center">
              <Icon icon={ShieldAlertIcon} size="xsm" color="secondary" />
              <Text type="supporting" color="secondary">
                Receipts are optional while this rule is off — flagged
                expenses lose their audit evidence.
              </Text>
            </HStack>
          ) : null}
        </VStack>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// VIOLATION FEED — 30-day out-of-policy expenses with over-limit amounts
// and justification status; approve/escalate actions update status only
// (the 30-day count is an immutable fixture, so rail chips stay honest).
// ---------------------------------------------------------------------------

function ViolationRow({
  violation,
  onSetStatus,
  onRemind,
}: {
  violation: Violation;
  onSetStatus: (id: string, status: ViolationStatus, reviewer?: string) => void;
  onRemind: (violation: Violation) => void;
}) {
  const statusMeta = VIOLATION_STATUS_META[violation.status];
  return (
    <div style={styles.violationRow}>
      <HStack gap={2} vAlign="center">
        <Avatar name={violation.person} size="small" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {violation.person}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {violation.role} · {violation.category}
            </Text>
          </VStack>
        </StackItem>
        <VStack gap={0} style={styles.amountCol}>
          <Text type="label" hasTabularNumbers style={styles.numericCell}>
            {fmtUsd(violation.amountUsd)}
          </Text>
          <Text type="supporting" style={styles.overAmount}>
            {fmtUsd(violation.overByUsd)} over
          </Text>
        </VStack>
      </HStack>
      <Text type="supporting" color="secondary" maxLines={2}>
        {violation.memo}
      </Text>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Token size="sm" color={statusMeta.color} label={statusMeta.label} />
        <Text type="supporting" color="secondary" maxLines={1}>
          {violation.limitLabel}
        </Text>
        <StackItem size="fill" />
        <Timestamp value={violation.at} format="date" color="secondary" />
        {violation.status !== 'justified' ? (
          <MoreMenu
            label={\`Actions for \${violation.person}'s \${violation.category} violation\`}
            size="sm"
            items={[
              {
                label: 'Approve justification',
                onClick: () => onSetStatus(violation.id, 'justified', 'Elena Voss'),
              },
              ...(violation.status === 'pending'
                ? [
                    {
                      label: 'Escalate to Finance',
                      onClick: () => onSetStatus(violation.id, 'escalated'),
                    },
                  ]
                : []),
              {label: 'Send reminder', onClick: () => onRemind(violation)},
            ]}
          />
        ) : null}
      </HStack>
      {violation.status === 'justified' && violation.reviewer !== undefined ? (
        <Text type="supporting" color="secondary">
          Approved by {violation.reviewer}
        </Text>
      ) : null}
    </div>
  );
}

function ViolationFeed({
  policy,
  violations,
  onSetStatus,
  onRemind,
}: {
  policy: Policy;
  violations: Violation[];
  onSetStatus: (id: string, status: ViolationStatus, reviewer?: string) => void;
  onRemind: (violation: Violation) => void;
}) {
  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ShieldAlertIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Heading level={2}>Violations · 30 days</Heading>
        </StackItem>
        {violations.length > 0 ? (
          <Badge label={String(violations.length)} variant="warning" />
        ) : null}
      </HStack>
      {violations.length === 0 ? (
        <HStack gap={2} vAlign="center">
          <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            No out-of-policy expenses against {policy.name} in the last 30
            days — {policy.effectiveness.inPolicy30d} of{' '}
            {policy.effectiveness.expenses30d} expenses cleared.
          </Text>
        </HStack>
      ) : (
        violations.map(violation => (
          <ViolationRow
            key={violation.id}
            violation={violation}
            onSetStatus={onSetStatus}
            onRemind={onRemind}
          />
        ))
      )}
    </VStack>
  );
}

function AuditList() {
  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={HistoryIcon} size="sm" color="secondary" />
        <Heading level={2}>Recent policy changes</Heading>
      </HStack>
      <VStack gap={3}>
        {AUDIT_FEED.map(entry => (
          <div key={entry.id} style={styles.auditRow}>
            <Avatar name={entry.actor} size="xsmall" />
            <VStack gap={0} style={{minWidth: 0}}>
              <Text type="supporting" maxLines={3}>
                <strong>{entry.actor}</strong> — {entry.change}
              </Text>
              <Timestamp value={entry.at} format="date" color="secondary" />
            </VStack>
          </div>
        ))}
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const POLICY_SELECT_OPTIONS = POLICIES.map(policy => ({
  value: policy.id,
  label:
    policy.violations.length > 0
      ? \`\${policy.name} · \${policy.violations.length} violation\${
          policy.violations.length === 1 ? '' : 's'
        }\`
      : policy.name,
}));

function initialChains(): Record<PolicyId, ChainStep[]> {
  return {
    travel: TRAVEL_POLICY.chain,
    meals: MEALS_POLICY.chain,
    software: SOFTWARE_POLICY.chain,
    equipment: EQUIPMENT_POLICY.chain,
    events: EVENTS_POLICY.chain,
  };
}

function initialViolations(): Record<PolicyId, Violation[]> {
  return {
    travel: TRAVEL_POLICY.violations,
    meals: MEALS_POLICY.violations,
    software: SOFTWARE_POLICY.violations,
    equipment: EQUIPMENT_POLICY.violations,
    events: EVENTS_POLICY.violations,
  };
}

export default function FinSpendPoliciesTemplate() {
  const [activeId, setActiveId] = useState<PolicyId>('travel');
  const [chains, setChains] = useState<Record<PolicyId, ChainStep[]>>(initialChains);
  const [violations, setViolations] =
    useState<Record<PolicyId, Violation[]>>(initialViolations);
  const [receiptEnabled, setReceiptEnabled] = useState<Record<PolicyId, boolean>>({
    travel: true,
    meals: true,
    software: true,
    equipment: true,
    events: true,
  });
  const [announcement, setAnnouncement] = useState('');
  const [addedTierCount, setAddedTierCount] = useState(0);

  // Responsive contract: <=1180px drops the end panel (feed renders
  // inline); <=860px drops the rail (policy Selector appears).
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const policy = policyById(activeId);
  const policySteps = chains[activeId];
  const policyViolations = violations[activeId];

  const selectPolicy = (id: PolicyId) => {
    setActiveId(id);
    setAnnouncement(\`Showing the \${policyById(id).name} policy\`);
  };

  const addTier = () => {
    const nextCount = addedTierCount + 1;
    setAddedTierCount(nextCount);
    setChains(prev => ({
      ...prev,
      [activeId]: [
        ...prev[activeId],
        {
          id: \`c-added-\${nextCount}\`,
          condition: 'New tier',
          kind: 'manager',
          title: 'Manager approval',
          detail: 'Set the threshold band and approver for this tier',
          slaLabel: '24h SLA',
        },
      ],
    }));
    setAnnouncement(\`Added an approval tier to \${policy.name}\`);
  };

  const removeTier = (stepId: string) => {
    setChains(prev => ({
      ...prev,
      [activeId]: prev[activeId].filter(step => step.id !== stepId),
    }));
    setAnnouncement(\`Removed an approval tier from \${policy.name}\`);
  };

  const setViolationStatus = (
    violationId: string,
    status: ViolationStatus,
    reviewer?: string,
  ) => {
    setViolations(prev => ({
      ...prev,
      [activeId]: prev[activeId].map(violation =>
        violation.id === violationId ? {...violation, status, reviewer} : violation,
      ),
    }));
    setAnnouncement(
      status === 'justified'
        ? 'Justification approved'
        : 'Violation escalated to Finance',
    );
  };

  const remind = (violation: Violation) => {
    setAnnouncement(\`Reminder sent to \${violation.person}\`);
  };

  const toggleReceipt = (checked: boolean) => {
    setReceiptEnabled(prev => ({...prev, [activeId]: checked}));
    setAnnouncement(
      checked
        ? \`Receipt rule enabled for \${policy.name}\`
        : \`Receipt rule disabled for \${policy.name}\`,
    );
  };

  // ----- header: brand, org-wide roll-up chip, export + new policy -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ShieldCheckIcon} size="md" color="secondary" />
          <Heading level={1}>Spend Policies</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · 140 employees
          </Text>
        </HStack>
        <StackItem size="fill" />
        {!isCompact ? (
          <Token
            size="sm"
            color="green"
            label={\`\${fmtPct(ORG_ROLLUP.ratePct)} in-policy · \${ORG_ROLLUP.violations} violations (30d)\`}
          />
        ) : null}
        <Button
          label="Export"
          variant="ghost"
          size="sm"
          icon={<Icon icon={DownloadIcon} size="sm" />}
        />
        <Button
          label="New policy"
          variant="primary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- policy title block (policy Selector replaces the rail <=860px) --
  const titleBlock = (
    <VStack gap={2}>
      {isCompact ? (
        <Selector
          label="Spend policy"
          isLabelHidden
          options={POLICY_SELECT_OPTIONS}
          value={activeId}
          onChange={value => selectPolicy(value as PolicyId)}
          size="sm"
          width={260}
        />
      ) : null}
      <HStack gap={3} vAlign="center" wrap="wrap">
        <span style={{...styles.policyGlyph, color: policy.color}}>
          <Icon icon={policy.icon} size="sm" color="inherit" />
        </span>
        <Heading level={2}>{policy.name} policy</Heading>
        <Token size="sm" color="green" label={\`Active · \${policy.version}\`} />
        <HStack gap={1} vAlign="center">
          <Icon icon={CalendarDaysIcon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary">
            Effective <Timestamp value={policy.effectiveDate} format="date" />
          </Text>
        </HStack>
        <StackItem size="fill" />
        <HStack gap={2} vAlign="center">
          <Avatar name={policy.owner} size="xsmall" />
          <Text type="supporting" color="secondary" maxLines={1}>
            {policy.owner} · {policy.ownerRole}
          </Text>
        </HStack>
        <MoreMenu
          label={\`\${policy.name} policy actions\`}
          size="sm"
          items={[
            {label: 'Duplicate policy', onClick: () => {}},
            {label: 'View change history', onClick: () => {}},
            {type: 'divider' as const},
            {label: 'Archive policy', onClick: () => {}},
          ]}
        />
      </HStack>
      <Text type="supporting" color="secondary">
        {policy.summary} Applies to {policy.scope.toLowerCase()} · last
        updated <Timestamp value={policy.updatedAt} format="date" /> by{' '}
        {policy.updatedBy}.
      </Text>
    </VStack>
  );

  const feed = (
    <ViolationFeed
      policy={policy}
      violations={policyViolations}
      onSetStatus={setViolationStatus}
      onRemind={remind}
    />
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel width={280} padding={0} hasDivider label="Spend policies">
              <PolicyRail activeId={activeId} onSelect={selectPolicy} />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentScroll}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              <VStack gap={4}>
                {titleBlock}
                <EffectivenessStrip policy={policy} />
                <LimitsSection policy={policy} isCompact={isCompact} />
                <ApprovalChainSection
                  steps={policySteps}
                  onAddTier={addTier}
                  onRemoveTier={removeTier}
                />
                <ReceiptRuleSection
                  policy={policy}
                  isEnabled={receiptEnabled[activeId]}
                  onToggle={toggleReceipt}
                />
                {/* <=1180px: the end panel is dropped — the violation feed
                    and change audit render inline so nothing is lost. */}
                {isPanelHidden ? (
                  <>
                    <Divider />
                    {feed}
                    <Divider />
                    <AuditList />
                  </>
                ) : null}
              </VStack>
            </div>
          </LayoutContent>
        }
        end={
          !isPanelHidden ? (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              label={\`\${policy.name} violations and policy changes\`}>
              <div style={styles.detailScroll}>
                <VStack gap={5}>
                  {feed}
                  <Divider />
                  <AuditList />
                </VStack>
              </div>
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
`;export{e as default};