var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Marlow & Voss LLP clause playbook
 *   as surfaced in Casewright: 12 clause types with trailing-12-month
 *   deviation counts (73 total), the Limitation of Liability playbook entry
 *   (standard position v4.2 owned by Ruth Vega, three fallback tiers with
 *   acceptance conditions and approval gates), firm market data (168
 *   executed agreements, 50 moved off standard: 68% / 24% / 8% per tier),
 *   four recent deviations including both Kestrel M-2431 agreements
 *   (Skylark Cloud MSA, Larchpay payment processing), one pending update
 *   proposal from David Chen (Jul 14), and one Casewright deviation
 *   analysis of the live Larchpay v3 draft. Fixed July-2026 date strings
 *   only; no clocks, no randomness, no network media.
 * @output Clause Library & Playbook — the firm knowledge surface where
 *   Marlow & Voss standards live: a clause-type rail with per-type
 *   deviation counts; the selected "Limitation of Liability" detail with a
 *   standard-position card (light-locked serif preferred language +
 *   rationale with a fictional authority), a three-tier fallback ladder
 *   (acceptance conditions, approval-required chips — tier 3 demands
 *   partner sign-off), a labeled market-data strip (where deviations
 *   landed, with bars), and a recent-deviations table; an end-panel
 *   Casewright deviation-analysis card comparing the live Larchpay v3
 *   draft against the playbook ("between Fallback 1 and 2") with a
 *   diff-style excerpt, citation chips, an honest confidence band, and a
 *   human Verify action; plus a propose-update affordance with a
 *   pending-review chip. Signed-in user: Ruth Vega (playbook owner).
 * @position Page template; emitted by \`astryx template clause-library-playbook\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (brand, clause search, owner chip)
 *   | rail 272 (clause-type TreeList with deviation-count chips and
 *     pending-proposal dots + pinned coverage strip)
 *   | content (pinned Attorney-Work-Product strip; scrolling playbook
 *     detail: detail header with version/owner/pending-review chip and the
 *     Propose-update affordance, standard-position section, fallback
 *     ladder, market-data strip, recent-deviations table)
 *   | end panel 360 (Casewright deviation-analysis Card + playbook
 *     activity list, scrolls independently).
 *
 * Responsive contract:
 * - > 1280px: full three-region frame.
 * - <= 1280px: the end panel drops; the deviation-analysis card and the
 *   activity list render inline at the end of the content column so the
 *   AI artifact is never lost.
 * - <= 900px: the rail drops; a clause-type Selector appears in the
 *   content toolbar; header and detail-header rows wrap instead of
 *   clipping.
 * - Rail, content, and end panel each scroll independently
 *   (\`minHeight: 0\` down every flex chain); the privilege strip and the
 *   rail coverage strip stay pinned.
 *
 * Container policy: app-shell archetype — framed section rows (styled
 *   divs) and panels, no decorative Cards. The ONE design-system Card is
 *   the Casewright deviation-analysis card: a genuine AI summary widget,
 *   the container the suite reserves Cards for. The deviations table is a
 *   data/columns Table with pixel()/proportional() columns.
 *
 * Color policy: token-pure chrome. Casewright AI purple — the categorical
 *   purple token with the repo-standard fallback pair — marks ONLY the
 *   sparkle glyphs, the disclosure line, and AI chips. Clause language and
 *   the diff excerpt are LIGHT-LOCKED paper blocks (colorScheme: 'light',
 *   PAPER_* literals, serif document voice, insertion/strike washes) per
 *   the doc-comments-review idiom — documented exception, everything
 *   outside them flips with the scheme. Verification vocabulary uses the
 *   suite pairs: verified green light-dark(#0B7A2B, #4ADE80), unverified
 *   amber light-dark(#B45309, #FBBF24), flagged red
 *   light-dark(#C0212F, #F87171). Market bars use categorical tokens with
 *   fallback pairs; labels never sit on the fills.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArrowUpRightIcon,
  BookMarkedIcon,
  CheckCircle2Icon,
  FileDiffIcon,
  LockIcon,
  PenLineIcon,
  ScaleIcon,
  SearchIcon,
  SparklesIcon,
  TriangleAlertIcon,
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
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {Selector} from '@astryxdesign/core/Selector';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// PAINT CONSTANTS
// ---------------------------------------------------------------------------

// Casewright AI purple — categorical token with the repo-standard fallback.
const AI_ACCENT = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const AI_SOFT = 'light-dark(rgba(107,30,253,0.08), rgba(157,107,255,0.16))';

// Suite verification vocabulary (§5.2.3): verified / unverified / flagged.
const VERIFY_GREEN = 'light-dark(#0B7A2B, #4ADE80)';
const VERIFY_AMBER = 'light-dark(#B45309, #FBBF24)';

// Light-locked paper literals (doc-comments-review idiom) — clause language
// and the diff excerpt render as printed paper in both schemes. Do not
// tokenize; washes paint only on the locked paper.
const PAPER_BG = '#FFFFFF';
const PAPER_TEXT = '#1F2A37';
const PAPER_MUTED = '#6B7280';
const PAPER_RULE = '#E5E7EB';
const INSERT_INK = '#0B7A2B';
const INSERT_BG = '#E4F5E8';
const DELETE_INK = '#C0212F';
const DELETE_BG = '#FBE8EA';

const SERIF = "Georgia, 'Times New Roman', Times, serif";

// Market-bar fills — categorical tokens with repo-standard fallbacks.
const BAR_COLOR: Record<number, string> = {
  1: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  2: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  3: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
};

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun 6: Layout height="fill" collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-2)'},
  railFooter: {flexShrink: 0, padding: 'var(--spacing-3)'},
  countChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 7px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: VERIFY_AMBER,
    flexShrink: 0,
  },
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  // Pinned Attorney-Work-Product strip — persistent, never scrolls away.
  privilegeStrip: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  contentToolbar: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-4)'},
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-6)',
  },
  detailColumn: {maxWidth: 980, width: '100%', marginInline: 'auto'},
  // Framed section rows — app-shell surfaces, not Cards.
  sectionFrame: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-4)',
  },
  // Light-locked serif paper block for clause language (see Color policy).
  paper: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    border: \`1px solid \${PAPER_RULE}\`,
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-4)',
  },
  paperLabel: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 11,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: PAPER_MUTED,
    marginBottom: 8,
  },
  paperText: {
    fontFamily: SERIF,
    fontSize: 15,
    lineHeight: 1.8,
    margin: 0,
    overflowWrap: 'break-word',
  },
  insText: {
    color: INSERT_INK,
    backgroundColor: INSERT_BG,
    textDecoration: 'underline',
    textDecorationColor: INSERT_INK,
    textDecorationThickness: 2,
    textUnderlineOffset: 3,
    borderRadius: 3,
    paddingInline: 1,
  },
  delText: {
    color: DELETE_INK,
    backgroundColor: DELETE_BG,
    textDecoration: 'line-through',
    textDecorationColor: DELETE_INK,
    textDecorationThickness: 2,
    borderRadius: 3,
    paddingInline: 1,
    marginRight: 2,
  },
  // Fallback ladder rows.
  tierRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3) 0',
  },
  tierBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  tierBody: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)'},
  // Market-data strip bars — one shared px scale, labels off the fills.
  barRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)'},
  barLabel: {width: 96, flexShrink: 0},
  barTrack: {
    flex: 1,
    minWidth: 0,
    height: 10,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  barFill: {height: '100%', borderRadius: 'var(--radius-full)'},
  barValue: {width: 108, flexShrink: 0, textAlign: 'end'},
  tableScroll: {overflowX: 'auto'},
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Citation chips — compact, focusable, never truncate mid-citation
  // (flexShrink 0 per footgun 18; rows wrap instead).
  chipRow: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1)', alignItems: 'center'},
  citationChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 11,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    flexShrink: 0,
  },
  // Casewright disclosure line — one shared treatment across the suite.
  disclosureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    color: 'var(--color-text-secondary)',
  },
  sparkleMark: {display: 'inline-flex', color: AI_ACCENT, flexShrink: 0},
  aiChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: AI_SOFT,
    color: AI_ACCENT,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  verifyRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)'},
  verifiedInk: {color: VERIFY_GREEN, display: 'inline-flex', flexShrink: 0},
  amberInk: {color: VERIFY_AMBER, display: 'inline-flex', flexShrink: 0},
  endScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-3)'},
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
// FIXTURES — Marlow & Voss LLP clause playbook in Casewright. Suite "now":
// Wednesday, July 15, 2026. Signed-in user: Ruth Vega (knowledge lawyer,
// playbook owner). Counts reconcile: rail deviation counts sum to 73; the
// Limitation of Liability entry shows 4 of its 14 trailing-12-month
// deviations; market bars 34 + 12 + 4 = 50 moved matters; 118 held + 50
// moved = 168 executed agreements.
// ---------------------------------------------------------------------------

const CURRENT_USER = 'Ruth Vega';

interface ClauseType {
  id: string;
  label: string;
  /** Trailing-12-month deviation count — the rail chip. */
  deviations: number;
  /** Update proposals awaiting playbook-owner review. */
  pending: number;
}

const CLAUSE_TYPES: ClauseType[] = [
  {id: 'lol', label: 'Limitation of Liability', deviations: 14, pending: 1},
  {id: 'indemnification', label: 'Indemnification', deviations: 11, pending: 0},
  {id: 'ip-license', label: 'IP Ownership & License', deviations: 9, pending: 0},
  {id: 'data-protection', label: 'Data Protection & Security', deviations: 8, pending: 1},
  {id: 'confidentiality', label: 'Confidentiality', deviations: 7, pending: 0},
  {id: 'term-termination', label: 'Term & Termination', deviations: 6, pending: 0},
  {id: 'warranties', label: 'Warranties', deviations: 5, pending: 0},
  {id: 'governing-law', label: 'Governing Law & Venue', deviations: 4, pending: 0},
  {id: 'assignment', label: 'Assignment & Change of Control', deviations: 3, pending: 0},
  {id: 'insurance', label: 'Insurance', deviations: 3, pending: 0},
  {id: 'force-majeure', label: 'Force Majeure', deviations: 2, pending: 0},
  {id: 'mfc', label: 'Most Favored Customer', deviations: 1, pending: 0},
];

const TOTAL_DEVIATIONS = 73; // sum of the rail counts above
const TOTAL_PENDING = 2; // D. Chen (this entry) + P. Khanna (data protection)

/** The selected playbook entry — Limitation of Liability. */
const PLAYBOOK = {
  clauseId: 'lol',
  section: 'Playbook § 9',
  title: 'Limitation of Liability',
  version: 'v4.2',
  owner: 'Ruth Vega',
  ownerRole: 'Knowledge lawyer · playbook owner',
  approvedBy: 'Julian Voss',
  approvedOn: 'Mar 12, 2026',
  reviewedOn: 'Jul 6, 2026',
  scope: 'Technology & commercial agreements',
};

const STANDARD = {
  heading: '12-month fee cap with conspicuous carve-outs',
  citation: 'Playbook § 9.1',
  language:
    'Except for Excluded Claims, each party’s aggregate liability arising out of or relating to this Agreement, whether in contract, tort, or otherwise, shall not exceed the total fees paid or payable by Customer under this Agreement in the twelve (12) months preceding the event giving rise to the claim. “Excluded Claims” means (a) a party’s indemnification obligations under Section 10; (b) breach of Section 8 (Confidentiality); and (c) liability arising from a party’s gross negligence, fraud, or willful misconduct.',
  rationale:
    'Ties exposure to deal economics while keeping the claims most likely to exceed the cap — indemnity, confidentiality, willful misconduct — outside it. The carve-out list stays defined and conspicuous; do not trade the definition of Excluded Claims for cap size.',
  authorityCase: 'Hollis v. Merton Indus.',
  authorityCite: ', 512 F.3d 204 (2d Cir. 2019)',
  authorityNote: '(enforcing a fee-linked cap where the carve-out list was explicit and conspicuous)',
};

type ApprovalTone = 'gray' | 'orange' | 'red';

interface FallbackTier {
  tier: 1 | 2 | 3;
  title: string;
  citation: string;
  /** Serif excerpt rendered on the light-locked paper block. */
  language: string;
  /** Acceptance conditions — when the firm may concede to this tier. */
  acceptWhen: string;
  approval: {label: string; tone: ApprovalTone};
  /** Firm-history acceptance among the 50 matters that moved off standard. */
  sharePct: number;
  count: number;
}

const FALLBACKS: FallbackTier[] = [
  {
    tier: 1,
    title: '18-month fee cap',
    citation: 'Playbook § 9.2',
    language:
      '…shall not exceed the total fees paid or payable by Customer under this Agreement in the eighteen (18) months preceding the event giving rise to the claim.',
    acceptWhen:
      'Counterparty is a critical-path vendor and annual contract value is $250k or more; the Excluded Claims list is unchanged.',
    approval: {label: 'Senior associate may approve', tone: 'gray'},
    sharePct: 68,
    count: 34,
  },
  {
    tier: 2,
    title: '2× fee cap + 3× data-breach super-cap',
    citation: 'Playbook § 9.3',
    language:
      '…shall not exceed two (2×) the total fees paid or payable in the twelve (12) months preceding the claim; provided that liability arising from breach of Section 12 (Data Protection) shall not exceed three (3×) such fees.',
    acceptWhen:
      'Counterparty processes client or end-user personal data; a super-cap of at least 3× is preserved; Excluded Claims list intact.',
    approval: {label: 'Playbook-owner review · R. Vega', tone: 'orange'},
    sharePct: 24,
    count: 12,
  },
  {
    tier: 3,
    title: 'Mutual 1× cap with narrowed carve-outs (floor)',
    citation: 'Playbook § 9.4',
    language:
      '…aggregate liability shall not exceed the total fees paid or payable under this Agreement, with Excluded Claims limited to indemnification obligations and willful misconduct.',
    acceptWhen:
      'Last position before walk-away: only where the counterparty refuses any super-cap and the client accepts the residual exposure in writing.',
    approval: {label: 'Partner sign-off required · E. Marlow or J. Voss', tone: 'red'},
    sharePct: 8,
    count: 4,
  },
];

// Firm market data — where negotiated outcomes landed. 118 held standard;
// the 50 that moved are the ladder shares above (34 + 12 + 4).
const MARKET = {
  executed: 168,
  held: 118,
  heldPct: 70,
  moved: 50,
  window: 'Jan 2025 – Jul 15, 2026',
  source: 'Casewright clause archive · executed technology & commercial agreements',
};

type OutcomeTone = 'green' | 'blue' | 'orange';

interface DeviationRow extends Record<string, unknown> {
  id: string;
  matter: string;
  client: string;
  agreement: string;
  summary: string;
  landed: string;
  outcome: string;
  outcomeTone: OutcomeTone;
  approver: string;
  date: string;
}

// Four most recent of the 14 trailing-12-month deviations. Both live
// Kestrel M-2431 agreements appear; the Skylark row is the same
// liability-cap issue Casewright flagged in the contract review (Jul 14),
// and the Larchpay row is the draft the deviation analysis below reads.
const DEVIATION_ROWS: DeviationRow[] = [
  {
    id: 'd-larchpay',
    matter: 'M-2431',
    client: 'Kestrel Labs',
    agreement: 'Larchpay Payment Processing Agreement · v3',
    summary:
      'v3 turn moves the cap to 18 months of fees but shifts chargeback liability to Kestrel above $50k/quarter — between Fallback 1 and Fallback 2.',
    landed: 'Between F1–F2',
    outcome: 'Under review',
    outcomeTone: 'orange',
    approver: 'J. Voss',
    date: 'Jul 15, 2026',
  },
  {
    id: 'd-skylark',
    matter: 'M-2431',
    client: 'Kestrel Labs',
    agreement: 'Skylark Cloud MSA · v4',
    summary:
      'Counterparty struck the 3× data-breach super-cap and raised the base cap to 2×; markup restores the super-cap per Fallback 2.',
    landed: 'Fallback 2',
    outcome: 'Markup due Jul 17',
    outcomeTone: 'blue',
    approver: 'J. Voss',
    date: 'Jul 14, 2026',
  },
  {
    id: 'd-veldt',
    matter: 'M-2389',
    client: 'Veldt Analytics',
    agreement: 'Nimbus SaaS Agreement',
    summary: 'Accepted the 18-month fee cap; Excluded Claims list unchanged.',
    landed: 'Fallback 1',
    outcome: 'Executed',
    outcomeTone: 'green',
    approver: 'P. Khanna',
    date: 'Jun 26, 2026',
  },
  {
    id: 'd-torvald',
    matter: 'M-2374',
    client: 'Torvald Marine',
    agreement: 'Sensor Supply MSA',
    summary: 'Counterparty accepted the standard 12-month cap after two turns.',
    landed: 'Standard held',
    outcome: 'Executed',
    outcomeTone: 'green',
    approver: '',
    date: 'Jun 12, 2026',
  },
];

// Casewright deviation analysis of the live Larchpay draft (M-2431).
// The plain-language chargeback summary reuses the redline-compare canon
// string; verification starts UNVERIFIED — a human flips it.
const AI_ANALYSIS = {
  subject: 'Larchpay Payment Processing Agreement · draft v3 · § 9.2',
  matter: 'M-2431 · Kestrel Labs — Atlas Launch Vendor Agreements',
  verdict:
    'The live draft sits between Fallback 1 and Fallback 2. Its eighteen (18)-month fee cap matches Fallback 1, but the new chargeback carve-out shifts chargeback liability to Kestrel above $50k/quarter — super-cap territory the playbook reaches only at Fallback 2, and there paired with a 3× ceiling this draft does not include.',
  recommendation:
    'Counter with Fallback 2 language restoring a 3× ceiling on Chargeback Losses. If the client accepts the draft as-is, route for partner sign-off — an uncapped carve-out falls below the § 9.4 floor.',
  confidence: 'High confidence',
  confidenceNote: 'Cap arithmetic and carve-out scope read directly from the draft text.',
  chips: ['Larchpay v3 · § 9.2', 'Playbook § 9.2 · Fallback 1', 'Playbook § 9.3 · Fallback 2'],
  diffLabel: 'v2 → v3 · § 9.2 excerpt',
};

type DiffKind = 'text' | 'ins' | 'del';

const DIFF_SEGMENTS: {kind: DiffKind; text: string}[] = [
  {kind: 'text', text: '…each party’s aggregate liability shall not exceed the total fees paid or payable in the '},
  {kind: 'del', text: 'twelve (12)'},
  {kind: 'ins', text: 'eighteen (18)'},
  {kind: 'text', text: ' months preceding the event giving rise to the claim'},
  {
    kind: 'ins',
    text: '; provided that Chargeback Losses in excess of $50,000 in any calendar quarter shall be borne by Merchant and shall not count toward the foregoing cap',
  },
  {kind: 'text', text: '.'},
];

interface ActivityEntry {
  id: string;
  actor: string;
  text: string;
  date: string;
  isAi: boolean;
  isPending: boolean;
}

const ACTIVITY: ActivityEntry[] = [
  {
    id: 'act-chen',
    actor: 'David Chen',
    text: 'Proposed an update to Fallback 2 — add PCI-scoped payment processors to the acceptance conditions.',
    date: 'Jul 14, 2026',
    isAi: false,
    isPending: true,
  },
  {
    id: 'act-skylark',
    actor: 'Casewright',
    text: 'Flagged Skylark Cloud MSA § 11.2 against this playbook during contract review.',
    date: 'Jul 14, 2026',
    isAi: true,
    isPending: false,
  },
  {
    id: 'act-review',
    actor: 'Ruth Vega',
    text: 'Completed the semi-annual review of § 9 — no change to the standard position.',
    date: 'Jul 6, 2026',
    isAi: false,
    isPending: false,
  },
];

// ---------------------------------------------------------------------------
// SHARED PRIMITIVES — one disclosure treatment, one citation-chip
// treatment, one verification vocabulary across the whole suite (§5.2).
// ---------------------------------------------------------------------------

/** "AI-generated · verify before relying" — the suite's disclosure line. */
function DisclosureLine() {
  return (
    <span style={styles.disclosureRow}>
      <span style={styles.sparkleMark} aria-hidden>
        <Icon icon={SparklesIcon} size="xsm" color="inherit" />
      </span>
      <Text type="supporting" color="secondary">
        AI-generated · verify before relying
      </Text>
    </span>
  );
}

/**
 * Compact citation chip — every AI assertion carries one. Clicking "pins"
 * the source (announced politely; in product it scrolls to the passage).
 */
function CitationChip({label, onPin}: {label: string; onPin: (label: string) => void}) {
  return (
    <button
      type="button"
      style={styles.citationChip}
      onClick={() => onPin(label)}
      aria-label={\`Go to source: \${label}\`}>
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// RAIL — clause-type list with deviation-count chips and pending dots,
// plus the pinned coverage strip.
// ---------------------------------------------------------------------------

function ClauseRail({
  selectedId,
  onSelect,
  query,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  query: string;
}) {
  const needle = query.trim().toLowerCase();
  const visible = needle.length === 0
    ? CLAUSE_TYPES
    : CLAUSE_TYPES.filter(clause => clause.label.toLowerCase().includes(needle));

  const items: TreeListItemData[] = visible.map(clause => ({
    id: clause.id,
    label: clause.label,
    startContent: <Icon icon={ScaleIcon} size="sm" color="secondary" />,
    endContent: (
      <span style={styles.countChip} aria-label={\`\${clause.deviations} deviations, trailing 12 months\`}>
        {clause.pending > 0 ? (
          <span style={styles.pendingDot} aria-label={\`\${clause.pending} proposal pending review\`} />
        ) : null}
        {clause.deviations}
      </span>
    ),
    isSelected: clause.id === selectedId,
    onClick: () => onSelect(clause.id),
  }));

  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <TreeList
          density="compact"
          items={items}
          header={
            <Text type="label" size="sm" color="secondary">
              Clause types · deviations (12 mo)
            </Text>
          }
        />
        {visible.length === 0 ? (
          <EmptyState
            isCompact
            icon={<Icon icon={SearchIcon} size="lg" />}
            title="No matching clause types"
            description="Try a different clause name."
          />
        ) : null}
      </div>
      <Divider />
      {/* Coverage strip — pinned. 73 = sum of the rail chips above. */}
      <VStack gap={1} style={styles.railFooter}>
        <Text type="label" size="sm">
          Playbook coverage
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          12 clause types · {TOTAL_DEVIATIONS} deviations in the trailing 12 months
        </Text>
        <HStack gap={1} vAlign="center">
          <span style={styles.pendingDot} aria-hidden />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {TOTAL_PENDING} update proposals pending review
          </Text>
        </HStack>
        <Text type="supporting" color="secondary">
          Semi-annual review completed Jul 6, 2026
        </Text>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STANDARD POSITION — preferred language on light-locked serif paper,
// rationale note, and a fictional-authority line (never real citations).
// ---------------------------------------------------------------------------

function StandardPositionSection({onPin}: {onPin: (label: string) => void}) {
  return (
    <section style={styles.sectionFrame} aria-label="Standard position">
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Token size="sm" color="green" label="Standard position" style={{flexShrink: 0}} />
          <StackItem size="fill" style={{minWidth: 160}}>
            <Heading level={3}>{STANDARD.heading}</Heading>
          </StackItem>
          <CitationChip label={STANDARD.citation} onPin={onPin} />
        </HStack>
        <div style={styles.paper}>
          <div style={styles.paperLabel}>Preferred language</div>
          <p style={styles.paperText}>{STANDARD.language}</p>
        </div>
        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary">
            Rationale
          </Text>
          <Text type="body" color="secondary">
            {STANDARD.rationale}
          </Text>
          <Text type="supporting" color="secondary">
            See <em>{STANDARD.authorityCase}</em>
            {STANDARD.authorityCite} {STANDARD.authorityNote}.
          </Text>
        </VStack>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <span style={styles.verifiedInk} aria-hidden>
            <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
          </span>
          <Text type="supporting" color="secondary">
            Approved · {PLAYBOOK.approvedBy} · {PLAYBOOK.approvedOn}
          </Text>
          <Text type="supporting" color="secondary">
            Reviewed · R. Vega · {PLAYBOOK.reviewedOn}
          </Text>
        </HStack>
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FALLBACK LADDER — three tiers with acceptance conditions and approval
// gates; tier 3 requires partner sign-off.
// ---------------------------------------------------------------------------

function FallbackTierRow({tier, onPin}: {tier: FallbackTier; onPin: (label: string) => void}) {
  return (
    <div style={styles.tierRow}>
      <span style={styles.tierBadge} aria-hidden>
        F{tier.tier}
      </span>
      <div style={styles.tierBody}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill" style={{minWidth: 160}}>
            <Text type="label">{tier.title}</Text>
          </StackItem>
          <Token
            size="sm"
            color={tier.approval.tone}
            label={tier.approval.label}
            style={{flexShrink: 0}}
          />
          <CitationChip label={tier.citation} onPin={onPin} />
        </HStack>
        <div style={styles.paper}>
          <p style={styles.paperText}>{tier.language}</p>
        </div>
        <Text type="supporting" color="secondary">
          <strong>Accept when:</strong> {tier.acceptWhen}
        </Text>
      </div>
    </div>
  );
}

function FallbackLadderSection({onPin}: {onPin: (label: string) => void}) {
  return (
    <section style={styles.sectionFrame} aria-label="Fallback positions">
      <VStack gap={1}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill" style={{minWidth: 160}}>
            <Heading level={3}>Fallback positions</Heading>
          </StackItem>
          <Text type="supporting" color="secondary">
            Concede in order · never skip an approval gate
          </Text>
        </HStack>
        {FALLBACKS.map((tier, index) => (
          <VStack gap={0} key={tier.tier}>
            {index > 0 ? <Divider /> : null}
            <FallbackTierRow tier={tier} onPin={onPin} />
          </VStack>
        ))}
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// MARKET-DATA STRIP — where deviations landed, from firm history. Bars are
// labeled with tier, percentage, and count (chart hygiene: no axis-less
// bars, values right-aligned with tabular numerals, labels off the fills).
// ---------------------------------------------------------------------------

function MarketDataStrip() {
  return (
    <section style={styles.sectionFrame} aria-label="Firm market data">
      <VStack gap={3}>
        <VStack gap={0}>
          <Heading level={3}>Where deviations landed</Heading>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {MARKET.source} · {MARKET.window}
          </Text>
        </VStack>
        <Text type="body" color="secondary" hasTabularNumbers>
          Standard held on {MARKET.held} of {MARKET.executed} executed agreements ({MARKET.heldPct}
          %). The {MARKET.moved} that moved landed:
        </Text>
        <VStack gap={2}>
          {FALLBACKS.map(tier => (
            <div key={tier.tier} style={styles.barRow}>
              <span style={styles.barLabel}>
                <Text type="label" size="sm">
                  Fallback {tier.tier}
                </Text>
              </span>
              <div
                style={styles.barTrack}
                role="img"
                aria-label={\`Fallback \${tier.tier}: \${tier.sharePct} percent, \${tier.count} of \${MARKET.moved} matters\`}>
                <div
                  style={{
                    ...styles.barFill,
                    width: \`\${tier.sharePct}%\`,
                    backgroundColor: BAR_COLOR[tier.tier],
                  }}
                />
              </div>
              <span style={styles.barValue}>
                <Text type="body" hasTabularNumbers style={styles.numericCell}>
                  {tier.sharePct}% · {tier.count} of {MARKET.moved}
                </Text>
              </span>
            </div>
          ))}
        </VStack>
        <Text type="supporting" color="secondary">
          Scale: bar length is the share of the {MARKET.moved} moved matters. Tier-3 concessions
          are rare by design — each one carried partner sign-off.
        </Text>
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// RECENT DEVIATIONS — 4 most recent of the 14 trailing-12-month deviations.
// Fixed-width columns carry pixel() so width and minWidth both land on the
// header cell (footgun 4).
// ---------------------------------------------------------------------------

const DEVIATION_COLUMNS: TableColumn<DeviationRow>[] = [
  {
    key: 'matter',
    header: 'Matter',
    width: proportional(2, {minWidth: 180}),
    renderCell: (row: DeviationRow) => (
      <VStack gap={0}>
        <Text type="label" maxLines={1} hasTabularNumbers>
          {row.matter} · {row.client}
        </Text>
        <Text type="supporting" color="secondary" maxLines={2}>
          {row.agreement}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'summary',
    header: 'Deviation',
    width: proportional(3, {minWidth: 220}),
    renderCell: (row: DeviationRow) => (
      <Text type="supporting" color="secondary">
        {row.summary}
      </Text>
    ),
  },
  {
    key: 'landed',
    header: 'Landed at',
    width: pixel(130),
    renderCell: (row: DeviationRow) => <Token size="sm" color="gray" label={row.landed} />,
  },
  {
    key: 'outcome',
    header: 'Outcome',
    width: pixel(168),
    renderCell: (row: DeviationRow) => (
      <VStack gap={1}>
        <Token size="sm" color={row.outcomeTone} label={row.outcome} />
        <Text type="supporting" color="secondary" maxLines={1} hasTabularNumbers>
          {row.approver ? \`\${row.approver} · \${row.date}\` : row.date}
        </Text>
      </VStack>
    ),
  },
];

function RecentDeviationsSection() {
  return (
    <section style={styles.sectionFrame} aria-label="Recent deviations">
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill" style={{minWidth: 160}}>
            <Heading level={3}>Recent deviations</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            4 most recent of 14 · trailing 12 months
          </Text>
        </HStack>
        <div style={styles.tableScroll}>
          <Table<DeviationRow>
            data={DEVIATION_ROWS}
            columns={DEVIATION_COLUMNS}
            idKey="id"
            density="balanced"
            dividers="rows"
          />
        </div>
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// CASEWRIGHT DEVIATION ANALYSIS — the one design-system Card on the page
// (genuine AI summary widget). Disclosure line, citation chips on every
// assertion, honest confidence band, human Verify action.
// ---------------------------------------------------------------------------

function DiffExcerpt() {
  return (
    <div style={styles.paper}>
      <div style={styles.paperLabel}>{AI_ANALYSIS.diffLabel}</div>
      <p style={styles.paperText}>
        {DIFF_SEGMENTS.map((segment, index) =>
          segment.kind === 'text' ? (
            <span key={index}>{segment.text}</span>
          ) : (
            <span
              key={index}
              style={segment.kind === 'ins' ? styles.insText : styles.delText}
              aria-label={segment.kind === 'ins' ? \`Inserted: \${segment.text}\` : \`Struck: \${segment.text}\`}>
              {segment.text}
            </span>
          ),
        )}
      </p>
    </div>
  );
}

function DeviationAnalysisCard({
  isVerified,
  onVerify,
  onPin,
}: {
  isVerified: boolean;
  onVerify: () => void;
  onPin: (label: string) => void;
}) {
  return (
    <Card padding={3}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <span style={styles.aiChip}>
            <Icon icon={SparklesIcon} size="xsm" color="inherit" />
            Casewright
          </span>
          <StackItem size="fill" style={{minWidth: 140}}>
            <Text type="label">Deviation analysis</Text>
          </StackItem>
          <Token size="sm" color="gray" label={AI_ANALYSIS.confidence} style={{flexShrink: 0}} />
        </HStack>
        <VStack gap={0}>
          <Text type="label" size="sm">
            {AI_ANALYSIS.subject}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {AI_ANALYSIS.matter}
          </Text>
        </VStack>
        <Text type="body" color="secondary">
          {AI_ANALYSIS.verdict}
        </Text>
        <DiffExcerpt />
        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary">
            Suggested path
          </Text>
          <Text type="supporting" color="secondary">
            {AI_ANALYSIS.recommendation}
          </Text>
        </VStack>
        <div style={styles.chipRow}>
          {AI_ANALYSIS.chips.map(chip => (
            <CitationChip key={chip} label={chip} onPin={onPin} />
          ))}
        </div>
        <Text type="supporting" color="secondary">
          {AI_ANALYSIS.confidence} — {AI_ANALYSIS.confidenceNote}
        </Text>
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill" style={{minWidth: 150}}>
            {isVerified ? (
              <span style={styles.verifyRow}>
                <span style={styles.verifiedInk} aria-hidden>
                  <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
                </span>
                <Text type="supporting" color="secondary">
                  Verified · R. Vega · Jul 15, 2026
                </Text>
              </span>
            ) : (
              <span style={styles.verifyRow}>
                <span style={styles.amberInk} aria-hidden>
                  <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
                </span>
                <Text type="supporting" color="secondary">
                  Unverified — not yet checked against the draft
                </Text>
              </span>
            )}
          </StackItem>
          {isVerified ? null : (
            <Button label="Verify against draft" variant="secondary" size="sm" onClick={onVerify} />
          )}
          <Button
            label="Open redline compare"
            variant="ghost"
            size="sm"
            icon={<Icon icon={ArrowUpRightIcon} size="sm" />}
          />
        </HStack>
        <DisclosureLine />
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// PLAYBOOK ACTIVITY — proposals and review provenance for this entry.
// ---------------------------------------------------------------------------

function ActivityList({extraProposals}: {extraProposals: string[]}) {
  return (
    <VStack gap={1}>
      <Text type="label" size="sm" color="secondary">
        Playbook activity · § 9
      </Text>
      <List density="compact">
        {extraProposals.map((text, index) => (
          <ListItem
            key={\`proposal-\${index}\`}
            label="Ruth Vega proposed an update"
            description={
              <VStack gap={0}>
                <Text type="supporting" color="secondary">
                  {text}
                </Text>
                <Text type="supporting" color="secondary">
                  Jul 15, 2026 · routed to J. Voss for approval
                </Text>
              </VStack>
            }
            startContent={<Avatar name="Ruth Vega" size="small" />}
            endContent={<Token size="sm" color="orange" label="Pending review" style={{flexShrink: 0}} />}
          />
        ))}
        {ACTIVITY.map(entry => (
          <ListItem
            key={entry.id}
            label={entry.isAi ? 'Casewright' : entry.actor}
            description={
              <VStack gap={0}>
                <Text type="supporting" color="secondary">
                  {entry.text}
                </Text>
                <HStack gap={1} vAlign="center">
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {entry.date}
                  </Text>
                  {entry.isAi ? <DisclosureLine /> : null}
                </HStack>
              </VStack>
            }
            startContent={
              entry.isAi ? (
                <span style={styles.sparkleMark} aria-hidden>
                  <Icon icon={SparklesIcon} size="sm" color="inherit" />
                </span>
              ) : (
                <Avatar name={entry.actor} size="small" />
              )
            }
            endContent={
              entry.isPending ? (
                <Token size="sm" color="orange" label="Pending review" style={{flexShrink: 0}} />
              ) : undefined
            }
          />
        ))}
      </List>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PROPOSE-UPDATE FORM — inline compose row under the detail header. Not a
// destructive action, so no confirm dialog; submission routes to the
// approving partner and adds a pending-review chip.
// ---------------------------------------------------------------------------

const PROPOSAL_TARGETS = [
  {value: 'standard', label: 'Standard position · § 9.1'},
  {value: 'f1', label: 'Fallback 1 · § 9.2'},
  {value: 'f2', label: 'Fallback 2 · § 9.3'},
  {value: 'f3', label: 'Fallback 3 · § 9.4'},
];

function ProposeUpdateForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (target: string, rationale: string) => void;
  onCancel: () => void;
}) {
  const [target, setTarget] = useState('f2');
  const [rationale, setRationale] = useState('');
  const canSubmit = rationale.trim().length > 0;
  const targetLabel =
    PROPOSAL_TARGETS.find(option => option.value === target)?.label ?? target;

  return (
    <section style={styles.sectionFrame} aria-label="Propose a playbook update">
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill" style={{minWidth: 160}}>
            <Heading level={3}>Propose an update</Heading>
          </StackItem>
          <Text type="supporting" color="secondary">
            Routes to {PLAYBOOK.approvedBy} for approval
          </Text>
        </HStack>
        <Selector
          label="Position to update"
          options={PROPOSAL_TARGETS}
          value={target}
          onChange={setTarget}
          size="sm"
          width={260}
        />
        <TextArea
          label="Rationale"
          placeholder="What should change, and why — cite matters or authorities where possible…"
          value={rationale}
          onChange={setRationale}
          rows={3}
          width="100%"
        />
        <HStack gap={2} vAlign="center">
          <Button
            label="Submit proposal"
            variant="primary"
            size="sm"
            isDisabled={!canSubmit}
            onClick={() => onSubmit(targetLabel, rationale.trim())}
          />
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onCancel}
          />
        </HStack>
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// DETAIL HEADER — clause identity, version/owner provenance, the
// pending-review chip, and the propose-update affordance.
// ---------------------------------------------------------------------------

function DetailHeader({
  pendingCount,
  isFormOpen,
  onToggleForm,
}: {
  pendingCount: number;
  isFormOpen: boolean;
  onToggleForm: () => void;
}) {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <StackItem size="fill" style={{minWidth: 220}}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Heading level={2}>{PLAYBOOK.title}</Heading>
            <Token size="sm" color="gray" label={\`\${PLAYBOOK.section} · \${PLAYBOOK.version}\`} style={{flexShrink: 0}} />
            <Token
              size="sm"
              color="orange"
              label={\`\${pendingCount} pending review\`}
              style={{flexShrink: 0}}
            />
          </HStack>
        </StackItem>
        <Button
          label={isFormOpen ? 'Close proposal' : 'Propose update'}
          variant={isFormOpen ? 'secondary' : 'primary'}
          size="sm"
          icon={<Icon icon={PenLineIcon} size="sm" color="inherit" />}
          onClick={onToggleForm}
        />
      </HStack>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <HStack gap={1} vAlign="center">
          <Avatar name={PLAYBOOK.owner} size="xsmall" />
          <Text type="supporting" color="secondary">
            {PLAYBOOK.owner} · {PLAYBOOK.ownerRole}
          </Text>
        </HStack>
        <Text type="supporting" color="secondary">
          {PLAYBOOK.scope} · Reviewed {PLAYBOOK.reviewedOn}
        </Text>
      </HStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const CLAUSE_OPTIONS = CLAUSE_TYPES.map(clause => ({
  value: clause.id,
  label: clause.label,
}));

export default function ClauseLibraryPlaybookTemplate() {
  const [selectedId, setSelectedId] = useState('lol');
  const [query, setQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAnalysisVerified, setIsAnalysisVerified] = useState(false);
  const [submittedProposals, setSubmittedProposals] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1280px drops the end panel (AI card + activity
  // render inline); <=900px drops the rail (clause Selector appears).
  const isPanelHidden = useMediaQuery('(max-width: 1280px)');
  const isCompact = useMediaQuery('(max-width: 900px)');

  const selectedClause = useMemo(
    () => CLAUSE_TYPES.find(clause => clause.id === selectedId) ?? CLAUSE_TYPES[0],
    [selectedId],
  );
  const isLolSelected = selectedClause.id === 'lol';
  const pendingCount = selectedClause.pending + (isLolSelected ? submittedProposals.length : 0);

  const pinSource = (label: string) => {
    setAnnouncement(\`Pinned source: \${label}\`);
  };

  const verifyAnalysis = () => {
    setIsAnalysisVerified(true);
    setAnnouncement('Deviation analysis verified against the Larchpay v3 draft by R. Vega');
  };

  const submitProposal = (targetLabel: string, rationale: string) => {
    setSubmittedProposals(prev => [...prev, \`\${targetLabel} — \${rationale}\`]);
    setIsFormOpen(false);
    setAnnouncement(\`Proposal for \${targetLabel} routed to \${PLAYBOOK.approvedBy} for approval\`);
  };

  // ----- header: brand, clause search, signed-in owner chip -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={BookMarkedIcon} size="md" color="secondary" />
          <Heading level={1}>Clause Library &amp; Playbook</Heading>
          <Text type="supporting" color="secondary">
            Marlow &amp; Voss LLP · Casewright
          </Text>
        </HStack>
        <StackItem size="fill">
          <TextInput
            label="Search clause types"
            isLabelHidden
            size="sm"
            width="100%"
            style={{maxWidth: 440}}
            placeholder="Search clause types…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        <HStack gap={1} vAlign="center" style={{flexShrink: 0}}>
          <Avatar name={CURRENT_USER} size="xsmall" />
          <Text type="supporting" color="secondary">
            {CURRENT_USER} · playbook owner
          </Text>
        </HStack>
      </HStack>
    </LayoutHeader>
  );

  // ----- end panel body: AI analysis + activity (inline when panel drops) -----
  const analysisAndActivity = (
    <VStack gap={3}>
      <DeviationAnalysisCard
        isVerified={isAnalysisVerified}
        onVerify={verifyAnalysis}
        onPin={pinSource}
      />
      <Divider />
      <ActivityList extraProposals={submittedProposals} />
    </VStack>
  );

  // ----- placeholder for clause types outside the seeded fixture -----
  const placeholderDetail = (
    <section style={styles.sectionFrame} aria-label={\`\${selectedClause.label} playbook\`}>
      <EmptyState
        isCompact
        icon={<Icon icon={ScaleIcon} size="lg" />}
        title={\`\${selectedClause.label} — \${selectedClause.deviations} deviations (12 mo)\`}
        description="Standard and fallback positions for this clause type live here. The seeded fixture carries the full detail for Limitation of Liability — select it in the rail."
      />
    </section>
  );

  // ----- content column -----
  const detail = isLolSelected ? (
    <VStack gap={3}>
      <DetailHeader
        pendingCount={pendingCount}
        isFormOpen={isFormOpen}
        onToggleForm={() => setIsFormOpen(open => !open)}
      />
      {isFormOpen ? (
        <ProposeUpdateForm onSubmit={submitProposal} onCancel={() => setIsFormOpen(false)} />
      ) : null}
      <StandardPositionSection onPin={pinSource} />
      <FallbackLadderSection onPin={pinSource} />
      <MarketDataStrip />
      <RecentDeviationsSection />
      {isPanelHidden ? (
        <section style={styles.sectionFrame} aria-label="Casewright deviation analysis">
          {analysisAndActivity}
        </section>
      ) : null}
    </VStack>
  ) : (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <StackItem size="fill" style={{minWidth: 220}}>
          <Heading level={2}>{selectedClause.label}</Heading>
        </StackItem>
        {selectedClause.pending > 0 ? (
          <Token
            size="sm"
            color="orange"
            label={\`\${selectedClause.pending} pending review\`}
            style={{flexShrink: 0}}
          />
        ) : null}
        <Token
          size="sm"
          color="gray"
          label={\`\${selectedClause.deviations} deviations · 12 mo\`}
          style={{flexShrink: 0}}
        />
      </HStack>
      {placeholderDetail}
    </VStack>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel width={272} padding={0} hasDivider label="Clause types">
              <ClauseRail selectedId={selectedId} onSelect={setSelectedId} query={query} />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              {/* Persistent work-product strip (§5.2.5) — pinned above the
                  scrolling detail so it never scrolls away. */}
              <div style={styles.privilegeStrip}>
                <Icon icon={LockIcon} size="xsm" color="secondary" />
                <Text type="supporting" color="secondary">
                  Attorney Work Product · Marlow &amp; Voss LLP internal playbook — do not
                  forward outside the firm
                </Text>
              </div>
              {isCompact ? (
                <HStack gap={2} vAlign="center" style={styles.contentToolbar} wrap="wrap">
                  <Selector
                    label="Clause type"
                    isLabelHidden
                    options={CLAUSE_OPTIONS}
                    value={selectedId}
                    onChange={setSelectedId}
                    size="sm"
                    width={260}
                  />
                  <StackItem size="fill" />
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {selectedClause.deviations} deviations · 12 mo
                  </Text>
                </HStack>
              ) : null}
              <div style={styles.contentScroll}>
                <div style={styles.detailColumn}>{detail}</div>
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isPanelHidden ? undefined : (
            <LayoutPanel width={360} padding={0} hasDivider label="Casewright deviation analysis">
              <div style={styles.endScroll}>
                <VStack gap={3}>
                  <HStack gap={2} vAlign="center">
                    <Icon icon={FileDiffIcon} size="sm" color="secondary" />
                    <Text type="label">Live draft vs. playbook</Text>
                  </HStack>
                  {analysisAndActivity}
                </VStack>
              </div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};