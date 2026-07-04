// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (the Larchpay Payment Processing
 *   Agreement, counterparty draft v3 received Jul 14, 2026 on matter
 *   M-2431 "Kestrel Labs — Atlas Launch Vendor Agreements", rendered as a
 *   STATIC serif contract preview of 6 articles / 12 analyzed clauses;
 *   Casewright's extraction run cw-4187 of Jul 15, 2026 producing 12
 *   clause analyses — 2 high-risk, 3 moderate, 7 standard — with AI
 *   rationale excerpts, market-standard comparisons, playbook references
 *   to Ruth Vega's MV-PAY payments playbook, verification provenance, and
 *   3 suggested redlines). No clocks, no Math.random, no network assets.
 * @output Contract review & risk analysis surface: a summary header (scale
 *   glyph + "Larchpay Payment Processing Agreement" Heading + "Counterparty
 *   draft v3" Badge + matter note + an overall-risk chip reading
 *   "Overall risk: Elevated" beside a "12 clauses analyzed · 3 need
 *   attention" meter + the deal-team AvatarGroup), a persistent privilege
 *   banner strip ("Attorney-Client Privileged · Attorney Work Product — do
 *   not forward"), a centered light-locked serif paper canvas rendering
 *   the static contract preview whose operative clause sentences carry
 *   risk-tinted highlight spans (2 red, 3 amber, 7 green), and a right
 *   400px analysis rail of extracted clauses grouped by type
 *   (indemnification & risk allocation, liability cap, term & termination,
 *   data protection, commercial terms): flagged clauses as Cards with a
 *   risk pill, AI rationale excerpt, market-standard comparison chip
 *   ("Below market — cap at 1x fees vs typical 2x"), clause pin +
 *   playbook chips, verification provenance, a per-card disclosure line,
 *   and a suggested-redline affordance whose expanded body shows
 *   tracked-change serif text (strike + insert) — the § 8.4 indemnity
 *   redline starts expanded; standard clauses settle to compact rows.
 *   Clicking a paper highlight selects and scrolls its rail entry and vice
 *   versa. An AI-disclosure LayoutFooter cites the run and its sources.
 * @position Page template; emitted by `astryx template
 *   legal-doc-review-analysis`. The contract body is a STATIC PREVIEW by
 *   design — the live drafting editor is out of scope for review surfaces.
 *   Do not "upgrade" the paper canvas into an editable word processor; all
 *   interactivity belongs to the analysis rail, header, and highlights.
 *
 * Frame: root div 100dvh wrapping Layout height="fill". LayoutHeader
 * carries the review summary toolbar; LayoutContent (padding 0) stacks the
 * pinned privilege banner over a muted backdrop centering a 760px-max
 * paper column; LayoutPanel end 400 hosts the analysis rail (pinned
 * summary header + independently scrolling grouped clause list);
 * LayoutFooter carries the AI disclosure + source line.
 *
 * Responsive contract:
 * - >1120px: header | privilege banner + paper canvas (backdrop scrolls) |
 *   analysis rail 400 fixed (summary pinned, list scrolls) | footer. Only
 *   the backdrop and the rail list scroll internally.
 * - <=1120px: the rail leaves the right edge and stacks below the paper as
 *   a full-width section; the column flows at natural height and
 *   LayoutContent scrolls the whole page.
 * - <=640px: the header drops the matter note and deal-team stack and the
 *   overall-risk chip wraps under the title; the privilege banner drops
 *   its right-side matter attribution; highlight spans gain block padding
 *   for ~40px tap targets. Header rows are wrap="wrap" so nothing clips
 *   at 375px.
 *
 * Container policy (analysis-rail archetype): page chrome is frame-first
 * rows and panels; Cards are reserved for the five flagged-clause analysis
 * widgets in the rail. Standard (green) clauses render as compact rows,
 * and the privilege banner, overall-risk chip, and group headers are
 * styled rows, not Cards.
 *
 * Color policy: ONE accent (the theme accent) for selection outlines and
 * interactive chrome. The contract canvas and the tracked-change redline
 * chips are deliberately scheme-locked light (colorScheme:'light') so the
 * agreement reads as printed paper in both schemes — PAPER_* literals and
 * the risk washes stay raw hex on that locked surface. Risk inks
 * (high red / moderate amber / standard green) and redline insert/strike
 * inks are light-dark() pairs: on locked paper they resolve to their light
 * halves; on app chrome (risk pills, market chips, verification chips)
 * they brighten for dark backgrounds. The privilege banner is a restrained
 * amber light-dark() wash. Everything else is token-pure.
 */

import {useRef, useState, type CSSProperties} from 'react';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  GaugeIcon,
  LockIcon,
  MinusIcon,
  PenLineIcon,
  ScaleIcon,
  SparklesIcon,
  TrendingDownIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= PAPER + RISK PAINT CONSTANTS =============
// Scheme-locked surface (see "Color policy" above): the contract canvas is
// "paper" — literal light colors locked with colorScheme:'light' so the
// risk washes and redline inks look identical in dark mode. Do not
// tokenize the PAPER_* values or the *_WASH literals.

const PAPER_BG = '#FFFFFF';
const PAPER_TEXT = '#1F2A37';
const PAPER_MUTED = '#6B7280';
const PAPER_RULE = '#E5E7EB';
/** Serif voice for contract content ONLY — chrome stays on tokens. */
const SERIF = "Georgia, 'Times New Roman', Times, serif";

// Risk vocabulary — one set of inks for paper highlights AND rail chrome.
// Washes paint only on the locked paper, so they stay literal; inks are
// light-dark() pairs (locked paper resolves the light half, app chrome
// brightens for dark backgrounds). Chip tints are chrome-side pairs.

type RiskLevel = 'high' | 'moderate' | 'standard';

const RISK_INK: Record<RiskLevel, string> = {
  high: 'light-dark(#C0212F, #F87171)',
  moderate: 'light-dark(#96620D, #E0BB55)',
  standard: 'light-dark(#0B7A2B, #4ADE80)',
};
const RISK_WASH: Record<RiskLevel, string> = {
  high: '#FBE3E4', moderate: '#FDF3D0', standard: '#E6F5EA',
};
const RISK_WASH_ACTIVE: Record<RiskLevel, string> = {
  high: '#F5C8CB', moderate: '#F9E7A0', standard: '#CDEBD6',
};
const RISK_CHIP_TINT: Record<RiskLevel, string> = {
  high: 'light-dark(#FBE8EA, #4A1D1F)',
  moderate: 'light-dark(#FDF3D0, #453711)',
  standard: 'light-dark(#E4F5E8, #143D20)',
};
const RISK_LABEL: Record<RiskLevel, string> = {
  high: 'High risk', moderate: 'Moderate', standard: 'Standard',
};

// Tracked-change redline inks — the redline chip is light-locked like the
// paper, so the washes are literals; the inks reuse the risk pairs.
const INSERT_INK = RISK_INK.standard;
const INSERT_BG = '#E4F5E8';
const DELETE_INK = RISK_INK.high;
const DELETE_BG = '#FBE8EA';

// Privilege banner — restrained amber wash, consistent suite treatment.
const PRIVILEGE_BG = 'light-dark(#FBF4DF, #3A3115)';
const PRIVILEGE_INK = 'light-dark(#6B4E0B, #E7CE82)';

// Casewright sparkle — the suite's single AI-attribution tint.
const AI_TINT_BG = 'light-dark(#F1EBFE, #322350)';
const AI_TINT_INK = 'light-dark(#6B1EFD, #C4A8FF)';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  contentColumn: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  // Privilege banner: pinned strip above the scrolling backdrop.
  privilegeBanner: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-1)',
    backgroundColor: PRIVILEGE_BG,
    color: PRIVILEGE_INK,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    fontSize: 12,
    letterSpacing: '0.02em',
  },
  privilegeLead: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // Muted backdrop; the paper column centers and the backdrop scrolls.
  backdrop: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  backdropStacked: {overflowY: 'visible', flex: 'none'},
  paperColumn: {width: '100%', maxWidth: 760, marginInline: 'auto'},
  // The contract surface: white paper, light-locked so risk washes hold.
  paper: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    padding: 'clamp(24px, 6vw, 56px)',
    fontFamily: SERIF,
  },
  docTitle: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textAlign: 'center',
    margin: 0,
  },
  docStamp: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 12,
    color: PAPER_MUTED,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: '0.03em',
  },
  docRule: {
    border: 'none',
    borderTop: `1px solid ${PAPER_RULE}`,
    margin: '20px 0 24px',
  },
  preamble: {fontSize: 15.5, lineHeight: 1.8, margin: '0 0 14px'},
  articleHeading: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.08em',
    margin: '30px 0 10px',
  },
  sectionPara: {
    fontSize: 15.5,
    lineHeight: 1.85,
    margin: '0 0 14px',
    overflowWrap: 'break-word',
  },
  sectionParaTouch: {lineHeight: 2.15},
  sectionLead: {fontWeight: 700},
  // Inline highlight spans render as real <button>s so clause anchors are
  // keyboard-reachable. Atomic inline boxes need their own line-height or
  // the wash detaches below the baseline (doc-comments-review idiom).
  inlineButton: {
    display: 'inline',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    lineHeight: 1.45,
    color: 'inherit',
    textAlign: 'inherit',
    cursor: 'pointer',
    borderRadius: 3,
  },
  inlineButtonTouch: {paddingBlock: 6},
  sigNote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: PAPER_MUTED,
    margin: '26px 0 0',
    textAlign: 'center',
  },
  // Rail: pinned summary header + scrolling grouped clause list.
  railFrame: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  railHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  railScroll: {
    minHeight: 0,
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  railStacked: {padding: 'var(--spacing-3)'},
  groupHeader: {paddingInline: 'var(--spacing-1)', paddingTop: 'var(--spacing-2)'},
  // Risk pill: dot + label on the matching chip tint. flexShrink 0 so the
  // pill never truncates against wrapping clause titles (footgun 18).
  riskPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 'var(--radius-full)',
    paddingInline: 8,
    paddingBlock: 2,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  riskDot: {width: 7, height: 7, borderRadius: '50%', flexShrink: 0},
  // Market-standard comparison chip: icon + benchmark phrase. The label
  // may wrap as a block — never mid-token — so the chip is a rounded row.
  marketChip: {
    display: 'inline-flex',
    alignItems: 'flex-start',
    gap: 6,
    borderRadius: 'var(--radius-control)',
    paddingInline: 8,
    paddingBlock: 3,
    fontSize: 12,
    lineHeight: 1.5,
    maxWidth: '100%',
  },
  marketChipIcon: {display: 'inline-flex', flexShrink: 0, marginTop: 2},
  // Verification provenance line: state glyph + actor + date.
  verificationRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  // Per-card AI disclosure line (suite-wide treatment).
  disclosureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--color-text-secondary)',
  },
  aiMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: 'var(--radius-control)',
    backgroundColor: AI_TINT_BG,
    color: AI_TINT_INK,
    flexShrink: 0,
  },
  // Tracked-change redline chip: light-locked serif paper, like the canvas,
  // so strike/insert inks stay legible on dark app chrome.
  redlineChip: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    border: `1px solid ${PAPER_RULE}`,
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    fontFamily: SERIF,
    fontSize: 13.5,
    lineHeight: 1.7,
    overflowWrap: 'anywhere',
  },
  redlineStrike: {
    color: DELETE_INK,
    backgroundColor: DELETE_BG,
    textDecoration: 'line-through',
    textDecorationColor: DELETE_INK,
    textDecorationThickness: 1.5,
    borderRadius: 3,
    paddingInline: 1,
    marginRight: 4,
  },
  redlineInsert: {
    color: INSERT_INK,
    backgroundColor: INSERT_BG,
    textDecoration: 'underline',
    textDecorationColor: INSERT_INK,
    textDecorationThickness: 1.5,
    textUnderlineOffset: 3,
    fontStyle: 'normal',
    borderRadius: 3,
    paddingInline: 1,
  },
  // Standard (green) clauses settle to compact rows, not Cards.
  standardRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'start',
    font: 'inherit',
    color: 'inherit',
    display: 'block',
  },
  // Header overall-risk chip: gauge glyph + band + drive-note, one pill.
  riskScoreChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
    backgroundColor: 'var(--color-background-surface)',
  },
  headerMeter: {whiteSpace: 'nowrap'},
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    width: '100%',
  },
  footerSource: {minWidth: 0, flex: '1 1 260px', textAlign: 'end'},
};

// ============= MATTER FIXTURES =============
// Casewright at Marlow & Voss LLP, matter M-2431 "Kestrel Labs — Atlas
// Launch Vendor Agreements". The Larchpay payment processing agreement is
// the v2→v3 counterparty turn racing the Jul 21 beta expansion; execution
// target Mon Jul 20, 2026. Lead: Julian Voss; day-to-day: David Chen.
// Suite "now": Wednesday, July 15, 2026. All timestamps are fixed strings.

const DOC_TITLE = 'Larchpay Payment Processing Agreement';
const DOC_BADGE = 'Counterparty draft v3';
const MATTER_NOTE =
  'M-2431 · Kestrel Labs — Atlas Launch Vendor Agreements · execution target Mon, Jul 20, 2026';
const RUN_NOTE = 'Analyzed by Casewright · run cw-4187 · Jul 15, 2026, 9:42 AM';
const DEAL_TEAM = [
  {name: 'Julian Voss', role: 'Partner — commercial/technology transactions'},
  {name: 'David Chen', role: 'Associate — commercial'},
] as const;
const PRIVILEGE_TEXT =
  'Attorney-Client Privileged · Attorney Work Product — do not forward';
const PRIVILEGE_META = 'Marlow & Voss LLP · M-2431 · prepared for J. Voss';
const DISCLOSURE = 'AI-generated · verify before relying';
const FOOTER_SOURCES =
  'Sources: Larchpay PPA v3 (received Jul 14, 2026) · M&V payments playbook MV-PAY (R. Vega, May 2026 rev.)';
const OVERALL_RISK_BAND = 'Elevated'; // band, never a fake-precise score
const OVERALL_RISK_NOTE = 'driven by Art. 8–9 risk allocation';

// ============= CLAUSE FIXTURES =============
// 12 extracted clauses: 2 high (red), 3 moderate (amber), 7 standard
// (green). "Need attention" = the 3 clauses carrying suggested redlines
// (§ 8.1, § 8.4, § 9.2); the other two moderates are acceptable under the
// MV-PAY playbook fallback. Every count below reconciles with the paper
// highlights, the rail groups, and the header meter.

type GroupId =
  | 'risk-allocation'
  | 'liability-cap'
  | 'termination'
  | 'data-protection'
  | 'commercial';

const GROUPS: Array<{id: GroupId; label: string}> = [
  {id: 'risk-allocation', label: 'Indemnification & risk allocation'},
  {id: 'liability-cap', label: 'Liability cap'},
  {id: 'termination', label: 'Term & termination'},
  {id: 'data-protection', label: 'Data protection'},
  {id: 'commercial', label: 'Commercial terms'},
];

type MarketTone = 'off' | 'below' | 'near' | 'standard';

interface Redline {
  /** Language struck from the counterparty draft. */
  strike: string;
  /** Language inserted in its place. */
  insert: string;
  /** Plain-language effect of the change. */
  note: string;
  /** MV-PAY playbook position the redline implements. */
  playbookRef: string;
}

interface Clause {
  id: string;
  section: string; // '§ 8.4'
  title: string;
  page: number;
  group: GroupId;
  risk: RiskLevel;
  needsAttention: boolean;
  /** Casewright's plain-language rationale (AI-generated). */
  rationale: string;
  /** Honest confidence band — never fake precision. */
  confidence: 'High confidence' | 'Medium confidence' | 'Low confidence';
  market: {tone: MarketTone; label: string};
  verification:
    | {state: 'verified'; by: string; on: string}
    | {state: 'unverified'};
  redline?: Redline;
}

const CLAUSES: Clause[] = [
  {
    id: 'c-8-1', section: '§ 8.1', title: 'Chargeback allocation', page: 9,
    group: 'risk-allocation', risk: 'high', needsAttention: true,
    rationale:
      'Passes every chargeback dollar above $50,000 per calendar quarter to Kestrel regardless of cause — including chargebacks driven by a failure of Larchpay’s own fraud screening. v2 allocated these losses by fault; the flat pass-through is a v3 insertion.',
    confidence: 'High confidence',
    market: {
      tone: 'off',
      label: 'Off market — uncapped no-fault pass-through above $50k/qtr',
    },
    verification: {state: 'verified', by: 'D. Chen', on: 'Jul 15'},
    redline: {
      strike:
        'Customer shall bear all chargeback Losses in excess of $50,000 in any calendar quarter, regardless of cause or fault,',
      insert:
        'Chargeback Losses shall be allocated to Customer only to the extent attributable to Customer’s transactions and not to a failure or degradation of Processor’s fraud-screening services,',
      note: 'Restores the v2 fault-based allocation; Larchpay keeps losses its own screening causes.',
      playbookRef: 'MV-PAY-07 · chargeback allocation follows fault',
    },
  },
  {
    id: 'c-8-2', section: '§ 8.2', title: 'Fraud losses', page: 10,
    group: 'risk-allocation', risk: 'standard', needsAttention: false,
    rationale:
      'Fraud losses follow the party at fault — the market allocation and the MV-PAY baseline.',
    confidence: 'High confidence',
    market: {tone: 'standard', label: 'Market standard — losses follow fault'},
    verification: {state: 'unverified'},
  },
  {
    id: 'c-8-4', section: '§ 8.4', title: 'Indemnification', page: 11,
    group: 'risk-allocation', risk: 'high', needsAttention: true,
    rationale:
      'Indemnity runs one way: Kestrel indemnifies Larchpay for “any and all Losses arising out of or relating to this Agreement,” expressly including Losses from Larchpay’s own negligence. There is no reciprocal indemnity for a Larchpay data breach or a card-network fine.',
    confidence: 'High confidence',
    market: {
      tone: 'off',
      label: 'Off market — one-way indemnity; mutual is standard',
    },
    verification: {state: 'verified', by: 'J. Voss', on: 'Jul 15'},
    redline: {
      strike:
        'Customer shall indemnify, defend, and hold harmless Processor and its affiliates from and against any and all Losses arising out of or relating to this Agreement, including Losses arising from Processor’s negligence.',
      insert:
        'Each party shall indemnify, defend, and hold harmless the other from and against Losses arising out of its breach of this Agreement, its violation of applicable law, or its gross negligence or willful misconduct, including, in the case of Processor, Losses arising from a Security Incident attributable to Processor’s systems.',
      note: 'Converts to a mutual, fault-based indemnity and adds Larchpay breach coverage.',
      playbookRef: 'MV-PAY-04 · mutual indemnity required',
    },
  },
  {
    id: 'c-9-2', section: '§ 9.2', title: 'Limitation of liability', page: 12,
    group: 'liability-cap', risk: 'moderate', needsAttention: true,
    rationale:
      'Aggregate liability is capped at fees paid in the trailing 12 months — roughly $190k at projected Atlas launch volume — with no carve-out for data-protection breaches or the Article 8 indemnities. MV-PAY floor is 2x trailing fees with Article 14 carved out.',
    confidence: 'High confidence',
    market: {
      tone: 'below',
      label: 'Below market — cap at 1x fees vs typical 2x',
    },
    verification: {state: 'unverified'},
    redline: {
      strike:
        'EXCEED THE TOTAL FEES PAID BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE FIRST EVENT GIVING RISE TO LIABILITY.',
      insert:
        'EXCEED TWO (2) TIMES THE TOTAL FEES PAID BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE FIRST EVENT GIVING RISE TO LIABILITY; PROVIDED THAT THE FOREGOING CAP SHALL NOT APPLY TO PROCESSOR’S OBLIGATIONS UNDER ARTICLE 14 (DATA PROTECTION) OR EITHER PARTY’S INDEMNIFICATION OBLIGATIONS.',
      note: 'Lifts the cap to the 2x market norm and carves out data protection and indemnities.',
      playbookRef: 'MV-PAY-11 · cap floor 2x, Art. 14 carve-out',
    },
  },
  {
    id: 'c-12-1', section: '§ 12.1', title: 'Term & renewal', page: 15,
    group: 'termination', risk: 'standard', needsAttention: false,
    rationale:
      'Two-year initial term with one-year auto-renewals and a 90-day non-renewal window — standard.',
    confidence: 'High confidence',
    market: {tone: 'standard', label: 'Market standard — 2-year initial term'},
    verification: {state: 'unverified'},
  },
  {
    id: 'c-12-3', section: '§ 12.3', page: 15,
    title: 'Termination for convenience',
    group: 'termination', risk: 'moderate', needsAttention: false,
    rationale:
      'Either party may exit on 30 days’ notice. A mid-quarter Larchpay exit would strand Atlas checkout ahead of the Aug 4 launch; MV-PAY prefers 90 days but accepts 60 with the § 12.5 wind-down covenant, which this draft includes. Business tolerance is a client call.',
    confidence: 'Medium confidence',
    market: {
      tone: 'below',
      label: 'Below market — 30-day convenience exit vs 90-day typical',
    },
    verification: {state: 'unverified'},
  },
  {
    id: 'c-12-5', section: '§ 12.5', title: 'Effect of termination', page: 16,
    group: 'termination', risk: 'standard', needsAttention: false,
    rationale:
      'Pending settlements complete and a 90-day wind-down with transition assistance applies — standard.',
    confidence: 'High confidence',
    market: {tone: 'standard', label: 'Market standard — 90-day wind-down'},
    verification: {state: 'unverified'},
  },
  {
    id: 'c-14-2', section: '§ 14.2', title: 'Security standards', page: 18,
    group: 'data-protection', risk: 'standard', needsAttention: false,
    rationale:
      'PCI DSS Level 1 certification plus the Schedule C safeguards, maintained through the term — standard.',
    confidence: 'High confidence',
    market: {tone: 'standard', label: 'Market standard — PCI DSS Level 1'},
    verification: {state: 'unverified'},
  },
  {
    id: 'c-14-6', section: '§ 14.6', title: 'Breach notification', page: 19,
    group: 'data-protection', risk: 'moderate', needsAttention: false,
    rationale:
      'Notice of a confirmed Security Incident is due within 72 hours. MV-PAY prefers 48 hours but treats 72 as acceptable where PCI DSS Level 1 attestation is current — § 14.2 confirms it is.',
    confidence: 'Medium confidence',
    market: {
      tone: 'near',
      label: 'Near market — 72-hour notice vs 48-hour preferred',
    },
    verification: {state: 'unverified'},
  },
  {
    id: 'c-14-8', section: '§ 14.8', title: 'Data use rights', page: 19,
    group: 'data-protection', risk: 'standard', needsAttention: false,
    rationale:
      'Transaction data may be used only in aggregated, de-identified form; no sale or disclosure — standard.',
    confidence: 'High confidence',
    market: {
      tone: 'standard',
      label: 'Market standard — aggregated, de-identified only',
    },
    verification: {state: 'unverified'},
  },
  {
    id: 'c-4-2', section: '§ 4.2', title: 'Fee changes', page: 4,
    group: 'commercial', risk: 'standard', needsAttention: false,
    rationale:
      'Schedule A fees are locked for 12 months, then adjustable once per year on 60 days’ notice — standard.',
    confidence: 'High confidence',
    market: {tone: 'standard', label: 'Market standard — 12-month fee lock'},
    verification: {state: 'unverified'},
  },
  {
    id: 'c-6-3', section: '§ 6.3', title: 'Settlement timing', page: 6,
    group: 'commercial', risk: 'standard', needsAttention: false,
    rationale:
      'Cleared funds settle T+2 net of fees and permitted reserves — the prevailing PSP norm.',
    confidence: 'High confidence',
    market: {tone: 'standard', label: 'Market standard — T+2 settlement'},
    verification: {state: 'unverified'},
  },
];

const CLAUSE_BY_ID = Object.fromEntries(
  CLAUSES.map(clause => [clause.id, clause]),
) as Record<string, Clause>;

// Derived counts — the single source for the header meter, the rail
// summary, and the paper highlight tally. 12 · 2 high · 3 moderate ·
// 7 standard · 3 need attention.
const TOTAL_CLAUSES = CLAUSES.length;
const NEED_ATTENTION = CLAUSES.filter(clause => clause.needsAttention).length;
const RISK_COUNTS: Record<RiskLevel, number> = {
  high: CLAUSES.filter(clause => clause.risk === 'high').length,
  moderate: CLAUSES.filter(clause => clause.risk === 'moderate').length,
  standard: CLAUSES.filter(clause => clause.risk === 'standard').length,
};

const MARKET_TONE_META: Record<
  MarketTone,
  {risk: RiskLevel; icon: typeof MinusIcon}
> = {
  off: {risk: 'high', icon: TrendingDownIcon},
  below: {risk: 'moderate', icon: TrendingDownIcon},
  near: {risk: 'moderate', icon: MinusIcon},
  standard: {risk: 'standard', icon: CircleCheckIcon},
};

// ============= CONTRACT PREVIEW DATA =============
// The static paper: preamble + 6 articles. Each analyzed section renders
// its operative sentence as a clause-anchored highlight span tinted by
// risk; the highlight text is the exact language Casewright extracted.
// The body is NOT editable — see the @position note.

const DOC_STAMP =
  'Counterparty draft v3 · received Jul 14, 2026 · Larchpay ref LP-CTR-8841';
const PREAMBLE =
  'This Payment Processing Agreement (this “Agreement”) is entered into as of July 20, 2026 (the “Effective Date”), by and between Larchpay, Inc., a Delaware corporation (“Processor”), and Kestrel Labs, Inc., a Delaware corporation (“Customer”). Capitalized terms not defined in context have the meanings given in Schedule B.';

type DocBlock =
  | {kind: 'article'; id: string; text: string}
  | {
      kind: 'section';
      id: string;
      num: string;
      lead: string;
      before?: string;
      clauseId?: string;
      quote?: string;
      after?: string;
    };

type SectionBlock = Extract<DocBlock, {kind: 'section'}>;
const article = (id: string, text: string): DocBlock =>
  ({kind: 'article', id, text});
const section = (
  id: string, num: string, lead: string,
  rest: Omit<SectionBlock, 'kind' | 'id' | 'num' | 'lead'>,
): DocBlock => ({kind: 'section', id, num, lead, ...rest});

const DOC_BLOCKS: DocBlock[] = [
  article('a4', 'ARTICLE 4 — FEES'),
  section('s-4-2', '4.2', 'Fee Changes.', {
    clauseId: 'c-4-2',
    quote:
      'The fees set forth on Schedule A shall remain fixed for the twelve (12) months following the Effective Date; thereafter Processor may adjust such fees not more than once per contract year upon sixty (60) days’ prior written notice to Customer.',
  }),
  article('a6', 'ARTICLE 6 — SETTLEMENT'),
  section('s-6-3', '6.3', 'Settlement Timing.', {
    clauseId: 'c-6-3',
    quote:
      'Processor shall settle cleared funds to Customer’s designated account within two (2) Business Days of transaction capture, net of fees, chargebacks, and reserves then permitted under Section 7.',
  }),
  article('a8', 'ARTICLE 8 — CHARGEBACKS; INDEMNIFICATION'),
  section('s-8-1', '8.1', 'Chargeback Allocation.', {
    before:
      'Chargeback Losses up to $50,000 in any calendar quarter shall be allocated as provided in the Operating Rules. ',
    clauseId: 'c-8-1',
    quote:
      'Customer shall bear all chargeback Losses in excess of $50,000 in any calendar quarter, regardless of cause or fault, including chargebacks arising from the failure or degradation of Processor’s fraud-screening services.',
  }),
  section('s-8-2', '8.2', 'Fraud Losses.', {
    clauseId: 'c-8-2',
    quote:
      'Losses arising from fraudulent transactions shall be allocated to the party whose act, omission, or system failure gave rise to such Losses.',
  }),
  section('s-8-4', '8.4', 'Indemnification.', {
    clauseId: 'c-8-4',
    quote:
      'Customer shall indemnify, defend, and hold harmless Processor and its affiliates from and against any and all Losses arising out of or relating to this Agreement, including Losses arising from Processor’s negligence.',
    after:
      ' Processor’s obligations under this Section 8.4, if any, are as set forth in Schedule D.',
  }),
  article('a9', 'ARTICLE 9 — LIMITATION OF LIABILITY'),
  section('s-9-2', '9.2', 'Cap.', {
    clauseId: 'c-9-2',
    quote:
      'IN NO EVENT SHALL PROCESSOR’S AGGREGATE LIABILITY UNDER THIS AGREEMENT EXCEED THE TOTAL FEES PAID BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE FIRST EVENT GIVING RISE TO LIABILITY.',
  }),
  article('a12', 'ARTICLE 12 — TERM AND TERMINATION'),
  section('s-12-1', '12.1', 'Term.', {
    clauseId: 'c-12-1',
    quote:
      'The initial term of this Agreement is two (2) years from the Effective Date, renewing automatically for successive one (1) year periods unless either party gives notice of non-renewal at least ninety (90) days before the end of the then-current term.',
  }),
  section('s-12-3', '12.3', 'Termination for Convenience.', {
    clauseId: 'c-12-3',
    quote:
      'Either party may terminate this Agreement for convenience upon thirty (30) days’ prior written notice to the other party.',
  }),
  section('s-12-5', '12.5', 'Effect of Termination.', {
    clauseId: 'c-12-5',
    quote:
      'Upon termination, Processor shall continue to settle Transactions captured prior to the effective date of termination and shall provide commercially reasonable transition assistance for a wind-down period of ninety (90) days.',
  }),
  article('a14', 'ARTICLE 14 — DATA PROTECTION'),
  section('s-14-2', '14.2', 'Security Standards.', {
    clauseId: 'c-14-2',
    quote:
      'Processor shall maintain PCI DSS Level 1 certification and the administrative, technical, and physical safeguards described in Schedule C throughout the term.',
  }),
  section('s-14-6', '14.6', 'Breach Notification.', {
    clauseId: 'c-14-6',
    quote:
      'Processor shall notify Customer of a confirmed Security Incident affecting Customer Data without undue delay, and in no event later than seventy-two (72) hours after confirmation.',
  }),
  section('s-14-8', '14.8', 'Data Use.', {
    clauseId: 'c-14-8',
    quote:
      'Processor may use Transaction Data solely in aggregated, de-identified form to improve its fraud models and shall not sell or otherwise disclose Customer Data to any third party.',
  }),
];
const SIG_NOTE =
  '[Signature pages follow — execution copies release through the firm’s signature workflow once the § 8 and § 9 positions are resolved.]';

// ============= SHARED CHIPS =============

/** Risk pill: colored dot + band label on the matching tint. */
function RiskPill({risk}: {risk: RiskLevel}) {
  return (
    <span
      style={{
        ...styles.riskPill,
        backgroundColor: RISK_CHIP_TINT[risk],
        color: RISK_INK[risk],
      }}>
      <span
        style={{...styles.riskDot, backgroundColor: RISK_INK[risk]}}
        aria-hidden
      />
      {RISK_LABEL[risk]}
    </span>
  );
}

/** Market-standard comparison chip: benchmark icon + phrase. */
function MarketChip({market}: {market: Clause['market']}) {
  const meta = MARKET_TONE_META[market.tone];
  return (
    <span
      style={{
        ...styles.marketChip,
        backgroundColor: RISK_CHIP_TINT[meta.risk],
        color: RISK_INK[meta.risk],
      }}>
      <span style={styles.marketChipIcon} aria-hidden>
        <Icon icon={meta.icon} size="xsm" color="inherit" />
      </span>
      {market.label}
    </span>
  );
}

/**
 * Verification provenance: human verification is an explicit action with
 * an actor and a date; AI output never self-verifies. Unverified stays
 * amber until a lawyer checks the extraction against the paper.
 */
function VerificationChip({
  verification,
}: {
  verification: Clause['verification'];
}) {
  const isVerified = verification.state === 'verified';
  return (
    <span
      style={{
        ...styles.verificationRow,
        color: isVerified ? RISK_INK.standard : RISK_INK.moderate,
      }}>
      <Icon
        icon={isVerified ? CircleCheckIcon : CircleAlertIcon}
        size="xsm"
        color="inherit"
      />
      {isVerified
        ? `Verified · ${verification.by} · ${verification.on}`
        : 'Not yet verified against source'}
    </span>
  );
}

/** The suite-wide AI disclosure line: sparkle mark + fixed wording. */
function DisclosureLine({note}: {note?: string}) {
  return (
    <div style={styles.disclosureRow}>
      <span style={styles.aiMark} aria-hidden>
        <Icon icon={SparklesIcon} size="xsm" color="inherit" />
      </span>
      <Text type="supporting" size="xsm" color="secondary">
        {DISCLOSURE}
        {note != null ? ` · ${note}` : ''}
      </Text>
    </div>
  );
}

// ============= REDLINE BLOCK =============

/**
 * Suggested redline as tracked-change serif text: struck counterparty
 * language followed by the inserted playbook position, on a light-locked
 * paper chip, with the plain-language effect and playbook reference below.
 */
function RedlineBlock({redline}: {redline: Redline}) {
  return (
    <VStack gap={2}>
      <div style={styles.redlineChip}>
        <del style={styles.redlineStrike}>{redline.strike}</del>
        <ins style={styles.redlineInsert}>{redline.insert}</ins>
      </div>
      <HStack gap={2} vAlign="start" wrap="wrap">
        <StackItem size="fill" style={{minWidth: 160}}>
          <Text type="supporting" size="xsm" color="secondary">
            {redline.note}
          </Text>
        </StackItem>
        <span style={{flexShrink: 0}}>
          <Token
            label={redline.playbookRef}
            size="sm"
            color="purple"
            description="Firm playbook position implemented by this redline"
          />
        </span>
      </HStack>
    </VStack>
  );
}

// ============= RAIL: CLAUSE ENTRIES =============

interface ClauseEntryProps {
  clause: Clause;
  isActive: boolean;
  onActivate: (id: string) => void;
  entryRef: (node: HTMLDivElement | null) => void;
}

/**
 * Flagged clause (high/moderate) analysis Card: risk pill + title + clause
 * pin, AI rationale with an honest confidence band, market comparison,
 * verification provenance, disclosure line, and — where Casewright drafted
 * one — the suggested-redline affordance with the tracked-change body.
 */
function FlaggedClauseCard({
  clause,
  isActive,
  isRedlineOpen,
  onActivate,
  onToggleRedline,
  entryRef,
}: ClauseEntryProps & {
  isRedlineOpen: boolean;
  onToggleRedline: (id: string) => void;
}) {
  return (
    <div ref={entryRef}>
      <Card
        padding={3}
        style={{
          boxShadow: isActive
            ? 'inset 0 0 0 1px var(--color-accent), 0 0 0 1px var(--color-accent)'
            : undefined,
        }}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <RiskPill risk={clause.risk} />
            <StackItem size="fill" style={{minWidth: 0}}>
              <Heading level={3}>{clause.title}</Heading>
            </StackItem>
            <span style={{flexShrink: 0}}>
              <Token
                label={`${clause.section} · p. ${clause.page}`}
                size="sm"
                color="gray"
                onClick={() => onActivate(clause.id)}
                description={`Scroll the contract to ${clause.section}`}
              />
            </span>
          </HStack>
          <Text type="supporting" size="sm" color="secondary">
            {clause.rationale}
          </Text>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <MarketChip market={clause.market} />
            <Text type="supporting" size="xsm" color="secondary">
              {clause.confidence}
            </Text>
          </HStack>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <VerificationChip verification={clause.verification} />
            <span style={{flexShrink: 0}}>
              <Token
                label={
                  clause.needsAttention
                    ? 'Needs attention'
                    : 'Acceptable · playbook fallback'
                }
                size="sm"
                color={clause.needsAttention ? 'red' : 'gray'}
                description={
                  clause.needsAttention
                    ? 'Carries a suggested redline for the v3 markup'
                    : 'Within the MV-PAY fallback position — no redline required'
                }
              />
            </span>
          </HStack>
          {clause.redline != null ? (
            <VStack gap={2}>
              <Button
                label={
                  isRedlineOpen ? 'Hide suggested redline' : 'Suggested redline'
                }
                variant="secondary"
                size="sm"
                icon={<Icon icon={PenLineIcon} size="sm" color="inherit" />}
                endContent={
                  <Icon
                    icon={isRedlineOpen ? ChevronUpIcon : ChevronDownIcon}
                    size="sm"
                    color="inherit"
                  />
                }
                onClick={() => onToggleRedline(clause.id)}
              />
              {isRedlineOpen ? <RedlineBlock redline={clause.redline} /> : null}
            </VStack>
          ) : null}
          <Divider />
          <DisclosureLine />
        </VStack>
      </Card>
    </div>
  );
}

/**
 * Standard (green) clause: a compact row — extraction + market chip only.
 * Cards stay reserved for the flagged analysis widgets (Container policy).
 */
function StandardClauseRow({
  clause,
  isActive,
  onActivate,
  entryRef,
}: ClauseEntryProps) {
  return (
    <div ref={entryRef}>
      <button
        type="button"
        style={{
          ...styles.standardRow,
          boxShadow: isActive
            ? 'inset 0 0 0 1px var(--color-accent)'
            : undefined,
        }}
        aria-label={`${clause.section} ${clause.title} — standard; scroll the contract to it`}
        onClick={() => onActivate(clause.id)}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <RiskPill risk={clause.risk} />
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text size="sm" maxLines={1}>
                {clause.title}
              </Text>
            </StackItem>
            <Text type="supporting" size="xsm" color="secondary">
              {clause.section}
            </Text>
          </HStack>
          {/* Hug content — a bare VStack child would stretch the chip into
              a full-width band, unlike the hugging chips in flagged Cards. */}
          <span style={{alignSelf: 'flex-start', maxWidth: '100%'}}>
            <MarketChip market={clause.market} />
          </span>
        </VStack>
      </button>
    </div>
  );
}

// ============= PAPER: HIGHLIGHT SPAN + SECTION =============

/**
 * One clause-anchored highlight in the static preview: the operative
 * sentence washed by risk band, rendered as a real <button> so the anchor
 * is keyboard-reachable. Clicking selects the matching rail entry.
 */
function ClauseHighlight({
  clause,
  text,
  isActive,
  hasTouchTarget,
  onActivate,
  registerRef,
}: {
  clause: Clause;
  text: string;
  isActive: boolean;
  hasTouchTarget: boolean;
  onActivate: (id: string) => void;
  registerRef: (id: string, node: HTMLElement | null) => void;
}) {
  return (
    <button
      type="button"
      ref={node => registerRef(clause.id, node)}
      aria-label={`${clause.section} ${clause.title} — ${RISK_LABEL[clause.risk]}; open its analysis`}
      onClick={() => onActivate(clause.id)}
      style={{
        ...styles.inlineButton,
        ...(hasTouchTarget ? styles.inlineButtonTouch : null),
        backgroundColor: isActive
          ? RISK_WASH_ACTIVE[clause.risk]
          : RISK_WASH[clause.risk],
        borderBottom: `2px solid ${RISK_INK[clause.risk]}`,
        outline: isActive ? `2px solid ${RISK_INK[clause.risk]}` : 'none',
        outlineOffset: 1,
      }}>
      {text}
    </button>
  );
}

/** One contract section paragraph: number + lead-in + prose run. */
function SectionView({
  block,
  activeId,
  hasTouchTargets,
  onActivate,
  registerRef,
}: {
  block: SectionBlock;
  activeId: string | null;
  hasTouchTargets: boolean;
  onActivate: (id: string) => void;
  registerRef: (id: string, node: HTMLElement | null) => void;
}) {
  const clause = block.clauseId != null ? CLAUSE_BY_ID[block.clauseId] : null;
  return (
    <p
      style={{
        ...styles.sectionPara,
        ...(hasTouchTargets ? styles.sectionParaTouch : null),
      }}>
      <span style={styles.sectionLead}>
        {block.num} {block.lead}
      </span>{' '}
      {block.before != null ? <span>{block.before}</span> : null}
      {clause != null && block.quote != null ? (
        <ClauseHighlight
          clause={clause}
          text={block.quote}
          isActive={activeId === clause.id}
          hasTouchTarget={hasTouchTargets}
          onActivate={onActivate}
          registerRef={registerRef}
        />
      ) : null}
      {block.after != null ? <span>{block.after}</span> : null}
    </p>
  );
}

// ============= RAIL: GROUPED CLAUSE LIST =============

interface RailListProps {
  activeId: string | null;
  openRedlines: ReadonlySet<string>;
  onActivate: (id: string) => void;
  onToggleRedline: (id: string) => void;
  registerEntry: (id: string, node: HTMLDivElement | null) => void;
}

/** The grouped clause list: group header rows + cards/rows in doc order. */
function ClauseGroupList({
  activeId,
  openRedlines,
  onActivate,
  onToggleRedline,
  registerEntry,
}: RailListProps) {
  return (
    <VStack gap={3}>
      {GROUPS.map(group => {
        const clauses = CLAUSES.filter(clause => clause.group === group.id);
        const flaggedCount = clauses.filter(
          clause => clause.risk !== 'standard',
        ).length;
        return (
          <VStack key={group.id} gap={2}>
            <div style={styles.groupHeader}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill" style={{minWidth: 0}}>
                  <Text
                    type="supporting"
                    size="xsm"
                    color="secondary"
                    style={{
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                    {group.label}
                  </Text>
                </StackItem>
                <Text
                  type="supporting"
                  size="xsm"
                  color="secondary"
                  hasTabularNumbers>
                  {clauses.length} {clauses.length === 1 ? 'clause' : 'clauses'}
                  {flaggedCount > 0 ? ` · ${flaggedCount} flagged` : ''}
                </Text>
              </HStack>
            </div>
            {clauses.map(clause =>
              clause.risk === 'standard' ? (
                <StandardClauseRow
                  key={clause.id}
                  clause={clause}
                  isActive={activeId === clause.id}
                  onActivate={onActivate}
                  entryRef={node => registerEntry(clause.id, node)}
                />
              ) : (
                <FlaggedClauseCard
                  key={clause.id}
                  clause={clause}
                  isActive={activeId === clause.id}
                  isRedlineOpen={openRedlines.has(clause.id)}
                  onActivate={onActivate}
                  onToggleRedline={onToggleRedline}
                  entryRef={node => registerEntry(clause.id, node)}
                />
              ),
            )}
          </VStack>
        );
      })}
    </VStack>
  );
}

// ============= PAGE =============

export default function LegalDocReviewAnalysisTemplate() {
  const isRailStacked = useMediaQuery('(max-width: 1120px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  /** Selected clause — the cross-highlight between paper and rail. */
  const [activeId, setActiveId] = useState<string | null>(null);
  /** Expanded suggested redlines; § 8.4 starts open per the surface spec. */
  const [openRedlines, setOpenRedlines] = useState<ReadonlySet<string>>(
    () => new Set(['c-8-4']),
  );

  const paperSpanRefs = useRef<Record<string, HTMLElement | null>>({});
  const railEntryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const registerPaperSpan = (id: string, node: HTMLElement | null) => {
    paperSpanRefs.current[id] = node;
  };
  const registerRailEntry = (id: string, node: HTMLDivElement | null) => {
    railEntryRefs.current[id] = node;
  };

  /** Paper highlight click: select and scroll the rail entry into view. */
  const activateFromPaper = (id: string) => {
    setActiveId(id);
    requestAnimationFrame(() => {
      railEntryRefs.current[id]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    });
  };

  /** Rail entry / clause pin click: scroll the paper to the highlight. */
  const activateFromRail = (id: string) => {
    setActiveId(id);
    paperSpanRefs.current[id]?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  };

  const toggleRedline = (id: string) => {
    setOpenRedlines(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setActiveId(id);
  };

  // ---- header: title + draft badge + risk chip + meter + deal team ----
  const riskScoreChip = (
    <Tooltip
      content={`${RISK_COUNTS.high} high · ${RISK_COUNTS.moderate} moderate · ${RISK_COUNTS.standard} standard — band, not a score; ${OVERALL_RISK_NOTE}`}>
      <div style={styles.riskScoreChip} role="status">
        <Icon icon={GaugeIcon} size="sm" color="secondary" />
        <Text size="sm" weight="bold">
          Overall risk:{' '}
          <span style={{color: RISK_INK.high}}>{OVERALL_RISK_BAND}</span>
        </Text>
        {!isPhone && (
          <Text type="supporting" size="xsm" color="secondary">
            {OVERALL_RISK_NOTE}
          </Text>
        )}
      </div>
    </Tooltip>
  );

  const headerMeter = (
    <Text
      type="supporting"
      size="sm"
      color="secondary"
      hasTabularNumbers
      style={styles.headerMeter}>
      {TOTAL_CLAUSES} clauses analyzed · {NEED_ATTENTION} need attention
    </Text>
  );

  const dealTeamStack = (
    <Tooltip
      content={DEAL_TEAM.map(person => `${person.name} — ${person.role}`).join(
        ' · ',
      )}>
      <AvatarGroup size="xsmall" aria-label="Deal team">
        {DEAL_TEAM.map(person => (
          <Avatar key={person.name} name={person.name} />
        ))}
      </AvatarGroup>
    </Tooltip>
  );

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill" style={{minWidth: 0}}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Icon icon={ScaleIcon} size="md" color="secondary" />
            <Heading level={1}>{DOC_TITLE}</Heading>
            <Tooltip content="Received from Larchpay counsel Jul 14, 2026 — v2→v3 turn">
              <Badge label={DOC_BADGE} variant="neutral" />
            </Tooltip>
            {!isPhone && (
              <Text type="supporting" color="secondary">
                {MATTER_NOTE}
              </Text>
            )}
          </HStack>
        </StackItem>
        {riskScoreChip}
        {headerMeter}
        {!isPhone && dealTeamStack}
      </HStack>
    </LayoutHeader>
  );

  // ---- privilege banner: pinned above the scrolling backdrop ----
  const privilegeBanner = (
    <div style={styles.privilegeBanner} role="note">
      <span style={styles.privilegeLead}>
        <Icon icon={LockIcon} size="xsm" color="inherit" />
        {PRIVILEGE_TEXT}
      </span>
      {!isPhone && (
        <StackItem size="fill" style={{minWidth: 0, textAlign: 'end'}}>
          <span>{PRIVILEGE_META}</span>
        </StackItem>
      )}
    </div>
  );

  // ---- paper canvas (static contract preview — see @position note) ----
  const paper = (
    <div
      style={{
        ...styles.backdrop,
        ...(isRailStacked ? styles.backdropStacked : null),
      }}>
      <div style={styles.paperColumn}>
        <div style={styles.paper}>
          <h2 style={styles.docTitle}>PAYMENT PROCESSING AGREEMENT</h2>
          <div style={styles.docStamp}>{DOC_STAMP}</div>
          <hr style={styles.docRule} />
          <p style={styles.preamble}>{PREAMBLE}</p>
          {DOC_BLOCKS.map(block =>
            block.kind === 'article' ? (
              <h3 key={block.id} style={styles.articleHeading}>
                {block.text}
              </h3>
            ) : (
              <SectionView
                key={block.id}
                block={block}
                activeId={activeId}
                hasTouchTargets={isPhone}
                onActivate={activateFromPaper}
                registerRef={registerPaperSpan}
              />
            ),
          )}
          <p style={styles.sigNote}>{SIG_NOTE}</p>
        </div>
      </div>
    </div>
  );

  // ---- analysis rail: pinned summary + scrolling grouped list ----
  const railHeader = (
    <div style={styles.railHeader}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Clause analysis</Heading>
          </StackItem>
          <Text
            type="supporting"
            size="xsm"
            color="secondary"
            hasTabularNumbers
            style={{whiteSpace: 'nowrap', flexShrink: 0}}>
            {TOTAL_CLAUSES} clauses · {NEED_ATTENTION} need attention
          </Text>
        </HStack>
        <HStack gap={1} vAlign="center" wrap="wrap">
          {(['high', 'moderate', 'standard'] as const).map(risk => (
            <span
              key={risk}
              style={{
                ...styles.riskPill,
                backgroundColor: RISK_CHIP_TINT[risk],
                color: RISK_INK[risk],
              }}>
              <span
                style={{...styles.riskDot, backgroundColor: RISK_INK[risk]}}
                aria-hidden
              />
              {RISK_COUNTS[risk]} {RISK_LABEL[risk].toLowerCase()}
            </span>
          ))}
        </HStack>
        <DisclosureLine note="extraction run cw-4187" />
      </VStack>
    </div>
  );

  const rail = (
    <div style={isRailStacked ? undefined : styles.railFrame}>
      {railHeader}
      <div style={isRailStacked ? styles.railStacked : styles.railScroll}>
        <ClauseGroupList
          activeId={activeId}
          openRedlines={openRedlines}
          onActivate={activateFromRail}
          onToggleRedline={toggleRedline}
          registerEntry={registerRailEntry}
        />
      </div>
    </div>
  );

  // ---- AI disclosure footer: run provenance + sources ----
  const footer = (
    <LayoutFooter hasDivider>
      <div style={styles.footerRow}>
        <span style={styles.aiMark} aria-hidden>
          <Icon icon={SparklesIcon} size="xsm" color="inherit" />
        </span>
        <Text type="supporting" size="xsm" color="secondary">
          {DISCLOSURE} — {RUN_NOTE}
        </Text>
        <div style={styles.footerSource}>
          <Text type="supporting" size="xsm" color="secondary">
            {FOOTER_SOURCES}
          </Text>
        </div>
      </div>
    </LayoutFooter>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        footer={footer}
        end={
          !isRailStacked ? (
            <LayoutPanel width={400} padding={0} label="Clause analysis">
              {rail}
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent padding={0}>
            {/* When the rail stacks below the paper the column flows at
                natural height and LayoutContent scrolls the whole page;
                the height-locked fill frame would otherwise crush the
                paper to make room for the clause list. */}
            <div style={isRailStacked ? undefined : styles.contentColumn}>
              {privilegeBanner}
              {paper}
              {isRailStacked ? (
                <>
                  <Divider />
                  {rail}
                </>
              ) : null}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
