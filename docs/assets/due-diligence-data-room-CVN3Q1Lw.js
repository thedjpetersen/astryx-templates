var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Casewright data-room review of
 *   the Kestrel Labs Series C diligence set (matter M-2417, Marlow & Voss
 *   LLP): five index folders whose tallies sum exactly to 340 documents /
 *   218 reviewed, 35 representative document rows, five open Casewright
 *   findings (2 high, 3 medium) with fictional source citations, and a
 *   7-section report ledger (4 drafted). Fixed July 2026 strings; no
 *   clocks, no randomness, no network media.
 * @output Due Diligence Data Room Review — the WIDE Casewright surface
 *   Marlow & Voss uses to work the Kestrel Labs Series C data room ahead
 *   of the Jul 20 disclosure-schedule deadline: matter header with
 *   privilege strip, 218-of-340 review meter and 3-reviewer facepile;
 *   folder-tree rail (Corporate, IP, Contracts, Employment, Litigation)
 *   with per-folder progress rings and a pinned coverage strip; document
 *   table (type glyph + DR number, type Token, reviewer Avatar, status
 *   Token, AI-summary chip, issue tags); and a findings panel grouping
 *   Casewright issues by severity — each citing source docs via jump
 *   chips with verification states and honest confidence bands; the
 *   expanded change-of-control finding quotes Skylark Cloud MSA § 14.3
 *   in serif with an add-to-report affordance — above a report progress
 *   card (4 of 7 sections drafted).
 * @position Page template; emitted by \`astryx template due-diligence-data-room\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (matter row + privilege strip) | rail 260 (folder TreeList with
 *   progress rings + pinned coverage strip) | content (folder toolbar,
 *   doc Table scrolling both axes) | end panel 380 (Casewright findings
 *   groups + diligence-report card, scrolls).
 * Container policy: app-shell archetype — frame rows and panels only,
 *   EXCEPT the findings rail and the report ledger, which are genuine
 *   inspector/summary widgets and therefore design-system Cards (per the
 *   suite brief: AI issue cards in a review rail qualify).
 * Color policy: token-pure chrome; ONE accent (var(--color-accent)) for
 *   progress rings and the active-row inset. Severity uses explicit
 *   light-dark pairs — red light-dark(#DC2626, #F87171), amber
 *   light-dark(#B45309, #FBBF24); the AI sparkle rides the categorical
 *   purple token with its repo-standard fallback. Quoted contract
 *   passages (document voice) use the explicit serif stack per the suite
 *   rule; all chrome stays on default token typography. No scheme-locked
 *   surfaces on this page.
 *
 * Responsive contract:
 * - > 1240px: full three-region frame.
 * - <= 1240px: the findings panel is dropped (the table's issue tags stay
 *   the source of truth); the header panel toggle hides with it.
 * - <= 900px: the folder rail is dropped and a folder Selector appears in
 *   the content toolbar; the table drops the Type and AI-summary columns
 *   so name/reviewer/status/issues never crush. Header rows wrap instead
 *   of clipping.
 * - Rail tree, doc table, and findings panel each scroll independently
 *   (minHeight: 0 down every flex chain); toolbars, the privilege strip,
 *   and the rail coverage strip are pinned.
 *
 * Legal-AI trust patterns: shared disclosure line on every AI artifact;
 * source-citation chips on every finding; explicit human verification
 * (actor + date); confidence bands, never percentages; persistent
 * privilege strip; confirm-gated finding dismissal.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  CheckIcon, ChevronDownIcon, ChevronUpIcon, ClipboardListIcon, FileIcon,
  FileSignatureIcon, FileSpreadsheetIcon, FileTextIcon, GavelIcon,
  LandmarkIcon, LightbulbIcon, LockIcon, PanelRightIcon, PlusIcon, ScaleIcon,
  ScrollTextIcon, SearchIcon, SparklesIcon, TriangleAlertIcon, UsersIcon,
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
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {
  AvatarGroup,
  AvatarGroupOverflow,
} from '@astryxdesign/core/AvatarGroup';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const SEVERITY_RED = 'light-dark(#DC2626, #F87171)';
const SEVERITY_AMBER = 'light-dark(#B45309, #FBBF24)';
const VERIFIED_GREEN = 'light-dark(#0B991F, #34C759)';
const AI_PURPLE =
  'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const SERIF_STACK = "Georgia, 'Times New Roman', Times, serif";

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  headerStack: {width: '100%'},
  headerMeter: {width: 180},
  // Privilege strip — persistent, pinned inside the header block.
  privilegeStrip: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    padding: '3px 10px', borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Rail --------------------------------------------------------------------
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-2)'},
  coverageStrip: {flexShrink: 0, padding: 'var(--spacing-3)'},
  coverageRow: {display: 'flex', alignItems: 'center', gap: 6},
  coverageDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  ringWrap: {display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0},
  ringCount: {
    fontVariantNumeric: 'tabular-nums', fontSize: 11,
    color: 'var(--color-text-secondary)', whiteSpace: 'nowrap',
  },
  // Content -----------------------------------------------------------------
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentToolbar: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-4)'},
  tableScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-3)',
  },
  tableEmpty: {padding: 'var(--spacing-6) var(--spacing-4)'},
  kindGlyph: {display: 'inline-flex', flexShrink: 0},
  docIdText: {fontVariantNumeric: 'tabular-nums'},
  tagRow: {display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center'},
  // AI summary chip — the one shared sparkle treatment (suite pattern).
  aiChip: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '1px 8px', borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: AI_PURPLE, fontSize: 11, whiteSpace: 'nowrap',
  },
  // Findings panel ----------------------------------------------------------
  findingsHeader: {flexShrink: 0, padding: 'var(--spacing-3)'},
  findingsScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    paddingTop: 0,
  },
  severityLabelRow: {display: 'flex', alignItems: 'center', gap: 6},
  severityDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  findingTitleButton: {
    display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-2)',
    width: '100%', padding: 0, border: 'none', background: 'none',
    color: 'inherit', font: 'inherit', textAlign: 'start', cursor: 'pointer',
  },
  // Source-citation chip — compact, jumps to the cited table row.
  sourceChip: {
    display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: '100%',
    padding: '1px 8px', borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'none', color: 'var(--color-text-secondary)',
    fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
  },
  sourceChipStatic: {cursor: 'default'},
  sourceChipLabel: {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'},
  // Quoted contract passage — document voice: serif per the suite rule.
  quoteBlock: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    fontFamily: SERIF_STACK, fontSize: 13, lineHeight: 1.55,
  },
  verifyRow: {display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap'},
  disclosureRow: {
    display: 'flex', alignItems: 'center', gap: 4,
    color: 'var(--color-text-secondary)', fontSize: 11,
  },
  reportSectionRow: {minWidth: 0},
  visuallyHidden: {
    position: 'absolute', width: 1, height: 1, margin: -1, overflow: 'hidden',
    clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
  },
};

// ---------------------------------------------------------------------------
// DATA — one shared fictional world: Casewright at Marlow & Voss LLP,
// matter M-2417 "Kestrel Labs — Series C Financing" (lead: Eleanor Marlow;
// day-to-day: Priya Khanna, the signed-in reviewer). Meridian Growth
// Partners' diligence request list drives the index. Suite "now": Wed
// Jul 15, 2026; disclosure schedules due Mon Jul 20; first close Fri
// Jul 31. Folder tallies sum EXACTLY: 340 docs, 218 reviewed, 6 flagged,
// 71 in review, 45 unopened. Findings: 5 open (2 high, 3 medium).
// ---------------------------------------------------------------------------

const CURRENT_REVIEWER = 'Priya Khanna';

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard \`light-dark()\` fallback pair.
const KIND_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: AI_PURPLE,
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  neutral: 'var(--color-text-secondary)',
} as const;

type FolderId = 'corporate' | 'ip' | 'contracts' | 'employment' | 'litigation';

interface FolderMeta {
  id: FolderId;
  index: number;
  label: string;
  icon: typeof LandmarkIcon;
  total: number;
  reviewed: number;
  flagged: number;
  inReview: number;
  unopened: number;
  /** Reviewer who owns the folder assignment. */
  reviewer: string;
}

// Per-folder tallies reconcile to the header meter: reviewed 81+30+52+38+17
// = 218; totals 96+54+88+62+40 = 340; flagged 1+1+2+2+0 = 6.
const FOLDERS: Record<FolderId, FolderMeta> = {
  corporate: {id: 'corporate', index: 1, label: 'Corporate', icon: LandmarkIcon, total: 96, reviewed: 81, flagged: 1, inReview: 9, unopened: 5, reviewer: 'Priya Khanna'},
  ip: {id: 'ip', index: 2, label: 'Intellectual Property', icon: LightbulbIcon, total: 54, reviewed: 30, flagged: 1, inReview: 14, unopened: 9, reviewer: 'David Chen'},
  contracts: {id: 'contracts', index: 3, label: 'Material Contracts', icon: FileSignatureIcon, total: 88, reviewed: 52, flagged: 2, inReview: 21, unopened: 13, reviewer: 'David Chen'},
  employment: {id: 'employment', index: 4, label: 'Employment', icon: UsersIcon, total: 62, reviewed: 38, flagged: 2, inReview: 15, unopened: 7, reviewer: 'Amara Osei'},
  litigation: {id: 'litigation', index: 5, label: 'Litigation', icon: GavelIcon, total: 40, reviewed: 17, flagged: 0, inReview: 12, unopened: 11, reviewer: 'Priya Khanna'},
};

const FOLDER_IDS: FolderId[] = ['corporate', 'ip', 'contracts', 'employment', 'litigation'];

const REVIEW_TOTALS = {reviewed: 218, total: 340, flagged: 6, inReview: 71, unopened: 45};

/** The three document reviewers (header facepile). Ruth Vega appears only
 * as the finding verifier — she is not staffed on doc review. */
const REVIEWERS = ['Priya Khanna', 'David Chen', 'Amara Osei'];

type DocStatus = 'reviewed' | 'flagged' | 'in-review' | 'unopened';

const STATUS_META: Record<DocStatus, {label: string; token: 'green' | 'red' | 'blue' | 'gray'}> = {
  reviewed: {label: 'Reviewed', token: 'green'},
  flagged: {label: 'Flagged', token: 'red'},
  'in-review': {label: 'In review', token: 'blue'},
  unopened: {label: 'Unopened', token: 'gray'},
};

type DocType =
  | 'charter'
  | 'minutes'
  | 'ledger'
  | 'agreement'
  | 'sow'
  | 'letter'
  | 'policy'
  | 'index'
  | 'schedule'
  | 'memo';

const DOC_TYPE_META: Record<DocType, {label: string; icon: typeof FileTextIcon; color: string}> = {
  charter: {label: 'Charter', icon: ScrollTextIcon, color: KIND_COLOR.purple},
  minutes: {label: 'Minutes', icon: FileTextIcon, color: KIND_COLOR.blue},
  ledger: {label: 'Ledger', icon: FileSpreadsheetIcon, color: KIND_COLOR.green},
  agreement: {label: 'Agreement', icon: FileSignatureIcon, color: KIND_COLOR.teal},
  sow: {label: 'SOW', icon: FileSignatureIcon, color: KIND_COLOR.teal},
  letter: {label: 'Letter', icon: FileTextIcon, color: KIND_COLOR.orange},
  policy: {label: 'Policy', icon: FileTextIcon, color: KIND_COLOR.blue},
  index: {label: 'Index', icon: FileSpreadsheetIcon, color: KIND_COLOR.neutral},
  schedule: {label: 'Schedule', icon: FileSpreadsheetIcon, color: KIND_COLOR.green},
  memo: {label: 'Memo', icon: FileIcon, color: KIND_COLOR.neutral},
};

interface IssueTag {
  label: string;
  tone: 'red' | 'amber';
}

// The Table generic requires rows assignable to Record<string, unknown>.
interface DocRow extends Record<string, unknown> {
  id: string;
  folder: FolderId;
  /** Diligence-request index number, e.g. "DR-3.01". */
  dr: string;
  name: string;
  docType: DocType;
  pages: number;
  /** null = not yet assigned (unopened queue). */
  reviewer: string | null;
  status: DocStatus;
  /** Casewright produced a doc summary (sparkle chip). */
  hasSummary: boolean;
  tags: IssueTag[];
}

// Compact fixture rows: [id, folder, dr, name, docType, pages, reviewer,
// status, hasSummary, tags?]. A representative slice of each folder — the
// toolbar reports "Showing N of <total>" against the folder tallies above.
type DocSpec = [
  string,
  FolderId,
  string,
  string,
  DocType,
  number,
  string | null,
  DocStatus,
  boolean,
  IssueTag[]?,
];

const DOC_SPECS: DocSpec[] = [
  // ---- 1 · Corporate (Priya Khanna) ----
  ['d-r1', 'corporate', 'DR-1.01', 'Amended & Restated Certificate of Incorporation (Oct 2024)', 'charter', 34, 'Priya Khanna', 'reviewed', true],
  ['d-r2', 'corporate', 'DR-1.02', 'Bylaws — as amended (Mar 2023)', 'charter', 28, 'Priya Khanna', 'reviewed', true],
  ['d-r3', 'corporate', 'DR-1.14', 'Board minutes — Q4 2025', 'minutes', 61, 'Priya Khanna', 'flagged', true, [{label: 'Consent gap', tone: 'amber'}]],
  ['d-r4', 'corporate', 'DR-1.17', 'Stock ledger — as of Jun 30, 2026', 'ledger', 12, 'Priya Khanna', 'reviewed', true],
  ['d-r5', 'corporate', 'DR-1.21', '2022 Equity Incentive Plan + grant ledger', 'ledger', 47, 'Priya Khanna', 'reviewed', true],
  ['d-r6', 'corporate', 'DR-1.23', 'Board consents — 2026 YTD', 'minutes', 39, 'Priya Khanna', 'in-review', true],
  ['d-r7', 'corporate', 'DR-1.28', 'Stockholder agreements — index', 'index', 6, null, 'unopened', false],
  // ---- 2 · Intellectual Property (David Chen) ----
  ['d-i1', 'ip', 'DR-2.01', 'Patent schedule — filings & status (Jun 2026)', 'schedule', 9, 'David Chen', 'reviewed', true],
  ['d-i2', 'ip', 'DR-2.07', 'Kraus Consulting — Master SOW (Feb 2024)', 'sow', 18, 'David Chen', 'flagged', true, [{label: 'Missing IP assignment', tone: 'red'}]],
  ['d-i3', 'ip', 'DR-2.08', 'CIIA index — Engineering', 'index', 11, 'David Chen', 'reviewed', true],
  ['d-i4', 'ip', 'DR-2.12', 'Trademark portfolio — KESTREL & ATLAS marks', 'schedule', 14, 'David Chen', 'reviewed', true],
  ['d-i5', 'ip', 'DR-2.15', 'Open-source usage report — Atlas core', 'memo', 26, 'David Chen', 'in-review', true],
  ['d-i6', 'ip', 'DR-2.18', 'Inbound license — Meshify SDK (2023)', 'agreement', 22, 'David Chen', 'in-review', false],
  ['d-i7', 'ip', 'DR-2.22', 'Domain & registration inventory', 'schedule', 5, null, 'unopened', false],
  // ---- 3 · Material Contracts (David Chen) ----
  ['d-c1', 'contracts', 'DR-3.02', 'Skylark Cloud MSA v4 — execution copy', 'agreement', 52, 'David Chen', 'flagged', true, [{label: 'Change of control', tone: 'red'}]],
  ['d-c2', 'contracts', 'DR-3.04', 'Larchpay Payment Processing Agreement v2', 'agreement', 44, 'David Chen', 'flagged', true, [{label: 'Chargeback shift', tone: 'amber'}]],
  ['d-c3', 'contracts', 'DR-3.09', 'Halcyon Print Co services agreement (2026)', 'agreement', 16, 'David Chen', 'reviewed', true],
  ['d-c4', 'contracts', 'DR-3.11', 'Customer form — Atlas enterprise subscription', 'agreement', 21, 'David Chen', 'reviewed', true],
  ['d-c5', 'contracts', 'DR-3.14', 'Top-20 customer agreements — index', 'index', 8, 'David Chen', 'in-review', true],
  ['d-c6', 'contracts', 'DR-3.17', 'Skylark Cloud order form #SC-2214', 'agreement', 6, 'David Chen', 'reviewed', true],
  ['d-c7', 'contracts', 'DR-3.21', 'Veldt Systems reseller agreement (2025)', 'agreement', 27, 'David Chen', 'in-review', false],
  // ---- 4 · Employment (Amara Osei) ----
  ['d-e1', 'employment', 'DR-4.03', 'Offer letter — A. Devlin (Mar 2025)', 'letter', 7, 'Amara Osei', 'flagged', true, [{label: 'No arbitration exhibit', tone: 'amber'}]],
  ['d-e2', 'employment', 'DR-4.04', 'Offer letter — M. Okoye (Jun 2025)', 'letter', 7, 'Amara Osei', 'flagged', true, [{label: 'No arbitration exhibit', tone: 'amber'}]],
  ['d-e3', 'employment', 'DR-4.07', 'Employee handbook v6 (Jan 2026)', 'policy', 58, 'Amara Osei', 'reviewed', true],
  ['d-e4', 'employment', 'DR-4.09', 'CIIA form — standard (2024 revision)', 'policy', 9, 'Amara Osei', 'reviewed', true],
  ['d-e5', 'employment', 'DR-4.12', 'Severance plan — executive (2025)', 'policy', 13, 'Amara Osei', 'in-review', true],
  ['d-e6', 'employment', 'DR-4.15', 'Contractor roster — 2024–2026', 'schedule', 4, 'Amara Osei', 'reviewed', true],
  ['d-e7', 'employment', 'DR-4.19', 'Option grant notices — 2025 batch', 'index', 31, null, 'unopened', false],
  // ---- 5 · Litigation (Priya Khanna) ----
  ['d-l1', 'litigation', 'DR-5.01', 'Demand letter — Corvid Metrics LLC (May 2026)', 'letter', 5, 'Priya Khanna', 'in-review', true],
  ['d-l2', 'litigation', 'DR-5.03', 'Settlement agreement — Brightline Staffing (2024)', 'agreement', 12, 'Priya Khanna', 'reviewed', true],
  ['d-l3', 'litigation', 'DR-5.05', 'Docket search results — Del. & N.D. Cal. (Jun 2026)', 'memo', 3, 'Priya Khanna', 'reviewed', true],
  ['d-l4', 'litigation', 'DR-5.08', 'D&O insurance policy (2026)', 'policy', 41, 'Priya Khanna', 'reviewed', true],
  ['d-l5', 'litigation', 'DR-5.10', 'Threatened claims summary — management memo', 'memo', 6, 'Priya Khanna', 'in-review', false],
  ['d-l6', 'litigation', 'DR-5.12', 'Litigation questionnaire — management responses', 'memo', 15, 'Priya Khanna', 'in-review', false],
  ['d-l7', 'litigation', 'DR-5.14', 'Regulatory correspondence — index', 'index', 4, null, 'unopened', false],
];

const DOCS: DocRow[] = DOC_SPECS.map(
  ([id, folder, dr, name, docType, pages, reviewer, status, hasSummary, tags]) => ({
    id,
    folder,
    dr,
    name,
    docType,
    pages,
    reviewer,
    status,
    hasSummary,
    tags: tags ?? [],
  }),
);

// ---------------------------------------------------------------------------
// FINDINGS — five open Casewright findings (2 high, 3 medium). Every
// assertion cites source documents; verification is a human action with an
// actor and a date; confidence renders as bands only. The Skylark
// change-of-control finding cross-references the M-2431 contract review
// (its liability-cap sibling), and the Larchpay chargeback shift mirrors
// the v2→v3 redline change — numbers and clause pins agree across the
// suite.
// ---------------------------------------------------------------------------

type Severity = 'high' | 'medium';

const SEVERITY_META: Record<Severity, {label: string; color: string; token: 'red' | 'orange'}> = {
  high: {label: 'High', color: SEVERITY_RED, token: 'red'},
  medium: {label: 'Medium', color: SEVERITY_AMBER, token: 'orange'},
};

interface SourceCite {
  label: string;
  /** Present when the cited document is a visible table row — the chip
   * jumps folder + selection to it. */
  docId?: string;
}

type Verification =
  | {state: 'verified'; by: string; on: string}
  | {state: 'unverified'};

interface Finding {
  id: string;
  severity: Severity;
  title: string;
  summary: string;
  sources: SourceCite[];
  confidence: 'High' | 'Medium' | 'Low';
  verification: Verification;
  /** Report section the add-to-report affordance files into. */
  reportSection: string;
  quote?: {text: string; cite: string};
  note?: string;
}

const FINDINGS: Finding[] = [
  {
    id: 'F-101',
    severity: 'high',
    title: 'Change-of-control consent required under Skylark Cloud MSA',
    summary:
      'The Skylark Cloud MSA deems any change of control of Kestrel an assignment requiring Skylark’s prior written consent. The § 1.12 definition is broad enough to reach a preferred-stock financing round.',
    sources: [
      {label: 'Skylark Cloud MSA v4 · § 14.3 · p. 38', docId: 'd-c1'},
      {label: 'Series C SPA v3 · § 3.9 (Consents) · p. 41'},
    ],
    confidence: 'High',
    verification: {state: 'verified', by: 'R. Vega', on: 'Jul 15'},
    reportSection: 'Material Contracts',
    quote: {
      text:
        '“Neither party may assign this Agreement, in whole or in part, without the prior written consent of the other party. Any merger, acquisition, or other Change of Control of Customer shall be deemed an assignment for purposes of this Section 14.3.”',
      cite: 'Skylark Cloud MSA v4 · § 14.3 (Assignment; Change of Control) · p. 38',
    },
    note:
      'The Series C preferred issuance may fall within the § 1.12 “Change of Control” definition — obtain Skylark consent or qualify the definition before first close (target Fri Jul 31). Cross-referenced from the M-2431 Casewright review, Jul 14.',
  },
  {
    id: 'F-102',
    severity: 'high',
    title: 'No IP assignment on file for contractor Halden Kraus',
    summary:
      'No signed IP assignment located for contract firmware engineer Halden Kraus (Feb–Sep 2024 engagement). Kraus SOW § 6 leaves work-product ownership with the consultant until assignment; the Engineering CIIA index shows no countersigned agreement.',
    sources: [
      {label: 'Kraus Consulting — Master SOW · § 6 (Ownership)', docId: 'd-i2'},
      {label: 'CIIA index — Engineering', docId: 'd-i3'},
    ],
    confidence: 'Medium',
    verification: {state: 'unverified'},
    reportSection: 'Intellectual Property',
  },
  {
    id: 'F-201',
    severity: 'medium',
    title: 'Chargeback liability shift in Larchpay agreement',
    summary:
      'Larchpay Processing Agreement v2 § 11.4 shifts chargeback liability to Kestrel above $50,000 per quarter — non-standard against the firm playbook. A v3 turn is in negotiation under M-2431 (execution target Mon Jul 20).',
    sources: [{label: 'Larchpay Processing Agreement v2 · § 11.4', docId: 'd-c2'}],
    confidence: 'High',
    verification: {state: 'verified', by: 'R. Vega', on: 'Jul 14'},
    reportSection: 'Material Contracts',
  },
  {
    id: 'F-202',
    severity: 'medium',
    title: 'Arbitration exhibit missing from two 2025 offer letters',
    summary:
      'The A. Devlin and M. Okoye offer letters reference an arbitration exhibit (“Exhibit B”) that is not attached in the data-room copies. Signed originals may include it — request complete copies from Kestrel HR.',
    sources: [
      {label: 'Offer letter — A. Devlin (Mar 2025)', docId: 'd-e1'},
      {label: 'Offer letter — M. Okoye (Jun 2025)', docId: 'd-e2'},
    ],
    confidence: 'Medium',
    verification: {state: 'unverified'},
    reportSection: 'Employment',
  },
  {
    id: 'F-203',
    severity: 'medium',
    title: 'Board approval for Oct 2025 option grants not located',
    summary:
      'Board approval for the October 2025 option-grant batch was not located in the Q4 2025 minutes or consents. The grants may have been approved at the Nov 5 meeting — those minutes are still marked in review.',
    sources: [
      {label: 'Board minutes — Q4 2025', docId: 'd-r3'},
      {label: '2022 Equity Incentive Plan · grant ledger', docId: 'd-r5'},
    ],
    confidence: 'Low',
    verification: {state: 'unverified'},
    reportSection: 'Corporate & Capitalization',
  },
];

// ---------------------------------------------------------------------------
// DILIGENCE REPORT — 7 sections, 4 drafted. The in-progress sections are
// the ones with open findings above; Real Property waits on the M-2402
// lease-amendment file.
// ---------------------------------------------------------------------------

type SectionState = 'drafted' | 'in-progress' | 'not-started';

const SECTION_META: Record<SectionState, {label: string; token: 'green' | 'blue' | 'gray'}> = {
  drafted: {label: 'Drafted', token: 'green'},
  'in-progress': {label: 'In progress', token: 'blue'},
  'not-started': {label: 'Not started', token: 'gray'},
};

const REPORT_SECTIONS: {name: string; state: SectionState}[] = [
  {name: 'Corporate & Capitalization', state: 'drafted'},
  {name: 'Material Contracts', state: 'in-progress'},
  {name: 'Intellectual Property', state: 'in-progress'},
  {name: 'Employment', state: 'drafted'},
  {name: 'Litigation', state: 'drafted'},
  {name: 'Data Privacy & Security', state: 'drafted'},
  {name: 'Real Property & Facilities', state: 'not-started'},
];

const SECTIONS_DRAFTED = 4;

// ---------------------------------------------------------------------------
// SHARED PIECES — progress ring, AI disclosure line, issue tag.
// ---------------------------------------------------------------------------

/** 18px SVG review-progress ring; fraction is reviewed/total. */
function ProgressRing({fraction, label}: {fraction: number; label: string}) {
  const radius = 7;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.round(circumference * fraction * 100) / 100;
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      role="img"
      aria-label={label}
      style={{flexShrink: 0}}>
      <circle cx={9} cy={9} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={2.5} />
      <circle
        cx={9} cy={9} r={radius} fill="none"
        stroke="var(--color-accent)" strokeWidth={2.5} strokeLinecap="round"
        strokeDasharray={\`\${dash} \${circumference}\`}
        transform="rotate(-90 9 9)"
      />
    </svg>
  );
}

/** The suite-wide AI disclosure line — one shared treatment everywhere. */
function DisclosureLine() {
  return (
    <span style={styles.disclosureRow}>
      <span style={{display: 'inline-flex', color: AI_PURPLE}}>
        <Icon icon={SparklesIcon} size="xsm" color="inherit" />
      </span>
      AI-generated · verify before relying
    </span>
  );
}

function IssueTagToken({tag}: {tag: IssueTag}) {
  return (
    <Token size="sm" color={tag.tone === 'red' ? 'red' : 'orange'} label={tag.label} />
  );
}

// ---------------------------------------------------------------------------
// RAIL — data-room index tree with per-folder progress rings, plus the
// pinned coverage strip whose four counts sum to 340.
// ---------------------------------------------------------------------------

function FolderRail({
  folder,
  onFolderChange,
}: {
  folder: FolderId;
  onFolderChange: (folder: FolderId) => void;
}) {
  const items: TreeListItemData[] = FOLDER_IDS.map(folderId => {
    const meta = FOLDERS[folderId];
    return {
      id: folderId,
      label: \`\${meta.index} · \${meta.label}\`,
      startContent: <Icon icon={meta.icon} size="sm" color="secondary" />,
      endContent: (
        <span style={styles.ringWrap}>
          <ProgressRing
            fraction={meta.reviewed / meta.total}
            label={\`\${meta.reviewed} of \${meta.total} reviewed\`}
          />
          <span style={styles.ringCount}>
            {meta.reviewed}/{meta.total}
          </span>
        </span>
      ),
      isSelected: folder === folderId,
      onClick: () => onFolderChange(folderId),
    };
  });

  const coverage: {label: string; count: number; color: string}[] = [
    {label: 'Reviewed', count: REVIEW_TOTALS.reviewed, color: VERIFIED_GREEN},
    {label: 'In review', count: REVIEW_TOTALS.inReview, color: KIND_COLOR.blue},
    {label: 'Flagged', count: REVIEW_TOTALS.flagged, color: SEVERITY_RED},
    {label: 'Unopened', count: REVIEW_TOTALS.unopened, color: KIND_COLOR.neutral},
  ];

  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <TreeList
          density="compact"
          items={items}
          header={
            <Text type="label" size="sm" color="secondary">
              Data room index
            </Text>
          }
        />
      </div>
      <Divider />
      {/* Coverage strip — pinned; 218 + 71 + 6 + 45 = 340. */}
      <VStack gap={2} style={styles.coverageStrip}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" size="sm">
              Review coverage
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {Math.round((REVIEW_TOTALS.reviewed / REVIEW_TOTALS.total) * 100)}%
          </Text>
        </HStack>
        <ProgressBar
          label="Documents reviewed"
          isLabelHidden
          value={REVIEW_TOTALS.reviewed}
          max={REVIEW_TOTALS.total}
          variant="neutral"
          style={{minWidth: 0}}
        />
        <VStack gap={1}>
          {coverage.map(row => (
            <div key={row.label} style={styles.coverageRow}>
              <span style={{...styles.coverageDot, backgroundColor: row.color}} />
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  {row.label}
                </Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {row.count}
              </Text>
            </div>
          ))}
        </VStack>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DOCUMENT TABLE — cells and columns. Fixed-width columns use pixel() so
// the header carries both width and minWidth (Table cells have
// max-width: 0).
// ---------------------------------------------------------------------------

function DocNameCell({doc}: {doc: DocRow}) {
  const meta = DOC_TYPE_META[doc.docType];
  return (
    <HStack gap={2} vAlign="center">
      <span style={{...styles.kindGlyph, color: meta.color}}>
        <Icon icon={meta.icon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {doc.name}
          </Text>
          <Text
            type="supporting"
            color="secondary"
            maxLines={1}
            style={styles.docIdText}>
            {doc.dr} · {doc.pages} pp
          </Text>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function ReviewerCell({doc}: {doc: DocRow}) {
  if (doc.reviewer === null) {
    return (
      <Text type="supporting" color="secondary">
        Unassigned
      </Text>
    );
  }
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={doc.reviewer} size="xsmall" />
      <Text type="body" maxLines={1}>
        {doc.reviewer === CURRENT_REVIEWER ? 'You' : doc.reviewer}
      </Text>
    </HStack>
  );
}

function AiSummaryCell({doc}: {doc: DocRow}) {
  if (!doc.hasSummary) {
    return (
      <Text type="supporting" color="secondary">
        —
      </Text>
    );
  }
  return (
    <span style={styles.aiChip} aria-label="Casewright summary available">
      <Icon icon={SparklesIcon} size="xsm" color="inherit" />
      Summary
    </span>
  );
}

function IssuesCell({doc}: {doc: DocRow}) {
  if (doc.tags.length === 0) {
    return (
      <Text type="supporting" color="secondary">
        None
      </Text>
    );
  }
  return (
    <div style={styles.tagRow}>
      {doc.tags.map(tag => (
        <IssueTagToken key={tag.label} tag={tag} />
      ))}
    </div>
  );
}

function buildColumns(isCompact: boolean): TableColumn<DocRow>[] {
  const columns: TableColumn<DocRow>[] = [
    {
      key: 'name',
      header: 'Document',
      width: proportional(3, {minWidth: 250}),
      renderCell: (doc: DocRow) => <DocNameCell doc={doc} />,
    },
  ];
  if (!isCompact) {
    columns.push({
      key: 'type',
      header: 'Type',
      width: pixel(104),
      renderCell: (doc: DocRow) => (
        <Token size="sm" color="gray" label={DOC_TYPE_META[doc.docType].label} />
      ),
    });
  }
  columns.push(
    {
      key: 'reviewer',
      header: 'Reviewer',
      // 150px floor: xsmall Avatar + the longest reviewer name
      // ("Priya Khanna") render without ellipsis.
      width: pixel(150),
      renderCell: (doc: DocRow) => <ReviewerCell doc={doc} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(108),
      renderCell: (doc: DocRow) => (
        <Token
          size="sm"
          color={STATUS_META[doc.status].token}
          label={STATUS_META[doc.status].label}
        />
      ),
    },
  );
  if (!isCompact) {
    columns.push({
      key: 'ai',
      header: 'AI summary',
      width: pixel(118),
      renderCell: (doc: DocRow) => <AiSummaryCell doc={doc} />,
    });
  }
  columns.push({
    key: 'issues',
    header: 'Issues',
    width: proportional(2, {minWidth: 170}),
    renderCell: (doc: DocRow) => <IssuesCell doc={doc} />,
  });
  return columns;
}

// ---------------------------------------------------------------------------
// FINDINGS PANEL — Casewright issue Cards grouped by severity. Every card:
// severity Token, plain-language summary, source-citation chips, honest
// confidence band, explicit verification state, and the shared disclosure
// line. The expanded card adds the quoted passage (serif document voice)
// and the add-to-report affordance.
// ---------------------------------------------------------------------------

function VerificationRow({
  verification,
  onVerify,
}: {
  verification: Verification;
  onVerify: () => void;
}) {
  if (verification.state === 'verified') {
    return (
      <div style={styles.verifyRow}>
        <span style={{display: 'inline-flex', color: VERIFIED_GREEN, flexShrink: 0}}>
          <Icon icon={CheckIcon} size="xsm" color="inherit" />
        </span>
        <Text type="supporting" color="secondary">
          Verified · {verification.by} · {verification.on}
        </Text>
      </div>
    );
  }
  return (
    <div style={styles.verifyRow}>
      <span style={{display: 'inline-flex', color: SEVERITY_AMBER, flexShrink: 0}}>
        <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
      </span>
      <StackItem size="fill">
        <Text type="supporting" color="secondary">
          Not yet checked against source
        </Text>
      </StackItem>
      <Button label="Verify" variant="ghost" size="sm" onClick={onVerify} />
    </div>
  );
}

function SourceChips({
  sources,
  onJump,
}: {
  sources: SourceCite[];
  onJump: (docId: string) => void;
}) {
  return (
    <div style={styles.tagRow}>
      {sources.map(source => {
        const inner = (
          <>
            <Icon icon={FileTextIcon} size="xsm" color="inherit" />
            <span style={styles.sourceChipLabel}>{source.label}</span>
          </>
        );
        // Sources without a docId live outside the data room (matter
        // workspace artifacts) — the chip still names them, without a jump.
        return source.docId !== undefined ? (
          <button
            key={source.label}
            type="button"
            style={styles.sourceChip}
            title={\`Open \${source.label} in the document table\`}
            onClick={() => onJump(source.docId as string)}>
            {inner}
          </button>
        ) : (
          <span
            key={source.label}
            style={{...styles.sourceChip, ...styles.sourceChipStatic}}
            title={source.label}>
            {inner}
          </span>
        );
      })}
    </div>
  );
}

function FindingCard({
  finding,
  verification,
  isExpanded,
  isAdded,
  onToggle,
  onAdd,
  onVerify,
  onDismissRequest,
  onJump,
}: {
  finding: Finding;
  verification: Verification;
  isExpanded: boolean;
  isAdded: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onVerify: () => void;
  onDismissRequest: () => void;
  onJump: (docId: string) => void;
}) {
  const severity = SEVERITY_META[finding.severity];
  return (
    <Card padding={3}>
      <VStack gap={2}>
        <button
          type="button"
          style={styles.findingTitleButton}
          aria-expanded={isExpanded}
          onClick={onToggle}>
          {/* Footgun 18: the severity Token shares a flex row with a
              wrapping title — it must never shrink. */}
          <span style={{flexShrink: 0, display: 'inline-flex'}}>
            <Token size="sm" color={severity.token} label={severity.label} />
          </span>
          <StackItem size="fill" style={{minWidth: 0}}>
            <Text type="label">{finding.title}</Text>
          </StackItem>
          <span style={{flexShrink: 0, display: 'inline-flex'}}>
            <Icon icon={isExpanded ? ChevronUpIcon : ChevronDownIcon} size="sm" color="secondary" />
          </span>
        </button>

        <Text type="supporting" color="secondary" maxLines={isExpanded ? undefined : 2}>
          {finding.summary}
        </Text>

        {isExpanded && finding.quote !== undefined ? (
          <VStack gap={1}>
            <div
              style={{
                ...styles.quoteBlock,
                borderInlineStart: \`3px solid \${severity.color}\`,
              }}>
              {finding.quote.text}
            </div>
            <Text type="supporting" color="secondary" style={styles.docIdText}>
              {finding.quote.cite}
            </Text>
          </VStack>
        ) : null}

        {isExpanded && finding.note !== undefined ? (
          <Text type="supporting" color="secondary">
            {finding.note}
          </Text>
        ) : null}

        <SourceChips sources={finding.sources} onJump={onJump} />

        <HStack gap={2} vAlign="center" wrap="wrap">
          <Token size="sm" color="gray" label={\`\${finding.confidence} confidence\`} />
          <StackItem size="fill" style={{minWidth: 0}}>
            <VerificationRow verification={verification} onVerify={onVerify} />
          </StackItem>
        </HStack>

        {isExpanded ? (
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Button
              label={
                isAdded
                  ? \`Added · \${finding.reportSection}\`
                  : 'Add to report'
              }
              variant={isAdded ? 'ghost' : 'secondary'}
              size="sm"
              isDisabled={isAdded}
              icon={<Icon icon={isAdded ? CheckIcon : PlusIcon} size="sm" />}
              onClick={onAdd}
            />
            <Button
              label="Dismiss"
              variant="ghost"
              size="sm"
              icon={<Icon icon={XIcon} size="sm" />}
              onClick={onDismissRequest}
            />
          </HStack>
        ) : null}

        <DisclosureLine />
      </VStack>
    </Card>
  );
}

function ReportProgressCard() {
  return (
    <Card padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ClipboardListIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label">Diligence report</Text>
          </StackItem>
          <Token size="sm" color="gray" label="Draft" />
        </HStack>
        <Text type="supporting" color="secondary">
          Kestrel Labs — Series C · findings drafted by section
        </Text>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <ProgressBar
              label="Report sections drafted"
              isLabelHidden
              value={SECTIONS_DRAFTED}
              max={REPORT_SECTIONS.length}
              variant="neutral"
              style={{minWidth: 0}}
            />
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {SECTIONS_DRAFTED} of {REPORT_SECTIONS.length}
          </Text>
        </HStack>
        <VStack gap={1}>
          {REPORT_SECTIONS.map(section => (
            <HStack
              key={section.name}
              gap={2}
              vAlign="center"
              style={styles.reportSectionRow}>
              <StackItem size="fill" style={{minWidth: 0}}>
                <Text type="supporting" maxLines={1}>
                  {section.name}
                </Text>
              </StackItem>
              {/* Footgun 18: status Token beside truncatable prose. */}
              <span style={{flexShrink: 0, display: 'inline-flex'}}>
                <Token
                  size="sm"
                  color={SECTION_META[section.state].token}
                  label={SECTION_META[section.state].label}
                />
              </span>
            </HStack>
          ))}
        </VStack>
        <Button label="Open report draft" variant="secondary" size="sm" />
      </VStack>
    </Card>
  );
}

function FindingsPanel({
  findings,
  verifications,
  addedIds,
  expandedId,
  onToggle,
  onAdd,
  onVerify,
  onDismissRequest,
  onJump,
}: {
  findings: Finding[];
  verifications: Record<string, Verification>;
  addedIds: Set<string>;
  expandedId: string | null;
  onToggle: (id: string) => void;
  onAdd: (id: string) => void;
  onVerify: (id: string) => void;
  onDismissRequest: (id: string) => void;
  onJump: (docId: string) => void;
}) {
  const highs = findings.filter(finding => finding.severity === 'high');
  const mediums = findings.filter(finding => finding.severity === 'medium');
  const groups: {severity: Severity; rows: Finding[]}[] = [
    {severity: 'high', rows: highs},
    {severity: 'medium', rows: mediums},
  ];
  return (
    <div style={styles.panelFill}>
      <VStack gap={1} style={styles.findingsHeader}>
        <HStack gap={2} vAlign="center">
          <span style={{display: 'inline-flex', color: AI_PURPLE}}>
            <Icon icon={SparklesIcon} size="sm" color="inherit" />
          </span>
          <StackItem size="fill">
            <Heading level={2}>Casewright findings</Heading>
          </StackItem>
        </HStack>
        {/* Counts keep their own row (whole-unit wrap) so "3 medium" never
            breaks mid-phrase beside the heading in the 380px panel. */}
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <DisclosureLine />
          </StackItem>
          <Text
            type="supporting"
            color="secondary"
            hasTabularNumbers
            style={{whiteSpace: 'nowrap'}}>
            {findings.length} open · {highs.length} high · {mediums.length}{' '}
            medium
          </Text>
        </HStack>
      </VStack>
      <div style={styles.findingsScroll}>
        <VStack gap={3}>
          {groups.map(group =>
            group.rows.length === 0 ? null : (
              <VStack key={group.severity} gap={2}>
                <div style={styles.severityLabelRow}>
                  <span
                    style={{
                      ...styles.severityDot,
                      backgroundColor: SEVERITY_META[group.severity].color,
                    }}
                  />
                  <Text type="label" size="sm" color="secondary">
                    {SEVERITY_META[group.severity].label} severity (
                    {group.rows.length})
                  </Text>
                </div>
                {group.rows.map(finding => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    verification={
                      verifications[finding.id] ?? finding.verification
                    }
                    isExpanded={expandedId === finding.id}
                    isAdded={addedIds.has(finding.id)}
                    onToggle={() => onToggle(finding.id)}
                    onAdd={() => onAdd(finding.id)}
                    onVerify={() => onVerify(finding.id)}
                    onDismissRequest={() => onDismissRequest(finding.id)}
                    onJump={onJump}
                  />
                ))}
              </VStack>
            ),
          )}
          <Divider />
          <ReportProgressCard />
        </VStack>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const FOLDER_OPTIONS = FOLDER_IDS.map(folderId => ({
  value: folderId,
  label: \`\${FOLDERS[folderId].index} · \${FOLDERS[folderId].label}\`,
}));

export default function DueDiligenceDataRoomTemplate() {
  const [folder, setFolder] = useState<FolderId>('contracts');
  const [query, setQuery] = useState('');
  const [activeDocId, setActiveDocId] = useState<string | null>('d-c1');
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>('F-101');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [verifications, setVerifications] = useState<Record<string, Verification>>({});
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [dismissTargetId, setDismissTargetId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1240px drops the findings panel; <=900px drops
  // the rail (folder Selector appears) and the Type/AI-summary columns.
  const isPanelHidden = useMediaQuery('(max-width: 1240px)');
  const isCompact = useMediaQuery('(max-width: 900px)');

  const folderMeta = FOLDERS[folder];

  // Folder + search filter, derived during render.
  const visibleDocs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return DOCS.filter(doc => {
      if (doc.folder !== folder) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return \`\${doc.name} \${doc.dr} \${doc.reviewer ?? ''}\`
        .toLowerCase()
        .includes(needle);
    });
  }, [folder, query]);

  const openFindings = useMemo(
    () => FINDINGS.filter(finding => !dismissedIds.has(finding.id)),
    [dismissedIds],
  );

  // Row-click plugin: clicking a row makes it the active document, with an
  // inset accent outline so the selection never bleeds onto neighbors.
  const activePlugin = useMemo<TablePlugin<DocRow>>(
    () => ({
      transformBodyRow: (props, item) => {
        const prevOnClick = props.htmlProps.onClick;
        const isActive = item.id === activeDocId;
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            onClick: event => {
              prevOnClick?.(event);
              setActiveDocId(item.id);
            },
            'aria-selected': isActive || undefined,
            style: {
              ...props.htmlProps.style,
              cursor: 'pointer',
              ...(isActive
                ? {boxShadow: 'inset 2px 0 0 var(--color-accent)'}
                : null),
            },
          },
        };
      },
    }),
    [activeDocId],
  );

  const columns = useMemo(() => buildColumns(isCompact), [isCompact]);

  const changeFolder = (nextFolder: FolderId) => {
    setFolder(nextFolder);
    setActiveDocId(null);
  };

  // Source-chip jump: reveal the cited document in the table.
  const jumpToDoc = (docId: string) => {
    const doc = DOCS.find(row => row.id === docId);
    if (doc === undefined) {
      return;
    }
    setFolder(doc.folder);
    setQuery('');
    setActiveDocId(doc.id);
    setAnnouncement(\`Showing \${doc.name} in \${FOLDERS[doc.folder].label}\`);
  };

  const toggleFinding = (id: string) => {
    setExpandedFindingId(prev => (prev === id ? null : id));
  };

  const addToReport = (id: string) => {
    const finding = FINDINGS.find(row => row.id === id);
    setAddedIds(prev => new Set(prev).add(id));
    setAnnouncement(
      finding === undefined
        ? 'Added finding to the report draft'
        : \`Added \${finding.id} to the \${finding.reportSection} section of the report draft\`,
    );
  };

  // Human verification is explicit — actor + date, never AI self-verified.
  const verifyFinding = (id: string) => {
    setVerifications(prev => ({
      ...prev,
      [id]: {state: 'verified', by: 'P. Khanna', on: 'Jul 15'},
    }));
    setAnnouncement(\`Marked \${id} verified by P. Khanna\`);
  };

  const confirmDismiss = () => {
    if (dismissTargetId === null) {
      return;
    }
    setDismissedIds(prev => new Set(prev).add(dismissTargetId));
    if (expandedFindingId === dismissTargetId) {
      setExpandedFindingId(null);
    }
    setAnnouncement(\`Dismissed finding \${dismissTargetId}\`);
    setDismissTargetId(null);
  };

  const dismissTarget =
    dismissTargetId === null ? null : (FINDINGS.find(row => row.id === dismissTargetId) ?? null);

  // ----- header: matter row + review meter + reviewers + privilege strip --
  const header = (
    <LayoutHeader hasDivider>
      <VStack gap={2} style={styles.headerStack}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <HStack gap={2} vAlign="center">
            <Icon icon={ScaleIcon} size="md" color="secondary" />
            <Heading level={1}>Data Room Review</Heading>
            <Token size="sm" color="gray" label="M-2417" />
          </HStack>
          <StackItem size="fill" style={{minWidth: 160}}>
            <Text type="supporting" color="secondary" maxLines={1}>
              Kestrel Labs — Series C Financing · Meridian Growth Partners
              diligence
            </Text>
          </StackItem>
          <HStack gap={2} vAlign="center">
            <VStack gap={0} style={styles.headerMeter}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {REVIEW_TOTALS.reviewed} of {REVIEW_TOTALS.total} docs reviewed
              </Text>
              <ProgressBar
                label="Data-room review progress"
                isLabelHidden
                value={REVIEW_TOTALS.reviewed}
                max={REVIEW_TOTALS.total}
                variant="neutral"
                style={{minWidth: 0}}
              />
            </VStack>
            <AvatarGroup size="xsmall" aria-label="Document reviewers">
              {REVIEWERS.map(person => (
                <Avatar key={person} name={person} />
              ))}
            </AvatarGroup>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {REVIEWERS.length} reviewers
            </Text>
          </HStack>
          {!isPanelHidden && (
            <IconButton
              label={isPanelOpen ? 'Hide findings panel' : 'Show findings panel'}
              tooltip={isPanelOpen ? 'Hide findings' : 'Show findings'}
              size="sm"
              variant={isPanelOpen ? 'secondary' : 'ghost'}
              icon={<Icon icon={PanelRightIcon} size="sm" />}
              onClick={() => setIsPanelOpen(open => !open)}
            />
          )}
        </HStack>
        {/* Privilege strip — persistent on every matter surface. */}
        <div style={styles.privilegeStrip}>
          <Icon icon={LockIcon} size="xsm" color="secondary" />
          <StackItem size="fill" style={{minWidth: 0}}>
            <Text type="supporting" color="secondary" maxLines={1}>
              Attorney-Client Privileged · Attorney Work Product — do not
              forward
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" style={{whiteSpace: 'nowrap'}}>
            Disclosure schedules due Mon Jul 20
          </Text>
        </div>
      </VStack>
    </LayoutHeader>
  );

  // ----- content toolbar: folder heading (or Selector), tallies, search ---
  const contentToolbar = (
    <HStack gap={3} vAlign="center" style={styles.contentToolbar} wrap="wrap">
      {isCompact ? (
        <Selector
          label="Data-room folder"
          isLabelHidden
          options={FOLDER_OPTIONS}
          value={folder}
          onChange={value => changeFolder(value as FolderId)}
          size="sm"
          width={220}
        />
      ) : (
        <HStack gap={2} vAlign="center">
          <Icon icon={folderMeta.icon} size="sm" color="secondary" />
          <Heading level={2}>
            {folderMeta.index} · {folderMeta.label}
          </Heading>
        </HStack>
      )}
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {folderMeta.reviewed} of {folderMeta.total} reviewed
        {folderMeta.flagged > 0 ? \` · \${folderMeta.flagged} flagged\` : ''}
      </Text>
      <StackItem size="fill" />
      <TextInput
        label={\`Search \${folderMeta.label} documents\`}
        isLabelHidden
        size="sm"
        width={240}
        placeholder="Search documents…"
        startIcon={<Icon icon={SearchIcon} size="sm" />}
        value={query}
        onChange={setQuery}
        hasClear
      />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        Showing {visibleDocs.length} of {folderMeta.total}
      </Text>
    </HStack>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel
              width={260}
              padding={0}
              hasDivider
              label="Data room folders">
              <FolderRail folder={folder} onFolderChange={changeFolder} />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              {contentToolbar}
              <div style={styles.tableScroll}>
                <Table<DocRow>
                  data={visibleDocs}
                  columns={columns}
                  idKey="id"
                  density="balanced"
                  dividers="rows"
                  hasHover
                  plugins={{active: activePlugin}}
                  emptyState={
                    <div style={styles.tableEmpty}>
                      <EmptyState
                        isCompact
                        icon={<Icon icon={SearchIcon} size="lg" />}
                        title="No matching documents"
                        description="Try a different document name, DR number, or reviewer."
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
              width={380}
              padding={0}
              hasDivider
              label="Casewright findings">
              <FindingsPanel
                findings={openFindings}
                verifications={verifications}
                addedIds={addedIds}
                expandedId={expandedFindingId}
                onToggle={toggleFinding}
                onAdd={addToReport}
                onVerify={verifyFinding}
                onDismissRequest={setDismissTargetId}
                onJump={jumpToDoc}
              />
            </LayoutPanel>
          ) : undefined
        }
      />

      {/* Confirm affordance: dismissing an AI finding is irreversible on
          this surface — the consequence is stated in plain language. */}
      <AlertDialog
        isOpen={dismissTarget !== null}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setDismissTargetId(null);
          }
        }}
        title={
          dismissTarget === null
            ? 'Dismiss finding?'
            : \`Dismiss finding \${dismissTarget.id}?\`
        }
        description={
          dismissTarget === null
            ? ''
            : \`"\${dismissTarget.title}" will be removed from open findings and logged to the Casewright audit trail as dismissed by P. Khanna. Source documents keep their flags until re-reviewed.\`
        }
        actionLabel="Dismiss finding"
        cancelLabel="Keep finding"
        onAction={confirmDismiss}
      />
    </div>
  );
}
`;export{e as default};