var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one Casewright research memo for
 *   M-2417 · "Kestrel Labs — Series C Financing": Question Presented,
 *   Brief Answer, and a three-part Discussion authored as text/citation
 *   segment runs; 9 inline authority citations across 6 FICTIONAL
 *   authorities — Hollis, Calder Point, Renwick, Quillan, Marden,
 *   Tallgrass — each with a treatment (good law / caution), pin cites,
 *   and a verification record (7 verified by Ruth Vega / Priya Khanna
 *   with fixed Jul 14–15 2026 provenance, 2 not yet checked); one
 *   low-confidence Discussion section with a fixed reviewer note from
 *   Priya Khanna). No clocks, no Math.random, no network assets; all
 *   cases are invented but plausibly formatted.
 * @output AI Research Memo — the generated-memo reading & verification
 *   surface for Casewright at Marlow & Voss LLP: a privilege strip and a
 *   toolbar header (memo title + matter Token + "AI-generated · verify
 *   before relying" disclosure + a Draft → Cite-checked → Reviewed
 *   status stepper pinned at Cite-checked + a citation meter
 *   "9 citations · 7 verified · 2 unverified" + Export/Share actions
 *   gated behind an "unreviewed sections remain" Tooltip note), a WIDE
 *   light-locked serif memo canvas (MEMORANDUM head block — TO Julian
 *   Voss / FROM Casewright AI · reviewed by Priya Khanna / RE the
 *   question presented — then Question Presented, Brief Answer, and
 *   Discussion I–III as static editorial prose) where every authority
 *   citation renders as an inline chip with a treatment glyph (good-law
 *   green / caution amber) and Discussion III carries a "Low confidence
 *   — thin authority" amber wash, a margin verification rail aligned
 *   block-by-block to the citations (verify state + checker Avatar +
 *   provenance, amber entries expose a Verify action, plus Priya's
 *   reviewer note beside the flagged section), and a right 320px
 *   Sources panel listing the 6 authorities with treatment badges,
 *   pin-cite chips, and cited-count Tokens. Clicking a citation chip
 *   selects its margin entry and its source card and vice versa;
 *   verifying an amber entry updates the meter, the margin, and the
 *   export-gate note in lockstep.
 * @position Page template; emitted by \`astryx template legal-research-memo\`.
 *   The memo body is a STATIC styled preview by design (live-editor
 *   collision rule) — no caret, no editing chrome; all interactivity
 *   lives in the chrome (margin rail, sources panel, header meter and
 *   gated actions).
 *
 * Frame: root div 100dvh (flex column) — privilege strip, then Layout
 * height="fill". LayoutHeader carries the memo toolbar (title + matter
 * Token + disclosure + stepper + meter + gated Export/Share).
 * LayoutContent (padding 0) is a muted backdrop scrolling a centered
 * 1080px-max composition: a CSS grid of memo blocks, column 1 the
 * continuous paper sheet (rowGap 0, per-cell borders, first/last cells
 * carry the sheet radii), column 2 the 264px margin verification rail
 * whose entries top-align to their block. LayoutPanel end 320 hosts the
 * Sources panel (pinned header + scrolling authority rows).
 *
 * Responsive contract:
 * - >1280px: header | memo grid (paper + 264 margin) | sources 320.
 *   Only the backdrop and the sources list scroll internally.
 * - <=1280px: the Sources panel leaves the right edge and stacks below
 *   the memo as a full-width section; the page scrolls as one column.
 * - <=980px: the margin column collapses — the sheet splits into
 *   per-block slabs and each block's verification entries render as a
 *   full-width chrome strip directly beneath it, so citation ↔ entry
 *   adjacency survives.
 * - <=640px: the header drops the meter and stepper date sublabels,
 *   action buttons wrap onto their own row (wrap="wrap" everywhere —
 *   nothing clips at 375px), and paper padding tightens via clamp().
 *
 * Container policy (paper-canvas + margin-rail archetype): page chrome
 * is frame-first rows and panels — sources are styled rows, margin
 * entries are styled rows, the reviewer note is a styled tinted block;
 * no design-system Cards on this surface (nothing here is a dashboard
 * summary widget).
 *
 * Color policy: the memo sheet is deliberately scheme-locked light
 * (colorScheme:'light') so the memo reads as printed paper in both
 * schemes — PAPER_* literals, the citation-chip washes, and the
 * low-confidence amber wash stay raw hex on that locked surface.
 * Good-law/verified green and caution/unverified amber are light-dark()
 * pairs: on locked paper they resolve to their light halves; on app
 * chrome (margin entries, source badges, meter) they brighten for dark
 * backgrounds. The single product accent is the Casewright AI purple
 * (var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF)))
 * used for the sparkle disclosure and the current stepper step;
 * selection rings ride var(--color-accent). Everything else is
 * token-pure.
 */

import {Fragment, useState, type CSSProperties, type ReactNode} from 'react';

import {
  CheckIcon,
  CircleDashedIcon,
  DownloadIcon,
  LockIcon,
  ScaleIcon,
  Share2Icon,
  ShieldIcon,
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
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= PAINT CONSTANTS =============
// Scheme-locked paper (see Color policy): literals only on the sheet.

const PAPER_BG = '#FFFFFF';
const PAPER_TEXT = '#1F2A37';
const PAPER_MUTED = '#6B7280';
const PAPER_RULE = '#E5E7EB';
const SERIF = "Georgia, 'Times New Roman', Times, serif";

// Treatment / verification inks — pairs brighten on dark app chrome and
// resolve to their light halves on the locked paper.
const GOOD_INK = 'light-dark(#0B7A2B, #4ADE80)';
const CAUTION_INK = 'light-dark(#B45309, #FBBF24)';
const FLAG_WASH = '#FDF3D0'; // paper-only literal (low-confidence wash)
const FLAG_EDGE = '#D4A72C'; // paper-only literal (wash left rule)
const CHIP_GOOD_BG = '#E4F5E8'; // paper-only literal (chip wash)
const CHIP_CAUTION_BG = '#FBEFD4'; // paper-only literal (chip wash)
const AI_PURPLE = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {
    height: '100dvh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  layoutSlot: {flex: 1, minHeight: 0},
  fill: {height: '100%', minHeight: 0},
  // Persistent privilege strip — chrome, token-tinted, never dismissible.
  privilegeStrip: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-3)',
    backgroundColor: 'light-dark(#FBE8EA, #451A1E)',
    color: 'light-dark(#8A1C28, #F4A9B0)',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.02em',
    textAlign: 'center',
  },
  // Header stepper: Draft -> Cite-checked -> Reviewed.
  stepper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
    backgroundColor: 'var(--color-background-surface)',
  },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepConnector: {
    width: 20,
    height: 1,
    backgroundColor: 'var(--color-border)',
    flexShrink: 0,
  },
  stepLabel: {fontSize: 12, whiteSpace: 'nowrap'},
  meterRow: {whiteSpace: 'nowrap'},
  // Export-blocked note (appears when a gated action is clicked).
  blockedNote: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
    borderRadius: 'var(--radius-container)',
    border: \`var(--border-width) solid \${CAUTION_INK}\`,
    backgroundColor: 'light-dark(#FBEFD4, #3B2F12)',
    color: CAUTION_INK,
    fontSize: 12,
  },
  // Muted backdrop scrolls; the memo composition centers inside it.
  backdrop: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  composition: {width: '100%', maxWidth: 1080, marginInline: 'auto'},
  // WIDE memo grid: continuous paper column + 264px margin rail.
  memoGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 264px',
    columnGap: 'var(--spacing-4)',
    rowGap: 0,
    alignItems: 'stretch',
  },
  memoGridStacked: {display: 'flex', flexDirection: 'column', gap: 0},
  // Paper cells: the sheet is built from per-block cells with rowGap 0;
  // first/last cells carry the sheet radii (see paperCellFirst/Last).
  paperCell: {
    backgroundColor: PAPER_BG,
    color: PAPER_TEXT,
    colorScheme: 'light',
    borderInline: \`1px solid \${PAPER_RULE}\`,
    // Percentage (not vw) so the gutter scales with the paper cell itself:
    // narrow preview panes keep a readable prose measure, wide windows get
    // the full document gutter.
    paddingInline: 'clamp(24px, 9%, 56px)',
  },
  paperCellFirst: {
    borderTop: \`1px solid \${PAPER_RULE}\`,
    borderTopLeftRadius: 'var(--radius-container)',
    borderTopRightRadius: 'var(--radius-container)',
    paddingTop: 'clamp(24px, 5vw, 48px)',
  },
  paperCellLast: {
    borderBottom: \`1px solid \${PAPER_RULE}\`,
    borderBottomLeftRadius: 'var(--radius-container)',
    borderBottomRightRadius: 'var(--radius-container)',
    paddingBottom: 'clamp(24px, 5vw, 48px)',
    marginBottom: 'var(--spacing-4)',
  },
  // <=980px slab mode: every block is its own bordered slab and the
  // margin entries strip beneath it (adjacency survives the collapse).
  paperSlab: {
    border: \`1px solid \${PAPER_RULE}\`,
    borderRadius: 'var(--radius-container)',
    paddingTop: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
  },
  marginCell: {paddingBottom: 'var(--spacing-4)', minWidth: 0},
  marginCellStacked: {
    paddingBlock: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  marginGroupLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-1)',
  },
  // Margin verification entries: chrome rows, not Cards.
  marginEntry: {
    width: '100%',
    textAlign: 'start',
    font: 'inherit',
    cursor: 'pointer',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    color: 'var(--color-text-primary)',
  },
  marginEntryActive: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  marginEntryCite: {
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.4,
    overflowWrap: 'anywhere',
  },
  marginProvenance: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    flexWrap: 'wrap',
  },
  // Reviewer note beside the flagged Discussion III block.
  reviewerNote: {
    border: \`var(--border-width) solid \${CAUTION_INK}\`,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'light-dark(#FBEFD4, #3B2F12)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  reviewerNoteTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 700,
    color: CAUTION_INK,
  },
  reviewerNoteBody: {fontSize: 12, lineHeight: 1.5},
  // ---- Paper typography (serif document voice; literals only) ----
  memoKicker: {
    fontFamily: SERIF,
    fontSize: 13,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: PAPER_MUTED,
    margin: 0,
  },
  memoTitle: {
    fontFamily: SERIF,
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
    margin: '6px 0 0',
  },
  memoPrivLine: {
    fontFamily: SERIF,
    fontSize: 12.5,
    fontStyle: 'italic',
    color: '#8A1C28',
    margin: '10px 0 0',
  },
  memoHeadTable: {
    margin: '18px 0 0',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    columnGap: 18,
    rowGap: 6,
    fontFamily: SERIF,
    fontSize: 15,
    lineHeight: 1.5,
  },
  memoHeadKey: {
    fontWeight: 700,
    letterSpacing: '0.08em',
    fontSize: 12.5,
    textTransform: 'uppercase',
    color: PAPER_MUTED,
    paddingTop: 2,
    whiteSpace: 'nowrap',
  },
  memoRule: {
    border: 'none',
    borderTop: \`1px solid \${PAPER_RULE}\`,
    margin: '22px 0 0',
  },
  sectionHeading: {
    fontFamily: SERIF,
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: '26px 0 12px',
  },
  subHeading: {
    fontFamily: SERIF,
    fontSize: 16.5,
    fontWeight: 700,
    fontStyle: 'italic',
    margin: '18px 0 10px',
  },
  paragraph: {
    fontFamily: SERIF,
    fontSize: 16.5,
    lineHeight: 1.9,
    margin: '0 0 14px',
    overflowWrap: 'break-word',
  },
  // Low-confidence wash (paper-only literals) around Discussion III prose.
  flagWash: {
    backgroundColor: FLAG_WASH,
    borderLeft: \`3px solid \${FLAG_EDGE}\`,
    borderRadius: 4,
    padding: '10px 14px 2px',
    margin: '0 0 14px',
  },
  flagWashLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#8A5A0B',
    marginBottom: 8,
  },
  // Inline citation chips: real buttons flowing inside serif prose.
  citeChip: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: 5,
    padding: '0 7px',
    border: \`1px solid \${PAPER_RULE}\`,
    borderRadius: 'var(--radius-full)',
    font: 'inherit',
    fontFamily: SERIF,
    fontSize: 14,
    lineHeight: 1.55,
    color: PAPER_TEXT,
    cursor: 'pointer',
    whiteSpace: 'normal',
    verticalAlign: 'baseline',
  },
  citeChipActive: {boxShadow: '0 0 0 2px var(--color-accent)'},
  citeGlyph: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
    alignSelf: 'center',
  },
  // Disclosure footer on the sheet (still paper-locked, so literals).
  paperDisclosure: {
    marginTop: 26,
    paddingTop: 14,
    borderTop: \`1px solid \${PAPER_RULE}\`,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    color: PAPER_MUTED,
    fontSize: 12.5,
    lineHeight: 1.6,
  },
  sparkleChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: AI_PURPLE,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // ---- Sources panel (chrome; rows, not Cards) ----
  sourcesFrame: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  sourcesHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  sourcesScroll: {
    minHeight: 0,
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  sourcesStacked: {
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  sourceRow: {
    width: '100%',
    textAlign: 'start',
    font: 'inherit',
    cursor: 'pointer',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    color: 'var(--color-text-primary)',
  },
  sourceRowActive: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  sourceCaseName: {
    fontStyle: 'italic',
    fontWeight: 600,
    fontSize: 13.5,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  sourceCite: {
    fontSize: 12.5,
    color: 'var(--color-text-secondary)',
    overflowWrap: 'anywhere',
  },
  sourceNote: {
    fontSize: 12,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
  },
  pinChip: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11.5,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    paddingInline: 8,
    paddingBlock: 1,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  treatmentBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
};

// ============= FIXTURES =============
// All authorities are FICTIONAL but plausibly formatted (suite rule).

type Treatment = 'good' | 'caution';

type Authority = {
  id: string;
  caseName: string;
  reporter: string;
  treatment: Treatment;
  treatmentNote: string;
  summary: string;
};

const AUTHORITIES: Authority[] = [
  {
    id: 'quillan',
    caseName: "In re Quillan Holdings S'holder Litig.",
    reporter: '176 A.3d 331 (Del. 2018)',
    treatment: 'good',
    treatmentNote: 'Good law · followed 6× in Chancery',
    summary:
      'Special voting rights must be expressed clearly in the charter and will not be implied; ambiguity resolves against the blocking right.',
  },
  {
    id: 'calder',
    caseName: 'Calder Point Capital, L.P. v. Ostrand Sys., Inc.',
    reporter: '214 A.3d 887 (Del. Ch. 2021)',
    treatment: 'good',
    treatmentNote: 'Good law · no negative history',
    summary:
      'Enforced a 30% retained-ownership condition on preferred protective provisions exactly as written; lapse requires no further corporate act.',
  },
  {
    id: 'tallgrass',
    caseName: 'Tallgrass Analytics, Inc. v. Veery Cap. Partners, L.P.',
    reporter: '301 A.3d 118 (Del. Ch. 2023)',
    treatment: 'good',
    treatmentNote: 'Good law · recent Chancery',
    summary:
      'Ownership thresholds in charter protective provisions are measured as of the record date fixed for the consent, not at issuance.',
  },
  {
    id: 'hollis',
    caseName: 'Hollis v. Merton Indus.',
    reporter: '512 F.3d 204 (2d Cir. 2019)',
    treatment: 'good',
    treatmentNote: 'Good law · persuasive (2d Cir.)',
    summary:
      'A consent solicitation that tracks the operative agreement’s notice mechanics is effective even where holders dispute its commercial wisdom.',
  },
  {
    id: 'renwick',
    caseName: 'Renwick Data Grp. v. Talvace, Inc.',
    reporter: '388 F. Supp. 3d 512 (S.D.N.Y. 2020)',
    treatment: 'caution',
    treatmentNote: 'Caution · criticized in later Chancery dicta',
    summary:
      'Read a lapsed protective provision as surviving for consents solicited before the lapse date; later Delaware dicta declined to follow.',
  },
  {
    id: 'marden',
    caseName: 'Marden v. Copley Sq. Ventures LLC',
    reporter: '97 N.E.3d 1044 (Mass. App. Ct. 2022)',
    treatment: 'caution',
    treatmentNote: 'Caution · out of jurisdiction, intermediate court',
    summary:
      'Declined to use the implied covenant to restore a bargained-away class vote; the only decision squarely addressing the fiduciary backstop.',
  },
];

type VerifyState = 'verified' | 'unverified';

type CitationFixture = {
  id: string;
  authorityId: string;
  /** Short cite string rendered inside the inline chip. */
  label: string;
  pin: string;
  initialState: VerifyState;
  checker?: string;
  checkedOn?: string;
};

const CITATIONS: CitationFixture[] = [
  {id: 'c1', authorityId: 'quillan', label: 'Quillan, 176 A.3d at 340', pin: 'at 340', initialState: 'verified', checker: 'Ruth Vega', checkedOn: 'Jul 14'},
  {id: 'c2', authorityId: 'calder', label: 'Calder Point, 214 A.3d at 894', pin: 'at 894', initialState: 'verified', checker: 'Ruth Vega', checkedOn: 'Jul 14'},
  {id: 'c3', authorityId: 'quillan', label: 'Quillan, 176 A.3d at 344', pin: 'at 344', initialState: 'verified', checker: 'Ruth Vega', checkedOn: 'Jul 14'},
  {id: 'c4', authorityId: 'calder', label: 'Calder Point, 214 A.3d at 894', pin: 'at 894', initialState: 'verified', checker: 'Priya Khanna', checkedOn: 'Jul 15'},
  {id: 'c5', authorityId: 'tallgrass', label: 'Tallgrass, 301 A.3d at 127', pin: 'at 127', initialState: 'verified', checker: 'Ruth Vega', checkedOn: 'Jul 14'},
  {id: 'c6', authorityId: 'hollis', label: 'Hollis, 512 F.3d at 211', pin: 'at 211', initialState: 'verified', checker: 'Priya Khanna', checkedOn: 'Jul 15'},
  {id: 'c7', authorityId: 'calder', label: 'Calder Point, 214 A.3d at 901', pin: 'at 901', initialState: 'verified', checker: 'Ruth Vega', checkedOn: 'Jul 14'},
  {id: 'c8', authorityId: 'renwick', label: 'Renwick, 388 F. Supp. 3d at 519', pin: 'at 519', initialState: 'unverified'},
  {id: 'c9', authorityId: 'marden', label: 'Marden, 97 N.E.3d at 1049', pin: 'at 1049', initialState: 'unverified'},
];

const AUTHORITY_BY_ID = new Map(AUTHORITIES.map(a => [a.id, a]));
const CITATION_BY_ID = new Map(CITATIONS.map(c => [c.id, c]));

// --- Memo body as text/citation segment runs (static preview) ---

type Seg = {t: 'text'; s: string} | {t: 'cite'; id: string};

type Paragraph = {id: string; segs: Seg[]};

type MemoBlock = {
  id: string;
  heading?: string;
  subHeading?: string;
  flagged?: boolean;
  paragraphs: Paragraph[];
  /** Margin-rail annotation for blocks without citations. */
  marginNote?: string;
};

const QUESTION_PRESENTED =
  'Under Delaware law, may the Series C financing close without a separate class vote of Kestrel Labs’ junior preferred stock, where Article IV.C(6) of the charter conditions the junior preferred protective provisions on the holders retaining at least 30% of their originally issued shares and the holders now retain 24.6%?';

const MEMO_BLOCKS: MemoBlock[] = [
  {
    id: 'qp',
    heading: 'Question Presented',
    paragraphs: [{id: 'qp-1', segs: [{t: 'text', s: QUESTION_PRESENTED}]}],
    marginNote: 'Framing only — no authority cited in this section.',
  },
  {
    id: 'ba',
    heading: 'Brief Answer',
    paragraphs: [
      {
        id: 'ba-1',
        segs: [
          {t: 'text', s: 'Probably yes. Delaware courts construe protective provisions strictly and will not imply a blocking right the charter does not clearly express, '},
          {t: 'cite', id: 'c1'},
          {t: 'text', s: ', and the Court of Chancery has enforced a retained-ownership condition materially identical to Article IV.C(6) exactly as written, '},
          {t: 'cite', id: 'c2'},
          {t: 'text', s: '. Because the junior preferred holders collectively retain 24.6% of their originally issued shares — below the 30% floor — the protective provisions have lapsed by their terms, and no separate class vote is required to close the Meridian-led round. The conclusion in Part III, that fiduciary review would not restore the lapsed vote, rests on thinner authority and is flagged accordingly.'},
        ],
      },
    ],
  },
  {
    id: 'd1',
    heading: 'Discussion',
    subHeading: 'I. The protective provisions lapsed by their own terms.',
    paragraphs: [
      {
        id: 'd1-1',
        segs: [
          {t: 'text', s: 'The Delaware Supreme Court requires that special voting rights “be expressed clearly” in the certificate of incorporation and holds that they “will not be implied” from structure or expectation. '},
          {t: 'cite', id: 'c3'},
          {t: 'text', s: '. Article IV.C(6) states the condition without qualification: the junior preferred protective provisions “shall be of no further force or effect” once the holders cease to hold 30% of their originally issued shares. In Calder Point, the Court of Chancery enforced the same mechanic against holders at 27.1%, holding that lapse “requires no further corporate act” and takes effect the moment the threshold is crossed. '},
          {t: 'cite', id: 'c4'},
          {t: 'text', s: '.'},
        ],
      },
      {
        id: 'd1-2',
        segs: [
          {t: 'text', s: 'Measurement timing favors the same result. Tallgrass fixes the measurement date at the record date set for the consent, not at original issuance, '},
          {t: 'cite', id: 'c5'},
          {t: 'text', s: ' — and on the June 30 record date the junior preferred stood at 24.6% after the secondary sales to Meridian Growth Partners. The transfer agent’s certified capitalization table (Disclosure Schedules, Ex. B-4) is the operative proof.'},
        ],
      },
    ],
  },
  {
    id: 'd2',
    subHeading: 'II. The consent mechanics for the related charter amendment were validly run.',
    paragraphs: [
      {
        id: 'd2-1',
        segs: [
          {t: 'text', s: 'The Series C amendment itself proceeds by written consent of the common and senior preferred under the Investor Rights Agreement’s notice mechanics. The Second Circuit has enforced a consent solicitation that tracked the operative agreement’s notice provisions even where holders disputed its commercial wisdom, '},
          {t: 'cite', id: 'c6'},
          {t: 'text', s: ', and Calder Point applies the same contract-first discipline to charter consents. '},
          {t: 'cite', id: 'c7'},
          {t: 'text', s: '.'},
        ],
      },
      {
        id: 'd2-2',
        segs: [
          {t: 'text', s: 'One district court has read a lapsed protective provision as surviving for consents solicited before the lapse date, '},
          {t: 'cite', id: 'c8'},
          {t: 'text', s: ', but later Chancery dicta declined to follow that reading, and the June 30 record date postdates the lapse here in any event. The citation remains to be checked against the slip opinion.'},
        ],
      },
    ],
  },
  {
    id: 'd3',
    subHeading: 'III. Fiduciary review is unlikely to restore the lapsed class vote.',
    flagged: true,
    paragraphs: [
      {
        id: 'd3-1',
        segs: [
          {t: 'text', s: 'The only decision squarely addressing whether the implied covenant or fiduciary principles can revive a bargained-away class vote declined to do so, reasoning that sophisticated preferred investors “purchased precisely the lapse they now protest.” '},
          {t: 'cite', id: 'c9'},
          {t: 'text', s: '. That decision is an intermediate appellate ruling from another jurisdiction; no Delaware court has reached the question on these facts. Kestrel should treat this conclusion as directional rather than settled.'},
        ],
      },
    ],
  },
];

// Reconciled fixture facts: the header meter, margin rail, sources
// panel, and export gate all DERIVE from CITATIONS at render time —
// never restate the counts by hand.
const REVIEWER_NOTE = {
  author: 'Priya Khanna',
  when: 'Jul 15, 4:32 PM',
  title: 'Low confidence — thin authority',
  body: 'Only Marden supports Part III, and it is an out-of-jurisdiction intermediate decision. Recommend hedging the Brief Answer’s last sentence and pulling a Chancery docket search before this goes to Julian.',
};

// ============= HELPERS & SUBCOMPONENTS =============

const TREATMENT_INK: Record<Treatment, string> = {
  good: GOOD_INK,
  caution: CAUTION_INK,
};

const TREATMENT_CHIP_BG: Record<Treatment, string> = {
  good: CHIP_GOOD_BG,
  caution: CHIP_CAUTION_BG,
};

/** Small treatment badge used in the sources panel. */
function TreatmentBadge({treatment}: {treatment: Treatment}) {
  return (
    <span
      style={{...styles.treatmentBadge, color: TREATMENT_INK[treatment]}}>
      <Icon
        icon={treatment === 'good' ? CheckIcon : TriangleAlertIcon}
        size="xsm"
        color="inherit"
      />
      {treatment === 'good' ? 'Good law' : 'Caution'}
    </span>
  );
}

/** Draft -> Cite-checked -> Reviewed status stepper (pinned state). */
function ReviewStepper({showDates}: {showDates: boolean}) {
  const steps = [
    {id: 'draft', label: 'Draft', sub: 'Jul 14', state: 'done' as const},
    {id: 'cite', label: 'Cite-checked', sub: 'Jul 15', state: 'current' as const},
    {id: 'rev', label: 'Reviewed', sub: 'P. Khanna', state: 'todo' as const},
  ];
  return (
    <div style={styles.stepper} aria-label="Review status: cite-checked">
      {steps.map((step, i) => (
        <HStack key={step.id} gap={2} vAlign="center">
          {i > 0 ? <span style={styles.stepConnector} /> : null}
          <span
            style={{
              ...styles.stepDot,
              backgroundColor:
                step.state === 'done'
                  ? GOOD_INK
                  : step.state === 'current'
                    ? AI_PURPLE
                    : 'transparent',
              border:
                step.state === 'todo'
                  ? 'var(--border-width) solid var(--color-border)'
                  : 'none',
              color: 'light-dark(#FFFFFF, #101014)',
            }}>
            {step.state === 'done' ? (
              <Icon icon={CheckIcon} size="xsm" color="inherit" />
            ) : step.state === 'current' ? (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'light-dark(#FFFFFF, #101014)',
                }}
              />
            ) : null}
          </span>
          <span style={styles.stepLabel}>
            <Text
              type="supporting"
              weight={step.state === 'current' ? 'bold' : 'normal'}
              color={step.state === 'todo' ? 'secondary' : 'primary'}>
              {step.label}
            </Text>
            {showDates ? (
              <Text type="supporting" color="secondary">
                {' · '}
                {step.sub}
              </Text>
            ) : null}
          </span>
        </HStack>
      ))}
    </div>
  );
}

/** Inline citation chip flowing inside the serif prose (paper-locked). */
function CiteChip({
  citation,
  isActive,
  onSelect,
}: {
  citation: CitationFixture;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  const authority = AUTHORITY_BY_ID.get(citation.authorityId);
  if (!authority) {
    return null;
  }
  return (
    <Tooltip
      content={\`\${authority.caseName}, \${authority.reporter} — \${authority.treatmentNote}\`}>
      <button
        type="button"
        onClick={() => onSelect(citation.id)}
        aria-label={\`Citation: \${citation.label} (\${
          authority.treatment === 'good' ? 'good law' : 'caution'
        })\`}
        style={{
          ...styles.citeChip,
          backgroundColor: TREATMENT_CHIP_BG[authority.treatment],
          ...(isActive ? styles.citeChipActive : null),
        }}>
        <span
          style={{
            ...styles.citeGlyph,
            backgroundColor: TREATMENT_INK[authority.treatment],
          }}
        />
        <span style={{fontStyle: 'italic'}}>{citation.label}</span>
      </button>
    </Tooltip>
  );
}

type VerifyRecord = {
  state: VerifyState;
  checker?: string;
  checkedOn?: string;
};

/** One margin-rail verification entry, aligned to its memo block. */
function MarginEntry({
  citation,
  record,
  isActive,
  onSelect,
  onVerify,
}: {
  citation: CitationFixture;
  record: VerifyRecord;
  isActive: boolean;
  onSelect: (id: string) => void;
  onVerify: (id: string) => void;
}) {
  const authority = AUTHORITY_BY_ID.get(citation.authorityId);
  if (!authority) {
    return null;
  }
  const verified = record.state === 'verified';
  return (
    <div
      style={{
        ...styles.marginEntry,
        cursor: 'default',
        ...(isActive ? styles.marginEntryActive : null),
      }}>
      <button
        type="button"
        onClick={() => onSelect(citation.id)}
        aria-label={\`Jump to citation \${citation.label}\`}
        style={{
          all: 'unset',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minWidth: 0,
        }}>
        <span style={{color: verified ? GOOD_INK : CAUTION_INK, display: 'inline-flex', flexShrink: 0}}>
          <Icon
            icon={verified ? CheckIcon : CircleDashedIcon}
            size="xsm"
            color="inherit"
          />
        </span>
        <span style={{...styles.marginEntryCite, fontStyle: 'italic'}}>
          {citation.label}
        </span>
      </button>
      {verified ? (
        <div style={styles.marginProvenance}>
          <Avatar name={record.checker ?? ''} size="xsmall" />
          <span style={{whiteSpace: 'nowrap'}}>
            Verified · {record.checker} · {record.checkedOn}
          </span>
        </div>
      ) : (
        <div style={styles.marginProvenance}>
          <span style={{color: CAUTION_INK, flex: '1 1 auto', minWidth: 0}}>
            Not yet checked against source
          </span>
          <Button
            label="Verify"
            size="sm"
            variant="secondary"
            onClick={() => onVerify(citation.id)}
          />
        </div>
      )}
    </div>
  );
}

/** Reviewer note beside the flagged Discussion III block. */
function ReviewerNoteBlock() {
  return (
    <div style={styles.reviewerNote}>
      <span style={styles.reviewerNoteTitle}>
        <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
        {REVIEWER_NOTE.title}
      </span>
      <Text type="supporting">
        <span style={styles.reviewerNoteBody}>{REVIEWER_NOTE.body}</span>
      </Text>
      <div style={styles.marginProvenance}>
        <Avatar name={REVIEWER_NOTE.author} size="xsmall" />
        <span style={{whiteSpace: 'nowrap'}}>
          {REVIEWER_NOTE.author} · {REVIEWER_NOTE.when}
        </span>
      </div>
    </div>
  );
}

/** One authority row in the Sources panel (styled row, not a Card). */
function SourceRow({
  authority,
  citedCount,
  pins,
  isActive,
  onSelect,
}: {
  authority: Authority;
  citedCount: number;
  pins: string[];
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(authority.id)}
      aria-label={\`Source: \${authority.caseName}, cited \${citedCount} times\`}
      style={{
        ...styles.sourceRow,
        ...(isActive ? styles.sourceRowActive : null),
      }}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <TreatmentBadge treatment={authority.treatment} />
        <StackItem size="fill" />
        <Token
          label={\`Cited \${citedCount}×\`}
          size="sm"
          color={authority.treatment === 'good' ? 'green' : 'orange'}
          style={{flexShrink: 0}}
        />
      </HStack>
      <span style={styles.sourceCaseName}>{authority.caseName}</span>
      <span style={styles.sourceCite}>{authority.reporter}</span>
      <span style={styles.sourceNote}>{authority.summary}</span>
      <HStack gap={1} wrap="wrap">
        {pins.map(pin => (
          <span key={pin} style={styles.pinChip}>
            {pin}
          </span>
        ))}
      </HStack>
      <span style={styles.sourceNote}>{authority.treatmentNote}</span>
    </button>
  );
}

// Block id -> citation ids, in prose order (static derivation).
const BLOCK_CITATION_IDS = new Map<string, string[]>(
  MEMO_BLOCKS.map(block => [
    block.id,
    block.paragraphs.flatMap(paragraph =>
      paragraph.segs.flatMap(seg => (seg.t === 'cite' ? [seg.id] : [])),
    ),
  ]),
);

// Authority id -> unique pin chips, in citation order (static derivation).
const AUTHORITY_PINS = new Map<string, string[]>(
  AUTHORITIES.map(authority => [
    authority.id,
    [...new Set(
      CITATIONS.filter(c => c.authorityId === authority.id).map(c => c.pin),
    )],
  ]),
);

// ============= PAGE =============

export default function LegalResearchMemoTemplate() {
  // <=1280px: Sources panel stacks under the memo; <=980px: the margin
  // rail collapses into per-block strips; <=640px: header condenses.
  const isPanelStacked = useMediaQuery('(max-width: 1280px)');
  const isMarginStacked = useMediaQuery('(max-width: 980px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  const [records, setRecords] = useState<Record<string, VerifyRecord>>(() =>
    Object.fromEntries(
      CITATIONS.map(c => [
        c.id,
        {state: c.initialState, checker: c.checker, checkedOn: c.checkedOn},
      ]),
    ),
  );
  const [activeCitationId, setActiveCitationId] = useState<string | null>(
    null,
  );
  const [activeAuthorityId, setActiveAuthorityId] = useState<string | null>(
    null,
  );
  const [blockedAction, setBlockedAction] = useState<string | null>(null);

  // Derived counts — the single source for meter, margin, and gate.
  const verifiedCount = CITATIONS.filter(
    c => records[c.id]?.state === 'verified',
  ).length;
  const unverifiedCount = CITATIONS.length - verifiedCount;
  const meterLabel = \`\${CITATIONS.length} citations · \${verifiedCount} verified · \${unverifiedCount} unverified\`;
  const gateNote =
    unverifiedCount > 0
      ? \`Unreviewed sections remain — \${unverifiedCount} citation\${
          unverifiedCount === 1 ? '' : 's'
        } not yet checked against source and one low-confidence section in Part III. Export and Share unlock when the memo reaches Reviewed.\`
      : 'Unreviewed sections remain — the low-confidence section in Part III awaits Priya Khanna’s sign-off. Export and Share unlock when the memo reaches Reviewed.';

  const selectCitation = (citationId: string) => {
    setActiveCitationId(citationId);
    const citation = CITATION_BY_ID.get(citationId);
    setActiveAuthorityId(citation ? citation.authorityId : null);
  };

  const selectAuthority = (authorityId: string) => {
    setActiveAuthorityId(authorityId);
    const first = CITATIONS.find(c => c.authorityId === authorityId);
    setActiveCitationId(first ? first.id : null);
  };

  const verifyCitation = (citationId: string) => {
    setRecords(prev => ({
      ...prev,
      [citationId]: {
        state: 'verified',
        checker: 'Priya Khanna',
        checkedOn: 'Jul 15',
      },
    }));
  };

  // ---- Paper renderers (static preview; interactivity = chips only) ----

  const renderParagraph = (paragraph: Paragraph) => (
    <p key={paragraph.id} style={styles.paragraph}>
      {paragraph.segs.map((seg, i) =>
        seg.t === 'text' ? (
          <span key={\`\${paragraph.id}-t\${i}\`}>{seg.s}</span>
        ) : (
          <CiteChip
            key={seg.id}
            citation={CITATION_BY_ID.get(seg.id) as CitationFixture}
            isActive={activeCitationId === seg.id}
            onSelect={selectCitation}
          />
        ),
      )}
    </p>
  );

  const memoHeadPaper = (
    <div>
      <p style={styles.memoKicker}>Marlow &amp; Voss LLP</p>
      <h1 style={styles.memoTitle}>Memorandum</h1>
      <p style={styles.memoPrivLine}>
        Attorney-Client Privileged · Attorney Work Product — prepared in
        anticipation of the Series C closing.
      </p>
      <div style={styles.memoHeadTable}>
        <span style={styles.memoHeadKey}>To</span>
        <span>Julian Voss (Partner, Commercial &amp; Technology)</span>
        <span style={styles.memoHeadKey}>From</span>
        <span>Casewright AI · reviewed by Priya Khanna</span>
        <span style={styles.memoHeadKey}>Date</span>
        <span>July 15, 2026</span>
        <span style={styles.memoHeadKey}>Matter</span>
        <span>M-2417 · Kestrel Labs — Series C Financing</span>
        <span style={styles.memoHeadKey}>Re</span>
        <span>
          Junior preferred class vote — lapse of Article IV.C(6) protective
          provisions
        </span>
      </div>
      <hr style={styles.memoRule} />
    </div>
  );

  const memoHeadMargin = (
    <div style={styles.marginCellStacked}>
      <div style={{...styles.marginEntry, cursor: 'default'}}>
        <span style={styles.sparkleChip}>
          <Icon icon={SparklesIcon} size="xsm" color="inherit" />
          AI-generated · verify before relying
        </span>
        <span style={{fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5}}>
          Drafted by Casewright Jul 14, 11:08 PM from the firm research
          library. Cite-check pass completed Jul 15.
        </span>
      </div>
    </div>
  );

  const renderBlockPaper = (block: MemoBlock) => (
    <div key={\`\${block.id}-paper\`}>
      {block.heading ? (
        <h2 style={styles.sectionHeading}>{block.heading}</h2>
      ) : null}
      {block.subHeading ? (
        <h3 style={styles.subHeading}>{block.subHeading}</h3>
      ) : null}
      {block.flagged ? (
        <div style={styles.flagWash}>
          <span style={styles.flagWashLabel}>
            <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
            Low confidence — thin authority
          </span>
          {block.paragraphs.map(renderParagraph)}
        </div>
      ) : (
        block.paragraphs.map(renderParagraph)
      )}
    </div>
  );

  const renderBlockMargin = (block: MemoBlock) => {
    const citationIds = BLOCK_CITATION_IDS.get(block.id) ?? [];
    return (
      <VStack gap={2}>
        {citationIds.length > 0 ? (
          <div style={styles.marginGroupLabel}>
            {block.subHeading
              ? \`Part \${block.subHeading.split('.')[0]}\`
              : (block.heading ?? block.id)}{' '}
            · {citationIds.length}{' '}
            {citationIds.length === 1 ? 'citation' : 'citations'}
          </div>
        ) : null}
        {citationIds.map(citationId => {
          const citation = CITATION_BY_ID.get(citationId);
          const record = records[citationId];
          return citation && record ? (
            <MarginEntry
              key={citationId}
              citation={citation}
              record={record}
              isActive={activeCitationId === citationId}
              onSelect={selectCitation}
              onVerify={verifyCitation}
            />
          ) : null;
        })}
        {block.marginNote ? (
          <Text type="supporting" color="secondary">
            {block.marginNote}
          </Text>
        ) : null}
        {block.flagged ? <ReviewerNoteBlock /> : null}
      </VStack>
    );
  };

  const disclosureFootPaper = (
    <div style={styles.paperDisclosure}>
      <span style={{color: AI_PURPLE, display: 'inline-flex', flexShrink: 0, marginTop: 2}}>
        <Icon icon={SparklesIcon} size="xsm" color="inherit" />
      </span>
      <span>
        AI-generated · verify before relying. Casewright drafted this memo
        from the sources in the panel; every citation above carries its
        verification state in the margin. Nothing here is legal advice until
        a reviewing attorney signs off.
      </span>
    </div>
  );

  const disclosureFootMargin = (
    <div style={{...styles.marginEntry, cursor: 'default'}}>
      <span style={{fontSize: 12, fontWeight: 600}}>Cite-check status</span>
      <span style={{fontSize: 12, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'}}>
        {meterLabel}
      </span>
      <span style={{fontSize: 12, color: CAUTION_INK}}>
        1 low-confidence section (Part III)
      </span>
    </div>
  );

  // ---- Composition: paper column + margin rail ----

  type BlockPair = {id: string; paper: ReactNode; margin: ReactNode};

  const blockPairs: BlockPair[] = [
    {id: 'head', paper: memoHeadPaper, margin: memoHeadMargin},
    ...MEMO_BLOCKS.map(block => ({
      id: block.id,
      paper: renderBlockPaper(block),
      margin: renderBlockMargin(block),
    })),
    {id: 'foot', paper: disclosureFootPaper, margin: disclosureFootMargin},
  ];

  const lastIndex = blockPairs.length - 1;

  const memoComposition = isMarginStacked ? (
    <div style={styles.memoGridStacked}>
      {blockPairs.map(pair => (
        <div key={pair.id} style={{marginBottom: 'var(--spacing-3)'}}>
          <div style={{...styles.paperCell, ...styles.paperSlab}}>
            {pair.paper}
          </div>
          <div style={styles.marginCellStacked}>{pair.margin}</div>
        </div>
      ))}
    </div>
  ) : (
    <div style={styles.memoGrid}>
      {blockPairs.map((pair, i) => (
        <Fragment key={pair.id}>
          <div
            style={{
              ...styles.paperCell,
              ...(i === 0 ? styles.paperCellFirst : null),
              ...(i === lastIndex ? styles.paperCellLast : null),
            }}>
            {pair.paper}
          </div>
          <div style={styles.marginCell}>{pair.margin}</div>
        </Fragment>
      ))}
    </div>
  );

  // ---- Sources panel ----

  const sourcesPanel = (
    <div style={isPanelStacked ? undefined : styles.sourcesFrame}>
      <div style={styles.sourcesHeader}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Heading level={2}>Sources</Heading>
          <Token
            label={\`\${AUTHORITIES.length} authorities\`}
            size="sm"
            style={{flexShrink: 0}}
          />
        </HStack>
        <Text type="supporting" color="secondary">
          Casewright research library · treatment current as of Jul 15
        </Text>
      </div>
      <div style={isPanelStacked ? styles.sourcesStacked : styles.sourcesScroll}>
        {AUTHORITIES.map(authority => (
          <SourceRow
            key={authority.id}
            authority={authority}
            citedCount={
              CITATIONS.filter(c => c.authorityId === authority.id).length
            }
            pins={AUTHORITY_PINS.get(authority.id) ?? []}
            isActive={activeAuthorityId === authority.id}
            onSelect={selectAuthority}
          />
        ))}
      </div>
    </div>
  );

  // ---- Header: title, disclosure, stepper, meter, gated actions ----

  const gatedActions = (
    <HStack gap={2} vAlign="center">
      <Tooltip content={gateNote} placement="below" alignment="end">
        <Button
          label="Export PDF"
          size="sm"
          variant="secondary"
          icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
          onClick={() => setBlockedAction('Export')}
        />
      </Tooltip>
      <Tooltip content={gateNote} placement="below" alignment="end">
        <Button
          label="Share"
          size="sm"
          variant="secondary"
          icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}
          onClick={() => setBlockedAction('Share')}
        />
      </Tooltip>
    </HStack>
  );

  const header = (
    <LayoutHeader hasDivider>
      <VStack gap={2}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <HStack gap={2} vAlign="center" wrap="wrap" style={{minWidth: 0}}>
            <Icon icon={ScaleIcon} size="md" color="secondary" />
            <Heading level={1}>Research Memo</Heading>
            <Token
              label="M-2417 · Kestrel Labs — Series C Financing"
              size="sm"
              style={{flexShrink: 0}}
            />
            {!isPhone ? (
              <span style={styles.sparkleChip}>
                <Icon icon={SparklesIcon} size="xsm" color="inherit" />
                AI-generated · verify before relying
              </span>
            ) : null}
          </HStack>
          <StackItem size="fill" />
          {!isPhone ? (
            <Text
              type="supporting"
              color="secondary"
              hasTabularNumbers
              style={styles.meterRow}>
              {meterLabel}
            </Text>
          ) : null}
          <ReviewStepper showDates={!isPhone} />
          {gatedActions}
        </HStack>
        {blockedAction !== null ? (
          <div style={styles.blockedNote} role="status">
            <Icon icon={LockIcon} size="xsm" color="inherit" />
            <span style={{flex: '1 1 auto', minWidth: 0}}>
              {blockedAction} blocked — {gateNote}
            </span>
            <IconButton
              label="Dismiss"
              size="sm"
              variant="ghost"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              onClick={() => setBlockedAction(null)}
            />
          </div>
        ) : null}
      </VStack>
    </LayoutHeader>
  );

  // ---- Frame ----

  return (
    <div style={styles.root}>
      <div style={styles.privilegeStrip}>
        <Icon icon={ShieldIcon} size="xsm" color="inherit" />
        <span>
          Attorney-Client Privileged · Attorney Work Product — do not forward
        </span>
      </div>
      <div style={styles.layoutSlot}>
        <Layout
          height="fill"
          header={header}
          end={
            !isPanelStacked ? (
              <LayoutPanel width={320} padding={0} label="Sources">
                {sourcesPanel}
              </LayoutPanel>
            ) : undefined
          }
          content={
            <LayoutContent padding={0}>
              {isPanelStacked ? (
                // Single scrolling column: memo, then stacked sources.
                <div style={styles.backdrop}>
                  <div style={styles.composition}>
                    {memoComposition}
                    <Divider />
                    {sourcesPanel}
                  </div>
                </div>
              ) : (
                <div style={styles.fill}>
                  <div style={styles.backdrop}>
                    <div style={styles.composition}>{memoComposition}</div>
                  </div>
                </div>
              )}
            </LayoutContent>
          }
        />
      </div>
    </div>
  );
}
`;export{e as default};