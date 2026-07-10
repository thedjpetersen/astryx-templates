var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Vetlane third-party renewal book
 *   for FY26: 9 vendors across four time-to-renewal lanes, each with a
 *   weighted attestation checklist drawn from an 8-item catalog
 *   (weights: SOC 2 ×3 · pen test ×2 · DPA ×2 · SIG Lite ×2 · insurance ×1 ·
 *   subprocessors ×1 · BC/DR ×1 · access review ×1). The demo's internal
 *   today is fixed at Thu Jul 9, 2026; every "days to renewal" figure is a
 *   stored dual field beside its display date, never computed from a clock.
 *   Cross-checks verified by hand — per-vendor verified/total weight:
 *   Streamlyne 4/12 · Fastpath 10/11 · Cloudmoor 7/10 · Heliodesk 5/9 ·
 *   Quillbase 4/5 · Nimbus 5/9 · Brightsend 8/8 · Loomworks 3/5 ·
 *   Vantage 3/8 → portfolio 49/77 = 63.6% → the 64% readiness stat (the
 *   page derives it live from the item set, so verifying Streamlyne's SOC 2
 *   alone moves it to 52/77 = 68%). Item census: 28 verified + 11 pending +
 *   4 gaps = 43. Lane ACV sums: ≤30d $724,500 · 31–60d $115,300 · 61–90d
 *   $196,000 · 90+d $115,600 = $1,151,400 renewal book. Open escalations: 2
 *   (Streamlyne 3d + Cloudmoor 27d — the only vendors with gap weight ≥ 1
 *   inside 45 days). No clock reads, no randomness, no timers, no network
 *   assets.
 * @output Vetlane — Vendor Risk Renewal runway. A third-party risk console
 *   that lays the renewal book out as four horizontal time-to-renewal lanes
 *   (≤30 · 31–60 · 61–90 · 90+ days), each lane a labeled row of risk heat
 *   tiles: vendor, tier, renewal date + days chip, ACV, a segmented
 *   verified/pending/gap heat bar, and a live gap counter. A 356px
 *   attestation pane owns the selected vendor: readiness arc, weighted
 *   checklist rows with per-item Verify / Request actions, and an activity
 *   ledger. An escalation queue strip under the runway lists gap-carrying
 *   vendors inside 45 days. Signature move: recording an attestation
 *   (Verify on a gap row) clears the gap from the heat bar, decrements the
 *   tile's gap chip, regrades the tile (Streamlyne drops critical →
 *   elevated once both gaps clear), re-derives the header readiness % from
 *   49/77 toward 53/77, and removes the vendor from the escalation queue in
 *   the same render — with snapshot-exact Undo and a polite live-region
 *   announcement. A screenshot cannot show the cascade; the interaction is
 *   the product.
 * @position Page template; emitted by \`astryx template vendor-risk-renewal\`
 *
 * Frame: root 100dvh div > Layout height="fill". LayoutHeader carries the
 *   brand row (Vetlane lane-shield mark, title, fixed as-of date, portfolio
 *   KPI strip: readiness % · open gaps · escalations · 30-day renewals ·
 *   renewal book $). LayoutContent holds a two-column CSS grid:
 *   minmax(0,1fr) runway column (four lane rows, then the escalation
 *   queue strip) + 356px attestation pane. The content column is the page
 *   scroller; the pane is sticky (top 12) at desktop widths.
 * Container policy: work-surface archetype — lanes are labeled rows, heat
 *   tiles are single <button> elements (aria-pressed selection), checklist
 *   rows are static rows with real <button> actions, escalation entries are
 *   rows. No marketing cards; KPI tiles are the only card-shaped chrome.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (Vetlane crimson) as a light-dark() pair with contrast math at the
 *   declaration; four state pairs (verified green, pending amber, elevated
 *   orange, gap red) each carry their own math. Text colors are
 *   --color-text-primary / --color-text-secondary only.
 * Density grid (repeated verbatim): header KPI tiles 64px tall · lane label
 *   column 148px · heat tiles minmax(212px,1fr) × 128px · heat bar 6px ·
 *   checklist rows 56px min · escalation rows 64px min · pane 356px ·
 *   12px gutters · 10px container radius · 40px minimum hit targets ·
 *   tabular-nums on every date, count, %, and dollar figure.
 * Fixture policy: one state owner — a Record<vendorId, Record<itemId,
 *   ItemState>> — feeds every derivation (grades, readiness, heat bars, gap
 *   chips, escalation queue, activity ledger). Verify/Request/Undo mutate
 *   that record only; every surface re-derives in the same render. "Today"
 *   stamps are the fixed literal 'Jul 9'.
 *
 * Responsive contract (subtraction, not squeeze):
 * - Default (the ~1045–1075px inline demo stage — no media query needed):
 *   full two-column frame; runway tiles auto-fill at minmax(212px,1fr), so
 *   the ~640px runway column carries 2 tiles per lane row and wraps.
 * - <= 900px: the attestation pane leaves the grid and stacks below the
 *   escalation queue at full width; lane label column narrows to 108px.
 * - <= 620px (390px embed iframe — media queries DO fire there): lane
 *   labels move above their tile row, KPI strip wraps to a 2-up grid, tile
 *   meta drops the ACV line, and checklist action buttons go full-width.
 *   Every flex chain holds minHeight: 0; nothing scrolls horizontally.
 */

import {useMemo, useRef, useState} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {
  AlertTriangleIcon,
  ArchiveIcon,
  ArrowUpRightIcon,
  BellRingIcon,
  CheckIcon,
  ClipboardCheckIcon,
  HistoryIcon,
  MailIcon,
  ShieldAlertIcon,
  Undo2Icon,
} from 'lucide-react';

const SCOPE = 'tpl-vendor-risk-renewal';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Vetlane crimson).
// #BE123C on #FFFFFF ≈ 5.9:1 (passes 4.5:1 for text at any size);
// #FB7185 on a ~#1C1C1E dark surface ≈ 6.8:1.
const BRAND_ACCENT = 'light-dark(#BE123C, #FB7185)';
// Text/glyphs over a BRAND_ACCENT fill: #FFFFFF on #BE123C ≈ 5.9:1;
// #300711 on #FB7185 ≈ 7.4:1 (white on #FB7185 would fail at ≈1.9:1).
const BRAND_ON = 'light-dark(#FFFFFF, #300711)';
// Non-text brand wash for selected/hover chrome — decorative, no ratio claim.
const BRAND_TINT = 'light-dark(rgba(190, 18, 60, 0.08), rgba(251, 113, 133, 0.14))';

// State pairs (text-grade on body surfaces):
// verified green — #15803D on #FFFFFF ≈ 4.6:1; #4ADE80 on #1C1C1E ≈ 9.6:1.
const OK_GREEN = 'light-dark(#15803D, #4ADE80)';
const OK_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// pending amber — #92400E on #FFFFFF ≈ 6.4:1; #FBBF24 on #1C1C1E ≈ 10.2:1.
const PEND_AMBER = 'light-dark(#92400E, #FBBF24)';
const PEND_TINT = 'light-dark(rgba(146, 64, 14, 0.10), rgba(251, 191, 36, 0.14))';
// elevated orange — #B45309 on #FFFFFF ≈ 4.8:1; #FDBA74 on #1C1C1E ≈ 10.4:1.
const ELEV_ORANGE = 'light-dark(#B45309, #FDBA74)';
const ELEV_TINT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(253, 186, 116, 0.14))';
// gap / critical red — #B42318 on #FFFFFF ≈ 6.3:1; #F97066 on #1C1C1E ≈ 5.6:1.
// (Deliberately vermilion, not the crimson brand pair, so "brand chrome" and
// "risk state" never read as the same signal.)
const GAP_RED = 'light-dark(#B42318, #F97066)';
const GAP_TINT = 'light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.14))';

// ---------------------------------------------------------------------------
// DOMAIN MODEL
// ---------------------------------------------------------------------------

type ItemStatus = 'verified' | 'pending' | 'gap';

type CatalogItem = {
  id: string;
  label: string;
  /** Weight used by readiness %, grades, and escalation — see gradeVendor. */
  weight: number;
  hint: string;
};

/**
 * The attestation catalog. Weights are the risk currency of the whole page:
 * readiness = Σ verified weight / Σ total weight, grades and escalations key
 * off gap/pending weight sums. soc2 3 · pentest 2 · dpa 2 · sig 2 ·
 * insurance 1 · subproc 1 · bcdr 1 · access 1 (repeated in the header
 * comment arithmetic).
 */
const CATALOG: readonly CatalogItem[] = [
  {id: 'soc2', label: 'SOC 2 Type II report (FY26)', weight: 3, hint: 'Bridge letters accepted to 90 days past period end.'},
  {id: 'pentest', label: 'Annual penetration test summary', weight: 2, hint: 'Executive summary + remediation SLAs; full report not required.'},
  {id: 'dpa', label: 'Signed DPA — 2026 template', weight: 2, hint: 'Legal reissued the template Mar 2026; pre-2026 signatures are gaps.'},
  {id: 'sig', label: 'SIG Lite questionnaire', weight: 2, hint: 'Shared-assessments SIG Lite 2026; scoped answers acceptable.'},
  {id: 'insurance', label: 'Certificate of insurance — cyber $5M', weight: 1, hint: 'Must name Vetlane Holdings as certificate holder.'},
  {id: 'subproc', label: 'Subprocessor list review', weight: 1, hint: 'Diff against the list attached to the current order form.'},
  {id: 'bcdr', label: 'BC/DR test evidence', weight: 1, hint: 'Most recent failover exercise within 12 months.'},
  {id: 'access', label: 'Quarterly access review', weight: 1, hint: 'Named-admin roster reconciled against the SSO group.'},
] as const;

const CATALOG_BY_ID = new Map(CATALOG.map(item => [item.id, item]));

type ItemState = {
  status: ItemStatus;
  /** Fixed display stamp — 'Verified May 28' / 'Requested Jun 24' / 'Expired Apr 30'. */
  stamp: string;
  note?: string;
};

type Vendor = {
  id: string;
  name: string;
  category: string;
  tier: 1 | 2 | 3;
  /** Display date + dual math field — never derived from a clock. */
  renewalDate: string;
  daysToRenewal: number;
  acv: number;
  acvLabel: string;
  owner: string;
  ownerInitials: string;
  /** Which catalog items this vendor's tier requires, in checklist order. */
  itemIds: readonly string[];
};

type LaneId = 'lane-30' | 'lane-60' | 'lane-90' | 'lane-far';

type Lane = {
  id: LaneId;
  label: string;
  sublabel: string;
  /** Inclusive day bounds for membership — documented, not computed. */
  maxDays: number;
};

const LANES: readonly Lane[] = [
  {id: 'lane-30', label: 'Next 30 days', sublabel: 'renewal papers due now', maxDays: 30},
  {id: 'lane-60', label: '31–60 days', sublabel: 'evidence collection window', maxDays: 60},
  {id: 'lane-90', label: '61–90 days', sublabel: 'kickoff notices sent', maxDays: 90},
  {id: 'lane-far', label: '90+ days', sublabel: 'monitoring only', maxDays: Number.POSITIVE_INFINITY},
] as const;

// ---------------------------------------------------------------------------
// FIXTURES — the FY26 renewal book. 9 vendors; per-vendor verified/total
// weights and the 49/77 portfolio sum are cross-checked in the header
// comment. Owners are a fixed roster; the signed-in analyst is Priya
// Natarajan (her initials stamp new ledger entries).
// ---------------------------------------------------------------------------

const SIGNED_IN = 'Priya Natarajan';
const SIGNED_IN_INITIALS = 'PN';
/** The demo's internal today — every mutation stamps this literal. */
const TODAY_STAMP = 'Jul 9';
const AS_OF_LABEL = 'Thu Jul 9, 2026';

const VENDORS: readonly Vendor[] = [
  {
    id: 'streamlyne',
    name: 'Streamlyne Analytics',
    category: 'Data platform',
    tier: 1,
    renewalDate: 'Jul 12, 2026',
    daysToRenewal: 3,
    acv: 184000,
    acvLabel: '$184,000',
    owner: 'Priya Natarajan',
    ownerInitials: 'PN',
    itemIds: ['soc2', 'pentest', 'dpa', 'sig', 'insurance', 'subproc', 'access'],
  },
  {
    id: 'fastpath',
    name: 'Fastpath Payments',
    category: 'Payment processing',
    tier: 1,
    renewalDate: 'Jul 24, 2026',
    daysToRenewal: 15,
    acv: 312000,
    acvLabel: '$312,000',
    owner: 'Marcus Bell',
    ownerInitials: 'MB',
    itemIds: ['soc2', 'pentest', 'dpa', 'sig', 'insurance', 'access'],
  },
  {
    id: 'cloudmoor',
    name: 'Cloudmoor Hosting',
    category: 'Infrastructure',
    tier: 1,
    renewalDate: 'Aug 5, 2026',
    daysToRenewal: 27,
    acv: 228500,
    acvLabel: '$228,500',
    owner: 'Priya Natarajan',
    ownerInitials: 'PN',
    itemIds: ['soc2', 'pentest', 'dpa', 'insurance', 'bcdr', 'access'],
  },
  {
    id: 'heliodesk',
    name: 'Heliodesk CX',
    category: 'Support suite',
    tier: 2,
    renewalDate: 'Aug 14, 2026',
    daysToRenewal: 36,
    acv: 96400,
    acvLabel: '$96,400',
    owner: 'Tomás Rivera',
    ownerInitials: 'TR',
    itemIds: ['soc2', 'dpa', 'sig', 'insurance', 'access'],
  },
  {
    id: 'quillbase',
    name: 'Quillbase Docs',
    category: 'Documentation',
    tier: 3,
    renewalDate: 'Aug 28, 2026',
    daysToRenewal: 50,
    acv: 18900,
    acvLabel: '$18,900',
    owner: 'Tomás Rivera',
    ownerInitials: 'TR',
    itemIds: ['dpa', 'sig', 'insurance'],
  },
  {
    id: 'nimbus',
    name: 'Nimbus Payroll',
    category: 'HR & payroll',
    tier: 1,
    renewalDate: 'Sep 18, 2026',
    daysToRenewal: 71,
    acv: 142000,
    acvLabel: '$142,000',
    owner: 'Aiko Tanabe',
    ownerInitials: 'AT',
    itemIds: ['soc2', 'pentest', 'dpa', 'insurance', 'access'],
  },
  {
    id: 'brightsend',
    name: 'Brightsend Email',
    category: 'Marketing comms',
    tier: 2,
    renewalDate: 'Oct 2, 2026',
    daysToRenewal: 85,
    acv: 54000,
    acvLabel: '$54,000',
    owner: 'Marcus Bell',
    ownerInitials: 'MB',
    itemIds: ['soc2', 'dpa', 'sig', 'insurance'],
  },
  {
    // Stress fixture: 47-character display name exercises tile + pane
    // truncation (single-line ellipsis on tiles, two-line clamp in the pane).
    id: 'loomworks',
    name: 'Loomworks Design Cloud (fka Atelier Loom GmbH)',
    category: 'Design tooling',
    tier: 3,
    renewalDate: 'Oct 30, 2026',
    daysToRenewal: 113,
    acv: 27600,
    acvLabel: '$27,600',
    owner: 'Tomás Rivera',
    ownerInitials: 'TR',
    itemIds: ['dpa', 'sig', 'insurance'],
  },
  {
    id: 'vantage',
    name: 'Vantage Legal AI',
    category: 'Legal research',
    tier: 2,
    renewalDate: 'Dec 1, 2026',
    daysToRenewal: 145,
    acv: 88000,
    acvLabel: '$88,000',
    owner: 'Aiko Tanabe',
    ownerInitials: 'AT',
    itemIds: ['soc2', 'dpa', 'sig', 'insurance'],
  },
] as const;

const VENDOR_BY_ID = new Map(VENDORS.map(vendor => [vendor.id, vendor]));

type ItemStateMap = Record<string, Record<string, ItemState>>;

/**
 * Initial checklist states. Verified 4+10+7+5+4+5+8+3+3 = 49 of 77 weight →
 * the 64% readiness stat. Gap items: Streamlyne soc2 + subproc, Cloudmoor
 * pentest, Loomworks dpa (4 items, matching the header census).
 */
const INITIAL_ITEM_STATES: ItemStateMap = {
  streamlyne: {
    soc2: {status: 'gap', stamp: 'Expired Apr 30', note: 'FY25 report aged out; FY26 audit fieldwork finished Jun 19 per their CISO.'},
    pentest: {status: 'pending', stamp: 'Requested Jun 24'},
    dpa: {status: 'verified', stamp: 'Verified May 28'},
    sig: {status: 'pending', stamp: 'Requested Jun 24'},
    insurance: {status: 'verified', stamp: 'Verified Jun 2'},
    subproc: {status: 'gap', stamp: 'Stale since Mar 14', note: 'Two new subprocessors announced Jun 30 are not on the reviewed list.'},
    access: {status: 'verified', stamp: 'Verified Jul 1'},
  },
  fastpath: {
    soc2: {status: 'verified', stamp: 'Verified Jun 11'},
    pentest: {status: 'verified', stamp: 'Verified Jun 11'},
    dpa: {status: 'verified', stamp: 'Verified Apr 22'},
    sig: {status: 'verified', stamp: 'Verified Jun 11'},
    insurance: {status: 'pending', stamp: 'Requested Jul 2', note: 'Broker reissuing with Vetlane Holdings as certificate holder.'},
    access: {status: 'verified', stamp: 'Verified Jul 6'},
  },
  cloudmoor: {
    soc2: {status: 'verified', stamp: 'Verified May 15'},
    pentest: {status: 'gap', stamp: 'Overdue since Jun 1', note: 'Vendor slipped their Q2 test to late July — inside our renewal window.'},
    dpa: {status: 'verified', stamp: 'Verified May 15'},
    insurance: {status: 'verified', stamp: 'Verified May 20'},
    bcdr: {status: 'pending', stamp: 'Requested Jun 30'},
    access: {status: 'verified', stamp: 'Verified Jul 6'},
  },
  heliodesk: {
    soc2: {status: 'verified', stamp: 'Verified Jun 4'},
    dpa: {status: 'pending', stamp: 'Sent for signature Jun 26'},
    sig: {status: 'pending', stamp: 'Requested Jun 18'},
    insurance: {status: 'verified', stamp: 'Verified Jun 4'},
    access: {status: 'verified', stamp: 'Verified Jun 30'},
  },
  quillbase: {
    dpa: {status: 'verified', stamp: 'Verified May 8'},
    sig: {status: 'verified', stamp: 'Verified May 8'},
    insurance: {status: 'pending', stamp: 'Requested Jul 7'},
  },
  nimbus: {
    soc2: {status: 'pending', stamp: 'Requested Jun 12', note: 'Report under NDA portal; access approved, download pending.'},
    pentest: {status: 'verified', stamp: 'Verified Jun 12'},
    dpa: {status: 'verified', stamp: 'Verified Mar 30'},
    insurance: {status: 'verified', stamp: 'Verified Jun 12'},
    access: {status: 'pending', stamp: 'Requested Jul 6'},
  },
  brightsend: {
    soc2: {status: 'verified', stamp: 'Verified Jun 20'},
    dpa: {status: 'verified', stamp: 'Verified Jun 20'},
    sig: {status: 'verified', stamp: 'Verified Jun 20'},
    insurance: {status: 'verified', stamp: 'Verified Jun 20'},
  },
  loomworks: {
    dpa: {status: 'gap', stamp: 'On 2023 template', note: 'Refused the 2026 template in April; legal drafting a rider instead.'},
    sig: {status: 'verified', stamp: 'Verified Feb 12'},
    insurance: {status: 'verified', stamp: 'Verified Feb 12'},
  },
  vantage: {
    soc2: {status: 'pending', stamp: 'Requested Jun 27'},
    dpa: {status: 'verified', stamp: 'Verified Jan 15'},
    sig: {status: 'pending', stamp: 'Requested Jun 27'},
    insurance: {status: 'verified', stamp: 'Verified Jan 15'},
  },
};

type LedgerEntry = {
  id: string;
  vendorId: string;
  text: string;
  stamp: string;
  by: string;
};

/** Seed ledger — fixed history; new entries prepend with the Jul 9 stamp. */
const INITIAL_LEDGER: readonly LedgerEntry[] = [
  {id: 'led-3', vendorId: 'streamlyne', text: 'Quarterly access review verified — SSO roster reconciled, 2 stale admins removed.', stamp: 'Jul 1', by: 'PN'},
  {id: 'led-2', vendorId: 'cloudmoor', text: 'BC/DR evidence requested via vendor portal; auto-reminder set for Jul 14.', stamp: 'Jun 30', by: 'PN'},
  {id: 'led-1', vendorId: 'streamlyne', text: 'Escalated to Priya Natarajan — SOC 2 gap inside the 45-day window.', stamp: 'Jun 26', by: 'MB'},
] as const;

// ---------------------------------------------------------------------------
// DERIVATIONS — one pure pipeline from the item-state record. Every surface
// (tiles, KPI strip, escalation queue, pane) reads these; nothing caches.
// ---------------------------------------------------------------------------

type Grade = 'critical' | 'elevated' | 'watch' | 'clear';

const GRADE_META: Record<Grade, {label: string; color: string; tint: string; rank: number}> = {
  critical: {label: 'Critical', color: GAP_RED, tint: GAP_TINT, rank: 0},
  elevated: {label: 'Elevated', color: ELEV_ORANGE, tint: ELEV_TINT, rank: 1},
  watch: {label: 'Watch', color: PEND_AMBER, tint: PEND_TINT, rank: 2},
  clear: {label: 'Clear', color: OK_GREEN, tint: OK_TINT, rank: 3},
};

const STATUS_META: Record<ItemStatus, {label: string; color: string; tint: string}> = {
  verified: {label: 'Verified', color: OK_GREEN, tint: OK_TINT},
  pending: {label: 'Pending', color: PEND_AMBER, tint: PEND_TINT},
  gap: {label: 'Gap', color: GAP_RED, tint: GAP_TINT},
};

type VendorDerived = {
  vendor: Vendor;
  verifiedWeight: number;
  pendingWeight: number;
  gapWeight: number;
  totalWeight: number;
  gapCount: number;
  pendingCount: number;
  verifiedCount: number;
  /** 0–100, rounded — verifiedWeight / totalWeight. */
  readinessPct: number;
  grade: Grade;
  /** gapWeight ≥ 1 inside 45 days ⇒ on the escalation queue. */
  isEscalated: boolean;
};

/**
 * Grade rules (documented, deterministic):
 *   critical = gapW ≥ 3, or any gap inside 30 days;
 *   elevated = any gap, or pendW ≥ 3 inside 60 days;
 *   watch    = any pending;
 *   clear    = everything verified.
 * Escalation = any gap inside 45 days (matches the seed's 2-entry queue).
 */
function deriveVendor(vendor: Vendor, states: ItemStateMap): VendorDerived {
  let verifiedWeight = 0;
  let pendingWeight = 0;
  let gapWeight = 0;
  let totalWeight = 0;
  let gapCount = 0;
  let pendingCount = 0;
  let verifiedCount = 0;
  for (const itemId of vendor.itemIds) {
    const item = CATALOG_BY_ID.get(itemId);
    const state = states[vendor.id]?.[itemId];
    if (item === undefined || state === undefined) {
      continue;
    }
    totalWeight += item.weight;
    if (state.status === 'verified') {
      verifiedWeight += item.weight;
      verifiedCount += 1;
    } else if (state.status === 'pending') {
      pendingWeight += item.weight;
      pendingCount += 1;
    } else {
      gapWeight += item.weight;
      gapCount += 1;
    }
  }
  const days = vendor.daysToRenewal;
  let grade: Grade;
  if (gapWeight >= 3 || (gapWeight >= 1 && days <= 30)) {
    grade = 'critical';
  } else if (gapWeight >= 1 || (pendingWeight >= 3 && days <= 60)) {
    grade = 'elevated';
  } else if (pendingWeight >= 1) {
    grade = 'watch';
  } else {
    grade = 'clear';
  }
  return {
    vendor,
    verifiedWeight,
    pendingWeight,
    gapWeight,
    totalWeight,
    gapCount,
    pendingCount,
    verifiedCount,
    readinessPct: totalWeight === 0 ? 100 : Math.round((verifiedWeight / totalWeight) * 100),
    grade,
    isEscalated: gapWeight >= 1 && days <= 45,
  };
}

function laneForVendor(vendor: Vendor): LaneId {
  for (const lane of LANES) {
    if (vendor.daysToRenewal <= lane.maxDays) {
      return lane.id;
    }
  }
  return 'lane-far';
}

/** '$1,151,400' — display-side only; math stays on the numeric acv field. */
function formatUsd(value: number): string {
  return \`$\${value.toLocaleString('en-US')}\`;
}

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector scoped under .tpl-vendor-risk-renewal.
// Density grid repeated from the header: KPI 64 · lane label 148 · tiles
// minmax(212,1fr)×128 · heat bar 6 · checklist rows 56 · escalation rows 64
// · pane 356 · gutters 12 · radius 10 · hit targets ≥40.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.\${SCOPE} *,
.\${SCOPE} *::before,
.\${SCOPE} *::after {
  box-sizing: border-box;
}
.\${SCOPE} button {
  font: inherit;
  color: inherit;
}
.\${SCOPE} button:focus-visible,
.\${SCOPE} [role='option']:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}

/* ---- header ------------------------------------------------------------ */
.\${SCOPE}.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
}
.\${SCOPE} .brandCluster {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.\${SCOPE} .brandMark {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: \${BRAND_ACCENT};
  color: \${BRAND_ON};
}
.\${SCOPE} .brandText {
  min-width: 0;
}
.\${SCOPE} .eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pageTitle {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
}
.\${SCOPE} .asOf {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .kpiStrip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-inline-start: auto;
}
.\${SCOPE} .kpiTile {
  display: flex;
  min-height: 64px;
  min-width: 108px;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 8px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
}
.\${SCOPE} .kpiValue {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.\${SCOPE} .kpiDelta {
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .kpiLabel {
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* ---- workspace grid ------------------------------------------------------ */
.\${SCOPE}.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 356px;
  gap: 12px;
  align-items: start;
  width: 100%;
  padding: 12px 16px 20px;
}
.\${SCOPE} .runwayColumn {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

/* ---- lanes --------------------------------------------------------------- */
.\${SCOPE} .lane {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr);
  gap: 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
  padding: 12px;
}
.\${SCOPE} .laneLabel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-top: 2px;
}
.\${SCOPE} .laneName {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}
.\${SCOPE} .laneSub {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .laneStats {
  margin-top: auto;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .laneTiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(212px, 1fr));
  gap: 12px;
  min-width: 0;
}

/* ---- heat tiles — one <button> each -------------------------------------- */
.\${SCOPE} .tile {
  position: relative;
  display: flex;
  min-height: 128px;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border: var(--border-width) solid var(--color-border);
  border-inline-start: 4px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-body);
  text-align: start;
  cursor: pointer;
}
.\${SCOPE} .tile[aria-pressed='true'] {
  box-shadow: inset 0 0 0 1px \${BRAND_ACCENT}, 0 0 0 2px \${BRAND_ACCENT};
}
@media (hover: hover) {
  .\${SCOPE} .tile:hover {
    background: \${BRAND_TINT};
  }
}
.\${SCOPE} .tileTop {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.\${SCOPE} .tileName {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .tierBadge {
  flex-shrink: 0;
  padding: 1px 6px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .tileMetaRow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 0;
  flex-wrap: wrap;
}
.\${SCOPE} .daysChip {
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .heatBar {
  display: flex;
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-background-muted);
}
.\${SCOPE} .heatSeg {
  height: 100%;
}
.\${SCOPE} .tileFoot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .gradePill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
}
.\${SCOPE} .footStat {
  color: var(--color-text-secondary);
}
.\${SCOPE} .footStat strong {
  color: var(--color-text-primary);
  font-weight: 700;
}

/* ---- escalation queue ----------------------------------------------------- */
.\${SCOPE} .escalation {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
  padding: 12px;
}
.\${SCOPE} .escalationHead {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.\${SCOPE} .sectionTitle {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}
.\${SCOPE} .escalationCount {
  display: inline-flex;
  min-width: 22px;
  justify-content: center;
  padding: 1px 7px;
  border-radius: 999px;
  background: \${GAP_TINT};
  color: \${GAP_RED};
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .escalationList {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}
.\${SCOPE} .escalationRow {
  display: flex;
  min-height: 64px;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
  border-top: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .escalationBody {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.\${SCOPE} .escalationName {
  margin: 0;
  overflow: hidden;
  font-size: 12.5px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .escalationMeta {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .ownerDot {
  display: inline-flex;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-background-muted);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
}
.\${SCOPE} .escalationOpen {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
@media (hover: hover) {
  .\${SCOPE} .escalationOpen:hover {
    background: \${BRAND_TINT};
  }
}
.\${SCOPE} .emptyState {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 4px;
  border-top: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 12px;
}
.\${SCOPE} .emptyState .emptyGlyph {
  color: \${OK_GREEN};
  display: inline-flex;
}

/* ---- attestation pane ------------------------------------------------------ */
.\${SCOPE} .pane {
  position: sticky;
  top: 12px;
  display: flex;
  min-width: 0;
  flex-direction: column;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
}
.\${SCOPE} .paneHeader {
  display: flex;
  gap: 12px;
  padding: 14px 14px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .paneHeadText {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.\${SCOPE} .paneVendor {
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
}
.\${SCOPE} .paneMeta {
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .arcWrap {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}
.\${SCOPE} .arcValue {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .paneToolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .undoButton {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  gap: 5px;
  margin-inline-start: auto;
  padding: 4px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.\${SCOPE} .undoButton:disabled {
  opacity: 0.45;
  cursor: default;
}
@media (hover: hover) {
  .\${SCOPE} .undoButton:not(:disabled):hover {
    background: \${BRAND_TINT};
  }
}

/* ---- checklist rows --------------------------------------------------------- */
.\${SCOPE} .checkList {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 4px 14px;
  list-style: none;
}
.\${SCOPE} .checkRow {
  display: flex;
  min-height: 56px;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0;
}
.\${SCOPE} .checkRow + .checkRow {
  border-top: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .checkTop {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
}
.\${SCOPE} .checkGlyph {
  flex-shrink: 0;
  margin-top: 1px;
  display: inline-flex;
}
.\${SCOPE} .checkBody {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.\${SCOPE} .checkLabel {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.3;
}
.\${SCOPE} .checkStamp {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .checkNote {
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.\${SCOPE} .weightTag {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  padding-top: 2px;
}
.\${SCOPE} .checkActions {
  display: flex;
  gap: 6px;
}
.\${SCOPE} .checkButton {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.\${SCOPE} .checkButton.verify {
  border-color: \${OK_GREEN};
  color: \${OK_GREEN};
}
@media (hover: hover) {
  .\${SCOPE} .checkButton.verify:hover {
    background: \${OK_TINT};
  }
  .\${SCOPE} .checkButton.request:hover {
    background: \${PEND_TINT};
  }
}
.\${SCOPE} .checkButton.request {
  border-color: \${PEND_AMBER};
  color: \${PEND_AMBER};
}

/* ---- activity ledger ---------------------------------------------------------- */
.\${SCOPE} .ledger {
  padding: 10px 14px 14px;
  border-top: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .ledgerList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}
.\${SCOPE} .ledgerRow {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.\${SCOPE} .ledgerText {
  margin: 0;
  min-width: 0;
  flex: 1;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.\${SCOPE} .ledgerText strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
.\${SCOPE} .ledgerStamp {
  flex-shrink: 0;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  padding-top: 1px;
}

/* ---- a11y utility ----------------------------------------------------------- */
.\${SCOPE} .visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- responsive subtraction ---------------------------------------------------- */
@media (max-width: 900px) {
  .\${SCOPE}.workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .\${SCOPE} .pane {
    position: static;
  }
  .\${SCOPE} .lane {
    grid-template-columns: 108px minmax(0, 1fr);
  }
}
@media (max-width: 620px) {
  .\${SCOPE} .lane {
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }
  .\${SCOPE} .laneLabel {
    flex-direction: row;
    align-items: baseline;
    gap: 8px;
  }
  .\${SCOPE} .laneStats {
    margin-top: 0;
    margin-inline-start: auto;
  }
  .\${SCOPE} .kpiStrip {
    width: 100%;
    margin-inline-start: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .\${SCOPE} .tileMetaRow .acvMeta {
    display: none;
  }
  .\${SCOPE} .checkActions {
    flex-direction: column;
  }
  .\${SCOPE} .checkButton {
    justify-content: center;
    width: 100%;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .\${SCOPE} .tile,
  .\${SCOPE} .heatSeg,
  .\${SCOPE} .checkButton,
  .\${SCOPE} .escalationOpen {
    transition: background-color 120ms ease, box-shadow 120ms ease, flex-grow 160ms ease;
  }
}
\`;

// ---------------------------------------------------------------------------
// CUSTOM SVG GLYPHS — domain vocabulary a Badge cannot carry.
// ---------------------------------------------------------------------------

/** Vetlane mark — a road lane converging into a shield chevron. */
function BrandMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 1.8 16.8 4.4v5.2c0 4.1-2.9 7.2-6.8 8.6-3.9-1.4-6.8-4.5-6.8-8.6V4.4L10 1.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 5.6v2.6M10 10.4v2.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Attestation status glyph — verified: sealed disc with a check; pending:
 * half-swept ring (a literal "half collected" pie); gap: dashed open ring
 * with a notch. All three share the same 16px disc anatomy so checklist rows
 * keep one optical rhythm.
 */
function StatusGlyph({status}: {status: ItemStatus}) {
  const color = STATUS_META[status].color;
  if (status === 'verified') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{color}}>
        <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.18" />
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="m5 8.2 2 2L11 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'pending') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{color}}>
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Half sweep: from 12 o'clock clockwise to 6 o'clock. */}
        <path d="M8 8 V2.6 A5.4 5.4 0 0 1 8 13.4 Z" fill="currentColor" opacity="0.55" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style={{color}}>
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2.4" />
      <path d="M8 4.6v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="8" cy="11.4" r="1" fill="currentColor" />
    </svg>
  );
}

/** 64px readiness donut for the pane header — arc length = readiness %. */
function ReadinessArc({pct, color}: {pct: number; color: string}) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--color-background-muted)" strokeWidth="6" />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={\`\${dash} \${circumference - dash}\`}
        transform="rotate(-90 32 32)"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENTS — purely presentational; all state lifts to the page.
// ---------------------------------------------------------------------------

function KpiTile({
  value,
  delta,
  label,
  tone,
}: {
  value: string;
  delta?: string;
  label: string;
  tone?: string;
}) {
  return (
    <div className="kpiTile">
      <span className="kpiValue" style={tone !== undefined ? {color: tone} : undefined}>
        {value}
        {delta !== undefined && (
          <span className="kpiDelta" style={{color: OK_GREEN}}>
            {delta}
          </span>
        )}
      </span>
      <span className="kpiLabel">{label}</span>
    </div>
  );
}

function HeatTile({
  derived,
  isSelected,
  onSelect,
}: {
  derived: VendorDerived;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const {vendor, grade} = derived;
  const meta = GRADE_META[grade];
  const urgent = vendor.daysToRenewal <= 30;
  return (
    <button
      type="button"
      className="tile"
      style={{borderInlineStartColor: meta.color}}
      aria-pressed={isSelected}
      aria-label={\`\${vendor.name} — \${meta.label}, renews \${vendor.renewalDate} in \${vendor.daysToRenewal} days, \${derived.gapCount} gaps, \${derived.readinessPct}% ready\`}
      onClick={() => onSelect(vendor.id)}>
      <span className="tileTop">
        <span className="tileName">{vendor.name}</span>
        <span className="tierBadge">T{vendor.tier}</span>
      </span>
      <span className="tileMetaRow">
        <span
          className="daysChip"
          style={{
            background: urgent ? GAP_TINT : 'var(--color-background-muted)',
            color: urgent ? GAP_RED : 'var(--color-text-secondary)',
          }}>
          {vendor.daysToRenewal}d
        </span>
        <span>{vendor.renewalDate}</span>
        <span className="acvMeta">· {vendor.acvLabel} ACV</span>
      </span>
      {/* Heat bar: verified / pending / gap weight, proportional. */}
      <span className="heatBar" aria-hidden="true">
        <span
          className="heatSeg"
          style={{flexGrow: derived.verifiedWeight, backgroundColor: OK_GREEN}}
        />
        <span
          className="heatSeg"
          style={{flexGrow: derived.pendingWeight, backgroundColor: PEND_AMBER}}
        />
        <span className="heatSeg" style={{flexGrow: derived.gapWeight, backgroundColor: GAP_RED}} />
      </span>
      <span className="tileFoot">
        <span className="gradePill" style={{background: meta.tint, color: meta.color}}>
          {meta.label}
        </span>
        <span className="footStat">
          <strong>{derived.readinessPct}%</strong> ready
        </span>
        <span className="footStat">
          <strong>{derived.gapCount}</strong> {derived.gapCount === 1 ? 'gap' : 'gaps'}
        </span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one state owner: itemStates. Everything else derives per render.
// ---------------------------------------------------------------------------

type UndoRecord = {
  vendorId: string;
  itemId: string;
  prev: ItemState;
  ledgerId: string;
};

export default function VendorRiskRenewalTemplate() {
  const [itemStates, setItemStates] = useState<ItemStateMap>(INITIAL_ITEM_STATES);
  const [selectedId, setSelectedId] = useState<string>('streamlyne');
  const [ledger, setLedger] = useState<readonly LedgerEntry[]>(INITIAL_LEDGER);
  const [undoStack, setUndoStack] = useState<readonly UndoRecord[]>([]);
  const [announcement, setAnnouncement] = useState('');
  // Deterministic id sequence for appended ledger entries (no clock ids).
  const ledgerSeq = useRef(100);

  const derivedById = useMemo(() => {
    const map = new Map<string, VendorDerived>();
    for (const vendor of VENDORS) {
      map.set(vendor.id, deriveVendor(vendor, itemStates));
    }
    return map;
  }, [itemStates]);

  const allDerived = useMemo(() => [...derivedById.values()], [derivedById]);

  // Portfolio rollups — live sums, never cached fixtures.
  const portfolio = useMemo(() => {
    let verifiedWeight = 0;
    let totalWeight = 0;
    let gapItems = 0;
    let escalations = 0;
    for (const derived of allDerived) {
      verifiedWeight += derived.verifiedWeight;
      totalWeight += derived.totalWeight;
      gapItems += derived.gapCount;
      if (derived.isEscalated) {
        escalations += 1;
      }
    }
    const dueSoon = VENDORS.filter(vendor => vendor.daysToRenewal <= 30);
    return {
      readinessPct: totalWeight === 0 ? 100 : Math.round((verifiedWeight / totalWeight) * 100),
      verifiedWeight,
      totalWeight,
      gapItems,
      escalations,
      dueSoonCount: dueSoon.length,
      bookTotal: VENDORS.reduce((sum, vendor) => sum + vendor.acv, 0),
    };
  }, [allDerived]);

  const escalated = useMemo(
    () =>
      allDerived
        .filter(derived => derived.isEscalated)
        .sort((a, b) => a.vendor.daysToRenewal - b.vendor.daysToRenewal),
    [allDerived],
  );

  const selected = derivedById.get(selectedId) ?? allDerived[0];
  const selectedVendor = selected.vendor;
  const selectedLedger = ledger.filter(entry => entry.vendorId === selectedVendor.id);

  // ---- mutations -----------------------------------------------------------
  const applyStatus = (vendorId: string, itemId: string, next: ItemStatus) => {
    const vendor = VENDOR_BY_ID.get(vendorId);
    const item = CATALOG_BY_ID.get(itemId);
    const prev = itemStates[vendorId]?.[itemId];
    if (vendor === undefined || item === undefined || prev === undefined) {
      return;
    }
    const wasEscalated = deriveVendor(vendor, itemStates).isEscalated;
    const nextState: ItemState =
      next === 'verified'
        ? {status: 'verified', stamp: \`Verified \${TODAY_STAMP}\`}
        : {status: 'pending', stamp: \`Requested \${TODAY_STAMP}\`};
    const nextStates: ItemStateMap = {
      ...itemStates,
      [vendorId]: {...itemStates[vendorId], [itemId]: nextState},
    };
    ledgerSeq.current += 1;
    const ledgerId = \`led-\${ledgerSeq.current}\`;
    const verb = next === 'verified' ? 'verified' : 'requested from vendor';
    const entry: LedgerEntry = {
      id: ledgerId,
      vendorId,
      text: \`\${item.label} \${verb}.\`,
      stamp: TODAY_STAMP,
      by: SIGNED_IN_INITIALS,
    };
    setItemStates(nextStates);
    setLedger(current => [entry, ...current]);
    setUndoStack(current => [{vendorId, itemId, prev, ledgerId}, ...current]);

    // Announce the observable cascade, not just the click.
    const after = deriveVendor(vendor, nextStates);
    const parts = [
      \`\${item.label} \${verb} for \${vendor.name}.\`,
      \`Vendor now \${after.readinessPct}% ready, grade \${GRADE_META[after.grade].label}.\`,
    ];
    if (wasEscalated && !after.isEscalated) {
      parts.push('Removed from the escalation queue.');
    }
    setAnnouncement(parts.join(' '));
  };

  const handleUndo = () => {
    const record = undoStack[0];
    if (record === undefined) {
      return;
    }
    setItemStates(current => ({
      ...current,
      [record.vendorId]: {...current[record.vendorId], [record.itemId]: record.prev},
    }));
    setLedger(current => current.filter(entry => entry.id !== record.ledgerId));
    setUndoStack(current => current.slice(1));
    const item = CATALOG_BY_ID.get(record.itemId);
    setAnnouncement(\`Undid the last attestation change\${item !== undefined ? \` on \${item.label}\` : ''}.\`);
  };

  // ---- render -----------------------------------------------------------------
  const selectedGradeMeta = GRADE_META[selected.grade];

  return (
    <div style={{height: '100dvh', width: '100%'}}>
      <Layout height="fill">
        <style>{TEMPLATE_CSS}</style>
        <LayoutHeader>
          <div className={\`\${SCOPE} topbar\`}>
            <div className="brandCluster">
              <span className="brandMark">
                <BrandMark />
              </span>
              <div className="brandText">
                <p className="eyebrow">Vetlane / Third-party risk</p>
                <h1 className="pageTitle">Renewal runway</h1>
                <p className="asOf">As of {AS_OF_LABEL} · {VENDORS.length} vendors in book</p>
              </div>
            </div>
            <div className="kpiStrip" role="group" aria-label="Portfolio attestation metrics">
              <KpiTile
                value={\`\${portfolio.readinessPct}%\`}
                label={\`Portfolio readiness · \${portfolio.verifiedWeight}/\${portfolio.totalWeight} wt\`}
              />
              <KpiTile
                value={String(portfolio.gapItems)}
                label="Open gaps"
                tone={portfolio.gapItems > 0 ? GAP_RED : OK_GREEN}
              />
              <KpiTile
                value={String(portfolio.escalations)}
                label="Escalations"
                tone={portfolio.escalations > 0 ? GAP_RED : OK_GREEN}
              />
              <KpiTile value={String(portfolio.dueSoonCount)} label="Renewals ≤ 30d" />
              <KpiTile value={formatUsd(portfolio.bookTotal)} label="Renewal book ACV" />
            </div>
          </div>
        </LayoutHeader>
        <LayoutContent>
          <div className={\`\${SCOPE} workspace\`}>
            <div aria-live="polite" className={\`\${SCOPE} visuallyHidden\`}>
              {announcement}
            </div>

            {/* ---- runway ---- */}
            <div className="runwayColumn">
              {LANES.map(lane => {
                const laneVendors = allDerived
                  .filter(derived => laneForVendor(derived.vendor) === lane.id)
                  .sort((a, b) => a.vendor.daysToRenewal - b.vendor.daysToRenewal);
                const laneAcv = laneVendors.reduce((sum, derived) => sum + derived.vendor.acv, 0);
                return (
                  <section key={lane.id} className="lane" aria-label={\`Renewals \${lane.label}\`}>
                    <div className="laneLabel">
                      <h2 className="laneName">{lane.label}</h2>
                      <p className="laneSub">{lane.sublabel}</p>
                      <p className="laneStats">
                        {laneVendors.length} {laneVendors.length === 1 ? 'vendor' : 'vendors'} ·{' '}
                        {formatUsd(laneAcv)}
                      </p>
                    </div>
                    <div className="laneTiles">
                      {laneVendors.map(derived => (
                        <HeatTile
                          key={derived.vendor.id}
                          derived={derived}
                          isSelected={derived.vendor.id === selectedId}
                          onSelect={setSelectedId}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              {/* ---- escalation queue ---- */}
              <section className="escalation" aria-label="Escalation queue">
                <div className="escalationHead">
                  <Icon icon={BellRingIcon} size="sm" color="secondary" />
                  <h2 className="sectionTitle">Escalation queue</h2>
                  <span className="escalationCount">{escalated.length}</span>
                  <span className="laneSub" style={{marginInlineStart: 'auto'}}>
                    gap weight ≥ 1 inside 45 days
                  </span>
                </div>
                {escalated.length === 0 ? (
                  <div className="emptyState">
                    <span className="emptyGlyph">
                      <Icon icon={ClipboardCheckIcon} size="sm" color="inherit" />
                    </span>
                    No open escalations — every renewal inside 45 days is gap-free.
                  </div>
                ) : (
                  <ul className="escalationList">
                    {escalated.map(derived => {
                      const gapLabels = derived.vendor.itemIds
                        .filter(itemId => itemStates[derived.vendor.id]?.[itemId]?.status === 'gap')
                        .map(itemId => CATALOG_BY_ID.get(itemId)?.label ?? itemId);
                      return (
                        <li key={derived.vendor.id} className="escalationRow">
                          <span
                            style={{display: 'inline-flex', flexShrink: 0, color: GAP_RED}}
                            aria-hidden="true">
                            <Icon icon={ShieldAlertIcon} size="sm" color="inherit" />
                          </span>
                          <div className="escalationBody">
                            <p className="escalationName">{derived.vendor.name}</p>
                            <p className="escalationMeta">
                              Renews {derived.vendor.renewalDate} · {derived.vendor.daysToRenewal}d ·
                              blocking: {gapLabels.join(' · ')}
                            </p>
                          </div>
                          <span className="ownerDot" title={\`Owner: \${derived.vendor.owner}\`}>
                            {derived.vendor.ownerInitials}
                          </span>
                          <button
                            type="button"
                            className="escalationOpen"
                            onClick={() => setSelectedId(derived.vendor.id)}>
                            Open checklist
                            <Icon icon={ArrowUpRightIcon} size="xsm" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>

            {/* ---- attestation pane ---- */}
            <aside className="pane" aria-label={\`Attestation checklist for \${selectedVendor.name}\`}>
              <div className="paneHeader">
                <div className="paneHeadText">
                  <h2 className="paneVendor">{selectedVendor.name}</h2>
                  <p className="paneMeta">
                    Tier {selectedVendor.tier} · {selectedVendor.category} · {selectedVendor.acvLabel}{' '}
                    ACV
                  </p>
                  <p className="paneMeta">
                    Renews {selectedVendor.renewalDate} ({selectedVendor.daysToRenewal}d) · owner{' '}
                    {selectedVendor.owner}
                  </p>
                  <p className="paneMeta">
                    <span
                      className="gradePill"
                      style={{background: selectedGradeMeta.tint, color: selectedGradeMeta.color}}>
                      {selectedGradeMeta.label}
                    </span>{' '}
                    {selected.verifiedCount} verified · {selected.pendingCount} pending ·{' '}
                    {selected.gapCount} {selected.gapCount === 1 ? 'gap' : 'gaps'}
                  </p>
                </div>
                <div className="arcWrap" aria-hidden="true">
                  <ReadinessArc pct={selected.readinessPct} color={selectedGradeMeta.color} />
                  <span className="arcValue">{selected.readinessPct}%</span>
                </div>
              </div>

              <div className="paneToolbar">
                <span>
                  Weighted {selected.verifiedWeight}/{selected.totalWeight} · signed in as{' '}
                  {SIGNED_IN}
                </span>
                <button
                  type="button"
                  className="undoButton"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}>
                  <Icon icon={Undo2Icon} size="xsm" />
                  Undo
                </button>
              </div>

              <ul className="checkList">
                {selectedVendor.itemIds.map(itemId => {
                  const item = CATALOG_BY_ID.get(itemId);
                  const state = itemStates[selectedVendor.id]?.[itemId];
                  if (item === undefined || state === undefined) {
                    return null;
                  }
                  const statusMeta = STATUS_META[state.status];
                  return (
                    <li key={itemId} className="checkRow">
                      <div className="checkTop">
                        <span className="checkGlyph">
                          <StatusGlyph status={state.status} />
                        </span>
                        <div className="checkBody">
                          <p className="checkLabel">{item.label}</p>
                          <p className="checkStamp" style={{color: statusMeta.color}}>
                            {statusMeta.label} · {state.stamp}
                          </p>
                          {state.note !== undefined && <p className="checkNote">{state.note}</p>}
                        </div>
                        <span className="weightTag">×{item.weight}</span>
                      </div>
                      {state.status !== 'verified' && (
                        <div className="checkActions">
                          <button
                            type="button"
                            className="checkButton verify"
                            onClick={() => applyStatus(selectedVendor.id, itemId, 'verified')}>
                            <Icon icon={CheckIcon} size="xsm" />
                            Record attestation
                          </button>
                          {state.status === 'gap' && (
                            <button
                              type="button"
                              className="checkButton request"
                              onClick={() => applyStatus(selectedVendor.id, itemId, 'pending')}>
                              <Icon icon={MailIcon} size="xsm" />
                              Request evidence
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="ledger">
                <div className="escalationHead" style={{marginBottom: 0}}>
                  <Icon icon={HistoryIcon} size="sm" color="secondary" />
                  <h2 className="sectionTitle">Activity</h2>
                </div>
                {selectedLedger.length === 0 ? (
                  <p className="ledgerText" style={{marginTop: 8}}>
                    <span style={{display: 'inline-flex', verticalAlign: '-2px', marginInlineEnd: 6}}>
                      <Icon icon={ArchiveIcon} size="xsm" color="secondary" />
                    </span>
                    No activity logged for this vendor yet.
                  </p>
                ) : (
                  <ul className="ledgerList">
                    {selectedLedger.map(entry => (
                      <li key={entry.id} className="ledgerRow">
                        <span className="ownerDot" style={{width: 22, height: 22}}>
                          {entry.by}
                        </span>
                        <p className="ledgerText">{entry.text}</p>
                        <span className="ledgerStamp">{entry.stamp}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {selected.gapCount > 0 && (
                  <p className="ledgerText" style={{marginTop: 10}}>
                    <span
                      style={{
                        display: 'inline-flex',
                        verticalAlign: '-2px',
                        marginInlineEnd: 6,
                        color: GAP_RED,
                      }}>
                      <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
                    </span>
                    <strong>
                      {selected.gapCount} {selected.gapCount === 1 ? 'gap blocks' : 'gaps block'}{' '}
                      renewal sign-off.
                    </strong>{' '}
                    Recording an attestation clears it from the heat bar, re-derives the portfolio
                    readiness stat, and updates the escalation queue.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </LayoutContent>
      </Layout>
    </div>
  );
}
`;export{e as default};