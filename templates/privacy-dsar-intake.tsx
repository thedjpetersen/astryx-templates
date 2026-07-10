// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file privacy-dsar-intake.tsx
 * @input Deterministic fixtures only — the Redactly DSAR fulfillment desk
 *   for Northbeam Labs on a FIXED internal "today" of Wed Jul 8 2026 (no
 *   clock reads anywhere). Seven open data-subject requests, eight
 *   searchable systems, five data categories. Hand-checked statutory
 *   ledger at first render (daysLeft = window − elapsed; projected effort
 *   = unsearched systems × 1.5 days; band: overdue if daysLeft < 0,
 *   projected-miss if projected > daysLeft, tight if slack < 3 days):
 *     R-3141 GDPR Art. 15  recv Jun 14 +30 → due Jul 14 · elapsed 24 →
 *            6 left · searched 3/8 → 5 × 1.5 = 7.5 > 6  ⇒ PROJECTED MISS
 *     R-3129 GDPR Art. 17  recv Jun 6  +30 → due Jul 6  · elapsed 32 →
 *            −2 left ⇒ OVERDUE (searched 6/8)
 *     R-3160 GDPR Art. 15  recv Jun 11 +30 → due Jul 11 · elapsed 27 →
 *            3 left · searched 7/8 → 1.5 ≤ 3, slack 1.5 < 3 ⇒ TIGHT
 *     R-3155 CCPA §1798.105 recv Jun 26 +45 → due Aug 10 · elapsed 12 →
 *            33 left · searched 2/8 → 9 ≤ 33, slack 24 ⇒ ON TRACK
 *     R-3168 CCPA §1798.110 recv Jun 18 +45 → due Aug 2 · elapsed 20 →
 *            25 left · searched 4/8 → 6, slack 19 ⇒ ON TRACK
 *     R-3172 GDPR Art. 20  recv Jul 3  +30 → due Aug 2 · elapsed 5 →
 *            25 left · searched 0/8 → 12, slack 13 ⇒ ON TRACK
 *     R-3177 GDPR Art. 16  recv Jul 6  +30 → due Aug 5 · elapsed 2 →
 *            28 left · searched 0/8 → 12, slack 16 ⇒ ON TRACK
 *   ⇒ header chips at first render: 1 overdue · 1 projected miss ·
 *   1 tight · 4 on track — all four re-derive live from the request set.
 *   Readiness = 25%·(proofs verified/required) + 60%·(searched/8) +
 *   15%·(redaction review); R-3141 opens at 25×(1/2) + 60×(3/8) + 0 =
 *   12.5 + 22.5 = 35%. R-3177's requester name (Anastasia-Katarina
 *   Villanueva-Öberg) and Vaultkeep's usage count of 0 for R-3141 are
 *   deliberate stress fixtures (truncation; a searched-but-empty cell).
 *   No clock reads, no randomness, no timers, no network assets.
 * @output Redactly — Privacy DSAR Intake: a privacy-ops fulfillment desk.
 *   A 56px brand header (redaction-bar mark, desk title, four derived
 *   statutory-risk chips) over a two-region body: a 300px statutory-clock
 *   rail (one 84px row per request — id, regulation chip, risk chip,
 *   requester, and a statutory clock bar whose elapsed fill, projected-
 *   effort diamond, and remaining segment recolor by risk band) beside
 *   the work column for the selected request: a 64px context bar
 *   (requester identity, regulation + due, readiness %), the
 *   system-search checklist matrix (eight 44px system rows × the
 *   request's in-scope data-category columns; cells are pending buttons,
 *   record counts, no-records checks, or out-of-holdings dashes), and a
 *   min-116px fulfillment gate dock (Identity proof chip-toggles →
 *   System searches progress ring → Redaction review → Compile package).
 *   Signature move: completing a system search — from any pending cell
 *   OR the row's Run-search button OR the dock's Search-next button —
 *   ticks every cell in that row to its fixture counts, advances the
 *   gate ring, lifts readiness, and re-derives the request's projected-
 *   effort diamond so its clock bar RECOLORS in the rail (7.5d → 6.0d
 *   flips R-3141 from projected-miss red to tight amber) while the
 *   header risk chips re-count — one override store, every surface.
 * @position Page template; emitted by `astryx template privacy-dsar-intake`
 *
 * Frame: root 100dvh div > Layout height="fill". header (brand + risk
 *   chips) | content: body flex row → clock rail 300 (scrolls) · work
 *   column (context bar 64 → matrix scroller flex-1 → gate dock min 116,
 *   flex-shrink 0). No inspector panel — the gate dock IS the editing
 *   surface and the rail IS the queue.
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): rail
 *   300 + work column ≈ 745; matrix grid 200 + 5×80 + 104 = 704 at the
 *   full 5-category scope, so the matrix fits with no horizontal scroll
 *   and narrower scopes (portability = 3 categories) just leave air.
 * - <= 900px: rail narrows to 232 (clock bars stay; the requester name
 *   line hides); the matrix keeps its true widths and scrolls
 *   horizontally inside its own scroller — subtraction, not squeeze.
 * - <= 640px (390px embed): the rail becomes a 128px horizontal
 *   scroll-snap strip of 220px request cards above the work column;
 *   the gate dock wraps; every button stays >= 40px tall.
 * Container policy: work-surface archetype — rows, rails, a matrix
 *   grid, and one gate dock; no Cards. Rail rows, matrix cells, gate
 *   chips, and dock actions are real <button>s (aria-pressed on the
 *   selected request and verified proofs). All numerals tabular.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   (Redactly deep purple): light-dark(#6D28D9, #C4B5FD) — #6D28D9 on
 *   #FFFFFF ≈ 7.1:1, #C4B5FD on ~#1C1C1E ≈ 9.2:1. Text on a solid brand
 *   fill: light-dark(#FFFFFF, #221040) — #FFFFFF on #6D28D9 ≈ 7.1:1,
 *   #221040 on #C4B5FD ≈ 8.6:1. State pairs with math at declaration:
 *   ok green light-dark(#15803D, #4ADE80) (≈5.0:1 / ≈9.6:1), tight
 *   amber light-dark(#B45309, #FBBF24) (≈4.7:1 / ≈10.7:1), risk red
 *   light-dark(#DC2626, #F87171) (≈4.5:1 / ≈7.2:1). Tints are <=16%
 *   alpha washes under text that keeps its own >=4.5:1 pair.
 * Density grid (repeated verbatim in the CSS): header 56 · clock rail
 *   300 (request rows 84) · context bar 64 · matrix label column 200 ·
 *   category columns 80 · action column 104 · matrix rows 44 (header
 *   row 36) · gate dock min 116 · gate nodes 56 · action buttons 40 ·
 *   risk/regulation chips 20 · clock bars 8.
 * Fixture policy: one progress store `Record<requestId, {searched[],
 *   proofs[], redaction, compiled}>` is the single state owner; ALL
 *   statutory math (days left, projected effort, risk bands, readiness,
 *   header chips, gate states, cell states) re-derives from fixtures +
 *   progress every render, so no aggregate can drift from the rows.
 */

import {useState} from 'react';

import {
  ArchiveIcon,
  BadgeCheckIcon,
  CheckIcon,
  CreditCardIcon,
  DatabaseIcon,
  FileCheck2Icon,
  FingerprintIcon,
  LifeBuoyIcon,
  MailIcon,
  PackageCheckIcon,
  RotateCcwIcon,
  ScanSearchIcon,
  SquarePenIcon,
  type LucideIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome is token-pure; these are product semantics only.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-privacy-dsar-intake';

// THE quarantined Redactly brand purple. #6D28D9 on #FFFFFF ≈ 7.1:1 (passes
// 4.5:1 down to the 11px chip text it colors); #C4B5FD on a ~#1C1C1E dark
// surface ≈ 9.2:1. Colors the mark, selection, gate rings, and fulfilled bars.
const BRAND = 'light-dark(#6D28D9, #C4B5FD)';
// Text/glyph ON a solid brand fill: #FFFFFF on #6D28D9 ≈ 7.1:1; #221040 on
// #C4B5FD ≈ 8.6:1 (white on #C4B5FD would fail at ~1.7:1).
const BRAND_ON = 'light-dark(#FFFFFF, #221040)';
// Selected-row / found-cell wash — a surface nudge only (10% / 14% alpha);
// text on it keeps its own >=4.5:1 pair.
const BRAND_TINT = 'light-dark(rgba(109, 40, 217, 0.10), rgba(196, 181, 253, 0.14))';
// On-track / no-records green: #15803D on #FFFFFF ≈ 5.0:1; #4ADE80 on
// #1C1C1E ≈ 9.6:1.
const OK = 'light-dark(#15803D, #4ADE80)';
const OK_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// Tight-deadline amber: #B45309 on #FFFFFF ≈ 4.7:1; #FBBF24 on #1C1C1E ≈ 10.7:1.
const WARN = 'light-dark(#B45309, #FBBF24)';
const WARN_TINT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))';
// Overdue / projected-miss red: #DC2626 on #FFFFFF ≈ 4.5:1; #F87171 on
// #1C1C1E ≈ 7.2:1.
const RISK = 'light-dark(#DC2626, #F87171)';
const RISK_TINT = 'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))';

// ---------------------------------------------------------------------------
// STATUTORY MODEL — the desk's fixed "today" is Wed Jul 8 2026. Every days
// figure below is authored relative to it and cross-checked in the @input
// comment; nothing reads a clock.
// ---------------------------------------------------------------------------

const TODAY_LABEL = 'Wed, Jul 8, 2026';
/** Estimated fulfillment effort per unsearched system, in days. */
const EFFORT_DAYS_PER_SEARCH = 1.5;
/** Slack (daysLeft − projected effort) under which a request reads TIGHT. */
const TIGHT_SLACK_DAYS = 3;

type RiskBand = 'overdue' | 'miss' | 'tight' | 'ok' | 'done';

const BAND_META: Record<RiskBand, {label: string; rank: number}> = {
  overdue: {label: 'Overdue', rank: 0},
  miss: {label: 'Projected miss', rank: 1},
  tight: {label: 'Tight', rank: 2},
  ok: {label: 'On track', rank: 3},
  done: {label: 'Fulfilled', rank: 4},
};

// ---------------------------------------------------------------------------
// DOMAIN TYPES + META TABLES — data categories, searchable systems, proofs.
// ---------------------------------------------------------------------------

type Category = 'identity' | 'contact' | 'financial' | 'usage' | 'support';

const CATEGORY_META: Record<Category, {label: string; icon: LucideIcon}> = {
  identity: {label: 'Identity', icon: FingerprintIcon},
  contact: {label: 'Contact', icon: MailIcon},
  financial: {label: 'Financial', icon: CreditCardIcon},
  usage: {label: 'Usage', icon: DatabaseIcon},
  support: {label: 'Support', icon: LifeBuoyIcon},
};

type ProofId = 'gov-id' | 'email' | 'address';

const PROOF_META: Record<ProofId, {label: string}> = {
  'gov-id': {label: 'Gov ID match'},
  email: {label: 'Email challenge'},
  address: {label: 'Address match'},
};

type RequestKind = 'access' | 'erasure' | 'portability' | 'rectification' | 'delete' | 'know';

/** Data categories a request kind puts in scope (the matrix's columns). */
const SCOPE_BY_KIND: Record<RequestKind, Category[]> = {
  access: ['identity', 'contact', 'financial', 'usage', 'support'],
  erasure: ['identity', 'contact', 'financial', 'usage', 'support'],
  delete: ['identity', 'contact', 'financial', 'usage', 'support'],
  know: ['identity', 'contact', 'financial', 'usage', 'support'],
  portability: ['identity', 'contact', 'usage'],
  rectification: ['identity', 'contact'],
};

/** Identity proofs a request kind requires before release. */
const PROOFS_BY_KIND: Record<RequestKind, ProofId[]> = {
  access: ['gov-id', 'email'],
  know: ['gov-id', 'email'],
  portability: ['gov-id', 'email'],
  rectification: ['gov-id', 'email'],
  erasure: ['gov-id', 'email', 'address'],
  delete: ['gov-id', 'email', 'address'],
};

interface SystemFixture {
  id: string;
  name: string;
  owner: string;
  connector: 'API' | 'SQL' | 'Export' | 'Ticket';
  icon: LucideIcon;
  /** Categories this system can hold at all — non-holdings render as N/A. */
  holdings: Category[];
}

/** The eight searchable systems, in the desk's fixed search order. */
// prettier-ignore
const SYSTEMS: SystemFixture[] = [
  {id: 'relay', name: 'Relay CRM', owner: 'GTM Ops', connector: 'API', icon: DatabaseIcon, holdings: ['identity', 'contact', 'usage']},
  {id: 'mailhaven', name: 'Mailhaven Archive', owner: 'Corp IT', connector: 'Export', icon: MailIcon, holdings: ['contact', 'support']},
  {id: 'ledgerpay', name: 'LedgerPay Billing', owner: 'Finance Eng', connector: 'API', icon: CreditCardIcon, holdings: ['identity', 'contact', 'financial']},
  {id: 'prism', name: 'Prism Warehouse', owner: 'Data Platform', connector: 'SQL', icon: DatabaseIcon, holdings: ['usage']},
  {id: 'helpdeck', name: 'Helpdeck Support', owner: 'CX Tools', connector: 'API', icon: LifeBuoyIcon, holdings: ['contact', 'support']},
  {id: 'adpulse', name: 'AdPulse Analytics', owner: 'Growth', connector: 'SQL', icon: ScanSearchIcon, holdings: ['usage']},
  {id: 'docsign', name: 'DocSign Records', owner: 'Legal Ops', connector: 'Export', icon: FileCheck2Icon, holdings: ['identity', 'financial']},
  {id: 'vaultkeep', name: 'Vaultkeep Backups', owner: 'SRE', connector: 'Ticket', icon: ArchiveIcon, holdings: ['identity', 'contact', 'financial', 'usage', 'support']},
];

const SYSTEM_COUNT = SYSTEMS.length; // 8 — the gate-ring denominator

interface DsarRequest {
  id: string;
  requester: string;
  email: string;
  kind: RequestKind;
  /** Statute + article/section chip, e.g. "GDPR Art. 15". */
  regulation: string;
  received: string;
  due: string;
  windowDays: number;
  /** Days from received to the fixed today (Jul 8 2026) — hand-checked. */
  daysElapsed: number;
  /** Intake channel note for the context bar. */
  channel: string;
}

// Received→today arithmetic is verified line-by-line in the @input comment.
// prettier-ignore
const REQUESTS: DsarRequest[] = [
  {id: 'R-3141', requester: 'Maren Okafor', email: 'maren.okafor@voltmail.io', kind: 'access', regulation: 'GDPR Art. 15', received: 'Jun 14', due: 'Jul 14', windowDays: 30, daysElapsed: 24, channel: 'Privacy portal'},
  {id: 'R-3129', requester: 'Tobias Lindqvist', email: 't.lindqvist@nordpost.se', kind: 'erasure', regulation: 'GDPR Art. 17', received: 'Jun 6', due: 'Jul 6', windowDays: 30, daysElapsed: 32, channel: 'Email to dpo@'},
  {id: 'R-3160', requester: 'Priya Raghunathan', email: 'priya.r@lumenwork.co', kind: 'access', regulation: 'GDPR Art. 15', received: 'Jun 11', due: 'Jul 11', windowDays: 30, daysElapsed: 27, channel: 'Privacy portal'},
  {id: 'R-3155', requester: 'Dana Whitfield', email: 'dana.whitfield@gmx.us', kind: 'delete', regulation: 'CCPA §1798.105', received: 'Jun 26', due: 'Aug 10', windowDays: 45, daysElapsed: 12, channel: 'Toll-free line'},
  {id: 'R-3168', requester: 'Yuki Hamasaki', email: 'yuki.hamasaki@plexo.jp', kind: 'know', regulation: 'CCPA §1798.110', received: 'Jun 18', due: 'Aug 2', windowDays: 45, daysElapsed: 20, channel: 'Privacy portal'},
  {id: 'R-3172', requester: 'Jonah Beck-Osei', email: 'jonah.beckosei@driftbox.com', kind: 'portability', regulation: 'GDPR Art. 20', received: 'Jul 3', due: 'Aug 2', windowDays: 30, daysElapsed: 5, channel: 'Privacy portal'},
  // Stress fixture: 35-char requester name + 42-char email exercise rail
  // and context-bar truncation.
  {id: 'R-3177', requester: 'Anastasia-Katarina Villanueva-Öberg', email: 'anastasia.villanueva-oberg@karlstadmail.se', kind: 'rectification', regulation: 'GDPR Art. 16', received: 'Jul 6', due: 'Aug 5', windowDays: 30, daysElapsed: 2, channel: 'Email to dpo@'},
];

/**
 * Record counts each system search returns, per request — the numbers a
 * cell ticks to the moment its system is searched. Categories absent from
 * a system's holdings never render; an explicit 0 renders as "no records"
 * (Vaultkeep usage for R-3141 is the authored zero-state stress cell).
 */
// prettier-ignore
const FINDINGS: Record<string, Record<string, Partial<Record<Category, number>>>> = {
  'R-3141': {relay: {identity: 1, contact: 3, usage: 214}, mailhaven: {contact: 41, support: 3}, ledgerpay: {identity: 1, contact: 2, financial: 76}, prism: {usage: 5812}, helpdeck: {contact: 9, support: 12}, adpulse: {usage: 1204}, docsign: {identity: 2, financial: 4}, vaultkeep: {identity: 1, contact: 3, financial: 76, usage: 0, support: 12}},
  'R-3129': {relay: {identity: 1, contact: 5, usage: 88}, mailhaven: {contact: 17, support: 1}, ledgerpay: {identity: 1, contact: 1, financial: 23}, prism: {usage: 1420}, helpdeck: {contact: 4, support: 6}, adpulse: {usage: 310}, docsign: {identity: 1, financial: 2}, vaultkeep: {identity: 1, contact: 5, financial: 23, usage: 140, support: 6}},
  'R-3160': {relay: {identity: 1, contact: 2, usage: 45}, mailhaven: {contact: 8, support: 0}, ledgerpay: {identity: 1, contact: 1, financial: 12}, prism: {usage: 960}, helpdeck: {contact: 2, support: 3}, adpulse: {usage: 205}, docsign: {identity: 1, financial: 1}, vaultkeep: {identity: 1, contact: 2, financial: 12, usage: 51, support: 3}},
  'R-3155': {relay: {identity: 1, contact: 4, usage: 130}, mailhaven: {contact: 22, support: 2}, ledgerpay: {identity: 1, contact: 2, financial: 41}, prism: {usage: 2210}, helpdeck: {contact: 6, support: 9}, adpulse: {usage: 640}, docsign: {identity: 1, financial: 3}, vaultkeep: {identity: 1, contact: 4, financial: 41, usage: 96, support: 9}},
  'R-3168': {relay: {identity: 1, contact: 1, usage: 64}, mailhaven: {contact: 12, support: 0}, ledgerpay: {identity: 1, contact: 1, financial: 8}, prism: {usage: 780}, helpdeck: {contact: 3, support: 2}, adpulse: {usage: 155}, docsign: {identity: 1, financial: 0}, vaultkeep: {identity: 1, contact: 1, financial: 8, usage: 33, support: 2}},
  'R-3172': {relay: {identity: 1, contact: 2, usage: 340}, mailhaven: {contact: 15, support: 4}, ledgerpay: {identity: 1, contact: 1, financial: 19}, prism: {usage: 4105}, helpdeck: {contact: 5, support: 7}, adpulse: {usage: 890}, docsign: {identity: 1, financial: 2}, vaultkeep: {identity: 1, contact: 2, financial: 19, usage: 178, support: 7}},
  'R-3177': {relay: {identity: 1, contact: 6, usage: 72}, mailhaven: {contact: 33, support: 5}, ledgerpay: {identity: 1, contact: 3, financial: 15}, prism: {usage: 1015}, helpdeck: {contact: 11, support: 14}, adpulse: {usage: 260}, docsign: {identity: 2, financial: 1}, vaultkeep: {identity: 1, contact: 6, financial: 15, usage: 44, support: 14}},
};

// ---------------------------------------------------------------------------
// PROGRESS STORE — the single state owner. Everything below derives.
// ---------------------------------------------------------------------------

interface RequestProgress {
  /** System ids already searched for this request. */
  searched: string[];
  /** Identity proofs verified so far. */
  proofs: ProofId[];
  redaction: boolean;
  compiled: boolean;
}

/** Initial desk state — backs every hand-checked figure in @input. */
const INITIAL_PROGRESS: Record<string, RequestProgress> = {
  'R-3141': {searched: ['relay', 'helpdeck', 'docsign'], proofs: ['email'], redaction: false, compiled: false},
  'R-3129': {searched: ['relay', 'mailhaven', 'ledgerpay', 'prism', 'helpdeck', 'adpulse'], proofs: ['gov-id', 'email'], redaction: false, compiled: false},
  'R-3160': {searched: ['relay', 'mailhaven', 'ledgerpay', 'prism', 'helpdeck', 'adpulse', 'docsign'], proofs: ['gov-id', 'email'], redaction: false, compiled: false},
  'R-3155': {searched: ['relay', 'prism'], proofs: [], redaction: false, compiled: false},
  'R-3168': {searched: ['relay', 'mailhaven', 'helpdeck', 'adpulse'], proofs: ['gov-id'], redaction: false, compiled: false},
  'R-3172': {searched: [], proofs: ['email'], redaction: false, compiled: false},
  'R-3177': {searched: [], proofs: [], redaction: false, compiled: false},
};

/** Deep-clones the initial store so Reset always restores pristine state. */
function cloneInitialProgress(): Record<string, RequestProgress> {
  const next: Record<string, RequestProgress> = {};
  for (const [id, prog] of Object.entries(INITIAL_PROGRESS)) {
    next[id] = {searched: [...prog.searched], proofs: [...prog.proofs], redaction: prog.redaction, compiled: prog.compiled};
  }
  return next;
}

interface RequestDerived {
  req: DsarRequest;
  prog: RequestProgress;
  daysLeft: number;
  searchedCount: number;
  remaining: number;
  /** remaining × 1.5 — the projected fulfillment effort in days. */
  projectedDays: number;
  band: RiskBand;
  /** 0–100, weighted 25/60/15 across identity/search/redaction. */
  readiness: number;
  proofsRequired: ProofId[];
  identityDone: boolean;
  searchDone: boolean;
}

/** Pure statutory derivation — the only place risk math lives. */
function deriveRequest(req: DsarRequest, prog: RequestProgress): RequestDerived {
  const daysLeft = req.windowDays - req.daysElapsed;
  const searchedCount = prog.searched.length;
  const remaining = SYSTEM_COUNT - searchedCount;
  const projectedDays = remaining * EFFORT_DAYS_PER_SEARCH;
  const proofsRequired = PROOFS_BY_KIND[req.kind];
  const identityDone = proofsRequired.every(proof => prog.proofs.includes(proof));
  const searchDone = remaining === 0;
  let band: RiskBand;
  if (prog.compiled) {
    band = 'done';
  } else if (daysLeft < 0) {
    band = 'overdue';
  } else if (projectedDays > daysLeft) {
    band = 'miss';
  } else if (daysLeft - projectedDays < TIGHT_SLACK_DAYS) {
    band = 'tight';
  } else {
    band = 'ok';
  }
  const readiness = Math.round(
    25 * (prog.proofs.filter(proof => proofsRequired.includes(proof)).length / proofsRequired.length) +
      60 * (searchedCount / SYSTEM_COUNT) +
      (prog.redaction ? 15 : 0),
  );
  return {req, prog, daysLeft, searchedCount, remaining, projectedDays, band, readiness, proofsRequired, identityDone, searchDone};
}

/** "6d left" / "2d over" / "due today" — the rail's clock label. */
function daysLabel(daysLeft: number): string {
  if (daysLeft < 0) {
    return `${Math.abs(daysLeft)}d over`;
  }
  if (daysLeft === 0) {
    return 'due today';
  }
  return `${daysLeft}d left`;
}

/** Grouped-thousands display for record counts (fixed en-US grouping). */
function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors scoped under .tpl-privacy-dsar-intake.
// Density grid repeated verbatim: header 56 · clock rail 300 (request rows
// 84) · context bar 64 · matrix label column 200 · category columns 80 ·
// action column 104 · matrix rows 44 (header row 36) · gate dock min 116 ·
// gate nodes 56 · action buttons 40 · risk/regulation chips 20 · clock bars 8.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.${SCOPE} {
  font-family: var(--font-family-sans);
}
.${SCOPE} button {
  font: inherit;
  color: inherit;
}
.${SCOPE} .pdi-focusable:focus-visible {
  outline: 2px solid ${BRAND};
  outline-offset: 2px;
}
.${SCOPE} .pdi-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.${SCOPE} .pdi-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.${SCOPE} .pdi-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: ${BRAND};
}
/* Derived statutory-risk chips in the header — 20px pills. */
.${SCOPE} .pdi-risk-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-surface);
  white-space: nowrap;
}
.${SCOPE} .pdi-risk-chip .pdi-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.${SCOPE} .pdi-dot-overdue, .${SCOPE} .pdi-dot-miss { background: ${RISK}; }
.${SCOPE} .pdi-dot-tight { background: ${WARN}; }
.${SCOPE} .pdi-dot-ok { background: ${OK}; }
.${SCOPE} .pdi-dot-done { background: ${BRAND}; }

/* --- body frame: rail 300 + work column ---------------------------------- */
.${SCOPE} .pdi-body {
  display: flex;
  height: 100%;
  min-height: 0;
}
.${SCOPE} .pdi-rail {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
}
.${SCOPE} .pdi-rail-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 36px;
  box-sizing: border-box;
  padding: var(--spacing-1) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${SCOPE} .pdi-rail-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
/* One statutory-clock row per request — 84px, a real button. */
.${SCOPE} .pdi-req {
  display: block;
  width: 100%;
  min-height: 84px;
  box-sizing: border-box;
  padding: 10px var(--spacing-3);
  border: none;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  text-align: left;
  cursor: pointer;
}
@media (hover: hover) {
  .${SCOPE} .pdi-req:hover { background: var(--color-background-muted); }
}
.${SCOPE} .pdi-req[aria-pressed='true'] {
  background: ${BRAND_TINT};
  box-shadow: inset 3px 0 0 0 ${BRAND};
}
.${SCOPE} .pdi-req-top {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
}
.${SCOPE} .pdi-req-id {
  font-size: 12px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}
.${SCOPE} .pdi-req-name {
  display: block;
  margin-top: 2px;
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 20px regulation / risk chips. */
.${SCOPE} .pdi-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  background: var(--color-background-body);
}
.${SCOPE} .pdi-chip-overdue, .${SCOPE} .pdi-chip-miss { color: ${RISK}; border-color: ${RISK}; background: ${RISK_TINT}; }
.${SCOPE} .pdi-chip-tight { color: ${WARN}; border-color: ${WARN}; background: ${WARN_TINT}; }
.${SCOPE} .pdi-chip-ok { color: ${OK}; border-color: ${OK}; background: ${OK_TINT}; }
.${SCOPE} .pdi-chip-done { color: ${BRAND}; border-color: ${BRAND}; background: ${BRAND_TINT}; }

/* Statutory clock bar: 8px track; elapsed fill neutral, remaining segment
   carries the band color, the projected-effort diamond rides on top. */
.${SCOPE} .pdi-clock {
  position: relative;
  height: 8px;
  margin-top: 8px;
  border-radius: 4px;
  background: var(--color-background-muted);
  overflow: visible;
}
.${SCOPE} .pdi-clock-elapsed {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 4px 0 0 4px;
  background: color-mix(in srgb, var(--color-text-secondary) 38%, var(--color-background-muted));
}
.${SCOPE} .pdi-clock-remaining {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 0 4px 4px 0;
}
.${SCOPE} .pdi-clock-remaining.pdi-band-ok { background: ${OK}; }
.${SCOPE} .pdi-clock-remaining.pdi-band-tight { background: ${WARN}; }
.${SCOPE} .pdi-clock-remaining.pdi-band-miss, .${SCOPE} .pdi-clock-remaining.pdi-band-overdue { background: ${RISK}; }
.${SCOPE} .pdi-clock-remaining.pdi-band-done { background: ${BRAND}; }
/* Projected-effort diamond: sits at elapsed + projected days. Past the due
   edge = the visual reason a bar reads "projected miss". */
.${SCOPE} .pdi-clock-proj {
  position: absolute;
  top: 50%;
  width: 8px;
  height: 8px;
  transform: translate(-50%, -50%) rotate(45deg);
  background: var(--color-background-body);
  border: 1.5px solid var(--color-text-primary);
  box-sizing: border-box;
}
.${SCOPE} .pdi-clock-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .pdi-days-overdue, .${SCOPE} .pdi-days-miss { color: ${RISK}; font-weight: 650; }
.${SCOPE} .pdi-days-tight { color: ${WARN}; font-weight: 650; }
.${SCOPE} .pdi-days-ok { color: ${OK}; font-weight: 650; }
.${SCOPE} .pdi-days-done { color: ${BRAND}; font-weight: 650; }

/* --- work column ---------------------------------------------------------- */
.${SCOPE} .pdi-work {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
/* 64px context bar for the selected request. */
.${SCOPE} .pdi-context {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  min-height: 64px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .pdi-context-id {
  min-width: 0;
  flex: 1;
}
.${SCOPE} .pdi-context-fact {
  flex-shrink: 0;
  text-align: right;
}
.${SCOPE} .pdi-context-fact .pdi-fact-label {
  display: block;
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${SCOPE} .pdi-context-fact .pdi-fact-value {
  display: block;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}
.${SCOPE} .pdi-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- system-search checklist matrix --------------------------------------- */
.${SCOPE} .pdi-matrix-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--spacing-3) var(--spacing-4);
}
.${SCOPE} .pdi-matrix {
  display: grid;
  /* 200px system label + n×80px categories + 104px action column; the
     column count follows the request's statutory scope. */
  align-content: start;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-background-surface);
  min-width: max-content;
}
.${SCOPE} .pdi-mx-head {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 36px;
  box-sizing: border-box;
  padding: 0 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .pdi-mx-head.pdi-mx-cat { justify-content: center; padding: 0 4px; }
.${SCOPE} .pdi-mx-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  box-sizing: border-box;
  padding: 4px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.${SCOPE} .pdi-mx-label .pdi-sys-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .pdi-mx-label .pdi-sys-owner {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .pdi-connector {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.05em;
  padding: 1px 5px;
  border-radius: 4px;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
/* Matrix cells: 80×44. Pending cells are buttons; result cells are static. */
.${SCOPE} .pdi-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  box-sizing: border-box;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .pdi-cell-na { color: color-mix(in srgb, var(--color-text-secondary) 55%, transparent); }
.${SCOPE} .pdi-cell-pending {
  cursor: pointer;
  background: transparent;
  border-top: none;
  border-right: none;
  width: 100%;
}
@media (hover: hover) {
  .${SCOPE} .pdi-cell-pending:hover { background: ${BRAND_TINT}; }
}
.${SCOPE} .pdi-pending-ring {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px dashed var(--color-text-secondary);
}
.${SCOPE} .pdi-cell-found {
  font-weight: 650;
  color: var(--color-text-primary);
  background: ${BRAND_TINT};
}
.${SCOPE} .pdi-cell-clear { color: ${OK}; }
.${SCOPE} .pdi-mx-action {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  box-sizing: border-box;
  padding: 0 8px;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
}
/* Run-search: a 28px-tall text button inside the 44px cell (the full-size
   40px path lives in the gate dock's "Search next system" button). */
.${SCOPE} .pdi-run {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  border: var(--border-width) solid ${BRAND};
  color: ${BRAND};
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
@media (hover: hover) {
  .${SCOPE} .pdi-run:hover { background: ${BRAND_TINT}; }
}
.${SCOPE} .pdi-searched-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: ${OK};
  white-space: nowrap;
}

/* --- fulfillment gate dock ------------------------------------------------- */
.${SCOPE} .pdi-dock {
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  min-height: 116px;
  box-sizing: border-box;
  padding: var(--spacing-3) var(--spacing-4);
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
}
.${SCOPE} .pdi-gate {
  flex: 1 1 180px;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 56px;
  box-sizing: border-box;
  padding: 8px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-body);
}
.${SCOPE} .pdi-gate.pdi-gate-done { border-color: ${OK}; background: ${OK_TINT}; }
.${SCOPE} .pdi-gate-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .pdi-gate-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-background-muted);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
}
.${SCOPE} .pdi-gate-done .pdi-gate-num { background: ${OK}; color: var(--color-background-body); }
.${SCOPE} .pdi-gate-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
/* Proof chip-toggles: 40px hit height via padding, aria-pressed = verified. */
.${SCOPE} .pdi-proof {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-body);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
}
@media (hover: hover) {
  .${SCOPE} .pdi-proof:hover { background: var(--color-background-muted); }
}
.${SCOPE} .pdi-proof[aria-pressed='true'] {
  color: ${OK};
  border-color: ${OK};
  background: ${OK_TINT};
}
.${SCOPE} .pdi-ring-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.${SCOPE} .pdi-ring-label {
  font-size: 13px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.${SCOPE} .pdi-ring-sub {
  display: block;
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-secondary);
}
/* 40px dock action buttons (Search next / Redaction review / Compile). */
.${SCOPE} .pdi-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
@media (hover: hover) {
  .${SCOPE} .pdi-action:hover:not(:disabled) { background: var(--color-background-muted); }
}
.${SCOPE} .pdi-action:disabled {
  opacity: 0.45;
  cursor: default;
}
.${SCOPE} .pdi-action-primary {
  border-color: ${BRAND};
  background: ${BRAND};
  color: ${BRAND_ON};
}
@media (hover: hover) {
  .${SCOPE} .pdi-action-primary:hover:not(:disabled) {
    background: color-mix(in srgb, ${BRAND} 88%, var(--color-text-primary));
  }
}
.${SCOPE} .pdi-action[aria-pressed='true'] {
  color: ${OK};
  border-color: ${OK};
  background: ${OK_TINT};
}

/* --- responsive subtraction ------------------------------------------------ */
@media (max-width: 900px) {
  .${SCOPE} .pdi-rail { width: 232px; }
  .${SCOPE} .pdi-req-name { display: none; }
  .${SCOPE} .pdi-context { flex-wrap: wrap; min-height: 0; }
}
@media (max-width: 640px) {
  .${SCOPE} .pdi-body { flex-direction: column; }
  .${SCOPE} .pdi-rail {
    width: 100%;
    flex-direction: row;
    border-right: none;
    border-bottom: var(--border-width) solid var(--color-border);
  }
  .${SCOPE} .pdi-rail-head {
    writing-mode: sideways-lr;
    border-bottom: none;
    border-right: var(--border-width) solid var(--color-border);
    min-height: 0;
  }
  .${SCOPE} .pdi-rail-scroll {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x proximity;
  }
  .${SCOPE} .pdi-req {
    width: 220px;
    flex-shrink: 0;
    min-height: 128px;
    scroll-snap-align: start;
    border-bottom: none;
    border-right: var(--border-width) solid var(--color-border);
  }
  .${SCOPE} .pdi-req[aria-pressed='true'] { box-shadow: inset 0 3px 0 0 ${BRAND}; }
  .${SCOPE} .pdi-req-name { display: block; }
  .${SCOPE} .pdi-context-fact { text-align: left; }
  .${SCOPE} .pdi-gate { flex-basis: 100%; }
}
`;

// ---------------------------------------------------------------------------
// DOMAIN GLYPHS + SUB-SURFACES
// ---------------------------------------------------------------------------

/**
 * The Redactly mark: a document line-stack whose middle line is a solid
 * redaction bar in the brand purple. currentColor rides .pdi-mark.
 */
function BrandMark() {
  return (
    <span className="pdi-mark" aria-hidden>
      <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
        <rect x={2} y={2} width={18} height={18} rx={4} stroke="currentColor" strokeWidth={1.8} />
        <line x1={6} y1={7.5} x2={16} y2={7.5} stroke="var(--color-text-secondary)" strokeWidth={1.6} strokeLinecap="round" />
        <rect x={5.4} y={10} width={11.2} height={3} rx={1.2} fill="currentColor" />
        <line x1={6} y1={15.5} x2={13} y2={15.5} stroke="var(--color-text-secondary)" strokeWidth={1.6} strokeLinecap="round" />
      </svg>
    </span>
  );
}

/**
 * Statutory clock bar: elapsed neutral fill, remaining segment colored by
 * band, and the projected-effort diamond at elapsed + projected days. On
 * overdue requests the whole track reads risk (the window is spent). All
 * geometry is % of the statutory window, clamped to the track.
 */
function StatuteClockBar({derived}: {derived: RequestDerived}) {
  const {req, band, projectedDays} = derived;
  const elapsedPct = Math.min(100, (req.daysElapsed / req.windowDays) * 100);
  const projPct = Math.min(100, ((req.daysElapsed + projectedDays) / req.windowDays) * 100);
  const isSpent = band === 'overdue';
  return (
    <div className="pdi-clock" aria-hidden>
      <div
        className="pdi-clock-elapsed"
        style={{width: `${elapsedPct}%`, background: isSpent ? RISK : undefined}}
      />
      {!isSpent && band !== 'done' && (
        <div
          className={`pdi-clock-remaining pdi-band-${band}`}
          style={{left: `${elapsedPct}%`, right: 0}}
        />
      )}
      {band === 'done' && <div className="pdi-clock-remaining pdi-band-done" style={{left: 0, right: 0, borderRadius: 4}} />}
      {band !== 'done' && !isSpent && (
        <span className="pdi-clock-proj" style={{left: `${projPct}%`}} />
      )}
    </div>
  );
}

/**
 * Gate-2 progress ring: r=12 circle, C = 2π·12 ≈ 75.4; the searched/8
 * fraction paints as a brand arc from 12 o'clock.
 */
function SearchRing({searched}: {searched: number}) {
  const C = 75.4;
  const frac = searched / SYSTEM_COUNT;
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" aria-hidden>
      <circle cx={16} cy={16} r={12} fill="none" stroke="var(--color-border)" strokeWidth={4} />
      <circle
        cx={16}
        cy={16}
        r={12}
        fill="none"
        stroke={frac >= 1 ? OK : BRAND}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={`${C * frac} ${C}`}
        transform="rotate(-90 16 16)"
      />
    </svg>
  );
}

type CellState =
  | {kind: 'na'}
  | {kind: 'pending'}
  | {kind: 'clear'}
  | {kind: 'found'; count: number};

/** Pure cell derivation: holdings × searched × fixture findings. */
function cellState(reqId: string, system: SystemFixture, category: Category, searched: boolean): CellState {
  if (!system.holdings.includes(category)) {
    return {kind: 'na'};
  }
  if (!searched) {
    return {kind: 'pending'};
  }
  const count = FINDINGS[reqId]?.[system.id]?.[category] ?? 0;
  return count === 0 ? {kind: 'clear'} : {kind: 'found', count};
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function PrivacyDsarIntakeTemplate() {
  const [progressById, setProgressById] = useState<Record<string, RequestProgress>>(cloneInitialProgress);
  const [selectedId, setSelectedId] = useState(REQUESTS[0].id);
  const [announcement, setAnnouncement] = useState('');

  // ---- derive everything from fixtures + the progress store ----
  const derivedAll = REQUESTS.map(req => deriveRequest(req, progressById[req.id]));
  const selected = derivedAll.find(item => item.req.id === selectedId) ?? derivedAll[0];
  const scopeCats = SCOPE_BY_KIND[selected.req.kind];

  const bandCounts: Record<RiskBand, number> = {overdue: 0, miss: 0, tight: 0, ok: 0, done: 0};
  for (const item of derivedAll) {
    bandCounts[item.band] += 1;
  }

  // ---- mutations: one updater, every surface re-derives ----
  const patchProgress = (reqId: string, patch: Partial<RequestProgress>) => {
    setProgressById(prev => ({...prev, [reqId]: {...prev[reqId], ...patch}}));
  };

  const completeSearch = (systemId: string) => {
    const {req, prog} = selected;
    if (prog.searched.includes(systemId) || prog.compiled) {
      return;
    }
    const system = SYSTEMS.find(candidate => candidate.id === systemId);
    if (system == null) {
      return;
    }
    const nextSearched = [...prog.searched, systemId];
    patchProgress(req.id, {searched: nextSearched});
    // Announce the observable consequences, not just the click: re-derive
    // the same statutory math the rail bar is about to render with.
    const after = deriveRequest(req, {...prog, searched: nextSearched});
    const findings = FINDINGS[req.id]?.[systemId] ?? {};
    const total = Object.values(findings).reduce((sum, count) => sum + (count ?? 0), 0);
    setAnnouncement(
      `${system.name} searched for ${req.id}: ${formatCount(total)} records located. ` +
        `${after.searchedCount} of ${SYSTEM_COUNT} systems done, readiness ${after.readiness}%, ` +
        `status ${BAND_META[after.band].label}.`,
    );
  };

  const searchNext = () => {
    const next = SYSTEMS.find(system => !selected.prog.searched.includes(system.id));
    if (next != null) {
      completeSearch(next.id);
    }
  };

  const toggleProof = (proof: ProofId) => {
    const {req, prog} = selected;
    if (prog.compiled) {
      return;
    }
    const has = prog.proofs.includes(proof);
    const nextProofs = has ? prog.proofs.filter(item => item !== proof) : [...prog.proofs, proof];
    patchProgress(req.id, {proofs: nextProofs});
    setAnnouncement(
      `${PROOF_META[proof].label} ${has ? 'cleared' : 'verified'} for ${req.id} — ` +
        `${nextProofs.filter(item => selected.proofsRequired.includes(item)).length} of ${selected.proofsRequired.length} identity proofs.`,
    );
  };

  const toggleRedaction = () => {
    const {req, prog} = selected;
    if (!selected.searchDone || prog.compiled) {
      return;
    }
    patchProgress(req.id, {redaction: !prog.redaction});
    setAnnouncement(
      prog.redaction
        ? `Redaction review reopened for ${req.id}.`
        : `Redaction review complete for ${req.id} — package can compile once identity clears.`,
    );
  };

  const compilePackage = () => {
    const {req, prog, identityDone, searchDone} = selected;
    if (!identityDone || !searchDone || !prog.redaction || prog.compiled) {
      return;
    }
    patchProgress(req.id, {compiled: true});
    setAnnouncement(`Response package compiled for ${req.id} — request fulfilled and clock closed.`);
  };

  const resetDemo = () => {
    setProgressById(cloneInitialProgress());
    setSelectedId(REQUESTS[0].id);
    setAnnouncement('Demo state reset to the opening ledger.');
  };

  // ---- header: brand + the four derived statutory-risk chips ----
  const header = (
    <LayoutHeader hasDivider>
      <div className="pdi-header-row">
        <HStack gap={3} vAlign="center" wrap="wrap">
          <BrandMark />
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={1}>Redactly — DSAR fulfillment desk</Heading>
              <Text type="supporting" size="sm" color="secondary">
                Northbeam Labs · {REQUESTS.length} open requests · today {TODAY_LABEL}
              </Text>
            </VStack>
          </StackItem>
          {(['overdue', 'miss', 'tight', 'ok'] as const).map(band => (
            <span className="pdi-risk-chip" key={band}>
              <span className={`pdi-dot pdi-dot-${band}`} />
              {bandCounts[band]} {BAND_META[band].label.toLowerCase()}
            </span>
          ))}
          {bandCounts.done > 0 && (
            <span className="pdi-risk-chip">
              <span className="pdi-dot pdi-dot-done" />
              {bandCounts.done} fulfilled
            </span>
          )}
          <Button
            label="Reset demo"
            variant="ghost"
            size="sm"
            icon={<Icon icon={RotateCcwIcon} size="sm" />}
            onClick={resetDemo}
          />
        </HStack>
      </div>
    </LayoutHeader>
  );

  // ---- statutory-clock rail ----
  const rail = (
    <nav className="pdi-rail" aria-label="Statutory clocks">
      <div className="pdi-rail-head">
        Statutory clocks
        <span style={{marginLeft: 'auto', fontVariantNumeric: 'tabular-nums'}}>{REQUESTS.length}</span>
      </div>
      <div className="pdi-rail-scroll">
        {derivedAll.map(item => {
          const {req, band, daysLeft} = item;
          return (
            <button
              key={req.id}
              type="button"
              className="pdi-req pdi-focusable"
              aria-pressed={req.id === selectedId}
              aria-label={`${req.id}, ${req.requester}, ${req.regulation}, ${daysLabel(daysLeft)}, ${BAND_META[band].label}`}
              onClick={() => setSelectedId(req.id)}>
              <span className="pdi-req-top">
                <span className="pdi-req-id">{req.id}</span>
                <span className="pdi-chip">{req.regulation}</span>
                <StackItem size="fill" />
                <span className={`pdi-chip pdi-chip-${band}`}>
                  {band === 'done' && <Icon icon={CheckIcon} size="xsm" color="inherit" />}
                  {BAND_META[band].label}
                </span>
              </span>
              <span className="pdi-req-name">{req.requester}</span>
              <StatuteClockBar derived={item} />
              <span className="pdi-clock-meta">
                <span className={`pdi-days-${band}`}>{band === 'done' ? 'Fulfilled' : daysLabel(daysLeft)}</span>
                <span>
                  due {req.due} · {item.searchedCount}/{SYSTEM_COUNT} searched
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  // ---- context bar for the selected request ----
  const contextBar = (
    <div className="pdi-context">
      <div className="pdi-context-id">
        <Text type="body" weight="semibold" display="block" maxLines={1}>
          {selected.req.requester}
        </Text>
        <span className="pdi-truncate" style={{display: 'block', fontSize: 12, color: 'var(--color-text-secondary)'}}>
          {selected.req.email} · via {selected.req.channel}
        </span>
      </div>
      <div className="pdi-context-fact">
        <span className="pdi-fact-label">Regulation</span>
        <span className="pdi-fact-value">{selected.req.regulation}</span>
      </div>
      <div className="pdi-context-fact">
        <span className="pdi-fact-label">Received → due</span>
        <span className="pdi-fact-value">
          {selected.req.received} → {selected.req.due}
        </span>
      </div>
      <div className="pdi-context-fact">
        <span className="pdi-fact-label">Statutory clock</span>
        <span className={`pdi-fact-value pdi-days-${selected.band}`}>
          {selected.band === 'done' ? 'Closed' : daysLabel(selected.daysLeft)}
        </span>
      </div>
      <div className="pdi-context-fact">
        <span className="pdi-fact-label">Readiness</span>
        <span className="pdi-fact-value">{selected.readiness}%</span>
      </div>
    </div>
  );

  // ---- system-search checklist matrix ----
  const gridTemplate = `200px repeat(${scopeCats.length}, 80px) 104px`;
  const matrix = (
    <div className="pdi-matrix-scroll">
      <div
        className="pdi-matrix"
        role="grid"
        aria-label={`System search checklist for ${selected.req.id} — ${scopeCats.length} data categories in scope`}
        style={{gridTemplateColumns: gridTemplate}}>
        <div role="row" style={{display: 'contents'}}>
          <div className="pdi-mx-head" role="columnheader">
            System · {SYSTEM_COUNT}
          </div>
          {scopeCats.map(cat => (
            <div className="pdi-mx-head pdi-mx-cat" role="columnheader" key={cat}>
              <Icon icon={CATEGORY_META[cat].icon} size="xsm" color="secondary" />
              {CATEGORY_META[cat].label}
            </div>
          ))}
          <div className="pdi-mx-head pdi-mx-cat" role="columnheader">
            Search
          </div>
        </div>
        {SYSTEMS.map(system => {
          const searched = selected.prog.searched.includes(system.id);
          return (
            <div role="row" style={{display: 'contents'}} key={system.id}>
              <div className="pdi-mx-label" role="rowheader">
                <Icon icon={system.icon} size="sm" color="secondary" />
                <span style={{minWidth: 0}}>
                  <span className="pdi-sys-name" style={{display: 'block'}}>
                    {system.name}
                  </span>
                  <span className="pdi-sys-owner" style={{display: 'block'}}>
                    {system.owner}
                  </span>
                </span>
                <span className="pdi-connector">{system.connector}</span>
              </div>
              {scopeCats.map(cat => {
                const state = cellState(selected.req.id, system, cat, searched);
                if (state.kind === 'pending') {
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="gridcell"
                      className="pdi-cell pdi-cell-pending pdi-focusable"
                      aria-label={`${system.name} ${CATEGORY_META[cat].label}: pending — run this system search`}
                      onClick={() => completeSearch(system.id)}>
                      <span className="pdi-pending-ring" aria-hidden />
                    </button>
                  );
                }
                const label =
                  state.kind === 'na'
                    ? `${system.name} does not hold ${CATEGORY_META[cat].label} data`
                    : state.kind === 'clear'
                      ? `${system.name} ${CATEGORY_META[cat].label}: no records`
                      : `${system.name} ${CATEGORY_META[cat].label}: ${formatCount(state.count)} records`;
                return (
                  <div key={cat} role="gridcell" className={`pdi-cell pdi-cell-${state.kind}`} aria-label={label}>
                    {state.kind === 'na' && '—'}
                    {state.kind === 'clear' && <Icon icon={CheckIcon} size="xsm" color="inherit" />}
                    {state.kind === 'found' && formatCount(state.count)}
                  </div>
                );
              })}
              <div className="pdi-mx-action" role="gridcell">
                {searched ? (
                  <span className="pdi-searched-tag">
                    <Icon icon={BadgeCheckIcon} size="xsm" color="inherit" />
                    Searched
                  </span>
                ) : (
                  <button
                    type="button"
                    className="pdi-run pdi-focusable"
                    disabled={selected.prog.compiled}
                    onClick={() => completeSearch(system.id)}>
                    <Icon icon={ScanSearchIcon} size="xsm" color="inherit" />
                    Run
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ---- fulfillment gate dock ----
  const proofsVerified = selected.prog.proofs.filter(proof => selected.proofsRequired.includes(proof)).length;
  const canCompile = selected.identityDone && selected.searchDone && selected.prog.redaction && !selected.prog.compiled;
  const dock = (
    <div className="pdi-dock" aria-label="Fulfillment gates">
      <div className={`pdi-gate${selected.identityDone ? ' pdi-gate-done' : ''}`}>
        <span className="pdi-gate-title">
          <span className="pdi-gate-num">1</span>
          Identity proof · {proofsVerified}/{selected.proofsRequired.length}
        </span>
        <span className="pdi-gate-row">
          {selected.proofsRequired.map(proof => {
            const verified = selected.prog.proofs.includes(proof);
            return (
              <button
                key={proof}
                type="button"
                className="pdi-proof pdi-focusable"
                aria-pressed={verified}
                onClick={() => toggleProof(proof)}>
                <Icon icon={verified ? BadgeCheckIcon : FingerprintIcon} size="xsm" color="inherit" />
                {PROOF_META[proof].label}
              </button>
            );
          })}
        </span>
      </div>
      <div className={`pdi-gate${selected.searchDone ? ' pdi-gate-done' : ''}`}>
        <span className="pdi-gate-title">
          <span className="pdi-gate-num">2</span>
          System searches
        </span>
        <span className="pdi-gate-row">
          <span className="pdi-ring-wrap">
            <SearchRing searched={selected.searchedCount} />
            <span className="pdi-ring-label">
              {selected.searchedCount}/{SYSTEM_COUNT}
              <span className="pdi-ring-sub">
                {selected.searchDone
                  ? 'all systems searched'
                  : `~${selected.projectedDays.toFixed(1).replace(/\.0$/, '')}d effort left`}
              </span>
            </span>
          </span>
          <StackItem size="fill" />
          <button
            type="button"
            className="pdi-action pdi-focusable"
            disabled={selected.searchDone || selected.prog.compiled}
            onClick={searchNext}>
            <Icon icon={ScanSearchIcon} size="sm" color="inherit" />
            Search next
          </button>
        </span>
      </div>
      <div className={`pdi-gate${selected.prog.redaction ? ' pdi-gate-done' : ''}`}>
        <span className="pdi-gate-title">
          <span className="pdi-gate-num">3</span>
          Redaction review
        </span>
        <span className="pdi-gate-row">
          <button
            type="button"
            className="pdi-action pdi-focusable"
            aria-pressed={selected.prog.redaction}
            disabled={!selected.searchDone || selected.prog.compiled}
            onClick={toggleRedaction}>
            <Icon icon={SquarePenIcon} size="sm" color="inherit" />
            {selected.prog.redaction ? 'Review complete' : 'Mark reviewed'}
          </button>
          {!selected.searchDone && (
            <Text type="supporting" size="sm" color="secondary">
              Unlocks at 8/8 searches
            </Text>
          )}
        </span>
      </div>
      <div className={`pdi-gate${selected.prog.compiled ? ' pdi-gate-done' : ''}`}>
        <span className="pdi-gate-title">
          <span className="pdi-gate-num">4</span>
          Response package
        </span>
        <span className="pdi-gate-row">
          {selected.prog.compiled ? (
            <Badge variant="success" label="Compiled & fulfilled" icon={<Icon icon={PackageCheckIcon} size="xsm" />} />
          ) : (
            <button
              type="button"
              className="pdi-action pdi-action-primary pdi-focusable"
              disabled={!canCompile}
              onClick={compilePackage}>
              <Icon icon={PackageCheckIcon} size="sm" color="inherit" />
              Compile package
            </button>
          )}
        </span>
      </div>
    </div>
  );

  return (
    <div className={SCOPE} style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div aria-live="polite" className="pdi-vh">
              {announcement}
            </div>
            <div className="pdi-body">
              {rail}
              <section className="pdi-work" aria-label={`Fulfillment work for ${selected.req.id}`}>
                {contextBar}
                {matrix}
                {dock}
              </section>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
