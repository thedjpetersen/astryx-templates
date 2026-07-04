var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file citations-authority-checker.tsx
 * @input Deterministic fixtures only — 14 fictional authorities cited in the
 *   Casewright draft research memo for Marlow & Voss matter M-2417 (Kestrel
 *   Labs — Series C Financing), with fixed treatment states, depth-of-support
 *   scores, verification provenance, and ISO-July-2026 timestamps rendered as
 *   fixed strings. No clocks, no randomness, no network media. Every cited
 *   case is FICTIONAL but plausibly Bluebook-formatted.
 * @output Citation & Authority Checker — Casewright's cite-check surface for
 *   the drag-along research memo: a privilege strip and toolbar header (memo
 *   context chips, AI disclosure line, last-run timestamp + Re-run check
 *   action), a summary strip reconciling 14 citations · 9 good law · 3
 *   caution · 1 negative treatment · 1 unverifiable (plus 10 human-verified ·
 *   4 AI-only), and a WIDE full-width cite-check table — legal-format
 *   citation, cited-for proposition excerpt, treatment badge with glyph,
 *   depth-of-support pips, verified-by column (checker Avatar + date or an
 *   amber "AI only" chip), and a jump-to-usage link. Every row expands to a
 *   treatment detail; the negatively-treated authority ships expanded with
 *   its citing-references list, a memo-characterization vs actual-holding
 *   quote comparison carrying a subtle mismatch flag, and a Casewright
 *   replace-suggestion Card (two alternative authorities, confidence band,
 *   confirm-gated Replace action that queues human review).
 * @position Page template; emitted by \`astryx template citations-authority-checker\`
 *
 * Frame: root 100dvh div > Layout height="fill". header (privilege strip,
 *   title/context row, summary strip) | content = one full-width Table in
 *   children mode (TableHeader/TableBody) so each citation row can be
 *   followed by an optional colSpan detail row. No side panels — the WIDE
 *   table is the page.
 * Container policy: app-shell archetype — frame rows only; the single Card
 *   is the Casewright replace-suggestion widget inside the expanded detail
 *   (a genuine AI-suggestion inspector), everything else is rows and strips.
 * Color policy: token-pure chrome. Literals are (a) the repo-standard
 *   light-dark() fallback pairs on data-viz categorical tokens (depth pips,
 *   treatment glyph accents) and (b) light-dark() washes on the quote-
 *   comparison blocks and the mismatch flag. Serif (Georgia stack) appears
 *   ONLY on quoted document/source passages — the cited-for excerpt inside
 *   the expanded detail, the memo-characterization and actual-holding quote
 *   blocks, and the suggested replacement case names — per the suite's
 *   quoted-passage idiom; all chrome, chips, table cells, and captions stay
 *   on default token typography.
 *
 * Responsive contract:
 * - > 1100px: all 7 columns (toggle, citation, cited for, treatment, depth,
 *   verified by, usage).
 * - <= 1100px: Depth and Usage columns hide; both values restate inside
 *   every row's expandable detail region.
 * - <= 760px: the Cited-for column also hides (the full proposition lives in
 *   the detail region as a serif quote block); header and summary rows wrap
 *   instead of clipping; the quote-comparison columns stack vertically.
 * - The table scrolls vertically inside LayoutContent (\`minHeight: 0\` down
 *   the flex chain); the header block is pinned. Long citations wrap at the
 *   cite boundary, never mid-citation.
 */

import {useState, type CSSProperties} from 'react';

import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  FlagIcon,
  GavelIcon,
  LockIcon,
  OctagonXIcon,
  QuoteIcon,
  RefreshCwIcon,
  ReplaceIcon,
  ScaleIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  privilegeStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  headerBlock: {padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-2)'},
  titleGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  chipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  // Disclosure line — one shared treatment across the Legal AI suite.
  disclosure: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  lastRun: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  summaryStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-4)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-4) var(--spacing-3)',
  },
  summaryCount: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-2)',
    flexShrink: 0,
  },
  tableScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
  },
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  // Column floors — children-mode Table lays out with table-layout auto,
  // so minWidth is what actually holds (footgun 4). Floors are budgeted to
  // sum under ~1010px so the full 7-column table fits a 1018px content box
  // (the desktop preview) without tripping the Table's horizontal scroll.
  toggleHeader: {width: 48, minWidth: 48},
  citationHeader: {minWidth: 220},
  citedForHeader: {minWidth: 170},
  caseName: {fontStyle: 'italic'},
  citeText: {fontVariantNumeric: 'tabular-nums'},
  // Depth-of-support pips.
  pipRow: {display: 'inline-flex', alignItems: 'center', gap: 3},
  pip: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    // --color-border is ~10% alpha — invisible on dark rows. The fallback
    // pair keeps the unfilled scale legible in both schemes (data-viz
    // literal allowance, same as the filled-pip categorical token below).
    border:
      'var(--border-width) solid var(--color-border-strong, light-dark(#05365959, #F2F4F65C))',
    backgroundColor: 'transparent',
  },
  pipFilled: {
    border: 'none',
    backgroundColor: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  },
  noShrink: {flexShrink: 0},
  // Expanded detail region — reads as a continuation of its parent row.
  detailCell: {backgroundColor: 'var(--color-background-muted)'},
  detailBody: {
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-4) var(--spacing-8)',
  },
  detailBodyCompact: {
    padding: 'var(--spacing-3) var(--spacing-2) var(--spacing-4)',
  },
  // Quoted document/source passages — the ONLY serif surfaces on the page
  // (suite quoted-passage idiom; see header Color policy).
  quoteBlock: {
    fontFamily: "Georgia, 'Times New Roman', Times, serif",
    fontSize: 14,
    lineHeight: 1.55,
    color: 'var(--color-text-primary)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderInlineStart: '3px solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    borderRadius: 'var(--radius-container)',
  },
  quoteBlockMismatch: {
    borderInlineStartColor: 'light-dark(#D97706, #FBBF24)',
    backgroundColor: 'light-dark(#FFFBEB, #451A0333)',
  },
  mismatchFlag: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'light-dark(#FEF3C7, #78350F40)',
    color: 'light-dark(#92400E, #FCD34D)',
  },
  quoteColumns: {display: 'flex', gap: 'var(--spacing-3)', alignItems: 'stretch'},
  quoteColumn: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)'},
  citingRefRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) 0',
  },
  replaceAlt: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
};

// ---------------------------------------------------------------------------
// DATA — Casewright cite-check of the M-2417 drag-along research memo.
// ---------------------------------------------------------------------------

const MEMO_TITLE =
  'Enforceability of Drag-Along Provisions Against Non-Signing Junior Preferred Holders';
const LAST_RUN = 'Jul 15, 2026 · 9:42 AM ET';

type Treatment = 'good' | 'caution' | 'negative' | 'unverifiable';

interface TreatmentMeta {
  label: string;
  color: 'green' | 'yellow' | 'red';
  icon: typeof CircleCheckIcon;
}

const TREATMENT_META: Record<Treatment, TreatmentMeta> = {
  good: {label: 'Good law', color: 'green', icon: CircleCheckIcon},
  caution: {label: 'Caution', color: 'yellow', icon: TriangleAlertIcon},
  negative: {label: 'Negative treatment', color: 'red', icon: OctagonXIcon},
  unverifiable: {label: 'Unverifiable', color: 'red', icon: FlagIcon},
};

const DEPTH_LABEL: Record<number, string> = {
  4: 'Directly on point',
  3: 'Strong support',
  2: 'Moderate support',
  1: 'Tangential',
};

interface Verification {
  name: string;
  date: string; // fixed string — the suite clock is Wed Jul 15, 2026
}

interface CitationRow {
  id: string;
  caseName: string;
  cite: string; // reporter + court/year, Bluebook-formatted, FICTIONAL
  pinCite: string;
  citedFor: string; // the memo's proposition excerpt
  treatment: Treatment;
  treatmentNote: string;
  depth: 1 | 2 | 3 | 4;
  verifiedBy: Verification | null; // null → amber "AI only" chip
  usagePara: string;
  usageSection: string;
}

// Ordered by first appearance in the memo (¶ order). Counts reconcile with
// the summary strip: 9 good law · 3 caution · 1 negative · 1 unverifiable;
// 10 human-verified · 4 AI only. All authorities FICTIONAL.
const CITATIONS: CitationRow[] = [
  {
    id: 'quillan',
    caseName: "In re Quillan Holdings S'holder Litig.",
    cite: '176 A.3d 331 (Del. 2018)',
    pinCite: 'at 340',
    citedFor:
      'Preferred stockholders’ contractual rights are interpreted under ordinary contract principles rather than fiduciary ones.',
    treatment: 'good',
    treatmentNote: 'No negative citing references. Followed 41 times, most recently 2026.',
    depth: 3,
    verifiedBy: {name: 'Priya Khanna', date: 'Jul 14'},
    usagePara: '¶ 4',
    usageSection: 'Brief Answer',
  },
  {
    id: 'beacon-hollow',
    caseName: 'Beacon Hollow Invs., L.P. v. Tessler Automation, Inc.',
    cite: '194 A.3d 733 (Del. 2019)',
    pinCite: 'at 741',
    citedFor:
      'Certificates of incorporation are contracts among the corporation and its stockholders.',
    treatment: 'good',
    treatmentNote: 'No negative citing references. Cited with approval by the Delaware Supreme Court in 2024.',
    depth: 3,
    verifiedBy: {name: 'Priya Khanna', date: 'Jul 14'},
    usagePara: '¶ 5',
    usageSection: 'Discussion I',
  },
  {
    id: 'hollis',
    caseName: 'Hollis v. Merton Indus.',
    cite: '512 F.3d 204 (2d Cir. 2019)',
    pinCite: 'at 211',
    citedFor:
      'Contractual drag-along rights are strictly construed against the party seeking to compel a sale.',
    treatment: 'good',
    treatmentNote: 'No negative citing references. Followed in three circuits.',
    depth: 3,
    verifiedBy: {name: 'Ruth Vega', date: 'Jul 15'},
    usagePara: '¶ 6',
    usageSection: 'Discussion I',
  },
  {
    id: 'calder-point',
    caseName: 'Calder Point Capital, L.P. v. Ostrand Sys., Inc.',
    cite: '214 A.3d 887 (Del. Ch. 2021)',
    pinCite: 'at 894',
    citedFor:
      'A drag-along obligation may be enforced as a covenant where the holder’s consent was obtained through the charter amendment process.',
    treatment: 'good',
    treatmentNote: 'No negative citing references. Quotation matched to the cited page verbatim.',
    depth: 4,
    verifiedBy: {name: 'Ruth Vega', date: 'Jul 15'},
    usagePara: '¶ 9',
    usageSection: 'Discussion I',
  },
  {
    id: 'danforth',
    caseName: 'Danforth Equity Partners, L.P. v. Corvid Analytics, Inc.',
    cite: '249 A.3d 118 (Del. Ch. 2023)',
    pinCite: 'at 127',
    citedFor:
      'Post-Sable Crest, drag-along enforcement against non-signatories turns on charter consent, not voting-agreement signature.',
    treatment: 'good',
    treatmentNote: 'No negative citing references. Most recent controlling application.',
    depth: 4,
    verifiedBy: {name: 'Ruth Vega', date: 'Jul 15'},
    usagePara: '¶ 10',
    usageSection: 'Discussion II',
  },
  {
    id: 'ostrower',
    caseName: 'Ostrower v. Linden Gate Ventures LLC',
    cite: '118 A.3d 641 (Del. Ch. 2015)',
    pinCite: 'at 652',
    citedFor:
      'A drag-along provision in a charter binds every preferred holder, whether or not the holder signed the voting agreement.',
    treatment: 'negative',
    treatmentNote:
      'Overruled in part by Sable Crest (Del. 2023); no longer good law for non-signing holders.',
    depth: 3,
    verifiedBy: {name: 'Ruth Vega', date: 'Jul 15'},
    usagePara: '¶ 11',
    usageSection: 'Discussion II',
  },
  {
    id: 'tolland',
    caseName: 'Tolland Mfg. Corp. v. Breckell & Sons, Inc.',
    cite: '402 F. Supp. 3d 118 (D. Del. 2021)',
    pinCite: 'at 131',
    citedFor:
      'Federal courts applying Delaware law enforce charter-based transfer covenants according to their plain terms.',
    treatment: 'good',
    treatmentNote: 'No negative citing references.',
    depth: 3,
    verifiedBy: {name: 'Ruth Vega', date: 'Jul 15'},
    usagePara: '¶ 12',
    usageSection: 'Discussion II',
  },
  {
    id: 'averton',
    caseName: 'Averton Partners LP v. Sable Ridge Holdings, Inc.',
    cite: '231 A.3d 402 (Del. Ch. 2022)',
    pinCite: 'at 414',
    citedFor:
      'Consent to a charter amendment adopting drag-along mechanics operates as a signature substitute for later-issued series.',
    treatment: 'good',
    treatmentNote: 'No negative citing references. Followed by Danforth (2023).',
    depth: 4,
    verifiedBy: {name: 'Priya Khanna', date: 'Jul 15'},
    usagePara: '¶ 13',
    usageSection: 'Discussion II',
  },
  {
    id: 'novastra',
    caseName: "In re Novastra Grp., Inc. S'holder Litig.",
    cite: '188 A.3d 954 (Del. 2020)',
    pinCite: 'at 963',
    citedFor:
      'The implied covenant does not add sale-process protections the parties declined to bargain for.',
    treatment: 'good',
    treatmentNote: 'No negative citing references.',
    depth: 3,
    verifiedBy: {name: 'Ruth Vega', date: 'Jul 15'},
    usagePara: '¶ 14',
    usageSection: 'Discussion II',
  },
  {
    id: 'ferris-lane',
    caseName: 'Ferris Lane Capital LLC v. Quen Dynamics Corp.',
    cite: '529 F.3d 77 (2d Cir. 2021)',
    pinCite: 'at 85',
    citedFor:
      'Junior preferred consent rights survive a merger absent express waiver.',
    treatment: 'caution',
    treatmentNote:
      'Applies New York law; persuasive only for a Delaware charter. Two later decisions distinguish it.',
    depth: 2,
    verifiedBy: null,
    usagePara: '¶ 16',
    usageSection: 'Discussion III',
  },
  {
    id: 'marden',
    caseName: 'Marden v. Copley Sq. Ventures LLC',
    cite: '97 N.E.3d 1044 (Mass. App. Ct. 2022)',
    pinCite: 'at 1051',
    citedFor:
      'Minority holders who accept the economic benefits of a financing may be estopped from contesting its sale mechanics.',
    treatment: 'caution',
    treatmentNote:
      'Distinguished on facts in later Massachusetts decisions; arises under an LLC agreement, not a stock charter.',
    depth: 2,
    verifiedBy: null,
    usagePara: '¶ 17',
    usageSection: 'Discussion III',
  },
  {
    id: 'halloran',
    caseName: 'Halloran v. Westbeck Instrument Co.',
    cite: '141 N.E.3d 220 (Mass. 2021)',
    pinCite: 'at 229',
    citedFor:
      'Estoppel by acceptance of benefits requires knowledge of the operative sale terms.',
    treatment: 'good',
    treatmentNote: 'No negative citing references.',
    depth: 2,
    verifiedBy: {name: 'Priya Khanna', date: 'Jul 14'},
    usagePara: '¶ 18',
    usageSection: 'Discussion III',
  },
  {
    id: 'renwick',
    caseName: 'Renwick Data Grp. v. Talvace, Inc.',
    cite: '388 F. Supp. 3d 512 (S.D.N.Y. 2020)',
    pinCite: 'at 520',
    citedFor:
      'Drag-along notices must afford non-signing holders a reasonable opportunity to object.',
    treatment: 'unverifiable',
    treatmentNote:
      'Quoted language not found at the cited page. Casewright retracted the quotation from the draft on Jul 15 (see the research session log); human confirmation pending.',
    depth: 1,
    verifiedBy: null,
    usagePara: '¶ 19',
    usageSection: 'Discussion III',
  },
  {
    id: 'pryce',
    caseName: 'Pryce Holdings Ltd. v. Ambervale Tech., Inc.',
    cite: '356 F. Supp. 3d 289 (S.D.N.Y. 2019)',
    pinCite: 'at 301',
    citedFor:
      'Ten days’ written notice of a drag-along sale satisfies commercially reasonable notice.',
    treatment: 'caution',
    treatmentNote:
      'Later S.D.N.Y. decisions question its reading of the notice requirement.',
    depth: 2,
    verifiedBy: null,
    usagePara: '¶ 20',
    usageSection: 'Discussion III',
  },
];

// --- Negative-treatment detail (the Ostrower expanded row) ----------------

interface CitingReference {
  caseName: string;
  cite: string;
  treatmentChip: string;
  note: string;
}

const OSTROWER_CITING_REFS: CitingReference[] = [
  {
    caseName: 'Sable Crest Partners, L.P. v. Windrow Sys., Inc.',
    cite: '268 A.3d 512, 524 (Del. 2023)',
    treatmentChip: 'Overruled in part',
    note:
      'Rejected Ostrower’s per-se rule: a charter drag-along binds a non-signing holder only where the series consented to the amendment adopting it.',
  },
  {
    caseName: "In re Traverse Point Media S'holder Litig.",
    cite: '275 A.3d 96, 108 (Del. Ch. 2024)',
    treatmentChip: 'Declined to follow',
    note:
      'Limited Ostrower to holders who executed the voting agreement; declined to extend it to later-issued junior preferred.',
  },
];

// Quote comparison — the memo characterizes the holding more broadly than
// the cited passage supports; the mismatch flag says so plainly.
const OSTROWER_MEMO_CHARACTERIZATION =
  '“Ostrower squarely holds that a charter-level drag-along binds every preferred holder, signing or not, and Delaware courts have applied it without qualification.”';
const OSTROWER_ACTUAL_HOLDING =
  '“We hold that the drag-along covenant is enforceable against the holders who executed the 2013 voting agreement. Whether a holder that never signed may be compelled on a consent theory is a question we need not reach today.”';
const OSTROWER_MISMATCH_NOTE =
  'Broader than the holding — the cited passage expressly reserves the non-signing-holder question the memo relies on it for.';

interface ReplacementAlt {
  caseName: string;
  cite: string;
  relevance: string;
  depthLabel: string;
}

const OSTROWER_REPLACEMENTS: ReplacementAlt[] = [
  {
    caseName: 'Sable Crest Partners, L.P. v. Windrow Sys., Inc.',
    cite: '268 A.3d 512 (Del. 2023)',
    relevance:
      'Controlling post-2023 authority; adopts the consent-based framework Discussion II already tracks.',
    depthLabel: 'Directly on point',
  },
  {
    caseName: 'Harmon Verge Capital, L.P. v. Alderos Labs, Inc.',
    cite: '301 A.3d 74 (Del. Ch. 2024)',
    relevance:
      'Applies Sable Crest to later-issued junior preferred on facts closest to the Kestrel Series C stack.',
    depthLabel: 'Strong support',
  },
];

// --- Derived summary counts — computed from the fixture so the strip can
// never drift from the table (fixture-realism rule §4). -------------------

const countByTreatment = (treatment: Treatment): number =>
  CITATIONS.filter(row => row.treatment === treatment).length;

const SUMMARY = {
  total: CITATIONS.length,
  good: countByTreatment('good'),
  caution: countByTreatment('caution'),
  negative: countByTreatment('negative'),
  unverifiable: countByTreatment('unverifiable'),
  humanVerified: CITATIONS.filter(row => row.verifiedBy !== null).length,
  aiOnly: CITATIONS.filter(row => row.verifiedBy === null).length,
};

// Toggle column + 6 data columns; the detail cell spans whichever set is
// visible at the current breakpoint (see the responsive contract).
const COLUMN_COUNT_FULL = 7;
const COLUMN_COUNT_NARROW = 5; // Depth + Usage hidden
const COLUMN_COUNT_COMPACT = 4; // Cited-for also hidden

// ---------------------------------------------------------------------------
// SMALL PIECES — treatment tokens, depth pips, verified-by, usage links
// ---------------------------------------------------------------------------

/** Legal-format citation: italic case name, then reporter + pin cite. */
function CitationText({
  caseName,
  cite,
  pinCite,
}: {
  caseName: string;
  cite: string;
  pinCite?: string;
}) {
  return (
    <Text type="body" size="sm">
      <span style={styles.caseName}>{caseName}</span>
      <span style={styles.citeText}>
        {', '}
        {cite}
        {pinCite ? \`, \${pinCite}\` : ''}
      </span>
    </Text>
  );
}

/** Treatment badge — glyph + label, one vocabulary everywhere. */
function TreatmentBadge({treatment}: {treatment: Treatment}) {
  const meta = TREATMENT_META[treatment];
  return (
    <span style={styles.noShrink}>
      <Token
        size="sm"
        color={meta.color}
        icon={<Icon icon={meta.icon} size="xsm" color="inherit" />}
        label={meta.label}
      />
    </span>
  );
}

/** Depth-of-support pips (1–4 filled) with an accessible label. */
function DepthPips({depth}: {depth: number}) {
  const label = DEPTH_LABEL[depth];
  return (
    <Tooltip content={\`Depth of support: \${depth} of 4 — \${label}\`}>
      <span
        style={styles.pipRow}
        role="img"
        aria-label={\`Depth of support: \${depth} of 4 — \${label}\`}>
        {[1, 2, 3, 4].map(step => (
          <span
            key={step}
            style={
              step <= depth ? {...styles.pip, ...styles.pipFilled} : styles.pip
            }
            aria-hidden
          />
        ))}
      </span>
    </Tooltip>
  );
}

/** Verified-by cell: checker Avatar + provenance, or the amber AI-only chip.
 *  AI output never self-verifies — the chip is a warning, not a check. */
function VerifiedByCell({verifiedBy}: {verifiedBy: Verification | null}) {
  if (verifiedBy === null) {
    return (
      <span style={styles.noShrink}>
        <Token
          size="sm"
          color="yellow"
          icon={<Icon icon={SparklesIcon} size="xsm" color="inherit" />}
          label="AI only"
        />
      </span>
    );
  }
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={verifiedBy.name} size="xsmall" />
      <VStack gap={0}>
        <Text type="supporting" size="sm" maxLines={1}>
          {verifiedBy.name}
        </Text>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          Verified · {verifiedBy.date}
        </Text>
      </VStack>
    </HStack>
  );
}

/** Jump-to-usage link — points at the memo paragraph the citation supports. */
function UsageLink({row}: {row: CitationRow}) {
  return (
    <Link
      onClick={() => {}}
      aria-label={\`Jump to \${row.usagePara}, \${row.usageSection}, in the memo\`}>
      <HStack gap={1} vAlign="center">
        {/* nowrap: the label must never break between ¶ and section. */}
        <Text
          type="supporting"
          size="sm"
          hasTabularNumbers
          style={{whiteSpace: 'nowrap'}}>
          {row.usagePara} · {row.usageSection}
        </Text>
        <Icon icon={ArrowUpRightIcon} size="xsm" color="inherit" />
      </HStack>
    </Link>
  );
}

/** Privilege strip — persistent, per the suite trust patterns. */
function PrivilegeStrip() {
  return (
    <div style={styles.privilegeStrip}>
      <Icon icon={LockIcon} size="xsm" color="secondary" />
      <Text type="supporting" size="xsm" color="secondary">
        Attorney-Client Privileged · Attorney Work Product — do not forward
      </Text>
      <span style={{flex: 1}} aria-hidden />
      <Text type="supporting" size="xsm" color="secondary">
        Access limited to the M-2417 matter team
      </Text>
    </div>
  );
}

/** Shared AI-disclosure line — one treatment across the Legal AI suite. */
function DisclosureLine() {
  return (
    <span style={styles.disclosure}>
      <Icon icon={SparklesIcon} size="xsm" color="inherit" />
      <Text type="supporting" size="xsm" color="secondary">
        AI-generated · verify before relying
      </Text>
    </span>
  );
}

// ---------------------------------------------------------------------------
// DETAIL REGION — every row expands; the negative row adds treatment detail
// ---------------------------------------------------------------------------

/** Citing-references list — the two negative-treatment entries. */
function CitingReferencesList() {
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <Icon icon={GavelIcon} size="sm" color="secondary" />
        <Text type="label" size="sm">
          Negative citing references ({OSTROWER_CITING_REFS.length})
        </Text>
      </HStack>
      <VStack gap={0}>
        {OSTROWER_CITING_REFS.map((ref, index) => (
          <div key={ref.caseName}>
            {index > 0 ? <Divider /> : null}
            <div style={styles.citingRefRow}>
              <span style={styles.noShrink}>
                <Token size="sm" color="red" label={ref.treatmentChip} />
              </span>
              <StackItem size="fill" style={{minWidth: 0}}>
                <VStack gap={1}>
                  <CitationText caseName={ref.caseName} cite={ref.cite} />
                  <Text type="supporting" size="sm" color="secondary">
                    {ref.note}
                  </Text>
                </VStack>
              </StackItem>
            </div>
          </div>
        ))}
      </VStack>
    </VStack>
  );
}

/** Memo characterization vs actual holding, with the mismatch flag. */
function QuoteComparison({isCompact}: {isCompact: boolean}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Icon icon={QuoteIcon} size="sm" color="secondary" />
        <Text type="label" size="sm">
          Quote comparison
        </Text>
      </HStack>
      <div
        style={
          isCompact
            ? {...styles.quoteColumns, flexDirection: 'column'}
            : styles.quoteColumns
        }>
        <div style={styles.quoteColumn}>
          <Text type="supporting" size="xsm" color="secondary">
            Memo’s characterization · ¶ 11
          </Text>
          <div style={{...styles.quoteBlock, ...styles.quoteBlockMismatch}}>
            {OSTROWER_MEMO_CHARACTERIZATION}
          </div>
        </div>
        <div style={styles.quoteColumn}>
          <Text type="supporting" size="xsm" color="secondary">
            Actual holding · Ostrower, 118 A.3d at 652
          </Text>
          <div style={styles.quoteBlock}>{OSTROWER_ACTUAL_HOLDING}</div>
        </div>
      </div>
      <div style={styles.mismatchFlag}>
        <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
        <Text type="supporting" size="sm" color="inherit">
          {OSTROWER_MISMATCH_NOTE}
        </Text>
      </div>
    </VStack>
  );
}

/** Casewright replace-suggestion Card for the negatively-treated authority.
 *  Replacement is an edit to a privileged draft — confirm-gated, and the
 *  result routes to a human reviewer rather than self-applying. */
function ReplaceSuggestionCard({
  isQueued,
  onReplace,
}: {
  isQueued: boolean;
  onReplace: () => void;
}) {
  return (
    <Card>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={ReplaceIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label" size="sm">
              Casewright suggests replacing this authority
            </Text>
          </StackItem>
          <span style={styles.noShrink}>
            <Token size="sm" color="green" label="High confidence" />
          </span>
        </HStack>
        <Text type="supporting" size="sm" color="secondary">
          Discussion II already tracks the consent-based framework, so either
          replacement supports ¶ 11 without re-drafting the surrounding
          analysis.
        </Text>
        <VStack gap={2}>
          {OSTROWER_REPLACEMENTS.map(alt => (
            <div key={alt.caseName} style={styles.replaceAlt}>
              <VStack gap={1}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <StackItem size="fill" style={{minWidth: 0}}>
                    <CitationText caseName={alt.caseName} cite={alt.cite} />
                  </StackItem>
                  <span style={styles.noShrink}>
                    <Token size="sm" color="default" label={alt.depthLabel} />
                  </span>
                </HStack>
                <Text type="supporting" size="sm" color="secondary">
                  {alt.relevance}
                </Text>
              </VStack>
            </div>
          ))}
        </VStack>
        <HStack gap={2} vAlign="center" wrap="wrap">
          {isQueued ? (
            <HStack gap={2} vAlign="center">
              <StatusDot variant="success" label="Replacement queued" />
              <Text type="supporting" size="sm" color="secondary">
                Replacement queued · routed to Priya Khanna for review
              </Text>
            </HStack>
          ) : (
            <Button
              label="Replace citation…"
              size="sm"
              variant="secondary"
              icon={<Icon icon={ReplaceIcon} size="sm" />}
              onClick={onReplace}
            />
          )}
          <StackItem size="fill" />
          <DisclosureLine />
        </HStack>
      </VStack>
    </Card>
  );
}

/** Full-span detail region rendered beneath an expanded citation row.
 *  Every row gets the base detail (treatment note, cited-for quote,
 *  provenance, depth, usage — the responsive resurfacing home for hidden
 *  columns); the negative row adds citing references, the quote
 *  comparison, and the replace-suggestion Card. */
function CitationDetailRow({
  row,
  colSpan,
  isCompact,
  isReplaceQueued,
  onReplace,
}: {
  row: CitationRow;
  colSpan: number;
  isCompact: boolean;
  isReplaceQueued: boolean;
  onReplace: () => void;
}) {
  const isNegative = row.treatment === 'negative';
  return (
    <TableRow id={\`citation-detail-\${row.id}\`}>
      <TableCell colSpan={colSpan} style={styles.detailCell}>
        <div style={isCompact ? styles.detailBodyCompact : styles.detailBody}>
          <VStack gap={4}>
            <VStack gap={1}>
              <Text type="label" size="sm">
                Treatment
              </Text>
              <Text type="supporting" size="sm" color="secondary">
                {row.treatmentNote}
              </Text>
            </VStack>
            <VStack gap={1}>
              <Text type="label" size="sm">
                Cited for · {row.usagePara} — {row.usageSection}
              </Text>
              {/* Quoted memo prose — serif per the quoted-passage idiom. */}
              <div style={styles.quoteBlock}>“{row.citedFor}”</div>
            </VStack>
            <HStack gap={4} vAlign="center" wrap="wrap">
              <HStack gap={2} vAlign="center">
                <Text type="supporting" size="xsm" color="secondary">
                  Depth of support
                </Text>
                <DepthPips depth={row.depth} />
                <Text type="supporting" size="sm">
                  {DEPTH_LABEL[row.depth]}
                </Text>
              </HStack>
              <HStack gap={2} vAlign="center">
                <Text type="supporting" size="xsm" color="secondary">
                  Verification
                </Text>
                {row.verifiedBy ? (
                  <VerifiedByCell verifiedBy={row.verifiedBy} />
                ) : (
                  <HStack gap={2} vAlign="center">
                    <VerifiedByCell verifiedBy={null} />
                    <Text type="supporting" size="xsm" color="secondary">
                      Not yet checked by a person
                    </Text>
                  </HStack>
                )}
              </HStack>
              <UsageLink row={row} />
            </HStack>
            {isNegative ? (
              <VStack gap={4}>
                <Divider />
                <CitingReferencesList />
                <QuoteComparison isCompact={isCompact} />
                <ReplaceSuggestionCard
                  isQueued={isReplaceQueued}
                  onReplace={onReplace}
                />
              </VStack>
            ) : null}
          </VStack>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

/** Summary strip — counts computed from the fixture (they can never drift
 *  from the table rows). */
function SummaryStrip() {
  return (
    <div style={styles.summaryStrip}>
      <div style={styles.summaryCount}>
        <Heading level={2}>{SUMMARY.total}</Heading>
        <Text type="supporting" size="sm" color="secondary">
          citations checked
        </Text>
      </div>
      <div style={styles.chipRow}>
        <Token
          size="sm"
          color="green"
          icon={<Icon icon={CircleCheckIcon} size="xsm" color="inherit" />}
          label={\`\${SUMMARY.good} good law\`}
        />
        <Token
          size="sm"
          color="yellow"
          icon={<Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />}
          label={\`\${SUMMARY.caution} caution\`}
        />
        <Token
          size="sm"
          color="red"
          icon={<Icon icon={OctagonXIcon} size="xsm" color="inherit" />}
          label={\`\${SUMMARY.negative} negative treatment\`}
        />
        <Token
          size="sm"
          color="red"
          icon={<Icon icon={FlagIcon} size="xsm" color="inherit" />}
          label={\`\${SUMMARY.unverifiable} unverifiable\`}
        />
      </div>
      <StackItem size="fill" />
      <HStack gap={2} vAlign="center" style={styles.noShrink}>
        <Icon icon={CircleDashedIcon} size="xsm" color="secondary" />
        <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
          {SUMMARY.humanVerified} human-verified · {SUMMARY.aiOnly} AI only
        </Text>
      </HStack>
    </div>
  );
}

export default function CitationsAuthorityCheckerTemplate() {
  // The negatively-treated Ostrower row ships expanded so the treatment
  // detail, quote comparison, and replace card are visible without
  // interaction. Toggling clones the Set so React sees a new reference.
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(['ostrower']),
  );
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [isReplaceQueued, setIsReplaceQueued] = useState(false);
  const [isRerunQueued, setIsRerunQueued] = useState(false);

  const isNarrow = useMediaQuery('(max-width: 1100px)');
  const isCompact = useMediaQuery('(max-width: 760px)');
  const colSpan = isCompact
    ? COLUMN_COUNT_COMPACT
    : isNarrow
      ? COLUMN_COUNT_NARROW
      : COLUMN_COUNT_FULL;

  const toggleRow = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider padding={0}>
            <VStack gap={0}>
              <PrivilegeStrip />
              <div style={styles.headerBlock}>
                <HStack gap={3} vAlign="center" wrap="wrap">
                  <span style={styles.titleGlyph} aria-hidden>
                    <Icon icon={ScaleIcon} size="md" color="inherit" />
                  </span>
                  {/* flexBasis 0 — StackItem fill resolves to \`1 1 auto\`,
                      and the memo line's content width would otherwise push
                      the Re-run block onto its own wrapped row. */}
                  <StackItem size="fill" style={{minWidth: 240, flexBasis: 0}}>
                    <VStack gap={1}>
                      <HStack gap={2} vAlign="center" wrap="wrap">
                        <Heading level={1}>
                          Citation &amp; Authority Checker
                        </Heading>
                        <DisclosureLine />
                      </HStack>
                      <div style={styles.chipRow}>
                        <Token
                          size="sm"
                          color="default"
                          label="M-2417 · Kestrel Labs — Series C Financing"
                        />
                        <Text
                          type="supporting"
                          size="xsm"
                          color="secondary"
                          maxLines={1}>
                          {MEMO_TITLE} · Casewright draft memo
                        </Text>
                      </div>
                    </VStack>
                  </StackItem>
                  <VStack gap={1} hAlign="end" style={styles.noShrink}>
                    <Button
                      label="Re-run check"
                      size="sm"
                      variant="secondary"
                      icon={<Icon icon={RefreshCwIcon} size="sm" />}
                      isDisabled={isRerunQueued}
                      onClick={() => setIsRerunQueued(true)}
                    />
                    {isRerunQueued ? (
                      <HStack gap={1} vAlign="center">
                        <StatusDot
                          variant="warning"
                          label="Re-check queued"
                        />
                        <Text
                          type="supporting"
                          size="xsm"
                          color="secondary">
                          Queued · runs against the authority database
                        </Text>
                      </HStack>
                    ) : (
                      <Text
                        type="supporting"
                        size="xsm"
                        color="secondary"
                        style={styles.lastRun}>
                        Last check · {LAST_RUN}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </div>
              <Divider />
              <SummaryStrip />
            </VStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div style={styles.tableScroll}>
                <Table<Record<string, unknown>>
                  density="balanced"
                  dividers="rows">
                  <TableHeader>
                    <TableRow isHeaderRow>
                      {/* Leading toggle column has no header label. */}
                      <TableHeaderCell style={styles.toggleHeader} />
                      <TableHeaderCell style={styles.citationHeader}>
                        Citation
                      </TableHeaderCell>
                      {!isCompact ? (
                        <TableHeaderCell style={styles.citedForHeader}>
                          Cited for
                        </TableHeaderCell>
                      ) : null}
                      {/* 165 = widest badge ("Negative treatment", 139px)
                          plus the 24px cell padding — narrower truncates
                          the Token label. */}
                      <TableHeaderCell style={{width: 165, minWidth: 165}}>
                        Treatment
                      </TableHeaderCell>
                      {!isNarrow ? (
                        <TableHeaderCell style={{width: 80, minWidth: 80}}>
                          Depth
                        </TableHeaderCell>
                      ) : null}
                      <TableHeaderCell style={{width: 145, minWidth: 145}}>
                        Verified by
                      </TableHeaderCell>
                      {!isNarrow ? (
                        <TableHeaderCell style={{width: 150, minWidth: 150}}>
                          Usage
                        </TableHeaderCell>
                      ) : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CITATIONS.map(row => {
                      const isExpanded = expandedIds.has(row.id);
                      return [
                        <TableRow key={row.id}>
                          <TableCell>
                            <IconButton
                              label={
                                isExpanded
                                  ? \`Collapse treatment detail for \${row.caseName}\`
                                  : \`Expand treatment detail for \${row.caseName}\`
                              }
                              icon={
                                <Icon
                                  icon={
                                    isExpanded
                                      ? ChevronDownIcon
                                      : ChevronRightIcon
                                  }
                                  size="sm"
                                />
                              }
                              variant="ghost"
                              size="sm"
                              aria-expanded={isExpanded}
                              aria-controls={
                                isExpanded
                                  ? \`citation-detail-\${row.id}\`
                                  : undefined
                              }
                              onClick={() => toggleRow(row.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <CitationText
                              caseName={row.caseName}
                              cite={row.cite}
                              pinCite={row.pinCite}
                            />
                          </TableCell>
                          {!isCompact ? (
                            <TableCell>
                              <Text
                                type="supporting"
                                size="sm"
                                color="secondary"
                                maxLines={2}>
                                “{row.citedFor}”
                              </Text>
                            </TableCell>
                          ) : null}
                          <TableCell>
                            <TreatmentBadge treatment={row.treatment} />
                          </TableCell>
                          {!isNarrow ? (
                            <TableCell>
                              <DepthPips depth={row.depth} />
                            </TableCell>
                          ) : null}
                          <TableCell>
                            <VerifiedByCell verifiedBy={row.verifiedBy} />
                          </TableCell>
                          {!isNarrow ? (
                            <TableCell>
                              <UsageLink row={row} />
                            </TableCell>
                          ) : null}
                        </TableRow>,
                        isExpanded ? (
                          <CitationDetailRow
                            key={\`\${row.id}-detail\`}
                            row={row}
                            colSpan={colSpan}
                            isCompact={isCompact}
                            isReplaceQueued={isReplaceQueued}
                            onReplace={() => setIsReplaceDialogOpen(true)}
                          />
                        ) : null,
                      ];
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </LayoutContent>
        }
      />
      <AlertDialog
        isOpen={isReplaceDialogOpen}
        onOpenChange={setIsReplaceDialogOpen}
        title="Replace Ostrower in the draft memo?"
        description="Casewright will swap the ¶ 11 citation for Sable Crest Partners, L.P. v. Windrow Sys., Inc., re-draft the supporting sentence, and route the change to Priya Khanna for review. Nothing is served or shared until she approves."
        actionLabel="Replace and route for review"
        cancelLabel="Keep Ostrower"
        onAction={() => {
          setIsReplaceQueued(true);
          setIsReplaceDialogOpen(false);
        }}
      />
    </div>
  );
}
`;export{e as default};